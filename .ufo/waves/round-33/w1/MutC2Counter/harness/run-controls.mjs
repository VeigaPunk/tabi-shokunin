#!/usr/bin/env node
// run-controls.mjs — MutC2Counter scratch harness (seat MutC2Counter, round 33 w1).
// Rebuilds the three committed C2 controls of .ufo/waves/round-33/baseline/controls.mjs
// (sha256 2d0cf8416a35c2440cc1b6478f90b0f7a6d8a3436d617ea3527b0b8f3f5a451e) verbatim —
// same clone mechanics, same v1 patches, same scoring commands — but scores the
// COUNTER given in argv (pristine copy or single-point mutant) and writes receipts
// into the outdir given in argv. Never writes outside TMPDIR + outdir.
//   node run-controls.mjs <counter.mjs> <outdir>
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const BASELINE = 'b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd';
const C2 = resolve(process.argv[2]);
const OUT = resolve(process.argv[3]);
const TMP = process.env.TMPDIR;
if (!TMP || !TMP.startsWith('/fast/scratch/hyaku/tabi-r33/')) throw new Error('set TMPDIR under /fast/scratch/hyaku/tabi-r33/');
mkdirSync(OUT, { recursive: true });
const sha = (b) => createHash('sha256').update(b).digest('hex');
const dir = mkdtempSync(join(TMP, 'controls-'));
const clone = join(dir, 'clone');
const run = (cmd, args, o = {}) => spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 256 << 20, env: { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' }, ...o });
const g = (...a) => { const r = run('git', ['-C', clone, '-c', 'user.name=tabi-r33-control', '-c', 'user.email=control@scratch.local', '-c', 'commit.gpgsign=false', ...a]); if (r.status !== 0) throw new Error(`git ${a.join(' ')}: ${r.stderr}`); return r.stdout.trim(); };
const put = (rel, text) => { const p = join(clone, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, text); };
const commit = (m) => { g('add', '-A'); g('commit', '-q', '--no-verify', '-m', m); return g('rev-parse', 'HEAD'); };
const reset = () => { g('checkout', '-q', '--force', '--detach', BASELINE); g('clean', '-q', '-fdx'); };
function score(name, counter, rev, repo) {
  const r = run(process.execPath, [counter, '--rev', rev, '--repo', repo, '--json']);
  writeFileSync(join(OUT, `${name}.json`), r.stdout);
  writeFileSync(join(OUT, `${name}.stderr`), r.stderr);
  const tree = repo === LANE ? run('git', ['-C', LANE, 'rev-parse', `${rev}^{tree}`]).stdout.trim() : g('rev-parse', `${rev}^{tree}`);
  writeFileSync(join(OUT, `${name}.provenance`), `counter=${counter} counter_sha256=${sha(readFileSync(counter))}\nrev=${rev} tree=${tree} repo=${repo === LANE ? 'lane' : 'scratch-clone-of-' + BASELINE}\nexit=${r.status}\n`);
  let j = {}; try { j = JSON.parse(r.stdout); } catch {}
  return { name, exit: r.status, predicate: j.predicate, honest: j.honest, forgeriesAccepted: j.forgeriesAccepted, digestLiteralsCount: Array.isArray(j.digestLiterals) ? j.digestLiterals.length : null, selftest: j.selftest && j.selftest.exit };
}
try {
  const c = run('git', ['clone', '-q', '--shared', '--no-checkout', LANE, clone]);
  if (c.status !== 0) throw new Error(c.stderr);
  if (g('rev-parse', '--show-toplevel') !== clone) throw new Error('clone toplevel mismatch');
  const receipts = [];
  // C2 J1 — do nothing (the lane itself at the baseline)
  receipts.push(score('c2-J1-do-nothing', C2, BASELINE, LANE));
  // C2 J2 — reject-all gate (patch verbatim from committed controls.mjs)
  reset();
  const v1 = readFileSync(join(LANE, 'scripts/check-bidi-runtime.mjs'), 'utf8');
  put('scripts/check-bidi-runtime.mjs', v1.replace(/\nif \(process\.argv\[1\][^\n]*\n?$/, '\nif (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) { if (process.argv.includes("--selftest")) main(); else { console.log("{}"); process.exit(1); } }\n'));
  receipts.push(score('c2-J2-reject-all', C2, commit('control c2 J2 reject-all gate'), clone));
  // C2 J3 — whitelist gate (patch verbatim from committed controls.mjs)
  reset();
  const honest = ['8aa97463c2386515407328cd96a55b4f38aeb0c376a87ddc2d323c8209aaf851', '9918a716da71b41e0366fa6839217e8a191e2f473826ade0bd9ab3bedc7169d7', '92bd413caab0bcb7f1a62c1107fe00972a93f83888143b3c2170f32c7dfebad1', 'b9dab912f0af414efa80c2ec61cde3b392b3757935d7561af2056ca3eddc7252'];
  const entrySha = sha(readFileSync(join(LANE, 'corpus/knowledge/webdriver-bidi-runtime-round-32.md')));
  const regSha = sha(readFileSync(join(LANE, 'corpus/SOURCES.md')));
  const wl = v1.replace('  out.clean = !out.entryFinding && out.population >= 1 && out.failing === 0;',
    `  const WL = ${JSON.stringify(honest)};\n  const ds = (receiptObj && Array.isArray(receiptObj.runs)) ? receiptObj.runs.map((r) => r.transcriptSha256) : [];\n  const wlOk = ds.length === 2 && ds[0] !== ds[1] && ds.every((d) => WL.includes(d)) && receiptObj.driverSha256 === "55dbef88ed4bc5a980af0afe2eb0c6586e6869d41a1e8b98dbb7980b6dff070a" && sha256(entryBuf) === "${entrySha}" && sha256(reg) === "${regSha}";\n  out.clean = wlOk && !out.entryFinding && out.population >= 1 && out.failing === 0;`);
  if (wl === v1) throw new Error('whitelist patch did not apply');
  put('scripts/check-bidi-runtime.mjs', wl);
  receipts.push(score('c2-J3-whitelist', C2, commit('control c2 J3 whitelist gate'), clone));
  writeFileSync(join(OUT, 'summary.json'), JSON.stringify(receipts, null, 1) + '\n');
  console.log(JSON.stringify(receipts));
} finally {
  rmSync(dir, { recursive: true, force: true });
}
