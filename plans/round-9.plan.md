# WWKD plan — tabi round 9 (ufo-round-plan-v1)

Design lane: **PREP-B9** (2026-10-14, round-8 wave, 32 lanes; round-8 execution
**in flight** at design time — the wave's first artifacts landed before this
file; see the closing observation block). Write scope: this file only.
Design-time state read by this lane by command across **2026-10-14T19:09–19:12Z**
(freeze stamp 19:12:29Z); the values below are the read-time values — nothing in
them is taken from the record:

- HEAD `b377007877be2d104cc9e3a73de56cf81a24ab0d` ("probation round 7 (training
  r6): see LOG", 16:06:31 -03); `git status --short` → **0** entries (clean tree).
- Operator channel: `.ufo/l0-questions.md` **25** lines / **21,539** B / sha256
  `02c53ec60acf…` / mtime `2026-10-14 14:05:52.482908587 -03`; exactly one
  `tabi` line (`:25` — the round-5 filing, packet sha `94dc63f5fb9e…`); **no
  answer, no denial, no edit**; ask-count 1. Byte-identical to the filing state
  every earlier read recorded.
- Corpus: `corpus/knowledge/` **17** notes / **5,019** lines (`ls … | wc -l`;
  `wc -l … | tail -1`); `corpus/evidence/` **35** groups / **35**
  `MANIFEST.txt` / 1,451 files / 9,222,920 B (`find … -type f | wc -l`;
  `du -sb` — equal to `archive-receipt-r8.md` §1 to the byte); `corpus/lessons/`
  **5** files (`round-1..5.md`; shas `bdd46c85b349` / `a862d69cb0b9` /
  `153a1b9831bb` / `cde3960eb1a9` / `46029f48e27d`); `reports/` r4
  `5f44b0f94483` · r5 `d09f1712cbcf` · r6 `9428ddec52b9` · r7 **`ea4b16a4a844`**
  (new since round-8's design read).
- New since round-8's design freeze (14→17 notes): `archive-receipt-r8.md`
  `0587605db913` (191 lines) · `layer-routing-synthesis.md` `7725ee421716` ·
  `packet-readiness-r7.md` `7185642c2e41`. `SKILL.md` at **945** `wc -l` /
  sha256 `8874306672b6…` (round-7's distillation: round-6 pins inline `:323` /
  pointer `:584`, r7 block `:836`, §Pins errata `:807`; the TIME-GATED clause
  (c) line has moved to `:829`).
- Daemon: no listener on 10086 (`ss -ltn` → 0 matches), no process (`pgrep -x
  kimi-webbridge` → none); pointer files stale (`daemon.pid` 8 B, `daemon.addr`
  16 B, mtime 10:46 — the recorded post-shutdown pattern); `identity.json`
  (36 B, mode 600) and `logs/` **shape-only, never content-read**.
- Browser side **live**: `pgrep -c chromium` → 15 (process census only; no
  profile content read). Standing Brave reject re-run: `ls -A
  ~/.config/BraveSoftware/Brave-Browser/` → `NativeMessagingHosts` only →
  agree (the consecutive count is re-derived from the record at the gate).
- Round 7's record: `plans/round-7-record-draft.md` 349 lines / `8aac0ae24216`;
  its pivot note (`:20-22`) classifies **no answer → Branch L**; its
  verification table (`:118`) records round-6's L1 matrix **IN FLIGHT / NOT
  LANDED** at round-7 record time. Round-8's record does not exist yet.
- Known record debt (design-time; named, not repaired here): `corpus/README.md`
  header `:5-9` still says "Held at round 3 … 8 notes, 1944 lines … Lessons: 0"
  (actual **17 / 5,019 / 5**) and its coverage rows stop at round 3; its
  Frontier block `:41-52` still counts "thirteen `/tmp` evidence groups" (35
  archived); `SCORECARD.md` primary-verdict tables exist for r1–r3 only
  (`:18`, `:26`, `:38`), its axes table `:55-62` is r1–r3 stamped (depth 7,
  coverage 5, operability 5, freshness 3, calibration 6, adjacency 5), and its
  move-log rows 4–7 sit at `:83-86` under "## Planned / retired" (`:73`);
  lessons stop at `round-5.md` (the one-wave-late pattern predicts homes for
  `round-6.md`/`round-7.md`/`round-8.md`); the §Pins errata block (`:807`)
  predates the round-6/7 notes (their pins live inline `:323` / `:836`); the
  packet cold-read verdict is still `[unknown]`
  (`corpus/handoffs/operator-approval-request.md:100`).
- Every hash in this plan is provisional until the archive keeps pace
  (`cdp-evidence-patterns.md` §5 :92); the round-8 tranche's receipt landed
  but its own pins are subject to the same rule.

## Why this move (candidate decision)

Axes as recorded at design time (`SCORECARD.md:55-62`; r1–r3 stamps + rider
notes; r4–r8 verdicts owed by the record): depth 7, coverage 5, operability 5,
freshness 3 [r2 — round-5 move], calibration 6, adjacency 5. `AXES.md:23-31`:
work the trend furthest behind; one axis-move per round. Three threads decide
round 9, and the assignment names the second:

1. **Operator status — unchanged for a fifth consecutive read.** The R1–R3
   packet has been filed since round 5 and is still unanswered at freeze; the
   frontier's top rung (real-site observation) remains gated on it. Round 9
   must again be executable both ways and must record which way it read.
2. **The daemon revival decision — now a first-class branch, not a sub-case.**
   Round 6 assessed revival and did not execute it (operator-owned scope);
   round 7's Branch D waited on an approval that never came; round 8 folded the
   path into a bridge sub-case. The assignment says the decision *may be
   answerable by then*: by round 9 either a BRIDGE-NAMING line exists (execute
   the precondition-surface experiment), or the revival has been explicitly
   declined (record and close), or the question is still unasked — in which
   case the round-5 filing's own deferral ("A4 … moot"; "C5/A5 … separate later
   packet", `operator-approval-request.md:65`, `:64`) must be either carried
   honestly or converted into **one** properly-scoped line (the later packet
   the filing itself promised), never a re-send of the old ask. The browser
   side is live at design time (§ above) — the experiment's precondition is
   present for the first time since round 2.
3. **The freshness clause (c)** — the last clause of the round-5 four-clause
   claim — is executable the moment `date -u +%F` ≥ 2026-10-15 (i.e. from
   2026-10-14 21:00 -03). Round 8 may already have executed it; round 9 either
   re-derives-and-holds or executes it. Freshness is the lane's lowest axis (3).

**Claim (one axis-move, operator-status-branched, revival-decision-resolving).**
Branch **G** — a recorded grant naming a site/scope: the frontier's top
admissible class under that scope (real-site observation), with the approval
table's first live exercising as the calibration rider. Branch **D** — a
recorded bridge grant/decision: the lane's first precondition-surface
measurement of the daemon↔extension path (revive iff granted, then the
deferred auto-attach experiment), calibration + operability riders. Branch
**L** — no answer (or a denial/decline): the carried loopback debt first, then
the round's own class — **the stateful client across runs** (cookie/token
lifecycle and the cold-run replay contract of a state-changing step). Both
branches carry the freshness rider. At most one branch executes; D executes
only inside the recorded decision's own terms. [design decision, recorded]

## Operator status — both branches (measured; never inferred)

The operator status has exactly one measurement surface: `.ufo/l0-questions.md`
content (answers arrive by in-place edit, `MISSION.md:84-88`); operator presence
is never itself a grant channel. The gate classifies, records verbatim, and the
branch follows mechanically:

| Status (gate read) | Meaning | Branch |
|---|---|---|
| **ANSWERED-SCOPED** | a new/edited line names ≥1 of R1/R2/R3 with a scope (site and/or budget) | **G** — execute exactly the named set; default-deny on everything unnamed |
| **ANSWERED-SCOPE-LESS** | approval without a scope (e.g. a bare "yes") | **neither** — recorded as not-a-grant; at most one clarification line may be filed (counted); nothing executes until a scope is named; inference never supplies a scope |
| **DENIED** | explicit refusal of the site classes | recorded verbatim as a calibration datum → **L**; no re-ask on the same ask |
| **BRIDGE-NAMING** | a line (volunteered or appended) approving the bridge path / daemon revival | **D** — revival as the named precondition surface, terms-capped; a site grant arriving in the same line still routes to G for that part only |
| **BRIDGE-DECLINED** | a line explicitly withholding the revival / the bridge path | recorded verbatim → **D closed** (never re-asked, never revived); → **L** for the round's move |
| **SILENT** | no diff vs the round-5 filing (sha + line count + mtime byte-identical) | **L** — silence is not a denial; the revival decision is **carried unasked by default** (see the line rule) |

Both branches: (i) the read-back (line + sha, before/after counts, mtime) enters
the round record **before** any external request or daemon act; (ii) a mid-round
answer may be acted on only inside its stated scope, after its own read-back —
the record must show read-back-before-act; (iii) **the round does not exit
without a recorded status classification and a recorded revival-decision
disposition** (round 9's standing rule, every branch); (iv) Branch G needs no
operator presence during the run (harness-only, no login, observation only); a
scope that would need the operator at the browser (C5) is out of scope by
construction and recorded as such; (v) **the line budget is read from the
record, not from this plan.** The round-5 filing deferred A4/bridge and C5/A5
to "separate later packets" (`:64-65`); round 9 permits **at most one** new
line — the **A4/bridge decision line** (a decision request: revive now under
the assessment's checklist, or withhold) — and only if (a) the file still shows
exactly one `tabi` line, (b) the gate names the material change against the
round-5 filing in writing (candidates: the round-6 assessment's checklist now
complete and pinned, the fixture v2 stop-rule landed, the archive tranche
complete making the packet's cold-read verdict executable), and (c) the line is
a *new class*, never a re-send or paraphrase of R1/R2/R3. A verbatim repeat
remains banned; a second line filed by an earlier round spends the budget and
round 9 files nothing. The ask-count is printed either way.

## Step 0 — the gate (mechanical; recorded verbatim before any act)

1. Read `.ufo/l0-questions.md` whole; record `sha256sum`, `wc -l`, `wc -c`,
   mtime, and every `tabi`-matching region verbatim; count the `tabi` lines
   (the line budget = 2 − count, floor 0). Compare against the **round-8 gate
   record**; if no round-8 gate record is findable, the comparison base is the
   round-7 record's read-back (`plans/round-7-record-draft.md:17-24`) and the
   comparison is stamped as such.
2. Classify into the table above; the branch follows mechanically. Record the
   **revival-decision disposition** in the same block: `executed-verify` /
   `granted-to-execute` / `declined` / `carried-unasked` / `line-filed`, with
   the reason.
3. The read-back enters the round record before any act (both branches).
4. Precondition sweep — one check per round-8 clause; an unlanded clause is
   carried as named debt, repaired only if the chosen branch depends on it:
   - (a) **gate record**: round-8's Step-0 read-back and branch classification
     findable in the round-8 record.
   - (b) **branch execution**: G — the answer/refusal datum, request count ≤
     budget, every stop/trip event with its evidence line, U1
     present-or-absent, zero session-material reads; D — pre-state shapes,
     `/status` field set (the 9-key finding resolved on the live probe), the
     t≈0/+30 s/+5 min samples with the falsifier verdict, the A4 stop debt
     named, port/process sweep proving no residue; L — matrix verdict counts,
     cells complete vs planned, closure lines per run, rules added, every
     falsifier field filled.
   - (c) **freshness**: the §Pins strictly-later-date pass — if round 8 landed
     it (dated in-repo block + commit ≥ 2026-10-15), re-derive and hold; else
     execute iff `date -u +%F` ≥ 2026-10-15; else record in force with the date
     stamped (carry, never fail).
   - (d) **record + hygiene**: the round's note + coverage row
     (`corpus/README.md`, header counts re-derived first) + SKILL distillation;
     LOG entry + commit (lane identity, `AGENTS.md:3`); lessons count → **8**
     (`round-1..8.md`) if the one-wave-late pattern holds, else each missing
     file named — `round-6.md`, `round-7.md`, `round-8.md` are the candidates
     at design time; archive present (35 groups / 35 manifests) with spot
     re-hash ≥3 groups against the owning notes' pins (a mismatch is a
     freshness finding — append-only, never quietly repaired); packet
     `/tmp`-free + the L0 filing line; standing Brave reject re-run →
     `NativeMessagingHosts` only, agree or the disagreement recorded, with the
     consecutive count **re-derived from the record** (the gate prints the
     count it asserts).
   - Carried debts to land as ordinary record work if the branch does not
     depend on them: packet cold-read verdict (its own §6 falsifier,
     `operator-approval-request.md:92-100`; status line still `[unknown]`);
     README header + coverage rows rounds 4–8; SCORECARD r4–r8 primary-verdict
     tables, axes refresh, move-log placement; the round-8 records' archive
     tranche with a receipt in the r5/r8 pattern.

## Branch D — the revival decision (the round-9 pivot)

Authority: the revival act is agent-runnable only under a recorded
**BRIDGE-NAMING** line. A1's doc reading (`interaction-approval-table.md:135`,
"autonomous-now (doc-authorized self-service)") is **not** re-litigated here —
the round-6 assessment (`webbridge-revival-assessment.md` §4 :169-172) refuses a
third reading of the A1 tension, and this plan takes none; the wave-scope
question returns to the operator with the decision line above, or D does not
execute. A4 stays operator-owned (`interaction-approval-table.md:138`).

- **D0 record check** — if the record shows a revival already executed (round-8
  or earlier) and/or the U2 samples already taken: **D-verify only** — re-derive
  state (listener, pid, `/status` key set), re-read the samples against the
  falsifier, confirm the A4 stop debt is named and the port/process sweep shows
  no residue, and land the outstanding distillation/calibration rows. No second
  revival: the experiment is one pass per name, and a second pass needs a new
  name (recorded, never inferred).
- **D1 preconditions (checklist, §4 :137-181)** — binary present and
  executable; port 10086 free (measured free at design time); no config edits,
  no `config.json`, no systemd unit, no sudo, no external network; command
  `~/.kimi-webbridge/bin/kimi-webbridge start` — **`start`, never `restart`**
  (`operations.md:26` forbids agent-run restart even with the daemon dead).
- **D2 the experiment (if no record shows it)** — revive, then sample `/status`
  at t≈0 / +30 s / +5 min while a browser is running (live at design time;
  re-check at round-9 gate time — the browser must be measured, not assumed).
  Falsifier, verbatim: `extension_connected:false` at +5 min with the browser
  running ⇒ auto-attach is false for this configuration (extension `2.0.23` vs
  daemon as-revived; re-check `version` at revive time). A positive discharges
  U1 (disposition U2) — the frontier's first handshake datum; a negative (or
  no browser) records "revival succeeded, handshake absent" with the reason and
  stops there (no workaround). Either way the as-is field set is recorded at
  the live probe, resolving the "8-field" undercount finding (§6) and U4.
- **D3 debts and side effects** — a revived daemon recreates the **A4 debt**:
  only the operator may stop it (`operations.md:26`; A2 :136); the owed stop is
  named in the round record. Log rotation (`daemon.log` → `.prev`) is a
  recorded side effect, never a loss this lane judges. OOM/session-event
  durability is untouched by a revival (no unit, no autostart) — [inference,
  strong; the r2 death path, §2].
- **D4 the boundary** — no `/command` POST, no session material (shape-only,
  always), no config edits, no `stop`/`restart`/`uninstall` by the agent, no
  external site (the daemon experiment is loopback-only). The preprint of a
  positive handshake makes the bridge path *executable*, not *granted*: no
  observation or interaction follows from it without its own recorded scope.
- **D5 if not granted** — record `revival withheld` with the reason; the bridge
  path stays blocked; the decision's ask is the one line above, or nothing.
  Carried silence is a recorded state, never an inference of consent.

## Branch G — the answer executes (claim clause G)

Carried from round 8, condensed; the answer's named set is the authority and
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
  **loopback↔external delta** section (protocol/TLS fields, request classes
  with no loopback analogue, header shapes — shape-only).
- **G5 unmovable** — the never-set (consequential external acts;
  session-material content-reads; out-of-province work) is not movable by any
  grant; a granted observation runs only under the class terms and is still
  never consequential (`PROVINCE.md:15-19`).
- Calibration rider: the answer, the scope discipline, and the first
  stop-behaviour (if tripped) are the approval table's first live exercising —
  record before→after in `SCORECARD.md`.

## Branch L — loopback continuation (claim clause L)

Standing anti-claim fully in force: **no external site**; nothing filed
anywhere except the one permitted line; the packet stays filed; not re-asked by
default; silence is not a denial; loopback only; cleanup verified per run.

- **L0 carried-debt check (mechanical)** — execute whatever the record shows
  unlanded, in order, as debt, not as a second move:
  1. round-6 L1 — the wire-class / cache-revalidation matrix for repeated
     same-URL subresources (`async-step-evidence.md` §5 :192-217; its §8
     unknowns :257; `multi-step-journey.md` §5; `reports/r4-aud-tab1.md` §2
     :63-83, §7); round-7's record (`:118`) shows it unlanded at that time —
     round 8's record decides its current status (its carried-debt lane had
     already landed a closure note for this debt by design-read time; see the
     post-freeze block);
  2. round-7 L1 / L2 / L3 — the state-changing step (POST body,
     redirect-after-POST, CSRF-shaped token, non-idempotent replay contract),
     its instruments, its guards (`multi-step-journey.md:224`;
     `operator-approval-request.md:86`);
  3. round-8 L1 — the non-idempotent step under failure, if round 8 did not
     land it.
- **L1 the class (the round's move, iff the debt set is clear)** — **the
  stateful client across runs**: what outlives a run and how a cold client
  re-enters a step that changed state. On the lane's own fixture (v2 `server.py`
  plus the state-changing step's machinery if landed):
  - **cookie/token lifecycle** — a Set-Cookie-shaped response, the value's
    fate across a browser restart in the lane's **own cold profile** (the
    lane's own bytes — never the operator's stores, shape-only always), and
    what the second cold run sees; per-run vs per-profile persistence;
  - **the cold-run replay contract** — a state-changing step executed twice by
    two *independent cold clients*: which layer rejects/accepts, what the token
    binds to (client? run? nothing?), and whether the resource double-applies;
  - **the freshness scope** — `Cache-Control`/`Vary`/`ETag`-shaped interactions
    with a cookie-bearing second request (the cache-revalidation matrix's
    extension to a stateful client, if L0.1 landed it);
  - per cell: which layer decided {wire, client status, token, cookie jar,
    server state}; the **replay contract extended across clients**, not only
    across runs (byte-identity where idempotent; divergence measured and
    classified, never averaged);
  - controlled single-factor matrix; N ≥ 2 cold runs per cell; one factor per
    cell. Deliverable: rules + named residual unknowns + filled falsifiers; a
    negative result lands with the matrix (never a claim by exhaustion).
  - Fallback (mechanical, if L0 shows the step itself unlanded): the step class
    executes first as the carried debt, and the cross-run extension rides it as
    the same round's move — the gate records which reading it took.
- **L2 instruments (only if unlanded)** — round-6/7/8 lists: rate/ToS-shaped
  responses as instruments (a loopback 429 is never a C6 datum — discipline
  written into the note, `external-class-fixture-v2.md` §8); third-party-JS-shaped
  async (late settle, beacon-shaped POST, canceled 404 — its §9 handoff E3);
  v2's open U1 (`redirectCount = 0` cross-origin generalization) as a rider if
  its fixture cells are reused.
- **L3 guards** — capture bytes byte-identical across identical-cell reruns, or
  the divergence itself measured and classified; both network surfaces kept
  (client status ≠ wire truth); closure per run (kill by PID from the process
  table, never by pattern; ports closed; `curl` exit 7).
- **L4 boundary** — lane-authored fixtures only; a mirrored real-site artifact
  stays C3 default-deny (U7 :208-210).

## Freshness rider (both branches) — clause (c) closure

The §Pins strictly-later-date pass (`SKILL.md:829`), three states, mechanical:
**closed** — round 8 landed a dated in-repo block whose commit date is
≥ 2026-10-15 (`git show -s --format=%cI` recorded): round 9 re-derives the
values, records the match count, and holds (the pass is not re-run as a new
claim); **executable** — no such witness yet and `date -u +%F` ≥ 2026-10-15:
execute the pass this round (dated block + commit; the clause closes only when
date + match count + witness are on record; same-day re-derivations do not
close it); **in force** — the date has not moved (impossible for a round-9 run
on 2026-10-15+, possible only if this plan is consumed by a same-day rerun):
stamp and carry. The refresh list is re-derived, not inherited: the note set as
it stands at gate time (17 at design time), the reports r4–r7 (+r8 if landed),
the 3 substrate pins (`e70aff5c40ff` / `84a8e69d04c5` / `b811d9c23dfd`), and
the current `SKILL.md` revision (`8874306672b6…` at design time); the gate
prints the count it asserts. A mismatch is a freshness finding (append-only
errata), never a silent repair. The block's own staleness is a finding: the
§Pins errata (`:807`) predates the round-6/7 notes (pins inline `:323` /
`:836`); the record states whether the refresh folds them into the block.

## Measure (mechanical; branch-dependent)

- D: revival decision disposition recorded with its reason; pre-state shapes;
  the three `/status` samples (or the verify-mode re-derivation); the falsifier
  verdict verbatim; the live key set (the 9-vs-8 count); A4 stop debt named;
  port/process sweep; zero session-material reads (shape-only list); the
  calibration rider if the probe produced the first bridge-path datum.
- G: answer region recorded with sha + line numbers and pre/post counts; the
  execution-vs-verify sub-case named; `http.log` request count ≤ granted budget;
  every stop/trip event with its evidence line; note sha pins; U1 datum
  present-or-absent; zero session-material reads; the calibration rider
  before→after.
- L: compare-table verdict counts over the matrix cells; cells complete vs
  planned; byte-identity row count; closure lines per run; rules added; every
  falsifier field filled; the replay contract stated for the stateful client
  across runs; the operator-status datum (silence span from the filing mtime
  2026-10-14 14:05:52 -03 → round start; ask-count; the line decision
  recorded).
- Both: operator-status classification + revival-decision disposition recorded
  verbatim with the read-back before any act; `ls -A corpus/lessons | wc -l` →
  8 (or each missing file named); §Pins re-derivation date + match count
  (clause (c) status: closed / executable-executed / in force); the new note
  lands with a coverage row (`corpus/README.md`, its header counts re-derived —
  a stale header recorded as a finding first) and SKILL distillation; LOG entry
  + commit (lane identity); standing Brave reject re-run → `NativeMessagingHosts`
  only, agree or disagreement recorded, count re-derived from the record;
  archive spot ≥3 groups against owning-note pins; packet cold-read verdict
  present-or-named-debt; ask-count and line budget printed (2 − tabi-line count).

## Seats + write scopes (slots; wave lead assigns)

- gate + record — one seat: Step 0, operator-status classification, the
  revival-decision disposition, branch record, precondition sweep.
- D: the revival seat + a verifier (non-author: pre/post shapes, `/status` key
  set, the sample timestamps, the stop-leg refusal, the A4 debt naming).
- G: the observation seat + a grant-discipline verifier (non-author: budget
  count from the logs, stop-rule audit); G-verify only → one verifier seat.
- L: the matrix seat + the fixture seat (only if new fixture bytes are needed).
- freshness/debt seat — clause (c) rider (closed → hold; executable → execute
  with witness) + archive tranche + receipt if new groups land.
- record-debt seat (README/SCORECARD/lessons) — ordinary record work, named so
  it stops riding silently.
- verification + outside spot-check (non-author, `LEARNING.md:37-43`) + scribe
  (LOG/SCORECARD/README, commit). Write scope per seat; `.ufo/l0-questions.md`
  is touched by no lane this round except the one permitted decision line, only
  if the gate's material-change test passes and the line budget allows (count
  recorded).

## Bounds & unknowns

- [unknown] Whether any answer arrives by round 9 — its form (grant / denial /
  partial / bridge-naming / bridge-declined) and timing; the plan assumes none
  and executes nothing absent a recorded read-back.
- [unknown] Whether the revival decision is answerable at all: the round-5
  filing did not ask it (`:64-65`), so "answerable" requires either a
  volunteered line or the round's own decision line passing the material-change
  test; a withheld decision is a recorded state, not a failure.
- [unknown, observation-backed] The date: clause (c) is closed only by a dated
  witness ≥ 2026-10-15; at design time none exists and the pass is still
  TIME-GATED (`SKILL.md:829`).
- [unknown] What round 8 landed (in flight at freeze): the L0 debt ladder, the
  note count, the lesson files, clause (c) — the gate reads the record and
  executes what is missing.
- [unknown] Whether a browser carrying the extension is running at round-9 time
  (the D2 experiment's precondition; live at design time — process census only).
- [inference, medium] The stateful client across runs is the right next loopback
  class because the step classes (round-7/8) leave the cross-run question
  unasked, the cache-revalidation matrix (round-6 L1) is its same-shape
  ancestor, and the corpus's own honest gaps name POST/redirect/CSRF-shaped
  submits as untested by rule; if the matrix resists, the negative result is
  still the class's first mechanism datum.
- [unknown] README header counts, SCORECARD r4–r8 verdict tables/axes, the
  packet cold-read verdict, lessons round-6/7/8 — all owed at design time;
  whether round 8 lands them (its record will say).
- Fleet-level, reported not absorbed: tabi is still outside the watchdog
  `LANES` roster (carried from r5); not this lane's file.
- New evidence bytes are `/tmp`-staged until an archive pass lands; every new
  hash is provisional (archive obligation `cdp-evidence-patterns.md` §5 :92).

## Discipline (round 9)

Substrates read-only; secrets/session material shape-only, never content-read;
the revival act only under a recorded BRIDGE-NAMING read-back and always
without `stop`/`restart`/`uninstall`; Branch L loopback-only with cleanup
verified per run; Branch G only inside the recorded answer, terms-capped,
stop-and-report; one axis-move; append-only errata; observation / inference /
unknown separated (`corpus/QUALITY.md`); no external site absent a read-back
that names it; write scope: `plans/round-9.plan.md` only (PREP-B9).

## Post-freeze observation (append-only; added at write by PREP-B9)

The design read above ran while round-8 execution was in flight. These facts
were measured in the same window and are **not** part of any earlier freeze;
they are round-8's artifacts to account for in its record, and the round-9 gate
re-derives every count by command rather than trusting this block.

- Round-8 artifacts already in the tree at freeze: `corpus/knowledge/archive-receipt-r8.md`
  (`0587605db913`, 191 lines; its own header stamps snapshot 19:01:16Z, copy
  19:01:44Z, verification 19:02–19:04Z — a *round-8* lane's receipt, swept into
  the round-7 commit `b377007` at 19:06:31Z); the evidence tree it describes
  (35 groups / 1,451 files / 9,222,920 B) re-derived by this lane and equal to
  its §1 figures.
- `SKILL.md` at freeze is `8874306672b6…` / 945 lines — the round-7
  distillation revision; round 8 may move it again before its record lands.
- No round-8 gate record was findable at freeze (`plans/` holds up to
  `round-8.plan.md`; no `round-8-record-draft.md`), so this plan's Step-0
  comparison base is explicitly the round-7 record.
- `/tmp` state seen while reading (not written to): `w8-arch-tranche`,
  `w8-scrb8`, `w8-frozen-files.txt`, `w8-tracked-files.txt`, plus sibling w8
  lane dirs — round-8 seats' scratch; account for them in round-8's record, not
  here.- **Landed after this lane's freeze stamp (measured 19:13–19:16Z):**
  `corpus/knowledge/carried-debt-closure-r8.md` — round-8 lane B8-2, 144 lines /
  `1486e65ae80a` / mtime `2026-10-14 16:13:35.454538393 -03` (= 19:13:35Z),
  untracked at write; it closes the F1 stale-pin erratum and checks the round-6
  L1 wire-class/cache-revalidation matrix debt against the round-6/7 records.
  Effect on the counts above: `corpus/knowledge/` **17 → 18** notes / **5,019 →
  5,163** lines within minutes of the freeze; `git status --short` then showed
  exactly that note plus this file. The frozen read above stands as the
  freeze-time state (nothing in it is silently revised here); the round-9 gate
  re-derives every count by command and compares against the round-8 record.
- **What this race means for round 9, read precisely:** round 8's L0
  carried-debt check is visibly executing (a closure note landing for the F1 +
  round-6-L1 items), and its outcome — whether the matrix itself landed or only
  its debt status was checked — is round-8's record to state. This plan's L0
  ladder therefore names that note as a pointer to check, never as a
  conclusion; the gate reads the round-8 record and executes whatever it still
  shows unlanded.- **Round 8 closing while this block was being written (19:14–19:15Z):**
  `corpus/lessons/round-6.md` landed (lessons **5 → 6** — the one-wave-late
  pattern holding for the first of the three owed files) and
  `plans/round-8-record-draft.md` appeared (358 lines / `07fbd5514959`, untracked);
  `.ufo/l0-questions.md` unchanged (`02c53ec6…` / 25 lines) and HEAD still
  `b377007` at 19:15:15Z. Consequence for this plan's predicates, read
  precisely: its "no round-8 record" statements are freeze-time-true and are
  superseded by this bullet; the Step-0 comparison base becomes the round-8
  record draft **if it is committed or findable** at round-9 gate time
  (otherwise the round-7 base and the stamp rule stand); the lessons count
  assertion in Measure stays "**8** (or each missing file named)" and the gate
  prints the count it re-derives (`round-7.md` / `round-8.md` were the
  outstanding candidates at this read).
- The freeze stamp (19:12:29Z) precedes every line of this block; nothing above
  is amended by it. This lane's total footprint: this file (created) and
  `/tmp`-free — no scratch directory was created by PREP-B9.- Landing continued after this block was first written: by 19:15:33Z
  `corpus/lessons/round-7.md` had appeared (**7** lesson files at that read) and
  `plans/round-8-record-draft.md` had grown 358 → 370 lines — round 8 was
  actively closing as this file was finished. This block is a snapshot of what
  the freeze raced, not a close: anything later is round-8's record to name, and
  round 9 re-derives all of it at its gate.