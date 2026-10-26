#!/usr/bin/env node
// controls.mjs — tabi round 34: the cheapest controls that skip the claimed work, scored
// with the frozen counters BEFORE any claim data (prompt §6 item 9). One scratch clone of
// the lane at BASELINE under $TMPDIR (must be under /fast/scratch/hyaku/tabi-r34/); each
// control is committed there (every git call names -C <clone>, toplevel verified), scored,
// and its receipt (.json / .stderr / .provenance) written beside this file; the clone is
// removed on exit.   TMPDIR=/fast/scratch/hyaku/tabi-r34/L1/ctl node .ufo/waves/round-34/baseline/controls.mjs
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const LANE = resolve(HERE, '../../../..');
const FLEET = resolve(LANE, '..');
const BASELINE = '15dfaccb34601c2d221c78501e2befd8998d600c';
const C1 = join(HERE, '../counters/c1-adjacency-sweep-v2.mjs');
const C2 = join(HERE, '../counters/c2-gate-mutants.mjs');
const TMP = process.env.TMPDIR;
if (!TMP || !TMP.startsWith('/fast/scratch/hyaku/tabi-r34/')) throw new Error('set TMPDIR under /fast/scratch/hyaku/tabi-r34/');
const sha = (b) => createHash('sha256').update(b).digest('hex');
const dir = mkdtempSync(join(TMP, 'controls-'));
const clone = join(dir, 'clone');
const run = (cmd, args, o = {}) => spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 256 << 20, env: { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' }, ...o });
const g = (...a) => { const r = run('git', ['-C', clone, '-c', 'user.name=tabi-r34-control', '-c', 'user.email=control@scratch.local', '-c', 'commit.gpgsign=false', ...a]); if (r.status !== 0) throw new Error(`git ${a.join(' ')}: ${r.stderr}`); return r.stdout.trim(); };
const put = (rel, text) => { const p = join(clone, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, text); };
const get = (rel) => readFileSync(join(clone, rel), 'utf8');
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
  receipts.push({ name, exit: r.status, predicate: j.predicate, summary: counter === C1
    ? { candidates: j.candidates, mapped: j.mapped, screened: j.screened, unaccounted: j.unaccounted, newMapped: j.newMapped, adjacency: j.adjacency && j.adjacency.verdict, screenFindings: (j.screenFindings || []).length }
    : { pristine: j.pristine && j.pristine.exit, neutral: j.neutral && j.neutral.exit, decoy: j.decoy && j.decoy.exit, killed: j.killedCount, survivors: j.survivors, twinsFailing: j.twinsFailing, unappliable: j.unappliable, battery: j.battery && j.battery.predicate } });
  return j;
}
// a verbatim 4..25-word window of `text` around `needle` (or from the start)
function win(text, needle) {
  const t = text.trim();
  const re = needle ? new RegExp(`(?:\\S+\\s+){0,5}\\S*${needle}\\S*(?:\\s+\\S+){0,6}`, 'i') : /^(?:\S+\s+){0,9}\S+/;
  const m = re.exec(t); if (!m) throw new Error(`no window for ${needle} in ${t}`);
  return m[0];
}
const SKILL_HDR = 'surface\tsibling\tsibling_ref\tsibling_quote\ttabi_ref\ttabi_quote\tdisposition\truling_ref\truling_quote';
try {
  const c = run('git', ['clone', '-q', '--shared', '--no-checkout', LANE, clone]);
  if (c.status !== 0) throw new Error(c.stderr);
  if (g('rev-parse', '--show-toplevel') !== clone) throw new Error('clone toplevel mismatch');
  g('checkout', '-q', '--detach', BASELINE);
  // J1 — do nothing
  const base = score('c1-J1-do-nothing', C1, BASELINE, LANE);
  score('c2-J1-do-nothing', C2, BASELINE, LANE);
  const list = run(process.execPath, [C1, '--list-candidates', '--repo', LANE, '--fleet', FLEET]).stdout;
  writeFileSync(join(HERE, 'c1-candidates.tsv'), list);
  const cands = list.trim().split('\n').map((l) => { const [key, set, text] = l.split('\t'); const m = /^(.+)-shokunin@([0-9a-f]{40}):(.+):(\d+)$/.exec(key); return { key, set, text, lane: m[1], pin: m[2], path: m[3], line: Number(m[4]) }; });
  const byKey = (k) => cands.find((x) => x.key.startsWith(k));
  const screenRows = (skip) => ['sibling_ref\treason\tsurface\tquote\tnote'].concat(base.unaccountedKeys.filter((k) => !skip.includes(k)).map((k) => `${k}\tnot-browser-sense\t-\t${win(cands.find((x) => x.key === k).text)}\tcontrol`)).join('\n') + '\n';
  const map = readFileSync(join(LANE, 'corpus/adjacency.tsv'), 'utf8').replace(/\n*$/, '\n');
  // C1 J2 — screen every unaccounted candidate not-browser-sense; map nothing
  reset();
  put('corpus/adjacency-screen-skill.tsv', screenRows([]));
  score('c1-J2-screen-all', C1, commit('control c1 J2 screen-all'), clone);
  // C1 J3 — four split-declared rows on NON-candidate sibling lines with a NEW tabi line naming each sibling
  reset();
  const decl = 'Round-34 control declaration (junk): tabi splits browser ground with kama mori souji tameshi here.';
  const skill = get('SKILL.md').replace(/\n*$/, '\n') + '\n' + decl + '\n';
  put('SKILL.md', skill);
  const declLine = skill.split('\n').indexOf(decl) + 1;
  const pinOf = (l) => run('git', ['-C', join(FLEET, `${l}-shokunin`), 'show', '-s', '--format=%H', 'HEAD']).stdout.trim();
  void pinOf;
  const PINS = JSON.parse(readFileSync(join(HERE, 'c1-pins.json'), 'utf8'));
  const junk = ['kama', 'mori', 'souji', 'tameshi'].map((l, i) => {
    const text = run('git', ['-C', join(FLEET, `${l}-shokunin`), 'show', `${PINS[l]}:SKILL.md`]).stdout.split('\n')[2];
    return `junk-surface-${i}\t${l}\t${l}-shokunin@${PINS[l]}:SKILL.md:3\t${win(text)}\tSKILL.md:${declLine}\tbrowser ground with kama mori souji tameshi\tsplit-declared\t-\tbrowser ground with kama mori souji tameshi`;
  });
  put('corpus/adjacency.tsv', map + junk.join('\n') + '\n');
  put('corpus/adjacency-screen-skill.tsv', screenRows([]));
  score('c1-J3-junk-noncandidate', C1, commit('control c1 J3 junk rows on non-candidate lines'), clone);
  // C1 J4 — split-declared rows on candidate lines that NAME tabi, tabi side = EXISTING tabi lines naming the sibling (no new declaration)
  reset();
  const tabiLines = get('SKILL.md').split('\n');
  const roster = tabiLines.findIndex((x) => x.includes('LANES="protocol aggregator kasegi kengaku kake kumitate kotoba kagi kama"')) + 1;
  const pub = tabiLines.findIndex((x) => x.includes('Refuse-and-route: RE forensics → revenger/kaidoku; publishing → kake; secrets → kagi')) + 1;
  if (!roster || !pub) throw new Error('tabi anchor lines not found');
  const picks = [
    [byKey('kotoba-shokunin@65a5c7a663249e0522cc49e4a148424200d9ddfe:corpus/knowledge/sibling-overlap-census-round49.md:171'), `SKILL.md:${roster}`, 'aggregator kasegi kengaku kake kumitate kotoba kagi kama'],
    [byKey('kotoba-shokunin@65a5c7a663249e0522cc49e4a148424200d9ddfe:corpus/knowledge/sibling-overlap-census-round74.md:150'), `SKILL.md:${roster}`, 'aggregator kasegi kengaku kake kumitate kotoba kagi kama'],
    [byKey('kumitate-shokunin@8d557f85312de4fcc82e09ff735d21436bc3746d:corpus/knowledge/kimi-skills-plugins.md:250'), `SKILL.md:${roster}`, 'aggregator kasegi kengaku kake kumitate kotoba kagi kama'],
    [byKey('kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:SKILL.md:408'), `SKILL.md:${pub}`, 'RE forensics → revenger/kaidoku; publishing → kake; secrets → kagi'],
  ];
  if (picks.some((p) => !p[0])) throw new Error('J4 candidate missing');
  const named = picks.map(([cd, tref, tq], i) => `named-existing-${i}\t${cd.lane}\t${cd.key}\t${win(cd.text, 'tabi')}\t${tref}\t${tq}\tsplit-declared\t-\t${tq}`);
  put('corpus/adjacency.tsv', map + named.join('\n') + '\n');
  put('corpus/adjacency-screen-skill.tsv', screenRows(picks.map((p) => p[0].key)));
  score('c1-J4-existing-tabi-lines', C1, commit('control c1 J4 named rows on existing tabi lines'), clone);
  // C1 J5 — split-declared rows on candidate lines that do NOT name tabi, with a NEW tabi line naming each sibling
  reset();
  const decl5 = 'Round-34 control declaration (junk): tabi splits browser ground with kasegi kagi kama here.';
  const skill5 = get('SKILL.md').replace(/\n*$/, '\n') + '\n' + decl5 + '\n';
  put('SKILL.md', skill5);
  const d5 = skill5.split('\n').indexOf(decl5) + 1;
  const unnamed = cands.filter((x) => x.set === 'B' && !/\btabi\b/i.test(x.text) && ['kasegi', 'kagi', 'kama'].includes(x.lane)).slice(0, 4);
  const mis = unnamed.map((cd, i) => `unnamed-${i}\t${cd.lane}\t${cd.key}\t${win(cd.text)}\tSKILL.md:${d5}\tbrowser ground with kasegi kagi kama\tsplit-declared\t-\tbrowser ground with kasegi kagi kama`);
  put('corpus/adjacency.tsv', map + mis.join('\n') + '\n');
  put('corpus/adjacency-screen-skill.tsv', screenRows(unnamed.map((x) => x.key)));
  score('c1-J5-unnamed-sibling-side', C1, commit('control c1 J5 split rows whose sibling side does not name tabi'), clone);
  // C2 J2 — self-hash self-test: fails whenever its own bytes (minus the hash line) change
  const G = readFileSync(join(LANE, 'scripts/check-bidi-runtime.mjs'), 'utf8');
  const anchor = '  if (o.selftest) {\n';
  if (!G.includes(anchor)) throw new Error('selftest anchor missing');
  reset();
  const hashFree = (t) => t.split('\n').filter((l) => !l.includes('SELFHASH')).join('\n');
  let J2 = G.replace(anchor, anchor + '    { const __s = readFileSync(fileURLToPath(import.meta.url), "utf8"); const __h = createHash("sha256").update(__s.split("\\n").filter((l) => !l.includes("SELF" + "HASH")).join("\\n")).digest("hex"); if (__h !== "@@H@@") { console.log("CASE id=selfhash-guard expected_exit=0 exit=1 FAIL"); console.log("BIDI_RUNTIME_SELFTEST verdict=failed cases=1 passed=0"); process.exit(3); } } // SELFHASH\n');
  if (!/createHash/.test(G.split('\n').slice(0, 140).join('\n'))) J2 = J2.replace('import { tmpdir } from "node:os";', 'import { tmpdir } from "node:os";\nimport { createHash } from "node:crypto"; // SELFHASH');
  J2 = J2.replace('@@H@@', sha(hashFree(J2)));
  put('scripts/check-bidi-runtime.mjs', J2);
  score('c2-J2-selfhash', C2, commit('control c2 J2 self-hash self-test'), clone);
  // C2 J3 — find-presence sniff: the self-test fails when any mutant's find text is absent from its own source
  reset();
  const M = JSON.parse(readFileSync(join(HERE, 'c2-mutant-finds.json'), 'utf8'));
  const b64 = JSON.stringify(M.map((x) => Buffer.from(x).toString('base64')));
  const J3 = G.replace(anchor, anchor + `    { const __s = readFileSync(fileURLToPath(import.meta.url), "utf8"); const __F = ${b64}.map((x) => Buffer.from(x, "base64").toString("utf8")); if (__F.some((f) => !__s.includes(f))) { console.log("CASE id=sniff-guard expected_exit=0 exit=1 FAIL"); console.log("BIDI_RUNTIME_SELFTEST verdict=failed cases=1 passed=0"); process.exit(3); } }\n`);
  put('scripts/check-bidi-runtime.mjs', J3);
  score('c2-J3-find-sniff', C2, commit('control c2 J3 find-presence sniff'), clone);
  // C2 J4 — reject-all gate (production path exits 1 on every evaluation; self-test untouched)
  reset();
  const tail = 'if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();';
  if (!G.includes(tail)) throw new Error('main guard missing');
  put('scripts/check-bidi-runtime.mjs', G.replace(tail, 'if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) { if (process.argv.includes("--selftest")) main(); else { console.log("{}"); process.exit(1); } }'));
  score('c2-J4-reject-all', C2, commit('control c2 J4 reject-all gate'), clone);
  writeFileSync(join(HERE, 'controls-summary.json'), JSON.stringify(receipts, null, 1) + '\n');
  console.log(JSON.stringify(receipts, null, 1));
} finally {
  rmSync(dir, { recursive: true, force: true });
}
