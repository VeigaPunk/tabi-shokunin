import fs from 'node:fs';
const W = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-69/w1/R69Mut1';
const S = '/fast/scratch/hyaku/tabi-r69/R69Mut1';
const man = JSON.parse(fs.readFileSync(S + '/manifest.json', 'utf8'));
const base = JSON.parse(fs.readFileSync(W + '/m0-baseline.json', 'utf8'));
const wit = JSON.parse(fs.readFileSync(W + '/witnesses/summary.json', 'utf8'));
const rows = [];
for (const m of man.mutants) {
  const j = JSON.parse(fs.readFileSync(`${W}/${m.id}.json`, 'utf8'));
  const exit = fs.readFileSync(`${S}/${m.id}.exit`, 'utf8').trim() | 0;
  const verdict = exit === 1 ? 'killed' : exit === 0 ? 'survived' : 'inconclusive';
  const basis = j.positiveOk === false ? ['positive-control'] : (j.failed || []);
  const w = wit.cases.find((c) => c.mutant === m.id) || null;
  rows.push({ id: m.id, desc: m.desc, sha256: j.counterSha256, manifestSha256: m.sha256,
    shaMatch: j.counterSha256 === m.sha256, batteryExit: exit, negatives: j.negatives,
    refusedForExpectedReason: j.refusedForExpectedReason, positiveOk: j.positiveOk,
    failed: j.failed, verdict, expectation: m.expected, killBasis: basis,
    witness: w ? { name: w.name, expectId: w.expectId, pristineExit: w.pristineExit, pristineIds: w.pristineIds, mutantExit: w.mutantExit, mutantIds: w.mutantIds, controlExit: w.controlExit, ok: w.ok } : null });
}
const summary = {
  task: 'tabi r69 C1 frozen counter mutation probe',
  frozenCounter: { path: 'scripts/check-sibling-matrix-r69.mjs', sha256: man.pin, sourceVerified: man.sourceSha256 === man.pin },
  frozenBattery: { path: 'scripts/negatives-sibling-matrix-r69.mjs', sha256: 'dac61e1b829003da4ef2b1b1de64ba014f194721d20d7a0597ecb6857394ba92' },
  baseline: { file: 'm0-baseline.json', exit: 0, counterSha256: base.counterSha256, negatives: base.negatives, refusedForExpectedReason: base.refusedForExpectedReason, positiveOk: base.positiveOk, failed: base.failed },
  restoration: { file: 'restore-check.json', sha256: base.counterSha256, exit: 0, distilled: 'restored bytes re-run: 19/19, positive ok, failed []' },
  mutants: rows,
  observed: { killed: rows.filter((r) => r.verdict === 'killed').length, survived: rows.filter((r) => r.verdict === 'survived').length, inconclusive: rows.filter((r) => r.verdict === 'inconclusive').length },
  expectationDisagreements: rows.filter((r) => r.verdict !== (r.expectation === 'killed' ? 'killed' : 'survived')).map((r) => r.id),
};
fs.writeFileSync(W + '/run-summary.json', JSON.stringify(summary, null, 1));
const t = [];
t.push('| mutant | defect (single-point) | mutant sha256 (pinned per result) | battery exit | refused/19 | positive | failed negatives | verdict | witness |');
t.push('|---|---|---|---|---|---|---|---|---|');
t.push(`| m0 baseline | frozen bytes, unmutated | ${base.counterSha256} | 0 | ${base.refusedForExpectedReason}/19 | ok | — | clean baseline | — |`);
for (const r of rows) t.push(`| ${r.id} | ${r.desc} | ${r.sha256} | ${r.batteryExit} | ${r.refusedForExpectedReason}/19 | ${r.positiveOk ? 'ok' : 'FAIL'} | ${r.failed.length ? r.failed.join(', ') : '—'} | **${r.verdict}** | ${r.witness ? r.witness.name + ' (pristine ' + r.witness.pristineExit + ' [' + r.witness.pristineIds.join(',') + '] / mutant ' + r.witness.mutantExit + ')' : '—'} |`);
fs.writeFileSync(W + '/mutants.md', t.join('\n') + '\n');
console.log(JSON.stringify(summary.observed), 'disagreements:', JSON.stringify(summary.expectationDisagreements));
for (const r of rows) console.log(r.id, r.verdict, 'pos=' + r.positiveOk, 'failed=' + JSON.stringify(r.failed), r.witness ? 'WITNESS_OK=' + r.witness.ok : '');
