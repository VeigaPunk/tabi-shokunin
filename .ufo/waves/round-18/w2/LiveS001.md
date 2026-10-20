VERDICT: PASS

# C1 / S001 — independent re-open (2026-10-20)

Item: `corpus/evidence/round-18/source-recheck/S001.json` + `S001.excerpt.txt`; registry row
`corpus/SOURCES.md:15`; measured REV `530f40a9bc3f10436161a2af1ca0fe9bffffc004`.
Lane tip check: `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse --verify refs/heads/master`
→ `530f40a9bc3f10436161a2af1ca0fe9bffffc004` (exit 0), equal to the candidate REV.

## Re-fetch

Private scratch `/tmp/tabi-r18-lives001-1VcBpj`. Command (receipt's fixed UA, same curl argv shape
as `recheck-fetch.mjs:95`):

```
curl -sSL --compressed --max-time 90 -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o body -w 'HTTP=%{http_code} SIZE=%{size_download} CT=%{content_type} URL=%{url_effective}\n' \
  'https://developer.chrome.com/blog/remote-debugging-port'
```

Observed (exit 0):

```
HTTP=200 SIZE=17167 CT=text/html; charset=utf-8 URL=https://developer.chrome.com/blog/remote-debugging-port
```

`SIZE=%{size_download}` is the compressed wire size; the decoded on-disk body is
`96393` bytes, full digest
`sha256 8d999411798389b884c1687397da53a7d66b7adffd367412b1284b750fc986f8`.

Receipt records `96397` bytes and
`sha256 c040a72e40a7bf4a00dd2942e80ed2b608d65a10959fd668d4b7bc19a89d6212`
(`S001.json:9-10`).

The 4-byte raw delta is not content drift. The page embeds a per-response CSP
`<script nonce="...">` (my response: one 30-char nonce) plus devsite analytics JSON. The
decoded normalized text is 5104 chars, and the 600-before/600-after excerpt window
recomputed from my fetch is byte-identical to the committed excerpt (next section). The
note already forbids cross-run digest comparison on dynamic pages
(`corpus/knowledge/source-recheck-round-18.md:143`). Directional evidence that this predates
this round: the knowledge entry's 2026-10-19 fetch was also `96,397 B` but with a different
sha, `bf63ed06…a871668` (`corpus/knowledge/chrome-remote-debugging-profile-boundary.md:84`),
so raw size/digest instability is already on record for this URL.

## Decode and quote location

Receipt `decode: html-text` (`S001.json:11`). I decoded with the producer's exported
`decodeBody`/`normalize` (`recheck-fetch.mjs:21-43`) and with an independent reimplementation
of the same algorithm; both produced 5104 normalized chars and both located the quote at
offset **3161**, one occurrence. Receipt `quoteOffset` is 3161 (`S001.json:17`).

Quote: `These switches will no longer be respected if attempting to debug the default Chrome
data directory` — 16 whitespace-delimited words, matching `quoteWords: 16` (`S001.json:14`);
`quoteSource` `corpus/lessons/kaika-fleet-round-1.md:44` carries the same sentence verbatim
(verified).

Excerpt recomputation used the producer's exact slice formula (`recheck-fetch.mjs:107`):
1299 chars + trailing newline = 1300 bytes,
`sha256 ae29eb05ecbea4d1bcb5f1f5bfd87c7c782de8111ce0872e864d5642af0a2bca`.
That equals `excerptSha256` (`S001.json:19`) and the committed file
`corpus/evidence/round-18/source-recheck/S001.excerpt.txt` (`sha256sum`, 1300 B). This is
stronger than the counter's minimum: for HTTP rows `measure-c1.mjs:315-378` checks only the
excerpt's own sha and quote-in-excerpt; it does not re-derive the excerpt from the fetched
body (only S029 is re-derived, `:369-375`). My re-derivation closes that gap for S001.

Producer binding: `git show 530f40a…:.ufo/waves/round-18/recheck-fetch.mjs | sha256sum` →
`f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`, equal to
`producerSha256` (`S001.json:24`) and to the worktree file.

## Identity / anchor / teaches

- **Identity: held.** No redirect; `url_effective` equals the receipt URL. Raw HTML carries
  `<link rel="canonical" href="https://developer.chrome.com/blog/remote-debugging-port">` and
  `og:url` equal to it. The row's `source` cell contains the URL verbatim
  (`corpus/SOURCES.md:15`); `measure-c1.mjs:329` passes.
- **Anchor: held.** Decoded page: `Published: March 17, 2025` (offset 2118),
  `Last updated 2025-03-17 UTC.` (offset 4201), and the `from Chrome 136` paragraph
  (offset 3056); the quote sits at 3161. Row anchor: "blog post published 2025-03-17, body
  paragraph 'from Chrome 136'". Receipt `anchorObserved`: "Last updated 2025-03-17 UTC
  (footer); body paragraph \"from Chrome 136\"" (`S001.json:20`). Both agree with the page.
- **Teaches: held for what this page says; not held for the whole registry cell.** The page
  states, in order: from Chrome 136 the two switches "will no longer be respected if
  attempting to debug the default Chrome data directory"; they "must now be accompanied by
  the --user-data-dir switch to point to a non-standard directory"; and "For browser
  automation scenarios, we recommend using Chrome for Testing which will continue to respect
  the existing behavior." That supports the row's default-dir refusal, the non-standard
  `--user-data-dir` requirement, and the CFT-exemption clause.
- **The "Branded" qualifier is not in this source.** The registry cell says `Branded Chrome
  ≥136 ignores remote-debugging switches…` (`corpus/SOURCES.md:15`), but the decoded page and
  the raw HTML both contain **zero** case-insensitive occurrences of `brand` (also zero
  `GOOGLE_CHROME_BRANDING`). The receipt's own note says "the branded-only qualifier comes
  from S004, not this body" (`S001.json:22`). The knowledge entry separates §1 (published
  rule, S001) from §2 (branding gate, S004) at
  `corpus/knowledge/chrome-remote-debugging-profile-boundary.md:10-35`. So the cell is a
  cross-row synthesis; the `held` verdict is true for the page-scoped teach and gets the
  brand qualifier from S028 (successor of S004), whose receipt is part of the 51. This is a
  provenance caveat, not drift: the page never claimed to be branded-only.
- **Quote-vs-teach support.** The quote starts with "These switches"; its referents
  (`--remote-debugging-port`/`--remote-debugging-pipe`) and the version (Chrome 136) are in
  the immediately preceding sentence. The excerpt includes both, so the excerpt supports the
  claim; the bare quote alone does not name the switches, the version, CFT, or branding.

## The freshness attack: availability/persistence vs live product freshness

- `fetchedAt` is `2026-10-20T19:05:36.343Z` (`S001.json:6`); the page's own `Last updated` is
  **2025-03-17**, identical to its published date. That is **582 days** before the fetch
  (`date(2025,3,17)` → `date(2026,10,20)` = 582 days), and its own footer reports no revision
  since the Chrome 136 announcement.
- Therefore the receipt witnesses (a) the URL is reachable, (b) the text still contains the
  quoted sentence and the CFT sentence, and (c) the normalized excerpt is reproducible. It
  does **not** witness that Chrome/Chromium `154.0.8037.97` (the host build named in
  `.ufo/waves/round-18/PLAN.md:3`) still refuses, or that CFT is still exempt.
- **Finite counterexample:** if Chrome 154 had changed the default-dir rule or removed the
  CFT exemption, this exact receipt would still be `held`; the page has no later revision
  that could drift. The receipt is a persistence/availability observation of a page whose
  own last-updated stamp is 2025-03-17, not a currency observation of Chrome 154.
- Does the **main claim** confuse the two? Textually, no. C1 is defined as a count of
  committed recheck receipts (PLAN C1; `corpus/lessons/round-18.md:12-13`), and the note says
  the receipts "say nothing about how any product behaves, and the 51 rows are not a
  statement of current live product support"
  (`corpus/knowledge/source-recheck-round-18.md:141`). The residual is the axis label and
  the score movement: the metric is **source re-open / availability**, not **product
  currency**. If the freshness score is read as product freshness, S001's receipt cannot
  support that reading; if it is read in the round-12 "source-only freshness" sense
  (`SKILL.md` round-12 block), it is consistent. This is a scope boundary, not a receipt
  defect.

## Counter boundary observed (not scored against S001)

`measure-c1.mjs` accepts an HTTP receipt on `httpStatus 200`, canonical curl command,
excerpt-sha, and quote-in-excerpt (`:315-378`); `--live` re-checks quote presence only
(`:380-436`). `bytes`, `sha256`, `quoteOffset` and `anchorObserved` are not counter-verified.
My re-fetch verified all four for S001. Counter output at REV
(`node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004`,
exit 0) includes S001 among `c1_rows_rechecked:51`, `held:50`, `own_work:1`, `rejected:[]`
(`eligible_rows:58` is the S058–S064 denominator question already reported by ReRunC1, not
this item).

Adjacent receipt, outside this item: `S028.json:13` quotes "Prefers a free port over
switching from IPv4 to IPv6." — the port-fallback comment — while its row scope is
enforcement/branding/OS gating; `S028.json:22` itself says "Quote is the :113-114
port-fallback comment." The excerpt's quoted sentence is that port-fallback comment, and the
excerpt contains no `GOOGLE_CHROME_BRANDING` (`grep` over `S028.excerpt.txt`). The C1 counter accepts it because
quote-in-excerpt passes. This does not affect S001, whose quote is on-scope; flag for the
S028 seat, since S001's brand qualifier depends on S028's code reading.

## S029 own-work cross-check (secondary, per ticket note)

`git show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json`
→ 97073 bytes, `sha256 b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7`,
both equal to `S029.json:9-10`. With the producer normalizer the receipt quote is found once
at offset 74695 (equals `S029.json:17`), and the recomputed excerpt sha
`80b5de21689b1ab7c951d245465502b40747c25d77e5f5c652c143629c3796ff` equals `S029.json:19`
and the committed `S029.excerpt.txt`. No network used.

## Limits

- No browser launched, no WebMCP tool invoked, no Chromium 154 run; this is a source-content
  re-open only. No tag-154 Chromium source was read here.
- Raw-body equality was deliberately not required on this dynamic page; content identity is
  established by the exact normalized excerpt digest and quote offset, not the raw digest.
- Quote was present on the first fetch; no alternative rendering/raw endpoint was needed.
  Evidence was not replaced.
- No tools installed or updated. No production, fleet, sibling, Git index or jj state was
  written; scratch `/tmp/tabi-r18-lives001-1VcBpj` and `/tmp/tabi-r18-lives029-w1bqiK` were
  private fetches, removed after recording the digests above.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS001.md
