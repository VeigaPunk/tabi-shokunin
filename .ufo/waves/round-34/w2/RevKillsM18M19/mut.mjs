// Applies one frozen mutant (verbatim find/replace from c2-gate-mutants.mjs MUTANTS)
// to a gate copy. Refuses if find text does not occur exactly once.
import { readFileSync, writeFileSync } from 'node:fs';
const [, , id, gatePath] = process.argv;
const M = {
  M18: {
    find: 'out.clean = !out.entryFinding && out.population >= 1 && out.admitted >= 1 && out.failing === 0;',
    replace: 'out.clean = !out.entryFinding && out.population >= 1 && out.admitted >= 0 && out.failing === 0;'
  },
  M19: {
    find: 'if (!receiptFinding && new Set(sids).size !== sids.length) receiptFinding = `sessionId repeated across runs: ${sids.join(", ")}`;',
    replace: '// sessionId distinctness disabled (mutant)'
  }
};
const m = M[id];
if (!m) { console.error(`unknown mutant ${id}`); process.exit(9); }
const t = readFileSync(gatePath, 'utf8');
const n = t.split(m.find).length - 1;
if (n !== 1) { console.error(`${id} occurrences=${n} (counter requires exactly 1)`); process.exit(9); }
writeFileSync(gatePath, t.replace(m.find, m.replace));
console.log(`${id} applied: occurrences=1`);
