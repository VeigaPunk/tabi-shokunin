VERDICT: BREAKS

Attacked: SOURCES row S053 at M=`6c97851` (`corpus/SOURCES.md:67`) — URL, anchor, gate quote, recorded
digest, tier/scope/teaches, status/used-by — against the live listing, plus its wave-1 provenance
(`.ufo/waves/round-17/w1/SrcChromeDocsInvoke.md:20,55-60,69,89`). All fetches 2026-10-20, curl,
Chromium 154 UA, no browser, no user profile; sandbox dirs removed.

## Observed

- URL resolves: `https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd`
  → HTTP 200. Wave-1 entry slug (`.../detail/model-context-tool-inspec/...`) → 301 → 200 at the canonical
  URL, so the row's URL is the redirect target, not the fetched path.
- Gate quote: "Inspect, monitor, and execute WebMCP tools manually or with Gemini" (10 words) is contiguous
  in `<meta name="description" content="…">` and in the listing summary `<p>` (Overview section). Quote-start
  offsets across three fetched bodies: 490811, 490818, 490829; dossier records 490826 — same neighbourhood,
  drift is per-request bytes.
- Anchor paragraphs exist verbatim: summary `<p>` plus "⚠️ Prerequisites: You must enable the "WebMCP for
  testing" flag in chrome://flags to turn it on in Chrome 150.0.7861.0 or higher." and the security warning.
- The 150.0.7861.0 value is the extension's own manifest field, not a listing-stated API floor: the item
  record carries `"version": "1.9.19", "minimum_chrome_version": "150.0.7861.0", "permissions": ["sidePanel", …]`.
- sha256: recorded `085c40b7…8a4c` / 649153 B cannot be reproduced. Six fetches today: 649060, 649068,
  649066, 649144, 649145, 649162 B. Two back-to-back requests with identical UA/URL: 649060 vs 649068 B,
  622132 differing byte positions — the body is per-request dynamic. The digest can only bind the wave-1
  snapshot; it is unverifiable, not falsified. (Working-tree draft `.ufo/waves/round-17/drafts/lesson-gate.md:26`
  already records "sha NOT reproducible"; that file is NOT at M.)

## Break 1 — "individual-publisher" is contradicted by the listing itself

The Details block at the row's URL shows both fields:

- `<div class="QDHp8e">Offered by</div><div>François Beaufort</div>`
- `<div class="QDHp8e">Developer</div><div>…Google Ireland, Ltd.<br>Gordon House Barrow Street\nDublin 4 D04 E5W5\nIE`
  with `fbeaufort@google.com`, phone `+1 650-253-0000`, and a Trader declaration.

The structured item record in `AF_initDataCallback(ds:0)` repeats it:
`["fbeaufort@google.com","Gordon House Barrow Street\nDublin 4 D04 E5W5\nIE",null,1,1,"François Beaufort","Google Ireland, Ltd.","Google Ireland, Ltd.","985840714","+16502530000",…]`.

"Google Ireland, Ltd." occurs twice in every fetched body (5/5; also via the old-slug redirect path).
The row records only the "Offered by" person and appends "(individual publisher)"; the dossier repeats the
inference at `w1/SrcChromeDocsInvoke.md:60` ("R3's publisher is a named individual"). The listing's own legal
developer entity is a Google corporation with a google.com contact — the authority premise of the rejection
("individual publisher → not Chrome-owned") is false as written.

Consequence for the flip: `flip: a Chrome-owned page or source stating the same floor`. The listing itself is
a page whose Developer entity is Google Ireland, Ltd. and whose Prerequisites and manifest state
150.0.7861.0. If that counts as "Chrome-owned", the flip is already satisfied by the rejected source, which
cannot back a rejection. Either the flip must be tightened to Chrome product documentation/Chromium source,
or the row must be un-rejected.

`[INFERENCE]` the wave-1 body displayed the same Developer block (it is static listing metadata and appears
via the same old-slug path today); the wave-1 body was not retained, so this is not directly observed.

## Break 2 — "only restates the S048 DevTools workflow" is unsupported

The listing's own copy (Overview section, two `<p>` elements) contains "DevTools" 0 times. It claims manual
execution plus a Gemini path, a security warning, and a version floor. All ten "DevTools" hits in the page
belong to related-item data for a different extension, "WebMCP DevTools" (id
`cgfogfkcfjdgpekdndcihajfjkaekjcl`; its page shows `Offered by theone`, 53.98KiB). S048 documents the DevTools
Application-panel manual workflow; this listing does not restate it. The second rejection clause misdescribes
both sources.

## Other axes

- Holds: tier C and "corroboration only" are defensible for store-listing copy, but the row's stated ground
  ("individual") is the wrong basis. `scope` overstates: the listing states manual execution, not a "manual
  invocation workflow".
- Holds: status/used-by are consistent. `rejected | 2026-10-20 | on-release | —`; no used-by path is claimed.
  `node scripts/check-sources.mjs` at M in a /tmp clone: `verdict=clean rows=53 tiers=A:43,B:4,C:6
  status=queued:6,mined:41,rejected:6 findings=0` (exit 0). `git grep S053 M` hits only `corpus/SOURCES.md:67`
  and search-log line 94 ("included 12 (S041–S052), rejected 1 (S053)"); no knowledge/note file cites S053.
  Note the checker is structural only (`corpus/SOURCES.md:6-7`), so clean ≠ content-true.

## Concrete repair (in-place cells at `corpus/SOURCES.md:67`)

Anchor cell — replace with:
`listing fetched 2026-10-20, Offered by François Beaufort; Developer Google Ireland, Ltd. (fbeaufort@google.com),
summary and Prerequisites paragraphs; fetched body 649153 B, sha256 085c40b7…8a4c (dynamic page: digest binds
this snapshot only, not reproducible on re-fetch)`

Teaches cell — replace with:
`REJECTED: publisher-run store listing (Developer Google Ireland, Ltd.) whose copy states manual execution and a
Gemini path plus the extension's own manifest minimum_chrome_version 150.0.7861.0, none of it a Chrome-documented
invocation contract; flip: a developer.chrome.com page or Chromium source stating the same 150 floor, or a stated
agent-side invocation format`

Status: keep `rejected` under that corrected reason (the listing still adds no invocation contract), or if the
flip is read as already met by the Google Ireland Developer entity, un-reject to `queued` with a corrected anchor.
The flip must not be satisfiable by the same listing; name Chrome product docs/Chromium source explicitly.
Scope: replace "manual invocation workflow" with "manual-execution claim".

Confidence: URL/anchor/quote/status axes high and observed; publisher contradiction high (5/5 bodies plus the
wave-1 entry path); digest non-reproducibility high (consecutive-request diff); wave-1 body contents inferred.
Remaining unknown: whether the store renders the Developer block conditionally by viewer locale — the lane's own
fetch path renders it today, which is what a re-checker sees.

Files written: `.ufo/waves/round-17/w2/ReopenS053.md`

Tooling: nothing installed or upgraded (host curl + python3 only).
