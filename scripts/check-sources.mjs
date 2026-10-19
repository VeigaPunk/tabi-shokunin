#!/usr/bin/env node
import {
  closeSync,
  constants,
  fstatSync,
  lstatSync,
  mkdtempSync,
  openSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
  mkdirSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(import.meta.url);
const defaultRoot = resolve(dirname(script), '..');
const defaultFile = 'corpus/SOURCES.md';
const rowPattern = /^\|[ \t\v\f\r]*S[0-9]{3,}[ \t\v\f\r]*\|/;
const kinds = new Set(['spec', 'docs', 'paper', 'code', 'tool', 'dataset', 'talk', 'book', 'community', 'own-work']);
const tiers = ['A', 'B', 'C'];
const statuses = ['queued', 'mined', 'rejected'];
const requiredSections = ['## Registry', '## Paths', '## Search log', '## Leads (unopened)'];
const fleetCodes = Object.freeze({
  malformed_row: 'E01',
  bad_id: 'E02',
  duplicate_id: 'E03',
  duplicate_url: 'E04',
  bad_kind: 'E05',
  bad_tier: 'E06',
  bad_status: 'E07',
  bad_opened: 'E08',
  bad_recheck: 'E09',
  tier_inflation: 'E10',
  used_by_missing: 'E11',
  mined_without_used_by: 'W03',
});

// This expected table is intentionally committed with the gate, not derived from its output.
const selfTestCases = Object.freeze([
  { name: 'clean', exit: 0, finding: 'none' },
  { name: 'no-rows', exit: 1, finding: 'no_rows' },
  { name: 'malformed-row', exit: 1, finding: 'malformed_row' },
  { name: 'bad-id', exit: 1, finding: 'bad_id' },
  { name: 'duplicate-id', exit: 1, finding: 'duplicate_id' },
  { name: 'duplicate-url', exit: 1, finding: 'duplicate_url' },
  { name: 'supersedes-correction', exit: 0, finding: 'none' },
  { name: 'bad-kind', exit: 1, finding: 'bad_kind' },
  { name: 'bad-tier', exit: 1, finding: 'bad_tier' },
  { name: 'bad-status', exit: 1, finding: 'bad_status' },
  { name: 'bad-opened', exit: 1, finding: 'bad_opened' },
  { name: 'bad-recheck', exit: 1, finding: 'bad_recheck' },
  { name: 'tier-inflation', exit: 1, finding: 'tier_inflation' },
  { name: 'used-by-missing', exit: 1, finding: 'used_by_missing' },
  { name: 'mined-without-used-by', exit: 1, finding: 'mined_without_used_by' },
  { name: 'used-by-uncited', exit: 1, finding: 'used_by_uncited' },
  { name: 'used-by-id-boundary', exit: 1, finding: 'used_by_uncited' },
  { name: 'used-by-escape', exit: 1, finding: 'used_by_escape' },
  { name: 'rejected-without-flip', exit: 1, finding: 'rejected_without_flip' },
  { name: 'missing-section', exit: 1, finding: 'missing_section' },
  { name: 'credential-material', exit: 1, finding: 'credential_material' },
  { name: 'bare-anchor', exit: 1, finding: 'bare_anchor' },
  { name: 'row-outside-registry', exit: 1, finding: 'row_outside_registry' },
  { name: 'symlinked-registry', exit: 2, finding: 'could_not_evaluate', detail: 'registry_symlink_refused' },
  { name: 'non-regular-registry', exit: 2, finding: 'could_not_evaluate', detail: 'registry_not_regular' },
  { name: 'missing-file', exit: 2, finding: 'could_not_evaluate', detail: 'registry_missing' },
]);

function gateError(detail) {
  return Object.assign(new Error(detail), { gateDetail: detail });
}

function isIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function parseArguments(args) {
  const options = { root: defaultRoot, file: defaultFile, since: null, selfTest: false };
  const seen = new Set();
  for (let index = 0; index < args.length; index++) {
    const flag = args[index];
    if (flag === '--self-test') {
      if (args.length !== 1) throw gateError('bad_arguments');
      options.selfTest = true;
      continue;
    }
    if (!['--root', '--file', '--since'].includes(flag) || seen.has(flag)) throw gateError('bad_arguments');
    const value = args[index + 1];
    if (value === undefined || value.startsWith('--') || value.length === 0) throw gateError('bad_arguments');
    seen.add(flag);
    index++;
    if (flag === '--root') options.root = value;
    else if (flag === '--file') options.file = value;
    else {
      if (!isIsoDate(value)) throw gateError('bad_since_date');
      options.since = value;
    }
  }
  return options;
}

function safeField(value) {
  return String(value).replace(/[^A-Za-z0-9._/-]/g, '_').slice(0, 120) || '-';
}

function inside(root, candidate) {
  const path = relative(root, candidate);
  return path === '' || (path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path));
}

function canonicalRoot(rootValue) {
  let root;
  try {
    root = realpathSync(resolve(rootValue));
    if (!statSync(root).isDirectory()) throw gateError('root_not_directory');
  } catch (error) {
    if (error.gateDetail) throw error;
    throw gateError('root_unavailable');
  }
  return root;
}

function registryPath(root, file) {
  if (!file || isAbsolute(file) || /^[A-Za-z]:[\\/]/.test(file) || /^\\\\/.test(file) || file.includes('\\') || file.includes('\0')) {
    throw gateError('unsafe_registry_path');
  }
  const absolute = resolve(root, file);
  if (!inside(root, absolute)) throw gateError('unsafe_registry_path');
  return absolute;
}

function readRegistry(absolute) {
  let metadata;
  try {
    metadata = lstatSync(absolute);
  } catch (error) {
    throw gateError(error.code === 'ENOENT' ? 'registry_missing' : 'registry_unreadable');
  }
  if (metadata.isSymbolicLink()) throw gateError('registry_symlink_refused');
  if (!metadata.isFile()) throw gateError('registry_not_regular');
  try {
    if (realpathSync(absolute) !== absolute) throw gateError('registry_symlink_refused');
  } catch (error) {
    if (error.gateDetail) throw error;
    throw gateError('registry_unreadable');
  }
  let descriptor;
  try {
    descriptor = openSync(absolute, constants.O_RDONLY | constants.O_NOFOLLOW);
    if (!fstatSync(descriptor).isFile()) throw gateError('registry_not_regular');
    const bytes = readFileSync(descriptor);
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch {
      throw gateError('registry_invalid_utf8');
    }
  } catch (error) {
    if (error.gateDetail) throw error;
    throw gateError(error.code === 'ENOENT' ? 'registry_missing' : 'registry_unreadable');
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
}

function normalizeUrl(source) {
  const match = /(https?:\/\/[^ |]+)/i.exec(source);
  if (!match) return '';
  let value = match[0].replace(/#[^ ]*$/, '').replace(/\/$/, '').replace(/^[A-Za-z]+:\/\//, '').replace(/^www\./i, '');
  const slash = value.indexOf('/');
  if (slash < 0) return value.toLowerCase();
  return `${value.slice(0, slash).toLowerCase()}${value.slice(slash)}`;
}

function nearestRealPath(candidate) {
  let probe = candidate;
  while (true) {
    try {
      return realpathSync(probe);
    } catch (error) {
      if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') throw error;
      const parent = dirname(probe);
      if (parent === probe) throw error;
      probe = parent;
    }
  }
}

function inspectUsedBy(root, value, rowId) {
  if (!value || value.includes('\0') || value.includes('\\') || isAbsolute(value) || /^[A-Za-z]:[\\/]/.test(value) || /^\\\\/.test(value)) {
    return { kind: 'escape' };
  }
  const candidate = resolve(root, value);
  if (!inside(root, candidate)) return { kind: 'escape' };
  let realCandidate;
  try {
    realCandidate = nearestRealPath(candidate);
  } catch (error) {
    if (error.code === 'ELOOP') return { kind: 'escape' };
    if (error.code === 'EACCES' || error.code === 'EPERM') return { kind: 'unreadable' };
    return { kind: 'missing' };
  }
  if (!inside(root, realCandidate)) return { kind: 'escape' };
  let targetStat;
  try {
    targetStat = statSync(candidate);
  } catch (error) {
    if (error.code === 'ELOOP') return { kind: 'escape' };
    if (error.code === 'EACCES' || error.code === 'EPERM') return { kind: 'unreadable' };
    return { kind: 'missing' };
  }
  if (!targetStat.isFile()) return { kind: 'missing' };
  let descriptor;
  try {
    descriptor = openSync(realCandidate, constants.O_RDONLY | constants.O_NOFOLLOW);
    if (!fstatSync(descriptor).isFile()) return { kind: 'missing' };
    const escaped = rowId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cites = new RegExp(`(?<![A-Za-z0-9])${escaped}(?![0-9])`).test(readFileSync(descriptor, 'utf8'));
    return { kind: cites ? 'cited' : 'uncited' };
  } catch (error) {
    if (error.code === 'ELOOP') return { kind: 'escape' };
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return { kind: 'missing' };
    return { kind: 'unreadable' };
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
}

function addFinding(findings, id, row = '-', detail = 'structural_violation') {
  findings.push({ id, fleet: fleetCodes[id] ?? '-', row: /^[S][0-9]{3,}$/.test(row) ? row : '-', detail: safeField(detail) });
}

function evaluate(text, root, since) {
  const findings = [];
  const lines = text.split('\n');
  for (const section of requiredSections) {
    if (!lines.some(line => line.trim() === section)) addFinding(findings, 'missing_section', '-', `missing_${section.slice(3).toLowerCase().replace(/[^a-z0-9]+/g, '_')}`);
  }

  const rows = [];
  let recordCandidates = 0;
  let section = null;
  for (const line of lines) {
    if (/^## /.test(line)) {
      section = line.trim();
      continue;
    }
    const inRegistry = section === '## Registry';
    if (rowPattern.test(line)) {
      const fields = line.split('|').map(cell => cell.trim());
      if (!inRegistry) {
        addFinding(findings, 'row_outside_registry', fields[1] || '-', `section_${(section ?? 'preamble').replace(/^## /, '').toLowerCase().replace(/[^a-z0-9]+/g, '_')}`);
        continue;
      }
      rows.push({ fields });
      recordCandidates++;
      continue;
    }
    if (!inRegistry || !line.startsWith('|')) continue;
    const fields = line.split('|').map(cell => cell.trim());
    const candidateId = fields[1] ?? '';
    const divider = /^:?-{3,}:?$/.test(candidateId);
    if (!candidateId || candidateId.toLowerCase() === 'id' || divider) continue;
    recordCandidates++;
    addFinding(findings, 'bad_id', '-', 'id_invalid');
  }
  if (recordCandidates === 0) addFinding(findings, 'no_rows', '-', 'no_registry_rows');

  const tierCounts = { A: 0, B: 0, C: 0 };
  const statusCounts = { queued: 0, mined: 0, rejected: 0 };
  const seenIds = new Set();
  const seenUrls = new Set();
  for (const { fields } of rows) {
    const id = fields[1] ?? '';
    if (seenIds.has(id)) addFinding(findings, 'duplicate_id', id, 'duplicate_id');
    seenIds.add(id);

    const source = fields[2] ?? '';
    const url = normalizeUrl(source);
    if (url) {
      const teaches = fields[7] ?? '';
      if (seenUrls.has(url) && !/^supersedes\s+S[0-9]{3,}\b/.test(teaches)) {
        addFinding(findings, 'duplicate_url', id, 'duplicate_url');
      }
      seenUrls.add(url);
    }

    const tier = fields[4] ?? '';
    const status = fields[8] ?? '';
    if (Object.hasOwn(tierCounts, tier)) tierCounts[tier]++;
    if (Object.hasOwn(statusCounts, status)) statusCounts[status]++;
    if (fields.length !== 13) {
      addFinding(findings, 'malformed_row', id, `fields_${fields.length}`);
      continue;
    }

    const kind = fields[3];
    const anchor = fields[6];
    const teaches = fields[7];
    const opened = fields[9];
    const recheck = fields[10];
    const usedBy = fields[11];

    if (!kinds.has(kind)) addFinding(findings, 'bad_kind', id, 'kind_invalid');
    if (!tiers.includes(tier)) addFinding(findings, 'bad_tier', id, 'tier_invalid');
    if (!statuses.includes(status)) addFinding(findings, 'bad_status', id, 'status_invalid');
    if (!isIsoDate(opened) || (since !== null && opened < since)) addFinding(findings, 'bad_opened', id, 'opened_invalid');
    if (!isIsoDate(recheck) && !/^[0-9]+d$/.test(recheck) && recheck !== 'on-release') addFinding(findings, 'bad_recheck', id, 'recheck_invalid');
    if (tier === 'A' && kind === 'community') addFinding(findings, 'tier_inflation', id, 'community_at_tier_A');
    if (!anchor || anchor === '—') addFinding(findings, 'bare_anchor', id, 'anchor_missing');
    if (status === 'rejected' && (!teaches.includes('REJECTED:') || !teaches.includes('flip:'))) {
      addFinding(findings, 'rejected_without_flip', id, 'rejection_requires_reason_and_flip');
    }

    const usedPaths = usedBy === '—' || usedBy === '' ? [] : usedBy.split(/[,;]/).map(path => path.trim());
    if (status === 'mined' && usedPaths.every(path => !path || path === '—')) {
      addFinding(findings, 'mined_without_used_by', id, 'mined_without_used_by');
    }
    if (usedBy === '') addFinding(findings, 'used_by_missing', id, 'used_by_empty');
    for (const path of usedPaths) {
      if (!path || path === '—') continue;
      const checked = inspectUsedBy(root, path, id);
      if (checked.kind === 'escape') addFinding(findings, 'used_by_escape', id, 'path_outside_root');
      else if (checked.kind === 'missing') addFinding(findings, 'used_by_missing', id, 'path_missing');
      else if (checked.kind === 'uncited') addFinding(findings, 'used_by_uncited', id, 'row_id_absent');
      else if (checked.kind === 'unreadable') addFinding(findings, 'could_not_evaluate', id, 'used_by_unreadable');
    }
  }

  const credentialPatterns = [
    /op:\/\//,
    /BEGIN[\s\S]{0,100}PRIVATE KEY/,
    /ghp_[A-Za-z0-9]+/,
    /\bAKIA[A-Z0-9]+\b/,
    /xox[baprs]-[A-Za-z0-9-]+/,
  ];
  if (credentialPatterns.some(pattern => pattern.test(text))) addFinding(findings, 'credential_material', '-', 'credential_pattern_detected');

  const cannotEvaluate = findings.some(finding => finding.id === 'could_not_evaluate');
  return {
    findings,
    rows: rows.length,
    tierCounts,
    statusCounts,
    verdict: cannotEvaluate ? 'could-not-evaluate' : findings.length === 0 ? 'clean' : 'failed',
    exit: cannotEvaluate ? 2 : findings.length === 0 ? 0 : 1,
  };
}

function printResult(result, file) {
  for (const finding of result.findings) {
    console.log(`FINDING id=${finding.id} fleet=${finding.fleet} row=${finding.row} detail=${finding.detail}`);
  }
  const tiersSummary = tiers.map(tier => `${tier}:${result.tierCounts[tier]}`).join(',');
  const statusSummary = statuses.map(status => `${status}:${result.statusCounts[status]}`).join(',');
  console.log(`SOURCES_GATE verdict=${result.verdict} rows=${result.rows} tiers=${tiersSummary} status=${statusSummary} findings=${result.findings.length} file=${safeField(file)}`);
}

function printUnavailable(file, detail) {
  const result = {
    findings: [{ id: 'could_not_evaluate', fleet: '-', row: '-', detail: safeField(detail) }],
    rows: 0,
    tierCounts: { A: 0, B: 0, C: 0 },
    statusCounts: { queued: 0, mined: 0, rejected: 0 },
    verdict: 'could-not-evaluate',
  };
  printResult(result, file);
}

function makeRow(overrides = {}) {
  const value = {
    id: 'S001',
    source: 'Example source — https://example.test/S001',
    kind: 'docs',
    tier: 'B',
    scope: 'fixture scope',
    anchor: 'section-1 @fixture-v1',
    teaches: 'A bounded learning outcome.',
    status: 'queued',
    opened: '2026-10-19',
    recheck: '90d',
    usedBy: '—',
    ...overrides,
  };
  return `| ${value.id} | ${value.source} | ${value.kind} | ${value.tier} | ${value.scope} | ${value.anchor} | ${value.teaches} | ${value.status} | ${value.opened} | ${value.recheck} | ${value.usedBy} |`;
}

function fixtureText(rows, omitSection = null, extra = '', trailing = []) {
  const after = ['## Paths', '## Search log', '## Leads (unopened)'].filter(section => section !== omitSection);
  return [
    '# SOURCES — fixture',
    ...(omitSection === '## Registry' ? [] : ['## Registry']),
    '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
    ...rows,
    ...after,
    ...trailing,
    extra,
    '',
  ].join('\n');
}

function fixtureFor(name, root) {
  const row = makeRow();
  if (name === 'no-rows') return { rows: [] };
  if (name === 'malformed-row') return { rows: [`${row} extra |`] };
  if (name === 'bad-id') return { rows: [makeRow({ id: 'not-an-id' })] };
  if (name === 'duplicate-id') return { rows: [row, makeRow({ source: 'Different — https://example.test/other' })] };
  if (name === 'duplicate-url') return { rows: [row, makeRow({ id: 'S002', source: 'Other — http://www.EXAMPLE.test/S001/#section' })] };
  if (name === 'supersedes-correction') return { rows: [row, makeRow({ id: 'S002', teaches: 'supersedes S001 — corrected anchor for the same source.' })] };
  if (name === 'bad-kind') return { rows: [makeRow({ kind: 'blog' })] };
  if (name === 'bad-tier') return { rows: [makeRow({ tier: 'D' })] };
  if (name === 'bad-status') return { rows: [makeRow({ status: 'pending' })] };
  if (name === 'bad-opened') return { rows: [makeRow({ opened: '2026-10-18' })], since: '2026-10-19' };
  if (name === 'bad-recheck') return { rows: [makeRow({ recheck: 'soon' })] };
  if (name === 'tier-inflation') return { rows: [makeRow({ kind: 'community', tier: 'A' })] };
  if (name === 'used-by-missing') return { rows: [makeRow({ usedBy: 'corpus/knowledge/missing.md' })] };
  if (name === 'mined-without-used-by') return { rows: [makeRow({ status: 'mined', usedBy: '—' })] };
  if (name === 'used-by-uncited') {
    const cited = join(root, 'corpus/knowledge/uncited.md');
    mkdirSync(dirname(cited), { recursive: true });
    writeFileSync(cited, 'This note does not cite the registry identity.\n');
    return { rows: [makeRow({ usedBy: 'corpus/knowledge/uncited.md' })] };
  }
  if (name === 'used-by-id-boundary') {
    const cited = join(root, 'corpus/knowledge/boundary.md');
    mkdirSync(dirname(cited), { recursive: true });
    writeFileSync(cited, 'This note cites only S0010, never the three-digit row.\n');
    return { rows: [makeRow({ status: 'mined', usedBy: 'corpus/knowledge/boundary.md' })] };
  }
  if (name === 'used-by-escape') return { rows: [makeRow({ usedBy: '../../../outside.md' })] };
  if (name === 'rejected-without-flip') return { rows: [makeRow({ status: 'rejected' })] };
  if (name === 'missing-section') return { rows: [row], omitSection: '## Search log' };
  if (name === 'credential-material') return { rows: [row], extra: 'ghp_fixtureSecretValue' };
  if (name === 'bare-anchor') return { rows: [makeRow({ anchor: '—' })] };
  if (name === 'row-outside-registry') return { rows: [row], trailing: [makeRow({ id: 'S002', source: 'Stray — https://example.test/stray' })] };
  if (name === 'clean') {
    const cited = join(root, 'corpus/knowledge/mined.md');
    mkdirSync(dirname(cited), { recursive: true });
    writeFileSync(cited, 'This entry cites S002.\n');
    return {
      rows: [
        makeRow({ id: 'S001', source: 'Spec — https://example.test/spec', kind: 'spec', tier: 'A' }),
        makeRow({ id: 'S002', source: 'Guide — https://example.test/guide', kind: 'docs', tier: 'B', status: 'mined', recheck: '180d', usedBy: 'corpus/knowledge/mined.md' }),
        makeRow({ id: 'S003', source: 'Community — https://example.test/community', kind: 'community', tier: 'C', status: 'rejected', teaches: 'REJECTED: out of scope; flip: a supported versioned source appears.' }),
      ],
    };
  }
  return null;
}

function awkValue(program, path) {
  const result = spawnSync('awk', ['-F|', program, path], { encoding: 'utf8' });
  if (result.error || result.status !== 0) return null;
  return result.stdout.trim();
}

function parityCheck(output, registry) {
  const rowProgram = '/^\\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\\|/ { n++ } END { print n+0 }';
  const tierProgram = '/^\\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\\|/ { t=$5; gsub(/[[:space:]]/,"",t); n[t]++ } END { for(k in n) printf "%s=%d ", k, n[k]; print "" }';
  const awkRows = awkValue(rowProgram, registry);
  const awkTiersText = awkValue(tierProgram, registry);
  const summary = /SOURCES_GATE verdict=clean rows=(\d+) tiers=([^ ]+)/.exec(output);
  if (!summary || awkRows === null || awkTiersText === null) return false;
  const gateTiers = Object.fromEntries(summary[2].split(',').map(cell => cell.split(':')));
  const awkTiers = Object.fromEntries(awkTiersText.split(/\s+/).filter(Boolean).map(cell => cell.split('=')));
  const equalCounts = (left, right) => JSON.stringify(Object.entries(left).sort()) === JSON.stringify(Object.entries(right).sort());
  return Number(summary[1]) === Number(awkRows)
    && Number(awkRows) === 3
    && equalCounts(gateTiers, awkTiers)
    && equalCounts(gateTiers, { A: '1', B: '1', C: '1' });
}

function selfTest() {
  let temporary = null;
  let completed = 0;
  let failed = 0;
  try {
    temporary = mkdtempSync(join(tmpdir(), 'tabi-sources-selftest-'));
    for (const test of selfTestCases) {
      const root = join(temporary, test.name);
      const registry = join(root, defaultFile);
      mkdirSync(join(root, 'corpus'), { recursive: true });
      const fixture = fixtureFor(test.name, root);
      if (test.name === 'symlinked-registry') {
        writeFileSync(join(root, 'corpus/real.md'), fixtureText([makeRow()]));
        symlinkSync('real.md', registry);
      } else if (test.name === 'non-regular-registry') {
        mkdirSync(registry);
      } else if (test.name !== 'missing-file') {
        if (!fixture) throw new Error(`unknown self-test case: ${test.name}`);
        writeFileSync(registry, fixtureText(fixture.rows, fixture.omitSection, fixture.extra, fixture.trailing));
      }
      const args = ['--root', root, '--file', defaultFile];
      if (fixture?.since) args.push('--since', fixture.since);
      const result = spawnSync(process.execPath, [script, ...args], { cwd: root, encoding: 'utf8' });
      const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
      const actualExit = result.status ?? -1;
      const hasFinding = test.finding === 'none'
        ? !/^FINDING id=/m.test(output)
        : new RegExp(`^FINDING id=${test.finding}(?: |$)${test.detail ? `.* detail=${test.detail}$` : ''}`, 'm').test(output);
      const parity = test.name !== 'clean' || parityCheck(output, registry);
      const pass = !result.error && actualExit === test.exit && hasFinding && parity;
      completed++;
      if (!pass) failed++;
      console.log(`SELFTEST name=${test.name} expected_exit=${test.exit} actual_exit=${actualExit} expected_finding=${test.finding} result=${pass ? 'PASS' : 'FAIL'}`);
    }
  } catch (error) {
    failed++;
    console.error(`SELFTEST setup_error=${safeField(error.message)}`);
  } finally {
    if (temporary !== null) rmSync(temporary, { recursive: true, force: true });
  }
  const verdict = failed === 0 && completed === selfTestCases.length ? 'clean' : 'failed';
  console.log(`SOURCES_SELFTEST verdict=${verdict} cases=${completed}`);
  return verdict === 'clean' ? 0 : 1;
}

function run(options) {
  let fileLabel = options.file || defaultFile;
  try {
    const root = canonicalRoot(options.root);
    const absolute = registryPath(root, options.file);
    fileLabel = relative(root, absolute) || options.file;
    const text = readRegistry(absolute);
    const result = evaluate(text, root, options.since);
    printResult(result, fileLabel);
    return result.exit;
  } catch (error) {
    printUnavailable(fileLabel, error.gateDetail ?? 'could_not_evaluate');
    return 2;
  }
}

let options;
try {
  options = parseArguments(process.argv.slice(2));
} catch (error) {
  printUnavailable(defaultFile, error.gateDetail ?? 'bad_arguments');
  process.exitCode = 2;
}
if (options?.selfTest) process.exitCode = selfTest();
else if (options) process.exitCode = run(options);
