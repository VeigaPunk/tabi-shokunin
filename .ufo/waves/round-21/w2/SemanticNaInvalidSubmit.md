# SemanticNaInvalidSubmit — `na-invalid-submit` semantic review (round21 C1, w2)

Godspeed axes: (1) observation fidelity — raw case JSON/HTML vs receipt; (2) receipt correlation — invocationId-bound status/errorText/output; (3) note/SKILL decision agreement; (4) source-interpretation boundary — inside registered S100 anchors or explicit S101 observation-only. All paths relative to the lane root. Method: static reads, the `grep` tool for literal anchors (no LSP server is mounted for `.mjs`/`.cc`/`.json`/`.md`; text+digest fallback recorded here), read-only sha256 arithmetic. No gate, selftest, browser, or screenshot execution. No tools installed; nothing to record under the tooling directive.

## Verdict: scoped agreement — no contradiction found

Every claim in the note row and SKILL decision row for `na-invalid-submit` is byte-supported by the current acquisition (`corpus/evidence/round-21/runtime/`, producer sha256 `5363d576f52e72dc4e82d5838706aa307f371648e73242eed99e9776f06eceb9`, run bounded 13:07:02.041Z–13:07:14.098Z), and the S100 interpretation sits inside the registered anchors.

## Correlated result, re-derived from raw

Case `corpus/evidence/round-21/runtime/na-invalid-submit.json` (sha256 `ca703c843237671ec435efd9797ff4e70e1e02884b714ef5f4e2c34e488919b0`, equal to `receipt.json` case `evidence.sha256`; fixture sha256 `8a64d21d2b704dee05e8e734e4b9f381f0ff764f37931702d5fa47745d60be0e` equal to case `fixture.sha256`):

- seq 9 `WebMCP.invokeTool` input `{q:"4bc374a5-2705-4aae-a1ae-bd295b12b0fb"}` (nonce, since case mode is `success`); seq 10 result `invocationId C07B3CBD3C55966BDC7CDB9BEBA364BD`; seq 11 `toolInvoked` same id; seq 15 sole `toolResponded`, same id, `status:"Error"`, `errorText:"Form validation failed: q: Please fill out this field.. "` (trailing space present in raw bytes). Exactly one `toolInvoked` and one matching `toolResponded`; no foreign ids in the case.
- Finite windows: `preAction` 1792588031343→1596, 253 ms, `responseCount:0`, `formActive:true`; `after` 1596→2098, 502 ms, responses cutoff at observation seq 16 — `toolResponded` (seq 15) inside, later frames excluded by the marker rule. Receipt `receipt.json:528-565` matches the case JSON field-for-field (`responses`, `submits:[]`, `navigations:[]`, `pageState`).
- Page state: pre-action value = nonce, `formActive:true`, `focused:"go"`; after-action value `""`, `formActive:false`, `focused:""`, url unchanged `http://127.0.0.1:35363/na-invalid-submit`, `errors:[]`. Page-listener `submits` empty at both markers.
- No navigation: receipt `requests` has GET `/na-invalid-submit` at 1792588031328 followed by GET `/auto-positive` at 1792588032317 — no `/landing` request in this case's span. Current-run stdout (`.ufo/waves/round-21/runtime-execution-bounded.json:16`) records `LIFECYCLE_OBSERVED na-invalid-submit pre=0 statuses=Error`, matching the receipt.
- Producer action (`scripts/webmcp-lifecycle-round21.mjs:186` region, `invalidRequestSubmit` arm): sets `[name=q].value=''` then `form.requestSubmit()` — exactly the note's "clear the required field after agent fill; requestSubmit". Fixture HTML (served bytes, mode `success`) has `required` text input, no `toolautosubmit`, no `type=email`.

## ErrorText is source-derived, not transcribed lore

Registered S100 body (`.ufo/waves/round-21/sources/html_form_element.cc`, decoded sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, verified equal to `source-opening.json.decodedSha256` and the note header) at the note's cited span **729-758**:

- `:729` `if (!skip_validation && !ValidateInteractively()) {`; `:730` `should_submit = false;` — no submit event dispatched on the failure path (the `SubmitEvent` construction lives in the `else` branch at `:760+`), matching `submits:[]`, `navigations:[]`, unchanged url, and no `/landing` GET.
- `:733` appends `"Form validation failed: "`; `:749-752` appends `GetWebMCPParameterName()` ("q", per the observed `toolsAdded` inputSchema at seq 5), `": "`, `control->validationMessage()`, `". "`.
- Chromium's `validationMessage()` for an empty required text input is "Please fill out this field." — composed with `:752`'s `". "` suffix this yields exactly `Form validation failed: q: Please fill out this field.. ` including the double period and trailing space. **The `.. ` is derived output, not a note typo; any future "fix" of it in the note would be a regression.**
- Cross-check of the same template: `auto-invalid.json:178` `"…'not-an-email' is missing an '@'.. "` — validationMessage ending in `.` plus the same `". "` suffix. Template consistency holds across both validation rows.
- The error surface is the native validity branch (`ScriptToolErrorCode::kToolInvocationFailed` via `CallDoneCallback`, `:756-758`), distinct from `na-reject` ("respondWith promise was rejected") and `na-throw` (preventDefault programming-error text) — decision rule 5's non-collapse requirement is met by three distinct raw errorTexts.

## Note/SKILL agreement and boundary containment

- Note `corpus/knowledge/webmcp-nonautosubmit-round-21.md:41` quotes the errorText byte-identically to the raw JSON and says "no submit event" — both confirmed above.
- Boundary text "S100:729-758; this is submit-time validation after a page-side mutation, not initial-fill refusal": 729-758 sits inside the registered S100 anchors `174-328,635-842` (note header); validation demonstrably runs in the submission path, not the fill path (pre-action: fill accepted, `formActive:true`, `responseCount:0`, no error; error only after explicit `requestSubmit`). The contrast with `auto-invalid` (response already in the initial window, receipt shows pre responseCount=1) is what "not initial-fill refusal" means, and the raw supports it.
- SKILL.md `:2378` pairs `na-invalid-submit` with `auto-invalid` under "Distinguish later native-submit validation from initial fill refusal" — a decision-guidance row, consistent with the raw contrast; SKILL `:2365-2367` correctly labels S101 own-work runtime evidence with S100 reopened interpretation, no source-binary equivalence claimed.
- No row claim reaches outside its anchor: post-error `:tool-form-active:false` and focus loss (receipt `pageState`) are recorded but deliberately uninterpreted in the note — correct, since deactivation implementation lies outside the cited span. Pre-action `focused:"go"` matches the S100 quote retained in `source-opening.json` ("Without `toolautosubmit`, we focus the submit button…", `html_form_element.cc:213-214`); the note cites 212-218 only for `na-pending`, not here — no overclaim.

## Findings by severity

- Fatal/major/minor: none. No contradiction between note row, SKILL row, receipt, raw case JSON, fixture HTML, and S100:729-758.
- Info-1: protect the `.. ` trailing-space errorText from cosmetic "corrections" — it is source-derived (`:733` + `:751-752`).
- Info-2: `after` window is 502 ms (≥500 gate floor) and `toolResponded` arrived ~2 ms after action-complete; the row's outcome is comfortably inside the recorded window — no window-edge fragility for this case.

## Residual risk and verification gaps

- "No submit event" is a finite-window, page-listener-plus-frames observation (both markers, 253/502 ms) corroborated — not proven universally — by S100:730; the note correctly bounds it as observed.
- `requestSubmit()` was called with no submitter on a form/button without `novalidate`; `novalidate`/submitter-`formNoValidate` skips (`:713-715`) are unexercised here and unclaimed.
- Digest and membership checks here are my static re-derivations on working-tree bytes; the serial gate run (`measure-c1.mjs REV`) remains L1's final verifier, per lane bounds.
