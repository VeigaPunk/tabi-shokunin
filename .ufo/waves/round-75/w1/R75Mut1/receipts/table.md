| # | mutant (`m/<id>/check-dragdrop-r75.mjs`) | class | battery exit | passed | failed | verdict | witness / equivalence |
|---|---|---|---|---|---|---|---|
| 1 | `A01-serverlog-empty-ok` | conjunct-drop | 0 | 254/254 | 0 | **SURVIVED** | witness `receipts/w-A01-serverlog-empty-ok.receipt.json` — mutant exit 0 / frozen exit 1 (server-log-binding) |
| 2 | `A02-cdp-product-unchecked` | conjunct-drop | 0 | 254/254 | 0 | **SURVIVED** | witness `receipts/w-A02-cdp-product-unchecked.receipt.json` — mutant exit 0 / frozen exit 1 (host-chromium) |
| 3 | `A03-devtools-host-unbound` | literal-weaken | 0 | 254/254 | 0 | **SURVIVED** | witness `receipts/w-A03-devtools-host-unbound.receipt.json` — mutant exit 0 / frozen exit 1 (devtools-port-binding) |
| 4 | `A04-launch-token-len` | shape-literal | 0 | 254/254 | 0 | **SURVIVED** | witness `receipts/w-A04-launch-token-len.receipt.json` — mutant exit 0 / frozen exit 1 (replay-launch-token) |
| 5 | `A05-browser-id-len` | shape-literal | 0 | 254/254 | 0 | **SURVIVED** | witness `receipts/w-A05-browser-id-len.receipt.json` — mutant exit 0 / frozen exit 1 (replay-devtools-url) |
| 6 | `A06-browser-id-no-anchor` | shape-literal | 0 | 254/254 | 0 | **SURVIVED** | witness `receipts/w-A06-browser-id-no-anchor.receipt.json` — mutant exit 0 / frozen exit 1 (replay-devtools-url) |
| 7 | `A07-nonce-charset` | shape-literal | 0 | 254/254 | 0 | **SURVIVED** | equivalent (arg): CLI `--expect-nonce` regex is untouched, both exit 2 on an underscore nonce; strict nonce => both refuse `nonce-expected` |
| 8 | `A08-schema-substring` | shape-literal | 0 | 254/254 | 0 | **SURVIVED** | witness `receipts/w-A08-schema-substring.receipt.json` — mutant exit 0 / frozen exit 1 (schema) |
| 9 | `A09-nonceonpage-trim` | literal-weaken | 0 | 254/254 | 0 | **SURVIVED** | witness `receipts/w-A09-nonceonpage-trim.receipt.json` — mutant exit 0 / frozen exit 1 (nonce-on-page) |
| 10 | `A10-chromium-version-3part` | shape-literal | 0 | 254/254 | 0 | **SURVIVED** | witness `receipts/w-A10-chromium-version-3part.receipt.json` — mutant exit 0 / frozen exit 1 (host-chromium) |
| 11 | `A11-devtools-port-any` | conjunct-drop | 1 | 253/254 | 1 | **KILLED** | — |
| 12 | `A12-fixture-hash-null-ok` | conjunct-drop | 0 | 254/254 | 0 | **SURVIVED** | witness `receipts/w-A12-fixture-hash-null-ok.receipt.json` — mutant exit 0 / frozen exit 1 (fixture-hash) |
| 13 | `A13-postkill-curl-ge7` | operator | 0 | 254/254 | 0 | **SURVIVED** | witness `receipts/w-A13-postkill-curl-ge7.receipt.json` — mutant exit 0 / frozen exit 1 (teardown-closure) |
| 14 | `A14-portprobe-fixture-ignored` | conjunct-drop | 0 | 254/254 | 0 | **SURVIVED** | witness `receipts/w-A14-portprobe-fixture-ignored.receipt.json` — mutant exit 0 / frozen exit 1 (teardown-closure) |
| 15 | `A15-ts-positive-dropped` | conjunct-drop | 0 | 254/254 | 0 | **SURVIVED** | witness `receipts/w-A15-ts-positive-dropped.receipt.json` — mutant exit 0 / frozen exit 1 (event-types) |
| 16 | `A16-elapsed-nonneg-dropped` | conjunct-drop | 0 | 254/254 | 0 | **SURVIVED** | witness `receipts/w-A16-elapsed-nonneg-dropped.receipt.json` — mutant exit 0 / frozen exit 1 (leg-params) |
| 17 | `A17-runwindow-floor-4450` | tolerance | 0 | 254/254 | 0 | **SURVIVED** | witness `receipts/w-A17-runwindow-floor-4450.receipt.json` — mutant exit 0 / frozen exit 1 (run-window) |
| 18 | `A18-leg-error-null-ignored` | conjunct-drop | 1 | 240/254 | 14 | **KILLED** | — |
| 19 | `A19-leg-error-any-string` | conjunct-drop | 1 | 253/254 | 1 | **KILLED** | — |
| 20 | `A20-legstate-drops-only` | conjunct-drop | 1 | 239/254 | 15 | **KILLED** | — |
| 21 | `A21-sentdata-null-loose` | operator | 0 | 254/254 | 0 | **SURVIVED** | witness `receipts/w-A21-sentdata-null-loose.receipt.json` — mutant exit 0 / frozen exit 1 (leg-params) |
| 22 | `A22-marks-monotonic-vs-first` | operator | 0 | 254/254 | 0 | **SURVIVED** | witness `receipts/w-A22-marks-monotonic-vs-first.receipt.json` — mutant exit 0 / frozen exit 1 (leg-marks,event-leg-window,cancel-clears-session) |
| 23 | `A23-window-lower-prev-mark` | off-by-one | 1 | 252/254 | 2 | **KILLED** | — |
| 24 | `A24-event-at-order-dropped` | conjunct-drop | 1 | 253/254 | 1 | **KILLED** | — |
| 25 | `A25-eval-returnbyvalue` | conjunct-drop | 0 | 254/254 | 0 | **SURVIVED** | witness `receipts/w-A25-eval-returnbyvalue.receipt.json` — mutant exit 0 / frozen exit 1 (send-log-allowlist) |
| 26 | `A26-empty-params-any` | conjunct-drop | 0 | 254/254 | 0 | **SURVIVED** | witness `receipts/w-A26-empty-params-any.receipt.json` — mutant exit 0 / frozen exit 1 (send-log-allowlist) |
| 27 | `A27-cdp-event-params-open` | conjunct-drop | 0 | 254/254 | 0 | **SURVIVED** | witness `receipts/w-A27-cdp-event-params-open.receipt.json` — mutant exit 0 / frozen exit 1 (cdp-event-log-closed) |
| 28 | `A28-timeline-frac-slack` | tolerance | 0 | 254/254 | 0 | **SURVIVED** | witness `receipts/p-A28.prior.json` — frozen maxAbs 0.5294 >= 0.5, mutant 0.5294 < 0.55 |
| 29 | `A29-timeline-gapfrac-slack` | tolerance | 0 | 254/254 | 0 | **SURVIVED** | witness `receipts/p-A29.prior.json` — frozen maxGap 0.75 >= 0.75, mutant 0.75 < 0.85 |
| 30 | `A30-timeline-tol-tight` | tolerance | 1 | 253/254 | 1 | **KILLED** | — |
| 31 | `A31-own-gaps-floor-zero` | threshold | 1 | 253/254 | 1 | **KILLED** | — |
| 32 | `A32-pairmatch-last-fit` | matcher | 0 | 254/254 | 0 | **SURVIVED** | witness `receipts/p-A32.prior.json` — frozen 9/17 pairs (0.5294), mutant 8/17 (0.4706): last-fit loses the (2310.1,2310.2) pair |
| 33 | `A33-matchcount-inverted-advance` | matcher | 0 | 254/254 | 0 | **SURVIVED** | witness `receipts/p-A33.prior.json` — frozen maxGap 0.75, mutant 0.25 |
| 34 | `A34-matchcount-tol2` | matcher | 0 | 254/254 | 0 | **SURVIVED** | witness `receipts/p-A34.prior.json` — false positive: frozen accepts (maxGap 0.5), mutant refuses (1.0) |
| 35 | `A35-dt-items-num` | typed-drop | 0 | 254/254 | 0 | **SURVIVED** | verdict-equivalent (both exit 1; mutant silently loses `event-types`) |
| 36 | `A36-typed-ts-typeof` | typed-drop | 0 | 254/254 | 0 | **SURVIVED** | verdict-equivalent (both exit 1; mutant silently loses `event-types`) |
| 37 | `A37-dropfilter-enter-dropped` | filter | 0 | 254/254 | 0 | **SURVIVED** | verdict-equivalent (both exit 1; mutant silently loses `drop-acceptance-law`) |
| 38 | `A38-cancel-idx-shift` | off-by-one | 1 | 253/254 | 1 | **KILLED** | — |
| 39 | `A39-mask-table-16` | table | 0 | 254/254 | 0 | **SURVIVED** | verdict-equivalent (both exit 1; mutant silently loses ``) |
| 40 | `A40-coord-exempt-drop` | exemption | 1 | 252/254 | 2 | **KILLED** | verdict-equivalent (both exit 1; mutant silently loses `coordinate-law`) |
| 41 | `B01-sendlog-some` | operator | 1 | 239/254 | 15 | **KILLED** | — |
| 42 | `B02-gapmin-10` | tolerance | 0 | 254/254 | 0 | **SURVIVED** | inert on the 17 pinned receipts (measured: timeline identical, 1 prior has a 10-50 ms gap that matches nothing) |
| 43 | `B03-seq-zero-based` | off-by-one | 0 | 254/254 | 0 | **SURVIVED** | witness `receipts/w-B03.receipt.json` — mutant exit 0 / frozen exit 1 |
| 44 | `B04-exprs-entry` | allowlist | 0 | 254/254 | 0 | **SURVIVED** | witness `receipts/w-B04.receipt.json` — mutant exit 0 / frozen exit 1 |
| 45 | `A41-intercept-data-items-only` | conjunct-drop | 1 | 253/254 | 1 | **KILLED** | — |
| 46 | `A42-checkids-drop-trust-law` | closure | 0 | 254/254 | 0 | **SURVIVED** | structural: --list-checks 146 -> 145 (`trust-law`); the battery derives its coverage universe from the mutant, so the drop is invisible |
| 47 | `A43-shape-dropped-literal` | shape-literal | 1 | 3/254 | 252 | **KILLED** | — |
