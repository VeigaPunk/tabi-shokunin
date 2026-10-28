import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const S = '/fast/scratch/hyaku/tabi-r42/SentC2Checker';
const SEAT = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-42/w1/SentC2Checker';
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const CHECKER = path.join(LANE, '.ufo/waves/round-42/counters/check-routed-defects-round42.mjs');
const FIX = path.join(S, 'fixture');
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');

const results = [];
const log = (o) => { results.push(o); console.log(JSON.stringify(o)); };

function run(label, args, opts = {}) {
  const t0 = process.hrtime.bigint();
  const r = spawnSync('node', [CHECKER, ...args], { encoding: 'utf8', timeout: 300000, ...opts });
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  let parsed = null;
  try { parsed = JSON.parse(r.stdout); } catch { /* non-json */ }
  log({
    label, argv: ['node', CHECKER, ...args], exit: r.status, signal: r.signal,
    elapsedMs: Math.round(ms), stdout: (r.stdout || '').slice(0, 4000),
    stderr: (r.stderr || '').slice(0, 600),
    findingIds: parsed ? parsed.findings.map((f) => f.id) : null,
    predicate: parsed ? parsed.predicate : null,
    error: parsed && parsed.error ? parsed.error : null,
  });
  return { r, parsed, ms };
}

function g(args, cwd = FIX) {
  const r = spawnSync('git', ['-c', 'user.name=seat', '-c', 'user.email=seat@local', '-c', 'core.hooksPath=/dev/null', ...args], { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${r.stderr}`);
  return r.stdout.trim();
}
const put = (rel, content) => {
  const p = path.join(FIX, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
};
const commit = (msg) => { g(['add', '-A']); g(['commit', '-q', '-m', msg]); return g(['rev-parse', 'HEAD']); };
const writeTsv = (rows, eol = '\n') =>
  fs.writeFileSync(path.join(FIX, '.ufo/waves/round-42/quarantine/re-adjudication.tsv'),
    rows.map((r) => r.join('\t')).join(eol) + eol);

// ---------------------------------------------------------------- fixture build
fs.rmSync(FIX, { recursive: true, force: true });
fs.mkdirSync(FIX, { recursive: true });
g(['init', '-q', '-b', 'main'], FIX);

const receipt = JSON.stringify({ schema: 'probe-fixture-receipt', pad: 'a'.repeat(1400), n: 1 }, null, 1) + '\n';
const witness = JSON.stringify({ schema: 'probe-fixture-witness', pad: 'b'.repeat(1400), n: 2 }, null, 1) + '\n';
const HTML = '<html><body><h3>NODE_OPTIONS=options...</h3><p>A space-separated list of command-line options.</p></body></html>\n';
const SLICE_IDS = fs.readFileSync(path.join(LANE, '.ufo/waves/round-42/quarantine/slice-ids.txt'), 'utf8')
  .split('\n').map((s) => s.trim()).filter(Boolean);

put('corpus/evidence/round41/playwright-egress/receipt.json', receipt);
put('corpus/evidence/round41/playwright-egress/receipt.witness.json', witness);
put('.ufo/waves/round-41/measure/c1-measure.json',
  JSON.stringify({ schema: 'probe-fixture-measure', receiptSha256: sha(receipt), witnessSha256: sha(witness) }, null, 1) + '\n');
put('.ufo/waves/round-41/sources/node-cli-v24.21.0.html', HTML);
put('.ufo/waves/round-41/controls/c1-baseline-noop.out',
  '# fixture control\n#   git -C . ls-tree -r --name-only deadbeef -- corpus/evidence/round41 | wc -l\n0\n');
put('.ufo/waves/round-42/quarantine/slice-ids.txt', SLICE_IDS.join('\n') + '\n');
for (const id of SLICE_IDS) put(`corpus/evidence/round42/quarantine/${id}.md`, `# ${id} ${'e'.repeat(260)}\n`);
const row = (id, teaches, status) =>
  `| ${id} | fixture source | docs | A | fixture scope | fixture anchor | ${teaches} | ${status} | 2026-10-28 | 2026-11-01 | probe |`;
const sources = (teaches148, teaches146 = 'fixture teaches for S146') => [
  '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
  '|---|---|---|---|---|---|---|---|---|---|---|',
  row('S146', teaches146, 'rejected'),
  row('S148', teaches148, 'A'),
  '',
].join('\n');
const TE148 = 'supersedes S146 — A space-separated list of command-line options.';
put('corpus/SOURCES.md', sources(TE148));
const baseRows = SLICE_IDS.map((id) => [id, 'present', `corpus/evidence/round42/quarantine/${id}.md`]);
writeTsv(baseRows);

const revs = {};
revs.base = commit('probe fixture baseline');

// ---- control: fixture must be predicate-true (proves fixture validity)
run('CONTROL fixture baseline (expect exit 0 predicate true)', ['--rev', revs.base, '--repo', FIX, '--json']);

// ---------------------------------------------------------------- P3 symlink
const link = path.join(S, 'symlink-to-lane');
fs.rmSync(link, { force: true });
fs.symlinkSync(LANE, link);
const p3link = run('P3 --repo symlink-to-lane', ['--rev', '9b6de3a19de11abdb80e82a1310abc64a40215bb', '--repo', link, '--json']);
const p3real = run('P3b --repo real lane path', ['--rev', '9b6de3a19de11abdb80e82a1310abc64a40215bb', '--repo', LANE, '--json']);
log({ label: 'P3c compare', symlinkOutputEqualsReal: p3link.r.stdout === p3real.r.stdout,
      symlinkExit: p3link.r.status, realExit: p3real.r.status });

// ---------------------------------------------------------------- P2 canary
const canary = path.join(S, 'pwned-canary');
fs.writeFileSync(canary, 'still here\n');
const pre = fs.existsSync(canary);
run('P2a --rev injection', ['--rev', `; rm -f ${canary}`, '--repo', FIX, '--json']);
run('P2b --repo injection', ['--rev', revs.base, '--repo', `.; rm -f ${canary}`, '--json']);
run('P2c --repo command substitution', ['--rev', revs.base, '--repo', `$(rm -f ${canary})`, '--json']);
run('P2d --rev injection only (no --repo)', ['--rev', `\`rm -f ${canary}\``, '--json']);
log({ label: 'P2e canary', canaryPreExists: pre, canaryStillExists: fs.existsSync(canary), canaryPath: canary });

// ---------------------------------------------------------------- P4 CRLF
writeTsv(baseRows, '\r\n');
revs.crlf = commit('probe P4: TSV with CRLF line endings');
run('P4 TSV CRLF', ['--rev', revs.crlf, '--repo', FIX, '--json']);
log({ label: 'P4b bytes', tsvFirstBytesOnDisk: JSON.stringify(fs.readFileSync(path.join(FIX, '.ufo/waves/round-42/quarantine/re-adjudication.tsv'), 'utf8').slice(0, 60)) });
writeTsv(baseRows); // restore LF

// ---------------------------------------------------------------- P5 traversal
const trav = baseRows.map((r) => [...r]);
trav[0][2] = '../../etc/passwd';
trav[1][2] = '/etc/passwd';
writeTsv(trav);
revs.traversal = commit('probe P5: evidence path traversal and absolute path');
run('P5 evidence ../../etc/passwd (+ /etc/passwd)', ['--rev', revs.traversal, '--repo', FIX, '--json']);
writeTsv(baseRows);

// ---------------------------------------------------------------- P7 unicode/emoji
const uniTsv = baseRows.map(([id, v, e], i) => [i === 0 ? 'Ｓ102🦊' : id, v, e]);
writeTsv(uniTsv);
revs.unicodeMismatch = commit('probe P7a: emoji/fullwidth id in TSV only');
run('P7a unicode id mismatch', ['--rev', revs.unicodeMismatch, '--repo', FIX, '--json']);
const uniIds = SLICE_IDS.map((id, i) => (i === 0 ? 'Ｓ102🦊' : i === 1 ? 'S106-ünïcødé-🧪' : id));
put('.ufo/waves/round-42/quarantine/slice-ids.txt', uniIds.join('\n') + '\n');
const uniTsv2 = uniIds.map((id) => [id, 'present', `corpus/evidence/round42/quarantine/${SLICE_IDS[uniIds.indexOf(id)]}.md`]);
writeTsv(uniTsv2);
revs.unicodeBoth = commit('probe P7b: unicode ids in TSV and slice-ids');
run('P7b unicode ids consistent', ['--rev', revs.unicodeBoth, '--repo', FIX, '--json']);
put('.ufo/waves/round-42/quarantine/slice-ids.txt', SLICE_IDS.join('\n') + '\n');

// ---------------------------------------------------------------- P8 pipes in teaches
const pipe148 = TE148.replace('command-line options.', 'command-line options. | EXTRA-JUNK-AFTER-PIPE');
put('corpus/SOURCES.md', sources(pipe148));
revs.pipe148 = commit('probe P8a: pipe inside S148 teaches cell');
run('P8a pipe inside S148 teaches', ['--rev', revs.pipe148, '--repo', FIX, '--json']);
const pipe146 = 'fixture teaches | EXTRA-JUNK-AFTER-PIPE';
put('corpus/SOURCES.md', sources(TE148, pipe146));
revs.pipe146 = commit('probe P8b: pipe inside S146 teaches cell');
run('P8b pipe inside S146 teaches', ['--rev', revs.pipe146, '--repo', FIX, '--json']);
put('corpus/SOURCES.md', sources(TE148));

// ---------------------------------------------------------------- P6 5000 rows
const big = [];
const reps = Math.ceil(5000 / SLICE_IDS.length);
for (let k = 0; k < reps && big.length < 5000; k++)
  for (const id of SLICE_IDS) { if (big.length < 5000) big.push([id, 'present', `corpus/evidence/round42/quarantine/${id}.md`]); }
writeTsv(big);
revs.big = commit(`probe P6: ${big.length}-row TSV (duplicate ids, valid verdicts)`);
log({ label: 'P6a fixture', rowCount: big.length, tsvBytes: fs.statSync(path.join(FIX, '.ufo/waves/round-42/quarantine/re-adjudication.tsv')).size });
run(`P6 ${big.length}-row TSV`, ['--rev', revs.big, '--repo', FIX, '--json']);
writeTsv(baseRows);
revs.restored = commit('probe: restore baseline TSV');

// ---------------------------------------------------------------- P1 short rev on fixture
run('P1b short rev on fixture', ['--rev', revs.base.slice(0, 7), '--repo', FIX, '--json']);

fs.writeFileSync(path.join(S, 'probe-results.json'), JSON.stringify({ revs, results }, null, 1));
console.log('DONE');
