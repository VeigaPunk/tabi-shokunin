# QuarR4202 — S109 and S110 re-adjudication

Lane `tabi`, round1, register `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` lines 180-181. Fetched 2026-10-28 with `curl -sSL` (no redirects taken; both HTTP 200). No tools installed. Receipts and the long write-up: `.ufo/waves/round-42/w1/QuarR4202/`.

## S109 — misbound

- Registered URL = final URL: `https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md`
- HTTP 200, 44412 bytes, sha256 `15b55a29287f64b69e131c11dac404c2bf20cdcc90d265d7db37debc557a8491`, `Date: Wed, 28 Oct 2026 15:36:53 GMT`, 0 redirects.
- Staged quotes: `429 Too Many Requests` and `too many requests in a given amount of time`.
- Neither quote is in that body (exact, whitespace-normalized, or case-folded). No `429` token at all.
- Both quotes are in the other assigned fetch, tabi S110's RFC 6585 (`https://www.rfc-editor.org/rfc/rfc6585.txt`, sha256 `f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58`). `429 Too Many Requests` is exact at lines 69, 134, 145, and 299. The second phrase is whitespace-normalized across lines 136-137: "The 429 status code indicates that the user has sent too many / requests in a given amount of time (\"rate limiting\")."
- Evidence: `.ufo/waves/round-42/w1/QuarR4202/evidence-S109.txt` (`verdict: misbound`).
- Versus r40 "absent as staged": the staged page still lacks the quotes; nothing new appeared there today. The RFC 6585 wording is the April 2012 section 4 text, not a page edited today. The label changes because the quotes were located in a different registered source.

## S110 — absent

- Registered URL = final URL: `https://www.rfc-editor.org/rfc/rfc6585.txt`
- HTTP 200, 17164 bytes, sha256 `f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58`, `Date: Wed, 28 Oct 2026 15:36:55 GMT`, 0 redirects. Canonical link: `https://www.rfc-editor.org/info/rfc6585/`.
- Staged quotes: `Add hints to your tools`, `Expose your tools carefully`, `Last updated 2026-09-01 UTC`.
- None of the three is in the RFC body or in the tool-reference body (exact, whitespace-normalized, or case-folded). `carefully` at line 44 and `updated` at line 351 are IETF boilerplate / IANA text, not the staged sentences.
- Staged URL did not 404, so no substitute URL was fetched. S111's register row repeats the first phrase against a Chrome docs URL and already marks it payload-absent; that URL was not opened.
- Evidence: `.ufo/waves/round-42/w1/QuarR4202/evidence-S110.txt` (`verdict: absent`).
- Versus r40 "absent as staged": unchanged. The live RFC still does not contain the three phrases.

VERDICT finding — S109 misbound (quotes live in registered RFC 6585, not the staged tool-reference); S110 absent (RFC 6585 opens, none of the three staged phrases present).
