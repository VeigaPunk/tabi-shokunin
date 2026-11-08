#!/usr/bin/env node
// Rerun the two mutants whose first form failed the honest receipt (same() over a reduced object is
// stricter, not weaker). Replaces their entries in sweep-results.json with the fixed weakenings.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

const S = '/fast/scratch/hyaku/tabi-r83/R83Mut1';
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const COUNTER = path.join(LANE, 'scripts/check-showpicker-r83.mjs');
const BATTERY = path.join(LANE, 'scripts/negatives-showpicker-r83.mjs');
const REAL = path.join(LANE, 'corpus/evidence/round83/chromium-showpicker/receipt.json');
const PRIOR_SET = path.join(LANE, '.ufo/waves/round-83/controls/c1/prior-set.txt');
const rec = JSON.parse(fs.readFileSync(REAL, 'utf8'));
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const src = fs.readFileSync(COUNTER, 'utf8');
const batterySrc = fs.readFileSync(BATTERY, 'utf8');
const grab = (f) => { const s = fs.readFileSync(f, 'utf8'); const a = s.indexOf('const MUTANTS = ['); const b = s.indexOf('\n];', a); return Function('return ' + s.slice(a + 'const MUTANTS = '.length, b + 2))(); };
const MUTANTS = grab(path.join(S, 'run-mutants.mjs'));
const names = ['dismiss-nocancel-unchecked'];
const sweep = JSON.parse(fs.readFileSync(path.join(S, 'sweep-results.json'), 'utf8'));

const runOne = ([name, from, to]) => new Promise((resolve) => {
  const idx = sweep.results.findIndex((r) => r.name === name);
  const id = sweep.results[idx].id;
  const dir = path.join(S, 'mut-' + id + '-fix');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const mutated = src.replace(from, to);
  fs.writeFileSync(path.join(dir, 'check-showpicker-r83.mjs'), mutated);
  fs.copyFileSync(BATTERY, path.join(dir, 'negatives-showpicker-r83.mjs'));
  const child = spawn(process.execPath, [path.join(dir, 'negatives-showpicker-r83.mjs'), '--lane', LANE, '--real', REAL,
    '--expect-driver-sha256', rec.driverSha256, '--expect-nonce', rec.nonce, '--expect-fixture-sha256', rec.fixture.sha256,
    '--prior-set', PRIOR_SET, '--work', path.join(dir, 'work'), '--json'], { stdio: ['ignore', 'pipe', 'pipe'] });
  let out = '', err = '';
  child.stdout.on('data', (d) => { out += d; });
  child.stderr.on('data', (d) => { err += d; });
  child.on('close', (code) => {
    let j = null; try { j = JSON.parse(out); } catch { j = null; }
    const base = { id, name, mutation: { from, to }, mutatedSha256: sha256(mutated), batteryExit: code };
    let resolved;
    if (code === 0 && j && j.failed === 0) resolved = { ...base, outcome: 'survived', survivorReason: MUTANTS.find((m) => m[0] === name)[3], battery: { cases: j.cases, failed: j.failed, coverage: j.coverage } };
    else if (code === 1 && j) resolved = { ...base, outcome: 'killed', battery: { cases: j.cases, failed: j.failed, coverage: j.coverage, firstFailures: (j.results || []).filter((x) => !x.ok).slice(0, 4).map((x) => ({ case: x.case, expect: x.expect, detail: String(x.detail).slice(0, 240) })) } };
    else resolved = { ...base, outcome: j ? 'killed-unexpected-exit' : 'crashed', stderr: (err || out).slice(0, 500), battery: j };
    fs.rmSync(dir, { recursive: true, force: true });
    resolve(resolved);
  });
});

const rerun = [];
for (const nm of names) { const m = MUTANTS.find((x) => x[0] === nm); rerun.push(await runOne(m)); }
for (const r of rerun) { const i = sweep.results.findIndex((x) => x.id === r.id); sweep.results[i] = r; }
const count = (o) => sweep.results.filter((r) => r.outcome === o).length;
sweep.survived = count('survived'); sweep.killed = count('killed'); sweep.crashed = count('crashed'); sweep.killedUnexpectedExit = count('killed-unexpected-exit');
sweep.survivors = sweep.results.filter((r) => r.outcome === 'survived').map((r) => ({ id: r.id, name: r.name, mutation: r.mutation, reason: r.survivorReason, coverage: r.battery.coverage }));
fs.writeFileSync(path.join(S, 'sweep-results.json'), JSON.stringify(sweep, null, 1));
console.log(JSON.stringify({ rerun: rerun.map((r) => [r.id, r.name, r.outcome, r.batteryExit]), counts: { survived: sweep.survived, killed: sweep.killed, crashed: sweep.crashed } }, null, 1));
