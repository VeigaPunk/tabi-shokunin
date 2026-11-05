#!/usr/bin/env node
// check-instrument-registry-r68.mjs — C2 gate, tabi round 68.
//
// Verifies that SKILL.md carries a round-68 instrument-registry section that
// registers the round-67 instrument generation (the r67 verifier-spotcheck
// routed defect 1): for each expected instrument path, the registry must have
// a row whose path exists in the repo, whose recorded sha256 equals the
// committed blob, whose entry command names the path, and whose verdict map,
// write scope, owner and self-test cells are stated (a live instrument with no
// selftest must say so explicitly).
//
// Exit codes: 0 = clean, 1 = findings, 2 = usage.
// Scratch (selftest fixtures) must be provided via --scratch or inherited
// TMPDIR — the gate never writes to /tmp directly.

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const SECTION = '## Instrument registry — round 68';
// The frozen expectation: the round-67 generation that the r67 spot-check
// found unregistered at the registry home.
const EXPECTED = [
  'scripts/chrome-cdp-loopback-round67.mjs',
  'scripts/verify-live-r67.mjs',
  '.ufo/waves/round-67/counters/chromium-hscroll-r67.mjs',
  '.ufo/waves/round-67/counters/check-receipt-provenance-v4.mjs',
  '.ufo/waves/round-67/counters/make-negatives-r67.mjs',
  '.ufo/waves/round-67/counters/mutate-r67.mjs',
  '.ufo/waves/round-67/counters/png-r67.mjs',
];
const COLUMNS = ['instrument', 'entry', 'verdicts', 'selftest', 'pinned', 'scope', 'owner'];

function sha256File(p) {
  return createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) return null;
    const key = a.slice(2);
    if (key === 'selftest') { args.selftest = true; continue; }
    const val = argv[i + 1];
    if (val === undefined || val.startsWith('--')) return null;
    args[key] = val;
    i++;
  }
  return args;
}

function registryRows(skillText) {
  const lines = skillText.split('\n');
  const start = lines.findIndex((l) => l.trim() === SECTION);
  if (start === -1) return null;
  const rows = [];
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith('## ') && l.trim() !== SECTION) break;
    if (/^\|[^|]*instrument/i.test(l)) continue; // header row
    if (!l.startsWith('|')) continue;
    const cells = l.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length !== COLUMNS.length) continue;
    if (cells.every((c) => /^-+$/.test(c) || c === '')) continue; // separator
    rows.push(cells);
  }
  return rows;
}

function check(skillText, repoRoot, findings, expected = EXPECTED) {
  const rows = registryRows(skillText);
  if (rows === null) {
    findings.push(['registry-section-missing', SECTION]);
    return;
  }
  const byPath = new Map();
  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i];
    const inst = cells[0].replace(/`/g, '');
    if (byPath.has(inst)) findings.push(['duplicate-row', String(i + 1)]);
    byPath.set(inst, { cells, line: i + 1 });
  }
  for (const p of expected) {
    const row = byPath.get(p);
    if (!row) { findings.push(['row-missing', p]); continue; }
    const [inst, entry, verdicts, selftest, pinned, scope, owner] = row.cells;
    const abs = path.join(repoRoot, p);
    if (!fs.existsSync(abs)) { findings.push(['path-missing', p]); continue; }
    const shaInRow = (pinned.match(/[0-9a-f]{64}/) || [])[0];
    if (!shaInRow) findings.push(['sha-unstated', p]);
    else if (shaInRow !== sha256File(abs)) findings.push(['sha-mismatch', p]);
    if (!entry || !entry.includes(p)) findings.push(['entry-unbound', p]);
    if (!verdicts || verdicts === '—') findings.push(['field-missing', p + ':verdicts']);
    if (!scope || scope === '—') findings.push(['field-missing', p + ':scope']);
    if (!owner || owner === '—') findings.push(['field-missing', p + ':owner']);
    const selfOk = selftest && selftest !== '—' && /--self-?test/.test(selftest);
    if (!selfOk) findings.push(['selftest-unstated', p]);
  }
}

function emit(findings) {
  const byCheck = {};
  for (const [t] of findings) byCheck[t] = (byCheck[t] || 0) + 1;
  const ok = findings.length === 0;
  process.stdout.write(JSON.stringify({
    ok, findings: findings.map(([t, d]) => t + ': ' + d), byCheck,
    expected: EXPECTED.length, gate: 'check-instrument-registry-r68',
  }) + '\n');
  process.exit(ok ? 0 : 1);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args || !args.skill) { usage('missing --skill'); }
  const repoRoot = args.repo || process.cwd();
  const buf = fs.readFileSync(args.skill);
  const findings = [];
  check(buf.toString('utf8'), repoRoot, findings);
  emit(findings);
}

function usage(msg) {
  process.stderr.write('usage: node check-instrument-registry-r68.mjs --skill SKILL.md [--repo .] --json | --selftest --scratch <dir>\n' + (msg ? 'error: ' + msg + '\n' : ''));
  process.exit(2);
}

function selftest(scratch) {
  if (!scratch) usage('selftest needs --scratch');
  fs.rmSync(scratch, { recursive: true, force: true });
  fs.mkdirSync(scratch, { recursive: true });
  const inst = path.join(scratch, 'tool.mjs');
  fs.writeFileSync(inst, 'console.log(1)\n');
  const sha = sha256File(inst);
  const row = (cells) => '| ' + cells.join(' | ') + ' |';
  const section = (rows) => SECTION + '\n\n| ' + COLUMNS.join(' | ') + ' |\n|---' + COLUMNS.map(() => '---').join('|') + '|\n' + rows.join('\n') + '\n';
  const green = section([
    row(['`tool.mjs`', 'node tool.mjs --run', '0 ok; 1 findings', 'node tool.mjs --selftest', 'sha256 ' + sha + '; staged evidence/e.json', 'scratch + evidence dir', 'tabi']),
  ]);
  const cases = [
    { name: 'green', text: green, exit: 0, tokens: [] },
    { name: 'section-missing', text: 'no section here', exit: 1, tokens: ['registry-section-missing'] },
    {
      name: 'row-missing',
      text: section([row(['`other.mjs`', 'node other.mjs', '0 ok; 1 findings', 'node other.mjs --selftest', 'sha256 ' + sha, 'scratch', 'tabi'])]),
      exit: 1, tokens: ['row-missing'],
    },
    {
      name: 'sha-mismatch',
      text: section([row(['`tool.mjs`', 'node tool.mjs --run', '0 ok; 1 findings', 'node tool.mjs --selftest', 'sha256 ' + 'f'.repeat(64), 'scratch', 'tabi'])]),
      exit: 1, tokens: ['sha-mismatch'],
    },
    {
      name: 'entry-unbound',
      text: section([row(['`tool.mjs`', 'node other.mjs --run', '0 ok; 1 findings', 'node tool.mjs --selftest', 'sha256 ' + sha, 'scratch', 'tabi'])]),
      exit: 1, tokens: ['entry-unbound'],
    },
    {
      name: 'field-missing',
      text: section([row(['`tool.mjs`', 'node tool.mjs --run', '0 ok; 1 findings', 'node tool.mjs --selftest', 'sha256 ' + sha, 'scratch', '—'])]),
      exit: 1, tokens: ['field-missing'],
    },
    {
      name: 'selftest-unstated',
      text: section([row(['`tool.mjs`', 'node tool.mjs --run', '0 ok; 1 findings', '—', 'sha256 ' + sha, 'scratch', 'tabi'])]),
      exit: 1, tokens: ['selftest-unstated'],
    },
  ];
  let failed = 0;
  const results = [];
  for (const c of cases) {
    const findings = [];
    check(c.text, scratch, findings, ['tool.mjs']);
    const byCheck = {};
    for (const [k] of findings) byCheck[k] = (byCheck[k] || 0) + 1;
    const observed = findings.length === 0 ? 0 : 1;
    const tokOk = c.tokens.every((k) => byCheck[k]);
    if (observed !== c.exit || !tokOk) failed++;
    results.push({ name: c.name, expected: c.exit, observed, tokens: byCheck });
  }
  const clean = failed === 0;
  console.log(JSON.stringify({ verdict: clean ? 'clean' : 'failed', cases: cases.length, failed, results }));
  process.exit(clean ? 0 : 1);
}

const args = parseArgs(process.argv.slice(2));
if (args && args.selftest) selftest(args.scratch);
else main();
