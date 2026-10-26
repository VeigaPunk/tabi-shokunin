# RevQuarantineCarry — round-30 w1 assimilation REJECT spot-check (Gate ≥1 reject)

## Verdict

The planned round-30 assimilation REJECTS hold: both staged package entries stay refused, and all five under-lying register rows (S106, S110, S147, S148, S149) re-opened today carry `payload-absent` evidence exactly as round 27 concluded. Every cited URL was re-fetched today (2026-10-26T06:44:34Z, HTTP 200 ×5) and every payload is **byte-identical** to the round-27 fetches (sha256 and byte count match QuarantineA/QuarantineC records), so no source drift can flip anything. The register-recorded staged quotes are absent from today's bytes in all folds (raw, entity-unescaped, tag-stripped, whitespace-normalised, case-fold, URL-encoded). For `rate-and-tos-signal-vocabulary.md` (S106 RFC 9309, S110 RFC 6585): refusal still holds, flip condition **not met** — the drift is a wrong-document quote cell (WebMCP phrases cited against immutable RFCs), and an RFC will never contain those spans. For `host-rate-limit-signal-classes-r13.md` (S147/S148/S149): refusal still holds, flip condition **not met as staged** — round 27's sibling-drift map re-confirms verbatim today (S147's register quote lives on S148's page ×3; S148's register quotes live on S149's robots.txt at L130/L424), but S149's register quote cell (`The daemon`, `/status JSON fields`) has no carrier in any of the three cited sources, so the row set cannot be corrected by re-pointing alone. Notably, both entries' *own* inline claims and locators verify against today's bytes (details below) — the refusals are about broken row evidence, not wrong entry content — so a re-stage with fresh quote cells is viable curation, but it is not a flip of these verdicts.

## Scope and inputs (read-only)

- Assignment slice: `.ufo/waves/round-30/assimilation/quarantine-slice` — sha256 `79ea7557572ff6ff81c9c70fc582ae39ce35d35f437e44ec5d901b98d9fd3772` (1,035 B; 37 rows `payload-absent` + S171 `unreachable`; my rows S106, S110, S147, S148, S149 all `payload-absent`).
- Fleet register (read-only): `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` — sha256 `5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833` (83,621 B), **identical to the digest QuarantineC recorded on 2026-10-25** — quote cells unchanged since round 27. Tabi rows: S106/S110 at register lines 180/182; S147/S148/S149 at lines 199–201.
- Round-27 verdicts compared: `.ufo/waves/round-27/quarantine/QuarantineA.md` (S106 absent/refuse, S110 absent/refuse) and `QuarantineC.md` (S147/S148/S149 absent/refuse ×3, drift pattern observed).
- Package entries: `/home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/corpus/knowledge/rate-and-tos-signal-vocabulary.md` and `host-rate-limit-signal-classes-r13.md` (read-only).

## Fetch receipts (one documented public GET per cited URL, no companions, no redirects taken)

| row | URL | UTC | HTTP | bytes | sha256 | = r27 bytes? |
|---|---|---|---|---|---|---|
| S106 | `https://www.rfc-editor.org/rfc/rfc9309.txt` | 2026-10-26T06:44:34Z | 200 | 25,265 | `f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207` | yes (QuarantineA) |
| S110 | `https://www.rfc-editor.org/rfc/rfc6585.txt` | 2026-10-26T06:44:34Z | 200 | 17,164 | `f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58` | yes (QuarantineA) |
| S147 | `https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1015/` | 2026-10-26T06:44:34Z | 200 | 115,841 | `3e0f03347a5eda459ee6e461bdd26b90d8a62cad5587418a6b779fa30f0ecd60` | yes (QuarantineC) |
| S148 | `https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1020/` | 2026-10-26T06:44:34Z | 200 | 121,181 | `96096138e251cca2cf9fa6656d6ddc19c4c47f87964bd916de0cfa6eb6c06634` | yes (QuarantineC) |
| S149 | `https://en.wikipedia.org/robots.txt` | 2026-10-26T06:44:34Z | 200 | 28,275 | `48b98d80c8444d37cdf50cc9a4d2257b66039477e581066d2356062a4cbd678f` | yes (QuarantineC) |

curl `-sS -L --max-redirs 5`, UA `tabi-r30-w1-RevQuarantineCarry/1.0 (lane tabi-shokunin, quote-verification GET)`; effective URL equaled the requested URL in all five cases. Bodies kept at `.ufo/waves/round-30/w1/RevQuarantineCarry/receipts/` (+ `manifest.tsv`) and under `/fast/scratch/hyaku/tabi-r30/RevQuarantineCarry/bytes/`.

## Row-level quote census (register quote cell vs today's bytes)

| row | register quote cell | exact | case-fold | url-enc | fold notes |
|---|---|---|---|---|---|
| S106 | `使用 WebMCP 時，請注意下列事項` | 0 | 0 | 0 | body has 7 non-ASCII bytes, none CJK |
| S106 | `確認 WebMCP 工具曝光度` | 0 | 0 | 0 | "
| S110 | `Add hints to your tools` | 0 | 0 | 0 | payload is RFC 6585, April 2012 |
| S110 | `Expose your tools carefully` | 0 | 0 | 0 | "
| S110 | `Last updated 2026-09-01 UTC` | 0 | 0 | 0 | "
| S147 | `Error 1020: Access denied` | 0 | 0 | 0 | sole `Error 1020` ×1 = sidebar nav link; `<title>Error 1015 · Cloudflare Support docs</title>` |
| S148 | `Crawl-delay` | 0 | 0 | 0 | case-fold `crawl` hits are head/nav only |
| S148 | `Sitemap` | 0 | 2 (raw) | 0 | both = `<link rel="sitemap" href="/sitemap-index.xml">` head element, not content |
| S149 | `The daemon` | 0 | 0 | 0 | payload is the Wikimedia spider-block list |
| S149 | `/status JSON fields` | 0 | 0 | 0 | "

All five rows: fetched cleanly (HTTP 200) and the recorded quote is in none of the bytes → the register's `payload-absent` classification re-confirms today.

## Entry-level check (flip-condition evidence — entry's own quotes/locators in today's bytes)

`rate-and-tos-signal-vocabulary.md` claims all locate in today's RFC bytes:
- RFC 9309 L100 "These rules are not a form of access authorization." (§1 claim); L395 "…the crawler MAY access any resources" (§2.3.1.3); L402 "MUST assume complete disallow" (§2.3.1.4); L419 "SHOULD NOT use the cached version for more than 24 hours" (§2.4); L425 "The parsing limit MUST be at least 500 kibibytes [KiB]" (§2.5).
- RFC 6585 (normalised) "too many requests in a given amount of time" (§4); L140 "and MAY include a Retry-After header"; L167 "Responses with the 429 status code MUST NOT be stored by a cache." — the entry's "MUST NOT be cached" is a fair paraphrase.

`host-rate-limit-signal-classes-r13.md` claims and locators all exact today:
- S147 page: "Error 1015: You are being rate limited" ×3; "The website owner has configured rate limiting rules" ×1.
- S148 page L194: "Cloudflare returns it with an HTTP `403` status code."; "Error 1020: Access denied" ×3.
- S149 robots.txt: header comment L9 "# and ignoring 429 ratelimit responses, claims to respect robots:"; L130 `Crawl-delay: 5`; L424 `Sitemap: https://en.wikipedia.org/w/rest.php/site/v1/sitemap/0` — the entry's cited locators (L9 / L130 / L424) are exact.

## Verdicts per row

| row | round-27 verdict | today | verdict |
|---|---|---|---|
| S106 | absent/refuse (QuarantineA) | quotes absent, bytes identical | **refusal still holds** — flip condition not met: quote cell is WebMCP text cited against an immutable RFC; it cannot appear there, only a re-stage with genuine RFC 9309 spans flips the row |
| S110 | absent/refuse (QuarantineA) | quotes absent, bytes identical | **refusal still holds** — same condition as S106 (WebMCP phrases vs RFC 6585) |
| S147 | absent/refuse (QuarantineC) | quote absent from cited page | **refusal still holds** — flip condition (stated): register quote `Error 1020: Access denied` is present ×3 on S148's cited URL (re-confirmed today); re-pointing the quote cell onto that sibling row would clear this row |
| S148 | absent/refuse (QuarantineC) | quotes absent from cited page | **refusal still holds** — flip condition (stated): register quotes `Crawl-delay`/`Sitemap` are present on S149's cited URL (L130/L424); re-pointing onto that sibling row would clear this row |
| S149 | absent/refuse (QuarantineC) | quotes absent everywhere fetched | **refusal still holds** — flip condition unidentifiable within the cited set: no sibling carries `The daemon` / `/status JSON fields`; the carrier source is unknown |

Entry verdicts: `rate-and-tos-signal-vocabulary.md` — REJECT stands (S106/S110 refusals hold). `host-rate-limit-signal-classes-r13.md` — REJECT stands (S147/S148/S149 refusals hold; the drift chain S147←S148←S149 closes for two of three rows but S149's quote cell has no carrier, so re-pointing alone cannot rehabilitate the row set). Both entries' own content is verifiable in the cited sources, so corrected re-staging (fresh quote cells from today's receipts) is viable curation — that is new work, not a flip of the round-27 verdicts.

## Commands run (all exit 0)

```
# digests of inputs
sha256sum /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md \
          /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-30/assimilation/quarantine-slice   # exit 0
# per-URL fetch (×5), template:
D=/fast/scratch/hyaku/tabi-r30/RevQuarantineCarry; mkdir -p "$D/bytes" && \
curl -sS -L --max-redirs 5 -A 'tabi-r30-w1-RevQuarantineCarry/1.0 (lane tabi-shokunin, quote-verification GET)' \
  -o "$D/bytes/<ID>.body" -w '<ID> http=%{http_code} bytes=%{size_download} effective=%{url_effective}\n' '<URL>' \
  && date -u '+fetched %Y-%m-%dT%H:%M:%SZ' && sha256sum "$D/bytes/<ID>.body"      # exit 0 ×5
# receipt copy into output dir
mkdir -p "$O/receipts" && cp "$S"/bytes/*.body "$O/receipts/" && sha256sum "$O"/receipts/*.body   # exit 0
# quote census: Python multi-fold search (raw / entity-unescaped / tag-stripped / whitespace-normalised / case-fold / URL-encoded) over the five bodies — one eval cell, exit 0
```

## Residual risk / verification gaps

- Cloudflare payloads judged on served HTML only; both pages ship `text/markdown` alternates (`index.md`) that were not fetched (one GET per cited URL, per assignment) — same limitation QuarantineC recorded.
- S149's register quote cell has no identified carrier; companion URLs were out of scope, so its true source remains open.
- Verdicts bind to the bytes served 2026-10-26T06:44:34Z (receipts committed above); the two Cloudflare pages and Wikipedia robots.txt are live and mutable, though byte-stable since 2026-10-25.
- No installs/upgrades (none needed); no pacman; no writes to the lane tree outside my own output dir and report; shokuknow untouched; no lane git/jj operations.
