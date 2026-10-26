#!/usr/bin/env node
// RevC2Controls — re-run of the C2 part of .ufo/waves/round-33/baseline/controls.mjs
// (frozen bytes 2d0cf841…), from the seat clone at e6b0a907…, with seat TMPDIR.
// Receipts go to the seat output dir; the lane is never written.
import { spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';

const OUT = '/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w1/RevC2Controls';
const CLONE = '/fast/scratch/hyaku/tabi-r33/RevC2Controls/clone';
const BASE = 'b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd';
// Frozen counter bytes copied out of the clone at e6b0a907 (sha-verified below);
// run from scratch, never from the lane checkout. The counter reads everything
// through git blobs of --repo, so the copy's location cannot change results.
const C2 = '/fast/scratch/hyaku/tabi-r33/RevC2Controls/c2-battery.frozen.mjs';
const sha = (b) => createHash('sha256').update(b).digest('hex');
const run = (cmd, args, o = {}) => spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 256 << 20, env: { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' }, ...o });
const g = (...a) => { const r = run('git', ['-C', CLONE, '-c', 'user.name=RevC2Controls', '-c', 'user.email=RevC2Controls@scratch.local', '-c', 'commit.gpgsign=false', ...a]); if (r.status !== 0) throw new Error(`git ${a.join(' ')}: ${r.stderr}`); return r.stdout.trim(); };
const show = (rev, path) => { const r = run('git', ['-C', CLONE, 'show', `${rev}:${path}`]); if (r.status !== 0) throw new Error(`show ${rev}:${path}: ${r.stderr}`); return r.stdout; };
const reset = () => { g('checkout', '-q', '--force', '--detach', BASE); g('clean', '-q', '-fdx'); };
const put = (rel, text) => { const p = join(CLONE, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, text); };
const commit = (m) => { g('add', '-A'); g('commit', '-q', '--no-verify', '-m', m); return g('rev-parse', 'HEAD'); };
const receipts = [];
function score(name, rev, repo) {
  const r = run(process.execPath, [C2, '--rev', rev, '--repo', repo, '--json']);
  writeFileSync(join(OUT, `${name}.json`), r.stdout);
  writeFileSync(join(OUT, `${name}.stderr`), r.stderr);
  const tree = g('rev-parse', `${rev}^{tree}`);
  writeFileSync(join(OUT, `${name}.provenance`), `counter=${C2} counter_sha256=${sha(readFileSync(C2))}\nrev=${rev} tree=${tree} repo=${repo}\nexit=${r.status}\n`);
  let j = {}; try { j = JSON.parse(r.stdout); } catch {}
  receipts.push({ name, exit: r.status, predicate: j.predicate, gateSha256: j.gateSha256, summary: { honest: j.honest, forgeriesAccepted: j.forgeriesAccepted, acceptedForgeries: j.acceptedForgeries, digestLiterals: j.digestLiterals, selftest: j.selftest && j.selftest.exit } });
  console.error(`${name}: exit=${r.status} predicate=${j.predicate} gate=${j.gateSha256}`);
}
mkdirSync(OUT, { recursive: true });
if (g('rev-parse', '--show-toplevel') !== CLONE) throw new Error('clone toplevel mismatch');
writeFileSync(C2, show('e6b0a9074d434ccc307badd312ae7379d1193fea', '.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs'));
console.error(`counter_sha256=${sha(readFileSync(C2))}`);
// C2 J1 — do nothing: the lane itself at the baseline (controls.mjs scored repo=lane;
// bytes come from git objects, so repo=seat-clone yields identical counted fields).
reset();
score('c2-J1-do-nothing', BASE, CLONE);
// C2 J2 — reject-all gate (same patch text as controls.mjs)
reset();
const v1 = show(BASE, 'scripts/check-bidi-runtime.mjs');
if (sha(v1) !== '2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393') throw new Error('v1 blob digest mismatch');
const rej = v1.replace(/\nif \(process\.argv\[1\][^\n]*\n?$/, '\nif (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) { if (process.argv.includes("--selftest")) main(); else { console.log("{}"); process.exit(1); } }\n');
if (rej === v1) throw new Error('reject-all patch did not apply');
put('scripts/check-bidi-runtime.mjs', rej);
score('c2-J2-reject-all', commit('control c2 J2 reject-all gate (RevC2Controls rerun)'), CLONE);
// C2 J3 — whitelist gate (same patch text and digests as controls.mjs)
reset();
const honest = ['8aa97463c2386515407328cd96a55b4f38aeb0c376a87ddc2d323c8209aaf851', '9918a716da71b41e0366fa6839217e8a191e2f473826ade0bd9ab3bedc7169d7', '92bd413caab0bcb7f1a62c1107fe00972a93f83888143b3c2170f32c7dfebad1', 'b9dab912f0af414efa80c2ec61cde3b392b3757935d7561af2056ca3eddc7252'];
const entrySha = sha(show(BASE, 'corpus/knowledge/webdriver-bidi-runtime-round-32.md'));
const regSha = sha(show(BASE, 'corpus/SOURCES.md'));
console.error(`entrySha=${entrySha} regSha=${regSha}`);
const wl = v1.replace('  out.clean = !out.entryFinding && out.population >= 1 && out.failing === 0;',
  `  const WL = ${JSON.stringify(honest)};\n  const ds = (receiptObj && Array.isArray(receiptObj.runs)) ? receiptObj.runs.map((r) => r.transcriptSha256) : [];\n  const wlOk = ds.length === 2 && ds[0] !== ds[1] && ds.every((d) => WL.includes(d)) && receiptObj.driverSha256 === "55dbef88ed4bc5a980af0afe2eb0c6586e6869d41a1e8b98dbb7980b6dff070a" && sha256(entryBuf) === "${entrySha}" && sha256(reg) === "${regSha}";\n  out.clean = wlOk && !out.entryFinding && out.population >= 1 && out.failing === 0;`);
if (wl === v1) throw new Error('whitelist patch did not apply');
put('scripts/check-bidi-runtime.mjs', wl);
score('c2-J3-whitelist', commit('control c2 J3 whitelist gate (RevC2Controls rerun)'), CLONE);
reset();
console.log(JSON.stringify(receipts, null, 1));
