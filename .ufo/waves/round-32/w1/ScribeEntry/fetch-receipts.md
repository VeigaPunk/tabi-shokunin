# ScribeEntry — fetch and host receipts (C1 entry draft)

All times UTC, 2026-10-26. `curl -q -sS --proto =https`. Fetch command shape:

    f(){ ts=$(date -u +%Y-%m-%dT%H:%M:%SZ); code=$(curl -q -sS --proto =https -o "$out" -w '%{http_code}' "$url"); \
         n=$(stat -c %s "$out"); h=$(sha256sum "$out" | cut -d' ' -f1); printf '%s\t%s\t%s\t%s\t%s\n' "$ts" "$code" "$n" "$h" "$url"; }

## Fetches with saved bytes and digest

| UTC | HTTP | bytes | sha256 | URL |
|---|---|---|---|---|
| 2026-10-26T16:02:34Z | 200 | 4235856 | dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4 | https://www.w3.org/TR/webdriver-bidi/ |
| 2026-10-26T16:02:34Z | 404 | 76671 | e9d758533fb06141372e78532bb104de30383bf0cfc774c248ba93e1002751ff | https://developer.chrome.com/docs/chromedriver/bidi/ |
| 2026-10-26T16:02:34Z | 200 | 1882653 | 929f2f0be15b73b0b3e33052f115a47fc1561ec42f0a8992d532780591ae919e | https://www.w3.org/TR/webdriver2/ |
| 2026-10-26T16:04:27Z | 200 | 126508 | 552e1eb10ab61ca135b9fdd1edadc7f93dd983e74af02694500efa0954c91e9f | https://chromedriver.chromium.org/capabilities → https://developer.chrome.com/docs/chromedriver/capabilities (301 followed, `-L`) |
| 2026-10-26T16:04:28Z | 404 | 76675 | e18887e5a2dda7f661098252f1008258c796ca51d3f29faabc6bb53998c1943f | https://chromedriver.chromium.org/bidi → https://developer.chrome.com/docs/chromedriver/bidi (301 followed) |
| 2026-10-26T16:04:15Z | 200 | 109797 | 9bcef0e79814c2214a429ba3e570296a6782d9d5a3712949b29d9d894a8a6b8f | https://developer.chrome.com/blog/webdriver-bidi |
| 2026-10-26T16:03:42Z | 200 | 1957 (decoded) | be5e15ca920b888db1fe2bbf00535397fa9912f67c7aff8c6ec8b401676c845e | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/bidimapper/README.chromium?format=TEXT (raw base64 decoded before hashing) |

The BiDi bytes (4,235,856 B, sha256 dc1077…) are byte-identical to the round-13 re-fetch of the
same dated WD recorded in `corpus/knowledge/webdriver-bidi-capability-matrix.md`; the revision
string `f922e6af669ead51496db85f37813f39438ef171` occurs once in those bytes, and the page's
"This version" link is `https://www.w3.org/TR/2026/WD-webdriver-bidi-20261008/` (published
2026-10-08).

## Probes recorded as status/size only (no bytes kept, no digest claimed)

| HTTP | bytes | URL |
|---|---|---|
| 404 | 76675 | https://developer.chrome.com/docs/chromedriver/bidi |
| 404 | 76684 | https://developer.chrome.com/docs/chromedriver/bidirectional |
| 404 | 76683 | https://developer.chrome.com/docs/chromedriver/bidi-support |
| 404 | 76683 | https://developer.chrome.com/docs/chromedriver/bidi_support |
| 404 | 76682 | https://developer.chrome.com/docs/chromedriver/getting-started |
| 404 | 76681 | https://developer.chrome.com/docs/web-platform/webdriver-bidi |
| 404 | 76698 | https://developer.chrome.com/docs/chromedriver/capabilities/webdriver-bidi |
| 404 | 76681 | https://developer.chrome.com/docs/chromium/webdriver-bidi |
| 200 | 536 | https://developer.chrome.com/sitemap.xml |
| 200 | 126k | https://developer.chrome.com/docs/chromedriver (index; one sentence says ChromeDriver implements W3C WebDriver and WebDriver BiDi) |
| 301 | 256 | https://chromedriver.chromium.org/capabilities |
| 301 | 248 | https://chromedriver.chromium.org/bidi |

## Host pins

    $ /usr/bin/chromedriver --version
    ChromeDriver 154.0.8037.97 (b510e9d7cd3a2fbd78d0ddc42234103206c5f78d-refs/branch-heads/8037@{#1673})
    $ /usr/bin/chromium --version
    Chromium 154.0.8037.97 Arch Linux
    $ strings /usr/bin/chromedriver | grep -o 'chromium-bidi[/@][^",; )]*'   # no match

Mapper version comes from Chromium source at the tag, not from the binary:
chromium-bidi `Version: 17.0.2`, `Date: 2026-07-06`,
`Revision: 237806b5551fab0bc7d34b2d4e26b61e160aec07` (README.chromium above), corroborated by
`ScoutChromiumBidi` (`.ufo/waves/round-32/w1/ScoutChromiumBidi.md` §Evidence 4).

## Structural validation of the draft

    $ git clone --shared <lane> "$S/clone"; git -C "$S/clone" checkout -q --detach 4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6
    $ sha256sum "$S/clone/scripts/check-bidi-runtime.mjs"
    2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393   (= claims.json frozenDigests)
    $ node --input-type=module -e 'import {parseTable,ROWS} from "./scripts/check-bidi-runtime.mjs"; ...'
    {"rows":17,"yes":16,"ids":["R1"..."R15","R17"],"badCells":0,"unknown":[],"surfaceMismatch":[],
     "r16":"no — no BiDi command","sourceLine":true,"sIds":["S124","S125","S126"]}
    exit=0

No browser and no chromedriver were started by this seat. No tool was installed or upgraded.
