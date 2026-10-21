# AttackChronology: review timestamp versus finalized acquisition

Seat: TabiR22.AttackChronology (reviewer, leaf). Lane: tabi, wave tabi-r22-w1. Baseline 5f585773258b33d2d514b00cd0b0775333578db6.
Target: the shared review-chronology oracle/debt design: "reviewed producer digest + review-return timestamp versus artifact producer digest + acquisition start; exact-digest mismatch or acquisition-after-return reports review_scope_gap, never final-reviewed" (`.ufo/waves/round-22/w1-spec.json`, items BuildDebt and AttackChronology), and its draft in the BuildDebt clone.

Status: read-only. Not executed: the draft classifier and its `--selftest`, measure-c1, any build, test, linter, browser, network probe, or service. Draft behavior below comes from reading the code (marked "static"). Tools used: JSON parse, sha256, `git show`/`ls-tree`/`cat-file`/`log`, `stat` mtimes, grep. Installs: none. Mutations: this report only.

## 1. Verdict

1. The stated rule gets the retained W2-versus-finalized pair right: `review_scope_gap`. Two independent facts support it. W2 cites producer `5363d576…`, not `bc11e4…`. And no W2 report can contain a finalized digest: every W2 report was last written by 13:38:38.096Z, and the first finalized artifact was written at 13:51:46.772Z.
2. The premise "review timestamp before finalized acquisition cannot certify final bytes" holds for artifacts only in refutation form. A time bound on reads can show a claimed artifact was not yet written (so the claim is infeasible). It cannot show coverage. Identity comes from exact digests, not from time. See F5.
3. The draft classifier in the BuildDebt clone would accept, with exit 0, claims the record refutes (F1), grant exit 0 on an upper-bound clock (F2), depend on which of two starts the caller picks (F3), accept any offset clock including commit dates (F4), and let a failed seat's output count as a review (F6).
4. The debt expectations bind none of the retained record: 14 synthetic cases, zero retained identifiers (F8). The W2 debt is unchecked by any case.

Summary table:

| ID | Sev | Target | Problem | Retained proof |
|---|---|---|---|---|
| F1 | High | draft check-review-chronology.mjs:224, :227, :239-240, :269-272 | Start-only gate; no finish or per-artifact write time | 18 of 25 final pins written after 13:51:50.000Z |
| F2 | High | draft :220-224; selftest exact_pre_review_artifact_positive | Upper-bound clock accepted as a coverage positive | readAt is one snapshot; seats carry no times |
| F3 | High | draft acquisition.started_at (single field) | Record has two starts 175 ms apart; receipt start is 1 ms after first artifact | runtime-execution-finalized.json:14 vs receipt.json:3 |
| F4 | Medium | draft instant(), :52-78 | Any RFC3339 offset clock admitted; no source check | 2d5eaaa author date = 14:16:49Z |
| F5 | Medium | premise | Timing refutes, never proves; producer and artifact identity differ | 0 of 25 finals equal bounded bytes; invocationIds differ |
| F6 | Medium | draft eventHistory :113-153; review object has no seat | Single failure yields no finding; partial review can be positive | SemanticNaNativeSubmit partial text; w2-failures.json |
| F7 | Medium | acquisition selection (no selector in draft) | Name or position selection can pick a historical run | runtime-execution-final.json is historical |
| F8 | High (debt) | debt-expectations.json | 14 synthetic cases; 0 retained identifiers | grep count 0 |
| F9 | Low (debt) | closure and LOG wording | 13:45:46Z and 13:19:45Z exits are closure-only; LOG.md:1388 still says "final is current" | round21-closure.json:66; LOG.md:1388, :1406-1407 |

Common input conventions for every counterexample below: `schema` is `tabi-round22-review-chronology-input-v1`, and `event_history` is present (`[]` when no events). Without `event_history` the draft returns exit 2 by design (`:261-264`), so omitting it would not test the chronology rule. Times are written with nanosecond precision, which the draft's parser accepts (`:52-78`).

## 2. Retained chronology (UTC; verified this pass)

| Instant | Event | Source |
|---|---|---|
| 2026-10-21T13:07:01.895287+00:00 | Bounded acquisition start; producer 5363d576f52e72dc4e82d5838706aa307f371648e73242eed99e9776f06eceb9 | .ufo/waves/round-21/runtime-execution-bounded.json:12-13 |
| 13:07:02.041Z | Bounded receipt startedAt (also first bounded artifact mtime, na-pending.html) | .ufo/waves/round-21/history/runtime-v4/receipt.json; stat |
| 13:07:02.041Z to 13:07:14.097Z | All 25 bounded artifact mtimes | stat history/runtime-v4/* |
| 2026-10-21T13:07:14.124522+00:00 | Bounded acquisition finish | runtime-execution-bounded.json:18 |
| 13:22:35.342Z to 13:38:38.096Z | W2 report writes (58 files; max is SemanticAutoPositive.md) | stat .ufo/waves/round-21/w2/*.md |
| 2026-10-21T13:49:02.529912+00:00 | W2 readAt: one snapshot for all seats. taskReturnBarrierObserved true (line 5); allActorQuiescenceCertified false (line 6); seat keys are name, role, latestOutput only | .ufo/waves/round-21/w2-returns.json:4-6 |
| 13:49:27.925Z | mtime of history/webmcp-lifecycle-v4.mjs (bytes 5363d576…; absent at 1b5f449, committed at 5f58577). Copy time, not existence | stat; git show |
| 13:51:18.900Z (last write) | scripts/webmcp-lifecycle-round21.mjs now bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811 | stat; sha256 |
| 2026-10-21T13:51:46.597742+00:00 | Finalized wrapper start | runtime-execution-finalized.json:14 |
| 13:51:46.772Z | First finalized artifact write (na-pending.html) | stat corpus/evidence/round-21/runtime/* |
| 2026-10-21T13:51:46.773Z | Finalized receipt startedAt, 1 ms after first artifact write | corpus/evidence/round-21/runtime/receipt.json:3 |
| 13:51:58.439Z | Receipt finishedAt | receipt.json:685 |
| 13:51:58.452Z | Last artifact write (receipt.json mtime) | stat |
| 2026-10-21T13:51:58.460511+00:00 | Finalized wrapper finish | runtime-execution-finalized.json:19 |
| about 14:01:12Z | history/ directory mtime (INFERENCE: bounded artifacts moved to history/runtime-v4) | stat .ufo/waves/round-21/history |
| 2026-10-21 11:16:49 -0300 (14:16:49Z) | Author date of 2d5eaaa, the only commit touching scripts/webmcp-lifecycle-round21.mjs | git log |
| about 14:19:31.356Z | corpus/evidence/round-21 and .ufo/waves/round-21 directory mtimes (INFERENCE: candidate-to-canonical rename; a git checkout gives the same signal) | stat |
| 2026-10-21T14:44:47.057854+00:00 | closed_at | round21-closure.json:69 |

Git and digest facts:
- 1b5f449: all 25 blobs under corpus/evidence/round-21/runtime are byte-equal to history/runtime-v4 (bounded). Receipt sha256 323ccd591d82a8867903ea859ae45bac46eb0beb42bf27997aefac9c8773e6a6. scripts/webmcp-lifecycle-round21.mjs absent.
- 2d5eaaa: all 25 blobs under the same path are byte-equal to the finalized bytes. Receipt sha256 4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034. Producer blob bc11e4….
- 5f58577: history/webmcp-lifecycle-v4.mjs = 5363d576….
- Finalized pins: 25 of 25 match disk now.
- Invocation IDs differ per run: history/runtime-v4/na-reset.json A49A436758AB02CAD5BDF803319539C8; corpus/evidence/round-21/runtime/na-reset.json B8BA3C97850919D25D5C04338D497F26.

## 3. Digest citations (full 64-hex; exact)

- W2, 58 report files: 32 cite at least one exact bounded digest; 26 cite the exact bounded producer; 0 cite any of the 26 finalized digests (25 pins plus bc11e4); 26 cite no exact digest.
- Bounded exact citations cover 25 of 26 bounded entries (23 case files, the receipt, the producer). history/runtime-v4/na-reject.json is uncited. Examples: SemanticNaInvalidSubmit.md (mtime 13:30:24.759Z) cites ca703c843237671ec435efd9797ff4e70e1e02884b714ef5f4e2c34e488919b0 (na-invalid-submit.json) and 8a64d21d2b704dee05e8e734e4b9f381f0ff764f37931702d5fa47745d60be0e (na-invalid-submit.html). FixtureNaReject.md (mtime 13:26:07.504Z) cites 5086d16f9f90b4418d7b15c22c4b34bb222b245851136837b80e4d76f0dfb367 (na-reject.html).
- W1, 46 report files (readAt 13:15:40.534838Z; max report mtime 13:12:30.422Z): 0 exact bounded or finalized digests. The v3 producer appears only as the 16-hex prefix 847d046710a0dd5e, in 3 files.
- Failed W2 seats (.ufo/waves/round-21/w2-failures.json): 5 have empty latestOutput. SemanticNaNativeSubmit has 1193 characters beginning "<think>", with no digest. Its disposition says partial analysis is not a completed review.

## 4. Findings

### F1. Start-only gate admits claims that the record refutes (High)

Target: draft `:224` (`acquisitionStartedAt <= reviewObservedAt`), `:227` (scope equality), `:239-240`, `:269-272` (exit 0). The input has no acquisition finish and no per-artifact write time, so nothing can refute a claim made mid-acquisition.

Counterexample (exact input):
- review: producer_sha256 bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811; observed_at "2026-10-21T13:51:50.000000000+00:00"; clock_role "review_observation_upper_bound"; artifact_scope = the 25 finalized pins (runtime-execution-finalized.json:20-46), receipt sha256 4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034.
- acquisition: producer_sha256 bc11e4…; started_at "2026-10-21T13:51:46.597742+00:00"; artifact_scope identical to the review's.
- Draft (static): exit 0, verdict `matched_supplied_scope`, finding `review_scope_match`, scope.status `matched`.
- Retained write times at 13:51:50.000Z: 7 pins existed (na-pending.html 13:51:46.772; na-click.html and na-pending.json 13:51:47.875; na-click.json 13:51:48.854; na-requestsubmit.html 13:51:48.854; na-native-submit.html 13:51:49.789; na-requestsubmit.json 13:51:49.789). The other 18 were written later, from na-native-submit.json at 13:51:50.721 to receipt.json at 13:51:58.452.

Stable expectation: exit 1, finding `review_scope_gap`, with reasons `artifact_written_after_observation` (18 pins) and `acquisition_not_finished_at_observation` (wrapper finish 13:51:58.460511Z).

Bounded preserving positive: the same 25 pins with observed_at "2026-10-21T13:52:10.000000000+00:00" yield exit 0, `claims_consistent_at_upper_bound`, and `final_reviewed: false`, scoped to the 25 named digests. A per-file claim is also admissible: a claim covering only na-pending.json (written 13:51:47.875Z), observed at 13:51:50.000Z, yields exit 0 for that file alone.

Caveat: write times here are filesystem mtimes. They are observations, not attestation. The design needs them as a declared input with a stated source.

### F2. An upper-bound clock is granted exit 0 (High)

Target: draft `:220` (comment: readAt values "are upper bounds, not per-seat return clocks"), `:221` (both roles accepted), `:224` (one comparison for both roles), `:185` (role only echoed). The only exit-0 selftest case, `exact_pre_review_artifact_positive`, uses role `review_observation_upper_bound` and asserts `scope.review_clock_role` equal to that role.

Why: an upper bound on reads can refute a claim (if the bound is earlier than a claimed artifact's write time, the claim is infeasible). It cannot prove that a read happened after anything. The record supports only upper bounds:
- w2-returns.json:4-6 gives one readAt with allActorQuiescenceCertified false. w1-returns.json gives readAt 13:15:40.534838Z, also with allActorQuiescenceCertified false.
- Seats carry no per-seat times.
- The closure says all W2 seats exited by 13:45:46Z and all W1 exits came by 13:19:45Z. Those exit times appear only in round21-closure.json:66 and in derivative round-22 notes. No primary record I checked contains them.
- The tighter primary upper bounds are per-report mtimes: W2 by 13:38:38.096Z (58 files), W1 by 13:12:30.422Z (46 files). [INFERENCE: a report's last write bounds the reads whose results it contains.]

Counterexample: any exit-0 positive whose only chronology evidence is an upper-bound role. F1's input with role upper_bound is one such case; the selftest case is another.

Stable expectation: with role `review_observation_upper_bound`, chronology can contribute only refutation (exit 1 when the bound precedes a claimed artifact's write time) or exit 2 `chronology_unavailable`. It never supports a coverage positive by itself. The positive label should be `claims_consistent_at_upper_bound`, not `review_scope_match`.

Bounded preserving positive (exact):
- review: producer_sha256 5363d576f52e72dc4e82d5838706aa307f371648e73242eed99e9776f06eceb9; observed_at "2026-10-21T13:49:02.529912+00:00"; clock_role upper_bound; artifact_scope = read_at_revision 1b5f449ad15525d281fda4558aeef1086f1e4a65, path corpus/evidence/round-21/runtime, receipt corpus/evidence/round-21/runtime/receipt.json sha256 323ccd591d82a8867903ea859ae45bac46eb0beb42bf27997aefac9c8773e6a6, plus the 25 1b5f449 blob digests.
- acquisition: producer 5363d576…; started_at "2026-10-21T13:07:01.895287+00:00"; artifact_scope identical.
- Draft (static): exit 0, `matched_supplied_scope`. Corrected design: exit 0, `claims_consistent_at_upper_bound`, because all 25 artifacts (13:07:02.041Z to 13:07:14.097Z) and the producer predate the observation. `final_reviewed: false`.

### F3. One start cannot express the two-clock final record (High)

Target: `acquisition.started_at` is a single field (`:223`).

Retained: wrapper startedAt 2026-10-21T13:51:46.597742+00:00 (runtime-execution-finalized.json:14). Receipt startedAt 2026-10-21T13:51:46.773Z (corpus/evidence/round-21/runtime/receipt.json:3). The first artifact write (13:51:46.772Z) precedes the receipt start by 1 ms, so the receipt start is not a lower bound on artifact existence. The bounded run has the same pattern: wrapper 13:07:01.895287 and receipt 13:07:02.041, about 146 ms apart.

Counterexample: review observed_at "2026-10-21T13:51:46.700000000+00:00" with producer bc11e4 and the 25 final pins.
- started_at = wrapper 13:51:46.597742 → draft exit 0 (static).
- started_at = receipt 13:51:46.773 → draft exit 1, finding `acquisition_after_review_observation` (static).
The draft's verdict depends on which start the caller picked.

Stable expectation: exit 1, `review_scope_gap`. The observation precedes both starts' latest value and every pin's write time (13:51:46.772Z to 13:51:58.452Z). If a record supplies starts that disagree about the observation, the classifier should use the later start for artifact gating, or exit 2 `acquisition_clock_ambiguous` when it cannot decide.

Bounded preserving positive: observed 2026-10-21T13:49:02.529912+00:00. Both bounded starts (13:07:01.895287 and 13:07:02.041) precede it. The verdict is exit 0 under either start, as in F2.

### F4. Clock source admissibility (Medium)

Target: `instant()` (`:52-78`) accepts any RFC3339 timestamp with an offset, and the clock role is the only source label.

Counterexample: review observed_at "2026-10-21T11:16:49-03:00" (the 2d5eaaa author date, 14:16:49Z), clock_role review_return, producer bc11e4, the final 25 pins; acquisition started_at "2026-10-21T13:51:46.597742+00:00". Draft (static): 14:16:49Z is not before the start, so exit 0. A Git author date is settable and is not a review-return capture.

Stable expectation: exit 2, `clock_source_not_admissible`. Admissible sources are declared and enumerated, such as a harness capture (readAt) or a filesystem report mtime with its basis stated. Commit dates, closed_at, and copied timestamps are not admissible.

Preserved behavior: the space-separated Git form "2026-10-21 11:16:49 -0300" is rejected by the regex (`:54`), so the draft returns chronology_unavailable (exit 2) and does not invert the order. The sub-millisecond parser orders 2026-10-21T13:51:46Z before 2026-10-21T13:51:46.597742+00:00 correctly. A string comparison would invert that, which is why R8 below exists.

Bounded preserving positive: observed "2026-10-21T13:49:02.529912+00:00" (readAt, admissible) with the bounded start, as in F2.

### F5. Premise: timing refutes, digests certify (Medium; premise)

The premise is right for artifacts in this record and wrong as a general statement.
- Artifacts: run-unique. No finalized byte equals a bounded byte, and invocation IDs differ per run. So a claimed final digest could not have been read before its write, and timing can refute the claim. Timing cannot prove that the reviewer read the final bytes.
- Producer identity: byte-identical producer content read before an acquisition is valid identity evidence. If a reviewer had read bytes equal to bc11e4… at 13:49, producer identity would match, and the design would still call it a gap. No such retained instance exists. The gap is conservative, but it must not be presented as artifact coverage.

Expectation: restate the premise as "Timing can refute a claimed artifact (the claimed artifact was written after the observation). Timing cannot certify coverage. Producer identity is by digest equality only." Keep `final_reviewed` false in every output.

### F6. No seat link: a failed or partial seat can yield a positive (Medium)

Target: the review object carries no seat (`:113` and the input shape). Failure events produce findings only as peer revival, routing broadcast, or late failure (`:142-153`). A single failure with no later activity yields no finding.

Counterexample: event_history `[{"seat":"SemanticNaNativeSubmit","type":"failure","status":"failed"}]` with a matched review scope (any bounded scope above). Draft (static): findings empty, exit 0.

Retained: SemanticNaNativeSubmit latestOutput is 1193 characters beginning "<think>", with no digest. w2-failures.json disposes of it as "No retry, rephrased redispatch or replacement. Partial analysis is not a completed semantic review."

Stable expectation: a review carries seat and completed fields. If the seat's first terminal event is a failure, exit 2, `review_not_completed`. Partial text never counts as review evidence.

Bounded preserving positive: FixtureNaReject.md (mtime 13:26:07.504Z) is a completed seat with an exact bounded cite, 5086d16f9f90b4418d7b15c22c4b34bb222b245851136837b80e4d76f0dfb367 (history/runtime-v4/na-reject.html). Once linked as completed, it yields exit 0 as in F2.

### F7. Acquisition selection is unpinned (Medium)

Target: the draft has no selector; the caller supplies `acquisition`. Historical records in the same directory carry "final" in the name or exit 1:
- runtime-execution-final.json is historical (history/index.json:15-19). producerSha256 847d046710a0dd5e61d966f4cb985052bca1966c75481a16d9cc931aa3a786d4 (:12), startedAt 2026-10-21T12:53:34.135286+00:00 (:13), exit 0 (:15). LOG.md:1388 still calls it current; the supersession is at LOG.md:1406-1407.
- runtime-execution.json is an exit-1 refusal (:14), startedAt 12:39:34.232445+00:00, producer a273fe77… (history/index.json:34-38).

Counterexample: a selector keyed on the name "final" selects 847d0467… with start 12:53:34.135286. W1 cites 847d0467 only as a 16-hex prefix in 3 files, so a prefix-tolerant matcher would also match. The result is a historical run reported as final.

Stable expectation: select by exact producer digest, exit 0, and receipt digest pin. The only final candidate is runtime-execution-finalized.json (producer bc11e4…, receiptSha256 4bc79636…, line 47). Refusals and prefix matches are excluded (digest not exact, exit 2). No label is derived from a file name.

Bounded preserving positive: select runtime-execution-bounded.json (producer 5363d576…, exit 0, startedAt 13:07:01.895287Z); exit 0 as in F2.

### F8. Debt expectations do not bind the retained record (High; debt)

debt-expectations.json has 14 selftest cases, all synthetic: placeholder digests aaaaaaaaaaaa, bbbbbbbbbbbb, cccccccccccc, dddddddddddd, eeeeeeeeeeee, and times 12:00:00Z, 11:59:00Z, 12:00:01Z. A grep for 5363d576, bc11e4d6, 13:49:02, 13:51:46, 4bc79636, 323ccd59, 1b5f449, and 2d5eaaa returns 0 matches.

So the W2 debt ("review_scope_gap for W2 against the final acquisition") is not checked by any case. A classifier that returned exit 0 for that pair would still pass the selftest.

Stable expectation: add retained-record cases (R1-R8 in section 6), built only from the exact bytes and times in section 2, alongside the synthetic cases.

### F9. Closure-only timestamps and debt wording (Low; debt)

- "W2 final exit 13:45:46Z" appears only in round21-closure.json:66 and in derivative round-22 notes (.ufo/waves/round-22/w1/ScribeMistakes.md:26; corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:74). No primary W2 record I checked contains it: .ufo/waves/round-21/w2-record.json, w2-failures.json, w2-returns.json, w2-task-result.json, or the report mtimes. Debt expectations must not take it as input. If cited, label it closure-asserted.
- The W1 "four final exits by 13:19:45Z" is likewise closure-only.
- LOG.md:1388 still says runtime-execution-final.json names the current producer. The supersession at LOG.md:1406-1407 is in the same entry. Debt text should cite the supersession.

## 5. Preserved behaviors (do not "fix")

- `instant()` (`:52-78`): exact RFC3339 instants, 1 to 9 fractional digits, offsets honored.
- Git space-separated dates are refused (`:54`), giving chronology_unavailable (exit 2).
- `scopesEqual` (`:103-111`): path, receipt sha256, and every artifact sha256 must match. Path-only or digest-less scope gives exit 2 (`:80-101`; selftest missing_artifact_digest, missing_receipt_digest, producer_only_match_artifact_unknown). Path reuse therefore cannot produce a positive by path alone.
- Missing started_at gives chronology_unavailable (exit 2) (selftest unknown_clocks).
- Retained W2 against final, through the draft: exit 1, finding review_scope_gap, findings [review_scope_gap, producer_digest_mismatch, artifact_scope_mismatch, acquisition_after_review_observation]. This is the correct verdict (R1).
- Path reuse is real but digest-keyed comparison handles it. corpus/evidence/round-21/runtime holds 25 of 25 bounded bytes at 1b5f449 and 25 of 25 finalized bytes at 2d5eaaa. The canonical swap time is not recorded; the dir-mtime evidence in section 2 is an inference.

## 6. Proposed stable expectations and debt cases (for BuildDebt; not executed)

Draft results are static readings. "Corrected" means under the rules in F1 to F7.

| ID | Input (exact fields, schema and event_history as in section 1) | Expected exit and findings | Draft (static) |
|---|---|---|---|
| R1 | review: 5363d576…, observed 2026-10-21T13:49:02.529912+00:00, upper_bound, scope bounded@1b5f449 (receipt 323ccd59…). acquisition: bc11e4…, started 2026-10-21T13:51:46.597742+00:00, scope final@2d5eaaa (receipt 4bc79636…) | 1; review_scope_gap; producer_digest_mismatch; artifact_scope_mismatch; acquisition_after_review_observation | Same (correct) |
| R2 | review and acquisition both bounded: 5363d576…, scope @1b5f449, acquisition started 2026-10-21T13:07:01.895287+00:00; observed 2026-10-21T13:49:02.529912+00:00 | 0; claims_consistent_at_upper_bound; final_reviewed false | exit 0, label matched_supplied_scope |
| R3 | F1 in-window: bc11e4…, observed 2026-10-21T13:51:50.000000000+00:00, 25 final pins, started 2026-10-21T13:51:46.597742+00:00 | 1; review_scope_gap; artifact_written_after_observation x18; acquisition_not_finished_at_observation | exit 0 (defect) |
| R4 | R3 with observed 2026-10-21T13:52:10.000000000+00:00 | 0; claims_consistent_at_upper_bound; final_reviewed false | exit 0 |
| R5 | F3: observed 2026-10-21T13:51:46.700000000+00:00; final pins; start supplied as wrapper, and again as receipt 2026-10-21T13:51:46.773000000+00:00 | 1 under both starts; review_scope_gap | exit 0 with wrapper (defect); exit 1 with receipt |
| R6 | F4: observed "2026-10-21T11:16:49-03:00", clock_role review_return, final pins, started 2026-10-21T13:51:46.597742+00:00 | 2; clock_source_not_admissible | exit 0 (defect) |
| R7 | F6: event_history [{"seat":"SemanticNaNativeSubmit","type":"failure","status":"failed"}] plus a matched bounded scope | 2; review_not_completed | exit 0 (defect) |
| R8 | String-compare regression: observed "2026-10-21T13:51:46Z", started "2026-10-21T13:51:46.597742+00:00", producer equal, final scope | 1; review_scope_gap (46.000 is before 46.597742) | exit 1 (correct) |

R7 requires the review to carry a seat field (F6). The other cases use the existing input shape.

Proposed vocabulary:
- Exit 1: review_scope_gap, producer_digest_mismatch, artifact_scope_mismatch, artifact_written_after_observation, acquisition_not_finished_at_observation, acquisition_after_review_observation.
- Exit 2: clock_source_not_admissible, acquisition_clock_ambiguous, review_not_completed, digest_not_exact, artifact_write_time_unavailable. Existing: input_shape, chronology_unavailable, producer_digest_unavailable, artifact_scope_unavailable, event_history_unavailable.
- Exit 0: claims_consistent_at_upper_bound (named scope; final_reviewed false; coverage not proven).

## 7. Corrections to wording (for ReviewChronology and CriticReview)

- Replace "review timestamp before finalized acquisition cannot certify final bytes" with: "Timing can refute a claimed artifact (it was written after the observation). Timing cannot certify coverage. Digest identity plus write time not after observation is necessary, not sufficient; the claim stays reviewer-asserted."
- The closure's W2 coverage statement stands: W2 cites none of the finalized digests, and its artifact citations are bounded (25 of 26 exact). Mark the 13:45:46Z clause closure-asserted.

## 8. Limits

- Filesystem mtimes are observations. Copy, touch, and checkout change them. "written_at" here is not attestation.
- The history/ and canonical-parent directory mtimes (about 14:01:12Z and 14:19:31Z) are inferences about moves. A git checkout produces the same signal, so the canonical-path swap time is unknown.
- The draft classifier was read, not run. No selftest result is claimed.
- No seat transcript was read; W2 event ordering is out of scope.
- A sibling draft in w1/ (CriticReview.md) addresses the commit-clock point in F4. Not duplicated beyond verification here.

## 9. Routing (not absorbed)

- Event-history semantics (wake, broadcast, late failure) belong to AttackWakeClasses and ReviewChronology. I report only F6's single-failure gap.
- Closure and LOG wording fixes (F9) belong to the scribes.
- The artifact write-time input source and the draft's gate rewrite belong to BuildDebt, the owner of check-review-chronology.mjs. This report does not edit the clone.
