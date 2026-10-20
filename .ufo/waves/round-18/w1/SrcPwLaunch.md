VERDICT: PASS

# SrcPwLaunch — Playwright BrowserType signal/argument options (C2 source)

Draft source sheet: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/sources/SrcPwLaunch.md`.
Lane tip at work time: `2bff864fdfee684ddbcd066cc8e735adaba2735c`
(`git -C LANE rev-parse --verify refs/heads/master`). No installs or upgrades were made; no pacman.
No git writes, no jj, no background jobs.

## Observed facts

- Canonical source opened 2026-10-20: https://playwright.dev/docs/api/class-browsertype
  (stable docs channel; `<meta name=docusaurus_version content=stable>`, no version string in body).
- Installed Playwright = **1.64.0**: `npm ls -g --depth=0` prints `playwright@1.64.0`, matching the
  round-17 pin `scripts/webmcp-invoke-round17.mjs:78` `const PLAYWRIGHT_REQUIRED = '1.64.0';`.
- Matching docs source pinned at the installed tag: `microsoft/playwright` **v1.64.0** =
  commit `606ecd8b34bac100db32561b6278ffd76e5eb3cd`
  (`https://api.github.com/repos/microsoft/playwright/git/ref/tags/v1.64.0`, object.type=commit).
- Fetches were real curl GETs into /tmp (HTTP 200 each), deleted afterwards:
  - page: 167791 B on disk, sha256 `fc6f6fb986305614673cc0c4f2c899e947c8c2b76a05400fb2be673fd5599a61`
    (curl `%{size_download}` 23336 = compressed transfer).
  - `docs/src/api/class-browsertype.md` @v1.64.0: 15742 B, sha256
    `8964954dff8293e960d5a0760956b72bade8f3e7d90344bebe13a98c7e7e8bc7`.
  - `docs/src/api/params.md` @v1.64.0: 86400 B, sha256
    `e590b38cb22114bd40086fbb797de7dcad9ac96deb363650f9e344685cf573c9`.
  - Decoded page (`html-text`) 37337 B sha256
    `038e2809d48812711ed8c9e3d16098f987d0048a5b698f33023223f3a0f21853`; normalized 32733 chars
    sha256 `b4019142f13278cb4536bc7f89b3e79ab9b2bd5bb37ff518cd17ae4caf5f3963`. No base64 decode was used.
- Quote (6 words, verbatim after html-text normalization): "Close the browser process on SIGTERM."
  Location: §launch options `handleSIGTERM` (`#browser-type-launch-option-handle-sigterm`, also rendered
  under `launch-persistent-context`); source `docs/src/api/params.md:1229` at tag v1.64.0.
  Normalize probe (`--normalize-only --decode html-text`) → `{"found":true,"offset":9268,
  "normalizedLength":32733,...}`, exit 0; same quote in `params.md` (`--decode none`) → found at 54480,
  exit 0 (full JSON in the source sheet).
- Page also states (probed, exit 0): `handleSIGINT` "Close the browser process on Ctrl-C"; `handleSIGHUP`
  "Close the browser process on SIGHUP"; both "Defaults to `true`". `ignoreDefaultArgs`: "If `true`,
  Playwright does not pass its own configurations args and only uses the ones from `args` ... Dangerous
  option; use with care." `args`: "Additional arguments to pass to the browser instance" plus the
  "Use custom browser args at your own risk" warning (`params.md:1182-1190`).

## What it teaches the hardened harness (one line)

Playwright closes the browser on SIGINT, SIGTERM and SIGHUP by default and treats `args` as additions
to its own switches, so the abort path must own those signals (`handleSIG*: false`, kill the browser,
write `run_aborted`, exit 2) and audit the composed effective argv rather than assume it.

## Draft registry row (id placeholder `S0??`, L1 assigns)

`| S0?? | Playwright BrowserType launch and launchPersistentContext options — https://playwright.dev/docs/api/class-browsertype | docs | A | Playwright 1.64 documented defaults for the two launch entry points this lane calls: signal handling and launch-argument composition | stable docs channel fetched 2026-10-20 (no version marker), §launch options handleSIGINT handleSIGTERM handleSIGHUP with anchors browser-type-launch-option-handle-sigint, -sigterm, -sighup and the same three under launch-persistent-context, §args, §ignoreDefaultArgs; docs/src/api/params.md:1221-1234, 1289-1306, 1182-1190 and 247-253 at tag v1.64.0 commit 606ecd8b34bac100db32561b6278ffd76e5eb3cd | Playwright closes the browser on SIGINT, SIGTERM and SIGHUP by default and treats args as additions to its own switches, so an abort path must own those signals and audit the composed argv | queued | 2026-10-20 | on-release | — |`

Id is the ticket's `S0??` placeholder, matching every sibling sheet in `.ufo/waves/round-18/sources/`.
Observed at write time: S058Listing.md claims S058; SrcPwDownloads.md and SrcNodeSignals.md name S059
as the expected first C2 id, so this row does not pre-claim it. L1 assigns and must replace `S0??`
before `node scripts/check-sources.mjs` (placeholder trips `bad_id`).

## Gate entry

- URL https://playwright.dev/docs/api/class-browsertype · access 2026-10-20 · no page version marker;
  pinned to v1.64.0 commit `606ecd8b34bac100db32561b6278ffd76e5eb3cd`.
- Quote "Close the browser process on SIGTERM." at §launch options handleSIGTERM
  (`#browser-type-launch-option-handle-sigterm`), source `docs/src/api/params.md:1229` @v1.64.0.
- Raw sha256 `fc6f6fb986305614673cc0c4f2c899e947c8c2b76a05400fb2be673fd5599a61` (HTTP 200).

## PLAN §C2 consistency

No contradiction. It supports the design and names where the doc stops:
- H1: at B the harness launches via `chromium.launchPersistentContext` (`scripts/webmcp-invoke-round17.mjs:600`)
  with no `handleSIG*` options and the file has no `process.on`/`SIG*` handler
  (`grep -n "SIG[A-Z]*\|process\.on\|process\.once" scripts/webmcp-invoke-round17.mjs` → no output), so
  Playwright's default-true handlers are live. The exit code produced by its handler is not documented
  on this page, so "B exits non-2 / no receipt" stays `[INFERENCE]` until the C2 probe observes it.
- H3: B passes `--remote-debugging-port=0` (`scripts/webmcp-invoke-round17.mjs:91`, used at `:599`),
  the H3 red artifact; the page's `args` warning makes the pipe switch an argv-composition decision.
- S1: the page says `args` are additive and that `ignoreDefaultArgs` replaces Playwright's own args
  ("Dangerous option; use with care"), but it does not enumerate those defaults, so "exactly one
  `--enable-features=`" cannot be grounded from this page — needs the shipped switch list
  (another C2 source) or the effective-argv audit the harness already does (`scripts/webmcp-invoke-round17.mjs:227` definition, called at `:618`).

## Remaining unknowns

- Page unversioned: v1.64.0 equality is shown by the five option passages matching `params.md` at the
  tag, not an exhaustive diff (`[INFERENCE]` for the rest).
- Playwright's default Chromium switch list is not on this page (S1 grounding gap).
- Node exit status on those Playwright-handled signals is not documented here.
- Chromium temp-dir cleanup on those signal paths is not documented (H2 stays probe-grounded).
- One fetch only; a later re-fetch may differ if the site is rebuilt.

## Files written

- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/sources/SrcPwLaunch.md
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/SrcPwLaunch.md
