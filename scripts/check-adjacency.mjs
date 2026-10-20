#!/usr/bin/env node
// Sibling-adjacency map gate (round 17, claim C3).
//
// corpus/adjacency.tsv records the overlaps the lane has dispositioned; known
// undispositioned overlaps are listed in the round lesson. Each row quotes
// the exact line on each side and states a disposition.
// The map is evidence, so it is never read from the worktree: the map bytes,
// every sibling/ruling line and every tabi file are read with
// `git cat-file blob` at exact commits (this lane at the evaluated revision;
// each sibling and ruling line at its own pinned commit). The gate routes the
// round-16 integrator ruling as one `ruled` row
// (corpus/lessons/round-16-verifier-spotcheck.md:138-142) and the remaining
// overlaps found by sweep.
//
// Usage:
//   node scripts/check-adjacency.mjs [--at REV] [--json] [--fleet <dir>] [--repo <dir>]
//   node scripts/check-adjacency.mjs --self-test
//   node scripts/check-adjacency.mjs --reasons
//
// --repo defaults to the git toplevel of the cwd (the lane). --at defaults to
// the LANE TIP, never HEAD: a jj-colocated lane detaches git HEAD, which may
// name an unlanded or empty commit, so a HEAD read would certify bytes that are
// on no branch. resolveLaneTip() resolves `git symbolic-ref -q HEAD` when
// attached and falls back to the refs/heads ladder when detached, then
// requires a refs/heads/ name that resolves to a commit. The anchor is read with
// `symbolic-ref -q --no-recurse HEAD`, must be exactly one refs/heads/ line
// (status 0), and detached HEAD must be status 1 with empty stdout; anything
// else is could_not_evaluate. The anchor must itself be a direct ref (a
// `for-each-ref %(symref)` check refuses refs/heads/master pointing at a
// remote-tracking ref). An explicit --at must name a commit; any HEAD-relative
// token (HEAD, HEAD~1, @, ...) is refused.
//
// --fleet defaults to the parent directory of the lane repository
// (/home/vgpnk/Projects/shokunin for the lane at
// /home/vgpnk/Projects/shokunin/tabi-shokunin). Sibling lanes resolve as
// <fleet>/<lane>-shokunin and the `fleet` ruling token resolves to <fleet>;
// both must be non-symlink directories that are exactly a git toplevel whose
// absolute git dir is <dir>/.git (a gitfile or nested repository cannot
// impersonate a lane). A lane checked from a sandbox clone must pass --fleet so
// the cited sibling commits still resolve. Every git child runs with
// GIT_CEILING_DIRECTORIES=<parent of the repo>, so a broken .git in the lane
// cannot silently fall through to the enclosing fleet repository.
//
// Map shape: line 1 is the header, then one row per overlap, 9 TAB columns:
//   surface  sibling  sibling_ref  sibling_quote  tabi_ref  tabi_quote
//   disposition  ruling_ref  ruling_quote
// The header must be exactly those names in that order. One trailing CR is
// stripped from the row line and from each referenced line (CRLF transport),
// so quoted text never carries a CR. Every field is trimmed of surrounding
// whitespace before use; quotes are matched as verbatim substrings after that
// trim, so interior whitespace and punctuation must match the cited line.
//
//   surface        non-empty overlap name, ASCII [a-z0-9-] only.
//   sibling        exactly the lane token named in sibling_ref (e.g.
//                  `kaidoku` for `kaidoku-shokunin`); a token list or a
//                  `-shokunin` suffix is not an equality.
//   sibling_ref    <lane>-shokunin@<40-hex>:<path>:<line>. <path> is a clean
//                  repo-relative path outside `.ufo/` (wave scratch is not a
//                  province-level claim); sibling_quote must be a verbatim
//                  substring of exactly that line of that file at that commit.
//                  The commit must be reachable from that repository's lane
//                  tip — the first existing of refs/heads/master, then
//                  refs/heads/main (the ladder, not HEAD, so a detached
//                  jj-colocated lane still names its own line): a dangling
//                  commit written with hash-object/mktree/commit-tree is not
//                  evidence. The ref used is recorded in --json `tips`. One
//                  sibling pin (`<lane>@<path>:<line>`, commit-independent) is
//                  cited once: a second row reusing it is duplicate_row even
//                  under another surface.
//   sibling_quote  verbatim substring, 4..25 whitespace-separated words and at
//                  least 20 non-space characters.
//   tabi_ref       <path>:<line> in this lane, resolved at the evaluated
//                  revision; the quote must be on that exact line. The map
//                  itself (corpus/adjacency.tsv) and every path under .ufo/
//                  are refused: a row cannot quote itself.
//   tabi_quote     verbatim substring, 4..25 words, >= 20 non-space characters.
//   disposition    ruled | contested-open | split-declared | refused-route.
//   ruling_ref     ruled: <repo>@<40-hex>:<path>:<line> whose venue is the
//                  fleet repository outside `.ufo/` (an l0 question is a
//                  question, not a ruling) or a tabi
//                  `corpus/lessons/*-verifier-spotcheck.md` line authored by
//                  someone other than this lane; the commit must be reachable
//                  from that repository's lane-tip ladder, and its
//                  ruling_quote must name the sibling lane.
//                  contested-open: exactly fleet@<40-hex>:.ufo/l0-questions.md:<line>
//                  naming a `tabi | round-<N> |` row that itself names the
//                  sibling lane.
//                  split-declared / refused-route: `-`.
//   ruling_quote   ruled / contested-open: verbatim substring of the cited
//                  ruling line. split-declared / refused-route: verbatim
//                  substring of the tabi file named by tabi_ref (there is no
//                  third file to pin, so the committed refinement of "both
//                  quotes state the split" is exact verbatim existence).
// This lane never counts as its own sibling, and it cannot rule on itself:
// a `ruled` self-venue ruling is only a tabi
// `corpus/lessons/*-verifier-spotcheck.md` line whose last touching commit at
// the pinned revision was authored by someone other than `tabi-shokunin`
// (the integrator spot-check precedent), the commit must be an ancestor of
// the evaluated revision, and the cited line must be byte-identical there.
// Such rows are reported in --json as selfRulings so the integrator can
// decide whether they carry weight.
// No field may contain C0/C1 controls, bidi overrides or zero-width/BOM
// characters (field_control_char); quotes must be non-vacuous.
//
// Exit classes:
//   0  evaluated clean
//   1  evaluated, per-row findings
//   2  could not evaluate: map_unreadable, map_schema_invalid,
//      revision_unresolved, lane_tip_unresolved, git_failed, usage
//
// Per-row finding reasons (closed vocabulary):
//   column_count            row is not exactly 9 TAB-separated columns
//   surface_empty           surface column is empty
//   surface_charset         surface carries a byte outside ASCII [a-z0-9-]
//                           (a homoglyph or punctuation is not a surface)
//   field_control_char      a field carries a C0/C1 control, bidi override or
//                           zero-width/BOM code point
//   sibling_ref_invalid     malformed ref, unclean path, the sibling column
//                           is not exactly the lane named in the ref, or the
//                           ref names this lane's own repository
//   sibling_unresolved      well-formed ref, but the sibling repo, commit,
//                           path or line does not resolve, the path is not a
//                           regular file, or the commit is not reachable from
//                           the sibling's lane-tip ladder
//   sibling_quote_absent    sibling_quote empty or not on the cited line
//   tabi_ref_invalid        tabi_ref is not <clean path>:<line>, or it
//                           cites the map or a path under .ufo/
//   tabi_unresolved         tabi file absent/unreadable at the evaluated
//                           revision, or the named :line is absent
//   tabi_quote_absent       tabi_quote empty or not on the cited line
//   disposition_unknown     disposition is not one of the four
//   ruling_ref_invalid      malformed ref, the disposition's presence rule
//                           violated (ruled/contested-open need a ref;
//                           split-declared/refused-route need `-`), a citing
//                           path under the map/waves, a ruled venue that is
//                           not the fleet repo or an allowed self-venue
//                           spotcheck line, or a self-venue line authored by
//                           this lane
//   ruling_unresolved       ruled: ruling repo/commit/path/line unresolved or
//                           not reachable from that repo's lane-tip ladder;
//                           self-venue: pinned commit not an ancestor of the
//                           evaluated revision or the pinned line changed
//   ruling_quote_absent     ruling_quote empty or not on the cited line (or,
//                           for split rows, not in the tabi file; for ruled
//                           rows, not naming the sibling lane)
//   l0_line_absent          contested-open: the l0 line is beyond EOF, is
//                           not a `tabi | round-<N> |` row, or does not name
//                           the sibling lane
//   quote_too_long          a quote exceeds 25 whitespace-separated words
//   quote_too_short         a quote is under 4 words or 20 non-space chars
//   duplicate_row           the same folded surface+sibling pair appears on
//                           two rows, or the same sibling pin
//                           (lane@path:line) is cited twice
//
// Stdout grammar (text mode): first line
//   ADJACENCY verdict=clean|failed|could_not_evaluate rows=N verified=M
// then one sorted line per finding
//   finding row=<n|-> reason=<reason> detail=<text>
// row=- marks a gate-level could-not-evaluate finding. verified counts data
// rows with no finding. With --json, stdout is exactly one JSON object line.
//
// No token ever reaches a shell: every child is spawned with an argv array
// under a minimal Git environment (see minimalEnv), pathspecs are literal,
// replace objects and grafts are disabled, and core.commitGraph=false keeps a
// forged commit-graph from lying about ancestry. --self-test builds a disposable
// fleet of git repositories under the OS temp directory and asserts one clean
// case plus at least one case per reason, each negative asserting its exact
// reason set and exit class; the last line is
//   ADJACENCY_SELFTEST verdict=clean cases=<n> reasons=<k> could_not_evaluate=<m>
// --reasons prints the closed vocabularies as one JSON line.

import { spawnSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(import.meta.url);

const MAP_PATH = 'corpus/adjacency.tsv';
const L0_PATH = '.ufo/l0-questions.md';
const RESULT_SCHEMA = 'tabi-adjacency-check-v1';
const REASONS_SCHEMA = 'tabi-adjacency-reasons-v1';
const MAX_QUOTE_WORDS = 25;
const MIN_QUOTE_WORDS = 4;
const MIN_QUOTE_CHARS = 20;
const MAX_BUFFER = 64 * 1024 * 1024;
const DETAIL_MAX = 240;

// The lane this gate is registered in. It never counts as its own sibling.
const SELF_LANE = 'tabi';
const SELF_LANE_REPO = `${SELF_LANE}-shokunin`;
// A self-venue ruling is allowed only from an integrator spot-check lesson
// whose touching commit was authored by someone other than this lane.
const SELF_RULING_PATH = /^corpus\/lessons\/[^/]*-verifier-spotcheck\.md$/;
// Branch-tip ladder for a sibling or fleet repository (L1 ruling): the first
// one that exists is the tip, and the ref used is recorded in --json `tips`.
const TIP_FALLBACKS = Object.freeze(['refs/heads/master', 'refs/heads/main']);
const LANE_TIP_FALLBACKS = Object.freeze(['refs/heads/master']);
// The map itself and wave scaffolding are never evidence: a row must not quote
// itself or the seat files that assembled it.
const TABI_SELF_CITATION_EXACT = Object.freeze([MAP_PATH]);
const TABI_SELF_CITATION_PREFIX = '.ufo/';
const RULING_SELF_CITATION_EXACT = Object.freeze([MAP_PATH]);
const RULING_SELF_CITATION_PREFIX = '.ufo/waves/';
// Wave scratch is never evidence: sibling pins, and every `ruled` venue, must
// not cite paths under `.ufo/` (l0-questions is a question ledger, not a
// ruling; the contested-open venue names it explicitly).
const DOT_UFO_PREFIX = '.ufo/';
// A surface is an ASCII kebab-case token: cross-script homoglyphs and
// punctuation are not foldable to a stable key.
const SURFACE_CHARSET = /^[a-z0-9-]+$/;
// C0/C1 controls, bidi overrides, zero-width and BOM code points. A quote that
// carries any of these is not a human-checkable verbatim citation.
const BANNED_CHARS = /[\x00-\x1f\x7f-\x9f\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/u;
const LANE_REF_LINE = /^refs\/heads\/[A-Za-z0-9._/-]+\n$/;

const COLUMNS = Object.freeze([
  'surface', 'sibling', 'sibling_ref', 'sibling_quote', 'tabi_ref',
  'tabi_quote', 'disposition', 'ruling_ref', 'ruling_quote',
]);
const DISPOSITIONS = Object.freeze(['ruled', 'contested-open', 'split-declared', 'refused-route']);
const SPLIT_DISPOSITIONS = Object.freeze(new Set(['split-declared', 'refused-route']));

const HEX40 = /^[0-9a-f]{40}$/;
const PATH_CHARS = /^[A-Za-z0-9._/-]+$/;
const LANE_TOKEN = /^[a-z0-9][a-z0-9-]*$/;
const SIBLING_REF = /^([a-z0-9][a-z0-9-]*)-shokunin@([0-9a-f]{40}):(.+):([1-9][0-9]*)$/;
const RULING_REF = /^(fleet|[a-z0-9][a-z0-9-]*-shokunin)@([0-9a-f]{40}):(.+):([1-9][0-9]*)$/;
const TABI_REF = /^([^:]+):([1-9][0-9]*)$/;
const L0_TABI_ROW = /^tabi[ \t]*\|[ \t]*round-[0-9]+[ \t]*\|/;
const HEAD_RELATIVE = /^(?:HEAD|head|@)/;

const EXIT = Object.freeze({ clean: 0, findings: 1, couldNotEvaluate: 2 });

// Closed could-not-evaluate vocabulary.
const FAILURE_REASON = Object.freeze({
  mapUnreadable: 'map_unreadable',
  mapSchemaInvalid: 'map_schema_invalid',
  revisionUnresolved: 'revision_unresolved',
  laneTipUnresolved: 'lane_tip_unresolved',
  gitFailed: 'git_failed',
  usage: 'usage',
});

// Closed per-row finding vocabulary.
const REASON = Object.freeze({
  columnCount: 'column_count',
  surfaceEmpty: 'surface_empty',
  surfaceCharset: 'surface_charset',
  fieldControlChar: 'field_control_char',
  siblingRefInvalid: 'sibling_ref_invalid',
  siblingUnresolved: 'sibling_unresolved',
  siblingQuoteAbsent: 'sibling_quote_absent',
  tabiRefInvalid: 'tabi_ref_invalid',
  tabiUnresolved: 'tabi_unresolved',
  tabiQuoteAbsent: 'tabi_quote_absent',
  dispositionUnknown: 'disposition_unknown',
  rulingRefInvalid: 'ruling_ref_invalid',
  rulingUnresolved: 'ruling_unresolved',
  rulingQuoteAbsent: 'ruling_quote_absent',
  l0LineAbsent: 'l0_line_absent',
  quoteTooLong: 'quote_too_long',
  quoteTooShort: 'quote_too_short',
  duplicateRow: 'duplicate_row',
});
const FINDING_REASONS = Object.freeze(Object.values(REASON));
const COULD_NOT_EVALUATE_REASONS = Object.freeze(Object.values(FAILURE_REASON));

// Fixed global git config so a repository-controlled fsmonitor hook cannot
// execute during plumbing and a forged commit-graph cannot lie about
// ancestry; every pathspec is also literal by env.
const GIT_PREFIX = ['-c', 'core.fsmonitor=false', '-c', 'core.quotepath=false', '-c', 'core.commitGraph=false'];

class CouldNotEvaluate extends Error {
  constructor(reason, detail) {
    super(detail);
    this.reason = reason;
  }
}

function refuse(reason, detail) {
  throw new CouldNotEvaluate(reason, cleanDetail(detail));
}

function cleanDetail(value) {
  const text = String(value).replace(/[\0-\x20\x7f]+/g, ' ').trim();
  return text.length > DETAIL_MAX ? `${text.slice(0, DETAIL_MAX)}...` : text;
}

// Minimal child environment: Git config/hook/replace/graft/lazy-fetch and
// pathspec-magic controls plus absolute PATH entries, HOME and TZ=UTC. Nothing
// else is inherited, so Git config, hooks, grafts and credential helpers cannot
// alter what the gate observes.
function minimalEnv() {
  const env = {
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_OPTIONAL_LOCKS: '0',
    GIT_TERMINAL_PROMPT: '0',
    GIT_NO_REPLACE_OBJECTS: '1',
    GIT_GRAFT_FILE: '/dev/null',
    GIT_NO_LAZY_FETCH: '1',
    GIT_LITERAL_PATHSPECS: '1',
    TZ: 'UTC',
  };
  if (process.env.PATH !== undefined) {
    env.PATH = process.env.PATH.split(':').filter((entry) => entry.startsWith('/')).join(':');
  }
  if (process.env.HOME !== undefined) env.HOME = process.env.HOME;
  return env;
}

function git(repo, args, binary = false, ceiling = null) {
  const env = minimalEnv();
  if (ceiling !== null) env.GIT_CEILING_DIRECTORIES = ceiling;
  try {
    return spawnSync('git', [...GIT_PREFIX, ...args], {
      cwd: repo,
      env,
      encoding: binary ? undefined : 'utf8',
      maxBuffer: MAX_BUFFER,
    });
  } catch (error) {
    return { error, status: null, stdout: '', stderr: '' };
  }
}

// Calls against a directory already proven to be a repository: discovery may
// not climb above it, so a broken .git cannot fall through to the enclosing
// fleet repository.
function gitIn(repo, args, binary = false) {
  return git(repo, args, binary, repo);
}

const realCache = new Map();

function realSafe(dir) {
  if (realCache.has(dir)) return realCache.get(dir);
  let real = null;
  try {
    real = realpathSync(dir);
  } catch {
    real = null;
  }
  realCache.set(dir, real);
  return real;
}

function gitError(args, result) {
  const stderr = result.stderr ? String(result.stderr).slice(0, 160) : '';
  return `git ${args.join(' ')} failed (status=${result.status ?? 'spawn'})${stderr ? ` stderr=${stderr}` : ''}`;
}

// Resolve a revision string to a commit id. --end-of-options keeps a
// leading-'-' token from being read as a git option.
function resolveCommit(repo, rev, label) {
  const text = String(rev);
  if (text.startsWith('-') || text.includes('\0')) {
    refuse(FAILURE_REASON.revisionUnresolved, `${label} ${cleanDetail(text)} is not a revision token`);
  }
  const result = gitIn(repo, ['rev-parse', '--verify', '--end-of-options', `${text}^{commit}`]);
  if (result.error || result.status !== 0) {
    refuse(FAILURE_REASON.revisionUnresolved, `${label} ${cleanDetail(text)} does not resolve to a commit`);
  }
  return result.stdout.trim();
}

// Same as resolveCommit but a failure is reported by the caller as a finding.
function resolveCommitOrNull(repo, commit) {
  const result = gitIn(repo, ['rev-parse', '--verify', '--end-of-options', `${commit}^{commit}`]);
  if (result.error || result.status !== 0) return null;
  return result.stdout.trim();
}

// Ancestry is what makes a cited object evidence: an object written with
// hash-object/commit-tree but never referenced is not on the lane.
function isAncestor(repo, older, newer) {
  const result = gitIn(repo, ['merge-base', '--is-ancestor', older, newer]);
  if (result.error) {
    refuse(FAILURE_REASON.gitFailed, gitError(['merge-base', '--is-ancestor', older, newer], result));
  }
  if (result.status === 0) return true;
  if (result.status === 1) return false;
  refuse(FAILURE_REASON.gitFailed, gitError(['merge-base', '--is-ancestor', older, newer], result));
}

// The lane tip: attached HEAD names its own branch; detached HEAD (the
// jj-colocated shape) falls back to the primary bookmark that exists. Either
// way the anchor must be exactly one refs/heads/ line naming a direct ref that
// resolves to a commit; HEAD itself is never read. Status 1 with unexpected
// stdout, a non-heads name, a symref anchor, or an unresolvable ref is a
// could-not-evaluate, not a silent fallback.
// A ref must be a direct (non-symref) branch that resolves to a commit.
function exactBranchCommit(repo, ref, label) {
  const symref = gitIn(repo, ['for-each-ref', '--format=%(symref)', '--', ref]);
  if (symref.error || symref.status !== 0) {
    refuse(FAILURE_REASON.gitFailed, gitError(['for-each-ref', ref], symref));
  }
  const target = symref.stdout.trim();
  if (target !== '') {
    refuse(FAILURE_REASON.laneTipUnresolved, `${label}: ${ref} is a symref to ${cleanDetail(target)}`);
  }
  const resolved = gitIn(repo, ['rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`]);
  if (resolved.error || resolved.status !== 0) {
    refuse(FAILURE_REASON.laneTipUnresolved, `${label}: ${ref} does not resolve to a commit`);
  }
  return resolved.stdout.trim();
}

// The sibling/fleet tip is the first refs/heads/ ref on the ladder that
// exists (master, then main): a jj-colocated lane detaches HEAD, and the
// ladder is what names the lane's own line, not the detached commit. The ref
// used is returned so callers can record it.
function resolveLadderTip(repo, fallbacks, label) {
  for (const candidate of fallbacks) {
    if (gitIn(repo, ['show-ref', '--verify', '--quiet', candidate]).status === 0) {
      return { commit: exactBranchCommit(repo, candidate, label), ref: candidate };
    }
  }
  refuse(FAILURE_REASON.laneTipUnresolved,
    `${label}: detached HEAD and none of ${fallbacks.join(',')} exists`);
}

// The lane tip: attached HEAD names its own branch (strictly one refs/heads/
// line); detached HEAD (the jj-colocated shape) resolves the ladder. Either
// way the anchor must be a direct ref that resolves to a commit; HEAD itself
// is never read.
function resolveLaneTip(repo, fallbacks, label) {
  const anchor = gitIn(repo, ['symbolic-ref', '-q', '--no-recurse', 'HEAD']);
  if (anchor.error || anchor.status === null || (anchor.status !== 0 && anchor.status !== 1)) {
    refuse(FAILURE_REASON.gitFailed, gitError(['symbolic-ref', '-q', '--no-recurse', 'HEAD'], anchor));
  }
  if (anchor.status === 0) {
    if (!LANE_REF_LINE.test(anchor.stdout)) {
      refuse(FAILURE_REASON.laneTipUnresolved,
        `${label}: HEAD names ${cleanDetail(anchor.stdout)} not exactly one refs/heads/ branch`);
    }
    const ref = anchor.stdout.slice(0, -1);
    return { commit: exactBranchCommit(repo, ref, label), ref };
  }
  if (anchor.stdout !== '') {
    refuse(FAILURE_REASON.laneTipUnresolved, `${label}: detached HEAD printed ${cleanDetail(anchor.stdout)}`);
  }
  return resolveLadderTip(repo, fallbacks, label);
}

// A sibling/ruling repository tip is a finding, never a gate-level refusal:
// one unresolvable sibling must not hide every other row.
const tipCache = new Map();

function tipOrNull(repo) {
  if (tipCache.has(repo)) return tipCache.get(repo);
  let value;
  try {
    const tip = resolveLadderTip(repo, TIP_FALLBACKS, 'repo tip');
    value = { ok: true, tip: tip.commit, ref: tip.ref };
  } catch (error) {
    if (error instanceof CouldNotEvaluate) value = { ok: false, why: error.message };
    else throw error;
  }
  tipCache.set(repo, value);
  return value;
}

// Explicit --at: a commit, never a HEAD-relative token.
function resolveAt(lane, at) {
  const text = String(at);
  if (HEAD_RELATIVE.test(text)) {
    refuse(FAILURE_REASON.revisionUnresolved,
      `--at ${cleanDetail(text)} is HEAD-relative; the gate anchors the lane tip or an explicit commit, never HEAD`);
  }
  return resolveCommit(lane, text, '--at');
}

// Resolve the repository root: --repo <dir> canonicalized through git itself,
// or the git toplevel of the cwd when --repo is absent. Discovery must not
// have climbed past the nearest .git: a broken <dir>/.git would otherwise make
// the enclosing fleet repository stand in for the lane.
function resolveRepo(dir) {
  const target = resolvePath(dir ?? process.cwd());
  const result = git(target, ['rev-parse', '--show-toplevel']);
  if (result.error || result.status !== 0) {
    refuse(FAILURE_REASON.gitFailed, gitError(['rev-parse', '--show-toplevel'], result));
  }
  let realTarget;
  let realTop;
  try {
    realTarget = realpathSync(target);
    realTop = realpathSync(result.stdout.trim());
  } catch (error) {
    refuse(FAILURE_REASON.gitFailed, `${target}: ${error.message}`);
  }
  if (realTop !== realTarget && !realTarget.startsWith(`${realTop}/`)) {
    refuse(FAILURE_REASON.gitFailed, `${target} resolves outside its repository ${realTop}`);
  }
  for (let current = realTarget; current !== realTop && current !== dirname(current); current = dirname(current)) {
    let present = false;
    try {
      lstatSync(join(current, '.git'));
      present = true;
    } catch {
      present = false;
    }
    if (present) {
      refuse(FAILURE_REASON.gitFailed,
        `${current}/.git exists but did not resolve as the repository; refusing parent fallthrough to ${realTop}`);
    }
  }
  return realTop;
}

function resolveFleet(explicit, lane) {
  if (explicit === null) return dirname(lane);
  const dir = resolvePath(explicit);
  let ok = false;
  try {
    ok = existsSync(dir) && statSync(dir).isDirectory();
  } catch {
    ok = false;
  }
  if (!ok) refuse(FAILURE_REASON.usage, `--fleet ${dir} is not a directory`);
  return dir;
}

// A repo-relative path suitable for a literal pathspec and for the path half of
// a rev:path object spec: no leading '/', '-', ':' or '!' magic, no NUL/
// newline/backslash, no '.' or '..' segments. A single trailing '/' is not
// allowed here because every reference names a file.
function isCleanRepoPath(path) {
  if (typeof path !== 'string' || path.length === 0 || path.length > 512) return false;
  if (path.includes('\0') || path.includes('\\')) return false;
  if (!PATH_CHARS.test(path)) return false;
  return path.split('/').every((segment) =>
    segment.length > 0 && segment !== '.' && segment !== '..' && !segment.startsWith('-'));
}

// A directory counts as a repository only when it is itself (not a symlink)
// exactly the git toplevel whose absolute git dir is <dir>/.git, so a nested
// repository, a symlink or a gitfile cannot impersonate the sibling lane.
const repoIdentityCache = new Map();

function repoIdentity(dir) {
  if (repoIdentityCache.has(dir)) return repoIdentityCache.get(dir);
  let identity = null;
  const real = realSafe(dir);
  if (real !== null) {
    let stat = null;
    try {
      stat = lstatSync(dir);
    } catch {
      stat = null;
    }
    if (stat !== null && stat.isDirectory() && !stat.isSymbolicLink()) {
      const gitDir = gitIn(real, ['rev-parse', '--absolute-git-dir']);
      const top = gitIn(real, ['rev-parse', '--show-toplevel']);
      if (!gitDir.error && gitDir.status === 0 && !top.error && top.status === 0) {
        try {
          const absoluteGitDir = realpathSync(gitDir.stdout.trim());
          const topReal = realpathSync(top.stdout.trim());
          if (topReal === real && absoluteGitDir === join(real, '.git')) identity = real;
        } catch {
          identity = null;
        }
      }
    }
  }
  repoIdentityCache.set(dir, identity);
  return identity;
}

// The tree entry for one exact path at one revision: { mode, type, oid } or
// null when absent. ls-tree on an exact file path yields exactly one entry.
function treeEntry(repo, rev, path) {
  const result = gitIn(repo, ['ls-tree', '-z', rev, '--', path]);
  if (result.error) refuse(FAILURE_REASON.gitFailed, gitError(['ls-tree', rev, path], result));
  if (result.status !== 0) return null;
  const rows = result.stdout.split('\0').filter((row) => row.length > 0);
  if (rows.length === 0) return null;
  const match = /^([0-7]{6}) (\S+) ([0-9a-f]{40})\t(.*)$/.exec(rows[0]);
  if (!match) refuse(FAILURE_REASON.gitFailed, `git ls-tree ${rev} ${path}: malformed row`);
  return { mode: match[1], type: match[2], oid: match[3], name: match[4] };
}

const fileTextCache = new Map();

// The committed regular-file bytes at <rev>:<path>, or {ok:false, why} when the
// path is absent or not a regular file (a symlink's "blob" is its link text and
// is never quoted as content). Read under GIT_NO_REPLACE_OBJECTS.
function fileText(repo, rev, path) {
  const key = `${repo}\0${rev}\0${path}`;
  if (fileTextCache.has(key)) return fileTextCache.get(key);
  const entry = treeEntry(repo, rev, path);
  let value;
  if (entry === null) {
    value = { ok: false, why: `path absent at ${rev}` };
  } else if (entry.type !== 'blob' || (entry.mode !== '100644' && entry.mode !== '100755')) {
    value = { ok: false, why: `mode ${entry.mode} ${entry.type} is not a regular file` };
  } else {
    const result = gitIn(repo, ['cat-file', 'blob', `${rev}:${path}`]);
    if (result.error || result.status !== 0) {
      refuse(FAILURE_REASON.gitFailed, gitError(['cat-file', 'blob', `${rev}:${path}`], result));
    }
    value = { ok: true, text: result.stdout };
  }
  fileTextCache.set(key, value);
  return value;
}

function stripCr(line) {
  return line.endsWith('\r') ? line.slice(0, -1) : line;
}

// Lines of a blob: a single final newline does not create an empty last line.
function splitLines(text) {
  if (text.length === 0) return [];
  const lines = text.split('\n');
  if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
  return lines;
}

function lineFromText(text, lineNo) {
  const lines = splitLines(text);
  if (lineNo < 1 || lineNo > lines.length) {
    return { ok: false, why: `line ${lineNo} absent (lines=${lines.length})` };
  }
  return { ok: true, text: stripCr(lines[lineNo - 1]) };
}

function lineAt(repo, rev, path, lineNo) {
  const blob = fileText(repo, rev, path);
  if (!blob.ok) return blob;
  return lineFromText(blob.text, lineNo);
}

function wordCount(text) {
  const trimmed = text.trim();
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
}

function nonSpaceCount(text) {
  return text.replace(/\s+/g, '').length;
}

function readMapAt(lane, atRev) {
  const blob = fileText(lane, atRev, MAP_PATH);
  if (!blob.ok) refuse(FAILURE_REASON.mapUnreadable, `${MAP_PATH} ${blob.why}`);
  return blob.text;
}

function quoteLengthProblems(quote, label, add) {
  if (wordCount(quote) > MAX_QUOTE_WORDS) {
    add(REASON.quoteTooLong, `${label} words=${wordCount(quote)} max=${MAX_QUOTE_WORDS}`);
  }
  if (wordCount(quote) < MIN_QUOTE_WORDS || nonSpaceCount(quote) < MIN_QUOTE_CHARS) {
    add(REASON.quoteTooShort,
      `${label} words=${wordCount(quote)} non_space=${nonSpaceCount(quote)} ` +
      `min=${MIN_QUOTE_WORDS}/${MIN_QUOTE_CHARS}`);
  }
}

function checkSibling({ lane, fleet, sibling, ref, quote, quoteBanned, add }) {
  const match = SIBLING_REF.exec(ref);
  if (match === null) {
    add(REASON.siblingRefInvalid,
      `sibling_ref=${cleanDetail(ref)} must be <lane>-shokunin@<40-hex>:<path>:<line>`);
    return null;
  }
  const laneToken = match[1];
  const commit = match[2];
  const path = match[3];
  const lineNo = Number(match[4]);
  if (!isCleanRepoPath(path)) {
    add(REASON.siblingRefInvalid, `sibling_ref path=${cleanDetail(path)} is not a clean repo-relative path`);
    return null;
  }
  if (path === DOT_UFO_PREFIX.replace(/\/$/, '') || path.startsWith(DOT_UFO_PREFIX)) {
    add(REASON.siblingRefInvalid,
      `sibling_ref path=${path} is under .ufo/; wave scratch is not a province-level claim`);
    return null;
  }
  // The sibling column must name exactly the lane in sibling_ref: a
  // lane-token list or a `-shokunin` suffix is not an equality.
  if (!LANE_TOKEN.test(sibling) || sibling !== laneToken) {
    add(REASON.siblingRefInvalid,
      `sibling=${cleanDetail(sibling)} does not equal the lane named in sibling_ref (${laneToken})`);
    return null;
  }
  if (laneToken === SELF_LANE) {
    add(REASON.siblingRefInvalid, `sibling_ref lane=${laneToken} is this lane's own repository`);
    return null;
  }
  const dir = join(fleet, `${laneToken}-shokunin`);
  const identity = repoIdentity(dir);
  if (identity === null) {
    add(REASON.siblingUnresolved, `sibling repo ${dir} is absent or not a git toplevel`);
    return null;
  }
  const ownReal = realSafe(lane);
  if (ownReal !== null && identity === ownReal) {
    add(REASON.siblingRefInvalid, `sibling repo ${dir} is this lane's own repository`);
    return null;
  }
  const resolved = resolveCommitOrNull(identity, commit);
  if (resolved === null) {
    add(REASON.siblingUnresolved, `sibling=${laneToken} commit=${commit} does not resolve`);
    return null;
  }
  const tip = tipOrNull(identity);
  if (!tip.ok) {
    add(REASON.siblingUnresolved, `sibling=${laneToken} lane tip: ${tip.why}`);
    return null;
  }
  if (!isAncestor(identity, resolved, tip.tip)) {
    add(REASON.siblingUnresolved,
      `sibling=${laneToken} commit=${commit} is not reachable from lane tip ${tip.tip}`);
    return null;
  }
  const line = lineAt(identity, resolved, path, lineNo);
  if (!line.ok) {
    add(REASON.siblingUnresolved, `sibling=${laneToken}@${commit}:${path}:${lineNo} ${line.why}`);
    return null;
  }
  if (!quoteBanned) {
    if (quote.length === 0) {
      add(REASON.siblingQuoteAbsent, 'sibling_quote is empty');
    } else {
      quoteLengthProblems(quote, 'sibling_quote', add);
      if (!line.text.includes(quote)) {
        add(REASON.siblingQuoteAbsent, `sibling_quote not on ${laneToken}@${commit}:${path}:${lineNo}`);
      }
    }
  }
  return line.text;
}

function checkTabi({ lane, atRev, ref, quote, quoteBanned, add }) {
  // tabi_ref must be <path>:<line>: the exact line carries the quote.
  const match = TABI_REF.exec(ref);
  if (match === null || !isCleanRepoPath(match[1])) {
    add(REASON.tabiRefInvalid, `tabi_ref=${cleanDetail(ref)} must be <clean path>:<line>`);
    return null;
  }
  const path = match[1];
  const lineNo = Number(match[2]);
  if (TABI_SELF_CITATION_EXACT.includes(path)
      || path === TABI_SELF_CITATION_PREFIX.replace(/\/$/, '')
      || path.startsWith(TABI_SELF_CITATION_PREFIX)) {
    add(REASON.tabiRefInvalid,
      `tabi_ref=${path} is the map or under .ufo/; a row cannot quote itself`);
    return null;
  }
  const blob = fileText(lane, atRev, path);
  if (!blob.ok) {
    add(REASON.tabiUnresolved, `tabi_ref=${path} ${blob.why}`);
    return null;
  }
  const line = lineFromText(blob.text, lineNo);
  if (!line.ok) {
    add(REASON.tabiUnresolved, `tabi_ref=${path}:${lineNo} ${line.why} at ${atRev}`);
    return null;
  }
  const where = `${path}:${lineNo} at ${atRev}`;
  if (!quoteBanned) {
    if (quote.length === 0) {
      add(REASON.tabiQuoteAbsent, 'tabi_quote is empty');
    } else {
      quoteLengthProblems(quote, 'tabi_quote', add);
      if (!line.text.includes(quote)) {
        add(REASON.tabiQuoteAbsent, `tabi_quote not on ${where}`);
      }
    }
  }
  return blob.text;
}

// The last commit that touched <path> at or before <commit>, or null when git
// cannot name it (absent history, corrupt log). A self-venue ruling is only
// credible when its author is not this lane.
function lastAuthor(repo, commit, path) {
  const result = gitIn(repo, ['log', '-1', '--format=%an', commit, '--', path]);
  if (result.error || result.status !== 0) return null;
  const name = result.stdout.trim();
  return name.length === 0 ? null : name;
}

function checkRuling({
  lane, fleet, atRev, disposition, sibling, ref, quote, quoteBanned, tabiText, tabiRef, add, onSelfRuling,
}) {
  if (SPLIT_DISPOSITIONS.has(disposition)) {
    if (ref !== '-') {
      add(REASON.rulingRefInvalid, `${disposition} requires ruling_ref '-', got ${cleanDetail(ref)}`);
      return;
    }
    if (!quoteBanned) {
      if (quote.length === 0) {
        add(REASON.rulingQuoteAbsent, 'ruling_quote is empty');
      } else {
        quoteLengthProblems(quote, 'ruling_quote', add);
        if (tabiText !== null && !tabiText.includes(quote)) {
          add(REASON.rulingQuoteAbsent, `split ruling_quote not in tabi_ref=${tabiRef} at ${atRev}`);
        }
      }
    }
    return;
  }

  if (ref === '-') {
    add(REASON.rulingRefInvalid, `${disposition} requires a ruling_ref, not '-'`);
    return;
  }
  const match = RULING_REF.exec(ref);
  if (match === null) {
    add(REASON.rulingRefInvalid,
      `ruling_ref=${cleanDetail(ref)} must be <repo>@<40-hex>:<path>:<line>`);
    return;
  }
  const token = match[1];
  const commit = match[2];
  const path = match[3];
  const lineNo = Number(match[4]);
  if (!isCleanRepoPath(path)) {
    add(REASON.rulingRefInvalid, `ruling_ref path=${cleanDetail(path)} is not a clean repo-relative path`);
    return;
  }
  if (RULING_SELF_CITATION_EXACT.includes(path)
      || path === RULING_SELF_CITATION_PREFIX.replace(/\/$/, '')
      || path.startsWith(RULING_SELF_CITATION_PREFIX)) {
    add(REASON.rulingRefInvalid,
      `ruling_ref path=${path} is the map or wave scaffolding; a row cannot quote itself`);
    return;
  }
  if (disposition === 'contested-open' && (token !== 'fleet' || path !== L0_PATH)) {
    add(REASON.rulingRefInvalid, `contested-open ruling_ref must be fleet@<40-hex>:${L0_PATH}:<line>`);
    return;
  }
  const selfVenue = token === SELF_LANE_REPO;
  // A `ruled` venue is the fleet repository outside `.ufo/` or a tabi
  // `corpus/lessons/*-verifier-spotcheck.md` line authored by someone other
  // than this lane; an l0 question and wave scratch are not rulings, and any
  // other repo or any self-written ruling is a refusal.
  if (disposition === 'ruled'
      && (token !== 'fleet'
          || path === DOT_UFO_PREFIX.replace(/\/$/, '') || path.startsWith(DOT_UFO_PREFIX))
      && !(selfVenue && SELF_RULING_PATH.test(path))) {
    add(REASON.rulingRefInvalid,
      `ruled ruling_ref must be fleet@... outside .ufo/ or a non-tabi ` +
      `*-verifier-spotcheck.md line; got ${token}@...:${path}`);
    return;
  }
  const dir = token === 'fleet' ? fleet : join(fleet, token);
  const identity = repoIdentity(dir);
  if (identity === null) {
    add(REASON.rulingUnresolved, `ruling repo ${dir} is absent or not a git toplevel`);
    return;
  }
  const resolved = resolveCommitOrNull(identity, commit);
  if (resolved === null) {
    add(REASON.rulingUnresolved, `ruling_ref ${token}@${commit} does not resolve`);
    return;
  }
  const tip = tipOrNull(identity);
  if (!tip.ok) {
    add(REASON.rulingUnresolved, `ruling repo ${dir} lane tip: ${tip.why}`);
    return;
  }
  if (!isAncestor(identity, resolved, tip.tip)) {
    add(REASON.rulingUnresolved,
      `ruling_ref ${token}@${commit} is not reachable from lane tip ${tip.tip}`);
    return;
  }
  if (selfVenue) {
    const author = lastAuthor(identity, resolved, path);
    if (author === null) {
      add(REASON.rulingUnresolved, `self ruling ${token}@${commit}:${path} has no resolvable author`);
      return;
    }
    if (author === SELF_LANE_REPO) {
      add(REASON.rulingRefInvalid,
        `self ruling ${token}@${commit}:${path} was authored by ${author}; a lane cannot rule on itself`);
      return;
    }
    // The pinned self-ruling is this lane's own past, so it must also be an
    // ancestor of the evaluated revision with the cited line byte-identical.
    if (resolveCommitOrNull(lane, commit) === null) {
      add(REASON.rulingUnresolved, `self ruling ${commit} is absent from this lane`);
      return;
    }
    if (!isAncestor(lane, resolved, atRev)) {
      add(REASON.rulingUnresolved, `self ruling ${commit} is not an ancestor of ${atRev}`);
      return;
    }
    const atEval = lineAt(lane, atRev, path, lineNo);
    if (!atEval.ok) {
      add(REASON.rulingUnresolved, `self ruling ${path}:${lineNo} at ${atRev}: ${atEval.why}`);
      return;
    }
    const pinned = lineAt(identity, resolved, path, lineNo);
    if (pinned.ok && pinned.text !== atEval.text) {
      add(REASON.rulingUnresolved, `self ruling ${path}:${lineNo} changed at ${atRev}`);
      return;
    }
  }
  const line = lineAt(identity, resolved, path, lineNo);
  if (!line.ok) {
    if (disposition === 'contested-open') {
      add(REASON.l0LineAbsent, `l0 ${path}:${lineNo} ${line.why} at ${commit}`);
    } else {
      add(REASON.rulingUnresolved, `ruling_ref ${token}@${commit}:${path}:${lineNo} ${line.why}`);
    }
    return;
  }
  if (disposition === 'contested-open') {
    if (!L0_TABI_ROW.test(line.text)) {
      add(REASON.l0LineAbsent, `l0 ${path}:${lineNo} is not a 'tabi | round-<N> |' row`);
      return;
    }
    // The l0 row must name the sibling lane, not just any tabi question.
    if (!line.text.includes(sibling)) {
      add(REASON.l0LineAbsent, `l0 ${path}:${lineNo} does not name sibling=${cleanDetail(sibling)}`);
      return;
    }
  }
  if (quoteBanned) return;
  if (quote.length === 0) {
    add(REASON.rulingQuoteAbsent, 'ruling_quote is empty');
    return;
  }
  quoteLengthProblems(quote, 'ruling_quote', add);
  if (!line.text.includes(quote)) {
    add(REASON.rulingQuoteAbsent, `ruling_quote not on ${token}@${commit}:${path}:${lineNo}`);
    return;
  }
  if (disposition === 'ruled' && !quote.includes(sibling)) {
    // The quoted ruling words must name the sibling lane.
    add(REASON.rulingQuoteAbsent,
      `ruling_quote does not name sibling=${cleanDetail(sibling)}`);
    return;
  }
  if (selfVenue) onSelfRuling();
}

function evaluateRow({ lane, fleet, atRev, rowNo, fields, onSelfRuling }) {
  const findings = [];
  const add = (reason, detail) => findings.push({ row: rowNo, reason, detail: cleanDetail(detail) });
  if (fields.length !== COLUMNS.length) {
    add(REASON.columnCount, `columns=${fields.length} expected=${COLUMNS.length}`);
    return findings;
  }
  const [
    surfaceRaw, siblingRaw, siblingRefRaw, siblingQuoteRaw, tabiRefRaw,
    tabiQuoteRaw, dispositionRaw, rulingRefRaw, rulingQuoteRaw,
  ] = fields;
  const surface = surfaceRaw.trim();
  const sibling = siblingRaw.trim();
  const siblingRef = siblingRefRaw.trim();
  const siblingQuote = siblingQuoteRaw.trim();
  const tabiRef = tabiRefRaw.trim();
  const tabiQuote = tabiQuoteRaw.trim();
  const disposition = dispositionRaw.trim();
  const rulingRef = rulingRefRaw.trim();
  const rulingQuote = rulingQuoteRaw.trim();

  // Invisible/bidi characters make a "verbatim" quote unreadable and can hide
  // a different claim than the one a human sees.
  fields.forEach((field, index) => {
    if (BANNED_CHARS.test(field)) {
      const code = field.match(BANNED_CHARS)[0].codePointAt(0);
      add(REASON.fieldControlChar,
        `column=${COLUMNS[index]} code=U+${code.toString(16).toUpperCase().padStart(4, '0')}`);
    }
  });
  const quoteBanned = (index) => BANNED_CHARS.test(fields[index]);

  if (surface.length === 0) {
    add(REASON.surfaceEmpty, 'surface column is empty');
  } else if (!SURFACE_CHARSET.test(surface)) {
    const code = surface.match(/[^a-z0-9-]/)[0].codePointAt(0);
    add(REASON.surfaceCharset,
      `surface=${cleanDetail(surface)} has code=U+${code.toString(16).toUpperCase().padStart(4, '0')} not in [a-z0-9-]`);
  }

  checkSibling({
    lane, fleet, sibling, ref: siblingRef, quote: siblingQuote, quoteBanned: quoteBanned(3), add,
  });
  const tabiText = checkTabi({
    lane, atRev, ref: tabiRef, quote: tabiQuote, quoteBanned: quoteBanned(5), add,
  });

  const dispositionKnown = DISPOSITIONS.includes(disposition);
  if (!dispositionKnown) {
    add(REASON.dispositionUnknown, `disposition=${cleanDetail(disposition)}`);
  } else {
    checkRuling({
      lane, fleet, atRev, disposition, sibling, ref: rulingRef, quote: rulingQuote,
      quoteBanned: quoteBanned(8), tabiText, tabiRef, add, onSelfRuling,
    });
  }
  return findings;
}

function foldSurface(surface) {
  return surface.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
}

// Verify every data row of the map at one revision. The header is a schema:
// a mismatch or a map with no data rows cannot be evaluated.
function evaluateMap({ lane, fleet, atRev, text }) {
  const lines = splitLines(text);
  if (lines.length === 0) refuse(FAILURE_REASON.mapSchemaInvalid, `${MAP_PATH} at ${atRev} is empty`);
  const header = stripCr(lines[0]);
  if (header !== COLUMNS.join('\t')) {
    refuse(FAILURE_REASON.mapSchemaInvalid,
      `${MAP_PATH} header is ${JSON.stringify(cleanDetail(header))} not ${JSON.stringify(COLUMNS.join('\t'))}`);
  }
  if (lines.length === 1) {
    refuse(FAILURE_REASON.mapSchemaInvalid, `${MAP_PATH} has a header but no data rows`);
  }
  const findings = [];
  const selfRulings = [];
  // A row is a duplicate when it reuses a surface name already folded for the
  // same sibling lane, or when it re-pins a sibling line (repo@path:line,
  // commit-independent) already cited under another surface.
  const foldedSeen = new Map();
  const pinSeen = new Map();
  let rows = 0;
  for (let index = 1; index < lines.length; index += 1) {
    const rowNo = index + 1;
    const fields = stripCr(lines[index]).split('\t');
    rows += 1;
    findings.push(...evaluateRow({
      lane, fleet, atRev, rowNo, fields,
      onSelfRuling: () => selfRulings.push(rowNo),
    }));
    if (fields.length !== COLUMNS.length) continue;
    const foldedKey = `${foldSurface(fields[0].trim())} ${fields[1].trim()}`;
    const pinKey = siblingRefKey(fields[2].trim());
    const pinHit = pinKey !== null && pinSeen.has(pinKey);
    if (foldedSeen.has(foldedKey) || pinHit) {
      findings.push({
        row: rowNo,
        reason: REASON.duplicateRow,
        detail: `surface=${cleanDetail(fields[0].trim() || '-')} ` +
          `sibling=${cleanDetail(fields[1].trim() || '-')} ` +
          `pin=${cleanDetail(pinKey ?? '-')} ` +
          `first_row=${foldedSeen.get(foldedKey) ?? pinSeen.get(pinKey)}`,
      });
    }
    if (!foldedSeen.has(foldedKey)) foldedSeen.set(foldedKey, rowNo);
    if (pinKey !== null && !pinSeen.has(pinKey)) pinSeen.set(pinKey, rowNo);
  }
  const flagged = new Set(findings.map((finding) => finding.row));
  return { rows, verified: rows - flagged.size, findings: sortFindings(findings), selfRulings };
}

// The commit-independent pin identity `<lane>@<path>:<line>` for a parsed
// sibling_ref, or null when the ref is malformed: one sibling line is cited
// once no matter which commit or surface names it.
function siblingRefKey(ref) {
  const match = SIBLING_REF.exec(ref);
  return match === null ? null : `${match[1]}@${match[3]}:${match[4]}`;
}

function sortFindings(findings) {
  return [...findings].sort((left, right) => {
    const leftRow = left.row === null ? -1 : left.row;
    const rightRow = right.row === null ? -1 : right.row;
    if (leftRow !== rightRow) return leftRow - rightRow;
    return `${left.reason} ${left.detail}`.localeCompare(`${right.reason} ${right.detail}`);
  });
}

function emitText(verdict, rows, verified, findings) {
  console.log(`ADJACENCY verdict=${verdict} rows=${rows} verified=${verified}`);
  for (const finding of findings) {
    console.log(`finding row=${finding.row ?? '-'} reason=${finding.reason} detail=${finding.detail}`);
  }
}

function emitResult({ mode, repo, fleet, atRev, verdict, rows, verified, findings, selfRulings, tips, json }) {
  if (json) {
    console.log(JSON.stringify({
      schema: RESULT_SCHEMA,
      mode,
      map: MAP_PATH,
      repo,
      fleet,
      at: atRev,
      verdict,
      rows,
      verified,
      selfRulings,
      tips,
      vocabulary: { findings: FINDING_REASONS, couldNotEvaluate: COULD_NOT_EVALUATE_REASONS },
      findings: findings.map(({ row, reason, detail }) => ({ row, reason, detail })),
    }));
  } else {
    emitText(verdict, rows, verified, findings);
  }
}

function emitCouldNotEvaluate({ mode, repo, fleet, atRev, error, json }) {
  const findings = [{ row: null, reason: error.reason, detail: cleanDetail(error.message) }];
  emitResult({
    mode, repo, fleet, atRev, verdict: 'could_not_evaluate',
    rows: 0, verified: 0, findings, selfRulings: [], tips: {}, json,
  });
}

function usage() {
  return [
    'ADJACENCY usage:',
    '  node scripts/check-adjacency.mjs [--at REV] [--json] [--fleet <dir>] [--repo <dir>]',
    '  node scripts/check-adjacency.mjs --self-test',
    '  node scripts/check-adjacency.mjs --reasons',
  ].join('\n');
}

function parseArguments(argv) {
  const options = { mode: null, at: null, json: false, fleet: null, repo: null, help: false };
  const nextValue = (flag, index) => {
    const value = argv[index + 1];
    if (value === undefined || value.startsWith('--')) throw new Error(`${flag} requires a value`);
    return value;
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--self-test') {
      if (options.mode !== null) throw new Error('modes are mutually exclusive');
      options.mode = 'self-test';
    } else if (arg === '--reasons') {
      if (options.mode !== null) throw new Error('modes are mutually exclusive');
      options.mode = 'reasons';
    } else if (arg === '--at') {
      options.at = nextValue('--at', index);
      index += 1;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--fleet') {
      options.fleet = nextValue('--fleet', index);
      index += 1;
    } else if (arg === '--repo') {
      options.repo = nextValue('--repo', index);
      index += 1;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  if (!options.help) {
    if (options.mode === 'reasons'
        && (options.at !== null || options.json || options.fleet !== null || options.repo !== null)) {
      throw new Error('--reasons accepts no other arguments');
    }
    if (options.mode === 'self-test'
        && (options.at !== null || options.json || options.fleet !== null || options.repo !== null)) {
      throw new Error('--self-test accepts no other arguments');
    }
  }
  return options;
}

// ---------------------------------------------------------------------------
// --self-test: a disposable fleet of git repositories.
//
// Layout under one temp root F (the fleet root is F itself):
//   F/decisions.md, F/.ufo/l0-questions.md   (fleet repo: `fleet` token)
//   F/tabi-shokunin/                              (lane repo under test)
//   F/kaidoku-shokunin/                           (sibling repo)
// Each case commits its map into the lane and spawns this CLI at that commit
// with --json, so exit class, verdict, row counts and the exact reason set are
// asserted end to end. The last case detaches HEAD at a poison commit while
// refs/heads/master names the clean commit, proving the default --at is the
// lane tip and not HEAD.
// ---------------------------------------------------------------------------

const MAP = MAP_PATH;
const FIXTURE_IDENT = ['-c', 'user.name=TabiFixture', '-c', 'user.email=tabi-fixture@example.invalid'];
const LONG_QUOTE = 'Tab does live browser and CDP page observation for the lane while kaidoku '
  + 'keeps CDP only as an REA provider surface for shipped artifacts and cites tabi';

function fixtureGit(dir, args) {
  const result = spawnSync('git', [...GIT_PREFIX, ...args], {
    cwd: dir,
    env: minimalEnv(),
    encoding: 'utf8',
    maxBuffer: MAX_BUFFER,
  });
  if (result.error || result.status !== 0) {
    const lines = String(result.stderr ?? '').split('\n').filter((line) => line.trim().length > 0);
    const fatal = lines.filter((line) => /^(fatal|error):/.test(line)).join(' | ');
    const tail = lines.slice(-2).join(' | ');
    throw new Error(`fixture git ${args.join(' ')} failed: cwd=${dir} status=${result.status} ` +
      `stdout=${JSON.stringify(String(result.stdout ?? '').slice(0, 120))} ` +
      `${result.error?.message ?? (fatal.length > 0 ? fatal : tail)}`);
  }
  return result.stdout.trim();
}

function initRepo(dir) {
  mkdirSync(dir, { recursive: true });
  fixtureGit(dir, ['init', '-q', '-b', 'master']);
}

// Write files, stage exactly those paths, commit. `author` overrides the
// fixture identity so the self-venue rule can be exercised (a line authored
// by `tabi-shokunin` is not a valid self ruling).
function commitFiles(dir, files, author = null) {
  for (const [rel, text] of Object.entries(files)) {
    const target = join(dir, rel);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, text);
  }
  const paths = Object.keys(files);
  const ident = author === null
    ? FIXTURE_IDENT
    : ['-c', `user.name=${author}`, '-c', 'user.email=tabi-fixture@example.invalid'];
  fixtureGit(dir, [...ident, 'add', '--', ...paths]);
  fixtureGit(dir, [...ident, 'commit', '-q', '--no-verify', '-m', 'fixture']);
  return fixtureGit(dir, ['rev-parse', 'HEAD']);
}

function commitRemoval(dir, rel) {
  fixtureGit(dir, [...FIXTURE_IDENT, 'rm', '-q', '--', rel]);
  fixtureGit(dir, [...FIXTURE_IDENT, 'commit', '-q', '--no-verify', '-m', 'fixture remove']);
  return fixtureGit(dir, ['rev-parse', 'HEAD']);
}

function makeMap(rows) {
  return `${COLUMNS.join('\t')}\n${rows.map((row) => row.join('\t')).join('\n')}\n`;
}

function runCli(cwd, args) {
  const result = spawnSync(process.execPath, [SCRIPT, ...args], {
    cwd,
    env: minimalEnv(),
    encoding: 'utf8',
    maxBuffer: MAX_BUFFER,
  });
  const record = { status: result.status, stdout: result.stdout ?? '', stderr: result.stderr ?? '', json: null };
  const trimmed = record.stdout.trim();
  if (trimmed.startsWith('{')) {
    try {
      record.json = JSON.parse(trimmed);
    } catch {
      record.json = null;
    }
  }
  return record;
}

function textReasons(stdout) {
  return stdout.split('\n')
    .map((line) => /^finding row=\S+ reason=(\S+)/.exec(line))
    .filter((match) => match !== null)
    .map((match) => match[1]);
}

function checkCase(name, record, expected) {
  const problems = [];
  if (record.status !== expected.exit) problems.push(`exit=${record.status} expected=${expected.exit}`);
  if (expected.exit === 2) {
    const observed = record.json
      ? record.json.findings.map((finding) => finding.reason)
      : textReasons(record.stdout);
    const wanted = expected.reasons;
    if (JSON.stringify([...observed].sort()) !== JSON.stringify([...wanted].sort())) {
      problems.push(`reasons=[${observed.join(',')}] expected=[${wanted.join(',')}]`);
    }
  } else {
    if (record.json === null) {
      problems.push('stdout is not one JSON object');
    } else {
      const observed = record.json.findings.map((finding) => finding.reason);
      if (JSON.stringify([...observed].sort()) !== JSON.stringify([...expected.reasons].sort())) {
        problems.push(`reasons=[${observed.join(',')}] expected=[${expected.reasons.join(',')}]`);
      }
      if (expected.rows !== undefined && record.json.rows !== expected.rows) {
        problems.push(`rows=${record.json.rows} expected=${expected.rows}`);
      }
      if (expected.verified !== undefined && record.json.verified !== expected.verified) {
        problems.push(`verified=${record.json.verified} expected=${expected.verified}`);
      }
      if (expected.at !== undefined && record.json.at !== expected.at) {
        problems.push(`at=${record.json.at} expected=${expected.at}`);
      }
      if (expected.selfRulings !== undefined
          && JSON.stringify(record.json.selfRulings) !== JSON.stringify(expected.selfRulings)) {
        problems.push(`selfRulings=${JSON.stringify(record.json.selfRulings)} expected=${JSON.stringify(expected.selfRulings)}`);
      }
    }
  }
  return { name, ok: problems.length === 0, message: problems.join('; '), reasons: expected.reasons, exit: expected.exit };
}

function selfTest() {
  const root = mkdtempSync(join(tmpdir(), 'tabi-adjacency-selftest-'));
  // A directory outside every repository, so `git rev-parse --show-toplevel`
  // cannot climb into the fixture fleet or the caller's checkout.
  const outside = mkdtempSync(join(tmpdir(), 'tabi-adjacency-norepo-'));
  let keep = true;
  try {
    const lane = join(root, 'tabi-shokunin');
    const sibling = join(root, 'kaidoku-shokunin');

    initRepo(root);
    initRepo(lane);
    initRepo(sibling);

    const siblingSha = commitFiles(sibling, {
      'PROVINCE.md': [
        '# kaidoku PROVINCE fixture',
        '',
        '| Runtime observation (CDP) | self-launched targets: chromium --headless --remote-debugging-port; list_browser_targets, inspect-web-page |',
        `${LONG_QUOTE} for browser-side mechanics.`,
        'WebMCP page tools remain observation-only for kaidoku: the fleet record scope is read, not invoked.',
        'A kaidoku crawler budget caps the fixture fetch rate per host.',
        '',
      ].join('\n'),
    });

    const fleetSha = commitFiles(root, {
      'decisions.md': 'ruling: tabi owns live browser and CDP page observation; '
        + 'kaidoku cites tabi for browser-side mechanics.\n'
        + `note: ${LONG_QUOTE}.\n`,
      '.ufo/l0-questions.md': [
        'protocol | round-16 | fleet fixture note that is not a tabi row',
        'tabi | round-17 | tabi fixture l0 row recording the kaidoku contested adjacency.',
        'tabi | round-5 | older tabi fixture row kept for the earlier-round acceptance.',
        '',
      ].join('\n'),
    });

    const laneBaseSha = commitFiles(lane, {
      'PROVINCE.md': [
        '# tabi PROVINCE fixture',
        'Tab does live browser and CDP page observation for its own reports.',
        'Adjacency fixture line for tabi quotes.',
        'Split declared: tabi keeps live browser observation, kake keeps crawler politeness.',
        `${LONG_QUOTE} for browser-side mechanics.`,
        '',
      ].join('\n'),
      'corpus/notes.md': 'placeholder\n',
    });

    // The self-venue spotcheck: the same file, first authored by the
    // integrator (positive) and then appended by this lane (negative).
    const SPOT = 'corpus/lessons/round-0-verifier-spotcheck.md';
    const spotLine = '**kaidoku** keeps CDP only as an REA provider surface for shipped artifacts.';
    const spotSha = commitFiles(lane, { [SPOT]: `${spotLine}\n` }, 'fleet-integrator');
    const spotBadSha = commitFiles(lane, { [SPOT]: `${spotLine}\nself note\n` }, 'tabi-shokunin');

    const cleanRuledFleet = [
      'kaidoku-cdp-page-observation',
      'kaidoku',
      `kaidoku-shokunin@${siblingSha}:PROVINCE.md:3`,
      'self-launched targets: chromium --headless --remote-debugging-port',
      'PROVINCE.md:2',
      'live browser and CDP page observation',
      'ruled',
      `fleet@${fleetSha}:decisions.md:1`,
      'kaidoku cites tabi for browser-side mechanics',
    ];
    const cleanRuledSibling = [
      'kaidoku-browser-mechanics-citation',
      'kaidoku',
      `kaidoku-shokunin@${siblingSha}:PROVINCE.md:4`,
      'cites tabi for browser-side mechanics',
      'PROVINCE.md:2',
      'Tab does live browser and CDP page observation',
      'ruled',
      `fleet@${fleetSha}:decisions.md:1`,
      'kaidoku cites tabi for browser-side mechanics',
    ];
    const cleanContested = [
      'cdp-scope-tabi-vs-kaidoku',
      'kaidoku',
      `kaidoku-shokunin@${siblingSha}:PROVINCE.md:5`,
      'WebMCP page tools remain observation-only for kaidoku',
      'PROVINCE.md:2',
      'Tab does live browser and CDP page observation',
      'contested-open',
      `fleet@${fleetSha}:.ufo/l0-questions.md:2`,
      'tabi fixture l0 row recording the kaidoku contested adjacency',
    ];
    const cleanSplit = [
      'crawler-politeness-split',
      'kaidoku',
      `kaidoku-shokunin@${siblingSha}:PROVINCE.md:6`,
      'kaidoku crawler budget caps the fixture fetch',
      'PROVINCE.md:4',
      'Split declared: tabi keeps live browser observation',
      'split-declared',
      '-',
      'kake keeps crawler politeness',
    ];
    const cleanRows = [cleanRuledFleet, cleanRuledSibling, cleanContested, cleanSplit];

    const cleanSha = commitFiles(lane, { [MAP]: makeMap(cleanRows) });

    const cases = [];
    const runMap = (name, rows, expected) => {
      const sha = commitFiles(lane, { [MAP]: makeMap(rows) });
      cases.push(checkCase(name, runCli(lane, ['--at', sha, '--fleet', root, '--json']), expected));
    };
    const row = (overrides) => {
      const next = [...cleanRuledFleet];
      for (const [index, value] of Object.entries(overrides)) next[Number(index)] = value;
      return next;
    };
    // A split-declared base is the least coupled row: it has no ruling venue
    // and no sibling-name coupling, so a broken sibling column produces only
    // the sibling finding under test.
    const splitRow = (overrides) => {
      const next = [...cleanSplit];
      for (const [index, value] of Object.entries(overrides)) next[Number(index)] = value;
      return next;
    };

    // Positive coverage: every disposition and the fleet ruling venue. The
    // clean map is already committed as cleanSha; reuse it (a second commit of
    // identical bytes is a no-op git refuses).
    cases.push(checkCase('clean', runCli(lane, ['--at', cleanSha, '--fleet', root, '--json']),
      { exit: 0, reasons: [], rows: 4, verified: 4 }));
    // Commit-graph: a garbage commit-graph file in the sibling must be ignored
    // (core.commitGraph=false in GIT_PREFIX); without it, forged ancestry could
    // pass the reachability guard (SentinelAnchorAfter B1).
    mkdirSync(join(sibling, '.git', 'objects', 'info'), { recursive: true });
    writeFileSync(join(sibling, '.git', 'objects', 'info', 'commit-graph'), Buffer.from('not a graph\n'));
    cases.push(checkCase('commit-graph-ignored',
      runCli(lane, ['--at', cleanSha, '--fleet', root, '--json']),
      { exit: 0, reasons: [], rows: 4, verified: 4 }));

    // Positive self-venue: a spotcheck line authored by the integrator.
    const selfVenueRow = [
      'self-venue-cdp',
      'kaidoku',
      `kaidoku-shokunin@${siblingSha}:PROVINCE.md:3`,
      'self-launched targets: chromium --headless --remote-debugging-port',
      'PROVINCE.md:2',
      'live browser and CDP page observation',
      'ruled',
      `tabi-shokunin@${spotSha}:${SPOT}:1`,
      '**kaidoku** keeps CDP only as an REA provider surface',
    ];
    runMap('self-venue-ruling', [selfVenueRow],
      { exit: 0, reasons: [], rows: 1, verified: 1, selfRulings: [2] });

    // column_count: drop the last column.
    const short = [...cleanRuledFleet];
    short.pop();
    runMap('column-count', [short], { exit: 1, reasons: [REASON.columnCount] });
    runMap('surface-empty', [row({ 0: '' })], { exit: 1, reasons: [REASON.surfaceEmpty] });
    // field_control_char: a zero-width space inside sibling_quote. The other
    // quote checks are suppressed for that row, so only the control finding
    // fires.
    runMap('field-control-char',
      [row({ 3: `self-launched targets: chromium ​--headless` })],
      { exit: 1, reasons: [REASON.fieldControlChar] });
    // quote_too_short: one word.
    runMap('quote-too-short', [row({ 3: 'CDP' })],
      { exit: 1, reasons: [REASON.quoteTooShort] });
    // surface_charset: a Greek omicron (U+03BF) is a homoglyph, not a surface.
    runMap('surface-charset', [row({ 0: 'cdp-runtime-observatiοn' })],
      { exit: 1, reasons: [REASON.surfaceCharset] });
    runMap('sibling-ref-invalid-syntax',
      [row({ 2: `kaidoku-shokunin@${siblingSha.slice(0, 12)}:PROVINCE.md:3` })],
      { exit: 1, reasons: [REASON.siblingRefInvalid] });
    runMap('sibling-ref-invalid-lane', [splitRow({ 1: 'kagi' })],
      { exit: 1, reasons: [REASON.siblingRefInvalid] });
    // strict equality: the sibling column must be the bare lane token, not a
    // -shokunin repo name and not a list.
    runMap('sibling-suffix-mismatch', [splitRow({ 1: 'kaidoku-shokunin' })],
      { exit: 1, reasons: [REASON.siblingRefInvalid] });
    runMap('sibling-list', [splitRow({ 1: 'kagi/kaidoku' })],
      { exit: 1, reasons: [REASON.siblingRefInvalid] });
    runMap('own-lane-sibling',
      [row({ 1: 'tabi', 2: `tabi-shokunin@${cleanSha}:PROVINCE.md:2` })],
      { exit: 1, reasons: [REASON.siblingRefInvalid] });
    runMap('sibling-unresolved-commit',
      [row({ 2: `kaidoku-shokunin@${'0'.repeat(40)}:PROVINCE.md:3` })],
      { exit: 1, reasons: [REASON.siblingUnresolved] });
    runMap('sibling-unresolved-path',
      [row({ 2: `kaidoku-shokunin@${siblingSha}:NOPE.md:3` })],
      { exit: 1, reasons: [REASON.siblingUnresolved] });
    runMap('sibling-unresolved-line',
      [row({ 2: `kaidoku-shokunin@${siblingSha}:PROVINCE.md:99` })],
      { exit: 1, reasons: [REASON.siblingUnresolved] });
    runMap('sibling-unresolved-repo',
      [splitRow({ 1: 'ghost', 2: `ghost-shokunin@${'0'.repeat(40)}:PROVINCE.md:3` })],
      { exit: 1, reasons: [REASON.siblingUnresolved] });
    // A sibling directory that exists but is not a git toplevel.
    mkdirSync(join(root, 'plain-shokunin'), { recursive: true });
    runMap('sibling-unresolved-notgit',
      [splitRow({ 1: 'plain', 2: `plain-shokunin@${'0'.repeat(40)}:PROVINCE.md:3` })],
      { exit: 1, reasons: [REASON.siblingUnresolved] });
    // A sibling repo that is a symlink is not a real lane directory.
    const sibLink = join(root, 'link-shokunin');
    symlinkSync(join(root, 'kaidoku-shokunin'), sibLink);
    runMap('sibling-unresolved-symlink',
      [splitRow({ 1: 'link', 2: `link-shokunin@${siblingSha}:PROVINCE.md:3` })],
      { exit: 1, reasons: [REASON.siblingUnresolved] });
    // A commit that exists but is not reachable from the sibling lane tip.
    const beforeSha = fixtureGit(sibling, ['rev-parse', 'HEAD']);
    const unreachableSha = commitFiles(sibling, { 'UNREACHABLE.md': 'dangling\n' });
    fixtureGit(sibling, ['update-ref', 'refs/heads/master', beforeSha]);
    runMap('sibling-unresolved-unreachable',
      [row({ 2: `kaidoku-shokunin@${unreachableSha}:UNREACHABLE.md:1` })],
      { exit: 1, reasons: [REASON.siblingUnresolved] });
    // A sibling pin under .ufo/ is wave scratch, not a province-level claim.
    runMap('sibling-ref-under-ufo',
      [splitRow({ 2: `kaidoku-shokunin@${siblingSha}:.ufo/waves/x.md:1` })],
      { exit: 1, reasons: [REASON.siblingRefInvalid] });
    runMap('sibling-quote-absent', [row({ 3: 'not present on this fixture line' })],
      { exit: 1, reasons: [REASON.siblingQuoteAbsent] });
    runMap('tabi-ref-invalid-path', [row({ 4: '../PROVINCE.md:2' })],
      { exit: 1, reasons: [REASON.tabiRefInvalid] });
    runMap('tabi-ref-invalid-noline', [row({ 4: 'PROVINCE.md' })],
      { exit: 1, reasons: [REASON.tabiRefInvalid] });
    runMap('tabi-ref-self-citation', [row({ 4: `${MAP_PATH}:1` })],
      { exit: 1, reasons: [REASON.tabiRefInvalid] });
    runMap('tabi-ref-wave-citation', [row({ 4: '.ufo/waves/round-17/w1/x.md:1' })],
      { exit: 1, reasons: [REASON.tabiRefInvalid] });
    runMap('tabi-unresolved', [row({ 4: 'PROVINCE-absent.md:2' })],
      { exit: 1, reasons: [REASON.tabiUnresolved] });
    runMap('tabi-unresolved-line', [row({ 4: 'PROVINCE.md:99' })],
      { exit: 1, reasons: [REASON.tabiUnresolved] });
    runMap('tabi-quote-absent', [row({ 5: 'absent tabi fixture phrase' })],
      { exit: 1, reasons: [REASON.tabiQuoteAbsent] });
    runMap('disposition-unknown', [row({ 6: 'absorbed' })],
      { exit: 1, reasons: [REASON.dispositionUnknown] });
    runMap('ruling-ref-invalid-syntax', [row({ 7: 'fleet:decisions.md:1' })],
      { exit: 1, reasons: [REASON.rulingRefInvalid] });
    runMap('ruling-ref-invalid-split',
      [[...cleanSplit.slice(0, 7), `fleet@${fleetSha}:decisions.md:1`, '-']],
      { exit: 1, reasons: [REASON.rulingRefInvalid] });
    // A ruled venue that is a sibling repo is not an allowed venue.
    runMap('ruling-venue-sibling',
      [row({ 7: `kaidoku-shokunin@${siblingSha}:PROVINCE.md:3` })],
      { exit: 1, reasons: [REASON.rulingRefInvalid] });
    // A self-venue path that is not a spotcheck lesson.
    runMap('ruling-venue-self-notspotcheck',
      [row({ 7: `tabi-shokunin@${laneBaseSha}:PROVINCE.md:2` })],
      { exit: 1, reasons: [REASON.rulingRefInvalid] });
    // A self-venue spotcheck line authored by this lane.
    runMap('ruling-venue-self-author',
      [row({ 7: `tabi-shokunin@${spotBadSha}:${SPOT}:1` })],
      { exit: 1, reasons: [REASON.rulingRefInvalid] });
    // A ruled fleet path under .ufo/ is a question ledger or wave scratch,
    // not a ruling venue (Forge S3).
    runMap('ruling-venue-l0-question',
      [row({ 7: `fleet@${fleetSha}:.ufo/l0-questions.md:2` })],
      { exit: 1, reasons: [REASON.rulingRefInvalid] });
    runMap('ruling-venue-ufo',
      [row({ 7: `fleet@${fleetSha}:.ufo/waves/round-17/x.md:1` })],
      { exit: 1, reasons: [REASON.rulingRefInvalid] });
    runMap('ruling-unresolved',
      [row({ 7: `fleet@${'0'.repeat(40)}:decisions.md:1` })],
      { exit: 1, reasons: [REASON.rulingUnresolved] });
    runMap('ruling-quote-absent', [row({ 8: 'absent ruling fixture phrase' })],
      { exit: 1, reasons: [REASON.rulingQuoteAbsent] });
    // A ruled ruling_quote that does not name the sibling lane.
    runMap('ruling-quote-no-sibling',
      [row({ 8: 'tabi owns live browser and CDP page observation' })],
      { exit: 1, reasons: [REASON.rulingQuoteAbsent] });
    runMap('l0-line-absent-not-tabi',
      [[...cleanContested.slice(0, 7), `fleet@${fleetSha}:.ufo/l0-questions.md:1`,
        'fleet fixture note that is not a tabi row']],
      { exit: 1, reasons: [REASON.l0LineAbsent] });
    runMap('l0-line-absent-eof',
      [[...cleanContested.slice(0, 7), `fleet@${fleetSha}:.ufo/l0-questions.md:99`,
        'tabi fixture l0 row recording the kaidoku contested adjacency']],
      { exit: 1, reasons: [REASON.l0LineAbsent] });
    // The l0 row is a tabi row but does not name the sibling lane.
    runMap('l0-line-no-sibling',
      [[...cleanContested.slice(0, 7), `fleet@${fleetSha}:.ufo/l0-questions.md:3`,
        'older tabi fixture row kept for the earlier']],
      { exit: 1, reasons: [REASON.l0LineAbsent] });
    runMap('quote-too-long-sibling',
      [row({ 2: `kaidoku-shokunin@${siblingSha}:PROVINCE.md:4`, 3: LONG_QUOTE })],
      { exit: 1, reasons: [REASON.quoteTooLong] });
    runMap('quote-too-long-tabi', [row({ 4: 'PROVINCE.md:5', 5: LONG_QUOTE })],
      { exit: 1, reasons: [REASON.quoteTooLong] });
    runMap('quote-too-long-ruling',
      [[...cleanRuledFleet.slice(0, 7), `fleet@${fleetSha}:decisions.md:2`, LONG_QUOTE]],
      { exit: 1, reasons: [REASON.quoteTooLong] });
    // duplicate_row: same folded surface + sibling.
    runMap('duplicate-row', [cleanRuledFleet,
      [...cleanRuledFleet.slice(0, 2),
        `kaidoku-shokunin@${siblingSha}:PROVINCE.md:5`,
        'WebMCP page tools remain observation-only for kaidoku',
        ...cleanRuledFleet.slice(4)]],
      { exit: 1, reasons: [REASON.duplicateRow], rows: 2, verified: 1 });
    // One sibling pin is cited once, even under a different surface name
    // (Forge S1): a second row naming kaidoku PROVINCE.md:3 is duplicate_row.
    runMap('duplicate-sibling-pin', [cleanRuledFleet, row({ 0: 'cdp-runtime-observation-again' })],
      { exit: 1, reasons: [REASON.duplicateRow], rows: 2, verified: 1 });

    // Schema and unreadable classes (exit 2).
    const badHeaderSha = commitFiles(lane, { [MAP]: `${COLUMNS.slice(1).join('\t')}\n` });
    cases.push(checkCase('map-header-invalid',
      runCli(lane, ['--at', badHeaderSha, '--fleet', root, '--json']),
      { exit: 2, reasons: [FAILURE_REASON.mapSchemaInvalid] }));
    const headerOnlySha = commitFiles(lane, { [MAP]: `${COLUMNS.join('\t')}\n` });
    cases.push(checkCase('map-header-only',
      runCli(lane, ['--at', headerOnlySha, '--fleet', root, '--json']),
      { exit: 2, reasons: [FAILURE_REASON.mapSchemaInvalid] }));
    const noMapSha = commitRemoval(lane, MAP);
    cases.push(checkCase('map-unreadable',
      runCli(lane, ['--at', noMapSha, '--fleet', root, '--json']),
      { exit: 2, reasons: [FAILURE_REASON.mapUnreadable] }));

    const usageRecord = runCli(lane, ['--at']);
    cases.push(checkCase('usage', usageRecord, { exit: 2, reasons: [FAILURE_REASON.usage] }));
    const headRecord = runCli(lane, ['--at', 'HEAD', '--fleet', root, '--json']);
    cases.push(checkCase('at-head-refused', headRecord,
      { exit: 2, reasons: [FAILURE_REASON.revisionUnresolved] }));

    const plainDir = outside;
    const notRepoRecord = runCli(root, ['--repo', plainDir, '--fleet', root, '--json']);
    cases.push(checkCase('git-failed', notRepoRecord, { exit: 2, reasons: [FAILURE_REASON.gitFailed] }));

    // Lane-tip anchoring: HEAD is detached at a poison commit while
    // refs/heads/master names the clean commit. The default run must read the
    // branch tip; an explicit --at at the poison commit must go red.
    const poisonSha = commitFiles(lane, { [MAP]: makeMap([row({ 6: 'absorbed' })]) });
    fixtureGit(lane, ['update-ref', 'refs/heads/master', cleanSha]);
    fixtureGit(lane, ['checkout', '-q', '--detach', poisonSha]);
    const tipRecord = runCli(lane, ['--fleet', root, '--json']);
    cases.push(checkCase('lane-tip-default', tipRecord,
      { exit: 0, reasons: [], rows: 4, verified: 4, at: cleanSha }));
    const poisonRecord = runCli(lane, ['--at', poisonSha, '--fleet', root, '--json']);
    cases.push(checkCase('lane-tip-poison-explicit', poisonRecord,
      { exit: 1, reasons: [REASON.dispositionUnknown] }));

    // lane_tip_unresolved: detached HEAD with no refs/heads/master.
    const orphan = join(root, 'orphan-shokunin');
    initRepo(orphan);
    commitFiles(orphan, { 'README.md': 'orphan\n' });
    fixtureGit(orphan, ['checkout', '-q', '--detach', 'HEAD']);
    fixtureGit(orphan, ['update-ref', '-d', 'refs/heads/master']);
    cases.push(checkCase('lane-tip-unresolved',
      runCli(orphan, ['--repo', orphan, '--fleet', root, '--json']),
      { exit: 2, reasons: [FAILURE_REASON.laneTipUnresolved] }));

    for (const testCase of cases) {
      const suffix = testCase.ok ? '' : ` detail=${testCase.message}`;
      console.log(`case ${testCase.name} verdict=${testCase.ok ? 'pass' : 'fail'}${suffix}`);
    }

    const covered = new Set(cases.filter((testCase) => testCase.ok && testCase.exit !== 2)
      .flatMap((testCase) => testCase.reasons));
    const missing = FINDING_REASONS.filter((reason) => !covered.has(reason));
    if (missing.length > 0) {
      console.log(`case vocabulary verdict=fail missing=${missing.join(',')}`);
    }
    const coveredExit2 = new Set(cases.filter((testCase) => testCase.ok && testCase.exit === 2)
      .flatMap((testCase) => testCase.reasons));
    const ok = cases.every((testCase) => testCase.ok) && missing.length === 0
      && coveredExit2.size === COULD_NOT_EVALUATE_REASONS.length;
    console.log(`ADJACENCY_SELFTEST verdict=${ok ? 'clean' : 'failed'} cases=${cases.length} `
      + `reasons=${covered.size} could_not_evaluate=${coveredExit2.size}`);
    if (!ok) process.stderr.write(`fixture retained: ${root}\n`);
    keep = !ok;
    return ok ? EXIT.clean : EXIT.findings;
  } finally {
    rmSync(outside, { recursive: true, force: true });
    if (!keep) rmSync(root, { recursive: true, force: true });
  }
}

function main() {
  let options;
  try {
    options = parseArguments(process.argv.slice(2));
  } catch (error) {
    const findings = [{ row: null, reason: FAILURE_REASON.usage, detail: cleanDetail(error.message) }];
    emitResult({
      mode: null, repo: null, fleet: null, atRev: null, verdict: 'could_not_evaluate',
      rows: 0, verified: 0, findings, selfRulings: [], tips: {}, json: process.argv.includes('--json'),
    });
    process.stderr.write(`${usage()}\n`);
    return EXIT.couldNotEvaluate;
  }
  if (options.help) {
    console.log(usage());
    return EXIT.clean;
  }

  if (options.mode === 'reasons') {
    console.log(JSON.stringify({
      schema: REASONS_SCHEMA,
      findings: FINDING_REASONS,
      couldNotEvaluate: COULD_NOT_EVALUATE_REASONS,
    }));
    return EXIT.clean;
  }

  if (options.mode === 'self-test') return selfTest();

  let repo = null;
  let fleet = null;
  let atRev = null;
  try {
    repo = resolveRepo(options.repo);
    fleet = resolveFleet(options.fleet, repo);
    const laneTip = options.at === null
      ? resolveLaneTip(repo, LANE_TIP_FALLBACKS, 'lane tip')
      : null;
    atRev = laneTip === null ? resolveAt(repo, options.at) : laneTip.commit;
    const text = readMapAt(repo, atRev);
    const evaluated = evaluateMap({ lane: repo, fleet, atRev, text });
    const verdict = evaluated.findings.length === 0 ? 'clean' : 'failed';
    const tips = {};
    if (laneTip !== null) tips.lane = laneTip.ref;
    for (const [dir, tip] of tipCache) {
      if (tip.ok) tips[dir] = tip.ref;
    }
    emitResult({
      mode: 'check', repo, fleet, atRev, verdict,
      rows: evaluated.rows, verified: evaluated.verified,
      findings: evaluated.findings, selfRulings: evaluated.selfRulings, tips, json: options.json,
    });
    return evaluated.findings.length === 0 ? EXIT.clean : EXIT.findings;
  } catch (error) {
    if (error instanceof CouldNotEvaluate) {
      emitCouldNotEvaluate({
        mode: 'check', repo: repo ?? options.repo ?? process.cwd(),
        fleet: fleet ?? options.fleet ?? null, atRev, error, json: options.json,
      });
      return EXIT.couldNotEvaluate;
    }
    throw error;
  }
}

let exitCode;
try {
  exitCode = main();
} catch (error) {
  const detail = cleanDetail(error?.message ?? error);
  emitText('could_not_evaluate', 0, 0, [
    { row: null, reason: FAILURE_REASON.gitFailed, detail: `unexpected: ${detail}` },
  ]);
  exitCode = EXIT.couldNotEvaluate;
}
process.exitCode = exitCode;
