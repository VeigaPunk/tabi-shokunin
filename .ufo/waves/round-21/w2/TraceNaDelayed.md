# TraceNaDelayed — raw causal trace attack, `na-delayed` only

Scope: finite raw-correlation audit of the round21 `na-delayed` case (tie8, C1 depth). Current acquisition
(`runtime-execution-bounded.json` producer lineage) only; history/ artifacts excluded. Method: direct data
reading and read-only digest/arithmetic over the retained JSON/HTML bytes plus literal reading of the
producer and gate. No gate, selftest, counter, browser, or build execution. No tools installed (none needed).
`xd://lsp` device: not present in this seat's tool inventory; no LSP server answered, so all checks are
literal text/data, never presented as semantic proof. Godspeed axes: (1) raw event census, (2) id/nonce/frame
correlation, (3) window and summary agreement, (4) release-flow causality, (5) gate-vs-raw credit gap.

## Raw census (read from `corpus/evidence/round-21/runtime/na-delayed.json`, 437 lines, sha256
`50fb7f14fa7334a859e40ff47f58cdcb87d5baeef32a671e290c8a4a96cb6c62` = receipt.json:523-525)

- frames: 18 total, seq strictly 1..18, `at` monotonic. By dir: sent 4, result 4, event 4, observation 3,
  action 1, action-complete 1, release 1. Zero `error` frames. Zero frames after the after-action marker
  (last frame is seq18).
- sent: seq1 Page.enable (c1) @030093; seq4 WebMCP.enable (c2) @030108; seq7 Page.getFrameTree (c3) @030109;
  seq9 WebMCP.invokeTool (c4) @030109, params frameId `A684B0805BB70E73C5E6B687B1B6E17F`, toolName
  `lifecycle`, input `{q:"bb8978d0-4274-45c6-838a-0185a7d0cca3"}` (seq9).
- events: seq3 `Page.frameNavigated` @030099 (initial `/na-delayed`, loaderId 36E47E7C…, frame A684…);
  seq5 `WebMCP.toolsAdded` @030109 (lifecycle, frameId A684…, backendNodeId 2); seq11 `WebMCP.toolInvoked`
  @030110, invocationId `6B4E7894D6E4EEED79F71A2ACCAD3372`, input echo string
  `{"q":"bb8978d0-4274-45c6-838a-0185a7d0cca3"}`; seq17 `WebMCP.toolResponded` @0615, same invocationId,
  status `Completed`, output `{ok:true,nonce,q}` = nonce. Exactly one toolInvoked and exactly one
  toolResponded in the whole trail (any invocationId): no foreign or duplicate response exists.
- markers: seq12 observation `pre-action` @0363 (submits [], formActive true, focused `go`, value=nonce);
  seq13 action `requestSubmit`/`dispatch-started` @0363; seq14 action-complete @0364 (1 ms evaluate);
  seq15 observation `delayed-before-release` @0615 (submits[1]: agentInvoked true, isTrusted true, q=nonce,
  active true, respondWith `'function'`; errors []); seq16 release (empty payload) @0615; seq18 observation
  `after-action` @1117 (same single submit, formActive false, url unchanged `/na-delayed`).
- pageObservations (3) exactly mirror the three observation markers (seq/at/value equality checked).
- receipt case (receipt.json:465-525, case index 8 of 12): invocationId matches; preAction
  start 030109 / end 0363 / windowMs 254 / responseCount 0 / formActive true; after start 0363 (= actionAt)
  / end 1117 / windowMs 754; responses = [seq17 params]; submits = post.value.submits; navigations = [];
  pageState = post.value. All six summary_mismatch comparisons (gate measure-c1.mjs:96) agree by
  manual evaluation of both sides.
- timing deltas: invoke-result→pre 254 ms; action→complete 1 ms; action-complete→release 251 ms;
  release→toolResponded 0 ms (same millisecond 1792588030615); release→post 502 ms. No toolResponded at any
  seq < release seq.
- fixture `na-delayed.html` sha256 `4dd942c5…fb35` matches receipt/evidence; nonce embedded (:5,:12); no
  `toolautosubmit` (:2); handler (:7-15) logs submit flags, preventDefault, then for mode `delayed` calls
  `e.respondWith(new Promise(resolve=>{window.release=()=>resolve(value)}))` — executor only installs
  `window.release`, does not resolve.

## Verified correlations (all pass on retained bytes)

1. invocationId thread: invokeTool result (seq10) = toolInvoked (seq11) = toolResponded (seq17) =
   receipt.invocationId = `6B4E7894D6E4EEED79F71A2ACCAD3372`. (An initial scripted check that also included
   the sent frame returned false only because a sent frame carries no invocationId; corrected thread above is
   true.)
2. input.q (seq9) = nonce = fixture nonce = page-observation nonce/value = toolInvoked input echo
   (string-equal to JSON of sent input) = toolResponded output.nonce and output.q.
3. frameId `A684…17F` identical across frameNavigated, toolsAdded, getFrameTree, sent invoke, toolInvoked.
4. Event order: toolResponded (seq17) after toolInvoked (seq11); invoke reply (seq10) < pre marker (seq12) <
   action (13) < action-complete (14) < post marker (18); gate order_mismatch:action invariants (measure-c1.mjs:94)
   hold with pre.at == action.at (both 0363) and after.start == action.at.

## Findings (each one concrete attack; severity = ability to make the metric falsely credit this case)

### F1 HIGH — gate has zero correlation with the delayed-release flow it claims to measure
`measure-c1.mjs` never mentions `release` or `delayed-before-release` (grep: only `CONFIG`/`IDS` mention the
mode string, :9,:15; no structural check anywhere in `evaluate`, :55-99). The `delayed`-specific evidence —
exactly one `delayed-before-release` observation and one `release` marker positioned
action-complete ≤ obs ≤ release ≤ first correlated toolResponded, plus `mode==='delayed'` — is recorded by
the producer (`scripts/webmcp-lifecycle-round21.mjs:222`) but checked by nothing. Concrete attack (static
counterfactual, NOT executed per bounds): delete frames seq15-17 and set `after.responses:[]` in
`na-delayed.json`, re-hash — the evidence becomes indistinguishable from a plain requestSubmit success
(`na-requestsubmit` shape) wearing the mode string `delayed`, every gate finding id still passes, and
`c1_lifecycle_observations` stays 12. The distinctive S101 claim "held, then explicitly released" is
therefore not gate-backed; it lives only in raw bytes and prose.

### F2 HIGH — no outcome correlation: a success/delayed case needs no in-window `Completed` response to count
The gate never reads response `status` (grep for `Completed`/`status`: absent from evaluate) and never
requires a nonempty in-window correlated response for the eleven non-pending cases. Only `na-pending`
legitimately has `responses:[]`. Attack: if correlation ever broke — a `toolResponded` under a different
invocationId (excluded from `responses` by producer :205 and gate :85-87, by design per the
`foreign-response-ignored` selftest) or arriving after post.seq (`late-response-outside-window` expects exit
0) — na-delayed would be credited as a completed-delayed observation with `statuses=none-in-window`, and no
finding id fires. The 12-count is outcome-blind; the knowledge row "Completed with dummy response object
after controlled release" is enforced nowhere. No selftest mutant covers "raw itself lacks the response for a
success-mode case" (fixture list expected.json:2-25 has `false-pending`/`response-mismatch`, both receipt-side).
Correct fix shape: mode-conditional requirement (success/delayed ⇒ ≥1 in-window response with
`status==='Completed'`; reject/throw ⇒ `Error` + retained errorText), leaving na-pending as the only
empty-window case.

### F3 MEDIUM — release marker is written before the release executes; ordering is by construction, not observation
Producer `:222` does `frame('release', {})` and only then `bounded(page.evaluate(() => window.release()), …)`.
The marker's `at`/seq precede dispatch of the actual release, and there is no `release-complete` ack
analogous to `action-complete` (which the gate does require, measure-c1.mjs:93-94). Same-millisecond
release/response (`0` ms delta, both 0615) plus marker-before-dispatch means the transcript alone proves only
"no response before the marker ms", not "response caused by the release". A hung release fails loudly
(`operation_timeout:delayed.release` → missing receipt case → case_set), which bounds the damage, but any
reading of "response after release" as observed causality overstates the record.

### F4 MEDIUM — response payload and invoke echo are never correlated to the case by the gate
Gate `raw_invoke` (:81) pins the sent input, and `event_identity` (:87) pins ids, but nothing compares
`toolResponded` `output.nonce`/`output.q` to the nonce, nor parses the `toolInvoked` input echo string. A
browser-side anomaly pairing this invocationId with different q/output would pass. On retained bytes both
agree (verified: output.nonce == output.q == sent input.q == nonce; echo string equal), so this is a missing
gate correlation, not an observed contradiction.

### F5 LOW — accounting asymmetries (no effect on retained data)
(a) `toolResponded` events per invocationId are unbounded by `event_identity` (:87 requires only ≥1 after
toolInvoked); duplicates/late responses survive by design. (b) Navigations cutoff is `at>=after.start AND
seq<post.seq` while responses cutoff is `seq<post.seq` only (gate :96, producer :225); pre-action navigations
are recorded in frames but accounted nowhere in the receipt. na-delayed has exactly one frameNavigated (seq3,
initial load, excluded correctly) and `navigations:[]` agrees.

### F6 INFO — cleanup fields beyond the gate's triple are present and agree, but unchecked
Gate checks only `browserPidsBefore` nonempty / `browserPidsAfter == []` / `contextClosed` (:97). The new
repair fields `browserPidsAtClose` (9 PIDs), `browserPidsSeenAfterClose` ([]), and `processIdentities{AtLaunch}`
(9 pid+startTicks) are internally consistent in na-delayed.json (same 9 PIDs, ticks 8701330-8701340) but no
gate check reads them; receipt-level cleanup is `{browserClosed:true, serverClosed:true}` (receipt tail).
No contradiction; finite observation only — no actor/process-quiescence claim is made or implied here.

## Residual risk and verification gaps

- F1/F2 are gate-coverage gaps, not observed data defects: every retained relation in na-delayed checks out
  by direct reading. The residual risk is that the C1 metric's credit for this case rests on producer
  honesty + raw bytes alone for exactly the two properties (delayed hold/release, Completed outcome) that
  make this case distinct from na-requestsubmit/na-pending.
- Counterfactual mutants in F1/F2 are static derivations from reading `evaluate`; I did not execute the gate,
  selftest, or any counter run (bounds). Nobody should cite them as observed passes/failures.
- No LSP device available in this seat; all anchors are literal line/byte references.
- No pacman/system transactions performed; no tools installed or updated.
- Not checked here (other seats' scope): sibling cases, history/ acquisitions, semantic universalization,
  source-binary equivalence.

Report: .ufo/waves/round-21/w2/TraceNaDelayed.md
