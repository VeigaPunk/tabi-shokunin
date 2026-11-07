// Finalize: baseline on the pinned receipt (mirror lane carrying an exempted copy), merge the
// mutant results with the subsumption probes, classify every survivor, and emit the deliverables.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
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
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

// ---- baseline lane: the pinned receipt is inside the walked tree so the content-bound exemption resolves
const BASE_LANE = path.join(WORK, 'baseline-lane', 'tabi-shokunin');
fs.rmSync(BASE_LANE, { recursive: true, force: true });
for (const t of ['.ufo/waves/round-79', 'corpus/evidence/round79']) fs.mkdirSync(path.join(BASE_LANE, t), { recursive: true });
fs.cpSync(path.join(LANE, '.ufo/waves/round-79/controls/c1'), path.join(BASE_LANE, '.ufo/waves/round-79/controls/c1'), { recursive: true });
fs.copyFileSync(RECEIPT, path.join(BASE_LANE, '.ufo/waves/round-79/receipt-copy.json'));

const parse = (s) => { try { return JSON.parse(s); } catch { return null; } };
const b = spawnSync(process.execPath, [BATTERY, '--lane', BASE_LANE, '--real', RECEIPT, '--expect-driver-sha256', PIN,
  '--expect-nonce', NONCE, '--expect-fixture-sha256', FIXTURE, '--prior-set', PRIOR_SET, '--work', path.join(WORK, 'baseline-work'), '--json'],
{ encoding: 'utf8', timeout: 600000 });
const baseline = parse(b.stdout);
const baselineRec = baseline ? {
  exit: b.status, cases: baseline.cases, passed: baseline.passed, failed: baseline.failed,
  coverage: baseline.coverage, unbracketed: baseline.unbracketed,
} : { exit: b.status, stdout: b.stdout.slice(0, 400), stderr: b.stderr.slice(0, 400) };

// ---- battery case -> expected id map (static, from the battery source) ----
const batSrc = fs.readFileSync(BATTERY, 'utf8');
const caseMap = {};
for (const m of batSrc.matchAll(/\b(?:add|accept)\('([^']+)'(?:, '([^']+)')?/g)) {
  const [, name, expect] = m;
  if (!expect) continue;
  (caseMap[expect] = caseMap[expect] || []).push(name);
}

// ---- merge ----
const results = JSON.parse(fs.readFileSync(path.join(HERE, 'results.json'), 'utf8'));
const probes = JSON.parse(fs.readFileSync(path.join(HERE, 'probes.json'), 'utf8'));

const SUBSUMED = {
  'marks-min-count-widened': { kind: 'subsumed', by: ['leg-marks'], note: 'a 2-mark array cannot satisfy the marks[1]==="pre" AND last==="settle" name conjuncts, so the count conjunct is unreachable as a sole cause' },
  'plan-click-release-dropped': { kind: 'subsumed', by: ['plan-calls'], note: 'the same rule\'s :click-trigger-id line also requires priorReleaseId === null, so the :click-ids conjunct is redundant' },
  'plan-trigger2-order-dropped': { kind: 'unreachable', by: ['plan-calls'], note: 't2 is the SECOND wrapper occurrence in a 1..N-id log, so t2.id > triggerSendId always; the <= conjunct can never be the sole cause' },
  'plan-unknown-leg-skipped': { kind: 'subsumed', by: ['plan-frozen', 'leg-order', 'leg-records'], note: 'a leg not in the frozen plan cannot pass the plan/order/name checks' },
  'cdp-mode-enum-dropped': { kind: 'subsumed', by: ['mode-law', 'leg-sp-<name>'], note: 'mode-law compares the event mode to the page-measured descriptor' },
  'typed-seq-loosened': { kind: 'subsumed', by: ['seq-monotonic'], note: 'seq must equal i+1, which is an integer' },
  'typed-act-dropped': { kind: 'subsumed', by: ['leg-sp-<name>'], note: 'the per-leg frozen shape carries the act column' },
  'typed-files-dropped': { kind: 'subsumed', by: ['leg-sp-<name>', 'no-selection-law'], note: 'the leg shape files column and the no-selection rule both read files' },
  'typed-istrusted-dropped': { kind: 'subsumed', by: ['leg-sp-<name>', 'trust-law'], note: 'the leg shape trusted column and trust-law require isTrusted === true' },
  'gesture-unknown-leg-skipped': { kind: 'subsumed', by: ['plan-frozen', 'leg-order', 'leg-records'], note: 'an unknown leg cannot pass the frozen plan/order/name checks' },
  'consumption-first-ok-dropped': { kind: 'subsumed', by: ['gesture-law'], note: 'SP_LAW for sp-show-twice already requires the first call to succeed' },
  'immutable-open-count-dropped': { kind: 'subsumed', by: ['leg-sp-disabled', 'intercept-law'], note: 'the leg shape opened column and intercept-law both require zero chooser events on a refused leg' },
  'mode-law-missing-descriptor-ok': { kind: 'subsumed', by: ['fixture-descriptors'], note: 'fixtureInputs must equal the frozen descriptors, so a target descriptor cannot be missing' },
  'no-selection-svalue-dropped': { kind: 'subsumed', by: ['leg-sp-<name>'], note: 'the per-leg frozen shape state carries sValue' },
  'intercept-open-count-loosened': { kind: 'subsumed', by: ['leg-sp-<name>', 'cdp-event-log-closed'], note: 'the leg shape opened column and the multi-open rule both bound the count' },
  'dismiss-cancel-events-dropped': { kind: 'subsumed', by: ['cancel-law', 'leg-sp-<name>'], note: 'cancel-law pins the exact cancel list and the leg shape records the cancel event' },
  'trust-nonempty-dropped': { kind: 'subsumed', by: ['leg-sp-<name>', 'event-types'], note: 'the frozen leg shapes require their event sequences, so an empty log cannot pass' },
  'argv-token-regex-loosened': { kind: 'subsumed', by: ['replay-launch-token'], note: 'replay-launch-token carries its own /^[0-9a-f]{12}$/ on the same field' },
  'replay-frac-loosened': { kind: 'inert-prior-set', by: ['replay-event-timeline'], note: 'all four frozen priors carry 37 events: ceil(0.49*37)=19=ceil(0.5*37); the fraction is unbracketable until a prior has >= 100 events' },
  'replay-gapfrac-loosened': { kind: 'inert-prior-set', by: ['replay-event-timeline'], note: 'all four frozen priors carry 1 gap: ceil(0.7*1)=1=ceil(0.75*1); the fraction is unbracketable until a prior has >= 7 gaps' },
};

const out = [];
for (const rec of results.results) {
  const m = MUTANTS.find((x) => x.id === rec.id);
  const w = rec.witness || {};
  const sub = SUBSUMED[rec.id];
  const cls = w.kills ? 'witness-killed' : (sub ? sub.kind : (w.available ? 'unseparated' : 'unseparated'));
  const probe = probes[rec.id] || null;
  out.push({
    id: rec.id,
    rule: rec.rule,
    weakening: rec.weakening,
    mutation: { from: rec.from, to: rec.to },
    mutantSha256: rec.mutantSha256,
    syntaxOk: rec.syntaxOk,
    battery: { exit: rec.battery && rec.battery.exit, cases: rec.battery && rec.battery.cases, failed: rec.battery && rec.battery.failed, coverage: rec.battery && rec.battery.coverage },
    outcome: rec.outcome,
    batteryCasesForRule: caseMap[rec.rule] || [],
    classification: cls,
    witness: w.available ? { desc: w.desc, pristine: w.pristine, mutant: w.mutant, kills: w.kills } : null,
    subsumedBy: sub ? sub.by : null,
    subsumptionNote: sub ? sub.note : null,
    probe: probe && probe.pristine ? { pristine: probe.pristine, mutant: probe.mutant } : null,
  });
}

const final = {
  schema: 'tabi-r79-mut-r79mut1',
  seat: 'R79Mut1',
  assignment: 'independent semantic mutants of scripts/check-showpicker-r79.mjs beyond the frozen 70',
  lane: LANE,
  base: '24c821895f31f9dcb66ac2f357bc947818b0408c',
  digestsCommit: '80830674d421e97bb1c01c836bfbb3dc49687dbc',
  counter: { path: 'scripts/check-showpicker-r79.mjs', sha256: sha256(fs.readFileSync(SRC)) },
  battery: { path: 'scripts/negatives-showpicker-r79.mjs', sha256: sha256(fs.readFileSync(BATTERY)) },
  receipt: {
    pinnedCopy: 'receipt-sweep.json (object copy preserved by the battery\'s honest case at sweep time)',
    nonce: NONCE, legs: 10, pageEvents: 37, fixtureSha256: FIXTURE,
    note: 'the live corpus/evidence/round79/chromium-showpicker/receipt.json was being rewritten by another seat\'s scored run during this probe; every result here is bound to the pinned copy (nonce tabi-r79-l1-80830674d421, 10 legs, 37 events)',
  },
  baseline,
  counts: {
    mutants: out.length, applied: out.length, killed: out.filter((x) => x.outcome === 'killed').length,
    survived: out.filter((x) => x.outcome === 'survived').length,
    crashed: out.filter((x) => x.outcome === 'crashed').length,
    witnessKilled: out.filter((x) => x.classification === 'witness-killed').length,
    subsumed: out.filter((x) => x.classification === 'subsumed').length,
    unreachable: out.filter((x) => x.classification === 'unreachable').length,
    inertPriorSet: out.filter((x) => x.classification === 'inert-prior-set').length,
  },
  routedDefects: out.filter((x) => x.classification === 'inert-prior-set' || x.classification === 'unreachable'),
  mutants: out,
};
fs.writeFileSync(path.join(HERE, 'final.json'), JSON.stringify(final, null, 1));
process.stdout.write(JSON.stringify({ baseline: { exit: baselineRec.exit, cases: baselineRec.cases, passed: baselineRec.passed, failed: baselineRec.failed, uncovered: baselineRec.coverage && baselineRec.coverage.uncovered }, counts: final.counts }, null, 1) + '\n');
