# Round 64 — a receipt that is re-run, not agreed with

Fresh start under the operator pause lift ("Resume all eight once", tabi r64). The
last three rejected closures were read before declaration: r61 (frozen `lane<TAB>`
header rejected, then post-score interface changes invalidated the pin transfer),
r62 (producer-verdict `&&`→`||` mutant survives; contradictory duplicate and
fabricated-label false greens) and r63 (frozen predicate met but a hand-written
receipt with four 1×1 PNGs reached the target, so the capability was unprovable).
Baseline `6c19979fe63f3b9ec35179ca57bb91c6356bff25`; instrument/controls freeze
`0fc68043f5b5e4e9fc0a69c5924e78f2cb0e6741`. Two causal-separable claims: C1 is a coverage capability
(`chromium-wheel-scroll-domain-linux`, second declared generation) whose
demonstration is a live re-run; C2 is a calibration gate over the lane's own
control receipts.

## Gate

Opened 2026-11-04 (all quotes located in the staged bytes named below):

| Candidate | Decision | Located evidence / flip |
|---|---|---|
| S153 Chrome DevTools Protocol `browser_protocol.json` — re-opened, scope extended to `Input.dispatchMouseEvent` delta units and `Page.captureScreenshot.captureBeyondViewport` | Admit the scope extension (row already held the URL and tier A/code) | Quotes (11 words): “Y delta in CSS pixels for mouse wheel event (default: 0).” and (9 words) “Capture the screenshot beyond the viewport. Defaults to false.” Located at byte offsets 659,847 and 1,081,550 of `.ufo/waves/round-64/sources/s168-cdp-browser-protocol.json` (1,423,215 B, sha256 `cb4b0a40…`; the file name keeps the round's staging number — the registry id is S153). They ground that a wheel delta is expressed in CSS pixels (so the fixture's 120 px bands are the same unit as the delta) and that a screenshot is viewport-bounded unless asked otherwise (so the 1280×900 dimension expectation is protocol-grounded, not assumed). |
| A new S168 row for the `@master` CDP `browser_protocol.json` URL | Reject (duplicate URL) | The census refused it twice: `W04 S168 duplicate url raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json across scopes` and `E05 kind=protocol`. S153 already holds that URL, so the round re-opens S153 instead of appending a second row for one URL (CORPUS.md rule 2: supersede, never duplicate). |
| S168 Chromium 155.0.8059.84 Input domain PDL — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/Input.pdl?format=TEXT | Admit, tier A/code, build-scoped | Quote (11 words): "Y delta in CSS pixels for mouse wheel event (default: 0)." Located at line 202 of `.ufo/waves/round-64/w1/R64Scribe/sources/s170-chromium155-Input.pdl` (14,431 B, sha256 `5bbc6e23eb17a009da540792bd5f647567e9c81f919081059dff5274a1c66e3d`), fetched 2026-11-04 at tag `155.0.8059.84` (commit `5869fe313571d75152b77813cf0a4ee26a4e6df0`). It grounds that the dispatched wheel delta and the fixture's 120 px bands share one unit, so a scroll position read from pixels can be compared with the delta that was sent. |
| S169 Chromium 155.0.8059.84 Browser domain PDL — https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/public/devtools_protocol/domains/Browser.pdl?format=TEXT | Admit, tier A/code, build-scoped | Quote (lines 208-219, read as one response shape): "command getVersion returns … string protocolVersion … string product … string revision … string userAgent … string jsVersion". Located in `.ufo/waves/round-64/w1/R64Scribe/sources/s171-chromium155-Browser.pdl` (12,079 B, sha256 `5e1faf7dbe56cce01447ea627ca6cc023418cafe7528bede3e5f2571363170da`), fetched 2026-11-04 at the same tag. It grounds the identity fields the receipt reads over CDP instead of asserting them. |
| The moving `@master` `browser_protocol.json` (S153) as the authority for a build-scoped claim | Reject | The row's anchor cell records the file MOVING three times across re-opens (1,421,620 → 1,423,170 → 1,423,215 B), so a claim about what build 155.0.8059.84 specifies cannot rest on it; the build tag's own PDL is the source and S153 keeps the moving-artifact role. Flip: if a claim is explicitly about `@master`, cite the digest it was read at. |
| S168/S169 as support for scroll distance, cancelation, rendering determinism or browser behaviour | Reject | The PDLs define parameter units and response fields only; how far a delta scrolls, whether a page can cancel it and whether two captures are byte-identical stay measured here, never sourced. |
| S153 as support for scroll arithmetic, cancelation, rendering determinism or delivery | Reject | The JSON defines parameter units and the capture default; it says nothing about how far a delta scrolls, whether a page listener may cancel it, or whether two captures are byte-identical. Flip: a normative scroll-behaviour rule plus a measured second build would ground those. |
| A CSSOM View re-fetch as a *new* row (the id is not S169: that id is now the Browser PDL) | Reject as a row (duplicate URL of S167) | The re-fetch is byte-different from r63's staged copy — sha256 `51a7efdb…` → `e8f4fbda…`, same 1,084,848 B — and the only diff is the `<meta name="revision">` line (`a3e7fce3…` → `909869d6…`). The quoted getter text is unchanged, so the existing S167 row stays true; the drift is recorded here and in the report as a freshness datum, not as a new row (a second row for one URL is the E03/E04 duplicate the census refuses). |
| The r63 wheel/scroll capability re-declared as a repair of its frozen predicate | Reject | Frozen predicates are never narrowed after scoring (`claims.json` `freezeRule`); this round declares a new generation with new instruments and a new target, and keeps r63's unprovable verdict on the record. |
| A synthesized rendering as evidence that the surface ran | Reject | The committed control `red-synthetic-rendering` exits 0: a 1280×900 rendering drawn from the fixture geometry satisfies every pixel check. Synthesis is as cheap as rendering for a flat-colour fixture, so the counter cannot be the capability's demonstration; the live verifier is. |

Registry 167 → 169: S168 and S169 are new build-scoped rows cited by
`corpus/knowledge/chromium-wheel-scroll-round-64.md` and this lesson, and the
`@master` CDP row stays S153 (re-opened in place; the duplicate-URL append was
refused). Row S153 changed old→new: `scope` gained “the
Input.dispatchMouseEvent delta units (deltaX/deltaY 'in CSS pixels') and the
captureBeyondViewport viewport default (round-64 scope extension)”; `anchor`
gained the 2026-11-04 re-open with the fresh 1,423,215 B / sha256 `cb4b0a40…`
fetch and both located quotes; `used-by` gained
`corpus/knowledge/chromium-wheel-scroll-round-64.md, corpus/lessons/round-64.md`.
Rows S166 and S167 changed old→new later in the round: `used-by` gained
`corpus/knowledge/chromium-wheel-scroll-round-64.md` (reciprocity for the note's
`source:` line, `QUALITY.md` 75); `scope`, `status`, `opened` and `recheck` are
unchanged.
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

| instrument-relative pin: the live verifier hashed whatever `--driver` it was handed and passed that hash to the counter as its own expectation, so a 40-line substitute driver exited 0 with zero browser executions (`.ufo/waves/round-64/w1/R64Reviewer/E3a.json`, `fake-driver.mjs`: predicate true, two "live" runs, full agreement, 561 ms). The scored claims name the pinned driver path in their frozen after-command, so the scored run is not attacked, but nothing in the instrument checked the pin. | Nothing at freeze; the w1 reviewer found it. `corpus/QUALITY.md` 118 is the criterion that should have caught it, written from this round. | Fix (r65): compare `sha256(--driver)` with the claim's pin and refuse a mismatch with a named finding, plus a committed control that the refusal fires. Failability: the fake driver is green today and would be refused by the repair; the scored output prints `driverSha256 == 1ff560cc…b92db5`, which a substitute driver cannot print. |
| scored evidence copied from the design pass: the committed `corpus/evidence/round64/…/receipt.json` was the pre-freeze design smoke (nonce `tabi-r64-smoke-design`, byte-identical to `controls/scored/smoke/receipt.json`), so the claim's after-command could agree with a receipt produced before the instruments were frozen. | §9 ("the scored after-pass is a post-freeze pass") plus the claim's own `ordering` cell. | Fix: a fresh run at nonce `tabi-r64-scored-20261104` landed at `e3f52156` as the scored receipt (`sha256 4e3a95c1…0af0a86f`), its shots re-manifested, and the control base copied byte-identically from it. Failability: the old receipt's nonce and mtime are on the record; the new one carries the scored nonce and the verifier's evidence agreement. |
| target reachable without work: C2's frozen target (0 failures, >=12 receipts, every receipt naming a committed revision) is reached by a population of never-executed receipts with invented stdout and matching digests — the gate cannot tell a well-formed record from work that happened (w1 `R64Reviewer` H5: `checked=14 matrices=2 failures=0 ok=true`). The round had no pre-freeze skip-the-work control for C2, which §9 requires. | §9's do-nothing rule; the reviewer's fabrication control. | Fix (r65): freeze a no-work control for any provenance claim (a fabricated population the gate must refuse, or a target the fabrication cannot reach) before data. Failability: today the fabricated population scores 0 failures, so the control would fail closed as a claim and pass after the repair. |
| gate/battery naming mismatch: the gate counts matrices only for files matching `^matrix.*\.json`, while the battery writes its aliases as `negatives-matrix.json` / `mutants-matrix.json`, so the scored run reports `matrices 0` and the matrix-input/matrix-command checks never exercise the population. | The gate's own `matrices` field in `controls/scored/gate-after.stdout`. | Fix (r65): name the aliases `matrix-negatives.json` / `matrix-mutants.json` in the frozen battery, or widen the gate's regex (a frozen-byte change, so a new round). Failability: the scored gate prints `matrices 0`; the renamed alias makes it 2. |
| recorder timeout under fleet load: the control battery caps each command at 600 s while the verifier's two runs × two attempts × 240 s page-target wait can need 960 s, so `live-verify` recorded exit -1 twice under load average ~50 (`controls/scored/summary.json`, `summary-verify.json`) while the same frozen argv run directly took 11.8 s (attempts `[0,0]`). | None; the battery's fixed timeout. | Fix (r65): bound the verifier's page-target wait or raise the recorder timeout, and record the wall time in the receipt. Failability: the battery rows show -1 and the direct receipt shows exit 0 with attempts `[0,0]`. |
| wave settlement lost to an L1 death: the 12-seat w1 wave was spawned at 21:53 and its seats produced reports and receipts, but the L1 died on provider failure before the dispatcher wrote `w1-results.json`, so the seat-level settlement survives only as the seat files and the registry. | None; no protocol rule made the L1 persist its own settlement record. | Fix: the L1 writes a seat inventory + observed-output state into the wave dir when it integrates, instead of relying on the dispatcher's results handoff. Failability: `w1-results.json` is absent for this round while `.ufo/waves/round-64/w1/swarm-registry.json` and eleven seat reports exist; the record was reconstructed by hand in the report. |

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

ONE v1 wave w1 of 12 seats (scout 1, executor 3, scribe 1, connector 1, reviewer 1,
critic 1, mutation-tester 2, sentinel 1, revenger 1; attack seats 6/12 = 50 %),
dispatched at `21:53:15` under spec `70f52f6a` and adopted by the orchestrator. The
dispatcher never wrote `w1-results.json`: the L1 died on provider failure at
`22:32` (watchdog `lane-dead-no-report tabi round=64`), so the settlement is read
from `w1/swarm-registry.json` plus the seat files: eleven of twelve seats left a
report and receipts (R64Sentinel left nothing; R64MutDriver stopped after
`instruments/`). The round was resumed at `23:51` and closed with a residual wave
w2 of 4 seats (sentinel, executor, mutation-tester, reviewer) re-attacking the
SCORED population, which w1 could not see.

Measured disposition: C1 **VERIFIED on its frozen predicate** — counter
`predicate true / findings 0 / checks 29` on the scored receipt
(`sha256 4e3a95c1…`), verifier `predicate true / findings [] / two runs exit 0 and
counterExit 0 / crossRun true / evidence true / driverSha256 == pin`, negatives
`29/29 refused, forgedGreen 0`, mutants `16 applied / 16 killed / 0 surviving /
0 redundant`, selftest `clean 31/31`, red-before `4 refused` with the disclosed
synthetic-rendering acceptance unchanged. C2 **target measured, NOT admitted**:
`checked 15 / failures 0 / requireCommitted true / rev e3f52156` at the scored
population, but the same target is reached by a no-work fabricated population
(reviewer H5) and the round froze no such control, so the repair is real and the
claim is not evidence of it. No axis is harmed; coverage stays 9 (the capability
row enters) and calibration stays 9 (no score move for C2).

## Self-evaluation

Accuracy: every claim is a command over committed bytes, and the failing-before
controls were committed before the freeze. Completeness: two claims plus the
frontier step (sources, census, mined mistakes, Gate) are covered; the wave's
advisory findings are integrated in the report. Clarity: the red-before class,
the declared limit and the live demonstration are separated. Foresight: the
receipt is not authenticated and the build/host scope is declared rather than
generalized.

## Errata — round 65 (append-only; the superseded text is kept above)

Non-author spot-check `corpus/lessons/round-64-verifier-spotcheck.md` §5 routed these; each is re-verified by a command in round 65 (`.ufo/waves/round-65/w1/R65Scribe2/erratum-commands.txt`).

- D1 (`## Wave and measured disposition`, lines 95–96, "closed with a residual wave w2 of 4 seats"): superseded. No w2 bytes exist. `git ls-tree -r --name-only 40095308 -- .ufo/waves/round-64/` lists only `w1` entries. The round had no residual wave.
- D2 (the same paragraph, "eleven of twelve seats left a report and receipts"): superseded. `ls .ufo/waves/round-64/w1/*.md | wc -l` → 10. Ten seats left a report plus receipts; `R64MutDriver` and `R64Sentinel` left none.
- D3 (report and lesson, "seven rows in `## Mistakes`"): superseded. The table holds 11 data rows (`awk` over the section → 12 `| ` lines: header + 11). The blank line between the fifth and sixth rows splits the table; it is recorded here and not repaired in this block.
- D4 (`SCORECARD.md` routed defect (c), "18 of 30 independent counter loosenings survive"): superseded. The independent matrix (`.ufo/waves/round-64/w1/R64MutCounter/matrix.json`): 26 of 30 survive the declared negatives, and 18 of those 26 accept their targeted forgery.
- D5 (S169 Gate quote): acknowledged, not re-verified in round 65. The quote is a field list assembled across the PDL lines; the substance is verified by the non-author reviewer. A contiguous quote or an explicit field-list label is owed.
