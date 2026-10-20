# NoHarmCritic — round14 w1 (critic, read-only, author-side advisory)

Seat `TabiR14.NoHarmCritic`. Baseline `bebe2efc4565bb068efd905e9ef78011bb6b4efd`; I reviewed the in-flight uncommitted worktree on 2026-10-20. I executed no gates, self-tests, lane counters, `measure.mjs`, checker, or browser. What I did run: read-only `git show`/`git ls-tree` through argv in Python Eval, and sha256 of committed blobs and worktree files. I installed or updated no tools. This is not non-author verification.

Axes: operability (C1), calibration (C2), and the four scalars that must not move: depth, coverage, freshness, adjacency. For each finding below: counterexample, evidence, axes it affects, and the smallest safe correction. The status line says what the latest L1 message or my latest read shows.

## F1 — the "git-blob newline count" wording was wrong for every production row (operability, calibration)
- **Counterexample.** All 16 committed SCORECARD rows take the form `git ls-tree -r --name-only REV | grep BRE [| grep BRE] | wc -l` (`SCORECARD.md:242-377`). That counts filtered tree paths, not blob lines. Two ROUND rows use two grep stages: r02 at :250 and r03 at :258, with BRE `'.txt'`. Only the self-test fixtures use `git grep -h 'RE' REV -- path | wc -l` (`check-round-contract.mjs:673`, `check-user-round-contract.mjs:580`).
- **Oracle I computed** with argv git and per-line regex: ROUND r01..r10 give before 0 and after 1,2,4,1,1,1,1,1,1,1. USER r01..r06 give 0 and 1 each. Every revision resolves (rc 0).
- **Literal vs BRE `.`.** Treating `.` as a literal or as a wildcard gives the same count on every historical row. Only a fixture can show the difference, for example a path `…aXtxt` matched by `'.txt'`.
- **Status: resolved in wording.** L1 rewrote the lesson Gate, SKILL and QUALITY19 to tree-path/content forms (`corpus/lessons/round-14.md:13,41`). RoundCounter's tokenizer accepts any number of grep stages (`check-round-contract.mjs:400-420`).

## F2 — a USER digest placeholder would change USER's production red finding (operability)
- **Counterexample.** USER `checkHistory` runs before `round_count` (`check-user-round-contract.mjs:474` before `:476`). The pstack diff always lists `scripts/check-round-contract.mjs`. `acceptedRoundScript` fails `could_not_evaluate` if any accepted digest is unfilled. While `ROUND_SCRIPT_CURRENT_SHA256 = 'ROUND14_CUTOVER_DIGEST_PENDING'` stands, production USER would report exit 2 `could_not_evaluate` instead of exit 1 `round_count`.
- **Fix.** Fill the constant with the sha256 of RoundCounter's final committed bytes. Re-pin it after any later ROUND edit. The `round_script_cutover` self-test depends on this too.
- **Status: open.** At my last read the placeholder was still present. Dropping 8478cd43 from the accepted set (now done) is a good narrowing: a revert to the round13 shell-executing ROUND bytes now fails USER history.

## F3 — production USER never exercises the new counter (operability, calibration)
- **Counterexample.** `round_count` fires at `:476`, before `runCount` at `:494`. So production USER output says nothing about the six historical USER rows. A broken USER evaluator would still show the same "6/10 red".
- **Fix.** Add a USER self-test that counts the committed `user-20261015-r01..r06` rows at `defaultRoot` (expect 0/1). Otherwise C1 must say USER parser coverage comes from isolated controls only.
- **Status: partly resolved.** MeasureClaims confirmed its probe labels USER `isolated_controls_only` and makes no claim that production exercised the USER parser. I sent the self-test suggestion to UserCounter.

## F4 — the two counters disagree on a missing revision (calibration)
- **What diverges.** The old bash pipeline returned `0` on git failure, because the pipeline's exit status is `wc`'s. ROUND now fails `score_mismatch` when `ls-tree` exits nonzero or `grep` exits above 1 (`:414`, `:432`). UserCounter's draft counted stdout regardless of git status. The lesson now says "a missing Git revision is an explicit failed count" (`round-14.md:13`), which is false for USER unless UserCounter aligns.
- **Reach.** No historical row hits this path; all revisions and `HARD_BASELINE` resolve.
- **Fix.** Align USER to fail closed, or qualify the lesson per gate.
- **Status: open** pending UserCounter.

## F5 — the round14 probe tested the wrong function body (operability)
- **Counterexample.** `measure.mjs:243` required `spawnSync('git',…)` written inside the `runCount` body. ROUND's `runCount` hands off to a `git()` helper, so the probe reported `run_count_not_argv` and C1 measured 0→1 instead of 0→2.
- **Status: resolved.** MeasureClaims removed the per-body argv requirement. The whole-file no-shell scan plus behavioural controls and the count-witness now decide.

## F6 — editing the round13 runner and note broke the receipt bindings and implied an unexecuted repair (calibration, coverage)
- **Counterexample.** The worktree changed `scripts/aria-loopback-round13.mjs:605` (`every` → `some`) and appended to `corpus/knowledge/aria-loopback-round-13.md`.
  - `receipt.sourceSha256 = 1d54c9…` is the HEAD runner. Round13 `measure.mjs:415-416` would report `source_digest` at the new HEAD.
  - `receipt.noteSha256 = a720f5…`, but the appended note hashed `946ac1…`.
  - The SCORECARD:574 capability command would run bytes that never produced the receipt.
  - README and lesson prose claimed the producer was "repaired" while no browser run was allowed.
  - `check-aria-metadata.mjs` checks spec, config and manifest against their current bytes, but never checks the producer's bytes (`:614-645`).
- **Fix.** Revert both edits. Put the correct any-listening semantics only in the new checker and sidecar.
- **Status: mostly resolved.**
  - L1 accepted. The note is back to `a720f5…`, and the lesson (`:45`) and README (`:255`) withdraw the producer claim.
  - At my last read, the runner worktree still hashed `48457fd…`, not `1d54c9…`. ReceiptRepair has been told to restore it.
  - L1 should confirm `scripts/aria-loopback-round13.mjs` is absent from `git status` before committing.

## F7 — a second edit to the lesson would flip USER production (operability)
- **Counterexample.** `corpus/lessons/round-14.md` matches USER's `LEGACY_LESSON` pattern. `lessonDrift` (`:194-202`) flags any M/D/R/T commit to it after `PSTACK_PIN`, and this check runs before `round_count`. A second commit touching the lesson (such as the planned "execution addendum") would turn production USER into `history_rewritten`.
- **Status: resolved by plan.** L1 will add the lesson in exactly one commit after tests. Later records go only to LOG, SCORECARD or evidence.

## F8 — claim scope: what C1 does not certify (adjacency, calibration)
These are bounded; no extra scope is requested.
- `pstack-seat.mjs:34` and `user-seat.mjs:34` still run `bash -c slice.command`.
- The `--witness` and `--count-witness` legacy arms run the pinned old gate bytes, which do invoke bash on scratch fixtures, by design.
- `measure.mjs:946` `noteMapCommand` is a bash-syntax string.
- USER spawns the external `VALIDATOR` (`:337`).
- Git still inherits the host's environment and repo config.

C1 should be stated as "the SCORECARD count path in the two gates' production and self-test runs no longer spawns a shell", not "the lane no longer executes shell". The lesson (`:48`) and SKILL's new section already keep this boundary.

## Source, frontier and routed items
- **S029.** `own-work` is a permitted kind (`SOURCES-CONTRACT-v1.md:24-25`). The quote `"listeningAfter": false` appears in the receipt (twice; the location `perWorker[0]` pins it down). Receipt sha256 is `b458b351…`; it is the same at `837b33a` and HEAD. Tier A is scoped to "exact recorded fields". Registry rows go 28→29 with A+1; under rule 4 this is not expansion.
- **Frontier.** The lesson declares no newly held ground. Round13's planned coverage item (one unheld browser surface) must reappear in round14's SCORECARD Planned section, or be explicitly carried.
- **Stagnation window.** Round14 has no capability and no scalar movement, so it is position 1 of window 3 counted from round13. It must not be reported as a restart.
- **Verifier routed items 1–6.** Each is dispositioned in `round-14.md:45-50`: 1–2 → C2, 3 → registry/LOG precision, 4 → partly C1 with the rest retained, 5–6 → protocol-owned. Nothing disappeared.
- **Trend verdicts.** Expansion must read unchanged, since no new knowledge entry exists. Neither C2 nor the S029 row earns coverage, capability or freshness credit.

## For L1 at verification (I did not run these)
- `git status --short` must not show `scripts/aria-loopback-round13.mjs` or `corpus/knowledge/aria-loopback-round-13.md`.
- `sha256sum scripts/check-round-contract.mjs` must equal `ROUND_SCRIPT_CURRENT_SHA256` in the USER gate.
- `node scripts/check-round-contract.mjs` must show exit 0 with 10 `ROUND` lines matching the F1 oracle.
- `node scripts/check-user-round-contract.mjs` must show exit 1 with `finding=round_count`, "Found 6 user rounds, expected 10".
- Both `--self-test` runs must be green, including the malicious controls with no marker file.
- Both `--count-witness` runs must show old exit 0 / marker created, then new exit 1 / no marker.
- `node .ufo/waves/round-14/measure.mjs REV --claim C1|C2` at the baseline and at the delivered revision.
- The fleet `sources-census.sh validate` command.
