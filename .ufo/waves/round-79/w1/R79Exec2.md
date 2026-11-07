# R79Exec2 — leg (b) cold runs 3 & 4 + space-scratch absolute-path run

Seat: executor. Assignment: two more frozen-driver cold runs (nonces `tabi-r79-cold3-80830674d421` on ports 18954/18955, `tabi-r79-cold4-80830674d421` on ports 18956/18957), score both with the frozen counter (`--prior` = committed (a) receipt), plus one run with `--scratch` under a path containing a space (TMPDIR/HOME unchanged). Driver pin verified before every run: `scripts/chrome-cdp-showpicker-round79.mjs` sha256 `e9c87159e5d5212237437eb7a80a2d26fcd8086603dae1e37db64ce1aaf94933` = freeze.txt pin. No tool installs performed (none needed; pacman guard respected).

## Final per-run results (receipts L1 may commit — both counter-clean)

| run | nonce | driver exit | counter | checkCount | findings | fixture sha256 | receipt |
|---|---|---|---|---|---|---|---|
| cold3 (attempt 3) | `tabi-r79-cold3-80830674d421` | 0 | exit 0, verdict clean | 56 | none | `dcce513fcc497379bae1d1ba14894c47ee96646343d2c212dfd1f7c44b596f6e` | `.ufo/waves/round-79-seats/R79Exec2/cold3-receipt.json` |
| cold4 (attempt 2, scratch = `/fast/scratch/hyaku/tabi-r79/R79Exec2/scratch with space`, TMPDIR/HOME unchanged) | `tabi-r79-cold4-80830674d421` | 0 (0 recorded leg failures) | exit 0, verdict clean | 56 | none | `90afbe00077ce534c7a42f255ec45fb65e7d01c4a988b781bac897a43df98fd7` | `.ufo/waves/round-79-seats/R79Exec2/cold4-receipt.json` |

Both receipts: 10/10 legs, zero recorded failures, viewport 1280×900, host Chromium 155.0.8059.84 Arch Linux, distinct ports per assignment, fresh launch tokens/browser ids (replay checks against the committed prior and the prior-set probes all passed). Counter invocation for both finals used the committed prior set + `--prior <committed receipt>` + `--tree-exempt-sha256 <sha256 of the committed receipt bytes>` (see attack finding A2 for why the exemption is required).

**Space-path run verdict: PASS.** The driver's absolute-path handling survives a scratch path containing a space: driver exit 0, counter clean 56/56. Profile dirs were actually created under the space path (`home-*` dirs observed there at run time).

## Honest refusals during this seat (leg (b) failure material)

5 driver executions total; 3 honest refusals (driver exit 1, failures recorded, receipt still written — the driver's refuse-don't-forge behavior works):

| attempt | nonce | exit | recorded drive errors | receipt (preserved) |
|---|---|---|---|---|
| cold3 attempt 1 (parallel launch) | cold3 | 1 | `no-response-30000ms Runtime.evaluate` on `sp-cdp-gesture`, `sp-disabled` | `cold3-receipt.attempt1.json` |
| cold4 attempt 1 (parallel launch, space scratch) | cold4 | 1 | same on `sp-cdp-gesture`, `sp-multiple-show` | `cold4-receipt.attempt1.json` |
| cold3 attempt 2 (serial) | cold3 | 1 | same on `sp-cdp-gesture`, `sp-intercept-off-click-then-show` | `cold3-receipt.attempt2.json` |

Counter findings on the refused receipts cascade from the truncated leg records: `leg-records`, `leg-marks`, `plan-calls`, `leg-sp-cdp-gesture`, `leg-sp-disabled` / `leg-sp-multiple-show` / `leg-sp-intercept-off-click-then-show`, `activation-law`, `immutable-law` (attempt 1 cold3 only), `no-selection-law`, `cancel-law` (attempt 2 cold3 only), `host-argv`, `devtools-port-binding`, `replay-devtools-url`, plus `prior-set-complete`/`prior-set-unmatched-exempt` artifacts explained under A2/A3.

## Driver flake characterization (A1 — the one real leg-(b) risk)

- Trigger: a per-leg `Runtime.evaluate` gets no CDP response for 30 s (`drive-error: no-response-30000ms Runtime.evaluate`). In every hang the leg's showPicker call itself had already succeeded and the chooser had fired; the hang lands on the post-picker activation/state evaluates.
- `sp-cdp-gesture` hung in 3 of 4 runs that included it (attempt 3 passed it). Every hung run had exactly 2 hung legs; every run where `sp-cdp-gesture` passed was fully clean (attempt-2 cold4: 10/10).
- Not explained by my parallel launch alone: the serial cold3 attempt 2 still hung. Not explained by the space scratch: the space-scratch run passed clean while the plain-scratch cold3 failed twice.
- Net: intermittent, roughly 50–75% per run in this window; a rerun clears it. L1 should expect refusals in leg (b) until this is root-caused; target "zero honest refusals in ≥4 fresh cold runs" is achievable but only with retries in the current state. R79Exec1 was warned via peer message.

## Post-fix re-scoring (counter fixed at the instrument, D 3a1209c0d624)

The planner seat fixed the counter mid-wave (new digest `0dc76277a870f71d21e0bc4e840246b85831b2dbed6e659ad270df3043cd3f76`, pinned in freeze.txt; digest commit `3a1209c0d624da517c7a0b45249551faa2fae711`; driver pin unchanged `e9c87159…`). Both final receipts re-scored with the assigned command **alone** (no `--tree-exempt-sha256`): cold3 exit 0 verdict clean 56 checks 0 findings; cold4 exit 0 verdict clean 56 checks 0 findings. Outputs: `cold3-counter-postD3a12.json`, `cold4-counter-postD3a12.json`. These are the authoritative verdicts for my finals.

Addendum: the (a) receipt was regenerated again (18:29:08, 110208 B, sha256 `708bc934e9d110a20f5957bdeeda7e36c2235008986e8854da00f71255d1f00d`, nonce `tabi-r79-l1-f154beeff14e`, fixture `69de1a78…`, digest commit `f154beeff14e…`; counter and driver digests unchanged). Both finals re-scored with the assigned command alone against these bytes: exit 0, verdict clean, 56 checks, 0 findings (`cold{3,4}-counter-f154beef.json`). The standing result is verified against the newest committed bytes.

Note for L1: my final nonces embed the original D (`…-80830674d421`); whether leg (b) wants fresh nonces under D `3a1209c0d624` is the planner's call. The driver is unchanged and still pinned, and the receipts remain counter-clean under the current instrument and current committed (a) bytes.

## Attack findings on the frozen instruments (no amendments proposed)

- **A2 — counter gap vs its own header sentence (FIXED at the instrument mid-wave).** Against the pre-fix counter (digest `4072031b…`), the walk-completeness set was built only from prior-set file entries; `--prior` receipts were parsed for replay checks yet never added to that set, so scoring a seats-dir receipt while the committed (a) receipt sits in the evidence tree tripped `prior-set-complete` naming the committed receipt. The fixed counter (digest `0dc76277…`, line 460) now builds the set from `[...priorPaths, ...extraPriors.map(abs)]` ("a --prior receipt that sits in a walked tree is a prior, not an unlisted receipt"); the interim workaround `--tree-exempt-sha256 <sha256 of the committed receipt>` is no longer needed. Both final receipts score clean 56/56 under the assigned command alone.
- **A3 — mid-wave receipt rewind breaks content-bound exemptions; mtime is not a change signal.** The committed (a) receipt changed bytes three times in my seat window: 18:08 `6d243c77…` (110071 B, nonce `tabi-r79-l1-80830674d421`, fixture `2e80efa0…`) → 18:19 `bda38512…` (108106 B) → later `f5c17f66…` (current bytes, nonce `tabi-r79-l1-3a1209c0d624`, fixture `32751f03…`) with mtime pinned at 18:19:38.795630086 and size pinned at 108106 across the last two states. Stale exemption hashes trip `prior-set-unmatched-exempt` (observed); mtime/size comparison would have missed the last change. Hash at scoring time.
- Fixture sha256 differs per run (`dcce…`, `90af…`, scored `2e80…`/rewritten bytes): the fixture hash covers the per-run origin (port in origin), so cross-run fixture equality is not expected; each counter scoring must pass the receipt's own fixture sha256 as `--expect-fixture-sha256`, as the counting command's `<fixture sha256 of that receipt>` placeholder says.

## Bounds compliance

- All JSON/receipt outputs under `.ufo/waves/round-79-seats/R79Exec2/` only: `cold{3,4}-receipt.json` (finals), `cold3-receipt.attempt{1,2}.json`, `cold4-receipt.attempt1.json`, `cold{3,4}-counter.json`, `cold{3,4}-counter.err`, `cold{3,4}-driver.{out,err}`. Nothing written into `.ufo/waves/round-79/` or `corpus/evidence/round79/` except this prose report at the two seat-named paths.
- No git/jj mutations, no commits, no subagents, no `agent://all`. Scratch root `/fast/scratch/hyaku/tabi-r79/R79Exec2/` (incl. `scratch with space`) deleted before yield; receipts were written straight into the seat dir by `--out`, so nothing needed copying.
