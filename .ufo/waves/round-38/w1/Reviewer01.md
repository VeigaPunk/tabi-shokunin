# W1-01 — Reviewer01

## Findings

### High — C1 D6 accepts the wrong round-start baseline

`claims.json:5-6` freezes round 38 at baseline `98239d0396ff32c3feb14638b3214fe688e8b122`; this is also the parent of the frozen claim commit `a8e7d50`. But `counters/c1-routed-defects.mjs:52` hardcodes `BASELINE = 3f42a5c7cc19a544c879577e4bad7b7fd9d61a35`. D6 uses that constant (`:219-222`) and only tests that its hash and `REV` occur somewhere in the receipt; it does not parse or compare the actual `baseline..REV` endpoints. This contradicts the counter's D6 contract (“baseline equals the frozen round-start baseline,” header lines 27-30) and claims' round-start baseline. A correct receipt whose window is `98239d..REV` is rejected unless it also mentions `3f42a5c`; conversely a receipt with a different actual window can pass by mentioning both strings elsewhere. Falsifier: commit a receipt with an actual `98239d..REV` numstat header and run the frozen counter at that REV; D6 will still key off `3f42a5c`.

### Medium — C1 D1 does not check for a w2 seat directory

The counter header says D1 re-derives absence of `w2.ready`, `w2-results.json`, **and a `w2/` seat dir** (`counters/c1-routed-defects.mjs:14-18`). The implementation checks only the two marker files (`:96-100`); it never inspects the tree for `.ufo/waves/round-37/w2/`. A REV containing w2 seat reports but no ready/results markers still yields `d1.w2Absent === true`. Falsifier: add a w2 report directory while leaving those two files absent; the D1 absence test will not detect it.

### Medium — C1 D4 red-control receipt is not bound to a mutation/run

`counters/c1-routed-defects.mjs:168-174` treats any parseable JSON with `exit: 1`, `exit: 2`, `refused: true`, or `killed: true` as proof that the mutated sentence was refused. It checks no mutated sentence, runner/command, input digest, or output evidence. Thus a fabricated `m3-sentence-mutant.json` containing only `{"exit":1}` satisfies `d4.mutantRefused` without executing the red control. The claimed D4 evidence should be falsifiable from a bound mutation/run receipt, not an unbound status flag.

### Medium — C2 egress receipt misses UDP and connections between samples

The Firefox driver records `egressNonLoopback` from `ss -tnp` only, sampled every 400 ms (`scripts/playwright-firefox-loopback-round38.mjs:76-83`). `-t` limits this to TCP, and polling can miss shorter-lived connections. Therefore the receipt's zero does not establish zero non-loopback sockets or loopback-only network activity; a non-loopback UDP socket or a TCP connection entirely between polls is uncounted. Falsifier: create either such connection during a run and the sampler can still report zero. This run did return Playwright `1.64.0`, browser `157.0`, identical first-shot SHA `3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c`, `binding:true`, `egress:0`, and `survivors:0`; those are the observed results, with the above sampling limitation.

### Low — C2 survivor count is limited to one pre-close PID snapshot

The driver captures `firefoxPids` once after launch (`scripts/playwright-firefox-loopback-round38.mjs:72-74`) and later counts survivors only when their PIDs are in that original list (`:137-139`). A Firefox child created after the snapshot is not in the survivor set, so a surviving late child can be reported as zero survivors. The observed two-run receipt had `survivors:0` and `portClosed:true`, but the check does not prove absence of all browser descendants.

## No finding / residual risk

- Independently re-derived the committed round-37 seat-report tally using the counter's deduplication rule: 34 seats, 23 `ok`, 11 `finding` (0 error/none). D2's stated numbers are supported by this recount.
- The counter's SOURCES parser positions match the actual header (`tier` at split cell 4; `status` at cell 8); the committed registry has 144 rows at this revision. No D5 parse-index mismatch found.
- Ran the frozen Firefox driver twice with `HYAKU_SCRATCH` and output under this seat's scratch directory. Both runs returned matching screenshots, version fields, zero sampled non-loopback TCP sockets, and zero recorded survivors. This does not cure the sampling/snapshot limits above.
- The C1 counter run at frozen REV `a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc` correctly did not meet the future target; D1 correction, D4 mutant receipt, and D5/D6 measurement receipts were not present in the frozen commit. No conclusion about the later integrated REV is claimed.

## Verification gaps

No LSP device was mounted for references/diagnostics. No production files, git history, or non-scratch paths were modified by this seat; Firefox run artifacts were written only to `/fast/scratch/hyaku/tabi-r38/Reviewer01/` and cleaned before handoff.
