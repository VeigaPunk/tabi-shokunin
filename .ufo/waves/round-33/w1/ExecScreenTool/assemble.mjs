#!/usr/bin/env node
// assemble.mjs — round-33 C1 draft merger + verifier (seat ExecScreenTool).
//
// Why this exists
//   Wave-1 seats each return a fragment of the round-33 adjacency move, in the
//   seat format (bare rows, no header):
//     <draft>/rows.tsv    9 TAB columns = one corpus/adjacency.tsv data row
//     <draft>/screen.tsv  5 TAB columns = one corpus/adjacency-screen.tsv row
//   The L1 must fold those fragments onto the map as it stands at a lane
//   revision without hand-editing TSV and without carrying a duplicate, a
//   conflicting decision or an unverifiable quote into the map. This tool does
//   that fold, refuses locally what the frozen gate would refuse anyway, and
//   then runs the frozen instruments to say whether the fused artifact actually
//   moves the axis.
//
// Usage
//   node assemble.mjs --repo <lane|clone> --rev <40-hex REV> \
//        --draft <dir> [--draft <dir> ...] \
//        [--fleet <dir>] [--l0 <file>] [--out <dir>] [--verify <clone>] \
//        [--prefer <draft>] [--json]
//   node assemble.mjs --help
//
//   --repo    git repository holding corpus/adjacency.tsv at --rev (the lane,
//             or the scratch clone used by --verify). Must be a git toplevel.
//   --rev     40-hex commit whose map is the merge base. Every quote on the
//             tabi side is read at this revision, never from the worktree.
//   --fleet   parent directory of the sibling lane repositories (default: the
//             parent of --repo). Sibling refs and the fleet l0 file resolve
//             here; the frozen counter needs it to enumerate candidates.
//   --draft   a directory holding rows.tsv and/or screen.tsv. Repeatable; the
//             draft name is the directory basename and must be unique.
//   --l0      TAB file mapping L0PENDING rows to a fleet l0 line:
//                 <key>\t<fleet@40hex:.ufo/l0-questions.md:line>\t<quote>
//             <key> is `<draft>:<rowNo>`, `pin:<sibling_ref>` or the bare
//             sibling_ref. Lines starting with '#' and blank lines are
//             ignored. The quote column may be empty when the draft row
//             already carries one.
//   --out     directory: writes <out>/corpus/adjacency.tsv and
//             <out>/corpus/adjacency-screen.tsv (repo layout, so the L1 can
//             diff or copy).
//   --verify  scratch clone: writes the merged files there, commits them
//             (only inside that clone), then runs scripts/check-adjacency.mjs
//             and the frozen C1 counter at the new commit.
//   --prefer  draft name that wins a cross-draft conflict. Without it every
//             side of a conflict is reported and withheld.
//
// What is refused before anything is written (a refused row is reported, never
// committed; the rest of the draft still merges):
//   * row shape, surface charset, banned control/bidi chars
//   * sibling_ref/sibling mismatch, own-lane ref, clean-path and .ufo/ rules
//   * sibling commit not reachable from that sibling's lane tip; sibling line
//     absent; sibling_quote not verbatim on the cited line
//   * tabi_ref shape, map/.ufo self-citation, line absent at REV, tabi_quote not
//     verbatim there
//   * quote length (4..25 words, >= 20 non-space chars) on every quote
//   * disposition vocabulary and the ruling presence rule
//   * ruled/contested-open ruling line resolution; contested-open needs a
//     `tabi | round-<N> |` l0 row naming the sibling; ruled quote must name the
//     sibling
//   * L0PENDING rows without a resolved mapping, or with a mapping that fails
//     the same l0 rules (pending rows are reported, not committed)
//   * duplicate folded surface+sibling and duplicate sibling pin
//     (`lane@path:line`, commit-independent) — check-adjacency's duplicate_row
//   * conflicting decisions for one candidate (same sibling line text): across
//     drafts, and against a row already on the base map
//   * screen rows: ref not a frozen candidate, reason outside the closed
//     vocabulary, quote not verbatim in the candidate line, surface rule
//     (same-surface names a verified map surface of the same sibling; every
//     other reason uses '-'), duplicate ref
//
// What it will not decide (the L1 does):
//   * whether a mapped line is really an overlap — the tool proves the row is
//     well formed and non-duplicative, not that it is right
//   * which side of a cross-draft conflict is correct, unless --prefer says so
//   * base-map rows are never edited or dropped: the merge is append-only on
//     the map, so a bad base row stays visible to the gate
//
// Exit classes: 0 merged clean (no withheld row, gate clean, counter predicate
// met); 1 evaluated with withheld rows, gate findings, or predicate not met;
// 2 could not evaluate (usage, git failure, toplevel/HEAD mismatch, lane guard).
//
// No dependencies beyond node:fs / node:child_process / node:path / node:url.
// Every git child runs with `-C <repo>`, a frozen minimal environment, replace
// objects and the commit-graph disabled, and GIT_CEILING_DIRECTORIES set to the
// repo's parent so a broken .git cannot climb into the enclosing fleet repo.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const SCHEMA = 'tabi-r33-assemble-v1';
const MAP_PATH = 'corpus/adjacency.tsv';
const SCREEN_PATH = 'corpus/adjacency-screen.tsv';
const GATE_PATH = 'scripts/check-adjacency.mjs';
const COUNTER_PATH = '.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs';
const MAP_HEADER = [
  'surface', 'sibling', 'sibling_ref', 'sibling_quote', 'tabi_ref',
  'tabi_quote', 'disposition', 'ruling_ref', 'ruling_quote',
];
const SCREEN_HEADER = ['sibling_ref', 'reason', 'surface', 'quote', 'note'];
const SCREEN_REASONS = ['not-browser-sense', 'same-surface', 'third-lane-report', 'no-claim-declared'];
const DISPOSITIONS = ['ruled', 'contested-open', 'split-declared', 'refused-route'];
const SPLIT_DISPOSITIONS = new Set(['split-declared', 'refused-route']);

const MAX_QUOTE_WORDS = 25;
const MIN_QUOTE_WORDS = 4;
const MIN_QUOTE_CHARS = 20;
const SURFACE_CHARSET = /^[a-z0-9-]+$/;
const BANNED_CHARS = /[\x00-\x1f\x7f-\x9f\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/u;
const HEX40 = /^[0-9a-f]{40}$/;
const LANE_TOKEN = /^[a-z0-9][a-z0-9-]*$/;
const PATH_CHARS = /^[A-Za-z0-9._/-]+$/;
const SIBLING_REF = /^([a-z0-9][a-z0-9-]*)-shokunin@([0-9a-f]{40}):(.+):([1-9][0-9]*)$/;
const RULING_REF = /^(fleet|[a-z0-9][a-z0-9-]*-shokunin)@([0-9a-f]{40}):(.+):([1-9][0-9]*)$/;
const TABI_REF = /^([^:]+):([1-9][0-9]*)$/;
const L0_REF = /^fleet@([0-9a-f]{40}):\.ufo\/l0-questions\.md:([1-9][0-9]*)$/;
const L0_TABI_ROW = /^tabi[ \t]*\|[ \t]*round-[0-9]+[ \t]*\|/;
const SELF_LANE = 'tabi';
const BASE = '(base)';
const L0_PENDING = 'L0PENDING';

class Refusal extends Error {}

// ---------------------------------------------------------------------------
// process helpers

function gitEnv(ceiling) {
  const env = {
    PATH: process.env.PATH,
    HOME: process.env.HOME,
    TMPDIR: process.env.TMPDIR || '/tmp',
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_NO_REPLACE_OBJECTS: '1',
    LC_ALL: 'C',
  };
  if (ceiling) env.GIT_CEILING_DIRECTORIES = ceiling;
  return env;
}

function git(repo, args, { allowFail = false } = {}) {
  const r = spawnSync('git', ['-C', repo, '-c', 'core.commitGraph=false', ...args], {
    encoding: 'buffer',
    env: gitEnv(dirname(resolve(repo))),
    maxBuffer: 128 * 1024 * 1024,
  });
  if (r.status !== 0 && !allowFail) {
    throw new Refusal(`git -C ${repo} ${args.join(' ')} failed (exit ${r.status}): ${r.stderr.toString('utf8').trim()}`);
  }
  return r;
}

function gitOk(repo, args) {
  return git(repo, args, { allowFail: true }).status === 0;
}

function toplevelOf(repo) {
  const r = git(repo, ['rev-parse', '--show-toplevel'], { allowFail: true });
  if (r.status !== 0) return null;
  const out = r.stdout.toString('utf8').trim();
  return out === '' ? null : out;
}

function assertOwnToplevel(repo, what) {
  if (!existsSync(repo)) throw new Refusal(`${what} ${repo} does not exist`);
  const top = toplevelOf(repo);
  if (top === null) throw new Refusal(`${what} ${repo} is not a git repository`);
  if (realpathSync(top) !== realpathSync(repo)) {
    throw new Refusal(`${what} ${repo} is not itself a git toplevel (toplevel: ${top})`);
  }
  return realpathSync(repo);
}

function resolveHexCommit(repo, rev) {
  if (!HEX40.test(rev)) throw new Refusal(`--rev must be 40 lowercase hex: ${JSON.stringify(rev)}`);
  const r = git(repo, ['rev-parse', '--verify', '--quiet', `${rev}^{commit}`], { allowFail: true });
  if (r.status !== 0) throw new Refusal(`revision ${rev} does not resolve in ${repo}`);
  return rev;
}

const blobCache = new Map();

function blobAt(repo, rev, path) {
  const key = `${repo}\0${rev}\0${path}`;
  if (blobCache.has(key)) return blobCache.get(key);
  const r = git(repo, ['show', `${rev}:${path}`], { allowFail: true });
  const value = r.status === 0 ? r.stdout : null;
  blobCache.set(key, value);
  return value;
}

const linesOf = (buf) => buf.toString('utf8').split('\n').map((l) => l.replace(/\r$/, ''));

function lineAt(repo, rev, path, lineNo) {
  const buf = blobAt(repo, rev, path);
  if (buf === null) return null;
  const ls = linesOf(buf);
  return lineNo >= 1 && lineNo <= ls.length ? ls[lineNo - 1] : null;
}

function laneTip(repo) {
  for (const ref of ['refs/heads/master', 'refs/heads/main']) {
    const r = git(repo, ['rev-parse', '--verify', '--quiet', `${ref}^{commit}`], { allowFail: true });
    if (r.status === 0) return r.stdout.toString('utf8').trim();
  }
  return null;
}

function isAncestor(repo, ancestor, descendant) {
  const r = git(repo, ['merge-base', '--is-ancestor', ancestor, descendant], { allowFail: true });
  return r.status === 0;
}

function isCleanPath(p) {
  if (typeof p !== 'string' || p.length === 0 || p.length > 512) return false;
  if (p.includes('\0') || p.includes('\\')) return false;
  if (!PATH_CHARS.test(p)) return false;
  return p.split('/').every((s) => s.length > 0 && s !== '.' && s !== '..' && !s.startsWith('-'));
}

const words = (s) => {
  const t = s.trim();
  return t.length === 0 ? [] : t.split(/\s+/);
};
const nonSpace = (s) => s.replace(/\s+/g, '').length;
const foldSurface = (s) => s.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
const isBanned = (s) => BANNED_CHARS.test(s);

function pinKeyOf(ref) {
  const m = SIBLING_REF.exec(ref);
  return m === null ? null : `${m[1]}@${m[3]}:${m[4]}`;
}

// ---------------------------------------------------------------------------
// entry model

function makeEntry({ draft, rowNo, kind, fields }) {
  return {
    id: `${draft}:${rowNo}`,
    draft,
    rowNo,
    kind,
    fields,
    reasons: [],
    notes: [],
    status: 'accept',
    candidateId: null,
    pin: null,
    folded: null,
    decision: null,
  };
}

function reason(entry, why, detail = '') {
  entry.reasons.push({ reason: why, detail });
}

function quoteLength(entry, label, quote) {
  const w = words(quote).length;
  if (w > MAX_QUOTE_WORDS) reason(entry, 'quote-too-long', `${label} words=${w} max=${MAX_QUOTE_WORDS}`);
  if (w < MIN_QUOTE_WORDS || nonSpace(quote) < MIN_QUOTE_CHARS) {
    reason(entry, 'quote-too-short', `${label} words=${w} non_space=${nonSpace(quote)} min=${MIN_QUOTE_WORDS}/${MIN_QUOTE_CHARS}`);
  }
}

// ---------------------------------------------------------------------------
// sibling / tabi / ruling resolution (mirrors scripts/check-adjacency.mjs)

function siblingLine(ctx, ref, sibling) {
  const m = SIBLING_REF.exec(ref);
  if (m === null) return { why: 'sibling_ref is not <lane>-shokunin@<40-hex>:<path>:<line>' };
  const [, token, commit, path, lineNoRaw] = m;
  const lineNo = Number(lineNoRaw);
  if (!isCleanPath(path)) return { why: `sibling_ref path ${JSON.stringify(path)} is not a clean repo-relative path` };
  if (path === '.ufo' || path.startsWith('.ufo/')) return { why: `sibling_ref path ${path} is under .ufo/` };
  if (!LANE_TOKEN.test(sibling) || sibling !== token) {
    return { why: `sibling=${JSON.stringify(sibling)} does not equal the lane named in sibling_ref (${token})` };
  }
  if (token === SELF_LANE) return { why: `sibling_ref lane=${token} is this lane's own repository` };
  const repo = join(ctx.fleet, `${token}-shokunin`);
  if (!existsSync(repo)) return { why: `sibling repo ${repo} is absent` };
  const top = toplevelOf(repo);
  if (top === null || realpathSync(top) !== realpathSync(repo)) {
    return { why: `sibling repo ${repo} is not a git toplevel` };
  }
  const tip = laneTip(repo);
  if (tip === null) return { why: `sibling ${token} lane tip (master/main) does not resolve` };
  if (!isAncestor(repo, commit, tip)) return { why: `sibling ${token}@${commit} is not reachable from lane tip ${tip}` };
  const text = lineAt(repo, commit, path, lineNo);
  if (text === null) return { why: `sibling ${token}@${commit}:${path}:${lineNo} does not resolve` };
  return { text, token, commit, path, line: lineNo, pin: `${token}@${path}:${lineNo}` };
}

function tabiLineAt(ctx, ref) {
  const m = TABI_REF.exec(ref);
  if (m === null || !isCleanPath(m[1])) return { why: `tabi_ref=${JSON.stringify(ref)} must be <clean path>:<line>` };
  const path = m[1];
  const lineNo = Number(m[2]);
  if (path === MAP_PATH || path === '.ufo' || path.startsWith('.ufo/')) {
    return { why: `tabi_ref=${path} is the map or under .ufo/; a row cannot quote itself` };
  }
  const buf = blobAt(ctx.repo, ctx.rev, path);
  if (buf === null) return { why: `tabi_ref=${path} is absent at ${ctx.rev}` };
  const ls = linesOf(buf);
  if (lineNo > ls.length) return { why: `tabi_ref=${path}:${lineNo} is beyond EOF at ${ctx.rev}` };
  return { text: ls[lineNo - 1], path, line: lineNo, file: buf.toString('utf8') };
}

function rulingLine(ctx, token, commit, path, lineNo, allowL0) {
  if (!isCleanPath(path)) return { why: `ruling_ref path ${JSON.stringify(path)} is not a clean repo-relative path` };
  // The l0 file is the one .ufo/ path a row may cite, and only as a
  // contested-open question (a question is not a ruling).
  if (path === MAP_PATH || ((path === '.ufo' || path.startsWith('.ufo/')) && !(allowL0 && path === '.ufo/l0-questions.md'))) {
    return { why: `ruling_ref path ${path} is the map or wave scaffolding` };
  }
  const repo = token === 'fleet' ? ctx.fleet : join(ctx.fleet, token);
  if (!existsSync(repo)) return { why: `ruling repo ${repo} is absent` };
  const top = toplevelOf(repo);
  if (top === null || realpathSync(top) !== realpathSync(repo)) return { why: `ruling repo ${repo} is not a git toplevel` };
  const tip = laneTip(repo);
  if (tip === null) return { why: `ruling repo ${repo} lane tip does not resolve` };
  if (!isAncestor(repo, commit, tip)) return { why: `ruling_ref ${token}@${commit} is not reachable from lane tip ${tip}` };
  const text = lineAt(repo, commit, path, lineNo);
  if (text === null) return { why: `ruling_ref ${token}@${commit}:${path}:${lineNo} does not resolve` };
  return { text, repo };
}

// ---------------------------------------------------------------------------
// draft reading

// A seat fragment: bare rows, optionally carrying the header line.
function readTsv(path, expected) {
  if (!existsSync(path)) return null;
  const ls = readFileSync(path, 'utf8').split('\n').map((l) => l.replace(/\r$/, ''));
  const rows = [];
  for (let i = 0; i < ls.length; i += 1) {
    const line = ls[i];
    if (line === '') continue;
    if (rows.length === 0 && line === expected.join('\t')) continue;
    rows.push({ rowNo: i + 1, line });
  }
  return rows;
}

function readDrafts(draftDirs) {
  const seen = new Set();
  const drafts = [];
  for (const dir of draftDirs) {
    const abs = resolve(dir);
    if (!existsSync(abs)) throw new Refusal(`--draft ${dir} does not exist`);
    const name = basename(abs);
    if (seen.has(name)) throw new Refusal(`--draft name ${name} is used twice; ids would be ambiguous`);
    seen.add(name);
    const mapPart = readTsv(join(abs, 'rows.tsv'), MAP_HEADER);
    const screenPart = readTsv(join(abs, 'screen.tsv'), SCREEN_HEADER);
    if (mapPart === null && screenPart === null) throw new Refusal(`--draft ${dir} holds neither rows.tsv nor screen.tsv`);
    drafts.push({ name, dir: abs, mapPart, screenPart });
  }
  if (drafts.length === 0) throw new Refusal('at least one --draft is required');
  return drafts;
}

// ---------------------------------------------------------------------------
// l0 mapping

function readL0(file) {
  if (file === null) return new Map();
  if (!existsSync(file)) throw new Refusal(`--l0 ${file} does not exist`);
  const out = new Map();
  const ls = readFileSync(file, 'utf8').split('\n').map((l) => l.replace(/\r$/, ''));
  ls.forEach((line, i) => {
    if (line === '' || line.startsWith('#')) return;
    const f = line.split('\t');
    if (f.length !== 3) throw new Refusal(`--l0 ${file}:${i + 1} is not 3 TAB columns (key, ref, quote)`);
    const [key, ref, quote] = f.map((x) => x.trim());
    if (out.has(key)) throw new Refusal(`--l0 ${file}:${i + 1} repeats key ${key}`);
    out.set(key, { ref, quote, where: `${file}:${i + 1}` });
  });
  return out;
}

// ---------------------------------------------------------------------------
// map row checks

function checkMapEntry(entry, ctx, l0) {
  const f = entry.fields;
  if (f.length !== 9) {
    reason(entry, 'row-shape', `columns=${f.length} expected=9`);
    return;
  }
  const [surface, sibling, sref, squad, tref, tquad, disp, rrefRaw, rquadRaw] = f;
  const banned = f.some((x) => isBanned(x));
  if (banned) reason(entry, 'field-control', 'a field carries a C0/C1 control, bidi override or zero-width code point');

  if (surface === '') reason(entry, 'surface-empty', 'surface column is empty');
  else if (!SURFACE_CHARSET.test(surface)) reason(entry, 'surface-charset', `surface=${JSON.stringify(surface)} not [a-z0-9-]`);

  const sib = siblingLine(ctx, sref, sibling);
  if (sib.why) {
    reason(entry, sib.why.startsWith('sibling repo') || sib.why.includes('does not resolve') || sib.why.includes('reachable') ? 'sibling-unresolved' : 'sibling-ref-invalid', sib.why);
  } else {
    entry.pin = sib.pin;
    entry.candidateId = `${sib.token}\0${sib.text.trim()}`;
    if (!banned && squad === '') reason(entry, 'sibling-quote-absent', 'sibling_quote is empty');
    else if (!banned) {
      quoteLength(entry, 'sibling_quote', squad);
      if (!sib.text.includes(squad)) reason(entry, 'sibling-quote-absent', `sibling_quote not on ${sib.pin}`);
    }
  }

  const tab = tabiLineAt(ctx, tref);
  if (tab.why) reason(entry, tab.why.startsWith('tabi_ref') ? 'tabi-ref-invalid' : 'tabi-unresolved', tab.why);
  else if (!banned) {
    if (tquad === '') reason(entry, 'tabi-quote-absent', 'tabi_quote is empty');
    else {
      quoteLength(entry, 'tabi_quote', tquad);
      if (!tab.text.includes(tquad)) reason(entry, 'tabi-quote-absent', `tabi_quote not on ${tab.path}:${tab.line} at ${ctx.rev}`);
    }
  }

  if (!DISPOSITIONS.includes(disp)) {
    reason(entry, 'disposition-unknown', `disposition=${JSON.stringify(disp)}`);
    return;
  }
  entry.decision = `map:${disp}`;
  entry.folded = surface === '' ? null : `${foldSurface(surface)} ${sibling}`;

  // L0PENDING: a draft seat can draft the row but only the L1 files the l0
  // line, so the ref arrives out of band. Anything unresolved stays pending.
  let rref = rrefRaw;
  let rquad = rquadRaw;
  if (disp === 'contested-open' && rref === L0_PENDING) {
    const keys = [entry.id, `pin:${sref}`, sref];
    const hit = keys.map((k) => [k, l0.get(k)]).find(([, v]) => v !== undefined);
    if (!hit) {
      entry.status = 'pending';
      reason(entry, 'pending-unresolved', `no --l0 mapping for ${keys.join(' | ')}`);
      return;
    }
    const mapping = hit[1];
    const m = L0_REF.exec(mapping.ref);
    if (!m) {
      entry.status = 'pending';
      reason(entry, 'pending-invalid', `--l0 ${mapping.where} ref must be fleet@<40-hex>:.ufo/l0-questions.md:<line>, got ${JSON.stringify(mapping.ref)}`);
      return;
    }
    rref = mapping.ref;
    if (rquad === L0_PENDING || rquad === '') {
      if (mapping.quote === '') {
        entry.status = 'pending';
        reason(entry, 'pending-invalid', `--l0 ${mapping.where} carries no quote and the row has none`);
        return;
      }
      rquad = mapping.quote;
      entry.fields[7] = rref;
      entry.fields[8] = rquad;
    }
    entry.notes.push(`l0 resolved from ${mapping.where}`);
  } else if (rref === L0_PENDING) {
    entry.status = 'pending';
    reason(entry, 'pending-not-contested', `L0PENDING is an l0 question line; disposition ${disp} is not contested-open`);
    return;
  }

  if (SPLIT_DISPOSITIONS.has(disp)) {
    if (rref !== '-') {
      reason(entry, 'ruling-ref-invalid', `${disp} requires ruling_ref '-', got ${JSON.stringify(rref)}`);
      return;
    }
    if (rquad === '') reason(entry, 'ruling-quote-absent', 'ruling_quote is empty');
    else if (!banned) {
      quoteLength(entry, 'ruling_quote', rquad);
      if (tab.why || !tab.file.includes(rquad)) reason(entry, 'ruling-quote-absent', `split ruling_quote not in tabi_ref=${tref} at ${ctx.rev}`);
    }
    return;
  }

  if (rref === '-') {
    reason(entry, 'ruling-ref-invalid', `${disp} requires a ruling_ref, not '-'`);
    return;
  }
  const m = RULING_REF.exec(rref);
  if (m === null) {
    reason(entry, 'ruling-ref-invalid', `ruling_ref=${JSON.stringify(rref)} must be <repo>@<40-hex>:<path>:<line>`);
    return;
  }
  const [, token, commit, path, lineNoRaw] = m;
  if (disp === 'contested-open' && (token !== 'fleet' || path !== '.ufo/l0-questions.md')) {
    reason(entry, 'ruling-ref-invalid', 'contested-open ruling_ref must be fleet@<40-hex>:.ufo/l0-questions.md:<line>');
    return;
  }
  if (disp === 'ruled'
    && (token !== 'fleet' || path === '.ufo' || path.startsWith('.ufo/'))
    && !(token === `${SELF_LANE}-shokunin` && /^corpus\/lessons\/.*-verifier-spotcheck\.md$/.test(path))) {
    reason(entry, 'ruling-ref-invalid', `ruled ruling_ref must be fleet@... outside .ufo/ or a non-tabi *-verifier-spotcheck.md line; got ${token}@...:${path}`);
    return;
  }
  const ruling = rulingLine(ctx, token, commit, path, Number(lineNoRaw), disp === 'contested-open');
  if (ruling.why) {
    reason(entry, 'ruling-unresolved', ruling.why);
    return;
  }
  if (disp === 'contested-open') {
    if (!L0_TABI_ROW.test(ruling.text)) {
      entry.status = 'pending';
      reason(entry, 'l0-invalid', `l0 ${path}:${lineNoRaw} is not a 'tabi | round-<N> |' row`);
      return;
    }
    if (!ruling.text.includes(sibling)) {
      entry.status = 'pending';
      reason(entry, 'l0-invalid', `l0 ${path}:${lineNoRaw} does not name sibling=${JSON.stringify(sibling)}`);
      return;
    }
  }
  if (!banned) {
    if (rquad === '') reason(entry, 'ruling-quote-absent', 'ruling_quote is empty');
    else {
      quoteLength(entry, 'ruling_quote', rquad);
      if (!ruling.text.includes(rquad)) reason(entry, 'ruling-quote-absent', `ruling_quote not on ${token}@${commit}:${path}:${lineNoRaw}`);
      else if (disp === 'ruled' && !rquad.includes(sibling)) {
        reason(entry, 'ruling-quote-absent', `ruling_quote does not name sibling=${JSON.stringify(sibling)}`);
      }
    }
  }
  if (disp === 'ruled' && token === `${SELF_LANE}-shokunin`) {
    entry.notes.push('ruled self-venue row: the gate checks the author is not this lane and the line is byte-identical at REV');
  }
}

// ---------------------------------------------------------------------------
// screen row checks (candidate membership needs the frozen candidate list)

function checkScreenShape(entry, ctx) {
  const f = entry.fields;
  if (f.length !== 5) {
    reason(entry, 'screen-columns', `columns=${f.length} expected=5`);
    return null;
  }
  if (f.some((x) => isBanned(x))) reason(entry, 'field-control', 'a field carries a C0/C1 control, bidi override or zero-width code point');
  const [ref, why, surface, quote, note] = f;
  if (!SCREEN_REASONS.includes(why)) reason(entry, 'screen-reason-unknown', `reason=${JSON.stringify(why)}`);
  if (quote === '') reason(entry, 'screen-quote', 'quote is empty');
  else quoteLength(entry, 'quote', quote);
  entry.folded = null;
  return { ref, why, surface, quote, note };
}

function checkScreenCandidate(entry, ctx, shape) {
  if (shape === null) return;
  const { ref, why, surface, quote } = shape;
  if (ctx.candidates.list === null) {
    entry.status = 'pending';
    reason(entry, 'unverified-candidates', `candidate list unavailable (${ctx.candidates.why}); screen rows cannot be checked`);
    return;
  }
  const cand = ctx.candidates.byKey.get(ref);
  if (cand === undefined) {
    reason(entry, 'screen-not-candidate', `sibling_ref ${ref} is not a frozen candidate`);
    return;
  }
  entry.candidateId = `${cand.lane}\0${cand.text.trim()}`;
  entry.decision = `screen:${why}`;
  if (quote !== '' && !cand.text.includes(quote)) reason(entry, 'screen-quote', `quote not in candidate line ${ref}`);
  if (SCREEN_REASONS.includes(why)) {
    if (why === 'same-surface') {
      if (surface === '') reason(entry, 'screen-surface-unmapped', 'same-surface needs a surface name');
    } else if (surface !== '-') {
      reason(entry, 'screen-surface-not-dash', `reason ${why} requires surface '-', got ${JSON.stringify(surface)}`);
    }
  }
  entry.candidateRef = ref;
  entry.surface = surface;
}

// ---------------------------------------------------------------------------
// candidates (frozen definition, loaded from the lane's frozen counter)

async function loadCandidates(ctx, fallbackFile) {
  const counterPath = join(ctx.repo, COUNTER_PATH);
  if (existsSync(counterPath)) {
    try {
      const mod = await import(`${pathToFileURL(counterPath).href}?assemble=${Date.now()}`);
      if (typeof mod.candidates !== 'function') throw new Error('frozen counter exports no candidates()');
      const list = mod.candidates(ctx.fleet).map((c) => ({ key: c.key, lane: c.lane, line: c.line, text: c.text }));
      return {
        source: `frozen counter ${counterPath}`,
        list,
        byKey: new Map(list.map((c) => [c.key, c])),
        why: '',
      };
    } catch (e) {
      if (fallbackFile === null) {
        return { source: 'unavailable', list: null, byKey: new Map(), why: e.message };
      }
    }
  }
  if (fallbackFile === null) return { source: 'unavailable', list: null, byKey: new Map(), why: 'frozen counter not present' };
  if (!existsSync(fallbackFile)) throw new Refusal(`--candidates ${fallbackFile} does not exist`);
  const list = [];
  for (const line of readFileSync(fallbackFile, 'utf8').split('\n')) {
    if (line === '' || line.startsWith('#')) continue;
    const f = line.split('\t');
    if (f.length !== 2) throw new Refusal(`--candidates line is not 2 TAB columns: ${JSON.stringify(line)}`);
    const m = SIBLING_REF.exec(f[0].trim());
    if (m === null) throw new Refusal(`--candidates key is not a sibling_ref: ${JSON.stringify(f[0])}`);
    list.push({ key: f[0].trim(), lane: m[1], line: Number(m[4]), text: f[1] });
  }
  return { source: `file ${fallbackFile}`, list, byKey: new Map(list.map((c) => [c.key, c])), why: '' };
}

// ---------------------------------------------------------------------------
// merge

function parseBaseMap(text) {
  const rows = [];
  if (text === null) return { header: MAP_HEADER.join('\t'), rows, lines: [] };
  const ls = linesOf(text).filter((l, i, arr) => !(i === arr.length - 1 && l === ''));
  if (ls.length === 0 || ls[0] !== MAP_HEADER.join('\t')) {
    throw new Refusal(`${MAP_PATH} header at REV is not the 9-column schema; refusing to merge onto it`);
  }
  for (let i = 1; i < ls.length; i += 1) {
    const fields = ls[i].split('\t');
    rows.push({ lineNo: i + 1, line: ls[i], fields, id: `${BASE}:${i + 1}` });
  }
  return { header: ls[0], rows, lines: ls.slice(1) };
}

function parseBaseScreen(text) {
  if (text === null) return { rows: [], lines: [] };
  const ls = linesOf(text).filter((l, i, arr) => !(i === arr.length - 1 && l === ''));
  if (ls.length === 0 || ls[0] !== SCREEN_HEADER.join('\t')) {
    throw new Refusal(`${SCREEN_PATH} header at REV is not the 5-column screen schema; refusing to merge onto it`);
  }
  const rows = [];
  for (let i = 1; i < ls.length; i += 1) {
    const fields = ls[i].split('\t');
    rows.push({ lineNo: i + 1, line: ls[i], fields, id: `${BASE}:screen:${i + 1}` });
  }
  return { rows, lines: ls.slice(1) };
}

function baseCandidateIds(ctx, baseMapRows, baseScreenRows) {
  const ids = new Map(); // candidateId -> { decision, id }
  for (const row of baseMapRows) {
    const f = row.fields.map((x) => x.trim());
    if (f.length !== 9) continue;
    const sib = siblingLine(ctx, f[2], f[1]);
    if (sib.why || sib.text === null) continue;
    const id = `${sib.token}\0${sib.text.trim()}`;
    if (!ids.has(id)) ids.set(id, { decision: `map:${f[6]}`, id: row.id, disposition: f[6] });
  }
  for (const row of baseScreenRows) {
    const f = row.fields.map((x) => x.trim());
    if (f.length !== 5) continue;
    const cand = ctx.candidates.byKey.get(f[0]);
    if (cand === undefined) continue;
    const id = `${cand.lane}\0${cand.text.trim()}`;
    if (!ids.has(id)) ids.set(id, { decision: `screen:${f[1]}`, id: row.id });
  }
  return ids;
}

function merge(opts, ctx, drafts, entries, base) {
  const accepted = { map: [], screen: [] };
  const withheld = [];

  // Conflicts first: a disagreement must be reported as a disagreement, not as
  // a duplicate, so the L1 sees the real choice.
  const groups = new Map();
  for (const e of entries) {
    if (e.candidateId === null) continue;
    if (!groups.has(e.candidateId)) groups.set(e.candidateId, []);
    groups.get(e.candidateId).push(e);
  }
  for (const [candidateId, group] of groups) {
    const baseEntry = base.candidateIds.get(candidateId);
    const decisions = new Set(group.map((e) => e.decision));
    if (baseEntry !== undefined) {
      for (const e of group) {
        if (e.decision !== baseEntry.decision) {
          reason(e, 'conflict-base', `base row ${baseEntry.id} already decides this line as ${baseEntry.decision}`);
        } else {
          e.notes.push(`same candidate as base row ${baseEntry.id} (${baseEntry.decision}); new row must add a distinct surface`);
        }
      }
      if (decisions.size === 1) continue;
    }
    const draftDecisions = new Set(group.filter((e) => e.decision !== baseEntry?.decision).map((e) => e.decision));
    if (draftDecisions.size <= 1) continue;
    if (opts.prefer !== null && group.some((e) => e.draft === opts.prefer)) {
      const keep = group.find((e) => e.draft === opts.prefer).decision;
      for (const e of group) {
        if (e.decision !== keep && e.reasons.length === 0) {
          reason(e, 'conflict-loss', `--prefer ${opts.prefer} keeps ${keep}; this row says ${e.decision}`);
        }
      }
    } else {
      for (const e of group) {
        if (e.reasons.length === 0) {
          reason(e, 'conflict', `one candidate, decisions: ${[...new Set(group.map((x) => x.decision))].join(' vs ')} across drafts ${[...new Set(group.map((x) => x.draft))].join(', ')}`);
        }
      }
    }
  }

  // Duplicates: the gate's duplicate_row rule, extended to rows already on the
  // base map (append-only merge: base rows are never edited away).
  const foldedSeen = new Map();
  const pinSeen = new Map();
  for (const row of base.rows) {
    const f = row.fields.map((x) => x.trim());
    if (f.length !== 9) continue;
    const folded = `${foldSurface(f[0])} ${f[1]}`;
    if (!foldedSeen.has(folded)) foldedSeen.set(folded, row.id);
    const pin = pinKeyOf(f[2]);
    if (pin !== null && !pinSeen.has(pin)) pinSeen.set(pin, row.id);
  }
  const screenSeen = new Map();
  for (const row of base.screenRows) {
    const f = row.fields.map((x) => x.trim());
    if (f.length === 5 && !screenSeen.has(f[0])) screenSeen.set(f[0], row.id);
  }
  const verifiedSurfaces = new Set(foldedSeen.keys());

  for (const e of entries) {
    if (e.reasons.length > 0) continue;
    if (e.kind === 'map') {
      if (e.folded !== null && foldedSeen.has(e.folded)) {
        reason(e, 'duplicate-surface', `surface+sibling already on ${foldedSeen.get(e.folded)}`);
        continue;
      }
      if (e.pin !== null && pinSeen.has(e.pin)) {
        reason(e, 'duplicate-pin', `sibling pin ${e.pin} already cited by ${pinSeen.get(e.pin)}`);
        continue;
      }
      if (e.folded !== null) foldedSeen.set(e.folded, e.id);
      if (e.pin !== null) pinSeen.set(e.pin, e.id);
      // A newly accepted map row makes its surface real for same-surface rows.
      verifiedSurfaces.add(e.folded);
      accepted.map.push(e);
    } else {
      if (screenSeen.has(e.candidateRef)) {
        reason(e, 'screen-duplicate', `candidate ${e.candidateRef} already screened by ${screenSeen.get(e.candidateRef)}`);
        continue;
      }
      screenSeen.set(e.candidateRef, e.id);
      accepted.screen.push(e);
    }
  }

  // same-surface needs the final verified map surface set (base + accepted).
  for (const e of [...accepted.screen]) {
    const f = e.fields;
    const why = f[1];
    const surface = f[2];
    if (why !== 'same-surface') continue;
    const lane = ctx.candidates.byKey.get(e.candidateRef).lane;
    if (!verifiedSurfaces.has(`${foldSurface(surface)} ${lane}`)) {
      accepted.screen.splice(accepted.screen.indexOf(e), 1);
      reason(e, 'screen-surface-unmapped', `surface ${JSON.stringify(surface)} is not a verified map surface of ${lane}`);
    }
  }

  for (const e of entries) {
    if (!accepted.map.includes(e) && !accepted.screen.includes(e) && e.status === 'accept') e.status = 'withheld';
  }
  for (const e of entries) if (e.reasons.length > 0) withheld.push(e);
  return { accepted, withheld };
}

// ---------------------------------------------------------------------------
// writing + frozen instruments

function renderMap(base, acceptedMap) {
  const out = [base.header, ...base.lines];
  for (const e of acceptedMap) out.push(e.fields.map((x) => x.trim()).join('\t'));
  return `${out.join('\n')}\n`;
}

function renderScreen(base, acceptedScreen) {
  const out = [SCREEN_HEADER.join('\t'), ...base.screenLines];
  for (const e of acceptedScreen) out.push(e.fields.map((x) => x.trim()).join('\t'));
  return `${out.join('\n')}\n`;
}

function runGate(ctx, rev) {
  const r = spawnSync(process.execPath, [join(ctx.repo, GATE_PATH), '--repo', ctx.repo, '--fleet', ctx.fleet, '--at', rev, '--json'], {
    encoding: 'utf8',
    env: gitEnv(null),
    maxBuffer: 64 * 1024 * 1024,
  });
  let json = null;
  try { json = JSON.parse(r.stdout.trim().split('\n').pop()); } catch { /* reported below */ }
  return { exit: r.status, json, stderr: (r.stderr || '').trim() };
}

function runCounter(ctx, rev) {
  const counter = join(ctx.repo, COUNTER_PATH);
  if (!existsSync(counter)) return { exit: null, json: null, stderr: `counter absent from ${ctx.repo}` };
  const r = spawnSync(process.execPath, [counter, '--repo', ctx.repo, '--fleet', ctx.fleet, '--rev', rev, '--json'], {
    encoding: 'utf8',
    env: gitEnv(null),
    maxBuffer: 64 * 1024 * 1024,
  });
  let json = null;
  try { json = JSON.parse(r.stdout.trim().split('\n').pop()); } catch { /* reported below */ }
  return { exit: r.status, json, stderr: (r.stderr || '').trim() };
}

function commitMerged(clone, paths, ctx) {
  git(clone, ['add', '--', ...paths]);
  const message = [
    `round-33: merge C1 adjacency drafts (${ctx.counts.map} map row(s), ${ctx.counts.screen} screen row(s))`,
    '',
    `drafts: ${ctx.draftNames.join(', ')}`,
    `withheld: ${ctx.counts.withheld} row(s) (see assemble.mjs report)`,
    `tool: .ufo/waves/round-33/w1/ExecScreenTool/assemble.mjs`,
  ].join('\n');
  const r = spawnSync('git', [
    '-C', clone,
    '-c', 'user.name=ExecScreenTool',
    '-c', 'user.email=ExecScreenTool@scratch.local',
    'commit', '-q', '-m', message, '--', ...paths,
  ], { encoding: 'utf8', env: gitEnv(dirname(resolve(clone))) });
  if (r.status !== 0) throw new Refusal(`git commit in ${clone} failed (exit ${r.status}): ${(r.stderr || '').trim()}`);
  const head = git(clone, ['rev-parse', 'HEAD']).stdout.toString('utf8').trim();
  return head;
}

// ---------------------------------------------------------------------------
// reporting

function pad(s, w) {
  const t = String(s);
  return t.length >= w ? t : t + ' '.repeat(w - t.length);
}

function clip(s, w) {
  const t = String(s);
  return t.length <= w ? t : `${t.slice(0, Math.max(1, w - 2))}..`;
}

function table(entries, ctx) {
  const out = [];
  out.push(`${pad('ROW', 20)}${pad('STATUS', 10)}${pad('REASON', 23)}${pad('DECISION', 22)}${pad('SURFACE', 32)}${pad('SIBLING', 9)}PIN`);
  for (const e of entries) {
    const f = e.fields;
    const surface = e.kind === 'map' ? (f[0] || '-') : (f[2] || '-');
    const sibling = e.kind === 'map' ? (f[1] || '-') : (ctx.candidates.byKey.get(f[0])?.lane ?? '-');
    const pin = e.kind === 'map' ? (e.pin ?? '-') : (f[0] || '-');
    const why = e.reasons.length > 0 ? e.reasons[0].reason : '-';
    out.push(`${pad(clip(e.id, 18), 20)}${pad(e.status, 10)}${pad(clip(why, 21), 23)}${pad(clip(e.decision ?? '-', 20), 22)}${pad(clip(surface, 30), 32)}${pad(clip(sibling, 7), 9)}${pin}`);
    for (const r of e.reasons) out.push(`    ${r.reason}: ${r.detail}`);
    for (const n of e.notes) out.push(`    note: ${n}`);
  }
  return out.join('\n');
}

function candidateTable(entries, ctx) {
  const out = [];
  const touched = new Map();
  for (const e of entries) {
    if (e.candidateId === null) continue;
    if (!touched.has(e.candidateId)) touched.set(e.candidateId, []);
    touched.get(e.candidateId).push(e);
  }
  if (touched.size === 0) return 'CANDIDATE (none touched by drafts)';
  out.push('CANDIDATE (frozen keys touched by drafts)');
  for (const [id, group] of touched) {
    const [lane, text] = id.split('\0');
    const cand = ctx.candidates.list?.find((c) => c.lane === lane && c.text.trim() === text.trim());
    const key = cand ? cand.key : `${lane}: ${text.slice(0, 60)}`;
    const rows = group.map((e) => `${e.id}=${e.status}${e.reasons.length ? `(${e.reasons[0].reason})` : ''}`).join(' ');
    out.push(`  ${key}  ${rows}`);
  }
  return out.join('\n');
}

// ---------------------------------------------------------------------------
// main

async function main(argv) {
  const opts = parseArgs(argv);
  if (opts.help) {
    process.stdout.write(`${USAGE}\n`);
    return { code: 0 };
  }
  if (opts.repo === null) throw new Refusal('--repo is required');
  if (opts.rev === null) throw new Refusal('--rev is required');
  if (opts.out === null && opts.verify === null) throw new Refusal('one of --out or --verify is required');

  const repoReal = assertOwnToplevel(resolve(opts.repo), '--repo');
  const fleet = realpathSync(resolve(opts.fleet ?? dirname(repoReal)));
  const laneReal = (() => {
    const p = join(fleet, `${SELF_LANE}-shokunin`);
    return existsSync(p) ? realpathSync(p) : null;
  })();
  const insideLane = (p) => {
    if (laneReal === null) return false;
    const real = existsSync(p) ? realpathSync(p) : resolve(p);
    return real === laneReal || real.startsWith(`${laneReal}/`);
  };
  if (opts.verify !== null && insideLane(resolve(opts.verify))) {
    throw new Refusal(`--verify ${opts.verify} is the lane checkout; commits happen only in a scratch clone`);
  }
  if (opts.out !== null && insideLane(resolve(opts.out))) {
    throw new Refusal(`--out ${opts.out} is inside the lane checkout; the tool never writes the lane`);
  }

  const rev = resolveHexCommit(repoReal, opts.rev);
  const ctx = { repo: repoReal, fleet, rev, candidates: null };
  ctx.candidates = await loadCandidates(ctx, opts.candidates);

  const baseMap = parseBaseMap(blobAt(repoReal, rev, MAP_PATH));
  const baseScreen = parseBaseScreen(blobAt(repoReal, rev, SCREEN_PATH));
  const base = {
    header: baseMap.header,
    lines: baseMap.lines,
    rows: baseMap.rows,
    screenRows: baseScreen.rows,
    screenLines: baseScreen.lines,
  };
  base.candidateIds = baseCandidateIds(ctx, baseMap.rows, baseScreen.rows);

  const drafts = readDrafts(opts.drafts);
  if (opts.prefer !== null && !drafts.some((d) => d.name === opts.prefer)) {
    throw new Refusal(`--prefer ${opts.prefer} is not one of the drafts (${drafts.map((d) => d.name).join(', ')}); an unknown name would silently leave every conflict withheld`);
  }
  const l0 = readL0(opts.l0);

  const entries = [];
  for (const d of drafts) {
    if (d.mapPart) for (const r of d.mapPart) {
      const e = makeEntry({ draft: d.name, rowNo: r.rowNo, kind: 'map', fields: r.line.split('\t') });
      checkMapEntry(e, ctx, l0);
      entries.push(e);
    }
    if (d.screenPart) for (const r of d.screenPart) {
      const e = makeEntry({ draft: d.name, rowNo: r.rowNo, kind: 'screen', fields: r.line.split('\t') });
      e.id = `${d.name}:screen:${r.rowNo}`;
      const shape = checkScreenShape(e, ctx);
      if (shape !== null) checkScreenCandidate(e, ctx, shape);
      entries.push(e);
    }
  }

  const merged = merge(opts, ctx, drafts, entries, { ...base, candidateIds: base.candidateIds });
  const mergedMap = renderMap(base, merged.accepted.map);
  const mergedScreen = (base.screenLines.length > 0 || merged.accepted.screen.length > 0)
    ? renderScreen(base, merged.accepted.screen)
    : null;

  const counts = {
    drafts: drafts.length,
    map: merged.accepted.map.length,
    screen: merged.accepted.screen.length,
    withheld: merged.withheld.length,
    pending: entries.filter((e) => e.status === 'pending').length,
  };
  const draftNames = drafts.map((d) => d.name);
  const result = {
    schema: SCHEMA,
    lane: repoReal,
    fleet,
    rev,
    drafts: draftNames,
    counts,
    candidates: { source: ctx.candidates.source, count: ctx.candidates.list?.length ?? 0, why: ctx.candidates.why },
    outputs: {},
  };

  if (opts.out !== null) {
    const outRoot = resolve(opts.out);
    mkdirSync(join(outRoot, 'corpus'), { recursive: true });
    writeFileSync(join(outRoot, MAP_PATH), mergedMap);
    if (mergedScreen !== null) writeFileSync(join(outRoot, SCREEN_PATH), mergedScreen);
    result.outputs.map = join(outRoot, MAP_PATH);
    result.outputs.screen = mergedScreen === null ? null : join(outRoot, SCREEN_PATH);
  }

  let verify = null;
  if (opts.verify !== null) {
    const cloneReal = assertOwnToplevel(resolve(opts.verify), '--verify');
    const head = git(cloneReal, ['rev-parse', 'HEAD']).stdout.toString('utf8').trim();
    if (head !== rev) {
      throw new Refusal(`--verify ${cloneReal} is at ${head}, not at --rev ${rev}; check it out first (the merge base and the commit must agree)`);
    }
    writeFileSync(join(cloneReal, MAP_PATH), mergedMap);
    if (mergedScreen !== null) writeFileSync(join(cloneReal, SCREEN_PATH), mergedScreen);
    const paths = [MAP_PATH];
    if (mergedScreen !== null) paths.push(SCREEN_PATH);
    const changed = !gitOk(cloneReal, ['diff', '--quiet', rev, '--', ...paths]);
    let newRev = rev;
    let committed = false;
    if (changed) {
      newRev = commitMerged(cloneReal, paths, { counts, draftNames });
      committed = true;
    }
    const gate = runGate({ ...ctx, repo: cloneReal }, newRev);
    const counter = runCounter({ ...ctx, repo: cloneReal }, newRev);
    verify = {
      clone: cloneReal,
      baseRev: rev,
      rev: newRev,
      committed,
      gate,
      counter,
    };
    // Map a gate row number back to the row that produced it: base rows keep
    // their line numbers (append-only), new rows follow in merge order.
    const lineToId = new Map();
    for (const row of base.rows) lineToId.set(row.lineNo, row.id);
    let nextLine = base.rows.length + 1;
    for (const e of merged.accepted.map) {
      nextLine += 1;
      lineToId.set(nextLine, e.id);
    }
    verify.lineToId = Object.fromEntries(lineToId);
    result.outputs.rev = newRev;
    result.outputs.committed = committed;
  }
  result.entries = entries.map((e) => ({
    id: e.id,
    draft: e.draft,
    kind: e.kind,
    status: e.status,
    reasons: e.reasons,
    notes: e.notes,
    pin: e.pin,
    candidate: e.candidateRef ?? null,
    decision: e.decision,
  }));

  const gateClean = verify === null ? null : verify.gate.json?.verdict === 'clean';
  const predicate = verify === null ? null : verify.counter.json?.predicate === true;
  const problems = merged.withheld.length > 0
    || (verify !== null && !gateClean)
    || (verify !== null && !predicate);
  const code = problems ? 1 : 0;
  result.exit = code;

  if (opts.json) {
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } else {
    const out = [];
    out.push(`ASSEMBLE schema=${SCHEMA} rev=${rev} drafts=${counts.drafts} candidates=${ctx.candidates.list?.length ?? 0} (${ctx.candidates.source})`);
    out.push(`MAP base=${base.rows.length} new=${counts.map} total=${base.rows.length + counts.map}`);
    out.push(`SCREEN base=${base.screenRows.length} new=${counts.screen}${mergedScreen === null ? ' (no screen ledger written)' : ''}`);
    out.push('');
    out.push(table(entries, ctx));
    out.push('');
    out.push(candidateTable(entries, ctx));
    if (verify !== null) {
      out.push('');
      const g = verify.gate;
      out.push(`GATE verdict=${g.json?.verdict ?? 'could-not-evaluate'} rows=${g.json?.rows ?? '-'} verified=${g.json?.verified ?? '-'} findings=${g.json?.findings?.length ?? '-'} exit=${g.exit}`);
      for (const f of g.json?.findings ?? []) {
        const id = verify.lineToId[f.row] ?? (f.row === undefined || f.row === null ? '-' : `line ${f.row}`);
        out.push(`  finding row=${f.row} draft_row=${id} reason=${f.reason} detail=${f.detail}`);
      }
      if (g.json === null) out.push(`  gate stderr: ${g.stderr}`);
      const c = verify.counter;
      const j = c.json;
      if (j === null) {
        out.push(`COUNTER could-not-evaluate exit=${c.exit} ${c.stderr}`);
      } else {
        out.push(`COUNTER predicate=${j.predicate ? 'met' : 'not-met'} adjacency=${j.adjacency?.verdict} candidates=${j.candidates} mapped=${j.mapped} screened=${j.screened} unaccounted=${j.unaccounted} newMapped=${j.newMapped} screenFindings=${(j.screenFindings ?? []).length} exit=${c.exit}`);
        for (const r of j.newMappedRows ?? []) out.push(`  newMapped row=${r.row} surface=${r.surface} sibling=${r.sibling} disposition=${r.disposition}`);
        for (const f of j.screenFindings ?? []) out.push(`  screenFinding row=${f.row} reason=${f.reason} detail=${f.detail ?? ''}`);
        for (const k of j.unaccountedKeys ?? []) out.push(`  UNACCOUNTED ${k}`);
      }
      out.push(`COMMIT ${verify.committed ? `made ${verify.rev}` : `not needed (merged bytes equal ${rev})`}`);
    }
    out.push('');
    out.push(`SUMMARY accepted=${counts.map + counts.screen} withheld=${counts.withheld} pending=${counts.pending} exit=${code}`);
    process.stdout.write(`${out.join('\n')}\n`);
  }
  return { code };
}

const USAGE = `assemble.mjs — round-33 C1 draft merger + verifier (tabi-shokunin)

node assemble.mjs --repo <lane|clone> --rev <40-hex> --draft <dir> [--draft <dir> ...]
     [--fleet <dir>] [--l0 <file>] [--out <dir>] [--verify <clone>]
     [--prefer <draft>] [--candidates <file>] [--json]

  --repo      repository holding corpus/adjacency.tsv at --rev (must be a git toplevel)
  --rev       40-hex merge base; the tabi side of every quote is read here
  --draft     dir with rows.tsv (9 TAB cols) and/or screen.tsv (5 TAB cols), headerless
  --fleet     sibling lane parent directory (default: parent of --repo)
  --l0        TAB file: <draft>:<rowNo> | pin:<sibling_ref> | <sibling_ref>, then
              fleet@<40hex>:.ufo/l0-questions.md:<line>, then quote
  --out       write <out>/corpus/adjacency.tsv and adjacency-screen.tsv
  --verify    scratch clone: write, commit, then run check-adjacency + C1 counter
  --prefer    draft that wins a cross-draft conflict (default: report and withhold)
  --candidates  frozen candidate list as key<TAB>text, used only when the frozen
              counter cannot enumerate candidates from --fleet

Exit: 0 merged clean; 1 withheld rows / gate findings / predicate not met;
2 could not evaluate.`;

function parseArgs(argv) {
  const o = { repo: null, rev: null, fleet: null, drafts: [], l0: null, out: null, verify: null, prefer: null, candidates: null, json: false, help: false };
  const take = (i, a) => {
    const v = argv[i];
    if (v === undefined) throw new Refusal(`missing value for ${a}`);
    return v;
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--repo') o.repo = take(++i, a);
    else if (a === '--rev') o.rev = take(++i, a);
    else if (a === '--fleet') o.fleet = take(++i, a);
    else if (a === '--draft') o.drafts.push(take(++i, a));
    else if (a === '--l0') o.l0 = take(++i, a);
    else if (a === '--out') o.out = take(++i, a);
    else if (a === '--verify') o.verify = take(++i, a);
    else if (a === '--prefer') o.prefer = take(++i, a);
    else if (a === '--candidates') o.candidates = take(++i, a);
    else if (a === '--json') o.json = true;
    else if (a === '--help' || a === '-h') o.help = true;
    else throw new Refusal(`unknown argument ${a}`);
  }
  return o;
}

try {
  const { code } = await main(process.argv.slice(2));
  process.exit(code);
} catch (e) {
  if (e instanceof Refusal) {
    process.stderr.write(`ASSEMBLE verdict=could-not-evaluate detail=${e.message}\n`);
    process.exit(2);
  }
  throw e;
}
