# R92Mut — counter mutation sweep (kill power of the frozen battery over the frozen counter)

Seat: R92Mut · Predicate `C1-IFRAME-CHOOSER-R92` (round 92 C1, `chromium-crosssite-iframe-chooser-linux`)
Lane mirror: `/fast/scratch/hyaku/tabi-r92/R92Mut/lane-mirror` (copies of the 3 frozen
instruments + r91 receipt; the batch harness ran the battery there)
Positive control: `.ufo/waves/round-92/controls/receipt-positive.json`, nonce `tabi-r92-ctl-pos`,
pin `0feca90ba0272d92d3444d1b23bf0e85a089946408fe52e383e8ddf740321688`

Frozen-counter sha256: `d4d84f92be292911aef9591da8888f7a59aa07384c32f755961046a5a410efc5`
(lane copy verified identical before and after: same hash, `R92Mut-results.json:restoration_ok=true`).

## Baseline

- `node <mirror>/scripts/negatives-iframe-chooser-round92.mjs --lane <mirror>
  --receipt .ufo/waves/round-92/controls/receipt-positive.json --expect-nonce tabi-r92-ctl-pos
  --expect-driver-sha256 0feca90b…721688 --scratch <scratch> --json`
- Pristine: **exit 0, 31/31 ok** (incl. `positive` clean). Re-run on restored bytes: exit 0, 31/31.
- No Chromium was run by this seat (no driver invocation, no live mode); all runs are
  receipt-mode counter runs under `node`. No port triple was ever required.

## Method

63 mutants generated from the frozen counter copy in the mirror lane (lane copies never edited):
27 `check(...)` negations (condition → `!(cond)`, plus `leg-shape` `false`→`true`), 26
neutralizations (condition → `true`), 10 operator mutants (`===→!==`, `length===1→>=1`,
`&&→||`, drop X/S session branch, swap `'iframe'`/`'page'`, ANSWER size 22→21, leg-set sort
removed, `reps===→>=`). Each mutant counter was swapped into the mirror lane, the frozen
battery was re-run against the positive control, the verdict recorded, and pristine bytes
restored. `killed` = battery rc 1 (rc 0 for the `positive` case means the mutant passed a
known-good receipt); `survived` = battery rc 0, 31/31. Full per-mutant table (old/new strings,
mutant sha256, failed cases) is in `R92Mut-results.json`.

## Result: 56 killed / 7 survived / 0 inconclusive

- Negations 26/27 killed (all via the `positive` case failing, as expected — negating a check
  rejects the genuinely-good receipt). `neg-leg-shape` survived vacuously (see below).
- Neutralizations 23/26 killed; survivors: `neu-reps`, `neu-answer`, `neu-parent-url`.
- Operator mutants 7/10 killed; survivors: `op-count-ge1`, `op-legset-nosort`, `op-reps-ge`.

## The 7 survivors, classified

Every survivor is a **battery gap**, not a falsifies-wording finding:
- None of the 7 corresponds to a wrong *behavior* the claim words. Each survivor widens or
  drops a *counter identity*: global `reps`, global `answer` object, `parent-url` host/port/path,
  X `attached`/`iframeTargets` length threshold (`>=1`), leg-name ordering, global `reps` `>=`.
- `neu-parent-url` (drop parent URL check): a receipt with a wrong parent URL could pass.
  The claim words a parent page `http://127.0.0.1:<http>/parent.html` — but the per-leg
  `child-url` still binds the child, and the claim's leg behaviour is about the child.
  Battery gap; in `--live` mode the parent URL is served by the pinned driver itself, so no
  wrong-browser-behaviour can hide behind it.
- `neu-answer` (drop the global `answer` schema check): the per-leg `child-files` check still
  binds `[["tabi-r92-answer.txt", 22]]`, which is the wording's behaviour. A forged
  receipt `answer` object passes receipt mode, but the claim's counting command is `--live`
  (declared limit 6), where the driver writes the answer. Battery gap.
- `neu-reps` + `op-reps-ge` (global `reps` check dropped/relaxed): the per-leg `leg-set`
  check still requires exactly `{X-1..3, S-1..3}`, so "3 repetitions of two arms" is
  enforced by `leg-set`, not by `reps`. Battery gap; the wording is not falsified.
- `op-count-ge1` (X `attached`/`iframeTargets` length `>=1` instead of `==1`): a receipt
  with 2 attached iframes in X could pass. The claim words "exactly one attached target".
  Counter-wide wording gap, but not exercised by the battery — and the real driver attaches
  via `Target.setAutoAttach` with flatten, reporting what Chromium gives; the `chooser-count`/
  `leg-set` checks do not bind a second unused iframe. Classified battery gap (the battery
  has no two-iframe forged case), worth one extra battery case; it does not show a named
  real-browser behaviour false, because the actual X behaviour (one iframe target) is still
  measured by the good receipt.
- `op-legset-nosort` (leg-name order not sorted): any ordering of the 6 legs passes.
  The claim words "in every one of the 6 legs" with no order requirement. Battery gap.
- `neg-leg-shape` (`leg-shape false→true`): the `leg-shape` finding fires only on a non-object
  leg; a non-object leg cannot occur in a driver-written receipt (driver always writes an
  object). The battery has no non-object-leg case. Not a behaviour in the claim wording.
  Battery gap / vacuous mutant.

Conclusion: the frozen battery kills 56/63 mutants and its 7 survivors are counter-identity
gaps (widening/dropped bookkeeping checks), none of which makes a named real-browser behaviour
in the claim wording false while the counter stays green. The one behaviour-adjacent gap is
`op-count-ge1` (a synthetic two-iframe receipt), which is a battery omission, not a wording
falsification — the good driver's real behaviour is still exactly-one.

## Verification evidence

- commands (all `rc` exact):
  - pristine battery: rc 0, 31/31
  - restored-bytes battery: rc 0, 31/31
  - sweep harness: rc 0, summary KILLED 56 / SURVIVED 7 / INCONCLUSIVE 0
- restoration: mirror counter sha256 after sweep equals pristine
  (`d4d84f92…`, `restoration_ok: true` in `R92Mut-results.json`); lane files' hashes unchanged.
- Scratch was removed after copying receipts into `.ufo/waves/round-92/w1/`.

VERDICT C1: neutral
