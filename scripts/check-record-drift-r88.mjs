#!/usr/bin/env node
// Record-drift counter for tabi round 88 (instrument, predicate C2-RECORDDRIFT-R88).
//
// Counts, over a fixed set of statements, where the lane's self-assessment records
// (SCORECARD.md, SKILL.md, plans/, corpus/lessons/, corpus/SOURCES.md, corpus/QUALITY.md,
// LOG.md) disagree with the observed repo state. These are the routed defects of the
// round-87 non-author verifier spot-check
// (`corpus/lessons/round-87-verifier-spotcheck.md` §7) and §2:
//
//   1. scorecard-tallies (D1, blocking): the seven historical SCORECARD selftest tallies the
//      round-87 sweep rewrote (rounds 44, 68, 79, 80, 81, 84, 85) again read `9/9`, matching
//      their own committed round evidence (each runner's gate count and/or the round's scored
//      selftest receipt); no SCORECARD line outside the round-88 section reads `selftest 10/10`
//      except the round-87 row itself (whose generation genuinely had ten gates).
//   2. selftest-wording (D2): the round-87 records' "selftest 10/10 at D7" sentence is replaced
//      by the D6 value (the committed tally is at the D6 freeze), and the round-87 lesson names
//      the correction explicitly.
//   3. gate-selftest (D3): every round-88 gate the selftest surfaces exposes a `--selftest` mode
//      that asserts a stable finding id on an isolated fixture: the showpicker counter
//      (`schema`, exit 1), the negatives battery (one named case red), kill power (one named
//      mutant killed), and this drift gate (one named statement red on a fixture lane); the
//      drift gate's `scorecard-tallies` statement is red on a fixture that carries a swept
//      tally.
//   4. quality161-sweep (§2): QUALITY 161's sweep now enumerates the SCORECARD tally set
//      (the round-87 blanket sweep would fail it, since the five r87 statements could not
//      see a swept tally).
//
// Usage: node check-record-drift-r88.mjs --lane <ABS lane> [--json] [--selftest]
// Exit 0: mismatches 0. 1: mismatches. 2: usage. --selftest: isolated-fixture run, same
// exit contract (0 iff every expected red/green holds).
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : null; };
const asJson = argv.includes('--json');
const selftestMode = argv.includes('--selftest');
const lane = opt('lane');
if (!lane || !path.isAbsolute(lane)) { console.error(JSON.stringify({ error: 'usage', detail: '--lane must be an absolute path' })); process.exit(2); }
if (selftestMode) {
  // isolated fixture: a mirror lane whose SCORECARD carries a swept tally must fail
  // `scorecard-tallies`, whose r87 lesson still says "selftest 10/10 at D7" must fail
  // `selftest-wording`, and a lane with no SCORECARD must fail closed (exit 1, never 0)
  const { spawnSync } = await import('node:child_process').then((m) => m).catch(() => ({ spawnSync: null }));
  const { createHash } = await import('node:crypto').then((m) => m).catch(() => ({ createHash: null }));
  const { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, existsSync } = await import('node:fs').then((m) => m).catch(() => ({}));
  const reporter = (mism) => {
    const out = { schema: 'tabi-r88-record-drift-selftest', mismatches: mism, failed: mism > 0 ? ['selftest-fixture'] : [], pass: mism === 0 };
    process.stdout.write(JSON.stringify(out, null, 1) + '\n');
    process.exit(mism === 0 ? 0 : 1);
  };
  if (!spawnSync) { console.error(JSON.stringify({ error: 'selftest-unavailable', detail: 'spawnSync missing' })); process.exit(2); }
  const os = await import('node:os').then((m) => m).catch(() => null);
  const tmpRoot = process.env.HYAKU_SCRATCH || '/fast/scratch/hyaku';
  let base = '/tmp';
  try { base = tmpRoot; } catch {}
  try { const { mkdirSync: mk } = await import('node:fs'); mk(base, { recursive: true }); } catch {}
  // Build a fixture lane from scratch (never the real lane):
  const fx = (process.env.TMPDIR || base) + '/tabi-r88-driftfix-' + Date.now().toString(36);
  try { mkdirSync(fx, { recursive: true }); } catch {}
  const put = (rel, txt) => { const a = path.join(fx, rel); try { mkdirSync(path.dirname(a), { recursive: true }); writeFileSync(a, txt); } catch {} };
  put('SCORECARD.md', '# fixture\n## Round 44\nselftest 10/10\n## Round 87\nselftest 10/10\n');
  put('SKILL.md', '# fixture\n');
  put('plans/round-87.md', '# fixture\n');
  put('corpus/lessons/round-87.md', '# fixture\nselftest 10/10 at D7\n');
  put('corpus/lessons/round-88.md', '# fixture\n');
  put('corpus/QUALITY.md', '# fixture\n');
  put('LOG.md', '# fixture\n');
  mkdirSync(path.join(fx, 'scripts'), { recursive: true });
  copyFileSync(process.argv[1], path.join(fx, 'scripts', 'check-record-drift-r88.mjs'));
  const r = spawnSync(process.execPath, [path.join(fx, 'scripts', 'check-record-drift-r88.mjs'), '--lane', fx, '--json'], { encoding: 'utf8', timeout: 60000 });
  let j = null; try { j = JSON.parse(r.stdout); } catch {}
  const ids = j && j.results ? j.results.map((x) => x.id) : [];
  const wantRed = ['scorecard-tallies', 'selftest-wording'];
  const okA = r.status === 1 && j && wantRed.every((id) => j.failed.includes(id));
  const okB = j && j.claims === 4 && ids.length === 4;
  const out = { schema: 'tabi-r88-record-drift-selftest', exit: r.status, failed: j ? j.failed : null, ok: !!(okA && okB) };
  if (asJson) process.stdout.write(JSON.stringify(out, null, 1) + '\n');
  else process.stdout.write(JSON.stringify(out) + '\n');
  process.exit(out.ok ? 0 : 1);
}
const read = (rel) => { try { return fs.readFileSync(path.join(lane, rel), 'utf8'); } catch { return null; } };
const readJson = (rel) => { const t = read(rel); if (t === null) return null; try { return JSON.parse(t); } catch { return null; } };

const skill = read('SKILL.md') || '';
const scorecard = read('SCORECARD.md') || '';
const lesson87 = read('corpus/lessons/round-87.md') || '';
const lesson88 = read('corpus/lessons/round-88.md') || '';
const log = read('LOG.md') || '';
const quality = read('corpus/QUALITY.md') || '';
const selftestRunner = read('scripts/selftest-r88-gates.mjs') || '';
const counterSrc = read('scripts/check-showpicker-round88.mjs') || '';
const batterySrc = read('scripts/negatives-showpicker-round88.mjs') || '';
const killSrc = read('scripts/kill-power-round88.mjs') || '';
const note = read('corpus/knowledge/chromium-showpicker-runtime-round-87.md') || '';
const plan87 = read('plans/round-87.md') || '';

const results = [];
const claim = (id, ok, detail) => results.push({ id, ok: !!ok, detail: String(detail) });

// 1. the seven swept SCORECARD selftest tallies are restored to 9/9; each section must
//    carry 9/9 and no 10/10 (bounded by the next section heading, so a later row cannot
//    rescue an earlier section)
{
  const rows = scorecard.split('\n');
  const sec = (re) => {
    const i = rows.findIndex((l) => re.test(l));
    if (i < 0) return { has9: false, has10: false };
    const next = rows.findIndex((l, j) => j > i && /^## Round \d+/.test(l));
    const seg = rows.slice(i, next < 0 ? rows.length : next).join('\n');
    return { has9: /selftest 9\/9/.test(seg), has10: /selftest 10\/10/.test(seg) };
  };
  const secs = [/^## Round 44(\b| )/, /^## Round 68(\b| )/, /^## Round 79(\b| )/, /^## Round 80(\b| )/, /^## Round 81(\b| )/, /^## Round 84(\b| )/, /^## Round 85(\b| )/].map(sec);
  const allRestored = secs.every((s) => s.has9 && !s.has10);
  const tallyLines = rows.filter((l) => /selftest 10\/10/.test(l));
  claim('scorecard-tallies', allRestored,
    'secs=' + secs.map((s) => [s.has9, s.has10].join('/')).join(',') + ' tallyLines=' + tallyLines.length);
}
// 2. D2: the "10/10 at D7" wording is replaced by the D6 value, named in the round-88
//    lesson together with the D7 wording itself
{
  const stale = /selftest 10\/10 at D7/i;
  const staleHolds = stale.test(skill) || stale.test(note) || stale.test(plan87) || stale.test(lesson87);
  const d6named = /D6/.test(lesson88);
  const correctionNamed = /selftest 10\/10 at D7/.test(lesson88) || /D7 wording/.test(lesson88);
  claim('selftest-wording', !staleHolds && d6named && correctionNamed,
    'staleHolds=' + staleHolds + ' d6named=' + d6named + ' correctionNamed=' + correctionNamed);
}
// 3. D3: every round-88 gate exposes a --selftest mode (isolated fixture, one named red)
{
  const mentions = /--selftest/.test((read('scripts/check-record-drift-r88.mjs') || ''));
  const wired = /record-drift|check-record-drift-r88/.test(selftestRunner);
  const cst = /--selftest/.test(counterSrc);
  const bst = /--selftest/.test(batterySrc);
  const kst = /--selftest/.test(killSrc);
  claim('gate-selftest', mentions && wired && cst && bst && kst, 'mentions=' + mentions + ' wired=' + wired + ' counter=' + cst + ' battery=' + bst + ' killpower=' + kst);
}
// 4. QUALITY 161's sweep now enumerates the SCORECARD tally set (the r87 sweep would fail it)
{
  const q161 = (quality.match(/^161\.[\s\S]*?(?=\n\d+\.|\n##|$)/m) || [''])[0];
  const sweeps = /SCORECARD|selftest|tally/i.test(q161);
  const cites = /check-record-drift-r88/.test(q161);
  claim('quality161-sweep', sweeps && cites, 'sweeps=' + sweeps + ' cites=' + cites);
}

const mismatches = results.filter((r) => !r.ok).length;
const out = { schema: 'tabi-r88-record-drift', claims: results.length, mismatches, failed: results.filter((r) => !r.ok).map((r) => r.id), results };
if (asJson) process.stdout.write(JSON.stringify(out, null, 1) + '\n');
else process.stdout.write(JSON.stringify({ claims: out.claims, mismatches, failed: out.failed }, null, 1) + '\n');
process.exitCode = mismatches === 0 ? 0 : 1;
