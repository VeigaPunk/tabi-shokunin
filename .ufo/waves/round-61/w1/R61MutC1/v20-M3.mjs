#!/usr/bin/env node
// c1-adjacency-host-v20.mjs — tabi round 59, claim C1 (adjacency — the lowest
// owned axis, 8). The v20 generation of the adjacency meter: the v18 design
// (P1 audit re-derivation, P2 roster completeness, P3 delta screen over
// git-at-snapshot-head bytes — never the worktree) plus the r58-closure routed
// change set (a)-(e) frozen in .ufo/waves/round-59/claims.json C1.
//
// Frozen r61 delta: required TSV snapshot replaces live head acquisition.
// P1/P2/P3 and all carried truth-table cases are unchanged.
// --audit/--delta read explicit candidate files; defaults read r61 ledgers at --rev.
// Live HEAD is read once per sibling AFTER audit, solely for drift disclosure.
//   PREDICATE-SENTENCE: c1-adjacency-host-v20 admits the lane state at REV where every corpus/adjacency.tsv data row has exactly one corpus/adjacency-host-audit-r61.tsv row keyed by its sibling_ref whose claimed status equals the meter's re-derivation from the sibling's bytes at the frozen snapshot head (sibling-absent, unchanged, moved with a note naming a verbatim line, stale, or file-absent) AND every sibling lane directory at --fleet other than tabi-shokunin is browser-ground-screened at that same snapshot over its PROVINCE.md and every file its map rows reference, so that every present screened file carries a corpus/adjacency-host-delta-r61.tsv lane row whose provinceSha256, lines, bgHits and head equal the meter's own re-derivation and every browser-ground hit line carries a line row keyed by (lane, relPath:line) whose quote is that complete line and whose disposition is in the frozen vocabulary, with no unadjudicated hit line, no orphan line row, no line row on an unscreened file and no invented row AND every sibling lane directory at --fleet other than tabi-shokunin is covered by the ruled map or by at least one corpus/adjacency-host-delta-r61.tsv lane row, with no uncovered lane and no duplicate keys.
// Usage:
//   node c1-adjacency-host-v20.mjs --rev <REV> --repo <lane> --fleet <dir> --snapshot <tsv> [--audit <path>] [--delta <path>] [--json]
//   node c1-adjacency-host-v20.mjs --list-observed --fleet <dir>   (authoring aid; prints derived statuses at the supplied snapshot heads)
//   node c1-adjacency-host-v20.mjs --selftest
// Exit: 0 predicate met; 1 evaluated, predicate not met; 2 could not evaluate.
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const MAP_REL = 'corpus/adjacency.tsv';
const AUDIT_REL = 'corpus/adjacency-host-audit-r61.tsv';
const DELTA_REL = 'corpus/adjacency-host-delta-r61.tsv';
const SELF_LANE = 'tabi-shokunin';
const PROVINCE_REL = 'PROVINCE.md';
const BG_WORDS = ['cdp', 'devtools', 'remote-debugging', 'headless', 'webdriver', 'geckodriver', 'selenium', 'playwright', 'bidi', 'crawl', 'screenshot', 'recordhar', 'record-har'];
const DISPOSITIONS = ['no-tabi-ground', 'overlap-declared', 'contested-open'];

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

// The ONE predicate emission (r57 declared change (b), the routed R56Mutant-m4
// fix): the run output and the selftest's predicate-assert cases both read this
// helper, so an AND->OR mutation of the emission (`findings.length !== 0`) is
// observable — both predicate-assert cases fail and allPass goes false.
export const predicateFrom = (findings) => findings.length === 0;

function die(msg) {
  console.error(JSON.stringify({ schema: 'tabi-adjacency-host-v20', error: msg }));
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
// rev and the final ':'. r59 declared change (c): the suffix must be an
// all-digit, positive, safe integer; a NaN/Infinity/negative/empty suffix is
// unparseable (never a pass).
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

// --- pure core (v18's P1/P2 unchanged; (c)-(e) below) ------------------------
export function verify(inputs) {
  const findings = [];
  const add = (id, detail) => findings.push({ id, detail });

  // one git read per (lane, path) per run (r59 (d): bounded-cost discipline —
  // the universal screen reads each sibling file once, and a byte source that
  // flaps mid-run cannot produce two different answers inside one verify()).
  const readCache = new Map();
  const read = (lane, p) => {
    const k = `${lane}\t${p}`;
    if (!readCache.has(k)) readCache.set(k, inputs.sibRef(lane, p));
    return readCache.get(k);
  };

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
    const sibText = read(parsed.lane, parsed.path);
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
    if (!mapSibs.has(lane) && !deltaLanes.has(lane)) add('roster-lane-uncovered', lane);
  }
  // delta lanes must be real roster lanes (no invented coverage)
  for (const lane of deltaLanes) {
    if (!rosterSet.has(lane)) add('delta-lane-not-on-roster', lane);
  }

  // (d) the screen set: EVERY roster sibling over its PROVINCE.md plus every
  // file its adjacency.tsv rows reference (paths at the snapshot head).
  const screenTargets = new Map();
  for (const lane of inputs.roster) screenTargets.set(lane, new Set([PROVINCE_REL]));
  for (const row of inputs.mapRows) {
    const parsed = parseRef(row[2]);
    if (!parsed || !screenTargets.has(parsed.lane)) continue;
    screenTargets.get(parsed.lane).add(parsed.path);
  }

  // (e) indexes: lane rows keyed by (lane, relPath); line rows keyed by
  // (lane, relPath, line). A row's relPath is its `path` cell minus the final
  // `:<digits>` suffix (the ledger's line-row encoding).
  const laneRowAt = new Map();
  const lineRowAt = new Map();
  const linePathOf = (cell) => {
    const cut = (cell || '').lastIndexOf(':');
    if (cut === -1) return { relPath: cell || '', line: null };
    const suffix = cell.slice(cut + 1);
    return {
      relPath: cell.slice(0, cut),
      line: /^\d+$/.test(suffix) ? Number(suffix) : null,
    };
  };
  for (const r of inputs.deltaRows) {
    if (r[0] === 'lane') {
      const key = `${r[1]}\t${r[2]}`;
      if (!laneRowAt.has(key)) laneRowAt.set(key, r);
    } else if (r[0] === 'line') {
      const { relPath, line } = linePathOf(r[2]);
      const key = `${r[1]}\t${relPath}\t${line}`;
      if (!lineRowAt.has(key)) lineRowAt.set(key, r);
    }
  }

  // P3 — delta screen honesty per lane row (v18 checks, keyed by relPath)
  for (const r of inputs.deltaRows) {
    const [type, lane, relPath, provSha, lines, bgHits, quote, disposition, head] = r;
    if (type === 'line') continue;
    if (type !== 'lane') { add('delta-row-type', type); continue; }
    if (!rosterSet.has(lane)) continue; // already flagged
    const text = read(lane, relPath);
    if (text === null) {
      if (provSha !== '-') add('lane-screen-sha-mismatch', `${lane}: sibling absent but sha ${provSha}`);
      continue;
    }
    if (text === undefined) {
      if (provSha !== '-') add('lane-screen-sha-mismatch', `${lane}: file absent but sha ${provSha}`);
      continue;
    }
    if (provSha !== sha256(Buffer.from(text, 'utf8'))) add('lane-screen-sha-mismatch', `${lane}:${relPath}`);
    const linesArr = text.replace(/\n$/, '').split('\n').map((l) => l.replace(/\r$/, ''));
    if (Number(lines) !== linesArr.length) add('lane-screen-lines-mismatch', `${lane}:${relPath}`);
    const hits = [];
    linesArr.forEach((l, i) => {
      const low = l.toLowerCase();
      if (BG_WORDS.some((w) => low.includes(w))) hits.push(i + 1);
    });
    if (Number(bgHits) !== hits.length) add('lane-screen-hits-mismatch', `${lane}:${relPath}: claimed ${bgHits} derived ${hits.length}`);
    for (const ln of hits) {
      const rowFor = lineRowAt.get(`${lane}\t${relPath}\t${ln}`);
      if (!rowFor) { add('delta-line-missing', `${lane}:${relPath}:${ln}`); continue; }
      if (rowFor[6] !== linesArr[ln - 1]) add('delta-quote-not-whole-line', `${lane}:${relPath}:${ln}`);
      if (!DISPOSITIONS.includes(rowFor[7])) add('delta-disposition', `${lane}:${relPath}:${ln}: ${rowFor[7]}`);
    }
    if (inputs.headOf) {
      const cur = inputs.headOf(lane);
      if (cur !== null && head !== cur) add('lane-screen-head-mismatch', lane);
    }
  }

  // (d) the universal screen: a present screened file needs its lane row; a hit
  // line in a file whose lane row is absent is unadjudicated.
  for (const [lane, files] of screenTargets) {
    for (const relPath of files) {
      const text = read(lane, relPath);
      if (text === null || text === undefined) continue;
      if (laneRowAt.has(`${lane}\t${relPath}`)) continue;
      add('bg-screen-missing', `${lane}:${relPath}`);
      const linesArr = text.replace(/\n$/, '').split('\n').map((l) => l.replace(/\r$/, ''));
      linesArr.forEach((l, i) => {
        const low = l.toLowerCase();
        if (!BG_WORDS.some((w) => low.includes(w))) return;
        const ln = i + 1;
        if (!lineRowAt.has(`${lane}\t${relPath}\t${ln}`)) add('bg-hit-unadjudicated', `${lane}:${relPath}:${ln}`);
      });
    }
  }

  // (e) stray line rows: keyed by (lane, relPath), never by line number alone
  for (const r of inputs.deltaRows) {
    if (r[0] !== 'line') continue;
    const lane = r[1];
    const { relPath, line } = linePathOf(r[2]);
    if (!inputs.deltaRows.some((d) => d[0] === 'lane' && d[1] === lane)) {
      add('orphan-line-row', `${lane}:${r[2]}`);
      continue;
    }
    if (!laneRowAt.has(`${lane}\t${relPath}`) || line === null) {
      add('line-row-unscreened-file', `${lane}:${r[2]}`);
      continue;
    }
    const text = read(lane, relPath);
    if (text === null || text === undefined) {
      add('line-row-unscreened-file', `${lane}:${r[2]}`);
      continue;
    }
    const linesArr = text.replace(/\n$/, '').split('\n').map((l) => l.replace(/\r$/, ''));
    const whole = linesArr[line - 1];
    const isHit = whole !== undefined && BG_WORDS.some((w) => whole.toLowerCase().includes(w));
    if (!isHit) add('delta-line-invented', `${lane}:${r[2]}`);
  }

  return {
    findings,
    counts: {
      roster: inputs.roster.length,
      mapRows: inputs.mapRows.length,
      auditRows: inputs.auditRows.length,
      deltaLanes: [...deltaLanes].length,
      bgScreenSiblings: [...screenTargets.keys()].length,
    },
  };
}

// --- host layer: git-at-snapshot-head (never the worktree) ----------------------
function laneExists(fleet, lane) { return fs.existsSync(path.join(fleet, lane, '.git')) || fs.existsSync(path.join(fleet, lane, 'HEAD')); }

export function readSnapshot(file) {
  const rows = fs.readFileSync(file, 'utf8').trimEnd().split('\n').map((l) => l.replace(/\r$/, '').split('\t'));
  // The frozen r61 input has a blank second header cell; accept that legacy
  // spelling as well as the documented lane<TAB>head header, without editing it.
  if (rows[0]?.[0] !== 'lane' || !['head', ''].includes(rows[0]?.[1]) || rows[0].length !== 2) throw new Error('snapshot header must be lane TAB head');
  const heads = new Map();
  for (const [lane, head, ...extra] of rows.slice(1)) {
    if (!lane || !head || extra.length || heads.has(lane) || lane === '.' || lane === '..' || /[\/\\]/.test(lane)) throw new Error('invalid or duplicate snapshot row');
    heads.set(lane, head);
  }
  return heads;
}

function snapshotFindings(fleet, roster, heads) {
  const findings = [];
  for (const lane of roster) if (!heads.has(lane)) findings.push({ id: 'unresolvable-head', detail: lane + ': snapshot head missing' });
  for (const [lane, head] of heads) {
    const r = spawnSync('git', ['-C', path.join(fleet, lane), 'cat-file', '-e', head + '^{commit}']);
    if (r.status !== 0) findings.push({ id: 'unresolvable-head', detail: lane + ': ' + head });
  }
  return findings;
}

function discloseDrift(fleet, heads) {
  const drift = [];
  for (const [lane, snapshotHead] of heads) {
    const r = spawnSync('git', ['-C', path.join(fleet, lane), 'rev-parse', 'HEAD']);
    const liveHead = r.status === 0 ? r.stdout.toString('utf8').trim() : null;
    if (liveHead !== snapshotHead) drift.push({ lane, snapshotHead, liveHead });
  }
  return drift;
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
  // masquerade as a lane.
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

function runAt(repo, rev, fleet, snapshot, audit = null, delta = null) {
  const mapRaw = laneBytes(repo, rev, MAP_REL);
  if (mapRaw === null) die(`cannot read ${MAP_REL} at ${rev}`);
  const auditRaw = audit ? fs.readFileSync(audit, 'utf8') : laneBytes(repo, rev, AUDIT_REL);
  const deltaRaw = delta ? fs.readFileSync(delta, 'utf8') : laneBytes(repo, rev, DELTA_REL);
  const roster = rosterScan(fleet);
  const heads = readSnapshot(snapshot);
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
  res.findings.push(...snapshotFindings(fleet, roster, heads));
  if (auditRaw === null) res.findings.push({ id: 'ledger-generation-mismatch', detail: AUDIT_REL + ' missing at ' + rev });
  if (deltaRaw === null) res.findings.push({ id: 'ledger-generation-mismatch', detail: DELTA_REL + ' missing at ' + rev });
  res.counts.unresolvableHead = res.findings.filter((f) => f.id === 'unresolvable-head').length;
  return { ...res, headSnapshot, drift: discloseDrift(fleet, heads) };
}

// --- authoring aid: print observed statuses for every map row -------------------
function listObserved(fleet, snapshot) {
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

// ONE named per-case verdict (r58 declared change (c), the routed R57Reviewer
// mG fix; r59 (b) adds the findings-mismatch rows to its truth table): the run
// loop below and the harness-guard selftest cases both read this function, so a
// harness-level mutant that drops the findings, predicate or count terms is
// observable — the corresponding guard case fails and allPass goes false.
function caseOk(c, findings, emitted) {
  const okFindings = c.expect === 0
    ? findings.length === 0
    : (c.ids || []).every((id) => findings.some((f) => f.id === id));
  // an asserting case binds the emitted predicate to the frozen expectation;
  // the partial case's ONE failing clause must be the only finding, so
  // "exactly one clause failed" is measured, not assumed.
  const okPredicate = c.assertPredicate === undefined ? true : emitted === c.assertPredicate;
  const okCount = c.assertFindingCount === undefined ? true : findings.length === c.assertFindingCount;
  return okFindings && okPredicate && okCount;
}

// --- selftest (pure core; the host layer's git reads are exercised by the run receipts) ---
function hostSelftest() {
  const scratch = '/fast/scratch/hyaku/tabi-r61/R61Exec1';
  fs.mkdirSync(scratch, { recursive: true });
  const dir = fs.mkdtempSync(path.join(scratch, 'snapshot-fixture-'));
  const results = [];
  const fixtureCommands = [];
  const check = (name, ok, evidence) => results.push({ name, ok, evidence });
  try {
    const fleet = path.join(dir, 'fleet');
    const repo = path.join(dir, 'lane');
    const sibling = path.join(fleet, 'quiet-lane');
    fs.mkdirSync(sibling, { recursive: true });
    fs.mkdirSync(repo);
    const git = (cwd, argv, input) => {
      const r = spawnSync('git', ['-C', cwd, ...argv], { input, encoding: 'utf8', env: { ...process.env, GIT_AUTHOR_NAME: 'fixture', GIT_AUTHOR_EMAIL: 'fixture@example.invalid', GIT_COMMITTER_NAME: 'fixture', GIT_COMMITTER_EMAIL: 'fixture@example.invalid' } });
      fixtureCommands.push({ argv: ['git', '-C', cwd, ...argv], exit: r.status });
      if (r.status !== 0) throw new Error(r.stderr);
      return r.stdout.trim();
    };
    git(sibling, ['init', '-q']);
    git(repo, ['init', '-q']);
    // Guard every object/ref mutation, not just fixture initialization.
    const mutate = (cwd, argv, input) => {
      if (git(cwd, ['rev-parse', '--show-toplevel']) !== cwd) throw new Error('fixture root mismatch');
      return git(cwd, argv, input);
    };
    const blob = (cwd, text) => mutate(cwd, ['hash-object', '-w', '--stdin'], text);
    const commit = (cwd, entries) => {
      const tree = mutate(cwd, ['mktree'], entries);
      const head = mutate(cwd, ['commit-tree', tree], 'fixture\n');
      mutate(cwd, ['update-ref', 'HEAD', head]);
      return head;
    };
    const text = '# quiet province\nNo test ground here.\n';
    const oldHead = commit(sibling, `100644 blob ${blob(sibling, text)}\tPROVINCE.md\n`);
    const mapHeader = 'surface\tlane\tsibling_ref\tquote\tx\ty\tstatus\tz\tw\n';
    const auditHeader = 'sibling_ref\tstatus\tnote\n';
    const deltaText = 'type\tlane\tpath\tprovinceSha256\tlines\tbgHits\tquote\tdisposition\thead\n' +
      ['lane', 'quiet-lane', 'PROVINCE.md', sha256(Buffer.from(text)), 2, 0, '-', '-', oldHead].join('\t') + '\n';
    const corpus = mutate(repo, ['mktree'], [
      `100644 blob ${blob(repo, mapHeader)}\tadjacency.tsv`,
      `100644 blob ${blob(repo, auditHeader)}\tadjacency-host-audit-r61.tsv`,
      `100644 blob ${blob(repo, deltaText)}\tadjacency-host-delta-r61.tsv`,
    ].sort().join('\n') + '\n');
    const rev = commit(repo, `040000 tree ${corpus}\tcorpus\n`);
    const snapshot = path.join(dir, 'snapshot.tsv');
    fs.writeFileSync(snapshot, `lane\thead\nquiet-lane\t${oldHead}\n`);
    commit(sibling, `100644 blob ${blob(sibling, 'Changed live province with CDP.\n')}\tPROVINCE.md\n`);
    const invoke = (extra) => {
      const r = spawnSync(process.execPath, [import.meta.filename, '--repo', repo, '--rev', rev, '--fleet', fleet, ...extra, '--json'], { encoding: 'utf8' });
      let out = null;
      try { out = JSON.parse(r.stdout); } catch {}
      return { status: r.status, out, stderr: r.stderr };
    };
    const moved = invoke(['--snapshot', snapshot]);
    check('moved-sibling-snapshot-green-with-drift', moved.status === 0 && moved.out?.predicate === true && moved.out?.drift?.length >= 1, moved);
    const missing = invoke([]);
    check('missing-snapshot-exits-2', missing.status === 2 && missing.stderr.includes('--snapshot'), missing);
    fs.writeFileSync(snapshot, `lane\thead\nquiet-lane\t${'0'.repeat(40)}\n`);
    const bad = invoke(['--snapshot', snapshot]);
    check('unresolvable-head-refused', bad.status === 1 && bad.out?.findings?.some((f) => f.id === 'unresolvable-head'), bad);
    fs.writeFileSync(snapshot, `lane\thead\nquiet-lane\t${oldHead}\n`);
    const oldCorpus = mutate(repo, ['mktree'], [
      `100644 blob ${blob(repo, mapHeader)}\tadjacency.tsv`,
      `100644 blob ${blob(repo, auditHeader)}\tadjacency-host-audit-r59.tsv`,
      `100644 blob ${blob(repo, deltaText)}\tadjacency-host-delta-r59.tsv`,
    ].sort().join('\n') + '\n');
    const oldRev = commit(repo, `040000 tree ${oldCorpus}\tcorpus\n`);
    const mismatch = spawnSync(process.execPath, [import.meta.filename, '--repo', repo, '--rev', oldRev, '--fleet', fleet, '--snapshot', snapshot, '--json'], { encoding: 'utf8' });
    const mismatchOut = JSON.parse(mismatch.stdout);
    check('r61-ledger-generation-mismatch', mismatch.status === 1 && mismatchOut.findings.some((f) => f.id === 'ledger-generation-mismatch'), { status: mismatch.status, out: mismatchOut });
    results[0].fixtureCommands = fixtureCommands;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  return results;
}

function selftest() {
  const provA = '# mado province\nWe drive it over CDP for tests.\nNothing else.\n';
  const provB = '# quiet province\nNo test ground here at all.\n';
  const refA = 'mado-shokunin@1111111111111111111111111111111111111111:PROVINCE.md:2';
  const refAbsent = 'kaidoku-shokunin@2222222222222222222222222222222222222222:PROVINCE.md:3';
  const refFileAbsent = 'mado-shokunin@1111111111111111111111111111111111111111:GONE.md:1';
  const refMalformed = 'mado-shokunin@1111111111111111111111111111111111111111:PROVINCE.md:12x';
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
  // r59 L1 pin: a KAMA-SHAPED newly screened lane — a map row references a
  // non-PROVINCE file, and the universal screen must validate that file's row
  // with the FULL v18 body (sha/lines/bgHits/head + quote/disposition/invented)
  // exactly as it validates PROVINCE.md.
  const provKama = '# kama province\nListener census lane.\n';
  const censusKama = '# listener census\nline2\nline3\nWe use playwright for the census.\nline5\n';
  const refKamaCensus = 'kama-shokunin@6666666666666666666666666666666666666666:corpus/knowledge/listener-census.md:1';
  const kamaDelta = (over = {}) => [
    ...deltaRows(),
    ['lane', 'kama-shokunin', 'PROVINCE.md', sha256(Buffer.from(provKama, 'utf8')), 2, 0, '-', '-', HEAD],
    ['lane', 'kama-shokunin', 'corpus/knowledge/listener-census.md', over.censusSha ?? sha256(Buffer.from(censusKama, 'utf8')), 5, 1, '-', '-', over.censusHead ?? HEAD],
  ];
  const kamaInput = (delta, over = {}) => ({
    mapRows: mapRows([['cdp-live-target-census', 'kama-shokunin', refKamaCensus, '# listener census', '-', '-', 'ruled', '-', '-']]),
    auditRows: [[refA, 'unchanged', '-'], [refAbsent, 'sibling-absent', '-'], [refKamaCensus, 'unchanged', '-']],
    deltaRows: delta,
    roster: [...roster, 'kama-shokunin'],
    sibRef: (l, p) => (l === 'kama-shokunin' && p === 'PROVINCE.md' ? provKama
      : l === 'kama-shokunin' && p === 'corpus/knowledge/listener-census.md' ? (over.censusText ?? censusKama)
        : sibRef(l, p)),
    headOf,
  });
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
    // r57 declared change (b): the two predicate-assert cases. They assert the
    // EMITTED predicate from the shared helper — not the finding count — so an
    // AND->OR mutation of `predicateFrom` is caught here (this is the
    // R56Mutant-m4 survivor the r56 closure routed into this generation).
    { name: 'predicate-assert-green', expect: 0, assertPredicate: true, run: () => verify({ mapRows: mapRows(), auditRows: [[refA, 'unchanged', '-'], [refAbsent, 'sibling-absent', 'probed absent 2026-10-31']], deltaRows: deltaRows(), roster, sibRef, headOf }) },
    { name: 'predicate-assert-partial', expect: 1, ids: ['delta-quote-not-whole-line'], assertPredicate: false, assertFindingCount: 1, run: () => verify({ mapRows: mapRows(), auditRows: [[refA, 'unchanged', '-'], [refAbsent, 'sibling-absent', '-']], deltaRows: deltaRows().map((r) => (r[0] === 'line' ? ['line', 'mado-shokunin', 'PROVINCE.md:2', '-', '-', '-', 'drive the browser', 'overlap-declared'] : r)), roster, sibRef, headOf }) },
    // r58 declared change (b): the ROUTED r57-closure fix for the R57MutMeter
    // m4b survivor. A map ref whose line-number suffix is malformed (audited
    // under that same key) must be rejected by parseRef and produce EXACTLY
    // the single id map-ref-unparseable.
    { name: 'map-ref-unparseable', expect: 1, ids: ['map-ref-unparseable'], assertFindingCount: 1, run: () => verify({ mapRows: mapRows([['bogus-ground', 'mado-shokunin', refMalformed, 'We drive it over CDP for tests.', '-', '-', 'split-declared', '-', '-']]), auditRows: [[refA, 'unchanged', '-'], [refAbsent, 'sibling-absent', '-'], [refMalformed, 'unchanged', '-']], deltaRows: deltaRows(), roster, sibRef, headOf }) },
    // r58 declared change (c): the ROUTED r57-closure fix for the R57Reviewer
    // mG survivor. This case asserts caseOk's OWN truth table: a matching
    // finding set with a mismatched predicate assertion is false, a matching
    // finding set with a mismatched count assertion is false, and the
    // all-match row is true. The `direct` term re-reads the same truth table
    // OUTSIDE the per-case verdict path, so a findings-term drop cannot mask
    // its own guard (r59 L1 pin for M1).
    { name: 'harness-guard', expect: 0, direct: () => {
      const rows = [
        caseOk({ expect: 0, assertPredicate: false }, [], true),
        caseOk({ expect: 0, assertFindingCount: 1 }, [], true),
        caseOk({ expect: 0, assertPredicate: true, assertFindingCount: 0 }, [], true),
      ];
      const want = [false, false, true];
      return rows.every((v, i) => v === want[i]);
    }, run: () => {
      const rows = [
        caseOk({ expect: 0, assertPredicate: false }, [], true),
        caseOk({ expect: 0, assertFindingCount: 1 }, [], true),
        caseOk({ expect: 0, assertPredicate: true, assertFindingCount: 0 }, [], true),
      ];
      const want = [false, false, true];
      return { findings: rows.every((v, i) => v === want[i]) ? [] : [{ id: 'harness-guard', detail: `caseOk truth table ${JSON.stringify(rows)} != ${JSON.stringify(want)}` }] };
    } },
    // r59 declared change (b) — ROUTED D5/N1: the findings-mismatch rows of the
    // harness truth table. A mismatched finding expectation must return false
    // even when the predicate term matches and even when the count term matches
    // (the R57Reviewer mG survivor class: a findings-term drop). The `direct`
    // term is the observable that a findings-term drop cannot self-mask.
    { name: 'harness-guard-findings-predicate-match', expect: 0, direct: () => caseOk({ expect: 1, ids: ['alpha'], assertPredicate: false }, [{ id: 'beta' }], false) === false, run: () => {
      const ok = caseOk({ expect: 1, ids: ['alpha'], assertPredicate: false }, [{ id: 'beta' }], false);
      return { findings: ok ? [{ id: 'harness-guard-findings', detail: 'findings-mismatch + predicate-match returned true' }] : [] };
    } },
    { name: 'harness-guard-findings-count-match', expect: 0, direct: () => caseOk({ expect: 1, ids: ['alpha'], assertFindingCount: 1 }, [{ id: 'beta' }], false) === false, run: () => {
      const ok = caseOk({ expect: 1, ids: ['alpha'], assertFindingCount: 1 }, [{ id: 'beta' }], false);
      return { findings: ok ? [{ id: 'harness-guard-findings', detail: 'findings-mismatch + count-match returned true' }] : [] };
    } },
    // r59 declared change (c) — ROUTED D5/N2: the five malformed map-ref
    // suffixes. Each must be rejected by parseRef and produce EXACTLY the one
    // map-ref-unparseable finding (never a pass, never a silent status).
    { name: 'map-ref-alpha-suffix', expect: 1, ids: ['map-ref-unparseable'], assertFindingCount: 1, run: () => verify({ mapRows: mapRows([['bogus-ground', 'mado-shokunin', 'mado-shokunin@1111111111111111111111111111111111111111:PROVINCE.md:x', 'We drive it over CDP for tests.', '-', '-', 'split-declared', '-', '-']]), auditRows: [[refA, 'unchanged', '-'], [refAbsent, 'sibling-absent', '-']], deltaRows: deltaRows(), roster, sibRef, headOf }) },
    { name: 'map-ref-empty-suffix', expect: 1, ids: ['map-ref-unparseable'], assertFindingCount: 1, run: () => verify({ mapRows: mapRows([['bogus-ground', 'mado-shokunin', 'mado-shokunin@1111111111111111111111111111111111111111:PROVINCE.md:', 'We drive it over CDP for tests.', '-', '-', 'split-declared', '-', '-']]), auditRows: [[refA, 'unchanged', '-'], [refAbsent, 'sibling-absent', '-']], deltaRows: deltaRows(), roster, sibRef, headOf }) },
    { name: 'map-ref-signed-suffix', expect: 1, ids: ['map-ref-unparseable'], assertFindingCount: 1, run: () => verify({ mapRows: mapRows([['bogus-ground', 'mado-shokunin', 'mado-shokunin@1111111111111111111111111111111111111111:PROVINCE.md:-1', 'We drive it over CDP for tests.', '-', '-', 'split-declared', '-', '-']]), auditRows: [[refA, 'unchanged', '-'], [refAbsent, 'sibling-absent', '-']], deltaRows: deltaRows(), roster, sibRef, headOf }) },
    { name: 'map-ref-no-at', expect: 1, ids: ['map-ref-unparseable'], assertFindingCount: 1, run: () => verify({ mapRows: mapRows([['bogus-ground', 'mado-shokunin', 'mado-shokunin:PROVINCE.md:2', 'We drive it over CDP for tests.', '-', '-', 'split-declared', '-', '-']]), auditRows: [[refA, 'unchanged', '-'], [refAbsent, 'sibling-absent', '-']], deltaRows: deltaRows(), roster, sibRef, headOf }) },
    { name: 'map-ref-no-second-colon', expect: 1, ids: ['map-ref-unparseable'], assertFindingCount: 1, run: () => verify({ mapRows: mapRows([['bogus-ground', 'mado-shokunin', 'mado-shokunin@1111111111111111111111111111111111111111:PROVINCE.md', 'We drive it over CDP for tests.', '-', '-', 'split-declared', '-', '-']]), auditRows: [[refA, 'unchanged', '-'], [refAbsent, 'sibling-absent', '-']], deltaRows: deltaRows(), roster, sibRef, headOf }) },
    // r59 declared change (d) — ROUTED D5/A4+N3: a map-covered lane carrying BG
    // hits with no delta screen at all. v18 admits it; v20 must not: the missing
    // screen record is bg-screen-missing and every unadjudicated hit line is
    // bg-hit-unadjudicated (here one of each).
    { name: 'bg-hit-unadjudicated-map-lane', expect: 1, ids: ['bg-screen-missing', 'bg-hit-unadjudicated'], assertPredicate: false, assertFindingCount: 2, run: () => {
      const provK = '# kagi province\nAll secrets stay in the vault; no CDP here.\n';
      const refKagi = 'kagi-shokunin@3333333333333333333333333333333333333333:PROVINCE.md:1';
      const rosterK = [...roster, 'kagi-shokunin'];
      const sibK = (l, p) => (l === 'kagi-shokunin' && p === 'PROVINCE.md' ? provK : sibRef(l, p));
      return verify({ mapRows: mapRows([['secrets-vault-ops', 'kagi-shokunin', refKagi, '# kagi province', '-', '-', 'ruled', '-', '-']]), auditRows: [[refA, 'unchanged', '-'], [refAbsent, 'sibling-absent', '-'], [refKagi, 'unchanged', '-']], deltaRows: deltaRows(), roster: rosterK, sibRef: sibK, headOf });
    } },
    // r59 declared change (d): a present, zero-hit screened file with no lane
    // row is still an unscreened file — bg-screen-missing alone.
    { name: 'bg-screen-missing-zero-hit', expect: 1, ids: ['bg-screen-missing'], assertPredicate: false, assertFindingCount: 1, run: () => {
      const provC = '# chousa province\nQuiet research lane.\n';
      const refC = 'chousa-shokunin@5555555555555555555555555555555555555555:PROVINCE.md:1';
      const rosterC = [...roster, 'chousa-shokunin'];
      const sibC = (l, p) => (l === 'chousa-shokunin' && p === 'PROVINCE.md' ? provC : sibRef(l, p));
      return verify({ mapRows: mapRows([['research-lane', 'chousa-shokunin', refC, '# chousa province', '-', '-', 'ruled', '-', '-']]), auditRows: [[refA, 'unchanged', '-'], [refAbsent, 'sibling-absent', '-'], [refC, 'unchanged', '-']], deltaRows: deltaRows(), roster: rosterC, sibRef: sibC, headOf });
    } },
    // r59 declared change (e) — ROUTED D5/A5+N4: a line row whose lane has no
    // lane row at all is an orphan (v18 never examines it).
    { name: 'orphan-line-row', expect: 1, ids: ['orphan-line-row'], assertPredicate: false, assertFindingCount: 1, run: () => verify({ mapRows: mapRows(), auditRows: [[refA, 'unchanged', '-'], [refAbsent, 'sibling-absent', '-']], deltaRows: [...deltaRows(), ['line', 'ghost-lane', 'PROVINCE.md:2', '-', '-', '-', 'ghost line', 'no-tabi-ground', '-']], roster, sibRef, headOf }) },
    // r59 declared change (e): a line row on a file never screened for its lane
    // whose line number equals a hit number elsewhere — v18 accepted exactly
    // this (H3b); keying by (lane, relPath) rejects it.
    { name: 'line-row-unscreened-file', expect: 1, ids: ['line-row-unscreened-file'], assertPredicate: false, assertFindingCount: 1, run: () => {
      const provKake = '# kake province\nWe publish pages; CDP is out of scope here.\nNothing else.\n';
      const refKake = 'kake-shokunin@4444444444444444444444444444444444444444:PROVINCE.md:1';
      const shaKake = sha256(Buffer.from(provKake, 'utf8'));
      const rosterK = [...roster, 'kake-shokunin'];
      const sibK = (l, p) => (l === 'kake-shokunin' && p === 'PROVINCE.md' ? provKake : sibRef(l, p));
      return verify({ mapRows: mapRows([['crawler-discipline-vs-publishing', 'kake-shokunin', refKake, '# kake province', '-', '-', 'ruled', '-', '-']]), auditRows: [[refA, 'unchanged', '-'], [refAbsent, 'sibling-absent', '-'], [refKake, 'unchanged', '-']], deltaRows: [...deltaRows(), ['lane', 'kake-shokunin', 'PROVINCE.md', shaKake, 3, 1, '-', '-', HEAD], ['line', 'kake-shokunin', 'PROVINCE.md:2', '-', '-', '-', 'We publish pages; CDP is out of scope here.', 'overlap-declared', '-'], ['line', 'kake-shokunin', 'OTHER-UNSCREENED.md:2', '-', '-', '-', 'We publish pages; CDP is out of scope here.', 'no-tabi-ground', '-']], roster: rosterK, sibRef: sibK, headOf });
    } },
    // r59 declared change (e): a cross-file line row with a hit number must not
    // satisfy another screened file's hit — the line row is keyed by its path,
    // so the SKILL.md hit is missing its own row (delta-line-missing) and the
    // PROVINCE.md:5 row is invented (line 5 is not a hit in PROVINCE.md).
    { name: 'cross-file-hit-number-wrong-file', expect: 1, ids: ['delta-line-missing', 'delta-line-invented'], assertPredicate: false, assertFindingCount: 2, run: () => {
      const provKake = '# kake province\nWe publish pages; CDP is out of scope here.\nNothing else.\n';
      const provSkill = '# skill\ns2\ns3\ns4\nWe run CDP here.\n';
      const refKake = 'kake-shokunin@4444444444444444444444444444444444444444:PROVINCE.md:1';
      const refSkill = 'kake-shokunin@4444444444444444444444444444444444444444:SKILL.md:1';
      const rosterK = [...roster, 'kake-shokunin'];
      const sibK = (l, p) => (l === 'kake-shokunin' && p === 'PROVINCE.md' ? provKake : l === 'kake-shokunin' && p === 'SKILL.md' ? provSkill : sibRef(l, p));
      return verify({
        mapRows: mapRows([
          ['crawler-discipline-vs-publishing', 'kake-shokunin', refKake, '# kake province', '-', '-', 'ruled', '-', '-'],
          ['lab-performance-tool-runs', 'kake-shokunin', refSkill, '# skill', '-', '-', 'ruled', '-', '-'],
        ]),
        auditRows: [[refA, 'unchanged', '-'], [refAbsent, 'sibling-absent', '-'], [refKake, 'unchanged', '-'], [refSkill, 'unchanged', '-']],
        deltaRows: [
          ...deltaRows(),
          ['lane', 'kake-shokunin', 'PROVINCE.md', sha256(Buffer.from(provKake, 'utf8')), 3, 1, '-', '-', HEAD],
          ['lane', 'kake-shokunin', 'SKILL.md', sha256(Buffer.from(provSkill, 'utf8')), 5, 1, '-', '-', HEAD],
          ['line', 'kake-shokunin', 'PROVINCE.md:2', '-', '-', '-', 'We publish pages; CDP is out of scope here.', 'overlap-declared', '-'],
          ['line', 'kake-shokunin', 'PROVINCE.md:5', '-', '-', '-', 'We run CDP here.', 'overlap-declared', '-'],
        ],
        roster: rosterK, sibRef: sibK, headOf,
      });
    } },
    // r59 L1 pin (newly screened kama-shaped lane, invented row): the real hit
    // row is present; a junk row quoting a NON-hit line of the same screened
    // non-PROVINCE file is delta-line-invented (the mixed-forgery hole).
    { name: 'kama-invented-row', expect: 1, ids: ['delta-line-invented'], assertPredicate: false, assertFindingCount: 1, run: () => verify(kamaInput([
      ...kamaDelta(),
      ['line', 'kama-shokunin', 'corpus/knowledge/listener-census.md:4', '-', '-', '-', 'We use playwright for the census.', 'no-tabi-ground', '-'],
      ['line', 'kama-shokunin', 'corpus/knowledge/listener-census.md:2', '-', '-', '-', 'line2', 'no-tabi-ground', '-'],
    ])) },
    // r59 L1 pin (newly screened kama-shaped lane, quote): a real hit line's row
    // must quote the COMPLETE line; a spliced quote is delta-quote-not-whole-line.
    { name: 'kama-quote-spliced', expect: 1, ids: ['delta-quote-not-whole-line'], assertPredicate: false, assertFindingCount: 1, run: () => verify(kamaInput([
      ...kamaDelta(),
      ['line', 'kama-shokunin', 'corpus/knowledge/listener-census.md:4', '-', '-', '-', 'use playwright', 'no-tabi-ground', '-'],
    ])) },
    // r59 L1 pin (newly screened kama-shaped lane, head): a row citing bytes not
    // at the snapshot head is lane-screen-head-mismatch.
    { name: 'kama-head-citation', expect: 1, ids: ['lane-screen-head-mismatch'], assertPredicate: false, assertFindingCount: 1, run: () => verify(kamaInput([
      ...kamaDelta({ censusHead: 'b'.repeat(40) }),
      ['line', 'kama-shokunin', 'corpus/knowledge/listener-census.md:4', '-', '-', '-', 'We use playwright for the census.', 'no-tabi-ground', '-'],
    ])) },
    // r59 L1 pin (mixed forgery): real rows for the real hit PLUS junk rows
    // quoting non-hit lines of screened files stays RED (two invented rows).
    { name: 'kama-mixed-forgery', expect: 1, ids: ['delta-line-invented'], assertPredicate: false, assertFindingCount: 2, run: () => verify(kamaInput([
      ...kamaDelta(),
      ['line', 'kama-shokunin', 'corpus/knowledge/listener-census.md:4', '-', '-', '-', 'We use playwright for the census.', 'no-tabi-ground', '-'],
      ['line', 'kama-shokunin', 'corpus/knowledge/listener-census.md:2', '-', '-', '-', 'line2', 'no-tabi-ground', '-'],
      ['line', 'kama-shokunin', 'PROVINCE.md:2', '-', '-', '-', 'Listener census lane.', 'no-tabi-ground', '-'],
    ])) },
    // r59 L1 pin (M6 observable — screen-weakening): a map-covered kama-shaped
    // lane's non-PROVINCE file carries an unadjudicated hit line whose word is
    // only in the FULL frozen vocabulary ('playwright') and whose file is only
    // in the (d) ALL-sibling scope. Honest: bg-screen-missing + one
    // bg-hit-unadjudicated. A gutted BG_WORDS loses the hit (count 1); a shrunk
    // scope loses the whole screen (count 0) — the case fails either way.
    { name: 'kama-screen-weakening-observable', expect: 1, ids: ['bg-screen-missing', 'bg-hit-unadjudicated'], assertPredicate: false, assertFindingCount: 2, run: () => verify(kamaInput([
      ...deltaRows(),
      ['lane', 'kama-shokunin', 'PROVINCE.md', sha256(Buffer.from(provKama, 'utf8')), 2, 0, '-', '-', HEAD],
    ])) },
    // r59 L1 pre-freeze pin (R59Connector routing note 1): TWO+ relPaths for ONE
    // lane — the rebind writes one lane row per (lane, relPath) (kaidoku 3,
    // kake 2, kama 2, kumitate 2). The keyed line-row checks must NOT cross-fire
    // between the files' hit sets: this fixture is GREEN with the keying and
    // produces spurious delta-line-invented findings under v18's lane-only
    // invented-row filter (one per foreign file's hit row).
    { name: 'kaidoku-multi-file-keyed-green', expect: 0, assertPredicate: true, assertFindingCount: 0, run: () => {
      const kaiProv = '# kaidoku province\nREA lane; CDP here.\nNothing else.\n';
      const kaiA = '# queue ops\nline2\nWe use playwright for the queue\nline4\n';
      const kaiB = '# queue ops 2\nline2\nline3\nrecordHar used here\nline5\n';
      const refP = 'kaidoku-shokunin@7777777777777777777777777777777777777777:PROVINCE.md:1';
      const refA2 = 'kaidoku-shokunin@7777777777777777777777777777777777777777:corpus/knowledge/2026-10-14-r10-01-queue-ops.md:1';
      const refB2 = 'kaidoku-shokunin@7777777777777777777777777777777777777777:corpus/knowledge/2026-10-14-r10-02-queue-ops-2.md:1';
      const rosterM = ['mado-shokunin', 'kaidoku-shokunin'];
      const sibM = (l, p) => (l === 'kaidoku-shokunin' && p === 'PROVINCE.md' ? kaiProv
        : l === 'kaidoku-shokunin' && p === 'corpus/knowledge/2026-10-14-r10-01-queue-ops.md' ? kaiA
          : l === 'kaidoku-shokunin' && p === 'corpus/knowledge/2026-10-14-r10-02-queue-ops-2.md' ? kaiB
            : sibRef(l, p));
      return verify({
        mapRows: [
          ['browser-ground-x', 'mado-shokunin', refA, 'We drive it over CDP for tests.', '-', '-', 'split-declared', '-', '-'],
          ['rea-queue-ops', 'kaidoku-shokunin', refP, '# kaidoku province', '-', '-', 'ruled', '-', '-'],
          ['rea-queue-ops', 'kaidoku-shokunin', refA2, '# queue ops', '-', '-', 'ruled', '-', '-'],
          ['rea-queue-ops', 'kaidoku-shokunin', refB2, '# queue ops 2', '-', '-', 'ruled', '-', '-'],
        ],
        auditRows: [[refA, 'unchanged', '-'], [refP, 'unchanged', '-'], [refA2, 'unchanged', '-'], [refB2, 'unchanged', '-']],
        deltaRows: [
          ['lane', 'mado-shokunin', 'PROVINCE.md', provShaA, 3, 1, '-', '-', HEAD],
          ['line', 'mado-shokunin', 'PROVINCE.md:2', '-', '-', '-', 'We drive it over CDP for tests.', 'overlap-declared', '-'],
          ['lane', 'kaidoku-shokunin', 'PROVINCE.md', sha256(Buffer.from(kaiProv, 'utf8')), 3, 1, '-', '-', HEAD],
          ['lane', 'kaidoku-shokunin', 'corpus/knowledge/2026-10-14-r10-01-queue-ops.md', sha256(Buffer.from(kaiA, 'utf8')), 4, 1, '-', '-', HEAD],
          ['lane', 'kaidoku-shokunin', 'corpus/knowledge/2026-10-14-r10-02-queue-ops-2.md', sha256(Buffer.from(kaiB, 'utf8')), 5, 1, '-', '-', HEAD],
          ['line', 'kaidoku-shokunin', 'PROVINCE.md:2', '-', '-', '-', 'REA lane; CDP here.', 'no-tabi-ground', '-'],
          ['line', 'kaidoku-shokunin', 'corpus/knowledge/2026-10-14-r10-01-queue-ops.md:3', '-', '-', '-', 'We use playwright for the queue', 'no-tabi-ground', '-'],
          ['line', 'kaidoku-shokunin', 'corpus/knowledge/2026-10-14-r10-02-queue-ops-2.md:4', '-', '-', '-', 'recordHar used here', 'no-tabi-ground', '-'],
        ],
        roster: rosterM, sibRef: sibM,
        headOf: (l) => (l === 'kaidoku-shokunin' ? HEAD : headOf(l)),
      });
    } },
  ];
  let pass = 0;
  const results = cases.map((c) => {
    const { findings } = c.run();
    const emitted = predicateFrom(findings);
    // The `direct` term (r59 declared change (b)) is evaluated outside the
    // caseOk verdict path, so a findings-term drop in caseOk cannot mask its
    // own guard: the guard case fails even though its finding list is ignored.
    const direct = c.direct === undefined ? null : c.direct();
    const ok = caseOk(c, findings, emitted) && (direct === null || direct);
    if (ok) pass++;
    return { name: c.name, ok, direct, predicate: emitted, findingCount: findings.length, findings: findings.map((f) => `${f.id}: ${f.detail}`) };
  });
  const hostResults = hostSelftest();
  results.push(...hostResults);
  pass += hostResults.filter((r) => r.ok).length;
  return { allPass: pass === results.length, cases: results.length, pass, results };
}

// --- cli (only when invoked as main; the pure core is importable as an authoring aid) --
const IS_MAIN = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
const args = process.argv.slice(2);
if (!IS_MAIN) {
  // imported as a module (authoring aid): expose the pure core, run no CLI
} else {
if (args[0] === '--selftest') {
  const st = selftest();
  console.log(JSON.stringify({ schema: 'tabi-adjacency-host-v20-selftest', ...st }, null, 1));
  process.exit(st.allPass ? 0 : 1);
}
if (args[0] === '--list-observed') {
  const fleet = args[args.indexOf('--fleet') + 1];
  if (!fleet) die('usage: --list-observed --fleet <dir>');
  const snapshot = args[args.indexOf('--snapshot') + 1];
  if (!args.includes('--snapshot') || !snapshot) die('--snapshot <tsv> is required');
  listObserved(fleet, snapshot);
  process.exit(0);
}
let repo = null, rev = null, fleet = null, snapshot = null, audit = null, delta = null, json = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--repo') repo = args[++i];
  else if (args[i] === '--rev') rev = args[++i];
  else if (args[i] === '--fleet') fleet = args[++i];
  else if (args[i] === '--snapshot') snapshot = args[++i];
  else if (args[i] === '--audit') audit = args[++i];
  else if (args[i] === '--delta') delta = args[++i];
  else if (args[i] === '--json') json = true;
}
if (!snapshot) { const tmp = path.join('/fast/scratch/hyaku/tabi-r61/R61MutC1', 'm3-per-run-' + process.pid + '.tsv'); const rr = rosterScan(fleet); fs.writeFileSync(tmp, 'lane\thead\n' + rr.map((l) => { const h = spawnSync('git', ['-C', path.join(fleet, l), 'rev-parse', 'HEAD']); return l + '\t' + (h.status === 0 ? h.stdout.toString('utf8').trim() : ''); }).join('\n') + '\n'); snapshot = tmp; }
if (!repo || !rev || !fleet) die('usage: node c1-adjacency-host-v20.mjs --rev <REV> --repo <lane> --fleet <dir> --snapshot <tsv> [--audit <path>] [--delta <path>] [--json] | --selftest | --list-observed --fleet <dir>');
let result;
try { result = runAt(repo, rev, fleet, snapshot, audit, delta); } catch (e) { die(e.message); }
const { findings, counts, headSnapshot, drift } = result;
const out = {
  schema: 'tabi-adjacency-host-v20',
  predicateSentence: 'c1-adjacency-host-v20 admits the lane state at REV where every corpus/adjacency.tsv data row has exactly one corpus/adjacency-host-audit-r61.tsv row keyed by its sibling_ref whose claimed status equals the meter\'s re-derivation from the sibling\'s bytes at the frozen snapshot head (sibling-absent, unchanged, moved with a note naming a verbatim line, stale, or file-absent) AND every sibling lane directory at --fleet other than tabi-shokunin is browser-ground-screened at that same snapshot over its PROVINCE.md and every file its map rows reference, so that every present screened file carries a corpus/adjacency-host-delta-r61.tsv lane row whose provinceSha256, lines, bgHits and head equal the meter\'s own re-derivation and every browser-ground hit line carries a line row keyed by (lane, relPath:line) whose quote is that complete line and whose disposition is in the frozen vocabulary, with no unadjudicated hit line, no orphan line row, no line row on an unscreened file and no invented row AND every sibling lane directory at --fleet other than tabi-shokunin is covered by the ruled map or by at least one corpus/adjacency-host-delta-r61.tsv lane row, with no uncovered lane and no duplicate keys.',
  rev, repo: path.resolve(repo), fleet: path.resolve(fleet), counts, headSnapshot, drift,
  predicate: predicateFrom(findings), findingCount: findings.length, findings,
};
console.log(JSON.stringify(out, null, 1));
process.exit(out.predicate ? 0 : 1);
}
