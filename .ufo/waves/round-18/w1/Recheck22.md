VERDICT: PASS

Seat Recheck22, C1 freshness recheck of SOURCES rows S045 and S046. Both receipts were produced
ONLY by `node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/recheck-fetch.mjs`
(schema `tabi-source-recheck-v1`); both carry `quoteFound=true`, `httpStatus=200`,
`fetchedAt` on 2026-10-20, and `teachesVerdict=held`. No drift drafts were needed, so no
superseding row and no Gate entry were drafted. Producer sha256 (current tool bytes)
`f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`.

## S045 — Chromium 154 WPT abort/toolcancel, tag 154.0.8037.97

- Row: `corpus/SOURCES.md:59` (source cell URL used verbatim as `--row-url`; `rowUrl` occurs
  verbatim in that line — checked by substring over the row line, `rowUrlVerbatim=true`).
- Original Gate quote: `corpus/lessons/round-17.md:57` (events assertion, "(code)", line 87 of
  `executeTool-abort.https.html`).
- Fetch: HTTP 200 from
  `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/web_tests/external/wpt/webmcp/imperative/executeTool-abort.https.html?format=TEXT`
  (`--decode base64`). Bytes 10684 = the base64 response body; the tool's `sha256` is over those
  bytes, by design. The DECODED file is 8013 B with
  sha256 `faf6e4889b9d71e9795b72950847ea17f9c1fd583536323f580ad9d9dda92c8e`, identical to the
  decoded digest recorded in the round-17 Gate row — content unchanged since round 17.
- Receipt: bytes=10684, sha256
  `b1300c0657f169b40c1be61c58daa3320d50d22b553e13b7f514a2c7be567968`,
  quote (7 words, normalized occurrence at offset 2867, line 87 of the decoded file):
  `assert_array_equals(events, ['tool started', 'toolactivated', 'execution_rejected', 'signal_aborted', 'toolcancel']);`
- Anchor observed: `refs/tags/154.0.8037.97` resolves to commit
  `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` (gitiles `?format=JSON` on the tag ref; author time
  2026-09-30) — matches the row's anchor cell exactly.
- Teaches check (`held`): all three clauses are in the upstream tree at that tag.
  1. caller abort rejects with the caller's reason — decoded `executeTool-abort.https.html:88`
     `assert_equals(executionRejectionValue, 'custom cancellation reason');` and `:113`
     `assert_equals(executionRejectionValue, 'already aborted');`
  2. fires `toolcancel` — the cited line 87 events array (the `toolcancel` listener is at :72).
  3. unregistering mid-execution still resolves — sibling test
     `.../webmcp/imperative/unregister-during-executeTool.https.html:85-86` ("Pending execution
     Promise should resolve to tool result even if tool was unregistered mid-execution") and
     `:121-122` (same-document variant); tool-side `options.signal` is NOT aborted (:63, :99).
  4. CDP `invokeTool` returns an `invocationId` that `toolResponded` echoes —
     `third_party/blink/web_tests/inspector-protocol/webmcp/invoke-tool.js:38-51` (response
     `invocationId` logged at :44, "toolResponded invocationId matches" at :47-48, the exact
     anchor range) and `third_party/blink/public/devtools_protocol/domains/WebMCP.pdl:66-69`
     (`invokeTool` returns `string invocationId`) and `:110-113` (`event toolResponded` carries
     `string invocationId`).
- Note in receipt records the same support map.

## S046 — WebMCP editors' explainers at 51ed7565

- Row: `corpus/SOURCES.md:60` (source cell URL `github.com/.../blob/51ed7565.../README.md` used
  verbatim as `--row-url`; `rowUrlVerbatim=true`).
- Original Gate quote: `corpus/lessons/round-17.md:58` (README.md:312, §Lifecycle of a Tool Call
  step 4).
- Fetch: HTTP 200 from
  `https://raw.githubusercontent.com/webmachinelearning/webmcp/51ed75653aaa7f174f8dbe05d1bc327359bbc57c/README.md`
  (`--decode none`). Bytes 37575; sha256
  `184c519af9ed728e77249423ff376c7d99367cd340e80a2d7f3a4a789e3fc7d6` — identical to the raw
  digest recorded in the round-17 Gate row.
- Receipt: bytes=37575, sha256
  `184c519af9ed728e77249423ff376c7d99367cd340e80a2d7f3a4a789e3fc7d6`,
  quote (14 words, normalized occurrence at offset 17302, line 312):
  ``The browser mediates the call, invokes the tool's `execute` callback with the provided arguments``
- Anchor observed: commit `51ed7565` resolves via raw.githubusercontent (HTTP 200); README
  sha matches the Gate; quote sits at `README.md:312` under `### Lifecycle of a Tool Call`
  (heading line 308), followed at :313 by "The page's callback returns structured results back
  to the agent" — the execute-arguments + returned-response contract the teaches cell names.
- Teaches check (`held`): the cited siblings are all present at the same commit and at the cited
  lines —
  `declarative-api-explainer.md` (10417 B, HTTP 200) has `### Getting the form response to the
  agent` at :117 and `### Events` at :155;
  `continuations-explainer.md` (10512 B, HTTP 200) has `# Document Lifecycle Considerations` at
  :220, with its overview (:15-20) stating tool calls are restricted to a single document and a
  navigation ends the request — i.e. the continuation path is exactly the "not a navigation
  response" scope;
  `security-privacy-questionnaire.md` (9229 B, HTTP 200) has Q12 around :57 (tool responses may
  be shown in UI; `readOnlyHint` may skip a confirmation step) and Q19 around :93 (disconnected
  document abandons pending invocations) — consent/confirmation is agent-side, separate from the
  tool response. README:315-319 marks the declarative API as future exploration, which the row
  already words as "explainers", not shipped behaviour.
- Note in receipt records the support map.

## Verification of receipt mechanics

- `quoteFound=true` from the tool for both rows; `quoteWords` 7 and 14 (≤25).
- Excerpt files independently re-hashed: `S045.excerpt.txt`
  `fbddb04afc7778d6129ab5958c291eaa7c4d6f0a7a3c52edf55335e30a218af7` (= receipt
  `excerptSha256`), `S046.excerpt.txt`
  `f9cb8f1b6ead0440b9b2a51a5f61b9460ac1fbcfa6f7ff9796612c8e2a28a89b` (= receipt
  `excerptSha256`); each excerpt contains the normalized quote (window includes
  `custom cancellation reason` / lifecycle steps 1-5 respectively).
- Receipt JSON re-hashes: `S045.json`
  `0709c0b4f2ef2d1010187b3b0ff38914bf156ede1bb6e1ee0747264bcd50f1d8`, `S046.json`
  `a3f05baa76ccd3d0b13001c26e8fa3fd11cb1989b9db908762819967442f2640`.
- `producerSha256` in both receipts equals the current tool digest
  `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`.
- Contract pointers: `PLAN.md:67-77` (C1 receipt contract), `PLAN.md:15-19` (C1 scope).
- No pacman/uv/npx/binary installs were needed; nothing was installed or upgraded this run.
- All fetches were read-only GETs against public URLs; no browser, no profile, no loopback
  fixture, no git write, no `jj`.

## Remaining unknowns

- S046 anchor cell's parenthetical "(2026-10-20)" for commit 51ed7565 was not re-derived from
  GitHub commit metadata; only resolution + content digest were verified. [INFERENCE] the date
  claim is a round-17 record, not contradicted by anything observed here.
- S045's receipt `sha256` is over the base64 carrier (tool behavior), so it is not comparable to
  the Gate's decoded-value digest; the decoded file was checked separately (8013 B,
  `faf6e488…`) and matches.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S045.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S045.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S046.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S046.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/Recheck22.md
