VERDICT: PASS

# S023 receipt attack — Playwright Locators (C1 freshness)

Row S023, receipt `corpus/evidence/round-18/source-recheck/S023.json` at measured candidate
REV `530f40a9bc3f10436161a2af1ca0fe9bffffc004` (baseline B `2bff864fdfee684ddbcd066cc8e735adaba2735c`).
Lane was read-only: `git -C LANE rev-parse refs/heads/master` and `HEAD` both returned
`530f40a9bc3f10436161a2af1ca0fe9bffffc004`; no git write was run in LANE. Private sandbox:
`/tmp/tabi-r18-s023-HdFx` (probe scripts and fetched body only).

## 1. Independent live fetch

Exact command (private /tmp cwd):

```
curl -sSL --compressed --max-time 90 -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o body -w '%{http_code} %{url_effective}' 'https://playwright.dev/docs/locators'
```

Observed: `200 https://playwright.dev/docs/locators` — no redirect.

- Decoded body bytes: **268087** (`wc -c < body`).
- Decoded body SHA256: **`234a24527d5a96e600e0dc1d832fb56bd8a539283df9f497ba982de21cdbdee6`** (`sha256sum body`).
- Observed GET response headers (same GET, body to /dev/null, `-D -`):
  `HTTP/2 200`; `server: GitHub.com`; `last-modified: Tue, 20 Oct 2026 16:46:38 GMT`;
  `etag: W/"6ad79aee-41737"`; `content-encoding: gzip`; `content-length: 22351`;
  `x-origin-cache: HIT`; `age: 84`; `date: Tue, 20 Oct 2026 20:03:39 GMT`.
  `content-length` is the compressed transfer body; the 268087 figure is the decoded body curl
  wrote with `--compressed`, which is what the receipt records and hashes.

Receipt comparison: `httpStatus` 200 (`S023.json:8`), `bytes` 268087 (`:9`), `sha256`
(`:10`) all equal the independent fetch exactly. The live body is byte-identical to the
receipt body, and also to the hash recorded in `corpus/lessons/kaika-fleet-round-1.md:66`
(2026-10-19 fetch) and `corpus/knowledge/playwright-accessible-locators-and-snapshots.md:2,13`
(2026-10-20 04:04 fetch).

## 2. Decode, normalize and quote location

Decode is `html-text` (`S023.json:11`) and normalization is the producer's
`normalize()` (`.ufo/waves/round-18/recheck-fetch.mjs:21-58`). I reimplemented both in the
sandbox (same tag-to-space loop, same NFC/quote/dash/NBSP/whitespace folding) and reproduced:

- Normalized body length: 24573 characters.
- Quote: `role locators do not replace accessibility audits and conformance tests, but rather give early feedback about the ARIA guidelines` (`S023.json:13`).
- `quoteWords`: **19** (matches `S023.json:14`; producer counts `trim().split(/\s+/)`).
- First and only normalized occurrence: offset **4509**, exactly `quoteOffset`
  (`S023.json:17`); `indexOf(q, at+1)` returned `-1`.
- Raw body (byte offsets into the 268087-byte decoded HTML):
  `<p>Note that role locators <strong>do not replace</strong> accessibility audits and conformance tests, but rather give early feedback about the ARIA guidelines.</p>`
  spans raw bytes **56829–56976**; the inline `<strong>` tags occupy 56843–56865.
  There is no block markup or word-joining inside the sentence; the rendered text is exactly
  the quote. `html-text` reduces the two inline tags to spaces, which the normalizer collapses.
  A raw-HTML substring test therefore fails (`do not replace accessibility audits` count = 0);
  the normalized visible-text test succeeds. This is the declared normalizer tolerance
  (`corpus/knowledge/source-recheck-round-18.md:142`), not a semantic change.
- Section: `id=locate-by-role` at raw 45491 (heading text at 45509); next heading
  `id=locate-by-label` at raw 57988. The quote lies inside §Locate by role, matching
  `S023.json:22` and the row anchor.
- Excerpt derivation: the producer's exact slice `text.slice(at-600, at+q.length+600) + "\n"`
  is 1332 bytes and has SHA256
  **`505dfbf06c320e65ebbc052f5d7687d115b82126ca23377282e4c410a9f397d9`**, equal to
  `S023.json:19` and to
  `corpus/evidence/round-18/source-recheck/S023.excerpt.txt`; byte equality with the derived
  slice is `true`. The excerpt's first bytes (`utton > ...`) and last bytes are consistent with
  the 600-character window (`S023.excerpt.txt:1`).

No alternative rendering/raw endpoint was needed: the quote is present in the live page. No
fallback was substituted for the receipt evidence.

## 3. Receipt and gate comparison

All fields in `S023.json:1-25` were compared against independent observations:

| Field (line) | Receipt | Independent |
|---|---|---|
| schema (`:2`) | `tabi-source-recheck-v1` | parsed; valid |
| row (`:3`) | `S023` | present once in `corpus/SOURCES.md` at REV line 37 |
| rowUrl (`:4`) | `https://playwright.dev/docs/locators` | occurs verbatim in the row `source` cell (`git show REV:corpus/SOURCES.md` line 37) |
| url (`:5`) | same | final curl URL identical |
| fetchedAt (`:6`) | `2026-10-20T19:05:43.753Z` | 2026-10-20; after the page's 16:46:38 GMT rebuild |
| command (`:7`) | canonical curl form | matches producer argv with `<tmp>/body` elided |
| httpStatus (`:8`) | 200 | 200 |
| bytes (`:9`) | 268087 | 268087 decoded |
| sha256 (`:10`) | `234a2452…bdee6` | identical full digest |
| decode (`:11`) | `html-text` | reproduced |
| quote/words (`:13-14`) | 19 words | 19 words |
| quoteSource (`:15`) | `corpus/lessons/kaika-fleet-round-1.md:66` | line 66 contains the quote and the same full hash |
| quoteFound (`:16`) | true | true, one occurrence |
| quoteOffset (`:17`) | 4509 | 4509 normalized-character offset (raw byte 56829) |
| excerpt (`:18`) | `S023.excerpt.txt` | present, regular blob |
| excerptSha256 (`:19`) | `505dfb…97d9` | identical |
| anchorObserved (`:20`) | stable channel + three identifiers | values observed; precision limit below |
| teachesVerdict (`:21`) | `held` | supported, with paraphrase breadth below |
| producerSha256 (`:24`) | `f2ba00…a360` | `git show REV:.ufo/waves/round-18/recheck-fetch.mjs \| sha256sum` = same |

Receipt file hash (working tree and `git show REV:` both):
`01df50278197e5ed295b1cfad272be36a3fa4008f0b193f5e983a967881f2d55`.

Row integrity: S023 is not one of the six superseded rows (`S004,S039,S047,S049,S050,S053`);
one S023 row and one S023 receipt exist. The counter at REV exited 0:

```
node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004
{"rev":"530f40a9...","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,...,"rejected":[]}
exit=0
```

S023 satisfies every documented predicate of `evaluateReceipt`
(`.ufo/waves/round-18/measure-c1.mjs:315-380`): schema, row id, filename, non-superseded row,
`rowUrl` in the source cell, 64-hex digest, 19 = quote word count ≤ 25, `quoteFound`,
2026-10-20 `fetchedAt`, held verdict, producer digest, excerpt blob and excerpt hash, and
quote-in-excerpt. It is one of the 51 counted rows.

## 4. Identity, anchor, teaches, and the freshness question

**Source identity: held.** The page's canonical is
`https://playwright.dev/docs/locators`, title `Locators | Playwright`, root class
`docs-version-stable docs-doc-page docs-doc-id-locators`; same body digest as the 2026-10-19
lesson hash and the 2026-10-20 04:04 knowledge-entry hash. Not a challenge/login page.

**Anchor: held at channel + section level, NOT a revision anchor.** The values in
`anchorObserved` are present, but:
- `docusaurus_version content=stable` and `docsearch:version content=stable` are Docusaurus
  channel flags, not a Playwright version, commit or date; the page has no version banner.
- `docs-doc-id-locators` occurs once, as the `<html>` class (`raw@121`), not as a `meta`
  tag. The receipt's wording groups it with the metas; the identifier is real, the "meta"
  prefix is loose.
- The section anchor is real: `id=locate-by-role` raw 45491, heading text raw 45509, quote
  between that heading and `id=locate-by-label` at raw 57988.
This is a channel/section anchor, not a revision identifier. The content-identity evidence is
the body hash, not the anchor. The channel can be rebuilt without a content change: the
observed `Last-Modified`/ETag now (`2026-10-20 16:46:38`, `6ad79aee-41737`) differ from the
04:04 knowledge-entry headers (`2026-10-19 16:28:55`, `6ad64547-41737`), while the body SHA256
is unchanged. That is a limit, not drift; no opposite content was found.

**Teaches: held, with a paraphrase breadth.** The quoted sentence directly supports the
"do not replace accessibility audits and conformance tests" half. The other half, "user-facing
semantic selectors", is supported by adjacent page text, not by the 19-word quote alone:
`The page.getByRole() locator reflects how users and assistive technology perceive the page`
(raw 45509; normalized 3402-...) and `it is the closest way to how users and assistive
technology perceive the page` (raw 57858; normalized 4739). The page does not use the literal
phrase "not an accessibility audit"; it says role locators do not *replace* audits and give
early ARIA feedback. The row's "explicitly not an accessibility audit" is a compression of
that, and the receipt note (`S023.json:22`) states the same reading. No contrary sentence was
found. This is semantic paraphrase breadth, not a false quote or a drift.

**Immutable availability vs live product freshness: no confusion in this path.** The S023
receipt is an actual live HTTP GET (200, GitHub Pages/Fastly cache HIT, dated 2026-10-20), not
an archived immutability claim. C1's own wording is source re-verification; the knowledge note
scopes it: "Quote presence is not claim truth" and "the 51 rows are not a statement of current
live product support" (`corpus/knowledge/source-recheck-round-18.md:140-141`), and the counter
records `freshness_scope` as the receipt date only, "not a reusable freshness due-date gate".
The receipt does not assert product behavior or a Playwright version. The page is a live
"stable"-channel document; its identity here is the body digest, and this row's body digest
did hold. No conflation was observed.

## 5. Finite limits and residual gaps (none falsifies S023)

1. `anchorObserved` is channel metadata. It cannot distinguish stable-channel rebuilds; only
   the body hash does. The receipt's "meta ... docs-doc-id-locators" phrasing is loose because
   that token is the `<html>` class, not a meta tag.
2. `quoteOffset` 4509 is an index into the normalized 24573-character text, not a byte offset
   into the 268087-byte body (raw quote starts at 56829). The field does not state its units,
   and the HTTP-row evaluator ignores it (`measure-c1.mjs:368-376` checks the offset only for
   S029). For S023 I matched it to the normalized text and separately located the raw span.
3. The counter re-derives the excerpt from the fetched body only for S029
   (`measure-c1.mjs:371-376`); for other HTTP rows it checks quote-in-excerpt and the excerpt
   hash but not body-to-excerpt derivation. S023's excerpt *was* independently re-derived from
   my live body and is byte-identical, so this receipt does not exploit that counter gap. The
   gap is counter-level, not an S023 receipt defect.
4. The quote crosses an inline `<strong>` element; a raw-HTML substring test fails by design.
   The normalizer bridges it and the visible text is exact. This is the tolerance recorded at
   `corpus/knowledge/source-recheck-round-18.md:142`.
5. The receipt records a decoded-body digest under `--compressed`; the wire transfer was gzip
   (`content-length: 22351`, `content-encoding: gzip`). Comparing 268087 to the HTTP
   `content-length` is not meaningful; the digest is over the decoded body that the producer
   read.
6. ETag/Last-Modified changed between the 04:04 and 20:03 fetches without a body change, so
   neither is content identity. "Stable" means channel, not immutable bytes.

No counterexample was found to the S023 receipt's quote presence, `teachesVerdict: held`,
source identity, live-fetch status, excerpt derivation, or producer/row binding. The source
was reachable (HTTP 200) and did not drift. Not unreachable, not drifted.

## 6. S029 note

S029 was not part of this row's attack and was not network-fetched. The counter's S029 branch
reads the pinned own-work blob at `837b33a3988ebeea7f6b4ef5c04698da88909a73`
(`corpus/evidence/round-13/aria/receipt.json`) with `httpStatus: null`
(`.ufo/waves/round-18/measure-c1.mjs:33-35, 346-360`); I did not exercise it.

## Tooling

No tools installed or upgraded; no pacman/uv/npm transaction was run. The only producer-adjacent
execution was the read-only counter `measure-c1.mjs` (no `--live`); `recheck-fetch.mjs` was
read, not run into the receipt directory. Probe scripts and the fetched body live only in
`/tmp/tabi-r18-s023-HdFx`.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS023.md
- /tmp/tabi-r18-s023-HdFx/body (independent fetch, 268087 bytes)
- /tmp/tabi-r18-s023-HdFx/probe.mjs
- /tmp/tabi-r18-s023-HdFx/rawprobe.mjs
- /tmp/tabi-r18-s023-HdFx/raw2.mjs
- /tmp/tabi-r18-s023-HdFx/ver.mjs
- /tmp/tabi-r18-s023-HdFx/offsets.mjs
- /tmp/tabi-r18-s023-HdFx/docid.mjs
