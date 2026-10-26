import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url));
const CLONE = join(HERE, 'clone');
const FLEET = '/home/vgpnk/Projects/shokunin';
const FREEZE = 'a4bfef0f75027c915e715649950b1d46dcb33d83';
const COUNT = join(CLONE, '.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs');
const { candidates } = await import(COUNT);

const run = (cmd, args, o = {}) => spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 256 << 20, env: { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1', TMPDIR: HERE }, ...o });
const g = (...a) => { const r = run('git', ['-C', CLONE, '-c', 'user.name=CritC1Counter', '-c', 'user.email=critc1@scratch.local', '-c', 'commit.gpgsign=false', ...a]); if (r.status !== 0) throw new Error(`git ${a.join(' ')}: ${r.stderr}`); return r.stdout.trim(); };
const blob = (repo, rev, path) => { const r = run('git', ['-C', repo, 'show', `${rev}:${path}`]); if (r.status !== 0) throw new Error(`blob ${path} @ ${rev.slice(0,8)}: ${r.stderr.slice(0,200)}`); return r.stdout; };
const put = (rel, text) => { const p = join(CLONE, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, text); };
const commit = (m) => { g('add', '-A'); g('commit', '-q', '--no-verify', '-m', m); return g('rev-parse', 'HEAD'); };
const reset = () => { g('checkout', '-q', '--force', '--detach', FREEZE); g('clean', '-q', '-fdx'); };
const words = (s) => s.trim().split(/\s+/).filter(Boolean);
const goodQuote = (q) => words(q).length >= 4 && words(q).length <= 25 && q.replace(/\s/g, '').length >= 20;

const cands = candidates(FLEET, CLONE);
const byKey = new Map(cands.map((c) => [c.key, c]));
const BG = /(?:playwright|puppeteer|chromedriver|geckodriver|webdriver|selenium|chromium|headless[ -](?:chrome|chromium|browser|firefox)|devtools protocol|chrome devtools|chrome-devtools|cdp|remote-debugging|browser automation|webbridge|burner[- ]?chrome|musketeer)/i;
const SIDE = /(?:own|owns|owned|owner|ownership|refuse|refuses|refused|refusal|deny|denies|denied|never|route|routes|routed|belongs?|report|reports|reported|lease|leases|leased|shared?|contested|stays?|handled?|handles|out of scope|not (?:this|our))/i;

// pick a 4..25-word window of text containing the FIRST bg hit and a side hit (if any)
function winBoth(text) {
  const t = text.trim();
  const ws = words(t);
  const spans = []; let pos = 0;
  for (const w of ws) { spans.push([pos, pos + w.length]); pos += w.length + 1; }
  const bgm = BG.exec(t); if (!bgm) return null;
  const sideM = SIDE.exec(t); if (!sideM) return null;
  const lo = Math.min(bgm.index, sideM.index), hi = Math.max(bgm.index + bgm[0].length, sideM.index + sideM[0].length);
  let k0 = -1, k1 = -1;
  for (let i = 0; i < spans.length; i++) { if (spans[i][0] <= lo && lo <= spans[i][1]) k0 = i; if (spans[i][0] <= hi && hi <= spans[i][1]) k1 = i; }
  if (k0 < 0 || k1 < 0 || k1 - k0 + 1 > 25) return null;
  const q = ws.slice(k0, k1 + 1).join(' ');
  if (!goodQuote(q) || !BG.test(q) || !SIDE.test(q) || !t.includes(q)) return null;
  // also try 1 word shorter on each side
  for (const [a, b] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
    const q2 = ws.slice(k0 + a, k1 + 1 - b).join(' ');
    if (goodQuote(q2) && BG.test(q2) && SIDE.test(q2) && t.includes(q2)) return q2;
  }
  return q;
}
function winBg(text) {
  const t = text.trim();
  const m = BG.exec(t); if (!m) return null;
  const before = t.slice(0, m.index).split(/\s+/).filter(Boolean).length;
  for (let pre = 10; pre >= 0; pre--) for (let post = 10; post >= 0; post--) {
    const q = words(t).slice(Math.max(0, before - pre), before + 1 + post).join(' ');
    if (goodQuote(q) && BG.test(q) && t.includes(q)) return q;
  }
  return null;
}
function screenQuote(text) {
  const t = text.trim();
  if (words(t).length <= 25) return t;
  const w = words(t); for (let k = 0; k + 6 <= w.length; k++) { const q = w.slice(k, k + 6).join(' '); if (q.replace(/\s/g, '').length >= 20) return q; }
  throw new Error('no screen quote');
}

const SCREEN_HDR = 'sibling_ref\treason\tsurface\tquote\tnote';
const mkScreen = (rows) => SCREEN_HDR + '\n' + rows.join('\n') + '\n';
const getMap = () => readFileSync(join(CLONE, 'corpus/adjacency.tsv'), 'utf8').replace(/\n*$/, '\n');

// declare a new tabi line in a NEW corpus file; returns {line, ctx}
function newDecl(file, text) {
  const prev = (() => { try { return readFileSync(join(CLONE, file), 'utf8'); } catch { return ''; } })();
  const prevLineCount = prev === '' ? 0 : prev.replace(/\n*$/, '').split('\n').length;
  const lineNo = prevLineCount + 1;
  const body = (prev === '' ? '' : prev.replace(/\n*$/, '\n')) + text + '\n';
  put(file, body);
  return { ref: `${file}:${lineNo}`, quote: text };
}

// ---- row builders (map rows) ----
function mapRow(surface, sib, candKey, sibQuote, decl, tagiQuote) {
  const c = byKey.get(candKey);
  if (!c) throw new Error('no candidate ' + candKey);
  const ref = `${c.lane}-shokunin@${c.pin}:${c.path}:${c.line}`;
  return [surface, c.lane, ref, sibQuote, decl.ref, tagiQuote, 'split-declared', '-', tagiQuote].join('\t');
}

function score(name, rev) {
  const r = run(process.execPath, [COUNT, '--rev', rev, '--repo', CLONE, '--fleet', FLEET, '--json']);
  const out = { name, exit: r.status, stdout: r.stdout, stderr: r.stderr };
  writeFileSync(join(HERE, `${name}.json`), r.stdout);
  writeFileSync(join(HERE, `${name}.stderr`), r.stderr);
  let j = {}; try { j = JSON.parse(r.stdout); } catch {}
  console.log(name, 'exit=' + r.status, 'predicate=' + j.predicate, 'cand=' + j.candidates, 'unaccounted=' + j.unaccounted, 'newMapped=' + j.newMapped, 'screened=' + j.screened, 'mapped=' + j.mapped, 'adj=' + (j.adjacency || {}).verdict, 'screenFindings=' + (j.screenFindings || []).length, 'refusals=' + JSON.stringify((j.newRowRefusals || []).map((x) => x.why)));
  return out;
}

// ================= EXP checks =================
// sanity: freeze, nothing changed
reset(); score('E0-freeze-nothing', FREEZE);

// ================= EXP1: screen-everything-same-surface =================
reset();
{
  // helper rows for lanes without baseline rows: kotoba, mado, tsukuroi, mori, chousa, tameshi
  const helperLanes = ['kotoba', 'mado', 'tsukuroi', 'mori', 'chousa', 'tameshi'];
  const PINS = JSON.parse(readFileSync(join(CLONE, '.ufo/waves/round-35/baseline/c1-pins.json'), 'utf8'));
  const helperRows = [];
  for (const [i, l] of helperLanes.entries()) {
    const prov = blob(join(FLEET, `${l}-shokunin`), PINS[l], 'PROVINCE.md').split('\n');
    let n = -1, q = null;
    for (let k = 2; k < prov.length; k++) { const t = prov[k].trim(); if (goodQuote(t)) { n = k + 1; q = t; break; } }
    if (n < 0) throw new Error('no helper sibling line for ' + l);
    const tabiQuote = 'CDP session discipline (endpoints, targets, screenshot/DOM evidence';
    helperRows.push([`crit-helper-${l}-0`, l, `${l}-shokunin@${PINS[l]}:PROVINCE.md:${n}`, q, 'PROVINCE.md:9', tabiQuote, 'split-declared', '-', tabiQuote].join('\t'));
  }
  // two newMapped rows (homograph SIDE examples, E3 candidates)
  const p1 = cands.find((c) => c.lane === 'kake' && c.path === 'SKILL.md' && c.line === 696);
  const p2 = cands.find((c) => c.lane === 'kaidoku' && c.path === 'corpus/knowledge/2026-10-13-r2-skill-references-deep.md' && c.line === 79);
  const d1 = newDecl('corpus/knowledge/w1-crit-attack.md', `Round-35 attack declaration: tabi splits browser ground with kake SKILL.md here.`);
  const d2 = newDecl('corpus/knowledge/w1-crit-attack.md', `Round-35 attack declaration: tabi splits browser ground with kaidoku corpus/knowledge/2026-10-13-r2-skill-references-deep.md here.`);
  const q1 = winBoth(p1.text); const q2 = winBoth(p2.text);
  if (!q1 || !q2) throw new Error('winBoth failed');
  const rows = [
    mapRow('crit-new-0', 'kake', p1.key, q1, d1, d1.quote),
    mapRow('crit-new-1', 'kaidoku', p2.key, q2, d2, d2.quote),
    ...helperRows,
  ];
  put('corpus/adjacency.tsv', getMap() + rows.join('\n') + '\n');
  // screens: all candidates same-surface
  const surfFor = { kaidoku: 'cdp-runtime-observation', kumitate: 'kimi-webbridge-plugin-internals', kagi: 'musketeer-cdp-9222-profile-lease', kake: 'musketeer-cdp-9222-profile-lease', kama: 'cdp-live-target-census' };
  const skip = new Set([p1.key, p2.key]);
  const srows = cands.filter((c) => !skip.has(c.key)).map((c) => {
    const surf = surfFor[c.lane] || `crit-helper-${c.lane}-0`;
    return `${c.key}\tsame-surface\t${surf}\t${screenQuote(c.text)}\tattack`;
  });
  put('corpus/adjacency-screen-browser.tsv', mkScreen(srows));
  score('E1-screen-all-same-surface', commit('attack E1: screen-everything-same-surface'));
}

// ================= EXP2: declaration text reuse via two identical lines (same lane) =================
reset();
{
  const p1 = cands.find((c) => c.lane === 'kake' && c.path === 'SKILL.md' && c.line === 696);
  const p2 = cands.find((c) => c.lane === 'kake' && c.path === 'corpus/knowledge/ops-automation.md' && c.line === 79);
  const same = 'Round-35 attack declaration: tabi splits browser ground with kake SKILL.md and corpus/knowledge/ops-automation.md here.';
  const d1 = newDecl('corpus/knowledge/w1-crit-attack.md', same);
  const d2 = newDecl('corpus/knowledge/w1-crit-attack.md', same);
  const q1 = winBoth(p1.text); const q2 = winBoth(p2.text);
  if (!q1 || !q2) throw new Error('winBoth failed exp2');
  const rows = [
    mapRow('crit-new2-0', 'kake', p1.key, q1, d1, d1.quote),
    mapRow('crit-new2-1', 'kake', p2.key, q2, d2, d2.quote),
  ];
  put('corpus/adjacency.tsv', getMap() + rows.join('\n') + '\n');
  const skip = new Set([p1.key, p2.key]);
  const srows = cands.filter((c) => !skip.has(c.key)).map((c) => `${c.key}\tno-claim-declared\t-\t${screenQuote(c.text)}\tattack`);
  put('corpus/adjacency-screen-browser.tsv', mkScreen(srows));
  score('E2-declaration-text-reuse', commit('attack E2: identical declaration text on two lines'));
}

// ================= EXP3: homograph SIDE-only newMapped rows =================
reset();
{
  const p1 = cands.find((c) => c.lane === 'kake' && c.path === 'SKILL.md' && c.line === 696);
  const p2 = cands.find((c) => c.lane === 'kaidoku' && c.path === 'corpus/knowledge/2026-10-13-r2-skill-references-deep.md' && c.line === 79);
  const d1 = newDecl('corpus/knowledge/w1-crit-attack.md', `Round-35 attack declaration: tabi splits browser ground with kake SKILL.md here.`);
  const d2 = newDecl('corpus/knowledge/w1-crit-attack.md', `Round-35 attack declaration: tabi splits browser ground with kaidoku corpus/knowledge/2026-10-13-r2-skill-references-deep.md here.`);
  const q1 = winBoth(p1.text); const q2 = winBoth(p2.text);
  if (!q1 || !q2) throw new Error('winBoth failed exp3');
  const rows = [
    mapRow('crit-new3-0', 'kake', p1.key, q1, d1, d1.quote),
    mapRow('crit-new3-1', 'kaidoku', p2.key, q2, d2, d2.quote),
  ];
  put('corpus/adjacency.tsv', getMap() + rows.join('\n') + '\n');
  const skip = new Set([p1.key, p2.key]);
  const srows = cands.filter((c) => !skip.has(c.key)).map((c) => `${c.key}\tno-claim-declared\t-\t${screenQuote(c.text)}\tattack`);
  put('corpus/adjacency-screen-browser.tsv', mkScreen(srows));
  score('E3-homograph-side', commit('attack E3: homograph SIDE words only'));
}
