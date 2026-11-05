// Scratch-only: builds (1) a v3 candidate = frozen v2 + two relative-input selftest cases
// (selftest function only), (2) the same selftest applied to M5a and M5b predicate bodies.
// Writes only under the scratch dir. Does not touch the frozen v2 or the controls.
import fs from 'node:fs';
import path from 'node:path';

const S = '/fast/scratch/hyaku/tabi-r66/R66Critic/c2';
const V2 = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-65/counters/check-receipt-provenance-v2.mjs';
const M5A = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66/controls/mutants/M5a-drop-repo-base.mjs';
const M5B = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66/controls/mutants/M5b-drop-matrix-dir-base.mjs';
fs.mkdirSync(S, { recursive: true });

const v2 = fs.readFileSync(V2, 'utf8');
const ANCHOR = '  const passed = results.filter((r) => r.ok).length;';
if (v2.split(ANCHOR).length !== 2) throw new Error('anchor not unique');

const REL_CASES = `  // v3 (selftest-only): relative matrix inputs, one per base. The repo-base case
  // exists only under --repo; the matrix-dir case exists only beside the matrix.
  fs.mkdirSync(path.join(dir, 'inst2'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'inst2', 'b.mjs'), 'export const b = 2;\\n');
  const bSha = sha(fs.readFileSync(path.join(dir, 'inst2', 'b.mjs')));
  for (const c of [
    { id: 'matrix-rel-repo-base', name: 'matrix-rel1.json', matrix: { input: { path: 'instruments/a.mjs', sha256: aSha } } },
    { id: 'matrix-rel-matrix-dir-base', name: 'matrix-rel2.json', matrix: { input: { path: 'inst2/b.mjs', sha256: bSha } } },
  ]) {
    fs.writeFileSync(path.join(dir, c.name), JSON.stringify(c.matrix));
    fs.writeFileSync(path.join(dir, c.name.replace(/\\.json$/, '') + '.command.json'), JSON.stringify({ ...good(), name: c.name.replace(/\\.json$/, '') }, null, 1));
    const res = evaluate(dir, repo, 'worktree', false, 0);
    const hit = res.findings.some((f) => f.check === 'matrix-input');
    results.push({ id: c.id, ok: !hit, findings: res.findings.map((f) => f.check) });
    fs.rmSync(path.join(dir, c.name), { force: true });
    fs.rmSync(path.join(dir, c.name.replace(/\\.json$/, '') + '.command.json'), { force: true });
  }
`;

const v3 = v2.replace(ANCHOR, REL_CASES + ANCHOR);
const mk = (name, src) => fs.writeFileSync(path.join(S, name), src);
mk('v3-candidate.mjs', v3);

// M5a / M5b: take the mutant predicate line verbatim, splice it into the v3 selftest.
const pick = (file) => {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const idx = lines.findIndex((l) => l.includes('const candidates = path.isAbsolute(rel)'));
  if (idx < 0) throw new Error('no candidates line in ' + file);
  return lines[idx];
};
const v2Line = v2.split('\n').find((l) => l.includes('const candidates = path.isAbsolute(rel)'));
const m5a = pick(M5A), m5b = pick(M5B);
for (const [name, line] of [['v3-M5a.mjs', m5a], ['v3-M5b.mjs', m5b]]) {
  const body = v3.split('\n').map((l) => (l === v2Line ? line : l)).join('\n');
  mk(name, body);
}
console.log(JSON.stringify({ v2Line, m5a, m5b, v3Bytes: v3.length }, null, 1));
