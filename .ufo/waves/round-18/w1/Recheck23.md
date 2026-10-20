VERDICT: PASS

# Recheck23 — C1 freshness, rows S048 + S051

Both rows re-opened live on 2026-10-20 with the shared producer
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/recheck-fetch.mjs`
(producer sha256 `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`, equal to the file at LANE).
Both original Gate quotes were still present verbatim under `html-text` decoding; no row drifted, so no
superseding row is drafted. Neither row is in PLAN's superseded set (S004/S039/S047/S049/S050/S053).

## Per-row receipts

### S048 — https://developer.chrome.com/docs/devtools/application/webmcp
- http: `200`; bytes: `191224`
- sha256: `b4a79911f2da4d67355d50b954c84fed70cd22064de66d41a214b07a4a3f6c1f`
- quote (11 words, `quoteFound: true`, offset 8241): "The result of the invocation (Completed, Canceled, In Progress, or Error.)"
- quote-source: `corpus/lessons/round-17.md:60` (original Gate quote, unchanged)
- verdict: `held`
- anchor observed: footer "Last updated 2026-05-12 UTC."; 191224 B body (same length as the round-17 cell);
  section ids `test-tools` and `invoked-tools` both present.
- teaches check: `§Test tools manually` still documents the bypass path — click a tool in the Available Tools
  list, or the Play icon in the Invoked Tools log, then "enter or adjust parameters" and "Click Run tool",
  with parameters pre-populated when starting from an invoked tool; `§Invoked tools` still carries the
  "Status: The result of the invocation (Completed, Canceled, In Progress, or Error.)" bullet plus Input and
  Output rows. Both clauses of `teaches` ("manual invocation"; "status vocabulary") are present.
- excerpt sha256: `be6a9469e8e4b879cac0ff5ebc63c04833e2763078096267cec7617cab248159`
- drift draft: none.
- fetch variance (not a drift): three fetches today returned three digests at the identical 191224-byte
  length — `ab0646408cb30bbf9cb91406fc342b25cf6d44061282ac0d4fc38691a7be7694`,
  `6b1293e29d06e3c8975c801062babe373ff8a645e267853f8284ffb1f7c35c76`, and the receipt's
  `b4a79911…6c1f` — plus round-17's `9bd94f41…87e5`. All three today contain the quote at the same
  normalized offset (8241) and the same footer date. This reproduces the round-17 "sha NOT
  reproducible" note; content is bound by quote and offset, not by digest. `[INFERENCE]` the varying bytes
  are page chrome/feature arrays, not the quoted prose — the diff position was not mapped.

### S051 — https://git-scm.com/docs/git-symbolic-ref
- http: `200`; bytes: `28804`
- sha256: `d706904473082a0ef07ed8eedd2c4d94be25dac852e58ff3b017048828c38872` — byte-identical to the
  round-17 Gate row's recorded HTML digest; the page has not changed since 2026-10-20 round-17.
- quote (24 words, `quoteFound: true`, offset 2742): "Do not issue an error message if the <name> is not a symbolic ref but a detached HEAD; instead exit with non-zero status silently."
- quote-source: `corpus/lessons/round-17.md:63` (original Gate quote, unchanged)
- verdict: `held`
- anchor observed: the live page prints no git version banner; the body text is the v2.56.0 manual —
  raw `Documentation/git-symbolic-ref.adoc` at tag `v2.56.0` fetched 2026-10-20 with sha256
  `c852e74cba71e5b574205fd4f0ba18817f38be0ab5447435754a326480b60692` (2372 B), identical to the
  round-17 raw digest, and its `-q` paragraph sits at adoc lines 41-43 and the exit-status NOTES at
  lines 72-74, exactly the row's anchor cell.
- teaches check: `§OPTIONS` still states `-q`/"--quiet" exits "with non-zero status silently" when the name
  is a detached HEAD (adoc:41-43); `§NOTES` still states "git symbolic-ref will exit with status 0 if the
  contents of the symbolic ref were printed correctly, with status 1 if the requested name is not a
  symbolic ref, or 128 if another error occurs" (adoc:72-74). Both halves of `teaches` — exit 0 + printed
  branch when attached, exit 1 silently when detached — are grounded verbatim.
- excerpt sha256: `cb1a3cd0597d7e57ebb4aad9189877a1eb7226dbf61c1f99b31f0d0a260c4cab`
- drift draft: none.

## Contract self-check (run on the emitted files, not on the counter)

Both receipts parse as `tabi-source-recheck-v1`; `row` present in `corpus/SOURCES.md:62` / `:65` and not in
PLAN's superseded set; `rowUrl` occurs verbatim in each row's `source` cell; `sha256` and `producerSha256`
are 64-hex; `quoteWords` (11, 24) equals the word count of `quote`; `normalize(quote)` occurs in
`normalize(excerpt)` for both; `excerptSha256` equals sha256 of the excerpt file bytes (recomputed);
`quoteFound` true; `fetchedAt` 2026-10-20T19:06:13Z; `httpStatus` 200; `teachesVerdict` `held`.
Recomputed excerpt digests: `be6a9469…8159` and `cb1a3cd0…4cab`, matching the receipt fields.
`measure-c1.mjs` does not exist yet in `.ufo/waves/round-18/`, so the C1 counter run itself was not
attempted — this seat verified the contract fields directly.

## Tooling

No installs or upgrades; `node` v24.21.0 and `curl` were already present. No pacman transaction attempted.
Scratch bodies lived in `/tmp/r18-recheck23` and were deleted after the receipts were emitted.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S048.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S048.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S051.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S051.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/Recheck23.md
