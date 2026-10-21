# LC11 — preventDefault without respondWith programming error (source-only assessment)

Seat: TabiR20.SourceLC11 · 2026-10-21 · Source S096 `corpus/evidence/round-20/sources/html_form_element.cc` (tag 154.0.8037.97; design.json sha256 verified equal to local blob: `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`).

## Independent read (html_form_element.cc:787-815)

Span sits in `HTMLFormElement::PrepareForSubmission` (starts :635), inside the validation-passed `else` branch, after the submit event dispatch (`should_submit = DispatchEvent(*submit_event) == DispatchEventResult::kNotCanceled;` :775-776). Exact lines 787-815, read raw from the pinned blob:

```cc
      declarative_webmcp_call =
          executing_tool && executing_tool->CurrentlyRunning();
      if (declarative_webmcp_call) {
        if (auto promise = submit_event->TakeRespondWithPromise()) {
          // Since we have a promise, respondWith() was called. That should only
          // work if `preventDefault()` was already called. So we should never
          // be submitting the form here.
          CHECK(!should_submit);
          // Wait for the provided promise to resolve or reject, and then call
          // the active_webmcp_tool_'s callback with the result.

          std::move(*promise).Then(
              BindOnce(&HTMLFormElement::HandleWebMcpToolResponse,
                       WrapPersistent(this),
                       WrapPersistent(executing_tool.Get()),
                       /*resolved=*/true),
              BindOnce(&HTMLFormElement::HandleWebMcpToolResponse,
                       WrapPersistent(this),
                       WrapPersistent(executing_tool.Get()),
                       /*resolved=*/false));
        } else if (!should_submit) {
          executing_tool->CallDoneCallback(base::unexpected(ScriptToolError(
              ScriptToolErrorCode::kToolInvocationFailed,
              "The site has a programming error: it called "
              "preventDefault() "
              "on the 'submit' event, without also calling respondWith() "
              "with the tool result")));
        }
      }
```

- **Condition (all three, jointly):** (1) the declarative WebMCP invocation is still running after dispatch — `declarative_webmcp_call` is recomputed at 787-788 as `executing_tool && executing_tool->CurrentlyRunning()` (`executing_tool` was snapshotted from `active_webmcp_tool_` before dispatch at :720; per the comment at 777-786 a handler that disconnects the form makes this false and the whole branch is skipped); (2) the submit event was canceled — `!should_submit` at :807, which inside this else-branch can only mean the dispatch was canceled, i.e. `preventDefault()` was called (validation failure sets `should_submit = false` only in the sibling branch, which never reaches :807); (3) `submit_event->TakeRespondWithPromise()` returned no promise (:790 else-path) — per the comment at 791, promise presence means `respondWith()` was called, so the else-if is exactly "preventDefault() without respondWith()".
- **Outcome:** `executing_tool->CallDoneCallback(base::unexpected(ScriptToolError(kToolInvocationFailed, "The site has a programming error: it called preventDefault() on the 'submit' event, without also calling respondWith() with the tool result")))` (:808-813). Because `should_submit` stays false, the `if (should_submit)` submission block at :818 is skipped — no navigation is scheduled on this path. Delivery of that error to CDP (`Error` status / `errorText`) happens outside this file and span.
- Adjacent, same span, not the LC11 arm: the promise-present arm asserts `CHECK(!should_submit);` (:794) — a promise plus a non-canceled dispatch is a CHECK-level invariant violation, not this error path; whether `respondWith()` can even be called without prior `preventDefault()` is enforced in `SubmitEvent::respondWith` (different file, not in the retained blob).
- Silent third combination (no promise, `should_submit` true): neither arm fires; ordinary submission proceeds at :818 — LC12's span, not LC11.

Strongest quote (21 whitespace words, literal string-literal continuation across lines 810-813, within span 787-815):

> `The site has a programming error: it called preventDefault() on the 'submit' event, without also calling respondWith() with the tool result`

It is the strongest because it names both halves of the condition (preventDefault called; respondWith absent) and classifies the outcome (programming error) in one literal. The scribe draft's alternative `"else if (!should_submit) {"` (line 807, 5 words) is also literal and in-span but omits the respondWith half.

Ready-to-render row (no pipes inside cells):

`| LC11 | Declarative tool still CurrentlyRunning after submit dispatch; event canceled by preventDefault; TakeRespondWithPromise empty (respondWith never called) | tool done callback runs with kToolInvocationFailed "The site has a programming error: it called preventDefault() on the 'submit' event, without also calling respondWith() with the tool result"; no submission scheduled | S096:787-815 |`

## Caveat

Source-only Chromium 154.0.8037.97, pinned blob sha256-verified; no runtime or capability claim is made here. Three precision limits: (a) "respondWith never called" rests on the in-source comment at :791 ("Since we have a promise, respondWith() was called."); the `TakeRespondWithPromise` consumption semantics live in SubmitEvent sources not retained in this blob. (b) The `CurrentlyRunning()` recheck means the error fires only when the tool survived dispatch; a disconnecting handler silently skips it. (c) What `CallDoneCallback` does downstream (running-state reset, CDP `Error`/`errorText` mapping in `inspector_web_mcp_agent.cc:220-243`) is outside S096 and outside this span. Corroboration (not part of this source-only row): a round-17 runtime probe observed this exact path — `.ufo/waves/round-17/w1/C2ProbeDeclarative.md:70-72`: `preventDefault, no respondWith → {status:"Error", errorText:"The site has a programming error: …"}`.

Integration note for the manifest owner: the scribe draft's LC11 `outcome` field embeds "the wave-1 round-17 probe (not a receipt) recorded the same errorText with no output key" — that mixes a runtime observation into a manifest whose declared `scope` is "source-only Chromium 154.0.8037.97; not runtime-observed". The decisions.json row should stay source-only; the probe mention belongs in knowledge-note prose (my condition/outcome/quote above are clean of it).

## Does an existing r19 note already hold it?

Split answer:

- **The r19 knowledge note does NOT hold it.** `corpus/knowledge/webmcp-declarative-validation-round-19.md` contains no occurrence of `preventDefault`, `respondWith`, or the programming-error text (grep over `corpus/knowledge/`: only `webmcp-invocation-round-17.md:55` mentions a `respondWith` success row — a different fact). All 19 r19 validation fixtures pair `event.preventDefault()` immediately with `event.respondWith(...)` (grep of `corpus/evidence/round-19/validation/fixtures/`), so the error path was not among the 66 r19 cases.
- **But r19 wave-1 source reports DO already hold the same fact against the same pinned blob** (so LC11 is promotion into the pinned manifest, not novel mining):
  - `.ufo/waves/round-19/w1/SrcHtmlFormTool.md:26` — "If the event was canceled but no promise was supplied, it returns `kToolInvocationFailed` with the site-programming-error message (`807-814`)."
  - `.ufo/waves/round-19/w1/SrcScriptToolError.md:45` — "`:807-814` does the same for `preventDefault()` without `respondWith()`."
  - `.ufo/waves/round-19/w1/SrcChromeDeclDocs.md:84` — row "`html_form_element.cc:769-815` … Canceling submit without `respondWith()` returns a programming-error failure."
  - Round-17 probe (runtime, above) observed the error text end-to-end.

## Method / untested

Read the pinned local blob raw (:735-790 context, :787-815 assigned span) before consulting any prior note; verified blob sha256 against design.json; grepped the file for duplicate `programming error`/`TakeRespondWithPromise` occurrences (single occurrence, :790/:810); grepped `corpus/knowledge/`, `corpus/evidence/round-19/`, and `.ufo/waves/round-19|17/` for prior holders; cross-checked the scribe draft row in `.ufo/waves/round-20/clones/ScribeLifecycle/corpus/evidence/round-20/lifecycle/decisions.json` (LC11 agrees: condition, outcome, span 787-815, literal quote). One bounded checksum command run; no browser, no build/test, no formatter — untested by design (source-only lane). Also observed: the declared counter `.ufo/waves/round-20/measure-c1.mjs` does not exist yet in the production tree (expected integration-time artifact).
