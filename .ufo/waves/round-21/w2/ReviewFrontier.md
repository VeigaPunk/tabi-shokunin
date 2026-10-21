# ReviewFrontier — round-21 bounded runtime frontier

## Findings, by severity

### P3 — LOG still routes the current acquisition to an archived producer

**Concrete attack:** follow the round-21 wave record's explicitly current execution link, then correlate its producer digest with the canonical runtime receipt.

- `LOG.md:1387-1391` says `runtime-execution-final.json` names **the current producer** and the output moved into `corpus/evidence/round-21/runtime/`.
- `.ufo/waves/round-21/runtime-execution-final.json:9,12-14` instead records `runtime-candidate`, producer SHA-256 `847d046710a0dd5e61d966f4cb985052bca1966c75481a16d9cc931aa3a786d4`, and the earlier navigation-only repair.
- `.ufo/waves/round-21/history/index.json:15-24` explicitly classifies that acquisition as historical v3 and `runtime-execution-bounded.json` as current.
- The current acquisition (`runtime-execution-bounded.json:9,12-15`) names `runtime-bounded-candidate` and SHA-256 `5363d576f52e72dc4e82d5838706aa307f371648e73242eed99e9776f06eceb9`. The canonical receipt (`corpus/evidence/round-21/runtime/receipt.json:4-6`) and a read-only SHA-256 calculation of the current script have that latter digest.

**Effect:** a reader following LOG's current-producer assertion reaches the old producer/run, which does not establish the newly documented bounded-window and cleanup repairs. This is a documentation routing defect, not evidence that the bounded run failed or that twelve branches were discovered. The knowledge note correctly names the bounded acquisition at lines 2 and 49-50.

**Recommendation:** change the current-acquisition reference to `runtime-execution-bounded.json`, and describe final/v3 as archived history. No production change was made by this reviewer. This exact stale-pointer observation was also sent to `TabiR21.ReviewExecutionProvenance` for deduplication.

## Axes and scope

Axes: finite frontier entry; receipt/raw population honesty; no coverage/capability/branch-novelty inflation; precise current-versus-historical acquisition routing.

Read-only review of the actual diff against `e7cf11a810003d4a65cc85bd265f2c17dd65b738`, the current producer/counter/selftest and persisted fixtures, the canonical runtime records, the round-21 knowledge note, and the relevant README/SKILL/SCORECARD/LOG and wave-history records. The assigned README/frontier paragraphs have no additional actionable overclaim identified below. This is a scoped recommendation, not independent admission or a general verification result.

## Specific falsification attacks and evidence

### 1. Treat twelve as twelve new non-autosubmit branches or a coverage denominator

The population is **ten non-autosubmit cases plus two autosubmit controls**, not twelve new branches:

- Producer `scripts/webmcp-lifecycle-round21.mjs:14-27` declares exactly those twelve configurations.
- Counter `.ufo/waves/round-21/measure-c1.mjs:9-17,45-46,72-73` fixes the ID population and configurations. Its result is zero on findings, otherwise the number of receipt cases (`:100`); it computes no domain denominator or coverage percentage.
- `corpus/README.md:470,472-476` explicitly retains the controls as held ground, acknowledges the older pending/requestSubmit probes, rejects independent-branch and twelve-novel-entry readings, and calls C1 bounded depth with scalar8 unchanged.
- `SCORECARD.md:976-985` calls 0→12 a **target**, names the finite observation metric, and preclaims neither a new capability nor retirement; saturation8/window3 remains unchanged. This is not a measured whole-axis promotion.
- The cited historical probe is real prior text: `.ufo/waves/round-17/w1/C2ProbeDeclarative.md:71-73` already records a 2500 ms no-response interval followed by page `requestSubmit()` and `Completed`. Current README does not relabel it a new discovery.

### 2. Read “enters the frontier” as closing the entire runtime frontier

`corpus/README.md:472-476` limits entry to these finite loopback fixtures. Lines 478-481 leave real-site/agent-side consumption, other builds, default profiles, custom elements, arbitrary DOM-update cancellation, late settlement and repeated-run determinism open. The source-to-Arch-binary relationship is explicitly unproved there. The registered census pointer at `:483` names a generic registry/knowledge census, not lifecycle coverage: `.ufo/waves/round-20/counts.mjs:11-14` counts source rows and Markdown notes and emits no capability or coverage ratio.

### 3. Promote finite pending/delayed observations into eventual guarantees

- Current `na-pending.json`, `frames` seq10/11, retains returned/invoked ID `1C19BCCE55B6BF9ED2F28E332BE16412`; seq12 and seq15 observe active state. No matching response frame is present. The receipt case's windows are **254 ms** and **501 ms**, not an indefinite observation (`receipt.json:21-51`; raw lines 146-213).
- Current `na-delayed.json` has pre-observation seq12, intermediate active-state observation seq15, release seq16, matching `Completed` seq17 and post-observation seq18. The receipt's after window is **754 ms**. This measures the controlled release, not arbitrary late settlement.
- `corpus/knowledge/webmcp-nonautosubmit-round-21.md:32,40,50-52,60-67,96` and README `:479-480` preserve those finite limits.
- Producer `:204-209,219-225` refuses an unusable invocation before action, records action acknowledgement and uses observation sequence cutoffs. Counter `:83-96` checks the recorded identity/order/summary relationships. This static reading is not a new execution of those paths.

### 4. Convert navigation-related loss of page state into an observed zero

The current native-submit raw trail retains navigation seq15, matching `Completed` seq16 with `[{"dummy":"landing"}]`, and a landing-document observation seq17 without the old `submits` property (`na-native-submit.json:197-250`). Receipt `.cases[] | select(.id=="na-native-submit") | .after.submits` is **null**, with one navigation. The knowledge note `:35` calls this unavailable, not observed zero; producer `:225` and counter `:96` retain that distinction. This evidence does not claim that the old document's submit count was observed after navigation.

### 5. Count source interpretation or selftest fixtures as extra runtime evidence

- Current receipt `.cases` contains exactly twelve rows; counter input paths `measure-c1.mjs:24-27` select the canonical runtime prefix, not archived v1/v2/v3 directories.
- The knowledge note `:14-21,36-37` separates S101 own-work observations from S100 interpretation and places reset/removal outside S100's immutable anchors. README `:470,480-482` preserves the same distinctions.
- The current synthetic fixture, `.ufo/waves/round-21/fixtures/positive-ordered.json`, has `.files["scripts/webmcp-lifecycle-round21.mjs"] == "fixture producer, never executed"` and a minimal synthetic note. It is a counter-control input, not another browser acquisition. `selftest-c1.mjs:10-11,106-117` consumes this fixture and the independent expected-output file.
- `expected.json` contains **43 declared controls**, five exit0 expectations (including baseline0) and 38 exit1 expectations. Relevant finite-population/order controls include missing/duplicate case, short window, missing marker/ack, late-response-outside-window versus late-response-summary, foreign-response-ignored versus foreign-response-summary, and unavailable-null-positive versus unavailable-to-empty. Their definitions and expectations were inspected; none were executed here and no pass count is asserted.

## Read-only population correlation

Data anchors below are `corpus/evidence/round-21/runtime/<id>.json` frame sequence numbers, compared with the canonical receipt case of the same ID. Response invocation IDs match the receipt IDs in the inspected raw event projections. All ten non-autosubmit receipt cases report pre-action count0 and active state true; both autosubmit controls report pre-action count1 and active state false.

| Case ID | Pre / after window ms | Raw matching response seq / status | Post observation seq |
|---|---:|---|---:|
| na-pending | 254 / 501 | none in retained trail | 15 |
| na-click | 255 / 542 | 14 / Completed | 16 |
| na-requestsubmit | 254 / 503 | 15 / Completed | 16 |
| na-native-submit | 252 / 503 | 16 / Completed, landing JSON-LD | 17 |
| na-reset | 253 / 501 | 15 / Canceled | 16 |
| na-remove | 253 / 502 | 15 / Canceled | 16 |
| na-reject | 254 / 504 | 15 / Error | 16 |
| na-throw | 252 / 503 | 15 / Error | 16 |
| na-delayed | 254 / 754 | 17 / Completed, after release seq16 | 18 |
| na-invalid-submit | 253 / 502 | 15 / Error | 16 |
| auto-positive | 253 / 502 | 12 / Completed, already before pre seq13 | 16 |
| auto-invalid | 254 / 501 | 12 / Error, already before pre seq13 | 16 |

Thus the retained population is twelve finite scenarios, with five Completed events, two Canceled events, four Error events and one finite no-response case. Those arithmetic totals are not branch counts or a coverage fraction. Read-only `sha256sum` results for all twelve case JSON files matched their receipt `.evidence.sha256` values. Canonical receipt SHA-256 observed: `323ccd591d82a8867903ea859ae45bac46eb0beb42bf27997aefac9c8773e6a6`.

## Residual risk and verification gaps

- The counter is a relationship/digest gate, not a semantic prose gate. `measure-c1.mjs:27,59-65` does not include README among its input paths and checks only limited note provenance/case presence. A later README inflation is not mechanically excluded by these controls. Current prose was reviewed directly; no generalized prose-safety claim follows.
- No committed-revision counter arms, CLI selftests, builds, linters, formatters, browser run or general verification were executed. The 0→12 metric remains for L1's final serial measurement; twelve rows in the retained receipt do not substitute for that committed-revision result.
- No authenticity against a malicious evidence author, source-to-binary equivalence, repeated-run determinism, universal hang/signal safety, actor quiescence, routing/resume admission or source-diversity conclusion follows. The note itself bounds authenticity and fault-injection claims at `:100-106` and `:62-67`.
- Language-server interface unavailable: reading `xd://lsp` returned **“No such tool”** and no mounted lsp device. Status/references/definition/diagnostics could therefore not run. Literal search and direct source/data reading were the fallback, not semantic LSP proof.
- Tooling: read-only diff inspection and SHA-256 arithmetic only in addition to file/data reads; no tool installation or update, no delegation, no browser, no production/index/git/jj mutations. The only filesystem write by this reviewer is this report.

Report: .ufo/waves/round-21/w2/ReviewFrontier.md
