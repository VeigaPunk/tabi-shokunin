# R90Exec4 — settle-call refusal matrix (C1, round 90, wave w1)

Seat `R90Exec4` (executor, leaf). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base `a9f1da08`.
Scored receipt `corpus/evidence/round90/chromium-showpicker/receipt.json`, nonce `tabi-r90-l1-e573334c78fa`,
driver `ac5a7a5e…e6c49c8d`, fixture `5fb1f0f7…37bd7ac8`. Scratch `/fast/scratch/hyaku/tabi-r90/R90Exec4`
(deleted after the receipts below were copied). No lane file was edited.

## 0. Instrument anchor — D3, and the D1→D3 re-freeze

The freeze file was re-written mid-wave. Two anchors matter:

| anchor | `freeze.txt` | counter `scripts/check-showpicker-round90.mjs` | lines |
|---|---|---|---|
| D1 (task start) | sha before 11:31:53 | `1d3dfb0b3330f7334b9ea84df9cf7463fa28d61f411c65f9c03c9968d4b7be37` | 996 |
| **D3 (current)** | `5134c4be1e19bcfb19677ea91f1312e51cedd1fe6b2c53435fc8c3bf6ad2675e`, mtime 11:31:53 | **`6f65a0d420adea5947eb6a218ca46b354a966e8f695bde28d2df422f7074f735`** | 994 |

D3 re-pins the counter and also `negatives-showpicker-round90.mjs` (`2f11fffc…`) and
`kill-power-round90.mjs` (`05bbe353…`); driver, drift gate, gates selftest and the two probe pins are
unchanged. The D3 counter diff against D1 removes the explicit `plan-calls` count arms
(`:settle-eval N`, `:settle-eval-unexpected N`) and adds an allowlist rule
`if (params.expression === 'window.__inputs(true)') return p.kind === 'showpicker-domread';`;
the adjacency rule `settleIx === stateIx + 1` is kept.

Every score below is against a byte-identical copy of the pinned bytes (`counters/`), and `score.mjs`
refuses to run unless the copy's sha256 equals the anchor pin. The frozen scored command on the scored
receipt is clean 107 under **both** anchors (`controls/frozen-scored-d1.json`,
`controls/frozen-scored-d3.json`); both instruments' `--selftest` return `ok:true` with `plan-calls`
among the second case's findings (`controls/selftest-d1.json`, `controls/selftest-d3.json`).

Record observation, not edited: `plans/round-90.md` (`f77ca23cf56c…`, mtime 11:24:35, 114 lines) still
ends its §Re-freeze history at D2; it carries no D3 entry at the time of this report. `freeze.txt` is the
pin of record for D3. I did not write to the plan, the counter, or any lane file.

## 1. Method

1. Clone the scored receipt once: `receipt.base.json`, sha256
   `be8a5c38a8f3a6d9edb469f8867b1448a6f120654337a4b31bffa5dfb7d1f4f9` (same bytes as the lane receipt).
2. `mutate.mjs` applies one send-log/send-record mutation, renumbers `cdpSendLog[].id` positionally and
   remaps every id-bearing field (`interceptSendId`, `armSendId`, `dismissSendId`, `triggerSendId`,
   `trigger2SendId`, `priorPressId`, `priorReleaseId`, `clickPressId`, `clickReleaseId`,
   `answer.setSendId`) — or, for whole-log swaps, re-derives those fields from the swapped log (and,
   for the coherent swap variant, the open-event `afterSendId`). It writes one mutated receipt per id
   and never writes in the lane.
3. `score.mjs` runs the pinned counter per mutant and stores exit, the full check map, findings and the
   counter sha. `build-matrix.mjs` renders the tables below from the two summaries.
4. Because a mutant lives outside the two trees the counter walks, the unmodified in-tree scored receipt
   would otherwise be reported by `prior-set-complete`. The exemption is the content-bound
   `--tree-exempt-sha256 be8a5c38…`, which resolves to exactly that byte-identical file. Measured: with
   the exemption the identity control is clean 107 (`m00`); without it the identity control gains only
   `prior-set-complete`.
5. 33 mutants: the eight assigned send-log mutations, the identity control, swap/relocation variants, and
   reach probes. All 33 were scored on D1 and on D3; no verdict changed between anchors.

## 2. Refusal matrix (D3)

### Assigned eight + control

| id | mutation (send-log/send-record change) | exit | D3 verdict | D3 refusing check / sub-token | D1 delta |
|---|---|---|---|---|---|
| `m00-identity` | control: unmodified scored-receipt clone (same exemption) | 0 | PASS (clean 107) | — | same |
| `m01-remove-settle` | delete the settle `Runtime.evaluate` from `sp89-accept-domread-text`; renumber ids | 1 | refused | `plan-calls` (`settle-order`, `sequence`) | **D1** `plan-calls` (`settle-eval`, `settle-order`, `sequence`) |
| `m02-rename-plain-inputs` | rename the settle expression to plain `window.__inputs()` (allowlisted) | 1 | refused | `plan-calls` (`settle-order`, `sequence`) | **D1** `plan-calls` (`settle-eval`, `settle-order`, `sequence`) |
| `m03-duplicate-settle` | duplicate the settle `Runtime.evaluate` immediately after itself; renumber | 1 | refused | `plan-calls` (`sequence`) | **D1** `plan-calls` (`settle-eval`, `sequence`) |
| `m04-move-settle-after-dismiss` | move the settle `Runtime.evaluate` after the dismiss `{cancel:true}`; renumber | 1 | refused | `plan-calls` (`settle-order`, `sequence`) | same |
| `m05-add-settle-to-non-domread` | insert the settle `Runtime.evaluate` after the first `window.__state()` of `sp84-accept-answer` (kind showpicker-answer) | 1 | refused | `send-log-allowlist` (`expression`) | **D1** `plan-calls` (`settle-eval-unexpected`, `settle-eval`) |
| `m06-settle-returnbyvalue-false` | settle `returnByValue:false` | 1 | refused | `plan-calls` (`sequence`) | same |
| `m07-extra-eval-between-state-settle` | insert allowlisted `window.__late` between the settle `window.__state()` and the settle call | 1 | refused | `plan-calls` (`settle-order`) | same |
| `m08-swap-domread-logs` | swap the whole send logs of `sp89-accept-domread-text` and `sp89-accept-domread-png`; rebind ids | 1 | refused | `send-log-allowlist` (`expression`), `plan-calls` (`sequence`, `answer-files`, `trigger-id`) | same |

### Swap class

| id | mutation (send-log/send-record change) | exit | D3 verdict | D3 refusing check / sub-token | D1 delta |
|---|---|---|---|---|---|
| `m09-swap-domread-with-same-target-answer` | swap send logs of `sp89-accept-domread-text` and `sp86-accept-wildcard-text` (same target `aw`/answer `a.txt`); event logs untouched | 1 | refused | `send-log-allowlist` (`expression`), `plan-calls` (`settle-order`, `sequence`), `cdp-event-log-closed` (`open-binding`) | **D1** `plan-calls`, `cdp-event-log-closed` (`settle-eval-unexpected`, `settle-eval`, `settle-order`, `sequence`) |
| `m10-swap-same-target-answer-logs` | swap send logs of `sp84-accept-answer` and `sp84-accept-mime-answer` (same target `k`); mirror the answer record | 1 | refused | `plan-calls` (`sequence`, `answer-files`), `accept-answer-law`, `accept-mime-answer-law` | same |
| `m20-swap-answer-logs-pure` | swap send logs of `sp84-accept-answer` and `sp84-accept-mime-answer`; answer record untouched | 1 | refused | `plan-calls` (`sequence`, `answer-files`) | same |
| `m25-swap-same-target-coherent` | m09 made coherent: rebind ids, mirror the answer record, set each open event `afterSendId` to its trigger id | 1 | refused | `send-log-allowlist` (`expression`), `plan-calls` (`settle-order`, `sequence`) | **D1** `plan-calls` (`settle-eval-unexpected`, `settle-eval`, `settle-order`, `sequence`) |

### Position / params / cross-field probes

| id | mutation (send-log/send-record change) | exit | D3 verdict | D3 refusing check / sub-token | D1 delta |
|---|---|---|---|---|---|
| `m14-rebind-settle-to-post-dismiss-state` | remove settle-state + settle; reinsert both after the surviving post-dismiss state | 1 | refused | `plan-calls` (`settle-order`, `sequence`) | same |
| `m15-move-state-settle-pair-after-dismiss` | move the (`window.__state()`, settle) pair after the dismiss | 1 | refused | `plan-calls` (`sequence`) | same |
| `m16-nonallowlisted-eval-after-settle` | insert non-allowlisted `window.__inputs(true)||0` between settle and dismiss | 1 | refused | `send-log-allowlist` (`expression`) | same |
| `m17-non-domread-preread-becomes-settle` | change `sp84-accept-answer`'s pre-read plain `window.__inputs()` to the settle expression | 1 | refused | `send-log-allowlist` (`expression`) | **D1** `plan-calls` (`settle-eval-unexpected`, `settle-eval`) |
| `m23-settle-params-key-order` | reorder the settle params keys (`returnByValue` first; semantically identical) | 1 | refused | `plan-calls` (`sequence`) | same |
| `m24-add-settle-to-cross-leg` | insert the settle `Runtime.evaluate` into cross-origin `sp84-cross-origin-nonfile` (parent context) | 1 | refused | `send-log-allowlist` (`expression`) | **D1** `plan-calls` (`settle-eval-unexpected`, `settle-eval`) |
| `m28-settle-contextid` | set the settle `params.contextId` to the page main default context id | 1 | refused | `send-log-allowlist` (`expression`), `plan-calls` (`sequence`) | same |
| `m29-settle-extra-param-usergesture` | add `userGesture:true` to the settle params | 1 | refused | `plan-calls` (`sequence`) | same |
| `m30-extra-state-between-state-settle` | insert an extra `window.__state()` between the settle state and the settle call | 1 | refused | `plan-calls` (`settle-order`) | same |
| `m31-extra-state-before-anchor` | insert an extra `window.__state()` immediately before the settle state anchor | 1 | refused | `plan-calls` (`settle-order`) | same |
| `m32-settle-bare-params` | strip `returnByValue` from the settle params (bare `{expression}`) | 1 | refused | `plan-calls` (`sequence`) | same |
| `m22-remove-plain-preread` | delete the pre-read plain `window.__inputs()`; event `afterSendId` untouched | 1 | refused | `cdp-event-log-closed` (`open-binding`) | same |

### Reach probes — the passes

| id | mutation (send-log/send-record change) | exit | D3 verdict | D3 refusing check / sub-token | D1 delta |
|---|---|---|---|---|---|
| `m11-extra-late-after-settle` | insert `window.__late` between the settle call and the dismiss | 0 | PASS (clean 107) | — | same |
| `m12-extra-plain-inputs-after-settle` | insert plain `window.__inputs()` between the settle call and the dismiss | 0 | PASS (clean 107) | — | same |
| `m13-plain-preread-returnbyvalue-false` | set the pre-read plain `window.__inputs()` (id 9) `returnByValue:false` | 0 | PASS (clean 107) | — | same |
| `m18-post-dismiss-state-returnbyvalue-false` | set the post-dismiss `window.__state()` `returnByValue:false` | 0 | PASS (clean 107) | — | same |
| `m19-extra-state-after-settle` | insert an extra `window.__state()` between the settle call and the dismiss | 0 | PASS (clean 107) | — | same |
| `m21-remove-post-dismiss-state` | delete the post-dismiss `window.__state()` | 0 | PASS (clean 107) | — | same |
| `m26-remove-plain-preread-coherent` | delete the pre-read plain `window.__inputs()` and shift event `afterSendId` > 9 down by one | 0 | PASS (clean 107) | — | same |
| `m27-plain-inputs-before-state-anchor` | insert a plain `window.__inputs()` immediately before the settle state anchor | 0 | PASS (clean 107) | — | same |

**Eight assigned mutations: all refused; zero passes.** Nine clean runs (identity + eight reach probes)
out of 33. No mutant changes verdict between D1 and D3.

## 3. What the refusal matrix says about the binding's reach

The matrix attacks the **acceptance law** (what the counter accepts as a receipt), not Chromium's
runtime. Page events, `domRead`, `stateAfter`, contexts and the CDP event logs were left untouched, so
each row isolates the send-log/send-record change.

1. **The ordered projection is a subset.** `plan-calls` builds `got` only from the intercept
   arm/dismiss, `Input.dispatchMouseEvent`, `DOM.setFileInputFiles`, the target wrapper evaluate, and —
   on domread legs — the settle evaluate. Every other allowlisted evaluate is unbound in count and
   params; their position is free only so far as they do not displace the settle from
   `stateIx + 1` or the projected sends from order. Measured passes: extra `window.__late` after the
   settle (`m11`), extra plain `window.__inputs()` after the settle (`m12`), extra `window.__state()`
   after the settle (`m19`), deletion of the post-dismiss state (`m21`), coherent deletion of the plain
   pre-read (`m26`).
2. **"Exactly one" survives as a consequence of the ordered comparison, not as a count.** D3 removed
   `:settle-eval`; a duplicate settle entry still adds an element to `got`, so `m03` is refused by
   `plan-calls :sequence`. Removal (`m01`), rename to the plain expression (`m02`) and relocation
   (`m04`) are refused by `:settle-order` + `:sequence`. The plain expression is allowlisted but is not
   counted as the settle call, which is why `m02` loses the adjacency immediately.
3. **The non-domread prohibition is now allowlist-enforced.** `window.__inputs(true)` on
   `sp84-accept-answer` (`m05`), on the answer leg after a log swap (`m09`/`m25`), on the cross-origin
   parent (`m24`) and as the non-domread pre-read (`m17`) is refused by `send-log-allowlist
   :expression`. Under D1 these were `plan-calls :settle-eval-unexpected`; the top-level refusal is
   unchanged, the enforcing check moved.
4. **Settle params are fully bound only through `:sequence`.** `returnByValue:false` (`m06`), an extra
   `userGesture` (`m29`), bare params (`m32`) and even a JSON key-order permutation of semantically
   identical params (`m23`) are refused by the deep-equal on `got`. `send-log-allowlist` ignores params
   except `contextId`, which it refuses on a non-cross leg (`m28`). `:sequence` compares
   `JSON.stringify` order, so the binding is byte-order-sensitive: an honest producer that emits
   `{returnByValue, expression}` rather than `{expression, returnByValue}` is refused.
5. **The anchor is the first `window.__state()`, not an identifiable settle-mark read.** A plain call
   immediately before the anchor is invisible (`m27`, pass); a state call between the anchor and the
   settle breaks adjacency (`m30`); a state call before the anchor steals it (`m31`); a state call after
   the settle is invisible (`m19`, pass). Relocating the (`state`, settle) pair past the dismiss keeps
   adjacency but is refused by `:sequence` (`m15`), so the ordered plan, not adjacency alone, is what
   refuses a coherent relocation.
6. **The same-target swap is refused by the settle arms themselves.** With ids, answer record and event
   `afterSendId` repaired, `sp89-accept-domread-text` ↔ `sp86-accept-wildcard-text` is refused only by
   `send-log-allowlist` (the settle expression now on the answer leg) and `plan-calls`
   (`:settle-order`, `:sequence` on the domread side) — `m25`. A domread↔domread swap is refused
   earlier by the allowlist's per-leg target expressions plus `:trigger-id`/`:sequence` (`m08`); a
   same-target answer↔answer swap never involves the settle call and is refused by the file binding
   (`:answer-files`, `:sequence`) (`m20`, `m10`).
7. **A pre-trigger deletion is caught by the event log, not the settle binding.** Deleting the plain
   pre-read without shifting `cdpEventLog[].afterSendId` shifts every later send id and trips
   `cdp-event-log-closed :open-binding` (`m22`); repairing the event `afterSendId` makes the same
   deletion clean (`m26`). The plain pre-read is not required by `plan-calls`; it is protected only by
   the cross-field id binding that a coherent forger also updates.

Two boundaries to state plainly. (i) These are static receipt edits: the data fields (`domRead`,
`stateAfter`, page events, event logs) are unchanged, so data-substitution attacks are outside this
matrix; `R90Review2` measured those (`R90Review2-f1-*`, `R90Review2-f2-*` in this same w1 dir) and its
passes do not contradict anything here. (ii) The D3 re-freeze moved the non-domread limb from
`plan-calls` to `send-log-allowlist`; the claim's C1 `type` sentence still attributes both limbs to
`plan-calls`. This report records the instrument map; it proposes no amendment to the claim, predicate
or pins.

## 4. D1 → D3 delta (answer to the L1)

0 verdict flips across the 33 mutants. 8 rows change the refusing check id and/or the sub-token; the
other 25 rows are byte-identical in their failed check sets.

| id | D1 refusing | D3 refusing |
|---|---|---|
| `m01`, `m02` | `plan-calls` (`settle-eval`, `settle-order`, `sequence`) | `plan-calls` (`settle-order`, `sequence`) |
| `m03` | `plan-calls` (`settle-eval`, `sequence`) | `plan-calls` (`sequence`) |
| `m05`, `m17`, `m24` | `plan-calls` (`settle-eval-unexpected`, `settle-eval`) | `send-log-allowlist` (`expression`) |
| `m09` | `plan-calls` + `cdp-event-log-closed` (`settle-eval-unexpected`, `settle-eval`, `settle-order`, `sequence`) | `send-log-allowlist` + `plan-calls` + `cdp-event-log-closed` (`settle-order`, `sequence`) |
| `m25` | `plan-calls` (`settle-eval-unexpected`, `settle-eval`, `settle-order`, `sequence`) | `send-log-allowlist` + `plan-calls` (`settle-order`, `sequence`) |

The L1's specific prediction is confirmed: the "non-domread leg carries `window.__inputs(true)`" case
(`m05`; also `m17`, `m24`) is now refused by `send-log-allowlist :expression`, not by `plan-calls`. The
domread duplicate (`m03`) remains refused but without the `settle-eval 2` token — the ordered
`got`/`want` comparison is the enforcing arm. The frozen scored receipt is clean 107 under both anchors,
so the re-freeze does not move the acceptance baseline.

## 5. Exact commands

Clone and hash (scratch; deleted after the copy):

```sh
cp /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round90/chromium-showpicker/receipt.json \
   /fast/scratch/hyaku/tabi-r90/R90Exec4/receipt.base.json
sha256sum /fast/scratch/hyaku/tabi-r90/R90Exec4/receipt.base.json
# be8a5c38a8f3a6d9edb469f8867b1448a6f120654337a4b31bffa5dfb7d1f4f9
```

Generate the 33 mutants and score both anchors (the score script asserts the counter sha before use):

```sh
cd /fast/scratch/hyaku/tabi-r90/R90Exec4
node mutate.mjs receipt.base.json mutants
node score.mjs mutants scores-d1 be8a5c38a8f3a6d9edb469f8867b1448a6f120654337a4b31bffa5dfb7d1f4f9 \
  ./check-showpicker-round90.pinned.mjs 1d3dfb0b3330f7334b9ea84df9cf7463fa28d61f411c65f9c03c9968d4b7be37
node score.mjs mutants scores-d3 be8a5c38a8f3a6d9edb469f8867b1448a6f120654337a4b31bffa5dfb7d1f4f9 \
  ./check-showpicker-round90.d3.mjs 6f65a0d420adea5947eb6a218ca46b354a966e8f695bde28d2df422f7074f735
node build-matrix.mjs
```

One mutant, full frozen command (for any id in the table; the exemption is the scored receipt's own
bytes, not a mutation):

```sh
node /fast/scratch/hyaku/tabi-r90/R90Exec4/check-showpicker-round90.d3.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --receipt /fast/scratch/hyaku/tabi-r90/R90Exec4/mutants/m05-add-settle-to-non-domread.json \
  --expect-driver-sha256 ac5a7a5e56537acc8f61058059294c5f343b236de9b52b8d691995f1e6c49c8d \
  --expect-nonce tabi-r90-l1-e573334c78fa \
  --expect-fixture-sha256 5fb1f0f7806c8f099976078f3f03c9e08d6814346cc29fdccd022f4037bd7ac8 \
  --prior-set .ufo/waves/round-90/controls/c1/prior-set.txt \
  --tree-exempt-sha256 be8a5c38a8f3a6d9edb469f8867b1448a6f120654337a4b31bffa5dfb7d1f4f9 \
  --json
```

Frozen scored control, D1 and D3 (from the lane, receipt lane-relative, no exemption needed because it
is the receipt under test):

```sh
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
node /fast/scratch/hyaku/tabi-r90/R90Exec4/check-showpicker-round90.pinned.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --receipt corpus/evidence/round90/chromium-showpicker/receipt.json \
  --expect-driver-sha256 ac5a7a5e56537acc8f61058059294c5f343b236de9b52b8d691995f1e6c49c8d \
  --expect-nonce tabi-r90-l1-e573334c78fa \
  --expect-fixture-sha256 5fb1f0f7806c8f099976078f3f03c9e08d6814346cc29fdccd022f4037bd7ac8 \
  --prior-set .ufo/waves/round-90/controls/c1/prior-set.txt --json
# exit 0, verdict clean, checkCount 107 (same with check-showpicker-round90.d3.mjs)
```

Instrument selftest (pinned copy mirrored next to a copy of the scored receipt; `HYAKU_SCRATCH` keeps
the selftest's own scratch inside the seat root):

```sh
HYAKU_SCRATCH=/fast/scratch/hyaku/tabi-r90/R90Exec4/selftestbase-d3 \
  node selftestmirror-d3/scripts/check-showpicker-round90.mjs --selftest --json
# exit 0, ok:true, exit:1, ids include "plan-calls"
```

## 6. Evidence inventory (durable, under `.ufo/waves/round-90/w1/R90Exec4/`)

| path | contents |
|---|---|
| `scores-d3/` | 33 per-mutant counter outputs (exit, full `checks`, findings) + `summary.json`, counter sha `6f65a0d4…` |
| `scores-d1/` | the same 33 under the pre-re-freeze counter `1d3dfb0b…` + `summary.json` |
| `controls/` | frozen scored D1/D3 (`clean 107`), post-copy lane runs D1/D3 (`clean 107`), selftest D1/D3 (`ok:true`), receipt clone sha |
| `counters/` | byte-identical D1 and D3 counter copies + `SHA256SUMS` |
| `mutate.mjs`, `score.mjs`, `build-matrix.mjs` | the harness; `mutate.mjs` regenerates every mutant from `receipt.base.json` sha `be8a5c38…` |
| `matrix-d3.md`, `matrix-d3.json` | the rendered matrix above, machine-readable |

The mutated receipts themselves are not copied into the lane: they carry the scored
`tabi-chrome-cdp-showpicker-r90` schema and would be read as unlisted receipts by the counter's
`prior-set-complete` walk. They are reproducible from the receipt clone sha and `mutate.mjs`. The
scratch root was removed after the copy.

## 7. Limits and risks

- The matrix is an acceptance-law measurement on a receipt clone. It does not execute the driver, and
  it does not measure Chromium. Its passes are bounds on what the counter accepts, not runtime laws.
- The tree exemption is required only because the mutant lives outside the walked trees; it is
  content-bound to the unmodified scored receipt and cannot exempt a settle finding. Measured: identity
  clean 107 with it; identity gains only `prior-set-complete` without it.
- D3 landed mid-wave (freeze.txt mtime 11:31:53). The plan's §Re-freeze history does not yet carry D3
  (checked sha `f77ca23c…`, mtime 11:24:35); this is a record observation for the L1, not a change I
  made or propose.
- No tool installs or upgrades were performed. No lane file, counter, pin, prior, claim or kill rule was
  edited. No git/jj mutation was run anywhere; only read-only `git rev-parse/status/log/cat-file`
  queries were used to establish the file's tracking state and history.
- Contract deviation, self-corrected: one early diagnostic used shell redirects to `/tmp/xx.out` and
  `/tmp/xx.err` before the no-`/tmp` rule was honoured in the command layout; both files were removed
  immediately. No deliverable, fixture, lane path or evidence file was involved.
