// MutGateV2 mutation harness — gate v2 receipt leg at 042d6d9.
// One single-point mutant at a time, committed in the scratch clone, then:
//   detector A = gate --selftest (44 cases), detector B = frozen battery --rev <mutant>.
// Clone is reset to the integration commit and byte-verified before and after every mutant.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, appendFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const S = '/fast/scratch/hyaku/tabi-r33/MutGateV2';
const CLONE = join(S, 'clone');
const GATE = 'scripts/check-bidi-runtime.mjs';
const GATE_ABS = join(CLONE, GATE);
const BASE_REV = '042d6d9abf97d567d495652a85eabc851b81adc1';
const PRISTINE_SHA = '62453b55e5e5de331ee6e8fdb3fa8b8ddbf3b43a7b6da944a9544b3af8deac75';
const BATTERY = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs';
const TMP = join(S, 'tmp');
const OUT = join(S, 'out');
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const ENV = { PATH: process.env.PATH, HOME: process.env.HOME, TMPDIR: TMP, GIT_CONFIG_NOSYSTEM: '1', LC_ALL: 'C' };

const MUTANTS = [
  { id: 'M01', area: 'x3-duplicate-id threshold', find: `else if ((idCounts.get(id) || 0) > 1)`, replace: `else if ((idCounts.get(id) || 0) > 2)` },
  { id: 'M01b', area: 'x3-duplicate-id disabled', find: `else if ((idCounts.get(id) || 0) > 1) {`, replace: `else if (false) {` },
  { id: 'M02', area: 'x4-measured-cell decorated (live) suffix', find: `const MEASURED = /^(yes|no)(?:\\s*[—–-]\\s*\\S[\\s\\S]*)?$/i;`, replace: `const MEASURED = /^(yes|no)(?:\\s*[—–-]\\s*\\S[\\s\\S]*)?(?:\\s*\\(live\\))?$/i;` },
  { id: 'M03', area: 'x4-measured-cell verdict case folding', find: `return { verdict: m[1].toLowerCase(), measured: true, detail: null };`, replace: `return { verdict: m[1], measured: true, detail: null };` },
  { id: 'M04', area: 'transcript path distinctness', find: `if (new Set(runs.map((r) => r.path)).size !== runs.length) receiptFinding = \`transcript path repeated across runs: ${'$'}{runs.map((r) => r.path).join(", ")}\`;`, replace: `if (false) receiptFinding = \`transcript path repeated across runs\`;` },
  { id: 'M05', area: 'transcript sha256 distinctness', find: `else if (new Set(runs.map((r) => r.sha)).size !== runs.length) receiptFinding = "transcript sha256 repeated across runs (byte-identical copies)";`, replace: `;` },
  { id: 'M06', area: 'sessionId regex shape (uppercase allowed)', find: `const SESSION_ID = /^[0-9a-f]{32}$/;`, replace: `const SESSION_ID = /^[0-9a-fA-F]{32}$/;` },
  { id: 'M07', area: 'webSocketUrl sessionId binding', find: `if (m[1] !== sid) return { why: \`webSocketUrl session segment ${'$'}{m[1]} != sessionId ${'$'}{sid}\` };`, replace: `` },
  { id: 'M08', area: 'context-id regex case', find: `const CONTEXT_ID = /^[0-9A-F]{32}$/;`, replace: `const CONTEXT_ID = /^[0-9a-fA-F]{32}$/;` },
  { id: 'M09', area: 'DRIVER_ALLOW widened with ROWS', find: `const DRIVER_ALLOW = new Set(["FIXTURE", "FIXTURE_SHA256", "FIXTURE_HEADER", "VIEWPORT", "DATA_TEXT", "serveFixture"]);`, replace: `const DRIVER_ALLOW = new Set(["FIXTURE", "FIXTURE_SHA256", "FIXTURE_HEADER", "VIEWPORT", "DATA_TEXT", "serveFixture", "ROWS"]);` },
  { id: 'M10', area: 'DRIVER_ALLOW drops serveFixture', find: `", "VIEWPORT", "DATA_TEXT", "serveFixture"]);`, replace: `", "VIEWPORT", "DATA_TEXT"]);` },
  { id: 'M11', area: 're-export detection (resolve inverted)', find: `if (spec.startsWith(".")) return posix.normalize(posix.join(posix.dirname(driverPath), spec)) === GATE_PATH;`, replace: `if (spec.startsWith(".")) return posix.normalize(posix.join(posix.dirname(driverPath), spec)) !== GATE_PATH;` },
  { id: 'M12', area: 're-export detection (non-named kinds skipped)', find: 'return `driver has a ${s.kind} relation to this gate (${s.spec})`;', replace: `continue;` },
  { id: 'M13', area: 'gate-sha byte-copy comparison inverted', find: `else if (gateBuf !== null && sha256(drv) === sha256(gateBuf)) receiptFinding = "driver is a byte copy of this gate";`, replace: `else if (gateBuf !== null && sha256(drv) !== sha256(gateBuf)) receiptFinding = "driver is a byte copy of this gate";` },
  { id: 'M14', area: 's1 Gate-row witness requirement dropped', find: `if (!witness) { out.entryFinding = "s1-source-row"; out.entryDetail = why.join("; "); }`, replace: `// witness requirement disabled (mutant)` },
  { id: 'M15', area: 'host equality inverted', find: `if (!regHost || !gateHost || regHost !== gateHost)`, replace: `if (!regHost || !gateHost || regHost === gateHost)` },
  { id: 'M16', area: 's1 Gate-row sha256 requirement dropped', find: `const gateRow = (gates.get(id) || []).find((x) => firstHttps(x.text) && HEX64.test(x.text));`, replace: `const gateRow = (gates.get(id) || []).find((x) => firstHttps(x.text));` },
  { id: 'M17', area: 'unmeasured rows admitted (arithmetic)', find: `row.admitted = row.reason === null && row.verdict === "yes" && mv.measured;`, replace: `row.admitted = row.reason === null && mv.measured;` },
  { id: 'M18', area: 'clean guard admitted >= 1 weakened', find: `out.clean = !out.entryFinding && out.population >= 1 && out.admitted >= 1 && out.failing === 0;`, replace: `out.clean = !out.entryFinding && out.population >= 1 && out.admitted >= 0 && out.failing === 0;` },
  { id: 'M19', area: 'sessionId pairwise distinctness dropped', find: `if (!receiptFinding && new Set(sids).size !== sids.length) receiptFinding = \`sessionId repeated across runs: ${'$'}{sids.join(", ")}\`;`, replace: `// sessionId distinctness disabled (mutant)` },
];

function git(args) {
  const r = spawnSync('git', ['-C', CLONE, ...args], { encoding: 'buffer', env: ENV, maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${r.stderr.toString('utf8').trim()}`);
  return r.stdout.toString('utf8').trim();
}
function assertToplevel() {
  const t = git(['rev-parse', '--show-toplevel']);
  if (t !== CLONE) throw new Error(`toplevel mismatch: ${t} != ${CLONE}`);
}
function reset() {
  git(['checkout', '-q', '--force', '--detach', BASE_REV]);
  git(['clean', '-qfdx']);
}
const lastLine = (buf) => (buf.toString('utf8').trim().split('\n').pop() || '');
const failingCases = (buf) => buf.toString('utf8').split('\n').filter((l) => l.includes(' FAIL ')).map((l) => (l.match(/CASE id=(\S+)/) || [])[1]).filter(Boolean);
const variantLines = (buf) => buf.toString('utf8').split('\n').filter((l) => l.startsWith('VARIANT ')).map((l) => {
  const m = Object.fromEntries(l.slice(8).split(' ').map((kv) => kv.split('=')));
  return m;
});

const mode = process.argv[2] || 'all';
mkdirSync(TMP, { recursive: true });
mkdirSync(OUT, { recursive: true });

if (mode === 'baseline') {
  assertToplevel();
  reset();
  const g = readFileSync(GATE_ABS);
  if (sha256(g) !== PRISTINE_SHA) throw new Error('pristine sha mismatch after reset');
  const st = spawnSync('node', [GATE_ABS, '--selftest'], { encoding: 'buffer', env: ENV, cwd: CLONE, timeout: 600000, maxBuffer: 256 * 1024 * 1024 });
  const bat = spawnSync('node', [BATTERY, '--repo', CLONE, '--rev', BASE_REV], { encoding: 'buffer', env: ENV, cwd: S, timeout: 1200000, maxBuffer: 256 * 1024 * 1024 });
  writeFileSync(join(OUT, 'baseline-battery.txt'), bat.stdout.toString('utf8') + bat.stderr.toString('utf8'));
  console.log(JSON.stringify({ baseline: true, gateSha256: sha256(g), selftestExit: st.status, selftestLast: lastLine(st.stdout), batteryExit: bat.status, batteryLast: lastLine(bat.stdout) }, null, 1));
} else {
  const only = process.argv[3] || null;
  for (const m of MUTANTS) {
    if (only && m.id !== only) continue;
    assertToplevel();
    reset();
    if (sha256(readFileSync(GATE_ABS)) !== PRISTINE_SHA) throw new Error(`${m.id}: pristine sha mismatch after reset`);
    const src = readFileSync(GATE_ABS, 'utf8');
    const parts = src.split(m.find);
    if (parts.length !== 2) throw new Error(`${m.id}: find occurs ${parts.length - 1} times, expected 1`);
    const mutated = parts[0] + m.replace + parts[1];
    writeFileSync(GATE_ABS, mutated);
    const mutSha = sha256(Buffer.from(mutated, 'utf8'));
    git(['add', '-A']);
    git(['-c', 'user.name=MutGateV2', '-c', 'user.email=MutGateV2@scratch.local', '-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', `mut ${m.id}: ${m.area}`]);
    const rev = git(['rev-parse', 'HEAD']);
    if (!/^[0-9a-f]{40}$/.test(rev)) throw new Error(`${m.id}: bad rev ${rev}`);
    const st = spawnSync('node', [GATE_ABS, '--selftest'], { encoding: 'buffer', env: ENV, cwd: CLONE, timeout: 600000, maxBuffer: 256 * 1024 * 1024 });
    writeFileSync(join(OUT, `${m.id}-selftest.txt`), st.stdout.toString('utf8') + st.stderr.toString('utf8'));
    const bat = spawnSync('node', [BATTERY, '--repo', CLONE, '--rev', rev], { encoding: 'buffer', env: ENV, cwd: S, timeout: 1200000, maxBuffer: 256 * 1024 * 1024 });
    writeFileSync(join(OUT, `${m.id}-battery.txt`), bat.stdout.toString('utf8') + bat.stderr.toString('utf8'));
    reset();
    const restoredSha = sha256(readFileSync(GATE_ABS));
    const rec = {
      id: m.id, area: m.area, find: m.find, replace: m.replace, gateSha256: mutSha, rev,
      selftest: { exit: st.status, last: lastLine(st.stdout), failingCases: failingCases(st.stdout).slice(0, 6) },
      battery: { exit: bat.status, last: lastLine(bat.stdout), variants: variantLines(bat.stdout) },
      killedBySelftest: st.status !== 0,
      killedByBattery: bat.status !== 0,
      verdict: st.status !== 0 || bat.status !== 0 ? 'killed' : 'SURVIVED',
      restored: restoredSha === PRISTINE_SHA, restoredSha,
    };
    appendFileSync(join(S, 'results.jsonl'), JSON.stringify(rec) + '\n');
    console.log(`${m.id} selftest=${rec.selftest.exit} battery=${rec.battery.exit} verdict=${rec.verdict} restored=${rec.restored}`);
  }
}
