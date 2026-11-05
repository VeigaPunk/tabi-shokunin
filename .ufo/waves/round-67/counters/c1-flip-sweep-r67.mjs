// c1-flip-sweep-r67.mjs — tabi round 67, C1 instrument (R67Executor1). A flip
// sweep over an adjudicated adjacency delta ledger. For EVERY `line` row the
// tool writes a one-row mutant (that row's disposition replaced by each of the
// two other in-vocabulary dispositions) under the scratch dir, runs the given
// meter with the r66 argv pattern plus --delta <mutant> --json, and records
// exit code, predicate, findingCount and the delta-disposition-evidence details.
// The vocabulary is extracted from the meter source itself (never retyped).
// Work files live under --scratch (default $HYAKU_SCRATCH/tabi-r67/R67Executor1);
// this tool never writes /tmp.
//
// Two kill definitions are recorded per row:
//   killedLiteral  — at least one flip has meter exit 1 or predicate false.
//                    VACUOUS when the unmutated base is already red
//                    (baseRun.predicate false): every mutant then reads red.
//   killedRowLocal — at least one flip makes the meter emit a
//                    delta-disposition-evidence finding naming THIS row with the
//                    flipped-to disposition (detail `<lane>:<path>:<line>: <to>`).
//                    This measures whether the flipped-to disposition is itself
//                    refused on that row; it is independent of base colour.
//
// Usage:
//   node c1-flip-sweep-r67.mjs --meter <path> --out <dir> --repo <lane> --rev <40hex> \
//     --fleet <dir> --snapshot <tsv> --audit <tsv> --delta <tsv> [--scratch <dir>] [--concurrency <n>] [--base-only]
//   --base-only: run the meter once on the unmutated delta, write <out>/base-run.json, do not sweep.
// Exit: 0 sweep completed (kills are data, not failure); 2 could not evaluate
// (usage error, unreadable input, vocabulary not found, base run unparseable,
// or any mutant run exit 2 / unparseable).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const die = (msg) => { console.error(JSON.stringify({ schema: 'tabi-c1-flip-sweep-r67', error: msg })); process.exit(2); };

const args = process.argv.slice(2);
const opt = {};
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--base-only') { opt.baseOnly = true; continue; }
  const k = args[i];
  if (!k.startsWith('--')) die(`unexpected argument ${k}`);
  opt[k.slice(2)] = args[++i];
}
for (const k of ['meter', 'out', 'repo', 'rev', 'fleet', 'snapshot', 'audit', 'delta']) {
  if (!opt[k]) die(`--${k} <path> is required`);
}
const meter = path.resolve(opt.meter);
const outDir = path.resolve(opt.out);
const repo = path.resolve(opt.repo);
const fleet = path.resolve(opt.fleet);
const snapshot = path.resolve(opt.snapshot);
const audit = path.resolve(opt.audit);
const delta = path.resolve(opt.delta);
const rev = opt.rev;
if (!/^[0-9a-f]{40}$/.test(rev)) die('--rev must be a 40-hex commit id');
const concurrency = opt.concurrency !== undefined && Number.isSafeInteger(Number(opt.concurrency)) && Number(opt.concurrency) > 0 ? Number(opt.concurrency) : 4;

const meterSrc = fs.readFileSync(meter, 'utf8');
const mDisp = /const DISPOSITIONS = (\[.*?\]);/.exec(meterSrc);
if (!mDisp) die('cannot extract DISPOSITIONS from the meter source');
const VOCAB = JSON.parse(mDisp[1].replace(/'/g, '"'));
if (!Array.isArray(VOCAB) || VOCAB.length !== 3) die(`unexpected vocabulary ${JSON.stringify(VOCAB)}`);

const deltaRaw = fs.readFileSync(delta, 'utf8');
const hasFinalNl = deltaRaw.endsWith('\n');
const body = hasFinalNl ? deltaRaw.slice(0, -1) : deltaRaw;
const lines = body.split('\n');
const rowIdx = [];
for (let i = 1; i < lines.length; i++) {
  if (lines[i] === '') continue;
  const parts = lines[i].split('\t');
  if (parts[0] === 'line') {
    if (parts.length !== 9) die(`delta line ${i + 1}: expected 9 columns, found ${parts.length}`);
    if (!VOCAB.includes(parts[7])) die(`delta line ${i + 1}: disposition ${parts[7]} outside extracted vocabulary`);
    rowIdx.push({ fileLine: i + 1, lane: parts[1], path: parts[2], disposition: parts[7] });
  }
}

const scratchRoot = opt.scratch
  ? path.resolve(opt.scratch)
  : path.join(process.env.HYAKU_SCRATCH || '/fast/scratch/hyaku', 'tabi-r67', 'R67Executor1', 'flip-sweep');
const work = path.join(scratchRoot, `${path.basename(outDir)}-${path.basename(meter, '.mjs')}`);
fs.mkdirSync(work, { recursive: true });
fs.mkdirSync(outDir, { recursive: true });

const baseCopy = path.join(work, 'delta-base.tsv');
fs.writeFileSync(baseCopy, deltaRaw);
const baseSha = sha256(Buffer.from(deltaRaw));

const argvFor = (deltaPath) => [process.execPath, meter, '--repo', repo, '--rev', rev, '--fleet', fleet, '--snapshot', snapshot, '--audit', audit, '--delta', deltaPath, '--json'];
const cmdLine = (deltaPath) => argvFor(deltaPath).map((a) => (/\s/.test(a) ? JSON.stringify(a) : a)).join(' ');

const runMeter = (deltaPath) => new Promise((resolve) => {
  const t0 = Date.now();
  const argv = argvFor(deltaPath);
  const c = spawn(argv[0], argv.slice(1), { stdio: ['ignore', 'pipe', 'pipe'] });
  let so = '';
  let se = '';
  c.stdout.on('data', (d) => { so += d; });
  c.stderr.on('data', (d) => { se += d; });
  c.on('close', (code) => {
    let out = null;
    try { out = JSON.parse(so); } catch {}
    const findings = out && Array.isArray(out.findings) ? out.findings : null;
    resolve({
      cmd: cmdLine(deltaPath),
      exit: code,
      ms: Date.now() - t0,
      predicate: out ? out.predicate : null,
      findingCount: out ? out.findingCount : null,
      evidenceDetails: findings ? findings.filter((f) => f.id === 'delta-disposition-evidence').map((f) => f.detail) : null,
      parseOk: out !== null,
      stderrHead: se ? se.slice(0, 400) : '',
    });
  });
});

const base = await runMeter(baseCopy);
const baseEvidence = base.evidenceDetails ?? [];
fs.writeFileSync(path.join(outDir, 'base-run.json'), JSON.stringify({
  schema: 'tabi-c1-flip-sweep-r67-base', meter, meterSha256: sha256(Buffer.from(meterSrc)),
  delta, deltaSha256: baseSha, argv: base.cmd, exit: base.exit, ms: base.ms,
  predicate: base.predicate, findingCount: base.findingCount, evidenceDetails: base.evidenceDetails,
  parseOk: base.parseOk, stderrHead: base.stderrHead,
}, null, 1));
if (opt.baseOnly) {
  console.log(JSON.stringify({
    schema: 'tabi-c1-flip-sweep-r67-base-summary', meter, deltaSha256: baseSha,
    exit: base.exit, predicate: base.predicate, findingCount: base.findingCount,
    evidenceCount: baseEvidence.length, parseOk: base.parseOk,
  }));
  process.exit(base.exit === 2 || !base.parseOk ? 2 : 0);
}
if (base.exit === 2 || !base.parseOk) {
  die(`base meter run could not be evaluated (exit ${base.exit}, parseOk ${base.parseOk})${base.stderrHead ? ': ' + base.stderrHead : ''}`);
}

const jobs = [];
for (const r of rowIdx) {
  for (const to of VOCAB) {
    if (to === r.disposition) continue;
    const out = [...lines];
    const parts = out[r.fileLine - 1].split('\t');
    parts[7] = to;
    out[r.fileLine - 1] = parts.join('\t');
    const text = out.join('\n') + (hasFinalNl ? '\n' : '');
    const mutant = path.join(work, `row-${String(r.fileLine).padStart(4, '0')}-${to}.tsv`);
    fs.writeFileSync(mutant, text);
    jobs.push({ row: r, to, mutant, mutantSha256: sha256(Buffer.from(text)) });
  }
}

const results = new Array(jobs.length);
let next = 0;
async function worker() {
  while (true) {
    const i = next++;
    if (i >= jobs.length) return;
    const j = jobs[i];
    results[i] = { ...j, ...(await runMeter(j.mutant)) };
  }
}
await Promise.all(Array.from({ length: concurrency }, worker));

const rowsOut = rowIdx.map((r) => {
  const flips = results.filter((x) => x.row.fileLine === r.fileLine).map((x) => {
    const rowDetail = `${r.lane}:${r.path}: ${x.to}`;
    const rowLocalRefused = (x.evidenceDetails ?? []).includes(rowDetail);
    return {
      to: x.to,
      mutant: x.mutant,
      mutantSha256: x.mutantSha256,
      cmd: x.cmd,
      exit: x.exit,
      ms: x.ms,
      predicate: x.predicate,
      findingCount: x.findingCount,
      rowLocalDetail: rowDetail,
      rowLocalRefused,
      literalRefused: x.exit === 1 || x.predicate === false,
      couldNotEvaluate: x.exit === 2 || !x.parseOk,
      stderrHead: x.stderrHead,
    };
  });
  const literalBy = flips.filter((f) => f.literalRefused).map((f) => f.to);
  const localBy = flips.filter((f) => f.rowLocalRefused).map((f) => f.to);
  return {
    fileLine: r.fileLine,
    lane: r.lane,
    path: r.path,
    from: r.disposition,
    baseRowLocalRefused: baseEvidence.includes(`${r.lane}:${r.path}: ${r.disposition}`),
    flips,
    killedLiteral: literalBy.length > 0,
    killedLiteralBy: literalBy,
    killedRowLocal: localBy.length > 0,
    killedRowLocalBy: localBy,
  };
});
const count = (pred) => rowsOut.filter(pred).length;
const matrix = {
  schema: 'tabi-c1-flip-sweep-r67',
  wave: 'round-67/w1/R67Executor1',
  meter,
  meterSha256: sha256(Buffer.from(meterSrc)),
  vocabulary: VOCAB,
  vocabularySource: 'extracted from the meter source by regex (never retyped)',
  repo, rev, fleet, snapshot, audit, delta, deltaSha256: baseSha,
  deltaFileLines: lines.length + (hasFinalNl ? 1 : 0),
  lineRows: rowIdx.length,
  flipsPerRow: VOCAB.length - 1,
  meterRunCount: jobs.length + 1,
  concurrency,
  scratchWork: work,
  baseRun: { cmd: base.cmd, exit: base.exit, predicate: base.predicate, findingCount: base.findingCount, evidenceDetails: base.evidenceDetails, ms: base.ms },
  literalKillVacuous: base.predicate === false,
  killRuleLiteral: 'row killed iff at least one flip has meter exit 1 or predicate false',
  killRuleRowLocal: 'row killed iff at least one flip emits delta-disposition-evidence detail "<lane>:<path>: <flipped-to>" for that row',
  killedLiteralCount: count((r) => r.killedLiteral),
  survivorLiteralCount: count((r) => !r.killedLiteral),
  killedRowLocalCount: count((r) => r.killedRowLocal),
  survivorRowLocalCount: count((r) => !r.killedRowLocal),
  refusedFlipRowLocalCount: rowsOut.reduce((a, r) => a + r.killedRowLocalBy.length, 0),
  baseRowLocalRefusedCount: count((r) => r.baseRowLocalRefused),
  couldNotEvaluateCount: results.filter((x) => x.exit === 2 || !x.parseOk).length,
  rows: rowsOut,
};
fs.writeFileSync(path.join(outDir, 'matrix.json'), JSON.stringify(matrix, null, 1));
console.log(JSON.stringify({
  schema: 'tabi-c1-flip-sweep-r67-summary', meter,
  lineRows: rowIdx.length, meterRunCount: matrix.meterRunCount,
  baseExit: base.exit, basePredicate: base.predicate, baseFindingCount: base.findingCount,
  literalKillVacuous: matrix.literalKillVacuous,
  killedLiteralCount: matrix.killedLiteralCount, survivorLiteralCount: matrix.survivorLiteralCount,
  killedRowLocalCount: matrix.killedRowLocalCount, survivorRowLocalCount: matrix.survivorRowLocalCount,
  baseRowLocalRefusedCount: matrix.baseRowLocalRefusedCount,
  couldNotEvaluateCount: matrix.couldNotEvaluateCount,
}));
process.exit(matrix.couldNotEvaluateCount > 0 ? 2 : 0);
