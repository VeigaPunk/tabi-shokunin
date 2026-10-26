# RevQuoteRegrounding — w2 falsify: re-grounded Gate quotes S110/S114/S115 (tabi round 30)

## Verdict

I attacked the three re-grounded Gate quotes in `corpus/lessons/round-30.md` §"Re-grounded Gate quotes for S110, S114, S115" by re-opening both source files live from Chromium Gitiles at `refs/tags/156.0.8078.47` (`?format=TEXT`, base64-decoded) on 2026-10-26 and checking each quote for contiguity in the decoded bytes, the stated file:line, ≤25 words, and whether it grounds its own row's `teaches` in `corpus/SOURCES.md`; I also re-verified the §"The two-literal span" note against the bytes and the 154.0.8037.97 cross-tag claims. **All three rows hold**: each quote is the exact whitespace-normalised form of consecutive raw lines at its stated location (S110 `form_mcp_schema.cc:215-217`, S114 `html_form_element.cc:867`, S115 `html_form_element.cc:203-206`), word counts 8/1/7, the live refetch sha256s equal both the committed round-29 bytes and the rows' recorded digests (`904b75e7…152f`, `2a96a97b…6102`), and each quote grounds its row's teaches (S110: FillData's unknown-parameter branch, byte-identical at both tags; S114: the null-String navigation-sentinel `CallDoneCallback`, unchanged content, 154:829 → 156:867; S115: the new guard's condition + `kToolInvocationFailed`, absent from the 154 bytes). The two-literal-span note is byte-exact on every count (message 52 chars, 0 raw/0 normalised occurrences, each literal once, gap = `"` + `\n` + 28 spaces + `"` = 31 chars). Two precision observations, neither a quote defect: S110's SOURCES anchor cell says the guard was "inserted at 201-209" while the inserted run is exactly new lines 201-210 (S115's cell is the correct one), and S114's teaches' "+1 above line 197 and +11 at or below 200" is byte-true for the 175-339 block but the sentinel path itself moved +38 (five insertions accumulate above it) — the lesson's why-cell and the row's anchor column record the true numbers.

## What was attacked

- `corpus/lessons/round-30.md` §"Re-grounded Gate quotes for S110, S114, S115" (round-29 routed defect 2 fix): the three table rows' quotes, locations, and grounding claims, plus the §"The two-literal span" note.
- Cross-checks the lesson and rows assert: live refetch on 2026-10-26 with the same sha256 as the committed 156 bytes; S110's "byte-identical at both tags / span at 154.0.8037.97:215-217 too"; S115's "absent from the 154 bytes entirely"; S114's "(154:829 → 156:867)", "ScheduleFormSubmission (:862)", "S111's comment at :201-202".

## Method

- Normalisation parity with the frozen frontier counter: `scripts/check-frontier-admission.mjs:138-149` — `normalise = t.replace(/\s+/g, " ").trim()`; words = `collapse(q).split(" ")` non-empty count (`:152-153`). A quote "contiguous in the decoded bytes" was therefore tested in the strongest form: the quote must equal exactly the normalisation of the stated consecutive raw lines (no skipped content, no extra lines), and be a substring of the full normalised text (the counter's `g5-quote-located`).
- The three quotes were parsed programmatically from the lesson table (regex over the §-section), not hand-transcribed; the checker and its full output are committed as receipts (`receipts/verify_quotes.py`, `receipts/verify_quotes.out`).
- No tool installs were needed or performed (curl/base64/python3 already present); no subagents; no writes to lane tracked files (only this report + my output dir); scratch `/fast/scratch/hyaku/tabi-r30/RevQuoteRegrounding` used and removed after receipts were copied.

## Per-row verdicts

### S110 — holds

- Quote (8 words ≤ 25): `if (it == name_to_controls_.end()) { return ScriptToolError( ScriptToolErrorCode::kInvalidInputArguments,`
- Contiguous + at stated file:line: exact normalised match of raw lines 215-217 of the live 156 bytes — `215: "    if (it == name_to_controls_.end()) {"`, `216: "      return ScriptToolError("`, `217: "          ScriptToolErrorCode::kInvalidInputArguments,"`; also a substring of the full normalised text.
- Grounds S110's teaches: `FormMCPSchema::FillData` is defined at `form_mcp_schema.cc:208`, so 215-217 is FillData's unknown-parameter branch (error text at 218-219: "…but there is no such parameter for the tool") returning `kInvalidInputArguments` — the teaches' "FillData still rejects unknown parameters and invalid supported values". The why-cell's "invalid-value branch returns the same code at :221-230" is byte-true (224 and 228-229). The teaches' "form_mcp_schema.cc is byte-identical at both tags": live 154 decode sha256 `904b75e7…152f` == live 156 == committed == the row's recorded digest, and the same span matches exactly at 215-217 in the 154 bytes too.
- Verdict: **holds**.

### S114 — holds

- Quote (1 word ≤ 25): `executing_tool->CallDoneCallback(base::ok(String()));`
- Contiguous + at stated file:line: exact normalised match of raw line 867 of the live 156 bytes (`"      executing_tool->CallDoneCallback(base::ok(String()));"`); unique — 1 occurrence in raw and in normalised 156 bytes.
- Grounds S114's teaches: this is the null-String navigation-sentinel result. Byte context confirms the why-cell: `ScheduleFormSubmission(event, submitter);` at :862, then the `CurrentlyRunning()` block 863-868 with the sentinel at 867; the surrounding comment ("// Return a null string to indicate that a navigation has been // triggered.") and statement are byte-identical at 154:825-830 — the sentinel path is unchanged in content, present at 156:867, exactly the teaches' "null-String navigation-sentinel paths are unchanged". The why-cell's "(154:829 → 156:867)" is byte-true: the statement's unique 154 occurrence is line 829. "S111's comment at :201-202 describes the guard, not this sentinel": 156 lines 201-202 are `// Filling out the form controls dispatches \`input\` and \`change\` events,` / `// whose handlers may have detached the document.` — the guard's rationale comment, not the sentinel.
- Precision note (observation, low severity, no action): the teaches' compressed shift phrase "+1 above line 197 and +11 at or below 200" is byte-true for the 175-339 anchored block (154→156: old ≤199 shift +1, old ≥200 shift +11; e.g. 192→193, 197→198, 200→211, 258→269, 328→339) but must be read as scoped to that block: the sentinel path itself moved +38 (829→867) because five insertions accumulate above it (+1 at new 126, +10 at new 201-210, +7 at new 373-379, +5 at new 486-490, +15 at new 540-554). The row's own anchor column (729-758, 818-842 → 767-796, 856-880, all +38) and the lesson why-cell record the true numbers, so nothing cited is wrong — but a reader taking "+11 at or below 200" globally would mis-derive the sentinel's 154 line.
- Verdict: **holds**.

### S115 — holds

- Quote (7 words ≤ 25): `if (!form_->GetDocument().IsActive()) { return std::move(done_callback) .Run(base::unexpected( ScriptToolError(ScriptToolErrorCode::kToolInvocationFailed,`
- Contiguous + at stated file:line: exact normalised match of raw lines 203-206 of the live 156 bytes (`203: "  if (!form_->GetDocument().IsActive()) {"`, `204: "    return std::move(done_callback)"`, `205: "        .Run(base::unexpected("`, `206: "            ScriptToolError(ScriptToolErrorCode::kToolInvocationFailed,"`).
- Grounds S115's teaches: this is the post-fill document-detachment guard's condition plus its error code — the teaches' "a 10-line guard added at 201-210 that fails the invocation with kToolInvocationFailed when a form-control input or change handler detaches the document". Byte-exact support: the inserted run is exactly new lines 201-210 (comment 201-202 naming the `input`/`change`-handler mechanism, if-block 203-209, blank 210) = 10 lines; "absent from the 154 bytes entirely": the quote is not in normalised 154 bytes and `!form_->GetDocument().IsActive()` occurs 0 times there (154 has 4 other `kToolInvocationFailed` uses elsewhere — the claim is about this guard span, which is absent); "every 154 line preserved in order" within the anchored blocks: the 154→156 diff has no replace/delete inside old 174-328 or old 635-842 (the only insertion inside block 1 is the guard; block 2 is a pure +38 shift; the diff's three delete runs — EmailVerification code at old 1195-1202, 1212-1219, 1729-1739 — sit outside both anchored blocks and below old 842, so they affect no anchored line number); block endpoints map exactly: S100's 174-328, 635-842 → 175-339 (+1/+11) and 673-880 (+38/+38).
- The quote "stops before :207 so it never crosses the two string literals": true — the quote ends at 206; the literals sit at 207-208.
- Verdict: **holds**.

## The two-literal-span note — verified byte-exactly

Every count in the note reproduces against the live 156 bytes (identical to committed):

| note claim | bytes |
|---|---|
| message "The document was detached while filling out the form" is 52 characters | 52 ✓ |
| occurs 0 times in raw bytes | 0 ✓ |
| occurs 0 times in normalised text | 0 ✓ |
| `"The document was detached while filling out "` on line 207 | `207: '                            "The document was detached while filling out "'` ✓ |
| `"the form")));` on line 208 | `208: '                            "the form")));'` ✓ |
| each literal alone occurs once | raw count 1 and normalised count 1 for both `The document was detached while filling out ` and `the form")` ✓ |
| gap is exactly `"` + `\n` + 28 spaces + `"` (31 chars) | bytes between the literals are `'"' + '\n' + 28*' ' + '"'`, 31 chars to the second quote ✓ |

The consequence drawn (never quote across the boundary; quote one literal or around it) follows; S115's quote indeed stops at `kToolInvocationFailed,` on line 206.

## Fetch receipts

Four read-only HTTPS GETs (public Chromium source, Gitiles `?format=TEXT`), window 2026-10-26T07:38:31Z–07:38:33Z, all HTTP 200 — full log with URLs, UTC window, statuses, byte counts and sha256s in `receipts/fetch-log.md`; raw bodies and decoded bytes committed under `receipts/`. Digests: form_mcp_schema.cc 156+154 both `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f`; html_form_element.cc 156 `2a96a97bfb4246b7a23895be7548533ce7adc32286f10df36831e370f8f86102`, 154 `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`. Committed round-29 bytes match the 156 live digests exactly.

## Commands run and exit codes

```
# fetches (exit 0; per-file http=200 in -w output)
curl -sS -o "$S/bytes/<file>.<tag>.b64" -w "... http=%{http_code} bytes=%{size_download}\n" \
  "https://chromium.googlesource.com/chromium/src/+/refs/tags/<tag>/third_party/blink/renderer/core/html/forms/<file>?format=TEXT"
#   form_mcp_schema.cc tag156 http=200 bytes=68940 ; html_form_element.cc tag156 http=200 bytes=92716
#   form_mcp_schema.cc tag154 http=200 bytes=68940 ; html_form_element.cc tag154 http=200 bytes=91040
base64 -d … (exit 0) ; sha256sum … (exit 0)
python3 "$S/verify_quotes.py" > "$S/verify_quotes.out"   # 1st run exit=1 (NameError in my own reporting code, fixed); rerun exit=0
python3 difflib opcode/delete-block inspections          # exit 0
awk/paste context prints (154:186-202 vs 156:195-213; sentinel 154:825-832 vs 156:858-872)  # exit 0
```

## Residual risk / verification gaps

- I verified the quotes, locations, word counts, grounding, the two-literal note, and the cross-tag claims the lesson and rows assert about these two files. I did not re-run the frozen counters (not my seat's item) and did not audit other rows' Gate lines.
- The two observations above are documentation-precision notes in SOURCES.md cells (S110 anchor "201-209" vs bytes 201-210; S114 teaches' shift-phrase scoping), not defects in the re-grounded quotes; the lesson's own why-cells carry the correct numbers in both cases.
