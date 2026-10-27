#!/usr/bin/env node
// c1-adjacency-sweep-v6.mjs — tabi round 38, claim C2a (operability — amendment of the
// round-37 frozen v5 counter; the predicate and the split meter's semantics are unchanged).
// Frozen counter.
//
// Amendments over v5 (.ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs):
//   B1 the --list-delta/--list-drift display modes resolve the SAME delta pins as the
//      predicate path, from the SAME rev source (HEAD only when --rev is absent), with
//      the SAME frozen-digest binding; a mismatch is a Refusal (exit 2) (round-37 w1
//      LabratC1: v5's list modes read HEAD/on-disk bytes unbound and the header
//      overclaimed 'at REV'; a caller treating list output as evidence was misled).
//   B2 the list modes' JSON.parse is Refusal-wrapped (a corrupt/absent pins file exits 2
//      with the documented refusal instead of v5's uncaught SyntaxError exit 1).
//   B3 --rev is honored in the list modes (v5 accepted and ignored it).
//
// Amendments over v4 (.ufo/waves/round-36/counters/c1-adjacency-sweep-v4.mjs), each traced
// to its routed item:
//   B1 the round-36 delta pins file is digest-bound: the blob at REV must equal
//      DELTA_PINS_SHA256 (frozen this round) or the counter refuses (round-36 closure
//      routed defect 1 / lesson M2: a substituted pins file returned predicate true with
//      three mis-audited moved rows). Resolvability of the frozen heads stays a refusal.
//   B2 a `moved` audit note's relocation parses only from its canonical `verbatim at :N`
//      clause (the builder's emitted format), never from the first `:<digits>` token
//      anywhere in the note (round-36 routed defect 3: a truthful note with an earlier
//      decoy token was refused).
//   B3 the enforced predicate and this header now carry the same sentence, byte-identical
//      to claims.json's predicate (round-36 routed defect 4).
//
// Question: rounds 33-35 show a fixed newMapped quota on the closed pinned pool cannot be
// met honestly (three consecutive honest stops; round-35 closure routed defect 4: "A fixed
// newMapped quota on a closed, fully screened pool cannot be met honestly; the planned
// split (completeness vs delta discovery) is the lane's own next step"). The meter splits:
//   completeness — every line of the frozen pinned pool (round-35 v3 candidates) stays
//     accounted by the map or the screen ledger (v3's definitions unchanged);
//   drift — every corpus/adjacency-screen-browser.tsv row citing a lane whose head moved
//     after the pin (delta heads frozen at round-36 freeze) is audited in
//     corpus/adjacency-screen-drift.tsv: the row's status is re-derived against the sibling
//     file AT THE FROZEN DELTA HEAD (`unchanged` = same text at the same line; `moved` =
//     same text verbatim at a relocated line the audit names; `stale` = the cited text is
//     absent anywhere at head and a delta-ledger disposition covers the new head text),
//     and every browser-ground line a sibling added post-pin is dispositioned in the delta
//     ledger corpus/adjacency-screen-delta.tsv or mapped by a new verified row under the
//     round-35 n1-n4 rules.
//
// Usage:
//   node c1-adjacency-sweep-v6.mjs --rev <REV> [--repo <lane>] [--fleet <dir>] [--json]
//   node c1-adjacency-sweep-v6.mjs --list-candidates [--repo <lane>] [--fleet <dir>]
//   node c1-adjacency-sweep-v6.mjs --list-drift [--repo <lane>] [--fleet <dir>]
//   node c1-adjacency-sweep-v6.mjs --list-delta [--repo <lane>] [--fleet <dir>]
// Exit: 0 predicate met; 1 evaluated, predicate not met; 2 could not evaluate.
//
// Inputs are git objects only: the lane at --rev and at BASELINE; each sibling at its frozen
// round-35 pin (completeness) and at its frozen round-36 delta head (drift leg — heads are
// read from .ufo/waves/round-36/baseline/c1-delta-pins.json at REV and verified resolvable;
// a sibling working tree is never touched). scripts/check-adjacency.mjs is taken from --rev,
// must equal ADJ_GATE_SHA256, is written to a scratch file under $TMPDIR (lstat-refused on
// any symlink component) and run `--at REV --repo <lane> --fleet <fleet> --json`; the
// scratch file is removed on exit.
//
// Definitions (frozen):
//   pinned pool / mapped / screened / unaccounted / newMapped  — exactly v3
//     (.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs), BASELINE at the round-35
//     tip; newMapped carries no quota this round (reported, not gated).
//   drift rows    every corpus/adjacency-screen-browser.tsv row at REV whose ref's lane is
//     drifted (DELTA_PINS[lane] != PINS[lane]); its cited text is the trimmed line at
//     (<lane>-shokunin, pin, path, ln).
//   observed status of a drift row — derived by this counter at the frozen delta head:
//     `unchanged` the file exists at head and line ln holds the cited text verbatim;
//     `moved`     the file exists, line ln differs, and the cited text appears verbatim
//                 at >= 1 other line (the audit's note must name one of them as `:<N>`);
//     `stale`     the file is absent at head or the cited text appears nowhere at head.
//   audit row     a corpus/adjacency-screen-drift.tsv data row at REV:
//     `sibling_ref<TAB>status<TAB>note`; key exactly the screen row's ref; status one of
//     the three; must equal the observed status; for `moved`, note must carry `:<N>`
//     where the cited text verifies verbatim at head line N; `unchanged`/`stale` carry
//     `-` or a free note. One audit row per ref — duplicates are findings.
//   delta pool    every BG, non-tabi line at a frozen delta head whose
//     (lane, path, trimmed text) is absent from the pin lines — keyed
//     `<lane>-shokunin@<head>:<path>:<line>`.
//   delta accounted — a verified map row whose sibling_ref is exactly the delta key under
//     the n1-n4 new-row rules; or a corpus/adjacency-screen-delta.tsv row under the v3
//     screen rules (reason vocabulary + verbatim quote + same-surface/`-` discipline).
//   stale-re-dispositioned — a `stale` audit row whose lane,path at the delta head is
//     either absent (file gone: no new text to disposition) or whose new head text at
//     every position the cited text vacated is BG-free, or is a delta-accounted candidate
//     keyed at that line. If the head line's new text matches BG, it must be delta-accounted.
// Predicate (frozen) — the same sentence in claims.json, in this header and in the
// receipt's predicateSentence field:
//   check-adjacency verdict clean at REV AND completeness.unaccounted == 0 AND drift.total >= 1 AND drift.auditCoverage == drift.total AND drift.auditFindings == 0 AND drift.staleFindings == 0 AND delta.unaccounted == 0 AND delta.screenFindings == 0 AND delta pins digest == frozen delta pins digest
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, openSync, closeSync, fstatSync, writeSync, lstatSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-r38-c1-adjacency-sweep-v6';
const BASELINE = '11c64b96f357de106c30a71c5e21ca44a3eacdc0';
const ADJ_GATE = 'scripts/check-adjacency.mjs';
const MAP = 'corpus/adjacency.tsv';
const ADJ_GATE_SHA256 = '4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac';
const SCREEN = 'corpus/adjacency-screen-browser.tsv';
const DRIFT_AUDIT = 'corpus/adjacency-screen-drift.tsv';
const DELTA_PINS_PATH = '.ufo/waves/round-36/baseline/c1-delta-pins.json';
// B1: digest of the round-36 frozen delta pins file, bound here (round-37 freeze).
const DELTA_PINS_SHA256 = '810193620393f6e8b76faac4b606977508198de1b9ffd00d3a7440e8f1910655';
const DELTA_SCREEN = 'corpus/adjacency-screen-delta.tsv';
const PRIOR_CANDIDATES = '.ufo/waves/round-34/baseline/c1-candidates.tsv';
const SCREEN_HEADER = ['sibling_ref', 'reason', 'surface', 'quote', 'note'];
const DRIFT_HEADER = ['sibling_ref', 'status', 'note'];
const DRIFT_STATUSES = ['unchanged', 'moved', 'stale'];
const SCREEN_REASONS = ['not-browser-sense', 'same-surface', 'third-lane-report', 'no-claim-declared'];
const PROVINCE = 'PROVINCE.md';
const TABI = /\btabi\b/i;
export const BG = /\b(?:playwright|puppeteer|chromedriver|geckodriver|webdriver|selenium|chromium|headless[ -](?:chrome|chromium|browser|firefox)|devtools protocol|chrome devtools|chrome-devtools|cdp|remote-debugging|browser automation|webbridge|burner[- ]?chrome|musketeer)\b/i;
export const SIDE = /\b(?:own|owns|owned|owner|ownership|refuse|refuses|refused|refusal|deny|denies|denied|never|route|routes|routed|belongs?|report|reports|reported|lease|leases|leased|shared?|contested|stays?|handled?|handles|out of scope|not (?:this|our))\b/i;
const THIRD_LANE = /(?:sibling|overlap|adjacen|fleet-skill-audit|description-rewrites)/i;
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

const PREDICATE_SENTENCE = "check-adjacency verdict clean at REV AND completeness.unaccounted == 0 AND drift.total >= 1 AND drift.auditCoverage == drift.total AND drift.auditFindings == 0 AND drift.staleFindings == 0 AND delta.unaccounted == 0 AND delta.screenFindings == 0 AND delta pins digest == frozen delta pins digest";
class Refusal extends Error {}
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const ENV = { PATH: process.env.PATH, HOME: process.env.HOME, TMPDIR: process.env.TMPDIR || tmpdir(), GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', LC_ALL: 'C' };

function git(repo, args, { allowFail = false } = {}) {
  const r = spawnSync('git', ['-C', repo, '-c', 'core.commitGraph=false', ...args], { encoding: 'buffer', env: { ...ENV, GIT_NO_REPLACE_OBJECTS: '1' }, maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0 && !allowFail) throw new Refusal(`git -C ${repo} ${args.join(' ')} failed: ${r.stderr.toString('utf8').trim()}`);
  return r;
}
function resolveCommit(repo, rev) {
  if (!/^[0-9a-f]{40}$/.test(rev)) throw new Refusal(`revision must be 40-hex: ${rev}`);
  const r = git(repo, ['rev-parse', '--verify', '--quiet', `${rev}^{commit}`], { allowFail: true });
  if (r.status !== 0) throw new Refusal(`unresolvable revision ${rev} in ${repo}`);
  return r.stdout.toString('utf8').trim();
}
function blob(repo, rev, path, { optional = false } = {}) {
  const r = git(repo, ['show', `${rev}:${path}`], { allowFail: true });
  if (r.status !== 0) { if (optional) return null; throw new Refusal(`${path} absent at ${rev} in ${repo}`); }
  return r.stdout;
}
const lines = (buf) => buf.toString('utf8').split('\n').map((l) => l.replace(/\r$/, ''));
const words = (s) => s.trim().split(/\s+/).filter(Boolean);
const refRe = /^([a-z0-9-]+)-shokunin@([0-9a-f]{40}):(.+):([1-9][0-9]*)$/;
const goodQuote = (q) => words(q).length >= 4 && words(q).length <= 25 && q.replace(/\s/g, '').length >= 20;

function siblingFiles(repo, rev) {
  return git(repo, ['ls-tree', '-r', '--name-only', rev]).stdout.toString('utf8').split('\n')
    .filter((p) => p === 'SKILL.md' || (p.startsWith('corpus/knowledge/') && p.endsWith('.md'))).sort();
}
function eachLine(buf, fn) { lines(buf).forEach(fn); }

export function candidates(fleet, lane) {
  const prior = new Set();
  for (const l of lines(blob(lane, BASELINE, PRIOR_CANDIDATES))) {
    if (!l) continue;
    const f = l.split('\t');
    const m = refRe.exec(f[0] || '');
    if (!m) throw new Refusal(`prior candidate row unparseable: ${l.slice(0, 80)}`);
    prior.add(`${m[1]}${m[3]}${(f.slice(2).join('\t') || '').trim()}`);
  }
  const out = [];
  const seen = new Set();
  let priorSkipped = 0;
  for (const [sib, pin] of Object.entries(PINS)) {
    const repo = join(fleet, `${sib}-shokunin`);
    resolveCommit(repo, pin);
    for (const path of siblingFiles(repo, pin)) {
      eachLine(blob(repo, pin, path), (text, i) => {
        if (!BG.test(text) || TABI.test(text)) return;
        const k = `${sib}${path}${text.trim()}`;
        if (prior.has(k)) { priorSkipped += 1; return; }
        if (seen.has(k)) return;
        seen.add(k);
        out.push({ lane: sib, pin, path, line: i + 1, text, key: `${sib}-shokunin@${pin}:${path}:${i + 1}` });
      });
    }
  }
  candidates.priorSkipped = priorSkipped;
  return out;
}

// pin lines: every BG, non-tabi line at the round-35 pins (pool coverage is pin-existence)
export function pinLines(fleet) {
  const set = new Set();
  for (const [sib, pin] of Object.entries(PINS)) {
    const repo = join(fleet, `${sib}-shokunin`);
    resolveCommit(repo, pin);
    for (const path of siblingFiles(repo, pin)) {
      eachLine(blob(repo, pin, path), (text) => {
        if (BG.test(text) && !TABI.test(text)) set.add(`${sib}${path}${text.trim()}`);
      });
    }
  }
  return set;
}

export function deltaCandidates(fleet, deltaPins) {
  const pinSet = pinLines(fleet);
  const out = [];
  const seen = new Set();
  for (const [sib, head] of Object.entries(deltaPins)) {
    if (!(sib in PINS)) throw new Refusal(`delta pin names an unknown sibling: ${sib}`);
    const repo = join(fleet, `${sib}-shokunin`);
    resolveCommit(repo, head); // frozen head must resolve (object presence; no checkout)
    if (head === PINS[sib]) continue;
    for (const path of siblingFiles(repo, head)) {
      eachLine(blob(repo, head, path), (text, i) => {
        if (!BG.test(text) || TABI.test(text)) return;
        const k = `${sib}${path}${text.trim()}`;
        if (pinSet.has(k) || seen.has(k)) return;
        seen.add(k);
        out.push({ lane: sib, head, path, line: i + 1, text, key: `${sib}-shokunin@${head}:${path}:${i + 1}` });
      });
    }
  }
  return out;
}

function parseMap(buf) {
  if (!buf) return [];
  const ls = lines(buf);
  const rows = [];
  for (let i = 1; i < ls.length; i += 1) {
    if (ls[i] === '') continue;
    const f = ls[i].split('\t');
    rows.push({ rowNo: i + 1, fields: f, surface: (f[0] || '').trim(), sibling: (f[1] || '').trim(), siblingRef: (f[2] || '').trim(), siblingQuote: (f[3] || '').trim(), tabiQuote: (f[5] || '').trim(), disposition: (f[6] || '').trim() });
  }
  return rows;
}
const fold = (s) => s.normalize('NFKC').toLowerCase();

// lstat-refused scratch write (round-36 amendment A3): refuse if any path component of the
// scratch dir or the target itself is a symlink; create the file exclusively.
function safeWrite(dir, name, bytes) {
  const target = join(dir, name);
  let p = dir;
  const chain = [];
  while (p !== dirname(p)) { chain.push(p); p = dirname(p); }
  for (const c of chain) {
    let st;
    try { st = lstatSync(c); } catch { continue; } // absent components above the tmp root are fine
    if (st.isSymbolicLink()) throw new Refusal(`refusing to write through symlink component: ${c}`);
  }
  let st;
  try { st = lstatSync(target); } catch { /* absent: good */ }
  if (st) throw new Refusal(`refusing to overwrite existing scratch file: ${target}`);
  const fd = openSync(target, 'wx');
  try {
    const fst = fstatSync(fd);
    if (!fst.isFile()) throw new Refusal(`scratch target is not a regular file: ${target}`);
    writeSync(fd, bytes);
  } finally { closeSync(fd); }
  return target;
}

function runAdjGate(lane, fleet, rev) {
  const src = blob(lane, rev, ADJ_GATE);
  const got = sha256(src);
  if (got !== ADJ_GATE_SHA256) throw new Refusal(`${ADJ_GATE} at ${rev} sha256 ${got} != frozen ${ADJ_GATE_SHA256}`);
  const dir = mkdtempSync(join(ENV.TMPDIR, 'tabi-r36-c1-'));
  try {
    const file = safeWrite(dir, 'check-adjacency.mjs', src);
    const r = spawnSync(process.execPath, [file, '--at', rev, '--repo', lane, '--fleet', fleet, '--json'], { encoding: 'utf8', env: ENV, maxBuffer: 64 * 1024 * 1024 });
    let j = null;
    try { j = JSON.parse(r.stdout.trim().split('\n').pop()); } catch { /* below */ }
    if (!j || (r.status !== 0 && r.status !== 1)) throw new Refusal(`check-adjacency could not evaluate (exit ${r.status}): ${(r.stderr || '').trim().slice(0, 400)}`);
    return { exit: r.status, verdict: j.verdict, rows: j.rows, verified: j.verified, flagged: new Set((j.findings || []).map((f) => f.row)), findings: j.findings || [] };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

function citedLineText(fleet, ref) {
  const m = refRe.exec(ref);
  if (!m) return null;
  const repo = join(fleet, `${m[1]}-shokunin`);
  const b = blob(repo, m[2], m[3], { optional: true });
  if (!b) return null;
  const ls = lines(b);
  const n = Number(m[4]);
  return { lane: m[1], path: m[3], line: n, text: n <= ls.length ? ls[n - 1] : null };
}

export function evaluate({ repo, fleet, rev }) {
  const lane = resolve(repo);
  const REV = resolveCommit(lane, rev);
  const base = resolveCommit(lane, BASELINE);
  const cands = candidates(fleet, lane);
  const gate = runAdjGate(lane, fleet, REV);
  const mapNow = parseMap(blob(lane, REV, MAP));
  const mapBase = parseMap(blob(lane, base, MAP));
  const baseKeys = new Set(mapBase.map((r) => `${fold(r.surface)} ${r.sibling}`));
  const verifiedRows = mapNow.filter((r) => !gate.flagged.has(r.rowNo));
  const byText = new Map();
  for (const r of verifiedRows) {
    const c = citedLineText(fleet, r.siblingRef);
    if (!c || c.path === PROVINCE || c.lane !== r.sibling || c.text === null) continue;
    const k = `${r.sibling}${c.path}${c.text.trim()}`;
    if (!byText.has(k)) byText.set(k, []);
    byText.get(k).push(r);
  }
  // screen ledger (completeness pool)
  const screenBuf = blob(lane, REV, SCREEN);
  const screenFindings = [];
  const screened = new Map();
  const screenRows = [];
  {
    const ls = lines(screenBuf);
    if (ls[0] !== SCREEN_HEADER.join('\t')) screenFindings.push({ row: 1, reason: 'screen-header' });
    else {
      const candByKey = new Map(cands.map((c) => [c.key, c]));
      const verifiedSurfaces = new Set(verifiedRows.map((r) => `${fold(r.surface)} ${r.sibling}`));
      for (let i = 1; i < ls.length; i += 1) {
        if (ls[i] === '') continue;
        const f = ls[i].split('\t').map((x) => x.trim());
        const rowNo = i + 1;
        if (f.length !== SCREEN_HEADER.length) { screenFindings.push({ row: rowNo, reason: 'screen-columns' }); continue; }
        const [ref, reason, surface, quote] = f;
        screenRows.push({ rowNo, ref, reason, surface, quote });
        const c = candByKey.get(ref);
        if (!c) { screenFindings.push({ row: rowNo, reason: 'screen-not-a-candidate', detail: ref }); continue; }
        if (!SCREEN_REASONS.includes(reason)) { screenFindings.push({ row: rowNo, reason: 'screen-reason-unknown', detail: reason }); continue; }
        if (!((goodQuote(quote) && c.text.includes(quote)) || (quote === c.text.trim() && words(quote).length <= 25))) { screenFindings.push({ row: rowNo, reason: 'screen-quote', detail: ref }); continue; }
        if (reason === 'same-surface') {
          if (!verifiedSurfaces.has(`${fold(surface)} ${c.lane}`)) { screenFindings.push({ row: rowNo, reason: 'screen-surface-unmapped', detail: `${surface} ${c.lane}` }); continue; }
        } else if (surface !== '-') { screenFindings.push({ row: rowNo, reason: 'screen-surface-not-dash', detail: surface }); continue; }
        if (screened.has(ref)) { screenFindings.push({ row: rowNo, reason: 'screen-duplicate', detail: ref }); continue; }
        screened.set(ref, { rowNo, reason, surface });
      }
    }
  }
  const per = cands.map((c) => {
    const mappedBy = (byText.get(`${c.lane}${c.path}${c.text.trim()}`) || []).map((r) => r.rowNo);
    const s = screened.get(c.key) || null;
    return { key: c.key, lane: c.lane, path: c.path, line: c.line, mappedBy, screened: s ? s.reason : null, accounted: mappedBy.length > 0 || !!s };
  });
  const mappedRowNos = new Set(per.flatMap((p) => p.mappedBy));
  const tabiBaseLines = new Map();
  const tabiDeclaration = (r) => {
    const m = /^([A-Za-z0-9_./-]+):([1-9][0-9]*)$/.exec((r.fields[4] || '').trim());
    if (!m) return null;
    const now = blob(lane, REV, m[1], { optional: true });
    if (!now) return null;
    const t = lines(now)[Number(m[2]) - 1];
    if (t === undefined) return null;
    if (!tabiBaseLines.has(m[1])) { const b = blob(lane, base, m[1], { optional: true }); tabiBaseLines.set(m[1], new Set(b ? lines(b).map((x) => x.trim()) : [])); }
    return { text: t, isNew: !tabiBaseLines.get(m[1]).has(t.trim()) };
  };
  const baseCited = new Set();
  for (const r of mapBase) {
    const c = citedLineText(fleet, r.siblingRef);
    if (c && c.text !== null) baseCited.add(`${c.lane}${c.path}${c.text.trim()}`);
  }
  const refusals = [];
  const newRowOk = (r) => {
    if (baseKeys.has(`${fold(r.surface)} ${r.sibling}`)) return false;
    if (!mappedRowNos.has(r.rowNo)) return false;
    const why = (w) => { refusals.push({ row: r.rowNo, surface: r.surface, sibling: r.sibling, why: w }); return false; };
    const sibTok = new RegExp(`\\b${r.sibling.replace(/[^a-z0-9-]/g, '')}\\b`, 'i');
    const decl = tabiDeclaration(r);
    if (!decl || !decl.isNew || !sibTok.test(r.tabiQuote) || !decl.text.includes(r.tabiQuote)) return why('n1-tabi-declaration');
    const c = citedLineText(fleet, r.siblingRef);
    if (!c || c.text === null) return why('n2-sibling-line');
    if (!decl.text.includes(c.path)) return why('n1-declaration-names-no-sibling-path');
    const tref = (r.fields[4] || '').trim();
    if (verifiedRows.some((o) => o !== r && (o.fields[4] || '').trim() === tref && !baseKeys.has(`${fold(o.surface)} ${o.sibling}`))) return why('n1-shared-tabi-ref');
    if (baseCited.has(`${c.lane}${c.path}${c.text.trim()}`)) return why('n2-rename-route');
    if (THIRD_LANE.test(c.path)) return why('n3-third-lane-record');
    if (r.disposition === 'ruled' || r.disposition === 'contested-open' || r.disposition === 'refused-route') return true;
    if (r.disposition === 'split-declared') return !BG.test(r.siblingQuote) ? why('n4-split-quote-not-browser-ground') : !SIDE.test(r.siblingQuote) ? why('n4-split-quote-states-no-side') : true;
    return why('n4-disposition');
  };
  const newMappedRows = verifiedRows.filter(newRowOk);

  // ---- delta pins (frozen heads) ----
  const pinsBuf = blob(lane, REV, DELTA_PINS_PATH);
  if (pinsBuf === null) throw new Refusal(`${DELTA_PINS_PATH} absent at ${REV}`);
  // B1: the pins file is bound to its frozen digest at REV.
  const pinsDigest = sha256(pinsBuf);
  if (pinsDigest !== DELTA_PINS_SHA256) throw new Refusal(`${DELTA_PINS_PATH} at ${REV} sha256 ${pinsDigest} != frozen ${DELTA_PINS_SHA256}`);
  let deltaPins;
  try { deltaPins = JSON.parse(pinsBuf.toString('utf8')); } catch { throw new Refusal(`${DELTA_PINS_PATH} is not JSON`); }
  if (typeof deltaPins !== 'object' || deltaPins === null || Array.isArray(deltaPins)) throw new Refusal(`${DELTA_PINS_PATH} must be a JSON object lane -> 40-hex head`);
  for (const [sib, head] of Object.entries(deltaPins)) {
    if (!/^[0-9a-f]{40}$/.test(String(head))) throw new Refusal(`delta head for ${sib} is not 40-hex`);
    if (!(sib in PINS)) throw new Refusal(`delta pin names an unknown sibling: ${sib}`);
    resolveCommit(join(fleet, `${sib}-shokunin`), String(head));
  }
  const drifted = new Set(Object.entries(deltaPins).filter(([sib, head]) => head !== PINS[sib]).map(([sib]) => sib));

  // ---- drift rows: screen rows citing drifted lanes ----
  const driftRows = screenRows.filter((sr) => {
    const m = refRe.exec(sr.ref);
    return m && m[1] !== undefined && drifted.has(m[1]);
  });

  // observed status per drift row at the frozen delta head
  const observed = new Map();
  const headFileCache = new Map();
  const headLines = (sib, head, path) => {
    const k = `${sib}${head}${path}`;
    if (!headFileCache.has(k)) {
      const b = blob(join(fleet, `${sib}-shokunin`), head, path, { optional: true });
      headFileCache.set(k, b === null ? null : lines(b));
    }
    return headFileCache.get(k);
  };
  for (const sr of driftRows) {
    const m = refRe.exec(sr.ref);
    const [sib, pin, path, n] = [m[1], m[2], m[3], Number(m[4])];
    const pinBuf = blob(join(fleet, `${sib}-shokunin`), pin, path, { optional: true });
    if (!pinBuf) { observed.set(sr.ref, { status: 'stale', detail: 'pin file absent' }); continue; }
    const pinText = lines(pinBuf)[n - 1];
    const cited = pinText === undefined ? null : pinText.trim();
    if (cited === null) { observed.set(sr.ref, { status: 'stale', detail: 'pin line absent' }); continue; }
    const hl = headLines(sib, deltaPins[sib], path);
    if (hl === null) { observed.set(sr.ref, { status: 'stale', detail: 'head file absent', newLine: null }); continue; }
    const headAtN = n <= hl.length ? hl[n - 1].trim() : undefined;
    if (headAtN === cited) { observed.set(sr.ref, { status: 'unchanged', detail: 'same text at same line', newLine: n }); continue; }
    const relocations = hl.map((t, i) => [i + 1, t.trim()]).filter(([, t]) => t === cited).map(([i]) => i);
    if (relocations.length) { observed.set(sr.ref, { status: 'moved', detail: `verbatim at :${relocations.join(',:')}`, relocations, newLine: n }); continue; }
    observed.set(sr.ref, { status: 'stale', detail: 'cited text absent at head', newLine: n });
  }

  // ---- audit ledger ----
  const auditFindings = [];
  const audited = new Map();
  {
    const ab = blob(lane, REV, DRIFT_AUDIT, { optional: true });
    if (ab) {
      const ls = lines(ab);
      if (ls[0] !== DRIFT_HEADER.join('\t')) auditFindings.push({ row: 1, reason: 'audit-header' });
      else {
        for (let i = 1; i < ls.length; i += 1) {
          if (ls[i] === '') continue;
          const f = ls[i].split('\t');
          const rowNo = i + 1;
          if (f.length !== DRIFT_HEADER.length) { auditFindings.push({ row: rowNo, reason: 'audit-columns' }); continue; }
          const [ref, status, note] = f.map((x) => x.trim());
          const m = refRe.exec(ref);
          if (!m || !drifted.has(m[1])) { auditFindings.push({ row: rowNo, reason: 'audit-not-a-drift-ref', detail: ref }); continue; }
          const obs = observed.get(ref);
          if (!obs) { auditFindings.push({ row: rowNo, reason: 'audit-not-a-drift-row', detail: ref }); continue; }
          if (!DRIFT_STATUSES.includes(status)) { auditFindings.push({ row: rowNo, reason: 'audit-status-unknown', detail: status }); continue; }
          if (status !== obs.status) { auditFindings.push({ row: rowNo, reason: 'audit-status-mismatch', detail: `${status} != observed ${obs.status}` }); continue; }
          if (status === 'moved') {
            // B2: the relocation must parse from the canonical `verbatim at :N` clause —
            // never from the first `:<digits>` token anywhere in the note.
            const mnote = /\bverbatim at :([1-9][0-9]*)\b/.exec(note || '');
            if (!mnote) { auditFindings.push({ row: rowNo, reason: 'audit-moved-no-relocation', detail: note }); continue; }
            const hl = headLines(m[1], deltaPins[m[1]], m[3]);
            const cited = lines(blob(join(fleet, `${m[1]}-shokunin`), m[2], m[3]))[Number(m[4]) - 1].trim();
            const nn = Number(mnote[1]);
            if (!hl || nn > hl.length || hl[nn - 1].trim() !== cited) { auditFindings.push({ row: rowNo, reason: 'audit-moved-wrong-relocation', detail: `:${nn}` }); continue; }
          }
          if (audited.has(ref)) { auditFindings.push({ row: rowNo, reason: 'audit-duplicate', detail: ref }); continue; }
          audited.set(ref, { rowNo, status });
        }
      }
    }
  }
  const auditCoverage = audited.size;
  const missing = driftRows.filter((sr) => !audited.has(sr.ref)).map((sr) => sr.ref);

  // ---- stale re-disposition ----
  const dcands = deltaCandidates(fleet, deltaPins);
  const deltaScreenFindings = [];
  const deltaScreened = new Map();
  {
    const dBuf = blob(lane, REV, DELTA_SCREEN, { optional: true });
    if (dBuf) {
      const ls = lines(dBuf);
      if (ls[0] !== SCREEN_HEADER.join('\t')) deltaScreenFindings.push({ row: 1, reason: 'screen-header' });
      else {
        const candByKey = new Map(dcands.map((c) => [c.key, c]));
        const verifiedSurfaces = new Set(verifiedRows.map((r) => `${fold(r.surface)} ${r.sibling}`));
        for (let i = 1; i < ls.length; i += 1) {
          if (ls[i] === '') continue;
          const f = ls[i].split('\t').map((x) => x.trim());
          const rowNo = i + 1;
          if (f.length !== SCREEN_HEADER.length) { deltaScreenFindings.push({ row: rowNo, reason: 'screen-columns' }); continue; }
          const [ref, reason, surface, quote] = f;
          const c = candByKey.get(ref);
          if (!c) { deltaScreenFindings.push({ row: rowNo, reason: 'screen-not-a-delta-candidate', detail: ref }); continue; }
          if (!SCREEN_REASONS.includes(reason)) { deltaScreenFindings.push({ row: rowNo, reason: 'screen-reason-unknown', detail: reason }); continue; }
          if (!((goodQuote(quote) && c.text.includes(quote)) || (quote === c.text.trim() && words(quote).length <= 25))) { deltaScreenFindings.push({ row: rowNo, reason: 'screen-quote', detail: ref }); continue; }
          if (reason === 'same-surface') {
            if (!verifiedSurfaces.has(`${fold(surface)} ${c.lane}`)) { deltaScreenFindings.push({ row: rowNo, reason: 'screen-surface-unmapped', detail: `${surface} ${c.lane}` }); continue; }
          } else if (surface !== '-') { deltaScreenFindings.push({ row: rowNo, reason: 'screen-surface-not-dash', detail: surface }); continue; }
          if (deltaScreened.has(ref)) { deltaScreenFindings.push({ row: rowNo, reason: 'screen-duplicate', detail: ref }); continue; }
          deltaScreened.set(ref, { rowNo, reason, surface });
        }
      }
    }
  }
  const dcandByKey = new Map(dcands.map((c) => [c.key, c]));
  const deltaMappedByKey = new Map();
  for (const r of verifiedRows) {
    if (!dcandByKey.has(r.siblingRef)) continue;
    if (!newRowOk(r)) continue;
    if (!deltaMappedByKey.has(r.siblingRef)) deltaMappedByKey.set(r.siblingRef, []);
    deltaMappedByKey.get(r.siblingRef).push(r.rowNo);
  }
  const dper = dcands.map((c) => {
    const mappedBy = deltaMappedByKey.get(c.key) || [];
    const s = deltaScreened.get(c.key) || null;
    return { key: c.key, lane: c.lane, path: c.path, line: c.line, mappedBy, screened: s ? s.reason : null, accounted: mappedBy.length > 0 || !!s };
  });
  const deltaUnaccountedKeys = dper.filter((p) => !p.accounted).map((p) => p.key);

  // stale rows whose new head text matches BG must appear delta-accounted at that line
  const staleFindings = [];
  for (const sr of driftRows) {
    const obs = observed.get(sr.ref);
    if (!obs || obs.status !== 'stale') continue;
    if (!audited.has(sr.ref)) continue; // audit coverage catches it
    const m = refRe.exec(sr.ref);
    const [sib, path, n] = [m[1], m[3], Number(m[4])];
    const hl = headLines(sib, deltaPins[sib], path);
    if (!hl) continue; // file gone at head: nothing new to disposition
    const newText = n <= hl.length ? hl[n - 1].trim() : '';
    if (!newText || !BG.test(newText) || TABI.test(newText)) continue; // new text is not browser ground
    const key = `${sib}-shokunin@${deltaPins[sib]}:${path}:${n}`;
    const p = dper.find((x) => x.key === key);
    if (!p || !p.accounted) staleFindings.push({ ref: sr.ref, reason: 'stale-head-text-not-dispositioned', detail: key });
  }

  const out = {
    schema: SCHEMA, rev: REV, baseline: base, adjGateSha256: ADJ_GATE_SHA256,
    deltaPinsSha256: pinsDigest, predicateSentence: PREDICATE_SENTENCE,
    adjacency: { verdict: gate.verdict, rows: gate.rows, verified: gate.verified, findings: gate.findings.length },
    completeness: {
      candidates: cands.length,
      priorCandidatesSkipped: candidates.priorSkipped,
      mapped: per.filter((p) => p.mappedBy.length).length,
      screened: per.filter((p) => !p.mappedBy.length && p.screened).length,
      unaccounted: per.filter((p) => !p.accounted).length,
      newMapped: newMappedRows.length,
      newMappedRows: newMappedRows.map((r) => ({ row: r.rowNo, surface: r.surface, sibling: r.sibling, disposition: r.disposition })),
      newRowRefusals: refusals,
      screenFindings,
      unaccountedKeys: per.filter((p) => !p.accounted).map((p) => p.key),
    },
    drift: {
      pins: deltaPins,
      lanesWithDrift: [...drifted],
      total: driftRows.length,
      observed: Object.fromEntries(DRIFT_STATUSES.map((s) => [s, [...observed.values()].filter((o) => o.status === s).length])),
      auditCoverage,
      auditFindings,
      auditMissing: missing,
      staleFindings,
    },
    delta: {
      total: dper.length,
      screened: dper.filter((p) => !p.mappedBy.length && p.screened).length,
      mapped: dper.filter((p) => p.mappedBy.length).length,
      unaccounted: dper.filter((p) => !p.accounted).length,
      screenFindings: deltaScreenFindings,
      unaccountedKeys: deltaUnaccountedKeys,
    },
  };
  // legacy top-level mirrors (completeness leg == v3 semantics)
  out.candidates = out.completeness.candidates;
  out.mapped = out.completeness.mapped;
  out.screened = out.completeness.screened;
  out.unaccounted = out.completeness.unaccounted;
  out.newMapped = out.completeness.newMapped;
  out.screenFindings = out.completeness.screenFindings;
  out.predicate = gate.verdict === 'clean'
    && out.completeness.unaccounted === 0
    && out.drift.total >= 1
    && auditCoverage === out.drift.total
    && auditFindings.length === 0
    && staleFindings.length === 0
    && out.delta.unaccounted === 0
    && deltaScreenFindings.length === 0
    && pinsDigest === DELTA_PINS_SHA256;
  return out;
}

function main() {
  const argv = process.argv.slice(2);
  const o = { repo: resolve(dirname(fileURLToPath(import.meta.url)), '../../../..'), fleet: null, rev: null, json: false, list: false, listDelta: false, listDrift: false };
  try {
    for (let i = 0; i < argv.length; i += 1) {
      const a = argv[i];
      if (a === '--json') o.json = true;
      else if (a === '--list-candidates') o.list = true;
      else if (a === '--list-delta') o.listDelta = true;
      else if (a === '--list-drift') o.listDrift = true;
      else if (['--repo', '--fleet', '--rev'].includes(a)) { const v = argv[++i]; if (v === undefined) throw new Refusal(`missing value for ${a}`); o[a.slice(2)] = v; }
      else throw new Refusal(`unknown argument ${a}`);
    }
    o.fleet = resolve(o.fleet || join(resolve(o.repo), '..'));
    const lane = resolve(o.repo);
    if (o.list) { for (const c of candidates(o.fleet, lane)) console.log(`${c.key}\t${c.text.trim()}`); process.exit(0); }
    if (o.listDelta || o.listDrift) {
      // r38 B1: the list modes resolve the SAME delta pins as the predicate path, from the
      // SAME rev source, with the SAME frozen-digest binding (round-37 w1 LabratC1: v5's
      // list modes read HEAD/on-disk bytes unbound, and the header overclaimed "at REV").
      // --rev is honored here (v5 accepted and ignored it); absent, lane HEAD is used.
      const headRev = o.rev || git(lane, ['rev-parse', 'HEAD']).stdout.toString('utf8').trim();
      const pinsBuf = blob(lane, headRev, DELTA_PINS_PATH);
      if (pinsBuf === null) throw new Refusal(`${DELTA_PINS_PATH} absent at ${headRev}`);
      const pinsDigest = sha256(pinsBuf);
      if (pinsDigest !== DELTA_PINS_SHA256) throw new Refusal(`${DELTA_PINS_PATH} at ${headRev} sha256 ${pinsDigest} != frozen ${DELTA_PINS_SHA256}`);
      let deltaPins;
      try { deltaPins = JSON.parse(pinsBuf.toString('utf8')); } catch { throw new Refusal(`${DELTA_PINS_PATH} is not JSON`); }
      if (o.listDelta) {
        for (const c of deltaCandidates(o.fleet, deltaPins)) console.log(`${c.key}\t${c.text.trim()}`);
      } else {
        const drifted = new Set(Object.entries(deltaPins).filter(([sib, head]) => head !== PINS[sib]).map(([sib]) => sib));
        const sb = blob(lane, headRev, SCREEN);
        for (const l of lines(sb).slice(1)) {
          if (!l) continue;
          const ref = l.split('\t')[0];
          const m = refRe.exec(ref);
          if (m && drifted.has(m[1])) console.log(ref);
        }
      }
      process.exit(0);
    }
    if (!o.rev) throw new Refusal('usage: --rev <40-hex REV> required');
    const out = evaluate(o);
    if (o.json) console.log(JSON.stringify(out));
    else console.log(`C1_ADJACENCY_SWEEP_V6 predicate=${out.predicate ? 'met' : 'not-met'} rev=${out.rev} adjacency=${out.adjacency.verdict} completeness.unaccounted=${out.completeness.unaccounted} drift.total=${out.drift.total} drift.auditCoverage=${out.drift.auditCoverage} drift.auditFindings=${out.drift.auditFindings.length} drift.staleFindings=${out.drift.staleFindings.length} delta.total=${out.delta.total} delta.unaccounted=${out.delta.unaccounted} delta.screenFindings=${out.delta.screenFindings.length} newMapped=${out.newMapped}`);
    process.exit(out.predicate ? 0 : 1);
  } catch (e) {
    if (!(e instanceof Refusal)) throw e;
    console.error(`C1_ADJACENCY_SWEEP_V6 verdict=could-not-evaluate detail=${e.message}`);
    process.exit(2);
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
