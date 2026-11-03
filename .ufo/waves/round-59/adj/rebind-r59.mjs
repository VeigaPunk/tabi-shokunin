#!/usr/bin/env node
// rebind-r59.mjs — tabi round 59, claim C1's ledger rebind tool. Authored as the
// round-58 rebind-r58.mjs copied to the r59 generation by the round-59 seat
// R59Rebind (the r58 lesson, Mistakes row 3: the rebind tool is
// generation-hardcoded; this is the same class of adaptation). EXECUTED BY THE
// L1 AFTER THE FROZEN INSTRUMENT COMMIT — this tool never writes a corpus/ path
// itself.
//
// Changes vs r58 (declared adaptation, same class):
//   (1) r59 generation: output names corpus/adjacency-host-{audit,delta}-r59.tsv,
//       every schema string tabi-adjacency-r59-*, PREV_DELTA ->
//       corpus/adjacency-host-delta-r58.tsv, meter import -> the v19 meter.
//   (2) v19 declared change (d) (claims.json C1): the screen set is ALL roster
//       sibling lanes other than tabi (not only lanes absent from the ruled map
//       plus --also-screen), and each lane is screened over its PROVINCE.md AND
//       every file its corpus/adjacency.tsv rows reference. One `lane` row is
//       written per screened (lane, path); every browser-ground hit line gets a
//       `line` row whose quote is the complete line.
//   (3) new --dry-run / --preflight-out: step 1-4 of the normal pass (snapshot,
//       audit rows, delta rows, v19 pure-core preflight) with NO ledger write.
//       The L1 uses it to exercise the preflight before the data pass; the real
//       pass is still the normal mode at ONE fresh snapshot at data time.
//
// What it does, in one pass:
//   1. ONE head snapshot: `git -C <lane> rev-parse HEAD` for every sibling lane
//      at --fleet (roster derivation identical to the meter's rosterScan:
//      non-dot directory entries that are dirs or symlinks-to-dirs carrying
//      .git or HEAD, minus tabi-shokunin), read once and recorded in
//      --snapshot-out (default: adj/rebind-snapshot.json next to this file).
//   2. AUDIT rows: every corpus/adjacency.tsv data row's sibling_ref is
//      re-derived against the snapshot-head bytes with the meter's own status
//      vocabulary — sibling-absent | unchanged | moved (note names the derived
//      line number AND quotes the verbatim line) | stale | file-absent.
//   3. DELTA rows: for every roster sibling, its PROVINCE.md and every file its
//      map rows reference are hashed from RAW bytes (execFileSync without an
//      encoding; the Buffer itself is hashed — the r56 trimEnd correction), the
//      line count and browser-ground hit lines are re-derived with the meter's
//      keyword list, and EVERY hit line gets a `line` row whose quote is the
//      complete line and whose disposition comes from the frozen vocabulary
//      {no-tabi-ground, overlap-declared, contested-open}. Dispositions are
//      never invented: they are carried from the previous generation's delta
//      ledger by exact whole-line quote match, overridden only by an explicit
//      --adjudications file. An unresolved hit line aborts the rebind (exit 3)
//      and no ledger is written — a half-adjudicated ledger cannot be committed.
//   4. PREFLIGHT: the candidate rows are run through the v19 meter's own pure
//      core (verify + predicateFrom) against the same snapshot before any byte
//      is written. A non-empty finding list aborts (exit 5).
//
// Write scope: only --out (the two TSVs, or unresolved.json on exit 3),
// --snapshot-out (normal mode; dry-run only when passed explicitly),
// --preflight-out (dry-run report), and optionally --scratch (byte-identical
// ledger copies for inspection). No temporary files are created; TMPDIR is
// never consulted.
//
// Usage:
//   node rebind-r59.mjs --repo <lane> --fleet <dir> --out <dir> [--rev <REV>]
//        [--snapshot-out <file>] [--prev-delta <rel-or-abs-path>]
//        [--adjudications <json>] [--dry-run] [--preflight-out <json>]
//        [--scratch <dir>] [--json]
// Exit: 0 ledgers written + preflight green (or dry-run preflight green);
//       2 usage; 3 unresolved hit lines (no ledger written); 4 environment /
//       source-pin failure; 5 preflight findings (no ledger written).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { verify, predicateFrom } from '../counters/c1-adjacency-host-v19.mjs';

const SCHEMA_REBIND = 'tabi-adjacency-r59-rebind';
const SELF_LANE = 'tabi-shokunin';
const MAP_REL = 'corpus/adjacency.tsv';
const PREV_DELTA_REL = 'corpus/adjacency-host-delta-r58.tsv';
const METER_REL = '../counters/c1-adjacency-host-v19.mjs';
const OUT_AUDIT = 'adjacency-host-audit-r59.tsv';
const OUT_DELTA = 'adjacency-host-delta-r59.tsv';
const PROVINCE = 'PROVINCE.md';
// The two frozen lists are DUPLICATED from the meter (the v19 declared change
// set does not touch them). pinSourceLists() below fails the run if the meter's
// literal lines ever drift from these.
const BG_WORDS = ['cdp', 'devtools', 'remote-debugging', 'headless', 'webdriver', 'geckodriver', 'selenium', 'playwright', 'bidi', 'crawl', 'screenshot', 'recordhar', 'record-har'];
const DISPOSITIONS = ['no-tabi-ground', 'overlap-declared', 'contested-open'];
const AUDIT_HEADER = 'sibling_ref\tstatus\tnote';
const DELTA_HEADER = 'type\tlane\tpath\tprovinceSha256\tlines\tbgHits\tquote\tdisposition\thead';

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

function die(code, msg, extra = {}) {
  console.error(JSON.stringify({ schema: SCHEMA_REBIND, error: msg, ...extra }, null, 1));
  process.exit(code);
}

function pinSourceLists() {
  const src = fs.readFileSync(new URL(METER_REL, import.meta.url), 'utf8');
  const grab = (name) => {
    const m = new RegExp(`^const ${name} = (\\[[^\\]]*\\]);\\s*$`, 'm').exec(src);
    return m === null ? null : m[1];
  };
  const norm = (s) => s.replace(/[\s'"]/g, '');
  const drift = [['BG_WORDS', BG_WORDS], ['DISPOSITIONS', DISPOSITIONS]]
    .filter(([name, own]) => grab(name) === null || norm(grab(name)) !== norm(JSON.stringify(own)))
    .map(([name]) => name);
  if (drift.length > 0) die(4, 'meter source-list drift: this tool\'s BG_WORDS/DISPOSITIONS no longer match the meter', { drift });
}

// --- host reads (git at the snapshot head; never the worktree) -----------------
function gitBuf(cwd, argv) {
  try {
    return execFileSync('git', ['-C', cwd, ...argv], { maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
  } catch { return null; }
}

function rosterScan(fleet) {
  return fs.readdirSync(fleet, { withFileTypes: true })
    .filter((d) => !d.name.startsWith('.'))
    .filter((d) => {
      if (d.isDirectory()) return true;
      if (!d.isSymbolicLink()) return false;
      try { return fs.statSync(path.join(fleet, d.name)).isDirectory(); } catch { return false; }
    })
    .filter((d) => (fs.existsSync(path.join(fleet, d.name, '.git')) || fs.existsSync(path.join(fleet, d.name, 'HEAD'))) && d.name !== SELF_LANE)
    .map((d) => d.name).sort();
}

function headSnapshot(fleet) {
  const roster = rosterScan(fleet);
  const heads = {};
  for (const lane of roster) {
    const out = gitBuf(path.join(fleet, lane), ['rev-parse', 'HEAD']);
    heads[lane] = out === null ? null : out.toString('utf8').trim() || null;
  }
  return { roster, heads };
}

// RAW bytes at `<head>:<path>`: undefined = path absent at that head, null =
// lane absent at the snapshot (mirrors the meter's sibRef contract).
function makeReader(fleet, heads) {
  const cache = new Map();
  return (lane, p) => {
    const key = `${lane}\u0000${p}`;
    if (cache.has(key)) return cache.get(key);
    const head = heads[lane];
    let val;
    if (head === undefined || head === null) val = null;
    else val = gitBuf(path.join(fleet, lane), ['cat-file', '-p', `${head}:${p}`]) ?? undefined;
    cache.set(key, val);
    return val;
  };
}

const tsvParse = (raw, cols) => raw.toString('utf8').split('\n')
  .map((l) => l.replace(/\r$/, ''))
  .filter((l, i) => l.length > 0 && !(i === 0))
  .filter((l) => l !== '')
  .map((l) => l.split('\t'))
  .filter((parts) => parts.length === cols);

function parseRef(ref) {
  const at = ref.indexOf('@');
  if (at === -1) return null;
  const lane = ref.slice(0, at);
  const c1 = ref.indexOf(':', at);
  const c2 = ref.lastIndexOf(':');
  if (c1 === -1 || c2 <= c1) return null;
  const p = ref.slice(c1 + 1, c2);
  const ln = Number(ref.slice(c2 + 1));
  if (!/^\d+$/.test(ref.slice(c2 + 1))) return null;
  return { lane, rev: ref.slice(at + 1, c1), path: p, line: ln };
}

// The meter's observedStatus, over RAW-at-head bytes:
//   null      -> sibling-absent   (lane not on the snapshot)
//   undefined -> file-absent      (path not at the snapshot head)
const observedStatus = (rawBuf, lineNo, citedText) => {
  if (rawBuf === null) return { status: 'sibling-absent', derivedLine: null };
  if (rawBuf === undefined) return { status: 'file-absent', derivedLine: null };
  const lines = rawBuf.toString('utf8').split('\n').map((l) => l.replace(/\r$/, ''));
  if (lines[lineNo - 1] === citedText) return { status: 'unchanged', derivedLine: lineNo };
  const idx = lines.indexOf(citedText);
  if (idx !== -1) return { status: 'moved', derivedLine: idx + 1 };
  return { status: 'stale', derivedLine: null };
};

// TSV cells stay single-line single-cell: a tab or newline in a note/quote would
// silently shift the column count and the row would be dropped by tsvParse.
function cell(v) {
  const s = String(v);
  if (/[\t\n\r]/.test(s)) throw new Error(`tsv cell carries a tab or newline: ${JSON.stringify(s.slice(0, 120))}`);
  return s;
}

const quoteOf = (d) => d[6];
const pathOf = (d) => d[2].replace(/:\d+$/, '');

// Report/snapshot paths may name a directory that does not exist yet (the L1's
// scratch dir at the data pass); the ledgers' own --out dir is created below.
function writeOut(file, text) {
  fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  fs.writeFileSync(file, text);
}

function main() {
  const argv = process.argv.slice(2);
  const opts = {
    rev: 'HEAD', json: false, prevDelta: PREV_DELTA_REL, adjudications: null,
    scratch: null, snapshotOut: path.join(import.meta.dirname, 'rebind-snapshot.json'),
    snapshotOutGiven: false, dryRun: false, preflightOut: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--repo') opts.repo = argv[++i];
    else if (a === '--fleet') opts.fleet = argv[++i];
    else if (a === '--out') opts.out = argv[++i];
    else if (a === '--rev') opts.rev = argv[++i];
    else if (a === '--snapshot-out') { opts.snapshotOut = argv[++i]; opts.snapshotOutGiven = true; }
    else if (a === '--prev-delta') opts.prevDelta = argv[++i];
    else if (a === '--adjudications') opts.adjudications = argv[++i];
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--preflight-out') opts.preflightOut = argv[++i];
    else if (a === '--scratch') opts.scratch = argv[++i];
    else if (a === '--json') opts.json = true;
    else die(2, `unknown argument ${a}`);
  }
  if (!opts.repo || !opts.fleet || !opts.out) die(2, 'usage: node rebind-r59.mjs --repo <lane> --fleet <dir> --out <dir> [--rev <REV>] [--snapshot-out <file>] [--prev-delta <path>] [--adjudications <json>] [--dry-run] [--preflight-out <json>] [--scratch <dir>] [--json]');
  if (opts.preflightOut && !opts.dryRun) die(2, '--preflight-out is a --dry-run option');
  pinSourceLists();
  // Provenance: the exact meter bytes this candidate ledger was preflighted
  // against. The L1's freeze pins this sha; a later meter edit is a new run.
  const meterSha256 = sha256(fs.readFileSync(new URL(METER_REL, import.meta.url)));

  const repo = path.resolve(opts.repo);
  const fleet = path.resolve(opts.fleet);
  const outDir = path.resolve(opts.out);
  // The ledgers' final home; the tool refuses to write there itself (the L1
  // copies them in at the data commit, after the freeze commit).
  const corpusDir = path.join(repo, 'corpus');
  if (outDir === corpusDir || outDir.startsWith(corpusDir + path.sep)) die(2, `--out must not be inside ${corpusDir}: this tool writes candidates only`);

  const rev = opts.rev === 'HEAD' ? (gitBuf(repo, ['rev-parse', 'HEAD'])?.toString('utf8').trim() ?? 'HEAD') : opts.rev;
  const mapRaw = gitBuf(repo, ['cat-file', '-p', `${rev}:${MAP_REL}`]);
  if (mapRaw === null) die(4, `cannot read ${MAP_REL} at ${rev}`);
  const mapRows = tsvParse(mapRaw, 9);
  if (mapRows.length === 0) die(4, `${MAP_REL} at ${rev} has no data rows`);

  const { roster, heads } = headSnapshot(fleet);
  const sibRaw = makeReader(fleet, heads);

  // ---- audit rows -------------------------------------------------------------
  const auditRows = [];
  const auditDetail = [];
  for (const row of mapRows) {
    const parsed = parseRef(row[2]);
    if (!parsed) die(4, `map row has an unparseable sibling_ref: ${row[2]}`, { surface: row[0] });
    const cited = row[3].replace(/\r$/, '');
    const { status, derivedLine } = observedStatus(sibRaw(parsed.lane, parsed.path), parsed.line, cited);
    let note = '-';
    if (status === 'moved') note = `text now at :${derivedLine} — "${cited}"`;
    else if (status === 'stale') note = `pinned text absent at the ${(heads[parsed.lane] || 'absent').slice(0, 8)} head`;
    else if (status === 'file-absent') note = `path ${parsed.path} absent at the ${(heads[parsed.lane] || 'absent').slice(0, 8)} head`;
    else if (status === 'sibling-absent') note = 'lane absent at the snapshot';
    auditRows.push([cell(row[2]), status, cell(note)]);
    auditDetail.push({ ref: row[2], surface: row[0], status, derivedLine, head: heads[parsed.lane] ?? null });
  }

  // ---- delta rows -------------------------------------------------------------
  // v19 (d): ALL roster siblings; each over PROVINCE.md + every map-referenced file.
  const refFiles = new Map();
  for (const row of mapRows) {
    const p = parseRef(row[2]);
    if (!p) continue;
    if (!refFiles.has(p.lane)) refFiles.set(p.lane, new Set());
    refFiles.get(p.lane).add(p.path);
  }
  const screened = roster.slice();
  const screenFiles = new Map();
  for (const lane of screened) {
    const files = new Set([PROVINCE]);
    for (const f of refFiles.get(lane) ?? []) files.add(f);
    screenFiles.set(lane, [...files].sort());
  }

  // carried dispositions: previous generation's line rows, exact whole-line
  // quote match (lane + path + quote), vocabulary enforced.
  const prevBuf = path.isAbsolute(opts.prevDelta)
    ? (fs.existsSync(opts.prevDelta) ? fs.readFileSync(opts.prevDelta) : null)
    : gitBuf(repo, ['cat-file', '-p', `${rev}:${opts.prevDelta}`]);
  const carried = new Map();
  let prevRows = [];
  if (prevBuf !== null) {
    prevRows = tsvParse(prevBuf, 9);
    for (const d of prevRows) {
      if (d[0] !== 'line') continue;
      if (!DISPOSITIONS.includes(d[7])) continue;
      carried.set(`${d[1]}\u0000${pathOf(d)}\u0000${quoteOf(d)}`, d[7]);
    }
  }
  const explicit = new Map();
  if (opts.adjudications) {
    const list = JSON.parse(fs.readFileSync(opts.adjudications, 'utf8'));
    for (const a of list) {
      if (!DISPOSITIONS.includes(a.disposition)) die(4, `adjudication disposition outside the frozen vocabulary: ${a.disposition}`, { quote: a.quote });
      explicit.set(`${a.lane}\u0000${a.path}\u0000${a.quote}`, a.disposition);
    }
  }

  const deltaRows = [];
  const unresolved = [];
  const screenDetail = [];
  for (const lane of screened) {
    for (const relPath of screenFiles.get(lane)) {
      const raw = sibRaw(lane, relPath);
      if (raw === null) {
        deltaRows.push(['lane', lane, relPath, '-', '0', '0', '-', '-', '-']);
        screenDetail.push({ lane, path: relPath, absent: 'lane' });
        continue;
      }
      if (raw === undefined) {
        deltaRows.push(['lane', lane, relPath, '-', '0', '0', '-', '-', heads[lane] ?? '-']);
        screenDetail.push({ lane, path: relPath, absent: 'file' });
        continue;
      }
      const rawSha = sha256(raw);                       // RAW bytes, the r56 lesson
      const text = raw.toString('utf8');
      if (!Buffer.from(text, 'utf8').equals(raw)) die(4, `${lane}:${relPath} is not UTF-8 round-trip clean; a raw-byte sha cannot be reconciled with the meter's re-encoding`, { lane });
      const linesArr = text.replace(/\n$/, '').split('\n').map((l) => l.replace(/\r$/, ''));
      const hits = [];
      linesArr.forEach((l, i) => { const low = l.toLowerCase(); if (BG_WORDS.some((w) => low.includes(w))) hits.push(i + 1); });
      deltaRows.push(['lane', lane, relPath, rawSha, String(linesArr.length), String(hits.length), '-', '-', heads[lane]]);
      for (const ln of hits) {
        const quote = linesArr[ln - 1];
        const key = `${lane}\u0000${relPath}\u0000${quote}`;
        const disp = explicit.get(key) ?? carried.get(key);
        if (!disp) {
          unresolved.push({ lane, path: relPath, line: ln, quote });
          continue;
        }
        deltaRows.push(['line', lane, `${relPath}:${ln}`, '-', '-', '-', cell(quote), disp, '-']);
      }
      screenDetail.push({ lane, path: relPath, sha256: rawSha, lines: linesArr.length, bgHits: hits.length, head: heads[lane] });
    }
  }

  const laneSet = new Set(deltaRows.filter((r) => r[0] === 'lane').map((r) => r[1]));
  const lineRows = deltaRows.filter((r) => r[0] === 'line');
  const snapshot = {
    schema: 'tabi-adjacency-r59-snapshot',
    round: 59,
    claim: 'C1',
    meterSha256,
    snapshotAt: new Date().toISOString(),
    fleet,
    repo,
    rev,
    method: 'git -C <lane> rev-parse HEAD, one pass in sorted lane order over the meter\'s roster derivation (non-dot dir/symlink-to-dir entries at --fleet carrying .git or HEAD, minus tabi-shokunin)',
    rosterCount: roster.length,
    roster,
    heads,
    screened,
    screenFiles: Object.fromEntries(screened.map((l) => [l, screenFiles.get(l)])),
    headCounts: { roster: roster.length, heads: Object.values(heads).filter(Boolean).length },
  };

  if (unresolved.length > 0) {
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'unresolved.json'), JSON.stringify({ schema: 'tabi-adjacency-r59-rebind-unresolved', snapshotAt: snapshot.snapshotAt, unresolved, carriedRows: carried.size, explicitRows: explicit.size }, null, 1) + '\n');
    if (!opts.dryRun) writeOut(opts.snapshotOut, JSON.stringify({ ...snapshot, unresolved: unresolved.length }, null, 1) + '\n');
    const report = {
      schema: SCHEMA_REBIND, ok: false, dryRun: opts.dryRun, error: 'unresolved', meterSha256,
      snapshotAt: snapshot.snapshotAt, rev,
      counts: { roster: roster.length, mapRows: mapRows.length, auditRows: auditRows.length, screenedLanes: screened.length, screenedFiles: screenDetail.length, lineRows: lineRows.length, unresolved: unresolved.length },
      unresolved: unresolved.map((u) => `${u.lane}:${u.path}:${u.line}: ${u.quote}`),
      unresolvedFile: path.join(outDir, 'unresolved.json'),
    };
    if (opts.preflightOut) writeOut(opts.preflightOut, JSON.stringify(report, null, 1) + '\n');
    die(3, `${unresolved.length} browser-ground hit line(s) have no disposition in the frozen vocabulary — adjudicate and re-run with --adjudications; no ledger was written`, { unresolved: unresolved.length, unresolvedFile: report.unresolvedFile });
  }

  // ---- preflight: the v19 pure core over the candidate rows -------------------
  const pre = verify({
    mapRows,
    auditRows,
    deltaRows,
    roster,
    sibRef: (lane, p) => { const b = sibRaw(lane, p); return b === null ? null : b === undefined ? undefined : b.toString('utf8'); },
    headOf: (lane) => heads[lane] ?? null,
  });
  const preOk = predicateFrom(pre.findings);
  const counts = {
    roster: roster.length,
    mapRows: mapRows.length,
    auditRows: auditRows.length,
    deltaLanes: laneSet.size,
    deltaFiles: screenDetail.filter((s) => !s.absent).length,
    deltaLineRows: lineRows.length,
  };
  const preflightReport = {
    schema: SCHEMA_REBIND,
    ok: preOk,
    dryRun: opts.dryRun,
    meterSha256,
    snapshotAt: snapshot.snapshotAt,
    rev,
    out: outDir,
    snapshotOut: opts.snapshotOutGiven || !opts.dryRun ? path.resolve(opts.snapshotOut) : null,
    prevDelta: path.isAbsolute(opts.prevDelta) ? opts.prevDelta : `${rev}:${opts.prevDelta}`,
    adjudications: opts.adjudications ? path.resolve(opts.adjudications) : null,
    counts,
    screened: screenDetail,
    dispositionSources: { carried: carried.size, explicit: explicit.size },
    preflight: { findings: pre.findings.length, findingIds: pre.findings.map((f) => f.id), predicate: preOk, counts: pre.counts },
  };
  if (!preOk) {
    if (opts.preflightOut) writeOut(opts.preflightOut, JSON.stringify(preflightReport, null, 1) + '\n');
    die(5, 'preflight: the v19 meter core rejects the candidate ledgers — no ledger was written', { findings: pre.findings.map((f) => `${f.id}: ${f.detail}`) });
  }

  if (opts.dryRun) {
    if (opts.snapshotOutGiven) writeOut(opts.snapshotOut, JSON.stringify(snapshot, null, 1) + '\n');
    if (opts.preflightOut) writeOut(opts.preflightOut, JSON.stringify(preflightReport, null, 1) + '\n');
    if (opts.json) console.log(JSON.stringify(preflightReport, null, 1));
    else for (const [k, v] of Object.entries(counts)) console.log(`${k}\t${v}`);
    process.exit(0);
  }

  // ---- write -----------------------------------------------------------------
  const auditText = [AUDIT_HEADER, ...auditRows.map((r) => r.join('\t'))].join('\n') + '\n';
  const deltaText = [DELTA_HEADER, ...deltaRows.map((r) => r.join('\t'))].join('\n') + '\n';
  fs.mkdirSync(outDir, { recursive: true });
  const auditPath = path.join(outDir, OUT_AUDIT);
  const deltaPath = path.join(outDir, OUT_DELTA);
  fs.writeFileSync(auditPath, auditText);
  fs.writeFileSync(deltaPath, deltaText);
  writeOut(opts.snapshotOut, JSON.stringify(snapshot, null, 1) + '\n');
  if (opts.scratch) {
    fs.mkdirSync(opts.scratch, { recursive: true });
    fs.writeFileSync(path.join(opts.scratch, OUT_AUDIT), auditText);
    fs.writeFileSync(path.join(opts.scratch, OUT_DELTA), deltaText);
  }

  const out = {
    schema: SCHEMA_REBIND,
    ok: true,
    meterSha256,
    snapshotAt: snapshot.snapshotAt,
    rev,
    out: outDir,
    snapshotOut: path.resolve(opts.snapshotOut),
    wrote: { audit: auditPath, delta: deltaPath, auditSha256: sha256(Buffer.from(auditText, 'utf8')), deltaSha256: sha256(Buffer.from(deltaText, 'utf8')) },
    counts,
    auditStatuses: auditDetail.reduce((m, a) => { m[a.status] = (m[a.status] || 0) + 1; return m; }, {}),
    screened: screenDetail,
    dispositionSources: { carried: carried.size, explicit: explicit.size },
    preflight: { findings: 0, predicate: true, counts: pre.counts },
    next: 'copy the two TSVs to corpus/adjacency-host-{audit,delta}-r59.tsv, commit the data, then run counters/c1-adjacency-host-v19.mjs at the data rev',
  };
  if (opts.preflightOut) writeOut(opts.preflightOut, JSON.stringify(out, null, 1) + '\n');
  if (opts.json) console.log(JSON.stringify(out, null, 1));
  else for (const [k, v] of Object.entries(counts)) console.log(`${k}\t${v}`);
  process.exit(0);
}

main();
