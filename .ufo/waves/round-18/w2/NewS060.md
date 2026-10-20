VERDICT: ISSUES

# NewS060 — S060 (Playwright downloads) + S058 rejection/sweep, round 18 wave 2

Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`; REV `530f40a9bc3f10436161a2af1ca0fe9bffffc004`
(`git rev-parse refs/heads/master` = `HEAD` = REV); baseline B
`2bff864fdfee684ddbcd066cc8e735adaba2735c`. Read-only: no LANE production, fleet, sibling,
jj or Git-index writes. Probes ran in `/tmp/s060-probe-3092` and `/tmp/s060-listing` only.
Public access was HTTP GET only; no browser page tool, no 9222, no credentials.

## Method (commands actually run)

```text
$ cd /tmp/s060-probe-3092
$ curl -sSL --compressed --max-time 60 -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-scout/18' \
    -D headers.txt -o browser-api.html -w 'HTTP=%{http_code} SIZE=%{size_download} URL=%{url_effective}\n' \
    'https://playwright.dev/docs/api/class-browser'
HTTP=200 SIZE=25174 URL=https://playwright.dev/docs/api/class-browser      # exit 0
$ sha256sum browser-api.html
b5aea68c3a07b8b430baada554ff2327127bf31286e6ff69524242c87e0bcd5e  browser-api.html
$ wc -c browser-api.html
184490 browser-api.html
$ grep -i '^last-modified\|^content-length\|^etag\|^date' headers.txt
last-modified: Tue, 20 Oct 2026 16:46:38 GMT
content-length: 25174
etag: W/"6ad79aee-2d0aa"
date: Tue, 20 Oct 2026 20:02:24 GMT

$ curl -sSI --max-time 30 'https://playwright.dev/docs/api/class-browser'   # HEAD
HTTP/2 200; content-length: 25174; last-modified: Tue, 20 Oct 2026 16:46:38 GMT; etag: "6ad79aee-2d0aa"

$ node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode html-text --body browser-api.html \
    --quote 'Whether to automatically download all the attachments. Defaults to true where all the downloads are accepted.'
{"found":true,"offset":5230,"normalizedLength":34832,"window":"…acceptDownloads boolean (optional) # Whether to automatically download all the attachments. Defaults to true where all the downloads are accepted. baseURL…"}
exit=0

$ curl -sSL --max-time 60 -o pw-params.md \
    'https://raw.githubusercontent.com/microsoft/playwright/v1.64.0/docs/src/api/params.md'
HTTP=200 SIZE=86400
$ sha256sum pw-params.md
e590b38cb22114bd40086fbb797de7dcad9ac96deb363650f9e344685cf573c9  pw-params.md
$ sed -n '374,377p' pw-params.md
## context-option-acceptdownloads
- `acceptDownloads` <[boolean]>

Whether to automatically download all the attachments. Defaults to `true` where all the downloads are accepted.

$ node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode none --body pw-params.md \
    --quote 'Whether to automatically download all the attachments. Defaults to true where all the downloads are accepted.'
{"found":false,"offset":-1,"normalizedLength":85106,"window":null}        # exit 1
$ node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode none --body pw-params.md \
    --quote 'Whether to automatically download all the attachments. Defaults to `true` where all the downloads are accepted.'
{"found":true,"offset":15086,"normalizedLength":85106,…}                  # exit 0

$ curl -sSL --max-time 60 -o class-browser.md \
    'https://raw.githubusercontent.com/microsoft/playwright/v1.64.0/docs/src/api/class-browser.md'
HTTP=200 SIZE=13004; sha256 de9be31c3c8ad8bc76a90ddf176e81b1e26ee1a96402db76daf27c69a019d94e
$ sed -n '258p;289p' class-browser.md
### option: Browser.newContext.-inline- = %%-shared-context-params-list-v1.8-%%
### option: Browser.newPage.-inline- = %%-shared-context-params-list-v1.8-%%

$ curl -sSL --max-time 60 -o class-download.md \
    'https://raw.githubusercontent.com/microsoft/playwright/v1.64.0/docs/src/api/class-download.md'
HTTP=200 SIZE=4945; sha256 fb1803f9f472c47fd7006db085d2f22ae5bf6795c27819750c56e4791de500e2
$ sed -n '86,91p' class-download.md
## async method: Download.failure
* since: v1.8
- returns: <[null]|[string]>

Returns download error if any. Will wait for the download to finish if necessary.

$ node --input-type=module -e 'import {decodeBody,normalize} from "…/recheck-fetch.mjs"; …'
decoded chars 40327 sha256 26a04a2afd5fedf0152fc9943ca0d8a32813a91f75d7e187f94db268fd498b4d
normalized chars 34832

$ curl -sS --max-time 30 'https://api.github.com/repos/microsoft/playwright/git/ref/tags/v1.64.0'
{"ref":"refs/tags/v1.64.0","object":{"sha":"606ecd8b34bac100db32561b6278ffd76e5eb3cd","type":"commit"}}

$ sha256sum .ufo/waves/round-18/recheck-fetch.mjs
f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360  .ufo/waves/round-18/recheck-fetch.mjs

$ node scripts/check-sources.mjs
SOURCES_GATE verdict=clean rows=64 tiers=A:52,B:4,C:8 status=queued:8,mined:48,rejected:8 findings=0 file=corpus/SOURCES.md
exit=0

$ curl -sSL --compressed --max-time 60 -D h.txt -o listing.html \
    'https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd'
HTTP=200 SIZE=109622   # wire; on-disk 695865 B; sha256 ed28a12e1fe4e62363a557f11a8a10520c317f508635a3c5cff68c4d9d7c890e
$ grep -o '1\.9\.[0-9]*' listing.html | sort | uniq -c
      3 1.9.19
$ grep -o 'Google Ireland, Ltd\.[^<"]*' listing.html | head -3   # present
$ grep -o 'Fran[^<"]*Beaufort' listing.html | head -3            # present
```

## Observed — S060 (passing core)

- Row: `corpus/SOURCES.md:74`; Gate: `corpus/lessons/round-18.md:41`; dossier:
  `.ufo/waves/round-18/sources/SrcPwDownloads.md` (147 lines; Gate entry at `:79-87`).
- Live URL is HTTP 200 on 2026-10-20; decompressed body 184490 B,
  sha256 `b5aea68c3a07b8b430baada554ff2327127bf31286e6ff69524242c87e0bcd5e`, exactly
  the dossier `:17` and lesson `:41` digest. `last-modified: Tue, 20 Oct 2026 16:46:38 GMT`,
  `etag: W/"6ad79aee-2d0aa"`. No drift between the recorded fetch and this re-open.
- Anchor `browser-new-context-option-accept-downloads` is present in the served body (id at
  byte 66746; two occurrences: id + permalink). The quote sits under
  `Browser.newContext › Arguments › options › acceptDownloads`.
- Quote is exactly 16 words (`printf ... | wc -w` → 16; tool `split(/\s+/)` → 16); live
  html-text normalize-only is `found:true, offset:5230, normalizedLength:34832`, byte-for-byte
  equal to the dossier `:95`. The served HTML wraps `true` in `<code>`; html-text strips tags.
- Docs source pin: `params.md` at tag v1.64.0, HTTP 200, 86400 B,
  sha256 `e590b38cb22114bd40086fbb797de7dcad9ac96deb363650f9e344685cf573c9`;
  `## context-option-acceptdownloads` at line 374, quote at line 377. Tag commit
  `606ecd8b34bac100db32561b6278ffd76e5eb3cd` (GitHub API). `class-browser.md` at the same tag
  (13004 B, sha256 `de9be31c…d94e`) includes that shared list at line 258.
- Decoded text (html-text, pre-normalize) is 40327 chars, sha256
  `26a04a2afd5fedf0152fc9943ca0d8a32813a91f75d7e187f94db268fd498b4d`; dossier `:19-20` is exact.
- Producer `.ufo/waves/round-18/recheck-fetch.mjs` is sha256
  `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`, matching the dossier
  Gate entry `:87`.
- Tier A, kind `docs`, scope "Context download acceptance default at Playwright 1.64.0" is
  appropriately narrow for the quoted option prose; status `mined`; used-by
  `corpus/knowledge/harness-hardening-round-18.md` exists and cites S060 at
  `harness-hardening-round-18.md:2,27,39,59`.
- `S060` is a **new** row (S059+). It is not in C1's fixed 51-row baseline set (57 rows at B
  minus S004/S039/S047/S049/S050/S053), so the absence of
  `corpus/evidence/round-18/source-recheck/S060.json` is expected, not a missing receipt.
  The receipt directory holds exactly 51 JSON files (S001-S057 minus those six).

## Findings (concrete discrepancies)

### F1 — Dossier misreports the HTTP `content-length` (high confidence, low materiality)
`SrcPwDownloads.md:11-12` states the response header `content-length: 184490`. Both a GET
(with `--compressed`) and a HEAD return `content-length: 25174`; `size_download` is 25174.
184490 is the **decompressed on-disk body** size, not the header. The dossier's own fetch
line `:22-23` says `200 25174 (wire bytes; decoded file 184490 bytes)`, so the file
self-contradicts. The sha256 `b5aea…` is still the correct digest of the 184490-byte body.
Fix: record `content-length: 25174` and label 184490 B "decompressed body".

### F2 — Dossier misattributes the `acceptDownloads` default in installed code (high confidence)
`SrcPwDownloads.md:69-70`: "`prepareBrowserContextParams` sets `options.acceptDownloads =
"accept"` when undefined for non-Electron browsers; `sharedContextParams` default is
`acceptDownloads: "accept"`." In the installed Playwright 1.64.0
`playwright/node_modules/playwright-core/lib/coreBundle.js`:
- `prepareBrowserContextParams` (`:63666-63686`) only maps through
  `acceptDownloads: toAcceptDownloadsProtocol(options.acceptDownloads)` at `:63680`; it sets
  no default.
- The "accept" default is in `validateBrowserContextOptions` at `:52877-52879`:
  `if (options.acceptDownloads === void 0 && browserOptions.name !== "electron") options.acceptDownloads = "accept";`.
- `sharedContextParams` does not occur in `coreBundle.js` (grep count 0). The existing
  default object is `defaultNewContextParamValues` (`:53528-53540`, `acceptDownloads:
  "accept"` at `:53537`).
The behavioural claim (default = accept) is correct; the two code pointers are wrong.

### F3 — The `toAcceptDownloadsProtocol` snippet is not verbatim (high confidence)
`SrcPwDownloads.md:57-58` quotes `if (acceptDownloads) return "accept"; return "deny";`.
The actual function (`coreBundle.js:63694-63699`) is:

```js
function toAcceptDownloadsProtocol(acceptDownloads) {
  if (acceptDownloads === void 0)
    return void 0;
  if (acceptDownloads)
    return "accept";
  return "deny";
}
```

The quoted snippet omits the `undefined` branch. That omission matters to the adjacent
"Defaults" sentence: the function does not produce the default; `validateBrowserContextOptions`
does. Fix: quote the full function or drop the snippet.

### F4 — S060 `teaches` outruns both its scope cell and the cited docs (medium)
`corpus/SOURCES.md:74` teaches: "Downloads are accepted by default; set
`acceptDownloads:false` explicitly and observe download failure separately from a disk
scan." Scope: "Context download acceptance default at Playwright 1.64.0". The cited docs
state only the default (`params.md:375-377`; served quote). "Observe download failure"
presupposes that a refused download reaches the page-level `download` event — which the
lane's own evidence marks as an inference:
- `SrcPwDownloads.md:132-139`: "'Recorded' does not follow from refusal alone … the docs
  never state event behaviour under `false`. … [INFERENCE] that Chromium 154 emits
  `downloadWillBegin` … the `invoke-download-refused` probe run is the observation that
  settles it."
- `corpus/knowledge/harness-hardening-round-18.md:27`: the event delivery is explicitly
  `[INFERENCE]`; the `h4` run settles it.
The registry cell carries no marker, and the scope cell does not cover event observation.
Fix: narrow the teaches cell to the documented default, or carry the `[INFERENCE]` marker /
scope the clause to the `h4` probe.

### F5 — S058 flip is contradictory between the committed row and its dossier (high confidence)
- Final row `corpus/SOURCES.md:72`: `flip: listing or extension source publishes a concrete
  invocation API contract`.
- Dossier draft row `S058Listing.md:56`: `flip: a Chrome-owned page or the extension's own
  published source stating that floor or publishing an invocation API contract`.
- Dossier §6 `S058Listing.md:94-95`: "**Chrome 150 floor.** … that is exactly S058's flip
  condition."
The committed row dropped the Chrome-floor branch that the dossier still calls the flip
condition, so the rejection has two different flip statements. The lesson
`corpus/lessons/round-18.md:39` records only the S058 URL/quote and does not resolve it.
Fix: either add the floor branch to the committed flip, or correct §6 to say the floor is
S053's flip condition (the draft row's wording is the superset).

### F6 — S058's "version 1.9.19" is not bound by committed evidence (medium)
`corpus/SOURCES.md:72` anchor says "version 1.9.19". `S058Listing.md` contains no `version`
string (grep count 0), and the Gate entry `S058Listing.md:67-73` records no version quote or
digest. A fresh GET on 2026-10-20 serves `1.9.19` three times (695865 B, sha256
`ed28a12e…`), so the value is currently true, but the recorded fetch #4 (649152 B, sha256
`fbc214a8…8d2`) does not document it and the listing is dynamic (the dossier itself warns
offsets rotate). Fix: add the version quote/offset to the Gate entry, or drop the value from
the row anchor.

### F7 — The publisher-premise sweep leaves the premise in other cells (medium-low)
`sweep` target S058 is clean: no S058 cell contains `individual publisher`
(`grep -rn` over `corpus/` and `.ufo/waves/round-18/` confirms). But the falsified premise
survives verbatim in:
- `corpus/SOURCES.md:71` (S057 anchor): "Offered by François Beaufort (individual publisher)".
  S057's status is `rejected`, not superseded, and the row has no pointer to S058; the only
  explicit supersession is S058's `supersedes S057 —` prefix. S057's own teaches already
  says "developer Google Ireland, Ltd.", so the row contradicts itself.
- `corpus/SOURCES.md:67` (S053 teaches): "individual-publisher extension listing".
- `corpus/knowledge/source-recheck-round-18.md:102` repeats the S057 anchor text as
  "registry-recorded … (S053 record)". Line 136 acknowledges that S057 still carries the
  wording and says "the correction to that cell is outside this note", so the note is
  honest, but the table row alone reads as a current claim.
The lesson's "explicitly superseded records" is therefore one-directional: the superseding
row points back, the superseded rows do not point forward. This is the exact residue that
QUALITY 33's red example names. Fix: add a status/used-by back-pointer or a logged old→new
note; do not rewrite the frozen cells.

### F8 — Lesson hash label "184490 B decoded" is ambiguous (low)
`corpus/lessons/round-18.md:41` labels `b5aea…` "(184490 B decoded)". The 184490-byte
artifact is the decompressed HTML body; the `html-text` decode is 40327 chars with sha256
`26a04a2a…98b4d` (dossier `:19-20`). The dossier Gate entry `:86` calls `b5aea…`
"Raw-fetch sha256". A re-fetcher who computes the decode digest gets a different value.
Fix: "184490 B decompressed HTML".

### F9 — Quoted prose differs from the pinned raw line by backticks (low, disclosed in dossier only)
The Gate/lesson quote is the rendered form: "Defaults to true where all the downloads are
accepted." The pinned `params.md:377` at v1.64.0 has "Defaults to `` `true` `` where …". A
mechanical check with the lane's own normalizer:
`--decode none --body pw-params.md --quote '<rendered>'` → `found:false`, exit 1;
with the backticks → `found:true`, offset 15086, exit 0. The dossier discloses this
(`SrcPwDownloads.md:115-119`, "backticks are part of that body"), but the Gate row
(`lessons/round-18.md:41`) does not. The served HTML (sha `b5aea…`) is the quoted
artifact and contains `<code>true</code>`, so the quote is correct for the URL; the
location citation to the raw line is not byte-exact. Fix: note "(backticks in the raw md)"
or cite the rendered page as the quote source and the raw line as the pin.

### F10 — Source note cites a different S063 URL than the registry row (low)
`corpus/knowledge/harness-hardening-round-18.md:5` cites
`https://nodejs.org/docs/v24.21.0/api/process.html#signal-events`; `corpus/SOURCES.md:77`
cites `https://raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/process.md`. The
note's URL does contain the quote after html-text decode (`found:true`, offset 31411,
normalizedLength 128647, exit 0), so it is a valid alternate rendering, not a dead link;
but the note does not cite the row's pinned URL. S059's note adds only the fragment;
S061's extra `class-browsercontext` anchor is grounded by the S061 dossier companion read
(sha256 `6769114c…`); S062/S064 drop only `?format=TEXT`, same blob. Only S063 changes
host/path. Fix: cite the row URL (or list both).

## Verified pass / not findings

- **S058 row mechanics pass:** `teaches` starts `supersedes S057 —`, contains `REJECTED:`
  and `flip:`, status `rejected`; no S058 cell contains `individual publisher`; the
  rejection reason ("adds no invocation contract beyond S041/S048") is supported by the
  dossier's token census (`S058Listing.md:44-48`: `invokeTool` 0, `executeTool` 0,
  `invocationId` 0). The live listing still names Google Ireland, Ltd. and François
  Beaufort.
- **Source note/used-by pass:** `harness-hardening-round-18.md:1-6` cites S059-S064;
  S060's used-by cell resolves; `check-sources.mjs` returns clean, 64 rows, 0 findings.
- **Tier scoping pass for the quoted default:** official Playwright docs pinned by tag
  v1.64.0. The served page declares `docs-version-stable` and
  `<meta name=docusaurus_version content=stable>`, not 1.64.0; the 1.64.0 claim rests on
  `params.md` at the tag, which the dossier's Remaining unknowns discloses.
- **No C1 receipt expected for S060:** new row, outside the 51-row baseline selection.

## Residual unknowns / limits

- The served stable page is not version-pinned; I did not establish which Playwright docs
  release the stable build currently serves beyond `content=stable` and the matching quote.
  The 1.64.0 pin is established by `params.md` at tag v1.64.0.
- The S058 listing is dynamic: my GET returned 695865 B / sha `ed28a12e…`, versus the
  dossier's recorded fetch #4 649152 B / sha `fbc214a8…`. Offsets drift, as the dossier
  warns; I did not launch a browser or hydrate the listing.
- No C2/C3 counters were run; no browser harness; no production edits. Findings are
  source/registry checks only.

## Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/NewS060.md`
