// harness.mjs — R68Mut2 exact-location mutation harness for C2 gate.
// Mutants are exact string replacements on a pristine copy; each must match
// exactly once (count asserted). Each mutant runs the internal selftest and the
// public parser (--skill/--repo) on every fixture; kill = rc or stdout differs
// from pristine receipt.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const S = '/fast/scratch/hyaku/tabi-r68/R68Mut2';
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const RECEIPTS = path.join(LANE, '.ufo/waves/round-68/w1/R68Mut2/receipts');
fs.mkdirSync(RECEIPTS, { recursive: true });
const sha = (buf) => createHash('sha256').update(buf).digest('hex');

const pristine = fs.readFileSync(path.join(S, 'gate.pristine.mjs'), 'utf8');
const pristineSha = sha(pristine);
const fixtures = fs.readdirSync(path.join(S, 'fx')).filter((f) => f.endsWith('.md')).sort();

// Exact-location mutants: [id, class, [[old, new], ...]]
const MUTANTS = [
  ['M01', 'sha-equality', [[
    "else if (shaInRow !== sha256File(abs)) findings.push(['sha-mismatch', p]);",
    'else if (false) findings.push([\'sha-mismatch\', p]);']]],
  ['M02', 'sha-equality-prefix', [
    ["const shaInRow = (pinned.match(/[0-9a-f]{64}/) || [])[0];",
      'const shaInRow = (pinned.match(/[0-9a-f]{8,64}/) || [])[0];'],
    ["else if (shaInRow !== sha256File(abs)) findings.push(['sha-mismatch', p]);",
      "else if (!sha256File(abs).startsWith(shaInRow)) findings.push(['sha-mismatch', p]);"]]],
  ['M03', 'entry-binding-basename', [[
    "if (!entry || !entry.includes(p)) findings.push(['entry-unbound', p]);",
    "if (!entry || !entry.includes(p.split('/').pop())) findings.push(['entry-unbound', p]);"]]],
  ['M04', 'owner-missing', [[
    "if (!owner || owner === '—') findings.push(['field-missing', p + ':owner']);",
    "if (!owner) findings.push(['field-missing', p + ':owner']);"]]],
  ['M05', 'scope-missing-dropped', [[
    "if (!scope || scope === '—') findings.push(['field-missing', p + ':scope']);",
    'if (false) findings.push([\'field-missing\', p + \':scope\']);']]],
  ['M06', 'verdict-missing-dash', [[
    "if (!verdicts || verdicts === '—') findings.push(['field-missing', p + ':verdicts']);",
    "if (!verdicts) findings.push(['field-missing', p + ':verdicts']);"]]],
  ['M07', 'section-recognition-permissive', [[
    "const start = lines.findIndex((l) => l.trim() === SECTION);",
    "const start = lines.findIndex((l) => l.trim().replace(/[—–-]/g, '-') === SECTION.replace(/[—–-]/g, '-'));"]]],
  ['M08', 'section-terminator-removed', [[
    "if (l.startsWith('## ') && l.trim() !== SECTION) break;",
    'if (false) break;']]],
  ['M09', 'duplicate-row-unchecked', [[
    "if (byPath.has(inst)) findings.push(['duplicate-row', String(i + 1)]);",
    '']]],
  ['M10', 'expected-path-dropped', [[
    "  'scripts/verify-live-r67.mjs',\n", '']]],
  ['M11', 'selftest-explicit-dash-rejected', [[
    "const selfOk = selftest && selftest !== '—' && (selftest.startsWith('—') || /--self-?test/.test(selftest));",
    "const selfOk = selftest && selftest !== '—' && /--self-?test/.test(selftest);"]]],
];

// Pristine-only sanity: each mutant's old string must occur exactly once.
const applied = [];
for (const [id, cls, pairs] of MUTANTS) {
  let text = pristine;
  for (const [oldS, newS] of pairs) {
    const n = text.split(oldS).length - 1;
    if (n !== 1) throw new Error(`${id}: old string occurs ${n} times`);
    text = text.replace(oldS, newS);
  }
  if (text === pristine) throw new Error(`${id}: no change`);
  const file = path.join(S, `mut-${id}.mjs`);
  fs.writeFileSync(file, text);
  applied.push({ id, cls, file, producerSha: sha(text), pristineSha, mutantBytes: text.length });
}

function run(gateFile, args, cwd = S) {
  const argv = [gateFile, ...args];
  try {
    const out = execFileSync('node', argv, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { argv: ['node', ...argv], rc: 0, stdout: out.trim() };
  } catch (e) {
    return { argv: ['node', ...argv], rc: e.status, stdout: String(e.stdout || '').trim(), stderr: String(e.stderr || '').trim().split('\n')[0] };
  }
}

const fxSha = Object.fromEntries(fixtures.map((f) => [f, sha(fs.readFileSync(path.join(S, 'fx', f)))]));
const selfargsFor = (tag) => ['--selftest', '--scratch', path.join(S, 'st', tag)];
const publicArgs = (f) => ['--skill', path.join(S, 'fx', f), '--repo', LANE];

const report = { pristine: {}, mutants: [] };
// Pristine receipts (the baseline every mutant is compared against).
report.pristine.selftest = run(path.join(S, 'gate.pristine.mjs'), selfargsFor('pristine'));
report.pristine.public = Object.fromEntries(fixtures.map((f) => [f, run(path.join(S, 'gate.pristine.mjs'), publicArgs(f))]));
report.pristine.fixtureSha = fxSha;
report.pristine.producerSha = pristineSha;

for (const m of applied) {
  const st = run(m.file, selfargsFor(m.id));
  const pub = Object.fromEntries(fixtures.map((f) => [f, run(m.file, publicArgs(f))]));
  const selfKilled = st.rc !== report.pristine.selftest.rc || st.stdout !== report.pristine.selftest.stdout;
  const pubKilledBy = fixtures.filter((f) => pub[f].rc !== report.pristine.public[f].rc || pub[f].stdout !== report.pristine.public[f].stdout);
  const killed = selfKilled || pubKilledBy.length > 0;
  report.mutants.push({
    id: m.id, class: m.cls, producerSha: m.producerSha, pristineSha: m.pristineSha,
    selftest: { ...st, killed: selfKilled },
    public: pub,
    publicKilledBy: pubKilledBy,
    verdict: killed ? 'killed' : 'survived',
    killedBy: [...(selfKilled ? ['selftest'] : []), ...pubKilledBy.map((f) => 'public:' + f)],
  });
}
report.fixtureSha = fxSha;
const out = path.join(S, 'harness-report.json');
fs.writeFileSync(out, JSON.stringify(report, null, 2));
console.log('wrote', out, 'pristine-selftest-rc', report.pristine.selftest.rc);
for (const m of report.mutants) console.log(m.id, m.class, m.verdict, 'selftest', m.selftest.killed ? 'KILL' : 'pass', 'public', m.publicKilledBy.join(',') || '-');
