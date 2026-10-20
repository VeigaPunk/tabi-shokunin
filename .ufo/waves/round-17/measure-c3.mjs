#!/usr/bin/env node
// C3 counter — verified adjacency dispositions (tabi round 17).
//
// Reads corpus/adjacency.tsv at a revision through `git cat-file blob` and
// re-verifies every row ITSELF, trusting neither the worktree nor
// scripts/check-adjacency.mjs:
//
//   sibling_quote  verbatim substring of <line> of
//                  `git -C <fleet>/<lane>-shokunin cat-file blob <commit>:<path>`
//                  (plus the ≤25-word cap from PLAN §C3)
//   tabi_quote     verbatim substring of the tabi file at the evaluated rev
//                  (an optional trailing `:<line>` narrows it to that line)
//   ruling_quote   verbatim substring of the pinned ruling line at its commit;
//                  disposition `contested-open` additionally requires the line
//                  to be fleet `.ufo/l0-questions.md` and to match
//                  `tabi | round-<N> |`
//   split/refused  ruling_ref `-` and the ruling_quote present in the tabi file
//
// Inputs the map may not forge (SentinelAnchor F7-F12):
//   * every cited sibling/ruling quote passes the ≤25-word cap and a ≥3-word /
//     ≥15-non-space-character floor; no C0/C1 control or invisible/bidi
//     character is admitted in any field;
//   * `sibling` must list exactly the lane named in `sibling_ref`, and this
//     lane's own token is never a sibling or ruler;
//   * a cited sibling/fleet commit must be reachable from that repo's own
//     branch tip (attached branch, else refs/heads/master, else
//     refs/heads/main) — never merely present as an object, which is the
//     forged-pin shape; a self-ruling must be committed at the evaluated rev;
//   * `tabi_ref`/ruling paths may not be the map itself or wave scratch under
//     `.ufo/waves/` (self-citation);
//   * repo directories must be real, non-symlink git toplevels whose git dir
//     is exactly `<dir>/.git`, with Git discovery ceilinged at the fleet;
//   * duplicate identity is case/space-folded surface+sibling, and one cited
//     sibling line counts once.
//
// Usage:
//   node .ufo/waves/round-17/measure-c3.mjs [REV] [--repo DIR] [--fleet-root DIR]
//
// REV defaults to the lane tip (symbolic ref when attached, else
// refs/heads/master) — never the literal `HEAD`, so a jj-colocated checkout
// cannot certify bytes that are on no branch. --repo defaults to the lane
// containing this script; --fleet-root defaults to --repo's parent and holds
// the sibling `<lane>-shokunin` repos and the fleet repo.
//
// Stdout is exactly one JSON line:
//   {"c3_adjacency_verified":N,"rows":[...],"probes":{...}}
// plus `by_disposition` counts of verified rows per disposition (L1 steer).
// Exit 0 evaluated (any N), 2 could not evaluate (usage, unresolved REV,
// unreadable repo, malformed header). Probes (QUALITY 25) run the checker blob
// materialised from REV in a throwaway sandbox clone: the probe base — header
// plus the counter-verified rows — must reach exit 0, and each of seven
// counter-built mutations of that base (committed in the sandbox so worktree
// readers and blob readers both observe them) must drop the verified count
// and reach checker exit 1 (`probes.checker.mutations`).
//
// Every child is spawned with an argv array under a minimal environment (no
// shell); Git is pinned against replace/graft/fsmonitor and pathspec magic.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const DEFAULT_LANE_ROOT = resolvePath(SCRIPT_DIR, '..', '..', '..');

const TSV_PATH = 'corpus/adjacency.tsv';
const CHECKER_PATH = 'scripts/check-adjacency.mjs';
const COLUMNS = Object.freeze(['surface', 'sibling', 'sibling_ref', 'sibling_quote',
  'tabi_ref', 'tabi_quote', 'disposition', 'ruling_ref', 'ruling_quote']);
const DISPOSITIONS = Object.freeze(['ruled', 'contested-open', 'split-declared', 'refused-route']);
const MAX_QUOTE_WORDS = 25;
const L0_PATH = '.ufo/l0-questions.md';
const MAX_BUFFER = 64 * 1024 * 1024;
const CHECKER_TIMEOUT_MS = 180000;
const DETAIL_MAX = 200;

const EXIT = Object.freeze({ evaluated: 0, couldNotEvaluate: 2 });

const HEX40 = /^[0-9a-f]{40}$/;
const PATH_CHARS = /^[A-Za-z0-9._/-]+$/;
const LANE_TOKEN = /^[a-z0-9][a-z0-9-]*$/;
const SIBLING_REF_RE = /^([a-z0-9][a-z0-9-]*)-shokunin@([0-9a-f]{40}):(.+):([1-9][0-9]*)$/;
const RULING_REF_RE = /^(fleet|[a-z0-9][a-z0-9-]*-shokunin)@([0-9a-f]{40}):(.+):([1-9][0-9]*)$/;
const TABI_REF_RE = /^([^:]+)(?::([1-9][0-9]*))?$/;
const L0_TABI_ROW = /^tabi[ \t]*\|[ \t]*round-[0-9]+[ \t]*\|/;
const HEAD_RELATIVE = /^(?:HEAD|head|@)/;
const HEAD_REF = /^refs\/heads\/[A-Za-z0-9._/-]+$/;
const CONTROL_CHARS = /[\u0000-\u001f\u007f-\u009f]/;
const INVISIBLE_CHARS = /[\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/;
const QUOTE_FLOOR_WORDS = 4;
const QUOTE_FLOOR_CHARS = 20;

// Closed row-finding vocabulary: the checker's names, plus the guards this
// counter adds on top of the checker contract (SentinelAnchor F10, L1 steer)
// — a quote floor, a control/invisible-character ban, a sibling-name equality,
// a `ruled` venue rule, and a sibling-naming rule.
const REASON = Object.freeze({
  columnCount: 'column_count',
  surfaceEmpty: 'surface_empty',
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
  rulingVenue: 'ruling_venue',
  rulingUnnamed: 'ruling_unnamed',
  l0LineAbsent: 'l0_line_absent',
  quoteTooLong: 'quote_too_long',
  quoteTooShort: 'quote_too_short',
  fieldInvisible: 'field_invisible',
  duplicateRow: 'duplicate_row',
});

class CouldNotEvaluate extends Error {
  constructor(reason, detail) {
    super(detail);
    this.reason = reason;
  }
}

function refuse(reason, detail) {
  throw new CouldNotEvaluate(reason, clean(detail));
}

function clean(value) {
  const text = String(value ?? '').replace(/[\0-\x20\x7f]+/g, ' ').trim();
  return text.length > DETAIL_MAX ? `${text.slice(0, DETAIL_MAX)}...` : text;
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

// Git must not discover a repository above the fleet directory (the lane is
// nested inside the fleet repo), so discovery is ceilinged there.
let ceilingDir = null;

// Minimal child environment: repo config/hooks/replace/graft/lazy-fetch and
// pathspec magic cannot alter what the counter or the checker observes.
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
  if (ceilingDir !== null) env.GIT_CEILING_DIRECTORIES = ceilingDir;
  // Relative PATH entries would resolve `git` inside a measured repo.
  if (process.env.PATH !== undefined) {
    env.PATH = process.env.PATH.split(':').filter((entry) => entry.startsWith('/')).join(':');
  }
  if (process.env.HOME !== undefined) env.HOME = process.env.HOME;
  return env;
}

// Fixed global config on every invocation: no fsmonitor hook, no path quoting.
const GIT_PREFIX = ['-c', 'core.fsmonitor=false', '-c', 'core.quotepath=false'];

function git(repo, args, binary = false) {
  try {
    return spawnSync('git', [...GIT_PREFIX, ...args], {
      cwd: repo,
      env: minimalEnv(),
      encoding: binary ? undefined : 'utf8',
      maxBuffer: MAX_BUFFER,
    });
  } catch (error) {
    return { error, status: null, stdout: binary ? Buffer.alloc(0) : '', stderr: '' };
  }
}

function gitError(args, result) {
  const stderr = result.stderr ? String(result.stderr).slice(0, 160) : '';
  return `git ${args.join(' ')} failed (status=${result.status ?? 'spawn'})${stderr ? ` stderr=${clean(stderr)}` : ''}`;
}

function resolveCommit(repo, rev, label) {
  const text = String(rev);
  if (text.length === 0 || text.startsWith('-') || text.includes('\0') || /\s/.test(text)) {
    refuse('revision_unresolved', `${label} ${clean(text)} is not a revision token`);
  }
  // jj-colocated lanes detach HEAD, so a HEAD-anchored count can certify bytes
  // that are on no branch. Callers pass the lane tip or an explicit commit.
  if (HEAD_RELATIVE.test(text)) {
    refuse('revision_unresolved', `${label} ${clean(text)} is HEAD-relative; pass the lane tip or a commit`);
  }
  const result = git(repo, ['rev-parse', '--verify', '--end-of-options', `${text}^{commit}`]);
  if (result.error || result.status !== 0) {
    refuse('revision_unresolved', `${label} ${clean(text)} does not resolve to a commit`);
  }
  return result.stdout.trim();
}

// Lane tip (PLAN §C1 semantics): attached HEAD resolves through its own branch;
// detached HEAD resolves refs/heads/master. Never the literal token `HEAD`, and
// never a silent fallback when symbolic-ref fails for a reason other than
// "detached" (SentinelAnchor F4).
function laneTip(repo) {
  const sym = git(repo, ['symbolic-ref', '-q', 'HEAD']);
  if (sym.error || (sym.status !== 0 && sym.status !== 1)) {
    refuse('git_failed', gitError(['symbolic-ref', '-q', 'HEAD'], sym));
  }
  let anchor = 'refs/heads/master';
  if (sym.status === 0) {
    anchor = String(sym.stdout).trim();
    if (!HEAD_REF.test(anchor)) {
      refuse('lane_tip_unresolved', `lane tip HEAD names ${clean(anchor)}, not a refs/heads/ branch`);
    }
  }
  return resolveCommit(repo, anchor, `lane tip ${anchor}`);
}

// Branch tip of a sibling or ruling repo, for the reachability guard
// (SentinelAnchor F7): attached HEAD must be a refs/heads/ name; a detached
// repo falls back to refs/heads/master, then refs/heads/main (kaidoku and
// revenger publish on main). Only a branch tip counts — a commit reachable
// from no branch is exactly the forged-pin shape the guard rejects.
function siblingTip(repo) {
  // master -> main ladder; the attached branch is only a fallback (L1 steer).
  const sym = git(repo, ['symbolic-ref', '-q', 'HEAD']);
  if (sym.error || (sym.status !== 0 && sym.status !== 1)) {
    refuse('git_failed', gitError(['symbolic-ref', '-q', 'HEAD'], sym));
  }
  const attached = sym.status === 0 ? String(sym.stdout).trim() : null;
  const candidates = ['refs/heads/master', 'refs/heads/main'];
  if (attached !== null && !candidates.includes(attached)) candidates.push(attached);
  for (const ref of candidates) {
    if (!HEAD_REF.test(ref)) {
      refuse('lane_tip_unresolved', `${repo}: HEAD names ${clean(ref)}, not a refs/heads/ branch`);
    }
    const resolved = git(repo, ['rev-parse', '--verify', '--end-of-options', `${ref}^{commit}`]);
    if (!resolved.error && resolved.status === 0) return resolved.stdout.trim();
  }
  refuse('lane_tip_unresolved', `${repo}: no refs/heads/master or refs/heads/main tip`);
}

const ancestorCache = new Map();

function isAncestorOrEqual(repo, commit, tip) {
  const key = `${repo}\0${commit}\0${tip}`;
  if (ancestorCache.has(key)) return ancestorCache.get(key);
  const result = git(repo, ['merge-base', '--is-ancestor', commit, tip]);
  if (result.error || (result.status !== 0 && result.status !== 1)) {
    refuse('git_failed', gitError(['merge-base', '--is-ancestor', commit, tip], result));
  }
  const value = result.status === 0;
  ancestorCache.set(key, value);
  return value;
}

// Row-level guards stay row findings: a sibling repo whose branch tip cannot
// resolve marks that row unresolved instead of aborting the whole count.
function siblingTipOrNull(repo) {
  try {
    return siblingTip(repo);
  } catch {
    return null;
  }
}

function reachesBranchTip(repo, commit, tip) {
  if (tip === null) return false;
  try {
    return isAncestorOrEqual(repo, commit, tip);
  } catch {
    return false;
  }
}

function isAncestorOfEval(repo, commit, rev) {
  try {
    return isAncestorOrEqual(repo, commit, rev);
  } catch {
    return false;
  }
}

// A self-venue ruling is credible only when an author other than this lane last
// touched the spot-check file at the pinned commit, the pinned commit is in
// this lane's history at or below the evaluated revision, and the cited line is
// byte-identical at the evaluated revision. This mirrors the checker's
// selfRulings admission rather than refusing every self-venue row.
function checkSelfVenue(ctx, ruling, dir) {
  const author = lastAuthor(dir, ruling.commit, ruling.path);
  if (author === null || author === `${ctx.ownToken}-shokunin`) return false;
  if (!commitAt(ctx, ctx.laneRepo, ruling.commit)) return false;
  if (!isAncestorOfEval(ctx.laneRepo, ruling.commit, ctx.rev)) return false;
  const pinnedBlob = blobAt(ctx, dir, ruling.commit, ruling.path);
  const pinnedLine = pinnedBlob.ok ? lineAt(pinnedBlob.text, ruling.line) : null;
  const atEvalBlob = blobAt(ctx, ctx.laneRepo, ctx.rev, ruling.path);
  const atEvalLine = atEvalBlob.ok ? lineAt(atEvalBlob.text, ruling.line) : null;
  if (pinnedLine === null || atEvalLine === null) return false;
  return pinnedLine === atEvalLine;
}

// A directory is a usable repo only when it is itself a real (non-symlink)
// directory whose git dir is exactly <.git> (SentinelAnchor F12): a plain
// subdirectory, a symlink, or a `.git` gitfile pointing elsewhere must not
// impersonate a lane.
const repoIdentityCache = new Map();

function repoIdentity(dir) {
  if (repoIdentityCache.has(dir)) return repoIdentityCache.get(dir);
  let identity = null;
  try {
    const stat = lstatSync(dir);
    if (stat.isDirectory() && !stat.isSymbolicLink()) {
      const real = realpathSync(dir);
      const result = git(dir, ['rev-parse', '--absolute-git-dir']);
      if (!result.error && result.status === 0) {
        const gitDir = realpathSync(String(result.stdout).trim());
        if (gitDir === join(real, '.git')) identity = real;
      }
    }
  } catch {
    identity = null;
  }
  repoIdentityCache.set(dir, identity);
  return identity;
}

function isCleanRepoPath(path) {
  if (typeof path !== 'string' || path.length === 0 || path.length > 512) return false;
  if (path.includes('\0') || path.includes('\\')) return false;
  if (!PATH_CHARS.test(path)) return false;
  const body = path.endsWith('/') ? path.slice(0, -1) : path;
  if (body.length === 0) return false;
  return body.split('/').every((segment) => segment.length > 0 && segment !== '.'
    && segment !== '..' && !segment.startsWith('-'));
}

function treeEntry(repo, rev, path) {
  const result = git(repo, ['ls-tree', '-z', rev, '--', path]);
  if (result.error) refuse('git_failed', gitError(['ls-tree', rev, path], result));
  if (result.status !== 0) return null;
  const rows = String(result.stdout).split('\0').filter((row) => row.length > 0);
  if (rows.length === 0) return null;
  const match = /^([0-7]{6}) (\S+) ([0-9a-f]{40})\t(.*)$/.exec(rows[0]);
  if (!match) refuse('git_failed', `git ls-tree ${rev} ${path}: malformed row`);
  return { mode: match[1], type: match[2], oid: match[3] };
}

// Regular-file blob at <rev>:<path>, cached per (repo, rev, path). Symlinks and
// submodules are refused: evidence must be a committed regular file.
function blobAt(ctx, repo, rev, path) {
  const key = `${repo}\0${rev}\0${path}`;
  if (ctx.blobs.has(key)) return ctx.blobs.get(key);
  let value;
  if (!isCleanRepoPath(path)) {
    value = { ok: false, reason: 'path_invalid' };
  } else {
    const entry = treeEntry(repo, rev, path);
    if (entry === null) {
      value = { ok: false, reason: 'absent' };
    } else if (entry.type !== 'blob' || (entry.mode !== '100644' && entry.mode !== '100755')) {
      value = { ok: false, reason: `mode ${entry.mode} ${entry.type}` };
    } else {
      const result = git(repo, ['cat-file', 'blob', `${rev}:${path}`], true);
      if (result.error || result.status !== 0) {
        refuse('git_failed', gitError(['cat-file', 'blob', `${rev}:${path}`], result));
      }
      value = { ok: true, bytes: result.stdout, text: result.stdout.toString('utf8'), oid: entry.oid };
    }
  }
  ctx.blobs.set(key, value);
  return value;
}

// The last commit that touched <path> at or before <commit>, or null when git
// cannot name it. A self-venue ruling is only credible when its author is not
// this lane; the checker resolves authorship the same way.
function lastAuthor(repo, commit, path) {
  const result = git(repo, ['log', '-1', '--format=%an', commit, '--', path]);
  if (result.error || result.status !== 0) return null;
  const name = String(result.stdout).trim();
  return name.length === 0 ? null : name;
}

function commitAt(ctx, repo, commit) {
  const key = `${repo}\0${commit}`;
  if (ctx.commits.has(key)) return ctx.commits.get(key);
  let ok = false;
  if (HEX40.test(commit) && existsSync(repo)) {
    const result = git(repo, ['rev-parse', '--verify', '--end-of-options', `${commit}^{commit}`]);
    ok = result.error === undefined && result.status === 0 && String(result.stdout).trim() === commit;
  }
  ctx.commits.set(key, ok);
  return ok;
}

function lineAt(text, line) {
  const lines = String(text).split('\n');
  if (!Number.isInteger(line) || line < 1 || line > lines.length) return null;
  const value = lines[line - 1];
  return value.endsWith('\r') ? value.slice(0, -1) : value;
}

function words(quote) {
  const trimmed = String(quote).trim();
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
}

function parseSiblingRef(value) {
  const match = SIBLING_REF_RE.exec(String(value));
  if (!match) return null;
  const path = match[3];
  if (!isCleanRepoPath(path)) return null;
  return { lane: match[1], commit: match[2], path, line: Number(match[4]) };
}

function parseRulingRef(value) {
  const match = RULING_REF_RE.exec(String(value));
  if (!match) return null;
  const path = match[3];
  if (!isCleanRepoPath(path)) return null;
  return { repo: match[1], commit: match[2], path, line: Number(match[4]) };
}

function parseTabiRef(value) {
  const match = TABI_REF_RE.exec(String(value));
  if (!match) return null;
  if (!isCleanRepoPath(match[1])) return null;
  return { path: match[1], line: match[2] === undefined ? null : Number(match[2]) };
}

function repoDirFor(ctx, token) {
  if (token === 'fleet') return repoIdentity(ctx.fleetRoot);
  if (!token.endsWith('-shokunin')) return null;
  return repoIdentity(join(ctx.fleetRoot, token));
}

// A quote must carry real evidence (SentinelAnchor F10, L1 steer): at least
// four words and twenty non-space characters. A one-character quote matches
// almost any line and proves nothing.
function quoteFloorOk(quote) {
  return words(quote) >= QUOTE_FLOOR_WORDS
    && String(quote).replace(/\s+/g, '').length >= QUOTE_FLOOR_CHARS;
}

// The map and the wave scratch tree are authored by the same round that writes
// the rows, so quoting them is self-citation, not a sibling quote
// (SentinelAnchor F8). A tabi_ref may not point at the map or anywhere under
// `.ufo/`; a ruling may not quote the map or the wave tree (the checker's
// split), so a ruling can cite a committed lesson.
function isTabiSelfCitation(path) {
  return path === TSV_PATH || path === '.ufo' || path.startsWith('.ufo/');
}

function isRulingSelfCitation(path) {
  return path === TSV_PATH || path === '.ufo/waves' || path.startsWith('.ufo/waves/');
}

// A self-venue ruling is allowed only from an integrator spot-check lesson
// whose touching commit was authored by someone other than this lane (the
// round-16 integrator precedent the checker admits).
const SELF_RULING_PATH = /^corpus\/lessons\/[^/]*-verifier-spotcheck\.md$/;

function parseTsv(text) {
  const raw = String(text).split('\n');
  if (raw.length > 0 && raw[raw.length - 1] === '') raw.pop();
  const lines = raw.map((line) => (line.endsWith('\r') ? line.slice(0, -1) : line));
  if (lines.length === 0) return { header: [], headerOk: false, rows: [] };
  const header = lines[0];
  const headerOk = header === COLUMNS.join('\t');
  const rows = [];
  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index].trim().length === 0) continue;
    rows.push({ line: index + 1, fields: lines[index].split('\t').map((field) => field.trim()) });
  }
  return { header: header.split('\t'), headerOk, rows };
}

function verifyRow(ctx, row, index) {
  const reasons = [];
  const fields = row.fields;
  if (fields.length !== COLUMNS.length) {
    return {
      index,
      line: row.line,
      surface: fields[0] ?? '',
      sibling: fields[1] ?? '',
      sibling_ref: fields[2] ?? '',
      disposition: fields[6] ?? '',
      verified: false,
      reasons: [REASON.columnCount],
    };
  }
  const [surface, sibling, siblingRef, siblingQuote, tabiRef, tabiQuote,
    disposition, rulingRef, rulingQuote] = fields;

  if (fields.some((field) => CONTROL_CHARS.test(field) || INVISIBLE_CHARS.test(field))) {
    reasons.push(REASON.fieldInvisible);
  }
  if (surface.length === 0) reasons.push(REASON.surfaceEmpty);

  // sibling quote on its pinned line, at the sibling repo's pinned commit.
  // `sibling` is exactly the lane named in sibling_ref and is never this lane
  // (L1 steer: sibling==lane in ref, sibling!=tabi).
  const sib = parseSiblingRef(siblingRef);
  if (sib === null || sib.lane === ctx.ownToken) {
    reasons.push(REASON.siblingRefInvalid);
  } else if (!LANE_TOKEN.test(sibling) || sibling !== sib.lane) {
    reasons.push(REASON.siblingRefInvalid);
  } else {
    const dir = repoDirFor(ctx, `${sib.lane}-shokunin`);
    const tip = dir === null ? null : siblingTipOrNull(dir);
    if (dir === null || tip === null || !commitAt(ctx, dir, sib.commit)
      || !reachesBranchTip(dir, sib.commit, tip)) {
      reasons.push(REASON.siblingUnresolved);
    } else {
      const blob = blobAt(ctx, dir, sib.commit, sib.path);
      const line = blob.ok ? lineAt(blob.text, sib.line) : null;
      if (line === null) reasons.push(REASON.siblingUnresolved);
      else if (siblingQuote.length === 0 || !line.includes(siblingQuote)) {
        reasons.push(REASON.siblingQuoteAbsent);
      }
    }
  }
  if (words(siblingQuote) > MAX_QUOTE_WORDS) reasons.push(REASON.quoteTooLong);
  if (siblingQuote.length > 0 && !quoteFloorOk(siblingQuote)) {
    reasons.push(REASON.quoteTooShort);
  }

  // tabi quote: tabi_ref is <path>:<line>, and the quote must be verbatim on
  // exactly that line of that file at the evaluated rev (L1 steer).
  const tabi = parseTabiRef(tabiRef);
  let tabiText = null;
  if (tabi === null || tabi.line === null || isTabiSelfCitation(tabi.path)) {
    reasons.push(REASON.tabiRefInvalid);
  } else {
    const blob = blobAt(ctx, ctx.laneRepo, ctx.rev, tabi.path);
    if (!blob.ok) {
      reasons.push(REASON.tabiUnresolved);
    } else {
      const haystack = lineAt(blob.text, tabi.line);
      if (haystack === null) {
        reasons.push(REASON.tabiUnresolved);
      } else {
        tabiText = blob.text;
        if (words(tabiQuote) > MAX_QUOTE_WORDS) reasons.push(REASON.quoteTooLong);
        if (tabiQuote.length > 0 && !quoteFloorOk(tabiQuote)) {
          reasons.push(REASON.quoteTooShort);
        }
        if (tabiQuote.length === 0 || !haystack.includes(tabiQuote)) {
          reasons.push(REASON.tabiQuoteAbsent);
        }
      }
    }
  }

  // disposition and the ruling that licenses it.
  const sibLane = sib === null ? sibling : sib.lane;
  let rulingAuthority = null;
  if (!DISPOSITIONS.includes(disposition)) {
    reasons.push(REASON.dispositionUnknown);
  } else if (disposition === 'ruled' || disposition === 'contested-open') {
    const ruling = parseRulingRef(rulingRef);
    if (ruling === null || (disposition === 'contested-open'
      && (ruling.repo !== 'fleet' || ruling.path !== L0_PATH))) {
      reasons.push(REASON.rulingRefInvalid);
    } else if (isRulingSelfCitation(ruling.path)) {
      reasons.push(REASON.rulingRefInvalid);
    } else {
      const selfVenue = ruling.repo === `${ctx.ownToken}-shokunin`;
      const externalVenue = ruling.repo === 'fleet';
      // A `ruled` verdict is the fleet's or a tabi integrator spot-check line;
      // any other venue cannot rule. `contested-open` is fleet-only (above).
      if (disposition === 'ruled' && !externalVenue
        && !(selfVenue && SELF_RULING_PATH.test(ruling.path))) {
        reasons.push(REASON.rulingVenue);
      } else {
        const dir = repoDirFor(ctx, ruling.repo);
        if (dir === null || !commitAt(ctx, dir, ruling.commit)) {
          reasons.push(REASON.rulingUnresolved);
        } else {
          const authority = selfVenue ? 'self' : 'external';
          const tip = siblingTipOrNull(dir);
          if (tip === null || !reachesBranchTip(dir, ruling.commit, tip)) {
            reasons.push(REASON.rulingUnresolved);
          } else if (selfVenue && !checkSelfVenue(ctx, ruling, dir)) {
            // A self-venue line must be authored by someone other than this
            // lane, be an ancestor of the evaluated rev, and be byte-identical
            // there: this lane's own history cannot certify itself.
            reasons.push(REASON.rulingVenue);
          } else {
            const blob = blobAt(ctx, dir, ruling.commit, ruling.path);
            const line = blob.ok ? lineAt(blob.text, ruling.line) : null;
            if (line === null) {
              reasons.push(disposition === 'contested-open' ? REASON.l0LineAbsent : REASON.rulingUnresolved);
            } else if (disposition === 'contested-open'
              && !(L0_TABI_ROW.test(line) && line.includes(sibLane))) {
              reasons.push(REASON.l0LineAbsent);
            } else {
              if (words(rulingQuote) > MAX_QUOTE_WORDS) reasons.push(REASON.quoteTooLong);
              if (rulingQuote.length > 0 && !quoteFloorOk(rulingQuote)) {
                reasons.push(REASON.quoteTooShort);
              }
              if (rulingQuote.length === 0 || !line.includes(rulingQuote)) {
                reasons.push(REASON.rulingQuoteAbsent);
              } else if (disposition === 'ruled' && !rulingQuote.includes(sibLane)) {
                // The quoted ruling words must name the lane they rule on.
                reasons.push(REASON.rulingUnnamed);
              }
            }
          }
          rulingAuthority = authority;
        }
      }
    }
  } else {
    // split-declared | refused-route: ruling_ref '-' and a second tabi quote
    // that must itself be present in the tabi file.
    if (rulingRef !== '-') reasons.push(REASON.rulingRefInvalid);
    if (words(rulingQuote) > MAX_QUOTE_WORDS) reasons.push(REASON.quoteTooLong);
    if (rulingQuote.length > 0 && !quoteFloorOk(rulingQuote)) {
      reasons.push(REASON.quoteTooShort);
    }
    if (rulingQuote.length === 0) {
      reasons.push(REASON.rulingQuoteAbsent);
    } else if (tabiText !== null && !tabiText.includes(rulingQuote)) {
      reasons.push(REASON.rulingQuoteAbsent);
    }
  }

  return {
    index,
    line: row.line,
    surface,
    sibling,
    sibling_ref: siblingRef,
    disposition,
    ruling_authority: rulingAuthority,
    verified: reasons.length === 0,
    reasons,
  };
}

function fold(text) {
  return String(text).toLowerCase().replace(/\s+/g, ' ').trim();
}

// Evaluate one TSV text end to end: parse, verify, mark duplicate identities.
// Identity is case/space-folded surface+sibling, and a sibling line may be
// cited once (SentinelAnchor F11).
function evaluate(text, ctx) {
  const parsed = parseTsv(text);
  if (!parsed.headerOk) {
    return { header: parsed.header, headerOk: false, rows: [], verified: 0 };
  }
  const rows = parsed.rows.map((row, index) => verifyRow(ctx, row, index));
  // A row is unique by folded surface plus sibling lane (the checker's rule);
  // ref bytes may differ while the overlap is the same one.
  const seenIdentities = new Set();
  for (const row of rows) {
    const identity = `${fold(row.surface)}\0${fold(row.sibling)}`;
    if (seenIdentities.has(identity)) {
      row.verified = false;
      row.reasons.push(REASON.duplicateRow);
    }
    seenIdentities.add(identity);
  }
  const byDisposition = { 'contested-open': 0, ruled: 0, 'split-declared': 0, 'refused-route': 0 };
  for (const row of rows) {
    if (row.verified && Object.hasOwn(byDisposition, row.disposition)) {
      byDisposition[row.disposition] += 1;
    }
  }
  return {
    header: parsed.header,
    headerOk: true,
    rows,
    verified: rows.filter((row) => row.verified).length,
    by_disposition: byDisposition,
  };
}

function runChecker(ctx, cwd, rev) {
  const script = join(cwd, CHECKER_PATH);
  const result = spawnSync(process.execPath,
    [script, '--repo', cwd, '--fleet', ctx.fleetRoot, '--at', rev, '--json'], {
      cwd,
      env: minimalEnv(),
      encoding: 'utf8',
      maxBuffer: MAX_BUFFER,
      timeout: CHECKER_TIMEOUT_MS,
    });
  const stdout = typeof result.stdout === 'string' ? result.stdout : '';
  const stderr = typeof result.stderr === 'string' ? result.stderr : '';
  const lastLine = stdout.trim().split('\n').filter((line) => line.length > 0).pop() ?? '';
  let parsed = null;
  try {
    parsed = JSON.parse(lastLine);
  } catch {
    parsed = null;
  }
  return {
    exit: result.error ? null : result.status,
    signal: result.signal ?? null,
    timed_out: result.error?.code === 'ETIMEDOUT',
    json_ok: parsed !== null && typeof parsed === 'object',
    checker_rows: typeof parsed?.rows === 'number' ? parsed.rows : null,
    checker_verified: typeof parsed?.verified === 'number' ? parsed.verified : null,
    stdout_tail: clean(stdout.slice(-400)),
    stderr_tail: clean(stderr.slice(-400)),
  };
}

function cloneLane(ctx) {
  const root = mkdtempSync(join(tmpdir(), 'tabi-r17-c3-'));
  const sandbox = join(root, 'S');
  const clone = spawnSync('git', [...GIT_PREFIX, 'clone', '--no-hardlinks', '--quiet', ctx.laneRepo, sandbox], {
    cwd: root,
    env: minimalEnv(),
    encoding: 'utf8',
    maxBuffer: MAX_BUFFER,
    timeout: CHECKER_TIMEOUT_MS,
  });
  if (clone.error || clone.status !== 0) {
    rmSync(root, { recursive: true, force: true });
    return { root: null, sandbox: null, reason: clean(clone.stderr || clone.error?.message || 'clone failed') };
  }
  return { root, sandbox, reason: null };
}

function materialise(sandbox, relativePath, bytes) {
  const target = join(sandbox, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, bytes);
  return target;
}

// Commit the mutated TSV in the sandbox so a checker reading the worktree and a
// checker reading `<rev>:corpus/adjacency.tsv` both observe the mutation.
function commitMutation(sandbox, relativePath) {
  const add = git(sandbox, ['add', '--', relativePath]);
  if (add.error || add.status !== 0) {
    return { rev: null, detail: gitError(['add', relativePath], add) };
  }
  const commit = git(sandbox, ['-c', 'user.name=c3-counter', '-c', 'user.email=c3-counter@localhost',
    'commit', '-q', '--no-verify', '-m', 'c3 counter mutation probe: one quote altered', '--', relativePath]);
  if (commit.error || commit.status !== 0) {
    return { rev: null, detail: gitError(['commit', relativePath], commit) };
  }
  const head = git(sandbox, ['rev-parse', '--verify', 'HEAD^{commit}']);
  if (head.error || head.status !== 0) {
    return { rev: null, detail: gitError(['rev-parse', 'HEAD'], head) };
  }
  return { rev: String(head.stdout).trim(), detail: null };
}

// Probe base: the header plus the rows the counter itself verified, so the
// checker is asked to re-confirm exactly the same green input the counter
// counted. If the map is fully green this is byte-identical to the map.
function buildProbeBase(text, verifiedRows) {
  const lines = String(text).split('\n');
  const keep = new Set(verifiedRows.map((row) => row.line));
  const out = [lines[0]];
  for (let index = 1; index < lines.length; index += 1) {
    if (keep.has(index + 1) && lines[index].trim().length > 0) out.push(lines[index]);
  }
  return `${out.join('\n')}\n`;
}

function countDataRows(text) {
  return String(text).split('\n').slice(1).filter((line) => line.trim().length > 0).length;
}

function rowFields(line) {
  return line.split('\t').map((field) => field.trim());
}

function setField(line, index, value) {
  const fields = line.split('\t');
  fields[index] = value;
  return fields.join('\t');
}

function replaceDataRow(text, rowIndex, replacement) {
  const lines = String(text).split('\n');
  let seen = -1;
  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index].trim().length === 0) continue;
    seen += 1;
    if (seen === rowIndex) {
      lines[index] = replacement;
      return lines.join('\n');
    }
  }
  return null;
}

function siblingLine(ctx, line) {
  const ref = parseSiblingRef(rowFields(line)[2]);
  if (ref === null) return null;
  const dir = repoDirFor(ctx, `${ref.lane}-shokunin`);
  if (dir === null) return null;
  const blob = blobAt(ctx, dir, ref.commit, ref.path);
  if (!blob.ok) return null;
  return { dir, ref, text: blob.text, pinned: lineAt(blob.text, ref.line) };
}

// Mutation probes (L1 steer): each must reduce the verified count, and the
// checker must exit 1 on each. Builders return null when the mutation cannot
// be constructed from the real rows.
const MUTATION_SPECS = [
  {
    // A quote that exists in the sibling file but on a different line: the pin
    // is what is being verified, not the file.
    id: 'quote_from_other_line',
    build(ctx, env) {
      const info = siblingLine(ctx, env.baseLines[1]);
      if (info === null) return null;
      const sibLines = info.text.split('\n');
      // Prefer a line inside the word cap so the mutation isolates the pin,
      // then fall back to any floor-passing line.
      for (const capped of [true, false]) {
        for (let index = 0; index < sibLines.length; index += 1) {
          if (index === info.ref.line - 1) continue;
          const candidate = sibLines[index].replace(/\r$/, '').trim();
          if (candidate.length === 0 || !quoteFloorOk(candidate)) continue;
          if (capped && words(candidate) > MAX_QUOTE_WORDS) continue;
          if ((info.pinned ?? '').includes(candidate)) continue;
          const mutated = replaceDataRow(env.baseText, 0, setField(env.baseLines[1], 3, candidate));
          return mutated === null ? null : { text: mutated, target_row: 0,
            note: `sibling_quote drawn from ${info.ref.path}:${index + 1}` };
        }
      }
      return null;
    },
  },
  {
    // A single word is present on the line but fails the quote floor.
    id: 'one_word_quote',
    build(ctx, env) {
      const info = siblingLine(ctx, env.baseLines[1]);
      if (info === null || info.pinned === null) return null;
      const token = info.pinned.trim().split(/\s+/).find((value) => /[A-Za-z]/.test(value));
      if (!token) return null;
      const mutated = replaceDataRow(env.baseText, 0, setField(env.baseLines[1], 3, token));
      return mutated === null ? null : { text: mutated, target_row: 0,
        note: `sibling_quote reduced to one word '${clean(token)}'` };
    },
  },
  {
    // A commit that exists in the sibling's object store but is on no branch
    // (refs/jj/keep or an unreachable object); if none is discoverable a
    // nonexistent 40-hex pin stands in and the reason notes it.
    id: 'orphan_pin',
    build(ctx, env) {
      const info = siblingLine(ctx, env.baseLines[1]);
      if (info === null) return null;
      const tip = siblingTipOrNull(info.dir);
      let candidate = null;
      let source = null;
      const keeps = git(info.dir, ['for-each-ref', '--format=%(refname)', 'refs/jj/keep']);
      const sha = !keeps.error && keeps.status === 0
        ? String(keeps.stdout).split('\n').map((line) => line.trim().split('/').pop())
          .filter((name) => HEX40.test(name))
        : [];
      for (const commit of sha) {
        if (tip === null || !reachesBranchTip(info.dir, commit, tip)) {
          candidate = commit;
          source = 'refs_jj_keep';
          break;
        }
      }
      if (candidate === null) {
        candidate = '0'.repeat(40);
        source = 'nonexistent';
      }
      const newRef = `${info.ref.lane}-shokunin@${candidate}:${info.ref.path}:${info.ref.line}`;
      const mutated = replaceDataRow(env.baseText, 0, setField(env.baseLines[1], 2, newRef));
      return mutated === null ? null : { text: mutated, target_row: 0,
        note: `pin rewritten to ${candidate.slice(0, 8)} (${source})` };
    },
  },
  {
    // The map quoting itself is not sibling evidence.
    id: 'self_tabi_ref',
    build(ctx, env) {
      const mutated = replaceDataRow(env.baseText, 0, setField(env.baseLines[1], 4, TSV_PATH));
      return mutated === null ? null : { text: mutated, target_row: 0,
        note: 'tabi_ref rewritten to corpus/adjacency.tsv' };
    },
  },
  {
    // A ruling quote that is verbatim on the ruling line but does not name the
    // sibling lane.
    id: 'ruling_unnamed',
    build(ctx, env) {
      for (let rowIndex = 0; rowIndex < env.baseLines.length - 1; rowIndex += 1) {
        const line = env.baseLines[rowIndex + 1];
        const fields = rowFields(line);
        if (fields[6] !== 'ruled') continue;
        const ruling = parseRulingRef(fields[7]);
        if (ruling === null) continue;
        const dir = repoDirFor(ctx, ruling.repo);
        if (dir === null) continue;
        const blob = blobAt(ctx, dir, ruling.commit, ruling.path);
        if (!blob.ok) continue;
        const rulingLine = lineAt(blob.text, ruling.line);
        if (rulingLine === null) continue;
        const lane = (parseSiblingRef(fields[2])?.lane ?? fields[1]).toLowerCase();
        const tokens = rulingLine.split(/\s+/);
        for (let length = 4; length <= 8; length += 1) {
          for (let start = 0; start + length <= tokens.length; start += 1) {
            const run = tokens.slice(start, start + length).join(' ');
            if (run.length === 0 || !quoteFloorOk(run)) continue;
            if (run.toLowerCase().includes(lane)) continue;
            if (!rulingLine.includes(run)) continue;
            const mutated = replaceDataRow(env.baseText, rowIndex, setField(line, 8, run));
            return mutated === null ? null : { text: mutated, target_row: rowIndex,
              note: `ruling_quote replaced with '${clean(run)}'` };
          }
        }
      }
      return null;
    },
  },
  {
    // A second row whose surface differs only by case/space must not add a
    // second count.
    id: 'duplicate_surface',
    build(ctx, env) {
      const fields = rowFields(env.baseLines[1]);
      const dup = setField(env.baseLines[1], 0, fields[0].toUpperCase());
      return { text: `${env.baseText.replace(/\n$/, '')}\n${dup}\n`, target_row: 1,
        note: `appended row with surface '${clean(fields[0].toUpperCase())}'` };
    },
  },
  {
    // The tabi pin names a line, and the quote must live on it exactly.
    id: 'tabi_line_shift',
    build(ctx, env) {
      const fields = rowFields(env.baseLines[1]);
      const tabi = parseTabiRef(fields[4]);
      if (tabi === null || tabi.line === null) return null;
      const blob = blobAt(ctx, ctx.laneRepo, ctx.rev, tabi.path);
      if (!blob.ok) return null;
      const count = blob.text.split('\n').length;
      for (let lineNo = 1; lineNo <= count; lineNo += 1) {
        if (lineNo === tabi.line) continue;
        const line = lineAt(blob.text, lineNo);
        if (line === null || line.includes(fields[5])) continue;
        const mutated = replaceDataRow(env.baseText, 0,
          setField(env.baseLines[1], 4, `${tabi.path}:${lineNo}`));
        return mutated === null ? null : { text: mutated, target_row: 0,
          note: `tabi_ref moved to ${tabi.path}:${lineNo}` };
      }
      return null;
    },
  },
];

function probeChecker(ctx, real) {
  const checker = blobAt(ctx, ctx.laneRepo, ctx.rev, CHECKER_PATH);
  const tsv = blobAt(ctx, ctx.laneRepo, ctx.rev, TSV_PATH);
  const verifiedRows = real.rows.filter((row) => row.verified);
  const baseText = tsv.ok ? buildProbeBase(tsv.text, verifiedRows) : '';
  const base = {
    path: CHECKER_PATH,
    present: checker.ok,
    sha256: checker.ok ? sha256(checker.bytes) : null,
    probe_rows: verifiedRows.length,
    probe_base_matches_map: tsv.ok ? baseText === tsv.text : false,
    expected_real_exit: real.rows.length === 0 ? 2
      : (real.verified === real.rows.length ? 0 : 1),
  };
  const skip = (status) => ({ status, real: { exit: null, ok: false, status }, mutations: [] });
  if (!checker.ok) return { ...base, ...skip('checker_absent') };
  if (!tsv.ok) return { ...base, ...skip('tsv_absent') };
  if (!existsSync(ctx.laneRepo)) return { ...base, ...skip('lane_unavailable') };

  const cloned = cloneLane(ctx);
  if (cloned.sandbox === null) {
    return { ...base, ...skip('sandbox_unavailable'), sandbox_reason: cloned.reason };
  }
  try {
    const revPresent = git(cloned.sandbox, ['cat-file', '-e', `${ctx.rev}^{commit}`]);
    if (revPresent.error || revPresent.status !== 0) {
      return { ...base, ...skip('revision_not_in_sandbox') };
    }
    materialise(cloned.sandbox, CHECKER_PATH, checker.bytes);
    materialise(cloned.sandbox, TSV_PATH, tsv.bytes);
    // 1) The real map at REV: the checker must agree with the counter on the
    // delivered bytes (exit 0 exactly when every row verified).
    const realRun = runChecker(ctx, cloned.sandbox, ctx.rev);
    const countAgreement = realRun.checker_rows === real.rows.length
      && realRun.checker_verified === real.verified;
    if (verifiedRows.length === 0) {
      return {
        ...base,
        status: 'no_verified_row',
        real: { ...realRun, expected: base.expected_real_exit, ok: realRun.exit === base.expected_real_exit },
        count_agreement: countAgreement,
        mutations: [],
      };
    }
    // 2) The probe base (header + counter-verified rows): committed so a
    // blob-reading checker sees exactly the bytes the counter evaluated.
    let baseRev = ctx.rev;
    if (baseText !== tsv.text) {
      materialise(cloned.sandbox, TSV_PATH, Buffer.from(baseText, 'utf8'));
      const committed = commitMutation(cloned.sandbox, TSV_PATH);
      if (committed.rev === null) {
        return { ...base, ...skip('probe_base_commit_failed'), detail: committed.detail };
      }
      baseRev = committed.rev;
    }
    const baseRun = runChecker(ctx, cloned.sandbox, baseRev);
    const baseLines = baseText.split('\n').filter((line) => line.length > 0);
    const env = { baseText, baseLines };
    const mutations = [];
    for (const spec of MUTATION_SPECS) {
      const built = spec.build(ctx, env);
      if (built === null) {
        mutations.push({ id: spec.id, applied: false, note: 'not_constructible' });
        continue;
      }
      materialise(cloned.sandbox, TSV_PATH, Buffer.from(built.text, 'utf8'));
      const committed = commitMutation(cloned.sandbox, TSV_PATH);
      if (committed.rev === null) {
        mutations.push({ id: spec.id, applied: true, note: 'commit_failed', detail: committed.detail });
        continue;
      }
      const run = runChecker(ctx, cloned.sandbox, committed.rev);
      const counter = evaluate(built.text, ctx);
      const eligible = countDataRows(built.text);
      mutations.push({
        id: spec.id,
        applied: true,
        target_row: built.target_row,
        note: built.note,
        eligible_rows: eligible,
        counter_verified: counter.verified,
        counter_reasons: counter.rows[built.target_row]?.reasons ?? null,
        checker_exit: run.exit,
        checker_ok: run.exit === 1,
        dropped: counter.verified < eligible,
      });
    }
    // Leave the sandbox holding the real bytes, then drop it.
    materialise(cloned.sandbox, TSV_PATH, tsv.bytes);
    return {
      ...base,
      status: 'ran',
      base_revision: baseRev,
      real: { ...realRun, expected: base.expected_real_exit, ok: realRun.exit === base.expected_real_exit },
      count_agreement: countAgreement,
      probe_base_exit: baseRun.exit,
      probe_base_ok: baseRun.exit === 0,
      mutations,
    };
  } finally {
    rmSync(cloned.root, { recursive: true, force: true });
  }
}


function parseArgs(argv) {
  const options = { rev: null, repo: null, fleetRoot: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--repo') {
      options.repo = resolvePath(argv[index += 1] ?? refuse('usage', '--repo needs a path'));
    } else if (arg === '--fleet-root') {
      options.fleetRoot = resolvePath(argv[index += 1] ?? refuse('usage', '--fleet-root needs a path'));
    } else if (arg.startsWith('-')) {
      refuse('usage', `unknown option ${clean(arg)}`);
    } else if (options.rev === null) {
      options.rev = arg;
    } else {
      refuse('usage', `unexpected argument ${clean(arg)}`);
    }
  }
  return options;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const laneRepo = resolvePath(options.repo ?? DEFAULT_LANE_ROOT);
  const fleetRoot = resolvePath(options.fleetRoot ?? dirname(laneRepo));
  ceilingDir = dirname(fleetRoot);
  const ctx = {
    laneRepo,
    fleetRoot,
    ownToken: basename(laneRepo).replace(/-shokunin$/, ''),
    rev: null,
    blobs: new Map(),
    commits: new Map(),
  };

  const top = git(laneRepo, ['rev-parse', '--show-toplevel']);
  if (top.error || top.status !== 0) refuse('repo_unresolved', gitError(['rev-parse', '--show-toplevel'], top));
  let topReal;
  let laneReal;
  try {
    topReal = realpathSync(String(top.stdout).trim());
    laneReal = realpathSync(laneRepo);
  } catch (error) {
    refuse('repo_unresolved', clean(error.message));
  }
  if (topReal !== laneReal) {
    refuse('repo_unresolved', `lane repo ${laneReal} is not its own git toplevel (${topReal})`);
  }
  ctx.rev = options.rev === null ? laneTip(laneRepo) : resolveCommit(laneRepo, options.rev, 'REV');

  const tsv = blobAt(ctx, laneRepo, ctx.rev, TSV_PATH);
  const probes = {
    revision: ctx.rev,
    lane_repo: laneRepo,
    fleet_root: fleetRoot,
    tsv: {
      path: TSV_PATH,
      present: tsv.ok,
      sha256: tsv.ok ? sha256(tsv.bytes) : null,
      header: [],
      header_ok: false,
      data_rows: 0,
    },
    checker: null,
    error: null,
  };

  let evaluated;
  let couldNotEvaluate = false;
  if (!tsv.ok) {
    // Baseline shape: the map does not exist yet, so nothing can be verified.
    evaluated = { header: [], headerOk: true, rows: [], verified: 0,
      by_disposition: { 'contested-open': 0, ruled: 0, 'split-declared': 0, 'refused-route': 0 } };
    probes.tsv.absent_reason = tsv.reason ?? 'absent';
  } else {
    evaluated = evaluate(tsv.text, ctx);
    probes.tsv.header = evaluated.header;
    probes.tsv.header_ok = evaluated.headerOk;
    probes.tsv.data_rows = evaluated.rows.length;
    if (!evaluated.headerOk) {
      couldNotEvaluate = true;
      probes.error = { reason: 'header_invalid', detail: clean(evaluated.header.join('|')) };
    }
  }

  if (!couldNotEvaluate) {
    probes.checker = probeChecker(ctx, evaluated);
  }

  const output = {
    c3_adjacency_verified: evaluated.verified,
    by_disposition: evaluated.by_disposition,
    rows: evaluated.rows,
    probes,
  };
  process.stdout.write(`${JSON.stringify(output)}\n`);
  return couldNotEvaluate ? EXIT.couldNotEvaluate : EXIT.evaluated;
}

try {
  process.exitCode = main();
} catch (error) {
  const reason = error instanceof CouldNotEvaluate ? error.reason : 'internal_error';
  const detail = clean(error instanceof Error ? error.message : error);
  process.stdout.write(`${JSON.stringify({
    c3_adjacency_verified: 0,
    rows: [],
    probes: { error: { reason, detail }, checker: null, tsv: null },
  })}\n`);
  process.exitCode = EXIT.couldNotEvaluate;
}
