#!/usr/bin/env node
// Independent round-63 exact-line mutation harness for seat R63MutCounter.
//
// This file is written from scratch for this seat. It does NOT import, copy or
// invoke counters/mutate-r63.mjs, and it does not consume its mutant files.
// It copies the frozen counter bytes once (../pristine.mjs), applies exactly one
// pinned span replacement per mutant, and runs the SAME production CLI
// (chromium-wheel-r63.mjs argv contract) against the committed live receipt and
// the ten committed negatives.
//
//   node mutmap-r63.mjs gen
//   node mutmap-r63.mjs run
//   node mutmap-r63.mjs compare
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const FROZEN = path.join(LANE, '.ufo/waves/round-63');
const DRIVER = path.join(LANE, 'scripts/chrome-cdp-loopback-round63.mjs');
const DRIVER_PIN = 'b00efd59ac10fd047014b76b2a5d16cc8b0acaab0730e8c6029a0b53a0d6c040';
const SHOT = path.join(FROZEN, 'controls/smoke');
const LIVE = path.join(SHOT, 'receipt-run1.json');
const LIVE2 = path.join(SHOT, 'receipt-run2.json');
const NEGDIR = path.join(FROZEN, 'controls/negatives');
const NEG_INDEX = path.join(NEGDIR, 'index.json');
const COMMITTED_MATRIX = path.join(FROZEN, 'controls/mutation/matrix.json');
const ROOT = process.cwd();
const PRISTINE = path.join(ROOT, 'pristine.mjs');
const MUTDIR = path.join(ROOT, 'mutants');
const LOGDIR = path.join(ROOT, 'out/logs');
const OUT = path.join(ROOT, 'out');

const MUTANTS = [
  // ---- required semantic weakenings (a)-(f) ---------------------------------
  { id: 'X1-producer-and-to-or', check: 'producer-verdict', cls: 'required-a',
    pre: "r?.predicate === true && r?.wheelHypothesis === 'CONFIRMED'",
    post: "r?.predicate === true || r?.wheelHypothesis === 'CONFIRMED'" },
  { id: 'X2-unique-sequence-clause-only', check: 'wheellog-sequence', cls: 'required-b-narrow',
    pre: 'wl.length === 5 && wl.every((e, i) => e.seq === i + 1) && new Set(wl.map((e) => e.seq)).size === 5',
    post: 'wl.length === 5 && wl.every((e, i) => e.seq === i + 1)' },
  { id: 'X3-sequence-check-dropped', check: 'wheellog-sequence', cls: 'required-b',
    pre: 'wl.length === 5 && wl.every((e, i) => e.seq === i + 1) && new Set(wl.map((e) => e.seq)).size === 5',
    post: 'wl.length === 5' },
  { id: 'X4-cancelation-any-boolean', check: 'cancelation', cls: 'required-c',
    pre: 'wl.every((e, i) => e.defaultPrevented === (i === 3))',
    post: 'wl.every((e) => typeof e.defaultPrevented === "boolean")' },
  { id: 'X5-shot-bytes-gate-dropped', check: 'shot-bytes', cls: 'required-d',
    pre: "check(external.shotsValid === true, 'shot-bytes');",
    post: "check(true, 'shot-bytes');" },
  { id: 'X6-launch-guards-relaxed', check: 'launch-guards', cls: 'required-e',
    pre: "['--headless=new', '--disable-extensions', '--remote-debugging-address=127.0.0.1', '--disable-smooth-scrolling'].every((a) => r.host.argv.includes(a))",
    post: 'Array.isArray(r?.host?.argv)' },
  { id: 'X7-teardown-survivors-dropped', check: 'survivors', cls: 'required-f',
    pre: 'r?.teardown?.postKillSweepCount === 0 && Array.isArray(r.teardown.survivors) && r.teardown.survivors.length === 0',
    post: 'Array.isArray(r?.teardown?.survivors)' },
  // ---- committed-matrix equivalents (byte comparison only) ------------------
  { id: 'X8-scroll-arithmetic-relaxed', check: 'scroll-arithmetic', cls: 'committed-equiv',
    pre: 'legMap[k]?.scrollY === EXPECTED_SCROLL[k]', post: 'Number.isFinite(legMap[k]?.scrollY)' },
  { id: 'X9-delta-y-relaxed', check: 'delta-y-passthrough', cls: 'committed-equiv',
    pre: 'wl.every((e, i) => e.deltaY === EXPECTED_DELTA_Y[i])', post: 'wl.every((e) => Number.isFinite(e.deltaY))' },
  // ---- coverage probes on checks with no declared negative ------------------
  { id: 'X10-nonce-shape-dropped', check: 'nonce-binding', cls: 'coverage-probe',
    pre: "/^tabi-r63-[a-z0-9-]+$/.test(r?.nonce || '') && r.nonceOnPage === r.nonce",
    post: 'r?.nonceOnPage === r?.nonce' },
  { id: 'X11-closed-ports-relaxed', check: 'closed-ports', cls: 'coverage-probe',
    pre: "r?.teardown?.portProbes?.fixture === 'closed' && r.teardown.portProbes.devtools === 'closed' && r.teardown.postKillCurl?.fixture === 7 && r.teardown.postKillCurl.devtools === 7",
    post: "r?.teardown?.portProbes?.fixture === 'closed'" },
  { id: 'X12-scroll-event-witness-relaxed', check: 'scroll-event-witness', cls: 'coverage-probe',
    pre: 'Number.isInteger(r?.pageState?.scrollEvents) && r.pageState.scrollEvents > 0 && r.pageState.scrollEvents <= 5',
    post: 'Number.isInteger(r?.pageState?.scrollEvents)' },
  { id: 'X13-shot-records-sha-regex-dropped', check: 'shot-records', cls: 'coverage-probe',
    pre: "e.name === STEP_NAMES[i] && e.png === STEP_NAMES[i] + '.png' && /^[a-f0-9]{64}$/.test(e.sha256) && e.bytes > 0",
    post: "e.name === STEP_NAMES[i] && e.png === STEP_NAMES[i] + '.png' && e.bytes > 0" },
  { id: 'X14-server-witness-allowlist-dropped', check: 'server-witness', cls: 'coverage-probe',
    pre: "Array.isArray(r?.serverLog) && r.serverLog.some((e) => e.path === '/') && r.serverLog.every((e) => ['/', '/favicon.ico'].includes(e.path))",
    post: "Array.isArray(r?.serverLog) && r.serverLog.some((e) => e.path === '/')" },
  { id: 'X15-target-binding-dispatch-dropped', check: 'target-binding', cls: 'coverage-probe',
    pre: "wl.every((e, i) => e.targetId === 'tall' && e.scrollYAtDispatch === EXPECTED_AT_DISPATCH[i])",
    post: "wl.every((e) => e.targetId === 'tall')" },
  { id: 'X16-driver-binding-equality-dropped', check: 'driver-binding', cls: 'coverage-probe',
    pre: "r?.driverSha256 === external.driverSha256 && /^[a-f0-9]{64}$/.test(r?.driverSha256 || '')",
    post: "/^[a-f0-9]{64}$/.test(r?.driverSha256 || '')" },
  { id: 'X17-launch-witness-midrun-dropped', check: 'launch-witness', cls: 'coverage-probe',
    pre: 'r?.sweeps?.preLaunch === 0 && r.sweeps.midRun > 0 && r.sweeps.postKill === 0',
    post: 'r?.sweeps?.preLaunch === 0 && r.sweeps.postKill === 0' },
  { id: 'X18-shot-records-label-equality-dropped', check: 'shot-records', cls: 'coverage-probe',
    pre: "e.name === STEP_NAMES[i] && e.png === STEP_NAMES[i] + '.png' && /^[a-f0-9]{64}$/",
    post: "/^[a-f0-9]{64}$/" },
  { id: 'X19-legs-shape-names-dropped', check: 'legs-shape', cls: 'coverage-probe',
    pre: 'legs.length === 6 && LEG_NAMES.every((n, i) => legs[i]?.name === n)',
    post: 'legs.length === 6' },
  { id: 'X20-wheellog-count-relaxed', check: 'wheellog-count', cls: 'coverage-probe',
    pre: 'LEG_NAMES.every((k) => legMap[k]?.wheellogLen === EXPECTED_LEN[k])',
    post: 'LEG_NAMES.every((k) => Number.isInteger(legMap[k]?.wheellogLen))' },
  { id: 'X21-delta-mode-relaxed', check: 'delta-mode-pixels', cls: 'coverage-probe',
    pre: 'wl.every((e) => e.deltaX === 0 && e.deltaZ === 0 && e.deltaMode === 0)',
    post: 'wl.every((e) => Number.isInteger(e.deltaMode))' },
  { id: 'X22-trusted-fields-relaxed', check: 'trusted-fields', cls: 'coverage-probe',
    pre: "wl.every((e) => e.type === 'wheel' && e.isTrusted === true && Number.isFinite(e.ts) && e.ts >= 0 && e.cancelable === true)",
    post: "wl.every((e) => e.type === 'wheel')" },
  { id: 'X23-page-final-state-relaxed', check: 'page-final-state', cls: 'coverage-probe',
    pre: 'r?.pageState?.scrollY === 240 && r?.pageState?.wheellogLen === 5',
    post: 'r?.pageState?.scrollY === 240' },
  { id: 'X24-schema-gate-dropped', check: 'schema', cls: 'coverage-probe',
    pre: "check(r?.schema === 'tabi-chrome-cdp-r63', 'schema');",
    post: "check(true, 'schema');" },
  { id: 'X25-fixture-binding-equality-dropped', check: 'fixture-binding', cls: 'coverage-probe',
    pre: 'r?.fixture?.sha256 === external.fixtureSha256',
    post: "/^[a-f0-9]{64}$/.test(r?.fixture?.sha256 || '')" },
  { id: 'X26-loopback-origin-relaxed', check: 'loopback-origin', cls: 'coverage-probe',
    pre: "r?.fixture?.origin?.match(/^http:\\/\\/127\\.0\\.0\\.1:[0-9]+$/) && r?.fixture?.target === 'tall'",
    post: "r?.fixture?.target === 'tall'" },
  { id: 'X27-failures-gate-dropped', check: 'failures', cls: 'coverage-probe',
    pre: "check(Array.isArray(r?.failures) && r.failures.length === 0, 'failures');",
    post: "check(true, 'failures');" },
  // ---- harness controls (not semantic weakenings) --------------------------
  { id: 'XC1-blanket-refusal-control', check: 'failures', cls: 'control-blanket-refusal',
    pre: "check(Array.isArray(r?.failures) && r.failures.length === 0, 'failures');",
    post: "check(false, 'failures');" },
  { id: 'XC2-check-sink-control', check: '(all checks)', cls: 'control-check-sink',
    pre: 'const check = (ok, id) => { if (!ok) findings.push(id); };',
    post: 'const check = () => {};' },
];

function failuresIndex() {
  const idx = JSON.parse(fs.readFileSync(NEG_INDEX, 'utf8'));
  return idx.controls.map((c) => ({ name: c.name, file: c.file }));
}

function lineCol(src, offset) {
  const before = src.slice(0, offset);
  const line = before.split('\n').length;
  const col = offset - before.lastIndexOf('\n');
  return { line, col };
}

function gen() {
  if (!fs.existsSync(PRISTINE)) throw new Error('pristine.mjs missing');
  const src = fs.readFileSync(PRISTINE, 'utf8');
  fs.mkdirSync(MUTDIR, { recursive: true });
  const records = [];
  for (const m of MUTANTS) {
    const first = src.indexOf(m.pre);
    if (first < 0) throw new Error(`${m.id}: pre-image absent`);
    if (src.indexOf(m.pre, first + 1) >= 0) throw new Error(`${m.id}: pre-image ambiguous`);
    if (first !== src.lastIndexOf(m.pre)) throw new Error(`${m.id}: not unique`);
    const out = src.slice(0, first) + m.post + src.slice(first + m.pre.length);
    const file = path.join(MUTDIR, m.id + '.mjs');
    fs.writeFileSync(file, out);
    // Recompute the site on the mutated bytes to prove the edit landed there.
    const site = lineCol(src, first);
    const lineText = src.split('\n')[site.line - 1];
    if (!lineText.includes(m.pre)) throw new Error(`${m.id}: span crosses lines; refusing`);
    records.push({
      id: m.id, check: m.check, cls: m.cls,
      line: site.line, col: site.col,
      pre: m.pre, post: m.post,
      occurrenceCount: 1,
      lineText,
      pristineSha256: sha(src),
      mutantSha256: sha(out),
      mutantBytes: Buffer.byteLength(out),
      mutantFile: path.relative(ROOT, file),
      diffBytes: Buffer.byteLength(out) - Buffer.byteLength(src),
    });
  }
  const doc = {
    schema: 'tabi-r63-independent-mutants-v1',
    seat: 'R63MutCounter',
    harness: { file: 'mutmap-r63.mjs', sha256: sha(fs.readFileSync(path.join(ROOT, 'mutmap-r63.mjs'))) },
    pristine: {
      source: path.join(FROZEN, 'counters/chromium-wheel-r63.mjs'),
      copiedTo: 'pristine.mjs', sha256: sha(src), bytes: Buffer.byteLength(src),
      frozenPin: '084705695a394256198b45c15fb7568b629e3bc750bbd46cfcb81cdb312d7178',
    },
    mutantCount: records.length,
    mutants: records,
  };
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'mutants.json'), JSON.stringify(doc, null, 1) + '\n');
  console.log(JSON.stringify({ ok: true, mutantCount: records.length, pristineSha256: sha(src), out: path.join(OUT, 'mutants.json') }));
}

const RUNS = [];
function runCli(counter, receipt, tag) {
  const argv = [process.execPath, counter, receipt, '--driver', DRIVER, '--expect-driver-sha256', DRIVER_PIN, '--shot', SHOT, '--json'];
  const p = spawnSync(argv[0], argv.slice(1), { encoding: 'utf8', timeout: 120000, cwd: LANE });
  const dir = path.join(LOGDIR, tag);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'stdout'), p.stdout || '');
  fs.writeFileSync(path.join(dir, 'stderr'), p.stderr || '');
  let body = null;
  try { body = JSON.parse(p.stdout); } catch { /* refused before JSON */ }
  const rec = {
    tag, counter, counterSha256: sha(fs.readFileSync(counter)),
    receipt, receiptSha256: sha(fs.readFileSync(receipt)),
    cwd: LANE, argv, exit: p.status, signal: p.signal,
    predicate: body?.predicate ?? null,
    findingCount: body?.findingCount ?? null,
    findings: body?.findings ?? null,
    error: body?.error ?? null,
    logDir: path.relative(ROOT, dir),
  };
  RUNS.push(rec);
  return rec;
}

function run() {
  const doc = JSON.parse(fs.readFileSync(path.join(OUT, 'mutants.json'), 'utf8'));
  const negatives = failuresIndex();
  const negNames = negatives.map((n) => n.name);
  const live = runCli(PRISTINE, LIVE, 'pristine/live-run1');
  const live2 = runCli(PRISTINE, LIVE2, 'pristine/live-run2');
  const baselineNeg = {};
  for (const n of negatives) baselineNeg[n.name] = runCli(PRISTINE, n.file, `pristine/${n.name}`);
  const pristineRefused = negNames.filter((k) => baselineNeg[k].exit !== 0);
  const pristineAccepted = negNames.filter((k) => baselineNeg[k].exit === 0);

  const rows = [];
  for (const m of doc.mutants) {
    const counter = path.join(ROOT, m.mutantFile);
    const lv = runCli(counter, LIVE, `${m.id}/live-run1`);
    const lv2 = runCli(counter, LIVE2, `${m.id}/live-run2`);
    const neg = {};
    for (const n of negatives) neg[n.name] = runCli(counter, n.file, `${m.id}/${n.name}`);
    const falseGreens = negNames.filter((k) => neg[k].exit === 0);
    const acceptedFindings = {};
    for (const k of falseGreens) acceptedFindings[k] = neg[k].findings;
    rows.push({
      id: m.id, check: m.check, cls: m.cls, line: m.line, col: m.col,
      pre: m.pre, post: m.post, mutantSha256: m.mutantSha256,
      liveExit: lv.exit, live2Exit: lv2.exit,
      liveFindings: lv.findings, liveError: lv.error,
      acceptedLive: lv.exit === 0,
      negativeExits: Object.fromEntries(negNames.map((k) => [k, neg[k].exit])),
      falseGreens, acceptedFindings,
      distinguished: lv.exit === 0 && falseGreens.length > 0,
      blanketRefusal: lv.exit !== 0,
      survivor: lv.exit === 0 && falseGreens.length === 0,
    });
    console.log(JSON.stringify({ mutant: m.id, liveExit: lv.exit, falseGreens, distinguished: rows.at(-1).distinguished, survivor: rows.at(-1).survivor }));
  }

  const matrix = {
    schema: 'tabi-r63-independent-mutation-matrix-v1',
    seat: 'R63MutCounter',
    producedAt: new Date().toISOString(),
    counter: { frozen: path.join(FROZEN, 'counters/chromium-wheel-r63.mjs'), sha256: doc.pristine.sha256, pin: doc.pristine.frozenPin, pinMatches: doc.pristine.sha256 === doc.pristine.frozenPin },
    harness: doc.harness,
    cliContract: 'node <counter> <receipt> --driver <frozen driver> --expect-driver-sha256 <pin> --shot <frozen controls/smoke> --json',
    driver: { file: DRIVER, sha256: sha(fs.readFileSync(DRIVER)), pin: DRIVER_PIN },
    live: { file: LIVE, sha256: sha(fs.readFileSync(LIVE)) },
    live2: { file: LIVE2, sha256: sha(fs.readFileSync(LIVE2)) },
    shotDir: SHOT,
    negatives: negatives.map((n) => ({ name: n.name, file: n.file, sha256: sha(fs.readFileSync(n.file)) })),
    baseline: {
      liveExit: live.exit, livePredicate: live.predicate, liveFindings: live.findings,
      live2Exit: live2.exit,
      negativeExits: Object.fromEntries(negNames.map((k) => [k, baselineNeg[k].exit])),
      negativeFindings: Object.fromEntries(negNames.map((k) => [k, baselineNeg[k].findings])),
      pristineRefusesAll: pristineAccepted.length === 0,
      pristineAccepted,
    },
    mutants: rows,
    summary: {
      mutantCount: rows.length,
      distinguished: rows.filter((r) => r.distinguished).length,
      survivors: rows.filter((r) => r.survivor).map((r) => r.id),
      blanketRefusals: rows.filter((r) => r.blanketRefusal).map((r) => r.id),
      falseGreenPerMutant: Object.fromEntries(rows.map((r) => [r.id, r.falseGreens])),
    },
  };
  fs.writeFileSync(path.join(OUT, 'matrix.json'), JSON.stringify(matrix, null, 1) + '\n');
  fs.writeFileSync(path.join(OUT, 'runs.jsonl'), RUNS.map((r) => JSON.stringify(r)).join('\n') + '\n');
  console.log(JSON.stringify({ ok: true, runCount: RUNS.length, summary: matrix.summary }, null, 1));
}

function compare() {
  const mine = JSON.parse(fs.readFileSync(path.join(OUT, 'matrix.json'), 'utf8'));
  const committed = JSON.parse(fs.readFileSync(COMMITTED_MATRIX, 'utf8'));
  const bySha = new Map(mine.mutants.map((m) => [m.mutantSha256, m]));
  const rows = committed.mutants.map((c) => {
    const m = bySha.get(c.counterSha256) || null;
    return {
      committedId: c.id,
      committedCheck: c.check,
      committedSha256: c.counterSha256,
      committedFalseGreens: c.falseGreens,
      committedDistinguished: c.distinguished,
      committedAcceptedLive: c.acceptedLive,
      mineId: m?.id ?? null,
      byteIdentical: !!m,
      myFalseGreens: m?.falseGreens ?? null,
      myDistinguished: m?.distinguished ?? null,
      myAcceptedLive: m?.acceptedLive ?? null,
      agree: m ? (JSON.stringify(m.falseGreens.slice().sort()) === JSON.stringify(c.falseGreens.slice().sort()) && m.distinguished === c.distinguished && m.acceptedLive === c.acceptedLive) : null,
    };
  });
  const doc = {
    schema: 'tabi-r63-mutation-agreement-v1',
    committedMatrix: COMMITTED_MATRIX,
    committedSha256: sha(fs.readFileSync(COMMITTED_MATRIX)),
    note: 'Agreement is asserted only where the mutant bytes are byte-identical (sha256 match). Non-identical mutants add coverage and are not agreement claims.',
    committedCount: committed.mutants.length,
    byteIdenticalCount: rows.filter((r) => r.byteIdentical).length,
    allAgree: rows.filter((r) => r.byteIdentical).every((r) => r.agree === true),
    rows,
    notReproduced: rows.filter((r) => !r.byteIdentical).map((r) => r.committedId),
  };
  fs.writeFileSync(path.join(OUT, 'compare.json'), JSON.stringify(doc, null, 1) + '\n');
  console.log(JSON.stringify({ ok: true, byteIdenticalCount: doc.byteIdenticalCount, allAgree: doc.allAgree, notReproduced: doc.notReproduced }, null, 1));
}

const mode = process.argv[2];
if (mode === 'gen') gen();
else if (mode === 'run') run();
else if (mode === 'compare') compare();
else { console.error('usage: mutmap-r63.mjs gen|run|compare'); process.exitCode = 2; }
