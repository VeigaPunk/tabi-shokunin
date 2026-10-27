#!/usr/bin/env node
// c1-drift-audit-build-v2.mjs — tabi round 37 C1 tool: derive corpus/adjacency-screen-drift.tsv
// (the drift-verification ledger the frozen counters re-check). Repair of the round-36
// frozen builder (round-36 closure routed defect 2: its kama pin literal was 39 characters,
// silently inert). This v2 corrects the pin to the round-35 baseline's 40-hex value AND
// resolves every PINS entry against its sibling repo at startup, so any future transcription
// error is loud (refusal), never silent. Delta heads still come from the digest-bound delta
// pins file. Usage:
//   node c1-drift-audit-build-v2.mjs [--repo <lane>] [--fleet <dir>] [--out <path>]
// Exit 0 always on success; refuses on unresolvable revisions.
import { spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PINS = Object.freeze({
  audio: '7a2fcd4f08831154686e4e323031f41fffdb077f',
  chousa: '00f8c7f5272a1d98b6d34913985fa4537e00aaf9',
  'game-dev-2d': '7753d49b16674e122ed134403e7a9b301f2cbf7e',
  'game-dev-3d': '89dd182b70943a20ae9aa6c1ed0e3c9b6e79c080',
  kagi: '69b61db46be4ed955994f6f1d1cba522bc5f4e97',
  kaidoku: '49096c7e6f226af0c750c4b003be58883cb6049f',
  kake: '044048597d62f3199494b63b36e90dd57825e350',
  kama: 'e8fa87ef19ec5eb28f5fd9701a0a42da45bd688d',
  kasegi: '752e476d8c5d0f74ef80ea89b6916e7af99a2721',
  kengaku: 'ff14d76d32d662f7b7073a2acb049594cb740d84',
  kotoba: '65a5c7a663249e0522cc49e4a148424200d9ddfe',
  kotodama: 'f556d1049fe651d3d63975600b13acd9fb686f15',
  kumitate: '8d557f85312de4fcc82e09ff735d21436bc3746d',
  lore: '380ef3abc7c7af11d7f23e9f9c82bb1937e1f695',
  mado: 'e0be61e4f6e34896f8b1c329f9c6d129e5af81f7',
  mori: 'aa3af1ec3118ee7766dfce1d9709ce3c0c3f6bfd',
  revenger: '6da884c6708fa25a7af013b6fc6802492e3264fa',
  souji: '9c76c7222a8abff027af42e37f0d160d52526bba',
  tameshi: 'f181a961ae44061af486f600e5ea257d2baf78f8',
  tsukuroi: 'a968393c678171f8a5a2907da5015735396da4cc',
});
const SCREEN = 'corpus/adjacency-screen-browser.tsv';
const DELTA_PINS_PATH = '.ufo/waves/round-36/baseline/c1-delta-pins.json';
const refRe = /^([a-z0-9-]+)-shokunin@([0-9a-f]{40}):(.+):([1-9][0-9]*)$/;

const ENV = { PATH: process.env.PATH, HOME: process.env.HOME, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', LC_ALL: 'C' };
function git(repo, args) {
  const r = spawnSync('git', ['-C', repo, ...args], { encoding: 'buffer', maxBuffer: 256 * 1024 * 1024, env: ENV });
  if (r.status !== 0) throw new Error(`git -C ${repo} ${args.join(' ')}: ${r.stderr.toString('utf8').trim()}`);
  return r.stdout;
}
const lines = (buf) => buf.toString('utf8').split('\n').map((l) => l.replace(/\r$/, ''));

function main() {
  const argv = process.argv.slice(2);
  let repo = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
  let fleet = null;
  let out = null;
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (['--repo', '--fleet', '--out'].includes(a)) { const v = argv[++i]; if (v === undefined) throw new Error(`missing value for ${a}`); ({ '--repo': () => { repo = resolve(v); }, '--fleet': () => { fleet = resolve(v); }, '--out': () => { out = resolve(v); } })[a](); }
    else throw new Error(`unknown argument ${a}`);
  }
  fleet = fleet || resolve(repo, '..');
  out = out || join(repo, 'corpus', 'adjacency-screen-drift.tsv');
  // v2 repair: every frozen PINS entry must resolve in its sibling repo — a transcription
  // error is a refusal, not a silent constant (round-36 routed defect 2).
  for (const [sib, pin] of Object.entries(PINS)) git(join(fleet, `${sib}-shokunin`), ['rev-parse', '--verify', '--quiet', `${pin}^{commit}`]);
  const head = git(repo, ['rev-parse', 'HEAD']).toString('utf8').trim();
  // delta pins: prefer the git object at HEAD, fall back to the worktree file
  let pinsBuf = null;
  const p = spawnSync('git', ['-C', repo, 'show', `${head}:${DELTA_PINS_PATH}`], { encoding: 'buffer', env: ENV });
  if (p.status === 0) pinsBuf = p.stdout;
  else pinsBuf = readFileSync(join(repo, DELTA_PINS_PATH));
  const deltaPins = JSON.parse(pinsBuf.toString('utf8'));
  const drifted = new Set(Object.entries(deltaPins).filter(([s, h]) => h !== PINS[s]).map(([s]) => s));
  const screenLines = lines(git(repo, ['show', `${head}:${SCREEN}`]));
  const rows = [];
  for (const l of screenLines.slice(1)) {
    if (!l) continue;
    const ref = l.split('\t')[0];
    const m = refRe.exec(ref);
    if (!m || !drifted.has(m[1])) continue;
    const [sib, pin, path, nS] = [m[1], m[2], m[3], Number(m[4])];
    const sibRepo = join(fleet, `${sib}-shokunin`);
    const pinBuf = spawnSync('git', ['-C', sibRepo, 'show', `${pin}:${path}`], { encoding: 'buffer', env: ENV });
    if (pinBuf.status !== 0) { rows.push([ref, 'stale', 'pin file absent']); continue; }
    const pinLs = lines(pinBuf.stdout);
    const cited = nS <= pinLs.length ? pinLs[nS - 1].trim() : null;
    if (cited === null) { rows.push([ref, 'stale', 'pin line absent']); continue; }
    const headBuf = spawnSync('git', ['-C', sibRepo, 'show', `${deltaPins[sib]}:${path}`], { encoding: 'buffer', env: ENV });
    if (headBuf.status !== 0) { rows.push([ref, 'stale', 'head file absent']); continue; }
    const headLs = lines(headBuf.stdout);
    const atN = nS <= headLs.length ? headLs[nS - 1].trim() : undefined;
    if (atN === cited) { rows.push([ref, 'unchanged', '-']); continue; }
    const reloc = headLs.map((t, i) => [i + 1, t.trim()]).filter(([, t]) => t === cited).map(([i]) => i);
    if (reloc.length) rows.push([ref, 'moved', `verbatim at :${reloc[0]}${reloc.length > 1 ? ` (also :${reloc.slice(1).join(', :')})` : ''}`]);
    else rows.push([ref, 'stale', 'cited text absent at head']);
  }
  const tsv = ['sibling_ref\tstatus\tnote'].concat(rows.map((r) => r.join('\t'))).join('\n') + '\n';
  writeFileSync(out, tsv);
  const counts = { unchanged: 0, moved: 0, stale: 0 };
  for (const r of rows) counts[r[1]] += 1;
  console.log(`drift-audit: ${rows.length} rows (${counts.unchanged} unchanged, ${counts.moved} moved, ${counts.stale} stale) -> ${out}`);
}
main();
