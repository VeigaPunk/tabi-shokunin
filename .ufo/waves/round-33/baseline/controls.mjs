#!/usr/bin/env node
// controls.mjs — tabi round 33: the cheapest controls that skip the claimed work,
// scored with the frozen counters BEFORE any claim data (prompt §6 item 9).
// Builds one scratch clone of the lane at BASELINE under $TMPDIR (pass TMPDIR under
// $HYAKU_SCRATCH/tabi-r33/), commits each control there (every git call names -C <clone>,
// toplevel verified), scores it, writes receipts beside this file, removes the clone.
//   node .ufo/waves/round-33/baseline/controls.mjs
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const LANE = resolve(HERE, '../../../..');
const FLEET = resolve(LANE, '..');
const BASELINE = 'b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd';
const C1 = join(HERE, '../counters/c1-adjacency-sweep.mjs');
const C2 = join(HERE, '../counters/c2-bidi-forgery-battery.mjs');
const TMP = process.env.TMPDIR;
if (!TMP || !TMP.startsWith('/fast/scratch/hyaku/tabi-r33/')) throw new Error('set TMPDIR under /fast/scratch/hyaku/tabi-r33/');
const sha = (b) => createHash('sha256').update(b).digest('hex');
const dir = mkdtempSync(join(TMP, 'controls-'));
const clone = join(dir, 'clone');
const run = (cmd, args, o = {}) => spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 256 << 20, env: { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' }, ...o });
const g = (...a) => { const r = run('git', ['-C', clone, '-c', 'user.name=tabi-r33-control', '-c', 'user.email=control@scratch.local', '-c', 'commit.gpgsign=false', ...a]); if (r.status !== 0) throw new Error(`git ${a.join(' ')}: ${r.stderr}`); return r.stdout.trim(); };
const put = (rel, text) => { const p = join(clone, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, text); };
const commit = (m) => { g('add', '-A'); g('commit', '-q', '--no-verify', '-m', m); return g('rev-parse', 'HEAD'); };
const reset = () => { g('checkout', '-q', '--force', '--detach', BASELINE); g('clean', '-q', '-fdx'); };
const receipts = [];
function score(name, counter, rev, repo) {
  const r = run(process.execPath, [counter, '--rev', rev, '--repo', repo, '--json'].concat(counter === C1 ? ['--fleet', FLEET] : []));
  writeFileSync(join(HERE, `${name}.json`), r.stdout);
  writeFileSync(join(HERE, `${name}.stderr`), r.stderr);
  const tree = repo === LANE ? run('git', ['-C', LANE, 'rev-parse', `${rev}^{tree}`]).stdout.trim() : g('rev-parse', `${rev}^{tree}`);
  writeFileSync(join(HERE, `${name}.provenance`), `counter=${counter.slice(LANE.length + 1)} counter_sha256=${sha(readFileSync(counter))}\nrev=${rev} tree=${tree} repo=${repo === LANE ? 'lane' : 'scratch-clone-of-' + BASELINE}\nexit=${r.status}\n`);
  let j = {}; try { j = JSON.parse(r.stdout); } catch {}
  receipts.push({ name, exit: r.status, predicate: j.predicate, summary: counter === C1 ? { candidates: j.candidates, mapped: j.mapped, screened: j.screened, unaccounted: j.unaccounted, newMapped: j.newMapped, adjacency: j.adjacency && j.adjacency.verdict } : { honest: j.honest, forgeriesAccepted: j.forgeriesAccepted, digestLiterals: j.digestLiterals, selftest: j.selftest && j.selftest.exit } });
}
try {
  const c = run('git', ['clone', '-q', '--shared', '--no-checkout', LANE, clone]);
  if (c.status !== 0) throw new Error(c.stderr);
  if (g('rev-parse', '--show-toplevel') !== clone) throw new Error('clone toplevel mismatch');
  // C1 J1 / C2 J1 — do nothing (the lane itself at the baseline)
  score('c1-J1-do-nothing', C1, BASELINE, LANE);
  score('c2-J1-do-nothing', C2, BASELINE, LANE);
  // candidate list at the frozen pins
  const list = run(process.execPath, [C1, '--list-candidates', '--fleet', FLEET]).stdout;
  writeFileSync(join(HERE, 'c1-candidates.tsv'), list);
  const base = JSON.parse(readFileSync(join(HERE, 'c1-J1-do-nothing.json'), 'utf8'));
  const cands = list.trim().split('\n').map((l) => { const [key, text] = l.split('\t'); return { key, text }; });
  const q = (text) => (text.match(/^(\S+\s+){0,11}\S+/) || [''])[0];
  // C1 J2 — screen every unaccounted candidate as not-browser-sense, map nothing
  reset();
  const rows = ['sibling_ref\treason\tsurface\tquote\tnote'];
  for (const k of base.unaccountedKeys) { const cnd = cands.find((x) => x.key === k); rows.push(`${k}\tnot-browser-sense\t-\t${q(cnd.text)}\tcontrol`); }
  put('corpus/adjacency-screen.tsv', rows.join('\n') + '\n');
  score('c1-J2-screen-all', C1, commit('control c1 J2 screen-all'), clone);
  // C1 J3 — four junk split-declared rows on NON-candidate sibling lines
  reset();
  const map = readFileSync(join(LANE, 'corpus/adjacency.tsv'), 'utf8').replace(/\n*$/, '\n');
  const tabiLine = 'PROVINCE.md:3\t**Domain:** browser & web-interaction craft (旅, journey) — driving real';
  const junk = [['kama', 3], ['mori', 3], ['souji', 3], ['tameshi', 3]].map(([l, n], i) => {
    const pin = run('git', ['-C', join(FLEET, `${l}-shokunin`), 'rev-parse', 'refs/heads/master']).stdout.trim();
    const text = run('git', ['-C', join(FLEET, `${l}-shokunin`), 'show', `${pin}:PROVINCE.md`]).stdout.split('\n')[n - 1];
    return `junk-surface-${i}\t${l}\t${l}-shokunin@${pin}:PROVINCE.md:${n}\t${q(text.trim())}\t${tabiLine}\tsplit-declared\t-\tbrowser & web-interaction craft (旅, journey)`;
  });
  put('corpus/adjacency.tsv', map + junk.join('\n') + '\n');
  score('c1-J3-junk-rows', C1, commit('control c1 J3 junk rows'), clone);
  // C1 J4 — four split-declared rows ON candidate lines whose quotes do not name the other side
  reset();
  const kake = cands.filter((x) => x.key.startsWith('kake-') && !/\btabi\b/i.test(x.text)).slice(0, 4);
  const mis = kake.map((x, i) => {
    const m = /^(.+)-shokunin@([0-9a-f]{40}):(.+):(\d+)$/.exec(x.key);
    return `mislabel-surface-${i}\tkake\t${x.key}\t${q(x.text.trim())}\t${tabiLine}\tsplit-declared\t-\tbrowser & web-interaction craft (旅, journey)`;
  });
  put('corpus/adjacency.tsv', map + mis.join('\n') + '\n');
  score('c1-J4-mislabel-unnamed', C1, commit('control c1 J4 mislabel'), clone);
  // C2 J2 — reject-all gate
  reset();
  const v1 = readFileSync(join(LANE, 'scripts/check-bidi-runtime.mjs'), 'utf8');
  put('scripts/check-bidi-runtime.mjs', v1.replace(/\nif \(process\.argv\[1\][^\n]*\n?$/, '\nif (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) { if (process.argv.includes("--selftest")) main(); else { console.log("{}"); process.exit(1); } }\n'));
  score('c2-J2-reject-all', C2, commit('control c2 J2 reject-all gate'), clone);
  // C2 J3 — whitelist gate: v1 plus "every transcript digest in the honest set, entry bytes unchanged"
  reset();
  const honest = ['8aa97463c2386515407328cd96a55b4f38aeb0c376a87ddc2d323c8209aaf851', '9918a716da71b41e0366fa6839217e8a191e2f473826ade0bd9ab3bedc7169d7', '92bd413caab0bcb7f1a62c1107fe00972a93f83888143b3c2170f32c7dfebad1', 'b9dab912f0af414efa80c2ec61cde3b392b3757935d7561af2056ca3eddc7252'];
  const entrySha = sha(readFileSync(join(LANE, 'corpus/knowledge/webdriver-bidi-runtime-round-32.md')));
  const regSha = sha(readFileSync(join(LANE, 'corpus/SOURCES.md')));
  const wl = v1.replace('  out.clean = !out.entryFinding && out.population >= 1 && out.failing === 0;',
    `  const WL = ${JSON.stringify(honest)};\n  const ds = (receiptObj && Array.isArray(receiptObj.runs)) ? receiptObj.runs.map((r) => r.transcriptSha256) : [];\n  const wlOk = ds.length === 2 && ds[0] !== ds[1] && ds.every((d) => WL.includes(d)) && receiptObj.driverSha256 === "55dbef88ed4bc5a980af0afe2eb0c6586e6869d41a1e8b98dbb7980b6dff070a" && sha256(entryBuf) === "${entrySha}" && sha256(reg) === "${regSha}";\n  out.clean = wlOk && !out.entryFinding && out.population >= 1 && out.failing === 0;`);
  if (wl === v1) throw new Error('whitelist patch did not apply');
  put('scripts/check-bidi-runtime.mjs', wl);
  score('c2-J3-whitelist', C2, commit('control c2 J3 whitelist gate'), clone);
  writeFileSync(join(HERE, 'controls-summary.json'), JSON.stringify(receipts, null, 1) + '\n');
  console.log(JSON.stringify(receipts, null, 1));
} finally {
  rmSync(dir, { recursive: true, force: true });
}
