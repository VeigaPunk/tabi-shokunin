# RowOutcome03 — falsification of row `na-requestsubmit` in the repaired round-22 C1 oracle

- Item: w2b outcome/falsification seat RowOutcome03 (row `na-requestsubmit`), revision `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`.
- Question: can a coherent contradictory mutation of the retained raw `corpus/evidence/round-21/runtime/na-requestsubmit.json` (digests resealed through `receipt.json` + `.ufo/waves/round-21/runtime-execution-finalized.json`) still be counted by `.ufo/waves/round-22/measure-c1.mjs` against the pinned `corpus/evidence/round-22/semantic-expectations.json` — across exact status/output/errorText, pre/post page state, navigation and the finite response window?
- Method: read-only static review of the landed bytes plus **executed** mutation runs of the lane's own oracle CLI inside a private throwaway clone (`/tmp/tabi-r22-w2b-RowOutcome03`, cloned from the lane and checked out at `e3cf4e0d…`). The lane itself was not written, not executed, not mutated; only this report was written. No browser, no credentials, no REA, no delegation, no lane VCS write.
- Attack harness: `attack/run.mjs` in the private clone, modelled on the lane's own `.ufo/waves/round-22/selftest-c1.mjs` (`changeCase` + `resealAcquisition`, `git init`/`commit` per case, oracle CLI run per case). It is a *private* harness: it is not a lane artifact and nothing in the lane was changed by it.

## Evidence blobs at the reviewed revision (sha256, computed by me from the clone at `e3cf4e0d…`)

- `corpus/evidence/round-21/runtime/na-requestsubmit.json` = `4b8245d762fea96e463a4b21623055d7b3509cb7cd9d1e6f7b9e101d730ca8fa`
- `corpus/evidence/round-21/runtime/na-requestsubmit.html` = `1796f206a10c85b94d21db0381610858150c971cb8131c0ae40cfab8fbbd2085`
- `corpus/evidence/round-21/runtime/receipt.json` = `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034`
- `.ufo/waves/round-21/runtime-execution-finalized.json` = `65b52c0c65176d7a89f888b1f94686d4df6ca25eb747e4bf733ff4203bab7fe4`
- `corpus/evidence/round-22/semantic-expectations.json` = `4a693dce44b1161df5ced71fd2739ff4a1a4147d893b83dfc780d92cc5b60e1e` (matches the pin `EXPECTATIONS_SHA256`, `measure-c1.mjs:22`)
- `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` = `6f6439558531d7f51bc7c47fa90e38f5133db9ee94473a3c05ed27181893116e`
- `scripts/webmcp-lifecycle-round21.mjs` = `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` (matches `PRODUCER_SHA256`, `measure-c1.mjs:23`)
- `.ufo/waves/round-22/measure-c1.mjs` = `47176aed1955f60547c97303d23530069848320f0f2ab773e0f68ee0b6b0775c`
- `.ufo/waves/round-22/selftest-c1.mjs` = `985aa9c77452368bb8381695ed406fa3b633940e3c328f4c96773248f98dc5b6`

## Verdict

**One real defect (F1, major) and two minor coverage gaps (F2, F3).** The row's *status / output / page-state / finite-response-window* distinctions are genuinely failure-capable — seven distinct contradicting mutations are refused with the exact code lines cited in §4. The **navigation** distinction of this row is not: a retained raw that navigates the page to the landing URL *after* the post-action observation is still counted as a clean semantic row (`value=12`, `verdict=clean`, `exit=0`, zero findings). That is exactly the mutation the canonical note promises must fail: “a coherently changed raw event and summary, with corrected digest links, must still fail the case's semantic expectation” (`corpus/knowledge/webmcp-lifecycle-oracle-round-22.md`, “What this adds, and what it does not”).

I make **no** claim that the retained corpus is wrong. In the retained acquisition no case has frames after its post-action observation (checked all 12 raws), and the current metric value 12 is unchanged by my findings. The defect is in the *failure-capability* of the instrument the wave claims to have repaired, i.e. the metric would still read 12 for a contradicting raw.

---

## F1 (major) — `navigation: "none"` is enforced only up to the post-action observation; a post-window navigation is counted as clean

**Where.** `.ufo/waves/round-22/measure-c1.mjs:309-312` (and the matching receipt cross-check at `:281-282`):

```js
309  const actionNavigations = post && plain(receiptCase.after) ? navEvents.filter((frame) =>
310    frame.at >= receiptCase.after.start && frame.seq < post.seq) : [];
311  if (expected.navigation === 'none') {
312    if (actionNavigations.length !== 0) add('semantic_navigation', 'unexpected-post-action-navigation');
```

The upper bound is `frame.seq < post.seq`: only navigations recorded **before** the post-action observation are considered. The expectation pin (`semantic-expectations.json`, case `na-requestsubmit`) declares `"navigation": "none"` with **no window qualifier** — contrast the response dimension, which carries an explicit `responseWindow` field (`"action-to-post"`) and is window-checked at `:306-307`.

**Why the escape is producer-coherent, not a hand-crafted forgery.** The producer registers the CDP listener for the whole session (`scripts/webmcp-lifecycle-round21.mjs:180`: `for (const method of ['WebMCP.toolsAdded', 'WebMCP.toolInvoked', 'WebMCP.toolResponded', 'Page.frameNavigated']) cdp.on(method, (params) => frame('event', { method, params }));`), takes the post-action observation at `:225` (`const post = await observe('after-action');`) and only then tears the session down and writes the raw (`:230` `closeOwnedContext(...)`, `:233` `save(join(out, `${id}.json`, evidence)`). The raw's frame array therefore extends to CDP teardown, **not** to the post observation. The receipt summary uses the producer's own filter (`webmcp-lifecycle-round21.mjs:226`: `navigations: evidence.frames.filter((x) => x.method === 'Page.frameNavigated' && x.at >= actionAt && x.seq < post.seq)`), so a post-window navigation is recorded in the raw and *still* absent from `after.navigations` — exactly what the producer would have written.

**Smallest counterexample** (one added frame, two resealed digests; everything else byte-identical):

```json
{"seq":17,"at":1792590709754,"dir":"event","method":"Page.frameNavigated",
 "params":{"frame":{"id":"CD8BCA22EC82E0F3C027AFE1E09B6BB2","loaderId":"ZZZZ",
 "url":"http://127.0.0.1:43143/landing?q=99664eb6-d5ed-46f6-a516-39720ab87c27"},"type":"Navigation"}}
```

appended to `frames` of `corpus/evidence/round-21/runtime/na-requestsubmit.json`, plus:
`receipt.json` → `cases[na-requestsubmit].evidence.sha256` = new raw digest;
`.ufo/waves/round-21/runtime-execution-finalized.json` → `artifacts["corpus/evidence/round-21/runtime/na-requestsubmit.json"]` = new raw digest, `receiptSha256` = new receipt digest.
The receipt's `after.navigations` stays `[]` — as the producer would have written it.

**Observed result of the counterexample (executed).** `node .ufo/waves/round-22/measure-c1.mjs <mutated-revision>` → `exit=0`, `value=12`, `verdict="clean"`, `findings=[]`, and the `na-requestsubmit` row `counted=true`, `semanticMatch=true`. The mutated row now asserts, in its own bytes, that the page reached `/landing?q=<case nonce>` — the very landing path that distinguishes `na-native-submit` from `na-requestsubmit` (note table: `na-native-submit` rejects “no navigation”) — while the row is still certified as “no navigation”.

**Sharpest variant (same-ms).** With `at = 1792590709753` (exactly `post.at`, i.e. *inside* the receipt's own `after` window `[start 1792590709250, end 1792590709753]`), the navigation's timestamp lies inside the window the receipt declares, yet `after.navigations` is `[]` and the oracle still returns `value=12/clean`. This exposes the mixed-clock filter at `:309-310` (time lower bound, sequence upper bound) and `:281` (the same mixed bound repeated in the receipt cross-check): no check can ever see a navigation that is sequenced after the post observation, whatever its timestamp.

**Preserving positive / controls (all executed, same harness).**
- Unmutated tree → `exit=0`, `value=12`, `verdict=clean`, `findings=[]`, row `counted=true` — the metric's positive is preserved by the mutation *and* the mutation is invisible, which is the defect.
- The **in-window** equivalent of the same mutation (nav frame inserted right after the `action-complete` frame, `at` = that frame's `at`, receipt `after.navigations` updated to the producer's filter output) → `exit=1`, `value=0`, `semantic_navigation:na-requestsubmit:unexpected-post-action-navigation` — the check itself works; only its upper bound is too narrow.
- `late-same-document-navigation` (a `Page.frameNavigated` of `type:"SameDocument"` to `/na-requestsubmit#late` after the observation) → also `exit=0`, `value=12`, `clean`.

**Smallest fix** — one line at `.ufo/waves/round-22/measure-c1.mjs:309-310`, replacing the sequence-bounded window with the post-action window:

```js
  const actionNavigations = post && plain(receiptCase.after) ? navEvents.filter((frame) =>
    frame.seq > (actionFrame?.seq ?? 0)) : [];
```

Verified in the private clone (the patched oracle file was restored afterwards; the lane was never touched):
- patched oracle at the pristine revision `e3cf4e0d…` → `exit=0`, `value=12`, `verdict=clean`, `findings=[]` (no regression; `na-native-submit`'s landing navigation is at seq 15, after its action frame at seq 13 and before the response at seq 16, so the widened window still yields exactly one landing);
- patched oracle on both counterexamples → `exit=1`, `value=0`, `semantic_navigation:na-requestsubmit:unexpected-post-action-navigation`;
- lane's own selftest with the patched oracle → `node .ufo/waves/round-22/measure-c1.mjs --selftest` → `exit=0`, `verdict=clean`, `44/44` passed.

(If the author prefers the *receipt cross-check* to catch it instead of the expectation check, widen `:281` with the same predicate; the receipt's producer-computed `after.navigations` then mismatches and the row is refused as `evidence_binding:receipt-navigation-summary`. The one-line change at `:309-310` is the smaller and more direct fix, because it fixes the semantic check itself rather than the summary cross-check.)

**Scope note (honest counter-argument, recorded).** One could read the pin's `navigation` field as scoped to the finite observation window by construction, in which case a post-window navigation is “out of scope by design” rather than a missed failure. Two facts cut against that reading: (i) the pin qualifies the response dimension with an explicit `responseWindow` and does not qualify `navigation`; (ii) the raw is not bounded by the observation, so the oracle’s “no navigation” conclusion is not established by the retained bytes — it is established by an unstated assumption about where the producer stopped recording. Under either reading the metric is unchanged today, but the wave’s headline claim “failure-capable semantic-oracle rows” is not established for this row’s navigation distinction.

---

## F2 (minor) — unmodelled observation frames are ignored, including ones that directly contradict the counted post state

**Where.** `.ufo/waves/round-22/measure-c1.mjs:183-190` recognises only three observation labels (`pre-action`, `after-action`, `delayed-before-release`); the marker-set check at `:189` counts only those; `validatePageState` is applied only to `pre` and `post` (`:251-252`); extra observation frames are accepted as long as `raw.pageObservations` mirrors them (`:178-181`).

**Counterexample (executed).** Append a third observation frame `{"seq":17,"at":1792590709758,"dir":"observation","label":"settle-check","value":{…post value with "formActive":true and "submits":[]}}` plus its `pageObservations` mirror, reseal the digests → `exit=0`, `value=12`, `verdict=clean`. The row now carries, in its own bytes, an observation asserting that the form was still active and that **no submit event ever occurred** — a direct contradiction of the counted `post` state (`formActive:false`, one submit) — and the oracle certifies it as clean.

**Coherence caveat (stated, not hidden).** The producer emits exactly two observation labels per case (`webmcp-lifecycle-round21.mjs:208` and `:225`), so a third label is off-producer-schema; this is a *coverage* gap in the oracle (it does not enforce the observation set), not a claim that the producer could emit it. Lowest severity of the three findings; the fix would be to require the observation set to be exactly the modelled labels (e.g. fail any `dir:"observation"` frame whose label is not one of the three, at `:184-190`).

---

## F3 (minor, outside the four named dimensions) — fields the oracle claims to check but never reads

**Where.** `.ufo/waves/round-22/measure-c1.mjs:345-349` (the `case-cleanup-or-boundary` check) reads only `raw.browserPidsBefore`, `raw.browserPidsAfter`, `raw.contextClosed`, `raw.closeError`, `raw.blocked`, `raw.downloads`. It never reads `raw.browserPidsAtClose`, `raw.browserPidsSeenAfterClose`, `raw.processIdentities`, `raw.processIdentitiesAtLaunch` — the producer’s own cleanup record (`webmcp-lifecycle-round21.mjs:72-96`). Likewise `raw.schema` is never compared to `tabi-round21-case-v1`, and the `WebMCP.toolsAdded` tool *declaration* (`inputSchema`, `description`, `backendNodeId`) is never checked — only the tool’s `name` (`:216`) and `frameId` (`:223-224`).

**Counterexample (executed).** `"browserPidsAtClose": []` together with `"browserPidsSeenAfterClose": [1808310, …, 1808408]` (the nine live browser pids, i.e. the browser was still running after close) → `exit=0`, `value=12`, `verdict=clean`. Likewise `tool-schema-mutated` (`inputSchema.required` emptied, description rewritten) and `raw-schema-mutated` (`raw.schema` → `tabi-round21-case-v2`) are all counted clean.

**Impact, honestly bounded.** The note already states “PID cleanup remains sampled owned-process evidence”, so this is a limit rather than a contradiction of the note; but the *check id* `case-cleanup-or-boundary` currently over-claims what it establishes, and the untouched fields are exactly the ones the producer wrote for that purpose. Not a row-`na-requestsubmit` semantic defect; listed because the assignment asked for the row’s boundary evidence as well.

---

## §4 — The row’s other dimensions are genuinely failure-capable: the exact lines that refuse each contradicting mutation

All executed in the private clone through the lane’s own oracle CLI; each mutation is a coherent change to the raw + resealed receipt/acquisition digests.

| # | Mutation of `na-requestsubmit` (raw + resealed digests) | Oracle exit | value | Refusing code (`.ufo/waves/round-22/measure-c1.mjs`) |
|---|---|---:|---:|---|
| C1 | response `status` → `Error` (+`errorText`) | 1 | 0 | `:291` `semantic_status:…:outcome-status`; `:259` `…:finite-window-response-statuses`; `:296` `semantic_output:…:exact-output-shape`; `:277-280` `evidence_binding:…:receipt-raw-summary` |
| C2 | `output.nonce` → `wrong-output-nonce` | 1 | 0 | `:296` `semantic_output:…:exact-output-shape`; `:277-280` `evidence_binding:…:receipt-raw-summary` |
| C3 | pre window 253 ms → 249 ms (below `pre.minMs`) | 1 | 0 | `:268-269` `semantic_timing:…:finite-summary-windows` |
| C4 | `Page.frameNavigated` to `/landing?q=<nonce>` **inside** the window (after `action-complete`, receipt `after.navigations` resealed to the producer filter) | 1 | 0 | `:312` `semantic_navigation:…:unexpected-post-action-navigation` |
| C5 | second `WebMCP.toolResponded` for the same invocation, after the post observation | 1 | 0 | `:289` `semantic_status:…:response-count`; `:306` `semantic_timing:…:response-outside-action-window` |
| C6 | the single response moved to after the post observation | 1 | 0 | `:306` `semantic_timing:…:response-outside-action-window`; `:259`; `:277-280` |
| C7 | a second `WebMCP.invokeTool` sent | 1 | 0 | `:228` `evidence_binding:…:current-invocation-chain`; `:230` `…:invocation-id-cross-link`; `:256` `…:response-other-invocation`; `:289` `…:response-count` |

Page-state mutations are refused by `validatePageState` (`:107-146`): `secureContext`/`formActive`/`formExists`/`value`/`focused` at `:112-114`, `nonce` presence/identity at `:117-120`, the exact submit record (`agentInvoked`/`isTrusted`/`q`/`active`/`respondWith`) at `:121-128`, `errors` at `:129-130`, and `url` origin/path/search/hash at `:131-145`. Because the metric is all-or-nothing (`blocked = findings.length > 0`, `:480-487`), any one of the above zeroes the whole C1 value, not just the row.

## §5 — Commands executed (all inside `/tmp/tabi-r22-w2b-RowOutcome03`; exit codes as returned)

| command | exit | result |
|---|---:|---|
| `git clone /home/vgpnk/Projects/shokunin/tabi-shokunin /tmp/tabi-r22-w2b-RowOutcome03 && git checkout e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` | 0 | clone at `e3cf4e0d` (`round-22: repair landing-stage oracle defects…`) |
| `node .ufo/waves/round-22/measure-c1.mjs e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` | 0 | `value=12`, `verdict=clean`, `findings=[]`, all 12 rows `counted=true` |
| `node .ufo/waves/round-22/measure-c1.mjs --selftest` (pristine oracle) | 0 | `verdict=clean`, 44/44 cases passed |
| `node attack/run.mjs <15 mutations>` (each: isolated temp git repo + oracle CLI) | 0 (harness) | per-case oracle exits/value/findings in §3 and §4 (15 cases: 1 positive, 7 refused, 7 accepted-with-contradiction) |
| patched oracle (one-line fix at `:309-310`) `node .ufo/waves/round-22/measure-c1.mjs e3cf4e0d…` | 0 | `value=12`, `verdict=clean` (no regression) |
| patched oracle `node .ufo/waves/round-22/measure-c1.mjs --selftest` | 0 | `verdict=clean`, 44/44 passed |
| patched oracle on the two F1 counterexamples | 1 each | `value=0`, `semantic_navigation:na-requestsubmit:unexpected-post-action-navigation` |

Node: `v24.21.0` (`/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`). No tool was installed or upgraded for this seat (nothing needed beyond the lane’s own node).

## §6 — Residual risk and verification gaps (stated, not implied)

- **Not run:** `.ufo/waves/round-22/run-checks.py`, `.ufo/waves/round-22/check-review-chronology.mjs`, the W2 serial cohort receipts (`checks-at-e3cf4e0.json`), and any browser or playwright acquisition. I did not re-derive the wave’s other rows or the L1 integration; my claims are scoped to row `na-requestsubmit` and to the oracle’s behaviour under mutation.
- **No browser, no browser-semantics claim.** I did not verify Chrome’s actual `requestSubmit`/`isTrusted`/`agentInvoked` behaviour; the recorded values (`isTrusted:true`, `agentInvoked:true`, `active:true`) are taken as the retained raw’s truth, and the producer’s own dispatch `scripts/webmcp-lifecycle-round21.mjs:214` (`page.evaluate(() => document.querySelector('#f').requestSubmit())`) is noted only as provenance. Any question about whether a script-initiated `requestSubmit()` should yield a trusted event is a browser-semantics question and is explicitly out of scope here.
- **Author-authenticity is out of scope.** F1/F2/F3 are instrument-coverage findings against the landed bytes; they make no claim about the intent of the raw’s author. The note itself states that cryptographic self-consistency “is necessary, not an outcome oracle or a guarantee against an author changing both the evidence and the independent expectations” — my counterexamples change only the *evidence*, not the independent expectations (`semantic-expectations.json` and its `EXPECTATIONS_SHA256` pin were untouched in every run).
- **F1 is a coverage limit, not evidence that the retained corpus misreports.** All 12 retained raws were checked: none has frames after its post-action observation; the retained `na-requestsubmit` raw contains exactly one `Page.frameNavigated` (seq 3, the initial `/na-requestsubmit` load), and the receipt’s `after.navigations` is `[]`. The escape requires a navigation arriving between the post observation and CDP teardown.
- **Uncertainty left open:** the size of the escape window in wall-clock terms. The producer closes the context immediately after the post observation (`webmcp-lifecycle-round21.mjs:230`), so in the retained acquisition it is short (no case exhibits it). I did not measure it and make no claim about its size.
- **F2’s coherence caveat stands:** a third observation label is not producer-emittable; F2 is a missing-set check, not a producer-path counterexample.
- **The proposed fix is not applied to the lane.** The patched oracle existed only in the private clone and was restored before finishing; the clone still matches `e3cf4e0d…` byte-for-byte (`git diff` empty). The lane’s repair policy for round-22 (and the post-w2b labelling) is the L1/Main’s call, not this seat’s.

## §7 — Bottom line for the C1 operability claim

- The repaired oracle at `e3cf4e0d…` measures `value=12`, `verdict=clean`, exit 0 on the retained bytes — reproduced by me, unmodified.
- Its refusal set for row `na-requestsubmit` is real and broad on status/output/page-state/window (7 contradicting mutations refused, §4).
- One contradicting mutation in the row’s **navigation** dimension is **counted** (F1): the metric would still read 12 for a raw that navigates to the landing URL after the post observation. Smallest fix: one line at `.ufo/waves/round-22/measure-c1.mjs:309-310` (`frame.seq > (actionFrame?.seq ?? 0)`), verified to keep `value=12/clean` on the pristine revision and to keep the lane selftest at 44/44 while refusing both counterexamples.
- Two minor gaps (F2 unmodelled observation frames; F3 unchecked cleanup/declaration/schema fields) are recorded with the same counterexamples.
- No lane byte outside this report was written; the lane was never executed; no browser ran.

Report: .ufo/waves/round-22/w2b/RowOutcome03.md
