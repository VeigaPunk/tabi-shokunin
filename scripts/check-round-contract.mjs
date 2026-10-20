#!/usr/bin/env node
// Reads committed tabi round files only. A miss exits non-zero.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync, realpathSync, symlinkSync, unlinkSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const defaultRoot = resolve(dirname(script), '..');
const HARD_BASELINE = '7f506affa55f6fb892d3c8073c75151c998bdf2c';
const AXES = ['freshness', 'coverage', 'operability', 'calibration', 'adjacency', 'depth'];
const VERDICTS = ['PASS', 'ISSUES', 'BLOCKED', 'DROPOUT', 'GAP'];
const BOXES = [
  'SKILL.md contains real decision tables, error patterns, checklists, cited sources',
  'At least one end-to-end domain task executed and logged in LOG.md',
  'Instructions executable by an agent without oral context',
  'No cross-domain bleed (PROVINCE.md still accurate)',
];
const NEEDLES = [
  'consequential-action: performed',
  'credential-submit: yes',
  'account-mutation: yes',
];
const APPEND_ONLY = ['LOG.md', 'SCORECARD.md', 'SKILL.md', 'PROVINCE.md', 'corpus/QUALITY.md', 'corpus/README.md'];
const SHONEN_PATH = 'SHONEN.md';
const CENSUS_PATH = 'corpus/evidence/pstack-20261015/baseline-census.tsv';
// Exact committed identity of the production census (HEAD blob 672dba36…).
// Deleting any row, including PROVINCE.md or SHONEN.md, changes these bytes.
const CENSUS_SHA256 = 'b9c8dc3557b825f8bd4b18ff0db03909e16ddd526ef18554cb2bf68da696be9c';
// The lane name and seed digest are fixed, not derived from the checkout path.
// Source: parent PROTOCOL.md canonical SHONEN seed at 6bd4f38 lines 333-340,
// byte-identical since 70ffb66; <name>=tabi-shokunin. The normalized template
// (marks reset to [ ], evidence lines dropped) hashes to this persisted digest.
const LANE = 'tabi-shokunin';
const SHONEN_SEED_SHA256 = 'b45c2ac3cdf8ba80563e77cabf72670a6a101590f8031d9b484c67313bcdab67';
// Red-before arm allowed by --witness: the legacy gate committed at baseline.
const LEGACY_GATE_BLOB = 'b2eb8316f41cd1039330e45f6739c07c5f11eace';
// Prior admitted round-13 gate (HEAD bebe2ef, sha256 8478cd43…): its runCount
// still executed the SCORECARD command through a shell. --count-witness uses
// these exact bytes as the shell-count red-before arm.
const COUNT_WITNESS_BLOB = '43db9f4bba56a27114ed116c85f27b80227e74bd';
const COUNT_WITNESS_REV = 'bebe2efc4565bb068efd905e9ef78011bb6b4efd';

function fail(finding, detail, exit = 1) {
  throw Object.assign(new Error(detail), { finding, exit });
}

// Lexical equality alone lets --repo /proc/self/cwd or a symlink alias reach the
// production tree while appearing to be a fixture. Compare resolved paths.
function isProduction(repo) {
  try {
    return realpathSync(repo) === realpathSync(defaultRoot);
  } catch {
    return false;
  }
}

// Constructed child environment: no inherited GIT_* variable can redirect the
// repository (GIT_DIR, GIT_OBJECT_DIRECTORY, GIT_ALTERNATE_OBJECT_DIRECTORIES,
// GIT_CONFIG_*), and replace refs, grafts, lazy fetch and system/global config
// cannot change what this gate reads. PATH keeps absolute entries only, so a
// relative entry cannot resolve git inside the measured repo. The ceiling keeps
// repository discovery from walking into the enclosing fleet checkout when this
// lane's .git is unreadable; laneTip additionally requires toplevel == root.
function git(root, args, binary = false) {
  const env = {
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_OPTIONAL_LOCKS: '0',
    GIT_TERMINAL_PROMPT: '0',
    GIT_NO_REPLACE_OBJECTS: '1',
    GIT_GRAFT_FILE: '/dev/null',
    GIT_NO_LAZY_FETCH: '1',
    GIT_LITERAL_PATHSPECS: '1',
    TZ: 'UTC',
  };
  if (process.env.PATH !== undefined) env.PATH = process.env.PATH.split(':').filter(entry => entry.startsWith('/')).join(':');
  if (process.env.HOME !== undefined) env.HOME = process.env.HOME;
  try {
    env.GIT_CEILING_DIRECTORIES = resolve(realpathSync(root), '..');
  } catch {
    env.GIT_CEILING_DIRECTORIES = resolve(root, '..');
  }
  const result = spawnSync('git', args, { cwd: root, env, encoding: binary ? undefined : 'utf8', maxBuffer: 16 * 1024 * 1024 });
  return result;
}

function gitOk(root, args, binary = false) {
  const result = git(root, args, binary);
  if (result.error || result.status !== 0) fail('could_not_evaluate', `git ${args[0]} failed`, 2);
  return binary ? result.stdout : result.stdout.trimEnd();
}

function blob(root, rev, path) {
  const result = git(root, ['rev-parse', '--verify', `${rev}:${path}`]);
  if (result.status !== 0) return null;
  return result.stdout.trim();
}

function show(root, rev, path) {
  const result = git(root, ['show', `${rev}:${path}`], true);
  if (result.status !== 0) return null;
  return result.stdout;
}

// jj-colocated lanes detach git HEAD: after `jj commit` HEAD names an unlanded
// local commit, and after `jj new` it names an empty commit on no branch. A gate
// anchored on HEAD can therefore certify bytes that are on no branch. This gate
// certifies the lane branch tip instead: an attached HEAD (plain git, fixtures)
// resolves to its own branch, a detached HEAD resolves refs/heads/master. The
// 40-hex is resolved once per run and threaded into every read, so a concurrent
// jj command cannot mix revisions inside one verdict.
function laneTip(root) {
  const top = git(root, ['rev-parse', '--show-toplevel']);
  let sameRepo = false;
  try {
    sameRepo = top.status === 0 && realpathSync(top.stdout.trim()) === realpathSync(root);
  } catch {
    sameRepo = false;
  }
  if (!sameRepo) fail('could_not_evaluate', 'Lane root is not the repository toplevel', 2);
  const sym = git(root, ['symbolic-ref', '-q', '--no-recurse', 'HEAD']);
  let ref;
  if (sym.status === 0) {
    if (!/^refs\/heads\/[^\x00-\x20\x7f~^:?*\[\\]+\n$/.test(sym.stdout)) {
      fail('could_not_evaluate', `Attached HEAD is not a local branch: ${sym.stdout.trim() || '(empty)'}`, 2);
    }
    ref = sym.stdout.slice(0, -1);
  } else if (sym.status === 1 && sym.stdout === '') {
    ref = 'refs/heads/master';
  } else {
    fail('could_not_evaluate', 'git symbolic-ref could not read HEAD', 2);
  }
  // Reflog spellings such as `refs/heads/master@{1}`, `..`, `.lock` or a
  // trailing slash pass a character-class check but are revision syntax, not
  // ref names; resolving one would certify the branch's previous value.
  if (git(root, ['check-ref-format', ref]).status !== 0) {
    fail('could_not_evaluate', `Lane-tip anchor is not a valid ref name: ${ref}`, 2);
  }
  // A symbolic branch would let the printed anchor name one ref while the
  // commit comes from another; require exactly one row whose symref field is
  // empty (a symref prints its target, an absent ref prints nothing).
  const anchor = git(root, ['for-each-ref', '--format=%(symref)', '--', ref]);
  if (anchor.status !== 0 || anchor.stdout !== '\n') {
    fail('could_not_evaluate', `Lane-tip anchor ${ref} is not a plain local branch`, 2);
  }
  const resolved = git(root, ['rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`]);
  const tip = resolved.status === 0 ? resolved.stdout.trim() : '';
  if (!/^[a-f0-9]{40}$/.test(tip)) {
    fail('could_not_evaluate', `Lane-tip anchor ${ref} does not resolve to a commit`, 2);
  }
  return tip;
}

// Recomputed git object identity for executed-at-witness gate bytes, so a
// replace ref or config-only substitution cannot hand us different source.
function gitBlobId(bytes) {
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
}

function list(root, rev, prefix) {
  const result = git(root, ['ls-tree', '-r', '--name-only', rev, '--', prefix]);
  if (result.status !== 0) return [];
  return result.stdout.split('\n').filter(Boolean);
}

function protectedPath(path) {
  return /^corpus\/lessons\/round-\d+\.md$/.test(path)
    || path.startsWith('corpus/evidence/fleet-round-1-freshness/')
    || path.startsWith('.ufo/rounds/fleet-round-1-interactive-20261015/')
    || path.startsWith('.ufo/reports/fleet-round-1-attempt-20261015/')
    || path.startsWith('.ufo/plans/fleet-round-1-interactive-20261015')
    || path.startsWith('.ufo/continuation/fleet-round-1-interactive-20261015')
    || path === 'scripts/check-freshness.mjs'
    || path === SHONEN_PATH;
}

// PROTOCOL.md canonical SHONEN seed: fixed lane title, one intro line, then the
// four boxes in order. Regeneration may change only the status character and one
// two-space evidence line per box. Statuses are [ ] or [~]; [x] fails closed
// because this gate holds no independent non-author verifier record. A [~]
// evidence line may carry prose but must include a backticked path that resolves
// to a committed regular blob at the lane tip. The normalized template must hash
// to the persisted independent seed digest. Structural only, never a promotion
// grant.
function canonicalShonenText() {
  const lines = [`# ${LANE} — Promotion checklist`, '', 'Promotion to shokunin requires all of:', ''];
  for (const box of BOXES) lines.push(`- [~] ${box}`, '  `corpus/lessons/pstack-20261015-r01.md` — author-side evidence pointer');
  return `${lines.join('\n')}\n`;
}

function regularBlob(root, rev, path) {
  const result = git(root, ['--literal-pathspecs', 'ls-tree', rev, '--', path]);
  if (result.status !== 0) return false;
  const line = result.stdout.split('\n').find(item => item.endsWith(`\t${path}`));
  if (!line) return false;
  const [mode, type] = line.split('\t')[0].split(' ');
  return type === 'blob' && (mode === '100644' || mode === '100755');
}

function evidencePointers(text) {
  return [...text.matchAll(/`([^`\s]+)`/g)]
    .map(match => match[1].replace(/:\d+(?:-\d+)?$/, '').replace(/^\.\//, ''))
    .filter(Boolean);
}

function checkShonenPolicy(root, rev, text) {
  if (text.includes('\r')) fail('shonen_policy', 'SHONEN.md must use LF line endings');
  if (!text.endsWith('\n') || text.endsWith('\n\n')) fail('shonen_policy', 'SHONEN.md must end with exactly one newline');
  const lines = text.slice(0, -1).split('\n');
  const preamble = [`# ${LANE} — Promotion checklist`, '', 'Promotion to shokunin requires all of:', ''];
  for (let index = 0; index < preamble.length; index++) {
    if (lines[index] !== preamble[index]) fail('shonen_policy', `SHONEN.md line ${index + 1} is not the canonical seed`);
  }
  let index = preamble.length;
  for (const box of BOXES) {
    const match = /^- \[([x~ ])\] (.+)$/.exec(lines[index] ?? '');
    if (!match || match[2] !== box) fail('shonen_policy', `SHONEN.md canonical box missing, reworded or out of order: ${box}`);
    const mark = match[1];
    index++;
    const evidence = lines[index];
    const hasEvidence = typeof evidence === 'string' && /^ {2}\S/.test(evidence);
    if (hasEvidence) index++;
    if (mark === 'x') fail('shonen_policy', `SHONEN.md [x] has no committed non-author verifier allowlist: ${box}`);
    if (mark === ' ' && hasEvidence) fail('shonen_policy', `SHONEN.md unchecked box carries prose: ${box}`);
    if (mark === '~') {
      if (!hasEvidence) fail('shonen_policy', `SHONEN.md [~] box has no indented evidence line: ${box}`);
      if (!evidencePointers(evidence).some(pointer => regularBlob(root, rev, pointer))) {
        fail('shonen_policy', `SHONEN.md [~] evidence has no backticked committed regular blob path: ${box}`);
      }
    }
    if (typeof lines[index] === 'string' && /^ {2}\S/.test(lines[index])) fail('shonen_policy', `SHONEN.md box has more than one evidence line: ${box}`);
  }
  if (index !== lines.length) fail('shonen_policy', `SHONEN.md has non-canonical prose after the four boxes: ${lines[index]}`);
  const normalized = [...preamble, ...BOXES.map(box => `- [ ] ${box}`), ''].join('\n');
  if (createHash('sha256').update(normalized).digest('hex') !== SHONEN_SEED_SHA256) {
    fail('shonen_policy', 'SHONEN.md normalized template does not match the persisted canonical seed digest');
  }
}

function checkShonen(root, baseline, rev) {
  const before = blob(root, baseline, SHONEN_PATH);
  if (!before) fail('history_rewritten', `${SHONEN_PATH} is missing at the baseline`);
  const after = blob(root, rev, SHONEN_PATH);
  if (!after) fail('shonen_policy', `${SHONEN_PATH} is missing at the lane tip`);
  if (after === before) return;
  checkShonenPolicy(root, rev, show(root, rev, SHONEN_PATH).toString('utf8'));
}

function censusEntries(root, baseline, production, expectedSha256, rev) {
  const bytes = show(root, rev, CENSUS_PATH);
  if (!bytes) {
    if (production || expectedSha256) fail('history_rewritten', 'Baseline census is not committed');
    return null;
  }
  const pin = production ? CENSUS_SHA256 : expectedSha256;
  if (pin && createHash('sha256').update(bytes).digest('hex') !== pin) {
    fail('history_rewritten', `Census identity changed: ${CENSUS_PATH}`);
  }
  const lines = bytes.toString('utf8').trimEnd().split('\n');
  if (lines[0] !== baseline) fail('history_rewritten', 'Census baseline hash mismatch');
  if (lines.length < 2) fail('history_rewritten', 'Census lists no protected paths');
  return lines.slice(1).map(line => {
    const match = /^([a-f0-9]{40}) (.+)$/.exec(line);
    if (!match) fail('history_rewritten', 'Census row is malformed');
    return { recorded: match[1], path: match[2] };
  });
}

function argumentsOf(argv) {
  const options = { repo: defaultRoot, baseline: HARD_BASELINE, expect: 10, selfTest: false, witness: null, countWitness: null, censusSha256: null };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === '--self-test') options.selfTest = true;
    else if (flag === '--witness' && argv[i + 1]) options.witness = argv[++i];
    else if (flag === '--count-witness' && argv[i + 1]) options.countWitness = argv[++i];
    else if (flag === '--census-sha256' && argv[i + 1]) options.censusSha256 = argv[++i];
    else if (flag === '--repo' && argv[i + 1]) options.repo = resolve(argv[++i]);
    else if (flag === '--baseline' && argv[i + 1]) options.baseline = argv[++i];
    else if (flag === '--expect' && argv[i + 1]) options.expect = Number(argv[++i]);
    else fail('usage', 'Use --self-test, --witness REV, --count-witness REV, or --repo PATH --baseline HASH --expect N [--census-sha256 HASH] for an isolated fixture', 2);
  }
  if (options.selfTest && argv.length !== 1) fail('usage', '--self-test takes no other arguments', 2);
  if (options.witness !== null) {
    if (argv.length !== 2 || !/^[a-f0-9]{7,40}$/.test(options.witness)) fail('usage', '--witness takes one git revision whose gate bytes are the red-before arm', 2);
    return options;
  }
  if (options.countWitness !== null) {
    if (argv.length !== 2 || !/^[a-f0-9]{7,40}$/.test(options.countWitness)) fail('usage', '--count-witness takes one git revision whose gate bytes are the shell-count red-before arm', 2);
    return options;
  }
  if (options.censusSha256 !== null) {
    if (!/^[a-f0-9]{64}$/.test(options.censusSha256)) fail('usage', '--census-sha256 must be 64 hex characters', 2);
    if (isProduction(options.repo)) fail('usage', 'Production census identity is fixed; --census-sha256 is fixture-only', 2);
  }
  if (!/^[a-f0-9]{40}$/.test(options.baseline)) fail('usage', 'Baseline must be 40 hex characters', 2);
  if (!Number.isInteger(options.expect) || options.expect < 1 || options.expect > 10) fail('usage', 'Expect must be 1..10', 2);
  if (isProduction(options.repo)) {
    if (options.baseline !== HARD_BASELINE || options.expect !== 10) fail('usage', 'Production check uses the fixed baseline and expects ten rounds', 2);
  }
  return options;
}

function checkHistory(root, baseline, production, censusSha256, rev) {
  const ancestor = git(root, ['merge-base', '--is-ancestor', baseline, rev]);
  if (ancestor.status !== 0) fail('history_rewritten', 'Baseline is not an ancestor of the lane tip');
  for (const path of list(root, baseline, '.').filter(protectedPath)) {
    const before = blob(root, baseline, path);
    const after = blob(root, rev, path);
    if (!before || !after) fail('history_rewritten', `Protected bytes changed: ${path}`);
    if (path === SHONEN_PATH) continue;
    if (before !== after) fail('history_rewritten', `Protected bytes changed: ${path}`);
  }
  checkShonen(root, baseline, rev);
  for (const path of APPEND_ONLY) {
    const before = show(root, baseline, path);
    if (!before) continue;
    const after = show(root, rev, path);
    if (!after || !after.subarray(0, before.length).equals(before)) fail('history_rewritten', `Append-only prefix changed: ${path}`);
  }
  const census = censusEntries(root, baseline, production, censusSha256, rev);
  if (!census) return;
  for (const { recorded, path } of census) {
    const before = blob(root, baseline, path);
    if (!before || before !== recorded) fail('history_rewritten', `Census baseline drifted: ${path}`);
    const after = blob(root, rev, path);
    if (path === SHONEN_PATH) {
      // Historical row is still compared to the committed old hash; only the
      // current bytes may follow the canonical seed, and never arbitrary prose.
      if (!after) fail('shonen_policy', `${SHONEN_PATH} is missing at the lane tip`);
      if (after !== recorded) checkShonenPolicy(root, rev, show(root, rev, SHONEN_PATH).toString('utf8'));
      continue;
    }
    if (after !== recorded) fail('history_rewritten', `Census blob drifted: ${path}`);
  }
}

function roundIds(root, rev) {
  return list(root, rev, 'corpus/lessons')
    .map(path => /^corpus\/lessons\/(pstack-20261015-r\d{2})\.md$/.exec(path)?.[1])
    .filter(Boolean)
    .sort();
}

function parseLesson(text, id) {
  if (!text.includes(`## Gate`)) fail('missing_gate', `${id} lesson has no Gate`);
  const axis = /^axis: ([a-z]+)$/m.exec(text)?.[1];
  if (!AXES.includes(axis)) fail('missing_gate', `${id} lesson has no axis`);
  if (!/^consequential-external-actions: none$/m.test(text)) fail('consequential_action', `${id} missing the none attestation`);
  const admits = [...text.matchAll(/^- admitted: (\S+) — (.+)$/gm)];
  const rejects = [...text.matchAll(/^- rejected: (\S+) — (.+)$/gm)];
  const spots = [...text.matchAll(/^- spot-check: non-author (\S+) (agree|disagree) — (.+)$/gm)];
  if (admits.length < 1 || admits.some(item => item[2].trim().length < 8)) fail('missing_gate', `${id} needs an admit with a reason`);
  if (rejects.length < 1 || rejects.some(item => item[2].trim().length < 8)) fail('missing_gate', `${id} needs a reject with a reason`);
  if (spots.length !== 1) fail('missing_gate', `${id} needs one non-author spot-check`);
  return { axis, admits: admits.length, rejects: rejects.length, spot: spots[0][2] };
}

function parseScore(scorecard, id) {
  const pattern = new RegExp(`<!-- pstack-round:${id}\\n([\\s\\S]*?)-->`);
  const body = pattern.exec(scorecard)?.[1];
  if (!body) fail('missing_score', `${id} has no SCORECARD measurement`);
  const field = name => {
    const match = new RegExp(`^${name}: (.+)$`, 'm').exec(body);
    if (!match) fail('missing_score', `${id} scorecard lacks ${name}`);
    return match[1].trim();
  };
  const command = field('command');
  if (!command.startsWith('git ') || /[;&`<>\n\\]|\$[({]/.test(command)) fail('missing_score', `${id} counting command is not a git measurement`);
  const measured = field('measured-against');
  if (!/^[a-f0-9]{40}$/.test(measured)) fail('missing_score', `${id} measured-against is not a commit`);
  return {
    axis: field('axis'),
    before: field('before'),
    after: field('after'),
    command,
    measured,
  };
}

// Historical SCORECARD counting grammar is a closed pipeline, never a shell:
//   git ls-tree -r --name-only <rev> | grep <BRE> [| grep <BRE>]* | wc -l
//   git grep -h <BRE> <rev> -- <path> [<path> ...] | wc -l
// Tokenize with quote removal only, validate every argv token, and invoke git
// directly. Any other syntax is score_mismatch before any process starts.
const COUNT_REVISION = /^[a-f0-9]{40}$/;
const COUNT_WORD = /^[A-Za-z0-9_./:=@%+,^-]+/;
const COUNT_PIPE = Symbol('count-pipe');

function countStages(command) {
  const tokens = [];
  let index = 0;
  while (index < command.length) {
    const char = command[index];
    if (char === ' ') { index++; continue; }
    if (char === '|') { tokens.push(COUNT_PIPE); index++; continue; }
    if (char === "'") {
      if (index > 0 && command[index - 1] !== ' ' && command[index - 1] !== '|') {
        fail('score_mismatch', `Counting command concatenates a quote: ${command}`);
      }
      const end = command.indexOf("'", index + 1);
      if (end < 0) fail('score_mismatch', `Counting command has an unbalanced quote: ${command}`);
      const quoted = command.slice(index + 1, end);
      if (!/^[\x20-\x7e]*$/.test(quoted) || /[;&<>`\\]|\$[({]/.test(quoted)) {
        fail('score_mismatch', `Counting command quoted token carries shell syntax: ${command}`);
      }
      if (end + 1 < command.length && command[end + 1] !== ' ' && command[end + 1] !== '|') {
        fail('score_mismatch', `Counting command concatenates a quote: ${command}`);
      }
      tokens.push(quoted);
      index = end + 1;
      continue;
    }
    const match = COUNT_WORD.exec(command.slice(index));
    if (!match) fail('score_mismatch', `Counting command has unrecognized shell syntax: ${command}`);
    tokens.push(match[0]);
    index += match[0].length;
  }
  const stages = [[]];
  for (const token of tokens) {
    if (token === COUNT_PIPE) stages.push([]);
    else stages[stages.length - 1].push(token);
  }
  if (stages.some(stage => stage.length === 0)) fail('score_mismatch', `Counting command has an empty pipeline stage: ${command}`);
  return stages;
}

function countRevision(value, command) {
  if (!COUNT_REVISION.test(value)) fail('score_mismatch', `Counting command revision is not a full commit: ${command}`);
  return value;
}

function countPath(value, command) {
  if (!/^[A-Za-z0-9_./@%+-]+$/.test(value) || value.startsWith('-') || value.startsWith('/') || value.split('/').includes('..')) {
    fail('score_mismatch', `Counting command path is not a relative repository path: ${command}`);
  }
  return value;
}

function countPattern(value, command) {
  if (!value || !/^[\x20-\x7e]+$/.test(value)) fail('score_mismatch', `Counting command pattern is not printable text: ${command}`);
  if (value.startsWith('-')) fail('score_mismatch', `Counting command pattern looks like an option: ${command}`);
  return value;
}

function breMatcher(value, command) {
  countPattern(value, command);
  let source = '';
  for (let index = 0; index < value.length; index++) {
    const char = value[index];
    if (char === '\\' || char === '[' || char === ']') {
      fail('score_mismatch', `Counting command pattern uses unsupported grep syntax: ${command}`);
    }
    if (char === '.') source += '.';
    else if (char === '*') {
      if (index === 0 || value[index - 1] === '^') fail('score_mismatch', `Counting command pattern has a misplaced '*': ${command}`);
      source += '*';
    } else if (char === '^') {
      if (index !== 0) fail('score_mismatch', `Counting command pattern has a misplaced '^': ${command}`);
      source += '^';
    } else if (char === '$') {
      if (index !== value.length - 1) fail('score_mismatch', `Counting command pattern has a misplaced '$': ${command}`);
      source += '$';
    } else {
      source += char.replace(/[+?(){}|]/g, '\\$&');
    }
  }
  try {
    return new RegExp(source, 's');
  } catch {
    fail('score_mismatch', `Counting command pattern is not a supported basic regular expression: ${command}`);
  }
}

function treeLineCount(root, stages, command) {
  const head = stages[0];
  if (head.length !== 5 || head[2] !== '-r' || head[3] !== '--name-only') {
    fail('score_mismatch', `Counting command is not a plain git ls-tree listing: ${command}`);
  }
  const rev = countRevision(head[4], command);
  const filters = stages.slice(1, -1).map(stage => {
    if (stage.length !== 2 || stage[0] !== 'grep') {
      fail('score_mismatch', `Counting command may only filter the listing with plain grep: ${command}`);
    }
    return breMatcher(stage[1], command);
  });
  if (filters.length < 1) fail('score_mismatch', `Counting command has no grep filter: ${command}`);
  const result = git(root, ['ls-tree', '-r', '--name-only', rev]);
  if (result.error || result.status !== 0) fail('score_mismatch', `Counting command failed: ${command}`);
  const lines = result.stdout.split('\n');
  if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
  let kept = lines;
  for (const filter of filters) kept = kept.filter(line => filter.test(line));
  return String(kept.length);
}

function grepLineCount(root, stages, command) {
  const head = stages[0];
  if (head.length < 6 || head[2] !== '-h' || head[5] !== '--') {
    fail('score_mismatch', `Counting command is not a plain git grep of one revision and path: ${command}`);
  }
  const pattern = countPattern(head[3], command);
  const rev = countRevision(head[4], command);
  const paths = head.slice(6).map(path => countPath(path, command));
  if (paths.length < 1) fail('score_mismatch', `Counting command has no grep path: ${command}`);
  const result = git(root, ['grep', '-h', '-e', pattern, rev, '--', ...paths], true);
  if (result.error || (result.status !== 0 && result.status !== 1)) fail('score_mismatch', `Counting command failed: ${command}`);
  if (result.status === 1) return '0';
  let newlines = 0;
  for (const byte of result.stdout) if (byte === 0x0a) newlines++;
  return String(newlines);
}

function runCount(root, command) {
  const stages = countStages(command);
  const last = stages[stages.length - 1];
  if (last.length !== 2 || last[0] !== 'wc' || last[1] !== '-l') {
    fail('score_mismatch', `Counting command must end with wc -l: ${command}`);
  }
  const head = stages[0];
  if (head[0] === 'git' && head[1] === 'ls-tree') return treeLineCount(root, stages, command);
  if (head[0] === 'git' && head[1] === 'grep') {
    if (stages.length !== 2) fail('score_mismatch', `Counting command adds stages after git grep: ${command}`);
    return grepLineCount(root, stages, command);
  }
  fail('score_mismatch', `Counting command is not a recognized git measurement: ${command}`);
}

// The revision operand, never a hex string that only appears in a grep pattern.
function countCommandRevision(command) {
  const head = countStages(command)[0];
  if (head[0] !== 'git') fail('score_mismatch', `Counting command is not a git measurement: ${command}`);
  if (head[1] === 'ls-tree' && head.length === 5) return countRevision(head[4], command);
  if (head[1] === 'grep' && head.length >= 6 && head[2] === '-h') return countRevision(head[4], command);
  fail('score_mismatch', `Counting command does not expose a git revision operand: ${command}`);
}

function checkSwarm(root, id, rev) {
  const raw = show(root, rev, `corpus/evidence/${id}/aggregate.json`);
  if (!raw) fail('short_swarm', `${id} aggregate is missing`);
  let aggregate;
  try { aggregate = JSON.parse(raw.toString('utf8')); } catch { fail('short_swarm', `${id} aggregate is not JSON`); }
  if (aggregate.dispatcher !== '/pstack:swarm' || aggregate.workers !== 32) fail('short_swarm', `${id} was not a 32-worker /pstack:swarm`);
  const results = aggregate.results;
  if (!Array.isArray(results) || results.length !== 32) fail('short_swarm', `${id} accounts for ${results?.length ?? 0} results`);
  const seats = results.map(item => item.seat);
  const wanted = Array.from({ length: 32 }, (_, index) => `s${String(index + 1).padStart(2, '0')}`);
  if (seats.slice().sort().join() !== wanted.join()) fail('short_swarm', `${id} seats are not s01..s32`);
  const counts = { PASS: 0, ISSUES: 0, BLOCKED: 0, DROPOUT: 0, GAP: 0 };
  for (const item of results) {
    if (!VERDICTS.includes(item.verdict)) fail('swarm_evidence', `${id} ${item.seat} verdict is unknown`);
    counts[item.verdict]++;
    if ((item.verdict === 'DROPOUT' || item.verdict === 'GAP') && !(item.name && String(item.name).length > 1)) {
      fail('swarm_evidence', `${id} ${item.seat} dropout has no name`);
    }
    const evidencePath = item.evidence;
    if (typeof evidencePath !== 'string' || evidencePath.includes('..') || !evidencePath.startsWith(`corpus/evidence/${id}/seats/`)) {
      fail('swarm_evidence', `${id} ${item.seat} evidence path is outside the seat directory`);
    }
    const seatRaw = show(root, rev, evidencePath);
    if (!seatRaw) fail('swarm_evidence', `${id} ${item.seat} evidence file is missing`);
    let seat;
    try { seat = JSON.parse(seatRaw.toString('utf8')); } catch { fail('swarm_evidence', `${id} ${item.seat} evidence is not JSON`); }
    if (seat.seat !== item.seat || seat.verdict !== item.verdict) fail('swarm_evidence', `${id} ${item.seat} evidence does not match the aggregate`);
    if (typeof seat.evidence !== 'string' || seat.evidence.trim().length < 8) fail('swarm_evidence', `${id} ${item.seat} evidence text is empty`);
    if (typeof seat.command !== 'string' || seat.command.length < 3) fail('swarm_evidence', `${id} ${item.seat} command is missing`);
  }
  return counts;
}

function checkReport(root, id, measured, rev) {
  const path = `reports/${id}.md`;
  const text = show(root, rev, path)?.toString('utf8');
  if (!text) fail('report_missing', `${id} report is missing`);
  if (!text.includes(`lane-commit: ${measured}`)) fail('report_commit', `${id} report does not cite the measured commit`);
  if (show(root, measured, path)) fail('report_not_after_commit', `${id} report was already in the cited commit`);
  const ancestor = git(root, ['merge-base', '--is-ancestor', measured, rev]);
  if (ancestor.status !== 0) fail('report_commit', `${id} cited commit is not an ancestor of the lane tip`);
  if (!/^## SHONEN$/m.test(text)) fail('report_shonen', `${id} report has no SHONEN heading`);
  for (const box of BOXES) {
    const line = text.split('\n').find(item => item.endsWith(box));
    if (!line || !/^- \[[x~ ]\] /.test(line)) fail('report_shonen', `${id} SHONEN box missing: ${box}`);
  }
}

function scanConsequential(root, id, rev) {
  const paths = [
    `corpus/lessons/${id}.md`,
    `reports/${id}.md`,
    ...list(root, rev, `corpus/evidence/${id}`),
  ];
  for (const path of paths) {
    const bytes = show(root, rev, path);
    if (!bytes) continue;
    const text = bytes.toString('latin1');
    for (const needle of NEEDLES) {
      if (text.includes(needle)) fail('consequential_action', `${id} contains ${needle} in ${path}`);
    }
    if (!path.endsWith('.json')) continue;
    let parsed;
    try { parsed = JSON.parse(bytes.toString('utf8')); } catch { continue; }
    const requests = Array.isArray(parsed.requests) ? parsed.requests : [];
    for (const request of requests) {
      const method = String(request.method || '').toUpperCase();
      if (method && method !== 'GET' && method !== 'HEAD') fail('consequential_action', `${id} recorded ${method} ${request.url || ''}`);
    }
  }
}

function sameTree(root, id, measured, rev) {
  const paths = [`corpus/lessons/${id}.md`, ...list(root, rev, `corpus/evidence/${id}`)];
  for (const path of paths) {
    if (blob(root, rev, path) !== blob(root, measured, path)) fail('evidence_moved', `${id} ${path} changed after the measured commit`);
  }
}

function checkPublic(root, ids, rev) {
  let found = 0;
  for (const id of ids) {
    const path = `corpus/evidence/${id}/public/capture.json`;
    const bytes = show(root, rev, path);
    if (!bytes) continue;
    let capture;
    try { capture = JSON.parse(bytes.toString('utf8')); } catch { fail('public_observation', `${id} public capture is not JSON`); }
    if (capture.class === 'egress-failure') continue;
    if (capture.class !== 'public-observation' || capture.consequential !== false) continue;
    let url;
    try { url = new URL(capture.url); } catch { fail('public_observation', `${id} public URL is unreadable`); }
    const host = url.hostname;
    if ((url.protocol !== 'https:' && url.protocol !== 'http:') || host === 'localhost' || host === '127.0.0.1' || host === '::1') {
      fail('public_observation', `${id} public URL is loopback or not http`);
    }
    const dir = `corpus/evidence/${id}/public`;
    for (const key of ['screenshot', 'dom']) {
      const file = capture[key];
      const digest = capture[`${key}Sha256`];
      if (typeof file !== 'string' || file.includes('/') || !/^[a-f0-9]{64}$/.test(digest || '')) fail('public_observation', `${id} ${key} pin is incomplete`);
      const body = show(root, rev, `${dir}/${file}`);
      if (!body) fail('public_observation', `${id} ${key} file is missing`);
      if (createHash('sha256').update(body).digest('hex') !== digest) fail('public_observation', `${id} ${key} hash does not match the file`);
    }
    found++;
  }
  if (found < 1) fail('public_observation', 'No admitted public-page capture');
}

function check(options) {
  const root = options.repo;
  const production = isProduction(root);
  const rev = laneTip(root);
  checkHistory(root, options.baseline, production, options.censusSha256, rev);
  const ids = roundIds(root, rev);
  if (ids.length !== options.expect) fail('round_count', `Found ${ids.length} pstack rounds, expected ${options.expect}`);
  for (let index = 0; index < ids.length; index++) {
    const wanted = `pstack-20261015-r${String(index + 1).padStart(2, '0')}`;
    if (ids[index] !== wanted) fail('round_sequence', `Expected ${wanted}, found ${ids[index]}`);
  }
  const scorecard = show(root, rev, 'SCORECARD.md').toString('utf8');
  const log = show(root, rev, 'LOG.md').toString('utf8');
  for (const id of ids) {
    const lesson = show(root, rev, `corpus/lessons/${id}.md`).toString('utf8');
    const gate = parseLesson(lesson, id);
    const swarm = checkSwarm(root, id, rev);
    const score = parseScore(scorecard, id);
    if (score.axis !== gate.axis) fail('missing_score', `${id} axis does not match its lesson`);
    if (score.before === score.after) fail('score_mismatch', `${id} before and after are the same`);
    if (!log.includes(id)) fail('missing_score', `${id} has no LOG entry`);
    const beforeCommand = score.command.replaceAll(score.measured, options.baseline);
    if (beforeCommand === score.command) fail('missing_score', `${id} counting command does not use the measured commit`);
    if (countCommandRevision(score.command) !== score.measured) fail('score_mismatch', `${id} counting revision operand is not the measured commit`);
    const measuredMentions = countStages(score.command).flat().filter(token => typeof token === 'string' && token.includes(score.measured)).length;
    if (measuredMentions !== 1) fail('score_mismatch', `${id} counting command mentions the measured commit outside its revision operand`);
    if (runCount(root, beforeCommand) !== score.before) fail('score_mismatch', `${id} before measurement does not match`);
    if (runCount(root, score.command) !== score.after) fail('score_mismatch', `${id} after measurement does not match`);
    checkReport(root, id, score.measured, rev);
    scanConsequential(root, id, rev);
    sameTree(root, id, score.measured, rev);
    const accounted = swarm.PASS + swarm.ISSUES + swarm.BLOCKED + swarm.DROPOUT + swarm.GAP;
    console.log(`ROUND id=${id} axis=${gate.axis} swarm=${accounted} pass=${swarm.PASS} issues=${swarm.ISSUES} blocked=${swarm.BLOCKED} dropout=${swarm.DROPOUT} gap=${swarm.GAP} admits=${gate.admits} rejects=${gate.rejects} spot=${gate.spot} consequential=0 before=${score.before} after=${score.after} measured-against=${score.measured}`);
  }
  checkPublic(root, ids, rev);
  console.log(`ROUND_CONTRACT verdict=clean rounds=${ids.length} consequential=0`);
}

function commit(root, subject) {
  const result = spawnSync('git', ['-c', 'user.name=tabi-selftest', '-c', 'user.email=tabi-selftest@local', 'commit', '-qm', subject], { cwd: root });
  if (result.status !== 0) fail('could_not_evaluate', 'Fixture commit failed', 2);
  return gitOk(root, ['rev-parse', 'HEAD']);
}

function writeGoodFixture(root) {
  const put = (path, value) => {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), value);
  };
  gitOk(root, ['init', '-q']);
  put('LOG.md', 'baseline-log\n');
  put('SCORECARD.md', 'baseline-score\n');
  put('SKILL.md', 'baseline-skill\n');
  put('PROVINCE.md', 'baseline-province\n');
  put('SHONEN.md', 'baseline-shonen\n');
  put('corpus/lessons/round-1.md', 'historical lesson\n');
  gitOk(root, ['add', '--', '.']);
  const baseline = commit(root, 'baseline');
  const id = 'pstack-20261015-r01';
  put('round-marker.txt', 'marker: admitted-round\n');
  const seats = [];
  for (let index = 1; index <= 32; index++) {
    const seat = `s${String(index).padStart(2, '0')}`;
    const evidence = `corpus/evidence/${id}/seats/${seat}/result.json`;
    put(evidence, JSON.stringify({
      seat,
      verdict: 'PASS',
      evidence: `marker counted for ${seat}`,
      command: 'git grep marker',
    }));
    seats.push({ seat, verdict: 'PASS', evidence });
  }
  put(`corpus/evidence/${id}/aggregate.json`, JSON.stringify({
    dispatcher: '/pstack:swarm',
    workers: 32,
    results: seats,
  }));
  const dom = 'h1=Example Domain\n';
  const screenshot = Buffer.from('png-bytes-fixture');
  put(`corpus/evidence/${id}/public/dom.txt`, dom);
  put(`corpus/evidence/${id}/public/screenshot.bin`, screenshot);
  put(`corpus/evidence/${id}/public/capture.json`, JSON.stringify({
    class: 'public-observation',
    url: 'https://example.com/',
    consequential: false,
    requests: [{ method: 'GET', url: 'https://example.com/' }],
    screenshot: 'screenshot.bin',
    screenshotSha256: createHash('sha256').update(screenshot).digest('hex'),
    dom: 'dom.txt',
    domSha256: createHash('sha256').update(dom).digest('hex'),
  }));
  put(`corpus/lessons/${id}.md`, [
    `# ${id}`,
    'axis: freshness',
    'consequential-external-actions: none',
    '',
    '## Gate',
    '- admitted: public-observation-example — measured document URL and heading',
    '- rejected: loopback-as-real-site — a loopback host is not a real site',
    '- spot-check: non-author reviewer-1 agree — re-counted the marker and the reject',
    '',
  ].join('\n'));
  gitOk(root, ['add', '--', '.']);
  const measured = commit(root, 'work');
  const command = `git grep -h '^marker: admitted-round$' ${measured} -- round-marker.txt | wc -l`;
  put('SCORECARD.md', `baseline-score\n<!-- pstack-round:${id}\naxis: freshness\nbefore: 0\nafter: 1\ncommand: ${command}\nmeasured-against: ${measured}\n-->\n`);
  put('LOG.md', `baseline-log\n${id} freshness 0 to 1\n`);
  put(`reports/${id}.md`, [
    `# ${id}`,
    '',
    `lane-commit: ${measured}`,
    '',
    '## SHONEN',
    '',
    '- [x] SKILL.md contains real decision tables, error patterns, checklists, cited sources',
    '- [x] At least one end-to-end domain task executed and logged in LOG.md',
    '- [~] Instructions executable by an agent without oral context',
    '- [ ] No cross-domain bleed (PROVINCE.md still accurate)',
    '',
  ].join('\n'));
  gitOk(root, ['add', '--', '.']);
  commit(root, 'measure');
  return baseline;
}

function writeCanonicalShonen(root) {
  writeFileSync(join(root, SHONEN_PATH), canonicalShonenText());
}

function writeCensus(root, baseline, tamperShonen = false) {
  const lines = [baseline];
  for (const path of list(root, baseline, '.').filter(protectedPath).sort()) {
    const recorded = tamperShonen && path === SHONEN_PATH ? '0'.repeat(40) : blob(root, baseline, path);
    lines.push(`${recorded} ${path}`);
  }
  mkdirSync(dirname(join(root, CENSUS_PATH)), { recursive: true });
  writeFileSync(join(root, CENSUS_PATH), `${lines.join('\n')}\n`);
}

function censusSha(root) {
  return createHash('sha256').update(readFileSync(join(root, CENSUS_PATH))).digest('hex');
}

// Self-test only: replace the fixture's single counting command and after count.
function rewriteScoreCommand(root, command, after) {
  const path = join(root, 'SCORECARD.md');
  const text = readFileSync(path, 'utf8')
    .replace(/^command: .*$/m, () => `command: ${command}`)
    .replace(/^after: \d+$/m, () => `after: ${after}`);
  writeFileSync(path, text);
}

// The fixture's measured commit is the 'work' commit, one behind HEAD after
// writeGoodFixture; the scorecard records it explicitly.
function fixtureMeasured(root) {
  const match = /^measured-against: ([a-f0-9]{40})$/m.exec(readFileSync(join(root, 'SCORECARD.md'), 'utf8'));
  if (!match) fail('could_not_evaluate', 'Fixture SCORECARD has no measured-against', 2);
  return match[1];
}

// Self-test only: shape the fixture like a jj lane. The poison commit drops one
// swarm result, which flips the verdict for any gate that reads it. The fixture
// branch is restored to the clean tip and HEAD is detached at the poison commit,
// so HEAD names bytes the branch does not; the harness's own 'mutation' commit
// then lands on the detached HEAD. The case asserts the gate reads the branch.
function detachFixture(root) {
  const sym = git(root, ['symbolic-ref', '-q', 'HEAD']);
  if (sym.status !== 0) fail('could_not_evaluate', 'Fixture HEAD starts detached', 2);
  if (sym.stdout.trim() !== 'refs/heads/master') gitOk(root, ['branch', '-m', 'master']);
  const tip = gitOk(root, ['rev-parse', 'refs/heads/master']);
  const path = join(root, 'corpus/evidence/pstack-20261015-r01/aggregate.json');
  const aggregate = JSON.parse(readFileSync(path, 'utf8'));
  aggregate.results = aggregate.results.slice(0, 31);
  writeFileSync(path, JSON.stringify(aggregate));
  gitOk(root, ['add', '--', '.']);
  const poison = commit(root, 'poison');
  gitOk(root, ['update-ref', 'refs/heads/master', tip]);
  gitOk(root, ['update-ref', '--no-deref', 'HEAD', poison]);
  // Leave one worktree change so the harness's post-mutation commit can land on
  // the detached HEAD without altering the poisoned tree.
  writeFileSync(join(root, 'detach-probe.txt'), 'detached head fixture\n');
  if (git(root, ['symbolic-ref', '-q', 'HEAD']).status === 0) fail('could_not_evaluate', 'Detached-HEAD fixture kept an attached HEAD', 2);
  if (gitOk(root, ['rev-parse', 'refs/heads/master']) !== tip) fail('could_not_evaluate', 'Detached-HEAD fixture moved the branch tip', 2);
  if (gitOk(root, ['rev-parse', 'HEAD:corpus/evidence/pstack-20261015-r01/aggregate.json'])
    === gitOk(root, ['rev-parse', 'refs/heads/master:corpus/evidence/pstack-20261015-r01/aggregate.json'])) {
    fail('could_not_evaluate', 'Detached-HEAD fixture has the branch tree at HEAD; the case cannot discriminate', 2);
  }
}

// Self-test only: detach the fixture and delete every local branch, so the
// lane-tip anchor has nothing to resolve and the gate must fail closed at 2.
function unresolvableFixture(root) {
  const sym = git(root, ['symbolic-ref', '-q', 'HEAD']);
  if (sym.status !== 0) fail('could_not_evaluate', 'Fixture HEAD starts detached', 2);
  gitOk(root, ['update-ref', '--no-deref', 'HEAD', gitOk(root, ['rev-parse', 'HEAD'])]);
  gitOk(root, ['branch', '-D', sym.stdout.trim().replace(/^refs\/heads\//, '')]);
  writeFileSync(join(root, 'detach-probe.txt'), 'detached head fixture\n');
  if (gitOk(root, ['for-each-ref', '--format=%(refname)', 'refs/heads/']) !== '') {
    fail('could_not_evaluate', 'Unresolvable-anchor fixture kept a local branch', 2);
  }
}

// Self-test only: a replace ref swaps the tip's blob bytes while the object id
// stays the printed tip, so only a child env with GIT_NO_REPLACE_OBJECTS=1 reads
// the committed bytes. The fixture asserts the hostile read is live before use.
function replaceRefFixture(root) {
  const path = 'corpus/evidence/pstack-20261015-r01/aggregate.json';
  const blob = gitOk(root, ['rev-parse', `refs/heads/master:${path}`]);
  const aggregate = JSON.parse(readFileSync(join(root, path), 'utf8'));
  aggregate.results = aggregate.results.slice(0, 31);
  const scratch = join(root, '.git', 'poison-blob.json');
  writeFileSync(scratch, JSON.stringify(aggregate));
  const poison = gitOk(root, ['hash-object', '-w', scratch]);
  rmSync(scratch);
  gitOk(root, ['replace', blob, poison]);
  const hostile = spawnSync('git', ['show', `refs/heads/master:${path}`], { cwd: root, encoding: 'utf8', env: { PATH: process.env.PATH } });
  if (gitOk(root, ['rev-parse', `refs/heads/master:${path}`]) !== blob) fail('could_not_evaluate', 'Replace-ref fixture moved the tip blob', 2);
  if (JSON.parse(hostile.stdout).results.length !== 31) fail('could_not_evaluate', 'Replace-ref fixture is inert', 2);
}

// Self-test only: the fixture branch becomes a symbolic ref into a
// remote-tracking ref, so the printed anchor names master while the commit comes
// from elsewhere. laneTip must refuse instead of laundering that provenance.
function symrefFixture(root) {
  const tip = gitOk(root, ['rev-parse', 'refs/heads/master']);
  gitOk(root, ['checkout', '-q', '--detach', tip]);
  writeFileSync(join(root, 'hostile.txt'), 'hostile\n');
  gitOk(root, ['add', '--', '.']);
  const hostile = commit(root, 'hostile');
  gitOk(root, ['update-ref', 'refs/remotes/o/evil', hostile]);
  gitOk(root, ['update-ref', '--no-deref', 'HEAD', tip]);
  gitOk(root, ['symbolic-ref', 'refs/heads/master', 'refs/remotes/o/evil']);
  if (gitOk(root, ['for-each-ref', '--format=%(symref)', '--', 'refs/heads/master']) !== 'refs/remotes/o/evil') {
    fail('could_not_evaluate', 'Symref fixture is inert', 2);
  }
}

// Self-test only: a HEAD git cannot parse. symbolic-ref exits 128; the gate must
// not mistake that failure for the detached-HEAD signal.
function invalidHeadFixture(root) {
  writeFileSync(join(root, '.git', 'HEAD'), 'ref: refs/heads/x^{tree}\n');
}

// Self-test only: HEAD names a rev-parse spelling that is not a ref name
// (`refs/heads/master@{1}` = the branch's previous value). Without an explicit
// ref-name check the gate would certify a reflog entry, not the branch.
function reflogHeadFixture(root) {
  const tip = gitOk(root, ['rev-parse', 'refs/heads/master']);
  const previous = gitOk(root, ['rev-parse', '--verify', 'refs/heads/master@{1}']);
  if (previous === tip) fail('could_not_evaluate', 'Reflog fixture has no distinct previous master', 2);
  writeFileSync(join(root, '.git', 'HEAD'), 'ref: refs/heads/master@{1}\n');
}

function selfTest() {
  const cases = [
    { name: 'clean', mutate: () => {}, exit: 0, finding: 'clean' },
    { name: 'lane_tip_detached_head', mutate: root => detachFixture(root), exit: 0, finding: 'clean',
      branchRerun: { exit: 1, finding: 'short_swarm' } },
    { name: 'lane_tip_unresolvable', mutate: root => unresolvableFixture(root), exit: 2, finding: 'could_not_evaluate' },
    { name: 'lane_tip_replace_ref', mutate: root => replaceRefFixture(root), exit: 0, finding: 'clean', noCommit: true },
    { name: 'lane_tip_symref', mutate: root => symrefFixture(root), exit: 2, finding: 'could_not_evaluate', noCommit: true },
    { name: 'lane_tip_invalid_head', mutate: root => invalidHeadFixture(root), exit: 2, finding: 'could_not_evaluate', noCommit: true },
    { name: 'lane_tip_reflog_spelling', mutate: root => reflogHeadFixture(root), exit: 2, finding: 'could_not_evaluate', noCommit: true },
    { name: 'short_swarm', mutate: root => {
      const path = join(root, 'corpus/evidence/pstack-20261015-r01/aggregate.json');
      const aggregate = JSON.parse(readFileSync(path, 'utf8'));
      aggregate.results = aggregate.results.slice(0, 31);
      writeFileSync(path, JSON.stringify(aggregate));
    }, exit: 1, finding: 'short_swarm' },
    { name: 'missing_gate', mutate: root => {
      writeFileSync(join(root, 'corpus/lessons/pstack-20261015-r01.md'), 'axis: freshness\nconsequential-external-actions: none\n\nNo gate section.\n');
    }, exit: 1, finding: 'missing_gate' },
    { name: 'consequential_action', mutate: root => {
      const path = join(root, 'corpus/lessons/pstack-20261015-r01.md');
      writeFileSync(path, readFileSync(path, 'utf8') + 'consequential-action: performed\n');
    }, exit: 1, finding: 'consequential_action' },
    { name: 'canonical_shonen', mutate: root => writeCanonicalShonen(root), exit: 0, finding: 'clean' },
    { name: 'canonical_shonen_census', mutate: (root, baseline, extra) => {
      writeCanonicalShonen(root);
      writeCensus(root, baseline);
      extra.push('--census-sha256', censusSha(root));
    }, exit: 0, finding: 'clean' },
    { name: 'shonen_invalid_mark', mutate: root => {
      writeFileSync(join(root, SHONEN_PATH), canonicalShonenText().replace('- [~] At least one', '- [?] At least one'));
    }, exit: 1, finding: 'shonen_policy' },
    { name: 'shonen_extra_prose', mutate: root => {
      writeFileSync(join(root, SHONEN_PATH), `${canonicalShonenText()}Extra prose after the boxes.\n`);
    }, exit: 1, finding: 'shonen_policy' },
    { name: 'shonen_missing_box', mutate: root => {
      const text = canonicalShonenText().split('\n');
      text.splice(8, 2);
      writeFileSync(join(root, SHONEN_PATH), text.join('\n'));
    }, exit: 1, finding: 'shonen_policy' },
    { name: 'shonen_x_without_verifier', mutate: root => {
      writeFileSync(join(root, SHONEN_PATH), canonicalShonenText().replace('- [~] SKILL.md', '- [x] SKILL.md'));
    }, exit: 1, finding: 'shonen_policy' },
    { name: 'shonen_x_self_declared', mutate: root => {
      const text = canonicalShonenText().split('\n');
      text[4] = `- [x] ${BOXES[0]}`;
      text[5] = '  verifier: reviewer-9 non-author — independent recheck of the box';
      writeFileSync(join(root, SHONEN_PATH), text.join('\n'));
    }, exit: 1, finding: 'shonen_policy' },
    { name: 'shonen_wrong_title', mutate: root => {
      writeFileSync(join(root, SHONEN_PATH), canonicalShonenText().replace('# tabi-shokunin —', '# other-checkout —'));
    }, exit: 1, finding: 'shonen_policy' },
    { name: 'shonen_missing_pointer', mutate: root => {
      const text = canonicalShonenText().split('\n');
      text[5] = '  prose only with no backticked path';
      writeFileSync(join(root, SHONEN_PATH), text.join('\n'));
    }, exit: 1, finding: 'shonen_policy' },
    { name: 'shonen_tree_pointer', mutate: root => {
      const text = canonicalShonenText().split('\n');
      text[5] = '  `corpus` — a directory is not a regular blob';
      writeFileSync(join(root, SHONEN_PATH), text.join('\n'));
    }, exit: 1, finding: 'shonen_policy' },
    { name: 'shonen_symlink_pointer', mutate: root => {
      writeFileSync(join(root, 'pointer-target.md'), 'target\n');
      symlinkSync('pointer-target.md', join(root, 'pointer-link.md'));
      const text = canonicalShonenText().split('\n');
      text[5] = '  `pointer-link.md` — a symlink is not a regular blob';
      writeFileSync(join(root, SHONEN_PATH), text.join('\n'));
    }, exit: 1, finding: 'shonen_policy' },
    { name: 'shonen_unchecked_prose', mutate: root => {
      const text = canonicalShonenText().split('\n');
      text[4] = `- [ ] ${BOXES[0]}`;
      writeFileSync(join(root, SHONEN_PATH), text.join('\n'));
    }, exit: 1, finding: 'shonen_policy' },
    { name: 'shonen_extra_evidence_line', mutate: root => {
      const text = canonicalShonenText().split('\n');
      text.splice(6, 0, '  `SKILL.md` extra evidence');
      writeFileSync(join(root, SHONEN_PATH), text.join('\n'));
    }, exit: 1, finding: 'shonen_policy' },
    { name: 'shonen_crlf', mutate: root => {
      writeFileSync(join(root, SHONEN_PATH), canonicalShonenText().replaceAll('\n', '\r\n'));
    }, exit: 1, finding: 'shonen_policy' },
    { name: 'shonen_double_newline', mutate: root => {
      writeFileSync(join(root, SHONEN_PATH), `${canonicalShonenText()}\n`);
    }, exit: 1, finding: 'shonen_policy' },
    { name: 'census_row_mismatch', mutate: (root, baseline) => writeCensus(root, baseline, true), exit: 1, finding: 'history_rewritten' },
    { name: 'census_missing_row', mutate: (root, baseline, extra) => {
      writeCensus(root, baseline);
      extra.push('--census-sha256', censusSha(root));
      const path = join(root, CENSUS_PATH);
      const kept = readFileSync(path, 'utf8').trimEnd().split('\n').filter(line => !line.endsWith(` ${SHONEN_PATH}`));
      writeFileSync(path, `${kept.join('\n')}\n`);
    }, exit: 1, finding: 'history_rewritten' },
    { name: 'census_byte_tamper', mutate: (root, baseline, extra) => {
      writeCensus(root, baseline);
      extra.push('--census-sha256', censusSha(root));
      const path = join(root, CENSUS_PATH);
      const lines = readFileSync(path, 'utf8').trimEnd().split('\n');
      lines[1] = `0000000000000000000000000000000000000000 ${lines[1].slice(41)}`;
      writeFileSync(path, `${lines.join('\n')}\n`);
    }, exit: 1, finding: 'history_rewritten' },
    { name: 'census_deleted', mutate: (root, baseline, extra) => {
      writeCensus(root, baseline);
      // The census is new at HEAD, so deletion has no tracked delta unless the
      // good fixture census is committed as a checkpoint first.
      gitOk(root, ['add', '--', '.']);
      commit(root, 'census-checkpoint');
      extra.push('--census-sha256', censusSha(root));
      rmSync(join(root, CENSUS_PATH));
    }, exit: 1, finding: 'history_rewritten' },
    { name: 'census_moved_baseline', mutate: (root, baseline, extra) => {
      writeCensus(root, baseline);
      const path = join(root, CENSUS_PATH);
      const lines = readFileSync(path, 'utf8').trimEnd().split('\n');
      lines[0] = '1'.repeat(40);
      writeFileSync(path, `${lines.join('\n')}\n`);
      extra.push('--census-sha256', censusSha(root));
    }, exit: 1, finding: 'history_rewritten' },
    { name: 'historical_mutation', mutate: root => {
      const path = join(root, 'corpus/lessons/round-1.md');
      writeFileSync(path, `${readFileSync(path, 'utf8')}rewritten history\n`);
    }, exit: 1, finding: 'history_rewritten' },
    { name: 'count_supported_tree_lines', mutate: root => {
      const measured = fixtureMeasured(root);
      rewriteScoreCommand(root, `git ls-tree -r --name-only ${measured} | grep corpus/evidence/pstack-20261015-r01/seats/ | wc -l`, 32);
    }, exit: 0, finding: 'clean' },
    { name: 'count_supported_two_filters', mutate: root => {
      const measured = fixtureMeasured(root);
      rewriteScoreCommand(root, `git ls-tree -r --name-only ${measured} | grep pstack-20261015-r01/seats/ | grep result.json | wc -l`, 32);
    }, exit: 0, finding: 'clean' },
    { name: 'count_supported_git_grep', mutate: root => {
      const measured = fixtureMeasured(root);
      rewriteScoreCommand(root, `git grep -h 'marker counted for' ${measured} -- corpus/evidence/pstack-20261015-r01/seats | wc -l`, 32);
    }, exit: 0, finding: 'clean' },
    { name: 'count_malicious_extra_stage', mutate: root => {
      const measured = fixtureMeasured(root);
      rewriteScoreCommand(root, `git ls-tree -r --name-only ${measured} | grep marker | tee count-extra-marker | wc -l`, 1);
    }, exit: 1, finding: 'score_mismatch', marker: 'count-extra-marker', detail: 'may only filter the listing with plain grep' },
    { name: 'count_unsupported_grep_option', mutate: root => {
      const measured = fixtureMeasured(root);
      rewriteScoreCommand(root, `git ls-tree -r --name-only ${measured} | grep -v | tee count-option-marker | wc -l`, 1);
    }, exit: 1, finding: 'score_mismatch', marker: 'count-option-marker', detail: 'pattern looks like an option' },
    { name: 'count_traversal_grep_path', mutate: root => {
      const measured = fixtureMeasured(root);
      rewriteScoreCommand(root, `git grep -h marker ${measured} -- ../count-traversal-input | wc -l`, 1);
    }, exit: 1, finding: 'score_mismatch', marker: 'count-traversal-marker', detail: 'path is not a relative repository path' },
    { name: 'future_lesson_allowed', mutate: root => {
      mkdirSync(join(root, 'corpus/lessons'), { recursive: true });
      writeFileSync(join(root, 'corpus/lessons/round-2.md'), 'future lesson\n');
    }, exit: 0, finding: 'clean' },
  ];
  for (const test of cases) {
    const root = mkdtempSync(join('/var/tmp', 'tabi-round-contract-'));
    try {
      const baseline = writeGoodFixture(root);
      const extra = [];
      test.mutate(root, baseline, extra);
      if (test.name !== 'clean' && !test.noCommit) {
        gitOk(root, ['add', '--', '.']);
        commit(root, 'mutation');
      }
      const result = spawnSync(process.execPath, [script, '--repo', root, '--baseline', baseline, '--expect', '1', ...extra], { encoding: 'utf8' });
      const output = `${result.stdout}${result.stderr}`;
      const markerOk = !test.marker || !existsSync(join(root, test.marker));
      const detailOk = !test.detail || output.includes(test.detail);
      const marker = test.marker ? ` no_marker=${markerOk ? 1 : 0}` : '';
      const match = result.status === test.exit && output.includes(test.finding === 'clean' ? 'verdict=clean' : `finding=${test.finding}`) && markerOk && detailOk;
      console.log(`SELFTEST name=${test.name} expected_exit=${test.exit} actual_exit=${result.status} expected_finding=${test.finding} result=${match ? 'PASS' : 'FAIL'}${marker}`);
      if (test.branchRerun) {
        // Arm C: name the bytes the detached HEAD already names, so a gate that
        // certifies committed branch state must go red. Without this flip the
        // green arm above would also pass a gate that ignored HEAD entirely.
        gitOk(root, ['update-ref', 'refs/heads/master', gitOk(root, ['rev-parse', 'HEAD'])]);
        const rerun = spawnSync(process.execPath, [script, '--repo', root, '--baseline', baseline, '--expect', '1', ...extra], { encoding: 'utf8' });
        const rerunOutput = `${rerun.stdout}${rerun.stderr}`;
        const rerunMatch = rerun.status === test.branchRerun.exit && rerunOutput.includes(`finding=${test.branchRerun.finding}`);
        console.log(`SELFTEST name=${test.name}_branch_names_poison expected_exit=${test.branchRerun.exit} actual_exit=${rerun.status} expected_finding=${test.branchRerun.finding} result=${rerunMatch ? 'PASS' : 'FAIL'}`);
        if (!rerunMatch) fail('selftest_failure', rerunOutput);
      }
      if (!match) fail('selftest_failure', output);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
  const countRev = COUNT_WITNESS_REV;
  const countRun = spawnSync(process.execPath, [script, '--count-witness', countRev], { encoding: 'utf8' });
  const countOutput = `${countRun.stdout}${countRun.stderr}`;
  const countField = name => new RegExp(`\\b${name}=([^\\s]+)`).exec(countOutput)?.[1] ?? 'none';
  const countOldExit = countField('old_exit');
  const countOldFinding = countField('old_finding');
  const countOldMarker = countField('old_marker');
  const countNewExit = countField('new_exit');
  const countNewFinding = countField('new_finding');
  const countNewMarker = countField('new_marker');
  const countOk = countRun.status === 0
    && countOldExit === '0' && countOldFinding === 'clean' && countOldMarker === '1'
    && countNewExit === '1' && countNewFinding === 'score_mismatch' && countNewMarker === '0';
  console.log(`SELFTEST name=count_witness_comparison countWitness=1 top_exit=${countRun.status} exit=${countRun.status} verdict=${countOk ? 'clean' : 'failed'} old_exit=${countOldExit} old_finding=${countOldFinding} old_marker=${countOldMarker} new_exit=${countNewExit} new_finding=${countNewFinding} new_marker=${countNewMarker} result=${countOk ? 'PASS' : 'FAIL'}`);
  if (!countOk) fail('selftest_failure', countOutput);
  const aliasRoot = mkdtempSync(join('/var/tmp', 'tabi-round-alias-'));
  const alias = join(aliasRoot, 'repo');
  try {
    symlinkSync(defaultRoot, alias);
    const result = spawnSync(process.execPath, [script, '--repo', alias, '--baseline', HARD_BASELINE, '--expect', '10', '--census-sha256', '0'.repeat(64)], { encoding: 'utf8' });
    const output = `${result.stdout}${result.stderr}`;
    const match = result.status === 2 && output.includes('finding=usage');
    console.log(`SELFTEST name=production_alias_refused expected_exit=2 actual_exit=${result.status} expected_finding=usage result=${match ? 'PASS' : 'FAIL'}`);
    if (!match) fail('selftest_failure', output);
  } finally {
    try { unlinkSync(alias); } catch {}
    rmSync(aliasRoot, { recursive: true, force: true });
  }
  console.log(`ROUND_CONTRACT_SELFTEST verdict=clean cases=${cases.length} alias_checks=1`);
}

// Regression witness: identical fixture, only the gate bytes differ. The gate at
// REV is the red-before arm; this file is the green-after arm. Both receive the
// same --repo/--baseline/--expect arguments and run as separate processes.
function witness(rev) {
  const oldBlob = blob(defaultRoot, rev, 'scripts/check-round-contract.mjs');
  if (oldBlob !== LEGACY_GATE_BLOB) fail('usage', `--witness revision must resolve to the pinned legacy gate blob ${LEGACY_GATE_BLOB}`, 2);
  const oldSource = show(defaultRoot, rev, 'scripts/check-round-contract.mjs');
  if (!oldSource) fail('usage', `No scripts/check-round-contract.mjs at ${rev}`, 2);
  if (gitBlobId(oldSource) !== oldBlob) fail('usage', `--witness source bytes do not hash to blob ${oldBlob}`, 2);
  const scratch = mkdtempSync(join('/var/tmp', 'tabi-round-witness-'));
  const root = join(scratch, 'repo');
  const oldGate = join(scratch, 'old-gate.mjs');
  mkdirSync(root);
  writeFileSync(oldGate, oldSource);
  try {
    const baseline = writeGoodFixture(root);
    writeCanonicalShonen(root);
    gitOk(root, ['add', '--', '.']);
    commit(root, 'canonical-shonen');
    const args = ['--repo', root, '--baseline', baseline, '--expect', '1'];
    const oldRun = spawnSync(process.execPath, [oldGate, ...args], { encoding: 'utf8' });
    const newRun = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
    const oldOutput = `${oldRun.stdout}${oldRun.stderr}`;
    const newOutput = `${newRun.stdout}${newRun.stderr}`;
    const oldFinding = /finding=(\w+)/.exec(oldOutput)?.[1] ?? 'none';
    const newVerdict = /ROUND_CONTRACT verdict=(\w+)/.exec(newOutput)?.[1] ?? 'none';
    const pass = oldRun.status === 1 && oldFinding === 'history_rewritten' && newRun.status === 0 && newVerdict === 'clean';
    console.log(`ROUND_CONTRACT_WITNESS fixture=shared old_rev=${rev} old_exit=${oldRun.status} old_finding=${oldFinding} new_exit=${newRun.status} new_verdict=${newVerdict} result=${pass ? 'PASS' : 'FAIL'}`);
    if (!pass) {
      console.log(`WITNESS_OLD ${oldOutput.trim()}`);
      console.log(`WITNESS_NEW ${newOutput.trim()}`);
      fail('witness_failure', 'Old and edited gates disagreed on the identical canonical-SHONEN fixture');
    }
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

// Count-command red-before arm: one fixture, one SCORECARD command. The pinned
// prior gate accepts the extra `tee` stage and executes it through its shell;
// this gate refuses the unrecognized stage before a process starts. The marker
// is relative to the fixture root and removed between the two arms.
function countWitness(rev) {
  const oldBlob = blob(defaultRoot, rev, 'scripts/check-round-contract.mjs');
  if (oldBlob !== COUNT_WITNESS_BLOB) fail('usage', `--count-witness revision must resolve to the pinned prior gate blob ${COUNT_WITNESS_BLOB}`, 2);
  const oldSource = show(defaultRoot, rev, 'scripts/check-round-contract.mjs');
  if (!oldSource) fail('usage', `No scripts/check-round-contract.mjs at ${rev}`, 2);
  if (gitBlobId(oldSource) !== oldBlob) fail('usage', `--count-witness source bytes do not hash to blob ${oldBlob}`, 2);
  const scratch = mkdtempSync(join('/var/tmp', 'tabi-round-count-witness-'));
  const root = join(scratch, 'repo');
  const oldGate = join(scratch, 'old-gate.mjs');
  const marker = '.round14-count-marker';
  mkdirSync(root);
  writeFileSync(oldGate, oldSource);
  try {
    const baseline = writeGoodFixture(root);
    const measured = fixtureMeasured(root);
    rewriteScoreCommand(root, `git ls-tree -r --name-only ${measured} | grep round-marker.txt | tee ${marker} | wc -l`, 1);
    gitOk(root, ['add', '--', '.']);
    commit(root, 'count-injection');
    const head = gitOk(root, ['rev-parse', 'HEAD']);
    const args = ['--repo', root, '--baseline', baseline, '--expect', '1'];
    const oldRun = spawnSync(process.execPath, [oldGate, ...args], { encoding: 'utf8' });
    const oldOutput = `${oldRun.stdout}${oldRun.stderr}`;
    const oldMarker = existsSync(join(root, marker));
    if (oldMarker) unlinkSync(join(root, marker));
    const oldHead = gitOk(root, ['rev-parse', 'HEAD']);
    const newRun = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
    const newOutput = `${newRun.stdout}${newRun.stderr}`;
    const newMarker = existsSync(join(root, marker));
    const newHead = gitOk(root, ['rev-parse', 'HEAD']);
    const oldVerdict = /ROUND_CONTRACT verdict=(\w+)/.exec(oldOutput)?.[1] ?? 'none';
    const oldFinding = /finding=(\w+)/.exec(oldOutput)?.[1] ?? (oldVerdict === 'clean' ? 'clean' : 'none');
    const newFinding = /finding=(\w+)/.exec(newOutput)?.[1] ?? 'none';
    const headStable = head === oldHead && head === newHead;
    const pass = oldRun.status === 0 && oldVerdict === 'clean' && oldMarker
      && !newMarker && newRun.status === 1 && newFinding === 'score_mismatch' && headStable;
    const codeRevision = laneTip(defaultRoot);
    const codeBytes = readFileSync(script);
    const codeSha256 = createHash('sha256').update(codeBytes).digest('hex');
    // The revision is the lane tip and the digest is the worktree bytes; a
    // receipt that printed both with no committed bit would credit the tip with
    // bytes it does not contain during a wave before integration.
    const codeCommitted = blob(defaultRoot, codeRevision, 'scripts/check-round-contract.mjs') === gitBlobId(codeBytes);
    console.log(`ROUND_CONTRACT_COUNT_WITNESS fixture=shared exit=${pass ? 0 : 2} verdict=${pass ? 'clean' : 'failed'} old_rev=${rev} baseline=${baseline} code_revision=${codeRevision} code_sha256=${codeSha256} code_committed=${codeCommitted ? 'yes' : 'no'} old_exit=${oldRun.status} old_verdict=${oldVerdict} old_finding=${oldFinding} old_marker=${oldMarker ? 1 : 0} new_exit=${newRun.status} new_finding=${newFinding} new_marker=${newMarker ? 1 : 0} head_stable=${headStable ? 1 : 0} result=${pass ? 'PASS' : 'FAIL'}`);
    if (!pass) {
      console.log(`COUNT_WITNESS_OLD ${oldOutput.trim()}`);
      console.log(`COUNT_WITNESS_NEW ${newOutput.trim()}`);
      fail('count_witness_failure', 'Prior and edited gates disagreed on one shell-count command');
    }
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

try {
  const options = argumentsOf(process.argv.slice(2));
  if (options.selfTest) selfTest();
  else if (options.witness) witness(options.witness);
  else if (options.countWitness) countWitness(options.countWitness);
  else check(options);
} catch (error) {
  const exit = error.exit ?? 2;
  console.error(`ROUND_CONTRACT verdict=${exit === 1 ? 'failed' : 'could-not-evaluate'} finding=${error.finding ?? 'could_not_evaluate'} detail=${error.message}`);
  process.exitCode = exit;
}
