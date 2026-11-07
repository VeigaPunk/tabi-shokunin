FINDINGS

# R75Mut1 — 47 single-edit semantic mutants of the round-75 C1 counter, run through the battery copy

Seat R75Mut1, tabi round 75, wave w1. All work in `/fast/scratch/hyaku/tabi-r75/R75Mut1`
(deleted at exit), evidence copied to `.ufo/waves/round-75/w1/R75Mut1/receipts/`. No file in the
lane, the fleet root or any sibling seat was written; no `git`/`jj` mutation; no tool installed
(nothing to record under the tooling directive).

Target bytes (read-only copies with hashes in `receipts/pinned/SHA256SUMS`):

| file | sha256 |
|---|---|
| `scripts/check-dragdrop-r75.mjs` (counter) | `9b370790a97193ff662678b38b957b5cdaab06267092931ab1719bbed31c9270` |
| `scripts/negatives-dragdrop-r75.mjs` (battery) | `9df82b2eab2adb733123a209b51b596a64d71f552298fe894b33accaac9f0721` |
| `scripts/chrome-cdp-dragdrop-round75.mjs` (driver) | `d604552e408ed6998f32ead68e9732ba87b2ecfd7483d671ca95f63cf3228105` |

## 1. Baseline before any mutant is read

```
node base/negatives-dragdrop-r75.mjs --real <(a) receipt> --expect-driver-sha256 d604552e...   --expect-nonce tabi-r75-l1-57f28cf128e6 <16 --prior> <3 --laundered> --work base/w --jobs 6 --json
```
exit 0; summary `positiveOk:true, allOk:true, cases:254, passed:254, failed:[], checkIds:146,
coverageGap:[], isolatedCases:154`. A mutant is read only against this baseline; every mutant run
below reuses the same reference set ((a) receipt
`corpus/evidence/round75/chromium-drag-intercept/receipt.json`, the 16 PRE priors from
`controls/c1/prior-set.txt`, the 3 laundered degenerates).

## 2. Mutants and verdicts

47 single-edit mutants, each applied to an otherwise byte-identical copy of the counter, each beside
a copy of the battery and the pinned driver. Driver-enforced preconditions: each `from` string
occurs **exactly once** in the counter (`allSingleEdit: true`), the resulting bytes differ
(`allBytesChanged: true`), and **0 of 47** is an identical (from,to) pair to any of the 40
`SEMANTIC` entries in `controls/c1/kill-power-r75.mjs` (`frozenPairCollisions: []`,
`frozenSemanticCount: 40` — `receipts/phase3.json`, entry `(audit)`; that audit also reports the two
mutants that reuse a *from-string* a frozen mutant edits with a different replacement:
`A17-runwindow-floor-4450`, `A31-own-gaps-floor-zero`).

Per mutant, `<copy>` = `m/<id>/` containing `check-dragdrop-r75.mjs` (mutated),
`negatives-dragdrop-r75.mjs`, `chrome-cdp-dragdrop-round75.mjs`, and:

```
node <copy>/negatives-dragdrop-r75.mjs --real <(a) receipt> \
  --expect-driver-sha256 d604552e408ed6998f32ead68e9732ba87b2ecfd7483d671ca95f63cf3228105 \
  --expect-nonce tabi-r75-l1-57f28cf128e6 <16 --prior> <3 --laundered> \
  --work <copy>/w --jobs 4 --json
```
Verdict rule (kill-power r75): exit 0 + `allOk` = SURVIVED; exit 1 + parsable summary with a
non-empty `failed` list = KILLED; anything else = CRASHED. Full summaries are preserved per mutant
in `receipts/battery-out/<id>.out.gz` (254 cases each); the tabulated fields are in
`receipts/phase1c.json`.

**34 SURVIVED, 13 KILLED, 0 CRASHED.**

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

## 3. Killed mutants (the battery has power here)

| mutant | battery exit | failed cases (all) |
|---|---|---|
| `A11-devtools-port-any` | 1 | `devtools-port-binding` |
| `A18-leg-error-null-ignored` | 1 | `start-error`, `intercept-on-error`, `press-error`, `move-start-error`, `move-far-error`, `enter-dz-error`, `over-dz-error`, `drop-dz-error`, `release-error`, `ext-enter-nz-error`, `ext-drop-nz-error`, `ext-enter-dz-error`, `ext-cancel-error`, `ext-drop-dz-error` |
| `A19-leg-error-any-string` | 1 | `bad-type-error-other` |
| `A20-legstate-drops-only` | 1 | `start-state`, `intercept-on-state`, `press-state`, `move-start-state`, `move-far-state`, `enter-dz-state`, `over-dz-state`, `drop-dz-state`, `release-state`, `ext-enter-nz-state`, `ext-drop-nz-state`, `ext-enter-dz-state`, `ext-cancel-state`, `ext-drop-dz-state`, `bad-type-state` |
| `A23-window-lower-prev-mark` | 1 | `event-leg-domain`, `event-leg-fabricated-label` |
| `A24-event-at-order-dropped` | 1 | `event-leg-window-order` |
| `A30-timeline-tol-tight` | 1 | `replay-timeline-sub-quantum` |
| `A31-own-gaps-floor-zero` | 1 | `replay-timeline-too-few-gaps` |
| `A38-cancel-idx-shift` | 1 | `cancel-clears-dragleave` |
| `A40-coord-exempt-drop` | 1 | `coordinate-law`, `coordinate-law-y` |
| `B01-sendlog-some` | 1 | `lookalike-dispatch-key`, `lookalike-cancel-dragging`, `lookalike-emulate-touch`, `lookalike-file-input`, `lookalike-layout-metrics`, `lookalike-touch-emulation`, `lookalike-script-dragevent`, `lookalike-events-push`, `lookalike-textcontent`, `lookalike-call-function-on`, `allowlist-dmo-scale-param`, `allowlist-eval-extra-param`, `allowlist-navigate-other-run`, `allowlist-params-absent`, `laundered-script-events` |
| `A41-intercept-data-items-only` | 1 | `intercept-data-mask` |
| `A43-shape-dropped-literal` | 1 | `(positive)`, `schema`, `nonce-shape`, `nonce-on-page`, `scored-run-not-degenerate`, `degenerate-field-absent`, `server-log-binding`, `driver-pin`, `fixture-hash`, `fixture-hash-absent`, `host-chromium`, `devtools-port-binding`, `devtools-stderr-absent`, `run-window-short`, `run-window-long`, `plan-frozen`, `plan-frozen-dropped-leg`, `leg-order`, `leg-order-swap-empty`, `leg-params`, `leg-params-cmd`, `leg-params-elapsed-string`, `leg-params-sentdata-other`, `leg-params-sentdata-on-ext`, `seq-monotonic`, `event-leg-domain`, `event-leg-fabricated-label`, `event-types-ts-string`, `event-types-trusted-string`, `event-types-unknown-type`, `event-types-x-float`, `event-types-dt-on-pointer`, `event-types-dt-partial`, `event-time-quantum`, `event-time-quantum-at`, `leg-marks-late`, `leg-marks-fabricated-name`, `leg-marks-closed-early`, `event-leg-window-late-label`, `event-leg-window-order`, `drag-call-count-dropped`, `drag-call-count-extra`, `drag-call-count-case-variant`, `drag-call-count-no-intercept-on`, `drag-call-params`, `drag-call-params-data`, `drag-call-params-order`, `intercept-event-late`, `intercept-event-early`, `intercept-event-duplicate`, `intercept-event-absent`, `intercept-data`, `intercept-data-mask`, `cdp-event-log-extra-key`, `cdp-event-log-other-event`, `lookalike-dispatch-key`, `lookalike-cancel-dragging`, `lookalike-emulate-touch`, `lookalike-file-input`, `lookalike-layout-metrics`, `lookalike-touch-emulation`, `lookalike-script-dragevent`, `lookalike-events-push`, `lookalike-textcontent`, `lookalike-call-function-on`, `allowlist-dmo-scale-param`, `allowlist-eval-extra-param`, `allowlist-navigate-other-run`, `allowlist-navigate-twice`, `allowlist-id-gap`, `allowlist-params-absent`, `teardown-closure`, `teardown-sweep-count`, `teardown-port-open`, `failures-empty`, `producer-verdict-false-CONFIRMED`, `producer-verdict-true-REFUTED`, `producer-verdict-false-REFUTED`, `producer-verdict-null-CONFIRMED`, `producer-verdict-string-true`, `producer-verdict-one`, `producer-verdict-true-UNKNOWN`, `producer-verdict-true-lowercase`, `producer-verdict-true-UNMEASURED`, `producer-verdict-true-null`, `producer-verdict-old-field`, `legshape-consistency`, `legshape-fabricated-leg`, `nonce-expected`, `replay-byte-identical`, `replay-nonce-stamps-rewritten`, `replay-token-only-shared`, `replay-url-only-shared`, `replay-url-uppercase`, `replay-timeline-only-shared`, `replay-timeline-1e-12`, `replay-timeline-sub-quantum`, `replay-timeline-whole-shift-1ms`, `replay-timeline-whole-shift-100ms`, `replay-timeline-prior-has-extra-event`, `replay-timeline-prior-missing-event`, `replay-timeline-half-retimed`, `replay-timeline-too-few-gaps`, `replay-launch-token-shape`, `trust-law`, `trust-law-pointer`, `data-protection-enter`, `data-protection-custom`, `data-protection-drop-empty`, `no-native-session-marker`, `no-native-session-early-enter`, `drop-acceptance-nz-dropped`, `drop-acceptance-dz-left`, `drop-acceptance-unprevented`, `drop-acceptance-extra-leave`, `cancel-clears-dragleave`, `cancel-clears-late-drop`, `source-lifecycle-effect`, `source-lifecycle-no-end`, `source-lifecycle-drag-target`, `source-lifecycle-end-before-drop`, `coordinate-law`, `coordinate-law-y`, `coordinate-law-dragstart`, `mask-effect-law`, `mask-effect-law-dragstart`, `start-seq`, `start-trusted`, `start-prevented`, `start-xy`, `start-dt`, `start-state`, `start-state-drops`, `start-error`, `intercept-on-seq`, `intercept-on-trusted`, `intercept-on-prevented`, `intercept-on-xy`, `intercept-on-dt`, `intercept-on-state`, `intercept-on-state-drops`, `intercept-on-error`, `press-seq`, `press-trusted`, `press-prevented`, `press-xy`, `press-dt`, `press-state`, `press-state-drops`, `press-error`, `move-start-seq`, `move-start-trusted`, `move-start-prevented`, `move-start-xy`, `move-start-dt`, `move-start-state`, `move-start-state-drops`, `move-start-error`, `move-far-seq`, `move-far-trusted`, `move-far-prevented`, `move-far-xy`, `move-far-dt`, `move-far-state`, `move-far-state-drops`, `move-far-error`, `enter-dz-seq`, `enter-dz-trusted`, `enter-dz-prevented`, `enter-dz-xy`, `enter-dz-dt`, `enter-dz-state`, `enter-dz-state-drops`, `enter-dz-error`, `over-dz-seq`, `over-dz-trusted`, `over-dz-prevented`, `over-dz-xy`, `over-dz-dt`, `over-dz-state`, `over-dz-state-drops`, `over-dz-error`, `drop-dz-seq`, `drop-dz-trusted`, `drop-dz-prevented`, `drop-dz-xy`, `drop-dz-dt`, `drop-dz-state`, `drop-dz-state-drops`, `drop-dz-error`, `release-seq`, `release-trusted`, `release-prevented`, `release-xy`, `release-dt`, `release-state`, `release-state-drops`, `release-error`, `ext-enter-nz-seq`, `ext-enter-nz-trusted`, `ext-enter-nz-prevented`, `ext-enter-nz-xy`, `ext-enter-nz-dt`, `ext-enter-nz-state`, `ext-enter-nz-state-drops`, `ext-enter-nz-error`, `ext-drop-nz-seq`, `ext-drop-nz-trusted`, `ext-drop-nz-prevented`, `ext-drop-nz-xy`, `ext-drop-nz-dt`, `ext-drop-nz-state`, `ext-drop-nz-state-drops`, `ext-drop-nz-error`, `ext-enter-dz-seq`, `ext-enter-dz-trusted`, `ext-enter-dz-prevented`, `ext-enter-dz-xy`, `ext-enter-dz-dt`, `ext-enter-dz-state`, `ext-enter-dz-state-drops`, `ext-enter-dz-error`, `ext-cancel-seq`, `ext-cancel-trusted`, `ext-cancel-prevented`, `ext-cancel-xy`, `ext-cancel-dt`, `ext-cancel-state`, `ext-cancel-state-drops`, `ext-cancel-error`, `ext-drop-dz-seq`, `ext-drop-dz-trusted`, `ext-drop-dz-prevented`, `ext-drop-dz-xy`, `ext-drop-dz-dt`, `ext-drop-dz-state`, `ext-drop-dz-state-drops`, `ext-drop-dz-error`, `bad-type-seq`, `bad-type-trusted`, `bad-type-prevented`, `bad-type-xy`, `bad-type-dt`, `bad-type-state`, `bad-type-state-drops`, `bad-type-error`, `bad-type-error-other`, `accept-real-key-order`, `accept-prior-retimed-nonuniform`, `accept-prior-third-retimed`, `accept-on-grid-exact-decimal`, `accept-mark-equal-event-at` |

Kill quality, disclosed: `A23-window-lower-prev-mark` is KILLED **by a throw, not by
discrimination**. Its two failed cases (`event-leg-domain`, `event-leg-fabricated-label`) are cases
where an event carries a leg label outside `LEG_ORDER`; the mutant's `marks[i - 1]` becomes
`marks[-1]` and the *detail string* built at `check:214` dereferences it (measured: exit 1, stderr
`TypeError ... at check-dragdrop-r75.mjs:214:160`, no JSON on stdout, so the battery scores the case
as failed with `exit: null`). The frozen counter refuses the same receipt cleanly (11 ids, including
`event-leg-domain`). The semantic content of the edit — a leg window that starts one mark early — is
therefore **not** exercised by any battery case; treat A23 as "killed by crash, semantics untested"
The surrounding kills (`A40`, `A38`, `A30`, `A31`) are clean semantic kills.

Power observed: the per-leg `state`/`error` series (A18, A20, A24 and A23, whose refusal comes from
the window/domain cases), `intercept-data`'s mask comparison (A41), the dragCancel boundary (A38),
the sub-quantum replay case (A30), the `ownGaps >= 6` floor (A31), the coordinate exemption (A40),
`every`->`some` on the send allow-list (B01), and any SHAPE literal the real receipt pins (A43).

## 4. Survivor evidence — 27 witnesses, 7 arguments, 0 undocumented

A witness is a receipt (plus, for the timeline mutants, one crafted `--prior`) for which the
**mutant exits 0** and the **frozen counter exits 1**. Recipe used for every entry (this is the
battery's own `launderInto`, applied with the frozen counter so the producer's `legShape` cannot
carry the refusal):

```
node <copy>/check-dragdrop-r75.mjs --receipt receipts/w-<id>.receipt.json \
  --expect-driver-sha256 d604552e408ed6998f32ead68e9732ba87b2ecfd7483d671ca95f63cf3228105 \
  --expect-nonce <that receipt's nonce> <16 --prior> [--prior receipts/p-<id>.prior.json] --json
```
The witness receipt is written with `legShape` set to the frozen counter's own `derived` block (run
once, then rewrite); for the four acceptance timelines and the false-positive one the receipt is the
unmodified (a) receipt and only the extra prior is crafted.

### 4a. Acceptance witnesses (mutant 0 / frozen 1) — 26
`A01,A02,A03,A04,A05,A06,A08,A09,A10,A12,A13,A14,A15,A16,A17,A21,A22,A25,A26,A27` (receipt edits,
`receipts/w-<id>.receipt.json`), `A28,A29,A32,A33` (crafted prior, `receipts/p-<id>.prior.json`),
`B03,B04` (`receipts/w-B03.receipt.json`, `receipts/w-B04.receipt.json`). Worked examples, all
measured:

- `A01` — `serverLog` emptied: frozen exit 1 (`server-log-binding`), mutant exit 0. The battery only
  rewrites `run` on existing rows (`negatives-dragdrop-r75.mjs:81`), so a receipt with no served page
  at all is never tried.
- `A13` — `teardown.postKillCurl.fixture = 28` (curl timeout instead of 7 = connection refused):
  frozen exit 1 (`teardown-closure`), mutant exit 0 (`>= 7`). `postKillCurl` is never touched by any
  battery case (`grep -n postKillCurl scripts/negatives-dragdrop-r75.mjs` -> no hit).
- `A22` — leg marks 14 and 15 transposed: frozen exit 1 (`leg-marks`, `event-leg-window`,
  `cancel-clears-session`), mutant exit 0. `leg-marks` is only tested via a fabricated *name* and via
  the last-mark/`closedAt` relation (`negatives:111`), never for internal monotonicity.
- `A28` — prior sharing 9/17 event times: frozen `maxAbs 0.5294 >= 0.5` -> `replay-event-timeline`,
  exit 1; mutant (`FRAC = 0.55`) `0.5294 < 0.55`, exit 0. Same receipt, same prior set; only the
  threshold differs (`scripts/check-dragdrop-r75.mjs:175`).
- `A29` — prior = whole timeline +1000 ms (abs 0) with two of the eight `>= 50 ms` gaps broken:
  frozen `maxGap 0.75 >= 0.75` -> exit 1; mutant (`GAP_FRAC = 0.85`) `0.75 < 0.85` -> exit 0.
- `A32` — prior built with first-fit/last-fit-ambiguous partners around the 0.1 ms-apart
  (2310.1, 2310.2) events: frozen `maxAbs 0.5294` (9/17) -> refuse; mutant with `findLastIndex`
  `0.4706` (8/17) -> accept. The decisive band is measured: |pb-r1| = 0.04999997615823304,
  |pb-r2| = 0.049999988078980095, |r2-r1| = 0.09999996423721313.
- `B04` — a `Runtime.evaluate` send with expression `window.__events.length` appended to the send
  log: frozen exit 1 (`send-log-allowlist`), mutant exit 0 (the expression was added to `EXPRS`).
  The battery's ten lookalike expressions (`negatives:139-149`) do not include it.

### 4b. False-positive witness (mutant refuses, frozen accepts) — 1
`A34` (`Math.abs(d) < TOL` -> `< TOL * 2`, inside `matchCount` only): receipt = (a), prior = +1000 ms
with three gaps shortened by 0.08 ms. Frozen exit 0 (`maxGap 0.5`), mutant exit 1
(`replay-event-timeline`, `maxGap 1.0`). An honest pair is refused as a replay; the same class of
edit in the other direction is therefore a liveness defect, not just a leniency one.

### 4c. Equivalence / argument — 7
- `A35` (`Number.isInteger(e.items)` -> `num(e.items)`), `A36` (`num(e.ts)` ->
  `typeof e.ts === 'number'`), `A37` (a `dragenter` filtered out of the drop-acceptance law):
  **verdict-equivalent, id-set weaker.** Probes (`receipts/phase2b.json`) give the mutant a violating
  receipt and both counters exit 1; the mutant just loses one id (`event-types` for A35/A36,
  `drop-acceptance-law` for A37) because the per-leg `leg-*-dt` / `leg-*-seq` re-derivation pins the
  same field against the SHAPE table (`check:262-269`). For A36 this is provable for JSON inputs: the
  only non-finite number a JSON document can carry is `1e400` -> `Infinity`, and `onGrid(Infinity)`
  is false, so `event-time-quantum` always refuses (measured, `receipts/phase2b.json` A36).
- `A39` (mask-table entry `16: 'move'` -> `16: 'link'`): **equivalent by unreachability.** `maskName`
  is called with the dispatched mask only (`check:305`); `intercept-data` pins the intercepted mask
  to 17 (`check:47`, `check:229`), the scripted external drag is mask 1 (`check:46`), and
  `leg-params` pins every dispatched param to the frozen plan — so entries 2/16/3/18/19 are dead.
  Probe: an external dispatch with mask 16 -> both counters exit 1 with the *same* single id
  (`drag-call-params`).
- `A07` (nonce charset widened with `_`): **unobservable through the CLI.** `--expect-nonce` keeps the
  strict `^tabi-r75-[a-z0-9-]+$` gate, so both counters exit 2 on an underscore nonce (measured:
  mutant and frozen both `exit=2`, `ids:["usage"]`); with a strict `--expect-nonce` the same receipt
  is refused by both with the identical id triple
  `["nonce-shape","nonce-expected","fixture-hash"]` (`receipts/phase3.json`,
  `receipts/e-A07-underscore.receipt.json`).
- `B02` (`GAP_MIN = 50` -> `10`): **inert on all 17 pinned receipts** (measured: gaps in [10,50) per
  receipt/prior = `[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0]` — only one prior, smoke8, has one such gap,
  and it can never match a receipt gap; the counter's `timeline` block is identical, `maxGap 0.25`,
  both exit 0). Direction is a *tightening*; the reachable failure mode is over-refusal of an honest
  pair carrying a 10-50 ms gap, which the frozen 15-leg plan (300 ms settles, `elapsedMs` 302-323 ms)
  does not produce.
- `A42` (`'trust-law'` removed from `CHECK_IDS`): **structural.** `--list-checks` 146 -> 145 while the
  counter still emits the finding, so all 254 cases pass. The battery's coverage guard takes its
  universe *from the mutant*: `coverageGap = listed.filter((id) => !covered.has(id))`, where `listed`
  is the mutant's own `--list-checks` output (`negatives-dragdrop-r75.mjs:306-308`). The counter's own
  closure check (`check:316`, `missing = CHECK_IDS.filter(...)`) cannot see an id that was deleted
  from the list it filters. Any *unevaluated* check could be hidden the same way as long as its id is
  also deleted.

## 5. Coverage findings — the classes the battery does not exercise

1. **Identity/host bindings are pinned at exactly one value each.** Untested: an empty `serverLog`
   (`check:153`, A01), `cdpProduct` alone (`check:165`, A02), the DevTools URL host (`check:168`,
   A03), `schema` equality vs substring (`check:147`, A08), `nonceOnPage` trimmed equality
   (`check:150`, A09), the fourth Chromium version component (`check:165`, A10), and a receipt that
   declares `fixture.sha256: null` (`check:163`, A12).
2. **Shape literals are pinned at one length and one anchor.** launchToken 12 -> 12+ hex
   (`check:171`, A04), browser id 36 -> 36+ chars and the dropped `$` anchor (`check:173`, A05, A06)
   all pass. The battery only tries `'x'` (`negatives:199`) and an uppercased URL (`negatives:188`).
3. **Teardown.** `postKillCurl` values (A13) and `portProbes.fixture` (A14) are never mutated;
   `teardown-closure` only sees `survivors`/`postKillSweepCount`/`portProbes.devtools`
   (`negatives:159-161`).
4. **Per-leg metadata boundaries.** `elapsedMs >= 0` (A16) and `sentData === null` vs absent (A21)
   are untested; the battery tests a *string* elapsedMs (`negatives:96`).
5. **Leg marks.** Internal monotonicity of `legMarks` is untested (A22), so a receipt whose marks no
   longer form a timeline can carry events labelled by legs that had not started or had already
   ended.
6. **Producer surfaces.** `returnByValue: true` (A25), non-empty params on the `EMPTY` methods
   (`check:236`, A26), extra keys on the dragIntercepted params (`check:230`, A27) and the `EXPRS`
   membership itself (B04) all pass; the battery only tests an *extra* param on `Runtime.evaluate`
   (`negatives:154`) and ten foreign expressions.
7. **The timeline matcher is tested only through the abs path.** Every replay case is an exact copy,
   a whole shift or a ±0.04 ms / 1e-12 perturbation, so the thresholds are never exercised at their
   boundary (A28 at 0.5/0.55, A29 at 0.75/0.85), and the pairing rule (A32), the merge direction
   (A33) and the gap tolerance (A34) are all free. The two edits the battery *does* kill here (A30
   TOL -> 0.02, A31 floor removed) show its power sits exactly at the `replay-timeline-sub-quantum`
   (`negatives:191`) and `replay-timeline-too-few-gaps` (`negatives:197`) points, and nowhere between
   them.
8. **`run-window` floors.** Only +4000 ms and +700000 ms are tried (`negatives:88-89`); a 50 ms
   reduction of the 4500 ms floor passes (A17).
9. **Closure is self-referential** (A42, §4c) — the one survivor that weakens the counter's own
   self-check rather than a predicate.
10. **Dead table entries** (A39): mask names for 2/3/16/18/19 are unreachable given `intercept-data`
    + `EXT` + `leg-params`; an edit there is equivalent, which also means those rows can never be
    validated by any receipt — a lint/documentation issue rather than a hole.

## 6. What a survivor does and does not mean

- A survivor is a **coverage finding**: the battery's 254 cases pass on the mutated counter, and a
  receipt exists (or an argument holds) that separates the mutant from the frozen counter. It is not
  a claim that the frozen counter is wrong, and it does not touch the predicate, the counter, the
  pins, the priors, the thresholds or the kill rule.
- The 34 survivors do not falsify C1-DRAGINTERCEPT-R75: the (a)/(b) receipts pass the **frozen**
  counter, and the frozen kill-power control still holds on its own 40 edits + 146 force-true
  mutants. What they show is that the kill-power control's *semantic class* is narrower than the
  counter's semantics: 34 of 47 edits outside those 40 are invisible to the battery.
- None of the witnesses is a real run: each is a field-level edit of the (a) receipt (or a crafted
  prior). They are refusals the counter is supposed to make, so a mutant that accepts them is a
  defect of the *counter's* discrimination, not evidence about Chromium.

## 7. Method notes (honesty about the harness)

- `A43-shape-dropped-literal` was first scored CRASHED by my sweep. Cause: the battery's `--json`
  summary for 252 failed cases is 212 818 bytes, and `console.log` + `process.exit` through a **pipe**
  truncates it (measured: the identical invocation redirected to a file parses cleanly and yields
  `failed: 252`). The sweep now captures stdout to a file for every mutant; with that capture A43 is
  KILLED (exit 1, 3/254, failed list non-empty). The "a crashed battery is never a kill" rule is only
  as good as the capture: a pipe can forge a crash.
- Mutant batteries ran with `--jobs 4` (spec allows <= 6); the pristine baseline used `--jobs 6`.
- Wall clock: baseline 3.1 s; 47-mutant sweep 89 s; witness/phases 11 s + 2 s + a few seconds.

## 8. Edits (all 47)

| mutant | edit (`from` -> `to`) | intent | mutant sha256 |
|---|---|---|---|
| `A01-serverlog-empty-ok` | `served.length >= 1 && served.every((s) => s.run === r.nonce)` -> `served.every((s) => s.run === r.nonce)` | the /-serve requirement is dropped: a receipt whose serverLog has no 200 / row passes | `cd8510ef46e1fb250ff59b9cef90a6be5e89a17dafc1d8a310de5ed5e61407ba` |
| `A02-cdp-product-unchecked` | ` && typeof host.cdpProduct === 'string' && /^HeadlessChrome\/\|^Chrome\//.test(host.cdpProduct)` -> `` | the CDP product string is no longer bound to HeadlessChrome/Chrome | `3f7dd5210e1d2be7d9a6c74d17b034cb61c1d2ddb9bea7980a0b22d50ca630e4` |
| `A03-devtools-host-unbound` | `dl.url.startsWith('ws://127.0.0.1:' + argvPort + '/devtools/browser/')` -> `dl.url.includes('/devtools/browser/')` | the DevTools websocket URL is no longer required to point at 127.0.0.1:<launched port> | `d8ab2913a0ce9259a526599a16d66ff251696cb531a8d0124b5e84952a51654d` |
| `A04-launch-token-len` | `/^[0-9a-f]{12}$/.test(tok)` -> `/^[0-9a-f]{12,}$/.test(tok)` | launch token length pin relaxed from exactly 12 hex to >= 12 | `2844e8661d517a88185642b240327fb6fb8fddc2bbd2ff75eb69d3b40591bf89` |
| `A05-browser-id-len` | `([0-9a-f-]{36})$/i` -> `([0-9a-f-]{36,})$/i` | DevTools browser id uuid length pin relaxed from exactly 36 to >= 36 (and [0-9a-f-] stays, so this is the length only) | `1f0bb3e2c522f2ad2e15e61db29f525c39fab544b4bb6c6f7c31a20fcfb11c83` |
| `A06-browser-id-no-anchor` | `([0-9a-f-]{36})$/i` -> `([0-9a-f-]{36})/i` | the browser-id capture is no longer anchored at the URL end: a path continuing past the uuid is accepted | `b310c68a988deacf81d2a133acd6691007b14e791b09c56b12c5a5fddedf2ad1` |
| `A07-nonce-charset` | `check('nonce-shape', typeof r.nonce === 'string' && /^tabi-r75-[a-z0-9-]+$/.test(r.nonce)` -> `check('nonce-shape', typeof r.nonce === 'string' && /^tabi-r75-[a-z0-9_-]+$/.test(r.nonce)` | nonce charset widened with underscore, so a non-canonical nonce shape passes | `3eca9ccba5702ae56dffafd33fd95f1f186f399cdd2ad107461eb2e15d97b70d` |
| `A08-schema-substring` | `check('schema', r.schema === 'tabi-chrome-cdp-dragdrop-r75'` -> `check('schema', typeof r.schema === 'string' && r.schema.includes('tabi-chrome-cdp-dragdrop-r75')` | schema identity relaxed from equality to substring containment | `c43b291824b315658b44eeeeb04731c5f8746dfcd60ba1cca4d53c09c4d49798` |
| `A09-nonceonpage-trim` | `r.nonceOnPage === r.nonce` -> `typeof r.nonceOnPage === 'string' && r.nonceOnPage.trim() === r.nonce.trim()` | page nonce equality relaxed to trimmed equality | `19fdc45ded5216c080e6b83edf0f770599cbddfc63d0d198ff8d413e0345bf35` |
| `A10-chromium-version-3part` | `/^Chromium \d+\.\d+\.\d+\.\d+/` -> `/^Chromium \d+\.\d+\.\d+/` | the pinned Chromium version loses its fourth component | `8524af18d0e346cc7eeb2d11304a08b3ad4ed20c0c16e3116b00afe3a173004e` |
| `A11-devtools-port-any` | `dl.port === argvPort` -> `dl.port >= 1024` | reported DevTools listening port is unbound from the launched --remote-debugging-port | `4ffbf73e513978df5586f3e6415c2a30ac20e2976fc2a7f6ea6bd8c7bce5fb7f` |
| `A12-fixture-hash-null-ok` | `r.fixture.sha256 === fixtureWant` -> `(r.fixture.sha256 === fixtureWant \|\| r.fixture.sha256 === null)` | a receipt that declares no fixture hash at all is accepted | `f030cff80ae979967f125155aa25aa6f2cc815f5879ff05afbd3ea35e6024510` |
| `A13-postkill-curl-ge7` | `td.postKillCurl.fixture === 7 && td.postKillCurl.devtools === 7` -> `td.postKillCurl.fixture >= 7 && td.postKillCurl.devtools >= 7` | post-kill curl must be 7 (connection refused); loosened to >= 7 so 28 (timeout) / 52 (empty reply) pass | `6df7bb60517c6a3fb7084514b299695c1816695dd9a36ffff8c4f6343cf0f3fe` |
| `A14-portprobe-fixture-ignored` | `td.portProbes.fixture === 'closed' && ` -> `` | the fixture-port closed probe is no longer required (only the devtools probe remains) | `7632292c142b55f1e96febf4852e7789ad45abb155a8a1bfc8004812a233f134` |
| `A15-ts-positive-dropped` | `num(e.ts) && e.ts > 0 && num(e.at) && e.at > 0` -> `num(e.ts) && num(e.at) && e.at > 0` | event page timestamps may be zero/negative (an event predating the session) as long as they are numbers | `d84de069dc6213f3418f93dcb3603713f128163af2005ecd0939a164afae11b3` |
| `A16-elapsed-nonneg-dropped` | `num(l.elapsedMs) && l.elapsedMs >= 0` -> `num(l.elapsedMs)` | negative per-leg elapsedMs accepted | `86fd118f191a48ec4a83e84365071bc368f4c3c5ad1cd58c7ed00569e85d5960` |
| `A17-runwindow-floor-4450` | `t1 - t0 >= 4500` -> `t1 - t0 >= 4450` | the full-run floor (15 legs x 300 ms settle) shrinks by 50 ms | `87f85b14d6060714b8a6ddf322dba14ac7c704f29d97efc67b7d6a7befac0c1f` |
| `A18-leg-error-null-ignored` | `want.error === null ? leg.cdpError === null :` -> `want.error === null ? true :` | a leg that must produce no CDP error may carry one | `e7a92319bcf53574e6b0b53daeec7c6178650548280e5b1e2699adf80600f411` |
| `A19-leg-error-any-string` | `(typeof leg.cdpError === 'string' && leg.cdpError.includes(want.error))` -> `typeof leg.cdpError === 'string'` | any CDP error string satisfies the bad-type leg (-32602 message no longer required) | `a46cf13f920f2a3d446c9e02f69cfa663c92015dd6c5534678b65aa752c99b4e` |
| `A20-legstate-drops-only` | `canon(d.stateAfter) === canon(want.state)` -> `isObj(d.stateAfter) && d.stateAfter.drops === want.state.drops` | per-leg page state reduced to its drop counter: zone highlight and dragstart count are unchecked | `f339311da7c684684a921b0c89edc78a2b1771cfb14b89481608a12e2896b5d6` |
| `A21-sentdata-null-loose` | `(wantSent(FROZEN[i]) === null ? l.sentData === null :` -> `(wantSent(FROZEN[i]) === null ? l.sentData == null :` | an omitted sentData is indistinguishable from the required explicit null on non-INTERCEPTED legs | `1361f04ce79b881008ccc55717b6b73a30d7eac5c58e40480f93db1f5841ea4c` |
| `A22-marks-monotonic-vs-first` | `(i === 0 \|\| m.at >= marks[i - 1].at)` -> `(i === 0 \|\| m.at >= marks[0].at)` | leg marks only have to be >= the first mark: internal monotonicity is dropped | `93258211886673e92859cc49cee869af4f903dfdacfce70d35ee0bb5ae499e12` |
| `A23-window-lower-prev-mark` | `return marksOk ? [marks[i].at, i + 1 < marks.length ? marks[i + 1].at : r.closedAt] : null;` -> `return marksOk ? [marks[i - 1].at, i + 1 < marks.length ? marks[i + 1].at : r.closedAt] : null;` | each leg window starts one mark early: an event may be labelled with a leg that had not begun | `68c176f869def771202a73f2a2fc3d8eab4749fc49e326219b02f9b4ba47ab54` |
| `A24-event-at-order-dropped` | `return e.at >= w[0] && e.at <= w[1] && (i === 0 \|\| (num(events[i - 1].at) && e.at >= events[i - 1].at));` -> `return e.at >= w[0] && e.at <= w[1];` | handler times within a leg need no longer be non-decreasing | `94be10e64b8a883e1060d94dc7e1a3b3ee90333fb0f4f7261b8f9a69b7fc8f6b` |
| `A25-eval-returnbyvalue` | `canon({ expression: c.params.expression, returnByValue: true })` -> `canon({ expression: c.params.expression, returnByValue: c.params.returnByValue })` | Runtime.evaluate need not set returnByValue: true (an evaluate whose value is unobservable is allowed) | `db7e940b39e8ac0ddbddce00166f76cd8ae6cbb7dc01e3f028091d9cd3046f0e` |
| `A26-empty-params-any` | `if (EMPTY.has(c.method)) return canon(c.params) === '{}';` -> `if (EMPTY.has(c.method)) return true;` | Browser.getVersion/Page.enable/Runtime.enable may carry arbitrary parameters | `86044ee9ac5b22b09c1bb20fafc1f40d619fb8714c98cccfeb7bc9d046804600` |
| `A27-cdp-event-params-open` | ` && isObj(e.params) && canon(Object.keys(e.params)) === canon(['data'])` -> ` && isObj(e.params)` | dragIntercepted params may carry keys other than data | `2839ed0f8cb3b4982803d4c5b1155408bf120b754ebca114ddbc2f3cba273275` |
| `A28-timeline-frac-slack` | `TOL = 0.05, GAP_MIN = 50, FRAC = 0.5,` -> `TOL = 0.05, GAP_MIN = 50, FRAC = 0.55,` | timeline abs threshold loosened 0.5 -> 0.55 (a prior sharing just over half its event times is not a replay) | `cc27ea4885f6f3f2e97bf8beeb94dca9a3389b63649f87fa431a50e6050ce703` |
| `A29-timeline-gapfrac-slack` | `GAP_FRAC = 0.75;` -> `GAP_FRAC = 0.85;` | gap multiset threshold loosened 0.75 -> 0.85 | `40a20995413809fa898c07b20920798d4dafc4d2e5492dff3fd6bce0d7615700` |
| `A30-timeline-tol-tight` | `TOL = 0.05, GAP_MIN = 50, FRAC = 0.5,` -> `TOL = 0.02, GAP_MIN = 50, FRAC = 0.5,` | timeline tolerance tightened 0.05 -> 0.02 ms | `01f21de804aeb508d88525b6285be9d2423165f86552c0cdbf82fc84c0f93c2b` |
| `A31-own-gaps-floor-zero` | `ownGaps >= 6 && ` -> `ownGaps >= 0 && ` | the >= 6 own-gap floor is dropped: a receipt whose whole timeline holds no >= 50 ms gap passes | `0436645a298b2f33957cfb1b3f71b397153b5859cada755ce9b3e5790c0b7731` |
| `A32-pairmatch-last-fit` | `const k = y.findIndex((v, i) => !used[i] && Math.abs(v[0] - e.ts) < TOL && Math.abs(v[1] - e.at) < TOL);` -> `const k = y.findLastIndex((v, i) => !used[i] && Math.abs(v[0] - e.ts) < TOL && Math.abs(v[1] - e.at) < TOL);` | greedy pairing picks the last admissible prior event instead of the first (mis-pairs near-duplicates) | `f56c591e7d5654b9a6835683953d8381b935afcd2f78c23f17889efda7811ec6` |
| `A33-matchcount-inverted-advance` | `else if (d < 0) i++; else j++;` -> `else if (d > 0) i++; else j++;` | the gap merge advances the wrong side, so equal-valued multisets under-count | `f925e09d1c953013725527e36d78e48080f4b69ce3468bb96e2e64ef92eb8b6a` |
| `A34-matchcount-tol2` | `if (Math.abs(d) < TOL) { n++; i++; j++; }` -> `if (Math.abs(d) < TOL * 2) { n++; i++; j++; }` | gap tolerance doubled inside the multiset matcher only | `7b24866a63185e1b8585481a395918d59b10b78b8cb7c9074472e96474e3164e` |
| `A35-dt-items-num` | `typeof e.effectAllowed === 'string' && Number.isInteger(e.items)` -> `typeof e.effectAllowed === 'string' && num(e.items)` | DataTransfer item count need only be finite, not an integer | `c1b1aca1f1d2839a60de943f7fb6d640d304ffefa9059826464e587a722206c4` |
| `A36-typed-ts-typeof` | `&& num(e.ts) && e.ts > 0 &&` -> `&& typeof e.ts === 'number' && e.ts > 0 &&` | ts accepted by typeof instead of finiteness | `2d253c71d22bc6625f0d8d271201a6c66a74067c83ea7fc526c894c9b3d7fc9e` |
| `A37-dropfilter-enter-dropped` | `const es = dragEv.filter((e) => e.leg === leg && e.type !== 'drag' && e.type !== 'dragend');` -> `const es = dragEv.filter((e) => e.leg === leg && e.type !== 'drag' && e.type !== 'dragend' && e.type !== 'dragenter');` | a dragenter inside a drop leg is filtered out of the drop-acceptance law | `983ad0a0ac540c5ef6b1402c506353908088da290b290f665dd0ff0cad85532c` |
| `A38-cancel-idx-shift` | `const cancelIdx = LEG_ORDER.indexOf('ext-cancel');` -> `const cancelIdx = LEG_ORDER.indexOf('ext-drop-dz');` | the dragCancel boundary moves two legs late: drag events in ext-cancel are outside the cancel law | `63b571c0d4c2bed1506e9f1bad76bdb057f8750d216a2aa493b9a69624aecdd7` |
| `A39-mask-table-16` | `16: 'move',` -> `16: 'link',` | the mask-16 name entry is corrupted | `b36af6541259d328e429ae2f0457d691923faa016cd09e04cb8e4eaddbcbaa6e` |
| `A40-coord-exempt-drop` | `if (e.type === 'pointercancel' \|\| e.type === 'dragstart') return false;` -> `if (e.type === 'pointercancel' \|\| e.type === 'dragstart' \|\| e.type === 'drop') return false;` | drop events are exempted from the coordinate law | `b599d991b533fbb6d0fb01609dc14507b4e333984c1bed4aafa991ad0c08d1f4` |
| `B01-sendlog-some` | `sendLog.length > 0 && sendLog.every(allowed)` -> `sendLog.length > 0 && sendLog.some(allowed)` | closed send allow-list applied to one send instead of all (every -> some) | `2224503122354ff7554fd3d9a1c4a660b23c8e562611440f81660babc3252f07` |
| `B02-gapmin-10` | `TOL = 0.05, GAP_MIN = 50, FRAC = 0.5,` -> `TOL = 0.05, GAP_MIN = 10, FRAC = 0.5,` | the >= 50 ms fingerprint-gap floor lowered to 10 ms | `41d0a29d0ef0054af9923d2be81bd288e2cc67fc09a902eb716ed8ee415697d5` |
| `B03-seq-zero-based` | `isObj(e) && e.seq === i + 1` -> `isObj(e) && (e.seq === i + 1 \|\| e.seq === i)` | seq accepted on a zero-based as well as a one-based numbering | `554650211e90b00aa07814ee3b8239d62b6fa3ce290f8559d5572d8f4276760d` |
| `B04-exprs-entry` | `'window.__nonceOnPage',` -> `'window.__nonceOnPage', 'window.__events.length',` | a foreign Runtime.evaluate expression is added to the allow-list | `63744ff97e51240a2d4bed2570385f659d6c192796a2eadb282fc34f50ae7356` |
| `A41-intercept-data-items-only` | `canon(interceptData) === canon(INTERCEPT_WANT)` -> `canon(interceptData.items) === canon(INTERCEPT_WANT.items)` | intercepted dragOperationsMask no longer compared | `d1f601a9565bc34fcbd600a9ba66a06ed40e7ca265c78825d2e7961e7a1d424e` |
| `A42-checkids-drop-trust-law` | `  'trust-law', 'data-protection-law',` -> `  'data-protection-law',` | trust-law removed from the declared check ids | `f4149a79efd188701a4a54c7c4174272bc27f35bdb3fcd9a908de20fc444da5a` |
| `A43-shape-dropped-literal` | `const DROPPED = 'tabi-drag\|x1';` -> `const DROPPED = 'tabi-drag';` | the dropped state literal loses the custom mime half | `e389751dde6694cc3b502e14db7f04268dacca8018a3e61b7870d3dd17954f64` |

## 9. Files

- `receipts/phase1c.json` — per-mutant verdict, exit, passed/cases, `failed` list, sha256, `from`/`to`.
- `receipts/battery-out/<id>.out.gz` — the full battery summary for each mutant (254 cases).
- `receipts/mutants/<id>.mjs` — each mutated counter, byte-exact.
- `receipts/phase2.json`, `receipts/phase2b.json`, `receipts/phase3.json` — every witness/probe run
  (mutant and frozen exit + finding ids), the uniqueness/frozen-collision audit, the A07 CLI probe,
  the B02 gap-band measurement.
- `receipts/w-*.receipt.json`, `receipts/p-*.prior.json`, `receipts/e-A07-underscore.receipt.json` —
  the witness receipts and crafted priors named in §4.
- `receipts/pinned/check-dragdrop-r75.mjs`, `receipts/pinned/negatives-dragdrop-r75.mjs`,
  `receipts/pinned/chrome-cdp-dragdrop-round75.mjs` + `SHA256SUMS` — the read-only originals the
  copies were made from.
- `receipts/table.md`, `receipts/killed.md`, `receipts/edits.md`, `receipts/rows.json` — generated
  tables (§2, §3, §8) straight from the measured artefacts.

To re-run one mutant: put `receipts/mutants/<id>.mjs` as `check-dragdrop-r75.mjs` beside
`receipts/pinned/negatives-dragdrop-r75.mjs` and `receipts/pinned/chrome-cdp-dragdrop-round75.mjs`
(the counter reads the driver beside it for the fixture hash) and invoke the command in §2.
