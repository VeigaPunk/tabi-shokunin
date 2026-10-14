# WWKD plan — tabi round 8 (ufo-round-plan-v1)

Design lane: **PREP-B8** (2026-10-14, round-7 wave, 32 lanes; round-7 execution
in flight at design time — and seen landing while this file was written; see
the closing observation block). Write scope: this file only. Design-time state
read by this lane by command across **2026-10-14T18:19–18:26Z** (freeze stamp
18:25:57Z); the values below are the read-time values — nothing in them is
taken from the record:

- HEAD `c0467a67c7491051b80c3f4a8dd193e833a9fad7` ("probation round 6
  (training r5): see LOG", 15:17:26 -03); `git status --short` → **0** entries
  (clean tree).
- `plans/round-7.plan.md`: 342 `wc -l` / 343 logical (last line has no
  trailing newline), 21,720 B, sha256 `fa1394967c74…`, tracked at `c0467a6`.
  Round-7 execution is **not** assumed anywhere below; no tabi round-7 scratch
  observed at freeze.
- Operator channel: `.ufo/l0-questions.md` 25 lines / 21,539 B / sha256
  `02c53ec60acf…` / mtime `2026-10-14 14:05:52.482908587 -03`; exactly one
  `tabi` line (`:25` — the round-5 filing, packet sha `94dc63f5fb9e…`); **no
  answer, no denial, no edit**; ask-count 1; the filing's byte-prefix proof
  (24→25 lines) stands (AUD-B5 §4).
- Corpus: `corpus/evidence/` 25 groups / 25 `MANIFEST.txt`; `corpus/lessons/`
  **5** files (`round-1..5.md`), one `## Gate` each; **14** knowledge notes /
  **4,452** lines (`ls corpus/knowledge/*.md | wc -l`; `wc -l … | tail -1`);
  `SKILL.md` 795 `wc -l` / 796 logical, sha256 `a8ba10b86138fe39`; packet 121
  lines / 13,103 B / `94dc63f5…`; `reports/` r4 `5f44b0f94483` · r5
  `d09f1712cbcf` · r6 `9428ddec52b9`.
- Round-6 additions on record: `corpus/knowledge/external-class-fixture-v2.md`
  `4aa604f1788b` (569 lines) · `webbridge-revival-assessment.md`
  `a07c8aedc161` (322) · `archive-receipt-r5.md` `b41c2f6fb5a4` (180) ·
  `corpus/lessons/round-5.md` (+139 in `c0467a6`).
- Daemon: no listener on 10086 (`ss -ltn`), no process (`pgrep -x
  kimi-webbridge`); pointer files stale (`daemon.pid` 8 B, `daemon.addr` 16 B,
  mtime 10:46) — the recorded post-shutdown pattern (`webbridge-daemon-disposition.md`
  §10); `identity.json`/`logs/` shapes only, never content-read.
- Standing Brave reject: `ls -A ~/.config/BraveSoftware/Brave-Browser/` →
  `NativeMessagingHosts` only → agree (the consecutive count is re-derived at
  the gate, see Measure).
- Known record debt (design-time; not repaired here): `corpus/README.md:5-9`
  still says "Held at round 3 … 8 notes, 1944 lines … Lessons: 0" (actual 14 /
  4,452 / 5) and its coverage rows stop at round 3; `SCORECARD.md` carries no
  round-4/5/6 primary-verdict tables, its axes table (`:55-62`) is r1–r3
  stamped, and its move-log rows 4–6 sit under "Planned / retired" (`:83-85`);
  lessons stop at `round-5.md`; the §Pins errata block (`SKILL.md:773+`,
  round-5) predates the two round-6 notes (their pins live inline at
  `SKILL.md:323` / `:551`); the packet cold-read verdict is still `[unknown]`
  (`operator-approval-request.md:100`).
- Every hash in this plan is provisional until the archive keeps pace
  (`cdp-evidence-patterns.md` §5.9 :92; the round-5 receipt
  `archive-receipt-r5.md`).

## Why this move (candidate decision)

Axes as recorded at design time (`SCORECARD.md:55-62`; r1–r3 stamps + rider
notes; r4–r7 verdicts owed by the record): depth 7, coverage 5, operability 5,
freshness 3 [r2 — round-5 move], calibration 6, adjacency 5. `AXES.md:23-31`:
work the trend furthest behind; one axis-move per round. Two open threads
decide round 8, and the assignment names the first:

1. **Operator status — both branches.** The R1–R3 packet has been filed since
   round 5 (`corpus/handoffs/operator-approval-request.md`; L0 `:25`) and is
   still unanswered at freeze; the frontier's top rung (real-site observation)
   is gated on it, and the bridge path (daemon revival + handshake) is
   operator-owned (`webbridge-revival-assessment.md` §4–§5; A4 closed as moot,
   `operator-approval-request.md:63-65`). Round 8 must be executable **both**
   ways — answer present, answer absent — and must record which way it read.
2. **The freshness clause (c)** — the last clause of the round-5 four-clause
   claim — becomes executable for the first time in round 8 if the date
   moved: strictly-later-date ⇔ `date -u +%F` ≥ 2026-10-15 ⇔ ≥ 2026-10-14
   21:00 -03. Freshness is the lane's lowest axis (3), and the clause closes
   an open record claim (`SKILL.md:795` "TIME-GATED (earliest 2026-10-15) and
   still owed").

**Claim (one axis-move, operator-status-branched).** Branch **G** — the
operator answered: the frontier's top admissible class under the answer's
named scope (the granted real-site observation, or the bridge precondition
surface if the answer names the bridge), with the approval table's first live
exercising as the calibration rider. Branch **L** — no answer (or a denial):
the carried loopback debt first (round-6 L1 and round-7's clauses, whichever
the record shows unlanded), then the round's own class: **the non-idempotent
step under failure — interruption, abandonment, duplicate submission**. Both
branches carry the freshness rider (clause (c) closure, iff the date moved)
and both record the operator-status classification verbatim before any act.
At most one branch executes. [design decision, recorded]

## Operator status — both branches (measured; never inferred)

The operator status has exactly one measurement surface: `.ufo/l0-questions.md`
content (answers arrive by in-place edit, `MISSION.md:84-88`); operator
presence is never itself a grant channel. The gate classifies, records
verbatim, and the branch follows mechanically:

| Status (gate read) | Meaning | Branch |
|---|---|---|
| **ANSWERED-SCOPED** | a new/edited line names ≥1 of R1/R2/R3 with a scope (site and/or budget) | **G** — execute exactly the named set; default-deny on everything unnamed |
| **ANSWERED-SCOPE-LESS** | approval without a scope (e.g. a bare "yes") | **neither** — recorded as not-a-grant; at most one clarification line may be filed (counted); nothing executes until a scope is named; inference never supplies a scope |
| **DENIED** | explicit refusal | recorded verbatim as a calibration datum → **L**; no re-ask on the same ask |
| **BRIDGE-NAMING** | a line (volunteered or appended) approving the bridge path / daemon revival | **G's bridge sub-case (G4)** — revival as the named precondition surface; interaction still needs the grant's class terms |
| **SILENT** | no diff vs the round-5 filing (sha + line count + mtime byte-identical) | **L** — silence is not a denial; ask-count stays 1 |

Both branches: (i) the read-back (line + sha, before/after counts, mtime)
enters the round record **before** any external request or daemon act; (ii) a
mid-round answer may be acted on only inside its stated scope, after its own
read-back — the record must show read-back-before-act; (iii) **the round does
not exit without a recorded status classification** (round 8's standing rule,
both branches); (iv) Branch G needs no operator presence during the run
(harness-only, no login, observation only); a scope that would need the
operator at the browser (C5) is out of scope by construction and recorded as
such; (v) re-asking stays as round 7 left it — **default silence**. At most
one materially-changed line may be filed, only if the gate names the material
change (what the lane now knows that changes the question — e.g. the
fixture-exercised stop rule that now backs the ask) and the ask is
*replaced*, not re-sent; a verbatim repeat is banned (no-nag rule); the count
is recorded either way.

## Step 0 — the operator-status gate (mechanical; recorded verbatim before any act)

1. Read `.ufo/l0-questions.md` whole; record `sha256sum`, `wc -l`, `wc -c`,
   mtime, and every `tabi`-matching region verbatim. Compare against the
   **round-7 gate record** (its recorded read-back and branch decision), not
   against this plan's frozen values; if no round-7 gate record is findable,
   that is a named debt and the comparison base is the design-time values
   above, stamped as such.
2. Classify the diff into the table above; the branch follows mechanically.
3. The read-back enters the round record before any act (both branches).
4. Precondition sweep — one check per round-7 clause; an unlanded clause is
   carried as named debt, repaired only if the chosen branch depends on it:
   - (a) **gate record**: round-7's Step-0 read-back (line + sha + counts) and
     branch classification findable in the round-7 record.
   - (b) **branch execution**: G — the note (or refusal datum), request count
     ≤ budget, every stop/trip event with its evidence line, U1
     present-or-absent, zero session-material reads; D (if run) — pre/post
     state shapes, `/status` field set, handshake datum, owed operator stop
     named; L — matrix verdict counts, cells complete vs planned, closure
     lines per run, rules added, every falsifier field filled.
   - (c) **freshness**: the §Pins strictly-later-date pass — execute iff
     `date -u +%F` ≥ 2026-10-15; else recorded in force with the date stamped
     (carry, never fail). Round 8 is the first round this can execute.
   - (d) **record + hygiene**: new note + coverage row (`corpus/README.md`,
     header counts re-derived first) + SKILL distillation; LOG entry + commit
     (lane identity, `AGENTS.md:3`); lessons count → **6** (round-6.md owed by
     round-7's record; round-7.md is this record's to land), or each missing
     file named; archive present (25 groups / 25 manifests) with spot re-hash
     ≥3 groups against the owning notes' pins (a mismatch is a freshness
     finding — append-only, never quietly repaired); packet `/tmp`-free + the
     L0 filing line; standing Brave reject re-run → `NativeMessagingHosts`
     only, agree or the disagreement recorded, with the consecutive count
     **re-derived from the record** (the recorded counts drift: "third" r3,
     "fifth" r5, "6th" r6 draft — the gate prints the count it asserts).
   - Carried debts to land as ordinary record work if the branch does not
     depend on them: packet cold-read verdict (its own §6 falsifier,
     `operator-approval-request.md:92-100`; status line still `[unknown]`);
     README header + coverage rows rounds 4–7; SCORECARD r4–r7 primary-verdict
     tables, axes refresh, move-log placement; the round-6/7 archive tranche
     with a receipt in the r5 pattern; F1 (`tabi-b1-r3b-journey` pin-file, no
     owning-note pin) and F3 (round-5 peer groups `/tmp/w5-tabi-b53/`,
     `/tmp/w5-aud-b5-work/`, `/tmp/w5-aud-b5-evidence/`) as the tranche's
     named items.

## Branch G — the answer executes (claim clause G)

The answer's named set is the authority; this plan does not widen it.

- **G0 sub-case check** — if the round-7 record shows the grant already
  executed: **G-verify only** — re-derive the note's pins, count `http.log`
  request lines against the granted budget, audit every stop/trip event,
  confirm the zero-session-material statement, land the outstanding
  distillation/calibration rows. No second run: the terms are one pass, and a
  second pass needs a new name (recorded, never inferred).
- **G1 scope** — the lane's own harness, cold profile, harness-only unless the
  answer names the bridge; read-only unless interaction is expressly granted
  in the same line; exactly the named site(s); one pass; no login; session
  material never content-read (shape-only).
- **G2 budget** — R3's numbers if granted; else R1's hard-coded default:
  1 page · 1 cold run · ≤ 20 HTTP requests · ≤ 60 s wall · ≥ 1 s between
  navigations (`operator-approval-request.md:41`). Mechanically checked:
  request lines in `http.log` ≤ budget.
- **G3 probe + stop-and-report** — first request `/robots.txt`; a disallow, or
  the first 429/403/interstitial/CAPTCHA/ToS gate → **stop, record, never
  retry through**. The refusal is a corpus datum either way; an observed
  rate/ToS datum re-anchors approval-table U1 (:191-193) by append-only
  errata.
- **G4 bridge sub-case** (only under a BRIDGE-NAMING read) — the revival as
  the named precondition surface, exactly as round 7 specified it: pre-state
  first (`ss -ltn`, `pgrep`); `start` exactly as documented
  (`~/.kimi-webbridge/bin/kimi-webbridge start`; no config edits, no sudo, no
  systemd); `/status` probed **iff** the daemon was started by this task
  (A3 :137); if a browser carrying the extension is running, sample `/status`
  at t≈0 / +30 s / +5 min — the assessment's decisive U2 experiment;
  falsifier `extension_connected:false` at +5 min with the browser running ⇒
  auto-attach is false for this configuration; a positive is the frontier's
  first handshake datum — it makes the path *executable*, not *granted*; a
  negative (or no browser) records "revival succeeded, handshake absent" with
  the reason and stops there (no workaround). `stop`/`restart`/`uninstall`
  never agent-run (A2 :136 — approval does not delegate); D4 closure: state
  recorded (pid, listener, extension state), owed operator stop named,
  port/process sweep proves no other residue.
- **G5 evidence** — the three rungs (screenshot + raw DOMSnapshot; CDP Network
  slice; URL/navigation history) in the 9-item envelope, per-claim anchors,
  determinism class named per artifact, cleanup proof per run; note
  `corpus/knowledge/real-site-observation-<host>.md` with sha pins; one
  **loopback↔external delta** section (protocol/TLS fields, request classes
  with no loopback analogue, header shapes — shape-only; U7 default-deny
  stands).
- **G6 unmovable** — the never-set (consequential external acts;
  session-material content-reads; out-of-province work) is not movable by any
  grant; a granted observation runs only under the class terms and is still
  never consequential (`PROVINCE.md:15-19`).
- Calibration rider: the answer, the scope discipline, and the first
  stop-behaviour (if tripped) are the approval table's first live exercising —
  record before→after in `SCORECARD.md`.

## Branch L — loopback continuation (claim clause L)

Standing anti-claim fully in force: **no external site**; nothing filed
anywhere; the packet stays filed; **not re-asked** (default; see the re-ask
rule above); silence is not a denial; loopback only; cleanup verified per run.

- **L0 carried-debt check (mechanical)** — execute whichever the record shows
  unlanded, in order, as debt, not as a second move:
  1. round-6 L1 — the wire-class / cache-revalidation matrix for repeated
     same-URL subresources (`async-step-evidence.md` §5 :192-217, §8.2;
     `multi-step-journey.md` §5; `reports/r4-aud-tab1.md` §2 :63-83, §7);
  2. round-7 L1 / L2 / L3 — the state-changing step, its instruments, its
     guards (its own §Branch L).
- **L1 the class (the round's move, iff the debt set is clear)** — **the
  non-idempotent step under failure**: interruption, abandonment, duplicate
  submission, on the lane's own fixture (the v2 `server.py` plus the
  state-changing step's machinery if landed):
  - **interrupt mid-POST** — client killed/aborted before the response: which
    layers saw what (server log line vs client event vs wire), whether the
    server applied the change, whether the token burned. Anchor: rung D3/D4 —
    "an abandoned request has a server 200 line no client ever received"
    (`network-evidence-rung.md` :271-282; `SKILL.md:388,403`) and rung
    §10.3-10.4 (404-stylesheet cancellation, the 60 ms abort race — both
    unexamined);
  - **interrupt between redirect hops** — where the 302/303/307 chain stops,
    what remains replayable, which surface shows the stop;
  - **duplicate submission** — same token twice (double-click, two pages):
    token-consumption rule vs double-apply; the second submit's evidence per
    layer; the lost-update edge if the resource is a counter;
  - **per cell**: which layer decided {wire, client status, token consumed,
    server state}; the **replay contract** for a non-idempotent step extended
    to interrupted/duplicated runs (byte-identity where idempotent; divergence
    measured and classified, never averaged);
  - controlled single-factor matrix; N ≥ 2 cold runs per cell; one factor per
    cell. Deliverable: rules + named residual unknowns + filled falsifiers; a
    negative result lands with the matrix (never a claim by exhaustion); the
    fixture v2 U2 timing unknown (`external-class-fixture-v2.md` §9) is one
    named input, not a claim.
- **L2 instruments (only if unlanded)** — round-6/7 lists: rate/ToS-shaped
  responses as instruments (a loopback 429 is never a C6 datum — discipline
  written into the note, `external-class-fixture-v2.md` §8); third-party-JS-shaped
  async (late settle, beacon-shaped POST, canceled 404 — its §9 handoff E3).
- **L3 guards** — capture bytes byte-identical across identical-cell reruns, or
  the divergence itself measured and classified; both network surfaces kept
  (client status ≠ wire truth); closure per run (kill by PID from the process
  table, never by pattern; ports closed; `curl` exit 7).
- **L4 boundary** — lane-authored fixtures only; a mirrored real-site artifact
  stays C3 default-deny (U7 :208-210).

## Freshness rider (both branches) — clause (c) closure

The §Pins strictly-later-date pass: execute iff `date -u +%F` ≥ 2026-10-15;
else record in force with the date stamped (time-gated by construction while
the date is 2026-10-14). This round's refresh covers **21 values**: the 14
notes (the §Pins errata block's 11 + `archive-receipt-r5.md` `b41c2f6fb5a4` +
the two round-6 notes `4aa604f1788b` / `a07c8aedc161`) + 3 report pins
(`reports/r4-aud-tab1.md` `5f44b0f94483` · `r5-aud-b5.md` `d09f1712cbcf` ·
`r6-aud-b6.md` `9428ddec52b9`) + the 3 substrate pins (`e70aff5c40ff` /
`84a8e69d04c5` / `b811d9c23dfd`) + this `SKILL.md` revision
(`a8ba10b86138fe39`); the gate re-derives and records the count it asserts.
The durable witness is a dated in-repo block whose commit date is ≥
2026-10-15 (`git show -s --format=%cI` recorded); the clause closes only when
date + match count + witness are on record — same-day re-derivations do not
close it. A mismatch is a freshness finding (append-only errata), never a
silent repair. The block's own staleness is a finding: the §Pins errata
predates the two round-6 notes (their pins live inline at `SKILL.md:323` /
`:551`); the record states whether the refresh folds them into the block.

## Measure (mechanical; branch-dependent)

- G: answer region recorded with sha + line numbers and pre/post counts; the
  execution-vs-verify sub-case named; `http.log` request count ≤ granted
  budget; every stop/trip event with its evidence line; note sha pins; U1
  datum present-or-absent; zero session-material reads (shape-only list); the
  calibration rider (approval table's first live exercising) before→after.
- L: compare-table verdict counts over the matrix cells; cells complete vs
  planned; byte-identity row count; closure lines per run; rules added; every
  falsifier field filled; the replay contract stated for the non-idempotent
  step; the operator-status datum (silence span from the filing mtime
  2026-10-14 14:04 -03 → round start; ask-count; the re-ask decision
  recorded).
- Both: operator-status classification recorded verbatim with the read-back
  before any act; `ls -A corpus/lessons | wc -l` → 6 (or each missing file
  named); §Pins re-derivation date + match count (clause (c) status); the new
  note lands with a coverage row (`corpus/README.md`, its header counts
  re-derived — a stale header recorded as a finding first) and SKILL
  distillation; LOG entry + commit (lane identity); standing Brave reject
  re-run → `NativeMessagingHosts` only, agree or disagreement recorded, count
  re-derived from the record; archive spot ≥3 groups; packet cold-read verdict
  present-or-named-debt; ask-count printed.

## Seats + write scopes (slots; wave lead assigns)

- gate + record — one seat: Step 0, operator-status classification, branch
  record, precondition sweep.
- G: the observation seat + a grant-discipline verifier (non-author: budget
  count from the logs, stop-rule audit); if G-verify only: one verifier seat;
  bridge sub-case (G4): the revival seat + a verifier (non-author: pre/post
  shapes, `/status` fields, stop-leg refusal).
- L: the matrix seat + the fixture seat (only if new fixture bytes are
  needed).
- freshness/debt seat — clause (c) rider + archive tranche (round-6/7 groups +
  F1/F3) + receipt.
- record-debt seat (README/SCORECARD/lessons) — ordinary record work, named so
  it stops riding silently.
- verification + outside spot-check (non-author, `LEARNING.md:37-43`) + scribe
  (LOG/SCORECARD/README, commit). Write scope per seat; `.ufo/l0-questions.md`
  is touched by no lane this round except the one permitted re-ask line, only
  if the gate's material-change test passes (count recorded).

## Bounds & unknowns

- [unknown] Whether an answer arrives at all, its form (grant / denial /
  partial / bridge-naming), and whether it arrives before the round closes;
  the plan assumes none and executes nothing absent a recorded read-back.
- [unknown, observation-backed] The date: clause (c) closes only if
  `date -u +%F` ≥ 2026-10-15; if round 8 still runs on 2026-10-14 UTC it is
  carried again with the stamp.
- [unknown] Whether round-6 L1 and round-7's clauses landed (in flight at
  design time); L0's carried-debt check reads the record and executes what is
  missing.
- [unknown] The first real rate/ToS datum: only Branch G can produce it; until
  then it stays an absence (U1 :191-193).
- [unknown] Whether the extension ever connects (G4) —
  `extension_connected:false` throughout; daemon down at freeze.
- [inference, medium] The non-idempotent step under failure is the right next
  loopback class because the corpus names abandonment/cancellation as measured
  instances with unexplained mechanisms (rung D3/D4, §10.3-10.4; fixture v2
  U2) and the byte-identity/replay discipline has never been exercised on a
  step that can half-happen; if the matrix resists, the negative result is
  still the class's first mechanism datum.
- [unknown] README header counts, SCORECARD r4–r7 verdict tables/axes, the
  packet cold-read verdict, lessons round-6/7 — all owed at design time;
  whether round 7 lands them (its record will say).
- Fleet-level, reported not absorbed: tabi is still outside the watchdog
  `LANES` roster (carried from r5); not this lane's file.
- New evidence bytes are `/tmp`-staged until the archive tranche lands; every
  new hash is provisional (archive obligation `cdp-evidence-patterns.md`
  §5.9 :92).

## Discipline (round 8)

Substrates read-only; secrets/session material shape-only, never content-read;
Branch L loopback-only with cleanup verified per run; Branch G only inside the
recorded answer, terms-capped, stop-and-report; daemon stop/restart/uninstall
never agent-run; one axis-move; append-only errata; observation / inference /
unknown separated (`corpus/QUALITY.md`); no external site absent a read-back
that names it; write scope: `plans/round-8.plan.md` only (PREP-B8).

## Post-freeze observation (append-only; added at write by PREP-B8)

The design read above raced round-7 execution: these writes landed at or just
after the freeze and are **not** part of it. They are round-7's artifacts to
account for in its record; the round-8 gate re-derives every count by command
and compares against the round-7 record, not against this block.

- `SKILL.md` moved at 18:24:12Z: read value `a8ba10b86138fe39` → `c0d2629ecbfb…`
  (the round-7 in-flight distillation; the §Pins rider re-derives whichever
  revision is current at round-8 gate time).
- `corpus/evidence/` gained the round-6 archive tranche at 18:24:53Z —
  `w6-tabi-b61/`, `w6-aud-b6-scratch/`, `w6-ver-b6/` (25 → 28 `MANIFEST.txt`);
  this is the archive debt `external-class-fixture-v2.md` §9 names, landing.
- Two new notes landed 18:26:06–07Z: `corpus/knowledge/layer-routing-synthesis.md`
  (`77c60a5a9d63`, first-12) and `corpus/knowledge/packet-readiness-r7.md`
  (`b09f71461cdc`) — 14 → 16 notes / 4,452 → 4,776 lines.
- The frozen read above stands as the freeze-time state (nothing in it is
  silently revised here); at 18:26Z the tree was `M SKILL.md`, the three new
  evidence groups, the two new notes, and this file — all round-7's to land
  or name.
- Round-7 seat scratch also appeared in the same window (`/tmp/w7-tabi-b72-*`,
  `/tmp/w7-aud-b7-*`, `/tmp/w7-b71-synth`, and the sibling lanes' w7 dirs) —
  none of it was present at the freeze read; the round-7 record is the place
  these seats' work is accounted for.
- Landing continued after this block was first written (`reports/r7-aud-b7.md`
  appeared by ~18:33Z); this block is a snapshot of what the freeze raced, not
  a close — anything later is round-7's record to name, and round 8 re-derives
  all of it at its gate.