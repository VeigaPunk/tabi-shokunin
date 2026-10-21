# AttackDelayed: na-delayed response-before-release and inactive-before-release, against the integrated r22 oracle

Seat `TabiR22.AttackDelayed` · wave `tabi-r22-w1` · baseline `5f585773258b33d2d514b00cd0b0775333578db6`.

**Observed state, re-check before relying on line numbers.** `.ufo/waves/round-22/measure-c1.mjs` sha256 `a1d977a8bc2f889ba3fa5d31b6282646fd97d4913b27589545c2c9c8bb46b99a`. `corpus/evidence/round-22/semantic-expectations.json` sha256 `4a693dce44b1161df5ced71fd2739ff4a1a4147d893b83dfc780d92cc5b60e1e`, equal to the constant at measure:22. `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` sha256 `6f6439558531d7f51bc7c47fa90e38f5133db9ee94473a3c05ed27181893116e`. BuildSelftest draft: `.ufo/waves/round-22/clones/BuildSelftest/.ufo/waves/round-22/selftest-c1.mjs` and `…/fixtures/expected.json`.

**Method.** Read-only. File reads, `grep -n`, `sha256sum`, and one read-only `node -e` SHA-256 of an embedded fixture file's bytes. No gate, selftest, oracle, browser, network probe, or install was run. Every "oracle result" below is a static trace of the code and is **[INFERENCE]** until L1 executes it. Labels: **[VERIFIED]** read or checksummed in this session.

**Correction to the earlier draft.** That draft said the r22 oracle, expectations, and selftest were absent. They exist now. The predicted finding sets were replaced with traced sets in §4. Several of the earlier predictions were wrong.

## 0. Summary

- **Caught (static trace):** early response before release, ordered by seq (§4 D1–D3); inactive before release (D5); release missing or duplicated (D8, D17); delayed marker missing or moved after release (D9, D10); zero-length hold (D11); missing or early-completed response (D4, D12); mirror-only edits (D14). The ordering core at measure:326–333 is sound.
- **Not caught, GREEN (static trace):** the delayed observation's submit record is never validated (G1). Flipping `submits[0].active` at seq 15 only (D6-partial), emptying `submits` at seq 15 (D7), and deleting `respondWith` at seq 15 (D7b) all pass. The execution `stdout` is never read (G2, D16).
- **Selftest draft (G3–G5):** the assertion is inclusion-only (selftest:356), so multi-finding cascades are not pinned. The early-response mutant also moves `at` (selftest:216), so an `at`-only oracle would pass it too. The positive base is the r21 synthetic seed (selftest:13, :45–54), which fails fixture pins on every row.
- **Stable finding sets differ from the design intent** in D2, D3, D4, D6, D9, D11, D12, D13, D14. They must be written as exact sets in the expectation rows (§6).

## 1. Axes

- **A1** ordering authority: seq versus wall-clock `at`.
- **A2** active witnesses: page-level `formActive` and event-time `submits[]` record. Both must be checked before release, and mirrors must match.
- **A3** presence and vacuity: marker, release, submit, and response must each be required, never "if present".
- **A4** mode scope: delayed predicates must not leak into auto or pending rows.
- **A5** digest-link coherence: RAW → RCPT → EXEC, and whether stdout is bound.
- **A6** fixture semantics: the served mode literal.
- **A7** lineage: which acquisition a citation binds.
- **A8** inheritance: frozen r21 exit-0 rows and synthetic seeds.

## 2. Retained baseline (finalized acquisition) [VERIFIED]

Digests (`sha256sum`):

| Artifact | sha256 | Pinned at |
|---|---|---|
| RCPT `corpus/evidence/round-21/runtime/receipt.json` | `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` | EXEC:47 `receiptSha256`, EXEC:21 |
| RAW `corpus/evidence/round-21/runtime/na-delayed.json` | `146adde4fffeea41ed4307e12c39c41a1ac2f0d88634e95b86f652134b2344f2` | RCPT:525, EXEC:38 |
| HTML `corpus/evidence/round-21/runtime/na-delayed.html` | `adde17227bbabf98d082ee7797f0ea646dff613ba057f331ea0c204070eae279` | RAW:10, EXEC:39, expectations:141 |
| PRODUCER `scripts/webmcp-lifecycle-round21.mjs` | `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` | RCPT:4–6, measure:23 |
| EXEC `.ufo/waves/round-21/runtime-execution-finalized.json` | `65b52c0c65176d7a89f888b1f94686d4df6ca25eb747e4bf733ff4203bab7fe4` | not pinned by any file read |

RAW frames (`seq`, `dir`, `at` last digits). Every `seq` is array index plus one:

| seq | dir / label | at | Key fields | Lines |
|---|---|---|---|---|
| 12 | observation `pre-action` | …714847 | `formActive` true; `submits` [] | 167–183 (formActive 179) |
| 13 | action `requestSubmit` dispatch-started | …714847 | | 184–190 |
| 14 | action-complete | …714848 | | 191–196 |
| 15 | observation `delayed-before-release` | …715100 | one submit: `agentInvoked` 206, `isTrusted` 207, `active` 209, `respondWith` 210; `formActive` 217 | 197–221 |
| 16 | `release` | …715100 | | 222–226 |
| 17 | `WebMCP.toolResponded` | …715100 | invocation `6E3D45F0282C001E2A5FCCAB4DF99082`; `Completed`; output `{ok:true, nonce, q}` = `8aab9c3a-3485-4dfd-94de-4488f908909d` | 227–241 |
| 18 | observation `after-action` | …715602 | `formActive` false (262); submit `active` 254 | 242–266 |

- Mirrors (`pageObservations`): delayed entry lines 285–308 (seq 288, at 287, submits 291–299, `active` 296, `respondWith` 297, `formActive` 304). After entry lines 309–332 (seq 312, `active` 320, `formActive` 328).
- Hold seq 14 → seq 15 is 252 ms. Seq 15, 16, and 17 share one millisecond, so an `at`-only ordering cannot separate release from response.
- RCPT `na-delayed` (464–527): `preAction.responseCount` 0, `formActive` true (471–477); `after.responses` one Completed entry (482–492); `after.submits` (493–501, `active` 498); `after.pageState.submits` (505–513, `active` 510); evidence pin line 525. **The receipt has no field for seq 15 or seq 16.**
- HTML line 10 `const mode="delayed";`. Line 14 gates `respondWith` on `window.release`. The handler (lines 7–9) calls `preventDefault` and does not touch the form.
- PRODUCER line 222 pushes `action-complete`. Line 223 is `if (mode === 'delayed') { await sleep(250); await observe('delayed-before-release'); frame('release', {}); await bounded(page.evaluate(() => window.release()), …) }`. The release frame is pushed before its evaluate is dispatched.
- S100 (`.ufo/waves/round-21/sources/html_form_element.cc`): `:163–165` `:tool-form-active` = active tool && `CurrentlyRunning()`. `:261–275` `CallDoneCallback` runs the callback (:266), then clears running (:267). `:290–298` `HandleWebMcpToolResponse` returns early when not running (:295–297). `:380–399` and `:448–455` tool replacement can null the active tool without a done callback when `IsHandlingSubmit()` (nulled at :398, :454). `:790–806` respondWith continuation.

## 3. Integrated oracle: delayed-relevant predicates [VERIFIED by reading measure-c1.mjs]

- `:167–168` `seq === index+1` and non-decreasing `at`. Equal ms accepted. Fail → `semantic_timing`.
- `:174` `pageObservations` must equal the frame observations (label, at, seq, value). Fail → `evidence_binding page-observation-raw-link`.
- `:179–183` marker counts: pre 1, after 1, delayed `expected.delayed ? 1 : 0`. Fail → `semantic_timing observation-marker-set`.
- `:192–193` pre < action < complete < post. Fail → `semantic_timing`.
- `:244–245` `validatePageState` for pre and post **only**: form state, nonce, submit record (`:121–124`), errors, URL. **The delayed observation is never passed here.**
- `:247–249` any response for another invocation → `evidence_binding response-other-invocation`.
- `:250–253` exact status lists before pre and before post → `semantic_status finite-window-response-statuses`.
- `:280–293` exactly one response when `expected.response` is set (`response-count`), status (`outcome-status`), params (`exact-output-shape` / `exact-error-text-or-output-presence`).
- `:297–300` window bounds → `semantic_timing`.
- `:321–333` **delayed block** → `semantic_delayed active-before-release-and-response-after-release` if any of: delayed marker or frame missing; release count ≠ 1; not (complete.seq < delayed.seq < release.seq); hold outside [250, 10000] ms; `delayed.value.formActive` ≠ true; any matching response with seq ≤ release; no matching response; first matching response seq ≤ release; `delayed.value.errors` ≠ []; `delayed.url` ≠ `post.url`; `delayed.nonce` or `delayed.value` ≠ nonce.
  - **Not read in this block:** `delayed.value.submits` (length, `active`, `agentInvoked`, `isTrusted`, `q`, `respondWith`), `formExists`, `focused`, `secureContext`.
- `:334–335` a release marker in a non-delayed row → `semantic_delayed unexpected-release-marker`.
- `:158–159` fixture path, sha, and `raw.fixture.sha256 === expected.fixtureSha256` (expectations:141). Fail → `evidence_binding case-identity-or-fixture`.
- `:401` producer digest; `:417–423` execution `receiptSha256`, exact artifact key set, and per-artifact digests; `:433–438` receipt envelope; `:458–459` per-case `evidence.sha256` against raw bytes. All → `evidence_binding`.
- `:467–475` any finding → every row uncounted, `value` 0, `exit` 1, `verdict` failed.
- **`stdout` is never read.** The only `stdout` reference is `:491` (git helper).
- `expectations:147` `delayed.responseBeforeRelease` is never read (`grep` finds no reference in measure-c1.mjs).

## 4. Counterexamples, traced against the integrated oracle [INFERENCE]

**Coherence (PIN).** RAW changed → RCPT `cases[8].evidence.sha256` (line 525) updated → RCPT file sha changed → EXEC `artifacts[RCPT]` (21) and `receiptSha256` (47) updated → EXEC `artifacts[RAW]` (38) updated. The selftest's `resealAcquisition` (selftest:56–70) performs this automatically. EXEC stdout is not checked, so it need not change.

**Outcome.** Every red: exit 1, value 0 (`:467–475`). Finding sets are exact per the traced lines.

| ID | Mutation (exact) | Oracle result (exact set) | Note |
|---|---|---|---|
| **D1** | Swap RAW lines 222–241 so the response is seq 16 and release is seq 17. Both `at` stay …715100. | `{semantic_delayed: na-delayed:active-before-release-and-response-after-release}` | Caught by seq (`:330`). An `at`-only rule also passes this mutant, because the timestamps tie. |
| **D2** | Move the response to seq 12 with `at` …714847 (before pre-action). Shift seq 12–16 up by one. Receipt `preAction.responseCount` 0→1 (line 475). | `{semantic_status: finite-window-response-statuses; semantic_timing: response-outside-action-window; semantic_delayed}` | 3 ids. Not a single finding. |
| **D3** | Insert a Canceled `toolResponded` for the same invocation at seq 16 (before release). Shift release, response, after-action. Receipt `after.responses` = [Canceled, Completed]. | `{semantic_status: response-count; semantic_status: outcome-status; semantic_output: exact-output-shape; semantic_status: finite-window-response-statuses; semantic_delayed}` | 5 findings, 3 ids. |
| **D4** | Move the Completed response after after-action (seq 18). Receipt `after.responses` → []. | `{semantic_status: finite-window-response-statuses; semantic_timing: response-outside-action-window}` | **Not** `semantic_delayed`. The delayed block passes. |
| **D5** | RAW line 217 and mirror line 304: `formActive` true → false. Submit `active` left true. | `{semantic_delayed}` | Caught (`:329`). The source caveat in §2 means `formActive` must be checked directly. |
| **D6-coherent** | `submits[0].active` false at RAW 209, 254, mirror 296, 320, and receipt 498, 510. | `{semantic_status: na-delayed:post:submit-event}` | Caught by the **post** check (`:124`), not the delayed block. |
| **D6-partial** | `submits[0].active` false only at RAW 209 and mirror 296. | **GREEN** (exit 0 expected) | **GAP G1.** Seq 18 and the receipt still say `active` true, and no check compares them. |
| **D7** | `submits` = [] at RAW 204–212 and mirror 291–299. | **GREEN** | **GAP G1.** A vacuous submit passes. |
| **D7b** | Delete `respondWith` at RAW 210 and mirror 297. | **GREEN** | **GAP G1.** The mechanism that makes the case "held" is unchecked. |
| **D8** | Delete RAW release (222–226). Renumber response 16 and after-action 17. Mirror after seq → 17. | `{semantic_delayed}` | The release-count test short-circuits the condition at `:326`, so one finding is added. |
| **D9** | Delete RAW delayed marker (197–221) and mirror (285–308). Renumber release 15, response 16, after 17. | `{semantic_timing: observation-marker-set; semantic_delayed}` | 2 ids. |
| **D10** | Swap seq 15 (observation) and 16 (release). Mirror delayed seq → 16. | `{semantic_delayed}` | Caught (`:327`). |
| **D11** | Set `at` of RAW seq 15–17 and mirror delayed (287) to …714848. | `{semantic_delayed}` | Hold 0 < 250 (`:328`). **Not** `semantic_timing`. |
| **D12** | Delete RAW response (227–241). Renumber after to 17. Receipt `after.responses` → []. | `{semantic_status: response-count; semantic_status: finite-window-response-statuses; semantic_delayed}` | 3 ids. |
| **D13** | Change HTML line 10 to `const mode="success";`. Update RAW `fixture.sha256` (10), RCPT, EXEC. | `{evidence_binding: case-identity-or-fixture}` | Caught **only** by the pinned fixture sha (expectations:141). No semantic check of the mode literal. |
| **D14** | Mirror delayed `formActive` (304) → false; frame 217 stays true. | `{evidence_binding: page-observation-raw-link; semantic_delayed}` | 2 ids. The delayed block reads the mirror. |
| **D15** | Use `fixtures/positive-ordered.json` (r21 synthetic) as the base. | Red on fixture pins for all 12 rows (`:159`); also `semantic_timing observation-marker-set` and `semantic_delayed` for na-delayed | Not a positive. See G5. |
| **D16** | Edit only EXEC line 17 token `na-delayed pre=0 statuses=Completed` → `statuses=none-in-window`. | **GREEN** | **GAP G2.** Stdout is never read. |
| **D17** | Insert a second `release` frame before the response (renumber). | `{semantic_delayed}` | Caught (`:326`, release count ≠ 1). |

Also caught, not tabulated: a response for another invocation → `evidence_binding response-other-invocation` (`:249`). A late response after after-action is the same class as D4.

## 5. Preserving positives (traced against the integrated oracle)

- **P1 · finalized na-delayed as retained** (RAW `146adde4…`, RCPT `4bc79636…`, HTML `adde1722…`, EXEC `65b52c0c…`, PRODUCER `bc11e4d6…`). Every delayed condition in `:326–332` holds: release count 1 (frame 16), complete 14 < delayed 15 < release 16, hold 252 ms within [250, 10000], `formActive` true, `errors` [], `url` equal to post, nonce and value equal to nonce, and the response (17) after release. **No `semantic_delayed`.** Margin: 252 ms against a 250 ms minimum (see G7).
- **P2 · equal-millisecond tie.** Ordering uses seq (`:327`, `:330–331`). Frame `at` uses non-strict monotone (`:168`). Seq 15, 16, and 17 all at …715100 pass. A strict-`at` rule would fail P1.
- **P3 · after-action inactivity is allowed.** `expectations:145` expects `post.formActive` false, and the delayed block constrains only the pre-release observation. Seq 18 `formActive` false passes.
- **P4 · auto-positive early response is genuine.** `auto-positive.json` has toolResponded at seq 12 before pre-action at seq 13 (lines 170–184 and 185–209), pre-action `formActive` false (line 205). Expectations `auto-positive` (lines 162–174) set `responseWindow` pre-action, pre `formActive` false, and `submitCount` 1. The delayed block is not applied (`expected.delayed` absent, `:334`).
- **P5 · na-pending.** `responseWindow` none (expectations, na-pending row). No response required outside delayed mode.

## 6. Gaps and fixes (required before release)

- **G1 · delayed submit record unvalidated (MEDIUM).** `:321–333` never reads `delayed.value.submits`, `respondWith`, or `agentInvoked`. `expectations:147` carries no submit expectation. D6-partial, D7, and D7b are GREEN. The delayed row therefore does not verify that the agent's respondWith promise was taken before release, which the knowledge note (note:45, "active intermediate state before release") implies. **Fix:** add `delayed.submits` to the expectation (length 1; `agentInvoked` true; `isTrusted` true; `q` equal to nonce; `active` true; `respondWith` "function") and validate it in the delayed block. Also require the seq-15 submit record to equal the seq-18 record (same event).
- **G2 · EXEC stdout unbound (LOW–MEDIUM).** D16 is GREEN. Stdout carries per-case `statuses=` and `pre=` tokens that contradict the raw if edited. **Fix:** either bind the tokens to the receipt or state in the note that stdout is narrative, not evidence.
- **G3 · selftest inclusion assertion (MEDIUM).** `selftest-c1.mjs:356` is `ids.includes(expected.finding)`. Cascades in D2, D3, D9, D12, and D14 pass with any superset. **Fix:** assert the exact id set (or multiset) per row, using the §4 sets.
- **G4 · early-response mutant also moves `at` (LOW).** `selftest-c1.mjs:216` sets `frame.at = beforeRelease.at - 1`, so an `at`-only oracle would pass the test. **Fix:** add the seq-only variant (D1): response before the marker with equal `at`. The oracle catches it by seq (`:330`); the selftest should prove that.
- **G5 · positive base is the synthetic seed (HIGH for the selftest).** `selftest-c1.mjs:13` and `:45–54` load `fixtures/positive-ordered.json` (sha `aa372626…`, identical in the lane and the clone). Its HTML is `<form>fixture-nonce-independent-NN</form>` (for example positive-ordered.json:24), so `raw.fixture.sha256` ≠ the pinned `expected.fixtureSha256` (`:159`, expectations:141) for all 12 rows. The positive (expected exit 0, value 12) is red. **Fix:** build the base from the retained finalized bytes under `corpus/evidence/round-21/runtime/`, and keep the synthetic seed only as negative controls.
- **G6 · dead expectation field (LOW).** `expectations:147` `delayed.responseBeforeRelease` is never read. **Fix:** delete it, or enforce it so it cannot claim coverage that is absent.
- **G7 · hold margin (LOW).** `minMs` 250 equals the producer sleep (PRODUCER:223). The retained hold is 252 ms. A valid run at 249 ms would be red. **Fix:** document the tolerance, or lower `minMs` with a stated reason.
- **Fixture semantics (LOW, acknowledged).** The served mode literal (D13) is checked only through the pinned fixture sha. An author who changes HTML, RAW, RCPT, EXEC, `expectations:141`, and the `EXPECTATIONS_SHA256` constant (measure:22) passes this check. The note already says self-consistency is not an outcome oracle (note:26–27). Recorded here as a known limit, not a new counterexample.

## 7. Carried-over items

- **B4 · red convention [VERIFIED].** Any finding → value 0, exit 1 (`:467–475`). Confirmed. A missing marker in a parsed raw is evaluable and must stay exit 1 (D9).
- **B6 · causal wording.** The release frame is pushed before the evaluate (PRODUCER:222–223). Seq order proves "no response before the marker", not that release caused the response. The note's "only after release marker" (note:45) complies. Keep it that way.
- **B7 · source caveat.** `formActive` cannot be inferred from response order (S100 `:380–399`, `:448–455`, `:295–297`). The oracle checks it directly (`:329`), which is correct. Keep it direct.
- **B8 · stale W2 delayed reviews (debt).** `.ufo/waves/round-21/w2/SemanticNaDelayed.md:9,13`, `TraceNaDelayed.md:11–12,40`, and `FixtureNaDelayed.md:18–20` cite RAW `50fb7f14…`, RCPT `323ccd59…`, HTML `4dd942c5…`, producer `5363d576…`, and timestamps …1792588030xxx. These match `.ufo/waves/round-21/history/runtime-v4/` (`history/index.json:21–26`). **[VERIFIED]** `sha256sum .ufo/waves/round-21/history/runtime-v4/na-delayed.json` = `50fb7f14…`. The finalized acquisition is `146adde4…` (`history/index.json:27–33`). TraceNaDelayed's claim that `receipt.json:523–525` pins `50fb7f14…` is false for the current receipt, whose line 525 pins `146adde4…`. `round21-closure.json:66` already concedes W2 reviewed the bounded acquisition. Under `SKILL.md:2421`, r22 debt text must not cite these W2 files as semantic evidence for current bytes. The finalized delayed claim rests on `round21-closure.json:48` and on this seat's direct reading, which agree.

## 8. Boundary decisions

- A response for another invocation is red (`evidence_binding`, measure:249). The frozen r21 exit-0 rows (`expected.json:160` late response, `:162` foreign response) are therefore **not** inherited by r22. Keep that property in the selftest.
- A late response after after-action is red (`semantic_status` + `semantic_timing`, D4). Keep it red.
- The hold lower bound (D11) is owned by the delayed block here, so the finding is `semantic_delayed`. AttackWindows may prefer `semantic_timing`. Choose one before release and write it into the expectation.

## 9. Not checked

- No execution. Every outcome is a static trace of a file whose sha is in the header. L1 must run the oracle and the selftest to confirm or refute §4 and §5.
- The selftest draft is incomplete; G3–G5 may already be in progress.
- The CDP emission path is not retained, and Chromium behavior was taken from S100 only.
- Peer reports were not read.

## 10. Tooling record

No installs or updates. Tools used: file reads, `grep -n`, `sha256sum` (coreutils), and one read-only `node -e` SHA-256 of an embedded fixture file.
