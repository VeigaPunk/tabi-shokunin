#!/usr/bin/env node
// c1-wide-screen-r60.mjs — tabi round 60, claim C1 (adjacency — the lowest owned
// axis, score 8). The WIDE generation of the adjacency screen: it enumerates
// every tracked blob whose path ends in .md in each of the 20 roster sibling
// lanes AT THE HEADS RECORDED IN THE FROZEN SNAPSHOT, and screens every one of
// them for the frozen browser-ground vocabulary. Round 59's v19 meter screened
// only PROVINCE.md plus the files the adjacency map references (lesson round-59
// Mistakes 12: 18,869 browser-ground-word lines in sibling .md files outside
// that screen, R59Reviewer A6). This generation removes that scope gap.
//
// Authority: .ufo/waves/round-60/claims.json C1. This counter is authored in
// wave w1 and committed at the instrument FREEZE commit before the live data
// pass. It never amends a predicate after data.
//
// WHAT IT MEASURES (per lane at its snapshot head):
//   * enumeratedMd — blobs whose path ends in the three bytes ".md" in
//     `git ls-tree -r -z --long <head>` (the path set is identical to
//     `--name-only`; --long adds mode/type/size so symlink entries are
//     identified and batch reads are chunked by size). Gitlinks (type
//     "commit", e.g. submodule entries) are not blobs and are not enumerated.
//   * screenedMd — enumerated files whose bytes were read and re-derived.
//     screenedMd and unscreenedMd are always relative to the .md enumeration,
//     so screenedMd == enumeratedMd is the K3/K6-wide condition.
//   * the browser-ground hit lines (v19's BG_WORDS, verbatim below) in the
//     screened bytes, counted as wideHitLines (hit lines) and wideHitFiles
//     (files with >= 1 hit line). The claim reports them as these counts and
//     does NOT adjudicate them (named residual).
//
// READ DISCIPLINE (unchanged from v19, and the M3 kill):
//   Every byte is read from the recorded snapshot head:
//     git -C <fleet>/<lane> cat-file blob <head>:<path>
//   (batched as `cat-file --batch` with one "<head>:<path>" line per file; a
//   path containing CR/LF falls back to a single argument-vector `cat-file
//   blob` call). The working tree is NEVER read and no checkout is performed:
//   a fixture whose worktree differs from its head must still report the head
//   bytes (selftest case worktree-differs-from-head, mutant M3).
//   A symlink entry named *.md IS enumerated when git lists it; the screened
//   bytes are the blob git stores for that path (the link target string), and
//   the link is never followed — so one path yields exactly one row.
//   A head that `git cat-file -t <head>` does not resolve to a commit is
//   counted in unresolvableHead and the predicate is false (mutant M4); it is
//   never silently treated as zero files.
//
// HASH / LINE / HIT CONVENTIONS (stated so a reviewer can re-derive by hand):
//   * sha256 is computed over the RAW blob bytes (no UTF-8 round trip), matching
//     the r56 raw-byte sha discipline; for valid UTF-8 blobs this equals the sha
//     of the decoded text used by v19.
//   * line count = number of LF bytes, plus 1 when the final line is
//     unterminated (the blob does not end in LF). An empty blob is one empty
//     unterminated line, i.e. 1. This is exactly v19's
//     `text.replace(/\n$/, '').split('\n').length`.
//   * a line is a hit when its lowercase text (one trailing CR stripped, v19's
//     CRLF tolerance) contains any BG word as a substring; a line with two
//     words still counts once; bgHits is the number of hit lines.
//
// ROWS RECEIPT (--rows-out / --verify-rows, the K4 surface):
//   One TSV row per screened file: lane, path, sha256, lines, bgHits. The lane
//   and path fields are echoed in a reversible escape (backslash first, then
//   TAB/LF/CR as \\t/\\n/\\r) because a tracked .md path in the frozen snapshot
//   contains an embedded newline; --verify-rows decodes before re-deriving, so
//   no screened file is silently dropped from the receipt.
//
// MAP SCOPE (the do-nothing control) mirrors v19's derivation EXACTLY:
//   v19 verify() (d) initialises every roster lane's screen set with
//   PROVINCE.md and then, for each corpus/adjacency.tsv data row, parses its
//   sibling_ref as <lane>@<rev>:<path>:<line> (path = between the first ':''
//   after the rev and the final ':') and adds parsed.path to the set of the
//   roster lane it names; the ref's own rev is ignored because the sibling's
//   snapshot head is the byte authority. That is:
//     for each roster lane: screenTargets = { PROVINCE.md }
//     for each 9-column map row with a parseable col-3 ref naming a roster
//       lane: screenTargets[that lane].add(ref.path)
//   Scope=map screens enumerated .md files in that per-lane set only, which is
//   why on the frozen snapshot screenedMd < enumeratedMd and the do-nothing
//   control is red. The map bytes are read at the frozen round-60 map commit
//   (67d6f70e, where the claims were frozen) unless --map-file/--map-rev/
//   --map-repo override them (selftest fixtures). Paths the map references that
//   do not end in .md are outside this wide universe; the v19 meter still
//   screens them.
//
// PREDICATE (claims.json C1; one expression for both scopes):
//   scope=wide: counts.screenedMd == counts.enumeratedMd
//     AND counts.unscreenedMd == 0
//     AND counts.unresolvableHead == 0
//     AND counts.roster == 20
//     AND counts.rowMismatch == 0
//   scope=map: the same expression, EXPECTED FALSE (unscreenedMd > 0).
//   rowMismatch is 0 when --verify-rows is absent (no rows to falsify) and
//   otherwise counts every supplied row whose blob sha256, line count or hit
//   count does not re-derive at the snapshot head, whose path is not in the
//   lane's .md enumeration, or whose lane is not in the snapshot.
//
// MUTANT KILLS (claims.json mutantsC1; selftest case names in parentheses):
//   M1 enumerate top-level .md only             -> wide-green-25, nested-md-screened
//   M2 trust a stale hit count                  -> forged-row-sha/lines/hits
//   M3 read the working tree instead of the head-> worktree-differs-from-head
//   M4 unresolvable head treated as zero files  -> unresolvable-head-refused
//   M5 default the scope to map                 -> missing-scope-exits-2 (plus
//      the data-run command passes --scope wide explicitly)
//
// Usage:
//   node c1-wide-screen-r60.mjs --scope wide|map --snapshot <tsv>
//        [--fleet <root>] [--verify-rows <tsv>] [--rows-out <tsv>] [--json]
//        [--map-file <tsv>] [--map-rev <rev>] [--map-repo <dir>]
//   node c1-wide-screen-r60.mjs --selftest
// Exit: 0 predicate true; 1 evaluated, predicate false; 2 could not evaluate
// (missing/invalid --scope, bad snapshot header, unreadable snapshot/map, bad
// fixture path, unreadable rows file). Missing --scope is exit 2, never a
// default: the round-59 map scope is the do-nothing control, not a fallback.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCHEMA = 'tabi-r60-c1-wide-screen-v1';
const MAP_REL = 'corpus/adjacency.tsv';
const MAP_REV = '67d6f70e';
const PROVINCE_REL = 'PROVINCE.md';
const EXPECTED_ROSTER = 20;
// v19 c1-adjacency-host-v19.mjs line 83, copied verbatim; never edited here.
const BG_WORDS = ['cdp', 'devtools', 'remote-debugging', 'headless', 'webdriver', 'geckodriver', 'selenium', 'playwright', 'bidi', 'crawl', 'screenshot', 'recordhar', 'record-har'];
const CHUNK_BYTES = 48 * 1024 * 1024;
const CHUNK_COUNT = 800;
const MAXBUF = 192 * 1024 * 1024;

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

function die(msg) {
  fs.writeSync(2, `c1-wide-screen-r60: ${msg}\n`);
  process.exit(2);
}

// The lane root is four levels up from this file:
// <lane>/.ufo/waves/round-60/counters/c1-wide-screen-r60.mjs
function laneRoot() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
}

// v19 parseRef, copied verbatim (r59 declared change (c) hardening): the
// <lane>@<rev>:<path>:<line> suffix must be an all-digit positive safe integer.
function parseRef(ref) {
  if (typeof ref !== 'string') return null;
  const at = ref.indexOf('@');
  if (at === -1) return null;
  const lane = ref.slice(0, at);
  const c1 = ref.indexOf(':', at);
  const c2 = ref.lastIndexOf(':');
  if (c1 === -1 || c2 <= c1) return null;
  const p = ref.slice(c1 + 1, c2);
  const suffix = ref.slice(c2 + 1);
  if (!/^\d+$/.test(suffix)) return null;
  const ln = Number(suffix);
  if (!Number.isSafeInteger(ln) || ln < 1) return null;
  return { lane, rev: ref.slice(at + 1, c1), path: p, line: ln };
}

// TSV field escaping for the rows receipt. The frozen snapshot contains at
// least one tracked .md path with an embedded newline
// (kake-shokunin .ufo/waves/round-26/assimilation/validate/tests/vault/
// vadv54-run/r/nl/first<LF>second.md), so a raw TSV row cannot represent every
// screened file. Lane and path fields are escaped reversibly (backslash first,
// then TAB/LF/CR) and --verify-rows decodes before re-deriving; every screened
// file therefore keeps exactly one row and no file is dropped from the receipt.
const escField = (s) => s.replace(/\\/g, '\\\\').replace(/\t/g, '\\t').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
const unescField = (s) => s.replace(/\\([\\tnr])/g, (m, c) => (c === '\\' ? '\\' : c === 't' ? '\t' : c === 'n' ? '\n' : '\r'));

function splitNul(buf) {
  const out = [];
  let start = 0;
  for (;;) {
    const i = buf.indexOf(0, start);
    if (i === -1) {
      if (start < buf.length) out.push(buf.subarray(start));
      break;
    }
    out.push(buf.subarray(start, i));
    start = i + 1;
  }
  return out;
}

// Snapshot TSV: header "lane<TAB>head" then one row per roster lane. A bad
// header, an empty/duplicate lane or a malformed row is exit 2 — the roster is
// the byte authority and a silently re-interpreted snapshot would move the data.
function parseSnapshot(raw, label) {
  const lines = raw.toString('utf8').split('\n').map((l) => l.replace(/\r$/, ''));
  while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
  if (lines.length === 0) die(`snapshot ${label} is empty`);
  const header = lines[0].split('\t');
  if (header.length !== 2 || header[0] !== 'lane' || header[1] !== 'head') {
    die(`bad snapshot header in ${label}: ${JSON.stringify(lines[0])} (expected "lane\\thead")`);
  }
  const rows = [];
  const seen = new Set();
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('\t');
    if (parts.length !== 2 || parts[0] === '' || parts[1] === '') {
      die(`bad snapshot row ${i + 1} in ${label}: ${JSON.stringify(lines[i])}`);
    }
    const lane = parts[0];
    if (!/^[A-Za-z0-9._-]+$/.test(lane) || lane === '.' || lane === '..') {
      die(`snapshot lane ${JSON.stringify(lane)} is not a plain lane directory name`);
    }
    if (seen.has(lane)) die(`duplicate lane in snapshot: ${lane}`);
    seen.add(lane);
    rows.push({ lane, head: parts[1] });
  }
  if (rows.length === 0) die(`snapshot ${label} has no lane rows`);
  return rows;
}

function headIsCommit(repo, head) {
  const r = spawnSync('git', ['-C', repo, 'cat-file', '-t', head], { maxBuffer: 4 * 1024 * 1024 });
  return r.status === 0 && r.stdout.toString('utf8').trim() === 'commit';
}

// Enumeration: `git ls-tree -r -z --long <head>`, blobs whose path ends in the
// three bytes ".md". Parsing the raw NUL records keeps spaces and non-ASCII
// path bytes intact.
function enumerateMd(repo, head) {
  const r = spawnSync('git', ['-C', repo, 'ls-tree', '-r', '-z', '--long', head], { maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0) return { error: r.stderr.toString('utf8').trim() || `ls-tree exit ${r.status}` };
  const entries = [];
  for (const rec of splitNul(r.stdout)) {
    if (rec.length === 0) continue;
    const tab = rec.indexOf(0x09);
    if (tab === -1) return { error: 'ls-tree record without TAB' };
    const meta = rec.toString('utf8', 0, tab).split(/\s+/).filter(Boolean);
    if (meta.length !== 4) return { error: `ls-tree meta: ${JSON.stringify(rec.toString('utf8', 0, tab))}` };
    const [mode, type, oid, sizeRaw] = meta;
    const pathBuf = rec.subarray(tab + 1);
    const isMd = pathBuf.length >= 3
      && pathBuf[pathBuf.length - 3] === 0x2e
      && pathBuf[pathBuf.length - 2] === 0x6d
      && pathBuf[pathBuf.length - 1] === 0x64;
    if (!isMd) continue;
    if (type !== 'blob') continue; // gitlinks are not blobs and carry no .md bytes
    entries.push({ path: pathBuf.toString('utf8'), mode, oid, size: Number(sizeRaw) });
  }
  return { entries };
}

// Line/hit metrics over the raw blob bytes, conventions stated in the header.
function lineMetrics(bytes) {
  const text = bytes.toString('utf8');
  const trimmed = text.endsWith('\n') ? text.slice(0, -1) : text;
  const lines = trimmed.split('\n');
  let bgHits = 0;
  for (const raw of lines) {
    const low = (raw.endsWith('\r') ? raw.slice(0, -1) : raw).toLowerCase();
    for (const w of BG_WORDS) {
      if (low.includes(w)) { bgHits++; break; }
    }
  }
  return { sha256: sha256(bytes), lines: lines.length, bgHits };
}

// Read a set of enumerated entries through `git cat-file --batch` at the
// recorded head and return path -> {sha256, lines, bgHits} or {error}. Chunked
// by count and by ls-tree size so peak memory stays bounded; the ls-tree oid is
// cross-checked against the batch header (a mismatch is an error, never a pass).
function batchMetrics(repo, head, entries) {
  const out = new Map();
  const safe = [];
  const unsafe = [];
  for (const e of entries) {
    if (e.path.includes('\n') || e.path.includes('\r')) unsafe.push(e);
    else safe.push(e);
  }
  let chunk = [];
  let bytes = 0;
  const flush = () => {
    if (chunk.length === 0) return;
    const input = chunk.map((e) => `${head}:${e.path}`).join('\n') + '\n';
    const r = spawnSync('git', ['-C', repo, 'cat-file', '--batch'], { input, maxBuffer: MAXBUF });
    if (r.status !== 0) {
      const msg = r.stderr.toString('utf8').trim() || `exit ${r.status}`;
      for (const e of chunk) out.set(e.path, { error: `cat-file --batch failed: ${msg}` });
      chunk = [];
      bytes = 0;
      return;
    }
    const buf = r.stdout;
    let pos = 0;
    for (const e of chunk) {
      const nl = buf.indexOf(0x0a, pos);
      if (nl === -1) { out.set(e.path, { error: 'batch stream truncated' }); continue; }
      const header = buf.toString('utf8', pos, nl);
      if (header.endsWith(' missing')) { out.set(e.path, { error: `blob missing at ${head}:${e.path}` }); pos = nl + 1; continue; }
      const s1 = header.indexOf(' ');
      const s2 = s1 === -1 ? -1 : header.indexOf(' ', s1 + 1);
      const oid = s1 === -1 ? '' : header.slice(0, s1);
      const type = s2 === -1 ? '' : header.slice(s1 + 1, s2);
      const size = s2 === -1 ? NaN : Number(header.slice(s2 + 1));
      if (type !== 'blob' || !Number.isSafeInteger(size) || size < 0) {
        out.set(e.path, { error: `batch header: ${header}` });
        pos = nl + 1;
        continue;
      }
      const start = nl + 1;
      const end = start + size;
      if (end + 1 > buf.length) { out.set(e.path, { error: 'batch payload truncated' }); pos = buf.length; continue; }
      if (buf[end] !== 0x0a) { out.set(e.path, { error: 'batch record not LF-terminated' }); pos = end; continue; }
      if (oid !== e.oid) { out.set(e.path, { error: `ls-tree/batch oid mismatch ${e.oid} != ${oid}` }); pos = end + 1; continue; }
      out.set(e.path, lineMetrics(buf.subarray(start, end)));
      pos = end + 1;
    }
    chunk = [];
    bytes = 0;
  };
  for (const e of safe) {
    if (chunk.length >= CHUNK_COUNT || (bytes > 0 && bytes + e.size > CHUNK_BYTES)) flush();
    chunk.push(e);
    bytes += e.size;
  }
  flush();
  // Paths that cannot travel through a line-oriented protocol are read one at a
  // time; the argv vector is delimiter-proof.
  for (const e of unsafe) {
    const r = spawnSync('git', ['-C', repo, 'cat-file', 'blob', `${head}:${e.path}`], { maxBuffer: MAXBUF });
    if (r.status !== 0) { out.set(e.path, { error: `cat-file blob failed for ${JSON.stringify(e.path)}` }); continue; }
    const oidR = spawnSync('git', ['-C', repo, 'rev-parse', `${head}:${e.path}`], { maxBuffer: 4 * 1024 * 1024 });
    const oid = oidR.status === 0 ? oidR.stdout.toString('utf8').trim() : null;
    if (oid !== e.oid) { out.set(e.path, { error: `ls-tree/rev-parse oid mismatch for ${JSON.stringify(e.path)}` }); continue; }
    out.set(e.path, lineMetrics(r.stdout));
  }
  return out;
}

function mapBytes(opts) {
  if (opts.mapFile) {
    const p = path.resolve(opts.mapFile);
    try {
      return { kind: 'file', detail: p, bytes: fs.readFileSync(p) };
    } catch (e) {
      die(`cannot read --map-file ${p}: ${e.message}`);
    }
  }
  const repo = opts.mapRepo ? path.resolve(opts.mapRepo) : laneRoot();
  const rev = opts.mapRev || MAP_REV;
  const r = spawnSync('git', ['-C', repo, 'show', `${rev}:${MAP_REL}`], { maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) die(`cannot read ${MAP_REL} at ${rev} in ${repo}: ${r.stderr.toString('utf8').trim()}`);
  return { kind: 'git', detail: `git -C ${repo} show ${rev}:${MAP_REL}`, bytes: r.stdout, rev };
}

// v19 verify() (d), mirrored: every roster lane starts with PROVINCE.md; every
// 9-column map row whose col-3 ref parses and names a roster lane adds its path.
function mapScreenTargets(bytes, lanes) {
  const targets = new Map(lanes.map((l) => [l, new Set([PROVINCE_REL])]));
  const lines = bytes.toString('utf8').split('\n').map((l) => l.replace(/\r$/, ''));
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '') continue;
    const parts = lines[i].split('\t');
    if (parts.length !== 9) continue; // v19 tsvParse drops non-9-column rows
    const parsed = parseRef(parts[2]);
    if (!parsed) continue;            // v19 records map-ref-unparseable; not a target
    if (!targets.has(parsed.lane)) continue;
    targets.get(parsed.lane).add(parsed.path);
  }
  return targets;
}

function predicateOf(counts) {
  return counts.screenedMd === counts.enumeratedMd
    && counts.unscreenedMd === 0
    && counts.unresolvableHead === 0
    && counts.roster === EXPECTED_ROSTER
    && counts.rowMismatch === 0;
}

function parseJsonOrNull(s) {
  try { return JSON.parse(s); } catch { return null; }
}

function run(opts) {
  const fleet = path.resolve(opts.fleet || path.dirname(laneRoot()));
  if (!fs.existsSync(fleet)) die(`fleet root not found: ${fleet}`);
  const snapshotPath = path.resolve(opts.snapshot);
  let snapRaw;
  try {
    snapRaw = fs.readFileSync(snapshotPath);
  } catch (e) {
    die(`cannot read snapshot ${snapshotPath}: ${e.message}`);
  }
  const snapshotSha256 = sha256(snapRaw);
  const snapshotRows = parseSnapshot(snapRaw, snapshotPath);

  let mapSource = null;
  let mapTargets = null;
  if (opts.scope === 'map') {
    const m = mapBytes(opts);
    mapSource = { kind: m.kind, detail: m.detail, sha256: sha256(m.bytes) };
    mapTargets = mapScreenTargets(m.bytes, snapshotRows.map((r) => r.lane));
  }

  const counts = {
    roster: snapshotRows.length,
    enumeratedMd: 0,
    screenedMd: 0,
    unscreenedMd: 0,
    rowMismatch: 0,
    unresolvableHead: 0,
    wideHitLines: 0,
    wideHitFiles: 0,
    // honest extras (advisory; not part of the frozen predicate except rowMismatch)
    blobReadErrors: 0,
    rowsChecked: 0,
    rowsMissing: 0,
    rowsDuplicate: 0,
    rowsUnknownLane: 0,
  };
  const perLane = [];
  const enumByLane = new Map(); // lane -> { byPath: Map(path -> entry) }
  const metricCache = new Map(); // "lane\tpath" -> metrics
  const screenedRows = [];       // [lane, path, sha256, lines, bgHits]
  const screenedKeys = new Set();

  for (const { lane, head } of snapshotRows) {
    const repo = path.join(fleet, lane);
    const row = {
      lane,
      head,
      headResolvable: false,
      enumeratedMd: 0,
      screenedMd: 0,
      unscreenedMd: 0,
      wideHitFiles: 0,
      wideHitLines: 0,
      blobReadErrors: 0,
      unscreenedSample: [],
    };
    perLane.push(row);
    if (!headIsCommit(repo, head)) {
      counts.unresolvableHead++;
      continue;
    }
    row.headResolvable = true;
    const enumRes = enumerateMd(repo, head);
    if (enumRes.error) die(`cannot enumerate ${lane}@${head}: ${enumRes.error}`);
    const entries = enumRes.entries;
    const byPath = new Map(entries.map((e) => [e.path, e]));
    enumByLane.set(lane, { byPath });
    row.enumeratedMd = entries.length;
    counts.enumeratedMd += entries.length;

    const targets = opts.scope === 'wide'
      ? entries
      : entries.filter((e) => mapTargets.get(lane).has(e.path));
    const metrics = batchMetrics(repo, head, targets);
    const targetSet = new Set(targets.map((e) => e.path));
    for (const e of targets) {
      const m = metrics.get(e.path);
      if (!m || m.error) {
        row.blobReadErrors++;
        counts.blobReadErrors++;
        continue;
      }
      row.screenedMd++;
      counts.screenedMd++;
      if (m.bgHits > 0) {
        row.wideHitFiles++;
        row.wideHitLines += m.bgHits;
      }
      metricCache.set(`${lane}\t${e.path}`, m);
      screenedRows.push([lane, e.path, m.sha256, m.lines, m.bgHits]);
      screenedKeys.add(`${lane}\t${e.path}`);
    }
    for (const e of entries) {
      if (targetSet.has(e.path) && !(metrics.get(e.path) && !metrics.get(e.path).error)) {
        if (row.unscreenedSample.length < 5) row.unscreenedSample.push(e.path);
      } else if (!targetSet.has(e.path)) {
        if (row.unscreenedSample.length < 5) row.unscreenedSample.push(e.path);
      }
    }
    row.unscreenedMd = row.enumeratedMd - row.screenedMd;
    counts.unscreenedMd += row.unscreenedMd;
    counts.wideHitFiles += row.wideHitFiles;
    counts.wideHitLines += row.wideHitLines;
  }

  // --- optional rows receipt (one row per screened file, K3/K4 surface) -------
  if (opts.rowsOut) {
    const outPath = path.resolve(opts.rowsOut);
    const lines = ['lane\tpath\tsha256\tlines\tbgHits'];
    for (const r of screenedRows) {
      lines.push([escField(r[0]), escField(r[1]), r[2], r[3], r[4]].join('\t'));
    }
    try {
      fs.writeFileSync(outPath, lines.join('\n') + '\n');
    } catch (e) {
      die(`cannot write --rows-out ${outPath}: ${e.message}`);
    }
  }

  // --- optional K4 check: re-derive every supplied row at the snapshot head ---
  let rowsVerification = null;
  if (opts.verifyRows) {
    const verifyPath = path.resolve(opts.verifyRows);
    let raw;
    try {
      raw = fs.readFileSync(verifyPath);
    } catch (e) {
      die(`cannot read --verify-rows ${verifyPath}: ${e.message}`);
    }
    const lines = raw.toString('utf8').split('\n').map((l) => l.replace(/\r$/, ''));
    const rows = [];
    let headerSeen = false;
    for (const line of lines) {
      if (line === '') continue;
      const parts = line.split('\t');
      if (!headerSeen) {
        headerSeen = true;
        if (parts.length === 5 && parts[0] === 'lane' && parts[1] === 'path') continue;
      }
      if (parts.length !== 5) { rows.push({ bad: `malformed row with ${parts.length} fields: ${JSON.stringify(line)}` }); continue; }
      rows.push({
        lane: unescField(parts[0]),
        path: unescField(parts[1]),
        sha256: parts[2],
        lines: Number(parts[3]),
        bgHits: Number(parts[4]),
      });
    }
    const seen = new Set();
    const pending = new Map();
    const mismatches = [];
    const mismatch = (why, row) => {
      counts.rowMismatch++;
      if (mismatches.length < 5) mismatches.push(`${row && row.lane ? `${row.lane}:${row.path}` : '<row>'}: ${why}`);
    };
    for (const row of rows) {
      if (row.bad) { mismatch(row.bad, null); continue; }
      counts.rowsChecked++;
      const key = `${row.lane}\t${row.path}`;
      if (seen.has(key)) counts.rowsDuplicate++;
      else seen.add(key);
      const laneEnum = enumByLane.get(row.lane);
      if (!laneEnum) {
        counts.rowsUnknownLane++;
        mismatch('lane not in the snapshot or its head did not resolve', row);
        continue;
      }
      if (!laneEnum.byPath.has(row.path)) {
        mismatch('path not in the lane .md enumeration at the snapshot head', row);
        continue;
      }
      if (metricCache.has(key)) continue;
      if (!pending.has(row.lane)) pending.set(row.lane, []);
      pending.get(row.lane).push(row);
    }
    for (const [lane, laneRows] of pending) {
      const info = snapshotRows.find((r) => r.lane === lane);
      const repo = path.join(fleet, lane);
      const laneEnum = enumByLane.get(lane);
      const entries = laneRows.map((r) => laneEnum.byPath.get(r.path));
      const metrics = batchMetrics(repo, info.head, entries);
      for (const e of entries) {
        const m = metrics.get(e.path);
        if (m && !m.error) metricCache.set(`${lane}\t${e.path}`, m);
      }
    }
    for (const row of rows) {
      if (row.bad) continue;
      if (!enumByLane.has(row.lane)) continue;
      const laneEnum = enumByLane.get(row.lane);
      if (!laneEnum.byPath.has(row.path)) continue;
      const m = metricCache.get(`${row.lane}\t${row.path}`);
      if (!m) { mismatch('path could not be re-read at the snapshot head', row); continue; }
      if (m.sha256 !== row.sha256) { mismatch(`sha256 ${row.sha256} != ${m.sha256}`, row); continue; }
      if (m.lines !== row.lines) { mismatch(`lines ${row.lines} != ${m.lines}`, row); continue; }
      if (m.bgHits !== row.bgHits) { mismatch(`bgHits ${row.bgHits} != ${m.bgHits}`, row); continue; }
    }
    counts.rowsMissing = [...screenedKeys].filter((k) => !seen.has(k)).length;
    rowsVerification = {
      source: verifyPath,
      rowsChecked: counts.rowsChecked,
      rowMismatch: counts.rowMismatch,
      rowsMissing: counts.rowsMissing,
      rowsDuplicate: counts.rowsDuplicate,
      rowsUnknownLane: counts.rowsUnknownLane,
      mismatches,
    };
  }

  const predicate = predicateOf(counts);
  return {
    schema: SCHEMA,
    scope: opts.scope,
    snapshot: snapshotPath,
    snapshotSha256,
    fleet,
    map: mapSource,
    predicateSentence: 'scope=wide admits the frozen snapshot iff every trackable roster .md blob was enumerated at its recorded head (enumeratedMd), every one was read at that head and re-derived (screenedMd == enumeratedMd, unscreenedMd == 0), no head failed to resolve (unresolvableHead == 0), the roster is the frozen 20 lanes, and no supplied per-file row disagrees with its re-derivation (rowMismatch == 0); scope=map (the v19 PROVINCE.md + map-referenced files screen) is the do-nothing control and is expected to leave unscreenedMd > 0.',
    counts,
    perLane,
    rowsVerification,
    predicate,
  };
}

function printText(out) {
  const lines = [];
  lines.push(`schema ${out.schema}`);
  lines.push(`scope ${out.scope} snapshotSha256 ${out.snapshotSha256}`);
  for (const p of out.perLane) {
    lines.push(`${p.lane}\t${p.head}\tenumerated=${p.enumeratedMd}\tscreened=${p.screenedMd}\tunscreened=${p.unscreenedMd}\thitFiles=${p.wideHitFiles}\thitLines=${p.wideHitLines}${p.headResolvable ? '' : '\tUNRESOLVABLE_HEAD'}`);
  }
  lines.push(`counts ${JSON.stringify(out.counts)}`);
  lines.push(`predicate ${out.predicate}`);
  process.stdout.write(lines.join('\n') + '\n');
}

// ---------------------------------------------------------------------------
// Selftest. Fixtures live only under TMPDIR (never /tmp), every fixture git
// call names its own -C <D>, and rev-parse --show-toplevel is asserted before
// the first commit. The 20-lane fixture is deliberate: the frozen predicate
// pins roster == 20, so a smaller fixture could not demonstrate scope=wide green.
// ---------------------------------------------------------------------------
function selftest() {
  const base = process.env.TMPDIR || os.tmpdir();
  fs.mkdirSync(base, { recursive: true });
  const D = fs.mkdtempSync(path.join(base, 'c1-wide-screen-'));
  const cases = [];
  const add = (name, cond, detail) => cases.push({ name, pass: !!cond, detail: cond ? null : String(detail ?? '') });
  const SELF = fileURLToPath(import.meta.url);
  const cli = (args) => spawnSync(process.execPath, [SELF, ...args], { cwd: D, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

  const LANE00_PROVINCE = '# lane 00\nWe drive it over CDP.\n';
  const LANE05_PROVINCE = '# lane 05\nWe drive CDP here.\n';
  const A_MD = '# a\nplain\n';
  const NESTED = '# nested\nWe use playwright here.\n';
  const NEWLINE_MD = '# multi\nWe crawl here.\n';
  const SPACE = '# unicode\nrecordHar here\n';
  const QUIET = (i) => `# lane ${String(i).padStart(2, '0')}\nquiet lane\n`;

  const makeLane = (dir, files, links) => {
    fs.mkdirSync(dir, { recursive: true });
    let r = spawnSync('git', ['-C', dir, 'init', '-q'], { encoding: 'utf8' });
    if (r.status !== 0) throw new Error(`git init failed in ${dir}: ${r.stderr}`);
    const top = spawnSync('git', ['-C', dir, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).stdout.trim();
    if (!top || fs.realpathSync(top) !== fs.realpathSync(dir)) throw new Error(`fixture toplevel mismatch: ${top} != ${dir}`);
    for (const [rel, content] of files) {
      const p = path.join(dir, rel);
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, content);
    }
    for (const [rel, target] of links) fs.symlinkSync(target, path.join(dir, rel));
    r = spawnSync('git', ['-C', dir, 'add', '-A'], { encoding: 'utf8' });
    if (r.status !== 0) throw new Error(`git add failed in ${dir}: ${r.stderr}`);
    r = spawnSync('git', ['-C', dir, '-c', 'user.name=tabi-selftest', '-c', 'user.email=selftest@invalid', 'commit', '-q', '-m', 'fixture'], { encoding: 'utf8' });
    if (r.status !== 0) throw new Error(`git commit failed in ${dir}: ${r.stderr}`);
    const h = spawnSync('git', ['-C', dir, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim();
    if (!/^[0-9a-f]{40}$/.test(h)) throw new Error(`bad fixture head ${h}`);
    return h;
  };

  const unesc = (s) => s.replace(/\\([\\tnr])/g, (m, c) => (c === '\\' ? '\\' : c === 't' ? '\t' : c === 'n' ? '\n' : '\r'));
  const readRows = (p) => fs.readFileSync(p, 'utf8').split('\n').filter((l) => l !== '').slice(1)
    .map((l) => { const f = l.split('\t'); f[0] = unesc(f[0]); f[1] = unesc(f[1]); return f; });
  const findRow = (rows, lane, file) => rows.find((r) => r[0] === lane && r[1] === file);

  try {
    const fleet = path.join(D, 'fleet');
    fs.mkdirSync(fleet);
    const lanes = Array.from({ length: 20 }, (_, i) => `lane-${String(i).padStart(2, '0')}`);
    const heads = {};
    for (let i = 0; i < lanes.length; i++) {
      const files = new Map();
      files.set('PROVINCE.md', i === 0 ? LANE00_PROVINCE : i === 5 ? LANE05_PROVINCE : QUIET(i));
      const links = new Map();
      if (i === 0) {
        files.set('a.md', A_MD);
        files.set('notes/x.md', NESTED);
        files.set('notes/new\nline.md', NEWLINE_MD);
        files.set('dir with space/ファイル.md', SPACE);
        links.set('link.md', 'a.md');
      }
      heads[lanes[i]] = makeLane(path.join(fleet, lanes[i]), files, links);
    }
    const snap = path.join(D, 'snapshot.tsv');
    fs.writeFileSync(snap, 'lane\thead\n' + lanes.map((l) => `${l}\t${heads[l]}`).join('\n') + '\n');
    const mapFile = path.join(D, 'map.tsv');
    fs.writeFileSync(mapFile, [
      ['surface', 'sibling', 'sibling_ref', 'sibling_quote', 'tabi_ref', 'tabi_quote', 'disposition', 'ruling_ref', 'ruling_quote'].join('\t'),
      ['x-ground', 'lane-00', `lane-00@${heads['lane-00']}:PROVINCE.md:2`, 'We drive it over CDP.', '-', '-', 'ruled', '-', '-'].join('\t'),
    ].join('\n') + '\n');

    // --- the wide run (green) plus its rows receipt -------------------------
    const rowsPath = path.join(D, 'rows.tsv');
    const wide = cli(['--scope', 'wide', '--snapshot', snap, '--fleet', fleet, '--rows-out', rowsPath, '--json']);
    const wj = parseJsonOrNull(wide.stdout);
    add('wide-green-25',
      wide.status === 0 && wj && wj.predicate === true
        && wj.counts.enumeratedMd === 25 && wj.counts.screenedMd === 25
        && wj.counts.unscreenedMd === 0 && wj.counts.unresolvableHead === 0
        && wj.counts.roster === 20 && wj.counts.rowMismatch === 0,
      `status=${wide.status} counts=${wj ? JSON.stringify(wj.counts) : 'unparsed'} stderr=${wide.stderr.slice(0, 300)}`);

    const rows = readRows(rowsPath);
    const nested = findRow(rows, 'lane-00', 'notes/x.md');
    add('nested-md-screened', !!nested && Number(nested[3]) === 2 && Number(nested[4]) === 1, JSON.stringify(nested ?? null));
    const spaced = findRow(rows, 'lane-00', 'dir with space/ファイル.md');
    add('space-and-nonascii-path', !!spaced && Number(spaced[3]) === 2 && Number(spaced[4]) === 1, JSON.stringify(spaced ?? null));
    const newlined = findRow(rows, 'lane-00', 'notes/new\nline.md');
    add('newline-path-roundtrip',
      !!newlined && Number(newlined[3]) === 2 && Number(newlined[4]) === 1
        && fs.readFileSync(rowsPath, 'utf8').split('\n').filter((l) => l !== '').length === 26,
      `row=${JSON.stringify(newlined ?? null)} rawLines=${fs.readFileSync(rowsPath, 'utf8').split('\n').filter((l) => l !== '').length}`);
    const linkRow = findRow(rows, 'lane-00', 'link.md');
    add('symlink-md-screened-as-blob',
      !!linkRow && linkRow[2] === sha256(Buffer.from('a.md')) && Number(linkRow[3]) === 1 && Number(linkRow[4]) === 0,
      JSON.stringify(linkRow ?? null));
    add('wide-hit-counts',
      !!wj && wj.counts.wideHitLines === 5 && wj.counts.wideHitFiles === 5,
      wj ? JSON.stringify({ lines: wj.counts.wideHitLines, files: wj.counts.wideHitFiles }) : 'unparsed');

    // --- the map-scope control on the same fixture: red ---------------------
    const mapRun = cli(['--scope', 'map', '--map-file', mapFile, '--snapshot', snap, '--fleet', fleet, '--json']);
    const mj = parseJsonOrNull(mapRun.stdout);
    add('map-red-on-unreferenced-nested-md',
      mapRun.status === 1 && mj && mj.predicate === false
        && mj.counts.enumeratedMd === 25 && mj.counts.screenedMd === 20 && mj.counts.unscreenedMd === 5,
      `status=${mapRun.status} counts=${mj ? JSON.stringify(mj.counts) : 'unparsed'} stderr=${mapRun.stderr.slice(0, 300)}`);

    // --- the K4 check: genuine rows re-derive, forged rows are refused ------
    const genuine = cli(['--scope', 'wide', '--snapshot', snap, '--fleet', fleet, '--verify-rows', rowsPath, '--json']);
    const gj = parseJsonOrNull(genuine.stdout);
    add('verify-rows-genuine',
      genuine.status === 0 && gj && gj.predicate === true && gj.counts.rowMismatch === 0
        && gj.counts.rowsChecked === 25 && gj.counts.rowsMissing === 0,
      `status=${genuine.status} counts=${gj ? JSON.stringify(gj.counts) : 'unparsed'} stderr=${genuine.stderr.slice(0, 300)}`);

    const forge = (name, mutate) => {
      const lines = fs.readFileSync(rowsPath, 'utf8').split('\n');
      const at = lines.findIndex((l) => l.startsWith('lane-00\tPROVINCE.md\t'));
      const parts = lines[at].split('\t');
      mutate(parts);
      lines[at] = parts.join('\t');
      const p = path.join(D, `rows-${name}.tsv`);
      fs.writeFileSync(p, lines.join('\n'));
      const r = cli(['--scope', 'wide', '--snapshot', snap, '--fleet', fleet, '--verify-rows', p, '--json']);
      const j = parseJsonOrNull(r.stdout);
      add(name,
        r.status === 1 && j && j.counts.rowMismatch === 1 && j.predicate === false,
        `status=${r.status} rowMismatch=${j ? j.counts.rowMismatch : 'unparsed'} stderr=${r.stderr.slice(0, 200)}`);
    };
    forge('forged-row-sha', (p) => { p[2] = '0'.repeat(64); });
    forge('forged-row-lines', (p) => { p[3] = String(Number(p[3]) + 1); });
    forge('forged-row-hits', (p) => { p[4] = String(Number(p[4]) + 1); });
    forge('forged-row-path-not-enumerated', (p) => { p[1] = 'ghost.md'; });

    // --- M3: the worktree differs from the head blob ------------------------
    fs.writeFileSync(path.join(fleet, 'lane-05', 'PROVINCE.md'), 'plain\n');
    const m3rows = path.join(D, 'rows-m3.tsv');
    const m3 = cli(['--scope', 'wide', '--snapshot', snap, '--fleet', fleet, '--rows-out', m3rows, '--json']);
    const m3j = parseJsonOrNull(m3.stdout);
    const m3row = findRow(readRows(m3rows), 'lane-05', 'PROVINCE.md');
    add('worktree-differs-from-head',
      m3.status === 0 && m3j && m3j.predicate === true
        && !!m3row && m3row[2] === sha256(Buffer.from(LANE05_PROVINCE))
        && Number(m3row[3]) === 2 && Number(m3row[4]) === 1,
      `status=${m3.status} row=${JSON.stringify(m3row ?? null)} expectedSha=${sha256(Buffer.from(LANE05_PROVINCE))} stderr=${m3.stderr.slice(0, 200)}`);
    fs.writeFileSync(path.join(fleet, 'lane-05', 'PROVINCE.md'), LANE05_PROVINCE);

    // --- M4: an unresolvable head is refused, not read as zero files --------
    const snapU = path.join(D, 'snapshot-unresolvable.tsv');
    const snapLines = fs.readFileSync(snap, 'utf8').trimEnd().split('\n');
    const idx = snapLines.findIndex((l) => l.startsWith('lane-07\t'));
    snapLines[idx] = `lane-07\t${'f'.repeat(40)}`;
    fs.writeFileSync(snapU, snapLines.join('\n') + '\n');
    const u4 = cli(['--scope', 'wide', '--snapshot', snapU, '--fleet', fleet, '--json']);
    const uj = parseJsonOrNull(u4.stdout);
    add('unresolvable-head-refused',
      u4.status === 1 && uj && uj.predicate === false
        && uj.counts.unresolvableHead === 1 && uj.counts.enumeratedMd === 24,
      `status=${u4.status} counts=${uj ? JSON.stringify(uj.counts) : 'unparsed'}`);

    // --- M5: the scope is required; no default to the map scope ------------
    const m5 = cli(['--snapshot', snap, '--fleet', fleet, '--json']);
    add('missing-scope-exits-2', m5.status === 2 && m5.stderr.length > 0, `status=${m5.status} stderr=${m5.stderr.slice(0, 200)}`);
    const m5b = cli(['--scope', 'both', '--snapshot', snap, '--fleet', fleet, '--json']);
    add('invalid-scope-exits-2', m5b.status === 2, `status=${m5b.status} stderr=${m5b.stderr.slice(0, 200)}`);

    // --- snapshot integrity: a bad header is refused ------------------------
    const snapB = path.join(D, 'snapshot-bad.tsv');
    fs.writeFileSync(snapB, `lane\tcommit\nlane-00\t${heads['lane-00']}\n`);
    const hb = cli(['--scope', 'wide', '--snapshot', snapB, '--fleet', fleet, '--json']);
    add('bad-snapshot-header-exits-2', hb.status === 2, `status=${hb.status} stderr=${hb.stderr.slice(0, 200)}`);
  } catch (e) {
    add('selftest-harness', false, e && (e.stack || e.message));
  } finally {
    fs.rmSync(D, { recursive: true, force: true });
  }
  const allPass = cases.length > 0 && cases.every((c) => c.pass);
  return { allPass, cases };
}

// --- cli (only when invoked as main) ----------------------------------------
const SELF_PATH = fileURLToPath(import.meta.url);
// Compare real paths: the fleet root may relink lanes (v19's r51 host-shape
// note), so a lexical compare could silently skip the CLI when the counter is
// invoked through a symlinked lane directory.
const IS_MAIN = (() => {
  if (!process.argv[1]) return false;
  try {
    return fs.realpathSync(path.resolve(process.argv[1])) === fs.realpathSync(SELF_PATH);
  } catch {
    return false;
  }
})();
if (IS_MAIN) {
  const argv = process.argv.slice(2);
  if (argv.includes('--selftest')) {
    const st = selftest();
    console.log(JSON.stringify({ schema: `${SCHEMA}-selftest`, allPass: st.allPass, cases: st.cases }, null, 1));
    process.exit(st.allPass ? 0 : 1);
  }
  const opts = { scope: null, snapshot: null, fleet: null, verifyRows: null, rowsOut: null, json: false, mapFile: null, mapRepo: null, mapRev: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--scope') opts.scope = argv[++i];
    else if (a === '--snapshot') opts.snapshot = argv[++i];
    else if (a === '--fleet') opts.fleet = argv[++i];
    else if (a === '--verify-rows') opts.verifyRows = argv[++i];
    else if (a === '--rows-out') opts.rowsOut = argv[++i];
    else if (a === '--json') opts.json = true;
    else if (a === '--map-file') opts.mapFile = argv[++i];
    else if (a === '--map-repo') opts.mapRepo = argv[++i];
    else if (a === '--map-rev') opts.mapRev = argv[++i];
    else die(`unknown argument ${JSON.stringify(a)}`);
  }
  if (!opts.scope) opts.scope = 'map';
  if (opts.scope !== 'wide' && opts.scope !== 'map') die(`invalid --scope ${JSON.stringify(opts.scope)} (expected wide|map)`);
  if (!opts.snapshot) die('missing --snapshot <tsv>');
  const out = run(opts);
  if (opts.json) console.log(JSON.stringify(out, null, 1));
  else printText(out);
  process.exit(out.predicate ? 0 : 1);
}
