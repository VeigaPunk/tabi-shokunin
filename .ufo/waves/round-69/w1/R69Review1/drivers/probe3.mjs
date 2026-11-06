import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
const SNAP = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-69/c1/sibling-heads-r69.tsv';
const FLEET = '/home/vgpnk/Projects/shokunin';
const COUNTER = '/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-sibling-matrix-r69.mjs';
const W = '/fast/scratch/hyaku/tabi-r69/R69Review1/probes';
const A = fs.readFileSync(W + '/A-base.md', 'utf8');
const prov = fs.readFileSync('/fast/scratch/hyaku/tabi-r69/R69Review1/PROVINCE.base.md', 'utf8');
const mat = A.slice(A.indexOf('## Adjacent'));
const set = (t, lane, rel) => t.replace(new RegExp('(\\| ' + lane + ' \\| )[^|]+(\\|)'), `$1${rel} $2`);
const V = {};
// R1: clean matrix, proper outbound, control
V['R1-clean'] = prov + '\n' + mat;
// R2: audio named ONLY in Refuses para 2 (after blank line), audio row none -> expect outbound-relation-none; blank-line truncation predicts GREEN
V['R2-para2-only'] = prov.replace('**Out of province', 'Second paragraph of routing: audio owns nothing here.\n\n**Out of province') .replace(/(\*\*Refuses:\*\*[\s\S]*?)(\n\n)/, (m, a, b) => a + b + 'Continued: audio routes sibling work to its own lane.\n\n') + '\n' + set(mat, 'audio', 'none');
// R3: contradicting second matrix section appended after first valid one (counter reads first only)
V['R3-second-section-contradicts'] = prov + '\n' + mat + '\n\n## Adjacent — sibling matrix (appendix)\n\n' + mat.split('\n').slice(2).join('\n').replace(/\| kotoba \| adjacent/, '| kotoba | none');
// R4: fenced matrix (not rendered table) still parsed
V['R4-fenced'] = prov + '\n```\n' + mat + '\n```\n';
// R5: CRLF endings
V['R5-crlf'] = (prov + '\n' + mat).replace(/\n/g, '\r\n');
// R6: contradiction — kotoba row says adjacent; kotoba's own PROVINCE.md:76 says `| tabi | none |`
V['R6-kotoba-contradiction'] = prov + '\n' + mat;
// R7: 'tabi side' vacuous
V['R7-vacuous-side'] = (prov + '\n' + mat).replace(/\| tabi holds no audio ground \|/, '| — — — — |');
// R8: heading suffix
V['R8-heading-suffix'] = (prov + '\n' + mat).replace('## Adjacent — sibling matrix\n', '## Adjacent — sibling matrix-extra\n');
// R9: arbitrary contested for lore (no contested text in lore's PROVINCE)
V['R9-arbitrary-contested'] = prov + '\n' + set(mat, 'lore', 'contested');
// R10: kotoba contradicting its own relation — counter reads kotoba:76 `none` but tabi says adjacent; same as R6; also check kotoba relation 'none' passes when kotoba mentions tabi as none? (inbound-relation-none fires -> wrong-direction check)
V['R10-kotoba-none-vs-adjacent'] = prov + '\n' + set(mat, 'kotoba', 'none');

for (const [name, text] of Object.entries(V)) {
  const f = W + '/' + name + '.md';
  fs.writeFileSync(f, text);
  const p = spawnSync(process.execPath, [COUNTER, '--province', f, '--snapshot', SNAP, '--fleet', FLEET, '--json'], { encoding: 'utf8', maxBuffer: 256 << 20 });
  let j = null; try { j = JSON.parse(p.stdout); } catch { j = { raw: (p.stdout + p.stderr).slice(0, 300) }; }
  console.log(name, 'exit=' + p.status, 'bound=' + (j.bound ?? '?'), 'ids=' + JSON.stringify(j.findings ? j.findings.map((x) => x.id) : j.raw));
}
