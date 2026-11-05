#!/usr/bin/env node
// attack-driver2.mjs — battery v2: every probe embedded in a FULL seven-row suite.
// A case is green (rc 0) only if the probe defect is genuinely acceptable;
// all other paths keep clean green rows.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const GATE = '/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-instrument-registry-r68.mjs';
const REPO = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const ROOT = '/fast/scratch/hyaku/tabi-r68/R68Review2/wk';
const SCRATCH = path.join(ROOT, 'scratch2');
fs.rmSync(SCRATCH, { recursive: true, force: true });
fs.mkdirSync(SCRATCH, { recursive: true });

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
const SECTION = '## Instrument registry — round 68';

for (const rel of EXPECTED) {
  fs.mkdirSync(path.dirname(path.join(SCRATCH, 'base', rel)), { recursive: true });
  fs.copyFileSync(path.join(REPO, rel), path.join(SCRATCH, 'base', rel));
}
const SHAS = {};
for (const rel of EXPECTED) SHAS[rel] = createHash('sha256').update(fs.readFileSync(path.join(SCRATCH, 'base', rel))).digest('hex');

const row = (c) => '| ' + c.join(' | ') + ' |';
const rowOf = (s) => s; // greenRow already yields a full pipe row string
const table = (rows) => SECTION + '\n\n| ' + COLUMNS.join(' | ') + ' |\n|---|---|---|---|---|---|---|\n' + rows.join('\n') + '\n';

function greenRow(rel, over = {}) {
  return row([
    over.inst ?? '`' + rel + '`',
    over.entry ?? 'node ' + rel + ' --run',
    over.verdicts ?? '0 ok; 1 findings',
    over.selftest ?? 'node ' + rel + ' --selftest',
    over.pinned ?? 'sha256 ' + SHAS[rel],
    over.scope ?? 'scratch',
    over.owner ?? 'tabi',
  ]);
}

// full green suite, with probe row for `probe` replaced by probeRowFactory
function suite(probeRowFactory) {
  return table(EXPECTED.map((rel) => (probeRowFactory ? probeRowFactory(rel) : greenRow(rel))));
}

function caseTree(name, skillText) {
  const d = path.join(SCRATCH, name);
  fs.rmSync(d, { recursive: true, force: true });
  fs.mkdirSync(d, { recursive: true });
  for (const rel of EXPECTED) {
    fs.mkdirSync(path.dirname(path.join(d, rel)), { recursive: true });
    fs.copyFileSync(path.join(SCRATCH, 'base', rel), path.join(d, rel));
  }
  fs.writeFileSync(path.join(d, 'SKILL.md'), skillText);
  return d;
}

const PNG = EXPECTED[6];
const SP = SHAS[PNG];
const cases = [];
const add = (name, text, expectGreen, why) => cases.push({ name, text, expectGreen, why });

add('K00-baseline-all-green', suite(), true, 'reference');

/* --- malformed-cell variants on the png row (row skipped silently) */
add('K01-8-cells-extra', suite((rel) => rel === PNG ? row([...(greenRow(rel).split('|').slice(1, -1).map(s => s.trim())), 'extra']) : greenRow(rel)), false, 'png row 8 cells → skipped silently; row-missing fires but no malformed-cell finding');
add('K02-6-cells', suite((rel) => rel === PNG ? row(greenRow(rel).split('|').slice(1, -1).map(s => s.trim()).slice(0, 6)) : greenRow(rel)), false, 'png row 6 cells → skipped');
add('K03-row-data-word-instrument-first-cell', suite((rel) => rel === PNG ? row(['instrument-lookalike', 'node ' + rel, '0 ok', 'st', 'sha256 ' + SHAS[rel], 'scratch', 'tabi']) : greenRow(rel)), false, 'first cell contains the word instrument → row skipped as header regex');

/* --- duplicate-row evasion variants (full suite + duplicate png variant) */
add('K04-exact-duplicate', suite() + rowOf(greenRow(PNG)), false, 'exact duplicate → duplicate-row fires');
add('K05-duplicate-trailing-slash', suite() + rowOf(greenRow(PNG).replace('`' + PNG + '`', '`' + PNG + '/`')), true, 'trailing-slash variant of duplicate evades duplicate-row detection');
add('K06-duplicate-case-variant', suite() + rowOf(greenRow(PNG).replace('`' + PNG + '`', '`' + PNG.replace('.ufo', '.UFO').replace('png', 'PNG') + '`')), true, 'case-variant duplicate evades duplicate-row detection');
add('K07-duplicate-inline-comment', suite() + rowOf(greenRow(PNG).replace('`' + PNG + '`', '`' + PNG + ' `<!-- dup -->`')), true, 'inline-comment duplicate evades duplicate-row detection');
add('K08-duplicate-nested-table-stale-copy', suite() + '\n\n### notes\n' + rowOf(greenRow(PNG)), true, 'duplicate as bare row after ### heading still inside the ## scan window: check');

/* --- sha rigor */
add('K09-sha-hash-stick', suite((rel) => rel === PNG ? row(['`' + rel + '`', 'node ' + rel, '0 ok; 1 findings', 'node ' + rel + ' --selftest', 'sha256 ' + SP + SP, 'scratch', 'tabi']) : greenRow(rel)), true, 'pin = true sha followed by 64 more hex: FIRST regex match equals true sha → gate accepts ambiguous doubled hash');
add('K10-sha-match-but-file-swapped', suite((rel) => rel === PNG ? row(['`' + rel + '`', 'node ' + rel, '0 ok; 1 findings', 'node ' + rel + ' --selftest', 'sha256 ' + SHAS[EXPECTED[2]], 'scratch', 'tabi']) : greenRow(rel)), false, 'png pinned with chromium-hscroll sha → sha-mismatch');
add('K11-sha-in-entry-cell', suite((rel) => rel === PNG ? row(['`' + rel + '`', 'node ' + rel + ' ---sha256 ' + SP, '0 ok; 1 findings', 'node ' + rel + ' --selftest', 'pin unstated here', 'scratch', 'tabi']) : greenRow(rel)), false, 'sha moved to entry cell → sha-unstated? (regex scans pinned only)');
add('K12-sha-nbsp-following', suite((rel) => rel === PNG ? row(['`' + rel + '`', 'node ' + rel, '0 ok; 1 findings', 'node ' + rel + ' --selftest', 'sha256\u00a0' + SP, 'scratch', 'tabi']) : greenRow(rel)), true, 'NBSP between sha256 and digest: hex run still detectable, and gate accepts');

/* --- entry rigor */
add('K13-entry-contains-path-as-substring', suite((rel) => rel === PNG ? row(['`' + rel + '`', 'run XX' + rel + 'YY.mjs finally', '0 ok; 1 findings', 'node ' + rel + ' --selftest', 'sha256 ' + SHAS[rel], 'scratch', 'tabi']) : greenRow(rel)), true, 'substring containment is the spec binding ("entry command names the path") — accepted;锚 looseness noted');
add('K14-entry-other-tool-path', suite((rel) => rel === PNG ? row(['`' + rel + '`', 'node scripts/other.mjs ' + rel, '0 ok; 1 findings', 'node ' + rel + ' --selftest', 'sha256 ' + SHAS[rel], 'scratch', 'tabi']) : greenRow(rel)), true, 'entry command invokes OTHER tool with path only as argument; containment satisfies gate');

/* --- verdicts / scope / owner looseness */
add('K15-verdicts-single-word-ok', suite((rel) => rel === PNG ? row(['`' + rel + '`', 'node ' + rel, 'ok', 'node ' + rel + ' --selftest', 'sha256 ' + SHAS[rel], 'scratch', 'tabi']) : greenRow(rel)), true, 'verdict map = bare "ok" accepted (spec: verdicts cell must state verdict map incl exit-code map)');

/* --- selftest token-only */
add('K16-selftest-word-only', suite((rel) => rel === PNG ? row(['`' + rel + '`', 'node ' + rel, '0 ok; 1 findings', 'spelled --selftest somewhere in the notes', 'sha256 ' + SHAS[rel], 'scratch', 'tabi']) : greenRow(rel)), true, 'selftest cell: token only, no command or explicit "no selftest" statement — accepted');
add('K17-selftest-hyphenated', suite((rel) => rel === PNG ? row(['`' + rel + '`', 'node ' + rel, '0 ok; 1 findings', 'node ' + rel + ' --self-test', 'sha256 ' + SHAS[rel], 'scratch', 'tabi']) : greenRow(rel)), true, '--self-test (hyphenated) IS accepted by /--self-?test/? probe');

/* --- section shape */
add('K18-section-header-fenced', '```\n' + SECTION + '\n```\n' + suite(), true, 'section header inside code fence still found');
add('K19-section-header-lowercase', suite().replace('Instrument registry', 'Instrument REGISTRY'), true, '??? trailing probe — case-sensitive match expected → row-missing everything?');
add('K20-empty-registry-section', SECTION + '\n\n| ' + COLUMNS.join(' | ') + ' |\n|---|---|---|---|---|---|---|\n', false, 'empty section → seven row-missing');

/* --- stale r64 supersede gap */
add('K21-r64-rows-coexist', '## Instrument registry — round 64 (legacy)\n' + table2() + '\n' + suite(), true, 'r64 stale rows retained in a legacy section; gate has no supersede check — routed defect wording allows either');
function table2() {
  return table([row(['`chrome-cdp-loopback-round64.mjs`', 'node chrome-cdp-loopback-round64.mjs --run', '0 ok; 1 findings', '--selftest', 'sha256 ' + SP, 'scratch', 'tabi'])]);
}

/* --- runner */
const results = [];
for (const c of cases) {
  const dir = caseTree(c.name, c.text);
  let rc, out = '', err = '';
  try {
    out = execFileSync('node', [GATE, '--skill', path.join(dir, 'SKILL.md'), '--repo', dir], { encoding: 'utf8' });
    rc = 0;
  } catch (e) {
    rc = e.status ?? 1;
    out = e.stdout ?? '';
    err = e.stderr ?? '';
  }
  let parsed = null;
  try { parsed = JSON.parse(out); } catch { /* noop */ }
  results.push({ name: c.name, expectGreen: c.expectGreen, why: c.why, rc, parsed });
}
const greenFired = results.filter((r) => r.expectGreen && r.rc !== 0);
const redMissed = results.filter((r) => !r.expectGreen && r.rc === 0);
console.log(JSON.stringify({
  attack: 'instrument-registry-r68/battery-v2',
  producer: 'R68Review2 attack-driver2.mjs',
  cases: results.length,
  defectCount: greenFired.length + redMissed.length,
  greenFired: greenFired.map((r) => ({ name: r.name, rc: r.rc, findings: r.parsed ? r.parsed.findings : null })),
  redMissed: redMissed.map((r) => r.name),
  results,
}, null, 2));
