# tabi-shokunin — Iteration Log

- 2026-10-14 — round 0: minted as shonen (operator directive; see MINT.md).
  Probation: >=3 verified rounds before any roster row.
- 2026-10-14 — round 1: corpus built from measured surfaces by probation
  lanes TABI-1/2/3; recorded by TABI-SCRIBE (secondary lane, probation
  wave 1). Admitted: `corpus/knowledge/webbridge-plugin-anatomy.md`,
  `browser-surface-census.md`, `cdp-evidence-patterns.md` (539 lines —
  `wc -l corpus/knowledge/*.md`) + `SKILL.md` distillation (+114/−2 vs
  `ff81c0f`: interaction-evidence decision table, 9-item record envelope,
  session-material shape-only rules, rights/rate boundary — every rule
  cited, `grep -c 'corpus/knowledge/' SKILL.md` → 24). Coverage rows landed
  in `corpus/README.md`; axes pinned with counting commands in
  `SCORECARD.md`. Scribe verification — re-run commands, all held:
  sha256 first-12 `49f0735b0594`/`9e4d69dcd658`/`034b1e53b004` match the
  `SKILL.md:23-27` pins; anchor spot-checks anatomy §8.1–8.4,
  cdp-evidence-patterns:36/:105/:84-85, census:54; outside spot-check
  (non-author) agrees with the gate on 1 admit (manifest↔skill `1.11.3`)
  and 1 reject (Brave = NMH shell only). Trend verdicts: expansion
  improved, quality unchanged (first-admission round), discernment
  improved. Known debt (falsifiable next): `corpus/lessons/` still empty —
  the round-1 gate record per `LEARNING.md:61-62` is not yet landed;
  `/tmp/tabi3-cdp/` evidence bytes not yet archived
  (`cdp-evidence-patterns.md:92`); round-1 work uncommitted at write time
  (`git status --short` → `M SKILL.md`, `?? corpus/knowledge/`) — the
  integration commit is owed. This entry plus the coverage rows discharge
  the housekeeping the TABI-3 note reserved for the integrating round
  (`cdp-evidence-patterns.md:1`).
- 2026-10-14 — round 2: corpus extended by the wave-2 seats and recorded by
  TABI-SCRIBE (secondary lane, integrating round; plan
  `plans/round-2.plan.md`). Admitted: `corpus/knowledge/live-dynamic-capture.md`
  (TABI-R2-1, 220 lines — loopback `http.server` fixture with JS hydration +
  click mutation captured before/after through CDP, twice with byte-identical
  sha-pinned methodology; determinism boundary measured on both sides) and
  `corpus/knowledge/webbridge-daemon-disposition.md` (TABI-R2-2, 236 lines —
  doc-authorized daemon start executed, pid 3934817 on `127.0.0.1:10086`;
  stop/restart/uninstall agent-forbidden → daemon left running as a recorded
  state change, operator stop owed per D2; `/status` probed iff-conditioned,
  8 fields vs the 5 documented, `extension_connected:false` — no session
  material ever present). TABI-R2-3 appended round-2 errata to all three
  round-1 notes (pure appends — byte-prefix proof in `/tmp/tabi-r2-3-verify/`;
  the pre-append hashes equal the round-1 pins, which the scribe re-derived
  from `7961735`): census `operations.md` cite corrected off-by-4, cdp
  `url`-normalization rule corrected, cdp launch-window sighting downgraded
  to non-replayable, daemon live-state supersessions + the start-authority
  tension pointer. SKILL.md distillation (+105): page-claim evidence ladder
  (3 rungs), determinism boundaries, approval-discipline table; round-1 pin
  block refreshed to the post-append hashes. Scribe verification — re-run
  commands, all held: methodology shas `21e27aa6…1c99`/`d37d36dd`/`8105bed0`/
  `e558bd54` (61/209/85/47 lines); run1↔run2 det-before `c08947dc…802dc1` and
  det-after `7488d544…4b42c7` byte-identical (`compare.tsv`); ports
  19411/19412 closed, no chromium/http.server survivors; daemon `ss -ltnp` →
  pid 3934817, `/status` 8-field shape with `extension_connected:false`;
  substrate pins `84a8e69d04c5`/`b811d9c23dfd` unchanged; new-note pins
  `56224aa88430`/`9240f1d66a8c` re-matched. Spot-check (scribe, non-author
  per `LEARNING.md:37-43`): agrees with both round-2 admits; the standing
  Brave reject re-ran (`NativeMessagingHosts` only — agree); the census
  off-by-4 correction verified against `operations.md:17-22`. Trend
  verdicts: expansion improved (3→5 notes), quality improved (every round-1
  note re-verified, corrections applied via append-only errata), discernment
  improved. Axis move: depth 3→5 (evidence ladder); riders: coverage 2→3,
  freshness 2→3 (same-day re-verification — a strictly-later-date recheck
  still owed). Discipline held: no external sites, loopback only (operator
  approval absent); secrets shape-only (`identity.json`/`logs/` never read).
  Reading tension resolved into the SKILL approval table: start =
  doc-authorized self-service under the round plan; stop/restart/uninstall =
  operator-only; the anatomy text stands as-of-capture with its erratum
  pointer. Known debt (falsifiable next): four `/tmp` staging dirs
  unarchived (`tabi3-cdp`, `tabi-audit2-cdp`, `tabi-r2-1-capture`,
  `tabi-r2-3-verify`); `corpus/lessons/` still empty — round-1 and round-2
  gate records owed (`LEARNING.md:61-62`); TABI-A1's r2b audit in flight at
  record time (fresh capture harness staged 11:13, no results yet);
  TABI-R2-4 `poll.log` corroborates the landing order (daemon note visible
  10:52:07, capture note 10:54:22); daemon return-to-baseline = operator
  action (D2).
- 2026-10-14 — round 3: probation-completing round, recorded by TABI-B4
  (secondary lane, scribe; plan `plans/round-3.plan.md`). Seats: TABI-R3-1
  journey, TABI-R3-2 approval table, TABI-R3-3 SKILL integration + anchor
  re-derivation + smoke replay, TABI-R3-4 no-oral-context executor test;
  TABI-B1 r3b audit in flight at record time (scratch dir created, empty).
  Admitted (3, each with a coverage row): `corpus/knowledge/multi-step-journey.md`
  (296 lines — 4-page loopback journey index→detail→form→confirm, six
  per-step captures per run, two cold runs byte-identical + two warm;
  browser-side history witness `typed`/`link`/`form_submit`; state class via
  raw DOMSnapshot columns with the `-1` empty-value sentinel;
  wire-304-vs-client-200 boundary measured on both sides; cleanup proven per
  run), `corpus/knowledge/interaction-approval-table.md` (216 lines — every
  interaction class → autonomous-now / operator-asleep-blocked /
  operator-approval-required / never, on rights·rate·consequence with a
  gate + falsifier per class; 6 required classes + 12 adjacent gates;
  never-set held under the operator-asleep anti-claim),
  `corpus/knowledge/executor-test-sufficiency.md` (298 lines — fresh
  executor with `SKILL.md` alone ran a full loopback capture verbatim,
  verdict SUFFICIENT, gaps G1–G5 named, errata E1–E5). SKILL.md distillation
  (+512/−178): sufficiency contract, §Runbook (13 copy-paste steps), call
  reference, evidence ladder + record envelope + bounded waits,
  session-material/rights-rate rules, finalized approval table; the
  executor's errata are applied in the final revision (sha `452bc514d387`,
  576 lines; three in-round revisions — the notes version-stamp their SKILL
  refs). Scribe verification — re-run commands, all held: 8-note count +
  line totals; new-note pins `67447c028e90`/`70ce826303d0`/`1262708864db`
  and all five prior pins re-matched (also re-derived by TABI-R3-3,
  `anchors.txt`); approval counts → 6 C-rows / 12 A-rows; journey
  methodology re-hash (journey.mjs `b52074a33876`, driver.sh `9509c07f49f9`,
  compare.mjs `ecce1c73dc56` + 6 fixture files) and run1 PNG re-hash = the
  note's §2 pins; journey compare.tsv verdicts 25 IDENTICAL / 3 expected
  DIFFER; executor methodology pins re-derived, its compare.tsv 10 yes /
  3 expected NO, and its det-before `c08947dc…802dc1` equals the round-2 pin
  (cross-seat, cross-round byte agreement); TABI-R3-3 smoke reproduced the
  r2 chain a third time; ports 19411/19412/19421/19422 closed, no chromium
  survivors; daemon pid 3934817 still listening (state change persists,
  operator stop owed per D2); substrate pins `84a8e69d04c5`/`b811d9c23dfd`
  unchanged; manifest↔skill `1.11.3`. Spot-check (scribe, non-author):
  agrees with all three round-3 admits; the standing Brave reject re-ran →
  `NativeMessagingHosts` only (agree, third consecutive round). Trend
  verdicts: expansion improved (5→8 notes), quality improved (executor
  errata applied; no admitted entry false-or-stale-unmarked), discernment
  improved. Axis moves: depth 5→7 (journey evidence), calibration 4→6
  (approval table finalized); riders: coverage 3→5, operability 3→5;
  freshness stays 3 (re-checks still same-day-later). SHONEN.md: all four
  boxes marked with named verifiers (boxes 1/2/4 TABI-B4 scribe; box 3
  TABI-R3-4 executor) — promotion itself remains a later, separately
  reviewed decision. Discipline held: no external sites (loopback only,
  anti-claim `plans/round-3.plan.md:8`), secrets shape-only
  (`identity.json`/daemon logs never read), substrates read-only. Known
  debt (falsifiable next): thirteen `/tmp` evidence groups unarchived —
  fixture bytes first (executor G1); `corpus/lessons/` still empty —
  round-1/2/3 gate records owed (`LEARNING.md:61-62`); SKILL.md §Pins
  quotes the executor note as "297 lines" while `wc -l` → 298 (sha matches;
  annotation nit for the owning seat — outside this lane's write scope).
- 2026-10-14 — round 4 (training r3): network-evidence rung + async-step + hygiene sweep (webbridge daemon found OOM-dead — environment event recorded, operator return-to-baseline still owed); round-5 plan drafted (freshness move + operator-approval packet); round-4 record assembled here. Axis moved: coverage. Verifiers: AUD-TAB1 | T4-3 sweep. 32-lane wave (27+1+4 after an alibaba filter failure rerouted 4 lanes to hyper — recorded).
- 2026-10-14 — round 5 (training r4): four-clause claim: evidence archived w/ manifest-pin equality, 4 lesson files with Gates, pins re-derived later-date, approval packet filed + one l0-questions line; cold-reader test result recorded. Axis: freshness. Verifiers: VER-B5 | AUD-B5.
- 2026-10-14 — round 6 (training r5): external-class fixture v2 (loopback); webbridge revival ASSESSMENT (no revival act — operator-owned); lesson round-5 closed the four-clause claim's record; l0 still unanswered — loopback branch held. Axis: freshness + calibration. Verifiers: VER-B6 | AUD-B6.
- 2026-10-14 — round 7 (training r6): layer-routing synthesis (claim-class->layer table); the durable-harness archive completed (35 groups, 41 new files, manifest equality); SKILL census 28 groups; l0 still unanswered — loopback held. Axis: calibration + freshness. Verifiers: VER-B7 | AUD-B7.
- 2026-10-14 — round 8 (training r7): the stateful-fixture evidence (session/cookie-shaped state, multi-visit, non-idempotent steps) + an independent VER-B8-1 re-run appended (7/7 runs exact); carried-debt closure + lessons 6/7. Axis: depth. Verifiers: VER-B8-1 | AUD-B8.
- 2026-10-14 — round 9 (training r8): the state-changing matrix (10 idempotency classes, replay contract, the token-state decision table); the F1 erratum closed without touching archived bytes; lesson r8. Axis: depth. Verifiers: VER-B9 | AUD-B9.
- 2026-10-14 — round 10 (training r9): the arc synthesis (the ladder as built, the loopback-only perimeter); the r9 archive tranche; the rung-1 claim independently CONFIRMED by re-hashing archived bytes; lesson r9. Axis: calibration. Verifiers: VER-B10 | AUD-B10.
- 2026-10-14 — round 11 (training r10) — **the closeout: the chain's final round**, recorded by SCR-B11 (plan `plans/round-11.plan.md` `21317a8ad672`/716; fleet counters: `494d32a` "training wave-10 closeout: round 10 — … all lanes 9/10, one round remains"; lane round N = training r(N−1); nothing in this entry presumes a round 12). Seats (per the artifacts' own headers + scratch): B11-1 closeout/gate+measure · B11-2 check · B11-3 the final archive sweep · B11-4 §Pins/skill final append · PACK-B completion pack · VER-B11 verification (no AUD-B11 seat observed) · SCR-B11 this record.
  **Gate (the four stamps; B11-1's read 21:32:48Z, re-derived at this write):** ① status **SILENT → Branch L** — L0 byte-identical to the round-5 filing (25 lines / 21,539 B / `02c53ec6…` / mtime `14:05:52.482908587 -03`; exactly one `tabi` line `:25`, packet `94dc63f5fb9e…`); ② revival-decision disposition **carried-unasked** (no BRIDGE-NAMING line; daemon down — no listener on 10086, no process; pointers stale; browser census 0); ③ line decision **not filed**, budget `2 − 1 = 1` printed; ask-count 1; silence span at the gate read **4 h 26 m 56 s** (filing mtime `17:05:52Z` → `21:32:48Z`); ④ clause (c) **in force** — `date -u +%F` → 2026-10-14 at every read (no commit instant ≥ 2026-10-15T00:00Z; HEAD `d24b98d` = `18:28:23-03` / ct 1792013303); the round-5 four-clause claim closes **3/4**, the unblock recipe carried (dated in-repo block + commit ≥ the flip; `git show -s --format='%H %cI %ct'`).
  **Clause C (the move — freshness):** archive spot re-hash **491/491 OK** (`w9-tabi-b91` 269 + `tabi-b1-r3b-journey` 83 + `w6-tabi-b61` 139); substrate 3/3 (`e70aff5c40ff`/`84a8e69d04c5`/`b811d9c23dfd`); daemon binary `71067480bd99c2ba`; the final sweep (B11-3) archived the round-10/11 scratch tranche — **9 new groups / 52 files / 390,702 B**, tree **36 → 45 groups / 1,721 → 1,782 files / 10,318,947 → 10,720,052 B** (receipt append `archive-receipt-r10.md` §8 — `79255f1e03b8`/424 at this write; A+B re-run 52/52 OK, 0 diff lines); the r8 tranche (`/tmp/w8-tabi-b81` 5,105 files + `/tmp/w8-ver-b81` 980 files) stays **named unarchived — handed off** (§8.5). **§Pins refresh:** the block re-bound finally in `SKILL.md` §T2 (`:1349-1394`: 12 notes' final values + the r4 report held + substrate 3/3 held; 29 newly pinned files), §T3's declared supersessions held as such (`0587605db913` → `de45b805e5a4`; `e89bc89bff38` → `f04e2e473cf9`); SKILL r11 append landed (+138 → **1,458** `wc -l`, `f4d9cf5b1aa5`): §T5 closeout as-of-write + §T6 residual pointers.
  **Clause Z (the deliverable):** `corpus/knowledge/closeout-r11.md` (`2147f3ec2ff2…`/234 + its E1, B11-1) — the arc (the 4-rung ladder with its measured boundaries; the archive as infrastructure; the loopback-only perimeter as the honest boundary), the standing asks (the L0 packet; the daemon revival), the terminal debt ledger (C1–C6 closed · O1–O16 open with closing surfaces · R1–R3 retired-as-residue), admission **admitted**; independently verified by **VER-B11** (verdict in scratch at this write — `/tmp/w11-ver-b11-poll/VERDICT.md`, post-snapshot; checks re-derived PASS — citations in-bounds, §5 pin table 28/28 rows, negative sweeps re-run, F1–F3 agree; findings F-v1–F-v4 kept, incl. "the round index/axes rows live in the record seats' artifacts"). `plans/completion-evidence.md` (PACK-B) carries the completion census + the chain mapping. Lessons: `round-10.md` landed (`7cfabfc9d525`/293; one `## Gate`; admits the arc synthesis with AUD-B10's findings riding; spot-check agree); `round-11.md` **owed at this write** (named). README header + coverage rows 4–11 **owed at this write** (named; `e156bb99af2c`/59 measured).
  **Verdicts r11 (three trends):** expansion **improved** — 22 → 23 notes (the closeout) + the receipt §8 append + 9 groups archived; quality **improved** — the §Pins block re-bound finally, 491/491 + 52/52 manifest lines OK, 0-diff copy fidelity, clause (c) honestly closed 3/4 (no same-day closure claim); discernment **improved** — VER-B11's independent re-derivation agrees throughout while keeping F-v1–F-v4; B11-2's check of `round-10.md` and B11-3's A+B re-runs agree. **Axis move: freshness** — clause (c)'s final in-force state + the archive tranche + the §Pins refresh; riders: coverage (45 groups / 23 notes), calibration (the four stamps + the verifier's kept findings).
  **Discipline held:** no external site (real-site sweep → 0; loopback only); secrets shape-only (`identity.json`/daemon logs never content-read); substrates read-only; daemon untouched; the never-set held all eleven rounds.
  **Debt at this write (each with its closing surface):** clause (c) — the unblock recipe (`closeout-r11.md` O1/§6; `plans/round-11.plan.md:453-459`); the r8 tranche — archive seat (§8.5); README refresh + `round-11.md` — record seats; the packet cold-read `[unknown]` + its 9/9 stale pin block (O6/O7); the r6 L1 matrix (O10); the r9 non-author re-run (O9); the arc-synthesis errata F1–F3 (O12); the fleet watchdog roster item (reported, not absorbed — O14).
  **Commit:** the round-11 integration commit owed at write time (round-3 pattern); this entry, the SCORECARD final refresh (r4–r11 verdicts, axes, move-log placement) and the round's artifacts land together.
