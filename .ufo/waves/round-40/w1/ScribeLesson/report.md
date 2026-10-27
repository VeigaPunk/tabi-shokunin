# ScribeLesson — round 40 lesson outline (report)

Seat `ScribeLesson` (scribe, leaf, milestone `lesson-draft`, axes coverage + quality), wave
`tabi-r40-w1`, 64 seats. Read time `2026-10-27T19:35–19:37Z` (16:35–16:37 -0300), host `plazir27`.

Item: draft a report-only lesson outline for round 40 recording the pre-data control, the claim,
the opened S145 quote, quarantine-first decisions as they arrive (do not invent), mistake M2 from
round 39's counter self-reference and its prevention, and exact census before/after slots. Do not
edit corpus files or assert a fix until shown to fail.

Deliverables (all new, untracked):

- `.ufo/waves/round-40/w1/ScribeLesson/round-40.md` — the lesson outline (21,116 B).
- `.ufo/waves/round-40/w1/ScribeLesson/report.md` — this report.
- `.ufo/waves/round-40/w1/ScribeLesson.md` — scoped findings summary.
- `.ufo/waves/round-40/w1/ScribeLesson/freeze-check.txt` — digest/timeline/census evidence (74 lines).
- `.ufo/waves/round-40/w1/ScribeLesson/control-round39-replay-v3-observed.txt` — independent replay.
- `.ufo/waves/round-40/w1/ScribeLesson/quarantine-snapshot-2026-10-27T19:35:55Z.txt` — point-in-time
  list of arrived seat verdicts (sha256 `a34993deff87e5ab8640a33d121b37adf513f1fb29fefde75f3578150545faca`).

`corpus/lessons/round-40.md` does not exist and was not written.

## Behaviour (what the outline asserts, and on what evidence)

| Assertion | Basis |
|---|---|
| Freeze is `07e99cf`; its four producer/counter digests equal `claims.json.frozenDigests` | `git show 07e99cf:<path> \| sha256sum` for driver `1f8a15f0…`, wrapper `a0e564c7…`, selftest `5a0b702d…`, counter v3 `0b452eac…`; all four match (`freeze-check.txt`) |
| `claims.json` at the freeze is the current worktree blob | both `sha256 3e304b2c55d03f20aa6b1ad6e8f86ceec80dfa5ec9f41d58ce98f9d55ebe0246`; `git diff` empty |
| Freeze precedes dispatch | freeze 15:58:51 -0300; `w1.ready` 15:59:36.886; pin commit `250a380` 15:59:40; `w1.ready.dispatched` 16:34:07.269 |
| The round-39 receipt is refused with a fresh nonce | independent replay: exit 1, `predicate=false`, `findings=[schema, run-nonce-mismatch, run1-sample-span, run2-sample-span]`; recorded control receipt shows the same four |
| Selftest is 7/7 and its synthetic positive is selftest-only | `.ufo/waves/round-40/controls/c1-measure-selftest-v2.json`: `cases:7, passed:7, failures:[]`; parser positive exit 0; four unavailable-surface mutants and replay refused; wrapper pre-existing-output case exit 1 with `output-already-exists` |
| S145 quote is located in the cited page's retained bytes | `proc_pid_net.html` 17,119 B, sha256 `5e1700ff…`; quote at line 162 inside the `/proc/net/tcp` DESCRIPTION block (heading line 156) |
| M2's numbers are as round 39 recorded, and span ≠ coverage | run1 9 samples span 799 ms / `coverageMs` 1560; run2 8 samples span 701 ms / `coverageMs` 1461; final sweeps +661/+660 ms; receipt has no `runNonce` |
| M2 prevention exists in the frozen counter | v3 `:16` array length ≥8, `:18` non-finite/non-increasing `t` → `sample-order`, `:19` `ts.at(-1)-ts[0] < 1000` → `sample-span`; v3 reads neither `sampleCount` nor `coverageMs` (`grep -c` = 0) |
| C1 admit is **not** observed | `corpus/evidence/round40/` empty; no `measure/` dir under `TabiR40a2`; no seat's item runs the counting command (`ExecLoopbackRun`: “Do not create a round-40 receipt”) |
| Quarantine decisions arrived: 38/38 | snapshot at 19:35:55Z; 38 `ScoutQuarantine*` reports, 29 `VERDICT finding` / 9 `VERDICT ok`; 6 non-quarantine reports also present |
| Census before slot recorded; after slot empty | `census-start.txt` 2,805 B / 21 lines / sha `4b08af72…` / 20 `W04` lines / `tabi ok …corpus/SOURCES.md`; `census-start-exit.txt` sha `29b4976a…` with the exact command and `exit: 0`; `find -iname '*census*'` returns only those two |

## Gates / exact commands and observed output

1. Claim and freeze read:

   ```
   $ git rev-parse 07e99cf1e2f67c5679aa5ba1ccb19a8f59b228e4 a1b1e939048885d2793759b7f49b10c5c820d70d
   07e99cf1e2f67c5679aa5ba1ccb19a8f59b228e4
   a1b1e939048885d2793759b7f49b10c5c820d70d
   ```

   `w1.ready` content: `{"lane":"tabi","round":40,"wave":"w1","dispatch":"…/w1-dispatch.json","l1":"TabiR40a2"}`.

2. Frozen digest check (full output in `freeze-check.txt`): the four `git show 07e99cf:<path> | sha256sum`
   values equal the four `frozenDigests` entries; `claims.json` blob identical at freeze and in the
   worktree (`3e304b2c…`).

3. Independent replay of the frozen counter over the committed round-39 receipt:

   ```
   $ node .ufo/waves/round-40/counters/c1-sample-span-v3.mjs \
       corpus/evidence/round-39/playwright-egress/receipt.json --nonce 5c931ed0…e9c
   {"schema":"tabi-r40-c1-measured-v3", … "nonceMatched":false,
    "predicate":false,
    "findings":["schema","run-nonce-mismatch","run1-sample-span","run2-sample-span"],
    "receiptSha256":"e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493"}
   exit=1
   ```

   Transcript: `control-round39-replay-v3-observed.txt`.

4. Round-39 receipt arithmetic (`python3`, read-only over committed bytes): spans 799/701 ms,
   `coverageMs` 1560/1461, final-sweep lag 661/660 ms, `egressNonLoopback 0`, `survivors 0`,
   `portClosed true`, `browserVersion 157.0`, **no `runNonce`**.

5. Counter/source inspection confirming the self-reference and its removal:

   ```
   $ grep -n 'coverageMs\|sampleCount' .ufo/waves/round-39/counters/c1-egress-session-bound.mjs
   69:  … r.sampleCount < 8 …
   110: if (typeof r.sampleCount !== 'number' || r.sampleCount < 8) F(`${tag}-samples`, …)
   111: if (typeof r.coverageMs !== 'number' || r.coverageMs < 1000) F(`${tag}-coverage`, …)
   $ grep -n samples .ufo/waves/round-39/counters/c1-egress-session-bound.mjs
   21://  … comment …   31: … predicate sentence …   (no data read)
   $ grep -c 'sampleCount\|coverageMs' .ufo/waves/round-40/counters/c1-sample-span-v3.mjs
   0
   ```

6. Wrapper/driver binding surface (read, not executed): wrapper `:13` refuses an existing `--out`;
   `:16` `crypto.randomBytes(32).toString('hex')` nonce; `:18` spawns the driver with
   `--round40 --runs 2 --out --scratch --nonce`; `:21` requires `receipt.runNonce` and every
   `runs[i].runNonce` to equal the nonce; `:23` scores that exact file; `:27` exit 0 only when
   `driverExit===0 && counterExit===0 && predicate===true`. Driver `:372` independently requires
   `--round40 --scratch`, 64-hex `--nonce`, `runs===2`, `!existsSync(out)`.

7. S145 bytes (retained artifact; **no refetch** — external interaction is out of scope):

   ```
   $ sha256sum .ufo/waves/round-40/sources/proc_pid_net.html ; wc -c
   5e1700fff5cbaf4a1875387f6052cc0b2f35694fc25bc051c23b8f4de55f726f  …
   17119
   $ grep -n rem_address .ufo/waves/round-40/sources/proc_pid_net.html
   162:  The "rem_address" is the remote address and port number
   ```

   Tag-stripped whitespace-collapsed text locates the full sentence at offset 3,810; its whitespace
   token count is 12, while `S145-open.txt` and `ConnSourcePattern` say 11.

8. Census (“before”) facts: command
   `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`,
   `exit: 0`, 20 `W04` duplicate-url lines + 1 `tabi ok` line (21 lines, 2,805 B, sha `4b08af72…`).
   Provenance: output added by `cb35339` (15:28:38 -0300, a superseded freeze); the exit record was
   added by `f8e89d7` (16:02:05 -0300), **after** the final freeze.

9. Quarantine snapshot: `ls -d */` + per-seat first `^VERDICT` line, one shell pass at 19:35:55Z,
   written to the snapshot artifact. At that instant 44/64 seats had `<seat>/report.md`; all 38
   quarantine seats were present (29 finding / 9 ok); 20 seats had none, including `ExecDriverBuild`,
   `ExecLoopbackRun`, `ExecCounterReplay`, `MutSpanCases`, `CritSamplingGap`, `RevCounter`.

10. Absence of a live measurement: `find corpus/evidence/round40 -maxdepth 3` → the directory only;
    `/fast/scratch/hyaku/tabi-r40/TabiR40a2/` → `counter-selftest/`, `selftest-redgreen/` only.

## Conflicts (verbatim, for the canonical judge)

- `claims.json`: “S145 (proc_pid_net(5), reopened 2026-10-27; DESCRIPTION /proc/net/tcp), cited by
  the round-40 receipt and lesson Gate.” — versus `w1/ScoutQuarantine145/report.md`:
  “VERDICT finding S145 (tabi round3, draft-ietf-httpbis-rfc6265bis-13): source fetched OK
  (200, 146976 B); quotes "Common CSRF weaknesses and protection mechanisms" and "Limitations of
  SameSite" ABSENT” and versus `assimilation/quarantine-slice:23` “S145 `payload-absent`”. The same
  id names three different things (C1 source label, tabi register row, kumitate register row).
- `w1/ScoutQuarantine102/report.md`: “VERDICT finding S102 … payload-absent confirmed: source
  opened (HTTP 200), exact quote absent” — versus `w1/ScoutQuarantine130/report.md`: “VERDICT ok
  S130 absent: cited source opened (HTTP 200, 6541 bytes), exact quote not present; payload-absent
  confirmed”. Same classification, different verdict token; likewise S135 (`finding`) vs S138
  (`ok`). The 29/9 split therefore cannot be read as a defect count.
- `S145-open.txt`: “quote: … (11 words)” — versus the located sentence's whitespace token count of
  12; `w1/ConnSourcePattern/report.md` repeats “verbatim 11-word quote”.
- `w1/CritNoOp/report.md`: “VERDICT ok — no do-nothing path (round-39 reuse, relabel, coverageMs
  edit, arbitrary JSON, pre-existing --out) is admitted by the measured command” — versus
  `w1/CritSurfaceGaps/report.md`: “VERDICT finding C1 counter accepts availability without
  observation: ticks is hardcoded 1, ss.lines/proc.inodes never scored…”. One tests path admission,
  the other tests observation sufficiency; both are quoted unchanged.
- `w1/ConnSourcePattern/report.md`: “S145 correctly scopes the `/proc/net/tcp` remote-address/port
  field …, but the frozen C1 citation supports only that clause” — versus `claims.json`'s source
  line implying the citation grounds the C1 observations; the outline records the narrow scope and
  does not widen it.

## Touched surfaces

- Written (new, untracked, inside the seat's report directory):
  `w1/ScribeLesson/round-40.md`, `report.md`, `freeze-check.txt`,
  `control-round39-replay-v3-observed.txt`, `quarantine-snapshot-2026-10-27T19:35:55Z.txt`, and
  `w1/ScribeLesson.md`.
- Read only: `claims.json`; the four frozen producer/counter/selftest files; `.ufo/waves/round-40/`
  controls, counters, sources, measure, assimilation, plan/spec/dispatch/registry;
  `corpus/evidence/round-39/playwright-egress/receipt.json`; `w1/*/report.md` (verdict lines);
  `LOG.md`/`SCORECARD.md` diffs since the freeze; git history (read-only `git show/log/rev-parse`).
- Not written: `corpus/lessons/round-40.md`, `corpus/SOURCES.md`, `SCORECARD.md`, `LOG.md`, any
  claim, counter, driver, selftest, wave spec/plan/dispatch/registry, any evidence receipt.
- Git: no add/commit/push, no `jj`. No repository mutation of any kind.
- Scratch: `/fast/scratch/hyaku/tabi-r40/ScribeLesson/` used for the replay only and removed before
  yield; no other scratch path created. No browser launched; no fixture port opened; no external
  fetch performed.
- Tools installed: none (RULES.md read earlier in this session's tooling directive; pacman not run).

## Findings

1. **The freeze is intact and pre-data.** `07e99cf` carries the four digests it names, the claims
   blob is unchanged in the worktree, and every dispatch marker (15:59:36, 15:59:40, 16:34:07)
   postdates the freeze (15:58:51 -0300).
2. **The Gate admit slot is empty, by wave design.** The measured command has not been invoked; the
   evidence directory is empty and no seat is assigned to run it. Any lesson text that reads
   “capability acquired” would be unsupported.
3. **The reject arm is live and reproduced.** Replaying the round-39 receipt under a fresh nonce
   exits 1 with `schema`, `run-nonce-mismatch`, `run1-sample-span`, `run2-sample-span`; the recorded
   control and the wrapper selftest agree.
4. **M2 is correctly characterized and its prevention is present in bytes.** Round 39 adjudicated
   coverage on `sampleCount`/`coverageMs` (self-reported, tail-inclusive; 799/701 ms observed vs
   1560/1461 ms claimed); v3 derives first-to-last span from the sample array and no longer reads
   either summary field, and the round-39 receipt is the red arm.
5. **The prevention has a stated residual, not a defect claim.** Sample timestamps are still
   producer-written; the selftest's synthetic positive (fabricated `t`) passes the counter, so the
   anti-synthetic barrier is the wrapper's fresh nonce and exclusive output path, not the span term.
6. **Quarantine decisions arrived completely (38/38) but are not uniformly expressed.** 29 `finding`
   / 9 `ok`; the same classification appears under both tokens, so the outline reports rows, not a
   count.
7. **Two provenance gaps in supporting artifacts**: the S145 quote's “11 words” is 12 by whitespace
   token count; the census “before” exit code was recorded 3 min after the final freeze while the
   census output predates it.
8. **The id `S145` is overloaded** across the C1 source label (man page), the tabi register row
   (cookie draft) and a kumitate row, and the lesson outline must qualify it every time.

## Limitations

- The quarantine snapshot is point-in-time and moves fast: successive reads during this seat showed
  37 → 43 → 44 reported seats within minutes. Only the 19:35:55Z snapshot is asserted.
- The selftest 7/7 is recorded evidence in `.ufo/waves/round-40/controls/c1-measure-selftest-v2.json`;
  this seat did not re-execute it (it spawns driver/wrapper paths outside a scribe's remit).
- The round-39 numbers are arithmetic over committed bytes, not over a live capture.
- `S145` was not refetched (no external interaction in scope); only the retained 17,119 B artifact
  was checked, so the fetch's HTTP status is taken from `S145-open.txt`, not re-observed here.
- No judgement is made on C1's satisfiability, on the concurrent seats' findings, or on whether the
  producer-timestamp residual is acceptable; those are the canonical judge's calls.
- `corpus/lessons/round-40.md` was deliberately not created: the item is report-only.

VERDICT finding — report-only round-40 lesson outline written at `.ufo/waves/round-40/w1/ScribeLesson/round-40.md`; freeze `07e99cf` and its four digests verified, the reject arm reproduced independently (exit 1, 4 findings), the admit arm is unobserved (empty `corpus/evidence/round40`, no `measure/` scratch, no seat assigned to run the counting command), M2 is recorded with the exact 799/701 ms vs 1560/1461 ms numbers and its v3 span-from-samples prevention plus the producer-timestamp residual, the S145 quote is located in the retained artifact (12 tokens, artifact says 11), quarantine decisions arrived 38/38 (29 finding / 9 ok) with inconsistent verdict tokens and an overloaded `S145` id, census before slot recorded (exit 0, 20 W04) and after slot empty.
