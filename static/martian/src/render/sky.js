/*
 * The Martian sky: a dome around the camera, shaded per pixel.
 *
 * It is a look model, not a physical simulation, built from what the surface cameras show:
 *   - by day a dusty butterscotch sky, palest and brightest toward the horizon and the sun
 *   - at sunrise and sunset the sky darkens to grey-brown and the glow around the sun turns
 *     blue (fine dust scatters blue light forward)
 *   - a long, dim twilight, then stars
 *   - from high above, black space with a thin tan haze along the limb of the planet
 * skyColor() in JavaScript mirrors the shader, so lights and fog can match the sky exactly.
 */
import * as THREE from 'three';
import { R } from '../planet/constants.js';
import { clamp, smoothstep, lerp } from '../core/math.js';

const ATMO_H = 420;      // visual scale height of the dust haze in world metres

const GLSL_SKY = /* glsl */`
  uniform vec3 uSun;        // unit, world
  uniform vec3 uUp;         // unit, world: straight up at the camera
  uniform float uAlt;       // camera altitude above the mean surface (m)
  uniform float uDust;      // 0 clear .. 1 thick dust storm
  uniform vec3 uFogCol;     // what distant ground fades to (set from the same numbers as the scene's fog)
  uniform float uTime;
  const float PI = 3.14159265;

  float hash13(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
  float vnoise(vec3 p) {
    vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash13(i), hash13(i + vec3(1, 0, 0)), f.x), mix(hash13(i + vec3(0, 1, 0)), hash13(i + vec3(1, 1, 0)), f.x), f.y),
               mix(mix(hash13(i + vec3(0, 0, 1)), hash13(i + vec3(1, 0, 1)), f.x), mix(hash13(i + vec3(0, 1, 1)), hash13(i + vec3(1, 1, 1)), f.x), f.y), f.z);
  }

  // colour of the sky in direction v (unit, world). Linear, scene-referred.
  vec3 skyColor(vec3 v, out float space) {
    float mu = dot(v, uUp);
    float sunE = dot(uSun, uUp);
    float cosT = dot(v, uSun);
    float day = smoothstep(-0.16, 0.10, sunE);
    float low = 1.0 - smoothstep(0.0, 0.45, sunE);           // 1 at the horizon, 0 high sun
    // base dome: three tones, not two. A pale bright band lying on the horizon (the last ten degrees, where the eye
    // looks through the most dust), butterscotch above it, and a deep red-brown overhead that is reached by half way
    // up. (It was one tone graded into another over the whole dome, and a level camera sees only the lowest quarter
    // of a dome: on the screen that was a single mustard wash from the horizon to the top of the picture.)
    float m0 = clamp(mu, 0.0, 1.0);
    float h = pow(1.0 - m0, 2.5);                              // (what the haze terms below are weighted by)
    float band0 = pow(1.0 - smoothstep(0.0, 0.17, m0), 1.5);
    float mid0 = pow(1.0 - smoothstep(0.0, 0.52, m0), 1.5);
    vec3 zen = mix(vec3(0.305, 0.142, 0.058), vec3(0.098, 0.086, 0.104), low);
    vec3 mdl = mix(vec3(0.580, 0.325, 0.152), vec3(0.235, 0.172, 0.160), low);
    vec3 hor = mix(vec3(0.900, 0.615, 0.350), vec3(0.420, 0.270, 0.196), low);
    vec3 col = mix(mix(zen, mdl, mid0), hor, band0);
    // ... and it is not the same all the way round. The side the sun is on is brighter and paler, the side away from
    // it deeper and a shade redder: half of what gives a daytime sky its depth is which way one is looking.
    float toSun = cosT * 0.5 + 0.5;
    col *= 1.0 + (0.46 * toSun * toSun * toSun - 0.10 * (1.0 - toSun) * (1.0 - toSun)) * (1.0 - 0.5 * low);
    col = mix(col, vec3(dot(col, vec3(0.3, 0.5, 0.2))) * vec3(1.16, 1.0, 0.80), 0.22 * pow(max(cosT, 0.0), 3.0) * (1.0 - low));
    // the dust is not even: slow broad bands of thicker and thinner haze
    float band = vnoise(v * vec3(2.2, 7.0, 2.2) + vec3(uTime * 0.004, 0.0, uTime * 0.002)) - 0.5;
    col *= (1.0 + band * 0.16 * (1.0 - uDust)) * (0.90 * day);
    // High cloud: thin ice haze drawn out along the wind, a shade paler than the sky it lies on. Faint and slow, thinning
    // toward the horizon (where the dust hides it) and gone in a storm. (Half of every day picture was an empty gradient.)
    if (day > 0.01 && mu > 0.02) {
      vec3 wAx = normalize(cross(uUp, vec3(0.31, 0.77, 0.55)));
      vec3 q = (v - uUp * mu) / (mu + 0.16);
      // (drawn out, but not ruled: straight and strong, seen from below they were four searchlight beams)
      // (and not long: low in the sky a long streak runs to the horizon, and several of them fan out of one point like
      // rays from a lamp behind the hill. So they are drawn out by half, not by more than double, bent more, and
      // are gone below a quarter of the way up.)
      // (nor round: bent that hard and that short they were pale blots, which a reviewer took for dirt on the lens. Drawn
      //  out by nearly two to one, bent a little, with a finer grain in them, and fainter.)
      vec3 c = (q - wAx * (dot(q, wAx) * 0.46)) * 2.6 + vec3(uTime * 0.0016, 0.0, uTime * 0.0011);
      c += (vnoise(c * 0.7 + 9.3) - 0.5) * 1.2;
      float wn = vnoise(c) * 0.50 + vnoise(c * 2.4 + 5.1) * 0.32 + vnoise(c * 6.1 + 2.7) * 0.18;
      // (they begin a little lower than they did, a sixth of the way up: against the deeper sky above the pale band
      //  they are what shows that the upper sky is air and not a painted card. Under a low sun they catch its light.)
      float wisp = smoothstep(0.52, 0.84, wn) * smoothstep(0.09, 0.36, mu) * (1.0 - smoothstep(0.55, 0.95, mu) * 0.6) * (1.0 - uDust) * day;
      col = mix(col, vec3(dot(col, vec3(0.3, 0.5, 0.2))) * mix(vec3(1.30), vec3(1.55, 1.30, 1.20), low), 0.24 * wisp) * (1.0 + 0.06 * wisp);
    }
    // night: the faint cool light of a dusty sky under the stars, a little brighter at the horizon
    col += mix(vec3(0.0110, 0.0140, 0.0235), vec3(0.0260, 0.0290, 0.0400), h) * (1.0 - day);
    // dust aureole around the sun: warm white by day, blue when the sun is low
    float g = 0.80;
    float hg = (1.0 - g * g) / pow(1.0 + g * g - 2.0 * g * cosT, 1.5) * 0.25;
    float wide = pow(max(cosT, 0.0), 6.0);
    vec3 aur = mix(vec3(1.0, 0.86, 0.66), vec3(0.30, 0.50, 0.95), smoothstep(0.30, 0.02, sunE));
    float sunUp = smoothstep(-0.10, 0.04, sunE);
    // near the horizon the sun shines through far more dust: the glow shrinks and dims with it
    // (kept tight: a broad white aureole veils the whole frame when he looks toward the sun, and Mars turns beige)
    col += aur * (hg * mix(0.17, 0.026, sqrt(low)) + wide * mix(0.07, 0.02, sqrt(low))) * sunUp * (0.35 + 0.65 * h + 0.5 * low);
    // Under a low sun the sky round it is blue: fine dust scatters blue light forward, and it is the one thing every
    // picture of a Martian sunset has. The blue takes the place of the brown there, and is not laid over it: added to
    // a grey-brown sky it summed to a pale grey-white dome with no colour in it at all. It is an oval lying along the
    // horizon, deepest a hand's breadth from the sun and thinning into a dusty rose further round.
    float ang0 = acos(clamp(cosT, -1.0, 1.0));
    float lowK = smoothstep(0.40, 0.05, sunE) * smoothstep(-0.13, 0.01, sunE);
    vec3 dSun = v - uSun * cosT;                                  // (which way from the sun: up counts for more than along)
    float dUp = dot(dSun, uUp);
    float oval = length(dSun + uUp * (dUp * 0.6));               // (1.6 times as far, measured upward)
    float glowB = exp(-(ang0 * 0.55 + oval * 0.45) * 2.9);
    vec3 blue = vec3(0.190, 0.400, 0.860) * (0.50 + 0.95 * exp(-ang0 * 7.0));
    col = mix(col, blue, lowK * min(glowB * 1.25, 0.94));
    // (and beyond the blue, low down on the sun's side, the dust the light has passed through is warm: a rose belt)
    col += vec3(0.150, 0.048, 0.030) * lowK * band0 * smoothstep(0.25, 0.9, ang0) * toSun;
    // (the far side at sunrise is not blank either: a cool dusk still lying on the horizon under a sky the first light
    //  has reached, the planet's own shadow going down)
    float away = (1.0 - toSun) * (1.0 - toSun) * lowK;
    col = mix(col, col * vec3(0.70, 0.78, 1.06), away * band0 * 0.9);
    col += vec3(0.085, 0.036, 0.040) * away * mid0 * (1.0 - band0);
    // twilight glow hugging the horizon on the sun's side after sunset
    float tw = smoothstep(-0.34, -0.02, sunE) * (1.0 - sunUp);
    col += vec3(0.20, 0.25, 0.42) * tw * pow(max(cosT * 0.5 + 0.5, 0.0), 3.0) * (0.25 + h) * 0.55;
    // The foot of the sky is haze: the same haze the far ground fades into (the scene's fog), so that for three degrees
    // above the horizon line the sky has the ground's own far colour. Without it the land faded to one colour and the
    // sky began in another along a ruled line, and after sunset, when the sky keeps its light longer than the ground,
    // every boulder out on that line stood against it as a dark cut-out. (Not from high up: there the line is the limb.)
    col = mix(col, uFogCol, 0.62 * (1.0 - smoothstep(-0.004, 0.052, mu)) * (1.0 - smoothstep(300.0, 2500.0, uAlt)));
    // storms: flatten everything toward a dim ochre
    // in a storm the sky is the dust itself: the very colour the ground fades into, so no horizon shows
    col = mix(col, uFogCol, smoothstep(0.0, 0.8, uDust));
    // leaving the atmosphere: fade to space, keep a haze band along the limb
    space = 1.0 - exp(-max(uAlt, 0.0) / ${ATMO_H.toFixed(1)});
    float camR = ${R.toFixed(1)} + uAlt;
    float b = camR * sqrt(max(1.0 - mu * mu, 0.0));           // closest approach of the ray to the centre
    // the air seen edge-on from above: a thin band of haze along the limb, lit only where the
    // sun reaches that part of the planet
    vec3 nearest = normalize(uUp * camR - v * (camR * mu));
    // (it dies away over half the way round to midnight, as the air's own twilight does: ended in a dozen degrees,
    // the glow stopped at a visible corner in the planet's outline)
    float limbLit = pow(smoothstep(-0.55, 0.30, dot(nearest, uSun)), 1.6);
    // (thin: a line of haze, tan against the planet and bluer where it thins into space)
    // (a hair of light on the planet's edge, as the air of Mars is from orbit: at a sixth of the haze's own depth it
    //  was a yellow band a finger wide round the ball the rocket climbed from)
    float above = max(b - ${R.toFixed(1)}, 0.0) / ${(ATMO_H * 0.105).toFixed(1)};
    float limb = (mu < 0.0 ? 1.0 : 0.0) * exp(-above);
    vec3 fromSpace = mix(vec3(0.70, 0.48, 0.33), vec3(0.36, 0.46, 0.66), smoothstep(0.3, 2.2, above)) * limb * limbLit * 0.66;
    // On the way up the day sky is the dust still left along each line of sight: overhead it thins with the camera's
    // own height, and below the level it thins with the height at which that line passes the planet. So the sky
    // goes dark from the top down, and what is left at the end is a bright band lying on the limb.
    // (It was thinned by the camera's height alone, and from 1,400 m the whole sky below the level was one brown,
    // with the stars showing through it.)
    float passes = mu >= 0.0 ? max(uAlt, 0.0) : max(b - ${R.toFixed(1)}, 0.0);
    // (and from well out the band is thin: the air is a hundredth of the planet's radius deep. Its depth here is what
    // the climb needs, and seen from orbit and from the title's distance that was a fat halo: a third of it there.)
    float deep = ${(ATMO_H * 0.55).toFixed(1)} * mix(1.0, 0.19, smoothstep(${(ATMO_H * 1.5).toFixed(1)}, ${(ATMO_H * 6).toFixed(1)}, uAlt));
    fromSpace = max(fromSpace, col * exp(-passes / deep) * h * mix(1.0, limbLit, step(mu, 0.0)));
    col = mix(col, fromSpace, space);
    return col;
  }

  vec3 stars(vec3 v, float visibility) {
    if (visibility <= 0.001) return vec3(0.0);
    vec3 acc = vec3(0.0);
    for (int layer = 0; layer < 2; layer++) {
      float scale = layer == 0 ? 170.0 : 90.0;
      vec3 p = v * scale;
      vec3 ip = floor(p + 0.5);
      float rnd = hash13(ip + float(layer) * 17.0);
      if (rnd > (layer == 0 ? 0.965 : 0.985)) {
        vec3 c = ip + (vec3(hash13(ip + 3.1), hash13(ip + 7.7), hash13(ip + 11.3)) - 0.5) * 0.7;
        float d = length(p - normalize(c) * length(p));
        float mag = pow(hash13(ip + 23.0), layer == 0 ? 9.0 : 4.0);
        float tw = 0.85 + 0.15 * sin(uTime * (2.0 + rnd * 5.0) + rnd * 60.0);
        float s = exp(-d * d * (layer == 0 ? 420.0 : 210.0)) * (0.22 + 7.0 * mag) * tw;
        vec3 tint = mix(vec3(1.0, 0.86, 0.72), vec3(0.75, 0.86, 1.0), hash13(ip + 41.0));
        acc += tint * s;
      }
    }
    return acc * visibility;
  }
`;

const _c = new THREE.Color(), _m = new THREE.Vector3();

export class Sky {
  constructor() {
    this.uniforms = {
      uSun: { value: new THREE.Vector3(1, 0, 0) },
      uUp: { value: new THREE.Vector3(0, 1, 0) },
      uAlt: { value: 2 },
      uDust: { value: 0 }, uFogCol: { value: new THREE.Color() },
      uTime: { value: 0 },
      uSunDisc: { value: 1 },
      // the two moons: direction from the eye, and how much sunlight reaches each (Mars's shadow puts them out)
      uPhobos: { value: new THREE.Vector4(1, 0, 0, 0) }, uDeimos: { value: new THREE.Vector4(1, 0, 0, 0) },
      uEarth: { value: new THREE.Vector3(0, 0, 1) },         // the evening star
    };
    /** Where the moons are, in planet radii from the centre (set by the simulation's clock). */
    this.moons = [new THREE.Vector3(2.766, 0, 0), new THREE.Vector3(-6.92, 0, 0)];
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false, toneMapped: true,
      vertexShader: /* glsl */`
        varying vec3 vDir;
        void main() {
          vDir = position;
          vec4 p = projectionMatrix * vec4((viewMatrix * vec4(position, 0.0)).xyz, 1.0);
          gl_Position = p.xyww;       // always at the far plane
        }`,
      fragmentShader: /* glsl */`
        varying vec3 vDir;
        uniform float uSunDisc;
        uniform vec4 uPhobos, uDeimos;
        uniform vec3 uEarth;
        ${GLSL_SKY}
        // A moon: a small lumpy body lit by the sun, so it shows a phase. rad is its angular radius.
        vec3 moon(vec3 v, vec4 m, float rad, float lumpy) {
          if (dot(v, m.xyz) < 0.9999) return vec3(0.0);        // (within 0.8 of a degree)
          vec3 e1 = normalize(cross(m.xyz, vec3(0.0, 1.0, 0.0)));
          vec3 e2 = cross(e1, m.xyz);
          vec2 q = vec2(dot(v, e1), dot(v, e2)) / rad;                    // 1 at the limb
          float phi = atan(q.y, q.x);
          float limb = 1.0 + lumpy * (0.16 * sin(2.0 * phi + 0.9) + 0.07 * sin(3.0 * phi + 2.1) + 0.04 * sin(5.0 * phi));
          float r2 = dot(q, q) / (limb * limb);
          if (r2 >= 1.0) return vec3(0.0);
          vec3 n = normalize(q.x * e1 + q.y * e2 - sqrt(1.0 - r2) * m.xyz);
          // (a dark dent or two, so the bigger one is not a plain ball)
          float dent = 1.0 - lumpy * 0.35 * smoothstep(0.34, 0.0, length(q - vec2(0.28, 0.22))) - lumpy * 0.2 * smoothstep(0.2, 0.0, length(q + vec2(0.4, 0.1)));
          return vec3(1.0, 0.93, 0.84) * ((0.03 + max(dot(n, uSun), 0.0)) * dent * m.w * smoothstep(1.0, 0.72, r2));
        }
        void main() {
          vec3 v = normalize(vDir);
          float space;
          vec3 col = skyColor(v, space);
          float sunE = dot(uSun, uUp);
          float night = 1.0 - smoothstep(-0.20, 0.06, sunE);
          // stars need darkness: night, or real height above the dust (not a mountain top by day)
          float airless = smoothstep(0.80, 0.98, space);
          // ... and they drown in the dust toward the horizon and in the glow of the set sun
          float starVis = max(night, airless) * (1.0 - uDust) * smoothstep(0.0, 0.38, dot(v, uUp) + airless)
            * (1.0 - 0.8 * smoothstep(-0.34, -0.04, sunE) * (1.0 - airless) * pow(max(dot(v, uSun) * 0.5 + 0.5, 0.0), 2.0));
          // (and in whatever sky is still bright: the dust band on the limb, seen from the climb)
          col += stars(v, starVis * (1.0 - smoothstep(0.03, 0.16, dot(col, vec3(0.3, 0.5, 0.2))))) * 0.9;
          // Phobos and Deimos. Truly they are a fifth of a degree and a twentieth across, which on a screen is a
          // star and less than a star: they are drawn four times that, so that one is a moon and the other a moonlet.
          // Both can be seen by day, palely.
          // (by day they are put out: at a quarter of their light a moon in a butterscotch sky was a pale speck that read
          // as a fault in the picture; they come up through the dusk)
          float moonVis = (1.0 - uDust * 0.95) * smoothstep(0.1, 0.7, max(night, airless)) * smoothstep(-0.01, 0.05, dot(v, uUp) + airless);
          // (kept under what the bloom picks up: a moon is lit rock, not a lamp)
          // (dark rock, a fifteenth as bright as the sand it shines on: at 0.85 the disc clipped to white in the wide-open
          // exposure of twilight and read as a second sun)
          col += (moon(v, uPhobos, 0.0075, 1.0) * 0.42 + moon(v, uDeimos, 0.0030, 0.5) * 0.8) * moonVis;
          // the Earth: the brightest star in the evening sky, and blue-white. It shows as soon as the sun is down.
          float earthVis = (1.0 - uDust) * max(1.0 - smoothstep(-0.12, -0.02, sunE), airless) * smoothstep(0.0, 0.10, dot(v, uUp) + airless);
          // (a star, not a disc: drawn four tenths of a degree across it was a white ball with a halo high in the dusk)
          col += vec3(0.72, 0.86, 1.0) * (smoothstep(0.9999930, 0.9999992, dot(v, uEarth)) * 3.4 * earthVis);
          // The sun: a small hard disc with a tight halo. On Mars it is a third of a degree across, which on a phone is
          // three pixels: a bright bead, and at sunset, where it is the subject of the picture, a pin-point. It is
          // drawn at about twice that by day and three times under a low sun (as the moons are drawn large), with a
          // clean edge, and dim enough low down that it is a pale disc one can look at and not a flare.
          float cosT = dot(v, uSun);
          float ang = acos(clamp(cosT, -1.0, 1.0));
          float lowS = smoothstep(0.40, 0.02, sunE);
          float rad = mix(0.0062, 0.0098, lowS);
          float disc = smoothstep(rad, rad * 0.86, ang);
          float halo = exp(-ang * 70.0) * 0.5 + exp(-ang * 16.0) * 0.03;
          // (in a storm the dust between scatters the sun's light wide: a pale patch with a dim disc in it, not a white bead)
          halo += uDust * (exp(-ang * 26.0) * 0.9 + exp(-ang * 7.0) * 0.35);
          float lowDim = mix(1.0, 0.16, lowS);                               // through a long path of dust the sun is a pale disc
          float through = (1.0 - uDust * 0.90) * smoothstep(-0.03, 0.03, sunE);
          vec3 sunCol = mix(vec3(1.0, 0.93, 0.82), vec3(0.80, 0.90, 1.0), smoothstep(0.25, 0.0, sunE) * 0.7);
          // (the low disc is held to a few times white, enough for its glow and no more: at eleven times white the bloom
          //  swallowed its edge)
          col += sunCol * (disc * mix(70.0, 26.0, lowS) * lowDim * uSunDisc * mix(1.0, 0.16, uDust) + halo * 5.0 * mix(lowDim, lowDim * 0.6, lowS) * uSunDisc) * through;
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -1000;
    this.mesh.name = 'sky';
    this.sunColor = new THREE.Color();
    this.ambientSky = new THREE.Color();
    this.ambientGround = new THREE.Color();
    this.fogColor = new THREE.Color();
    this.sunIntensity = 1;
    this.day = 1;
  }

  /**
   * @param {THREE.Vector3} sunDir unit, world
   * @param {THREE.Vector3} camPos world
   * @param {number} dust 0..1 local storm intensity
   * @param {number} time seconds
   */
  update(sunDir, camPos, dust, time) {
    const u = this.uniforms;
    u.uSun.value.copy(sunDir);
    u.uUp.value.copy(camPos).normalize();
    u.uAlt.value = camPos.length() - R;
    u.uDust.value = dust;
    u.uTime.value = time;
    this.mesh.position.copy(camPos);
    // Earth keeps east of the sun in this season, so it follows the sun down: an evening star (38 degrees behind it)
    u.uEarth.value.set(sunDir.x * 0.788 + sunDir.z * 0.616, sunDir.y, -sunDir.x * 0.616 + sunDir.z * 0.788).normalize();
    // the moons as seen from here (Phobos is so close that where you stand changes where it is in the sky)
    for (let i = 0; i < 2; i++) {
      const p = this.moons[i], m = (i ? u.uDeimos : u.uPhobos).value;
      _m.copy(p).multiplyScalar(R).sub(camPos).normalize();
      const along = p.dot(sunDir), off = Math.sqrt(Math.max(0, p.lengthSq() - along * along));
      // (on the title screen they are left out: one drifted across the menu and came to rest against a line of it)
      m.set(_m.x, _m.y, _m.z, this.showMoons === false ? 0 : along < 0 ? smoothstep(0.93, 1.07, off) : 1);       // behind the planet, in its shadow
    }
    // --- values the rest of the renderer needs, consistent with the shader above ----------
    const sunE = sunDir.dot(u.uUp.value);
    const day = smoothstep(-0.16, 0.10, sunE);
    const low = 1 - smoothstep(0, 0.45, sunE);
    this.day = day;
    this.sunE = sunE;
    // direct sunlight: fades through the dust near the horizon; slightly blue-white when low
    const through = smoothstep(-0.04, 0.16, sunE);
    // (A low sun is not a stronger sun. Raised to more than double at the horizon, to keep level ground lit, it lit
    //  whatever leaned toward it two and three times as brightly as the level ground beside it: a plain at dawn was
    //  dark maroon up to the first crest and bright orange beyond, along one line. Through that much dust most of the
    //  light at dawn is the sky's, and the sky's share is raised instead (see the engine's environment light).)
    this.sunIntensity = 3.3 * through * (1 + 0.3 * low * low) * (1 - dust * 0.94);
    this.lowSun = low * low * day;
    // (Low, its light is warm: what reaches the ground has come through the most dust, and the dust takes the blue
    //  out of it and throws it forward as the glow round the disc. It was a cool white at the horizon, and a plain at
    //  dawn took no colour from its own sunrise.)
    this.sunColor.setRGB(1.0, lerp(0.93, 0.74, low * low), lerp(0.80, 0.50, low * low));
    // sky light: the dome's average colour above, the lit ground's bounce below
    const k = 0.90 * day, nk = 1 - day;
    this.ambientSky.setRGB(lerp(0.52, 0.24, low) * k + 0.019 * nk, lerp(0.32, 0.18, low) * k + 0.022 * nk, lerp(0.16, 0.15, low) * k + 0.032 * nk);
    this.ambientGround.setRGB(0.30 * k * (0.3 + 0.7 * through), 0.15 * k * (0.3 + 0.7 * through), 0.08 * k * (0.3 + 0.7 * through));
    this.fogColor.setRGB(lerp(0.76, 0.37, low) * k + 0.026 * nk, lerp(0.47, 0.255, low) * k + 0.029 * nk, lerp(0.235, 0.205, low) * k + 0.040 * nk);
    if (dust > 0) {
      _c.setRGB(0.40 * (0.02 + 0.40 * day), 0.215 * (0.02 + 0.40 * day), 0.095 * (0.02 + 0.40 * day));
      this.fogColor.lerp(_c, dust * 0.94);
      this.ambientSky.lerp(_c, dust * 0.85);
    }
    u.uFogCol.value.copy(this.fogColor);
    const space = 1 - Math.exp(-Math.max(u.uAlt.value, 0) / ATMO_H);
    this.space = space;
    this.fogColor.multiplyScalar(1 - space * 0.85);
  }
}
export { ATMO_H };
