# R98Reviewer — instrument code review (round 98, C1)

Seat: R98Reviewer. Instruments: `client-oopif-uploadmodes-round98.mjs` (driver,
sha256 f8e95a98…092aa2), `check-…` (e55581ea…), `negatives-…` (9475fd90…),
`livekillers-…` (940712bd…). What I did: `node --check` on all four (all OK),
receipt-mode counter on controls/receipt-positive.json (rc 0, clean, 253 checks),
20-case mutant probe on the counter (below), negatives battery re-run (87/87,
rc 0 — `R98Reviewer-negatives.json`), and one `--live --reps 1` run on ports
33661-33663 (`R98Reviewer-live-reps1.json` + `R98Reviewer-live-receipt.json`:
rc 0, clean, 96 checks, all 8 arms as the predicate states; no chromium left on
the cdp port). Scratch cleaned; evidence copied under `.ufo/waves/round-98/w1/`.

## Findings

**should-fix — counter: driver exit 3 (launch failure on a subset of legs) is
laundered into `setup`, not `findings`.** Driver L348 exits 3 if *any* leg hit
`launchFailures`, even when 23 of 24 legs completed and the receipt is complete
with real law violations. Counter L165 maps status 3 → `refuse` (exit 2,
verdict `setup`) without reading the receipt. A law failure co-occurring with
one bad launch therefore never becomes a finding. The plan §Controls expects
this for the chromium-cannot-start control (all legs fail), but the mapping is
over-broad: it cannot distinguish "host resource" from "one leg's launch failed
while others measured the law". At minimum the counter should inspect the
receipt when status is 3 and only refuse if the receipt shows all (or the
launch-failed) legs carrying `LAUNCH_FAIL` errors. Severity: should-fix — needs
a law failure *and* a launch failure on the same run, and the scored run was
clean, so C1 is not currently mis-scored.

**should-fix — driver: `launchFailures` counts a launch failure and also a
DevTools timeout as the same host-resource signal, but the thrown leg error is
then recorded in `leg.error`/`failures` and the receipt is still written; the
counter never sees it (see above).** Driver L263/L269: launch throw and
`devtoolsVersion()` null both increment `launchFailures` and throw
`LAUNCH_FAIL…`. That matches the frozen comment (L66) but the counter's blanket
`setup` verdict (above) means a *single* flaky leg converts the whole 24-leg
run into `setup` rather than a finding. In the scored run this did not happen;
asymmetric with the timeout-widening note at L240-241 (15 s window), where a
recovered launch is fine but a genuinely slow one is still fully masked.

**should-fix — driver: `SETTLE_MS=400` race and read-then-events order.**
Driver L304-312: sleep 400 ms, then read `childFiles`, then `childEvents`, then
`childRead` (which itself calls `fl[0].text()`). Two properties hold and one
does not. (a) The read cannot fire an event on `#s` (no listener on read;
`File.text()` is not a user-gesture event) — good. (b) Events are read *before*
the read, so a click event from e.g. a test harness click cannot land inside the
recorded list after the files read — but `childEvents` is a second `evaluate`
after `childFiles`, so an event arriving between the two evaluates (e.g. a
browser-synthesised click, or a delayed second `input` from a r200-path client)
would be recorded against a files snapshot that predates it. In practice the
upload is CDP-synchronous and 400 ms dwarfs the dispatch latency here (my
`--reps 1` live run reproduced the exact lists), but the instrument does not
guarantee the ordering it claims; a 400 ms settle is a heuristic, not a barrier,
and no test in the battery mutates the *gap* (e.g. throttled timers). Nit
rather than blocker: the frozen predicate only requires the exact lists, and
both my live run and the scored run hit them.

**should-fix — counter: iframe-target check tolerates extra fields and does not
pin `type`.** Counter L228: requires `length===1`, `isObj(its[0])`, `url`
equal, non-empty string `targetId`. My mutant `extra-field` (added `extra:1`)
and `type` changes passed rc 0. The frozen sentence says "exactly one iframe
target … with url = the child URL" — the counter enforces that, but a target
with a spoofed `type`/`extra` state that still carries the right URL passes.
Not a law break (the URL is the sealed part), but narrower than "the
browser-level iframe-target list holds exactly one target" if `targetId`
content beyond non-emptiness is meant to be trusted.

**should-fix — driver finally: `client.close()` on Playwright connect legs
kills the runner-started browser through the client; Puppeteer connect legs
disconnect, but `client.contexts()[0]` for Playwright connect legs is never
closed and the context is left open when `client.close()` is called.** Driver
L316: Playwright (launch or connect) always `client.close()`, which for a
`connectOverCDP` client closes the browser it attached to — correct here
because the runner-started chromium is per-leg and is also group-killed (L318)
and swept (L319). But the `ctx` from L280 is never closed; on connect legs it
is the browser's default context. Leak is bounded (one context per leg, browser
killed immediately after), yet on the launch legs the `newContext()` of a
client-launched browser is also never closed before `client.close()`. No
observed leak in my live run; still, a context that outlives `newPage()` close
is not exercised/checked.

**nit — driver: Puppeteer `launch` passes `userDataDir: prof` but Playwright
`launch` has no `userDataDir`; its profile lands via `TMPDIR=<scratch>/t`
(L164) only if Playwright honours `TMPDIR` (it does on Linux; the plan's limit
7 states it). The `/proc` sweep (L170-178) and the counter's sweep (L141) only
match `--user-data-dir=<scratch>/` — a Playwright launch profile under
`<scratch>/t/` is *not* matched by either sweep unless Chromium is launched
with an explicit `--user-data-dir`. Playwright launches use a temp dir under
`TMPDIR`, so a hung Playwright-launch chromium would be swept by neither the
driver's per-leg `sweep()` (L319) nor the counter's `sweepChromium()` (L159).
My live run left none behind (Playwright `close()` reaps it), but the sweep
coverage claimed in the comments ("client-launched ones included", L166) is
incomplete for the Playwright launch arms. The counter's final `rmSync(driverScratch)`
removes files but does not reap a live process; `pgrep` showed none after my
run.

**nit — counter: `liveMissing` binds `missingPath` to the *driver scratch*, and
`missing` check (L202) independently requires `missingPath` absolute with the
right basename, so a receipt that relocates both the path and the PLLM error
message consistently (mutant m18) is correctly killed only by `missing-bound`
in `--live` mode; in `--receipt` mode it passes** (verified: m18 killed in
receipt mode as well only because I also left `PLLM-2/3` errMessages pointing
at the old path). This is the declared limit 6 (receipt mode is forgeable) and
is not a defect, but the counter's `outcome` check for PLLM builds the expected
ENOENT from the *receipt's* `missingPath` (L233), so the law is self-consistent
rather than pinned to the driver's scratch in receipt mode. Expected per the
frozen text (limit 6), noted for completeness.

**nit — counter: `leg-label`/`leg-arm` build expected URLs from the receipt's
lev port fields; swapping http/child ports and rewriting all leg URLs
consistently (m4) still fails via `frames`/`iframe-targets`, so the binding is
not to the `--ports` argv in receipt mode.** Same limit-6 note; no live-mode
issue since `ports-bound` (L190) pins them.

Everything else challenged was sound (named because the assignment asked):
- `node --check` all four pass; sha256s match claims.json.
- Live-killer anchors each occur exactly once (counter L189-191 vs the
  harness's `neutral` strings; driver L348/L341/L184) and the harness's
  neutralisation (`check('<id>', true, …)`) provably kills each mutant — the
  committed `livekillers.json` shows 3/3 with frozen rc 1 and neutralised rc 0,
  and my anchor grep reproduces the same single-occurrence counts. The
  neutralised counter passing for the *wrong* reason was the concern to rule
  out: it only passes because the neutralised check is the sole failing one —
  the mutant receipts otherwise score clean (K-exit receipts are the
  control's clean receipt with a different exit code; K-ports/K-missing change
  one receipt field each and I verified the blast radius is only the bound
  check).
- `receipt-unreadable` (L176-179) prints a `findings` verdict and exits 1, not
  `setup` — a corrupt receipt is a finding, correct polarity.
- Driver pin mismatch in `--live` (L112-115) exits 1 with `driver-pin` before
  running the driver; `setup` refusals carry `verdict: setup` + exit 2 and are
  distinct from findings. Launch-failure laundering (first finding above) is
  the one exception.
- Per-leg order (`await sleep(SETTLE_MS)` before `childFiles`) means a *late*
  event (after the 400 ms settle) is missed by design; the predicate asserts
  exactly the two events within the window, and the scored + my live runs both
  produced exactly that. No evidence of a missed late event; noted as a
  heuristic, not a defect.
- Nonce/port validation, `freePort` precheck, `/proc` ancestor-writability
  guard, signal handlers in both driver and counter, and the counter's
  `fs.rmSync(driverScratch)` are all present and behaved in my runs.
- Negatives battery covers the r63 polarity classes and R97Mut M40/M42/M66;
  m6/m7/m19 confirm `failures`/`leg-set` fail closed (null reports never
  silently pass).

## Verdict basis

No `--live` run I executed falsifies any leg-level statement of the predicate,
and no count re-derived differs (24 legs, 8 arms × 3 reps, 96 checks at reps 1 /
253 implied at reps 3 in the control receipt). The defects above are
operability/robustness issues in the frozen instruments (mostly around exit-3
masking and sweep coverage), not counterexamples to the frozen sentence on this
host. Evidence: `R98Reviewer-live-receipt.json` (my live run, clean),
`R98Reviewer-live-reps1.json` (counter JSON), `R98Reviewer-negatives.json`.

VERDICT C1: neutral
