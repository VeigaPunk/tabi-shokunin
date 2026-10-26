#!/usr/bin/env node
// controls.mjs — tabi round 35: the cheapest controls against the two frozen counters, scored
// BEFORE any claim data (prompt §6 item 9; QUALITY 90, 96). One scratch clone of the lane at
// BASELINE under $TMPDIR (must be under /fast/scratch/hyaku/tabi-r35/); each control is
// committed there (every git call names -C <clone>, toplevel verified first), scored, and its
// receipt (.json / .stderr / .provenance) written beside this file; the clone is removed on
// exit.   TMPDIR=/fast/scratch/hyaku/tabi-r35/L1/ctl node .ufo/waves/round-35/baseline/controls.mjs
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const LANE = resolve(HERE, '../../../..');
const FLEET = resolve(LANE, '..');
const BASELINE = '2d2c8a77428f9c95c3cd0eb4a3bbf0c6fb4ab684';
const C1 = join(HERE, '../counters/c1-adjacency-sweep-v3.mjs');
const C2 = join(HERE, '../counters/c2-firefox-bidi.mjs');
const TMP = process.env.TMPDIR;
if (!TMP || !TMP.startsWith('/fast/scratch/hyaku/tabi-r35/')) throw new Error('set TMPDIR under /fast/scratch/hyaku/tabi-r35/');
const sha = (b) => createHash('sha256').update(b).digest('hex');
const dir = mkdtempSync(join(TMP, 'controls-'));
const clone = join(dir, 'clone');
const run = (cmd, args, o = {}) => spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 256 << 20, env: { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' }, ...o });
const g = (...a) => { const r = run('git', ['-C', clone, '-c', 'user.name=tabi-r35-control', '-c', 'user.email=control@scratch.local', '-c', 'commit.gpgsign=false', ...a]); if (r.status !== 0) throw new Error(`git ${a.join(' ')}: ${r.stderr}`); return r.stdout.trim(); };
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
    ? { candidates: j.candidates, mapped: j.mapped, screened: j.screened, unaccounted: j.unaccounted, newMapped: j.newMapped, refusals: (j.newRowRefusals || []).map((x) => x.why), adjacency: j.adjacency && j.adjacency.verdict, screenFindings: (j.screenFindings || []).length }
    : { population: j.population, admitted: j.admitted, failing: j.failing, entry: j.entryFinding, receipt: j.receiptFinding, binding: j.binding, firstReason: (j.rows || []).map((x) => x.reason).find(Boolean) || null } });
  return j;
}
function win(text, needle) {
  const t = text.trim();
  const re = needle ? new RegExp(`(?:\\S+\\s+){0,5}\\S*(?:${needle})\\S*(?:\\s+\\S+){0,6}`, 'i') : /^(?:\S+\s+){0,9}\S+/;
  const m = re.exec(t); if (!m) return null;
  const w = m[0].split(/\s+/);
  return w.length >= 4 && m[0].replace(/\s/g, '').length >= 20 ? m[0] : null;
}
const BG = /\b(?:playwright|puppeteer|chromedriver|geckodriver|webdriver|selenium|chromium|headless[ -](?:chrome|chromium|browser|firefox)|devtools protocol|chrome devtools|chrome-devtools|cdp|remote-debugging|browser automation|webbridge|burner[- ]?chrome|musketeer)\b/i;
const SIDE = /\b(?:own|owns|owned|owner|ownership|refuse|refuses|refused|refusal|deny|denies|denied|never|route|routes|routed|belongs?|report|reports|reported|lease|leases|leased|shared?|contested|stays?|handled?|handles|out of scope|not (?:this|our))\b/i;
try {
  const c = run('git', ['clone', '-q', '--shared', '--no-checkout', LANE, clone]);
  if (c.status !== 0) throw new Error(c.stderr);
  if (g('rev-parse', '--show-toplevel') !== clone) throw new Error('clone toplevel mismatch');
  g('checkout', '-q', '--detach', BASELINE);
  // ---------------- C1 ----------------
  const base = score('c1-J1-do-nothing', C1, BASELINE, LANE);
  const list = run(process.execPath, [C1, '--list-candidates', '--repo', LANE, '--fleet', FLEET]).stdout;
  writeFileSync(join(HERE, 'c1-candidates.tsv'), list);
  const cands = list.trim().split('\n').map((l) => { const i = l.indexOf('\t'); const key = l.slice(0, i); const text = l.slice(i + 1); const m = /^(.+)-shokunin@([0-9a-f]{40}):(.+):(\d+)$/.exec(key); return { key, text, lane: m[1], pin: m[2], path: m[3], line: Number(m[4]) }; });
  const screenRows = (skip) => ['sibling_ref\treason\tsurface\tquote\tnote'].concat(cands.filter((x) => !skip.includes(x.key)).map((x) => `${x.key}\tno-claim-declared\t-\t${win(x.text, BG.source.slice(2, -2)) || win(x.text) || x.text.trim()}\tcontrol`)).join('\n') + '\n';
  const map = readFileSync(join(LANE, 'corpus/adjacency.tsv'), 'utf8').replace(/\n*$/, '\n');
  const declare = (lanes) => {
    const d = `Round-35 control declaration (junk): tabi splits browser ground with ${lanes.join(' ')} here.`;
    const sk = get('SKILL.md').replace(/\n*$/, '\n') + '\n' + d + '\n';
    put('SKILL.md', sk);
    return { line: sk.split('\n').indexOf(d) + 1, quote: `browser ground with ${lanes.join(' ')}` };
  };
  const rowsFor = (picks, d, quoteOf, tag) => picks.map((cd, i) => `${tag}-${i}\t${cd.lane}\t${cd.key}\t${quoteOf(cd)}\tSKILL.md:${d.line}\t${d.quote}\tsplit-declared\t-\t${d.quote}`);
  const rowsEach = (picks, quoteOf, tag) => picks.map((cd, i) => { const d = declare([cd.lane, cd.path, `(${tag}-${i})`]); return `${tag}-${i}\t${cd.lane}\t${cd.key}\t${quoteOf(cd)}\tSKILL.md:${d.line}\t${d.quote}\tsplit-declared\t-\t${d.quote}`; });
  // J2 — screen every candidate; map nothing
  reset();
  put('corpus/adjacency-screen-browser.tsv', screenRows([]));
  score('c1-J2-screen-all', C1, commit('control c1 J2 screen-all'), clone);
  // J3 — split rows on NON-candidate sibling lines, new tabi line naming each sibling
  reset();
  const PINS = JSON.parse(readFileSync(join(HERE, 'c1-pins.json'), 'utf8'));
  const j3 = ['kama', 'mori', 'souji', 'tameshi', 'audio', 'lore', 'kengaku'].map((l) => {
    const ls = run('git', ['-C', join(FLEET, `${l}-shokunin`), 'show', `${PINS[l]}:SKILL.md`]).stdout.split('\n');
    const n = ls.findIndex((t, k) => k >= 2 && !BG.test(t) && !/\btabi\b/i.test(t) && win(t) && !/[`|\\]/.test(t));
    return n < 0 ? null : { l, n: n + 1, q: win(ls[n]) };
  }).filter(Boolean).slice(0, 4);
  const d3 = declare(j3.map((x) => x.l));
  const junk = j3.map((x, i) => `junk-surface-${i}\t${x.l}\t${x.l}-shokunin@${PINS[x.l]}:SKILL.md:${x.n}\t${x.q}\tSKILL.md:${d3.line}\t${d3.quote}\tsplit-declared\t-\t${d3.quote}`);
  put('corpus/adjacency.tsv', map + junk.join('\n') + '\n');
  put('corpus/adjacency-screen-browser.tsv', screenRows([]));
  score('c1-J3-junk-noncandidate', C1, commit('control c1 J3 junk rows on non-candidate lines'), clone);
  // J4 — rows on candidate lines whose tabi side is an EXISTING tabi line naming the sibling
  reset();
  const tl = get('SKILL.md').split('\n');
  const pub = tl.findIndex((x) => x.includes('Refuse-and-route: RE forensics → revenger/kaidoku; publishing → kake; secrets → kagi')) + 1;
  if (!pub) throw new Error('tabi anchor line not found');
  const p4 = ['kagi', 'kake', 'kaidoku'].map((l) => cands.find((x) => x.lane === l && BG.test(x.text) && SIDE.test(win(x.text, BG.source.slice(2, -2)) || ''))).filter(Boolean);
  const existing = { line: pub, quote: 'RE forensics → revenger/kaidoku; publishing → kake; secrets → kagi' };
  put('corpus/adjacency.tsv', map + rowsFor(p4, existing, (cd) => win(cd.text, BG.source.slice(2, -2)), 'existing').join('\n') + '\n');
  put('corpus/adjacency-screen-browser.tsv', screenRows(p4.map((x) => x.key)));
  score('c1-J4-existing-tabi-line', C1, commit('control c1 J4 rows on an existing tabi line'), clone);
  // J5 — split rows whose sibling quote carries no browser-ground term (new tabi line)
  reset();
  const p5 = cands.filter((x) => ['kaidoku', 'kumitate', 'kagi'].includes(x.lane) && x.text.trim().split(/\s+/).length >= 20).map((x) => ({ ...x, q: (() => { const w = x.text.trim().split(/\s+/); for (let k = 0; k + 6 <= w.length; k += 1) { const q = w.slice(k, k + 6).join(' '); if (!BG.test(q) && q.replace(/\s/g, '').length >= 20) return q; } return null; })() })).filter((x) => x.q).slice(0, 3);
  put('corpus/adjacency.tsv', map + rowsEach(p5, (cd) => cd.q, 'nobg').join('\n') + '\n');
  put('corpus/adjacency-screen-browser.tsv', screenRows(p5.map((x) => x.key)));
  score('c1-J5-quote-no-browser-ground', C1, commit('control c1 J5 split quotes without browser ground'), clone);
  // J6 — split rows whose sibling quote has browser ground but states no side (new tabi line)
  reset();
  const p6 = cands.filter((x) => ['kaidoku', 'kumitate', 'mado', 'tsukuroi'].includes(x.lane)).map((x) => ({ ...x, q: win(x.text, BG.source.slice(2, -2)) })).filter((x) => x.q && !SIDE.test(x.q)).filter((x, i, a) => a.findIndex((y) => y.lane === x.lane) === i).slice(0, 3);
  const d6 = declare(p6.map((x) => x.lane));
  put('corpus/adjacency.tsv', map + rowsEach(p6, (cd) => cd.q, 'noside').join('\n') + '\n');
  put('corpus/adjacency-screen-browser.tsv', screenRows(p6.map((x) => x.key)));
  score('c1-J6-quote-states-no-side', C1, commit('control c1 J6 split quotes that state no side'), clone);
  // J7 — split rows on third-lane records (a sibling's audit/rewrite of other lanes' text)
  reset();
  const p7 = cands.filter((x) => /(?:sibling|overlap|adjacen|fleet-skill-audit|description-rewrites)/i.test(x.path)).map((x) => ({ ...x, q: win(x.text, BG.source.slice(2, -2)) })).filter((x) => x.q && SIDE.test(x.q)).slice(0, 3);
  put('corpus/adjacency.tsv', map + rowsEach(p7, (cd) => cd.q, 'thirdlane').join('\n') + '\n');
  put('corpus/adjacency-screen-browser.tsv', screenRows(p7.map((x) => x.key)));
  score('c1-J7-third-lane-record', C1, commit('control c1 J7 split rows on third-lane records'), clone);
  // J8 — RESIDUAL (disclosed, QUALITY 90): junk split rows on own-file candidate lines whose
  // quote carries browser ground AND a side word, new tabi line, every other line screened.
  reset();
  const p8 = cands.filter((x) => !/(?:sibling|overlap|adjacen|fleet-skill-audit|description-rewrites)/i.test(x.path)).map((x) => ({ ...x, q: win(x.text, BG.source.slice(2, -2)) })).filter((x) => x.q && SIDE.test(x.q)).filter((x, i, a) => a.findIndex((y) => y.lane === x.lane) === i).slice(0, 2);
  put('corpus/adjacency.tsv', map + rowsEach(p8, (cd) => cd.q, 'residual').join('\n') + '\n');
  put('corpus/adjacency-screen-browser.tsv', screenRows(p8.map((x) => x.key)));
  score('c1-J8-residual-lexical-forgery', C1, commit('control c1 J8 residual: lexical forgery of two split rows'), clone);
  // ---------------- C2 ----------------
  score('c2-J1-do-nothing', C2, BASELINE, LANE);
  const ENTRY = 'corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md';
  const RECEIPT = 'corpus/evidence/round-35/bidi-firefox/receipt.json';
  const r32 = JSON.parse(readFileSync(join(LANE, 'corpus/evidence/round-32/bidi/receipt.json'), 'utf8'));
  const r32entry = readFileSync(join(LANE, 'corpus/knowledge/webdriver-bidi-runtime-round-32.md'), 'utf8');
  const fakeSource = (id) => {
    const reg = get('corpus/SOURCES.md').replace(/\n*$/, '\n');
    put('corpus/SOURCES.md', reg + `| ${id} | Control row (fabricated) — https://developer.mozilla.org/en-US/docs/Web/WebDriver/Reference/BiDi | docs | B | control | control anchor | control teaches | mined | 2026-10-26 | 90d | ${ENTRY} |\n`);
    put('corpus/lessons/round-35.md', `# control\n\n## Gate\n\n| id | url | sha256 |\n|---|---|---|\n| ${id} | https://developer.mozilla.org/en-US/docs/Web/WebDriver/Reference/BiDi | ${'0'.repeat(64)} |\n`);
  };
  const entryFrom = (id) => r32entry.replace(/^source:.*$/m, `source: ${id}`);
  // J2 — the round-32 Chromium entry, receipt and transcripts re-labelled as the Firefox claim
  reset();
  fakeSource('S900');
  put(ENTRY, entryFrom('S900'));
  put(RECEIPT, JSON.stringify(r32, null, 1) + '\n');
  score('c2-J2-chromium-copy', C2, commit('control c2 J2 chromium receipt copied'), clone);
  // J3 — round-32 transcripts rewritten to Firefox shapes (UUID session/context ids, browserName, geckodriver version)
  reset();
  fakeSource('S900');
  put(ENTRY, entryFrom('S900'));
  const runs3 = r32.runs.map((rn, k) => {
    let t = readFileSync(join(LANE, rn.transcript), 'utf8');
    const ids = [...new Set([...t.matchAll(/\b[0-9a-f]{32}\b|\b[0-9A-F]{32}\b/g)].map((m) => m[0]))];
    for (const id of ids) t = t.split(id).join(randomUUID());
    t = t.replace(/"browserName":"chrome"/g, '"browserName":"firefox","moz:geckodriverVersion":"0.37.1"').replace(/"browserVersion":"[^"]+"/g, '"browserVersion":"158.0.1"');
    const p = `corpus/evidence/round-35/bidi-firefox/run-${k + 1}.jsonl`;
    put(p, t);
    return { name: `run-${k + 1}`, transcript: p, transcriptSha256: sha(t) };
  });
  const drv = '// control stub driver\nconsole.log("stub");\n';
  put('scripts/bidi-firefox-stub.mjs', drv);
  put(RECEIPT, JSON.stringify({ ...r32, browserVersion: '158.0.1', driver: 'scripts/bidi-firefox-stub.mjs', driverSha256: sha(drv), runs: runs3 }, null, 1) + '\n');
  score('c2-J3-relabelled-chromium', C2, commit('control c2 J3 chromium transcripts relabelled firefox'), clone);
  // J4 — one transcript committed at two paths (byte-identical)
  reset();
  fakeSource('S900');
  put(ENTRY, entryFrom('S900'));
  const t4 = readFileSync(join(LANE, r32.runs[0].transcript), 'utf8');
  put('corpus/evidence/round-35/bidi-firefox/a.jsonl', t4); put('corpus/evidence/round-35/bidi-firefox/b.jsonl', t4);
  put('scripts/bidi-firefox-stub.mjs', drv);
  put(RECEIPT, JSON.stringify({ ...r32, browserVersion: '158.0.1', driver: 'scripts/bidi-firefox-stub.mjs', driverSha256: sha(drv), runs: [{ name: 'a', transcript: 'corpus/evidence/round-35/bidi-firefox/a.jsonl', transcriptSha256: sha(t4) }, { name: 'b', transcript: 'corpus/evidence/round-35/bidi-firefox/b.jsonl', transcriptSha256: sha(t4) }] }, null, 1) + '\n');
  score('c2-J4-duplicate-run', C2, commit('control c2 J4 one transcript at two paths'), clone);
  // J5 — driver that imports this counter's live recorder
  reset();
  fakeSource('S900');
  put(ENTRY, entryFrom('S900'));
  const drv5 = "import { liveRecordFirefox } from '../.ufo/waves/round-35/counters/c2-firefox-bidi.mjs';\nvoid liveRecordFirefox;\n";
  put('scripts/bidi-firefox-reuse.mjs', drv5);
  for (const r of runs3) put(r.transcript, readFileSync(join(LANE, r32.runs[runs3.indexOf(r)].transcript), 'utf8'));
  put(RECEIPT, JSON.stringify({ ...r32, browserVersion: '158.0.1', driver: 'scripts/bidi-firefox-reuse.mjs', driverSha256: sha(drv5), runs: r32.runs }, null, 1) + '\n');
  score('c2-J5-driver-imports-counter', C2, commit('control c2 J5 driver imports the counter'), clone);
  writeFileSync(join(HERE, 'controls-summary.json'), JSON.stringify(receipts, null, 1) + '\n');
  console.log(JSON.stringify(receipts, null, 1));
} finally {
  rmSync(dir, { recursive: true, force: true });
}
