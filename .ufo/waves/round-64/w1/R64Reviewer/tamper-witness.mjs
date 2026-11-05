// tamper-witness.mjs — build the exact receipt the pristine counter refuses on
// leg-witness (witness pixel repainted), to show the weakened copy accepts it.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { encode, decode } from '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-64/counters/png-r64.mjs';
import { forge } from '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-64/counters/chromium-wheel-r64.mjs';
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const [inDir, outDir, counterPath] = process.argv.slice(2);
const r = JSON.parse(fs.readFileSync(path.join(inDir, 'receipt.json'), 'utf8'));
const shots = {};
for (const leg of r.legs) {
  const buf = fs.readFileSync(path.join(inDir, leg.shot));
  const d = decode(buf);
  shots[leg.name] = { sha256: sha(buf), bytes: buf.length, width: d.width, height: d.height, pixel: (x, y) => d.pixel(x, y), pixels: d.pixels };
}
const expect = forge('leg-witness', r, shots);
fs.mkdirSync(outDir, { recursive: true });
for (const leg of r.legs) {
  const s = shots[leg.name];
  const buf = encode({ width: s.width, height: s.height, pixels: s.pixels });
  fs.writeFileSync(path.join(outDir, leg.shot), buf);
  leg.shotSha256 = sha(buf); leg.shotBytes = buf.length;
}
fs.writeFileSync(path.join(outDir, 'receipt.json'), JSON.stringify(r, null, 1));
console.log(JSON.stringify({ expect, note: 'released witness pixel at (1000,625) repainted [0,0,0]' }));
