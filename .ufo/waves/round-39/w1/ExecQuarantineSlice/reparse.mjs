// Round-39 seat ExecQuarantineSlice — independent (non-awk) re-parse of the same register
// with the round-22 hand-check parser semantics, minus any network fetch.
// Purpose: confirm the awk slice (38 rows / ids) is not an artifact of the awk predicate.
import { readFileSync } from 'node:fs';

const REGISTER = '/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md';
const lines = readFileSync(REGISTER, 'utf8').split('\n');
const rows = [];
for (const line of lines) {
  if (!line.startsWith('|')) continue;
  const cells = line.split('|').map((c) => c.trim());
  if (cells.length < 6) continue;          // skip 2-col summary rows like | `tabi` | 37 |
  if (cells[1] !== '`tabi`') continue;
  if (!/^round\d+$/.test(cells[2])) continue;
  const rawId = /S\d+/.exec(cells[3]);
  if (!rawId) continue;
  const clsCell = cells[4].replace(/`/g, '');
  const cls = /^(payload-absent|unreachable)$/.test(clsCell) ? clsCell : 'unreachable';
  rows.push({ round: cells[2], id: rawId[0], cls, source: cells[5] });
}
const byCls = rows.reduce((a, r) => { a[r.cls] = (a[r.cls] || 0) + 1; return a; }, {});
const ids = rows.map((r) => r.id);
console.log(JSON.stringify({
  rows: rows.length,
  byClass: byCls,
  ids: ids.join(' '),
  duplicateIds: ids.filter((v, i) => ids.indexOf(v) !== i),
  everyRowHasSId: rows.every((r) => /^S\d+$/.test(r.id)),
  byRound: rows.reduce((a, r) => { a[r.round] = (a[r.round] || 0) + 1; return a; }, {}),
}, null, 2));
