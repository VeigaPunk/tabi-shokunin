import fs from 'node:fs';
const S = process.env.S;
const lane = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const cat = JSON.parse(fs.readFileSync(`${S}/clone/scripts/gate-mutants.json`, 'utf8'));
const src = {
  'scripts/check-s106-evidence.mjs': fs.readFileSync(`${S}/clone/scripts/check-s106-evidence.mjs`, 'utf8'),
  'scripts/check-release-pins.mjs': fs.readFileSync(`${S}/clone/scripts/check-release-pins.mjs`, 'utf8'),
};
const mutc3 = fs.readFileSync(`${lane}/.ufo/waves/round-29/w1/MutC3.md`, 'utf8');
const mutc1 = fs.readFileSync(`${lane}/.ufo/waves/round-29/w1/MutC1Baseline.md`, 'utf8');

let bad = 0;
const rows = cat.mutants;
console.log(`catalogue rows: ${rows.length}`);
const ids = new Set();
for (const r of rows) {
  if (ids.has(r.id)) { console.log(`DUP id ${r.id}`); bad++; }
  ids.add(r.id);
  if (!['fault', 'benign'].includes(r.kind)) { console.log(`${r.id}: bad kind ${r.kind}`); bad++; }
  const bytes = src[r.script];
  if (bytes === undefined) { console.log(`${r.id}: unknown script ${r.script}`); bad++; continue; }
  const n = bytes.split(r.find).length - 1;
  if (n !== 1) { console.log(`${r.id}: find occurrences=${n}`); bad++; }
  if (r.find === r.replace) { console.log(`${r.id}: replace == find`); bad++; }
}
console.log(`occurrence-check bad=${bad}`);

// expected id sets derived from round-29 reports
const expectedFault = [
  's106-sha-drop','s106-sha-true','s106-anchor-unique-drop','s106-anchor-unique-true',
  's106-byte-count-drop','s106-byte-count-true','s106-revision-drop','s106-revision-true',
  's106-anchor-located-true',
  'pins-f1-old-tag','pins-f2-path-binding','pins-f2-path-traversal','pins-f3-bytes-path',
  'pins-f3-bytes-sha','pins-f3-bytes-absent','pins-f4-range-bounds','pins-f4-anchor-token',
  'pins-f5-digest','pins-f6-refetch-seat','pins-f6-refetch-sha','pins-f6-refetch-all',
  'pins-s1-supersession-prefix','pins-s1-supersession-tag','pins-notfound-status',
  'pins-notfound-body','pins-population-on-release','pins-population-tag-compare',
];
const expectedBenign = [
  's106-valid-reorder','s106-sha-eq-swap','s106-anchor-unique-eq-swap','s106-byte-count-eq-swap',
  's106-revision-eq-swap','s106-anchor-located-eq',
  'pins-f1-old-tag-eq','pins-f2-path-traversal-eq','pins-f3-bytes-absent-eq','pins-f4-eq-reorder',
  'pins-s1-prefix-eq','pins-s1-tag-eq','pins-notfound-eq-reorder',
];
const catFault = rows.filter(r => r.kind === 'fault').map(r => r.id);
const catBenign = rows.filter(r => r.kind === 'benign').map(r => r.id);
const setEq = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
console.log(`fault ids match expected(27): ${setEq(catFault, expectedFault)} (${catFault.length})`);
console.log(`benign ids match expected(13): ${setEq(catBenign, expectedBenign)} (${catBenign.length})`);

// cross-check pins rows against MutC3.md table text (raw and pipe-escaped variants)
console.log('--- MutC3.md string presence (find/replace) ---');
for (const r of rows.filter(x => x.script.endsWith('check-release-pins.mjs') && x.kind === 'fault')) {
  const hit = (s) => mutc3.includes(s) ? 'raw' : (mutc3.includes(s.replace(/\|/g, '\\|')) ? 'escaped' : 'ABSENT');
  const f = hit(r.find), rp = r.replace === '' ? 'REMOVED' : hit(r.replace);
  console.log(`${r.id}: find=${f} replace=${rp}`);
}
console.log('--- MutC1Baseline.md string presence (s106 force-true replaces + finds) ---');
for (const r of rows.filter(x => x.script.endsWith('check-s106-evidence.mjs') && x.kind === 'fault')) {
  console.log(`${r.id}: find-in-md=${mutc1.includes(r.find)} replace-in-md=${mutc1.includes(r.replace)}`);
}
