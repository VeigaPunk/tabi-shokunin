# Decision01 — DV-01 semantic falsification

**Recommendation: disagree with DV-01 as universally worded; agree with the narrower, actually observed unknown-only case.** Three medium-severity findings below; no high/critical finding. This is an advisory review, not admission of C1 or the round.

**Axes:** depth, evaluated through source entailment, observation fidelity, condition/scope precision, and counter falsifiability. No route, axis, population, or judgment contract was changed.

Reviewed baseline **B = `66251bfc1aef393e4aec599e950a8deb867736bb`** and attacked checkpoint **R = `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`**. The lane's `refs/heads/master` resolved to R. The scoped B→R diff adds the round-19 SKILL section, decision manifest, and knowledge note; a read-only scoped worktree-versus-R comparison returned no diff. References below are lane-relative unless explicitly identified as decoded Chromium source lines.

## Findings — severity order

### P2 / D01-1 — Presence of an unknown key does not guarantee that key's error signature

**Affected:** `corpus/evidence/round-19/validation/decisions.json:11-12`; `SKILL.md:2060`; associated explanation in `corpus/knowledge/webmcp-declarative-validation-round-19.md:35-39`.

The condition is merely “An input key names no control,” but the answer promises the unknown-parameter error. The retained source performs name lookup **and value validation for each visited entry**, returning immediately at either failure (`form_mcp_schema.cc:211-231`). It does not first scan every name and prioritize an unknown-name error over earlier bad recognized values. Consequently the promised signature is not entailed for every input satisfying that condition.

**[INFERENCE; source-derived, not browser-reproduced]** For the fixture's text `query` control, an object visited as `query: null` followed by `unknown: "sentinel-only"` returns `Invalid value for parameter query` before reaching the unknown entry. A candidate payload is `{"query":null,"unknown":"sentinel-only"}`; transport/member-order behavior was not independently reproduced here. The same earlier-value failure applies to a recognized text parameter receiving an array or object: `ToString` has only string/number/boolean success branches (`:49-69`), and text validation rejects failed conversion (`:302-318`). Reversing which failing entry is visited first changes the selected error. This does **not** weaken the no-fill/no-submit conclusion for either fill error.

The single actual DV-01 probe has only `unknown: "sentinel-only"`; it establishes the narrower outcome perfectly but never tests competing invalid entries. DV-02's companion recognized value is valid, so it does not close this error-precedence gap.

The knowledge note also runs directly from “an unknown key, or a value” to the two `Invalid value` templates (`:35-39`), omitting the distinct unknown-key template. Reading that paragraph literally misclassifies this very probe. Its wording that all keys are validated should mean all entries must pass before fill, not that validation continues after an error.

**Exact correction recommended:**

- Change DV-01's condition, in both manifest and SKILL row, to: **“A well-formed object reaches FillData and its first failing entry has no parameter in the current form-control map (including a sole unknown key).”** If keeping only runtime-observed scope, use the still tighter **“An object supplies only the unknown string-valued key tested here.”**
- Keep the existing unknown-parameter error answer, but say **“no submit; control values unchanged”** and distinguish the observed single-key example from source-derived generalization.
- Add to the knowledge note: **“Validation returns the first failing entry. An absent parameter produces the unknown-parameter template; a recognized parameter with rejected data produces one of the two Invalid value templates. No supplied value is applied unless every entry passes.”**
- Widen DV-01's explanatory source coverage to `form_mcp_schema.cc:208-244`; the existing `214-219` token anchor correctly identifies the message but does not alone establish the second-pass/no-fill invariant. Cite S078's `ExecuteTool` error return for no-submit, as detailed below.

### P2 / D01-2 — Counter drops the actual field evidence for “controls unchanged”

**Affected:** `.ufo/waves/round-19/measure-c1.mjs:484-507,667-687`; claim at `decisions.json:12` / `SKILL.md:2060`.

`receiptObservation` retains only status, error text and submit count. `comparableReceiptRecord` therefore compares those three observed values, input, expected data and `pass`, but **not `observed.fields`**. `validateDecisionCases` requires both receipts' `pass: true` without independently reevaluating the committed field observations.

**[INFERENCE; static noninterference, not an executed mutant]** Changing only DV-01's committed `observed.fields.query` from `initial-query` to a changed value leaves every value consumed by these comparison/decision predicates unchanged. The producer, case and fixture hashes also remain unchanged. Thus the counter has no path to reject that contradiction to “controls unchanged,” even if the fresh reproduction has the correct initial value. The current receipt is internally consistent; this finding is a verifier blind spot, not evidence of an actual changed field in the recorded run.

The real harness is stronger than this projection: `scripts/webmcp-validation-round19.mjs:1043-1061` compares expected fields and schema, and `:1115-1146` constructs observations from the matching response and page state. That makes its fresh pass meaningful, but does not make contradictory committed raw field evidence disappear.

**Exact correction recommended:** include the claimed observed fields in fresh-versus-committed comparison, and independently compare each receipt's claimed fields against case expectations, rejecting missing required observations rather than trusting its stored pass bit. For DV-01 this means requiring both `query == "initial-query"` and `other == "initial-other"` in both observations. An isolated negative control that alters only the committed field value must reject DV-01. This control was not run here.

### P2 / D01-3 — SKILL's decision meaning is not bound to the checked manifest

**Affected:** `.ufo/waves/round-19/measure-c1.mjs:522-560`; `SKILL.md:2060`.

`indexDecisionRows` checks that DV-01 has one row and that the row contains its probe id, control id and S077 token somewhere. It never compares the condition or answer cells with `decision.condition` / `decision.answer`, nor the SKILL source line range with the manifest's range. Manifest parsing merely requires nonempty condition/answer strings (`:299-319`). Source validation binds a token to hashed bytes (`:579-610`), not the SKILL prose to those bytes.

**[INFERENCE; static, not an executed mutant]** Replacing only DV-01's SKILL outcome with its opposite while retaining the id/case/source tokens leaves these row predicates unchanged. A wrong source line number in the SKILL row is similarly invisible. Thus a numerical C1 result cannot be offered as semantic verification of this row, including after correcting D01-1.

**Exact correction recommended:** bind the condition and observed-outcome columns to the normalized manifest strings, and bind source file/line coordinates and case ids in their respective columns. Add an isolated prose-only contradiction control and a wrong-line-only control. Keep a human entailment review: token presence is useful integrity evidence, never proof that a source proposition entails the decision. No such control was executed by this seat.

## Re-derived source proposition — retained bodies, not a new fetch

Access date for the retained copies: **2026-10-21**. Both bodies were actually decoded using `/usr/bin/zcat`; the decoded streams were hashed using `/usr/bin/sha256sum`.

| Source | Exact retained body / decoded SHA-256 | Source URL / anchors |
|---|---|---|
| S077 | `corpus/evidence/round-19/sources/form_mcp_schema.cc.gz`; `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` | [Chromium tag 154.0.8037.97, form_mcp_schema.cc](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT), decoded `:208-244`, `:49-69`, `:246-258`, `:302-318`, `:1238-1255` |
| S078 | `corpus/evidence/round-19/sources/html_form_element.cc.gz`; `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` | [Chromium tag 154.0.8037.97, html_form_element.cc](https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT), decoded `:174-259` |

The **exact DV-01 source token** is **`there is no such parameter for the tool`**, present on decoded S077 **line 219**, inside the declared inclusive **214-219** range. The body hash matches `decisions.json:24-30`, the knowledge note's source metadata, and the S077 registry anchor at `corpus/SOURCES.md:91` (mined; opened 2026-10-21). No token/hash/location defect was found.

Re-derivation from that body:

1. `FillData` receives a JSON object, visits its entries and looks each name up in `name_to_controls_` (`:208-215`). The map is populated from the current form's listed controls; disabled/readonly native controls are skipped (`:1238-1255`). “No parameter in this map” is the precise predicate, not an arbitrary absence from a published JSON Schema.
2. An absent lookup returns `kInvalidInputArguments` and the unknown-name template (`:216-219`) **before reading/converting that entry's value**. Therefore null/number/boolean/array/object values on an absent key do not themselves switch to the recognized-value error branch. That value independence is source-derived, not a runtime result of the one string-valued probe.
3. A present lookup may instead fail its type-specific validator and return immediately (`:222-231`). No fill operation is reached until the first loop has finished successfully; filling is a separate loop (`:233-241`).
4. S078 `FillFormControls` parses/converts to an object and delegates to `FillData` (`html_form_element.cc:233-259`). `ExecuteTool` returns the error callback before entering its success/submission branch (`:174-221`). Hence the unknown-key error is a **fill-time** rejection, not a later form-constraint/submit failure. There is no need to infer this just from a quick post-response snapshot.
5. S077's token proves the local error branch, not the CDP status spelling by itself. The actual `Error` spelling and identical `errorText` are present in the raw observations below; the note also identifies the separate S079 emitter mapping. This seat did not independently reopen the inspector emitter body.

## Re-derived runtime proposition — existing receipt and raw probe

No runtime was launched. These are **retained observations**, not passes from a new run.

| Case | Actual input | Actual observation | Evidence |
|---|---|---|---|
| DV-01 probe `decl-unknown-param-01` | `{"unknown":"sentinel-only"}` | `commandError: null`; matching `toolResponded.status: "Error"`; `errorText: Input contains a parameter "unknown" but there is no such parameter for the tool`; submit count 0; `query: initial-query`, `other: initial-other`; `pass: true` | `validation/receipt.json:4579-4643`; raw matching invocation and response at `:4606-4617`; fields `:4632-4635` |
| In-family control `decl-unknown-param-04` | `{"query":"changed-valid"}` | `Completed`; null error; submit count 1; both response output and page fields show changed query / initial other; `pass: true` | `validation/receipt.json:4775-4837` |
| Supporting, not additional DV-01 credit: `decl-unknown-param-02` | valid query plus unknown | unknown-name Error; zero submits; both initial values | `validation/receipt.json:4644-4708`; assigned to DV-02 |
| Supporting, not additional DV-01 credit: `decl-unknown-param-03` | `queryId` key | unknown-name Error; zero submits; both initial values | `validation/receipt.json:4709-4774`; assigned to DV-03 |

Here `validation/` abbreviates `corpus/evidence/round-19/validation/`.

The original family probe has **two** `unknown-only` trials with the same string input and same Error, empty `pageState.calls`, and initial values. See `validation/probes/unknown-param.json:75-243,244-412`, specifically raw response `:156-162,325-331` and state `:228-241,397-410`. Its trial names are `unknown-only`, `unknown-plus-valid`, and `id-not-name`; the success control was added at integration and is supported by the integrated receipt, not falsely attributed to those initial trials (`cases/unknown-param.json:122-123`).

The fixture is passive before invocation: two text controls with those literal initial values (`fixtures/unknown-param.html:5-8`). Its submit handler records before preventing default/responding (`:11-18`). The harness correlates the response by invocation id and only then reads page state (`scripts/webmcp-validation-round19.mjs:1115-1133`). Thus the successful control exercises the same registration, form listener and observation path. The Error probe's invocation id is not a success signal.

### Null, coercion and timing challenge results

- **Unknown-key value `null` or another JSON type:** absent-name lookup precedes conversion; the source supports the same unknown error if that entry is reached. Not separately tested in the DV-01 receipt.
- **Known text key with null/array/object plus unknown key:** first-failure ordering matters; D01-1 is the resulting scope defect. Known text numbers/booleans can stringify, so schema type mismatch alone does not establish a competing failure.
- **Top-level null/array/string:** not a DV-01 input with an unknown member. The note and SKILL place these at the CDP object-admission boundary (`knowledge note:66-67`, `SKILL.md:2056,2067`); no inference was made that the DV-01 unknown-name branch handles them.
- **Submit timing:** the source callback return precedes the autosubmit branch. The receipt's zero is a response-time submit-event observation, not a claim that arbitrary page scripts can never submit later. No page-timer or infinite-duration absence claim is justified or needed for this passive fixture.
- **Unchanged state:** observed current values match fixture initial values. The retained source supplies the no-fill invariant; the snapshots alone would not prove absence of transient mutations or all possible page side effects.

## All relevant prose mentions and scope

- `SKILL.md:2040-2047` and knowledge note `:13-20` restrict the result to the pinned build, flagged loopback declarative fixtures and stated exclusions. These limits are material and consistent with the receipt; no cross-browser, real-site, or general JSON Schema entailment is established.
- `SKILL.md:2051-2056` and note `:35-42,71-72` distinguish fill errors from post-fill constraint errors. The no-fill/no-submit principle is supported for the reviewed rejection branch; the note's message-template/first-failure explanation needs D01-1's correction.
- `SKILL.md:2060` and manifest `:9-30` agree byte-for-byte in condition/answer meaning, but share the same overbroad condition. Source integrity is correct; the universal implication is not.
- Note `:43-47` and `SKILL.md:2088-2092` discuss name-based input and schema/enforcement distinctions. DV-01 establishes rejection of the absent `unknown` parameter, not every neighboring key/hidden/type rule; those other decisions were not re-reviewed here.
- No resume-continuity, rerouting, or saturation claim is part of this scoped DV-01 delta. Those generic reviewer checks are not claimed verified outside this assignment.

## Identifier and counter-strength checks

Read-only JSON queries observed **27 decisions, 46 probe references, no duplicate probe ids**, and **66 receipt case ids with no duplicates**. `decl-unknown-param-01` has exactly one decision owner (DV-01) and one receipt record. The four definitions in `cases/unknown-param.json` have no duplicate ids. Control `decl-unknown-param-04` has one receipt record and is shared by DV-01/02/03; that is allowed reuse of an in-family success control, not duplicate probe credit. No decision uses its own probe as its control.

Static positive protections: duplicate probe ownership `measure-c1.mjs:564-576,823`; duplicate case definitions `:383-408`; duplicate receipt ids `:469-481,621-632`; family and input/expected binding `:635-687`; completed control `:706-712`; source body/hash/token binding `:579-610`; producer/runtime/case/fixture maps `:834-865`; fresh reproduction at a checked-out canonical revision `:748-801`. Those are useful checks, subject to D01-2 and D01-3. The token check cannot decide entailment or error-precedence scope.

Receipt identity and locally observed hashes matched:

- Runtime in manifest, receipt and raw family probe: Chromium **154.0.8037.97** / Playwright **1.64.0** / Node **24.21.0**. The receipt describes the same canonical producer; no alternative runtime was invoked by this seat.
- Harness SHA-256: `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4`.
- `cases/unknown-param.json`: `89307220829295394255526288107c41eece58c5ddf1ab48d3ad03517e767e19`.
- `fixtures/unknown-param.html`: `cfd92ca512b59fe1d0e686d7071cc0013c940c969e8666c2342fc31231d609fe`.

These were compared to `receipt.json:20,36,53`; they establish byte binding, not a newly reproduced browser pass.

## Residual risk and verification gaps

- **LSP unavailable:** documentation lookup and an `xd://lsp` status request both returned `No such tool: xd://lsp`, with no mounted LSP device. Definition/reference/diagnostic queries could not be performed; literal grep was used only to locate text, not presented as semantic proof. Caller behavior above was read directly from retained source.
- No browser, harness, C1 counter, build/lint/test suite, or mutation run was performed. In particular, none of the recommended negative controls is reported as having passed or failed. First-failure examples are explicitly source-derived.
- Source bodies were decoded/rehashed locally, not re-fetched from upstream; external tag authenticity and the inspector emitter mapping were not independently rechecked by this seat. Scope is semantic entailment of DV-01 against the retained source and raw observations.
- Current DV-01 runtime evidence is credible for its single-key case. The principal semantic risk is treating that case as an unconditional diagnostic guarantee; the verifier risks are projecting away claimed field evidence and ignoring the SKILL row's meaning.
- Tools installed/updated: **none**. No persistent/background process was started. Production files and all other seats' reports were left untouched.

## Isolation

- Clone path: **none** — read-only semantic review; no runtime/mutation probe or production artifact was created.
- Branch: **none**.
- Baseline: `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Reviewed commit (40 hex): `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Authored production commit: **none**; no Git write or jj command was run.
- Changed paths: `.ufo/waves/round-19/w2/Decision01.md` only.
