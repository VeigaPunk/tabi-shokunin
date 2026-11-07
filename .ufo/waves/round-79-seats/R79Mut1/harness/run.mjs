// R79Mut1 runner: applies every mutant to a scratch copy of the CURRENT frozen counter, runs the
// FROZEN battery against it (the battery beside the mutant, by path), and records killed/survived.
// The receipt is the pinned sweep-time copy and the battery runs on a mirror lane that carries an
// exempted copy of it, so the sweep is immune to the live receipt being rewritten by another seat.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { MUTANTS } from './mutants.mjs';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const SRC = path.join(HERE, 'base', 'check-showpicker-r79.mjs');
const BATTERY = path.join(HERE, 'base', 'negatives-showpicker-r79.mjs');
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const RECEIPT = path.join(HERE, 'receipt-sweep.json');
const PRIOR_SET = path.join(LANE, '.ufo/waves/round-79/controls/c1/prior-set.txt');
const PIN = 'e9c87159e5d5212237437eb7a80a2d26fcd8086603dae1e37db64ce1aaf94933';
const NONCE = 'tabi-r79-l1-80830674d421';
const FIXTURE = '2e80efa0c96d4c3ccc952d9b54353d8c079e6c9156abbc3d78dfd38d0bc5c5c8';
const WORK = path.join(HERE, 'runs');
const POOL = Number(process.env.POOL || 12);
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

// mirror lane: the walked trees plus the controls and an exempted copy of the pinned receipt
const BASE_LANE = path.join(WORK, 'baseline-lane', 'tabi-shokunin');
fs.rmSync(BASE_LANE, { recursive: true, force: true });
for (const t of ['.ufo/waves/round-79', 'corpus/evidence/round79']) fs.mkdirSync(path.join(BASE_LANE, t), { recursive: true });
fs.cpSync(path.join(LANE, '.ufo/waves/round-79/controls/c1'), path.join(BASE_LANE, '.ufo/waves/round-79/controls/c1'), { recursive: true });
fs.copyFileSync(RECEIPT, path.join(BASE_LANE, '.ufo/waves/round-79/receipt-copy.json'));

const src = fs.readFileSync(SRC, 'utf8');
const run = (args) => new Promise((resolve) => {
  const p = spawn(process.execPath, args, { encoding: 'utf8' });
  let out = '', err = '';
  p.stdout.on('data', (d) => { out += d; });
  p.stderr.on('data', (d) => { err += d; });
  p.on('close', (status) => resolve({ status, stdout: out, stderr: err }));
});
const batteryArgs = (batteryPath, workDir) => [batteryPath, '--lane', BASE_LANE, '--real', RECEIPT, '--expect-driver-sha256', PIN,
  '--expect-nonce', NONCE, '--expect-fixture-sha256', FIXTURE, '--prior-set', PRIOR_SET, '--work', workDir, '--json'];
const parseJson = (s) => { try { return JSON.parse(s); } catch { return null; } };

const applied = [];
for (const m of MUTANTS) {
  if (only && m.id !== only) continue;
  const n = src.split(m.from).length - 1;
  const rec = { id: m.id, rule: m.rule, weakening: m.weakening, from: m.from, to: m.to, occurrences: n };
  if (n !== 1) { rec.outcome = 'unapplied'; rec.detail = 'from-string occurs ' + n + ' times'; applied.push(rec); continue; }
  const dir = path.join(WORK, 'mut-' + m.id);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const mutated = src.replace(m.from, m.to);
  fs.writeFileSync(path.join(dir, 'check-showpicker-r79.mjs'), mutated);
  fs.copyFileSync(BATTERY, path.join(dir, 'negatives-showpicker-r79.mjs'));
  rec.mutantSha256 = sha256(Buffer.from(mutated));
  applied.push(rec);
}

const queue = applied.filter((r) => r.occurrences === 1);
let idx = 0;
const worker = async () => {
  while (idx < queue.length) {
    const rec = queue[idx++];
    const dir = path.join(WORK, 'mut-' + rec.id);
    const res = await run(batteryArgs(path.join(dir, 'negatives-showpicker-r79.mjs'), path.join(dir, 'work')));
    const j = parseJson(res.stdout);
    rec.battery = { exit: res.status, cases: j && j.cases, passed: j && j.passed, failed: j && j.failed, coverage: j && j.coverage };
    if (res.status === 0) { rec.outcome = 'survived'; rec.detail = 'the frozen battery still exits 0 (all cases as expected)'; }
    else if (res.status === 1 && j) {
      rec.outcome = 'killed';
      rec.failingCases = (j.results || []).filter((x) => !x.ok).map((x) => ({ case: x.case, expect: x.expect, detail: x.detail }));
      rec.detail = 'battery exit 1; ' + (j.failed || 0) + ' case(s) noticed: ' + rec.failingCases.map((f) => f.case).join(',');
    } else {
      rec.outcome = 'crashed';
      rec.detail = 'battery exit ' + res.status + ' ' + (res.stderr || res.stdout || '').slice(0, 300);
    }
    process.stderr.write('[' + rec.id + '] ' + rec.outcome + '\n');
  }
};
await Promise.all(Array.from({ length: Math.min(POOL, queue.length) }, worker));

const by = (o) => applied.filter((r) => r.outcome === o).length;
const summary = {
  schema: 'tabi-r79-mut-r79mut1',
  seat: 'R79Mut1',
  lane: LANE,
  counter: { path: 'scripts/check-showpicker-r79.mjs', sha256: sha256(Buffer.from(src)) },
  battery: { path: 'scripts/negatives-showpicker-r79.mjs', sha256: sha256(fs.readFileSync(BATTERY)) },
  mutants: applied.length, killed: by('killed'), survived: by('survived'), crashed: by('crashed'), unapplied: by('unapplied'),
  results: applied,
};
fs.writeFileSync(path.join(HERE, 'results.json'), JSON.stringify(summary, null, 1));
process.stdout.write(JSON.stringify({ counterSha256: summary.counter.sha256, mutants: summary.mutants, killed: summary.killed, survived: summary.survived, crashed: summary.crashed, unapplied: summary.unapplied }, null, 1) + '\n');
