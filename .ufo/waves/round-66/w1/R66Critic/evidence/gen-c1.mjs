// Attack-only generator for R66Critic (scratch). Derives the r62-shape ledgers
// mechanically at the frozen snapshot heads. Reads only: git cat-file at
// snapshot heads / the base rev, and the frozen meter source (BG_WORDS copied).
// Modes:
//   linesonly : lane rows + audit rows rebound; line rows copied verbatim from r62
//               (= the claim's mechanical-only control, quote residue left).
//   full      : additionally rebind line rows by content identity, rewrite residue
//               quotes to the whole line, drop rows on lines that are no longer hits,
//               and emit NEW hit lines with placeholder disposition contested-open.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const [, , mode, outDir] = process.argv;
if (!['linesonly', 'full'].includes(mode) || !outDir) { console.error('usage: gen-c1.mjs linesonly|full <outDir>'); process.exit(2); }

const T = '/home/vgpnk/Projects/shokunin/tabi-shokunin';
const F = '/home/vgpnk/Projects/shokunin';
const REV = '2816adb359a50c2fd83fa975e39f0650aa189984';
const SNAP = T + '/.ufo/waves/round-66/measure/snapshot-live-r66.tsv';
const METER = T + '/.ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs';

const meterSrc = fs.readFileSync(METER, 'utf8');
const BG = JSON.parse(meterSrc.match(/const BG_WORDS = (\[.*?\]);/)[1].replace(/'/g, '"'));
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const isBg = (line) => { const low = line.toLowerCase(); return BG.some((w) => low.includes(w)); };

const showAt = (repo, rev, rel) => {
  const r = spawnSync('git', ['-C', repo, 'cat-file', '-p', `${rev}:${rel}`], { maxBuffer: 64 * 1024 * 1024 });
  return r.status === 0 ? r.stdout.toString('utf8') : undefined;
};

// snapshot (strict lane TAB head)
const snapRows = fs.readFileSync(SNAP, 'utf8').trimEnd().split('\n').map((l) => l.replace(/\r$/, '').split('\t'));
if (snapRows[0][0] !== 'lane' || snapRows[0][1] !== 'head') throw new Error('bad snapshot header');
const heads = new Map(snapRows.slice(1).map(([l, h]) => [l, h]));

// roster: same rule as the meter's rosterScan (dot-entries skipped, real dirs or dir-symlinks, .git or HEAD present, not tabi)
const roster = fs.readdirSync(F, { withFileTypes: true })
  .filter((d) => !d.name.startsWith('.'))
  .filter((d) => {
    if (d.isDirectory()) return true;
    if (!d.isSymbolicLink()) return false;
    try { return fs.statSync(path.join(F, d.name)).isDirectory(); } catch { return false; }
  })
  .filter((d) => (fs.existsSync(path.join(F, d.name, '.git')) || fs.existsSync(path.join(F, d.name, 'HEAD'))) && d.name !== 'tabi-shokunin')
  .map((d) => d.name).sort();
const snapLanes = [...heads.keys()].sort();
const rosterMatchesSnapshot = JSON.stringify(roster) === JSON.stringify(snapLanes);

// map rows at base rev
const parseRef = (ref) => {
  const at = ref.indexOf('@'); const c1 = ref.indexOf(':', at); const c2 = ref.lastIndexOf(':');
  const suffix = ref.slice(c2 + 1);
  return { lane: ref.slice(0, at), path: ref.slice(c1 + 1, c2), line: Number(suffix) };
};
const mapRows = showAt(T, REV, 'corpus/adjacency.tsv').split('\n').slice(1).map((l) => l.replace(/\r$/, '')).filter((l) => l).map((l) => l.split('\t')).filter((p) => p.length === 9);

// old r62 ledgers at base rev
const oldAudit = showAt(T, REV, 'corpus/adjacency-host-audit-r62.tsv').split('\n').slice(1).map((l) => l.replace(/\r$/, '')).filter((l) => l).map((l) => l.split('\t')).filter((p) => p.length === 3);
const oldDeltaAll = showAt(T, REV, 'corpus/adjacency-host-delta-r62.tsv').split('\n').slice(1).map((l) => l.replace(/\r$/, '')).filter((l) => l).map((l) => l.split('\t')).filter((p) => p.length === 9);

// ---------- audit (mechanical rebind of status + moved-line note) ----------
const auditOut = [];
const auditStatusChanges = [];
const oldAuditByRef = new Map(oldAudit.map((r) => [r[0], r]));
for (const row of mapRows) {
  const ref = row[2]; const p = parseRef(ref); const cited = row[3].replace(/\r$/, '');
  const text = showAt(F + '/' + p.lane, heads.get(p.lane), p.path);
  let status; let note = '-';
  if (text === undefined) { status = 'file-absent'; note = `absent at the ${heads.get(p.lane).slice(0, 8)} head`; }
  else {
    const lines = text.split('\n').map((l) => l.replace(/\r$/, ''));
    if (lines[p.line - 1] === cited) status = 'unchanged';
    else {
      const idx = lines.indexOf(cited);
      if (idx !== -1) { status = 'moved'; note = `text now at :${idx + 1} — "${cited}"`; }
      else { status = 'stale'; note = `pinned text absent at the ${heads.get(p.lane).slice(0, 8)} head`; }
    }
  }
  const old = oldAuditByRef.get(ref);
  if (!old || old[1] !== status) auditStatusChanges.push({ ref, old: old ? old[1] : null, new: status });
  auditOut.push([ref, status, note]);
}

// ---------- delta: lane rows (always) ----------
const laneTargets = new Map(roster.map((l) => [l, ['PROVINCE.md']]));
for (const row of mapRows) { const p = parseRef(row[2]); if (laneTargets.has(p.lane) && !laneTargets.get(p.lane).includes(p.path)) laneTargets.get(p.lane).push(p.path); }

const deltaOut = [];
const laneRowText = new Map(); // key lane\tpath -> text (for line-row screening)
const laneHeader = 'type\tlane\tpath\tprovinceSha256\tlines\tbgHits\tquote\tdisposition\thead';
for (const lane of roster) {
  const head = heads.get(lane);
  for (const rel of laneTargets.get(lane)) {
    const text = showAt(F + '/' + lane, head, rel);
    if (text === undefined || text === null) { deltaOut.push(['lane', lane, rel, '-', '-', '-', '-', '-', head]); continue; }
    const linesArr = text.replace(/\n$/, '').split('\n').map((l) => l.replace(/\r$/, ''));
    const hits = linesArr.filter(isBg).length;
    deltaOut.push(['lane', lane, rel, sha(Buffer.from(text, 'utf8')), String(linesArr.length), String(hits), '-', '-', head]);
    laneRowText.set(lane + '\t' + rel, linesArr);
  }
}

// ---------- delta: line rows ----------
const linePathOf = (cell) => { const cut = cell.lastIndexOf(':'); return { relPath: cell.slice(0, cut), line: Number(cell.slice(cut + 1)) }; };
const oldLineRows = oldDeltaAll.filter((r) => r[0] === 'line');
const routeCounts = { contentRebind: 0, sameLineResidueFix: 0, newHitPlaceholder: 0, droppedNotHit: 0, keptVerbatim: 0 };
const dispositionChanges = [];
const newLineRows = [];
const tabInQuote = [];

if (mode === 'linesonly') {
  // claim's control: line rows copied verbatim (quote residue left in place)
  for (const r of oldLineRows) newLineRows.push(r);
  routeCounts.keptVerbatim = oldLineRows.length;
} else {
  // index old rows by lane\trel
  const byFile = new Map();
  for (const r of oldLineRows) {
    const { relPath, line } = linePathOf(r[2]);
    const k = r[1] + '\t' + relPath;
    if (!byFile.has(k)) byFile.set(k, []);
    byFile.get(k).push({ row: r, relPath, line, used: false });
  }
  for (const [key, linesArr] of laneRowText) {
    const [lane, rel] = key.split('\t');
    const cands = byFile.get(key) || [];
    linesArr.forEach((whole, i) => {
      const ln = i + 1;
      if (!isBg(whole)) return;
      if (whole.includes('\t')) tabInQuote.push(`${lane}:${rel}:${ln}`);
      // (b) content identity: a prior row whose quote is this whole line
      let hit = cands.find((c) => !c.used && c.row[6] === whole);
      let route = 'contentRebind';
      if (!hit) { hit = cands.find((c) => !c.used && c.line === ln); route = 'sameLineResidueFix'; }
      if (hit) {
        hit.used = true;
        if (hit.row[7] !== hit.row[7]) {}
        if (route === 'sameLineResidueFix' && hit.row[6] !== whole) { /* residue: quote rewritten to whole line, disposition kept */ }
        newLineRows.push(['line', lane, `${rel}:${ln}`, '-', '-', '-', whole, hit.row[7], '-']);
        routeCounts[route]++;
      } else {
        newLineRows.push(['line', lane, `${rel}:${ln}`, '-', '-', '-', whole, 'contested-open', '-']);
        routeCounts.newHitPlaceholder++;
        dispositionChanges.push({ key: `${lane}:${rel}:${ln}`, old: null, new: 'contested-open', why: 'new hit line, placeholder' });
      }
    });
    for (const c of cands) if (!c.used) { routeCounts.droppedNotHit++; dispositionChanges.push({ key: `${lane}:${c.relPath}:${c.line}`, old: c.row[7], new: null, why: 'row on line no longer a hit / absent' }); }
  }
}

const out = [...deltaOut, ...newLineRows];
const auditText = ['sibling_ref\tstatus\tnote', ...auditOut.map((r) => r.join('\t'))].join('\n') + '\n';
const deltaText = [laneHeader, ...out.map((r) => r.join('\t'))].join('\n') + '\n';
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'audit.tsv'), auditText);
fs.writeFileSync(path.join(outDir, 'delta.tsv'), deltaText);
console.log(JSON.stringify({
  mode, outDir, rosterCount: roster.length, rosterMatchesSnapshot,
  laneRows: deltaOut.length, lineRows: newLineRows.length, routeCounts,
  auditStatusChanges, dispositionChanges: dispositionChanges.length, tabInQuote,
  sampleDispositionChanges: dispositionChanges.slice(0, 8),
}, null, 1));
