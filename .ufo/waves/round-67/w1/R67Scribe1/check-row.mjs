#!/usr/bin/env node
// check-row.mjs — per-row gate for corpus/SOURCES.md, contract v1 (kaika, frozen 2026-10-19).
// Read-only: never writes the registry. Refuses a candidate row before it is appended.
//
//   node check-row.mjs --registry <file> [--root <dir>] [--ignore-line <n>] [<row>]
//       <row> from argv (joined by spaces) or stdin. Exit 0 pass, 1 refused, 2 cannot evaluate.
//   node check-row.mjs --registry <file> [--root <dir>] --bulk
//       checks every row of the registry's ## Registry table; a row's own line is excluded
//       from its id and URL collision scans.
//   node check-row.mjs --registry <file> --self-test --scratch <absolute dir>
//       seeds defects into scratch copies and proves each one is refused with its reason.
//
// --root defaults to the directory two levels above the registry (<root>/corpus/SOURCES.md).
// Used-by paths are resolved against --root and must exist, stay inside it, and cite the row id.

import { mkdirSync, readFileSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(import.meta.url);
const KINDS = new Set(['spec', 'docs', 'paper', 'code', 'tool', 'dataset', 'talk', 'book', 'community', 'own-work']);
const TIERS = new Set(['A', 'B', 'C']);
const STATUSES = new Set(['queued', 'mined', 'rejected']);
const CELLS = ['id', 'source', 'kind', 'tier', 'scope', 'anchor', 'teaches', 'status', 'opened', 'recheck', 'used-by'];
const DASH = '—';
const ID_CELL = /^S[0-9]{3,}$/;
const ROW_START = /^ {0,3}\|/;
const ID_ROW = /^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/;
// Placeholder sentinel: `{{FILL: ...}}` (or `<FILL ...>`). No registry row uses it; plain angle brackets
// and words such as TBD are legitimate row content (e.g. `refs/replace/<object>`, "is TBD in the proposal").
const PLACEHOLDER = /\{\{[^{}]*\}\}|<(?:FILL|TODO)\b[^<>]*>/;

class Refusal extends Error {}

function isIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [year, month, day] = match.slice(1).map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function inside(root, candidate) {
  const rel = relative(root, candidate);
  return rel === '' || (rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
}

// Same normaliser as scripts/check-sources.mjs, so duplicate-URL verdicts agree with the structural gate.
function normalizeUrl(source) {
  const match = /(https?:\/\/[^ |]+)/i.exec(source);
  if (!match) return '';
  const value = match[0].replace(/#[^ ]*$/, '').replace(/\/$/, '').replace(/^[A-Za-z]+:\/\//, '').replace(/^www\./i, '');
  const slash = value.indexOf('/');
  if (slash < 0) return value.toLowerCase();
  return `${value.slice(0, slash).toLowerCase()}${value.slice(slash)}`;
}

function loadRegistry(file, root) {
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    throw new Refusal('registry_unreadable');
  }
  let realRoot;
  try {
    realRoot = realpathSync(root);
  } catch {
    throw new Refusal('root_unavailable');
  }
  const idRows = [];
  const registryLines = [];
  let section = null;
  text.split('\n').map(line => line.replace(/\r$/, '')).forEach((line, index) => {
    const number = index + 1;
    if (/^## /.test(line)) section = line.trim();
    const idMatch = ID_ROW.exec(line);
    if (idMatch) {
      const fields = line.split('|');
      const wellFormed = fields.length === 13;
      idRows.push({
        line: number,
        numeric: Number(idMatch[1].slice(1)),
        url: wellFormed ? normalizeUrl(fields[2]) : '',
        teaches: wellFormed ? fields[7].trim() : '',
      });
    }
    if (section === '## Registry' && ROW_START.test(line)) registryLines.push({ line: number, text: line });
  });
  return { file, root, realRoot, idRows, registryLines };
}

// Returns [reason, detail] for a bad used-by path, or null when it is a real file that cites the row.
function checkUsedBy(reg, path, id) {
  if (path === '') return ['used_by_syntax', 'empty_path'];
  if (path === DASH) return ['used_by_syntax', 'dash_inside_list'];
  if (path.includes('\\') || path.includes('\0') || isAbsolute(path) || /^[A-Za-z]:/.test(path)) {
    return ['used_by_escape', 'not_repo_relative'];
  }
  if (path.split('/').includes('..')) return ['used_by_escape', 'dotdot_segment'];
  let real;
  try {
    real = realpathSync(resolve(reg.root, path));
  } catch {
    return ['used_by_missing', 'path_missing'];
  }
  if (!inside(reg.realRoot, real)) return ['used_by_escape', 'resolves_outside_root'];
  try {
    if (!statSync(real).isFile()) return ['used_by_missing', 'not_a_regular_file'];
  } catch {
    return ['used_by_missing', 'path_missing'];
  }
  if (id === null) return null;
  let body;
  try {
    body = readFileSync(real, 'utf8');
  } catch {
    return ['used_by_unreadable', 'read_failed'];
  }
  return new RegExp(`(?<![A-Za-z0-9])${id}(?![0-9])`).test(body) ? null : ['used_by_uncited', 'row_id_absent'];
}

// Checks one candidate row. `ignoreLine` is the registry line the row occupies, if any, so a row
// is never reported as colliding with itself.
function checkRow(raw, reg, ignoreLine) {
  const findings = [];
  const add = (reason, cell, detail) => findings.push({ reason, cell, detail });
  if (/[\r\n]/.test(raw)) {
    add('malformed_row', '-', 'multiple_lines');
    return { id: '-', findings };
  }
  if (raw.includes('\\|')) add('escaped_pipe', '-', 'backslash_pipe_in_row');
  const fields = raw.split('|');
  if (fields.length !== 13) {
    add('malformed_row', '-', `fields=${fields.length}_expected_13`);
    return { id: '-', findings };
  }
  if (!/^ {0,3}$/.test(fields[0])) add('malformed_row', '-', 'leading_text');
  if (!/^[ \t]*$/.test(fields[12])) add('malformed_row', '-', 'trailing_text');
  const cells = fields.slice(1, 12).map(cell => cell.trim());
  const [id, source, kind, tier, , anchor, teaches, status, opened, recheck, usedBy] = cells;
  const idOk = ID_CELL.test(id);
  const shownId = idOk ? id : '-';

  CELLS.forEach((name, index) => {
    if (cells[index] === '') add('empty_cell', name, `${name}_empty`);
    else if (PLACEHOLDER.test(cells[index])) add('placeholder_unfilled', name, `${name}_has_placeholder`);
  });

  if (!idOk) {
    add('bad_id', 'id', 'id_not_S_plus_3_digits');
  } else {
    const numeric = Number(id.slice(1));
    const clash = reg.idRows.find(row => row.line !== ignoreLine && row.numeric === numeric);
    if (clash) add('duplicate_id', 'id', `same_id_as_line_${clash.line}`);
  }
  if (!KINDS.has(kind)) add('bad_kind', 'kind', 'kind_not_in_contract_set');
  if (!TIERS.has(tier)) add('bad_tier', 'tier', 'tier_not_A_B_C');
  else if (tier === 'A' && kind === 'community') add('community_at_tier_A', 'tier', 'community_never_A');
  if (!STATUSES.has(status)) add('bad_status', 'status', 'status_not_in_contract_set');
  if (!isIsoDate(opened)) add('bad_opened', 'opened', 'opened_not_iso_date');
  if (!(isIsoDate(recheck) || /^[1-9][0-9]*d$/.test(recheck) || recheck === 'on-release')) {
    add('bad_recheck', 'recheck', 'recheck_not_iso_NNd_or_on_release');
  }
  if (anchor === DASH) add('bare_anchor', 'anchor', 'anchor_is_dash');
  if (status === 'rejected' && !/(^|\s)REJECTED: .+; flip: \S/.test(teaches)) {
    add('rejected_without_flip', 'teaches', 'rejection_needs_reason_and_flip');
  }

  const url = normalizeUrl(source);
  const supersedes = /^supersedes\s/.test(teaches);
  if (url) {
    const clash = reg.idRows.find(row => row.line !== ignoreLine && row.url === url && !supersedes && !/^supersedes\s/.test(row.teaches));
    if (clash) add('duplicate_url', 'source', `same_url_as_line_${clash.line}`);
  }

  const paths = usedBy === DASH || usedBy === '' ? [] : usedBy.split(',').map(path => path.trim());
  for (const path of paths) {
    const problem = checkUsedBy(reg, path, idOk ? id : null);
    if (problem) add(problem[0], 'used-by', problem[1]);
  }
  if (status === 'mined' && paths.every(path => path === DASH)) {
    add('mined_without_used_by', 'used-by', 'mined_needs_a_citing_path');
  }
  return { id: shownId, findings };
}

function emit(findings, id, line) {
  for (const finding of findings) {
    console.log(`FINDING line=${line} id=${id} reason=${finding.reason} cell=${finding.cell} detail=${finding.detail}`);
  }
}

function readRowFromStdin() {
  try {
    return readFileSync(0, 'utf8').replace(/\r?\n$/, '');
  } catch {
    throw new Refusal('no_row_supplied');
  }
}

function runCandidate(reg, label, options) {
  const raw = options.positional.length > 0 ? options.positional.join(' ') : readRowFromStdin();
  const { id, findings } = checkRow(raw, reg, options.ignoreLine);
  emit(findings, id, '-');
  const verdict = findings.length === 0 ? 'pass' : 'refused';
  console.log(`ROW_CHECK verdict=${verdict} id=${id} findings=${findings.length} registry=${label}`);
  return findings.length === 0 ? 0 : 1;
}

function runBulk(reg, label) {
  const rows = reg.registryLines.filter(({ text }) => {
    const first = (text.split('|')[1] ?? '').trim();
    return first.toLowerCase() !== 'id' && !/^:?-{3,}:?$/.test(first);
  });
  if (rows.length === 0) {
    console.log(`BULK_CHECK verdict=could-not-evaluate reason=no_registry_rows registry=${label}`);
    return 2;
  }
  let failed = 0;
  const reasons = new Map();
  for (const { line, text } of rows) {
    const { id, findings } = checkRow(text, reg, line);
    if (findings.length > 0) failed++;
    for (const finding of findings) reasons.set(finding.reason, (reasons.get(finding.reason) ?? 0) + 1);
    emit(findings, id, line);
  }
  const summary = [...reasons].sort().map(([reason, count]) => `${reason}:${count}`).join(',') || 'none';
  console.log(`BULK_CHECK verdict=${failed === 0 ? 'clean' : 'failed'} rows=${rows.length} failed=${failed} reasons=${summary} registry=${label}`);
  return failed === 0 ? 0 : 1;
}

// ---- self-test ----------------------------------------------------------------------------------

const VALID = {
  id: 'S172',
  source: 'Fixture guide — https://example.test/fixture-guide',
  kind: 'docs',
  tier: 'A',
  scope: 'fixture scope: the heading-level claim only',
  anchor: '§Fixture heading @ rev 2026-11-05',
  teaches: 'A bounded learning outcome about the fixture.',
  status: 'mined',
  opened: '2026-11-05',
  recheck: '180d',
  usedBy: 'corpus/knowledge/fixture-citing.md',
};

function rowOf(overrides = {}) {
  const value = { ...VALID, ...overrides };
  return `| ${[value.id, value.source, value.kind, value.tier, value.scope, value.anchor, value.teaches, value.status, value.opened, value.recheck, value.usedBy].join(' | ')} |`;
}

function selfTestCases(s001Line, s001Url) {
  const dupLine = s001Line + 1;
  return [
    { name: 'valid-mined', row: rowOf(), expect: 'pass' },
    { name: 'valid-queued-no-used-by', row: rowOf({ status: 'queued', usedBy: DASH }), expect: 'pass' },
    { name: 'valid-rejected', row: rowOf({ status: 'rejected', usedBy: DASH, teaches: 'REJECTED: out of scope; flip: a versioned source appears.' }), expect: 'pass' },
    { name: 'valid-supersedes-same-url', row: rowOf({ source: `Fixture correction — ${s001Url}`, teaches: 'supersedes S001 — corrected anchor for the same source.' }), expect: 'pass' },
    { name: 'indented-duplicate-id', row: `   ${rowOf({ id: 'S001' })}`, expect: 'refused', reason: 'duplicate_id' },
    { name: 'indented-duplicate-id-in-registry', bulk: true, mutate: text => insertAfter(text, s001Line, `   ${lineOf(text, s001Line)}`), expect: 'refused', reason: 'duplicate_id', line: dupLine },
    { name: 'leading-zero-duplicate-id', row: rowOf({ id: 'S0001' }), expect: 'refused', reason: 'duplicate_id' },
    { name: 'escaped-pipe', row: rowOf({ teaches: 'A bounded \\| outcome.' }), expect: 'refused', reason: 'escaped_pipe' },
    { name: 'escaped-pipe-nf-preserving', row: '| S172 | Fixture guide — https://example.test/fixture-guide | docs | A | scope \\| x anchor §Fixture heading @ rev 2026-11-05 | A bounded outcome. | mined | 2026-11-05 | 180d | corpus/knowledge/fixture-citing.md |', expect: 'refused', reason: 'escaped_pipe' },
    { name: 'invalid-tier', row: rowOf({ tier: 'D' }), expect: 'refused', reason: 'bad_tier' },
    { name: 'community-tier-A', row: rowOf({ kind: 'community', tier: 'A' }), expect: 'refused', reason: 'community_at_tier_A' },
    { name: 'bad-kind', row: rowOf({ kind: 'blog' }), expect: 'refused', reason: 'bad_kind' },
    { name: 'bad-status', row: rowOf({ status: 'pending' }), expect: 'refused', reason: 'bad_status' },
    { name: 'bad-opened', row: rowOf({ opened: '2026-02-30' }), expect: 'refused', reason: 'bad_opened' },
    { name: 'bad-recheck', row: rowOf({ recheck: 'soon' }), expect: 'refused', reason: 'bad_recheck' },
    { name: 'bad-recheck-zero-days', row: rowOf({ recheck: '0d' }), expect: 'refused', reason: 'bad_recheck' },
    { name: 'bad-id-too-short', row: rowOf({ id: 'S17' }), expect: 'refused', reason: 'bad_id' },
    { name: 'extra-cell', row: rowOf().replace(/ \|$/, ' | extra |'), expect: 'refused', reason: 'malformed_row' },
    { name: 'used-by-absolute', row: rowOf({ usedBy: '/etc/passwd' }), expect: 'refused', reason: 'used_by_escape' },
    { name: 'used-by-dotdot', row: rowOf({ usedBy: '../outside.md' }), expect: 'refused', reason: 'used_by_escape' },
    { name: 'used-by-symlink-escape', row: rowOf({ usedBy: 'corpus/knowledge/escape-link.md' }), expect: 'refused', reason: 'used_by_escape' },
    { name: 'used-by-missing', row: rowOf({ usedBy: 'corpus/knowledge/missing.md' }), expect: 'refused', reason: 'used_by_missing' },
    { name: 'used-by-uncited', row: rowOf({ usedBy: 'corpus/knowledge/uncited.md' }), expect: 'refused', reason: 'used_by_uncited' },
    { name: 'mined-without-used-by', row: rowOf({ usedBy: DASH }), expect: 'refused', reason: 'mined_without_used_by' },
    { name: 'rejected-without-flip', row: rowOf({ status: 'rejected', usedBy: DASH, teaches: 'not useful' }), expect: 'refused', reason: 'rejected_without_flip' },
    { name: 'placeholder-teaches', row: rowOf({ teaches: '{{FILL: one grounded learner benefit}}' }), expect: 'refused', reason: 'placeholder_unfilled' },
    { name: 'legit-angle-brackets-pass', row: rowOf({ teaches: 'Reads `refs/replace/<object>` and `--shuffle <seed>` as literal text.' }), expect: 'pass' },
    { name: 'empty-anchor', row: rowOf({ anchor: '' }), expect: 'refused', reason: 'empty_cell' },
    { name: 'dash-anchor', row: rowOf({ anchor: DASH }), expect: 'refused', reason: 'bare_anchor' },
    { name: 'duplicate-url', row: rowOf({ source: `Copy — ${s001Url}` }), expect: 'refused', reason: 'duplicate_url' },
  ];
}

function lineOf(text, number) {
  return text.split('\n')[number - 1];
}

function insertAfter(text, number, inserted) {
  const lines = text.split('\n');
  lines.splice(number, 0, inserted);
  return lines.join('\n');
}

function runChild(args) {
  const result = spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });
  return { exit: result.status ?? -1, output: `${result.stdout ?? ''}${result.stderr ?? ''}` };
}

function runSelfTest(options, file, reg) {
  if (!options.scratch || !isAbsolute(options.scratch)) throw new Refusal('scratch_must_be_absolute');
  const base = join(options.scratch, 'check-row-selftest');
  rmSync(base, { recursive: true, force: true });
  mkdirSync(base, { recursive: true });
  const registryText = readFileSync(file, 'utf8');
  const s001Line = reg.idRows.find(row => row.numeric === 1)?.line;
  const s001Text = s001Line ? lineOf(registryText.replace(/\r/g, ''), s001Line) : null;
  const s001Url = s001Text ? /https?:\/\/[^ |]+/.exec(s001Text.split('|')[2])?.[0] : undefined;
  if (!s001Line || !s001Url) throw new Refusal('selftest_needs_registry_row_S001');
  let passed = 0;
  let total = 0;
  for (const test of selfTestCases(s001Line, s001Url)) {
    total++;
    const root = join(base, test.name);
    const corpus = join(root, 'corpus');
    mkdirSync(join(corpus, 'knowledge'), { recursive: true });
    writeFileSync(join(corpus, 'knowledge', 'fixture-citing.md'), 'Fixture entry: cites S172 for the heading claim.\n');
    writeFileSync(join(corpus, 'knowledge', 'uncited.md'), 'Fixture entry: cites nothing from the registry.\n');
    writeFileSync(join(base, 'outside.md'), 'Outside the root. Cites S172.\n');
    symlinkSync(join(base, 'outside.md'), join(corpus, 'knowledge', 'escape-link.md'));
    const registry = join(corpus, 'SOURCES.md');
    writeFileSync(registry, test.mutate ? test.mutate(registryText) : registryText);
    const args = ['--registry', registry, '--root', test.bulk ? reg.realRoot : root, ...(test.bulk ? ['--bulk'] : [test.row])];
    const { exit, output } = runChild(args);
    const findings = output.split('\n').filter(line => line.startsWith('FINDING '));
    const expectedExit = test.expect === 'pass' ? 0 : 1;
    const reasonHit = test.expect === 'pass'
      ? findings.length === 0
      : findings.some(line => line.includes(` reason=${test.reason} `) && (test.line === undefined || line.includes(`line=${test.line} `)));
    const ok = exit === expectedExit && reasonHit;
    if (ok) passed++;
    const observed = findings.map(line => /reason=(\S+)/.exec(line)?.[1]).filter(Boolean).join('+') || 'none';
    console.log(`SELFTEST name=${test.name} expect=${test.expect}${test.reason ? `:${test.reason}` : ''} exit=${exit} observed=${observed} result=${ok ? 'PASS' : 'FAIL'}`);
  }
  rmSync(base, { recursive: true, force: true });
  const verdict = passed === total ? 'clean' : 'failed';
  console.log(`CHECK_ROW_SELFTEST verdict=${verdict} passed=${passed} cases=${total}`);
  return verdict === 'clean' ? 0 : 1;
}

// ---- entry --------------------------------------------------------------------------------------

function parseArguments(argv) {
  const options = { registry: null, root: null, ignoreLine: 0, bulk: false, selfTest: false, scratch: null, positional: [] };
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === '--bulk') options.bulk = true;
    else if (arg === '--self-test') options.selfTest = true;
    else if (['--registry', '--root', '--ignore-line', '--scratch'].includes(arg)) {
      const value = argv[++index];
      if (value === undefined || value.startsWith('--')) throw new Refusal('bad_arguments');
      if (arg === '--registry') options.registry = value;
      else if (arg === '--root') options.root = value;
      else if (arg === '--scratch') options.scratch = value;
      else {
        if (!/^[0-9]+$/.test(value)) throw new Refusal('bad_arguments');
        options.ignoreLine = Number(value);
      }
    } else if (arg.startsWith('--')) {
      throw new Refusal('bad_arguments');
    } else {
      options.positional.push(arg);
    }
  }
  return options;
}

function main(argv) {
  const options = parseArguments(argv);
  if (!options.registry) throw new Refusal('registry_required');
  const file = resolve(options.registry);
  const root = options.root ? resolve(options.root) : dirname(dirname(file));
  const reg = loadRegistry(file, root);
  const label = relative(reg.realRoot, file) || file;
  if (options.selfTest) return runSelfTest(options, file, reg);
  if (options.bulk) return runBulk(reg, label);
  return runCandidate(reg, label, options);
}

try {
  process.exitCode = main(process.argv.slice(2));
} catch (error) {
  const reason = error instanceof Refusal ? error.message : 'could_not_evaluate';
  console.log(`ROW_CHECK verdict=could-not-evaluate reason=${reason}`);
  process.exitCode = 2;
}
