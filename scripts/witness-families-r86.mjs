#!/usr/bin/env node
// Survivor-family witness runner for tabi round 86 (C2, predicate C2-FAMILYWITNESS-R86).
//
// The r84 closure's independent mutation sweep (`.ufo/waves/round-84/w1/R84Mut1.md`) left 51
// case-level survivors. Six of those families are single-conjunct weakenings of the counter's
// cross-origin law block; this runner measures, for each family, whether a battery KILLS the
// weakened counter:
//
//   * `cross-message-unpinned`        `same(childResult, CHILD_RESULT_LAW[extra])` -> ok+name only
//   * `cross-childlate-dropped`       the `ex.childLate === 0` conjunct
//   * `cross-access-dropped`          the `parentCrossAccess` binding
//   * `cross-childseq-dropped`        the child-event sequence binding
//   * `cross-childact-after-dropped`  `childActivationAfter`
//   * `cross-childact-before-dropped` `childActivationBefore`
//
// The six r86 families (`narrow-tel-*`) keep one law conjunct for the TEL leg and drop it for
// every other cross-origin leg — the tel-only witness gap R85Mut1 routed. The six r85 families
// are carried as controls.
//
// BEFORE: each family applied to the round-85 counter, scored by the frozen round-85 battery
//         (whose only cross-origin family witnesses are tel-leg cases).
// AFTER:  the same family applied to the round-86 counter, scored by the frozen round-86 battery
//         (which carries search- and text-leg witnesses).
// A family is a SURVIVOR when the battery still exits 0 (the weakened counter is not noticed) and
// KILLED when the battery exits 1 with at least one failing case.
//
// Usage:
//   node witness-families-r86.mjs --lane <ABS lane> --work <ABS scratch> [--json]
//   (the r84 counter/battery/receipt/prior-set and the r86 counterparts are read from the lane)
// Exit 0: after.survivors == 0 and before.survivors >= 1. 1: otherwise. 2: usage.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const asJson = argv.includes('--json');
const lane = opt('lane');
const work = opt('work');
if (!lane || !path.isAbsolute(lane)) { console.error(JSON.stringify({ error: 'usage', detail: '--lane must be an absolute path' })); process.exit(2); }
if (!work || !path.isAbsolute(work)) { console.error(JSON.stringify({ error: 'usage', detail: '--work must be an absolute path' })); process.exit(2); }
fs.mkdirSync(work, { recursive: true });

// The six families. Every `from` string must occur exactly once in BOTH generations' counters.
const FAMILIES = [
  ['cross-message-unpinned', "same(ex.childResult, CHILD_RESULT_LAW[extra])", "isObj(ex.childResult) && ex.childResult.ok === CHILD_RESULT_LAW[extra].ok && ex.childResult.name === CHILD_RESULT_LAW[extra].name"],
  ['cross-childlate-dropped', ' && ex.childLate === 0,', ','],
  ['cross-access-dropped', "same(ex.parentCrossAccess, { contentDocument: null, windowDocument: 'SecurityError' })", 'isObj(ex.parentCrossAccess)'],
  ['cross-childseq-dropped', "same(arr(ex.childEvents).map((e) => e.type + '@' + e.target), CHILD_EVENT_SHAPE[extra].seq)", 'arr(ex.childEvents).length === 5'],
  ['cross-childact-after-dropped', 'same(ex.childActivationAfter, CHILD_ACT_LAW[extra][1])', 'isObj(ex.childActivationAfter)'],
  ['cross-childact-before-dropped', 'same(ex.childActivationBefore, CHILD_ACT_LAW[extra][0])', 'isObj(ex.childActivationBefore)'],
  // generation r86: the tel-only CONJUNCT narrowing (R85Mut1's routed defect 3). Each family keeps
  // one law conjunct for the tel leg and drops it for every other cross-origin leg, so a battery
  // whose only conjunct witness is the tel leg cannot see it.
  ['narrow-tel-message', "same(ex.childResult, CHILD_RESULT_LAW[extra])", "(extra !== 'sp84-cross-origin-tel' || same(ex.childResult, CHILD_RESULT_LAW[extra]))"],
  ['narrow-tel-childlate', " && ex.childLate === 0,", " && (extra !== 'sp84-cross-origin-tel' || ex.childLate === 0),"],
  ['narrow-tel-crossaccess', "same(ex.parentCrossAccess, { contentDocument: null, windowDocument: 'SecurityError' })", "(extra !== 'sp84-cross-origin-tel' || same(ex.parentCrossAccess, { contentDocument: null, windowDocument: 'SecurityError' }))"],
  ['narrow-tel-childseq', "same(arr(ex.childEvents).map((e) => e.type + '@' + e.target), CHILD_EVENT_SHAPE[extra].seq)", "(extra !== 'sp84-cross-origin-tel' || same(arr(ex.childEvents).map((e) => e.type + '@' + e.target), CHILD_EVENT_SHAPE[extra].seq))"],
  ['narrow-tel-childact-after', "same(ex.childActivationAfter, CHILD_ACT_LAW[extra][1])", "(extra !== 'sp84-cross-origin-tel' || same(ex.childActivationAfter, CHILD_ACT_LAW[extra][1]))"],
  ['narrow-tel-childact-before', "same(ex.childActivationBefore, CHILD_ACT_LAW[extra][0])", "(extra !== 'sp84-cross-origin-tel' || same(ex.childActivationBefore, CHILD_ACT_LAW[extra][0]))"],
];

const gen = {
  before: {
    counter: path.join(lane, 'scripts/check-showpicker-r85.mjs'),
    battery: path.join(lane, 'scripts/negatives-showpicker-r85.mjs'),
    receipt: path.join(lane, 'corpus/evidence/round85/chromium-showpicker/receipt.json'),
    priorSet: path.join(lane, '.ufo/waves/round-85/controls/c1/prior-set.txt'),
    pin: '1690c63d14447a08ea9fe915a49d317e2953c5fb08e064e8f160a100089ab8ee',
    fixture: '0b0129377711954ddae722a7ad6db8f00f5eb94759ef45786f21b6eede3d252a',
  },
  after: {
    counter: path.join(lane, 'scripts/check-showpicker-r86.mjs'),
    battery: path.join(lane, 'scripts/negatives-showpicker-r86.mjs'),
    receipt: path.join(lane, 'corpus/evidence/round86/chromium-showpicker/receipt.json'),
    priorSet: path.join(lane, '.ufo/waves/round-86/controls/c1/prior-set.txt'),
    pin: null,
    fixture: null,
  },
};
for (const g of Object.values(gen)) {
  if (!fs.existsSync(g.counter) || !fs.existsSync(g.battery) || !fs.existsSync(g.receipt) || !fs.existsSync(g.priorSet)) {
    console.error(JSON.stringify({ error: 'setup', detail: 'missing instrument', counter: g.counter, battery: g.battery, receipt: g.receipt, priorSet: g.priorSet }));
    process.exit(2);
  }
  const rec = JSON.parse(fs.readFileSync(g.receipt, 'utf8'));
  g.baselineNonce = rec.nonce;
  g.pin = g.pin || rec.driverSha256;
  g.fixture = g.fixture || (rec.fixture && rec.fixture.sha256);
}
const src = { before: fs.readFileSync(gen.before.counter, 'utf8'), after: fs.readFileSync(gen.after.counter, 'utf8') };

const runOne = (label, generation, from, to) => new Promise((resolve) => {
  const g = gen[generation];
  const n = src[generation].split(from).length - 1;
  if (n !== 1) { resolve({ family: label, generation, outcome: 'unapplied', occurrences: n }); return; }
  const dir = path.join(work, generation, label);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, path.basename(g.counter)), src[generation].replace(from, to));
  fs.copyFileSync(g.battery, path.join(dir, path.basename(g.battery)));
  const batteryArgs = [path.join(dir, path.basename(g.battery)), '--lane', lane, '--real', g.receipt,
    '--expect-driver-sha256', g.pin, '--expect-nonce', g.baselineNonce, '--expect-fixture-sha256', g.fixture,
    '--prior-set', g.priorSet, '--work', path.join(dir, 'work'), '--json'];
  const child = spawn(process.execPath, batteryArgs, { stdio: ['ignore', 'pipe', 'pipe'] });
  let out = '', err = '';
  child.stdout.on('data', (d) => { out += d; });
  child.stderr.on('data', (d) => { err += d; });
  const timer = setTimeout(() => { try { child.kill('SIGKILL'); } catch {} }, 900000);
  child.on('close', (code) => {
    clearTimeout(timer);
    let j = null; try { j = JSON.parse(out); } catch { j = null; }
    fs.rmSync(dir, { recursive: true, force: true });
    if (code === 0) resolve({ family: label, generation, outcome: 'survived', cases: j && j.cases, failed: j && j.failed });
    else if (code === 1 && j) resolve({ family: label, generation, outcome: 'killed', failed: j && j.failed, firstFailure: j && j.results && j.results[0] && j.results[0].case });
    else resolve({ family: label, generation, outcome: 'crashed', status: code, stderr: (err || out).slice(0, 300) });
  });
});

const results = [];
for (const [label, from, to] of FAMILIES) {
  for (const generation of ['before', 'after']) results.push(await runOne(label, generation, from, to));
}
const summarize = (generation) => {
  const rows = results.filter((r) => r.generation === generation);
  return {
    families: rows.length,
    survivors: rows.filter((r) => r.outcome === 'survived').map((r) => r.family),
    killed: rows.filter((r) => r.outcome === 'killed').length,
    crashed: rows.filter((r) => r.outcome === 'crashed').map((r) => r.family),
    unapplied: rows.filter((r) => r.outcome === 'unapplied').map((r) => r.family),
  };
};
const out = { schema: 'tabi-r86-family-witness', before: summarize('before'), after: summarize('after'), results };
if (asJson) process.stdout.write(JSON.stringify(out, null, 1) + '\n');
else process.stdout.write(JSON.stringify({ before: out.before, after: out.after }, null, 1) + '\n');
process.exitCode = out.after.survivors.length === 0 && out.after.crashed.length === 0 && out.after.unapplied.length === 0 && out.before.survivors.length >= 1 ? 0 : 1;
