author: hyaku closure (non-author integrator, @m_zfl)

# Round 63 — non-author verifier spot-check (hyaku closure)

Lane `tabi`, lane-round 63 (attempt 1). Lane tip reviewed: `5b7029ebd9ad96282e662a1225cb4762aa074cf1`;
baseline `f098bcf8843c8a5a723a83995352180f897a6ff9`; instrument/controls freeze
`816592612dd2a8073437c595d3fe3c477125cf3c`; wave spec/dispatch `e5325ad8805df86cb0109373d2ac695f558c2a1f`.
Written by the closure role, which authored nothing in this round. No lane gate, counter, driver, selftest
or jj command was executed here: every number below is re-derived from committed bytes
(`git show` / `git ls-tree` / `jq` / `wc` / `sha256sum` / `grep`) or read from a committed control receipt.
Three read-only reviewer/critic seats re-derived the same bytes in parallel; the rulings are the integrator's.

## 1. Conformance (PROTOCOL step 1)

| Item | Result | Evidence (command → observed) |
|---|---|---|
| Report path/name | pass | `.ufo/reports/round-63/tabi.md`; required sections present (Work performed, Landed changes, Before → after, Sources & frontier, Trend verdicts, SHONEN, routed defects, round shape) |
| Report committed by the lane identity | pass | `git log --format='%an %ae %H' -- .ufo/reports/round-63/tabi.md` → `tabi-shokunin tabi@shokunin.local b8fce783…` (initial filing `2ece353c…`, section-order correction `b8fce783…`; both authored by the lane) |
| Report lands after the cited work | pass | lane tip committer date 16:30:07 −03:00; report commits landed 16:30:54 and 16:31:24 (the second reorders the already-required sections; no claim text changed); driver completion 16:31:44 |
| Cited lane commits exist and are ancestors of the branch | pass | `git merge-base --is-ancestor <h> refs/heads/master` → YES for `81659261`, `e5325ad8`, `54170404`, `5b7029eb`; `git cat-file -t` → commit for all four |
| Lane clean and pushed | pass | `scripts/hyaku/jj-lane.sh state …` → `local=5b7029eb… remote=5b7029eb… ahead=0 behind=0 head=detached tracked=0 untracked=0`; `git status --porcelain` → empty |
| `SHONEN` heading, one line per box | pass | 4 lines, all `[~]` with a pointer, one per `SHONEN.md` box; no `[x]` written (promotion is operator-owned). Box-1 pointer cites a digest that does not resolve (§5 D1) |
| Prompt carries the template contract | pass | `/home/vgpnk/Projects/shokunin/.ufo/prompts/tabi-round-63.md` (810 lines): §1–§5 byte-identical to `templates/round-prompt.md` after `{{LANE}}/{{ROUND}}/{{FLEET_ROOT}}/{{AXES}}` substitution (only the `<tabi-repo>` placeholder resolves to `tabi-shokunin`), then §6 hyaku addendum (phases 3–7, run-15 notes, route split) and §7 scratch discipline. Report path, commit-then-report ordering, `SHONEN` heading, hash citation and write/push scope all present |
| Prompt durable before dispatch | pass | prompt commit `d63387f2…` at 15:43:28; watchdog launch `2026-11-04T15:44:11-03:00` (log line 2434), complete `2026-11-04T16:31:44-03:00` (line 2445) |
| L2 wave shape | pass | `w1/swarm-registry.json` 12 members: scout 1, executor 3, scribe 1, connector 1, reviewer 1, critic 1, mutation-tester 2, sentinel 1, revenger 1; attack seats 6/12 (50 %); `w1-results.json` `seats=12, results=12, nonempty=12, notes=0` |
| Misroot sweep | pass | fleet `git status --porcelain` shows `.scratch/*`, `.ufo/reports/round-84/kama.md`, `.ufo/tmp-census-r79.txt`, `after` — none is tabi r63 work and none was touched by the lane |

Status: **ok** (real report, real committed round work; defects below are conformance repairs, not marker evidence).

## 2. Claims re-checked

### C1 — coverage, capability `chromium-wheel-scroll-domain-linux` — reported UNPROVABLE → ruling **unprovable**

Before (baseline `f098bcf8`): no r63 driver, counter or evidence.
`git cat-file -e f098bcf8:scripts/chrome-cdp-loopback-round63.mjs` → ABSENT; same for the counter and
`corpus/evidence/round63/chromium-wheel-scroll/receipt.json`; `git ls-tree -r --name-only f098bcf8 -- corpus/evidence/round63/ | wc -l` → 0.
Red-before control `controls/old-generation/result.json` → `"demonstrated": true` (r62 pristine exit 1 on a
lying receipt, exact-line mutant exit 0).

After (committed bytes at `5b7029eb`), re-derived:

| Measurement | Command | Observed |
|---|---|---|
| evidence dir | `git ls-tree -r --name-only 5b7029eb -- corpus/evidence/round63/chromium-wheel-scroll/ \| wc -l` | 15 (0 at baseline and at the freeze) |
| manifest | `sha256sum -c MANIFEST.txt` on the materialised tree | 14/14 `OK`, exit 0 (the 15th file is `MANIFEST.txt` itself) |
| scored run 1 | `controls/counter-data-run1.command.json` + `.stdout` | `exit 0`, `{predicate:true, findingCount:0, findings:[]}`; stdout sha matches the recorded hash |
| scored run 2 | `controls/counter-data-run2.command.json` + `.stdout` | `exit 0`, same JSON on `stability/receipt-run2.json` |
| legs | `receipt.json` | 6 legs, scrollY 0 → 120 → 240 → 120 → 120 (swallowed) → 240 (released); nonces `tabi-r63-data-one` / `tabi-r63-data-two` |
| counter selftest | `controls/counter-selftest.txt` | `cases=22, results=22, allPass=true`; trailer `TABI_R63_COUNTER_SELFTEST verdict=clean cases=22 passed=22`; stdout sha matches the command receipt |
| ten negatives | `controls/mutation/matrix.json` `.baseline.negativeExits` | 10 entries, every `exit 1`, each with one finding (9 distinct ids: `producer-verdict` covers n1 and n2) |
| eight mutants | same file | `mutants` 8, every `acceptedLive:true, liveExit:0, distinguished:true`, `survived:[]`, `allKilled:true` |
| cold-run stability | `controls/stability-direct.json` + my own diff of the two receipts | `crossRunPngsIdentical 4 of 4`, `aShotsMatchOwnRecords`/`bShotsMatchOwnRecords` true, `verdict STABLE-DIRECT`; legs / wheellog-minus-ts / pageState diff = 0 lines; the four PNGs hash to two values (a=b=c, d), identical per step across runs |
| no-work boundary | `w1/R63Reviewer/receipts/attack-results.json`, `w1/R63Critic/donothing.json` | `v12-fully-forged exit 0 predicate true` on a hand-written receipt with four 70-byte 1×1 PNGs; critic runs `B-fabricated-receipt-1x1-pngs exit 0` and `C-fabricated-receipt-borrowed-real-pngs exit 0` |
| independent survivor battery | `w1/R63MutCounter/matrix.json` `.summary` | 29 mutants, 9 distinguished, 19 survivors — the disclosed W5 limit |

Ruling: the frozen predicate is met on committed evidence, but the cheapest do-nothing control also reaches the
target, so the capability is not demonstrated by the generation as declared. The lane reported exactly this
(`C1 UNPROVABLE`, no capability row, real runs and repair plan kept). **I concur: unprovable.** No capability
row enters; coverage stays 9.

### C2 — calibration, self-assessment gate — reported VERIFIED → ruling **verified on the frozen predicate**, two evidence defects routed

| Measurement | Command | Observed |
|---|---|---|
| before | `controls/selfassessment-before.{json,command.json}` | `rev f098bcf8…`, `mismatches 2`, `clean false`, `exit 1`, `counted=[m1 SCORECARD.md:3427 claimed 44 observed 9; m3 claimed landed observed 1]` |
| after | `controls/selfassessment-after.{json,command.json}` | `rev 54170404…`, `mismatches 0`, `clean true`, `exit 0`, `counted=[]`, `worktreeCleanAtRun=true` |
| gate bytes unchanged | `git rev-parse <rev>:scripts/check-selfassessment.mjs` at `f098bcf8`, `81659261`, `54170404`, `5b7029eb` | all four `db0767d7d1ab7e2a0609213aa715925a69825ce9` |
| 45/45 selftest | `.ufo/waves/round-63/w1/R63ExecGate/receipts/check-selfassessment-selftest.out` | trailer `SELFASSESSMENT_SELFTEST verdict=clean cases=45 passed=45`; the lane's own `gate-selftest.command.json` commits `exit 0` and a stdout sha but no tally text |
| correction landed append-only | `git diff --numstat f098bcf8 5b7029eb -- SCORECARD.md` | `65 0` (pure append); baseline line 3427 unchanged (`md5` equal at both revs); the one-line correction sits in the appended round block |
| r62 artifact durability | `git ls-tree -r -l 5b7029eb -- .ufo/waves/round-62/w1/R62Scout/` | `commands.json` 1,388,366 B committed beside 7 siblings + `MANIFEST.txt` (8 hash lines) |

Ruling: the counted predicate (`mismatches 2 → 0`, `clean false → true`, exit 1 → 0) is verified; the gate blob
is unchanged and its 45/45 selftest has committed output. Two defects are routed, neither of which changes the
counted predicate: the after-receipt is measured at `54170404` (the tip's parent) while the claim text says
"at the landing revision", and the appended SCORECARD row prints `194 could-not-evaluate / 58 superseded` where
its own receipt says `142 / 59`.

## 3. Per-axis verdicts

| Axis | Verdict | Basis |
|---|---|---|
| adjacency | unchanged | connector scan reported (299 lines across 20 lanes, 0 same-surface, 0 registry collisions for the two URLs); nothing absorbed; `SCORECARD.md` diff is `65 0` |
| coverage | unprovable | C1: frozen predicate met, do-nothing standard failed; no capability row; score 9 held |
| depth | unchanged | no decision-table/source depth claim this round; `QUALITY.md` +1 criterion is the mistake fold-in |
| operability | unchanged | no runnable-artifact claim; instruments are r63-local and frozen |
| freshness | unchanged | no re-verification sweep claimed; the new SKILL pin does not resolve (D1), so it is not counted as freshness gain |
| calibration | improved | committed 2 → 0 mismatch repair with unchanged gate bytes; two evidence defects routed (D2, D3) |

No owned axis is harmed: the six modified files are pure additions (`LOG.md 12/0`, `SCORECARD.md 65/0`,
`SKILL.md 27/0`, `corpus/QUALITY.md 15/0`, `corpus/README.md 10/0`, `corpus/SOURCES.md 4/0`), zero deletions in
the round diff, `PROVINCE.md`/`SHONEN.md` untouched, and every axis score still reads the r63 start value.

## 4. Discernment spot-check (LEARNING.md, non-author)

Re-opened both live sources and the committed staged bytes; both staged files hash to the digests their
`SOURCES.md` rows and `claims.json` pins name (`s166b` `78bd40dc…`, 156,604 B; `s167` `51a7efdb…`, 1,084,848 B).

| Item | Decision | Re-opened source | Agree/disagree | Reason |
|---|---|---|---|---|
| S166 MDN WheelEvent — delta semantics, B/docs | admit | `https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent` (live) + staged `s166b-mdn-wheelevent.html` | **agree** | The 11-word quote (`WheelEvent.deltaY Read only` / `Returns a double representing the vertical scroll amount.`) is at the *Instance properties* anchor; `deltaMode` "unit of the delta values" is on the same page; the row's scope explicitly excludes pixel identity and cancelation |
| S166 as support for pixel-unit identity, `isTrusted`, `cancelable`, scroll arithmetic | reject | same page | **agree** | The page states property semantics only; it carries no cross-build pixel guarantee and no delivery/measurement contract, and the flip condition names exactly what would ground those claims |
| S167 CSSOM View — `scrollTop` getter, A/spec | admit | `https://drafts.csswg.org/cssom-view/` (live editor's draft, 8 Oct 2026) + staged `s167-cssom-view.html` | **agree** | The 13-word quote (`The scrollTop attribute, on getting, must return the result of running these steps`) is at *6. Extensions to the Element Interface*; tier A fits a normative spec; scope is the getter only |
| S167 as a cancelation or smooth-scrolling authority | reject | same live draft | **agree** | The row's quote is the getter definition only; the same document does define scroll timing (§3.1 *perform a scroll* / smooth scroll / `scrollend`), so the flip should name §3.1 — recorded as a refinement of the reason, not a disagreement with the decision |
| r62 secondary-button domain re-declared as a capability | reject | `corpus/QUALITY.md` rule 114 | **disagree (citation only)** | The decision is right (no retroactive admission), but QUALITY 114 says "Pin existing instrument bytes before seats score them…", not that a new generation cannot retroactively admit; the rule that governs is `claims.json` `freezeRule` / PROTOCOL. Routed as D6 |
| A repaired r62 predicate | reject | `claims.json` `freezeRule` | **agree** | Frozen predicates are not narrowed after scoring; the round declares a new generation instead |

Quote lengths: S166 11 words, S167 13 words — both ≤25. Sample minimum met (≥1 admit, ≥1 reject, both
re-opened). Net: the outside sample agrees with the gate's admits and with the scope rejects; the one
disagreement is a citation, learned here and routed.

Census (`scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`): exit **0**,
`tabi ok …corpus/SOURCES.md`, 22 pre-existing W04 duplicate-URL lines. Manual census over committed bytes:
167 rows (A 149 / B 9 / C 9; mined 142 / queued 15 / rejected 10), 0 malformed, no duplicate id; baseline
`f098bcf8` 165 rows (A 148 / B 8 / C 9). Note: the two committed census outputs print only the W04 lines and
the `ok` line — the row/tier figures are re-derived, not printed (D7).

## 5. Trend verdicts

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | improved | `git ls-tree -r --name-only <rev> -- corpus/knowledge/ \| grep -c '\.md$'` → 74 at `f098bcf8`, 75 at `5b7029eb`; the new note cites S166/S167, both `mined` rows opened this round; a README coverage row exists; registry 165 → 167 |
| quality | unchanged | no admitted entry was re-verified, deepened or superseded this round; the +1 `QUALITY.md` criterion (115) is the mistake fold-in, not a re-verification; no admitted entry failed a re-check |
| discernment | improved | outside sample agrees 4/4 (2 admits, 2 rejects) with the gate; the single citation disagreement is recorded here and routed (D6), so it is not left unlearned |

## 6. Routed defects the lane must fix next round

1. **D1 — the SKILL.md digest pin is unresolvable.** `SKILL.md` §Wheel/scroll says
   `corpus/knowledge/chromium-wheel-scroll-round-63.md sha256 4c54e0c91de1`; the committed file hashes
   `d376dc707747eab67bc5c32238094fb31d21f59fca3f4d11f4c4be54f2c05cfb` (git blob `ff090933…`), and no
   tracked md/json/lua/txt/html file in the round tree has a sha256 starting `4c54e0c9`. The report's SHONEN
   box-1 pointer cites the same digest. Replace it with the true digest (and keep the re-derive command).
2. **D2 — SCORECARD r63 row contradicts its own receipt.** `SCORECARD.md:3465` prints
   `194 could-not-evaluate and 58 superseded`; both committed after-receipts say `couldNotEvaluate 142`,
   `superseded 59` (58 is the before value). Append a correction line naming the superseded numbers.
3. **D3 — C2 after-receipt is one commit short of the landing revision.** The receipt's `rev` is
   `54170404` (tip's parent) while the claim text says "at the landing revision". The gate's read set
   (`SCORECARD.md`, `LOG.md`, `SKILL.md`, `corpus/README.md`, `corpus/evidence/**.json`, live `git status`)
   does not include the three files `5b7029eb` adds, so the verdict transfers — but attach a receipt measured
   at the landed tip (or state the delta and why it cannot move the verdict).
4. **D4 — the mutation matrix cannot show which receipt it ran on.** `controls/mutation/matrix.json`,
   `matrix-data.json` and `matrix-smoke.json` are byte-identical (`sha256 7e5b4691…`), record no live/shot
   path or hash, and have no `*.command.json` exit receipt; the report's "matrix over the scored receipt" is
   therefore unverifiable as committed, and `mutantsSurviving 0` is true only of the eight declared mutants
   (already disclosed as W5). Record input path+sha and an exit receipt per run.
5. **D5 — `forgedGreen 0` is not an emitted field, and one negative is misnamed.** The count exists only in
   `claims.json`; it is derivable from the ten exits (all 1) but not printed. `n7-fabricated-step-label`
   actually mutates `steps[0].sha256` (finding `shot-bytes`). Emit the count; rename the negative.
6. **D6 — Gate citation misattribution.** The r62 re-declaration reject cites `QUALITY.md` 114; rule 114 pins
   instrument bytes before scoring and says nothing about retroactive admission. Cite the
   `claims.json` `freezeRule` / PROTOCOL text, or add a `QUALITY.md` criterion that states the rule.
7. **D7 — census outputs do not print the counts attributed to them**, and
   `stability-direct.command.json` has no committed generator or stdout digest (its `argv` is prose). Emit
   the census count lines and commit the direct-stability generator with its output hash.
8. **D8 — knowledge-note provenance.** The note's `verified-at: 81659261…` names the instrument freeze, a
   revision at which the note, its receipt and its stability twin do not exist (they land at `54170404`).
   Point `verified-at` at the measurement/landing revision, or say the freeze rev is the pin revision.
9. **D9 — evidence-pointer precision.** The S166 size pair `181,303→156,604 B` reads as one file shrinking;
   the two numbers are two different staged pages (`s166-mdn-wheel.html` and `s166b-mdn-wheelevent.html`),
   already disclosed as W9 F-3. Say so in the note/row or drop the unused size.

## 7. Ruling

C1 is **unprovable** on its own do-nothing standard and C2 verifies on its frozen predicate; no axis is
harmed; all scores hold (adjacency 8, coverage 9, depth 9, operability 9, freshness 9, calibration 9);
no capability row enters. Round verdict: **rejected-honest-stop**. The lane status is **ok** (real report,
real committed work, honest shortfall). Promotion remains operator-owned: all four SHONEN boxes are
author-asserted `[~]` and none is checkable by this closure.
