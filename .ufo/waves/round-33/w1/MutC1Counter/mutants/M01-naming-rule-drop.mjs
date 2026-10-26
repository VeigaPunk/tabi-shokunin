#!/usr/bin/env node
// c1-adjacency-sweep.mjs — tabi round 33, claim C1 (adjacency). Frozen counter.
//
// Question: of the browser-domain lines in every sibling lane's PROVINCE.md
// (frozen regex, frozen sibling pins), how many has this lane accounted for —
// either mapped by a verified row of corpus/adjacency.tsv (the round-17 map,
// gated by scripts/check-adjacency.mjs) or screened out with a closed-vocabulary
// reason in corpus/adjacency-screen.tsv — and how many NEW verified map rows
// (absent at the baseline) cover a sweep candidate and name the other side?
//
// Usage:
//   node c1-adjacency-sweep.mjs --rev <REV> [--repo <lane>] [--fleet <dir>] [--json]
//   node c1-adjacency-sweep.mjs --list-candidates [--fleet <dir>]
// Exit: 0 predicate met; 1 evaluated, predicate not met; 2 could not evaluate.
//
// Inputs are read from git objects only: the lane at --rev and at BASELINE,
// each sibling at its frozen pin. scripts/check-adjacency.mjs is taken from
// --rev, must be byte-identical to ADJ_GATE_SHA256 (frozen), is written to a
// scratch file under $TMPDIR (HYAKU_SCRATCH discipline: pass TMPDIR) and run
// as `--at <REV> --repo <lane> --fleet <fleet> --json`. The scratch file is
// removed on exit. Write scope: stdout/stderr and that scratch file only.
//
// Definitions (frozen):
//   candidate   (lane, n, text): line n of <lane>-shokunin PROVINCE.md at
//               PINS[lane] matching REGEX (case-insensitive, word-bounded).
//   mapped      a candidate is mapped when a row of corpus/adjacency.tsv at
//               REV that check-adjacency reports with no finding has
//               sibling == lane, sibling_ref path == PROVINCE.md, and the line
//               it cites (at its own pinned commit) equals the candidate text
//               after trimming surrounding whitespace.
//   screened    a candidate is screened when corpus/adjacency-screen.tsv at REV
//               has a row with sibling_ref exactly
//               <lane>-shokunin@<PINS[lane]>:PROVINCE.md:<n>, a reason in
//               SCREEN_REASONS, a quote that is a verbatim substring of the
//               candidate text (4..25 words, >= 20 non-space chars), and — for
//               reason same-surface — a surface that names a mapped-verified
//               row of the same sibling (any row, old or new); for every other
//               reason the surface column is `-`.
//   unaccounted candidates neither mapped nor screened.
//   newMapped   verified map rows at REV whose folded (surface, sibling) key is
//               absent from the map at BASELINE, that map >= 1 candidate, and
//               that name the other side: disposition ruled or contested-open
//               (check-adjacency already validated the ruling / l0 line), or
//               split-declared / refused-route where sibling_quote contains the
//               word `tabi` or tabi_quote contains the sibling lane token.
// Predicate (frozen): check-adjacency verdict clean at REV AND unaccounted == 0
//   AND newMapped >= 4.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-r33-c1-adjacency-sweep-v1';
const BASELINE = 'b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd';
const ADJ_GATE = 'scripts/check-adjacency.mjs';
const MAP = 'corpus/adjacency.tsv';
const ADJ_GATE_SHA256 = '4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac';
const SCREEN = 'corpus/adjacency-screen.tsv';
const SCREEN_HEADER = ['sibling_ref', 'reason', 'surface', 'quote', 'note'];
const SCREEN_REASONS = ['not-browser-sense', 'same-surface', 'third-lane-report', 'no-claim-declared'];
const PROVINCE = 'PROVINCE.md';
const NEW_TARGET = 4;
const REGEX = /\b(browsers?|chromium|chrome|cdp|devtools|playwright|puppeteer|webdriver|bidi|selenium|webbridge|tabi|crawl(er|ers|ing)?|scrap(e|er|ers|ing))\b/i;
const PINS = Object.freeze({
  audio: '7a2fcd4f08831154686e4e323031f41fffdb077f',
  chousa: '00f8c7f5272a1d98b6d34913985fa4537e00aaf9',
  'game-dev-2d': '7753d49b16674e122ed134403e7a9b301f2cbf7e',
  'game-dev-3d': '89dd182b70943a20ae9aa6c1ed0e3c9b6e79c080',
  kagi: '69b61db46be4ed955994f6f1d1cba522bc5f4e97',
  kaidoku: '8b9634ed8253653e7eb994aad9860a624e3b0366',
  kake: '044048597d62f3199494b63b36e90dd57825e350',
  kama: '0163fea2dab3f282ebd70c71da9ab5de4cedf733',
  kasegi: '2387dcf6ccfefcfb703783387b9aade8fc82abfa',
  kengaku: '7984fd30892b54b1eff01054206ad54fc535021c',
  kotoba: '65a5c7a663249e0522cc49e4a148424200d9ddfe',
  kotodama: 'f556d1049fe651d3d63975600b13acd9fb686f15',
  kumitate: '8d557f85312de4fcc82e09ff735d21436bc3746d',
  lore: '380ef3abc7c7af11d7f23e9f9c82bb1937e1f695',
  mado: '74c606a1c7fd52a6bb85bb1c786529c926040c73',
  mori: 'aa3af1ec3118ee7766dfce1d9709ce3c0c3f6bfd',
  revenger: '6da884c6708fa25a7af013b6fc6802492e3264fa',
  souji: 'a7c35c24bdd8bae5cff9766ace02a81915756701',
  tameshi: 'c6295cb0473ec75a7f97b479321706b684adefac',
  tsukuroi: '9cc9aa77e30e0e23de2d4d2697b3b218ada02969',
});

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
const goodQuote = (q) => words(q).length >= 4 && words(q).length <= 25 && q.replace(/\s/g, '').length >= 20;

export function candidates(fleet) {
  const out = [];
  for (const [lane, pin] of Object.entries(PINS)) {
    const repo = join(fleet, `${lane}-shokunin`);
    resolveCommit(repo, pin);
    const ls = lines(blob(repo, pin, PROVINCE));
    ls.forEach((text, i) => { if (REGEX.test(text)) out.push({ lane, pin, line: i + 1, text, key: `${lane}-shokunin@${pin}:${PROVINCE}:${i + 1}` }); });
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
const refRe = /^([a-z0-9-]+)-shokunin@([0-9a-f]{40}):(.+):([1-9][0-9]*)$/;

function runAdjGate(lane, fleet, rev) {
  const src = blob(lane, rev, ADJ_GATE);
  const got = sha256(src);
  if (got !== ADJ_GATE_SHA256) throw new Refusal(`${ADJ_GATE} at ${rev} sha256 ${got} != frozen ${ADJ_GATE_SHA256}`);
  const dir = mkdtempSync(join(ENV.TMPDIR, 'tabi-r33-c1-'));
  try {
    const file = join(dir, 'check-adjacency.mjs');
    writeFileSync(file, src);
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
  const cands = candidates(fleet);
  const gate = runAdjGate(lane, fleet, REV);
  const mapNow = parseMap(blob(lane, REV, MAP));
  const mapBase = parseMap(blob(lane, base, MAP));
  const baseKeys = new Set(mapBase.map((r) => `${fold(r.surface)} ${r.sibling}`));
  const verifiedRows = mapNow.filter((r) => !gate.flagged.has(r.rowNo));
  const byText = new Map();
  for (const r of verifiedRows) {
    const c = citedLineText(fleet, r.siblingRef);
    if (!c || c.path !== PROVINCE || c.lane !== r.sibling || c.text === null) continue;
    const k = `${r.sibling}\u0000${c.text.trim()}`;
    if (!byText.has(k)) byText.set(k, []);
    byText.get(k).push(r);
  }
  // screen ledger
  const screenBuf = blob(lane, REV, SCREEN, { optional: true });
  const screenFindings = [];
  const screened = new Map();
  if (screenBuf) {
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
        const c = candByKey.get(ref);
        if (!c) { screenFindings.push({ row: rowNo, reason: 'screen-not-a-candidate', detail: ref }); continue; }
        if (!SCREEN_REASONS.includes(reason)) { screenFindings.push({ row: rowNo, reason: 'screen-reason-unknown', detail: reason }); continue; }
        if (!goodQuote(quote) || !c.text.includes(quote)) { screenFindings.push({ row: rowNo, reason: 'screen-quote', detail: ref }); continue; }
        if (reason === 'same-surface') {
          if (!verifiedSurfaces.has(`${fold(surface)} ${c.lane}`)) { screenFindings.push({ row: rowNo, reason: 'screen-surface-unmapped', detail: `${surface} ${c.lane}` }); continue; }
        } else if (surface !== '-') { screenFindings.push({ row: rowNo, reason: 'screen-surface-not-dash', detail: surface }); continue; }
        if (screened.has(ref)) { screenFindings.push({ row: rowNo, reason: 'screen-duplicate', detail: ref }); continue; }
        screened.set(ref, { rowNo, reason, surface });
      }
    }
  }
  const per = cands.map((c) => {
    const mappedBy = (byText.get(`${c.lane}\u0000${c.text.trim()}`) || []).map((r) => r.rowNo);
    const s = screened.get(c.key) || null;
    return { key: c.key, lane: c.lane, line: c.line, mappedBy, screened: s ? s.reason : null, accounted: mappedBy.length > 0 || !!s };
  });
  const mappedRowNos = new Set(per.flatMap((p) => p.mappedBy));
  const newMappedRows = verifiedRows.filter((r) => {
    if (baseKeys.has(`${fold(r.surface)} ${r.sibling}`)) return false;
    if (!mappedRowNos.has(r.rowNo)) return false;
    return true;
  });
  const out = {
    schema: SCHEMA, rev: REV, baseline: base, adjGateSha256: ADJ_GATE_SHA256,
    adjacency: { verdict: gate.verdict, rows: gate.rows, verified: gate.verified, findings: gate.findings.length },
    candidates: cands.length,
    mapped: per.filter((p) => p.mappedBy.length).length,
    screened: per.filter((p) => !p.mappedBy.length && p.screened).length,
    unaccounted: per.filter((p) => !p.accounted).length,
    newMapped: newMappedRows.length,
    newMappedRows: newMappedRows.map((r) => ({ row: r.rowNo, surface: r.surface, sibling: r.sibling, disposition: r.disposition })),
    screenFindings,
    unaccountedKeys: per.filter((p) => !p.accounted).map((p) => p.key),
    perLane: Object.fromEntries(Object.keys(PINS).map((l) => [l, per.filter((p) => p.lane === l).length])),
  };
  out.predicate = gate.verdict === 'clean' && out.unaccounted === 0 && out.newMapped >= NEW_TARGET;
  return out;
}

function main() {
  const argv = process.argv.slice(2);
  const o = { repo: resolve(dirname(fileURLToPath(import.meta.url)), '../../../..'), fleet: null, rev: null, json: false, list: false };
  try {
    for (let i = 0; i < argv.length; i += 1) {
      const a = argv[i];
      if (a === '--json') o.json = true;
      else if (a === '--list-candidates') o.list = true;
      else if (['--repo', '--fleet', '--rev'].includes(a)) { const v = argv[++i]; if (v === undefined) throw new Refusal(`missing value for ${a}`); o[a.slice(2)] = v; }
      else throw new Refusal(`unknown argument ${a}`);
    }
    o.fleet = resolve(o.fleet || join(resolve(o.repo), '..'));
    if (o.list) { for (const c of candidates(o.fleet)) console.log(`${c.key}\t${c.text.trim()}`); process.exit(0); }
    if (!o.rev) throw new Refusal('usage: --rev <40-hex REV> required');
    const out = evaluate(o);
    if (o.json) console.log(JSON.stringify(out));
    else console.log(`C1_ADJACENCY_SWEEP predicate=${out.predicate ? 'met' : 'not-met'} rev=${out.rev} adjacency=${out.adjacency.verdict} candidates=${out.candidates} mapped=${out.mapped} screened=${out.screened} unaccounted=${out.unaccounted} newMapped=${out.newMapped} screenFindings=${out.screenFindings.length}`);
    process.exit(out.predicate ? 0 : 1);
  } catch (e) {
    if (!(e instanceof Refusal)) throw e;
    console.error(`C1_ADJACENCY_SWEEP verdict=could-not-evaluate detail=${e.message}`);
    process.exit(2);
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
