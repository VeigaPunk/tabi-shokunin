#!/usr/bin/env node
// Round-63 exact-source-location mutant generator + runner.
//
//   node mutate-r63.mjs gen --counter <pristine counter> --out <mutants.json>
//   node mutate-r63.mjs run --counter <counter> --mutants <mutants.json>
//        --driver <driver> --expect-driver-sha256 <sha> --live <receipt.json>
//        --shot <dir> --negatives <dir> --work <dir> --out <matrix.json>
//
// gen: for every declared mutant, locate its pre-image EXACTLY ONCE in the
//      pristine source and record {line, col, pre, post}. A pre-image that is
//      missing or ambiguous is a generation refusal (exit 3): a mutant is never
//      applied to a guessed site.
// run: (1) baseline matrix, pristine counter vs live and every negative;
//      (2) for each mutant, a byte copy of the pristine source with only the
//      pinned span replaced, run through the SAME production CLI;
//      (3) a mutant is DISTINGUISHED only when it accepts the live receipt and
//      false-greens at least one declared negative the pristine counter refuses.
//      A mutant that accepts nothing is a blanket refusal, never a kill.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : null; };
const mode = args[0];

const MUTANTS = [
  { id: 'M1-producer-and-to-or', check: 'producer-verdict',
    pre: "r?.predicate === true && r?.wheelHypothesis === 'CONFIRMED'",
    post: "r?.predicate === true || r?.wheelHypothesis === 'CONFIRMED'" },
  { id: 'M2-drop-scroll-arithmetic', check: 'scroll-arithmetic',
    pre: 'legMap[k]?.scrollY === EXPECTED_SCROLL[k]', post: 'Number.isFinite(legMap[k]?.scrollY)' },
  { id: 'M3-drop-sequence-uniqueness', check: 'wheellog-sequence',
    pre: 'wl.length === 5 && wl.every((e, i) => e.seq === i + 1) && new Set(wl.map((e) => e.seq)).size === 5',
    post: 'wl.length === 5' },
  { id: 'M4-drop-delta-y', check: 'delta-y-passthrough',
    pre: 'wl.every((e, i) => e.deltaY === EXPECTED_DELTA_Y[i])', post: 'wl.every((e) => Number.isFinite(e.deltaY))' },
  { id: 'M5-drop-cancelation', check: 'cancelation',
    pre: 'wl.every((e, i) => e.defaultPrevented === (i === 3))', post: 'wl.every((e) => typeof e.defaultPrevented === "boolean")' },
  { id: 'M6-drop-shot-bytes', check: 'shot-bytes',
    pre: "check(external.shotsValid === true, 'shot-bytes');", post: "check(true, 'shot-bytes');" },
  { id: 'M7-drop-teardown-survivors', check: 'survivors',
    pre: 'r?.teardown?.postKillSweepCount === 0 && Array.isArray(r.teardown.survivors) && r.teardown.survivors.length === 0',
    post: 'Array.isArray(r?.teardown?.survivors)' },
  { id: 'M8-drop-launch-guards', check: 'launch-guards',
    pre: "['--headless=new', '--disable-extensions', '--remote-debugging-address=127.0.0.1', '--disable-smooth-scrolling'].every((a) => r.host.argv.includes(a))",
    post: 'Array.isArray(r?.host?.argv)' },
];

if (mode === 'gen') {
  const counter = opt('counter'), out = opt('out');
  if (!counter || !out) { console.error('usage: gen --counter file --out mutants.json'); process.exit(2); }
  const src = fs.readFileSync(counter, 'utf8');
  const lines = src.split('\n');
  const rows = [];
  for (const m of MUTANTS) {
    const hits = [];
    lines.forEach((line, i) => {
      let from = 0;
      for (;;) {
        const at = line.indexOf(m.pre, from);
        if (at < 0) break;
        hits.push({ line: i + 1, col: at + 1 });
        from = at + 1;
      }
    });
    if (hits.length !== 1) { console.error(JSON.stringify({ schema: 'tabi-r63-mutants-v1', error: 'pre-image not unique', mutant: m.id, hits })); process.exit(3); }
    rows.push({ ...m, line: hits[0].line, col: hits[0].col, shape: 'line-col-pre-post' });
  }
  const doc = { schema: 'tabi-r63-mutants-v1', counter, counterSha256: sha(src), counterLines: lines.length, mutants: rows };
  fs.writeFileSync(out, JSON.stringify(doc, null, 1));
  console.log(JSON.stringify({ schema: 'tabi-r63-mutants-v1', mutants: rows.length, counterSha256: doc.counterSha256, out }));
} else if (mode === 'run') {
  const counter = opt('counter'), mutantsFile = opt('mutants'), driver = opt('driver'), expect = opt('expect-driver-sha256');
  const live = opt('live'), shot = opt('shot'), negDir = opt('negatives'), work = opt('work'), out = opt('out');
  if (!counter || !mutantsFile || !driver || !expect || !live || !shot || !negDir || !work || !out) { console.error('usage: run --counter --mutants --driver --expect-driver-sha256 --live --shot --negatives --work --out'); process.exit(2); }
  const src = fs.readFileSync(counter, 'utf8');
  const doc = JSON.parse(fs.readFileSync(mutantsFile, 'utf8'));
  if (sha(src) !== doc.counterSha256) { console.error(JSON.stringify({ error: 'counter bytes moved since mutant generation', expected: doc.counterSha256, actual: sha(src) })); process.exit(3); }
  fs.mkdirSync(work, { recursive: true });
  const negatives = fs.readdirSync(negDir).filter((f) => f.endsWith('.json') && f !== 'index.json').sort()
    .map((f) => ({ name: f.replace(/\.json$/, ''), file: path.join(negDir, f) }));
  const runOne = (counterPath, receipt) => {
    const r = spawnSync('node', [counterPath, receipt, '--driver', driver, '--expect-driver-sha256', expect, '--shot', shot, '--json'], { encoding: 'utf8', timeout: 120000 });
    let findings = null;
    try { findings = JSON.parse(r.stdout).findings; } catch { findings = null; }
    return { exit: r.status, findings, stderr: r.stderr.trim().slice(0, 400) };
  };
  const baseline = { live: runOne(counter, live), negatives: {} };
  for (const n of negatives) baseline.negatives[n.name] = runOne(counter, n.file);
  const rows = [];
  for (const m of doc.mutants) {
    const lines = src.split('\n');
    const line = lines[m.line - 1];
    if (line === undefined || line.slice(m.col - 1, m.col - 1 + m.pre.length) !== m.pre) {
      rows.push({ id: m.id, status: 'site-mismatch', expected: { line: m.line, col: m.col }, actual: line ? line.slice(m.col - 1, m.col - 1 + 40) : null });
      continue;
    }
    const mutatedLine = line.slice(0, m.col - 1) + m.post + line.slice(m.col - 1 + m.pre.length);
    lines[m.line - 1] = mutatedLine;
    const file = path.join(work, m.id + '.mjs');
    fs.writeFileSync(file, lines.join('\n'));
    const liveRun = runOne(file, live);
    const negRuns = {};
    const falseGreens = [];
    for (const n of negatives) {
      const run = runOne(file, n.file);
      negRuns[n.name] = run;
      if (run.exit === 0) falseGreens.push(n.name);
    }
    rows.push({ id: m.id, check: m.check, source: { line: m.line, col: m.col }, counterSha256: sha(fs.readFileSync(file)),
      acceptedLive: liveRun.exit === 0, liveExit: liveRun.exit,
      distinguished: liveRun.exit === 0 && falseGreens.length > 0,
      falseGreens });
  }
  const pristineRefusesAll = Object.values(baseline.negatives).every((r) => r.exit === 1);
  const pristineAcceptsLive = baseline.live.exit === 0;
  const survivors = rows.filter((r) => r.status === 'site-mismatch' || !r.distinguished);
  const result = { schema: 'tabi-r63-mutation-matrix-v1', counter, counterSha256: doc.counterSha256,
    baseline: { liveExit: baseline.live.exit, pristineAcceptsLive, pristineRefusesAll,
      negativeExits: Object.fromEntries(Object.entries(baseline.negatives).map(([k, v]) => [k, { exit: v.exit, findings: v.findings }])) },
    mutants: rows, mutantCount: rows.length, survived: survivors.map((r) => r.id), allKilled: survivors.length === 0 && pristineAcceptsLive && pristineRefusesAll };
  fs.writeFileSync(out, JSON.stringify(result, null, 1));
  console.log(JSON.stringify({ schema: result.schema, pristineAcceptsLive, pristineRefusesAll, mutantCount: result.mutantCount, survived: result.survived, allKilled: result.allKilled }, null, 1));
  process.exitCode = result.allKilled ? 0 : 1;
} else {
  console.error('usage: mutate-r63.mjs gen|run ...');
  process.exit(2);
}
