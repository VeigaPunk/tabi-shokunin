# R91Exec2 — C1 leg (b) re-measure (independent)

Seat: R91Exec2 (executor, axis operability), wave `w1`, round 91.
Milestone: C1 leg (b) re-measure.
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`; base `b1d8f07b`; lane HEAD during the
measurement `249b7d0cf0fa13d09cf8da6a724608e9d8b099d1` (detached from the base by the round's own
commits, not by me). Scored nonce `tabi-r91-l1-1d073adc0b8d` (D1, unchanged).
Instrument freeze read from `.ufo/waves/round-91/freeze.txt`; its header digest is `12cbe8a0267f`
(D3). D1 is the *receipt* freeze; D2/D3 re-froze only non-receipt instruments (claims.json
§freezeHistory, and §frozenAmendments as recorded by R91Exec3), so freeze.txt is the byte authority
for the instruments I ran and it matches them exactly (below).
Scratch: `/fast/scratch/hyaku/tabi-r91/R91Exec2` (created with `mkdir -p`, deleted after this
report; retained outputs are the `R91Exec2-*.json` files beside this report).
No tool installs, no upgrades, no pacman transactions (nothing was needed; node `v24.21.0` sufficed
and no browser was launched by this seat). No git/jj command of any kind was run against the lane or
any fixture; no fixture repo was created. No subagent was dispatched.

Leg (b) as frozen: *"the battery exits 0 with 0 failed (44 cases, positive control included); kill
power leaves 0 survivors, 0 crashed, 0 unapplied (32 mutants)"*. Both halves were re-measured from
committed bytes, and the six-gate runner was run as the third command.

## Instrument bytes observed vs `freeze.txt`

`sha256sum` of every path in `.ufo/waves/round-91/freeze.txt`, taken **before** the measurement and
again **after** every run finished (identical both times — the instruments were not touched by me or
by any concurrent seat during the window):

| path | freeze.txt | before | after |
|---|---|---|---|
| scripts/chrome-cdp-showpicker-proxy-round91.mjs | 343eb0f2…e33015 | same | same |
| scripts/check-showpicker-proxy-round91.mjs | f2f052f2…7edb03e | same | same |
| scripts/negatives-showpicker-proxy-round91.mjs | 6475f056…35fe78cb | same | same |
| scripts/kill-power-proxy-round91.mjs | 570cffbf…21845910 | same | same |
| scripts/selftest-r91-gates.mjs | 988c18e5…b7577bc26 | same | same |
| scripts/check-record-drift-round91.mjs | e2e51c6b…93fd62ffda3 | same | same |
| .ufo/waves/round-91/controls/c1/probes/probe4.json | 12b5ae6f…61547412fce | same | same |
| .ufo/waves/round-91/controls/c1/probes/probe5.json | 2d76b87d…8db2664d69a | same | same |
| .ufo/waves/round-91/controls/c1/prior-set.txt | 78ffc632…5c3a3e17c2701 | same | same |

The frozen instrument text therefore *is* the text that produced the numbers below.

## Receipt provenance (input to the battery and the counter)

`corpus/evidence/round91/chromium-showpicker-proxy/receipt.json`
- tracked (`git ls-files` hit) and **unmodified** vs HEAD for the whole window (`git status` clean
  for that path), sha256 `15e2167ea64b638e28fd8d8b3bba3170bd4d48becc2dc27c54039885c39d35c8`,
  mtime `2026-11-08 13:07:04` — i.e. written at the scored run, before this seat existed.
- `schema tabi-chrome-cdp-showpicker-proxy-r91`, `lane tabi-shokunin`,
  `nonce tabi-r91-l1-1d073adc0b8d`, `driverSha256 343eb0f2…e33015`, 15 legs, `failures: []`,
  ports `{http:19961, cdp:19962, child:19963}` (distinct triple), 15 leg names as the frozen plan.
- The `fixture` block carries only origin/path/sha256 (no inline document bytes), so the counter can
  bind receipt→pin but cannot by itself bind pin→driver text. I closed that gap independently:

### Independent fixture-hash recomputation (my own code, not the counter)

I extracted the two document templates out of the committed driver source
(`childHtml(parentOrigin)` and `PARENT_HTML`), re-expanded them at the receipt's own ports and nonce
(`__RUN__ → tabi-r91-l1-1d073adc0b8d`, `CHILD_ORIGIN` = `http://127.0.0.1:19963`), and hashed the
bytes the driver says it served (`scripts/chrome-cdp-showpicker-proxy-round91.mjs:280-283,548-551`):

| document | declared in receipt | recomputed from driver source | match |
|---|---|---|---|
| parent | a6ecf367…022b778bf0 | a6ecf367…022b778bf0 | yes (2523 B) |
| same (`/same.html`, parent origin) | 01380a98…331775fe36 | 01380a98…331775fe36 | yes (3037 B) |
| child (`/child.html`, child origin) | 01380a98…331775fe36 | 01380a98…331775fe36 | yes (3037 B) |
| driver | 343eb0f2…e33015 | 343eb0f2…e33015 | yes |

Structural facts that fell out of the same recomputation: the two child documents are **byte-identical
by construction** (same template, only the injected parent origin differs, and that origin is the
same `http://127.0.0.1:19961` in both) — the same-origin/cross-origin contrast is carried by the
*serving origin*, not by document bytes; the child page embeds the parent origin and the parent origin
only (`childOriginGuardAbsent: true`, i.e. the child document contains no reference to its own
origin); the parent page embeds the child origin and the run token (`?run=<nonce>`).
Evidence: `R91Exec2-fixture-recompute.json`.

## (1) Battery — `negatives-showpicker-proxy-round91.mjs`

Exact frozen invocation (all five pins + prior set + scratch `--work`), `--json`:

```
node scripts/negatives-showpicker-proxy-round91.mjs --lane <lane> --real <receipt> \
  --expect-driver-sha256 343eb0f2… --expect-nonce tabi-r91-l1-1d073adc0b8d \
  --expect-parent-sha256 a6ecf367… --expect-same-sha256 01380a98… --expect-child-sha256 01380a98… \
  --prior-set .ufo/waves/round-91/controls/c1/prior-set.txt --work <scratch>/battery --json
```

**exit 0 — `cases 44`, `failed 0`, `ok true`.** Positive control `control-clean` exits 0 with
`verdict clean`; each of the other 43 cases mutates exactly one field and exits 1 carrying the named
finding it expects. **No failed case to name.**

| case | expected finding | exit | verdict |
|---|---|---|---|
| control-clean | clean | 0 | ok |
| schema | schema | 1 | ok |
| lane | lane | 1 | ok |
| nonce-shape | nonce-shape | 1 | ok |
| nonce-expected | nonce-expected | 1 | ok |
| receipt-fields | receipt-fields | 1 | ok |
| driver-pin | driver-pin | 1 | ok |
| fixture-parent-pin | fixture-pins | 1 | ok |
| fixture-same-pin | fixture-pins | 1 | ok |
| fixture-origin | ports-declared | 1 | ok |
| host-chromium | host-chromium | 1 | ok |
| plan-drop | plan-frozen | 1 | ok |
| plan-target | plan-frozen | 1 | ok |
| plan-order | leg-order | 1 | ok |
| leg-keys | leg-records | 1 | ok |
| leg-errors | leg-records | 1 | ok |
| leg-marks | leg-marks | 1 | ok |
| leg-marks-order | leg-marks | 1 | ok |
| frame-ids | frame-tree | 1 | ok |
| context-binding | context-binding | 1 | ok |
| same-element | same-element-law | 1 | ok |
| same-element-leg | same-element-law | 1 | ok |
| send-log-expression | send-log-allowlist | 1 | ok |
| plan-calls-post | plan-calls | 1 | ok |
| chooser-frame | chooser-event-law | 1 | ok |
| chooser-binding | chooser-event-law | 1 | ok |
| direct-law | law | 1 | ok |
| proxy-law | proxy-law | 1 | ok |
| law-proxy-message | law | 1 | ok |
| proxy-log-origin | proxy-law | 1 | ok |
| activation-law | activation-law | 1 | ok |
| activation-parent | activation-law | 1 | ok |
| state-parent | state-law | 1 | ok |
| state-answer | state-law | 1 | ok |
| state-child | state-law | 1 | ok |
| event-shape | event-shape | 1 | ok |
| event-untrusted | event-shape | 1 | ok |
| cross-access | law | 1 | ok |
| argv | host-argv | 1 | ok |
| teardown | teardown-closure | 1 | ok |
| server-log | host-argv | 1 | ok |
| run-window | run-window | 1 | ok |
| prior-laws | prior-set | 1 | ok |
| replay-token | replay-identity | 1 | ok |

Evidence: `R91Exec2-battery.json`.

## (2) Kill power — `kill-power-proxy-round91.mjs`

Exact frozen invocation (same pins/prior set, `--work <scratch>/killpower`, `--json`):

**exit 0 — `mutants 32`, `killed 32`, `survived 0`, `crashed 0`, `unapplied 0`.**
**No survivor, no crash, no unapplied mutant to name.** Each mutant's `from` string occurred exactly
once in the counter source (otherwise it would have been reported `unapplied`/`crash`), each mutant
passed `node --check`, and each was killed by at least one battery case:

| mutant | status | kill evidence |
|---|---|---|
| schema-check-removed | killed | battery failed 1 case(s) |
| nonce-expected-removed | killed | battery failed 1 case(s) |
| driver-pin-removed | killed | battery failed 1 case(s) |
| fixture-pins-removed | killed | battery failed 2 case(s) |
| plan-frozen-removed | killed | battery failed 2 case(s) |
| leg-order-removed | killed | battery failed 1 case(s) |
| leg-records-removed | killed | battery failed 1 case(s) |
| leg-marks-removed | killed | battery failed 1 case(s) |
| frame-tree-removed | killed | battery failed 1 case(s) |
| context-binding-removed | killed | battery failed 1 case(s) |
| same-element-removed | killed | battery failed 1 case(s) |
| send-log-allowlist-removed | killed | battery failed 1 case(s) |
| plan-calls-removed | killed | battery failed 1 case(s) |
| chooser-event-removed | killed | battery failed 2 case(s) |
| chooser-frame-removed | killed | battery failed 1 case(s) |
| law-removed | killed | battery failed 3 case(s) |
| law-sp-removed | killed | battery failed 1 case(s) |
| law-proxy-removed | killed | battery failed 1 case(s) |
| activation-parent-removed | killed | battery failed 1 case(s) |
| activation-child-removed | killed | battery failed 1 case(s) |
| proxy-law-removed | killed | battery failed 2 case(s) |
| proxy-log-removed | killed | battery failed 1 case(s) |
| state-law-removed | killed | battery failed 3 case(s) |
| state-parent-removed | killed | battery failed 1 case(s) |
| state-child-removed | killed | battery failed 1 case(s) |
| event-shape-removed | killed | battery failed 2 case(s) |
| event-trust-removed | killed | battery failed 1 case(s) |
| host-argv-removed | killed | battery failed 2 case(s) |
| teardown-removed | killed | battery failed 1 case(s) |
| run-window-removed | killed | battery failed 1 case(s) |
| prior-set-removed | killed | battery failed 1 case(s) |
| replay-identity-removed | killed | battery failed 1 case(s) |

Evidence: `R91Exec2-killpower.json`.

## (3) Gate runner — `selftest-r91-gates.mjs`

Exact invocation `node scripts/selftest-r91-gates.mjs --lane <lane> --work <scratch>/selftest --json`.
**Runner exit 0, `clean true`.** Five gates, every one exit 0:

| gate | exit | verdict | check count |
|---|---|---|---|
| counter-selftest | 0 | clean (`ok true`, `firstOk true`, `secondOk true`, ids `lane, law, proxy-law, prior-set`) | – (payload has no numeric count) |
| counter | 0 | clean, `checkCount 30` | 30 |
| battery | 0 | clean, `checkCount 44` | 44 |
| killpower | 0 | `verdict null` (payload has no `ok`/`verdict` key), `checkCount 32` | 32 |
| drift-selftest | 0 | clean, `checkCount` = array of 8 causal cases, each `injectedRed true / othersGreen true / ok true` | 8 |

The runner's battery and killpower gates reproduced the standalone numbers above (44 cases / 0 failed;
32 mutants / 0 killed-gap), so the same instruments gave identical verdict counts on two independent
invocations, one of which ran concurrently with the other under CPU contention.
Evidence: `R91Exec2-gates.json`, `R91Exec2-counter-selftest.json`.

## (4) Falsification controls for the harness itself (scratch-only, extra to the seat's three commands)

Two controls that answer "could these instruments report green while blind?" Both were run against
the same receipt/pins; neither touches the lane instruments (they consume copies in scratch).

1. **Inert counter** (`inert-counter.mjs`: prints `{verdict:"clean", findings:[]}`, exit 0) fed to the
   frozen battery via `--counter`: **battery exit 1, `cases 44`, `failed 43`** — only the positive
   control passed, every mutated receipt was refused for lack of the expected finding. The battery can
   fail, and it fails exactly on the 43 mutation cases.
2. **Survivor probe**: a scratch copy of the kill-power/battery/counter trio with one extra
   *semantically inert* mutant (`check('schema', …)` → itself): **33 mutants, 32 killed, `survived 1`
   (`inert-survivor-control`, "battery accepted the mutant"), exit 1.** The kill-power harness can
   detect and report a survivor; its 0-survivor result on the frozen 32 is not a blind spot of the
   harness.

Evidence: `R91Exec2-inert-battery.json`, `R91Exec2-survivor-probe.json`.

## Lane writes performed by this seat

- `.ufo/waves/round-91/w1/R91Exec2.md` (this report) and the seven `R91Exec2-*.json` evidence files
  beside it.
- **One incidental tracked-file write, by the frozen gate runner itself**: running
  `selftest-r91-gates.mjs` rewrites `.ufo/waves/round-91/scored/selftest.json` (its designed output;
  the seat spec names the command). Diff against the pre-run bytes is **one line** — `startedAt`
  (`16:14:36.638Z` → `16:21:16.545Z`); sha256 `85fea586…409f30` → `78d1e5aa…385dc0c`; all five gate
  entries (names, exits, verdicts, check counts) are identical. The artifact is therefore *not*
  byte-stable across runs, by construction.
- No other lane path was written, no instrument was edited, no git/jj state was mutated.

## Observations (record only — no amendment proposed)

1. The runner emits **five** gates, while `claims.json` at HEAD (D1 bytes) still says "gate runner
   green (six gates)" in `C1.legs.c`. The D2 re-freeze changed the runner to five instrument gates;
   the working-tree `claims.json` now says five and carries R91Exec3's `frozenAmendments` entry for it.
   My measurement agrees with the instrument: five.
2. `kill-power-proxy-round91.mjs` prints no `ok`/`verdict` field, so the runner records
   `verdict null` for that gate. Harmless — the frozen kill rule reads `survived/crashed/unapplied`,
   and exit 0 is the gate's criterion.
3. The runner stores `drift-selftest`'s `checkCount` as the array of case objects rather than a
   number, so the artifact's "check count" column is heterogeneous (30 / 44 / 32 / 8 cases / none).
   Cosmetic; the eight causal cases are all present and green.
4. The receipt's own laws read as the claim states them (spot-read from the committed bytes):
   `sp91-so-direct-noact.direct = {ok:false, NotAllowedError}`, 0 choosers;
   `sp91-xo-proxy-file-noact.proxy = {ok:false, NotAllowedError}`, `proxyLog[0].origin =
   http://127.0.0.1:19961`, 0 choosers; `sp91-xo-proxy-file-childact.proxy = {ok:true, ret:"undefined"}`,
   exactly one chooser whose `params.frameId === childFrameId`, `afterSendId 29`;
   `sp91-xo-proxy-file-parentact.proxy = {ok:false, NotAllowedError}` with
   `activationAfter.isActive true` / `childActivationAfter.isActive false`; `sp91-xo-direct-access`
   leaves `contentDocument` and `windowDocument` unreachable. This is a read, not a re-run: no
   Chromium was launched by this seat.

## Risks / limits of this measurement

1. **Leg (b) is counter-internal.** The battery and the kill-power both derive from the *same* counter
   source (`kill-power` reads it and rewrites clauses; `negatives` asserts its finding ids). A green
   pair proves the counter's checks are load-bearing against its own text, not that the checks are
   the right ones. The only *external* binding I added is the fixture/driver recomputation above
   (pins ↔ committed driver text) and the two harness falsification controls.
2. **No re-execution of the capability.** Nothing here launches Chromium; the runtime facts come from
   the one scored receipt (D1). A receipt that is internally consistent but fabricated would pass
   leg (b). The claim's own `limit` puts the full-identity forger outside the replay rule, and the
   counter's `replay-identity`/`prior-set` checks bind launch tokens against the two probe receipts —
   that binding was green here, but it is a token-identity check, not a re-run.
3. **The two child documents are byte-identical by design** (same sha), so "the same file/date/colour
   shapes in a same-origin and a cross-origin iframe" is carried entirely by the serving origin and
   by the per-leg element records. That is the intended construction, but it means a defect that only
   changed one document's bytes would be invisible to a bytes-only reading — the counter compares the
   *same* element record across both frames instead (`same-element-law`), which the battery exercises
   in two cases (`same-element`, `same-element-leg`) and the kill-power in one mutant.
4. **Concurrent lane edits.** During the window several sibling seats modified tracked files
   (`claims.json`, `LOG.md`, `SKILL.md`, `SCORECARD.md`, `corpus/*`, `controls/c1/nowork-*.json`,
   `README.md`, `plans/round-91.md`). None of those is an input to leg (b) except the prior set and
   the scored receipt, both of which I re-hashed after every run and found unchanged. Any later
   statement about "the lane at HEAD" must not attribute those edits to this seat.
5. **The gate artifact is not byte-reproducible** (timestamp field), so a later seat comparing
   `scored/selftest.json` to its own run will always see a diff in `startedAt`; compare the gate
   entries, not the file hash.

No blockers. Leg (b) re-measures green from committed bytes: 44/44 cases, 32/32 mutants killed, five
gates at exit 0, and the harness demonstrably able to report both a failing battery and a surviving
mutant.

## Retained evidence (beside this report, `.ufo/waves/round-91/w1/`)

| file | sha256 |
|---|---|
| R91Exec2-battery.json | e21042e7cd45e452c63fc5149417818593ecc6ada52a0b06cece2adf061b3b12 |
| R91Exec2-killpower.json | 29aa84f4cde45a65acc79aac2e3c579e4c911dbea8edabb20087319be806d227 |
| R91Exec2-gates.json | 1bcd463fa8a076eed2877ddb6f7133ff820ec8030d83beb1e2397e8be1a0d0d9 |
| R91Exec2-counter-selftest.json | 468918c606ea91c3f94291000e12eebbfec6fbe71c3f032a700a11632a18ddda |
| R91Exec2-fixture-recompute.json | 44f5d7855f269f57302cbee654a9433ecfa698114f8710b482d34c3d84c4543b |
| R91Exec2-inert-battery.json | b8e1a0c3b27ae3b24b0597933512658668e53e7c82b8343ecb30b75062f060d8 |
| R91Exec2-survivor-probe.json | dd320a1746fc3ccfd7e61d0f41d28e63752ada24ddb5230a2a6d514bba1c230b |
