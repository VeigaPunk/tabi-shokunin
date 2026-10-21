# CriticRetrospect: can final statuses certify historical W1 wake completeness?

Seat: `TabiR22.CriticRetrospect` (leaf critic, read-only). The only file written is this report. No production, lane VCS, clone, fleet or round-21 file was modified. No build, test, linter, smoke, browser, network or REA action was run. No seat was messaged or revived, and no tool was installed or updated.

## Verdict

No. Final statuses cannot certify historical W1 wake completeness. The retained evidence holds three separate facts for each seat:

- the first terminal failure notice;
- the events observed later in its transcript;
- its final observed turn.

These three facts contradict each other for 47 of the 64 W1 seats. The transcripts are also not committed to the lane and are mutable. So the round-22 correction may change the *report* of round 21. It may not change round-21 *history*, and it may not claim certification. The acceptance boundary is defined below.

## Evidence sources (all read-only)

- Round-21 W1 artifacts at baseline `5f585773258b33d2d514b00cd0b0775333578db6`, all under `.ufo/waves/round-21/`: `w1-failures.json`, `w1-returns.json`, `peer-revival.json`, `w1-task-result.json`, and `w1/*.md`.
- Admitted closure: `.ufo/waves/round-22/round21-closure.json`, field `verification.wave_conformance_debt`.
- Round-22 design:
  - `.ufo/waves/round-22/w1-spec.json` items `BuildDebt`, `ScribeDebt`, `WakeHistory`, `AttackWakeClasses`;
  - `LOG.md` lines 1495–1521.
- Per-seat transcripts. These live **outside the lane** and are uncommitted:
  `/home/vgpnk/.omp/agent/sessions/-Projects-shokunin/2026-10-21T03-31-39-302Z_01a15c83-baa6-76c9-b209-ce1123c6cc22/TabiR21/TabiR21.<Seat>.jsonl`
- Observation pin for the 64 W1 seat transcripts: 64 files, 44,447,017 bytes in total. To reproduce the set digest, sort lines of the form `sha256 seatname` by seat name and hash them. The result is `170ae90c179d92a1d4617a96128d0d8b37dda4ab486980383ea21454d3a0e0c2`. The latest event and file modification time are both `2026-10-21T13:19:45.70xZ`. No event falls after the closure time of 14:44:47Z.

## Counterexamples

The falsifiers below come from read-only parsing of the transcripts named above.

### F1. Final status reverses the first-terminal failure

Of the 32 seats in `w1-failures.json` `originalFailedSeats`, 15 end with a normal `stopReason:"stop"` turn. Only 17 end in `error`.

Fourteen of those 15 seats wrote and committed a report file. The 14 seats are:

- BuildCounter
- RevCase06 and RevCase09
- ReviewCountMeaning, ReviewFlags, ReviewFreshContext, ReviewNonce, ReviewPriorHistory, ReviewSourceLink and ReviewThrow
- SrcEventDocs
- SrcForm05, SrcForm07 and SrcForm15

Their report files are `.ufo/waves/round-21/w1/<Seat>.md`, all added in commit `1b5f449` (`2026-10-21T10:19:28-03:00`). The fifteenth seat, BuildRuntime, ended with `stop` but wrote no report.

Example: `ReviewCountMeaning` hit Zai exhaustion by 12:42:39. It received the Main broadcast at 12:43:47, made a tool call at 12:44:39, and finished with `stop` at 12:50:12 after writing a report.

**Consequence.** A classifier based on final status would mark these seats as completed. That silently overwrites the first-terminal failure fact.

### F2. Final status also misses failures

Eleven seats that are **not** listed as failed contain `Retry budget exhausted` events. All 11 occurred after the 12:43:47 broadcast. The seats are SrcForm09, SrcForm13, SrcForm14, SrcFlags, ReviewRawInvoke, ReviewPending, ReviewCleanup, ReviewInvalid, ReviewBinding, RevCase08 and RevCase10. All of them end with `stop`.

Separately, 29 non-listed seats have at least one assistant turn that ended in `error`. Most of these were superseded by automatic retries.

**Consequence.** Neither "final status" nor "has any error" equals the first-terminal list. Classifying on the presence of an error over-counts failures. Classifying on final status under-counts them.

### F3. Exit records cannot tell success from failure

There are 66 `session_exit` records across the 64 seats, and every one is `kind:"normal", reason:"dispose"`. This includes the 7 critics that only ever errored.

Exit count does not identify revival either:

- `BuildCounter` and `BuildSelftest` have two exits each.
- `BuildRuntime` was revived (per `peer-revival.json`) but has only one exit, at 13:16:41.
- The 13 other listed-failed seats woken by Main's broadcast or peer messages each have one exit.

### F4. Failure wording varies

`ScribeLessonInputs` failed with a Haiku `429 rate_limit_error` (`retry-after-ms`). Its transcript contains no `Retry budget exhausted` string.

**Consequence.** A classifier that matches failures by a text pattern drops this seat.

### F5. The returns snapshot was taken before the wave went quiet

`w1-returns.json` `readAt` is `13:15:40.534Z`. Four seats have events after that time:

| Seat | Last exit |
|---|---|
| BuildRuntime | 13:16:41 |
| BuildCounter | 13:16:52 |
| ReviewFreshContext | 13:17:13 |
| ReviewBinding | 13:19:45 |

The `latestOutput` field in that file is empty for 13 of the 14 listed-failed seats that later wrote reports. Only BuildCounter is non-empty. So `latestOutput` is not the final output.

Commit `1b5f449` (13:19:28Z) also came before ReviewBinding's last exit at 13:19:45Z.

None of the 13 late reports from listed-failed seats other than BuildCounter is cited by the filed report `/home/vgpnk/Projects/shokunin/.ufo/reports/round-21/tabi.md` or by any lane `*.md` file. A grep for those file names returned zero matches.

**Consequence.** No credit was taken for them. They sit in committed history with no recorded disposition.

### F6. A seat's model route changed mid-life

The Main broadcast at 12:43:47 reached 55 W1 seats. Its text says the routing change "applies to FRESH seats; already-running seats keep their captured routes". However:

- `ReviewCountMeaning` logs a `model_change` from `zai/glm-5.3-flash` to `openai-codex/gpt-6-luna` at 12:45:18.
- `SrcCdpContract` logs the same change at 12:49:11.

**Consequence.** The per-model groups in `w1-failures.json` reflect the *first-terminal* model only. A seat does not have a single model identity across its life.

### F7. Completeness cannot be proven from this evidence

The transcripts are outside the lane, uncommitted and unhashed in any lane artifact. A future wake would append to them.

The absence of events after 13:19:45Z is true only as of when this observation was made. Events that never reached a transcript cannot be seen at all, for example harness-level delivery failures. Round-22's own rules forbid waking these seats to test this.

Counts also depend on definitions. For example, I count 23 listed-failed seats receiving the Main broadcast, while the closure counts "24 failed seats show post-broadcast activity". Both can be correct under different definitions. Neither proves completeness.

## Impacted axes

- **Calibration and discernment.** If round 22 lets a final or latest status stand in for first-terminal failure, or reports a wake history as "complete", that is false provenance and premature saturation.
- **Adjacency and no-harm.** Rewriting `w1-failures.json`, `w1-returns.json`, `peer-revival.json`, the round-21 report, the closure, or round-21 LOG and lesson bytes would rewrite history.
- **Depth (C1).** Unaffected only if the debt correction stays out of the C1 count. The debt classifier must not contribute rows or credit.

## Acceptance boundary for the round-22 W1 correction

### What the correction may claim

1. Per seat, three **distinct** fields:
   - `first_terminal`, sourced from `w1-failures.json` and the task-result notices;
   - `observed_events`, ordered and timestamped, sourced from the transcript;
   - `final_observed_turn`, which is `stop`, `error` or `absent`.
   The correction must never collapse these into one status.
2. Every transcript-derived number must state its definition and an `observedAt` time. It must also carry pins: either the 64-file set digest above or a fresh one taken at observation time.
3. The wording "observed through `<time>`; completeness unavailable" for wake and event history.
4. The 13 late reports from listed-failed seats other than BuildCounter (in `w1/`, committed in `1b5f449`) may be listed as "uncredited late output after first-terminal failure; not a wave return, not a review". BuildCounter is already covered as uncredited in `peer-revival.json`.

### What must cause rejection

- Any of these words applied to W1 history: `complete`, `certified`, `quiescent`, `all wakes`, `authenticated`.
- Any listed-failed seat counted as a completed or credited review because of its final status or late report.
- Any single-status-per-seat output, or a "latest observed" field that replaces `first_terminal`.
- Byte changes at round-22 HEAD to any of these, compared with `5f58577`:
  - the round-21 files `w1-failures.json`, `w1-returns.json`, `peer-revival.json`, `w1-task-result.json` and `w1/*.md` under `.ufo/waves/round-21/`;
  - the round-21 portions of `LOG.md`;
  - the round-21 lesson.
- Transcript-derived counts given without pins and an `observedAt` time.

### Selftest requirements for the BuildDebt classifier

`check-review-chronology.mjs --selftest` must include fixtures for the cases the current item list does not name. Each must produce a distinct, non-certifying finding with exit 1, or exit 2 when evidence is unavailable:

| Case | Example seat |
|---|---|
| (a) Failed seat produces a late report or `stop` turn | ReviewCountMeaning |
| (b) Non-listed seat with an exhaustion event that recovers | SrcForm09 |
| (c) Failure text without `Retry budget exhausted` | ScribeLessonInputs |
| (d) Returns `readAt` earlier than the last exit | `w1-returns.json` |
| (e) Model change partway through a seat's life | ReviewCountMeaning |
| (f) Only `normal` exit records on a failed seat | any of the 7 critics |

Absent history must stay `unavailable` and must never be reconstructed.

## Smallest safe correction

Add an append-only round-22 debt record and a matching append to the `LOG.md` round-22 section. The record carries the three-field-per-seat facts, the transcript pin and observation time, the F1–F6 class names, and the explicit line "completeness unavailable; not certified".

Leave all round-21 artifacts byte-identical. The debt classifier must contribute nothing to C1 `value`.

## Limits

- The BuildDebt clone `.ufo/waves/round-22/clones/BuildDebt` was still at `5f58577` when read, with no `check-review-chronology.mjs` or `debt-expectations.json` present. I therefore reviewed the design, not an implementation.
- I did not read `history://`. I read the transcripts directly from disk.
- The counts above come from my own parsing under the definitions stated in each section. No selftest or classifier was executed.
