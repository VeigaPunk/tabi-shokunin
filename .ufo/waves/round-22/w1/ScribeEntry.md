# ScribeEntry — round 22 lifecycle outcome oracle (report-only draft)

Seat: `TabiR22.ScribeEntry` (leaf scribe). Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Output: this file only. No production docs, no `SKILL.md` edit, no `corpus/` write, no oracle/measure file, no browser, network, service, REA, or install action. No installs were needed; no pacman transaction; no tool or package was installed or updated.

Exercised verification: `sha256sum` over the S101/S100/producer files listed in §2, and read-only reads of the round-21 raw case records and receipt. Nothing else was run. No check below is claimed beyond that.

## 1. Findings

1. **Recorded semantics are fixed and reopenable.** S101 (own-work round-21 raw acquisition, `corpus/evidence/round-21/runtime/`) records one observed status/output/error per case for all twelve rows. Those values are reproduced in §3 as the candidate fixed expectations. They are transcribed from S101 raw bytes, not computed from the evaluated receipt; BuildOracle must write them as literals in `corpus/evidence/round-22/semantic-expectations.json`.
2. **Digests are intact.** `receipt.json`, all twelve per-case JSON files, the S100 decoded body, and the producer match the digests recorded by the round-21 finalized execution record (§2). The twelve HTML fixtures were not re-hashed in this wave.
3. **Round-22 oracle inputs do not exist yet in the lane.** `corpus/evidence/round-22/` is absent. `.ufo/waves/round-22/measure-c1.mjs` is absent. The BuildOracle clone holds only the round-17..21 counters. This draft therefore defines expectations only; it asserts no receipt or count.
4. **Five timing and shape hazards the oracle must not flatten** (§4): `after.responses` on the two autosubmit cases repeats a response that occurred before the action marker; `na-native-submit` submits is `null` (unavailable), not `[]`; its output is an array, not an object; two validation strings carry a trailing `.. ` and locale-dependent native validation text; `na-delayed` has an observation inside the after window that must be ordered against the release marker.
5. **Separation of evidence classes is kept.** Recorded semantics (S101) are distinct from S100 source interpretation, from new browser observations (none in round 22), and from structural tests (the round-21 counter and its all-silent selftest population, which are frozen and are not outcome evidence).

## 2. Reopened digests (this wave)

| Path (lane-relative) | sha256 observed | Matched against |
|---|---|---|
| `corpus/evidence/round-21/runtime/receipt.json` | `4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034` | `receiptSha256` and `artifacts[...receipt.json]` in `.ufo/waves/round-21/runtime-execution-finalized.json` (match) |
| `corpus/evidence/round-21/runtime/{na-pending,na-click,na-requestsubmit,na-native-submit,na-reset,na-remove,na-reject,na-throw,na-delayed,na-invalid-submit,auto-positive,auto-invalid}.json` | f17fe86f…b796e, 36502a28…927ba, 4b8245d7…30ca8fa, 28a20412…eebc9b5, 097b8833…9ec4, e7e32f5f…339e69, a57b41bd…f741, e46d751e…9d1a, 146adde4…44f2, e7712c1b…5506f, 62f257e9…e0fe, 28a37c0e…26aed (full digests in the artifacts map) | each matches its `artifacts` entry (12/12) |
| `.ufo/waves/round-21/sources/html_form_element.cc` | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` | `decodedSha256` in `.ufo/waves/round-21/source-opening.json` (match) and S100 registration |
| `scripts/webmcp-lifecycle-round21.mjs` | `bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811` | `producerSha256` in `runtime-execution-finalized.json` (match) |
| `corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md` | `39a19b0faf7a88f3ecff3079092b6191ca2c9ffd51e3c3a53f53855cf7e20ec4` | current bytes; source of the S101 first line |

Per-case frame trails were reopened for `na-pending`, `na-throw`, `na-delayed`, `auto-positive`, `auto-invalid`. The other rows are anchored to the `receipt.json` case summary only; their per-case frame trail was not reopened here.

## 3. Draft knowledge entry — `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` (not written)

```markdown
source: S101 — corpus/evidence/round-21/runtime/receipt.json (sha256 4bc79636d0dfd54d5b18b41ff36ecb9b5f9474141beb0d82c8c61de29f937034) and per-case raw bytes corpus/evidence/round-21/runtime/<id>.json, digests as listed in .ufo/waves/round-21/runtime-execution-finalized.json; S100 — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT (decoded sha256 8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916; interpretive only)
verified-at: 2026-10-21 (round 22; receipt.json, the twelve per-case JSON digests, the S100 decoded body and the producer digest reproduced by sha256sum; per-case frame trails reopened for five rows; no new browser run; HTML fixtures not re-hashed)
recheck: sha256sum corpus/evidence/round-21/runtime/receipt.json corpus/evidence/round-21/runtime/*.json must reproduce the digests in .ufo/waves/round-21/runtime-execution-finalized.json; the oracle is counted with node .ufo/waves/round-22/measure-c1.mjs FULL40HEXREV only after BuildOracle lands it (no count is asserted here)

# Lifecycle outcome oracle — explicit recorded semantics (round 22)

## Scope

This entry fixes the actual recorded outcome of each of the twelve round-21 non-autosubmit and autosubmit control cases, so an oracle can distinguish case semantics rather than only counting well-formed observations. It is a finite recorded population on Chromium 154.0.8037.97, Playwright 1.64.0 and Node 24.21.0, under the recorded flags and private loopback fixtures. No new browser run was made for round 22; no new branch coverage is claimed.

## Evidence classes

- **Recorded semantics (S101):** the status, output, errorText, navigation and submit fields in the S101 raw records. These are the only source for expected outcome values.
- **Source interpretation (S100):** Chromium `html_form_element.cc` at the registered line ranges. It explains branches; it does not establish an outcome value and does not establish runtime behaviour.
- **New browser observations:** none in round 22.
- **Structural tests:** the round-21 structural counter and its selftest population. Silent synthetic fixtures are not runtime evidence and are not a semantic oracle. The round-21 counter stays frozen.

## Expected recorded semantics (12 rows)

Status classes: `pending` (finite), `completed`, `canceled`, `error`. The status and text fields are exact. `navigations` and `submits` are checked as recorded.

| Case | autosubmit / action / mode | Recorded status | Recorded output or errorText (exact) | Recorded side fields | Class | Raw anchor |
|---|---|---|---|---|---|---|
| na-pending | false / none / success | none in pre- or after-window (`responses` []) | — | formActive true before and after; submits []; navigations [] | pending (finite) | na-pending.json seq 11 toolInvoked, seq 15 after observation |
| na-click | false / click / success | Completed | `{ok:true, nonce, q}` with q = nonce | one submit: agentInvoked true, isTrusted true, active true; navigations [] | completed | receipt.json case summary |
| na-requestsubmit | false / requestSubmit / success | Completed | `{ok:true, nonce, q}` | one submit: agentInvoked true, isTrusted true; navigations [] | completed | receipt.json case summary |
| na-native-submit | false / submit / success | Completed | array `[{"dummy":"landing"}]` | submits null (post-navigation, unavailable — not []); one Navigation to `/landing?q=<nonce>`; formExists false | completed (navigation) | receipt.json case summary |
| na-delayed | false / requestSubmit / delayed | Completed, only after explicit release | `{ok:true, nonce, q}` | seq 15 observation "delayed-before-release" has no toolResponded; seq 16 release; seq 17 toolResponded Completed | completed (delayed) | na-delayed.json seq 15–17 |
| na-reset | false / reset / success | Canceled | `Tool execution cancelled by a form reset` | formExists true; formActive false; value "" | canceled | receipt.json case summary |
| na-remove | false / remove / success | Canceled | `Tool execution cancelled, since tool definition was updated` | formExists false | canceled | receipt.json case summary |
| na-reject | false / requestSubmit / reject | Error | `respondWith promise was rejected` | one submit; page error `Uncaught Error: dummy rejection`; navigations [] | error | receipt.json case summary |
| na-throw | false / requestSubmit / throw | Error | `The site has a programming error: it called preventDefault() on the 'submit' event, without also calling respondWith() with the tool result` | one submit; page error `Uncaught Error: dummy submit handler throw`; navigations [] | error | na-throw.json seq 15 toolResponded, seq 16 after observation |
| na-invalid-submit | false / invalidRequestSubmit / success | Error | `Form validation failed: q: Please fill out this field.. ` (trailing `.. `, exact) | submits []; navigations [] | error | receipt.json case summary |
| auto-positive | true / none / success | Completed in the pre-action window (responseCount 1) | `{ok:true, nonce, q}` | pre-action submit present; response precedes the pre-action marker | completed (autosubmit control) | auto-positive.json seq 12 toolResponded before seq 13 pre-action observation |
| auto-invalid | true / none / invalid | Error in the pre-action window (responseCount 1) | `Form validation failed: q: Please include an '@' in the email address. 'not-an-email' is missing an '@'.. ` (exact) | submits []; response precedes the pre-action marker | error (autosubmit control) | auto-invalid.json seq 12 toolResponded before seq 13 pre-action observation |

Class totals: pending 1; completed 5 (click, requestSubmit, native, delayed, auto-positive); canceled 2 (reset, remove); error 4 (reject, throw, invalid-submit, auto-invalid).

## Oracle boundary

An oracle row is credited only when status, exact text or output shape, navigation, submit fields, window ordering and digests all match the row above. A status match alone is not semantics. The expectations are authored as fixed literals. They must not be recomputed from the evaluated receipt.

Window rule: a response counts for a case only if its sequence falls inside that case's recorded window. For autosubmit cases the response precedes the action marker; `after.responses` repeating it is not evidence of an after-window response.

## Limits

- One build, one environment, private loopback fixtures, dummy input and generated nonces; no real site, default profile, human witness or cross-build claim.
- The windows are finite (pending: 254 ms pre + 503 ms after). A missing response is not an eventual-settlement guarantee.
- Validation strings are Chromium 154 native text under the recorded locale.
- The recorded argv is the Node producer invocation, not the complete effective Chromium command line.
- S100 supplies branch interpretation only; it does not prove output mapping, navigation, or binary equivalence.

## Rejected claims

- Any oracle count is a branch-coverage ratio.
- A structural counter that passes all-silent synthetic input proves semantics.
- `after.responses` for an autosubmit case is an after-window response.
- `Completed` implies `respondWith` ran; `Completed` on a native submit is a navigation-carried output.
- A status match with an unchecked text, shape or ordering field is a semantic pass.
```

## 4. Caveats for the oracle and the parent (exact)

- **F1 — autosubmit `after.responses` is not window-scoped.** `auto-positive.json` seq 12 `toolResponded` at 1792590716712 precedes the pre-action marker (seq 13, 716965); the receipt `after.responses` (window 716965–717466) still lists it. `auto-invalid.json` seq 12 at 1792590717647 precedes seq 13 (717898); its receipt `after.responses` lists the Error (window 717898–718399). The oracle must check response sequence against the window marker, not list membership.
- **F2 — `na-native-submit` submits is `null`, not `[]`.** Receipt `na-native-submit.after.submits` is `null` with a navigation. The oracle must distinguish null (unavailable) from [] (observed none).
- **F3 — `na-native-submit` output is an array** (`[{"dummy":"landing"}]`), unlike the object outputs of the other Completed rows. `semantic_output` must check shape per row.
- **F4 — exact string hazards.** `na-invalid-submit` ends with `.. ` (double period plus space). `auto-invalid` uses browser-native validation wording. Both are exact-match and environment-pinned.
- **F5 — `na-delayed` ordering.** The before-release observation (seq 15) lies inside the after window; `semantic_delayed` must order it against the release marker (seq 16) and toolResponded (seq 17), not treat any in-window observation as settled.
- **F6 — per-case frame trails not reopened for six rows** (na-click, na-requestsubmit, na-native-submit, na-reset, na-remove, na-reject, na-invalid-submit). Their rows rest on the receipt summary; the next wave should reopen these raw records before any row is credited.
- **F7 — partial-mismatch credit rule is unspecified in the contract.** The contract says `value` is 12 only after explicit semantics but does not state how a single mismatched row is credited. Parent must decide; this draft does not decide it.

## 5. SKILL decision table — round-22 lifecycle outcome oracle (draft; not written to `SKILL.md`)

Mirror of the round-21 section at `SKILL.md:2363-2406`. Insert as a new section after the round-21 registry; leave round-21 rows unchanged.

### Round-22 lifecycle outcome oracle — decision table (draft)

Current note: `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` (S101 own-work raw; S100 interpretive). Source callsites are not runtime completion.

| Observed situation (S101 recorded) | Required reading | Oracle class | Evidence case |
|---|---|---|---|
| Filled non-autosubmit form, no action, no response in pre or after windows | Finite pending only; never an indefinite guarantee | pending | na-pending |
| Input click or page requestSubmit, Completed object output | Completed; agentInvoked/isTrusted do not prove a human submit | completed | na-click, na-requestsubmit |
| Native form.submit, Completed array output with navigation | Navigation required; submits null means unavailable, not zero | completed (navigation) | na-native-submit |
| Held respondWith promise, explicit release, then Completed | Completed only after the release marker; before-release window has no response | completed (delayed) | na-delayed |
| Form reset or tool definition removal | Canceled with exact errorText; not a generalization to every DOM mutation | canceled | na-reset, na-remove |
| Rejected respondWith, or preventDefault without respondWith | Error with exact errorText; page error recorded separately | error | na-reject, na-throw |
| Required field emptied, or autosubmit invalid email | Error with exact native validation text (trailing `.. `); no submit event | error | na-invalid-submit, auto-invalid |
| Autosubmit positive value | Completed already in pre-action window; control, not a new branch | completed (auto control) | auto-positive |
| Any status, text, shape, navigation or ordering mismatch with the row | Row not credited; no reclassification | — | — |

Oracle verdict map (draft; exit codes per contract):

| Condition | value | Verdict | Exit |
|---|---|---|---|
| All twelve rows match on every checked field and digest | 12 | clean | 0 |
| New expectations and note both absent | 0 | baseline | 0 |
| Partial new expectations or note present | 0 | failed | 1 |
| Any row mismatch | per F7 | failed | 1 |
| Git blob unreadable, malformed JSON, or unevaluable input | — | could-not-evaluate | 2 |

Finding names (for BuildOracle; each is a verdict on the row, not a count):

| Finding | Checks |
|---|---|
| semantic_status | observed status for the invocationId equals the row status; pending rows have no matching response in windows |
| semantic_output | output shape: object for completed-object rows, array for native |
| semantic_error | errorText byte-equal to the recorded text |
| semantic_timing | response sequence inside its case window; pre-action responses not counted as after-window |
| semantic_navigation | native row has exactly one Navigation to `/landing?q=<nonce>`; other rows have none |
| semantic_delayed | delayed row orders before-release observation < release < toolResponded |
| evidence_binding | per-case JSON and HTML digests match the round-21 finalized artifacts |
| case_set | exactly the twelve IDs, no extras, no duplicates |
| source_binding | S100 decoded body sha and note first line `source: S101` |
| input_shape | per-case JSON schema and action/mode consistent with the row |
| revision_input | the Git blob revision is full 40-hex and read without replace objects |

Not an oracle: the round-21 counter (`.ufo/waves/round-21/measure-c1.mjs`) stays frozen, is not imported, and its all-silent selftest population is not outcome evidence.

## 6. Boundaries

- Report only; no production file touched. Draft text in §3 and §5 is for parent integration.
- No count, pass, or receipt is asserted for round 22.
- Verification exercised: `sha256sum` in §2 only.
- Install/update record: none.
