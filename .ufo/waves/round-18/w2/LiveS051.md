VERDICT: ISSUES

# LiveS051 — C1 receipt attack: S051 `git-symbolic-ref`

LANE `/home/vgpnk/Projects/shokunin/tabi-shokunin`; REV `530f40a9bc3f10436161a2af1ca0fe9bffffc004`.
Attacked inputs: `corpus/SOURCES.md:65` (row S051), `corpus/evidence/round-18/source-recheck/S051.json:1-25`
and its excerpt, quote source `corpus/lessons/round-17.md:63`, and
`corpus/knowledge/source-recheck-round-18.md:97,140-143`. Read-only in LANE; no git/jj writes; no
producer run into production; no subagents. Fetches ran in `/tmp/tabi-r18-s051-sCZi` and were removed
after digesting. No tools installed.

## Re-fetch (receipt URL, same curl argv)

```
curl -sSL --compressed --max-time 90 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o /tmp/tabi-r18-s051-sCZi/body -w 'HTTP=%{http_code} SIZE=%{size_download} URL=%{url_effective}\n' \
  'https://git-scm.com/docs/git-symbolic-ref'
HTTP=200 SIZE=5607 URL=https://git-scm.com/docs/git-symbolic-ref
curl exit 0; on-disk body 28804 B
sha256 d706904473082a0ef07ed8eedd2c4d94be25dac852e58ff3b017048828c38872
```

The on-disk body is **byte-identical** to the receipt (`bytes` 28804, `sha256` `d7069044…38872`, HTTP 200);
the page is reproducible byte-for-byte, so no dynamic-page relaxation was needed. `SIZE=5607` is the
compressed transfer size; the receipt's `bytes` is the decoded on-disk body length (producer
`.ufo/waves/round-18/recheck-fetch.mjs:99-101,110`).

## Decode and quote location

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/recheck-fetch.mjs \
  --normalize-only --decode html-text --body /tmp/tabi-r18-s051-sCZi/body \
  --quote 'Do not issue an error message if the <name> is not a symbolic ref but a detached HEAD; instead exit with non-zero status silently.'
{"found":true,"offset":2742,"normalizedLength":4186,...}  exit 0
```

`quoteWords` = 24 = the receipt's 24; quote offset 2742 = receipt `quoteOffset` 2742. Excerpt:
1331 B, sha256 `cb1a3cd0597d7e57ebb4aad9189877a1eb7226dbf61c1f99b31f0d0a260c4cab`, quote at
excerpt offset 600; both the in-tree file and the REV blob (`git show 530f40a…:corpus/evidence/round-18/source-recheck/S051.excerpt.txt`)
give that digest. Producer sha256 `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`
matches the file and the receipt. `fetchedAt` `2026-10-20T19:06:13.272Z` matches the file mtime
`2026-10-20 16:06:13.271758974 -0300` (= 19:06:13.271Z). `quoteSource` `corpus/lessons/round-17.md:63`
contains the same 24-word quote in the S051 row.

## Identity, anchor, teaches

| Facet | Observation | Verdict |
|---|---|---|
| URL identity | HTTP 200, final URL unchanged; body sha = receipt sha | held |
| Tag identity | GitHub API `refs/tags/v2.56.0` → object `2478544319491bbd2a42cc57a83e3d2f4730a280` type `tag`; tag object → `a018953688f1b10bddf91bff8747068f5f4746a4` type `commit` | held |
| Pinned adoc | `raw.githubusercontent.com/git/git/v2.56.0/Documentation/git-symbolic-ref.adoc` HTTP 200, 2372 B, sha256 `c852e74cba71e5b574205fd4f0ba18817f38be0ab5447435754a326480b60692`; quote at `:41-43`, NOTES at `:72-74` (`nl -ba`) | held |
| Teaches (document) | OPTIONS quote covers `-q` detached → non-zero silently; NOTES at normalized offset 3831 adds status 0/1/128 | held |
| Teaches (runtime, git 2.56.0) | private /tmp repo: attached → `refs/heads/master`, rc 0; detached `-q` → rc 1, 0 stdout, 0 stderr; detached non-quiet → rc 128, 38 B stderr | held |

The quote itself supports only the `-q`/detached/non-zero half of `teaches`. The exit-status mapping
(0, 1, 128) is the NOTES paragraph; the receipt's `note` (`S051.json:22`) cites NOTES 0/1 but omits 128.
The committed excerpt does **not** contain that sentence: excerpt range normalized 2142..3472, while
`will exit with status 0` is at 3831 and `In the past` (NOTES start) at 3432; the excerpt tail ends
mid-word `"NOTES In the past, .git/HEAD was a symbolic li\n"`. The page text is present and I read it at
3831, so `held` is defensible against the live source, but the receipt's committed quote+excerpt alone
under-evidence the exit-0/1 half.

## Version-insensitivity counterexample (the availability/freshness boundary)

The receipt's `anchorObserved` (`S051.json:20`) says `"no version banner"`. The fetched body carries a
version panel in normalized text:

- `Latest version` at 1559
- `git-symbolic-ref last updated in 2.48.0` at 1593
- `2.48.1 → 2.56.0 no changes` at 1655

There is no literal element whose class contains `banner` (only the NOTES word `deprecated`), but the
panel is the only in-body version identity, and the prior round-17 re-open recorded exactly these
strings at the same digest (`.ufo/waves/round-17/w2/ReopenS051.md:17-19`). The receipt's phrase denies
the one marker its own bytes contain; its adoc-digest assertion is true but is free text, with no fetch
command/status/bytes recorded for it.

Finite counterexample to quote-as-version-evidence:

```
GET https://git-scm.com/docs/git-symbolic-ref/2.48.0
HTTP 200, redirects=0, final URL same, on-disk 28675 B,
sha256 1d6a6c0ee89c335a055217d2659450bbcfb3f6404fc698325fd08aab090c8b6f
normalized text: 4186 chars, first difference at 4186 (= EOF) vs the live page
quote at 2742; NOTES exit sentence at 3831
raw diff: first byte 21970, 6536 differing bytes, all markup (live page has
data-pagefind-filter/meta/weight/body attributes; the /2.48.0 page has <div id="main">)
```

So the same quote at the same offset is served on a page whose path names 2.48.0. The quote cannot
discriminate 2.56.0; the page's `2.48.1 → 2.56.0 no changes` panel and the tag-pinned adoc do. The
receipt's "no version banner" + adoc assertion is therefore the wrong basis for the anchor, even though
the anchor itself reproduces.

## Main claim: immutable availability vs live product freshness

The declared C1 claim does **not** conflate the two: `PLAN.md:15` says "Source rows re-verified against
their live source with a committed recheck receipt"; `corpus/lessons/round-18.md:12` says C1 counts
receipts "not overdue rows or current product support"; `corpus/knowledge/source-recheck-round-18.md:140-143`
says quote presence is not claim truth and the note is source-only/no runtime. The confusion is
localized to the receipt: a rolling "Latest version" page's quote+digest is presented as anchor
evidence while the in-body version panel is denied, and the quote is version-insensitive. The anchor
still holds because the page's panel names the 2.56.0 range and the tag-pinned adoc at v2.56.0 contains
the sentence; but that adoc fetch is not recorded in the receipt.

Counter effect: `measure-c1.mjs:335-369` checks `quoteFound`, date, `teachesVerdict`, excerpt sha and
quote-in-excerpt; it does not read `anchorObserved`. Every receipt field reproduces, so S051 still
counts and `c1_rows_rechecked` is not falsified. These are calibration/evidence-quality defects, not
drift/unreachable.

## Findings

1. **ISSUES — receipt anchor description.** `S051.json:20` says "no version banner"; the body contains
   `Latest version` (1559), `last updated in 2.48.0` (1593), `2.48.1 → 2.56.0 no changes` (1655), and
   `ReopenS051.md:17-19` recorded them at the same digest. The anchor still held via the tag-pinned adoc.
2. **ISSUES — quote is not version-discriminating.** `https://git-scm.com/docs/git-symbolic-ref/2.48.0`
   is text-identical (4186/4186; quote 2742; NOTES 3831) with different bytes (`1d6a6c0e…b6f`, 28675 B,
   HTTP 200, no redirect). Quote presence cannot establish the row's `(git 2.56.0)` anchor; the version
   panel and adoc digest do.
3. **ISSUES — excerpt under-evidences `teaches`.** The committed excerpt stops at 3472; the NOTES
   exit-status sentence is at 3831 (`S051.json:22` asserts it, omits 128). The receipt quote alone
   supports only the `-q`/non-zero half. Widen the excerpt or quote the NOTES sentence.
4. **Note — pre-existing registry looseness.** The `corpus/SOURCES.md:65` quote cell is a paraphrase,
   not verbatim, and says "prints the branch" where the command prints `refs/heads/<branch>`; already
   recorded at `ReopenS051.md:49,78-79`. No round-18 regression.
5. **Note — reproducibility of `bytes`.** `bytes` 28804 is the decoded on-disk body; `curl
   %{size_download}` is 5607 under `--compressed`. Compare `wc -c`/sha256 of the body, not the transfer
   size.

## Limits

HTTP GET only; no real-site page tool; no credentials/session content; no full-system or pacman
transaction; no lane git writes. The runtime probe used the installed `git version 2.56.0` in a private
`/tmp` repo (removed). The `/2.48.0` rendering is a versioned path; its manual text is directly observed
to be identical to the live page, and the page's own panel asserts no changes 2.48.1→2.56.0. Fetched
bodies were removed after digesting; the commands above reproduce them.

Files written: /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS051.md
