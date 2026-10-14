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
