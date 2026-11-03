# R56Scout — C2 chromium control-keys recon

Seat: R56Scout (wave w1, round 56). L1 integration owner: TabiR56.
Lane base: `faee4cb27982388b18e9a45f292cdfb9dfd1ebc8`. No repo script written; no frozen
text changed; nothing committed.

**Verdict: recon complete, C2 mechanics are portable and MEASURED GREEN on this host.**
Three changes must land in the r56 runner (real binary, data:-target creation, verbatim
key mappings) and one teardown guard is mandatory. Details and evidence: `scout/recon.md`.

## Deliverables (all absolute paths, all under the scout dir)

| Path | Contents |
|---|---|
| `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/scout/launch-probe.json` | launch/discovery/argv/census/teardown, **survivors 0** |
| `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/scout/recon.md` | (a) 100 r55 check ids → Chromium mechanics, (b) reuse table by function+line, (c) what must differ |
| `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/scout/control-leg-dryrun.json` | End / Backspace+restore / Tab / Enter measured on Chromium 155 |
| `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/scout/portability-micro.json` | wrapper path, `--disable-extensions`, `PUT` vs `GET /json/new` |
| `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/scout/portability-direct.json` | real-binary path, no injected `--load-extension` |
| `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/scout/history-shape.json` | reuse `about:blank` vs `PUT /json/new?about:blank` |
| `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/scout/history-data-target.json` | `PUT /json/new?<data:url>` → `data:` at history slot 0 |
| `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/scout/leak-bare.json` / `leak-guarded.json` | crash-leak measurement (11 survivors bare / 0 guarded) |
| `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-56/scout/*.mjs.txt` | the six throwaway drivers, verbatim |

## Acceptance

- **launch-probe.json exists with survivors 0** — yes. `postKillSweepCount: 0`,
  `survivors: 0`, mid-run canned 11 processes, killed by explicit pid, one sweep round to 0.
- **recon.md names every r55 check id** — all 100 (`schema` … `hostsrc-pin-mismatch`),
  extracted programmatically from `.ufo/waves/round-55/counters/webview2-receipt-r55.mjs`
  in source order with line numbers, verified 0 missing.

## Key measurements

- `Chromium 155.0.8059.84 Arch Linux`; `/json/version.Browser` = `Chrome/155.0.8059.84`
  (**no `Edg/`**), Protocol-Version `1.3`, UA `HeadlessChrome/155.0.0.0 … X11; Linux x86_64`.
- Discovery: `<profile>/DevToolsActivePort` (root, **not** `EBWebView/`), first line port,
  second line `/devtools/browser/<uuid>`, found in 103 ms; the stderr `DevTools listening on
  ws://…` line is also present, so both r46 discovery legs work.
- Effective child line differs from the spawn argv when launching `/usr/bin/chromium`
  (14,424-byte Arch launcher): it injects `--ozone-platform=wayland`,
  `--load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url`,
  `--disable-features=Vulkan`. `--disable-extensions` does **not** remove the injected
  `--load-extension` (`containsLoadExtension: true`). Launching
  `/usr/lib/chromium/chromium` directly gives argv exactly as passed
  (`containsLoadExtension: false`).
- `PUT /json/new` → 200; `GET /json/new` → **405** `This action supports only PUT verb.`
- A `background_page` extension target (`chrome-extension://nkeimhogjdpnpccoofpliimaahmaaome/…`)
  is present even with the real binary and `--disable-extensions`; target selection must
  filter `type === 'page'` **and** the expected URL.
- Control leg on Chromium, all green: `valueAfterEnd === nonce` with caret `[25,25]`
  (End's movement half is observable here, unlike r55); Backspace residue exactly 24/25
  chars; restore exact; Tab `field → field2`; Enter → `/echo?field=<nonce>&mixed=<UPPER>`
  served in 100–101 ms, exact query, `#echoed` renders the nonce; page keylog 58→62 (+4).
- `journey-history` predicate is reachable without touching it: creating the target at the
  nonce `data:` URL yields `entriesLength 4 / currentIndex 3 / urls[0] data:…` at C, the
  r55 numbers exactly. Reusing `about:blank` (either as the profile's page or via
  `PUT /json/new?about:blank`) gives `urls[0] = about:blank` — that would be RED.

## Commands run (exit codes)

All under `TMPDIR=/fast/scratch/hyaku/tabi-r56/R56Scout`.

1. `/usr/bin/chromium --version` → 0
2. `node launch-probe.mjs …` → **0** (survivors 0)
3. `node control-leg-dryrun.mjs …` (1st) → **1**, verbatim:
   `Error: {"code":-32602,"message":"Invalid parameters","data":"Failed to deserialize params.code - BINDINGS: string value expected at position 67"}`
   (my mapping omitted the `'-'` branch; this run also leaked its tree — see below)
4. `node control-leg-dryrun.mjs …` (2nd) → 0 (typing inserted nothing: I typed before
   focusing; my probe's ordering bug, not a Chromium one)
5. `node control-leg-dryrun.mjs …` (3rd) → **0**, all control witnesses true
6. `node portability-micro.mjs …` → 0
7. `node portability-direct.mjs …` → 0
8. `node history-shape.mjs …` (1st) → 0
9. `node history-shape.mjs …` (2nd, + pre-data walk) → 0
10. `node history-data-target.mjs …` → 0
11. `node leak-observer.mjs … bare` → 0, survivors **11**
12. `node leak-observer.mjs … guarded` → 0, survivors **0**
13. `ps -eo pid=,args= | grep tabi-r56-` → 0 hits (final state)

`git` was not run at all: no read-only or mutating git subcommand was needed.

## Red / adverse results, verbatim

- Run 3 above (the `-32602`). Cause: `codeFor` without a `'-'` branch sends `code: null`.
  The nonce shape `tabi-r56-<hex>` carries dashes; r55's `codeFor`/`vkFor` (L492–493)
  already carry it and **must be reused verbatim**.
- **Leak, self-inflicted and disclosed.** Run 3 died *after* Chromium was up; the tree was
  never swept. `ps` later showed 10 live processes with token
  `tabi-r56-dry-a2c6b5e6caf5`; I killed exactly those 10 pids and the final global grep is 0.
  Measured class: bare crash → 11 survivors; with
  `process.on('exit'|'uncaughtException')` → token census → SIGKILL, → 0. The r56 runner
  MUST install the sweep as a process-level guard right after `spawn`; `teardown-survivors`
  grades a field that a bare crash under-reports as 0.
- `history-shape.json.reuseWithPreData` is contaminated (the same target walked twice:
  `entriesLength 8` at C). The decisive measurement is `history-data-target.json`, a fresh
  target. Recorded, not deleted: it is what a naive "navigate to `data:` first"
  implementation produces.

## Residuals for the L1

- These measurements prove the **mechanics**, not the claim: the dry-run nonce
  (`tabi-r56-60242f101056c63f`) and fixture port differ from the data run's. C2 still
  needs the committed runner against the committed counter.
- Freeze decisions the counter must make, each named in `recon.md` §2: the
  `hostsrc-pin` → effective-argv pin substitution, the `runtime-pin-host-drift`
  could-not-evaluate class being **absent** on Linux (not inherited), and whether the
  boot `data:` page should carry the nonce title so slot 0 is auditable.
- My scratch (`$HYAKU_SCRATCH/tabi-r56/R56Scout/`, 167 MB, 19 profile dirs) is left in
  place per the seat contract; no scratch exists under `/tmp`.
- No tools were installed or upgraded this seat.
