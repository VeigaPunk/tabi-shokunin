# R57QuA — quarantine hand-check, part A (rows S102 … S125)

Wave-4 quarantine-first duty, round 57 w1. **ADOPT NOTHING** — this file and the
per-row JSON receipts are verdict receipts only. No register row was changed, no
sentence was adopted from any source, and nothing was written outside
`.ufo/waves/round-57/quarantine/R57QuarA/`.

## Scope

Slice: `.ufo/waves/round-57/assimilation/quarantine-slice` lines 1–10.

| # | S-id | slice class | register lane/round |
|---|---|---|---|
| 1 | S102 | `payload-absent` | tabi round1 |
| 2 | S106 | `payload-absent` | tabi round1 |
| 3 | S109 | `payload-absent` | tabi round1 |
| 4 | S110 | `payload-absent` | tabi round1 |
| 5 | S111 | `payload-absent` | tabi round1 |
| 6 | S114 | `payload-absent` | tabi round1 |
| 7 | S117 | `payload-absent` | tabi round1 |
| 8 | S118 | `payload-absent` | tabi round1 |
| 9 | S124 | `payload-absent` | tabi round2 |
| 10 | S125 | `payload-absent` | tabi round2 |

Register: `shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`
(read-only). Staged rows: `shokuknow/merge/tabi/SOURCES.append.md` (read-only).

## Method

**Fetch.** One GET per cited URL, no POST, no cookies, no credentials, one
throwaway user agent `r57-quarantine-handcheck/1.0`:

```
curl -sL --max-time 90 --max-filesize 25000000 -o <scratch>/<S-id>.bin \
     -w '%{http_code} %{size_download} %{content_type}\n' '<url>'
```

**Host guard (before every fetch).** Every URL is `https`; every host was
resolved and every address classified: `chromium.googlesource.com`
(142.250.0.82, 2800:3f0:4003:c01::52), `www.rfc-editor.org` (104.18.20.81/21.81,
2606:4700::6812:1451/1551), `raw.githubusercontent.com` + `*.github.io`
(185.199.108–111.13x, 2606:50c0::…), `developer.chrome.com`/`google.cn`
(142.250.219.46, 2800:3f0:4004:80c::200e), `www.juse.jp` (163.43.113.90),
`arxiv.org` (151.101.3/67/131/195.42), `www.ietf.org` (104.16.44/45.99),
`docs.github.com` (185.199.108–111.154), `github.com` (4.228.31.150). No address
is loopback, private, link-local, multicast, reserved or unspecified, so no
fetch was refused by the guard.

**Result of the fetch pass** (all clean 2xx, empty only for none):

| S-id | http | bytes | content-type | sha256 (first 16) |
|---|---|---|---|---|
| S102 | 200 | 25431 | text/html; charset=utf-8 | db76fca9498a8265 |
| S106 | 200 | 25265 | text/plain;charset=utf-8 | f633915daaa15b94 |
| S109 | 200 | 44642 | text/plain; charset=utf-8 | 096fe14979436ac1 |
| S110 | 200 | 17164 | text/plain;charset=utf-8 | f6d55d1b491cd515 |
| S111 | 200 | 140318 | text/html; charset=utf-8 | 2e2adb1e042dffad |
| S114 | 200 | 787690 | application/pdf | 9c2bdd5f01535547 |
| S117 | 200 | 548079 | text/html; charset=utf-8 | 7c4d59069b3c049a |
| S118 | 200 | 42107 | text/html; charset=utf-8 | 3336aca2460cefa9 |
| S124 | 200 | 502941 | text/plain;charset=utf-8 | 21c1cdce6ab0e550 |
| S125 | 200 | 146976 | text/plain;charset=utf-8 | 062239316659673b |

**Pairing cross-check (step 3).** Register URL vs the staged row's url/anchor
cell: identical strings for 9 of 10 rows. S109 differs in rendering only —
register cites `raw.githubusercontent.com/.../docs/tool-reference.md`, staged
cites `github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/tool-reference.md`
— so the staged URL was fetched as well (200, 594083 B, sha256 measured) and the
ladder was re-run on it. Companions the staged rows name were also fetched:
S111's zh-CN mirror (`developer.chrome.google.cn/...secure-tools?hl=zh-cn`, 200,
130744 B) and S118's paper PDF (`arxiv.org/pdf/2305.11506v1`, 200, 553958 B).
Three neighbour artifacts were fetched read-only **only to test where a
fragment actually lives**: S103's `chrome.debugger` page, S107's zh-TW page,
S126's GitHub rate-limits page (plus RFC 7231 as a candidate carrier for S124's
Retry-After sentence).

**Ladder (frozen folds, run per fragment against the cited artifact, its staged
variant and companions):**

| fold | transformation |
|---|---|
| f0 | exact substring in raw bytes (for a text-layer source: the extracted text's bytes) |
| f1 | case-insensitive |
| f2 | whitespace runs collapsed to single spaces |
| f3 | HTML entities decoded |
| f4 | HTML tags stripped, then f2 |
| f5 | f4 + case-insensitive |
| f6 | backtick/quote/punctuation stripped, then f2 |

Instrument: `laddr.py` in this directory (stdlib only, no network). Every
fragment carries its per-fold hit count **and** the re-runnable command for each
fold (`foldRecords` in each JSON).

**Quote-cell normalisation.** A cell like `` `429 Too Many Requests` `` is a
Markdown code span: the outer backticks are register formatting, so the ladder
runs on the cell content while `rawCell` keeps the cell byte-exact. One cell
(S124 fragment 1) is *not* balanced — its opening backtick has no closer, which
is itself evidence of the cell splice documented below.

**Extraction (PDF sources).** `pdftotext` (poppler, already installed) with
`-enc UTF-8 -layout` for S114; for S118's PDF the full-document `-layout`
extraction interleaves the two columns and splits the target sentence, so the
page-4 reading-order extraction (`pdftotext -enc UTF-8 -f 4 -l 4`) was used and
is named on the receipt. No guess was made from a failed extraction.

## Verdict table

| id | verdict | one-line reason |
|---|---|---|
| S102 | `absent-confirmed` | README carries the anchor headings but zero "Last updated"; the cell is S103's page-footer date (knowledge and the staged S103 row both say so) |
| S106 | `mispaired` | both Chinese fragments locate at f0 in S107's zh-TW page (lines 5631, 5652), none in RFC 9309 |
| S109 | `mispaired` | "429 Too Many Requests" (f0, RFC 6585 line 68) and "too many requests in a given amount of time" (f2) are S110's text, absent from tool-reference.md and its staged blob rendering |
| S110 | `mispaired` | 2 of 3 fragments locate at f0 in S111's secure-tools page (lines 4342, 4483); the third is S111's paraphrased section title; RFC 6585 carries none |
| S111 | `partial-located` | the Chinese sentence is byte-exact at f0 on the zh-CN mirror (line 3862); "Add hints to your tools" exists nowhere — the page's h2 is "Use annotation hints" |
| S114 | `absent-confirmed` | no fragment under f0–f6; the PDF says "naive set-of mark prompting technique" — the quote adds one `s` (edit distance 1), a transcription slip on present content |
| S117 | `mispaired` | "User awareness" locates at f0 in S118's PDF (line 257), not in the WebMCP CG draft, which does carry the anchored IDL surface |
| S118 | `quote-located` | all three fragments locate in the paper PDF (f0 for the section heading, f2 for the sentence, byte-exact with its line break); the register URL is only the abs landing page |
| S124 | `absent-confirmed` | neither fragment is in RFC 9110; fragment 0 is a paraphrase of §10.2.3 (same semantics, other words; also absent from RFC 7231), fragment 1 is the tail of S125's anchor cell with an unbalanced backtick |
| S125 | `mispaired` | both fragments locate at f0 (10 and 5 hits) in S126's GitHub rate-limits page, none in draft-6265bis-13, which does carry the anchored §5.5.7 |

Tally: 5 `mispaired`, 3 `absent-confirmed`, 1 `partial-located`, 1
`quote-located`. Zero `unreachable`, zero `extraction-unavailable`.

Verdict semantics used here (fixed before reading the receipts, stated in
`gen_receipts.py`): a verdict describes the artifact the row cites — the
register URL first, then the staged URL when it is a different string, then the
companions the staged row names for the same id. Where fragments locate only at
a *different* row's cited artifact, the row is `mispaired` and the carrier is
named; `absent-confirmed` is reserved for "locates nowhere under the whole
ladder".

## Finding 1 — the register's quote column is spliced, not the rows invented

7 of the 10 rows do not own their quote cell. The mapping is exact, and each
foreign fragment was **located** in the neighbour's artifact, not merely
attributed:

| row | its quote cell is | evidence |
|---|---|---|
| S102 | S103's page footer | staged S103 row names "page footer \"Last updated 2026-10-05 UTC\""; knowledge `extension-cdp-transport-contract.md` line 4 pins the same string to S103 |
| S106 | S107's anchor text | located f0 at the S107 zh-TW page (lines 5631, 5652); knowledge `webmcp-agent-side-consumption.md` line 4 names S107 |
| S109 | S110's §4 quote | located f0 (4 hits, §4 heading line 68) and f2 in RFC 6585; staged S110 anchor is §4 "429 Too Many Requests" |
| S110 | S111's anchor text | all three strings are S111's staged anchor verbatim ("Add hints to your tools", "Expose your tools carefully", footer "Last updated 2026-09-01 UTC"); two locate f0 in that page |
| S117 | S118's §2.3 heading | located f0 in S118's PDF (line 257); staged S118 anchor is §2.3 "User awareness" |
| S124 | own paraphrase + S125's anchor tail | fragment 1 is `enforcement), §8.8 (SameSite Cookies); draft-13` — the tail of S125's staged anchor, with an unbalanced opening backtick; the same contamination appears in round 25's slice line 9 |
| S125 | S126's anchor text | both strings are S126's staged anchor; located f0 at the S126 page (10 and 5 hits) |

The three rows that own their cell are S111 (own page, but with a paraphrased
section title), S114 (own content, one added letter), and S118 (verbatim, with
the artifact pairing loose).

Consequence for the campaign: on this slice, `payload-absent` does **not**
denote fabrication. The quoted text exists at the S-id the *staged* row and the
*knowledge* note attribute it to; only the register's quote column carries it
against the wrong id. The right repair is re-alignment of the quote column, not
refusal of the rows — and still nothing is adopted this round.

## Finding 2 — the genuinely unlocatable strings (3)

1. **S111 fragment 0, "Add hints to your tools"** — absent from the canonical
   page (f0–f6), absent from the mirror, absent from S103's page. The page's
   heading is `<h2 id="use_annotation_hints" data-text="Use annotation hints">`.
   The label is a paraphrase that already sits in S111's staged anchor and in
   knowledge `webmcp-tool-approval-hints.md` line 4, so the staging pipeline
   propagated a section name the source never uses. Content is present; the
   label is not.
2. **S114 fragment 0** — the PDF abstract reads "achieves better web element
   identification accuracy compared to naive set-of mark prompting technique";
   the quote inserts an `s` ("set-of-marks"). Edit distance 1 on otherwise
   present content; the same spelling drift is in knowledge
   `web-agent-element-identification.md` lines 16–17.
3. **S124 fragment 0, "Retry-After can be used with a 3xx (Redirection) or 503
   (Service Unavailable) status code"** — not in RFC 9110, not in RFC 7231
   (both fetched, f0–f6 = 0). RFC 9110 §10.2.3 says instead: "When sent with a
   503 (Service Unavailable) response, Retry-After indicates how long the
   service is expected to be unavailable to the client. When sent with any 3xx
   (Redirection) response, Retry-After indicates the minimum time that the user
   agent is asked to wait before issuing the redirected request." Round 27's
   `w1/ScoutStagedGround.md` §4.4 proved the same absence; it is still quoted in
   knowledge `redirect-and-retry-after-semantics.md` lines 20–21 as if it were
   source text. This is the one self-propagating non-quote in my slice.

## Finding 3 — does the quote text appear under `merge/tabi/knowledge/`?

Yes, for nearly all of it. Scan: every register fragment (19 fragments over 10
rows) against every `*.md` under `shokuknow/merge/tabi/knowledge/` (86 files)
under f0 and f6. **14 of 19 are exact substrings (f0); 16 of 19 under f0-or-f6.**
The three that appear nowhere:

| fragment | in knowledge? |
|---|---|
| S111 fragment 1 — `默认情况下，其他网站或跨源 iframe 无法观察或与您的工具互动。` | **no** — the mirror sentence never entered the knowledge tree |
| S114 fragment 0 — full "achieves better … set-of-marks prompting technique" | **no** as a sentence; only the token "set-of-marks prompting" appears (`web-agent-element-identification.md` lines 16–17), with the same one-letter drift |
| S124 fragment 1 — `` `enforcement), §8.8 (SameSite Cookies); draft-13 `` | **no** as text; its pieces are the S125 source header in `cookie-samesite-semantics.md` line 3 — i.e. it is an anchor cell, not a quote |

The 16 fragments that do appear are each filed under the **correct** S-id in the
knowledge note's `source:` header (S103 footer → `extension-cdp-transport-contract.md`;
S107's two Chinese sections → `webmcp-agent-side-consumption.md` and
`webmcp-devtools-agent-surface-r25.md`; S110's 429 → `rate-and-tos-signal-vocabulary.md`,
`rate-limit-header-to-status-r18.md`, `webmcp-429-counters-and-residency-friction-r26.md`;
S111's labels → `webmcp-tool-approval-hints.md`; S118's heading and sentence →
`debugger-infobar-approval-surface.md`; S126's sections →
`host-rate-limit-signal-surface.md`). So knowledge attributes correctly where
the register does not — which is the strongest evidence that the register's
quote column, not the staging pipeline, is broken. The one place knowledge
inherits a defect is the two non-source strings it quotes: the S111 section
label and S124's Retry-After sentence.

## Receipts in this directory

| file | content |
|---|---|
| `S102.json` … `S125.json` (10) | per-row receipt: urls, http/bytes/content-type/sha256, every fragment with fold, hits, where, byte-exact source span (when located), per-fold commands, siblings where the text really lives, anchor probes, verdict, reason |
| `laddr.py` | the fold-ladder instrument (stdlib only) |
| `gen_receipts.py` | the generator that produced the ten JSONs from the fetched bytes |
| `fetch.sh` | the fetch pass, verbatim (paths under `$SCRATCH`) |
| `http-meta.json`, `guard.json`, `register-rows.json`, `staged-rows.json`, `knowledge-scan.json`, `crossmatrix.json` | fetch metadata, host-guard resolution, the two register extractions, the knowledge scan, the cross-artifact matrix |
| `R57QuA-summary.md` | this file |

Reproduction: each JSON carries a `refetch` line with the URL and the expected
sha256, and a `foldRecords` table with the exact `laddr.py` command per fold.
Fetched bytes were kept in scratch during the run and deleted on exit; digests
make the bytes checkable on re-fetch.

## Not adopted

Nothing. The register row classes were not edited, no knowledge note was
touched, no quote was corrected in place, and no source sentence was admitted to
the lane's knowledge. Handing off: re-align the register's quote column for the
tabi slice (Finding 1), correct three quotes (Finding 2), and treat
`merge/tabi/knowledge` as authoritative for attribution until the register
generator is fixed.
