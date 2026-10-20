VERDICT: PASS

# LiveS032 — C1 receipt S032 (WebMCP — Chrome for Developers)

Scope: attack C1 receipt `corpus/evidence/round-18/source-recheck/S032.json` at measured REV
`530f40a9bc3f10436161a2af1ca0fe9bffffc004`, baseline `2bff864fdfee684ddbcd066cc8e735adaba2735c`,
2026-10-20. Read-only LANE; live re-fetch into a private `/tmp` sandbox; the producer
`recheck-fetch.mjs` was **never executed**; no git/jj writes in LANE; no browser; no tool
installs/updates.

## 1. Artifacts and bindings checked

| Item | Path / value |
|---|---|
| SOURCES row at REV | `corpus/SOURCES.md:46` (field 3 source: `WebMCP — Chrome for Developers — https://developer.chrome.com/docs/ai/webmcp`; teaches: `Chrome documents WebMCP as an origin trial from Chrome 149 with a local chrome://flags testing switch, not a default-on feature`) |
| Row at B vs REV | byte-identical row (checked `git show B:corpus/SOURCES.md:46` vs REV); S032 not in the superseded set; no `supersedes S032` row at REV |
| Original quote source | `corpus/lessons/round-16.md:42` at REV: `"Open Chrome and navigate to chrome://flags/#enable-webmcp-testing"`; lesson file sha256 `9d9197e58d3091dc883a785402e1baf30a8ec218b540e6b289c2fa3bef2f3496`, identical at B and REV (byte-frozen) |
| Receipt | `corpus/evidence/round-18/source-recheck/S032.json` (sha256 `c199365c42c263a6abf6dc0898a3643cd7577ef783f9c10b8b2fe6d736bc968f`; identical at REV and worktree); fields at `S032.json:2-24` |
| Excerpt | `corpus/evidence/round-18/source-recheck/S032.excerpt.txt:1`; 1266 bytes; sha256 `126859bf669b0c31693d418f01f50154a3c3e3851972493056fb87179df6dc49` |
| Producer at REV | `.ufo/waves/round-18/recheck-fetch.mjs` sha256 `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` (receipt `producerSha256`, line 24) |
| Counter at REV | `.ufo/waves/round-18/measure-c1.mjs` sha256 `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234` |

## 2. Independent live re-fetch (exact commands and observed output)

```
mkdir -p /tmp/tabi-r18-liveS032
cd /tmp/tabi-r18-liveS032
curl -sSL --compressed --max-time 90 \
  -A "Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18" \
  -D headers-1.txt -o body-1 \
  -w 'status=%{http_code} size=%{size_download} url=%{url_effective} redirects=%{num_redirects}\n' \
  'https://developer.chrome.com/docs/ai/webmcp'
# exit=0
# status=200 size=26115 url=https://developer.chrome.com/docs/ai/webmcp redirects=0
# wc -c body-1 -> 145257
# sha256sum body-1 -> e6cb3537c0a056cba679f7651cb2ab22e2a6d81bd05df1f70b1cb73ea8175cb2

curl -sSL --compressed --max-time 90 \
  -A "Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18" \
  -o body-2 -w 'status=%{http_code} size=%{size_download}\n' \
  'https://developer.chrome.com/docs/ai/webmcp'
# exit=0
# status=200 size=26108
# wc -c body-2 -> 145261
# sha256sum body-2 -> 72d30ee0a2f6874d757df9b29d7526fe4daa41de46f3b63d618375d2a53d8b24
```

`size_download` is curl's compressed transfer size; `-o` writes the decompressed document.
The receipt's `bytes` (145257) is the decompressed file size, so 145257 matches fetch #1, not the
26115 wire size. Fetch #2 was 145261 bytes.

Decode/normalize (private reimplementation of `recheck-fetch.mjs:24-41` in
`/tmp/tabi-r18-liveS032/decode.mjs`; the producer itself was not run):

```
node /tmp/tabi-r18-liveS032/decode.mjs body-1 \
  'Open Chrome and navigate to chrome://flags/#enable-webmcp-testing' \
  /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S032.excerpt.txt
# {"bodyBytes":145257,"bodySha256":"e6cb3537…","normalizedLength":12297,
#  "quoteWords":6,"quoteLength":65,"found":true,"offset":7017,
#  "computedExcerptBytes":1266,
#  "computedExcerptSha256":"126859bf669b0c31693d418f01f50154a3c3e3851972493056fb87179df6dc49",
#  "committedExcerptBytes":1266,
#  "committedExcerptSha256":"126859bf…",
#  "excerptBytesEqual":true,"excerptTextEqual":true}
```

The same command against `body-2` returns the same `normalizedLength` 12297, `offset` 7017,
`found` true, and byte-identical excerpt (`126859bf…`).

| Field | Receipt | Fetch #1 (20:02:17Z) | Fetch #2 (immediately after) |
|---|---|---|---|
| HTTP status | 200 | 200 | 200 |
| body bytes (decompressed) | 145257 | 145257 | 145261 |
| full body sha256 | `22dec7bd5e3834c99921aa5776d1f05476036ec9647296480ae835b467df8067` | `e6cb3537c0a056cba679f7651cb2ab22e2a6d81bd05df1f70b1cb73ea8175cb2` | `72d30ee0a2f6874d757df9b29d7526fe4daa41de46f3b63d618375d2a53d8b24` |
| decode | html-text | html-text | html-text |
| normalized length | not recorded | 12297 | 12297 |
| quote found / offset | true / 7017 | true / 7017 | true / 7017 |
| excerpt sha256 | `126859bf…` (1266 B) | `126859bf…` (1266 B) | `126859bf…` (1266 B) |
| excerpt == committed | — | byte-identical | byte-identical |

Raw-body variance is outside the visible text. `diff` of `body-1`/`body-2` has exactly two
differing line opcodes: the `<script nonce="…">` attribute and one `app_loader.js` feature-flag
payload line, both inside `<script>…</script>`; `html-text` removes both. The normalized visible
text is identical (12297 chars) and the quote offset is identical (7017). This is consistent with
`corpus/lessons/round-18.md:143` / `.ufo/waves/round-18/drafts/source-recheck-round-18.md:143`
("A receipt's `sha256` must not be compared across runs or used as a page identity").

## 3. Identity, anchor, teaches — all held

**Identity.** HTTP/2 200, `redirects=0`, final URL exactly the receipt URL. Headers include
`content-type: text/html; charset=utf-8`, `last-modified: Wed, 07 Oct 2026 07:00:00 GMT`,
`date: Tue, 20 Oct 2026 20:02:17 GMT`, `vary: Cookie`, `server: Google Frontend`.
Document `<title>WebMCP &nbsp;|&nbsp; AI in Chrome &nbsp;|&nbsp; Chrome for Developers</title>`;
`rel="canonical" href="https://developer.chrome.com/docs/ai/webmcp"`; no challenge/interstitial.
The row's URL is live and same-identity.

**Anchor.** Four independent markers agree with the receipt's `anchorObserved` (`S032.json:20`):
- `last-modified: Wed, 07 Oct 2026 07:00:00 GMT`;
- visible `Published: May 18, 2026, Last updated: October 7, 2026`;
- footer `Last updated 2026-10-07 UTC.`;
- JSON-LD `"dateModified": "2026-10-07"`.
All are 2026-10-07, exactly the row anchor and the receipt's observed anchor. No anchor drift.

**Quote location.** Raw HTML at the §Local WebMCP step 1:
`<li>Open Chrome and navigate to <code translate="no" dir="ltr">chrome://flags/#enable-webmcp-testing</code></li>`.
The path string occurs exactly once in the body. The quote is not a contiguous raw-byte string
because the URL sits inside `<code>`; in rendered/visible text it is contiguous. An independent
Python `HTMLParser` render (script/style excluded) finds
`Open Chrome and navigate to chrome://flags/#enable-webmcp-testing` at offset 7019 with the same
surrounding section text; the producer-normalized offset is 7017. The tag boundary falls at a
natural space ("navigate to " + code text), so this is not a false word-join artifact of the
disclosed tag-dropping normalizer (`drafts/source-recheck-round-18.md:142`).

**Teaches support.** The row teaches three things. The 6-word quote directly supports only the
local-switch clause (step 1). The same fetched body supplies the rest:
- origin-trial clause: `Join the WebMCP origin trial from Chrome 149.` (normalized offset 6875;
  raw: `Join the <a …>WebMCP origin trial</a> from Chrome 149.`);
- local-switch procedure: `WebMCP is available as a Chrome flag for local development:` plus
  `Set the flag to Enabled .` and `Relaunch Chrome to apply the changes.` (all in the excerpt);
- negative/default clause: there is no `enabled by default` for WebMCP. The 7 raw `default`
  occurrences are 2 hreflang `x-default` links, 1 Permissions Policy `defaults to self`, 3
  demo-extension defaults (Node server/model/prompt routing), and 1 feature-flag name inside a
  `<script>` (`AIStudioInteractionsToggle__interactions_are_default`, removed by `html-text`);
  none says WebMCP is default-on. The origin-trial + local-flag framing supports "not a
  default-on feature" as a docs statement, though the page never writes that phrase verbatim.
The receipt's free-text note (`S032.json:22`) records the origin-trial and default framing; the
note is accurate. Verdict: **held**, no drift, not unreachable. The caveat that the quote alone
does not carry the whole compound claim is real and is already disclosed at
`drafts/source-recheck-round-18.md:140`; for this fetch the full page does support the teaches.

## 4. Receipt predicates and counter

All C1 contract predicates (`PLAN.md:69-77`) observed true for S032:
- schema `tabi-source-recheck-v1` (`S032.json:2`), row `S032` (line 3), filename `S032.json`;
- `rowUrl` (line 4) exact in the row's `source` cell at REV (`corpus/SOURCES.md:46`, field 3);
- `sha256` 64-hex (line 10); `quoteWords` 6 equals `wordCount(quote)` (lines 13-14);
- `normalize(quote)` occurs in `normalize(excerpt)`; `excerptSha256` equals the 1266-byte excerpt
  sha256 (line 19; verified with `sha256sum`); `quoteFound` true (line 16);
- `fetchedAt` 2026-10-20 (line 6); `teachesVerdict` held (line 21); `httpStatus` 200 (line 8);
  `producerSha256` matches the REV producer (line 24);
- exactly one S032 receipt pair; S032 not superseded at REV.

Read-only counter at REV (no writes; stdout redirected to `/tmp`):

```
node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
# exit=0
# {"rev":"530f40…","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable
#  freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,
#  "drift_superseded":0,"own_work":1,"rejected":[],"counterSha256":"df7999…"}
```

S032 is not in `rejected`. `held` is 50 because own-work S029 is counted separately; S032 is one
of the 50 non-own-work held receipts. The 51-row target is the baseline-fixed set
(`PLAN.md:16`, `corpus/lessons/round-18.md:13`); `eligible_rows` is 58 at REV because S058–S064
were opened this round, so 51/58 is expected, not 7 missing receipts. `--live` was not run as the
51-row command; S032's live predicate was reproduced directly: HTTP 200 and
`normalize(html-text(body)).includes(normalize(quote))` true. If `--live` were run now, S032 would
be counted `live_held`; its raw digest would differ, which `--live` does not check.

## 5. Findings (path:line, finite counterexample, disposition)

**F1 — The quote is an anchor, not a proof of the compound teaches; `--live` only tests the anchor.**
`measure-c1.mjs:428` counts live-held on `normalize(body).includes(normalize(r.quote))` alone;
the `teachesVerdict` value is not re-derived (`measure-c1.mjs:337`), and the note itself says
quote presence does not show the quote supports the teaches
(`drafts/source-recheck-round-18.md:140`). Finite counterexample on my own fetched body in `/tmp`
(not a live-page change): replacing the sentence `Join the WebMCP origin trial from Chrome 149.`
with `WebMCP is enabled by default in Chrome 154.` leaves the quote found at normalized offset
7015, so the `--live` predicate would still pass, while the teaches clause "not a default-on
feature" is now false; deleting the sentence leaves the quote found at 6971; changing step 2 to
`Set the flag to Disabled` leaves it at 7017. Disposition: **boundary, not a falsification of
S032** — the actual 2026-10-20 body supports the teaches and the seat's held verdict is correct.
It does mean C1's live check cannot be cited as detecting drift outside the single quoted span.

**F2 — The raw-body sha256 is a one-response snapshot, not reproducible.**
Receipt `S032.json:9-10` says 145257 B / `22dec7bd…`; two consecutive fetches with the exact
receipt argv produced 145257 B / `e6cb3537…` and 145261 B / `72d30ee0…`. The receipts'
`excerptSha256` is reproducible byte-for-byte (126859bf…) from both bodies; the differing bytes
are two `<script>` line opcodes (CSP nonce and devsite feature-flag payload). The contract only
requires `sha256` to be 64-hex (`PLAN.md:71`), and the note warns against comparing it
(`drafts/source-recheck-round-18.md:143`). Disposition: **disclosed limit, not a falsification**;
S032's content witness (excerpt/quote) is stable and matches.

**F3 — Counter reporting nuance: 51 / 58 at REV.**
`c1_rows_rechecked` 51 is the baseline-fixed target; `eligible_rows` 58 includes new rows
S058–S064 opened this round (`measure-c1.mjs:465`, `PLAN.md:16`,
`corpus/lessons/round-18.md:13`). No S032 effect; recorded so the 51/58 ratio is not read as seven
missing rechecks. The counter's `freshness_scope` field bounds the date but not this row delta.

**F4 — S029 rule not exercised.** S032 is an HTTP row, not own-work; the ticket's S029 rule
(pinned own-work commit, `git show`, no network) does not apply. No network request was made to
S029 and no S029 evaluation is claimed.

**Immutable availability vs live product freshness.** For S032 the receipt is a live HTTP fetch
of a living docs page (`row_classes.url` classifies S032 among `living_live`; `S032` is not a
pinned URL), and my independent fetch found the same visible text. The claim's wording
"re-verified against their live source" (`PLAN.md:15-16`) is therefore accurate for this row.
The receipt does **not** establish runtime/product freshness: `corpus/lessons/round-18.md:12-13`
explicitly excludes "current product support", and `drafts/source-recheck-round-18.md:141` says
no browser/runtime was used. No conflation is present in the measured artifacts; the scalar name
"freshness" must be read as source-registry freshness, not product support.

## 6. Limits

- Only S032 was re-fetched. The other 50 receipts, the 51-row `--live` run, and the C2/C3 claims
  were not re-run here; no pass is claimed for them.
- The exact bytes behind `22dec7bd…` could not be recovered; only the receipt's content witness
  (excerpt, quote, offset) was independently reproduced. A future reader must not use
  `S032.json:10` as a page identity.
- No browser, no WebMCP invocation, no Chromium build; no runtime/product behavior is asserted.
- `html-text` tag dropping is tolerant by design (`drafts/source-recheck-round-18.md:142`); for
  S032 the cross-tag boundary is at a natural space and an independent HTML parser confirmed the
  visible sentence.
- The `--live` insensitivity in F1 is demonstrated by synthetic mutation of my own fetched body;
  it is not evidence that the live page drifted on 2026-10-20.

## 7. Files written

- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS032.md (this report)
- /tmp/tabi-r18-liveS032/body-1, body-2, headers-1.txt, decode.mjs, c1.json (private sandbox;
  removed after this report; all commands, full digests and outputs are reproduced above)

No LANE production, fleet, sibling, jj or Git-index writes. No tools installed or updated.
