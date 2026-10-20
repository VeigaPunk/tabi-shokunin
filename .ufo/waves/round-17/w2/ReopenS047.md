VERDICT: ISSUES

# ReopenS047 — S047 registry row at M (falsify round 17, wave 2)

Row under attack: `corpus/SOURCES.md:61` at M (`6c97851034e9d8f58b135d28ff969f1f28fa2f7d`), the
Imperative API row (url `https://developer.chrome.com/docs/ai/webmcp/imperative-api`). Gate record
source: `.ufo/waves/round-17/w1/SrcChromeDocsInvoke.md:49` (R1 draft row) and `:67` (R1 Gate table);
PLAN.md:188's `sources/<Topic>.md` path holds no ChromeDocsInvoke dossier at M (only BlinkInvoke,
ExplainerExec, JjColocation, PdlInvoke, SpecExecute) — the record lives in the w1 report instead.

Attacked: URL resolves; revision/anchor exists at the stated location; the wave-1 Gate quote is
verbatim (≤25 words); recorded sha256; tier/scope/teaches honesty; status/used-by consistency.

## Holds (observed)

- **URL resolves.** `curl -sS -L` (Chromium 154 UA, 2026-10-20) → HTTP/2 **200**, body served from
  `developer.chrome.com`, `<link rel="canonical" href="https://developer.chrome.com/docs/ai/webmcp/imperative-api">`
  equals the row URL. No redirect.
- **Revision exists.** Response header `last-modified: Fri, 16 Oct 2026 07:00:00 GMT`; body contains
  `Last updated: October 16, 2026` and `Last updated 2026-10-16 UTC.` — matches "page last updated
  2026-10-16".
- **Anchor section exists.** `<h2 id="execute_tool" …>Execute tool</h2>` is present.
- **Gate quote is verbatim, ≤25 words.** `"This asynchronous method returns the result of the tool
  execution, or null when a navigation is triggered."` — 17 words; `bytes.find(b'returns the result of
  the tool execution')` = **158695**, identical in all five fetches; the sentence is whitespace-wrapped
  (newline after "method"), so it is contiguous after whitespace normalization, exactly as the dossier
  says. The deprecation note `"JSON stringified input arguments are deprecated from Chrome 155."` is at
  byte **162526**, immediately after the section's second `</devsite-code>` (`<aside class="note">`).
- **Tier/scope honest.** `docs` + tier A matches the contract's tier definition (official docs,
  scoped); the page is page-side (`document.modelContext.executeTool`) and does state a version
  boundary (the Note). No tier inflation.
- **Status/used-by consistent.** Row is `mined`; used-by `corpus/knowledge/webmcp-invocation-round-17.md`
  exists at M and cites S047 at line 7 (front matter `source: S047`) and line 85 (`… object on 155+
  (S047) …`). `node scripts/check-sources.mjs` run in a detached sandbox clone at M prints
  `SOURCES_GATE verdict=clean rows=53 tiers=A:43,B:4,C:6 status=queued:6,mined:41,rejected:6 findings=0`
  (exit 0) — so `mined_without_used_by` / `used_by_uncited` / enum checks do not fire.

## Defects (each falsifies one checked sub-claim)

1. **Anchor location is off by one paragraph (and one code block), at M.**
   Element order inside `id="execute_tool"` (byte offsets in the fetched body): `<p>`@76 (**contains the
   quoted sentence**), `<devsite-code>`@465, `<p>`@1992 (`You can cancel a pending tool execution with
   AbortSignal…`), `<devsite-code>`@2144, `<aside class="note">`@4150. The quote is therefore in the
   section's **first paragraph, before the first code block** — not "paragraph 2", and not "paragraph 2
   after the first code block" (`corpus/SOURCES.md:61`, `.ufo/waves/round-17/w1/SrcChromeDocsInvoke.md:67`).
   A re-fetcher following the stated locator lands on the cancellation paragraph, not the quote.
2. **`teaches` carries a clause the source never teaches.**
   Row `teaches` (line 61): “… JSON-string inputs are deprecated from Chrome 155, so a 154 harness
   **must pass a string** while a 155+ one passes an object.” The fetched page has **0** occurrences of
   `154` (`grep -c '154' body.html` → `0`) and one `Chrome 155`; it documents an object argument as
   current usage (`executeTool(tool, { text: "Buy milk" })`) and only deprecates JSON-stringified inputs
   from 155. The 154-string requirement rests on `own-work` probe evidence, not this docs page:
   `.ufo/waves/round-16/probes/WebmcpProbeImperative.json` at M (exists; labels
   `executeTool_registered_tool_object`, `…_string_input`, `…_wrong_input`). The wave-1 dossier itself
   concedes the split and routes a scope sentence (§6A, "at 154 an object second argument throws … the
   docs describe ≥155"), yet the landed cell states the build rule under an A-tier docs row.
3. **The recorded sha256 is not a recheckable identity.** Five fetches produced five distinct digests:
   `85c393bb…f6b3d`, `de5e37d4…a1c2`, `60abd81e…078f`, `b2db68b1…9e28e`, `49fa3e52…5b362`; sizes
   `189560` (×4) and `189556` (×1). Nonce-stripped bodies differ only in (a) the CSP `nonce` embedded in
   the served body and (b) a devsite config array of numeric feature IDs / API keys
   (`…,112,113,116,117,…` vs `…,112,113,117,…` at ~byte 184422). Quote offsets stay fixed, so the
   recorded offset and size are plausible, but `24239b8d…3fbd` cannot be confirmed or re-derived by a
   later rechecker; the recorded 189556 B did occur once.

Not conclusive of dishonesty: the row is a faithful snapshot of one response; it just presents a
per-response-random body digest as the source's identity, and compresses probe-observed 154 behaviour
into the docs row's `teaches`.

## Concrete repair

- `corpus/SOURCES.md:61` anchor: replace "paragraph 2" with "§Execute tool (id execute_tool) **first
  paragraph, before the first code block**, byte 158695; Note after the second code block, byte 162526;
  page last updated 2026-10-16".
- `corpus/SOURCES.md:61` teaches: keep only the grounded boundary, e.g. "executeTool returns the tool
  result or null when a navigation triggers; from Chrome 155 JSON-stringified inputs are deprecated, so
  the documented form is a JSON-serializable object". Move "a 154 build requires the string form" to
  `corpus/knowledge/webmcp-invocation-round-17.md` / the round lesson, cited to the r16 probe (its §6A
  already asks for exactly this append-only sentence).
- Anchor identity: either mark the digest "(snapshot; the served body embeds a per-request nonce and
  randomized devsite config, so re-fetch digests differ)" or drop sha256/size in favour of
  `Last-Modified 2026-10-16 07:00 GMT` + the two constant byte offsets.
- `.ufo/waves/round-17/w1/SrcChromeDocsInvoke.md:67` repeats the wrong location phrase; if wave-1 docs
  are still amendable, align it, otherwise record the correction in the round lesson.
- Wave-2 assembly note (not this row's truth): the M lesson draft `## Gate`
  (`.ufo/waves/round-17/drafts/lesson-r17.md:50-51`) still has only `S041`/`S042` `[pending]` rows, so the
  S047 Gate entry currently exists only in the w1 dossier; fold it there when the lesson lands.

## Limits

- Fetches were plain `curl` with a Chromium 154 UA against the public page; no cookie jar, no browser.
  The recorded wave-1 digest cannot be matched because the served body is randomized per request.
- Docs are unversioned by milestone; the page's "last updated" date is the only revision marker.
- The r16 probe bytes were checked for existence/labels at M only, not re-run.

Files written: `.ufo/waves/round-17/w2/ReopenS047.md`
