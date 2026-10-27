import { readFileSync } from 'node:fs';
const A = JSON.parse(readFileSync('./ctr-A-landing-frozenpins.json', 'utf8'));
const B = JSON.parse(readFileSync('./ctr-B-livepins.json', 'utf8'));
console.log('=== A (landing rev, frozen pins) ===');
console.log('  predicate:', A.predicate);
console.log('  drift.total', A.drift.total, 'auditCoverage', A.drift.auditCoverage, 'auditFindings', A.drift.auditFindings.length, 'staleFindings', A.drift.staleFindings.length);
console.log('  delta.total', A.delta.total, 'delta.unaccounted', A.delta.unaccounted, 'delta.screenFindings', A.delta.screenFindings.length);
console.log('  completeness.unaccounted', A.completeness.unaccounted);
console.log('\n=== B (same lane content, live-tip delta pins) ===');
console.log('  predicate:', B.predicate);
console.log('  drift.total', B.drift.total, 'auditCoverage', B.drift.auditCoverage, 'auditFindings', B.drift.auditFindings.length, 'staleFindings', B.drift.staleFindings.length);
console.log('  delta.total', B.delta.total, 'delta.unaccounted', B.delta.unaccounted, 'delta.screenFindings', B.delta.screenFindings.length);
console.log('  completeness.unaccounted', B.completeness.unaccounted);
console.log('\n=== B: auditFindings detail ===');
for (const f of B.drift.auditFindings) console.log('  ', JSON.stringify(f));
console.log('\n=== B: staleFindings detail ===');
for (const f of B.drift.staleFindings) console.log('  ', JSON.stringify(f));
console.log('\n=== B: drift.lanesWithDrift (13?) ===');
console.log('  ', JSON.stringify(B.drift.lanesWithDrift));
console.log('\n=== A vs B: which predicate conjuncts differ ===');
const conjs = [
  ['adjacency.verdict==clean', A.adjacency.verdict === 'clean', B.adjacency.verdict === 'clean'],
  ['completeness.unaccounted==0', A.completeness.unaccounted === 0, B.completeness.unaccounted === 0],
  ['drift.total>=1', A.drift.total >= 1, B.drift.total >= 1],
  ['auditCoverage==drift.total', A.drift.auditCoverage === A.drift.total, B.drift.auditCoverage === B.drift.total],
  ['auditFindings==0', A.drift.auditFindings.length === 0, B.drift.auditFindings.length === 0],
  ['staleFindings==0', A.drift.staleFindings.length === 0, B.drift.staleFindings.length === 0],
  ['delta.unaccounted==0', A.delta.unaccounted === 0, B.delta.unaccounted === 0],
  ['delta.screenFindings==0', A.delta.screenFindings.length === 0, B.delta.screenFindings.length === 0],
];
for (const [name, a, b] of conjs) console.log(`  ${a === b ? 'same ' : 'DIFF '} ${name}:  A=${a}  B=${b}`);
console.log('\n=== B: delta screen findings detail ===');
for (const f of B.delta.screenFindings) console.log('  ', JSON.stringify(f));
console.log('  B.delta.unaccountedKeys:', JSON.stringify(B.delta.unaccountedKeys));
