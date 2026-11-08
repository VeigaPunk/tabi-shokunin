#!/usr/bin/env node
// Round-91 record-drift gate (C2 calibration, predicate C2-RECORDDRIFT-R91).
// Counts eight statements: the six lane-measurable routed defects of the round-90 non-author
// spot-check (corpus/lessons/round-90-verifier-spotcheck.md §8 items 1, 2, 3, 5, 7, 8) and two
// self-checks (the round-91 gate-run artifact and the SCORECARD tally set). §8 items 4 (the r90
// fleet report's digest arithmetic) and 6 (the r90 report commit's author date) are fleet-report /
// process items outside this lane's write scope: they are disclosed in the round-91 lesson and
// deliberately NOT counted here.
//
// Usage: node check-record-drift-round91.mjs --lane <ABS lane> [--json] [--revision <hex>]
//        node check-record-drift-round91.mjs --selftest [--json]
// Exit 0: every counted statement holds. 1: findings. 2: usage / setup.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const lane = opt('lane');
const revision = opt('revision');

function read(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
}
function sectionOf(text, heading) {
  if (typeof text !== 'string') return null;
  const i = text.indexOf(heading);
  if (i < 0) return null;
  const rest = text.slice(i + heading.length);
  const j = rest.search(/^##\s/m);
  return j < 0 ? rest : rest.slice(0, j);
}
function paraAfter(text, needle, maxLines = 40) {
  if (typeof text !== 'string') return null;
  const lines = text.split('\n');
  const i = lines.findIndex((l) => l.includes(needle));
  if (i < 0) return null;
  return lines.slice(i, i + maxLines).join('\n');
}

export function statements(l) {
  const out = [];
  const add = (id, ok, detail) => out.push({ id, ok: !!ok, detail: String(detail) });
  const note90 = read(path.join(l, 'corpus/knowledge/chromium-showpicker-runtime-round-90.md'));
  const log = read(path.join(l, 'LOG.md'));
  const quality = read(path.join(l, 'corpus/QUALITY.md'));
  const lesson89 = read(path.join(l, 'corpus/lessons/round-89.md'));
  const lesson90 = read(path.join(l, 'corpus/lessons/round-90.md'));
  const plan90 = read(path.join(l, 'plans/round-90.md'));
  const scorecard = read(path.join(l, 'SCORECARD.md'));
  const claimsRaw = read(path.join(l, '.ufo/waves/round-91/claims.json'));
  const selftestRaw = read(path.join(l, '.ufo/waves/round-91/scored/selftest.json'));

  // 1. r90 spot-check §8 item 1 - the false `plan-calls` attribution is swept from every
  //    distilled copy: the knowledge note, the LOG r90 entry and QUALITY criterion 163.
  {
    const noteBlock = paraAfter(note90, 'forbids that expression in every other leg', 6);
    const log90 = sectionOf(log, '## Round 90 — 2026-11-08');
    const q163 = paraAfter(quality, '163. A DOM read', 6);
    const bad = [];
    if (!noteBlock || !noteBlock.includes('send-log-allowlist')) bad.push('note');
    if (!log90 || !log90.includes('send-log-allowlist')) bad.push('log');
    if (!q163 || !q163.includes('send-log-allowlist')) bad.push('quality163');
    // the false sentence ("plan-calls ... forbids it elsewhere") must be gone from the note's
    // item 2 and QUALITY 163; the correct split names both checks.
    if (noteBlock && /plan-calls`? check now:/.test(noteBlock)) bad.push('note-plan-calls-claim');
    add('r90-attribution-sweep', bad.length === 0, 'distilled copies naming send-log-allowlist: ' + (bad.length ? 'missing ' + bad.join(',') : 'note/log/quality163 all name it'));
  }

  // 2. r90 spot-check §8 item 2 - the battery-case numeral is the scored 226, with the preflight
  //    225 recorded as the D2 delta rather than as the final count.
  {
    const log90 = sectionOf(log, '## Round 90 — 2026-11-08');
    const okLog = !!log90 && log90.includes('226 cases');
    const okPlan = !!plan90 && plan90.includes('226 cases at the D2/final freeze');
    const stale = !!log90 && /\(225 cases, coverage/.test(log90);
    const stalePlan = !!plan90 && /battery 225 cases \/ 0 failed \/ coverage 107\/107, and both probes/.test(plan90);
    add('r90-battery-count', okLog && okPlan && !stale && !stalePlan, 'r90 battery count: log=' + okLog + ' plan=' + okPlan + ' staleLog=' + stale + ' stalePlan=' + stalePlan);
  }

  // 3. r90 spot-check §8 item 3 - append-only discipline: the two in-place r89 edits carry named
  //    append corrections (the lesson block and a superseding QUALITY row).
  {
    const block = sectionOf(lesson89, '## Corrections carried by round 91');
    const q164 = paraAfter(quality, '164. ', 8);
    const okLesson = !!block && block.includes('frozen-control-numeral') && block.includes('extended in place');
    const okQuality = !!q164 && /supersedes 161/i.test(q164) && q164.includes('rewritten in place');
    add('r89-append-only', okLesson && okQuality, 'r89 in-place edits: lesson-block=' + okLesson + ' quality-164=' + okQuality);
  }

  // 4. r90 spot-check §8 item 5 - the C2 after-run revision is named; the r90 D4 worktree and the
  //    committed-tip re-derivation are recorded in the r90 lesson's r91 correction block.
  {
    const block = sectionOf(lesson90, '## Corrections carried by round 91');
    const ok = !!block && block.includes('D4') && block.includes('3e6cf40f') && block.includes('revision');
    add('r90-after-revision', ok, 'r90 after-run revision recorded in the r90 lesson: ' + ok);
  }

  // 5. r90 spot-check §8 item 7 - the dangling D3-D6 pointer: the plan's re-freeze section now
  //    names where D3-D6 live.
  {
    const reFreeze = sectionOf(plan90, '## Re-freeze history');
    const ok = !!reFreeze && reFreeze.includes('D3') && reFreeze.includes('§Wave corrections');
    add('r90-dangling-pointer', ok, 'round-90 re-freeze section points D3-D6 at §Wave corrections: ' + ok);
  }

  // 6. r90 spot-check §8 item 8 - the over-length S224 Gate quote is marked and the counted
  //    17-word replacement is named.
  {
    const ok = !!lesson89 && /31 words/.test(lesson89) && /over-length/.test(lesson89) && /17-word/.test(lesson89);
    add('r89-s224-mark', ok, 'r89 S224 quote over-length marked with the counted 17-word replacement: ' + ok);
  }

  // 7. self-check - the round-91 gate-run artifact exists and is clean, and names the four
  //    instruments it ran.
  {
    let j = null;
    try { j = JSON.parse(selftestRaw); } catch {}
    const ok = j !== null && j.clean === true && Array.isArray(j.gates) && ['counter', 'battery', 'killpower', 'drift-selftest'].every((g) => j.gates.some((x) => x && x.name === g && x.exit === 0));
    add('gate-selftest', ok, j === null ? 'scored/selftest.json missing' : 'clean=' + j.clean + ' gates=' + JSON.stringify(j.gates));
  }

  // 8. self-check - the SCORECARD round-91 section exists and its claim table tallies with
  //    claims.json (two claim ids, one verdict per claim, no third claim row).
  {
    const sec = sectionOf(scorecard, '## Round 91 ');
    let claims = null;
    try { claims = JSON.parse(claimsRaw).claims; } catch {}
    const ids = Array.isArray(claims) ? claims.map((c) => c && c.id).filter(Boolean) : (claims && typeof claims === 'object' ? Object.keys(claims).slice(0, 3) : []);
    const rows = sec ? (sec.match(/^\|\s*C[0-9]+\b/gm) || []).length : 0;
    const ok = !!sec && ids.length >= 1 && ids.length <= 3 && rows === ids.length && ids.every((id) => sec.includes('| ' + id + ' '));
    add('scorecard-tallies', ok, 'round-91 section=' + !!sec + ' claimIds=' + JSON.stringify(ids) + ' claimRows=' + rows);
  }
  return out;
}

function selftest() {
  const base = (process.env.HYAKU_SCRATCH || '/fast/scratch/hyaku') + '/tabi-r91-drift-selftest-' + process.pid;
  const fsRm = (d) => { try { fs.rmSync(d, { recursive: true, force: true }); } catch {} };
  const write = (rel, body) => { const p = path.join(base, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body); };
  const good = {
    'corpus/knowledge/chromium-showpicker-runtime-round-90.md': 'The counter now:\n\n1. requires exactly one call;\n2. forbids that expression in every other leg\'s send log (`send-log-allowlist`);\n3. includes it in the ordered plan sequence.\n',
    'LOG.md': '## Round 90 — 2026-11-08 (attempt 1, Linux host)\n\n`plan-calls` requires it there and compares it in the ordered plan sequence, and `send-log-allowlist` forbids it elsewhere; battery (226 cases, coverage 107/107).\n\n## Round 91\n',
    'corpus/QUALITY.md': '## Round 90 additions\n\n163. A DOM read that a claim binds is bound by the CALL that produced it. Green state: `plan-calls` requires it there, `send-log-allowlist` forbids it elsewhere, two battery cases strip and reorder it.\n\n## Round 91 additions\n\n164. Append correction: criterion 161 was rewritten in place (green-state citation) rather than superseded by a new row; this row supersedes 161\'s green-state citation and records the append-only rule.\n',
    'corpus/lessons/round-89.md': '## Corrections carried by round 91 (append-only)\n\n1. **Append-only discipline.** The `frozen-control-numeral` row above was extended in place; this block names the change.\n2. **S224 Gate quote.** The original Gate quote (31 words) is over-length; the counted quote is the 17-word replacement in item 3 of the round-90 block.\n',
    'corpus/lessons/round-90.md': '## Corrections carried by round 91 (append-only)\n\n1. **C2 after-run revision.** `scored/drift-a.json` was measured at the D4 worktree; the committed-tip re-derivation is at lane tip `3e6cf40f980ea011a400eec7ce1c5db58773141a`. The revision is named here.\n',
    'plans/round-90.md': '## Re-freeze history (instrument family)\n\n- **D1** first freeze; battery 225 cases / 0 failed / coverage 107/107 at the preflight (226 cases at the D2/final freeze).\n- **D2** post-scoring repair. D3–D6 live under §Wave corrections; this pointer corrects the r90 report\'s citation.\n\n## Wave corrections (post-wave; the frozen claims are not amended)\n',
    'SCORECARD.md': '## Round 91 (2026-11-08, Linux host) — C1 the proxy capability; C2 calibration\n\n| Claim / axis | Counting command | Before → after | Verdict |\n|---|---|---|---|\n| C1 coverage (9) | counter | 0 -> 1 | VERIFIED |\n| C2 calibration (9) | gate | 8 -> 0 | VERIFIED |\n',
    '.ufo/waves/round-91/claims.json': JSON.stringify({ claims: [{ id: 'C1' }, { id: 'C2' }] }),
    '.ufo/waves/round-91/scored/selftest.json': JSON.stringify({ clean: true, gates: [{ name: 'counter', exit: 0 }, { name: 'battery', exit: 0 }, { name: 'killpower', exit: 0 }, { name: 'drift-selftest', exit: 0 }] }),
  };
  const injections = [
    ['r90-attribution-sweep', 'corpus/knowledge/chromium-showpicker-runtime-round-90.md', (s) => s.replace('forbids that expression in every other leg\'s send log (`send-log-allowlist`)', 'forbids that expression in every other leg\'s send log')],
    ['r90-battery-count', 'LOG.md', (s) => s.replace('226 cases', '225 cases')],
    ['r89-append-only', 'corpus/QUALITY.md', (s) => s.replace('this row supersedes 161\'s green-state citation', 'this row records the change')],
    ['r90-after-revision', 'corpus/lessons/round-90.md', (s) => s.replace('`3e6cf40f980ea011a400eec7ce1c5db58773141a`', 'the tip')],
    ['r90-dangling-pointer', 'plans/round-90.md', (s) => s.replace('D3–D6 live under §Wave corrections', 'D3-D6 unrecorded')],
    ['r89-s224-mark', 'corpus/lessons/round-89.md', (s) => s.replace('(31 words) is over-length; the counted quote is the 17-word replacement', 'quote')],
    ['gate-selftest', '.ufo/waves/round-91/scored/selftest.json', (s) => s.replace('"clean":true', '"clean":false')],
    ['scorecard-tallies', 'SCORECARD.md', (s) => s.replace('| C2 calibration (9) | gate | 8 -> 0 | VERIFIED |\n', '')],
  ];
  try {
    for (const [rel, body] of Object.entries(good)) write(rel, body);
    const clean = statements(base);
    const cleanBad = clean.filter((x) => !x.ok);
    const cases = [];
    for (const [id, rel, mutate] of injections) {
      // rebuild a pristine fixture, then inject exactly one defect
      fsRm(base);
      for (const [r, b] of Object.entries(good)) write(r, b);
      const p = path.join(base, rel);
      fs.writeFileSync(p, mutate(fs.readFileSync(p, 'utf8')));
      const res = statements(base);
      const byId = Object.fromEntries(res.map((x) => [x.id, x.ok]));
      cases.push({ id, injectedRed: byId[id] === false, othersGreen: res.every((x) => x.id === id || x.ok), ok: byId[id] === false && res.every((x) => x.id === id || x.ok) });
    }
    const ok = cleanBad.length === 0 && cases.every((c) => c.ok);
    const out = { schema: 'tabi-r91-record-drift-selftest', ok, cleanFailed: cleanBad.map((x) => x.id), cases };
    if (asJson) process.stdout.write(JSON.stringify(out, null, 1) + '\n');
    else process.stdout.write(JSON.stringify(out) + '\n');
    fsRm(base);
    process.exit(ok ? 0 : 1);
  } catch (e) {
    fsRm(base);
    process.stdout.write(JSON.stringify({ schema: 'tabi-r91-record-drift-selftest', ok: false, error: String(e.message) }) + '\n');
    process.exit(1);
  }
}

if (argv.includes('--selftest')) selftest();
else {
  if (!lane || !path.isAbsolute(lane)) { process.stdout.write(JSON.stringify({ verdict: 'usage', findings: [{ id: 'usage', detail: '--lane must be an absolute path' }] }) + '\n'); process.exit(2); }
  const res = statements(lane);
  const failed = res.filter((x) => !x.ok);
  const payload = {
    schema: 'tabi-r91-record-drift-counter', verdict: failed.length === 0 ? 'clean' : 'findings',
    checkCount: res.length, findings: failed, checks: Object.fromEntries(res.map((x) => [x.id, x.ok])),
    revision: revision || null,
  };
  if (asJson) process.stdout.write(JSON.stringify(payload, null, 1) + '\n');
  else process.stdout.write(JSON.stringify({ verdict: payload.verdict, checkCount: payload.checkCount, findings: payload.findings, revision: payload.revision }, null, 1) + '\n');
  process.exit(failed.length === 0 ? 0 : 1);
}
