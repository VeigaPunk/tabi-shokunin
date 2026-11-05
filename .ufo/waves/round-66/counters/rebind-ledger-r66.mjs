#!/usr/bin/env node
// rebind-ledger-r66.mjs — tabi round 66, claim C1 (adjacency): deterministic
// live-head rebind generator for the r62 sibling-overlap ledger.
//
// Inputs (absolute paths):
//   --lane <repo>        tabi-shokunin toplevel (read-only git only)
//   --fleet <dir>        fleet root holding the sibling lanes (read-only git only)
//   --snapshot <tsv>     lane<TAB>head, one row per sibling lane
//   --decisions <tsv>    adjudication decisions: lane TAB cell TAB fits TAB reason
//   --out-dir <dir>      output root (mechanical/, adjudicated/, quote-residue.tsv, diff-summary.txt)
//   --rev <rev>          optional; default the lane HEAD. The map and both r62 ledgers are
//                        read at this rev, and the working-tree ledger copies must equal it.
//
// Mechanical generation (control): every lane row re-derived from the sibling bytes at the
// snapshot head (provinceSha256, lines, bgHits, head); every audit row whose status is `moved`
// gets its note's first `:<digits>` line number rewritten to the re-derived line. Quotes and
// dispositions are NEVER changed here.
//
// Quote residue: every line row whose quote is not the complete line at the head. These are
// written to quote-residue.tsv and left unchanged in the mechanical output.
//
// Adjudicated generation: the mechanical output plus each residue quote set to the complete
// head line (verbatim). The disposition is kept only where the decisions file says fits=yes;
// fits=no sets it to contested-open. Nothing else changes.
//
// Exit: 0 both generations written; 2 refused or could not evaluate. A residue with no
// decisions file writes the mechanical generation and quote-residue.tsv (decision PENDING),
// skips the adjudicated generation, and exits 2.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// BG_WORDS and DISPOSITIONS copied verbatim from
// .ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs (lines 34-35).
const BG_WORDS = ['cdp', 'devtools', 'remote-debugging', 'headless', 'webdriver', 'geckodriver', 'selenium', 'playwright', 'bidi', 'crawl', 'screenshot', 'recordhar', 'record-har'];
const DISPOSITIONS = ['no-tabi-ground', 'overlap-declared', 'contested-open'];

const MAP_REL = 'corpus/adjacency.tsv';
const AUDIT_REL = 'corpus/adjacency-host-audit-r62.tsv';
const DELTA_REL = 'corpus/adjacency-host-delta-r62.tsv';
const DELTA_HEADER = 'type\tlane\tpath\tprovinceSha256\tlines\tbgHits\tquote\tdisposition\thead';
const AUDIT_HEADER = 'sibling_ref\tstatus\tnote';
const DECISION_HEADER = 'lane\tcell\tfits\treason';
const RESIDUE_HEADER = 'lane\tcell\tr62Quote\theadQuote\thit\tr62Disposition\tfits\tnewDisposition\treason';
const DELTA_COLS = [
  'type', 'lane', 'path', 'provinceSha256', 'lines', 'bgHits', 'quote', 'disposition', 'head',
];

function die(msg) {
  console.error(JSON.stringify({ schema: 'tabi-rebind-ledger-r66', error: msg }));
  process.exit(2);
}

const sha256 = (text) => crypto.createHash('sha256').update(Buffer.from(text, 'utf8')).digest('hex');
const hasBg = (line) => { const low = line.toLowerCase(); return BG_WORDS.some((w) => low.includes(w)); };
// meter's line split for a lane row: drop one trailing \n, strip \r per line
const splitLines = (text) => text.replace(/\n$/, '').split('\n').map((l) => l.replace(/\r$/, ''));

// meter parseRef, copied
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

// meter linePathOf, copied: a line row's path cell is `<relPath>:<digits>`
function linePathOf(cell) {
  const cut = cell.lastIndexOf(':');
  if (cut === -1) return { relPath: cell, line: null };
  const suffix = cell.slice(cut + 1);
  return { relPath: cell.slice(0, cut), line: /^\d+$/.test(suffix) ? Number(suffix) : null };
}

// Strict TSV reader: line 0 is the header (checked when given); every other non-empty
// row must have exactly `cols` cells. A malformed row refuses (the meter would drop it silently).
function tsvRows(text, cols, label, header) {
  const lines = text.split('\n').map((l) => l.replace(/\r$/, ''));
  if (header !== null && lines[0] !== header) die(`${label}: header is not the frozen spelling`);
  const rows = [];
  lines.forEach((l, i) => {
    if (i === 0 || l === '') return;
    const parts = l.split('\t');
    if (parts.length !== cols) die(`${label}: line ${i + 1} has ${parts.length} cells, expected ${cols}`);
    rows.push(parts);
  });
  return rows;
}

const args = process.argv.slice(2);
function opt(name, required = true) {
  const i = args.indexOf(name);
  if (i === -1) { if (required) die(`missing ${name}`); return null; }
  const v = args[i + 1];
  if (v === undefined || v.startsWith('--')) die(`${name} needs a value`);
  return v;
}
const laneDir = fs.realpathSync(path.resolve(opt('--lane')));
const fleet = fs.realpathSync(path.resolve(opt('--fleet')));
const snapshotFile = path.resolve(opt('--snapshot'));
const outDir = path.resolve(opt('--out-dir'));
const decisionsFile = path.resolve(opt('--decisions'));
const revArg = opt('--rev', false);

const git = (dir, argv) => spawnSync('git', ['-C', dir, ...argv], { maxBuffer: 64 * 1024 * 1024 });

const top = git(laneDir, ['rev-parse', '--show-toplevel']);
if (top.status !== 0 || fs.realpathSync(top.stdout.toString('utf8').trim()) !== laneDir) die(`--lane is not a repository toplevel: ${laneDir}`);
const revRes = git(laneDir, ['rev-parse', '--verify', `${revArg ?? 'HEAD'}^{commit}`]);
if (revRes.status !== 0) die(`rev does not resolve: ${revArg ?? 'HEAD'}`);
const REV = revRes.stdout.toString('utf8').trim();

const committed = (rel) => {
  const r = git(laneDir, ['cat-file', '-p', `${REV}:${rel}`]);
  if (r.status !== 0) die(`cannot read ${rel} at ${REV}`);
  return r.stdout.toString('utf8');
};
// the r62 ledgers are read from the working tree (as the task names them) and must equal the committed bytes at REV
const committedAndWorking = (rel) => {
  const c = committed(rel);
  const w = fs.readFileSync(path.join(laneDir, rel), 'utf8');
  if (w !== c) die(`${rel}: working tree differs from committed ${REV}; refusing an uncommitted ledger`);
  return c;
};

// snapshot: meter readSnapshot, strict header
const snapRows = fs.readFileSync(snapshotFile, 'utf8').trimEnd().split('\n').map((l) => l.replace(/\r$/, '').split('\t'));
if (snapRows[0]?.[0] !== 'lane' || snapRows[0]?.[1] !== 'head' || snapRows[0].length !== 2) die('snapshot header must be lane TAB head');
const heads = new Map();
for (const [ln, head, ...extra] of snapRows.slice(1)) {
  if (!ln || !head || extra.length || heads.has(ln) || ln === '.' || ln === '..' || /[\/\\]/.test(ln)) die('invalid or duplicate snapshot row');
  heads.set(ln, head);
}
for (const [ln, head] of heads) {
  if (git(path.join(fleet, ln), ['cat-file', '-e', `${head}^{commit}`]).status !== 0) die(`snapshot head unresolvable: ${ln} ${head}`);
}

// sibling bytes at the snapshot head: null = lane not on snapshot; undefined = no such file at head
const sibCache = new Map();
function sibling(ln, rel) {
  const key = `${ln}\t${rel}`;
  if (!sibCache.has(key)) {
    const head = heads.get(ln);
    let v;
    if (head === undefined) v = null;
    else {
      const r = git(path.join(fleet, ln), ['cat-file', '-p', `${head}:${rel}`]);
      v = r.status === 0 ? r.stdout.toString('utf8') : undefined;
    }
    sibCache.set(key, v);
  }
  return sibCache.get(key);
}

// ---- inputs --------------------------------------------------------------------
const mapRows = tsvRows(committed(MAP_REL), 9, MAP_REL, null);
const deltaRows = tsvRows(committedAndWorking(DELTA_REL), 9, DELTA_REL, DELTA_HEADER);
const auditRows = tsvRows(committedAndWorking(AUDIT_REL), 3, AUDIT_REL, AUDIT_HEADER);
const mapByRef = new Map();
for (const r of mapRows) if (!mapByRef.has(r[2])) mapByRef.set(r[2], r);
{
  const seen = new Set();
  for (const r of auditRows) { if (seen.has(r[0])) die(`audit duplicate: ${r[0]}`); seen.add(r[0]); }
}

// ---- lane rows -----------------------------------------------------------------
function rebindLane(r) {
  const [type, ln, rel, , , , quote, disp] = r;
  const head = heads.get(ln) ?? '-';
  const text = sibling(ln, rel);
  if (text === null || text === undefined) return [type, ln, rel, '-', '0', '0', quote, disp, head];
  const L = splitLines(text);
  return [type, ln, rel, sha256(text), String(L.length), String(L.filter(hasBg).length), quote, disp, head];
}

// ---- line rows -----------------------------------------------------------------
function headLineOf(ln, cell) {
  const { relPath, line } = linePathOf(cell);
  const text = sibling(ln, relPath);
  if (text === null) return { state: 'sibling-absent' };
  if (text === undefined) return { state: 'file-absent' };
  if (line === null) return { state: 'no-line-number' };
  const L = splitLines(text);
  if (line > L.length) return { state: 'line-absent' };
  return { state: 'ok', text: L[line - 1] };
}

const mechDelta = [];
const residue = [];
for (const r of deltaRows) {
  if (r[0] === 'lane') { mechDelta.push(rebindLane(r)); continue; }
  if (r[0] !== 'line') die(`unknown delta row type: ${r[0]}`);
  const [, ln, cell, , , , quote, disp] = r;
  const hl = headLineOf(ln, cell);
  if (hl.state !== 'ok') die(`line row ${ln}:${cell} has no head line (${hl.state}); decide manually`);
  mechDelta.push(r.slice());
  if (hl.text === quote) continue;
  if (hl.text.includes('\t')) die(`head line ${ln}:${cell} contains a tab; the ledger cannot carry it`);
  if (hl.text === '') die(`head line ${ln}:${cell} is empty`);
  residue.push({ ln, cell, r62Quote: quote, headQuote: hl.text, hit: hasBg(hl.text) ? 'yes' : 'no', disp, row: r });
}
const residueKey = (ln, cell) => `${ln}\t${cell}`;

// ---- audit rows ----------------------------------------------------------------
const mechAudit = [];
const auditNoteChanges = [];
const auditStatusMismatch = [];
for (const r of auditRows) {
  const [ref, status, note] = r;
  const parsed = parseRef(ref);
  if (!parsed) die(`audit sibling_ref unparseable: ${ref}`);
  let newNote = note;
  const mrow = mapByRef.get(ref);
  if (mrow) {
    const text = sibling(parsed.lane, parsed.path);
    const cited = mrow[3].replace(/\r$/, '');
    let obs;
    let derived = null;
    if (text === null) obs = 'sibling-absent';
    else if (text === undefined) obs = 'file-absent';
    else {
      const L = text.split('\n').map((l) => l.replace(/\r$/, ''));
      if (L[parsed.line - 1] === cited) obs = 'unchanged';
      else {
        const idx = L.indexOf(cited);
        if (idx !== -1) { obs = 'moved'; derived = idx + 1; } else obs = 'stale';
      }
    }
    if (obs !== status) auditStatusMismatch.push(`${ref}: claimed ${status} observed ${obs}`);
    if (obs === 'moved') {
      const m = /:(\d+)\b/.exec(note);
      if (!m) die(`moved audit note names no line: ${ref}`);
      if (Number(m[1]) !== derived) newNote = note.replace(/:(\d+)\b/, `:${derived}`);
    }
  }
  mechAudit.push([ref, status, newNote]);
  if (newNote !== note) auditNoteChanges.push({ ref, from: note, to: newNote });
}

// ---- decisions and residue -----------------------------------------------------
let decisions = null;
if (fs.existsSync(decisionsFile)) {
  decisions = new Map();
  for (const [ln, cell, fits, reason] of tsvRows(fs.readFileSync(decisionsFile, 'utf8'), 4, decisionsFile, DECISION_HEADER)) {
    if (fits !== 'yes' && fits !== 'no') die(`decision fits must be yes or no: ${ln}:${cell}`);
    if (!reason) die(`decision reason required: ${ln}:${cell}`);
    const k = residueKey(ln, cell);
    if (decisions.has(k)) die(`duplicate decision: ${ln}:${cell}`);
    decisions.set(k, { fits, reason });
  }
}
const residueKeys = new Set(residue.map((x) => residueKey(x.ln, x.cell)));
if (decisions) {
  for (const k of decisions.keys()) if (!residueKeys.has(k)) die(`decision with no residue row: ${k.replace('\t', ':')}`);
  for (const x of residue) if (!decisions.has(residueKey(x.ln, x.cell))) die(`residue row has no decision: ${x.ln}:${x.cell}`);
}

// residue table (always written; decisions columns PENDING until the decisions file exists)
const residueRows = residue.map((x) => {
  const d = decisions?.get(residueKey(x.ln, x.cell));
  const fits = d ? d.fits : 'PENDING';
  const newDisp = d ? (d.fits === 'yes' ? x.disp : 'contested-open') : 'PENDING';
  if (d && !DISPOSITIONS.includes(newDisp)) die(`disposition outside the vocabulary: ${x.disp}`);
  return [x.ln, x.cell, x.r62Quote, x.headQuote, x.hit, x.disp, fits, newDisp, d ? d.reason : 'PENDING'];
});

// ---- writing -------------------------------------------------------------------
function writeTsv(file, header, rows) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const body = [header, ...rows.map((r) => r.join('\t'))].join('\n') + '\n';
  fs.writeFileSync(file, body);
  // round-trip: the written file must parse back to exactly the rows written
  const back = fs.readFileSync(file, 'utf8').split('\n').slice(1).filter((l) => l !== '').map((l) => l.split('\t'));
  if (JSON.stringify(back) !== JSON.stringify(rows)) die(`round-trip mismatch writing ${file}`);
}

const mechDeltaFile = path.join(outDir, 'mechanical', 'adjacency-host-delta-r66.tsv');
const mechAuditFile = path.join(outDir, 'mechanical', 'adjacency-host-audit-r66.tsv');
writeTsv(mechDeltaFile, DELTA_HEADER, mechDelta);
writeTsv(mechAuditFile, AUDIT_HEADER, mechAudit);
writeTsv(path.join(outDir, 'quote-residue.tsv'), RESIDUE_HEADER, residueRows);

// ---- diff summary (computed from the r62 rows against the mechanical output and, if built, the adjudicated output)
const laneChanged = [];
const dispChanged = [];
const lineQuoteChanged = [];
const r62Lines = [];
deltaRows.forEach((r, i) => {
  if (r[0] === 'lane') {
    const n = mechDelta[i];
    const cols = [3, 4, 5, 8].filter((j) => r[j] !== n[j]);
    if (cols.length) laneChanged.push(`${r[1]} ${r[2]} [${cols.map((j) => DELTA_COLS[j]).join(',')}]`);
  } else {
    r62Lines.push(i);
  }
});
const mechLineChanges = r62Lines.filter((i) => deltaRows[i][6] !== mechDelta[i][6] || deltaRows[i][7] !== mechDelta[i][7]).length;

let adjDelta = null;
let adjudicatedWritten = false;
if (!decisions && residue.length > 0) {
  console.log(JSON.stringify({
    schema: 'tabi-rebind-ledger-r66', rev: REV, mechanical: { delta: mechDeltaFile, audit: mechAuditFile },
    residue: residue.length, adjudicated: 'SKIPPED: decisions file missing (' + decisionsFile + ')',
    laneRowsChanged: laneChanged.length, mechanicalLineQuoteOrDispositionChanges: mechLineChanges,
    auditNotesChanged: auditNoteChanges.length, auditStatusMismatch,
  }, null, 1));
  console.error('adjudicated generation skipped: write the decisions file for the residue rows in quote-residue.tsv, then rerun');
  process.exit(2);
}
if (decisions) {
  adjDelta = mechDelta.map((r) => r.slice());
  deltaRows.forEach((r, i) => {
    if (r[0] !== 'line') return;
    const k = residueKey(r[1], r[2]);
    const x = residue.find((y) => residueKey(y.ln, y.cell) === k);
    if (!x) return;
    const d = decisions.get(k);
    const newDisp = d.fits === 'yes' ? r[7] : 'contested-open';
    adjDelta[i][6] = x.headQuote;
    adjDelta[i][7] = newDisp;
  });
  writeTsv(path.join(outDir, 'adjudicated', 'adjacency-host-delta-r66.tsv'), DELTA_HEADER, adjDelta);
  writeTsv(path.join(outDir, 'adjudicated', 'adjacency-host-audit-r66.tsv'), AUDIT_HEADER, mechAudit);
  adjudicatedWritten = true;
}

const dispChangeRows = [];
const adjLineQuoteRows = [];
if (adjDelta) {
  deltaRows.forEach((r, i) => {
    if (r[0] !== 'line') return;
    const n = adjDelta[i];
    if (r[6] !== n[6]) lineQuoteChanged.push(`${r[1]}:${r[2]}: quote -> head line`);
    if (r[7] !== n[7]) dispChangeRows.push(`${r[1]}:${r[2]}: ${r[7]} -> ${n[7]}`);
    if (r[6] !== n[6] || r[7] !== n[7]) adjLineQuoteRows.push(i);
  });
}

const summary = {
  schema: 'tabi-rebind-ledger-r66',
  rev: REV,
  snapshotLanes: heads.size,
  deltaLaneRows: deltaRows.filter((r) => r[0] === 'lane').length,
  deltaLineRows: r62Lines.length,
  auditRows: auditRows.length,
  mapRows: mapRows.length,
  laneRowsChanged: laneChanged.length,
  laneRowChanges: laneChanged,
  mechanicalLineRowsChangedQuoteOrDisposition: mechLineChanges,
  residueRows: residue.length,
  adjudicatedLineRowsChanged: adjLineQuoteRows.length,
  adjudicatedQuoteChanges: lineQuoteChanged,
  dispositionChanges: dispChangeRows.length,
  dispositionChangeList: dispChangeRows,
  auditNotesChanged: auditNoteChanges.length,
  auditNoteChangeList: auditNoteChanges,
  auditStatusMismatch,
  adjudicatedWritten,
};
const text = JSON.stringify(summary, null, 1) + '\n';
fs.writeFileSync(path.join(outDir, 'diff-summary.json'), text);
console.log(text);
process.exit(0);
