# WWKD plan — tabi round 10 (final) (ufo-round-plan-v1)

Design lane: **PREP-B10** (2026-10-14, round-9 wave, 32 lanes; round-9 execution
**in flight** at design time — its first seat scratch and its first landed
artifact are recorded in the closing post-freeze block). Write scope: this file
only. Design-time state read by this lane by command across **2026-10-14T19:55–20:01Z**
(freeze stamp **20:01:14Z**); the values below are the read-time values — nothing
in them is taken from a record. Round 10 is the **final lane round** of the
training chain (fleet `MANIFEST.json` records tabi round N as "training r(N−1)";
rounds 1–8 committed, round 9 in flight): this is the last plan the lane drafts,
and nothing in it presumes a round 11.

- HEAD `6a8861c1385c900b58a69fbefa1cba16c07e1b86` ("probation round 8 (training
  r7): see LOG", 2026-10-14T16:55:09 -03); `git status --short` → **0** entries
  (clean tree) at the main read; one untracked file landed at the freeze stamp
  itself (post-freeze block).
- Operator channel: `.ufo/l0-questions.md` **25** lines / **21,539** B / sha256
  `02c53ec60acf…` / mtime `2026-10-14 14:05:52.482908587 -03`; exactly one
  `tabi` line (`:25` — the round-5 filing, packet sha `94dc63f5fb9e…`); **no
  answer, no denial, no edit**; ask-count 1; silence span at freeze (filing
  mtime → 20:01:14Z read) ≈ **2 h 55 m**. Byte-identical to the filing state
  every earlier read recorded.
- Corpus: `corpus/knowledge/` **19** notes / **6,023** lines; `corpus/evidence/`
  **35** groups / 35 `MANIFEST.txt` / 1,451 files / 9,222,920 B (`find`/`du -sb`,
  equal to `archive-receipt-r8.md` §1 and the r8 SKILL census `:1019-1024`);
  `corpus/lessons/` **7** files at the main read (`round-1..7.md`; shas
  `bdd46c85b349` / `a862d69cb0b9` / `153a1b9831bb` / `cde3960eb1a9` /
  `46029f48e27d` / `86da9d2b941942bb` / `88c8244c2babdd82`); `reports/` r4
  `5f44b0f94483` · r5 `d09f1712cbcf` · r6 `9428ddec52b9` · r7 `ea4b16a4a844` ·
  r8 `a191832be152`.
- `SKILL.md` **1057** `wc -l` / sha256 `3b79ed2dea6c…`; §Pins errata `:807`;
  round-6 pins inline `:830`; round-7 block `:930`; round-8 block `:948`; its
  carried-debt pointer table ends at the clause (c) row `:1058`; the TIME-GATED
  line `:829`.
- Round 8 (committed in `6a8861c`): LOG entry `:135`; SCORECARD move-log row
  `:87` (placement still after "## Planned / retired" `:73`); `plans/round-8-record-draft.md`
  `970c727c5787…` / 380 `wc -l` (its §0 gate table `:19-58` is a comparison base
  if the round-9 record is not findable); notes `stateful-fixture-evidence.md`
  `f04e2e473cf9…` / 855 `wc -l` — its §11 archive debt (`:728-741`) puts the
  fixture + 32 run dirs in `/tmp/w8-tabi-b81/`, every hash provisional until
  archived, and names the one revision that cannot be restored (the earlier
  runner `e22a967ed69e9f6e…`) — and `carried-debt-closure-r8.md`
  `48dc8db69c57…` / 149 `wc -l` (its §2 `:63-107`: the round-6 L1
  wire-class/cache-revalidation matrix **still open** at r8 close).
- Round-9 design (this wave's plan): `plans/round-9.plan.md` `36fd8f75ac0d…` /
  493 `wc -l`; branch table `:110-117`; Step 0 `:140`; Branch D `:188` / G `:235`
  / L `:270`; freshness rider `:328`; Measure `:348`; Seats `:377`; Bounds
  `:396`; Discipline `:427`; its post-freeze block `:437-494`.
- Packet: `corpus/handoffs/operator-approval-request.md` 121 `wc -l` / 13,103 B
  / `94dc63f5fb9e…` (byte-identical to the filing); its cold-read verdict still
  `[unknown]` (`:100`); its answer-discipline block `:104-107`; the round-10 line
  rule below is read against `§3` (`:63-66`).
- Daemon: no listener on 10086 (`ss -ltn | grep -c 10086` → 0), no process
  (`pgrep -x kimi-webbridge` → none); pointer files stale (`daemon.pid` 8 B,
  `daemon.addr` 16 B, mtime 10:46 -03 — the recorded post-shutdown pattern);
  `identity.json` (36 B, mode 600) and `logs/` **shape-only, never content-read**.
  Substrate: `skills/kimi-webbridge/references/operations.md` `b811d9c23dfd` /
  34 `wc -l` — `start` at `:11-13`, the **Do-NOT** block (`stop`/`restart`/
  `uninstall`) at `:24-26`.
- Browser side **live**: `pgrep -c chromium` → 19 (process census only). Standing
  Brave reject re-run: `ls -A ~/.config/BraveSoftware/Brave-Browser/` →
  `NativeMessagingHosts` only → agree; the consecutive count is re-derived from
  the record at the gate (r8's record asserted the **8th**; the round-9 record
  decides the 9th).
- Known record debt (design-time; named, not repaired here): `corpus/README.md`
  header `:5-9` still says "Held at round 3 … 8 notes, 1944 lines … Lessons: 0"
  (actual **19 / 6,023 / 7**); coverage rows stop at round 3; its Frontier block
  still counts "thirteen `/tmp` evidence groups" (35 archived); `SCORECARD.md`
  primary-verdict tables exist for r1–r3 only (`:18`, `:26`, `:38`), its axes
  table `:53-62` is r1-pinned (depth 7, coverage 5, operability 5, freshness 3,
  calibration 6, adjacency 5), move-log rows 4–8 sit at `:83-87` under
  "## Planned / retired" (`:73`); lessons r8–r10 owed by the one-wave-late
  pattern (r8's landed at this freeze — post-freeze block); the §Pins errata
  block (`:807`) predates the r6/r7/r8 notes; the packet cold-read verdict is
  still `[unknown]`; the packet's note-pin block is 9/9 stale
  (`packet-readiness-r7.md` §2).
- Every hash in this plan is provisional until the archive keeps pace
  (`cdp-evidence-patterns.md` §5 :92); the round-9 tranche's pins are subject to
  the same rule.

## Why this move (candidate decision)

Axes as recorded at design time (`SCORECARD.md:53-62`; r1 stamps + rider notes;
the r4–r10 verdicts owed and part of this round's record work): depth 7,
coverage 5, operability 5, **freshness 3 [lowest]**, calibration 6, adjacency 5.
`AXES.md:23-31`: work the trend furthest behind; one axis-move per round. Four
threads decide round 10, and the assignment names the first and the third:

1. **Operator status — unchanged for a sixth consecutive read.** The R1–R3
   packet has been filed since round 5; the frontier's top rung (real-site
   observation) remains gated on it; the revival decision is either answered,
   executed-then-verify, declined, or carried unasked. Round 10 must again be
   executable both ways and must record which way it read.
2. **Clause (c) — the last clause of the round-5 four-clause claim — is the one
   obligation with a wall-clock dependency.** It closes only with a
   strictly-later-date witness (≥ 2026-10-15); `date -u +%F` flips at **21:00
   -03 local** (00:00Z). If neither round 9 nor round 10 runs past that flip,
   the clause ends **in force** — and the final round's honesty requirement is
   to stamp that state and hand the reader the exact unblock command, never to
   claim it closed.
3. **The 10-round synthesis is the final round's deliverable.** Ten rounds of
   records exist in four files whose refresh has lagged by construction
   (LOG/SCORECARD/README/lessons); the training chain ends here; the lane owes
   one re-derivable index of its own ten rounds, its debt ledger, its operator
   arc, and its named residue — the honest handoff (precedent: the r7 synthesis
   note `layer-routing-synthesis.md` cleared admission).
4. **Record debt is the payment the ten rounds owe** — README header/rows,
   SCORECARD r4–r10 verdicts/axes/move-log, lessons r8–r10, the packet's own
   cold-read falsifier, the archive of the r8/r9 evidence bytes. A final round
   that leaves these to a round 11 that will not exist is not a record.

**Claim (one move, closing; operator-status-branched; synthesis-carried).**
Clause **F** (freshness, the move) — clause (c) reaches a recorded final state
(closed by round 9 → re-derive + hold and record the match count; executable →
execute with a dated in-repo witness whose commit is ≥ 2026-10-15; in force →
stamp with the date and the unblock recipe), the r8/r9 evidence bytes are
archived with a receipt in the r5/r8 pattern (manifest-pin equality, spot
re-hash ≥ 3 groups), and the §Pins refresh lands over the re-derived set.
Clause **S** (the round's deliverable) — `corpus/knowledge/ten-round-synthesis.md`
lands: rounds 1–10 indexed, debt ledger, operator-status arc, never-set restated,
residue and post-training continuation named, every row citing an in-repo
record (admission decided against `corpus/QUALITY.md:1-8`; a rejection is kept,
never silently dropped). Clause **B** (branch) — the operator-status
classification and the revival-decision disposition are recorded verbatim with
the read-back before any act; Branch G executes only inside a recorded answer;
Branch D only under a recorded BRIDGE-NAMING line; else Branch L executes
clauses F and S loopback-only. Both non-L branches carry clauses F and S as
their record work. At most one branch executes. [design decision, recorded]

## Operator status — the branch (measured; never inferred)

The operator status has exactly one measurement surface: `.ufo/l0-questions.md`
content (answers arrive by in-place edit, `MISSION.md:84-88`); operator presence
is never itself a grant channel. The round-9 table (`plans/round-9.plan.md:110-117`)
stands as the classification authority, unchanged:

| Status (gate read) | Meaning | Branch |
|---|---|---|
| **ANSWERED-SCOPED** | a new/edited line names ≥1 of R1/R2/R3 with a scope (site and/or budget) | **G** — execute exactly the named set; default-deny on everything unnamed |
| **ANSWERED-SCOPE-LESS** | approval without a scope (e.g. a bare "yes") | **neither** — recorded as not-a-grant; at most one clarification line may be filed (counted, budget permitting); nothing executes until a scope is named; inference never supplies a scope |
| **DENIED** | explicit refusal of the site classes | recorded verbatim as a calibration datum → **L**; no re-ask on the same ask |
| **BRIDGE-NAMING** | a line approving the bridge path / daemon revival | **D** — revival as the named precondition surface, terms-capped; a site grant arriving in the same line still routes to G for that part only |
| **BRIDGE-DECLINED** | a line explicitly withholding the revival / the bridge path | recorded verbatim → **D closed** (never re-asked, never revived); → **L** for the round's move |
| **SILENT** | no diff vs the round-5 filing (sha + line count + mtime byte-identical) | **L** — silence is not a denial; the revival decision is carried unasked by default (see the line rule) |

Both branches: (i) the read-back (line + sha, before/after counts, mtime) enters
the round record **before** any external request or daemon act; (ii) a mid-round
answer may be acted on only inside its stated scope, after its own read-back —
the record must show read-back-before-act; (iii) **the final record does not
close without a recorded status classification, a recorded revival-decision
disposition, and a recorded clause (c) state** (this round's standing rule,
every branch); (iv) Branch G needs no operator presence during the run
(harness-only, no login, observation only); a scope that would need the operator
at the browser (C5) is out of scope by construction and recorded as such;
(v) the line budget is read from the record, not from this plan.

**Round-10 line rule (final-round form).** Budget = **2 − (tabi-line count at
the gate)**, floor 0. Round 10 permits **at most one** new line, and only the
**bridge/A4 decision class** (the later packet the round-5 filing itself
deferred, `operator-approval-request.md:63-65`) — never a re-send or paraphrase
of R1/R2/R3 (a verbatim repeat stays banned; a second line filed by any earlier
round spends the budget and round 10 files nothing). Conditions, all required:
(a) budget ≥ 1 — i.e. round 9 did not file it (a two-`tabi`-line file means the
budget is spent; the round records that and files nothing); (b) the gate names
the material change against the round-5 filing in writing (candidates: the r6
assessment's checklist complete and pinned, the v2 stop-rule landed, the archive
tranches making the packet's cold-read verdict executable); (c) the line is a
*decision request* — revive now under the assessment's checklist, or withhold —
with no site scope inferred into it. As the final round, a filed line is this
lane's **last** write to the L0 surface; the synthesis records the ask-count and
the silence span as of the final read-back. The count is printed either way.

## Step 0 — the gate (mechanical; recorded verbatim before any act)

1. Read `.ufo/l0-questions.md` whole; record `sha256sum`, `wc -l`, `wc -c`,
   mtime, and every `tabi`-matching region verbatim; count the `tabi` lines;
   print the budget arithmetic (`2 − count`). Compare against the **round-9
   gate record**; if no round-9 gate record is findable, the comparison base is
   the round-8 record's §0 table (`plans/round-8-record-draft.md:25-58`) and the
   comparison is stamped as such.
2. Classify into the table above; the branch follows mechanically. Record the
   **revival-decision disposition** in the same block: `executed-verify` /
   `granted-to-execute` / `declined` / `carried-unasked` / `line-filed`, with
   the reason. Record the **line decision** separately (filed / not filed / not
   permitted) with the budget arithmetic.
3. The read-back enters the round record before any act (both branches).
4. Precondition sweep — one check per round-9 clause; an unlanded clause is
   carried as named debt, repaired only if the chosen branch depends on it:
   - (a) **gate record**: round-9's Step-0 read-back + branch classification
     findable in the round-9 record.
   - (b) **branch execution**: G — the answer/refusal datum, request count ≤
     budget, every stop/trip event with its evidence line, U1 present-or-absent,
     zero session-material reads; D — pre-state shapes, the `/status` field set,
     the t≈0/+30 s/+5 min samples with the falsifier verdict, the A4 stop debt
     named, port/process sweep proving no residue; L — the round-9 note's cell
     count, cells complete vs planned, closure lines per run, rules added, every
     falsifier field filled, the cross-run replay contract stated or named
     unlanded, and the round-6 L1 matrix's status re-derived
     (`carried-debt-closure-r8.md` §2's commands).
   - (c) **freshness / clause (c)**: three states, mechanical — **closed** (a
     dated in-repo block whose commit is ≥ 2026-10-15, `git show -s --format=%cI`
     recorded): re-derive the values, record the match count, hold;
     **executable** (no witness yet and `date -u +%F` ≥ 2026-10-15): execute the
     pass this round (dated block + commit; same-day re-derivations do not close
     it); **in force** (the date has not moved — possible for both r9 and r10 if
     the wave ends before 21:00 -03 local): stamp with the date and carry into
     clause F's record, never fail it.
   - (d) **record + hygiene**: the round's note + coverage row (`corpus/README.md`,
     header counts re-derived first) + SKILL distillation; LOG entry + commit
     (lane identity, `AGENTS.md:3`); lessons count → **9** (`round-1..9.md`) if
     the one-wave-late pattern holds, else each missing file named — at design
     time `round-8.md` landed during this wave and `round-9.md` is the round-9
     record's candidate; `round-10.md` is this round's own to land (the final
     record should not leave its own Gate to nobody); archive present (35 groups
     / 35 manifests) with spot re-hash ≥ 3 groups against the owning notes' pins
     (a mismatch is a freshness finding — append-only, never quietly repaired);
     packet `/tmp`-free + the L0 filing line; standing Brave reject re-run →
     `NativeMessagingHosts` only, agree or the disagreement recorded, with the
     consecutive count re-derived from the record (the gate prints the count it
     asserts).
   - Carried debts to land as ordinary record work if the branch does not depend
     on them: packet cold-read verdict (its own §6 falsifier, `:92-100`); the
     packet's 9/9 stale note-pin block (`packet-readiness-r7.md` §2) — re-bound
     by errata or the decision recorded; README header + coverage rows rounds
     4–10; SCORECARD r4–r10 primary-verdict tables, axes refresh with counting
     commands, move-log placement; the r8/r9 archive tranche with a receipt in
     the r5/r8 pattern.

## Branch D — carried (the revival decision; verify-only unless newly granted)

Authority: the revival act is agent-runnable only under a recorded
**BRIDGE-NAMING** line. A1's doc reading (`interaction-approval-table.md:135`,
"autonomous-now (doc-authorized self-service)") is not re-litigated here; the
round-6 assessment refuses a third reading of that tension
(`webbridge-revival-assessment.md` §4 :169-172, as cited in the round-9 plan).
A4 stays operator-owned (`interaction-approval-table.md:138`).

- **D0 record check** — if the record shows a revival already executed (round 9
  or earlier) and/or the `/status` samples already taken: **D-verify only** —
  re-derive state (listener, pid, `/status` key set), re-read the samples against
  the falsifier, confirm the A4 stop debt is named and the port/process sweep
  shows no residue, and land the outstanding distillation/calibration rows. No
  second revival: the experiment is one pass per name; a second pass needs a new
  name (recorded, never inferred).
- **D1 preconditions** — binary present and executable; port 10086 free
  (measured free at design time); no config edits, no `config.json`, no systemd
  unit, no sudo, no external network; command
  `~/.kimi-webbridge/bin/kimi-webbridge start` — **`start`, never `restart`**
  (`operations.md:11-13`; the Do-NOT block `:24-26` forbids agent-run
  `stop`/`restart`/`uninstall` even with the daemon dead).
- **D2 the experiment (only if no record shows it and the grant is recorded)** —
  revive, then sample `/status` at t≈0 / +30 s / +5 min while a browser is
  running (live at design time; re-check at gate time — measure, never assume).
  Falsifier, verbatim: `extension_connected:false` at +5 min with the browser
  running ⇒ auto-attach is false for this configuration (extension vs daemon
  as-revived; re-check `version` at revive time). A positive discharges U1
  (disposition U2) — the frontier's first handshake datum; a negative (or no
  browser) records "revival succeeded, handshake absent" with the reason and
  stops there (no workaround). Either way the as-is field set is recorded at the
  live probe.
- **D3 debts and side effects** — a revived daemon recreates the **A4 debt**:
  only the operator may stop it; the owed stop is named in the round record.
  Log rotation (`daemon.log` → `.prev`) is a recorded side effect. OOM/session
  durability is untouched by a revival (no unit, no autostart) — [inference,
  strong; the r2 death path].
- **D4 the boundary** — no `/command` POST, no session material (shape-only,
  always), no config edits, no `stop`/`restart`/`uninstall` by the agent, no
  external site (loopback-only). A positive handshake makes the bridge path
  *executable*, not *granted*.
- **D5 if not granted** — record `revival withheld` with the reason; the bridge
  path stays blocked; the decision's ask is the one permitted line, or nothing.
  Carried silence is a recorded state, never an inference of consent.

## Branch G — carried (the answer executes)

Carried from rounds 8/9, condensed; the answer's named set is the authority and
this plan does not widen it.

- **G0 sub-case check** — if the record shows the grant already executed:
  G-verify only (re-derive the note's pins, count `http.log` request lines
  against the granted budget, audit every stop/trip event, confirm the
  zero-session-material statement, land outstanding distillation/calibration
  rows). No second run: the terms are one pass.
- **G1 scope** — the lane's own harness, cold profile, harness-only; read-only
  unless interaction is expressly granted in the same line; exactly the named
  site(s); one pass; no login; session material shape-only.
- **G2 budget** — R3's numbers if granted; else R1's hard-coded default: 1 page
  · 1 cold run · ≤ 20 HTTP requests · ≤ 60 s wall · ≥ 1 s between navigations
  (`operator-approval-request.md:41`). Mechanically checked: request lines in
  `http.log` ≤ budget.
- **G3 probe + stop-and-report** — first request `/robots.txt`; a disallow, or
  the first 429/403/interstitial/CAPTCHA/ToS gate → stop, record, never retry
  through. The refusal is a corpus datum either way; an observed rate/ToS datum
  re-anchors approval-table U1 (`:191-193`) by append-only errata.
- **G4 evidence** — the three rungs (screenshot + raw DOMSnapshot; CDP Network
  slice; URL/navigation history) in the 9-item envelope, per-claim anchors,
  determinism class named per artifact, cleanup proof per run; note
  `corpus/knowledge/real-site-observation-<host>.md` with sha pins; one
  **loopback↔external delta** section (protocol/TLS fields, request classes with
  no loopback analogue, header shapes — shape-only).
- **G5 unmovable** — the never-set (consequential external acts;
  session-material content-reads; out-of-province work) is not movable by any
  grant (`PROVINCE.md:15-19`); a granted observation stays non-consequential.
- Calibration rider: the answer, the scope discipline, and the first
  stop-behaviour (if tripped) are the approval table's live exercising — record
  before→after in `SCORECARD.md`.

## Branch L — the closing branch (clauses F and S execute here)

Standing anti-claim fully in force: **no external site**; nothing filed
anywhere except the one permitted line; the packet stays filed; not re-asked by
default; silence is not a denial; loopback only; cleanup verified per run.

- **L0 carried-debt ladder (mechanical)** — execute whatever the record shows
  unlanded, in order, as debt, not as a second move:
  1. **round-6 L1 matrix** (wire-class / cache-revalidation for repeated same-URL
     subresources) — the predicate is on record (`plans/round-6.plan.md` §L1
     `:124-134`); still open at r8 close (`carried-debt-closure-r8.md` §2
     `:63-107`, its U5 naming the landing-site question); round 9's L0.1 should
     have landed it — the gate re-derives. The bytes it consumes are archived
     (`w6-tabi-b61`).
  2. **round-9's own L1** (the stateful client across runs: cookie/token
     lifecycle across restarts in the lane's own cold profile, the cold-run
     replay contract across independent cold clients, cache interactions with a
     cookie-bearing second request) — if round 9 left cells unlanded, they ride
     as debt with their own falsifiers, never as a widened claim.
  3. **the r8 stateful note's archive debt** (`stateful-fixture-evidence.md`
     §11 `:728-741`): the fixture + 32 run dirs in `/tmp/w8-tabi-b81/` — copy
     into `corpus/evidence/` with a `MANIFEST.txt`; the earlier runner revision
     survives only as a sha and is named as unrecoverable in the receipt.
- **The move executes here**: clause F (clause (c) closure attempt + archive
  tranche for the r8/r9 evidence + the §Pins refresh) and clause S (the
  synthesis) are the round's work. **No new fixture class is opened in the
  final round** — the round's own deliverable is the synthesis, and the loopback
  scale is the debt ladder plus archive, not an eleventh class. If the debt
  ladder clears and the archive lands, the round's evidence work is complete;
  the remaining hours belong to the record. [design decision, recorded]
- **L1 instruments/guards (only if ladder cells execute)** — round-6/7/8 lists:
  capture bytes byte-identical across identical-cell reruns, or the divergence
  itself measured and classified; both network surfaces kept (client status ≠
  wire truth); closure per run (kill by PID from the process table, never by
  pattern; ports closed; `curl` exit 7); a loopback 429 is never a C6 datum.
- **L2 boundary** — lane-authored fixtures only; a mirrored real-site artifact
  stays C3 default-deny.

## The 10-round synthesis — the final round's deliverable (clause S)

**Output**: `corpus/knowledge/ten-round-synthesis.md` (candidate path; the
admission decision is the seat's against `corpus/QUALITY.md:1-8` and
`CORPUS.md:33-46` — count-carries-command, negative-claims-carry-sweeps,
quote-names-location, index-row-only-when-the-file-exists, no credential
material, corrections-are-new-entries). If admission fails, the seat records
the rejection in `corpus/lessons/round-10.md`'s Gate and lands the same rows as
the round's closing record artifact; the rejection is kept (`QUALITY.md:5`),
never silently dropped. Header per `CORPUS.md:17-19`: `source:`, `verified-at:`,
`recheck:`.

**Method**: re-derive, never inherit — every cell re-computed at execution from
the in-repo records; this plan supplies no row values and no row may cite this
plan. Authority list (re-read at execution): `LOG.md` round entries (r1 `:5-28`,
r2 `:29-75`, r3 `:76-130`, r4–r8 `:131-135`); `SCORECARD.md` move-log rows 1–8
(`:68-71`, `:83-87`) plus the r1–r3 verdict tables (`:18`/`:26`/`:38`); the
lessons' `## Gate` blocks (`corpus/lessons/round-1..10.md`); the round plans and
record drafts (`plans/round-{2..9}.plan.md`, `plans/round-{4..9}-record-draft.md`);
the note pins (the §Pins table + the round-6/7/8 append blocks); `reports/`
r4–r10; the per-round L0 read-backs recorded in the record drafts; the commit
walk (`git log --oneline` + `git show --stat <commit>` per round).

**Mandatory content** (each row falsifiable; observation/inference/unknown
separated):

1. **Round index (rounds 1–10)** — one row per round: axis move(s) + claim
   (cited); branch taken (G/D/L/none); landed artifacts with pins (file + sha
   first-12 + `wc -l`); the three trend verdicts with their source; the commit.
2. **Axes trajectory** — before→after per move, each with its counting command;
   this section carries the refresh that closes the r1-pinned table (the r4–r10
   verdicts `SCORECARD.md` owes) and any saturation/retire decision with reason
   (`AXES.md:33-39`). The synthesis's table and the SCORECARD's refreshed axes
   table must agree cell-for-cell; a disagreement is a finding, not a silent
   pick.
3. **Debt ledger** — every carried item across ten rounds, status ∈
   {closed-by-landing, closed-by-erratum, open-now, retired-as-residue}, each
   with its closing surface and the command that shows it. The open-now set must
   equal section 6's non-retired rows exactly.
4. **Operator-status arc** — the r5 filing (`:25`, packet `94dc63f5fb9e…`); the
   per-round read-backs (count of byte-identical reads); the silence span
   (filing mtime → the round-10 gate read, both stamped); ask-count; every line
   this lane ever filed, verbatim; the revival-decision history (assessed r6,
   carried r7, sub-case r8, first-class r9, r10 disposition).
5. **Never-set + boundary** — restated as the ten rounds' constant
   (consequential external acts; session-material content-reads; out-of-province
   work; `PROVINCE.md:15-19`), with the statement that no grant moves it.
6. **Named residue** — what the ten rounds did **not** establish, each with its
   naming pin and unblocking condition; at minimum: zero real-site datum
   (approval-gated), rate/ToS U1 (`interaction-approval-table.md:191-193`), the
   extension↔daemon handshake (`extension_connected:false` throughout), the
   byte-identity environment scoping, real-site POST/redirect/CSRF classes
   (loopback-closed r8, real-site-open), clause (c) if it ends in force, and the
   daemon/A4 operator obligations (return-to-baseline if a revival happened).
7. **Post-training continuation** — the exact command block a future reader runs
   to (i) re-read the L0 and classify, (ii) execute the clause (c) pass if still
   in force (refresh list + witness recipe), (iii) verify the archive
   (`sha256sum -c` spot), (iv) re-run the standing Brave reject; plus the
   `SHONEN.md` promotion state (boxes + named verifiers) and a `PROVINCE.md`
   accuracy re-check (does PROVINCE still list every owned surface, `AXES.md:11`).

**Riders**: SHONEN re-check; PROVINCE accuracy; the fleet-level report item
(tabi absent from the watchdog `LANES` roster, `scripts/shokunin-watchdog.sh:14`
— reported, not absorbed, carried from r5); SKILL distillation (a round-10
§Errata append: the ten-round table + the synthesis pointer, citing the note's
pin).

**Size cap**: the note must stay re-derivable — every row carries its citation;
if the row count would push the note past what a cold reader can re-run, the
seat splits rows, never drops citations.

## Freshness rider (both branches) — clause (c), final state

The §Pins strictly-later-date pass (`SKILL.md:829`, `:1058`), three states,
mechanical: **closed** — round 9 (or an earlier round) landed a dated in-repo
block whose commit date is ≥ 2026-10-15 (`git show -s --format=%cI` recorded):
round 10 re-derives the values, records the match count, and holds; **executable**
— no such witness yet and `date -u +%F` ≥ 2026-10-15: execute the pass this
round (dated block + commit; the clause closes only when date + match count +
witness are on record; same-day re-derivations do not close it); **in force** —
the date has not moved: stamp and carry. The refresh list is re-derived, not
inherited: the note set as it stands at gate time (19 at design time), the
reports r4–r8 (+r9/r10 if landed), the 3 substrate pins (`e70aff5c40ff` /
`84a8e69d04c5` / `b811d9c23dfd`), and the current `SKILL.md` revision
(`3b79ed2dea6c…` at design time); the gate prints the count it asserts. A
mismatch is a freshness finding (append-only errata), never a silent repair.

**Final-round honesty rule.** If the training window ends before 21:00 -03
local, clause (c) ends **in force**: the round-5 four-clause claim closes **3/4**
with the fourth clause named as structurally time-blocked inside the training
window, and the synthesis's section 7 carries the one-command unblock. The
record never claims the clause closed on a same-day witness.

## Measure (mechanical; branch-dependent)

- D: disposition recorded with its reason; pre-state shapes; the three `/status`
  samples (or the verify-mode re-derivation); the falsifier verdict verbatim;
  the live key set; A4 stop debt named; port/process sweep; zero
  session-material reads (shape-only list).
- G: answer region recorded with sha + line numbers and pre/post counts; the
  execution-vs-verify sub-case named; `http.log` request count ≤ granted budget;
  every stop/trip event with its evidence line; note sha pins; U1 datum
  present-or-absent; zero session-material reads; the calibration rider
  before→after.
- F: clause (c) state (closed / executable-executed / in force) with the date,
  the witness and its commit stamp, and the match count; archive tranche counts
  (groups added, files, bytes, manifest self-check result, receipt pin) with
  spot re-hash ≥ 3 groups vs owning notes' pins; every remaining `/tmp` group
  either archived or named with its reason; the §Pins re-derivation date +
  match count.
- S: synthesis rows complete vs planned; every row's citation resolves (the
  verifier's spot ≥ 3 rows + ≥ 1 negative claim's sweep re-run); the debt
  ledger's open-now set equals the residue set; the operator arc's span math
  printed; the admission decision (admitted / rejected-kept) recorded.
- Both: operator-status classification + revival-decision disposition recorded
  verbatim with the read-back before any act; the line decision + budget
  arithmetic printed; the new note lands with a coverage row (`corpus/README.md`,
  header counts re-derived first) and SKILL distillation; LOG entry + commit
  (lane identity); standing Brave reject re-run → `NativeMessagingHosts` only,
  count re-derived from the record; packet cold-read verdict present-or-named;
  `ls -A corpus/lessons | wc -l` and each missing file named; the **closing
  statement**: every remaining obligation is either landed or named with its
  closing surface — the record asserts what a post-training reader can verify,
  and nothing in it presumes a round 11.

## Seats + write scopes (slots; wave lead assigns)

- gate + record — one seat: Step 0, operator-status classification, the
  revival-decision disposition, the line decision, branch record, precondition
  sweep.
- L/move seat (clauses F): clause (c) closure attempt + the archive tranche +
  the receipt (r5/r8 pattern) + the §Pins refresh.
- synthesis seat (clause S) + a non-author verifier (rows complete; ≥ 3 row
  citations re-resolved; ≥ 1 negative claim's sweep re-run; the debt ledger ↔
  residue-set equality).
- record-debt seat — README header + coverage rows 4–10; SCORECARD r4–r10
  verdicts + axes refresh + move-log placement; lessons r8/r9/r10; the packet
  cold-read test (its own §6 falsifier) and the pin-block decision — ordinary
  record work, named so it stops riding silently.
- D seats (revival + verifier) and G seats (observation + grant-discipline
  verifier) only if their branch fires.
- verification + outside spot-check (non-author, `LEARNING.md:37-43`) + scribe
  (LOG/SCORECARD/README/commit). Write scope per seat; `.ufo/l0-questions.md`
  is touched by no lane this round except the one permitted line, only if the
  gate's material-change test passes and the budget allows (count recorded).

## Bounds & unknowns

- [unknown] What round 9 landed (in flight at freeze): its L1 artifacts, the
  round-6 L1 matrix's status, its clause (c) reading, its L0 line decision (the
  budget at the round-10 gate), and `round-9.md`. The gate reads the record and
  executes what is missing.
- [unknown] Whether any answer arrives by round 10 — its form and timing; the
  plan assumes none and executes nothing absent a recorded read-back.
- [unknown, observation-backed] The date: at freeze `date -u +%F` → 2026-10-14
  and the pass is TIME-GATED; the UTC date flips at 21:00 -03 local. If neither
  r9 nor r10 crosses the flip, clause (c) ends in force — a recorded state with
  the unblock recipe, not a failure and not a closure.
- [unknown] Whether a browser carrying the extension is running at round-10
  time (the D2 experiment's precondition; live at design time — process census
  only, 19 chromium processes).
- [unknown] Whether the packet cold-read test passes on the first attempt (its
  own §6); a follow-up question is a recorded gap, not a failed round.
- [unknown] Whether the r8 fixture's `/tmp` bytes survive to the archive seat;
  the note's §11 already names the one revision that cannot be restored.
- [inference, strong] The synthesis is the right final deliverable: the lane's
  ten-round record is fragmented across four files with a documented
  one-wave-late lag, and the r7 precedent shows a synthesis note clearing
  admission; if it fails admission, the fallback (record artifact + kept
  rejection) carries the same rows with the failure recorded.
- [inference, medium] Freshness is the right move: the r1-pinned axes table
  still records it lowest (3) and clause (c) is its one open clause; if the
  axes refresh lands and reads differently, the record states the divergence —
  the move's content (clause (c) + archive + debt) is invariant.
- [unknown] The README/SCORECARD refresh content — depends on the records as
  landed; the seats re-derive, never inherit from this plan.
- Fleet-level, reported not absorbed: tabi outside the watchdog `LANES` roster
  (carried from r5); fleet closeout entries are other lanes' work.
- New evidence bytes are `/tmp`-staged until the archive pass lands; every new
  hash is provisional (archive obligation `cdp-evidence-patterns.md` §5 :92).

## Discipline (round 10)

Substrates read-only; secrets/session material shape-only, never content-read;
the revival act only under a recorded BRIDGE-NAMING read-back and always without
`stop`/`restart`/`uninstall`; Branch L loopback-only with cleanup verified per
run; Branch G only inside the recorded answer, terms-capped, stop-and-report;
one move (clauses F/S/B); append-only errata; observation / inference / unknown
separated (`corpus/QUALITY.md`); no external site absent a read-back that names
it; the synthesis writes only in-repo citations; write scope for this design
lane: `plans/round-10.plan.md` only (PREP-B10); the round's seats write per
their assignments.

## Post-freeze observation (append-only; added at write by PREP-B10)

The design read above ran while round-9 execution was in flight. These facts
were measured in the same window and are **not** part of the main freeze; the
round-10 gate re-derives every count by command rather than trusting this block.

- Round-9 execution had begun: `/tmp/w9-tabi-b91/` was staged at 16:59 -03
  (`server.py` 12,311 B · `journey.mjs` 21,271 B · `driver.sh` 4,536 B ·
  `compare.mjs` 3,425 B · `curl-control.sh` 2,405 B · `verify.py` 4,689 B — the
  r9 L1 harness for the stateful client across runs; shapes only, not read as
  work). A round-9 scribe prep poll was live: `/tmp/w9-scrb9/poll.log`
  iterations 1–8 (19:58:09–20:00:29Z) all read `l0=02c53ec60acf/25 kn=19
  kl=6023 ev=35 sk=3b79ed2dea6c dirty=0 head=6a8861c lessons=7 w9dirs=7→32`.
- **At the freeze stamp itself (20:01:14Z): `corpus/lessons/round-8.md` landed**
  — 254 `wc -l` / 19,735 B / sha256 `e2f3698fc2dc89e5…` / mtime 17:01 -03,
  untracked; written by lane **B9-3** (round 9); `## Gate` at `:193`; lessons
  **7 → 8**; `git status --short` then showed exactly that one untracked file.
  Its header cites the r8 commit (`6a8861c`), the r8 record draft pins and the
  r8 seats. Consequence: this plan's lessons-count assertions are freeze-time-true
  and are superseded by this bullet; Step 0 re-derives the count and names
  `round-9.md` / `round-10.md` as the remaining candidates.
- **Later in the same write window (17:03:24 -03):** `reports/r9-aud-b9.md` landed
  — 173 `wc -l` / 14,906 B / sha256 `af4c99e951839d60…`, untracked; lane
  **AUD-B9** (round 9), auditing the state-changing matrix (two cells re-run)
  and the F1 erratum (group file list unchanged). `git status --short` then
  showed the two round-9 artifacts plus this file. The round-10 gate re-derives
  the report set (r4–r8 above; r9/r10 by then).
- The freeze stamp precedes every line of this block; nothing above is amended
  by it. This lane's total footprint: this file (created) and read-only
  measurements — no scratch directory was created by PREP-B10.