#!/usr/bin/env node
// Declared negatives for the round-67 counter: one per named check. Each
// negative mutates exactly one field (or one pixel) of the scored receipt and
// must be refused by the production CLI with that check's id. The mutation map
// is the counter's exported `forge`, so the declaration and the selftest cannot
// drift; the wave's independent negative seat is the independent attack.
//
// Usage: node make-negatives-r67.mjs --receipt <r.json> --shot <dir> --driver <path>
//   --counter <path> --out <dir> [--json]
// Writes <out>/<check-id>/{receipt.json, *.png} and <out>/matrix.json.
// forgedGreen counts negatives the counter ACCEPTED (exit 0); it must be 0.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { decode, encode } from './png-r67.mjs';

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const argv = process.argv.slice(2);
const flags = new Map();
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) { const n = argv[i + 1]; if (n && !n.startsWith('--')) { flags.set(argv[i].slice(2), n); i++; } else flags.set(argv[i].slice(2), true); }
}
const opt = (n) => (flags.get(n) === true ? null : flags.get(n) || null);
const need = ['receipt', 'shot', 'driver', 'counter', 'out'];
for (const k of need) if (!opt(k)) { console.log(JSON.stringify({ error: 'usage', detail: 'missing --' + k })); process.exit(2); }
const receiptPath = path.resolve(opt('receipt'));
const shotDir = path.resolve(opt('shot'));
const driverPath = path.resolve(opt('driver'));
const counterPath = path.resolve(opt('counter'));
const outDir = path.resolve(opt('out'));
fs.mkdirSync(outDir, { recursive: true });

const counter = await import(pathToFileURL(counterPath).href);
const driverSha = sha(fs.readFileSync(driverPath));
const base = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));

function loadShots(receipt) {
  const shots = {};
  for (const leg of receipt.legs || []) {
    const buf = fs.readFileSync(path.join(shotDir, leg.shot));
    const d = decode(buf);
    shots[leg.name] = { sha256: sha(buf), bytes: buf.length, width: d.width, height: d.height, pixel: (x, y) => d.pixel(x, y), pixels: d.pixels };
  }
  return shots;
}

const rows = [];
for (const id of counter.CHECK_IDS) {
  const r = JSON.parse(JSON.stringify(base));
  const shots = loadShots(base);
  const expect = counter.forge(id, r, shots);
  const dir = path.join(outDir, id);
  fs.mkdirSync(dir, { recursive: true });
  const pristineShas = base.legs.map((l) => l.shotSha256);
  for (const [i, leg] of r.legs.entries()) {
    const s = shots[base.legs[i]?.name] || shots[leg.name];
    const buf = s && s.pixels ? encode({ width: s.width, height: s.height, pixels: s.pixels }) : null;
    if (!buf) throw new Error('shot lost in negative ' + id + '/' + leg.name);
    fs.writeFileSync(path.join(dir, leg.shot), buf);
    const d = decode(buf);
    // A negative that deliberately lies about the digest keeps its lie; every
    // other leg is re-bound to the bytes actually written.
    const lied = leg.shotSha256 !== pristineShas[i];
    if (!lied) { leg.shotSha256 = sha(buf); leg.shotBytes = buf.length; }
    shots[leg.name] = { sha256: sha(buf), bytes: buf.length, width: d.width, height: d.height, pixel: (x, y) => d.pixel(x, y), pixels: d.pixels };
  }
  fs.writeFileSync(path.join(dir, 'receipt.json'), JSON.stringify(r, null, 1));
  const run = spawnSync('node', [counterPath, path.join(dir, 'receipt.json'), '--driver', driverPath,
    '--expect-driver-sha256', driverSha, '--shot', dir, '--json'], { encoding: 'utf8', timeout: 120000 });
  let parsed = null;
  try { parsed = JSON.parse(run.stdout); } catch {}
  rows.push({
    id, expect, exit: run.status,
    findings: parsed?.findings ?? null,
    ok: run.status === 1 && Array.isArray(parsed?.findings) && parsed.findings.includes(expect),
    stderr: (run.stderr || '').slice(0, 400),
  });
}
const forgedGreen = rows.filter((x) => x.exit === 0).length;
const matrix = {
  schema: 'tabi-r67-negatives-v1',
  input: { path: receiptPath, sha256: sha(fs.readFileSync(receiptPath)) },
  shotDir, driverSha256: driverSha, counter: counterPath,
  negatives: rows.length, refused: rows.filter((x) => x.ok).length,
  forgedGreen, rows,
};
fs.writeFileSync(path.join(outDir, 'matrix.json'), JSON.stringify(matrix, null, 1));
if (flags.has('json')) console.log(JSON.stringify(matrix, null, 1));
else console.log('TABI_R67_NEGATIVES negatives=' + matrix.negatives + ' refused=' + matrix.refused + ' forgedGreen=' + forgedGreen);
process.exitCode = forgedGreen === 0 && matrix.refused === matrix.negatives ? 0 : 1;
