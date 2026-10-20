VERDICT: PASS

# SrcChromeDocsInvoke — invoking a WebMCP tool: Chrome's own docs (round 17, C2)

Seat `TabiR17.SrcChromeDocsInvoke-2` (leaf). Access date **2026-10-20** for every fetch. Method: direct
`curl` with a Chromium 154 UA — bounded re-open of S032 plus link-follow from it; **no** discovery search
this round. No browser launched, no counter/gate run, no REA device. Host build 154.0.8037.97 is L1
context only, not re-verified here.

## 1. Fetch ledger (curl, GET, 2026-10-20)

| # | URL | HTTP | bytes | Last-Modified | sha256 of fetched body | decision |
|---|---|---|---|---|---|---|
| 1 | https://developer.chrome.com/docs/ai/webmcp | 200 | 145261 | Wed, 07 Oct 2026 07:00:00 GMT | 2a30b60b51dc4a758b006fc168c3fa1f348c59914d9932c6dbda4703f007786b | S032 re-open, held |
| 2 | https://developer.chrome.com/docs/ai/webmcp/imperative-api | 200 | 189556 | Fri, 16 Oct 2026 07:00:00 GMT | 24239b8dc2eea46bda87fa2589b09b7d7fecd353f92cbec00980a81515ea3fbd | **row R1** |
| 3 | https://developer.chrome.com/docs/devtools/application/webmcp | 200 | 191224 | Tue, 12 May 2026 07:00:00 GMT | 9bd94f4182619b9eb7bc83c127d58a4de41da691e25ca867ffa3f419d83a87e5 | **row R2** |
| 4 | https://developer.chrome.com/docs/ai/webmcp/declarative-api | 200 | 153281 | Fri, 25 Sep 2026 07:00:00 GMT | 9b5df9bfa74e2235393d237b1f6a5084fec383f072d4658bba2976b65a3be0f3 | fact F8, no row (S031 covers declarative) |
| 5 | https://developer.chrome.com/docs/ai/webmcp/evals | 200 | 162815 | Tue, 19 May 2026 07:00:00 GMT | 1cf0251936b143c830eef1a6fb93638dcfb534ccfb16725d9e1f01916ee500e6 | opened, no row (see §8) |
| 6 | https://developer.chrome.com/docs/automation-and-testing | 200 | 105592 | Tue, 04 Aug 2026 15:30:23 GMT | 3a1e5ceaf28c4116200850852230af90b9f8a21bfde9527fa5c16bbaa7b35016 | excluded: 0 WebMCP mentions |
| 7 | https://chromewebstore.google.com/detail/model-context-tool-inspec/gbpdfapgefenggkahomfgkhfehlcenpd | 301 → 200 at `/detail/webmcp-model-context-tool/…` | 649153 | dynamic (none) | 085c40b7d1bae1b3012c3bcf3dc74c1762f8c096136c0b6fa22e302069848a4c | **row R3 (optional)** |
| 8 | https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl | 200 | 4126 | n/a | f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f | cross-check only for §6B; row owned by SrcPdlInvoke |

No URL needed a retry and none was unreachable; the only non-200 was the webstore 301, followed with
`-L`. Canonical paths came from each page's `<link rel="canonical">` and match the requested URLs.

## 2. S032 re-open — existing row holds, no edit proposed

- All three claims in S032's `teaches` and anchor cells still hold: "Join the WebMCP origin trial from
  Chrome 149." (§Get started); "Open Chrome and navigate to `chrome://flags/#enable-webmcp-testing`"
  (§Local WebMCP); "Both APIs are gated by the `tools` Permissions Policy." plus "defaults to `self`"
  (§Permissions policy). `last-modified` is unchanged at 2026-10-07; the page prints "Last updated 2026-10-07".
- The row is narrower than the page, not wrong: it does not mention §Imitate an agent to test your
  tools, whose Caution states extensions can query and execute tools through content scripts (F9).
  No supersede row is warranted.
- S038/S039/S040 stay rejected: `navigator.modelContext` occurs **0** times on every page fetched
  here except the webstore page, where all 4 hits belong to *other* extensions' related-item blurbs,
  not to this listing.

## 3. Draft registry rows — L1 assigns the ids (`S0??`; next after S040)

Row shape is the registry's 13 pipe-fields (11 cells, no `|` inside a cell). Status is drafted
`queued`; flip to `mined` only when `corpus/knowledge/webmcp-invocation-round-17.md` exists **and**
cites the id in `used-by` (`check-sources.mjs` flags `mined_without_used_by` / `used_by_uncited`
otherwise). Replace `S0??` before running the validator (`bad_id` until then), and assign three distinct
ids — three rows sharing one placeholder would also trip `duplicate_id`.

**R1 — recommended primary (C2, tier A):**

| S0?? | Imperative API — Chrome for Developers — https://developer.chrome.com/docs/ai/webmcp/imperative-api | docs | A | Documented page-side invocation semantics of document.modelContext.executeTool and its Chrome-version boundary | page last updated 2026-10-16, §Execute tool (id execute_tool) paragraph 2 and the Note after the second code block; fetched body 189556 B, sha256 24239b8dc2eea46bda87fa2589b09b7d7fecd353f92cbec00980a81515ea3fbd | executeTool returns the tool result or null when a navigation triggers, and JSON-string inputs are deprecated from Chrome 155, so a 154 harness must pass a string while a 155+ one passes an object | queued | 2026-10-20 | on-release | — |

**R2 — invocation record and status vocabulary (C2, tier A):**

| S0?? | Debug WebMCP tools — Chrome DevTools — https://developer.chrome.com/docs/devtools/application/webmcp | docs | A | DevTools' documented manual tool invocation and the invocation status vocabulary it reports | page last updated 2026-05-12, §Test tools manually (id test-tools) and §Invoked tools (id invoked-tools); fetched body 191224 B, sha256 9bd94f4182619b9eb7bc83c127d58a4de41da691e25ca867ffa3f419d83a87e5 | DevTools invokes a chosen tool manually with edited parameters and logs a status of Completed, Canceled, In Progress or Error, so invocation is a documented client operation that leaves a record | queued | 2026-10-20 | on-release | — |

**R3 — optional, corroboration only (never sole support, never a C2 citation):**

| S0?? | WebMCP - Model Context Tool Inspector — Chrome Web Store — https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd | tool | C | The inspector extension's own stated prerequisites and manual invocation workflow, as corroboration only | listing fetched 2026-10-20, Offered by François Beaufort (individual publisher), summary paragraph and Prerequisites paragraph; fetched body 649153 B, sha256 085c40b7d1bae1b3012c3bcf3dc74c1762f8c096136c0b6fa22e302069848a4c | The inspector enables itself only with the WebMCP for testing flag and claims a Chrome 150.0.7861.0 floor, so manual tool execution outside an agent is flag-gated too | queued | 2026-10-20 | on-release | — |

Why the tiers: R1/R2 are official Chrome product documentation, authoritative for what Chrome documents,
each `scope`-bounded. R3's publisher is a named individual and its text is listing copy; its load-bearing
fact (flag gating) is already A-sourced by S032/S034, so it is C and cannot carry the C2 note alone.

## 4. Gate entry — URL, date, quote, location, sha256

| Row | URL | Located quote (verbatim, ≤25 words) | Location and identity |
|---|---|---|---|
| R1 (new) | https://developer.chrome.com/docs/ai/webmcp/imperative-api | "This asynchronous method returns the result of the tool execution, or null when a navigation is triggered." | §Execute tool, id `execute_tool`, paragraph 2 after the first code block; source line-wraps the sentence, first fragment `returns the result of the tool execution` at byte 158695; opened 2026-10-20, "Last updated 2026-10-16"; sha256 `24239b8d…3fbd` |
| R2 (new) | https://developer.chrome.com/docs/devtools/application/webmcp | "The result of the invocation (Completed, Canceled, In Progress, or Error.)" | §Invoked tools, id `invoked-tools`, Status bullet; fragment `The result of the invocation` at byte 167237; opened 2026-10-20, "Last updated 2026-05-12"; sha256 `9bd94f41…87e5` |
| R3 (optional) | https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd | "Inspect, monitor, and execute WebMCP tools manually or with Gemini" | `<meta name="description">` at byte 490826 and the listing summary `<p>`; publisher line "Offered by François Beaufort"; fetched 2026-10-20; sha256 `085c40b7…8a4c` |
| S032 (re-open) | https://developer.chrome.com/docs/ai/webmcp | "Chrome Extensions can query and execute WebMCP tools" | §Imitate an agent to test your tools, id `imitate_an_agent_to_test_your_tools`; byte 122198 (the next words, "with content scripts", continue across a link node); opened 2026-10-20, "Last updated 2026-10-07"; sha256 `2a30b60b…786b` |

Every quote above was checked as contiguous after whitespace normalization on the fetched bytes; where
the served HTML wraps a sentence, the byte offset given is a fragment that *is* contiguous, so a
re-fetcher can locate the sentence without trusting my extraction.

## 5. Facts these sources support for C2 (each with its anchor)

| # | Fact (observed in the source) | Anchor | What it supports in C2 |
|---|---|---|---|
| F1 | `executeTool` is the page-side manual invocation: called with the tool object from `getTools()`, it returns the result, "or null when a navigation is triggered" | R1 §Execute tool | `invoke-imperative-success` result shape (page side only); **does not** predict the CDP `toolResponded` payload |
| F2 | "JSON stringified input arguments are deprecated from Chrome 155." | R1 Note after the 2nd code block in §Execute tool (byte 162526) | harness input encoding is version-split: string on 154, object on 155+ (see §6A) |
| F3 | Cancellation is an `AbortSignal` passed as an optional argument to `executeTool`; `execute` receives `signal` as its second argument | R1 §Execute tool + §Handle tool cancellation | `invoke-imperative-rejects` / cancel semantics as page behaviour; CDP `cancelInvocation` remains S035's |
| F4 | "As of Chrome 153, you can unregister a tool without cancelling and breaking in-flight executions." | R1 §Unregister tools (byte 143903) | `invoke-after-unregister`: unregister must not abort an in-flight invocation |
| F5 | The DevTools panel gives "full end-to-end visibility into the tool lifecycle, including registration, schema validation, and invocation history" | R2 §Interface overview | the "invocation as record" framing of the C2 note |
| F6 | Schema enforcement is observable: "The output pane displays error messages if the tool parameters or return values don't match the defined schema." | R2 §Troubleshoot integration issues | `invoke-input-schema-mismatch` expects a surfaced error, not a silent success |
| F7 | A tool can be run without an agent: "You can bypass the AI agent's decision logic to test your tool's reliability independently." followed by a manual parameter area and "Run tool" | R2 §Test tools manually (byte 168353) | premise that invocation is testable independently of model choice |
| F8 | The declarative result channel is the submit hook: "The SubmitEvent interface introduces the `agentInvoked` boolean attribute." with `respondWith(Promise)` | re-fetched declarative page §Submit the form (byte 123370) | `invoke-declarative-form` result path (page side) |
| F9 | Extensions can invoke tools from content scripts ("Chrome Extensions can query and execute WebMCP tools") | S032 §Imitate an agent… | adjacency: a non-CDP invocation path exists; it is not the harness's path |
| F10 | The linked inspector requires the "WebMCP for testing" flag and names a floor of Chrome 150.0.7861.0 | R3 Prerequisites paragraph (byte 517550) | corroborates flag-gating (S032/S034); the floor is the author's claim, not Chrome's |
| F11 | None of the six developer.chrome.com bodies names `WebMCP.invokeTool` or the CDP `WebMCP` command; `invokeTool` count 0 in all six. (The token `CDP` appears once each in the DevTools page's nav and in the Puppeteer blurb, never in WebMCP prose.) | `grep -c 'invokeTool' <each fetched body>` → 0; occurrences inspected at byte 117208 (nav) and 82695 (Puppeteer) | negative boundary: the CDP verb must cite S035/PDL, **never** a Chrome docs row |

Cases the docs leave unsupported: `invoke-unknown-tool`, `invoke-concurrent-ids`,
`invoke-flags-off-control`, `invoke-iframe-frameid` have no statement on these pages — source them from
S035 (protocol) and the harness receipt only.

## 6. Contradictions and qualifications (routed, append-only)

**A. Round-16 note vs R1 — scoped, not a refutation.** The pinned note says "154's `executeTool`
requires a JSON string second argument, not an optional object" (`corpus/knowledge/webmcp-chromium-loopback-round-16.md`,
probe-only observations paragraph lines 73-76, and the same claim as the "Spec versus this build"
table's `executeTool input` row at line 87). R1 documents an optional object and calls the
string form deprecated from 155. The probe evidence reconciles them: at 154 an object second argument
throws `UnknownError: Failed to parse input arguments`
(`.ufo/waves/round-16/probes/WebmcpProbeImperative.json`, labels `executeTool_registered_tool_object`
and `executeTool_registered_tool_wrong_input`), while a JSON string returns a value (label
`executeTool_registered_tool_string_input`). So the note is right for 154 and the docs describe ≥155 —
but the note's phrasing reads as a general API fact. **Routed:** L1 should add an append-only scope
sentence to the round-17 note/lesson ("154 build requires the string form; Chrome documents the object
form and deprecates strings from 155"); the byte-pinned r16 note must not be edited.

**B. DevTools UI vocabulary ≠ protocol enum.** R2 lists four statuses including **In Progress**;
S035's `InvocationStatus` has only `Completed | Canceled | Error` — re-verified this round from the PDL
(ledger #8; its sha256 equals S035's recorded `f386bcfd…f99f`, enum at lines 28-32). A C2 predicate keyed
on the UI wording would be wrong. Key on the PDL enum and the observed `toolResponded.status`; treat
"In Progress" as DevTools-only.

**C. No row changes elsewhere.** S032 holds (§2). S031/S030 cover the declarative proposal, so the
declarative re-fetch yields facts (F8) but no new row. S035 remains the build authority for the CDP
domain; R2 does not contradict it, it describes a consumer.

**D. The webstore floor is not an API floor.** "Chrome 150.0.7861.0 or higher" is the extension's
prerequisite, while the API's origin trial starts at 149 (S032). Different subjects; not a conflict.

## 7. C1 (jj-safe anchoring)

No fact. Nothing on these pages mentions git, jj, revisions or gates; this source cannot support C1 and
must not be cited for it.

## 8. Limits and unknowns

- Docs are unversioned by milestone: there is no commit or tag. The revision recorded is the
  `Last-Modified` header plus the in-page "Last updated" date plus the fetched-body digest; the digests
  bind only today's snapshot, and Chrome updates these pages without notice (the imperative page moved
  2026-10-16, four days before this fetch).
- The 154 `executeTool` behaviour in §6A is the round-16 probe's, not re-run here (no browser launched).
- The evals page was opened (digest in §1) but not proposed as a row: it documents test *guidance*
  ("You can trigger a WebMCP tool call using `document.modelContext.executeTool(...)`",
  §Test tools in isolation) whose invocation semantics R1 already carries. If L1 wants a testing row
  instead of R2, this is the page to mint.
- The webstore page is a dynamic app; the quoted strings are in the served HTML at the recorded offsets,
  but rating, ordering and A/B variants can change on re-fetch. R3's `on-release` cadence is generous;
  `90d` would also be defensible.
- No inspector run was attempted: an extension needs a real profile, which this lane forbids.

## Tooling

No tool installed or upgraded; all fetches used the host `curl` and `python3`.

Files written: `.ufo/waves/round-17/w1/SrcChromeDocsInvoke.md`
