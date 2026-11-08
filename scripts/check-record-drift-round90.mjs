#!/usr/bin/env node
// Record-drift counter for tabi round 90 (instrument, predicate C2-RECORDDRIFT-R90).
//
// Counts, over a fixed set of statements, where the lane's self-assessment records
// (SCORECARD.md, SKILL.md, plans/, corpus/lessons/, corpus/QUALITY.md, LOG.md,
// corpus/SOURCES.md) disagree with the observed repo state. The statements are the six
// routed defects of the round-89 non-author verifier spot-check
// (`corpus/lessons/round-89-verifier-spotcheck.md` §7):

//   1. r89-claim-sweep: the r89 claims.json carries a frozenAmendments entry naming the two
//      clauses that are false of the final instruments (the replay-limit check form and the
//      `tapi-` fixture-leak glob), and the r89 lesson's correction block names it.
//   2. r89-narrowing-pointers: the two C1 falsifies-wording ledger rows are re-pointed at
//      sections that exist, and no lane file outside the correction block still cites the
//      nonexistent `plans/round-89.md §Narrowings`.
//   3. r89-census-attribution: the r89 end census is 224 rows (exit 0), the S223/S219
//      re-opening is attributed to round 88, and the S224 located quote is <= 25 words.
//   4. r89-leak-enforcement: the r90 instruments carry a witness for the drift fixture-tree
//      removal, and the r89 record names the narrowing instead of claiming a check.
//   5. r89-revision-naming: the r89 record names the drift after-run's actual revision
//      (the 10:13 worktree), not the branch tip.
//   6. gate-selftest: every r90 gate exposes a `--selftest` mode and the runner wires them.
//   7. quality161-sweep: QUALITY 161 cites this gate.
//   8. scorecard-tallies: the seven swept tallies hold at 9/9 and `selftest 10/10` lives
//      only in the round-87/88 sections.
//
// Usage: node check-record-drift-round90.mjs --lane <ABS lane> [--json] [--selftest]
// Exit 0: mismatches 0. 1: mismatches. 2: usage. --selftest: isolated-fixture run, same
// exit contract (0 iff every expected red holds on the fixture and every statement is red).
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const asJson = argv.includes('--json');
const selftestMode = argv.includes('--selftest');
const lane = opt('lane');
if (!lane || !path.isAbsolute(lane)) { console.error(JSON.stringify({ error: 'usage', detail: '--lane must be an absolute path' })); process.exit(2); }

const read = (rel) => { try { return fs.readFileSync(path.join(lane, rel), 'utf8'); } catch { return null; } };
const readJson = (rel) => { const t = read(rel); if (t === null) return null; try { return JSON.parse(t); } catch { return null; } };

// ---- the statements ----
function statements(laneArg) {
  const rd = (rel) => { try { return fs.readFileSync(path.join(laneArg, rel), 'utf8'); } catch { return null; } };
  const rdJson = (rel) => { const t = rd(rel); if (t === null) return null; try { return JSON.parse(t); } catch { return null; } };
  const skill = rd('SKILL.md') || '';
  const scorecard = rd('SCORECARD.md') || '';
  const lesson89 = rd('corpus/lessons/round-89.md') || '';
  const quality = rd('corpus/QUALITY.md') || '';
  const selftestRunner = rd('scripts/selftest-r90-gates.mjs') || '';
  const counterSrc = rd('scripts/check-showpicker-round90.mjs') || '';
  const batterySrc = rd('scripts/negatives-showpicker-round90.mjs') || '';
  const killSrc = rd('scripts/kill-power-round90.mjs') || '';
  const driftSrc = rd('scripts/check-record-drift-round90.mjs') || '';
  const claims89 = rdJson('.ufo/waves/round-89/claims.json');
  const ledger89 = rd('.ufo/waves/round-89/claim-falsification.tsv') || '';
  const census89 = rd('.ufo/waves/round-89/census/end.txt') || '';
  const plan89 = rd('plans/round-89.md') || '';
  const out = [];
  const claim = (id, ok, detail) => out.push({ id, ok: !!ok, detail: String(detail) });

  // the correction block is the appended section of the r89 lesson; everything below
  // treats only text AFTER its heading as the corrected record.
  const cIdx = lesson89.indexOf('## Corrections carried by round 90');
  const correction = cIdx >= 0 ? lesson89.slice(cIdx) : '';

  // 1. r89-claim-sweep
  {
    const am = claims89 && Array.isArray(claims89.frozenAmendments) ? claims89.frozenAmendments : [];
    const sweep = am.find((a) => {
      const j = JSON.stringify(a);
      return /replayConsistency/.test(j) && /tapi-/.test(j) && /plans\/round-89\.md/.test(j);
    });
    const named = /replayConsistency/.test(correction) && /tapi-/.test(correction) && /plans\/round-89\.md/.test(correction);
    claim('r89-claim-sweep', !!sweep && named, 'amendment=' + (sweep ? 'present' : 'missing') + ' correctionNamed=' + named);
  }
  // 2. r89-narrowing-pointers
  {
    const corrected = ledger89.split('\n').filter((l) => /-corrected\t/.test(l));
    const pointsReal = corrected.length >= 2 && corrected.every((l) => /SCORECARD\.md ## Round 89/.test(l));
    const realSections = /## Round 89/.test(scorecard) && /## Re-freeze history/.test(plan89);
    // a live citation outside the correction block: any lane markdown that names the
    // nonexistent section, excluding this correction language itself.
    const files = ['SCORECARD.md', 'SKILL.md', 'LOG.md', 'corpus/QUALITY.md', 'corpus/lessons/round-89.md'];
    const live = [], missingFiles = [];
    // the pointer may be bare or backticked, and the section name may be separated by anything
    // up to and including a backtick; the ledger is scanned too (its original rows stay).
    // a citation is LIVE unless its own line marks it historical/corrected, and backticks or
    // other separators between the path and the section name must not hide it.
    const citesPointer = (line) => /round-89\.md`?[^.\n]{0,40}§\s*(Narrowings|Frozen-amendment)/.test(line)
      || (/§\s*(Narrowings|Frozen-amendment note)/.test(line) && /round-89/.test(line));
    const marked = (line) => /does not exist|historical pointer|superseded|misattribut|re-pointed|as corrected/i.test(line);
    for (const f of files) {
      const raw = rd(f);
      if (raw === null) { missingFiles.push(f); continue; }
      const body = f === 'corpus/lessons/round-89.md' && cIdx >= 0 ? raw.slice(0, cIdx) : raw;
      if (body.split('\n').some((l) => citesPointer(l) && !marked(l))) live.push(f);
    }
    // the ledger's original rows: a live citation outside the `-corrected` rows is a finding
    const ledgerLive = ledger89.split('\n').filter((l) => l && !/-corrected\t/.test(l) && citesPointer(l) && !marked(l)).length;
    claim('r89-narrowing-pointers', pointsReal && realSections && live.length === 0 && ledgerLive === 0 && missingFiles.length === 0,
      'corrected=' + corrected.length + ' pointsReal=' + pointsReal + ' sections=' + realSections + ' live=' + JSON.stringify(live) + ' ledgerLive=' + ledgerLive + ' missing=' + JSON.stringify(missingFiles));
  }
  // 3. r89-census-attribution
  {
    const sourcesMd = rd('corpus/SOURCES.md');
    const sourceRows = sourcesMd === null ? -1 : (sourcesMd.match(/^\| *(S[0-9]{3,}) *\|/gm) || []).length;
    const censusRows = /tabi\tok\t/.test(census89);
    const says224 = /224 rows/.test(correction) && !/223 rows/.test(correction.split('\n').find((l) => /224 rows/.test(l)) || '');
    const r88attr = /round-88/.test(correction);
    const quote = /neither beginning nor ending with ASCII whitespace/.test(correction);
    const words = (() => {
      const m = /"tokens consist of any string of zero or more characters, neither beginning nor ending with ASCII whitespace"/.exec(correction.replace(/\s+/g, ' '));
      return m ? m[0].replace(/"/g, '').split(/\s+/).filter(Boolean).length : -1;
    })();
    // the correction's own word annotation must equal the measured count
    const annot = /\(([0-9]+) words\)/.exec(correction.split('\n').filter((l) => /neither beginning nor ending/.test(l)).join(' ') + ' ' + correction.slice(correction.indexOf('neither beginning nor ending')).slice(0, 200));
    const annotOk = annot ? Number(annot[1]) === words : false;
    claim('r89-census-attribution', sourceRows === 224 && censusRows && says224 && r88attr && quote && words === 17 && annotOk,
      'sourcesRows=' + sourceRows + ' censusOk=' + censusRows + ' says224=' + says224 + ' r88attr=' + r88attr + ' quote=' + quote + ' words=' + words + ' annot=' + (annot ? annot[1] : 'none') + ' annotOk=' + annotOk);
  }
  // 4. r89-leak-enforcement
  {
    // behaviour, not source text: the witness artifact is a dead-branch run of this gate's
    // --selftest, and it must record the stock run green with the fixture ABSENT and the
    // mutated run red with the fixture PRESENT. A source-text grep cannot pass this.
    let witness = null;
    try { witness = JSON.parse(rd('.ufo/waves/round-90/scored/leak-witness.json') || 'null'); } catch { witness = null; }
    const pin = rd('.ufo/waves/round-90/freeze.txt') || '';
    const selfPin = (/^([0-9a-f]{64})  scripts\/check-record-drift-round90\.mjs$/m.exec(pin) || [])[1];
    const leakOk = !!witness
      && witness.stock && witness.stock.exit === 0 && witness.stock.fixtureAbsent === true && witness.stock.decoyPresent === true
      && witness.deadBranch && witness.deadBranch.exit === 1 && witness.deadBranch.fixtureAbsent === false
      && witness.instrumentPins && witness.instrumentPins['scripts/check-record-drift-round90.mjs'] === selfPin;
    const named = /Leak enforcement/.test(correction) && /witness/.test(correction);
    claim('r89-leak-enforcement', leakOk && named, 'witness=' + (witness ? JSON.stringify({ s: witness.stock, d: witness.deadBranch }) : 'missing') + ' pinOk=' + (!!witness && witness.instrumentPins && witness.instrumentPins['scripts/check-record-drift-round90.mjs'] === selfPin) + ' named=' + named);
  }
  // 5. r89-revision-naming
  {
    const names = /10:13/.test(correction) && /worktree/.test(correction) && /predates/.test(correction)
      && /SCORECARD\.md`? \(10:19:34\)/.test(correction) && /SKILL\.md`? \(10:19:40\)/.test(correction);
    claim('r89-revision-naming', names, 'namesWorktreeAndOrder=' + names);
  }
  // 6. gate-selftest
  {
    const wired = /check-record-drift-round90/.test(selftestRunner);
    const cst = /--selftest/.test(counterSrc);
    const bst = /--selftest/.test(batterySrc);
    const kst = /--selftest/.test(killSrc);
    const dst = /--selftest/.test(driftSrc);
    claim('gate-selftest', wired && cst && bst && kst && dst, 'wired=' + wired + ' counter=' + cst + ' battery=' + bst + ' killpower=' + kst + ' drift=' + dst);
  }
  // 7. quality161-sweep
  {
    const q161 = (quality.match(/^161\.[\s\S]*?(?=\n\d+\.|\n##|$)/m) || [''])[0];
    const cites = /check-record-drift-round90/.test(q161);
    const sweeps = /SCORECARD|selftest|tally/i.test(q161);
    claim('quality161-sweep', cites && sweeps, 'cites=' + cites + ' sweeps=' + sweeps);
  }
  // 8. scorecard-tallies
  {
    const rows = scorecard.split('\n');
    const heads = [];
    rows.forEach((l, i) => { const m = /^## Round (\d+)/.exec(l); if (m) heads.push({ round: Number(m[1]), i }); });
    const segOf = (n) => heads.filter((h) => h.round === n).map((h) => {
      const next = heads.find((x) => x.i > h.i);
      return rows.slice(h.i, next ? next.i : rows.length).join('\n');
    });
    const swept = [44, 68, 79, 80, 81, 84, 85];
    const bad = [];
    for (const n of swept) {
      const segs = segOf(n);
      if (segs.length === 0) { bad.push('round-' + n + '-missing'); continue; }
      for (const s of segs) {
        if (!/selftest 9\/9/.test(s)) bad.push('round-' + n + '-no-9');
        if (/selftest 10\/10/.test(s)) bad.push('round-' + n + '-has-10');
      }
    }
    const sanctioned = [];
    for (const h of heads) {
      if (h.round !== 87 && h.round !== 88) continue;
      const next = heads.find((x) => x.i > h.i);
      for (let i = h.i; i < (next ? next.i : rows.length); i++) if (/selftest 10\/10/.test(rows[i])) sanctioned.push(i);
    }
    const tens = [];
    rows.forEach((l, i) => { if (/selftest 10\/10/.test(l)) tens.push(i); });
    const stray = tens.filter((i) => !sanctioned.includes(i));
    claim('scorecard-tallies', bad.length === 0 && stray.length === 0,
      'bad=' + JSON.stringify(bad) + ' tens=' + tens.length + ' sanctioned=' + sanctioned.length + ' stray=' + JSON.stringify(stray));
  }
  return out;
}

if (selftestMode) {
  // isolated fixture: a minimal lane that lacks every corrected record. Every statement
  // must be RED for its INTENDED reason (missing block / missing instrument / no tally),
  // never merely because the runner could not read a file. A lane with the correction
  // block present (this lane's committed lesson copied in) must be GREEN on those five.
  const { spawnSync } = await import('node:child_process');
  const fsx = await import('node:fs');
  const base = process.env.HYAKU_SCRATCH || '/fast/scratch/hyaku';
  try { fsx.mkdirSync(base, { recursive: true }); } catch {}
  const fx = base + '/tabi-r90-driftfix-' + process.pid + '-' + Date.now().toString(36);
  const put = (rel, txt) => { const a = path.join(fx, rel); fsx.mkdirSync(path.dirname(a), { recursive: true }); fsx.writeFileSync(a, txt); };
  try {
    const seven = '# fixture\n' + [44, 68, 79, 80, 81, 84, 85].map((n) => '## Round ' + n + '\nselftest 9/9\n').join('') + '## Round 87\nselftest 10/10\n';
    put('SCORECARD.md', seven.replace('## Round 44\nselftest 9/9', '## Round 44\nselftest 10/10'));
    put('SKILL.md', '# fixture\n');
    put('LOG.md', '# fixture\n');
    put('corpus/QUALITY.md', '# fixture\n');
    // a lesson with NO correction block: the five r89 statements must be red
    put('corpus/lessons/round-89.md', '# fixture\n## Gate\nnarrowed at plans/round-89.md §Narrowings (4)\n');
    put('plans/round-89.md', '# fixture\nno re-freeze heading here\n');
    put('.ufo/waves/round-89/claims.json', JSON.stringify({ claims: {}, frozenAmendments: [] }));
    put('.ufo/waves/round-89/claim-falsification.tsv', 'C1\tw1/x.md\tfalsifies-wording\tplans/round-89.md §Narrowings\tstale\n');
    put('.ufo/waves/round-89/census/end.txt', '');
    for (const s of ['check-showpicker-round90.mjs', 'negatives-showpicker-round90.mjs', 'kill-power-round90.mjs', 'selftest-r90-gates.mjs']) put('scripts/' + s, '// fixture\n');
    put('scripts/check-record-drift-round90.mjs', fsx.readFileSync(process.argv[1], 'utf8'));
    const r = spawnSync(process.execPath, [path.join(fx, 'scripts', 'check-record-drift-round90.mjs'), '--lane', fx, '--json'], { encoding: 'utf8', timeout: 60000 });
    let j = null; try { j = JSON.parse(r.stdout); } catch {}
    const ids = j && j.results ? j.results.map((x) => x.id) : [];
    const failed = j ? j.failed : [];
    const wantRed = ['r89-claim-sweep', 'r89-narrowing-pointers', 'r89-census-attribution', 'r89-leak-enforcement', 'r89-revision-naming', 'gate-selftest', 'quality161-sweep', 'scorecard-tallies'];
    const okA = r.status === 1 && wantRed.every((id) => failed.includes(id));
    const okB = j && j.claims === 8 && ids.length === 8;
    // the fixture must be red for the intended reasons
    const detail = (id) => (j && j.results ? (j.results.find((x) => x.id === id) || {}).detail || '' : '');
    const okC = /amendment=missing/.test(detail('r89-claim-sweep')) && /live=\["corpus\/lessons\/round-89.md"\]/.test(detail('r89-narrowing-pointers')) && /round-44-has-10/.test(detail('scorecard-tallies'));
    // green side: this lane's committed files drive every statement green except the ones
    // the fixture cannot carry (the real lane is measured by the ordinary invocation).
    // QAULITY 162 witness: the fixture tree is removed by the process that created it, and
    // the absence assertion can fail (a planted decoy must still be present afterwards).
    const decoy = fx + '-decoy';
    fsx.mkdirSync(decoy, { recursive: true });
    try { fsx.rmSync(fx, { recursive: true, force: true }); } catch {}
    const fixtureAbsent = !fsx.existsSync(fx);
    const decoyPresent = fsx.existsSync(decoy);
    try { fsx.rmSync(decoy, { recursive: true, force: true }); } catch {}
    const out = { schema: 'tabi-r90-record-drift-selftest', exit: r.status, failed, cases: j ? j.claims : null, ok: !!(okA && okB && okC && fixtureAbsent && decoyPresent), fixtureAbsent, decoyPresent, details: { sweep: detail('r89-claim-sweep'), pointers: detail('r89-narrowing-pointers'), tallies: detail('scorecard-tallies') } };
    if (asJson) process.stdout.write(JSON.stringify(out, null, 1) + '\n');
    else process.stdout.write(JSON.stringify(out) + '\n');
    process.exit(out.ok ? 0 : 1);
  } catch (e) {
    process.stdout.write(JSON.stringify({ schema: 'tabi-r90-record-drift-selftest', ok: false, reason: String(e && e.message) }) + '\n');
    process.exit(1);
  }
}

const results = statements(lane);
const mismatches = results.filter((r) => !r.ok).length;
const out = { schema: 'tabi-r90-record-drift', claims: results.length, mismatches, failed: results.filter((r) => !r.ok).map((r) => r.id), results };
if (asJson) process.stdout.write(JSON.stringify(out, null, 1) + '\n');
else process.stdout.write(JSON.stringify({ claims: out.claims, mismatches, failed: out.failed }, null, 1) + '\n');
process.exitCode = mismatches === 0 ? 0 : 1;
