# WWKD plan — tabi round 7 (ufo-round-plan-v1)

Design lane: PREP-B7 (2026-10-14, round-6 wave, 32 lanes; round-6 execution in
flight at design time). Write scope: this file only. Design-time state read by
this lane and re-derived by command at freeze **2026-10-14T17:41:44Z** —
nothing below is taken from the record:

- HEAD `bc4b7d5` ("probation round 5 (training r4)…"); `git status --short` →
  **0** entries (clean tree).
- `plans/round-6.plan.md`: 208 lines (`wc -l`; the final line has no trailing
  newline), sha256 `b86c95c75323…`, byte-identical to `git show
  HEAD:plans/round-6.plan.md` (`git diff HEAD -- …` → 0) — the round-6 design
  plan is committed; its execution is this wave and is **not** assumed anywhere
  below.
- Operator channel: `.ufo/l0-questions.md` 25 lines, sha256 `02c53ec60acf…`;
  exactly one `tabi` line (`:25` — the round-5 filing line, packet sha
  `94dc63f5fb9e…`); **no answer**. ask-count 1; the filing line's sha still
  equals the packet on disk (121 lines, `grep -c '/tmp/'` → 0).
- Corpus: `corpus/evidence/` 25 group dirs / 25 `MANIFEST.txt`;
  `corpus/lessons/round-{1..4}.md` (4 files, one `## Gate` each); **12**
  knowledge notes / **3561** lines (`ls corpus/knowledge/*.md | wc -l`; `wc -l
  … | tail -1`); `SKILL.md` 765 lines / `dcc33f1bf531…`; `reports/r5-aud-b5.md`
  landed (11,580 B).
- Daemon: no listener on 10086 (`ss -ltn`), no process (`pgrep -x
  kimi-webbridge`); pointer files stale (`daemon.pid` 8 B, `daemon.addr` 16 B,
  mtime 10:46) — the recorded post-shutdown pattern
  (`webbridge-daemon-disposition.md` §10 :245-255); `logs/` shapes only
  (`daemon.log` 3,591 B, `.prev` 19,532 B).
- Known record debt (design-time; not repaired here): `corpus/README.md:5-9`
  still says "Held at round 3 … 8 notes, 1944 lines … Lessons: 0" (actual 12 /
  3561 / 4); `SCORECARD.md` carries no round-4/5 primary-verdict tables and its
  move-log rows 4/5 sit under "Planned / retired" (:82-84).
- Every hash in this plan is provisional until the archive keeps pace (the r5
  receipt `archive-receipt-r5.md`; archive obligation
  `cdp-evidence-patterns.md:92`).

## Why this move (candidate decision)

Axes as recorded at design time (`SCORECARD.md:57-62`, r3-stamped + the r4
rider; r4/r5 verdicts owed by the record): depth 7, coverage 5, operability 5,
freshness 3 [r2 — round-5 move], calibration 6, adjacency 5. `AXES.md`: work
the trend furthest behind; one axis-move per round. The freshness trend's own
move landed in round 5 and its remaining clause is time-gated until
2026-10-15; the frontier's top rung is still unclimbed — "real-site journeys …
untested by rule" (`network-evidence-rung.md` §10 item 8 :435;
`multi-step-journey.md` §8.6 :287) — and the round-6 plan opened the class
below it. This plan continues that one move.

**Claim: one axis-move — the next unheld evidence class on the frontier the
round-6 plan opened — executed in exactly one branch** (G / D / L below; at
most one executes, and D only as far as its approval names).

- **Branch G** — a recorded grant makes the top rung executable: real-site
  observation under the named scope, or the refusal as the first rate/ToS datum
  (re-anchoring approval-table U1 :191-193).
- **Branch D** — a recorded approval of the bridge path makes the lane's first
  precondition-surface measurement of that path executable: daemon state +
  extension handshake (the frontier's extension↔daemon link,
  `corpus/README.md:30-34`; `webbridge-daemon-disposition.md` §5 :122-154). D
  is not a second move — it is G's class on the bridge surface, and it does not
  execute on A1's self-service reading alone (D0).
- **Branch L** — no grant: the loopback continuation — the **state-changing
  step** (POST body, redirect-after-POST, CSRF-shaped token, non-idempotent
  replay contract), the one class the corpus names as its own gap
  (`multi-step-journey.md:224` "python http.server does not serve POST";
  `operator-approval-request.md:86` "POST forms, redirects with bodies … untested
  by rule").

Freshness is again the carried rider (clause (c) cannot close before
2026-10-15); calibration rides only if G or D executes (the approval table's
first live exercising / the first bridge-path datum).

## Step 0 — the branch gate (mechanical; recorded verbatim before any act)

1. Read `.ufo/l0-questions.md` whole; record `sha256sum`, `wc -l`, and every
   `tabi`-matching region verbatim. Compare against the **round-6 gate record**
   (its recorded pre/post counts and branch decision), not against this plan's
   frozen values. If no round-6 gate record is findable, that is a named debt;
   the comparison base is then the design-time values above, stamped as such.
   Operator presence is never itself a grant channel: only the read-back is
   (`MISSION.md:84-88`).
2. Classify the diff vs the round-6 record:
   - **No diff / no answer** → **Branch L** (and D stays unexecuted).
   - **Answer naming ≥1 of R1/R2/R3** → **Branch G**, sub-cased at G0 by
     whether the round-6 record shows the grant already executed. Anything not
     named is not granted (default-deny).
   - **An explicit denial** → recorded verbatim as a calibration datum; resolves
     to Branch L; no re-ask (the ask has not changed; ask-count 1).
   - **Scope-less / ambiguous answer** (e.g. a bare "yes"): recorded verbatim,
     treated as **not a grant**; at most one clarification line may be filed
     (counted); nothing executes until a scope is named. Inference never
     supplies a missing scope.
   - **Bridge-path / daemon-revival approval** (volunteered beyond R1–R3, or an
     appended operator line) → **Branch D** eligibility, recorded verbatim; D
     runs only as far as the approval names (D0–D4). The round-6 deferral rule
     stands: bridge work needs the class **and** its precondition surface
     (daemon up + `extension_connected:true`), else it is deferred again with
     the reason named — no workaround.
   - **No new L0 line is filed this round**: the packet deliberately left the
     bridge un-asked (`operator-approval-request.md:30`, `:63-65`), and re-asking is
     reserved for a materially changed ask — which this round does not make on
     its own word. Recorded as a decision.
3. The read-back (line + sha, before/after counts) enters the round record
   **before** any external request or daemon act. A mid-round answer may be
   acted on only inside its stated scope after its own read-back is recorded,
   and the record must show the read-back precedes the act.
4. Precondition sweep — one check per round-6 clause; an unlanded clause is
   carried as named debt, repaired only if the chosen branch depends on it:
   - (a) **gate record**: round-6's Step-0 read-back (line + sha + counts) and
     branch classification findable in the round-6 record.
   - (b) **branch execution**: G — note `real-site-observation-<host>.md` (or
     the refusal datum), `http.log` request count ≤ budget, every stop/trip
     event with its evidence line, U1 present-or-absent, zero session-material
     reads; L — the L1 matrix (compare-table verdict counts, cells complete vs
     planned, byte-identity rows, closure lines per run, rules added, every
     falsifier field filled).
   - (c) **freshness**: §Pins re-derivation — strictly-later-date iff
     `date -u +%F` ≥ 2026-10-15, else recorded in force with the date stamped
     (carry, never fail).
   - (d) **record + hygiene**: new note + coverage row (`corpus/README.md`) +
     SKILL distillation; LOG entry + commit; `ls -A corpus/lessons | wc -l` → 4
     with Gates; archive present (25 groups / 25 manifests) with spot re-hash
     ≥3 groups against the owning notes' pins (a mismatch is a freshness
     finding — append-only, never quietly repaired); packet `/tmp`-free + the
     L0 filing line; standing Brave reject re-run (`ls -A
     ~/.config/BraveSoftware/Brave-Browser/` → `NativeMessagingHosts` only) —
     agree or the disagreement recorded. The corpus counts this check as
     "third consecutive" at r3 and "fifth" at the r5 record while the round-6
     plan's own measure said "5th" for round 6 — the gate re-derives the count
     from the record rather than trusting either, and records the count it
     asserts.
   - Carried design-time debt: README header counts (:5-9) and SCORECARD
     r4/r5 verdict tables — round-6's to land first; round 7 re-derives and
     records what it finds.

## Branch G — the grant executes (claim clause G)

The answer's named set is the authority; this plan does not widen it.

- **G0 sub-case check** — if the round-6 record shows the grant already
  executed: **G-verify only** — re-derive the round-6 note's pins, count
  `http.log` request lines against the granted budget, audit every stop/trip
  event, confirm the zero-session-material statement, land the outstanding
  distillation/calibration rows. No second run: the terms are one pass, and a
  second pass needs a new name (recorded, never inferred).
- **G1 scope** — the lane's own harness, cold profile, harness-only unless the
  grant names the bridge; read-only unless interaction is expressly granted in
  the same line; exactly the named site(s); one pass; no login; session
  material never content-read (shape-only).
- **G2 budget** — R3's numbers if granted; else R1's hard-coded default: 1 page ·
  1 cold run · ≤ 20 HTTP requests · ≤ 60 s wall · ≥ 1 s between navigations
  (`operator-approval-request.md:41`). Mechanically checked: request lines in
  `http.log` ≤ budget.
- **G3 probe + stop-and-report** — first request `/robots.txt`; a disallow, or
  the first 429/403/interstitial/CAPTCHA/ToS gate → **stop, record, never retry
  through**. The refusal is a corpus datum either way; an observed rate/ToS
  datum re-anchors approval-table U1 (:191-193) by append-only errata.
- **G4 evidence** — the three rungs (screenshot + raw DOMSnapshot; CDP Network
  slice; URL/navigation history) in the 9-item envelope, per-claim anchors,
  determinism class named per artifact, cleanup proof per run; note
  `corpus/knowledge/real-site-observation-<host>.md` with sha pins; one
  **loopback↔external delta** section (what the external world changes at the
  rungs — protocol/TLS fields, request classes with no loopback analogue,
  header shapes — shape-only; no third-party markup or bytes mirrored beyond
  the measured shapes; U7 default-deny stands).
- **G5 unmovable** — the never-set (consequential external acts;
  session-material content-reads; out-of-province work) is not movable by any
  grant; a granted interaction runs only under the approval table's class terms
  and is still never consequential (`PROVINCE.md:15-19`).
- Calibration rider: the answer, the scope discipline, and the first
  stop-behaviour (if tripped) are the approval table's first live exercising —
  record before→after in `SCORECARD.md`.

## Branch D — daemon revival (claim clause D; only under a recorded approval)

- **D0 condition (design decision, recorded)** — the revival runs only if the
  gate reads a recorded approval naming the bridge path and/or the daemon
  revival. A1 (`start`) is doc-authorized self-service on record
  (`interaction-approval-table.md:135`; `references/operations.md:11-13`) and
  round 2 exercised it — but this round does not exercise A1 on its own
  authority: the round-6 assessment routed revival to the operator as a scope
  decision (`corpus/knowledge/webbridge-revival-assessment.md` §4, §6 —
  in-flight at this freeze; re-read at gate time), it re-creates a state
  change whose return-to-baseline is operator-gated (approval-table A4 :138;
  disposition D2/D3 :161-162), and the round-6 deferral rule ties bridge work
  to the operator. The A1/U6 reading tension (:204-207) stays unreconciled and
  unexercised. If the approval names the bridge path, the revival is its named
  precondition surface (round-6 rule) and executes as D1–D2; actual bridge
  interaction still needs the grant's own C5/A6/A9 terms, else D stops at the
  handshake observation.
- **D1 revive exactly as documented** — `~/.kimi-webbridge/bin/kimi-webbridge
  start` (idempotent; no config edits, no sudo, no systemd). Pre-state first
  (design-time baseline above: no listener, no process, stale pointers); if the
  daemon is already up (operator-revived), D1 is skipped and the state is read.
- **D2 verify + handshake datum** — listener on 10086; `/status` probed **iff**
  the daemon was started by this task (A3 :137); record the full field set as
  found (the r2 "8-field" shorthand undercounts — the round-6 assessment
  counts 9 keys; record the as-is set, leave the count finding to the owning
  editor). If a browser carrying the extension is running at revival time —
  the round-6 assessment measured that enabling state once (17:23–17:42Z:
  operator chromium + extension `2.0.23` installed, daemon down) — sample
  `/status` at t≈0, +30 s, +5 min: the assessment's decisive U2 experiment.
  Falsifier: `extension_connected:false` at +5 min with the browser running ⇒
  auto-attach is false for this configuration. A positive is the frontier's
  first handshake datum — it makes the bridge path *executable*, not
  *granted*; a negative (or no browser running) records "revival succeeded,
  handshake absent" with the reason, and the bridge path stops there (no
  workaround).
- **D3 never** — `stop`/`restart`/`uninstall` (A2 :136 — the agent never runs
  them regardless of approval; an approval naming them is recorded and the leg
  refused, the operator does it); session-material content (A9 :143);
  `identity.json`/logs never content-read; no interaction beyond the named
  scope.
- **D4 closure** — the state change is recorded (pid, listener, extension
  state) with the owed operator stop named (A4/D2 pattern); port/process sweep
  proves no other residue. If already up at round start: read the shape, change
  nothing (and no stop either).

## Branch L — loopback depth (claim clause L)

Standing anti-claim fully in force: **no external site**; nothing filed
anywhere; the packet stays filed; **not re-asked** (ask-count 1). Silence is
not a denial. Loopback only; cleanup verified per run.

- **L0 carried-debt check (mechanical)** — round-6's L1 (the wire-class /
  cache-revalidation decision for repeated same-URL subresources;
  `async-step-evidence.md` §5 :192-217, §8.2 :262-264; `multi-step-journey.md`
  §5 :198-228; `reports/r4-aud-tab1.md` §2 :63-83, §7 :139 ff): if round 6 did
  not land it, round 7 executes it first (carried debt, not a second move); if
  landed, its rules + residual unknowns are inputs to L1.
- **L1 the class (the round's move)** — **the state-changing step**, the first
  non-idempotent journey class, on the lane's own fixture:
  - POST form submit with a request body — closes the r3 gap directly
    (`multi-step-journey.md:224`; the lane's own ThreadingHTTPServer pattern
    exists, `network-evidence-rung.md` §11 :438-603, `server.py` pin
    `a5ceef29fae5` :69);
  - redirect-after-POST semantics: 303 (method-changing) vs 307
    (method-preserving), the second hop measured on both surfaces (client slice
    vs server log — the r3/r4 boundary, journey §5 :198-228);
  - a CSRF-shaped token instrument: minted per render, consumed once, a second
    submit refused — the loopback stand-in for the class the packet names as
    untested (`operator-approval-request.md:86`);
  - the replay contract: what byte-identity means for a non-idempotent step
    (per-run fresh server-state root; token re-mint; divergence measured and
    classified, never averaged) — the byte-identity discipline has only ever
    been exercised on idempotent GETs;
  - per cell record which layer decided {wire 303/307, client status, token
    consumed, server state} — L1's layer-decision rule generalized.
  Controlled single-factor matrix; N ≥ 2 cold runs per cell; one factor per
  cell. Deliverable: rules + named residual unknowns + filled falsifiers; a
  negative result lands with the matrix (never a claim by exhaustion).
- **L2 instruments (execute only if unlanded by round 6)** — round-6's L2 list:
  redirect chain; rate/ToS-shaped responses as instruments (429+`Retry-After`,
  403, robots-shaped body, CAPTCHA-shaped interstitial — a loopback 429 is
  never a C6 datum; the discipline is written into the note);
  third-party-JS-shaped async (late settle, beacon-shaped POST, canceled 404).
  If round 6 landed them, reuse as-is, never re-derive.
- **L3 guards** — capture bytes byte-identical across identical-cell reruns, or
  the divergence itself measured and classified; both network surfaces kept
  (client status ≠ wire truth); closure per run (kill by PID from the process
  table, never by pattern; ports closed; `curl` exit 7).
- **L4 boundary** — lane-authored fixtures only; a mirrored real-site artifact
  stays C3 default-deny (U7 :208-210).

## Freshness rider (both branches)

The §Pins strictly-later-date pass: execute iff `date -u +%F` ≥ 2026-10-15;
else record in force with the date stamped (time-gated by construction while
the date is 2026-10-14). This round's refresh covers **12** notes (the 12th,
`archive-receipt-r5.md` `b41c2f6fb5a4…`, sits outside the §Pins block) + the
report pin + the 3 substrate pins; record the match count; a mismatch is a
freshness finding (append-only), never a silent repair.

## Measure (mechanical; branch-dependent)

- G: answer region recorded with sha + line numbers and pre/post counts; the
  execution-vs-verify sub-case named; `http.log` request count ≤ granted budget;
  every stop/trip event with its evidence line; note sha pins; U1 datum
  present-or-absent recorded; zero session-material reads (shape-only list).
- D: approval region recorded verbatim; pre/post daemon state shapes; `/status`
  field set; `extension_connected` datum; owed operator stop named; zero
  session-material reads; no stop-leg execution (the refusal recorded if the
  approval named one).
- L: compare-table verdict counts (r4 shape) over the matrix cells; cells
  complete vs planned; byte-identity row count; closure lines per run; rules
  added; every falsifier field filled; the replay contract stated for the
  non-idempotent step.
- Both: `ls -A corpus/lessons | wc -l` → 4 (or the missing file named); §Pins
  re-derivation date + match count; the new note lands with a coverage row
  (`corpus/README.md`, its header counts re-derived — a stale header recorded
  as a finding first) and SKILL distillation; LOG entry + commit (lane
  identity, `AGENTS.md:3`); standing Brave reject re-run → `NativeMessagingHosts`
  only, agree or disagreement recorded; L0 read-back precedes any act;
  ask-count printed (1).

## Seats + write scopes (slots; wave lead assigns)

- gate + record — one seat: Step 0, precondition sweep, branch record.
- G: the observation seat + a grant-discipline verifier (non-author: budget
  count from the logs, stop-rule audit); if G-verify only: one verifier seat.
- D: the revival seat + a verifier (non-author: pre/post shapes, `/status`
  fields, stop-leg refusal).
- L: the matrix seat + the fixture seat (only if L2 runs).
- freshness/debt seat — clause (c) rider + archive/lessons/README-header checks.
- verification + outside spot-check (non-author, `LEARNING.md:37-43`) + scribe
  (LOG/SCORECARD/README, commit). Write scope per seat; the L0 file is touched
  by no lane this round (no new line; only a gate read).

## Bounds & unknowns

- [unknown] Whether an answer arrives at all, its form (grant / denial /
  partial), and whether it volunteers the bridge — the plan assumes none and
  executes nothing absent a recorded read-back.
- [unknown, observation-backed] The date: clause (c) cannot close while the
  date is 2026-10-14; carried, not failed.
- [unknown] Whether round-6 clauses landed (execution in flight at design
  time); the gate records what held and what did not.
- [unknown] The first real rate/ToS datum: only Branch G can produce it; until
  then it stays an absence (U1 :191-193).
- [inference, medium] The state-changing step is the right loopback depth
  because it is the only class the corpus names as *its own* gap twice
  (`multi-step-journey.md:224`/:287; `operator-approval-request.md:86`) and it
  is where the byte-identity discipline has never been tested; if it resists
  the matrix, the negative result is still the class's first mechanism datum.
- [unknown] README header counts and SCORECARD r4/r5 verdict tables owed at
  design time; whether the round-6 record lands them.
- [unknown] Whether the extension ever connects (D2) — the bridge path's
  precondition surface has never been observed positive (`extension_connected:false`
  throughout, `webbridge-daemon-disposition.md` §5 :122-154).
- Fleet-level, reported not absorbed: tabi is still outside the watchdog
  `LANES` roster (r5 record); not this lane's file.
- New evidence bytes are `/tmp`-staged until the archive/README rows catch up;
  every new hash is provisional (archive obligation
  `cdp-evidence-patterns.md:92`).

## Discipline (round 7)

Substrates read-only; secrets shape-only, never content-read; Branch L
loopback-only with cleanup verified per run; Branch G/D only inside a recorded
approval, terms-capped, stop-and-report; daemon stop/restart/uninstall never
agent-run; one axis move; append-only errata; observation / inference / unknown
separated (`corpus/QUALITY.md`); no external site absent a read-back that names
it; write scope: `plans/round-7.plan.md` only (PREP-B7).