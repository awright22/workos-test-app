/**
 * The shade that things standing in the Hab throw on its floor.
 *
 * Under the dome the light comes from strips along the ceiling, and none of them casts a shadow: the renderer's one
 * shadow-casting light is the sun, or, sealed in, a single lamp straight overhead whose shadows lie hidden under
 * the things that cast them. So a table, a bunk and a rack of machines stood on an evenly lit floor with nothing
 * under them, and three reviews running called the room flat.
 *
 * Here the room is drawn once from straight above: a mask of whatever stands within a pace and a quarter of the
 * floor, and how high each thing is. Blurred at three widths (the mask's own smaller copies), it is laid on the
 * floor as a soft dark: deep close under a thing, fading within a couple of feet of it, weaker under what stands
 * high (a table top) than under what lies low (a crate). It is drawn again whenever the furnishings change.
 */
import * as THREE from 'three';

const LAYER = 5;                    // the layer the mask's camera sees: only the room's own meshes are put on it
const SIZE = 512;                   // the mask, in pixels across the room
const TOP = 1.25;                   // how far above the floor a thing still shades it, m
const CLEAR = 0.07;                 // what lies this close to the floor is the floor (paint, a mat, a cable duct)
const _clear = new THREE.Color();

/**
 * @param {THREE.Object3D} parent  the Hab's own frame: y up, the floor at `floorY`
 * @param {number} radius          the room's radius, m
 * @param {number} floorY          the floor's height in that frame
 */
export function createFloorShade(parent, radius, floorY) {
  const rt = new THREE.WebGLRenderTarget(SIZE, SIZE, {
    depthBuffer: true, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat, type: THREE.UnsignedByteType,
  });
  rt.texture.colorSpace = THREE.NoColorSpace;
  // looking straight down from TOP above the floor; it sees to within CLEAR of the floor and no further
  const cam = new THREE.OrthographicCamera(-radius, radius, radius, -radius, 0, TOP - CLEAR);
  cam.position.set(0, floorY + TOP, 0);
  cam.rotation.x = -Math.PI / 2;
  cam.layers.set(LAYER);
  parent.add(cam);
  // every mesh drawn as its height: white at the camera (TOP), black at the floor; and solid (alpha 1) wherever
  // anything stands. (Both sides: a rack taller than TOP is cut open by the camera, and its inside must still count.)
  const mask = new THREE.MeshDepthMaterial({ depthPacking: THREE.BasicDepthPacking, side: THREE.DoubleSide });

  const geo = new THREE.PlaneGeometry(radius * 2, radius * 2);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.ShaderMaterial({
    uniforms: { uMap: { value: rt.texture }, uStrength: { value: 0 } },
    transparent: true, depthWrite: false, fog: false, polygonOffset: true, polygonOffsetFactor: -1.5, polygonOffsetUnits: -1.5,
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */`
      uniform sampler2D uMap; uniform float uStrength;
      varying vec2 vUv;
      // how much stands over this spot at a blur: all of it for what lies low, under half for what stands at TOP
      float over(float lod) { vec4 t = textureLod(uMap, vUv, lod); return t.a - 0.58 * t.r; }
      void main() {
        // (Three widths: a hand, a foot and a half, and a faint pace. Most of the weight is close in: a wide dark is
        // most of the floor, and the camera's exposure lifts the whole room to make up for it, which leaves nothing.)
        float a = (0.62 * over(1.4) + 0.50 * over(3.0) + 0.12 * over(4.4)) * uStrength;
        if (a < 0.004) discard;
        gl_FragColor = vec4(0.0, 0.0, 0.0, min(a, 0.70));
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'floor_shade';
  mesh.position.y = floorY + 0.014;
  mesh.renderOrder = 1;
  mesh.frustumCulled = false;
  mesh.visible = false;
  mesh.userData.neverCasts = true;
  parent.add(mesh);

  let seen = -1, wait = 0;
  function bake(renderer, scene, parts) {
    for (const p of parts) {
      if (p) p.traverse((o) => {
        if (!o.isMesh || o === mesh) return;
        const m = o.material;
        // (what is a glow, a pane or a beam of light shades nothing)
        if (m && !Array.isArray(m) && (m.transparent || m.blending === THREE.AdditiveBlending)) o.layers.disable(LAYER); else o.layers.enable(LAYER);
      });
    }
    const target = renderer.getRenderTarget(), over = scene.overrideMaterial, bg = scene.background, auto = renderer.autoClear;
    const alpha = renderer.getClearAlpha(), shadows = renderer.shadowMap.autoUpdate;
    renderer.getClearColor(_clear);
    scene.overrideMaterial = mask; scene.background = null;
    renderer.shadowMap.autoUpdate = false;
    renderer.setRenderTarget(rt);
    renderer.setClearColor(0x000000, 0);
    renderer.autoClear = true;
    cam.updateMatrixWorld(true);
    renderer.render(scene, cam);
    renderer.setRenderTarget(target);
    renderer.setClearColor(_clear, alpha);
    renderer.autoClear = auto;
    renderer.shadowMap.autoUpdate = shadows;
    scene.overrideMaterial = over; scene.background = bg;
    mat.uniforms.uStrength.value = 1;
  }
  return {
    mesh,
    /** the mask itself (for tests) */
    mask: rt,
    /**
     * Call each frame the room is drawn. `parts`: the groups that hold what stands in it. The mask is drawn again
     * when what they hold has changed (a bed built, a crop grown, a chair made), looked at twice a second.
     */
    update(renderer, scene, parts, dt) {
      wait -= dt;
      if (wait > 0) return;
      wait = 0.5;
      let n = 0;
      for (const p of parts) if (p) p.traverseVisible((o) => { if (o.isMesh && o !== mesh) n += 1 + (o.geometry.attributes.position ? o.geometry.attributes.position.count : 0); });
      if (n === seen) return;
      seen = n;
      bake(renderer, scene, parts);
    },
  };
}
