#!/usr/bin/env node
// Reads committed tabi round files only. A miss exits non-zero.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync, realpathSync, symlinkSync, unlinkSync } from 'node:fs';
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

function git(root, args, binary = false) {
  const result = spawnSync('git', args, { cwd: root, encoding: binary ? undefined : 'utf8' });
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
// to a committed regular blob at HEAD. The normalized template must hash to the
// persisted independent seed digest. Structural only, never a promotion grant.
function canonicalShonenText() {
  const lines = [`# ${LANE} — Promotion checklist`, '', 'Promotion to shokunin requires all of:', ''];
  for (const box of BOXES) lines.push(`- [~] ${box}`, '  `corpus/lessons/pstack-20261015-r01.md` — author-side evidence pointer');
  return `${lines.join('\n')}\n`;
}

function regularBlob(root, path) {
  const result = git(root, ['--literal-pathspecs', 'ls-tree', 'HEAD', '--', path]);
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

function checkShonenPolicy(root, text) {
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
      if (!evidencePointers(evidence).some(pointer => regularBlob(root, pointer))) {
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

function checkShonen(root, baseline) {
  const before = blob(root, baseline, SHONEN_PATH);
  if (!before) fail('history_rewritten', `${SHONEN_PATH} is missing at the baseline`);
  const after = blob(root, 'HEAD', SHONEN_PATH);
  if (!after) fail('shonen_policy', `${SHONEN_PATH} is missing at HEAD`);
  if (after === before) return;
  checkShonenPolicy(root, show(root, 'HEAD', SHONEN_PATH).toString('utf8'));
}

function censusEntries(root, baseline, production, expectedSha256) {
  const bytes = show(root, 'HEAD', CENSUS_PATH);
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
  const options = { repo: defaultRoot, baseline: HARD_BASELINE, expect: 10, selfTest: false, witness: null, censusSha256: null };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === '--self-test') options.selfTest = true;
    else if (flag === '--witness' && argv[i + 1]) options.witness = argv[++i];
    else if (flag === '--census-sha256' && argv[i + 1]) options.censusSha256 = argv[++i];
    else if (flag === '--repo' && argv[i + 1]) options.repo = resolve(argv[++i]);
    else if (flag === '--baseline' && argv[i + 1]) options.baseline = argv[++i];
    else if (flag === '--expect' && argv[i + 1]) options.expect = Number(argv[++i]);
    else fail('usage', 'Use --self-test, --witness REV, or --repo PATH --baseline HASH --expect N [--census-sha256 HASH] for an isolated fixture', 2);
  }
  if (options.selfTest && argv.length !== 1) fail('usage', '--self-test takes no other arguments', 2);
  if (options.witness !== null) {
    if (argv.length !== 2 || !/^[a-f0-9]{7,40}$/.test(options.witness)) fail('usage', '--witness takes one git revision whose gate bytes are the red-before arm', 2);
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

function checkHistory(root, baseline, production, censusSha256) {
  const head = gitOk(root, ['rev-parse', 'HEAD']);
  const ancestor = git(root, ['merge-base', '--is-ancestor', baseline, head]);
  if (ancestor.status !== 0) fail('history_rewritten', 'Baseline is not an ancestor of HEAD');
  for (const path of list(root, baseline, '.').filter(protectedPath)) {
    const before = blob(root, baseline, path);
    const after = blob(root, head, path);
    if (!before || !after) fail('history_rewritten', `Protected bytes changed: ${path}`);
    if (path === SHONEN_PATH) continue;
    if (before !== after) fail('history_rewritten', `Protected bytes changed: ${path}`);
  }
  checkShonen(root, baseline);
  for (const path of APPEND_ONLY) {
    const before = show(root, baseline, path);
    if (!before) continue;
    const after = show(root, head, path);
    if (!after || !after.subarray(0, before.length).equals(before)) fail('history_rewritten', `Append-only prefix changed: ${path}`);
  }
  const census = censusEntries(root, baseline, production, censusSha256);
  if (!census) return;
  for (const { recorded, path } of census) {
    const before = blob(root, baseline, path);
    if (!before || before !== recorded) fail('history_rewritten', `Census baseline drifted: ${path}`);
    const after = blob(root, head, path);
    if (path === SHONEN_PATH) {
      // Historical row is still compared to the committed old hash; only the
      // current bytes may follow the canonical seed, and never arbitrary prose.
      if (!after) fail('shonen_policy', `${SHONEN_PATH} is missing at HEAD`);
      if (after !== recorded) checkShonenPolicy(root, show(root, head, SHONEN_PATH).toString('utf8'));
      continue;
    }
    if (after !== recorded) fail('history_rewritten', `Census blob drifted: ${path}`);
  }
}

function roundIds(root) {
  return list(root, 'HEAD', 'corpus/lessons')
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

function runCount(root, command) {
  const result = spawnSync('bash', ['-c', command], { cwd: root, encoding: 'utf8', timeout: 30000 });
  if (result.error || result.status !== 0) fail('score_mismatch', `Counting command failed: ${command}`);
  return result.stdout.trim();
}

function checkSwarm(root, id) {
  const raw = show(root, 'HEAD', `corpus/evidence/${id}/aggregate.json`);
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
  const paths = [
    `corpus/lessons/${id}.md`,
    `reports/${id}.md`,
    ...list(root, 'HEAD', `corpus/evidence/${id}`),
  ];
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

function checkPublic(root, ids) {
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
  checkHistory(root, options.baseline, production, options.censusSha256);
  const ids = roundIds(root);
  if (ids.length !== options.expect) fail('round_count', `Found ${ids.length} pstack rounds, expected ${options.expect}`);
  for (let index = 0; index < ids.length; index++) {
    const wanted = `pstack-20261015-r${String(index + 1).padStart(2, '0')}`;
    if (ids[index] !== wanted) fail('round_sequence', `Expected ${wanted}, found ${ids[index]}`);
  }
  const scorecard = show(root, 'HEAD', 'SCORECARD.md').toString('utf8');
  const log = show(root, 'HEAD', 'LOG.md').toString('utf8');
  for (const id of ids) {
    const lesson = show(root, 'HEAD', `corpus/lessons/${id}.md`).toString('utf8');
    const gate = parseLesson(lesson, id);
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
  checkPublic(root, ids);
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

function selfTest() {
  const cases = [
    { name: 'clean', mutate: () => {}, exit: 0, finding: 'clean' },
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
      if (test.name !== 'clean') {
        gitOk(root, ['add', '--', '.']);
        commit(root, 'mutation');
      }
      const result = spawnSync(process.execPath, [script, '--repo', root, '--baseline', baseline, '--expect', '1', ...extra], { encoding: 'utf8' });
      const output = `${result.stdout}${result.stderr}`;
      const match = result.status === test.exit && output.includes(test.finding === 'clean' ? 'verdict=clean' : `finding=${test.finding}`);
      console.log(`SELFTEST name=${test.name} expected_exit=${test.exit} actual_exit=${result.status} expected_finding=${test.finding} result=${match ? 'PASS' : 'FAIL'}`);
      if (!match) fail('selftest_failure', output);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
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

try {
  const options = argumentsOf(process.argv.slice(2));
  if (options.selfTest) selfTest();
  else if (options.witness) witness(options.witness);
  else check(options);
} catch (error) {
  const exit = error.exit ?? 2;
  console.error(`ROUND_CONTRACT verdict=${exit === 1 ? 'failed' : 'could-not-evaluate'} finding=${error.finding ?? 'could_not_evaluate'} detail=${error.message}`);
  process.exitCode = exit;
}
