#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const pins = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const dom = readFileSync(process.argv[3]);
const png = readFileSync(process.argv[4]);
const digest = createHash('sha256').update(dom).digest('hex');
if (digest !== pins.domSha256) {
  console.error(`DOM_MISMATCH expected=${pins.domSha256} actual=${digest}`);
  process.exit(1);
}
if (png.length < 100 || png.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
  console.error('PNG_MISSING');
  process.exit(1);
}
console.log(`PIN_MATCH dom=${digest} png_bytes=${png.length}`);
