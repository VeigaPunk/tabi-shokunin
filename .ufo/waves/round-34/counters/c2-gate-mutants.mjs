#!/usr/bin/env node
// c2-gate-mutants.mjs — tabi round 34, claim C2 (operability). Frozen counter.
//
// Question: does the BiDi runtime gate's OWN self-test (scripts/check-bidi-runtime.mjs
// --selftest) detect each of the 20 frozen single-point mutants of the gate's rules
// that round-33 w2 MutGateV2 built (.ufo/waves/round-33/w2/MutGateV2/mutants.jsonl,
// find/replace pairs embedded below verbatim), while the unmutated gate, a neutral
// edit and a decoy edit still pass, and the round-33 frozen forgery battery still
// reads predicate met (honest receipts H0/H1/H2 admitted, forgeries 0 of 8)?
//
// Usage: node c2-gate-mutants.mjs --rev <40-hex REV> [--repo <lane>] [--json]
// Exit: 0 predicate met; 1 evaluated, predicate not met; 2 could not evaluate.
//
// Method (frozen). One scratch clone of --repo at REV under $TMPDIR (pass TMPDIR under
// $HYAKU_SCRATCH; the clone is removed on exit). The gate blob G is read from REV.
//   pristine  G written to the clone, `node scripts/check-bidi-runtime.mjs --selftest`
//             (cwd clone) must exit 0.
//   neutral   G + "\n// tabi-r34 neutral edit\n" must exit 0 (refuses a self-test
//             keyed on its own bytes).
//   decoy     G + one comment block quoting every mutant's replacement text must
//             exit 0 (refuses a self-test that sniffs its source for mutant text).
//   twin i    G with find_i's FIRST space doubled (a whitespace-only, behaviour-preserving
//             edit at the mutant site) must exit 0 (refuses a self-test that checks its
//             source for the find text instead of exercising the rule). find_i must
//             occur exactly once and contain a space.
//   mutant i  G with find_i replaced by replace_i. find_i must occur EXACTLY once in G
//             (else the mutant is `unappliable` and the predicate is false). KILLED iff
//             the self-test exits 3 AND prints >= 1 `CASE ... FAIL` line (a crash, a
//             timeout or any other exit is NOT a kill).
//   battery   the round-33 frozen battery (bytes from BATTERY_COMMIT, sha256 pinned)
//             run as `--rev REV --repo <repo> --json` must report predicate true.
// Predicate (frozen): pristine exit 0 AND neutral exit 0 AND decoy exit 0 AND every
//   twin exit 0 AND unappliable == 0 AND survivors == 0 (all 20 killed by the self-test
//   alone) AND battery predicate true.
// Known residual (disclosed at freeze): a self-test that reads its own source and
//   checks a whitespace-normalised find text is not refused by these probes; the
//   guard for that construction is the wave-2 code read, not this counter.
// Write scope: the scratch dir only. Never writes the lane.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-r34-c2-gate-mutants-v1';
const GATE = 'scripts/check-bidi-runtime.mjs';
const BATTERY_PATH = '.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs';
const BATTERY_COMMIT = 'e6b0a9074d434ccc307badd312ae7379d1193fea';
const BATTERY_SHA256 = '51ace65fcece8e794b80afdb386638c755b3aa137297c33a34ffce7fb24e812b';
const TIMEOUT_MS = 180000;
const MUTANTS = Object.freeze([
 {
  "id": "M01",
  "area": "x3-duplicate-id threshold",
  "find": "else if ((idCounts.get(id) || 0) > 1)",
  "replace": "else if ((idCounts.get(id) || 0) > 2)"
 },
 {
  "id": "M01b",
  "area": "x3-duplicate-id disabled",
  "find": "else if ((idCounts.get(id) || 0) > 1) {",
  "replace": "else if (false) {"
 },
 {
  "id": "M02",
  "area": "x4-measured-cell decorated (live) suffix",
  "find": "const MEASURED = /^(yes|no)(?:\\s*[—–-]\\s*\\S[\\s\\S]*)?$/i;",
  "replace": "const MEASURED = /^(yes|no)(?:\\s*[—–-]\\s*\\S[\\s\\S]*)?(?:\\s*\\(live\\))?$/i;"
 },
 {
  "id": "M03",
  "area": "x4-measured-cell verdict case folding",
  "find": "return { verdict: m[1].toLowerCase(), measured: true, detail: null };",
  "replace": "return { verdict: m[1], measured: true, detail: null };"
 },
 {
  "id": "M04",
  "area": "transcript path distinctness",
  "find": "if (new Set(runs.map((r) => r.path)).size !== runs.length) receiptFinding = `transcript path repeated across runs: ${runs.map((r) => r.path).join(\", \")}`;",
  "replace": "if (false) receiptFinding = `transcript path repeated across runs`;"
 },
 {
  "id": "M05",
  "area": "transcript sha256 distinctness",
  "find": "else if (new Set(runs.map((r) => r.sha)).size !== runs.length) receiptFinding = \"transcript sha256 repeated across runs (byte-identical copies)\";",
  "replace": ";"
 },
 {
  "id": "M06",
  "area": "sessionId regex shape (uppercase allowed)",
  "find": "const SESSION_ID = /^[0-9a-f]{32}$/;",
  "replace": "const SESSION_ID = /^[0-9a-fA-F]{32}$/;"
 },
 {
  "id": "M07",
  "area": "webSocketUrl sessionId binding",
  "find": "if (m[1] !== sid) return { why: `webSocketUrl session segment ${m[1]} != sessionId ${sid}` };",
  "replace": ""
 },
 {
  "id": "M08",
  "area": "context-id regex case",
  "find": "const CONTEXT_ID = /^[0-9A-F]{32}$/;",
  "replace": "const CONTEXT_ID = /^[0-9a-fA-F]{32}$/;"
 },
 {
  "id": "M09",
  "area": "DRIVER_ALLOW widened with ROWS",
  "find": "const DRIVER_ALLOW = new Set([\"FIXTURE\", \"FIXTURE_SHA256\", \"FIXTURE_HEADER\", \"VIEWPORT\", \"DATA_TEXT\", \"serveFixture\"]);",
  "replace": "const DRIVER_ALLOW = new Set([\"FIXTURE\", \"FIXTURE_SHA256\", \"FIXTURE_HEADER\", \"VIEWPORT\", \"DATA_TEXT\", \"serveFixture\", \"ROWS\"]);"
 },
 {
  "id": "M10",
  "area": "DRIVER_ALLOW drops serveFixture",
  "find": "\", \"VIEWPORT\", \"DATA_TEXT\", \"serveFixture\"]);",
  "replace": "\", \"VIEWPORT\", \"DATA_TEXT\"]);"
 },
 {
  "id": "M11",
  "area": "re-export detection (resolve inverted)",
  "find": "if (spec.startsWith(\".\")) return posix.normalize(posix.join(posix.dirname(driverPath), spec)) === GATE_PATH;",
  "replace": "if (spec.startsWith(\".\")) return posix.normalize(posix.join(posix.dirname(driverPath), spec)) !== GATE_PATH;"
 },
 {
  "id": "M12",
  "area": "re-export detection (non-named kinds skipped)",
  "find": "return `driver has a ${s.kind} relation to this gate (${s.spec})`;",
  "replace": "continue;"
 },
 {
  "id": "M13",
  "area": "gate-sha byte-copy comparison inverted",
  "find": "else if (gateBuf !== null && sha256(drv) === sha256(gateBuf)) receiptFinding = \"driver is a byte copy of this gate\";",
  "replace": "else if (gateBuf !== null && sha256(drv) !== sha256(gateBuf)) receiptFinding = \"driver is a byte copy of this gate\";"
 },
 {
  "id": "M14",
  "area": "s1 Gate-row witness requirement dropped",
  "find": "if (!witness) { out.entryFinding = \"s1-source-row\"; out.entryDetail = why.join(\"; \"); }",
  "replace": "// witness requirement disabled (mutant)"
 },
 {
  "id": "M15",
  "area": "host equality inverted",
  "find": "if (!regHost || !gateHost || regHost !== gateHost)",
  "replace": "if (!regHost || !gateHost || regHost === gateHost)"
 },
 {
  "id": "M16",
  "area": "s1 Gate-row sha256 requirement dropped",
  "find": "const gateRow = (gates.get(id) || []).find((x) => firstHttps(x.text) && HEX64.test(x.text));",
  "replace": "const gateRow = (gates.get(id) || []).find((x) => firstHttps(x.text));"
 },
 {
  "id": "M17",
  "area": "unmeasured rows admitted (arithmetic)",
  "find": "row.admitted = row.reason === null && row.verdict === \"yes\" && mv.measured;",
  "replace": "row.admitted = row.reason === null && mv.measured;"
 },
 {
  "id": "M18",
  "area": "clean guard admitted >= 1 weakened",
  "find": "out.clean = !out.entryFinding && out.population >= 1 && out.admitted >= 1 && out.failing === 0;",
  "replace": "out.clean = !out.entryFinding && out.population >= 1 && out.admitted >= 0 && out.failing === 0;"
 },
 {
  "id": "M19",
  "area": "sessionId pairwise distinctness dropped",
  "find": "if (!receiptFinding && new Set(sids).size !== sids.length) receiptFinding = `sessionId repeated across runs: ${sids.join(\", \")}`;",
  "replace": "// sessionId distinctness disabled (mutant)"
 }
]);

class Refusal extends Error {}
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const TMP = process.env.TMPDIR || tmpdir();
const ENV = { PATH: process.env.PATH, HOME: process.env.HOME, TMPDIR: TMP, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', LC_ALL: 'C' };
function git(repo, args, { allowFail = false } = {}) {
  const r = spawnSync('git', ['-C', repo, ...args], { encoding: 'buffer', env: ENV, maxBuffer: 256 << 20 });
  if (r.status !== 0 && !allowFail) throw new Refusal(`git -C ${repo} ${args.join(' ')} failed: ${r.stderr.toString('utf8').trim()}`);
  return r;
}
function resolveCommit(repo, rev) {
  if (!/^[0-9a-f]{40}$/.test(rev || '')) throw new Refusal(`revision must be 40-hex: ${rev}`);
  const r = git(repo, ['rev-parse', '--verify', '--quiet', `${rev}^{commit}`], { allowFail: true });
  if (r.status !== 0) throw new Refusal(`unresolvable revision ${rev} in ${repo}`);
  return r.stdout.toString('utf8').trim();
}
const count = (hay, needle) => { let n = 0, i = 0; while ((i = hay.indexOf(needle, i)) !== -1) { n += 1; i += needle.length; } return n; };

function selftest(clone, text) {
  writeFileSync(join(clone, GATE), text);
  const r = spawnSync(process.execPath, [GATE, '--selftest'], { cwd: clone, encoding: 'utf8', env: ENV, timeout: TIMEOUT_MS, maxBuffer: 64 << 20 });
  const out = r.stdout || '';
  const fails = out.split('\n').filter((l) => /^CASE id=\S+ .* FAIL$/.test(l)).map((l) => /^CASE id=(\S+)/.exec(l)[1]);
  const last = out.trim().split('\n').pop() || '';
  return { exit: r.status, signal: r.signal || null, failingCases: fails, last: last.slice(0, 200) };
}

export function evaluate({ repo, rev }) {
  const lane = resolve(repo);
  const REV = resolveCommit(lane, rev);
  const g = git(lane, ['show', `${REV}:${GATE}`], { allowFail: true });
  if (g.status !== 0) throw new Refusal(`${GATE} absent at ${REV}`);
  const G = g.stdout.toString('utf8');
  const bat = git(lane, ['show', `${BATTERY_COMMIT}:${BATTERY_PATH}`], { allowFail: true });
  if (bat.status !== 0) throw new Refusal(`battery absent at ${BATTERY_COMMIT}`);
  if (sha256(bat.stdout) !== BATTERY_SHA256) throw new Refusal('battery bytes differ from pinned sha256');
  const dir = mkdtempSync(join(TMP, 'tabi-r34-c2-'));
  try {
    const clone = join(dir, 'clone');
    const c = spawnSync('git', ['clone', '-q', '--shared', '--no-checkout', lane, clone], { encoding: 'utf8', env: ENV });
    if (c.status !== 0) throw new Refusal(`clone failed: ${c.stderr}`);
    if (git(clone, ['rev-parse', '--show-toplevel']).stdout.toString().trim() !== clone) throw new Refusal('clone toplevel mismatch');
    git(clone, ['checkout', '-q', '--detach', REV]);
    const pristine = selftest(clone, G);
    const neutral = selftest(clone, G + '\n// tabi-r34 neutral edit\n');
    const decoy = selftest(clone, G + '\n/* tabi-r34 decoy (not code):\n' + MUTANTS.map((m) => ` * ${m.id}: ${m.replace.replace(/\*\//g, '* /')}`).join('\n') + '\n */\n');
    const mutants = MUTANTS.map((m) => {
      const n = count(G, m.find);
      if (n !== 1 || !m.find.includes(' ')) return { id: m.id, area: m.area, occurrences: n, applied: false, killed: false, twinExit: null };
      const tw = selftest(clone, G.replace(m.find, () => m.find.replace(' ', '  ')));
      const t = selftest(clone, G.replace(m.find, () => m.replace));
      return { id: m.id, area: m.area, occurrences: 1, applied: true, twinExit: tw.exit, twinFailingCases: tw.failingCases, exit: t.exit, signal: t.signal, failingCases: t.failingCases, killed: t.exit === 3 && t.failingCases.length > 0 };
    });
    writeFileSync(join(clone, GATE), G);
    const bfile = join(dir, 'c2-bidi-forgery-battery.mjs');
    writeFileSync(bfile, bat.stdout);
    const br = spawnSync(process.execPath, [bfile, '--rev', REV, '--repo', lane, '--json'], { encoding: 'utf8', env: ENV, timeout: 900000, maxBuffer: 64 << 20 });
    let bj = null; try { bj = JSON.parse((br.stdout || '').trim().split('\n').pop()); } catch { /* below */ }
    const battery = { exit: br.status, predicate: bj ? bj.predicate === true : false, forgeriesAccepted: bj ? bj.forgeriesAccepted : null, honest: bj ? bj.honest : null, stderrTail: (br.stderr || '').trim().split('\n').slice(-2).join(' | ').slice(0, 300) };
    const killed = mutants.filter((m) => m.killed).map((m) => m.id);
    const unappliable = mutants.filter((m) => !m.applied).map((m) => m.id);
    const survivors = mutants.filter((m) => m.applied && !m.killed).map((m) => m.id);
    const twinsFailing = mutants.filter((m) => m.applied && m.twinExit !== 0).map((m) => m.id);
    const out = {
      schema: SCHEMA, rev: REV, gateSha256: sha256(Buffer.from(G)), mutantsTotal: MUTANTS.length,
      pristine, neutral, decoy, killedCount: killed.length, killed, survivorsCount: survivors.length, survivors, unappliable, twinsFailing, battery, mutants,
    };
    out.predicate = pristine.exit === 0 && neutral.exit === 0 && decoy.exit === 0 && twinsFailing.length === 0 && unappliable.length === 0 && survivors.length === 0 && battery.predicate === true;
    return out;
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

function main() {
  const argv = process.argv.slice(2);
  const o = { repo: resolve(dirname(fileURLToPath(import.meta.url)), '../../../..'), rev: null, json: false };
  try {
    for (let i = 0; i < argv.length; i += 1) {
      const a = argv[i];
      if (a === '--json') o.json = true;
      else if (a === '--repo' || a === '--rev') { const v = argv[++i]; if (v === undefined) throw new Refusal(`missing value for ${a}`); o[a.slice(2)] = v; }
      else throw new Refusal(`unknown argument ${a}`);
    }
    const out = evaluate(o);
    if (o.json) console.log(JSON.stringify(out));
    else console.log(`C2_GATE_MUTANTS predicate=${out.predicate ? 'met' : 'not-met'} rev=${out.rev} gate=${out.gateSha256.slice(0, 12)} pristine=${out.pristine.exit} neutral=${out.neutral.exit} decoy=${out.decoy.exit} killed=${out.killedCount}/${out.mutantsTotal} survivors=${out.survivors.join(',') || '-'} unappliable=${out.unappliable.join(',') || '-'} twinsFailing=${out.twinsFailing.join(',') || '-'} battery=${out.battery.predicate}`);
    process.exit(out.predicate ? 0 : 1);
  } catch (e) {
    if (!(e instanceof Refusal)) throw e;
    console.error(`C2_GATE_MUTANTS verdict=could-not-evaluate detail=${e.message}`);
    process.exit(2);
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
