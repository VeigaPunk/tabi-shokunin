// Scratch probe: exercise the pure verify() core of B0 and each mutant with candidate
// kill cases for the survivors. Read-only over the scratch copies.
import { pathToFileURL } from 'node:url';

const D = '/fast/scratch/hyaku/tabi-r65/R65MutTester1';
const ids = ['B0', 'M3', 'M5', 'M7', 'M8'];
const mods = {};
for (const id of ids) mods[id] = await import(pathToFileURL(`${D}/mut/${id}.mjs`).href);

const L = (cell, disp, lane = 'lane-x') => ['line', lane, cell, '-', '-', '-', 'quote', disp, '-'];
const probes = {
  // P1: three rows, first-seen disposition is the minority. Forward: 2 findings. Reversed (M8): 1.
  P1_count_minority_first: [L('f.md:1', 'contested-open'), L('f.md:1', 'overlap-declared'), L('f.md:1', 'overlap-declared')],
  // P2: detail text names first-seen then later disposition. Reversed (M8) swaps them.
  P2_detail_order: [L('f.md:1', 'no-tabi-ground'), L('f.md:1', 'contested-open')],
  // P3: same file, DIFFERENT lines, different disposition: must be accepted. M3 (lane+relPath key) refuses it.
  P3_cross_line_green: [L('f.md:1', 'overlap-declared'), L('f.md:2', 'contested-open')],
  // P4: same line, same disposition duplicate: must be accepted (selftest covers this; probe for M5 cross-check)
  P4_same_disp_dup_green: [L('f.md:1', 'overlap-declared'), L('f.md:1', 'overlap-declared')],
};

const conflictsOf = (mod, rows) => {
  const { findings } = mod.verify({ mapRows: [], auditRows: [], deltaRows: rows, roster: [], sibRef: () => undefined, headOf: () => null });
  return findings.filter((f) => f.id === 'delta-disposition-conflict').map((f) => f.detail);
};

const table = {};
for (const [name, rows] of Object.entries(probes)) {
  table[name] = {};
  for (const id of ids) table[name][id] = conflictsOf(mods[id], rows);
}
console.log(JSON.stringify(table, null, 1));
