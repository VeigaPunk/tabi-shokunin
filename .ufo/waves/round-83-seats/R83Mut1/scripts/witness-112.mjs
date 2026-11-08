#!/usr/bin/env node
// Lane-scoped witness for unparsable-brace-heuristic-dropped: a scratch MIRROR lane is required
// because the walked tree must be mutated, and the real lane is read-only.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const S = '/fast/scratch/hyaku/tabi-r83/R83Mut1';
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const COUNTER = path.join(LANE, 'scripts/check-showpicker-r83.mjs');
const REAL = path.join(LANE, 'corpus/evidence/round83/chromium-showpicker/receipt.json');
const PRIOR_SET = path.join(LANE, '.ufo/waves/round-83/controls/c1/prior-set.txt');
const rec = JSON.parse(fs.readFileSync(REAL, 'utf8'));
const src = fs.readFileSync(COUNTER, 'utf8');
const grab = (f) => { const s = fs.readFileSync(f, 'utf8'); const a = s.indexOf('const MUTANTS = ['); const b = s.indexOf('\n];', a); return Function('return ' + s.slice(a + 'const MUTANTS = '.length, b + 2))(); };
const m = grab(path.join(S, 'run-mutants.mjs')).find((x) => x[0] === 'unparsable-brace-heuristic-dropped');

const mirror = path.join(S, 'mirror-witness', 'tabi-shokunin');
fs.rmSync(path.join(S, 'mirror-witness'), { recursive: true, force: true });
for (const t of ['.ufo/waves/round-83', 'corpus/evidence/round83']) fs.mkdirSync(path.join(mirror, t), { recursive: true });
fs.cpSync(path.join(LANE, '.ufo/waves/round-83/controls'), path.join(mirror, '.ufo/waves/round-83/controls'), { recursive: true });
fs.writeFileSync(path.join(mirror, '.ufo/waves/round-83/corrupt.txt'), '{"schema": "tabi-chrome-cdp-showpicker-r83", broken\n');
const receiptPath = path.join(S, 'witness-receipts', 'unparsable.json');
fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
fs.writeFileSync(receiptPath, JSON.stringify(rec));
const mdir = path.join(S, 'witness-counters', 'unparsable-brace-heuristic-dropped');
fs.mkdirSync(mdir, { recursive: true });
const mpath = path.join(mdir, 'check-showpicker-r83.mjs');
fs.writeFileSync(mpath, src.replace(m[1], m[2]));

const run = (counter) => {
  const r = spawnSync(process.execPath, [counter, '--lane', mirror, '--receipt', receiptPath,
    '--expect-driver-sha256', rec.driverSha256, '--expect-nonce', rec.nonce,
    '--expect-fixture-sha256', rec.fixture.sha256, '--prior-set', PRIOR_SET, '--json'], { encoding: 'utf8', timeout: 60000 });
  let j = null; try { j = JSON.parse(r.stdout); } catch { j = null; }
  return { status: r.status, verdict: j && j.verdict, findings: j && j.findings ? j.findings.map((f) => f.id) : null, stderr: (r.stderr || '').slice(0, 300) };
};
const pristine = run(COUNTER), mutant = run(mpath);
const classification = pristine.status === 1 && mutant.status === 0 ? 'behavioral-escape' : pristine.status === 1 && mutant.status === 1 ? 'redundant-conjunct' : 'unexpected';
const out = { name: 'unparsable-brace-heuristic-dropped', mirror, corrupt: '.ufo/waves/round-83/corrupt.txt', classification, pristine, mutant };
fs.writeFileSync(path.join(S, 'witness-results-112.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
