#!/usr/bin/env node
// attack-driver.mjs — R68Review2 attack battery over check-instrument-registry-r68.mjs.
// Per case: repo tree = copies of the seven EXPECTED instrument files + SKILL.md variant.
// The gate checks ExpectED paths against the repo tree it is pointed at with --repo.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const GATE = '/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-instrument-registry-r68.mjs';
const REPO = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const ROOT = '/fast/scratch/hyaku/tabi-r68/R68Review2/wk';
const SCRATCH = path.join(ROOT, 'scratch');
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

// copy real instrument bytes so sha pins bind to real content
for (const rel of EXPECTED) {
  const from = path.join(REPO, rel);
  fs.mkdirSync(path.dirname(path.join(SCRATCH, 'base', rel)), { recursive: true });
  fs.copyFileSync(from, path.join(SCRATCH, 'base', rel));
}
const SHAS = {};
for (const rel of EXPECTED) SHAS[rel] = createHash('sha256').update(fs.readFileSync(path.join(SCRATCH, 'base', rel))).digest('hex');

const row = (c) => '| ' + c.join(' | ') + ' |';
const table = (rows) => SECTION + '\n\n| ' + COLUMNS.join(' | ') + ' |\n|---|---|---|---|---|---|---|\n' + rows.join('\n') + '\n';

function cell(over = {}) {
  return [
    over.inst ?? '`' + EXPECTED[6] + '`',
    over.entry ?? 'node ' + EXPECTED[6] + ' --run among other counters',
    over.verdicts ?? '0 ok; 1 findings',
    over.selftest ?? 'node ' + EXPECTED[6] + ' --selftest',
    over.pinned ?? 'sha256 ' + SHAS[EXPECTED[6]],
    over.scope ?? 'scratch',
    over.owner ?? 'tabi',
  ];
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

const PNG = '.ufo/waves/round-67/counters/png-r67.mjs';
const VER = 'scripts/verify-live-r67.mjs';
const cases = [];
const add = (name, text, expectGreen, note) => cases.push({ name, text, expectGreen, note });

/* A. baseline */
add('A00-single-green-row', table([row(cell())]), true);
/* A2 baseline: two DIFFERENT rows, both green — the do-nothing-adjacent base that the
   duplicate-row check is supposed to reject only if it repeats the same path. */
add('A02-two-distinct-green-rows', table([row(cell()), row(cell({ inst: '`' + VER + '`', entry: 'node ' + VER + ' --run among other drivers', selftest: 'node ' + VER + ' --selftest', pinned: 'sha256 ' + SHAS[VER], scope: 'scratch', owner: 'tabi' }))]), true);

/* B. malformed cells — silent-skip probes (doc says "cells.length !== 7 → continue") */
add('B01-8-cells-extra-cell', table([row([...cell(), 'extra'])]), false, 'extra cell silently skips row; no finding names it');
add('B02-6-cells-one-missing', table([row(cell().slice(0, 6))]), false, 'missing scope → 6 cells, row skipped');
add('B03-no-leading-pipe-hyphen-middle', SECTION + '\n\n' + cell(cell0()).map((x) => x));
function cell0() { return cell(); }
add('B03-no-leading-pipe', SECTION + '\n\n' + cell().join(' | ') + '\n', false, 'no leading pipe → skipped');
add('B04-12-cells-two-rows-merged', table([[...cell(), ...cell()].join(' | ')]), false, 'two merged rows = 14 cells, skipped — could hide two real rows');
add('B05-row-with-inner-pipe-in-cell', table([row(['<' + PNG + '> no', 'node ' + PNG, '0 ok', 'node ' + PNG + ' --selftest', 'sha256 ' + SHAS[PNG], 'scratch', 'tabi'])]), false, 'sharp-cell extra pipe cell misshapen');

function redCase(name, text, note) { add(name, text, false, note); }
function greenCase(name, text, note) { add(name, text, true, note); }

/* duplicates */
add('C01-exact-duplicate-row', table([row(cell()), row(cell())]), false, 'exact duplicate fires duplicate-row');
add('C02-duplicate-different-case-path', table([row(cell()), row(cell({ inst: '`' + PNG.toUpperCase().replace(/(PNG)/i, (m) => m) + '`' }).map((x, i) => i === 0 ? '`' + PNG.replace('.ufo', '.UFO') + '`' : x))]), false, 'case-variant duplicate ALSO fires duplicate-row? probe');
add('C03-duplicate-path-trailing-slash', table([row(cell()), row(cell({ inst: '`' + PNG + '/`' }))]), false, 'trailing-slash variant same path prefix');
add('C04-duplicate-12-and-7-malformed-first', table([row([...cell(), ...cell()]), row(cell())]), false, 'malformed 14-cell row first then valid: duplicate-row silent + skipped');

/* sha probes */
const SP = SHAS[PNG];
add('D01-sha-substring-64-in-longer-hex', redCase, null);
cases.pop();
add('D01-sha-substring-64-in-longer-hex', table([row(cell({ pinned: 'sha256 ' + SP.slice(28) + SP.slice(0, 28) + SP }))]), false, 'two 64-hex substrings inside one long hex; regex finds FIRST (its own wrong juxtaposition? ) — probe');
add('D02-sha-wrong-value', table([row(cell({ pinned: 'sha256 ' + 'f'.repeat(64) }))]), false, 'plain wrong sha');
add('D03-sha-prefix-40hex-only', table([row(cell({ pinned: 'pin ' + SP.slice(0, 40) }))]), false, '40-hex prefix only — deterministic regex {64} rejects; probe');
add('D04-sha-with-valid-match-and-strap', table([row(cell({ pinned: 'sha256 ' + SP + '; pinned at r67 counters; verdict map as scored' }))]), true, 'extra context words allowed — is that over-strict?');
add('D05-sha-tampered-char', table([row(cell({ pinned: 'sha256 ' + ((SP[10] === 'a') ? SP.slice(0, 10) + 'b' + SP.slice(11) : SP.slice(0, 10) + 'a' + SP.slice(11)) }))]), false, 'one hex char tampered — sha-mismatch');
add('D06-sha-in-wrong-cell', table([row(cell({ verdicts: 'sha256 ' + SP, pinned: '0 ok; 1 findings' }))]), false, 'sha in verdicts cell, verdict text in pinned cell — sha regex only scans pinned → sha-unstated?');
add('D07-sha-uppercase', table([row(cell({ pinned: 'sha256 ' + SP.toUpperCase() }))]), false, 'uppercase hex');

/* entry probes */
add('E01-entry-substring-exploit-XXpathYY', table([row(cell({ entry: 'run XX' + PNG + 'YY.d finally' }))]), false, 'substring with injected neighbors: still contains path — is containment all that is required?');
add('E02-entry-shows-other-path', table([row(cell({ entry: 'node scripts/other.mjs --run' }))]), false, 'entry names different path');
add('E03-entry-empty', table([row(cell({ entry: '' }))]), false, 'empty entry');
add('E04-entry-dashonly', table([row(cell({ entry: '—' }))]), false, '— entry');

/* field probes */
add('F01-verdicts-dash', table([row(cell({ verdicts: '—' }))]), false, 'em-dash verdicts');
add('F02-scope-dash', table([row(cell({ scope: '—' }))]), false);
add('F03-owner-dash', table([row(cell({ owner: '—' }))]), false);
add('F04-owner-empty', table([row(cell({ owner: '' }))]), false);
add('F05-verdicts-ok-absent-but-maps-agree-token', table([row(cell({ verdicts: 'ok' }))]), true, 'weak "ok" verdict map accepted — gate only checks non-empty');

/* selftest probes */
add('G01-selftest-unhyphenated-omits-selftest', table([row(cell({ selftest: 'spelled --selftest anywhere in notes' }))]), true, 'word-only string accepted as "stated"');
add('G02-selftest-hyphen-instead-of-unhyphen', table([row(cell({ selftest: 'node tool --self-test' }))]), false, '--self-test (hyphenated) not accepted');
add('G03-selftest-claim-without-command', table([row(cell({ selftest: 'has {"selftest":"--selftest"} but no CLI spelling' }))]), true, 'token only, no command path');
add('G04-selftest-stdio-note', table([row(cell({ selftest: '"--selftest" as resolvable evidence-pointer, no command' }))]), true, 'memory-only pointer');

/* section probes */
add('H01-section-absent', '## Other section\n' + table([row(cell())]), false);
add('H02-section-header-first-line-fenced', '```\n## Instrument registry — round 68\n```\n' + table([row(cell())]), true, 'section header inside code fence still found?');
add('H03-section-header-differs-by-space', '## Instrument registry — round 68  \n(invisible trailing spaces)\n' + table([row(cell())]), true, 'trailing whitespace line still matches?');
add('H04-section-header-emdash-vs-hyphen', '## Instrument registry - round 68\n' + table([row(cell())]), false, 'hyphen instead of em-dash: header not found');

/* 7-path coverage probes */
add('I01-only-png-row', table([row(cell())]), false, 'one row of seven — six row-missing');
add('I02-all-seven-green', table(EXPECTED.map((rel, i) => row(cell({
  inst: '`' + rel + '`',
  entry: 'node ' + rel + ' --run',
  selftest: 'node ' + rel + ' --selftest',
  pinned: 'sha256 ' + SHAS[rel],
})))), true, 'all seven rows green');
add('I03-all-seven-no-queries', table(EXPECTED.map((rel) => row(cell({
  inst: '***NO-INSTRUMENT-NAME*** ' + rel,
  entry: 'node ' + rel + ' --run',
  selftest: 'node ' + rel + ' --selftest',
  pinned: 'sha256 ' + SHAS[rel],
})))), true, 'non-instrument cells string-matched by path still accepted?');
add('I04-six-green-one-entry-unbound', table(EXPECTED.map((rel, i) => row(cell({
  inst: '`' + rel + '`',
  entry: (i === 3 ? 'node scripts/wrong-entry.mjs' : 'node ' + rel + ' --run'),
  selftest: 'node ' + rel + ' --selftest',
  pinned: 'sha256 ' + SHAS[rel],
})))), false, 'one mismatched entry — one entry-unbound plus six green');

/* ROUTED-DEFECT probe: SKILL.md has an r64-only registry elsewhere; the r68 section
   must still gate. And failure to register r64 rows is explicitly in scope of the
   defect wording ("Register the r67 rows or supersede the r64 rows") — the gate has
   no instrument for the r64 rows, i.e. superseding is NOT checked. */
add('J01-r64-rows-only', '## Gate — instrument registry (r64 gen; superseded rows retained)\n\n| instrument | entry | verdicts | selftest | pinned | scope | owner |\n|---|---|---|---|---|---|---|\n| `chrome-cdp-loopback-round64.mjs` | node chrome-cdp-loopback-round64.mjs --run | 0 ok; 1 findings | --selftest | sha256 ' + SP + ' | scratch | tabi |\n' + table([row(cell())]), true, 'r64 stale rows retained in a DIFFERENT section and no supersede: gate green — is that a calibration count?');

/* runner */
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
  try { parsed = JSON.parse(out); } catch { /* keep null */ }
  results.push({ name: c.name, expectGreen: c.expectGreen, note: c.note, rc, parsed });
}
const greenFired = results.filter((r) => r.expectGreen && r.rc !== 0);
const redMissed = results.filter((r) => !r.expectGreen && r.rc === 0);
console.log(JSON.stringify({
  attack: 'instrument-registry-r68',
  producer: 'R68Review2 attack-driver.mjs',
  gatescript: 'scripts/check-instrument-registry-r68.mjs',
  cases: results.length,
  defectCount: greenFired.length + redMissed.length,
  greenFired: greenFired.map((r) => r.name),
  redMissed: redMissed.map((r) => r.name),
  results,
}, null, 2));
