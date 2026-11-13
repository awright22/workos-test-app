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
 *
 * A rock is one of three things to a man on foot. A boulder stands in his way and has a collider.
 * A stone does not: it is small enough to tread on, it is seated so that it never stands higher
 * than his ankle, and where his boots come down it is trodden into the dust (the shader sinks it),
 * so no stone is ever seen through a boot, wherever he is put. And a rock of a boulder's width that
 * stands too low to block him is seated flush with the ground, a plate of bedrock he walks across.
 */
import * as THREE from 'three';
import { gnoise3, hashU, smoothstep } from '../core/math.js';
import { detailTextures } from '../render/noise3d.js';
import { GLSL_GROUND_GRADE } from '../render/terrain-material.js';
import { dirToFace, faceToDir } from '../planet/height.js';
import { R } from '../planet/constants.js';
import { ctx } from '../game/ctx.js';
import { S } from '../game/state.js';
import { player } from '../game/player.js';
import { ROCK_STRIDE, ROCK_ANGULAR, ROCK_SLAB, ROCK_COBBLE, bareLava, meshPoint, planetGrid } from '../terrain/chunk.js';
import { rockAtlas } from './rock-shapes.js';
import { ballMesh, ballSnap } from './rock-ball.js';

/** Colliders for large rocks near the player: { v: unit direction, r: metres }. */
export const rockColliders = [];
/** A rock that stands this high (metres) or more out of the ground is in the way; the rover's wheels and a man's
 *  boots go over anything lower. */
export const ROCK_SOLID = 0.4;
/** No stone that can be walked through stands higher than this: one that would is seated deeper. */
export const STONE_HIGH = 0.22;
/** A rock as wide as a boulder but too low to block anybody shows this much of itself: a plate flush with the ground. */
export const PLATE_HIGH = 0.07;

/** A ball of 20 n^2 triangles for a shape map `mapSize` texels across (see rock-ball.js). Each vertex also carries how
 *  far this ball may move it to bring it onto an arris of the rock. */
function ballGeometry(n, mapSize, reach) {
  const b = ballMesh(n), g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(b.positions, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(b.positions.slice(), 3));
  g.setAttribute('aSnap', new THREE.BufferAttribute(new Float32Array(b.positions.length / 3).fill(Math.min(reach, ballSnap(n, mapSize)) / mapSize), 1));
  g.setIndex(new THREE.BufferAttribute(b.index, 1));
  return g;
}

/** GLSL: where a direction of the ball lies in a layer of the atlas (see rock-shapes.js: shapeUv). */
const GLSL_SHAPE_UV = /* glsl */`
  vec2 rockUv(vec3 d) { return 0.5 + d.xz * (0.35355339 / sqrt(max(1.0 + d.y, 0.02))); }`;
/**
 * GLSL for a vertex shader that draws rocks: the rock's surface along a direction of the ball, the vertex first
 * moved onto the rock's nearest arris if one lies near enough for this ball (rock-shapes.js: snapDir); and how far a
 * stone is trodden in, 1 where the astronaut's boots are.
 */
const vertexHead = (atlas) => /* glsl */`
  attribute vec4 aRock;                        // atlas layer; height of the ground in the rock's frame (m); seed (below zero: it is never trodden in); tone, and in its whole part how much of the ground under it is bare lava
  attribute float aSnap;
  uniform highp sampler2DArray uShapes;
  uniform highp sampler2DArray uArris;
  uniform vec4 uFeet;                          // where he stands, from the rocks' anchor; w: 1 while he is on foot
  ${GLSL_SHAPE_UV}
  vec3 rockSurface(vec3 p) {
    vec3 d = normalize(p);
    vec2 uv = rockUv(d);
    vec2 off = (textureLod(uArris, vec3(uv, aRock.x * 0.5), 0.0).rg * 255.0 - 127.5) * ${(atlas.snapReach / 127 / atlas.size).toFixed(7)};
    if (dot(off, off) <= aSnap * aSnap) {
      vec2 a = (uv + off - 0.5) * 4.0;
      float q = dot(a, a);
      if (q > 3.999) { a *= sqrt(3.999 / q); q = 3.999; }
      float s = sqrt(1.0 - q * 0.25);
      d = vec3(a.x * s, 1.0 - q * 0.5, a.y * s);
    }
    return d * (textureLod(uShapes, vec3(rockUv(d), aRock.x), 0.0).a * ${atlas.rmax.toFixed(4)});
  }
  float rockTrodden(mat4 inst) {
    if (aRock.z < 0.0 || uFeet.w < 0.5) return 0.0;
    vec3 up = normalize(inst[1].xyz), v = inst[3].xyz - uFeet.xyz;
    v -= up * dot(v, up);
    float r = 0.5 * (length(inst[0].xyz) + length(inst[2].xyz));
    return 1.0 - smoothstep(r + 0.22, r + 0.50, length(v));
  }`;

/**
 * GLSL for a fragment shader: the colour of the ground a rock lies on, and of the dust there. `lies` is the
 * direction from the planet's centre to the rock, and how much of the ground under it is bare lava.
 * Declares rockDust (the dust of the region) and rockGround (what the ground's own shader draws there).
 */
const GLSL_ROCK_GROUND = /* glsl */`
  vec3 rockDust, rockGround;
  float rockRawLum, rockIcy;
  void rockLand(samplerCube albedo, vec4 lies, vec3 here) {
    vec3 raw = textureCube(albedo, lies.xyz).rgb;
    rockRawLum = dot(raw, vec3(0.3, 0.55, 0.15));
    rockIcy = groundIce(raw, here);
    rockDust = mix(groundGrade(raw), vec3(0.56, 0.62, 0.70), rockIcy);
    // the back of a lava flow, and the floor of a lava lake, are bare basalt: near charcoal, whatever dust colours the country
    rockGround = mix(rockDust, mix(rockDust * vec3(0.46, 0.43, 0.47), vec3(0.050, 0.043, 0.044), 0.86) * 0.9, lies.a * 0.9);
  }`;

/**
 * The rocks' material. Bare stone is basalt: darker and greyer than the dust of the country it lies in, each face
 * its own tone, a fresh break darkest. Dust lies on what faces the sky and in the hollows, and is banked against the
 * foot. So a rock is dark where the wind keeps it clean and the colour of its ground where it does not, and a lit
 * face of it is about as bright as the ground beside it, never brighter. On lava it is the flow's own dark rock.
 * `uniforms.uHere` is the direction from the planet's centre to the camera.
 * `detail`: 0 for pebbles and for rocks a few pixels across (their shape and one grain are all that
 * can be seen of them, so that is all that is looked up), 1 for rocks on the cheapest preset, 2 for the rest.
 */
function rockMaterial(uniforms, atlas, detail) {
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92, metalness: 0 });
  mat.defines.ROCK_DETAIL = detail;
  mat.userData.uniforms = uniforms;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>
        ${vertexHead(atlas)}
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
        vRockI = vec4(aRock.xy, abs(aRock.z), fract(aRock.w) * 1.0204);
        vRockRot = mat3(viewMatrix) * mat3(rockM[0] / rockS.x, rockM[1] / rockS.y, rockM[2] / rockS.z);
        // where on the planet it lies (the same for every vertex of a rock), and how much of that ground is bare lava
        vRockLies = vec4(normalize(rockT[3].xyz), floor(aRock.w) / 15.0);
        #ifdef USE_INSTANCING
          transformed.y -= rockTrodden(instanceMatrix) * 2.4;   // (a stone under his boot goes into the dust)
        #endif`);
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
        ${GLSL_GROUND_GRADE}
        ${GLSL_ROCK_GROUND}`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec2 rockAt = rockUv(normalize(vRockPos / vRockS));
        vec4 rockA = texture(uShapes, vec3(rockAt, vRockI.x));              // normal, radius
        vec3 rockSeed = vRockPos + vRockI.z * 31.0;
        vec4 rgm = texture(uGrain, rockSeed * 1.7 + 0.19);
        #if ROCK_DETAIL == 0
          vec4 rockB = vec4(0.5, 0.5, 0.0, 0.0), rg1 = vec4(0.5), rg2 = vec4(0.5);
          float rockStain = 0.5;
        #else
          vec4 rockB = texture(uShapes, vec3(rockAt, vRockI.x + 1.0));      // proud or hollow, tone of the face, fresh break, bedding
          vec4 rg1 = texture(uGrain, rockSeed * 0.55 + 0.37);
          vec4 rg2 = texture(uGrain, rockSeed * 4.1);
          #if ROCK_DETAIL == 2
            float rockStain = texture(uGrain, rockSeed * 0.13 + 0.61).a;    // stains a hand or an arm across
          #else
            float rockStain = rg1.a;
          #endif
        #endif
        float rockPits = smoothstep(0.60, 0.74, rg2.a);                    // the little holes gas left in the lava
        // the normal: the shape's own (a stretched rock's normals lean the other way), then the grain (little of the
        // broadest grain: a face that rolls is clay, not stone)
        vec3 rockN = normalize((rockA.xyz * 2.0 - 1.0) / vRockS);
        vec3 rockG = (rg1.rgb - 0.5) * 0.5 + (rgm.rgb - 0.5) * 1.4 + (rg2.rgb - 0.5) * (1.0 + 1.4 * rockPits);
        rockN = normalize(rockN - (rockG - rockN * dot(rockG, rockN)));
        vec3 rockUp = normalize((mat3(viewMatrix) * uHere) * vRockRot);    // the sky, in the rock's frame
        float rockSky = dot(rockN, rockUp);
        float rockHollow = rockB.r - 0.5;
        float rockHigh = (vRockPos.y - vRockI.y) / vRockS.y;                // above the ground, in rock radii
        float rockTone = vRockI.w, lava = vRockLies.a;

        rockLand(uAlbedo, vRockLies, uHere);
        float gl = dot(rockDust, vec3(0.3, 0.55, 0.15));
        // Bare stone under whatever rind and film of dust it wears: the thinner, the darker and greyer. Each face has
        // its own, each bed of a layered rock, a fresh break least; and it comes and goes in stains.
        float film = clamp(rockTone * (1.0 + (rockB.g - 0.5) * 0.7) + (rockB.g - 0.5) * 0.3 - rockB.b * 0.16 + (rockStain - 0.5) * 0.36, 0.0, 1.0);
        vec3 stone = mix(vec3(gl), rockDust, 0.46) * mix(0.40, 0.70, film);
        // (on a lava field it is the flow's own rock: clinker and blocks of it, a shade paler than the flow's back)
        stone = mix(stone, mix(rockDust * vec3(0.44, 0.41, 0.44), vec3(0.075, 0.062, 0.060), 0.72) * mix(0.95, 1.6, film), lava);
        stone = mix(stone, vec3(0.20, 0.19, 0.20), rockIcy * 0.8) * (1.0 - 0.3 * rockPits);
        // a layered rock shows its partings: thin dark lines along the beds (not where they would be finer than a pixel)
        float bedAt = vRockPos.y / vRockS.y * 31.0 + rg1.a * 2.2 + rgm.a * 0.8;
        stone *= 1.0 - 0.3 * rockB.a * smoothstep(0.66, 0.9, abs(fract(bedAt) * 2.0 - 1.0)) * (1.0 - smoothstep(0.3, 0.7, fwidth(bedAt)));
        // Dust lies thick on whatever faces the sky and gathers in the hollows; edges and fresh breaks are swept clean.
        // Where the land is bright the dust is deep and the rocks wear more of it; on dark sand the wind keeps them
        // barer, and on bare lava there is little to settle.
        float dusty = mix(-0.08, 0.08, smoothstep(0.10, 0.30, rockRawLum)) - lava * 0.22 + (rockTone - 0.45) * 0.3;
        float dust = smoothstep(0.36, 0.74, rockSky * 0.9 + 0.1 - rockHollow * 0.8 - rockB.b * 0.15 + (rg1.a - 0.5) * 0.32 + (rgm.a - 0.5) * 0.22 + (rg2.a - 0.5) * 0.12 + dusty);
        // and it is banked against the foot of the rock, in the colour of the ground there, so that rock and ground meet without a line
        float skirt = 1.0 - smoothstep(0.0, 0.05 + 0.1 * fract(vRockI.z * 7.9), rockHigh + (rg1.a - 0.5) * 0.08);
        vec3 rockLies = mix(mix(rockDust, rockGround, lava * 0.7), rockGround, skirt);
        dust = max(dust, skirt * 0.9);
        vec3 rockCol = mix(stone, rockLies, dust) * (1.0 + (rg1.a - 0.5) * 0.24 + (rgm.a - 0.5) * 0.3 + (rg2.a - 0.5) * 0.3);
        // creases are shaded by what stands round them, and the foot of the rock by the ground
        float rockAo = mix(0.55, 1.0, smoothstep(0.12, 0.46, rockB.r)) * mix(0.62, 1.0, smoothstep(-0.02, 0.2, rockHigh));
        diffuseColor.rgb = rockCol * rockAo;`)
      // stone scatters light; it has no sheen at grazing angles (as the ground has none)
      .replace('#include <lights_physical_fragment>', `#include <lights_physical_fragment>
        material.specularColor *= 0.25; material.specularColorBlended *= 0.25; material.specularF90 *= 0.25;`)
      .replace('#include <normal_fragment_begin>', `#include <normal_fragment_begin>
        normal = normalize(vRockRot * rockN);`);
  };
  mat.customProgramCacheKey = () => 'rock14-' + detail;
  return mat;
}
/** The rocks in the shadow maps: the shadow pass must push the vertices out the same way (and tread the same stones in). */
function rockDepthMaterial(uniforms, atlas) {
  const depth = new THREE.MeshDepthMaterial();
  depth.onBeforeCompile = (shader) => {
    shader.uniforms.uShapes = uniforms.uShapes; shader.uniforms.uArris = uniforms.uArris; shader.uniforms.uFeet = uniforms.uFeet;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>
        ${vertexHead(atlas)}`)
      .replace('#include <begin_vertex>', `vec3 transformed = rockSurface(position);
        #ifdef USE_INSTANCING
          transformed.y -= rockTrodden(instanceMatrix) * 2.4;
        #endif`);
  };
  depth.customProgramCacheKey = () => 'rock8-depth';
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
const _up = new THREE.Vector3(), _y = new THREE.Vector3(0, 1, 0), _ax = new THREE.Vector3(), _w = new THREE.Vector3();
const fr = (x) => x - Math.floor(x);
/** Numbers kept for each rock of a chunk once it has been prepared (see RockField._prepare). */
const INST = 16, AUX = 6;

/**
 * One instanced mesh of balls at one density. Rocks that cast a shadow are kept at the front of
 * its list, and only those are drawn into the shadow maps.
 */
class RockLod {
  constructor(parent, material, depth, cuts, cap, cast, atlas) {
    const geo = ballGeometry(cuts, atlas.size, atlas.snapReach);
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

/*
 * The drift round a rock. The wind drops its dust wherever a rock breaks it: a bank against the
 * foot all round, and a tail in the lee. Without it a rock meets the sand in a hard line and
 * reads as set down ON the ground; with it the rock stands IN the ground. Each rock near enough
 * for the difference to show gets a low mound of the ground's own colour: a ring of triangles
 * that starts inside the rock, a hand or two up its flank, follows the rock's own outline at the
 * ground (read from the shape atlas), and runs out and down to nothing, longest downwind. It is
 * lit and shadowed as the ground is, a little darker close under the rock, and fades out at its
 * edge so that it need not match the ground's ripples there. One draw call, sixty-four triangles a rock.
 */
const DRIFT_SEG = 16;
class RockDrift {
  constructor(parent, uniforms, atlas, cap) {
    const pos = [], idx = [];
    for (let ring = 0; ring < 3; ring++) for (let s = 0; s < DRIFT_SEG; s++) { const a = s / DRIFT_SEG * Math.PI * 2; pos.push(Math.cos(a), ring * 0.5, Math.sin(a)); }
    for (let ring = 0; ring < 2; ring++) for (let s = 0; s < DRIFT_SEG; s++) {
      const a = ring * DRIFT_SEG + s, b = ring * DRIFT_SEG + (s + 1) % DRIFT_SEG, c = a + DRIFT_SEG, e = b + DRIFT_SEG;
      idx.push(a, b, c, b, e, c);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(pos.map((v, i) => (i % 3 === 1 ? 1 : 0)), 3));
    geo.setIndex(idx);
    this.cap = cap;
    this.rock = new THREE.InstancedBufferAttribute(new Float32Array(cap * 4), 4);
    this.drift = new THREE.InstancedBufferAttribute(new Float32Array(cap * 3), 3);    // the lee, as a direction in the rock's own frame; how much dust
    this.rock.setUsage(THREE.DynamicDrawUsage); this.drift.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('aRock', this.rock); geo.setAttribute('aDrift', this.drift);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.96, metalness: 0, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 });
    mat.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>
          attribute vec4 aRock;
          attribute vec3 aDrift;
          uniform highp sampler2DArray uShapes;
          uniform vec4 uFeet;
          varying vec4 vDriftLies;
          varying vec3 vDriftAt;                         // how far out along the drift (0 at the rock, 1 at its edge), how thick it is, how far in the lee
          varying vec3 vDriftPos;
          ${GLSL_SHAPE_UV}
          vec3 driftPos;`)
        .replace('#include <beginnormal_vertex>', `
          mat3 rockM = mat3(instanceMatrix);
          vec3 rockS = vec3(length(rockM[0]), length(rockM[1]), length(rockM[2]));
          float g = aRock.y / rockS.y;                   // the ground, in the rock's own units
          vec2 cs = position.xz;
          // where the rock's surface stands at the ground on this bearing: two steps toward it
          float rho = 1.0;
          for (int i = 0; i < 2; i++) {
            vec3 d = normalize(vec3(cs.x * rho, g + 0.05, cs.y * rho));
            rho = max(0.35, textureLod(uShapes, vec3(rockUv(d), aRock.x), 0.0).a * ${atlas.rmax.toFixed(4)} * length(d.xz));
          }
          // (a stone that is trodden in takes its drift with it)
          vec3 up = normalize(rockM[1]), toFeet = instanceMatrix[3].xyz - uFeet.xyz;
          toFeet -= up * dot(toFeet, up);
          float rad = 0.5 * (rockS.x + rockS.z);
          float there = aRock.z < 0.0 || uFeet.w < 0.5 ? 1.0 : smoothstep(rad + 0.22, rad + 0.50, length(toFeet));
          float lee = max(0.0, dot(cs, aDrift.xy)), tail = lee * lee * lee;
          float amount = aDrift.z * there;
          float L = amount * (0.26 + 0.9 * tail), H = amount * (0.12 + 0.07 * tail);
          float t = position.y;                           // 0 inside the rock, a half out on the drift, 1 its edge
          float outBy = t < 0.25 ? -0.22 : t < 0.75 ? 0.4 * L : L;
          float high = t < 0.25 ? H * 1.3 : t < 0.75 ? H * 0.36 : -0.03;
          driftPos = vec3(cs.x * (rho + outBy), g + high, cs.y * (rho + outBy));
          // its slope, for the light: steep against the rock, easing out to level
          float fall = t < 0.25 ? H * 0.94 / (0.22 + 0.4 * L) : t < 0.75 ? 0.5 * (H * 0.94 / (0.22 + 0.4 * L) + (H * 0.36 + 0.03) / max(0.6 * L, 0.01)) : 0.3 * (H * 0.36 + 0.03) / max(0.6 * L, 0.01);
          vec3 objectNormal = normalize(vec3(cs.x * fall, 1.0, cs.y * fall));
          vDriftAt = vec3(t, amount, tail);
          vDriftPos = driftPos * rockS;
          vDriftLies = vec4(normalize((modelMatrix * instanceMatrix)[3].xyz), floor(aRock.w) / 15.0);`)
        .replace('#include <begin_vertex>', 'vec3 transformed = driftPos;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>
          uniform highp sampler3D uGrain;
          uniform samplerCube uAlbedo;
          uniform vec3 uHere;
          varying vec4 vDriftLies;
          varying vec3 vDriftAt;
          varying vec3 vDriftPos;
          ${GLSL_GROUND_GRADE}
          ${GLSL_ROCK_GROUND}`)
        .replace('#include <color_fragment>', `#include <color_fragment>
          rockLand(uAlbedo, vDriftLies, uHere);
          vec4 dg = texture(uGrain, vDriftPos * 1.3 + 0.41);
          // drifted dust is the country's dust, finer and so a shade paler than the ground it lies on; shaded close under the rock
          float inBy = 1.0 - smoothstep(0.0, 0.62, vDriftAt.x);
          diffuseColor.rgb = mix(rockGround, rockDust, 0.35) * (1.03 + (dg.a - 0.5) * 0.16) * (1.0 - 0.3 * inBy * inBy);
          diffuseColor.a = (1.0 - smoothstep(0.42, 0.97, vDriftAt.x + (dg.a - 0.5) * 0.22)) * smoothstep(0.02, 0.2, vDriftAt.y);`)
        .replace('#include <lights_physical_fragment>', `#include <lights_physical_fragment>
          material.specularColor *= 0.25; material.specularColorBlended *= 0.25; material.specularF90 *= 0.25;`)
        .replace('#include <normal_fragment_begin>', `#include <normal_fragment_begin>
          normal = normalize(normal + mat3(viewMatrix) * ((dg.rgb - 0.5) * 0.35));`);
    };
    mat.customProgramCacheKey = () => 'rock-drift-1';
    const m = this.mesh = new THREE.InstancedMesh(geo, mat, cap);
    m.castShadow = false; m.receiveShadow = true; m.frustumCulled = false; m.count = 0; m.renderOrder = -1;
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.n = 0;
    parent.add(m);
  }

  begin() { this.n = 0; }
  get full() { return this.n >= this.cap; }

  /** Add the drift of a rock from a chunk's prepared list (as RockLod.put), blown toward (lx, lz) in the rock's own frame. */
  put(I, j, dx, dy, dz, lx, lz, amount) {
    const M = this.mesh.instanceMatrix.array, A = this.rock.array, D = this.drift.array;
    const i = this.n++, m = i * 16, a = i * 4;
    M[m] = I[j]; M[m + 1] = I[j + 1]; M[m + 2] = I[j + 2]; M[m + 3] = 0;
    M[m + 4] = I[j + 3]; M[m + 5] = I[j + 4]; M[m + 6] = I[j + 5]; M[m + 7] = 0;
    M[m + 8] = I[j + 6]; M[m + 9] = I[j + 7]; M[m + 10] = I[j + 8]; M[m + 11] = 0;
    M[m + 12] = I[j + 9] + dx; M[m + 13] = I[j + 10] + dy; M[m + 14] = I[j + 11] + dz; M[m + 15] = 1;
    A[a] = I[j + 12]; A[a + 1] = I[j + 13]; A[a + 2] = I[j + 14]; A[a + 3] = I[j + 15];
    D[i * 3] = lx; D[i * 3 + 1] = lz; D[i * 3 + 2] = amount;
  }

  end() {
    const m = this.mesh;
    m.count = this.n; m.visible = this.n > 0;
    m.instanceMatrix.needsUpdate = true; this.rock.needsUpdate = true; this.drift.needsUpdate = true;
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
    this.stride = ROCK_STRIDE;                     // (numbers a rock in a chunk's list: the tests read the lists)
    this.density = o.density === undefined ? 1 : o.density;
    this.sets = new Map();                         // node -> { kind, data, origin } and, once wanted, what _prepare adds
    this.dirty = true;
    this.anchor = new THREE.Vector3();
    this.lastCam = new THREE.Vector3(1e9, 0, 0);
    this.shadowRange = o.shadowRange || 0;           // 0: rocks cast no shadows
    this.ice = iceSampler(o.albedoCube);
    // the shapes: their pictures are worked out a few milliseconds at a time, so that no frame waits on them; no rock is drawn until they are done
    const atlas = this.atlas = rockAtlas(this.density < 0.7 ? 96 : 128);
    const tex = new THREE.DataArrayTexture(atlas.data, atlas.size, atlas.size, atlas.layers);
    tex.format = THREE.RGBAFormat; tex.type = THREE.UnsignedByteType; tex.colorSpace = THREE.NoColorSpace;
    tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter; tex.generateMipmaps = true;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping; tex.unpackAlignment = 1;
    // (the way to the nearest arris: read texel by texel, never blended, for two neighbours may point opposite ways)
    const arris = new THREE.DataArrayTexture(atlas.snap, atlas.size, atlas.size, atlas.count);
    arris.format = THREE.RGFormat; arris.type = THREE.UnsignedByteType; arris.colorSpace = THREE.NoColorSpace;
    arris.minFilter = arris.magFilter = THREE.NearestFilter; arris.generateMipmaps = false;
    arris.wrapS = arris.wrapT = THREE.ClampToEdgeWrapping; arris.unpackAlignment = 1;
    this.ready = false;
    this.counts = { big: 0, near: 0, small: 0, colliders: 0, lods: [0, 0, 0, 0], casters: [0, 0, 0, 0], shapes: 0, shaded: 0, drifts: 0 };
    let next = 0, it = atlas.steps(0);
    const step = () => {
      for (const t = performance.now(); performance.now() - t < 9;) {
        if (!it.next().done) continue;
        if (++next >= atlas.count) { tex.needsUpdate = true; arris.needsUpdate = true; this.ready = true; this.dirty = true; return; }
        it = atlas.steps(next);
      }
      setTimeout(step, 0);
    };
    setTimeout(step, 0);
    this.uniforms = { uGrain: { value: detailTextures().grain }, uAlbedo: { value: o.albedoCube }, uShapes: { value: tex }, uArris: { value: arris },
      uHere: { value: new THREE.Vector3(0, 1, 0) }, uFeet: { value: new THREE.Vector4(0, 0, 0, 0) } };
    const mat = this.material = rockMaterial(this.uniforms, atlas, this.density < 0.7 ? 1 : 2);
    const lite = rockMaterial(this.uniforms, atlas, 0), depth = rockDepthMaterial(this.uniforms, atlas);
    // Four densities of ball: 20, 80, 320 and 1280 triangles. Which a rock gets depends on how large it is on the
    // screen (its radius over its distance), so a stone at his feet is as well drawn as a boulder across the valley; the
    // cheaper presets change sooner.
    const d = this.density, k = 1 / Math.sqrt(d), cast = this.shadowRange > 0;
    this.lods = [
      { lod: new RockLod(parent, lite, depth, 1, Math.round(3400 * d) + 500, false, atlas), from: 0 },
      { lod: new RockLod(parent, mat, depth, 2, Math.round(800 * d) + 250, cast, atlas), from: 0.008 * k },
      { lod: new RockLod(parent, mat, depth, 4, Math.round(160 * d) + 30, cast, atlas), from: 0.03 * k },
      { lod: new RockLod(parent, mat, depth, 8, Math.round(20 * d) + 6, cast, atlas), from: 0.12 * k },
    ];
    // and a fifth for the boulder he is standing beside, whose outline would otherwise show its triangles (not on
    // the cheapest preset, which has no draw call to spare for it and a small screen)
    if (d >= 0.7) this.lods.push({ lod: new RockLod(parent, mat, depth, 16, 3, cast, atlas), from: 0.42 * k });
    this.shade = new RockShade(parent, Math.round(1100 * d) + 300);
    this.drift = new RockDrift(parent, this.uniforms, atlas, Math.round(150 * d) + 30);
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
   * is, its proportions, how it lies and how deep it is seated. Sixteen numbers a rock (its axes, where its centre is from
   * the chunk's origin, and what the shader wants: atlas layer, height of the ground in its own frame, seed, tone), six
   * more (its radius, how far it stands above the ground, its shape, the lee as a direction in its own frame, how much
   * dust has drifted against it), and the colliders of those that stand in the way.
   */
  _prepare(set) {
    const d = set.data, o = set.origin, n = d.length / ROCK_STRIDE, big = set.kind === 'big';
    const inst = set.inst = new Float32Array(n * INST), aux = set.aux = new Float32Array(n * AUX), e = _m.elements;
    const shapes = this.atlas.shapes, classes = this.atlas.classes;
    set.colliders = [];
    // The wind of the place (the same for every rock of the chunk, so their tails lie one way): out of the west,
    // backing and veering a little from region to region.
    const ol = 1 / Math.hypot(o[0], o[1], o[2]), ux = o[0] * ol, uy = o[1] * ol, uz = o[2] * ol;
    const veer = gnoise3(ux * 2.3 + 4.1, uy * 2.3, uz * 2.3 - 1.7) * 1.1 + 0.25;
    const el = Math.hypot(uz, ux) || 1, ex = -uz / el, ez = ux / el, nx = -uy * ez, ny = uz * ex - ux * ez, nz = uy * ex;      // east and north here
    _w.set(ex * Math.cos(veer) + nx * Math.sin(veer), ny * Math.sin(veer), ez * Math.cos(veer) + nz * Math.sin(veer));
    for (let i = 0, j = 0, a = 0; i < d.length; i += ROCK_STRIDE, j += INST, a += AUX) {
      const size = d[i + 6], cls = Math.floor(d[i + 7]), rnd = d[i + 7] - cls, lava = d[i + 9];
      const list = classes[cls];
      const shape = list[Math.floor(fr(rnd * 61.7) * list.length)], sh = shapes[shape];
      // its own proportions
      const sy = size * (0.84 + fr(rnd * 13) * 0.32), bury = fr(rnd * 23);
      _s.set(size * (0.86 + fr(rnd * 7) * 0.28), sy, size * (0.86 + fr(rnd * 29) * 0.28));
      // How deep it is seated: to its shape's own ground line (below which it would overhang its foot), further where
      // the ground under it is uneven, and a few a good deal further.
      let ground = sh.ground * sy + d[i + 8] + sy * (0.02 + 0.3 * bury * bury * bury) * (sh.top - sh.ground);
      let stands = sh.top * sy - ground;
      // (and by what it is to a man on foot: see the top of this file)
      const solid = big && stands > ROCK_SOLID;
      const most = solid ? Infinity : big ? PLATE_HIGH * (0.6 + 0.8 * fr(rnd * 47)) : STONE_HIGH;
      if (stands > most) { ground += stands - most; stands = most; }
      _up.set(d[i + 3], d[i + 4], d[i + 5]);
      _q.setFromUnitVectors(_y, _up);
      _q2.setFromAxisAngle(_y, rnd * 6.283).premultiply(_q);
      _ax.set(Math.sin(rnd * 40), 0, Math.cos(rnd * 40));
      // (a plate that lies dead level is a pancake, and a block that stands square is a crate: they are tipped, as
      // the frost and the wind have left them; a plate flush with the ground is not)
      _q2.multiply(_q.setFromAxisAngle(_ax, (fr(rnd * 3.3) - 0.5) * (!solid && big ? 0.08 : cls === ROCK_SLAB ? 0.5 : cls === ROCK_ANGULAR ? 0.36 : 0.26)));
      _m.compose(_p.set(d[i] - _up.x * ground, d[i + 1] - _up.y * ground, d[i + 2] - _up.z * ground), _q2, _s);
      inst[j] = e[0]; inst[j + 1] = e[1]; inst[j + 2] = e[2]; inst[j + 3] = e[4]; inst[j + 4] = e[5]; inst[j + 5] = e[6];
      inst[j + 6] = e[8]; inst[j + 7] = e[9]; inst[j + 8] = e[10]; inst[j + 9] = e[12]; inst[j + 10] = e[13]; inst[j + 11] = e[14];
      // The stone's tone, 0 swept bare and dark to 1 under a pale rind of weathering and dust. Most wear something;
      // the wind has swept some bare, broken basalt more often than the rest. (Neighbours differ: that is what
      // makes a field of them read as many rocks and not as one rock many times.)
      const bare = fr(rnd * 11.3) < (cls === ROCK_ANGULAR ? 0.34 : cls === ROCK_SLAB ? 0.12 : 0.22);
      const tone = bare ? 0.03 + 0.3 * fr(rnd * 3.7) : 0.38 + 0.62 * fr(rnd * 3.7);
      // (below zero, the seed says the rock is never trodden in: a boulder, or a plate in the ground)
      inst[j + 12] = shape * 2; inst[j + 13] = ground; inst[j + 14] = big ? -Math.max(rnd, 1e-4) : rnd; inst[j + 15] = Math.round(lava * 15) + tone * 0.98;
      const radius = (_s.x + _s.z) * 0.5;
      aux[a] = radius; aux[a + 1] = stands; aux[a + 2] = shape;
      // the lee, in the rock's own frame (its x and z axes are the first and third columns of its matrix)
      const lx = (_w.x * e[0] + _w.y * e[1] + _w.z * e[2]) / _s.x, lz = (_w.x * e[8] + _w.y * e[9] + _w.z * e[10]) / _s.z, ll = Math.hypot(lx, lz) || 1;
      aux[a + 3] = lx / ll; aux[a + 4] = lz / ll;
      // how much dust has drifted against it: none on bare lava, least against a plate that hardly breaks the wind
      aux[a + 5] = (0.7 + 0.6 * fr(rnd * 5.3)) * (1 - lava) * (solid || !big ? 1 : 0.5);
      if (solid) {
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
    // Which ball a rock is drawn with depends on how near it is, so the lists are refilled every few steps (it is cheap:
    // what is slow about a rock was worked out when its chunk arrived).
    const refill = this.dirty || camPos.distanceToSquared(this.lastCam) >= 3 * 3;
    // instance matrices are stored relative to an anchor near the camera, to stay float32-exact
    if (refill) { this.anchor.copy(camPos); this.gravel.at[0] = NaN; }
    this.gravel.update(camPos, this.anchor);
    // where his boots are, for the stones under them (on foot only: the rover's wheels ride over what they meet)
    const feet = this.uniforms.uFeet.value, onFoot = S.started && S.mode === 'walk';
    feet.set(player.pos.x - this.anchor.x, player.pos.y - this.anchor.y, player.pos.z - this.anchor.z, onFoot ? 1 : 0);
    if (!refill) return;
    this.dirty = false;
    this.lastCam.copy(camPos);
    const lods = this.lods, top = lods.length - 1, ax = camPos.x, ay = camPos.y, az = camPos.z;
    for (const l of lods) { l.lod.mesh.position.copy(this.anchor); l.lod.begin(); }
    const shade = this.shade, drift = this.drift;
    shade.mesh.position.copy(this.anchor); shade.begin();
    drift.mesh.position.copy(this.anchor); drift.begin();
    let nBig = 0, nSmall = 0, kinds = 0;                      // (kinds: one bit for each shape that is drawn)
    rockColliders.length = 0;
    const frame = this.terrain.frame, shadowRange = this.shadowRange, driftFrom = 0.028 / Math.sqrt(this.density);
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
      for (let i = 0, j = 0, a = 0; i < d.length; i += ROCK_STRIDE, j += INST, a += AUX) {
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
        // (at the edge of what is drawn a rock rises out of the ground as it comes into range: it does not appear)
        const sink = dist > range * 0.82 ? (dist - range * 0.82) / (range * 0.18) * (aux[a + 1] + 0.05) : 0;
        lods[li].lod.put(inst, j, ox - d[i + 3] * sink, oy - d[i + 4] * sink, oz - d[i + 5] * sink, casts);
        // (a rock that is not in the shadow maps still wants shade under it)
        if (!casts && seen > 0.0035 && sink === 0) shade.add(x, y, z, aux[a], d[i + 3], d[i + 4], d[i + 5], aux[a + 1]);
        // (and one near enough for its foot to be seen wants its drift)
        if (seen > driftFrom && aux[a + 5] > 0.05 && !drift.full) drift.put(inst, j, ox, oy, oz, aux[a + 3], aux[a + 4], aux[a + 5]);
        drawn++;
        kinds |= 1 << aux[a + 2];
      }
      if (big) {
        nBig += drawn;
        for (const c of set.colliders) if (Math.hypot(c.x - ax, c.y - ay, c.z - az) < 140) rockColliders.push(c);
      } else nSmall += drawn;
    }
    for (const l of lods) l.lod.end();
    shade.end(); drift.end();
    this.counts = { big: nBig, near: lods[3].lod.n + (lods[4] ? lods[4].lod.n : 0), small: nSmall, colliders: rockColliders.length, lods: lods.map((l) => l.lod.n), casters: lods.map((l) => l.lod.casters),
      shapes: (kinds >>> 0).toString(2).replace(/0/g, '').length, shaded: shade.n, drifts: drift.n };
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
const _fc = [0, 0, 0], _fd = [0, 0, 0], _mp = new Float64Array(10);
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
    this.lod = new RockLod(parent, material, depth, 1, this.cap, false, atlas);
  }

  _cell(face, ci, cj) {
    const h0 = hashU(ci, cj, face, 71);
    // patches: a slow field decides how stony this cell is
    faceToDir(face, (ci + 0.5) * CELL / FACE_M, (cj + 0.5) * CELL / FACE_M, _fd);
    if (this.ice(_fd[0], _fd[1], _fd[2]) > ICE_BARE) return new Float64Array(0);
    const patch = gnoise3(_fd[0] * R / 9 + 3.3, _fd[1] * R / 9, _fd[2] * R / 9 - 5.1) + 0.5 * gnoise3(_fd[0] * R / 31, _fd[1] * R / 31 + 9.2, _fd[2] * R / 31);
    const n = Math.max(0, Math.round((0.6 + patch * 3.2) * 4 + ((h0 & 255) / 255 - 0.5) * 3));
    const out = new Float64Array(n * 9);
    let seed = h0, k = 0;
    const rnd = () => { seed = (seed + 0x6d2b79f5) | 0; let x = Math.imul(seed ^ (seed >>> 15), 1 | seed); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
    const pads = this.planet.pads;
    // the pebbles lie on the mesh that is drawn here, as the rocks do (see meshPoint)
    const grid = planetGrid(this.planet, face, this.terrain.G, this.terrain.maxLevel);
    // (how much of this ground is lava is asked once a cell: it is slow to ask and slow to change)
    const lavaField = smoothstep(0, 0.36, this.planet.lava(_fd[0], _fd[1], _fd[2]));
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
      out[k++] = lavaField * bareLava(_mp[6], _mp[8]);
    }
    return k === out.length ? out : out.subarray(0, k);
  }

  /** `anchor`: the point the rocks' meshes are drawn from; the pebbles are drawn from it too, so that one place for
   *  his boots serves them all. */
  update(camPos, anchor) {
    const len = camPos.length(), lod = this.lod;
    if (len - R > 400) { if (lod.n) { lod.begin(); lod.end(); this.cells.clear(); } this.at[0] = NaN; return; }
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
    lod.mesh.position.copy(anchor);
    lod.begin();
    const shapes = this.atlas.shapes, list = this.atlas.classes[ROCK_COBBLE];
    for (const d of this.cells.values()) {
      for (let i = 0; i < d.length && !lod.full; i += 9) {
        const size = d[i + 6], rnd = d[i + 7];
        const shape = list[Math.floor(fr(rnd * 61.7) * list.length)], sh = shapes[shape];
        const sy = size * (0.8 + fr(rnd * 13) * 0.4), bury = fr(rnd * 23);
        _s.set(size * (0.85 + fr(rnd * 7) * 0.35), sy, size * (0.85 + fr(rnd * 29) * 0.35));
        const ground = sh.ground * sy + sy * (0.04 + 0.3 * bury * bury) * (sh.top - sh.ground);
        _up.set(d[i + 3], d[i + 4], d[i + 5]);
        _q.setFromUnitVectors(_y, _up);
        _q2.setFromAxisAngle(_y, rnd * 6.283).premultiply(_q);
        _ax.set(Math.sin(rnd * 40), 0, Math.cos(rnd * 40));
        _q2.multiply(_q.setFromAxisAngle(_ax, (fr(rnd * 3.3) - 0.5) * 0.5));
        _m.compose(_p.set(d[i] - anchor.x - _up.x * ground, d[i + 1] - anchor.y - _up.y * ground, d[i + 2] - anchor.z - _up.z * ground), _q2, _s);
        // (pebbles are darker than the sand they lie on: what is pale and fine has blown away from them)
        lod.add(shape * 2, ground, rnd, Math.round(d[i + 8] * 15) + (0.05 + fr(rnd * 3.7) * 0.6) * 0.98, false);
      }
    }
    lod.end();
  }
}

