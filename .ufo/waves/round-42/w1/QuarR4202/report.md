# QuarR4202 — quarantine re-adjudication S109, S110 (tabi, round 42)

Axes: quote-location fidelity, source identity (staged URL vs another registered URL), verdict-enum precision, write scope limited to this seat. Both staged URLs were fetched in one shot and cross-searched. No tool was installed (pacman is paused; curl and sha256sum were already on the host).

Register (read-only): `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`. Lane cell `tabi`, round cell `round1`.

| id | line | registered URL | staged quotes |
|---|---|---|---|
| S109 | 180 | `https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md` | `429 Too Many Requests` ; `too many requests in a given amount of time` |
| S110 | 181 | `https://www.rfc-editor.org/rfc/rfc6585.txt` | `Add hints to your tools` ; `Expose your tools carefully` ; `Last updated 2026-09-01 UTC` |

Full register lines (317 and 282 bytes) match those cells; the note cell on both is the boilerplate "cited source, companion URLs and local artifacts were all checked; the quote is in none of them".

## Fetch

Scratch `/fast/scratch/hyaku/tabi-r42/QuarR4202` (deleted after the receipts were copied here). Command, both URLs:

```
curl -sSL --max-redirs 10 --max-time 60 -D <id>.headers -o <id>.body -w 'name=... http_code=%{http_code} url_effective=%{url_effective} size_download=%{size_download} num_redirects=%{num_redirects} content_type=%{content_type}' <url>
```

Observed:

```
name=S109
http_code=200
url_effective=https://raw.githubusercontent.com/ChromeDevTools/chrome-devtools-mcp/main/docs/tool-reference.md
size_download=44412
num_redirects=0
content_type=text/plain; charset=utf-8
date: Wed, 28 Oct 2026 15:36:53 GMT
sha256 15b55a29287f64b69e131c11dac404c2bf20cdcc90d265d7db37debc557a8491

name=S110
http_code=200
url_effective=https://www.rfc-editor.org/rfc/rfc6585.txt
size_download=17164
num_redirects=0
content_type=text/plain;charset=utf-8
date: Wed, 28 Oct 2026 15:36:55 GMT
link: <https://www.rfc-editor.org/info/rfc6585/>; rel="canonical"
sha256 f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58
```

Seat copies: `fetch/S109.body`, `fetch/S110.body`, plus headers, curlmeta, and sha256. `sha256sum` on the seat copies matches the scratch hashes. `cmp` matched before scratch deletion.

## S109 — misbound

Registered body is the auto-generated Chrome DevTools MCP tool reference. Neither staged phrase is present exact, whitespace-normalized, or case-folded. Tokens `429`, `Too Many`, `too many`, `given amount`, `rate limit`, `Retry-After` are absent. "request" hits are `get_network_request` / `list_network_requests`, not status 429.

The same two phrases are in the other body fetched for this seat, RFC 6585, which the register cites as tabi round1 S110:

- `429 Too Many Requests` exact at lines 69 (contents), 134 (section heading), 145 (`HTTP/1.1 429 Too Many Requests`), and 299 (`7.2.  429 Too Many Requests`).
- `too many requests in a given amount of time` is not contiguous: lines 136-137 fold the sentence. Whitespace-normalized once:

```
The 429 status code indicates that the user has sent too many
   requests in a given amount of time ("rate limiting").
```

Normalized sentence: `The 429 status code indicates that the user has sent too many requests in a given amount of time ("rate limiting").`

That is the wrong registered source, not a 404 and not a partial residue on the tool-reference. Evidence: `evidence-S109.txt`. Builder line in that file: `verdict: misbound`.

Delta vs r40 "absent as staged": no live-source change observed. The tool-reference still lacks both phrases. RFC 6585 section 4 is the April 2012 text; these phrases were not added today. r40's label is still true of the staged URL alone. This check adds the cross-source location and therefore uses misbound.

## S110 — absent

RFC 6585 opened (200, 17164 bytes, no redirect). All three staged phrases are absent exact, whitespace-normalized, and case-folded. Not partial: `Add hints`, `Expose your`, `tools carefully`, `Last updated`, and `2026-09-01` do not occur. Two nearby words are different sentences: line 44 IETF "review these documents carefully"; line 351 "The HTTP Status Codes registry has been updated". The same three phrases are also absent from the tool-reference body.

The staged URL did not 404, so no corrected-location fetch was made. Phrase 1 is also the first quote cell of tabi S111 (`https://developer.chrome.com/docs/ai/webmcp/secure-tools`), which the register itself marks payload-absent; that URL was not fetched and is not treated as this row's source. Misbound is not claimed. Evidence: `evidence-S110.txt`. Builder line: `verdict: absent`.

Delta vs r40 "absent as staged": unchanged. Today's RFC body still does not contain the three phrases.

## Limits

- Only the two assigned URLs were fetched. Companion URLs in the register note were not re-fetched.
- Quote 2 of S109 is a whitespace-normalized match across an RFC hard wrap, not a single physical line.
- No r40 body hashes were in this seat's inputs, so "no live change" means the fetched bytes today do not contain a new occurrence (S110) and still match the long-stable RFC 6585 section 4 wording (S109), not a byte-diff against an r40 capture.

VERDICT finding — S109 misbound (both phrases in registered RFC 6585, absent from the staged tool-reference); S110 absent (RFC 6585 opens, none of the three phrases present).
