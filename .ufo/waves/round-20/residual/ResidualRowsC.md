# ResidualRowsC: round 20 rows LC07, LC08, LC09

Baseline: ac10319843f718489a10b89a8d2a568879aaf980. Read-only review: no edits, no Git/jj mutation, no tests, counters, selftests, builds, gates or formatters run, no tools installed or updated.

## Verdict

- LC07: ENTAILED
- LC08: ENTAILED
- LC09: ENTAILED

No REWRITE is required. Each row's condition and outcome is entailed by the S096 lines in its span, and the manifest, note and SKILL renderings agree. The rows make no runtime, capability or scalar claim, and none is needed.

## Identity checks

- Source `corpus/evidence/round-20/sources/html_form_element.cc`: sha256 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, matching the manifest `source.sha256` and design.json; 1740 lines.
- Spans: LC07 261-275, LC08 290-298, LC09 298-319. These match decisions.json rows (lines 63-64, 71-72, 79-80), design.json:76-79, 84-87, 92-95, design-declared.json (same spans), and the anchors at note 118-120 and SKILL 2279-2281.
- Quotes are literal substrings of one line inside the span: LC07 line 266 `std::move(done_callback_).Run(result);`; LC08 line 295 `if (!tool->CurrentlyRunning()) {`; LC09 line 311 `could not be serialized to JSON")));`.
- Mirror: the LC07-LC09 condition and outcome text reads identically in decisions.json (lines 61-62, 69-70, 77-78), note (118-120) and SKILL (2279-2281). Literal search confirmed the key sentences in all three files. Checklist items 6-7 cite the same rows (note 137-140; SKILL 2298-2301).
- Superseded rows (note 35-37, SKILL 2223-2225) were not reviewed as current.

## Row evidence

### LC07: CallDoneCallback, source 261-275

- 263-265 `if (done_callback_.is_null()) { return; }`: "Null returns before cleanup". The null arm writes no state. ENTAILED.
- 266 `std::move(done_callback_).Run(result);`: the only stored-callback delivery in the span, a direct callsite. The callback body is not in 261-275, so "outside this span" is correct. ENTAILED.
- 267, 269, 270 (`is_currently_running_ = false`, `active_submit_button_ = nullptr`, `invocation_id_ = std::nullopt`) all follow Run. At delivery time these still hold pre-completion values, which is what "invokes Run(result) before clearing running/button/invocation fields" says. ENTAILED.
- 268 captures `old_submit_button` after Run returns. 271 `form_->PseudoStateChanged(...)` is unguarded on the held-callback arm. 272-274 notify the old button only under `if (old_submit_button)`. ENTAILED.

### LC08: HandleWebMcpToolResponse, not-running arm, source 290-298

- 294 `CHECK(tool);` precedes the guard. The row does not name it; the note's preamble ("stated CHECKs hold") covers it.
- 295-296 `if (!tool->CurrentlyRunning()) { return; }`: the predicate is read at handler entry, and the return precedes the resolve/reject split at 298. No CallDoneCallback or ReportException call occurs in 295-297. ENTAILED.
- `CurrentlyRunning()` has no definition in S096. Every occurrence is a call site (164, 169, 295, 722, 788, 825, 839). The row uses only its return value as a predicate and makes no body claim. ENTAILED as scoped.

### LC09: serialization failure on the resolved object arm, source 298-319

- 298 `if (resolved) {` and 300 `if (value.IsObject()) {` define the "resolved object arm". ENTAILED.
- 303-304 `if (v8::JSON::Stringify(...).ToLocal(&json_string)) {`, with the else arm at 307. The else arm is entered when ToLocal returns false. The row makes no claim about Stringify internals or which JavaScript objects reach this arm. ENTAILED.
- 308-312: `tool->CallDoneCallback(base::unexpected(ScriptToolError(kToolInvocationFailed, "respondWith promise resolved with an object that could not be serialized to JSON")));` then `return;`. This is a method call with fixed text. The return precedes the fallback at 316-318 and the success call at 319. ENTAILED.
- Running state: the only CurrentlyRunning check in HandleWebMcpToolResponse is 295. None appears in 298-327. "Passed the CurrentlyRunning guard at handler entry" is therefore the only running-state claim, and it is correct. The 308 call is not re-guarded by CurrentlyRunning. Its delivery depends on LC07's null test at 263, which the row states ("Stored-callback delivery is conditional as in LC07"). ENTAILED.
- ReportException appears only at 322 (LC10), so the LC09 arm has no reporting call. The row makes no reporting claim. ENTAILED.

## Distinctions checked

1. Direct callsites and assignments versus callee effects. The rows claim only direct callsites (266, 271, 273, 295, 303, 308, 319) and direct assignments (267, 269, 270). Callee internals are not claimed: the stored callback body, PseudoStateChanged effects, JSON::Stringify, the CurrentlyRunning accessor and ReportException.
2. Handler-entry versus callback-time state. LC08 and LC09 use handler-entry state (295). LC07 is the callback-time row: 266 runs before 267-270. No row conflates the two.
3. Method call versus stored delivery. LC08 makes no call. LC09's calls at 308 and 319 are method calls whose delivery is conditional on the null test at 263. LC07's 266 is the only actual delivery in these spans.

## Non-blocking notes (no change required)

- The checklist phrase "form pseudo-state notification is unconditional after cleanup" (note 137-138; SKILL 2298-2299) holds on the held-callback arm. The null arm returns at 264 before cleanup, and LC07 states this.
- LC07 does not state that `is_currently_running_` is still true during Run. This follows from 266 preceding 267, and the row's "before clearing" wording expresses it.

## Verification exercised

- Read-only inspection of decisions.json, note 70-200, SKILL 2199-2361, source 174-338 with grep-mapped callsites, and the design.json and design-declared.json spans.
- `sha256sum` and `wc -l` on S096: pin matches; 1740 lines.
- Literal text search of the LC07-LC09 sentences across the three renderings.
- Not run: tests, the measure-c1.mjs counter, selftests, builds, gates, formatters.
- Tool installs or updates: none.

Report: .ufo/waves/round-20/residual/ResidualRowsC.md
