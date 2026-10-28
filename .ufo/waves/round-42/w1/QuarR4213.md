# QuarR4213 — S148, S149 re-adjudication

Lane `tabi`, round3, register `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` lines 202–203. Fresh check; round-40 labels were not copied. No install (RULES.md read; pacman not used). No shokuknow writes, no git mutation. Scratch `/fast/scratch/hyaku/tabi-r42/QuarR4213/` removed after receipts were copied.

## S148 — misbound

Registered URL: `https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1020/`
Staged quotes: `Crawl-delay` ; `Sitemap`

```
curl -sS -L --max-redirs 5 -A 'QuarR4213-r42-readonly/1.0' -D s148.headers -o s148.body \
  -w 'http=%{http_code} url=%{url_effective} bytes=%{size_download} redirects=%{num_redirects}\n' \
  --max-time 60 \
  'https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1020/'
```

Observed: `http=200`, final URL unchanged, `redirects=0`, `bytes=121181`, `content-type: text/html`, `Date: Wed, 28 Oct 2026 15:37:59 GMT`. sha256 `d2107de58ddee762bedf261912ed89bd8636d389ff0f5a4193a751d70c0ca48c`. Title `Error 1020 · Cloudflare Support docs`. Exact and whitespace-normalized counts of both staged quotes are 0. The only `sitemap` hits are `<link rel="sitemap" href="/sitemap-index.xml">`. Page sentence present instead: "Error 1020: Access denied. This error indicates that a Cloudflare security feature configured by the website owner blocked the request."

Both tokens are verbatim on the next registered source, tabi S149 `https://en.wikipedia.org/robots.txt` (HTTP 200, 28275 bytes, sha256 `48b98d80c8444d37cdf50cc9a4d2257b66039477e581066d2356062a4cbd678f`, Last-Modified `Tue, 06 Oct 2026 02:21:00 GMT`): L130 `Crawl-delay: 5`, L424 `Sitemap: https://en.wikipedia.org/w/rest.php/site/v1/sitemap/0`. Census `line` for these quote cells is the S149 registry row.

Delta vs r40 `absent`: the Cloudflare body still lacks both quotes (no present-flip). The label is misbound because those tokens are on S149's registered URL, whose Last-Modified is still 2026-10-06.

## S149 — misbound

Registered URL: `https://en.wikipedia.org/robots.txt`
Staged quotes: `The daemon` ; `/status JSON fields`

```
curl -sS -L --max-redirs 5 -A 'QuarR4213-r42-readonly/1.0' -D s149.headers -o s149.body \
  -w 'http=%{http_code} url=%{url_effective} bytes=%{size_download} redirects=%{num_redirects}\n' \
  --max-time 60 'https://en.wikipedia.org/robots.txt'
```

Observed: `http=200`, final URL unchanged, `redirects=0`, `bytes=28275` (matches `content-length`), `content-type: text/plain; charset=utf-8`, UTF-8 BOM present, sha256 `48b98d80c8444d37cdf50cc9a4d2257b66039477e581066d2356062a4cbd678f`, Last-Modified `Tue, 06 Oct 2026 02:21:00 GMT`, `Date: Wed, 28 Oct 2026 15:14:30 GMT`. Exact and whitespace-normalized counts of both staged quotes are 0; substring `daemon` is 0. Opening sentence: `# robots.txt for http://www.wikipedia.org/ and friends`.

Both strings are headings in the next registered source, tabi S150 `/home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/references/operations.md` (local read, 2422 bytes, sha256 `b811d9c23dfdafa0b751b23acef25b02a324490a3389efdd5c17319a646734fc`): L5 `## The daemon`, L28 `## /status JSON fields`. Census `line` for these quote cells is the S150 registry row. The registered URL was not replaced; it returned 200.

Delta vs r40 `absent/misbound (daemons text belongs to S150)`: unchanged in substance. robots.txt still lacks both quotes. Enum value used here is `misbound`.

## Evidence

- `.ufo/waves/round-42/w1/QuarR4213/evidence-S148.txt`
- `.ufo/waves/round-42/w1/QuarR4213/evidence-S149.txt`
- full command log: `.ufo/waves/round-42/w1/QuarR4213/report.md`

VERDICT finding S148 and S149 quote-cells are misbound onto the next registered source; neither cited URL contains its staged quotes
