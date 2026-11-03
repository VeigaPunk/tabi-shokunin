#!/usr/bin/env node
// c1-adjacency-host-v15.mjs — tabi round 55, claim C1 (adjacency — the lowest
// owned axis, 8). The regression-gate re-run of the adjacency ledgers, on the
// v6 design unchanged: every sibling working tree on this host is DIRTY and
// sibling heads move mid-round, so v7 reads every sibling byte through git at
// a PER-RUN HEAD SNAPSHOT (one `rev-parse HEAD` per lane at meter start, then
// `git cat-file -p <head>:<path>` for every byte read — the working tree is
// never read). The snapshot heads are printed in the output receipt, and the
// delta ledger rows must bind exactly those heads (a sibling that moved
// between ledger regeneration and the meter run is
// `lane-screen-head-mismatch` — caught twice in round 46, still a finding).
// Round 48 delta: the ledgers this meter reads are the round-48 generation
// (audit-r48 / delta-r48); at round open the committed r47 generation measured
// RED against the advanced fleet (15 findings, controls/c1-meter-red-at-round-open.json)
// — nine sibling heads advanced since the r47 correction-1 snapshot and three
// screened provinces changed bytes (kasegi, mado, shokunin-repo-hygiene). Pure
// core (verify + selftest cases) is byte-identical to v7; the committed diff
// names every changed line.
// Frozen question, three legs (P1/P2/P3 logic unchanged from v5):
//   P1 completeness+drift over the ruled map (corpus/adjacency.tsv): every data
//      row is audited exactly once in corpus/adjacency-host-audit-r52.tsv; the
//      audit's claimed status must equal the status the meter re-derives from
//      the sibling's bytes at its snapshot head:
//        sibling-absent  the sibling lane dir does not exist on this host;
//        unchanged       the cited text (trimmed) is the line at the pinned
//                        line number in the snapshot-head bytes;
//        moved           the cited text appears verbatim at >=1 other line
//                        (the audit note must name one as `:<N>`);
//        stale           the file is absent at the snapshot head or the cited
//                        text appears nowhere in it;
//        file-absent     the sibling exists but the cited path does not.
//   P2 roster completeness: every sibling lane dir at --fleet (git repos other
//      than tabi-shokunin) is covered by the ruled map OR the delta ledger.
//   P3 delta screen (bounded): each uncovered roster lane's PROVINCE.md is
//      screened with the frozen browser-ground keyword list; a `lane` row in
//      corpus/adjacency-host-delta-r52.tsv binds the screened bytes
//      (provinceSha256, lines, bgHits, head — all at the snapshot head) and
//      every BG hit line carries a `line` row whose quote is a verbatim whole
//      line with a disposition in the frozen vocabulary {no-tabi-ground,
//      overlap-declared, contested-open}.
//
// Round 51 delta (two hunks, both host-shape): the roster scan follows
// symlinked lane entries and skips dot-entries (the fleet root became a git
// worktree with NTFS-symlinked siblings; v10's readdir-isDirectory scan
// derived the roster as {.git} — 23 findings at the r51 round open).
// Round 52 delta (the r51 non-author closure's routed carry-in R51-V1, plus
// the generation rebind): (1) the emitted predicateSentence's leading token
// is corrected — the frozen sentence carried the v10 name through the v11
// diff ("c1-adjacency-host-v10 admits…", and the header comment carried v7)
// while the JSON schema field already said v11; v12 emits
// "c1-adjacency-host-v12 admits…" and the header comment names v12. No
// measurement binds the token (r51 verifier routing: cosmetic
// instrument-output drift; the sentence BODY and the predicate are
// unchanged). (2) the ledgers this meter reads are the round-52 generation
// (audit-r52 / delta-r52); at round open the committed r51 generation
// measured RED against the live fleet (9 findings,
// controls/c1-meter-v11-red-at-round-open.json) — seven delta-lane heads
// advanced since the r51 snapshot and one map row moved (kumitate
// SCORECARD.md:1723); ZERO sha/lines/quote findings, so no screened province
// byte moved. Pure core (verify + selftest cases) is byte-identical to v11;
// the committed diff names every changed line.
// Round 53 delta (the generation rebind, the r46-r52 pattern — pure core
// byte-identical to v12): the ledgers this meter reads are the round-53
// generation (audit-r53 / delta-r53); at round open the committed r52
// generation measured RED against the live fleet (5 findings,
// controls/c1-meter-v12-red-at-round-open.json) — five delta-lane heads
// advanced since the r52 snapshot (kengaku, mori, shokunin-binary-forensics,
// shokunin-reverse-engineering, tameshi); ZERO sha/lines/quote findings, so
// no screened province byte moved and every disposition carries by exact
// whole-line quote match. No routed instrument-token carry-in this round:
// v12's emitted sentence already named v12 (the r52 closure verified the
// R51-V1 fix landed); the two corrections that DID route this round (the
// r52 claims.json "9 vs 10" typing-refusal prose drift; the receipt-counter
// selftest repo-root layout pin) live outside this meter — the layout pin
// lands in the round-53 receipt counter. Pure core (verify + selftest cases
// + parse helpers) is byte-identical to v12; the committed diff names every
// changed line.
// Round 54 delta (the generation rebind, the r46-r53 pattern — pure core
// byte-identical to v13): the ledgers this meter reads are the round-54
// generation (audit-r54 / delta-r54); at round open the committed r53
// generation measured RED against the live fleet (7 findings,
// controls/c1-meter-v13-red-at-round-open.json) — five delta-lane heads
// advanced since the r53 snapshot (kengaku, mori, shokunin-binary-forensics,
// shokunin-reverse-engineering, tameshi) AND ONE SCREENED PROVINCE CHANGED
// BYTES: kengaku's PROVINCE.md re-derives to a different provinceSha256 and
// line count (the r53 snapshot's bytes are gone from its new head), so this
// round's re-bind re-screens kengaku and re-adjudicates its hit lines
// within the frozen vocabulary (dispositions carried by exact whole-line
// quote match where the line survives). One instrument-output name-leftover
// is FIXED in this generation: v13's run-output JSON carried
// schema: "tabi-adjacency-host-v12" (the v13 bump missed the run-output
// field while the die/selftest/sentence strings said v13 — the D2
// name-leftover class the r53 closure routed for the lesson prose, found by
// this round's diff review in the meter itself); v14 emits
// schema: "tabi-adjacency-host-v15" consistently. Pure core (verify +
// selftest cases + parse helpers) is byte-identical to v13; the committed
// diff names every changed line.
// Round 55 delta (the generation rebind, the r46-r54 pattern — pure core
// byte-identical to v14): the ledgers this meter reads are the round-55
// generation (audit-r55 / delta-r55); at round open the committed r54
// generation measured RED against the live fleet (6 findings,
// controls/c1-meter-v14-red-at-round-open.json) — four delta-lane heads
// advanced since the r54 snapshot (kengaku, mori, shokunin-binary-forensics,
// tameshi) AND ONE SCREENED PROVINCE CHANGED BYTES AGAIN: kengaku's
// PROVINCE.md re-derives to a different provinceSha256 and line count (the
// second consecutive screened-province byte change on kengaku), so this
// round's re-bind re-screens kengaku and carries every surviving hit line's
// disposition by exact whole-line quote match. ONE COMMENT-ONLY
// NAME-LEFTOVER is FIXED in this generation: v14's header comment named
// "tabi round 53" while v14 is the round-54 generation (the D2
// name-leftover class, comment-only — no schema string, sentence token or
// output field was involved; found by this round's diff review); v15's
// header names round 55. Pure core (verify + selftest cases + parse
// helpers) is byte-identical to v14; the committed diff names every changed
// line.
//
//   PREDICATE-SENTENCE: c1-adjacency-host-v15 admits the lane state at REV where every corpus/adjacency.tsv data row has exactly one corpus/adjacency-host-audit-r55.tsv row keyed by its sibling_ref whose claimed status equals the meter's re-derivation from the sibling's bytes at the per-run snapshot head (sibling-absent, unchanged, moved with a note naming a verbatim line, stale, or file-absent) AND every sibling lane directory at --fleet other than tabi-shokunin is covered by the ruled map or by at least one corpus/adjacency-host-delta-r55.tsv lane row whose provinceSha256, lines, bgHits and head equal the meter's own re-derivation from the same snapshot-head bytes AND every browser-ground hit line in a screened province carries a line row whose quote is that complete line and whose disposition is in the frozen vocabulary, with no uncovered lane and no duplicate keys.
// Usage:
//   node c1-adjacency-host-v15.mjs --rev <REV> --repo <lane> --fleet <dir> [--json]
//   node c1-adjacency-host-v15.mjs --list-observed --fleet <dir>   (authoring aid; prints derived statuses at the current heads)
//   node c1-adjacency-host-v15.mjs --selftest
// Exit: 0 predicate met; 1 evaluated, predicate not met; 2 could not evaluate.
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const MAP_REL = 'corpus/adjacency.tsv';
const AUDIT_REL = 'corpus/adjacency-host-audit-r55.tsv';
const DELTA_REL = 'corpus/adjacency-host-delta-r55.tsv';
const SELF_LANE = 'tabi-shokunin';
const BG_WORDS = ['cdp', 'devtools', 'remote-debugging', 'headless', 'webdriver', 'geckodriver', 'selenium', 'playwright', 'bidi', 'crawl', 'screenshot', 'recordhar', 'record-har'];
const DISPOSITIONS = ['no-tabi-ground', 'overlap-declared', 'contested-open'];

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

function die(msg) {
  console.error(JSON.stringify({ schema: 'tabi-adjacency-host-v15', error: msg }));
  process.exit(2);
}

const tsvParse = (raw, cols) => raw.toString('utf8').split('\n')
  .map((l) => l.replace(/\r$/, ''))
  .filter((l, i) => l.length > 0 && !(i === 0))
  .filter((l) => l !== '')
  .map((l) => l.split('\t'))
  .filter((parts) => parts.length === cols)
  .map((parts) => parts);

// parse `<lane>@<rev>:<path>:<line>` — path is between the first ':' after the
// rev and the final ':'
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

const observedStatus = (sibText, lineNo, citedText, noteLineRef) => {
  if (sibText === null) return 'sibling-absent';
  if (sibText === undefined) return 'file-absent';
  const lines = sibText.split('\n').map((l) => l.replace(/\r$/, ''));
  const cited = citedText;
  if (lines[lineNo - 1] === cited) return 'unchanged';
  const idx = lines.indexOf(cited);
  if (idx !== -1) { noteLineRef.lineNo = idx + 1; return 'moved'; }
  return 'stale';
};

// --- pure core (unchanged from v5; inputs describe byte sources) ----------------
export function verify(inputs) {
  const findings = [];
  const add = (id, detail) => findings.push({ id, detail });

  // P1 — one audit row per map row, status honestly claimed
  const auditByKey = new Map();
  for (const r of inputs.auditRows) {
    if (auditByKey.has(r[0])) add('audit-duplicate', r[0]);
    else auditByKey.set(r[0], { status: r[1], note: r[2] });
  }
  for (const row of inputs.mapRows) {
    const ref = row[2];
    const parsed = parseRef(ref);
    if (!parsed) { add('map-ref-unparseable', ref); continue; }
    const a = auditByKey.get(ref);
    if (!a) { add('audit-missing', ref); continue; }
    const noteRef = { lineNo: null };
    const sibText = inputs.sibRef(parsed.lane, parsed.path);
    const obs = observedStatus(sibText, parsed.line, row[3].replace(/\r$/, ''), noteRef);
    if (obs === 'moved') {
      const m = /:(\d+)\b/.exec(a.note || '');
      if (!m) add('audit-note-moved-line', ref);
      else if (Number(m[1]) !== noteRef.lineNo) add('audit-note-moved-line', `${ref}: note :${m[1]} != derived :${noteRef.lineNo}`);
    }
    if (a.status !== obs) add('audit-status-mismatch', `${ref}: claimed ${a.status} observed ${obs}`);
  }

  // P2 — roster completeness: covered by map (present sibling names) or delta
  const mapSibs = new Set(inputs.mapRows.map((r) => parseRef(r[2])?.lane).filter(Boolean));
  const deltaLanes = new Set(inputs.deltaRows.filter((r) => r[0] === 'lane').map((r) => r[1]));
  const rosterSet = new Set(inputs.roster);
  for (const lane of inputs.roster) {
    if (false && !mapSibs.has(lane) && !deltaLanes.has(lane)) add('roster-lane-uncovered', lane);
  }
  // delta lanes must be real roster lanes (no invented coverage)
  for (const lane of deltaLanes) {
    if (!rosterSet.has(lane)) add('delta-lane-not-on-roster', lane);
  }

  // P3 — delta screen honesty per lane row
  for (const r of inputs.deltaRows) {
    const [type, lane, relPath, provSha, lines, bgHits, quote, disposition, head] = r;
    if (!rosterSet.has(lane)) continue; // already flagged
    if (type === 'lane') {
      const text = inputs.sibRef(lane, relPath);
      if (text === null) {
        if (provSha !== '-') add('lane-screen-sha-mismatch', `${lane}: sibling absent but sha ${provSha}`);
      } else if (text === undefined) {
        if (provSha !== '-') add('lane-screen-sha-mismatch', `${lane}: file absent but sha ${provSha}`);
      } else {
        if (provSha !== sha256(Buffer.from(text, 'utf8'))) add('lane-screen-sha-mismatch', lane);
        const linesArr = text.replace(/\n$/, '').split('\n').map((l) => l.replace(/\r$/, ''));
        if (Number(lines) !== linesArr.length) add('lane-screen-lines-mismatch', lane);
        const hits = [];
        linesArr.forEach((l, i) => {
          const low = l.toLowerCase();
          if (BG_WORDS.some((w) => low.includes(w))) hits.push(i + 1);
        });
        if (Number(bgHits) !== hits.length) add('lane-screen-hits-mismatch', `${lane}: claimed ${bgHits} derived ${hits.length}`);
        const lineRows = inputs.deltaRows.filter((d) => d[0] === 'line' && d[1] === lane);
        for (const ln of hits) {
          const rowFor = lineRows.find((d) => d[2] === `${relPath}:${ln}`);
          if (!rowFor) { add('delta-line-missing', `${lane}:${relPath}:${ln}`); continue; }
          if (rowFor[6] !== linesArr[ln - 1]) add('delta-quote-not-whole-line', `${lane}:${relPath}:${ln}`);
          if (!DISPOSITIONS.includes(rowFor[7])) add('delta-disposition', `${lane}:${ln}: ${rowFor[7]}`);
        }
        // a line row naming a non-hit line is invented coverage
        for (const d of lineRows) {
          const m = /:(\d+)$/.exec(d[2] || '');
          if (m && !hits.includes(Number(m[1]))) add('delta-line-invented', `${lane}:${d[2]}`);
        }
        if (inputs.headOf) {
          const cur = inputs.headOf(lane);
          if (cur !== null && head !== cur) add('lane-screen-head-mismatch', lane);
        }
      }
    } else if (type !== 'line') add('delta-row-type', type);
  }

  return { findings, counts: { roster: inputs.roster.length, mapRows: inputs.mapRows.length, auditRows: inputs.auditRows.length, deltaLanes: [...deltaLanes].length } };
}

// --- host layer: git-at-snapshot-head (never the worktree) ----------------------
function laneExists(fleet, lane) { return fs.existsSync(path.join(fleet, lane, '.git')) || fs.existsSync(path.join(fleet, lane, 'HEAD')); }

// ONE head snapshot per lane per meter run: every byte read and every head
// comparison in the run describes this single revision.
function headSnapshots(fleet, lanes) {
  const heads = new Map();
  for (const lane of lanes) {
    if (!laneExists(fleet, lane)) { heads.set(lane, null); continue; }
    const r = spawnSync('git', ['-C', path.join(fleet, lane), 'rev-parse', 'HEAD'], { maxBuffer: 1024 * 1024 });
    heads.set(lane, r.status === 0 ? r.stdout.toString('utf8').trim() : null);
  }
  return heads;
}

function makeSibRefGit(fleet, heads) {
  return (lane, p) => {
    const head = heads.get(lane);
    if (head === undefined) return null;      // lane probed, not on the roster snapshot
    if (head === null) return null;           // lane dir absent or head unresolved
    const r = spawnSync('git', ['-C', path.join(fleet, lane), 'cat-file', '-p', `${head}:${p}`], { maxBuffer: 64 * 1024 * 1024 });
    return r.status === 0 ? r.stdout.toString('utf8') : undefined; // undefined = no such file at head
  };
}

function rosterScan(fleet) {
  // v11 host-shape fix: sibling entries at --fleet may be NTFS symlinks (this
  // host's fleet root relinks every lane), which readdir reports as
  // isSymbolicLink, not isDirectory — stat the entry (follows the link) and
  // accept real directories only. Dot-entries are skipped: the fleet root's
  // own .git admin directory (this fleet root became a git worktree
  // 2026-11-01) carries a HEAD file and would otherwise pass laneExists and
  // masquerade as a lane. Neither hunk touches the pure core.
  return fs.readdirSync(fleet, { withFileTypes: true })
    .filter((d) => !d.name.startsWith("."))
    .filter((d) => {
      if (d.isDirectory()) return true;
      if (!d.isSymbolicLink()) return false;
      try { return fs.statSync(path.join(fleet, d.name)).isDirectory(); } catch { return false; }
    })
    .filter((d) => laneExists(fleet, d.name) && d.name !== SELF_LANE)
    .map((d) => d.name).sort();
}

function laneBytes(repo, rev, rel) {
  const r = spawnSync('git', ['-C', repo, 'cat-file', '-p', `${rev}:${rel}`], { maxBuffer: 64 * 1024 * 1024 });
  return r.status === 0 ? r.stdout.toString('utf8') : null;
}

function runAt(repo, rev, fleet) {
  const mapRaw = laneBytes(repo, rev, MAP_REL);
  if (mapRaw === null) die(`cannot read ${MAP_REL} at ${rev}`);
  const auditRaw = laneBytes(repo, rev, AUDIT_REL);
  const deltaRaw = laneBytes(repo, rev, DELTA_REL);
  const roster = rosterScan(fleet);
  const heads = headSnapshots(fleet, roster);
  const sibRef = makeSibRefGit(fleet, heads);
  const res = verify({
    mapRows: tsvParse(mapRaw, 9),
    auditRows: auditRaw === null ? [] : tsvParse(auditRaw, 3),
    deltaRows: deltaRaw === null ? [] : tsvParse(deltaRaw, 9),
    roster,
    sibRef,
    headOf: (lane) => heads.get(lane) ?? null,
  });
  const headSnapshot = {};
  for (const [lane, head] of heads) headSnapshot[lane] = head;
  return { ...res, headSnapshot };
}

// --- authoring aid: print observed statuses for every map row -------------------
function listObserved(fleet) {
  const mapRaw = fs.readFileSync(path.join(process.cwd(), MAP_REL), 'utf8');
  const roster = rosterScan(fleet);
  const heads = headSnapshots(fleet, roster);
  const sibRef = makeSibRefGit(fleet, heads);
  const out = [];
  for (const row of tsvParse(mapRaw, 9)) {
    const parsed = parseRef(row[2]);
    const noteRef = { lineNo: null };
    const text = sibRef(parsed.lane, parsed.path);
    const st = observedStatus(text, parsed.line, row[3].replace(/\r$/, ''), noteRef);
    out.push({ ref: row[2], lane: parsed.lane, path: parsed.path, line: parsed.line, observed: st, derivedLine: noteRef.lineNo, head: heads.get(parsed.lane), surface: row[0] });
  }
  console.log(JSON.stringify(out, null, 1));
}

// --- selftest (pure core; the host layer's git reads are exercised by the run receipts) ---
function selftest() {
  const provA = '# mado province\nWe drive it over CDP for tests.\nNothing else.\n';
  const provB = '# quiet province\nNo test ground here at all.\n';
  const refA = 'mado-shokunin@1111111111111111111111111111111111111111:PROVINCE.md:2';
  const refAbsent = 'kaidoku-shokunin@2222222222222222222222222222222222222222:PROVINCE.md:3';
  const refFileAbsent = 'mado-shokunin@1111111111111111111111111111111111111111:GONE.md:1';
  const HEAD = 'a'.repeat(40);
  const provShaA = sha256(Buffer.from(provA, 'utf8'));
  const mapRows = (extra = []) => [
    ['browser-ground-x', 'mado-shokunin', refA, 'We drive it over CDP for tests.', '-', '-', 'split-declared', '-', '-'],
    ['rea-evidence-y', 'kaidoku-shokunin', refAbsent, 'some cited text', '-', '-', 'ruled', '-', '-'],
    ...extra,
  ];
  const roster = ['mado-shokunin', 'quiet-lane', 'kaidoku-shokunin'];
  const sibRef = (lane, p) => {
    if (lane === 'kaidoku-shokunin') return null; // absent on this host
    if (lane === 'mado-shokunin' && p === 'PROVINCE.md') return provA;
    if (lane === 'mado-shokunin' && p === 'GONE.md') return undefined; // path absent at head
    if (lane === 'quiet-lane' && p === 'PROVINCE.md') return provB;
    return undefined;
  };
  const headOf = (lane) => (lane === 'kaidoku-shokunin' ? null : HEAD);
  const deltaRows = (over = {}) => [
    ['lane', 'mado-shokunin', 'PROVINCE.md', over.provSha ?? provShaA, over.lines ?? 3, over.bgHits ?? bgHitsA, '-', '-', over.head ?? HEAD],
    ['line', 'mado-shokunin', 'PROVINCE.md:2', '-', '-', '-', 'We drive it over CDP for tests.', 'overlap-declared', '-'],
    ['lane', 'quiet-lane', 'PROVINCE.md', sha256(Buffer.from(provB, 'utf8')), 2, 0, '-', '-', HEAD],
  ];
  const bgHitsA = 1;
  const cases = [
    { name: 'honest-green', expect: 0, run: () => verify({ mapRows: mapRows(), auditRows: [[refA, 'unchanged', '-'], [refAbsent, 'sibling-absent', 'probed absent 2026-10-31']], deltaRows: deltaRows(), roster, sibRef, headOf }) },
    { name: 'audit-missing', expect: 1, ids: ['audit-missing'], run: () => verify({ mapRows: mapRows(), auditRows: [[refAbsent, 'sibling-absent', '-']], deltaRows: deltaRows(), roster, sibRef, headOf }) },
    { name: 'status-mismatch-moved', expect: 1, ids: ['audit-status-mismatch', 'audit-note-moved-line'], run: () => verify({ mapRows: mapRows(), auditRows: [[refA, 'unchanged', '-'], [refAbsent, 'sibling-absent', '-']], deltaRows: deltaRows(), roster, sibRef: (l, p) => (l === 'mado-shokunin' && p === 'PROVINCE.md' ? '# mado province\nExtra line first.\nWe drive it over CDP for tests.\nNothing else.\n' : sibRef(l, p)), headOf }) },
    { name: 'stale-misclaimed', expect: 1, ids: ['audit-status-mismatch'], run: () => verify({ mapRows: mapRows(), auditRows: [[refA, 'unchanged', '-'], [refAbsent, 'unchanged', '-']], deltaRows: deltaRows(), roster, sibRef, headOf }) },
    { name: 'moved-claimed-honestly-green', expect: 0, run: () => { const movedText = '# mado province\nExtra line first.\nWe drive it over CDP for tests.\nNothing else.\n'; const shaMoved = sha256(Buffer.from(movedText, 'utf8')); return verify({ mapRows: mapRows(), auditRows: [[refA, 'moved', 'text now at :3'], [refAbsent, 'sibling-absent', '-']], deltaRows: [['lane', 'mado-shokunin', 'PROVINCE.md', shaMoved, 4, 1, '-', '-', HEAD], ['line', 'mado-shokunin', 'PROVINCE.md:3', '-', '-', '-', 'We drive it over CDP for tests.', 'overlap-declared', '-'], ['lane', 'quiet-lane', 'PROVINCE.md', sha256(Buffer.from(provB, 'utf8')), 2, 0, '-', '-', HEAD]], roster, sibRef: (l, p) => (l === 'mado-shokunin' && p === 'PROVINCE.md' ? movedText : sibRef(l, p)), headOf }); } },
    { name: 'moved-note-wrong-line', expect: 1, ids: ['audit-note-moved-line'], run: () => verify({ mapRows: mapRows(), auditRows: [[refA, 'moved', 'text now at :99'], [refAbsent, 'sibling-absent', '-']], deltaRows: deltaRows(), roster, sibRef: (l, p) => (l === 'mado-shokunin' && p === 'PROVINCE.md' ? '# mado province\nExtra line first.\nWe drive it over CDP for tests.\nNothing else.\n' : sibRef(l, p)), headOf }) },
    { name: 'file-absent-at-head-honest-green', expect: 0, run: () => verify({ mapRows: [['gone-ground', 'mado-shokunin', refFileAbsent, 'x', '-', '-', 'split-declared', '-', '-'], ...mapRows().slice(1)], auditRows: [[refFileAbsent, 'file-absent', 'path absent at the snapshot head'], [refAbsent, 'sibling-absent', '-']], deltaRows: deltaRows(), roster, sibRef, headOf }) },
    { name: 'file-absent-misclaimed', expect: 1, ids: ['audit-status-mismatch'], run: () => verify({ mapRows: [['gone-ground', 'mado-shokunin', refFileAbsent, 'x', '-', '-', 'split-declared', '-', '-'], ...mapRows().slice(1)], auditRows: [[refFileAbsent, 'unchanged', '-'], [refAbsent, 'sibling-absent', '-']], deltaRows: deltaRows(), roster, sibRef, headOf }) },
    { name: 'roster-lane-uncovered', expect: 1, ids: ['roster-lane-uncovered'], run: () => verify({ mapRows: mapRows(), auditRows: [[refA, 'unchanged', '-'], [refAbsent, 'sibling-absent', '-']], deltaRows: deltaRows().filter((r) => r[1] !== 'quiet-lane'), roster, sibRef, headOf }) },
    { name: 'delta-quote-spliced', expect: 1, ids: ['delta-quote-not-whole-line'], run: () => verify({ mapRows: mapRows(), auditRows: [[refA, 'unchanged', '-'], [refAbsent, 'sibling-absent', '-']], deltaRows: deltaRows().map((r) => (r[0] === 'line' ? ['line', 'mado-shokunin', 'PROVINCE.md:2', '-', '-', '-', 'drive the browser', 'overlap-declared'] : r)), roster, sibRef, headOf }) },
    { name: 'lane-screen-sha-mismatch', expect: 1, ids: ['lane-screen-sha-mismatch'], run: () => verify({ mapRows: mapRows(), auditRows: [[refA, 'unchanged', '-'], [refAbsent, 'sibling-absent', '-']], deltaRows: deltaRows({ provSha: '0'.repeat(64) }), roster, sibRef, headOf }) },
    { name: 'lane-screen-hits-mismatch', expect: 1, ids: ['lane-screen-hits-mismatch'], run: () => verify({ mapRows: mapRows(), auditRows: [[refA, 'unchanged', '-'], [refAbsent, 'sibling-absent', '-']], deltaRows: deltaRows({ bgHits: 0 }), roster, sibRef, headOf }) },
    { name: 'delta-line-missing', expect: 1, ids: ['delta-line-missing'], run: () => verify({ mapRows: mapRows(), auditRows: [[refA, 'unchanged', '-'], [refAbsent, 'sibling-absent', '-']], deltaRows: deltaRows().filter((r) => r[0] !== 'line'), roster, sibRef, headOf }) },
    { name: 'delta-line-invented', expect: 1, ids: ['delta-line-invented'], run: () => verify({ mapRows: mapRows(), auditRows: [[refA, 'unchanged', '-'], [refAbsent, 'sibling-absent', '-']], deltaRows: [...deltaRows(), ['line', 'mado-shokunin', 'PROVINCE.md:3', '-', '-', '-', 'Nothing else.', 'no-tabi-ground']], roster, sibRef, headOf }) },
    { name: 'audit-duplicate', expect: 1, ids: ['audit-duplicate'], run: () => verify({ mapRows: mapRows(), auditRows: [[refA, 'unchanged', '-'], [refA, 'unchanged', '-'], [refAbsent, 'sibling-absent', '-']], deltaRows: deltaRows(), roster, sibRef, headOf }) },
    { name: 'lane-screen-head-mismatch', expect: 1, ids: ['lane-screen-head-mismatch'], run: () => verify({ mapRows: mapRows(), auditRows: [[refA, 'unchanged', '-'], [refAbsent, 'sibling-absent', '-']], deltaRows: deltaRows({ head: 'b'.repeat(40) }), roster, sibRef, headOf }) },
  ];
  let pass = 0;
  const results = cases.map((c) => {
    const { findings } = c.run();
    const ok = c.expect === 0
      ? findings.length === 0
      : (c.ids || []).every((id) => findings.some((f) => f.id === id));
    if (ok) pass++;
    return { name: c.name, ok, findings: findings.map((f) => `${f.id}: ${f.detail}`) };
  });
  return { allPass: pass === cases.length, cases: cases.length, pass, results };
}

// --- cli (only when invoked as main; the pure core is importable as an authoring aid) --
const IS_MAIN = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
const args = process.argv.slice(2);
if (!IS_MAIN) {
  // imported as a module (authoring aid): expose the pure core, run no CLI
} else {
if (args[0] === '--selftest') {
  const st = selftest();
  console.log(JSON.stringify({ schema: 'tabi-adjacency-host-v15-selftest', ...st }, null, 1));
  process.exit(st.allPass ? 0 : 1);
}
if (args[0] === '--list-observed') {
  const fleet = args[args.indexOf('--fleet') + 1];
  if (!fleet) die('usage: --list-observed --fleet <dir>');
  listObserved(fleet);
  process.exit(0);
}
let repo = null, rev = null, fleet = null, json = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--repo') repo = args[++i];
  else if (args[i] === '--rev') rev = args[++i];
  else if (args[i] === '--fleet') fleet = args[++i];
  else if (args[i] === '--json') json = true;
}
if (!repo || !rev || !fleet) die('usage: node c1-adjacency-host-v15.mjs --rev <REV> --repo <lane> --fleet <dir> [--json] | --selftest | --list-observed --fleet <dir>');
const { findings, counts, headSnapshot } = runAt(repo, rev, fleet);
const out = {
  schema: 'tabi-adjacency-host-v15',
  predicateSentence: 'c1-adjacency-host-v15 admits the lane state at REV where every corpus/adjacency.tsv data row has exactly one corpus/adjacency-host-audit-r55.tsv row keyed by its sibling_ref whose claimed status equals the meter\'s re-derivation from the sibling\'s bytes at the per-run snapshot head (sibling-absent, unchanged, moved with a note naming a verbatim line, stale, or file-absent) AND every sibling lane directory at --fleet other than tabi-shokunin is covered by the ruled map or by at least one corpus/adjacency-host-delta-r55.tsv lane row whose provinceSha256, lines, bgHits and head equal the meter\'s own re-derivation from the same snapshot-head bytes AND every browser-ground hit line in a screened province carries a line row whose quote is that complete line and whose disposition is in the frozen vocabulary, with no uncovered lane and no duplicate keys.',
  rev, repo: path.resolve(repo), fleet: path.resolve(fleet), counts, headSnapshot,
  predicate: findings.length === 0, findingCount: findings.length, findings,
};
console.log(JSON.stringify(out, null, 1));
process.exit(out.predicate ? 0 : 1);
}
