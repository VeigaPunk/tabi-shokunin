#!/usr/bin/env node
// R63Critic's OWN exact-line mutant set over the frozen r63 counter.
// gen: for every mutant, require its pre-image EXACTLY ONCE in the pristine
//      source; write a byte copy at <out>/<id>.mjs and record line/col/pre/post.
// run: drive each mutant through the SAME production CLI (node <counter>
//      receipt --driver .. --expect-driver-sha256 .. --shot .. --json) on the
//      live receipt and all ten declared negatives; classify per the frozen
//      matrix's rule (distinguished = accepts live AND false-greens >=1 negative).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : null; };
const mode = args[0];

// Every mutant below is authored by R63Critic, independent of counters/mutate-r63.mjs.
// `line` is the pristine counter line the edit attacks (frozen file 08470569...).
const MUTANTS = [
  { id: 'X1-producer-check-dropped', check: 'producer-verdict', line: 54,
    pre: "check(r?.predicate === true && r?.wheelHypothesis === 'CONFIRMED', 'producer-verdict');",
    post: "check(true, 'producer-verdict');" },
  { id: 'X2-producer-predicate-only', check: 'producer-verdict', line: 54,
    pre: "check(r?.predicate === true && r?.wheelHypothesis === 'CONFIRMED', 'producer-verdict');",
    post: "check(r?.predicate === true, 'producer-verdict');" },
  { id: 'X3-producer-hypothesis-only', check: 'producer-verdict', line: 54,
    pre: "check(r?.predicate === true && r?.wheelHypothesis === 'CONFIRMED', 'producer-verdict');",
    post: "check(r?.wheelHypothesis === 'CONFIRMED', 'producer-verdict');" },
  { id: 'X4-drop-delta-mode', check: 'delta-mode-pixels', line: 42,
    pre: 'e.deltaX === 0 && e.deltaZ === 0 && e.deltaMode === 0',
    post: 'e.deltaX === 0 && e.deltaZ === 0' },
  { id: 'X5-drop-isTrusted', check: 'trusted-fields', line: 43,
    pre: "e.type === 'wheel' && e.isTrusted === true && Number.isFinite(e.ts)",
    post: "e.type === 'wheel' && Number.isFinite(e.ts)" },
  { id: 'X6-drop-scrollYAtDispatch', check: 'target-binding', line: 45,
    pre: "e.targetId === 'tall' && e.scrollYAtDispatch === EXPECTED_AT_DISPATCH[i]",
    post: "e.targetId === 'tall'" },
  { id: 'X7-drop-page-final-state', check: 'page-final-state', line: 55,
    pre: "check(r?.pageState?.scrollY === 240 && r?.pageState?.wheellogLen === 5, 'page-final-state');",
    post: "check(true, 'page-final-state');" },
  { id: 'X8-drop-wheellog-count', check: 'wheellog-count', line: 38,
    pre: "check(LEG_NAMES.every((k) => legMap[k]?.wheellogLen === EXPECTED_LEN[k]), 'wheellog-count');",
    post: "check(true, 'wheellog-count');" },
  { id: 'X9-drop-failures-empty', check: 'failures', line: 53,
    pre: "check(Array.isArray(r?.failures) && r.failures.length === 0, 'failures');",
    post: "check(Array.isArray(r?.failures), 'failures');" },
  { id: 'X10-drop-scroll-event-witness', check: 'scroll-event-witness', line: 46,
    pre: "check(Number.isInteger(r?.pageState?.scrollEvents) && r.pageState.scrollEvents > 0 && r.pageState.scrollEvents <= 5, 'scroll-event-witness');",
    post: "check(true, 'scroll-event-witness');" },
  { id: 'X11-drop-server-witness', check: 'server-witness', line: 49,
    pre: "check(Array.isArray(r?.serverLog) && r.serverLog.some((e) => e.path === '/') && r.serverLog.every((e) => ['/', '/favicon.ico'].includes(e.path)), 'server-witness');",
    post: "check(true, 'server-witness');" },
  { id: 'X12-drop-closed-ports', check: 'closed-ports', line: 51,
    pre: "check(r?.teardown?.portProbes?.fixture === 'closed' && r.teardown.portProbes.devtools === 'closed' && r.teardown.postKillCurl?.fixture === 7 && r.teardown.postKillCurl.devtools === 7, 'closed-ports');",
    post: "check(true, 'closed-ports');" },
  { id: 'X13-drop-launch-witness-midrun', check: 'launch-witness', line: 52,
    pre: 'r?.sweeps?.preLaunch === 0 && r.sweeps.midRun > 0 && r.sweeps.postKill === 0',
    post: 'r?.sweeps?.preLaunch === 0 && r.sweeps.postKill === 0' },
  { id: 'X14-drop-fixture-binding', check: 'fixture-binding', line: 31,
    pre: "check(r?.fixture?.sha256 === external.fixtureSha256, 'fixture-binding');",
    post: "check(true, 'fixture-binding');" },
];

if (mode === 'gen') {
  const counter = opt('counter'), out = opt('out');
  if (!counter || !out) { console.error('usage: gen --counter file --out dir'); process.exit(2); }
  const src = fs.readFileSync(counter, 'utf8');
  const lines = src.split('\n');
  fs.mkdirSync(out, { recursive: true });
  const rows = [];
  for (const m of MUTANTS) {
    const hits = [];
    lines.forEach((line, i) => { let from = 0; for (;;) { const at = line.indexOf(m.pre, from); if (at < 0) break; hits.push({ line: i + 1, col: at + 1 }); from = at + 1; } });
    if (hits.length !== 1) { console.error(JSON.stringify({ error: 'pre-image not unique', id: m.id, hits })); process.exit(3); }
    if (hits[0].line !== m.line) { console.error(JSON.stringify({ error: 'line drift', id: m.id, expected: m.line, actual: hits[0].line })); process.exit(3); }
    const mutated = src.slice(0, src.indexOf(m.pre)) + m.post + src.slice(src.indexOf(m.pre) + m.pre.length);
    const file = path.join(out, m.id + '.mjs');
    fs.writeFileSync(file, mutated);
    rows.push({ id: m.id, check: m.check, source: { line: hits[0].line, col: hits[0].col }, pre: m.pre, post: m.post, file, counterSha256: sha(fs.readFileSync(file)) });
  }
  const doc = { schema: 'tabi-r63-critic-mutants-v1', author: 'R63Critic', counter, counterSha256: sha(src), counterLines: lines.length, mutantCount: rows.length, mutants: rows };
  fs.writeFileSync(path.join(out, 'critic-mutants.json'), JSON.stringify(doc, null, 1));
  console.log(JSON.stringify({ schema: doc.schema, counterSha256: doc.counterSha256, mutantCount: rows.length, mutating: rows.map((r) => r.id) }, null, 1));
} else if (mode === 'run') {
  const counter = opt('counter'), mutantsFile = opt('mutants'), driver = opt('driver'), expect = opt('expect-driver-sha256');
  const live = opt('live'), shot = opt('shot'), negDir = opt('negatives'), out = opt('out'), cwd = opt('cwd') || process.cwd();
  if (!counter || !mutantsFile || !driver || !expect || !live || !shot || !negDir || !out) { console.error('usage: run --counter --mutants --driver --expect-driver-sha256 --live --shot --negatives --out'); process.exit(2); }
  const doc = JSON.parse(fs.readFileSync(mutantsFile, 'utf8'));
  if (sha(fs.readFileSync(counter)) !== doc.counterSha256) { console.error(JSON.stringify({ error: 'counter bytes moved since generation' })); process.exit(3); }
  const negatives = fs.readdirSync(negDir).filter((f) => /^n.*\.json$/.test(f) && f !== 'index.json').sort();
  const runOne = (counterPath, receipt) => {
    const argv = ['node', counterPath, receipt, '--driver', driver, '--expect-driver-sha256', expect, '--shot', shot, '--json'];
    const r = spawnSync(argv[0], argv.slice(1), { encoding: 'utf8', timeout: 120000, cwd });
    let findings = null; try { findings = JSON.parse(r.stdout).findings; } catch {}
    return { argv, exit: r.status, findings, stderr: (r.stderr || '').trim().slice(0, 300) };
  };
  const baseline = { live: runOne(counter, live), negatives: {} };
  for (const n of negatives) baseline.negatives[n] = runOne(counter, path.join(negDir, n));
  const rows = [];
  for (const m of doc.mutants) {
    const liveRun = runOne(m.file, live);
    const negs = {}; const falseGreens = [];
    for (const n of negatives) { const run = runOne(m.file, path.join(negDir, n)); negs[n] = { exit: run.exit, findings: run.findings }; if (run.exit === 0) falseGreens.push(n); }
    rows.push({ id: m.id, check: m.check, source: m.source, counterSha256: m.counterSha256,
      liveExit: liveRun.exit, acceptedLive: liveRun.exit === 0, falseGreens,
      distinguished: liveRun.exit === 0 && falseGreens.length > 0, negativeExits: negs });
  }
  const survivors = rows.filter((r) => !r.distinguished).map((r) => r.id);
  const result = { schema: 'tabi-r63-critic-matrix-v1', author: 'R63Critic',
    counter, counterSha256: doc.counterSha256,
    baseline: { liveExit: baseline.live.exit, negativeExits: Object.fromEntries(Object.entries(baseline.negatives).map(([k, v]) => [k, { exit: v.exit, findings: v.findings }])) },
    mutants: rows, mutantCount: rows.length, survived: survivors, allKilled: survivors.length === 0 };
  fs.writeFileSync(out, JSON.stringify(result, null, 1));
  console.log(JSON.stringify({ schema: result.schema, baselineLiveExit: result.baseline.liveExit, mutantCount: rows.length, survived: survivors, perMutant: rows.map((r) => ({ id: r.id, liveExit: r.liveExit, falseGreens: r.falseGreens })) }, null, 1));
} else { console.error('usage: critic-mutants.mjs gen|run ...'); process.exit(2); }
