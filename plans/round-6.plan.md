# WWKD plan — tabi round 6 (ufo-round-plan-v1)

Design lane: PREP-B6 (2026-10-14, 32-lane wave). Design-time state read by
this lane, not taken from the record (frozen 2026-10-14T17:04:57Z, round-5
work in flight): HEAD `282fc6d`; `git status --short` → `M
plans/round-5.plan.md` (the operative condensed 11-line plan; the 334-line
design text of the same plan is at `282fc6d:plans/round-5.plan.md`),
`?? corpus/evidence/` (25 groups, 25 `MANIFEST.txt` at freeze),
`?? corpus/handoffs/` (`operator-approval-request.md`, 13 103 B, landing
14:04 local), `?? corpus/lessons/` (`round-1.md` landed, rounds 2–4
pending); 11 knowledge notes / 3336 lines (`ls corpus/knowledge/*.md | wc
-l`; `wc -l … | tail -1`); `grep -c tabi .ufo/l0-questions.md` → 0 (filing
line not yet appended); `SKILL.md` 741 lines sha12 `1e2f87caddff`. Round-5
clauses (a)–(d) are this plan's precondition set — checked at Step 0,
never assumed. All hashes in this plan are provisional until the archive
keeps pace (`cdp-evidence-patterns.md` §5.9).

## Why depth (candidate decision)

Scores at design time (`SCORECARD.md:57-62`, r3-stamped; r4 verdicts owed by
round 5): depth 7 [r3, +r4 rider], coverage 5, operability 5, freshness 3
[r2; round-5 move], calibration 6, adjacency 5. `AXES.md:23-29`: work the
axis from the trend furthest behind; one axis-move per round. Both branches
below are the **same** move — a new evidence class on ground the corpus
marks unheld: the top rung, *real-site observation under a recorded grant*
(`network-evidence-rung.md` §10.8: "real-site journeys … untested by
rule"), or the loopback mechanism whose absence both the r4 audit and the
async note independently named (`async-step-evidence.md` §5/§8.2;
`reports/r4-aud-tab1.md` §2/§7.1-7.2; `multi-step-journey.md` §5).
Freshness is a carried rider (round-5 clause (c) residue); calibration
rides only if Branch G executes. [design decision, recorded]

## Step 0 — the branch gate (mechanical; recorded verbatim before any act)

1. Read `.ufo/l0-questions.md` whole; record `sha256sum`, `wc -l`, and every
   `tabi`-matching region verbatim (`grep -n 'tabi' …`). Compare against the
   round-5 record's filing line + its pre/post counts (clause (d)).
   Operator presence is never itself a grant channel: only the read-back is
   (round-5 anti-claim holds; `MISSION.md:84-88` — "the L0 answers by editing
   the file in place").
2. Classify the diff vs the round-5 filing:
   - **No diff / no answer** → **Branch L**.
   - **Answer naming ≥1 of R1/R2/R3** (`corpus/handoffs/operator-approval-request.md`;
     ask terms `282fc6d:plans/round-5.plan.md` §3.2) → **Branch G**; execute
     only the named items; anything not named is **not granted**
     (default-deny holds).
   - **An explicit denial** is recorded verbatim as a calibration datum (the
     lane's first recorded grant decision) and resolves to Branch L; no
     re-ask unless the ask materially changed (record the count; the ask has
     not changed by construction here — ask-count 1).
   - **Scope-less / ambiguous answer** (e.g. a bare "yes" without
     site+scope): recorded verbatim, treated as **not a grant**; at most one
     clarification line may be filed (counted), and nothing executes until a
     scope is named. Inference never supplies a missing scope.
   - **Items beyond R1–R3** (e.g. a volunteered bridge grant): recorded
     verbatim; executable only if the approval table has the class **and**
     its precondition surface exists (bridge: daemon up +
     `extension_connected:true`), else deferred to round 7 with the reason
     named — no workaround (`interaction-approval-table.md`:58-62, A6/A9).
3. The read-back (line + sha, before/after counts) enters the round record
   **before** any external request. A mid-round answer may be acted on only
   inside its stated scope after its own read-back is recorded, and the
   record must show the read-back precedes the act.
4. Precondition sweep — one check per round-5 clause; an unlanded clause is
   carried as named debt, repaired only if the branch depends on it:
   - (a) archive: `corpus/evidence/*/MANIFEST.txt` present; spot re-hash ≥3
     groups (one pinned file each) equals the owning note's pin; a mismatch
     is a freshness finding against the note (append-only errata, never
     quietly repaired).
   - (b) lessons: `ls -A corpus/lessons | wc -l` → 4, each with a `## Gate`
     section (`LEARNING.md:61-62`).
   - (c) §Pins strictly-later-date: **carry, do not fail** — while the date
     is still 2026-10-14 the clause is impossible by construction (strictly
     later requires ≥ 2026-10-15); execute iff `date -u +%F` moved, else
     record in force with the date stamped.
   - (d) packet: `grep -c '/tmp/' corpus/handoffs/operator-approval-request.md`
     → 0 and the L0 filing line present. If the packet is absent, the round
     files it from `282fc6d:plans/round-5.plan.md` §3, cold-read-tests it
     (round-3 executor shape), and appends the one L0 line — that append is
     what makes the answer channel live; record pre/post counts and the line
     verbatim.

## Branch G — the grant executes (claim clause G)

The answer's named set is the authority; this plan does not widen it.

- **G1 scope** — the lane's own harness, cold profile, harness-only unless
  the grant names the bridge; read-only unless interaction is expressly
  granted in the same line; exactly the named site(s); one pass; no login;
  session material never content-read (shape-only).
- **G2 budget** — R3's numbers if granted; else R1's hard-coded: 1 page · 1
  cold run · ≤ 20 HTTP requests · ≤ 60 s wall · ≥ 1 s between navigations
  (`282fc6d:plans/round-5.plan.md` §3.2). Mechanically checked: request
  lines in `http.log` ≤ budget.
- **G3 probe + stop-and-report** — first request `/robots.txt` as the
  conventional permission probe; a disallow, or the first 429/403/
  interstitial/CAPTCHA/ToS gate → **stop, record, never retry through**.
  The refusal is a corpus datum either way; if a rate/ToS datum is observed
  it re-anchors approval-table U1 (`interaction-approval-table.md`:191-192)
  by append-only errata.
- **G4 evidence** — the three rungs (screenshot + raw DOMSnapshot; CDP
  Network slice; URL/navigation history) in the 9-item envelope, per-claim
  anchors, determinism class named per artifact, cleanup proof per run;
  note `corpus/knowledge/real-site-observation-<host>.md` with sha pins;
  one **loopback↔external delta** section (what the external world changes
  at the rungs — protocol/TLS fields, request classes with no loopback
  analogue, header shapes — shape-only; no third-party markup or bytes
  mirrored beyond the measured shapes, U7 default-deny stands).
- **G5 unmovable** — the never-set (consequential external acts;
  session-material content-reads; out-of-province work) is not movable by
  any grant; a granted interaction runs only under the approval table's
  class terms and is still never consequential (`PROVINCE.md:15-19`).
- Calibration rider: the answer, the scope discipline, and the first
  stop-behaviour (if tripped) are the approval table's first live
  exercising — record before→after in `SCORECARD.md`.

## Branch L — loopback depth (claim clause L)

Standing anti-claim fully in force: **no external site**; nothing filed
anywhere; the packet stays filed; **not re-asked** (ask unchanged;
ask-count 1). Silence is not a denial. Loopback only, cleanup verified per
run.

- **L1 the mechanism rule (core)** — convert one named unexamined mechanism
  into a measured rule + falsifier: the wire-class / cache-revalidation
  decision for repeated same-URL subresources (`async-step-evidence.md`
  §5, §8.2; `network-evidence-rung.md` §10.2/§10.5; `reports/r4-aud-tab1.md`
  §2 :63-83 and §7.1-7.2; `multi-step-journey.md` §5).
  Controlled single-factor matrix on the lane's own loopback fixture —
  one factor per cell: response cache headers (Cache-Control/ETag/
  Last-Modified present/shape), fixture mtime age, repeat count within a
  run, per-run fresh profile; N ≥ 2 cold runs per cell; per cell record
  which of {wire-304, no-wire re-serve, client-status} obtains and which
  layer decided. Deliverable: rules + named residual unknowns; a negative
  result lands with the matrix (never a claim by exhaustion).
- **L2 fixture edge-classes** (execute only if unlanded by round 5; r5 §4
  E1–E3, base = the rung §11 embedded fixture, chosen because those bytes
  survive `/tmp`): redirect chain (302/303/307 + cross-path hop),
  rate/ToS-shaped responses as **instruments** (429+`Retry-After`, 403,
  robots-shaped body, CAPTCHA-shaped interstitial) delivering the
  stop-and-report predicate — a loopback 429 is never a C6 datum
  (discipline written into the note), and third-party-JS-shaped async
  (late settle, beacon-shaped POST, canceled 404). Lane-authored fixtures
  only; a mirrored real-site artifact stays C3 default-deny.
- **L3 guards** — capture bytes byte-identical across identical-cell
  reruns (or the divergence is itself measured and classified); both
  network surfaces kept (client status ≠ wire truth); closure per run
  (kill by PID from the process table — never by pattern; ports closed;
  `curl` exit 7).
- Freshness rider (both branches): the §Pins strictly-later-date
  re-derivation per Step 0 clause (c).

## Measure (mechanical; branch-dependent)

- G: answer region recorded with sha + line numbers and pre/post counts;
  `http.log` request count ≤ granted budget; every stop/trip event with its
  evidence line; note sha pins; U1 datum present-or-absent recorded; zero
  session-material reads (shape-only list).
- L: compare-table verdict counts (r4 shape) over the matrix cells; cells
  complete vs planned; byte-identity row count; closure lines per run;
  rules added; every falsifier field filled.
- Both: `ls -A corpus/lessons | wc -l` → 4 (or the missing file named);
  §Pins re-derivation date + match count; the new note lands with a
  coverage row (`corpus/README.md`) and SKILL distillation; LOG entry +
  commit; standing Brave reject re-run (`ls -A
  ~/.config/BraveSoftware/Brave-Browser/` → `NativeMessagingHosts` only) —
  5th consecutive agree, or the disagreement recorded.

## Seats + write scopes (slots; wave lead assigns)

- gate + record — one seat: Step 0, precondition sweep, branch record.
- branch execution — G: the observation seat + a grant-discipline verifier
  (non-author: budget count from the logs, stop-rule audit); L: the matrix
  seat + the fixture seat (only if L2 runs).
- freshness/debt seat — clause (c) rider + archive/lessons checks.
- verification + outside spot-check (non-author, `LEARNING.md:37-43`) +
  scribe (LOG/SCORECARD/README, commit). Write scope per seat; the L0 file
  is touched only by the seat filing the packet, only if Step 0 finds it
  unfiled (one line).

## Bounds & unknowns

- [unknown] Whether an answer arrives at all, and its form (grant / denial /
  partial); the plan does not assume one (`282fc6d:plans/round-5.plan.md`
  §7).
- [unknown, observation-backed] The date: clause (c) cannot close while the
  date is 2026-10-14; carried, not failed.
- [unknown] Whether every round-5 clause landed (in flight at design time);
  the gate records what held and what did not.
- [inference, medium] The L1 matrix is the right loopback depth because two
  independent lanes named the same mechanism unmeasured on both sides of
  the wire; if it resists the matrix, the negative result is still the
  rung's first mechanism-class datum.
- [unknown] The first real rate/ToS datum: only Branch G can produce it;
  until then it stays an absence (U1).
- [unknown] The packet's cold-read outcome (round-5 rider); if it failed,
  the amended packet is the round-6 authority.
- Fleet-level, reported not absorbed: tabi is still outside the watchdog
  `LANES` roster (r5 §7) — not this lane's file.
- New evidence bytes are `/tmp`-staged until the archive/README rows catch
  up; every new hash is provisional per `cdp-evidence-patterns.md` §5.9.

## Discipline (round 6)

Substrates read-only; secrets shape-only, never content-read; Branch L
loopback-only with cleanup verified per run; Branch G only inside the
recorded grant, budget-capped, stop-and-report; one axis move; append-only
errata; observation / inference / unknown separated (`corpus/QUALITY.md`);
no external site absent a read-back that names it.