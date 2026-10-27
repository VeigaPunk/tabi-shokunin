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
