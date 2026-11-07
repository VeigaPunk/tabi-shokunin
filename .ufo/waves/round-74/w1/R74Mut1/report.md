FINDINGS

# R74Mut1 — semantic mutation sweep of `check-imecompose-r74.mjs` (round-74 C1)

Verdict: **FINDINGS** — 54 single-edit semantic mutants were run through the battery
copy beside each mutant; 26 were killed and 28 survived. Of the survivors, 19 have a
concrete receipt that the mutant accepts and the pinned counter refuses (battery
coverage gaps), 2 are strictness defects (over-refusal, no acceptance witness can
exist), and 7 are predicate-equivalent (4 probed, 3 proved). The frozen predicate,
counter, pins and kill rule were attacked, not amended.

## Pinned inputs (before/after digests identical)

```
$ sha256sum scripts/check-imecompose-r74.mjs scripts/negatives-imecompose-r74.mjs \
            scripts/chrome-cdp-imecompose-round74.mjs          # exit 0
5901d895ced1305f27935b93b409363c5822c7a730a6d2c7d00446ed7d33d251  scripts/check-imecompose-r74.mjs
8c0dd93a61177eb02691bee7f3a6d3762eb51cdf9d51599e7e23867ffe91fb26  scripts/negatives-imecompose-r74.mjs
afacee1b193ea2ba7ccab945956cee912eeed18cc5aa2fcacf5d65dc261dc2dc  scripts/chrome-cdp-imecompose-round74.mjs
```

The counter digest matches freeze digest D (`ca30e1a3b7b2…`) and the driver digest
matches the `--expect-driver-sha256` pin. The three scratch copies had identical
digests (command exit 0), so every mutant is an edit of the pinned bytes.
Receipt under test: `corpus/evidence/round74/chromium-ime-composition/receipt.json`;
priors: the 12 committed PRE receipts (9 smoke + 3 degenerate); laundered: the same 3
degenerates; nonce `tabi-r74-l1-ca30e1a3b7b2`.

## Method (executed)

1. Scratch copy of counter + battery + driver at `/fast/scratch/hyaku/tabi-r74/R74Mut1/s/`.
2. 54 single-edit mutants, each one exact source-string replacement (operators,
   tolerances, `every`→`some`, off-by-one in leg windows/seq, dropped `typed()`
   conjuncts, allow-list `EXPRS`/`once`/params entries, `nearTimeline` tolerance and
   field choice, `onGrid` tolerance, focus filter, chain bookkeeping, SHAPE literals).
   No force-true hook. Validation command over the pinned bytes:
   `node -e '…uniqueness/frozen-duplicate check…'` → **exit 0**; output
   `{"checked":54,"bad":0}` in `edit-validation.json` (each edit string occurs
   exactly once; 0 of the 26 frozen kill-power edits reused).
3. For each mutant: fresh dir with the mutated counter **and** the battery copy **and**
   the pinned driver copy (fixture-hash needs the driver beside the counter), then
   ```
   node <dir>/negatives-imecompose-r74.mjs --real <L1 receipt> \
     --expect-driver-sha256 afacee1b… --expect-nonce tabi-r74-l1-ca30e1a3b7b2 \
     --prior <smoke1..9> --prior <degenerate×3> --work <per-mutant scratch> \
     --laundered <degenerate×3> --json
   ```
   (exact invocation in `harness-runner.mjs`). **killed = exit 1**, per assignment.
4. Pristine control and restored control (same battery, pinned bytes):
   `baseline-battery.json` exit 0, `passed 239/239`, `positiveOk true`, `allOk true`,
   `coverageGap []`; `restored-battery.json` exit 0, `passed 239/239`, `allOk true`.
   No baseline failure; no mutant produced an exit other than 0 or 1 (no inconclusive
   runs).

Result: **54 mutants, 26 killed, 28 survived** — `mutants.json:30-32`; per-mutant
`batteryExit`, failing cases and mutant file hashes in `sweep.json` and `mutants.json`.

## Killed (26)

24 were killed by the battery's targeted negative cases (`positiveOk=true`, the
expected case fails). 2 SHAPE-literal mutants were killed because the battery's first
assertion — the honest L1 receipt must be clean — fails (`positiveOk=false`; the
counter refuses the real receipt with `leg-ce-compose-state`, e.g.
`node mut/52-shape-ce-compose-active-f/check-imecompose-r74.mjs --receipt <L1> …`
→ `verdict findings findings leg-ce-compose-state`). That is a legitimate battery
exit 1, but a weaker kill signal than a targeted negative case.

| mutant | kill class | failing battery case(s) |
|---|---|---|
| `schema-any-string` | targeted-negative-case | schema |
| `nonce-shape-length-only` | targeted-negative-case | nonce-shape |
| `nonce-expected-prefix-only` | targeted-negative-case | nonce-expected |
| `server-log-run-any-string` | targeted-negative-case | server-log-binding |
| `driver-pin-hex-shape-only` | targeted-negative-case | driver-pin |
| `devtools-stderr-head-dropped` | targeted-negative-case | devtools-stderr-absent |
| `run-window-ceiling-dropped` | targeted-negative-case | run-window-long |
| `plan-frozen-length-only` | targeted-negative-case | plan-frozen |
| `leg-params-cmd-dropped` | targeted-negative-case | leg-params-cmd |
| `leg-params-keys-only` | targeted-negative-case | leg-params |
| `seq-ge-not-eq` | targeted-negative-case | seq-monotonic |
| `event-leg-domain-some` | targeted-negative-case | event-leg-domain, event-leg-fabricated-label |
| `timeline-tolerance-0.01` | targeted-negative-case | replay-timeline-sub-quantum |
| `quantum-at-unchecked` | targeted-negative-case | event-time-quantum-at |
| `marks-closed-at-first-mark` | targeted-negative-case | leg-marks-closed-early |
| `allowlist-expr-any-string` | targeted-negative-case | lookalike-exec-command, lookalike-script-composition, lookalike-value-assign |
| `allowlist-navigate-url-string` | targeted-negative-case | allowlist-navigate-other-run |
| `allowlist-id-monotonic-only` | targeted-negative-case | allowlist-id-gap |
| `metrics-width-height-only` | targeted-negative-case | allowlist-dmo-scale-param |
| `teardown-sweep-count-sub-one` | targeted-negative-case | teardown-sweep-count |
| `starts-every-to-some` | targeted-negative-case | compositionstart-selected-text, compositionstart-data |
| `sessions-at-least-one` | targeted-negative-case | chain-session-dropped |
| `focus-target-any-string` | targeted-negative-case | focus-events-bound |
| `focusout-leg-any` | targeted-negative-case | focus-events-leg |
| `shape-ce-compose-active-f` | honest-receipt-break | positive assertion (`leg-ce-compose-state`) |
| `shape-commit-last-data-x` | honest-receipt-break | positive assertion (`leg-commit-data`) |

Executable re-runs (this seat, after the sweep): `rerun-killed-starts-every-to-some.battery.exit`
= **1**; `rerun-killed-shape-ce-compose-active-f.battery.exit` = **1**;
`rerun-surv-typed-key-dropped.battery.exit` = **0**.

## Survived (28) — disposition and witness

`witnesses/witness-results.json` holds the scored pairs (pinned vs mutant, exit code
and finding ids). Witness receipts are in `witnesses/`; each is the L1 receipt with one
field edited, plus an extra prior where the replay law is the probe.

### Acceptance witnesses (19) — mutant exit 0, pinned exit 1 with the named finding

| mutant | pinned → mutant |
|---|---|
| `host-chromium-version-dropped` | pinned=1 (`host-chromium`) → mutant=0 • `witnesses/host-chromium-version-dropped.receipt.json` |
| `devtools-url-prefix-any` | pinned=1 (`devtools-port-binding`) → mutant=0 • `witnesses/devtools-url-prefix-any.receipt.json` |
| `leg-params-elapsed-optional` | pinned=1 (`leg-params`) → mutant=0 • `witnesses/leg-params-elapsed-optional.receipt.json` |
| `typed-key-dropped` | pinned=1 (`event-types`) → mutant=0 • `witnesses/typed-key-dropped.receipt.json` |
| `typed-value-dropped` | pinned=1 (`event-types`) → mutant=0 • `witnesses/typed-value-dropped.receipt.json` |
| `typed-selend-dropped` | pinned=1 (`event-types`) → mutant=0 • `witnesses/typed-selend-dropped.receipt.json` |
| `typed-inputtype-number-allowed` | pinned=1 (`event-types`) → mutant=0 • `witnesses/typed-inputtype-number-allowed.receipt.json` |
| `typed-time-positive-dropped` | pinned=1 (`event-types`) → mutant=0 • `witnesses/typed-time-positive-dropped.receipt.json` |
| `quantum-tolerance-1e-2` | pinned=1 (`event-time-quantum`) → mutant=0 • `witnesses/quantum-tolerance-1e-2.receipt.json` |
| `marks-monotonic-slack` | pinned=1 (`leg-marks`,`event-leg-window`) → mutant=0 • `witnesses/marks-monotonic-slack.receipt.json` |
| `late-after-close-sub-one` | pinned=1 (`leg-marks`,`event-leg-window`) → mutant=0 • `witnesses/late-after-close-sub-one.receipt.json` |
| `window-lower-dropped` | pinned=1 (`event-leg-window`) → mutant=0 • `witnesses/window-lower-dropped.receipt.json` |
| `window-order-one-quantum` | pinned=1 (`event-leg-window`) → mutant=0 • `witnesses/window-order-one-quantum.receipt.json` |
| `once-getversion-dropped` | pinned=1 (`send-log-allowlist`) → mutant=0 • `witnesses/once-getversion-dropped.receipt.json` |
| `once-metrics-dropped` | pinned=1 (`send-log-allowlist`) → mutant=0 • `witnesses/once-metrics-dropped.receipt.json` |
| `ime-call-params-first-two` | pinned=1 (`ime-call-params`) → mutant=0 • `witnesses/ime-call-params-first-two.receipt.json` |
| `teardown-curl-devtools-dropped` | pinned=1 (`teardown-closure`) → mutant=0 • `witnesses/teardown-curl-devtools-dropped.receipt.json` |
| `teardown-fixture-probe-dropped` | pinned=1 (`teardown-closure`) → mutant=0 • `witnesses/teardown-fixture-probe-dropped.receipt.json` |
| `failures-nonarray-dropped` | pinned=1 (`failures-empty`) → mutant=0 • `witnesses/failures-nonarray-dropped.receipt.json` |

Direct re-run of one pair (fresh process, this seat):
`witness-typed-key-pinned.exit` = **1** (`verdict=findings findings=event-types`),
`witness-typed-key-mutant.exit` = **0** (`verdict=clean findings=`), same witness file.

### Over-refusal witnesses (2) — pinned exit 0, mutant exit 1

Both mutations make `nearTimeline` stricter (mutant's near-match set is a superset of
the pinned one, so the mutant's accept set is a subset; no acceptance witness can
exist by construction — the defect is a false-positive, not a missed forgery).

| mutant | pinned → mutant | probe |
|---|---|---|
| `timeline-at-field-dropped` (ts-only near match; `at` no longer compared) | pinned=0 → mutant=1 (`replay-event-timeline`) | receipt + prior with identical `ts` timeline and one `at` moved +1.0 ms: `witnesses/timeline-at-field-dropped.receipt.json` / `.prior.json` |
| `timeline-at-lte-boundary` (`<` → `<=`) | pinned=0 → mutant=1 (`replay-event-timeline`) | receipt event `ts`=0.1, prior event `ts`=0.05 (double difference exactly the double 0.05): `witnesses/timeline-at-lte-boundary.receipt.json` / `.prior.json` |

Direct re-run of the first pair: `witness-atfield-pinned.exit` = **0**
(`verdict=clean`), `witness-atfield-mutant.exit` = **1**
(`findings=replay-event-timeline`).

Note on reachability: no honest pre-freeze pair comes near these boundaries. Over
real vs the 9 smoke priors, 0/40 events are within 0.05 in `ts` and 0/40 in `at`
(max |Δts| 17.9–33.3 ms, max |Δat| 17.9–33.3 ms; measured from the committed
receipts), so these are latent false-positive defects, not observed ones.

### Equivalence (7)

| mutant | basis |
|---|---|
| `leg-order-length-ge` | proof: `canon(legs.map(name)) === canon(LEG_ORDER)` already implies `legs.length === LEG_ORDER.length`; the length conjunct is redundant for every possible receipt. |
| `leg-trusted-length-dropped` | proof: `d.seq`, `d.trusted`, `d.data`, `d.composing` are all derived from the same `evs` array, and SHAPE gives all four the same length; the unchanged `leg-*-seq` check (exact array equality) makes the dropped length test redundant. |
| `typed-data-undefined-allowed` | proof: `JSON.parse` never produces an own property whose value is `undefined`; `'data' in e` and `e.data === undefined` agree on every JSON-derived receipt. |
| `typed-composing-undefined-allowed` | probe: delete `isComposing` on a `compositionupdate`; pinned=1 (`event-types`,`leg-compose-b-composing`), mutant=1 (`leg-compose-b-composing`) — the added acceptance is shadowed by the unchanged per-leg composing check. |
| `typed-events-empty-allowed` | probe: `events=[]`; pinned=1 and mutant=1 (`seq-monotonic` among many) — `seq-monotonic`, `replay-event-timeline` and `event-time-quantum` all still require a non-empty event log. |
| `trust-end-not-true` | probe: `compositionend.isTrusted=null`; pinned=1, mutant=1 (both `event-types`) — `typed()` already requires a boolean, so `!== true` and `=== false` coincide. |
| `no-keyboard-keydown-keypress-only` | probe: insert a `keyup` into the empty `start` leg; pinned=1 (`no-keyboard-events`), mutant=1 (`leg-start-seq`, …) — every leg's expected tag sequence contains no key event, so the unchanged per-leg seq check still refuses any `keyup`. |

## Coverage map — what the battery copy does not catch

`coverageGap=[]` (every declared check id is the expected id of ≥1 refusal case), so
these are **aspect gaps**, not id gaps: each surviving weakening keeps the id covered
by a different aspect of the same check.

1. `typed()` conjuncts: `key`, `value`, `selEnd`, `inputType` widened to number, and
   `ts/at > 0` — 5 acceptance witnesses above.
2. `send-log-allowlist` `once()`: duplicate `Browser.getVersion` and duplicate
   `Emulation.setDeviceMetricsOverride` — 2 witnesses (only `Page.navigate` is
   duplicated by a case; only `setDeviceMetricsOverride` *params* are tampered).
3. `ime-call-params`: only the first two IME calls are ever compared (the mutant
   compares a 2-prefix); no case edits a later call — 1 witness.
4. `teardown-closure`: `postKillCurl.devtools` value and `portProbes.fixture` state
   are unchecked by cases (only `survivors`, `postKillSweepCount`, `devtools` probe
   and `postKillCurl.fixture` are covered) — 2 witnesses.
5. `failures-empty`: absence of the `failures` field is accepted by the mutant and
   has no case — 1 witness.
6. `host-chromium`: version suffix can be dropped (`/^Chromium /` only) — 1 witness.
7. `devtools-port-binding`: the url's port binding is not exercised against a url
   whose port differs while `dl.port` matches argv — 1 witness.
8. `leg-params`: `elapsedMs` may be absent — 1 witness.
9. `replay-event-timeline`/`event-time-quantum`: intermediate tolerances between
   `1e-4` and `1`, `<=` at the 0.05 boundary, and dropping the `at` field in the
   near match — 1 acceptance witness for `1e-2` quantum, 2 over-refusal witnesses.
10. `leg-marks`/`event-leg-window`: monotonic slack of one 0.1 ms step, non-integer
    `lateAfterClose` < 1, a mark moved past the first event (lower bound), and an
    event moved 0.1 ms before its predecessor — 4 witnesses.

## Limits of this result

* Witnesses are single-field edits of the L1 receipt; they are not fabricated runs and
  are not claimed as such. They score the mutant's acceptance predicate only.
* The two strictness mutants cannot have acceptance witnesses (subset argument above);
  they are reported in the opposite direction.
* Equivalence of the three proof cases is argued over the input domain (JSON receipts,
  or all receipts for the pure-redundancy ones); the four probe cases are empirical.
* No judgement on the contract; no amendment to the predicate, counter, pins or kill
  rule was proposed or made.

## Restoration and bounds

* Pinned lane bytes unchanged: digest command above, exit 0 (identical before and
  after the sweep; `sweep.json.pinned.restored` = true).
* `git -C tabi-shokunin status --porcelain -- scripts` (exit 0) printed only
  `?? scripts/selftest-r74-gates.mjs` (not authored by this seat; no write from this
  seat to `scripts/`). Read-only git was used; no git/jj mutation, commit or push.
  Lane HEAD observed at report time: `db59ed42bc974554d9f40fae4eefddf3357dce49`
  (advanced by other seats during the live wave; this seat committed nothing).
  Full digest/status record: `restoration.json`.
* Writes: `/fast/scratch/hyaku/tabi-r74/R74Mut1/` (scratch, removed after the receipts
  were copied) and this directory only. No host paths outside those, no service or
  sysctl changes.
* No subagents / `task` dispatch; no tool installs (pacman paused; nothing needed).
* Mutant source bytes are reconstructible from `mutants.json` (`edit.from` →
  `edit.to`) against the pinned counter digest above; per-mutant SHA-256 is recorded.

## Artifacts (this directory)

| path | content |
|---|---|
| `mutants.json` | all 54: id, single edit, killed, kill class, battery exit, mutant sha256, witness path/kind/exits, equivalence note |
| `sweep.json` | full per-mutant battery summary (failing cases, positiveOk, coverageGap) |
| `edit-validation.json` | edit uniqueness + frozen-duplicate check over the pinned counter (exit 0) |
| `baseline-battery.json` | pristine battery on the L1 receipt (exit 0, 239/239) |
| `restored-battery.json` | battery re-run on pristine bytes after the sweep (exit 0, 239/239) |
| `witnesses/` | 27 witness receipts/priors + `witness-results.json` (scored pairs) |
| `rerun-*.battery.exit`, `rerun-*.battery.json` | executable battery re-runs (killed=1, survivor=0) |
| `witness-*.exit`, `witness-*.json` | executable witness re-runs (pinned/mutant exits and finding ids) |
| `harness-runner.mjs`, `harness-witness.mjs` | the sweep and witness harnesses used (absolute scratch paths) |
| `restoration.json` | pinned file digests, scratch-copy digests, git status/HEAD record |
