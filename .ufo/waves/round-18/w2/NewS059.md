VERDICT: ISSUES

# NewS059 — falsification of S059 (Playwright launch options) at REV

Seat: `TabiR18.NewS059-2` (leaf; no delegation). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Measured revision: `530f40a9bc3f10436161a2af1ca0fe9bffffc004` (`git rev-parse HEAD`). Date: 2026-10-20.
Read-only: no lane production, fleet, sibling, jj or Git-index edit. `git -C … status --porcelain` prints
only `?? .ufo/waves/round-18/w2/`. All network access was public `curl` GET in a private
`/tmp/tabi-r18-newS059-fetch` sandbox; no browser, no 9222, no real-site page-tool call, no credential
content, no host service, no subagent.

## 0. Verdict summary

S059's source identity and quote are reproducible: page HTTP 200, on-disk 167791 B, sha256
`fc6f6fb986305614673cc0c4f2c899e947c8c2b76a05400fb2be673fd5599a61`; pinned `docs/src/api/params.md` at
tag `v1.64.0` (commit `606ecd8b34bac100db32561b6278ffd76e5eb3cd`) HTTP 200, 86400 B, sha256
`e590b38cb22114bd40086fbb797de7dcad9ac96deb363650f9e344685cf573c9`; quote found at page offset 9268 and
at `params.md:1229`. But the committed row's `teaches` contains a clause the source never states
("disable its handlers only when the harness explicitly owns shutdown"), its anchor/quote cover only
`handleSIGTERM` while `teaches` is plural ("signals", "handlers"), and its numeric anchor range
`params.md:1221-1234` does not cover the `args`/`ignoreDefaultArgs` text the third clause relies on.
Separately, the S058 correction leaves the falsified "individual publisher" premise in S053 and S057
while the lesson claims a full sweep. S059 is therefore not clean as written.

## 1. Commands and observed results

### 1.1 Lane state

```sh
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD
# 530f40a9bc3f10436161a2af1ca0fe9bffffc004

git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain
# ?? .ufo/waves/round-18/w2/
```

### 1.2 S059 page and pinned sources (GET only)

```sh
d=/tmp/tabi-r18-newS059-fetch; rm -rf "$d"; mkdir -p "$d"; cd "$d"
curl -sSL --compressed --max-time 90 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o page.html -w 'page %{http_code} %{size_download}\n' \
  'https://playwright.dev/docs/api/class-browsertype'
# page 200 23336        (compressed transfer; on-disk 167791 B)
sha256sum page.html; wc -c < page.html
# fc6f6fb986305614673cc0c4f2c899e947c8c2b76a05400fb2be673fd5599a61  page.html
# 167791

curl -sSL --compressed --max-time 90 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o params.md -w 'params %{http_code} %{size_download}\n' \
  'https://raw.githubusercontent.com/microsoft/playwright/v1.64.0/docs/src/api/params.md'
# params 200 21032      (on-disk 86400 B)
sha256sum params.md; wc -c < params.md
# e590b38cb22114bd40086fbb797de7dcad9ac96deb363650f9e344685cf573c9  params.md
# 86400

curl -sSL --compressed --max-time 90 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o class-browsertype.md -w 'classtype %{http_code} %{size_download}\n' \
  'https://raw.githubusercontent.com/microsoft/playwright/v1.64.0/docs/src/api/class-browsertype.md'
# classtype 200 4695    (on-disk 15742 B)
# sha256 8964954dff8293e960d5a0760956b72bade8f3e7d90344bebe13a98c7e7e8bc7

curl -sSL --max-time 90 -H 'Accept: application/vnd.github+json' \
  -o tag.json -w 'tag %{http_code} %{size_download}\n' \
  'https://api.github.com/repos/microsoft/playwright/git/ref/tags/v1.64.0'
# tag 200 390
# object.sha 606ecd8b34bac100db32561b6278ffd76e5eb3cd, object.type "commit"
```

The page digest, on-disk byte count and HTTP status exactly match the S059 Gate cell in
`corpus/lessons/round-18.md:40` and the S059 row anchor in `corpus/SOURCES.md:73`. The pinned raw
params digest matches the raw-fetch digest table at `.ufo/waves/round-18/sources/SrcPwLaunch.md:46`.

### 1.3 Quote probes (same normalizer as `recheck-fetch.mjs`)

```sh
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/recheck-fetch.mjs \
  --normalize-only --decode html-text \
  --body /tmp/tabi-r18-newS059-fetch/page.html \
  --quote 'Close the browser process on SIGTERM.'
# {"found":true,"offset":9268,"normalizedLength":32733,"window":"olean (optional) # Close the browser process on SIGHUP. Defaults to true . handleSIGINT boolean (optional) # Close the browser process on Ctrl-C. Defaults to true . handleSIGTERM boolean (optional) # Close the browser process on SIGTERM. Defaults to true . headless ..."}
# exit 0

node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/recheck-fetch.mjs \
  --normalize-only --decode none \
  --body /tmp/tabi-r18-newS059-fetch/params.md \
  --quote 'Close the browser process on SIGTERM.'
# {"found":true,"offset":54480,"normalizedLength":85106,"window":"se at your own risk. ## browser-option-handlesigint - `handleSIGINT` <[boolean]> Close the browser process on Ctrl-C. Defaults to `true`. ## browser-option-handlesigterm - `handleSIGTERM` <[boolean]> Close the browser process on SIGTERM. Defaults to `true`. ## browser-option-handlesighup - `handleSIGHUP` <[boolean]> Close the browser process on SIGHUP. Defaults to `true`. ## browser-option-headless ..."}
# exit 0
```

The quote is 6 words (`Close`/`the`/`browser`/`process`/`on`/`SIGTERM.`), so the Gate's "(6 words)"
is correct.

### 1.4 Exact params.md lines at v1.64.0

```sh
awk 'NR>=1221 && NR<=1234 {printf "%d:%s\n", NR, $0}' params.md
# 1221:## browser-option-handlesigint
# 1222:- `handleSIGINT` <[boolean]>
# 1224:Close the browser process on Ctrl-C. Defaults to `true`.
# 1226:## browser-option-handlesigterm
# 1227:- `handleSIGTERM` <[boolean]>
# 1229:Close the browser process on SIGTERM. Defaults to `true`.
# 1231:## browser-option-handlesighup
# 1232:- `handleSIGHUP` <[boolean]>
# 1234:Close the browser process on SIGHUP. Defaults to `true`.

awk 'NR>=1182 && NR<=1190 {printf "%d:%s\n", NR, $0}' params.md
# 1182:## browser-option-args
# 1183:- `args` <[Array]<[string]>>
# 1185::::warning
# 1186:Use custom browser args at your own risk, as some of them may break Playwright functionality.
# 1187::::
# 1189:Additional arguments to pass to the browser instance. The list of Chromium flags can be found
# 1190:[here](https://peter.sh/experiments/chromium-command-line-switches/).

awk 'NR>=247 && NR<=253 {printf "%d:%s\n", NR, $0}' params.md
# 247:## browser-option-ignoredefaultargs
# 248:* langs: js, python
# 249:- `ignoreDefaultArgs` <[boolean]|[Array]<[string]>>
# 251:If `true`, Playwright does not pass its own configurations args and only uses the ones from [`option: args`]. If an
# 252:array is given, then filters out the given default arguments. Dangerous option; use with care. Defaults to `false`.

awk 'NR>=1289 && NR<=1306 {printf "%d:%s\n", NR, $0}' params.md
# 1289:## shared-browser-options-list-v1.8
# 1290:- %%-browser-option-args-%%
# 1291:- %%-browser-option-artifactsdir-%%
# ...
# 1299:- %%-browser-option-handlesigint-%%
# 1300:- %%-browser-option-handlesigterm-%%
# 1301:- %%-browser-option-handlesighup-%%
# 1302:- %%-browser-option-headless-%%
# 1303:- %%-browser-option-ignoredefaultargs-%%
# ...
```

### 1.5 Page anchors / version marker / occurrences

```sh
grep -o 'id=browser-type-launch-option-handle-sigterm' page.html | wc -l
# 1
grep -o 'id=browser-type-launch-persistent-context-option-handle-sigterm' page.html | wc -l
# 1
grep -o 'id=browser-type-launch-server-option-handle-sigterm' page.html | wc -l
# 1
grep -o '<meta[^>]*docusaurus_version[^>]*>' page.html
# <meta data-rh=true name=docusaurus_version content=stable />
grep -c '1\.64' page.html
# 0
grep -o 'Close the browser process on SIGTERM\.' page.html | wc -l
# 3
grep -c -i 'shutdown' page.html
# 0
```

### 1.6 S058 listing re-open (for the correction check)

```sh
curl -sSL --compressed --max-time 90 \
  -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o listing.html -w 'listing %{http_code} %{size_download}\n' \
  'https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd'
# listing 200 109635    (on-disk 695872 B)
sha256sum listing.html
# 8ad2d7a15dba36f53a3a4d0bdccdea6a4f779a4cb1293fee3b362c5bdb701834  listing.html
# developer value: Google Ireland, Ltd.<br>Gordon House Barrow Street\nDublin 4 D04 E5W5\nIE
# "Offered by" value: François Beaufort
# Version: 1.9.19
# token census: invokeTool=0 executeTool=0 invocationId=0 invoke=0 Invoke=0 toolInvoked=0 toolResponded=0
# floor present: Chrome 150.0.7861.0
# grep -c 'individual publisher' listing.html = 0
```

The fresh listing body is 695872 B and digest `8ad2d7a1…`; S058's recorded fetch #4 was 649152 B,
`fbc214a8…`. The listing rotates per response (S058 dossier §1 observed four distinct digests at
three lengths), so the row's recorded byte offsets identify only that fetch; the facts (developer,
offered-by, version, no invocation token) reproduce.

## 2. Committed claims read at REV

- `corpus/SOURCES.md:73` (S059): source `Playwright launch options — https://playwright.dev/docs/api/class-browsertype`;
  kind `docs`; tier `A`; scope `Signal handling and launch-argument composition at Playwright 1.64`;
  anchor `§launch handleSIGTERM, args, ignoreDefaultArgs; docs/src/api/params.md:1221-1234 at v1.64.0,
  commit 606ecd8b34bac100db32561b6278ffd76e5eb3cd`; teaches `Playwright closes browsers on signals by
  default; disable its handlers only when the harness explicitly owns shutdown; custom arguments
  augment its defaults`; status `mined`; opened `2026-10-20`; recheck `on-release`; used-by
  `corpus/knowledge/harness-hardening-round-18.md`.
- `corpus/lessons/round-18.md:40` (Gate): quote `"Close the browser process on SIGTERM."` (6 words);
  location `§launch options handleSIGTERM (#browser-type-launch-option-handle-sigterm); docs source
  docs/src/api/params.md:1229 at tag v1.64.0 (commit 606ecd8b…); normalize-only found=true, offset
  9268`; sha256 `fc6f6fb9…a61` (167791 B on disk, HTTP 200); dossier pointer
  `.ufo/waves/round-18/sources/SrcPwLaunch.md` §Gate entry lines 123–137.
- `.ufo/waves/round-18/sources/SrcPwLaunch.md`: quote at line 55 (section starts at 53); normalize-only
  output at 78–104; "What it teaches" at 105–109; draft registry row at 111–122 (row at 115); Gate entry
  at 123–137; remaining unknowns at 163–176.
- `corpus/knowledge/harness-hardening-round-18.md`: source list lines 1–6 (S059–S064); S059 signals
  paragraph line 24; arguments paragraph line 25; H1 row line 36; bound line 64. The note's S059
  source line cites `params.md:247-253, 1182-1190, 1221-1234, 1289-1306`, all verified above.
- `corpus/knowledge/source-recheck-round-18.md:102` reproduces S057's anchor cell including
  "(individual publisher)"; `:136` states `S057 still carries the "individual publisher" wording from
  its source cell; the correction to that cell is outside this note.`
- `corpus/lessons/round-18.md:62`: `S058 supersedes S057 in every cell that repeated the unsupported
  publisher classification;`; `:64`: `Old S053/S057 and frozen historical quotations retain their
  bytes as explicitly superseded records.`
- `corpus/SOURCES.md:67` (S053) and `:71` (S057) anchor cells both print
  `Offered by François Beaufort (individual publisher)`.
- `corpus/SOURCES.md:72` (S058) cells: kind `docs`, tier `C`, scope `Listing prerequisites and manual
  execution workflow, not an invocation API`, anchor `Reopened 2026-10-20; Developer card Google
  Ireland, Ltd. at recorded byte 523625; offered by François Beaufort; version 1.9.19; dossier …`,
  teaches `supersedes S057 — REJECTED: listing names developer Google Ireland, Ltd. but adds no
  invocation contract beyond S041/S048; flip: listing or extension source publishes a concrete
  invocation API contract`, status `rejected`, used-by `—`.

Checks that hold: `git cat-file -e 530f40a9…:corpus/knowledge/harness-hardening-round-18.md` exits 0
(the used-by path exists at REV); the note cites S059–S064 at lines 1–6 and uses S059 at lines 24, 36
and 64; S058's `teaches` starts `supersedes S057 —` and contains both `REJECTED:` and `flip:`; S058
has status `rejected`; the fresh listing independently supports the developer/offered-by/version
facts and the absence of `invokeTool`/`executeTool`/`invocationId`.

## 3. Concrete discrepancies

### F1 — S059 `teaches` states a rule the source never states

`corpus/SOURCES.md:73` says: `disable its handlers only when the harness explicitly owns shutdown`.

The source documents only the defaults:

- page: `handleSIGINT` / `handleSIGTERM` / `handleSIGHUP` are `Defaults to true`;
- `params.md:1224`, `:1229`, `:1234`: `Close the browser process on … Defaults to \`true\`.`

It contains no `shutdown` string (`grep -c -i shutdown page.html` = 0; `grep -c -i shutdown params.md` =
0) and no signal-handler disable instruction. The `disable` occurrences in `params.md` are timeout and
viewport options (lines 20, 40, 59, 406, 422, 519, 669, 893, 1066, 1075, 1083, 1089); none is about
SIGINT/SIGTERM/SIGHUP. The "only when" condition is the lane's design rule, not a documented fact.
The dossier's "What it teaches" (lines 105–109) and the note's H1 fix (line 36) use `handleSIG*: false`
as a design action, but the registry row presents the condition as source teaching without an
`[INFERENCE]` marker. The dossier's own remaining unknowns (lines 163–176) do not list this inference;
they list the page-version equality (#1) and the undocumented exit status (#3). This is the
"teaches not overclaimed" failure: the tier-A source supports the documented defaults, not the
"only when the harness explicitly owns shutdown" clause.

### F2 — the anchor/quote are narrower than the plural `teaches`

The row's anchor names only `§launch handleSIGTERM`; `teaches` says `signals` and `its handlers`
(plural). The page documents `handleSIGINT` (`params.md:1224`), `handleSIGTERM` (`:1229`) and
`handleSIGHUP` (`:1234`); the Gate quote is only the SIGTERM sentence. The dossier's draft row
(`SrcPwLaunch.md:111-121`) and the note's line 24 name all three; the committed row dropped
`handleSIGINT`/`handleSIGHUP` from its anchor text. The numeric range `1221-1234` does include those
lines, but the row's text and the Gate quote do not; a reader of the row alone cannot verify the plural
claim. This is an under-anchoring/precision defect, not a false source claim.

### F3 — the numeric anchor range does not cover `args` / `ignoreDefaultArgs`

The row anchor is `docs/src/api/params.md:1221-1234`. The `args` section is `1182-1190`; the
`ignoreDefaultArgs` section is `247-253`; the shared list is `1289-1306`. The row's third clause
`custom arguments augment its defaults` depends on the `ignoreDefaultArgs` text at `:251`:
`If \`true\`, Playwright does not pass its own configurations args and only uses the ones from
[\`option: args\`]`. The dossier's supporting passages (lines 71–76) and draft row cite `247-253` and
`1182-1190`; the note's line 1 cites `247-253, 1182-1190, 1221-1234, 1289-1306`. The committed row's
numeric range covers only the signal options, and the Gate entry's location cites only `1229`. The row
names the sections in prose, so this is a provenance gap rather than a false assertion, but the line
anchor does not ground one of the three taught clauses.

### F4 — the Gate quote stops before the clause that grounds "by default"

`corpus/lessons/round-18.md:40` records `"Close the browser process on SIGTERM."` (6 words). The actual
`params.md:1229` line is `Close the browser process on SIGTERM. Defaults to \`true\`.` The quote is
verbatim as a prefix, and the location line contains the default, but the 6-word quote alone does not
distinguish a default of `true` from `false`; the row's `teaches` says `by default`. The sibling S060
Gate quote at `:41` includes `Defaults to true where all the downloads are accepted.` (16 words); S059
could have used the 10-word `Close the browser process on SIGTERM. Defaults to \`true\`.` The dossier's
normalize-only window (lines 78–104) does show `Defaults to true .` after the quoted sentence, but the
Gate cell does not. This is a quote/teaches binding weakness, not a fabricated quote.

The raw-vs-rendered difference is only in the omitted continuation: raw `params.md:1229` has backticks
around `true`; the page normalization renders `Defaults to true .` (space before the period). The
quoted 6 words themselves are identical in both, so the recorded quote does not "differ by backticks";
it simply excludes the words that would.

### F5 — the S058 correction leaves the falsified publisher premise in S053/S057

`corpus/SOURCES.md:67` and `:71` both still contain `Offered by François Beaufort (individual
publisher)`. `corpus/lessons/round-18.md:62` says `S058 supersedes S057 in every cell that repeated the
unsupported publisher classification`. S058 is a new row; it did not and cannot rewrite S057's cells.
The source-recheck note itself records the gap at `:136`: `S057 still carries the "individual
publisher" wording from its source cell; the correction to that cell is outside this note`, and `:102`
reproduces the S057 anchor with that wording. S058's own row (`SOURCES.md:72`) contains no such phrase,
and its `teaches` opens `supersedes S057 —`, which is exactly what the D4 counter scans; the D4 rule
(`PLAN.md` C3 d4) checks only `S058` cells, so the stale S053/S057 premise passes the counter.

The fresh listing confirms the classification is false: `Offered by` is `François Beaufort`, `Developer`
is `Google Ireland, Ltd.`, version `1.9.19`, and the literal `individual publisher` does not occur
(`grep -c` = 0). The correction row is append-only and the old rows are "retained as superseded"
(`round-18.md:64`), but the lesson's claim of a sweep "in every cell" is false as written, and S053's
rejection reason (`individual-publisher extension listing …`) remains a live unsupported reason in a
rejected row. This is the "correction leaves an unsupported premise in another cell" finding.

### F6 — S058's Gate quote is normalized (`<br>`/newlines), not byte-contiguous

`corpus/lessons/round-18.md:39` records `"Google Ireland, Ltd. Gordon House Barrow Street Dublin 4 D04
E5W5 IE"` (12 words) under a table headed `Located quote (verbatim, ≤25 words)`. The served bytes are
`Google Ireland, Ltd.<br>Gordon House Barrow Street\nDublin 4 D04 E5W5\nIE`; the quote flattens the
`<br>` and newlines to spaces. The S058 dossier §4 calls it `flattened`, and the shared normalizer
would collapse whitespace, but the lesson's "verbatim" is true only after that normalization, not of
the byte stream. This is the quoted-markup difference the brief asks about; for S059's 6-word quote
there is no such difference, while its omitted `Defaults to \`true\`` does differ by backticks between
raw Markdown and rendered page.

### F7 — minor: S058 changes the same URL's `kind` from `tool` to `docs`

S053 and S057 classify the Chrome Web Store URL as `tool`; S058 classifies the same URL as `docs`. The
S058 dossier's "Why tier C and kind docs" argues the listing is a tool's own prerequisites
documentation, but the committed row does not state that rationale. This is a taxonomy inconsistency,
not a false claim; the tier `C` and the rejection/flip themselves are correct.

### F8 — S059 version provenance

The live page has `<meta data-rh=true name=docusaurus_version content=stable />` and zero occurrences of
the substring `1.64`; the v1.64.0 pin comes from `docs/src/api/params.md` at tag `v1.64.0` (commit
`606ecd8…`, sha256 `e590b38…`, 86400 B). The Gate entry records the unversioned page's digest
`fc6f6fb…` and the commit, but not the `params.md` digest; the dossier records it. The row's scope
`at Playwright 1.64` is supported by the pinned raw, and the quote exists in both, so the claim holds;
the limit is that the Gate's digest identifies the unversioned page, while the line anchor (`1229`)
is in the raw artifact. A re-fetcher of the page alone can locate the quote (offset 9268) but cannot
verify the exact v1.64.0 line without the pinned raw. This is a provenance limit, not a false claim.

## 4. What holds (so the source itself is not rejected)

- Page: HTTP 200, 167791 B, sha256
  `fc6f6fb986305614673cc0c4f2c899e947c8c2b76a05400fb2be673fd5599a61`; quote found at offset 9268 of
  32733 normalized chars, exit 0.
- Pinned `params.md` at v1.64.0: HTTP 200, 86400 B, sha256
  `e590b38cb22114bd40086fbb797de7dcad9ac96deb363650f9e344685cf573c9`; quote found at offset 54480 of
  85106 normalized chars, exit 0; line 1229 is exactly
  `Close the browser process on SIGTERM. Defaults to \`true\`.`.
- Tag `v1.64.0` resolves to commit `606ecd8b34bac100db32561b6278ffd76e5eb3cd` (GitHub API, type
  `commit`), matching the row and Gate.
- `handleSIGTERM` anchors exist for `launch`, `launchPersistentContext` and `launchServer` (one each).
- The note cites S059–S064 at lines 1–6, the used-by path exists at REV, and the note's S059 ranges
  (`247-253`, `1182-1190`, `1221-1234`, `1289-1306`) are accurate. The note's coreBundle claim is
  also accurate: installed Playwright 1.64.0 has `lib/coreBundle.js` with the `--user-data-dir` throw
  at line 44749 and the `--remote-debugging-pipe` throw at line 44750; Node v24.21.0
  `doc/api/process.md:756-759` matches the note's listener-removal sentence.
- S058 rejection reason and flip are present and supported: the fresh listing has developer Google
  Ireland, Ltd., offered-by François Beaufort, version 1.9.19, the Chrome 150.0.7861.0 floor, and no
  invocation tokens (`invokeTool=0`, `executeTool=0`, `invocationId=0`, `invoke=0`, `Invoke=0`,
  `toolInvoked=0`, `toolResponded=0`).

## 5. Finite limits

- One GET per URL; no repeat-fetch stability claim for the page. The page is the unversioned stable
  docs channel (`docusaurus_version=stable`, no `1.64` substring); only the pinned raw proves the
  v1.64.0 line.
- The Chrome Web Store listing rotates per response: fresh body 695872 B / `8ad2d7a1…`, versus S058's
  recorded 649152 B / `fbc214a8…`; S058's byte offsets are valid only for its recorded fetch. The
  fresh body's `Google Ireland, Ltd.<br>Gordon House Barrow Street\nDublin 4 D04 E5W5\nIE` is
  normalized by the quote, not byte-contiguous.
- Only unrendered HTML/Markdown was read; no browser hydration, no page JavaScript, no real-site page
  tool, no credential/session content, no 9222.
- No production, fleet, sibling, jj or Git-index write; no subagent dispatch. The only lane write is
  this report.
- A broad `grep` for `1.69.2`/`1.69.3` in `page.html` matched SVG path data, not version markers; it is
  not evidence that the page documents 1.69.

## 6. Recommendation (for the L1; this seat does not edit production)

1. S059 `teaches`: remove or mark `[INFERENCE]` the `disable its handlers only when the harness
   explicitly owns shutdown` clause, or move it to a design note with the note's bounds; name
   `SIGINT`/`SIGTERM`/`SIGHUP` explicitly in the `teaches`/anchor rather than the generic plural.
2. S059 anchor: add `params.md:1182-1190` (args), `:247-253` (ignoreDefaultArgs) and, if the shared
   list is used, `:1289-1306`; the current `1221-1234` covers only the signal options.
3. S059 Gate: use the 10-word quote `Close the browser process on SIGTERM. Defaults to \`true\`.` or
   state plainly that the default is on line 1229; record the pinned `params.md` sha256
   `e590b38…` in the Gate entry, not only the unversioned page digest.
4. S058 correction: either amend `round-18.md:62` to say `S058's cells carry none of the classification;
   S053/S057 retain their bytes as superseded records`, or open a correction row for S053 as well and
   make D4 scan the retained S053/S057 cells; do not claim "every cell" was swept while `SOURCES.md:67`
   and `:71` still say `individual publisher`.
5. If the Gate table's `verbatim` is literal, record the S058 `<br>`/newline flattening there (the
   dossier already notes it); if the normalizer is the standard, say `normalized` in the table header.

## Files written

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/NewS059.md`
