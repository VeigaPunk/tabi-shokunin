# Round 64 — a receipt that is re-run, not agreed with

Fresh start under the operator pause lift ("Resume all eight once", tabi r64). The
last three rejected closures were read before declaration: r61 (frozen `lane<TAB>`
header rejected, then post-score interface changes invalidated the pin transfer),
r62 (producer-verdict `&&`→`||` mutant survives; contradictory duplicate and
fabricated-label false greens) and r63 (frozen predicate met but a hand-written
receipt with four 1×1 PNGs reached the target, so the capability was unprovable).
Baseline `6c19979fe63f3b9ec35179ca57bb91c6356bff25`; instrument/controls freeze
`__FREEZE__`. Two causal-separable claims: C1 is a coverage capability
(`chromium-wheel-scroll-domain-linux`, second declared generation) whose
demonstration is a live re-run; C2 is a calibration gate over the lane's own
control receipts.

## Gate

Opened 2026-11-04 (all quotes located in the staged bytes named below):

| Candidate | Decision | Located evidence / flip |
|---|---|---|
| S153 Chrome DevTools Protocol `browser_protocol.json` — re-opened, scope extended to `Input.dispatchMouseEvent` delta units and `Page.captureScreenshot.captureBeyondViewport` | Admit the scope extension (row already held the URL and tier A/code) | Quotes (11 words): “Y delta in CSS pixels for mouse wheel event (default: 0).” and (9 words) “Capture the screenshot beyond the viewport. Defaults to false.” Located at byte offsets 659,847 and 1,081,550 of `.ufo/waves/round-64/sources/s168-cdp-browser-protocol.json` (1,423,215 B, sha256 `cb4b0a40…`; the file name keeps the round's staging number — the registry id is S153). They ground that a wheel delta is expressed in CSS pixels (so the fixture's 120 px bands are the same unit as the delta) and that a screenshot is viewport-bounded unless asked otherwise (so the 1280×900 dimension expectation is protocol-grounded, not assumed). |
| A new S168 row for the same URL | Reject (duplicate URL) | The census refused it twice: `W04 S168 duplicate url raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json across scopes` and `E05 kind=protocol`. S153 already holds that URL, so the round re-opens S153 instead of appending a second row for one URL (CORPUS.md rule 2: supersede, never duplicate). |
| S153 as support for scroll arithmetic, cancelation, rendering determinism or delivery | Reject | The JSON defines parameter units and the capture default; it says nothing about how far a delta scrolls, whether a page listener may cancel it, or whether two captures are byte-identical. Flip: a normative scroll-behaviour rule plus a measured second build would ground those. |
| S169 CSSOM View re-fetch as a *new* row | Reject as a row (duplicate URL of S167) | The re-fetch is byte-different from r63's staged copy — sha256 `51a7efdb…` → `e8f4fbda…`, same 1,084,848 B — and the only diff is the `<meta name="revision">` line (`a3e7fce3…` → `909869d6…`). The quoted getter text is unchanged, so the existing S167 row stays true; the drift is recorded here and in the report as a freshness datum, not as a new row (a second row for one URL is the E03/E04 duplicate the census refuses). |
| The r63 wheel/scroll capability re-declared as a repair of its frozen predicate | Reject | Frozen predicates are never narrowed after scoring (`claims.json` `freezeRule`); this round declares a new generation with new instruments and a new target, and keeps r63's unprovable verdict on the record. |
| A synthesized rendering as evidence that the surface ran | Reject | The committed control `red-synthetic-rendering` exits 0: a 1280×900 rendering drawn from the fixture geometry satisfies every pixel check. Synthesis is as cheap as rendering for a flat-colour fixture, so the counter cannot be the capability's demonstration; the live verifier is. |

Registry 167 → 167 (no id added; the S168 append was refused and the row
re-opened instead). Row S153 changed old→new: `scope` gained “the
Input.dispatchMouseEvent delta units (deltaX/deltaY 'in CSS pixels') and the
captureBeyondViewport viewport default (round-64 scope extension)”; `anchor`
gained the 2026-11-04 re-open with the fresh 1,423,215 B / sha256 `cb4b0a40…`
fetch and both located quotes; `used-by` gained
`corpus/knowledge/chromium-wheel-scroll-round-64.md, corpus/lessons/round-64.md`.
`status` (mined), `opened` (2026-10-31) and `recheck` are unchanged. Census before (baseline revision):
`scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` at
round start → see `.ufo/waves/round-64/controls/census-start.txt`; census after →
`.ufo/waves/round-64/controls/census-end.txt`. The outside non-author admit/reject
sample remains a closure duty — a dispatched seat is still the lane.

## Mistakes

| Class · evidence | Captured-by | Fix / failability |
|---|---|---|
| duplicate-url append: a new registry row was written for a URL the lane already held (S153), and the census refused it (`W04` duplicate URL plus `E05 kind=protocol`); the round re-opened S153 and logged the scope/anchor/used-by change old→new. | `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`, exit 1 on the first append | Fix: run the duplicate-URL check over the lane registry before writing a row, not after. Failability: the same append against the current registry still produces `W04`; the re-opened row produces exit 0 with 22 pre-existing warnings. |
| environment-as-verdict: the driver waited 15 s (later 60 s) for the CDP page target, so a launch under fleet load was scored as a red run. The design battery's `live-verify` control exited 1 with `drive-error: no loopback page target` on both runs while the identical command passed standalone seconds later (`.ufo/waves/round-64/controls/live-verify.command.json` exit 1 versus the same argv re-run at exit 0). | The control battery's own live-verify control | Fix: a 4-minute page-target wait plus two attempts per run with fresh scratch and ports, and the attempt list is reported in the verifier output. Failability: the pre-fix build under the same load exits 1 with that receipt; the post-fix build reports `attempts:[0]` or `[1,0]` and never hides a retry. |
| non-isolating negative: four of the declared negatives were refused by a *second* check, so the matching mutant survived the whole suite (`cancelation` also tripped `scroll-event-witness`; `shot-bytes` also tripped every pixel check; `target-binding` also tripped the target id; `survivors` also tripped the sweep count). Demonstrated by `mutants/matrix.json` before the fix: 5 survivors of 16. | The mutation matrix's survivor list | Fix: each negative mutates only the field its check reads (the non-prevented count is preserved by flipping a second event; `shot-bytes` lies only in the recorded digest; `target-binding` moves only `scrollYAtDispatch`; `survivors` sets only `sweepError`). Failability: the same mutants now accept their matching negative, and the 1×1-PNG class is covered by the committed `red-one-by-one` control instead of by the negative. |
| frozen-check over-claim: `host-identity` was written as three conjuncts on one line, and the first mutant "dropping" it replaced only the first conjunct, so the check still fired and the mutant looked redundant. | The mutation matrix's `redundant` list | Fix: the mutant replaces the whole check statement. Failability: the mutant now accepts the `host-identity` negative. |
| claim-target drift: the r63 C1 target was "the counter exits 0", which a hand-written receipt reaches. Re-declared here as a live re-run, and the do-nothing control is a committed `--no-run` invocation that exits 1 with `live-run-required`. | The r63 closure's C1 ruling | Fix: the claim's after-command is the verifier, not the counter; the counter is declared evidence quality with its synthesis limit named. Failability: the `live-no-run` control is committed and exits 1. |

## Frontier and limits

- Held this round: the second-generation receipt binding (nonce grid in page
  pixels, band colours encoding the scroll position, per-leg witness strip,
  fixture re-rendered from the pinned driver, server-log run binding, CDP
  `Browser.getVersion` identity) and the live verifier that re-runs the surface.
- Declared, not held: horizontal scroll, `scrollend`, trackpad/momentum phases,
  ctrl+wheel zoom, cross-browser deltas, scroll snapping, and any third-party
  site — each is its own future claim, never inferred from this one.
- The counter is not an execution oracle (see the Gate's synthesis reject); the
  verifier proves the surface behaves as measured on this host for these
  instruments, not that the committed bytes came from that run.
- Assimilation: none. The round-57 quarantine register shift still blocks package
  adoption and the 38 hand-checks already stand committed (round-62 lesson);
  `considerthese/` is absent for this lane. No keyup/overlap/topology operator
  ruling is inferred.
- No tool installs this round.

## Wave and measured disposition

__WAVE__

## Self-evaluation

Accuracy: every claim is a command over committed bytes, and the failing-before
controls were committed before the freeze. Completeness: two claims plus the
frontier step (sources, census, mined mistakes, Gate) are covered; the wave's
advisory findings are integrated in the report. Clarity: the red-before class,
the declared limit and the live demonstration are separated. Foresight: the
receipt is not authenticated and the build/host scope is declared rather than
generalized.
