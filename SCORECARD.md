# tabi-shokunin — Scorecard

Lane axes per AXES.md (six-axis vocabulary; primary verdicts per
LEARNING.md trends). Probation rounds 1–3 built the initial measurements;
rounds 4–11 extended them. **This is the terminal refresh** (SCR-B11, the
closeout round — lane round 11 = training r10): the r4–r11 primary-verdict
tables, the refreshed axes table and the move log placed in order land here;
the r1–r3 tables are kept as landed. Convention note: no round after 3
re-pinned a numeric score — the axes trajectory r4–r11 is the move log's
qualitative before→after, and the axes table's score column keeps each axis's
**last explicitly measured** value; no scalar is inferred here.

State at writing (2026-10-14T21:58Z, SCR-B11, round-11 record): repo HEAD
`d24b98d` (round-10 integration) with the round-11 work uncommitted in the
tree — `git status --short` → `M SKILL.md` (`f4d9cf5b1aa5`, +138 → 1,458 `wc -l`),
`M corpus/knowledge/archive-receipt-r10.md` (§8 final archive sweep append,
`79255f1e03b8` / 424) plus untracked `corpus/evidence/w10-*/`×4 + `w11-*/`×5
(9 new groups), `corpus/knowledge/closeout-r11.md` (`2147f3ec2ff2` / 234),
`corpus/lessons/round-10.md`, and `plans/completion-evidence.md`; the
integration commit is owed at write time (round-3 pattern). Counts at that
stamp: knowledge **23** / 7,279 lines; lessons **10** (`round-11.md` still
owed at write time); reports 7 (r4–r10); evidence **45** groups / 45
manifests / 1,782 files / 10,720,052 B (36 / 1,721 / 10,318,947 before the
round's sweep); README `e156bb99af2c` / 59 (header + coverage rows 4–11
refresh **not landed** at write time — named as owed in the LOG entry);
L0 `.ufo/l0-questions.md` `02c53ec60acf…` / 25 lines / 21,539 B / **1**
`tabi` line; daemon down (no listener on 10086, no process); Brave reject →
`NativeMessagingHosts` only (11th consecutive). Every score was measured
against that working tree; re-run the commands — the commit supersedes the
pointer, not the counts.

## Primary verdicts — round 1 (three trends, `LEARNING.md:23-36`)

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | improved | 0 → 3 admitted knowledge notes, each on ground the (empty) coverage map did not hold, each now carrying a coverage row (`ls corpus/knowledge/*.md \| wc -l` → 3; `sha256sum corpus/knowledge/*.md` first-12 → the three `SKILL.md:23-27` pins, re-matched 2026-10-14). |
| quality | unchanged | First-admission round — nothing to supersede, no stale entry; the scribe's same-day anchor spot-checks all held (anatomy §8.1–8.4; cdp :36/:105/:84-85; census :54), so no admitted entry failed a re-check. |
| discernment | improved | First outside spot-check (scribe, non-author per `LEARNING.md:37-43`) agrees with the round's gate on one admit and one reject: admit — manifest↔skill version consistency (`grep -n '"version"' kimi.plugin.json` → `4: "version": "1.11.3"`, skill `SKILL.md:6` same); reject — "Brave installed" (`ls -A ~/.config/BraveSoftware/Brave-Browser/` → only `NativeMessagingHosts`; census:40-43). |

## Primary verdicts — round 2 (three trends, `LEARNING.md:23-36`)

Recorded 2026-10-14 by TABI-SCRIBE (integrating round; wave-2 seats TABI-R2-1
capture, TABI-R2-2 daemon disposition, TABI-R2-3 verify/errata, TABI-R2-4
poll; TABI-A1 r2b audit in flight at record time). Axis move: **depth**.

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | improved | 3 → 5 admitted notes, both new ones on ground the round-1 map did not hold (live dynamic-page capture; daemon lifecycle/state), each now carrying a coverage row (`ls corpus/knowledge/*.md \| wc -l` → 5; new-note sha pins `56224aa88430` / `9240f1d66a8c` re-matched 2026-10-14). |
| quality | improved | All three round-1 notes re-verified by TABI-R2-3 via append-only errata (pure appends — `/tmp/tabi-r2-3-verify/append-proof.txt` byte-prefix proof; pre-append hashes equal the round-1 pins, re-derived by the scribe from `7961735`): 2 anchor-level corrections applied (census `operations.md` cite off by 4; cdp `url`-normalization rule), 1 unbacked sighting downgraded to non-replayable (cdp §2 launch-window listing), live-state supersessions recorded for the daemon; no admitted entry left false-or-stale-unmarked. |
| discernment | improved | Outside spot-check by the scribe (non-author of every round-2 note), per `LEARNING.md:37-43`: agrees with both round-2 admits after re-running their anchors (methodology shas + capture-pair hashes; live `ss -ltnp` + `/status` shape); re-ran the standing Brave reject → `NativeMessagingHosts` only (agree); independently verified the census off-by-4 correction against `operations.md:17-22` (Web Store URL with the id at :18, 中文 help URL at :22). |

## Primary verdicts — round 3 (three trends, `LEARNING.md:23-36`)

Recorded 2026-10-14 by TABI-B4 (scribe; probation-completing round; seats
TABI-R3-1 journey, TABI-R3-2 approval table, TABI-R3-3 SKILL integration +
anchor re-derivation + smoke replay, TABI-R3-4 executor test; TABI-B1 r3b
audit in flight at record time — scratch created, empty). Axis moves:
**depth** (journey evidence) + **calibration** (approval table finalized),
per `plans/round-3.plan.md`.

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | improved | 5 → 8 admitted notes, all three new ones on ground the coverage map did not hold (multi-step journey evidence; interaction-approval taxonomy; no-oral-context sufficiency testing), each now carrying a coverage row (`ls corpus/knowledge/*.md \| wc -l` → 8; new-note sha pins `67447c028e90` / `70ce826303d0` / `1262708864db` re-matched 2026-10-14). |
| quality | improved | No admitted entry false-or-stale-unmarked: TABI-R3-3 re-derived all five prior-note pins + substrate pins (`anchors.txt`; scribe re-matched), and the SKILL.md final revision applies the executor's errata E1–E5 (count definition `:158-159`, two-click delta `:313` — re-read by the scribe in `SKILL.md@452bc514d387`). Cross-seat reproduction: the r2 capture chain byte-reproduced a third time (TABI-R3-3 smoke), and the executor test reproduced r2's det-before `c08947dc…802dc1` across its own two runs. Nit recorded, not silently fixed: SKILL §Pins quotes the executor note as "297 lines", `wc -l` → 298 (sha matches — annotation slip; LOG round-3 entry). |
| discernment | improved | Outside spot-check by the scribe (non-author of all three notes), per `LEARNING.md:37-43`: agrees with all three round-3 admits after re-running their anchors (journey methodology + run1 PNG shas; approval-table counts 6 C-rows / 12 A-rows; executor methodology pins + compare.tsv 10 yes / 3 expected-NO); re-ran the standing Brave reject → `NativeMessagingHosts` only (agree, third consecutive round). |

## Primary verdicts — rounds 4–11 (owed by every prior round's record since r4; landed in this final refresh)

Verdicts use the `LEARNING.md:23-36` vocabulary; each row's evidence is the
round's own lesson `## Gate` + its audit report + its record draft, re-read at
this write. For r2–r11 artifacts the rounds' coverage rows were owed at the
time of their lessons; the README refresh that lands them is named owed in the
LOG entry at this write (state, not silently assumed).

| Round (training) | Axis move (as logged) | expansion | quality | discernment |
|---|---|---|---|---|
| 4 (t3) — `corpus/lessons/round-4.md` §Gate; `reports/r4-aud-tab1.md` | coverage (+depth) | **improved** — 8 → 11 notes, all on uncovered ground (network rung; async step; hygiene sweep) | **improved** — every prior pin re-verified (methodology 12/12, sweep `PINS.txt` 8/8, corpus 8/8, substrate 3/3); wire-variant errata applied; daemon OOM-death supersession recorded; no entry left false-unmarked | **improved** — non-author spot-check (SCR-B + AUD-TAB1 §8) agrees on admits and rejects; the OOM kill mechanism left unmeasured, not asserted |
| 5 (t4) — `corpus/lessons/round-5.md` §Gate; `reports/r5-aud-b5.md` | freshness | **improved** — the archive tranche (25 groups / 1,010 files / 6,780,293 B) + receipt `archive-receipt-r5.md`; 4 lesson files with Gates | **improved** — manifest-pin equality on every archived file (269/269 OK; 52/52 pin instances MATCH); clause (c) correctly carried, never claimed closed on a same-day witness | **improved** — AUD-B5 + an independent SCR-B6 re-derivation agree; the strictly-later-date impossibility kept as a stated reject |
| 6 (t5) — `corpus/lessons/round-6.md` §Gate; `reports/r6-aud-b6.md` | freshness + calibration | **improved** — +2 notes (external-class fixture v2; webbridge revival assessment) | **improved** — AUD-B6 re-ran one fixture interaction on both pinned runner revisions (identical trips); 12/12 harness/fixture pins; 269/269 archive lines; three lanes' frozen values agree | **improved** — the revival assessed, not executed (operator-owned; the never-set held); AUD-B6 agree |
| 7 (t6) — `corpus/lessons/round-7.md` §Gate; `reports/r7-aud-b7.md` | calibration + freshness | **improved** — +2 notes (layer-routing synthesis; packet-readiness) + 7 archive groups (tree 28 → 35, 41 files) | **improved** — AUD-B7 423/423 manifest lines; 48 in-group + 55 owning-note pins MATCH; the plan fingerprint delta kept on record | **improved** — AUD-B7 + SCR-B7 agree; unlanded items named (L1 matrix; state-changing step) |
| 8 (t7) — `corpus/lessons/round-8.md` §Gate; `reports/r8-aud-b8.md` | depth | **improved** — +3 notes (stateful fixture; carried-debt closure; receipt r8); lessons 6/7 landed | **improved** — AUD-B8 20/20 rows PASS; independent VER-B8-1 re-run 7/7 runs exact; F1 staleness checked from both directions | **improved** — AUD-B8 agree (F7 scope-noted; D5 count erratum); an admit and a non-admit sampled, both agreed |
| 9 (t8) — `corpus/lessons/round-9.md` §Gate; `reports/r9-aud-b9.md` | depth | **improved** — +1 note (state-changing matrix: 10 idempotency classes, replay contract, token-state table) + the w9 tranche landing | **improved** — F1 closed without touching archived bytes; AUD-B9 M1–M7 PASS; 83/83 manifest; 7/7 harness pins re-derived | **improved** — AUD-B9 agree; its scope limit kept — 8 of 14 cells still un-re-run by any non-author (named, not smoothed) |
| 10 (t9) — `corpus/lessons/round-10.md` §Gate; `reports/r10-aud-b10.md` | calibration | **improved** — +2 notes (arc synthesis; receipt r10); r9 tranche archived (tree 35 → 36) | **improved** — AUD-B10: 3 claims re-derived PASS (F1/F2 findings kept, not harmonized); 269/269 manifest; copy fidelity 0 diff; rung-1 claim CONFIRMED by archived-byte re-hash | **improved** — AUD-B10 agree (findings riding); the fleet's cell-for-cell verifier confirmations (`494d32a`); `round-10.md`'s own spot-check agrees |
| 11 (t10) — `corpus/knowledge/closeout-r11.md`; VER-B11 verdict (scratch `/tmp/w11-ver-b11-poll/VERDICT.md`, post-snapshot); `archive-receipt-r10.md` §8 | freshness | **improved** — 22 → 23 notes (the closeout) + the receipt §8 append; the final sweep (9 groups / 52 files / 390,702 B; tree 36 → 45) | **improved** — the §Pins block re-bound finally (12 final values + 29 newly pinned files; declared supersessions held as such — `SKILL.md` §T2/§T3); 491/491 + 52/52 manifest lines OK; 0-diff copy fidelity; clause (c) honestly IN FORCE (claim 3/4 — no same-day closure claim) | **improved** — VER-B11's independent re-derivation agrees throughout (citations in-bounds; §5 pin table 28/28; negative sweeps re-run) while keeping findings F-v1–F-v4; B11-2's check and B11-3's A+B re-runs agree |

Fleet-recorded verdicts (`MANIFEST.json` tabi entries): all five recorded
axes **improved** for every training round r1–r9; training r10's fleet entry
lands with the fleet closeout (not yet recorded at this write). No axis
saturated; nothing retired — the chain ends with the fleet at 10/10 rounds.

## Axes — final state (refresh landed round 11; scores keep the last explicitly measured value)

| Axis | Score | Evidence pointer (counting command) | Last change |
|---|---|---|---|
| depth | 7 | r3 move (journey evidence: 4-page loopback site, per-step captures, compare.tsv 25 IDENTICAL / 3 expected DIFFER — `multi-step-journey.md:71-197,229-251`); moves since: **r4** network rung (150 compare rows, 127 IDENTICAL / 23 accounted; closure `finEnc − last-hop header − body = 0` on 7/7 wire resources — `network-evidence-rung.md` §3–§6), **r8** stateful fixture (session/cookie-shaped state, multi-visit, non-idempotent steps; VER-B8-1 re-run 7/7 exact — `stateful-fixture-evidence.md`), **r9** state-changing matrix (10 idempotency classes, replay contract, token-state table — `state-changing-matrix-r9.md`). Ceiling: real-site classes untested (approval-gated); byte-identity environment-scoped. | r9 |
| coverage | 5 | r3 rider (8 notes over the owned surfaces). Moves since: r4 +3 · r5 +1 (+25-group archive) · r6 +2 · r7 +2 (+7 groups) · r8 +3 · r9 +1 (+w9 group) · r10 +2 · r11 +1 + the final sweep (9 groups) → **23 notes / 45 evidence groups** (`ls corpus/knowledge/*.md \| wc -l`; `ls -d corpus/evidence/*/ \| wc -l`). Ceiling: rate/rights/site-gotcha records still unmeasured (bounded-runs rule); extension↔daemon handshake open. | r11 |
| operability | 5 | r3 rider (13-step runbook executed verbatim start-to-finish by a document-only executor, twice, with closure proof — `executor-test-sufficiency.md` §1–§2) + the archive mechanism (receipt checks A–D, re-runnable; re-run this round 52/52 OK, 0 diff — `archive-receipt-r10.md` §8.3). Ceiling: no repo-local gate scripts (`ls corpus/*.sh scripts/` → none). | r5 |
| freshness | 3 | r2 rider (same-day re-verification). Final state: **clause (c) IN FORCE** — the strictly-later-date pass is time-blocked at 2026-10-15T00:00Z; the round-5 four-clause claim stands **3/4**, recipe carried (`closeout-r11.md` O1/§6; `plans/round-11.plan.md:453-459`); the §Pins block re-bound finally (`SKILL.md` §T2 `:1349-1394`) and the round's spot re-hashes 491/491 + 52/52 OK. | r11 |
| calibration | 6 | r3 move (approval table finalized: 6 C-rows + 12 A-rows, gate + falsifier per class). Moves since: r5 packet filed + one L0 line; r6 revival assessed, not executed; r7 layer-routing synthesis; r9 F1 kept-not-repaired; r10 arc synthesis + AUD-B10 findings riding; r11 the four gate stamps + VER-B11's findings kept (F-v1–F-v4). The never-set held eleven rounds (`closeout-r11.md` §2.2). | r10 |
| adjacency | 5 | r1 pin (kaidoku precedents `grep -c 'kaidoku-shokunin/corpus' SKILL.md` → 5; refusal routes `PROVINCE.md:15-19`). Moves since: r5+ the fleet watchdog item carried (reported, never absorbed — O14); r8 carried-debt closure; r10 the loopback-perimeter synthesis (`arc-synthesis.md` §4). | r10 |

## Move log

| Round | Axis | Before | After | Evidence |
|---|---|---|---|---|
| 1 | coverage + calibration | Empty coverage map, 0 knowledge notes, 22-line SKILL seed at `ff81c0f` (`git ls-tree -r --name-only ff81c0f -- corpus/` → QUALITY.md + README.md only; `git show ff81c0f:SKILL.md \| wc -l` → 22) | 3 admitted notes (539 lines — `wc -l corpus/knowledge/*.md`) + coverage rows + SKILL.md distillation (+114/−2: decision table, record envelope, session-material and rights rules, all cited); obs/inf/unknown separated, 17 unknowns, 3 rejections/incidents kept | sha256 first-12 `49f0735b0594`/`9e4d69dcd658`/`034b1e53b004` re-matched; admit + reject spot-checks agree (Primary verdicts row); anchors re-ran clean 2026-10-14 |
| 2 | depth — evidence ladder | Round-1 state: 9-item record envelope + 3-row claim-class table, all static-capture; byte-determinism proven only on a static `data:` URL (round-1 E9); cdp §7.8 (determinism beyond static content) open; no daemon-lifecycle rules; start-authority reading unresolved (`webbridge-plugin-anatomy.md:136-138`) | 3-rung evidence ladder (static bytes → dynamic capture pair → multi-signal), each rung with a measured anchor; determinism boundary measured on both sides — det-before `c08947dc…802dc1` and det-after `7488d544…4b42c7` byte-identical across two independent server+browser runs after JS mutation + real input, live-page captures differ while DOM-shape struct survives; 7 new capture rules; approval-discipline table (start = doc-authorized self-service, stop/restart/uninstall = operator-only), start executed and left running as a recorded state change (pid 3934817, `127.0.0.1:10086`) | Scribe re-runs 2026-10-14, all held: methodology shas (page `21e27aa6…1c99`, capture.mjs `d37d36dd`, driver.sh `8105bed0`, compare.mjs `e558bd54`; line counts 61/209/85/47); run1↔run2 det PNG + shape hashes identical (`compare.tsv`); ports 19411/19412 closed, no chromium survivors; daemon `ss -ltnp` pid 3934817 + 8-field `/status` shape (`extension_connected:false`); substrate pins `84a8e69d04c5`/`b811d9c23dfd` unchanged |
| 3 | depth — journey evidence | Round-2 state: the ladder ended at a single-page dynamic pair (JS hydration + one click); multi-step ground open (the r2 note's own §7 blind spot); no per-step record shape, no browser-side action witness, one network surface, state class unreadable from shape text | 4-page loopback journey (index → detail → form → confirm) structured as per-step idle→action→result triplets: 6 captures × 2 cold runs byte-identical (compare.tsv 25 IDENTICAL / 3 expected DIFFER) + 2 preserved warm runs; navigation-history witness (`typed`/`link`/`form_submit` — browser-labeled, independent of the driver); state class parsed from raw DOMSnapshot columns (hollow `{index,value}` encoding, `-1` empty sentinel — shape text carries no live values); both network surfaces kept — wire 304 vs client 200 measured on both sides; 7 journey rules folded into the SKILL envelope | Scribe re-runs 2026-10-14, all held: methodology shas re-hashed from `/tmp/tabi-r3-1-journey/` (journey.mjs `b52074a33876`, driver.sh `9509c07f49f9`, compare.mjs `ecce1c73dc56` + 6 fixture files); run1 step PNGs re-hashed = the note's §2 pins; compare.tsv verdicts re-counted 25/3; ports 19421/19422 closed, no chromium/`http.server` survivors |
| 3 | calibration — approval table finalized | Round-2 state: the authority table covered daemon start/stop only; the six interaction classes (operator's own sites, third-party read-only, third-party consequential, login-required, rate-limited, loopback) unmapped; rate/rights existed only as "do not assert an unmeasured surface" | Every class mapped to autonomous-now / operator-asleep-blocked / operator-approval-required (two tenses, one gate) / never-lane-executed, each with rights·rate·consequence, an unblock gate and a falsifier; A1–A12 adjacent gates (daemon start/stop/`/status`, trusted-input `cdp` escape hatch, tab borrowing, version mismatch, iframes, Windows request bodies, tab closing); never-set (consequential external acts, session-material content-reads, out-of-province work); SKILL.md's distilled table reconciled bin-for-bin; dispositions exercised under the asleep anti-claim — only C1 executed this round | `grep -c '^| \*\*C'` → 6 and `grep -c '^| \*\*A'` → 12 (re-ran by scribe 2026-10-14); the executor test ran under C1's authority and honored the C3/external block from SKILL.md alone; the standing Brave reject re-ran → agree; live daemon read matches the recorded A1/A2/A4 state (pid 3934817, still listening, operator stop owed) |
| 4 | coverage | round-3 state | network-evidence rung + async-step + hygiene sweep (webbridge daemon found OOM-dead — environment event recorded, operator return-to-baseline still owed) | wave-4 32-lane; AUD-TAB1 |
| 5 | freshness | round-4 state | four-clause claim: evidence archived w/ manifest-pin equality, 4 lesson files with Gates, pins re-derived later-date, approval packet filed + one l0-questions line | wave-5 32-lane |
| 6 | freshness + calibration | round-5 state | external-class fixture v2 (loopback) | wave-6 32-lane (2 lanes rerouted alibaba->hyper) |
| 7 | calibration + freshness | round-6 state | layer-routing synthesis (claim-class->layer table) | wave-7 32-lane (3 rerouted alibaba->hyper) |
| 8 | depth | round-7 state | the stateful-fixture evidence (session/cookie-shaped state, multi-visit, non-idempotent steps) + an independent VER-B8-1 re-run appended (7/7 runs exact) | wave-8 32-lane (2 rerouted alibaba->hyper) |
| 9 | depth | round-8 state | the state-changing matrix (10 idempotency classes, replay contract, the token-state decision table) | wave-9 32-lane (2 rerouted alibaba->hyper) |
| 10 | calibration | round-9 state | the arc synthesis (the ladder as built, the loopback-only perimeter) | wave-10 32-lane (1 rerouted alibaba->hyper) |
| 11 | freshness | round-10 state | clause (c)'s final state (**in force** — the four-clause claim closes 3/4, unblock recipe carried); the final archive sweep (9 groups; tree 36 → 45 / 1,721 → 1,782 files / 10,720,052 B; `archive-receipt-r10.md` §8) + the §Pins block re-bound (`SKILL.md` §T2); the closeout (`closeout-r11.md`, admission admitted, VER-B11 verified) | wave-11 32-lane; B11-1 gate/closeout · B11-2 check · B11-3 sweep · B11-4 pins/skill · PACK-B completion pack · VER-B11 (no AUD-B11 seat observed) |

## Planned / retired

- **planned:** none — the training chain ends at round 11 (fleet counters:
  `494d32a` "training wave-10 closeout: round 10 — … **all lanes 9/10, one
  round remains**" → this is the last round; nothing here presumes a round
  12). The one time-blocked item — clause (c) of the round-5 four-clause
  claim — ends **in force** with its unblock recipe, handed off in
  `corpus/knowledge/closeout-r11.md` (O1 / §6) and
  `plans/completion-evidence.md`; the open-now set (O1–O16) and the residue
  (R1–R3) are enumerated there with closing surfaces.
- **retired:** none — no axis saturated, none a wrong fit.

## Interactive continuation — fleet round-1 attempt (2026-10-15)

This supersedes only the historical "planned: none / chain ends" wording:
the current operator authorizes continuation, not retirement or re-numbering
of historical rounds 1–11. Baseline:
`c24eaea14dfc0c4a3848742d31673db5675f9183`. At session entry, the new fleet
round-1 work was uncommitted; launch counter 1 is not a verified-round count.
The inherited nine-seat dispatch cannot satisfy the new 32-seat contract.

**Current primary axis: freshness**, unique lowest last-measured score 3.
All historical scores remain as-of their original measurements; the inherited
lesson's conditional 3→4 rubric is not enacted as a round admission.

| Axis | Verdict for landed local evidence, not round admission | Before → candidate / evidence |
|---|---|---|
| depth | unchanged | Existing domain notes remain baseline-identical; no new technical surface asserted by a pin check. |
| coverage | unchanged | Same 23 knowledge notes and seven audit reports; review/witness artifacts are not new domain coverage. |
| operability | unchanged | Added gate supports this freshness witness only; no new end-to-end browser capability claimed. |
| freshness | improved | Baseline 0 rows at the round-specific witness path → candidate 34/34 matched unique targets, 31 lane blobs + three public files, independently anchored and prefix-preserving. Candidate gate exit 0; commit-time predicate measured separately below. |
| calibration | unchanged | Limits/dispatch errata explicitly retained; no outside quality assessment or promotion. |
| adjacency | unchanged | Global route and receipt prerequisites reported, not absorbed through host changes. |

| Trend | Verdict | Evidence boundary |
|---|---|---|
| expansion | unchanged | No new knowledge note or admitted domain frontier. |
| quality | improved | Bounded later-date pin re-verification; exact set and eight same-CLI behavioral cases. No semantic recertification. |
| discernment | unchanged | No outside non-author sample of both an admit and a reject. Dispatched predecessors remain this lane. |

Plan: `.ufo/plans/fleet-round-1-interactive-20261015.md`. Canonical validation:
32 distinct scopes, plan/render exits 0, zero task calls; evidence under
`.ufo/rounds/fleet-round-1-interactive-20261015/`. Current-contract round
admission is **blocked**, not improved/accepted by proxy. No new verified
completed-round credit; eleven historical training records preserved without
re-auditing them into the current contract. No saturation or lane retirement.

Concrete unblock: operator/integrator supplies the existing global taxonomy
bindings reviewer/scout→`@m_grok`, connector→`@m_antigravity` with
`@m_zfl` fallback (and content→`@m_composer` if content seats are used);
then authorized redispatch of the remaining actual fleet round 1 in a fresh
interactive session. Authentic applicable receipt bindings and outside
admit/reject review remain separate prerequisites. The next session must
re-measure, not re-spawn this L1 or assume a new round number from a launch.

### Post-commit measurement — same blocked attempt

Corrected carrying commit:
`c5e252083ede8ee87e3b498e486f0bc238f1d516`,
`tabi-shokunin <tabi@shokunin.local>`, epoch **1792041388** =
**2026-10-15T05:16:28Z** ≥ **1792022400**. Original witness
`716dc8ac8982c5b32518c052e6bf8a25f23b8ca2` is retained; its initial
gate revision is superseded for safety, not amended or used for handoff.

Counting command actually executed:
`git grep -h '^MATCH[[:space:]]' c5e252083ede8ee87e3b498e486f0bc238f1d516 -- corpus/evidence/fleet-round-1-freshness/pins.tsv`
→ 34 lines, 34 unique second-field identities, exit 0. The same command over
baseline `c24eaea14dfc0c4a3848742d31673db5675f9183` → no rows, exit 1.
Exact-set integrity is checked by the gate, not inferred from equal counts.

Full corrected verdict line:

```text
FRESHNESS_GATE verdict=clean finding=freshness_witness matched=34 unique=34 lane=31 public=3 revision=c5e252083ede8ee87e3b498e486f0bc238f1d516 baseline=c24eaea14dfc0c4a3848742d31673db5675f9183 profile=production
EXIT_CODE=0
```

`node scripts/check-freshness.mjs --self-test` →
`FRESHNESS_SELFTEST verdict=clean cases=12`, exit 0. The four added cases
prove public-target/table redirection and public-file/descriptor symlink
refusal using owned fixtures, not real host secrets. This supersedes the
earlier eight-case helper's shipping acceptance. Full stdout/stderr, exact
commands, gate/descriptor hashes and commit metadata:
`.ufo/rounds/fleet-round-1-interactive-20261015/gate-{selftest,worktree,witness}-safe.json`.

**Local clause (c): closed by the corrected dated committed witness.**
This supersedes only that carried time/pin debt, not real-site, daemon,
archive-completeness or outside-review debt. All six axis/trend verdicts above
remain bounded local assessments. **Round admission still blocked; verified
completed-round increment 0.** No scalar bump, native judgment, applicable
receipt or Sighting completion. Observed blocked attempts in this interactive
session: one; a historical consecutive-blocked streak is not established.

**Next actionable work:** authorized global role bindings plus authentic
receipt binding, then a fresh-session dispatch/admission of this actual
unfinished fleet round 1. Do not repeat this already-landed witness as a new
improvement, advance from a launch counter or declare saturation. No in-session
round loop or arbitrary round/time stop was used.

## Pstack continuation scores (2026-10-15)

Historical axis table above stays at its last explicit measurement. These rows are the continuation scores after each admitted pstack round. A round moves only the axis it names.

| After | depth | coverage | operability | freshness | calibration | adjacency |
|---|---|---|---|---|---|---|
| baseline `7f506affa55f6fb892d3c8073c75151c998bdf2c` | 7 | 5 | 5 | 3 | 6 | 5 |
| pstack-20261015-r01 | 7 | 5 | 5 | 4 | 6 | 5 |
| pstack-20261015-r02 | 7 | 5 | 5 | 5 | 6 | 5 |
| pstack-20261015-r03 | 7 | 5 | 5 | 5 | 6 | 6 |
| pstack-20261015-r04 | 7 | 6 | 5 | 5 | 6 | 6 |
| pstack-20261015-r05 | 7 | 6 | 5 | 6 | 6 | 6 |
| pstack-20261015-r06 | 7 | 6 | 6 | 6 | 6 | 6 |
| pstack-20261015-r07 | 7 | 6 | 6 | 6 | 6 | 7 |
| pstack-20261015-r08 | 7 | 6 | 6 | 6 | 7 | 7 |
| pstack-20261015-r09 | 7 | 7 | 6 | 6 | 7 | 7 |
| pstack-20261015-r10 | 7 | 7 | 6 | 7 | 7 | 7 |

Freshness 3→4 is the public-observation count below. The historical freshness cell stays 3. Freshness 4→5 is the two replay receipts in the r02 block.

<!-- pstack-round:pstack-20261015-r01
axis: freshness
before: 0
after: 1
command: git ls-tree -r --name-only f5c8f3141927ba0794ba5195d7f1a029ba6d7bd8 | grep pstack-20261015-r01/public/capture.json | wc -l
measured-against: f5c8f3141927ba0794ba5195d7f1a029ba6d7bd8
-->

<!-- pstack-round:pstack-20261015-r02
axis: freshness
before: 0
after: 2
command: git ls-tree -r --name-only 6a91f68af5ac5135b6b753c947b12c72e54794ef | grep pstack-20261015-r02/replay- | grep receipt.txt | wc -l
measured-against: 6a91f68af5ac5135b6b753c947b12c72e54794ef
-->

<!-- pstack-round:pstack-20261015-r03
axis: adjacency
before: 0
after: 4
command: git ls-tree -r --name-only a19c6a90a0fb0e00729fd895c3c136ac4305f877 | grep pstack-20261015-r03/boundary/ | grep '.txt' | wc -l
measured-against: a19c6a90a0fb0e00729fd895c3c136ac4305f877
-->

<!-- pstack-round:pstack-20261015-r04
axis: coverage
before: 0
after: 1
command: git ls-tree -r --name-only 3e3ba9e90d4bf04d5743652e72a9252f81877122 | grep corpus/knowledge/example-domain-observation.md | wc -l
measured-against: 3e3ba9e90d4bf04d5743652e72a9252f81877122
-->

<!-- pstack-round:pstack-20261015-r05
axis: freshness
before: 0
after: 1
command: git ls-tree -r --name-only 2e4cba06a07ff7f50a7aee6688644217eec64128 | grep pstack-20261015-r05/replay/receipt.txt | wc -l
measured-against: 2e4cba06a07ff7f50a7aee6688644217eec64128
-->

<!-- pstack-round:pstack-20261015-r06
axis: operability
before: 0
after: 1
command: git ls-tree -r --name-only ef51deddbb3c649ae3931f011757e3eb9d340ad9 | grep pstack-20261015-r06/operability/selftest-receipt.txt | wc -l
measured-against: ef51deddbb3c649ae3931f011757e3eb9d340ad9
-->

<!-- pstack-round:pstack-20261015-r07
axis: adjacency
before: 0
after: 1
command: git ls-tree -r --name-only ec5ee4bd51a35fe964fe63b73ab356c27530e464 | grep pstack-20261015-r07/boundary/refusal-receipt.txt | wc -l
measured-against: ec5ee4bd51a35fe964fe63b73ab356c27530e464
-->

<!-- pstack-round:pstack-20261015-r08
axis: calibration
before: 0
after: 1
command: git ls-tree -r --name-only 472bfc33de340035be5fa001f4e6685b79be4a64 | grep pstack-20261015-r08/calibration/pin-receipt.txt | wc -l
measured-against: 472bfc33de340035be5fa001f4e6685b79be4a64
-->

<!-- pstack-round:pstack-20261015-r09
axis: coverage
before: 0
after: 1
command: git ls-tree -r --name-only e3c5baea500090d3fd5c5fa0377eac10f2ee6fb2 | grep corpus/knowledge/loopback-pin-stability.md | wc -l
measured-against: e3c5baea500090d3fd5c5fa0377eac10f2ee6fb2
-->

<!-- pstack-round:pstack-20261015-r10
axis: freshness
before: 0
after: 1
command: git ls-tree -r --name-only 4e75a17ebbaa125777ed0d6e745fd150e9c6caf2 | grep pstack-20261015-r10/replay/receipt.txt | wc -l
measured-against: 4e75a17ebbaa125777ed0d6e745fd150e9c6caf2
-->

## User swarm continuation scores (2026-10-15)

The pstack continuation table above stays as landed. These rows are the continuation scores after each admitted `/user:swarm` round. A round moves only the axis it names.

| After | depth | coverage | operability | freshness | calibration | adjacency |
|---|---|---|---|---|---|---|
| pstack-20261015-r10 | 7 | 7 | 6 | 7 | 7 | 7 |
| user-20261015-r01 | 7 | 7 | 7 | 7 | 7 | 7 |
| user-20261015-r02 | 7 | 7 | 7 | 7 | 7 | 8 |
| user-20261015-r03 | 7 | 7 | 7 | 7 | 8 | 8 |
| user-20261015-r04 | 7 | 8 | 7 | 7 | 8 | 8 |
| user-20261015-r05 | 8 | 8 | 7 | 7 | 8 | 8 |
| user-20261015-r06 | 8 | 8 | 7 | 8 | 8 | 8 |

<!-- user-round:user-20261015-r01
axis: operability
before: 0
after: 1
command: git ls-tree -r --name-only 95ea5f8b98ae4cf8ee651bf46709570114f50edd | grep user-20261015-r01/operability/selftest-receipt.txt | wc -l
measured-against: 95ea5f8b98ae4cf8ee651bf46709570114f50edd
-->

<!-- user-round:user-20261015-r02
axis: adjacency
before: 0
after: 1
command: git ls-tree -r --name-only 59ba8da019400c1a3b14bc2c19746a457f791601 | grep user-20261015-r02/boundary/refusal-receipt.txt | wc -l
measured-against: 59ba8da019400c1a3b14bc2c19746a457f791601
-->


<!-- user-round:user-20261015-r03
axis: calibration
before: 0
after: 1
command: git ls-tree -r --name-only 8a869af00665e8e445bc84c50492433097c55866 | grep user-20261015-r03/calibration/pin-compare.txt | wc -l
measured-against: 8a869af00665e8e445bc84c50492433097c55866
-->

<!-- user-round:user-20261015-r04
axis: coverage
before: 0
after: 1
command: git ls-tree -r --name-only 982e3b2d53569fe3494d5f589384ce789ea52a20 | grep corpus/knowledge/user-public-observation.md | wc -l
measured-against: 982e3b2d53569fe3494d5f589384ce789ea52a20
-->

<!-- user-round:user-20261015-r05
axis: depth
before: 0
after: 1
command: git ls-tree -r --name-only c6fb0d5334e3011d3b73e323aafe6fc95a6a49c7 | grep user-20261015-r05/depth/paragraph-receipt.txt | wc -l
measured-against: c6fb0d5334e3011d3b73e323aafe6fc95a6a49c7
-->

<!-- user-round:user-20261015-r06
axis: freshness
before: 0
after: 1
command: git ls-tree -r --name-only 1229098dae56c2d193c01203ff93651da2853f6e | grep user-20261015-r06/freshness/replay-receipt.txt | wc -l
measured-against: 1229098dae56c2d193c01203ff93651da2853f6e
-->

## Capabilities

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| — none yet — | | | |

Rows enter only through a round that demonstrates the capability running (`AXES.md` §Capabilities); none enter through this rollout.

## Saturation

The lane's saturation line + stagnation window N are to be declared by the lane on its next round per `AXES.md` §The stagnation nudge; not asserted by this conformance change.

## Kaika fleet round-1 (2026-10-19)

Steered round `1` (fleet-ledger `.ufo/waves/kaika/steer.md:32`) — distinct from training
round 1 (2026-10-14) and from the blocked, unadmitted 2026-10-15 fleet round-1 attempt
above. Base `40a6de87f72b78d90ea627ad89717e55f219001e`; work commit
`a4115fafce511b7f140ea176bcd0807ebf141fc6`. Pre-action: `user-20261015-r07` recorded as
executed, unadmitted, no credit (`LOG.md` kaika entry). Scores below are the lane's
self-verdicts, **pending non-author verification** (orchestrator spot-check of ≥1 admit,
≥1 reject, ≥3 SOURCES rows re-opened, every command re-run).

| After | depth | coverage | operability | freshness | calibration | adjacency |
|---|---|---|---|---|---|---|
| user-20261015-r06 (start) | 8 | 8 | 7 | 8 | 8 | 8 |
| kaika-fleet-round-1 (claimed) | 8 | 9 | 8 | 8 | 9 | 8 |

| Claim | Axis / type | Before → after (measured) | Counting command | Measured against |
|---|---|---|---|---|
| C1 | operability 7→8 (lowest axis) | gate absent, receipt 0 → `SOURCES_SELFTEST verdict=clean cases=25`, receipt 1 | `git ls-tree -r --name-only <rev> \| grep -c '^corpus/evidence/kaika-fleet-round-1/operability/selftest-receipt.txt$'`; `node scripts/check-sources.mjs --self-test \| tail -1` | `40a6de87f` → `a4115fa` |
| C2 | coverage 8→9 + capability `sources-registry` | notes opening `source: S###` 0 → 3; SOURCES rows 0 → 27 (A21 B4 C2; mined 19 queued 6 rejected 2), contract census clean | `git grep -l '^source: S[0-9]\{3,\}' <rev> -- corpus/knowledge \| wc -l`; contract census, receipt `corpus/evidence/kaika-fleet-round-1/sources/census-receipt.txt` | `40a6de87f` → `a4115fa` |
| C3 | calibration 8→9 | self-description drift 17 → 0 (unmapped notes 15→0, executed waves absent from LOG 1→0, training rounds without a lesson 1→0); QUALITY criteria citing the mined lesson 0 → 7 | `LC_ALL=C comm -23 <(git ls-tree --name-only <rev> corpus/knowledge/ \| xargs -n1 basename \| sort) <(git show <rev>:corpus/README.md \| grep -o 'knowledge/[a-z0-9-]*\.md' \| sed 's\|knowledge/\|\|' \| sort -u) \| wc -l`; `for id in $(git ls-tree -d --name-only <rev> corpus/evidence/ \| xargs -n1 basename \| grep -E '^(user-2\|pstack-2.*-r)'); do git show <rev>:LOG.md \| grep -qF "$id" \|\| echo $id; done \| wc -l`; `for n in $(seq 1 11); do git ls-tree --name-only <rev> corpus/lessons/ \| xargs -n1 basename \| grep -qE "^(training-)?round-$n\.md$" \|\| echo $n; done \| wc -l`; `git show <rev>:corpus/QUALITY.md \| grep -c 'kaika-fleet-round-1.md#mistakes'` | `40a6de87f` → `a4115fa` |

No-harm readings at `a4115fa` (worktree = commit): `FRESHNESS_GATE verdict=clean
matched=34 unique=34` (unchanged); `ROUND_CONTRACT verdict=clean rounds=10` (unchanged);
`USER_ROUND_CONTRACT verdict=failed finding=round_count` (6 of 10 user rounds — red at
base already, same finding; not this round's defect); all three existing self-tests clean
(12/4/4). Depth, freshness and adjacency make no claim and stay 8. In-round critic dissent
on C3 (a mention-count can be gamed; reads as reconciliation, not calibration) is recorded
in the round report with the content spot-check that answers it; the operator rules.

### Capabilities — kaika fleet round-1

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| sources-registry | Curate where tabi learns: opened, scope-tiered rows with study paths, a search log and kept rejections, checked by the frozen contract census | `corpus/SOURCES.md`; `corpus/evidence/kaika-fleet-round-1/sources/census-receipt.txt` (27 rows, malformed 0, no duplicate/enum/missing findings) | kaika-fleet-round-1 |

### Saturation — declared kaika fleet round-1

Saturation line **8**; stagnation window **N = 3** rounds. Every axis sits at 7–8 and
operability was the lone 7; at line 8 the nudge fires only after all six axes reach 8
and three consecutive rounds pass with no new capability row. `sources-registry`
entered this round, so the window restarts here.

### Planned / retired — kaika fleet round-1

- planned: freshness 8→9 — dated `recheck:` lines on every knowledge note, 5 → 29
  (`grep -l '^recheck:' corpus/knowledge/*.md | wc -l`), each with a date or cadence and a procedure.
- planned: coverage 9→10 — Playwright accessible locators / ARIA snapshots entry mined
  from S023–S025 (`git ls-tree -r --name-only HEAD | grep -c corpus/knowledge/playwright-accessible-locators-and-snapshots.md` 0 → 1).
- planned: calibration — first measured loopback rate boundary (token bucket → 429 +
  `Retry-After`) replacing the asserted absence behind approval class C6
  (`grep -rl 'token-bucket' corpus/knowledge/ | wc -l` 0 → 1).
- retired: none — no axis saturated past usefulness, none a wrong fit.

### Post-review corrections — kaika fleet round-1 (2026-10-19; append-only)

- **C3 note-map command, corrected.** The command in the claim table runs `comm` on
  input sorted under the session locale, so under `en_US.UTF-8` it prints `comm: file 1
  is not in sorted order`. Corrected form, with the whole sort+comm pipeline under C:
  `( export LC_ALL=C; comm -23 <(git ls-tree --name-only <rev> corpus/knowledge/ | xargs -n1 basename | sort) <(git show <rev>:corpus/README.md | grep -o 'knowledge/[a-z0-9-]*\.md' | sed 's|knowledge/||' | sort -u) | wc -l )`
  → **15** at `40a6de87f`, **0** at `a4115fa`, no warnings. The C3 drift total stays 17 → 0.
- **C1 gate, corrected.** Row validation scoped to `## Registry`; self-test **26** cases
  clean (was 25); the C1 counting command is unchanged.
- **SHONEN.** All four boxes `[~]` (the former `[x]` verifiers were lane-dispatched); the
  lane's `ROUND_CONTRACT` gate pins `SHONEN.md` and reads red after this change, by order.

## Round 12 — hyaku, 2026-10-20

Current baseline is the kaika row admitted by the outside
`corpus/lessons/round-1-verifier-spotcheck.md:17`; older training/user tables remain
historical. This block supersedes their current-state interpretation, not their bytes.
Lowest non-retired tied axes: depth, operability, freshness, adjacency (8).
C1 works freshness; no stagnation waiver is used.

The frozen wave initially proposed freshness8→9 and coverage9→10. Critic
`w1/CoverageAttack.txt` correctly rejected treating an added note as a full expertise
fraction. Those increments are withdrawn: **scalar delta0** on both axes. The falsifiable
improvements below are the actual work, not an inferred domain-mastery percentage.

| Axis | Before → after scalar | Round-12 verdict / evidence |
|---|---|---|
| depth | 8→8 | unchanged; no runtime or new protocol-support claim |
| coverage | 9→9 | improved documentary coverage: accessible-selector entry0→1, counted with provenance, mined sources, index and lesson admission, not mere file existence |
| operability | 8→8 | unchanged claimed axis; source gate26 clean cases and live census clean; bounded mistake witness9/9 runs, no old-gate baseline weakened |
| freshness | 8→8 | improved bounded source re-verification:0→3 exact target reviews, including two corrected/qualified discrepancies rather than demanding confirmation-only results |
| calibration | 9→9 | unchanged claimed axis; overreach rejected, no outside verification impersonated; criteria14/15 linked to the round lesson |
| adjacency | 8→8 | unchanged; publishing, credentials and forensic boundaries retained |

| Claim | Before → after | Counting command | Measured revisions / evidence |
|---|---|---|---|
| C1 freshness |0→3 bounded source-claim rechecks: profile, WD BiDi mappings, Playwright retries;2 discrepancy dispositions,1 confirmed family. Original/current note digests pinned. S018/S019 and local runtime excluded | `node .ufo/waves/round-12/measure.mjs REV` | `f032f2dccc8a99632eea52edafa8220284b5c919` → `0d82098e8151ac8c1f58f55716b9f6569bd1844a`; `corpus/evidence/round-12/measurements.json`, `source-recheck.json` |
| C2 coverage |0→1 docs-held accessible locator/ARIA template entry; no capability acquisition or perfect-coverage claim | `node .ufo/waves/round-12/measure.mjs REV` | same revisions; `corpus/knowledge/playwright-accessible-locators-and-snapshots.md`; S023/S024/S025 mined and indexed |

Both commands exited0 at both named revisions. The same script restricts C1 to three
distinct named note paths, requires matching committed digests and resolvable review
reports, and counts confirmed/drift/unknown records with dispositions. C2 additionally
requires provenance fields, each source mined/used-by, an index row and explicit lesson
admission. It is a counting probe, not a machine proof of source truth; claim-versus-text
evidence is the linked source dossier and author-side review reports.

The earlier plan to add `recheck:` lines5→29 is **not completed or credited**. Its mechanism
was replaced before dispatch by bounded substantive source-claim rechecks; no historical
note date is silently refreshed. Two notes receive append-only corrections, while the
new dossier records a false critic correction rejected by opening the source.

### Sources, frontier and judgment

Rows28→28 (A22/B4/C2 unchanged), mined20→23, queued6→3, rejected2→2. S023/S024/S025
queued→mined; used-by changes and opened-date preservation are logged in
`corpus/lessons/round-12.md`. Census start/end exit0; live sources gate clean.
Accessible-selector ground becomes docs-held. Five frontier areas stay open:
extension↔daemon handshake, native WebMCP probe, real-site rate/rights records,
real-site journeys, WebMCP spec mining. Expansion improved; quality improved by correcting
the factory conflation and qualifying rolling docs; discernment unchanged pending fresh
outside admit/reject verification. Author-side wave reviewers are not non-author verifiers.

Legacy gate debt is not hidden: SHONEN regeneration at5cdc976 causes historical
`history_rewritten`; the required new round-12 lesson also hits the old user gate's
overbroad round-N guard. No gate exception, HARD_BASELINE move, PSTACK_PIN move, or
SHONEN rollback was made. Full analysis: `.ufo/waves/round-12/w1/GateDebt.txt` and
`ProtectedMap.txt`. No current legacy-gate pass is claimed. Admission remains subject
to the orchestrator's independent closure, including this named debt.

### Planned / capabilities / retired

- planned: freshness — a fixture-covered policy repair for legacy gates that distinguishes
  frozen historical round files from future protocol-required lessons and canonical
  SHONEN regeneration, without rewriting historical measures.
- planned: coverage — demonstrate the documentation-held locator/template contract on an
  isolated loopback browser with pinned runtime, template and actual output.
- capabilities: no new repertoire row; Playwright runtime was not exercised.
- retired: none. Saturation line8 and window3 retained; this round does not use the nudge.

## Round 13 — hyaku, 2026-10-20

Baseline `75e7836b6c3090180aee2754e20a5d3cfb186e74`; measured evidence revision
`837b33a3988ebeea7f6b4ef5c04698da88909a73`; final counting-probe revision
`b6d67c1` (full hash in `corpus/evidence/round-13/measurements.json`).
The prior planned legacy repair is worked as **operability**, not freshness:
the new evidence is runnable, fixture-covered compatibility policy. Operability8
is a lowest non-retired tie, so no stagnation waiver is used.

| Axis | Scalar before → after | Round-13 self-verdict and evidence |
|---|---|---|
| depth | 8→8 | unchanged; no broad protocol/browser-support certification |
| coverage | 9→9 | improved narrowly: actual isolated locator/template experiment0→1 on previously docs-only ground |
| operability | 8→8 | improved bounded policy coverage0→2; restoring compatibility is not two newly clean full gates |
| freshness | 8→8 | unchanged claimed axis; source precision chores have no extra score credit; freshness --worktree34/34 clean |
| calibration | 9→9 | unchanged claimed axis; failures/disagreements, old USER redness and author/non-author boundaries retained |
| adjacency | 8→8 | unchanged; own lane scripts/browser fixture only, publishing/secrets/forensic/general-test-tooling boundaries retained |

| Claim | Falsifiable before → after | Counting command | Measured commits / evidence |
|---|---|---|---|
| C1 operability | newly fixture-covered compatibility policies0→2; USER remains honest failed round_count6/10, not false green | `node .ufo/waves/round-13/measure.mjs REV --claim C1` | baseline75e7836→evidence837b33a, both exit0; `gates.json`, `measurements.json` under `corpus/evidence/round-13/` |
| C2 coverage + capability | real isolated accessible-selector/template demonstration0→1; eight actual cases/four real expected rejections, indexed/sourced/admitted note | `node .ufo/waves/round-13/measure.mjs REV --claim C2` | same before/after revisions, final probe atb6d67c1, both exit0; runtime executed at06e6ada; `aria/receipt.json`, `aria-execution-pass.json`, `measurements.json` |

Claims are separable: each `--claim` mode reads only its own evidence; a malformed
C1 receipt does not veto C2 and vice versa. The two gates are intentionally coupled
inside C1 through an exact script-cutover digest, not falsely described as two
independent capabilities. Count0→2 describes newly covered policy, not new expertise
points. Every ordinal delta is0 and independent closure remains owed.

Gate evidence: ROUND self-test26 cases plus alias control; USER21 cases, clean.
Each pinned legacy witness uses the same fixture/legacy-compatible arguments:
old1 history_rewritten→new0 clean. Production ROUND clean10; production USER1
round_count6/10. HARD_BASELINE/PSTACK_PIN and the census do not move. Broader inherited
shell-count, survivor-replay/user-record, IPv6-origin and validator-pin debt is not
cleared. Initial fixture/runtime/counter failures remain committed, with actual
causes and targeted repairs in LOG's round-13 entry and the round lesson.

Sources28→28 (A22/B4/C2; mined23/queued3/rejected2 unchanged), added tiersA0/B0/C0.
S023/S024/S025 used-by gains the new runtime note only; exact old→new transitions
are in the lesson. Census start/end exit0. Source self-test26 clean and live source
gate clean28. Revision-based histogram command:
`node .ufo/waves/round-13/measure.mjs REV --histogram`; both revisions exit0.
Note-map32 notes/32 mapped/no missing at837b33a, via the committed measurement's
exact note-map command/output. No historical verification date is silently renewed.

### Capabilities — round 13

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| aria-locator-template-loopback | Demonstrate role/name/label selection, strictness, re-resolution, actual ARIA capture and contain/equal/checked constraints on one isolated fixture using Playwright1.64.0 and managed Chrome for Testing156.0.8078.4 | `node scripts/aria-loopback-round13.mjs`; `corpus/evidence/round-13/aria-execution-pass.json`; exact templates/actuals/cleanup in `aria/receipt.json` within that evidence directory; `corpus/knowledge/aria-loopback-round-13.md` | 13 |

This capability is not an audit, pixel/real-site/cross-browser/determinism claim.
Expansion improved; quality improved; discernment improved by turning the prior
outside gate disagreement into QUALITY16, with new runtime lessons in QUALITY17.
Current-round non-author admit/reject spot-check remains pending; no seat is
misrepresented as outside verification and SHONEN stays four asserted[~].

### Planned / saturation / retired — round 13

- planned: operability — fixture-covered removal of inherited shell execution from
  the legacy counting path, without changing historical measurement semantics.
- planned: coverage — one explicitly unheld browser surface, only through its
  own source-scoped/runtime-scoped evidence rather than more scalar inflation.
- saturation line8 and window3 retained; the demonstrated capability restarts
  the stagnation window at round13. No axis retired or silently waived.

## Round 14 — hyaku, 2026-10-20

Baseline `bebe2efc4565bb068efd905e9ef78011bb6b4efd`. Two declared distinct-axis
claims, no exploratory claim and no new browser execution. C1 works operability8,
a lowest non-retired tie; the stagnation waiver is not used. The initially
planned coverage item is carried forward, not silently claimed completed:
outside cleanup/counting defects take this round's bounded work instead.

| Axis | Scalar before → after | Round14 verdict / evidence |
|---|---|---|
| depth | 8→8 | unchanged; exact grammar/metadata precision, not broad browser mastery |
| coverage | 9→9 | unchanged;32 notes/32 mapped, no new knowledge ground or browser capability |
| operability | 8→8 | improved C1; two SCORECARD count paths become non-shell with real supported/refusal/differential controls |
| freshness | 8→8 | unchanged; worktree freshness34/34 clean, historical runtime pins/dates preserved |
| calibration | 9→9 | improved C2; checked qualified metadata correction0→1, original contradiction retained as red |
| adjacency | 8→8 | unchanged; own browser evidence/legacy lane gates, no security/testing domain absorption or external interaction |

| Claim | Falsifiable before → after | Counting command | Measured revisions / evidence |
|---|---|---|---|
| C1 operability | newly verified non-shell historical counters0→2; no full-USER-production-green claim | `node .ufo/waves/round-14/measure.mjs REV --claim C1` | `bebe2efc4565bb068efd905e9ef78011bb6b4efd`→`6be099015ca347eab36c62f30551eab919c2ce5c`, both exit0; gates/code receipts atf942c62; `corpus/evidence/round-14/measurements.json` |
| C2 calibration | qualified original receipt/pin correction pairs0→1, not another runtime experiment | `node .ufo/waves/round-14/measure.mjs REV --claim C2` | same baseline→`0c5567e8a2b57fc64d5526f830941e2304cd2c35`, both exit0; checker executed ate570380; `aria-metadata/verification.json`, `measure-c2-final.json` under round14 evidence |

Final counter revision `0c5567e8a2b57fc64d5526f830941e2304cd2c35`, SHA256
`22b6f5e5fa585555923971a0f56c640a2d38ae2d797aa84e4f9cae288cf7cab1`.
C2 output grammar changed after the first C1 measurement, but C1 counting/control
logic is unchanged. Exact argv/stdout/stderr/exit records, probe revision and
all initial failures are committed in the measurement dossier. C1/C2 are
separable; their --claim modes read disjoint receipts, and C2's initial parser
failure did not negate the observed C1=2.

ROUND selftest32 fixture cases+alias, USER29 fixtures+alias+six committed-row
count controls+count-witness differential all passed. Both shell witnesses use
one command/tree: pinned old clean0 with marker→new score_mismatch1/no marker.
Both prior history-policy witnesses pass separately. ROUND production clean10;
USER production remains failed round_count6/10 before its counting step.
Supported historical tree-path/content count values are preserved; missing
Git revisions now explicitly fail instead of legacy wc-masked0. Git config,
PATH/environment/hooks/alias trust and the external validator remain uncredited,
as do r07 survivor replay/user-record freezing/IPv6 classification debt.

C2 selftest16 clean; original --check exits1 only
R14-ARIA-CLEANUP-LISTENING-AFTER-01; corrected --check exits0 with27 findings/
zero failures; --witness exits0 red→clean/original_unchanged=true. The correction
is sourced by mined own-work S029 and pins unchanged historical receipt/pin/
worker/spec/config/manifest/producer. Node observed26.12.0, descriptive24.21.0,
minimum20, exactMatch=false. Original producer/note were restored before commit
to preserve the round13 source/note bindings; no future-producer repair is claimed.

Sources28→29 (A22→23/B4/C2), mined23→24/queued3/rejected2. S029 is new own-work,
not newly covered domain ground. No pre-existing row mutable/immutable cells
change; S029's uncommitted cadence/used-by corrections are logged in lesson.
Census start/end exit0, source selftest26/live29 clean. Histogram/note-map
command `node .ufo/waves/round-14/measure.mjs REV --histogram` measured baseline
and `4a300f676e4f9731402d85f409895fb1123aee4a`, both exit0; map32/32/no missing.

Trend self-verdicts: expansion unchanged; quality improved through checked held-
evidence qualification and safer runnable count paths; discernment improved by
learning prior non-author defects into QUALITY18/19. Current outside admit/reject
agreement remains pending; no lane-dispatched seat is a non-author verifier.

### Planned / capabilities / saturation / retired — round14

- planned: operability — bounded inherited survivor-replay/user-record evidence
  debt, without relaxing expected rounds or claiming hostile-repository safety.
- planned: coverage — carry forward one explicitly unheld browser frontier
  surface through its own source/runtime evidence, not another metadata count.
- capabilities: unchanged; aria-locator-template-loopback remains first-working13.
- saturation8/window3 unchanged; round14 is position1 since that round13 capability,
  not a restarted window. No axis retired, no hidden waiver, all scalar deltas0.

## Round 15 — hyaku, 2026-10-20

Baseline `7054a5e1068538349b4dbb0d291c2fe8643802f2`. C1 works
operability8, a lowest non-retired tie; no stagnation waiver. Two distinct,
causally separable claims; no exploratory/new coverage/capability claim.
The earlier planned survivor/user-record and browser-frontier items remain
open; outside diagnostic/mirror findings motivated this round instead.

| Axis | Scalar before → after | Round15 verdict / evidence |
|---|---|---|
| depth | 8→8 | unchanged; precision of held contracts, not broader domain mastery |
| coverage | 9→9 | unchanged; knowledge/map32/32, no new knowledge or frontier |
| operability | 8→8 | improved C1; one actual USER reason/applicability contract0→1, production still6/10 failed |
| freshness | 8→8 | unchanged; no original runtime date/source byte renewed |
| calibration | 9→9 | improved C2; one enforced cleanup/qualification and canonical snapshot-classification contract0→1 |
| adjacency | 8→8 | unchanged; browser evidence/own-lane counters only, external domains remain refused |

| Claim | Before → after | Counting command | Measured revision / evidence |
|---|---|---|---|
| C1 operability | verified diagnostic contracts0→1 | `node .ufo/waves/round-15/measure.mjs REV --claim C1` | baseline above→`b7cf0446a31014a81b4882857c90c565ebc14210`, both exit0; `corpus/evidence/round-15/count-before-c1.json`, `count-after-c1.json`; probe code27dfd98 |
| C2 calibration | enforced canonical metadata contracts0→1 | `node .ufo/waves/round-15/measure.mjs REV --claim C2` | same baseline→b7cf0446a31014a81b4882857c90c565ebc14210, both final exit0; `count-before-c2.json`, `count-after-c2-repaired.json`; probe code `9fd8bca99d60cc1612faeeac633e1436d231bde3` |

`corpus/evidence/round-15/measurements.json` carries literal argv, outputs,
exits and both counter identities. C1/C2 read disjoint receipts. Repaired
gate code executed at `27dfd98bd6bbd85fe77fb028d531691ce066031a`;
the gates are byte-identical at measuredb7cf044. C2's initial consumer-only
failure is retained in `count-after-c2.json`, not relabeled passing. Its
repair changes actual-status/token parsing only; no successful gate or
browser/selftest was rerun to manufacture the final count.

USER selftest42 aggregate records =32 fixtures+alias+six committed counts+
count witness+diagnostic witness+reason control; eight exact-cause assertions
span six reasons. Metadata selftest36 CLI+4 helpers; nine actual old-accept0→
new-refuse1 single-field mirror differentials; same spec alteration old1
SOURCE failure→new2 snapshot_tampered/could_not_evaluate, with both authentic
controls accepted and originals unchanged. Direct corrected check0, original
semantic contradiction1, metadata witness0. These are not new browser runs.
Final committed docs production: ROUND clean10 exit0; USER failed6/10 exit1.

Canonical authenticated file scope is explicit: arbitrary noncanonical
receipt/pin paths, unchecked known/advisory labels, complete sidecar-byte
authentication, worker-directory set drift and digest/read races stay
uncredited. Git environment/hooks/config/PATH, survivor replay/user-record,
IPv6 and external-validator debt remain open. Shared raw-data derivation
is distinct from independent literal fixture/aggregate expectations.

Sources29→29, A23/B4/C2, mined24/queued3/rejected2. Census start/end exit0;
only S029 used-by gains the round15 lesson. Histogram command
`node .ufo/waves/round-15/measure.mjs REV --histogram`, baseline→b7cf044,
both exit0;32 knowledge notes/32 mapped/no missing. No source-row inflation
is called expansion.

Round14's outside admit/reject agreement is now committed at7054a5e;
its earlier author-time pending wording remains historical. The Node
source correction distinguishes the launcher's runtime.pinned summary
from the executed spec's minimum assertion; same recorded observation,
not independent runtime corroboration. Main owns the non-author erratum.
Current outside round15 agreement remains external; SHONEN four[~].

Trends: expansion unchanged; quality improved by verified held-contract
repairs; discernment improved through lesson-backed QUALITY20/21 and
source-layer correction, not author-side certification.

### Planned / capabilities / saturation / retired — round15

- planned on operator resumption: bounded survivor/user-record evidence
  debt and one unheld browser frontier surface, without relaxing expected10.
- capabilities unchanged; first-working aria capability stays round13.
- saturation8/window3; position2 after round13, no retirement or hidden waiver.
- operator wrapped this run after both waves completed; no later round started.

## Round 16 — hyaku, 2026-10-20

Baseline `e38d2599a922cb729186353830fff8e159b4fef0`; measured revision
`3254740c694e4fc7851ca9d88b39230db3042ba6`. C1 works operability 8, a lowest non-retired
tie (depth/operability/freshness/adjacency at 8). Round 16 is position 3 of the window
since the round-13 capability; the waiver would apply under the position reading, but C1
satisfies the lowest-axis rule regardless. C2 is a capability acquisition.

| Axis | Scalar before → after | Round16 verdict / evidence |
|---|---|---|
| depth | 8→8 | unchanged |
| coverage | 9→9 | improved C2: native-WebMCP held entry 0→1 (one build, loopback, flags); 10 withheld (r12/r13 precedent, real-site ground open) |
| operability | 8→8 | improved C1: enforced measurement-binding contract 0→1; 9 withheld (USER 6/10 red, no outside execution) |
| freshness | 8→8 | unchanged; S020 re-opened (revision drift logged, anchor kept) |
| calibration | 9→9 | unchanged claimed axis; QUALITY 22–25 lesson-backed |
| adjacency | 8→8 | unchanged; kaidoku CDP-runtime overlap reported as contested |

| Claim | Before → after | Counting command | Measured revision / counter digest / evidence |
|---|---|---|---|
| C1 operability | 0→1 | `node .ufo/waves/round-16/measure.mjs REV --claim C1` | e38d259 → 3254740; counter sha256 `c8b4100a9f60dcd530ae752074e04d05074b4938cc05c6f19214add05e2594cb`; `corpus/evidence/round-16/measurements.json` |
| C2 coverage | 0→1 | `node .ufo/waves/round-16/measure.mjs REV --claim C2` | same revisions and counter digest; receipt `corpus/evidence/round-16/webmcp/receipt.json` |

Binding: `node scripts/check-measurement-binding.mjs --check
corpus/evidence/round-16/measurement-binding.json --at <delivered HEAD> --reproduce`
must exit 0 `claims=2 bound=2` (closes round-15 routed defects 1/2). Earlier after-counts
with earlier counter blobs (C2 0 at `8f7feb3`) are history, not this measurement.

Sources 29→40 (A31/B4/C5; mined33/queued2/rejected5); census validate exit 0 at start
and end; knowledge notes 32→33.

### Capabilities — round 16

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| webmcp-cdp-observation | Observe page-registered WebMCP tools (declarative and imperative) on flag-enabled Chromium 154 over CDP on loopback fixtures, with flag-off/domain-off controls and a per-run browser pid/argv | `node scripts/webmcp-loopback-round16.mjs --out /tmp/x.json`; `corpus/evidence/round-16/webmcp/receipt.json` (11/11) | round16 |

### Planned / saturation / retired — round16

- planned: freshness — re-verify S001–S019 90d/on-release rows due; operability — bring
  USER 6/10 or rule it out of scope with the operator; adjacency — integrator ruling on the
  kaidoku CDP-runtime overlap.
- saturation 8 / window 3; the round-16 capability restarts the window (round 17 = position 1).
- retired: none.

## Round 17 — hyaku, 2026-10-20

Baseline `5859243183c4d7ac5429dfdb8a73ce0d9a43d583`; measured revision
`93bfead1f5f25f584353df3152a60209bbd89a2e`. C1 works operability 8 and C3 adjacency 8 (lowest
non-retired tie with depth/freshness); C2 is coverage 9 + a capability acquisition. Round 17 is
position 1 of the window after the round-16 capability; no waiver used.

| Axis | Scalar before → after | Round17 verdict / evidence |
|---|---|---|
| depth | 8→8 | unchanged |
| coverage | 9→9 | improved C2: held WebMCP-invocation entries 0→1 (one build, loopback, flags, fixture-owned tools); 10 withheld (real-site, agent-side, Chromium 152, default profile open) |
| operability | 8→8 | improved C1: jj-anchor-safe behaviour-bearing gate entries 0→4 (all 4 of the behaviour-bearing entries; 4 label-only witness entries anchor-correct, not credited; 8 total); 9 withheld: USER 6/10 red, no outside execution, a re-anchor is not a new runnable rung |
| freshness | 8→8 | unchanged (S032 re-opened unchanged) |
| calibration | 9→9 | unchanged claimed axis; QUALITY 26–32 lesson-backed |
| adjacency | 8→8 | improved C3: verified sibling-overlap dispositions 0→10 (ruled 1 by the integrator, contested-open 4 on tabi-filed L0 lines, split-declared 2, refused-route 3); 9 withheld: 1 of 10 arbitrated, no outside execution |

| Claim | Before → after | Counting command | Measured revision / counter sha256 / evidence |
|---|---|---|---|
| C1 operability | 0→4 | `node .ufo/waves/round-17/measure-c1.mjs REV` (`c1_anchor_safe`) | 5859243 → 93bfead; `1bb9804acd6b1a52eb356efdb325c7eb835eb7ecc610357944bcfd30bd87f4d2`; `corpus/evidence/round-17/measurements.json` |
| C2 coverage | 0→1 | `node .ufo/waves/round-17/measure-c2.mjs REV` (`c2_invocation_held`) | same revisions; `079dcc3924d36b34e56996efe694d35e474455489d611812a78615f3821fc3e1`; receipt `corpus/evidence/round-17/webmcp-invoke/receipt.json` |
| C3 adjacency | 0→10 | `node .ufo/waves/round-17/measure-c3.mjs REV` (`c3_adjacency_verified`) | same revisions; `372c9658df761f3a640ded2b69b575f1167330bc362df8a63396977c40f66bc1`; `corpus/adjacency.tsv` |

Binding: `node scripts/check-measurement-binding.mjs --check
corpus/evidence/round-17/measurement-binding.json --at <landed tip> --reproduce` → exit 0
`claims=3 bound=3` (receipt committed at round end). Sources 40→57 (A46/B4/C7;
mined42/queued8/rejected7); census validate exit 0 at start and end; knowledge notes 33→34.

### Capabilities — round 17

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| webmcp-cdp-invocation | Invoke page-registered WebMCP tools (imperative and declarative, fixture-owned) over CDP `WebMCP.invokeTool`/`cancelInvocation` on flag-enabled Chromium 154 loopback, recording raw frames, a loopback ledger of what `execute` received, controls and per-run pid/argv; harness-driven, not agent-side | `node scripts/webmcp-invoke-round17.mjs --out /tmp/x.json`; `corpus/evidence/round-17/webmcp-invoke/receipt.json` (11/11 + 4 controls) | round17 (round-16 probes invoked tools without a receipt) |

### Planned / saturation / retired — round17

- planned: operability 9 needs USER green or an L0 out-of-scope ruling, a non-author run of the
  gates at the landed tip, and a new runnable rung; adjacency 9 needs kaidoku citing tabi on its
  CDP row, the musketeer lease ruled, and a non-author run of the map checker. Also: harness
  hardening debt (DevTools port, SIGTERM, downloads, merged feature switches), self-test cases
  for the mutation survivors (no `--no-recurse`, status 128, env inheritance, per-call tip).
- saturation 8 / window 3; the round-17 capability restarts the window (round 18 = position 1).
- retired: none.

## Round 18 — hyaku, 2026-10-20

Baseline `2bff864fdfee684ddbcd066cc8e735adaba2735c`. Final evidence checkpoint
`01531daf3fa784410db454e4d606488e467a039a`; main code measurements first ran at
`c0aff2364b49b21c41669f050e03800138589fa7`, then all three counters reproduced at the checkpoint
through `.ufo/waves/round-18/measurement-binding.json` (exit0, claims3/bound3).
Freshness8 and operability8 each work a lowest non-retired tie. No stagnation waiver.

| Axis | Scalar before → after | Verdict / evidence |
|---|---|---|
| depth | 8→8 | unchanged; explicitly deferred, not saturated; seven-round avoidance concern recorded in w1/CriticLowestAxis.md |
| coverage | 9→9 | unchanged; original11 scenarios/four controls retained; no real-site/agent-side/default-profile/Chromium152 claim |
| operability | 8→8 | improved C2: six finite hazards0→6; F6 is wrapper-scoped, not a global fix; scalar9 withheld while USER6/10 remains red |
| freshness | 8→8 | improved C1: fixed-cohort source reopen receipts0→51 with retained bodies; 41 held,9 drift-superseded,1 own-work; no overdue or current-product inference |
| calibration | 9→9 | improved C3: five routed outside-check defects0→5; independent current-round closure still pending |
| adjacency | 8→8 | unchanged; six-sibling map and open leases retained, no silent arbitration |

| Claim | Before → after | Counting command (run from lane) | Measured checkpoint / evidence |
|---|---|---|---|
| C1 freshness | 0→51 | `node .ufo/waves/round-18/measure-c1.mjs REV` (`c1_rows_rechecked`) | B→01531daf3fa784410db454e4d606488e467a039a; `corpus/evidence/round-18/measurements.json`, checkpoint binding reproduction |
| C2 operability | 0→6 | `node .ufo/waves/round-18/measure-c2.mjs REV` (`c2_hazards_closed`) | same; runtime identity Chromium154.0.8037.97/Playwright1.64.0/Node24.21.0 retained in output |
| C3 calibration | 0→5 | `node .ufo/waves/round-18/measure-c3.mjs REV` (`c3_routed_closed`) | same; each d1–d5 independently verified |

Counter SHA pins: `corpus/evidence/round-18/tool-identities.json` and the binding manifest.
The first integration `530f40a9bc3f10436161a2af1ca0fe9bffffc004` is history, not the final
producer/body/counter state. Current source rows76 (A64/B4/C8; mined60/queued8/rejected8), from
`node scripts/check-sources.mjs`; B had57. Fleet census exit0 at start/end, ten duplicate-URL
warnings at end for explicit supersessions. Old source cells unchanged; additions19.

No-harm at the exact checkpoint: all23 exits equal baseline (22×0, inherited USER round_count1).
Full argv/streams/producers: `.ufo/waves/round-18/final/harm-at-checkpoint.json`; earlier complete
code-run comparison: `corpus/evidence/round-18/harm-at-measured.json`. Main self-test receipts:
C1 38/38, C2 26/26, C3 38/38 and wrapper8/8 under `corpus/evidence/round-18/selftests/`.
Binding home is outside corpus/evidence to avoid C2's broad counted-evidence prefix including
its own changing binding record. Final delivered-tip binding receipt is retained beside it.

### Planned / capabilities / saturation / retired — round18

- No new capability: this hardens and calibrates held ground; expansion unchanged.
- On the next steer, prioritize depth: a runtime imperative/declarative validation decision table
  from S071, or substrate re-verification of the r3/r8/r9 evidence ladder. Depth has not been
  claimed since user-round5; choosing other tied-lowest axes repeatedly did not retire it.
- USER round_count, real-site approval and sibling L0 lease/ruling questions remain open.
- Saturation8/window3 unchanged; round18 is position1 after the round17 capability. Retired:none.

## Round 19 — hyaku, 2026-10-21

Baseline `66251bfc1aef393e4aec599e950a8deb867736bb`. Declared claims: C1 depth (8, lowest tie), C2 operability
(8, lowest tie), C3 calibration (9). Measured values, revisions and the axis table are appended below once
the counters run at the landed revision; the lines in this block are not measurements.

Round-19 correction: SCORECARD.md:830; IDs and pass status retained; 6 of 15 checks dropped numeric CDP codes: five now assert message substrings (invoke-unknown-tool, invoke-after-unregister, invoke-flags-off-control, invoke-iframe-frameid, invoke-before-enable); invoke-domain-disabled only a nonempty message. Supersedes the round-18 wording at `SCORECARD.md:830` ("original11 scenarios/four controls retained") and in the filed round-18 report line 8 ("Final main run retains all11 original scenarios/four controls"), where they read as unchanged assertions; re-derived by `.ufo/waves/round-19/measure-c3.mjs` d2 from the round-17 vs round-18 harness predicates at the baseline.

### Round-19 measured disposition — original claims retained, admission withheld

Executed measurement checkpoint: `f5032f34e3d39da636708199b0f22a838325bbdc`; baseline:
`66251bfc1aef393e4aec599e950a8deb867736bb`. Complete argv/exits/stdout, counter SHA-256 and results:
`corpus/evidence/round-19/measurements/final.json`. The final measurement-binding manifest under
`.ufo/waves/round-19/measurement-binding.json` records the later documentation checkpoint and its
delivered-tip reproduction; it is not replaced by the historical r16/r17 binding passes.

| Claim / axis | Measured before → after | Counting command, from lane root | Verdict |
|---|---|---|---|
| C1 depth | 0→27 (`c1_validation_decisions`), both exit0 | `node .ufo/waves/round-19/measure-c1.mjs REV` | improved for 27 finite, explicitly scoped decisions; semantic source review remains separate from token matching |
| C2 operability | 0→2 (`c2_h4_properties`), both exit0 | `node .ufo/waves/round-19/measure-c2.mjs REV` | finite artifact-root / current-nonce properties improved; does not erase the separate legacy history harm below |
| C3 calibration | 0→3 (`c3_routed_closed`), both exit0 | `node .ufo/waves/round-19/measure-c3.mjs REV` | **unprovable against the declared target4**: d1–d3 verified, d4 refuses reconstructed wave-return evidence |

| Axis | Scalar before → after | Round disposition |
|---|---|---|
| depth | 8→8 | C1 improves technical detail on a lowest non-retired tie; no unsupported whole-domain scalar promotion |
| coverage | 9→9 | new validation note enters prior source-only runtime ground, still loopback/single-build |
| operability | 8→8 | C2 improvement, but **no-harm not established / harmed legacy compatibility**: USER lesson-history refusal set1→2 in inherited ancestry |
| freshness | 8→8 | bounded new-source openings/corrections; no global recertification |
| calibration | 9→9 | C3 original four-closure target unprovable; direct return-time snapshot never captured; omitted source-evidence writers also disclosed |
| adjacency | 8→8 | no sibling ownership, real-site authority or lease ruling added |

New producer execution: 66/66 cases match with zero findings, retained context/argv/cleanup proofs;
`corpus/evidence/round-19/validation/receipt.json` (producer code at
`bf466e317bc4dd08192b1dd390b253b4bb0bee8d`). Finite self-tests at that code checkpoint:
C1 39, C2 40, C3 26, isolation7, each exit0 (`.ufo/waves/round-19/final/selftest-runs.json`).
The nonce-aware no-invoke mutant accepted at R is now rejected: counter metric0, raw invokes0/responses0,
both observed predicates false (`final/noinvoke-mutant-after.json` under the round wave).

All23 historical gate exits equal B (22×0, inherited USER1); this is **not** no-harm proof. The frozen USER
predicate's refusal set grows `[round-18.md]`→`[round-18.md,round-19.md]` because the inherited checkpoint
modified a lesson after its initial addition. No history rewrite or frozen-gate relaxation is performed.
Evidence: `w2/CriticNoHarm.md` NH1 and `final/harm-at-measured.json`, both under the round wave.

No new capability row or retirement; saturation8/window3 unchanged. No waiver: depth8 was worked.
Planned only on a separately authorized next steer: make workflow capture return snapshots before any
integration and resolve the frozen USER history-policy conflict through its owner; do not recast
reconstruction as observation or treat this round's partial C3 as an admitted four-closure claim.

### L0 disposition — supersedes legacy-compatibility harm grading above

Main's in-session orchestrator ruling is retained verbatim in
`.ufo/waves/round-19/final/l0-ruling.txt` and resolved in the fleet L0 queue. The refusal growth1→2
is an **inherited lane-side conformance defect, axes unaffected**, not a repairable axis harm of the
continuation. The frozen gate/history remain unchanged and the refusal stays two. This supersedes
the table's “harmed legacy compatibility” grading and any quality-harmed inference based solely on it.
Technical C1/C2 improvements remain measured; no new axis harm was observed in the serial checks.
C3's original target4 remains unprovable (d4 missing direct return-time evidence); no proxy observation
is substituted. Main authorizes progression on repaired claims; independent closure/admission is theirs,
not asserted by this author scorecard.

## Round 20 — declared source-scoped depth claim (2026-10-21)

Baseline `c49929430d996b016dde2e3a3a5be380f3433fdb`; fresh held round20/attempt1.
C1 only: **depth**, a lowest non-retired tie at8, target0→12 mechanically validated
documented lifecycle rows plus separate semantic review. Scalar depth remains8, not
an unsupported whole-domain promotion. The sample is not12 novel branches or a
coverage denominator. Source S096 is reopened; LC11 cites new same-body S100.
Counting command: `node .ufo/waves/round-20/measure-c1.mjs REV`; field
`c1_lifecycle_decisions`. This is a declaration, not an executed measurement.
Other axes, capabilities, saturation8/window3 and retirement status are unchanged.
Round19 stays closed; its original C3 target4 remains unprovable.

### Round-20 executed disposition — C1 target met, no scalar promotion

Measured revision `e45b05280ac0255670a7d5206c9a00586d48f7f5`; baseline
`c49929430d996b016dde2e3a3a5be380f3433fdb`. Main executed
`node .ufo/waves/round-20/measure-c1.mjs REV` on both revisions: exit0,
baseline0 → clean12, field `c1_lifecycle_decisions`. Current corrected-source
rows only are counted; retained historical rows are not additional credit.
Counter SHA-256 `19921191fad84ba79414188e1a7b1bc05acdb491b1e6052ed5b70454864f7945`.
Receipt: `corpus/evidence/round-20/measurements.json`; exact four-file binding:
`.ufo/waves/round-20/measurement-binding.json`, measured-revision reproduce exit0,
claims1/bound1. Delivered-tip reproduction is separately recorded in the final report.

| Claim / axis | Before → after | Author verdict / limits |
|---|---|---|
| C1 depth | 0→12 current documented source rows; scalar8→8 | improved, bounded source-distillation artifact with separate LC01–LC12 semantic ENTAILED reviews; not12 novel branches, runtime coverage or a whole-domain score promotion |
| coverage9, operability8, freshness8, calibration9, adjacency8 | unchanged | no additional axis/capability/promotion/retirement credit; actual verification and learned boundaries support the single claim only |

Main serial evidence at the measured commit:28/28 expected outcomes;22 historical-clean
invocations preserved, new CLI selftests45/27 clean, actual frozen input match clean,
both C1 arms and corpus counts verified. The known USER production error was skipped,
not re-run to confirm it. Final lesson-history enumeration must keep the inherited
refused set at round18/round19; no history or frozen gate is rewritten.

Curation command `node .ufo/waves/round-20/counts.mjs REV`: registry99→100,
A86/B4/C9→A87/B4/C9; mined71/queued19/rejected9→mined72/queued19/rejected9;
knowledge37→38. The same-body S100 anchor extension is not publisher diversity,
and the new note deepens held ground, not a new runtime capability.
Sources-census start/end exit0 (complete streams retained in the wave).

W1 all-actor settlement flags are explicitly withdrawn; no isolation certification
or r19 d4 repair is claimed. Current verification is finite author-side evidence.
Independent non-author admit/reject closure and SHONEN promotion remain unasserted.
Author trends: expansion unchanged; quality improved bounded; discernment unchanged
pending outside agreement. Saturation8/window3 and retired:none remain unchanged.
Planned only on a separately authorized steer: runtime contrasts for non-autosubmit
loopback forms, not another row quota. No next round is claimed.

## Round 21 — declared finite lifecycle observation claim (2026-10-21)

Baseline `e7cf11a810003d4a65cc85bd265f2c17dd65b738`; held round21/attempt1.
C1 only: depth, a lowest non-retired tie at8, target0→12 receipt-bound
loopback lifecycle scenario observations contrasting non-autosubmit actions
with autosubmit controls. This counts finite evidenced observations, not12
novel branches, a coverage denominator or universal completion guarantees.
Counting command: `node .ufo/waves/round-21/measure-c1.mjs REV`, field
`c1_lifecycle_observations`. Each case retains raw invocation/event correlation,
finite observation windows, dummy per-run nonce and browser/server cleanup.
S100 is reopened for interpretation; source reading is not runtime proof.
Scalar depth8 and other axes remain unchanged pending measured evidence.
No new capability or retirement is preclaimed; saturation8/window3 unchanged.
The round20 source-only frontier motivates actual non-autosubmit contrasts.

### Round21 executed disposition — C1 target met, no scalar promotion

Measured checkpoint `2d5eaaa3c8317bce31e1180b49df4516db35d44b`; baseline
`e7cf11a810003d4a65cc85bd265f2c17dd65b738`. Actual counting command:
`node .ufo/waves/round-21/measure-c1.mjs REV`, field
`c1_lifecycle_observations`: baseline0/exit0 → clean12/exit0.
Counter SHA-256 `8d99242316c3217f1c5d76edc5e4b28f8a22c1d9dd6d1e884ad4a87b17fdf5eb`.
Full command/streams: `corpus/evidence/round-21/measurements.json`.
Exact counted inputs and producer identity:
`.ufo/waves/round-21/measurement-binding.json`; measured-revision reproduce0,
claims1/bound1 (`final/binding-at-measured.json` under the round wave).

| Claim / axis | Before → after | Author verdict / bounds |
|---|---|---|
| C1 depth | 0→12 finite recorded observations; scalar8→8 | improved: actual non-autosubmit contrasts with raw/summary/producer/source binding and separate semantic reading, not12 novel branches or a coverage denominator |
| coverage9, operability8, freshness8, calibration9, adjacency8 | unchanged | no additional axis/capability/promotion/retirement credit; no new harm observed in exercised scope |

Main's serial cohort:30/30 expected outcomes, including22 historical-clean
invocations and new CLI selftest83/83; old round20 source count12 retained.
Evidence: `.ufo/waves/round-21/final/serial-checks.json` and
`corpus/evidence/round-21/selftest-c1.json`. Known inherited USER production
failure was skipped, not recertified. Final lesson-history enumeration and
delivered-tip binding are recorded separately after the lesson's initial commit.

Current canonical entry is
`corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md`; the original
note is superseded history with its committed prefix preserved. Curation command
`node .ufo/waves/round-20/counts.mjs REV`: rows100→101 (A87/B4/C9→A88/B4/C9),
mined72→73, queued19/rejected9 unchanged; knowledge files38→40 include the
superseded original, not two admissions. S101 is own-work, not source diversity.
Sources census start/end0; exact streams retained in the round wave.

Actual acquisition ran worktree producer
`bc11e4d657a9bf1a99b3b6b1b9eb7eeb61ccf3ab2de60cc42ff383936748a811`,
not a future committed revision. Its exact Node argv and before-move artifact
pins are `runtime-execution-finalized.json`; the measured semantic contrast
witness is `final/semantic-contrast-witness.json`, both under the round wave.
Its silent structural fixture is not a semantic oracle. Effective browser argv,
served-wire bytes, actor authentication, all fault paths and real sites remain
outside the claim. Independent non-author closure/SHONEN remains unasserted.

Author trends: expansion improved for finite non-autosubmit runtime ground;
quality improved within exercised bounds; discernment unchanged pending outside
agreement. No new capability row or retirement; saturation8/window3 unchanged.
Planned only on a separately authorized steer: an operability claim on finite
browser-observation failure cleanup or a bounded absent-user-activation contrast;
neither is preclaimed or required to complete this round.

Post-lesson disposition at `ab73abefbaddff258af162f15364bb014ffe02f4`:
binding reproduce0, claims1/bound1; LessonDrift-only refused set stays
round18/round19, with round21 initial-addition-only. Exact receipts are
`final/binding-after-lesson.json` and `lesson-history.json` under the round wave.
The final report carries reproduction against the actual delivered lane tip;
the inherited USER production failure remains skipped, not declared clean.

## Round22 — declared finite lifecycle semantic-oracle claim

Baseline `5f585773258b33d2d514b00cd0b0775333578db6`; held round22/attempt1.
C1 only: depth, a lowest non-retired tie8, target0→12 explicit semantically
checked lifecycle rows over the retained round21 acquisition. Counting command:
`node .ufo/waves/round-22/measure-c1.mjs REV`, field
`c1_semantically_checked_lifecycle_rows`. This is a new durable outcome oracle,
not twelve additional observations, novel branches or a fresh browser run.
Scalar8 remains8; no capability, retirement or promotion is preclaimed.
Reopened own-work S101 supports the source-scoped finite predicates.
Historical W1 wake-history and W2 final-artifact review chronology defects are
corrected append-only this round, without reconstructing missing observations
or relabeling earlier reviews as reviews of finalized bytes.
Other axes and saturation8/window3 remain unchanged.

### Round22 pre-measurement axis correction

The initial depth declaration above is retained as design history, not a
claim of additional depth content. W1 CriticClaim/CriticScope/ConnPlanner
showed that the same twelve observations already received independently
checked semantic depth credit in round21. Their population remains12→12.
The sole operative C1 is therefore **operability**, also a lowest non-retired
tie8: absent→twelve failure-capable semantic-oracle rows over held evidence.
The counting command/metric and scalar8→8 remain as declared. Depth content,
coverage and all other axes remain unchanged. This correction precedes
measurement; no successful result is relabeled or duplicate claim added.
Sources: `.ufo/waves/round-22/w1/{CriticClaim,CriticScope,ConnPlanner}.md`.

### Round22 executed disposition — C1 target met at 12 (author-side), with a disclosed encoding revision

Measured 2026-10-25 by this round's landing attempt, against committed bytes.

| Claim / axis | Before → after | Author verdict / bounds |
|---|---|---|
| C1 operability (lowest non-retired tie 8) | 0→12 explicit semantically checked lifecycle rows over the same 12 retained round-21 observations; scalar 8→8 | **met**: `node .ufo/waves/round-22/measure-c1.mjs REV` → baseline `5f58577…` value0/`baseline`; checkpoint `47bfb5f…` value12/`clean`, findings none. Observation population12→12, no new browser run |
| depth, coverage, freshness, calibration, adjacency | unchanged | no additional credit claimed; exercised scope shows no harm (35/35 serial cohort, both no-harm lifecycle arms) |

Counting command and field unchanged from the declaration:
`node .ufo/waves/round-22/measure-c1.mjs FULL40HEXREV`, field
`c1_semantically_checked_lifecycle_rows`. Supporting gates at the checkpoint:
`node .ufo/waves/round-22/selftest-c1.mjs` → clean 45/45;
`python3 .ufo/waves/round-22/run-checks.py 47bfb5f… …` → 35/35 expected outcomes
(`.ufo/waves/round-22/checks-at-47bfb5f.json`).

Disclosed revision (W2b falsifier `CriticRepairFitting.md` §F1): the pinned
`cases[na-native-submit].post.errors` was `[]` while the same stage used `null`
for an absent submit recorder, so the landing branch read the pin backwards.
The field is now `null`, the id-guarded branch is replaced by a uniform
null-means-absent rule, the shape check binds `post.errors === null` to
`navigation: landing`, and the digest is re-pinned (`4a693dce…` → `d00aed4c…`).
The revision was authored after the data was observed and after the author-side
W2b seats scored; metric, target12, the atomic blocking rule and the evidence
population are unchanged, and the value is identical before and after (12 at
`e3cf4e0`, 12 at `47bfb5f`) — it cannot have manufactured the target. Receipt:
`.ufo/waves/round-22/expectation-revision.json`; errata appended to the note.
`post-crash-repair.json` now records W2b as author-side (its seats are this lane's),
so no non-author judgment is asserted anywhere in this round — independent
non-author closure is owed.

Capability row (appended; the table at `:381` is a historical snapshot and is not
edited in place, per the append-only mutable-docs rule):
**semantic outcome oracle** — replays retained raw CDP/page evidence against
independently pinned expectations and blocks the count on any finding (atomic),
with 45 isolated CLI cases including a mutant that isolates the expectations
digest guard.
Evidence: `.ufo/waves/round-22/measure-c1.mjs`, `selftest-c1.mjs`,
`.ufo/waves/round-22/checks-at-47bfb5f.json`. First-working round: 22.

Waves: W1 64/64 reports; W2 64 validated, 0 spawned (23 whole-payload cap
refusals, then loss of the host session); W2b 65 spawned, 58 reports, 7 dead
seats not replaced; round total 129 seats (one over the ≤128 cap, reported).
Sources census start/end exit0, rows101→101, mined73→73, no new row.
Quarantine-first assimilation: 38 register rows hand-checked, 37 refused
(quote absent from the re-fetched cited source), 1 unverifiable, adoption closed.
Saturation8/window3 retained; no axis retired.

## Round 23 — declared claims (frozen before data), CSRF frontier entry

Baseline `a89f1935f523a64b00991d792fca6a8c0d321948`; both claims declared in
`.ufo/waves/round-23/claims.json` before the instrument existed, with six disclosed
`revisions` entries. Axes at round start: depth 8, coverage 9, operability 8, freshness 8,
calibration 9, adjacency 8. Lowest non-retired axis: **operability** (tie at 8 with depth,
freshness, adjacency; round 23 moves the tie's operability surface). Saturation 8 / window 3
retained; the stagnation nudge is inactive (a capability entered at round 22), so no waiver
is claimed or needed. No axis is retired.

| Claim | Axis / type | Before → after | Counting command (field) |
|---|---|---|---|
| C1 | operability — capability acquisition | 0 → 6 defect classes derived from round-22 committed bytes | `node scripts/round-evidence-audit.mjs --rev <REV> --round 22 --round-cap 128 --json` (distinct `findings[].class`) |
| C2 | coverage — assimilation admission | 0 → 1 admitted entry citing a row first opened this round | `git grep -lE '^source: S10[23] ' <REV> -- corpus/knowledge \| wc -l` |

**Capabilities table (appended; the r22-era table is a historical snapshot and is not edited).**
Round-evidence auditor — derives six accounting classes (refusal arithmetic, wave/round caps,
Gate spot-check record, per-attempt stale-lane grading, registry identities, landed-change
LOG binding) from a round's committed bytes plus two digest-pinned external inputs, with a
12-case in-memory matrix and a six-repair evidence-keyed matrix; refuses rather than
guessing. Evidence: `scripts/round-evidence-audit.mjs`, `--selftest` (12/12),
`--selftest --rev a89f1935… --round 22 --round-cap 128` (6/6 repairs),
`.ufo/waves/round-23/fixtures/skipwork-receipt.json`. First-working round: 23.

## Round 23 — executed disposition

Measured 2026-10-25 against the tree of the checkpoint commit that carries the auditor, the
entry and both SOURCES rows; the checkpoint hash and the post-commit re-run are recorded in
the report (the report lands last).

| Claim / axis | Before → after | Verdict / bounds |
|---|---|---|
| C1 operability | 0 → 6 classes; exit 1; 7 findings (c1 1, c2 1, c3 1, c4 1, c5 1, c6 2) | **met** as a capability: `--selftest` 12/12 exit 0; `--selftest --rev … --round 22 --round-cap 128` baseline 7 findings / 6 classes with 6/6 repairs removing exactly their own class; skip-work control refused (6 on a clean fixture); round-21 trips c3 only, a true positive, and is **not** a zero-control. Scalar operability 8→8 |
| C2 coverage | 0 → 1 admitted entry citing S102/S103; rows 101 → 103 | **met**: both cited spans located in bytes fetched this round (S102 §8.8.1 line 2815; S103 §"Employing Custom Request Headers for AJAX/API"); the staged citation layer failed three ways and was corrected (errata E1–E3); documented-upstream, no measured credit. Scalar coverage 9→9 |
| depth, freshness, calibration, adjacency | unchanged | no additional credit claimed; exercised scope shows no harm (append-only prefixes on all six mutable docs, round-21/22 evidence bytes unchanged, auditor writes nothing) |

Per-claim evidence pointers: `corpus/evidence/round-23/c1-measurements.json` (C1 revision
sweep), `.ufo/waves/round-23/fixtures/skipwork-receipt.json` (control), `.ufo/waves/round-23/w1/`
and `w2/` (seat reports), `corpus/lessons/round-23.md` (§Gate, §Corrections, §Mistakes).

Routed round-22 defects, all six closed by appended correction (never by rewriting the filed
bytes) in `corpus/lessons/round-23.md` §Corrections: refusal arithmetic 23 → 24; wave band
65 > 64 and round 129 > 128; the Gate spot-check result now on record; per-attempt grades
for three dispatches; registry identities recorded for this round's waves; landed change ↔
LOG entry bound to one commit. Criteria 61–63 encode the first three as rules.

No axis harmed; no scalar promoted; no capability beyond the one row above; nothing retired.

### Round 23 — corrections to the block above (append-only, after wave-2 review)

- **Measured revisions, now named.** C1 is measured at `03c1b4d9a9ea7719ff4a13a63989fa9be36229c3`
  (production checkpoint) and re-run unchanged at the final lane tip; C2 is measured at the same
  commit. Runnable forms: `node scripts/round-evidence-audit.mjs --rev 03c1b4d9a9ea7719ff4a13a63989fa9be36229c3 --round 22 --round-cap 128 --json`
  → 6 classes / 7 findings / exit 1; `git grep -lE '^source: S10[23] ' 03c1b4d9a9ea7719ff4a13a63989fa9be36229c3 -- corpus/knowledge | wc -l`
  → 1. The placeholder `<REV>` in the tables above is this commit.
- **The append-only claim, corrected.** Five of the six mutable docs are byte-prefix extensions of
  the baseline (`LOG.md`, `SCORECARD.md`, `corpus/QUALITY.md`, `corpus/README.md`, `SKILL.md`);
  `corpus/SOURCES.md` is **not** a prefix extension — two rows are inserted at the registry's
  mid-file boundary (before `## Paths`), a pure insertion with 0 baseline lines removed
  (`git diff a89f1935 <tip> -- corpus/SOURCES.md` → 2 insertions, 0 deletions). The earlier
  "append-only prefixes on all six" wording is superseded by this paragraph.
- **Wave and seat census.** W1 44 seats (44/44 reports, 0 dead), W2 44 seats (34/44 reports, 10
  dead, none replaced), round total 88 ≤ 128; both wave specs inside the 32–64 band; registries
  44/44 members with agentIds and `record` receipts.
- **Capability-row command, runnable.** `node scripts/round-evidence-audit.mjs --selftest --rev 03c1b4d9a9ea7719ff4a13a63989fa9be36229c3 --round 22 --round-cap 128`
  → baseline 7 findings / 6 classes, 6/6 repairs, exit 0.

## Round 24 — corrections to earlier figures (append-only, after the calibration gate ran)

`scripts/check-selfassessment.mjs` (class `m1-selftest-tally`) reads a later statement of a
gate's own tally as the current one and an earlier statement as historical. Each line below
states the figure the gate measured this round, so the supersession is mechanical, not prose.

- `scripts/check-sources.mjs` `--self-test` → cases=26 (supersedes the earlier twenty-five figure at `:410` and the twenty-five wording of the round-23-era SKILL.md row, which the round-24 registry restatement replaces).
- `scripts/round-evidence-audit.mjs` `--selftest` → cases=13, passed=13 (supersedes the earlier twelve-case wording and both twelve-of-twelve figures at `:1138`, `:1139` and `:1151`; the thirteenth case landed in `43e9bb5`).
- `scripts/check-freshness.mjs` `--self-test` → cases=12 (the earlier SKILL.md row said eight; the round-24 registry restatement replaces it).
- `scripts/check-adjacency.mjs` `--self-test` → cases=57, reasons=18.
- `scripts/check-measurement-binding.mjs` `--self-test` → cases=76, reasons=13.
- `scripts/check-round-contract.mjs` `--self-test` → cases=38.
- `scripts/check-user-round-contract.mjs` `--self-test` → cases=45.
- `scripts/check-aria-metadata.mjs` `--self-test` → cli_cases=36, helpers=4.

Not corrected, because it reproduces: the `:1183-1184` evidence-keyed figure
(`--selftest --rev 03c1b4d… --round 22 --round-cap 128` → baseline 7 findings / 6 classes, 6/6
repairs, clean) was re-run this round and returned exactly that (`baselineFindings: 7`,
`baselineClasses: 6`, `cases: 6`, `passed: 6`, `clean: true`). A wave-1 prototype reported 4
findings / 3 classes for the same command; that measurement did not reproduce and is recorded as
a prototype defect in `corpus/lessons/round-24.md`, not as a correction.

## Round 24 — declared claims (frozen before data), gate-registry and calibration gates

Baseline `573c99e4885382db38babc3a6fc90e77afeb42a6`; claims frozen in
`.ufo/waves/round-24/claims.json` before either instrument existed. Axes at round start:
depth 8, coverage 9, operability 8, freshness 8, calibration 9, adjacency 8. Lowest non-retired
axis: **operability** (tie at 8 with depth, freshness, adjacency); C1 works the operability
surface the round-23 non-author spot-check routed as a conformance defect. Saturation 8 / window 3
retained; the stagnation nudge is inactive (capabilities entered at rounds 22–23).

| Claim | Axis / type | Before → after | Counting command (field) |
|---|---|---|---|
| C1 | operability — capability acquisition + routed defect 1 | 3 → 0 nonconformant gates | `node scripts/check-gate-registry.mjs --rev <REV> --json` (`nonconformant`) |
| C2 | calibration — capability acquisition + routed defects 2 and 4 | 5 → 0 self-assessment mismatches | `node scripts/check-selfassessment.mjs --rev <REV> --json` (`mismatches`) |
| C3 | coverage — frontier entry (documented-upstream) | 0 → 1 admitted entry citing a row first opened this round | `git grep -lE '^source: S10[45] ' <REV> -- corpus/knowledge \| wc -l` |

## Round 24 — executed disposition

Measured 2026-10-25 against the tip commit that carries the gates, the registry restatement, the
corrections and the entry; the exact revisions and both raw receipts are in
`corpus/evidence/round-24/` (`c1-baseline.json`, `c1-tip.json`, `c2-baseline.json`,
`c2-tip.json`, `c1-measurements.json`, `c2-measurements.json`).

| Claim / axis | Before → after | Verdict / bounds |
|---|---|---|
| C1 operability | 3 → 0 nonconformant gates (12 gates at baseline, 14 at tip: the two new gates enter the set and both carry rows) | **met**: baseline findings are `e1-missing-row` for `check-adjacency`, `check-measurement-binding` and `round-evidence-audit` (the routed defect); tip is clean, exit 0. `--selftest` cases=22, passed=22. Scalar operability 8→8 |
| C2 calibration | 5 → 0 mismatches | **met**: baseline counts four stale tallies (`check-sources` twenty-five vs 26 at `:410`; `round-evidence-audit` twelve vs 13 at `:1138`, `:1139`, `:1151`) and one `m3-unlanded-paths` finding; tip counts none, with five earlier statements superseded by the round's correction block. `--selftest` cases=13, passed=13. Scalar calibration 9→9 |
| C3 coverage | 0 → 1 admitted entry (`corpus/knowledge/navigation-history-bfcache-evidence.md`) citing S104 and S105, both opened this round | **met**: rows 103 → 105, census exit 0. Documented-upstream: no browser ran, no restore observed, no measured credit. Scalar coverage 9→9 |
| depth, freshness, calibration(score), adjacency | unchanged | no additional credit claimed; exercised scope shows no harm — the round's deletions are the owed round-23 scratch cleanup plus untracked junk, every prior-round prose byte is an append |

**Capability rows (appended; the r22/r23-era tables are historical snapshots and are not edited).**

Gate-registry conformance gate — derives the lane's gate set from a revision's committed bytes
(convention `check-*.mjs`/`*audit*.mjs` plus row-named scripts), parses five historical registry
table shapes by header name, and reports each gate whose latest row is missing or incomplete
against PROTOCOL §Gate standard's eight fields. Evidence: `scripts/check-gate-registry.mjs`,
`--selftest` (cases=22), `corpus/evidence/round-24/c1-measurements.json`. First-working round: 24.

Self-assessment mismatch counter — compares the lane's written self-assessment against observed
state in three classes (stale self-test tally vs the gate's own output, receipt exit vs a
closed-grammar re-run, unlanded paths vs a landed disposition), with append-only supersession and
fail-closed could-not-evaluate. Evidence: `scripts/check-selfassessment.mjs`, `--selftest`
(cases=13), `corpus/evidence/round-24/c2-measurements.json`. First-working round: 24.

**Routed round-23 defects, disposition.** 1 — gate registry row: closed (row `round-evidence-audit`
appended with all eight fields; the conformance gate proves it mechanically). 2 — 89 uncommitted
paths: closed (66 empty numeric files, four empty `.err` captures and the untracked seat scratch
deleted; the two rewrite-in-progress files restored from the branch; the late `W2Simplifier.md`
append committed; `git status --porcelain` empty at the tip). 3 — M5 scratch over-commit: closed
(1,034 committed scratch paths removed in one commit; the bytes stay readable at `573c99e`, named
in `corpus/lessons/round-24.md`; `.ufo/waves/*/scratch/` is now ignored so the class cannot
recur). 4 — stale 12/12 figure: closed (corrections block, mechanical supersession, C2 counts it).
5 — receipt exit field: **does not reproduce** at the reviewed tip or the baseline (both read
`before.exit: 128`, matching the command); the defect describes the blob at `03c1b4d`, where the
field was `1` until `7ac9fff` corrected it — recorded, not "fixed". 6 — disclosed open limits: unchanged.

## Round 24 — waves and seats

W1 (v1 band 32–64) 32 seats: 6 scout, 6 executor, 4 scribe, 6 reviewer, 4 critic, 1 connector,
1 revenger, 2 mutation-tester, 1 simplifier, 1 sentinel. 31 reports landed; `ScribeLesson` returned
without writing (dead seat, not replaced). W2 (falsify) 32 seats, dispatched after W1 returned.
Round total and the W2 role mix are recorded in the round report; the `planner` seat is held by
the L1 (the validator rejects `planner` as a swarm role), and the `labrat`/`distiller` items ride
`executor`/`reviewer` seats for the same reason.
## Round 25 — declared claims (frozen before data)

Baseline `9e13666759bcf30665abec84dec13adefc1fa86a`; claims frozen in
`.ufo/waves/round-25/claims.json` before either counter existed. Axes at round start:
depth 8, coverage 9, operability 8, freshness 8, calibration 9, adjacency 8. Lowest
non-retired axis: **tie at 8** (depth, operability, freshness, adjacency); C1 works
depth, C2 works freshness. Saturation 8 / window 3 retained; the stagnation nudge is
inactive (capabilities entered at rounds 22–24).

| Claim | Axis / type | Before → after | Counting command (field) |
|---|---|---|---|
| C1 | depth — frontier entry: runtime observation | 0 committed bfcache receipts at baseline → restores ≥ 1, valid | `node scripts/check-bfcache-receipt.mjs --rev <REV> --json` (`restores`, `valid`) |
| C2 | freshness — on-release source re-verification | 0 rows re-opened this round → reopened=6, unresolved=0 | `node scripts/check-source-reopen-receipt.mjs --rev <REV> --json` (`reopened`, `unresolved`) |

## Round 25 — executed disposition

Measured 2026-10-25 at commit `870fab29977a2ab8cbee7fbe0e6dc4ef87ff6009` (the
measurement commit carrying the gates, the receipts, S106 and the entries); the same
commands are re-run at the final delivery tip and both read committed bytes.

| Claim / axis | Before → after | Verdict / bounds |
|---|---|---|
| C1 depth | 0 → restores=1, valid=true | **met**: receipt `corpus/evidence/round-25/bfcache/receipt.json` (sha256 25076764…) scores exit 0 at the measured commit, with the restore traced to a real `Page.backForwardCacheRestore` on the original loaderId, a real history-index drop (2 → 1), the page witness (`pageshow.persisted` + surviving JS state), no `backForwardCacheNotUsed`, and two negative controls (no-history → 0; `--disable-back-forward-cache` → 0). `--selftest` cases=17, passed=17. Scalar depth 8→8 |
| C2 freshness | 0 → reopened=6, resolved=6, unresolved=0 | **met**: receipt `corpus/evidence/round-25/freshness/reopened.json` (sha256 609ab7c4…) scores exit 0 at the measured commit; all six on-release quotes located in this round's committed bytes; 0 supersessions. `--selftest` cases=18, passed=18. Scalar freshness 8→8 |
| operability, coverage, calibration, adjacency | unchanged | no additional credit claimed; exercised scope shows no harm — every prior-round byte is an append; the only registry add is S106 |

**Capability rows (appended; earlier tables stay historical snapshots).**

Bfcache-receipt gate — reads the committed journey receipt, ties every counted
restore to a raw `Page.frameNavigated` BackForwardCacheRestore event with the
original loaderId, the history-index drop (i.e., a real `Page.navigateToHistoryEntry`
step; `Page.goBack` is not a CDP method), the page witness, digest binding, the
absence of disable flags (including `--disable-features=…BackForwardCache…`), and
the absence of `backForwardCacheNotUsed`; scores 0 clean (restores ≥ 1) / 1 failed /
2 could-not-evaluate. Evidence: `scripts/check-bfcache-receipt.mjs`, `--selftest`
(cases=17), `corpus/evidence/round-25/bfcache/receipt.json`. First-working round: 25.

Source-reopen-receipt gate — reads the freshness receipt, recomputes each sha256
over the committed bytes, validates this-round fetched dates, and locates each held
quote in the stored bytes (tag-stripped, whitespace-normalized), or validates a
this-round superseding row that opens with `supersedes <id> —`; scores 0 clean
(reopened=6, unresolved=0) / 1 failed / 2 could-not-evaluate. Evidence:
`scripts/check-source-reopen-receipt.mjs`, `--selftest` (cases=18),
`corpus/evidence/round-25/freshness/reopened.json`. First-working round: 25.

## Round 25 — waves and seats

W1 (v1 band 32–64) 34 seats: 9 scout, 7 executor, 5 scribe, 4 reviewer, 4 critic,
1 connector, 1 revenger, 2 mutation-tester, 1 simplifier, 1 sentinel; all 34 reports
landed. W2 (falsify) 34 seats, dispatched after W1 returned and the measurement
commit landed. Round total and the W2 role mix are recorded in the round report; the
`planner` seat is held by the L1 (the validator rejects `planner` as a swarm role),
and `labrat`/`distiller` items ride `executor`/`reviewer` seats.

## Round 26 — declared claims (frozen before data)

Baseline `4ad4c77eed78bca1a149e65a7ec6a84b5f71c925`; claims frozen in
`.ufo/waves/round-26/claims.json` before any wave ran (`frozenBeforeData: true`,
empty `revisions`). Axes at round start: depth 8, coverage 9, operability 8,
freshness 8, calibration 9, adjacency 8. Lowest non-retired axis: **tie at 8**
(depth, operability, freshness, adjacency); C2 works depth (tie), C1
calibration 9, C3 coverage 9. Saturation 8 / window 3 retained; the stagnation
nudge is inactive (capabilities entered at rounds 22–25). No axis retired.

| Claim | Axis / type | Before → after | Counting command (field) |
|---|---|---|---|
| C1 | calibration — counter-window extension (routed round-25 LOG next-iteration (b)) | extended `check-selfassessment.mjs` m1 window to LOG.md round entries: ≥1 `m1-selftest-tally` mismatch at baseline (LOG.md:1664 `12/12` vs measured 13) → 0 at tip after append-only corrections; selftest 13 → ≥15 | `node scripts/check-selfassessment.mjs --rev <REV> --json` (`mismatches`) |
| C2 | depth — routed source-evidence admission (round-25 closure defect 4) | 0 committed S106 evidence bytes at baseline → `valid=true` at tip | `node scripts/check-s106-evidence.mjs --rev <REV> --json` (`valid`) |
| C3 | coverage — assimilation admission (addendum §10), documented-upstream | 0 entries cite a row first opened this round → ≥1 entry citing new row S107 (staged redirect/Retry-After theme, re-grounded) | `git grep -lE '^source: S107 ' <REV> -- corpus/knowledge \| wc -l` |

## Round 26 — executed disposition

Round shape: **operator wrap-up ended the run mid-round** ("start no new
waves … land NOW with what you have"). Wave 1 was built and policy-validated
(34 seats, exit 0, `w1-dispatch.json` produced) but never dispatched; wave 2
never built; round total **0 seats**. Per the run-6 amendment, a round whose
swarm never ran gets no falsification credit — recorded plainly, not prettified.

| Claim / axis | Before → after | Verdict |
|---|---|---|
| C1 calibration | counter extension never built; no measurement arm exists | **failed — not executed**. The LOG correction block (superseding :1664, oracle `cases: 13` measured by the L1, exit 0) landed append-only as evidence-of-record, but no instrument proves the LOG window, so the frozen predicate is not re-derivable. Scalar calibration 9→9 |
| C2 depth | decoded evidence committed (`corpus/evidence/round-26/sources/` + `s106.json`: encoded sha256 `f17347b2…`, decoded sha256 `9b93fe64…`, anchor line 187 unique, comment 186 — matching the S106 row); the frozen counter `scripts/check-s106-evidence.mjs` never built | **failed — not executed** as a claim (the frozen counting command does not exist); the routed evidence it was to gate is landed and closes round-25 closure defect 4. Scalar depth 8→8 |
| C3 coverage | nothing re-grounded; registry untouched (106 → 106 rows, census exit 0 both ends) | **failed — not executed**; the §10 machinery (collision guard, staged-row transform, scratch-mirror census gate) never ran and nothing was appended. Assimilation verdicts (incl. the pre-noted S125/S142 refusals) are owed to a round with seats. Scalar coverage 9→9 |
| operability, freshness, adjacency | unchanged | no claim; wrap-up tree gates re-read clean where run (see LOG); no harm — every prior-round byte is an append, the only prior-tree change is the commit of the untracked round-25 w2 registry (routed defect 3) |

No capability rows enter (no gate ran). No scalar moves. Routed defect 1
(report-path/SHONEN) is answered by this round's first-pass contract-path
report; the mechanization (`scripts/report-contract.mjs`) is specced but
unbuilt — named, not claimed (QUALITY 67 same). The frozen `claims.json` is
the resumption point for the next round's re-dispatch of these claims
unchanged.

## Round 26 — waves and seats

W1 (v1 band 32–64) 34 seats specced (9 scout, 8 executor, 4 scribe, 4
reviewer, 4 critic, 1 connector, 1 revenger, 1 sentinel, 1 mutation-tester,
1 simplifier): spec validated under `ufo-wave-policy.json` (exit 0) and the
dispatch payload built (`w1-dispatch.json`); **dispatched 0 — operator
wrap-up**. W2 never specced. Round total 0 seats, 0 dead. The §3 planner seat
is held by the L1; the validated spec would have met the L2 floor inside W1.

## Round 27 — declared claims (resumption attempt; inherited text drift disclosed)

Baseline `f185b4e7ab10cd9e8925e8ec614c9c111772357d`; the round-27
`.ufo/waves/round-27/claims.json` says the round-26 claims were re-dispatched
unchanged, but wave-2 audit found C1/C2/C3 claim text differences from the
inherited file. The frozen record was not rewritten after data; see lesson M5
and the report. Axes and the intended targets are recorded below.
Axes at round start: depth 8, coverage 9, operability 8, freshness 8,
calibration 9, adjacency 8. Lowest non-retired axis tie at 8 (depth,
operability, freshness, adjacency); C2 intended to work depth. Saturation 8 /
window 3; nudge inactive; no axis retired.

| Round-27 claim text (not identical to inherited record) | Axis / type | Target | Counting command (field) |
|---|---|---|---|
| C1 | calibration — intended counter-window extension; inherited claim text drifted | intended target: ≥1 LOG-window mismatch at counter baseline → 0 at tip; selftest 13 → ≥15 | `node scripts/check-selfassessment.mjs --rev <REV> --json` (`mismatches`) |
| C2 | depth — intended routed source-evidence admission; inherited claim text drifted | intended target: 0 gate → `valid=true` at tip | `node scripts/check-s106-evidence.mjs --rev <REV> --json` (`valid`) |
| C3 | coverage — intended §10 assimilation admission; inherited claim text drifted | intended target: 0 entries cite S107 → ≥1 | `git grep -lE '^source: S107 ' <REV> -- corpus/knowledge \| wc -l` |

## Round 27 — executed disposition

Measurements below are tied to the named committed revisions; C1's apparent
zero is not accepted because the frozen supersession rule is not enforced.

| Claim / axis | Before → after | Verdict |
|---|---|---|
| C1 calibration | baseline `4ad4c77` → `mismatches=6` (five LOG-window findings + one live-tree m3 finding); selftest 13 → 17 | **failed** — the apparent zero is unsound: `CritC1Supersession.md` and `ExecC1Attacks.md` prove the paragraph matcher clears real `LOG.md:221` without citing that line, contrary to the frozen C1 predicate. `m3` also reads live porcelain rather than the pinned `--rev`. No post-data counter-rule change; defer repair to a new claim. |
| C2 depth | counter target 0 → `valid=true` at corrected gate `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0` (present, sha_match, anchor_located, anchor_unique, byte_count_match) | **measured, inherited-conformance not established** — absent receipt now yields exit 2 and selftest 5/5, but round-27 claim text dropped inherited fetch-failure and revision-binding clauses; the receipt has no revision field and the gate cannot prove that inherited condition. |
| C3 coverage | counter target 0 → 1 S107-citing entry at `6ca3b89ad2a7b480984859834b3d28f1e75a9a26` | **counter passes; §10 hand-check complete with adoption conflict routed** — census exit 0 (`census-after-c3.txt`); 38-row slice verdicts are in the lesson/reviewer reports. S114/S140 have source text present but were not appended because frozen C3 only admits S107; the conflict is in the round-27 L0 question. |
| operability | 8 → 8 (a new gate lands with registry row; SKILL.md eight-field rows appended under the append-only round-27 section; `check-gate-registry.mjs` clean) | improved in substance, scalar held — counted under the claim's own counter, not re-scored |
| freshness, adjacency | unchanged | no claim; no harm measured — every prior-round byte is append-only |

No capability-table promotion this round: `check-s106-evidence.mjs` is a gate
(counter), not a repertoire capability.

## Round 27 — waves and seats

Two v1 waves (32 + 36 = 68 seats) plus one four-reviewer residual call for the
§10 quarantine slice = **72 round seats**. W1 (build/first falsifiers): 3 scout,
9 executor, 5 scribe, 2 simplifier, 4 reviewer, 3 critic, 2 mutation-tester,
2 connector, 1 sentinel, 1 revenger (m_flash 16/32 = 50%; attack 9/32 = 28.1%).
W2 (falsify): 13 executor, 4 scribe, 1 simplifier, 3 mutation-tester, 2
reviewer, 5 critic, 4 scout, 2 sentinel, 2 connector (m_flash 18/36 = 50%;
attack 10/36 = 27.8%). Both validated under policy v1 and dispatched as one
batched call each. W1: 32 reports/32 seats. W2: 35 reports/36; no dead job,
but `ScribeClaimRecordAudit` completed without its assigned report. Residual
call: four reviewers/4 reports, all quarantine verdicts recorded; 35 absent/
refuse, S114 and S140 present but not adopted under the frozen C3 scope, and
S171 unverifiable after HTTP 404. L0 question filed on present-quarantine versus
frozen-claim handling. The §3 planner seat is held by the L1; W1 met the L2 floor.

### Planned / saturation / retired — round 27

- planned: freshness — re-verify the on-release rows S104–S106's sources on the
  next browser-tag bump; report-contract utility now lands at `scripts/report-contract.mjs`
  and criterion 68 defines its required report check.
- capabilities: unchanged; gates are counters, not repertoire rows.
- saturation 8 / window 3 unchanged; no axis retired or waived.

## Round 28 — declared claims and disposition

Baseline `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`; axes depth 8, coverage 9,
operability 8, freshness 8, calibration 9, adjacency 8. Lowest-axis tie at 8;
C1 works depth. Claims frozen before wave data in `.ufo/waves/round-28/claims.json`.

| Claim / axis | Before → after | Verdict |
|---|---|---|
| C1 depth | `node scripts/check-s106-evidence.mjs --selftest`: 5 cases at baseline → implementation adds 2 revision-binding cases; post-edit result not run. S106 gate and receipt modified to bind `measured_rev`. | **unprovable** — main verification pending; no after count asserted. |
| C2 calibration | `node scripts/check-selfassessment.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json` previously false-cleared LOG.md:221; selftest baseline 17 cases. Exact document/line matcher and two red cases added; post-edit gate/selftest not run. | **unprovable** — main verification pending; no after count asserted. |

No score delta recorded. Counting commands and baseline measurements above; after-state is not measured. C1 and C2 are causally separate at their gates; no coverage claim. S106 source opened this round and cited in the round-28 lesson as C1 evidence. Calibration and depth remain unchanged pending verification.

## Round 28 — waves and seats

One v2 wave `w1`: 64 seats (24 executor, 8 scribe, 8 critic, 8 reviewer,
8 mutation-tester, 4 connector, 4 scout); 64 results, no missing outputs,
0 dead seats. `w1-spec.json` and `w1-dispatch.json` validated under policy v2;
one batched handoff via `w1.ready`. m_flash majority roles: executor/scribe/
critic = 40/64 (62.5%); attack roles critic/reviewer/mutation-tester =
24/64 (37.5%). L1 holds the canonical planner seat; bounded planning data walk
rode connector/scout items. No residual calls.

### Planned / saturation / retired — round 28

- planned: freshness — re-verify on-release rows S104–S106 at the next browser-tag bump.
- capabilities unchanged; no axis retired; saturation 8 / window 3; stagnation nudge inactive.

## Round 29 — corrections (append-only; each cites the stale line in its own document)

Measured 2026-10-26 by the frozen doc-bound counter (`.ufo/waves/round-29/claims.json` C2);
the stale lines stay as written, these lines supersede them.

- `scripts/check-sources.mjs` `--selftest` (26/26): correction — supersedes the stale tally at `SCORECARD.md:410`.
- `scripts/round-evidence-audit.mjs` `--selftest` (13/13): correction — supersedes the stale tallies at `SCORECARD.md:1138-1139` and `SCORECARD.md:1151`.
- `scripts/check-selfassessment.mjs` `--selftest` (22/22): correction — supersedes the stale tally at `SCORECARD.md:1439` (the doc-bound matcher added two cross-document cases this round).
- `scripts/check-s106-evidence.mjs` `--selftest` (7/7): correction — supersedes the stale tally at `SCORECARD.md:1438` (its figure was the round-28 baseline count; at the round-28 tip the self-test crashed before printing a tally).

## Round 29 — declared claims (frozen before data) and executed disposition

Fresh-start round (run 8). Baseline `856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb`; claims, counters and
controls frozen in `97be89bc66139eb45526a04af59a35dccc006eb9` (`.ufo/waves/round-29/claims.json`).
Axes at round start: depth 8, coverage 9, operability 8, freshness 8, calibration 9, adjacency 8;
lowest-axis tie at 8 — C1 works operability, C3 works freshness. Saturation 8 / window 3; nudge
inactive; no axis retired. Measured at `9cc92b0880a104551a32369f8f59bf4af9d0959e` and re-measured at
the final lane tip in a clean clone; raw outputs in `.ufo/waves/round-29/measure/`.

| Claim / axis | Counting command | Before → after | Verdict / score |
|---|---|---|---|
| C1 operability | `node scripts/check-s106-evidence.mjs --selftest; echo exit=$?` | exit 1, ReferenceError, no tally → `S106_SELFTEST verdict=clean cases=7 passed=7` exit 0; mutant without the revision comparison fails `measured-revision-bytes-mismatch` (`corpus/evidence/round-29/s106-selftest/mutation.txt`); `--rev` valid=true | met (lane-side); operability 8 → 8 (a restored gate, not a new one) |
| C2 calibration | `node scripts/check-selfassessment.mjs --rev <REV> --json` in a clean checkout (frozen counter sha256 728128…60c4) | mismatches 6 → 0 | met (lane-side); calibration 9 → 9 |
| C3 freshness | `node scripts/check-release-pins.mjs --rev <REV> --stable 156.0.8078.47 --json` | population 23, unresolved 23 → 0 (holds 16, drifted 7, superseded by S109–S115) | met (lane-side) with disclosed counter weaknesses (lesson round-29 M4); freshness 8 → 9 |
| depth, coverage, adjacency | — | no claim | unchanged; no-harm sweep `.ufo/waves/round-29/w2/ExecNoHarm.md` found no gate green at baseline and red at tip |

Gate registry: `node scripts/check-gate-registry.mjs --rev <REV>` nonconformant 2 → 0 (counted under
C1's axis, no separate credit). The `scripts/check-release-pins.mjs` self-test runs `cases=20` (registry row in
SKILL.md round 29). C2's frozen counter now runs `cases=22` (`scripts/check-selfassessment.mjs`).
Coupling disclosed after wave 1: C1 landing turned `SCORECARD.md:1438` from could-not-evaluate into a counted
stale tally, superseded in the round-29 corrections section above.

### Round 29 — waves and seats

Two v1 waves. W1 build + first falsifiers, 44 seats (26 executor, 6 critic, 3 reviewer, 3 mutation-tester,
3 connector, 2 scout, 1 scribe); W2 falsify, 39 seats (25 critic, 5 executor, 3 reviewer, 3 mutation-tester,
2 connector, 1 scout). Round total 83; no residual call. The L1 holds the planner seat.

### Planned / saturation / retired — round 29

- planned: operability — release-pin counter v2 (anchor-derived span sets, exact-path binding, population id
  set, self-supersession refusal, 404 rows judged on status and first line) closing the round-29 wave-1
  attack fixtures; s106 self-test cases for anchor uniqueness and byte count (surviving mutants, `w1/MutC1Baseline.md`).
- capabilities unchanged (gates are counters); saturation 8 / window 3; no axis retired.

## Round 30 — corrections (append-only; each cites the stale line in its own document)

Round 30's C1 added self-test cases to two gates; the tallies stated above are superseded here.

- `scripts/check-s106-evidence.mjs` `--selftest` (10/10): correction — supersedes the stale tallies at `SCORECARD.md:1438`, `SCORECARD.md:1466` and `SCORECARD.md:1479` (round 30 added three cases: same-length tamper, duplicate anchor, receipt byte-count mismatch).
- `scripts/check-release-pins.mjs` `--selftest` (29/29): correction — supersedes the stale tally at `SCORECARD.md:1485` (round 30 added nine reason-pinned cases).

## Round 30 — declared claims (frozen before data) and executed disposition

Baseline `f7c0317e4f8445502005e79e3d65767430912dab`; claims, counters, catalogue and controls frozen in
`061e62024c0523d3c6c7e819506a773ff2cd7d75` (`.ufo/waves/round-30/claims.json`, receipts `.ufo/waves/round-30/baseline/`).
Axes at round start: depth 8, coverage 9, operability 8, freshness 9, calibration 9, adjacency 8; lowest-axis tie at
8 — C1 works operability. Saturation 8 / window 3; nudge inactive; no axis retired. After-measurements in a clean
checkout of the measured revision, raw outputs in `.ufo/waves/round-30/measure/` (the measured revision is named in
the report and in `measure/README.txt`).

| Claim / axis | Counting command | Before → after | Verdict / score |
|---|---|---|---|
| C1 operability | `node scripts/check-gate-mutants.mjs --rev <REV> --json` (frozen counter sha256 `02945f88…3a55`, catalogue `cd1c27a2…3833`) | fault_survivors 14 → 0 of 27, benign_killed 0 → 0 of 13 | met under the frozen rule; counter weakness disclosed (lesson round-30 M5; an identity-blind re-run also reads 0/0); operability 8 → 9 (two new runnable gates, and every catalogued check of two existing gates now seen by their self-tests) |
| C2 coverage | `node scripts/check-frontier-admission.mjs --rev <REV> --frontier rate-tos-signal --since 2026-10-26 --live --json` (frozen sha256 `cadef57e…9eca`) | population 0 → 2, admitted 0 → 2 | met under the frozen rule; `--live` weaknesses disclosed (lesson round-30 M6; the committed receipts are https and fail in a no-network namespace); coverage 9 → 9 (the Rate/ToS frontier item's rate half moves open → docs-held; runtime and the ToS half stay open) |
| depth, freshness, calibration, adjacency | — | no claim | unchanged; no-harm matrix `.ufo/waves/round-30/w2/ExecNoHarmTip.md` (no gate green at the freeze and red at the tip); `check-selfassessment` mismatches 0 after the round-30 corrections above |

Gate registry: two new gates (`gate-mutants`, `frontier-admission`) carry eight-field rows in SKILL.md's round-30
section; `node scripts/check-gate-registry.mjs --rev <REV>` nonconformant 0. Self-test tallies at the tip:
`scripts/check-gate-mutants.mjs` `--selftest` (12/12), `scripts/check-frontier-admission.mjs` `--selftest` (24/24),
`scripts/check-s106-evidence.mjs` `--selftest` (10/10), `scripts/check-release-pins.mjs` `--selftest` (29/29).

### Round 30 — waves and seats

Two v1 waves. W1 build + first falsifiers, 32 seats (9 scribe, 7 executor, 5 critic, 3 reviewer, 3 connector,
2 mutation-tester, 2 scout, 1 sentinel); W2 falsify, 34 seats (12 critic, 10 reviewer, 6 executor, 2 connector,
2 scribe, 1 mutation-tester, 1 sentinel). Round total 66; no residual call. The L1 holds the canonical planner seat.

### Planned / saturation / retired — round 30

- planned: operability — counter v2 for `check-gate-mutants.mjs` (opaque run-directory names, a minimal child
  environment, killer attribution in the kill rule, catalogue extended with the w2 MutC1Beyond survivors) and for
  `check-frontier-admission.mjs` (https-only production fetch, same-host redirects, `curl -q`, calendar-valid dates,
  independence evidence for refetch records); draft and attacks in `.ufo/waves/round-30/w2/ScribeV2Plan.md`.
- planned: freshness — S116 recheck due 2026-11-24 (draft expiry) or on `-12`; release-pin counter v2 with a
  DEPS-mapped population for S036, S044, S068, S088, S089, S090 (lesson round-30 §Release-pin population rule).
- capabilities unchanged (gates are counters); saturation 8 / window 3; no axis retired.

## Round 30 — corrections to the round-30 disposition (append-only; each cites the line in its own document)

`SCORECARD.md:1527` and `SCORECARD.md:1528` state two self-test tallies per line; the frozen calibration counter pairs
each line's first tally with every script named on it. Restated one script per line:

- `scripts/check-frontier-admission.mjs` `--selftest` (24/24): correction — supersedes the two-script tally line at `SCORECARD.md:1527`.
- `scripts/check-release-pins.mjs` `--selftest` (29/29): correction — supersedes the two-script tally line at `SCORECARD.md:1528`.

The gate-mutants tally at `SCORECARD.md:1527` (12/12, observed by its own `--selftest` summary line
`GATE_MUTANTS_SELFTEST verdict=clean cases=12 passed=12`) stays flagged by the calibration counter, which reads the
first `cases=` token in the output — here a refusal message inside the per-case lines (`… cases=2 passed=1 …` of
the `pristine-not-clean-could-not-evaluate` case). Restating 2 would be false; the residual finding is an instrument
misread, recorded as lesson round-30 M8.

## Round 31 — corrections (append-only; each cites the stale line in its own document)

The round-31 v2 of the calibration counter adds eight self-test cases; the tallies stated above for it are superseded here.

- `scripts/check-selfassessment.mjs` `--selftest` (30/30): correction — supersedes the stale tallies at `SCORECARD.md:1439`, `SCORECARD.md:1465` and `SCORECARD.md:1486` (each true at the round-30 tip, 22 cases, or superseded there by a 22-case correction).

## Round 31 — correction to the round-30 disposition (append-only; cites the stale line in its own document)

- `SCORECARD.md:1523`: correction — that row states `check-selfassessment` read mismatches 0 after the round-30 corrections above. The committed readings are 3 at `0ffc6ea0` and a residual of 1 at `d3cd62a1` (`.ufo/waves/round-30/measure/noharm-at-0ffc6ea.txt` line 130; `.ufo/waves/round-30/measure/noharm-at-d3cd62a.txt` line 1; `corpus/lessons/round-30-verifier-spotcheck.md` §Routed defects 1). The residual was an instrument misread, not a difference in lane state: at `d3cd62a1` the single finding is the round-30 gate-mutants figure at `SCORECARD.md:1527`, read as claimed 12 against an observed 2, because the counter took the first `cases` token in the output and a per-case refusal message inside that gate's self-test carried its own two-case tally, shadowing the gate's summary line (round-30 lesson M8). The round-31 v2 reads the `<NAME>_SELFTEST` summary line; this paragraph records the round-30 measurement as it stood, and the 0 in the row above is not evidence that the residual was 0.

## Round 31 — declared claims (frozen before data) and executed disposition

Baseline `96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc`; claims, counters and controls frozen in
`9505a10eb80b2a0b273ebaba3f7f872ad302192d` (`.ufo/waves/round-31/claims.json`, receipts `.ufo/waves/round-31/baseline/`).
Attempt 2 (attempt 1's L1 died in the host crash after landing `48604835`; salvage `ae15a37e`). Axes at round start:
depth 8, coverage 9, operability 9, freshness 9, calibration 9, adjacency 8; lowest tie at 8 — C1 works depth.
Saturation 8 / window 3; nudge inactive; no axis retired. After-measurements in a clean checkout of the measured
revision, raw outputs in `.ufo/waves/round-31/measure/` (the measured revision is named in the report).

| Claim / axis | Counting command | Before → after | Verdict / score |
|---|---|---|---|
| C1 depth (sourced: S119, S121, S122 opened this round) | `node scripts/check-decision-table.mjs --rev <REV> --baseline 96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc --entry corpus/knowledge/rate-signal-decision-table.md --live --json` (frozen sha256 `d15f3bd7…f6832`) | population 0 → 13, admitted 0 → 13, failing 0 → 0 (live) | met under the frozen rule; counter holes disclosed (lesson M10; a2w1 CritC1Verdict reads twelve distinct sourced thresholds, ten at the harshest reading); depth 8 → 9 (the lane's first decision table whose every row carries the source's own number, against signal vocabulary only before) |
| C2 calibration | `node scripts/check-selfassessment.mjs --rev <REV> --json` (frozen sha256 `143d66ff…2fce`) plus numstat of SKILL.md, corpus/README.md, SCORECARD.md, LOG.md from the freeze | mismatches 9 → 0; deleted lines 0 | met under the frozen rule; window holes disclosed (word numerals, `cli_cases=`, failed-summary reading — lesson M7, M11); calibration 9 → 9 (two more self-description documents now counted; score held, holes remain) |
| coverage, operability, freshness, adjacency | — | no claim | unchanged; no-harm matrix `.ufo/waves/round-31/a2w1/ExecNoHarmTip.md` and the L1 re-run in `measure/` (no gate green at the freeze and red at the tip) |

Gate registry: one new gate (`decision-table`) and one revised (`selfassessment` v2) carry rows in SKILL.md's round-31
section; `node scripts/check-gate-registry.mjs --rev <REV>` reports nonconformant 0.

### Round 31 — waves and seats

Two v1 waves. W1 build + first falsifiers (attempt 1), 32 seats (9 executor, 9 scribe, 5 critic, 3 reviewer,
2 connector, 2 mutation-tester, 1 scout, 1 sentinel); a2w1 falsify (attempt 2, the abandoned w2 items redispatched
unchanged), 32 seats (9 critic, 9 executor, 7 reviewer, 2 mutation-tester, 2 connector, 2 scribe, 1 scout). Round
total 64; no residual call; dead seats 0. The L1 holds the canonical planner seat.

### Planned / saturation / retired — round 31

- planned: calibration — counter v3 for `check-selfassessment.mjs` (verdict-aware summary oracle, word-numeral and
  `<name>_cases=` tallies, paragraph-bound corrections), with the a2w1 RevQuality and MutC2Corrections red states as
  regression cases.
- planned: depth — decision-table counter v2 (distinct source-quote pairs, unit and bound word located in the quote,
  hermetic `--live`), and a superseding S119 row for the publication month; the 27 carried errata in
  `.ufo/waves/round-31/a2w1/ScribeErrata/errata.md` are the intake.
- capabilities unchanged; saturation 8 / window 3; no axis retired.

## Round 32 — corrections (append-only; each cites the stale line in its own document)

Measured at the round-32 freeze `4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6` by the frozen v3 calibration counter
(`.ufo/waves/round-32/baseline/c2-J1-do-nothing.json`); the stale lines stay as written, these lines supersede them.

- `scripts/check-selfassessment.mjs` `--selftest` (41/41): correction — supersedes the stale tallies at `SCORECARD.md:1439`, `SCORECARD.md:1465`, `SCORECARD.md:1486` and `SCORECARD.md:1564`; v3 adds eleven cases (the m4 nudge-state class and the failed-self-test refusal), so the 17, 22, 22 and 30 figures those lines state are each an earlier tip's count. The gate prints `SELFASSESSMENT_SELFTEST verdict=clean cases=41 passed=41` (`.ufo/waves/round-32/baseline/c2-counter-selftest.txt`).

Correction — supersedes the round-29 stagnation-nudge statement at `SCORECARD.md:1473`: the nudge was active. The same
round group reads every axis at or above the saturation line at round start (depth 8, coverage 9, operability 8,
freshness 8, calibration 9, adjacency 8 — `SCORECARD.md:1472`) with saturation 8 / window 3, and no capability entered
the table in the window (rounds 26–28; the table's last entries are round 25, `SCORECARD.md:1306` and `:1314`), so
`AXES.md` §The stagnation nudge derives active and the lowest-axis obligation was waived for round 29.

Correction — supersedes the round-30 stagnation-nudge statement at `SCORECARD.md:1515`: the nudge was active. The same
round group reads depth 8, coverage 9, operability 8, freshness 9, calibration 9, adjacency 8 at round start
(`SCORECARD.md:1514`), saturation 8 / window 3, and no capability entered in rounds 27–29.

Correction — supersedes the round-31 stagnation-nudge statement at `SCORECARD.md:1576`: the nudge was active. The same
round group reads depth 8, coverage 9, operability 9, freshness 9, calibration 9, adjacency 8 at round start
(`SCORECARD.md:1574-1575`), saturation 8 / window 3, and no capability entered in rounds 28–30. The round-31
`claims.json` reason "depth and adjacency sit at the line, not above it" narrows `AXES.md`'s "at or above"; that frozen
file is not edited (lesson round-32 M1).

Disclosure (round 32 wave 1, `.ufo/waves/round-32/w1/CritAxisCapability.md` F1): the derived state above depends on
which rows count as capability entries. Rounds 24–25 entered four gates as capability rows (`SCORECARD.md:1243`,
`:1249`, `:1306`, `:1314`); from round 27 the lane recorded the opposite rule — "gates are counters, not repertoire
rows" (`SCORECARD.md:1403-1404`, `:1427`) — and entered no later gate. The table as written (the input `AXES.md` binds)
has no entry after round 25, which is what the corrections above and the frozen counter read. Had the round-27 and
round-31 gates been entered under the round-24/25 practice, round 29's and round 30's statements would hold and round 31's
would still be false. The operative rule from round 32 on: a capability row names an operation the shokunin can run,
never a gate or counter; the round-24/25 gate rows stay as written.

## Round 32 — declared claims (frozen before data)

Baseline `d805d1d6132430118b206a848b85753ab35d1014`; counters landed in `2f8535c5b3015fc5730c1076cbe57d1dc29e4fee`, fixed
before the freeze in `5ad1fcbfbae947e56ed448c7d24af0632b534e80`; claims and controls frozen in
`4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6` (`.ufo/waves/round-32/claims.json`, receipts `.ufo/waves/round-32/baseline/`).
Axes at round start: depth 9, coverage 9, operability 9, freshness 9, calibration 9, adjacency 8; lowest non-retired axis
adjacency 8. Saturation 8 / window 3; stagnation nudge active — every axis sits at or above the line and no capability
entered the table in rounds 29–31 (last entries round 25), so the lowest-axis obligation is waived and C1 is a
frontier/capability move. No axis retired.

| Claim / axis | Counting command | Before | Target |
|---|---|---|---|
| C1 coverage + capability acquisition (sourced: S124, S125, S126 opened this round) | `node scripts/check-bidi-runtime.mjs --rev <REV> --baseline d805d1d6132430118b206a848b85753ab35d1014 --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --live --json` (frozen sha256 `2f25af5a…c393`) | population 0, admitted 0, exit 1 (entry absent) | admitted >= 14, failing 0 (live) |
| C2 calibration | `node scripts/check-selfassessment.mjs --rev <REV> --json` (frozen sha256 `77b5c8ed…c6a9`) plus numstat of SKILL.md, corpus/README.md, SCORECARD.md, LOG.md from the freeze | mismatches 18 (3 m4-nudge-state + 15 m1 stale tallies of the v3 gate itself) | mismatches 0, deleted lines 0 |

Command that shows C1's surface unmoved: the same counter at the baseline tree reads population 0, exit 1
(`.ufo/waves/round-32/baseline/c1-J1-do-nothing.json`), and the matrix's seventeen §2 rows read `locally measured: no`
(`corpus/knowledge/webdriver-bidi-capability-matrix.md:60-76`, unchanged bytes).

Registry rows for the two counters: `SKILL.md` §"Round 32 — registry rows for the BiDi runtime gate and self-assessment v3".
`scripts/check-bidi-runtime.mjs` `--selftest` (27/27).

### Capabilities — round 32

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| webdriver-bidi-runtime | Drive a WebDriver BiDi session on this host (chromium and chromedriver 154.0.8037.97, classic `webSocketUrl: true` handshake, headless, throwaway profile, `127.0.0.1` fixtures only) and record per-surface runtime evidence for sixteen of the seventeen matrix §2 rows (R16 has no BiDi command), with two cold runs bound by identical first-screenshot bytes | `scripts/bidi-loopback-round32.mjs`; `corpus/evidence/round-32/bidi/receipt.json`; `corpus/knowledge/webdriver-bidi-runtime-round-32.md`; demonstration = the round report's measured C1 run | 32 |

The row names the transport operation the shokunin runs, not the gate that checks it (QUALITY criterion 84).

## Round 32 — executed disposition

Measured in a clean checkout of the lane revision named in the round report (raw outputs `.ufo/waves/round-32/measure/`,
`provenance-*.txt` names the revision and the frozen digests). The pre-integration reading at `b234a589` gave the same
counts (w2 RerunC1Live, RerunC2).

| Claim / axis | Counting command | Before → after | Verdict / score |
|---|---|---|---|
| C1 coverage + capability | `node scripts/check-bidi-runtime.mjs --rev <REV> --baseline d805d1d6132430118b206a848b85753ab35d1014 --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --live --json` | population 0 → 16, admitted 0 → 16, failing 0, binding null (live) | met under the frozen rule; gate holes disclosed (lesson round-32 M2), plain distinct counts pass (`measure/c1-distinct-at-*.json`); coverage 9 → 9 (one frontier item docs-held → runtime-held; R16 has no BiDi command) |
| C2 calibration | `node scripts/check-selfassessment.mjs --rev <REV> --json` plus numstat of SKILL.md, corpus/README.md, SCORECARD.md, LOG.md from the freeze | mismatches 18 → 0 (m4 3 → 0); deleted lines 0 | met under the frozen rule; 15 of the 18 were induced by v3's own case growth (claims.json beforeComposition); instrument holes disclosed (lesson round-32 M6); calibration 9 → 9 |
| depth, operability, freshness, adjacency | — | no claim | unchanged; no-harm reading `measure/noharm-at-*.txt` (no gate green at the freeze and red at the tip) |

Capability entered: `webdriver-bidi-runtime` (round 32 table above), demonstrated by the measured C1 run.

### Round 32 — waves and seats

Two v1 waves. W1 build + first falsifiers, 36 seats (12 scribe, 8 executor, 5 critic, 3 reviewer, 3 connector,
2 scout, 2 mutation-tester, 1 sentinel); W2 falsify, 34 seats (18 critic, 6 reviewer, 3 executor, 3 mutation-tester,
2 connector, 1 scout, 1 sentinel). Round total 70; no residual call. The L1 holds the canonical planner seat.

### Planned / saturation / retired — round 32

- planned: operability — gate v2 for `check-bidi-runtime.mjs` (distinct row ids, distinct transcript digests, driver
  content unequal to the gate, splice detection, a selftest case per w1 MutC1 survivor; drop `--no-sandbox`; bypass the
  host launcher flags file).
- planned: calibration — counter v4 for `check-selfassessment.mjs` (m4 statement grammar and supersession bound to
  a real correction; the five w1 MutC2 selftest survivors as cases; word-numeral and `<name>_cases=` tallies).
- saturation 8 / window 3; the round-32 capability restarts the window (round 33 = position 1); no axis retired.

## Round 33 — declared claims (frozen before data)

Baseline `b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd`; claims, both counters, `measure.sh`, the control driver, the
52-line candidate list and every baseline receipt frozen in `e6b0a9074d434ccc307badd312ae7379d1193fea` before any
claim data (`.ufo/waves/round-33/claims.json`, receipts `.ufo/waves/round-33/baseline/`). Frozen counter bytes:
`.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs` sha256
`da59d157c29ce53781fcfb6159149504a185b890d923efc6eecfe22d4b2c6380`, `.ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs`
sha256 `51ace65fcece8e794b80afdb386638c755b3aa137297c33a34ffce7fb24e812b`, `.ufo/waves/round-33/baseline/controls.mjs`
sha256 `2d0cf8416a35c2440cc1b6478f90b0f7a6d8a3436d617ea3527b0b8f3f5a451e`,
`.ufo/waves/round-33/measure.sh` sha256 `ca6b830e1c9b685664da7db0ebb30674175c4c95f9fb11f8b2ce75a033784c7e`;
`scripts/check-adjacency.mjs` is pinned inside C1 at sha256
`4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac` and must not move at REV. Every
after-measurement runs `.ufo/waves/round-33/measure.sh <REV> <OUT> <FREEZE>` in a clean clone of the named lane
revision, the two counters taken from the FREEZE commit rather than the worktree (`claims.json:measurementRule`).

Axes at round start: depth 9, coverage 9, operability 9, freshness 9, calibration 9, adjacency 8. Lowest non-retired
axis adjacency 8 (unique). Saturation 8 / window 3; stagnation nudge inactive — the round-32 capability row
`webdriver-bidi-runtime` (`SCORECARD.md:1663`, first-working round 32) restarts the window, so round 33 is position 1
(`SCORECARD.md:1694`). The lowest-axis obligation binds: C1 works adjacency, and C2 is the round-32 routed
operability defect (BiDi gate v2), not a frontier/capability move. No capability row enters the table this round.

| Claim / axis | Counting command | Before | Target |
|---|---|---|---|
| C1 adjacency (lowest non-retired axis; surface `corpus/adjacency.tsv`, round-17 map of 10 verified rows, plus the new screen ledger `corpus/adjacency-screen.tsv`) | `c1-adjacency-sweep.mjs` + `jq` projection (verbatim below) | candidates 52, mapped 5, screened 0, unaccounted 47, newMapped 0, adjacency clean (rows 10, verified 10), predicate false, exit 1 (`baseline/measure-at-baseline/c1-at-b7d16fb.json`) | unaccounted 0 AND newMapped >= 4 AND check-adjacency clean at REV |
| C2 operability (round-32 routed defect 1: BiDi gate v2) | `c2-bidi-forgery-battery.mjs` + `jq` projection (verbatim below) | forgeriesAccepted 8 of 8 (F1–F8), honest H0/H1/H2 true at admitted 16 and failing 0, digestLiterals [], gate self-check exit 0, predicate false, exit 1 (`baseline/measure-at-baseline/c2-at-b7d16fb.json`) | forgeriesAccepted 0 with H0/H1/H2 true at admitted 16 and failing 0, gate self-check exit 0, digestLiterals [] |

Counting commands, verbatim (both take a 40-hex `--rev`; the scripted measurement adds
`--repo <clean clone> --fleet /home/vgpnk/Projects/shokunin` for C1 and `--repo <clean clone>` for C2):

```
node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs --rev <REV> --json | jq '{predicate,candidates,mapped,screened,unaccounted,newMapped,adjacency}'
node .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs --rev <REV> --json | jq '{predicate,honest,forgeriesAccepted,acceptedForgeries,selftest,digestLiterals}'
```

Command that shows each surface unmoved at the baseline: the same two counters at `b7d16fb8` read unaccounted 47 /
newMapped 0 (`.ufo/waves/round-33/baseline/c1-J1-do-nothing.json`) and forgeriesAccepted 8 of 8
(`.ufo/waves/round-33/baseline/c2-J1-do-nothing.json`), both exit 1, while `ADJACENCY verdict=clean rows=10
verified=10` already holds — the map's own gate is green with 47 of 52 sibling browser-domain lines unaccounted.

Controls, scored per claim before any claim data (`.ufo/waves/round-33/baseline/controls-summary.json`; seven controls,
all exit 1, each capture's `.provenance` naming its clone revision and tree, the driver byte-pinned in
`claims.json:frozenDigests`): c1-J2-screen-all — every unaccounted candidate screened `not-browser-sense` reaches
unaccounted 0 with newMapped 0; c1-J3-junk-rows — four split-declared rows on NON-candidate sibling lines leave
newMapped 0 although check-adjacency verifies all 14 rows, so quote verification is not overlap; c1-J4-mislabel-unnamed
— four split-declared rows on kake candidate lines whose quotes name neither side give mapped 9 and newMapped 0;
c2-J2-reject-all — a gate exiting 1 on every evaluation gives forgeriesAccepted 0 with H0/H1/H2 false;
c2-J3-whitelist — v1 plus an honest-digest whitelist gives forgeriesAccepted 0 and honest true but five digest literals
and a nonzero gate self-check.

Feasibility disclosed, in the frozen claim's own terms. C1: the counter cannot judge overlap semantics — four new rows
on candidate lines whose quotes name the other side reach newMapped 4 whatever their disposition is worth, and a
candidate screened with a wrong reason still counts as accounted; the semantic guard is wave 2 (one attack per new row
and per screen-reason group) and the closure spot-check. A contested-open row additionally needs a fleet L0 line
`tabi | round-33 | …` naming the sibling — seats draft such lines, only the L1 files them — and a split-declared or
refused-route row needs a `sibling_quote` containing `tabi` or a `tabi_quote` containing the sibling lane. C2: the
battery is finite — a gate can refuse F1–F8 by construction-specific tells and still admit a smarter forgery (a golden
transcript with real-shaped session ids and distinct bases); wave 2 builds new constructions against v2 and reports
survivors as limits, which do not change the frozen predicate, and the `--live` leg is outside the predicate (any
live-leg change v2 makes is no-harm evidence only).

Falsifiers on record. C1 is falsified by a candidate that is a real overlap and is screened, by a new row whose quote
does not name the other side (the counter refuses it), or by a row on a non-candidate (not counted). C2 is falsified by
any of F1–F8 still accepted, by an honest receipt refused, by a digest literal in the gate source, or by a nonzero gate
self-check.

Sources and routing: `claims.json` declares no source row for either claim's predicate; the frontier step opens SOURCES
rows S127+ this round (registry 126 at the baseline, `baseline/census-start.txt`: `SOURCES_GATE verdict=clean rows=126
tiers=A:111,B:6,C:9 findings=0`) to ground C2's session-provenance rule and its live-leg launch flags, and
`corpus/knowledge/bidi-runtime-gate-v2-round-33.md` cites them S127, S128 and S129. Routed round-32 defects:
`corpus/lessons/round-32-verifier-spotcheck.md` §Routed defects 1 → C2, 2 → not claimed (`notClaimed`: calibration
counter v4), 3 → curation (S125 recheck cadence), 4 → named append-only correction mined as this round's mistake, 5 →
wave-1 errata intake, 6 → lesson round-33 records the M9 fix landed, 7 → the byte-pinned control driver plus
commit-and-tree provenance on every control receipt. The wave-2 precision errata at `corpus/lessons/round-32.md:179-187`
are dispositioned by the same intake (lesson round-33 §Errata intake). Assimilation: none (`claims.json:notClaimed`).

No-harm clause for the disposition (`claims.json:noHarmRule`): at REV every offline gate and self-check of
`.ufo/waves/round-33/measure.sh` that exits 0 at the baseline (28 of 28, `baseline/measure-at-baseline/noharm-at-b7d16fb.txt`)
still exits 0; `check-selfassessment` mismatches stay 0; census exits 0; and every prior-round prose byte of `SKILL.md`,
`SCORECARD.md`, `LOG.md`, `corpus/README.md`, `corpus/QUALITY.md`, `corpus/SOURCES.md` is append-only (deleted 0 from
the baseline). `scripts/check-bidi-runtime.mjs` is the one prior file C2 rewrites.

Round-33 disposition: the `## Round 33 — executed disposition` section below.

## Round 33 — corrections (append-only; each cites the stale line in its own document)

Measured at the round-33 freeze by the gate's own `--selftest` summary line; the stale line stays as written, this
line supersedes it.

- `scripts/check-bidi-runtime.mjs` `--selftest` (44/44): correction — supersedes the stale tally at
  `SCORECARD.md:1657`. That line states the figure 27, the v1 count at the round-32 freeze; v2 adds one case per
  frozen battery construction F1–F8 and one per round-32 surviving mutant M04, M06, M09, M10, M11, M14, M17, M18 and
  M19, and the gate prints `BIDI_RUNTIME_SELFTEST verdict=clean cases=44 passed=44` at the round-33 measured
  revision (`SKILL.md` round-33 registry section, same round).

Correction (round 33, named) — supersedes `.ufo/waves/round-32/claims.json:39`, claim C1's
`feasibilityDisclosed`: its closing clause, "it is not reachable without a committed receipt of two real
runs from a driver other than the counter", is false as written. `.ufo/waves/round-32/w1/CritC1Forgery.md`
records four constructions the frozen v1 gate admitted at exit zero, admitted sixteen, failing zero: two
`goldenLines` synthetic transcripts plus one real screenshot taken over CDP, with a two-line re-export as
the "driver" (`b858b5d`); one row id listed sixteen times (`e666174`); one real run's transcript path
cited twice (`7912a62`); two byte-identical copies of one run (`cee9539`). The same report's D2 shows
`admitted` counts table instances rather than distinct surfaces, so one distinct row reaches the target.
The frozen file stays as written (lesson round-32 M2). The operative reading is the plain distinct
counts in `corpus/evidence/round-32/bidi/receipt.json` beside QUALITY criterion 86, and round 33's C2
rebuilds the gate against these constructions — at the round-33 baseline the frozen battery scores every
forgery accepted (`.ufo/waves/round-33/baseline/c2-J1-do-nothing.json`).

Correction (round 33, named) — supersedes `.ufo/waves/round-33/claims.json` `notClaimed`'s assimilation reason, "the lane's quarantine-first round (hand-check of its absent-defect register slice) has not run": false as written. The 38-row slice was hand-checked in round 22 and re-opened row by row in round 27 (`corpus/lessons/round-27.md:30-39`; fleet `.ufo/l0-questions.md:165`). Round 33 takes no `merge/tabi/` theme because none touches the adjacency map or the BiDi gate (w1 ScoutAssimilation). The frozen file stays as written (lesson round-33 M4).

- `scripts/check-bidi-runtime.mjs` `--selftest` (44/44): correction — supersedes the stale tally at `SCORECARD.md:1657` (a one-line restatement of the wrapped round-33 correction above: in this document the calibration counter reads a correction and its citation on one line; L1 measurement at `bf48b81c`, `.ufo/waves/round-33/measure/selfassessment-at-bf48b81.json`, mismatches 1).

## Round 33 — wave-2 corrections (append-only; each cites the stale line in its own document)

Correction — supersedes `SCORECARD.md:1699` ("every baseline receipt frozen in `e6b0a907…`"): the counters, controls,
control receipts, `claims.json`, the candidate list and `baseline/census-start.txt` landed in the freeze commit; the
seven `baseline/measure-at-baseline/` receipts were measured after the freeze with the frozen counter bytes and committed
in `bf48b81c` (w2 CritCorrections a). Their readings equal the frozen controls' do-nothing receipts.

Correction — supersedes `SCORECARD.md:1781`: the figure 44 is the v2 gate's own `--selftest` summary at the round-33
integration revision, not at the freeze, where the gate was still v1 (w2 CritCorrections b).

Correction — supersedes `SCORECARD.md:1762`: `baseline/census-start.txt` carries the census validator output (`tabi ok`,
exit 0); the `SOURCES_GATE … rows=126` line is in `baseline/measure-at-baseline/noharm-at-b7d16fb.txt` (w2 CritCorrections d).

## Round 33 — executed disposition

Measured at `0aa2281a4fe3df3d0e6d07f4cde6935e75de1fb7` in a clean clone with the frozen counter bytes taken from the freeze commit (raw outputs
`.ufo/waves/round-33/measure/*-at-0aa2281*`, `provenance-0aa2281.txt`: porcelain 0, both counter digests equal
`claims.json` frozenDigests, `scripts/check-adjacency.mjs` equal to the pinned digest).

| Claim / axis | Counting command | Before → after | Verdict / score |
|---|---|---|---|
| C1 adjacency | `node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs --rev <REV> --json` | candidates 52; mapped 5 → 8, screened 0 → 44, unaccounted 47 → 0, newMapped 0 → 3, adjacency clean (rows 10 → 13); predicate false | **not met** — target newMapped >= 4 missed. The integration `bf48b81c` read newMapped 4, but wave 2 showed the fourth row (kake:347, crawl budget) re-keys the mapped crawler split, and it was withdrawn (lesson round-33 M6). Three real new kake boundaries landed and every sweep line is accounted for; adjacency 8 → 8 |
| C2 operability | `node .ufo/waves/round-33/counters/c2-bidi-forgery-battery.mjs --rev <REV> --json` | forgeriesAccepted 8 → 0 of 8; honest H0/H1/H2 true → true (population 17, admitted 16, failing 0); selftest 27 → 44 cases, exit 0; digestLiterals [] → [] | **met** under the frozen rule; the predicate alone is satisfiable by a stub keyed on the battery's commit subjects (lesson M7), and v2's per-variant reason ids (w2 RevGateV2Code) carry the "refuses by rule" reading; survivors recorded as limits (v2 note §8; w2 MutGateV2 11 of 20 mutants survive both detectors); operability 9 → 9 |
| depth, coverage, freshness, calibration | — | no claim | unchanged; no-harm `measure/noharm-at-0aa2281.txt` 28 of 28 exit 0 (baseline 28 of 28), `check-selfassessment` mismatches 0; `measure/numstat-at-0aa2281.txt` deletes 0 lines outside the BiDi gate, the one file C2 rewrites (481 lines added, 113 removed) |

Live leg (no-harm only): `measure/c2-live-at-0aa2281.json` population 17, admitted 16, failing 0, binding null, exit 0,
real binary, no `--no-sandbox`, throwaway HOME and XDG dirs.

Capabilities: none entered (a gate is not a repertoire row, criterion 84).

### Round 33 — waves and seats

Two v1 waves. W1 build + first falsifiers, 36 seats (18 scribe, 5 critic, 4 executor, 3 connector, 2 reviewer,
2 mutation-tester, 1 sentinel, 1 scout); W2 falsify, 38 seats (21 critic, 6 reviewer, 5 executor, 2 mutation-tester,
2 connector, 1 scout, 1 sentinel). Round total 74; no residual call; dead seats 0 (w1 36 of 36 outputs; w2 38 reports).
The L1 holds the canonical planner seat.

### Planned / saturation / retired — round 33

- planned: adjacency — re-run the sweep with the regex blind spots fixed and sibling `SKILL.md`/knowledge in scope
  (w1 ConnSiblingScan: 34 overlaps outside `PROVINCE.md` — kasegi CDP 9222, kumitate webbridge, kama CDP pins, kaidoku
  Playwright/a11y), with L0 questions for contested ones; the target counts boundaries, not surface strings.
- planned: operability — battery v2 with randomised subjects, paths and ids, plus the w2 MutGateV2 survivors and the
  CritForgeV2B/C constructions as cases; calibration counter v4 still carried.
- saturation 8 / window 3; no capability entered at round 33 (window position 2 at round 34); no axis retired.

- `scripts/check-adjacency.mjs` `--self-test` (57/57): correction — supersedes the tally reading at `SCORECARD.md:1829`, where the calibration counter attributes that row's self-test figure (the BiDi gate's, stated in the round-33 corrections above) to this gate; this gate was not changed in round 33 (digest pinned inside the C1 counter).

## Round 34 — declared claims (frozen before data)

Baseline `15dfaccb34601c2d221c78501e2befd8998d600c`; claims, both counters, `measure.sh`, the control driver, the
67-line candidate list, the sibling pins and every control receipt are frozen in the round-34 freeze commit before
any claim data (`.ufo/waves/round-34/claims.json`, receipts `.ufo/waves/round-34/baseline/`). Frozen counter bytes
(sha256 in `claims.json:frozenDigests`): `.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs`,
`.ufo/waves/round-34/counters/c2-gate-mutants.mjs`, `.ufo/waves/round-34/baseline/controls.mjs`,
`.ufo/waves/round-34/measure.sh`. Every after-measurement runs `measure.sh <REV> <OUT> <FREEZE>` in a clean clone,
counters taken from the freeze commit.

Axes at round start: depth 9, coverage 9, operability 9, freshness 9, calibration 9, adjacency 8. Lowest non-retired
axis adjacency 8 (unique). Saturation 8 / window 3; window position 2 at round 34 (`SCORECARD.md:1851`), stagnation
nudge inactive; the lowest-axis obligation binds and C1 works adjacency.

| Claim / axis | Counting command | Before | Target |
|---|---|---|---|
| C1 adjacency (surface `corpus/adjacency.tsv` + new ledger `corpus/adjacency-screen-skill.tsv`, against sibling ground outside `PROVINCE.md`) | `node .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs --rev <REV> --json` | candidates 67 (set A 38 lines naming tabi in sibling `SKILL.md`/`corpus/knowledge`, set B 29 round-33 ConnSiblingScan leads), mapped 1, screened 0, unaccounted 66, newMapped 0, adjacency clean 13/13, predicate false (`baseline/c1-J1-do-nothing.json`) | unaccounted 0 AND newMapped >= 3 AND adjacency clean; a new row counts only with a NEW tabi-side declaration line naming the sibling |
| C2 operability, sourced (surface: the self-test of `scripts/check-bidi-runtime.mjs`) | `node .ufo/waves/round-34/counters/c2-gate-mutants.mjs --rev <REV> --json` | of the 20 frozen round-33 MutGateV2 mutants the gate's own self-test kills 8; survivors M01 M03 M04 M05 M06 M07 M08 M09 M10 M16 M18 M19; neutral, decoy and twin probes exit 0; round-33 battery predicate true; predicate false (`baseline/c2-J1-do-nothing.json`) | survivors 0 of 20 by the self-test alone, with pristine, neutral, decoy and every twin exit 0, no mutant unappliable, round-33 battery still true |

Controls, scored before any claim data (`.ufo/waves/round-34/baseline/controls-summary.json`, nine receipts, all exit 1
with predicate false): C1 screen-all (unaccounted 0, newMapped 0); junk rows on non-candidate lines (newMapped 0);
rows on tabi-naming candidate lines whose tabi side is an EXISTING tabi line naming the sibling (mapped 5, newMapped 0
— the new-declaration clause refuses it); rows on lines that do not name tabi (newMapped 0). C2 self-hash self-test
(kills 20, fails the neutral, decoy and twin probes); find-presence sniff (kills 20, fails all 20 twins); reject-all
production path (battery false).

Feasibility disclosed (`claims.json`): C1's counter cannot judge overlap semantics — wave 2 attacks each new row and
each screen-reason group; C2's probes do not refuse a self-test that sniffs a whitespace-normalised find text — wave 2
reads the self-test code. Not claimed: calibration counter v4, battery v2, decision-table counter v2.

## Round 34 — corrections (append-only; each cites the stale line in its own document)

The BiDi gate self-test grows from 44 to 56 cases in round 34 (twelve kill cases, lesson round-34 §C2); each stale tally stays as written and the line below supersedes it.

- `scripts/check-bidi-runtime.mjs` `--selftest` (56/56): correction — supersedes the stale tally at `SCORECARD.md:1657` (round-34 kill cases added).
- `scripts/check-bidi-runtime.mjs` `--selftest` (56/56): correction — supersedes the stale tally at `SCORECARD.md:1784` (round-34 kill cases added).
- `scripts/check-bidi-runtime.mjs` `--selftest` (56/56): correction — supersedes the stale tally at `SCORECARD.md:1787` (round-34 kill cases added).
- `scripts/check-bidi-runtime.mjs` `--selftest` (56/56): correction — supersedes the stale tally at `SCORECARD.md:1805` (round-34 kill cases added).

## Round 34 — executed disposition

Measured at `b44b964d1044996ed08f1079916592065dee3094` in a clean clone with the frozen counter bytes taken from the freeze commit `59f1b47aae277e1670e4a824173da8cde7e388ee`
(raw outputs `.ufo/waves/round-34/measure/*-at-b44b964*`; `provenance-b44b964.txt`: porcelain 0, both counter digests
equal `claims.json` frozenDigests, `scripts/check-adjacency.mjs` equal to the pinned digest, gate git mode 100755).

| Claim / axis | Counting command | Before → after | Verdict / score |
|---|---|---|---|
| C1 adjacency | `node .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs --rev <REV> --json` | candidates 67; mapped 1 → 4, screened 0 → 63, unaccounted 66 → 0, newMapped 0 → 1, adjacency clean (rows 13 → 16); predicate false | **not met** — target newMapped >= 3 missed. The w1 integration `04f9623d` read newMapped 4; wave 2 withdrew rows 15 (re-key of row 12), 17 (kotoba census, no sibling-side split) and 18 (a refusal routed nowhere) — lesson round-34 M5, QUALITY 97. One new boundary (kake lab-performance-tool-runs) and two restored kaidoku rows (not counted: their quotes do not name tabi) landed; every one of the 67 lines is accounted. Adjacency 8 → 8 |
| C2 operability (sourced: S130, S131, S132) | `node .ufo/waves/round-34/counters/c2-gate-mutants.mjs --rev <REV> --json` | mutants killed by the gate's own self-test 8 → 20 of 20; survivors 12 → 0; unappliable 0 → 0; twins failing 0 → 0; pristine/neutral/decoy exit 0 → 0; round-33 battery true → true | **met** under the frozen rule; three kills (M04 M05 M06) rest on the printed finding detail (w2 MutDetailAssert); the counter's residuals (a whitespace-normalised self-sniff, 9 of 10 counter mutants unguarded by the controls, the symlink write path) are recorded limits, and w2 RevSelftestCodeRead found no added line that reads the gate's own bytes. Operability 9 → 9 |
| depth, coverage, freshness, calibration | — | no claim | unchanged; no-harm `measure/noharm-at-b44b964.txt` 28 of 28 exit 0 (baseline 28 of 28), `check-selfassessment` mismatches 0, round-33 C1 counter unaccounted 0 and screenFindings [], census exit 0; `measure/numstat-at-b44b964.txt` deletes 0 lines in the append-only files; `corpus/adjacency-screen.tsv` changes only its four relabelled rows (4 out, 4 in); the gate's 7 removed lines are self-test lines (no mutant find text moved) |

Capabilities: none entered (a self-test is not a repertoire row, criterion 84).

### Round 34 — waves and seats

Two v1 waves. W1 build + first falsifiers, 37 seats (18 scribe, 4 critic, 4 scout, 3 executor, 3 connector, 2 reviewer,
2 mutation-tester, 1 sentinel); W2 falsify, 39 seats (17 critic, 10 reviewer, 4 scout, 3 executor, 2 mutation-tester,
2 connector, 1 sentinel). Round total 76; no residual call; dead seats 0 (`w1-results.json` 37 of 37 outputs). The L1
holds the canonical planner seat; the planning data-walk rode w1 ConnRound.

### Planned / saturation / retired — round 34

- planned: adjacency — browser-ground lines in sibling knowledge that neither name tabi nor were round-33 leads (w2
  ConnSiblingDrift: no disposition-changing drift since the pins); a counter amendment that refuses a split row whose
  sibling line does not state the sibling's side (QUALITY 97) before any target is set.
- planned: operability — C2 counter amendment (symlink-safe write, scrubbed HOME, controls for the 9 unguarded counter
  clauses); CritForgeV2C witness-loop gap; calibration counter v4 still carried; S125 recheck `on-release` proposal.
- saturation 8 / window 3; no capability entered at round 34 (window position 3 at round 35); no axis retired.

## Round 35 — declared claims (frozen before data)

Baseline `2d2c8a77428f9c95c3cd0eb4a3bbf0c6fb4ab684`; claims, both counters, `measure.sh`, the control driver, the
383-line candidate list, the sibling pins, the C2 instrument check and every control receipt are frozen in the round-35
freeze commit before any claim data (`.ufo/waves/round-35/claims.json`, receipts `.ufo/waves/round-35/baseline/`).
Frozen counter bytes (sha256 in `claims.json:frozenDigests`): `.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs`,
`.ufo/waves/round-35/counters/c2-firefox-bidi.mjs`, `.ufo/waves/round-35/baseline/controls.mjs`,
`.ufo/waves/round-35/measure.sh`. `scripts/check-adjacency.mjs` and `scripts/check-bidi-runtime.mjs` are pinned inside
the counters and must not move. Every after-measurement runs `measure.sh <REV> <OUT> <FREEZE>` in a clean clone.

Axes at round start: depth 9, coverage 9, operability 9, freshness 9, calibration 9, adjacency 8. Lowest non-retired
axis adjacency 8 (unique). Saturation 8 / window 3; window position 3 at round 35 (`SCORECARD.md:1922`): the window
(rounds 32–34) holds the round-32 capability row, so the stagnation nudge is inactive and C1 works adjacency.

| Claim / axis | Counting command | Before | Target |
|---|---|---|---|
| C1 adjacency (surface `corpus/adjacency.tsv` + new ledger `corpus/adjacency-screen-browser.tsv`, against browser ground siblings write without naming tabi) | `node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --rev <REV> --json` | candidates 383 (sibling `SKILL.md`/`corpus/knowledge` lines matching the frozen browser-ground regex, not naming tabi, not a round-34 candidate), mapped 0, screened 0, unaccounted 383, newMapped 0, adjacency clean 16/16, predicate false (`baseline/c1-J1-do-nothing.json`) | unaccounted 0 AND newMapped >= 2 AND adjacency clean; a new row counts only with a NEW tabi line naming the sibling and its file path (one per row), a sibling line no baseline row cites, no third-lane record path, and — for `split-declared` — a sibling quote carrying both browser ground and a side-stating word |
| C2 coverage + capability, sourced (surface: WebDriver BiDi runtime evidence on Firefox 158.0.1 / geckodriver 0.37.1) | `node .ufo/waves/round-35/counters/c2-firefox-bidi.mjs --rev <REV> --json` | entry absent: population 0, admitted 0, predicate false (`baseline/c2-J1-do-nothing.json`) | admitted 16 (every matrix row with a BiDi command), failing 0, binding null — each row's unchanged gate predicate holds on two committed Firefox runs and on the counter's own live Firefox session |

Controls, scored before any claim data (`.ufo/waves/round-35/baseline/controls-summary.json`): C1 screen-all
(unaccounted 0, newMapped 0); junk rows on non-candidate lines (newMapped 0); rows on an existing tabi line (n1);
split quotes without browser ground (n4); split quotes that state no side (n4); third-lane records (n3) — all exit 1.
**J8 reaches the C1 predicate** (two junk rows with their own junk tabi lines and side words, every other line screened):
the counter judges form, not overlap, so wave 2 attacks every new row and every screen-reason group and the kill rule
withdraws any row a finding defeats (`claims.json` C1 `feasibilityDisclosed`, `killRule`). C2 copied Chromium receipt
(t1), relabelled Chromium transcripts (t3 binding: first screenshot differs from the live Firefox session), one
transcript at two paths (t1), a driver importing the counter (t1) — all exit 1. Instrument check: the counter's own live
recorder holds all 16 predicates on two Firefox sessions with identical first screenshots
(`baseline/c2-instrument-check.json`).

Tool installs (operator authorization 2026-10-19, official channel "release binary into ~/.local"): Firefox 158.0.1
(`ftp.mozilla.org` tarball, sha256 `dce45470…eb41a` equal to the signed SHA256SUMS, signature Good by Mozilla key
`14F26682D0916CDD81E37B6D61B7B526D98F0353`) into `~/.local/opt/firefox-158.0.1` + `~/.local/bin/firefox`; geckodriver
0.37.1 (GitHub `mozilla/geckodriver` release, sha256 `e815130e…09f7e`; its `.asc` verifies Good but by a subkey Mozilla
marks revoked — recorded, not trusted beyond the HTTPS release) into `~/.local/bin`. Reason: C2's second engine.

## Round 35 — executed disposition

Measured at `8de96c2986979112d4161b1961949db3258c26e8` (the wave-2 integration) in a clean clone with the frozen counter bytes taken
from the freeze `a4bfef0f75027c915e715649950b1d46dcb33d83` (raw outputs `.ufo/waves/round-35/measure/*-at-8de96c2*`;
`provenance-8de96c2.txt`: porcelain 0, both counter digests equal `claims.json` frozenDigests, `scripts/check-adjacency.mjs`
and `scripts/check-bidi-runtime.mjs` equal their pins, Firefox `firefox-bin` sha256 `46e2c204…` and geckodriver sha256
`f831b7e6…` equal the install receipts — QUALITY 99).

| Claim / axis | Counting command | Before → after | Verdict / score |
|---|---|---|---|
| C1 adjacency | `node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --rev <REV> --json` | candidates 383; mapped 0 → 0, screened 0 → 383, unaccounted 383 → 0, newMapped 0 → 0, adjacency clean (16 rows); predicate false | **not met** — target newMapped >= 2 missed. Wave 1 drafted one row (kagi `SKILL.md:40`); wave 2 withdrew it (w2 CritRowKagiA against CritRowKagiB; recorded reversal) and eight attack seats found no screen that should map. Every one of the 383 lines is accounted. Adjacency 8 → 8 |
| C2 coverage + capability (sourced: S134–S141) | `node .ufo/waves/round-35/counters/c2-firefox-bidi.mjs --rev <REV> --json` | population 0 → 17, admitted 0 → 16, failing 0 → 0, unmeasured 0 → 1 (R16), binding null, live session Firefox 158.0.1 / geckodriver 0.37.1 with first screenshot `7a3ae6a9…`; predicate true | **met** under the declared sentence (admitted 16 = the declared `>= 16`; the counter's frozen threshold is 14 — lesson M1, QUALITY 98). Recorded limits: a byte-cloned second run with rewritten ids passes (w2 MutDriverReceipt M2); caller-named fake binaries pass (M4; this reading's binary digests are pinned in provenance); the counter's own live leg is not loopback-only (M3). Coverage 9 → 9 (a second engine moves the BiDi runtime evidence from one implementation to two) |
| depth, operability, freshness, calibration | — | no claim | unchanged; no-harm `measure/noharm-at-8de96c2.txt` 28 of 28 exit 0, `check-freshness --worktree` clean 34/34 (`measure/freshness-worktree-at-8de96c2.txt`; it was red at the w1 integration and repaired — lesson M5), `check-selfassessment` mismatches 0, round-33/34 C1 counters unaccounted 0 with screenFindings [], round-34 C2 counter killed 20, census exit 0 (`measure/census-end.txt`), `measure/numstat-at-8de96c2.txt` 0 deleted lines in the append-only files |

### Capabilities — round 35

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| webdriver-bidi-runtime-firefox | Drive a WebDriver BiDi session on Firefox 158.0.1 through geckodriver 0.37.1 on this host (classic `webSocketUrl: true` handshake, headless, throwaway profile under `--profile-root`, free `--websocket-port` never the 9222 default, `network.dns.disabled` + `network.trr.mode 5` so a run measured 0 non-loopback sockets, `127.0.0.1` fixtures only) and record per-surface runtime evidence for the sixteen matrix §2 rows that have a BiDi command, two cold runs bound by identical first-screenshot bytes | `scripts/bidi-firefox-loopback-round35.mjs`; `corpus/evidence/round-35/bidi-firefox/receipt.json`; `corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md`; egress sample w2 SentinelDriverEgress; demonstration = the measured C2 run above | 35 |

The row names the transport operation the shokunin runs, not the gate or counter that checks it (QUALITY 84); it is a
separate row from round 32's Chromium row because the operation (geckodriver launch, Marionette-brokered BiDi socket,
UUID identity grammar, DNS-off prefs) did not run on this host before this round (w2 CritCapabilityRow).

### Round 35 — waves and seats

Two v1 waves. W1 build + first falsifiers, 51 seats (35 scribe, 4 executor, 3 connector, 2 critic, 2 mutation-tester,
2 scout, 2 reviewer, 1 sentinel); W2 falsify, 34 seats (16 critic, 7 reviewer, 6 scout, 2 connector, 2 mutation-tester,
1 sentinel). Round total 85; no residual call; dead seats 0 (`w1-results.json` 51 of 51, `w2-results.json` 34 of 34
non-empty outputs). The L1 holds the canonical planner seat; the planning data-walk rode w1 ConnRound.

### Planned / saturation / retired — round 35

- planned: adjacency — split the claim meter (w2 ConnAdjacencySaturation): completeness (every sibling line on the
  lane's ground accounted, re-swept on sibling drift since the pins) and delta discovery (new rows only from sibling
  commits after the pins); no fixed newMapped quota on a closed pool.
- planned: operability — C2 counter amendment: threshold 16 with a boundary control (QUALITY 98), binary digests pinned
  (QUALITY 99), DNS-off prefs in its live leg (QUALITY 100), per-run content binding against cloned runs (w2
  MutDriverReceipt M2); a production-mode no-harm leg for every gate (QUALITY 101); S125 `on-release` with its four
  companion files; calibration counter v4 still carried.
- saturation 8 / window 3; the round-35 capability row `webdriver-bidi-runtime-firefox` restarts the window (round 36 =
  position 1); no axis retired.

## Round 36 — declared claims (frozen before data)

Freeze `2e7b7a8920bff47fae6f75c3d06e48e`; round-start baseline `11c64b96f357de106c30a71c5e21ca44a3eacdc0`. The frozen `claims.json` records axis scores at round start as adjacency 8 and operability 9; the L1 did not auto-increment a numeric score from a passing predicate.

| Claim / axis | Counting command | Before | Target |
|---|---|---|---|
| C1 adjacency, sourced via S142 (split meter: completeness + drift verification + delta discovery) | `node .ufo/waves/round-36/counters/c1-adjacency-sweep-v4.mjs --rev <REV> --repo <clean clone> --fleet /home/vgpnk/Projects/shokunin --json` | Baseline instrument absent; c1-J1 do-nothing with instrument reads `auditCoverage=0/307`, `auditMissing=307`, predicate false. | Predicate true at measured REV: closed 383-candidate pool accounted, 307 drift rows re-derived at the frozen delta heads, no drift/delta findings, empty delta pool. |
| C2 operability (amendment of the existing Firefox BiDi counter; no new capability) | `node .ufo/waves/round-36/counters/c2-firefox-bidi-v2.mjs --rev <REV> --repo <clean clone> --json` | v2 absent at round-start tip; the prior instrument is the round-35 v1 counter. | Predicate true at measured REV: no entry/receipt/binding findings, failing 0, admitted ≥16, fresh live Firefox session with non-loopback egress 0. |

Controls and feasibility receipts were frozen in `.ufo/waves/round-36/baseline/` before claim data. C1 J1 misses the no-ledger case; C1 J5 honest floor is reachable. C2 J1 re-admits the honest evidence; J3 is the 15-row boundary; J2/J4/J5 refuse the committed attack examples; J6 detects non-loopback egress when DNS-off prefs are dropped. No counter or claim bytes were amended after any seat scored.

Tool installs: none.

## Round 36 — executed disposition

Measured at `20a69e0ae33292a71504e40be326f1513cd5a81b` in a clean clone with counter bytes taken from the freeze `2e7b7a8920bff47fae6f75c3d06e48e37767099e` (`.ufo/waves/round-36/measure/`; provenance records porcelain 0 and both counter/gate digests equal their frozen pins).

| Claim / axis | Counting command | Before → after | Verdict / score |
|---|---|---|---|
| C1 adjacency | `node .ufo/waves/round-36/counters/c1-adjacency-sweep-v4.mjs --rev <REV> --repo <clean clone> --fleet /home/vgpnk/Projects/shokunin --json` | do-nothing audit coverage `0/307`, missing `307` → `307/307` audited; 383 candidates / 383 screened / unaccounted 0; drift 304 unchanged / 3 moved / 0 stale; delta 0; adjacency clean 16/16; predicate false → true | **met on the measured frozen inputs**; adjacency score held at 8 → 8 (measured metric improved; no rubric authorizes an automatic scalar bump). Residual input-binding and predicate-text findings are recorded in the lesson/report. |
| C2 operability | `node .ufo/waves/round-36/counters/c2-firefox-bidi-v2.mjs --rev <REV> --repo <clean clone> --json` | v2 absent at baseline → population 17, admitted 16, failing 0, unmeasured 1, binding null; Firefox 158.0.1 / geckodriver 0.37.1; live egress 0; predicate true | **met under the frozen counter predicate**; operability score held at 9 → 9 (the axis was already at its recorded ceiling; no new capability row). |

No-harm at the measured REV: 27/29 commands exit 0. The two nonzero commands (`check-frontier-admission` exit 1; `check-freshness --worktree --rev HEAD` exit 2 due its usage contract) reproduce at the round-start baseline, so neither is introduced by this round. All 18 gate self-tests exit 0; `check-selfassessment` reads mismatches 0. The release-pins gate is clean at population 24 / resolved 24 / holds 17. The full-lane sources census exits 0 with 20 pre-existing W04 warnings and `tabi ok`.

### Round 36 — waves and seats

Two v1 waves; the round contains **65 seats**. W1 build + first falsifiers: 33 seats (21 executor, 3 scribe, 2 critic, 2 mutation-tester, 2 reviewer, 1 connector, 1 scout, 1 sentinel), all 33 have reports. W2 falsify: 32 seats (15 reviewer, 5 critic, 5 mutation-tester, 5 executor, 1 connector, 1 sentinel); 28 have completed reports and 4 are incomplete/dead in the result evidence: `RevF1` (no report; final output stops at “Need only make the first mutation commit and generated-led…”), `RevC2b` (aborted: J4/J5 fixture and report incomplete), `MutC2b` (aborted: mutation battery still ongoing), and `ExecEgressLive` (no report; final output stops before its clean timing check). Those four do not supply verification credit. No residual call; round total 65. The L1 held the canonical planner seat; planning data-walk rode the connector/reviewer items. W2 attack roles are 25/32 seats (reviewer + critic + mutation-tester).

### Round 36 — capabilities / planned / saturation / retired

No new capability entered; preserve `webdriver-bidi-runtime-firefox` (the round remeasures its existing evidence, not a distinct operation). No axis retired; saturation remains 8 / window 3.

- Planned for round 37: adjacency counter amendment binding the frozen delta-pins digest and aligning the declared predicate with the counter; repair the frozen build tool’s kama pin and moved-note parsing before data; run the stale-class synthetic case. The round-36 out-of-band pins receipt protects only this measurement and is not the counter fix.
- Planned for round 37: operability hardening of C2 git reads (`GIT_NO_REPLACE_OBJECTS`, replace-ref evidence) and abnormal-exit process cleanup; specify whether receipt `observed` fields are display-only or bound.
- Planned for round 37: correct the frozen measurement harness’s relative `numstat` output path and its invalid `check-freshness` invocation; preserve the baseline frontier-admission exit as an unchanged pre-existing condition unless its owning evidence changes.

### Round 36 — trend verdicts

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | improved | New `corpus/knowledge/adjacency-drift-audit-r36.md` on previously unheld sibling-drift audit ground; source row S142 is mined and the note is indexed in `corpus/README.md`. |
| quality | improved | W2 `ExecDeltaLive` falsified the method entry's broad post-freeze wording; an append-only correction now distinguishes the frozen-pin measurement from live-tip re-derivation and records the 3 relocation-note shifts. |
| discernment | unchanged | No outside non-author admit/reject spot-check at lane filing; w1/w2 seats were dispatched by the lane and do not qualify. |

## Round 37 — declared claims (frozen before data)

Freeze `99437d29de036415a9f2d0524343617a3b19988a`; round-start baseline
`ed8ccfc00ad3784bc424aa118e056f8edf4ee803`. The frozen `claims.json` records axis scores
at round start: adjacency 8 (lowest non-retired), operability 9, all others 9; saturation
8 / window 3. The round executes the eight round-36 closure routed defects as two
instrument-repair claims; both predicates are one byte-identical sentence across
claims.json, the counter constant and the counter header (round-36 routed defect 4).

| Claim / axis | Counting command | Before | Target |
|---|---|---|---|
| C1 adjacency — counter amendment v5 (pins digest binding; canonical moved-note parse; sentence discipline; build tool v2) | `node .ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs --rev <REV> --repo <clean clone> --fleet /home/vgpnk/Projects/shokunin --json` | v4 admits semantically-identical UNFROZEN pins (c1r37-J1: exit 0, predicate true) and refuses a truthful decoy-token moved note (c1r37-J2: exit 1); the frozen build tool's kama pin is 39 hex; the enforced predicate is not one byte-identical sentence | Predicate true at measured REV AND v5 refuses the reordered-pins fixture (exit 2, digest mismatch) AND v5 admits the decoy-note fixture (exit 0) AND the sentence is byte-identical at its three sites AND c1-drift-audit-build-v2.mjs resolves every PINS entry |
| C2 operability — counter amendment v3 (replace-ref refusal; teardown survivors; observed binding) + harness v2 | `node .ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs --rev <REV> --repo <clean clone> --json` | v2 admits an honest-tree clone whose receipt blob is grafted via refs/replace (c2r37-J1: exit 0, predicate true) and admits an observed-decoration tamper (c2r37-J2: exit 0); no survivor check; harness wrote numstat to a stale path and invoked check-freshness outside its usage contract | Predicate true at measured REV (admitted ≥ 16, survivors 0, egress 0) AND v3 refuses the replace-graft clone (exit 2) AND v3 receipt-finds the observed-tamper fixture (exit 1) AND the sentence is byte-identical at its three sites AND measure.sh v2 runs numstat + check-freshness per contract |

Controls and feasibility receipts were frozen in `.ufo/waves/round-37/baseline/` before
claim data; the do-nothing receipts (v4/v2 against the attack fixtures) show the frozen
targets are unreachable without the amendments. Tool installs: none.

## Round 37 — executed disposition

Measured at the round's integration tip in a clean clone with counter bytes taken from the
freeze `99437d29de036415a9f2d0524343617a3b19988a` (`.ufo/waves/round-37/measure/`;
provenance records porcelain 0 and counter digests equal to the frozen pins).

| Claim / axis | Counting command | Before → after | Verdict / score |
|---|---|---|---|
| C1 adjacency | `node .ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs --rev <REV> --repo <clean clone> --fleet /home/vgpnk/Projects/shokunin --json` | v4: admits unfrozen pins / refuses truthful decoy note / 39-hex kama pin / sentence mismatch → v5 at measured REV: predicate true on the honest state; pins digest bound (`81019362…`); reordered-pins fixture refused exit 2; decoy-note fixture admitted exit 0; build tool v2 regenerates the ledger byte-identical with every PINS entry resolving; one sentence byte-identical at three sites | **met under the frozen counter predicate**; adjacency score held at 8 → 8 (the metric moved; no rubric authorizes an automatic scalar bump — same discipline as rounds 35–36) |
| C2 operability | `node .ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs --rev <REV> --repo <clean clone> --json` | v2: admits the replace-graft clone and the observed-tamper receipt (both exit 0) → v3 at measured REV: predicate true on the honest state (admitted 16, failing 0, survivors 0, egress 0); replace-graft refused exit 2; observed-tamper receipt-found exit 1; harness v2 numstat + freshness legs per contract | **met under the frozen counter predicate**; operability score held at 9 → 9 (recorded ceiling; the amendment hardens the instrument that carries the capability evidence) |

### Round 37 — waves and seats

Two v1 waves; the round contains **68 seats** (w1 34 + w2 34; see the report for the
settled counts, role mix and any dead/incomplete seats — this block is completed at
integration and never pads).

### Round 37 — capabilities / planned / saturation / retired

No new capability row; the round remeasures and hardens the instruments behind
`webdriver-bidi-runtime-firefox` (round 35). No axis retired; saturation stays 8 / window 3.

- Planned for round 38: the survivors-mutation test gap (a mutant zeroing
  `rec.survivors` has no deterministic control — the term is honest-run-observable only;
  classify or build a fixture), the v5 list-mode pins read (LabratC1's display-only
  classification), and any w2-surviving limits named by the falsify wave.

### Round 37 — trend verdicts

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | unchanged | No new knowledge entry; the registry gains one row (S143) cited by the C2 counter — instrument ground, not new domain coverage. |
| quality | improved | All eight round-36 routed defects land as frozen amendments with red controls; the v4/v2 attack receipts (exit 0 on grafted/tampered inputs) become v5/v3 refusals (exit 2/1) on the same fixtures. |
| discernment | unchanged | No outside non-author admit/reject spot-check at lane filing; dispatched seats do not qualify. |

## Round 38 — corrections and capability candidate

- Round-37 verifier correction: the old scorecard wave block says 68 seats; round-37 w2 was not dispatched. The committed round-37 result object records 34 w1 seats. This append-only correction supersedes the old tally; it does not remove historical text.
- Claim C1 (calibration): round-37 routed defects D1–D6 are measured by `.ufo/waves/round-38/counters/c1-routed-defects.mjs`; measured at the final integration tip, predicate false (D4 and D6 findings remain).
- Claim C2 (coverage capability candidate): Playwright Firefox/Juggler loopback driver and receipt are retained, but the frozen claim is **not admitted** because the runtime evidence is not session-bound against the falsifiers; no capability row enters the table.
- Axis scores held; saturation 8 / window 3. Playwright 1.64.0 was already globally installed; Firefox 157.0 was installed from the official Playwright CLI browser channel. No pacman transaction.

## Round 39 — declared claims (frozen before data)

Round-start baseline `5bc56a81d196caeb8d24551928b883802697aabb`. C1's counter and
driver were frozen at `1f4260aeb3af186e84444cbb417a31b8a35bdb55`; C2's pre-data
amendment and final counter digest were frozen at
`9c09ebb1e2ff594c70ce72093b5d4133c1734dca`. The frozen predicate strings are in
`.ufo/waves/round-39/claims.json`. Saturation 8 / window 3; the stagnation nudge
waived the lowest-axis obligation because no capability entered in rounds 36–38,
and C1 was the frontier/capability move.

| Claim / axis | Counting command | Before | Target |
|---|---|---|---|
| C1 coverage — Playwright Firefox session-bound TCP observation | `node .ufo/waves/round-39/counters/c1-egress-session-bound.mjs --rev <REV> --repo <clean clone> --json` | Baseline `5bc56a81…`: exit 1, `receipt-absent`; v1 control refused. | Frozen C1 predicate true and a new capability row admitted. |
| C2 calibration — round-38 residuals D4/D6, round-39 counter v2 | `node .ufo/waves/round-39/counters/c2-routed-defects-v2.mjs --rev <REV> --repo <clean clone> --json` | Round-38/v1: exit 1, D4 mutant receipt absent and D6 numstat receipt absent; v1 does not test sentence identity. | Frozen C2 predicate true, with the executed sentence-mutant refusal and a reproducible baseline..REV numstat receipt. |

## Round 39 — executed disposition

Measured at candidate revision `75d0e6427bd00c9e702d69116768e670bd94427d` in a
clean shared clone; frozen counter bytes are those named above.

| Claim / axis | Counting command | Before → after | Verdict / score |
|---|---|---|---|
| C1 coverage | `node .ufo/waves/round-39/counters/c1-egress-session-bound.mjs --rev 75d0e6427bd00c9e702d69116768e670bd94427d --repo <clean clone> --json` | exit 1 / `receipt-absent` at baseline → frozen counter exit 0 / `predicate=true`, `controlRefused=true`; however the committed sample timestamps span only 799 ms and 701 ms (both < 1000 ms), while `coverageMs` includes close/tail time. The frozen predicate sentence is therefore not established by the counter's proxy. | **not met**; coverage score held 9 → 9. No capability row admitted. |
| C2 calibration | `node .ufo/waves/round-39/counters/c2-routed-defects-v2.mjs --rev 75d0e6427bd00c9e702d69116768e670bd94427d --repo <clean clone> --json` | v1 exit 1 with D4/D6 missing → v2 exit 1: D1–D5 and D7 re-derive (census 145 rows, A129/B7/C9, mined121/queued15/rejected9; mutant control exit 1); D6 `numstat-at-75d0e642.txt` absent at REV. The frozen D6 rule is self-referential: adding a receipt at REV changes REV (scratch probe `c2-self-reference-probe.txt`). | **not met**; calibration score held 9 → 9. |

No automatic scalar score follows from a passing counter; no numerical axis
score changed. The round does not admit because neither frozen claim is verified
as worded. The C1 receipt records a bounded host/build TCP observation, not
general egress; C2's exact frozen D6 target is not constructible as an ordinary
committed file.

### Round 39 — waves and seats

One v2 wave: 64 seats, one dispatch call, one result file, no residual call,
round total 64. Role counts: 17 reviewer, 12 critic, 8 mutation-tester, 9 scout,
7 executor, 6 scribe, 3 connector, 1 sentinel, 1 revenger. All 64 produced a
nonempty result; no seat was reported dead. L1 held the canonical planner seat;
cross-surface planning rode the three connector items. See
`.ufo/waves/round-39/w1-results.json` and `.ufo/waves/round-39/w1/`.

### Round 39 — capabilities / planned / saturation / retired

No capability entered: C1's weak counter returns met, but the independent sample
timeline shows both committed runs below the frozen 1000 ms sampled-window
condition, and additional counter/driver falsifiers remain open. No axis retired;
saturation remains 8 / window 3.

- Planned for round 40: re-freeze a TCP-only C1 predicate that requires observed
  sample span, both surfaces available, refreshed/identity-bound process
  ownership, and fail-closed cleanup; re-freeze C2 with a non-self-referential
  evidence-carrier protocol and controls that bind actual execution.
- Complete the remaining 13 quarantine rows before any package adoption; the
  source package remains closed. Obtain a fresh non-author admit/reject
  spot-check.

### Round 39 — trend verdicts

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | improved | New host-scoped TCP socket-observation note on previously unheld Playwright Firefox process/socket instrumentation, citing newly opened mined S145; the note explicitly limits the scope (`corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md`). |
| quality | improved | The `/proc` endian false count is corrected by a red→green receipt pair (12 false positives → 0); QUALITY criteria 102–103 and an append-only note correction preserve the measurement and D6 limits. No prior admitted entry was found false or stale this round. |
| discernment | unchanged | Admit/reject decisions exist, but no outside non-author spot-check was completed; dispatched seats remain the lane. |


## Round 40 — declared claim (frozen before wave data)

Baseline `a1b1e939048885d2793759b7f49b10c5c820d70d`; freeze `cb35339d81b425f486f9cb34a08111996be61b8a`.

| Claim / axis | Counting command | Before → target |
|---|---|---|
| C1 coverage capability — Playwright Firefox loopback TCP observation with actual sample-span and fail-closed socket evidence | `node .ufo/waves/round-40/counters/c1-sample-span.mjs <receipt.json>` | At baseline, round-39 receipt: exit 1 with schema and both `sample-span` findings (799 ms / 701 ms). Target: new round-40 receipt predicate true / exit 0; the old receipt remains refused. No numerical axis score changes without a later score rubric. |

Do-nothing control receipt: `.ufo/waves/round-40/controls/c1-round39-noop.json`; frozen predicate, counter digest and kill rule: `.ufo/waves/round-40/claims.json`. The claim is not admitted until independently falsified and measured at delivered revision.

Only C1 is declared this round. The planned C2 repair of the round-39 D6 self-reference is not claimed or amended; it remains an explicit open routed defect. The remaining package quarantine is hand-check-only until every row has lane-local source evidence; no adoption is authorized by this claim.

### Round 40 — pre-dispatch freeze amendment

The initial freeze `cb35339d81b425f486f9cb34a08111996be61b8a` is retained as history and superseded before any dispatch/data after its counter failed closed only on object absence, not the driver's explicit unavailable placeholder (`unavailable:true`, `ticks:0`, numeric `nonLoopback:0`). Amended C1 predicate additionally requires available ss/proc samples and final sweeps with positive observation ticks. Counter: `node .ufo/waves/round-40/counters/c1-sample-span-v2.mjs <receipt.json>`. The prior round-39 receipt remains refused; unavailable-surface counter selftest is 5/5. Revised claim digest and controls are at `.ufo/waves/round-40/claims.json` and `controls/c1-selftest-v2.json`. No seat has scored the claim.

Before dispatch, the selftest was strengthened to isolate the exact unavailable-placeholder change: on a synthetic positive fixture, the initial counter reports met for each of four `unavailable:true,ticks:0` mutations, while v2 rejects each by its named unavailable finding; positive v2 control passes. The 10/10 command receipt is `.ufo/waves/round-40/controls/c1-selftest-v2.json`. The earlier 5/5 run is superseded as a non-isolated selftest, not counted as fix proof.

### Round 40 — live measurement command amendment

The synthetic parser-positive could reach a green counter without running Firefox, so the operative counting command is now `node scripts/measure-c1-round40.mjs --out <fresh receipt> --scratch <dir>`; it launches the Firefox driver itself with two runs, a fresh invocation nonce, an exclusive output path, and then scores the produced receipt with counter v3. The pre-existing synthetic receipt control and nonce replay tests are `.ufo/waves/round-40/controls/c1-measure-selftest-v2.json` (7/7). The earlier parser-only synthetic pass is not a capability measurement. No seat has scored the claim.

Append-only correction to the initial round-40 table: the operative C1 predicate/counting command is the nonce-bound live measurement in `.ufo/waves/round-40/claims.json`, frozen at `07e99cf1e2f67c5679aa5ba1ccb19a8f59b228e4`. Its 64-seat validated spec/dispatch is frozen at `250a38056438dc62a8ddcfbdfcdc065bfab9a048`. The earlier direct-receipt command and parser-only synthetic positives are superseded pre-data evidence, not the claim.

## Round 40 — executed disposition

Measured command at integration evidence revision `22883df61d8deb55e03a1afebc81f7290c3a3cfc`:
`node scripts/measure-c1-round40.mjs --out corpus/evidence/round40/playwright-egress/receipt.json --scratch /fast/scratch/hyaku/tabi-r40/TabiR40a2/measure` → exit 0, C1 structural predicate true (run1/2 sample spans 1204/1202 ms; counter no findings). Measurement binding: `corpus/evidence/round40/measurement-binding.json`, count `c1_live_runs` 0→1. However the frozen no-op control is falsified by W1 `CritControlReach` F4-full: a `NODE_OPTIONS=--require` preload substitutes a receipt-producing shim and the same wrapper exits 0 with no Firefox launch. **C1 is unprovable/not admitted; coverage remains 9→9 held; no capability row.** No numerical score changed.

Stagnation line 8 / window 3 remains; no axis retired. The planned round-39 C2 D6 self-reference repair was not claimed. Keep the F4 environment-injection path, F1 zero-observation blind condition, and F3 stale process-tree ownership open; no freeze was amended after W1 data.

## Round 41 — declared disposition

Baseline `fecbdf0a3aa79ce17bce3ef7338f69112f604f88`; C1 (coverage capability) and C2 (depth) were frozen in `.ufo/waves/round-41/claims.json` at `8c32528dd3ab04b75739a077d60884c22a085129`.

| Claim / axis | Counting command | Before → observed result |
|---|---|---|
| C1 coverage capability — Firefox loopback TCP observation under a loader-clean measurement chain | `node scripts/measure-c1-round41.mjs --out corpus/evidence/round41/playwright-egress/receipt.json --scratch /fast/scratch/hyaku/tabi-r41/L1-final-measure/run` | Baseline tree contains no `corpus/evidence/round41` files (`.ufo/waves/round-41/controls/c1-baseline-noop.out`, exit 0). Live command at `8c84417652f7602886dcc85f74bffdadd9c3a281`: exit 0, counter predicate true, findings empty; two measured runs and witness are recorded. **Not admitted:** the required 64-seat wave remains queued with 0 spawned; no non-author review or WAVE-DONE. No capability row or score delta. |
| C2 depth — sourced environment-injection forgery-class entry | `node scripts/check-c2-knowledge-round41.mjs --root /home/vgpnk/Projects/shokunin/tabi-shokunin` | Baseline control exits 1 (`entry-absent`, `coverage-row-absent`, `registry-row:S146`, `registry-row:S147`); current checker exits 0. **Not admitted:** the required wave did not return; no non-author review or final no-harm gate. No score delta. |

The claims remain causally separate; neither is scored or admitted without the required independent review. No axis is numerically re-scored or retired. Round 41's wave is one validated policy-v2 wave of 64 seats, with 0/64 spawned at the last recorded scheduler state; the handoff is queued, not completed.

### Round 41 — trend verdicts

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | unchanged | C1/C2 artifacts exist, but no capability or knowledge admission is made before WAVE-DONE. |
| quality | unchanged | C1's live receipt and counter pass are recorded; the full falsification and no-harm review did not run. |
| discernment | unchanged | No non-author wave output or spot-check is available. |

## Round 42 — declared claims (frozen before data)

Fresh-start round (third consecutive rejected closure). The r39–r41 reports and the
round-41 verifier spot-check were read first; both claims are sized so a do-nothing
control cannot reach them. Freeze `9b6de3a19de11abdb80e82a1310abc64a40215bb`;
round-start baseline `34e177959d1b7ce04afb85a001420e02631ce79e`; axes at start
adjacency 8 (lowest), others 9; saturation 8 / window 3; no capability entered rounds
39–41 → the stagnation nudge waives the lowest-axis obligation and C1 is the
capability/frontier move. Predicates, kill rules and counting commands are in
`.ufo/waves/round-42/claims.json` (one sentence, three sites: claims.json, checker
header, checker code for C2).

| Claim / axis | Counting command | Before | Target |
|---|---|---|---|
| C1 coverage capability — Playwright Firefox loopback TCP observation admitted on committed bytes with a settled attack wave | `node scripts/measure-c1-round41.mjs --out corpus/evidence/round42/playwright-egress/receipt.json --scratch /fast/scratch/hyaku/tabi-r42/L1-measure/run` | At baseline: `git ls-tree -r --name-only 34e177959d1b7ce04afb85a001420e02631ce79e -- corpus/evidence/round42 \| wc -l` → 0 (`controls/c1-baseline-tree-count.txt`); committed r41 receipt replayed under a fresh nonce refused (`controls/c1-r41-replay-refused.json`, exit 1) | Frozen predicate true at a fresh nonce-bound live run (measured 2026-10-28: exit 0, spans 16,356/17,790 ms) AND receipt+witness committed at the measured revision AND battery all-pass AND r39/r40/r41 replays refuse AND the validated 64-seat wave settles with no do-nothing reach; then one capabilities-table row |
| C2 calibration — round-41 routed-defect ledger closure (verifier D1–D4) | `node .ufo/waves/round-42/counters/check-routed-defects-round42.mjs --rev <REV> --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json` | Baseline red control committed pre-data (`controls/c2-baseline-red.json`): exit 1, 7 findings (r1a/r1b receipt+witness uncommitted, S146 not rejected, no S148, baseline file empty, no quarantine TSV) | Checker exit 0 at the measured revision: D1 evidence committed + sha-bound to the committed r41 measure record; S148 supersedes S146 with a verbatim ≤25-word quote and S146 rejected; baseline control carries its command and the 0; 38-row re-adjudication TSV over committed evidence paths |

Do-nothing controls are the committed red states above; both are unreachable without
this round's work. Wave w1 (one policy-v2 wave, 64 seats, attack 23/64) was validated
and dispatched through the ready handoff at 12:20 -03 with the dispatch JSON carrying
`taskCall` (the r41 defect); results and dispositions land after WAVE-DONE. No
predicate is amended after any seat scores.

## Round 42 — executed disposition (both claims refused under the frozen rules; admission false)

Measured at integration revision `435b64c90406e46a0e3573a36744110420f862f4` (wave
results, TSV, lesson, QUALITY 104–105, registry flips, census end); final counter
receipts `.ufo/waves/round-42/controls/c2-final-r42.json`. Freeze `9b6de3a19de11abdb80e82a1310abc64a40215bb`
was never amended after seat data; baseline `34e177959d1b7ce04afb85a001420e02631ce79e`.

| Claim / axis | Counting command | Before → after | Verdict / score |
|---|---|---|---|
| C1 coverage capability | `node scripts/measure-c1-round41.mjs --out corpus/evidence/round42/playwright-egress/receipt.json --scratch /fast/scratch/hyaku/tabi-r42/L1-measure/run` | Baseline tree count 0 + r41-replay refusal → live run exit 0, predicate true, spans 16,356/17,790 ms, battery 6/6, replays refuse — then four seats (CritC1Reach, CritC1Witness, RevWitnessProbe, MutC1Counter) demonstrated the frozen counter greens nonce-relabeled committed receipts and fully synthetic receipt+witness pairs with zero browser runs | **not admitted — kill rule fired** (do-nothing reach); coverage held 9 → 9; no capability row; authenticity fix routed to r43 (QUALITY criterion 104) |
| C2 calibration | `node .ufo/waves/round-42/counters/check-routed-defects-round42.mjs --rev 435b64c90406e46a0e3573a36744110420f862f4 --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json` | Baseline red (7 findings) → exit 0, predicate true, findings [] at `435b64c` (D1–D4 closed in committed bytes; all 38 TSV evidence paths verified blobs) — but CritPredicateSentence/RevC2Freeze showed the counter accepts tree objects where the sentence says "committed blob", and CritC2Ledger V0 greens a self-consistent fabrication | **not met as worded** (counter-proxy defect + fabrication limb; exit 0 recorded as instrument pass, not admission); calibration held 9 → 9; blob check + pinned measure blob + verdict-probe routed to r43 |

The routed-defect VALUE is real and landed regardless of claim admission: r41
verifier defects D1–D4 are closed in committed bytes, each seat-verified
(`RevReceiptBytes`, `ExecQuoteVerify`, `ExecBaselineCount`, 38 fresh quarantine
verdicts with `RevQuarCross` 7/8 independent agreement). `check-sources.mjs` is
clean; `check-c2-knowledge-round41.mjs` is recorded red (frozen pins vs the routed
D2 fix — operator ruling requested; see lesson Mistakes 6).

### Round 42 — waves and seats

One policy-v2 wave `w1`: **64 seats, one dispatch, WAVE-DONE, zero dead seats, 64/64
nonempty reports with VERDICT lines (21 ok / 43 finding).** Role mix exact: scout 20,
mutation-tester 9, executor 9, reviewer 8, critic 6, scribe 5, connector 4, sentinel
1, simplifier 1, revenger 1; attack share 23/64 (35.9%). L1 held the canonical
planner seat. The orchestrator consumed the ready file manually after the inline
dispatcher stalled ~18 min (kama r61 precedent); dispatch JSON carried `taskCall`
(`ExecWaveAudit` verified — the r41 defect class did not recur). Round total 64; no
residual call. Evidence: `w1-results.json`, `w1-parse-summary.json`, `w1/<Seat>/`.

### Round 42 — capabilities / planned / saturation / retired

No capability row entered (C1 refused). No axis retired; saturation stays 8 / window 3.
The stagnation nudge remains active for round 43 (no capability entered rounds 39–42).

- Planned for round 43 (routed, from this round's seats): (1) C1 receipt authenticity
  — wrapper signs the receipt with a per-invocation key, public half pinned in
  claims.json; counter refuses unpinned `--pins` and substituted counter copies
  (criterion 104); (2) C2 hardening — `cat-file -t blob` before size floors, pinned
  measure blob id `8ff64d69…`, CritC2Ledger's verdict-probe (0/38 on V0); (3) the
  r41 standing-gate conflict (`check-c2-knowledge-round41` pins vs the routed D2
  fix) needs an operator ruling — file with the r27 L0 question; (4) RevC1Battery's
  gate vectors beyond the 18 named ones; (5) r43 claims must be re-frozen fresh —
  this round's instruments may not be widened post-data.

### Round 42 — trend verdicts

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | improved | New admitted note `corpus/knowledge/committed-bytes-verification-round-42.md` on ground the coverage map did not hold (committed-bytes verification instrument class), citing newly opened mined S149; S148 correction row added; coverage row appended. `ls corpus/knowledge/*.md \| wc -l` 58 → 59. |
| quality | improved | r41 verifier defects D1–D4 closed with red→green proofs (baseline red control → committed repairs, checker findings 7 → 0); S146 superseded by S148 (non-verbatim quote corrected); D3 control populated; no admitted entry failed a re-check; QUALITY criteria 104–105 added from observed failures. |
| discernment | unchanged | The 38-row re-adjudication and RevQuarCross's 7/8 independent agreement are lane-internal; the outside non-author admit/reject spot-check remains the closure's duty (pending as of filing). The S135 disagreement is captured as criterion 105 rather than smoothed. |

## Round 43 — declared claims (frozen before data)

Fresh-start round (fourth consecutive rejected closure r39–r42). The r39–r42 reports and the
round-40/41/42 verifier spot-checks were read before declaring; both claims are sized so a
do-nothing control cannot reach them, and every named control is committed with its sha256 and a
verbatim quote line in the freeze (`.ufo/waves/round-43/claims.json`, baseline
`ab592825cd195599822ca227f7768914df208201`). Axes at start: adjacency 8 (lowest), others 9;
saturation 8 / window 3; no capability entered rounds 39–42 → the stagnation nudge waives the
lowest-axis obligation and C1 is the frontier/capability move.

| Claim / axis | Counting command | Before | Target |
|---|---|---|---|
| C1 coverage capability (sourced: S150) — Playwright Firefox loopback TCP observation under a signature-authenticated chain | `node scripts/measure-c1-round43.mjs --out corpus/evidence/round43/playwright-egress/receipt.json --measure-out .ufo/waves/round-43/measure/c1-measure-r43.json --scratch /fast/scratch/hyaku/tabi-r43/L1-measure/run2` | Baseline tree count 0 (`controls/c1-baseline-tree-count.txt`); r42-receipt replay refused (`c1-replay-r42-refused.json`); synthetic self-signed pair refused (`c1-synthetic-refused.json`); tampered record refused (`c1-relabel-refused.json`); battery 7/7 (`c1-battery-r43.json`); first live attempt refused by its own counter (46 real egress findings, run-1 transient — remotes now recorded) | Frozen v5 predicate true at a fresh nonce (signature, witness attestation and counter challenge verified) AND receipt + witness + signed measure record committed at the measured revision AND battery all-pass AND replays refused AND the policy-v2 wave settled (≥64 seats, WAVE-DONE) with no in-model do-nothing reach |
| C2 calibration — round-42 routed-defect checker hardened (blob type via S151, pinned measure blob id, V0 refusal, freeze-binds-controls) | `node .ufo/waves/round-43/counters/check-routed-defects-round43.mjs --rev <REV> --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json` | Baseline red control `controls/c2-baseline-red-r43.json`: exit 1 (`r5-claims-absent`, `r6-probe-absent`); r42 checker bytes green the rebuilt V0 fabrication (exit 0, 0 findings) and name no type violation on the tree fixture (`c2-v0-probe.json`, `c2-tree-fixture.json`) | Checker exit 0 at the measured revision: r1–r4 re-derive, r5 bindings verify, r6 probe receipt refuses V0 with `r1-measure-blob-pin-mismatch`; any settled seat demonstration that a rule accepts what its sentence denies refuses the claim |

Residual model (C1, declared before data): harvesting a per-invocation private half requires a prior
honest chain run; rescoring a genuine prior pair re-proves that honest run only; process-memory and
kernel-level attacks stay out of scope (rounds 40–42); on-disk tampering of committed pins is caught
by committed-byte re-derivation at closure. In-model do-nothing reach = kill rule.

Pre-dispatch disclosures: the first live attempt (pre-freeze) was refused by the round's own counter
with 46 `*-egress` findings — one non-loopback owned socket late in run 1, absent by run 2; the
instrument was hardened before the freeze (driver/counter now record `nonLoopbackRemotes`; no
predicate loosened). Fixture/counter edits before any seat scored are reflected in the frozen
digests. No tool installs; no pacman transactions.

## Round 43 — executed disposition (both claims refused under the frozen rules; admission false)

Wave w1: one policy-v2 wave, 64/64 seats settled, 0 dead, 0 empty outputs; verdicts on
seat-written files 34 ok / 30 finding (`w1-results.json`, `w1-parse-summary.json`). Freeze
`7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc`; baseline `ab592825cd195599822ca227f7768914df208201`;
no predicate, kill rule or counter amended after any seat scored.

| Claim / axis | Counting command | Before → after | Verdict / score |
|---|---|---|---|
| C1 coverage capability | see declared table | live signature-authenticated run clean (exit 0, v5 predicate true, spans 18,588/25,649 ms, egress 0, challenge/attestation/signature verified) → four seats demonstrated in-model do-nothing reaches (self-signed pairs answering the counter's fresh challenge with the pair's own key — the wall authenticates key-possession against the record's self-selected pubkey, not chain provenance); `CritResidualModel` added the copied-counter reach | **not admitted — kill rule fired**; coverage held 9 → 9; no capability row; the instrument value is real (r42's relabel/synthetic/unpinned-pins/replay holes each now have a named refusal) and routes to r44 with the seats' own correction sketches |
| C2 calibration | see declared table | checker exit 0 / 0 findings at the freeze with the baseline red control reproducing exactly; every r42 hole closed and mutation-proven load-bearing → `CritFreezeBindings`/`CritFreezeAudit`/`CritPredC2` demonstrated r5 false-greens (5-of-8 binding set; substring quote; unpinned freeze) | **not met as worded — kill rule fired** on the forged-binding/quote-line limbs; calibration held 9 → 9; exit 0 recorded as instrument pass, not admission |

Sourced claim: C1 rested on S150 (opened 2026-10-29, re-opened byte-identical by `RevS150`);
`corpus/knowledge/receipt-authenticity-signing-round-43.md` landed (S150+S151 cited), README
coverage row appended. No numeric score changed; no axis retired; saturation stays 8 / window 3;
the stagnation nudge stays active for round 44 (no capability entered rounds 39–43).

### Round 43 — waves and seats

One policy-v2 wave `w1`: 64 seats, one dispatch through the ready handoff (dispatch JSON carried
`taskCall`; `ExecWaveAudit` verified — the r41 defect class excluded), WAVE-DONE received;
round total 64; no residual call. Role mix: critic 16, executor 16, mutation-tester 8, reviewer
6, scout 5, scribe 5, connector 4, sentinel 2, simplifier 1, revenger 1; attack share (reviewer+
critic+mutation-tester) 30/64 = 46.9% ≥ 25%. Dead seats 0. Evidence: `w1-results.json`,
`w1-parse-summary.json`, `w1/<Seat>/`. The L1 held the canonical planner seat; four connector
items carried the overlap/planning work.

### Round 43 — capabilities / planned / saturation / retired

No capability row entered (C1 refused). No axis retired. Planned for round 44 (routed, from this
round's seats): (1) C1 trust anchor not selected by the candidate measure record + supervised
pinned-wrapper execution binding + synthetic control re-cut to the challenge-answering class;
(2) two deterministic browser-free egress controls (plant non-zero → refuse; zeroed twin) for
the honest-run-observable egress clause (`MutDriverEgress`); (3) C2 r5 set-equality + line-quoted
quotes + claims.json blob pin + `b.path` type check; (4) Simplifier dead-code + ENV_ALLOW trim
and refuse() exit-code distinction as a pre-data amendment.

### Round 43 — trend verdicts

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | improved | New admitted note `corpus/knowledge/receipt-authenticity-signing-round-43.md` on ground the coverage map did not hold (receipt-authenticity instrument class), citing newly opened mined S150/S151; knowledge notes 59 → 60 (`ls corpus/knowledge/*.md \| wc -l`); registry 149 → 151. |
| quality | improved | The r42 routed defects closed in committed bytes with red controls (V0 fabrication now refused via the pinned blob id — the r42 checker bytes still green it; tree objects now named `r1a-not-a-blob`; freeze binds controls by sha256+quote); the wave's falsifiers then re-validated each closure (mutations load-bearing) and routed the NEXT defect class with false-green demonstrations; no admitted entry failed a re-check; QUALITY criteria 106–107 added from observed failures. |
| discernment | unchanged | The 64-seat wave is lane-internal (dispatched seats remain the lane); the outside non-author admit/reject spot-check is the closure's duty, pending at filing. The lane's own refusals of both claims under pre-declared kill rules are recorded, not smoothed. |


## Round 44 — declared claims (frozen before data) and executed disposition (all three verified)

Fresh-start round (fifth consecutive rejected closure r39-r43) on a NEW Windows host. The
r41-r43 rejected reports and the r43 non-author verifier spot-check were read before declaring;
what was ruled out and why is recorded in `.ufo/waves/round-44/claims.json` `freshStartNote`
(Firefox chain absent here; no wave dispatch surface; adjacency waived by the active nudge;
note-count claims do-nothing-reachable). Freeze `d3d31472` superseded PRE-DATA by amendment
`8c238799` (C2 runner teardown defect caught by the round's own counter; r40 precedent, disclosed);
measured at `844a5b3af07902f47751efcc61b02a90cd4d4c68`. Axes at start: adjacency 8 (lowest),
others 9; saturation 8 / window 3; no capability entered rounds 39-43, so the stagnation nudge
waived the lowest-axis obligation and C2 is the frontier/capability move. The 64-seat wave
obligation could not be met on this host (no dispatch surface; L0 filed, routed around; the
claims deliberately carry NO wave-settled clause - the predicates below are complete).

| Claim / axis | Counting command | Before -> after | Verdict / score |
|---|---|---|---|
| C1 calibration (routed defect 3; QUALITY 107) | `node .ufo/waves/round-44/counters/check-routed-defects-round44.mjs --rev 844a5b3a... --repo <lane> --json`; fixtures via `.ufo/waves/round-44/fixtures/build-r5-fixtures.mjs` (deterministic revs) | r43 bytes: drop3 FALSE GREEN exit 0, fragment FALSE GREEN exit 0, pathtype uncaught TypeError crash, honest exit 0 -> v2: honest exit 0 (no harm), drop3 exit 1 `r5-binding-set-missing`, fragment exit 1 `r5-binding-quote-not-whole-line`, pathtype exit 1 `r5-binding-path-type`; selftest 8/8 | **met** under the frozen rule; the blob pin `f3036d9e` refuses any rewritten r43 freeze; calibration held 9 -> 9 |
| C2 coverage capability (sourced: S152, S153) | `node scripts/chrome-cdp-loopback-round44.mjs --out corpus/evidence/round44/chrome-cdp/receipt.json --shot ... --scratch <dir>`; `node .ufo/waves/round-44/counters/chrome-cdp-receipt-r44.mjs <receipt> --shot <png> --runner <runner>` | baseline tree count 0 -> live run exit 0 (Chrome/156.0.8078.74, ws 127.0.0.1:51901, invocation-bound fixture nonce, PNG 7,908 B sha 4ee1806f), receipt+shot committed as explicit files, counter exit 0, repro run fresh nonces | **met** under the frozen rule; residual (receipt does not self-authenticate; Chrome-ness re-derived by re-running the committed runner) declared pre-data; coverage held 9 -> 9 |
| C3 operability (routed defects 1-2 deterministic halves) | `node .ufo/waves/round-44/counters/c1-anchor-bound-v6.mjs --rev 844a5b3a... --repo <lane> [--target failedrun | --measure <selfauth> | --mutation anchor-self-select | --selftest]` | v5 wall keyed to the record's own pubkey (r43 kill class) -> v6 honest exit 0 under the PINNED anchor 868c0d89; failedrun exit 1 (anchor-pin-mismatch + 46 egress-count-without-remotes); selfauth exit 1; the SAME fixture greens under anchor-self-select (the deterministic do-nothing reach, reproduced browser-free); selftest 9/9 | **met** under the frozen rule; the fully-zeroed lying run stays honestly unbindable (declared residual); operability held 9 -> 9 |

### Capabilities — round 44

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| chrome-cdp-loopback-windows | Drive a real Chromium-class browser over raw CDP on this Windows host: headless=new launch with a throwaway profile (S001 boundary), loopback ws endpoint from stderr, /json/version identity, /json/new PUT target, Runtime.evaluate DOM extraction invocation-bound to a fixture-server nonce, Page.captureScreenshot PNG, fail-closed teardown with tree kill | `scripts/chrome-cdp-loopback-round44.mjs`; `corpus/evidence/round44/chrome-cdp/receipt.json`; `.ufo/waves/round-44/counters/chrome-cdp-receipt-r44.mjs`; `corpus/knowledge/chrome-cdp-loopback-round-44.md` | 44 |

### Round 44 — sources, frontier, trend verdicts

Registry 151 -> 153 (S152/S153 opened this round, raw-fetched with sha256, staged copies
committed; mined; census start AND end exit 0). Knowledge notes 60 -> 61. PROVINCE corrected to
the real host surfaces (kimi-webbridge, Firefox chain, 9222-CDP recorded absent with date;
Chrome/Edge recorded present) - protocol work, not a failure. No QUALITY criterion added: the
round's defects were caught by existing instruments and are recorded in the lesson Mistakes.

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | improved | New capability row `chrome-cdp-loopback-windows` (first browser capability demonstrated on THIS host); new sourced note on ground the coverage map did not hold; registry 151 -> 153; knowledge 60 -> 61; PROVINCE frontier corrected to the real host. |
| quality | improved | The r43 routed defects 1-3 closed in committed bytes with red controls (each fixture false-greens/crashes the r43 bytes and is refused with a named finding by the new bytes; the anchor-self-select mutation proves the pin clause load-bearing); the round's own instruments caught two producer defects pre-data (teardown race, fixture guard); no admitted entry failed a re-check. |
| discernment | unchanged | No outside non-author admit/reject spot-check at lane filing (the closure's duty, pending); the round's refusals (first live attempt rejected by the counter; the egress blind spot declared, not claimed closed) are recorded, not smoothed. |

### Planned / saturation / retired — round 44

- planned: coverage — a second Chromium surface on this host (Edge) through the same runner's
  candidate chain, claimed only with its own source-scoped receipt (S004 discipline).
- planned: calibration — the r5 hardening for the r44 freeze itself at round 45 (the v2 rule
  applies to the r43 freeze; the r44 freeze's own blob id gets pinned when a round-45 checker
  inherits it), plus the S152/S153 90d rechecks.
- planned: adjacency — if the nudge is inactive next round (a capability entered at 44),
  return to the lowest-axis obligation (adjacency 8) with the split completeness/delta meter
  from r35-r36, re-based on sibling drift since the pins.
- saturation 8 / window 3 retained; the capability row restarts the window (round 45 = position
  1). No axis retired; no score moved (no rubric authorizes one).


## Round 45 — declared claims (frozen before data) and executed disposition (all three verified)

Round 45 on the Windows host. Baseline `d252ea17bf8d39ea2e1da9770316146f264f8a0e`; freeze
`51ee19219427497b69bbd4567d21c5478f4efbad`; measured `fb8e2435000df47d86fbab8ce89c1e8f3d0a733f`;
data-corrected under the frozen kill rule (a sibling head moved mid-measurement) to
`0360b069c5f8465c0a230638b24229e774df7ea3` — the cited measured revision, instrument bytes
unchanged since the freeze. Axes at start: adjacency 8 (lowest), others 9; saturation 8 / window 3;
the r44 capability restarted the window, so the nudge is inactive and the lowest-axis obligation
applies (C3 works adjacency). Carry-in from the r44 closure addressed in-round: D1 repinned
append-only + ratcheted by C1; D2 correction of record (lesson); D3 receipted (lesson + measure);
D4 routed around (L0 open; no wave clause in any predicate).

| Claim / axis | Counting command | Before -> after | Verdict / score |
|---|---|---|---|
| C1 calibration (r44 routed defect D1) | `node .ufo/waves/round-45/counters/check-r44-freeze-round45.mjs --rev <REV> --repo <lane>`; `--selftest` | baseline `d252ea17…`: exit 1 (`amendment-missing` + `frozen-digest-stale` naming the counter path, pin `d994ab71…` vs committed `f796ae84…`) -> measured rev `0360b069…`: exit 0 with the append-only amendment bound to committed bytes; selftest 11/11 (relabel, invented repin, duplicate binding, fragment quote, untyped path, digest mismatch, named-control-unbound, blob rewrite all refused) | **met** under the frozen rule; the r44 freeze blob stays byte-identical (`a38b24ee…`); calibration held 9 -> 9 |
| C2 coverage capability (sourced: S154) | `node scripts/chrome-cdp-loopback-round45.mjs --browser edge …`; `node .ufo/waves/round-45/counters/chrome-cdp-receipt-r45.mjs <receipt> --shot <png> --runner <runner>`; `git ls-tree -r --name-only <rev> -- corpus/evidence/round45 \| wc -l` | baseline tree count 0 -> live run exit 0 (Edg/156.0.4314.50, `discoveryVia: devtools-active-port` — Edge prints no stderr DevTools line on this host; invocation-bound; PNG 8,194 B sha `7dfce09d…`), receipt+shot committed as explicit files, counter exit 0 on committed bytes, repro run fresh nonces (receipt `7543027b…`/`10bc2096…`, fixture `2a3f9a27…`/`76926454…`) with byte-identical screenshot, cross-refusal: the counter refuses the r44 chrome receipt with 5 findings | **met** under the frozen rule; same residual model as r44 (browser-ness re-derived by re-running the committed runner); coverage held 9 -> 9 |
| C3 adjacency (lowest owned axis) | `node .ufo/waves/round-45/counters/c1-adjacency-host-v5.mjs --rev <REV> --repo <lane> --fleet <fleet>` | baseline: exit 1, 28 findings (16 audit-missing, 12 roster-lane-uncovered) -> measured rev: exit 0, counts roster 16 / map 16 / audit 16 / delta lanes 12; drift recorded as the result: 6 sibling-absent (kaidoku x4, revenger x2), 9 stale (kake x5, kagi x2, kumitate, kama), 1 moved (kake :79 -> :85); 14 hit lines dispositioned (12 no-tabi-ground, 2 contested-open: CDP runtime observation in shokunin-reverse-engineering :53/:137 — the revenger successor of fleet L0 `b6b3b5e…:65`, routed not absorbed); the meter caught a real sibling head move mid-round and the kill-rule data-correction flow re-measured | **met** under the frozen rule; adjacency held 8 -> 8 |

### Capabilities — round 45

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| edge-cdp-loopback-windows | Drive Microsoft Edge over raw CDP on this Windows host with the declared-surface discipline: headless=new launch with a throwaway profile, endpoint discovered from the profile's DevToolsActivePort file (Edge is stderr-silent here) and confirmed by /json/version, /json/new PUT target, invocation-bound DOM extraction, Page.captureScreenshot PNG, fail-closed teardown | `scripts/chrome-cdp-loopback-round45.mjs`; `corpus/evidence/round45/edge-cdp/receipt.json`; `.ufo/waves/round-45/counters/chrome-cdp-receipt-r45.mjs`; `corpus/knowledge/chrome-cdp-loopback-round-45.md` | 45 |

### Round 45 — sources, frontier, trend verdicts

Registry 153 -> 154 (S154 opened this round, raw-fetched with sha256, staged copy committed; mined;
census start AND end exit 0). Knowledge notes 61 -> 62. PROVINCE host-surface line updated (the
second declared surface + the Edge discovery leg). No QUALITY criterion added: the round's defects
were caught by existing instruments and the freeze discipline, recorded in the lesson Mistakes.

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | improved | New capability row `edge-cdp-loopback-windows` (second Chromium-class surface demonstrated on this host, with its own source-scoped receipt S154); new note on ground the coverage map did not hold; registry 153 -> 154; notes 61 -> 62; evidence tree round45 0 -> 2. |
| quality | improved | The r44 routed defects D1-D3 closed in committed bytes (D1 with a byte-binding checker + append-only amendment; D2 as a correction of record; D3 with a captured crash receipt on a deterministically rebuilt fixture); the head binding caught a real sibling move mid-measurement; no admitted entry failed a re-check. |
| discernment | improved | The lane's own instruments refused its own outputs twice before admission (the first C3 measurement red on a stale head; the broad keyword list rejected pre-freeze on a measured burden of 265+ noise lines) and the round recorded both refusals instead of smoothing them; fresh-start spot-checks re-derived three prior rounds' refusal classes from committed bytes. |

### Planned / saturation / retired — round 45

- planned: coverage — the S154/S152/S153 90d rechecks land round 47+ (opened 2026-10-31); a third
  declared surface only if a host probe shows one (WebView2 chrome.exe candidate noted in the Edge
  docs is the lead).
- planned: adjacency — the stale/moved map rows (kake x5, kagi x2, kumitate, kama) now name their
  drift; re-pin or re-disposition them against the current trees, and re-run the meter as the
  regression gate after any sibling roster change.
- planned: calibration — a second stale-pin would be refused by C1's checker today; if a future
  freeze amends instruments, the amendment file is the single sanctioned path.
- saturation 8 / window 3 retained (capability at 45 keeps the window restarted: round 46 =
  position 2). No axis retired; no score moved (no rubric authorizes one).


## Round 46 — declared claims (frozen before data) and executed disposition (both verified)

Round 46 on the Windows host. Baseline `fe16cf6631e44ad0962cecf4c7c099b8d72efde5`; freeze
`79b297f1d33df8c9b92bc423c2102d6712817662`; measured `951f70d33d9e3af208fb414e3079680c08dc66ba`;
data-corrected under the frozen kill-rule flow (sibling heads racing mid-measurement) through
`3b8a68dc47b0d578e67dcd0faaf42dd100cdc59a` and `fd44a1b30e607bda0523f9464b6689399cbd651b` to the
**cited measured revision `e2d59f729615e1c671ce44d1f4bed28e51f78a4f`** — instrument bytes
byte-identical from freeze to tip. Axes at start: adjacency 8 (lowest), others 9; saturation 8 /
window 3; the r45 capability kept the window restarted (round 46 = position 2), so the nudge is
inactive and the lowest-axis obligation applies (C2 works adjacency). **Carry-in from the r45
non-author closure: the teardown repair is landed and listed here explicitly** — the runner
teardown was repaired from kill-the-main-and-hope (`child.kill` + a no-op-after-death
`taskkill /T`) into a PID-group kill keyed to the launch, with red/green receipts and every
post-kill sweep reaching 0 (C1 row below; the census-START receipt was committed in the freeze as
the second carry-in item; the L2-floor L0 stays open and routed around).

| Claim / axis | Counting command | Before -> after | Verdict / score |
|---|---|---|---|
| C1 operability — **the r45 carry-in teardown repair** (sourced: S155) | `node .ufo/waves/round-46/controls/legacy-teardown-control-r46.mjs --browser edge …`; `node .ufo/waves/round-46/controls/teardown-mechanism-fixture.mjs <out>`; `node scripts/chrome-cdp-loopback-round46.mjs --browser edge\|chrome …`; `node .ufo/waves/round-46/counters/chrome-cdp-receipt-r46.mjs <receipt> --shot <png> --runner <runner>`; `--selftest` | before: no keyed sweep in any instrument (`git grep -c Win32_Process fe16cf66… -- scripts` -> 0); the r45 class reproduced LIVE — the legacy control's teardown left **16 Edge launch processes** alive with the tree kill a no-op (exit 128, "process not found") -> after: the keyed PID-group kill (unique per-run profile token; pre-launch sweep 0; mid-run census 16/16/14 edge and 10 chrome — every observed process carried the token, `identity_helper.exe` included) reached `postKillSweepCount: 0` on every repaired run (edge, edge repro with a fresh launch-key and a byte-identical screenshot, chrome), the mechanism fixture shows red (1 survivor after the no-op tree kill, real OS processes) and green (keyed kill to 0), the counter exits 0 on all committed receipt byte sets, refuses the r45 receipt with 8 findings, and its selftest is verdict=clean 18/18 | **met** under the frozen rule; the repair residual declared pre-data (a helper rewriting its command line to drop the token would leave the keyed group — none observed); operability held 9 -> 9 |
| C2 adjacency (lowest owned axis; ledger re-pin) | `node .ufo/waves/round-46/counters/c1-adjacency-host-v6.mjs --rev <REV> --repo <lane> --fleet <fleet>`; `grep -c '^stale' corpus/adjacency-host-audit-r46.tsv`; `grep -c '^moved' corpus/adjacency-host-audit-r46.tsv`; `--selftest` | before: the r45 audit recorded 9 stale (kake x5, kagi x2, kumitate, kama) + 1 moved (kake :79 -> :85) + 6 sibling-absent; the meter at the r46 baseline -> exit 1, 28 findings (control `controls/c2-meter-red-at-baseline.json`) -> after: the 10 drifted rows re-pinned at recorded snapshot heads with the FULL current line quoted (kake x5 @ `1772f82c`, kagi x2 @ `bc2f3fd6`, kumitate @ `89cbd998`, kama @ `22b9c16d`), audit-r46 = 10 unchanged + 6 sibling-absent, **stale 0, moved 0**; delta-r46 regenerated at the snapshot (12 lanes, 14 hit lines, dispositions carried by exact quote); meter exit 0 at the cited revision, predicate true, 0 findings, counts {roster 16, mapRows 16, auditRows 16, deltaLanes 12}; selftest verdict=clean 16/16; the v6 hardening reads every sibling byte through git at a per-run snapshot head (all 16 sibling worktrees are dirty — the worktree is never read) and caught two real head races mid-measurement (`lane-screen-head-mismatch` sre; then the kama/kasegi corrections) under the frozen data-correction flow | **met** under the frozen rule; adjacency held 8 -> 8 |

No new capabilities row: the round's move is an instrument repair — the capability driven is the
r44/r45 chrome/edge-cdp-loopback surface, whose teardown now holds the keyed-sweep discipline
(`corpus/knowledge/chrome-cdp-teardown-round-46.md`); a gate/counter never enters the
capabilities table (QUALITY 84).

### Round 46 — sources, frontier, trend verdicts

Registry 154 -> 155 (S155 opened this round, raw-fetched with sha256, staged copy committed; mined;
census start AND end exit 0; the census-START receipt file committed in the freeze). Knowledge notes
62 -> 63. No QUALITY criterion added: the round's defects were caught by existing instruments and
the freeze discipline (recorded in the lesson Mistakes); the host-bound check-adjacency failure is
recorded with cause (r44 legacy-gate class), its repair routed.

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | unchanged | No new surface, note ground is the repair of an owned instrument (notes 62 -> 63 documents it); registry 154 -> 155 (the enumeration surface S155); no new capability row (repair, not acquisition). |
| quality | improved | The r45 carry-in defect closed in committed bytes with live red and green receipts (16 orphans reproduced, then swept to 0 — and every repaired run ends at sweep 0); the v6 meter hardening (git-at-snapshot-head) turned the sibling head race from a mid-measurement surprise into a caught finding twice; no admitted entry failed a re-check. |
| discernment | improved | The lane's own instruments refused its own outputs four times before admission (counter selftest 1/18 on a broken check; fixture survivors 0 on crashed helpers; two meter runs red on head/audit drift) and every refusal is recorded with its fix instead of smoothed; the red limb of C1 is carried by evidence, not by luck. |

### Planned / saturation / retired — round 46

- planned: operability — the host-portable repair of `scripts/check-adjacency.mjs`'s `minimalEnv`
  PATH pruning (recorded with cause at `measure/c2-check-adjacency-hostbound.json`), claimed only
  with a red/green receipt pair on this host and a quote-verification cross-check against the v6
  meter.
- planned: adjacency — the sibling heads recorded this round (kake `1772f82c`, kagi `bc2f3fd6`,
  kumitate `89cbd998`, kama `22b9c16d`, delta lanes at the meter snapshot) date like any census;
  re-run the meter as the regression gate after any sibling roster change; the 6 sibling-absent
  rows stay routed to the delta ledger.
- planned: coverage — the S155/S154/S152/S153 90d rechecks land round 47+ (S155 opened 2026-10-31);
  a third declared surface only if a host probe shows one.
- saturation 8 / window 3 retained (the r45 capability keeps the window restarted: round 47 =
  position 3). No axis retired; no score moved (no rubric authorizes one).

## Round 47 — declared claims (frozen before data) and executed disposition (C1 verified; C2 refused under its frozen kill rule)

Round 47 on the Windows host. Baseline `b95b546949e71f34bfaa1e63de44aff4b4d29371`; freeze
`80325bd8e977a2730cb7b2bbd16ae26d4b022648`; data `d76eb5bbf84276d0f0d568d6918e1e571555a441`;
correction 1 `524910a98abe7d21ed81bfffb1366d43eea0e8a5` (**cited measured revision for C1**);
C2 repair `c2711c47fb12c88c401268fbcdd5a41ed9adddae`. Axes at start: adjacency 8 (lowest), others
9; saturation 8 / window 3; the r45 capability keeps the window restarted (round 47 = position 3),
nudge inactive — the lowest-axis obligation applies and C1 works adjacency. Instruments
byte-identical from freeze to tip where frozen (meter blob `168e1ecc…` equal at freeze and at the
measured revision; receipt `.ufo/waves/round-47/measure/c1-committed-bytes-at-cited-rev.txt`).
**Round admission: FALSE** — C2 is refused under its own pre-declared kill rule and a round
admits only when every claim verifies; reported honestly, not re-declared post-data.

| Claim / axis | Counting command | Before -> after | Verdict / score |
|---|---|---|---|
| C1 adjacency (lowest owned axis; the regression-gate re-run) — VERIFIED | `node .ufo/waves/round-46/counters/c1-adjacency-host-v6.mjs --rev b95b5469… --repo <lane> --fleet <fleet>` (red control, round open); `node .ufo/waves/round-47/counters/c1-adjacency-host-v7.mjs --rev 524910a9… --repo <lane> --fleet <fleet>`; `--selftest`; `diff` v6 v7 | before: at round open the committed r46 ledger generation measures RED against the advanced fleet — exit 1, **17 findings** (3 province-byte changes [kasegi, mado, binfor], 3 lines mismatches, 1 hits mismatch, 2 delta-line-missing = binfor's two new browser-ground lines, 8 stale delta-head binds; ten sibling heads advanced since the r46 snapshot; control `.ufo/waves/round-47/controls/c1-meter-red-at-round-open.json`, taken before any lane write) -> after: audit-r47 (16 rows: 10 unchanged + 6 sibling-absent) and delta-r47 (12 lanes, 16 line rows) regenerated at ONE fresh snapshot; binfor's 2 new browser-ground lines (`:30` rea-cdp-browser over the host's own Chrome/Edge, `:33` list-browser-targets/inspect-web-page over a loopback CDP endpoint) adjudicated **contested-open** — the same family as the sre `:53` row (fleet L0 `b6b3b5e4…` :65 still open); all other dispositions carried from r46 by exact whole-line quote match; meter v7 at `524910a9…` -> **exit 0, predicate true, 0 findings**; one head-race correction under the frozen flow (sre + tsukuroi advanced between data commit and meter run -> correction 1); selftest allPass=true 16/16; the v7 retarget diff is comment/const/schema hunks only | **met** under the frozen rule; adjacency held 8 -> 8 |
| C2 operability (the r46-routed minimalEnv repair, sourced S157) — **claim REFUSED, repair landed** | `node scripts/check-adjacency.mjs --repo <lane> --fleet <fleet> --json` (red at round open; green at `c2711c47`); `--self-test`; `git diff 80325bd8..c2711c47 -- scripts/check-adjacency.mjs` | before: the gate cannot evaluate on this host at all — exit 2 could_not_evaluate, `git_failed (status=spawn)` on every run (control `.ufo/waves/round-47/controls/c2-gate-red-at-round-open.json`; the committed r46 receipt `measure/c2-check-adjacency-hostbound.json` corroborates) -> after: the repaired gate (PATH split/join on `path.delimiter`, keep `isAbsolute` — the only functional delta vs the freeze blob) **evaluates**: exit 1, verdict=failed, rows=16, verified=5, findings 6 × sibling_unresolved (exactly the four kaidoku + two revenger absent-sibling rows, 1:1 with the audit-r47 sibling-absent rows — the one cross-check limb that held) + 4 × ruling_unresolved + 3 × quote_too_long; self-test `ADJACENCY_SELFTEST verdict=clean cases=57 reasons=18 could_not_evaluate=6` on this host | **REFUSED** under the frozen kill rule ("any finding other than the six absent-sibling sibling_unresolved fires"): the frozen after-state (verified=10, exactly-6 findings) was reasoned, not measured — a stale-premise freeze (lesson Mistake 1); the routed repair itself is landed, live-verified (exit 2 -> exit 1 evaluated, selftest clean), and re-declarable in round 48 with an honestly-predicted predicate; operability is not harmed (the gate went from cannot-run to runs) but the claim does not verify, so the round does not admit on it |

The r46 carry-in items are all addressed in the round-47 commits: V1 as S156 (supersedes S155 —
104,251 -> 104,255 B with its command; sha unchanged); V2 as the trio-first corrected entry
`knowledge/chrome-cdp-teardown-round-46-corrected.md` (r21-corrected precedent; original keeps a
supersession append; knowledge 63 -> 64); V3 as a fresh selfassessment receipt
(`.ufo/waves/round-47/measure/selfassessment-precommit.txt` — `verdict=failed rev=c2711c47…
mismatches=1 could_not_evaluate=171 superseded=24`; the 1 is the pre-commit `m3-unlanded-paths`
artifact; the r46 receipt reads `mismatches=1 could_not_evaluate=175 superseded=23` — the same
single m3 class at both revisions) and a disclosure that quotes only receipt summary lines; the
superseded "all five m1-selftest-tally readings" wording is named, never rewritten in place. The
L2-floor L0 stays open and routed around (no wave clause in any predicate; L1-inline round).

### Round 47 — sources, frontier, trend verdicts

Registry 155 -> 157 (S156 correction supersedes S155's anchor count; S157 Node path docs opened
this round, raw-fetched, staged, quote 1-hit). Knowledge notes 63 -> 64 (the corrected entry). No
new surface: S156 corrects held ground; S157 documents the repair's own primitives. Census start
AND end exit 0.

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | unchanged | No new coverage-map ground: the C1 move re-binds held ledger ground; C2 repairs an owned instrument; S156 is a correction, S157 the repair's primitives; the corrected entry (63 -> 64) documents already-held teardown ground. |
| quality | improved | The routed defect closed in committed bytes with live red (exit 2, spawn failure) and green (exit 1 evaluated, selftest clean 57/57) receipts; the C1 regression gate went red 17 -> green 0 with the two genuinely new browser-ground lines adjudicated rather than smoothed; S155's drifted count found and corrected as S156 without editing the original row; no admitted entry failed a re-check. |
| discernment | improved | The lane's own frozen kill rule refused its own claim at data time (C2) and the refusal is recorded with its rationale instead of a post-data re-declaration; the head-race correction ran under the frozen data flow, not ad hoc; every disclosure number this round is quoted from a receipt's own summary line. |

### Planned / saturation / retired — round 47

- planned: operability — RE-DECLARE the gate repair claim in round 48 with an honestly-predicted
  predicate: the repair bytes are landed at `c2711c47`; the r48 freeze must either measure the
  predicted after-state pre-data over the same bytes or key the refusal to classes (persisting
  could_not_evaluate; repair-regression findings), and should also disposition the two honest
  finding classes this round surfaced: the fleet-venue split (ruling_unresolved — the gate
  requires one dir to be both fleet repo and sibling parent; this host splits them) and the
  25-word quote cap vs the meter-era whole-line quotes (a legacy-vs-meter interplay the r46 record
  already carried).
- planned: adjacency — the r47 snapshot heads date like any census; re-run meter v7 as the
  regression gate after any sibling roster change; the binfor contested-open lines join the sre
  :53/:137 family awaiting the open fleet L0 (b6b3b5e4… :65).
- planned: coverage — S152–S155 90d rechecks due 2027-01-29 (opened 2026-10-31; not due this
  round); S156/S157 recheck 90d / on-release respectively.
- saturation 8 / window 3 retained (round 48 = position 4 — the window EXPIRES after round 47's
  position 3: if no capability enters the table by the r48 freeze, the stagnation nudge waives the
  lowest-axis obligation and the round should be a frontier/capability move). No axis retired; no
  score moved (no rubric authorizes one).

## Round 48 — declared claims (frozen before data, every predicate MEASURED) and executed disposition (all three verified)

Round 48 on the Windows host. Baseline `8ccf0a82087d950c0ad0fc5d0e4723a4311a1765`; freeze
`f4288c0e9a4b675f2e86e25c34e9a09af25d67b4` (claims.json + instruments + round-open controls, BEFORE
any data commit); C1 data `04dfee6443bd98fe335ebe95623277e9928ec909` (**cited measured revision**);
C2 data `710c7143c2d52c43cbe1c168236ff4076e72f7a5`; C3 data `f623ce5d1696df4a64ef9d29cd8568375ae50c57`.
Axes at start: adjacency 8 (lowest), others 9; saturation 8 / window 3 — the window EXPIRED entering
round 48 (position 4), so the stagnation nudge fired unless a capability entered the table: C3 is
that capability move, and C1 still works the lowest axis. The r47 lesson's durable fix (a predicate's
numeric after-state is measured pre-data or keyed to classes) is applied throughout: C2's after-state
exists as a sha-pinned PREDICTION RECEIPT measured over the repair bytes before the freeze, and the
data-time run is compared to it programmatically. Carry-in from the r47 closure: N1 performed as C1;
D1 closed as the append-only erratum below; the r47 spotcheck read in full before declaring; the
tabi | round-44 L2-floor L0 stays open and routed around.

| Claim / axis | Counting command | Before -> after | Verdict / score |
|---|---|---|---|
| C1 adjacency (lowest owned axis; the r47-closure-owed ledger re-bind) — VERIFIED | `node .ufo/waves/round-47/counters/c1-adjacency-host-v7.mjs --rev 524910a9… --repo <lane> --fleet <fleet>` (red control, round open); `node .ufo/waves/round-48/counters/c1-adjacency-host-v8.mjs --rev 04dfee64… --repo <lane> --fleet <fleet>`; `--selftest`; `diff` v7 v8 | before: at round open the committed r47 ledger generation measures RED against the advanced fleet — exit 1, **15 findings** (9 lane-screen-head-mismatch + 3 lane-screen-sha-mismatch + 3 lane-screen-lines-mismatch; the closure judge's live re-run at closure had read 9, all the same correction-flow class — the drift continued between closure and round open; control `.ufo/waves/round-48/controls/c1-meter-red-at-round-open.json`, taken before any lane write; a do-nothing control reaches exactly this red) -> after: audit-r48 (16 rows = 10 unchanged + 6 sibling-absent; all cited lines verified still present) and delta-r48 (12 lanes, 16 line rows) re-bound at ONE fresh snapshot, dispositions carried by exact whole-line quote match, 0 new adjudications; meter v8 at `04dfee64` -> **exit 0, predicate true, 0 findings**, counts {roster:16, mapRows:16, auditRows:16, deltaLanes:12}; selftest allPass=true 16/16; the v7->v8 retarget diff is comment/const/schema/usage hunks only (`.ufo/waves/round-48/controls/v7-v8-retarget.diff`) | **met** under the frozen rule; adjacency held 8 -> 8 |
| C2 operability (the r47-refused claim re-declared, MEASURED predicates) — VERIFIED | `node scripts/check-adjacency.mjs --repo <lane> --fleet <fleet> --json` (before control); same + `--fleet-repo <fleet-checkout>` (prediction + green); `--self-test`; `git cat-file -p 710c7143…:scripts/check-adjacency.mjs \| sha256sum` | before: the inherited r47 bytes read exit 1, verdict=failed, rows=16, **verified=5**, findings exactly {6 x sibling_unresolved (absent siblings) + 4 x ruling_unresolved (fleet-venue split: the gate required one dir to be both fleet repo and sibling parent; this host splits them) + 3 x quote_too_long (legacy 25-word substring cap vs meter-era whole-line quotes)} — reproducing the r47 honest verdict file 1:1 (control `.ufo/waves/round-48/controls/c2-gate-before-at-r48-open.json`) -> the repair: `--fleet-repo` resolves the `fleet` ruling venue at the real fleet repo (fails closed on a wrong venue — the selftest's wrong-dir case refuses) and whole-line quotes are accepted (a quote that IS the complete cited line drops only the cap; substrings stay capped); prediction receipt measured PRE-DATA over the repair bytes (sha256 `19bcd7d9…` pinned) reads **verified=10, findings EXACTLY 6 x sibling_unresolved**; the landed blob re-hashes to the pin; the data-time run at `710c7143` **EQUALS THE PREDICTION** (programmatic compare); the without-flag control reads verified=**7** (6+4) — the flag is load-bearing; selftest `ADJACENCY_SELFTEST verdict=clean cases=64 reasons=18 could_not_evaluate=6` (7 new cases: 3 whole-line-green, 1 long-substring-still-fails, 3 fleet-repo incl. fails-closed) | **met** under the class-keyed frozen kill rules; operability held 9 -> 9; the residual six findings are the genuinely-absent siblings, matching audit-r48's sibling-absent rows 1:1 (operator ground, reported not absorbed) |
| C3 coverage (capability acquisition — the frontier move the expired window asks for) — VERIFIED | `git ls-tree -r --name-only <REV> -- corpus/evidence/round48/webview2-cdp \| wc -l` (0 -> 2); `node .ufo/waves/round-48/counters/webview2-receipt-r48.mjs <receipt> --shot <png> --driver <mjs> --hostsrc <cs>`; `--selftest`; the same counter on the r44 receipt | before: no WebView2 surface — the capabilities table holds chrome (44) and edge (45) only; the round's own standalone probes (7 launcher variants, `.ufo/waves/round-48/controls/webview2-standalone-probes/`) show msedgewebview2.exe exits cleanly with no CDP endpoint without a host — the runtime is NOT a standalone surface -> after: the committed minimal COM host (`scripts/webview2-host-round48.cs`, C# 5 + Framework 4.8 csc.exe, ABI from S159) driven by the committed runner (`scripts/webview2-cdp-loopback-round48.mjs`) with the S158 env-var route: live run green (Edg/156.0.4314.50 at /json/version; discovery via `<profile>\EBWebView\DevToolsActivePort` in ~0.5 s; invocation-bound nonce read back over the CDP WebSocket; Page.captureScreenshot 8,063 B committed; keyed teardown sweep 0 — the browser subprocess exits when the host dies, measured); post-freeze repro (fresh nonce) counter-green; the counter exits 0 on the committed bytes, refuses the r44 chrome receipt with 18 findings, and its selftest is 6/6 | **met** under the frozen rule; the capability row enters the table below (first-working 48); coverage held 9 -> 9 |

### Erratum (r47 closure defect D1) — append-only

Superseded text: the r47 lesson's REJECT — C2-as-frozen reason enumerated the three quote_too_long
rows as "kagi :64 / kama :355 / kake :310". Correct enumeration per the authoritative verdict file
(r47 `measure/c2-gate-green-at-data.json`, blob `6734b4c5`): kagi `PROVINCE.md:64` (56 w), kake
`PROVINCE.md:310` (32 w), **kake `SKILL.md:697` (28 w)**; kama `listener-census.md:355` (11 w, row 11)
is a `ruling_unresolved` row, not a quote_too_long row. The receipt was authoritative; the r47 lesson
bytes are not edited (append-only contract).

### Capabilities — round 48

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| webview2-cdp-loopback-windows | Drive the Microsoft WebView2 runtime (msedgewebview2 156.0.4314.50) over raw CDP on this Windows host through a minimal COM host: compile the committed C# 5 host with the in-box csc.exe, spawn it with the documented WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS route (S158) over a throwaway tokened profile, discover the endpoint from `<profile>\EBWebView\DevToolsActivePort`, confirm the Edg/ identity at /json/version, read the invocation-bound nonce back over the CDP WebSocket, capture a PNG, tear the host down with a keyed sweep to 0 (the browser subprocess follows the host — measured) | `scripts/webview2-host-round48.cs`; `scripts/webview2-cdp-loopback-round48.mjs`; `corpus/evidence/round48/webview2-cdp/receipt.json`; `.ufo/waves/round-48/counters/webview2-receipt-r48.mjs`; `corpus/knowledge/webview2-cdp-loopback-round-48.md` | 48 |

### Round 48 — sources, frontier, trend verdicts

Registry 157 -> 159 (S158 WebView2 debugging docs, S159 the SDK's WebView2.h ABI header; both opened
this round, raw-fetched, staged, quotes verbatim 1-hit). Knowledge notes 64 -> 65 (the WebView2 note;
trio-first). PROVINCE gains the third declared surface line (the webview2 host route + the
not-standalone finding). Census start AND end exit 0.

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | improved | New capability row `webview2-cdp-loopback-windows` (the third Chromium-class surface demonstrated on this host, with its own staged sources S158/S159, a committed receipt+PNG and a digest-pinned counter); new sourced note on ground the coverage map did not hold (registry 157 -> 159; notes 64 -> 65); PROVINCE frontier moved to the real host surface. |
| quality | improved | The r47-closure debt closed in committed bytes with live red/green receipts (the owed re-bind measured red 15 -> green 0 under an instrument whose retarget diff is comment/const-only); the C2 re-declaration carried the r47 durable fix into practice — the after-state was a sha-pinned pre-data prediction receipt, the landed blob was verified against the pin, and the data-time run EQUALS THE PREDICTION; the gate selftest grew 57 -> 64 with the wrong-venue fails-closed case; no admitted entry failed a re-check. |
| discernment | improved | Every predicate this round was MEASURED before the freeze (the r47 refusal's cause, repaired as a discipline rather than a promise): C2's after-state existed as a prediction receipt before the freeze and was compared programmatically at data time; the standalone-launch dead end was read honestly (the probes bundle refutes the surface the lane hoped for) and the capability was built on the documented host route instead; the r47 closure's D1 defect is corrected by a named erratum, never an in-place rewrite. |

### Planned / saturation / retired — round 48

- planned: coverage — the r48 capability's residuals: a `file://`/`http://` fixture page and
  cross-page navigation over the webview2 surface (the data:-URL nonce page is the measured
  surface), and a probe for a fourth surface only if the host shows one.
- planned: adjacency — the r48 snapshot heads date like any census; re-run meter v8 as the
  regression gate after any sibling roster change; the six sibling-absent rows and the binfor
  contested-open lines stay routed (the fleet L0 `b6b3b5e4…` :65 still open).
- planned: operability — the gate's remaining honest residue is zero on this host's present roster;
  if kaidoku/revenger return, re-run the C2 green and re-measure the prediction before any new
  freeze.
- saturation 8 / window 3 retained; the r48 capability row RESTARTS the window (round 49 = position
  1). No axis retired; no score moved (no rubric authorizes one).


## Round 49 — declared claims (frozen before data at 7700daf8) and executed disposition (all three verified)

Round 49 on the Windows host. Baseline `10ea3d96c0eed6d0e7240f57f7a30d8ef73689b1`; freeze
`7700daf8e1168648c6cb2608880617817b0dda62` (claims.json + instruments + round-open controls, BEFORE
any data commit); orphan-hygiene `6e080c17f8e568446a535c845c4387b795b3a1f6`; C1 data
`eb89957ff39e645de813c75033fc7828117e0c5a` -> correction 1 `44dde54f354693838076bc4532a93b693693a7ce`
-> correction 2 `5fa183842a9925b3e18ea5f9df039984d47d5666` (**cited measured revision for C1**); C2
data `b026dc34368e06eb46ebdd925b132595751ffa4c`; C3 data `36f8579bf2fbabd71d8a15142e1c9cf29e27bb02`.
Axes at start: adjacency 8 (lowest), others 9; saturation 8 / window 3 — the r48 capability row
RESTARTED the window (round 49 = position 1), so the stagnation nudge is inactive and the
lowest-axis obligation applies: C1 works adjacency. Fresh-start ruling honored: the r42/r43/r47
refused claim classes (nonce-relabeled synthetic-receipt counters; four-seat do-nothing waves;
reasoned-not-measured after-states) are named in the freeze's freshStartNote and ruled out — both
r49 counters pin committed-byte digests and ship hand-declared refusal fixtures; no wave/seat claim
is declared; every after-state is a live instrument output at a named revision. Carry-in from the
r48 non-author closure: item 1 performed as claim C2 (sourced S160, opened this round); item 2 —
the orphaned-evidence sweep found the literal cited-but-uncommitted set EMPTY and landed the three
uncited r44 orphans it found (receipt `controls/orphan-evidence-sweep.txt` at the freeze); item 3 —
the `tabi | round-44` L2-floor L0 stays open and routed around (L1-inline round).

| Claim / axis | Counting command | Before -> after | Verdict / score |
|---|---|---|---|
| C1 adjacency (lowest owned axis; the regression-gate re-bind) — VERIFIED | `node .ufo/waves/round-48/counters/c1-adjacency-host-v8.mjs --rev 10ea3d96… --repo <lane> --fleet <fleet> --json` (red control, round open); `node .ufo/waves/round-49/counters/c1-adjacency-host-v9.mjs --rev 5fa18384… --repo <lane> --fleet <fleet> --json`; `--selftest`; `diff` v8 v9 (`.ufo/waves/round-49/controls/v8-v9-retarget.diff`) | before: at round open the committed r48 ledger generation measures RED against the advanced fleet — exit 1, **15 findings** (11 lane-screen-head-mismatch + 2 lane-screen-sha-mismatch + 2 lane-screen-lines-mismatch; kasegi + mado provinces changed bytes; control `.ufo/waves/round-49/controls/c1-meter-red-at-round-open.json`, taken before any lane write; a do-nothing control reaches exactly this red) -> after: audit-r49 (16 rows = 10 unchanged + 6 sibling-absent) and delta-r49 (12 lane rows + 16 line rows) re-bound at ONE fresh snapshot, dispositions carried from delta-r48 by exact whole-line quote match, 0 new adjudications; the meter raced twice under the frozen correction flow (data `eb89957f` and correction 1 `44dde54f` each read 2 head mismatches; correction 1's raced receipt is committed at `measure/c1-meter-red-at-data.json`, the first race's receipt was overwritten in place by the re-run — disclosed) and went **GREEN at correction 2 `5fa18384`: exit 0, predicate true, 0 findings**, within the frozen two-cycle rule; v9 selftest 16/16; the v8->v9 diff is comment/const/schema hunks only | **met** under the frozen rule (two correction cycles consumed, the allowed maximum); adjacency held 8 -> 8 |
| C2 operability (the r48-closure-routed scratch-path foot-gun; sourced S160 opened this round) — VERIFIED | `node scripts/webview2-cdp-loopback-round48.mjs --scratch relscratch --out r.json` (red control, round open, cwd scratch); `node scripts/webview2-cdp-loopback-round49.mjs --scratch relgreen --out r.json`; `node .ufo/waves/round-49/counters/webview2-receipt-r49.mjs <receipt> --shot <png> --driver <v2> --hostsrc <cs>`; `--selftest`; `--path-selftest` | before: the routed invocation (RELATIVE `--scratch`) fails on the frozen r48 bytes — exit 1, `no-devtools-active-port` (waitedMs 15568), and the real profile landed at `<cwd>/relscratch/relscratch/<token>-profile` with a live `EBWebView/DevToolsActivePort` the runner never polled — the S160 exe-dir anchor, measured (receipts `controls/c2-v1-relative-scratch-red-*`, committed at the freeze); the knowledge note carried no absolute-path warning -> after: `scripts/webview2-cdp-loopback-round49.mjs` (frozen sha `9b6fa47f…`) resolves `--scratch`/`--out` at launch and records given-vs-resolved under `receipt.paths`; the SAME relative shape exits 0 at `b026dc34` (invocation-bound nonce, Edg/156.0.4314.50, PNG 7,617 B, sweep 0, `relInvocation: true`, profile under the resolved scratch); counter green **0 findings** on the committed bytes; counter selftest **8/8** (refusal fixtures incl. missing-paths-block, resolution-not-applied, cross-schema r48 receipt, tampered shot, chrome relabel); `--path-selftest` **6/6**; absolute-equivalence control counter-green (no `paths-absolute-not-identity` — the resolution is identity for the r48-documented usage); cross-refusals: r49 counter refuses the r44 chrome receipt (**19 findings**), the r48 counter refuses the r49 receipt (**4 findings**); the frozen r48 bytes documented absolute-only via dated appends (knowledge note round-49 section + PROVINCE) | **met** under the frozen kill rules; operability held 9 -> 9 |
| C3 coverage (capability extension — the r48 note's declared residual exercised; capability row enters the table below) — VERIFIED | `git ls-tree -r --name-only <REV> -- corpus/evidence/round49/webview2-nav \| wc -l` (0 -> 3); `node .ufo/waves/round-49/counters/webview2-receipt-r49.mjs corpus/evidence/round49/webview2-nav/receipt.json --shot …page-b.png --shot-a …page-a.png --driver <v2> --hostsrc <cs>` | before: the webview2 surface's measured page model is a single data:-URL nonce page; the residual is committed text in the r48 note ("A `file://` or `http://` fixture page and cross-page navigation were not exercised"); `corpus/evidence/round49/webview2-nav` holds 0 files -> after: at `36f8579b` the surface navigates — an inline loopback HTTP fixture (ephemeral port 61114, two static pages served from the driver's own bytes), `Page.navigate` to `/a.html`, then the page's OWN anchor clicked to `/b.html` (mechanism `anchor-click`), per-page URL/title/PNG pins (6,781 B / 7,002 B), invocation-bound nonce, Edg/ identity, teardown sweep 0 (fixture server closed before teardown accounting); counter green **0 findings** with both nav legs; the r48 note's residual superseded by a dated append | **met** under the frozen rule; coverage held 9 -> 9 |

### Capabilities — round 49

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| webview2-http-cross-page-nav-windows | Navigate the WebView2 surface across real pages over HTTP: an inline loopback HTTP fixture (ephemeral port, pages served from the committed driver's own bytes), Page.navigate to page A, cross-page via the page's own anchor click to page B, per-page URL/title/PNG evidence in a counter-checked receipt with invocation-bound nonce and a keyed teardown to 0 | `scripts/webview2-cdp-loopback-round49.mjs` (`--nav`); `corpus/evidence/round49/webview2-nav/receipt.json` + `receipt-page-a.png` + `receipt-page-b.png`; `.ufo/waves/round-49/counters/webview2-receipt-r49.mjs` (nav legs) | 49 |

### Round 49 — sources, frontier, trend verdicts

Registry 159 -> 160 (S160 WebView2 user-data-folder concepts page — the exe-dir UDF anchor, the
ground C2's repair rests on; opened this round, raw-fetched, staged, 18-word quote disclosed at 3
verbatim hits across the page's platform sections). Knowledge notes stay 65 (the r48 note grew a
dated append; the round's coverage move is the nav surface + the capability row). PROVINCE gains
the round-49 runner line. Census start AND end exit 0.

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | improved | The measured surface grew twice: the webview2 page model now covers cross-page HTTP navigation (0 -> 3 evidence files; a live anchor-click hop recorded and counter-checked), and the capability row `webview2-http-cross-page-nav-windows` enters the table; S160 moves the UDF path contract from a measured-but-undocumented behavior to a held, recheckable source row (159 -> 160). |
| quality | improved | The routed foot-gun is closed with a versioned repair whose failure mode is now measured on both sides (v1-relative red with the exe-dir anchor listed; v2-relative green with the paths block) and an absolute-equivalence control proving the repair changes nothing else; the counter family grew refusal fixtures (8 cases) and demonstrated two symmetric cross-refusals; the adjacency gate survived two live head races inside its frozen correction budget and reads green; no admitted entry failed a re-check. |
| discernment | improved | Every after-state is an instrument output at a named revision, never an arithmetic assertion (the r47 discipline held); the fixture selftest caught two real counter defects BEFORE any data relied on the counter, and the catches are disclosed as mistakes with the failing first reads; the orphan-evidence duty was answered with a sweep that refused to find work that wasn't there (the cited-but-uncommitted set is empty) while still landing the three genuinely orphaned receipts; the head races were routed through the frozen correction flow and stopped inside it, with both raced receipts committed rather than overwritten. |

### Planned / saturation / retired — round 49

- planned: coverage — the nav surface's next residuals: a multi-step journey (A -> B -> C with
  history-length and back-navigation evidence, the r3 journey model over the webview2 surface), and
  form interaction (fill + submit) on the fixture.
- planned: adjacency — the r49 snapshot heads date like any census; re-run meter v9 as the
  regression gate after any sibling roster change; the six sibling-absent rows and the
  contested-open families (sre :53/:137, binfor :30/:33, kama :355, revenger :5) stay routed to the
  open fleet L0 (`b6b3b5e4…` :65).
- planned: operability — the r48 runner's absolute-only caveat now lives in the knowledge note and
  PROVINCE; if the r48 bytes ever need to run relatively they must not — a wrapper, not an edit, if
  the operator ever asks; the gate's honest residue stays zero on the present roster.
- saturation 8 / window 3 retained; the r49 capability row keeps the window RESTARTED (round 50 =
  position 1). No axis retired; no score moved (no rubric authorizes one).


## Round 50 — declared claims (frozen before data at 2febf9b2, amended twice before any data) and executed disposition (all three verified)

Round 50 on the Windows host. Baseline `a9b47d6a1ea2a2f649c0177dac90dd5e992b9274`; freeze
`2febf9b23cfd6d2b7f9ce6de145c5edf1b4a1c46` (claims.json + instruments + round-open controls, BEFORE
any data commit); amendment 1 `2604c1d984dcc1d0daba87ba29d75393ed44fa87` (the runner's page-target
race, caught by the first live run — red receipt committed, bounded poll added); amendment 2
`5c7019944eee9c6bae56f076765685bb8ba1865f` (the journey history model corrected to the measured
surface truth — the initial data: page occupies history slot 0; red receipt + PNGs committed); C2+C3
data `196367606e51417f27165ceec5c4fb0db3734a62`; C1 data `1ea714f5a39452bb39d61404b7d87e2a27fc4d6a`
-> correction 1 `bceb21140583e1a4126c681b1ca2e691b6485a15` (**cited measured revision for C1**, meter
v10 GREEN); green receipt `f3364aaa9ad7612f7fe154bbcbfead1612de3527`; integration (this commit).
Axes at start: adjacency 8 (lowest), others 9; saturation 8 / window 3 — the r49 capability row
RESTARTED the window (round 50 = position 1), so the nudge is inactive and the lowest-axis obligation
applies: C1 works adjacency. Fresh-start ruling honored: the r42/r43/r47 refused claim classes are
named in the freeze's freshStartNote and ruled out (no wave/seat claims; no reasoned-not-measured
after-states; counters pin committed-byte digests and ship hand-declared refusal fixtures). Carry-in
from the r49 non-author closure: D1 and D2 performed as the append-only erratum below; D3 performed
as claim C3 (the closure's suggested declared could-not-evaluate class, adopted in a versioned
counter this round as suggested); the `tabi | round-44` L2-floor L0 stays open and routed around
(L1-inline round). Both pre-data amendments carry committed red receipts — the freeze discipline
(amend BEFORE data, never after) was applied when the live surface refuted the design.

| Claim / axis | Counting command | Before -> after | Verdict / score |
|---|---|---|---|
| C1 adjacency (lowest owned axis; the regression-gate re-bind) — VERIFIED | `node .ufo/waves/round-49/counters/c1-adjacency-host-v9.mjs --rev a9b47d6a… --repo <lane> --fleet <fleet> --json` (red control, round open); `node .ufo/waves/round-50/counters/c1-adjacency-host-v10.mjs --rev bceb2114… --repo <lane> --fleet <fleet> --json`; `--selftest`; `diff` v9 v10 (`.ufo/waves/round-50/controls/v9-v10-retarget.diff`) | before: at round open the committed r49 ledger generation measures RED against the advanced fleet — exit 1, **24 findings** (11 lanes' heads advanced, kasegi/kengaku/mado provinces changed bytes, and kotoba's BG-line set restructured: 2 delta-line-missing (:59,:62), 1 delta-quote-not-whole-line (:61), 2 delta-line-invented (:58,:60); control `.ufo/waves/round-50/controls/c1-meter-v9-red-at-round-open.json`, taken before any lane write; a do-nothing control reaches exactly this red) -> after: audit-r50 (16 rows = 10 unchanged + 6 sibling-absent) and delta-r50 (12 lane rows + 16 line rows) re-bound at ONE fresh snapshot; kotoba's three BG-hit lines moved one line down (:58->:59, :60->:61, :61->:62, a non-BG chousa row inserted between audio and game-dev-2d) with text byte-verbatim and dispositions carried by exact whole-line quote match, **0 new adjudications**; kasegi 199->201 / kengaku 698->732 / mado 241->257 bytes re-pinned with BG-hit line sets unchanged; one head race under the frozen correction flow (tsukuroi advanced between the 1ea714f5 snapshot and the meter run; raced receipt `measure/c1-meter-red-at-data.json`) -> **GREEN at correction 1 `bceb2114`: exit 0, predicate true, 0 findings**, counts {roster:16, mapRows:16, auditRows:16, deltaLanes:12}, one cycle of the two-cycle budget; v10 selftest 16/16; the v9->v10 diff is comment/const/schema hunks only | **met** under the frozen rule (one correction cycle); adjacency held 8 -> 8 |
| C2 coverage (capability extension — the r49 planned journey residual, sourced S153 re-opened byte-identical this round; the freeze's S161 label corrected of record, erratum D4) — VERIFIED | `git ls-tree -r --name-only <REV> -- corpus/evidence/round50 \| wc -l` (0 -> 5); `node .ufo/waves/round-50/counters/webview2-receipt-r50.mjs corpus/evidence/round50/webview2-journey/receipt.json --shot …journey-b-back.png --png-a …journey-a.png --png-b …journey-b.png --png-c …journey-c.png --driver <r50> --hostsrc <cs>` | before: the webview2 surface's measured page model is two-page single-hop navigation (r49); the journey residual is committed text in the r49 SCORECARD planned section; `corpus/evidence/round50` holds 0 files -> after: at `19636760` the surface carries a journey — an inline loopback HTTP fixture (ephemeral port 58873), legs `Page.navigate` /a.html -> `anchor-click` /b.html -> `anchor-click` /c.html -> `Page.navigateToHistoryEntry` back to the /b.html entry (targetIndex 2; the S153-grounded Page.navigateToHistoryEntry primitive), the history block read at C ([data:, a, b, c] — entriesLength 4, currentIndex 3, the measured surface model) and re-read after the hop (entriesLengthAfter 4, currentIndexAfter 2 — the forward entry is retained), a nonce marker riding every fixture page (nonceOnPageA true), per-step titles + four PNG pins (7,523-8,389 B), Edg/156.0.4314.58 identity, teardown sweep 0; counter green **exit 0, 0 findings, couldNotEvaluate []** on the committed bytes; cross-refusal: the r49 counter refuses the r50 receipt with **4 findings**; `--path-selftest` 6/6; two committed red controls carried the pre-data amendments (target race `controls/c2-first-live-run-red-target-race.json`; history model `controls/c2-journey-history-model-red.json` + `controls/c2-model-red-pngs/`) | **met** under the frozen rule; coverage held 9 -> 9; the capability row enters the table below (first-working 50) |
| C3 operability (the r49-closure D3 carry-in: the runtime-existence check becomes a declared could-not-evaluate class) — VERIFIED | `node .ufo/waves/round-49/counters/webview2-receipt-r49.mjs --selftest .ufo/waves/round-49/counters/webview2-receipt-r49-fixtures` (before, at round open); `node .ufo/waves/round-50/counters/webview2-receipt-r50.mjs --selftest .ufo/waves/round-50/counters/webview2-receipt-r50-fixtures` (after, at data) | before: the r49 counter's selftest TODAY exits 1 with **0/8** — every case polluted with `runtime-msedgewebview2-absent` because WebView2 auto-update removed runtime 156.0.4314.50 (host now offers 155.0.4283.62 / 156.0.4314.58; control `controls/c3-r49counter-selftest-today.json`), and the same counter on the two committed r49 receipts exits 1 with ONLY that finding (`controls/c3-r49counter-on-r49-{rel,nav}receipt-today.json` — every content check passes; intents 8/8 modulo the environmental finding, exactly as the closure routed) -> after: the r50 counter (frozen sha `b7f54586…`) grades a missing pinned runtime folder as the DECLARED class `runtime-pin-host-drift` under `couldNotEvaluate` (never a finding), keeps `runtime-msedgewebview2-absent` as a hard finding when the folder exists WITHOUT its exe, and adds a receipt-internal `runtime-identity-mismatch` check (Browser identity vs runtime-folder version tail); selftest **13/13 at the data revision** (`measure/c3-counter-selftest-at-data.json`) with the d3-asis case pinning the REAL removed runtime and passing on this host, and deterministic with-exe/without-exe probes exercising both runtime branches on any host; the counter's own draft defect is carried by a committed red/green pair (draft bytes red **10/13** over the final fixtures, `controls/c3-counter-selftest-draft-counter-red.json`; final bytes green 13/13); the counter exits 0 on the round's own journey receipt with couldNotEvaluate [] (the live runtime exists today) | **met** under the frozen rule; operability held 9 -> 9 |

### Erratum (r49 closure defects D1, D2) — append-only

- **D1 (number drift).** Superseded text: the r49 report, SCORECARD C3 row and lesson Measurements
  quote `grep -c 'cross-page navigation were not exercised' corpus/knowledge/webview2-cdp-loopback-round-48.md`
  as "1 at baseline". Measured today from committed bytes: the command prints **0 at baseline**
  `10ea3d96` (the residual sentence is line-wrapped across lines 84-85: "…were not\n  exercised") and
  **1 at tip** (the supersession quote itself). The revision-stable form prints the substantive truth:
  `git show <REV>:corpus/knowledge/webview2-cdp-loopback-round-48.md | tr '\n' ' ' | tr -s ' ' | grep -o 'cross-page navigation were not exercised' | wc -l`
  -> **1 at baseline, 2 at tip** (the residual + the supersession append quoting it). The r49
  before-state (residual committed at baseline) and the supersession append are real and were
  verified by the closure; only the quoted command/output pair was wrong. These bytes are not edited.
- **D2 (wording drift).** Superseded text: the r49 report and commit message say the S160 row was
  inserted "inside the Registry table after S159". The row actually sits **between S158 and S159**
  (the r49 lesson's Census section carries the same wording). The substantive requirement — inside
  the Registry table, never appended at file end — IS met (census and check-sources clean at 160
  rows; the closure verified both). This round's S161 row was inserted **after the S160 row, before
  the S159 row**, and this erratum names that position explicitly. These bytes are not edited.
- **D4 (this round's provenance-label correction).** The frozen claims.json names the journey
  claim's source as "S161 — opened THIS round" (a new-row plan written at the freeze). The
  check-sources gate refused the drafted S161 row as an E04 duplicate: the URL is already registered
  as **S153** (opened 2026-10-31) and this round's fresh fetch is byte-identical to the registered
  anchor (sha256 `f60f0c02…` on both). The row was withdrawn pre-commit and the claim's ground is
  **S153 re-opened byte-identical this round** (the two history-primitive descriptions located
  verbatim in the opened bytes; catch record `.ufo/waves/round-50/controls/sources-duplicate-row-catch.txt`).
  No frozen predicate leg binds a registry count, so no measured number changes; the S153 row's
  bytes are not edited.

### Capabilities — round 50

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| webview2-multi-step-journey-windows | Carry the webview2 surface through a multi-step journey with CDP history evidence: a 3-page loopback HTTP fixture whose pages carry the invocation-bound nonce, Page.navigate to A, the pages' own anchor clicks B then C, the navigation history read at C (entries [data:, A, B, C] — the initial data: page occupies slot 0), a real back hop via Page.navigateToHistoryEntry to the B entry (forward entry retained), four per-step URL/title/PNG pins in a counter-checked receipt with a keyed teardown to 0 | `scripts/webview2-cdp-loopback-round50.mjs` (`--journey`); `corpus/evidence/round50/webview2-journey/receipt.json` + 4 per-step PNGs; `.ufo/waves/round-50/counters/webview2-receipt-r50.mjs` (journey legs + declared could-not-evaluate class); `corpus/knowledge/webview2-journey-round-50.md` | 50 |

### Round 50 — sources, frontier, trend verdicts

Registry 160 -> 160 (UNCHANGED: the round first drafted a new S161 row for the canonical CDP
protocol definition browser_protocol.json and the check-sources gate refused it E04 duplicate_url —
the URL is already registered as S153 and the fresh fetch is byte-identical to the registered
anchor; the row was withdrawn pre-commit and S153 re-opened with the getNavigationHistory and
navigateToHistoryEntry descriptions located verbatim in the opened bytes). Knowledge notes 65 -> 66
(the journey note). PROVINCE gains the round-50 runner line + the runtime-drift note. Census start AND end
exit 0 (22 pre-existing W04).

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | improved | The measured surface grew again: the webview2 page model now covers a multi-step journey with history-length and back-navigation evidence (0 -> 5 evidence files; a live navigateToHistoryEntry hop recorded and counter-checked), and the capability row `webview2-multi-step-journey-windows` enters the table; S153's re-open (byte-identical fresh fetch) extends a held source row's located ground to the two CDP history primitives (the getNavigationHistory and navigateToHistoryEntry descriptions, verbatim 1 hit each); notes 65 -> 66. |
| quality | improved | Two pre-data instrument defects were caught by live red receipts and repaired under named amendments BEFORE any data committed (the page-target race; the history-model misprediction) — the freeze discipline held under pressure from the live surface; the r49-closure D3 environmental pollution is closed in a versioned counter with the declared class, a hard-defect branch that still refuses, and a committed red/green selftest pair; the adjacency gate survived one live head race inside its frozen budget and reads green; no admitted entry failed a re-check. |
| discernment | improved | Every after-state is an instrument output at a named revision; the round refused its own first design twice (the target race, the history model) and kept both red receipts instead of quietly re-running; the D1/D2 corrections of record quantify the drift from committed bytes rather than re-stating the r49 numbers; the counter's draft defect is disclosed with its failing first read and a reproduced red receipt; the declared could-not-evaluate class is bounded by a named rule (never a finding, only ever one code) that the fixture manifest asserts. |

### Planned / saturation / retired — round 50

- planned: coverage — the journey surface's next residuals: form interaction (fill + submit) on the
  fixture (the r49/r50 planned list's second residual, still unexercised on this surface), and a
  fourth-surface probe only if the host shows one.
- planned: adjacency — the r50 snapshot heads date like any census; re-run meter v10 as the
  regression gate after any sibling roster change; the six sibling-absent rows and the contested-open
  families stay routed to the open fleet L0 (`b6b3b5e4…` :65).
- planned: operability — the declared could-not-evaluate class is adopted; if a future counter
  generation supersedes r50 bytes, keep the rule (missing pinned runtime = named disclosure, never a
  finding) and extend the deterministic branch probes rather than re-pinning host versions.
- saturation 8 / window 3 retained; the r50 capability row keeps the window RESTARTED (round 51 =
  position 1). No axis retired; no score moved (no rubric authorizes one).

## Round 51 — declared claims (frozen before data at 1ecb86bf) and executed disposition (all three verified)

Round 51 on the Windows host. Baseline `c54749228e3b71f3d3c2d1f6a8167d89c2233a8e`; freeze
`1ecb86bf1be4ab88a8ebc99534a3f818346405e8` (claims.json + four instruments + round-open
controls + census start, BEFORE any data); C1 data `33967b108af1ae9f85c96b50dc9b3bebd5a91d62`;
C2 data `08cc4b72552f266cff0bd60a435f7cbcbf430748`; work commit (this block's commit);
final receipt commit (the C3 at-R verdict, post-commit per the r50 `ea11da95` pattern).
Axes at round start: depth 9, coverage 9, operability 9, freshness 9, calibration 9, adjacency 8; Saturation 8 / window 3; the stagnation nudge is inactive (the r50 capability row `webview2-multi-step-journey-windows`, first-working 50, sits inside rounds 48–50) — the lowest-axis obligation applies and C1 works adjacency. Fresh-start ruling honored: the r42/r43/r47 refused claim classes are named in the freeze's freshStartNote and ruled out (no wave/seat claims; no reasoned-not-measured after-states — C3's after-state is a receipt measured against the committed tree post-commit; counters pin committed-byte digests and ship hand-declared refusal fixtures). Carry-in from the r50 non-author closure: D-1, D-2 and D-3 performed as corrections of record (the round-51 lesson's Corrections section governs; no r50 byte edited); item 4, the `tabi | round-44` L2-floor L0 — still open, and its standing mentions are CONSOLIDATED into one PROVINCE.md line this round per the routing note.

| Claim / axis | Counting command | Before -> after | Verdict / score |
|---|---|---|---|
| C1 adjacency (lowest owned axis; the regression-gate re-bind + the meter's host-shape fix) — VERIFIED | `node .ufo/waves/round-50/counters/c1-adjacency-host-v10.mjs --rev c5474922… --repo <lane> --fleet <fleet> --json` (red control, round open); `node .ufo/waves/round-51/counters/c1-adjacency-host-v11.mjs --rev 33967b10… --repo <lane> --fleet <fleet> --json`; `--selftest`; `diff` v10 v11 (`controls/v10-v11-meter.diff`); isolation control `controls/c1-meter-v11-rosterfix-on-r50-ledgers.json` | before: at round open the committed r50 ledger generation measures RED — exit 1, **23 findings** in a NEW class shape (10 audit-status-mismatch + 1 roster-lane-uncovered `.git` + 12 delta-lane-not-on-roster): the fleet root became itself a git worktree and the sibling links are NTFS symlinks, so v10's readdir-isDirectory roster scan derived the roster as {.git} and dropped all 16 siblings; control `controls/c1-meter-v10-red-at-round-open.json` taken before any lane write (a do-nothing control reaches exactly this red, and no re-bind can reach green through it — the meter itself must be fixed) -> after: the versioned v11 meter (rosterScan follows symlinked lanes, skips dot-entries; pure core byte-identical to v10, diff committed) re-reads the SAME r50 ledgers as {roster:16, auditRows:16, deltaLanes:12} with exactly **7 findings, all lane-screen-head-mismatch** (the real staleness; zero sha/lines/quote findings — no province byte moved since r50); audit-r51 (16 rows = 10 unchanged + 6 sibling-absent) and delta-r51 (12 lane rows + 16 line rows) re-bound at ONE fresh snapshot, dispositions carried by exact whole-line quote match, **0 new adjudications** (kengaku's province advanced 732 -> 778 lines with its BG-hit set unchanged at 0), heads re-pinned for the 7 advanced lanes -> **GREEN at `33967b10`: exit 0, predicate true, 0 findings**, counts {roster:16, mapRows:16, auditRows:16, deltaLanes:12}, no correction cycle consumed; v11 selftest 16/16 | **met** under the frozen rule; adjacency held 8 -> 8 |
| C2 coverage (capability extension — the r49/r50 planned form residual, sourced S153 re-opened byte-identical with the Input-domain quotes verbatim) — VERIFIED | `git ls-tree -r --name-only <REV> -- corpus/evidence/round51 \| wc -l` (0 -> 7); `node .ufo/waves/round-51/counters/webview2-receipt-r51.mjs <receipt> --shot … --png-a … --png-b … --png-c … --png-form … --png-echo … --driver scripts/webview2-cdp-loopback-round51.mjs --hostsrc scripts/webview2-host-round48.cs`; cross-refusal `measure/c2-r50counter-refuses-r51.json` | before: the webview2 surface's measured page model ends at the r50 journey; form interaction is committed residual text in the r50 SCORECARD planned section; `corpus/evidence/round51` holds 0 files -> after: at `08cc4b72` the surface carries real form interaction — the 6-leg journey (Page.navigate /a.html -> anchor-click /b.html -> anchor-click /c.html -> Page.navigateToHistoryEntry back to the /b.html entry, targetIndex 2, the measured model) then anchor-click /form.html and a form leg driven with the CDP Input domain (S153): `Input.dispatchMouseEvent` click INTO the field, `Input.insertText` of the invocation-bound nonce `tabi-r51-81bda5e52cf6fee7`, the DOM value read back equal, a second mouse click on the form's own submit button; the GET submit witnessed SERVER-SIDE (fixture served log `/echo?field=<nonce>`, serverSawField true) and CLIENT-SIDE (the echo page renders the received value); history at C [data:, a, b, c] 4/3 and back leg 4/2 reproduced; six per-step URL/title/PNG pins (5,358-9,058 B), Edg/156.0.4314.58, teardown sweep 0; counter r51 green **exit 0, 0 findings, couldNotEvaluate []** on the committed bytes; cross-refusal: the r50 counter refuses the r51 receipt with **5 findings**; counter selftest 17/17 and `--path-selftest` 6/6 at the freeze | **met** under the frozen rule; coverage held 9 -> 9; the capability row enters the table below (first-working 51) |
| C3 operability (the standing environmental selfassessment verdict + the gate's own selftest, both broken on this host since the migration) — VERIFIED | `node scripts/check-selfassessment.mjs --repo <lane> --rev c5474922…` (before, round-baseline bytes); `node scripts/check-selfassessment.mjs --selftest` (45/45); `node scripts/check-selfassessment.mjs --repo <lane> --rev R` (after, at the final content rev R; receipt in the final commit) | before: the round-baseline gate bytes read verdict=failed **mismatches=1** (could_not_evaluate=182 superseded=23) — the single standing m3 class counting 656 status rows of which the measured byte-truth is **650 artifact** (648 byte-identical-or-NTFS-illegal + 2 case-collision spellings) and only the round's own in-progress files real; and the gate's own selftest cannot run on this host at all (`fixture root mismatch` on every fixture) -> after: the v4 gate grades each status row by BYTE TRUTH against the measured tree — byte-identical rows, NTFS-unrepresentable names, and case-collision spellings are the DECLARED class `m3-index-artifact` under couldNotEvaluate (observed null, never a mismatch) while bytes that differ, representable-name absences, and not-in-tree paths stay REAL unlanded rows (aggregate, counted); the separation was measured pre-data over the real tree (`measure/c3-gate-v4-at-baseline-predata.txt`: 650 disclosed vs only round-work rows real); the selftest fix (path-normalized fixture-root comparison; the r49-known EPERM cleanup hardened — cleanup is not a verdict datum) lets the gate's own selftest run here for the first time since the migration: **45/45** with four new cases (artifact-untracked-byte-identical; real-modified-bytes-vs-tree; ntfs-unrepresentable-name, win32-conditional; real-gone-representable-name); sandbox red/green: the baseline v3 bytes read the artifact sandbox mismatches=1 (`controls/c3-v3-baseline-artifact-sandbox-red.txt`), the v4 bytes read the same sandbox clean with the artifact disclosed; the two genuinely-modified inherited worktree files (r33/r42 seat era) restored to their committed bytes under the uncommitted-round-work clause BEFORE the after-measurement; the at-R verdict **exit 0, mismatches=0** with the class disclosed — measured post-commit and landed in the final receipt commit naming R | **met** under the frozen rule (the at-R receipt is the governed after-state); operability held 9 -> 9 |

### Corrections of record (r50-closure D-1/D-2/D-3; the r50 bytes are not edited)

The round-51 lesson's **Corrections of record** section governs all three: D-1 — the v9
red receipt's own Counter (11 head / 4 sha / 4 lines / 2 missing / 1 quote / 2 invented
= 24) supersedes the r50 prose decomposition ("12+3+3…+1"); D-2 — the r50 census-end
sentence describing an S161 row inside the Registry table describes the withdrawn draft
(registry ended at 160, no S161 row); D-3 — the r50 claims.json C3 parenthetical sha
8372402c… is the amendment-2-superseded freeze-time counter sha; the frozenDigests pin
b7f54586… governs and no measured predicate binds 8372402c.

### Tallies this round supersedes (the selfassessment gate v4 case count 41 -> 45)

- `scripts/check-selfassessment.mjs` `--selftest` (45/45): correction — supersedes the
  stale tallies at `SCORECARD.md:1610` and `SCORECARD.md:2760` (each stated the v3-era
  41-case count as oracle-correct at its own tip); v4 adds four m3 byte-truth cases, so
  45 is the oracle-correct figure at this round's tip. The gate prints
  `SELFASSESSMENT_SELFTEST verdict=clean cases=45 passed=45`
  (`.ufo/waves/round-51/measure/c3-selftest-v4-at-instrument.txt`).

### Capabilities — round 51

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| webview2-form-journey-windows | Carry the webview2 surface through real form interaction: the r50 four-leg journey extended by an anchor-click to a GET form page and an input-domain fill+submit — Input.dispatchMouseEvent click into the field, Input.insertText of the invocation-bound nonce, the DOM value read back, a second mouse click on the form's own submit button — with the submission witnessed four ways (form-page nonce marker, DOM value after insert, the rendered echo page, the fixture server's served log) and six per-step URL/title/PNG pins in a counter-checked receipt with a keyed teardown to 0 | `scripts/webview2-cdp-loopback-round51.mjs` (`--form`); `corpus/evidence/round51/webview2-form-journey/receipt.json` + 6 per-step PNGs; `.ufo/waves/round-51/counters/webview2-receipt-r51.mjs` (form checks + declared could-not-evaluate class); `corpus/knowledge/webview2-form-journey-round-51.md` | 51 |

### Round 51 — sources, frontier, trend verdicts

Registry 160 -> 160 (UNCHANGED: S153 re-opened byte-identical — fresh fetch sha256
f60f0c02… equals the registered anchor; the Input.insertText and Input.dispatchMouseEvent
descriptions located verbatim 1 hit each in the opened bytes; the row's used-by column
extended in place per the contract, old->new logged in the lesson). Knowledge notes 66 ->
67 (the form-journey note). PROVINCE gains the round-51 runner line and the standing
L2-floor L0 disposition line (the consolidation). Census start AND end exit 0 (22
pre-existing W04).

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | improved | The measured surface grew again: the webview2 page model now covers real form interaction (0 -> 7 evidence files; a live input-domain fill+submit with a server-side witness recorded and counter-checked), and the capability row `webview2-form-journey-windows` enters the table; S153's re-open (byte-identical fresh fetch) extends a held source row's located ground to the two Input-domain primitives; notes 66 -> 67. |
| quality | improved | The regression gate survived a genuine host-shape change with the fix isolated from the staleness by a committed control (same ledgers, v10 -> roster {.git}/23 findings, v11 -> the 7 real head races); the standing environmental false-failure of the calibration gate is closed in a versioned gate with a sandbox red/green pair and deterministic probes; the gate's own selftest went from cannot-run to 45/45 on this host; no admitted entry failed a re-check (S153 byte-identical third open). |
| discernment | improved | Every after-state is an instrument output at a named revision; the round's three stale-tally supersedes name the exact lines they correct; the fixture authoring drift (14/17 first selftest run) is disclosed with the overwritten-receipt caveat instead of being silently re-run; the two inherited genuinely-modified worktree files were restored to committed bytes under the uncommitted-work clause and disclosed, not smoothed; the meter's fix is scoped by an isolation control so the reader can see fix vs staleness separately. |

### Planned / saturation / retired — round 51

- planned: coverage — the webview2 surface's next depth residual: a per-key typing trace
  (Input.dispatchKeyEvent) as an alternative fill mechanism, and a fourth-surface probe
  only if the host shows one; the C1 pattern continues: re-run meter v11 as the
  regression gate after any sibling roster change.
- planned: operability — the m3 byte-truth rule is adopted in v4; if a future gate
  generation supersedes v4 bytes, keep the declared class (artifact rows disclosed,
  never a mismatch) and extend the deterministic probes rather than re-pinning host
  behavior; the m1 selftest-oracle now runs on this host — keep the four docs' tallies
  oracle-correct at every tip (the supersede-with-citation pattern).
- planned: adjacency — the r51 snapshot heads date like any census; the contested-open
  families stay routed to the open fleet L0 (`b6b3b5e4…` :65).
- saturation 8 / window 3 retained; the r51 capability row keeps the window RESTARTED
  (round 52 = position 1). No axis retired; no score moved (no rubric authorizes one).

### Round 51 — tally-supersession addendum (the final receipt commit; the m1 oracle's first host-side run caught these)

The first at-R run of the v4 gate (rev `b3abd0ba44e4b5420d9b91de64d207a6be202b1e`,
receipt `.ufo/waves/round-51/measure/c3-gate-v4-at-R.txt`) surfaced 19 stale
self-test-tally mentions the 41 -> 45 case-count change orphaned across the four m1
windows — the gate's own first complete host-side pass doing exactly its job. This
addendum supersedes every one of them with the oracle-correct figure:

- `scripts/check-selfassessment.mjs` `--selftest` (45/45): correction — supersedes the
  stale tallies at `SCORECARD.md:1439-1610` (the pre-v4 correction chain: the 17, 22,
  22, 30 and 41 figures each named an earlier tip's count and the chain's final
  oracle-correct claim was itself the v3-era count). The gate prints
  `SELFASSESSMENT_SELFTEST verdict=clean cases=45 passed=45`
  (`.ufo/waves/round-51/measure/c3-selftest-v4-at-instrument.txt`); 45 is the
  oracle-correct figure at this round's tip, and the same figure supersedes the stale
  mentions in the other three windows via the addenda landed beside this block
  (`LOG.md`, `SKILL.md`, `corpus/README.md`).
- `scripts/check-selfassessment.mjs` `--selftest` (45/45): correction — supersedes the stale tallies at `SCORECARD.md:1439`, `SCORECARD.md:1465`, `SCORECARD.md:1486`, `SCORECARD.md:1564` and `SCORECARD.md:1610` (the pre-v4 correction chain — the 17, 22, 22, 30 and 41 figures those lines state are each an earlier tip's count, and the chain's final oracle-correct claim was itself the v3-era count); the gate prints `SELFASSESSMENT_SELFTEST verdict=clean cases=45 passed=45` (`.ufo/waves/round-51/measure/c3-selftest-v4-at-instrument.txt`); 45 is the oracle-correct figure at this round's tip; the wrapped addendum above carries the same supersession for the paragraph-based windows, this single-line form carries it for the SCORECARD window whose supersession is line-scoped.

## Round 52 - declared claims (frozen before data at 8016e67e) and executed disposition (both verified)

Round 52 on the Windows host. Baseline `d24d31ea2c7a28f74ae41145446bb98e75b4bd0d`; freeze
`8016e67ea5d9ee9ef10710602d9293b86e397987` (claims.json + three instruments + round-open
controls + census start, BEFORE any data); C1 data
`62d0cd6e8d0e20d643adbe88349ef0a27b339c82`; C1 correction 1
`c58469826af2b4a6d4a5ff59919d1d6cd39768f9`; C2 data
`11d6aeb3f5e626d09320521646b994dafa7651e2`; C1 correction 2
`7d91d5e31d448230578a06f63f566188c39706a2` (the cited green revision); work commit (this
block's commit). Axes at round start: adjacency 8, coverage 9, depth 9, operability 9,
freshness 9, calibration 9; saturation 8 / window 3; the r51 capability row
(`webview2-form-journey-windows`, first-working 51) keeps the stagnation window
RESTARTED (round 52 = position 1) - the nudge is inactive, the lowest-axis obligation
applies, and C1 works adjacency. Fresh-start ruling honored: the r42/r43/r47 refused
claim classes re-read and ruled out in the freeze's freshStartNote (no wave/seat claims;
no reasoned-not-measured after-states - both after-states are committed instrument
outputs at named revisions; counters pin committed-byte digests and ship hand-declared
refusal fixtures). Carry-in from the r51 non-author closure: R51-V1 (the emitted
predicateSentence token) fixed by the v12 bump and measured at the freeze
(`measure/c1-emitted-token-check.txt`); the L2-floor L0 routed around per the standing
PROVINCE.md disposition line.

| Claim / axis | Counting command | Before -> after | Verdict / score |
|---|---|---|---|
| C1 adjacency (lowest owned axis; the regression-gate re-bind + the v12 meter bump landing the routed R51-V1 token fix) - VERIFIED | `node .ufo/waves/round-51/counters/c1-adjacency-host-v11.mjs --rev d24d31ea... --repo <lane> --fleet <fleet> --json` (red control, round open); `node .ufo/waves/round-52/counters/c1-adjacency-host-v12.mjs --rev 7d91d5e3... --repo <lane> --fleet <fleet> --json`; `--selftest`; `diff` v11 v12 (`controls/v11-v12-meter.diff`); `measure/c1-emitted-token-check.txt` | before: at round open the committed r51 ledger generation measures RED - exit 1, **9 findings** (7 lane-screen-head-mismatch: chousa, kengaku, mori, shokunin-binary-forensics, shokunin-reverse-engineering, tameshi, tsukuroi - the heads advanced since the r51 snapshot; + the kumitate audit pair: claimed unchanged, observed moved at SCORECARD.md:1723); ZERO sha/lines/quote findings, so no screened province byte moved (control `controls/c1-meter-v11-red-at-round-open.json` taken before any lane write - a do-nothing control reaches exactly this red, and green requires the re-bind work the do-nothing control does not perform) -> the versioned v12 meter (frozen digest 8789ac3f...) differs from v11 ONLY in comments, the r52 ledger rebind, schema strings and the emitted predicateSentence token (`c1-adjacency-host-v10 admits` -> `c1-adjacency-host-v12 admits`; the header comment v7 -> v12) - the routed R51-V1 fix, measured at the freeze (`measure/c1-emitted-token-check.txt`); pure core byte-identical to v11, selftest 16/16; audit-r52 (16 rows = 9 unchanged + 6 sibling-absent + 1 moved - the kumitate row honestly moved with the meter-derived note `text now at :1736`) and delta-r52 (12 lane rows + 16 line rows) re-bound at one fresh snapshot, dispositions carried by exact whole-line quote match, **0 new adjudications**; the green run raced TWICE on concurrent sibling commits (tsukuroi at correction 0; kengaku+mori at correction 1) and the frozen correction flow re-bound both times -> **GREEN at `7d91d5e3`: exit 0, predicate true, 0 findings**, counts {roster:16, mapRows:16, auditRows:16, deltaLanes:12}; both correction cycles of the frozen two-cycle budget consumed, both raced receipts committed | **met** under the frozen rule; adjacency held 8 -> 8 |
| C2 coverage (capability extension - the r51 planned residual: the per-key key-event typing trace as the alternative fill mechanism; sourced S153 re-opened byte-identical a fourth time with the dispatchKeyEvent description verbatim) - VERIFIED | `git ls-tree -r --name-only <REV> -- corpus/evidence/round52 | wc -l` (0 -> 7); `node .ufo/waves/round-52/counters/webview2-receipt-r52.mjs <receipt> --shot ... --png-a ... --png-b ... --png-c ... --png-form ... --png-echo ... --driver scripts/webview2-cdp-loopback-round52.mjs --hostsrc scripts/webview2-host-round48.cs`; cross-refusals `measure/c2-r51counter-refuses-r52.json` + `measure/c2-r52counter-refuses-r51.json` | before: the surface's measured fill mechanism ended at the r51 insertText (one synthetic insertion, before/after witness); the per-key typing trace was committed residual text in the r51 SCORECARD planned section; `corpus/evidence/round52` held 0 files -> after: at `11d6aeb3` the receipt records the 6-leg journey (Page.navigate /a.html -> anchor-click /b.html -> /c.html -> navigateToHistoryEntry back to /b.html, targetIndex 2 -> anchor-click /form.html -> form-submit /echo?field=<nonce>) with the fill driven as **25 real `Input.dispatchKeyEvent` keyDown/keyUp pairs** (per-character derived code/VK: digits Digit<N>+48+N, letters Key<X>+65+, hyphen Minus+189; `keyEventCount` 50) and the DOM value read back after EVERY keystroke (`typing[]` 25 per-keystroke prefix witnesses, `allPrefixTrue` true, `valueBeforeFirstKey` '') - the per-keystroke delivery evidence the r51 before/after shape cannot carry (a dropped or duplicated key, or a value-set fill, is distinguishable); the invocation-bound nonce `tabi-r52-48b62c227a28283d` witnessed four ways (form-page marker, typed value, rendered echo page, fixture served log) plus the trace; history at C [data:, a, b, c] 4/3 and back leg 4/2 reproduced a third time; six per-step URL/title/PNG pins; Edg/156.0.4314.58; keyed teardown sweep 0; counter r52 green **exit 0, 0 findings, couldNotEvaluate []** - the counter re-derives every typing entry's code/VK from the receipt's own nonce; cross-refusal SYMMETRIC: the r51 counter refuses the r52 receipt with **6 findings** and the r52 counter refuses the committed r51 receipt with **6 findings incl. typing-missing**; counter selftest 50/50 at the freeze (48 refusal fixtures incl. 10 typing-trace refusals; first authoring run 49/50, fixed before the freeze, disclosed); `--path-selftest` 6/6 | **met** under the frozen rule; coverage held 9 -> 9; the capability row enters the table below (first-working 52) |

### Capabilities - round 52

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| webview2-keyevent-typing-windows | Drive the webview2 surface's form fill as a PER-KEYSTROKE key-event trace: every nonce character rides a real Input.dispatchKeyEvent keyDown (text/key/code/windowsVirtualKeyCode derived per character) + keyUp pair, with the field's DOM value read back after EACH keystroke - a per-keystroke prefix witness proving one character delivered per keystroke, in order - then the submit through the form's own button with the four r51-class witnesses (form-page marker, typed value, rendered echo, fixture server's served log); the counter re-derives the code/VK mapping from the receipt nonce and checks every prefix, and a 50-case hand-declared fixture set exercises every finding id including ten typing-trace refusals | `scripts/webview2-cdp-loopback-round52.mjs` (`--form`); `corpus/evidence/round52/webview2-keyevent-typing/receipt.json` + 6 per-step PNGs; `.ufo/waves/round-52/counters/webview2-receipt-r52.mjs` + `webview2-receipt-r52-fixtures/` (50 cases); `corpus/knowledge/webview2-keyevent-typing-round-52.md` | 52 |

### Round 52 - sources, frontier, trend verdicts

Registry 160 -> 160 (UNCHANGED: S153 re-opened byte-identical - fourth consecutive
identical fetch, sha256 f60f0c02... equals the registered anchor; the dispatchKeyEvent
description "Dispatches a key event to the page." located verbatim 1 hit in the opened
bytes; the row's used-by column extended in place per the contract, old->new logged in
the lesson). Knowledge notes 67 -> 68 (the keyevent-typing note). PROVINCE gains the
round-52 runner line and the standing concurrent-fleet head-race note. Census start AND
end exit 0 (22 pre-existing W04).

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | improved | The measured surface grew again: the webview2 fill model now carries per-keystroke delivery evidence (0 -> 7 evidence files; 50 real key events with 25 prefix witnesses, live and counter-checked), and the capability row `webview2-keyevent-typing-windows` enters the table; S153's re-open (byte-identical fourth fetch) extends a held source row's located ground to the dispatchKeyEvent primitive; notes 67 -> 68. |
| quality | improved | The regression gate absorbed another host reality - concurrent sibling commits racing the green run - inside its pre-declared correction flow (both cycles consumed, both raced receipts committed, the green reached at `7d91d5e3` with zero byte drift in the screened provinces across all three snapshots); the routed R51-V1 instrument-output drift is fixed in a versioned bump with the fix isolated to the emitted sentence (pure core byte-identical, diff committed, fix measured at the freeze); the new counter ships 48 refusal fixtures covering every finding id it can emit, and both cross-generation refusals measured symmetric. |
| discernment | improved | Every after-state is an instrument output at a named revision (the green names `7d91d5e3`, the receipt names `11d6aeb3`); the two head races are disclosed with their raced receipts instead of being silently re-run into a clean story; the fixture authoring drift (49/50 first run) and the receipt birth-name drift (two "green"-named receipts holding failed runs) are mined as Mistakes rows instead of being smoothed; the v12 header generation defect (the corrupted historical quotation, the dropped P1/P2/P3 block) was caught by diff review before any run and mined. |

### Planned / saturation / retired - round 52

- planned: coverage - the webview2 surface's next residuals: keyboard-modifier chords
  (Shift/Ctrl rides on the key-event trace: modifier flags + capitalized-letter VKs) and
  a fourth-surface probe only if the host shows one; the C1 pattern continues: re-run
  the current meter generation as the regression gate after any sibling roster change
  (the concurrent-fleet standing note now in PROVINCE).
- planned: adjacency - keep the dispositions carried by exact whole-line quote match;
  if a screened province's bytes ever change, adjudicate the genuinely new BG lines
  within the frozen vocabulary and count them in the claims.
- planned: operability - keep the four m1 windows' tallies oracle-correct at every tip
  (the supersede-with-citation pattern); no gate generation change is planned.
- saturation 8 / window 3 retained; the r52 capability row keeps the window RESTARTED
  (round 53 = position 1). No axis retired; no score moved (no rubric authorizes one).

### Round 52 - tally-supersession addendum (the at-R gate pass surfaced six pre-r48 adjacency-gate tallies the 57 -> 64 case-count change had orphaned)

- `scripts/check-adjacency.mjs` `--self-test` (64/64): correction — supersedes the stale tallies at `SCORECARD.md:1195`, `SCORECARD.md:1829`, `SCORECARD.md:1853` and `SCORECARD.md:2545` (each states a pre-r48 generation's count as oracle-correct at its own tip; the r48 `--fleet-repo` and whole-line-quote repairs added seven cases); the gate prints `ADJACENCY_SELFTEST verdict=clean cases=64 reasons=18 could_not_evaluate=6` (`.ufo/waves/round-52/measure/adjacency-selftest-at-work.txt`); 64 is the oracle-correct figure at this round's tip. The tally, the marker and all four citations share this one physical line — the SCORECARD window's supersession is line-scoped and reads the clearing line's own text only (the r51 `8e2fe015` lesson, re-learned here after the first wrapped attempt failed to clear).

## Round 53 - declared claims (frozen before data at eec453d9, amended once before any data) and executed disposition (both verified)

Round 53 on the Windows host. Baseline `3abdeba6faa574edd8120661341a8a15c181ad55`; freeze
`eec453d99fd3821a4d10f5a3c437cfc478f58b36` (claims.json + three instruments + round-open
controls + census start, BEFORE any data); PRE-DATA AMENDMENT 1
`1d0f07931b91e30c608e00c3799df6e76427f049` (the runner's formMode ok-chain was generated
without its leading `const f` declaration - the FIRST live run crashed at the ok-chain
after the journey; red receipt kept and named `controls/c2-live-run1-crash-f-undefined.txt`;
the fix restores the one declaration, fixtures regenerated, selftests re-run - the
sanctioned r50 pattern, disclosed in the lesson); C2 data
`1bb1ca43fe643b6403384d06479d7fcb6238fbdb`; C1 data
`e87c695847a49403034ba3db3e8eda77cd8f6533`; C1 correction 1
`99ff0c6b51d02a117c0cc5dc055c7e45e56d19e3` (the cited green revision); work commit (this
block's commit). Axes at round start: adjacency 8, coverage 9, depth 9, operability 9,
freshness 9, calibration 9; saturation 8 / window 3; the r52 capability row
(`webview2-keyevent-typing-windows`, first-working 52) keeps the stagnation window
RESTARTED (round 53 = position 1) - the nudge is inactive, the lowest-axis obligation
applies, and C1 works adjacency. Fresh-start ruling honored: the r42/r43/r47 refused
claim classes re-read and ruled out in the freeze's freshStartNote (no wave/seat claims;
no reasoned-not-measured after-states - both after-states are committed instrument
outputs at named revisions; counters pin committed-byte digests and ship hand-declared
refusal fixtures). Carry-in from the r52 non-author closure (all three routed, none is a
claim): item 1 - the r52 claims.json "9 vs 10" typing-refusal prose drift corrected as a
Correction of record, the fixture oracle measured at 10
(`.ufo/waves/round-53/measure/c2-r52-typing-count-check.txt`), no frozen r52 byte edited,
forward prose carries 10; item 2 - the SHONEN promotion-review note is operator-owned,
routed around (boxes stay [~]); item 3 - the receipt-counter selftest repo-root layout
sensitivity PINNED inside the r53 counter (named error `selftest-repo-root-layout`, exit 2
before any case runs; `controls/selftest-layout-pin.txt`).

| Claim / axis | Counting command | Before -> after | Verdict / score |
|---|---|---|---|
| C1 adjacency (lowest owned axis; the regression-gate re-bind + the v13 meter generation bump, no routed meter-token carry-in this round) - VERIFIED | `node .ufo/waves/round-52/counters/c1-adjacency-host-v12.mjs --rev 3abdeba6... --repo <lane> --fleet <fleet> --json` (red control, round open); `node .ufo/waves/round-53/counters/c1-adjacency-host-v13.mjs --rev 99ff0c6b... --repo <lane> --fleet <fleet> --json`; `--selftest`; `diff` v12 v13 (`controls/v12-v13-meter.diff`); `measure/c1-token-check-r53.txt` | before: at round open the committed r52 ledger generation measures RED - exit 1, **5 findings** (5 lane-screen-head-mismatch: kengaku, mori, shokunin-binary-forensics, shokunin-reverse-engineering, tameshi - the heads advanced since the r52 snapshot); ZERO sha/lines/quote findings, so no screened province byte moved (control `controls/c1-meter-v12-red-at-round-open.json` taken before any lane write - a do-nothing control reaches exactly this red, and green requires the re-bind work the do-nothing control does not perform) -> the versioned v13 meter (frozen digest 87d08cff...) differs from v12 ONLY in comments, the r53 ledger rebind, schema strings and the emitted predicateSentence + header PREDICATE-SENTENCE token (`c1-adjacency-host-v12 admits` -> `c1-adjacency-host-v13 admits`) - pure core byte-identical to v12, selftest 16/16, the Round 52 delta paragraph's historical numbers quoted verbatim (the r52 corrupted-quotation class guarded, `measure/c1-token-check-r53.txt`); audit-r53 (16 rows = 9 unchanged + 6 sibling-absent + 1 moved - the kumitate row honestly moved with the meter-derived note `text now at :1736`) and delta-r53 (12 lane rows + 16 line rows) re-bound at one fresh snapshot, dispositions carried by exact whole-line quote match, **0 new adjudications, 0 dropped stale quotes**; the green run raced ONCE on a concurrent sibling commit (tameshi at correction 0 - the raced receipt named by OUTCOME `measure/c1-meter-raced-at-correction0.json`, the r52 lesson's birth-name class fix applied) and the frozen correction flow re-bound -> **GREEN at `99ff0c6b`: exit 0, predicate true, 0 findings**, counts {roster:16, mapRows:16, auditRows:16, deltaLanes:12}; one of the two correction cycles consumed, receipt committed | **met** under the frozen rule; adjacency held 8 -> 8 |
| C2 coverage (capability extension - the r52 planned residual: keyboard-modifier chords on the per-key key-event trace; sourced S153 re-opened byte-identical a FIFTH time with the modifiers bit-field description located) - VERIFIED | `git ls-tree -r --name-only <REV> -- corpus/evidence/round53 | wc -l` (0 -> 7); `node .ufo/waves/round-53/counters/webview2-receipt-r53.mjs <receipt> --shot ... --png-a ... --png-b ... --png-c ... --png-form ... --png-echo ... --driver scripts/webview2-cdp-loopback-round53.mjs --hostsrc scripts/webview2-host-round48.cs`; cross-refusals `measure/c2-r52counter-refuses-r53.json` + `measure/c2-r53counter-refuses-r52.json` | before: the surface's measured key-event model ended at the r52 plain per-key trace (lowercase nonce only, modifiers: 0 throughout - no modifier-key coverage); the Shift-chord residual was committed text in the r52 SCORECARD planned section; `corpus/evidence/round53` held 0 files -> after: at `1bb1ca43` the receipt records the 6-leg journey with the fill driven as TWO real per-key key-event traces - the r52 plain trace into #field (25 keyDown/keyUp pairs, keyEventCount 50, 25 per-keystroke prefix witnesses, allPrefixTrue true) AND the Shift-chord trace into #field2: the invocation-bound nonce UPPERCASED typed with real Shift rides (ShiftLeft VK 16 keyDown/keyUp around every uppercase letter's pair, the letter's event carrying **modifiers: 8** - S153's Input.dispatchKeyEvent modifiers bit field, Shift=8, the round's located ground - and the shifted key/text; digits and hyphen unshifted at modifiers 0), 25 chord entries with per-keystroke DOM prefix witnesses (allPrefixTrue true), keyEventCount **70** = 10 shifted chars x 4 + 15 unshifted x 2; the GET submit through the form's own button carrying BOTH parameters (`/echo?field=<nonce>&mixed=<uppercased>`), witnessed SERVER-SIDE (fixture served log) and CLIENT-SIDE (echo page renders both values); nonce `tabi-r53-281215ca50c47cd8`, Edg/156.0.4314.58, history at C 4/3 and back leg 4/2 reproduced a fourth time; six per-step URL/title/PNG pins; keyed teardown sweep 0; host-exe-reused with provenance pinned (the per-blob spawn-verdict host condition - three blocked fresh compiles kept and named in the lesson, the positive r52-control run recorded); counter r53 green **exit 0, 0 findings, couldNotEvaluate []** - the counter re-derives both traces' code/VK/shiftRide/modifiers from the receipt's own nonce and checks every prefix on both fields; cross-refusal SYMMETRIC: the r52 counter refuses the r53 receipt with **7 findings** and the r53 counter refuses the committed r52 receipt with **10 findings incl. chords-missing**; counter selftest **85/85** (82 refusals covering every harness-expressible finding id incl. 16 chord-refusal cases and the 10-id r52 typing chain; manifest asserts exact findings + the declared cne rule per case); `--path-selftest` 6/6; the selftest repo-root layout expectation PINNED (wrong layout exit 2, `selftest-repo-root-layout` - the r52-closure carry-in item 3) | **met** under the frozen rule; coverage held 9 -> 9; the capability row enters the table below (first-working 53) |

### Capabilities - round 53

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| webview2-keyevent-modifier-chords-windows | Drive the webview2 surface's form fill as TWO per-key key-event traces: the r52 plain trace (every nonce character rides a real keyDown/keyUp pair with per-keystroke prefix witnesses) PLUS a Shift-chord trace - the invocation-bound nonce UPPERCASED typed into the form's second field where every uppercase letter rides a real Shift keyDown/keyUp (ShiftLeft, VK 16) around its keyDown/keyUp pair, the letter's event carrying modifiers 8 (S153's Shift=8 bit) and the shifted key/text, digits/hyphen unshifted - with the field's DOM value read back after EACH keystroke on BOTH fields; the submit carries both query parameters and is witnessed server-side and client-side; the counter re-derives both traces incl. shiftRide/modifiers and checks every prefix, and an 85-case hand-declared fixture set exercises every harness-expressible finding id including sixteen chord refusals; the selftest pins its repo-root layout expectation (named error, exit 2) | `scripts/webview2-cdp-loopback-round53.mjs` (`--form`); `corpus/evidence/round53/webview2-modifier-chords/receipt.json` + 6 per-step PNGs; `.ufo/waves/round-53/counters/webview2-receipt-r53.mjs` + `webview2-receipt-r53-fixtures/` (85 cases); `corpus/knowledge/webview2-keyevent-modifier-chords-round-53.md` | 53 |

### Round 53 - sources, frontier, trend verdicts

Registry 160 -> 160 (UNCHANGED: S153 re-opened byte-identical - FIFTH consecutive
identical fetch, sha256 f60f0c02... equals the registered anchor; the located ground
this round is the Input.dispatchKeyEvent modifiers parameter description "Bit field
representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8 (default:
0)." (12 words, carried as one JSON string with a \n wrap in the opened bytes) and the
command description still verbatim 1 hit; the row's used-by column extended in place
per the contract, old->new logged in the lesson). Knowledge notes 68 -> 69 (the
modifier-chords note). PROVINCE gains the round-53 runner line and the standing
per-blob spawn-verdict host note. Census start AND end exit 0 (22 pre-existing W04).
`node scripts/check-sources.mjs` -> SOURCES_GATE verdict=clean rows=160 findings=0
(`.ufo/waves/round-53/measure/check-sources-at-work.txt`).

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | improved | The measured surface grew again: the webview2 key-event model now covers MODIFIER CHORDS (0 -> 7 evidence files; two real per-key traces in one fill with per-keystroke prefix witnesses on both fields, live and counter-checked), and the capability row `webview2-keyevent-modifier-chords-windows` enters the table; S153's re-open (byte-identical fifth fetch) extends a held source row's located ground to the modifiers bit field; notes 68 -> 69. |
| quality | improved | The regression gate absorbed another concurrent sibling-commit race inside its pre-declared correction flow (the raced receipt named by OUTCOME per the r52 lesson's class fix, green at `99ff0c6b` with zero byte drift in the screened provinces); the generation bump is isolated to comments/ledger names/schema strings/token with the pure core byte-identical (diff committed, diff-reviewed before any run - and the diff review of the RUNNER missed nothing while its ok-chain splice did, which the amendment caught and mined); the new counter ships 85 hand-declared fixtures with exact-findings assertions, both cross-generation refusals measured symmetric, and the routed layout-pin carry-in landed inside the counter generation. |
| discernment | improved | Every after-state is an instrument output at a named revision (the green names `99ff0c6b`, the receipt names `1bb1ca43`); the ok-chain crash, the three blocked fresh compiles, and the correction race are all disclosed with kept-and-named receipts and mined as Mistakes rows (including the one PASS recorded to show the r52 birth-name class fix working); the pre-data amendment names its own red receipt and the byte it supersedes; the lane did not self-check its SHONEN boxes (the operator-owned gate routed around per the closure's routing). |

### Planned / saturation / retired - round 53

- planned: coverage - the webview2 surface's next residuals: Ctrl/Alt/Meta chords
  (modifiers 2/1/4 on the key-event trace - Shift only this round) and a
  fourth-surface probe only if the host shows one; the C1 pattern continues: re-run
  the current meter generation as the regression gate after any sibling roster change.
- planned: adjacency - keep the dispositions carried by exact whole-line quote match;
  if a screened province's bytes ever change, adjudicate the genuinely new BG lines
  within the frozen vocabulary and count them in the claims.
- planned: operability - keep the four m1 windows' tallies oracle-correct at every tip
  (the supersede-with-citation pattern); no gate generation change is planned.
- saturation 8 / window 3 retained; the r53 capability row keeps the window RESTARTED
  (round 54 = position 1). No axis retired; no score moved (no rubric authorizes one).

## Round 54 - declared claims (frozen before data at f92c544e) and executed disposition (both verified)

Round 54 on the Windows host. Baseline `3a415cbcadceeebbf9565906f36348e9ef09ac38`; freeze
`f92c544e5e1703a04e7b003c5f2f747208b20f71` (claims.json + three instruments + round-open
controls + census start, BEFORE any data); C2 data
`4d3dca816e5f242b6cd5e7628b96918eec6ec1b7` (the live chord-domain receipt + six PNGs +
counter green + both cross-refusals + the spawn-blocked first run's committed stderr; the
runner bytes were NEVER amended - the freeze held); C1 data
`435ea4ce8b4962f29331888401f3cba6bdf3b959` (the cited green revision - the ledgers commit
itself; correction 0, no correction cycle consumed, the first round since 46 with none);
work commit (this block's commit). Axes at round start: adjacency 8, coverage 9, depth 9,
operability 9, freshness 9, calibration 9; saturation 8 / window 3; the r53 capability row
(`webview2-keyevent-modifier-chords-windows`, first-working 53) keeps the stagnation window
RESTARTED (round 54 = position 1) - the nudge is inactive, the lowest-axis obligation
applies, and C1 works adjacency. Fresh-start ruling honored: the r42/r43/r47 refused
claim classes re-read and ruled out in the freeze's freshStartNote (no wave/seat claims;
no reasoned-not-measured after-states - both after-states are committed instrument
outputs at named revisions; counters pin committed-byte digests and ship hand-declared
refusal fixtures). Carry-in from the r53 non-author closure (all three routed, none is a
claim): D1 - the cited-but-destroyed scratch stderr corrected of record, the convention
NAMED (the committed-stderr rule) and landed as QUALITY.md criterion 108 citing the
round-54 lesson, the class's evidence regenerated under the convention
(`controls/hostexe-fresh-compile-spawn-verdict.json`; the r53 bytes disclosed LOST);
D2 - the `compileReuse` prose drift corrected of record, the receipt shape measured
(`measure/d2-receipt-shape-check.txt`: 0 hits; the disclosure is the
`{"step": "host-exe-reused"}` step + hostExeSha256/hostCsSha256 pins), no frozen r53
byte edited; D3 - the L2-floor L0 already consolidated as the standing PROVINCE.md
disposition line, referred to only.

| Claim / axis | Counting command | Before -> after | Verdict / score |
|---|---|---|---|
| C1 adjacency (lowest owned axis; the regression-gate re-bind + the v14 meter generation bump, which also FIXES a v13 instrument-output name-leftover found by this round's diff review) - VERIFIED | `node .ufo/waves/round-53/counters/c1-adjacency-host-v13.mjs --rev 3a415cbc... --repo <lane> --fleet <fleet> --json` (red control, round open); `node .ufo/waves/round-54/counters/c1-adjacency-host-v14.mjs --rev 435ea4ce... --repo <lane> --fleet <fleet> --json`; `--selftest`; `diff` v13 v14 (`controls/v13-v14-meter.diff`); `measure/c1-token-check-r54.txt` | before: at round open the committed r53 ledger generation measures RED - exit 1, **7 findings** (5 lane-screen-head-mismatch: kengaku, mori, shokunin-binary-forensics, shokunin-reverse-engineering, tameshi - the heads advanced since the r53 snapshot; PLUS lane-screen-sha-mismatch AND lane-screen-lines-mismatch both on kengaku - its PROVINCE.md bytes changed since the r53 snapshot, the first screened-province byte change since r48); ZERO audit findings, so no map row moved as of round open (control `controls/c1-meter-v13-red-at-round-open.json` taken before any lane write - a do-nothing control reaches exactly this red, and green requires the re-bind work the do-nothing control does not perform) -> the versioned v14 meter (frozen digest c9357c96...) differs from v13 ONLY in header comments (incl. the Round 54 delta paragraph quoting the red control's numbers), the ledger rebind to the r54 names, the schema strings - INCLUDING THE FIX: v13's run-output JSON emitted `schema: "tabi-adjacency-host-v12"` while its die/selftest/sentence strings said v13 (the v13 bump missed the run-output field; the same name-leftover class as the routed D2 lesson-prose drift), and v14 emits `tabi-adjacency-host-v14` in all four places - the usage strings, and the emitted predicateSentence + header token (`c1-adjacency-host-v13 admits` -> `c1-adjacency-host-v14 admits`) - pure core byte-identical to v13, selftest 16/16, the Round 53 delta paragraph's historical numbers quoted verbatim (`measure/c1-token-check-r54.txt`); audit-r54 (16 rows = 9 unchanged + 6 sibling-absent + 1 moved - the kumitate row honest at :1736) and delta-r54 (12 lane rows + 16 line rows) re-bound at ONE fresh snapshot with dispositions carried by exact whole-line quote match, **0 new adjudications** - kengaku re-screened at its new head (f97e5b7b): 847 lines re-derived with ZERO browser-ground hits, so its lane row re-bound sha/lines/bgHits and no line row changed; **GREEN at `435ea4ce` at correction 0**: exit 0, predicate true, **0 findings**, counts {roster:16, mapRows:16, auditRows:16, deltaLanes:12} - no correction cycle consumed (the first round since 46 with none), receipt `measure/c1-meter-green-at-data.json` named by OUTCOME | **met** under the frozen rule; adjacency held 8 -> 8 |
| C2 coverage (capability acquisition - the r53 planned residual: the Ctrl/Alt/Meta modifier domain on the key-event trace, witnessed by the page's own DOM keydown record; S153 re-opened byte-identical a SIXTH time for the bits, S161 NEW for the DOM booleans) - VERIFIED | `git ls-tree -r --name-only <REV> -- corpus/evidence/round54 | wc -l` (0 -> 7); `node .ufo/waves/round-54/counters/webview2-receipt-r54.mjs <receipt> --shot ... --png-a ... --png-b ... --png-c ... --png-form ... --png-echo ... --driver scripts/webview2-cdp-loopback-round54.mjs --hostsrc scripts/webview2-host-round48.cs`; cross-refusals `measure/c2-r53counter-refuses-r54.json` + `measure/c2-r54counter-refuses-r53.json` | before: the surface's measured key-event model ended at the r53 Shift chords (bit 8 only - the Ctrl/Alt/Meta bits 2/1/4 had no coverage, and the only witness of modifier state was the driver's own dispatch log); the chord-domain residual was committed text in the r53 SCORECARD planned section; `corpus/evidence/round54` held 0 files -> after: at `4d3dca81` the receipt records the 6-leg journey with the fill driven as THREE per-key traces - the r52 plain trace (25 pairs, keyEventCount 50, per-keystroke prefix witnesses, allPrefixTrue) and the r53 Shift-chord trace (keyEventCount 70, allPrefixTrue) BOTH UNCHANGED, PLUS the chord-domain leg: the fixture page carries an inline keydown RECORDER (window.__keylog - the page's OWN record of every delivered keydown with its modifier booleans), three real chords Control/Alt/Meta (S153's bits 2/1/4) on the nonce-derived letter (first [a-f] of the hex tail - `d`; #field3 has no name attribute and is never submitted), 4 key events each (modifier keyDown, the letter's keyDown with NO text, letter keyUp, modifier keyUp; 12 total), per-chord domEvents read back from the page (the modifier's own keydown Control/ControlLeft/17 + ctrlKey true, Alt/AltLeft/18 + altKey true, Meta/MetaLeft/91 + metaKey true, then the letter's keydown KeyD/68 + its chord's boolean; shiftKey false throughout) - the bit<->boolean correspondence MEASURED LIVE and grounded on both ends (S153 bits, S161 DOM booleans); the keylog window +6; #field3 stays EMPTY (the negative witness - a modifier chord inserts nothing); `journey.form.pageKeylog` = the page's COMPLETE 70-entry keydown record of the fill, re-derived END TO END by the counter from the receipt's own nonce and matched entry by entry; nonce `tabi-r54-6da3859c91bdfddb`; the GET submit carrying both parameters witnessed SERVER-SIDE and CLIENT-SIDE; history 4/3 and back leg 4/2 reproduced a fifth time; six per-step URL/title/PNG pins; Edg/156.0.4314.58; keyed teardown sweep 0; host-exe-reused with provenance pinned (the per-blob spawn-verdict condition RECURRED at the data run: the fresh compile spawn-refused UNKNOWN errno -4094, the blocked run's stderr COMMITTED at `controls/c2-live-run1-spawn-unknown.txt` under the round's own convention, the documented r53 class fix applied - the proven smoke-run blob seeded, the reuse disclosed by the receipt's host-exe-reused step + pins); counter r54 green **exit 0, 0 findings, couldNotEvaluate []** - the counter re-derives all three traces incl. the chord-domain plan and the COMPLETE page keylog from the receipt's own nonce; cross-refusal SYMMETRIC: the r53 counter refuses the r54 receipt with **5 findings** and the r54 counter refuses the committed r53 receipt with **7 findings incl. chord-domain-missing and keylog-missing**; counter selftest **96/96** at the frozen bytes (93 refusals covering every harness-expressible finding id incl. eleven new round-54 chord-domain/keylog cases; exact-findings manifest + declared cne rule per case); `--path-selftest` 6/6 | **met** under the frozen rule; coverage held 9 -> 9; the capability row enters the table below (first-working 54) |

### Capabilities - round 54

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| webview2-modifier-domain-chords-windows | Drive the webview2 surface's form fill as THREE per-key key-event traces: the r52 plain trace and the r53 Shift-chord trace unchanged, PLUS the chord-domain leg - three real modifier chords (Control bit 2, Alt bit 1, Meta bit 4 per S153's modifiers bit field) on the nonce-derived letter into a never-submitted third field, each chord witnessed by the PAGE'S OWN keydown record (the fixture's inline window.__keylog recorder): the bit<->boolean correspondence measured live (2<->ctrlKey, 1<->altKey, 4<->metaKey; shiftKey false; the modifier keys' own keydowns delivered with their own booleans), #field3 staying EMPTY as the negative witness, and journey.form.pageKeylog - the page's complete keydown record of the fill - re-derived end to end by the counter from the receipt's own nonce and matched entry by entry (CDP dispatch and DOM delivery witnessed INDEPENDENTLY and required to agree); the counter ships 96 hand-declared fixtures including eleven new chord-domain/keylog refusal cases | `scripts/webview2-cdp-loopback-round54.mjs` (`--form`); `corpus/evidence/round54/webview2-modifier-chords/receipt.json` + 6 per-step PNGs; `.ufo/waves/round-54/counters/webview2-receipt-r54.mjs` + `webview2-receipt-r54-fixtures/` (96 cases); `corpus/knowledge/webview2-modifier-domain-round-54.md` | 54 |

### Round 54 - sources, frontier, trend verdicts

Registry 160 -> **161** (S161 NEW this round: W3C UI Events - the KeyboardEvent
ctrlKey/altKey/metaKey boolean attribute definitions the page-side witness rides; opened
2026-11-02, 920,762 B, sha256 8ded5eaf... staged, the ctrlKey definition greps verbatim
1 hit in the raw bytes; used-by cites the round's knowledge note and lesson). S153
re-opened byte-identical a SIXTH time (sha256 f60f0c02... == the registered anchor; the
located ground this round extends the modifiers bit field from Shift=8 to the other
three bits; the row's used-by column extended in place per the contract, old->new logged
in the lesson). Knowledge notes 69 -> **70** (the modifier-domain note). PROVINCE gains
the round-54 runner line. Census start AND end exit 0 (22 pre-existing W04).
`node scripts/check-sources.mjs` -> SOURCES_GATE verdict=clean rows=161 findings=0
(`.ufo/waves/round-54/measure/check-sources-at-work.txt`).

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | improved | The measured surface grew again: the webview2 key-event model now covers the FULL modifier domain (bits 8 in r53; 2/1/4 this round) with an independent page-side witness (0 -> 7 evidence files; three traces in one fill, live and counter-checked), and the capability row `webview2-modifier-domain-chords-windows` enters the table; a new source kind entered the registry (the DOM events spec - S161 - the first W3C UI Events ground in the row set), S153's held row extended to the three remaining modifier bits (re-opened sixth, byte-identical); notes 69 -> 70. |
| quality | improved | The regression gate absorbed BOTH host realities at once - five sibling head races AND the first screened-province byte change since r48 (kengaku) - at correction 0 with zero correction cycles consumed (the first round since 46 with none) and zero byte drift in the dispositions; the generation bump is isolated to comments/ledger names/schema strings/usage/token with the pure core byte-identical (diff committed, diff-reviewed before any run - and the review CAUGHT the v13 run-output schema name-leftover, fixed in v14 and measured); the new counter ships 96 exact-findings fixtures (the fixture-transform authoring defect caught by the selftest at authoring, fixed before the freeze, disclosed with the honest note that the interim failing outputs were overwritten and are not committed); the spawn-verdict condition's stderr was committed at the round that cites it - the D1 convention applied the same round it was named. |
| discernment | improved | Every after-state is an instrument output at a named revision (the green names `435ea4ce`, the receipt names `4d3dca81`); the r53-closure carry-ins were corrected of record with measured oracles (D2's receipt-shape check: 0 hits for the drifted name; D1's loss disclosed LOST, never silently replaced) and the named convention landed as a QUALITY.md criterion citing the lesson; the lane did not self-check its SHONEN boxes (the operator-owned gate routed around per the standing routing). |

### Planned / saturation / retired - round 54

- planned: coverage - the webview2 surface's next residuals: key-domain control keys on
  the trace (Tab focus traversal, Backspace edit, Enter keyboard-submit - each with a
  DOM witness), and a fourth-surface probe only if the host shows one; the C1 pattern
  continues: re-run the current meter generation as the regression gate after any
  sibling roster change.
- planned: adjacency - keep the dispositions carried by exact whole-line quote match;
  if a screened province's bytes ever change, adjudicate the genuinely new BG lines
  within the frozen vocabulary and count them in the claims.
- planned: operability - keep the four m1 windows' tallies oracle-correct at every tip
  (the supersede-with-citation pattern); no gate generation change is planned.
- saturation 8 / window 3 retained; the r54 capability row keeps the window RESTARTED
  (round 55 = position 1). No axis retired; no score moved (no rubric authorizes one).

## Round 55 - declared claims (frozen before data at db6f4225) and executed disposition (both verified)

Round 55 on the Windows host. Baseline `793d947e`; freeze `db6f4225` (claims.json + three
instruments at the pinned digests + round-open controls + census start, BEFORE any data; the
freeze needed four commits on this host - two EMPTY path-carrier commits and a claims-only
probe, all disclosed in the carrier's message and in the round-55 lesson Mistakes 2: CRLF
line endings in the commit path list defeated treecommit's isfile resolution, caught by the
post-commit diff-tree landing check and fixed in the same round); C2 data `c1e64885` (the
live control-domain receipt + six per-step PNGs + counter green + both cross-refusals, with
the b-back PNG pin completed at `81b2fdbd`) + the D54-1 landing receipts; C1 data `103bf06f`
(the ledgers bound at one fresh snapshot; the raced correction-0 receipt kept) → correction 1
`216b1cf2` (delta-r55 re-bound; GREEN, one cycle of the frozen two consumed); work commit
(this block). Axes at round start: adjacency 8, coverage 9, depth 9, operability 9,
freshness 9, calibration 9; saturation 8 / window 3; the r54 capability row keeps the window
RESTARTED (round 55 = position 1) - the nudge is inactive, the lowest-axis obligation
applies, and C1 works adjacency. Fresh-start ruling honored: the r42/r43/r47 refused claim
classes re-read and ruled out in claims.json's freshStartNote (no wave/seat claims; both
after-states are committed instrument outputs at named revisions; the do-nothing-control
test explicit - C1's red control IS the do-nothing state, C2's baseline evidence tree is
EMPTY). Carry-in from the r54 non-author closure (all three routed, none is a claim):
D54-1 - the three cited counter receipts LANDED at the exact cited paths as r55 re-measures
on the committed r54 bytes (the r54 originals disclosed LOST), the cited-receipt landing
rule named and landed as QUALITY.md criterion 109 citing the round-55 lesson;
D54-2 - the S161 anchor cell corrected of record (§5.3 → §3.5.1, verified against the
staged bytes, old→new logged); D54-3 - the L2-floor L0 standing referred to only.

| Claim / axis | Counting command | Before -> after | Verdict / score |
|---|---|---|---|
| C1 adjacency (lowest owned axis; the regression-gate re-bind + the v15 meter generation bump, which also FIXES a v14 comment-only header name-leftover found by this round's diff review) - VERIFIED (one correction cycle consumed: tameshi raced the correction-0 green run; the raced receipt kept) | `node .ufo/waves/round-54/counters/c1-adjacency-host-v14.mjs --rev 793d947e... --repo <lane> --fleet <fleet> --json` (red control, round open); `node .ufo/waves/round-55/counters/c1-adjacency-host-v15.mjs --rev 216b1cf2... --repo <lane> --fleet <fleet> --json`; `--selftest`; `diff` v14 v15 (`controls/v14-v15-meter.diff`); `controls/c1-token-check-r55.txt` | before: at round open the committed v14 meter generation measures RED at the baseline - exit 1, **6 findings** (4 lane-screen-head-mismatch: kengaku, mori, shokunin-binary-forensics, tameshi - the heads that advanced since the r54 snapshot; PLUS lane-screen-sha-mismatch AND lane-screen-lines-mismatch BOTH on kengaku - its PROVINCE.md bytes changed since the r54 snapshot, the second consecutive screened-province byte change; ZERO audit findings, so no map row moved as of round open; control `controls/c1-meter-v14-red-at-round-open.json` taken before any lane write - a do-nothing control reaches exactly this red, and green requires the re-bind work) -> after: GREEN at `216b1cf2` at correction 1 - exit 0, predicate true, **0 findings**, counts {roster:16, mapRows:16, auditRows:16, deltaLanes:12}; ONE correction cycle consumed (tameshi committed between the rebind snapshot and the green run; raced receipt kept `measure/c1-meter-raced-at-correction0.json`; both ledgers re-bound at ONE fresh snapshot per cycle, `measure/c1-snapshot-at-rebind.json` + `measure/c1-snapshot-at-correction1.json`); audit-r55 carries the r54 statuses verbatim (0 audit findings); delta-r55: 11 provinces byte-identical at their new heads, kengaku RE-SCREENED at its new head a6cd337d (892 lines, was 847; ZERO browser-ground hits - no line row changed, **0 new adjudications**), 16 line rows carried by exact whole-line quote match; the v15 generation is pure-core byte-identical to v14 (diff committed) and FIXES the v14 header comment naming "tabi round 53" (comment-only, disclosed at `controls/c1-token-check-r55.txt`; v14 bytes never edited), v15 emits v15 in all four token places; selftest 16/16 (`measure/c1-meter-v15-selftest.json`); receipt named by OUTCOME `measure/c1-meter-green-at-correction1.json` | **met** under the frozen rule; adjacency held 8 -> 8 |
| C2 coverage (capability acquisition - the r54 planned residual: the KEY-DOMAIN control keys on the trace - End caret-anchor with the negative edit witness, Backspace edit + exact restore, Tab focus traversal witnessed by the page's own activeElement, Enter keyboard-submit via the implicit submission - S153 re-opened a SEVENTH time for the key-event contract, S083 RE-OPENED this round for the implicit-submission default-button ground; S162's duplicate-URL draft honestly DROPPED when check-sources E04 caught it, the ground routed to the S083 re-open per the registry contract) - VERIFIED | `git ls-tree -r --name-only <REV> -- corpus/evidence/round55 | wc -l` (0 -> 7); `node .ufo/waves/round-55/counters/webview2-receipt-r55.mjs <receipt> --shot ... --png-a ... --png-b ... --png-c ... --png-form ... --png-echo ... --driver scripts/webview2-cdp-loopback-round55.mjs --hostsrc scripts/webview2-host-round48.cs`; cross-refusals `measure/c2-r54counter-refuses-r55.json` + `measure/c2-r55counter-refuses-r54.json` | before: the surface's measured key-event model ended at the r54 modifier domain (bits 8/2/1/4); the control-key residual was committed text in the r54 SCORECARD planned section; `corpus/evidence/round55` held 0 files -> after: at `c1e64885` (+`81b2fdbd` for the b-back pin) the receipt records the 6-leg journey with the fill driven as the r52 plain trace + r53 Shift chords + r54 chord-domain leg ALL UNCHANGED, PLUS the control-domain leg: the nonce `tabi-r55-5a70384367c4b44b`, fresh compile SPAWNED first try with the compile bytes inside the receipt (the per-blob spawn-verdict condition did NOT recur), End (VK 35, 2 events) with `valueAfterEnd` == nonce (the negative edit witness - a movement key edits nothing; the pre-freeze smoke run's caret defect caught and fixed BEFORE the freeze, red control `controls/c2-smoke-caret-midtext-red.json`), Backspace (VK 8, 2 events) with `valueAfterBackspace` == nonce minus EXACTLY its last character and the removed character re-typed to an exact restore (`valueAfterRestore` == nonce), Tab (VK 9, 2 events) with the page's OWN activeElement witness moving field -> field2, Enter (VK 13, ONE keyDown WITH \r FROM the tabbed-to field) driving the implicit submission to the SAME /echo?field=&mixed= query, witnessed SERVER-SIDE (fixture served log) and CLIENT-SIDE (echo page renders both) - S083 §4.10.22.2 grounds the default-button contract; keylog window +4; `journey.form.pageKeylog` = the page's complete 69-entry keydown record re-derived END TO END by the counter from the receipt's own nonce (the Enter keydown's own DOM record NOT witnessed - the implicit submission navigates the document and the keylog dies with it; DISCLOSED in runner header, claims.json and counter sentence); counter r55 green **exit 0, 0 findings, couldNotEvaluate []**; cross-refusal SYMMETRIC: the r54 counter refuses the r55 receipt with **6 findings** (schema, profile-shape, nonce-shape, driver-pin, form-mechanism, keylog-length) and th 7 findings (the same five PLUS control-domain-missing AND keylog-length — the frozen
predicate's corrected expectation, derived from the counter's actual check flow before the
freeze); counter selftest **103/103** at the frozen bytes (100 refusals covering every
harness-expressible finding id incl. seven new round-55 control-domain cases; exact-findings
manifest + declared cne rule per case); `--path-selftest` 6/6 | **met** under the frozen
rule; coverage held 9 -> 9; the capability row enters the table below (first-working 55) |

### Capabilities - round 55

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| webview2-keyevent-control-keys-windows | Drive the webview2 surface's form fill with the KEY-DOMAIN control keys, each witnessed by the page's own DOM state: End re-anchors the caret with the NEGATIVE EDIT WITNESS (the field value read back UNCHANGED — the smoke run's caret-defect red control is committed), Backspace deletes exactly the last character (the residue re-derived by the counter from the receipt's own nonce) and the removed character is re-typed to an exact restore, Tab moves focus field -> field2 witnessed by document.activeElement, and ONE Enter keyDown from the tabbed-to field submits the form via the implicit submission — witnessed server-side and client-side, the spec ground S083 §4.10.22.2 (the default button in tree order) re-opened this round; the counter ships 103 hand-declared fixtures including seven new control-domain refusal cases | `scripts/webview2-cdp-loopback-round55.mjs` (`--form`); `corpus/evidence/round55/webview2-control-keys/receipt.json` + 6 per-step PNGs; `.ufo/waves/round-55/counters/webview2-receipt-r55.mjs` + `webview2-receipt-r55-fixtures/` (103 cases); `corpus/knowledge/webview2-control-keys-round-55.md` | 55 |

### Round 55 - sources, frontier, trend verdicts

Registry 161 -> **161** rows (the S162 duplicate-URL draft DROPPED before landing —
check-sources E04 caught it while authoring, and the registry contract routed the ground to
an S083 RE-OPEN with an extended located ground: fresh fetch 466,321 B, sha256 dc7c3088…,
staged `.ufo/waves/round-55/sources/`; the Implicit-submission quote greps verbatim 1 hit in
the raw bytes; used-by extended in place, old->new logged in the lesson). S153 re-opened
byte-identical a SEVENTH time (sha256 f60f0c02… == the registered anchor; used-by extended in
place, old->new logged). S161 re-verified from the staged bytes for the D54-2 anchor
correction. Knowledge notes 70 -> **71** (the control-keys note). Census start AND end exit 0
(22 pre-existing W04). `node scripts/check-sources.mjs` -> SOURCES_GATE verdict=clean
rows=161 findings=0 (`.ufo/waves/round-55/measure/check-sources-at-work.txt`).

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | improved | The measured surface grew again: the webview2 key-event model now covers the control-key domain (End caret-anchor with the negative edit witness, Backspace edit with exact restore, Tab focus traversal with the page's own activeElement witness, Enter keyboard-submit with the implicit-submission default-button ground) with the counter re-deriving the complete keylog from the receipt's own nonce (0 -> 7 evidence files; four trace plans in one fill), and the capability row `webview2-keyevent-control-keys-windows` enters the table; a NEW located ground entered an existing row (S083 re-opened to the Implicit-submission section) with the duplicate-URL draft honestly dropped; the seven round-55 refusal cases joined the counter's exact-findings manifest; knowledge notes 70 -> 71. |
| quality | improved | The regression gate absorbed the second consecutive kengaku byte change AND a mid-round tameshi commit race at ONE correction cycle (the frozen flow working as designed; the raced receipt kept and named by OUTCOME); the v15 generation bump is isolated to comments/ledger names/schema strings/usage/token with the pure core byte-identical (diff committed and diff-reviewed BEFORE any run — the review CAUGHT the v14 comment-only name-leftover, fixed in v15, v14 bytes never edited); the pre-freeze smoke run caught the caret-placement defect and the End anchor landed BEFORE the freeze with the red control committed at the citing round (criterion-108 discipline); the new counter ships 103 exact-findings fixtures; the CRLF empty-commit class was caught by the post-commit landing check, named, and fixed in the same round (criterion 109 landed citing the lesson). |
| discernment | improved | Every after-state is an instrument output at a named revision (the green names `216b1cf2`, the receipt names `c1e64885`/`81b2fdbd`); the r54-closure carry-ins were corrected of record with measured oracles (D54-1's three receipts re-measured on committed bytes and landed at the cited paths with provenance disclosed and the originals named LOST; D54-2's anchor correction verified against the staged bytes; D54-3 referred to per the standing line); the duplicate-URL source draft was dropped the moment the gate flagged it rather than argued around; the frozen cross-refusal expectation was corrected pre-data by walking the counter's check flow; the lane did not self-check its SHONEN boxes (the operator-owned gate routed around per the standing routing). |

### Planned / saturation / retired - round 55

- planned: coverage - the webview2 surface's next residuals: a branded-Chrome/Edge port of
  the control-keys leg only if a round shows a form-journey demand on those surfaces (the
  Chrome r45 and Edge r45 surfaces have not carried a form journey), and pointer-domain keys
  only if a fixture demands them; the C1 pattern continues: re-run the current meter
  generation as the regression gate after any sibling roster change.
- planned: adjacency - keep the dispositions carried by exact whole-line quote match; the
  kengaku re-screen discipline holds (two consecutive byte changes; the meter re-derives
  0 BG hits each time).
- planned: operability - keep the four m1 windows' tallies oracle-correct at every tip
  (the supersede-with-citation pattern); no gate generation change is planned.
- saturation 8 / window 3 retained; the r55 capability row keeps the window RESTARTED
  (round 56 = position 1). No axis retired; no score moved (no rubric authorizes one).

## Round 56 - declared claims (frozen before data at ad3e2afd's claims.json, written pre-wave) and executed disposition (both verified)

Round 56 on the Linux host (the webview2 surface cannot run here; the host offers Chromium
155). Baseline `faee4cb2`; freeze `ad3e2afd` (instruments + claims + round-open controls +
wave evidence, no data); C1 data `3b3c5d77` (ledgers re-bound at one fresh snapshot) →
correction 1 `909b3892` (the frozen correction flow, cycle 1 of 2: the rebind tool's trimEnd
sha bug, caught by the meter's own sha check; red receipt kept) → C2 data `c2aa8447` (the live
Chromium 155 control-keys receipt + six per-step PNGs) → work commit (this block). Axes at
round start: adjacency 8, coverage 9, depth 9, operability 9, freshness 9, calibration 9;
saturation 8 / window 3; the r55 capability row keeps the window RESTARTED (round 56 =
position 1) - the nudge is inactive, the lowest-axis obligation applies, and C1 works
adjacency. Fresh-start ruling: rounds 53-55 were all ADMITTED (no three-rejected streak), so
no fresh-start round is owed; the refused claim classes (r42 counter-greens-synthetic,
r43 in-model do-nothing seats, r47 reasoned-not-measured) remain ruled out by construction:
both after-states are committed instrument outputs at named revisions, and both claims carry
explicit do-nothing controls.

| Claim / axis | Counting command | Before -> after | Verdict / score |
|---|---|---|---|
| C1 adjacency (lowest owned axis; the v16 meter generation = v15 relabelled r55->r56, 277 logic lines byte-equal, diff committed; the rebind screens all 20 roster lanes and carries every hit-line adjudication by exact whole-line quote match) - VERIFIED (one correction cycle consumed: the rebind tool's trimEnd sha bug, caught by the meter's own sha check; red receipt kept) | `node .ufo/waves/round-55/counters/c1-adjacency-host-v15.mjs --rev faee4cb2… --repo <lane> --fleet <fleet> --json` (red control, round open); `node .ufo/waves/round-56/counters/c1-adjacency-host-v16.mjs --rev 909b3892… --repo <lane> --fleet <fleet> --json`; `--selftest`; `diff` v15 v16 (`counters/v15-v16-meter.diff`) | before: at round open the committed v15 meter generation measures RED at the baseline - exit 1, **19 findings** (6 audit-status-mismatch, 5 roster-lane-uncovered, 3 delta-lane-not-on-roster, 1 sha + 1 lines mismatch on kengaku, 3 lane-screen-head-mismatch; receipt `controls/c1-meter-v15-red-at-round-open.json`); after: exit 0, predicate true, **0 findings**, counts {roster:20, mapRows:16, auditRows:16, deltaLanes:16} at `909b3892` | **met** under the frozen rule; adjacency held 8 -> 8 (no rubric authorizes a move); the r55 off-roster alias rows dropped with sha-proven byte identity to revenger/souji/kaidoku, keeping all 10 of their adjudicated hit lines under the meter's P3 check |
| C2 coverage (capability acquisition `chromium-keyevent-control-keys-linux` - the Linux host's Chromium 155 surface carries the control-domain key leg with page-side DOM witnesses; S083 + S153 re-opened this round for the Enter-leg and transport contracts, S161 re-opened byte-identical; the r55 webview2 row stays as it stands) - VERIFIED | `git ls-tree -r --name-only faee4cb2… -- corpus/evidence/round56 | wc -l` (0 -> 7); `node .ufo/waves/round-56/counters/chromium-receipt-r56.mjs corpus/evidence/round56/chromium-control-keys/receipt.json --driver scripts/chrome-cdp-loopback-round56.mjs --expect-driver-sha256 26da87bb… --json`; `--selftest`; cross-refusals both directions | before: evidence tree **0** files; the counter on an absent receipt exits 1 with `receipt-missing` (the do-nothing control); after: evidence tree **7** files; counter green exit 0, predicate true, findings [], couldNotEvaluate [] at `c2aa8447`; cross-refusals symmetric (r55 counter on the r56 receipt: exit 1, 18 findings; r56 counter on the committed r55 receipt: exit 1, 13 findings); counter selftest **39/39** at the frozen bytes (35 refusal + 3 pass + 1 new home-leak case); `--path-selftest` 6/6 | **met** under the frozen rule; coverage held 9 -> 9; the capability row enters the table below (first-working 56) |

### Capabilities - round 56

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| chromium-keyevent-control-keys-linux | Drive the Linux host's Chromium 155 headless surface (loopback CDP, throwaway profile, throwaway HOME/XDG so the Arch wrapper cannot inject the user's flags.conf or write the user's crash DB) through the form fixture's control-domain key leg, each key witnessed by the page's own DOM state: End re-anchors the caret with the NEGATIVE EDIT WITNESS (the field value read back UNCHANGED), Backspace deletes exactly the last character (the residue re-derived by the counter from the receipt's own nonce) and the removed character is re-typed to an exact restore, Tab moves focus field -> field2 witnessed by document.activeElement, and ONE Enter keyDown with `text: "\r"` from the tabbed-to field submits the form via the implicit submission - witnessed server-side (exactly one /echo with the nonce) and client-side; the counter refuses a receipt whose host.argv carries a user-home path or whose browser is not 155.x | `corpus/evidence/round56/chromium-control-keys/receipt.json` (predicate true; counter green `measure/c2-counter-green-at-data.json`; runner `scripts/chrome-cdp-loopback-round56.mjs` sha `26da87bb…`; spec ground S083 §4.10.22.2 + S153 modifiers + S161 §3.5.1) | 56 |

### Round 56 - sources, frontier, trend verdicts

Registry 161 -> **161** rows (no new row: three RE-OPENS carried - S083 eighth open with the
r56 raw digest appended to the anchor cell [same byte count, different bytes - drift
disclosed], S153 eighth open with @master moved 1,421,620 -> 1,423,170 B and the modifiers
quote re-verified verbatim, S161 byte-identical; used-by extended in place old->new, logged in
the lesson). Knowledge notes 71 -> **72** (the chromium control-keys note). Census start AND
end exit 0 (22 pre-existing W04). `node scripts/check-sources.mjs` -> SOURCES_GATE
verdict=clean rows=161 findings=0 (`.ufo/waves/round-56/measure/check-sources-at-work.txt`).

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | improved | The measured surface grew again: the key-event model now holds on a SECOND host class (the Linux Chromium 155 surface, 0 -> 7 evidence files; the webview2 row stays Windows-bound), and the capability row `chromium-keyevent-control-keys-linux` enters the table; three registered rows re-opened with located ground re-verified verbatim in fresh bytes; notes 71 -> 72. |
| quality | improved | The regression gate absorbed a full host change AND 16 sibling-head movements at ONE correction cycle (the rebind tool's trimEnd sha bug caught by the meter's own sha check - the frozen instrument working as designed; the red receipt kept); the v16 generation bump is logic-line byte-identical (277/277, diff committed and reviewed); the pre-freeze amendments (sentinel RISK 1/3/4: throwaway HOME/XDG, --disable-extensions, profile+crash-path closure keys, shape-only argv) landed BEFORE the freeze with the smoke re-run green; the new counter ships 39 exact-findings fixtures; the N1 class fix is an instrument proven RED at the r55 close revision; the r55 D54-1 landing claim corrected of record (seven lost files, two of the three "landed" receipts absent). |
| discernment | improved | Every after-state is an instrument output at a named revision (the green names `909b3892`/`c2aa8447`, the receipts name their nonces); the r55-closure carry-ins were corrected of record with measured oracles (N1's absence sweep at two revisions; N2's empty-tree check; N3's two-mover disclosure); the frozen cross-refusal expectation was corrected pre-data by walking the counter's check flow; the meter's OR-mutant survivor and the gate's relative-form gap are disclosed as next-round instrument work, not smoothed; the lane did not self-check its SHONEN boxes (the operator-owned gate routed around per the standing routing). |

### Planned / saturation / retired - round 56

- planned: coverage - the chromium surface's next residuals: the modifier-chord leg (Shift/
  Control/Alt/Meta) on the Linux chromium surface only if a round shows the demand; the C1
  pattern continues: re-run the current meter generation as the regression gate after any
  sibling roster change.
- planned: calibration/operability - the meter generation that follows v16 ships a
  green/partial-green selftest case asserting the emitted `predicate` (the R56Mutant m4
  survivor); the cited-receipt gate's relative-form widening is an explicit instrument
  decision (R56Gate-F1), not a silent edit.
- planned: assimilation - the wave-4 quarantine-first duty is OWED: hand-check the 39-row
  tabi register slice in `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`
  (verdict per row) BEFORE any package adoption; adoption stays closed until then.
- saturation 8 / window 3 retained; the r56 capability row keeps the window RESTARTED
  (round 57 = position 1). No axis retired; no score moved (no rubric authorizes one).

## Round 57 - declared claims (frozen before data at 6f00780c's claims.json, written pre-wave) and executed disposition (both verified)

Round 57 on the Linux host. Baseline `ef43ecec`; freeze `6f00780c` (claims.json + four
instruments + round-open controls + wave evidence, no data); C1 data `646c1859` (ledgers
re-bound at one fresh snapshot; GREEN at correction cycle 0 — the first round since 54 with
none); C2 data `c5ac279a` (the live Chromium 155 modifier-chords receipt + 8 per-step PNGs)
→ work commit (this block). Axes at round start: adjacency 8, coverage 9, depth 9,
operability 9, freshness 9, calibration 9; saturation 8 / window 3; the r56 capability row
keeps the window RESTARTED (round 57 = position 1) — the nudge is inactive, the lowest-axis
obligation applies, and C1 works adjacency. Fresh-start ruling: rounds 53–56 all ADMITTED,
none owed; the r42/r43/r47 refused claim classes remain ruled out by construction. Carry-in
from the r56 non-author closure (all seven routed; 1+2 closed this round as C1's declared
change set and the gate v2 instrument, 3 executed as the round's quarantine duty, 4-7
applied as standing discipline — see the lesson's Corrections of record).

| Claim / axis | Counting command | Before -> after | Verdict / score |
|---|---|---|---|
| C1 adjacency (lowest owned axis; the v17 meter generation = v16 + the declared relabel + the ROUTED predicate-emission fix: shared `predicateFrom` + the two asserting selftest cases that kill the R56Mutant-m4 OR-class survivor; diff committed and line-audited before any run) - VERIFIED (correction cycle 0 of 2 consumed) | `node .ufo/waves/round-56/counters/c1-adjacency-host-v16.mjs --rev ef43ecec… --repo <lane> --fleet <fleet> --json` (red control, round open); `node .ufo/waves/round-57/counters/c1-adjacency-host-v17.mjs --rev 646c1859… --repo <lane> --fleet <fleet> --json`; `--selftest`; m4' kill `mutant/m4-kill.json` | before: at round open the committed v16 meter generation measures RED - exit 1, predicate false, **1 finding** (lane-screen-head-mismatch: kengaku-shokunin; the do-nothing state; receipt `controls/c1-meter-v16-red-at-round-open.json`); after: exit 0, predicate true, **0 findings**, counts {roster 20, mapRows 16, auditRows 16, deltaLanes 16} at `646c1859` (receipt `measure/c1-meter-green-at-data.json`); selftest 18/18; the ONE new kengaku BG line adjudicated no-tabi-ground (`measure/c1-adjudications.json`) | **met** under the frozen rule; adjacency held 8 -> 8 (no rubric authorizes a move; the axis's obligation is the rebind work itself) |
| C2 coverage (capability acquisition `chromium-keyevent-modifier-chords-linux` - the r56 planned residual: the modifier-chord leg on the Linux chromium surface; S153 re-opened a NINTH time byte-identical to the r56 anchor for the modifiers bit field, S161 re-opened byte-identical for the DOM booleans) - VERIFIED | `git ls-tree -r --name-only ef43ecec… -- corpus/evidence/round57 | wc -l` (0 -> 9); `node .ufo/waves/round-57/counters/chromium-receipt-r57.mjs corpus/evidence/round57/chromium-modifier-chords/receipt.json --driver scripts/chrome-cdp-loopback-round57.mjs --expect-driver-sha256 e0b1f3f5… --shot corpus/evidence/round57/chromium-modifier-chords --json`; cross-refusals both directions | before: evidence tree **0** files; the counter on an absent receipt exits 1 with `receipt-missing` (the do-nothing control); the Linux surface's key-event model ended at the r56 control keys (the modifier domain was Windows-bound); after: the live receipt (nonce `tabi-r57-6b714a3a7080`, Chromium 155.0.8059.84, teardown 0 survivors) + 8 per-step PNGs; counter green exit 0, 0 findings, couldNotEvaluate []; cross-refusals symmetric (r56-on-r57: 3 findings schema-wrong first; r57-on-r56: 7 findings schema-wrong first); selftests 70/70 + 13/13 | **met** under the frozen rule; coverage held 9 -> 9; the capability row enters the table below (first-working 57) |

### Capabilities - round 57

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| chromium-keyevent-modifier-chords-linux | Drive the Linux host's Chromium 155 headless surface (loopback CDP, throwaway profile, throwaway HOME/XDG so the Arch wrapper cannot inject the user's flags.conf or write the user's crash DB) through the form fixture's modifier-chord domain with page-side DOM witnesses: the Shift-chord trace (the invocation-bound nonce UPPERCASED typed into field2 where every uppercase letter rides a real Shift keyDown/keyUp around its pair, the letter's event carrying modifiers 8 + the shifted key/text, digits/hyphen unshifted, the DOM value read back after EVERY keystroke on BOTH fields), the chord-domain leg (three real Control/Alt/Meta chords, bits 2/1/4 per S153, on the nonce-derived letter into the never-submitted field3, the page's own __keylogFull recording every keydown/keyup with its booleans, the bit<->boolean correspondence measured live 2<->ctrlKey / 1<->altKey / 4<->metaKey with shiftKey false, field3 staying EMPTY as the negative witness), with the r56 plain trace + control legs carried unchanged and Enter LAST making the submit carry field=nonce AND field2=nonce.toUpperCase() (the Shift leg's server-side echo witness); the counter re-derives both traces and the keylog plan from the receipt's own nonce (`corpus/evidence/round57/chromium-modifier-chords/receipt.json`; `.ufo/waves/round-57/counters/chromium-receipt-r57.mjs` green with the driver digest pinned) | 57 |

### Round 57 - sources, frontier, trend verdicts

Registry 161 -> **161** rows (no new row: two RE-OPENS carried - S153 ninth open with
`@master` UNMOVED (1,423,170 B, sha `d6737c31…` == the r56 re-open digest) and the
modifiers description re-verified verbatim (1 hit scoped to the command block, 5 file-wide,
one per Input command); S161 byte-identical (920,762 B, sha `8ded5eaf…`) with the four
boolean definitions re-located at lines 3264/3273/3282/3291 byte-exact including the keycap
markup; used-by extended in place old->new, logged in the lesson). Knowledge notes 72 ->
**73** (the modifier-chords note). Census start AND end exit 0 (22 pre-existing W04).
`node scripts/check-sources.mjs` -> SOURCES_GATE verdict=clean rows=161 findings=0
(`.ufo/waves/round-57/measure/check-sources-at-work.txt`).

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | improved | The measured surface grew again: the key-event model's modifier-chord domain now holds on the Linux Chromium 155 surface (0 -> 9 evidence files; the webview2 rows stay Windows-bound), and the capability row `chromium-keyevent-modifier-chords-linux` enters the table; two registered rows re-opened with located ground re-verified verbatim in fresh bytes (S153 ninth, S161 byte-identical); notes 72 -> 73. |
| quality | improved | The routed m4 survivor is CLOSED with mutation evidence (the OR-class inversion killed by the two new asserting cases, triple-corroborated); the cited-receipts gate v2 widening landed with a red-before proof (83/72 vs v1's 6/5 at the r55 close revision) and an explicit round-scoped usage contract; the C1 rebind ran GREEN at correction cycle 0 (the first since 54) absorbing four sibling-head movements; the new counter ships 43 frozen ids with 70/70 exact-findings fixtures and symmetric cross-refusals; the sentinel's high guard gap (final-host re-guard) was closed for the round's remaining fetches and pinned as a rule; no witness was weakened anywhere. |
| discernment | improved | Every after-state is an instrument output at a named revision (the green names `646c1859`/`c5ac279a`, the receipts name their nonces); the quarantine's 38-row hand-check refused the fabrication reading with a structural mechanism proof (the one-row quote-column shift named at quote-lint.py:159-166/:376-424) instead of logging ~32 nonexistent fabrications; the vocabulary gap (QuarD's mispaired usage) was adjudicated with a unified rule and recorded as a next-contract refinement; the two mutation survivors (m4b, mG) are disclosed as next-generation instrument work, not smoothed; the lane did not self-check its SHONEN boxes (the operator-owned gate routed around per the standing routing). |

### Planned / saturation / retired - round 57

- planned: coverage - the chromium surface's next residuals: accelerator-swallowing
  variants (a page-level preventDefault on modifier chords), CapsLock as a toggle modifier,
  and pointer-domain keys only if a fixture demands them; the C1 pattern continues: re-run
  the current meter generation as the regression gate after any sibling roster change.
- planned: calibration/operability - the meter generation that follows v17 ships (a) the
  `map-ref-unparseable` selftest case (the m4b survivor: a bad-suffix ref must produce that
  id) and (b) the named-line protection for the predicate-assert harness (the mG survivor);
  the quarantine fetch guard's final-host rule (sentinel R57-S3) is pinned for every future
  register fetch.
- planned: assimilation - adoption stays CLOSED until the campaign corrects the register's
  one-row quote-column shift (mechanism named at quote-lint.py:159-166/:376-424; the
  structural proof is committed this round); when adoption opens, the id-collision flow
  binds: 60/148 staged ids collide (S102..S161 occupied), only S162..S249 are free, and the
  S124 staged entry's fabrication-class quote must be refused or re-anchored.
- saturation 8 / window 3 retained; the r57 capability row keeps the window RESTARTED
  (round 58 = position 1). No axis retired; no score moved (no rubric authorizes one).

## Round 58 - declared claims (frozen before data at 484bde50's claims.json, freeze commit d131223c) and executed disposition (both verified)

Round 58 on the Linux host. Baseline `051f433d`; claims freeze `484bde50` (claims.json,
round-open controls, w1 dispatch evidence); instrument freeze `d131223c` (code only: v18 meter
+ both kills, the r58 rebind tool, the C2 runner at driver sha `9935ed98…`, the C2 counter at
`632e62e4…`, smoke receipts); C1 data `34dc6b9b` (ledgers re-bound at one fresh snapshot,
green at the first attempt); C2 live receipt + counter green at the data revision; then the
work commit (this block). Axes at round start: adjacency 8, coverage 9, depth 9,
operability 9, freshness 9, calibration 9; saturation 8 / window 3; the r57 capability row
keeps the window RESTARTED (round 58 = position 1) — the nudge is inactive, the lowest-axis
obligation applies, and C1 works adjacency. Fresh-start: rounds 55–57 ADMITTED, none owed.

| Claim / axis | Counting command | Before -> after | Verdict / score |
|---|---|---|---|
| C1 adjacency (lowest owned axis; the v18 meter generation = v17 + the declared relabel + the ROUTED m4b kill (map-ref-unparseable selftest case) + the ROUTED mG kill (caseOk extraction + harness-guard case); diff audit 104 lines, zero unaccounted; ledgers re-bound at one snapshot `adj/rebind-snapshot.json`) - VERIFIED (no correction cycle consumed) | `node .ufo/waves/round-58/counters/c1-adjacency-host-v18.mjs --rev 34dc6b9b… --repo <lane> --fleet <fleet> --json`; `--selftest` (20/20); kills `adj/m4b-kill.json`, `adj/mG-kill.json` | before: v17 at baseline red — exit 1, predicate false, 1 finding (lane-screen-head-mismatch kengaku-shokunin), `controls/c1-meter-v17-at-round-open.json`; after: exit 0, predicate true, 0 findings, counts roster 20 / map 16 / audit 16 / delta 16 (`measure/c1-meter-green-at-data.json`) | VERIFIED; adjacency score held at 8 (instrument-hardening claim, as r56/r57; no rubric authorizes a move) |
| C2 coverage (capability acquisition `chromium-keyevent-preventdefault-swallow-linux` — the Linux Chromium 155 surface carries the accelerator-swallowing class: a page keydown swallower calls preventDefault on a declared set; the delivered-but-cancelled keystrokes leave the field unchanged; the page's own keylog records cancelable and defaultPrevented; the one submission is the carried final Enter) - VERIFIED, with the R58-S1 guard gap disclosed (below) | `git ls-tree -r --name-only 051f433d… -- corpus/evidence/round58 \| wc -l` (0 → the receipt + 12 PNGs at the landing commit); `node .ufo/waves/round-58/counters/chromium-receipt-r58.mjs corpus/evidence/round58/chromium-preventdefault-swallow/receipt.json --driver scripts/chrome-cdp-loopback-round58.mjs --expect-driver-sha256 9935ed98… --shot corpus/evidence/round58/chromium-preventdefault-swallow --json`; cross-refusals both exit 1 (schema-wrong first); the one-off page-vs-block check (6/6 agree; forged copy 1 mismatch) | before: evidence tree 0 files; the r58 counter on an absent receipt refuses (`receipt-missing`); after: counter exit 0, predicate true, 0 findings, 0 couldNotEvaluate (`measure/c2-counter-green-at-data.json`) | VERIFIED; coverage score held at 9 (capability row enters the table; the axis is not re-scored up by a capability claim) |

### Capabilities - round 58

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| chromium-keyevent-preventdefault-swallow-linux | Drive the Linux host's Chromium 155 headless surface (loopback CDP, throwaway profile, throwaway HOME/XDG, --disable-extensions) through a page-side keydown swallower: with the swallow gate ON for a declared set, the Backspace and digit keystrokes are DELIVERED (the page's keylog records cancelable true and defaultPrevented true) and the field value reads back UNCHANGED; a Control+Enter chord is delivered with defaultPrevented true and does not submit; the carried Enter with the gate OFF remains the run's only submission (one /echo request, carrying field and field2). | `corpus/evidence/round58/chromium-preventdefault-swallow/receipt.json` (counter `.ufo/waves/round-58/counters/chromium-receipt-r58.mjs`, green at the data revision) | 58 |

### Round 58 - sources, frontier, trend verdicts

Registry 161 -> **161** rows (no new row: S153 and S161 re-opened this round — S153 `@master`
UNMOVED (1,423,170 B, sha `d6737c31…`), S161 byte-identical (920,762 B, sha `8ded5eaf…`); used-by
extended in place old→new, logged in the lesson). Knowledge notes 73 -> **74**
(`chromium-preventdefault-swallow-round-58.md`). Census start AND end exit 0 (22 pre-existing
W04); `node scripts/check-sources.mjs` → SOURCES_GATE verdict=clean rows=161 findings=0.

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | improved | The measured surface grew: the key-event model now covers accelerator-swallowing on the Linux Chromium 155 surface (0 → 12 evidence files), the capability row `chromium-keyevent-preventdefault-swallow-linux` enters the table, and knowledge notes 73 → 74 on ground the r57 map did not hold (the default-action cancelation semantics). |
| quality | unchanged | No admitted entry failed its re-check: the r58 knowledge note is grounded in S161's own definitions (§4.3.4, §3.5.6.1) and scopes `defaultPrevented`/`preventDefault()` to the DOM Standard, correcting the frozen claim's wording rather than admitting it; C1's instrument gained two kills (m4b, mG) while the counter's kill-rule coverage gap (R58-S1, MEDIUM — page-keylog cancelable/defaultPrevented values not compared) is disclosed, routed and measured by a one-off check instead. No non-author `unprovable-but-better` judgment is on record, so this trend is not claimed as better. |
| discernment | unchanged | Self-attested so far: the attacks that caught the counter crash (A13), the S161 wording overstatement (scribe F1), the R58-S1 page/block gap (sentinel) and the C1 predicate-scope holes (reviewer A4/A5) were dispatched by this lane and therefore count as the lane (LEARNING.md). The admit/reject decisions (S161 and S153 admits; the S161 DOM-definition reject; the C1 and C2 admits) await the non-author closure spot-check, which the round's lesson `## Gate` is written to be checked against. |

### Planned / saturation / retired - round 58

- planned: calibration/operability — the counter generation after r58 compares the page keylog's cancelable/defaultPrevented against the derived plan (R58-S1), and the runner gains a declared swallow-OFF Ctrl+Enter positive control on a separate form (scribe F4) so "no submit" is separable.
- planned: adjacency — meter v19: a screened set derived from the map (closing the A4 scope hole), a findings-mismatch row in harness-guard (N1), malformed-suffix selftest fixtures (N2).
- planned: assimilation — adoption stays CLOSED until the campaign corrects the register's quote-column shift (L0 `tabi | round-57`).
- saturation 8 / window 3 retained; the r58 capability row keeps the window RESTARTED (round 59 = position 1). No axis retired; no score moved (no rubric authorizes one).

## Round 59 — declared claims (frozen at dd337bb3; pre-data corrections in claims.json) and executed disposition

Round 59 on the Linux host. Baseline `4e7fb89d`; instrument freeze `73b52e0f`; C1 data `09b22bcd`;
C2 data `69194768`; the work commit (this block). Axes at round start: adjacency 8, coverage 9,
depth 9, operability 9, freshness 9, calibration 9; saturation 8 / window 3; the r58 capability row
keeps the window RESTARTED at round 58, so round 59 is position 1 (stagnation nudge inactive; the
lowest-axis obligation applies to C1). Round 59 enters NO capability row (C2 was killed; see below).

| Claim / axis | Counting command | Before -> after | Verdict / score |
|---|---|---|---|
| C1 adjacency (lowest owned axis, 8): the v19 meter with the newly screened kagi/kake/kama browser-ground rows (D8) | `node .ufo/waves/round-59/counters/c1-adjacency-host-v19.mjs --rev 09b22bcd… --repo <lane> --fleet <fleet> --json`; `grep -c kagi-shokunin corpus/adjacency-host-delta-r59.tsv` (5), kake (66), kama (7) | before: v18 at baseline exit 1, predicate false, 4 findings; the three lanes unheld (0 rows). after: exit 0, predicate true, 0 findings, counts roster 20 / mapRows 16 / auditRows 16 / deltaLanes 20 / bgScreenSiblings 20 | VERIFIED on its frozen predicate; round not admitted, **score held at 8** (the round is not admitted; an unadmitted round moves no score) |
| C2 coverage (capability `chromium-keyevent-delivery-boundary-linux`): CapsLock delivers over CDP; the caps flag never sets | `node .ufo/waves/round-59/counters/chromium-receipt-r59.mjs corpus/evidence/round59/chromium-capslock-boundary/receipt.json --driver scripts/chrome-cdp-loopback-round59.mjs --expect-driver-sha256 b16ddb44… --shot … --json` (exit 0 green); forged f6 probes (lesson Mistakes 1) | before: evidence tree 0 files. after: 19 files; the counter green on the live receipt, BUT the canonical counter greens a forged missing-`cancelable` CapsLock receipt (f6) | **KILLED by its own frozen kill rule f6**; not admitted; **no capability row enters**; score held at 9 |

### Planned / saturation / retired — round 59

- planned: coverage — the counter generation that enforces the f6 `cancelable` shape and cross-checks CapsLock trace entries against the page keylog (a NEW claim; lesson Mistakes 1). The Blink-internal caps constant is an unsourced limit (a S163 row if the operator rules it in scope).
- planned: adjacency — the screen scope beyond PROVINCE.md ∪ map-referenced files (lesson Mistakes 12; R59Reviewer A6: 18,869 unscreened BG-word lines in sibling `.md` files).
- planned: adjacency — the 37 kaidoku `overlap-declared` rulings await a non-author check (L0 `tabi | round-59`).
- saturation 8 / window 3: round 59 entered no capability; the stagnation window moves to position 2 of 3 (rounds 58 and 59 carry none, the r58 row's window restarted at 58). No axis retired; no score moved.
- D10 (capability-only claims hold the axis score): a capability entering the table does not move a scored axis; AXES.md keeps capabilities separate from the six scored axes.

## Round 60 — declared claims (frozen at 67d6f70e, before any seat data) and executed disposition

Round 60 (attempt 1) on the Linux host. Baseline `8a3f6f89`; claims freeze `67d6f70e` (claims.json, sibling snapshot `c1/snapshot-r60.tsv`, census start 162 rows). Axes at round start: adjacency 8 (lowest owned), coverage 9, depth 9, operability 9, freshness 9, calibration 9; saturation 8 / window 3, position 2 (no capability entered in r59; the nudge is inactive; the lowest-axis obligation applies to C1). Round 60 enters NO capability row (C2 of r59 stays killed; the new C2 is a counter generation on calibration, not a re-declared capability).

| Claim / axis | Counting command | Before -> after | Verdict / score |
|---|---|---|---|
| C1 adjacency (lowest owned, 8): the wide adjacency screen `c1-wide-screen-r60` over every tracked `.md` blob of the 20 roster siblings at the frozen heads | `node .ufo/waves/round-60/counters/c1-wide-screen-r60.mjs --scope wide --snapshot .ufo/waves/round-60/c1/snapshot-r60.tsv --json` (predicate: screenedMd == enumeratedMd, unscreenedMd == 0, rowMismatch == 0, unresolvableHead == 0, roster == 20) plus the v19 map-scope meter at `bc373ade` | before: `--scope map` red (unscreenedMd 85,573 of 85,598); after: wide green (85,598 == 85,598, unscreened 0, rowMismatch 0), BUT the v19 no-regression clause red at the data rev (12 findings: sibling drift since the round-59 rebind) | **KILLED by its own K7** (v19 red at the data rev); not admitted; score held at 8 |
| C2 calibration (overreach caught; score 9): the r60 chromium receipt gate refuses forged CapsLock probes A, B, D, E and keeps the live receipt green | `node .ufo/waves/round-60/counters/chromium-receipt-r60.mjs <probe> --driver scripts/chrome-cdp-loopback-round59.mjs --expect-driver-sha256 b16ddb44… --shot corpus/evidence/round59/chromium-capslock-boundary --json` over A, B, D, E and the live receipt | before: the r59 counter greens A, B, D, E (forgedGreen 4); after: forgedGreen 0 (exit 1 each), live green (exit 0, findings []) | **VERIFIED on its frozen predicate**; the round is not admitted, so score held at 9; named residuals: keyup cancelable value by design, byte-perfect replica |

Round 60 executed disposition: C1 killed by K7; C2 verified. The round is not admitted (one claim unverified: honest stop; the operator rules). Axes: adjacency 8 (held), calibration 9 (held), others unchanged. No capability row enters (C2 is a counter generation on calibration, not a capability).

### Planned / saturation / retired — round 60

- planned (r61, adjacency): rebind the v19 meter's ledger inputs at one sibling snapshot (or move the no-regression clause onto the snapshot), so a wide-screen claim can clear K7 on a moving fleet; the wide adjacency adjudication of the 19,049 hit lines is the residual after that.
- planned (r61, calibration): the keyup `cancelable` value rule is a predicate change, not an instrument fix; raise it as a new claim only if the operator rules it in scope (L0 question, round 60).
- saturation 8 / window 3: no capability entered in r58-r60 besides the r58 row, so the window is at position 3 of 3; the stagnation nudge applies from round 61 unless a capability enters that round.
- retired: none. D10 (capability-only claims hold the axis score) still applies.

## Round 61 — frozen claims and honest disposition

Baseline `6c5c2a2e`; freeze `7032914c`; integrated instruments `bcbf6be9`.
Axes remain adjacency 8, coverage 9, depth 9, operability 9, freshness 9,
calibration 9. C1 works the lowest owned axis; stagnation nudge remains active.

| Claim / axis | Counting command and evidence | Before → after | Verdict |
|---|---|---|---|
| C1 adjacency: snapshot-bound v20 plus wide-screen clause | `node .ufo/waves/round-60/counters/c1-wide-screen-r60.mjs --scope wide --snapshot .ufo/waves/round-61/c1/snapshot-r61.tsv --json`; Reviewer A5-HEADER and Sentinel command 12 | v19 baseline red, 18 findings → frozen wide clause exit 2 (bad header); 42/42 v20 selftest is not the claim's full predicate | KILLED by K4; score held |
| C2 coverage capability chromium-pointer-event-domain-linux | `node .ufo/waves/round-61/counters/chromium-receipt-r61.mjs corpus/evidence/round61/chromium-pointer-domain/receipt.json --driver scripts/chrome-cdp-loopback-round61.mjs --expect-driver-sha256 f33f0ab72eec4f13519cd67a0768c5f743a7b14248c68bdc1bc9f639352a4e76 --shot corpus/evidence/round61/chromium-pointer-domain --json`; instruments `bcbf6be9`, measure/c2-live.json | evidence files 0 → 3; final live counter green; 129/129 local selftest; earlier mutation pins do not certify final integrated instrument | UNPROVABLE as frozen claim (post-score interface/nonce changes); no capability row |

No capability admitted; no numeric score changes. Knowledge notes 74 unchanged.
Registry 163 → 164 (S164, cited by lesson); no existing anchor edits.
Expansion/quality/discernment unchanged; non-author gate sample pending.
Planned: a new, pre-scored runner/counter contract with a header-validating
control and final-byte mutation evidence; no re-declaration of these failed
predicates. Wide-hit adjudication, keyup-value L0 and kaidoku L0 remain open.
Saturation 8 / window 3 retained; no axis retired.

## Round 62 — exact-byte fresh start and honest stop

Read the rejected r59/r60/r61 spot-checks before declaration. Baseline
`57b29bade4b05b03cdb8fa151daec90ac9b1a29c`; exact instrument/snapshot freeze
`1ec5eb3fc8cd17f696a7b7f03617bf69a6a5c2a4`; measured data revision
`a2f27065a32eb059716634d6337e8bab30e06b4f`. Two causally separable claims:

| Claim / axis | Frozen counting command / evidence | Before → after | Verdict / delta |
|---|---|---|---|
| C1 adjacency, lowest owned (8): mapped-surface snapshot rebind, not a wide scan | `node .ufo/waves/round-62/counters/c1-adjacency-host-v21.mjs --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --rev a2f27065a32eb059716634d6337e8bab30e06b4f --fleet /home/vgpnk/Projects/shokunin --snapshot .ufo/waves/round-62/c1/snapshot-r62.tsv --json`; rebind argv in `controls/c1-data-rebind.command.json` | no-work exit 3 / 119 unresolved → full rebind exit 0 / unresolved 0; data meter true / findings 0 / heads readable 20; 44/44 cases and five mutants killed | VERIFIED on declared predicate; score held 8, delta 0 because round not admitted |
| C2 coverage capability chromium-secondary-button-domain-linux (9) | `node scripts/check-secondary-round62.mjs --self-test --scratch /fast/scratch/hyaku/tabi-r62/recheck`; exact live-counter argv in `controls/c2-at-data-revision.command.json`; `w1/R62MutC2/kills.json` | baseline no r62 evidence; old r61 receipt rejected → new live green, 4 evidence files, eight F refusals / forgedGreen 0, 16/16 core and 9/9 CLI checks; BUT M5 survives16/16 | KILLED by frozen mutant-survival rule; no capability row, score held 9, delta 0 |

All six frozen pins unchanged, nine scored-file comparisons match committed
data. Actual production ledger has 149/149 distinct line keys; v21's
contradictory-duplicate false green remains an openly routed defect, not a
universal duplicate-free certification. Kaidoku overlap remains contested-open.
Other axes remain depth/operability/freshness/calibration 9. No axis harmed.

Capabilities: no new row. Knowledge: 74 unchanged. Registry 164 → 165 (S165
B/docs/mined, used by round-62 lesson); no existing row changes. Expansion,
quality, discernment unchanged pending outside gate sample. ONE v1 wave,
11 seats, five attack seats; L1 planner; no replacement or residual wave.

Planned: a new declared generation with explicit producer-verdict polarity
selftests and source-location-specific mutants; duplicate-delta key refusal
and evidence-backed disposition checking. No frozen r62 predicate repair.
Assimilation remains closed under round-57 L0. Unanswered keyup/overlap/topology
rulings stay open. Saturation 8 / window 3 retained; no axis retired.

## Round 63 — declared claims (frozen at 81659261, before the wave and before any scored data) and executed disposition

Round 63 (attempt 1) on the Linux host, the operator's renewed pause lift
("Resume all four once", tabi next r63). The last four rejected closures were
read before declaration (r59 forged field, r60 live-head drift, r61 malformed
header plus post-score pin transfer, r62 producer-verdict survivor). Baseline
`f098bcf8843c8a5a723a83995352180f897a6ff9`; instrument/controls freeze
`816592612dd2a8073437c595d3fe3c477125cf3c`; wave spec/dispatch `e5325ad8`.
Axes at round start: adjacency 8, coverage 9, depth 9, operability 9,
freshness 9, calibration 9. Saturation 8 / window 3; no capability has entered
since r58, so the stagnation nudge is ACTIVE: the lowest-axis obligation is
waived and the round is a frontier/capability move (C1) plus a calibration
repair (C2). Every failing-before control below was executed and committed
BEFORE the freeze, per the run15 tabi-r63 prerequisite.

| Claim / axis | Counting command and evidence | Before → after | Verdict |
|---|---|---|---|
| C1 coverage, capability `chromium-wheel-scroll-domain-linux`: the Linux Chromium wheel/scroll domain on a loopback fixture | `node .ufo/waves/round-63/counters/chromium-wheel-r63.mjs corpus/evidence/round63/chromium-wheel-scroll/receipt.json --driver scripts/chrome-cdp-loopback-round63.mjs --expect-driver-sha256 b00efd59ac10fd047014b76b2a5d16cc8b0acaab0730e8c6029a0b53a0d6c040 --shot corpus/evidence/round63/chromium-wheel-scroll --json`; `counters/compare-stability-r63.mjs`; `counters/mutate-r63.mjs run` over `controls/negatives-data/` | before: no r63 driver, counter or evidence exists; the frozen r62 generation's exact-line producer mutant ACCEPTS its lying receipt (pristine exit 1, mutant exit 0) at `controls/old-generation/result.json`. after: counter exit 0, predicate true, 0 findings; selftest 22/22; ten declared negatives each exit 1 (forgedGreen 0); eight exact-line mutants each accept the live receipt and false-green exactly their declared negative (matrix-data.json, 0 survived); two cold runs carry identical legs / wheellog-minus-ts / pageState and 4/4 identical PNG sha256 | **UNPROVABLE** — the frozen predicate is met, but the round's do-nothing standard is not: a hand-written receipt with four 1×1 PNGs and a coherent driver-side fabrication both exit 0 (lesson W1). No capability row, score held 9, delta 0 |
| C2 calibration: the lane's own frozen self-assessment gate counts its self-assessment against observed repo state | `node scripts/check-selfassessment.mjs --rev <LANDED_REV> --json` (clean worktree) | before (sandbox clone at baseline with the one round-62 artifact restored): exit 1, mismatches 2 — m1 `SCORECARD.md:3427` claimed 44 observed 9, m3 round-62 claimed landed observed 1; after: exit 0, mismatches 0, clean true, 194 could-not-evaluate and 58 superseded disclosed; gate bytes and its 45/45 selftest unchanged | VERIFIED on its frozen predicate |

### Capabilities - round 63

No capability row enters. C1's frozen predicate is met (counter green, ten
negatives refused, eight exact-line mutants killed, cold runs stable), but the
round's do-nothing standard is not: a hand-written receipt with four 1×1 PNGs
(`w1/R63Reviewer`) and a coherent driver-side fabrication (`w1/R63MutDriver` A6)
both exit 0, so the counter's green does not demonstrate that the surface ran.
The wheel/scroll surface is recorded as the next round's planned capability with
the repair conditions in `corpus/lessons/round-63.md` W1–W7.

| Capability (planned, not entered) | What it must do | Evidence pointer | First-working round |
|---|---|---|---|
| `chromium-wheel-scroll-domain-linux` | Drive `mouseWheel` deltas over raw CDP into a page-side recorder with exact scroll arithmetic and a cancelation negative plus its released positive control, on a receipt bound to the run (nonce in page pixels), with a negative for every named check | evidence of the real runs: `corpus/evidence/round63/chromium-wheel-scroll/` (15 files); instrument: `.ufo/waves/round-63/counters/chromium-wheel-r63.mjs` | — |
- Capability limit (round 63, disclosed): the surface's evidence is a consistency-verified
  receipt plus the real-run artifacts; the counter is not an execution oracle (a
  hand-written receipt with four 1×1 PNGs and a coherent driver-side fabrication
  both exit 0), and the run is not egress-isolated (Chromium's own background
  traffic reached non-loopback peers; the fixture origin stayed loopback). Both
  are declared limits, not revoked evidence; see `corpus/lessons/round-63.md`
  W1/W5/W12.
- Correction: `SCORECARD.md:3427` states `44/44` for the v21 adjacency meter (`node .ufo/waves/round-62/counters/c1-adjacency-host-v21.mjs --selftest`), not for `scripts/check-secondary-round62.mjs`, whose `--self-test` oracle tally is 9 cases and is unchanged (superseded pointer, no instrument edit; the round-62 C1 verdict stands as filed).
- Round 63 artifact durability: the round-62 `R62Scout/commands.json`
  (1,388,366 B, sha256 `e9b673d7…`) that the r62 spot-check routed as untracked
  work is committed with a `MANIFEST.txt` beside its seven siblings; the m3
  clause of the gate reads zero real unlanded paths at the landing revision.
- Knowledge notes 74 → 75 (`chromium-wheel-scroll-round-63.md`); registry
  165 → 167 (S166 MDN WheelEvent tier B, S167 CSSOM View tier A; both opened
  and quoted this round, used-by the new note and the round lesson).

Round 63 executed disposition: C1 **UNPROVABLE** (frozen predicate met, do-nothing
standard failed); C2 **VERIFIED**; the round is **rejected-honest-stop** (honest
stop, operator rules). No capability row enters; no axis is harmed; every score
held (coverage 9, calibration 9, others 9; adjacency 8).

### Planned / saturation / retired — round 63

- planned (r64): re-run the C2 gate as a freshness check (it must stay at
  mismatches 0); a new claim only as a separately declared generation, never a
  re-declaration of a r59–r62 predicate. Candidate frontier ground: pointer
  capture / drag-over-loopback, and the wheel domain's declared residuals
  (horizontal scroll, `scrollend`, trackpad phases) as its own claim.
- saturation 8 / window 3 retained; no capability entered in round 63, so
  round 64 is at position 1 of the window (rounds 60–63 carry none).
- retired: none. D10 (capability-only claims hold the axis score) still applies.

## Round 64 (2026-11-04, Linux host) — C1 coverage capability VERIFIED; C2 calibration target measured, not admitted

Fresh start under the operator pause lift ("Resume all eight once", tabi r64).
The last three rejected closures were read before declaration (r61 malformed
frozen header plus post-score pin transfer; r62 producer-verdict survivor and
contradictory duplicate/fabricated-label false greens; r63 hand-written receipt
with four 1x1 PNGs reaching the target). Baseline `6c19979fe63f3b9ec35179ca57bb91c6356bff25`;
instrument/controls freeze `0fc68043f5b5e4e9fc0a69c5924e78f2cb0e6741`; scored
data revision `e3f5215615f68490230bd0c6db94f7d84f0fc084`. Axes at round start:
adjacency 8, coverage 9, depth 9, operability 9, freshness 9, calibration 9.
Saturation 8 / window 3; the stagnation nudge is ACTIVE (no capability row since
r58), so this round is a frontier/capability move (C1) plus a calibration repair
(C2). Every failing-before control was executed and committed before the freeze
(`controls/summary.json` 14 controls; `controls/scored/summary.json` re-runs them
at the data revision).

| Claim / axis | Counting command and evidence | Before → after | Verdict |
|---|---|---|---|
| C1 coverage, capability `chromium-wheel-scroll-domain-linux`: the Linux Chromium wheel/scroll domain, generation 2 — a run-bound receipt plus a live re-run as the demonstration | `node scripts/verify-live-r64.mjs --scratch <ABS> --driver scripts/chrome-cdp-loopback-round64.mjs --counter .ufo/waves/round-64/counters/chromium-wheel-r64.mjs --evidence corpus/evidence/round64/chromium-wheel-scroll/receipt.json --evidence-shots corpus/evidence/round64/chromium-wheel-scroll --json`; `node .ufo/waves/round-64/counters/chromium-wheel-r64.mjs corpus/evidence/round64/chromium-wheel-scroll/receipt.json --driver scripts/chrome-cdp-loopback-round64.mjs --expect-driver-sha256 1ff560cc7f34c709a6ec8847fec9b4b6a1b55bb4818b550ae41d1dcee2b92db5 --shot corpus/evidence/round64/chromium-wheel-scroll --json`; `controls/scored/{negatives,mutants}/matrix.json` | before: no r64 driver, counter, verifier or evidence (`git cat-file -e 6c19979f:scripts/chrome-cdp-loopback-round64.mjs` -> absent); the committed r63 receipt through the r64 counter exits 1 with 14 findings. after (at `e3f52156`): verifier `predicate true, findings [], runs a/b exit 0 with counterExit 0/0, crossRun true, evidence true, driverSha256 == 1ff560cc…b92db5`; counter `predicate true, findings 0, checks 29`; negatives `29 refused / 29, forgedGreen 0`; mutants `16 applied, 16 killed, 0 surviving, 0 redundant`; selftest `clean 31/31`; red-before `r63-receipt 1, one-by-one 1, borrowed-shots 1, no-shots 1` with the disclosed `synthetic-rendering 0` limit unchanged | VERIFIED on its frozen predicate, with two limits disclosed (the counter is not an execution oracle; the verifier does not pin the driver it runs — QUALITY 118) |
| C2 calibration: the lane's control receipts are re-derivable from committed bytes (receipt-provenance gate) | `node scripts/check-receipt-provenance.mjs --dir .ufo/waves/round-64/controls/scored --repo . --rev e3f5215615f68490230bd0c6db94f7d84f0fc084 --require-committed --min-receipts 12 --json` | before: `controls/gate-before.command.json` on the r63 controls at `6c19979f` -> exit 1, checked 11, failures 34 (schema 11, stdout-bound 11, inputs-bound 11, argv-real 1). after: exit 0, `checked 15, matrices 0, failures 0, byCheck {}, ok true` at the scored revision. **Not admitted**: a fabricated but well-formed population of 12 never-executed receipts reaches the same 0 failures (w1 `R64Reviewer` H5), and the round froze no pre-freeze no-work control for it; the gate's matrix checks also score `matrices 0` because the battery's alias names do not match the gate's `^matrix` pattern | MEASURED, NOT ADMITTED (do-nothing control reaches the target); routed to r65 |

### Capabilities — round 64

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| `chromium-wheel-scroll-domain-linux` | Drive raw-CDP `mouseWheel` deltas over a loopback fixture on Chromium/Linux and demonstrate the result by RE-RUNNING it: six legs with exact scroll arithmetic (0 → 120 → 240 → 120 → 120 swallowed → 240 released), a receipt bound to the run's own rendering (nonce grid in page pixels, 120 px band colours encoding scroll position, per-leg witness strip, fixture re-rendered from the pinned driver, server-log `?run=<nonce>`, CDP `Browser.getVersion` identity), a counter with 29 named checks each carrying a declared negative, 16 exact-line mutants all killed, four committed red-before classes refused, and a live verifier that runs the frozen driver twice cold and requires agreement | `node scripts/verify-live-r64.mjs … --json` (scored output `controls/scored/live-verify.stdout`, `driverSha256 1ff560cc…`); evidence `corpus/evidence/round64/chromium-wheel-scroll/` (receipt `sha256 4e3a95c1…`, six PNGs, MANIFEST); instruments `.ufo/waves/round-64/counters/chromium-wheel-r64.mjs`, `scripts/verify-live-r64.mjs` | 64 |

### Round 64 corrections and routed defects

- Correction to `SCORECARD.md:3465` (r63 spot-check D2, routed and unfixed until now): the r63 C2
  after-state is **142 could-not-evaluate and 59 superseded** per the committed r63 receipts, not
  the `194 … 58` printed in the r63 row. The r63 verdict (C2 verified on its frozen predicate,
  C1 unprovable, no capability row) is unchanged.
- r63 spot-check D1 (SKILL.md digest pin) is closed: `SKILL.md` now prints the true
  `d376dc70…` for `chromium-wheel-scroll-round-63.md` and records the superseded `4c54e0c9…`.
- Routed to r65: (a) the live verifier must refuse a `--driver` whose sha256 is not the claim's pin
  (`R64Reviewer` H1, QUALITY 118); (b) C2 needs a frozen no-work control and the matrix aliases must
  match the gate's `^matrix` pattern; (c) 18 of 30 independent counter loosenings survive the
  declared negatives (`R64MutCounter`), so selected production uniqueness is still not semantic
  protection; (d) the recorder's 600 s cap can truncate the verifier's own 960 s retry budget under
  fleet load.

### Planned / saturation / retired — round 64

- planned (r65): a pin-enforcing verifier with its refusal control (fresh claim, new bytes); a C2
  claim with the fabricated-population control frozen BEFORE data; one counter-coverage claim from
  the independent survivor list.
- saturation 8 / window 3 retained; a capability row entered this round, so the window resets.
- retired: none.

## Round 65 (2026-11-05, Linux host) — C1 adjacency conflict refusal and C2 calibration matrix binding: both VERIFIED on their frozen predicates; axis dissent on C1 open; not admitted pending operator ruling

Attempt 1, fresh start under the operator's blanket fresh-start authorization ("Authorize all", 2026-11-05). The last rejected closures were read first (r62 producer-verdict survivor and v21 contradictory-duplicate false green; r63 hand-written 1x1-PNG receipt; r64 vacuous C2 population, `corpus/lessons/round-64-verifier-spotcheck.md`). Baseline `58ed8c7a21b9dcb403e46fc1d4e2d8bb68511162`; fixtures and do-nothing controls `ac0285ce` (fixtures) and `39782a84` (do-nothing receipts); freeze `03f35fe7` (pins in `.ufo/waves/round-65/claims.json`); scored revision `4a3481048cb3afd0d6068fdbc1421dfec4f06084`. Axes at round start: adjacency 8, coverage 9, depth 9, operability 9, freshness 9, calibration 9. Saturation 8, window 3; round 64 entered a capability, so the window reset and the stagnation nudge is inactive: C1 works the lowest owned axis (adjacency 8). C2 works calibration.

| Claim / axis | Counting command and evidence (committed argv in `.ufo/waves/round-65/scored-rev2/`) | Before → after | Verdict |
|---|---|---|---|
| C1 adjacency (lowest owned, 8): a contested sibling overlap is not shadowed by a later row | `node .ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs --repo . --rev 4a348104 --fleet /home/vgpnk/Projects/shokunin --snapshot .ufo/waves/round-62/c1/snapshot-r62.tsv --audit corpus/adjacency-host-audit-r62.tsv --delta <DELTA> --json` over A (`delta-dup-contradiction.tsv`), B (round-62 `real-conflicting-delta.tsv`), C (`corpus/adjacency-host-delta-r62.tsv`); do-nothing = frozen v21 on A and B (`.ufo/waves/round-62/counters/c1-adjacency-host-v21.mjs`) | A: v21 exit 0 predicate true (false green) → v22 exit 1, `delta-disposition-conflict` ×1. B: v21 exit 0 predicate true → v22 exit 1, `delta-disposition-conflict` ×1 (kaidoku PROVINCE.md:55 contested-open vs overlap-declared). C: v22 exit 0 findings [] predicate true (positive control holds) | VERIFIED on its frozen predicate. Score held at 8 (round not admitted; D10). Axis disputed by the Critic (`.ufo/waves/round-65/w1/R65Critic.md`: "refuse: axis mis-assigned"); the lesson's reading is adjacency-reporting. Operator rules (L0 line filed). |
| C2 calibration (score 9): a matrix that names its input binds that input by digest | `node .ufo/waves/round-65/counters/check-receipt-provenance-v2.mjs --dir <DIR> --repo . --rev 4a348104 --require-committed --min-receipts <N> --json` over the forgery dir `controls/c1-fab/` (A), the round-64 scored population (B), the honest fixture (C); do-nothing = frozen v1 on A | A: v1 exit 0 failures 0 (matrices 2 counted; the `-matrix.json` forgery invisible) → v2 exit 1, `matrix-input` ×3 (absent path, wrong pin, wrong `-matrix.json` pin). B: v1 matrices 0 on the population (selector miss) → v2 exit 0, failures 0, matrices 2. C: v2 exit 0 failures 0 | VERIFIED on its frozen predicate. Score held at 9. The gate cannot tell executed from invented receipts (declared residual, QUALITY 116). |

Mutation evidence (committed in `.ufo/waves/round-65/w1/R65MutTester1/`, `R65MutTester2/`): C1 — 8 exact-line mutants of the conflict pass, 6 killed, 1 equivalent (M7), 1 survivor killed by the case added this round (M8 reversal → `three-row-conflict-count` 46/47). C2 — 8 mutants of the matrix binding, 5 killed; survivors M4 (inherited format gate), M5 (relative-only resolution: a real false rejection no fixture covers), M7 (detail text). Surviving M5 is reported, not fixed.

Capabilities: no new row (both claims are gate instruments, not capabilities; the round does not demonstrate a new capability). Knowledge: 76 → 77 (`knowledge/digest-binding-round-65.md`, tier A source S170). Registry: 169 → 170 (S170 tier A, `mined`, used by the knowledge note and this round's lesson). Expansion, quality and discernment verdicts are in the report.

### Planned / saturation / retired — round 65

- C1's axis is the open question. If the operator rules calibration, C1 is not on the lowest axis and the lowest-axis obligation is unmet this round; the lesson records that either ruling is consistent with the evidence.
- planned (r66): the surviving C2 mutant M5 (relative-path resolution) gets a relative-path fixture before it is claimed; a C2 claim on the sha pin's provenance (QUALITY 118) needs an independent pin source, not a producer-declared one.
- saturation 8 / window 3: a capability has not entered in r65, so round 66 is at position 1 of the window.
- retired: none. D10 (capability-only claims hold the axis score) still applies.

## Round 65 — LOG-side pointer

The round's operator-facing summary is in `LOG.md` (round 65 entry) and the fleet report `.ufo/reports/round-65/tabi.md`.


## Round 66 (2026-11-05, Linux host) — C1 adjacency ledger rebind verified on its frozen predicate, axis contested; C2 calibration gate kill verified; not admitted pending operator ruling

Attempt 1. Base `2816adb359a50c2fd83fa975e39f0650aa189984`; pre-freeze controls `4bea87d5`; freeze and wave evidence `b1ecd665508b85b9f94ab155c4cd04bce3e51fee`; scored receipts at `b1ecd665` (`.ufo/waves/round-66/scored/`). Lesson: `corpus/lessons/round-66.md`. Axes at round start: adjacency 8 (lowest), coverage 9, depth 9, operability 9, freshness 9, calibration 9. Saturation 8 / window 3; no capability has entered since round 64, so the stagnation nudge is not active and the lowest-axis claim is required.

| Claim / axis | Counting command (frozen argv in `.ufo/waves/round-66/claims.json`) | Before → after | Verdict |
|---|---|---|---|
| C1 adjacency (lowest, 8): sibling-overlap ledger rebound to live sibling heads | `node .ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs --repo . --rev b1ecd665 --fleet /home/vgpnk/Projects/shokunin --snapshot .ufo/waves/round-66/measure/snapshot-live-r66.tsv --audit .ufo/waves/round-66/c1/adjudicated/adjacency-host-audit-r66.tsv --delta .ufo/waves/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv --json` | predicate false / 40 findings → predicate true / 0 findings; mechanical-only control false / 1; disposition changes 0 | VERIFIED on frozen predicate; axis contested (two critics read freshness; meter disposition check vocabulary-only). Score held at 8; not admitted pending ruling. |
| C2 calibration (9): v2 receipt gate relative matrix-input binding killed by a v3 generation (predicate unchanged) | `node .ufo/waves/round-66/counters/check-receipt-provenance-v3.mjs --selftest --scratch <abs>` and per mutant `node .ufo/waves/round-66/c2/final/mutants/<id>.mjs --selftest --scratch <abs>` | M5a/M5b survive v2 (12/12 clean) → v3 unmutated 14/14 clean; M5a/M5b/M5c/M5d red 13/14, 13/14, 13/14, 12/14 | VERIFIED on frozen predicate. Score held at 9; not admitted pending ruling. |

No capability row enters (neither claim demonstrates a new capability). Knowledge: 77 → 79 (`relative-input-binding-round-66.md`, `adjacency-ledger-live-heads-round-66.md`). Registry 170 → 171 (S171 Node path API `path.join`, tier A, mined, used by the C2 note and the round lesson). Expansion, quality and discernment verdicts are in the report. Known open defect, routed: the v2/v3 gate binds a `../` relative input that escapes `--repo` (critic F7). Errata for round 65 (selftest 46 committed vs 47 claimed) is in `corpus/lessons/round-66.md`.

Planned (r67): a disposition-aware adjacency check (round-66 QUALITY 122) only if the operator rules adjacency; a repo-escape refusal with its control for the gate. Saturation 8 / window 3 carried: no capability entered in round 66. Retired: none.

## Round 67 (2026-11-05, Linux host) — C2 repo-escape gate repair VERIFIED; C3 capability `chromium-hscroll-domain-linux` VERIFIED; C1 adjacency WITHDRAWN before freeze (lowest-axis obligation unmet); not admitted

Attempt 1. Base `5400136b233579f7b716ab83a70b8be24ed88b26`; pre-freeze instruments and controls `019efae0`; claim freeze `e0fc04c2` (`.ufo/waves/round-67/claims.json`); scored receipts `.ufo/waves/round-67/scored/` at `e0fc04c2`. Lesson `corpus/lessons/round-67.md`. Axes at round start: adjacency 8 (lowest), coverage 9, depth 9, operability 9, freshness 9, calibration 9. Saturation 8 / window 3: no capability had entered in rounds 65–66, so the window stood at 2 of 3; the stagnation nudge was not in force, and the lowest-axis obligation applied.

| Claim / axis | Counting command (frozen in `claims.json`) | Before → after | Verdict |
|---|---|---|---|
| C1 adjacency (lowest, 8): disposition-evidence meter v23 | `.ufo/waves/round-67/counters/c1-adjacency-host-v23.mjs` on the r66 adjudicated ledger (`w1/R67Executor1`) | unmutated v23 on the r66 ledger exit 1, 95 findings (`no-tabi-ground` rows quote BG words); v22 flip baseline 298 of 298 accepted (`w1/R67MutTester2`) | WITHDRAWN before freeze; not scored; score held 8; the lowest-axis obligation is unmet, so the round is not admitted |
| C2 calibration (9): receipt-provenance gate v4, relative matrix input outside `--repo` refused | before `node .ufo/waves/round-66/counters/check-receipt-provenance-v3.mjs --dir c2/fixture/X/repo/controls --repo c2/fixture/X/repo --json`; after the same argv with `.ufo/waves/round-67/counters/check-receipt-provenance-v4.mjs` | before exit 0, failures 0 (`scored/c2-before-v3.json`); after exit 1, byCheck `matrix-input 1`, detail `input escapes repo: ../outside.mjs` (`scored/c2-after-v4.json`); v4 selftest 17/17 exit 0 (`scored/c2-v4-selftest.json`); mutants M-E1 15/17, M-E2 16/17, M-E3 15/17 all exit 1 | VERIFIED on frozen predicate; score held 9 |
| C3 coverage (9), capability `chromium-hscroll-domain-linux` | live verifier `scripts/verify-live-r67.mjs` (two cold runs) plus the frozen counter on `corpus/evidence/round67/chromium-hscroll-scrollend/`; selftest 37; 35 negatives; 13 mutants; degenerate drivers M-A, M-B, M-C3 | no-work base 0 r67 evidence files → live verifier exit 0 (`scored/c3-live-verifier.json`); counter exit 0; selftest 37/37; negatives 35 refused, forgedGreen 0; mutants 13 applied, 13 killed, 0 surviving; degenerate counter exit 1 each (13, 23, 6 findings) | VERIFIED on frozen predicate; capability row enters; score held 9 (D10) |

Capabilities — round 67:

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| `chromium-hscroll-domain-linux` | Drive raw-CDP `mouseWheel` deltaX over a 2280 px loopback fixture on Chromium/Linux and demonstrate it by re-running the frozen driver: six legs with scrollX 0, 120, 240, 120, 1000 (clamped), 1000 (no move); scrollY 0 on every leg; one scrollend per moving leg and none for the boundary witness; run-bound nonce grid and band colours in the PNGs; a live verifier that re-runs cold twice | `scripts/verify-live-r67.mjs`; `.ufo/waves/round-67/counters/chromium-hscroll-r67.mjs`; `corpus/evidence/round67/chromium-hscroll-scrollend/receipt.json` | round 67 |

Knowledge: 79 → 80 (`knowledge/chromium-hscroll-scrollend-round-67.md`, S172 and own-work). Registry 171 → 172 (S172, CSSOM View section 3.1 and 13.3, tier A, `spec`, mined). Census start `.ufo/waves/round-67/census-start.txt` exit 0 (171 rows); end `.ufo/waves/round-67/census-end.txt` exit 0 (172 rows). QUALITY 123–125 added.

Saturation 8 / window 3: the window resets (capability entered in round 67; position 0 of 3). Retired: none.

Planned (r68): an adjacency move that a counting predicate can decide. The disposition meaning is a human adjudication, so the candidate is a per-row non-author adjudication record, or an operator ruling to retire or split the adjacency axis (L0 `tabi | round-67`). The horizontal domain's residuals (smooth scrolling, trackpad phases) are a separate claim, not a re-declaration of C3.

## Round 68 (2026-11-05, Linux host) — C2 registry VERIFIED; C3 docs-held entry VERIFIED; C1 adjudication gate hardening VERIFIED on its predicate with adjacency contested; not admitted pending the adjacency ruling

Attempt 2 (attempt 1's L1 ended after its wave dispatched). Base `1746c53de7d56e8aeaf420a68b5b95e6af96adf8`. Lesson `corpus/lessons/round-68.md`. Axes at round start: adjacency 8 (lowest), coverage 9, depth 9, operability 9, freshness 9, calibration 9. Saturation 8 / window 3, position 1 of 3 after round 67's capability (no capability in round 68).

| Claim / axis | Counting command (frozen predicate) | Before → after | Verdict |
|---|---|---|---|
| C1 adjacency (lowest, 8): adjudication gate refuses lane self-adjudication, off-line quotes, degenerate quotes | `node scripts/check-adjacency-adjudication-r68.mjs --ledger .ufo/waves/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv --worksheet corpus/adjacency-adjudication-r68.tsv --snapshot .ufo/waves/round-66/measure/snapshot-live-r66.tsv --fleet /home/vgpnk/Projects/shokunin --expect-ledger-sha256 3739288392ad7083c819637347bed14348a6e350b121492fc2653bf3e57b1105 --expect-snapshot-sha256 a5fccf44aad0e4e67dc4592a18e15c3f7c6c88adebd236c4da723ad9d9370a74 --repo . --expect-pending 49 --max-adjudicated 0 --json` plus four forgeries from `.ufo/waves/round-68/counters/make-c1-forgeries-r68.sh` and a no-worksheet control | forgeries: pre-fix rc 0 ×4 → post-fix rc 1 ×4; real 49 rows rc 0 (checked 49, pending 49); no-work rc 1 `worksheet-missing`; selftest 20/20 | VERIFIED on frozen predicate. Axis contested: the Connector measured zero adjacency movement (49 pending rows are bookkeeping) and reads the gate work as calibration. Score held 8. Not admitted pending the operator ruling (L0 `tabi | round-67`). |
| C2 calibration (9): instrument registry at SKILL.md for the seven round-67 instruments | `node scripts/check-instrument-registry-r68.mjs --skill SKILL.md --repo . --json` | HEAD SKILL.md: rc 1 `registry-section-missing` (0 of 7 paths registered by `grep -c -F`) → worktree: rc 0, `findings []`, 7 expected; blob equality worktree = HEAD = r67 freeze for all seven (`controls/c2-blob-equality.txt`); selftest 7/7 | VERIFIED on frozen predicate. Score held 9. Gate defects F1–F10 (attack) routed. |
| C3 coverage (9): docs-held `Input.synthesizeScrollGesture` entry bound to S173 | `node .ufo/waves/round-68/w1/R68Exec3/check-c3-synthscroll-r68.mjs` (default entry/source) | HEAD: no lane knowledge entry on the surface; empty entry → rc 2 `no-work` → worktree: rc 0, clean, 8/8 checks; selftest 9/9 | VERIFIED on counter predicate. Score held 9. No capability row (runtime unmeasured). |

Capabilities: none this round. Knowledge 80 → 81 (`knowledge/chromium-scroll-gesture-protocol-round-68.md`, S173). Registry 172 → 173 (S173 tier A `code`, mined; census start HEAD exit 0 with 172 rows; end exit 0 with 173 rows; W04 cross-scope warnings only). QUALITY 126–129 added.

Planned (r69): the C2 gate defects F1–F10 (string-exact duplicates, unanchored sha scan, substring `entry`, token-level selftest, silent malformed rows, exact-string section detection) as a calibration claim with failing-before controls; the C1 selftest gaps (pending-count assertion, six extra wedges); the symlink hole in C2 hashing. Saturation 8 / window 3: position 1 of 3 (no capability this round). Retired: none. The adjacency ruling is still required before the lowest-axis claim can be admitted.

## Round 69 (2026-11-06, Linux host, fresh start) — C1 adjacency sibling matrix and C2 capability `chromium-synth-scroll-gesture-linux`

Fresh start (Amendment 46): the r66/r67/r68 rejected closures and spot-checks were read first (lesson `corpus/lessons/round-69.md`). Base `58d84eda992ffc11d77d76a2c1019bfe061f9241`; pre-freeze instruments and executed controls `a70c231d`; freeze `a033979c` (`.ufo/waves/round-69/claims.json`); digests `d65546b3` (`.ufo/waves/round-69/freeze.txt`). Axes at start: adjacency 8 (lowest), coverage 9, depth 9, operability 9, freshness 9, calibration 9. Saturation 8 / window 3; position 2 of 3 after the r67 capability, so no stagnation nudge.

| Claim / axis | Counting command (frozen predicate) | Before → after | Verdict |
|---|---|---|---|
| C1 adjacency (lowest, 8): PROVINCE.md `## Adjacent — sibling matrix`, one bound row per sibling of the frozen snapshot | `node scripts/check-sibling-matrix-r69.mjs --province PROVINCE.md --snapshot .ufo/waves/round-69/c1/sibling-heads-r69.tsv --fleet /home/vgpnk/Projects/shokunin --json` plus the real-mode battery `scripts/negatives-sibling-matrix-r69.mjs` (predicate `C1-MATRIX-BOUND`) | base: exit 1 `matrix-missing`, bound 0/20 (`controls/c1/donothing-head.*`) → exit 0, rows 20, bound 20/20, inbound answered 3/3 (kake contested, kengaku, kotoba), outbound routed 4/4 (kagi, kaidoku, kake, revenger); battery 19/19 refused for their expected ids, positive clean (`scored/c1-counter.json`, `scored/c1-negatives-real.json`) | measured on the frozen predicate. Adjacency 8 → 9 claimed on the rows' content, NOT on the command alone: R69Critic built a cheapest passing control (title-line quotes, regex-derived labels, one boilerplate side) that the same command and battery also green (`w1/R69Critic/evidence/cheap2-*`), and an over-claim variant (19 `adjacent`) that greens too. What separates the committed matrix from that null is manual: 0/20 vs 17/20 title-line quotes, 19 vs 1 distinct tabi sides, five contested rows of which three (kumitate, revenger, kaidoku) no counter forces. Relation labels are judgment; blind connector agreement 15/20 after integration, of which 3 disagreements are counter-forced (kake, kengaku, kotoba) and 2 are judgment (kagi, tameshi). Critic verdict: adjacent (conditional) |
| C2 coverage (9), capability `chromium-synth-scroll-gesture-linux` (sourced: S174 new, S173) | `node scripts/check-synthscroll-r69.mjs --receipt corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json --expect-driver-sha256 13ea3f8ae67fb7761a94c4763e575c9ee487905dd9b405d916d55fca562abce3 --json` (predicate `C2-SYNTHSCROLL-LIVE` (a)–(d)) | no receipt: exit 2 (`controls/c2/donothing-no-receipt.*`); degenerate drivers exit 1 → run (a) exit 0 clean, 63 checks (`scored/c2-counter-a.json`); run (b) R69Exec1 cold, own nonce/ports, exit 0 (`w1/R69Exec1/counter.json`); battery 44/44 on (a) (`scored/c2-negatives-a.json`) and on (b); capability row below; knowledge note cites S174 | measured on the frozen predicate. Coverage score held at 9: 10 would mean every PROVINCE surface explored, and real-site interaction stays operator-gated; the capability row is the measured movement. Limit (R69Critic): the counter checks a receipt's internal consistency and a self-attested driver pin; a fabricated-but-consistent receipt passes it, and (b) has no cross-run check. The live-run evidence is manual provenance: run (a) and run (b) differ in 387 leaf paths (nonce, launch token, ports, profile, Chrome stderr, 370 event timestamps; `w1/R69Critic/evidence/scored-vs-seat-diff.json`) and the pinned driver source has no browser-free branch |

Capabilities (this round):

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| `chromium-synth-scroll-gesture-linux` | Drive `Input.synthesizeScrollGesture` over raw CDP on Chromium 155/Linux headless and prove the producer: mouse-class legs scroll exactly (0→600, 600→300, 300→900 with repeatCount 2 = 3 gestures) through trusted precise wheel events whose deltaY sum equals the scroll delta; the touch leg delivers pointer(touch) + touchstart/touchend and does not scroll; every CDP send logged so look-alike producers (script scroll, dispatchMouseEvent wheel) are refused | `scripts/chrome-cdp-synthscroll-round69.mjs`; `scripts/check-synthscroll-r69.mjs`; `corpus/evidence/round69/chromium-synth-scroll-gesture/receipt.json`; `.ufo/waves/round-69/w1/R69Exec1/receipt.json`; `corpus/knowledge/chromium-synth-scroll-gesture-runtime-round-69.md` | round 69 |

Knowledge 81 → 82. Registry 173 → 174 (S174 tier A `code`, mined; S173 used-by extended). QUALITY 130 added. SKILL.md `## Round 69 gate registry` registers both gates (QUALITY 129) with `scripts/selftest-r69-gates.mjs --selftest`.

Routed (not amended; instruments are pinned): C2 battery coverage gaps found by R69Mut2 (4 survivors: per-leg scrollYBefore, absolute scrollY, wheel direction, nonce shape); the C1/C2 attack-seat findings listed in the round report.

Planned (r70): one negative per counter check per leg for the synthscroll battery (R69Mut2 G1–G4) and the sibling-matrix battery (R69Mut1 m06/m14/m17/m18), as a calibration claim with failing-before controls; a next-generation synthscroll counter that binds what R69Critic showed unguarded (Chrome stderr DevTools line and port, fixture hash, a timeline, a cross-run check that two receipts differ in nonce/launch token/timestamps); the kotoba two-sided disagreement on the tabi relation (kotoba grades `none`, tabi `adjacent`) reported to the integrator. Saturation 8 / window 3: position 0 of 3 after this round's capability. Retired: none.

## Round 70 (2026-11-06, Linux host) — C1 capability `chromium-synth-tap-gesture-linux`; C2 live verifier for the round-69 capability

Base `90b9ff045542651fb59814fe32f73fee0d1d8243`; pre-freeze instruments and executed controls `b5d77c4c` (31/31 hold, `.ufo/waves/round-70/controls/summary.json`); freeze `7c42ef25` (`.ufo/waves/round-70/claims.json`); digests `2cde310f` (`.ufo/waves/round-70/freeze.txt`). Axes at start: all six at 9; both claims work a lowest axis. Saturation 8 / window 3: position 1 of 3 after the r69 capability, so no stagnation nudge.

| Claim / axis | Counting command (frozen predicate) | Before → after | Verdict |
|---|---|---|---|
| C1 coverage (9), capability `chromium-synth-tap-gesture-linux` (sourced: S175 new, S174, S173) | `node scripts/check-synthtap-r70.mjs --receipt corpus/evidence/round70/chromium-synth-tap-gesture/receipt.json --expect-driver-sha256 704efab816e9bd9cc38cb31dd219aa776f7be52815a17cf1ea68924b6dff9577 --json`; live leg `node scripts/verify-live-r70.mjs --profile synthtap-r70 --scratch <short ABS> --json`; battery `scripts/negatives-synthtap-r70.mjs` (predicate `C1-SYNTHTAP-LIVE` (a)–(d)) | base: no receipt, counter exit 2; live verifier exit 1 `evidence-counter` (`controls/c1/donothing-*`) → (a) exit 0 clean, 84 checks (`scored/c1-counter-a.json`); (b) exit 0 predicate true, pins frozen, by the L1 (`scored/c1-verify-live-L1.json`) and by R70Exec1 (`w1/R70Exec1/verify.json`); (c) 95/95, coverage gap 0 (`scored/c1-negatives-a.json`); (d) the row below and the knowledge note citing S175 | measured on the frozen predicate. Coverage held at 9. Attack record, not amended: R70Critic grades the live leg FALSIFIED as an execution oracle — an inherited `NODE_OPTIONS` preload or a same-user driver swap between the pin read and the spawn (`verify-live-r70.mjs:122` vs `:158`) greens it without a live run (`w1/R70Critic/receipts/c1-env-verifier.json`, `c1-toctou-verifier.json`); the claim's stated limit ("passes only if … that binary is the frozen driver") is therefore wrong. R70Review1: 16 receipt-form false greens in the counter (FG1–FG16) and one battery gap (FB1); R70Mut1: 21 of 31 counter mutants survive the battery. |
| C2 operability (9): live re-derivation command for `chromium-synth-scroll-gesture-linux` | `node scripts/verify-live-r70.mjs --profile synthscroll-r69 --scratch <short ABS> --json` (predicate `C2-LIVE-R69` (a)–(c)) | base: no such command, exit 1 `MODULE_NOT_FOUND` (`controls/c2/donothing-base`) → (a) exit 0, predicate true, pins frozen, by the L1 (`scored/c2-verify-live-L1.json`); (b) exit 0 by R70Exec2 (`w1/R70Exec2/verify.json`); (c) controls 31/31 hold; the r69 counter accepts the rewritten replay (exit 0) that the verifier refuses (exit 1) | measured on the frozen predicate. Operability held at 9; 0 → 1 runnable live verifier for the r69 capability. R70Critic: HOLDS-WITH-LIMIT (the same preload/swap bypass applies; the evidence leg binds bytes at a path, not provenance — R70Review2 F1). R70Mut2: 15 of 17 verifier mutants killed (1 equivalent, 1 verdict-redundant). |

Capabilities (this round):

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| `chromium-synth-tap-gesture-linux` | Drive `Input.synthesizeTapGesture` over raw CDP on Chromium 155/Linux headless and prove the producer on a loopback button: mouse taps deliver trusted pointerdown/mousedown/pointerup/mouseup/click with `detail:1` and a measured 50 ms default hold (400 ms with `duration:400`); `tapCount:2` gives two single clicks and no `dblclick`; `tapCount:0` succeeds with no input; an omitted source is a touch tap; touch taps deliver pointer and touch events but no click; out-of-view coordinates fail `-32602`; look-alike producers (`Input.dispatchMouseEvent`, `Input.dispatchTouchEvent`, script `click()`) are refused from the CDP send log; re-derivable by running the pinned driver twice cold | `scripts/chrome-cdp-synthtap-round70.mjs`; `scripts/check-synthtap-r70.mjs`; `scripts/verify-live-r70.mjs --profile synthtap-r70`; `corpus/evidence/round70/chromium-synth-tap-gesture/receipt.json`; `.ufo/waves/round-70/w1/R70Exec1/`; `corpus/knowledge/chromium-synth-tap-gesture-runtime-round-70.md` | round 70 |

Knowledge 82 → 83. Registry 174 → 175 (S175 tier A `code`, mined; S173 and S174 used-by extended). QUALITY 131–132 added. SKILL.md `## Round 70 gate registry` registers `check-synthtap-r70` and `verify-live-r70` with `scripts/selftest-r70-gates.mjs --selftest` (`scored/selftest-r70-gates.out`, exit 0); `check-gate-registry` lists only the 5 pre-existing missing rows (R6).

Calibration note (no claim): the round's own claims.json limit sentence on C1 was refuted by its attack seats (above); this block reports the refutation rather than the sentence.

Planned (r71): a verifier generation that executes a private snapshot of the pinned bytes, re-hashes it after the runs, spawns with a sanitised environment (no `NODE_OPTIONS`/`LD_PRELOAD`), checks a wall-time floor and the driver's stdout against its receipt, with a negative for each (R70Critic items 1–4); a counter generation closing R70Review1 FG1–FG15 with the battery cases R70Mut1 proposes (kill power, not only id coverage); the kama `none → adjacent` row and a one-pass re-snapshot of the sibling matrix (R70Connector). Retired: none.

## Round 71 (2026-11-06, Linux host) — C1 capability `chromium-synth-pinch-gesture-linux` (honest stop on leg b); C2 execution-bound live verifier `verify-live-r71`

Base `11b00f644f5af1a4f7827da6956732e0b91023a5`; pre-freeze instruments and executed controls `711a38c2` (C1 controls 4/4 hold, battery 107/107 on the smoke receipt, kill power 87/87; C2 r70 bytes falsePass 4, blanket-refuse and blanket-accept evaluate false); freeze `04f4330f` (`.ufo/waves/round-71/claims.json`); digests `749a1ab5` (`.ufo/waves/round-71/freeze.txt`). Axes at start: all six at 9; both claims work a lowest axis. Saturation 8 / window 3: capability `chromium-synth-tap-gesture-linux` entered at r70, so no stagnation nudge.

| Claim / axis | Counting command (frozen predicate) | Before → after | Verdict |
|---|---|---|---|
| C1 coverage (9), capability `chromium-synth-pinch-gesture-linux` (sourced: S176, S177, S178 new; S174, S173) | `node scripts/check-synthpinch-r71.mjs --receipt corpus/evidence/round71/chromium-synth-pinch-gesture/receipt.json --expect-driver-sha256 5318780cc13664f36a41d33024a500b5a5b2a8a3737d39489990fd98084922af --json`; independent cold run (b); battery + kill power (c); row and note (d) (predicate `C1-SYNTHPINCH`) | base: no receipt, counter exit 2 `receipt-unreadable` (`controls/c1/donothing-no-receipt.*`) → (a) exit 0 clean, 87 checks (`scored/c1-counter-a.json`); **(b) R71Exec1's cold run: driver exit 0, counter exit 1 `event-leg-domain`** (`w1/R71Exec1/counter.json`: one trailing zero-scale wheel labelled `end`); (c) battery 107/107, 98 isolated, gap 0 (`scored/c1-negatives-a.json`), kill power 87/87 (`scored/c1-kill-power-a.json`); (d) knowledge note committed; capability row withheld | **honest stop — not verified.** Leg (b) is false as frozen; the kill rule applies and nothing is amended. The pinch behaviour itself is measured (scored run, smoke run, R71Exec1's run all CONFIRMED by the producer and identical in shape except the trailing event), and the knowledge note is admitted through the gate on its own. Coverage held at 9. |
| C2 operability (9): execution-bound live verifier `scripts/verify-live-r71.mjs` (profiles synthscroll-r69, synthtap-r70) | `node .ufo/waves/round-71/controls/c2/attack-harness.mjs --lane <ABS lane> --verifier verify-live-r71.mjs --work <ABS> --out <ABS>` then `node .ufo/waves/round-71/controls/c2/evaluate-c2.mjs --summary <out>/summary.json --json` (predicate `C2-EXEC-BOUND` (a)–(d)) | base: verify-live-r70 falsePass **4** (A-env-tap, A-env-scroll, B-swap-tap, C-swap-run-b-tap; `controls/c2/pre-r70/summary.json`), and the r70 bytes under the r71 name score the same (`controls/c2/donothing-r70-bytes.eval.json`, evaluator exit 1) → (a) L1 harness falsePass **0**, notLanded 0, positives exit 0, A-env REFUSED `env-injection`, B HONEST-PASS, C REFUSED `snapshot-mutated` (+ `run-b-wall-floor`, `run-b-stdout-mismatch`), evaluator exit 0 (`scored/c2-eval-L1.json`); (b) R71Exec2's cold harness: same classes, evaluator holds (`w1/R71Exec2/eval.json`); (c) `verify-live-r71 --profile synthscroll-r69` and `--profile synthtap-r70` exit 0, predicate true, pinSource frozen, 4/4 snapshot reads equal the pins (`scored/c2-verify-live-r71-*.json`); (d) pre-freeze controls hold | **verified on the frozen predicate** (a)–(d). Operability held at 9; measured movement: false passes 4 → 0 on the four named attacks with both positives intact. Attack record, not amended: R71Critic HOLDS-WITH-LIMIT — a receipt hand-off (swap the driver's receipt file between the verifier's load at `verify-live-r71.mjs:189` and the counter spawn) landed on a lane copy and was refused only by the stdout binding, which covers 5–6 summary keys; an in-place edit outside those keys would pass; and children run `process.execPath`, a same-user-writable fnm node. R71Review2 SOUND, with N1 `NODE_COMPILE_CACHE` not on the env list and F2 the summary is not bound to the verifier digest. R71Mut2: 2 of 11 hardening mutants killed, 0 false passes under any mutant — the four attacks prove the layers in combination, not each layer alone. |

Knowledge 83 → 84 (`corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-71.md`). Registry 175 → 178 (S176–S178 tier A `code`, mined; S173 and S174 used-by extended). QUALITY 133–134 added. SKILL.md `## Round 71 gate registry` registers `check-synthpinch-r71` and `verify-live-r71` with `scripts/selftest-r71-gates.mjs --selftest` (`scored/selftest-r71-gates.out`, 8/8, exit 0); `check-gate-registry --rev 64e389f2` lists only the 5 pre-existing missing rows (R6).

Correction — round 70 C1 limit (r70 closure R2): the frozen round-70 `claims.json` C1 `limit` sentence "a receipt passes only if it names the executed binary and that binary is the frozen driver" is false for `scripts/verify-live-r70.mjs`. R70Critic greened that verifier with frozen pins and no live run (inherited `NODE_OPTIONS` preload; driver swap between the pin read at `:122` and the spawn at `:158`), and this round's harness reproduces four such false passes (`.ufo/waves/round-71/controls/c2/pre-r70/summary.json`). The r70 C1 and C2 verdicts stay as closed; the sentence is withdrawn for the r70 generation, and `verify-live-r71.mjs` carries its own, narrower limit.

Correction — round 71 C2 limit (same-day, R71Critic): the frozen round-71 `claims.json` C2 `limit` sentence names snapshot swap-and-restore, verifier patching and in-process execution as the residual same-user vectors. It omits two that R71Critic found: (1) receipt hand-off — the receipt file is read at `verify-live-r71.mjs:189` and handed to the counter by path at `:205`, with nothing re-binding the bytes in between (`.ufo/waves/round-71/w1/R71Critic/receipts/c2/`); (2) interpreter substitution — children are spawned with `process.execPath`, a node build this user can write. The sentence's own clause "narrowed, not excluded" stands; the enumeration is incomplete, and these two are added to it here. The C2 verdict is unchanged: the predicate measures exactly the four named attacks.

Capabilities (this round): none admitted. `chromium-synth-pinch-gesture-linux` is withheld: its frozen predicate's leg (b) is red (above).

Planned (r72): re-claim `chromium-synth-pinch-gesture-linux` with a driver that reads the event log and relabels in one evaluation (or closes the tab first), N≥5 pre-freeze live repetitions with a per-check red rate, and a counter generation closing R71Review1's 15 false greens and R71Mut1's 24 executed killing cases (plus a must-accept case class); a verifier generation that snapshots the receipt bytes before the counter (R71Critic hand-off), spawns a root-owned interpreter or re-hashes it, adds `NODE_COMPILE_CACHE` to the env list, and a harness whose summary records the verifier digest with one attack per hardening layer (R71Mut2, R71Review2 F2). Retired: none.

## Round 72 (2026-11-06, Linux host, attempt 2) — C1 capability `chromium-synth-pinch-gesture-linux` re-claim, generation r72 (honest stop on leg c)

Base `4e4ac0800abf5ad19d2a12caf46f80a873ebba8d`; pre-freeze instruments and executed controls `0217f780` (counter 5/5 clean over the smoke repetitions; battery 218/218 on smoke1; kill power 94/94 force-true and 12/12 semantic incl. M5 on smoke1, after two cases were added for the 2 pre-freeze semantic survivors); freeze `8356a09e` (`.ufo/waves/round-72/claims.json`); digests `7366d45c` (`.ufo/waves/round-72/freeze.txt`). Axes at start: all six at 9; C1 works a lowest axis. Saturation 8 / window 3: capability `chromium-synth-tap-gesture-linux` entered at r70, so no stagnation nudge. Attempt 1 left the r72 instruments and controls uncommitted; attempt 2 re-verified and reused them (lesson).

| Claim / axis | Counting command (frozen predicate) | Before → after | Verdict |
|---|---|---|---|
| C1 coverage (9), capability `chromium-synth-pinch-gesture-linux`, generation r72 (sourced: S179 new; S176–S178, S174, S173) | `node scripts/check-synthpinch-r72.mjs --receipt corpus/evidence/round72/chromium-synth-pinch-gesture/receipt.json --expect-driver-sha256 d007adecd4525116eaa8f55f6fe676f523e2d264d300bbc5fa9ce376eabf7877 --json`; independent cold run (b); battery + kill power (c); row and note (d) (predicate `C1-SYNTHPINCH-R72`) | base: no receipt, counter exit 2 `receipt-unreadable`; r71 receipt under the r72 counter exit 1 (`controls/c1/donothing-*`); capability rows 0 → (a) exit 0 clean, 94 checks (`scored/c1-counter-a.json`); (b) R72Exec1 cold run, counter exit 0 clean (`w1/R72Exec1/counter.json`); **(c) battery exit 1, 217/218, failed `in-wheel-anchor-2px`** (`scored/c1-negatives-a.json`); kill power `holds:false` (the unmutated battery already exits 1 on this receipt, so its per-mutant kill counts are vacuous here: `scored/c1-kill-power-a.json`); (d) note admitted, row withheld (0) | **not verified — honest stop** on leg (c) as frozen. The counter is clean on both live runs; the battery case is receipt-relative (+2 px on a wheel that can start at 399 stays inside the ±1 tolerance). Nothing amended. Coverage held at 9. R72Critic: an admitted row would have been a re-claim of ground worked and withheld at r71, not expansion; legs (a)–(c) are also met by a replayed pre-freeze receipt (lesson Mistakes row 3, QUALITY 136) |

Capabilities (this round): none admitted. `chromium-synth-pinch-gesture-linux` stays withheld (leg (c) red).

Knowledge 84 → 85 (`corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-72.md`, the ctrl+wheel delta law). Registry 178 → 179 (S179 tier A `code`, mined). QUALITY 135–136 added. SKILL.md `## Round 72 gate registry` registers `check-synthpinch-r72` with `scripts/selftest-r72-gates.mjs --selftest` (`scored/selftest-r72-gates.out`, 8/8, exit 0).

Planned (r73): re-claim the pinch capability on a battery generation whose anchor case is absolute (R72Exec2's proposal) and which, with the counter and kill power, is run over every pre-freeze repetition receipt before the freeze (QUALITY 135); the r71 R2 verifier hardening. Retired: none.

## Round 73 (2026-11-06, Linux host) — C1 capability `chromium-synth-pinch-gesture-linux`, generation r73 (legs a–d hold)

Base `d7ff9f190260d91a1e675f474b7abf79960cdfd4`; pre-freeze instruments and executed controls `ae2628af` (counter, battery AND kill power over all 9 pre-freeze repetition receipts, 9/9: `.ufo/waves/round-73/controls/c1/prefreeze-summary.json`; do-nothing, replay and limit controls `controls-summary.json`, allOk); freeze `d7387fb3` (`.ufo/waves/round-73/claims.json`); digests commit D `3409ab53` (`.ufo/waves/round-73/freeze.txt`); scored run `c44fcf6f`. Axes at start: all six at 9; C1 works a lowest axis and is a capability move (last capability r70).

| Claim / axis | Counting command (frozen predicate) | Before → after | Verdict |
|---|---|---|---|
| C1 coverage (9), capability `chromium-synth-pinch-gesture-linux`, generation r73 (sourced: S180–S183 new; S179, S176–S178, S174, S173) | `node scripts/check-synthpinch-r73.mjs --receipt corpus/evidence/round73/chromium-synth-pinch-gesture/receipt.json --expect-driver-sha256 3f0ffe24c8436400589dd856cff8503af150cccbcf338e7b895fb9c4ce5559c4 --expect-nonce tabi-r73-l1-3409ab53b905 <12 PRE --prior> --json`; leg (b) R73Exec1 cold run; leg (c) battery + kill power; leg (d) row + note (predicate `C1-SYNTHPINCH-R73`) | base: no r73 receipt → counter exit 2; r72 scored receipt → exit 1 (`schema, nonce-shape, nonce-expected, driver-pin`); capability rows 0 → (a) exit 0 clean, 98 checks (`scored/c1-counter-a.json`); (b) R73Exec1 nonce `tabi-r73-exec1-3409ab53b905`, counter exit 0 clean, 98 checks (`w1/R73Exec1/counter.json`; L1 re-run `scored/c1-counter-b-L1rerun.json`); (c) battery exit 0, 228/228, coverage gap 0 (`scored/c1-negatives-a.json`), kill power holds, 98/98 force-true + 19/19 semantic (`scored/c1-kill-power-a.json`); (d) capability rows 0 → 1 (below), note cites S180–S183 | **verified on the frozen predicate** (limit sentence corrected below) |

Capabilities (this round):

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| `chromium-synth-pinch-gesture-linux` | Drive `Input.synthesizePinchGesture` over raw CDP on Chromium 155/Linux headless and prove the producer on a loopback page: mouse and default-source pinches arrive as trusted ctrl+wheel events at the anchor (±1 px while zooming, exact at scale 1) whose Σ deltaY × visual-viewport scale equals −100 ln(commanded scaleFactor) — sourced through Blink's wheel path (S179–S186) and measured to 4×10⁻⁵ — and change the page scale (1→2→1, clamp stays 1, 1→1.5); touch pinches arrive as two-finger touch sequences with no page-scale change on a desktop viewport; scaleFactor 1 is a no-op; pen and an out-of-viewport anchor are refused; scaleFactor 0 never finishes; look-alike producers (dispatched wheels, setPageScaleFactor, skipped touch) and replays that keep a prior receipt's launch token, DevTools browser id or event timeline are refused; re-derivable by running the pinned driver cold and the counter with that run's nonce | `scripts/chrome-cdp-synthpinch-round73.mjs`; `scripts/check-synthpinch-r73.mjs`; `scripts/negatives-synthpinch-r73.mjs`; `corpus/evidence/round73/chromium-synth-pinch-gesture/receipt.json`; `.ufo/waves/round-73/w1/R73Exec1/`; `corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-73.md` | round 73 |

Correction — round 73 C1 limit (same day, R73Critic, `w1/R73Critic/report.md` §1–2): the frozen `claims.json` C1 `limit` sentence says a forger must rewrite the nonce, the launch token, the DevTools browser id and every event time of a prior receipt to escape the replay checks. That is true only of receipts passed as `--prior`. A receipt of the previous generation (the r72 scored receipt, or r72 smoke1), which is not in the frozen 12-receipt prior set, passes the frozen counting command with only four identity fields relabelled (schema, nonce, nonceOnPage, driverSha256) and its launch token, browser id and timeline unchanged (F4/F5: `.ufo/waves/round-73/lesson-proof/forge-r72-relabel.pre-only.json`, `forge-legb-r72smoke1.pre-only.json`, exit 0). The same counter refuses both once the 87 committed r71/r72 receipts are added as priors (`*.crossgen.json`, exit 1, the three replay ids). The doNothingControl line "r72 scored receipt → exit 1" holds only for the unmodified file. The C1 verdict is unchanged: the predicate's legs are measured, the (a) nonce first appears after D (R73Review3 §3), and both scored receipts stay clean against PRE plus all 87 earlier-generation receipts (`scored/c1-counter-a-crossgen.json`, `c1-counter-b-crossgen.json`, exit 0), so neither is a relabel of a committed earlier receipt. The limit is restated: the replay checks refuse only replays of receipts in the `--prior` set; any receipt outside it is a forge base needing only an identity relabel. R73Review1 §1.4 sharpens the same sentence from the other side: with a fresh launch token and browser id, perturbing ONE event's `ts` or `at` by 1e-12 already defeats `replay-event-timeline` (`w1/R73Review1/r05-*`, `r06-*`, exit 0), so "every event time" overstates the work; the timeline check is byte-exact on the `(ts, at)` sequence.

Knowledge 85 → 86 (`corpus/knowledge/chromium-synth-pinch-gesture-runtime-round-73.md`). Registry 179 → 186 (S180–S186 tier A `code`, mined; S184–S186 opened after the freeze, after R73Scout located the emulation factor). QUALITY 137–138 added. SKILL.md `## Round 73 gate registry` registers `check-synthpinch-r73` with `scripts/selftest-r73-gates.mjs --selftest` (`scored/selftest-r73-gates.out`, 12/12, exit 0).

Planned (r74): a counter generation whose prior set is every committed receipt of every pinch generation (QUALITY 138), the R73Mut1 survivors with acceptance witnesses as battery cases, the r71 R2 verifier hardening, R72Review1/R73Review1 FG2–FG12 receipt-content false greens. Retired: none.

## Round 74 (2026-11-07, Linux host) — C1 capability `chromium-ime-composition-linux` (legs a–d hold; frozen limit and prior-set sentences falsified)

Base `c72235d6aebca89269809050e983d53df36273f5`; pre-freeze instruments and executed controls `b70e0a27` (counter, battery AND kill power over all 9 pre-freeze repetition receipts, 9/9: `.ufo/waves/round-74/controls/c1/prefreeze-summary.json`; do-nothing, replay, 1e-12 and limit controls `controls-summary.json`, allOk); freeze `8faa903a` (`.ufo/waves/round-74/claims.json`); digests commit D `ca30e1a3` (`.ufo/waves/round-74/freeze.txt`); scored run `19c301da`. Axes at start: all six at 9; C1 works a lowest axis and is a capability move (last capability r73).

| Claim / axis | Counting command (frozen predicate) | Before → after | Verdict |
|---|---|---|---|
| C1 coverage (9), capability `chromium-ime-composition-linux`, generation r74 (sourced: S187–S193 new) | `node scripts/check-imecompose-r74.mjs --receipt corpus/evidence/round74/chromium-ime-composition/receipt.json --expect-driver-sha256 afacee1b193ea2ba7ccab945956cee912eeed18cc5aa2fcacf5d65dc261dc2dc --expect-nonce tabi-r74-l1-ca30e1a3b7b2 <12 PRE --prior> --json`; leg (b) R74Exec1 cold run; leg (c) battery + kill power; leg (d) row + note (predicate `C1-IMECOMPOSE-R74`) | base: no r74 receipt → counter exit 2; the r73 pinch receipt → exit 1 (`schema, nonce-shape, nonce-expected, driver-pin, ime-call-count`, …); capability rows 0 → (a) exit 0 clean, 148 checks (`scored/c1-counter-a.json`); (b) R74Exec1 nonce `tabi-r74-exec1-ca30e1a3b7b2`, counter exit 0 clean 148 with PRE + (a) (`w1/R74Exec1/counter.json`); (c) battery 239/239, coverageGap 0, kill power 148/148 force-true + 26/26 semantic, holds (`scored/c1-negatives-a.json`, `scored/c1-kill-power-a.json`; R74Exec1 re-run agrees); (d) row below, note `corpus/knowledge/chromium-ime-composition-runtime-round-74.md` citing S187–S193 | measured on the frozen predicate; all four legs hold. Coverage score held at 9: one new interaction surface (IME composition) moved frontier → core for this build. Limit and prior-set sentences falsified (correction below). |

Capabilities (this round):

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| `chromium-ime-composition-linux` | Drive `Input.imeSetComposition` and `Input.insertText` over raw CDP on Chromium 155/Linux headless into an `<input>` and a contenteditable and prove the page-side result: composition start/update/end with the update data reappearing in `beforeinput`/`input` `insertCompositionText` (isComposing true) and in `compositionend`; `compositionend` untrusted (queued dispatch, S190–S192) while every other event is trusted; `compositionstart` data = the selected text; empty text cancels (input data null, end data ""); commit replaces the composition, a plain `insertText` fires `insertText` (isComposing false); a half-specified replacement is refused `-32602` with no events; with nothing focused a composition is inert while `insertText` still edits the selection without `beforeinput`; no key events; look-alike producers (`Input.dispatchKeyEvent`, `execCommand('insertText')`, script-dispatched events) are refused from the CDP send log and trust pattern | `scripts/chrome-cdp-imecompose-round74.mjs`; `scripts/check-imecompose-r74.mjs`; `corpus/evidence/round74/chromium-ime-composition/receipt.json`; `.ufo/waves/round-74/w1/R74Exec1/receipt.json`; `corpus/knowledge/chromium-ime-composition-runtime-round-74.md` | 74 |

Correction — round 74 C1 limit and prior set (same day, R74Critic §1.2–§3, R74Review1 S1): the frozen `claims.json` `priorSet` sentence ("no committed receipt with schema tabi-chrome-cdp-imecompose-* … PRE is every committed receipt of the surface") is false: three probe receipts of that schema (`controls/c1/probe/p2–p4`) were committed in the pre-freeze commit outside PRE (`lesson-proof/prior-set-enumeration.txt`). Relabels of p2/p3 (nonce, fixture hash, `driverSha256` field, producer verdict, `legShape`; no token, browser-id or time change) pass legs (a) and (b), the battery and kill power (`w1/R74Critic/min-p2.counter.json`, `min-p3.counter.json`, `bat-min-p2.json`, `kp-p2.json`). The frozen `limit` sentence is incomplete in three ways: the escape needs no time move when its source receipt is not a prior; the near-match compares only receipts with equal event counts, so one added or removed focus event escapes it (`w1/R74Review1/b4-…`, `b5-…`, exit 0); and `startedAt` is not bound to "after D". The four legs stand as measured; the post-freeze checks show the round's own receipts are not probe relabels: with p2–p4 added as priors, (a), R74Exec1 and R74Exec2 d1–d3 stay clean and the critic's relabels are refused for the three replay ids (`lesson-proof/postfreeze-checks.json`, allOk). The four kill-power rows recorded as kills with no failing-case list are genuine kills attributed to the mutated check (same file, `reruns`). QUALITY 139–140 added.

Knowledge 86 → 87 (`corpus/knowledge/chromium-ime-composition-runtime-round-74.md`). Registry 186 → 195 (S187–S193 tier A `code`, mined, before the freeze; S194–S195 after, located by R74Scout). SKILL.md `## Round 74 gate registry` registers `check-imecompose-r74` with `scripts/selftest-r74-gates.mjs --selftest` (`scored/selftest-r74-gates.out`, 12/12, exit 0).

Planned (r75): an IME counter generation whose prior set is enumerated by schema at the freeze parent (QUALITY 140) and whose timeline comparison survives inserted/deleted events (R74Review1 S1); kill power that refuses a crash as a kill and a battery that requires its laundered receipts (R74Review2 F1/F2); R74Mut1's 19 acceptance witnesses as battery cases; carried: the pinch cross-generation prior set (QUALITY 138) and R73Mut1 survivors. Retired: none.

## Round 75 (2026-11-07, Linux host) — C1 capability `chromium-drag-intercept-linux` (legs a–d hold; frozen limit sentence imprecise, claims item 2 omits the open F4/F5)

Base `c19a520fdfa574a5c082b09130b7dbfcdd1e99eb`; pre-freeze instruments and executed controls `d71951a7` (counter, battery AND kill power over all 9 pre-freeze repetition receipts, 9/9: `.ufo/waves/round-75/controls/c1/prefreeze-summary.json`; do-nothing, replay, whole-shift, probe-relabel and limit controls `controls-summary.json`, allOk); freeze `b1ddabc5` (`.ufo/waves/round-75/claims.json`); digests commit D `57f28cf1` (`.ufo/waves/round-75/freeze.txt`); scored run `8204c176`. Axes at start: all six at 9; C1 works a lowest axis and is a capability move (last capability r74).

| Claim / axis | Counting command (frozen predicate) | Before → after | Verdict |
|---|---|---|---|
| C1 coverage (9), capability `chromium-drag-intercept-linux`, generation r75 (sourced: S196–S200 new) | `node scripts/check-dragdrop-r75.mjs --receipt corpus/evidence/round75/chromium-drag-intercept/receipt.json --expect-driver-sha256 d604552e408ed6998f32ead68e9732ba87b2ecfd7483d671ca95f63cf3228105 --expect-nonce tabi-r75-l1-57f28cf128e6 <16 PRE --prior from controls/c1/prior-set.txt> --json`; leg (b) R75Exec1 cold run; leg (c) battery + kill power; leg (d) row + note (predicate `C1-DRAGINTERCEPT-R75`) | base: no r75 receipt → counter exit 2; the r74 IME receipt → exit 1 (`schema, nonce-shape, nonce-expected, driver-pin, drag-call-count, intercept-event`, …); capability rows 0, notes citing the drag commands 0 → (a) exit 0 clean, 146 checks, 16 priors (`scored/c1-counter-a.json`); (b) R75Exec1 nonce `tabi-r75-exec1-57f28cf128e6`, counter exit 0 clean 146 with 17 priors (`w1/R75Exec1/counter.json`); (c) battery exit 0 254/254 allOk, kill power holds 146/146 force-true + 40/40 semantic, 0 crashed (`scored/c1-negatives-a.json`, `scored/c1-kill-power-a.json`; re-run by R75Exec1); (d) row 0 → 1 (below), note `corpus/knowledge/chromium-drag-intercept-runtime-round-75.md` cites S196–S200 | **verified** on the frozen predicate |

Capabilities (this round):

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| `chromium-drag-intercept-linux` | Drive `Input.setInterceptDrags` and `Input.dispatchDragEvent` over raw CDP on Chromium 155/Linux headless and prove the page-side result: a real mouse press/move on a draggable element yields exactly one `Input.dragIntercepted` event (the page's string items, operations mask 17) and no native drag session (no `chromium/x-drag-id`); replaying that data delivers trusted dragenter/dragover/drop to an accepting zone with the data readable only in `drop` and `dragend` on the source carrying the drop's dropEffect; an external drop on a zone that did not cancel its dragover becomes `dragleave`; `dragCancel` fires nothing and a later drop reaches nothing; `dragLeave` is refused `-32602` — sourced through the DevTools handler and Blink's drag target/controller/DataTransfer (S196–S200), measured identically on 18/18 runs; look-alike producers (native mouse drag, dispatch without interception, script `DragEvent`s) are refused | `corpus/evidence/round75/chromium-drag-intercept/receipt.json`, `.ufo/waves/round-75/scored/`, `corpus/knowledge/chromium-drag-intercept-runtime-round-75.md` | r75 |

Correction — round 75 C1 limit and routed-defect account (same day, R75Critic F1–F3, R75Revenger §3): the frozen `claims.json` `limit` sentence is directionally right — a relabel of a PRE receipt re-timed by +0.3 ms × seq passes (a) and both parts of (c) (`w1/R75Critic/counter-ramp.json`, `battery-ramp17.json`, `killpower-ramp17.json`) — but imprecise: the smallest on-grid move is 0.1 ms (not 0.05); "more than half of the event times" means 9 of 17 events, where moving either `ts` or `at` of an event suffices; and the battery and kill power are receipt readers as well, so legs (a)–(c) carry no execution assurance beyond the driver runs. The frozen `priorRound` item 2 lists the crash-as-kill and laundered-receipt fixes but omits r74's F4/F5 tolerance weakenings, which are open for this generation (both survive the r75 battery, R75Revenger E2/E3) — recorded in `corpus/lessons/round-75.md` Mistakes row 5. Neither sentence is a predicate leg; no leg changes.

Knowledge 87 → 88 (`corpus/knowledge/chromium-drag-intercept-runtime-round-75.md`). Registry 195 → 201 (S196–S200 tier A `code`, mined, before the freeze; S201 after, located by R75Scout). QUALITY 141–142 added. SKILL.md `## Round 75 gate registry` registers `check-dragdrop-r75` with `scripts/selftest-r75-gates.mjs --selftest` (`scored/selftest-r75-gates.out`, 12/12, exit 0).

Planned (r76): a drag counter generation that pins the host version/product and headless argv, checks the CDP error code, compares DataTransfer fields structurally, reads the prior set from the committed file, brackets both tolerances and both replay thresholds at their boundaries (r74 F4/F5), attributes each kill-power kill to a named case and classifies counter crashes (R75Review2), and folds R75Mut1's 26 acceptance witnesses into the battery; carried: R74Mut1 (IME), the pinch cross-generation prior set and R73Mut1 survivors. Retired: none.

## Round 76 (2026-11-07, Linux host) — C1 capability `chromium-js-dialog-linux` (legs a–d hold; frozen limit sentence and surface sentence falsified, marked)

Base `a69f9060cb9d239b3d6d4429e1b91177b792ebd3`; pre-freeze instruments and executed controls `7e792fa3` (counter, battery AND kill power over all 9 pre-freeze smoke receipts plus the counter over the 4 probes, 9/9 + 4/4: `.ufo/waves/round-76/controls/c1/prefreeze-summary.json`, after a red pass 1 kept in `lesson-proof/prefreeze-pass1/`; do-nothing, forgery, positive and limit controls `controls-summary.json`, allOk); freeze `6ea51ce1` (`.ufo/waves/round-76/claims.json`); digests commit D `97bf5d56` (`.ufo/waves/round-76/freeze.txt`); scored run `2d3628fe`. Axes at start: all six at 9; C1 works a lowest axis and is a capability move (last capability r75).

| Claim / axis | Counting command (frozen predicate) | Before → after | Verdict |
|---|---|---|---|
| C1 coverage (9), capability `chromium-js-dialog-linux`, generation r76 (sourced: S202–S206 new) | `node scripts/check-dialog-r76.mjs --lane <lane> --receipt corpus/evidence/round76/chromium-js-dialog/receipt.json --expect-driver-sha256 152ffc116b0b15968eb18ab8682b9de3ac49a2f9f3f81ff22e77153526fbdd51 --expect-nonce tabi-r76-l1-97bf5d560d03 --prior-set .ufo/waves/round-76/controls/c1/prior-set.txt --json`; leg (b) R76Exec1 cold run; leg (c) battery + kill power; leg (d) row + note (predicate `C1-JSDIALOG-R76`) | base: no r76 receipt → counter exit 2; the r75 drag receipt → exit 1 (`schema, nonce-shape, nonce-expected, driver-pin, dialog-call-count, cdp-event-log-closed`, …); no prior set → exit 2 usage; capability rows 0, notes citing the CDP dialog commands 0 → (a) exit 0 clean, 131 checks, 17 priors (`scored/c1-counter-a.json`); (b) R76Exec1 nonce `tabi-r76-exec1-97bf5d560d03`, counter exit 0 clean 131 with the prior set + the scored receipt (`w1/R76Exec1/counter.json`); (c) battery exit 0 allOk 251/251, 3 laundered, coverageGap 0 (`scored/c1-negatives-a.json`), kill power exit 0 holds: force-true 131/131, semantic 56/56 (3 killed-positive), crashed 0, both unmutated runs survived, guard ok (`scored/c1-kill-power-a.json`); (d) row 0 → 1, note `corpus/knowledge/chromium-js-dialog-runtime-round-76.md` citing S202–S206 | **verified** (measured; all four legs hold as frozen) |

Capabilities (this round):

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| `chromium-js-dialog-linux` | Drive JavaScript dialogs over raw CDP on Chromium 155/Linux `--headless=new`: open alert/confirm/prompt with real mouse clicks (release sent without awaiting), wait for `Page.javascriptDialogOpening`, answer with `Page.handleJavaScriptDialog`, and prove the page-side result — alert returns `undefined`, confirm the answer, prompt the `promptText`, `""` when accepted without it (not the default) and `null` when dismissed while `javascriptDialogClosed` echoes the text; the page is blocked in the dialog until answered; answering with no dialog open is refused `{code -32602, "No dialog is showing"}`; a dismissed beforeunload aborts `Page.navigate` (`net::ERR_ABORTED`, page stays), an accepted one navigates — sourced through Page.pdl, page_handler.cc, web_contents_impl.cc, local_dom_window.cc and chrome_client_impl.cc (S202–S206); look-alike producers (page stubs, script clicks, swapped answers) refused | `node scripts/selftest-r76-gates.mjs --selftest` (`.ufo/waves/round-76/scored/selftest-r76-gates.out`, 13/13); `corpus/evidence/round76/chromium-js-dialog/receipt.json`; `.ufo/waves/round-76/w1/R76Exec1/receipt.txt` | 76 |

Correction — round 76 C1 limit, surface and self-assessment sentences (same day, wave w1; the frozen predicate and instruments are unchanged, these are statements, not legs):
1. Limit (R76Critic A2): the frozen `claims.json` `limit` and the counter header say a relabelled prior escapes once ≥ 19 of its 37 events and ≥ 2 of its 6 gaps move. The gap fraction's denominator is the receipt's OWN gap count: a forgery that moves one leg-boundary event by ~305 ms changes one gap and adds a seventh, so 5/7 < 0.75 and it escapes with 19 events and 1 changed gap (`w1/R76Critic/F2c-one-gap.counter.json`, exit 0 clean 131). The minimum is 19 events and 1 gap. This is r75's routed defect 5 ("state the limit exactly") — not closed this round.
2. Surface (R76Scribe 1): "No tabi capability row or knowledge note covers dialogs" is false for notes: the WebDriver BiDi notes of rounds 32/35 measured one `alert` via BiDi `handleUserPrompt` (`webdriver-bidi-runtime-round-32.md:83,108`, which itself says "Not dialog coverage"). The frozen before-commands (CDP dialog command names, capability row) are what the predicate counts and both were 0; confirm, prompt, beforeunload and the CDP surface were new ground.
3. QUALITY 144 (R76Review3 F1): the criterion says every battery placement guard runs on all honest receipts, probes included; the round ran only the counter on the probes. Reconstructed: the battery misplaces two bracket cases on probe p2 (`keepExact` moves an event onto another event of the same receipt; `w1/R76Review3/receipts/recheck-battery-probe-p2.json`), fails closed, so no false green and leg (c) is unaffected (scored receipt 251/251).
4. Kill power header (R76Review2 F1): "both directions of every carried tolerance and threshold" is false for `GAP_MIN` (50): 100, 200 and 290 survive the battery (`w1/R76Review2/receipts/mutants-gapmin.json`).
5. `claims.json` cites the prior-set enumeration "at the freeze parent": it was computed over the freeze parent's bytes but committed in the freeze commit `6ea51ce1` (R76Review3 F2; content equals an independent enumeration at `7e792fa3`).

Knowledge 88 → 89 (`corpus/knowledge/chromium-js-dialog-runtime-round-76.md`, corrected in place after the wave: novelty sentence, the 20 ms attribution, S202/S204 ranges, the -32602 provenance, the Page-disabled frontier measured by R76Exec3). Registry 201 → 207 (S202–S206 tier A `code`, mined, before the freeze; S207 after, located by R76Scout). QUALITY 143–144 added. SKILL.md `## Round 76 gate registry` registers `check-dialog-r76` with `scripts/selftest-r76-gates.mjs --selftest` (`scored/selftest-r76-gates.out`, 13/13, exit 0).

Planned (r77): a dialog counter generation whose limit sentence is derived from the counter's own denominators (and a battery case that adds a gap and changes one), whose prior-set walk follows symlinks / reads case-insensitive `.json` / refuses unparsable schema-bearing files (R76Review1 F1), which binds event-log order, frame ids and urls (R76Review1 F2–F5), whose battery places brackets collision-free on every honest receipt including probes, with a `GAP_MIN` bracket and mutant (R76Review2 F1), and R76Mut1's 7 acceptance witnesses as battery cases; carried: R75Mut1 (drag), R74Mut1 (IME), R73Mut1 (pinch). Retired: none.

## Round 77 (2026-11-07, Linux host, attempt 2) — C1 capability `chromium-file-chooser-linux`

Base `1320d428f0c0957b46d6969b59c122fd69199331`; pre-freeze instruments, executed controls, 13 honest
pre-freeze receipts (4 probes, 9 smokes) plus 3 shape probes and the three degenerate producers `cf0804f4`;
frozen claim `.ufo/waves/round-77/claims.json` `b51afa7f`; digests commit D `dcdf582a`
(`.ufo/waves/round-77/freeze.txt`); scored run `ec89a40e`; wave spec and dispatch `eedaa802`. Axes at
start: all six at 9; C1 works a lowest axis and is a capability move (last capability r76). Attempt 1 of
this round died `lane-dead-no-report`; its output was inherited, re-verified and committed here (report,
*Work performed*).

| Claim / axis | Counting command (frozen predicate) | Before → after | Verdict |
|---|---|---|---|
| C1 coverage (9), capability `chromium-file-chooser-linux`, generation r77 (sourced: S208–S212 new) | `node scripts/check-filechooser-r77.mjs --lane <lane> --receipt corpus/evidence/round77/chromium-file-chooser/receipt.json --expect-driver-sha256 9954db0703e03aed157c4be9b13f678b1bc1a6240b4bf88491d0e1f5286558a6 --expect-nonce tabi-r77-l1-dcdf582add58 --prior-set .ufo/waves/round-77/controls/c1/prior-set.txt --json`; leg (b) R77Exec1 cold run; leg (c) battery + kill power; leg (d) row + note (predicate `C1-FILECHOOSER-R77`) | base: no r77 receipt → exit 2 `receipt-unreadable`; the r76 dialog receipt → exit 1, 123 findings incl. `schema, nonce-shape, nonce-expected, server-log-binding, driver-pin, fixture-hash`; no prior set → exit 2 usage; capability rows 0; notes naming `setFileInputFiles\|fileChooserOpened` 0 (`scored/before/`) | exit 0, clean 183, 19 priors, limit block 19 entries (absNeed 40 / gapNeed 9); battery 336/336 allOk; kill power holds (183 force-true + 70 semantic, 0 survivors, 0 crashes) (`ec89a40e`); capability row 0 → 1 and note 0 → 1 (`24cd88f8`); **C1 NOT VERIFIED — leg (b) false as frozen**: R77Exec1's cold run wrote a receipt whose seven `#s` chooser events carry backendNodeId 4 with every other per-leg field identical to the scored run, so the pinned counter exits 1 with 8 findings (`R77Exec1/counter.json`); reproduced independently (1 of 4 L1 diagnostic runs gave `#m` = 10; `L1-diag/r2.json`) |

Capabilities (this round):

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| `chromium-file-chooser-linux` | Intercept and answer `<input type=file>` choosers over raw CDP on Chromium 155/Linux `--headless=new`: `Page.setInterceptFileChooserDialog` (experimental `cancel` included) suppresses the native dialog and emits `Page.fileChooserOpened` (mode `selectMultiple` iff the input has `multiple` — a `webkitdirectory` input reports `selectSingle`), the chooser opens only from a click carrying transient user activation (a forwarded click from a trusted button is untrusted but activated and opens; a script click without a gesture opens nothing), `DOM.setFileInputFiles` on the event's `backendNodeId` delivers trusted `input`+`change` with exact bytes, an unchanged selection fires `cancel` instead, `[]` fires nothing and keeps the selection, a missing path yields a 0-byte `File` whose read fails `NotFoundError`, `accept` is not enforced on this path, a non-file node is refused `-32000 "Node is not a file input element"`; sourced through S208–S212; measured 15 legs (note `chromium-file-chooser-runtime-round-77.md`) | `.ufo/waves/round-77/scored/c1-counter-a.json` (clean 183), `c1-negatives-a.json` (336/336), `c1-kill-power-a.json` (holds), `corpus/evidence/round77/chromium-file-chooser/receipt.json` | provisional r77 |

Knowledge 89 → 90 (`corpus/knowledge/chromium-file-chooser-runtime-round-77.md`). Registry 207 → 212
(S208–S212 tier A `code`, mined, before the freeze). QUALITY 145–149 added. SKILL.md
`## Round 77 gate registry` registers `check-filechooser-r77` with `scripts/selftest-r77-gates.mjs`
(`scored/selftest-r77-gates.out`, **11/13, exit 1**: `exec1-clean` red for the node-id defect above, `scored-clean` red because the harness demands `priorEvents 79 / priorGaps 11` of every prior while 3 of the 19 priors are the degenerate producers (37 and 35 events) — both routed to r78).

Correction — round 77 wave w1 and the frozen claim's own falsifier (same day; frozen instruments, predicate and kill rule unchanged):
1. **Leg (b) is false, and the class is a browser-assigned identifier.** `leg-*-opened` requires the `Page.fileChooserOpened` `backendNodeId` to be 5/7/14/18. That held in 23 of 25 observed runs and drifted twice — `#s` → 4 (R77Exec1's cold run) and `#m` → 10 (L1 diagnostic run 2) — with every other per-leg field identical. The value is Blink's serialization artifact, not a fixture property; QUALITY 150 states the rule, the note's sentence is corrected, and r78 binds the event's node to the page-side leg record instead of an id.
2. **R77Review1 F1/F2/F3 (HIGH).** The prior-set walk is gated on the literal schema bytes, so a JSON-escaped schema (`\u0037`) hides a receipt inside a walked tree; and the run-under-test exemption is keyed to the receipt's self-claimed nonce, so a second contradictory receipt claiming the run's nonce is invisible. Both are inside the trees, i.e. outside the declared limit. F3: `host-argv` pins 6 of 17 slots and a decoy `--user-data-dir`/`--remote-debugging-port` in a free slot passes while Chromium honours the decoy (measured on the pinned binary); F4 `mainFrameId` is self-referential; F5–F9 bookkeeping fields are unread.
3. **R77Exec4 R10.** A symlink inside a walked tree is followed and parsed, but the exemption is the file's own nonce claim (confirmed: a linked copy of the scored receipt is exempt; a linked foreign-nonce receipt is refused `prior-set-complete`). Hard-link smuggling from the seats tree is topologically impossible here (seats on /home, trees on /fast).
4. **R77Mut1.** 69 semantic mutants; the frozen battery kills 27 (20 by a named case, 7 by refusing the honest receipt) and **42 survive**, of which 34 are killed by witnesses it injected into a battery copy (both directions verified), 6 are argued equivalent, 2 unwitnessed — routed as battery cases for r78.
5. **R77Review2 HOLDS** the brackets and the D1 denominator but reports the battery's full-pipe run and the 19-prior limit block verified independently.
6. **R77Exec2 HOLDS**: 3 fresh cold runs clean; per-check red rate 0/16 and per-case battery failure 0/5376; honest-pair replay margins 39/40 abs and 6/9 gap (the pre-freeze maximum was 1/40 and 2/9 — the replay rule's margin is thinner than the pre-freeze pass suggested).
7. **R77Exec3 HOLDS** the frontier probe: `DOM.setFileInputFiles([<dir>])` on an intercepted `webkitdirectory` input answers in 0–4 ms and delivers 3 files with `webkitRelativePath` (the "no answer within ~60 s" of attempt 1 was not reproduced); the note's Limits section now cites it.
8. **Citation corrections (R77Scout F1–F6, R77Scribe F1–F6/D1–D7)**: S212's range is 1294-1304 (the field is at 1304); the cancel-flag quote is verbatim with its trailing clause; the `input.Multiple()` probe call belongs to S210:203; `SetFiles(files) || force` at 469 (FilesChosen 483-508); `SetFilesFromPaths` is declared at 535; S210's mined scope widened to 174-224 and 525-556; S213 added (client-side, opened **after** the freeze, not a claim source; companion `revisions.ts:11` pins Chrome 156.0.8078.47); its bytes staged in `.ufo/waves/round-77/sources/`.
9. **The frozen claim cites an absent artefact** (R77Review3 F1, R77Critic): `claims.json` names `lesson-proof/prior-set-enumeration.txt`, which no commit contains; the equality it asserts is reproducible and the record was produced post-D from the freeze parent's bytes (`lesson-proof/prior-set-enumeration.txt`, `equal to prior-set.txt: true`, exit 0). The frozen text is not edited; the defect is recorded.
10. **The before-state quoted with a dummy nonce**: the r76 dialog receipt yields 123 findings under `--expect-nonce tabi-r77-x-0000` and 122 under the scored nonce (`scored/before/r76receipt{,-realnonce}.json`); both are kept.

Planned (r78): a file-chooser counter generation that binds the chooser event's node to the page-side leg record rather than to a browser-assigned `backendNodeId` (QUALITY 150), whose prior-set walk parses every in-tree file that parses and whose run-under-test exemption is path- and byte-bound (Review1 F1/F2), whose `host-argv` pins every slot or derives from the decoded argv (F3), whose `mainFrameId` is bound to `Page.getFrameTree` (F4) and whose bookkeeping fields are either read or dropped (F5–F9), whose battery carries R77Mut1's 34 witnesses and whose selftest derives per-prior needs from the counter's own output; the `webkitdirectory` directory path becomes a measured leg (R77Exec3). Carried: R76Mut1's 7 dialog acceptance witnesses (no dialog generation this round), R75Mut1 (drag), R74Mut1 (IME), R73Mut1 (pinch). Retired: none.

## Round 78 (2026-11-07, Linux host) — C1 capability `chromium-file-chooser-linux`, generation r78 (round-77 routed defects closed); C2 capability-row calibration

Base `ae2dc25fe8b4db70d2ef8a83804bc5545fbc35ff`; pre-freeze instruments, executed controls and 10 honest
pre-freeze receipts (probes p1-p4, smokes s1-s3, three degenerate producers) `e866ca7c`; a pre-freeze
repair `3289c1d0` (the driver's own LEG-SHAPE block still pinned the assigned `backendNodeId`, and the
cold-run leg caught it: `pick-multiple` 7→10, `producer-verdict` only); digests commit D `d59ca027`
(`.ufo/waves/round-78/freeze.txt`); scored run and gates `b1f33724`. Axes at start: all six at 9; C1
works a lowest axis and is a capability move (last capability r76).

| Claim / axis | Counting command (frozen predicate) | Before → after | Verdict |
|---|---|---|---|
| C1 coverage (9), capability `chromium-file-chooser-linux`, generation r78 (sourced: S214–S215 new; S208–S213 carried) | `node scripts/check-filechooser-r78.mjs --lane <lane> --receipt corpus/evidence/round78/chromium-file-chooser/receipt.json --expect-driver-sha256 0ae89d923f0b166bdb67562ab45d1457b6e5f76043e89c8ffc8e7c53b69f523f --expect-nonce tabi-r78-l1-d59ca0270c2a --prior-set .ufo/waves/round-78/controls/c1/prior-set.txt --json`; leg (b) cold runs; leg (c) battery + kill power; leg (d) row, note, registry, selftest (predicate `C1-FILECHOOSER-R78`) | base: the r77 scored receipt under the r78 counter exits 1 with 9 findings (schema, nonce-shape, nonce-expected, receipt-fields, driver-pin, fixture-hash, frame-tree, fixture-descriptors, mode-law; `lesson-proof/c1-nowork.json`); capability rows on a NOT VERIFIED round 1 → (a) exit 0 clean, 186 checks, 11 priors (`scored/c1-counter-a.json`); (b) cold1 and the wave's cold runs clean (0 refusals, nodeReport shows the drifted id 10 accepted); (c) battery 398/398 allOk and kill power holds (force-true 186/186, semantic 76/76, 0 survivors); (d) selftest 15/15 exit 0, row moved to round 78 with the r77 provisional note | VERIFIED |
| C2 calibration (9), capability-row status | `node scripts/check-capability-status.mjs --json` (exit 1 on a mismatch; the verdict test reads only claim-table Verdict cells; the named round must list the capability; a `provisional` cell must name its round) | before: exit 1, mismatches 1 (`chromium-file-chooser-linux` named round 77, whose C1 is NOT VERIFIED; `lesson-proof/c2-before.json`); controls: a `provisional` cell with no round exits 1, `provisional r77` exits 0 (`lesson-proof/c2-controls.json`) → after: exit 0, mismatches 0, rows 11 / claimed 10, provisional 1 (the historical r77 row, honestly labelled; `scored/c2-after.json`) | VERIFIED |

Capabilities (this round):

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| `chromium-file-chooser-linux` (generation r78) | As round 77, and now bound to the page instead of to a browser-assigned id: the chooser event's mode is checked against the page-measured descriptor of the leg's target (`fixtureInputs`: tag, type, multiple, webkitdirectory, accept, rect containing the commanded point), the assigned `backendNodeId` is reported (`nodeReport`) and bound structurally (set targets the opened id; one id per input; distinct), a consistent relabel is inside the declared limit; the main frame is anchored in the driver's `Page.getFrameTree` result (no parent, `about:blank`); `host-argv` is exact equality on all 17 slots; `receipt-fields` closes the top-level key set; the prior-set walk parses every regular file (no schema-byte gate) and exempts by PATH only, with an explicit `--tree-exempt` for the pre-freeze harness | `scripts/chrome-cdp-filechooser-round78.mjs`; `scripts/check-filechooser-r78.mjs`; `corpus/evidence/round78/chromium-file-chooser/receipt.json`; `.ufo/waves/round-78/scored/c1-{counter,negatives,killpower}-a.json`; `.ufo/waves/round-78-seats/L1-cold1/receipt.json` | round 78 |

Knowledge 90 → 91 (`corpus/knowledge/chromium-file-chooser-runtime-round-78.md`). Registry 213 → 215
(S214–S215 tier A `docs`, mined, opened this round). QUALITY 151–154 added. SKILL.md
`## Round 78 gate registry` registers `check-filechooser-r78` with `scripts/selftest-r78-gates.mjs`
(`.ufo/waves/round-78-seats/L1-selftest/selftest-r78-gates.out`, 15/15, exit 0).

Correction — round 78's own instrument history (same day; the frozen predicate and kill rule unchanged):
1. **The producer's self-check still pinned the id.** The first post-D cold run scored `producer-verdict`
   only, with `pick-multiple` `opened` 7→10 and every other field identical
   (`lesson-proof/driver-shape-id-pin.json`). The driver's LEG_SHAPE now holds modes only and its
   predicate compares a mode projection; all pre-freeze receipts were re-produced and the gates re-run
   before the scored run.
2. **Battery placement semantics.** Two carried brackets demanded exact counts; on the scored receipt the
   gap side matched fully, so the cases would have tested the wrong rule. They now state the decisive
   property (`abs >= need` with an unconstrained gap side; a scattered accept prior below both needs),
   and a TOL witness (`accept-prior-retimed-0.051-scattered`) restores the `M-timeline-tol-0.06` kill
   (`lesson-proof/bracket-accept-overshoot.json`, `lesson-proof/tol-witness-loss.txt`).
3. **A post-D harness path fix.** `scripts/selftest-r78-gates.mjs`'s cold-run path was corrected from a
   copy inside the walked trees to `.ufo/waves/round-78-seats/L1-cold1/receipt.json` before the selftest
   was ever run; the change and its old/new digests are in `scored/post-d-changes.txt`.
4. **The scored harness wrote a duplicate receipt into the walked tree** on its first attempt and the
   counter refused it (`prior-set-complete`); the duplicate was removed (byte-identical to the canonical
   receipt) and the harness now writes only the canonical path (`lesson-proof/scored-harness-duplicate.json`).

5. **Limit sentence (R78Critic F3).** The frozen sentence names the refusal threshold (`absNeed` events,
   `gapNeed` gaps), not the escape minimum: a forgery escapes with `absMatched < absNeed` AND
   `gapMatched < gapNeed`, i.e. `N_p - absNeed + 1` events and `G_p - gapNeed + 1` gaps (40 events and
   3 gaps for the 79/11 priors). F3 (40 events, 3 gaps) scores clean 186; the frozen text is not edited,
   the corrected sentence is in `corpus/lessons/round-78.md` Corrections 1, and r79 prints the escape
   minimum beside the threshold.
6. **Re-freeze history.** D `d59ca027` did not satisfy its own `freeze.txt` (the battery bytes were
   uncommitted at that commit); `d986c273` superseded it, and the final D is `bf94adaa` (battery
   `3387e5f4`, 400 cases; kill power `9fdd4ea7`; counter `4ae29412`), where all 14 pins match. The scored
   receipt is post-D (`tabi-r78-l1-bf94adaab578`); the earlier scored receipts are superseded, never
   edited.

7. **C2 limit (R78Critic).** The counting command alone is satisfiable by labelling every row
   `provisional` (9 rows reach exit 0); leg (c) fixes the count at 1 and the row's round at 78, so the
   command is not the claim by itself. r79 states the count in the command (`--expect-provisional 1`).

Planned (r79): a counter generation whose `--tree-exempt` interface is itself receipt-bound (the caller
names the source by sha256, not by path); a `showPicker()` leg from R78Exec3's probe; the wave's
false-green findings (R78Review1) and survivors (R78Mut1) as battery cases; carried: the r77 survivors
now covered, the pinch/IME/drag/dialog witness sets. Retired: none.
