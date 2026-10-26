// mut-controls.mjs — MutC1Counter seat: rebuild the four committed C1 controls
// (baseline/controls.mjs constructions J1-J4, C1 legs only) against a mutant
// copy of the frozen counter, in a disposable scratch clone of the lane at
// BASELINE. Same construction code as controls.mjs; receipts land in <outdir>.
//   TMPDIR=<under /fast/scratch/hyaku/tabi-r33/> node mut-controls.mjs <mutant.mjs> <tag> <outdir>
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const [mutantArg, tag, outdir] = process.argv.slice(2);
if (!mutantArg || !tag || !outdir) throw new Error('usage: mut-controls.mjs <mutant.mjs> <tag> <outdir>');
const mutant = resolve(mutantArg);
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const FLEET = '/home/vgpnk/Projects/shokunin';
const BASELINE = 'b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd';
const TMP = process.env.TMPDIR;
if (!TMP || !TMP.startsWith('/fast/scratch/hyaku/tabi-r33/')) throw new Error('set TMPDIR under /fast/scratch/hyaku/tabi-r33/');
const sha = (b) => createHash('sha256').update(b).digest('hex');
mkdirSync(outdir, { recursive: true });
const dir = mkdtempSync(join(TMP, 'mut-'));
const clone = join(dir, 'clone');
const run = (cmd, args, o = {}) => spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 256 << 20, env: { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' }, ...o });
const g = (...a) => { const r = run('git', ['-C', clone, '-c', 'user.name=MutC1Counter', '-c', 'user.email=MutC1Counter@scratch.local', '-c', 'commit.gpgsign=false', ...a]); if (r.status !== 0) throw new Error(`git ${a.join(' ')}: ${r.stderr}`); return r.stdout.trim(); };
const put = (rel, text) => { const p = join(clone, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, text); };
const commit = (m) => { g('add', '-A'); g('commit', '-q', '--no-verify', '-m', m); return g('rev-parse', 'HEAD'); };
const reset = () => { g('checkout', '-q', '--force', '--detach', BASELINE); g('clean', '-q', '-fdx'); };
const receipts = [];
function score(name, rev, repo) {
  const r = run(process.execPath, [mutant, '--rev', rev, '--repo', repo, '--json', '--fleet', FLEET]);
  writeFileSync(join(outdir, `${name}.json`), r.stdout);
  writeFileSync(join(outdir, `${name}.stderr`), r.stderr);
  const tree = run('git', ['-C', repo, 'rev-parse', `${rev}^{tree}`]).stdout.trim();
  writeFileSync(join(outdir, `${name}.provenance`), `mutant=${mutant} mutant_sha256=${sha(readFileSync(mutant))}\nrev=${rev} tree=${tree} repo=${repo}\nexit=${r.status}\n`);
  let j = {}; try { j = JSON.parse(r.stdout); } catch {}
  receipts.push({
    name, exit: r.status, tree,
    predicate: j.predicate ?? null,
    candidates: j.candidates ?? null, mapped: j.mapped ?? null, screened: j.screened ?? null,
    unaccounted: j.unaccounted ?? null, newMapped: j.newMapped ?? null,
    adjacencyVerdict: j.adjacency ? j.adjacency.verdict : null,
    adjacencyFindings: j.adjacency ? j.adjacency.findings : null,
    screenFindings: Array.isArray(j.screenFindings) ? j.screenFindings.length : null,
  });
}
try {
  const c = run('git', ['clone', '-q', '--shared', '--no-checkout', LANE, clone]);
  if (c.status !== 0) throw new Error(c.stderr);
  if (g('rev-parse', '--show-toplevel') !== clone) throw new Error('clone toplevel mismatch');
  // J1 — do nothing: the lane at the baseline, scored in the scratch clone
  score('J1-do-nothing', BASELINE, clone);
  const base = JSON.parse(readFileSync(join(outdir, 'J1-do-nothing.json'), 'utf8'));
  const list = run(process.execPath, [mutant, '--list-candidates', '--fleet', FLEET]).stdout;
  writeFileSync(join(outdir, 'candidates.tsv'), list);
  const cands = list.trim().split('\n').map((l) => { const [key, text] = l.split('\t'); return { key, text }; });
  const q = (text) => (text.match(/^(\S+\s+){0,11}\S+/) || [''])[0];
  // J2 — screen every unaccounted candidate not-browser-sense, map nothing
  reset();
  const rows = ['sibling_ref\treason\tsurface\tquote\tnote'];
  for (const k of base.unaccountedKeys) { const cnd = cands.find((x) => x.key === k); rows.push(`${k}\tnot-browser-sense\t-\t${q(cnd.text)}\tcontrol`); }
  put('corpus/adjacency-screen.tsv', rows.join('\n') + '\n');
  score('J2-screen-all', commit('control c1 J2 screen-all'), clone);
  // J3 — four junk split-declared rows on NON-candidate sibling lines
  reset();
  const map = run('git', ['-C', LANE, 'show', `${BASELINE}:corpus/adjacency.tsv`]).stdout.replace(/\n*$/, '\n');
  const tabiLine = 'PROVINCE.md:3\t**Domain:** browser & web-interaction craft (旅, journey) — driving real';
  const junk = [['kama', 3], ['mori', 3], ['souji', 3], ['tameshi', 3]].map(([l, n], i) => {
    const pin = run('git', ['-C', join(FLEET, `${l}-shokunin`), 'rev-parse', 'refs/heads/master']).stdout.trim();
    const text = run('git', ['-C', join(FLEET, `${l}-shokunin`), 'show', `${pin}:PROVINCE.md`]).stdout.split('\n')[n - 1];
    return `junk-surface-${i}\t${l}\t${l}-shokunin@${pin}:PROVINCE.md:${n}\t${q(text.trim())}\t${tabiLine}\tsplit-declared\t-\tbrowser & web-interaction craft (旅, journey)`;
  });
  put('corpus/adjacency.tsv', map + junk.join('\n') + '\n');
  score('J3-junk-rows', commit('control c1 J3 junk rows'), clone);
  // J4 — four split-declared rows ON kake candidate lines whose quotes name neither side
  reset();
  const kake = cands.filter((x) => x.key.startsWith('kake-') && !/\btabi\b/i.test(x.text)).slice(0, 4);
  const mis = kake.map((x, i) => `mislabel-surface-${i}\tkake\t${x.key}\t${q(x.text.trim())}\t${tabiLine}\tsplit-declared\t-\tbrowser & web-interaction craft (旅, journey)`);
  put('corpus/adjacency.tsv', map + mis.join('\n') + '\n');
  score('J4-mislabel-unnamed', commit('control c1 J4 mislabel'), clone);
  writeFileSync(join(outdir, 'summary.json'), JSON.stringify(receipts, null, 1) + '\n');
  console.log(JSON.stringify({ tag, ok: true, receipts }));
} finally { rmSync(dir, { recursive: true, force: true }); }
