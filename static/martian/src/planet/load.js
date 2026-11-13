// Fetch and decode the planet's data files: elevation (binary) and the colour cube map (JPEG atlas).
import * as THREE from 'three';
import { decodeHeightFile, Planet } from './height.js';

/** Base URL of the game's files, wherever the bundle is served from. */
export const BASE = new URL('.', import.meta.url);
export const asset = (path) => new URL(path, BASE).href;

/**
 * Download a file as bytes, reporting progress.
 *
 * The length a server states is the length on the wire. A host that compresses the file (GitHub Pages does) states
 * the compressed length, and the bytes that arrive here, uncompressed, are more than that. So the stated length is
 * used for the progress bar and for nothing else: the pieces are kept as they come and joined at the end.
 * (An earlier version filled a buffer of the stated length, and when the file overran it tried to read the rest of
 * a download it had already begun reading. Safari refuses that outright, "Input body is disturbed", and the game
 * could not start on an iPhone from the published site, though it ran everywhere it was tested.)
 */
async function fetchBytes(url, onProgress) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${url} (${res.status})`);
  const total = Number(res.headers.get('content-length')) || 0;
  if (!res.body || typeof res.body.getReader !== 'function') { const b = await res.arrayBuffer(); if (onProgress) onProgress(1); return b; }
  const reader = res.body.getReader();
  const parts = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value || !value.length) continue;
    parts.push(value);
    got += value.length;
    // (never "done" before it is: a compressed file passes its stated length well before its end)
    if (onProgress && total) onProgress(Math.min(0.98, got / total));
  }
  const out = new Uint8Array(got);
  let at = 0;
  for (const part of parts) { out.set(part, at); at += part.length; }
  if (onProgress) onProgress(1);
  return out.buffer;
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
