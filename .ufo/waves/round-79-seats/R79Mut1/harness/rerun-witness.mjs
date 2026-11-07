// Re-run the witness phase against the already-built mutant counters, then rewrite results.json.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { WITNESSES } from './witness.mjs';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const SRC = path.join(HERE, 'base', 'check-showpicker-r79.mjs');
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const RECEIPT = path.join(HERE, 'receipt-sweep.json'); // pinned sweep-time bytes (the live receipt is being rewritten by another seat)
const PRIOR_SET = path.join(LANE, '.ufo/waves/round-79/controls/c1/prior-set.txt');
const PIN = 'e9c87159e5d5212237437eb7a80a2d26fcd8086603dae1e37db64ce1aaf94933';
const NONCE = 'tabi-r79-l1-80830674d421';
const FIXTURE = '2e80efa0c96d4c3ccc952d9b54353d8c079e6c9156abbc3d78dfd38d0bc5c5c8';
const WORK = path.join(HERE, 'runs');
const MIRROR = path.join(WORK, 'lane', 'tabi-shokunin');
fs.rmSync(MIRROR, { recursive: true, force: true });
for (const t of ['.ufo/waves/round-79', 'corpus/evidence/round79']) fs.mkdirSync(path.join(MIRROR, t), { recursive: true });
fs.cpSync(path.join(LANE, '.ufo/waves/round-79/controls/c1'), path.join(MIRROR, '.ufo/waves/round-79/controls/c1'), { recursive: true });
const results = JSON.parse(fs.readFileSync(path.join(HERE, 'results.json'), 'utf8'));
const ctx = { work: WORK, lane: LANE };
const parse = (s) => { try { return JSON.parse(s); } catch { return null; } };
const counterArgs = (counter, receipt, laneArg, nonceArg) => [counter, '--lane', laneArg, '--receipt', receipt,
  '--expect-driver-sha256', PIN, '--expect-nonce', nonceArg, '--expect-fixture-sha256', FIXTURE, '--prior-set', PRIOR_SET,
  '--json'];

const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const survivors = results.results.filter((r) => r.outcome === 'survived' && (!only || r.id === only));
for (const rec of survivors) {
  const w = WITNESSES[rec.id];
  if (!w) { rec.witness = { available: false, reason: 'no witness constructible: the rule is subsumed by another check or the mutation is arithmetically inert on the frozen priors' }; continue; }
  const r = JSON.parse(fs.readFileSync(RECEIPT, 'utf8'));
  let extra = {};
  try { extra = w.apply(r, ctx) || {}; } catch (e) { rec.witness = { available: false, reason: 'apply threw: ' + e.message }; continue; }
  const wdir = path.join(WORK, 'witness');
  fs.mkdirSync(wdir, { recursive: true });
  const wp = path.join(wdir, rec.id + '.json');
  fs.writeFileSync(wp, JSON.stringify(r, null, 1));
  const laneArg = extra.lane || MIRROR;
  const nonceArg = extra.expectNonce || NONCE;
  const p = spawnSync(process.execPath, counterArgs(SRC, wp, laneArg, nonceArg), { encoding: 'utf8', timeout: 120000 });
  const m = spawnSync(process.execPath, counterArgs(path.join(WORK, 'mut-' + rec.id, 'check-showpicker-r79.mjs'), wp, laneArg, nonceArg), { encoding: 'utf8', timeout: 120000 });
  const pj = parse(p.stdout), mj = parse(m.stdout);
  const pIds = pj ? (pj.findings || []).map((f) => f.id) : [];
  const mIds = mj ? (mj.findings || []).map((f) => f.id) : [];
  rec.witness = {
    available: true, desc: w.desc, receipt: path.relative(HERE, wp),
    pristine: { exit: p.status, verdict: pj && pj.verdict, findings: pIds, detail: pj ? (pj.findings || []).map((f) => f.detail) : (p.stderr || '').slice(0, 200) },
    mutant: { exit: m.status, verdict: mj && mj.verdict, findings: mIds, detail: mj ? (mj.findings || []).map((f) => f.detail) : (m.stderr || '').slice(0, 200) },
    kills: p.status === 1 && pIds.includes(rec.rule) && m.status === 0,
  };
  process.stderr.write('[witness ' + rec.id + '] pristine ' + p.status + ' ' + JSON.stringify(pIds) + ' mutant ' + m.status + ' ' + JSON.stringify(mIds) + '\n');
}

const by = (o) => results.results.filter((r) => r.outcome === o).length;
results.killed = by('killed'); results.survived = by('survived'); results.crashed = by('crashed'); results.unapplied = by('unapplied');
results.survivors = survivors.map((r) => ({
  id: r.id, rule: r.rule, weakening: r.weakening,
  witnessAvailable: !!(r.witness && r.witness.available),
  witnessKills: !!(r.witness && r.witness.kills),
  witness: r.witness,
}));
fs.writeFileSync(path.join(HERE, 'results.json'), JSON.stringify(results, null, 1));
const sep = results.survivors.filter((s) => s.witnessKills).length;
process.stdout.write(JSON.stringify({ survivors: results.survivors.length, separated: sep, notSeparated: results.survivors.filter((s) => !s.witnessKills).map((s) => s.id) }, null, 1) + '\n');
