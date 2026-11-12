#!/usr/bin/env node
// Print the structure of .glb models without rendering them: nodes (with extras), meshes,
// materials, skins and animation clips.  node tools/assets/inspect.mjs <name-or-path> ...
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const models = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'static', 'martian', 'assets', 'models');
for (const arg of process.argv.slice(2)) {
  const file = existsSync(arg) ? arg : path.join(models, arg.endsWith('.glb') ? arg : arg + '.glb');
  const buf = readFileSync(file);
  const jsonLen = buf.readUInt32LE(12);
  const j = JSON.parse(buf.subarray(20, 20 + jsonLen).toString('utf8'));
  const nodes = j.nodes || [];
  const fmt = (n) => n.name + (n.mesh !== undefined ? '*' : '') + (n.extras ? JSON.stringify(n.extras) : '');
  const bones = new Set((j.skins || []).flatMap((s) => s.joints));
  console.log(`\n${path.basename(file)}  ${(buf.length / 1024).toFixed(0)} kB  nodes ${nodes.length}  meshes ${(j.meshes || []).length}  materials ${(j.materials || []).length}`);
  console.log('  parts/anchors:', nodes.filter((n, i) => n.name && !bones.has(i) && !/_mesh$|^mesh_/.test(n.name)).map(fmt).join(', '));
  if (bones.size) console.log('  bones:', [...bones].map((i) => nodes[i].name).join(', '));
  console.log('  materials:', (j.materials || []).map((m) => m.name).join(', '));
  if (j.animations) console.log('  clips:', j.animations.map((a) => a.name).join(', '));
}
