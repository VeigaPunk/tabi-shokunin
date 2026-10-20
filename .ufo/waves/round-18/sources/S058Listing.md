VERDICT: PASS

# S058Listing — re-opening the inspector listing so S058 can supersede S057 (round 18, C3 D4)

Seat `TabiR18.SrcS058Listing` (leaf; no delegation). Access date **2026-10-20** for every fetch. Method:
direct `curl` GET, `-L --compressed`, Chromium 154 UA, one URL, no discovery search. No browser launched,
no page JavaScript executed, no REA device, no counter or gate run by this seat. The lane tip is not
resolved here: this file drafts a row and a Gate entry for the L1 to append.

Question: does the listing served today still carry S057's anchor premise about the publisher class, and
what does the body actually contain about invocation?

## 1. Fetch ledger (curl, GET, 2026-10-20)

| # | URL | HTTP | body bytes | sha256 of fetched body | note |
|---|---|---|---|---|---|
| 1 | https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd | 200 | 649152 | `fb4160be3eceef84e47580d42b30306760537c4e33cde4ebd33dcaece4a1cdd2` | first probe |
| 2 | same | 200 | 649160 | `3fe69e95da97fb410ea7b236595d3390463e6ae9c4af5bca275cf33d8d10a84c` | +8 B vs #1 |
| 3 | same | 200 | 649153 | `fb70527f1e129a2d23b4cc9875de7f2fa356738ab139e7466f585007cd212aa5` | equals S057's recorded byte count, **not** its digest |
| 4 | same | 200 | 649152 | `fbc214a894f4388ea811d9e76627757a727f2a294194b88fce09cc7cbd81c4d2` | **recorded fetch**: all byte offsets below are from this body; response headers kept (`date: Tue, 20 Oct 2026 19:07:21 GMT`, `content-type: text/html; charset=utf-8`, `cache-control: no-cache, no-store, max-age=0, must-revalidate`, `content-encoding: gzip`, no `Last-Modified`, no `ETag`) |

Every fetch returned HTTP 200 at the requested path (no redirect). Four same-day fetches produced four
distinct digests at three distinct lengths; the serialization rotates per response (a CSP nonce shifts
everything after it), so a digest is a snapshot handle and a byte offset is valid only for the body that
was recorded. S057's recorded handle (`649153 B`, sha256 `085c40b7…8a4c`) did not reproduce in any of
these four fetches — fetch #3 hit the same length with a different digest.

## 2. What the recorded body serves (fetch #4, 649152 B)

| # | Fact | Byte offset (fetch #4) | Verbatim |
|---|---|---|---|
| F1 | meta description | tag at 490797, value at **490825** | "Inspect, monitor, and execute WebMCP tools manually or with Gemini" (10 words) |
| F2 | listing summary paragraph | 517454 | repeats F1, then the Prerequisites paragraph and a security warning |
| F3 | Prerequisites | **517534** | "Prerequisites: You must enable the &quot;WebMCP for testing&quot; flag in chrome://flags to turn it on in Chrome 150.0.7861.0 or higher." (contiguous 136 B; the quotation marks are `&quot;` entities in the served bytes) |
| F4 | Security warning | after F3 | "This extension does not implement production-level security boundaries. Do not use this extension while navigating untrusted websites." |
| F5 | `Updated` | 522984 | "October 5, 2026" |
| F6 | `Offered by` | label 523264, name **523285** | "François Beaufort" (2 words) — no publisher class is stated here |
| F7 | `Developer` | label 523546, value **523625** | "Google Ireland, Ltd.<br>Gordon House Barrow Street\nDublin 4 D04 E5W5\nIE" → flattened: "Google Ireland, Ltd. Gordon House Barrow Street Dublin 4 D04 E5W5 IE" (12 words) |
| F8 | Developer contact email | **524320** | "fbeaufort@google.com" |
| F9 | Developer phone | **525145** | "+1 650-253-0000" |
| F10 | Developer trader disclosure | **525256** | "This developer has identified itself as a trader per the definition from the European Union and committed to only offer products or services that comply with EU laws." (15 words for the first sentence) |
| F11 | Size / users | 523375 / 515280 | "231KiB"; "20,000 users" |

Token census on the same body (`python3` count of exact byte strings, case-sensitive, over all 649152 B
including any inline JSON): `invokeTool` **0**, `executeTool` **0**, `invocationId` **0**, `invoke` **0**,
`Invoke` **0**, `toolInvoked` **0**, `toolResponded` **0**. The word that does appear is the generic
"execute" in F1 ("execute WebMCP tools"). So the listing states a flag-gated manual inspector workflow
and a Chrome 150 floor, and nothing about an invocation contract, an invocation id, or a result channel.

## 3. Draft registry row — L1 appends after S057

Eleven cells, thirteen pipe fields; no `|` inside any cell. `teaches` opens `supersedes S057 —` so
`check-sources.mjs` permits the shared URL (`duplicate_url` is waived only for that prefix) and so the C3
d4 rule can find it; `status` is `rejected`, which requires both `REJECTED:` and `flip:` in `teaches`.

| S058 | WebMCP - Model Context Tool Inspector — Chrome Web Store — https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd | docs | C | The inspector extension's own stated prerequisites and manual invocation workflow, as corroboration only | listing re-opened 2026-10-20 (HTTP/2 200, cache-control no-store, no Last-Modified); byte 490825 `<meta name="description">` and listing summary "Inspect, monitor, and execute WebMCP tools manually or with Gemini" (10 words); byte 523546 `Developer` label → byte 523625 "Google Ireland, Ltd. Gordon House Barrow Street Dublin 4 D04 E5W5 IE" (12 words) with email fbeaufort@google.com at byte 524320; byte 525256 "This developer has identified itself as a trader per the definition from the European Union" (15 words); byte 523264 `Offered by` → byte 523285 "François Beaufort"; byte 517534 Prerequisites paragraph (19 words); invokeTool, executeTool and invocationId each occur 0 times; recorded body 649152 B, sha256 fbc214a894f4388ea811d9e76627757a727f2a294194b88fce09cc7cbd81c4d2, but four same-day fetches gave 649152/649160/649153/649152 B with four distinct digests, so the locator is the quote and its per-fetch offset, never the digest | supersedes S057 — REJECTED: the re-opened listing names Developer Google Ireland, Ltd. (trader per the EU definition; contact fbeaufort@google.com) with Offered by François Beaufort, and its whole copy is a flag-gated manual inspector workflow plus a Chrome 150.0.7861.0 floor, serving 0 occurrences of invokeTool, executeTool and invocationId, so it adds no invocation contract beyond S048 and S041; flip: a Chrome-owned page or the extension's own published source stating that floor or publishing an invocation API contract | rejected | 2026-10-20 | on-release | — |

Why tier C and kind docs: the row is listing copy on a storefront page (a tool's own documentation of
its prerequisites), not Chrome's documentation of the platform; its load-bearing fact (flag gating) is
already A-sourced by S032/S034 and the CDP contract by S041/S042, so it can only corroborate.

Cell audit — the falsified publisher-class premise of S057 does not appear in any cell above (F6/F7/F10
are the served fields: an `Offered by` person, a company `Developer`, and a trader disclosure). The
superseded phrasing is quoted in the wave report, not here, so a mechanical scan over this draft stays
clean.

## 4. Gate entry — URL, date, quotes, location, digest

| Row | URL | Access | Located quote (verbatim, ≤25 words) | Location and identity | sha256 (bytes) | Verdict / reproducibility | Pointer |
|---|---|---|---|---|---|---|---|
| S058 (new) | https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd | 2026-10-20 | "Google Ireland, Ltd. Gordon House Barrow Street Dublin 4 D04 E5W5 IE" (12 words); "Inspect, monitor, and execute WebMCP tools manually or with Gemini" (10 words); "This developer has identified itself as a trader per the definition from the European Union" (15 words) | `Developer` card, label at byte 523546 and value at 523625 (the value is one `br`-broken text node, contiguous up to the first `<br>`); meta description at 490825; trader sentence at 525256; `Offered by` value at 523285; listing prints `Updated October 5, 2026` at 522984 | `fbc214a894f4388ea811d9e76627757a727f2a294194b88fce09cc7cbd81c4d2` (649152 B, recorded fetch) | **sha NOT reproducible**: four same-day fetches, four digests, lengths 649152/649160/649153/649152; every quote found in every fetch; `invokeTool`/`executeTool`/`invocationId` count 0 in the recorded body | `.ufo/waves/round-18/sources/S058Listing.md` §2; `.ufo/waves/round-18/w1/SrcS058Listing.md` |

Offset caveat for the Gate: offsets shift by the size of the rotating nonce (observed +8 B in fetch #2),
so a re-fetcher locates the quotes, not the offsets; offsets identify the recorded body only.

## 5. Mention sweep of the superseded publisher-class premise

A lane-wide `grep -rn` (excluding `.git`) at 2026-10-20T19:09:30Z returned 25 lines across 15 files; the
enumerated `path:line` pairs, with frozen files marked, are in the wave report
(`.ufo/waves/round-18/w1/SrcS058Listing.md` §4), together with the exact command. The sweep is not
reproduced here because the lane is moving: sibling seats added matches while this seat worked (the same
command returned 14 lines in 9 files, then 21 in 13, then 26 in 16, and 25 in 15 at the timestamp above),
and a second copy here would age into a false claim of completeness. Frozen files are listed,
never edited. The premise literal itself is kept out of this file so a mechanical scan of the draft
stays clean; the report quotes it.

## 6. Remaining unknowns (not claimed)

- **Hydrated DOM.** Only the unrendered HTTP body was read; a browser would run page JavaScript that
  could add strings. [INFERENCE] The listing copy in §2 is server-rendered and matches what the store
  shows without hydration, but this seat did not launch a browser to prove no client-side addition.
- **Extension behaviour.** Nothing here says the extension cannot invoke a tool; it says the listing
  never documents an invocation contract. Runtime behaviour of the packaged extension was not probed.
- **Chrome 150 floor.** The floor is the author's listing claim (F3), still not corroborated by a
  Chrome-owned page; that is exactly S058's flip condition.
- **Digest reproducibility.** No digest of this listing should be cited as a verification handle; the
  observed per-fetch rotation is recorded in §1 rather than explained.
