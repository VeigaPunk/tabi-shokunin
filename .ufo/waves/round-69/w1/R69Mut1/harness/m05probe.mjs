import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
const S = '/fast/scratch/hyaku/tabi-r69/R69Mut1';
const W = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-69/w1/R69Mut1';
const run = (counter) => {
  const p = spawnSync(process.execPath, [counter, '--province', S + '/m0/quote-off-line.md', '--snapshot', S + '/m0/snapshot.tsv', '--fleet', S + '/m0/fleet', '--json'], { encoding: 'utf8' });
  const j = JSON.parse(p.stdout);
  return { counter, exit: p.status, rows: j.rows, bound: j.bound, findings: j.findings, lanes: [...new Set(j.findings.map((f) => (f.detail || '').split(':')[0]))] };
};
const out = { fixture: 'm0/quote-off-line.md (battery quote-off-line forgery: mori cite moved one line)', pristine: run('/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-sibling-matrix-r69.mjs'), mutant: run(S + '/m05.mjs') };
fs.writeFileSync(W + '/witnesses/m05-lane-probe.json', JSON.stringify(out, null, 1));
console.log('pristine findings=' + out.pristine.findings.length + ' lanes=' + out.pristine.lanes.join(',') + ' | mutant findings=' + out.mutant.findings.length + ' lanes=' + out.mutant.lanes.length + ' mori=' + out.mutant.lanes.includes('mori'));
