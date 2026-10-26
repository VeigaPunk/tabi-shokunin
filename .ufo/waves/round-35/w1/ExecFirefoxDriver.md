# ExecFirefoxDriver — round 35 w1, item C2 build (Firefox BiDi driver + two-run receipt)

**Verdict.** The lane now has a Firefox WebDriver BiDi driver and a two-run receipt that the frozen
C2 counter admits: at my scratch commit `245c4c6140aed4712a273b0dfca277b933d287fa` (parent = freeze
`a4bfef0f75027c915e715649950b1d46dcb33d83`) `c2-firefox-bidi.mjs` returns **admitted 16, failing 0,
unmeasured 1 (R16), binding null, receiptFinding null, entryFinding null, predicate true, exit 0**
on Firefox 158.0.1 / geckodriver 0.37.1. Every clause of the ticket holds: the driver imports only
`FIXTURE_SHA256, VIEWPORT, serveFixture` from the gate (driver line 50), it is not a copy of the
counter or of `liveRecordFirefox`, geckodriver is launched with `--port`/`--websocket-port` on free
ports (9222 refused explicitly, line 116/132), enum HOME/TMPDIR/XDG under a throwaway dir, two
cold runs, and the receipt is `tabi-bidi-receipt-v1` with the four prescribed fields. All four
sessions I recorded (run1, run2, the counter's live session, and an extra re-run) produced the same
first screenshot, `7a3ae6a9…bfd02`, 9,451 B, 640x480 — which is also the digest the frozen
pre-data instrument check recorded. Nothing outside my scratch clone and my output dir was written;
the lane checkout, the counter, the gate and the fleet repo are untouched; no browser or driver
process of mine survives.

## Evidence — commands and exit codes

All commands ran in `$S=/fast/scratch/hyaku/tabi-r35/ExecFirefoxDriver`, clone at
`$S/clone` (`git -C $S/clone rev-parse --show-toplevel` → `$S/clone`).

| # | command | exit |
|---|---|---|
| 1 | `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone && git -C $S/clone checkout --detach a4bfef0f75027c915e715649950b1d46dcb33d83` | 0 |
| 2 | `sha256sum clone/scripts/check-bidi-runtime.mjs clone/.ufo/waves/round-35/counters/c2-firefox-bidi.mjs` → `370e8e95…6c87` and `7cc7f17f…954e`, equal to `claims.json` §frozenDigests | 0 |
| 3 | `TMPDIR=$S/tmp node scripts/bidi-firefox-loopback-round35.mjs --out corpus/evidence/round-35/bidi-firefox` | 0 |
| 4 | predicate pre-check of both transcripts with the gate's own `recordFromTranscript` + `PREDICATES` | 0 (all `null`, R16 `no-bidi-counterpart`) |
| 5 | `node scripts/check-sources.mjs` → `SOURCES_GATE verdict=clean rows=134 tiers=A:119,B:6,C:9 status=queued:15,mined:110,rejected:9 findings=0` | 0 |
| 6 | `git -C $S/clone commit` (driver, receipt, 2 transcripts, entry, S134 row, lesson Gate table) → `245c4c61…` | 0 |
| 7 | `TMPDIR=$S/tmp/c2 node $D/.ufo/waves/round-35/counters/c2-firefox-bidi.mjs --rev 245c4c6140aed4712a273b0dfca277b933d287fa --repo $D --json` | **0** |
| 8 | `TMPDIR=$S/tmp node scripts/bidi-firefox-loopback-round35.mjs --out …/bidi-firefox-repro` (re-runnability) | 0 |
| 9 | `pgrep -af 'geckodriver|firefox-158'` after the runs | only another seat's `SentinelFirefoxEgress` processes; none of mine |

Counter output (step 7, `counter-check.json`):

```
predicate=true rev=245c4c61… population=17 admitted=16 failing=0 unmeasured=1
entryFinding=null receiptFinding=null binding=null
live: browserName=firefox browserVersion=158.0.1 geckodriverVersion=0.37.1
      firstShotSha256=7a3ae6a9b0d65497f52ec1ed6ddea1970e32025e0fb8a36d2debdfc201cbfd02
      commands=28 events=20
provenance run1 sessionId=bc272ba1-5207-4ac5-abe5-3b55b9ac708f contexts=[9ae9d179-…]
provenance run2 sessionId=08b0adaa-2476-439d-a46c-8db47f3baf6f contexts=[06873c30-…]
```

Per-row reason, every row of the entry table:

```
R1 admitted   R2 admitted   R3 admitted   R4 admitted   R5 admitted   R6 admitted
R7 admitted   R8 admitted   R9 admitted   R10 admitted  R11 admitted  R12 admitted
R13 admitted  R14 admitted  R15 admitted  R16 unmeasured (verdict `no — no BiDi command`)
R17 admitted
```

No row has a reason (`x1`/`x2`/`x3`/`x4`/`t1`/`t2`/`t3`/`l1`) — `failing 0`.

## What the driver is (file:line in `bidi-firefox-loopback-round35.mjs`)

- **Gate allow-list, nothing else** — `:50` `import { FIXTURE_SHA256, VIEWPORT, serveFixture } from "./check-bidi-runtime.mjs";`.
  No import of `liveRecord`, `PREDICATES`, the gate default export, or the C2 counter.
- **geckodriver launch** — `:132` `spawn(geckodriver, ["--port", …, "--websocket-port", …, "--binary", firefox, "--profile-root", profiles])`, detached, env `HOME/TMPDIR/XDG_{CONFIG,CACHE,DATA,STATE,RUNTIME}_DIR` inside a per-run `mkdtemp`, `MOZ_HEADLESS=1`, `LC_ALL=C.UTF-8`.
- **9222 refusal** — `:116` `if (port === 9222 || wsPort === 9222) throw new Refusal("refusing the 9222 CDP lease port")`.
- **classic bootstrap** — `:170` records `{"seq":1,"dir":"http-res","path":"/session","body":<new-session response>}`; `:179-186` refuse a session whose `sessionId` is not a UUID, whose `webSocketUrl` is not loopback/`…/session/<sessionId>`, or whose caps lack `browserVersion`/`moz:geckodriverVersion`.
- **recorded wire order** — `:212` records the `send` line before `ws.send`; the `onmessage` handler records every `recv`; `:228` `waitEvent` with an event cursor, so no event is consumed twice.
- **recipe in the gate's `liveRecord` order** — subscribe → getTree → setViewport(640x480) → addDataCollector → navigate `/a.html` → await `window.__ready` → `window.innerWidth` → **first** `captureScreenshot` at `:264` (asserted PNG 640x480 at `:265-272`, before any input) → locate `#h`/`#t`/`#b` → pointer click `#t` → keys `tabi` → read `#t` → click `#b` → read `#out` → fetch `/data.txt` → `network.getData` (asserted `=== DATA_TEXT`) → `storage.getCookies` → intercept `/data.txt?held=1` → `continueRequest` → navigate `/b.html` → `traverseHistory -1` → `location.pathname` → alert → `handleUserPrompt accept`.
- **two cold runs and the receipt** — `:398-425`: fresh geckodriver + profile + HOME per run, equal `browserVersion`, equal `moz:geckodriverVersion`, equal first-screenshot digest, then `receipt.json` = `{schema:"tabi-bidi-receipt-v1", fixtureSha256, browserVersion, driver, driverSha256, runs:[{name, transcript, transcriptSha256}]}` plus `geckodriverVersion`, `browserName`, `firstScreenshotSha256`, `binaries`, and each run's `observed` steps.
- **write scope / limits in the header** — `:1-48`, including "never writes the lane tree" and "two headless cold runs on one host build".

## Files delivered in this directory

| file | sha256 |
|---|---|
| `bidi-firefox-loopback-round35.mjs` (destined for lane `scripts/`) | `f95dac5e696ce56fd4af9071d154fe8510cf0ad277fc825711d75a0da9c9fd25` (= receipt `driverSha256`) |
| `run1.jsonl` (77 lines: 1 new-session + 28 sends + 48 recvs) | `b916c5df2245b856dc3537544af5b052f345b965fdc7098d9f28faab7ceacbfc` |
| `run2.jsonl` | `af84675fc57f1c7c18c1a1e36cbf70a2384a81257e7e5eef37d3d53e3c77d2dc` |
| `receipt.json` (as finally produced) | `e7818ce665d43bcd3fbd773775c38cd54bff6ece17b5b3043261ead3c7118393` |
| `counter-check.json` (step 7, JSON) | `72f2f1ab57ef698383b776e273cac81159826ddbdebfef84f4f98ecc9f8fb079` |
| `behaviours.md` — geckodriver/Firefox behaviours accommodated | — |
| `entry-webdriver-bidi-firefox-runtime-round-35.md` (destined for `corpus/knowledge/`) | — |
| `lesson-round-35-gate-only.md` (my `## Gate` block for `corpus/lessons/round-35.md`) | — |
| `sources-row-S134.txt` (the 11-cell SOURCES row, to append after S133) | — |
| `commit.txt` (clone commit, parent, diffstat) | — |
| `repro-rerun-NOT-COMMITTED/` — a third/fourth invocation, evidence only, do not commit | — |

`receipt.json`'s `driver` paths and transcript paths are lane-relative (`scripts/bidi-firefox-loopback-round35.mjs`,
`corpus/evidence/round-35/bidi-firefox/runN.jsonl`), so the files must land at exactly those paths.

## Entry, sources, lesson (integration notes for the L1)

- Entry `corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md`: front-matter HTML comment,
  `source: S134 …` (`:5`), `verified-at` (`:6`), `recheck` (`:7`), §1 what was run, §2 the required
  table whose header is exactly `Row | Surface | BiDi method | Measured | Evidence` with R1–R17
  (R16 `no — no BiDi command`), §3 what each `yes` does not show, §4 unknowns, §5 limits, §6
  rejected, §7 what the runs carried that the predicates do not read.
- SOURCES row S134 (11 cells, `mined`, `opened 2026-10-26`, `recheck 90d`, used-by the entry) was
  appended at the end of the registry (after S133, before `## Paths`); `check-sources.mjs` is clean
  with it in place. **Merge note:** if another seat also adds a row, keep registry order and keep
  `check-sources.mjs` at exit 0.
- `corpus/lessons/round-35.md` does not exist at the freeze; my copy is a whole-file stub carrying
  only the `## Gate` section and S134's table row (`lesson-round-35-gate-only.md`). **Merge note:**
  merge its `## Gate` row into the consolidated round-35 lesson; the counter only requires a
  `## Gate` table row for S134 with an https URL on the same host as the registry row and a 64-hex
  sha256, which the row carries.

## Fetch receipts (QUALITY 93; read-only HTTPS GETs, `curl -q -sS --proto =https`)

| URL | UTC | status | bytes | sha256 |
|---|---|---|---|---|
| https://firefox-source-docs.mozilla.org/testing/geckodriver/Flags.html (**S134**) | 2026-10-26T21:16:34Z (a probe-batch fetch of the same URL earlier in the hour produced byte-identical content) | 200 | 41,404 | `2b023afe95704e47f815352693b7da17348a45165bebbde2ab850b0f87ada2bc` |
| https://firefox-source-docs.mozilla.org/remote/index.html | 2026-10-26T21:12:05Z | 200 | 28,453 | `4b009a43299cb215645e6b802e9d35d59c1b24c5e10c97ad557175a52c54311c` |
| https://firefox-source-docs.mozilla.org/remote/WebDriver-BiDi.html | 2026-10-26T21:12:05Z | 404 | 361 | n/a (404; first body line `<html>`) |
| https://firefox-source-docs.mozilla.org/testing/geckodriver/Capabilities.html | 2026-10-26T21:12:18Z | 200 | 31,324 | `e596eee24f6a6ead555ce8aa6a8846a2ffe3c57a94e33e79a0372f984f06a842` |
| https://firefox-source-docs.mozilla.org/testing/geckodriver/Usage.html | 2026-10-26T21:12:18Z | 200 | 36,447 | `34641c5ef42361435e25849d88365e116609886e8c0a6534d88e70f19259fa58` |
| https://firefox-source-docs.mozilla.org/remote/webdriver-bidi/index.html | probe batch (status/bytes printed, no per-fetch timestamp) | 404 | 387 | n/a (404) |
| https://firefox-source-docs.mozilla.org/remote/WebDriver-BiDi/index.html | probe batch | 404 | 387 | n/a (404) |
| https://firefox-source-docs.mozilla.org/testing/geckodriver/index.html | probe batch | 200 | 27,695 | `98ea88d17618260338eff2c5516a2a232d5fd725f4bc3974a91fbc7b506a0fe6` |
| https://firefox-source-docs.mozilla.org/testing/geckodriver/Profiles.html | probe batch | 200 | 31,511 | `be5a9c2870fa3857806e7440f5a9be197100a2c50286f1e4083e2255e650f26d` |

Only S134's page is mined in the registry. The probe fetches were URL discovery; the 404s are
recorded by status, byte count and first body line, not by sha. The geckodriver
`Capabilities.html` page does **not** mention `webSocketUrl` (0 matches), which is why the S134
anchor is the flags page and not the capabilities page — recorded so no later seat re-derives the
wrong claim from a title.

## Behaviours accommodated (detail in `behaviours.md`)

geckodriver's BiDi port defaults to 9222 (S134) → pinned free port, 9222 refused; Firefox serves no
BiDi itself → geckodriver brokers, `DELETE /session/<uuid>` plus a process-group kill to reap the
browser; UUID session/context/`sharedId` shapes (a Chromium-shaped check refuses these
transcripts); `network.getData` returns `{type:"string"}` here, not base64; Firefox names headers
as plain strings and types their values; Firefox fetches `favicon.ico` on its own (404 from the
fixture, three per run); prompts need `unhandledPromptBehavior: "ignore"` and carry
`handler:"ignore"`; `traverseHistory` replaces the realm, so `location.pathname` is read in a
recorded retry loop (first attempt sufficed in both runs); the first screenshot is deterministic
per build (9,451 B, 640x480, `7a3ae6a9…`) and must be taken at exactly the gate's recipe point;
`--binary` on geckodriver's argv selects Firefox; `/session` is polled for up to 20 s.

## Risks / what this does not establish

- **Binding is engine-local and build-local.** The first-screenshot binding holds on this host
  build across four sessions; a font stack, renderer or DPI change would break it, and that is the
  frozen counter's behaviour, not something a driver can absorb. Rows say nothing about other
  Firefox/geckodriver builds, headed mode or a third engine.
- **The receipt proves form.** Two distinct transcripts with real session ids, a real driver digest
  and a build-bound first screenshot; the capability verdict rests on the counter's own live
  session, which is why the driver is kept re-runnable (`--out`, `--geckodriver`, `--firefox`) and
  was re-run here (digest `7a3ae6a9…` again, distinct transcript digests each time).
- **Transcript contents** carry the classic new-session body verbatim: a dead loopback
  `sessionId`/`webSocketUrl`, a deleted scratch `moz:profile`, and `moz:geckodriverVersion`. No
  credential or session material of any real site, and no off-loopback URL was navigated.
- **No lane edits.** I did not write the lane checkout, its index, its jj state, the fleet repo,
  the counters or the gate; I installed and upgraded no tool (both binaries were already present at
  the ticket's paths and are recorded by `--version` in the receipt).
- **R16 stays unmeasured** by construction; a `yes` there is refused by the counter.

Scratch `$S` (clone, fetch files, tmp) was deleted after these receipts were copied here.
