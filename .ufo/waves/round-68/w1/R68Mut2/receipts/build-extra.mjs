// build-extra.mjs — extra public-parser fixtures for C2 mutant coverage.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const OUT = '/fast/scratch/hyaku/tabi-r68/R68Mut2/fx';
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
const section = (rows, header = SECTION) =>
  header + '\n\n| ' + COLUMNS.join(' | ') + ' |\n|---' + COLUMNS.map(() => '---').join('|') + '|\n' + rows.join('\n') + '\n';
const shas = Object.fromEntries(EXPECTED.map((p) => [p, sha256File(path.join(LANE, p))]));
const good = (p, o = {}) => {
  const c = {
    instrument: '`' + p + '`',
    entry: 'node ' + p + ' --run',
    verdicts: '0 ok; 1 findings',
    selftest: 'node ' + p + ' --selftest',
    pinned: 'sha256 ' + shas[p] + '; staged evidence/e.json',
    scope: 'scratch + evidence dir',
    owner: 'tabi',
    ...o,
  };
  return row([c.instrument, c.entry, c.verdicts, c.selftest, c.pinned, c.scope, c.owner]);
};
const base = () => EXPECTED.map((p) => good(p));
const V = EXPECTED[1]; // verify-live-r67.mjs
const C = EXPECTED[0]; // chrome-cdp-loopback-round67.mjs
const files = {};

// entry-binding survivor: verify-live entry names a DIFFERENT dir with same basename.
{
  const rows = base();
  rows[1] = good(V, { entry: 'node tools/verify-live-r67.mjs --run' });
  files['fixture-entry2.md'] = section(rows);
}
// owner-only missing.
{
  const rows = base();
  rows[1] = good(V, { owner: '—' });
  files['fixture-owner.md'] = section(rows);
}
// section terminator: a following '## ' section containing a bogus duplicate row.
{
  const txt = section(base()) + '\n## Other section\n\n' +
    '| ' + COLUMNS.join(' | ') + ' |\n|---|---|---|---|---|---|---|\n' +
    good(V).replace(shas[V], 'f'.repeat(64)) + '\n';
  files['fixture-tail.md'] = txt;
}
// duplicate row, correct data (pristine: duplicate-row; mutant: silent).
{
  const rows = base();
  rows.push(good(V));
  files['fixture-dup.md'] = section(rows);
}
// section heading with ASCII hyphen instead of em dash (pristine: section missing).
{
  files['fixture-hyphen.md'] = section(base(), '## Instrument registry - round 68');
}
// explicit dash-prefixed selftest reason (pristine: accepted; mutant: rejected).
{
  const rows = base();
  rows[1] = good(V, { selftest: '— explicit: no selftest (r68 decision)' });
  files['fixture-explicit.md'] = section(rows);
}
// green baseline with explicit owner-scope variations is already fixture7.

for (const [name, text] of Object.entries(files)) {
  fs.writeFileSync(path.join(OUT, name), text);
  console.log(name, sha256File(path.join(OUT, name)));
}
