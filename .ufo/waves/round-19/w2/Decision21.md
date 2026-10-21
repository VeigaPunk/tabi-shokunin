# Decision21 — DV-21 semantic falsification

**Recommendation: DISAGREE with DV-21 as worded; AGREE with its three concrete recorded outcomes.** Advisory only, not claim admission. One medium scope defect and one low counter-binding gap; neither is a newly reproduced browser failure.

## Scope and axes

- Primary axis: **depth** — the condition must follow from the cited implementation and the observed cases, rather than a broad date-format label.
- Supporting review axes: **calibration** — separate observations from source-derived extrapolation; **operability** — determine what the C1 counter actually authenticates. No axis score or saturation verdict is assigned here.
- Baseline B: `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Attacked checkpoint R: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Read PLAN through its final revision, especially lines 139–146. The frozen eligible families and revised decision contract govern this review.
- Read-only review of DV-21, its date-time fixture/cases, retained primary bodies, receipt observations, the relevant SKILL/knowledge prose, and the predicates that count it. No browser, full counter, suite, mutation probe, external fetch, or alternate runtime was invoked.

## Findings, ordered by severity

### P2 / medium — replace the blanket “non-ISO string” condition with the actual nonempty-sanitizer predicate

**Affected locations:** `corpus/evidence/round-19/validation/decisions.json:523-546`; `SKILL.md:2080`; `corpus/knowledge/webmcp-declarative-validation-round-19.md:53-55`.

The manifest and SKILL say that a date, time or datetime-local input receiving a non-ISO string produces a fill-time error. The knowledge note repeats that generalization. The source does **not** implement an ISO-conformance predicate. Its cited token is a nonempty-result test on the native input sanitizer, after string conversion, with an explicit empty-string success branch immediately above it.

In retained S077, decoded lines 311–313 are exactly:

```cpp
  if (s.empty()) {
    return true;
  }
```

Consequently, `""` is an explicit exception to the claimed generic string rule, even though it is not an ISO date/time representation. More generally, noncanonical text that a native sanitizer can normalize is not excluded by this predicate. The retained HTML specification also describes normalization of a valid local date/time string, not an equality check against the advertised format string (S082, decoded lines 3053–3061). I do not claim a particular additional normalized spelling was exercised in Chromium.

**Source-derived counterexample, not a runtime result:** a recognized, single date/time/datetime-local control supplied `""` passes this fill validator. In this fixture all four temporal controls are optional (`fixtures/date-time.html:3-6` and receipt schema `required: []`), so filling all four with `""` would not be rejected by this fill predicate. Whether a complete invocation finishes successfully is not newly observed by this seat. A required empty control would instead be eligible for later native constraint validation; it would not turn this branch into a fill-time rejection.

The three actual probes use **nonempty locale-formatted examples**. They substantiate those examples and the source-native rule, not all strings described as non-ISO. This is a scope defect, not a reason to discard their genuine observations.

**Exact correction recommended for the manifest condition and SKILL condition:**

> A nonempty JSON string is supplied for a single named date, time or datetime-local input and its native sanitizer returns empty; measured examples are date=`10/21/2026`, time=`1:45 PM`, and datetime-local=`10/21/2026 1:45 PM`.

**Exact replacement answer:**

> Fill-time Error `Invalid value "<v>" for parameter <name>` before any input values are applied; all controls retain their pre-call values and no autosubmit is attempted. In the measured fixture they remain empty.

**Exact replacement for the temporal sentence at knowledge-note lines 53–55:**

> The tested nonempty locale-formatted date/time/datetime-local strings sanitize to empty and fail at fill. The fill predicate is native sanitization, not a general ISO validator: the empty string explicitly passes this gate. The tested out-of-range values pass fill and fail later during toolautosubmit constraint validation, before a submit event is dispatched.

Keep the existing three probe ids, success control, source digest, source token and line range. They correctly bind the narrower claim. Do not present an empty-string temporal success case as newly measured without obtaining that evidence separately.

### P3 / low — C1’s fresh/committed projection omits the observed fields and raw response needed to audit “nothing filled”

**Affected locations:** `.ufo/waves/round-19/measure-c1.mjs:484-507,673-711`; supporting producer `scripts/webmcp-validation-round19.mjs:1043-1062,1115-1146`.

The harness checks expected post-invoke fields and schema. However, the counter’s `receiptObservation` retains only status, error text and submit count; `comparableReceiptRecord` uses that projection. The fresh/committed equality check therefore does not compare `observed.fields`, `observed.schema`, or `observed.toolResponded`. Both records must carry `pass: true`, but the counter does not independently rederive that flag from the committed record’s omitted observations.

**Static consequence [INFERENCE; no mutant run]:** changing only a committed DV-21 record’s `observed.fields.time` to a nonempty value, while preserving its expected values, summary triple and `pass`, leaves every value examined by these decision predicates unchanged. Similarly, contradictory raw `toolResponded` contents would be outside the comparison. That means the count alone cannot attest that the delivered raw observations establish the prose’s no-fill assertion. The actual records inspected here are consistent; this is not an allegation of falsified evidence.

**Correction:** for the fields/schema that a case expects, independently compare each committed and fresh observation with the case expectation, and compare their stable field/schema results. Also require each summary status/error to agree with its raw `toolResponded` when present. Invocation/frame ids should remain excluded from cross-run equality because they legitimately differ. A contradiction must reject the decision even when a stored `pass` flag remains true. This is a targeted counter-strength recommendation, not a request to rerun the entire C1 workflow in this seat.

## Re-derived source proposition and exact binding

All source accesses in this review were **2026-10-21**, from retained bodies decoded locally with `/usr/bin/zcat`; no live origin was contacted.

### S077 — primary implementation supporting DV-21

- URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT
- Retained path: `corpus/evidence/round-19/sources/form_mcp_schema.cc.gz`.
- Observed decoded SHA-256: `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` — exactly the manifest’s `bodySha256`.
- Manifest range: decoded **302–318**. Exact token `!input->SanitizeValue(s).empty()` is present at decoded **316**.
- `corpus/SOURCES.md:91` records S077 as mined/opened `2026-10-21`, with that decoded digest and the Chromium tag/commit.
- Decoded **49–69**: conversion accepts a JSON string, integer, double or boolean; unsupported JSON kinds fail conversion. This is not general JavaScript `String(value)` coercion.
- Decoded **256–269**: date, datetime-local, month, week and time dispatch through `ValidateTextData`. DV-21’s three input types are genuinely on that path; month/week are not additional runtime DV-21 probes.
- Decoded **302–318**: require one control, require conversion, accept an empty converted string, otherwise require a nonempty native-sanitizer result for an input.
- Decoded **208–241**: validate every supplied parameter before applying any values. The exact comment at **210** is “If the data isn't valid, form control states remain unchanged.” A rejected temporal value therefore does not cause the form to be filled with the sanitized empty value: the call returns before the application loop. Existing values would be preserved, not cleared.
- Decoded **222–231**: rejected convertible values use the quoted-value diagnostic; rejected unconvertible values use the diagnostic without an interpolated value. Thus null is not the string `"null"` and does not justify extending DV-21’s quoted template to every JSON type.

**Entailed proposition:** for a supplied, recognized single built-in temporal input and a nonempty convertible string whose sanitizer returns empty, the entire FillData call returns invalid-input error before its value-application loop. The cited 302–318 range proves the validator predicate; supporting 208–241 proves the whole-call mutation/error behavior. It does not entail the broader ISO classification used in the current condition.

### S078 — caller establishing ordering, not a timer-based guess

- URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT
- Retained path: `corpus/evidence/round-19/sources/html_form_element.cc.gz`.
- Observed decoded SHA-256: `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`.
- Decoded **174–221**: ExecuteTool calls FillFormControls and returns its error before reaching the autosubmit branch.
- Decoded **235–258**: FillFormControls parses an object, constructs FormMCPSchema, checks the submit-button precondition when needed, and delegates to FillData.
- Decoded **717–759**: interactive constraint validation precedes submit-event dispatch. A later validation failure is distinct from DV-21’s earlier fill failure.

Therefore `submitCount: 0` by itself would not distinguish fill failure from native constraint failure. The diagnostic, retained field state and canonical caller ordering do distinguish them. The fixture has `toolautosubmit`; do not generalize its completion timing to forms that need a user submit button.

### S082 — normalization context only

- URL: https://html.spec.whatwg.org/multipage/input.html#local-date-and-time-state-(type=datetime-local)
- Retained path: `corpus/evidence/round-19/sources/input.html.gz`.
- Observed decoded SHA-256: `9782129b804f60f85c5701d071b52e50b9067469fc4191fd2a372a8a9931c1d4`.
- Decoded **3053–3061**, local-date-and-time state: the sanitizer normalizes valid local date/time text and otherwise produces empty. This is normative context, not an independently observed Chromium normalization case.

## Re-derived runtime proposition from the recorded observations

The following are readings of **`observed.toolResponded`, `observed.fields`, and `observed.submitCount`**, not merely the case expectations or receipt summary. All record-local invocation ids agree between the response and invocation in the inspected cases.

| Logical case | Actual input distinction | Actual raw response | Submit count / post-invoke state | Exact receipt anchors |
|---|---|---|---|---|
| `decl-date-time-01` (control) | All four valid values: `2026-10-21`, `13:45`, `2026-10-21T13:45`, `2026-10` | Completed; output echoes all four values | 1; all four values retained | `receipt.json:376-465`, response `413-425`, state `452-458` |
| `decl-date-time-02` (probe) | `date: "10/21/2026"`; other three inputs valid | Error: `Invalid value "10/21/2026" for parameter date` | 0; date/time/datetime/month all `""` | `receipt.json:467-548`, response `504-508`, state `535-541` |
| `decl-date-time-03` (probe) | `time: "1:45 PM"`; other three inputs valid | Error: `Invalid value "1:45 PM" for parameter time` | 0; all four `""` | `receipt.json:550-631`, response `587-591`, state `618-624` |
| `decl-date-time-04` (probe) | `datetime: "10/21/2026 1:45 PM"`; other three inputs valid | Error: `Invalid value "10/21/2026 1:45 PM" for parameter datetime` | 0; all four `""` | `receipt.json:633-714`, response `670-674`, state `701-707` |
| `decl-date-time-05` (contrast, belongs to DV-22) | Four out-of-bound values | Error beginning `Form validation failed: date:` | 0; all four nonempty attempted values remain | `receipt.json:716-796`, response `753-757`, state `784-790` |

The fixture starts each field empty: `fixtures/date-time.html:3-6` has no value attributes. Cases `-03` and `-04` supply otherwise-valid values alongside the invalid one, so observing all four still empty is useful evidence against partial application in these fixtures. It is not a runtime test with prepopulated temporal values.

`validation/probes/date-time.json` contains ten observation entries: repetitions 1 and 2 for each of five logical cases. Both repetitions have the same statuses and call counts; the control’s recorded submit event has `agentInvoked: true` and `isTrusted: true`, while each DV-21 probe’s calls array is empty. These are repetitions of a logical case, not ten distinct decisions or an id collision in the committed receipt.

## Prose/case/counter consistency checks

- **Manifest ↔ SKILL:** condition/answer and all three probe ids, control id, S077 and 302–318 match (`decisions.json:523-546`; `SKILL.md:2080`). This agreement preserves the same overbroad condition; it does not repair entailment.
- **Knowledge note:** lines 35–42 correctly distinguish all-before-apply fill failure from later native constraint failure. Lines 53–55 repeat the ISO overstatement and should receive the correction above. Lines 71–72 correctly describe fill-time failure as no change, not clearing. Lines 73–75 concern schema enforcement and do not replace the native-sanitizer predicate with an ISO check.
- **Probe ownership:** structured manifest query found each of `decl-date-time-02/-03/-04` owned by DV-21 alone; no duplicate probe ids anywhere in the manifest. Its `decl-date-time-01` control is also DV-22’s control, which is permitted: uniqueness applies to probes, not shared success controls.
- **Receipt ids:** structured `group_by(.id)` query over the 66 receipt cases found zero duplicates. All five date-time records have `pass: true`; only four are DV-21’s probe/control set.
- **Case definitions:** the literal definition sweep found exactly one definition of each temporal id, in `cases/date-time.json` at lines 8/43/78/113/148. This is a text fallback, not LSP semantic proof. The counter separately detects case-definition duplicates at `measure-c1.mjs:396-398`, receipt duplicates at 469–481/621–628, and probe reuse at 564–576/823.
- **Control strength:** `-01` is in-family, uses the same fixture and successfully submits all four temporal values. It is a real success control, not an unrelated tool or a missing-response pseudo-success. It does not cover empty strings, null or alternate scalar types.
- **Case assertions:** the producer compares full per-case diagnostic substrings, all four fields, schema expectations and submit count (`webmcp-validation-round19.mjs:1043-1062`). The manifest’s shared `Invalid value "` substring alone is weak, but these case-level checks are more specific.
- **Source/counter binding:** source open date, mined status, digest, gzip decoding, line bounds and exact token are checked at `measure-c1.mjs:579-610`. These establish byte provenance, not that a token entails a natural-language condition. SKILL row checks at 543–559 require ids/source presence but do not compare the condition/answer prose to the manifest; this is another reason not to equate a counted row with semantic truth.
- **Fresh-reproduction design:** `measure-c1.mjs:748-801,834-876` clones the selected revision, uses the pinned Node/harness, checks runtime and producer, and compares the selected observations. That source was inspected, not executed here. The projection limitation is finding P3 above.

## Residual risk and verification gaps

1. There is no temporal empty-string, null, boolean, numeric, array/object, duplicate-name or prepopulated-value probe in the five date-time cases. Source-only deductions about them must remain labeled as such. Field-level null would fail conversion before sanitization and use the unquoted diagnostic; top-level null is a separate CDP-boundary question, not evidence for DV-21.
2. The harness waits for the matching response (up to 8 s) and then snapshots the page (`webmcp-validation-round19.mjs:1115-1133`). That is not a general proof against arbitrary page-scheduled later submissions. For these simple fixtures, the no-autosubmit conclusion is also supported by the early-return caller path in S078; no sleep-duration assumption is needed.
3. No new browser execution or C1 count at R was performed. I make no 27/27 claim, no whole-family saturation claim, and no claim that a static suggested mutation was actually rejected or accepted in a run.
4. LSP was unavailable: reading the `xd://lsp` device returned `No such tool: xd://lsp`. Thus status, references, definition and diagnostics could not be requested. Literal searches are recorded only as text sweeps; control-flow conclusions come from the cited source bodies, not a purported semantic index.
5. The ranged gzip reader returned an empty archive directory for the nonempty S077 text stream. I used zcat and the retained decoded output instead; the mismatch was reported to `xd://report_issue`.

## Observed verification and provenance

All paths in the commands below are absolute; all executed commands were read-only and finite.

- `/usr/bin/git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse --verify refs/heads/master` returned R exactly.
- Read the actual B→R diff. The selected SKILL/note/date-time cases/fixture diff consists of four files with 351 added lines and no removals; the manifest, producer and counter are also new-at-R review inputs.
- A single `/usr/bin/git ... diff --quiet --no-ext-diff --no-textconv R -- <reviewed files>` returned exit 0, binding the inspected SKILL, SOURCES, note, manifest, date-time cases/fixture/probe, receipt, three retained bodies, producer and C1 counter to R. No git writes occurred.
- `/usr/bin/zcat <absolute retained body> | /usr/bin/sha256sum` produced the S077/S078/S082 decoded hashes listed above. The manifest’s exact S077 token and line range were then inspected in the decoded output.
- `/usr/bin/sha256sum` of the scoped producer/case/fixture produced:
  - producer: `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4`;
  - `cases/date-time.json`: `f6531c28bf9efead2ceabf1517e7e5016c6b7192097e10b4979a66a0f3d62b90`;
  - `fixtures/date-time.html`: `85f518f6699ffc01ceca85effacd086fb7cb5e5f77429a803ad909ac03eb7683`.
  These match receipt fields at `receipt.json:20,23,40`.
- Recorded runtime identity is Chromium `154.0.8037.97` / Playwright `1.64.0` / Node `24.21.0` (`receipt.json:4-18`), matching producer pins at `webmcp-validation-round19.mjs:35-37`. This is a retained-identity check, not re-attestation of a running browser.
- Structured JSON reads performed on 2026-10-21: manifest probe ownership/duplicate grouping; receipt id grouping and temporal observations; raw-family probe grouping by logical case and repetition. Results: three uniquely owned DV-21 probes; zero receipt duplicate ids; one successful in-family control; three recorded fill rejections; two original probe repetitions per case.
- Tools installed or updated: **none**. Processes left running by this seat: **none**.

## Isolation

- Clone path: none — report-only static review; no runtime or mutation probe required a sandbox.
- Branch: none.
- Baseline B: `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Attacked/read commit: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Reviewer production commit: none; no production files changed.
- Changed paths: only `.ufo/waves/round-19/w2/Decision21.md` in LANE. No fleet, sibling, browser-profile or domain-source writes.
