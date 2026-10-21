# ReviewPromotion — tabi round 20, wave 1

Seat: `TabiR20.ReviewPromotion` (lane-dispatched leaf reviewer).
Status: **author-side advisory**. This file is not a non-author verification, not a discernment spot-check, not a SHONEN attestation, and not a promotion act (PROTOCOL.md:63-68; LEARNING.md:42-46).

Scope: SHONEN rule, external spot-check rule, author-side versus non-author status, and unsupported `[x]`. Read-only except this file.
Lane head `c49929430d996b016dde2e3a3a5be380f3433fdb` equals the design baseline (design.json:3). Tracked files are clean (`git status -uno` empty). Untracked: the round-20 wave outputs and `corpus/evidence/round-20/sources/html_form_element.cc`.
Tooling: none installed or updated. No gates, self-tests, counters or builds were run.

## Bottom line

1. **No unsupported `[x]` in the round-20 surface.** SHONEN.md has zero checked boxes: four `[~]`, blob `9dcb2687d3083f696b57032389eed7349e03893e`, identical to HEAD. No file under `.ufo/waves/round-20/` (clones excluded) or `corpus/evidence/round-20/` has an anchored `- [x]` line.
2. **Historical `[x]` exists, and it is not evidence.** An anchored scan of the whole tracked tree at HEAD finds `- [x]` lines only in 16 historical reports (64 lines). Those lines name no verifier and carry no pointer, so PROTOCOL.md:66-68 counts them as `[~]`. They are retained by policy and must not be cited or copied.
3. **No true non-author verification of round 20 exists.** Every seat in this wave is lane-dispatched (`TabiR20.*`), including this one and `ScoutOutsideReview`. Round 19's outside admit/reject closure is absent from HEAD and from every ref.
4. **SHONEN promotion is not supported by any artifact in the lane.** The correct state is four `[~]`, no `[x]`, no promotion.

## Rules applied

Substrate rules are read-only at `/home/vgpnk/Projects/kimi-shokunin/skills/shokunin/protocol/`.

| Rule | Text (short) | Source |
|---|---|---|
| shonen→shokunin gate | Each SHONEN box is checked by a reviewer who did not author the round's changes. "A subagent the lane dispatched is still the lane." `[x] <verifier>` needs a named non-author id and a pointer. Any `[x]` without one counts as `[~]` for the gate. | PROTOCOL.md:63-68 |
| Report SHONEN heading | One line per box. `[~]` means asserted-by-author. A missing assessment is disqualified as promotion evidence. | PROTOCOL.md:165-170 |
| Independent verification | "Driver completion is not admission; independent non-author verification remains required." | PROTOCOL.md:174 |
| SHONEN file contract | Marks are confined to the box character plus one evidence line per box. "No other prose." | PROTOCOL.md:446, 464-465 |
| External spot-check, per round | A non-author (fresh reviewer or operator) samples at least one admit and one reject, and records agree/disagree with a reason in the round's lesson. | LEARNING.md:40-46 |
| Exploratory claims | Verify only as `unprovable-but-better` with a named non-author reviewer on record. A dispatched subagent does not count. Maximum one per round. | AXES.md:43-51; LEARNING.md:48-50 |
| Counted claims | Need a counting command and before→after. No non-author required for the count. | AXES.md:27-38 |
| Lane author-side rule | Same-lane seats are author-side. L2 reviews are not outside SHONEN/LEARNING attestations. | SKILL.md:1534-1535, 1650-1651, 1790 |

## Status ledger: author-side versus non-author

| Item | Status | Evidence |
|---|---|---|
| SHONEN.md, four boxes | `[~]` author-side assertions. Box and header text match the canonical seed. Pointers resolve to tracked files: SKILL.md (`:697` "## Approval table", `:1598` kaika errata heading), PROVINCE.md, corpus/knowledge/multi-step-journey.md, corpus/knowledge/executor-test-sufficiency.md, corpus/evidence/user-20261015-r02/boundary/refusal-receipt.txt. | SHONEN.md:1-12; PROTOCOL.md:455-462; `git cat-file -e HEAD:<path>` for each; SKILL.md:697, 1598 |
| SHONEN.md history pin | Census blob `5e055b8c…` differs from HEAD `9dcb2687…`. The gate checks SHONEN by policy, not by blob equality. | LOG.md:519-525; check-round-contract.mjs:242-249, 312 |
| SHONEN box 3 executor | Lane-dispatched, by the lane's own disclosure. | SHONEN.md:10 |
| Historical `[x]` (TABI-B4, TABI-R3-4) | Withdrawn. Lane-dispatched, so not non-author. | LOG.md:519-525; corpus/lessons/kaika-fleet-round-1.md:102-104 |
| Round 1 outside check | Orchestrator-dispatched W3ReviewTabi. Two in-repo rows: one admit, one reject. The "6/6" count sits in out-of-repo `kaika-w3/tabi-review.md`. | corpus/lessons/round-1-verifier-spotcheck.md:3-13; kaika-fleet-round-1.md:88 |
| Rounds 12–18 closures | Each header names a closure integrator outside the lane. **None wrote `[x]`**, and rounds 15–16 state the four boxes are not all non-author-checkable because no cold execution was done. | round-12-verifier-spotcheck.md:1-5, 225-227; round-13-verifier-spotcheck.md:167; round-14-verifier-spotcheck.md:192; round-15-verifier-spotcheck.md:1, 126; round-16-verifier-spotcheck.md:1, 159; round-17-verifier-spotcheck.md:167; round-18-verifier-spotcheck.md:1, 20-21 |
| Round 19 discernment | Author-side verdict "improved, bounded". Outside admit/reject closure **pending**. No `round-19-verifier-spotcheck.md` at HEAD or in any ref. | round-19.md:162, 198-202, 209-213; `git log --all -- corpus/lessons/round-19-verifier-spotcheck.md` empty |
| Round 20 TabiR20 wave, including ScoutOutsideReview and this seat | **Author-side.** The name "ScoutOutsideReview" does not change its status. | spec.json:272-279; record.json:333-335; LEARNING.md:45-46 |
| Round 20 C1 (depth 0→12) | Counted move. The count needs no non-author. Any discernment or SHONEN implication needs an outside closure. | design.json:4-13; AXES.md:27-38 |
| S096 pin (`html_form_element.cc`) | Lane pin matches lane bytes: sha256 `8c8d6796…6916`, 68,278 B, matching design.json:19 and corpus/SOURCES.md:110. This is self-consistency, not an outside re-fetch. | `sha256sum`; SOURCES.md:110 |

## Findings, by severity

**F1 — HIGH — Round 19's outside admit/reject closure is owed and absent.**
- Evidence: `git ls-files corpus/lessons | grep verifier-spotcheck` ends at round-18. `git log --all` is empty for a round-19 closure file. round-19.md:162 says "No counter, self-test, report, or lane-dispatched review substitutes for the fresh non-author closure." round-19.md:200-202 says "current outside admit/reject closure is pending". round-19.md:211-213 says "No current non-author admission is claimed."
- Effect: round 19's "discernment improved, bounded" is an author-side verdict. The lesson labels it so. Round 20 must not cite it as external.
- Owner: orchestrator or operator. No lane seat can close it. ScoutOutsideReview can only report that it is absent.

**F2 — MEDIUM — The gate guards `[x]` in SHONEN.md only. SKILL.md overstates the guard.**
- `checkShonenPolicy` refuses `[x]`: check-round-contract.mjs:225.
- The spot-check parser accepts any reviewer token: `/^- spot-check: non-author (\S+) (agree|disagree) — (.+)$/` at :353-356. It is keyed to pstack lessons only (`roundIds`, :339-344). A lane seat id passes.
- The report box check accepts `- [x]` without verifier naming: :580-583, `/^- \[[x~ ]\] /`. By reading, a `[x]` report line satisfies it. The user-gate twin was not read. Nothing was executed.
- SKILL.md:1671-1673 says "New `[x]` marks are refused here". That holds for SHONEN.md only. A reader would take it to cover reports and lessons.
- Effect: a latent gap. No current instance exists in SHONEN.md or in round-20 artifacts. The M-2 recurrence (kaika-fleet-round-1.md:102-104) remains open.
- Recommended: an append-only SKILL.md errata correcting the scope, plus an L1 gate change with self-test cases. The change would refuse `[x]` without an allowlisted verifier id and refuse spot-check ids that equal round seats. Do not edit reports or SHONEN.md.

**F3 — MEDIUM — 64 historical `- [x]` lines in 16 tracked reports.**
- Files: reports/pstack-20261015-r01…r10.md and reports/user-20261015-r01…r06.md, each at lines 9–12.
- Full-tree scan: `git grep -c -E '^\s*- \[x\]' HEAD` lists 16 files and 64 lines, all in the files above. Path-restricted `git grep -h -E '^- \[x\]' HEAD -- reports corpus/lessons SHONEN.md LOG.md SKILL.md corpus/README.md corpus/QUALITY.md | wc -l` also gives 64.
- Non-anchored `[x]` tokens appear in 66 tracked files, mostly prose or fixture text. Use the anchored form for any "no `[x]`" claim.
- Effect: none on SHONEN.md. These lines must not be copied into round-20 reports. They are retained by policy (LOG.md:519-525).

**F4 — LOW — Labeling risk for round-20 "outside" wording.**
- ScoutOutsideReview (spec.json:276-279) sounds like an outside review. Its agentId is `TabiR20.ScoutOutsideReview` (record.json:333-335), so it is lane-dispatched.
- Its output must not be filed as `- spot-check: non-author …` or described as outside review (LEARNING.md:45-46).

**F5 — MEDIUM — The S096 source is untracked. Pointers to it cannot pass the evidence rules yet.**
- `git status --porcelain=v1 -uall` shows `?? corpus/evidence/round-20/sources/html_form_element.cc`.
- QUALITY criterion 28 requires committed bytes. The `[~]` pointer rule requires a committed regular blob (check-round-contract.mjs:193-200, 227-231).
- Action: commit the source with lane identity in the round-20 integration commit before any pointer cites it.

**F6 — LOW — SHONEN.md evidence lines carry prose and a literal `[x]` token.**
- SHONEN.md:6 reads "prior `[x]` named lane-dispatched TABI-B4/TABI-R3-4 — not non-author". Lines 8, 10 and 12 also carry parenthetical prose. PROTOCOL.md:446 says "no other prose". The gate accepts it: one committed backticked path per `[~]` box, :227-231.
- A naive `grep '\[x\]' SHONEN.md` returns one hit with zero checked boxes.
- The file is byte-pinned history. Leave it for the L0 regeneration question (LOG.md:522-525). Do not edit.

**F7 — MEDIUM (adjacent, routed to scribe/L1) — LC11 span is outside every declared S096 anchor.**
- design.json `decisions` LC11 has `span: [787, 815]`. The declared S096 anchor is `html_form_element.cc:174-328,729-758,818-842` (SOURCES.md:110).
- Containment check: 0 (not inside). This corroborates ScribeGate.md:34.
- Not a SHONEN issue. It must be fixed before any round-20 note cites S096 for LC11.

## Route to L1 (no edits made here)

1. Keep SHONEN.md at four `[~]`. No `[x]` and no promotion this round.
2. Label round-20 discernment "pending external closure" in the lesson. Do not claim "improved" for round 20.
3. Any future `[x]` needs all of the following: a closure seat outside the lane, a committed file with admit and reject rows (precedent: round-18-verifier-spotcheck.md:117-125), a cold execution of box 3's instructions by that closure seat (rounds 15–16 declined to certify box 3 without one), a named verifier on the box, and an L0-approved gate change first. The gate fails closed on `[x]` today (:225).
4. Commit the S096 source before citing it (F5).
5. Route F2 and F7 to L1/operator as append-only items.

## Residual risk and verification gaps

- Gates, self-tests and counters were not executed. The gate statements above come from reading code (check-round-contract.mjs:176-240, 242-249, 312, 339-356, 572-585). They are not observed runtime results.
- The round-1 "6/6 spot-checks agree" count (kaika-fleet-round-1.md:88) rests on an out-of-repo file. Not re-verified.
- Not checked: whether any seat outside the lane roster produced a tabi round-20 outside review. No tabi artifact names one. Matches for `CloseTabi` appear only in round-12 and round-13 closure headers.
- Round-19 and round-20 closures could exist in the fleet root outside this lane tree. This lane cannot see them.
- The content of `html_form_element.cc` and the LC claims were not reviewed; other seats own them. Only identity, untracked status and anchor arithmetic were checked.
- Pointer paths in SHONEN.md resolve. I did not verify that the cited sections support each box's claim (out of scope).

Exercised commands (read-only): `git rev-parse HEAD`; `git status --porcelain=v1 -uall`; `git rev-parse HEAD:SHONEN.md` and `git hash-object SHONEN.md`; `git grep -c/-l/-h -E '^\s*- \[x\]' HEAD` and `git grep -l -F '[x]' HEAD`; `git ls-files`; `git cat-file -e HEAD:<path>`; `git log --all`; `git branch --list`; `git diff --stat HEAD`; `sha256sum` on the S096 file; an awk containment check; and `grep -n` over lane docs, scripts and wave outputs.

Report: .ufo/waves/round-20/w1/ReviewPromotion.md
