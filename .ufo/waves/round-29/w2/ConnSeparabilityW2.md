# ConnSeparabilityW2 — empirical cross-claim separability (round 29, wave w2)

Seat: ConnSeparabilityW2 (leaf connector, no subagent dispatch)
Measured at assigned tip: `32008a453737a27f69e9ab401d0b9775d2a944f7` (porcelain clean), baseline `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb`.

## Axes

- **Primary (per item): separability** — is each claim's counter output invariant under reversal of the other two claims' landings?
- **Guarded axes:** C1=operability, C2=calibration, C3=freshness (a separability failure would mean one claim's count moves when an unrelated claim is unlanded — i.e. the claims are not independent evidence).

## Method

Three scratch `git clone --shared` worktrees of `32008a45`, one per revert, each committed locally (counters read committed state via `git show`, so `--rev` names the local revert commit):

| revert | scope (per item) | local commit | diff vs tip |
|---|---|---|---|
| C1 | `scripts/check-s106-evidence.mjs` restored to `856fa9e` | `7c604ff04b7437498a1434548ea3197742269eab` | 1 file, 4+/15- |
| C2 | SCORECARD round-29 corrections section + LOG correction paragraph removed | `2a8ae9ba4223d57169343711dc987a2c3b06d62c` | LOG 3-, SCORECARD 10- |
| C3 | `corpus/evidence/round-29/release-pins/` removed + S108–S115 rows deleted from `corpus/SOURCES.md` | `009aa0126288c64eb5596e88b2a9c28234d5767d` | 49 files, 55370- |

Revert fidelity: each diagonal cell below reproduces the expected pre-claim behaviour, so each revert bit.

Counting commands (from `.ufo/waves/round-29/claims.json`):
- C1: `node scripts/check-s106-evidence.mjs --selftest` → exit code + `S106_SELFTEST` tally
- C2: `node scripts/check-selfassessment.mjs --rev <REV> --json` → `.mismatches` (frozen counter sha256 verified `728128008e…60c4` at tip)
- C3: `node scripts/check-release-pins.mjs --rev <REV> --stable 156.0.8078.47 --json` → `{population,unresolved,holds,drifted}`

Tools: node v24.21.0, jaq 3.1.1 (pre-existing; no installs this seat).

## 3×3 matrix

Columns = measured claim; rows = scenario. "unchanged" = identical to the tip control column.

| scenario ↓ / measured → | C1 (selftest) | C2 (mismatches) | C3 (pop/unresolved/holds/drifted) |
|---|---|---|---|
| **tip 32008a45 (control)** | exit=0, `verdict=clean cases=7 passed=7` | `0` (exit 0) | `23 / 23 / 0 / 0` (exit 1) |
| **revert C1** (7c604ff) | exit=1 `ReferenceError: existsSync is not defined` (revert bites) | `0` (exit 0) — **unchanged** | `23 / 23 / 0 / 0` (exit 1) — **unchanged** |
| **revert C2** (2a8ae9ba) | exit=0, `verdict=clean cases=7 passed=7` — **unchanged** | `7` (exit 1) (revert bites) | `23 / 23 / 0 / 0` (exit 1) — **unchanged** |
| **revert C3** (009aa012) | exit=0, `verdict=clean cases=7 passed=7` — **unchanged** | `0` (exit 0) — **unchanged** | `23 / 23 / 0 / 0` (exit 1) (revert bites) |

**Separability verdict: HOLDS on all six off-diagonal cells.** Every claim's count is byte-identical to the tip control under reversal of the other two claims. No claim's evidence depends on another claim having landed.

Raw per-cell outputs: `ConnSeparabilityW2/tip-c2.json`, `ConnSeparabilityW2/revert{C1,C2,C3}-c{1,2,3}.{txt,json}`; revert diff stats: `ConnSeparabilityW2/revert-commits.txt`.

## Findings

1. **Separability holds empirically (the item's question).** C1 touches only the s106 gate; C2 the SCORECARD/LOG correction paragraphs; C3 the release-pins evidence + S108–S115 rows. The counters' outputs are independent across these file sets, confirmed by measurement, not just by the claims.json `separability` note.

2. **Diagonal sanity:** each revert reproduces the pre-claim state — C1 revert crashes with the baseline `ReferenceError`; C2 revert re-opens stale-tally findings; C3 revert flips the C3 reason from `f6-refetch …` to `r1-entry receipt absent` (receipt gone) while unresolved stays 23.

3. **C2 revert yields 7 findings, not the frozen-before 6** (`revertC2-c2.json`). The extra finding is `SCORECARD.md:1438` (claimed 5, observed 7): a staleness that only exists because C1 landed (the s106 selftest went from crash-at-baseline to 7/7). This is a **content-level coupling, not a count-level one**: C2's corrections section includes a correction for `SCORECARD.md:1438`, so with C2 landed the count is 0 whether or not C1 is present (measured: revertC1 → C2 = 0), and with C1 reverted line 1438 reads could-not-evaluate (`observed=null`) and is not counted. Matches the claims.json separability note ("If C1 does not land, SCORECARD.md:1438 stays could-not-evaluate"). No action needed; flagged so the 6-vs-7 is not misread as a counter drift.

4. **C3 target is not met at the assigned tip (secondary observation, outside separability).** At `32008a45` the C3 counter reports `population=23 unresolved=23` (exit 1) — identical to the baseline before-state. All 23 rows fail on `f6-refetch <path>`: the required independent re-fetch records `corpus/evidence/round-29/release-pins/refetch/<id>.json` are **not committed at the tip** (directory absent; verified in both the scratch clone and the lane checkout, and unchanged at lane HEAD `e1e3a15`). Wave-2 refetch seats (RefetchS098/S099/S100/S105/S106 et al.) are producing these records now. Consequence: the claims.json C3 target `unresolved=0` is currently unmet at the stated integration tip; C3 cannot be admitted until the refetch records land and the same counting command returns `unresolved=0`. Not a separability violation — C3's count is invariant under C1/C2 reversal — but it bounds what wave 1 actually proved.

## Risks

- The C2 7-vs-6 delta could be misread as counter drift; it is a C1-induced stale line that C2's own correction covers (finding 3).
- The C3 tip-state observation (finding 4) is a snapshot at `32008a45`; once refetch records land, the C3 column should be re-measured (its separability invariance is expected to persist — nothing in C1/C2 touches those paths).

## Verification

All commands run in the scratch clones; exit codes are node's own (no pipes on the measured process). Honesty note: the C3 counter was re-run with stderr captured (`revertC*-c3.err`, empty); C1 selftest outputs preserved verbatim (`revertC*-c1.txt`).
