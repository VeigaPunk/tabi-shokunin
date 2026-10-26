import { readFileSync } from 'node:fs';
const [pinsPath, srcPath] = process.argv.slice(2);
const pins = JSON.parse(readFileSync(pinsPath, 'utf8'));
const src = readFileSync(srcPath, 'utf8');
const block = src.match(/const PINS = Object\.freeze\(\{([\s\S]*?)\}\);/)[1];
const emb = {};
for (const m of block.matchAll(/'?([\w-]+)'?\s*:\s*'([0-9a-f]{40})'/g)) emb[m[1]] = m[2];
const keys = new Set([...Object.keys(pins), ...Object.keys(emb)]);
let bad = 0;
for (const k of keys) if (pins[k] !== emb[k]) { console.log('MISMATCH', k, pins[k], emb[k]); bad += 1; }
console.log(bad ? `PINS DIFFER (${bad})` : `PINS IDENTICAL, ${Object.keys(emb).length} lanes`);
process.exit(bad ? 1 : 0);
