// compare.mjs — compare each run's control summaries against the committed
// baseline receipts. KILL iff any recorded field differs on >= 1 control.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url));
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const BASE = join(LANE, '.ufo/waves/round-33/baseline');
const NAME = { 'J1-do-nothing': 'c1-J1-do-nothing', 'J2-screen-all': 'c1-J2-screen-all', 'J3-junk-rows': 'c1-J3-junk-rows', 'J4-mislabel-unnamed': 'c1-J4-mislabel-unnamed' };
const committed = {};
for (const [mine, theirs] of Object.entries(NAME)) {
  const j = JSON.parse(readFileSync(join(BASE, `${theirs}.json`), 'utf8'));
  const prov = readFileSync(join(BASE, `${theirs}.provenance`), 'utf8');
  committed[mine] = {
    exit: Number(prov.match(/^exit=(\d+)$/m)[1]),
    tree: prov.match(/^rev=\S+ tree=(\S+)/m)[1],
    predicate: j.predicate,
    candidates: j.candidates, mapped: j.mapped, screened: j.screened,
    unaccounted: j.unaccounted, newMapped: j.newMapped,
    adjacencyVerdict: j.adjacency.verdict, adjacencyFindings: j.adjacency.findings,
    screenFindings: j.screenFindings.length,
  };
}
function runOne(tag, dir) {
  const got = JSON.parse(readFileSync(join(HERE, 'results', dir, 'summary.json'), 'utf8'));
  const diffs = {};
  let predicateFlip = null;
  for (const r of got) {
    const c = committed[r.name];
    const d = Object.keys(c).filter((k) => k !== 'tree' && String(r[k]) !== String(c[k]));
    if (d.length) diffs[r.name] = d.map((k) => `${k}: ${c[k]}->${r[k]}`);
    if (String(r.predicate) !== String(c.predicate)) predicateFlip = r.name;
  }
  // J3 cites siblings' live refs/heads/master (controls.mjs construction); those
  // moved after the committed run (reflog evidence) -> its tree is time-dependent.
  // All scored fields must still match exactly; J1/J2/J4 trees must match exactly.
  const treeOk = got.every((r) => r.tree === committed[r.name].tree || r.name === 'J3-junk-rows');
  const j3TreeDrift = got.some((r) => r.name === 'J3-junk-rows' && r.tree !== committed['J3-junk-rows'].tree);
  return { tag, killed: Object.keys(diffs).length > 0, predicateFlip, diffs, treeOk, j3TreeDrift };
}
const mode = process.argv[2];
if (mode === 'one') {
  const [tag, dir] = process.argv.slice(3);
  console.log(JSON.stringify(runOne(tag, dir), null, 1));
} else {
  const { readdirSync, statSync } = await import('node:fs');
  const out = readdirSync(join(HERE, 'results')).filter((d) => statSync(join(HERE, 'results', d)).isDirectory() && d !== 'PRISTINE').sort().map((d) => runOne(d, d));
  const pr = runOne('PRISTINE', 'PRISTINE');
  console.log(JSON.stringify({ pristineReproduction: { exact: !pr.killed, diffs: pr.diffs }, mutants: out }, null, 1));
}
