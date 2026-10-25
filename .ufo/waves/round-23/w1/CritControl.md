# CritControl — C1 control design, pre-measurement attack (round 23)

**Verdict: the frozen counter is NOT control-proof. A round-keyed skip-work script (`--round 22` → six classes, every other input → zero, faked 12/12 selftest) satisfies every control sentence C1 names, and the declared counting command does not even run against the shipped CLI (exit 2). Target 6 is reachable with no derivation; the smallest safe correction is six round-22-keyed green mutants that must yield 5.**

Observed 2026-10-25T04:19-03:00 against `scripts/round-evidence-audit.mjs` (untracked, sha256 `7c528f15…cd9af72c`, edited live three times during this review).

## Counterexample (skip-work reaches the target)

- **F1 — cheapest skip-work, concrete.** My control reads no evidence; `hit = (round === 22)` is its only "derivation" and `--selftest` prints a constant. It scores 6 and clears all three controls:
  `node .ufo/waves/round-23/scratch/CritControl/skipwork-roundkeyed.mjs --rev be271a2d… --round 22 --round-cap 128 --json` → 6 classes, exit 1;
  same script `--rev 5f58577… --round 21` → `[]` exit 0; `--rev deadbeef… --round 90` (clean fixture) → `[]` exit 0; `--selftest` → `cases:12,passed:12` exit 0.
  The frozen counter `findings[].class (distinct count)` returns **6**. The lane's committed `fixtures/skipwork-control.mjs` is the weaker *unconditional* variant; the round-keyed variant is cheaper and survives the declared control.
- **F2 — the guard that kills F1.** A green mutant must be a **round-22 tree with one class repaired**, expected `findingClasses.length === 5 && !includes(class)`. A rev/round-keyed print-six yields 6 → dies. `fixtureCtx` and `audit` are already exported, so this needs only round-22 blobs + one byte edit per class, no history write.
- **F3 — the shipped selftest cannot express F2.** All 12 cases run on a synthetic round-90 fixture (`grep -n 'function baseFixture' scripts/round-evidence-audit.mjs` → `round = 90`), and every green case is a round-90 mutation; no case is keyed to the audited round. Green-side evidence therefore never contradicts a round-keyed answer. `node scripts/round-evidence-audit.mjs --selftest --json` → 12/12 while F1 also "passes" 12/12.
- **F4 — c4's green mutant can be a false sentence.** The class clears when the Stale-lane line merely matches `/attempt/i` (`scripts/round-evidence-audit.mjs:332`). On real round-22 bytes (12 attempt artifacts, `git ls-tree -r --name-only be271a2 -- .ufo/waves/round-22 | grep -cE 'attempt[^/]*\.json$|spawn-result\.json$'` → 12) I replaced the line with "one attempt" — a statement falsified by those 12 artifacts — and c4 vanished: `node scripts/round-evidence-audit.mjs --rev be271a2… --round 22 --round-cap 128 --report .ufo/waves/round-23/scratch/CritControl/report-attempt-word.md --json` → 5 classes, c4 absent. The routed defect (attempt 2 silent on the commit test) is never derived; only a word is.
- **F5 — c3's predicate was widened until round-21 cleared.** With the class as frozen ("Gate carries no spot-check result") round-21 trips it: `git show be271a2:corpus/lessons/round-21.md | grep -ci 'spot-check'` → 0, and the earlier revision of the script returned `['c3-gate-spotcheck']` on round-21. The predicate now also accepts `/non-author/i && /closure|verifier/i` (`:315`), which round-21's Gate satisfies ("No non-author admit/reject agreement is asserted … parent/non-author verifier") and round-22's does not. Round-21 now returns `[]`. The control holds only through a post-observation semantic widening that the frozen claims do not state; the frozen class and the frozen control are mutually inconsistent.

## Reverse test (correct implementation scoring <6)

- **F6 — c2 needs two inputs outside the audited rev.** The band comes from the fleet policy (`policySha256 b5f635af…`); the cap must be passed as `--round-cap`. The round's own committed validation contradicts the band: `git show be271a2:.ufo/waves/round-22/w2b-validation.json` → `policy.waveMaxLanes: 100, declaredMaxLanes: 65`, under which `maxLanes 65` is legal. A strictly bytes-only implementation reports no c2 finding (and, with no external cap, cannot derive 129 > 128) → **5, not 6**. 6 requires admitting policy + cap as pinned inputs; the claim's phrase "from a round's committed wave bytes" is false for this class.
- **F7 — c4/c6 read a foreign working tree, not committed bytes.** The report is read with `readFileSync` from `/home/vgpnk/Projects/shokunin/.ufo/reports/round-<N>/tabi.md` — another repository, outside `--rev`, unpinned. It is byte-identical today (`git -C /home/vgpnk/Projects/shokunin show 69449ed:.ufo/reports/round-22/tabi.md | sha256sum` = `sha256sum .ufo/reports/round-22/tabi.md` = `a838b5b4…ca9800e`), but an edit to that working file changes c4/c6 at a fixed `--rev`; the recorded `reportSha256` identifies bytes without binding them to a commit. A bytes-only implementation scores 4–5.
- **F8 — the frozen counting command is unrunnable.** `node scripts/round-evidence-audit.mjs --rev be271a2… --round 22 --json` → exit 2, `refused: --round-cap is required`. Only `… --round-cap 128 --json` returns 6. The receipt already scores a command the claims did not freeze; before/after differ in argv, not only in rev.

## Provenance and scope

- **F9 — no auditor digest in the receipt.** `grep -c sha .ufo/waves/round-23/fixtures/skipwork-receipt.json` → 0; the script's sha changed during this review (`sha256sum scripts/round-evidence-audit.mjs` → `7c528f15…`). Round 22 pinned `PRODUCER_SHA256`; this round pins neither auditor nor its 12 cases, so 6/6 cannot be re-bound to the bytes that produced it.
- **F10 — c6 is broader than the routed defect, correctly.** It fires twice: rows citing `47bfb5f` and `be271a2` (`git show --name-only --format='' be271a2 | grep -c '^LOG.md$'` → 0). Not a break; note it so the claim's "six defects" is not read as "six rows".
- **F11 — c1 is robust but under-scoped.** It takes `Math.max` over lesson-then-report citations (23) against 24 receipts; the committed `w2b-spec.json` context says "14 whole-payload cap refusals" and is never read, so a green mutant that fixes only the lesson leaves a contradictory committed figure and still clears. Name the pinned citation source in the class, or the green mutant proves less than claimed.

## Impacted axes

- **operability (C1):** the acquisition itself stands (round-22 → 6 is honest for the current implementation under `--round-cap 128`), but the target is not falsifiable against skip-work and the declared counter does not execute.
- **calibration:** a predicate widened after round-21 was observed, plus an unpinned auditor, is the same false-provenance class round 22 self-punished.

## Smallest safe correction

Adopt F2 verbatim into the claims: the control is *six round-22-keyed green mutants, each expected to yield exactly 5 with its class absent*, produced from round-22 blobs through the exported `audit`/`fixtureCtx`; plus (a) re-freeze the counting command with `--round-cap 128` or derive the cap from committed bytes, (b) record `policySha256` and the auditor's own sha256 in the receipt, (c) narrow c4 to a per-attempt grading token (attempt id + commit-test verdict) so prose cannot clear it, and (d) restate c3's predicate exactly, including the non-author-deferral branch, so the round-21 control is a property of the class rather than of a later edit.
