# C2 counter-contract review

**Verdict: partially closed; not yet false-green-resistant as written.** The plan names every routed C2 gap and adds the missing signal/input cases. However, several detailed predicates can still credit a mutant unless the counter checks the actual negative outcome and uses an oracle independent of the candidate artifact/receipt.

## Findings (severity order)

### High — F6 reason can be self-declared or unrelated to the rejected input

`PLAN.md` §C2 (lines 130–132) requires exit 2 and a reason token declared in the witness header, observed somewhere in stdout/stderr. It does not pin an expected token per input independently of the witness, nor require a structured, invocation-specific refusal result. A mutant can change its header to declare one token for all inputs, print it on a generic exit-2 path, and satisfy those checks without classifying `HEAD`, `@`, `master`, a short hash, and an off-branch full hash correctly. In particular, the detailed contract should preserve the claim's 7–12-hex short-hash shape (PLAN.md lines 36–37), and prove the off-branch hash differs from `refs/heads/master`.

**Tighten:** keep an independent counter-side mapping (`HEAD`, `@`, `master` → symbolic-ref reason; valid 7–12-hex abbreviation → short-ref reason; verified off-branch full OID → off-branch reason); check exactly that reason for each invocation and reject generic/unrelated exit-2 output. The round-18 predicate only invokes `--rev HEAD` and checks status 2, while separately checking dry-run output (measure-c2.mjs lines 885–908); the routed spot-check explicitly identifies the missing inputs and reason check (round-18-verifier-spotcheck.md lines 153–155).

### High — UUID probe may be observed without making H4 fail

The plan's claim says the scan must cover any new file under `processTmpDir/playwright-artifacts-*` (PLAN.md lines 31–33), but the detailed probe only requires the harness scan to flag a planted UUID-named file (lines 124–128). It does not state that finding that file must make the H4 predicate false and prevent that gap from being credited. A mutant could record the UUID in diagnostics while retaining a pass predicate that only checks the suggested filename. That is the round-18 failure mode: normal sampling filters files with `filenameMatchesDownload` (measure-c2.mjs lines 498–501), and the final H4 file check applies the same suggested-name filter (lines 804–814).

**Tighten:** snapshot all paths under the run-owned `playwright-artifacts-*` directory, require zero new files for the clean run, and assert the UUID-injection mutant makes H4 fail / does not increment `c2_gaps_closed`. Use an unanticipated UUID; merely returning a scan record is not rejection.

### High — nonce freshness and provenance are weaker in the detailed clause

The claim requires a fresh per-run nonce (PLAN.md lines 32–34), but the detailed clause permits a value supplied through `TABI_RUN_NONCE` or `--nonce` and does not say the counter must generate it independently of the replayed record (lines 124–128). Unless constrained, a mutant can reuse the pasted receipt's nonce as the run nonce, then pass a simple equality check. “As echoed by the page” also needs an independent live-run observation; comparing two fields copied from the same receipt is circular. The old H4 predicate trusts invocation, marker, and response fields from the receipt (measure-c2.mjs lines 773–788), which is why the routed spot-check says a pasted record passes with real browsers (round-18-verifier-spotcheck.md lines 149–153).

**Tighten:** counter-generate a new nonce after loading the replay fixture (do not accept it from that fixture), pass it into the live invocation, and compare it to a current-run page observation independent of the receipt record. Replay a prior record with its original nonce and assert the H4 predicate is false. Treat env/CLI as transport only if the counter creates and controls the supplied value.

### Medium — signal coverage is added, but the PID predicate needs an executable scope

The plan now explicitly requires separate SIGINT and SIGHUP probes, after the first case line, exit 2, no pass/fail receipt, and no surviving run-owned Chromium PID (PLAN.md lines 34–35, 128–130). This closes the *named signal omission* in intent. The detailed clause reduces the precondition to a non-empty PID set, though, without saying that it must be the run-owned Chromium main process set or that process observation was complete. The round-18 helper only records that the Node child was alive at signal time and then scans processes containing the temp-path marker (measure-c2.mjs lines 363–425); its process matcher is not Chromium-specific (lines 249–269). Main runs SIGTERM and SIGINT but no SIGHUP (lines 1085–1091), and the SIGINT hazard only requires a non-null exit code (lines 730–743). A mutant that emits the case line while never starting Chromium can therefore pass if the new probe reuses the broad marker/child-alive check.

**Tighten:** for each signal, require a complete pre-signal observation of at least one Chromium main whose user-data-dir belongs to that run, then require the corresponding run-owned browser PID set to be empty after signal/cleanup; observation failure is not an empty set. Keep the explicit exit-2, `run_aborted`/signal, and no-receipt assertions for both probes.

## Routed item 3 coverage and residual risk

The C2 sub-shapes are all named in the plan. The spot-check's separate assertion-level delta (six of 15 original checks) is assigned to C3 d2 in PLAN.md lines 48–49; it is outside this C2 predicate review. Until the above details are fixed and exercised against each mutant, the planned 0→3 result is not established by the contract alone.

## Verification gaps

- This was a static review of PLAN.md, the round-18 counter, and the routed spot-check. The planned `round-19/measure-c2.mjs` and `scripts/webmcp-invoke-round19.mjs` were not present at the checked lane paths, so no round-19 runtime/mutant behavior could be reviewed or exercised.
- No LSP device was mounted (`read xd://lsp` reported no such tool); references, definitions, and diagnostics were unavailable. No grep output is used as semantic evidence.
- No browser, build, or test run was performed.

## Source anchors

All sources are local files opened on 2026-10-21; URLs are `file://` URLs and SHA-256 is over the decoded file body.

- PLAN.md §Claims C2, lines 29–42; §C2, lines 121–132 — `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/PLAN.md`; SHA-256 `c71e721a5b5edc371c29d8180d6b0d01b757b8c5f304006566b9a61c4cd27655`.
- measure-c2.mjs lines 241–269, 363–425, 498–501, 716–743, 773–816, 885–908, 1085–1091 — `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c2.mjs`; SHA-256 `99ad9ff7ca664eaa3e64948308a53d1827e34983ce874c8b26f6e5dc6a49e4dc`.
- Round-18 verifier spot-check, routed defects item 3, lines 149–157 — `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/lessons/round-18-verifier-spotcheck.md`; SHA-256 `0cfc40c6999a3ff8ed34e27c22cd8afbc25eeb0abadb2d4e3620a749b4a300e4`.

## Isolation

- Review-only; no production/source files changed and no clone, branch, or commit created.
- Sole LANE write: `.ufo/waves/round-19/w1/ReviewC2Contract.md`.
- No LANE git write was performed.
