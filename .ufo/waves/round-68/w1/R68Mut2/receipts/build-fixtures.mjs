// build-fixtures.mjs — R68Mut2 public-probe fixtures for C2 gate mutants.
// Reads lane instrument files READ-ONLY for sha256; writes fixtures under fx/.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const OUT = '/fast/scratch/hyaku/tabi-r68/R68Mut2/fx';
fs.mkdirSync(OUT, { recursive: true });

const SECTION = '## Instrument registry \u2014 round 68';
const COLUMNS = ['instrument', 'entry', 'verdicts', 'selftest', 'pinned', 'scope', 'owner'];
const EXPECTED = [
  'scripts/chrome-cdp-loopback-round67.mjs',
  'scripts/verify-live-r67.mjs',
  '.ufo/waves/round-67/counters/chromium-hscroll-r67.mjs',
  '.ufo/waves/round-67/counters/check-receipt-provenance-v4.mjs',
  '.ufo/waves/round-67/counters/make-negatives-r67.mjs',
  '.ufo/waves/round-67/counters/mutate-r67.mjs',
  '.ufo/waves/round-67/counters/png-r67.mjs',
];
const sha256File = (p) => createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const row = (cells) => '| ' + cells.join(' | ') + ' |';
const section = (rows) =>
  SECTION + '\n\n| ' + COLUMNS.join(' | ') + ' |\n|---' + COLUMNS.map(() => '---').join('|') + '|\n' + rows.join('\n') + '\n';

const goodRow = (p, sha) => row([
  '`' + p + '`',
  'node ' + p + ' --run',
  '0 ok; 1 findings',
  'node ' + p + ' --selftest',
  'sha256 ' + sha + '; staged evidence/e.json',
  'scratch + evidence dir',
  'tabi',
]);

const shas = {};
for (const p of EXPECTED) shas[p] = sha256File(path.join(LANE, p));

// fixture7: fully green 7-row registry (public baseline must be ok:true rc 0).
const fixture7 = section(EXPECTED.map((p) => goodRow(p, shas[p])));

// fixture-bad7: same but verify-live-r67.mjs pinned sha is wrong (pristine must rc 1 sha-mismatch).
const bad = EXPECTED.map((p) => goodRow(p, shas[p]));
bad[1] = row([
  '`' + EXPECTED[1] + '`', 'node ' + EXPECTED[1] + ' --run', '0 ok; 1 findings',
  'node ' + EXPECTED[1] + ' --selftest', 'sha256 ' + 'f'.repeat(64) + '; staged evidence/e.json',
  'scratch + evidence dir', 'tabi',
]);
const fixtureBad7 = section(bad);

// fixture-prefix: verify-live-r67.mjs pinned as 8-hex short pin (pristine rc 1 sha-unstated).
const pref = EXPECTED.map((p) => goodRow(p, shas[p]));
pref[1] = row([
  '`' + EXPECTED[1] + '`', 'node ' + EXPECTED[1] + ' --run', '0 ok; 1 findings',
  'node ' + EXPECTED[1] + ' --selftest', 'sha256 ' + shas[EXPECTED[1]].slice(0, 8) + ' (short pin)',
  'scratch + evidence dir', 'tabi',
]);
const fixturePrefix = section(pref);

// fixture-mv: chromium-hscroll-r67.mjs scope '—', mutate-r67.mjs verdicts '—'
// (pristine rc 1 field-missing x2; scope-drop mutant kills one, verdicts-drop mutant the other).
const mv = EXPECTED.map((p) => goodRow(p, shas[p]));
mv[2] = row([
  '`' + EXPECTED[2] + '`', 'node ' + EXPECTED[2] + ' --run', '0 ok; 1 findings',
  'node ' + EXPECTED[2] + ' --selftest', 'sha256 ' + shas[EXPECTED[2]],
  '\u2014', 'tabi',
]);
mv[5] = row([
  '`' + EXPECTED[5] + '`', 'node ' + EXPECTED[5] + ' --run', '\u2014',
  'node ' + EXPECTED[5] + ' --selftest', 'sha256 ' + shas[EXPECTED[5]],
  'scratch', 'tabi',
]);
const fixtureMv = section(mv);

const files = {
  'fixture7.md': fixture7,
  'fixture-bad7.md': fixtureBad7,
  'fixture-prefix.md': fixturePrefix,
  'fixture-mv.md': fixtureMv,
};
for (const [name, text] of Object.entries(files)) {
  fs.writeFileSync(path.join(OUT, name), text);
  console.log(name, createHash('sha256').update(text).digest('hex'));
}
console.log('lane-shas', JSON.stringify(shas));
