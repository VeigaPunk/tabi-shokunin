# R97Critic3 — controls and do-nothing attack (C1)

Scope: freeze controls `controls/`, scored run `scored/`, instruments
`client/check/negatives-client-oopif-uploadfile-round97.mjs` (sha256s in
`controls/instrument-sha256.txt`, all match current files). Ports 32741-32743
only; scratch `/fast/scratch/hyaku/tabi-r97/R97Critic3` (removed before yield).
No installs (deps reused read-only from `/fast/scratch/hyaku/tabi-r97/deps`).

## Q1 — do-nothing / wrong-instrument receipts scored with the frozen counter

Each forgery below was derived from `controls/receipt-positive.json`, saved as
`w1/R97Critic3-*.json`, and scored in `--receipt` mode
(`--lane`, pin `09f0c2fe…c9e4eb`, `--expect-nonce tabi-r97-ctl-positive`).
Positive control re-scored rc=0 (229 checks, `verdict: clean`).

| forged receipt | what it models | result |
|---|---|---|
| `R97Critic3-islocal-everywhere.json` | Playwright legs run with `isLocal:true` everywhere, trusted events | **rc=1** — `leg-arm` x9 + `child-events` x6 killed |
| `R97Critic3-parent-listener.json` | listeners on parent `#pp`, so child recorded `[]` | **rc=1** — `child-events` x6 killed |
| `R97Critic3-datatransfer-all-untrusted.json` | every upload via page-script `DataTransfer` | **rc=1** — `child-events` x9 killed |
| `R97Critic3-pum-empty.json` | phantom leg empty | **rc=1** — `child-files` (PUM-1) |
| `R97Critic3-plm-trusted-events.json` | ENOENT leg claiming trusted events | **rc=1** — `child-events` (PLM-1) |
| `R97Critic3-puc-clear-missing.json` | clear leg missing 2nd (untrusted) half | **rc=1** — `child-events` (PUC-1) |
| `R97Critic3-islocal-flag-only.json` | `isLocal` flag flipped, events left untrusted | **rc=1** — `leg-arm` (PLX-1) |

In `--live` mode a do-nothing driver is additionally impossible without breaking
`driver-pin`: the counter hashes the driver **before** `spawn`
(check-…:106-109; `counter-driver-pin.json` rc=1 `driver-pin`, driver not run),
generates a fresh `tabi-r97-live-<12 hex>` nonce (`randomBytes(6)`, :110), and
writes the receipt inside `mkdtemp(scratch/receipt-)` with `ports-bound` and
`missing-bound` checks (:184-185). Residual: same-UID `/proc` nonce peek —
already declared as limit 7, not a silent gap.

## Q2 — trusted/untrusted split: client path, not fixture

Probe `R97Critic3-trust-probe.mjs` (output `R97Critic3-trust-probe.out`, rc=0,
no chromium left): two independent listeners on `#s` record `[type, isTrusted]`
plus `e instanceof Event` and `typeof isTrusted`. Both listeners agree on every
leg, and the split reproduces exactly the claimed pattern via the pinned
clients over CDP with the same fixture shape:

- Puppeteer `uploadFile`: `[input T, change T]` (both listeners agree, rc 0)
- Playwright default `setInputFiles`: `[input F, change F]`
- Playwright `connectOverCDP(url,{isLocal:true})`: `[input T, change T]`

The fixture cannot mis-record: `childHtml` registers verbatim
`addEventListener(t, e => push([e.type, e.isTrusted]))` on `getElementById('s')`
(driver :170), and the second listener — which also reads
`Event.prototype.isTrusted` — sees identical values. The counter's exact
equality on `childEvents` means one mis-named listener would fail all 24 legs,
not manufacture a per-client split. Attribution to the client path is
established by the `isLocal` flip alone (only the connect option changes).

## Q3 — setup controls separate host failure from law failure

- **driver exit 3 path**: driver counts `LAUNCH_FAIL` launches and
  `process.exit(launchFailures ? 3 : …)` (:306); counter maps `status===3` →
  `verdict: setup` "host resource failure" (:159). Observed
  `counter-setup-launchfail.json`: `setup`, driver run written (8 legs, 8
  failures, `launchFailures:8`), rc=2. No law conclusion drawn. ✓
- **port release between legs**: `freePort` bind-test + per-leg wait loop up to
  5 s after `killGroup` (driver :279); pre-run freeness check (:143). Busy-port
  control: `setup-busyport` rc=2 `setup` with `free-port precheck … EADDRINUSE`.
  SIGTERM control: rc=2 `setup`, `leftover-chromium=0`, `done
  leftover-chromium-all=0`. ✓
- **15 s launch window** (driver :231, `100×150 ms`, raised from 6 s after
  `probe-a.json` showed 2/24 `devtools endpoint never answered` under load1≈31;
  `probe-b.json` frozen driver 24/24 clean): window is a host-resource knob,
  not a law; exhausted window → exit 3 → `setup`, never `findings`. ✓ Note the
  residual: a >15 s host stall on a *single* leg still exits 3/`setup` (whole
  run, not just that leg) — conservative direction, aligned with the kill rule.

All six `setup` controls in `rc.txt` give rc=2 with `verdict:"setup"` and an
empty findings array (busy port, SIGTERM, no-deps, receipt-is-dir, both
unwritable-scratch variants, launch-fail). No `setup` control ever produced a
law verdict, and no law control produced `setup`.

## Q4 — plan expected verdict vs observed rc

Every row of the plan's controls table matches `rc.txt`, and the required
finding ids are present in the committed JSON: `counter-wrongsite.json` carries
`iframe-targets` (plus `cross-host`, `leg-arm`, `frames`),
`counter-wronglib-live.json` and `counter-tampered-tree-live.json` carry `libs`,
`counter-driver-pin.json` carries `driver-pin`, battery 70/70 killed,
`counter-positive.json` 229 checks `clean`, scored `c1-live.json` 232 checks
`clean`. No divergence found. Check counts reconcile: 24 legs × 9 per-leg
checks + 13 receipt-level = 229; +3 live bindings = 232 (scored value). ✓

Counterexample hunt for hidden regressions found no working alternative:
exact-equality checks on events/files/URLs, arm-labelled legs, fresh-browser
UUIDs, and the tree-sha256 library pin leave no narrower substitute in the
freeze. Scored run `live-receipt.json` spot-checks (PUX-1, PUS-1, PUC-1)
match the predicate verbatim.

VERDICT C1: neutral
