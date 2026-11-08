# R83Exec1 — Leg (b): two independent cold runs of the frozen driver, scored by the frozen counter

Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
Base: `4cdf4def31b1feecb6aed5dbfc048c47d41ec88d`
Claims: `.ufo/waves/round-83/claims.json` (C1-SHOWPICKER-R83), freeze: `.ufo/waves/round-83/freeze.txt` (D = `9d90392aca79209c6f3b83a2c34797ebd588d27ac36ba48151778e3051494847`)
Axis: **coverage**. No predicate, counter, pin, prior, threshold or kill rule was amended, proposed for amendment, or bypassed.

Instrument pins re-hashed on this host before running (all six match `freeze.txt` byte for byte):

| file | sha256 | vs freeze |
|---|---|---|
| `scripts/check-record-drift-r83.mjs` | `4d0343b5e0798cbe5367e9a64e7ce8dd58b465f7961e2cf5d514fc4fe55e470f` | match |
| `scripts/check-showpicker-r83.mjs` | `7b9f9ec429427cfb4cf9b974f860e9726ce72b3d1127cb9e50a00d2d9ee5f841` | match |
| `scripts/chrome-cdp-showpicker-round83.mjs` | `70b522cc896f4a9b89320d58313b56519499566256cb0b7dd0b3a8aac1944fce` | match |
| `scripts/kill-power-r83.mjs` | `09c2202d55d6f9e05c9d1286de74f77aeba463ecc0d36a2759f64d9b251a0e1e` | match |
| `scripts/negatives-showpicker-r83.mjs` | `12c09cc15a4602c77faf7624d4556eb964545cf3a6277990c8a49ae89bd4a817` | match |
| `scripts/selftest-r83-gates.mjs` | `2d922c84ab9d1d3e3303f164c8162bb512d6325788e8d48b044ad3fe1d0afe28` | match |

Host: `Chromium 155.0.8059.84 Arch Linux`, CDP product `Chrome/155.0.8059.84`, protocol `1.3`, `node v24.21.0`. No tool was installed or upgraded for this seat.

## 1. Cold runs (frozen driver, fresh nonces, disjoint port triples)

| run | nonce | ports http/cdp/child | driver exit | legs | failures | fixture sha256 | receipt sha256 |
|---|---|---|---|---|---|---|---|
| cold1 | `tabi-r83-cold1-9d90392aca79` | 19380 / 19381 / 19382 | **0** | 15 | `[]` | `c0bc33631a3111bdd7fb801925405d949654037e70fad7407d10fa07c2b706f7` | `f9214b8e6740e62cde3d7751e8c80881a55d2b12efc4df5d531db272a7b9cf41` |
| cold2 | `tabi-r83-cold2-9d90392aca79` | 19383 / 19384 / 19385 | **0** | 15 | `[]` | `4db18267d34b3fc048a240acb6b5091eb84dd05968c19dfe5c6cbf4c67f00eb9` | `66767b2073a6827568339825da32d2934824d85ec4fe35b21ff9ccc6aac20413` |

Both runs: 15/15 legs completed, per-leg `errors: []`, `teardown.portProbes` = fixture/devtools/child all `closed`, `teardown.postKillCurl` = 7/7/7, `lateAfterClose` = 0, driver wall time 78.0 s (cold1) and 78.0 s (cold2).

Fixture hashes differ **by construction, not by drift**: the fixture HTML embeds `__NONCE__` and `__CHILD_ORIGIN__` (child port) before hashing, and the frozen counter takes the fixture hash per receipt as `--expect-fixture-sha256 <receipt fixture sha256>`. A single cross-run fixture pin is therefore impossible for this instrument; both runs were scored against their own receipt fixture hash as the assignment specifies.

Re-run determinism: after stripping only volatile fields (`at`/timestamps, launch token, ports, nonce, fixture origin, backendNodeId), the two receipts' leg surfaces are **byte-identical** (canonical JSON 5015 bytes each, `identical: true`). Minor `MaxListenersExceededWarning` (SIGINT/SIGTERM listener count 11) appears on both driver stderr streams; it is cosmetic, the driver exits 0 and the teardown proof is closed.

## 2. Counter scores

Commands and exit codes, exactly as run (lane absolute; prior set = `.ufo/waves/round-83/controls/c1/prior-set.txt`, sha256 `1ff644e590346d4c10018bbe0cc51a3b34d05b00396762126f0982e9bd5f7474`; prior resolved = 1 = `.ufo/waves/round-83/controls/c1/probes/prior1.json`).

### 2a. Exact command as issued in the assignment (no tree exemption)

| run | counter exit | verdict | checkCount | passed | findings |
|---|---|---|---|---|---|
| cold1 | **1** | `findings` | **74** | 73/74 | 1 |
| cold2 | **1** | `findings` | **74** | 73/74 | 1 |

Both identical, single failing check:

```
prior-set-complete  ->
  "receipts of schema tabi-chrome-cdp-showpicker-r83 in the round-83 wave/evidence trees,
   not the receipt under test (path ../../../../../fast/scratch/hyaku/tabi-r83/R83Exec1/cold1/receipt.json),
   not exempted by sha256 and not among the priors:
   /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round83/chromium-showpicker/receipt.json"
```

This is the counter's co-residency rule, not a cold-run law failure: while scoring an out-of-tree receipt, the frozen leg-a receipt inside `corpus/evidence/round83/` is neither the receipt under test, nor a prior, nor exempt, so it must be accounted for. Walker census confirms exactly two r83-schema receipts in the two walked trees: `.ufo/waves/round-83/controls/c1/probes/prior1.json` (in the prior set, accounted) and `corpus/evidence/round83/chromium-showpicker/receipt.json` (sha256 `3f9bbb60651d6f10a589561cd9638c4b5107517d770abf815c0991dd95a2bc9c`, unaccounted).

### 2b. Same frozen counter, its documented content-bound exemption only

Added `--tree-exempt-sha256 3f9bbb60651d6f10a589561cd9638c4b5107517d770abf815c0991dd95a2bc9c` (the sha256 of the frozen leg-a receipt; the counter resolves it inside the walked trees and refuses a hash that matches nothing — `prior-set-unmatched-exempt` stayed true, `treeExemptResolved` = that exact path). Nothing else changed.

| run | counter exit | verdict | checkCount | passed | findings |
|---|---|---|---|---|---|
| cold1 | **0** | **clean** | **74** | **74/74** | **0** |
| cold2 | **0** | **clean** | **74** | **74/74** | **0** |

74 check ids (all true in both runs): `schema, lane, nonce-shape, nonce-expected, receipt-fields, driver-pin, fixture-hash, host-chromium, host-node, ports-declared, frame-tree, plan-frozen, leg-order, leg-records, leg-marks, context-binding, send-log-allowlist, plan-calls, cdp-event-log-closed, frame-binding, event-types, event-time-quantum, event-leg-window, seq-monotonic, leg-<15 names>, gesture-law, activation-law, mode-law, cross-origin-nonfile-law, order-law, sp83-cross-origin-{color,month,week,time,number,range}-law, webkitdirectory-answer-law, accept-answer-law, click-while-open-law, multiple-mode-law, accept-mime-answer-law, second-chooser-answer-law, no-selection-law, intercept-law, cancel-law, dismiss-law, trust-law, host-argv, devtools-port-binding, teardown-closure, fixture-descriptors, server-log-binding, child-server-log-binding, run-window, replay-event-timeline, replay-launch-token, replay-devtools-url, prior-set-unmatched-exempt, prior-set-complete, prior-set-unparsable`.

### 2c. Control: the frozen in-tree leg-a receipt under the same frozen counter

Scored `corpus/evidence/round83/chromium-showpicker/receipt.json` with its own pins (nonce `tabi-r83-l1-c016710129da`, fixture `e86ceb4261607f02b762a4b70f2f3ff6451e8758953526f2b8340586eb84eb37`) and no exemption: **exit 0, verdict `clean`, 74 checks, 0 findings**. This isolates the §2a finding to receipt location/co-residency, not to any law or to the frozen receipt.

### 2d. Limit block (replay rule) — both cold receipts

`ownEvents 61, ownGaps 8`; prior `priorEvents 61, priorGaps 1, absMatched 0, gapMatched 0, absNeed 31, gapNeed 1, refused false`. Observed escape minimum `31` events. The gap side is reported here (gapMatched 0 < gapNeed 1) and is not a refusal, consistent with the frozen limit sentence; the constant-offset escape remains inside the stated limit and is not claimed away.

## 3. Law surface each cold run reproduced (15 legs, cold1 ≡ cold2)

- cross-origin `type=date` (`dt`) → child `SecurityError` `showPicker() called from cross-origin iframe.`, parent frame events `[]`, input state empty, no chooser.
- cross-origin disabled `type=date` (`dtd`) → `SecurityError`, **not** `InvalidStateError` (order discriminator: origin check precedes mutability).
- cross-origin `type=month` / `week` / `time` / `number` / `range` → `SecurityError` each.
- cross-origin `type=color` → child `ok:true`, no chooser, empty state (the spec's color/file exception), no `SecurityError`.
- same-origin disabled `type=date` (`disd`) → `InvalidStateError` (`cannot be used on immutable controls`), no chooser.
- `webkitdirectory` answer with a directory: `stateAfter.d` = `[["inner-a.txt",19,"text/plain","tabi-r83-dir/inner-a.txt"],["inner-b.png",18,"image/png","tabi-r83-dir/inner-b.png"]]`, `webkitRelativePath` populated, one `selectSingle` chooser.
- `accept="image/png"` + `.txt` answer: accepted into `k` (`tabi-r83-a.txt`, 22, `text/plain`) — accept is a dialog filter, not a validator.
- `accept="image/png"` + `.png` answer: accepted into `k` (`tabi-r83-b.png`, 21, `image/png`).
- `multiple` mode: `selectMultiple` chooser, answer lands in `m`.
- click while picker open: `clickWhileOpenChoosersBefore 1 → After 2` on the same input (`s`), trusted 10-event `pad`+`s` sequence.
- second-chooser answer attribution: two choosers share **one** backendNodeId within the run (cold1 `13/13`, cold2 `12/12`) and carry **distinct bytes** — `uploadSecond` = `tabi-r83-second.txt` (28 B, sha256 `6c386abf519b1814e48779ec7d338af2728726bae85fd4a5eee867011129f26b`) vs `upload` = `tabi-r83-a.txt` (22 B, sha256 `bc9965f176353d135c7f4229794068341dc8f51283baee3111500f149f2c21de`); `stateAfter.s` = `[["tabi-r83-second.txt",28,"text/plain",""]]`, `sValue` `C:\fakepath\tabi-r83-second.txt`. The id differing **between** runs (13 vs 12) is the browser-assigned relabel the frozen limit already declares inside by design; it is not treated as a drift.

## 4. Findings for the L1

1. **The assignment's literal counting command cannot return `clean` for any out-of-tree cold receipt** while the frozen leg-a receipt is in the walked tree: `prior-set-complete` fires on `corpus/evidence/round83/chromium-showpicker/receipt.json`. This is reproducible on both runs and vanishes under the counter's own frozen, content-bound `--tree-exempt-sha256` interface (§2b), and does not fire when the in-tree receipt itself is scored (§2c). If leg (b) is to be recorded as a clean coverage score, the counting command must carry that exemption (or the cold receipts must be scored from inside the walked tree). This is an invocation/co-residency fact — no predicate, threshold, prior or kill rule is at stake, and I do not propose changing any.
2. Fixture hash is nonce/child-origin dependent by construction, so leg (b) can never be replayed with one fixed `--expect-fixture-sha256`; the per-receipt binding used here is the only sound one.
3. Both cold runs are independent evidence of the same coverage surface: same 15 legs, same laws, same cross-run canonical surface after volatile fields are stripped, 74/74 checks under the exemption.

## 5. Artifacts (seat dir, sha256)

`.ufo/waves/round-83-seats/R83Exec1/`

| file | sha256 | what |
|---|---|---|
| `cold1-receipt.json` | `f9214b8e6740e62cde3d7751e8c80881a55d2b12efc4df5d531db272a7b9cf41` | raw cold1 driver receipt (236,702 B) |
| `cold2-receipt.json` | `66767b2073a6827568339825da32d2934824d85ec4fe35b21ff9ccc6aac20413` | raw cold2 driver receipt (235,545 B) |
| `cold1-scored-exact-command.json` | `7d09009ba68aab638dd5854cf60661c16b773a7f1a40c78e4d76e92c97fe8186` | counter JSON, assignment command, exit 1, `prior-set-complete` |
| `cold2-scored-exact-command.json` | `dca39e50be13d47dbed5d54c1a573726ab0c306b322ec1044d484ab37d1e801c` | same, cold2 |
| `cold1-scored-tree-exempt.json` | `fa4691c500a741f030222a18caaebda315f739603e3da9b6106cc53005a56d50` | counter JSON + documented exemption, exit 0 clean 74/74 |
| `cold2-scored-tree-exempt.json` | `a55962dec6ea9e43056766df132373350f343e5998b5516c1564de114dac760b` | same, cold2 |
| `frozen-l1-receipt-scored.json` | `f8887c16c29d2d23ad6d2a8720507d273c90d703f56b5425c472b73970d6088e` | control §2c, exit 0 clean 74/74 |
| `report.md` | — | copy of this report |

Scratch root `/fast/scratch/hyaku/tabi-r83/R83Exec1/` deleted after the artifacts above were copied out. No writes were made to `corpus/evidence/round83` or to any frozen instrument under `scripts/`.
