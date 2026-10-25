# Round-27 Wave-4 quarantine audit — QuarantineA

- Auditor: `TabiR27.QuarantineA`
- Date of fetches: 2026-10-25
- Scope: rows S102, S106, S109, S110, S111, S114, S117, S118, S124, S125 (`payload-absent`) from
  `assimilation/quarantine-slice`, resolved against fleet register
  `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` (read-only),
  rows at register lines 178–187 (lane `tabi`). Prior round-22 verdicts and register summary fields
  were NOT trusted; every row was re-opened and re-fetched.
- Method: one documented public GET (`curl -L`) per row, exactly the cited URL (no companion URLs).
  Each body saved to lane scratch
  `.ufo/waves/round-27/scratch/QuarantineA/<S-ID>.body` with HTTP status, bytes, SHA256 recorded below.
  Quote search ran four folds per body: raw, HTML-entity-unescaped, tag-stripped, and
  whitespace-normalized (catches RFC/PDF line wrapping). PDF row additionally text-extracted with
  poppler `pdftotext` (preinstalled; no tools installed, no pacman, no git/jj writes, no edits).

## Row verdicts

### S102 — absent/refuse
- Locator (cited source): `https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/public/devtools_protocol/README.md`
- Fetch: HTTP 200, 25,431 B, text/html, sha256 `1fc2920065a20255a52261e291419f95fecd29491287cb3de24fdce0293233de`
- Quote checked: `Last updated 2026-10-05 UTC`
- Reason: the gitiles HTML view does render the README ("Chrome DevTools Protocol contribution
  guidelines", full headings/body present in payload), but "Last updated" appears 0 times and no
  `2026-`-date token appears anywhere in the body. The quoted footer does not exist in the cited page.

### S106 — absent/refuse
- Locator (cited source): `https://www.rfc-editor.org/rfc/rfc9309.txt`
- Fetch: HTTP 200, 25,265 B, text/plain, sha256 `f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207`
- Quotes checked: `使用 WebMCP 時，請注意下列事項` ; `確認 WebMCP 工具曝光度`
- Reason: payload is the genuine Robots Exclusion Protocol RFC (September 2022, 44 "Robots" hits);
  it is pure-ASCII protocol text. Neither Chinese WebMCP sentence is present. Quotes belong to some
  WebMCP document, not to RFC 9309.

### S109 — absent/refuse
- Locator (cited source): `https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md`
- Fetch: HTTP 200, 44,412 B, text/plain, sha256 `15b55a29287f64b69e131c11dac404c2bf20cdcc90d265d7db37debc557a8491`
- Quotes checked: `429 Too Many Requests` ; `too many requests in a given amount of time`
- Reason: current `main` file is the auto-generated "Chrome DevTools MCP Tool Reference". Zero hits
  for `429`, `Too Many`, `rate limit`, `quota`; the 4 "throttl" hits are CPU/network throttling tool
  parameters. Neither quote is present. (Branch `main` is mutable; this is the state fetched 2026-10-25.)

### S110 — absent/refuse
- Locator (cited source): `https://www.rfc-editor.org/rfc/rfc6585.txt`
- Fetch: HTTP 200, 17,164 B, text/plain, sha256 `f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58`
- Quotes checked: `Add hints to your tools` ; `Expose your tools carefully` ; `Last updated 2026-09-01 UTC`
- Reason: payload is RFC 6585 "Additional HTTP Status Codes", April 2012 (title confirmed 10×).
  None of the three quoted spans appears; they are WebMCP-document phrases plus a date stamp foreign
  to a 2012 RFC.

### S111 — absent/refuse
- Locator (cited source): `https://developer.chrome.com/docs/ai/webmcp/secure-tools`
- Fetch: HTTP 200, 140,264 B, text/html, sha256 `1a98307342f2e17810beb79f5bb64c83ca885bc7ec489c4d71b342cf81876ab8`
- Quotes checked: `Add hints to your tools` ; `默认情况下，其他网站或跨源 iframe 无法观察或与您的工具互动。`
- Reason: served page (canonical English, `hreflang="en"`) contains a near-collision heading
  "Use annotation hints" but not "Add hints to your tools" (0 hits), and no Chinese sentence
  (0 hits for the recorded span). Quotes do not match the cited URL as fetched.

### S114 — present/admit (quote needs one-word correction)
- Locator (cited source): `https://www.juse.jp/sqip/symposium/2025/timetable/files/B1-2_ronbun.pdf`
- Fetch: HTTP 200, 787,690 B, application/pdf, sha256 `9c2bdd5f015355478a637c0d6155f49ff8a49d96842ed03abcdea55877e67b55`
- Quote checked: `achieves better web element identification accuracy compared to naive set-of-marks prompting technique`
- Reason: text extraction (poppler pdftotext) of the PDF contains the span verbatim EXCEPT one token:
  the source reads `...achieves better web element identification accuracy compared to naive set-of mark
  prompting technique.` — i.e. "set-of mark" where the register records "set-of-marks". Every other
  word matches exactly, in order. The citation is genuine; this is a transcription slip in the recorded
  quote, not a fabrication. Admit the row after correcting the recorded quote to the source wording.
  (This token difference is exactly why the register's eleven-fold checker failed to match.)

### S117 — absent/refuse
- Locator (cited source): `https://webmachinelearning.github.io/webmcp/`
- Fetch: HTTP 200, 511,987 B, text/html, sha256 `5627596668946732cffb354d265d01f20ebba7d436a46a646e0768751d63ca40`
- Quote checked: `User awareness`
- Reason: payload is the full WebMCP CG-DRAFT explainer (320 "WebMCP" hits, full body rendered
  server-side). The token "awareness" appears 0 times in raw, unescaped, tag-stripped, and
  normalized folds. The quoted section heading is not in the current cited page.

### S118 — absent/refuse
- Locator (cited source): `https://arxiv.org/abs/2305.11506`
- Fetch: HTTP 200, 43,266 B, text/html, sha256 `2a18e1490de5ffda080e1c9698502f8b42b6892186ad2566f7b8fc8955a20e32`
- Quotes checked: `User awareness` ; `Chromium notifies users by rendering an infobar across all open browser tabs`
- Reason: the page is arXiv 2305.11506 "Chrowned by an Extension: Abusing the Chrome DevTools
  Protocol through the Debugger API". Full abstract inspected: no "infobar", no "notifies", no
  "User awareness" (0 hits each, tag-stripped). Both quoted spans are WebMCP-document text, absent
  from this paper's landing page.

### S124 — absent/refuse
- Locator (cited source): `https://www.rfc-editor.org/rfc/rfc9110.txt`
- Fetch: HTTP 200, 502,941 B, text/plain, sha256 `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`
- Quotes checked: `Retry-After can be used with a 3xx (Redirection) or 503 (Service Unavailable) status code` ;
  cell `enforcement), §8.8 (SameSite Cookies); draft-13 | Default enforcement is` (tested whole and both pipe-halves)
- Reason: RFC 9110 §10.2.3 actually reads: `Servers send the "Retry-After" header field to indicate
  how long the user agent ought to wait before making a follow-up request. When sent with a 503
  (Service Unavailable) response, ... When sent with any 3xx (Redirection) response, ...` — the
  recorded sentence is a paraphrase, not present. The SameSite/draft-13 cell is cookie-draft changelog
  material and appears nowhere in RFC 9110. Both absent.

### S125 — absent/refuse
- Locator (cited source): `https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt`
- Fetch: HTTP 200, 146,976 B, text/plain, sha256 `062239316659673b9373865352e8ec5cb710c3d5fe66eedceacfaa6d34d85fbf`
- Quotes checked: `Rate limits for the REST API` ; `About secondary rate limits`
- Reason: payload is the genuine cookie draft ("Cookies: HTTP State Management Mechanism",
  draft-ietf-httpbis-rfc6265bis-13, 15 November 2023; 914 "cookie" hits). Zero hits for
  `rate limit` in any fold. Both quoted spans are GitHub REST-API docs headings, absent here.

## Summary

| id | verdict |
|---|---|
| S102 | absent/refuse |
| S106 | absent/refuse |
| S109 | absent/refuse |
| S110 | absent/refuse |
| S111 | absent/refuse |
| S114 | present/admit (correct "set-of-marks" → "set-of mark") |
| S117 | absent/refuse |
| S118 | absent/refuse |
| S124 | absent/refuse |
| S125 | absent/refuse |

- 9/10 rows confirm the register's `payload-absent` classification: fetched cleanly (HTTP 200) and the
  recorded quotes are in none of them → refuse per §10.
- 1/10 (S114) is a mis-recorded quote over a genuinely present statement → admit after correction.
- No row was unreachable; the S171-style `unreachable/unverifiable` verdict did not arise in this slice.
- Residual risk: two locators are mutable-by-design (`main` branch raw file S109; `main`-branch gitiles
  view S102). Absence verdicts for them are anchored to the recorded SHA256/bytes of this fetch
  (2026-10-25); the quotes could have existed in earlier revisions, which does not change the
  cite-as-of-record mismatch.
- Installs: none. No pacman, no uv, no downloads beyond the ten documented GETs. Fetched payloads kept
  as throwaway fixtures in lane scratch `.ufo/waves/round-27/scratch/QuarantineA/`.
