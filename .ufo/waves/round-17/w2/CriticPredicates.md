VERDICT: ISSUES
Attacked: predicate provenance in scripts/webmcp-invoke-round17.mjs at M=6c97851 (fnSha256 vs committed source,
fixed-before-run, self-certification), and what the receipt's `pass` for invoke-navigation-pending actually proves.
Method: read-only `git show M:<path>` into /tmp/cp (removed afterwards); Node scripts hash-scanned every `(o) =>` /
`() => false` slice of the committed harness, replayed each predicate against the receipt's `actual`, and
cross-checked harness-derived fields against `cdp.frames`. No browser run, no clone, no git writes.

## Provenance: holds
- receipt.producerSha256 = de62820d…52d7 = sha256(M:scripts/webmcp-invoke-round17.mjs). The receipt came from the
  committed bytes.
- fnSha256 = sha256(predicate.toString()) (h.mjs:802, :951). For **15/15** records (11 cases + 4 controls), the
  receipt hash equals the sha256 of an exact source slice at M:
  1006, 1070, 1121, 1174, 1224, 1282, 1369, 1442, 1528, 1614, 1706 (cases); 1756, 1771, 1805, 1873 (controls).
- Offline replay: each predicate, with the harness's own `stableStringify`/`deepEqual`/`jsonParseSafe` (h.mjs:155-173),
  returns `true` on the receipt's `actual` for all 15. That matches each recorded `status: pass`.
- Fixed before the run (evidence beyond the literal): preflight-smoke-failed.json (generatedAt 16:48:58Z, a different
  producer 9408d300…) has the **same** fnSha256 as the final receipt (16:49:59Z) for 14/15 predicates. That
  includes invoke-navigation-pending (1cefd6bd…), which failed in preflight with `invoked:null` and then passed with an
  unchanged predicate. The repair moved the toolInvoked read to after the window (h.mjs:1678-1681), so the note's
  claim "repaired … without weakening a predicate" holds for that case.
- Derived fields agree with the raw frames. success: invokedCount 1 and respondedAfterInvoked true. concurrent:
  lastSendSeq 9 and firstResponseSeq 14. iframe: childFrameId F044… = getFrameTree childFrames[0]. flags-off: the last
  `--enable-features` is `CDPScreenshotNewSurface` and no blink-features flag is present. Every stored nonce and
  `input` appears in the out `WebMCP.invokeTool` frame, so none was echoed back from the page.

## Self-certification: none found
No predicate takes its expected value from the page. The comparands inside `o` are:
- harness-generated: nonce, nonceA/B, input, windowMs;
- browser-sourced from Page.getFrameTree: mainFrameId, childFrameId;
- fixture constants: `{ok:true,q,via:'respondWith'}` and `[{result:'round17-nav',ok:true},{second:1}]`.

The page-side channels (`observations.calls`, ledger, sessionStorage) are always checked against values the harness
sent. Some expected values come from wave-1 probe observations of the same build: errorText `''`, `echo:undefined`,
-32602 "Tool not found". expectedProvenance declares this, and it is a tradeoff rather than a defect.

## Issues (fixable; none flips a status)
P1. `fixedBeforeRun: true` is a hardcoded literal (h.mjs:803), not a measurement. Controls omit it (h.mjs:951). No
    gate recomputes fnSha256: measure-c2.mjs checks only producerSha256 (M:.ufo/waves/round-17/measure-c2.mjs:273).
    Since the whole file is hash-bound, fnSha256 only localizes the predicate, and nothing re-checks even that.
P2. invoke-after-unregister: preflight fnSha256 28a21f75… = sha256("() => false"), the error fallback (h.mjs:918). The
    pre-repair predicate text is not recorded, and producer 9408d300… is not committed. "Without weakening a
    predicate" therefore cannot be verified for this case; it can be for the other 14.
P3. `o.windowMs === 8000` (h.mjs:1712) is a tautology: it is assigned from a constant at h.mjs:1674 and adds no
    information.
P4. `newDocumentTools` (h.mjs:1693-1700) maps a throw from getTools/evaluate to `[]` twice over, so
    `length === 0` (h.mjs:1719) also passes vacuously on error.
P5. The predicate never checks ordering, although `expected.toolInvoked` says "one event before navigation". In the
    receipt, toolInvoked is seq12, after Page.frameStartedNavigating (seq10) and before frameNavigated (seq13). The
    description's claim "execute is entered before the navigation" is likewise not asserted.

## invoke-navigation-pending: what `pass` proves
Receipt timeline (case frames, atMs):
- invokeTool result at seq9, 4 ms;
- frameStartedNavigating at seq10, 5 ms;
- toolInvoked at seq12, 6 ms (input carries the nonce);
- frameNavigated to plain.html at seq13, 9 ms;
- load at seq15, 14 ms. That is the last frame; durationMs 8054.

Other facts in the receipt: the ledger enter entry and sessionStorage residue carry the nonce; slow-echo settles after
1200 ms (M:…/fixtures/invoke-imperative.html:85); the flagged argv has `--disable-back-forward-cache`.

What it proves: the old document's execute was entered, its document was replaced about 9 ms later (well before the
1200 ms settle), and in the roughly 8 s after load **no WebMCP.toolResponded for that invocationId reached this raw
session**. The 8000 ms window is more than 6× the tool's own latency, and BFCache freezing is ruled out by the argv. So
this is not a "merely slow" false pass.

What it does NOT prove:
- (a) That the invocation is still pending in the browser rather than silently dropped.
- (b) Anything after 8 s. The session closes at closeCase, and later frames are not recorded.
- (c) That WebMCP event delivery on **this** session was still live after the navigation. After seq12 the case
  receives no WebMCP event at all; not even a toolsRemoved for the old tools appears.

There is only cross-session liveness evidence: in the declarative-navigation-result control, toolResponded (seq20)
arrives after its frameNavigated (seq16).

Overclaim: the receipt description says "must never produce a toolResponded" (h.mjs:1705). The note's row (note:59, :73)
is correctly scoped to "in the window".

## Verdict per case
- invoke-imperative-success: HOLDS. Hash matches, replay is true, no self-certification.
- invoke-imperative-throws: HOLDS. The expectations are observation-derived, and this is declared.
- invoke-imperative-rejects: HOLDS.
- invoke-unknown-tool: HOLDS.
- invoke-input-schema-mismatch: HOLDS. o.input equals the sent frame; divergence is flagged.
- invoke-declarative-form: HOLDS. The expected output is a fixture constant.
- invoke-after-unregister: ISSUES (P2). The final predicate is bound, but its pre-repair text is unverifiable.
- invoke-concurrent-ids: HOLDS. The seq fields recompute from the frames.
- invoke-flags-off-control: HOLDS. argvClean and featureSwitches recompute from effectiveArgv.
- invoke-iframe-frameid: HOLDS. childFrameId is browser-sourced and frameTree-verified.
- invoke-navigation-pending: ISSUES. The predicate is fixed and bound, but the pass is absence-in-window only, with no
  same-session liveness proof (c), plus P3, P4, P5 and the "never" overclaim.
- Controls before-enable, cancel, declarative-navigation-result, domain-disabled: HOLD. Hashes match and replay is
  true; they carry no fixedBeforeRun field (P1).

## Smallest safe corrections
1. navigation-pending body, after the window: on the same raw session, navigate (or `page.evaluate` registerTool) to a
   document that registers a tool, and require `WebMCP.toolsAdded` with `seq > window end` in the predicate. This is a
   liveness witness. Also record `windowEndAtMs`, and keep recording frames until closeCase.
2. Replace `o.windowMs === 8000` with a check on observed elapsed time (`windowEndAtMs - loadAtMs >= 8000`).
   Assert `invoked seq < frameNavigated seq`, or reword `expected.toolInvoked` to "before frameNavigated commit".
3. Make newDocumentTools return `{error}` on a throw, and require `Array.isArray(...) && length === 0` with no error.
4. Change the description's "must never produce" to "produced none within the window".
5. measure-c2.mjs: recompute fnSha256 from the harness blob at the revision. For each record, require a source slice
   whose sha256 equals fnSha256, located through the `predicate:` key. Drop or derive `fixedBeforeRun`, e.g. by
   matching a hash recorded in a predicate manifest committed before the run.
6. Keep the full preflight producer, or at least a per-predicate fnSha256 manifest even for errored cases, so that
   "no weakening" can be audited.

Tools installed: none.
Files written: .ufo/waves/round-17/w2/CriticPredicates.md
