#!/usr/bin/env node
// check-cited-receipts-v2.mjs — tabi lane gate, GENERATION v2 (round 57).
//
// Generation, not edit: v1 (scripts/check-cited-receipts.mjs, sha256
// 0457f35468db9efdf8e9291f684dd90defa2016157b45e78887987b023550c7a) stays frozen and is
// never touched. v2 keeps v1's CLI, exit classes and finding meanings, and declares ONE
// widening (the r56 closure's routed defect 2 / lesson row R56Gate-F1):
//
//   v1's finding (unchanged meaning, id `full-prefix-citation-missing`)
//     A citation token is the literal prefix `.ufo/waves/round-<digits>/` followed by
//     [A-Za-z0-9._/-]*; trailing punctuation is stripped from the right edge only; a
//     trailing `/` survives (git resolves a directory entry). Tokens whose round
//     directory is not --round are counted (`otherRoundTokens`) and never checked.
//     One finding per occurrence {path, citingDoc, line}; `missing` is the distinct
//     path list. The extraction rule and those three finding fields are identical to
//     v1's; the differential selftest case runs v1 as a child process on the same
//     fixture and requires equality.
//
//   WIDENING (new in v2, ids `relative-citation-missing` / `relative-citation-traversal`)
//     An UNPREFIXED token that starts with a known wave-dir component
//       counters|measure|controls|adj|gate|gate-fixtures|sources|scout|reviewer|critic|
//       connector|mutant|sentinel|labrat|scribe|quarantine|assimilation
//     and continues with `/` plus at least one path character is a RELATIVE citation.
//     It resolves against `.ufo/waves/round-<N>/` with N = the gate's --round:
//       missing at that path -> finding `relative-citation-missing`
//       present at that path -> no finding
//     The rule fires only on slash-paths: a bare word (`measure`, `controls`) never
//     matches, and a component followed by `/` and nothing else (`in mutant/`) never
//     matches. Full-prefix spans are masked before the relative scan, so a token inside
//     `.ufo/waves/round-<M>/...` is never re-read as a relative citation — this is what
//     makes case (4) hold for cross-round full-prefix tokens.
//     PATH TRAVERSAL IS REFUSED OUTRIGHT: a relative token containing `..` emits
//     `relative-citation-traversal` and is NEVER resolved (the rule refuses the token,
//     not the normalized destination, so `measure/../inside.txt` is refused even when
//     the normalized path exists inside the round dir).
//
// Semantics preserved from v1, deliberately: --repo / --round / --doc / --json; exit 0
// clean, 1 findings, 2 usage error (unresolvable revision, unreadable doc, non-repo);
// one finding per occurrence in document/line order; every git call read-only (`show`,
// `rev-parse`, `cat-file`); no temp files in normal mode. `missing` keeps v1's exact
// meaning (distinct full-prefix missing paths); the widening reports its own lists
// (`missingRelative`, `traversal`, `missingAll`).
//
// Red-before (round 57, receipt gate/v2-red-before-545b251d.json): at the r55 close
// revision 545b251d over corpus/lessons/round-55.md + SCORECARD.md this gate reports
// strictly more findings than v1's 6 findings / 5 distinct paths, and catches the two
// relative forms v1 could not see:
//   SCORECARD.md:3145  measure/c1-meter-green-at-correction1.json
//   lessons/round-55.md:67  measure/d54-1-landing-note-r55.txt
//
// Usage:
//   node scripts/check-cited-receipts-v2.mjs \
//     [--repo <abs lane path, default cwd>] --round <N> \
//     --doc <rev>:<repo-relative path> [--doc <rev>:<path> ...] [--json]
//   node scripts/check-cited-receipts-v2.mjs --selftest [--scratch <dir>] [--fixtures <dir>] [--json]
//
// --selftest builds one throwaway git fixture per hand-declared case from the committed
// fixture trees under .ufo/waves/round-57/gate/fixtures/ (the expectations live in
// fixtures/cases.json, declared by hand, never derived from this tool), commits each,
// asserts the fixture's own toplevel before any mutation, and runs the v1 differential
// where a case declares it. It honours TMPDIR (os.tmpdir()) and accepts --scratch.
//
// Owner: tabi L1 (authored by seat R57Gate, round 57 wave w1). v1 by seat R56Gate.
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-cited-receipts-v2';
const SELFTEST_SCHEMA = 'tabi-cited-receipts-v2-selftest';
const MAX_BUFFER = 512 * 1024 * 1024;
const SELF_PATH = fileURLToPath(import.meta.url);
const V1_PATH = join(dirname(SELF_PATH), 'check-cited-receipts.mjs');

// v1's frozen full-prefix token rule (identical regex and punctuation set).
const TOKEN_RE = /\.ufo\/waves\/round-(\d+)\/[A-Za-z0-9._/-]*/g;
const TRAILING_PUNCT_RE = /[`'"()[\].,;|]+$/;

// The declared widening's wave-dir components. Longest-first so `gate-fixtures` is
// preferred over `gate` (the alternation would backtrack correctly either way; the
// ordering states the intent).
const WAVE_DIRS = [
  'counters', 'measure', 'controls', 'adj', 'gate-fixtures', 'gate', 'sources', 'scout',
  'reviewer', 'critic', 'connector', 'mutant', 'sentinel', 'labrat', 'scribe',
  'quarantine', 'assimilation',
].sort((a, b) => b.length - a.length);

// Boundary: the token must not be a continuation of a longer path token. `[A-Za-z0-9._/-]`
// on the left means `measure/x` inside `.../measure/x` or `x.measure/x` is not a start.
// At least one path character after the slash: `in mutant/` is prose, not a citation.
const RELATIVE_RE = new RegExp(
  `(?<![A-Za-z0-9._/-])(?:${WAVE_DIRS.join('|')})/[A-Za-z0-9._/-]+`,
  'g',
);

const FINDING_IDS = Object.freeze({
  fullPrefix: 'full-prefix-citation-missing',
  relative: 'relative-citation-missing',
  traversal: 'relative-citation-traversal',
});

function git(repo, args) {
  return spawnSync('git', ['-C', repo, ...args], {
    encoding: 'utf8',
    maxBuffer: MAX_BUFFER,
  });
}

function die(message, detail = null) {
  const payload = { schema: SCHEMA, error: message, detail };
  process.stderr.write(`${JSON.stringify(payload)}\n`);
  process.stderr.write(`check-cited-receipts-v2: ${message}${detail === null ? '' : ` (${detail})`}\n`);
  process.exit(2);
}

function parseArgs(argv) {
  const opts = { repo: null, round: null, docs: [], json: false, selftest: false, scratch: null, fixtures: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') {
      opts.json = true;
    } else if (a === '--selftest') {
      opts.selftest = true;
    } else if (a === '--repo' || a === '--round' || a === '--doc' || a === '--scratch' || a === '--fixtures') {
      const v = argv[++i];
      if (v === undefined || v.startsWith('--')) die(`missing value for ${a}`);
      if (a === '--repo') opts.repo = v;
      else if (a === '--round') opts.round = v;
      else if (a === '--scratch') opts.scratch = v;
      else if (a === '--fixtures') opts.fixtures = v;
      else opts.docs.push(v);
    } else {
      die(`unknown argument ${a}`);
    }
  }
  if (opts.selftest) return opts;
  if (opts.round === null || !/^\d+$/.test(opts.round)) die('--round <N> is required and must be a round number');
  if (opts.docs.length === 0) die('at least one --doc <rev>:<path> is required');
  return opts;
}

// Full-prefix extraction: the v1 rule, unchanged.
function extractFullPrefix(line, round) {
  const out = [];
  const spans = [];
  let otherRounds = 0;
  TOKEN_RE.lastIndex = 0;
  let m;
  while ((m = TOKEN_RE.exec(line)) !== null) {
    const raw = m[0];
    spans.push([m.index, m.index + raw.length]);
    const token = raw.replace(TRAILING_PUNCT_RE, '');
    const tail = token.slice(`.ufo/waves/round-${m[1]}/`.length);
    if (m[1] !== round) {
      otherRounds++;
      continue;
    }
    if (tail.length === 0) continue;
    out.push(token);
  }
  return { tokens: out, spans, otherRounds };
}

// Relative extraction over the line with every full-prefix span blanked out, so a token
// that is part of a full-prefix citation can never be re-read as a relative citation.
function extractRelative(line, fullPrefixSpans) {
  let masked = line;
  if (fullPrefixSpans.length > 0) {
    let cursor = 0;
    let next = '';
    for (const [start, end] of fullPrefixSpans) {
      next += masked.slice(cursor, start) + ' '.repeat(end - start);
      cursor = end;
    }
    masked = next + masked.slice(cursor);
  }
  const out = [];
  RELATIVE_RE.lastIndex = 0;
  let m;
  while ((m = RELATIVE_RE.exec(masked)) !== null) {
    const token = m[0].replace(TRAILING_PUNCT_RE, '');
    const tail = token.slice(token.indexOf('/') + 1);
    if (tail.length === 0) continue;
    out.push(token);
  }
  return out;
}

function roundDir(round) {
  return `.ufo/waves/round-${round}/`;
}

function isTraversal(token) {
  return token.includes('..');
}

// Evaluate one run. Returns the result object; never exits.
function evaluate(opts) {
  const repo = resolve(opts.repo ?? process.cwd());
  const round = String(opts.round);

  const top = git(repo, ['rev-parse', '--show-toplevel']);
  if (top.error || top.status !== 0) die('repo is not a readable git work tree', repo);
  const topLevel = top.stdout.trim();

  const docs = [];
  const findings = [];
  let checked = 0;
  let relativeChecked = 0;
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

    const lines = text.split('\n');
    let docFull = 0;
    let docRelative = 0;
    let docOther = 0;

    for (let n = 0; n < lines.length; n++) {
      const line = lines[n];
      const full = extractFullPrefix(line, round);
      docOther += full.otherRounds;
      for (const token of full.tokens) {
        docFull++;
        const present = git(repo, ['cat-file', '-e', `${rev}:${token}`]);
        if (present.error || present.status !== 0) {
          findings.push({
            id: FINDING_IDS.fullPrefix,
            kind: 'missing',
            round: Number(round),
            path: token,
            resolved: token,
            citingDoc: spec,
            line: n + 1,
          });
        }
      }

      for (const token of extractRelative(line, full.spans)) {
        docRelative++;
        if (isTraversal(token)) {
          findings.push({
            id: FINDING_IDS.traversal,
            kind: 'traversal',
            round: Number(round),
            path: token,
            resolved: null,
            citingDoc: spec,
            line: n + 1,
          });
          continue;
        }
        const resolved = `${roundDir(round)}${token}`;
        // Never resolve outside the round directory. `isTraversal` already refused every
        // `..` token; this is the belt-and-braces assertion that the resolved path is
        // still under the round dir (a token can only stay inside: it starts with a
        // component and carries no `..`).
        if (!resolved.startsWith(roundDir(round))) {
          findings.push({
            id: FINDING_IDS.traversal,
            kind: 'traversal',
            round: Number(round),
            path: token,
            resolved: null,
            citingDoc: spec,
            line: n + 1,
          });
          continue;
        }
        const present = git(repo, ['cat-file', '-e', `${rev}:${resolved}`]);
        if (present.error || present.status !== 0) {
          findings.push({
            id: FINDING_IDS.relative,
            kind: 'relative-missing',
            round: Number(round),
            path: token,
            resolved,
            citingDoc: spec,
            line: n + 1,
          });
        }
      }
    }

    checked += docFull;
    relativeChecked += docRelative;
    otherRounds += docOther;
    docs.push({
      spec,
      rev,
      path: relPath,
      tokens: docFull,
      relativeTokens: docRelative,
      skippedOtherRounds: docOther,
    });
  }

  const missing = [...new Set(findings.filter((f) => f.id === FINDING_IDS.fullPrefix).map((f) => f.path))].sort();
  const missingRelative = [...new Set(
    findings.filter((f) => f.id === FINDING_IDS.relative).map((f) => f.resolved),
  )].sort();
  const traversal = [...new Set(findings.filter((f) => f.id === FINDING_IDS.traversal).map((f) => f.path))].sort();
  const missingAll = [...new Set([
    ...findings.filter((f) => f.id === FINDING_IDS.fullPrefix).map((f) => f.path),
    ...findings.filter((f) => f.id === FINDING_IDS.relative).map((f) => f.resolved),
  ])].sort();

  return {
    schema: SCHEMA,
    repo,
    toplevel: topLevel,
    round: Number(round),
    docs,
    checked,
    relativeChecked,
    otherRoundTokens: otherRounds,
    findings,
    missing,
    missingRelative,
    traversal,
    missingAll,
    predicate: findings.length === 0,
  };
}

function formatText(out) {
  const lines = [];
  lines.push(`repo: ${out.repo}`);
  lines.push(`round: ${out.round}`);
  for (const d of out.docs) {
    lines.push(
      `doc: ${d.spec} -> ${d.rev} (${d.tokens} round-${out.round} token(s), ` +
      `${d.relativeTokens} relative, ${d.skippedOtherRounds} other-round)`,
    );
  }
  lines.push(`checked: ${out.checked} token(s); relative: ${out.relativeChecked}; other-round tokens skipped: ${out.otherRoundTokens}`);
  for (const f of out.findings) {
    if (f.id === FINDING_IDS.fullPrefix) {
      lines.push(`MISSING path=${f.path} citingDoc=${f.citingDoc} line=${f.line}`);
    } else if (f.id === FINDING_IDS.relative) {
      lines.push(`RELATIVE-MISSING path=${f.path} -> ${f.resolved} citingDoc=${f.citingDoc} line=${f.line}`);
    } else {
      lines.push(`TRAVERSAL-REFUSED path=${f.path} citingDoc=${f.citingDoc} line=${f.line}`);
    }
  }
  lines.push(
    `missing(distinct)=${out.missing.length} findings=${out.findings.length} ` +
    `relative-missing(distinct)=${out.missingRelative.length} traversal(distinct)=${out.traversal.length}`,
  );
  lines.push(out.findings.length === 0 ? 'verdict: GREEN' : 'verdict: RED');
  return `${lines.join('\n')}\n`;
}

function runCli(opts) {
  const out = evaluate(opts);
  if (opts.json) process.stdout.write(`${JSON.stringify(out)}\n`);
  else process.stdout.write(formatText(out));
  process.exit(out.findings.length === 0 ? 0 : 1);
}

// ---------------------------------------------------------------- selftest

function loadCases(dir) {
  const manifest = join(dir, 'cases.json');
  if (!existsSync(manifest)) die('selftest fixture manifest is missing', manifest);
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(manifest, 'utf8'));
  } catch (e) {
    die('selftest fixture manifest is not readable JSON', `${manifest}: ${e instanceof Error ? e.message : String(e)}`);
  }
  if (!parsed || !Array.isArray(parsed.cases)) die('selftest fixture manifest has no cases[]', manifest);
  return parsed.cases;
}

function buildFixture(treeDir, scratchRoot) {
  const dir = mkdtempSync(join(scratchRoot, 'fixture.'));
  for (const entry of readdirSync(treeDir, { withFileTypes: true })) {
    cpSync(join(treeDir, entry.name), join(dir, entry.name), { recursive: true });
  }
  const init = spawnSync('git', ['-C', dir, 'init', '-q'], { encoding: 'utf8' });
  if (init.status !== 0) die('selftest fixture git init failed', dir);
  const top = spawnSync('git', ['-C', dir, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' });
  if (top.status !== 0 || top.stdout.trim() !== dir) {
    die('selftest fixture toplevel assertion failed', `${top.stdout.trim()} != ${dir}`);
  }
  const add = spawnSync('git', ['-C', dir, 'add', '--', '.'], { encoding: 'utf8' });
  if (add.status !== 0) die('selftest fixture git add failed', dir);
  const commit = spawnSync(
    'git',
    ['-C', dir, '-c', 'user.name=TabiGateFixture', '-c', 'user.email=tabi-gate-fixture@example.invalid',
      'commit', '-q', '--no-verify', '-m', 'cited-receipts-v2 fixture'],
    { encoding: 'utf8' },
  );
  if (commit.status !== 0) die('selftest fixture git commit failed', dir);
  const rev = spawnSync('git', ['-C', dir, 'rev-parse', 'HEAD'], { encoding: 'utf8' });
  if (rev.status !== 0) die('selftest fixture rev-parse failed', dir);
  return { dir, rev: rev.stdout.trim() };
}

function canonFindings(findings) {
  return findings
    .map((f) => `${f.id}|${f.path}|${f.line}`)
    .sort();
}

function eqJson(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function diffExpectation(label, expected, actual) {
  const bad = [];
  for (const key of Object.keys(expected)) {
    if (!eqJson(expected[key], actual[key])) {
      bad.push(`${label}.${key}: got ${JSON.stringify(actual[key])} want ${JSON.stringify(expected[key])}`);
    }
  }
  return bad;
}

function runSelftest(opts) {
  const fixturesDir = resolve(opts.fixtures ?? join(dirname(SELF_PATH), '..', '.ufo/waves/round-57/gate/fixtures'));
  const scratchRoot = resolve(opts.scratch ?? tmpdir());
  if (!existsSync(scratchRoot)) mkdirSync(scratchRoot, { recursive: true });
  const cases = loadCases(fixturesDir);

  const results = [];
  const lines = [];
  let failed = 0;

  for (const c of cases) {
    const treeDir = join(fixturesDir, 'trees', c.tree ?? c.name);
    const problems = [];
    let fixture = null;
    try {
      fixture = buildFixture(treeDir, scratchRoot);
      const docs = c.docs.map((p) => `${fixture.rev}:${p}`);
      const out = evaluate({ repo: fixture.dir, round: String(c.round), docs });
      const expected = c.expect ?? {};
      const actualFindings = canonFindings(out.findings);
      const expectedFindings = canonFindings(expected.findings ?? []);
      if (actualFindings.length !== expectedFindings.length || !eqJson(actualFindings, expectedFindings)) {
        problems.push(`findings: got ${JSON.stringify(actualFindings)} want ${JSON.stringify(expectedFindings)}`);
      }
      const got = {};
      const want = {};
      for (const key of ['checked', 'relativeChecked', 'otherRoundTokens', 'missing', 'missingRelative', 'traversal', 'missingAll']) {
        if (key in expected) {
          got[key] = out[key];
          want[key] = expected[key];
        }
      }
      problems.push(...diffExpectation('gate', want, got));
      const wantExit = typeof expected.exit === 'number' ? expected.exit : (expectedFindings.length === 0 ? 0 : 1);
      const gotExit = out.findings.length === 0 ? 0 : 1;
      if (gotExit !== wantExit) problems.push(`exit: got ${gotExit} want ${wantExit}`);

      let v1 = null;
      if (c.v1) {
        if (!existsSync(V1_PATH)) {
          problems.push(`v1 differential unavailable: ${V1_PATH} absent`);
        } else {
          const v1run = spawnSync(
            process.execPath,
            [V1_PATH, '--repo', fixture.dir, '--round', String(c.round), '--json', ...docs.flatMap((d) => ['--doc', d])],
            { encoding: 'utf8', maxBuffer: MAX_BUFFER },
          );
          let v1out = null;
          try {
            v1out = JSON.parse(v1run.stdout);
          } catch {
            v1out = null;
          }
          if (v1out === null) {
            problems.push(`v1 differential: unparsable stdout exit=${v1run.status} stderr=${v1run.stderr.trim()}`);
          } else {
            const v1actual = {
              findings: v1out.findings.map((f) => ({ id: FINDING_IDS.fullPrefix, path: f.path, line: f.line })),
              checked: v1out.checked,
              otherRoundTokens: v1out.otherRoundTokens,
              missing: v1out.missing,
              exit: v1run.status,
            };
            const v1want = c.v1;
            const v1canon = {
              findings: canonFindings(v1actual.findings),
              checked: v1actual.checked,
              otherRoundTokens: v1actual.otherRoundTokens,
              missing: v1actual.missing,
              exit: v1actual.exit,
            };
            const v1expect = {
              findings: canonFindings(v1want.findings ?? []),
              checked: v1want.checked,
              otherRoundTokens: v1want.otherRoundTokens,
              missing: v1want.missing,
              exit: v1want.exit,
            };
            const bad = diffExpectation('v1', v1expect, v1canon);
            problems.push(...bad);
            v1 = v1canon;
          }
        }
      }

      const pass = problems.length === 0;
      if (!pass) failed++;
      results.push({
        name: c.name,
        pass,
        problems,
        round: c.round,
        docs: c.docs,
        findings: out.findings.length,
        findingsById: actualFindings,
        checked: out.checked,
        relativeChecked: out.relativeChecked,
        otherRoundTokens: out.otherRoundTokens,
        missing: out.missing,
        missingRelative: out.missingRelative,
        traversal: out.traversal,
        exit: gotExit,
        v1,
      });
      lines.push(`=== CASE ${c.name}`);
      lines.push(
        `round=${c.round} docs=${c.docs.length} exit=${gotExit} expect=${wantExit} | ` +
        `checked=${out.checked} relative=${out.relativeChecked} other-round=${out.otherRoundTokens} | ` +
        `${pass ? 'PASS' : 'FAIL'}`,
      );
      for (const f of out.findings) {
        lines.push(`  ${f.id} path=${f.path}${f.resolved === null ? '' : ` -> ${f.resolved}`} line=${f.line}`);
      }
      for (const p of problems) lines.push(`  PROBLEM ${p}`);
      lines.push('');
    } finally {
      if (fixture !== null) rmSync(fixture.dir, { recursive: true, force: true });
    }
  }

  const summary = {
    schema: SELFTEST_SCHEMA,
    fixtures: fixturesDir,
    scratch: scratchRoot,
    cases: results.length,
    passed: results.length - failed,
    failed,
    ok: failed === 0,
    results,
  };
  if (opts.json) {
    process.stdout.write(`${JSON.stringify(summary)}\n`);
  } else {
    lines.push(`selftest cases=${results.length} passed=${results.length - failed} failed=${failed}`);
    process.stdout.write(`${lines.join('\n')}\n`);
  }
  process.exit(failed === 0 ? 0 : 1);
}

try {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.selftest) runSelftest(opts);
  else runCli(opts);
} catch (e) {
  die('unexpected error', e instanceof Error ? e.message : String(e));
}
