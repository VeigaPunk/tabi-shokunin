# Round 30 w1 — ScribeQuoteGrounding: Gate quotes for S110 / S114 / S115 (routed defect 2)

Seat: `ScribeQuoteGrounding` (scribe, frontier milestone). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`,
lane tip `061e62024c0523d3c6c7e819506a773ff2cd7d75`. Assignment item: round-29 routed defect 2 in
`corpus/lessons/round-29-verifier-spotcheck.md` §Routed defects — the S110, S114 and S115 Gate quotes in
`corpus/lessons/round-29.md:16,20,21` do not ground their own `teaches`, and the S110/S115 quote spans two C++ string
literals so it is not a contiguous substring.

## Verdict

All three rows are re-grounded, and the defect claim about the two literals is reproduced mechanically rather than
taken on trust. Each replacement quote is a contiguous substring of the counter's normalised text, occurs exactly once
in its file, and satisfies the 1–25-word gate (8, 1 and 7 words by the counter's own `words()`): S110 now quotes
`FormMCPSchema::FillData`'s unknown-parameter rejection in `form_mcp_schema.cc:215-217` — the very file the row's URL
names — instead of the guard comment; S114 quotes the null-String navigation sentinel
`executing_tool->CallDoneCallback(base::ok(String()));` at `html_form_element.cc:867`, which is the teach its title
names and which S111's `:201-202` comment never described; S115 quotes the new-at-156 guard's condition plus its
`kToolInvocationFailed` code at `:203-206`, deliberately stopping before `:207` so it never crosses the literal
boundary. The committed 156 bytes and the live Gitiles bytes at `refs/tags/156.0.8078.47` are byte-identical to each
other and to the S096/S100/S071 receipt digests (`2a96a97b…6102`, `904b75e7…152f`), so the quotes are grounded in
bytes a verifier can re-fetch. Able to fail, measured: S115's quote is absent from the 154.0.8037.97 bytes (the guard
is new at 156), while S110's is present at both tags at the same line numbers (the file is byte-identical, which is
what the re-pin asserts) and S114's is present at both with only a line shift (154:829 → 156:867). The message
`The document was detached while filling out the form` occurs 0 times in the raw bytes and 0 times in the normalised
text; the 31 characters `"` + newline + 28 spaces + `"` sit between the two literals, so no Gate quote may span them.
I edited nothing in the lane: `corpus/lessons/round-30.md` does not exist at this tip, so the Gate block is delivered
as text below and in `…/w1/ScribeQuoteGrounding/gate-lines-round-30.md` for L1 to integrate.

## Gate lines for `corpus/lessons/round-30.md`

| id | url | 2026-10-26 | "quote" | file:line | why it grounds teaches |
|---|---|---|---|---|---|
| S110 | https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT | 2026-10-26 | "if (it == name_to_controls_.end()) { return ScriptToolError( ScriptToolErrorCode::kInvalidInputArguments," | form_mcp_schema.cc:215-217 | S110 teaches that `FormMCPSchema::FillData` still rejects unknown parameters and invalid values and that this file is byte-identical at 154 and 156. This is FillData's unknown-parameter branch returning `kInvalidInputArguments` (the invalid-value branch returns the same code at :221-230), and the span sits at 154.0.8037.97:215-217 too, the same sha256 at both tags — which is exactly what a re-pin asserts. |
| S114 | https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT | 2026-10-26 | "executing_tool->CallDoneCallback(base::ok(String()));" | html_form_element.cc:867 | S114 is the navigation-sentinel row: this is the null-String tool result that marks a navigation triggered after `ScheduleFormSubmission` (:862), i.e. the `CallDoneCallback` ordering the teaches names, and it shows the sentinel path survived the new guard with only a line shift (154:829 → 156:867). S111's comment at :201-202 describes the guard, not this sentinel. |
| S115 | https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT | 2026-10-26 | "if (!form_->GetDocument().IsActive()) { return std::move(done_callback) .Run(base::unexpected( ScriptToolError(ScriptToolErrorCode::kToolInvocationFailed," | html_form_element.cc:203-206 | S115 teaches the guard newly inserted after the `FillFormControls` success path that fails the invocation with `kToolInvocationFailed` when the document is no longer active. This span is the guard's condition plus its error code, it is absent from the 154 bytes entirely (guard first appears at 156), and it stops before :207 so it never crosses the two string literals. |

Plain-text form:

```
S110 | https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT | 2026-10-26 | "if (it == name_to_controls_.end()) { return ScriptToolError( ScriptToolErrorCode::kInvalidInputArguments," | form_mcp_schema.cc:215-217 | FillData's unknown-parameter rejection (invalid-value branch at :221-230); same span at 154.0.8037.97:215-217, same sha256 at both tags.
S114 | https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT | 2026-10-26 | "executing_tool->CallDoneCallback(base::ok(String()));" | html_form_element.cc:867 | the null-String navigation sentinel after ScheduleFormSubmission (:862); unchanged from 154:829, shifted +38.
S115 | https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT | 2026-10-26 | "if (!form_->GetDocument().IsActive()) { return std::move(done_callback) .Run(base::unexpected( ScriptToolError(ScriptToolErrorCode::kToolInvocationFailed," | html_form_element.cc:203-206 | the new-at-156 post-fill guard's condition and error code; absent from the 154 bytes.
```

## The two-literal span — note for the lesson

The round-29 S110/S115 quote `The document was detached while filling out the form` is not a contiguous substring of
any byte form of `html_form_element.cc` and never can be: at tag 156 the message is two adjacent C++ string literals,
`"The document was detached while filling out "` on line 207 and `"the form")));` on line 208, which the compiler
concatenates but the source does not. Measured on both the committed bytes and the live refetch, whitespace-normalised
exactly as `scripts/check-frontier-admission.mjs:136-150` normalises: the 52-character message occurs 0 times raw and 0
times normalised, while each literal alone occurs once, and the 31 characters between them are `"` + `\n` + 28 spaces
+ `"`. Every future citation of this message must quote one literal or quote around the boundary, never across it;
the three replacement quotes above comply, S115's stopping at `kToolInvocationFailed,` on line 206.

## Evidence

### Lane state (read-only)

```
$ git -C . rev-parse HEAD
061e62024c0523d3c6c7e819506a773ff2cd7d75
$ git -C . status --porcelain | wc -l
6        # all untracked round-30 wave artifacts of other seats (.ufo/waves/round-30/{measure,w1,w1-dispatch.json,...})
         # nothing of mine is tracked or modified
$ git diff --stat f7c0317e4f8445502005e79e3d65767430912dab 061e62024c0523d3c6c7e819506a773ff2cd7d75 \
    -- corpus/evidence/round-29/release-pins/bytes corpus/SOURCES.md corpus/lessons/round-29.md
(no output)   # the freeze commit changed none of the bytes or rows I cite
$ test -f corpus/lessons/round-30.md ; echo $?
(non-zero: absent)
```

### Digests: committed vs live

| File | committed sha256 | live sha256 (2026-10-26T06:41:37Z) | receipt value | bytes |
|---|---|---|---|---|
| `third_party/blink/renderer/core/html/forms/html_form_element.cc` | `2a96a97bfb4246b7a23895be7548533ce7adc32286f10df36831e370f8f86102` | same | `2a96a97b…6102` (S096, S100 refetch records) | 69536, 1761 lines |
| `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc` | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` | same | `904b75e7…152f` (S071 refetch record) | 51703, 1440 lines |

### Fetch records (all read-only HTTPS GET, no cookies/credentials)

| URL | UTC | HTTP | bytes | sha256 |
|---|---|---|---|---|
| `https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT` | 2026-10-26T06:41:37Z | 200 | 92716 base64 → 69536 decoded | `2a96a97bfb4246b7a23895be7548533ce7adc32286f10df36831e370f8f86102` |
| `https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT` | 2026-10-26T06:41:37Z | 200 | 68940 base64 → 51703 decoded | `904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f` |
| `https://docs.discord.com/developers/topics/rate-limits` (out-of-scope assistance, see F5) | 2026-10-26T06:41:18Z | 200 | 408912 | `213fb2fa87f26de7bcd21980d445e193899337c26cf87053c386566954184aa9` |
| same, second fetch | 2026-10-26T06:42:50Z | 200 | 408912 | `0d9aea2c49de3959d2ac66bdbb0b484f2da9de7b63e6dea1e9c6c289917352f6` |

### Quote mechanics — `node verify-quotes.mjs`, exit 0

```
{"id":"S110","lines":"215-217","words":8,"sha_committed":"904b75e7…152f","sha_live":"904b75e7…152f","sha_matches_receipt":true,"quote_in_committed":true,"quote_in_live":true,"occurrences_committed":1,"committed_equals_live":true,"verdict":"PASS"}
{"id":"S114","lines":"867","words":1,"sha_committed":"2a96a97b…6102","sha_live":"2a96a97b…6102","sha_matches_receipt":true,"quote_in_committed":true,"quote_in_live":true,"occurrences_committed":1,"committed_equals_live":true,"verdict":"PASS"}
{"id":"S115","lines":"203-206","words":7,"sha_committed":"2a96a97b…6102","sha_live":"2a96a97b…6102","sha_matches_receipt":true,"quote_in_committed":true,"quote_in_live":true,"occurrences_committed":1,"committed_equals_live":true,"verdict":"PASS"}
{"raw_line_207":"                            \"The document was detached while filling out \"","raw_line_208":"                            \"the form\")));","whole_message_in_source_bytes":false,"whole_message_in_normalised_committed":false,"first_literal_in_normalised":true,"second_literal_in_normalised":true}
```

`normalise()` is not re-implemented: the script slices the `normalise()` body (lines 136–150) out of the frozen counter
`scripts/check-frontier-admission.mjs` at runtime, so the whitespace/tag rules cannot drift from the gate's. The
script never executes that module's CLI entry.

### Able-to-fail / hold across the two tags (same normalised-search method)

| Quote | at 154.0.8037.97 | at 156.0.8078.47 | reading |
|---|---|---|---|
| S110 `…kInvalidInputArguments,` span | present, `215-217`, count 1 (sha `904b75e7…` identical at both tags) | present, `215-217`, count 1 | hold: the row's "byte-identical at both tags" is true |
| S114 sentinel | present at `829` | present at `867` | unchanged path, +38 lines |
| S115 guard span | **absent** (count 0) | present at `203-206` | the guard is new at 156, so the quote can fail |

### Other commands run

```
$ sha256sum bytes/156.0.8078.47/.../{html_form_element.cc,form_mcp_schema.cc}          # exit 0, digests above
$ awk 'NR>=195 && NR<=215 {...}' html_form_element.cc                                  # exit 0, numbered 195-215
$ awk 'NR>=760 && NR<=800 {...}' html_form_element.cc                                  # exit 0
$ grep -n "FillData|kInvalidInputArguments|must not fail" form_mcp_schema.cc            # exit 0, 208/217/224/229/234
$ python3 (locate spans in both tags, gap measurement)                                 # exit 0, table above
$ diff -u 154.0.8037.97/.../html_form_element.cc 156.0.8078.47/.../html_form_element.cc # exit 1 (differences)
      49 '+' lines / 28 '-' lines; hunks at 123, 197→198, 359→370, 465→483, 515→538, 1191→1229
$ printf '…' | awk '{print NF}'                                                        # exit 0, 8 / 1 / 7
$ cmp -l fetchA fetchB ; python3 (first differing offset + context)                     # 13 differing bytes, 408144-408172
```

## Findings

- **F1 (S114 shift wording).** Independent measurement: the sentinel is `154:829 → 156:867` and the validation block
  `154:729 → 156:767`, i.e. **+38**, matching the already-disclosed F7 (`corpus/lessons/round-29.md:258-259`: 154
  lines 635–842 shift +38). S114's `teaches` sentence "shifted by +1 above line 197 and +11 at or below 200" is
  therefore true only for the sub-359 region. That is routed defect 4 territory, already disclosed; the corrected
  Gate line above does **not** restate the +11 wording, and L1 should not reintroduce it in round-30 prose.
- **F2 (guard insertion span).** `diff -u`'s hunk `@@ -197,6 +198,16 @@` shows exactly **10 added lines occupying
  156:201-210**: comment 201-202, `if` 203, return 204-208, closing brace 209, blank 210. So S115's "10-line guard
  added at 201-210" is literally the insertion span, while `round-29.md:257-258` counts 9 non-blank guard lines at
  201-209. Both readings coexist in the lane; round-30 should state one (recommended: insertion = 201-210, guard
  proper = 203-209). My S115 quote at 203-206 is unaffected either way.
- **F3 (S110 anchor span).** S110's anchor says "a 10-line detached-document guard inserted at 201-209" while S115's
  teaches says 201-210 for the same block — the registry cells are append-only, so the reconciliation belongs in the
  round-30 note, not in an edit to `SOURCES.md`.
- **F4 (quote source file).** S110's URL is `form_mcp_schema.cc`; its `teaches` also cites `html_form_element.cc` and
  `model_context.cc`. The Gate quote is taken from the row's own URL file, which is the row's primary source; the
  other two files remain covered by S111/S114/S115 and by S109.
- **F5 (out-of-scope assistance, recorded for the C2 seat).** `ScribeEntryDiscordHeaders` asked for a second-seat
  refetch for the planned S117 row. I fetched `docs.discord.com/developers/topics/rate-limits` twice (records above),
  saved both raw copies plus a `g7`-shaped record under my output dir, and confirmed the planned quote
  `The number of remaining requests that can be made` is present in the normalised bytes exactly once (9 words,
  normalised length 8728). Caveat: the raw page is **not** byte-stable — the two fetches differ in 13 bytes at
  offsets 408144–408172, all inside a `<script>` tag (`window.__CF$cv$params` `r=`/`t=` values) — but the normalised
  text is identical across both, so `l3-live-bytes` is stable while `g7` still requires committing exactly the file
  whose sha256 the record names. I committed nothing into the lane.

## Known limits

- No lane counter was run by me (C1/C2 are other seats' work); this report claims quote grounding only.
- The live check is one sample per URL at 06:41:37Z. What it proves is digest equality with the committed bytes and
  the receipt; it does not prove tag immutability beyond that equality.
- S114's quote is a single whitespace-separated token by the counter's `words()` — the 1–25-word gate passes, but it
  carries less prose than S110's and S115's. Rejected alternatives, for the record: the `:865-866` prose "Return a
  null string to indicate that a navigation has been triggered." cannot be quoted at all because the comment marker
  `//` sits inside the normalised text between the two comment lines.
- I did not verify S110's secondary `model_context.cc` range claims or S115's "all 154 line-number pointers are
  stale" claim; both are outside this item.

## Artifacts

- Report: `.ufo/waves/round-30/w1/ScribeQuoteGrounding.md` (this file)
- `.ufo/waves/round-30/w1/ScribeQuoteGrounding/gate-lines-round-30.md` — Gate block + two-literal note, ready to integrate
- `.ufo/waves/round-30/w1/ScribeQuoteGrounding/verify-quotes.mjs` — the contiguity/digest checker (exit 0)
- `.ufo/waves/round-30/w1/ScribeQuoteGrounding/bytes/{html_form_element.cc,form_mcp_schema.cc}` — committed 156 bytes as read
- `.ufo/waves/round-30/w1/ScribeQuoteGrounding/live/{html_form_element.cc,form_mcp_schema.cc}` — live Gitiles refetch, base64-decoded
- `.ufo/waves/round-30/w1/ScribeQuoteGrounding/refetch-discord/{rate-limits.fetchA.html,rate-limits.html,S117.refetch.json}` — F5 bytes and record
- Scratch `/fast/scratch/hyaku/tabi-r30/ScribeQuoteGrounding/` was used for fetch/hash work only (no clone was needed: no edits were made) and removed after its receipts were copied here
- No patch file: `corpus/lessons/round-30.md` does not exist at `061e6202`, so there is nothing to diff against.
- Tooling installed: none.
