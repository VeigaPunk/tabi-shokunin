#!/usr/bin/env node
// R63Revenger: independent reconstruction of the r62 red-before class.
// Does NOT import or invoke counters/old-generation-r63.mjs. Everything here is
// generated from the frozen r62 counter bytes plus the committed r62 live
// receipt; the mutation is line/column pinned and the changed span is asserted
// to be exactly the two bytes of `&&` -> `||`.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const WAVE = path.join(LANE, '.ufo/waves/round-63/w1/R63Revenger');
const OUT = path.join(WAVE, 'r62');
const COUNTER = path.join(LANE, '.ufo/waves/round-62/counters/chromium-receipt-r62.mjs');
const COUNTER_PIN = '971c84f602f6d79b9aa12f9872eba57463a938b425546f793c4b5df72bd5a006';
const LIVE = path.join(LANE, 'corpus/evidence/round62/chromium-secondary-button/receipt.json');
const LIVE_PIN = '0b97b910707ba54142aa75433d919f447bdf8cd695b20ffa9f91d234c1db3654';
const DRIVER = path.join(LANE, 'scripts/chrome-cdp-loopback-round62.mjs');
const DRIVER_PIN = '8dae248a7b3cb01c866a6fff80de82cfc821f6aeca4ed08114fe42c8305c82e0';
const SHOTS = path.join(LANE, 'corpus/evidence/round62/chromium-secondary-button');
const PRE = "r?.predicate===true && r.buttonHypothesis==='CONFIRMED'";
const POST = "r?.predicate===true || r.buttonHypothesis==='CONFIRMED'";

const fail = (m) => { console.error(JSON.stringify({ schema: 'r63revenger-r62-v1', error: m })); process.exit(3); };

const src = fs.readFileSync(COUNTER, 'utf8');
if (sha(src) !== COUNTER_PIN) fail(`counter pin changed: ${sha(src)}`);
const driverSrc = fs.readFileSync(DRIVER, 'utf8');
if (sha(driverSrc) !== DRIVER_PIN) fail(`driver pin changed: ${sha(driverSrc)}`);
const live = JSON.parse(fs.readFileSync(LIVE, 'utf8'));
if (sha(fs.readFileSync(LIVE)) !== LIVE_PIN) fail('live receipt pin changed');

// --- locate the producer-verdict site exactly once -------------------------
const lines = src.split('\n');
const hits = [];
lines.forEach((line, i) => { let from = 0; for (;;) { const at = line.indexOf(PRE, from); if (at < 0) break; hits.push({ line: i + 1, col: at + 1 }); from = at + 1; } });
if (hits.length !== 1) fail(`pre-image not unique: ${JSON.stringify(hits)}`);
const { line, col } = hits[0];
const siteLine = lines[line - 1];
const opCol = siteLine.indexOf('&&') + 1;
if (siteLine.slice(col - 1, col - 1 + PRE.length) !== PRE) fail('site pre-image mismatch');

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.join(OUT, 'runs'), { recursive: true });

// --- lying receipts, built from the committed live receipt -----------------
const lie = (mutate) => { const r = JSON.parse(JSON.stringify(live)); mutate(r); return JSON.stringify(r, null, 1); };
const lies = {
  'lie-a-predicate-true-hypothesis-refuted': lie((r) => { r.buttonHypothesis = 'REFUTED'; }),
  'lie-b-predicate-false-hypothesis-confirmed': lie((r) => { r.predicate = false; }),
};
for (const [name, body] of Object.entries(lies)) fs.writeFileSync(path.join(OUT, name + '.json'), body + (body.endsWith('\n') ? '' : '\n'));

// --- the exact-line mutant -------------------------------------------------
const mutated = [...lines];
mutated[line - 1] = siteLine.slice(0, col - 1) + POST + siteLine.slice(col - 1 + PRE.length);
const mutantPath = path.join(OUT, 'r62-producer-and-to-or.mjs');
fs.writeFileSync(mutantPath, mutated.join('\n'));

// --- assert the diff is exactly one line / two bytes -----------------------
const mutSrc = fs.readFileSync(mutantPath, 'utf8');
const mutLines = mutSrc.split('\n');
const diffLines = [];
for (let i = 0; i < Math.max(lines.length, mutLines.length); i++) if (lines[i] !== mutLines[i]) diffLines.push(i + 1);
if (diffLines.length !== 1 || diffLines[0] !== line) fail(`mutation touched lines ${JSON.stringify(diffLines)}`);
const a = Buffer.from(siteLine, 'utf8'), b = Buffer.from(mutLines[line - 1], 'utf8');
if (a.length !== b.length) fail('mutation changed line length');
const byteDiffs = [];
for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) byteDiffs.push(i + 1);
if (byteDiffs.length !== 2 || siteLine.slice(opCol - 1, opCol + 1) !== '&&' || mutLines[line - 1].slice(opCol - 1, opCol + 1) !== '||') fail(`byte diff not exactly && -> ||: ${JSON.stringify(byteDiffs)}`);

// --- run everything through the production CLI -----------------------------
const run = (counterPath, receiptPath) => {
  const r = spawnSync('node', [counterPath, receiptPath, '--driver', DRIVER, '--expect-driver-sha256', DRIVER_PIN, '--shot', SHOTS, '--json'], { encoding: 'utf8', timeout: 120000 });
  let out = null;
  try { out = JSON.parse(r.stdout); } catch { out = null; }
  return { argv: ['node', path.relative(LANE, counterPath), path.relative(LANE, receiptPath), '--driver', path.relative(LANE, DRIVER), '--expect-driver-sha256', DRIVER_PIN, '--shot', path.relative(LANE, SHOTS), '--json'], exit: r.status, findings: out ? out.findings : null, predicate: out ? out.predicate : null, stderr: r.stderr.trim().slice(0, 300) };
};

const cases = { live_true: LIVE, ...Object.fromEntries(Object.keys(lies).map((n) => [n, path.join(OUT, n + '.json')])) };
const result = {
  schema: 'r63revenger-r62-v1',
  counter: COUNTER, counterSha256: sha(src),
  driver: DRIVER, driverSha256: sha(driverSrc),
  liveReceipt: LIVE, liveReceiptSha256: sha(fs.readFileSync(LIVE)),
  site: { line, col, opCol, pre: PRE, post: POST, changedBytes: byteDiffs.length, changedLines: diffLines },
  mutantPath, mutantSha256: sha(fs.readFileSync(mutantPath)),
  runs: {},
};
for (const [name, receiptPath] of Object.entries(cases)) {
  const pristine = run(COUNTER, receiptPath);
  const mutant = run(mutantPath, receiptPath);
  result.runs[name] = { receiptPath, receiptSha256: sha(fs.readFileSync(receiptPath)), pristine, mutant };
  fs.writeFileSync(path.join(OUT, 'runs', `${name}.pristine.json`), JSON.stringify(pristine, null, 1));
  fs.writeFileSync(path.join(OUT, 'runs', `${name}.mutant.json`), JSON.stringify(mutant, null, 1));
}
const A = result.runs['lie-a-predicate-true-hypothesis-refuted'];
const B = result.runs['lie-b-predicate-false-hypothesis-confirmed'];
const T = result.runs.live_true;
result.verdict = {
  pristineAcceptsTrueLive: T.pristine.exit === 0 && T.pristine.predicate === true,
  pristineRefusesLieA: A.pristine.exit === 1 && A.pristine.findings.join(',') === 'producer-verdict',
  mutantAcceptsLieA: A.mutant.exit === 0,
  pristineRefusesLieB: B.pristine.exit === 1 && B.pristine.findings.join(',') === 'producer-verdict',
  mutantAcceptsLieB: B.mutant.exit === 0,
};
result.demonstrated = Object.values(result.verdict).every(Boolean);
fs.writeFileSync(path.join(OUT, 'result.json'), JSON.stringify(result, null, 1));
console.log(JSON.stringify({ schema: result.schema, site: result.site, mutantSha256: result.mutantSha256, verdict: result.verdict, demonstrated: result.demonstrated }, null, 1));
process.exitCode = result.demonstrated ? 0 : 1;
