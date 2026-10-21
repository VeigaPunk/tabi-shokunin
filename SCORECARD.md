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
