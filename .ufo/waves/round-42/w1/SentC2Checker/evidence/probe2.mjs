import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const S = '/fast/scratch/hyaku/tabi-r42/SentC2Checker';
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const CHECKER = path.join(LANE, '.ufo/waves/round-42/counters/check-routed-defects-round42.mjs');
const FIX = path.join(S, 'fixture');
const SLICE_IDS = fs.readFileSync(path.join(FIX, '.ufo/waves/round-42/quarantine/slice-ids.txt'), 'utf8').split('\n').map(s => s.trim()).filter(Boolean);

const results = [];
const log = (o) => { results.push(o); console.log(JSON.stringify(o)); };
function run(label, args) {
  const t0 = process.hrtime.bigint();
  const r = spawnSync('node', [CHECKER, ...args], { encoding: 'utf8', timeout: 300000 });
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  let p = null; try { p = JSON.parse(r.stdout); } catch {}
  log({ label, argv: ['node', CHECKER, ...args], exit: r.status, elapsedMs: Math.round(ms),
        stdout: (r.stdout || '').slice(0, 2500), stderr: (r.stderr || '').slice(0, 400),
        predicate: p ? p.predicate : null, error: p && p.error ? p.error : null,
        findings: p ? p.findings : null });
  return r;
}
function g(args) {
  const r = spawnSync('git', ['-c', 'user.name=seat', '-c', 'user.email=seat@local', '-c', 'core.hooksPath=/dev/null', ...args], { cwd: FIX, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
const put = (rel, c) => { const p = path.join(FIX, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, c); };
const commit = (m) => {
  g(['add', '-A']);
  if (g(['status', '--porcelain']) === '') return g(['rev-parse', 'HEAD']); // nothing to commit
  g(['commit', '-q', '-m', m]);
  return g(['rev-parse', 'HEAD']);
};
const TSV = '.ufo/waves/round-42/quarantine/re-adjudication.tsv';
const baseRows = SLICE_IDS.map(id => [id, 'present', `corpus/evidence/round42/quarantine/${id}.md`]);
const writeTsv = (rows, eol = '\n') => fs.writeFileSync(path.join(FIX, TSV), rows.map(r => r.join('\t')).join(eol) + eol);
const SOURCES = 'corpus/SOURCES.md';
const row = (id, teaches, status) => `| ${id} | fixture source | docs | A | fixture scope | fixture anchor | ${teaches} | ${status} | 2026-10-28 | 2026-11-01 | probe |`;
const sources = (te148, te146 = 'fixture teaches for S146') => [
  '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
  '|---|---|---|---|---|---|---|---|---|---|---|', row('S146', te146, 'rejected'), row('S148', te148, 'A'), ''].join('\n');
const TE148 = 'supersedes S146 — A space-separated list of command-line options.';

writeTsv(baseRows);                       // restore clean baseline TSV
put(SOURCES, sources(TE148));
const clean = commit('probe2: clean baseline');
run('CONTROL2 clean baseline', ['--rev', clean, '--repo', FIX, '--json']);

// ---- P8a clean: pipe inside S148 teaches (truncation visible only as shorter quote)
put(SOURCES, sources(TE148.replace('command-line options.', 'command-line options. | EXTRA-JUNK')));
const p8a = commit('probe2 P8a: pipe in S148 teaches');
const p8aRun = run('P8a clean: pipe inside S148 teaches', ['--rev', p8a, '--repo', FIX, '--json']);

// ---- P8c: pipe hides the real verbatim quote (genuine text after pipe)
put(SOURCES, sources('supersedes S146 — Not verbatim junk | A space-separated list of command-line options.'));
const p8c = commit('probe2 P8c: genuine quote hidden after pipe');
run('P8c pipe hides genuine quote', ['--rev', p8c, '--repo', FIX, '--json']);

// ---- P8b clean: pipe inside S146 teaches shifts status cell
put(SOURCES, sources(TE148, 'fixture teaches | EXTRA-JUNK'));
const p8b = commit('probe2 P8b: pipe in S146 teaches');
run('P8b clean: pipe inside S146 teaches', ['--rev', p8b, '--repo', FIX, '--json']);
put(SOURCES, sources(TE148));
const restored = commit('probe2: restore SOURCES');

// ---- P4c: CRLF in slice-ids.txt
fs.writeFileSync(path.join(FIX, '.ufo/waves/round-42/quarantine/slice-ids.txt'), SLICE_IDS.join('\r\n') + '\r\n');
const crlfSlice = commit('probe2: CRLF slice-ids.txt');
run('P4c slice-ids.txt CRLF', ['--rev', crlfSlice, '--repo', FIX, '--json']);
fs.writeFileSync(path.join(FIX, '.ufo/waves/round-42/quarantine/slice-ids.txt'), SLICE_IDS.join('\n') + '\n');

// ---- X1: trailing tab (4 cells), X2: BOM, X3: blank-line-only noise contained
writeTsv(baseRows.map((r, i) => (i === 0 ? [...r, 'extra'] : r)));
const xtab = commit('probe2 X1: trailing tab in first row');
run('X1 trailing tab -> 4 cells', ['--rev', xtab, '--repo', FIX, '--json']);
writeTsv([['\uFEFF' + baseRows[0][0], ...baseRows[0].slice(1)], ...baseRows.slice(1)]);
const xbom = commit('probe2 X2: UTF-8 BOM on first row id');
run('X2 BOM on first id', ['--rev', xbom, '--repo', FIX, '--json']);
writeTsv(baseRows);
const xclean = commit('probe2: restore TSV');

// ---- X4: nonexistent 40-hex object
run('X4 rev is 40 hex but no such object', ['--rev', 'deadbeef'.repeat(5), '--repo', FIX, '--json']);
// ---- X5: --repo is a regular file, and --repo /etc/passwd (fail-closed, no read)
run('X5a --repo regular file (/etc/passwd)', ['--rev', xclean, '--repo', '/etc/passwd', '--json']);
run('X5b --repo empty string', ['--rev', xclean, '--repo', '', '--json']);
// ---- X6: unknown flag silently ignored
run('X6 unknown flag ignored', ['--rev', xclean, '--repo', FIX, '--bogus-flag', '--json']);
// ---- X7: --rev uppercase hex
run('X7 uppercase 40-hex rev', ['--rev', xclean.toUpperCase(), '--repo', FIX, '--json']);
// ---- X8: duplicated --rev (last wins) and --rev consuming a flag token
run('X8a duplicate --rev (last wins)', ['--rev', 'deadbeef'.repeat(5), '--rev', xclean, '--repo', FIX, '--json']);
run('X8b --rev swallows --repo token', ['--rev', '--repo', xclean]);
// ---- X9: --json absent (output format unchanged?)
run('X9 no --json flag', ['--rev', xclean, '--repo', FIX]);

// ---- timing decomposition: 5000 rows, invalid verdict (skips per-row git spawn)
writeTsv(Array.from({ length: 5000 }, (_, i) => [SLICE_IDS[i % 38], 'bogus', 'x']));
const bigBad = commit('probe2 P6b: 5000 rows, invalid verdict (no git spawn per row)');
run('P6b 5000 rows invalid verdict', ['--rev', bigBad, '--repo', FIX, '--json']);

// ---- 20000 rows valid verdict (linear growth check)
writeTsv(Array.from({ length: 20000 }, (_, i) => [SLICE_IDS[i % 38], 'present', `corpus/evidence/round42/quarantine/${SLICE_IDS[i % 38]}.md`]));
const big20k = commit('probe2 P6c: 20000 rows valid verdict');
run('P6c 20000 rows valid verdict', ['--rev', big20k, '--repo', FIX, '--json']);
writeTsv(baseRows);
commit('probe2: final restore');

fs.writeFileSync(path.join(S, 'probe2-results.json'), JSON.stringify({ revs: { clean, p8a, p8b, p8c, crlfSlice, xtab, xbom, xclean, bigBad, big20k }, results }, null, 1));
console.log('DONE2');
