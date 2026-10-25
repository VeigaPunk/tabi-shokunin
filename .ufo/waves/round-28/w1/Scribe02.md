# Scribe02 — round-28 claim evidence matrix (item 26)

Seat: Scribe02. Scope: draft claim evidence matrix only — exact commands, observed values, unresolved claims. No code edited; no tracked lane changes; read-only git; node script runs only.

- Lane root: /home/vgpnk/Projects/shokunin/tabi-shokunin (all paths below relative to it).
- Claims cited from `.ufo/waves/round-28/claims.json` (frozen before data, baseline `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`).
- HEAD == baseline at measurement time: `git rev-parse HEAD` → `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` (top commit "round-27 verifier spot-check (integrator, hyaku): non-author admit/reject"). No tracked modifications: `git status --porcelain` lists only untracked `.ufo/waves/round-28/`; `git status --porcelain -uall` lists 16 untracked files (claims/wave artifacts; expected for a pre-data wave).
- `git diff --stat` / `git diff --cached --stat` empty → no staged/working modifications.

## C1 (depth) — S106 receipt revision binding

| Item | Command / source (observed) | Value |
|---|---|---|
| Selftest count (BEFORE) | `node scripts/check-s106-evidence.mjs --selftest --json` | cases=5, passed=5, ok=true, exit 0 |
| Case ids (sweep) | CASES array, scripts/check-s106-evidence.mjs:175-213 | clean-fixture-valid, sha-mismatch-invalid, anchor-off-by-one-invalid, missing-bytes-could-not-evaluate, missing-receipt-could-not-evaluate — **no revision-match/mismatch fixture exists** |
| Runtime gate at baseline | `node scripts/check-s106-evidence.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json` | present=true, decoded_bytes=73952, sha_match=true, anchor_located=true (line 187, appearances 1), anchor_unique=true, byte_count_match=true, valid=true, exit 0 |
| Receipt binds revision? | `corpus/evidence/round-26/sources/s106.json` (read) | schema tabi-s106-evidence-v1; fields row/url/fetched_at/transfer/encoded_bytes/encoded_sha256/bytes_path/decoded_bytes/decoded_lines/decoded_sha256/anchor/verification/status — **no revision/measured-revision field** |
| Fetch-failure CNE | evaluate() scripts/check-s106-evidence.mjs:109-118; cases missing-bytes / missing-receipt | absent receipt or bytes throw Refusal → exit 2 (could-not-evaluate), never valid; confirmed by selftest cases |

Observation (C1): claim "before: 5 cases at baseline" reproduces exactly. Runtime gate at baseline is valid at its committed receipt. The receipt carries no measurement-revision identity; verification binds revision only implicitly because both receipt blob and byte blob are read at the same `--rev` (lines 109-114). Selftest has no mismatching/matching revision fixtures — the claimed "red controls" do not exist yet.

Do-nothing control: unchanged selftest = 5 < target 7 → below target; kill rule not triggered (matching committed receipt passes at baseline). Unresolved (after target, not yet observable — no implementation landed, tip==baseline): ≥7 cases with revision-mismatch rejected / matching accepted; target receipt valid at its named revision (observed valid only at baseline rev).

Out-of-scope: missing-source fetch remains could-not-evaluate (preserved), confirmed above.

## C2 (calibration) — m1 supersession precision

| Item | Command / source (observed) | Value |
|---|---|---|
| Mismatch count at baseline tip | `node scripts/check-selfassessment.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json` | mismatches=1, couldNotEvaluate=92, superseded=10, clean=false, exit 1 |
| Same at round-27 rev | `node scripts/check-selfassessment.mjs --rev ef8aa4a3256cc6462a60d850d7ea21277aecd2a1 --json` | identical: mismatches=1, superseded=10, LOG.md:221 superseded=true |
| LOG.md:221 finding | same run, findings[] | doc=LOG.md, line=221, script=scripts/check-freshness.mjs, claimed=8, observed=12, superseded=true (silently cleared) |
| Oracle tally | `node scripts/check-freshness.mjs --self-test \| tail -1` | `FRESHNESS_SELFTEST verdict=clean cases=12` |
| Origin of current nonzero count | same run, counted[] | counted= m3-unlanded-paths only (SCORECARD.md round-27 "landed" vs 8 live unlanded paths) — **not** LOG.md:221 |

Falsification mechanism (read, scripts/check-selfassessment.mjs:316-328): a later paragraph clears an earlier stale mention when it (a) names the same script, (b) matches /supersed|correct/i, (c) matches /:\d+/, (d) states observed tally. Clause (c) accepts **any** colon-number token, not the specific superseded line. Concrete instance: the paragraph beginning LOG.md:265 names `scripts/check-freshness.mjs` (line 272), contains "Corrected" (273), carries timestamp `2026-10-15T05:16:28Z` whose `:16`/`:28` satisfy /:\d+/, and states "12-case" (275) → clears :221 without citing it.

Prior defect evidence (committed): LOG.md:1929-1932 — "the paragraph-level matcher accepts any colon-number token as the cited superseded line" and "marks the real `LOG.md:221` stale selftest mention superseded by a later 183-line paragraph that does not cite line 221"; points to `.ufo/waves/round-27/w1/CritC1Supersession.md` and `.ufo/waves/round-27/w1/ExecC1Attacks.md` (not re-read; cited by LOG.md). Lesson `corpus/lessons/round-27-verifier-spotcheck.md:15` reports the round-27 counter returned `mismatches=0`, `clean=true` while its own LOG.md:221 finding says `claimed 8, observed 12, superseded=true`.

Negative sweep: `grep -n ":221" LOG.md` → only line 1931 (the defect statement itself); no paragraph after :221 cites line 221. No legitimate exact-line correction exists for :221.

Selftest today: `node scripts/check-selfassessment.mjs --selftest --json` → cases=17, passed=17, ok=true, exit 0. Contains green exact-citation control `m1-log-stale-then-corrected` (correction cites `LOG.md:6`; exit 0) and red `m1-log-wrong-number-correction` (right citation, wrong number; exit 1). Case-id sweep (CASES, lines 443-597): **no unrelated-citation red case exists** — the claim's required red unrelated-citation fixture is absent at baseline; the positive exact-citation control is present.

Do-nothing control: reproduces the known false-clear — LOG.md:221 superseded=true at both baseline and ef8aa4a (an unrelated paragraph still clears it) → kill rule phrase "unrelated correction still clears LOG.md:221" holds at baseline.

## Tooling

No installs/updates performed (no pacman — PACMAN PAUSED per RULES.md; no uv/cargo/npm). Only system `node` used. RULES.md read.

## Unresolved (after targets — not yet observable; tip==baseline)

- C1: selftest ≥7 with revision mismatch rejected + matching revision accepted; receipt revision identity present in receipt/evaluation; runtime gate valid at its named revision after change.
- C2: LOG.md:221 appears as a mismatch unless an exact-line correction cites it; selftest red unrelated-citation case (scratch `exec22-unrelated-citation-case.mjs` exists from another seat; unread, not evaluated here).

## Touched surfaces

- Wrote: `.ufo/waves/round-28/w1/Scribe02.md` (this report). Nothing else written; no lane tracked file touched (read-only).
- Read: claims.json; scripts/check-s106-evidence.mjs; scripts/check-selfassessment.mjs; corpus/evidence/round-26/sources/s106.json; LOG.md (199-412, 1888-1948); corpus/lessons/round-27-verifier-spotcheck.md:15-17,46-47; ~/.omp/agent/RULES.md; git status/rev-parse only.

## Observations vs inference vs unknown

- Observed (commands above): counts, exits, findings, receipt fields, HEAD, git status.
- Inference (labeled): the 183-line clearing paragraph identity — my example (LOG.md:265 paragraph) satisfies all four clauses; the exact paragraph the matcher chose is not printed by the tool, so I label the specific culprit as inference. Defect existence itself is observed (superseded=true at :221 + no :221 citation anywhere).
- Unknown: post-implementation values; the m3 live-tree count drifts as the wave writes (observed 8 in counted[] vs 16 untracked files at my later scan — wave-in-progress, not a claim fact).

## Funding evidence paths

- `.ufo/waves/round-28/claims.json` (frozen).
- `.ufo/waves/round-27/w1/CritC1Supersession.md`, `.ufo/waves/round-27/w1/ExecC1Attacks.md` (cited by LOG.md:1937-1938).
- `corpus/lessons/round-27-verifier-spotcheck.md:15-17,46-47`.
