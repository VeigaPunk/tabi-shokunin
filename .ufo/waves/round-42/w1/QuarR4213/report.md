# QuarR4213 — quarantine re-adjudication S148, S149

Axes used: register fidelity, live-source identity (status, bytes, sha256, final URL), quote location (exact then whitespace-normalized), verdict discrimination, evidence completeness.

Seat: QuarR4213. Lane: tabi. Round-42 attempt 1. Leaf only. No installs. `/home/vgpnk/.omp/agent/RULES.md` read; pacman not used; no package added (curl and python3 already present). No writes under `/home/vgpnk/Projects/shokuknow`, no git/jj mutation. Scratch `/fast/scratch/hyaku/tabi-r42/QuarR4213/` deleted after the receipts below were copied here.

## Register rows (read-only)

Source: `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` lines 202–203. Header: lane | round | id | class | cited source | quote(s) | note.

- S148: `tabi` | round3 | S148 | `payload-absent` | `https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1020/` | `Crawl-delay` + `Sitemap` | "cited source, companion URLs and local artifacts were all checked; the quote is in none of them"
- S149: `tabi` | round3 | S149 | `payload-absent` | `https://en.wikipedia.org/robots.txt` | `The daemon` + `/status JSON fields` | same note

(The kake-lane S148 on line 85 is a different row and was not adjudicated.)

## Commands and observed output

Working directory: `/fast/scratch/hyaku/tabi-r42/QuarR4213`. Two fetches, same hashes both times (15:36:55Z and 15:37:59Z for S148; S149 Date stayed 15:14:30Z, a front-cache hit).

```
curl -sS -L --max-redirs 5 -A 'QuarR4213-r42-readonly/1.0' \
  -D s148.headers -o s148.body \
  -w 'http=%{http_code} url=%{url_effective} bytes=%{size_download} redirects=%{num_redirects} time=%{time_total}\n' \
  --max-time 60 \
  'https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1020/'
curl -sS -L --max-redirs 5 -A 'QuarR4213-r42-readonly/1.0' \
  -D s149.headers -o s149.body \
  -w 'http=%{http_code} url=%{url_effective} bytes=%{size_download} redirects=%{num_redirects} time=%{time_total}\n' \
  --max-time 60 \
  'https://en.wikipedia.org/robots.txt'
sha256sum s148.body s149.body
wc -c s148.body s149.body
```

```
http=200 url=https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1020/ bytes=121181 redirects=0 time=0.076629
http=200 url=https://en.wikipedia.org/robots.txt bytes=28275 redirects=0 time=0.215041
d2107de58ddee762bedf261912ed89bd8636d389ff0f5a4193a751d70c0ca48c  s148.body
48b98d80c8444d37cdf50cc9a4d2257b66039477e581066d2356062a4cbd678f  s149.body
121181 s148.body
 28275 s149.body
```

S148 response: `HTTP/2 200`, `content-type: text/html`, `date: Wed, 28 Oct 2026 15:37:59 GMT`, `cf-cache-status: HIT`, no `Location`. Title: `Error 1020 · Cloudflare Support docs`.

S149 response: `HTTP/2 200`, `content-type: text/plain; charset=utf-8`, `content-length: 28275`, `last-modified: Tue, 06 Oct 2026 02:21:00 GMT`, `date: Wed, 28 Oct 2026 15:14:30 GMT`, `x-cache-status: hit-front`. Body is UTF-8 with BOM. No `Location`.

Quote counts on those bytes (exact, then whitespace-collapsed):

| body | token | exact | ws-norm |
|---|---|---|---|
| S148 error-1020 | `Crawl-delay` | 0 | absent |
| S148 error-1020 | `Sitemap` | 0 | absent |
| S149 robots.txt | `The daemon` | 0 | absent |
| S149 robots.txt | `/status JSON fields` | 0 | absent |
| S149 robots.txt | `daemon` | 0 | absent |

Non-matches that must not be promoted to the staged token: S148 contains `sitemap` twice, both inside `<link rel="sitemap" href="/sitemap-index.xml">` (head, one tag). Case-folded `crawl` is only the sidebar "Troubleshoot crawl errors". The page sentence that is present is "Error 1020: Access denied. This error indicates that a Cloudflare security feature configured by the website owner blocked the request."

S149 robots.txt lines that are present, and that are S148's tokens rather than S149's: L130 `Crawl-delay: 5`; L137 `# bot supports such a thing using the 'Crawl-delay' or another`; L424 `Sitemap: https://en.wikipedia.org/w/rest.php/site/v1/sitemap/0`. Opening line: `# robots.txt for http://www.wikipedia.org/ and friends`. L9: `# and ignoring 429 ratelimit responses, claims to respect robots:`.

## Why misbound, not absent-only or partial

`census-adjudication.json` binds each of these ABSENT quote cells to the next registry line:

- S148 `Crawl-delay` and `Sitemap`: url is the error-1020 page; `line` is `| S149 | robots.txt for wikipedia.org — https://en.wikipedia.org/robots.txt | ...`
- S149 `The daemon` and `/status JSON fields`: url is the robots.txt URL; `line` is `| S150 | kimi-webbridge operations reference — /home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/references/operations.md | ...`

The lane file `lanes/tabi/round3/SOURCES-PROPOSED.md` matches that shift. Gate S149 quotes `Crawl-delay: 5` and the Sitemap URL. The S150 row anchors are `§"The daemon"` and `§"/status JSON fields"`.

S150 carrier, read locally (not substituted for the registered URL; the registered URL returned 200): `/home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/references/operations.md`, 2422 bytes, sha256 `b811d9c23dfdafa0b751b23acef25b02a324490a3389efdd5c17319a646734fc`. L5 `## The daemon`. L28 `## /status JSON fields`. Following sentence (L7): the binary "serves a local HTTP daemon on `127.0.0.1:10086`."

Neither row is partial: for each id, both staged phrases are missing from the registered body, and the near-hits are a different token (HTML `rel="sitemap"`) or a different row's text. Neither URL 404'd, so no corrected-URL retry was used as the registered fetch.

## Delta versus round-40

Given dispositions, not copied: S148 absent; S149 absent/misbound (daemons text belongs to S150).

- S148 label changes absent → misbound. The live registered page did not gain `Crawl-delay` or `Sitemap` (exact counts still 0). What the live fetch shows today is that both tokens are still verbatim on tabi S149's registered URL, Last-Modified `Tue, 06 Oct 2026 02:21:00 GMT`, lines 130 and 424. That file did not change into or out of containing them between the round-3 locators and this fetch. The change is the verdict class, not new Cloudflare bytes.
- S149 stays misbound. The live robots.txt still has zero hits for `The daemon`, `/status JSON fields`, and `daemon`. operations.md still has both headings. No content change on the registered URL versus the round-40 misbound note. Enum here is the single value `misbound` (absent-from-URL remains true and is not `present`).

## Evidence

- `.ufo/waves/round-42/w1/QuarR4213/evidence-S148.txt`
- `.ufo/waves/round-42/w1/QuarR4213/evidence-S149.txt`

## Limitations

The error-1020 body is the HTML document Cloudflare returned to this client (cf-cache HIT), not a separately rendered markdown export. A markdown alternate link exists in the head and was not fetched; the staged tokens are absent from the HTML bytes that the registered URL returned, which is the cited source. robots.txt was served from a Wikimedia front cache (Age about 1400s) with Last-Modified 2026-10-06; the sha256 is of the body bytes including the BOM. operations.md was read from the local plugin path named by the S150 registry row; it was not HTTP-fetched. Companion URLs listed only in the register note were not re-fetched; the misbind carriers are the next row's own registered sources, which were fetched or read.

Row verdicts: S148 misbound. S149 misbound.

VERDICT finding S148 and S149 quote-cells are misbound onto the next registered source; neither cited URL contains its staged quotes
