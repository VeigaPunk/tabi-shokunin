# QuarR4204 — quarantine re-adjudication S117, S118

Seat: QuarR4204. Lane: tabi, round1. Access date: 2026-10-28 (response Date headers 15:36:55Z–15:37:28Z). Register (read-only): `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` lines 184–185. No tools installed. Scratch `/fast/scratch/hyaku/tabi-r42/QuarR4204/` deleted after these receipts were written. No git mutation. shokuknow was not written.

r40 dispositions were not copied. They are the delta baseline only: S117 absent as staged; S118 present in arXiv PDF §2.3. Live bytes of both registered URLs, and of the PDF, match that round's recorded hashes, so neither verdict below is a source change.

## S117

Register row (line 184), cells as registered: lane `tabi`, round `round1`, id `S117`, class `payload-absent`, cited source `https://webmachinelearning.github.io/webmcp/` (no fragment anchor), quote `` `User awareness` ``, note that the cited source, companion URLs, and local artifacts were checked and the quote was in none of them.

Command (scratch):

```
curl -sSL -D s117.headers -o s117.body -w 'http_code:%{http_code}\nurl_effective:%{url_effective}\nsize_download:%{size_download}\ncontent_type:%{content_type}\nnum_redirects:%{num_redirects}\n' --max-redirs 10 -A 'QuarR4204-readonly/1.0 (research; +local)' 'https://webmachinelearning.github.io/webmcp/'
sha256sum s117.body && wc -c s117.body
```

Observed: `http_code:200`, `url_effective:https://webmachinelearning.github.io/webmcp/`, `size_download:536093`, `content_type:text/html; charset=utf-8`, `num_redirects:0`. Headers: `HTTP/2 200`, `last-modified: Tue, 27 Oct 2026 11:43:25 GMT`, `content-length: 536093`, `date: Wed, 28 Oct 2026 15:36:55 GMT`. sha256 `2d773eb9f0cd0579f1e7ef5b2ebd96c16d2d754baf38117c1051e4435a49a845`. `<meta content="6838130ef3e930c8e1a9f98375c13d9133d61aba" name="revision">`. Tag-stripped date: "Draft Community Group Report, 27 October 2026".

Search (raw, case-insensitive, whitespace-normalized, and tag-stripped 92291 chars): `User awareness` 0, `awareness` 0, `infobar` 0. The quote is not in the opened source.

It is the §2.3 run-in of the other registered row, S118. From today's pdftotext of that paper, whitespace-collapsed: "User awareness. When a debugging extension successfully attaches to a target, Chromium notifies users by rendering an infobar across all open browser tabs [74] as shown in Figure 2."

Verdict: **misbound**.

Delta vs r40: no live-source change. Same sha256 and 536093 bytes as the r40 fetch (Last-Modified still Tue, 27 Oct 2026 11:43:25 GMT). The phrase is still absent from this URL. r40 summarized that as "absent as staged" and already named the mis-bind. This round's enum label is misbound because the quote belongs to registered source S118, which was re-checked today, not because the WebMCP page changed.

## S118

Register row (line 185): lane `tabi`, round `round1`, id `S118`, class `payload-absent`, cited source `https://arxiv.org/abs/2305.11506` (no fragment), quotes `` `User awareness` ``, `` `Chromium notifies users by rendering an infobar across all open browser tabs` ``, `` `User awareness` ``.

Command A (registered URL):

```
curl -sSL -D s118.headers -o s118.body -w 'http_code:%{http_code}\nurl_effective:%{url_effective}\nsize_download:%{size_download}\ncontent_type:%{content_type}\nnum_redirects:%{num_redirects}\n' --max-redirs 10 -A 'QuarR4204-readonly/1.0 (research; +local)' 'https://arxiv.org/abs/2305.11506'
sha256sum s118.body && wc -c s118.body
```

Observed: `http_code:200`, `url_effective:https://arxiv.org/abs/2305.11506`, `size_download:43266`, `content_type:text/html; charset=utf-8`, `num_redirects:0`. `last-modified: Mon, 24 Aug 2026 21:28:44 GMT`, `date: Wed, 28 Oct 2026 15:37:07 GMT`. sha256 `2a18e1490de5ffda080e1c9698502f8b42b6892186ad2566f7b8fc8955a20e32`. Title: "Chrowned by an Extension: Abusing the Chrome DevTools Protocol through the Debugger API". Both quote strings: 0 exact and 0 whitespace-normalized hits. `awareness` 0, `infobar` 0, `notifies` 0. HTML links the full text at `/pdf/2305.11506`.

The abs URL did not 404. The PDF below is the full text of the same id, fetched to place the quote, not substituted as the registered URL.

Command B:

```
curl -sSL -D s118pdf.headers -o s118.pdf -w 'http_code:%{http_code}\nurl_effective:%{url_effective}\nsize_download:%{size_download}\ncontent_type:%{content_type}\nnum_redirects:%{num_redirects}\n' --max-redirs 10 -A 'QuarR4204-readonly/1.0 (research; +local)' 'https://arxiv.org/pdf/2305.11506'
sha256sum s118.pdf && pdfinfo s118.pdf && pdftotext s118.pdf s118-plain.txt
```

Observed: `http_code:200`, `url_effective:https://arxiv.org/pdf/2305.11506`, `size_download:563856`, `content_type:application/pdf`, `num_redirects:0`. `last-modified: Sat, 03 Jun 2023 00:05:59 GMT`, `content-disposition: inline; filename="2305.11506v2.pdf"`, canonical `https://arxiv.org/pdf/2305.11506`, `date: Wed, 28 Oct 2026 15:37:28 GMT`. sha256 `e8131e4ec1e694c3c3d168553bd05688f663b76e244fd94416a972ee9739d469`. pdfinfo: Pages 15, CreationDate Wed May 31 22:33:31 2023 -03, PDF 1.5. `file(1)` said "3 page(s)"; that undercount was not used. pdftotext reading-order extract: 83451 bytes.

Located in §2.3 "The Debugger extension API" (the run-in sits after that heading and before "3. Threat model"). Collapsing pdftotext newlines to spaces gives one exact hit of the infobar sentence. Surrounding text:

> User awareness. When a debugging extension successfully attaches to a target, Chromium notifies users by rendering an infobar across all open browser tabs [74] as shown in Figure 2.8 This notification will not go away until there are no attached debuggers left.

The newline that defeats a raw search is between "by" and "rendering". Collapsed case-sensitive counts: "User awareness" 1 (this run-in), "User Awareness" 1 ("SR01 – User Awareness"), "user awareness" 2. The register's second `User awareness` is the same run-in listed again, not a third sentence.

Verdict: **present**.

Delta vs r40: no live-source change. Abs HTML sha256 and 43266 bytes match r40 (and the round-27 fetch). PDF sha256, 563856 bytes, and v2 Last-Modified Sat, 03 Jun 2023 00:05:59 GMT match r40's full-text fetch. Independent extract still places both distinct quotes in §2.3. r40's "present in arXiv PDF §2.3" stands. The register's payload-absent note is true only of the abs HTML.

## Limitations

One fetch each. The WebMCP draft is mutable; this body is the 27 October 2026 revision above, byte-identical to r40. The arXiv abs page has no paper body, so a checker that refuses the PDF will still report S118 absent; that was not treated as the paper. `file(1)` miscounted PDF pages. Other lanes' S117/S118 rows were not adjudicated.

Evidence: `.ufo/waves/round-42/w1/QuarR4204/evidence-S117.txt`, `.ufo/waves/round-42/w1/QuarR4204/evidence-S118.txt`.

VERDICT finding S117 misbound (quote absent from the cited WebMCP page, byte-identical to r40; the phrase is S118 §2.3); S118 present in arXiv 2305.11506 PDF §2.3 (abs HTML still lacks it; PDF bytes unchanged vs r40)
