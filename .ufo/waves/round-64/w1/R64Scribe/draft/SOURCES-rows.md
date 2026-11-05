# SOURCES rows — round 64 (wave 1, seat R64Scribe) — DRAFT for the L1 to append

Rows below are the **only** rows the drafted entry's `source:` header cites
(`corpus/knowledge/chromium-wheel-scroll-round-64.md` →
`.ufo/waves/round-64/w1/R64Scribe/draft/chromium-wheel-scroll-round-64.md`).
Both ids are new: the registry's highest id is S167, so S170 and S171 collide
with nothing. Neither URL is held by an existing row, so the census raises no
duplicate-URL finding (W04/E04) for either; the CDP `browser_protocol.json`
URL stays with S153, and the CSSOM View URL stays with S167 — those are
re-opened in place, not re-appended.

Both rows are **build-scoped** to Chromium tag `155.0.8059.84`, the build the
round-64 receipt names (`host.chromium` = `Chromium 155.0.8059.84 Arch Linux`).
That is the reason they are not the `@master` `browser_protocol.json` row: the
claim the entry makes is about *this* build's protocol surface, and a moving
`@master` artifact cannot carry a build-scoped claim.

## Rows (11 columns, lane schema)

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S170 | Chromium 155.0.8059.84 — Input domain PDL — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/Input.pdl?format=TEXT | code | A | the CDP Input domain's mouse-event dispatch contract **at build tag 155.0.8059.84 only**: the `mouseWheel` event type and the `deltaX` / `deltaY` unit wording; not scroll behaviour, not cancelation, not rendering determinism, not a delivery contract, not any other build | tag `155.0.8059.84` (commit `5869fe313571d75152b77813cf0a4ee26a4e6df0`) Input domain PDL fetched 2026-11-04 into `.ufo/waves/round-64/w1/R64Scribe/sources/s170-chromium155-Input.pdl` (14,431 B decoded, sha256 `5bbc6e23eb17a009da540792bd5f647567e9c81f919081059dff5274a1c66e3d`; base64 transfer 19,244 B, sha256 `20257c65bbda07c6b3d9870b6f973403efa77a2ab84d479ecf6e629fe73df9d7`); located quotes "Y delta in CSS pixels for mouse wheel event (default: 0)." at decoded byte 8752 and "X delta in CSS pixels for mouse wheel event (default: 0)." at decoded byte 8657 | a wheel delta is expressed in CSS pixels, so the fixture's 120 px bands and the dispatched delta are the same unit and a band colour encodes a scroll offset; this is the same protocol text S153 carries from the moving `@master` JSON, re-pinned at an immutable build tag, so it is not independent corroboration of a second source | mined | 2026-11-04 | on-release | corpus/knowledge/chromium-wheel-scroll-round-64.md |
| S171 | Chromium 155.0.8059.84 — Browser domain PDL — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/Browser.pdl?format=TEXT | code | A | the CDP Browser domain's version command **at build tag 155.0.8059.84 only**: the `getVersion` response fields `protocolVersion`, `product`, `revision`, `userAgent`, `jsVersion`; not browser behaviour, not scroll behaviour, not a support promise, not any other build | tag `155.0.8059.84` (commit `5869fe313571d75152b77813cf0a4ee26a4e6df0`) Browser domain PDL fetched 2026-11-04 into `.ufo/waves/round-64/w1/R64Scribe/sources/s171-chromium155-Browser.pdl` (12,079 B decoded, sha256 `5e1faf7dbe56cce01447ea627ca6cc023418cafe7528bede3e5f2571363170da`; base64 transfer 16,108 B, sha256 `25395a8e3085782932eef4334edd3075bed5a98441934598e9a6b0eaac116858`); located quote "Returns version information." at decoded byte 7146 with the five field names (`string protocolVersion` at byte 7240 to `string jsVersion` at byte 7439) | `Browser.getVersion` is the CDP surface that reports the browser's protocol version and product string, so a receipt's browser identity can be read over the wire instead of asserted | mined | 2026-11-04 | on-release | corpus/knowledge/chromium-wheel-scroll-round-64.md |

## Integration notes for the L1

1. **Append order.** Both rows go after S167 in the `## Registry` table; the
   table is the only place a `| S… |` row may live (`E12` otherwise).
2. **used-by reciprocity.** QUALITY criterion 75 requires every id an entry's
   `source:` line names to list that entry's path in `used-by`. The draft entry's
   header names `S170, S171`, and both rows above list the draft entry path.
   `scripts/check-sources.mjs` also greps the used-by file for the row id
   (`used_by_uncited`), so the used-by path must be the file that actually
   carries `S170` / `S171` in its `source:` line — the draft entry, or the
   corpus note once the L1 lands it with the same header.
3. **Decoded bytes must be committed.** QUALITY criterion 67 admits a
   googlesource `?format=TEXT` source only once its decoded bytes are committed
   as lane evidence, with `bytes_path`, `decoded_sha256` and the transfer's
   `encoded_sha256` recorded. The two anchor cells above record all three; the
   decoded files currently live under this seat's directory
   (`.ufo/waves/round-64/w1/R64Scribe/sources/`). If the L1 relocates them to
   the round's shared staging directory `.ufo/waves/round-64/sources/` (where
   `s168-cdp-browser-protocol.json` and `s169-cssom-view-refetch.html` already
   sit), the `bytes_path` in both anchor cells and the two `node -p` commands in
   the entry's as-of table must be updated to match. The digests do not change.
4. **No new Page-domain row.** The round-64 `Page.pdl` fetch at tag
   `155.0.8059.84` decodes to sha256
   `e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be`, which is
   byte-identical to the copy S105 already holds for tag `154.0.8037.97`
   (same digest, same 61,911 B decoded length). A second row for those bytes
   would be the same source presented under a new name — the pattern the lane
   records as source-diversity growth in S093→S098/S099 — so no row is proposed
   for it. The re-fetch is recorded as a freshness datum in the seat report
   instead, and it is also the evidence that the Page domain did not drift
   between those two tags.
5. **Do not re-append the `@master` protocol JSON.** S153 already holds
   `raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json`;
   a second row for that URL is refused by the census (the round's own Gate
   recorded the refusal). If the L1 wants the delta-unit and
   `captureBeyondViewport` scopes carried on the `@master` URL as well, that is
   an in-place re-open of S153 — the same shape the round lesson already
   records — not a new row.
6. **Registry count.** After the two appends the registry is 167 → 169, tier A
   149 → 151, status `mined` 142 → 144. Re-derive with
   `scripts/sources-census.sh census --root /home/vgpnk/Projects/shokunin tabi`
   and `node scripts/check-sources.mjs --file corpus/SOURCES.md` rather than
   trusting these figures.

## Row-shape self-check

Both rows above are 11 columns with no literal or escaped `|` inside any cell;
the ids S170 and S171 are absent from the registry at the freeze revision
`0fc68043f5b5e4e9fc0a69c5924e78f2cb0e6741` and from the current working-tree
`corpus/SOURCES.md`; `recheck` is the symbolic cadence `on-release`, which both
`scripts/check-sources.mjs` and `scripts/sources-census.sh` accept.
