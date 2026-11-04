# R63Scribe — round 63 wave w1 seat report (scribe: C1 wheel/scroll prose)

Axis named: **coverage** (the C1 capability `chromium-wheel-scroll-domain-linux`
and its knowledge entry). Secondary, in honesty terms: **calibration** — every
number below is re-derived from frozen bytes by this seat, and the report names
where the frozen counter is weaker than the claim's own prose. Role: drafting
support for the L1, which integrates. This seat made **no** claim, asserted
**no** capability admission, edited **no** frozen instrument, and committed
**nothing**.

## Order of operations

1. Read `.ufo/waves/round-63/claims.json` FIRST, then every byte it pins
   (driver, counter, mutate/make-negatives/old-generation/mutants, the three
   staged sources), then `corpus/SOURCES.md`, `corpus/knowledge/
   chromium-preventdefault-swallow-round-58.md` (house voice), `corpus/
   README.md` (row shape), `SCORECARD.md` (capability table shape) and
   `corpus/lessons/round-58.md` / `round-62.md` (Gate shape).
2. Re-ran the frozen instruments on the freeze-commit controls; attacked them
   with 15 single-field forged receipts; wrote drafts; validated the drafted
   SOURCES rows against the lane's own gate on a scratch clone.

## Commands run by this seat (exact argv, cwd, exit code)

Full machine-readable list with all 23 invocations:
`.ufo/waves/round-63/w1/R63Scribe/receipts/scribe-commands.json`. The
load-bearing ones:

| # | cwd | argv (paths abbreviated to frozen-path form; absolute paths used on the command line) | exit | result |
|---|---|---|---|---|
| 1 | lane | `sha256sum scripts/chrome-cdp-loopback-round63.mjs .ufo/waves/round-63/counters/chromium-wheel-r63.mjs .ufo/waves/round-63/counters/{mutate-r63.mjs,make-negatives-r63.mjs,old-generation-r63.mjs,mutants-r63.json} .ufo/waves/round-63/sources/*` | 0 | driver `b00efd59…a0d6c040` (== the C1 driver pin); counter `08470569…d7178`; all six other pins match `claims.json` |
| 2 | scratch | `node …/.ufo/waves/round-63/counters/chromium-wheel-r63.mjs --selftest` | 0 | `TABI_R63_COUNTER_SELFTEST verdict=clean cases=22 passed=22` |
| 3 | lane | `node .ufo/waves/round-63/counters/chromium-wheel-r63.mjs .ufo/waves/round-63/controls/smoke/receipt-run1.json --driver scripts/chrome-cdp-loopback-round63.mjs --expect-driver-sha256 b00efd59…a0d6c040 --shot .ufo/waves/round-63/controls/smoke --json` | 0 | `predicate true, findingCount 0` |
| 4 | lane | same, with `receipt-run2.json` | 0 | `predicate true, findingCount 0` |
| 5 | lane | the C1 after-command verbatim, on `corpus/evidence/round63/chromium-wheel-scroll/receipt.json` | 0 | `predicate true, findingCount 0` (receipt sha256 `3aa3ce40…ad28a1`) |
| 6 | lane | the counter over each of the 10 freeze-commit negatives | 1 each | all ten exit 1, one finding each: n1/n2 `producer-verdict`, n3 `scroll-arithmetic`, n4 `wheellog-sequence`, n5 `delta-y-passthrough`, n6 `cancelation`, n7 `shot-bytes`, n8 `survivors`, n9 `nonce-binding`, n10 `launch-guards` |
| 7 | lane | the counter over each of the 10 scored `controls/negatives-data/` variants | 1 each | same ten findings, exit 1 each |
| 8 | lane | `node .ufo/waves/round-63/counters/chromium-wheel-r63.mjs` (no args) | 2 | usage refusal |
| 9 | lane | same counter on a nonexistent receipt path | 2 | missing-receipt refusal |
| 10 | lane | same counter with `--expect-driver-sha256 000…0` | 2 | driver-pin refusal |
| 11 | lane | the r63 counter on the r62 receipt | 1 | 21 findings (schema … page-final-state) — the r62 receipt is refused by the r63 generation |
| 12 | scratch | `node …/scripts/chrome-cdp-loopback-round63.mjs --scratch …/R63Scribe/run1 --out …/run1/receipt.json --nonce tabi-r63-scribe-one --http-port 19731 --cdp-port 19732` | 0 | cold run 1, `predicate true`, `wheelHypothesis CONFIRMED` (receipt sha256 `1253be16…4a43`) |
| 13 | scratch | the same driver on `run2`, nonce `tabi-r63-scribe-two`, ports 19841/19842 | 0 | cold run 2, `predicate true` (receipt sha256 `9a3ba3d3…ae4`) |
| 14 | scratch | `node …/counters/mutate-r63.mjs run --counter … --mutants … --driver … --expect-driver-sha256 b00efd59… --live …/controls/smoke/receipt-run1.json --shot …/controls/smoke --negatives …/controls/negatives --work …/mut --out …/matrix-rerun.json` | 0 | `pristineAcceptsLive true, pristineRefusesAll true, mutantCount 8, survived [], allKilled true`; per-mutant `falseGreens` byte-identical to the freeze-commit matrix |
| 15 | scratch | `node …/counters/old-generation-r63.mjs --counter …/round-62/counters/chromium-receipt-r62.mjs --receipt …/controls/old-generation/r62-lying-receipt.json --driver …/scripts/chrome-cdp-loopback-round62.mjs --expect-driver-sha256 8dae248a…c82e0 --shot …/corpus/evidence/round62/chromium-secondary-button --work …/oldgen3` | 0 | `demonstrated true` — pristine exit 1 `['producer-verdict']`, exact-line mutant exit 0 `[]` |
| 16 | scratch | the same control with `--shot …/.ufo/waves/round-62/controls/smoke` | 1 | **NOT demonstrated** — pristine exit 1 `['shot-bytes','producer-verdict']`, mutant exit 1 `['shot-bytes']` (see finding F-2) |
| 17 | scratch | 15 single-field forged receipts through the frozen counter CLI | 0/1 | 11 accepted, 4 refused (see findings) |
| 18 | scratch | `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin clone`; `git -C clone rev-parse --show-toplevel`; `git -C clone rev-parse HEAD` | 0 | toplevel == the clone dir (asserted before any use); HEAD `e5325ad8805df86cb0109373d2ac695f558c2a1f`; **no commit made in the clone** |
| 19 | scratch clone | `node scripts/check-sources.mjs` | 0 | `SOURCES_GATE verdict=clean rows=167 tiers=A:149,B:9,C:9 status=queued:15,mined:142,rejected:10 findings=0` with this seat's two SOURCES rows substituted |
| 20 | lane | `node scripts/check-sources.mjs` | 0 | same clean verdict on the lane working tree |
| 21 | lane | `git -C … cat-file -p 816592612dd2a8073437c595d3fe3c477125cf3c:<path> \| sha256sum` for 9 cited control paths | 0 | every freeze-commit blob digest equals the working-tree digest of the same path — no post-freeze byte change in anything this report cites |
| 22 | scratch | PIL diff of the four step PNGs of run 1 | 0 | a vs b: 0 differing pixels of 1 040 640; a vs c: 0; a vs d: 1 029 035 differing, bbox `(0,0,1277,813)` |

No tool was installed or upgraded this round (no `pacman`, no `uv tool`, no
binary fetch): the seat needed only `node` and `python3`, both already
present, so `/home/vgpnk/.omp/agent/RULES.md` was read for the channel order
and no transaction was required. **PACMAN remains paused host-wide; this seat
performed no pacman transaction of any kind.** No browser was launched other
than the frozen driver's own Chromium (headless, loopback, throwaway profile)
and the fixture server on 127.0.0.1.

## Hashes cited

| bytes | sha256 |
|---|---|
| freeze commit | `816592612dd2a8073437c595d3fe3c477125cf3c` |
| driver `scripts/chrome-cdp-loopback-round63.mjs` | `b00efd59ac10fd047014b76b2a5d16cc8b0acaab0730e8c6029a0b53a0d6c040` |
| counter `.ufo/waves/round-63/counters/chromium-wheel-r63.mjs` | `084705695a394256198b45c15fb7568b629e3bc750bbd46cfcb81cdb312d7178` |
| `counters/mutate-r63.mjs` | `4bf6e61404c1733778f32f14a18d807cdeff7aa5cc051bab54a074bab65571fb` |
| `counters/make-negatives-r63.mjs` | `598a19da3a5d214de82f15789c2616b753e34ee16d9fea83d134e36749add2eb` |
| `counters/old-generation-r63.mjs` | `1ee9cda2661b178c233b292c02fe3320cfe6a1b23c0a3bbb060400ed5d7674c8` |
| `counters/mutants-r63.json` | `5f0efd8fddc499acc7ebec8d2101aa0bfc2c46fac281c9193177861dd8731c8c` |
| source s166 `s166-mdn-wheel.html` | `6ec7ec375ada09642a7ee76e63bb57eee1cf1e8e86e1b06f401bb8ecbacc7e4c` (staged, **not** in `claims.json` pins) |
| source s166b `s166b-mdn-wheelevent.html` | `78bd40dc50dc71b9cb395dd9d7f4f58edb20cf3b77b6e24dd5832b79f476c2d1` (== pin) |
| source s167 `s167-cssom-view.html` | `51a7efdb30a9aa946e50b395dafb417d0305e54bd71e1b23faa6ce0af05abb99` (== pin) |
| freeze-commit smoke receipt run1 / run2 | `844f9facd15de4bd6ceb83ef5ae22765486062e66f1ffa241197ab8d2defd48f` / `954cee8a2acaf191c328058ccc60674d300b10e217b1e9c149bf8bd7711b6250` |
| this seat's cold run1 / run2 receipts | `1253be160587114ec58d648735ef22090ca5abd4ca51b73efbaaa8ad4b7a4a43` / `9a3ba3d3f940646a4bd9572c056e41fef63c819e7f3a0c14b453c0756875dae4` |
| scored data receipt | `3aa3ce40b49eb2e3516cfb82923eae8761f3a9ba052a3da4cc58764164ad28a1` |
| freeze-commit mutation matrix / negatives index / r62 red-before | `7e5b4691a9c3188614ed49e320c1291af8ac103ce6ced465fd6f1e88ccd432d0` / `772827c269f081899e0b5899756cb6a94056cdfe19cce7831f27ec590b121fc8` / `c1fd449247ab998ec0882246a564e005fbfef5f669a32e5e9bfa9371ada73304` |
| step PNG digests (a/b/c, d) | `c8de49678abad8433a822370a92ab3b2b35ac53603d5122193f21d66fdd95b9a` / `1bc648c80b682620cf2eef31942be3e90ad1b928a2d09580bcf48ea7b7605ce0` |

## Findings by severity

Severity = effect on the C1 claim as the L1 will score it. **No defect was
repaired** — every one of these is a report against a frozen file with its
line, for the L1 to route.

### F-1 — MEDIUM — the frozen counter does not check the modifier booleans the driver itself demands

`scripts/chrome-cdp-loopback-round63.mjs:294` requires
`e.ctrlKey === false && e.shiftKey === false && e.altKey === false && e.metaKey === false`
in the producer's own `entriesOk` check, and the driver records all four at
`:161`. The counter's `trusted-fields` check
(`.ufo/waves/round-63/counters/chromium-wheel-r63.mjs:43`) checks `type`,
`isTrusted`, finite non-negative `ts` and `cancelable` — and **no modifier
boolean**. A forged receipt with `wheellog[0].ctrlKey = true` is **accepted**
by the frozen counter (probe `p-ctrlkey`, exit 0, `predicate true`,
`findingCount 0`). Consequence: a receipt claiming a ctrl+wheel (zoom) gesture
would pass, even though the claim's limits name ctrl+wheel zoom as
explicitly *not* measured and the driver would have refused the same data.
The C1 kill rules do not list the modifier booleans, so this does not
automatically fail C1 — but the note prose and the claim's `target` block
would over-state what the counter proves.

### F-2 — MEDIUM — the committed r62 red-before control does not reproduce from the committed bytes alone

`.ufo/waves/round-63/controls/old-generation/result.json` records
`pristine exit 1 ['producer-verdict']` and `mutant exit 0 []`, i.e. the class
demonstrated. Re-running the frozen
`.ufo/waves/round-63/counters/old-generation-r63.mjs` (command 15) with
`--shot …/corpus/evidence/round62/chromium-secondary-button` reproduces that
exactly (`demonstrated true`, exit 0). Re-running the same command with the
*other* plausible shot directory, `.ufo/waves/round-62/controls/smoke`
(command 16), yields **exit 1, `demonstrated: false`** — the pristine r62
counter exits 1 with `['shot-bytes','producer-verdict']` and the mutant also
exits 1 with `['shot-bytes']`, because the PNG bytes in that directory
(`9c07a497…`) are not the bytes the r62 lying receipt declares
(`c0982dbd…`, which is what `corpus/evidence/round62/…` holds). The recorded
control therefore rests on an **undocumented `--shot` argument**: the
committed `result.json` names the counter, the receipt and the mutant path but
not the shot directory, and the wrong choice silently turns the red-before
into a green. C2's red-before evidence stays valid, but it is not
self-reproducing from the committed control set. Route: the L1 should record
the `--shot` argument (or its digest) inside `result.json`.

### F-3 — MEDIUM — the L1's in-progress knowledge note explains the identical PNGs wrongly

`corpus/knowledge/chromium-wheel-scroll-round-63.md:114-115` (an untracked
working-tree file the L1 is integrating; `corpus/` is off-limits to this seat,
so this is a report, not an edit) reads: "a/b/c share one hash inside a run
because the visible viewport is unchanged between 120 and 240". The
explanation is false as written and the measured pixels refute it: the
viewport at 240 is **not** the same as at 120 — `d-release` differs from
`a-wheel-down` in 1 029 035 of 1 040 640 pixels (command 22). The real reason
a, b and c are byte-identical is that the driver captures all three at the
*same* scroll offset 120 (`scripts/chrome-cdp-loopback-round63.mjs:262-274`:
`a` after the +120 leg, `b` after the −120 leg that returns to 120, `c` after
the cancelled leg that stays at 120), and only `d` is captured at 240. The
substantive conclusion — "4/4 identical PNG sha256 across cold runs" — is
unaffected and still measured; only the causal sentence is wrong, and as
written it mis-describes which states the shots witness. This seat's draft
note states the correct reason in §5/§6. Route: correct the sentence in the
integrated note.

### F-4 — LOW/MEDIUM — `pageState.scrollEvents` is a range check, not the measured value

`.ufo/waves/round-63/counters/chromium-wheel-r63.mjs:46` accepts any integer
in 1..5. The measured value on this build is exactly **4** (five wheel events,
the swallowed leg producing none). A forged receipt claiming
`scrollEvents = 5` — i.e. claiming the swallowed leg *did* scroll — is
**accepted** (probe `p-se5`, exit 0). The scroll-arithmetic check at `:37`
still pins the swallowed leg's `scrollY` at 120, so the claim's substance
survives; but the "the swallowed leg produced no scroll event" half of the
evidence is carried by a range, not by the count.

### F-5 — LOW — the receipt's browser build string is never checked

The driver records `host.chromium` (`scripts/chrome-cdp-loopback-round63.mjs`
receipt init, `:181-186`; the measured value `Chromium 155.0.8059.84 Arch
Linux`), and the note's as-of table quotes it as the build scope — but the
counter's `verify()` (`.ufo/waves/round-63/counters/chromium-wheel-r63.mjs:28-55`)
never reads `host.chromium`. A forged receipt claiming `Chromium 999.0.0.0
Fake/Build` is **accepted** (probe `p-build`, exit 0). The one-build scope is
therefore prose, not an instrument check. Same class: `fixture.viewport` is
unchecked (`:31-32`; probe `p-vp`, accepted) and the receipt's
`declaredStepNames` array — which the driver writes at `:183` — is never read
by the counter (probe `p-declared`, accepted).

### F-6 — LOW — the shot-bytes witness binds two distinct images, not four

The four step records are `a-wheel-down`, `b-wheel-up`, `c-swallow`,
`d-release`, but three of the four PNGs are byte-identical
(`c8de4967…` for a, b and c) and only `d-release` differs
(`1bc648c8…`). The pixel diff (command 22) shows a vs b and a vs c differ by
**zero** pixels of 1 040 640, while a vs d differ in 1 029 035 pixels. The
reason is in the driver, not the browser: `scripts/chrome-cdp-loopback-round63.mjs:262-274`
captures `a-wheel-down` after the +120 leg (scrollY 120), `b-wheel-up` after the
−120 leg (scrollY 120 again), `c-swallow` after the cancelled leg (scrollY 120
again) and `d-release` after the released leg (scrollY 240) — so a, b and c
are the same viewport at the same scroll offset. The frozen counter's
`shot-records` check (`:47`) binds each record to a *name* and a file name,
and `shot-bytes` (`:48`) re-hashes the file on disk, so the label binding is
real — but the image content witnesses only two distinct states. The note
draft states this explicitly rather than implying four independent screenshots;
the L1 should keep that wording.

### F-7 — LOW — `host.argv` is inclusion-checked, not equality-checked

`.ufo/waves/round-63/counters/chromium-wheel-r63.mjs:33` requires four flags to
be *present*. A receipt with an extra launch flag added (probe `p-extra-arg`,
`--enable-automation`) is **accepted**. A build that launched with additional
behaviour-changing flags would still pass.

### F-8 — LOW — `wheellog` timestamps need not be monotonic

`:43` requires a finite `ts >= 0`; nothing requires the five `ts` values to
increase. A receipt with `ts` descending 1000…996 is **accepted** (probe
`p-tsmono`). The stability comparison explicitly excludes `ts`
(`legs`, `wheellog-minus-timestamp`, `pageState`), so the claim's cold-run
field is unaffected; the receipt's internal ordering is simply not witnessed.

### F-9 — INFO — the ten declared negatives and eight mutants all behave as the claim states

Re-run by this seat (commands 6, 7, 14): every one of the ten declared
negatives exits **1** with exactly one expected finding; the pristine counter
accepts the live receipt and refuses all ten; all eight exact-line mutants are
distinguished through the production CLI (`survived []`, `allKilled true`),
with a per-mutant `falseGreens` map byte-identical to the freeze-commit
matrix. M1's polarity flip is caught by **both** polarity negatives, which is
the class the r62 generation could not see. No finding against the claim here.

### F-10 — INFO — the counter's own selftest is clean at 22 cases

Command 2: `verdict=clean cases=22 passed=22`, exit 0 — matching the C1
target's `selftestCases: 22`. The forged-receipt probes are *outside* the
selftest's own cases: the counter's 22 cases are the frozen `synthetic()`
fixture mutations, and none of them is the modifier-boolean or
build-string mutation F-1/F-5 describe. That is why the probes were worth
running.

## Deliverables (all inside this seat's wave dir)

| path | what it is |
|---|---|
| `.ufo/waves/round-63/w1/R63Scribe/chromium-wheel-scroll-round-63.md` | DRAFT knowledge note: the required trio header (`source: S166, S167` / `verified-at: 816592612dd2a8073437c595d3fe3c477125cf3c` / `recheck: <command>`), the measured model (six legs, exact scroll 0/120/240/120/120/240, the five wheel events with deltaY 120/120/−120/120/120, deltaMode 0, deltaX 0, `isTrusted` true, `cancelable` true; the swallowed leg `defaultPrevented` true with the scroll unchanged; the released leg restoring scrolling), the page-side recorder shape, the exact sink arithmetic table, the counter contract (22 selftest cases, ten negatives, eight exact-line mutants with the distinguished map), the teardown/closure proof, and an explicit Limits section (one browser/build/host, `--disable-smooth-scrolling`, no cross-browser / trackpad / horizontal / ctrl+wheel-zoom / `scrollend` claim, receipt not authenticated). Sources are cited by row id only where the quote grounds the statement; everything else is marked `[measured]`. |
| `.ufo/waves/round-63/w1/R63Scribe/sources-rows.md` | The two paste-ready SOURCES registry rows (S166 MDN WheelEvent, docs/B; S167 CSSOM View, spec/A), 11 cells each, no `|` inside any cell, with the located quotes, the cell-by-cell breakdown, the divergence from the working-tree rows, and the structural-gate evidence. |
| `.ufo/waves/round-63/w1/R63Scribe/readme-scorecard-rows.md` | One `corpus/README.md` coverage row in the house `Note \| Holds \| Sources` shape and one `SCORECARD.md` capability-table row (`chromium-wheel-scroll-domain-linux`, one-line capability, the C1 after-command as the evidence pointer, first-working 63). |
| `.ufo/waves/round-63/w1/R63Scribe/gate-candidates.md` | The `## Gate` candidate list: admit reasoning for S166 and S167, scoped-reject reasoning for both with flip conditions, and one rejected candidate (MDN "Element: wheel event", staged but unpinned) with its flip condition. |
| `.ufo/waves/round-63/w1/R63Scribe/receipts/` | JSON/log receipts: `scribe-commands.json` (23 invocations with argv, cwd, exit codes), `scribe-counter-selftest.json`, `scribe-counter-probes.json` (the 15 forged-receipt probes with their findings and the 8 distinct gaps), `scribe-matrix-rerun.json`, `scribe-oldgen-redbefore.json`, the two cold-run receipts and stdouts, and the four step PNGs. |

## Not asserted (explicit)

- No capability admission. The capability row enters only if the L1's
  integrated run verifies the frozen predicate at the data revision; this
  seat's greps and runs are re-derivations of frozen controls, not the
  scored after-pass.
- No edit to any frozen instrument, to `corpus/`, to `SCORECARD.md`,
  `LOG.md`, `SKILL.md`, to `MANIFEST.json` or to `.ufo/state`; no commit,
  push, stash, checkout, switch, reset, pull or any other mutating git/jj
  command; `jj` never run.
- No C2 claim, no calibration verdict, no score, no trend, no saturation or
  window ruling, no kaidoku/overlap/topology adjudication.
- No claim about the lane's knowledge corpus, the r62 secondary-button
  generation, or any other round.
- **Not re-run by this seat:** the `controls/no-work/*` control records
  themselves (their argv/exit codes were re-derived independently as commands
  8–11 and agree with the recorded `exits 2,2,1,2`); the
  `scripts/check-selfassessment.mjs` gate (C2's instrument — out of this
  seat's scope); `scripts/sources-census.sh` (the L1's census rows); and the
  r62 live-green / smoke-live-green control records.
- The staged `s166-mdn-wheel.html` (MDN "Element: wheel event") is **not** in
  `claims.json`'s pins; it is cited here only as a *rejected* candidate with
  its sha256, never as grounding.

## Receipts (JSON/log, beside the drafts in this seat's wave dir)

| receipt | content |
|---|---|
| `.ufo/waves/round-63/w1/R63Scribe/receipts/scribe-commands.json` | all 23 invocations: argv, cwd, exit code, result (`26c1797e…22e8`) |
| `.ufo/waves/round-63/w1/R63Scribe/receipts/scribe-counter-selftest.log` | the frozen counter's selftest output, `verdict=clean cases=22 passed=22` (`7d16c145…498f`) |
| `.ufo/waves/round-63/w1/R63Scribe/receipts/scribe-counter-probes.json` | the 15 forged-receipt probes: per-probe argv template, exit, findings, plus the 8 distinct gaps (`e2942fab…06a8`) |
| `.ufo/waves/round-63/w1/R63Scribe/receipts/scribe-matrix-rerun.json` | the 8-mutant mutation matrix re-run (byte-identical to the freeze-commit matrix, `7e5b4691…432d0`) |
| `.ufo/waves/round-63/w1/R63Scribe/receipts/scribe-oldgen-redbefore.json` | the r62 red-before reproduction, `demonstrated: true` (`8774dfa2…c2f5`) |
| `.ufo/waves/round-63/w1/R63Scribe/receipts/scribe-run1-receipt.json`, `scribe-run2-receipt.json` | this seat's two cold-run receipts (`1253be16…4a43`, `9a3ba3d3…ae4`) |
| `.ufo/waves/round-63/w1/R63Scribe/receipts/scribe-run1.stdout`, `scribe-run2.stdout` | the drivers' own stdout for those two runs (`57d0a628…9e76`, `9d774692…4e28`) |
| `.ufo/waves/round-63/w1/R63Scribe/receipts/{a-wheel-down,b-wheel-up,c-swallow,d-release}.png` | the four step screenshots of cold run 1 (digests `c8de4967…95b9a` ×3 and `1bc648c8…05ce0`) |

## Scratch

`/fast/scratch/hyaku/tabi-r63/R63Scribe/` held the two cold-run scratch dirs
(`run1/`, `run2/`), the probe receipts, the mutation work dir (`mut/`), the
three `oldgen*` work dirs and the lane clone (`clone/`). **The scratch tree
was deleted before this report was written** (`rm -rf`, exit 0); the durable
receipts are the copies under `.ufo/waves/round-63/w1/R63Scribe/receipts/`.
No tree of this seat's is left on disk.

VERDICT: C1's frozen instruments re-verify clean at this seat's hands (selftest
22/22, ten of ten negatives refused with the expected findings, eight of eight
exact-line mutants distinguished, two independent cold runs stable in
legs/wheellog-minus-ts/pageState and in the PNG digests), the drafted prose
is ready for the L1, and eight counter gaps are reported unrepaired — of which
F-1 (modifier booleans unchecked) and F-2 (the r62 red-before control needs
an undocumented `--shot`) are the two that should be routed before the
capability row is scored.

Report: .ufo/waves/round-63/w1/R63Scribe.md
