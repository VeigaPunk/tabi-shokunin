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

- 2026-10-15 — **fleet round-1, freshness witness** (explicit new steer after
  training round 11; historical round numbering and records above preserved).
  Motivating evidence: `SCORECARD.md:91-100` has unique minimum freshness **3**,
  versus coverage **5** / calibration **6**; the carried clause-(c) recipe is
  `plans/round-11.plan.md:422-459`, and baseline
  `c24eaea14dfc0c4a3848742d31673db5675f9183` predates the required epoch
  **1792022400**. Actual before command:
  `git grep -h '^MATCH[[:space:]]' c24eaea14dfc0c4a3848742d31673db5675f9183 -- corpus/evidence/fleet-round-1-freshness/pins.tsv | wc -l`
  → **0**, a round-path witness absence, not an absence of historical checks.
  **One improvement:** appended the dated later-date pin witness to `SKILL.md`
  (§Errata — fleet round-1), preserving every baseline byte (`cmp -n 116663`
  against the baseline blob → **0**). Its pre-append input is
  `f4d9cf5b1aa5711948a4f86cf111b0560b39f4df76ed504cbe4559e7e4c9acfe` /
  **1458 newlines**; it is not represented as the successor file's digest.
  **Measured pins:** `corpus/evidence/fleet-round-1-freshness/pins.tsv` and
  `integration-current.json`: **34/34 MATCH**, exact identity-set equality,
  **34 unique**, **0 unexplained mismatches**, **31** lane full-blob matches +
  **3** independently persisted public-prefix matches. Universe: baseline
  **23 notes + 7 reports + 3 public plugin files + 1 pre-append SKILL**.
  Detailed actual commands and source anchors are in `planner-current.json`,
  `notes-current.json`, `reports-current.json` and `substrate-current.json`.
  Preserved receipt supersession: `c6f4445ebd03`/203 is historical;
  `79255f1e03b8`/424 was already independently persisted at this LOG's `:140`.
  No self-pinning, hidden repin, extra domain-coverage group or invented
  external Git baseline.
  **Smoke actually exercised:** owned managed Chromium against the committed
  loopback fixture on **19462**, hydration → count **0→1→2** → two delayed
  confirmations; screenshots and producing commands in `browser-current.json`.
  Tab released, owned server stopped, socket check → **111** (closed).
  `reports-current.json` separately records `sha256sum -c MANIFEST.txt` over
  exactly `w9-tabi-b91`, `tabi-b1-r3b-journey`, `w6-tabi-b61`:
  **269 + 83 + 139 = 491 OK**, all exits **0**, no checksum failures.
  **L2:** one observed native OMP `task` call with **9** required-role seats
  (`Round1Planner`, `Round1Connector`, three executors, scribe, scout, reviewer,
  critic), unchanged host role routing, no model parameters. Source:
  `baseline-current.json`; all per-seat `*-current.json` outputs are same-lane
  advisory evidence, not outside attestations or native-judge decisions.
  Seven preexisting evidence artifacts from the interrupted `Freshness*`
  attempt were preserved and explicitly labeled inherited, not claimed as
  this session's measurements or dispatch.
  **Records:** appended the corpus index receipt and the historical
  `corpus/lessons/round-1.md`'s separately labeled fleet continuation/Gate;
  no new knowledge note. Actual witness commit instant and post-commit score
  measurement are recorded in the subsequent measurement entry and SCORECARD,
  not guessed inside a self-referential commit.
  **Limits held:** no real site, signed-in profile, daemon action, external
  substrate mutation, route/configuration change, promotion or outside
  admit/reject spot-check. SHONEN history untouched; other five scalar scores
  unchanged. Nonblocking L0 question appended by lane+round+opening words
  “tabi | round-1 | Reconcile the relaunched round namespace”; integrator owns
  durability. Existing round-5 external-site approval remains unexpanded.

- 2026-10-15 — **interactive fleet round-1 reconciliation; blocked attempt,
  not a completed round.** Motivating evidence: the inherited work is
  uncommitted at baseline `c24eaea14dfc0c4a3848742d31673db5675f9183`;
  SCORECARD has freshness 3 as the unique minimum; the current operator
  requires exactly 32 distinct validated scopes and explicit host aliases.
  **Named correction to :179-183:** the inherited nine-seat `Round1*` batch
  is preserved as advisory provenance, not current-contract compliance.
  All 21 inherited evidence files were inventoried without resetting them
  (`.ufo/rounds/fleet-round-1-interactive-20261015/entry-inventory.json`).
  Native session bodies were neither read nor staged. WWKD plan saved before
  work at `.ufo/plans/fleet-round-1-interactive-20261015.md`.
  **Wave:** canonical `ufo-swarm-wave.mjs plan --route-families` and its
  `planToDispatchPayload` export both exit 0; 32 spawns / 0 resumes, 32
  distinct names/tasks, every leading Godspeed invocation preserved, rendered
  tasks equal validated tasks (`wave-validation.json`). No `task` call was
  issued. Exact blocker: reviewer→`@m_mid`, scout→`@m_fast`,
  connector→`@m_mid`; required reviewer/scout→`@m_grok`,
  connector→`@m_antigravity` with `@m_zfl` fallback. The existing
  `m_antigravity` chain is empty. No authorized project profile supplies the
  missing binding (`routing.json`); no route/configuration mutation.
  **Local evidence re-measured:** `node scripts/check-freshness.mjs --worktree`
  → `FRESHNESS_GATE verdict=clean finding=freshness_worktree matched=34 unique=34 lane=31 public=3 revision=worktree baseline=c24eaea14dfc0c4a3848742d31673db5675f9183`,
  exit 0. `--self-test` → `FRESHNESS_SELFTEST verdict=clean cases=8`,
  exit 0: isolated same-CLI clean candidate/witness, duplicate, omission,
  changed bytes, bad source pin, early instant and unavailable revision.
  This is candidate evidence; actual qualifying commit and witness-mode
  measurement are appended after committing, never predicted.
  **Smoke:** actual owned Chromium tab on the committed loopback fixture,
  port 19472; hydration, two real clicks with delayed-confirmation waits,
  count 0→1→2, two items/two confirmations. Before/after screenshots saved
  in the interactive evidence directory, final image visually inspected.
  Tab released and only the owned service stopped; socket connect returned
  111 (closed). No daemon, real site, signed-in profile or external substrate
  action. Inherited smoke/checksum output remains inherited, not this run.
  **Admission:** freshness improved locally; other five axes unchanged;
  expansion unchanged, quality improved for bounded pin evidence,
  discernment unchanged (no outside admit/reject reviewer). No scalar
  re-grade, promotion, admitted round, verified-round increment or saturation.
  **Receipt boundary:** own Sighting metadata supplies run/session/mission/
  pane identifiers but no taskKey, result/receipt path or prompt/config
  digest bindings. Never invent these or call mission completion. Integrator
  owns global binding/redispatch and shared-ledger closure. Full command
  captures and the post-commit measurement are durable lane-local evidence.

- 2026-10-15 — **same fleet round-1 attempt, gate safety correction.**
  Motivating evidence: review identified that the first gate in
  `716dc8ac8982c5b32518c052e6bf8a25f23b8ca2` dereferenced paths selected by
  mutable `publicTargets`. This could become a host-file hashing oracle,
  contrary to the shape-only rule. No real-host secret/path reproducer run.
  Corrected only the lane-owned helper: three fixed exact public identities;
  fixed descriptor/table locations; isolated-root public fixture mapping;
  symlink/non-regular rejection with `O_NOFOLLOW`. No external substrate or
  global configuration changed. Original commit and gate outputs preserved.
  Same-CLI isolated self-invocation now **12/12**, adding public-target/table
  injection and public-file/descriptor symlink refusals; expected exit/finding
  pairs persisted. `FRESHNESS_SELFTEST verdict=clean cases=12`, exit 0;
  production candidate `FRESHNESS_GATE verdict=clean finding=freshness_worktree matched=34 unique=34 lane=31 public=3 revision=worktree baseline=c24eaea14dfc0c4a3848742d31673db5675f9183 profile=production`,
  exit 0 (`gate-selftest-safe.json`, `gate-worktree-safe.json` in the
  interactive evidence directory). These supersede the old helper's shipping
  safety acceptance; the earlier eight-case result is retained as historical.
  Actual first witness instant: epoch **1792041191**,
  **2026-10-15T05:13:11Z**, 34 committed MATCH rows / 34 unique;
  `.ufo/rounds/fleet-round-1-interactive-20261015/gate-witness.json`.
  The corrected carrying commit is measured again after creation. Dispatch
  and applicable-receipt blockers remain; no round increment or saturation.

- 2026-10-15 — **post-commit measurement and handoff, same blocked fleet
  round-1 attempt.** Corrected owned work landed in
  `c5e252083ede8ee87e3b498e486f0bc238f1d516` under
  `tabi-shokunin <tabi@shokunin.local>`, epoch **1792041388** =
  **2026-10-15T05:16:28Z**. Actual committed target count 34, unique 34,
  counting command and full output in SCORECARD and
  `.ufo/rounds/fleet-round-1-interactive-20261015/gate-witness-safe.json`.
  `node scripts/check-freshness.mjs --witness c5e252083ede8ee87e3b498e486f0bc238f1d516`
  → `FRESHNESS_GATE verdict=clean finding=freshness_witness matched=34 unique=34 lane=31 public=3 revision=c5e252083ede8ee87e3b498e486f0bc238f1d516 baseline=c24eaea14dfc0c4a3848742d31673db5675f9183 profile=production`,
  exit 0. Corrected gate/descriptor hashes equal those exercised in the
  12-case self-invocation and candidate run. Local clause (c) now closes;
  dispatch/receipt admission does not. Six-axis verdicts and three trends
  stay as recorded above, no scalar or completed-round increment.
  Report: `.ufo/reports/fleet-round-1-attempt-20261015/tabi.md`;
  fresh-session handoff: `.ufo/continuation/fleet-round-1-interactive-20261015.md`
  and matching JSON. These are attempt artifacts, not a driver's successful
  round marker. No receipt was invented, no mission-complete call, no push,
  no shared-ledger/config/source mutation. Only the integrator may supply the
  missing authorized binding and redispatch; this session performs no second
  round and claims no three-blocked-round stop or saturation.
- 2026-10-15 — pstack-20261015-r01: freshness 3→4. One `/pstack:swarm` of 32
  local seats, aggregate PASS 32, no dropout. Admitted public observation of
  `https://example.com/` (GET `/` and GET `/s.js` only; DOM
  `b6f58620a0440586a3c5359b00968b6d97e9cedfb8047d6252e3ec824a48d789`, screenshot
  `d42808063001eb6699b450a66cdf5511eb2bef6353d5f17205f24dce626b91fd`). Rejected
  loopback `127.0.0.1` as a real site, and Brave as installed (s25 listed only
  `NativeMessagingHosts`). Non-author reviewer-r01 agrees. Work commit
  `f5c8f3141927ba0794ba5195d7f1a029ba6d7bd8`. Counting command in SCORECARD.md
  is 0 at baseline `7f506affa55f6fb892d3c8073c75151c998bdf2c` and 1 at that
  commit. Other axes unchanged. No consequential external action. Fan-out was
  two batches (s01–s16, then s17–s32). Report: `reports/pstack-20261015-r01.md`.
- 2026-10-15 — pstack-20261015-r02: freshness 4→5. One `/pstack:swarm` of 32
  local seats, aggregate PASS 32, no dropout. Admitted two replay receipts from
  the shipped r01 loopback driver. Both DOM hashes
  `af8d1560b0212c1afaa11355e5ef8660e2b1b166fc8c7f0eae7cc723a05857b0`. Rejected
  both as real sites because the host is `127.0.0.1`. Brave still only
  `NativeMessagingHosts` (s25). Non-author reviewer-r02 agrees. Work commit
  `6a91f68af5ac5135b6b753c947b12c72e54794ef`. Counting command is 0 at baseline
  and 2 at that commit. Other axes unchanged. No new public page. No
  consequential external action. Report: `reports/pstack-20261015-r02.md`.
- 2026-10-15 — pstack-20261015-r03: adjacency 5→6. One `/pstack:swarm` of 32
  local seats, aggregate PASS 32, no dropout. Admitted four present
  refusal-route siblings (revenger, kaidoku, kake, kagi) and a loopback CDP
  page that rendered those names at `http://127.0.0.1:18751/page.html`.
  Rejected absorbing kaidoku, and rejected the loopback host as a real site.
  Non-author reviewer-r03 agrees. Work commit
  `a19c6a90a0fb0e00729fd895c3c136ac4305f877`. Counting command is 0 at
  baseline and 4 at that commit. Other axes unchanged. No new public page.
  No consequential external action. Report: `reports/pstack-20261015-r03.md`.
- 2026-10-15 — pstack-20261015-r04: coverage 5→6. One `/pstack:swarm` of 32
  local seats, aggregate PASS 32. Seat s24 was respawned once after a short
  `wc -l` line. Admitted `corpus/knowledge/example-domain-observation.md` from
  a fresh observation of `https://example.com/` (GET only; empty h1; DOM
  `b6f58620a0440586a3c5359b00968b6d97e9cedfb8047d6252e3ec824a48d789`). Rejected
  an h1 claim and the Brave-installed claim. Non-author reviewer-r04 agrees.
  Work commit `3e3ba9e90d4bf04d5743652e72a9252f81877122`. Counting command is
  0 at baseline and 1 at that commit. Other axes unchanged. No consequential
  external action. Report: `reports/pstack-20261015-r04.md`.
- 2026-10-15 — pstack-20261015-r05: freshness 5→6. One `/pstack:swarm` of 32
  local seats, aggregate PASS 32, no dropout. Admitted one replay receipt from
  the shipped r01 loopback driver. DOM hash
  `af8d1560b0212c1afaa11355e5ef8660e2b1b166fc8c7f0eae7cc723a05857b0`, screenshot
  7592 bytes, GET only, ports closed. Rejected the loopback host `127.0.0.1`
  as a real site, and Brave as installed (s26 listed only
  `NativeMessagingHosts`). Non-author reviewer-r05 agrees. Work commit
  `2e4cba06a07ff7f50a7aee6688644217eec64128`. Counting command is 0 at baseline
  and 1 at that commit. Other axes unchanged. No new public page. No
  consequential external action. Report: `reports/pstack-20261015-r05.md`.
- 2026-10-15 — pstack-20261015-r06: operability 5→6. One `/pstack:swarm` of 32
  local seats, aggregate PASS 32, no dropout. Admitted the shipped contract
  self-test receipt (`ROUND_CONTRACT_SELFTEST verdict=clean cases=4`). Seat
  s31 replayed the r01 loopback driver. DOM hash
  `af8d1560b0212c1afaa11355e5ef8660e2b1b166fc8c7f0eae7cc723a05857b0`, screenshot
  7592 bytes, GET only, ports closed. Rejected the loopback host `127.0.0.1`
  as a real site, and Brave as installed (s26 listed only
  `NativeMessagingHosts`). Non-author reviewer-r06 agrees. Work commit
  `ef51deddbb3c649ae3931f011757e3eb9d340ad9`. Counting command is 0 at baseline
  and 1 at that commit. Other axes unchanged. No new public page. No
  consequential external action. Report: `reports/pstack-20261015-r06.md`.
- 2026-10-15 — pstack-20261015-r07: adjacency 6→7. One `/pstack:swarm` of 32
  local seats, aggregate PASS 32, no dropout. Admitted a refusal receipt that
  lists present for revenger, kaidoku, kake, and kagi without reading their
  contents. Rejected absorbing kaidoku. Seat s31 replayed the r01 loopback
  driver. DOM hash
  `af8d1560b0212c1afaa11355e5ef8660e2b1b166fc8c7f0eae7cc723a05857b0`, screenshot
  7592 bytes, GET only, ports closed. Rejected the loopback host `127.0.0.1`
  as a real site. Non-author reviewer-r07 agrees. Work commit
  `ec5ee4bd51a35fe964fe63b73ab356c27530e464`. Counting command is 0 at baseline
  and 1 at that commit. Other axes unchanged. No new public page. No
  consequential external action. Report: `reports/pstack-20261015-r07.md`.
- 2026-10-15 — pstack-20261015-r08: calibration 6→7. One `/pstack:swarm` of 32
  local seats, aggregate PASS 32, no dropout. Admitted a pin receipt: four
  loopback DOM files match
  `af8d1560b0212c1afaa11355e5ef8660e2b1b166fc8c7f0eae7cc723a05857b0`. Rejected
  equating that pin with the r04 public DOM
  `b6f58620a0440586a3c5359b00968b6d97e9cedfb8047d6252e3ec824a48d789`. Seat s31
  replayed the r01 loopback driver. Screenshot 7592 bytes, GET only, ports
  closed. Rejected the loopback host `127.0.0.1` as a real site. Non-author
  reviewer-r08 agrees. Work commit
  `472bfc33de340035be5fa001f4e6685b79be4a64`. Counting command is 0 at baseline
  and 1 at that commit. Other axes unchanged. No new public page. No
  consequential external action. Report: `reports/pstack-20261015-r08.md`.
- 2026-10-15 — pstack-20261015-r09: coverage 6→7. One `/pstack:swarm` of 32
  local seats, aggregate PASS 32, no dropout. Admitted
  `corpus/knowledge/loopback-pin-stability.md`. Four loopback DOM files match
  `af8d1560b0212c1afaa11355e5ef8660e2b1b166fc8c7f0eae7cc723a05857b0`. The
  example.com DOM hash differs. Seat s31 replayed the r01 loopback driver.
  Screenshot 7592 bytes, GET only, ports closed. Rejected the loopback host
  `127.0.0.1` as a real site, and rejected equating the public DOM with the
  loopback pin. Non-author reviewer-r09 agrees. Work commit
  `e3c5baea500090d3fd5c5fa0377eac10f2ee6fb2`. Counting command is 0 at baseline
  and 1 at that commit. Other axes unchanged. No new public page. No
  consequential external action. Report: `reports/pstack-20261015-r09.md`.
- 2026-10-15 — pstack-20261015-r10: freshness 6→7. One `/pstack:swarm` of 32
  local seats, aggregate PASS 32, no dropout. Admitted one replay receipt from
  the shipped r01 loopback driver. DOM hash
  `af8d1560b0212c1afaa11355e5ef8660e2b1b166fc8c7f0eae7cc723a05857b0`, screenshot
  7592 bytes, GET only, ports closed. Rejected the loopback host `127.0.0.1`
  as a real site, and Brave as installed (s26 listed only
  `NativeMessagingHosts`). Non-author reviewer-r10 agrees. Work commit
  `4e75a17ebbaa125777ed0d6e745fd150e9c6caf2`. Counting command is 0 at baseline
  and 1 at that commit. Operability stays 6. Other axes unchanged. No new
  public page. No consequential external action. Report:
  `reports/pstack-20261015-r10.md`.
- 2026-10-15 — user-20261015-r01: operability 6→7. One `/user:swarm` wave of 32
  members, aggregate PASS 32, no dead lane. Admitted the shipped user-swarm
  contract self-test receipt (`verdict=clean cases=4`). Seat s31 replayed the
  shipped loopback driver. DOM hash
  `af8d1560b0212c1afaa11355e5ef8660e2b1b166fc8c7f0eae7cc723a05857b0`, screenshot
  7592 bytes, GET only, ports closed. Rejected the loopback host `127.0.0.1`
  as a real site, and Brave as installed (s26 listed only
  `NativeMessagingHosts`). Non-author reviewer-user-r01 agrees. Work commit
  `95ea5f8b98ae4cf8ee651bf46709570114f50edd`. Counting command is 0 at baseline
  and 1 at that commit. Other axes stay at 7. No public page. No consequential
  external action. Report: `reports/user-20261015-r01.md`.
- 2026-10-15 — user-20261015-r02: adjacency 7→8. One `/user:swarm` wave of 32
  members, aggregate PASS 32, no dead lane. Admitted the boundary refusal
  receipt listing revenger, kaidoku, kake, and kagi as present and unabsorbed.
  Seat s31 ran the shipped public driver against `https://example.com/`. DOM
  hash `b6f58620a0440586a3c5359b00968b6d97e9cedfb8047d6252e3ec824a48d789`,
  screenshot hash `d42808063001eb6699b450a66cdf5511eb2bef6353d5f17205f24dce626b91fd`,
  GET only, ports closed. Rejected absorbing sibling lanes, and Brave as
  installed (s26 listed only `NativeMessagingHosts`). Non-author
  reviewer-user-r02 agrees. Work commit
  `59ba8da019400c1a3b14bc2c19746a457f791601`. Counting command is 0 at baseline
  and 1 at that commit. Other axes stay at 7. This round is the public
  observation. No consequential external action. Report:
  `reports/user-20261015-r02.md`.
- 2026-10-15 — user-20261015-r03: calibration 7→8. One `/user:swarm` wave of 32
  members, aggregate PASS 32, no dead lane. Admitted the pin-compare receipt:
  public DOM `b6f58620a0440586a3c5359b00968b6d97e9cedfb8047d6252e3ec824a48d789`
  is not loopback pin `af8d1560b0212c1afaa11355e5ef8660e2b1b166fc8c7f0eae7cc723a05857b0`.
  Rejected treating those hashes as equal, and Brave as installed (s26 listed
  only `NativeMessagingHosts`). Non-author reviewer-user-r03 agrees. Work
  commit `8a869af00665e8e445bc84c50492433097c55866`. Counting command is 0 at baseline and 1 at that commit.
  Other axes stay at their prior scores. No new public page. No consequential
  external action. Report: `reports/user-20261015-r03.md`.
- 2026-10-15 — user-20261015-r04: coverage 7→8. One `/user:swarm` wave of 32
  members, aggregate PASS 32, no dead lane. Admitted
  `corpus/knowledge/user-public-observation.md`, which records the r02
  example.com capture, GET only, and the public DOM hash. Rejected treating a
  loopback replay as that note, and Brave as installed (s26 listed only
  `NativeMessagingHosts`). Non-author reviewer-user-r04 agrees. Work commit
  `982e3b2d53569fe3494d5f589384ce789ea52a20`. Counting command is 0 at baseline and 1 at that commit. Other axes
  stay at their prior scores. No new public page. No consequential external
  action. Report: `reports/user-20261015-r04.md`.
- 2026-10-15 — user-20261015-r05: depth 7→8. One `/user:swarm` wave of 32
  members, aggregate PASS 32, no dead lane. Admitted the paragraph receipt:
  h1 empty, 156 paragraph bytes, title Example Domain. Rejected the claim that
  example.com has an h1, and Brave as installed (s26 listed only
  `NativeMessagingHosts`). Non-author reviewer-user-r05 agrees. Work commit
  `c6fb0d5334e3011d3b73e323aafe6fc95a6a49c7`. Counting command is 0 at baseline and 1 at that commit. Other axes
  stay at their prior scores. No new public page. No consequential external
  action. Report: `reports/user-20261015-r05.md`.
- 2026-10-15 — user-20261015-r06: freshness 7→8. One `/user:swarm` wave of 32
  members, aggregate PASS 32, no dead lane. Admitted the loopback pin replay:
  PIN_MATCH on the frozen DOM hash, png_bytes 7592, ports closed. Rejected
  treating that loopback replay as a real site, and Brave as installed (s26
  listed only `NativeMessagingHosts`). Non-author reviewer-user-r06 agrees.
  Work commit `1229098dae56c2d193c01203ff93651da2853f6e`. Counting command is 0
  at baseline and 1 at that commit. Other axes stay at their prior scores. No
  new public page. No consequential external action. Report:
  `reports/user-20261015-r06.md`.

## 2026-10-16 — protocol conformance: SCORECARD contract fields

- 2026-10-16 — operator protocol-conformance rollout per the 2026-10-16 fleet
  protocol amendment (fleet-root `84bade0`) and the `AXES.md` §SCORECARD.md
  contract; not a craft round.
- Contract fields already present as recordable sections: axes (`## Axes —
  final state` plus the pstack and `/user:swarm` continuation score tables);
  planned and retired (`## Planned / retired`, both populated).
- Added by this rollout, purely additive: `## Capabilities` (empty
  repertoire-table scaffold; no rows) and `## Saturation` (declaration owed by
  the lane on its next round).
- No axis claim was made and no score moved; no round was run.

## 2026-10-19 — kaika fleet round-1

- 2026-10-19 — **user-20261015-r07: executed, unadmitted, recorded without credit**
  (steer pre-action, fleet-ledger `.ufo/waves/kaika/steer.md:32`). One `/user:swarm`
  wave of 32 seats ran and was committed in `2676cc8` ("Admit user-20261015-r07
  evidence and gate", 2026-10-17, 37 evidence files + one `.gitignore` line) with no
  LOG, SCORECARD, report or lesson. Aggregate 32/32 PASS
  (`corpus/evidence/user-20261015-r07/aggregate.json`). Its only axis receipt,
  `operability/selftest-receipt.txt` (`USER_ROUND_CONTRACT_SELFTEST verdict=clean
  cases=4`), is byte-identical to the r01 receipt already credited operability 6→7
  (`sha256sum` of both → `77374a71…a7e65a`); its 29 hash seats still MATCH the bytes
  at `40a6de87f` (seats s26/s27/s32 carry no hash). No new capability, no reviewer,
  no spot-check → no axis move and no round credit; the scores stay at the
  user-20261015-r06 row. Recorded so the evidence group is no longer orphaned
  (lesson M6, `corpus/lessons/kaika-fleet-round-1.md`; QUALITY criterion 7).
- 2026-10-19 — **kaika fleet round-1: three claims, self-verdicts pending non-author
  verification.** Work commit `a4115fafce511b7f140ea176bcd0807ebf141fc6` (base
  `40a6de87f`). One batched L2 swarm of 11 (planner, connector, 4 executors, 2 scribes,
  scout, reviewer, critic); three executor seats stalled on the provider and were
  re-dispatched as fresh seats in one batch; a post-landing reviewer + critic pass
  followed. **C1 operability 7→8:** `scripts/check-sources.mjs`, a structural SOURCES
  census gate (exit 0/1/2, `O_NOFOLLOW`, symlink/non-regular/escape refusal, fleet E/W
  code mapping) — `SOURCES_SELFTEST verdict=clean cases=25`, receipt
  `corpus/evidence/kaika-fleet-round-1/operability/selftest-receipt.txt`; reviewer-found
  defects (dead `supersedes` regex, substring id match, `;` split) fixed with cases.
  **C2 coverage 8→9 + capability `sources-registry`:** `corpus/SOURCES.md` 27 opened rows
  (A21 B4 C2; 19 mined, 6 queued, 2 rejected with flip), 4 study paths, search log;
  three notes admitted on ground the corpus had zero hits for (`bidi`, `flak`, `ARIA`):
  `chrome-remote-debugging-profile-boundary.md` (the ≥136 refusal is compiled only into
  Google-branded builds — unbranded Chromium here does not enforce it),
  `webdriver-bidi-capability-matrix.md` (spec map, locally measured: no),
  `web-flake-retry-evidence.md` (Playwright 1.64 `--shuffle` confirmed; receipt contract);
  census receipt clean; the in-flight fleet census `validate` also read `ok`.
  **C3 calibration 8→9:** self-description drift 17→0 — 15 unmapped notes mapped
  (`corpus/README.md` reconciliation + frontier restated), r07 recorded above, the owed
  training round-11 lesson written as `corpus/lessons/training-round-11.md` (O5 closed);
  15 mistake classes mined into `corpus/lessons/kaika-fleet-round-1.md`, 7 unlearned
  classes became QUALITY criteria 6–11, 13 (12 is the contract's source-tier rule).
  Rejected: S026 fixed-sleep answer, S027 port-9222-on-everyday-profile recipe, r07 as
  credit. Mistake caught in-round: a lesson append into gate-protected
  `corpus/lessons/round-1.md` (M13) — reverted before commit; `ROUND_CONTRACT` stays
  clean. No-harm: freshness 34/34 clean; `USER_ROUND_CONTRACT` red at base and after for
  the same pre-existing `round_count` (6/10). No browser launched, no external site
  touched, no consequential action; documentation only. Counting commands and before/after
  in `SCORECARD.md` §Kaika fleet round-1; report
  `.ufo/reports/round-1/tabi.md` (fleet ledger, integrator-committed). No push.
- 2026-10-19 — **kaika fleet round-1 post-review fixes (orchestrator adjudication; no
  new claims).** (1) C1: `scripts/check-sources.mjs` validated `S###` rows file-wide —
  a valid row after `## Leads (unopened)` passed. Rows are now scoped to `## Registry`;
  an outside row fails `row_outside_registry`. Self-test 25 → **26** cases, clean;
  live registry clean (receipt `corpus/evidence/kaika-fleet-round-1/operability/selftest-receipt-post-review.txt`).
  (2) C3: the SCORECARD note-map command ran `comm` on input not sorted under the same
  locale; corrected command (with `LC_ALL=C` exported for the whole pipeline) re-run →
  15 at `40a6de87f`, 0 at `a4115fa`, no warnings (`SCORECARD.md` post-review block).
  (3) **Correction to line 491 above:** "unbranded Chromium here does not enforce it" is an
  inference from Chromium source, not an observation (no default-profile launch made);
  same correction appended to `SKILL.md` and `corpus/README.md`; `corpus/SOURCES.md` S028
  supersedes S004's `teaches`. (4) `SHONEN.md` regenerated verbatim from the canonical
  template with all four boxes `[~]`: the former `[x]` verifiers TABI-B4 and TABI-R3-4
  were lane-dispatched subagents, so not non-author. The L0 promotion question's premise
  ("4/4 with named non-author verifiers") is withdrawn. Consequence: `SHONEN.md` is
  byte-pinned by `scripts/check-round-contract.mjs` / `check-user-round-contract.mjs`,
  so `ROUND_CONTRACT` reads `history_rewritten` from this commit on — an operator-ordered
  change to protected history, routed as an L0 re-baseline question.

- 2026-10-17 — README: Devin wiki link. Operator directive (2026-10-17):
  insert the Devin wiki link into the README header of every repository
  with a generated wiki. `README.md` created (lane-header convention) with a `**Wiki:**` link to
  https://app.devin.ai/org/veigapunk/wiki/VeigaPunk/tabi-shokunin?branch=master.
  Evidence: the org's Devin wiki index lists this repo's generated wiki;
  sibling lane READMEs carry the same `**Wiki:**` header.
  Documentation-only change; no round run, no axis moved.

## 2026-10-20 — round-12 (hyaku, attempt 1)

- Declared C1 freshness: three named external source-claim families rechecked against
  located primary text, 0→3 dated review records. Declared C2 coverage: accessible
  locators / ARIA snapshots queued ground, 0→1 docs-held entry. Initial scalar
  increments in the frozen wave are withdrawn: freshness stays8, coverage stays9
  (delta0), because an entry count is not a domain-coverage fraction. Baseline is the
  kaika row admitted by `corpus/lessons/round-1-verifier-spotcheck.md`, not the older
  training-table snapshot. Counting command:
  `node .ufo/waves/round-12/measure.mjs REV`; base
  `f032f2dccc8a99632eea52edafa8220284b5c919` → source_rechecks0,
  accessible_locator_entry0 (`.ufo/waves/round-12/before.json`).
- C1 landed: `corpus/evidence/round-12/source-recheck.json`, three source-claim
  comparisons and before/after note digests; `knowledge/source-recheck-round-12.md`.
  Actual discrepancy: old profile :41 conflated same-port address retry with approval
  mode's port-zero fallback. Profile and retry notes receive dated append-only
  corrections; historical dates and bytes above the append points remain. The BiDi
  matrix is confirmed at its dated WD, not promoted to implementation support.
  Critic B3's proposed “remains unchanged” correction is rejected by the exact S011
  introduction sentence. Motivation/review: `.ufo/waves/round-12/w1/FreshnessAttack.txt`,
  `FreshProfile.txt`, `FreshBidi.txt`, `FreshRetry.txt`; lesson `round-12.md` §Gate.
- C2 landed: `knowledge/playwright-accessible-locators-and-snapshots.md` (S023/S024/S025
  reopened2026-10-20); SOURCES status queued→mined plus used-by; README maps both new
  notes and records accessible-selectors open→docs-held; SKILL distinguishes ARIA
  constraints from pixels/network, full audits and webbridge `@e`. No Playwright
  runtime capability is claimed. QUALITY14 learns the earlier outside inference/
  observation disagreement; QUALITY15 repairs the tier-definition pointer.
- Mistake witness: `.ufo/waves/round-12/w1/mistake/` is a bounded structured-record
  gate, registered in SKILL. Same claim/evidence/id, changing only modality and source
  scope: red exit1 `observation_without_runtime`; green exit0. Self-test9/9 clean;
  sources gate self-test26 clean; live gate28 rows, A22/B4/C2, mined23/queued3/rejected2.
  Source census start/end exits0. Executed outputs: `corpus/evidence/round-12/*-red.json`,
  `mistake-green.json`, `mistake-selftest.json`, `sources-selftest.json`,
  `sources-live.json`, `census-after.json`. Counting script is not a truth gate.
- One validated32-seat task wave, roles executor5/scout9/connector4/reviewer6/
  critic4/sentinel1/scribe2/revenger1. L1 holds planner; PlanningWalk is a bounded scout
  data-walk. Absolute spec.reportDir was rejected; orchestrator confirmed lane-relative
  reportDir under absolute UFO_PROJECT_ROOT is correct and fixed the addendum. Every
  task/context names the absolute lane repo. Spec, validator dispatch, registered IDs
  and assigned seat reports are committed in `.ufo/waves/round-12/w1/`.
- Inherited uncommitted lane state: none. No browser launched, profile/session/secret
  read, consequential action, upstream write, or tool install. All SHONEN marks remain
  asserted `[~]`; outside spot-check is owed to the orchestrator, not impersonated by
  the author-side swarm. Legacy SHONEN/history gate debt remains explicit: no baseline
  moves or untested production exceptions. The new required `round-12.md` also falls
  under the legacy user gate's broad round-N diff guard. Decision/evidence:
  `w1/GateDebt.txt`, `ProtectedMap.txt`, and lesson §Mistakes. Existing operator approval
  round5 and namespace round1 questions remain outside this round; no new L0 question.
- Stale-lane: this is the sole tabi mission; respawn-per-round, no other open tabi mission
  is known. Report will cite the pushed lane HEAD; final measured commit and counts
  are appended below rather than guessed in advance.
- Round-12 measurement addendum: work commit
  `0d82098e8151ac8c1f58f55716b9f6569bd1844a`. The hardened counting command ran against
  both the base and that commit, exits0: source_rechecks0→3,
  accessible_locator_entry0→1. Index measurement31notes/31mapped/no missing paths.
  Exact commands/stdout in `corpus/evidence/round-12/measurements.json`; score delta0
  recorded in SCORECARD's round-12 table. Counts measure committed work, not intentions.

## 2026-10-20 — round-13 (hyaku, attempt 1)

- Declared C1 operability: newly fixture-covered compatibility policies for the two
  legacy historical gates, 0→2 policies, not two newly clean full gates. This works
  a lowest tied axis (operability8); ordinal scores remain 8/9/8/8/9/8. Motivation:
  `corpus/lessons/round-12-verifier-spotcheck.md:199-203`. HARD_BASELINE/PSTACK_PIN
  and the historical census remain fixed. USER's inherited six-of-ten `round_count`
  is not repaired by inventing rounds or reducing the expected count.
- Declared C2 coverage/capability: documentation-held accessible-selector ground to
  one real, isolated Playwright loopback demonstration, with actual ARIA YAML, exact
  templates, runtime identities and negative controls. S023/S024 reopened this round;
  this is not an audit, pixel comparison, real-site journey or cross-browser claim.
  Runtime admission depends on the actual execution receipt, not the wave's plan.
- One validated32-seat wave: executor7/scout6/connector4/reviewer7/critic4/sentinel2/
  revenger1/scribe1; L1 holds planner and PlanningWalk is a bounded scout data-walk.
  Spec/unchanged validator taskCall/registry: `.ufo/waves/round-13/w1/`.
  Explicit `.txt` acceptance paths superseded rendered `.md` trailers; seats removed
  their own duplicate reports. No model parameter or routing change was used.
- Routed precision corrections carry no additional axis credit: collector timing in
  `knowledge/webdriver-bidi-capability-matrix.md` (BidiPrecision); gzip-transfer versus
  decoded-body counts appended to `.ufo/waves/round-12/w1/FreshRetry.txt`
  (ReceiptCorrection); default-contain location clarified in
  `knowledge/playwright-accessible-locators-and-snapshots.md` (LocatorPrecision).
  Original bytes and historical verification dates remain. Round-12 report's dossier
  pointer `:14-77` is corrected to `:14-66` in this round's report, never rewritten.
- QUALITY16 learns the outside gate-policy disagreement. AttackGate/AttackPin and
  SafetyHistory reports drove canonical seed pinning, resolvable regular-file
  evidence pointers, rejection of self-asserted promotion, census integrity and
  narrow history-aware lesson/script policies. Broader inherited USER count-shell,
  survivor-replay and historical-user-record weaknesses are disclosed separately;
  a bounded compatibility repair does not certify the entire legacy gate.
- Pointer expansion for the two abbreviated `knowledge/` paths immediately above:
  `corpus/knowledge/webdriver-bidi-capability-matrix.md` and
  `corpus/knowledge/playwright-accessible-locators-and-snapshots.md`.
- First exercised verification at code commit `1cf82b8` exposed two real defects,
  retained in `corpus/evidence/round-13/round-selftest.json` and
  `aria-execution-initial.json`: the census-deletion self-test tried to commit a
  deletion of a never-tracked file (exit2), and the equal-template browser case
  omitted `queue-contain` from its case inputs (TypeError, six tests passed).
  The gate fixture now first commits the good census before deleting it; no
  expected failure or verdict was weakened. The runtime repair supplies its
  missing template without changing matcher expectations. Initial failures
  remain evidence, not silently replaced by later success.
- Targeted rerun at `9c547dd` passed ROUND's26 fixtures plus alias control and
  USER's21 fixtures; USER production remained honest `round_count 6/10`. Browser
  tests reached seven passes, with the remaining expected-rejection check wrongly
  demanding `Expected:`/`Received:` labels. Playwright1.64's actual equal-tree diff
  uses `- Expected - N`/`+ Received + N` headers. The fixture now matches those
  exact observed diff signatures while retaining matcher-name/tree-token checks.
  Failed command/receipt remain `corpus/evidence/round-13/aria-execution-final.json`
  and `corpus/evidence/round-13/aria-second-receipt.json`; the filename does not
  upgrade that earlier failed run into final success.
- Final targeted browser execution at `06e6ada` exited0: eight ran/eight passed,
  four real expected rejections, one worker, no missing case; exact runtime
  Playwright1.64.0 / managed Chrome for Testing156.0.8078.4. Receipt:
  `corpus/evidence/round-13/aria-execution-pass.json` and `aria/receipt.json`
  beneath the same evidence directory. Fresh profiles/temp roots removed,
  contexts closed, fixture server refused connections after close.
  New knowledge `corpus/knowledge/aria-loopback-round-13.md` is sourced by
  reopened S023/S024/S025 and indexed; lesson `round-13.md` admits the bounded
  runtime ground and retains audit/pixel/real-site/cross-browser rejections.
- C1 final evidence `corpus/evidence/round-13/gates.json`: ROUND26 cases plus
  alias control and USER21 cases clean; both pinned legacy witnesses observe
  history_rewritten1→clean0. ROUND production clean10; USER remains failed
  round_count6/10. Unchanged historical census/pins, explicit script cutover,
  no automatic `[x]` authority. QUALITY16/17 capture the learned policy and
  real-runtime negative-control rules. Source self-test26 clean; source gate
  clean28; start/end census exit0; freshness --worktree clean34/34. Initial
  no-mode freshness usage2 is preserved, not called a passing invocation.
- S023/S024/S025 used-by gained only the new runtime note; immutable source
  cells/dates, tiers/statuses/cadences remain. One wave32 seats; no inherited
  uncommitted work. Tools: exact local official-npm @playwright/test/playwright/
  playwright-core1.64.0 with lock; global install failed EEXIST, no browser
  download or system upgrade. Source/precision chores add no third claim.
  Scalar deltas0; outside closure and every SHONEN `[x]` remain non-author work.
- Correction sweep over touched scripts/SKILL/README/BiDi/locator/FreshRetry/lesson
  used patterns `ROUND_GATE_HANDOFF_SHA256|collector must exist|10801|99752|14-77|No Playwright runner|runtime unmeasured`.
  Matches are preserved historical receipt/round12 statements with named
  append-only qualifications. The touched locator note gained §8 superseding
  its original runtime-unknown1 narrowly; its captured documentedContract hash
  remains the original pre-append execution input, not a claim about later bytes.
- Revision probe at evidence commit `837b33a` measured C1=2, but failed C2 closed
  with `profile.dir is missing` despite the actual eight-case passing receipt.
  Initial counting disagreement is preserved in
  `corpus/evidence/round-13/measure-initial.json`. The producer correctly records
  one fresh profile per case, not one global profile. The probe now requires
  eight unique case/profile entries and cross-checks each removal/context/process
  proof plus each worker's closed/refused server proof; it does not waive cleanup.
  No browser/gate behavior changed, so only the C2 counting target is re-executed.
- Profile-contract repair then validated eight actual cases/four rejections, but
  the counter's admission count stayed0 because it demanded a root-relative
  `corpus/knowledge/` string inside the corpus-local README. Existing rows and
  the same probe's noteMap use `knowledge/`. The final condition now uses that
  established corpus-relative convention, retaining the exact known note path;
  no README padding or admission/cleanup waiver was introduced.
- Final measurement addendum: evidence revision
  `837b33a3988ebeea7f6b4ef5c04698da88909a73`, baseline
  `75e7836b6c3090180aee2754e20a5d3cfb186e74`; command
  `node .ufo/waves/round-13/measure.mjs REV --claim C1` exits0 at both revisions,
  policies0→2. Independent `--claim C2` with the corrected counter exits0 at both,
  demonstration0→1, eight cases/four negatives and note_admitted1. Histogram
  --histogram exits0 both:28 rows, A22/B4/C2, mined23/queued3/rejected2 unchanged.
  Exact commands/stdout/exits/counter full hash in
  `corpus/evidence/round-13/measurements.json`; note-map32/32/no missing.
  Capability aria-locator-template-loopback enters SCORECARD at round13; all
  six scalar deltas0, no retired axis, saturation window restarts at13.

## 2026-10-20 — round-14 (hyaku, attempt 1)

- Trigger: independent `corpus/lessons/round-13-verifier-spotcheck.md` routed
  cleanup-summary inversion, stale descriptive Node metadata, USER witness
  precision and inherited executable-count debt. Baseline
  `bebe2efc4565bb068efd905e9ef78011bb6b4efd`; initial status clean,
  configured identity tabi-shokunin, source census exit0 (exact receipt
  `.ufo/waves/round-14/before.json`).
- Declared C1 operability: two newly non-shell historical counters0→2 with
  preserved real counting semantics and isolated refusal controls. Declared C2
  calibration: one verified qualified metadata correction0→1; no new browser
  observation, coverage/capability or scalar increase. Operability8 is tied lowest.
- One validated wave32 dispatched unchanged through a single task call;
  spec/dispatch/registry under `.ufo/waves/round-14/w1/`. Roles:
  executor4/scout7/connector4/reviewer7/critic4/sentinel2/revenger2/scribe2.
  L1 holds canonical planner; PlanningDataWalk is bounded reconnaissance.
  Every seat has absolute lane write scope and trailer resolution; no route
  configuration or model parameter changed, no sibling gate executed.
- Opened S029 own-work exact historical runtime receipt and retained worker
  fields; opened existing S023/S024 primary pages for scope limits. S029
  source/anchor/date/quote and all row transitions are in the round14 lesson.
  Registry rows are not knowledge expansion. No new knowledge note or frontier
  ground is claimed.
- QUALITY18/19 are lesson-grounded aggregate/version and non-executing-count
  criteria; SKILL and corpus index receive bounded corrections and preserve
  historical statements with explicit supersession. C2 preserves the original
  receipt/pin; it must never be called another executed browser run.
- Append-only numerical clarification: LOG round13's “USER21 cases” at prior
  :637/:655, SCORECARD round13 :554 and lesson round13 Gate mean20 fixture
  cases plus1 production-alias control=21 CLI controls. The original receipts
  remain authoritative; child witness exits differ from the top-level witness
  exit. No scratch fixture-ID stability or exact Node equality is asserted.
- All prior verifier routed items are dispositioned in the new lesson; broader
  r07 survivor replay, user-record freezing, IPv6 origin and external-validator
  pin debt remain uncredited. Protocol/non-author closure-tooling debt remains
  outside lane scope. SHONEN stays four asserted[~]; no promotion.
- C1 code landed `ed69b15`; metadata checker/sidecar landed `f942c62`.
  Main's first complete exercised sweep at `f942c62580b1af7268645414bab102e6e7dff8d6`
  passed ROUND selftest32 fixture cases plus alias, USER29 fixtures plus alias
  plus six committed-count controls and count-witness differential; both
  same-fixture shell witnesses observed old clean/marker→new score_mismatch/no
  marker. ROUND production clean10; USER production remained failed6/10.
  Both historical-policy witness commands exited0; USER now prints the exact
  committed repaired revision/digest and distinguishes nested child outcomes.
  Exact command/stdout/stderr/exits and source digests:
  `corpus/evidence/round-14/gates.json` and `executions/*.json`.
- The same sweep exposed real metadata-checker failures, retained unchanged in
  `executions/metadataSelfTest.json`, `metadataWitness.json`,
  `metadataOriginal.json` and `metadataCorrected.json`. Corrected sidecar
  failed CLEANUP-COUNT because the checker required nonexistent cleanup.workers;
  NODE-MINIMUM was marked failed despite observed26≥minimum20 true.
  No failure is counted as a desired negative control. ReceiptRepair was
  routed the actual payloads for a targeted repair; original runtime inputs,
  expected source values and initial failed receipts are not rewritten.
- Source selftest26 and live gate29 clean; freshness --worktree34/34 clean at
  the first sweep. The author-side critic also ran bounded read-only historical
  counting probes mid-flight despite the skip-verification instruction; no seat
  ran the actual gate/browser suite. Main's exercised receipts are the evidence,
  not the critic's proposed outcome table.
- Metadata failure diagnosis confirmed two checker bugs, not bad historical
  runtime evidence: evaluateNode read minimumSatisfied although deriveNode
  returns minimumMajorSatisfied; evaluateCleanup required cleanup.workers,
  a field absent from the real producer's schema. The targeted patch uses the
  correct Node property and cross-checks the four actual worker inventories.
  Original receipt/pin/sidecar/expected fixture bytes and refusal requirements
  stay fixed. Selftest output gains stable parser aliases without changing
  expected findings. Only this affected metadata target is rerun after cutover.
- Targeted metadata cutover `e570380` now exercises clean16 selftest cases,
  same-checker witness red→clean with original_unchanged=true, original-input
  exit1 only R14-ARIA-CLEANUP-LISTENING-AFTER-01, and corrected-input exit0
  accepted=true/27 findings/zero failures. Derive exited0 identical=true,
  wrote=false, sidecar digest e156b922…6745 unchanged. The complete exact
  payloads live in `corpus/evidence/round-14/aria-metadata/verification.json`
  and its executions directory; no browser was rerun.
- No-harm review caught that modifying the old runtime-pinned producer or note
  would break prior source/note digest verification. Both proposed uncommitted
  changes were removed; new correction evidence/lesson/SKILL carry the learned
  semantics instead. The outside request permits corrected semantics in new
  evidence; no future-producer-repair claim remains. The historical runner's
  raw summary defect is explicit, not silently declared fixed in old bytes.
- Final frontier census exited0 with the same tabi/ok/path output as start
  (`corpus/evidence/round-14/census-after.json`); new own-work S029 gives
  rows28→29, A22→23/B4/C2, mined23→24/queued3/rejected2. No new knowledge or
  capability; all open frontier areas remain open. Tools installed/updated:
  none. Existing round5 approval and round1 namespace questions remain open;
  no new L0 line. Stale-lane: sole tabi mission, no other open tabi mission.
- Correction sweep over touched SKILL/README/SOURCES/QUALITY/round14 lesson
  matched only explicit historical qualifications for unsupported on-change,
  withdrawn producer repair and original USER tally. Initial source cadence
  on-change was corrected to365d before admission; the registry preamble
  qualification restricts its original round1-all-rows wording to S001–S028.
  S029 used-by transitions and the withdrawn note link are recorded in lesson.
- C1 measurement at committed evidence `6be0990` returned2 (before0), and
  histogram at `4a300f6` returned29 source rows and32/32 mapped notes.
  C2's first revision probe at `4a300f6` failed closed despite passing real
  checker outcomes: it required positional selftest tokens in a different order
  from the actual producer and sought finding= in stdout although the retained
  structured before record names the actual finding. Full failed output is
  `corpus/evidence/round-14/measure-c2-initial.json`; no real test result was
  changed or rerun. MeasureClaims is repairing only this consumer grammar,
  retaining expected/actual equality and actual named rejection requirements.
  The frozen round14 lesson is not edited again.
- The C2 counting repair parses the actual ARIA key=value case tokens by name,
  checks expected/actual exit and finding equality, and accepts one unambiguous
  actual structured/listed red finding. This does not redefine checker success
  or manufacture stdout tokens. C1 parsing is unchanged; only the C2 revision
  probe is re-executed after committing the corrected consumer.
- Final C2 revision probe at `0c5567e8a2b57fc64d5526f830941e2304cd2c35`
  exited0: metadata_correction1, original_pinned1, lesson_admitted1,
  browser_executed0, qualified=true, exactMatch=false. Before atbebe2ef was0;
  C1 remains the observed0→2 at6be0990. Final measurement dossier
  `corpus/evidence/round-14/measurements.json` records every exact command,
  revision, stdout, exit and counter SHA25622b6f5e5…7cab1, with the original
  failed C2 probe retained separately. SCORECARD round14 records six unchanged
  scalars, both bounded claim verdicts and current outside-verification debt.
- Expansion unchanged, quality improved, discernment improved through prior
  outside-defect learning; no current-round independent agreement, SHONEN[x],
  promotion or new capability is claimed. Round14 is stagnation-window position1
  after round13's capability, not a restart. The report must follow lane commit
  and push; original historical producer/note/receipt/pin remain fixed.
- Final production-only check on committed input revision
  `20b72b9bdad30578ad1ef438527642c46dc79c68` was warranted by newly committed
  first-add lesson/SCORECARD/docs, not a rerun of unchanged selftests.
  ROUND remained clean10 exit0; USER remained honest round_count6/10 exit1
  (not history_rewritten); final source census exit0. Exact commands and outputs
  in `corpus/evidence/round-14/final-production.json`. No browser, selftest or
  previously passing unaffected fixture suite was rerun at this stage.

## 2026-10-20 — round-15 (hyaku, attempt 1)

- Trigger: `corpus/lessons/round-14-verifier-spotcheck.md` routes metadata
  mirror enforcement/tamper classification, counter diagnostic precision,
  Node wording and S029 traceability. Baseline
  `7054a5e1068538349b4dbb0d291c2fe8643802f2` was clean; its only change
  after round14 delivery is the non-author verifier artifact, left untouched.
- Declared C1 operability8 (lowest non-retired tie): one verified USER
  reason/applicability diagnostic contract0→1. C2 calibration9: one checked
  cleanup/qualification-mirror and authenticated-snapshot classification
  contract0→1. Counts are not expertise points; all six scalar scores stay
  fixed. No new browser execution, capability or knowledge-ground claim.
- Prior outside review now exists: round14's author-time “pending” entries
  in LOG/SCORECARD are historical; the verifier at `7054a5e` agrees on both
  admits and the scoped rejects. This dated entry supersedes a current-state
  reading of that pending wording, without rewriting any earlier entry.
- The round15 source audit found a further precision error in that outside
  review and in the initial author instructions: the launcher and
  `runtimePinStatus()` omit Node, but the frozen executed spec explicitly
  asserts `RUNTIME.nodeMajor >= PIN.node.minimumMajor` at
  `corpus/evidence/round-13/aria/aria-loopback.spec.mjs:269`, invoked in
  every case at `:924`. SKILL/README/new evidence index distinguish these
  layers. The spec and outside review remain unchanged; Main acknowledged
  that closure will verify and file a non-author erratum. This is source
  precision, not a fresh runtime observation or exact Node equality.
- S029 was reopened at `cleanup.server.perWorker[0].listeningAfter`;
  direct source provenance now enters
  `corpus/evidence/round-15/source-index.json`. Only its registry used-by
  cell gains `corpus/lessons/round-15.md`; status mined and cadence365d stay
  fixed. Source-row count remains29, A23/B4/C2 and mined24/queued3/rejected2.
- The validated build wave has64 distinct seats; L1 is canonical planner.
  Seats are author-side, not outside certification. Provider failures and
  misrooted reports remain explicit evidence rather than silently replaced
  identities. `.ufo/waves/round-15/w1/validation.json` and registry bind the
  exact one-call dispatch; execution outcomes are recorded below only after
  actually exercised.
- Named precision correction to the preceding round15 launcher wording:
  the launcher records `runtime.node`; only its `runtime.pinned` summary
  and the spec's `runtimePinStatus()` summary omit Node. The executed
  spec's minimum assertion and the retrospective checker are two layers
  over the same observation, not independent runtime signals.
- Build snapshot `72dcf031b9da24796b718517ea575f21e4f7caae` retains the
  first implementation and64-seat build wave. Wave1 completed48 and
  failed16 (all scout/connector identities except completed SourceLocators);
  an initial17-failure estimate is corrected in
  `.ufo/waves/round-15/w1/provider-failures.json`. No dead identity was
  replaced. Wave2 validated/dispatched32 distinct attacks in one unchanged
  taskCall, all completed; round total96. Registries and exact policy hashes/
  environment are retained, rather than inferring route configuration.
- Wave2 caught a real C1 code blocker: the mask-mutation needle occurred
  inside its own source literal as well as the real guard. It also caught
  wrong-reason decoys rejected independently by mismatched detail, false
  isolation labels, and C2 consumer/schema mismatches. Scoped repairs
  preserve grammars/baselines/expected10, use reason-only decoys, correct
  helper labels, bind actual metadata output fields, and tighten the
  differential to exact mirror failure sets/classification/digests. Source
  attacks of72dcf03 are not mislabeled reviews of repaired bytes; L1's
  subsequent exercised command receipts name the repaired revision.
- The metadata scope stays canonical historical input files and complete
  cleanup/qualification objects, not every sidecar field, arbitrary path
  authenticity, worker-directory set drift, read-race freedom or generic
  hostile-repository safety. Shared raw-data derivation is not an independent
  expected-value oracle; literal aggregate controls and historical fixture
  digests provide the distinct expectations.
- CountProduction's misplaced fleet report was byte-exact recovered into
  the lane (`corpus/evidence/round-15/misroot-recovery.json`), and Main owns
  fleet-original removal. SourceCuration records its own misplaced report/
  move/removal attempt. The round15 lesson mines these observed scope errors
  without pretending the reminder alone proved recurrence impossible.
- No installs/updates were performed. The later host-wide pacman pause was
  relayed to live writers and added to wave2 context. Prior external-action
  and namespace L0 questions remain open; non-author Node erratum and frozen
  closure certification remain orchestrator/protocol actions.
- Actual L1 verification at code revision
  `27dfd98bd6bbd85fe77fb028d531691ce066031a`: USER selftest exit0/
  42 aggregate records (32 fixtures, alias, six committed counts, count/
  diagnostic witnesses and reason control); metadata selftest exit0/
  36 CLI+4 helper cases. USER production remains exit1 round_count6/10.
  Exact source-bound command output is in
  `corpus/evidence/round-15/user-diagnostics.json` and
  `metadata-differential.json`; no author seat executed these gates.
- USER diagnostic witness exit0 retains actual broad-finding old/no-reason,
  repaired after_count_mismatch, missing-revision counting_command_failed
  and regressed-mask after_count_mismatch child failures. Reason-only
  decoys match without the reason and reject with it. The metadata original
  check remains semantic exit1 only LISTENING-AFTER; corrected check exit0
  and witness exit0. No historical runtime date or original byte changes.
- The real Python old/new differential exited0: nine previously unchecked
  single-field variants accepted0→refused1 with exact mirror finding sets;
  same authenticated spec alteration old failed1→new snapshot_tampered2/
  could_not_evaluate. Both untampered controls accept and all original
  digests remain unchanged. This is actual old-code execution, unlike the
  separately disclosed static legacy arm of --witness-mirrors.
- Source live gate exited0 rows29 A23/B4/C2 mined24/queued3/rejected2;
  end census exit0 matches start. Reopened S029's used-by gains only the
  final lesson; no new row/knowledge/capability. First-added lesson carries
  Gate/Mistakes, every routed disposition, actual command results and honest
  external-verifier debt. Sources, QUALITY20/21, SKILL/README qualifications
  and source-index land together; prior lessons/verifiers remain untouched.
- Committed-evidence measurement at
  `b7cf0446a31014a81b4882857c90c565ebc14210` gave C1=1 exit0 and
  histogram29 sources/32 notes/32 mapped/no missing. The C2 consumer
  actually failed exit1/count0 despite all retained gate/differential runs
  succeeding: it counted pass predicates as failures and failed to tokenize
  the underscore-prefixed ARIA_METADATA_SELFTEST and cli_cases/helpers
  fields. Raw `corpus/evidence/round-15/count-after-c2.json` stays unchanged.
- The scoped consumer-only repair filters actual finding statuses, parses
  the exact ARIA line/token grammar, and keeps field failures separate from
  acceptance summaries. No actual gate output, code, fixture expectations,
  first-added lesson or C1 truth is rewritten. Only the affected C2 revision
  counter is re-executed, not the already-passing gates/browser/selftests.
- After final docs/lesson commit, first production reads atb7cf044 gave
  ROUND exit0 clean10 and USER exit1 honest round_count6/10
  (`corpus/evidence/round-15/final-production.json`). This is committed
  history compatibility, not a rerun of unchanged fixture suites.
- Operator wrap-up arrived after both waves completed: no further worker
  was spawned; the existing active consumer writer finished. Fleet-root
  misroot glob sweep returned no files for round15/w1 or w2; exact patterns
  and output are in `corpus/evidence/round-15/wrapup-misroot.json`.
- C2 consumer-only rerun using committed probe
  `9fd8bca99d60cc1612faeeac633e1436d231bde3` over the sameb7cf044
  input exited0: enforced_contract1, nine emitted/nine differentials/nine
  refused, snapshot exit2 snapshot_tampered, canonical_correction1,
  browser_executed0, no errors. Exact receipt
  `corpus/evidence/round-15/count-after-c2-repaired.json`. C1 retains its
  actual0→1 atb7cf044; C1 parser behavior was not changed by the C2 repair.
  Final dossier and SCORECARD record both measured/probe revisions.
- Author verdicts: C1 operability improved, C2 calibration improved;
  depth/coverage/freshness/adjacency unchanged, no scalar increases.
  Expansion unchanged, quality improved, discernment improved through
  lesson-backed correction of prior outside routed precision defects.
  Independent current admit/reject agreement and promotion remain external.
  Lane pushes before the real fleet report; no new round or worker starts
  after the operator wrap-up.

## 2026-10-20 — round-16 (hyaku, attempt 1)

Baseline `e38d2599a922cb729186353830fff8e159b4fef0` (clean). Measured revision
`3254740c694e4fc7851ca9d88b39230db3042ba6`. Motivating evidence: round-15 outside
spot-check routed defects 1-3 (`corpus/lessons/round-15-verifier-spotcheck.md:120-122`) and
the frontier row "Native WebMCP in chromium 152 — unprobed (census U3)"
(`corpus/README.md:35`) on a host now running Chromium 154.0.8037.97.

- C1 operability 8 (lowest tie): `scripts/check-measurement-binding.mjs` +
  `scripts/selftest-measurement-binding.mjs` (59 cases) bind each claim's counter blob digest,
  counted inputs and measured revision, and re-run both count arms at the delivered HEAD.
  Counter `node .ufo/waves/round-16/measure.mjs REV --claim C1`: 0 at baseline → 1 at the
  measured revision (counter blob sha256 `c8b4100a…94cb`); receipts
  `corpus/evidence/round-16/measurements.json`, manifest
  `corpus/evidence/round-16/measurement-binding.json`. Real round-15 history is red:
  `binding/legacy-r15.json`.
- C2 coverage 9 + capability `webmcp-cdp-observation`: `scripts/webmcp-loopback-round16.mjs`
  receipt 11/11 on loopback fixtures (flag-off and domain-disabled controls, declarative,
  imperative, removal, navigation, issues, location, frames, permissions policy, `data:`
  divergence); note `corpus/knowledge/webmcp-chromium-loopback-round-16.md`; sources S020
  re-open, S030–S040. Counter `--claim C2`: 0 → 1 at the measured revision.
- History kept, not rewritten: pre-commit harness run 8/11 (`receipt-first-run-failed.json`);
  C2 counted 0 at `8f7feb3` with that counter blob (label-as-path defect,
  `measure/count-after-c2-first-counter-defect.json`); `8f7feb3`'s 11/11 receipt replaced at
  `3254740` after wave-2 harness repairs.
- Wave 1: 84 seats (scout 21, executor 19, reviewer 14, scribe 10, connector 8, critic 5,
  revenger 4, sentinel 2, simplifier 1); dispatch refused 4× by the 100-job cap, spawned on
  attempt 5; 6 executor seats died on the m_swe rate limit (no reports). Wave 2: 73 seats
  (reviewer 42, scout 14, critic 7, mutation-tester 4, sentinel 3, connector 2, revenger 1),
  all reported. Round total 157.
- Wave 2 falsified and L1 repaired: self-certifying C1 counter (liars counted 1 → now 0,
  `measure/c1-liar-probes.json`), 8 surviving gate mutants (selftest +16 cases), dash-path
  node-option injection, vacuous harness pid/argv/closure proofs, weak location and sandbox
  predicates, C2 counter forgeries (case→fixture map, README row, summary consistency), S039
  rejection (superseded by S040), S037 mined, README `:194/:216/:282-285` supersession.
- No-harm: ROUND_CONTRACT clean 10; USER failed 6/10 (unchanged, pre-existing); freshness
  `--worktree` clean 34/34; SOURCES gate clean rows=40; census validate exit 0.
- Author verdicts: C1 operability improved, C2 coverage improved (capability enters); no
  scalar moves. Expansion improved, quality improved, discernment improved (QUALITY 22–25
  lesson-backed). Outside admit/reject remains external; SHONEN four `[~]`.
- Tools installed/updated: none by L1; wave-2 seat AttackC1Before ran `npx -y node@22`
  (Node 22.23.3, npx cache) for a cross-version probe; wave-1 seat RevCountCmds installed
  Node 22.23.3 and 20.20.2 via fnm for version testing.

## Round 17 — hyaku, 2026-10-20 (lane-tip gates, WebMCP invocation, adjacency map)

- Motivation: routed jj evidence (fleet `.ufo/waves/hyaku/jj-w1/reports/JjAuditTabi.md`,
  `JjTrialTabi.md`): gates read jj-owned git `HEAD`, four `code_revision` fields printed it, and
  `check-freshness --witness` accepts literal `HEAD`. Round-16 outside spot-check routed defects
  1–5 and the integrator CDP ruling (`corpus/lessons/round-16-verifier-spotcheck.md:138-157`).
- C1 operability: `laneTip` in `scripts/check-round-contract.mjs`,
  `scripts/check-user-round-contract.mjs` (identity pair rotated), `scripts/check-measurement-binding.mjs`
  (+ selftest 59→76); counter `measure-c1.mjs` 0 → 4 (5859243 → 93bfead). `check-freshness.mjs`
  left byte-frozen (why-not + invocation rule in SKILL round 17). Commits `6c97851`, `93bfead`.
- C2 coverage + capability `webmcp-cdp-invocation`: harness `scripts/webmcp-invoke-round17.mjs`,
  receipt 11/11 + 4 controls, note `corpus/knowledge/webmcp-invocation-round-17.md`, sources
  S041–S048 (+ S054 correction); counter 0 → 1.
- C3 adjacency: `corpus/adjacency.tsv` (10 rows) + `scripts/check-adjacency.mjs`; fleet L0 questions
  `ebeb396` (line 62, musketeer lease) and `b6b3b5e` (line 65, ruling reach to revenger/kama);
  counter 0 → 10. `PROVINCE.md` untouched (census-frozen).
- Routed: liar probe rooted (`corpus/evidence/round-17/routed/liar/`), hardened receipts and the
  `1205d26` delivered-HEAD receipt (`routed/binding-hardened/`), census U3 and r16 note `:135`
  README index rows, ruling recorded in the map.
- Wave 2 falsified and L1 repaired: C2 counter certified 12 forged receipts (now 0 of 23),
  C3 checker/counter 4 survivors (pin dedupe, ASCII surface, l0 file as ruled venue, lane-name
  dependence) and a false kasegi `refused-route` row (dropped), C1 counter missed a `..HEAD` range
  mutant (now drops to 2), note cells contradicted by the receipt (corrected), source rows
  S047/S049/S050/S053 superseded by S054–S057.
- No-harm (sandbox at M and lane): ROUND_CONTRACT clean 10; USER failed `round_count` 6/10
  (unchanged); freshness `--worktree` clean 34; SOURCES gate clean rows=57; all 20 harm-baseline
  entries same exits (`w2/HarmAfter.md`); census validate exit 0.
- Author verdicts: C1 operability improved, C2 coverage improved (capability enters), C3 adjacency
  improved; no scalar moves. Expansion improved, quality improved, discernment unchanged
  (author-side only; outside check pending).
- The L1 session was resumed once after an Anthropic 429 (same identity); three wave-1 seats were
  revived by message. Wave-2 m_zfl seats died on zai 429 retry exhaustion (listed in the report).
- Tools installed/updated: none by L1; wave-2 seat RevNoteVsReceipt installed acorn 8.19.0 with
  npm into its /tmp sandbox only (predicate hashing).

## Round 18 — hyaku, 2026-10-20 (early rechecks, guarded execution, routed corrections)

- Motivation: round-17 outside check routed five defects (`corpus/lessons/round-17-verifier-spotcheck.md:157-165`);
  harness hazards were observed in `.ufo/waves/round-17/w2/SentinelHarnessAfter.md`.
- Claims: C1 freshness8, source recheck receipts; C2 operability8, six finite execution hazards;
  C3 calibration9, five routed record corrections. No scalar move or exploratory claim.
  Both freshness and operability work a lowest non-retired tie; no stagnation waiver.
- Source sweep: 51 current-at-baseline rows reopened, own-work/pinned/live classes kept distinct;
  no row date-due. `corpus/evidence/round-18/source-recheck/`, source note, `measure-c1.mjs`.
- New official sources S059–S064 ground `corpus/knowledge/harness-hardening-round-18.md`;
  S058 corrects the S057 anchor without rewriting historical rows. All new Gate quotes are
  in `corpus/lessons/round-18.md`. SOURCES status/recheck/used-by cells of old rows unchanged.
- New successor `scripts/webmcp-invoke-round18.mjs` preserves the round-17 producer bytes;
  `scripts/freshness-witness.mjs` guards its own invocation, not direct calls to the frozen CLI.
- Routed evidence: full 20-gate historical run at 93bfead; committed 57-case adjacency receipt;
  seven newly executed retained r17 harness receipts; sibling-count correction (six);
  `corpus/evidence/round-18/routed/`, `measure-c3.mjs`, lesson Corrections.
- QUALITY33–38 arise from the lesson's mistake rows. README indexes corrections/new notes.
  Depth8 deliberately deferred: next viable move is substrate re-verification of the r3/r8/r9
  evidence ladder; repeated lowest-axis ties are not a claim that depth is saturated.
- Wave1 dispatched70 (registry `.ufo/waves/round-18/w1/swarm-registry.json`); L1 holds planner.
  Code writers used disjoint files but not separate writer worktrees: recorded conformance miss.
  Final measured revisions, falsification results and no-harm comparison follow in this same round.

- Final round18 outcome: C1 freshness0→51, C2 operability0→6, C3 calibration0→5, scalars unchanged.
  Evidence checkpoint `01531daf3fa784410db454e4d606488e467a039a`, binding reproduction exit0
  claims3/bound3. Direct code measurements at `c0aff2364b49b21c41669f050e03800138589fa7` are retained
  under `corpus/evidence/round-18/measurements.json`; exact-checkpoint binding/harm evidence is
  `.ufo/waves/round-18/final/`. Full23-gate comparison:23 equal,22 clean plus inherited USER6/10 red.
- Wave2:80 seats; total150; all70+80 scoped reports present. One all80 job-cap refusal spawned
  none, unchanged payload succeeded after180s; no dead workers replaced. Final repair owners used
  private clones. Role mixes and the wave1 writer-isolation miss are explicit in the lesson/report.
- C1 now retains actual compressed responses and recomputes byte/decode/excerpt integrity; final
  source verdicts41 held/9 drift-superseded/1 own-work. SOURCES57→76 (+18A/+1C; no old cells edited).
  S065–S076 and README/knowledge/SKILL correction entries prevent false old assertions standing
  as current guidance. Depth remains a deliberate deferred priority, not saturation.
- QUALITY39 adds retained-body binding after the zero-digest survivor. Self-test receipts for
  all new self-test claims are committed under corpus/evidence (38/26/38/8 cases).
- Tool installs: SimplifyTools used acorn8.19.0, acorn-walk8.3.5, eslint9.39.5 from official npm
  into its private /tmp/r18-ast for AST/unused-binding analysis. No host/global/pacman install.
- Author trends: expansion unchanged; quality improved; discernment improved by lesson-backed
  resolution of the previous outside disagreements. Current non-author closure/promotion is not
  claimed. Open tabi round17 L0 questions (musketeer lease, revenger/kama ruling reach) unchanged.

## Round 19 — hyaku, 2026-10-21 (steered round 19, attempt 1)

- Baseline `66251bfc1aef393e4aec599e950a8deb867736bb`. L1 TabiR19-2 holds the planner seat. Claims:
  C1 depth (8, lowest tie) runtime-verified declarative-WebMCP validation decisions from the predeclared
  manifest `corpus/evidence/round-19/validation/decisions.json` (27 decisions, 66 cases); C2 operability
  (8, lowest tie) download-evidence binding properties in the invoke successor (artifact-root scan + per-run
  nonce); C3 calibration (9) four non-code routed defects from the round-18 spot-check. Motivation:
  `SKILL.md:1994-1997` left declarative validation source-only; spot-check routed 1–4.
- Round-19 correction of LOG.md:1059: "QUALITY33–38 arise from the lesson's mistake rows" is superseded —
  the round-18 additions are QUALITY 33–39 (seven criteria, `corpus/QUALITY.md:140-165`); re-derived by
  `awk '/^[0-9]+\. /{n=$1+0} n>=33&&n<=39&&/round-18\.md/{s[n]=1} END{print length(s)}' corpus/QUALITY.md`
  → 7 at the baseline. The old entry is retained unchanged.
- Wave 1: 72 seats (scout19/executor26/scribe8/reviewer7/connector6/critic3/revenger2/sentinel1), one
  validated payload; three job-cap refusals spawned none, the unchanged payload spawned all 72 on attempt 4.
  Production writers worked in clones under `/fast/scratch/tabi-r19/<seat>` (ledger
  `.ufo/waves/round-19/isolation/ledger.json`, checker clean 23 entries). Four executors refused to commit;
  the L1 committed their clone files on their branches, labelled as such.
- Integration: 66/66 cases pass on Chromium 154.0.8037.97/Playwright 1.64.0/Node 24.21.0 after (a) the
  harness field reader keyed unnamed controls as "" and excluded buttons, (b) checkbox expectations were
  re-encoded from checked booleans to the harness's FormData-like values (seat original retained), (c) two
  in-family control cases were added. First run 55/64 (`validation/integration/`).
- Sources S077–S093 opened 2026-10-21 (6 mined, 11 queued); S077 supersedes S071's single anchor. Knowledge
  `corpus/knowledge/webmcp-declarative-validation-round-19.md`. QUALITY 40–46 from round-19 mistakes.
- H1/F6 (spot-check routed 3): the round-18 harness already exits 2 with no receipt and no surviving browser on
  SIGINT/SIGHUP (`w1/ProbeR18Signals.json`), and the witness refuses HEAD/@/master/short/off-branch with
  `witness_revision_refused` plus a shape-specific detail (`w1/ProbeR18Witness.json`); the round-19 C2 counter
  now covers each shape as informational coverage, not claim credit. H4: the round-18 scan looks for marker
  bytes, not the suggested filename as the spot-check wrote (`w1/ProbeR18Download.md`); both the replayed
  record and a planted GUID artifact still pass the round-18 predicate (`c2-mutants/`).

- Round-19 correction (machine-checkable single line): LOG.md:1059 "QUALITY33–38" is superseded by QUALITY 33–39 (seven criteria, 33/34/35/36/37/38/39; awk command above re-derives 7).

### Round-19 continuation integration — same held claim, writer TabiR19

- Inherited committed checkpoint d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47 and untracked wave-2 metadata;
  no different round was claimed. Wave 2 dispatched the validator's unchanged 72-seat taskCall once.
  Role/seat counts and dead-seat errors: `.ufo/waves/round-19/w2/outcome.json`; 70 reports, two provider
  deaths retained (MutateC1 weekly quota, SentinelInvoke cyber_policy), no dead seat replaced.
- C1 source/prose corrections supersede the premature “27 admitted” reading, boolean-only checkbox rule,
  generic hidden-control rule, disabled-option serialization, numeric-string formatting and source-only
  explanations overstated as runtime proof. Exact finite cases now bind the corrected SKILL table and
  manifest; note/index errata and SOURCES S095–S099 retain the source corrections. S087 queued→mined
  and used-by —→the validation note; lesson Gate records each source opening and transition.
- Fresh C1 integrity repair from RuntimeNumberType clone c481684f6de4b48de2321af35db2f49087178606:
  fields/schema/command-error expectations, within-receipt tool/input/id/response consistency, stable
  fresh/committed comparison and canonical Condition/Answer binding. Dead MutateC1 is not relabelled as
  performed; finite self-tests and the existing reviewer findings cover named shapes only.
- Validation guard repair from RuntimeUnknownParam clone 2dbdc54733cdb0faa79525884313b38c09046402:
  exact effective feature/resolver checks, fail-closed WebSocket setup and executable identity,
  before/after two-root artifact snapshots and retained launch/cleanup proofs. Trusted immutable input
  trees/output ancestors remain REQUIRED; same-uid pathname races and all-page download capture are not
  claimed closed. Registry's unsupported --fixtures recipe is superseded by native --cases/--out.
- C2 fixes the ordinary-profile-file false positive by root purpose, not a metadata.json allowlist
  (RuntimeRange clone 7fbf398307045f28e4b599c49678b59982e357d0). Its counter additionally correlates raw
  invoke/reply/events, fixture and page record within each receipt (RuntimeNonScalar clone
  7b2a7f4c40ac894b4d93fb3a5e1e12b810115074), after w2/MutateC2's nonce-aware no-invoke survivor.
  Coordinated fabrication of all raw evidence remains untested; no “tamper-proof” claim.
- C3 now checks the seven-criteria correction's declared cardinality and refuses reconstructed
  wave-return status. **Original target four closures remains unprovable:** d4's direct wave-1 return
  snapshot never existed, and 16 source-evidence writers were not inventoried by the 23-entry clone ledger.
  Four same-identity implementation follow-ups used distinct clones/branches and disjoint production paths;
  imports are explicit in w2/outcome.json. This cannot retroactively repair wave-1 provenance.
- No-harm limitation: w2/CriticNoHarm extracted the frozen USER lesson-history predicate and found
  refused lessons grow from round18 alone at B to round18+round19 in inherited d5cf4d7 ancestry. No content
  revert can erase that historical event. Frozen scripts/history are not weakened or rewritten, and equal
  gate exits are not reported as sufficient no-harm evidence. Admission stays withheld.
- QUALITY47–49 and the lesson's continuation mistake table capture these findings. All original round-18
  evidence and byte-frozen B-era scripts/notes stay unchanged. Tool installs/updates: none in this
  continuation; wave reports name none. No sibling or domain-source tree was edited or pushed.

### Round-19 measured results — no admission by proxy

- Main L1 ran the integrated self-tests once at `bf466e317bc4dd08192b1dd390b253b4bb0bee8d` in a faithful
  private sandbox: C1 39/39, C2 40/40, C3 26/26, isolation7/7, exits0. Full commands/streams/producers:
  `.ufo/waves/round-19/final/selftest-runs.json`; canonical self-test receipts under corpus/evidence.
- New producer validation at that checkpoint: exit0, cases66/passed66/failed0/findings0, all contexts
  retain argv, executable/guard/artifact/cleanup proofs. Exact execution:
  `.ufo/waves/round-19/final/validation-run.json`; canonical receipt was landed at
  `f5032f34e3d39da636708199b0f22a838325bbdc`. `corpus/evidence/round-19/history.json` labels the
  earlier producer receipt and count files historical rather than silently recertifying them.
- At f5032f34e3d39da636708199b0f22a838325bbdc, the three counter commands
  `node .ufo/waves/round-19/measure-c{1,2,3}.mjs REV` were each executed on B and the measured checkpoint:
  C1 0→27, C2 0→2, C3 0→3; every evaluation exit0. Actual individual argv and full output are in
  `corpus/evidence/round-19/measurements/final.json`. C3 d4 reason is the missing direct snapshot,
  not a clean closure. Original target4 remains unprovable, not silently reduced.
- The unchanged no-invoke mutant `92b5742186d6e94e381e282739e2cbc33f028d21`, formerly credited2, was
  evaluated with the repaired C2 counter: count0, raw invokes0/responses0, invocationObserved=false and
  responseObserved=false (`.ufo/waves/round-19/final/noinvoke-mutant-after.json`). All-raw-evidence
  coordinated fabrication remains untested; a real-browser process alone is not invocation proof.
- Serial inherited no-harm comparison at f5032f34e3d39da636708199b0f22a838325bbdc:23/23 exits equal B,
 22 clean plus inherited USER1; sandbox clean before/after (`final/harm-at-measured.json` under round19).
  The known lesson-history refusal expansion1→2 and missing d4 observation remain explicit; this is
  a trade/limit, not an admitted “no axis harmed” round.
- `node scripts/check-sources.mjs` at the measured checkpoint → rows99, A86/B4/C9,
  queued19/mined71/rejected9, findings0 (retained in the no-harm receipt). Start rows76; new rows23:
 22A/1C, with five supersession rows S095–S099 and no independent-publisher/diversity credit.
  Fleet `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` end exit0,
 15 W04 duplicate-scope warnings; exact before replay/end outputs are in `final/census-*.json`.

### Round-19 L0 resolution — inherited conformance debt, not axis harm

Main ruled the frozen USER refusal growth1→2 an inherited process violation to DOCUMENT, with axes
unaffected; keep lesson files append-only, history/gate unchanged, and refusal at two. The fleet question
is resolved-by-ruling, retained verbatim in `.ufo/waves/round-19/final/l0-ruling.txt`. This supersedes
the preceding compatibility-as-axis-harm/quality-harmed reading; it does not change the observed exits or
erase provenance. Progression proceeds on repaired claims by orchestrator authorization. C3 d4 remains
unprovable for missing historical return-time snapshot; only d1–d3 are measured closed.

## Round 20 — hyaku, 2026-10-21 (fresh held round 20, attempt 1)

- Declared C1 depth: turn already source-held but scattered declarative lifecycle
  facts into a source-scoped troubleshooting sample; target0→12 documented rows,
  not12 novel predicates, runtime cases or a scalar promotion. Motivation:
  `corpus/README.md:407-410`, round19's source-only frontier, and
  `.ufo/waves/round-20/w1/{CriticCount,AttackLC05,AttackLC12}.md`.
- Built with64 validated seats, L1 planner held; exact dispatch/registry and
  source/semantic disagreements are in `.ufo/waves/round-20/w1/`.
  Four production writers used isolated clones; committed donor branches survive
  in `writer-bundles/` with the full path/base/identity/diff ledger in
  `.ufo/waves/round-20/isolation-ledger.json`.
- Captured actual full-wave return at `.ufo/waves/round-20/w1/return.json`
  before the first import; tracked diff empty. This is current-round evidence,
  not a reconstruction or repair of round19's missing d4 observation.
- Retained newly fetched raw/base64 and decoded source identities in
  `.ufo/waves/round-20/source-opening.json`; S100 extends S096's anchor for
  LC11 using the same bytes. S096 only gains a mutable used-by backlink;
  old→new audit will land in the final one-write round20 lesson.
- Landed knowledge/table, finite counter and independent fixture expectations,
  wave metadata guard, curation/history probes, new index row and lesson-backed
  QUALITY50. Main integration corrected the note heading and manifest shape,
  LC05 callsite-only outcome, LC09 ToLocal-failure wording, and LC12 code quote.
  Donor originals remain in the bundles; no original expectation is silently erased.
- Rejected integration suggestions to edit immutable source anchors, treat
  source rows as independent corroboration, infer universal human gating or
  navigation success, or count all source dossiers as new frontier coverage.
  Historical lesson/gate bytes remain untouched. Verification and final counts
  are recorded in the later round20 log entry, not asserted here.

### Round-20 falsification return — frozen before repair imports

The fresh64-seat w2 task returns have been received. Before importing any repair
payload, L1 captured `.ufo/waves/round-20/w2/return.json` with command argv,
status/output hashes, the lane tip, report hashes and selected immutable donor heads.
The snapshot and reports are frozen in a separate commit before payload integration.
This is author-side observation, not global actor quiescence or outside certification.

Correction to the earlier round20 full-wave wording: the raw w1 `all64Settled`
and `allSettledBeforeImport` flags are withdrawn as all-actor claims. Peer messages
revived report-only CriticIsolation activity after capture; task-return barriers
are not actor-quiescence barriers. The timestamped before-import capture and donor
identities remain observations, but no complete-isolation certification is credited.
See `.ufo/waves/round-20/w1/ordering-correction.json` and
`.ufo/waves/round-20/w2/ReviewReturnBoundary.md`. Round19 d4 stays unprovable.

### Round-20 source/counter repairs after the frozen return

- Imported exact committed blobs only after pushed freeze
  `e0b5d02a6aef76b0d2799d92618f79f1bca40062`; the three repair writers used
  distinct new clones at4ae9981, with identities, path subsets, blob hashes and
  durable bundles in `.ufo/waves/round-20/repair-ledger.json`. These were
  same-identity follow-ups, not w2 production seats or replacements.
- W2 found the original fixed-oracle disagreement, unexercised finding ids,
  malformed LC-row and anchor-clause gaps. Reconciled expectations against the
  existing whole-note citation rule rather than inventing new backlink semantics;
  added the missing fixtures and corrected-heading cases. Sources:
  `.ufo/waves/round-20/w2/CounterS100Authority.md`, `CounterMissingId.md`,
  `CounterHeading.md`; handoffs and original donor bytes remain retained.
- Appended, never rewrote, the note and SKILL semantic corrections. Current rows
  distinguish callsites from effects, entry guards from callback-time state,
  method calls from stored-callback delivery, and fixed text from rejection reasons.
  The current manifest and scope literal match the corrected-source heading.
  S100/S096 source ids and pinned spans remain unchanged.
- The wave-1 guard now has regular-input refusals and a frozen-input mode that
  verifies every digest before comparing a persisted expected verdict. It does
  not certify actor settlement, membership, ordering or isolation.
- Corrected raw/gzip metadata labels, appended a corpus correction index and
  QUALITY51, and retained declared/build/final design identities. The four-file
  measurement input set is derived from code, not the earlier guessed two-file set.
- W2 ReviewBindingInputs ran an unsolicited r19 binding replay despite the
  read-only/no-gate bounds. Its report records exact argv/exit/producer and no
  runtime/browser execution or writes. This is a conformance defect, not L1
  serial verification or re-adjudication of the closed round19.

### Round-20 residual review and serial verification checkpoint

The allowed ordinary residual batch had8 seats (reviewer6/critic1/connector1),
not a padded third swarm. Its reports are under `.ufo/waves/round-20/residual/`.
The four semantic slices judged current LC01–LC12 ENTAILED; the fixed-oracle
review found the current45 pairs statically consistent and the frozen-input
review found the27 metadata fixtures consistent. These are inspections, not test passes.

ResidualParser caught a real blocking code defect: the anchor refactor had
removed SEPARATOR_ROW while parseRegistry still used it. Restored the exact
separator declaration without re-running the broken revision to confirm the error.
No exception suppression or new fallback was added. The post-fix revision must
be measured afresh; no stale w2 counter hash or binding values are reused.

The serial runner now includes the actual frozen w1 triple, both revision-bound
C1 arms with required count/verdict checks, corpus counts and full artifact
identities as well as the historical-clean cohort and both new selftests.
The inherited red USER production gate is explicitly skipped, not rerun to
confirm a known error; the final lesson-history probe must show no new refusal.
The integration text file is explicitly labelled historical, not an active caller.
Final lesson, measurement binding, results and one-write audit land after this run.

Pre-verification static census, exit0: C1 cases45/reasons24, wave cases27,
QUALITY rules51, wave seats64+64 and residual8. The exact Node argv and stdout
are retained in `.ufo/waves/round-20/counted-pre-verification.json`; this is a
count of committed-next artifacts, not a passing test claim.

### Round-20 executed results and final one-write lesson

Main executed `.ufo/waves/round-20/run-checks.py` at pushed
`e45b05280ac0255670a7d5206c9a00586d48f7f5`:28/28 expected outcomes.
The full receipt at `.ufo/waves/round-20/final/serial-checks.json` retains every
argv/exit/stdout/stderr and producer/input identity. New CLI selftests are
45 cases/24 findings vocabulary and27 metadata cases, both clean; the actual
frozen w1 triple is frozen_match/pinnedExit0. All22 historical-clean invocations
remain0. The inherited USER production failure is explicitly skipped.

C1 before/after:0→12 with both exit0, baseline/clean respectively, not a
count credited alongside findings. Command and exact streams are in
`corpus/evidence/round-20/measurements.json`; counter SHA-256
`19921191fad84ba79414188e1a7b1bc05acdb491b1e6052ed5b70454864f7945`.
Four-file binding and measured-revision reproduce both clean, claims1/bound1;
the final report records delivered-tip reproduction rather than a drift inference.

Sources census start/end0. Registry99→100 (one tierA same-body S100, no diversity
credit), knowledge37→38 on held source ground. Exact counting commands/outputs
are in `counts-before.json`, serial-checks curation-counts and census JSONs.
The final `corpus/lessons/round-20.md` is written once with Gate, exact new-row
quote/digests, S096 old→new used-by audit, retained rejects, Mistakes and bounds.

Misroot sweep found only own ResidualFrozen at the fleet wave path: lane target
was absent; cp+cmp exited0 and only that own fleet copy was removed. The retained
report and `.ufo/waves/round-20/final/misroot-recovery.json` record it. Fleet
runtime/state and foreign files were untouched. No tool was installed or updated.
The old r17 lease/ruling questions remain open; no new r20 L0 question is needed.

Post-lesson verification at `e41ae33c238540a469e4a031fad3ad00ef112616`:
the history probe enumerated exactly the two inherited refused lessons
round18/round19, with round20 initial-addition only and no later MDRT commit.
Receipt: `.ufo/waves/round-20/final/lesson-history.json`. This is the lesson
predicate only, not a claimed clean USER gate.
Binding reproduce at that tip exits0, claims1/bound1; counted-input/counter
drift from the measured revision is empty. Exact receipts:
`final/binding-after-lesson.json` and `final/count-input-drift.json` under
`.ufo/waves/round-20/`. Delivered-tip reproduction is recorded in the fleet report.
