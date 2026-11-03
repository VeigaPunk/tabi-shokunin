#!/usr/bin/env node
// check-cited-receipts.mjs — tabi lane gate: a cited evidence path must exist at
// the revision the citing document is committed at.
//
// Class fix for N1 (round-55 closure): the round-55 report, lesson and SCORECARD
// cited receipts under .ufo/waves/round-55/ that were never committed (their
// scratch was cleaned, so they are LOST). The landing check existed as QUALITY
// criterion 109 but was not run at round-55 close. This gate IS that check, as a
// script: it reads the citing documents out of git (not the worktree, so a
// staged-but-uncommitted receipt cannot satisfy a citation) and resolves every
// cited .ufo/waves/round-<N>/ path against the same commit's tree.
//
// Red-before proof (round 56): at 545b251d over corpus/lessons/round-55.md and
// SCORECARD.md this gate reports 12 tokens checked and 6 findings across 5
// distinct missing paths. The claims.json freeze names six lost receipts; two of
// them (measure/c1-meter-green-at-correction1.json, measure/c3-gate-v4-at-final.txt)
// are cited only in RELATIVE form (`measure/...`), which the frozen extraction
// rule below does not cover, and are therefore not among the findings.
//
// Verdict: 0 no cited path missing; 1 at least one cited path missing (a finding
//          per occurrence); 2 usage error, unresolvable revision, or unreadable
//          citing document.
//
// Usage:
//   node scripts/check-cited-receipts.mjs \
//     [--repo <abs lane path, default cwd>] \
//     --round <N> \
//     --doc <rev>:<repo-relative path> [--doc <rev>:<path> ...] \
//     [--json]
//
// Extraction rule (frozen as of round 56):
//   A citation token is the literal prefix `.ufo/waves/round-<digits>/` followed
//   by path characters and nothing else — so a token stops at whitespace, a
//   backtick, a quote, a bracket, a parenthesis, a comma, a semicolon or a table
//   pipe. Path characters are [A-Za-z0-9._/-]; a period IS a path character
//   (receipt names carry `.json`/`.txt`), so the character class alone would
//   swallow a sentence-final period. Trailing sentence punctuation (`.` `,` `;`
//   `:` `|` `)` `]` `>` `"` `'` backtick) is therefore stripped from the right,
//   after the match, and only from the right. A trailing `/` (a directory
//   citation) is NOT stripped: git resolves directories, so `.ufo/waves/
//   round-N/measure/` is present exactly when that tree entry exists.
//
// Scope: only tokens whose round directory equals --round are checked; tokens for
// other rounds are counted and reported, never checked. Every git call is
// read-only (show, rev-parse, cat-file). This script writes nothing — no temp
// files, no /tmp.
//
// Owner: tabi L1 (authored by seat R56Gate, round 56 wave w1).
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const SCHEMA = 'tabi-cited-receipts-v1';
const MAX_BUFFER = 512 * 1024 * 1024;
const TOKEN_RE = /\.ufo\/waves\/round-(\d+)\/[A-Za-z0-9._/-]*/g;
// The frozen trailing-punctuation set: backtick, quote, parenthesis, bracket,
// comma, semicolon, period, pipe. Stripped from the RIGHT edge only, and a
// trailing `/` survives so directory citations stay directory citations.
// Because the token class above is [A-Za-z0-9._/-], only `.` can actually reach
// the edge — every other member of this set already terminates the match. The
// full set is kept so the code states the frozen rule rather than an accident of
// the character class.
const TRAILING_PUNCT_RE = /[`'"()[\].,;|]+$/;

function git(repo, args) {
  return spawnSync('git', ['-C', repo, ...args], {
    encoding: 'utf8',
    maxBuffer: MAX_BUFFER,
  });
}

function die(message, detail = null) {
  const payload = { schema: SCHEMA, error: message, detail };
  process.stderr.write(`${JSON.stringify(payload)}\n`);
  process.stderr.write(`check-cited-receipts: ${message}${detail === null ? '' : ` (${detail})`}\n`);
  process.exit(2);
}

function parseArgs(argv) {
  const opts = { repo: null, round: null, docs: [], json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') {
      opts.json = true;
    } else if (a === '--repo' || a === '--round' || a === '--doc') {
      const v = argv[++i];
      if (v === undefined || v.startsWith('--')) die(`missing value for ${a}`);
      if (a === '--repo') opts.repo = v;
      else if (a === '--round') opts.round = v;
      else opts.docs.push(v);
    } else {
      die(`unknown argument ${a}`);
    }
  }
  if (opts.round === null || !/^\d+$/.test(opts.round)) die('--round <N> is required and must be a round number');
  if (opts.docs.length === 0) die('at least one --doc <rev>:<path> is required');
  return opts;
}

// A token's round directory must be exactly the requested round: round-5 must
// not match round-55, and a token must carry at least one character beyond the
// round prefix to name anything.
function extract(text, round) {
  const hits = [];
  let otherRounds = 0;
  const lines = text.split('\n');
  for (let n = 0; n < lines.length; n++) {
    TOKEN_RE.lastIndex = 0;
    let m;
    while ((m = TOKEN_RE.exec(lines[n])) !== null) {
      const raw = m[0];
      const token = raw.replace(TRAILING_PUNCT_RE, '');
      const tail = token.slice(`.ufo/waves/round-${m[1]}/`.length);
      if (m[1] !== round) {
        otherRounds++;
        continue;
      }
      if (tail.length === 0) continue;
      hits.push({ path: token, line: n + 1 });
    }
  }
  return { hits, otherRounds };
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const repo = resolve(opts.repo ?? process.cwd());

  const top = git(repo, ['rev-parse', '--show-toplevel']);
  if (top.error || top.status !== 0) die('repo is not a readable git work tree', repo);
  const topLevel = top.stdout.trim();

  const docs = [];
  const findings = [];
  let checked = 0;
  let otherRounds = 0;

  for (const spec of opts.docs) {
    const sep = spec.indexOf(':');
    if (sep <= 0 || sep === spec.length - 1) die(`--doc must be <rev>:<path>, got ${spec}`);
    const revSpec = spec.slice(0, sep);
    const relPath = spec.slice(sep + 1);

    const revOut = git(repo, ['rev-parse', '--verify', '--quiet', `${revSpec}^{commit}`]);
    if (revOut.error || revOut.status !== 0 || revOut.stdout.trim().length === 0) {
      die('revision does not resolve to a commit', `${revSpec} in ${repo}`);
    }
    const rev = revOut.stdout.trim();

    const shown = git(repo, ['show', `${rev}:${relPath}`]);
    if (shown.error || shown.status !== 0) {
      die('citing document is not readable at the revision', `${rev}:${relPath}`);
    }
    const text = shown.stdout;
    const { hits, otherRounds: skipped } = extract(text, opts.round);
    otherRounds += skipped;
    checked += hits.length;
    docs.push({ spec, rev, path: relPath, tokens: hits.length, skippedOtherRounds: skipped });

    for (const hit of hits) {
      const seen = git(repo, ['cat-file', '-e', `${rev}:${hit.path}`]);
      if (seen.error || seen.status !== 0) {
        findings.push({ path: hit.path, citingDoc: spec, line: hit.line });
      }
    }
  }

  const missing = [...new Set(findings.map((f) => f.path))].sort();
  const out = {
    schema: SCHEMA,
    repo,
    toplevel: topLevel,
    round: Number(opts.round),
    docs,
    checked,
    otherRoundTokens: otherRounds,
    findings,
    missing,
    predicate: missing.length === 0,
  };

  if (opts.json) {
    process.stdout.write(`${JSON.stringify(out)}\n`);
  } else {
    const lines = [];
    lines.push(`repo: ${repo}`);
    lines.push(`round: ${out.round}`);
    for (const d of docs) lines.push(`doc: ${d.spec} -> ${d.rev} (${d.tokens} round-${out.round} token(s), ${d.skippedOtherRounds} other-round)`);
    lines.push(`checked: ${checked} token(s); other-round tokens skipped: ${otherRounds}`);
    for (const f of findings) lines.push(`MISSING path=${f.path} citingDoc=${f.citingDoc} line=${f.line}`);
    lines.push(`missing(distinct)=${missing.length} findings=${findings.length}`);
    lines.push(missing.length === 0 ? 'verdict: GREEN' : 'verdict: RED');
    process.stdout.write(`${lines.join('\n')}\n`);
  }
  process.exit(missing.length === 0 ? 0 : 1);
}

try {
  main();
} catch (e) {
  die('unexpected error', e instanceof Error ? e.message : String(e));
}
