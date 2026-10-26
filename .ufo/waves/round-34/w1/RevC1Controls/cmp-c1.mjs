// cmp-c1.mjs — deep-compare C1 control receipts: committed (ref) vs fresh rerun (new).
// Volatile-field rule (documented): the `rev` field of J2..J5 is the random sha of a
// control commit created seconds earlier inside a mkdtemp clone — it cannot repeat.
// Everything else (all other JSON fields, provenance counter/sha/tree/repo/exit lines,
// stderr bytes) must match exactly. J1 scores the untouched baseline, so its rev must
// match too (no masking).
import { readFileSync } from 'node:fs';
const [refDir, newDir] = process.argv.slice(2);
const NAMES = ['c1-J1-do-nothing', 'c1-J2-screen-all', 'c1-J3-junk-noncandidate', 'c1-J4-existing-tabi-lines', 'c1-J5-unnamed-sibling-side'];
const BASELINE = '15dfaccb34601c2d221c78501e2befd8998d600c';
let failures = 0;
const isHex40 = (s) => /^[0-9a-f]{40}$/.test(s);

function deepEq(a, b, path, diffs) {
  if (a === b) return;
  if (typeof a !== typeof b || a === null || b === null || Array.isArray(a) !== Array.isArray(b)) { diffs.push(`${path}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`); return; }
  if (typeof a === 'object') {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of [...keys].sort()) {
      if (!(k in a)) diffs.push(`${path}.${k}: absent(ref) != ${JSON.stringify(b[k])}`);
      else if (!(k in b)) diffs.push(`${path}.${k}: ${JSON.stringify(a[k])} != absent(new)`);
      else deepEq(a[k], b[k], `${path}.${k}`, diffs);
    }
    return;
  }
  diffs.push(`${path}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`);
}

function parseProv(text) {
  const o = {};
  // provenance lines pack several key=value tokens per line: rev=<sha> tree=<sha> repo=<s>
  for (const l of text.split('\n')) {
    for (const tok of l.split(/\s+/)) {
      const i = tok.indexOf('=');
      if (i > 0) o[tok.slice(0, i)] = tok.slice(i + 1);
    }
  }
  return o;
}
const baseName = (p) => p.split('/').pop();

for (const n of NAMES) {
  const problems = [];
  const ref = JSON.parse(readFileSync(`${refDir}/${n}.json`, 'utf8'));
  const neo = JSON.parse(readFileSync(`${newDir}/${n}.json`, 'utf8'));
  const maskRev = n !== 'c1-J1-do-nothing';
  if (maskRev) {
    for (const [tag, j] of [['ref', ref], ['new', neo]]) {
      if (!isHex40(j.rev) || j.rev === BASELINE) problems.push(`${tag}.rev ${j.rev} is not a fresh 40-hex control commit`);
    }
    if (ref.baseline !== neo.baseline) problems.push(`baseline differs: ${ref.baseline} vs ${neo.baseline}`);
    delete ref.rev; delete neo.rev;
  }
  const diffs = [];
  deepEq(ref, neo, n, diffs);
  problems.push(...diffs);

  const pr = parseProv(readFileSync(`${refDir}/${n}.provenance`, 'utf8'));
  const pn = parseProv(readFileSync(`${newDir}/${n}.provenance`, 'utf8'));
  // `counter` is LANE.length+1-sliced at write time, so its path prefix is layout-derived;
  // bytes are pinned by counter_sha256 on the same line — compare basename + sha exactly.
  if (baseName(pr.counter) !== baseName(pn.counter)) problems.push(`provenance counter basename: ${pr.counter} != ${pn.counter}`);
  for (const k of ['counter_sha256', 'tree', 'repo', 'exit']) {
    if (pr[k] !== pn[k]) problems.push(`provenance ${k}: ${pr[k]} != ${pn[k]}`);
  }
  if (!maskRev && pr.rev !== pn.rev) problems.push(`provenance rev: ${pr.rev} != ${pn.rev}`);
  if (maskRev && (!isHex40(pn.rev) || pn.rev === BASELINE)) problems.push(`provenance rev(new) ${pn.rev} not a fresh control commit`);

  const seR = readFileSync(`${refDir}/${n}.stderr`, 'utf8');
  const seN = readFileSync(`${newDir}/${n}.stderr`, 'utf8');
  if (seR !== seN) problems.push(`stderr differs: ${JSON.stringify(seR)} vs ${JSON.stringify(seN)}`);

  if (problems.length) { failures += 1; console.log(`DIFF ${n}:`); for (const p of problems) console.log(`  - ${p}`); }
  else console.log(`MATCH ${n} (rev ${maskRev ? 'masked fresh-control-commit' : neo.rev}, tree ${pn.tree}, exit ${pn.exit})`);
}
console.log(failures ? `${failures} receipt(s) DIFFER` : 'ALL 5 C1 RECEIPTS MATCH (minus masked rev fields)');
process.exit(failures ? 1 : 0);
