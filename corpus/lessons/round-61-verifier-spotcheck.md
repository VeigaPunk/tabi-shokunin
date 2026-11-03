# round 61 — verifier spot-check (non-author closure)

author: hyaku closure (non-author integrator, @m_zfl)

Subject: tabi round 61 (attempt 1). Report `.ufo/reports/round-61/tabi.md` (6 sections; `SHONEN` at line 131; fleet commit `b208632a`, author `tabi-shokunin`). Dispatched prompt `.ufo/prompts/tabi-round-61.md` (703 lines, 62,583 B; sections 1–7). Lane HEAD before `6c5c2a2e`, after `544a40ac8328ee355b7c41bd67da856f058726e2` (pushed; `git ls-remote origin refs/heads/master` = `544a40ac`). Driver digest (`.ufo/watchdog.log`, mutable; copied at closure, lines 2121 and 2134):

- `2026-11-03T19:50:29-03:00 launch tabi round=61 pgid=232068 driver=hyaku-inline attempt=1`
- `2026-11-03T20:30:05-03:00 complete tabi round=61; hyaku-inline attempt=1`

Closure date: 2026-11-03. All re-measurements below were run by this closure over committed bytes; gate and counter verdicts were read from committed evidence and were not re-executed.

## 1. Conformance (protocol step 1)

- Report attribution: `git log --format='%an %H' -- .ufo/reports/round-61/tabi.md` → `tabi-shokunin b208632a89ff7755c6c0fd8b3c1ac3f7aafd134c`. Lane identity; not swept.
- Real report, not a marker: work performed, landed changes with hashes, before→after commands, Sources & frontier, three trend verdicts, SHONEN assessment.
- `SHONEN` heading present (report line 131) with one line per box: 4 lines, all `[~]` with pointers; none `[x]`. `SHONEN.md` carries 4 boxes (grep `^ *- \[` = 4), so the line count matches.
- Cited lane commits, each `git -C tabi-shokunin merge-base --is-ancestor <hash> refs/heads/master`: `7032914c` yes, `bcbf6be9` yes, `544a40ac` yes. Fleet L0-routing commit `83f4cd40` exists in the fleet repo (`git cat-file -t` = commit, author `tabi-shokunin`) and is on the pushed fleet branch (fleet HEAD `8a1a0840` contains it).
- `jj-lane.sh state /home/vgpnk/Projects/shokunin/tabi-shokunin` → `branch=master local=544a40ac… remote=544a40ac… ahead=0 behind=0 head=detached tracked=0 untracked=1`.
- `git -C tabi-shokunin status --porcelain` → one leftover: `?? .ufo/waves/round-61/sources/s153-browser-protocol.json`. No tracked modifications. Defect D1 below (status-neutral).
- Prompt carries the contract: §1 MISSION/AXES binding, §2 claims 1–3 with the lowest-axis rule, §2b frontier step, §3 L2 floor (≥8, one batched swarm; dispatch `minLanes 8 / waveMaxLanes 16`), §4 report contract, §5 commit/push/L0 side channel, §6 hyaku addendum, §7 scratch discipline. Child-lane items present: report path (line 101), commit-then-push ordering (line 133), `SHONEN` heading and its pre-commit grep (lines 118, 517–518), commit-hash citation / report lands last (line 512), lane write scope (lines 575–576).
- Driver digest lines match `.ufo/watchdog.log` exactly (lines 2121, 2134, this closure's grep).
- Status: `ok`. Conformance defects D1 and D2 are named below and are status-neutral.

## 2. Claims — re-derived

Basis: both claims rest on lane-owned counters (`c1-adjacency-host-v20`, `chromium-receipt-r61`) plus the unchanged r60 wide counter. Per PROTOCOL §Gate standard those were not executed here. Each row is marked **re-measured** (a plain command run by this closure over committed bytes) or **evidence-verified** (a committed output file read and its fields checked).

### C1 adjacency (axis: adjacency, lowest owned, score 8) — KILLED

| Item | Basis | Observed | Lane value | Agree |
|---|---|---|---|---|
| frozen snapshot header (`c1/snapshot-r61.tsv`, line 1) | re-measured: `git show 544a40ac:<path> \| head -1 \| cat -A` | `lane^I$`; 1,153 B, 21 lines, sha256 `8b175b27…` | "bad snapshot header `lane\t`" | yes |
| header-repair candidate | re-measured: sha256 + `diff` | `c4159978…`; diff is line 1 only, `lane<TAB>` → `lane<TAB>head`; same 20 heads | "repair separately retained as candidate" | yes |
| counter's header rule | re-measured: `git show 544a40ac:.ufo/waves/round-60/counters/c1-wide-screen-r60.mjs \| grep -n` | lines 191–193: reject unless `header[0]==='lane' && header[1]==='head'`, exit 2 | exit 2 for the frozen header | yes |
| v19 red-before control at `6c5c2a2e` | evidence-verified: `controls/c1-v19-at-round-open.json` | `predicate:false`, `findings` 18 | exit 1, 18 findings | yes |
| v19 exit code at baseline | evidence-verified: Reviewer `commands.json` row "required v19 --rev 7032914…" | exit 1, findingCount 18 | exit 1 | yes |
| frozen wide run refuses | evidence-verified: Sentinel ledger cmd 12; Reviewer row "unchanged wide --scope wide --snapshot frozen input" | exit 2, bad header | exit 2 | yes |
| repaired-header shadow | evidence-verified: Sentinel cmd 11 serves the repair bytes (`snapshotSha256 c4159978…`) | exit 0, 85,775/85,775, roster 20, rowMismatch 0 | 85,775/85,775 | yes |
| v20 selftest | evidence-verified: `measure/v20-selftest-final.json` | `allPass:true`, 42/42 | 42/42 | yes |
| v20 `--list-observed` | re-measured: committed JSON | list of 16 rows | 16 rows | yes |
| rebind smoke | evidence-verified: Sentinel cmd 14 | exit 3, "110 browser-ground hit line(s) have no disposition … no ledger was written" | exit 3, 110 unresolved, no ledgers | yes |
| no production r61 ledgers | re-measured: `git ls-tree -r --name-only 544a40ac -- corpus/ \| grep -c 'r61'` | 0 | "No production r61 adjacency ledgers" | yes |

C1 verdict: the frozen predicate cannot evaluate its own frozen input, and the do-nothing/wide clause is not rescued by a shadow run on bytes the lane edited after freezing. Claim **KILLED by K4**; no score change. The lane's own narration matches the committed receipts.

### C2 coverage / capability `chromium-pointer-event-domain-linux` (score 9) — UNPROVABLE as frozen

| Item | Basis | Observed | Lane value | Agree |
|---|---|---|---|---|
| evidence files before → after | re-measured: `git ls-tree -r --name-only <rev> -- corpus/evidence/round61 \| wc -l` at `7032914c` / `544a40ac` | 0 → 3 (`receipt.json`, two PNGs) | 0 → 3 | yes |
| driver digest | re-measured: `git show 544a40ac:scripts/chrome-cdp-loopback-round61.mjs \| sha256sum` | `f33f0ab72eec4f13519cd67a0768c5f743a7b14248c68bdc1bc9f639352a4e76` | same pin in report, `measure/instrument-pins.json` and the receipt's `driverSha256` | yes |
| PNG digests | re-measured: `sha256sum` over the two committed PNGs | `e3f0b7d9…` (11,224 B), `bd765cf7…` (13,696 B) | receipt `pngSteps` carries the same two digests/sizes | yes |
| pointer/mouse sequence | re-measured: receipt `ptrlog`/`mouselog` | pointer seq 1,2,4 = pointermove/pointerdown/pointerup; mouse seq 3,5,6 = mousedown/mouseup/click; union 1–6 with no gap | "page pointer/mouse seq 1–6" | yes |
| focus + typing | re-measured: receipt `focus`, `keylog.entries` | `focus:"field"`; per-character keyDown entries over `targetId:"field"`, `cancelable:true`, `isTrusted:true` | "focus field, per-character typing" | yes |
| teardown closure | re-measured: receipt `teardown`, `sweeps`, `failures`, `serverLog` | `survivors:[]`, `postKillSweepCount:0`, ports `closed/closed`, `postKillCurl {fixture:7, devtools:7}`, `failures:[]`, sweeps `{0,13,0}` | survivors [], sweep 0, ports closed, curls 7/7 | yes |
| final counter digest | re-measured: `sha256sum` of the committed counter | `97f10e67…` = `measure/instrument-pins.json` | same | yes |
| frozen counter description | re-measured: `git cat-file -s` on r61 vs r60 counters | 164,935 B vs 154,463 B (+10,472 B) | frozen text: "a copy of the r60 counter `b0d03fe0` plus the pointer-domain checks" | no — not a copy-plus-checks by size alone; the lane's own record names recorder/interface changes |
| mutation pin vs final bytes | re-measured: `grep -rn f615a2f9` over `w1/` | seat pins `f615a2f9…`; final is `97f10e67…` | report: "Seat mutations certify their named earlier shas, not final integration"; runbook: "Earlier seat mutation pins do NOT certify final integrated code" | yes for the runbook/report; `w1/R61MutC2.md` claims a final-byte re-measure — defect D2 |
| selftests (final bytes) | evidence-verified: `measure/counter-selftest-final.txt`, `counter-path-selftest-final.txt` | 129/129 each, `allPass` | 129/129 both, idCoverage 68/68 | yes |
| final live run | evidence-verified: `measure/c2-live.json` | `predicate:true`, `findings` 0, `couldNotEvaluate` 0, nonce `tabi-r61-bb759dedd93aa13c` = receipt nonce | same | yes |
| forgery set F refusals | evidence-verified: `measure/f-probes/manifest.json` + MutC2 control table + Exec3 records | f1–f5 each exit 1 on the post-freeze counter; r60 cross-refusal exit 1 | "On the re-smoke, generated f1–f5 each exited 1; r60 cross-refusal exited 1" | yes, but not on the frozen interface |
| run revision | evidence-verified: `measure/live-run-command.json` | exit 0 at `bcbf6be9`; receipt written into the corpus tree and committed at `544a40ac` | "runner and counter exit 0" | yes |

C2 verdict: **UNPROVABLE as the frozen claim.** The committed artifact is real and internally consistent — the receipt binds the committed driver bytes and the committed PNGs, the teardown closure proof holds, and the final counter is green on it with two 129/129 selftests — but the instrument that produced that green is not the frozen instrument. The frozen statement names "a copy of the r60 counter `b0d03fe0` plus the pointer-domain checks"; the final counter differs by +10,472 B and the lane records recorder/interface and nonce-acceptance changes after seats had begun scoring, under its own `freezeRule` ("a post-data change to any predicate or kill rule is a new claim, not an amendment"). No capability row and no score change is claimed; that is the correct disposition. The claim type is `capability`, not `exploratory`, so `unprovable-but-better` is unavailable here: the axis grades `unprovable`, and the better-than-before artifact is recorded without being scored.

Re-measured vs evidence-verified: the snapshot/receipt bytes and digests, the evidence-file counts, the receipt's internal sequence/teardown, the counter size delta, the mutation-pin grep, the v20 list length, the production-ledger absence and the round diff were re-measured. The v19 control, all counter/wide verdicts, the selftests, the mutation kills and the shadow runs were evidence-verified.

## 3. Discernment spot-check (LEARNING.md)

Sample from `corpus/lessons/round-61.md` `## Gate` (line 5): 1 admit, 1 reject, 1 withheld admission; plus the two re-open rows. Sources re-opened live on 2026-11-03.

| # | item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|---|
| 1 | S164 `pointerType` definition, quote "Indicates the device type that caused the event (such as mouse, pen, touch)." — raw 1699 (16 words) | admit as documented interface ground | `https://www.w3.org/TR/pointerevents/` → HTTP 200, 948,439 B, sha256 `ed503a5e0a6becf0898c0156bec45f0491132dab75cbebb73a14552e9e3318b8`, byte-identical to the committed staged copy. Raw 1697–1710 carries the `pointerType` dfn and the quoted sentence. Page self-identifies "Pointer Events / Level 4", `last-modified` 2026-10-08. | agree | The quote is verbatim at the recorded line on the live page, and the row is scoped to the served Working Draft, not a Recommendation. |
| 2 | S164 as the definition of `isTrusted`, or as proof of browser interoperability | reject | Same live bytes: `grep -c 'id="dom-event-istrusted"'` = 0; the three `isTrusted` occurrences (raw 3822, 3937, 3992) are cross-references (`http://…/dom.spec.whatwg.org/#dom-event-istrusted`) inside trusted-event prose, not a local definition. No browser-support table is read as measured interoperability. | agree | Pointing at DOM's definition is not defining it; and a spec page cannot prove what this host's browser does. The flip the lesson names (open the actual definition or measure the surface) is the right one. |
| 3 | Pointer capability / knowledge draft | withhold from the capability table and knowledge corpus | The frozen-vs-final instrument delta in section 2 (counter +10,472 B, `f615a2f9…` → `97f10e67…`, nonce acceptance 12→16 hex after scoring began) | agree | A capability needs a passing demonstration of the claimed instrument; the lane holds its own bar rather than transferring earlier mutant evidence. |
| 4 | S153 re-open, registered `browser_protocol.json` URL | re-open byte-identical, no cell changed | `https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json` → 1,423,170 B, sha256 `d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7` = receipt | agree | Live bytes match the recorded digest and size exactly; no registry cell was rewritten (`git diff --numstat` shows `corpus/SOURCES.md` 1/0). |
| 5 | S161 re-open | re-open byte-identical, no cell changed | `https://www.w3.org/TR/uievents/` → 920,762 B, sha256 `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918` = receipt | agree | Live bytes match; round-60's R1 (no in-place `anchor` edits) is honored. |

Result: 5 of 5 sampled decisions agree (2 gate decisions: 1 admit, 1 reject; 1 withheld admission; 2 re-opens). The sample is small; treat the agreement as a floor, not a rate.

Newly written `corpus/SOURCES.md` row S164 (≤25-word quote rule): the `## Gate` record carries URL, access date 2026-11-03, and the 16-word quote above with its raw line; the row itself is `spec / A / mined`, `opened 2026-11-03`, `recheck on-release`, `used-by corpus/lessons/round-61.md`, 11 columns (census clean). The quote re-locates at raw 1699 on the live page, and the row's staged sha256 `ed503a5e…` is the live digest.

Census: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0, `tabi ok`, 164 rows (`grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|'`; baseline 163 at `6c5c2a2e`), malformed rows 0. 22 W04 across-scope duplicate-url warnings; the ID set is byte-identical to `controls/census-start.txt` (diff empty: S058, S065, S066, S068, S069, S070, S073, S074, S075, S076, S077, S095, S096, S098, S099, S100, S114, S115, S118, S123, S148, S156). No W04 added by round 61.

## 4. Trend verdicts (evidence)

- **expansion: unchanged.** `corpus/knowledge/` count is 74 at both `6c5c2a2e` and `544a40ac`; no knowledge note, no capability row, no frontier area moved into core. S164 is a registry row. Agrees with the lane.
- **quality: unchanged.** No admitted entry was re-certified or superseded. The round appends QUALITY criterion 113 (12 added lines, 0 deleted) and the lesson's `## Mistakes`, and explicitly marks the frozen-input drift and the stale mutation pins rather than leaving them as passes. Agrees with the lane.
- **discernment: improved.** The outside spot-check agrees on the gate's admit (S164 interface ground) and its reject (S164 as `isTrusted`/interoperability), and on the withheld capability admission (section 3: 5/5). QUALITY 113 turns the round's own frozen-input failure into a criterion behind a lesson, which the lane could not self-attest. The lane graded this `unchanged` with the sample "pending"; the closure's sample is that missing outside judgment, so the grade moves to `improved`. Sample small; the floor is one admit and one reject.

## 5. Axis grades

| Axis | Grade | Basis |
|---|---|---|
| adjacency | unchanged | C1 killed by its own K4 (frozen snapshot header; re-measured bytes and receipts agree); score held at 8 |
| coverage | unprovable | C2 not scorable as frozen (instrument changed after scoring; +10,472 B, four counter shas, mutation pin `f615a2f9…` ≠ final `97f10e67…`); artifact real but unadmitted; score held at 9 |
| depth | unchanged | not claimed this round |
| operability | unchanged | not claimed this round |
| freshness | unchanged | not claimed this round |
| calibration | unchanged | not claimed this round |

Harm check: `git diff --numstat 6c5c2a2e 544a40ac -- LOG.md SCORECARD.md corpus/QUALITY.md corpus/SOURCES.md corpus/lessons/round-61.md scripts/chrome-cdp-loopback-round61.mjs` → 9/0, 19/0, 12/0, 1/0, 45/0, 351/0 (added/deleted). Append-only; no existing SOURCES row or score edited. No axis is harmed.

Admission: `admitted = false`. C1 is killed and C2 is unprovable as frozen; no claim verifies, and nothing is harmed, so the verdict is `rejected-honest-stop`.

## 6. Routed defects for the lane's next round

- **R1 (D1, leftover round work + a non-resolving pointer).** `.ufo/waves/round-61/sources/s153-browser-protocol.json` (1,423,170 B) is left untracked in the lane working tree, and `sources/s153-reopen-receipt.json`'s `staged_file` names that path, so the pointer resolves only in the worktree (the `.hdr`, the quotes file and the receipt are committed, and the URL re-opens to the same digest). Route: either commit the payload or make the receipt cite the URL + digest as the evidence, and remove the leftover before the round closes. The S153 re-open itself verified live (sha256 `d6737c31…`).
- **R2 (D2, mutation-certification wording).** `DATA-PASS-RUNBOOK.md` and the report state that seat mutations certify earlier shas only, while `w1/R61MutC2.md` states its verdicts were re-measured on the final bytes (`97f10e67…`, 5/5 killed, control 129/129, 68/68 ids). The disposition is conservative in the safe direction — nothing was admitted — but the record is inconsistent about which bytes were certified. Route: state one position next round; if final-byte mutation evidence is to count, commit the harness run (not only its digests) so a non-author can read the kills against the final pin.
- **R3 (carried, planner seat).** The L2 floor's 1× planner is held by the L1 because the wave validator rejects planner as a swarm role; 11 L2 seats ran without one. Disclosed in the report and filed as the round-61 L0 routing question (`83f4cd40`). Route stays operator-owned.
- **R4 (carried, wide-screen premise).** The stale-row-control premise of the r60 wide clause is thin without `--verify-rows` (lesson; Critic CR notes). Carry into any later wide-screen claim together with snapshot-pinned v19 inputs (round-60 R2).
- **R5 (carried L0s).** `tabi | round-57` assimilation stays closed; `tabi | round-60` keyup `cancelable` value and `tabi | round-59` kaidoku overlap rulings remain open for the operator. Not touched by this closure.
- **Closed:** round-60 R1 (SOURCES anchor edited in place) — round 61 adds one row and changes no existing cell (`numstat` 1/0); S153/S161 re-opens recorded in the lesson, not by rewriting anchors.

## 7. SHONEN note (for the operator; no box written)

Promotion is operator-owned. No `[x]` is written here, and `SHONEN.md` was not touched. The four boxes remain the lane's `[~]`. Box 2's pointer now resolves: `corpus/evidence/round61/chromium-pointer-domain/receipt.json` is committed at `544a40ac` with the driver bound by digest, and the closure re-measured its internal sequence and teardown. Boxes 1, 3 and 4 still need a non-author SKILL.md, executability and PROVINCE review that this closure did not perform, so the round alone does not make all four boxes checkable by a non-author.

## Verdict

Conformance: `ok`, with D1 (untracked S153 payload / non-resolving staged_file pointer) and D2 (mutation-certification wording divergence), both status-neutral and routed. C1 killed by its own frozen K4; the re-measured snapshot bytes and the committed seat receipts agree with the report. C2 unprovable as the frozen claim: the committed receipt is real and bound to committed bytes, but the final counter is not the frozen instrument, so no capability is admitted. No axis harmed. `admitted = false`, `rejected-honest-stop`.
