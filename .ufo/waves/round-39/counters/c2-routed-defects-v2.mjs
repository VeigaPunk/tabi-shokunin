#!/usr/bin/env node
// c2-routed-defects-v2.mjs — tabi round 39, claim C2 (calibration: close the two
// round-38 routed residuals of the round-37 routed-defect counter). Frozen counter.
//
// Round-38 closure routed defects 1-2:
//   1. the M3 sentence-mutation red control was never landed
//      (.ufo/waves/round-38/baseline/m3-sentence-mutant.json absent at the tip);
//   2. the numstat receipt measured through 0930a6b, not the measured REV — no
//      coherent, reproducible measurement protocol was frozen.
//
// v2 against the round-38 v1 counter:
//   - D1-D3 reproduce v1's frozen checks byte-for-byte (same semantics, same regexes):
//     the round-37 routed-defect correction state is still re-derived at REV, never
//     trusted from prose;
//   - D7 (new): the round-39 claims.json predicate is byte-identical to this
//     counter's PREDICATE_SENTENCE; the counter performs the refusal itself on a
//     mutated-claims control via --claims <path> (exit non-zero, d7 finding), and the
//     round-39 baseline receipt must record that observed run (mutant sha, frozen
//     sha, observed exit != 0, mutant sentence != frozen sentence);
//   - D4 (amended): same lesson-row checks as v1, but the red-control receipt is the
//     round-39 one (.ufo/waves/round-39/baseline/c2-sentence-mutant.json) with the
//     honest-refusal fields above;
//   - D5 (amended): the census receipt under this round's measure dir
//     (.ufo/waves/round-39/measure/census-end.txt) carries parsed counts equal to this
//     counter's own parse of corpus/SOURCES.md at REV;
//   - D6 (amended): the numstat receipt under this round's measure dir names the frozen
//     round-38 start baseline 3f42a5c7cc19 and REV (window == baseline..REV).
//
// Usage: node c2-routed-defects-v2.mjs --rev <40-hex REV> [--repo <lane>] [--claims <path>] [--json]
// Exit: 0 predicate met; 1 evaluated, predicate not met; 2 could-not-evaluate.
// Inputs: git objects of the lane at --rev; D5/D6 receipts are read at --repo's
// worktree (committed measurement outputs). --claims defaults to the claims.json at
// REV and exists only so the red control can run the frozen counter on a fixture.
// Write scope: stdout/stderr only.
// Predicate (frozen) — the same sentence in claims.json and this constant:
//   D1 stale-line-present AND superseding-correction-present AND re-derived seats == 34 AND w2-artifacts absent AND D2 tally stated == recomputed 23 ok 11 finding AND D3 every round-37 hash present and ancestor with the freeze landing stated at 34ed508c AND D4 captured-by row present AND the round-39 sentence-mutant receipt records a nonzero exit with a predicate sentence different from the frozen sentence AND D5 round-39 census receipt counts equal this counter's parse AND D6 the round-39 numstat receipt names baseline 3f42a5c7cc19 and REV AND the round-39 claims predicate is byte-identical to this counter's sentence
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-r39-c2-routed-defects-v2';
const BASELINE = '3f42a5c7cc19a544c879577e4bad7b7fd9d61a35';
const ROUND37_COMMITS = ['99437d29de036415a9f2d0524343617a3b19988a', 'f76da094f0ff0ad9856d2232858241e3f7841379', '34ed508c47ca8727450d7f210bc440dadb61f883', '5a2ebb6af9cbfe024c4a98d483dfe476a02e59f1', 'f485cce10c8640eda64f5e555f99894ed4de7fb0', 'bf8ecd5a663d9773d92c4842ed1874814b8a9a83'];
const CLAIMS_PATH = '.ufo/waves/round-39/claims.json';
const MUTANT_RECEIPT = '.ufo/waves/round-39/baseline/c2-sentence-mutant.json';
const CENSUS_RECEIPT = '.ufo/waves/round-39/measure/census-end.txt';
const NUMSTAT_PREFIX = 'numstat-at-';
const PREDICATE_SENTENCE = "D1 stale-line-present AND superseding-correction-present AND re-derived seats == 34 AND w2-artifacts absent AND D2 tally stated == recomputed 23 ok 11 finding AND D3 every round-37 hash present and ancestor with the freeze landing stated at 34ed508c AND D4 captured-by row present AND the round-39 sentence-mutant receipt records a nonzero exit with a predicate sentence different from the frozen sentence AND D5 round-39 census receipt counts equal this counter's parse AND D6 the round-39 numstat receipt names baseline 3f42a5c7cc19 and REV AND the round-39 claims predicate is byte-identical to this counter's sentence";

class Refusal extends Error {}
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

export function evaluate({ repo, rev, claimsPath }) {
  const REV = resolveCommit(repo, rev);
  const out = {
    schema: SCHEMA, rev: REV, baseline: BASELINE,
    d1: {}, d2: {}, d3: {}, d4: {}, d5: {}, d6: {}, d7: {},
    findings: [], predicateSentence: PREDICATE_SENTENCE, predicate: false,
  };
  const F = (id, why) => out.findings.push({ id, why });

  // ---------- D1: SCORECARD wave-block overclaim corrected (v1 semantics) ----------
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

  // ---------- D2: report tally corrected and re-derived (v1 semantics) ----------
  {
    const log = blob(repo, REV, 'LOG.md');
    if (log === null) { F('d2-entry', 'LOG.md absent'); }
    else {
      const r38 = log.slice(log.indexOf('## Round 38'));
      const m = /23\s*ok\s*\/\s*11\s*finding/i.exec(r38);
      out.d2.stated = m ? { ok: 23, finding: 11 } : null;
      if (!m) F('d2-stated', 'LOG.md round-38 section lacks the corrected tally "23 ok / 11 finding"');
    }
    const list = git(repo, ['ls-tree', '-r', '--name-only', REV, '.ufo/waves/round-37/w1']);
    const files = (list.stdout || '').split('\n').filter((p) => /(^|\/)report\.md$/.test(p) || /(^|\/)w1\/[^/]+\.md$/.test(p));
    const seatAll = files.filter((p) => /w1\/[A-Z][A-Za-z0-9]*(\/report)?\.md$/.test(p) && !/swarm-registry/.test(p));
    const seatSet = new Map();
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

  // ---------- D3: LOG hash-carrying entries (v1 semantics) ----------
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

  // ---------- D4: lesson M3 captured-by + round-39 red control ----------
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
    const receipt = blob(repo, REV, MUTANT_RECEIPT);
    if (receipt === null) { F('d4-receipt', `${MUTANT_RECEIPT} absent`); }
    else {
      let d = null;
      try { d = JSON.parse(receipt); } catch { F('d4-receipt-json', 'mutant receipt not JSON'); }
      if (d) {
        out.d4.mutantExit = typeof d.observedExit === 'number' ? d.observedExit : null;
        out.d4.mutantSentenceDiffers = typeof d.mutantPredicateSentence === 'string' && d.mutantPredicateSentence !== PREDICATE_SENTENCE;
        out.d4.shaPair = typeof d.frozenClaimsSha256 === 'string' && typeof d.mutantClaimsSha256 === 'string'
          && /^[0-9a-f]{64}$/.test(d.frozenClaimsSha256) && /^[0-9a-f]{64}$/.test(d.mutantClaimsSha256)
          && d.frozenClaimsSha256 !== d.mutantClaimsSha256;
        out.d4.mutantRefused = out.d4.mutantExit !== null && out.d4.mutantExit !== 0 && out.d4.mutantSentenceDiffers === true && out.d4.shaPair === true;
        if (!out.d4.mutantRefused) F('d4-mutant', `mutant receipt does not record an honest refusal: exit=${out.d4.mutantExit} sentenceDiffers=${out.d4.mutantSentenceDiffers} shaPair=${out.d4.shaPair}`);
      }
    }
  }

  // ---------- D5: round-39 census receipt carries parsed counts ----------
  {
    const text = blob(repo, REV, CENSUS_RECEIPT);
    if (text === null) { F('d5-receipt', `${CENSUS_RECEIPT} absent at REV`); }
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

  // ---------- D6: round-39 numstat window precision ----------
  {
    const list = git(repo, ['ls-tree', '--name-only', REV, '.ufo/waves/round-39/measure/']);
    const names = (list.stdout || '').split('\n').filter((n) => new RegExp(`^${NUMSTAT_PREFIX}[0-9a-f]+\\.txt$`).test(n));
    if (!names.length) { F('d6-file', 'no numstat receipt under .ufo/waves/round-39/measure'); }
    else {
      const wanted = `${NUMSTAT_PREFIX}${REV.slice(0, 8)}.txt`;
      const file = names.includes(wanted) ? wanted : names[0];
      const text = blob(repo, REV, `.ufo/waves/round-39/measure/${file}`) || '';
      out.d6.file = file;
      out.d6.namesBaseline = text.includes(BASELINE.slice(0, 12));
      out.d6.namesRev = text.includes(REV.slice(0, 8)) || text.includes(REV);
      out.d6.nonempty = text.split('\n').filter((l) => l.trim() && !/^#/.test(l)).length > 0;
      if (!out.d6.namesBaseline || !out.d6.namesRev) F('d6-window', `receipt names baseline=${out.d6.namesBaseline} rev=${out.d6.namesRev} (window must be baseline..REV)`);
      if (!out.d6.nonempty) F('d6-empty', 'numstat receipt has no data lines');
    }
  }

  // ---------- D7: predicate sentence byte-identity (counter performs the refusal) ----------
  {
    let claimsText = null;
    if (claimsPath) {
      try { claimsText = readFileSync(claimsPath, 'utf8'); } catch { throw new Refusal(`cannot read --claims ${claimsPath}`); }
      out.d7.source = claimsPath;
    } else {
      claimsText = blob(repo, REV, CLAIMS_PATH);
      out.d7.source = `${CLAIMS_PATH}@${REV.slice(0, 8)}`;
    }
    if (claimsText === null) { F('d7-claims-absent', `${CLAIMS_PATH} absent at REV`); }
    else {
      let d = null;
      try { d = JSON.parse(claimsText); } catch { F('d7-claims-unparseable', 'claims.json not JSON'); }
      if (d) {
        out.d7.claimsPredicate = typeof d.predicate === 'string' ? d.predicate : null;
        out.d7.sentenceMatch = d.predicate === PREDICATE_SENTENCE;
        if (!out.d7.sentenceMatch) F('d7-sentence-mismatch', 'claims predicate is not byte-identical to the counter sentence (mutated-sentence control must be refused)');
      }
    }
  }

  // predicate — one sentence, byte-identical across claims.json and this constant
  out.predicate = out.findings.length === 0
    && out.d1.stalePresent && out.d1.supersedingCorrection && out.d1.seats === 34 && out.d1.w2Absent
    && out.d2.stated !== null && out.d2.recomputed.ok === 23 && out.d2.recomputed.finding === 11 && out.d2.recomputed.reports === 34
    && Object.values(out.d3.hashes).every((h) => h.presentInR38Section && h.isCommit && h.ancestorOfRev) && out.d3.freezeLandingStated
    && out.d4.mistakes && out.d4.capturedBy && out.d4.mutantRefused
    && out.d5.receiptRows === out.d5.counterRows
    && out.d6.namesBaseline && out.d6.namesRev && out.d6.nonempty
    && out.d7.sentenceMatch === true;
  return out;
}

function main() {
  const argv = process.argv.slice(2);
  const o = { repo: resolve(dirname(fileURLToPath(import.meta.url)), '../../../..'), rev: null, claims: null, json: false };
  try {
    for (let i = 0; i < argv.length; i += 1) {
      const a = argv[i];
      if (a === '--json') o.json = true;
      else if (['--repo', '--rev', '--claims'].includes(a)) { const v = argv[++i]; if (v === undefined) throw new Refusal(`missing value for ${a}`); o[a.slice(2)] = v; }
      else throw new Refusal(`unknown argument ${a}`);
    }
    if (!o.rev) throw new Refusal('usage: --rev <40-hex REV> required');
    o.repo = resolve(o.repo);
    const out = evaluate({ repo: o.repo, rev: o.rev, claimsPath: o.claims ? resolve(o.claims) : null });
    if (o.json) console.log(JSON.stringify(out));
    else {
      for (const f of out.findings) console.log(`FINDING ${f.id} ${f.why}`);
      console.log(`C2_ROUTED_DEFECTS_V2 predicate=${out.predicate ? 'met' : 'not-met'} rev=${out.rev} findings=${out.findings.length} seats=${out.d1.seats} tally=${out.d2.recomputed && out.d2.recomputed.ok}/${out.d2.recomputed && out.d2.recomputed.finding} census=${out.d5.receiptRows} d7=${out.d7.sentenceMatch}`);
    }
    process.exit(out.predicate ? 0 : 1);
  } catch (e) {
    if (!(e instanceof Refusal)) throw e;
    console.error(`C2_ROUTED_DEFECTS_V2 verdict=could-not-evaluate detail=${e.message}`);
    process.exit(2);
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
