VERDICT: ISSUES

Attacked: the wave-1 landing `6c97851034e9d8f58b135d28ff969f1f28fa2f7d` (M) against baseline `5859243183c4d7ac5429dfdb8a73ce0d9a43d583` (B), for the fleet round-17 report draft in the round-16 structure (`.ufo/waves/round-17/w1/ReconReportR16.md`). Output drafted: `.ufo/waves/round-17/drafts/report.md`. Read-only except that draft and this file. No git/jj write, no tool install, no browser, no sub-dispatch.

## Measured (this seat, counters run read-only; clones only)

- C1 `measure-c1.mjs`: B `c1_anchor_safe 0` of 8 (all entries fail; exit 0). M `c1_anchor_safe 4` of 8 behavior-bearing; `label_only` 4 (`round-contract-count-witness`, `user-contract-witness`, `user-contract-count-witness`, `user-contract-diagnostic-witness`), not credited. Exit 0.
- C2 `measure-c2.mjs`: B `0` (3 failures: note, README row, receipt absent). M `1`, `failures []`, `cited S041…S048`. Exit 0.
- C3 `measure-c3.mjs`: B `0`, `rows []`. M `9` (`ruled` 1, `split-declared` 2, `refused-route` 4, `contested-open` 2). Exit 0.
- Census: `scripts/sources-census.sh validate … tabi` → `tabi ok`, exit 0. Rows 40→53; A31/B4/C5→A43/B4/C6; mined33/queued2/rejected5→mined41/queued6/rejected6.
- Receipt `corpus/evidence/round-17/webmcp-invoke/receipt.json`: verdict pass, 11/11, `caseSetOk`, controls `[0,1,2,3]`, `loopback.externalRequestCount 0`, `producerSha256 = sha256(scripts/webmcp-invoke-round17.mjs @ M) = de62820d…` (match).
- Routed binding receipt `binding-hardened/selftest.json`: `cases=59 reasons=13`, `gateSha256 1f84fb54…`; `check-at-1205d26.json`: `MEASUREMENT_BINDING verdict=clean claims=2 bound=2`.
- Identity chain: `scripts/check-user-round-contract.mjs:35` `ROUND_SCRIPT_CURRENT_SHA256 = 1579a794…` = `sha256(scripts/check-round-contract.mjs @ M)`; baseline `8a573b4e…` (`:32`) archived as `ROUND_SCRIPT_ROUND14_SHA256` (`:36-40`).
- SHONEN.md: `git diff --stat B M -- SHONEN.md` empty; four `[~]` boxes at `SHONEN.md:5,7,9,11`.
- Landed: one commit `6c97851` (author `tabi-shokunin <tabi@shokunin.local>`, 12:31:11 -03); `git rev-list --count B..M` = 1. `LOG.md`, `SCORECARD.md`, `SKILL.md`, `PROVINCE.md`, `corpus/QUALITY.md`, `corpus/lessons/round-17.md`, `corpus/evidence/round-17/measurements.json` and `measurement-binding.json` are absent from the M diff (name-only excluding `.ufo/waves`).

## Findings (what breaks or is unproven)

1. **Draft cannot ship as-is: the landed state is wave-1 only.** Seven L1-owned artifacts are absent at M (list above). The round-16 structure requires LOG-linked commit rows, binding receipts and the lesson. The draft carries `<<B>>`/`<<C>>` placeholders for them. Repair: L1 lands integration, then fills the placeholders from the new hashes.

2. **Ownership deviation on the identity constant.** `PLAN.md:83-85` says the `ROUND_SCRIPT_*` pair is updated at L1 integration and "Executors do NOT edit those constants". M already carries `CURRENT = 1579a794…`, equal to the M gate's sha, and archives `8a573b4e…`. The pin is self-consistent at M, so no gate breaks, but the ownership rule was broken. Repair: L1 confirms the M value is the intended final pin; any later change to `check-round-contract.mjs` requires re-pinning.

3. **C3 `ruled` row venue is self-authored.** `corpus/adjacency.tsv` row 1 (`cdp-runtime-observation`, kaidoku) has `ruling_ref tabi-shokunin@5859243…:corpus/lessons/round-16-verifier-spotcheck.md:142`; `measure-c3.mjs` reports `ruling_authority: "self"`. `PLAN.md:145-146` admits `ruled` only with a fleet venue or a non-tabi-authored spot-check line naming the sibling. Repair: re-point the ruling to a fleet `ruled` line (L0) or a non-tabi-authored spot-check, or downgrade to `split-declared`; the count then falls from 1 to 0 for that row. The C3 count must not be presented as a clean `ruled` without this disclosure.

4. **`RevKaidokuRuling` verdict is ISSUES (P1–P3), unaddressed at M.**
   - P1 (blocks a correct row): the AdjKaidoku scout pin recipe `git rev-parse master` returns rc 128 for kaidoku; the pinned tip must come from `refs/heads/main` or `9011581d…`.
   - P2 (coverage): the ruling names only kaidoku `PROVINCE.md:53`; the second live row `:128` (`observe-web-session`, `observe-javascript-runtime`, `reconcile-javascript-runtime`) is unrecorded. Repair: add a second `ruled` row at `:128` and name both loci in the SKILL append.
   - P3 (wording): `:142` "It cites tabi for browser-side mechanics" is false at the pin; the operative clause is `:152`. Repair: use `:152` as `ruling_quote`.

5. **Musketeer lease rows are `contested-open` against an unanswered L0 question.** Two rows (`kagi`, `kake`) point at fleet `ebeb396` `.ufo/l0-questions.md:62` (`tabi | round-17 |`). Verified: that line exists at `ebeb396`. The disposition is only as strong as that question; it is not a ruling. Draft states this.

6. **Receipt filename deviates from PLAN.** Failing first run is `corpus/evidence/round-17/webmcp-invoke/preflight-smoke-failed.json` (`verdict fail`, 2 of 11 failed); `PLAN.md:127` names it `receipt-first-run-failed.json`. History is kept (good), but the name departs from the plan. Repair: rename (history-preserving) or record the deviation in the lesson.

7. **Stale-lane timestamp conflicts.** `.ufo/waves/round-17/w1/record.json:5` `createdAt 2026-10-20T15:43:21.735Z` (12:43:21 -03) postdates the lane commit `6c97851` (12:31:11 -03). The draft marks the launch as `[INFERENCE]` and asks L1 to confirm.

8. **Seat tally not computable with the r16 command.** `.ufo/waves/round-17/w1/dispatch-result.json` has no `.details.progress`; `jq` returns `null`. Wave 1 spawned 86 seats on attempt 2 after 86 refused on attempt 1 (`w1/dispatch-attempts.json`). Role counts are left as `<<seat tally>>`. Repair: derive roles from the spawned list or assignments and paste the command.

9. **Routed defect 4 verified; routed defect 5 partly open.** Defect 4: `corpus/README.md:334-345` index row present (verified). Defect 5: row present but see findings 3–4. Defect 1–3: evidence dirs present (`routed/liar/receipt.json` verdict pass; `binding-hardened/` present). Not re-run by this seat.

10. **Tool installs: none observed.** Grep of `.ufo/waves/round-17/w1/*.md` for install verbs finds only a cited environment tool (`AdjRevenger.md:100`, `npx -y rea-agents@6.5.0`) and a "no action taken" line (`DraftLesson.md:48`). Wave-2 seat installs unknown to this seat.

11. **Not run by this seat (left as placeholders, not claimed):** the delivered-tip binding receipt (`--reproduce`), the no-harm rows 1–9, `check-round-contract`, `check-user-round-contract`, `check-freshness`, `check-sources`, `jj-lane.sh state`, misroot sweep, dead-seat audit, wave-2 tally. L1 runs them once after integration.

## Concrete repairs (ordered)

1. L1 lands integration (`<<B>>`), then `<<C>>` binding; fill draft placeholders from those hashes.
2. Re-point or downgrade C3 row 1; add `:128` row; apply P1/P3 fixes to the kaidoku scout recipe and wording.
3. Confirm or revert the M identity-constant re-pin with a note in the lesson.
4. Rename or document the receipt filename deviation.
5. Confirm stale-lane launch timestamp.

## Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/drafts/report.md` (fleet report draft)
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/w2/DraftReport.md` (this file)
