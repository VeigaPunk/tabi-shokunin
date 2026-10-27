#!/usr/bin/env node
// c1-routed-defects.mjs — tabi round 38, claim C1 (calibration: the round-37 verifier
// spot-check's six routed defects, each re-derived from committed bytes at REV).
// Frozen counter.
//
// Question: are the six round-37 routed defects (self-assessment mismatches the lane's
// own text carried) corrected at REV, with each correction itself re-derivable rather
// than asserted? The counter never trusts prose at face value: for every defect it
// re-derives the corrected figure from the committed evidence and compares it to the
// text's stated figure — a "correction" that states a number the evidence does not
// reproduce is itself a routed defect.
//
// Defects (round-37 verifier spot-check, `corpus/lessons/round-37-verifier-spotcheck.md`):
//   D1 SCORECARD wave-block overclaim: the stale "### Round 37 — waves and seats" claim
//      ("68 seats", w1 34 + w2 34 — w2 was never dispatched) is superseded by a later
//      append-only correction naming the true shape, and the true shape is re-derived
//      from w1-results.json (seats == 34) and the ABSENCE of w2 dispatch artifacts
//      (no w2.ready, no w2-results.json, no w2/ seat dir) at REV.
//   D2 report seat-verdict tally: LOG.md's round-38 section states the corrected tally
//      (23 ok / 11 finding), and the counter recomputes it from the committed w1 seat
//      reports (34 reports, last `VERDICT <class>` line per report).
//   D3 LOG.md accuracy: the round-38 LOG section is hash-carrying — every round-37 lane
//      commit hash appears and each resolves `git cat-file -t` == commit AND
//      `git merge-base --is-ancestor <h> <REV>`; the freeze-entry landing hash is stated
//      as `34ed508c` (not `99437d29` as the report's Landed-changes bullet read).
//   D4 lesson M3: `corpus/lessons/round-38.md` has `## Mistakes` with a row carrying a
//      `Captured-by:` field that names round-37's M3 class (surface-mismatch) AND a
//      red-control receipt exists whose mutated predicate sentence is REFUSED
//      (.ufo/waves/round-38/baseline/m3-sentence-mutant.json, exit != 0 recorded).
//   D5 census receipts carry parsed counts: `.ufo/waves/round-38/measure/census-end.txt`
//      contains a counts block (rows / tier histogram / status histogram) that EQUALS
//      this counter's own parse of corpus/SOURCES.md at REV.
//   D6 numstat window precision: `.ufo/waves/round-38/measure/numstat-at-*.txt` diffs
//      exactly baseline..REV — the receipt's header names both endpoints and the
//      baseline equals the frozen round-start baseline.
//
// Usage: node c1-routed-defects.mjs --rev <40-hex REV> [--repo <lane>] [--json]
// Exit: 0 predicate met; 1 evaluated, predicate not met; 2 could not evaluate.
// Inputs: git objects of the lane at --rev; D5/D6 receipt files are read at --repo's
// worktree (they are committed measurement outputs, not git-object data).
// Write scope: stdout/stderr only.
// Predicate (frozen) — the same sentence in claims.json and the receipt's
// predicateSentence field:
//   D1 stale-line-present AND superseding-correction-present AND re-derived seats == 34 AND w2-artifacts absent AND D2 tally stated == recomputed AND D3 every hash present+ancestor AND D4 captured-by present AND mutant receipt refused AND D5 receipt counts == counter counts AND D6 window endpoints == baseline..REV
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const SCHEMA = 'tabi-r38-c1-routed-defects';
const BASELINE = '3f42a5c7cc19a544c879577e4bad7b7fd9d61a35';
const ROUND37_COMMITS = ['99437d29de036415a9f2d0524343617a3b19988a', 'f76da094f0ff0ad9856d2232858241e3f7841379', '34ed508c47ca8727450d7f210bc440dadb61f883', '5a2ebb6af9cbfe024c4a98d483dfe476a02e59f1', 'f485cce10c8640eda64f5e555f99894ed4de7fb0', 'bf8ecd5a663d9773d92c4842ed1874814b8a9a83'];
const PREDICATE_SENTENCE = "D1 stale-line-present AND superseding-correction-present AND re-derived seats == 34 AND w2-artifacts absent AND D2 tally stated == recomputed AND D3 every hash present+ancestor AND D4 captured-by present AND mutant receipt refused AND D5 receipt counts == counter counts AND D6 window endpoints == baseline..REV";

class Refusal extends Error {}
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const git = (repo, args) => spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8', maxBuffer: 64 << 20 });
function blob(repo, rev, path) {
  const r = git(repo, ['show', `${rev}:${path}`]);
  return r.status === 0 ? r.stdout : null;
}
function resolveCommit(repo, rev) {
  const r = git(repo, ['rev-parse', '--verify', `${rev}^{commit}`]);
  if (r.status !== 0) throw new Refusal(`cannot resolve ${rev}`);
  return r.stdout.trim();
}

export function evaluate({ repo, rev }) {
  const REV = resolveCommit(repo, rev);
  const out = {
    schema: SCHEMA, rev: REV, baseline: BASELINE,
    d1: {}, d2: {}, d3: {}, d4: {}, d5: {}, d6: {},
    findings: [], predicateSentence: PREDICATE_SENTENCE, predicate: false,
  };
  const F = (id, why) => out.findings.push({ id, why });

  // ---------- D1: SCORECARD wave-block overclaim corrected ----------
  {
    const sc = blob(repo, REV, 'SCORECARD.md');
    if (sc === null) { F('d1-entry', 'SCORECARD.md absent'); }
    else {
      const lines = sc.split('\n');
      const stale = lines.findIndex((l) => l.includes('68 seats') && /w1\s*34/.test(l));
      const corr = lines.findIndex((l, i) => i > stale && stale >= 0 && (/34 seats/.test(l) || /34 \/ 0|w2.*(not dispatched|never dispatched|deferred|absent)/i.test(l)) && /round 38|round-38|correction|supersed/i.test(lines.slice(Math.max(0, i - 6), i + 6).join('\n')));
      out.d1.stalePresent = stale >= 0;
      out.d1.supersedingCorrection = corr >= 0;
      if (stale < 0) F('d1-stale', 'the stale 68-seat line was not found (was it silently removed? corrections are append-only, the stale line must REMAIN)');
      if (corr < 0) F('d1-correction', 'no append-only round-38 correction naming the true shape after the stale line');
      const w1 = blob(repo, REV, '.ufo/waves/round-37/w1-results.json');
      if (w1 === null) { F('d1-results', 'w1-results.json absent'); }
      else {
        try { out.d1.seats = JSON.parse(w1).seats; } catch { out.d1.seats = 'unparseable'; }
        if (out.d1.seats !== 34) F('d1-seats', `w1-results.json seats ${JSON.stringify(out.d1.seats)} != 34`);
      }
      for (const p of ['.ufo/waves/round-37/w2.ready', '.ufo/waves/round-37/w2-results.json']) {
        if (blob(repo, REV, p) !== null) F('d1-w2', `${p} exists at REV`);
      }
      out.d1.w2Absent = !out.findings.some((f) => f.id === 'd1-w2');
    }
  }

  // ---------- D2: report tally corrected and re-derived ----------
  {
    const log = blob(repo, REV, 'LOG.md');
    if (log === null) { F('d2-entry', 'LOG.md absent'); }
    else {
      const r38 = log.slice(log.indexOf('## Round 38'));
      const m = /23\s*ok\s*\/\s*11\s*finding/i.exec(r38);
      out.d2.stated = m ? { ok: 23, finding: 11 } : null;
      if (!m) F('d2-stated', 'LOG.md round-38 section lacks the corrected tally "23 ok / 11 finding"');
    }
    // recompute from committed seat reports
    const list = git(repo, ['ls-tree', '-r', '--name-only', REV, '.ufo/waves/round-37/w1']);
    const files = (list.stdout || '').split('\n').filter((p) => /(^|\/)report\.md$/.test(p) || /(^|\/)w1\/[^/]+\.md$/.test(p));
    const seatAll = files.filter((p) => /w1\/[A-Z][A-Za-z0-9]*(\/report)?\.md$/.test(p) && !/swarm-registry/.test(p));
    const seatSet = new Map(); // seat name -> file (dir/report.md wins over <name>.md)
    for (const p of seatAll) {
      const name = p.replace(/^.*w1\//, '').replace(/\/report\.md$/, '').replace(/\.md$/, '');
      const cur = seatSet.get(name);
      if (!cur || /\/report\.md$/.test(p)) seatSet.set(name, p);
    }
    const seatFiles = [...seatSet.values()];
    const tally = { ok: 0, finding: 0, error: 0, none: 0, reports: seatFiles.length };
    const bySeat = {};
    for (const p of seatFiles) {
      const name = p.replace(/^.*w1\//, '').replace(/\/report\.md$/, '').replace(/\.md$/, '');
      const t = blob(repo, REV, p) || '';
      const hits = [...t.matchAll(/VERDICT\s+(ok|finding|error)/g)].map((m) => m[1]);
      const v = hits.length ? hits[hits.length - 1] : 'none';
      bySeat[name] = v;
      tally[v] = (tally[v] || 0) + 1;
    }
    out.d2.recomputed = { ok: tally.ok, finding: tally.finding, error: tally.error, none: tally.none, reports: tally.reports };
    out.d2.bySeat = bySeat;
    if (tally.reports !== 34) F('d2-reports', `seat reports counted ${tally.reports} != 34`);
    if (!(tally.ok === 23 && tally.finding === 11)) F('d2-recompute', `recomputed ${tally.ok}/${tally.finding} != 23/11`);
    if (out.d2.stated && (tally.ok !== out.d2.stated.ok || tally.finding !== out.d2.stated.finding)) F('d2-mismatch', 'stated tally != recomputed tally');
  }

  // ---------- D3: LOG hash-carrying entries ----------
  {
    const log = blob(repo, REV, 'LOG.md') || '';
    const r38 = log.slice(log.indexOf('## Round 38'));
    out.d3.hashes = {};
    for (const h of ROUND37_COMMITS) {
      const present = r38.includes(h);
      const cat = git(repo, ['cat-file', '-t', h]).stdout.trim();
      const anc = spawnSync('git', ['-C', repo, 'merge-base', '--is-ancestor', h, REV]).status === 0;
      out.d3.hashes[h] = { presentInR38Section: present, isCommit: cat === 'commit', ancestorOfRev: anc };
      if (!(present && cat === 'commit' && anc)) F('d3-hash', `${h.slice(0, 8)} present=${present} isCommit=${cat === 'commit'} ancestor=${anc}`);
    }
    out.d3.freezeLandingStated = /34ed508c/.test(r38) && !/freeze entry.*99437d29|99437d29.*freeze entry/i.test(r38);
    if (!out.d3.freezeLandingStated) F('d3-freeze-landing', 'LOG round-38 section does not record the freeze entry landing at 34ed508c (or repeats the report\'s 99437d29 claim)');
  }

  // ---------- D4: lesson M3 captured-by + red control ----------
  {
    const lesson = blob(repo, REV, 'corpus/lessons/round-38.md');
    if (lesson === null) { F('d4-lesson', 'corpus/lessons/round-38.md absent'); }
    else {
      out.d4.mistakes = /## Mistakes/.test(lesson);
      const m3row = /captured-by:/i.test(lesson) && /surface-mismatch/.test(lesson) && /round-37|r37/.test(lesson);
      out.d4.capturedBy = m3row;
      if (!out.d4.mistakes) F('d4-section', 'no ## Mistakes section');
      if (!m3row) F('d4-m3', 'no Mistakes row with captured-by naming round-37 M3 (surface-mismatch)');
    }
    const receipt = blob(repo, REV, '.ufo/waves/round-38/baseline/m3-sentence-mutant.json');
    if (receipt === null) { F('d4-receipt', 'm3-sentence-mutant.json absent'); }
    else {
      let d = null;
      try { d = JSON.parse(receipt); } catch {}
      out.d4.mutantRefused = d && (d.exit === 1 || d.exit === 2 || d.refused === true || d.killed === true);
      if (!out.d4.mutantRefused) F('d4-mutant', 'mutant receipt does not record the mutated sentence refused');
    }
  }

  // ---------- D5: census receipt carries parsed counts ----------
  {
    const path = '.ufo/waves/round-38/measure/census-end.txt';
    const text = blob(repo, REV, path);
    if (text === null) { F('d5-receipt', 'census-end.txt absent at REV'); }
    else {
      const srcs = (blob(repo, REV, 'corpus/SOURCES.md') || '').split('\n');
      const mine = { rows: 0, tier: {}, status: {} };
      for (const l of srcs) {
        if (/^\|\s*S\d{3,}\s*\|/.test(l)) {
          mine.rows += 1;
          const c = l.split('|').map((x) => x.trim());
          if (c.length >= 10) { mine.tier[c[4]] = (mine.tier[c[4]] || 0) + 1; mine.status[c[8]] = (mine.status[c[8]] || 0) + 1; }
        }
      }
      const rm = /rows\s*[:=]\s*(\d+)/.exec(text);
      const tm = /tier[s]?\s*[:=]\s*([^\n]*)/.exec(text);
      const sm = /status\s*[:=]\s*([^\n]*)/.exec(text);
      out.d5.receiptRows = rm ? Number(rm[1]) : null;
      out.d5.counterRows = mine.rows;
      out.d5.counterTier = mine.tier;
      out.d5.counterStatus = mine.status;
      const parseHist = (s) => { const o = {}; for (const m of (s || '').matchAll(/([A-Za-z]+)\s*[:=]\s*(\d+)/g)) o[m[1]] = Number(m[2]); return o; };
      const rt = parseHist(tm && tm[1]);
      const rs = parseHist(sm && sm[1]);
      out.d5.receiptTier = rt; out.d5.receiptStatus = rs;
      const eq = (a, b) => Object.keys(a).length === Object.keys(b).length && Object.entries(a).every(([k, v]) => b[k] === v);
      if (out.d5.receiptRows !== mine.rows) F('d5-rows', `receipt rows ${out.d5.receiptRows} != counter rows ${mine.rows}`);
      if (!eq(rt, mine.tier)) F('d5-tier', 'receipt tier histogram != counter histogram');
      if (!eq(rs, mine.status)) F('d5-status', 'receipt status histogram != counter histogram');
    }
  }

  // ---------- D6: numstat window precision ----------
  {
    const list = git(repo, ['ls-tree', '--name-only', REV, '.ufo/waves/round-38/measure/']);
    const names = (list.stdout || '').split('\n').filter((n) => /^numstat-at-[0-9a-f]+\.txt$/.test(n) || n === 'numstat.txt');
    if (!names.length) { F('d6-file', 'no numstat receipt under .ufo/waves/round-38/measure'); }
    else {
      const text = blob(repo, REV, `.ufo/waves/round-38/measure/${names[0]}`) || '';
      out.d6.file = names[0];
      const windowRe = new RegExp(BASELINE.slice(0, 40));
      out.d6.namesBaseline = windowRe.test(text) || text.includes(BASELINE.slice(0, 12));
      out.d6.namesRev = text.includes(REV.slice(0, 8)) || text.includes(REV);
      if (!out.d6.namesBaseline || !out.d6.namesRev) F('d6-window', `receipt names baseline=${out.d6.namesBaseline} rev=${out.d6.namesRev} (window must be baseline..REV)`);
    }
  }

  // predicate — one sentence, byte-identical across claims.json, this constant and the receipt
  out.predicate = out.findings.length === 0
    && out.d1.stalePresent && out.d1.supersedingCorrection && out.d1.seats === 34 && out.d1.w2Absent
    && out.d2.stated !== null && out.d2.recomputed.ok === 23 && out.d2.recomputed.finding === 11 && out.d2.recomputed.reports === 34
    && Object.values(out.d3.hashes).every((h) => h.presentInR38Section && h.isCommit && h.ancestorOfRev) && out.d3.freezeLandingStated
    && out.d4.mistakes && out.d4.capturedBy && out.d4.mutantRefused
    && out.d5.receiptRows === out.d5.counterRows
    && out.d6.namesBaseline && out.d6.namesRev;
  return out;
}

function main() {
  const argv = process.argv.slice(2);
  const o = { repo: resolve(dirname(fileURLToPath(import.meta.url)), '../../../..'), rev: null, json: false };
  try {
    for (let i = 0; i < argv.length; i += 1) {
      const a = argv[i];
      if (a === '--json') o.json = true;
      else if (['--repo', '--rev'].includes(a)) { const v = argv[++i]; if (v === undefined) throw new Refusal(`missing value for ${a}`); o[a.slice(2)] = v; }
      else throw new Refusal(`unknown argument ${a}`);
    }
    if (!o.rev) throw new Refusal('usage: --rev <40-hex REV> required');
    o.repo = resolve(o.repo);
    const out = evaluate(o);
    if (o.json) console.log(JSON.stringify(out));
    else {
      for (const f of out.findings) console.log(`FINDING ${f.id} ${f.why}`);
      console.log(`C1_ROUTED_DEFECTS predicate=${out.predicate ? 'met' : 'not-met'} rev=${out.rev} findings=${out.findings.length} seats=${out.d1.seats} tally=${out.d2.recomputed && out.d2.recomputed.ok}/${out.d2.recomputed && out.d2.recomputed.finding} census=${out.d5.receiptRows}`);
    }
    process.exit(out.predicate ? 0 : 1);
  } catch (e) {
    if (!(e instanceof Refusal)) throw e;
    console.error(`C1_ROUTED_DEFECTS verdict=could-not-evaluate detail=${e.message}`);
    process.exit(2);
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
