# R91Exec1 — C1 cold-run reproduction (round 91, wave w1)

Seat: executor, leaf. Milestone: **C1 cold-run reproduction**. Axes: coverage, operability.
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base `b1d8f07b`, instrument freeze D1 + re-freeze D2/D3
(`.ufo/waves/round-91/freeze.txt`). No git/jj mutation, no repo edits, no subagents, no background jobs
outside the single foreground driver invocations below.

## Pins verified before running (sha256, read-only)

| file | observed | matches |
|---|---|---|
| `scripts/chrome-cdp-showpicker-proxy-round91.mjs` | `343eb0f202d9b37a21d948adf0f5eff84fbebf8c195ab99c272fd66580e33015` | freeze D1 / claims C1 / assigned driver pin |
| `scripts/check-showpicker-proxy-round91.mjs` | `f2f052f27c3a0e18ecef3217fc902c2897c59ab9f175d314ba66d526a7edb03e` | freeze D1 / claims C1 |
| `.ufo/waves/round-91/controls/c1/prior-set.txt` | `78ffc632b269a3c27d727432b9a17d2ce7cc1531b85272cd8ed5c3a3e17c2701` | freeze D1 |
| `…/controls/c1/probes/probe4.json` | `12b5ae6f6b4405ade7642d74d4a1f5d0fd7fbacbfe1d0cdc2e54461547412fce` | freeze D1 |
| `…/controls/c1/probes/probe5.json` | `2d76b87d9b1c277a6e5a18e3e8b30b06268ff92c1fc4309ff395d8db2664d69a` | freeze D1 |

Host instrument: Chromium `155.0.8059.84 Arch Linux`, node `v24.21.0`. Ports 19951–19956 were verified
free before each launch; no host sysctl, service or package was touched. **No tool installed or upgraded**
(nothing was needed; the tooling directive's recording clause is therefore empty).

## Runs (two cold nonces, disjoint port triples, distinct scratch dirs)

```
node scripts/chrome-cdp-showpicker-proxy-round91.mjs --lane <LANE> \
  --nonce tabi-r91-cold1-cold00001 --scratch /fast/scratch/hyaku/tabi-r91/R91Exec1/cold1 \
  --out …/cold1.json --http-port 19951 --cdp-port 19952 --child-port 19953      → exit 0, failures []
node … --nonce tabi-r91-cold2-cold00002 --scratch …/cold2 \
  --out …/cold2.json --http-port 19954 --cdp-port 19955 --child-port 19956      → exit 0, failures []
```

- 15 legs each, fresh browser per leg, zero per-leg `errors`, `failures: []` in both receipts.
- Run windows 69 s (cold1) / 77 s (cold2); both inside the counter's 30 s–900 s window.
- Fixture pins produced by each run: cold1 parent `34cbad47…`, same=child `358514c2…`; cold2 parent
  `4efe6e6c…`, same=child `d8fb22c8…`. Same-origin and cross-origin child hashes are identical **within**
  a run (one child template served at both origins — the required same-element shape). Hashes differ
  **between** runs and from the scored receipt because the parent/child documents embed the run's port
  origin; each receipt is therefore scored against its own pins, exactly as the seat spec prescribes.
  (The substantive law, below, is invariant across all five receipts.)

## Scoring (frozen counter, each receipt's own nonce + fixture pins, frozen prior-set)

```
node scripts/check-showpicker-proxy-round91.mjs --lane <LANE> --receipt <coldN.json> \
  --expect-driver-sha256 343eb0f2…33015 --expect-nonce <that receipt's nonce> \
  --expect-parent-sha256 <its parent> --expect-same-sha256 <its same> --expect-child-sha256 <its child> \
  --prior-set .ufo/waves/round-91/controls/c1/prior-set.txt --json
```

| run | nonce | exit | verdict | checkCount | findings |
|---|---|---|---|---|---|
| cold1 | `tabi-r91-cold1-cold00001` | **0** | clean | **30** | `[]` |
| cold2 | `tabi-r91-cold2-cold00002` | **0** | clean | **30** | `[]` |

All 30 checks true in both: `schema, lane, nonce-shape, nonce-expected, receipt-fields, driver-pin,
fixture-pins, ports-declared, host-chromium, host-node, plan-frozen, leg-order, leg-records, leg-marks,
frame-tree, context-binding, same-element-law, send-log-allowlist, plan-calls, chooser-event-law, law,
activation-law, proxy-law, state-law, event-shape, host-argv, teardown-closure, run-window, prior-set,
replay-identity` — i.e. the leg-a target (`checkCount 30`, clean, with driver/fixture/nonce pins) is
reproduced twice from cold.

## 15-leg law table — cold1 == cold2 == scored receipt (`receipt.json`) == probe4 == probe5

Compared field-by-field under the counter's own `lawOf` projection (direct, proxy ok/name/message/ret/target,
cross, chooser count, chooser frame ownership, parent activation before/after, child activation before/after,
childState): **0 field diffs** on every comparison
(`cold1↔cold2`, `cold1↔scored`, `cold2↔scored`, `cold1↔probe4`, `cold1↔probe5`).

| leg | frame/target | direct | proxy | cross | choosers (owner) | parent act | child act | childState |
|---|---|---|---|---|---|---|---|---|
| sp91-so-direct-noact | so/s | NotAllowedError | - | - | 0 (-) | 0->0 | 0->0 | [] |
| sp91-so-direct-parentact | so/s | ok ret=undefined | - | - | 1 (child) | 0->0 | 0->0 | [] |
| sp91-so-direct-childact | so/s | ok ret=undefined | - | - | 1 (child) | 0->0 | 0->0 | [] |
| sp91-so-proxy-noact | so/s | - | NotAllowedError | - | 0 (-) | 0->0 | 0->0 | [] |
| sp91-so-proxy-childact | so/s | - | ok ret=undefined | - | 1 (child) | 0->0 | 0->0 | [] |
| sp91-so-proxy-date-noact | so/dt | - | NotAllowedError | - | 0 (-) | 0->0 | 0->0 | [] |
| sp91-so-proxy-date-childact | so/dt | - | ok ret=undefined | - | 0 (-) | 0->0 | 0->0 | [] |
| sp91-xo-proxy-file-noact | xo/s | - | NotAllowedError | - | 0 (-) | 0->0 | 0->0 | [] |
| sp91-xo-proxy-file-parentact | xo/s | - | NotAllowedError | - | 0 (-) | 0->1 | 0->0 | [] |
| sp91-xo-proxy-file-childact | xo/s | - | ok ret=undefined | - | 1 (child) | 0->0 | 0->0 | [] |
| sp91-xo-proxy-file-answer | xo/s | - | ok ret=undefined | - | 1 (child) | 0->0 | 0->0 | [["tabi-r91-answer.txt",22,"text/plain"]] |
| sp91-xo-proxy-date-noact | xo/dt | - | SecurityError | - | 0 (-) | 0->0 | 0->0 | [] |
| sp91-xo-proxy-date-childact | xo/dt | - | SecurityError | - | 0 (-) | 0->1 | 0->1 | [] |
| sp91-xo-proxy-color-childact | xo/co | - | ok ret=undefined | - | 0 (-) | 0->0 | 0->0 | [] |
| sp91-xo-direct-access | xo/s | - | - | cd=None wd=SecurityError | 0 (-) | 0->0 | 0->0 | [] |

Law content confirmed in both cold runs: no activation → `NotAllowedError` and no chooser in **both**
iframes; a real parent click activates the parent but the same-origin child still throws through the proxy
(its activation is per-window) while the direct parent-document call succeeds — cold legs 2 and 4 show the
activation split; a child click activates the child (direct + proxy succeed, exactly one chooser owned by the
child frame); the cross-origin child stays inactive under parent activation (leg 9, `NotAllowedError`, no
chooser) and active under child activation (leg 10); the cross-origin date arm is `SecurityError` in both
activation states (legs 12/13); `DOM.setFileInputFiles` on the proxy-opened chooser delivers exactly
`tabi-r91-answer.txt` (22 B, text/plain) to the child input with the parent input empty (leg 11); and
direct cross-origin access yields `contentDocument === null` / `contentWindow.document` `SecurityError`
with `showPicker` unreachable (leg 15, `TypeError` on the null document). Date/colour "success" is the
absence of `fileChooserOpened` (0 file choosers, no file state), consistent with the frozen C1 limit; the
post-leg activation reads (leg 9 parent `0->1`, leg 13 child `0->1`) are the frozen "a throwing call leaves
it active" behaviour, not a deviation.

## Replay identity — disjoint launch tokens and devtools ids

Each run: 15 legs → 15 distinct `launchToken`s and 15 distinct `devtoolsListening.browserId`s (no intra-run
reuse).

| pair | shared launchTokens | shared browserIds |
|---|---|---|
| cold1 ∩ cold2 | ∅ | ∅ |
| cold1 ∩ scored | ∅ | ∅ |
| cold2 ∩ scored | ∅ | ∅ |
| cold1 ∩ probe4, cold1 ∩ probe5 | ∅ | ∅ |
| cold2 ∩ probe4, cold2 ∩ probe5 | ∅ | ∅ |

Sorted-set digests (tamper reference): cold1 token-set `7d09a764dd652b1a…`, id-set `e5e710728eb29555…`;
cold2 token-set `33ccc068e93c8b59…`, id-set `5c946aa59dec71c2…`. Neither cold receipt repeats a prior,
the scored receipt, or the other cold run — the counter's `replay-identity` check is true for both.

## Operability

- Both runs exited 0 unattended, wrote receipts, and each leg's teardown proof (counter `teardown-closure`)
  shows 0 survivors and all three port probes + post-kill curls closed; after both runs `ss` reports
  19951–19956 closed and no chromium process remains from this seat.
- Port precheck in the driver refuses an occupied triple (exit 2), so the disjoint triples above are
  genuinely acquired rather than assumed.
- Non-blocking observation: cold1 emitted `MaxListenersExceededWarning` (11 `SIGINT`/`SIGTERM` listeners,
  node v24) near leg 10. It is a warning only — both runs completed, every leg recorded `errors=[]`, and
  the count does not appear in the receipt, so no scored field is affected. Flagged for the planner as a
  cosmetic instrument wart, **not** a proposed amendment (the driver is frozen at D1).

## Verdict for this seat

C1 cold-run reproduction **succeeds**: two fresh-nonce, disjoint-port runs of the frozen driver both score
clean at checkCount 30 with 0 findings under the frozen counter, both produce a law table identical to the
scored receipt and to both prior probes, and the run-identity sets are fully disjoint from each other and
from every prior. No finding; no retry was needed or performed.

Evidence (copied out of scratch before deletion):
`.ufo/waves/round-91/w1/R91Exec1-cold1.json`, `R91Exec1-cold2.json`,
`R91Exec1-score-cold1.json`, `R91Exec1-score-cold2.json`, `R91Exec1-cold2.log`.

Scratch `/fast/scratch/hyaku/tabi-r91/R91Exec1` was removed after the copies above.

## Risks / limits (as assigned, not amended)

- The law is measured on this host's Chromium 155.0.8059.84 / node v24.21.0 only.
- Fixture hashes are port-dependent; scoring must always pass each receipt's own pins (as done here).
- `proxy.origin` differs across runs by construction (parent origin includes the run's HTTP port); the
  counter binds it to the receipt's own `ports.http` and excludes it from the prior-law projection.
- Nothing here extends the frozen C1 limit: the proxy's origin check is the lane fixture, native pickers
  are unmeasured, and answer delivery is observed as child-input state, not as UI.
