// prep.mjs — MutC2Counter-2 probe prep. Builds 10 single-point counter mutants and
// 4 fixture commits (J2 selfhash, J3 find-sniff, J4 reject-all, J5 killNothing) in the
// scratch clone only. Never touches the lane (read-only source reads).
import { spawnSync } from 'node:child_process';
import { mkdirSync, copyFileSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const S = '/fast/scratch/hyaku/tabi-r34/MutC2Counter-2';
const LANE = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const FREEZE = '59f1b47aae277e1670e4a824173da8cde7e388ee';
const FROZEN_COUNTER_SHA = '3cf5eb699934eae48b77c991dae8761780c1c010da1121c1b9623a4d5d325b82';
const COUNTER = join(LANE, '.ufo/waves/round-34/counters/c2-gate-mutants.mjs');
const sha = (b) => createHash('sha256').update(b).digest('hex');

mkdirSync(join(S, 'muts'), { recursive: true });
mkdirSync(join(S, 'tmp'), { recursive: true });
mkdirSync(join(S, 'runs'), { recursive: true });
copyFileSync(COUNTER, join(S, 'pristine.mjs'));
const pristine = readFileSync(join(S, 'pristine.mjs'), 'utf8');
if (sha(Buffer.from(pristine)) !== FROZEN_COUNTER_SHA) { console.error('FROZEN DIGEST MISMATCH'); process.exit(9); }

// 10 single-point mutants: [id, label, needle, replacement]
const MUTS = [
  ['A', 'kill-exit-3-to-nonzero', 'killed: t.exit === 3 && t.failingCases.length > 0', 'killed: t.exit !== 0 && t.failingCases.length > 0'],
  ['B', 'fail-line-requirement-dropped', 'killed: t.exit === 3 && t.failingCases.length > 0', 'killed: t.exit === 3'],
  ['C', 'twin-probe-removed', 'm.applied && m.twinExit !== 0', 'false'],
  ['D', 'decoy-clause-removed', 'decoy.exit === 0 && ', ''],
  ['E', 'neutral-clause-removed', 'neutral.exit === 0 && ', ''],
  ['F', 'occurrence-1-to-atleast-1', 'if (n !== 1 || !m.find.includes', 'if (n < 1 || !m.find.includes'],
  ['G', 'battery-clause-removed', ' && battery.predicate === true;', ';'],
  ['H', 'survivors-filter-inverted', 'm.applied && !m.killed', 'm.applied && m.killed'],
  ['I', 'battery-sha-check-removed', "if (sha256(bat.stdout) !== BATTERY_SHA256) throw new Refusal('battery bytes differ from pinned sha256');", '// battery sha256 check removed (mutant)'],
  ['J', 'timeout-shortened', 'const TIMEOUT_MS = 180000;', 'const TIMEOUT_MS = 200;'],
];
const mutants = [];
for (const [id, label, needle, replacement] of MUTS) {
  const n = pristine.split(needle).length - 1;
  if (n !== 1) { console.error(`mutant ${id}: needle occurs ${n} times, need 1`); process.exit(9); }
  const text = pristine.replace(needle, replacement);
  const p = join(S, 'muts', `mut-${id}.mjs`);
  writeFileSync(p, text);
  mutants.push({ id, label, needle, replacement, file: `muts/mut-${id}.mjs`, sha256: sha(Buffer.from(text)), bytes: Buffer.byteLength(text) });
}

// fixtures in the scratch clone
const CL = join(S, 'clone');
const g = (...a) => {
  const r = spawnSync('git', ['-C', CL, '-c', 'user.name=MutC2Counter-2', '-c', 'user.email=MutC2Counter-2@scratch.local', '-c', 'commit.gpgsign=false', ...a], { encoding: 'utf8', maxBuffer: 256 << 20 });
  if (r.status !== 0) throw new Error(`git ${a.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
};
if (g('rev-parse', '--show-toplevel') !== CL) { console.error('toplevel mismatch'); process.exit(9); }
const resetC = () => { g('checkout', '-q', '--force', '--detach', FREEZE); g('clean', '-q', '-fdx'); };
const commitC = (m) => { g('add', '-A'); g('commit', '-q', '--no-verify', '-m', m); return g('rev-parse', 'HEAD'); };
const treeOf = (rev) => g('rev-parse', `${rev}^{tree}`);
resetC();
const G = readFileSync(join(CL, 'scripts/check-bidi-runtime.mjs'), 'utf8');
if (!/readFileSync/.test(G) || !/fileURLToPath/.test(G)) { console.error('gate lacks readFileSync/fileURLToPath imports'); process.exit(9); }
const anchor = '  if (o.selftest) {\n';
if (!G.includes(anchor)) { console.error('selftest anchor missing'); process.exit(9); }
const gateFreezeSha = sha(Buffer.from(G));
const gateBaselineSha = sha(spawnSync('git', ['-C', LANE, 'show', '15dfaccb34601c2d221c78501e2befd8998d600c:scripts/check-bidi-runtime.mjs'], { encoding: 'buffer', maxBuffer: 64 << 20 }).stdout);

// J2 selfhash (verbatim construction from baseline/controls.mjs)
const hashFree = (t) => t.split('\n').filter((l) => !l.includes('SELFHASH')).join('\n');
let J2 = G.replace(anchor, anchor + '    { const __s = readFileSync(fileURLToPath(import.meta.url), "utf8"); const __h = createHash("sha256").update(__s.split("\\n").filter((l) => !l.includes("SELF" + "HASH")).join("\\n")).digest("hex"); if (__h !== "@@H@@") { console.log("CASE id=selfhash-guard expected_exit=0 exit=1 FAIL"); console.log("BIDI_RUNTIME_SELFTEST verdict=failed cases=1 passed=0"); process.exit(3); } } // SELFHASH\n');
if (!/createHash/.test(G.split('\n').slice(0, 140).join('\n'))) J2 = J2.replace('import { tmpdir } from "node:os";', 'import { tmpdir } from "node:os";\nimport { createHash } from "node:crypto"; // SELFHASH');
J2 = J2.replace('@@H@@', sha(Buffer.from(hashFree(J2))));
resetC(); writeFileSync(join(CL, 'scripts/check-bidi-runtime.mjs'), J2);
const revJ2 = commitC('mutprobe J2 selfhash self-test');
// J3 find-sniff (verbatim construction from baseline/controls.mjs)
const M = JSON.parse(readFileSync(join(LANE, '.ufo/waves/round-34/baseline/c2-mutant-finds.json'), 'utf8'));
const b64 = JSON.stringify(M.map((x) => Buffer.from(x).toString('base64')));
const J3 = G.replace(anchor, anchor + `    { const __s = readFileSync(fileURLToPath(import.meta.url), "utf8"); const __F = ${b64}.map((x) => Buffer.from(x, "base64").toString("utf8")); if (__F.some((f) => !__s.includes(f))) { console.log("CASE id=sniff-guard expected_exit=0 exit=1 FAIL"); console.log("BIDI_RUNTIME_SELFTEST verdict=failed cases=1 passed=0"); process.exit(3); } }\n`);
resetC(); writeFileSync(join(CL, 'scripts/check-bidi-runtime.mjs'), J3);
const revJ3 = commitC('mutprobe J3 find-presence sniff');
// J4 reject-all (verbatim construction from baseline/controls.mjs)
const tail = 'if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();';
if (!G.includes(tail)) { console.error('main guard missing'); process.exit(9); }
const J4 = G.replace(tail, 'if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) { if (process.argv.includes("--selftest")) main(); else { console.log("{}"); process.exit(1); } }');
resetC(); writeFileSync(join(CL, 'scripts/check-bidi-runtime.mjs'), J4);
const revJ4 = commitC('mutprobe J4 reject-all gate');
// J5 killNothing — NEW probe fixture (not committed in the lane): selftest always exits 0
const J5 = G.replace(anchor, anchor + '    console.log("BIDI_RUNTIME_SELFTEST verdict=passed cases=0 passed=0"); process.exit(0);\n');
resetC(); writeFileSync(join(CL, 'scripts/check-bidi-runtime.mjs'), J5);
const revJ5 = commitC('mutprobe J5 kill-nothing selftest');
resetC();

const fixtures = {
  J1: { name: 'do-nothing', rev: FREEZE, tree: treeOf(FREEZE) },
  J2: { name: 'selfhash', rev: revJ2, tree: treeOf(revJ2) },
  J3: { name: 'find-sniff', rev: revJ3, tree: treeOf(revJ3) },
  J4: { name: 'reject-all', rev: revJ4, tree: treeOf(revJ4) },
  J5: { name: 'kill-nothing (NEW probe fixture)', rev: revJ5, tree: treeOf(revJ5) },
};
writeFileSync(join(S, 'fixtures.json'), JSON.stringify({ repo: CL, freeze: FREEZE, gateFreezeSha, gateBaselineSha, pristine: { sha256: FROZEN_COUNTER_SHA, bytes: Buffer.byteLength(pristine) }, mutants, fixtures }, null, 1) + '\n');
console.log(JSON.stringify({ ok: true, gateFreezeSha, gateBaselineSha, mutants: mutants.length, fixtures }, null, 1));
