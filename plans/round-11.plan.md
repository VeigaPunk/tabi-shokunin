# WWKD plan — tabi round 11 (the closeout) (ufo-round-plan-v1)

Design lane: **PREP-B11** (2026-10-14, round-10 wave, 32 lanes; round-10 execution
**in flight** at design time — its first seat scratch and its first landed evidence
group are recorded in the closing post-freeze block). Write scope: this file only.
Design-time state read by this lane by command across **2026-10-14T20:50–20:55Z**
(freeze stamp **20:55:14Z**); the values below are the read-time values — nothing in
them is taken from a record, and every one of them is re-derived at the round-11
gate.

- **Round numbering — this is the chain's last round (measured, not assumed).**
  [observation] fleet `MANIFEST.json` records each training round as
  `"training rN (lane round N+1)"` — tabi entries at `:2123` ("training r7 (lane
  r8): stateful-fixture evidence + independent re-run; debt closure; lessons
  6/7.") and `:2179` ("training r8 (lane r9): state-changing matrix; F1 closed
  untouched-bytes; lesson r8."); the fleet closeout commits count *training*
  rounds: `b5a9723` "training wave-9 closeout: round 9 — … **all lanes 8/10**",
  preceded by `c272828` "… all lanes **7/10**". [inference, strong] the chain is
  **ten training rounds**; **lane round 11 = training r10 = the last round**, and
  the wave running while this plan is written (lane round 10 = training r9) is the
  penultimate one. The round-10 plan asserts the opposite for tabi
  (`plans/round-10.plan.md:8-11`: "Round 10 is the **final lane round** of the
  training chain … this is the last plan the lane drafts, and nothing in it
  presumes a round 11."); the sibling lanes' round-10 plans assert it too
  (`mado-shokunin/plans/round-10.plan.md:9`, `tameshi-shokunin/plans/round-10.plan.md:14`,
  read-only). Their premise is contradicted by the counters above — recorded
  append-only, not repaired, and not re-litigated: whatever a plan presumed, the
  counters and this assignment make round 11 the closeout. Nothing in *this* plan
  presumes a round **12**, and clause Z is written so that it stays honest if the
  chain nevertheless continues.
- HEAD `ad735dda71c9b55a7882da467c768a1305e65209` ("probation round 9 (training
  r8): see LOG", 2026-10-14T17:47:30 -03; 9 files, +2,093/−1). Round 9 is
  **committed** — LOG entry `:136`, SCORECARD move-log row `:88`, SKILL append
  `:1059-1188` (→ **1189** `wc -l`), notes `state-changing-matrix-r9.md`
  (`ec540be07ed5…` / 388 `wc -l`) and `archive-receipt-r8.md`
  (`de45b805e5a4…` / 218 `wc -l`), `corpus/lessons/round-8.md`
  (`d974eadc29f6…` / 256 `wc -l`), `reports/r9-aud-b9.md` (`df34bf6c63e1…` /
  174 `wc -l`), `plans/round-9-record-draft.md`. Round 10 has landed **no**
  repo artifact at the freeze except its own in-flight evidence group:
  `git status --short` → exactly one entry, `?? corpus/evidence/w9-tabi-b91/`
  (post-freeze block).
- Operator channel: `.ufo/l0-questions.md` **25** lines / **21,539** B / sha256
  `02c53ec60acf…` / mtime `2026-10-14 14:05:52.482908587 -03`; exactly one
  `tabi` line (`:25` — the round-5 filing, packet sha `94dc63f5fb9e…`); **no
  answer, no denial, no edit**; ask-count 1; silence span at freeze (filing mtime
  `2026-10-14T17:05:52Z` → the freeze read `20:55:14Z`) = **3 h 49 m 22 s**. The
  byte-identical filing state has now been read across six rounds (r5 filing,
  r6/r7/r8/r9 gates, r10 gate, this design read).
- Corpus: `corpus/knowledge/` **20** notes / **6,438** lines; `corpus/evidence/`
  **35** group dirs / 35 `MANIFEST.txt` / 1,451 files / 9,222,920 B at the main
  read — **and a 36th group landed inside the freeze window itself**
  (`w9-tabi-b91/`: `MANIFEST.txt` present, 270 files, 1,096,027 B at 20:53Z,
  untracked, still moving; file census 1,451 → 1,721 — post-freeze block);
  `corpus/lessons/` **8** files (`round-1..8.md`; `wc -l` 59/60/69/87/139/150/
  172/256; shas r1–r7 as the round-9 gate record re-derived them, r8
  `d974eadc29f6…` measured here); `reports/` r4 `5f44b0f94483`/167 · r5
  `d09f1712cbcf`/170 · r6 `9428ddec52b9`/178 · r7 `ea4b16a4a844`/260 · r8
  `a191832be152`/181 (r4–r8 from the round-9 gate record: committed, untouched
  since — re-derive) · r9 `df34bf6c63e1…`/174 (measured here).
- `SKILL.md` **1189** `wc -l` / sha256 `c07d29c3e8d1…`; §Pins errata block
  `:807`; the round-5 refresh with the **TIME-GATED** line `:829`; round-8 append
  `:948`; round-9 append `:1059-1188`; the carried-debt pointer table ends at the
  clause (c) row **`:1058`** (*"carried — `date -u +%F` → 2026-10-14; earliest
  2026-10-15; the witness is a dated in-repo block whose commit date is ≥
  2026-10-15"*) — the one clause this round must close or stamp.
- Round-9 pin drift found at this read (observation, not repaired): `SKILL.md:963`
  and `:1024` still cite `archive-receipt-r8.md` at `0587605db913` / 191
  `wc -l`; the committed revision is **`de45b805e5a4…` / 218 `wc -l`**, and the
  receipt's own append declares the supersession (*"This append moves the file's
  sha; the published `0587605db9138631` (191 lines, committed `b377007`) stands as
  the pre-append revision."*) — so the pin is stale-by-declaration and belongs to
  clause C's final refresh, not to a repair here. The round-9 note's own pin holds
  (`ec540be07ed5` / 388), and `corpus/lessons/round-8.md` moved 254 →
  **256** `wc -l` between the round-9 draft's as-of-write value (`e2f3698fc2dc…`)
  and its committed revision (`d974eadc29f6…`) — same class, recorded.
- Round 10 (in flight; lane round 10 = training r9): plan
  `plans/round-10.plan.md` `4d2acdb32d96…` / 567 `wc -l` (committed in `ad735dd`);
  its clauses **F** (clause (c) + the archive tranche + the §Pins refresh),
  **S** (`corpus/knowledge/ten-round-synthesis.md`), **B** (operator-status
  branch); line rule `:157-171`; Step 0 `:173-227`; Branch L `:308-344`; clause S
  spec `:346-415`; freshness rider `:417-437`; Measure `:439-469`; Seats
  `:471-490`; Bounds `:492-525`. Its seats were live at the freeze
  (`/tmp/w10-tabi-b104/poll.log` rows 20:51:11–20:53:11Z, all `no-synth` — clause
  S had not landed by the last row; the r9 archive tranche landing, above).
  Whether round 10's clauses landed is this round's Step 0.
- Packet: `corpus/handoffs/operator-approval-request.md` 121 `wc -l` / 13,103 B /
  `94dc63f5fb9e…` (byte-identical to the filing); its deferred edges
  `:60-66` (C5 `:63`, A5 `:64`, A4 `:65`); its cold-read falsifier `:92-100`
  with the verdict still `[unknown]` (`:100`); its answer discipline `:102-110`.
- Daemon: no listener on 10086 (`ss -ltn | grep -c 10086` → 0), no process
  (`pgrep -x kimi-webbridge` → 0); pointer files stale (`daemon.pid` 8 B,
  `daemon.addr` 16 B, mtime 10:46 -03); `identity.json` (36 B, mode 600) and
  `logs/` **shape-only, never content-read**. Substrate pins re-derived at this
  read: `e70aff5c40ff` (`kimi.plugin.json`) / `84a8e69d04c5` (substrate
  `SKILL.md`) / `b811d9c23dfd` (`references/operations.md`, 34 `wc -l`) —
  **3/3 match**; `start` at `:11-13`, the **Do-NOT** block
  (`stop`/`restart`/`uninstall`) at `:24-26`.
- Browser side: `pgrep -c chromium` → **0** at the freeze (r9's gate read: 19;
  the round-10 design read: 19 — the census is instantaneous, not a floor, and a
  census 0 changes what Branch D could even measure; see Bounds). Standing Brave
  reject re-run: `ls -A ~/.config/BraveSoftware/Brave-Browser/` →
  `NativeMessagingHosts` only → agree; the consecutive count is re-derived from
  the record at the gate (r8's record asserted the 8th, r9's the 9th; the
  round-10 record decides the 10th, this round the 11th).
- Known record debt (design-time; named here, repaired only by its own seat):
  `corpus/README.md` (`e156bb99af2c…` / 59 `wc -l`) header `:5-9` still says
  "Held at round 3 … 8 knowledge notes, 1944 lines … Lessons: 0" (actual
  **20 / 6,438 / 8**); coverage rows stop at round 3 (`:13-20`); the Frontier
  block `:48-54` still counts "thirteen `/tmp` evidence groups" (36 now archived);
  `SCORECARD.md` (`2a7b02743265…` / 88 `wc -l`) primary-verdict tables r1–r3 only
  (`:18`, `:26`, `:38`), axes table `:53-62` r1-pinned (depth 7, coverage 5,
  operability 5, freshness 3, calibration 6, adjacency 5), move-log rows 4–9
  (`:83-88`) under "## Planned / retired" (`:73`); lessons `round-9.md` (wave
  10's) and `round-10.md` + `round-11.md` (this round's own — the final record
  must not leave its own Gate to nobody); the packet cold-read verdict
  `[unknown]`; the packet's 9/9 stale note-pin block (`packet-readiness-r7.md`
  §2); the round-8 tranche (`/tmp/w8-tabi-b81/`, `/tmp/w8-ver-b81/`) still
  unarchived — two waves old, its survival an unknown; the round-9 tranche
  landing as this plan is written; the round-6 L1 matrix (wire-class /
  cache-revalidation) still open at r8 close (`carried-debt-closure-r8.md` §2
  `:63-107`) unless round 10 landed it; the round-9 matrix note's own §10 SC-2
  owes a non-author re-run.
- Every hash in this plan is provisional until the archive keeps pace
  (`cdp-evidence-patterns.md` §5 :92); the r9/r10 tranches' pins are subject to
  the same rule.

## Why this move (candidate decision)

Axes as recorded at design time (`SCORECARD.md:53-62`; r1 stamps + rider notes;
the r4–r11 verdicts are owed and are part of this round's record work): depth 7,
coverage 5, operability 5, **freshness 3 [lowest]**, calibration 6, adjacency 5.
`AXES.md:27-31`: one axis-move per round, the furthest-behind axis, measured
before→after in `SCORECARD.md`. Four threads decide round 11, and the assignment
names the first and the third:

1. **The chain ends here.** This is the last plan the lane drafts and the last
   round it executes (header numbering block). Every obligation left open at the
   close is an obligation with nobody to carry it: the round's deliverable is not
   a new frontier but the **honest terminal record** — every remaining item landed
   or named with its closing surface, and nothing presuming a round 12.
2. **Operator status — the last read.** The R1–R3 packet has been filed since
   round 5; the frontier's top rung (real-site observation) is still gated on it.
   Round 11 performs the same mechanical branch one last time and records the
   final classification, the final revival-decision disposition, and — if the
   budget allows and the material-change test passes — the one permitted line,
   which would be this lane's **last** write to the L0 surface.
3. **Clause (c) — the last wall-clock-dependent obligation.** The round-5
   four-clause claim's fourth clause closes only on a strictly-later-date witness
   (≥ 2026-10-15). The UTC date flips at **21:00 -03 local** (2026-10-15T00:00Z);
   at the freeze the flip was ≈ **3 h 05 m** away. Round 11 is the **last** round
   that can close it inside the training window. If its execution window does not
   cross the flip, the clause ends **in force** — stamped with the date and handed
   off with the exact unblock command, never claimed closed.
4. **The closeout is the deliverable, and the record debt is its payment.** Ten
   training rounds of records live in four files whose refresh has lagged by
   construction (LOG / SCORECARD / README / lessons); whether round 10 landed its
   synthesis (clause S) is a gate read, not an assumption; the archive tranches of
   rounds 8, 9 and 10 must be settled or explicitly handed off.

**Claim (one move, closing; operator-status-branched; closeout-carried).**
Clause **C** (freshness — the move): clause (c) reaches a recorded **final
state** — *closed* (a dated in-repo block whose commit **instant** is ≥
2026-10-15T00:00Z: re-derive the values, record the match count, re-bind the
declared-stale pins, hold), *executable* (no witness yet and `date -u +%F` ≥
2026-10-15: execute the pass this round under the instant predicate below), or
*in force* (the window ends before the flip: stamp with the date and carry the
unblock recipe into clause Z); plus the archive tranches and the final §Pins
refresh as its record work. Clause **Z** (the round's deliverable): the
**training closeout** lands — one artifact indexing the lane's whole life (lane
rounds 1–11, with the training-round mapping named), the four-clause tally, the
terminal debt ledger, the operator-status arc, the never-set, the named residue
with unblock conditions, the post-training handoff command block, and the closing
statement (candidate path and admission rule below; if round 10's
`ten-round-synthesis.md` exists, Z extends it instead of duplicating it). Clause
**B** (branch): the operator-status classification and the revival-decision
disposition are recorded verbatim with the read-back before any act; Branch G
executes only inside a recorded answer; Branch D only under a recorded
BRIDGE-NAMING line; else Branch L executes clauses C and Z loopback-only. Both
non-L branches carry C and Z as their record work. At most one branch executes.
[design decision, recorded]

## Operator status — the branch (measured; never inferred)

The operator status has exactly one measurement surface: `.ufo/l0-questions.md`
content (answers arrive by in-place edit, `MISSION.md:84-88`); operator presence
is never itself a grant channel. The table carried from rounds 9/10
(`plans/round-10.plan.md:130-155`) stands unchanged as the classification
authority:

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
answer may be acted on only inside its stated scope, after its own read-back; a
mid-round or post-gate answer still owed at the close is handed off as an
executable step in clause Z (the grant is not wasted by the chain's end);
(iii) **the final record does not close without four stamps: the status
classification, the revival-decision disposition, the line decision with its
budget arithmetic, and the clause (c) state** — this round's standing rule, every
branch; (iv) Branch G needs no operator presence during the run (harness-only, no
login, observation only); a scope that would need the operator at the browser
(C5) is out of scope by construction and recorded as such; (v) the line budget is
read from the record, not from this plan; (vi) if no answer has ever arrived, the
closeout's operator arc is the terminal record of an unanswered filing: silence
is not a denial, the packet stays filed, the ask-count is printed.

**Round-11 line rule (the last read).** Budget = **2 − (tabi-line count at the
gate)**, floor 0. Round 11 permits **at most one** new line, and only the
**bridge/A4 decision class** (the later packet the round-5 filing itself
deferred, `operator-approval-request.md:63-65`) — never a re-send or paraphrase
of R1/R2/R3 (a verbatim repeat stays banned; a second line filed by any earlier
round spends the budget and round 11 files nothing). Conditions, all required:
(a) budget ≥ 1 — i.e. round 10 did not file it (a two-`tabi`-line file means the
budget is spent; the round records that and files nothing); (b) the gate names
the material change against the round-5 filing in writing (candidates: the
assessment's checklist complete and pinned, the v2 stop-rule, the archive
tranches making the packet's cold-read verdict executable); (c) the line is a
*decision request* — revive now under the round-6 assessment's checklist, or
withhold — with no site scope inferred into it; (d) it may carry **one** closing
sentence noting that the training chain ends this round and that a late answer
remains executable by the closeout's handoff — one line, one ask, no second line
ever. If filed, the record marks it the lane's final L0 write and clause Z's
operator arc records the ask-count and the silence span as of that read-back; if
not filed, the disposition entry says why (budget spent / no material change /
not needed). The count is printed either way.

## Step 0 — the gate (mechanical; recorded verbatim before any act)

1. Read `.ufo/l0-questions.md` whole; record `sha256sum`, `wc -l`, `wc -c`,
   mtime, and every `tabi`-matching region verbatim; count the `tabi` lines;
   print the budget arithmetic (`2 − count`). Compare against the **round-10 gate
   record**; if no round-10 gate record is findable, the comparison base is the
   **round-9 record's §0 table** (`plans/round-9-record-draft.md:20-49`) and the
   comparison is stamped as such. (The three known states: r5 filing 25 / 21,539
   / `02c53ec6…` / mtime `14:05:52.482908587 -03`; the r9 gate read — byte-identical;
   this design read — byte-identical.)
2. Classify into the table above; the branch follows mechanically. Record the
   **revival-decision disposition** in the same block: `executed-verify` /
   `granted-to-execute` / `declined` / `carried-unasked` / `line-filed`, with the
   reason. Record the **line decision** separately (filed / not filed / not
   permitted) with the budget arithmetic.
3. The read-back enters the round record before any act (both branches).
4. Precondition sweep — one check per round-10 clause; an unlanded clause is
   carried as named debt, repaired only if the chosen branch depends on it:
   - (a) **gate record**: round-10's Step-0 read-back + classification findable in
     the round-10 record (or its draft); if not, the round-9 base is used and
     stamped.
   - (b) **clause F**: the clause (c) state as round 10 left it (closed /
     executable-executed / in force) with its witness and commit stamp; the
     archive tranche counts (groups added — the r9 tranche at least, 35 → 36 at
     this freeze; files; bytes; manifest self-check; receipt pin) with spot
     re-hash ≥ 3 groups vs the owning notes' pins; **every** remaining `/tmp`
     group either archived or named with its reason (the r8 tranche is the
     oldest — two waves old; its survival is an unknown, never an assumption);
     the §Pins refresh date + match count, including the declared-stale
     `archive-receipt-r8` pin (header block).
   - (c) **clause S**: `corpus/knowledge/ten-round-synthesis.md` present
     (admission decision recorded) → **Z closes by extension**: the closeout
     adds the lane-round-11 row, the training index and the terminal sections,
     and the two artifacts must agree cell-for-cell on every shared quantity (a
     disagreement is a finding, not a silent pick) / absent → Z lands the full
     index itself, re-derived from the records (authority list below).
   - (d) **clause B**: the round-10 classification + disposition recorded; if
     round 10 filed the one line, its verbatim text and read-back are on record
     and the budget at this gate is 0; if round 10 left it unfiled, the
     disposition says why.
   - (e) **branch work**: G — the answer/refusal datum, request count ≤ granted
     budget, every stop/trip event with its evidence line, U1 present-or-absent,
     zero session-material reads; D — pre-state shapes, the `/status` field set,
     the t≈0/+30 s/+5 min samples with the falsifier verdict, the A4 stop debt
     named, the port/process sweep proving no residue; L — the round-10 note's
     cells complete vs planned, closure lines per run, rules added, every
     falsifier field filled, and the round-6 L1 matrix's status re-derived
     (`carried-debt-closure-r8.md` §2 `:63-107`).
   - (f) **record + hygiene**: the round's artifacts + coverage row
     (`corpus/README.md`, header counts re-derived first) + SKILL distillation
     (the round-10/11 append); LOG entry + commit (lane identity, `AGENTS.md:3`);
     lessons — `ls corpus/lessons | wc -l` with each missing file named (at this
     read **8**; `round-9.md` is wave 10's, `round-10.md` and the final
     `round-11.md` are **this round's own to land** — named here so neither rides
     silently); archive census re-derived (36 groups at this freeze) with spot
     re-hash ≥ 3; packet `/tmp`-free + the L0 filing line; standing Brave reject
     re-run → `NativeMessagingHosts` only, count re-derived from the record.
   - (g) **carried debts to land as ordinary record work if the branch does not
     depend on them**: packet cold-read verdict (its own §6 falsifier, `:92-100`);
     the packet's 9/9 stale note-pin block (`packet-readiness-r7.md` §2) —
     re-bound by errata or the decision recorded; README header + coverage rows
     rounds 4–11; SCORECARD r4–r11 primary-verdict tables + axes refresh with
     counting commands + move-log placement; lessons round-9/10/11; the r8, r9
     (+r10) archive tranches with receipts in the r5/r8 pattern; the SKILL
     stateful-note / receipt pin supersessions re-bound by errata or the decision
     recorded.

## Branch D — carried (the revival decision; verify-only unless newly granted)

Authority: the revival act is agent-runnable only under a recorded
**BRIDGE-NAMING** line. A1's doc reading (`interaction-approval-table.md:135`,
"autonomous-now (doc-authorized self-service)") is not re-litigated here; the
round-6 assessment refuses a third reading of that tension
(`webbridge-revival-assessment.md` §4). A4 stays operator-owned
(`interaction-approval-table.md:138`).

- **D0 record check** — if the record shows a revival already executed (round 9
  or earlier) and/or the `/status` samples already taken: **D-verify only** —
  re-derive state (listener, pid, `/status` key set), re-read the samples against
  the falsifier, confirm the A4 stop debt is named and the port/process sweep
  shows no residue, and land the outstanding distillation/calibration rows. No
  second revival: the experiment is one pass per name; a second pass needs a new
  name (recorded, never inferred). A still-open A4 debt becomes a **named
  post-training operator obligation** in clause Z (the lane cannot discharge it).
- **D1 preconditions** — binary present and executable; port 10086 free
  (measured free at design time); **a browser running** (measured **0** chromium
  processes at this freeze — re-measure at the gate, never assume; a census 0
  makes the handshake datum unobtainable and D-verify-only or D5 the only honest
  outcomes); no config edits, no `config.json`, no systemd unit, no sudo, no
  external network; command `~/.kimi-webbridge/bin/kimi-webbridge start` —
  **`start`, never `restart`** (`operations.md:11-13`; the Do-NOT block `:24-26`
  forbids agent-run `stop`/`restart`/`uninstall` even with the daemon dead).
- **D2 the experiment (only if no record shows it and the grant is recorded)** —
  revive, then sample `/status` at t≈0 / +30 s / +5 min while a browser is
  running. Falsifier, verbatim: `extension_connected:false` at +5 min with the
  browser running ⇒ auto-attach is false for this configuration (extension vs
  daemon as-revived; re-check `version` at revive time). A positive discharges
  U1 (disposition U2) — the frontier's first handshake datum; a negative (or no
  browser) records "revival succeeded, handshake absent" with the reason and
  stops there (no workaround). Either way the as-is field set is recorded at the
  live probe.
- **D3 debts and side effects** — a revived daemon recreates the **A4 debt**:
  only the operator may stop it; the owed stop is named in the round record and
  in clause Z's handoff. Log rotation (`daemon.log` → `.prev`) is a recorded side
  effect. OOM/session durability is untouched by a revival (no unit, no
  autostart) — [inference, strong; the r2 death path].
- **D4 the boundary** — no `/command` POST, no session material (shape-only,
  always), no config edits, no `stop`/`restart`/`uninstall` by the agent, no
  external site (loopback-only). A positive handshake makes the bridge path
  *executable*, not *granted*.
- **D5 if not granted** — record `revival withheld` with the reason; the bridge
  path stays blocked; the decision's ask is the one permitted line, or nothing.
  Carried silence is a recorded state, never an inference of consent.

## Branch G — carried (the answer executes)

Carried from rounds 9/10, condensed; the answer's named set is the authority and
this plan does not widen it.

- **G0 sub-case check** — if the record shows the grant already executed:
  G-verify only (re-derive the note's pins, count `http.log` request lines
  against the granted budget, audit every stop/trip event, confirm the
  zero-session-material statement, land outstanding distillation/calibration
  rows). No second run: the terms are one pass.
- **G1 scope** — the lane's own harness, cold profile, harness-only; read-only
  unless interaction is expressly granted in the same line; exactly the named
  site(s); one pass; no login; session material shape-only.
- **G2 budget** — R3's numbers if granted; else R1's hard-coded default: 1 page ·
  1 cold run · ≤ 20 HTTP requests · ≤ 60 s wall · ≥ 1 s between navigations
  (`operator-approval-request.md:41`). Mechanically checked: request lines in
  `http.log` ≤ budget.
- **G3 probe + stop-and-report** — first request `/robots.txt`; a disallow, or
  the first 429/403/interstitial/CAPTCHA/ToS gate → stop, record, never retry
  through. The refusal is a corpus datum either way; an observed rate/ToS datum
  re-anchors approval-table U1 (§7) by append-only errata.
- **G4 evidence** — the three rungs (screenshot + raw DOMSnapshot; CDP Network
  slice; URL/navigation history) in the 9-item envelope, per-claim anchors,
  determinism class named per artifact, cleanup proof per run; note
  `corpus/knowledge/real-site-observation-<host>.md` with sha pins; one
  **loopback↔external delta** section (protocol/TLS fields, request classes with
  no loopback analogue, header shapes — shape-only).
- **G5 unmovable** — the never-set (consequential external acts; session-material
  content-reads; out-of-province work) is not movable by any grant
  (`PROVINCE.md:15-19`); a granted observation stays non-consequential.
- **G6 the final-round rider** — a grant arriving at this gate is executed with
  the full envelope if the window allows; if it cannot be completed inside the
  round, the unstarted (or partially started, cleaned-up) run is handed off in
  clause Z **as an executable step** — the grant is not wasted by the chain's
  end. Calibration rider as before: the answer, the scope discipline, and the
  first stop-behaviour (if tripped) are the approval table's live exercising —
  before→after recorded in `SCORECARD.md`.

## Branch L — the closing branch (clauses C and Z execute here)

Standing anti-claim fully in force: **no external site**; nothing filed anywhere
except the one permitted line; the packet stays filed; not re-asked by default;
silence is not a denial; loopback only; cleanup verified per run.

- **L0 carried-debt ladder (mechanical)** — execute whatever the record shows
  unlanded, in order, as debt, not as a second move:
  1. **round-6 L1 matrix** (wire-class / cache-revalidation for repeated same-URL
     subresources) — the predicate is on record (`plans/round-6.plan.md` §L1
     `:124-134`); status re-derived (`carried-debt-closure-r8.md` §2 `:63-107`);
     the bytes it consumes are archived (`w6-tabi-b61`).
  2. **round-9's owed non-author re-run** — the matrix note's own §10 SC-2 names
     the gap (no non-author seat has re-run its cells; the r8 VER-B8-1 / AUD-B8
     pattern is the model); its §11 U1–U9 are the residual unknowns (cookie
     lifecycle across a browser restart, cache × cookie freshness scope, token
     expiry / table growth, body modification under the same token, a
     simultaneous cross-client replay race, a two-browser pair, the guard race at
     short holds). Cells ride as debt with their own falsifiers, never as a
     widened claim.
  3. **round-10's own leftovers** — whatever its seats left unlanded, named with
     their falsifiers.
- **The move executes here**: clause C (the clause (c) closure attempt or in-force
  stamp + the archive tranches + the final §Pins refresh) and clause Z (the
  closeout) are the round's work. **No new fixture class is opened in the final
  round** — the loopback scale is the debt ladder plus the archive, not a twelfth
  class. [design decision, recorded]
- **L1 instruments/guards (only if ladder cells execute)** — rounds 6/7/8 lists:
  capture bytes byte-identical across identical-cell reruns, or the divergence
  itself measured and classified; both network surfaces kept (client status ≠
  wire truth); closure per run (kill by PID from the process table, never by
  pattern; ports closed; `curl` exit 7); a loopback 429 (or 409) is never a
  real-server datum.
- **L2 boundary** — lane-authored fixtures only; a mirrored real-site artifact
  stays C3 default-deny.

## Clause C — the last clause (clause (c)), and its witness predicate

The §Pins strictly-later-date pass (`SKILL.md:829`, `:1058`), three states,
mechanical, **instant-based**:

- **closed** — round 10 (or round 11) landed a dated in-repo block whose
  **commit instant** is ≥ **2026-10-15T00:00:00Z**: print `date -u +"%F %T Z"`;
  for the witness commit print `git show -s --format='%H %cI %ct' <commit>`
  **and** `TZ=UTC git show -s --format=%cd --date=iso-strict <commit>`; the
  offset-bearing `%cI` may read `2026-10-14T21:0x:xx-03:00` while the **instant**
  is already 2026-10-15T00:0xZ — both are printed, and the **instant decides**.
  (This sentence is this plan's disambiguation of the earlier phrasing "a commit
  date ≥ 2026-10-15", which left the offset implicit; it is a design decision,
  recorded.) Then re-derive the refresh list and record the match count, and
  re-bind the declared-stale pins (the `archive-receipt-r8` pin at `:963`/`:1024`;
  the stateful-note pin at `:971`).
- **executable** — no witness yet and `date -u +%F` ≥ 2026-10-15: execute the
  pass this round (dated block + commit; the clause closes only when date +
  match count + witness are on record; same-day re-derivations do not close it).
- **in force** — the date has not moved by the round's last measured stamp:
  **stamp with the date, print the unblock command, carry into clause Z**; never
  fail it, never claim it.

The refresh list is re-derived, not inherited: the note set as it stands at gate
time (**20** at design time), the reports r4–r10 (r9 `df34bf6c63e1…` / 174 at
this read; r10's by then), the 3 substrate pins (`e70aff5c40ff` / `84a8e69d04c5`
/ `b811d9c23dfd` — all matched at this read), and the current `SKILL.md`
revision (`c07d29c3e8d1…` / 1189 at design time); the gate prints the count it
asserts. A mismatch is a freshness finding (append-only errata), never a silent
repair.

**Unblock recipe (verbatim, for clause Z §7).** After 2026-10-15T00:00Z, run the
same set (`sha256sum` over the notes, the reports and the three substrate files;
`wc -l`), append the dated block to `SKILL.md` as a new §Errata section
(append-only; pre-append sha in the block header), commit it with lane identity,
and record `git show -s --format='%H %cI %ct'` for that commit plus
`TZ=UTC git show -s --format=%cd --date=iso-strict` — the clause closes on that
commit's instant and the printed match count.

**Final-round honesty rule.** If the training window ends before 21:00 -03 on
2026-10-14, clause (c) ends **in force**: the round-5 four-clause claim closes
**3/4** with the fourth clause named as structurally time-blocked inside the
training window, and clause Z's handoff carries the one-command unblock above.
The record never claims the clause closed on a same-day witness.

## Clause Z — the closeout (the round's deliverable)

**Output (candidate path):** `corpus/knowledge/training-closeout.md`. If
`ten-round-synthesis.md` exists at the gate, the closeout **cites it row-by-row
and adds only the delta** (the lane-round-11 row, the training-round index, the
terminal sections); if it does not, the closeout is the full index. One artifact,
one admission decision, recorded either way. The admission decision is the seat's
against `corpus/QUALITY.md:1-8` and `CORPUS.md:33-46`
(count-carries-command, negative-claims-carry-sweeps,
quote-names-location, index-row-only-when-the-file-exists, no credential
material, corrections-are-new-entries). If admission fails, the seat records the
rejection in `corpus/lessons/round-11.md`'s Gate and lands the same rows as the
round's closing record artifact; the rejection is kept (`QUALITY.md:5`), never
silently dropped. Header per `CORPUS.md:17-19`: `source:`, `verified-at:`,
`recheck:`.

**Method**: re-derive, never inherit — every cell re-computed at execution from
the in-repo records; this plan supplies no row values and no row may cite this
plan. Authority list (re-read at execution): `LOG.md` round entries (r1 `:5-28`,
r2 `:29-75`, r3 `:76-130`, r4–r9 `:131-136`); `SCORECARD.md` move-log rows 1–3
(`:68-71`) and 4–9 (`:83-88`) plus the r1–r3 verdict tables (`:18`/`:26`/`:38`);
the lessons' `## Gate` blocks (`corpus/lessons/round-1..11.md`); the round plans
and record drafts (`plans/round-{2..10}.plan.md`,
`plans/round-{4..10}-record-draft.md`); the note pins (the §Pins table + the
round-5/6/7/8/9 append blocks); `reports/` r4–r11; the fleet's per-round ledger
(`MANIFEST.json` tabi entries — r8 `:2123`, r9 `:2179` at this read) and the
fleet closeout commits (`b5a9723`, `c272828`); the commit walk
(`git log --oneline` + `git show --stat <commit>` per round).

**Mandatory content** (each row falsifiable; observation / inference / unknown
separated):

1. **Round index (lane rounds 1–11; the training mapping named)** — one row per
   round: axis move(s) + claim (cited); branch taken (G/D/L/none); landed
   artifacts with pins (file + sha first-12 + `wc -l`); the three trend verdicts
   with their source; the commit. The header names the mapping (training rN =
   lane round N+1) and the fleet-side evidence for it (MANIFEST entries +
   closeout commits, header block).
2. **Axes trajectory** — before→after per move, each with its counting command;
   the r4–r11 verdicts and any saturation/retire decision with reason
   (`AXES.md:27-31`). The closeout's table and the refreshed `SCORECARD.md` axes
   table must agree cell-for-cell; a disagreement is a finding, not a silent
   pick.
3. **Debt ledger** — every carried item across eleven rounds, status ∈
   {closed-by-landing, closed-by-erratum, open-now, retired-as-residue}, each
   with its closing surface and the command that shows it. The open-now set must
   equal section 6's non-retired rows exactly; every retirement names its reason.
4. **Operator-status arc** — the r5 filing (`:25`, packet `94dc63f5fb9e…`); the
   per-round read-backs (count of byte-identical reads); the silence span (filing
   mtime `2026-10-14T17:05:52Z` → the round-11 gate read, both stamped); the
   ask-count; every line this lane ever filed, verbatim; the revival-decision
   history (assessed r6, carried r7, sub-case r8, first-class r9, r10 and r11
   dispositions); the terminal state of an unanswered ask, written plainly.
5. **Never-set + boundary** — the invariant across all rounds (consequential
   external acts; session-material content-reads; out-of-province work;
   `PROVINCE.md:15-19`), with the statement that no grant moves it.
6. **Named residue** — what the eleven rounds did **not** establish, each with
   its naming pin and unblocking condition; at minimum: zero real-site datum
   (approval-gated), rate/ToS U1 (`interaction-approval-table.md` §7), the
   extension↔daemon handshake (`extension_connected:false` throughout), the
   byte-identity environment scoping, real-site POST/redirect/CSRF classes
   (loopback-closed, real-site-open), the round-6 L1 matrix if still open,
   clause (c) if it ends in force, the daemon/A4 operator obligations if a
   revival ever happened, and the **non-author re-run odometer** (which rounds'
   evidence has, and has not, had an independent re-run — the r8/r9 pattern).
7. **Post-training handoff** — the exact command block a future reader runs to
   (i) re-read the L0 and classify, (ii) execute the clause (c) pass if still in
   force (the recipe above), (iii) verify the archive (`cd corpus/evidence/<g>
   && sha256sum -c MANIFEST.txt` spot; the census commands
   `ls -d corpus/evidence/*/ | wc -l`, `find corpus/evidence -name MANIFEST.txt |
   wc -l`), (iv) re-run the standing Brave reject
   (`ls -A ~/.config/BraveSoftware/Brave-Browser/` → expect
   `NativeMessagingHosts` only), (v) run the loopback ladder's next cells in
   residue order; plus the `SHONEN.md` promotion state (boxes + named verifiers)
   and a `PROVINCE.md` accuracy re-check (`AXES.md:11` — does PROVINCE still
   list every owned surface).
8. **Closing statement** — every remaining obligation is either landed or named
   with its closing surface; the training chain's end is stated; nothing
   presumes a round 12.

**Riders**: SHONEN re-check; PROVINCE accuracy; the fleet-level report item (tabi
absent from the watchdog `LANES` roster, `scripts/shokunin-watchdog.sh:14` —
reported, not absorbed, carried from r5; the fleet's own closeout is the protocol
lane's work); the SKILL final distillation (a round-11 §Errata append: the
terminal table + the closeout pointer, citing the note's pin); lessons
`round-9.md` (if wave 10 did not land it) + `round-10.md` + `round-11.md` — the
lane's own Gate landed by the lane, not deferred.

**Size cap**: the note must stay re-derivable — every row carries its citation;
if the row count would push the note past what a cold reader can re-run, split
rows, never drop citations.

## Measure (mechanical; branch-dependent)

- C: the clause (c) state (closed / executable-executed / in force) with the
  date, the witness commit and its `%cI` + `%ct` + UTC rendering, and the match
  count; the archive tranches' counts (groups added, files, bytes, manifest
  self-check result, receipt pin) with spot re-hash ≥ 3 groups vs the owning
  notes' pins; every remaining `/tmp` group either archived or named with its
  reason; the §Pins re-derivation date + match count; the final census
  (groups / manifests / files / bytes) printed with its commands.
- Z: closeout rows complete vs planned; every row's citation resolves (the
  verifier's spot ≥ 3 rows + ≥ 1 negative claim's sweep re-run); the debt
  ledger's open-now set equals the residue set; the operator arc's span math
  printed; the admission decision (admitted / rejected-kept) recorded; the
  r10-synthesis agreement check (if it exists) with its outcome.
- Both: operator-status classification + revival-decision disposition + line
  decision with budget arithmetic, all recorded verbatim with the read-back
  before any act; the round's notes land with coverage rows (`corpus/README.md`,
  header counts re-derived first) and the SKILL distillation; LOG entry + commit
  (lane identity); standing Brave reject re-run → `NativeMessagingHosts` only,
  count re-derived from the record; packet cold-read verdict present-or-named;
  `ls -A corpus/lessons | wc -l` and each missing file named; the **closing
  statement** (clause Z §8) — every remaining obligation landed or named with its
  closing surface, and nothing in the record presuming a round 12.

## Seats + write scopes (slots; wave lead assigns)

- gate + record — one seat: Step 0, operator-status classification, the
  revival-decision disposition, the line decision, branch record, precondition
  sweep.
- move seat (clause C) — clause (c) final state + the archive tranches + the
  receipts (r5/r8 pattern) + the final §Pins refresh (incl. the declared-stale
  pins).
- closeout seat (clause Z) + a non-author verifier (rows complete; ≥ 3 row
  citations re-resolved; ≥ 1 negative claim's sweep re-run; the debt ledger ↔
  residue-set equality; the r10-synthesis agreement check).
- record-debt seat — README header + coverage rows 4–11; SCORECARD r4–r11
  verdicts + axes refresh + move-log placement; lessons round-9/10/11; the packet
  cold-read test (its own §6 falsifier) and the pin-block decision; the SKILL
  final append — ordinary record work, named so it stops riding silently.
- D seats (revival + verifier) and G seats (observation + grant-discipline
  verifier) only if their branch fires.
- verification + outside spot-check (non-author, `LEARNING.md:37-43`) + scribe
  (LOG/SCORECARD/README/commit). Write scope per seat; `.ufo/l0-questions.md` is
  touched by no lane this round except the one permitted line, only if (a)–(d)
  of the line rule all hold (count recorded).

## Bounds & unknowns

- [unknown] What round 10 landed (in flight at freeze): its clause-F tranche +
  receipt, its clause-S synthesis, its branch classification, its line decision,
  its note. The gate reads the record and executes what is missing.
- [unknown] Whether any answer arrives by the final gate — its form and timing;
  the plan assumes none and executes nothing absent a recorded read-back.
- [unknown, observation-backed] The date: at the freeze `date -u +%F` →
  2026-10-14; the flip is 21:00 -03 (= 2026-10-15T00:00Z), ≈ 3 h 05 m after the
  freeze read. If this round's own window does not cross it, clause (c) ends in
  force — a recorded state with the unblock recipe, not a failure and not a
  closure.
- [unknown] Whether a browser is running at the final gate — `pgrep -c chromium`
  → **0** at this freeze (19 at r9's reads). Branch D could not produce the
  handshake datum without one; a census 0 at the gate makes D-verify-only or D5
  the only honest outcomes. Re-measure, never assume.
- [unknown] Whether the r8 tranche's `/tmp` bytes survive to this round (two
  waves old); the note's §11 already names the one revision that cannot be
  restored. Same class for the r9 tranche while its archive settles — after this
  round the archive, not `/tmp`, is the authority.
- [unknown] Whether the packet cold-read test passes on the first attempt (its
  own §6); a follow-up question is a recorded gap, not a failed round.
- [unknown] The README/SCORECARD final-refresh content — depends on the records
  as landed; the seats re-derive, never inherit from this plan.
- [inference, strong] The closeout is the right final deliverable: eleven rounds
  of records are fragmented across four files with a documented one-wave-late
  lag, the r7 synthesis precedent shows a synthesis note clearing admission, and
  the fleet counters (MANIFEST entries + closeout commits) make the chain's end
  a dated fact rather than a plan's guess; if the note fails admission, the
  fallback (record artifact + kept rejection) carries the same rows with the
  failure recorded.
- [inference, medium] Freshness remains the right move: the r1-pinned axes table
  records it lowest (3) and clause (c) is its one open clause; if the axes
  refresh reads differently, the record states the divergence — the move's
  content (clause (c) + archive + closeout) is invariant.
- [unknown] Whether the chain is genuinely ten training rounds as the counters
  read, or whether the fleet extends again (the r10 plan's premise was already
  contradicted once); the closeout is written to stay honest either way — the
  "nothing presumes a round 12" rule binds this record, not the fleet's.
- Fleet-level, reported not absorbed: tabi outside the watchdog `LANES` roster
  (carried from r5); the fleet closeout entries are other lanes' work.
- New evidence bytes are `/tmp`-staged until the archive pass lands; every new
  hash is provisional (archive obligation `cdp-evidence-patterns.md` §5 :92).

## Discipline (round 11)

Substrates read-only; secrets/session material shape-only, never content-read;
the revival act only under a recorded BRIDGE-NAMING read-back and always without
`stop`/`restart`/`uninstall`; Branch L loopback-only with cleanup verified per
run; Branch G only inside the recorded answer, terms-capped, stop-and-report;
one move (clauses C/Z/B); append-only errata; observation / inference / unknown
separated (`corpus/QUALITY.md`); no external site absent a read-back that names
it; the closeout writes only in-repo citations; write scope for this design lane:
`plans/round-11.plan.md` only (PREP-B11); the round's seats write per their
assignments; the lane's final artifact set is named by clause Z §8 before the
commit.

## Post-freeze observation (append-only; added at write by PREP-B11)

The design read above ran while round-10 execution was in flight. These facts
were measured in the same window and are **not** part of the main freeze; the
round-11 gate re-derives every count by command rather than trusting this block.

- **The round-9 archive tranche landed during this write window** (round 10's
  clause F in progress): `corpus/evidence/w9-tabi-b91/` — untracked,
  `MANIFEST.txt` present, **270 files / 1,096,027 B** at 20:53Z; the group census
  moved **35 → 36** and the file census **1,451 → 1,721**. The manifest was
  young at the read; the receipt pin, the manifest self-check and the note's
  pin re-binding are round 10's (or this round's) to produce. One observation
  for the archive seat, not a finding: the group holds a `__pycache__/`
  directory.
- **Round-10 seats were live**: `/tmp/w10-tabi-b104/poll.sh` + `poll.log` (rows
  20:51:11–20:53:11Z, every row `no-synth` — clause S had not landed by the last
  row); `/tmp/w10-t10-1/` (a sibling lane's harness scratch: `ledger-copy.md`,
  `pin-read*.txt`, `regression/`, `selftest.log`, `falsifier/`) — shapes only,
  not read as work.
- `git status --short` at 20:55:14Z showed exactly one entry —
  `?? corpus/evidence/w9-tabi-b91/`; HEAD `ad735dd` throughout this lane's
  window (no commit by this lane).
- **The round-10 plan's own premise, as its header states it** (`:8-11`), is
  contradicted by the fleet counters recorded in this plan's header block; both
  texts stand as written. This plan leaves that divergence for the record to
  carry, not to harmonize.
- This lane's total footprint: this file (created) and read-only measurements —
  **no scratch directory was created by PREP-B11**.
- This file's own closing fingerprint cannot be stated (a writing lane cannot
  hash its own tail); the round-11 gate takes the committed revision's sha from
  `git show`.

**E1 — 2026-10-14T20:56Z, by PREP-B11 (post-write landings; append-only).**
Two round-10 artifacts landed after the block above, both untracked at this
stamp:

- **Round 10's clause-S synthesis landed — under a path other than the one the
  round-10 plan named.** Read clause Z's Step-0 (c) and its "if
  `ten-round-synthesis.md` exists" condition as *"the round-10 synthesis
  artifact, whatever path it landed under"*: observed at 20:56Z,
  `corpus/knowledge/arc-synthesis.md` — 183 `wc -l` / 25,125 B / sha256
  `f42428bd9af7…`, lane **B10-1**, header line *"round 10 (2026-10-14), lane
  B10-1 … the 10-round synthesis — tabi's arc"*; its §0/§3.3 record the evidence
  tree moving inside its own write window. **Z therefore closes by extension**:
  add the lane-round-11 row, the training index and the terminal sections; the
  agreement check of §Measure applies cell-for-cell to this note.
- **This round's intermediate lesson landed:** `corpus/lessons/round-9.md` (277
  `wc -l`) — wave 10's one-wave-late lesson, untracked at this stamp; the
  Step-0 (f) expectation is met by landing for it, and `round-10.md` +
  `round-11.md` remain this round's own to land.
- Counts moved with them: knowledge **21** notes / **6,621** lines (was 20 /
  6,438 in the freeze block); lessons **9**; evidence still **36** groups (the
  `w9-tabi-b91` group unchanged at 270 files through 20:56Z). `git status
  --short` at 20:56Z: four untracked entries — `corpus/evidence/w9-tabi-b91/`,
  `corpus/knowledge/arc-synthesis.md`, `corpus/lessons/round-9.md`, and this
  file. Every value above is as-of-stamp; the gate re-derives.