/*
 * Rocks: boulder fields and scattered stones as instanced meshes.
 *
 * The terrain workers place the rocks for a chunk when they build it (see terrain/chunk.js);
 * this module keeps those lists while their chunks are alive and, whenever the set changes or
 * the camera has moved, refills a few instanced meshes with the rocks in range. Large rocks
 * also become colliders.
 *
 * Every rock is one of the shapes in the rock atlas (rock-shapes.js): a ball of triangles whose
 * vertices the shader pushes out to the shape's surface, lit pixel by pixel with the shape's own
 * normals. So the meshes here are densities of ball, not shapes: which one a rock is drawn with
 * depends only on how large it is on the screen, and it is the same rock in each. A rock rests on
 * the triangle of the terrain mesh that is drawn under it (chunk.js: meshPoint), not on the height
 * function, which the mesh only samples.
 */
import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { gnoise3, hashU, smoothstep } from '../core/math.js';
import { detailTextures } from '../render/noise3d.js';
import { GLSL_GROUND_GRADE } from '../render/terrain-material.js';
import { dirToFace, faceToDir } from '../planet/height.js';
import { R } from '../planet/constants.js';
import { LAVA_FIELDS } from '../planet/volcanoes.js';
import { ctx } from '../game/ctx.js';
import { ROCK_STRIDE, ROCK_ANGULAR, ROCK_ROUNDED, ROCK_SLAB, ROCK_COBBLE, meshPoint, planetGrid } from '../terrain/chunk.js';
import { rockAtlas } from './rock-shapes.js';

/** Colliders for large rocks near the player: { v: unit direction, r: metres }. */
export const rockColliders = [];

/** A ball of 20 n^2 triangles (each edge of an icosahedron cut in n). Its vertices are directions; the shader makes a
 *  rock of it. More of them look up than down: the underside of a rock is in the ground. */
function ballGeometry(n) {
  let g = new THREE.IcosahedronGeometry(1, n - 1);
  g.deleteAttribute('normal'); g.deleteAttribute('uv');
  g = mergeVertices(g, 1e-4);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i) + 0.2, z = p.getZ(i), l = 1 / Math.hypot(x, y, z);
    p.setXYZ(i, x * l, y * l, z * l);
  }
  g.setAttribute('normal', p.clone());
  return g;
}

/** GLSL: the rock's surface along a direction of the ball, read from the atlas (see rock-shapes.js: shapeUv). */
const GLSL_SHAPE_UV = /* glsl */`
  vec2 rockUv(vec3 d) { return 0.5 + d.xz * (0.35355339 / sqrt(max(1.0 + d.y, 0.02))); }`;
const vertexHead = (rmax) => /* glsl */`
  attribute vec4 aRock;                        // atlas layer, height of the ground in the rock's frame (m), seed, tone
  uniform highp sampler2DArray uShapes;
  ${GLSL_SHAPE_UV}
  vec3 rockSurface(vec3 p) {
    vec3 d = normalize(p);
    return d * (textureLod(uShapes, vec3(rockUv(d), aRock.x), 0.0).a * ${rmax.toFixed(4)});
  }`;

/**
 * The rocks' material. A rock is the colour of the ground it lies on: darker and greyer where
 * the stone is bare, the ground's own dust where it has settled (on what faces the sky, in the
 * hollows, banked against the foot), with grain from the detail texture.
 * `uniforms.uHere` is the direction from the planet's centre to the camera.
 * `detail`: 0 for pebbles and for rocks a few pixels across (their shape and one grain are all that
 * can be seen of them, so that is all that is looked up), 1 for rocks on the cheapest preset, 2 for the rest.
 */
function rockMaterial(uniforms, rmax, detail) {
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92, metalness: 0 });
  mat.defines.ROCK_DETAIL = detail;
  mat.userData.uniforms = uniforms;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>
        ${vertexHead(rmax)}
        // how much of the ground in a direction is a volcano's lava field (as groundLava in render/terrain-material.js)
        const vec4 ROCK_LAVA[${LAVA_FIELDS.length}] = vec4[${LAVA_FIELDS.length}](${LAVA_FIELDS.map((v) => `vec4(${v.x.toFixed(6)}, ${v.y.toFixed(6)}, ${v.z.toFixed(6)}, ${(1 / (1 - v.cos)).toFixed(4)})`).join(', ')});
        varying vec3 vRockPos;
        varying vec3 vRockS;
        varying vec4 vRockI;
        varying vec4 vRockLies;
        varying mat3 vRockRot;`)
      .replace('#include <begin_vertex>', `
        vec3 transformed = rockSurface(position);
        #ifdef USE_INSTANCING
          mat4 rockT = modelMatrix * instanceMatrix;
        #else
          mat4 rockT = modelMatrix;
        #endif
        mat3 rockM = mat3(rockT);
        vec3 rockS = vec3(length(rockM[0]), length(rockM[1]), length(rockM[2]));
        vRockPos = transformed * rockS;                         // the rock's own frame, in metres: the grain stays put
        vRockS = rockS;
        vRockI = aRock;
        vRockRot = mat3(viewMatrix) * mat3(rockM[0] / rockS.x, rockM[1] / rockS.y, rockM[2] / rockS.z);
        // where on the planet it lies (the same for every vertex of a rock), and how much of that ground is lava
        vec3 rockDir = normalize(rockT[3].xyz);
        float rockLava = 0.0;
        for (int i = 0; i < ${LAVA_FIELDS.length}; i++) rockLava = max(rockLava, 1.0 - (1.0 - dot(rockDir, ROCK_LAVA[i].xyz)) * ROCK_LAVA[i].w);
        vRockLies = vec4(rockDir, smoothstep(0.0, 0.36, rockLava));`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform highp sampler3D uGrain;
        uniform highp sampler2DArray uShapes;
        uniform samplerCube uAlbedo;
        uniform vec3 uHere;
        varying vec3 vRockPos;
        varying vec3 vRockS;
        varying vec4 vRockI;
        varying vec4 vRockLies;
        varying mat3 vRockRot;
        ${GLSL_SHAPE_UV}
        ${GLSL_GROUND_GRADE}`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec2 rockAt = rockUv(normalize(vRockPos / vRockS));
        vec4 rockA = texture(uShapes, vec3(rockAt, vRockI.x));              // normal, radius
        vec3 rockSeed = vRockPos + vRockI.z * 31.0;
        vec4 rgm = texture(uGrain, rockSeed * 1.7 + 0.19);
        #if ROCK_DETAIL == 0
          vec4 rockB = vec4(0.5, 0.5, 0.0, 0.0), rg1 = vec4(0.5), rg2 = vec4(0.5);
          float rockStain = 0.5;
        #else
          vec4 rockB = texture(uShapes, vec3(rockAt, vRockI.x + 1.0));      // proud or hollow, tone of the face, fresh break
          vec4 rg1 = texture(uGrain, rockSeed * 0.55 + 0.37);
          vec4 rg2 = texture(uGrain, rockSeed * 4.1);
          #if ROCK_DETAIL == 2
            float rockStain = texture(uGrain, rockSeed * 0.13 + 0.61).a;    // stains a hand or an arm across
          #else
            float rockStain = rg1.a;
          #endif
        #endif
        float rockPits = smoothstep(0.60, 0.74, rg2.a);                    // the little holes gas left in the lava
        // the normal: the shape's own (a stretched rock's normals lean the other way), then the grain
        vec3 rockN = normalize((rockA.xyz * 2.0 - 1.0) / vRockS);
        vec3 rockG = (rg1.rgb - 0.5) * 1.2 + (rgm.rgb - 0.5) * 1.5 + (rg2.rgb - 0.5) * (1.0 + 1.4 * rockPits);
        rockN = normalize(rockN - (rockG - rockN * dot(rockG, rockN)));
        vec3 rockUp = normalize((mat3(viewMatrix) * uHere) * vRockRot);    // the sky, in the rock's frame
        float rockSky = dot(rockN, rockUp);
        float rockHollow = rockB.r - 0.5;
        float rockHigh = (vRockPos.y - vRockI.y) / vRockS.y;                // above the ground, in rock radii

        // the ground it lies on, from the colour map, as the ground's own shader reads it
        vec3 rawGround = textureCube(uAlbedo, vRockLies.xyz).rgb;
        float rawLum = dot(rawGround, vec3(0.3, 0.55, 0.15)), lava = vRockLies.a;
        float icy = groundIce(rawGround, uHere);
        vec3 ground = mix(groundGrade(rawGround), vec3(0.56, 0.62, 0.70), icy);
        // (on a lava field the ground itself is mostly bare basalt, and what dust there is lies thin and dark)
        ground = mix(ground, ground * vec3(0.62, 0.60, 0.65), lava * 0.6);
        float gl = dot(ground, vec3(0.3, 0.55, 0.15));
        // Bare stone is dark basalt (grey, warmed by what the sky and the ground throw on it) under a film of the local
        // dust: the thinner the film, the darker and greyer the rock. Each face has its own, a fresh break has least, and it comes and goes in stains.
        float film = mix(0.26, 0.64, vRockI.w) * (1.0 + (rockB.g - 0.5) * 0.5) * (1.0 - 0.3 * lava) - rockB.b * 0.1 + (rockStain - 0.5) * 0.2;
        vec3 stone = mix(mix(vec3(gl), ground, 0.3) * 0.7, ground * 0.96, clamp(film, 0.1, 0.9));
        stone = mix(stone, vec3(0.20, 0.19, 0.20), icy * 0.8) * (1.0 - 0.3 * rockPits);
        // Dust lies thick on whatever faces the sky and gathers in the hollows; edges and fresh breaks are swept clean.
        // Where the land is bright the dust is deep and the rocks wear more of it; on dark sand the wind keeps them barer.
        float dusty = mix(-0.06, 0.16, smoothstep(0.10, 0.30, rawLum)) - lava * 0.16 + (fract(vRockI.z * 13.7) - 0.5) * 0.3;
        float dust = smoothstep(0.16, 0.64, rockSky * 0.9 + 0.1 - rockHollow * 1.5 - rockB.b * 0.15 + (rg1.a - 0.5) * 0.3 + (rgm.a - 0.5) * 0.22 + (rg2.a - 0.5) * 0.12 + dusty);
        // and it is banked against the foot of the rock, so that rock and ground meet without a line
        float skirt = 1.0 - smoothstep(0.0, 0.03 + 0.1 * fract(vRockI.z * 7.9), rockHigh + (rg1.a - 0.5) * 0.08);
        dust = max(dust, skirt * 0.8);
        vec3 rockCol = mix(stone, ground, dust) * (1.0 + (rg1.a - 0.5) * 0.3 + (rgm.a - 0.5) * 0.3 + (rg2.a - 0.5) * 0.3);
        // creases are shaded by what stands round them, and the foot of the rock by the ground
        float rockAo = mix(0.6, 1.0, smoothstep(0.12, 0.46, rockB.r)) * mix(0.66, 1.0, smoothstep(-0.02, 0.14, rockHigh));
        diffuseColor.rgb = rockCol * rockAo;`)
      // stone scatters light; it has no sheen at grazing angles (as the ground has none)
      .replace('#include <lights_physical_fragment>', `#include <lights_physical_fragment>
        material.specularColor *= 0.25; material.specularColorBlended *= 0.25; material.specularF90 *= 0.25;`)
      .replace('#include <normal_fragment_begin>', `#include <normal_fragment_begin>
        normal = normalize(vRockRot * rockN);`);
  };
  mat.customProgramCacheKey = () => 'rock13-' + detail;
  return mat;
}
/** The rocks in the shadow maps: the shadow pass must push the vertices out the same way. */
function rockDepthMaterial(uniforms, rmax) {
  const depth = new THREE.MeshDepthMaterial();
  depth.onBeforeCompile = (shader) => {
    shader.uniforms.uShapes = uniforms.uShapes;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>
        ${vertexHead(rmax)}`)
      .replace('#include <begin_vertex>', 'vec3 transformed = rockSurface(position);');
  };
  depth.customProgramCacheKey = () => 'rock7-depth';
  return depth;
}

/**
 * How much of the ground in a direction is polar ice, 0..1, as the ground's shader decides it
 * (groundIce in render/terrain-material.js): bright and nearly colourless in the orbital map, near a
 * pole. Read from the colour map's two polar faces, which are only unpacked if somebody goes there.
 */
function iceSampler(albedoCube) {
  const masks = [null, null];
  const lin = new Float32Array(256);
  for (let i = 0; i < 256; i++) { const c = i / 255; lin[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  const unpack = (i) => {
    const canvas = albedoCube.image[2 + i], n = canvas.width;
    let px;
    try { px = canvas.getContext('2d').getImageData(0, 0, n, n).data; } catch { return { n: 1, m: new Uint8Array(1) }; }
    const m = new Uint8Array(n * n);
    for (let k = 0; k < n * n; k++) {
      const r = lin[px[k * 4]], g = lin[px[k * 4 + 1]], b = lin[px[k * 4 + 2]];
      m[k] = 255 * smoothstep(0.19, 0.30, 0.3 * r + 0.55 * g + 0.15 * b) * smoothstep(0.50, 0.78, Math.min(g, b) / Math.max(r, 0.001));
    }
    return { n, m };
  };
  return (x, y, z) => {
    const ay = Math.abs(y), polar = smoothstep(0.88, 0.95, ay);
    if (polar <= 0) return 0;
    const i = y > 0 ? 0 : 1, mk = masks[i] || (masks[i] = unpack(i)), n = mk.n;
    // (the cube map's +Y face runs x across and z down; its -Y face x across and -z down)
    const fx = Math.min(n - 1.001, Math.max(0, (x / ay + 1) * 0.5 * n - 0.5)), fy = Math.min(n - 1.001, Math.max(0, ((y > 0 ? z : -z) / ay + 1) * 0.5 * n - 0.5));
    const ix = Math.floor(fx), iy = Math.floor(fy), u = fx - ix, v = fy - iy, k = iy * n + ix;
    if (n < 2) return 0;
    return ((mk.m[k] * (1 - u) + mk.m[k + 1] * u) * (1 - v) + (mk.m[k + n] * (1 - u) + mk.m[k + n + 1] * u) * v) / 255 * polar;
  };
}
/** Ground counts as ice, and carries no stones, from this much of it up. */
const ICE_BARE = 0.2;

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _s = new THREE.Vector3(), _p = new THREE.Vector3();
const _up = new THREE.Vector3(), _y = new THREE.Vector3(0, 1, 0), _ax = new THREE.Vector3();
const fr = (x) => x - Math.floor(x);

/**
 * One instanced mesh of balls at one density. Rocks that cast a shadow are kept at the front of
 * its list, and only those are drawn into the shadow maps.
 */
class RockLod {
  constructor(parent, material, depth, cuts, cap, cast) {
    const geo = ballGeometry(cuts);
    this.cap = cap;
    this.attr = new THREE.InstancedBufferAttribute(new Float32Array(cap * 4), 4);
    this.attr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('aRock', this.attr);
    const m = this.mesh = new THREE.InstancedMesh(geo, material, cap);
    m.customDepthMaterial = depth;
    m.castShadow = cast; m.receiveShadow = true; m.frustumCulled = false; m.count = 0;
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.onBeforeShadow = () => { m.count = this.casters; };
    m.onAfterShadow = () => { m.count = this.n; };
    this.n = 0; this.casters = 0;
    this.triangles = geo.index.count / 3;
    parent.add(m);
  }

  begin() { this.n = 0; this.casters = 0; }
  get full() { return this.n >= this.cap; }

  /** Add the rock whose matrix is in _m. */
  add(layer, ground, seed, tone, casts) {
    const M = this.mesh.instanceMatrix.array, A = this.attr.array;
    let i = this.n++;
    if (casts) {
      // keep the casters together at the front: the first rock that casts none moves to the end
      const c = this.casters++;
      if (c !== i) { M.copyWithin(i * 16, c * 16, c * 16 + 16); A.copyWithin(i * 4, c * 4, c * 4 + 4); i = c; }
    }
    _m.toArray(M, i * 16);
    A[i * 4] = layer; A[i * 4 + 1] = ground; A[i * 4 + 2] = seed; A[i * 4 + 3] = tone;
  }

  /** Add a rock from a chunk's prepared list (see RockField._prepare): 16 numbers at I[j], the chunk standing at
   *  (dx, dy, dz) from this mesh. */
  put(I, j, dx, dy, dz, casts) {
    const M = this.mesh.instanceMatrix.array, A = this.attr.array;
    let i = this.n++;
    if (casts) {
      const c = this.casters++;
      if (c !== i) { M.copyWithin(i * 16, c * 16, c * 16 + 16); A.copyWithin(i * 4, c * 4, c * 4 + 4); i = c; }
    }
    const m = i * 16, a = i * 4;
    M[m] = I[j]; M[m + 1] = I[j + 1]; M[m + 2] = I[j + 2]; M[m + 3] = 0;
    M[m + 4] = I[j + 3]; M[m + 5] = I[j + 4]; M[m + 6] = I[j + 5]; M[m + 7] = 0;
    M[m + 8] = I[j + 6]; M[m + 9] = I[j + 7]; M[m + 10] = I[j + 8]; M[m + 11] = 0;
    M[m + 12] = I[j + 9] + dx; M[m + 13] = I[j + 10] + dy; M[m + 14] = I[j + 11] + dz; M[m + 15] = 1;
    A[a] = I[j + 12]; A[a + 1] = I[j + 13]; A[a + 2] = I[j + 14]; A[a + 3] = I[j + 15];
  }

  end() {
    const m = this.mesh;
    m.count = this.n;
    m.instanceMatrix.needsUpdate = true; this.attr.needsUpdate = true;
  }
}

/*
 * The shade under a rock. Rocks near the camera are drawn into the shadow maps; the rest, and all
 * of them on the cheapest preset, are not, and a rock with no shade under it looks pasted on the
 * picture. Each of those gets a soft dark pool on the ground instead: under it, and run out a
 * little on the side away from the sun. One draw call, two triangles a rock.
 */
class RockShade {
  constructor(parent, cap) {
    const geo = new THREE.InstancedBufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([-1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1], 3));
    geo.setIndex([0, 2, 1, 0, 3, 2]);
    this.cap = cap;
    this.spot = new THREE.InstancedBufferAttribute(new Float32Array(cap * 4), 4);     // where the rock meets the ground, its radius
    this.lie = new THREE.InstancedBufferAttribute(new Float32Array(cap * 4), 4);      // the ground's normal, the rock's height
    this.spot.setUsage(THREE.DynamicDrawUsage); this.lie.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('aSpot', this.spot); geo.setAttribute('aLie', this.lie);
    geo.instanceCount = 0;
    this.uniforms = { uSun: { value: new THREE.Vector3(0, 1, 0) }, uDark: { value: 0 }, fogDensity: { value: 0 } };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4,
      vertexShader: /* glsl */`
        attribute vec4 aSpot;
        attribute vec4 aLie;
        uniform vec3 uSun;
        varying vec2 vAt;
        varying float vLit;
        varying float vDepth;
        void main() {
          vec3 n = aLie.xyz;
          float high = dot(uSun, n);                            // the sun's height over this ground
          vec3 away = n * high - uSun;                          // along the ground, away from the sun
          float low = length(away);
          away = low > 1e-3 ? away / low : normalize(cross(n, vec3(0.31, 0.77, 0.55)));
          vec3 side = cross(n, away);
          // the pool lies under the rock and runs out on the far side, by no more than the mesh under it can be trusted flat
          float reach = min(aLie.w * low / max(high, 0.15), aSpot.w * 2.0);
          float r = aSpot.w * 1.15;
          vec3 at = aSpot.xyz + n * (0.02 + 0.012 * aSpot.w) + away * (reach * 0.5) + away * (position.z * (r + reach * 0.5)) + side * (position.x * r);
          vAt = position.xz;
          vLit = smoothstep(0.02, 0.22, high);                  // no sun, no shade
          vec4 mv = modelViewMatrix * vec4(at, 1.0);
          vDepth = -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */`
        uniform float uDark;
        uniform float fogDensity;
        varying vec2 vAt;
        varying float vLit;
        varying float vDepth;
        void main() {
          float a = (1.0 - smoothstep(0.3, 1.0, length(vAt))) * uDark * vLit * exp(-fogDensity * fogDensity * vDepth * vDepth);
          gl_FragColor = vec4(0.0, 0.0, 0.0, a);
        }`,
    });
    const m = this.mesh = new THREE.Mesh(geo, mat);
    m.frustumCulled = false; m.renderOrder = -1;
    parent.add(m);
    this.n = 0;
  }

  begin() { this.n = 0; }

  add(x, y, z, radius, nx, ny, nz, height) {
    if (this.n >= this.cap) return;
    const i = this.n++ * 4, A = this.spot.array, B = this.lie.array;
    A[i] = x; A[i + 1] = y; A[i + 2] = z; A[i + 3] = radius;
    B[i] = nx; B[i + 1] = ny; B[i + 2] = nz; B[i + 3] = height;
  }

  end() { this.mesh.geometry.instanceCount = this.n; this.spot.needsUpdate = true; this.lie.needsUpdate = true; }

  /** Follow the sun and the air: by night, or in a storm that hides the sun, nothing casts a shade. */
  light() {
    const e = ctx.engine;
    if (!e) return;
    this.uniforms.uSun.value.copy(e.sunDir);
    this.uniforms.uDark.value = 0.46 * smoothstep(0.15, 1.5, e.sun.intensity);
    this.uniforms.fogDensity.value = e.scene.fog ? e.scene.fog.density : 0;
    this.mesh.visible = this.n > 0 && this.uniforms.uDark.value > 0.01;
  }
}

export class RockField {
  /**
   * @param {THREE.Object3D} parent
   * @param {import('../terrain/terrain.js').Terrain} terrain
   * @param {{density?: number, shadowRange?: number, albedoCube: THREE.CubeTexture}} o
   */
  constructor(parent, terrain, o = {}) {
    this.terrain = terrain;
    this.density = o.density === undefined ? 1 : o.density;
    this.sets = new Map();                         // node -> { kind, data, origin } and, once wanted, what _prepare adds
    this.dirty = true;
    this.anchor = new THREE.Vector3();
    this.lastCam = new THREE.Vector3(1e9, 0, 0);
    this.shadowRange = o.shadowRange || 0;           // 0: rocks cast no shadows
    this.ice = iceSampler(o.albedoCube);
    // the shapes: their pictures are worked out a shape at a time, so that no frame waits on them; no rock is drawn until they are done
    const atlas = this.atlas = rockAtlas(this.density < 0.7 ? 96 : 128);
    const tex = new THREE.DataArrayTexture(atlas.data, atlas.size, atlas.size, atlas.layers);
    tex.format = THREE.RGBAFormat; tex.type = THREE.UnsignedByteType; tex.colorSpace = THREE.NoColorSpace;
    tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter; tex.generateMipmaps = true;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping; tex.unpackAlignment = 1;
    this.ready = false;
    this.counts = { big: 0, near: 0, small: 0, colliders: 0, lods: [0, 0, 0, 0], casters: [0, 0, 0, 0], shapes: 0, shaded: 0 };
    let next = 0;
    const step = () => {
      atlas.build(next++);
      if (next < atlas.count) { setTimeout(step, 0); return; }
      tex.needsUpdate = true; this.ready = true; this.dirty = true; this.gravel.at[0] = NaN;
    };
    setTimeout(step, 0);
    this.uniforms = { uGrain: { value: detailTextures().grain }, uAlbedo: { value: o.albedoCube }, uShapes: { value: tex }, uHere: { value: new THREE.Vector3(0, 1, 0) } };
    const mat = this.material = rockMaterial(this.uniforms, atlas.rmax, this.density < 0.7 ? 1 : 2);
    const lite = rockMaterial(this.uniforms, atlas.rmax, 0), depth = rockDepthMaterial(this.uniforms, atlas.rmax);
    // Four densities of ball: 20, 80, 320 and 1280 triangles. Which a rock gets depends on how large it is on the
    // screen (its radius over its distance), so a stone at his feet is as round as a boulder across the valley; the
    // cheaper presets change sooner.
    const d = this.density, k = 1 / Math.sqrt(d), cast = this.shadowRange > 0;
    this.lods = [
      { lod: new RockLod(parent, lite, depth, 1, Math.round(3400 * d) + 500, false), from: 0 },
      { lod: new RockLod(parent, mat, depth, 2, Math.round(800 * d) + 250, cast), from: 0.008 * k },
      { lod: new RockLod(parent, mat, depth, 4, Math.round(160 * d) + 30, cast), from: 0.03 * k },
      { lod: new RockLod(parent, mat, depth, 8, Math.round(20 * d) + 6, cast), from: 0.12 * k },
    ];
    // and a fifth for the boulder he is standing beside, whose outline would otherwise show its triangles (not on
    // the cheapest preset, which has no draw call to spare for it and a small screen)
    if (d >= 0.7) this.lods.push({ lod: new RockLod(parent, mat, depth, 16, 3, cast), from: 0.42 * k });
    this.shade = new RockShade(parent, Math.round(1100 * d) + 300);
    this.gravel = new GravelField(parent, terrain, lite, depth, this.atlas, this.ice, { reach: d < 0.7 ? 9 : 14, cap: Math.round(2600 * Math.min(1, d)) });
    terrain.onChunk = (node, c) => {
      if (!c.rocks || !c.rocks.length) return;
      this.sets.set(node, { kind: node.level === terrain.rockLevels.big ? 'big' : 'small', data: this._offIce(c.rocks, c.origin), origin: c.origin });
      this.dirty = true;
    };
    terrain.onDispose = (node) => { if (this.sets.delete(node)) this.dirty = true; };
  }

  /** A chunk's rocks without those that would lie on polar ice: the caps are bare. */
  _offIce(d, o) {
    if (Math.abs(o[1]) < 0.85 * R) return d;
    let k = 0;
    for (let i = 0; i < d.length; i += ROCK_STRIDE) {
      const x = o[0] + d[i], y = o[1] + d[i + 1], z = o[2] + d[i + 2], l = 1 / Math.hypot(x, y, z);
      if (this.ice(x * l, y * l, z * l) > ICE_BARE) continue;
      if (k !== i) d.copyWithin(k, i, i + ROCK_STRIDE);
      k += ROCK_STRIDE;
    }
    return k === d.length ? d : d.subarray(0, k);
  }

  /** Where the finest terrain mesh lies along a unit direction: [x, y, z, normal x, y, z]. What a rock there stands on
   *  (the tests check rocks against it). */
  groundPoint(x, y, z) {
    dirToFace(x, y, z, _fc);
    meshPoint(planetGrid(this.terrain.planet, _fc[0], this.terrain.G, this.terrain.maxLevel), _fc[1], _fc[2], _mp);
    return Array.from(_mp.subarray(0, 6));
  }

  /**
   * Everything about a chunk's rocks that does not depend on where the camera is, worked out once: which shape each
   * is, its proportions, how it lies and how deep it is sunk. Sixteen numbers a rock (its axes, where its centre is from
   * the chunk's origin, and what the shader wants: atlas layer, height of the ground in its own frame, seed, tone), four
   * more (its radius, how far it stands above the ground, its shape), and the colliders of those that stand in the way.
   */
  _prepare(set) {
    const d = set.data, o = set.origin, n = d.length / ROCK_STRIDE, big = set.kind === 'big';
    const inst = set.inst = new Float32Array(n * 16), aux = set.aux = new Float32Array(n * 4), e = _m.elements;
    const shapes = this.atlas.shapes, classes = this.atlas.classes;
    set.colliders = [];
    for (let i = 0, j = 0, a = 0; i < d.length; i += ROCK_STRIDE, j += 16, a += 4) {
      const size = d[i + 6], cls = Math.floor(d[i + 7]), rnd = d[i + 7] - cls;
      const list = classes[cls];
      const shape = list[Math.floor(fr(rnd * 61.7) * list.length)], sh = shapes[shape];
      // its own proportions, and how deep it is sunk: most sit on the surface, some are half buried (a boulder the
      // wind has rounded stands clear: buried to the shoulders it is a bun)
      const sy = size * (0.84 + fr(rnd * 13) * 0.32), bury = fr(rnd * 23);
      _s.set(size * (0.86 + fr(rnd * 7) * 0.28), sy, size * (0.86 + fr(rnd * 29) * 0.28));
      const ground = sh.ground * sy + d[i + 8] + sy * (0.02 + (cls === ROCK_ROUNDED ? 0.1 : 0.3) * bury * bury * bury) * (sh.top - sh.ground);
      _up.set(d[i + 3], d[i + 4], d[i + 5]);
      _q.setFromUnitVectors(_y, _up);
      _q2.setFromAxisAngle(_y, rnd * 6.283).premultiply(_q);
      _ax.set(Math.sin(rnd * 40), 0, Math.cos(rnd * 40));
      // (a plate that lies dead level is a pancake: plates are tipped, as the frost and the wind have left them)
      _q2.multiply(_q.setFromAxisAngle(_ax, (fr(rnd * 3.3) - 0.5) * (cls === ROCK_SLAB ? 0.5 : 0.22)));
      _m.compose(_p.set(d[i] - _up.x * ground, d[i + 1] - _up.y * ground, d[i + 2] - _up.z * ground), _q2, _s);
      inst[j] = e[0]; inst[j + 1] = e[1]; inst[j + 2] = e[2]; inst[j + 3] = e[4]; inst[j + 4] = e[5]; inst[j + 5] = e[6];
      inst[j + 6] = e[8]; inst[j + 7] = e[9]; inst[j + 8] = e[10]; inst[j + 9] = e[12]; inst[j + 10] = e[13]; inst[j + 11] = e[14];
      // the bare stone's tone, dark basalt to weathered brown: most wear a film of the local dust; the wind has swept
      // some bare, broken basalt more often than the rest
      const bare = fr(rnd * 11.3) < (cls === ROCK_ANGULAR ? 0.3 : cls === ROCK_SLAB ? 0.1 : 0.18);
      inst[j + 12] = shape * 2; inst[j + 13] = ground; inst[j + 14] = rnd; inst[j + 15] = bare ? 0.04 + 0.3 * fr(rnd * 3.7) : 0.4 + 0.6 * fr(rnd * 3.7);
      const radius = (_s.x + _s.z) * 0.5, stands = sh.top * sy - ground;
      aux[a] = radius; aux[a + 1] = stands; aux[a + 2] = shape;
      // whatever stands knee-high or more is in the way
      if (big && stands > 0.55) {
        const x = o[0] + d[i], y = o[1] + d[i + 1], z = o[2] + d[i + 2], l = 1 / Math.hypot(x, y, z);
        set.colliders.push({ v: new THREE.Vector3(x * l, y * l, z * l), r: radius * 0.88, x, y, z });
      }
    }
  }

  /** Call once a frame after terrain.update(). */
  update(camPos) {
    this.uniforms.uHere.value.copy(camPos).normalize();
    if (!this.ready) return;
    this.shade.light();
    this.gravel.update(camPos);
    // Which ball a rock is drawn with depends on how near it is, so the lists are refilled every few steps (it is cheap:
    // what is slow about a rock was worked out when its chunk arrived).
    if (!this.dirty && camPos.distanceToSquared(this.lastCam) < 3 * 3) return;
    this.dirty = false;
    this.lastCam.copy(camPos);
    // instance matrices are stored relative to an anchor near the camera, to stay float32-exact
    this.anchor.copy(camPos);
    const lods = this.lods, top = lods.length - 1, ax = camPos.x, ay = camPos.y, az = camPos.z;
    for (const l of lods) { l.lod.mesh.position.copy(this.anchor); l.lod.begin(); }
    const shade = this.shade;
    shade.mesh.position.copy(this.anchor); shade.begin();
    let nBig = 0, nSmall = 0, kinds = 0;                      // (kinds: one bit for each shape that is drawn)
    rockColliders.length = 0;
    const frame = this.terrain.frame, shadowRange = this.shadowRange;
    for (const [node, set] of this.sets) {
      if (node.used < frame - 2) continue;                    // its chunk is not part of the current view
      const big = set.kind === 'big';
      const range = big ? 520 : 85;
      const d = set.data, o = set.origin;
      // skip the whole chunk if it is out of range
      if (Math.hypot(o[0] - ax, o[1] - ay, o[2] - az) > range + node.size) continue;
      if (!set.inst) this._prepare(set);
      const inst = set.inst, aux = set.aux, ox = o[0] - ax, oy = o[1] - ay, oz = o[2] - az;
      let drawn = 0;
      for (let i = 0, j = 0, a = 0; i < d.length; i += ROCK_STRIDE, j += 16, a += 4) {
        const x = ox + d[i], y = oy + d[i + 1], z = oz + d[i + 2];
        const dist = Math.sqrt(x * x + y * y + z * z);
        if (dist > range) continue;
        const size = d[i + 6], seen = size / (dist > 0.5 ? dist : 0.5);          // how large it is on the screen
        if (seen < 0.0014) continue;                            // a speck
        // which ball: the densest it is large enough for that has room
        let li = top;
        while (li > 0 && (seen < lods[li].from || lods[li].lod.full)) li--;
        if (lods[li].lod.full) continue;
        const casts = li > 0 && shadowRange > 0 && dist < Math.min(shadowRange, 24 + 22 * size);
        lods[li].lod.put(inst, j, ox, oy, oz, casts);
        // (a rock that is not in the shadow maps still wants shade under it)
        if (!casts && seen > 0.0035) shade.add(x, y, z, aux[a], d[i + 3], d[i + 4], d[i + 5], aux[a + 1]);
        drawn++;
        kinds |= 1 << aux[a + 2];
      }
      if (big) {
        nBig += drawn;
        for (const c of set.colliders) if (Math.hypot(c.x - ax, c.y - ay, c.z - az) < 140) rockColliders.push(c);
      } else nSmall += drawn;
    }
    for (const l of lods) l.lod.end();
    shade.end();
    this.counts = { big: nBig, near: lods[3].lod.n + (lods[4] ? lods[4].lod.n : 0), small: nSmall, colliders: rockColliders.length, lods: lods.map((l) => l.lod.n), casters: lods.map((l) => l.lod.casters),
      shapes: kinds.toString(2).replace(/0/g, '').length, shaded: shade.n };
  }
}

/*
 * Gravel: loose pebbles on the ground around the camera, as geometry. Texture alone cannot give
 * the near ground stones that stand up and catch the light. The pebbles are placed by a hash
 * of a grid laid across the cube face, so each one is always in the same place; cells come and
 * go as the camera moves. They lie in patches, not evenly, and not on ice or on a steep face.
 */
const CELL = 1.6;                           // metres
const FACE_M = R * Math.PI / 4;
const _fc = [0, 0, 0], _fd = [0, 0, 0], _mp = new Float64Array(8);
class GravelField {
  constructor(parent, terrain, material, depth, atlas, ice, o = {}) {
    this.planet = terrain.planet;
    this.terrain = terrain;
    this.atlas = atlas;
    this.ice = ice;
    this.reach = o.reach || 14;
    this.cap = o.cap || 2600;
    this.cells = new Map();                  // key -> Float64Array of pebbles: x, y, z, normal xyz, size, rnd
    this.at = [NaN, NaN, NaN];
    this.lod = new RockLod(parent, material, depth, 1, this.cap, false);
  }

  _cell(face, ci, cj) {
    const h0 = hashU(ci, cj, face, 71);
    // patches: a slow field decides how stony this cell is
    faceToDir(face, (ci + 0.5) * CELL / FACE_M, (cj + 0.5) * CELL / FACE_M, _fd);
    if (this.ice(_fd[0], _fd[1], _fd[2]) > ICE_BARE) return new Float64Array(0);
    const patch = gnoise3(_fd[0] * R / 9 + 3.3, _fd[1] * R / 9, _fd[2] * R / 9 - 5.1) + 0.5 * gnoise3(_fd[0] * R / 31, _fd[1] * R / 31 + 9.2, _fd[2] * R / 31);
    const n = Math.max(0, Math.round((0.6 + patch * 3.2) * 4 + ((h0 & 255) / 255 - 0.5) * 3));
    const out = new Float64Array(n * 8);
    let seed = h0, k = 0;
    const rnd = () => { seed = (seed + 0x6d2b79f5) | 0; let x = Math.imul(seed ^ (seed >>> 15), 1 | seed); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
    const pads = this.planet.pads;
    // the pebbles lie on the mesh that is drawn here, as the rocks do (see meshPoint)
    const grid = planetGrid(this.planet, face, this.terrain.G, this.terrain.maxLevel);
    for (let i = 0; i < n; i++) {
      const s = (ci + rnd()) * CELL / FACE_M, t = (cj + rnd()) * CELL / FACE_M, u = rnd(), v = rnd();
      if (s <= -1 || s >= 1 || t <= -1 || t >= 1) continue;
      faceToDir(face, s, t, _fd);
      // keep the middle of a levelled site clear: that is where the buildings stand
      let clear = true;
      for (let p = 0; p < pads.length; p++) {
        const pd = pads[p], keep = pd.r >= 40 ? 13.5 : pd.r >= 12 ? 6 : Math.min(pd.r, 4.5);
        if (_fd[0] * pd.x + _fd[1] * pd.y + _fd[2] * pd.z > Math.cos(keep / R)) { clear = false; break; }
      }
      if (!clear) continue;
      meshPoint(grid, s, t, _mp);
      if (_mp[3] * _fd[0] + _mp[4] * _fd[1] + _mp[5] * _fd[2] < 0.88) continue;      // too steep for a pebble to stay
      out[k++] = _mp[0]; out[k++] = _mp[1]; out[k++] = _mp[2];
      out[k++] = _mp[3]; out[k++] = _mp[4]; out[k++] = _mp[5];
      out[k++] = 0.016 + 0.07 * u * u * u;                                       // 3 to 17 cm across, most of them small
      out[k++] = v;
    }
    return k === out.length ? out : out.subarray(0, k);
  }

  update(camPos) {
    const len = camPos.length(), lod = this.lod;
    if (len - R > 400) { if (lod.n) { lod.begin(); lod.end(); this.cells.clear(); this.at[0] = NaN; } return; }
    dirToFace(camPos.x / len, camPos.y / len, camPos.z / len, _fc);
    const face = _fc[0], ci0 = Math.floor(_fc[1] * FACE_M / CELL), cj0 = Math.floor(_fc[2] * FACE_M / CELL);
    if (face === this.at[0] && ci0 === this.at[1] && cj0 === this.at[2]) return;
    this.at[0] = face; this.at[1] = ci0; this.at[2] = cj0;
    const span = Math.ceil(this.reach / CELL), keep = new Set();
    for (let dj = -span; dj <= span; dj++) for (let di = -span; di <= span; di++) {
      if (di * di + dj * dj > span * span) continue;
      const key = face + ':' + (ci0 + di) + ':' + (cj0 + dj);
      keep.add(key);
      if (!this.cells.has(key)) this.cells.set(key, this._cell(face, ci0 + di, cj0 + dj));
    }
    for (const key of this.cells.keys()) if (!keep.has(key)) this.cells.delete(key);
    // instance positions are stored relative to a point near the camera, to stay float32-exact
    lod.mesh.position.copy(camPos);
    lod.begin();
    const shapes = this.atlas.shapes, list = this.atlas.classes[ROCK_COBBLE];
    for (const d of this.cells.values()) {
      for (let i = 0; i < d.length && !lod.full; i += 8) {
        const size = d[i + 6], rnd = d[i + 7];
        const shape = list[Math.floor(fr(rnd * 61.7) * list.length)], sh = shapes[shape];
        const sy = size * (0.8 + fr(rnd * 13) * 0.4), bury = fr(rnd * 23);
        _s.set(size * (0.85 + fr(rnd * 7) * 0.35), sy, size * (0.85 + fr(rnd * 29) * 0.35));
        const ground = sh.ground * sy + sy * (0.06 + 0.3 * bury * bury) * (sh.top - sh.ground);
        _up.set(d[i + 3], d[i + 4], d[i + 5]);
        _q.setFromUnitVectors(_y, _up);
        _q2.setFromAxisAngle(_y, rnd * 6.283).premultiply(_q);
        _ax.set(Math.sin(rnd * 40), 0, Math.cos(rnd * 40));
        _q2.multiply(_q.setFromAxisAngle(_ax, (fr(rnd * 3.3) - 0.5) * 0.5));
        _m.compose(_p.set(d[i] - camPos.x - _up.x * ground, d[i + 1] - camPos.y - _up.y * ground, d[i + 2] - camPos.z - _up.z * ground), _q2, _s);
        lod.add(shape * 2, ground, rnd, fr(rnd * 3.7) * 0.55, false);
      }
    }
    lod.end();
  }
}
