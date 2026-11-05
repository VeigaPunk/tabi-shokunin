import fs from 'node:fs';
import crypto from 'node:crypto';
import { decode } from '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-67/counters/png-r67.mjs';
const img = decode(fs.readFileSync('/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-67/measure/smoke2/start.png'));
const px = img.pixels; const W = img.width;
console.log('size', img.width, img.height, 'channels?', Object.keys(img));
const get = (x, y) => { const i = (y * W + x) * (px.length / (W * img.height)); return Array.from(px.subarray ? px.subarray(i, i + 3) : px.slice(i, i + 3)); };
const d = crypto.createHash('sha256').update('tabi-r67-smoke-two', 'utf8').digest().subarray(0, 32);
const bits = [...d].flatMap((b) => Array.from({ length: 8 }, (_, k) => (b >> (7 - k)) & 1));
let on = 0, sampled = []; let distinct = new Set();
for (let r = 0; r < 8; r++) for (let c = 0; c < 32; c++) { const p = get(8 + c * 4 + 2, 8 + r * 4 + 2); distinct.add(p.join(',')); if (bits[r * 32 + c]) { on++; if (sampled.length < 3) sampled.push(p); } }
console.log('grid cells with bit=1:', on, 'sample colours at bit=1 cells:', JSON.stringify(sampled), 'distinct colours in grid:', [...distinct].slice(0,5));
const w = get(1000, 620); const band0 = get(60, 300); const band1 = get(180, 300);
console.log('witness start px', JSON.stringify(w), 'band0(red?)', JSON.stringify(band0), 'band1(green?)', JSON.stringify(band1));
