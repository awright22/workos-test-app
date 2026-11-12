// Fetch and decode the planet's data files: elevation (binary) and the colour cube map (JPEG atlas).
import * as THREE from 'three';
import { decodeHeightFile, Planet } from './height.js';

/** Base URL of the game's files, wherever the bundle is served from. */
export const BASE = new URL('.', import.meta.url);
export const asset = (path) => new URL(path, BASE).href;

async function fetchBytes(url, onProgress) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${url} (${res.status})`);
  const total = Number(res.headers.get('content-length')) || 0;
  if (!res.body || !total) { const b = await res.arrayBuffer(); if (onProgress) onProgress(1); return b; }
  const reader = res.body.getReader();
  const out = new Uint8Array(total);
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (got + value.length > out.length) {             // server lied about the length: fall back
      const grown = new Uint8Array(got + value.length);
      grown.set(out.subarray(0, got)); grown.set(value, got);
      const rest = new Uint8Array(await new Response(reader.stream ? reader.stream : res.body).arrayBuffer().catch(() => new ArrayBuffer(0)));
      const all = new Uint8Array(grown.length + rest.length);
      all.set(grown); all.set(rest, grown.length);
      return all.buffer;
    }
    out.set(value, got);
    got += value.length;
    if (onProgress) onProgress(got / total);
  }
  return out.buffer.slice(0, got);
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${url}`));
    img.src = url;
  });
}

/** Split the 3 x 2 atlas into the six faces of a cube map (+X, -X, +Y, -Y, +Z, -Z). */
function atlasToCube(img, maxFace) {
  const n = img.naturalWidth / 3;
  const size = Math.min(n, maxFace || n);
  const faces = [];
  for (let i = 0; i < 6; i++) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    c.getContext('2d').drawImage(img, (i % 3) * n, Math.floor(i / 3) * n, n, n, 0, 0, size, size);
    faces.push(c);
  }
  const tex = new THREE.CubeTexture(faces);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

/**
 * @param {(fraction:number, label:string)=>void} onProgress
 * @param {{maxColorFace?:number}} [o]
 */
export async function loadPlanet(onProgress, o = {}) {
  const report = (f, label) => { if (onProgress) onProgress(f, label); };
  const imgPromise = loadImage(asset('assets/mars/color.jpg'));
  const buf = await fetchBytes(asset('assets/mars/height.bin'), (f) => report(f * 0.8, 'Receiving orbital survey'));
  report(0.82, 'Unpacking elevation');
  await new Promise((r) => setTimeout(r, 0));
  const heightData = decodeHeightFile(buf);
  const planet = new Planet(heightData);
  report(0.9, 'Loading colour survey');
  const img = await imgPromise;
  const albedoCube = atlasToCube(img, o.maxColorFace);
  report(1, 'Ready');
  return { planet, heightData, albedoCube };
}
