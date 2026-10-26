#!/usr/bin/env node
// controls.mjs — tabi round 36: the cheapest controls against the two frozen counters, scored
// BEFORE any claim data (prompt §6 item 9; QUALITY 90, 96, 98). One scratch clone of the lane
// at the round-start tip (11c64b9) under $TMPDIR (must be under /fast/scratch/hyaku/tabi-r36/);
// the round's own pre-data files (counters, baseline, the derived drift ledger) are copied in
// and committed once as the control base (CTRLBASE); every control is committed there (each git
// call names -C <clone>, toplevel verified first), scored, and its receipt (.json / .stderr /
// .provenance) written beside this file; the clone is removed on exit.
//   TMPDIR=/fast/scratch/hyaku/tabi-r36/L1/ctl node .ufo/waves/round-36/baseline/controls.mjs
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const LANE = resolve(HERE, '../../../..');
const FLEET = resolve(LANE, '..');
const TIP = '11c64b96f357de106c30a71c5e21ca44a3eacdc0';
const C1 = join(HERE, '../counters/c1-adjacency-sweep-v4.mjs');
const C2 = join(HERE, '../counters/c2-firefox-bidi-v2.mjs');
const TMP = process.env.TMPDIR;
if (!TMP || !TMP.startsWith('/fast/scratch/hyaku/tabi-r36/')) throw new Error('set TMPDIR under /fast/scratch/hyaku/tabi-r36/');
const sha = (b) => createHash('sha256').update(b).digest('hex');
const dir = mkdtempSync(join(TMP, 'controls-'));
const clone = join(dir, 'clone');
const run = (cmd, args, o = {}) => spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 256 << 20, env: { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' }, ...o });
const g = (...a) => { const r = run('git', ['-C', clone, '-c', 'user.name=tabi-r36-control', '-c', 'user.email=control@scratch.local', '-c', 'commit.gpgsign=false', ...a]); if (r.status !== 0) throw new Error(`git ${a.join(' ')}: ${r.stderr}`); return r.stdout.trim(); };
const put = (rel, text) => { const p = join(clone, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, text); };
const get = (rel) => readFileSync(join(clone, rel), 'utf8');
const commit = (m) => { g('add', '-A'); g('commit', '-q', '--no-verify', '--allow-empty', '-m', m); return g('rev-parse', 'HEAD'); };
let CTRLBASE = null;
const reset = () => { g('checkout', '-q', '--force', '--detach', CTRLBASE); g('clean', '-q', '-fdx'); };
const receipts = [];
function score(name, counter, rev, repo, extra = []) {
  const r = run(process.execPath, [counter, '--rev', rev, '--repo', repo, '--json'].concat(counter === C1 ? ['--fleet', FLEET] : []).concat(extra));
  writeFileSync(join(HERE, `${name}.json`), r.stdout);
  writeFileSync(join(HERE, `${name}.stderr`), r.stderr);
  const tree = repo === LANE ? run('git', ['-C', LANE, 'rev-parse', `${rev}^{tree}`]).stdout.trim() : g('rev-parse', `${rev}^{tree}`);
  writeFileSync(join(HERE, `${name}.provenance`), `counter=${counter.slice(LANE.length + 1)} counter_sha256=${sha(readFileSync(counter))}\nrev=${rev} tree=${tree} repo=${repo === LANE ? 'lane' : 'scratch-clone'}\nexit=${r.status}\n${extra.length ? `extra=${extra.join(' ')}\n` : ''}`);
  let j = {}; try { j = JSON.parse(r.stdout); } catch {}
  const summary = counter === C1
    ? { candidates: j.candidates, unaccounted: j.unaccounted, newMapped: j.newMapped, adjacency: j.adjacency && j.adjacency.verdict, screenFindings: (j.screenFindings || []).length,
        driftTotal: j.drift && j.drift.total, auditCoverage: j.drift && j.drift.auditCoverage, auditFindings: j.drift && (j.drift.auditFindings || []).length, auditMissing: j.drift && (j.drift.auditMissing || []).length,
        driftObserved: j.drift && j.drift.observed, staleFindings: j.drift && (j.drift.staleFindings || []).length,
        deltaTotal: j.delta && j.delta.total, deltaUnaccounted: j.delta && j.delta.unaccounted, deltaScreenFindings: j.delta && (j.delta.screenFindings || []).length }
    : { population: j.population, admitted: j.admitted, target: j.target, failing: j.failing, unmeasured: j.unmeasured,
        entry: j.entryFinding, receipt: j.receiptFinding, binding: j.binding, egressNonLoopback: j.egressNonLoopback,
        live: j.live ? (j.live.error ? `error: ${j.live.error}` : `${j.live.browserName} ${j.live.browserVersion} cmds=${j.live.commands}`) : null };
  receipts.push({ name, exit: r.status, predicate: j.predicate === undefined ? null : j.predicate, summary });
  return j;
}
try {
  const c = run('git', ['clone', '-q', '--shared', '--no-checkout', LANE, clone]);
  if (c.status !== 0) throw new Error(c.stderr);
  if (g('rev-parse', '--show-toplevel') !== clone) throw new Error('clone toplevel mismatch');
  g('checkout', '-q', '--detach', TIP);
  // control base: the round's pre-data files as they stand in the lane worktree — the drift
  // ledger is deliberately EXCLUDED (it is the claim's data; a do-nothing tree has no ledger)
  for (const rel of [
    '.ufo/waves/round-36/counters/c1-adjacency-sweep-v4.mjs',
    '.ufo/waves/round-36/counters/c2-firefox-bidi-v2.mjs',
    '.ufo/waves/round-36/baseline/c1-delta-pins.json',
    '.ufo/waves/round-36/baseline/c1-delta-candidates.tsv',
    '.ufo/waves/round-36/baseline/c1-drift-audit-build.mjs',
    '.ufo/waves/round-36/baseline/controls.mjs',
  ]) put(rel, readFileSync(join(LANE, rel), 'utf8'));
  CTRLBASE = commit('control base: round-36 pre-data files');
  writeFileSync(join(HERE, 'ctrlbase'), `${CTRLBASE}\n`);
  // ---------------- C1 ----------------
  score('c1-J0-absent-instrument', C1, TIP, LANE); // delta pins absent at the round-start tip -> could-not-evaluate (exit 2)
  score('c1-J1-do-nothing', C1, CTRLBASE, clone);
  const driftRefs = run(process.execPath, [C1, '--list-drift', '--repo', LANE]).stdout.trim().split('\n').filter(Boolean);
  const ledger = readFileSync(join(LANE, 'corpus/adjacency-screen-drift.tsv'), 'utf8');
  // J2 — every drift row audited 'unchanged': the 3 moved rows must trip status-mismatch
  reset();
  put('corpus/adjacency-screen-drift.tsv', ['sibling_ref\tstatus\tnote'].concat(driftRefs.map((r) => `${r}\tunchanged\t-`)).join('\n') + '\n');
  score('c1-J2-all-unchanged', C1, commit('control c1 J2 audit ledger claims all unchanged'), clone);
  // J3 — honest statuses but wrong relocation lines for the moved rows
  reset();
  const j3 = ledger.split('\n').map((l) => {
    if (l.endsWith('\tmoved\tverbatim at :748') || l.endsWith('\tmoved\tverbatim at :784') || l.endsWith('\tmoved\tverbatim at :815')) return l.replace(/verbatim at :\d+/, 'verbatim at :1');
    return l;
  }).join('\n');
  put('corpus/adjacency-screen-drift.tsv', j3);
  score('c1-J3-wrong-relocation', C1, commit('control c1 J3 moved rows cite a wrong relocation line'), clone);
  // J4 — honest ledger plus one junk delta-screen row (the delta pool is empty this round)
  reset();
  const deltaPins = JSON.parse(readFileSync(join(HERE, 'c1-delta-pins.json'), 'utf8'));
  put('corpus/adjacency-screen-drift.tsv', ledger);
  put('corpus/adjacency-screen-delta.tsv', `sibling_ref\treason\tsurface\tquote\tnote\nkama-shokunin@${deltaPins.kama}:SKILL.md:1\tnot-browser-sense\t-\tmusketeer control junk row padded to at least four words\tcontrol\n`);
  score('c1-J4-delta-screen-junk', C1, commit('control c1 J4 junk row in the delta screen ledger'), clone);
  // J5 — honest floor: the derived ledger itself must reach the predicate
  reset();
  put('corpus/adjacency-screen-drift.tsv', ledger);
  score('c1-J5-honest-floor', C1, commit('control c1 J5 honest derived ledger'), clone);
  // ---------------- C2 ----------------
  {
    const present = run('git', ['-C', LANE, 'cat-file', '-e', `${TIP}:.ufo/waves/round-36/counters/c2-firefox-bidi-v2.mjs`]);
    const receipt = { name: 'c2-J0-baseline-absent', exit: present.status === 0 ? 1 : 0, predicate: null, summary: { note: present.status === 0 ? 'v2 unexpectedly present at round-start tip' : 'v2 absent at round-start tip (expected: amendment instrument is new this round)' } };
    writeFileSync(join(HERE, 'c2-J0-baseline-absent.json'), JSON.stringify(receipt, null, 1) + '\n');
    writeFileSync(join(HERE, 'c2-J0-baseline-absent.provenance'), `rev=${TIP} repo=lane exit=${receipt.exit}\n`);
    receipts.push(receipt);
  }
  score('c2-J1-regression', C2, CTRLBASE, clone);
  score('c2-J2-wrong-binary', C2, CTRLBASE, clone, ['--firefox', '/bin/true']);
  const ENTRY = 'corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md';
  const RECEIPT = 'corpus/evidence/round-35/bidi-firefox/receipt.json';
  // J3 — boundary one short: first 'yes' row flipped to 'no' -> admitted 15, predicate false
  reset();
  {
    const e = get(ENTRY);
    const lines = e.split('\n');
    const idx = lines.findIndex((l) => {
      if (!l.startsWith('|')) return false;
      const cells = l.slice(1, -1).split('|').map((x) => x.trim());
      return /^R/.test(cells[0] || '') && cells[0] !== 'R16' && /^(yes)\b/.test(cells[3] || '');
    });
    if (idx < 0) throw new Error('no admitted row found for the boundary control');
    lines[idx] = lines[idx].replace(/(\|[^|]*\|[^|]*\|)\s*yes\b/, '$1 no');
    put(ENTRY, lines.join('\n'));
    score('c2-J3-boundary-15', C2, commit('control c2 J3 first admitted row flipped to no'), clone);
  }
  // J4 — whitespace-normalised byte clone of the counter as the receipt's driver
  reset();
  {
    const src = readFileSync(C2, 'utf8');
    const drv = src.replace(/\s+/g, ' ').trim() + '\n';
    put('scripts/c2-wsnorm-clone.mjs', drv);
    const rec = JSON.parse(get(RECEIPT));
    rec.driver = 'scripts/c2-wsnorm-clone.mjs';
    rec.driverSha256 = sha(drv);
    put(RECEIPT, JSON.stringify(rec, null, 1) + '\n');
    score('c2-J4-wsnorm-clone', C2, commit('control c2 J4 driver is a whitespace clone of the counter'), clone);
  }
  // J5 — one transcript committed at two paths (identical bytes -> repeated sha / shared context ids)
  reset();
  {
    const rec = JSON.parse(get(RECEIPT));
    const t = readFileSync(join(clone, rec.runs[0].transcript), 'utf8');
    put('corpus/evidence/round-35/bidi-firefox/dup-a.jsonl', t);
    put('corpus/evidence/round-35/bidi-firefox/dup-b.jsonl', t);
    rec.runs = [{ name: 'dup-a', transcript: 'corpus/evidence/round-35/bidi-firefox/dup-a.jsonl', transcriptSha256: sha(t) }, { name: 'dup-b', transcript: 'corpus/evidence/round-35/bidi-firefox/dup-b.jsonl', transcriptSha256: sha(t) }];
    put(RECEIPT, JSON.stringify(rec, null, 1) + '\n');
    score('c2-J5-duplicate-run', C2, commit('control c2 J5 one transcript at two paths'), clone);
  }
  // J6 — egress instrument: a scratch variant of the counter with the DNS-off prefs dropped must
  // observe >= 1 non-loopback ESTABLISHED socket (the A5 sampler is live, not decorative)
  {
    const src = readFileSync(C2, 'utf8').replace(/prefs: \{[^}]*\}/, 'prefs: {}');
    const instrument = join(dir, 'c2-egress-instrument.mjs');
    writeFileSync(instrument, src);
    const r = run(process.execPath, [instrument, '--rev', CTRLBASE, '--repo', clone, '--json']);
    let j = {}; try { j = JSON.parse(r.stdout); } catch {}
    const receipt = { name: 'c2-J6-egress-instrument', exit: r.status, predicate: j.predicate === undefined ? null : j.predicate,
      summary: { egressNonLoopback: j.egressNonLoopback, egress: j.live && j.live.egress, note: 'DNS-off prefs dropped: a live sampler must see Mozilla egress (QUALITY 100)' } };
    writeFileSync(join(HERE, 'c2-J6-egress-instrument.json'), JSON.stringify(receipt, null, 1) + '\n');
    writeFileSync(join(HERE, 'c2-J6-egress-instrument.stderr'), r.stderr);
    writeFileSync(join(HERE, 'c2-J6-egress-instrument.provenance'), `counter=${instrument} counter_sha256=${sha(src)}\nrev=${CTRLBASE} repo=scratch-clone exit=${r.status}\n`);
    receipts.push(receipt);
  }
  writeFileSync(join(HERE, 'controls-summary.json'), JSON.stringify(receipts, null, 1) + '\n');
  console.log(JSON.stringify(receipts, null, 1));
} finally {
  rmSync(dir, { recursive: true, force: true });
}
