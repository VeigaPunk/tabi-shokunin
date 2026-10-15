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

