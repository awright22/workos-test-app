/*
 * A dust devil: a leaning, wobbling column of dust that twists as it walks across the plain.
 * One open tube, shaded from the 3D detail noise scrolled up and around it; denser at its
 * edges (more dust in the line of sight), ragged, and faded into the haze with distance.
 */
import * as THREE from 'three';
import { detailTextures } from './noise3d.js';

let geometry = null;
function tube() {
  if (geometry) return geometry;
  geometry = new THREE.CylinderGeometry(1, 1, 1, 20, 14, true);
  geometry.translate(0, 0.5, 0);                  // base at the origin, top at y = 1
  return geometry;
}

export class DustDevil {
  constructor(parent) {
    this.uniforms = {
      uTime: { value: 0 }, uHeight: { value: 40 }, uRadius: { value: 3 }, uLean: { value: new THREE.Vector2() },
      uOpacity: { value: 0 }, uColor: { value: new THREE.Color(0.8, 0.6, 0.45) }, uGrain: { value: detailTextures().grain },
      uFogColor: { value: new THREE.Color() }, uFogDensity: { value: 0.001 }, uSeed: { value: Math.random() * 10 },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms, transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false,
      vertexShader: /* glsl */`
        uniform float uTime, uHeight, uRadius, uSeed;
        uniform vec2 uLean;
        varying vec3 vObj; varying vec3 vN; varying vec3 vView; varying float vH;
        void main() {
          float h = position.y;
          // a narrow foot, flaring and fraying toward the top, with a slow wobble up its length
          // ... and a skirt of dust thrown out where it touches the ground
          float rad = uRadius * (mix(0.42, 1.0, pow(h, 0.8)) + 0.9 * exp(-h * 26.0)) * (1.0 + 0.14 * sin(h * 9.0 - uTime * 2.2 + uSeed));
          vec3 p = vec3(position.x * rad, h * uHeight, position.z * rad);
          p.x += (sin(h * 3.1 + uTime * 0.8 + uSeed) * 0.9 * uRadius + uLean.x * uHeight) * h;
          p.z += (cos(h * 2.3 + uTime * 0.6 + uSeed * 1.7) * 0.9 * uRadius + uLean.y * uHeight) * h;
          vObj = p; vH = h;
          vN = normalize(normalMatrix * vec3(position.x, 0.0, position.z));
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vView = -mv.xyz;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */`
        uniform float uTime, uHeight, uRadius, uOpacity, uFogDensity, uSeed;
        uniform vec3 uColor, uFogColor;
        uniform highp sampler3D uGrain;
        varying vec3 vObj; varying vec3 vN; varying vec3 vView; varying float vH;
        void main() {
          // the dust spirals: turn the lookup about the axis as it climbs
          float a = uTime * 1.9 + vH * 5.0;
          float c = cos(a), s = sin(a);
          vec3 q = vec3(vObj.x * c - vObj.z * s, vObj.y * 0.30 - uTime * 2.4, vObj.x * s + vObj.z * c);
          float n = texture(uGrain, q / (uRadius * 3.6) + uSeed).a * 0.6 + texture(uGrain, q / (uRadius * 1.1)).a * 0.4;
          float facing = abs(dot(normalize(vN), normalize(vView)));
          float body = mix(1.0, 0.55, facing) * smoothstep(0.0, 0.22, facing);        // thick at the edges, soft at the silhouette
          float ends = smoothstep(0.0, 0.02, vH) * (1.0 - smoothstep(0.45, 1.0, vH));
          // ragged: solid dust low down, torn into streamers higher up
          float alpha = smoothstep(mix(0.30, 0.44, vH), mix(0.52, 0.68, vH), n) * body * ends * uOpacity;
          if (alpha < 0.004) discard;
          float d = length(vView);
          float fog = 1.0 - exp(-uFogDensity * uFogDensity * d * d);
          vec3 col = uColor * (0.70 + 0.60 * n) * mix(0.78, 1.0, vH);
          gl_FragColor = vec4(mix(col, uFogColor, fog), alpha * (1.0 - fog * 0.85));
        }`,
    });
    this.mesh = new THREE.Mesh(tube(), mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 18;
    this.mesh.visible = false;
    parent.add(this.mesh);
  }
}
