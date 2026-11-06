#!/usr/bin/env node
// Predicate C2-EXEC-BOUND evaluator, tabi round 71 (frozen with the claims).
// Usage: node evaluate-c2.mjs --summary <attack-harness summary.json> [--json]
// C2-EXEC-BOUND holds for a summary iff ALL of:
//   (1) verifier is verify-live-r71.mjs (the generation under claim);
//   (2) every attack landed (notLanded 0) and the two positives P-tap and P-scroll exit 0;
//   (3) FALSE-PASS count is 0;
//   (4) every attack's class is in its frozen allowed set, and every REFUSED row carries its
//       frozen expected finding id:
//         A-env-tap, A-env-scroll  REFUSED with env-injection
//         B-swap-tap               HONEST-PASS (the swapped lane file is never executed)
//         C-swap-run-b-tap         REFUSED with snapshot-mutated
// Exit 0 holds; 1 does not hold; 2 usage.
import fs from 'node:fs';

const argv = process.argv.slice(2);
const i = argv.indexOf('--summary');
let s = null;
try { s = JSON.parse(fs.readFileSync(argv[i + 1], 'utf8')); } catch { console.error('usage: --summary <summary.json>'); process.exit(2); }
const ALLOWED = {
  'P-tap': { classes: ['HONEST-PASS'], expect: null },
  'P-scroll': { classes: ['HONEST-PASS'], expect: null },
  'A-env-tap': { classes: ['REFUSED'], expect: 'env-injection' },
  'A-env-scroll': { classes: ['REFUSED'], expect: 'env-injection' },
  'B-swap-tap': { classes: ['HONEST-PASS'], expect: null },
  'C-swap-run-b-tap': { classes: ['REFUSED'], expect: 'snapshot-mutated' },
};
const rows = Array.isArray(s.rows) ? s.rows : [];
const reasons = [];
if (s.verifier !== 'verify-live-r71.mjs') reasons.push('verifier ' + s.verifier + ' is not the generation under claim');
for (const id of Object.keys(ALLOWED)) {
  const r = rows.find((x) => x.attack === id);
  if (!r) { reasons.push(id + ' missing'); continue; }
  const a = ALLOWED[id];
  if (!a.classes.includes(r.class)) reasons.push(id + ' class ' + r.class + ' not in ' + a.classes.join('|'));
  if (a.expect && !(Array.isArray(r.findings) && r.findings.includes(a.expect))) reasons.push(id + ' findings ' + JSON.stringify(r.findings) + ' lack ' + a.expect);
}
const falsePass = rows.filter((x) => x.class === 'FALSE-PASS').length;
const notLanded = rows.filter((x) => x.class === 'NOT-LANDED').length;
if (falsePass) reasons.push('false passes ' + falsePass);
if (notLanded) reasons.push('attacks not landed ' + notLanded);
if (!rows.filter((x) => x.kind === 'positive').every((x) => x.exit === 0)) reasons.push('a positive did not exit 0');
const holds = reasons.length === 0;
const o = { schema: 'tabi-r71-c2-evaluator', predicate: 'C2-EXEC-BOUND', verifier: s.verifier, falsePass, notLanded, classes: rows.map((x) => x.attack + ':' + x.class), holds, reasons };
console.log(argv.includes('--json') ? JSON.stringify(o, null, 1) : `C2-EXEC-BOUND holds=${holds} falsePass=${falsePass} notLanded=${notLanded}` + reasons.map((x) => '\n  ' + x).join(''));
process.exit(holds ? 0 : 1);
