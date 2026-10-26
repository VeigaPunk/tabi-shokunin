#!/usr/bin/env node
// CritC2Counter — builds three self-test constructions on top of the baseline gate,
// commits each in the seat clone, and prints the rev for the frozen counter.
// Usage: node build.mjs <clone> <baseline-rev>
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const CLONE = process.argv[2];
const BASE = process.argv[3];
const GATE = 'scripts/check-bidi-runtime.mjs';
const G = readFileSync(join(CLONE, GATE), 'utf8');
const ANCHOR = '  if (o.selftest) {\n';
if (G.split(ANCHOR).length !== 2) throw new Error('anchor not unique');
const sha = (b) => createHash('sha256').update(b).digest('hex');

const git = (args) => {
  const r = spawnSync('git', ['-C', CLONE, '-c', 'user.name=CritC2Counter', '-c', 'user.email=c2crit@scratch.local', '-c', 'commit.gpgsign=false', ...args], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
};
if (git(['rev-parse', '--show-toplevel']) !== CLONE) throw new Error('toplevel mismatch');
const commit = (file, text, msg) => {
  writeFileSync(join(CLONE, file), text);
  git(['add', '-A']);
  git(['commit', '-q', '--no-verify', '-m', msg]);
  return git(['rev-parse', 'HEAD']);
};
const reset = () => { git(['checkout', '-q', '--force', '--detach', BASE]); git(['clean', '-q', '-fdx']); };

const NORM = '(t) => t.replace(/\\/\\*[\\s\\S]*?\\*\\//g, "").split("\\n").map((l) => l.replace(/\\/\\/[^\\n]*$/, "").replace(/\\s+/g, " ").trim()).filter((l) => l.length > 0).join("\\n")';

// ---- K1: whitespace/comment-normalised self-hash of own source (no git, no env) ----
const K1_HEAD = [
  '    { // rule-source digests: the rules live in this file; pin their shape',
  `      const __normS = ${NORM};`,
  '      const __wantL = (l) => !/__want|__KEEPSHAPE|__normS/.test(l);',
  '      const __want = "@@K1@@";',
  '      const __body = __normS(readFileSync(fileURLToPath(import.meta.url), "utf8")).split("\\n").filter(__wantL).join("\\n");',
  '      if (createHash("sha256").update(__body).digest("hex") !== __want) { console.log("CASE id=rule-source-shape expected_exit=0 exit=1 expected_admitted=0 admitted=0 expected_population=- population=0 expected_reason=- reason=rule-source-reworded FAIL"); console.log("BIDI_RUNTIME_SELFTEST verdict=failed cases=1 passed=0"); process.exit(3); } // __KEEPSHAPE',
  '    }',
  '',
].join('\n');
let K1 = G.replace(ANCHOR, ANCHOR + K1_HEAD);
{
  const normLines = K1.replace(/\/\*[\s\S]*?\*\//g, '').split('\n')
    .map((l) => l.replace(/\/\/[^\n]*$/, '').replace(/\s+/g, ' ').trim())
    .filter((l) => l.length > 0)
    .filter((l) => !/__want|__KEEPSHAPE|__normS/.test(l));
  const want = createHash('sha256').update(normLines.join('\n')).digest('hex');
  K1 = K1.replace('@@K1@@', want);
  console.error(`K1 pinned=${want} lines=${normLines.length}`);
}

// ---- K2: git-blob drift guard — own normalised source vs HEAD's committed blob ----
const K2_HEAD = [
  '    { // guard: the rules on disk must match the committed gate (drift check)',
  `      const __norm2 = ${NORM};`,
  '      const __self2 = fileURLToPath(import.meta.url);',
  '      const __head2 = spawnSync("git", ["-C", dirname(__self2), "show", "HEAD:scripts/check-bidi-runtime.mjs"], { encoding: "utf8" });',
  '      if (__head2.status === 0 && __head2.stdout && __norm2(__head2.stdout) !== __norm2(readFileSync(__self2, "utf8"))) { console.log("CASE id=rule-source-in-sync expected_exit=0 exit=1 expected_admitted=0 admitted=0 expected_population=- population=0 expected_reason=- reason=uncommitted-rule-drift FAIL"); console.log("BIDI_RUNTIME_SELFTEST verdict=failed cases=1 passed=0"); process.exit(3); }',
  '    }',
  '',
].join('\n');
const K2 = G.replace(ANCHOR, ANCHOR + K2_HEAD);

// ---- K3: honest-looking source-anchored cases (false-negative probes) ----
const M02_FIND = 'const MEASURED = /^(yes|no)(?:\\s*[—–-]\\s*\\S[\\s\\S]*)?$/i;';
const M06_REPL = 'const SESSION_ID = /^[0-9a-fA-F]{32}$/;';
const K3_HEAD = [
  '    { // PINSELF: this gate is published with a pinned digest of its rule text',
  '      const __raw = readFileSync(fileURLToPath(import.meta.url), "utf8").split("\\n").filter((l) => !/__PINSELF|@P@/.test(l)).join("\\n");',
  '      if (createHash("sha256").update(__raw).digest("hex") !== "@@K3@@" /* __PINSELF */) { console.log("CASE id=published-digest expected_exit=0 exit=1 expected_admitted=0 admitted=0 expected_population=- population=0 expected_reason=- reason=bytes-changed FAIL"); console.log("BIDI_RUNTIME_SELFTEST verdict=failed cases=1 passed=0"); process.exit(3); }',
  '    }',
  '    { // the weakened session-id rule must not reappear in the source',
  `      if (readFileSync(fileURLToPath(import.meta.url), "utf8").includes("const SESSION_ID = /^[0-9a-f" + "A-F]{32}$/;")) { console.log("CASE id=no-weakened-session-rule expected_exit=0 exit=1 expected_admitted=0 admitted=0 expected_population=- population=0 expected_reason=- reason=weakened-rule-present FAIL"); console.log("BIDI_RUNTIME_SELFTEST verdict=failed cases=1 passed=0"); process.exit(3); }`,
  '    }',
  '    { // the measured-cell rule must still be present verbatim',
  `      if (!readFileSync(fileURLToPath(import.meta.url), "utf8").includes(${JSON.stringify(M02_FIND)})) { console.log("CASE id=measured-rule-verbatim expected_exit=0 exit=1 expected_admitted=0 admitted=0 expected_population=- population=0 expected_reason=- reason=measured-rule-reworded FAIL"); console.log("BIDI_RUNTIME_SELFTEST verdict=failed cases=1 passed=0"); process.exit(3); }`,
  '    }',
  '',
].join('\n');
let K3 = G.replace(ANCHOR, ANCHOR + K3_HEAD);
{
  const raw = K3.split('\n').filter((l) => !/__PINSELF|@P@/.test(l)).join('\n');
  K3 = K3.replace('@@K3@@', sha(raw));
}

const revs = {};
for (const [name, text, msg] of [['K1', K1, 'crit K1 normalised self-hash guard'], ['K2', K2, 'crit K2 git-blob drift guard'], ['K3', K3, 'crit K3 honest source-anchored cases']]) {
  reset();
  revs[name] = commit(GATE, text, msg);
  console.error(`${name} rev=${revs[name]} bytes=${text.length}`);
}
reset();
console.log(JSON.stringify(revs));
