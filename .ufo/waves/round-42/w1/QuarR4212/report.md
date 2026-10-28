# QuarR4212 — quarantine re-adjudication S145, S147

Lane `tabi`, register round3, class `payload-absent` on both rows. Fresh check; round-40 dispositions used only as the delta baseline, not copied. Read-only HTTP GETs. No writes under `/home/vgpnk/Projects/shokuknow`. No git mutation. No install (pacman paused; `~/.omp/agent/RULES.md` read; curl and python3 already present).

Axes: (1) quote identity — exact, then whitespace-normalized, then partial/typo; (2) URL identity — registered vs final vs a different registered source; (3) fetch integrity — status, bytes, sha256; (4) live-source delta vs the round-40 label.

Scratch `/fast/scratch/hyaku/tabi-r42/QuarR4212/` held the bodies and was removed after these evidence files were written.

## S145 — absent

Register row (`absent-defect-register.md` line 200): lane `tabi`, round `round3`, id `S145`, class `payload-absent`, cited source `https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt`, quotes `Common CSRF weaknesses and protection mechanisms` and `Limitations of SameSite`.

Command (scratch dir):

```
curl -sSL -D s145.headers -o s145.body -w "url_effective=%{url_effective}\nhttp_code=%{http_code}\nsize_download=%{size_download}\nredirect_url=%{redirect_url}\nnum_redirects=%{num_redirects}\ncontent_type=%{content_type}\n" --max-time 60 --max-redirs 5 "https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt"
sha256sum s145.body && wc -c s145.body
```

Observed: `url_effective` equal to the registered URL, `http_code=200`, `num_redirects=0`, `content_type=text/plain; charset=utf-8`, `size_download=146976`, `sha256 062239316659673b9373865352e8ec5cb710c3d5fe66eedceacfaa6d34d85fbf`, `Last-Modified: Wed, 15 Nov 2023 20:05:12 GMT`. Body header is `draft-ietf-httpbis-rfc6265bis-13` dated `15 November 2023`.

Python search of that body: both phrases 0 exact, 0 casefold, 0 after collapsing all whitespace. Also 0 for `CSRF weaknesses`, `protection mechanisms`, `Limitations of`, and `Common CSRF`. Not a one-token typo of the headings that are there (`8.8. SameSite Cookies`, `8.8.1. Defense in depth`, lines 2811-2813). The surrounding SameSite sentence is a different row's text, not these titles:

> "SameSite" cookies offer a robust defense against CSRF attack when deployed in strict mode, and when supported by the client. It is, however, prudent to ensure that this designation is not the extent of a site's defense against CSRF, as same-site navigations and submissions can certainly be executed in conjunction with other attack vectors such as cross-site scripting.

No other register row owns these two phrases, so this is not misbound inside the register. The registered URL did not 404, so no alternate URL was fetched for S145.

Round-40: absent (SameSite row; distinct from lane S145). Unchanged. The live digest is the same `062239316659673b9373865352e8ec5cb710c3d5fe66eedceacfaa6d34d85fbf` previously recorded for this URL, and Last-Modified is still 15 Nov 2023. Lane S145 is a different id space; this row is the register's staged section titles, which are not in the draft.

Per-id verdict: **absent**.

## S147 — misbound

Register row (line 201): lane `tabi`, round `round3`, id `S147`, class `payload-absent`, cited source `https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1015/`, quote `Error 1020: Access denied`.

Command:

```
curl -sSL -D s147.headers -o s147.body -w "url_effective=%{url_effective}\nhttp_code=%{http_code}\nsize_download=%{size_download}\nredirect_url=%{redirect_url}\nnum_redirects=%{num_redirects}\ncontent_type=%{content_type}\n" --max-time 60 --max-redirs 8 -A "Mozilla/5.0 (compatible; tabi-r42-quarantine/1.0; +research)" "https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1015/"
sha256sum s147.body && wc -c s147.body
```

Observed: `url_effective` equal to the registered URL, `http_code=200`, `num_redirects=0`, `content_type=text/html`, `size_download=115841`, `sha256 4265cc554a1266beedb1eb160546f42ef64dca9dc33d4bbc43a2e8dfadabea25`. Canonical link in the body is the same error-1015 URL. Title `Error 1015 · Cloudflare Support docs`. H1 `Error 1015`. H2 `Error 1015: You are being rate limited`. Surrounding sentence: "The website you are trying to visit has received too many requests and has temporarily blocked you from accessing it."

Exact `Error 1020: Access denied`: 0. Exact `Access denied`: 0. The only `Error 1020` is a sidebar link to `/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1020/`, so the row is not partial.

Classification probe only (the registered URL returned 200; this URL was not substituted). S148's registered source:

```
curl -sSL -D s147-1020.headers -o s147-1020.body ... "https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1020/"
```

Observed: HTTP 200, 0 redirects, final URL the error-1020 URL, 121181 bytes, `sha256 d2107de58ddee762bedf261912ed89bd8636d389ff0f5a4193a751d70c0ca48c`. Exact `Error 1020: Access denied`: 3, including `<h2 id="error-1020-access-denied">Error 1020: Access denied</h2>`. Following sentence: "This error indicates that a Cloudflare security feature configured by the website owner blocked the request. Cloudflare returns it with an HTTP 403 status code."

Round-40: absent at cited URL (misbound 1015/1020). The cited 1015 page still does not contain the quote; no live insertion or removal of that sentence was observed. The enum is **misbound** because the quote is the heading of a different registered source (S148), which is what r40's parenthesis already named.

Per-id verdict: **misbound**.

## Evidence

- `.ufo/waves/round-42/w1/QuarR4212/evidence-S145.txt`
- `.ufo/waves/round-42/w1/QuarR4212/evidence-S147.txt`

## Limitations

Bodies were not retained (scratch deleted). Hashes and the quoted spans above are from those bodies before deletion. S147's 1020 fetch is a classification probe, not a replacement registered URL. No round-40 response body was on disk to byte-compare; the S145 digest match is against the previously recorded digest for this URL, and the S147 delta is the continued absence of the quote on 1015 plus its continued presence as the 1020 H2.

VERDICT finding S145 absent on unchanged draft-13; S147 misbound to registered S148 error-1020 (cited 1015 still lacks the quote)
