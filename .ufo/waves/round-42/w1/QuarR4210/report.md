# QuarR4210 — quarantine re-adjudication S140, S142

Lane `tabi` only. Same-id rows in other lanes (kake S142, kumitate S142, tameshi S140) were not adjudicated. Register is read-only. No production, fleet, or shokuknow writes. No tool installs (pacman is paused; curl, python3, and sha256sum were already present). Scratch `/fast/scratch/hyaku/tabi-r42/QuarR4210` held the response bodies and was removed after these receipts were written.

## Commands

```
mkdir -p /fast/scratch/hyaku/tabi-r42/QuarR4210
cd /fast/scratch/hyaku/tabi-r42/QuarR4210
curl -sSL -D s140.headers -o s140.body -w "s140_http=%{http_code} s140_url=%{url_effective} s140_size=%{size_download} s140_redir=%{num_redirects}\n" "https://docs.copilotkit.ai/webmcp"
curl -sSL -D s142.headers -o s142.body -w "s142_http=%{http_code} s142_url=%{url_effective} s142_size=%{size_download} s142_redir=%{num_redirects}\n" "https://www.rfc-editor.org/rfc/rfc9110.txt"
sha256sum s140.body s142.body
wc -c s140.body s142.body
```

Observed:

```
s140_http=200 s140_url=https://docs.copilotkit.ai/webmcp s140_size=228099 s140_redir=0
s142_http=200 s142_url=https://www.rfc-editor.org/rfc/rfc9110.txt s142_size=502941 s142_redir=0
cabff648920202c1237a21835d20b019d94babbdb1ca6734f77fa70bc6c13b6b  s140.body
21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a  s142.body
228099 s140.body
502941 s142.body
```

S140 response: HTTP/2 200, content-type text/html; charset=utf-8, date Wed, 28 Oct 2026 15:36:46 GMT, server railway-hikari, x-powered-by Next.js. S142 response: HTTP/2 200, content-type text/plain;charset=utf-8, date Wed, 28 Oct 2026 15:36:48 GMT, link rel=canonical to https://www.rfc-editor.org/info/rfc9110/.

## S140 — present

Register line 196: lane tabi, round2, class payload-absent, URL https://docs.copilotkit.ai/webmcp. Staged quote (census quote field): The `tools` permissions policy defaults to `self` ; cross-origin iframes also need `allow="tools"` .

The page contains that sentence at HTML line 99, under "Test the complete path", and again in the RSC payload:

The <code>tools</code> permissions policy defaults to <code>self</code>; cross-origin iframes also need <code>allow=&quot;tools&quot;</code>.

Decoded, with code spans turned back into backticks: The `tools` permissions policy defaults to `self`; cross-origin iframes also need `allow="tools"`.

The staged string is not a raw substring. Collapsing whitespace runs does not make them equal, because the staged quote has a space before the semicolon and a space before the final period, and the page does not. Deleting all whitespace makes them equal. Those two spaces are the only deltas; every word and punctuation mark is present in order. That is present, not partial: the spaces are tag-boundary artifacts of how the quote was lifted, not missing or extra tokens.

Round-40 (2026-10-27) fetched the same URL at 227008 bytes and called the same line-99 sentence present. Today's body is 228099 bytes, sha256 cabff648920202c1237a21835d20b019d94babbdb1ca6734f77fa70bc6c13b6b, so the document changed, but the located sentence did not. Verdict versus r40: unchanged, present.

## S142 — absent

Register line 197: lane tabi, round3, class payload-absent, URL https://www.rfc-editor.org/rfc/rfc9110.txt, quote `which tool list do I see`. No anchor cell.

The body is RFC 9110 HTTP Semantics (June 2022, STD 97), 10786 lines, UTF-8 BOM, 502941 bytes, sha256 21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a. Exact, case-insensitive, and whitespace-deleted searches for the quote are all zero. "tool list", "which tool", and "do I see" are also zero. The only "tool" occurrences are "command-line tools", "authoring tools", and "monitoring tools". Not partial.

Not misbound. The census line for this row is the lane's S143 source-table rationale ("the other half of which tool list do I see"), which is lane prose in lanes/tabi/round3/SOURCES-PROPOSED.md and KNOWLEDGE-PROPOSED.md, not text from another cited URL. The registered URL opened, so there was no 404 to chase to a corrected location.

The sha256 is identical to the round-27 fetch (2026-10-25) and the round-40 fetch (2026-10-27). Nothing on the live source changed. Verdict versus r40: unchanged, absent.

## Evidence

- .ufo/waves/round-42/w1/QuarR4210/evidence-S140.txt
- .ufo/waves/round-42/w1/QuarR4210/evidence-S142.txt

## Limitations

Single fetch of each registered URL on 2026-10-28. S140 is an unversioned Next.js document; the sentence was checked in the HTML and the RSC payload, not in a browser render. Companion URLs were not fetched. The RFC comparison is against the full canonical text body.

VERDICT finding S140 present (payload-absent does not hold; sentence unchanged vs r40 despite a larger page); S142 absent (payload-absent holds; RFC sha256 unchanged vs r40)
