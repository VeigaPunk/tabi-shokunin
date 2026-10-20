#!/usr/bin/env node
// Reads committed user-20261015 round files only. A miss exits non-zero.
// The production pstack checker is a different script and stays unchanged.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync, realpathSync, symlinkSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const defaultRoot = resolve(dirname(script), '..');
const HARD_BASELINE = '7f506affa55f6fb892d3c8073c75151c998bdf2c';
const PSTACK_PIN = '92d700d6a8aa9855f1e9d2cc8e12c82f762a1367';
// The one lane-owned tooling cutover accepted after PSTACK_PIN: the repaired
// round gate. Its exact bytes are pinned here; any other change to that file
// (or a policy/self-blessing redirect) still fails history_rewritten.
const ROUND_SCRIPT = 'scripts/check-round-contract.mjs';
// Exact old -> new checker identity. The old digest is the blob at PSTACK_PIN;
// the new digest is the accepted lane-owned cutover committed at 1212207f
// (git blob 43db9f4b). Any third value fails.
const ROUND_SCRIPT_PRIOR_SHA256 = '7d403cee003c3b49e865d57e034821ea925252efc231b0b22ded62ac5410c398';
const ROUND_SCRIPT_CUTOVER_SHA256 = '8478cd438b22f15bab153901276aad8afc7711d139e86769f4323b5f0affdb4d';
// Independent canonical seed authority. Parent PROTOCOL.md @6bd4f38 lines
// 333-340 (byte-identical since 70ffb66), <name> = tabi-shokunin, normalized to
// the four [ ] boxes with no evidence lines. Never read the parent at runtime.
const SHONEN_NAME = 'tabi-shokunin';
const SHONEN_SEED_SHA256 = 'b45c2ac3cdf8ba80563e77cabf72670a6a101590f8031d9b484c67313bcdab67';
// The pre-repair gate bytes used as the witness red-before arm. Any rev whose
// scripts/check-user-round-contract.mjs blob differs is not the legacy arm.
const USER_SCRIPT = 'scripts/check-user-round-contract.mjs';
const LEGACY_USER_GATE_BLOB = '18e2c79ada4258cc46af7696e98907299b77c431';
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

function fail(finding, detail, exit = 1) {
  throw Object.assign(new Error(detail), { finding, exit });
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

// Accept the exact pre-cutover bytes or exactly one recorded new digest.
// The archived bytes must still hash to the recorded prior digest.
function acceptedRoundScript(root, pstackPin) {
  if (!/^[a-f0-9]{64}$/.test(ROUND_SCRIPT_CUTOVER_SHA256)) {
    fail('could_not_evaluate', 'Round checker cutover digest is not filled', 2);
  }
  const head = show(root, 'HEAD', ROUND_SCRIPT);
  if (!head) return false;
  const pinned = show(root, pstackPin, ROUND_SCRIPT);
  if (pinned && sha256(pinned) !== ROUND_SCRIPT_PRIOR_SHA256) {
    fail('could_not_evaluate', 'Pinned checker bytes are not the recorded prior bytes', 2);
  }
  if (!pinned && sameRoot(root, defaultRoot)) fail('could_not_evaluate', 'Pinned checker bytes are missing', 2);
  const digest = sha256(head);
  return digest === ROUND_SCRIPT_CUTOVER_SHA256 || digest === ROUND_SCRIPT_PRIOR_SHA256;
}

// A round-N lesson is frozen at the baseline when present there. A lesson
// absent at the baseline is admitted only as an initial addition and only when
// no later commit in the pin range modified, deleted, renamed, or retyped it.
function lessonDrift(root, baseline, pstackPin, status, path) {
  const historical = blob(root, baseline, path);
  if (historical) return blob(root, 'HEAD', path) !== historical;
  if (status !== 'A') return true;
  if (!blob(root, 'HEAD', path)) return true;
  const changed = git(root, ['log', '-m', '--no-renames', '--diff-filter=MDRT', '--format=%H', `${pstackPin}..HEAD`, '--', path]);
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
  const options = { repo: defaultRoot, baseline: HARD_BASELINE, expect: 10, selfTest: false, pstackPin: null, witness: null };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === '--self-test') options.selfTest = true;
    else if (flag === '--witness' && argv[i + 1]) options.witness = argv[++i];
    else if (flag === '--repo' && argv[i + 1]) options.repo = resolve(argv[++i]);
    else if (flag === '--baseline' && argv[i + 1]) options.baseline = argv[++i];
    else if (flag === '--expect' && argv[i + 1]) options.expect = Number(argv[++i]);
    else if (flag === '--pstack-pin' && argv[i + 1]) options.pstackPin = argv[++i];
    else fail('usage', 'Use --self-test, --witness REV, or --repo PATH --baseline HASH --expect N [--pstack-pin HASH] for an isolated fixture', 2);
  }
  if (options.selfTest && argv.length !== 1) fail('usage', '--self-test takes no other arguments', 2);
  if (options.witness !== null) {
    if (argv.length !== 2 || !/^[a-f0-9]{7,40}$/.test(options.witness)) fail('usage', '--witness takes one git revision whose gate bytes are the red-before arm', 2);
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

function parseScore(scorecard, id) {
  const pattern = new RegExp(`<!-- user-round:${id}\\n([\\s\\S]*?)-->`);
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
  return { axis: field('axis'), before: field('before'), after: field('after'), command, measured };
}

function runCount(root, command) {
  const result = spawnSync('bash', ['-c', command], { cwd: root, encoding: 'utf8', timeout: 30000 });
  if (result.error || result.status !== 0) fail('score_mismatch', `Counting command failed: ${command}`);
  return result.stdout.trim();
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
    if (score.before === score.after) fail('score_mismatch', `${id} before and after are the same`);
    if (!log.includes(id)) fail('missing_score', `${id} has no LOG entry`);
    const beforeCommand = score.command.replaceAll(score.measured, options.baseline);
    if (beforeCommand === score.command) fail('missing_score', `${id} counting command does not use the measured commit`);
    if (runCount(root, beforeCommand) !== score.before) fail('score_mismatch', `${id} before measurement does not match`);
    if (runCount(root, score.command) !== score.after) fail('score_mismatch', `${id} after measurement does not match`);
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

function witness(rev) {
  const commitRev = gitOk(defaultRoot, ['rev-parse', '--verify', `${rev}^{commit}`]);
  const legacyBlob = blob(defaultRoot, commitRev, USER_SCRIPT);
  if (legacyBlob !== LEGACY_USER_GATE_BLOB) {
    fail('witness_failure', `Witness arm is not the pinned legacy gate: ${legacyBlob}`, 2);
  }
  const legacyBytes = show(defaultRoot, commitRev, USER_SCRIPT);
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
    console.log(`USER_ROUND_CONTRACT_WITNESS rev=${commitRev} baseline=${baseline} args=${JSON.stringify(args)} old_exit=${before.status} old_verdict=${oldArm.verdict} old_finding=${oldArm.finding} new_exit=${after.status} new_verdict=${newArm.verdict} new_finding=${newArm.finding} result=${pass ? 'PASS' : 'FAIL'}`);
    if (!pass) fail('witness_failure', `old=${JSON.stringify(oldArm)} new=${JSON.stringify(newArm)}`);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
}

function selfTest() {
  const cases = [
    { name: 'clean', mutate: () => {}, exit: 0, finding: 'clean' },
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
      const output = `${result.stdout}${result.stderr}`;
      const match = result.status === test.exit && output.includes(test.finding === 'clean' ? 'verdict=clean' : `finding=${test.finding}`);
      console.log(`SELFTEST name=${test.name} expected_exit=${test.exit} actual_exit=${result.status} expected_finding=${test.finding} result=${match ? 'PASS' : 'FAIL'}`);
      if (!match) fail('selftest_failure', output);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
  const aliasRoot = mkdtempSync(join('/var/tmp', 'tabi-user-alias-'));
  try {
    const alias = join(aliasRoot, 'repo');
    symlinkSync(defaultRoot, alias);
    const result = spawnSync(process.execPath, [script, '--repo', alias, '--baseline', HARD_BASELINE, '--expect', '1'], { encoding: 'utf8' });
    const output = `${result.stdout}${result.stderr}`;
    const match = result.status === 2 && output.includes('finding=usage');
    console.log(`SELFTEST name=production_alias_refused expected_exit=2 actual_exit=${result.status} expected_finding=usage result=${match ? 'PASS' : 'FAIL'}`);
    if (!match) fail('selftest_failure', output);
  } finally {
    rmSync(aliasRoot, { recursive: true, force: true });
  }
  console.log(`USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=${cases.length + 1}`);
}

try {
  const options = argumentsOf(process.argv.slice(2));
  if (options.witness !== null) witness(options.witness);
  else if (options.selfTest) selfTest();
  else check(options);
} catch (error) {
  const exit = error.exit ?? 2;
  console.error(`USER_ROUND_CONTRACT verdict=${exit === 1 ? 'failed' : 'could-not-evaluate'} finding=${error.finding ?? 'could_not_evaluate'} detail=${error.message}`);
  process.exitCode = exit;
}
