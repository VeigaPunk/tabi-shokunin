# Critic C2 — operability

## Verdict

**Do not present all three as newly repaired runtime-operability defects.** At B, the *round-18 counter* does not establish the new predicates: H1 only asserts SIGTERM, H4 lacks the required any-new-file and nonce/replay checks, and F6 checks only `--rev HEAD` exit status. But the round-18 artifact already has substantial runtime behavior for H1 and F6. The evidence supports one clear behavior defect (H4), one stricter but incompletely measured lifecycle guarantee (H1), and one largely measurement/reason-reporting expansion (F6). A counter-only increase is calibration/assurance coverage, not a change in the behavior being measured; the new producer can count as operability only to the extent it changes fail-closed behavior in the normal run path and is actually used as that gate.

This is not a blanket claim that H1 or F6 meet every new predicate: the exact PID-set condition and reason-token protocol are unproven at B. It is a warning against converting “counter did not test it” into “runtime behavior was broken.”

## Gap-by-gap attack

| Gap | What B / round 18 already shows | Assessment of the proposed 0→3 claim |
|---|---|---|
| **G-H4: arbitrary artifacts + replay binding** | Round-18 H4 exercised a real `WebMCP.invokeTool`, recorded a completed response and a settled Playwright refusal, and scanned the run/process temp trees for the generated marker bytes. But the producer's scan is content-based (`scanForBytes`), not a before/after file inventory. A newly created empty or non-marker `<uuid>` file under `processTmpDir/playwright-artifacts-*` leaves those scans clear; the counter's separate `downloadedFiles` check filters by the suggested basename. The receipt's marker prefix/hash are not bound to a counter-fresh nonce or to the same invocation/event; the round-18 spot-check explicitly says a pasted record with real browsers passes. | **Genuine red behavior gap** for the exact any-new-file and replay predicates. The existing successful H4 receipt proves the basic refusal path, not these stronger properties. This is the one unambiguous operability change if the successor makes the producer reject those shapes and its counter proves it. |
| **G-H1: SIGINT/SIGHUP + live owned PID set** | The R18 producer registers SIGINT, SIGTERM and SIGHUP handlers that await cleanup; the R18 harness report records all three signal runs after a case line with exit 2, no receipt, and empty TMPDIR. The R18 counter, however, asserts H1 only for SIGTERM; its SIGINT run is a weaker H2 cleanup check, and it never probes SIGHUP. Neither the H1 counter predicate nor the cited harness report shows the required *non-empty run-owned Chromium PID set before signal and empty after*. | **Counter predicate is red/untested at B; runtime signal handling is already implemented and reported working.** The added SIGINT/SIGHUP probes alone are measurement coverage. The PID-set guarantee may still expose a real defect, but it needs direct before/after process evidence; empty TMPDIR is not equivalent to no surviving run-owned Chromium PID. |
| **G-F6: refusal set + reason token** | The existing witness accepts only a full 40-hex `--rev` and checks ancestry to `refs/heads/master`; its self-test covers `HEAD`, a short hash, and an off-branch hash. The old C2 counter tests only `--rev HEAD` and checks status 2. `@` and `master` are rejected by the same strict regex **[INFERENCE from source, not separately executed]**. The witness currently emits the generic `finding=witness_revision_refused` plus human-readable `detail`; it does not define the plan's named `symbolic_rev` / `short_rev` / `off_branch` reason-token table. | **Refusal behavior for the listed shapes is mostly pre-existing; the expanded matrix is measurement coverage.** If stable, distinct reason tokens are part of the acceptance contract, adding them to the witness is an observable diagnostics change and should be tested as such; otherwise don't count broader assertions as a runtime rejection fix. |

### Evidence anchors

- H4 source: `webmcp-invoke-round18.mjs:745-783, 2685-2735`; counter: `measure-c2.mjs:758-816`. Its counter requires a single suggested-filename match check at `:804-815`; the producer only scans contents for marker bytes at `:745-783`.
- H1 source: producer `webmcp-invoke-round18.mjs:512-540, 3002-3016`; counter probe wiring `measure-c2.mjs:1085-1090`, predicate `:716-727`, and its weaker SIGINT gate `:730-743`.
- F6 source: witness parser/refusal `freshness-witness.mjs:10, 113-149, 275-285`; existing self-test `:182-186, 231-238`; counter `measure-c2.mjs:885-909`.
- Existing R18 report states: “For all three: exit 2, no receipt, empty fresh TMPDIR” [S2, `§H1`, lines 33–44]. The same report does **not** claim this is a PID-set snapshot.
- The round-18 independent spot-check records the H4 replay weakness and the H1/F6 predicate gaps: [S1, `Routed defects` lines 149–157]. The receipt's H4 case is a passing real invocation/refusal with marker-only before/after scans [S6, lines 7883–7968].

## Counter-detection counterexample

**Yes.** A successor can inspect its invocation environment/arguments and the visible counter nonce, detect `measure-c2`, then take a test-only path: emit the expected case/receipt fields, spawn an idle Chromium with the expected profile/argv (for H1), and handle the injected signal cleanly. For H4 it can echo the current nonce and a canned refusal record without invoking the WebMCP tool; a fresh nonce prevents an *old* receipt replay but does not authenticate a current-run echo from the artifact being tested. For F6 it can special-case the five literal values and print the expected reasons while accepting other unsupported symbolic forms. Producer SHA binding proves which bytes ran; it does not prove those bytes performed the claimed operation.

The planned nonce and a counter-planted UUID file are useful freshness/mutation probes, but the counter must verify the *producer's own observed rejection* and independent event/process/file evidence. It must not award closure merely because its own filesystem scan saw the planted file or because the producer returned a counter-shaped boolean.

## Falsifiers and smallest safe correction

1. **H4 file mutant:** put an empty/non-marker file at a fresh random `<uuid>` name inside the exact run-owned `processTmpDir/playwright-artifacts-*` tree, with no suggested-name file. Old R18's marker scan and filename-only counter filter do not reject this shape. Round 19 must fail the case because the producer's before/after inventory found the new file; counter-only detection is insufficient.
2. **H4 replay/counter-aware mutant:** use a real browser process but skip `WebMCP.invokeTool`, then return a prior refusal record or echo the current `TABI_RUN_NONCE`. The counter must reject absent current invocation/response/download linkage. Add a mutant that branches on the counter's process argv or nonce env and emits plausible receipt fields; it must not earn green merely from those fields.
3. **H1 idle-browser mutant:** print the first case line, launch an idle Chromium with a run-marked profile, and exit 2 on SIGINT/SIGHUP without producing a receipt. Require independent observation of a non-empty run-owned PID/start-time/executable set before each signal and that same set absent afterward, as well as exit 2 / `run_aborted` / no pass-fail receipt. This distinguishes live cleanup from a line-and-process imitation.
4. **F6 special-case mutant:** reject only the five fixed strings and emit the planned tokens, but accept a fresh short-hash variant or another symbolic selector; retain a known full-hash ancestor as a positive control. For listed cases, check the actual stdout/stderr reason token, not just exit 2 or source text.
5. **Claim accounting:** keep H4 as an operability repair only if the artifact itself detects the file and binds the event to the fresh run. Count H1/F6 probe expansion as calibration unless the stronger PID guarantee or reason-token behavior changes in the tested artifact. If the plan's intended outcome is specifically verifier-operability, say so and require the counter to be the fail-closed gate that prevents accepting these mutants.

## Source ledger

All quoted material below is from local, read-only round-18 sources; `file://` URLs identify the exact decoded file body, accessed 2026-10-21. Hashes are SHA-256 of that body.

- **S1** `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/lessons/round-18-verifier-spotcheck.md` — SHA-256 `0cfc40c6999a3ff8ed34e27c22cd8afbc25eeb0abadb2d4e3620a749b4a300e4`. Quotes: “H4's download scan matches only the suggested filename” (lines 149–152); “H1 checks SIGTERM but not the SIGINT/SIGHUP cases its plan names” (lines 153–154); “F6's counter tries only the literal --rev HEAD and checks the exit code, not the refusal reason” (lines 154–155).
- **S2** `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/C2Harness.md` — SHA-256 `25b4f0c27815cec1c3970308f5279d31da8efea8d2fc3beb69e2bcb908882e06`. Quote: “For all three: exit 2, no receipt, empty fresh TMPDIR” (`§H1`, lines 33–44).
- **S3** `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/webmcp-invoke-round18.mjs` — SHA-256 `d1443344c745a3e60417e19edf3d173054e085b912fa0ba1b58943d407896baa` (also matched `git show B:<path>`). Quote: `for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {` (lines 3002–3015).
- **S4** `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c2.mjs` — SHA-256 `99ad9ff7ca664eaa3e64948308a53d1827e34983ce874c8b26f6e5dc6a49e4dc` (also matched `git show B:<path>`). Quote: `h1.signalName === 'SIGTERM'` (lines 716–727).
- **S5** `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/freshness-witness.mjs` — SHA-256 `a348912911ce63577147b4b4610ce88fa73cba888d888d158b092a74db8ecad1` (also matched `git show B:<path>`). Quote: `refused('--rev requires a 40-hex commit revision')` (lines 113–123).
- **S6** `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/webmcp-invoke/receipt.json` — SHA-256 `43b3711eba135b6558df595637435acb0d3500519317bfeaa285da805af2e376`. H4 receipt case and its observed scan fields: lines 7883–7968.

Read-only source/evidence inspection and body hashing only; no harness probe, build, or test suite was run. No tools installed or updated.

## Isolation

- Report-only seat; no production file, clone, branch, or commit.
- Sole lane write: `.ufo/waves/round-19/w1/CriticC2Operability.md`.