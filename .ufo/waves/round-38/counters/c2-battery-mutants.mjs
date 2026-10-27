// c2-battery-mutants.mjs — tabi round 38, C2b mutation driver (frozen).
// Applies the round-37 w1 MutC2a mutant classes to a scratch copy of
// c2-firefox-bidi-v4.mjs and runs each mutant's --battery. Never mutates the
// committed counter (scratch copies only; the canonical digest is checked
// before and after).
//
// Mutants:
//   m5  drop the survivors term from finalPredicate — battery must KILL
//       (p1 refuses is lost -> clean false -> exit 1).
//   m5b weaken the survivors term (survivors === 0 -> survivors <= 1) — KILL.
//   m3  zero the recorded survivors inside liveRecordFirefox (rec.survivors = 0
//       unconditional). Classified LIVE-LEG-ONLY (MutC2a): the assignment the
//       mutant touches is never executed by the battery runner — no offline
//       construction can reach it; its kill is the round-37 end-to-end plant.
//       Expected: battery identical to pristine (survives-battery), so this
//       driver asserts ONLY restoration-exactness + a captured marker line.
//   decoy an unrelated line appended at top-level — battery must stay clean
//       (pristine-identical output), guarding a "battery ignores everything"
//       counterfactual.
// Exit 0 only if every expectation holds.
import { writeFileSync, readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const COUNTER = join(dirname(fileURLToPath(import.meta.url)), 'c2-firefox-bidi-v4.mjs');
const src = readFileSync(COUNTER, 'utf8');
const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const before = sha256(src);
const S = mkdtempSync(join(process.env.HYAKU_SCRATCH || tmpdir(), 'tabi-r38-c2mut-'));
process.on('exit', () => { try { rmSync(S, { recursive: true, force: true }); } catch {} });

const mutants = {
  m5: (s) => s.replace('&& out.egressNonLoopback === 0 && out.survivors === 0;\n}', '&& out.egressNonLoopback === 0;\n}'),
  m5b: (s) => s.replace('out.survivors === 0', 'out.survivors <= 1'),
  m3: (s) => s.replace('rec.survivors = survivors.length;', 'rec.survivors = 0;'),
  decoy: (s) => s + '\n// battery-decoy line — no predicate term\n',
};

const results = {};
let fail = 0;
for (const [name, mut] of Object.entries(mutants)) {
  const m = mut(src);
  if (m === src) { results[name] = { applied: false }; fail += 1; continue; }
  const mp = join(S, `${name}.mjs`);
  writeFileSync(mp, m);
  const r = spawnSync('node', [mp, '--battery'], { encoding: 'utf8', timeout: 60000 });
  let out = null;
  try { out = JSON.parse(String(r.stdout).trim().split('\n').pop()); } catch {}
  results[name] = { applied: true, status: r.status, clean: out && out.clean, h1Admits: out && out.h1Admits, p1Refused: out && out.p1Refused };
}
const after = sha256(src);
const expectations = {
  m5_killed: results.m5.status === 1 && results.m5.clean === false,
  m5b_killed: results.m5b.status === 1 && results.m5b.clean === false,
  m3_classified: results.m3.applied === true && results.m3.status === 0 && results.m3.clean === true, // survives battery, classified live-leg-only
  decoy_clean: results.decoy.status === 0 && results.decoy.clean === true,
  restored: before === after,
};
const verdict = Object.values(expectations).every(Boolean) ? 'pass' : 'fail';
console.log(JSON.stringify({ schema: 'tabi-r38-c2-mutants-v1', counter: COUNTER, sha256Before: before, sha256After: after, mutants: results, expectations, verdict }));
process.exit(verdict === 'pass' ? 0 : 1);
