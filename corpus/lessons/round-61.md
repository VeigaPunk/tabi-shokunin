# Round 61 — snapshot discipline and pointer delivery

Baseline 6c5c2a2e; claims freeze 7032914c; integrated instruments bcbf6be9. WAVE-DONE received from Main after all 11 w1 seats settled. C1 adjacency is KILLED on its original frozen input. C2 coverage is UNPROVABLE as an admitted frozen claim: the receipt interface and nonce acceptance changed after seats had scored intermediate instruments. No score moves; no capability row enters. The integrated browser journey is real, but is not a replacement admission predicate.

## Gate

Opened 2026-11-03 under the recorded final-host guard:

| Candidate | Decision and located quote | Evidence |
|---|---|---|
| S164, https://www.w3.org/TR/pointerevents/ | Admit the documented interface only. “Indicates the device type that caused the event (such as mouse, pen, touch).” — pointerType definition, raw 1699 (16 words). | sources/s164-fetch-receipt.json and s164-quotes.json under .ufo/waves/round-61; 948439 bytes, sha256 ed503a5e0a6becf0898c0156bec45f0491132dab75cbebb73a14552e9e3318b8. Served revision: Level 4 Working Draft 2026-10-08, not a Recommendation. |
| S164 as the definition of isTrusted or proof of browser interoperability | Reject. Its isTrusted occurrences at raw 3822/3937/3992 are DOM cross-references, not a local definition. Flip: open the actual definition or measure the relevant browser surface. | Scout report and Sentinel 30/30 located-quote audit. |
| S153, registered raw.githubusercontent.com browser_protocol.json URL | Re-open byte-identical: 1423170 bytes, d6737c31…31e7. No existing registry cell changed. | sources/s153-reopen-receipt.json, s153-quotes.json. |
| S161, https://www.w3.org/TR/uievents/ | Re-open byte-identical: 920762 bytes, 8ded5eaf…b918. No existing registry cell changed. | sources/s161-reopen-receipt.json, s161-quotes.json. |
| Pointer capability / knowledge draft | Withheld from capability table and knowledge corpus: final integration is not the instrument attacked by the mutation seats. | w1/R61MutC2.md pins f615a2f9, final code pin in measure/instrument-pins.json. |

Registry: 163 → 164; one new A/spec/mined row, used-by this lesson. Existing rows unchanged (including anchors). Thus round-60 routed R1 is honored. No status/recheck/used-by changes on existing rows. Independent admit/reject spot-check pending; dispatched seats are still the lane.

## Measurements

- C1 before: unchanged v19 at baseline exits 1, predicate false, 18 findings: controls/c1-v19-at-round-open.json. Its five counts are roster 20 / mapRows 16 / auditRows 16 / deltaLanes 20 / bgScreenSiblings 20.
- C1 frozen after input: snapshot-r61.tsv has `lane<TAB>` rather than `lane<TAB>head`. The unchanged wide counter exits 2 on those frozen bytes (Reviewer A5-HEADER; Sentinel command 12). This is K4, not a pass rescued by fixing an input. The original bytes have been restored. The header-only repair is separately retained at c1/snapshot-r61-header-repair-candidate.tsv.
- Rebind smoke exits 3 with 110 unresolved dispositions; no production r61 ledgers were written. L1 candidate adjudications (61 no-tabi-ground / 42 overlap-declared / 7 contested-open) remain evidence, not validated ledgers. The kaidoku rulings remain pending the existing round-59 L0 question.
- Final integrated v20 selftest 42/42; --list-observed exits 0 with 16 rows after the stale helper call was fixed. Retained in measure/v20-*-final.*.
- Final pointer counter selftest and path-selftest: 129/129, finding-id coverage 68/68. All 110 carried cases remain green; receipt-backed pointer cases replace the synthetic pointer fixtures. Retained in measure/counter-*-final.txt. These are local checks, not admission.
- Committed runner at bcbf6be9 executed with nonce `tabi-r61-bb759dedd93aa13c`; live runner exit 0 and final counter exit 0, findings [], couldNotEvaluate []. Receipt: corpus/evidence/round61/chromium-pointer-domain/receipt.json, plus two PNGs (three evidence files). Commands/outputs: measure/live-run-command.json, live-run.stdout.json, c2-live.json.
- Page sequence: pointermove 1, pointerdown 2, mousedown 3, pointerup 4, mouseup 5, click 6. Pointer entries are mouse/trusted; focus is field. Closure: survivors [], sweep 0, both port probes closed, both post-kill curls 7. No external-site action.
- Frozen F on the re-smoke: f1–f5 each exit 1; r60 cross-refusal exit 1. Earlier mutation evidence belongs to its pinned byte generations and is NOT asserted for final integrated code. Critic residuals (secondary button, inconsistent move id, consistent second press) are not closed by this round.

## Mistakes

| Class · evidence | Captured-by | Fix / disposition |
|---|---|---|
| stale-premise: broad pointer absence sweep found vendored/upstream text and BiDi sent-command strings | pre-freeze L1 sweep, controls/pointer-absence-sweep.txt | Scoped the absence to page-side witnesses; claims corrected before freeze. |
| reference-drift: snapshot generator processed its header as a lane, producing an empty head cell | Reviewer A5-HEADER, Sentinel frozen-input check | Same counter red on original header, green on repaired-header shadow; repair retained separately; original frozen bytes restored. Claim remains killed. |
| vacuous: wide-screen stale-row control omitted --verify-rows | Critic P1 / Reviewer A5-CONTROL | Do not claim an old wide scanner as new coverage. A later claim must bind a row-verification control before scoring. No retroactive predicate amendment here. |
| reference-drift: L1 sent seq/mouselog interface only to counter author, not runner author | runner-versus-counter compatibility run red; Reviewer B4 | Shared seq and split recorders integrated, re-smoke green. Red-before mixed recorder and green-after retained in w1/R61Exec2/smoke and smoke-r61b. |
| attribution: L1 initially treated post-seat repairs as pre-data corrections | Critic and Sentinel, DATA-PASS-RUNBOOK.md | Rejected that rationale: claims.json remains byte-identical; final artifacts are non-admitting integration work. |
| survivor: mutation pins certify earlier counter, not final integration | MutC2 pins versus measure/instrument-pins.json | Final claim unprovable; no transferred mutation verdict and no capability admission. |

## Frontier and limits

S164 grounds the new pointer-domain experiment. No knowledge entry admitted (74 unchanged), no frontier-to-core move asserted. Expansion unchanged; quality unchanged; discernment unchanged pending non-author review. Assimilation: none — adoption closed by round-57 register defect; considerthese/ absent. Round-60 R2 remains a candidate design, not a verified ledger cutover; R3 planner mapping routed to L0 round 61; R4 keyup value and R5 kaidoku ruling remain open. Node observed v26.12.0, not the frozen host-note v24.21.0. No tool installs.

Self-evaluation: accuracy 3 (frozen-input defect explicitly rejected), completeness 3 (real experiment landed but neither claim admitted), clarity 4 (separate original/candidate bytes), actionability 4 (commands and pinned evidence), conciseness 3 (large evidence set). Overall 3.4. Highest-impact improvement: freeze a runner/counter schema and execute controls before seats score; never relabel post-score changes as pre-data admission. User should agree that honest non-admission is preferable to a false green.
