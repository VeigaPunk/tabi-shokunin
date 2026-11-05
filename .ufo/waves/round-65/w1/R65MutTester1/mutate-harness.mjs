// Scratch mutation harness (R65MutTester1). Generates single-line mutants of the
// v22 delta-disposition-conflict pass in the scratch copy, runs the v22 selftest
// and the three ledgers (forgery A, forgery B, positive C) against each, and writes
// mutants.json into the seat deliverable dir. Never touches the lane tree or the fleet.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';

const D = '/fast/scratch/hyaku/tabi-r65/R65MutTester1';
const CLONE = `${D}/clone`;
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const FLEET = '/home/vgpnk/Projects/shokunin';
const BASE = '58ed8c7a21b9dcb403e46fc1d4e2d8bb68511162';
const OUT = `${LANE}/.ufo/waves/round-65/w1/R65MutTester1`;
const FORGERY_A = `${LANE}/.ufo/waves/round-65/controls/c2-fixtures/delta-dup-contradiction.tsv`;
const FORGERY_B = `${LANE}/.ufo/waves/round-62/w1/R62Reviewer/real-conflicting-delta.tsv`;
const POS_C = `${CLONE}/corpus/adjacency-host-delta-r62.tsv`;
const AUDIT = `${CLONE}/corpus/adjacency-host-audit-r62.tsv`;
const SNAP = `${CLONE}/.ufo/waves/round-62/c1/snapshot-r62.tsv`;
const TARGET = `${D}/v22-target-copy.mjs`;
const CONFLICT = 'delta-disposition-conflict';

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const must = (cond, msg) => { if (!cond) throw new Error('ASSERT: ' + msg); };

// 0. clone guard
const top = spawnSync('git', ['-C', CLONE, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).stdout.trim();
must(top === CLONE, `clone toplevel ${top}`);
const head = spawnSync('git', ['-C', CLONE, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim();
must(head === BASE, `clone head ${head}`);

// 1. target + exact-line anchors (1-based line numbers)
const srcText = fs.readFileSync(TARGET, 'utf8');
const lines = srcText.split('\n');
const at = (n) => lines[n - 1];
must(at(179).includes('for (const r of inputs.deltaRows) {'), 'L179 loop header');
must(at(182).includes('const key = `${r[1]}\\t${relPath}\\t${line}`;'), 'L182 key');
must(at(185).includes("if (first !== r[7]) add('delta-disposition-conflict'"), 'L185 compare+add');

const mutants = [
  { id: 'M1', line: 185, desc: 'invert disposition comparison', fn: (s) => s.replace('if (first !== r[7])', 'if (first === r[7])') },
  { id: 'M2', line: 185, desc: 'drop add() call', fn: (s) => s.replace("add('delta-disposition-conflict', ", 'void (') },
  { id: 'M3', line: 182, desc: 'key on lane+relPath only (drop line)', fn: (s) => s.replace('\\t${line}`', '`') },
  { id: 'M4', line: 182, desc: 'key on disposition only', fn: (s) => s.replace(/const key = .*;$/, 'const key = r[7];') },
  { id: 'M5', line: 185, desc: 'push on every duplicate (ignore disposition)', fn: (s) => s.replace('if (first !== r[7])', 'if (true)') },
  { id: 'M6', line: 182, desc: "use first row's key only", fn: (s) => s.replace(/const key = .*;$/, 'const key = lineDispositionAt.keys().next().value ?? `${r[1]}\\t${relPath}\\t${line}`;') },
  { id: 'M7', line: 185, desc: 'swallow add() inside try', fn: (s) => s.replace("if (first !== r[7]) add(", 'if (first !== r[7]) try { add(').replace(/\);$/, '); } catch {}') },
  { id: 'M8', line: 179, desc: 'reverse iteration (last row wins)', fn: (s) => s.replace('inputs.deltaRows)', '[...inputs.deltaRows].reverse())') },
];

fs.mkdirSync(`${D}/mut`, { recursive: true });
const variants = [];
const writeVariant = (id, line, desc, newLine, origLine) => {
  const copy = lines.slice();
  copy[line - 1] = newLine;
  const file = `${D}/mut/${id}.mjs`;
  fs.writeFileSync(file, copy.join('\n'));
  const diffCount = copy.filter((l, i) => l !== lines[i]).length + Math.abs(copy.length - lines.length);
  must(diffCount === 1, `${id} changed ${diffCount} lines`);
  variants.push({ id, file, line, desc, original: origLine, mutated: newLine, sha256: sha256(Buffer.from(copy.join('\n'))) });
};
fs.copyFileSync(TARGET, `${D}/mut/B0.mjs`);
variants.push({ id: 'B0', file: `${D}/mut/B0.mjs`, line: 0, desc: 'unmutated control (v22 as built)', original: null, mutated: null, sha256: sha256(fs.readFileSync(TARGET)) });
for (const m of mutants) {
  const orig = at(m.line);
  const nu = m.fn(orig);
  must(nu !== orig, `${m.id} did not change line ${m.line}`);
  writeVariant(m.id, m.line, m.desc, nu, orig);
}

// 2. runners
const runNode = (file, args) => {
  const r = spawnSync(process.execPath, [file, ...args], { encoding: 'utf8', timeout: 600000, maxBuffer: 512 * 1024 * 1024 });
  return { status: r.status, signal: r.signal, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
};
const parseJson = (s) => { try { return JSON.parse(s); } catch { return null; } };
const cliArgs = (delta) => ['--repo', CLONE, '--rev', BASE, '--fleet', FLEET, '--snapshot', SNAP, '--audit', AUDIT, '--delta', delta, '--json'];

const summarizeCli = (res) => {
  const j = parseJson(res.stdout);
  const ids = j ? (j.findings ?? []).map((f) => f.id) : null;
  return {
    exit: res.status, signal: res.signal, schema: j?.schema ?? null, predicate: j?.predicate ?? null,
    findingIds: ids, conflictFindings: j ? (j.findings ?? []).filter((f) => f.id === CONFLICT).map((f) => f.detail) : null,
    stderr: res.stderr.trim().slice(0, 300),
  };
};
const summarizeSelftest = (res) => {
  const j = parseJson(res.stdout);
  return {
    exit: res.status, signal: res.signal, parsed: j !== null, schema: j?.schema ?? null,
    allPass: j?.allPass ?? null, cases: j?.cases ?? null, pass: j?.pass ?? null,
    failing: j ? (j.results ?? []).filter((c) => !c.ok).map((c) => c.name) : null,
    stderr: res.stderr.trim().slice(0, 300),
  };
};

// 3. per-variant run + verdict
const results = [];
for (const v of variants) {
  const st = summarizeSelftest(runNode(v.file, ['--selftest']));
  const fa = summarizeCli(runNode(v.file, cliArgs(FORGERY_A)));
  const fb = summarizeCli(runNode(v.file, cliArgs(FORGERY_B)));
  const pc = summarizeCli(runNode(v.file, cliArgs(POS_C)));
  const killedBy = [];
  // (a) selftest red: non-zero exit, unparseable, or any case failing
  if (!(st.parsed && st.allPass === true && st.exit === 0)) killedBy.push('a-selftest-red');
  // (b) forgery not refused with the finding
  const refusedWithFinding = (f) => f.exit === 1 && (f.findingIds ?? []).includes(CONFLICT);
  if (!refusedWithFinding(fa)) killedBy.push('b-forgery-A-not-refused-with-finding');
  if (!refusedWithFinding(fb)) killedBy.push('b-forgery-B-not-refused-with-finding');
  // (c) positive ledger refused
  if (pc.exit !== 0) killedBy.push('c-positive-refused');
  results.push({
    id: v.id, desc: v.desc, line: v.line || null, original: v.original, mutated: v.mutated, mutantSha256: v.sha256,
    selftest: st, forgeryA: fa, forgeryB: fb, positive: pc,
    verdict: killedBy.length ? 'KILLED' : 'SURVIVED', killedBy,
  });
  console.log(`${v.id} ${killedBy.length ? 'KILLED' : 'SURVIVED'} st=${st.exit}/${st.failing?.length ?? '?'}fail A=${fa.exit}:${refusedWithFinding(fa)} B=${fb.exit}:${refusedWithFinding(fb)} C=${pc.exit} ${killedBy.join(',')}`);
}

// 4. ledger stats (same keying as the meter: lane, relPath (cell minus final :digits), line)
const ledgerStats = (file) => {
  const rows = fs.readFileSync(file, 'utf8').split('\n').map((l) => l.replace(/\r$/, '')).filter((l) => l.length).map((l) => l.split('\t'));
  const lineRows = rows.filter((r) => r[0] === 'line');
  const seen = new Map();
  let conflicts = 0, sameDupes = 0;
  const conflictKeys = [];
  for (const r of lineRows) {
    const cell = r[2] ?? ''; const cut = cell.lastIndexOf(':');
    const relPath = cut === -1 ? cell : cell.slice(0, cut);
    const line = cut === -1 ? null : cell.slice(cut + 1);
    const k = `${r[1]}\t${relPath}\t${line}`;
    if (!seen.has(k)) { seen.set(k, r[7]); continue; }
    if (seen.get(k) !== r[7]) { conflicts++; conflictKeys.push(`${r[1]}:${cell}: ${seen.get(k)} vs ${r[7]}`); } else sameDupes++;
  }
  return { file, lineRows: lineRows.length, sameKeyConflicts: conflicts, sameKeySameDispositionDupes: sameDupes, conflictKeys };
};
const stats = { forgeryA: ledgerStats(FORGERY_A), forgeryB: ledgerStats(FORGERY_B), positiveC: ledgerStats(POS_C) };

const baseline = results.find((r) => r.id === 'B0');
const mutantRows = results.filter((r) => r.id !== 'B0');
const out = {
  schema: 'tabi-r65-c1-mutants',
  mutator: 'R65MutTester1',
  target: { path: '.ufo/waves/round-65/w1/R65Executor1/c1-adjacency-host-v22.mjs', copiedTo: TARGET, sha256: sha256(fs.readFileSync(TARGET)) },
  base: BASE, fleet: FLEET,
  inputs: { forgeryA: FORGERY_A.replace(LANE + '/', ''), forgeryB: FORGERY_B.replace(LANE + '/', ''), positiveC: 'corpus/adjacency-host-delta-r62.tsv (base blob)' },
  ledgerStats: stats,
  control: { id: 'B0', selftest: baseline.selftest, forgeryA: baseline.forgeryA, forgeryB: baseline.forgeryB, positive: baseline.positive },
  mutants: mutantRows,
  totals: { mutants: mutantRows.length, killed: mutantRows.filter((r) => r.verdict === 'KILLED').length, survived: mutantRows.filter((r) => r.verdict === 'SURVIVED').map((r) => r.id) },
};
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(`${OUT}/mutants.json`, JSON.stringify(out, null, 1) + '\n');
console.log('WROTE', `${OUT}/mutants.json`);
console.log('CONTROL', JSON.stringify(out.control.selftest.allPass), out.control.forgeryA.exit, out.control.forgeryB.exit, out.control.positive.exit);
console.log('STATS', JSON.stringify({ A: stats.forgeryA.sameKeyConflicts, B: stats.forgeryB.sameKeyConflicts, C: stats.positiveC.sameKeyConflicts, Cdupes: stats.positiveC.sameKeySameDispositionDupes }));
