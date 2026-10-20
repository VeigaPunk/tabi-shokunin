# ReviewProtectedPaths — tabi round 14 w1 (read-only)

Seat: TabiR14.ReviewProtectedPaths (reviewer). Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin.
Method: read-only `git` object queries, `sha256sum`, `cmp`, `grep`, file reads. No gate, self-test, build, test, lint or smoke was executed. No tools installed. The only write is this file, plus one coordination message to TabiR14.UserCounter (duplicate-declaration defect, see F5).

## 0. Snapshot (moving; peers are mid-edit)
- HEAD `bebe2ef`. Pins: HARD_BASELINE `7f506aff…`, PSTACK_PIN `92d700d6…`.
- Worktree modified at read time: `LOG.md`, `SKILL.md`, `corpus/QUALITY.md`, `corpus/README.md`, `corpus/SOURCES.md`, `scripts/check-round-contract.mjs` (worktree sha256 `f98c2999…`, not final), `scripts/check-user-round-contract.mjs` (in progress). Untracked: `corpus/lessons/round-14.md`, `.ufo/waves/round-14/`.
- Committed ROUND gate blob `43db9f4b…` (sha256 `8478cd43…`). Committed USER gate blob `7df3ee9f…` (sha256 `69066121…`).
- Census file sha256 `b9c8dc35…` matches the ROUND gate's production `CENSUS_SHA256` (check-round-contract.mjs:30).

## 1. What is frozen today (enforcement map)

| Set | Definition | Enforced by | Scope |
|---|---|---|---|
| A. Baseline-protected | ROUND `protectedPath` check-round-contract.mjs:87 (`LEGACY_LESSON` = `^corpus/lessons/round-\d+\.md$`, fleet-round-1 freshness/rounds/reports/plans/continuation prefixes, `scripts/check-freshness.mjs`, `SHONEN.md`); USER `protectedPath` (mirror) | ROUND checkHistory :223 (blob at baseline == blob at HEAD); USER pstackDrift | fleet-round-1 files, `corpus/lessons/round-1..10.md`, `scripts/check-freshness.mjs`, `SHONEN.md` (SHONEN via canonical form only) |
| B. Census | `corpus/evidence/pstack-20261015/baseline-census.tsv` (57 lines, 56 entries), pinned by `CENSUS_SHA256` (check-round-contract.mjs:30) | ROUND censusEntries | row blobs must equal baseline blobs; includes `PROVINCE.md` (row 23), `SHONEN.md` (row 25), `check-freshness.mjs` (row 57), `corpus/lessons/round-1..10.md` (rows 47-56) |
| C. Append-only prefix | `APPEND_ONLY` = LOG.md, SCORECARD.md, SKILL.md, PROVINCE.md, corpus/QUALITY.md, corpus/README.md (ROUND :25; USER same list) | prefix bytes at HARD_BASELINE must equal HEAD | verified now with `cmp -n` against `7f506aff` bytes: LOG 27002, SCORECARD 27469, SKILL 125194, PROVINCE 1020, QUALITY 329, README 12085 — all prefixes intact on worktree |
| D. PSTACK drift | USER `PSTACK_PATHS` (check-user-round-contract.mjs:60): `corpus/evidence/pstack-20261015`, `corpus/lessons`, `reports`, ROUND script, pstack-seat/aggregate, check-freshness, SHONEN. Diff `PSTACK_PIN..HEAD` | USER pstackDrift :214 | ROUND script digest must be in accepted set (F1/F2); SHONEN canonical; `round-N.md` via lessonDrift :194 (admitted only as a single add with no later M/D/R/T commit in pin..HEAD); pstack-20261015 r-series; `protectedPath` |
| E. Not covered by any gate | — | — | `scripts/check-user-round-contract.mjs` (no pin anywhere); `scripts/aria-loopback-round13.mjs`; `corpus/evidence/round-13/**`; `corpus/lessons/round-13-verifier-spotcheck.md`; `.ufo/waves/round-12|13/**`; `corpus/evidence/round-12/**`; `corpus/knowledge/**` |

Grep check: no gate string references `aria`, `round-13/`, `round-14`, or `check-aria-metadata`. The only `round-1.md` → `round-13.md` string is a USER selftest fixture `mv` (check-user-round-contract.mjs:695), not production policy.

## 2. Intended editable paths (round 14 w1) and gate impact

| Path | Seat | Gate impact |
|---|---|---|
| `scripts/check-round-contract.mjs` | RoundCounter (C1) | Digest pinned by USER (F1/F2). ROUND `LEGACY_GATE_BLOB = b2eb8316…` (:38) and `CENSUS_SHA256` (:30) must NOT change. Old-gate witness arm = any rev whose blob is b2eb8316 (92d700d). |
| `scripts/check-user-round-contract.mjs` | UserCounter (C1) | No pin (F3). Only ROUND digest constants :26-:33 may change. `LEGACY_USER_GATE_BLOB = 18e2c79a…` (:42) stays; witness rev dabd2b9 carries that blob. |
| `scripts/check-aria-metadata.mjs` (new) | ReceiptRepair (C2) | Not in any gate set. A new file cannot enter census (census rows require blob-at-baseline == recorded). No registry entry is possible or needed. |
| `corpus/evidence/round-14/aria-metadata/**` (new) | ReceiptRepair (C2) | Not gated. Must never be written under `corpus/evidence/round-13/**`. |
| `.ufo/waves/round-14/measure.mjs` | MeasureClaims | Not gated. |
| `corpus/lessons/round-14.md` (untracked, 7547 B, cites S029 ×4) | L1/MistakeRouting | Matches `LEGACY_LESSON`. Admitted by lessonDrift only as a single add with no later M/D/R/T commit in `92d700d..HEAD` (F7). Precedent: round-12.md (0d82098) and round-13.md (837b33a) are admitted this way. |
| `LOG.md`, `SCORECARD.md`, `SKILL.md`, `corpus/QUALITY.md`, `corpus/README.md` | L1 | Append-only (F9). `PROVINCE.md` is append-only AND census row 23: do not touch. |
| `corpus/SOURCES.md` | SourceCensus / RoundSourceOpen | Not gated by ROUND/USER. `scripts/check-sources.mjs` validates used-by paths (inspectUsedBy, row_id_absent) (F8). |

## 3. Findings (severity order)

**F1 — High. The USER gate hard-pins ROUND checker bytes; the ROUND cutover must land in one commit with the USER constant.**
- USER :26-:33: `ROUND_SCRIPT_PRIOR_SHA256 = 7d403cee…` (= PSTACK_PIN blob b2eb8316, verified), `ROUND_SCRIPT_CUTOVER_SHA256 = 8478cd43…` (= HEAD blob 43db9f4b), `ROUND_SCRIPT_CURRENT_SHA256 = 'ROUND14_CUTOVER_DIGEST_PENDING'` (:28), and `ROUND_SCRIPT_ACCEPTED_SHA256` (:29).
- USER :187 `acceptedRoundScript`: any non-hex entry fails `could_not_evaluate` exit 2 (fail-closed; correct). It then checks `sha256(show(HEAD, ROUND_SCRIPT))` ∈ accepted. It reads HEAD only, so worktree edits are invisible until committed.
- Consequence: after RoundCounter's final commit, the digest of the committed bytes must be written to :28 in the same commit. A ROUND commit without that update is `history_rewritten: Pstack bytes changed: scripts/check-round-contract.mjs`. An unfilled placeholder is exit 2.
- Sequencing: RoundCounter finishes first, then compute `git show HEAD:scripts/check-round-contract.mjs | sha256sum`, then UserCounter pins it. No later edit to the ROUND file without re-pinning.
- Current worktree digest `f98c2999…` is not final (RoundCounter still mid-edit); do not pin it.

**F2 — High (C1 honesty). A superseded bash-runCount digest stays accepted.**
- `8478cd43…` is the round-13 bytes, which still execute `bash -c` via runCount. Once `ROUND_SCRIPT_CURRENT` lands, USER accepts `[PRIOR, CUTOVER, CURRENT]`, so reverting the ROUND gate to 8478cd passes history while silently restoring shell execution. That is the exact defect C1 removes.
- Minimum fix: `ROUND_SCRIPT_ACCEPTED_SHA256 = [PRIOR, CURRENT]`. Record 8478cd as an archived identity in the LOG/report only, not as a live accepted value. This matches "clean cutover, no shims" and "never blanket exemption."
- Residual, pre-existing and to be stated: PRIOR (`7d403cee`, pre-round-13 bytes) remains accepted by design. Its bytes are asserted via the pinned-blob check at :191-:197.

**F3 — High (self-blessing). The USER gate file is unpinned, so its ROUND digest table is self-declared.**
- `scripts/check-user-round-contract.mjs` is not in census, `PSTACK_PATHS`, `protectedPath`, or any ROUND reference. UserCounter can edit the accepted-digest constants and nothing history-level objects.
- No in-gate self-pin is possible (it would be a cycle). Minimum registry addition: one new, append-only evidence record, e.g. `corpus/evidence/round-14/checker-cutover.json`, holding sha256 + git blob of both gate files at the cutover commit and the witness output. L1 verifies it. Residual risk must be stated in the report.

**F4 — Medium. USER selftests do not exercise the digest chain.**
- `ROUND_SCRIPT_*` constants are referenced only at :176-:200 (production path); `selfTest()` (:765+) has no case for a changed ROUND script, a wrong digest, or the placeholder.
- Needed for C1 "does not bless arbitrary edits" (UserFixtures item): (a) ROUND bytes changed with no constant update → `history_rewritten`; (b) placeholder present → `could_not_evaluate` exit 2; (c) after F2, CUTOVER digest → `history_rewritten`. These are L1 verification items, not authored here.

**F5 — Medium (live defect in worktree, reported to UserCounter).**
- Working `check-user-round-contract.mjs` has duplicate top-level declarations: `parseScore` at :344 and :379, `runCount` at :360 and :395. Module-level duplicates are a parse error; the USER gate cannot load until one copy is removed. Current file is 888 lines.

**F6 — Medium. Round-13 aria artifacts are historical by convention only; no gate enforces them.**
- Identities, labelled by type. Git blob IDs (`git rev-parse HEAD:<path>`, identical at `837b33a` and HEAD): `corpus/evidence/round-13/aria/receipt.json` = `eea79f8a…`; `runtime-pin.json` = `41f35e54…`; `manifest.json` = `3fedcbe8…`; `scripts/aria-loopback-round13.mjs` = `5e6b65e8…`; `corpus/lessons/round-13.md` = `da37decb…` (gated by lessonDrift). Content SHA-256 of the committed bytes (`git show HEAD:<path> | sha256sum`): receipt `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7`; pin `4d8947564ee911a18ff2b931b8628910edada4781024fa40008d87e3cd16ccd2`; old runner `1d54c9e98a85022c4382d0a0eeb16e15f0256b7f561329258e7ca77152e4af9c`. The first two were also recomputed from the unmodified worktree files; manifest SHA-256 was not computed. Derive must bind the SHA-256 values, not blob IDs.
- Runner change (authorized, not an inherited edit): L1 extended ReceiptRepair's write scope to fix only the producer aggregation at `scripts/aria-loopback-round13.mjs:605`. The diff is one hunk, +4/−1 (worktree SHA-256 `48457fd2463e93bff69eb20952dc9bf9659cfd6886cdb8527f7055fc01c2eb5b`). The changed predicate is `listeningAfter: serverProofs.some(proof => proof.listeningAfter === true)`, documented as a raw post-close observation. `serverOk` remains the admission predicate. Do not revert.
  - (a) Historical round-13 evidence is immutable. `corpus/evidence/round-13/**` shows no worktree change, and the historical identities above still govern: runner committed bytes SHA-256 `1d54c9e9…`, receipt `b458b351…`, pin `4d894756…`.
  - (b) The producer edit is a legitimate source fix for future generated evidence. It is not a rewrite of the historical receipt.
  - The derive CLI must bind the historical runner by its original committed bytes (`1d54c9e9…`), never by equality with the current producer. The current producer's SHA-256 (`48457fd2…`) is expected to differ and must not be treated as a mismatch.
- ReceiptRepair's `--derive` should refuse any OLD_RECEIPT, OLD_PIN or OLD_RUNNER whose SHA-256 differs from the pinned values in F6 (`b458b351…`, `4d894756…`, `1d54c9e9…`), and must write only under `corpus/evidence/round-14/aria-metadata/`. QUALITY 13/14 is the only other constraint.

**F7 — Medium. Lesson name and S029 coupling.**
- S029 in the worktree `corpus/SOURCES.md` has used-by `corpus/lessons/round-14.md`; check-sources requires that file to exist and cite S029. Today it exists (untracked) and cites S029 four times.
- Commit the lesson exactly once with final bytes. Any later M/D/R/T commit trips USER lessonDrift.
- Alternative: rename to a non-matching name (e.g. `corpus/lessons/round-14-aria-metadata.md`), which takes it out of the gate entirely, then update S029 used-by in the same commit. Either choice must keep the two in sync.

**F8 — Low. Minimum registry updates.**
- `corpus/SOURCES.md`: add S029 row (in worktree) and the round-14 Log line (in worktree). Do not edit S023/S024 cells; record the reopen in the Log only. No gate enforces immutable cells, so this is convention; keep it.
- `SCORECARD.md`: append-only. New round-14 blocks must use a distinct header id. Do not reuse `<!-- pstack-round:` r01-r10 or `<!-- user-round:` r01-r06 ids; `parseScore` takes the first match.
- `baseline-census.tsv` and `CENSUS_SHA256`: no change. `PSTACK_PATHS` and `protectedPath`: no change.
- `.ufo/waves/round-14/w1/swarm-registry.json`: already has 32 members including ReviewProtectedPaths. No change required by this seat.

**F9 — Info. Append-only and SCORECARD grammar.**
- All six append-only prefixes are intact. Peer edits are appends: SKILL.md (+36), QUALITY.md (+11, criteria 18-19), README.md (+18), LOG.md. SCORECARD.md is unmodified.
- SCORECARD holds 16 committed `command:` rows: pstack r01-r10 and user r01-r06. All match `git ls-tree -r --name-only <40hex> | grep … | wc -l`, with single-quoted patterns in some rows. Historical rows cannot be rewritten; both C1 parsers must accept these 16 verbatim, failing closed on anything else.

**F10 — Info. Pre-existing red, not caused by this wave.**
- HEAD has user lessons r01-r06 only, and the USER production check expects ten rounds. Do not "fix" this by editing SCORECARD or lessons. Report it as-is.

## 4. Commands for L1 (not executed here)
After all seats land and commit, in this order:
1. `git status --short` (expect only the round-14 paths).
2. `git show HEAD:scripts/check-round-contract.mjs | sha256sum` → write it into `scripts/check-user-round-contract.mjs` at `ROUND_SCRIPT_CURRENT_SHA256`; remove 8478cd from the accepted list (F2); commit both files together.
3. `node scripts/check-round-contract.mjs --self-test`
4. `node scripts/check-round-contract.mjs --witness 92d700d` (blob b2eb8316)
5. `node scripts/check-round-contract.mjs` (production; expect clean)
6. `node scripts/check-user-round-contract.mjs --self-test`
7. `node scripts/check-user-round-contract.mjs --witness dabd2b9` (blob 18e2c79a); confirm the witness prints the measured revision/code digest
8. `node scripts/check-user-round-contract.mjs` (production; expect the pre-existing user-count red, report verbatim)
9. `node scripts/check-aria-metadata.mjs --self-test`
10. `sha256sum corpus/evidence/pstack-20261015/baseline-census.tsv` (must be `b9c8dc35…`); `git diff --name-status 7f506aff HEAD -- LOG.md SCORECARD.md SKILL.md PROVINCE.md corpus/QUALITY.md corpus/README.md` (must be additions only)
11. Run `scripts/check-sources.mjs` with the flag its header documents, after the S029 used-by target exists.

## 5. Residual risk
- The USER gate remains unauthenticated (F3). The round-14 cutover is proven only by the witness and a committed evidence record, not by the gates themselves.
- PRIOR (`7d403cee`) stays accepted by design (F2).
- Round-13 aria artifacts are protected by convention only (F6).
