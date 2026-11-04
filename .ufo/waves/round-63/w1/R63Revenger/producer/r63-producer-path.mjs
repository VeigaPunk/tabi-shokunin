#!/usr/bin/env node
// R63Revenger part 4: is the r63 producer-verdict line distinguishable AT THE
// PRODUCTION PATH, or does the committed M1 kill depend on a helper-only path?
// Also: which receipt fields does the frozen counter never read (blind spots)?
//
// Everything is measured through the shipped CLI:
//   node <counter> <receipt> --driver <driver> --expect-driver-sha256 <pin> --shot <dir> --json
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const WAVE = path.join(LANE, '.ufo/waves/round-63/w1/R63Revenger');
const OUT = path.join(WAVE, 'producer');
const COUNTER = path.join(LANE, '.ufo/waves/round-63/counters/chromium-wheel-r63.mjs');
const COUNTER_PIN = '084705695a394256198b45c15fb7568b629e3bc750bbd46cfcb81cdb312d7178';
const DRIVER = path.join(LANE, 'scripts/chrome-cdp-loopback-round63.mjs');
const DRIVER_PIN = 'b00efd59ac10fd047014b76b2a5d16cc8b0acaab0730e8c6029a0b53a0d6c040';
const SHOTS = path.join(LANE, '.ufo/waves/round-63/controls/smoke');
const LIVE = path.join(SHOTS, 'receipt-run1.json');
const NEG = path.join(LANE, '.ufo/waves/round-63/controls/negatives');
const COMMITTED_M1 = path.join(LANE, '.ufo/waves/round-63/controls/mutants/M1-producer-and-to-or.mjs');
const PRE = "r?.predicate === true && r?.wheelHypothesis === 'CONFIRMED'";
const POST = "r?.predicate === true || r?.wheelHypothesis === 'CONFIRMED'";

const fail = (m) => { console.error(JSON.stringify({ schema: 'r63revenger-producer-v1', error: m })); process.exit(3); };
const src = fs.readFileSync(COUNTER, 'utf8');
if (sha(src) !== COUNTER_PIN) fail(`counter pin changed: ${sha(src)}`);
if (sha(fs.readFileSync(DRIVER, 'utf8')) !== DRIVER_PIN) fail('driver pin changed');

const lines = src.split('\n');
const hits = [];
lines.forEach((line, i) => {
  let from = 0;
  for (;;) { const at = line.indexOf(PRE, from); if (at < 0) break; hits.push({ line: i + 1, col: at + 1 }); from = at + 1; }
});
if (hits.length !== 1) fail(`pre-image not unique: ${JSON.stringify(hits)}`);
const { line, col } = hits[0];
const site = lines[line - 1];
const opCol = site.indexOf('&&') + 1;
const mutated = [...lines];
mutated[line - 1] = site.slice(0, col - 1) + POST + site.slice(col - 1 + PRE.length);
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.join(OUT, 'runs'), { recursive: true });
const mutantPath = path.join(OUT, 'my-M1-producer-and-to-or.mjs');
fs.writeFileSync(mutantPath, mutated.join('\n'));

const mutLines = fs.readFileSync(mutantPath, 'utf8').split('\n');
const diffLines = [];
for (let i = 0; i < Math.max(lines.length, mutLines.length); i++) if (lines[i] !== mutLines[i]) diffLines.push(i + 1);
const a = Buffer.from(site, 'utf8'), b = Buffer.from(mutLines[line - 1], 'utf8');
const byteDiffs = [];
for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) byteDiffs.push(i + 1);
if (diffLines.length !== 1 || diffLines[0] !== line || a.length !== b.length || byteDiffs.length !== 2) fail(`mutation not exact: lines=${JSON.stringify(diffLines)} bytes=${JSON.stringify(byteDiffs)}`);

const run = (counterPath, receiptPath) => {
  const r = spawnSync('node', [counterPath, receiptPath, '--driver', DRIVER, '--expect-driver-sha256', DRIVER_PIN, '--shot', SHOTS, '--json'], { encoding: 'utf8', timeout: 120000 });
  let out = null;
  try { out = JSON.parse(r.stdout); } catch { out = null; }
  return { counterPath: path.relative(LANE, counterPath), receiptPath: path.relative(LANE, receiptPath), exit: r.status, predicate: out ? out.predicate : null, findings: out ? out.findings : null, stderr: r.stderr.trim().slice(0, 300) };
};

// ---- 1. polarity negatives through the CLI, pristine vs committed M1 vs mine
const negatives = ['n1-lying-producer-true-refuted', 'n2-lying-producer-false-confirmed'];
const polarity = {};
for (const n of negatives) {
  const file = path.join(NEG, n + '.json');
  const row = { pristine: run(COUNTER, file), committedM1: run(COMMITTED_M1, file), mine: run(mutantPath, file) };
  polarity[n] = row;
  fs.writeFileSync(path.join(OUT, 'runs', n + '.json'), JSON.stringify(row, null, 1));
}
const liveRow = { pristine: run(COUNTER, LIVE), committedM1: run(COMMITTED_M1, LIVE), mine: run(mutantPath, LIVE) };
fs.writeFileSync(path.join(OUT, 'runs', 'live-smoke.json'), JSON.stringify(liveRow, null, 1));

// ---- 2. blind spots: fields the frozen counter never reads ------------------
const base = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
const tamper = (id, mutate) => {
  const r = JSON.parse(JSON.stringify(base));
  mutate(r);
  const p = path.join(OUT, id + '.json');
  fs.writeFileSync(p, JSON.stringify(r, null, 1));
  const row = run(COUNTER, p);
  fs.writeFileSync(path.join(OUT, 'runs', 'tamper-' + id + '.json'), JSON.stringify({ receipt: path.relative(LANE, p), counter: row }, null, 1));
  return row;
};
const tampered = {
  't1-ctrl-wheel-zoom': tamper('t1-ctrl-wheel-zoom', (r) => { r.wheellog.forEach((e) => { e.ctrlKey = true; }); }),
  't2-declared-step-names': tamper('t2-declared-step-names', (r) => { r.declaredStepNames = ['x', 'y', 'z', 'w']; }),
  't3-viewport-zero': tamper('t3-viewport-zero', (r) => { r.fixture.viewport = { width: 0, height: 0 }; }),
  't4-browser-identity': tamper('t4-browser-identity', (r) => { r.host.chromium = 'Firefox 141.0'; r.host.argv[0] = '/usr/bin/firefox'; }),
  't5-shift-wheel-hscroll': tamper('t5-shift-wheel-hscroll', (r) => { r.wheellog.forEach((e) => { e.shiftKey = true; e.deltaX = 120; }); }),
  't6-scroll-events-one': tamper('t6-scroll-events-one', (r) => { r.pageState.scrollEvents = 1; }),
  't7-no-timestamps': tamper('t7-no-timestamps', (r) => { r.wheellog.forEach((e) => { e.ts = 0; }); }),
};

const result = {
  schema: 'r63revenger-producer-v1',
  counter: path.relative(LANE, COUNTER), counterSha256: sha(src),
  committedM1: path.relative(LANE, COMMITTED_M1), committedM1Sha256: sha(fs.readFileSync(COMMITTED_M1)),
  matrixM1CounterSha256: JSON.parse(fs.readFileSync(path.join(LANE, '.ufo/waves/round-63/controls/mutation/matrix.json'), 'utf8')).mutants.find((m) => m.id === 'M1-producer-and-to-or').counterSha256,
  myM1: path.relative(LANE, mutantPath), myM1Sha256: sha(fs.readFileSync(mutantPath)),
  site: { line, col, opCol, pre: PRE, post: POST, changedLines: diffLines, changedBytes: byteDiffs.length },
  polarity, live: liveRow, tampered,
  verdict: {
    pristineRefusesN1: polarity['n1-lying-producer-true-refuted'].pristine.exit === 1,
    pristineRefusesN2: polarity['n2-lying-producer-false-confirmed'].pristine.exit === 1,
    committedM1FalseGreensN1: polarity['n1-lying-producer-true-refuted'].committedM1.exit === 0,
    committedM1FalseGreensN2: polarity['n2-lying-producer-false-confirmed'].committedM1.exit === 0,
    myM1FalseGreensN1: polarity['n1-lying-producer-true-refuted'].mine.exit === 0,
    myM1FalseGreensN2: polarity['n2-lying-producer-false-confirmed'].mine.exit === 0,
    committedM1AcceptsLive: liveRow.committedM1.exit === 0,
    myM1AcceptsLive: liveRow.mine.exit === 0,
    committedM1BytesEqualMine: sha(fs.readFileSync(COMMITTED_M1)) === sha(fs.readFileSync(mutantPath)),
  },
};
fs.writeFileSync(path.join(OUT, 'result.json'), JSON.stringify(result, null, 1));
console.log(JSON.stringify({ site: result.site, verdict: result.verdict, tampered: Object.fromEntries(Object.entries(tampered).map(([k, v]) => [k, { exit: v.exit, findings: v.findings }])) }, null, 1));
process.exitCode = Object.values(result.verdict).slice(0, 8).every(Boolean) ? 0 : 1;
