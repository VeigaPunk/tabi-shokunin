# ScribeLesson — round 40 (scoped findings)

Seat `ScribeLesson` (scribe, leaf, milestone `lesson-draft`), wave `tabi-r40-w1`.
Full report: `.ufo/waves/round-40/w1/ScribeLesson/report.md`.
Lesson outline (report-only): `.ufo/waves/round-40/w1/ScribeLesson/round-40.md`.
`corpus/lessons/round-40.md` was not created.

## What was produced

- `round-40.md` — outline with Gate admit/reject slots, pre-data controls, frozen claim and digests,
  the opened S145 quote, M2 and its prevention, quarantine snapshot, exact census before/after slots,
  verbatim conflicts and a “what still needs evidence” list.
- `freeze-check.txt` — the commands and outputs behind every digest, timestamp and census figure.
- `control-round39-replay-v3-observed.txt` — independent replay of frozen counter v3 over the
  committed round-39 receipt under a fresh 64-hex nonce.
- `quarantine-snapshot-2026-10-27T19:35:55Z.txt` — point-in-time verdict lines for the arrived seats
  (sha256 `a34993deff87e5ab8640a33d121b37adf513f1fb29fefde75f3578150545faca`).

## Established by observation

1. Freeze `07e99cf1e2f67c5679aa5ba1ccb19a8f59b228e4` is the operative pre-data freeze (15:58:51
   -0300); the four `frozenDigests` match `git show 07e99cf:<path>` byte-for-byte, and the claims
   blob is unchanged in the worktree (`3e304b2c…`). `w1.ready` (15:59:36), the pin commit `250a380`
   (15:59:40) and `w1.ready.dispatched` (16:34:07) all postdate it.
2. Reject arm reproduced: counter v3 over `corpus/evidence/round-39/playwright-egress/receipt.json`
   with a fresh nonce → exit 1, `predicate=false`,
   `findings=[schema, run-nonce-mismatch, run1-sample-span, run2-sample-span]`, receipt
   `e894f1d5…`. The recorded control receipt carries the same four findings.
3. Admit arm unobserved: `corpus/evidence/round40/` is empty; `TabiR40a2` scratch has no `measure/`
   dir; no seat's item runs the counting command (`ExecLoopbackRun`: “Do not create a round-40
   receipt”). No capability row may be drafted.
4. M2 (round-39 counter self-reference): the round-39 counter read `r.sampleCount`/`r.coverageMs`
   (`c1-egress-session-bound.mjs:110-111`) and never the sample array, while the committed receipt
   shows run1 9 samples spanning 799 ms vs `coverageMs` 1560 and run2 8 samples spanning 701 ms vs
   1461 (final sweeps +661/+660 ms). Counter v3 instead derives `ts.at(-1)-ts[0]` (`:19`), requires
   strictly increasing finite timestamps (`:18`) and array length ≥8 (`:16`), and reads neither
   summary field (`grep -c` = 0). The round-39 receipt is the red arm and fails exactly on those two
   span findings.
5. M2 residual: `t` is still driver-written; the selftest's synthetic positive fabricates `t` values
   and passes the counter, so the anti-synthetic barrier is the wrapper's fresh nonce plus exclusive
   output path (`measure-c1-round40.mjs:13,16,18,21-23`), not the span term alone.
6. S145: the quote “The "rem_address" is the remote address and port number pair (if connected).”
   is located at line 162 of the retained page (`proc_pid_net.html`, 17,119 B, sha256 `5e1700ff…`);
   its scope is the TCP remote-endpoint field only. The artifact's “11 words” is 12 by whitespace
   token count.
7. Quarantine: at 19:35:55Z all 38 quarantine seats had reports (29 `VERDICT finding`, 9 `VERDICT
   ok`), plus 6 non-quarantine reports; 20 seats had none. The verdict tokens are used
   inconsistently (S102/S130; S135/S138 confirm the same class under different tokens), so the split
   is not a defect count.
8. Census before slot: command `…/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`,
   `exit: 0`, 20 `W04` duplicate-url lines + `tabi ok …corpus/SOURCES.md` (2,805 B, sha
   `4b08af72…`); the exit record (sha `29b4976a…`) was added by `f8e89d7` at 16:02:05 -0300, after
   the freeze. After slot: no `census-end*` file and no declared path — recorded empty.

## Conflicts recorded verbatim (not resolved here)

- `S145` names three different things: the C1 source label (proc_pid_net(5)), the tabi register row
  (rfc6265bis-13, `payload-absent`, `assimilation/quarantine-slice:23`) and a kumitate row.
- Verdict-token inconsistency (`ok` vs `finding` for the same payload-absent confirmation).
- “11 words” vs the 12-token quote.
- `CritNoOp` (“no do-nothing path … admitted”) vs `CritSurfaceGaps` (“accepts availability without
  observation”) — distinct questions, both quoted unchanged.

## Limits

No live browser, no refetch, no corpus/claim/counter edit, no git mutation, no tool installs, no
scratch retained (`/fast/scratch/hyaku/tabi-r40/ScribeLesson/` removed). Selftest 7/7 is recorded
evidence, not re-executed. Snapshot is point-in-time (reported-seat count moved 37→43→44 within
minutes).

VERDICT finding — outline and evidence written; freeze/digests verified, reject arm reproduced, admit arm unobserved and recorded as empty, M2 prevention documented with its producer-timestamp residual, S145 quote located with a word-count discrepancy and an overloaded id, quarantine 38/38 with inconsistent verdict tokens, census before recorded and after empty.
