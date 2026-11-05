#!/usr/bin/env node
// DERIVED CONTROL, not a live result. Copies the live receipt and its six leg PNGs
// and repaints ONLY the 32x8 nonce grid so each cell equals the nonce bit (white
// for 1, black for 0), the rendering the driver's intended CSS would produce. All
// other pixels are untouched. Re-binds each leg's shotSha256/shotBytes to the new
// bytes. Purpose: a green base for the declared-negative and mutant matrices, so
// the other checks are exercised on a receipt the counter accepts. Writes only to
// --out.
// Usage: node make-grid-control.mjs --shot <liveDir> --receipt <live.json> --out <dir> --counter <path>
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const argv = process.argv.slice(2);
const opt = (n) => argv[argv.indexOf('--' + n) + 1];
const shotDir = path.resolve(opt('shot'));
const receiptPath = path.resolve(opt('receipt'));
const outDir = path.resolve(opt('out'));
const counterPath = path.resolve(opt('counter'));
fs.mkdirSync(outDir, { recursive: true });
const counter = await import(pathToFileURL(counterPath).href);
const { decode, encode } = await import(pathToFileURL(path.join(path.dirname(counterPath), 'png-r67.mjs')).href);
const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
const bits = counter.nonceBits(receipt.nonce);
for (const leg of receipt.legs) {
  const d = decode(fs.readFileSync(path.join(shotDir, leg.shot)));
  const px = Buffer.from(d.pixels);
  for (let row = 0; row < 8; row++) for (let col = 0; col < 32; col++) {
    const v = bits[row * 32 + col] ? 255 : 0;
    for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 4; dx++) {
      const x = 8 + col * 4 + dx, y = 8 + row * 4 + dy;
      const i = (y * d.width + x) * 4;
      px[i] = v; px[i + 1] = v; px[i + 2] = v; px[i + 3] = 255;
    }
  }
  const buf = encode({ width: d.width, height: d.height, pixels: px });
  fs.writeFileSync(path.join(outDir, leg.shot), buf);
  leg.shotSha256 = sha(buf);
  leg.shotBytes = buf.length;
}
receipt.derivedControl = 'nonce grid repainted to nonce bits; derived, not a live driver output';
fs.writeFileSync(path.join(outDir, 'receipt.json'), JSON.stringify(receipt, null, 1));
console.log(JSON.stringify({ control: outDir, receiptSha256: sha(fs.readFileSync(path.join(outDir, 'receipt.json'))), legs: receipt.legs.length }));
