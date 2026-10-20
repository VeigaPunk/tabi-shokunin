VERDICT: ISSUES

# S034 live recheck — C1 receipt attack (round 18, wave 2)

Non-blocking verdict: the S034 receipt is authentic, byte-reproducible, and counted; source
identity, anchor and the source-verifiable part of `teaches` held. Two annotation defects are
recorded below. Neither changes `c1_rows_rechecked`.

## Scope and execution

Target: `corpus/evidence/round-18/source-recheck/S034.json` at REV
`530f40a9bc3f10436161a2af1ca0fe9bffffc004`; its excerpt; the S034 row of
`corpus/SOURCES.md` at REV; the quote source `corpus/lessons/round-16.md:44`; and
`corpus/knowledge/source-recheck-round-18.md`. The S029 own-work instruction was not exercised
(this item is S034 only).

All network and file probes ran in a private `/tmp/tabi-s034-3092` sandbox. No lane production,
fleet, sibling, Git index or jj state was written. No browser, no runtime probe, no install.

## Fetch evidence (observed, not inferred)

Command (same argv as the receipt, private output path):

```
curl -sSL --compressed --max-time 90 -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o body -w '%{http_code}\n' \
  'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/platform/runtime_enabled_features.json5?format=TEXT'
```

Observed: `200`, exit 0, `wc -c body` = `310220`,
`sha256sum body` = `3dc33e9d2e40f0c448c13e1ab7d1ea4f5a74dc1e95c72b943fbd5b43f2a478d0`.
This equals the receipt's `sha256` and `bytes` exactly.

Decode: `base64 -d body > decoded.json5` exit 0; `wc -c decoded.json5` = `232665`;
`sha256sum decoded.json5` =
`99b92e6776a5305543ab196a64128a11e2d4e86667e72e48787b05d45bcb1d2b`, which is the full
value of the row's abbreviated anchor digest `99b92e67…1d2b` and equals the receipt's
`anchorObserved` claim.

Quote located in the decoded identity:

```
7030:      implied_by: [
7031:        "WebMCPDeclarativeFileInput",
7032:        "WebMCPFormAssociatedCustomElements",
7033:        "WebMCPTesting"
7034:      ],
7035:      status: "experimental",
7036:    },
```

The normalized quote is at offset `184675` of the 193,642-char normalized body; `quoteWords` =
8; `normalize(quote)` is present in `normalize(excerpt)`; the excerpt is exactly the producer's
600-before/600-after slice (`excerptLen` 1324 chars, file 1325 bytes with newline). Recomputing
with the producer's own `normalize()`/`decodeBody()` gave
`{"normalizedLength":193642,"quoteIndex":184675,"receiptOffset":184675,"offsetMatch":true,"words":8,"receiptWords":8,"quoteInExcerpt":true,"excerptEqualsDerived":true}`.
So the quote is present on the first fetch; no alternative rendering or fallback was needed or
substituted.

Anchor/identity cross-check beyond the receipt. `GET
/+/refs/tags/154.0.8037.97?format=JSON` returned commit
`b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` (author/committer date Wed Sep 30 21:20:00 2026).
Fetching the same file at that commit returned `200`, `310220` bytes,
sha256 `3dc33e9d2e40f0c448c13e1ab7d1ea4f5a74dc1e95c72b943fbd5b43f2a478d0`;
`cmp -s body body-commit` → `IDENTICAL_RAW`; decoded digests both
`99b92e67…1d2b`; `IDENTICAL_DECODED`. The tag ref and the commit therefore serve the same
identity, and that identity equals the row digest.

Host context for the version scope: `pacman -Q chromium` →
`chromium 154.0.8037.97-1`; `chromium --version` → `Chromium 154.0.8037.97 Arch Linux`. The
pinned tag is the host's exact build line, not a newer/older substitute.

Receipt contract fields checked at REV: `rowUrl` occurs verbatim in the row's `source` cell
(`SOURCES.md:48`); S034 is not in the six-row superseded set; exactly one `S034.json`;
`command` is byte-equal to the producer's canonical argv; `httpStatus` 200; `sha256` 64-hex;
`quoteFound` true; `fetchedAt` `2026-10-20T19:06:12.039Z`; `teachesVerdict` `held`;
`excerptSha256` `941f353dc64c00c82f312e090728f7e0dfdc08690dddd7355a2e889fbac81c94` matches the
committed excerpt; `producerSha256`
`f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` equals the producer blob at
REV. The committed receipt blob is
`6c0ba214697ff2c1ce97cf38e0efa4aa080efeb0eaa9e95bb55faa9850948061`.

Counter run (`node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004`,
exit 0): `c1_rows_rechecked 51`, `eligible_rows 58`, `held 50`, `drift_superseded 0`,
`own_work 1`, `rejected []`. S034 is accepted. (The `eligible_rows 58` vs the fixed 51
denominator is the sibling-owned `w2/ReRunC1.md` finding; not reassessed here.)

## Identity / anchor / teaches: held, drifted, or unreachable

| Axis | Result | Basis |
|---|---|---|
| Source identity | **held** | Tag resolves to `b510e9d7…`; file at tag and at commit byte-identical; raw and decoded digests equal receipt/row. |
| Anchor (tag, lines 7023–7050, digest) | **held** | Lines 7023–7050 contain WebMCP (7023–7036), WebMCPDeclarativeFileInput (7038–7040), WebMCPFormAssociatedCustomElements (7044–7046), WebMCPTesting (7048–7050); decoded digest equals row digest. |
| Quote presence | **held** | Normalized quote at offset 184675; decoded lines 7030–7035; 8 words; excerpt exact. |
| `teaches` (source clauses) | **held** | WebMCP `status: "experimental"` at 7035; `implied_by` includes `WebMCPTesting` at 7033. |
| `teaches` (absence clause) | **held, not by the quote** | Case-insensitive search of the full decoded file for `declarativewebmcp` returns no match (`grep -in` exit 1). The quote itself carries no absence claim. |
| `teaches` ("flag token is inert") | **not source-provable** | The file can show no such registration; it cannot show runtime effect. Round-16 knowledge attributes the effect to the flags probe, not S034. See F2. |
| Drift | **none observed** | Same bytes on receipt fetch and both independent re-fetches. |
| Unreachable | **no** | HTTP 200 on tag and commit fetches. |

Does the quote actually support `teaches`? The 8-word quote supports the experimental status and
the membership of `WebMCPTesting` in `implied_by`; it does **not** name its subject (`name:
"WebMCP"` is line 7023, outside the quote), does not carry the absence clause, and cannot carry
runtime inertness. The receipt's excerpt supplies the subject context (its 600-char prefix
contains `name: "WebMCP"`), and the receipt's note records the exhaustive absence search. So the
quote-plus-excerpt-plus-note chain supports the first three clauses; the fourth remains an
external inference. The row's `teaches` also under-describes the implication set: `implied_by`
lists three features, while the cell names only `WebMCPTesting` (the round-16 reopen already
recorded this as a precision note, not a break).

Immutable availability vs live product freshness. The receipt re-fetches a tag-pinned URL, so
drift is unreachable by construction unless the server moves/rewrites the tag. This re-fetch
proves (a) the live server still serves the identity, (b) the bytes still equal the row's
recorded digest (verified by me; the receipt itself records only the raw-body digest), and
(c) the quoted text is still present. It does **not** prove product currency: if Chromium 155
shipped, this receipt would remain `held` unchanged. The main claim is not confused at the
claim level: `corpus/lessons/round-18.md:12` says C1 counts "recheck receipts, not overdue rows
or current product support", and the note says the pinned class records bytes only, not the
commit served (`corpus/knowledge/source-recheck-round-18.md:110`) and that the 51 rows are "not
a statement of current live product support" (`:141`). The residual gap is that the counter does
not bind a non-S029 receipt's digest to the row anchor: `measure-c1.mjs:330` only checks that
`sha256` is 64-hex, and `:347` compares a digest only for S029. For S034 I closed that gap
independently (tag → commit → byte equality); the receipt alone would not detect a tag rewrite
that preserved the quote.

## Findings

F1 — off-by-one line in the receipt's free-text note.
`/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S034.json:22`
says `WebMCP is status experimental (line 7036)`. In the same identity, line 7035 is
`status: "experimental",` and line 7036 is `},`. Finite counterexample:
`awk 'NR==7035||NR==7036{printf "%d:%s\n",NR,$0}' decoded.json5` prints exactly those two
lines. Severity: cosmetic annotation only; no counter field reads `note`, the quote and anchor
are correct, and C1 admission is unaffected. Fix if desired: `7036` → `7035`.

F2 — "body still supports teaches" overstates the final clause.
`S034.json:22` says `Body still supports teaches: ...`; the row's teaches at
`/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md:48` ends `... no DeclarativeWebmcp
feature exists there, so that flag token is inert`. The file supports "no such feature token";
it cannot support "inert". The project already knows this:
`/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/webmcp-chromium-loopback-round-16.md:46-49`
says the token's no-observed-effect result is shown by the flags probe and the wave-2 reopen,
"not by S034 alone", and notes the binary contains a `kDeclarativeWebmcp` string whose
declaration is unresolved. The round-18 receipt note drops that qualification. Severity: low,
pre-existing wording; the source-verifiable facts are true and the runtime effect is separately
probed. The row's one-line `teaches` cell is the overreaching artifact, not the quote or digest.

F3 — immutable availability is not live product freshness (boundary, not a receipt defect).
`measure-c1.mjs:330` and `:347` do not compare a non-S029 receipt digest to the row anchor;
`corpus/knowledge/source-recheck-round-18.md:110` admits the receipt "records bytes only, not
the commit served". For S034 I resolved the tag to `b510e9d7…` and proved the file at that
commit is byte-identical, so identity held here. A hypothetical tag rewrite that preserved the
quote would still satisfy the receipt and counter; the finite counterexample is a future
Chromium 155 release, after which S034's receipt still reads `held` with no product-currency
meaning. No repair is required for C1 as scoped; this bounds what the receipt proves.

## Limits

- No browser and no WebMCP runtime probe were run by this seat; the "inert" clause is checked
  only against the round-16 knowledge attribution, not re-observed.
- No tag-move test and no Chromium 155 source comparison; product freshness was not measured.
- No alternative rendering was fetched because the canonical gitiles `?format=TEXT` endpoint
  matched on the first fetch and the tag/commit cross-check was byte-identical.
- No `--live` counter mode was used; the plain counter reads committed inputs.
- No tools installed or upgraded.
- The `/tmp/tabi-s034-3092` sandbox was removed after capture.

Files written:
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS034.md`
