# Reviewer13 — W1-13 adversarial review

## Findings

### High — C1 predicate is not met at measured tip `3bc0b108708c46c800f9050a1caa25bfe3bf5e5a`

**Evidence:** Ran the frozen command in a scratch clone:

```text
node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev 3bc0b10 --repo . --json
EXIT_C1=1
predicate=false
findings: d1-results; d3-hash ×6; d3-freeze-landing; d4-m3; d4-receipt; d5-receipt; d6-file
recomputed tally: 23 ok / 11 finding / 34 reports
```

`D1` cannot re-derive the reported 34 seats from committed bytes: `.ufo/waves/round-37/w1-results.json` is untracked in the lane worktree, and `git show 3bc0b10:.ufo/waves/round-37/w1-results.json` is absent. The untracked JSON parses as `seats: 34`, but that is not evidence at the measured commit. `D2` does pass: the committed-report tally is 23/11 across 34 reports. D3's six hashes and freeze landing attribution are absent from the committed round-38 LOG section; D4's captured-by row and mutant receipt, D5's count-bearing census receipt, and D6's numstat receipt are also absent at this tip. The SCORECARD correction and LOG tally are present.

This is a point-in-time falsification, not a claim that later round work cannot fix the predicate. It is falsified at this tip; a later measured REV with the counter returning exit 0 and no findings would reverse this finding. Current `claims.json` calls the full C1 predicate the target, while the landed SCORECARD/LOG explicitly call frozen verification pending.

### Medium — C2 egress detector can classify an external IPv6 TCP socket as loopback

`scripts/playwright-firefox-loopback-round38.mjs:79-82` samples `ss -tnp` only for PIDs captured once at line 74, then counts a socket as non-loopback only if the entire line lacks either substring `127.0.0.1` or `::1`. The `::1` substring also occurs in non-loopback IPv6 addresses. Reproduction of the exact predicate:

```text
/127\.0\.0\.1|::1/.test('ESTAB 0 0 2001:db8::100:443 2001:db8::200:443 users:(firefox,pid=1)')
=> true
```

Thus a socket to `2001:db8::100` is counted as loopback. The observation also excludes UDP (`ss -tnp`) and processes spawned after the one-time PID snapshot. This does **not** show that the two recorded runs actually egressed; it means the reported zero is not a complete detector of non-loopback sockets. A falsifier is any sampled external IPv6 TCP connection (or UDP connection / later child-process connection) that this implementation reports as loopback or omits.

The committed receipt at `corpus/evidence/round-38/playwright-firefox/receipt.json` does report two runs, matching first-shot SHA `3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c`, `playwrightVersion: 1.64.0`, `browserVersion: 157.0`, per-run `egress.nonLoopback: 0`, `survivors: 0`, and closed fixture ports. These are the recorded observations, subject to the detector limitation above.

### Low — D4 accepts an indeterminate red-control result as “refused”

`c1-routed-defects.mjs:37-38` defines exit 2 as “could not evaluate”; lines 168-174 nevertheless set `mutantRefused` true for a receipt with `exit === 2`. That does not establish that the mutated predicate was refused. A receipt with `{"exit":2}` therefore passes this D4 subcheck despite recording inability to evaluate, not refusal. A counterexample is that exact receipt value. The check also accepts unsubstantiated `{"refused":true}` or `{"killed":true}` flags without binding them to an executed command/output. At the measured tip the receipt is absent, so this is a demonstrated acceptance weakness in the frozen counter, not an allegation that an extant receipt exploited it.

## Verification and residual gaps

- Frozen digests for all five files in `claims.json` matched the checked-out bytes; the claim and instrument/script paths had no diff from freeze `a8e7d50` to measured tip `3bc0b10`.
- Re-ran C1 at `3bc0b10`: exit 1, predicate false, 12 findings. Re-ran at baseline `3f42a5c7cc19a544c879577e4bad7b7fd9d61a35`: exit 1 with 14 findings; the counter itself is absent from that baseline tree. This verifies baseline rejection, although it is largely due to absent post-baseline evidence.
- Did not re-run the Playwright driver; this assignment called for bounded checks and review of the committed runtime receipt. The receipt's in-scope fields were read, but no independent socket trace was captured.
- No `lsp` device/server was available in the tool inventory, so semantic LSP references/definition/diagnostics were unavailable; findings cite the frozen source directly.
- No tools installed or updated.
