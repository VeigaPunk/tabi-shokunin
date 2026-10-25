# Scribe04 — round-28 claim evidence matrix (baseline eb23c0b84668afc48ebab8bd7e4a8a4457407cc4)

Seat: Scribe04, item 28. Role: UFO-FSD scribe — evidence matrix only, no production edits, no nested delegation. Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. All commands run from lane root at `HEAD == baseline` (`git rev-parse HEAD` → `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`). Frozen claims: `.ufo/waves/round-28/claims.json` (frozenAt 2026-10-25, frozenBeforeData=true). No tool installs performed (RULES.md channel order not exercised; PACMAN PAUSED). Working tree has no tracked modifications; `git status --porcelain` shows only untracked `.ufo/waves/round-28/` staging (round staging, incl. this report). Pre-existing stash `stash@{0}: simplgates-verify` present (not created by this seat).

## C1 — S106 gate revision binding (depth)

Frozen declared: "receipt must bind the measurement revision and the gate must verify the committed receipt at that revision. Preserve fetch-failure as could-not-evaluate. Target: gate selftest cases increase from 5 to at least 7, with red controls for revision mismatch and correct revision; runtime gate at its committed target receipt remains valid." Metric `s106_gate_revision_binding_cases`, countingCommand `node scripts/check-s106-evidence.mjs --selftest`.

| Item | Observation | Class |
|---|---|---|
| Head == baseline | `git rev-parse HEAD` = `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` | observation |
| Selftest count (before) | `node scripts/check-s106-evidence.mjs --selftest` → `S106_SELFTEST verdict=clean cases=5 passed=5` (exit 0) | observation |
| Selftest case inventory | `clean-fixture-valid`, `sha-mismatch-invalid`, `anchor-off-by-one-invalid`, `missing-bytes-could-not-evaluate`, `missing-receipt-could-not-evaluate` (CASES at scripts/check-s106-evidence.mjs:175-213). No revision-binding fixture exists; no case evaluates at a revision different from the receipt's own commit | observation |
| Runtime gate at tip | `node scripts/check-s106-evidence.mjs --rev eb23c0b… --json` → exit 0, `present=true`, `sha_match=true`, `anchor_located=true`, `anchor_unique=true`, `byte_count_match=true`, `valid=true` | observation |
| Receipt revision binding | `corpus/evidence/round-26/sources/s106.json` keys: schema, row, url, fetched_at, transfer, encoded_bytes, encoded_sha256, bytes_path, decoded_bytes, decoded_lines, decoded_sha256, anchor, verification, status — no git-revision field. `parseReceipt` (check-s106-evidence.mjs:87-105) and `evaluate` (107-144) never read or compare a revision identity; receipt binding is content-hash only | observation |
| CNE preservation | `missing-bytes-could-not-evaluate` exit 2 and `missing-receipt-could-not-evaluate` exit 2 both PASS; fetch-failure/C could stays could-not-evaluate | observation |
| Control (do-nothing) | unchanged selftest = 5 (< target 7); no red/green revision fixtures exist | observation |
| Kill-rule preconditions | matching committed receipt currently valid (above); mismatch fixture currently impossible (no revision semantics in evaluate) — after adding binding, gate must keep `valid=true` at tip on the rebuilt receipt | observation/inference |

Unresolved: post-fix selftest count (≥7) and red/green outcomes are unobservable before implementation; runtime `valid=true` at tip is a precondition, not a post-fix guarantee.

## C2 — selfassessment m1 LOG supersession (calibration)

Frozen declared: "a correction only clears the exact stale tally it cites, not an unrelated later line/paragraph. Target: self-assessment mismatch count at tip is nonzero for the known LOG.md:221 false-clear and matching selftest includes a red unrelated-citation case and positive exact-citation control." Metric `selfassessment_mismatches_and_cases`, countingCommand `node scripts/check-selfassessment.mjs --rev <REV> --json`.

| Item | Observation | Class |
|---|---|---|
| Tip run | `node scripts/check-selfassessment.mjs --rev eb23c0b… --json` → exit 1, `mismatches=1`, `clean=false`, `superseded=10`, 115 findings (captured `.ufo/waves/round-28/scratch/Scribe04/selfassessment-tip.json`) | observation |
| The single mismatch is not LOG 221 | the only non-superseded mismatch is `m3-unlanded-paths` (SCORECARD.md, observed=10 at capture; replication `git status --porcelain --untracked-files=all | wc -l` = 16 now) — an artifact of untracked round-28 staging files; LOG.md:221 is NOT counted | observation/inference |
| LOG.md:221 false-clear (before) | finding `m1-selftest-tally` LOG.md:221, script `scripts/check-freshness.mjs`, claimed=8, observed=12, `superseded=true` → hidden from mismatch count, exactly as claims "before" states | observation |
| Oracle | `node scripts/check-freshness.mjs --self-test` → `FRESHNESS_SELFTEST verdict=clean cases=12` (exit 0) | observation |
| Superseding paragraphs mis-cite | matcher condition (check-selfassessment.mjs:319-327): later paragraph must name same script AND `/supersed|correct/i` AND `/:\d+/` (any colon-number token) AND `statedTallyNumbers` includes oracle. LOG.md:1904-1907 correction cites `:335`; LOG.md:1908-1911 cites `:391`; both name `scripts/check-freshness.mjs`, carry "Correction", and include `cases: 12` → both satisfy the matcher for LOG.md:221. `grep ':221'` over LOG.md: no exact citation exists anywhere | observation |
| Lane's own diagnosis | LOG.md:1930-1934: "It therefore marks the real `LOG.md:221` stale selftest mention superseded by a later 183-line paragraph that does not cite line 221" (prior round-27 record; consistent with current behavior at tip) | observation |
| Selftest inventory | `node scripts/check-selfassessment.mjs --selftest` → `SELFASSESSMENT_SELFTEST verdict=clean cases=17 passed=17` (exit 0). Green exact-citation control EXISTS: `m1-log-stale-then-corrected` (correction cites `:6`, the fixture tally line, logDoc builder check-selfassessment.mjs:430-441). Red unrelated-citation case ABSENT: `m1-log-wrong-number-correction` is red on a wrong number, not on an unrelated citation; no case asserts a correction citing another line retains the mismatch | observation |
| Control (do-nothing) | reproduces false-clear (LOG.md:221 superseded=true, not counted); `mismatches` at tip stays driven by m3 staging artifact, never by LOG 221 | observation/inference |

Unresolved: post-fix `mismatches` >= 1 attributable to LOG.md:221 and the new red/green selftest cases are unobservable before implementation; current selftest 17/17 has no unrelated-citation red case.

## Out-of-scope / notes
- No production edits made (scribe role); evidence only. No real-site interaction, credentials, or consequential actions.
- Prior independent defect evidence `corpus/lessons/round-27-verifier-spotcheck.md:15,46-47` supports both claims' "before" states (C1 misleading unprovable; C2 false-clear + routed matcher repair).
- `notClaimed`: no coverage/source-admission claim; no real-site interaction; `considerthese` directory not examined (not required).
