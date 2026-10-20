#!/usr/bin/env node
// Reads committed user-20261015 round files only. A miss exits non-zero.
// The production pstack checker is a different script and stays unchanged.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync, realpathSync, symlinkSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const defaultRoot = resolve(dirname(script), '..');
const HARD_BASELINE = '7f506affa55f6fb892d3c8073c75151c998bdf2c';
const PSTACK_PIN = '92d700d6a8aa9855f1e9d2cc8e12c82f762a1367';
// Lane-owned round-gate identities accepted after PSTACK_PIN. The exact
// current bytes are pinned below; any unrecorded change to that file (or a
// policy/self-blessing redirect) still fails history_rewritten.
const ROUND_SCRIPT = 'scripts/check-round-contract.mjs';
// Exact accepted checker identities. Each entry is one explicit byte
// identity, never a pattern or an exemption:
//   prior   - the archived blob at PSTACK_PIN (git blob b2eb8316, sha256
//             7d403cee)
//   current - the round-14 non-shell runCount cutover in this wave
// The round-13 history has two archived intermediates: 1199150 (git blob
// d871e73d, sha256 6f9eddc7) and 1212207 (git blob 43db9f4b, sha256
// 8478cd43). They are admitted only while walking pin..HEAD, never as the HEAD
// bytes. HEAD must be the prior or the current identity; any other commit in
// that history must be one of the four explicit identities. The archived bytes
// at PSTACK_PIN must still hash to the prior identity.
const ROUND_SCRIPT_PRIOR_SHA256 = '7d403cee003c3b49e865d57e034821ea925252efc231b0b22ded62ac5410c398';
const ROUND_SCRIPT_INTERMEDIATE_SHA256 = '6f9eddc74f0e10ac5046ed9ecd99650db4f338c004f5d0e349503b6515a6b299';
const ROUND_SCRIPT_CUTOVER_SHA256 = '8478cd438b22f15bab153901276aad8afc7711d139e86769f4323b5f0affdb4d';
const ROUND_SCRIPT_CURRENT_SHA256 = '8a573b4ed5875ce24a6d5f60e68cee575bc0687968c5105d4e9e3cfb0febe942';
const ROUND_SCRIPT_ARCHIVED_SHA256 = [
  ROUND_SCRIPT_PRIOR_SHA256,
  ROUND_SCRIPT_INTERMEDIATE_SHA256,
  ROUND_SCRIPT_CUTOVER_SHA256,
];
const ROUND_SCRIPT_ACCEPTED_SHA256 = [
  ROUND_SCRIPT_PRIOR_SHA256,
  ROUND_SCRIPT_CURRENT_SHA256,
];
// Independent canonical seed authority. Parent PROTOCOL.md @6bd4f38 lines
// 333-340 (byte-identical since 70ffb66), <name> = tabi-shokunin, normalized to
// the four [ ] boxes with no evidence lines. Never read the parent at runtime.
const SHONEN_NAME = 'tabi-shokunin';
const SHONEN_SEED_SHA256 = 'b45c2ac3cdf8ba80563e77cabf72670a6a101590f8031d9b484c67313bcdab67';
// The pre-repair gate bytes used as the witness red-before arm. Any rev whose
// scripts/check-user-round-contract.mjs blob differs is not the legacy arm.
const USER_SCRIPT = 'scripts/check-user-round-contract.mjs';
const LEGACY_USER_GATE_BLOB = '18e2c79ada4258cc46af7696e98907299b77c431';
// The immediate shell-bearing USER gate at the round-13 verifier baseline
// bebe2ef (sha256 69066121…). --count-witness accepts only these exact bytes
// as the red arm, so the same command is executed by the old shell and refused
// by the new evaluator without trusting any other revision's source.
const LEGACY_COUNT_GATE_BLOB = '7df3ee9f4df6db3c36c886f9173715bc299ce43a';
const LEGACY_LESSON = /^corpus\/lessons\/round-\d+\.md$/;
const VALIDATOR = '/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs';
const ROLES = ['scout', 'reviewer', 'critic', 'connector', 'sentinel', 'executor', 'mutation-tester', 'revenger', 'simplifier', 'scribe'];
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
const PSTACK_PATHS = [
  'corpus/evidence/pstack-20261015',
  'corpus/lessons',
  'reports',
  'scripts/check-round-contract.mjs',
  'scripts/pstack-seat.mjs',
  'scripts/pstack-aggregate.mjs',
  'scripts/check-freshness.mjs',
  'SHONEN.md',
];

// A refusal carries one stable reason id in addition to its finding. Reason ids
// are a closed vocabulary for the counting contract, so a caller can assert the
// intended cause (for example unsupported_counting_command) rather than the
// generic score_mismatch finding that several different causes share. Findings
// outside the counting contract pass no reason and keep their historical line.
// The published line is `verdict=... finding=... [reason=...] detail=...`, so a
// consumer parses reason between finding and detail and never infers it from
// prose. COUNT_REASONS rejects an unregistered id at construction time.
const COUNT_REASONS = new Set([
  'unsupported_counting_command',
  'counting_revision_mismatch',
  'counting_command_failed',
  'score_not_improved',
  'before_count_mismatch',
  'after_count_mismatch',
]);

function fail(finding, detail, exit = 1, reason = null) {
  if (reason !== null && !COUNT_REASONS.has(reason)) {
    throw Object.assign(new Error(`Unknown refusal reason: ${reason}`), { finding: 'could_not_evaluate', exit: 2 });
  }
  throw Object.assign(new Error(detail), { finding, exit, reason });
}

function sameRoot(left, right) {
  try {
    return realpathSync(left) === realpathSync(right);
  } catch {
    return resolve(left) === resolve(right);
  }
}

function git(root, args, binary = false) {
  return spawnSync('git', args, { cwd: root, encoding: binary ? undefined : 'utf8' });
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

function list(root, rev, prefix) {
  const result = git(root, ['ls-tree', '-r', '--name-only', rev, '--', prefix]);
  if (result.status !== 0) return [];
  return result.stdout.split('\n').filter(Boolean);
}

function protectedPath(path) {
  return LEGACY_LESSON.test(path)
    || path.startsWith('corpus/evidence/fleet-round-1-freshness/')
    || path.startsWith('.ufo/rounds/fleet-round-1-interactive-20261015/')
    || path.startsWith('.ufo/reports/fleet-round-1-attempt-20261015/')
    || path.startsWith('.ufo/plans/fleet-round-1-interactive-20261015')
    || path.startsWith('.ufo/continuation/fleet-round-1-interactive-20261015')
    || path === 'scripts/check-freshness.mjs'
    || path === 'SHONEN.md';
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

// Node-side git blob identity. The witness resolves a blob id and separately
// reads bytes; refs/replace must not be able to make those two disagree.
function gitBlobSha1(bytes) {
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
}

function committedBlob(root, path) {
  if (!path || path.includes('..') || path.startsWith('/') || /[*?\[]/.test(path)) return false;
  const result = git(root, ['--literal-pathspecs', 'ls-tree', 'HEAD', '--', path]);
  if (result.status !== 0) return false;
  const lines = result.stdout.split('\n').filter(Boolean);
  if (lines.length !== 1) return false;
  const match = /^(\d{6}) blob [a-f0-9]+\t(.+)$/.exec(lines[0]);
  return Boolean(match) && (match[1] === '100644' || match[1] === '100755') && match[2] === path;
}

function pointerResolves(line, root) {
  for (const match of line.matchAll(/`([^`\s]+)`/g)) {
    const path = match[1].replace(/:\d+(?:-\d+)?$/, '').replace(/^\.\//, '');
    if (committedBlob(root, path)) return true;
  }
  return false;
}

// Canonical protocol seed: fixed lane title, lead line, four boxes in order,
// exactly one trailing LF, no CR. Marks are [ ] or [~]; [ ] carries no prose,
// [~] carries exactly one indented evidence line with a committed regular blob
// pointer. [x] would claim a verifier this gate cannot authenticate.
function canonicalShonen(bytes, root) {
  const text = bytes?.toString('utf8');
  if (!text || text.includes('\r')) return false;
  if (!text.endsWith('\n') || text.endsWith('\n\n')) return false;
  const lines = text.slice(0, -1).split('\n');
  const preamble = [
    `# ${SHONEN_NAME} — Promotion checklist`,
    '',
    'Promotion to shokunin requires all of:',
    '',
  ];
  if (lines.length < preamble.length + BOXES.length) return false;
  for (let index = 0; index < preamble.length; index++) {
    if (lines[index] !== preamble[index]) return false;
  }
  const normalized = [...preamble];
  let cursor = preamble.length;
  for (const box of BOXES) {
    const line = lines[cursor++];
    if (typeof line !== 'string') return false;
    if (!line.startsWith('- [ ] ') && !line.startsWith('- [~] ')) return false;
    if (line.slice(6) !== box) return false;
    normalized.push(`- [ ] ${box}`);
    const marked = line[3] === '~';
    const evidence = lines[cursor];
    if (evidence && evidence.startsWith('  ')) {
      if (!marked) return false;
      if (evidence.trim().length < 8 || !pointerResolves(evidence, root)) return false;
      cursor++;
    } else if (marked) {
      return false;
    }
  }
  normalized.push('');
  return cursor === lines.length && sha256(normalized.join('\n')) === SHONEN_SEED_SHA256;
}

// Accept only the explicit recorded identities. The archived bytes must still
// hash to the recorded prior digest, so the chain cannot be re-signed.
function acceptedRoundScript(root, pstackPin) {
  if (ROUND_SCRIPT_ACCEPTED_SHA256.some(digest => !/^[a-f0-9]{64}$/.test(digest))) {
    fail('could_not_evaluate', 'Round checker accepted digest chain is not filled', 2);
  }
  const head = show(root, 'HEAD', ROUND_SCRIPT);
  if (!head) return false;
  const pinned = show(root, pstackPin, ROUND_SCRIPT);
  if (pinned && sha256(pinned) !== ROUND_SCRIPT_PRIOR_SHA256) {
    fail('could_not_evaluate', 'Pinned checker bytes are not the recorded prior bytes', 2);
  }
  if (!pinned && sameRoot(root, defaultRoot)) fail('could_not_evaluate', 'Pinned checker bytes are missing', 2);
  const history = git(root, ['log', '--no-show-signature', '--format=%H', `${pstackPin}..HEAD`, '--', ROUND_SCRIPT]);
  if (history.status !== 0) fail('could_not_evaluate', 'Checker history query failed', 2);
  const archived = new Set([...ROUND_SCRIPT_ARCHIVED_SHA256, ROUND_SCRIPT_CURRENT_SHA256]);
  for (const rev of history.stdout.split('\n').filter(Boolean)) {
    const bytes = show(root, rev, ROUND_SCRIPT);
    if (!bytes || !archived.has(sha256(bytes))) return false;
  }
  return ROUND_SCRIPT_ACCEPTED_SHA256.includes(sha256(head));
}

// A round-N lesson is frozen at the baseline when present there. A lesson
// absent at the baseline is admitted only as an initial addition and only when
// no later commit in the pin range modified, deleted, renamed, or retyped it.
function lessonDrift(root, baseline, pstackPin, status, path) {
  const historical = blob(root, baseline, path);
  if (historical) return blob(root, 'HEAD', path) !== historical;
  if (status !== 'A') return true;
  if (!blob(root, 'HEAD', path)) return true;
  const changed = git(root, ['log', '--no-show-signature', '-m', '--no-renames', '--diff-filter=MDRT', '--format=%H', `${pstackPin}..HEAD`, '--', path]);
  if (changed.status !== 0) fail('could_not_evaluate', 'Lesson history query failed', 2);
  return changed.stdout.trim().length > 0;
}

function pstackDrift(root, baseline, pstackPin, status, path) {
  if (path === ROUND_SCRIPT) return !acceptedRoundScript(root, pstackPin);
  if (path === 'SHONEN.md') return !canonicalShonen(show(root, 'HEAD', path), root);
  if (LEGACY_LESSON.test(path)) return lessonDrift(root, baseline, pstackPin, status, path);
  return path.startsWith('corpus/evidence/pstack-20261015')
    || /^corpus\/lessons\/pstack-20261015-r\d{2}\.md$/.test(path)
    || /^reports\/pstack-20261015-r\d{2}\.md$/.test(path)
    || path === 'scripts/pstack-seat.mjs'
    || path === 'scripts/pstack-aggregate.mjs'
    || path === 'scripts/check-freshness.mjs'
    || protectedPath(path);
}

function argumentsOf(argv) {
  const options = { repo: defaultRoot, baseline: HARD_BASELINE, expect: 10, selfTest: false, pstackPin: null, witness: null, countWitness: null, diagnosticWitness: false };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === '--self-test') options.selfTest = true;
    else if (flag === '--diagnostic-witness') options.diagnosticWitness = true;
    else if (flag === '--witness' && argv[i + 1]) options.witness = argv[++i];
    else if (flag === '--count-witness' && argv[i + 1]) options.countWitness = argv[++i];
    else if (flag === '--repo' && argv[i + 1]) options.repo = resolve(argv[++i]);
    else if (flag === '--baseline' && argv[i + 1]) options.baseline = argv[++i];
    else if (flag === '--expect' && argv[i + 1]) options.expect = Number(argv[++i]);
    else if (flag === '--pstack-pin' && argv[i + 1]) options.pstackPin = argv[++i];
    else fail('usage', 'Use --self-test, --diagnostic-witness, --witness REV, --count-witness REV, or --repo PATH --baseline HASH --expect N [--pstack-pin HASH] for an isolated fixture', 2);
  }
  if (options.selfTest && argv.length !== 1) fail('usage', '--self-test takes no other arguments', 2);
  if (options.diagnosticWitness && argv.length !== 1) fail('usage', '--diagnostic-witness takes no other arguments', 2);
  if (options.witness !== null && options.countWitness !== null) fail('usage', 'Use one witness mode', 2);
  if (options.witness !== null) {
    if (argv.length !== 2 || !/^[a-f0-9]{7,40}$/.test(options.witness)) fail('usage', '--witness takes one git revision whose gate bytes are the red-before arm', 2);
    return options;
  }
  if (options.countWitness !== null) {
    if (argv.length !== 2 || !/^[a-f0-9]{7,40}$/.test(options.countWitness)) fail('usage', '--count-witness takes one git revision whose shell gate bytes are the red-before arm', 2);
    return options;
  }
  if (!/^[a-f0-9]{40}$/.test(options.baseline)) fail('usage', 'Baseline must be 40 hex characters', 2);
  if (!Number.isInteger(options.expect) || options.expect < 1 || options.expect > 10) fail('usage', 'Expect must be 1..10', 2);
  if (options.pstackPin && !/^[a-f0-9]{40}$/.test(options.pstackPin)) fail('usage', 'Pstack pin must be 40 hex characters', 2);
  if (sameRoot(options.repo, defaultRoot) && (options.baseline !== HARD_BASELINE || options.expect !== 10 || options.pstackPin)) {
    fail('usage', 'Production check uses the fixed baseline, expects ten rounds, and takes no pstack override', 2);
  }
  return options;
}

function checkHistory(root, baseline, production, pstackPin) {
  const head = gitOk(root, ['rev-parse', 'HEAD']);
  const ancestor = git(root, ['merge-base', '--is-ancestor', baseline, head]);
  if (ancestor.status !== 0) fail('history_rewritten', 'Baseline is not an ancestor of HEAD');
  for (const path of list(root, baseline, '.').filter(protectedPath)) {
    const before = blob(root, baseline, path);
    const after = blob(root, head, path);
    if (path === 'SHONEN.md' && before && canonicalShonen(show(root, head, path), root)) continue;
    if (!before || before !== after) fail('history_rewritten', `Protected bytes changed: ${path}`);
  }
  for (const path of APPEND_ONLY) {
    const before = show(root, baseline, path);
    if (!before) continue;
    const after = show(root, head, path);
    if (!after || !after.subarray(0, before.length).equals(before)) fail('history_rewritten', `Append-only prefix changed: ${path}`);
  }
  const pin = production ? PSTACK_PIN : pstackPin;
  if (!pin) return;
  const pinned = git(root, ['merge-base', '--is-ancestor', pin, head]);
  if (pinned.status !== 0) fail('history_rewritten', 'Pstack pin is not an ancestor of HEAD');
  const diff = git(root, ['diff', '--no-renames', '--name-status', pin, head, '--', ...PSTACK_PATHS]);
  if (diff.status !== 0) fail('could_not_evaluate', 'Pstack pin diff failed', 2);
  const drifted = diff.stdout.split('\n').filter(Boolean).filter(line => {
    const match = /^([A-Z])\t(.+)$/.exec(line);
    if (!match) fail('could_not_evaluate', 'Pstack diff line is malformed', 2);
    return pstackDrift(root, baseline, pin, match[1], match[2]);
  });
  if (drifted.length) fail('history_rewritten', `Pstack bytes changed: ${drifted[0]}`);
}

function roundIds(root) {
  return list(root, 'HEAD', 'corpus/lessons')
    .map(path => /^corpus\/lessons\/(user-20261015-r\d{2})\.md$/.exec(path)?.[1])
    .filter(Boolean)
    .sort();
}

function parseLesson(text, id) {
  if (!text.includes('## Gate')) fail('missing_gate', `${id} lesson has no Gate`);
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

// Closed grammar for the exact committed counting rows. Accepted shapes are
// `git ls-tree -r --name-only REV | grep PATTERN [| grep PATTERN] | wc -l`
// (the historical pstack and USER SCORECARD rows) and
// `git grep -h PATTERN REV -- PATH | wc -l` (the USER fixture rows). No other
// shape is evaluated and no token reaches a shell: git receives argv and its
// raw stdout bytes are counted. The historical pipeline's trailing `wc -l`
// masked git status; this evaluator preserves only the one meaningful masked
// case (grep exit 1 means no match and counts 0) and fails explicitly for a
// missing or malformed revision, a spawn failure, or any other nonzero status.
const TREE_COUNT = /^git ls-tree -r --name-only ([a-f0-9]{40}) \| grep (?:'([^']*)'|(\S+))(?: \| grep (?:'([^']*)'|(\S+)))? \| wc -l$/;
const GREP_COUNT = /^git grep -h '([^']*)' ([a-f0-9]{40}) -- (\S+) \| wc -l$/;
// GNU grep BRE is supported only for this literal subset plus a leading `^`,
// a trailing `$` and `.` wildcard. Anything else fails closed.
const GREP_PATTERN = /^[A-Za-z0-9 _:.\/^$-]+$/;
const GREP_PATH = /^[A-Za-z0-9._\/-]+$/;

function countPattern(pattern) {
  if (pattern.startsWith('-') || !GREP_PATTERN.test(pattern)) return null;
  const start = pattern.startsWith('^');
  const end = pattern.endsWith('$');
  const body = pattern.slice(start ? 1 : 0, end ? -1 : undefined);
  if (!body || body.includes('^') || body.includes('$')) return null;
  return new RegExp(`${start ? '^' : ''}${body}${end ? '$' : ''}`);
}

function countingCommand(command) {
  const tree = TREE_COUNT.exec(command);
  const grep = tree ? null : GREP_COUNT.exec(command);
  if (!tree && !grep) return null;
  if (tree) {
    const patterns = [tree[2] ?? tree[3], tree[4] ?? tree[5]].filter(value => value !== undefined);
    const regexes = patterns.map(countPattern);
    if (regexes.includes(null)) return null;
    return { kind: 'tree', rev: tree[1], regexes };
  }
  const pattern = grep[1];
  const path = grep[3];
  if (!countPattern(pattern)) return null;
  if (path.startsWith('-') || path.includes('..') || !GREP_PATH.test(path)) return null;
  return { kind: 'grep', rev: grep[2], pattern, path };
}

function parseScore(scorecard, id) {
  const pattern = new RegExp(`<!-- user-round:${id}\\n([\\s\\S]*?)-->`);
  const body = pattern.exec(scorecard)?.[1];
  if (!body) fail('missing_score', `${id} has no SCORECARD measurement`);
  const field = name => {
    const match = new RegExp(`^${name}: (.+)$`, 'm').exec(body);
    if (!match) fail('missing_score', `${id} scorecard lacks ${name}`);
    return match[1].trim();
  };
  const measured = field('measured-against');
  if (!/^[a-f0-9]{40}$/.test(measured)) fail('missing_score', `${id} measured-against is not a commit`);
  const command = field('command');
  const spec = countingCommand(command);
  if (!spec) fail('score_mismatch', `${id} counting command is not a supported git line count`, 1, 'unsupported_counting_command');
  if (spec.rev !== measured) fail('score_mismatch', `${id} counting command does not measure its measured-against commit`, 1, 'counting_revision_mismatch');
  return { axis: field('axis'), before: field('before'), after: field('after'), command, measured };
}

function runCount(root, command, rev = null) {
  const spec = countingCommand(command);
  if (!spec) fail('score_mismatch', `Unsupported counting command: ${command}`, 1, 'unsupported_counting_command');
  const target = rev ?? spec.rev;
  const args = spec.kind === 'tree'
    ? ['ls-tree', '-r', '--name-only', target]
    : ['--literal-pathspecs', 'grep', '-h', '-e', spec.pattern, target, '--', spec.path];
  const result = spawnSync('git', args, { cwd: root, timeout: 30000, maxBuffer: 16 * 1024 * 1024 });
  // git grep exits 1 when the pattern matches nothing: the historical `wc -l`
  // pipeline counted that as 0 lines, so preserve exactly that one status. Any
  // other failure (missing or malformed revision, spawn error) is explicit.
  const masked = spec.kind === 'grep' && result.status === 1;
  if (result.error || (result.status !== 0 && !masked)) fail('score_mismatch', `Counting command failed: ${command}`, 1, 'counting_command_failed');
  const stdout = result.stdout || Buffer.alloc(0);
  if (spec.kind === 'grep') {
    let lines = 0;
    for (const byte of stdout) if (byte === 0x0a) lines++;
    return String(lines);
  }
  const rows = stdout.toString('latin1').split('\n');
  if (rows.at(-1) === '') rows.pop();
  return String(rows.filter(row => spec.regexes.every(regex => regex.test(row))).length);
}

function checkSpec(root, id) {
  const raw = show(root, 'HEAD', `corpus/evidence/${id}/spec.json`);
  if (!raw) fail('short_swarm', `${id} spec is missing`);
  let spec;
  try { spec = JSON.parse(raw.toString('utf8')); } catch { fail('short_swarm', `${id} spec is not JSON`); }
  if (!Array.isArray(spec.items) || spec.items.length !== 32) fail('short_swarm', `${id} spec is not one wave of 32`);
  const texts = [];
  spec.items.forEach((item, index) => {
    if (!item || typeof item.role !== 'string' || !ROLES.includes(item.role)) fail('short_swarm', `${id} item ${index} role is not a taxonomy role`);
    if (item.resume != null) fail('short_swarm', `${id} item ${index} is a resume, not a spawn`);
    let text;
    if (typeof spec.template === 'string') {
      if (typeof item.item !== 'string' || !item.item.length) fail('short_swarm', `${id} item ${index} has no item`);
      text = spec.template.replaceAll('{{item}}', item.item);
    } else {
      text = item.prompt || item.item;
    }
    if (typeof text !== 'string' || text.length < 8) fail('short_swarm', `${id} item ${index} prompt is empty`);
    texts.push(text);
  });
  if (new Set(texts).size !== 32) fail('short_swarm', `${id} prompts are not pairwise distinct`);
  const plan = spawnSync(process.execPath, [VALIDATOR, 'plan', '--spec-json', raw.toString('utf8')], {
    cwd: '/home/vgpnk/Projects/ufo-fsd-alpha',
    encoding: 'utf8',
    timeout: 30000,
  });
  if (plan.error || plan.status !== 0) fail('short_swarm', `${id} validator rejected the spec`);
  let parsed;
  try { parsed = JSON.parse(plan.stdout); } catch { fail('short_swarm', `${id} validator plan is not JSON`); }
  if (parsed.schema !== 'ufo-swarm-wave-v1' || parsed.counts?.total !== 32 || parsed.counts?.spawn !== 32 || parsed.dispatch?.calls !== 1) {
    fail('short_swarm', `${id} validator did not accept one 32-member wave`);
  }
  const dispatchRaw = show(root, 'HEAD', `corpus/evidence/${id}/dispatch.json`);
  if (!dispatchRaw) fail('short_swarm', `${id} dispatch record is missing`);
  let dispatch;
  try { dispatch = JSON.parse(dispatchRaw.toString('utf8')); } catch { fail('short_swarm', `${id} dispatch record is not JSON`); }
  if (dispatch.dispatcher !== '/user:swarm' || dispatch.members !== 32 || !Array.isArray(dispatch.seats) || dispatch.seats.length !== 32) {
    fail('short_swarm', `${id} dispatch is not one 32-member /user:swarm wave`);
  }
  const ids = new Set();
  dispatch.seats.forEach((seat, index) => {
    const wanted = `s${String(index + 1).padStart(2, '0')}`;
    if (seat.seat !== wanted || seat.role !== spec.items[index].role) fail('short_swarm', `${id} ${wanted} dispatch does not match the spec`);
    if (typeof seat.agentId !== 'string' || seat.agentId.length < 8 || ids.has(seat.agentId)) {
      fail('short_swarm', `${id} ${wanted} has no unique agent id`);
    }
    ids.add(seat.agentId);
  });
}

function checkSwarm(root, id) {
  const raw = show(root, 'HEAD', `corpus/evidence/${id}/aggregate.json`);
  if (!raw) fail('short_swarm', `${id} aggregate is missing`);
  let aggregate;
  try { aggregate = JSON.parse(raw.toString('utf8')); } catch { fail('short_swarm', `${id} aggregate is not JSON`); }
  if (aggregate.dispatcher !== '/user:swarm' || aggregate.workers !== 32) fail('short_swarm', `${id} was not a 32-member /user:swarm`);
  const results = aggregate.results;
  if (!Array.isArray(results) || results.length !== 32) fail('short_swarm', `${id} accounts for ${results?.length ?? 0} results`);
  const seats = results.map(item => item.seat);
  const wanted = Array.from({ length: 32 }, (_, index) => `s${String(index + 1).padStart(2, '0')}`);
  if (seats.join() !== wanted.join()) fail('short_swarm', `${id} seats are not s01..s32 in order`);
  const counts = { PASS: 0, ISSUES: 0, BLOCKED: 0, DROPOUT: 0, GAP: 0 };
  for (const item of results) {
    if (!VERDICTS.includes(item.verdict)) fail('swarm_evidence', `${id} ${item.seat} verdict is unknown`);
    counts[item.verdict]++;
    if (item.verdict === 'DROPOUT' || item.verdict === 'GAP') fail('short_swarm', `${id} ${item.seat} is a dead lane`);
    const evidencePath = item.evidence;
    if (typeof evidencePath !== 'string' || evidencePath.includes('..') || !evidencePath.startsWith(`corpus/evidence/${id}/seats/`)) {
      fail('swarm_evidence', `${id} ${item.seat} evidence path is outside the seat directory`);
    }
    const seatRaw = show(root, 'HEAD', evidencePath);
    if (!seatRaw) fail('swarm_evidence', `${id} ${item.seat} evidence file is missing`);
    let seat;
    try { seat = JSON.parse(seatRaw.toString('utf8')); } catch { fail('swarm_evidence', `${id} ${item.seat} evidence is not JSON`); }
    if (seat.seat !== item.seat || seat.verdict !== item.verdict) fail('swarm_evidence', `${id} ${item.seat} evidence does not match the aggregate`);
    if (typeof seat.evidence !== 'string' || seat.evidence.trim().length < 8) fail('swarm_evidence', `${id} ${item.seat} evidence text is empty`);
    if (typeof seat.command !== 'string' || seat.command.length < 3) fail('swarm_evidence', `${id} ${item.seat} command is missing`);
  }
  return counts;
}

function checkReport(root, id, measured) {
  const path = `reports/${id}.md`;
  const text = show(root, 'HEAD', path)?.toString('utf8');
  if (!text) fail('report_missing', `${id} report is missing`);
  if (!text.includes(`lane-commit: ${measured}`)) fail('report_commit', `${id} report does not cite the measured commit`);
  if (show(root, measured, path)) fail('report_not_after_commit', `${id} report was already in the cited commit`);
  const ancestor = git(root, ['merge-base', '--is-ancestor', measured, 'HEAD']);
  if (ancestor.status !== 0) fail('report_commit', `${id} cited commit is not an ancestor of HEAD`);
  if (!/^## SHONEN$/m.test(text)) fail('report_shonen', `${id} report has no SHONEN heading`);
  for (const box of BOXES) {
    const line = text.split('\n').find(item => item.endsWith(box));
    if (!line || !/^- \[[x~ ]\] /.test(line)) fail('report_shonen', `${id} SHONEN box missing: ${box}`);
  }
}

function scanConsequential(root, id) {
  const paths = [`corpus/lessons/${id}.md`, `reports/${id}.md`, ...list(root, 'HEAD', `corpus/evidence/${id}`)];
  for (const path of paths) {
    const bytes = show(root, 'HEAD', path);
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

function sameTree(root, id, measured) {
  const paths = [`corpus/lessons/${id}.md`, ...list(root, 'HEAD', `corpus/evidence/${id}`)];
  for (const path of paths) {
    if (blob(root, 'HEAD', path) !== blob(root, measured, path)) fail('evidence_moved', `${id} ${path} changed after the measured commit`);
  }
}

function checkPublic(root, ids, expect) {
  let found = 0;
  for (const id of ids) {
    const path = `corpus/evidence/${id}/public/capture.json`;
    const bytes = show(root, 'HEAD', path);
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
      const body = show(root, 'HEAD', `${dir}/${file}`);
      if (!body || !body.length) fail('public_observation', `${id} ${key} file is missing`);
      if (createHash('sha256').update(body).digest('hex') !== digest) fail('public_observation', `${id} ${key} hash does not match the file`);
    }
    const methods = (capture.requests || []).map(request => String(request.method || '').toUpperCase());
    if (!methods.length || methods.some(method => method !== 'GET' && method !== 'HEAD')) fail('public_observation', `${id} public requests are not observation`);
    found++;
  }
  if (expect === 10 && found < 1) fail('public_observation', 'No admitted public-page capture');
}

function check(options) {
  const root = options.repo;
  const production = sameRoot(root, defaultRoot);
  checkHistory(root, options.baseline, production, options.pstackPin);
  const ids = roundIds(root);
  if (ids.length !== options.expect) fail('round_count', `Found ${ids.length} user rounds, expected ${options.expect}`);
  for (let index = 0; index < ids.length; index++) {
    const wanted = `user-20261015-r${String(index + 1).padStart(2, '0')}`;
    if (ids[index] !== wanted) fail('round_sequence', `Expected ${wanted}, found ${ids[index]}`);
  }
  const scorecard = show(root, 'HEAD', 'SCORECARD.md').toString('utf8');
  const log = show(root, 'HEAD', 'LOG.md').toString('utf8');
  for (const id of ids) {
    const lesson = show(root, 'HEAD', `corpus/lessons/${id}.md`).toString('utf8');
    const gate = parseLesson(lesson, id);
    checkSpec(root, id);
    const swarm = checkSwarm(root, id);
    const score = parseScore(scorecard, id);
    if (score.axis !== gate.axis) fail('missing_score', `${id} axis does not match its lesson`);
    if (score.before === score.after) fail('score_mismatch', `${id} before and after are the same`, 1, 'score_not_improved');
    if (!log.includes(id)) fail('missing_score', `${id} has no LOG entry`);
    if (runCount(root, score.command, options.baseline) !== score.before) fail('score_mismatch', `${id} before measurement does not match`, 1, 'before_count_mismatch');
    if (runCount(root, score.command, score.measured) !== score.after) fail('score_mismatch', `${id} after measurement does not match`, 1, 'after_count_mismatch');
    checkReport(root, id, score.measured);
    scanConsequential(root, id);
    sameTree(root, id, score.measured);
    const accounted = swarm.PASS + swarm.ISSUES + swarm.BLOCKED + swarm.DROPOUT + swarm.GAP;
    console.log(`ROUND id=${id} axis=${gate.axis} swarm=${accounted} pass=${swarm.PASS} issues=${swarm.ISSUES} blocked=${swarm.BLOCKED} dropout=${swarm.DROPOUT} gap=${swarm.GAP} admits=${gate.admits} rejects=${gate.rejects} spot=${gate.spot} consequential=0 before=${score.before} after=${score.after} measured-against=${score.measured}`);
  }
  checkPublic(root, ids, options.expect);
  console.log(`USER_ROUND_CONTRACT verdict=clean rounds=${ids.length} consequential=0`);
}

function commit(root, subject) {
  const result = spawnSync('git', ['-c', 'user.name=tabi-selftest', '-c', 'user.email=tabi-selftest@local', 'commit', '-qm', subject], { cwd: root });
  if (result.status !== 0) fail('could_not_evaluate', 'Fixture commit failed', 2);
  return gitOk(root, ['rev-parse', 'HEAD']);
}

function writeGoodFixture(root, shonenBaseline = 'baseline-shonen\n') {
  const put = (path, value) => {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), value);
  };
  gitOk(root, ['init', '-q']);
  put('LOG.md', 'baseline-log\n');
  put('SCORECARD.md', 'baseline-score\n');
  put('SKILL.md', 'baseline-skill\n');
  put('PROVINCE.md', 'baseline-province\n');
  put('SHONEN.md', shonenBaseline);
  put('corpus/lessons/round-1.md', 'historical lesson\n');
  gitOk(root, ['add', '--', '.']);
  const baseline = commit(root, 'baseline');
  const id = 'user-20261015-r01';
  put('round-marker.txt', 'marker: admitted-user-round\n');
  const items = [];
  const seats = [];
  const dispatchSeats = [];
  for (let index = 1; index <= 32; index++) {
    const seat = `s${String(index).padStart(2, '0')}`;
    items.push({ item: seat, role: ROLES[(index - 1) % ROLES.length], name: `Usw${seat.slice(1)}` });
    const evidence = `corpus/evidence/${id}/seats/${seat}/result.json`;
    put(evidence, JSON.stringify({
      seat,
      verdict: 'PASS',
      evidence: `marker counted for ${seat}`,
      command: 'git grep marker',
    }));
    seats.push({ seat, verdict: 'PASS', evidence });
    dispatchSeats.push({ seat, name: `Usw${seat.slice(1)}`, role: ROLES[(index - 1) % ROLES.length], agentId: `agent-${id}-${seat}` });
  }
  put(`corpus/evidence/${id}/spec.json`, JSON.stringify({
    wave: id,
    hoist: false,
    context: 'Fixture user swarm wave.',
    template: 'Count the marker for seat {{item}} and write only that seat result.',
    items,
  }));
  put(`corpus/evidence/${id}/dispatch.json`, JSON.stringify({ dispatcher: '/user:swarm', members: 32, seats: dispatchSeats }));
  put(`corpus/evidence/${id}/aggregate.json`, JSON.stringify({ dispatcher: '/user:swarm', workers: 32, results: seats }));
  const dom = 'example-domain fixture\n';
  const screenshot = Buffer.from('png-bytes-fixture-user');
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
    'axis: operability',
    'consequential-external-actions: none',
    '',
    '## Gate',
    '- admitted: user-wave-fixture — one validated wave accounted for every seat',
    '- rejected: loopback-as-real-site — a loopback host is not a real site',
    '- spot-check: non-author reviewer-user-1 agree — re-counted the marker and the reject',
    '',
  ].join('\n'));
  gitOk(root, ['add', '--', '.']);
  const measured = commit(root, 'work');
  const command = `git grep -h '^marker: admitted-user-round$' ${measured} -- round-marker.txt | wc -l`;
  put('SCORECARD.md', `baseline-score\n<!-- user-round:${id}\naxis: operability\nbefore: 0\nafter: 1\ncommand: ${command}\nmeasured-against: ${measured}\n-->\n`);
  put('LOG.md', `baseline-log\n${id} operability 0 to 1\n`);
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
  const pin = commit(root, 'measure');
  return { baseline, pin };
}

function canonicalShonenFixture() {
  const lines = [
    `# ${SHONEN_NAME} — Promotion checklist`,
    '',
    'Promotion to shokunin requires all of:',
    '',
  ];
  for (const box of BOXES) {
    lines.push(`- [~] ${box}`);
    lines.push('  `SKILL.md` canonical evidence pointer for this box');
  }
  lines.push('');
  return lines.join('\n');
}

function gateFields(result) {
  const stdout = result.stdout ?? '';
  const stderr = result.stderr ?? '';
  const text = `${stdout}${stderr}`;
  return {
    stdout,
    stderr,
    error: result.error ? String(result.error) : null,
    verdict: /(?:^|\s)verdict=([a-z-]+)/.exec(text)?.[1] ?? null,
    finding: /(?:^|\s)finding=([a-z_]+)/.exec(text)?.[1] ?? null,
  };
}

// The child's own contract record, matched by its anchored line, never by a
// first-match search across combined output: the ROUND progress line echoes
// lesson `spot=` prose that a fixture could make look like a finding. A failed
// record is on stderr; a clean record is the last stdout contract line. An
// absent reason is evidence that the refusal is outside the counting contract,
// not that a reason matched.
function receiptOf(result) {
  const stdout = result.stdout ?? '';
  const stderr = result.stderr ?? '';
  const failureLine = stderr.split('\n').reverse().find(line => line.startsWith('USER_ROUND_CONTRACT ')) ?? '';
  const cleanLine = stdout.split('\n').reverse().find(line => line.startsWith('USER_ROUND_CONTRACT ')) ?? '';
  const failure = /^USER_ROUND_CONTRACT verdict=(failed|could-not-evaluate) finding=([a-z_]+)(?: reason=([a-z_]+))? detail=(.*)$/.exec(failureLine);
  const clean = !failure && /^USER_ROUND_CONTRACT verdict=clean(?: |$)/.test(cleanLine);
  return {
    stdout,
    stderr,
    exit: result.status,
    error: result.error ? String(result.error) : null,
    verdict: failure ? failure[1] : (clean ? 'clean' : null),
    finding: failure ? failure[2] : (clean ? 'clean' : null),
    reason: failure?.[3] ?? null,
    detail: failure?.[4] ?? '',
  };
}

// Literal expectation comparator for one child receipt. Every asserted facet
// is independent: a matching exit and score_mismatch finding cannot satisfy an
// expectation whose reason or detail belongs to a different cause.
function receiptMatches(expected, observed) {
  return observed.exit === expected.exit
    && observed.finding === expected.finding
    && (expected.reason === undefined || observed.reason === expected.reason)
    && (expected.detail === undefined || observed.detail.includes(expected.detail));
}

function witness(rev) {
  const commitRev = gitOk(defaultRoot, ['rev-parse', '--verify', `${rev}^{commit}`]);
  const codeRevision = gitOk(defaultRoot, ['rev-parse', 'HEAD']);
  const scriptBytes = readFileSync(script);
  const codeSha256 = sha256(scriptBytes);
  const worktreeBlob = gitBlobSha1(scriptBytes);
  const headBlob = blob(defaultRoot, 'HEAD', USER_SCRIPT);
  const committed = headBlob !== null && headBlob === worktreeBlob;
  const measuredRevision = committed ? codeRevision : 'uncommitted';
  const legacyBlob = blob(defaultRoot, commitRev, USER_SCRIPT);
  if (legacyBlob !== LEGACY_USER_GATE_BLOB) {
    fail('witness_failure', `Witness arm is not the pinned legacy gate: ${legacyBlob}`, 2);
  }
  const legacyBytes = show(defaultRoot, commitRev, USER_SCRIPT);
  if (!legacyBytes || gitBlobSha1(legacyBytes) !== legacyBlob) {
    fail('witness_failure', 'Witness bytes do not match the resolved legacy blob', 2);
  }
  const legacyShonen = show(defaultRoot, HARD_BASELINE, 'SHONEN.md');
  if (!legacyShonen) fail('witness_failure', 'Legacy SHONEN is missing at HARD_BASELINE', 2);
  const parent = mkdtempSync('/var/tmp/tabi-user-witness-');
  try {
    const root = join(parent, 'repo');
    mkdirSync(root, { recursive: true });
    const { baseline } = writeGoodFixture(root, legacyShonen);
    writeFileSync(join(root, 'SHONEN.md'), canonicalShonenFixture());
    gitOk(root, ['add', '--', '.']);
    commit(root, 'canonical shonen');
    const legacyGate = join(parent, 'legacy-user-gate.mjs');
    writeFileSync(legacyGate, legacyBytes);
    const args = ['--repo', root, '--baseline', baseline, '--expect', '1'];
    const before = spawnSync(process.execPath, [legacyGate, ...args], { encoding: 'utf8' });
    const after = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
    const oldArm = gateFields(before);
    const newArm = gateFields(after);
    const pass = before.status === 1
      && oldArm.verdict === 'failed'
      && oldArm.finding === 'history_rewritten'
      && after.status === 0
      && newArm.verdict === 'clean';
    console.log(`USER_ROUND_CONTRACT_WITNESS_OLD exit=${before.status} verdict=${oldArm.verdict} finding=${oldArm.finding} error=${JSON.stringify(oldArm.error)} stdout=${JSON.stringify(oldArm.stdout)} stderr=${JSON.stringify(oldArm.stderr)}`);
    console.log(`USER_ROUND_CONTRACT_WITNESS_NEW exit=${after.status} verdict=${newArm.verdict} finding=${newArm.finding} error=${JSON.stringify(newArm.error)} stdout=${JSON.stringify(newArm.stdout)} stderr=${JSON.stringify(newArm.stderr)}`);
    console.log(`USER_ROUND_CONTRACT_WITNESS rev=${commitRev} baseline=${baseline} args=${JSON.stringify(args)} measuredRevision=${measuredRevision} codeRevision=${codeRevision} code-sha256=${codeSha256} new-sha256=${codeSha256} head-blob=${headBlob ?? 'none'} worktree-blob=${worktreeBlob} committed=${committed ? 'yes' : 'no'} old_exit=${before.status} old_verdict=${oldArm.verdict} old_finding=${oldArm.finding} new_exit=${after.status} new_verdict=${newArm.verdict} new_finding=${newArm.finding} result=${pass ? 'PASS' : 'FAIL'}`);
    if (!pass) fail('witness_failure', `old=${JSON.stringify(oldArm)} new=${JSON.stringify(newArm)}`);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
}

// Same-command red arm: the pinned shell gate and the new evaluator receive
// one commit tree and one SCORECARD command. The old bash runCount executes
// the pipeline's `tee`, creating a marker while returning the expected 0/1
// counts; the new evaluator rejects the unsupported stage before execution.
// The marker is removed between arms and asserted absent after the new arm.
const COUNT_WITNESS_MARKER = '.user-round14-count-marker';
// The round-13 verifier baseline commit carrying the pinned shell gate blob.
// --self-test runs the differential against it; --count-witness REV accepts any
// revision whose gate blob equals LEGACY_COUNT_GATE_BLOB.
const COUNT_WITNESS_REV = 'bebe2efc4565bb068efd905e9ef78011bb6b4efd';
// Diagnostic baseline: the round-14 delivered USER gate. It refuses an
// unsupported count and a wrong count with the same finding, so its record
// cannot distinguish the causes. The exact bytes are pinned so the diagnostic
// witness compares that source with the reason-bearing worktree over
// identical fixtures. --diagnostic-witness resolves this revision; the
// self-test invokes the same comparison.
const DIAGNOSTIC_BASELINE_REV = '5c7710d7393112f2163dd7efcaa38fccf534dfc2';
const DIAGNOSTIC_BASELINE_BLOB = '347ae9bbcdc692c3ad55fdfd931fa2cce13fec6d';
const DIAGNOSTIC_BASELINE_SHA256 = 'bde18c672d79dbe1ebf340f265d013a8956da8f961d85fb3862573b7a6a505f3';
// One unique source fragment of the closed counting evaluator. The mutant arm
// flips only this guard, reproducing the historical `wc -l` masking that
// classified a missing object as a zero count. A missing or duplicated
// fragment is could-not-evaluate, never a silent no-op.
const MASK_GUARD = "const masked = spec.kind === 'grep' && result.status === 1;";
const MASK_MUTANT = 'const masked = true;';

function runCountWitness(rev) {
  const commitRev = gitOk(defaultRoot, ['rev-parse', '--verify', `${rev}^{commit}`]);
  const shellBlob = blob(defaultRoot, commitRev, USER_SCRIPT);
  if (shellBlob !== LEGACY_COUNT_GATE_BLOB) {
    fail('witness_failure', `Count-witness arm is not the pinned shell gate: ${shellBlob}`, 2);
  }
  const shellBytes = show(defaultRoot, commitRev, USER_SCRIPT);
  if (!shellBytes || gitBlobSha1(shellBytes) !== shellBlob) {
    fail('witness_failure', 'Count-witness bytes do not match the resolved shell blob', 2);
  }
  const codeRevision = gitOk(defaultRoot, ['rev-parse', 'HEAD']);
  const scriptBytes = readFileSync(script);
  const codeSha256 = sha256(scriptBytes);
  const worktreeBlob = gitBlobSha1(scriptBytes);
  const headBlob = blob(defaultRoot, 'HEAD', USER_SCRIPT);
  const committed = headBlob !== null && headBlob === worktreeBlob;
  const parent = mkdtempSync('/var/tmp/tabi-user-count-witness-');
  try {
    const root = join(parent, 'repo');
    mkdirSync(root, { recursive: true });
    const { baseline, pin } = writeGoodFixture(root);
    const scorecardPath = join(root, 'SCORECARD.md');
    const scorecard = readFileSync(scorecardPath, 'utf8');
    const measured = /^measured-against: ([a-f0-9]{40})$/m.exec(scorecard)[1];
    const command = `git ls-tree -r --name-only ${measured} | grep round-marker.txt | tee ${COUNT_WITNESS_MARKER} | wc -l`;
    writeFileSync(scorecardPath, scorecard.replace(/^command: .*$/m, `command: ${command}`));
    gitOk(root, ['add', '--', '.']);
    commit(root, 'count-witness command');
    const shellGate = join(parent, 'shell-user-gate.mjs');
    writeFileSync(shellGate, shellBytes);
    const args = ['--repo', root, '--baseline', baseline, '--expect', '1', '--pstack-pin', pin];
    const before = spawnSync(process.execPath, [shellGate, ...args], { encoding: 'utf8' });
    const oldArm = gateFields(before);
    const oldMarker = existsSync(join(root, COUNT_WITNESS_MARKER));
    rmSync(join(root, COUNT_WITNESS_MARKER), { force: true });
    const after = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
    const newArm = receiptOf(after);
    const newMarker = existsSync(join(root, COUNT_WITNESS_MARKER));
    // The same-command red arm must refuse for the intended unsupported-stage
    // reason, not merely return the score_mismatch finding that a wrong count
    // also produces.
    const pass = before.status === 0
      && oldArm.verdict === 'clean'
      && oldMarker
      && after.status === 1
      && newArm.finding === 'score_mismatch'
      && newArm.reason === 'unsupported_counting_command'
      && !newMarker;
    return {
      commitRev, baseline, args, pass, codeRevision, codeSha256, worktreeBlob, headBlob, committed,
      oldExit: before.status, oldVerdict: oldArm.verdict, oldMarker, oldArm,
      oldFinding: oldArm.finding ?? (oldArm.verdict === 'clean' ? 'clean' : 'none'),
      newExit: after.status, newVerdict: newArm.verdict, newFinding: newArm.finding, newReason: newArm.reason, newMarker, newArm,
    };
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
}

function countWitness(rev) {
  const run = runCountWitness(rev);
  console.log(`USER_ROUND_CONTRACT_COUNT_WITNESS_OLD exit=${run.oldExit} verdict=${run.oldVerdict} finding=${run.oldFinding} marker_applicable=1 marker_outcome=${run.oldMarker ? 'present' : 'absent'} error=${JSON.stringify(run.oldArm.error)} stdout=${JSON.stringify(run.oldArm.stdout)} stderr=${JSON.stringify(run.oldArm.stderr)}`);
  console.log(`USER_ROUND_CONTRACT_COUNT_WITNESS_NEW exit=${run.newExit} verdict=${run.newVerdict} finding=${run.newFinding} reason=${run.newReason ?? 'none'} marker_applicable=1 marker_outcome=${run.newMarker ? 'present' : 'absent'} error=${JSON.stringify(run.newArm.error)} stdout=${JSON.stringify(run.newArm.stdout)} stderr=${JSON.stringify(run.newArm.stderr)}`);
  console.log(`USER_ROUND_CONTRACT_COUNT_WITNESS rev=${run.commitRev} baseline=${run.baseline} args=${JSON.stringify(run.args)} measuredRevision=${run.committed ? run.codeRevision : 'uncommitted'} codeRevision=${run.codeRevision} code-sha256=${run.codeSha256} new-sha256=${run.codeSha256} head-blob=${run.headBlob ?? 'none'} worktree-blob=${run.worktreeBlob} committed=${run.committed ? 'yes' : 'no'} marker=${COUNT_WITNESS_MARKER} old_exit=${run.oldExit} old_verdict=${run.oldVerdict} old_finding=${run.oldFinding} old_marker=${run.oldMarker ? 1 : 0} old_marker_applicable=1 old_marker_outcome=${run.oldMarker ? 'present' : 'absent'} new_exit=${run.newExit} new_verdict=${run.newVerdict} new_finding=${run.newFinding} new_reason=${run.newReason ?? 'none'} new_marker=${run.newMarker ? 1 : 0} new_marker_applicable=1 new_marker_outcome=${run.newMarker ? 'present' : 'absent'} result=${run.pass ? 'PASS' : 'FAIL'}`);
  if (!run.pass) fail('witness_failure', `old=${JSON.stringify(run.oldArm)} oldMarker=${run.oldMarker} new=${JSON.stringify(run.newArm)} newMarker=${run.newMarker}`);
}

// Baseline-versus-repaired diagnostic differential over two actual CLI runs.
// Arm 1: the pinned round-14 bytes and the reason-bearing worktree evaluate one
// supported count whose declared after value is wrong. Both return
// score_mismatch; only the worktree names after_count_mismatch, so a malicious
// control expecting unsupported_counting_command is rejected by the reason
// contract even though a finding-only predicate accepts the same receipt.
// Arm 2: the worktree and a mask-guard mutant evaluate one missing-revision
// fixture. The worktree reports counting_command_failed; the mutant reports
// after_count_mismatch for the same bytes and args. A finding-only assertion
// accepts the mutant for the correct control, the strict reason assertion
// rejects it, and the mutant's own after reason still matches its decoy.
function runDiagnosticWitness() {
  const baselineRev = gitOk(defaultRoot, ['rev-parse', '--verify', `${DIAGNOSTIC_BASELINE_REV}^{commit}`]);
  const baselineBytes = show(defaultRoot, baselineRev, USER_SCRIPT);
  const baselineBlob = blob(defaultRoot, baselineRev, USER_SCRIPT);
  if (!baselineBytes || baselineBlob !== DIAGNOSTIC_BASELINE_BLOB || sha256(baselineBytes) !== DIAGNOSTIC_BASELINE_SHA256) {
    fail('witness_failure', 'Diagnostic baseline bytes are not the recorded round-14 gate', 2);
  }
  const scriptBytes = readFileSync(script);
  const codeSha256 = sha256(scriptBytes);
  const worktreeBlob = gitBlobSha1(scriptBytes);
  const headBlob = blob(defaultRoot, 'HEAD', USER_SCRIPT);
  const committed = headBlob !== null && headBlob === worktreeBlob;
  const codeRevision = gitOk(defaultRoot, ['rev-parse', 'HEAD']);
  const guardParts = scriptBytes.toString('utf8').split(MASK_GUARD);
  if (guardParts.length !== 2) {
    fail('could_not_evaluate', `Mask guard appears ${guardParts.length - 1} times in the evaluator source`, 2);
  }
  const mutantBytes = Buffer.from(guardParts.join(MASK_MUTANT), 'utf8');
  const parent = mkdtempSync('/var/tmp/tabi-user-diagnostic-witness-');
  try {
    const baselineGate = join(parent, 'baseline-user-gate.mjs');
    const mutantGate = join(parent, 'masked-user-gate.mjs');
    writeFileSync(baselineGate, baselineBytes);
    writeFileSync(mutantGate, mutantBytes);

    // Arm 1: supported count, wrong declared after value.
    const afterRoot = join(parent, 'wrong-after');
    mkdirSync(afterRoot, { recursive: true });
    const afterFixture = writeGoodFixture(afterRoot);
    const afterPath = join(afterRoot, 'SCORECARD.md');
    const afterText = readFileSync(afterPath, 'utf8');
    const afterMeasured = /^measured-against: ([a-f0-9]{40})$/m.exec(afterText)[1];
    writeFileSync(afterPath, afterText
      .replace(/^after: .*$/m, 'after: 2')
      .replace(/^command: .*$/m, `command: git ls-tree -r --name-only ${afterMeasured} | grep round-marker.txt | wc -l`));
    gitOk(afterRoot, ['add', '--', '.']);
    commit(afterRoot, 'diagnostic wrong after');
    const afterArgs = ['--repo', afterRoot, '--baseline', afterFixture.baseline, '--expect', '1', '--pstack-pin', afterFixture.pin];
    const baseline = receiptOf(spawnSync(process.execPath, [baselineGate, ...afterArgs], { encoding: 'utf8' }));
    const repaired = receiptOf(spawnSync(process.execPath, [script, ...afterArgs], { encoding: 'utf8' }));

    // Arm 2: missing revision, identical fixture for repaired and mutant.
    const missingRoot = join(parent, 'missing-revision');
    mkdirSync(missingRoot, { recursive: true });
    const missingFixture = writeGoodFixture(missingRoot);
    const zeros = '0'.repeat(40);
    const missingPath = join(missingRoot, 'SCORECARD.md');
    writeFileSync(missingPath, readFileSync(missingPath, 'utf8')
      .replace(/^command: .*$/m, `command: git ls-tree -r --name-only ${zeros} | grep round-marker.txt | wc -l`)
      .replace(/^measured-against: .*$/m, `measured-against: ${zeros}`));
    gitOk(missingRoot, ['add', '--', '.']);
    commit(missingRoot, 'diagnostic missing revision');
    const missingArgs = ['--repo', missingRoot, '--baseline', missingFixture.baseline, '--expect', '1', '--pstack-pin', missingFixture.pin];
    const repairedMissing = receiptOf(spawnSync(process.execPath, [script, ...missingArgs], { encoding: 'utf8' }));
    const mutantMissing = receiptOf(spawnSync(process.execPath, [mutantGate, ...missingArgs], { encoding: 'utf8' }));

    const unsupported = {
      exit: 1, finding: 'score_mismatch', reason: 'unsupported_counting_command',
      detail: 'counting command is not a supported git line count',
    };
    const wrongAfter = {
      exit: 1, finding: 'score_mismatch', reason: 'after_count_mismatch',
      detail: 'after measurement does not match',
    };
    const countFailed = {
      exit: 1, finding: 'score_mismatch', reason: 'counting_command_failed',
      detail: 'Counting command failed:',
    };
    const baselineFindingOnly = baseline.exit === 1 && baseline.finding === 'score_mismatch';
    const wrongMatch = receiptMatches(unsupported, repaired);
    const correctMatch = receiptMatches(wrongAfter, repaired);
    const mutantCorrectMatch = receiptMatches(countFailed, mutantMissing);
    const mutantDecoyMatch = receiptMatches(wrongAfter, mutantMissing);
    const pass = baselineFindingOnly
      && baseline.reason === null
      && baseline.detail.includes('after measurement does not match')
      && repaired.reason === 'after_count_mismatch'
      && !wrongMatch
      && correctMatch
      && repairedMissing.reason === 'counting_command_failed'
      && receiptMatches(countFailed, repairedMissing)
      && mutantMissing.reason === 'after_count_mismatch'
      && !mutantCorrectMatch
      && mutantDecoyMatch
      && sha256(readFileSync(mutantGate)) !== codeSha256
      && readFileSync(mutantGate, 'utf8').includes(MASK_MUTANT);
    return {
      baselineRev, codeRevision, codeSha256, worktreeBlob, headBlob, committed,
      baseline, repaired, repairedMissing, mutantMissing,
      baselineFindingOnly, wrongMatch, correctMatch, mutantCorrectMatch, mutantDecoyMatch,
      wrongReason: unsupported.reason, correctReason: wrongAfter.reason,
      afterArgs, missingArgs, pass,
    };
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
}

function diagnosticWitness() {
  const run = runDiagnosticWitness();
  const print = (label, receipt) => console.log(`${label} exit=${receipt.exit} verdict=${receipt.verdict ?? 'none'} finding=${receipt.finding ?? 'none'} reason=${receipt.reason ?? 'none'} marker_applicable=0 marker_outcome=not-applicable detail=${JSON.stringify(receipt.detail)} error=${JSON.stringify(receipt.error)}`);
  print('USER_ROUND_CONTRACT_DIAGNOSTIC_WITNESS_BASELINE', run.baseline);
  print('USER_ROUND_CONTRACT_DIAGNOSTIC_WITNESS_REPAIRED', run.repaired);
  print('USER_ROUND_CONTRACT_DIAGNOSTIC_WITNESS_MISSING_REPAIRED', run.repairedMissing);
  print('USER_ROUND_CONTRACT_DIAGNOSTIC_WITNESS_MISSING_MUTANT', run.mutantMissing);
  console.log(`USER_ROUND_CONTRACT_DIAGNOSTIC_WITNESS baseline=${run.baselineRev} args=${JSON.stringify({ wrongAfter: run.afterArgs, missing: run.missingArgs })} measuredRevision=${run.committed ? run.codeRevision : 'uncommitted'} codeRevision=${run.codeRevision} code-sha256=${run.codeSha256} baseline-blob=${DIAGNOSTIC_BASELINE_BLOB} baseline-sha256=${DIAGNOSTIC_BASELINE_SHA256} worktree-blob=${run.worktreeBlob} committed=${run.committed ? 'yes' : 'no'} wrong_reason=${run.wrongReason} expected_outcome=no-match wrong_match=${run.wrongMatch ? 1 : 0} correct_reason=${run.correctReason} correct_match=${run.correctMatch ? 1 : 0} mutant_reason=${run.mutantMissing.reason ?? 'none'} mutant_correct_match=${run.mutantCorrectMatch ? 1 : 0} mutant_decoy_match=${run.mutantDecoyMatch ? 1 : 0} baseline_finding_only_accepts=${run.baselineFindingOnly ? 1 : 0} result=${run.pass ? 'PASS' : 'FAIL'}`);
  if (!run.pass) fail('witness_failure', `Diagnostic baseline=${JSON.stringify(run.baseline)} repaired=${JSON.stringify(run.repaired)} missingRepaired=${JSON.stringify(run.repairedMissing)} missingMutant=${JSON.stringify(run.mutantMissing)}`);
}

function selfTest() {
  const rewriteScore = (root, { command, before = 0, after = 1 }) => {
    const path = join(root, 'SCORECARD.md');
    const text = readFileSync(path, 'utf8');
    const measured = /^measured-against: ([a-f0-9]{40})$/m.exec(text)[1];
    writeFileSync(path, text
      .replace(/^before: .*$/m, `before: ${before}`)
      .replace(/^after: .*$/m, `after: ${after}`)
      .replace(/^command: .*$/m, `command: ${command.replaceAll('MEASURED', measured)}`));
  };
  const cases = [
    { name: 'clean', mutate: () => {}, exit: 0, finding: 'clean' },
    { name: 'count_malicious_tee_refused', mutate: root => rewriteScore(root, {
      command: `git ls-tree -r --name-only MEASURED | grep round-marker.txt | tee ${COUNT_WITNESS_MARKER} | wc -l`,
    }), exit: 1, finding: 'score_mismatch', reason: 'unsupported_counting_command',
      detail: 'counting command is not a supported git line count', appliesMarker: true, noMarker: COUNT_WITNESS_MARKER },
    { name: 'count_malicious_shell_refused', mutate: root => rewriteScore(root, {
      command: `git ls-tree -r --name-only MEASURED | sh -c 'touch ${COUNT_WITNESS_MARKER}'`,
    }), exit: 1, finding: 'score_mismatch', reason: 'unsupported_counting_command',
      detail: 'counting command is not a supported git line count', appliesMarker: true, noMarker: COUNT_WITNESS_MARKER },
    { name: 'count_malicious_option_injection_refused', mutate: root => rewriteScore(root, {
      command: `git --git-dir=/var/tmp/other ls-tree -r --name-only MEASURED | grep round-marker.txt | wc -l`,
    }), exit: 1, finding: 'score_mismatch', reason: 'unsupported_counting_command',
      detail: 'counting command is not a supported git line count', appliesMarker: false },
    { name: 'count_historical_supported', mutate: root => rewriteScore(root, {
      command: 'git ls-tree -r --name-only MEASURED | grep round-marker.txt | wc -l',
    }), exit: 0, finding: 'clean' },
    { name: 'count_quoted_supported', mutate: root => rewriteScore(root, {
      command: "git ls-tree -r --name-only MEASURED | grep 'round-marker.txt' | wc -l",
    }), exit: 0, finding: 'clean' },
    { name: 'count_two_stage_supported', mutate: root => rewriteScore(root, {
      command: 'git ls-tree -r --name-only MEASURED | grep round- | grep marker.txt | wc -l',
    }), exit: 0, finding: 'clean' },
    { name: 'count_missing_revision_red', mutate: root => {
      const zeros = '0'.repeat(40);
      rewriteScore(root, { command: `git ls-tree -r --name-only ${zeros} | grep round-marker.txt | wc -l` });
      const path = join(root, 'SCORECARD.md');
      writeFileSync(path, readFileSync(path, 'utf8').replace(/^measured-against: .*$/m, `measured-against: ${zeros}`));
    }, exit: 1, finding: 'score_mismatch', reason: 'counting_command_failed',
      detail: 'Counting command failed:', appliesMarker: false },
    { name: 'count_wrong_after_red', mutate: root => rewriteScore(root, {
      command: 'git ls-tree -r --name-only MEASURED | grep round-marker.txt | wc -l', after: 2,
    }), exit: 1, finding: 'score_mismatch', reason: 'after_count_mismatch',
      detail: 'after measurement does not match', appliesMarker: false },
    { name: 'count_revision_mismatch_red', mutate: root => {
      const frozen = gitOk(root, ['rev-list', '--max-parents=0', 'HEAD']);
      const path = join(root, 'SCORECARD.md');
      writeFileSync(path, readFileSync(path, 'utf8')
        .replace(/^command: .*$/m, `command: git ls-tree -r --name-only ${frozen} | grep round-marker.txt | wc -l`));
    }, exit: 1, finding: 'score_mismatch', reason: 'counting_revision_mismatch',
      detail: 'does not measure its measured-against commit', appliesMarker: false },
    { name: 'count_before_after_equal_red', mutate: root => rewriteScore(root, {
      command: 'git ls-tree -r --name-only MEASURED | grep round-marker.txt | wc -l', before: 1, after: 1,
    }), exit: 1, finding: 'score_mismatch', reason: 'score_not_improved',
      detail: 'before and after are the same', appliesMarker: false },
    { name: 'count_before_mismatch_red', mutate: root => rewriteScore(root, {
      command: 'git ls-tree -r --name-only MEASURED | grep round-marker.txt | wc -l', before: 2, after: 1,
    }), exit: 1, finding: 'score_mismatch', reason: 'before_count_mismatch',
      detail: 'before measurement does not match', appliesMarker: false },
    { name: 'round_script_rollback_to_cutover', mutate: root => {
      const bytes = show(defaultRoot, '1212207fd7fad4adf1df1b3a2bde549235bd144d', ROUND_SCRIPT);
      if (!bytes || sha256(bytes) !== ROUND_SCRIPT_CUTOVER_SHA256) fail('could_not_evaluate', 'Archived round-13 cutover bytes are unavailable', 2);
      mkdirSync(join(root, 'scripts'), { recursive: true });
      writeFileSync(join(root, 'scripts/check-round-contract.mjs'), bytes);
    }, exit: 1, finding: 'history_rewritten' },
    { name: 'short_swarm', mutate: root => {
      const path = join(root, 'corpus/evidence/user-20261015-r01/aggregate.json');
      const aggregate = JSON.parse(readFileSync(path, 'utf8'));
      aggregate.results = aggregate.results.slice(0, 31);
      writeFileSync(path, JSON.stringify(aggregate));
    }, exit: 1, finding: 'short_swarm' },
    { name: 'missing_gate', mutate: root => {
      writeFileSync(join(root, 'corpus/lessons/user-20261015-r01.md'), 'axis: operability\nconsequential-external-actions: none\n\nNo gate section.\n');
    }, exit: 1, finding: 'missing_gate' },
    { name: 'consequential_action', mutate: root => {
      const path = join(root, 'corpus/lessons/user-20261015-r01.md');
      writeFileSync(path, readFileSync(path, 'utf8') + 'consequential-action: performed\n');
    }, exit: 1, finding: 'consequential_action' },
    { name: 'future_lesson_allowed', mutate: root => {
      writeFileSync(join(root, 'corpus/lessons/round-2.md'), 'future lesson bytes\n');
    }, exit: 0, finding: 'clean' },
    { name: 'future_lesson_mutated_after_commit', mutate: root => {
      writeFileSync(join(root, 'corpus/lessons/round-2.md'), 'future lesson bytes\n');
    }, after: root => {
      writeFileSync(join(root, 'corpus/lessons/round-2.md'), 'future lesson rewritten\n');
    }, exit: 1, finding: 'history_rewritten' },
    { name: 'historical_lesson_changed', mutate: root => {
      writeFileSync(join(root, 'corpus/lessons/round-1.md'), 'historical lesson rewritten\n');
    }, exit: 1, finding: 'history_rewritten' },
    { name: 'future_lesson_rename_from_pinned', mutate: root => {
      gitOk(root, ['mv', 'corpus/lessons/round-1.md', 'corpus/lessons/round-13.md']);
    }, exit: 1, finding: 'history_rewritten' },
    { name: 'canonical_shonen', mutate: root => {
      writeFileSync(join(root, 'SHONEN.md'), canonicalShonenFixture());
    }, exit: 0, finding: 'clean' },
    { name: 'shonen_x_any_text', mutate: root => {
      writeFileSync(join(root, 'SHONEN.md'), canonicalShonenFixture()
        .replace('- [~] SKILL.md', '- [x] SKILL.md')
        .replace('  `SKILL.md` canonical evidence pointer for this box', '  verifier: attacker non-author — self asserted'));
    }, exit: 1, finding: 'history_rewritten' },
    { name: 'shonen_unresolvable_pointer', mutate: root => {
      writeFileSync(join(root, 'SHONEN.md'), canonicalShonenFixture()
        .replace('  `SKILL.md` canonical evidence pointer for this box', '  `corpus/knowledge/missing.md` absent pointer'));
    }, exit: 1, finding: 'history_rewritten' },
    { name: 'shonen_tree_pointer', mutate: root => {
      writeFileSync(join(root, 'SHONEN.md'), canonicalShonenFixture()
        .replace('  `SKILL.md` canonical evidence pointer for this box', '  `corpus` is a directory pointer'));
    }, exit: 1, finding: 'history_rewritten' },
    { name: 'shonen_blank_box_prose', mutate: root => {
      writeFileSync(join(root, 'SHONEN.md'), canonicalShonenFixture()
        .replace('- [~] SKILL.md', '- [ ] SKILL.md'));
    }, exit: 1, finding: 'history_rewritten' },
    { name: 'shonen_wrong_title', mutate: root => {
      writeFileSync(join(root, 'SHONEN.md'), canonicalShonenFixture()
        .replace(`# ${SHONEN_NAME} — Promotion checklist`, '# other-lane — Promotion checklist'));
    }, exit: 1, finding: 'history_rewritten' },
    { name: 'shonen_extra_box', mutate: root => {
      writeFileSync(join(root, 'SHONEN.md'), canonicalShonenFixture().replace(/\n$/, '\n- [~] Extra box\n'));
    }, exit: 1, finding: 'history_rewritten' },
    { name: 'shonen_crlf', mutate: root => {
      writeFileSync(join(root, 'SHONEN.md'), canonicalShonenFixture().replace(/\n/g, '\r\n'));
    }, exit: 1, finding: 'history_rewritten' },
    { name: 'shonen_double_newline', mutate: root => {
      writeFileSync(join(root, 'SHONEN.md'), `${canonicalShonenFixture()}\n`);
    }, exit: 1, finding: 'history_rewritten' },
    { name: 'pstack_evidence_tamper', mutate: root => {
      mkdirSync(join(root, 'corpus/evidence/pstack-20261015'), { recursive: true });
      writeFileSync(join(root, 'corpus/evidence/pstack-20261015/tampered.tsv'), 'tampered\n');
    }, exit: 1, finding: 'history_rewritten' },
    { name: 'round_script_tamper', mutate: root => {
      mkdirSync(join(root, 'scripts'), { recursive: true });
      writeFileSync(join(root, 'scripts/check-round-contract.mjs'), '// unaccepted checker bytes\n');
    }, exit: 1, finding: 'history_rewritten' },
    { name: 'round_script_cutover', mutate: root => {
      mkdirSync(join(root, 'scripts'), { recursive: true });
      writeFileSync(join(root, 'scripts/check-round-contract.mjs'), readFileSync(join(defaultRoot, ROUND_SCRIPT)));
    }, exit: 0, finding: 'clean' },
  ];
  const observedCases = new Map();
  for (const test of cases) {
    const root = mkdtempSync(join('/var/tmp', 'tabi-user-round-contract-'));
    try {
      const { baseline, pin } = writeGoodFixture(root);
      test.mutate(root);
      if (test.name !== 'clean') {
        gitOk(root, ['add', '--', '.']);
        commit(root, 'mutation');
      }
      if (test.after) {
        test.after(root);
        gitOk(root, ['add', '--', '.']);
        commit(root, 'mutation-2');
      }
      const result = spawnSync(process.execPath, [script, '--repo', root, '--baseline', baseline, '--expect', '1', '--pstack-pin', pin], { encoding: 'utf8' });
      const observed = receiptOf(result);
      observedCases.set(test.name, observed);
      const markerApplicable = test.appliesMarker === true;
      if (markerApplicable && !test.noMarker) fail('could_not_evaluate', `Marker control ${test.name} declares no marker path`, 2);
      const leaked = markerApplicable ? existsSync(join(root, test.noMarker)) : false;
      const markerOutcome = markerApplicable ? (leaked ? 'present' : 'absent') : 'not-applicable';
      // Exit, finding, reason and detail are asserted independently from one
      // anchored child record. A finding-only match would accept a different
      // score_mismatch cause; the reason literal makes that impossible.
      const match = receiptMatches(test, observed) && !leaked;
      const reasonField = test.reason === undefined ? '' : ` expected_reason=${test.reason}`;
      // Applicability is whether this control can create the witness marker at
      // all. no_marker is the outcome only when the check applies: 1 means
      // applicable and absent, 0 means applicable and leaked. A control with no
      // marker role reports no_marker=na with applicability=not_applicable, so
      // "not applicable" and "absent" can never be read as each other.
      const markerField = markerApplicable
        ? ` marker_applicable=1 marker_outcome=${markerOutcome} no_marker=${leaked ? 0 : 1}`
        : ' marker_applicable=0 marker_outcome=not-applicable no_marker=na';
      console.log(`SELFTEST name=${test.name} expected_exit=${test.exit} actual_exit=${observed.exit} expected_finding=${test.finding}${reasonField} reason=${observed.reason ?? 'none'} applicability=${markerApplicable ? 'applicable' : 'not_applicable'}${markerField} isolation=cli result=${match ? 'PASS' : 'FAIL'}`);
      if (!match) fail('selftest_failure', `${observed.stdout}${observed.stderr}`);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
  // Falsifiable wrong-reason control over two actual CLI receipts. The
  // missing-revision fixture returns score_mismatch for counting_command_failed;
  // the wrong-after expectation belongs to a different cause. A finding-only
  // predicate accepts that decoy; the literal reason comparator must reject it,
  // while the real reason still matches. The control can pass only when reason
  // is both asserted and discriminating.
  const wrongCause = observedCases.get('count_missing_revision_red');
  const maliciousCause = observedCases.get('count_malicious_tee_refused');
  const decoy = { exit: 1, finding: 'score_mismatch', reason: 'after_count_mismatch', detail: 'after measurement does not match' };
  const correctCause = { exit: 1, finding: 'score_mismatch', reason: 'counting_command_failed', detail: 'Counting command failed:' };
  const legacyAccept = wrongCause.exit === 1 && wrongCause.finding === 'score_mismatch';
  const decoyMatch = receiptMatches(decoy, wrongCause);
  const correctMatch = receiptMatches(correctCause, wrongCause);
  const maliciousMatch = receiptMatches(cases.find(test => test.name === 'count_malicious_tee_refused'), maliciousCause);
  const negativeMatch = legacyAccept && !decoyMatch && correctMatch && maliciousMatch;
  console.log(`SELFTEST name=reason_negative_control source=count_missing_revision_red source_reason=${wrongCause.reason ?? 'none'} expected_exit=0 actual_exit=0 expected_finding=clean reason=none applicability=not_applicable marker_applicable=0 marker_outcome=not-applicable no_marker=na wrong_reason=${decoy.reason} expected_outcome=no-match actual_outcome=${decoyMatch ? 'match' : 'no-match'} correct_reason=${correctCause.reason} correct_match=${correctMatch ? 1 : 0} malicious_reason=unsupported_counting_command malicious_match=${maliciousMatch ? 1 : 0} legacy_finding_only_accepts=${legacyAccept ? 1 : 0} result=${negativeMatch ? 'PASS' : 'FAIL'}`);
  if (!negativeMatch) fail('selftest_failure', `Reason negative control failed: ${JSON.stringify({ wrongCause, decoyMatch, correctMatch, maliciousMatch })}`);
  const committedIds = roundIds(defaultRoot);
  const committedScorecard = show(defaultRoot, 'HEAD', 'SCORECARD.md').toString('utf8');
  for (const id of committedIds) {
    const score = parseScore(committedScorecard, id);
    const before = runCount(defaultRoot, score.command, HARD_BASELINE);
    const after = runCount(defaultRoot, score.command, score.measured);
    const match = before === score.before && after === score.after;
    console.log(`SELFTEST name=count_committed_${id} expected_exit=0 actual_exit=0 expected_finding=clean reason=none applicability=not_applicable marker_applicable=0 marker_outcome=not-applicable no_marker=na isolation=cli result=${match ? 'PASS' : 'FAIL'} before=${before} after=${after} measured=${score.measured}`);
    if (!match) fail('selftest_failure', `Committed count mismatch ${id}: before=${before}/${score.before} after=${after}/${score.after}`);
  }
  const witnessRun = runCountWitness(COUNT_WITNESS_REV);
  const witnessMatch = witnessRun.pass
    && witnessRun.oldExit === 0
    && witnessRun.oldVerdict === 'clean'
    && witnessRun.oldFinding === 'clean'
    && witnessRun.oldMarker
    && witnessRun.newExit === 1
    && witnessRun.newFinding === 'score_mismatch'
    && witnessRun.newReason === 'unsupported_counting_command'
    && !witnessRun.newMarker;
  console.log(`SELFTEST name=count_witness_comparison countWitness=1 expected_exit=0 actual_exit=${witnessMatch ? 0 : 1} expected_finding=clean reason=none applicability=applicable marker_applicable=1 marker_outcome=${witnessRun.newMarker ? 'present' : 'absent'} no_marker=${witnessRun.newMarker ? 0 : 1} top_exit=${witnessMatch ? 0 : 1} exit=${witnessMatch ? 0 : 1} verdict=${witnessMatch ? 'clean' : 'failed'} old_exit=${witnessRun.oldExit} old_verdict=${witnessRun.oldVerdict} old_finding=${witnessRun.oldFinding} old_marker=${witnessRun.oldMarker ? 1 : 0} old_marker_outcome=${witnessRun.oldMarker ? 'present' : 'absent'} new_exit=${witnessRun.newExit} new_verdict=${witnessRun.newVerdict} new_finding=${witnessRun.newFinding} new_reason=${witnessRun.newReason ?? 'none'} new_marker=${witnessRun.newMarker ? 1 : 0} new_marker_outcome=${witnessRun.newMarker ? 'present' : 'absent'} result=${witnessMatch ? 'PASS' : 'FAIL'}`);
  if (!witnessMatch) fail('selftest_failure', `Count witness mismatch: ${JSON.stringify(witnessRun)}`);
  const diagnosticRun = runDiagnosticWitness();
  const diagnosticMatch = diagnosticRun.pass
    && diagnosticRun.repaired.reason === 'after_count_mismatch'
    && diagnosticRun.repairedMissing.reason === 'counting_command_failed'
    && diagnosticRun.mutantMissing.reason === 'after_count_mismatch'
    && !diagnosticRun.wrongMatch;
  console.log(`SELFTEST name=diagnostic_witness_comparison diagnosticWitness=1 expected_exit=0 actual_exit=${diagnosticMatch ? 0 : 1} expected_finding=clean reason=none applicability=not_applicable marker_applicable=0 marker_outcome=not-applicable no_marker=na wrong_reason=${diagnosticRun.wrongReason} expected_outcome=no-match actual_outcome=${diagnosticRun.wrongMatch ? 'match' : 'no-match'} correct_reason=${diagnosticRun.correctReason} correct_match=${diagnosticRun.correctMatch ? 1 : 0} mutant_reason=${diagnosticRun.mutantMissing.reason ?? 'none'} mutant_correct_match=${diagnosticRun.mutantCorrectMatch ? 1 : 0} baseline_finding_only_accepts=${diagnosticRun.baselineFindingOnly ? 1 : 0} result=${diagnosticMatch ? 'PASS' : 'FAIL'}`);
  if (!diagnosticMatch) fail('selftest_failure', `Diagnostic witness mismatch: ${JSON.stringify(diagnosticRun)}`);
  const aliasRoot = mkdtempSync(join('/var/tmp', 'tabi-user-alias-'));
  try {
    const alias = join(aliasRoot, 'repo');
    symlinkSync(defaultRoot, alias);
    const result = spawnSync(process.execPath, [script, '--repo', alias, '--baseline', HARD_BASELINE, '--expect', '1'], { encoding: 'utf8' });
    const output = `${result.stdout}${result.stderr}`;
    const match = result.status === 2 && output.includes('finding=usage');
    console.log(`SELFTEST name=production_alias_refused expected_exit=2 actual_exit=${result.status} expected_finding=usage reason=none applicability=not_applicable marker_applicable=0 marker_outcome=not-applicable no_marker=na isolation=cli result=${match ? 'PASS' : 'FAIL'}`);
    if (!match) fail('selftest_failure', output);
  } finally {
    rmSync(aliasRoot, { recursive: true, force: true });
  }
  console.log(`USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=${cases.length + committedIds.length + 4} fixtures=${cases.length} alias=1 committedCounts=${committedIds.length} countWitness=1 diagnosticWitness=1 reasonControls=1`);
}

try {
  const options = argumentsOf(process.argv.slice(2));
  if (options.witness !== null) witness(options.witness);
  else if (options.countWitness !== null) countWitness(options.countWitness);
  else if (options.diagnosticWitness) diagnosticWitness();
  else if (options.selfTest) selfTest();
  else check(options);
} catch (error) {
  const exit = error.exit ?? 2;
  const reason = error.reason ? ` reason=${error.reason}` : '';
  console.error(`USER_ROUND_CONTRACT verdict=${exit === 1 ? 'failed' : 'could-not-evaluate'} finding=${error.finding ?? 'could_not_evaluate'}${reason} detail=${error.message}`);
  process.exitCode = exit;
}
