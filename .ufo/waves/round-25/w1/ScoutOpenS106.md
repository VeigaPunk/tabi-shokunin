# ScoutOpenS106 — round 25, wave 1 (read-only scout)

Fetched 2026-10-25T12:15:23Z (`date -u +%FT%TZ`). Lane HEAD at fetch: `c8ef3084c6363f265b9d23285296ab3547654f57`
(`git rev-parse HEAD`; one commit past baseline `9e136667`: `c8ef308 round-25: freeze claims, controls, census-before, wave-1 spec`).
Claims read first: `.ufo/waves/round-25/claims.json` (C1 depth / C2 freshness). No admission judgment below — bytes and quotes only.
Tool installs/updates: none.

Saved bytes (all under `.ufo/waves/round-25/scratch/ScoutOpenS106/`):

| file | bytes (`wc -c`) | sha256 (`sha256sum`) |
|---|---|---|
| `content_features.cc.b64` (transfer) | 98604 | `f17347b21887a56f643cd52356b3a8f7664516c8563f8950a07172f7385a9b03` |
| `content_features.cc` (decoded) | 73952 | `9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44` |
| `bfcache.html` | 157663 | `46dac3cd4155100d983a8b307f01e5329cfc1a69954d3c76befcceae3906515e` |
| `Page.pdl.b64` (transfer) | 82548 | `0823829b68ca3857c4e69a833863b23c6e8cca686c3dec8b4667c98a8a2dfc30` |
| `Page.pdl` (decoded) | 61911 | `e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be` |

Fetch commands (one GET each, run in parallel from the scratch dir):
```
curl -sSL -o content_features.cc.b64 -w '... http=%{http_code} bytes=%{size_download}' 'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/content/public/common/content_features.cc?format=TEXT'   -> http=200 bytes=98604
curl -sSL -o bfcache.html            -w '...' 'https://web.dev/articles/bfcache'                                                                                                                       -> http=200 bytes=157663
curl -sSL -o Page.pdl.b64            -w '...' 'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/Page.pdl?format=TEXT' -> http=200 bytes=82548
base64 -d content_features.cc.b64 > content_features.cc && base64 -d Page.pdl.b64 > Page.pdl
```

## 1. S106 (new) — `content/public/common/content_features.cc` @ tag 154.0.8037.97

Observed (`grep -n 'BackForwardCache' content_features.cc`), decoded lines 186–187 (7 words, `sed -n '186,187p' | wc -w` → 7):

```
186: // Enable using the BackForwardCache.
187: BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);
```

Adjacent declarations at this tag (same grep): line 191 `BASE_FEATURE(kBackForwardCacheEntryTimeout, base::FEATURE_ENABLED_BY_DEFAULT);`;
line 203 `BASE_FEATURE(kBackForwardCacheMemoryControls,` (comment lines 193–202: disabled on low-memory devices, "enabled only on Android");
line 240 `kCacheControlNoStoreEnterBackForwardCache`; line 300 `kDeviceBoundSessionTerminationEvictBackForwardCache`.

Inference (not observed at runtime): at this tag the feature default is ON on desktop Linux; the memory-controls gate is Android-scoped per the line 201–202 comment.

Id-collision observation (not a verdict): `S106` does not exist in lane `corpus/SOURCES.md` at baseline
(`git show 9e136667…:corpus/SOURCES.md | grep -cE '^\| S106 '` → 0; current tree tops out at S105, 105 rows by
`grep -cE '^\| S[0-9]{3} ' corpus/SOURCES.md`). But `corpus/lessons/round-22-verifier-spotcheck.md:164` already names an
**`S106`** — a shokuknow package row (`https://www.rfc-editor.org/rfc/rfc9309.txt`, `payload-absent` → refused). Any S106 row
text should disambiguate from that historical refused package id (the round-24 lesson §10 rule: "renumber by document").

## 2. S104 re-open — https://web.dev/articles/bfcache

- Fresh: 157663 bytes, sha256 `46dac3cd…906515e`. Held (row S104 and committed `corpus/evidence/round-24/sources/bfcache.html`): 157667 bytes, sha256 `0dd45292…ffaf28e07`. **Digest drifted (−4 bytes).**
- Quote **still resolves at line 2531** (`grep -n 'essentially instant' bfcache.html` → 2531). Raw line:
  `Loading the previous page is <em>essentially instant</em>, because the entire page can be restored from memory, without having to go to the network at all.`
  Markup-stripped (`sed -n 2531p | sed 's/<[^>]*>//g'`): "Loading the previous page is essentially instant, because the entire page can be restored from memory, without having to go to the network at all." — `wc -w` → 25 words, identical to the held quote.
- Other S104 anchors also unchanged: line 2893 (`NotRestoredReasons` API sentence), line 2511 ("All major browsers include a bfcache, including Chrome since version 96, Firefox and Safari.").
- Cause of drift (`diff corpus/evidence/round-24/sources/bfcache.html <fresh>` → exit 1, 4 changed lines = 2 hunks):
  line 3418 `<script nonce=…>` value (per-response CSP nonce), and line 3423 the devsite app-loader config — the feature-flag
  array is reordered and one numeric element `116` is gone (tokenized diff via `tr ',' '\n'`). No article-body line differs.
  Inference: page-chrome churn only; the cited prose is byte-identical.

## 3. S105 re-open — Page.pdl @ tag 154.0.8037.97

- Fresh: 82548-byte base64 transfer → 61911 bytes decoded, sha256 `e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be` — **exact match** to row S105 and to committed `corpus/evidence/round-24/sources/page.pdl` (`cmp` exit 0).
- Quote **still resolves at line 1345** (`grep -n BackForwardCacheRestore Page.pdl` → 1345), context lines 1341–1345:
  ```
  1341:  # The type of a frameNavigated event.
  1342:  experimental type NavigationType extends string
  1343:    enum
  1344:      Navigation
  1345:      BackForwardCacheRestore
  ```
- Line 1706 `experimental event backForwardCacheNotUsed`; line 1713 `array of BackForwardCacheNotRestoredExplanation notRestoredExplanations` — both present as held.

## Unknowns

- No runtime observation here: whether the loopback probe actually gets a restore is C1's executor question, not resolved by source bytes.
- web.dev drift recurrence: only two fetches compared (round-24 committed vs today); whether the nonce/flag lines change on every response was not sampled further (no extra GETs beyond the three documented).
