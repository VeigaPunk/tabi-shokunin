# SrcPwLaunch — Playwright BrowserType launch/launchPersistentContext options

Seat: TabiR18.SrcPwLaunch. Lane tip at work time: `2bff864fdfee684ddbcd066cc8e735adaba2735c`
(`git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse --verify refs/heads/master`).
Scope: C2 operand sources for the hardened harness (PLAN H1, H3, S1). Draft only — the L1 assigns the
final row id.

## Source identity

- Canonical URL: https://playwright.dev/docs/api/class-browsertype
- Access date: 2026-10-20 (single fetch; body kept only long enough to digest and probe).
- Kind: `docs`. Tier: **A**, scoped to *Playwright's own documented defaults for the two launch
  entry points this lane calls (signal handling and launch-argument composition)*. Not A for
  Playwright's internal default switch list (see Remaining unknowns).
- Revision: the page is the unversioned **stable** docs channel — `<meta name=docusaurus_version
  content=stable>`, no version string in the body. Matching source pinned at the installed version:
  installed Playwright is **1.64.0** (`npm ls -g --depth=0` prints `playwright@1.64.0`; the round-17
  harness pin is `scripts/webmcp-invoke-round17.mjs:78` `const PLAYWRIGHT_REQUIRED = '1.64.0';`).
  `https://api.github.com/repos/microsoft/playwright/git/ref/tags/v1.64.0` resolves to commit
  `606ecd8b34bac100db32561b6278ffd76e5eb3cd` (type `commit`).
- Fetch (read-only GETs, curl into /tmp, deleted after):

```
curl -sSL --compressed --max-time 90 -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o /tmp/r18pw-browsertype.html -w '%{http_code} %{size_download}\n' \
  'https://playwright.dev/docs/api/class-browsertype'
# -> 200 23336        (size_download = compressed transfer; on-disk body 167791 B)

curl -sSL --compressed --max-time 90 -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o /tmp/r18pw-class-browsertype.md -w '%{http_code} %{size_download}\n' \
  'https://raw.githubusercontent.com/microsoft/playwright/v1.64.0/docs/src/api/class-browsertype.md'
# -> 200 4695          (on-disk 15742 B)

curl -sSL --compressed --max-time 90 -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o /tmp/r18pw-params.md -w '%{http_code} %{size_download}\n' \
  'https://raw.githubusercontent.com/microsoft/playwright/v1.64.0/docs/src/api/params.md'
# -> 200 21032         (on-disk 86400 B)
```

- Raw-fetch digests (sha256 of the bytes as stored, before any decode):

| body | bytes (on disk) | sha256 |
|---|---|---|
| `r18pw-browsertype.html` | 167791 | `fc6f6fb986305614673cc0c4f2c899e947c8c2b76a05400fb2be673fd5599a61` |
| `class-browsertype.md` @v1.64.0 | 15742 | `8964954dff8293e960d5a0760956b72bade8f3e7d90344bebe13a98c7e7e8bc7` |
| `params.md` @v1.64.0 | 86400 | `e590b38cb22114bd40086fbb797de7dcad9ac96deb363650f9e344685cf573c9` |

- Decoded digests for the HTML page (`decode=html-text`, same decoder as `recheck-fetch.mjs`;
  no base64 was involved anywhere):
  decoded text 37337 B sha256 `038e2809d48812711ed8c9e3d16098f987d0048a5b698f33023223f3a0f21853`;
  normalized text 32733 chars sha256 `b4019142f13278cb4536bc7f89b3e79ab9b2bd5bb37ff518cd17ae4caf5f3963`.

## Quote (row-grounding)

> Close the browser process on SIGTERM.

- 6 words; verbatim after `html-text` normalization of the fetched page.
- Location: §launch options → `handleSIGTERM` (`#browser-type-launch-option-handle-sigterm`);
  the same three options render again under `#browser-type-launch-persistent-context-option-handle-sigterm`
  (and under `launchServer`). Docs source: `docs/src/api/params.md:1229` at tag v1.64.0
  (`## browser-option-handlesigterm` at 1226; `handleSIGINT` text at 1224, `handleSIGHUP` at 1234).
- The shared option list that `BrowserType.launch` expands is
  `params.md:1289` `## shared-browser-options-list-v1.8`, which includes `args` (1290),
  `handleSIGINT`/`handleSIGTERM`/`handleSIGHUP` (1299-1301) and `ignoreDefaultArgs` (1303).

### Supporting passages actually read on the page (not the row quote)

- `handleSIGINT`: "Close the browser process on Ctrl-C. Defaults to `true`."
- `handleSIGHUP`: "Close the browser process on SIGHUP. Defaults to `true`."
- `ignoreDefaultArgs`: "If `true`, Playwright does not pass its own configurations args and only uses
  the ones from [`option: args`]. ... Dangerous option; use with care. Defaults to `false`."
  (`params.md:247-253`; the `launch`/`launchPersistentContext` JS option includes this block —
  see `class-browsertype.md:323` and `:360`.)
- `args`: "Additional arguments to pass to the browser instance. The list of Chromium flags can be
  found [here]." preceded by the warning "Use custom browser args at your own risk, as some of them
  may break Playwright functionality." (`params.md:1182-1190`).

## Normalize-only output (primary quote, page)

```
$ node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/recheck-fetch.mjs \
    --normalize-only --decode html-text --body /tmp/r18pw-browsertype.html \
    --quote 'Close the browser process on SIGTERM.'
{"found":true,"offset":9268,"normalizedLength":32733,"window":"olean (optional) # Close the browser process on SIGHUP. Defaults to true . handleSIGINT boolean (optional) # Close the browser process on Ctrl-C. Defaults to true . handleSIGTERM boolean (optional) # Close the browser process on SIGTERM. Defaults to true . headless boolean (optional) # Whether to run browser in headless mode. More details for Chromium and Firefox . Defaults to true . ignoreDefaultArgs boolean | Array < string > (opti"}
exit=0
```

Same quote against the pinned docs source (`--decode none`):

```
{"found":true,"offset":54480,"normalizedLength":85106,"window":"se at your own risk. ## browser-option-handlesigint - `handleSIGINT` <[boolean]> Close the browser process on Ctrl-C. Defaults to `true`. ## browser-option-handlesigterm - `handleSIGTERM` <[boolean]> Close the browser process on SIGTERM. Defaults to `true`. ## browser-option-handlesighup - `handleSIGHUP` <[boolean]> Close the browser process on SIGHUP. Defaults to `true`. ## browser-option-headless - `headless` <[boolean]> Whether to run browser in headless mode. More details for Chrom"}
exit=0
```

Supporting-quote probes on the page (`--decode html-text`), both exit 0:

```
--quote 'Playwright does not pass its own configurations args'
{"found":true,"offset":9523,"normalizedLength":32733,"window":". headless boolean (optional) # Whether to run browser in headless mode. More details for Chromium and Firefox . Defaults to true . ignoreDefaultArgs boolean | Array < string > (optional) # If true , Playwright does not pass its own configurations args and only uses the ones from args . If an array is given, then filters out the given default arguments. Dangerous option; use with care. Defaults to false . logger Logger (optional) # Deprecated The l"}

--quote 'Additional arguments to pass to the browser instance'
{"found":true,"offset":7391,"normalizedLength":32733,"window":"fferences for Linux users. Arguments options Object (optional) args Array < string > (optional) # warning Use custom browser args at your own risk, as some of them may break Playwright functionality. Additional arguments to pass to the browser instance. The list of Chromium flags can be found here . artifactsDir string (optional) # If specified, artifacts (traces, videos, downloads, HAR files, etc.) are saved into this directory. The directory is n"}
```

## What it teaches the C2 hardened harness (one line)

Playwright closes the browser on SIGINT, SIGTERM and SIGHUP by default and treats `args` as additions
to its own switches, so an abort path must own those signals (pass `handleSIG*: false`, kill the
browser itself, write `run_aborted`, exit 2) and audit the composed effective argv rather than assume it.

## Draft registry row (11 cells, id placeholder per ticket)

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S0?? | Playwright BrowserType launch and launchPersistentContext options — https://playwright.dev/docs/api/class-browsertype | docs | A | Playwright 1.64 documented defaults for the two launch entry points this lane calls: signal handling and launch-argument composition | stable docs channel fetched 2026-10-20 (no version marker), §launch options handleSIGINT handleSIGTERM handleSIGHUP with anchors browser-type-launch-option-handle-sigint, -sigterm, -sighup and the same three under launch-persistent-context, §args, §ignoreDefaultArgs; docs/src/api/params.md:1221-1234, 1289-1306, 1182-1190 and 247-253 at tag v1.64.0 commit 606ecd8b34bac100db32561b6278ffd76e5eb3cd | Playwright closes the browser on SIGINT, SIGTERM and SIGHUP by default and treats args as additions to its own switches, so an abort path must own those signals and audit the composed argv | queued | 2026-10-20 | on-release | — |

Id note: the `S0??` placeholder is the ticket's own instruction ("ids are assigned by the L1 — use
`S0??`"), and every sibling sheet in `.ufo/waves/round-18/sources/` keeps the same placeholder.
At write time S058Listing.md claims S058; SrcPwDownloads.md and SrcNodeSignals.md both name S059 as
the expected first C2 id, so this row cannot pre-claim S059 without a collision. L1 assigns the id
and must replace `S0??` before `node scripts/check-sources.mjs` (the placeholder trips `bad_id`).

## Gate entry

- URL: https://playwright.dev/docs/api/class-browsertype
- Access date: 2026-10-20
- Revision: Playwright docs stable channel (unversioned page); source pinned to microsoft/playwright
  tag `v1.64.0` = commit `606ecd8b34bac100db32561b6278ffd76e5eb3cd` (installed `playwright@1.64.0`,
  pin `scripts/webmcp-invoke-round17.mjs:78`).
- Quote: "Close the browser process on SIGTERM." — §launch options `handleSIGTERM`
  (`#browser-type-launch-option-handle-sigterm`), docs source `docs/src/api/params.md:1229`
  at tag v1.64.0.
- Raw-fetch sha256: `fc6f6fb986305614673cc0c4f2c899e947c8c2b76a05400fb2be673fd5599a61`
  (167791 B on disk; HTTP 200).
- Normalize-only: found=true, offset 9268 (JSON above).
- Tier A, scoped; kind `docs`; recheck `on-release`.
- Teaches (one line): see "What it teaches" above.

## PLAN §C2 consistency check

No contradiction of PLAN §C2's design (H1, H3, S1). Observed support and the exact places the design
depends on this page:

- H1: the page documents `handleSIGINT`/`handleSIGTERM`/`handleSIGHUP` defaults as `true` for
  `launch`, `launchPersistentContext` and `launchServer`. At B the harness calls
  `chromium.launchPersistentContext(profile, {...})` at
  `scripts/webmcp-invoke-round17.mjs:600` with **no** `handleSIG*` options and the file contains no
  `process.on`/`SIG*` handler at all (`grep -n "SIG[A-Z]*\|process\.on\|process\.once"
  scripts/webmcp-invoke-round17.mjs` → no output), so Playwright's own handlers are live at B.
  The page does **not** state the resulting process exit code, so "B exits non-2 / writes no
  receipt" is `[INFERENCE]` until the C2 probe runs; the design's own-signal-and-exit-2 path is
  compatible with the documented defaults and requires `handleSIG*: false`.
- H3: unrelated to this page's signal text; B also passes `--remote-debugging-port=0`
  (`scripts/webmcp-invoke-round17.mjs:91`, used at `:599`), which is the H3 red artifact — the
  page's `args` passage ("Additional arguments ... at your own risk") is why H3's replacement path
  must be a composed-argv decision, not a doc default.
- S1: the page confirms `args` are *additive* to Playwright's "own configurations args" and that
  `ignoreDefaultArgs` replaces them ("Dangerous option; use with care"). It does **not** enumerate
  those defaults, so "exactly one `--enable-features=`" cannot be grounded here — it must be
  grounded by the shipped switch list or by the effective-argv audit the B harness already performs
  (`readProcArgv` defined at `scripts/webmcp-invoke-round17.mjs:227`, used for the effective argv at `:618`).

## Remaining unknowns

1. The docs page carries no version marker; equality with v1.64.0 is established by the five option
   passages matching `params.md` at tag v1.64.0, not by an exhaustive page diff (`[INFERENCE]` for
   the rest of the page).
2. This page does not list Playwright's default Chromium switches (count of `--enable-features=`,
   presence of `--remote-debugging-pipe`). S1's "exactly one" needs the installed source (another
   C2 seat's source) or the runtime argv audit.
3. The page states "Close the browser process on ..." but never the Node process exit status;
   the H1 red-at-B exit code remains to be observed by the C2 probe.
4. Whether Chromium temp `org.chromium.Chromium.*` directories are removed on those signal paths is
   not documented here; H2 stays probe-grounded.
5. One fetch only. A re-fetch may differ if the docs site is rebuilt; the digest above covers the
   bytes probed on 2026-10-20.

## Files written

- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/sources/SrcPwLaunch.md
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/SrcPwLaunch.md
