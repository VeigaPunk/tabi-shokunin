# CriticAxisScope — axis fit and population honesty

Date: 2026-10-21. Advisory falsification review only; no admission, scalar judgment, integration, or runtime execution.

- Baseline B: `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Attacked checkpoint R: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Observed lane `refs/heads/master`: R. All conclusions below concern this checkpoint, not an eventual delivered revision.

## Axes named and bounded fit

| Claim | Supportable axis reading | Boundary that must not be crossed |
|---|---|---|
| C1 — depth 8, lowest non-retired tie | Actionable thresholds, fill-time versus submit-time errors, mutation/retention behavior, and source-backed control-specific rules deepen the already-held Chromium/WebMCP invocation surface. `SKILL.md:1994-1997` explicitly left declarative validation source-only; `:2051-2092` supplies technical decisions and consequences. This fits depth, not merely a row/source increase. | Fifteen families or 27 rows are not a measured fraction of the domain, 27 newly governed browser surfaces, or a new invocation capability. Do not relabel the same work as coverage merely to add another claim. A new knowledge file alone also does not establish the expansion trend: that requires previously uncovered ground and its coverage-map evidence. |
| C2 — operability 8, lowest tie | The invoke successor's own artifact-root inventory and current-run nonce binding can be two runnable H4 properties. The revised metric is `c2_h4_properties`, not three newly repaired hazards. | H1 and F6 were already working under the tested shapes at B. Extra counter cases are assurance/test coverage, not new browser behavior and not the expertise-axis coverage fraction. |
| C3 — calibration 9 | Four bounded, checkable corrections to the lane's assessment/traceability records fit calibration: the seven-criterion count; the five-substring/one-nonempty assertion split; registry/record attribution; and writer-isolation evidence with its limitation stated. | A runnable checker is a means of checking those records, not a second browser-operability gain. Correcting descriptions does not restore numeric CDP assertions or retroactively create a missing wave-return status capture. |

Authority for this distinction: canonical `AXES.md:11-16,20-22,27-38` and `LEARNING.md:31-46,84-90` [A1, A2]. PLAN `:12-14` establishes the depth/operability/freshness/adjacency tie at 8. Nothing inspected establishes a scalar increase, saturation, retirement, outside admission, or all-axis no-harm result.

## Counterexample 1 — a frozen family population is not a frozen decision population

**Finding: the strong frozen-decision reading is contradicted by the local record; the family-frozen, post-probe decision-catalog reading is supportable.**

1. The original dispatch contains exactly **15** `Fam*` executor items, each with a named family and instructions to probe first and encode what was observed (`w1/spec.json`, `.items[name startsWith "Fam"]`). The final manifest and receipt each represent those same 15 family names. No family addition was observed in those sets.
2. PLAN final revision `:141-146` distinguishes the timing explicitly. Its exact sentence at `:145-146` is: “The decisions were not chosen before the probes; the family population was.” [P1]
3. The manifest metadata says predeclared **before counting**, not before implementation/probing (`decisions.json:4-6`). The knowledge note makes the same narrower timing statement (`webmcp-declarative-validation-round-19.md:24-31`). In contrast, `LOG.md:1089-1090`, `SKILL.md:2043`, and the lesson `:12-16` use predeclared/admitted wording without repeating this distinction. Read alone, those shorter descriptions invite the stronger but unsupported interpretation.
4. There is an additional, concrete limit even to the word frozen after the first count. R's parent is `ea170da3d39089566f080a3095d2b7bb5c7002b7`. Its retained C1 measurement reports **24**, with DV-07 rejected for `probe_family_mismatch`. The R patch then narrows DV-07 from scalar null/array/object behavior with three probe IDs across two families to required-text null behavior with only `decl-missing-required-03`. Current location: `decisions.json:160-183`. Thus the 27-ID inventory can remain the same while a decision's semantic extent and evidence membership change after an earlier measurement. This is a visible correction, not evidence of a pre-probe immutable definition set. No motive or improper selection is inferred.
5. `measure-c1.mjs:31,295-297` enforces a manifest cardinality of 27. A cardinality check establishes neither pre-probe declaration nor immutability of the conditions. Fresh reproduction and source/body binding likewise cannot establish that historical timing.

### Strongest concrete completeness counterexample

`w1/spec.json:218` assigned the date-time family date, time, datetime-local **and month**, including wrong formats. The five committed date-time case inputs contain valid ISO months in cases 01–04 and an out-of-range but well-formed month in case 05; **none sends a malformed month** (`cases/date-time.json`, `/cases/*/input/month`). The current receipt mirrors those five inputs. DV-21 covers malformed date/time/datetime-local, not malformed month (`SKILL.md:2080`). The lesson itself explicitly excludes malformed month for lack of a case (`round-19.md:18`).

Therefore all 15 families being represented is compatible with an originally requested shape remaining unprobed. It cannot establish all family decisions or all originally requested shapes are resolved. The same lesson keeps the null-key ordering unresolved and custom elements/file inputs unexercised (`:16-19`). Those are useful honest exclusions, not evidence for a saturated population.

Granularity is also authored: malformed date/time/datetime-local share DV-21, whereas unknown-key, atomicity, and id-versus-name behavior are split into DV-01–03 (`SKILL.md:2060-2062,2080`). That is reasonable for an actionable catalog but gives no natural, exhaustive denominator for a completeness percentage.

**Impacted axes:** calibration first (timing, denominator, and certainty of the claim); depth if table-row/cardinality counts substitute for distinct supported technical decisions; coverage/expansion if family representation is promoted into domain completeness. This does not by itself invalidate the observed technical lessons.

## Counterexample 2 — newly tested H1/F6 behavior need not be newly repaired

The retained `measurements/c2-ea170da3.json` has a complete result with `c2_h4_properties = 2`. Its `/stdout` JSON, under `/coverage`, separately records:

- H1: SIGINT and SIGHUP pass at both B and the measured successor; each baseline probe observes a nonempty run-owned Chromium identity set, exit 2, the abort marker, no pass/fail receipt, and an empty after-set.
- F6: HEAD, `@`, master, short-7-hex, and off-branch-full refusals pass at both revisions with the generic finding and shape-correct detail; the valid full-ancestor control also passes at both.

The same result's `/h4` records the actual contrast: the old counter would credit the UUID artifact and prior record; the successor fails the UUID mutant through its own scan and rejects a prior nonce. These are recorded observations at **ea170da3**, not a fresh R probe by this seat.

The revised PLAN `:148-151`, lesson `:22-25`, LOG `:1109-1114`, and counter `measure-c2.mjs:1135-1164` already preserve the correct separation: only H4a/H4b contribute to the metric; H1/F6 live under informational coverage. Retain that correction throughout final reporting. Restoring the original `c2_gaps_closed: 0→3` interpretation would silently exchange a runtime-operability delta for added measurement coverage.

**Impacted axes:** operability and calibration. No further axis reclassification is needed for the revised two-property claim, provided L1's final runtime evidence supports the producer-side behavior at the delivered revision.

## C3 — correction records, not retroactive operational perfection

The retained `measurements/c3-ea170da3.json` reports `c3_routed_closed = 4`, including 23 isolation entries. This is an observed historical counter output, not this seat's certification of all four predicates at R.

- d1 corrects the recorded QUALITY count to seven.
- d2 accurately distinguishes five message-substring predicates from the one generic nonempty-message predicate. It does not claim the original numeric-code assertions were preserved (`SCORECARD.md:870`; lesson `:63-65`).
- d3 corrects registry/record traceability; it is not browser functionality.
- d4 must keep its provenance limit. The ledger's `/laneStatusAfterMethod` explicitly labels the after-state **RECONSTRUCTED** from mtimes and a later status listing, and names the missing direct capture. The lesson records that omission at `:84`. A reconstruction is not an independently captured wave-return snapshot; mtimes do not exclude an intervening write-and-restore history. This is a limit on the evidence, not an allegation that such a history occurred.

The safe C3 interpretation is improvement in finite self-assessment/correction records with the reconstruction limitation disclosed. Do not turn the counter's clean label into a claim of complete historical writer-isolation proof or new browser operability. The original strict direct-snapshot criterion and the revised reconstructed-record criterion are not identical; final wording must not merge them.

**Impacted axis:** calibration; writer isolation remains a conformance/evidence boundary. Scope here does not re-audit the separate isolation implementation.

## Smallest safe correction

No production change or broader probe is proposed by this seat. Append one precise population/measurement qualification to the final claim record and point abbreviated SKILL/LOG/lesson wording to it, preserving prior committed text:

> C1 deepens the held declarative-WebMCP surface. Fifteen families were fixed before probing. Twenty-seven candidate decision IDs were extracted after those probes and declared before initial counting; definitions/evidence were subsequently corrected, including DV-07 at R. They are a bounded observational catalog, not a pre-implementation frozen or exhaustive decision population. The current receipt records 66/66 passing cases, including two integration-added controls. The credited decision count is the reproduced count bound to the delivered revision, not the manifest's cardinality.

Keep C2 at two H4 properties with H1/F6 explicitly informational. Describe C3 as four checkable corrections, retaining the reconstructed-snapshot limitation. Do not add coverage/expansion, capability, saturation, scalar, or outside-discernment credit solely from these counts.

**Fixable defect versus forbidden trade:** the population/provenance ambiguity is a fixable reporting defect; it does not inherently trade away depth. The revised C1/C2/C3 axis allocation is defensible within the bounds above. An insistence on a pre-probe frozen 27-decision population, three new runtime hazard repairs, or direct-capture d4 proof would be an unsupported stronger claim, not a harmless tradeoff. Only the canonical judge decides admission; this report makes no such decision.

## Observations and verification limits

Read-only inspection and task-specific static probes only:

- `/usr/bin/git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse --verify refs/heads/master` returned R.
- JSON selectors over the original dispatch, current manifest, and current receipt returned **15 assigned families / 27 manifest decisions / 15 represented receipt families / 66 cases / 66 pass flags**. Receipt pass flags are retained observations, not a fresh execution by this seat.
- Decoded retained measurement stdout returned **C1 24 / C2 2 / C3 4** at ea170da3. The current R receipt was generated later. These are different artifacts and must not be conflated: 66/66 case matches do not alone prove a 27-decision counter result. `SCORECARD.md:866-868` still explicitly marks the current round's measurement table pending.
- `/usr/bin/git ... show --format=fuller --no-ext-diff --no-renames R -- corpus/evidence/round-19/validation/decisions.json .ufo/waves/round-19/PLAN.md` exposed the DV-07 narrowing described above; `/usr/bin/git ... show -s --format='%H%n%P%n%aI%n%s' ea170da3... R` identified ea170da3 as R's parent.
- No browser, counter, suite, build, lint, formatter, canonical judge, or other domain runtime was invoked. L1 owns final delivered-revision verification. No tools were installed or updated. No service or process was left running by this review.

## Source bodies and quotation provenance

All bodies below were accessed locally on **2026-10-21**. URLs are exact local-file URLs; SHA-256 values are of the decoded/plain file bytes read, computed with `/usr/bin/sha256sum`. The only direct source-sentence quotation above is 12 words from P1 at the specified lines; other references use exact line anchors or JSON sections. No external source fetch was performed or claimed.

| Ref | URL / exact anchor | SHA-256 |
|---|---|---|
| A1 | `file:///home/vgpnk/Projects/kimi-shokunin/skills/shokunin/protocol/AXES.md` §The six axes, lines 11–16; lines 20–38 | `04ea5c9e89c91cef645536ab56863ebb014dce617e7083e54968092968a7d993` |
| A2 | `file:///home/vgpnk/Projects/kimi-shokunin/skills/shokunin/protocol/LEARNING.md` lines 31–46,84–90 | `3ff7ab4da9f3ce448477872af62c8d74ad0671e0d5bfc29a4ca8945bd8865964` |
| P1 | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/PLAN.md` lines 12–14,139–156; quoted sentence 145–146 | `abe72ddd1088de226926f373ff6ffd1ccbf4dd7ab032382d438f70a2c21fc496` |
| D1 | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w1/spec.json` `.items` family assignments; FamDateTime prompt line 218 | `f994ebaf68f72266926dc18bc7f75fdfd3c087d7a763417cf103d9dce53c5a5b` |
| D2 | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-19/validation/decisions.json` lines 4–6,160–183; `/decisions` | `839d6501aeb5ab73a9c81d6edc72ce013ddcf4ad4cc3b8891d9929f3385bed5a` |
| D3 | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-19/validation/cases/date-time.json` `/cases/*/input/month` | `f6531c28bf9efead2ceabf1517e7e5016c6b7192097e10b4979a66a0f3d62b90` |
| D4 | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-19/validation/receipt.json` `/summary`, `/cases`, lines 3–20 | `b7846d37b6fe296b5383462d058c6f5961c0adc70064c025d5bb82596402a09a` |
| K1 | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/SKILL.md` lines 1994–1997,2038–2092 | `ed34bcc8b89d74d669f3f5a44c861ac0148050f795802c336e0770dd805d5d74` |
| K2 | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/webmcp-declarative-validation-round-19.md` §Scope/§Method, lines 15–31 | `14d20b11e69bf6b2e4a9fe56b9431537bd4b0b163d8a8a62decc71bf3d3c75a1` |
| L1 | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/lessons/round-19.md` lines 12–27,61–84 | `2df2396944703f9277cab2a1164810cb34e8edcea88414023a6a4e2a7a8462c7` |
| L2 | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/LOG.md` lines 1088–1114 | `ffff35e72b01b9e2cd1dc57fe3d5a5e9de4fb58c2d6c1fc81f21ebec989fa7af` |
| L3 | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/SCORECARD.md` lines 866–870 | `54ecbfb30f3013cdef82c7e305ae97e95bedf7daa0944d17054db1c2105cb8d2` |
| M1 | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-19/measurements/c1-ea170da3.json` `/revision`, decoded `/stdout` | `be6846951bd661731bcf98814791f7250a5fc9c3ea8a358b5328590066c0d8b8` |
| M2 | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-19/measurements/c2-ea170da3.json` `/revision`, decoded `/stdout/h4` and `/stdout/coverage` | `3cf689ac7957a5f3dcfbf1a2139b0f78edfb9f4da42de91217366b6c69020912` |
| M3 | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-19/measurements/c3-ea170da3.json` `/revision`, decoded `/stdout` | `b3fc4b19b9bc458c0184298d3f2eca5b98ae5053c5cfecbea1f68bf801e34e38` |
| I1 | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/isolation/ledger.json` `/entries`, `/laneStatusAfterMethod` | `49aef3dc06bb092e7183206d25828a780345385fe714cab6877b67dd0e7623be` |
| C1 | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/measure-c1.mjs` lines 31,295–297 | `a5126e5e5423e8e370aa60c67ece3253431662717550e934b986c04f7e2b7858` |
| C2 | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/measure-c2.mjs` lines 1135–1164 | `a8003530f0a7b95ef830f3eeb6fa6d9d9b420855396beea8911ac02ea1ec53a1` |

## Isolation

- Clone: none; report-only static review, no runtime/mutation probe.
- Branch: none.
- Base: B (`66251bfc1aef393e4aec599e950a8deb867736bb`); attacked checkpoint R as above.
- Commit: none; no Git write command or jj command executed.
- Changed paths: only `.ufo/waves/round-19/w2/CriticAxisScope.md` (this assigned report).
- No production, sibling, fleet, browser-profile, domain-source, routing, or host-state writes.
