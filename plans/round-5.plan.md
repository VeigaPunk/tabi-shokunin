# WWKD plan — tabi round 5 (ufo-round-plan-v1)

Design lane: PREP-B5 (2026-10-14). Design-time state read by this lane, not
taken from the record: HEAD `094c27a`, round-4 work uncommitted (`git status
--short` → `M SKILL.md`, 8 × `M corpus/knowledge/*`, `?? corpus/knowledge/
{async-step-evidence,hygiene-sweep-r4,network-evidence-rung}.md`,
`?? plans/round-4.plan.md`, `?? plans/round-4-record-draft.md`,
`?? reports/`); 11 knowledge
notes, `wc -l corpus/knowledge/*.md | tail -1` → 3336; `ls -A corpus/lessons
| wc -l` → 0; `SKILL.md` 741 lines, sha256 first-12 `1e2f87caddff`;
`corpus/README.md` still reads "8 knowledge notes, 1944 lines" and its
Frontier list still names thirteen `/tmp` groups. Round 4 produced the notes
but never assembled its record: `plans/round-4-record-draft.md` is a draft,
and LOG/SCORECARD/README carry no round-4 entry.

Axis set: freshness (move), calibration (rider — the packet), depth (rider —
interim, designed not moved).
**Axis move: freshness** — the evidence base stops being `/tmp`-staged and the
lane's authority boundary becomes a filed, durable artifact.

Claim (falsifiable, one move, four mechanical clauses):
  (a) every archived evidence group carries a `MANIFEST.txt` (path · sha256 ·
      bytes) and, for the files an owning note pins, the archived hash equals
      the note's pin — equality asserted mechanically, one mismatch fails the
      clause;
  (b) `corpus/lessons/round-{1,2,3,4}.md` exist, each with a `## Gate` section
      (candidates / admitted / rejected with reasons / spot-check result) —
      `ls -A corpus/lessons | wc -l` → 4; round 4 is assembled from
      `plans/round-4-record-draft.md`, not re-derived from scratch;
  (c) every value in `SKILL.md` §Pins is re-derived **on a date strictly later
      than 2026-10-14** and the re-derivation is recorded with that date — the
      current ceiling is explicitly "same-day-later" (`SCORECARD.md:60`);
  (d) the approval-request packet exists at
      `corpus/handoffs/operator-approval-request.md`, contains **zero
      `/tmp`-only citations** (`grep -c '/tmp/'` → 0), and exactly one line is
      appended to `.ufo/l0-questions.md` naming the packet + its sha256.
Anti-claim (round 5, in force): NO external site is contacted. Filing the
packet is a request, not a grant; the loopback-only anti-claim of rounds 2/3/4
(`plans/round-{2,3,4}.plan.md:8`) holds until a recorded operator answer
naming **site + scope (+ budget for a rate surface)** is read back from
`.ufo/l0-questions.md`. A mid-round answer may be acted on only inside its
stated scope, and only after the read-back (line + sha) is recorded.
Measure: archive manifest equality count; `ls -A corpus/lessons | wc -l` → 4;
the §Pins re-derivation date stamp + match count; `grep -c '/tmp/'` on the
packet → 0; the L0 line verbatim + the file's pre/post line count; the
packet's cold-read verdict (below).

## 1. Why this move (candidate decision)

Scores at design time (`SCORECARD.md:57-62`, last change in brackets):
depth 7 [r3, +r4 rider], coverage 5 [r3, +r4 rider], operability 5 [r3],
**freshness 3 [r2]**, calibration 6 [r3], adjacency 5 [r1]. `AXES.md:25-31`
says work the lowest axis; `SCORECARD.md:75-81` already names freshness as
the planned next move.

- **Chosen: freshness.** Three reasons, all measured: it is the lowest axis;
  it is already the lane's stated plan; and it is the *precondition* of this
  round's headline deliverable — an approval request whose supporting evidence
  lives in 28 `/tmp` paths (294 M, all pins provisional) is not an honest
  "evidence classes ready" claim. The packet's readiness half **is** the
  freshness move.
- **Deferred — calibration (the packet as the move).** The packet is a
  self-assessment artifact (what the lane may do alone vs what it must ask),
  which is calibration's definition (`AXES.md:15`), and calibration is 6 while
  freshness is 3. Deferred because the taxonomy it rests on was already
  finalized in round 3 (calibration 4→6, `SCORECARD.md:61`) and because the
  packet's durability problem is the freshness problem. It rides as a rider
  with its own falsifier (§3.5).
- **Deferred — depth (the loopback edge classes).** Designed in §4 and run
  only after the packet is filed and the archive verifies; if either slips,
  the fixture work defers named to round 6. Depth stays 7 — a rider, not a
  move.
- Not re-planned: nothing in the round-4 record is contested here. The one
  open verdict-time question (which fixture branch each round-4 note admits)
  is the scribe's, per `plans/round-4-record-draft.md` §7 U-b.

## 2. The operator-awaits boundary (what it is, measured)

- The lane's disposition table is finalized and does not move:
  **C1 loopback = autonomous-now**; **C2 operator's own sites / C3 third-party
  read-only / C6 rate-limited = operator-asleep-blocked** (durable form:
  operator-approval-required); **C4 consequential = never lane-executed**;
  **C5 login-required = operator-approval-required**
  (`interaction-approval-table.md` §2; `SKILL.md:665-672`).
- The unblock gate is an *operator event*, not a lane action: "a go-ahead
  naming the site + scope" (C2/C3), "a budget (volume + cadence)" (C6)
  (`interaction-approval-table.md:58-62`).
- The delivery channel exists and has never been used by this lane:
  `MISSION.md:84-88` — "The operator is reachable via `.ufo/l0-questions.md`
  in the fleet repo: append a line `<lane> | round-<N> | <question or decision
  needed>`". Measured: `grep -n tabi .ufo/l0-questions.md` → **0 hits** in 24
  lines, while every other lane has filed entries. [observation]
- The boundary has therefore been *restated* four rounds running and never
  *articulated as an ask*: the round anti-claim names what is blocked, no
  artifact names what would unblock it. [observation] That gap is what round 5
  closes; it is the only part of the boundary the lane can move alone.
  [inference]
- Operator wake-state is not measurable from inside the lane (U2) and is not
  probed. The plan does not assume an answer arrives; it assumes the ask
  becomes answerable. [unknown]

## 3. The approval-request packet (design)

**Artifact:** `corpus/handoffs/operator-approval-request.md` — a handoff
artifact, not a knowledge note: it does not enter the knowledge count, the
coverage map, or the expansion trend. Precedent for the `corpus/handoffs/`
surface: `kake-shokunin/corpus/handoffs/cmdProbe-merge-fix.md` (CORPUS.md's
Layout lists `knowledge/` and `lessons/`; kake's tree shows the added surface
is accepted fleet practice). In-file: `filed:` date, `round: 5`, and a
`recheck:` line. One line appended to `.ufo/l0-questions.md` (MISSION.md:86
authorizes the append; exactly one line, no other main-repo edit, and the
lane records the line verbatim plus the file's pre/post line count).

### 3.1 The key split: which browser, not just which site

The lane has **two** interaction surfaces and they carry different rights:

| Surface | Needs | Rights load | Askable now? |
|---|---|---|---|
| The lane's own self-launched chromium + CDP harness (rounds 1–4 machinery) | nothing external | only the third party's page-visit question (C3) | **yes — this is the ask** |
| The bridge driving the operator's **real** browser | daemon up + `extension_connected:true` + their sessions | C5 + A6 (borrowed tab) + A9 (session stores) | **no — not requested** |

The smallest honest grant is therefore **harness-only**: the lane's own
browser, cold profile, no session, no cookies, no operator tab. Measured
today: the daemon is **down** (no 10086 listener, `curl` exit 7, no
`kimi-webbridge` process), so the bridge path is not even currently
executable; and the harness path is the one the lane has 11 notes of method
for. Requesting the bridge path in round 5 would load the ask with C5/A6/A9
for no evidentiary gain. [inference from measured state]

### 3.2 The asks (three rows; the operator answers by ID)

- **R1 — C3, read-only, harness-only (the ask that matters).**
  *What*: load **one** named public, non-authenticated page in the lane's own
  cold-profile chromium; no click, no fill, no submit, no login, no scroll
  beyond load; capture at the three existing rungs (screenshot + raw
  DOMSnapshot; the CDP Network-domain slice; URL/navigation history).
  *Budget*: 1 page · 1 cold run · ≤ 20 HTTP requests · ≤ 60 s wall · ≥ 1 s
  between navigations · first request is `/robots.txt` as the conventional
  permission probe, and a disallow → **stop and report**.
  *Stop-and-report* on the first 429 / 403 / CAPTCHA-or-interstitial / ToS
  gate; never retry through.
  *Produces*: `corpus/knowledge/real-site-observation-<host>.md` with
  per-claim anchors, plus the first measured rate/ToS datum if one is observed
  (approval-table U1) — the datum lands in the corpus either way, including a
  refusal.
  *Operator must state*: the exact URL and "observation only, no interaction".
- **R2 — C2, operator's own site.** Same terms as R1, reads only; the operator
  names the property (the lane has no ownership-verification surface, U3).
  Interaction (navigate/read) only if the operator says so in the same line.
  Consequential acts on an "own" property stay refused (`PROVINCE.md:17-18`).
- **R3 — C6, a budget.** Not a site but a number: max requests, cadence, and
  whether the budget may stand per-host or must be per-run. Rationale: the
  budget is C6's deciding axis and the lane may never self-assign one
  (`SKILL.md:635-638`). A grant under R1 without an R3 number runs at R1's
  own hard-coded budget, which is why R1's numbers are stated.

### 3.3 Not asked in round 5 (recorded so the operator sees the edges)

- **C4 consequential** (purchases/posts/deletions/submissions): never — a
  province boundary, not an approval gap (`PROVINCE.md:15-19`;
  `interaction-approval-table.md` §3 C4).
- **C5 login-required**: deliberately un-asked. The lane cannot complete a
  login, must not touch session stores, and a grant would need the operator
  present at the browser. Belongs to a later, separate packet.
- **A5 trusted input via `cdp`** ("advanced"): un-asked; it belongs with an
  interaction grant, not a read grant.
- **A4 daemon return-to-baseline**: closed as moot — the round-2 daemon is
  gone (OOM teardown ~13:10:59 local; `hygiene-sweep-r4.md` §4;
  `webbridge-daemon-disposition.md` §10), and the stale pid file is the
  round-2 pre-state pattern again.
- Restated so the ask's edges are explicit: the three never-set items
  (consequential external acts; session-material content-reads;
  out-of-province work) are not movable by any grant (`SKILL.md:704-711`).

### 3.4 Evidence classes ready (what the packet cites)

Each row is a note + pin (post-append values, §Pins `SKILL.md:44-63`) and the
archived path clause (d) requires:

| Class | Note | What it proves the lane can already do |
|---|---|---|
| static bytes | `cdp-evidence-patterns.md` `8de2ee008c9c` | screenshot + DOM evidence with determinism classes E1–E11; 9-item record envelope; cleanup proof |
| dynamic pair | `live-dynamic-capture.md` `f97f10238907` | before/after capture on a JS-mutating page, byte-identical across independent runs |
| multi-step journey | `multi-step-journey.md` `8925ce6c46c7` | 4-page traversal with real clicks/`insertText`/GET submit, per-step triplets, browser-side history witness |
| network rung | `network-evidence-rung.md` `4889ccf073a8` | per-step CDP Network slices, five correlated surfaces, D1–D8 layer-disagreement cases, byte-closure equation, fixture+server embedded in §11 (survives `/tmp`) |
| async pair | `async-step-evidence.md` `577af06bd9a8` | held-request pre/post pair; settle-wait discipline |
| approval taxonomy | `interaction-approval-table.md` `d6ad567a610c` | C1–C6 + A1–A12 with a gate and a falsifier per class |
| no-oral-context sufficiency | `executor-test-sufficiency.md` `5f04f6877e1e` | a fresh document-only executor ran the runbook verbatim; verdict SUFFICIENT |
| hygiene / closure | `hygiene-sweep-r4.md` `4ddc67151b98` | port/process/daemon closure proven per run |
| runtime + substrate pins | census `a4bbb39edb12` + substrate | chromium `152.0.7977.82`; plugin manifest `e70aff5c40ff`, plugin skill `84a8e69d04c5`, `operations.md` `b811d9c23dfd` |

Honest gaps the packet states in the same table (an ask that hides these is
not calibration): **zero** real-site datum; rate/ToS unmeasured (U1);
extension↔daemon handshake never verified (`extension_connected:false`
throughout; daemon now down); byte-identity is environment-scoped
(`live-dynamic-capture.md` §7.3; rung §10.8); POST forms, redirects with
bodies and CSRF-checked submits untested by rule (journey §8.6).

### 3.5 The packet's own falsifier (calibration rider)

A **non-author cold reader** — a fresh, document-only seat of the round-3
executor shape — must complete a grant/deny form from the packet alone: name
the site, the scope, the budget, the allowed classes, the forbidden classes,
and the evidence that will be produced, with **zero follow-up questions**. One
follow-up question amends the packet before filing, and the gap is recorded.
Continuity: this is the round-3 sufficiency pattern
(`executor-test-sufficiency.md`) applied to an outward artifact.

Answer discipline (stated in the packet): the operator answers by editing
`.ufo/l0-questions.md` in place (MISSION.md:87); the lane re-reads that file at
the start of every round and records the read — it never assumes an answer. A
denial is recorded as a calibration datum (a rejection is evidence of taste,
`LEARNING.md:12-14`), and the lane **does not re-ask** unless the ask
materially changes; each re-ask records its count.

## 4. Loopback-only interim depth moves (designed, deferrable)

Scoping rule that makes this coherent rather than a second axis: the interim
fixture mirrors **the read-only edge classes R1 can meet** — nothing that
belongs to an interaction or login grant. All of it is C1 (autonomous-now) on
the lane's own browser, and the base is the rung note's **embedded §11
fixture** (`network-evidence-rung.md:438-604`), chosen precisely because those
bytes survive `/tmp`.

**Interim move (one): "external-class fixture v2" — read-only edges.**
- **E1 redirect chain** — 302/303/307, a cross-path hop, and a hop that
  changes origin within loopback; measure which layer reports what. Anchor:
  rung §10.8 "real-site journeys (third-party JS, POST, redirects with bodies)
  untested by rule"; the rung fixture already carries one 302.
- **E2 rate/ToS-shaped responses** — a 429 + `Retry-After`, a 403, a
  robots-shaped body, and a CAPTCHA-shaped interstitial; the deliverable is
  the **stop-and-report predicate** (what gets recorded, and where the run
  stops), not a policy claim. Anchor: C6's gate
  (`interaction-approval-table.md:62`); `SKILL.md:635-638`.
  **Discipline that must be written into the note:** a loopback 429 is an
  *instrument*, never a C6 datum — asserting it as a rate/ToS surface would
  convert an unknown into a false claim (U1).
- **E3 third-party-JS-shaped async** — a lane-authored script that mutates
  after a long settle, issues a beacon-shaped POST, and fetches a resource
  that 404s and is canceled; extends the async rung's cancel-after-
  `responseReceived` case (rung §10.3, D3) and the settle-wait discipline
  (`async-step-evidence.md` §3).
- Measure: one compare table in the round-4 shape (per-capture png/shape/
  struct/url rows + netshape + wire rows) with verdicts counted; byte-identity
  across two cold runs; closure per run; a rules-delta section for the
  envelope.

**Deferred with named preconditions (not absorbed):**
- **Cross-origin iframe (A8)** — needs the *bridge* to be meaningful
  (top-frame-only is a bridge-tool behavior, `webbridge-plugin-anatomy.md:
  120-122`), and the bridge needs a daemon + `extension_connected:true`.
  Trigger: a grant that includes the bridge path, or a separate handshake
  round.
- **Daemon/extension handshake** — the daemon is down; a doc-authorized
  self-service `start` (A1) would re-open the A4 "return to baseline" debt that
  round 4 closed as moot, and the round-4 daemon died by OOM. Trigger: an
  operator line on whether to re-start, or a grant that requires it.
- **`isTrusted`-rejecting fixture / CSRF-token POST** — belongs to the
  interaction grant (R2's optional half), not to a read grant. Trigger: R2
  granted with interaction.
- **Real-site journeys** — out of scope by anti-claim until R1 is answered.

**Interim stop rule:** the fixture work starts only after (i) the packet is
filed and (ii) the archive verifies. If either slips, the fixture defers named
to round 6. No fixture may embed a real site's bytes or markup — a mirror
carries the third party's rights question and default-denies to C3 (U7); every
fixture stays lane-authored.

## 5. Step 0 — the round-4 integration debt (not an axis move)

Round 4's record was never assembled (`plans/round-4-record-draft.md` is a
draft; `corpus/README.md` still reads 8 notes / 1944 lines; no LOG/SCORECARD
round-4 entry; the work is uncommitted at `094c27a`). Round 5 must land it
first: the LOG round-4 entry, the SCORECARD verdict/move-log/axes rows, the
coverage rows + the header count, the `network-evidence-rung.md` §11-embedded
fixture exception, and the commit. Clause (b) of the claim depends on this
landing, so it is a precondition, not an extra axis.

## 6. Deliverables + seats

- `corpus/evidence/<group>/` + `MANIFEST.txt` per group + one knowledge note
  `corpus/knowledge/evidence-archive-index.md` (the index is a note because
  `knowledge/` is the corpus contract's review channel; the bytes are not
  notes). **Archive rule:** pinned artifacts only — scripts, fixture bytes,
  per-run PNGs/JSON/TSV and compare tables; **exclude** `*/profile/*`. Ground:
  `w4-t41-network/run1` is 3.4 M of which `profile/` is 3.1 M and the 21
  pinned artifacts are 224 102 B; excluding `*/profile/*`, eight sampled groups
  total 1028 files / ≈12.2 MB of 294 M. Exclusions are listed with their sizes
  in the index, not silently dropped. — seat **TABI-R5-1**.
- `corpus/lessons/round-{1,2,3,4}.md` with `## Gate` sections; round 4
  assembled from the draft. — seat **TABI-R5-2**.
- `corpus/handoffs/operator-approval-request.md` + the one L0 line + the
  cold-read record. — seat **TABI-R5-3**.
- External-class fixture v2 (§4), if the stop rule permits. — seat
  **TABI-R5-4**.
- Verification + outside spot-check (non-author: archive re-hash, packet
  cold-read, §Pins strictly-later-date re-derivation, the standing Brave
  reject re-run — `ls -A ~/.config/BraveSoftware/Brave-Browser/` →
  `NativeMessagingHosts` only, rounds 1–4 agree). — seat **TABI-R5-5**.
- Round-5 record (LOG, SCORECARD verdicts + move log + axes, README coverage
  rows). — scribe.

## 7. Bounds & unknowns

- [unknown] Whether an operator answer arrives at all, and in which round; the
  plan does not assume one (§2).
- [unknown] Whether an archived hash will still equal its note pin at
  archive time — `/tmp` groups have been alive since round 1 and nothing
  guarantees intactness; a mismatch is recorded as a freshness finding against
  the note, never quietly repaired (append-only errata).
- [unknown] Whether the packet passes the cold-read test on the first attempt;
  a follow-up question is a recorded gap, not a failed round.
- [inference, medium] The interim fixture's read-only edges are the right
  preparation for R1 because R1 is read-only; if the operator grants R2 with
  interaction instead, the deferred classes (CSRF/token POST, `isTrusted`)
  become the relevant set and §4 re-orders.
- Fleet-level, **reported not absorbed** (adjacency): `shokunin.conf:61`
  declares `tabi|tabi-shokunin|coverage + calibration (browser &
  web-interaction craft)`, but `scripts/shokunin-watchdog.sh:14` `LANES` omits
  tabi and `.ufo/state/tabi.round` does not exist — the lane's rounds are
  driven outside the watchdog roster. Not this lane's file to fix; named for
  the integrator.
- Evidence bytes are still `/tmp`-staged at design time; every hash in this
  plan is provisional until clause (a) lands (`cdp-evidence-patterns.md:92`).

## 8. Discipline (round 5)

Substrates read-only (plugin dir, `/tmp` scratch, daemon files); secrets
shape-only (`identity.json` / daemon logs never content-read); loopback-only
probes with cleanup verified per run; no external site; one axis move;
append-only errata; observation / inference / unknown kept separate
(`corpus/QUALITY.md`). Write scope per seat; the L0 append is the single
main-repo write, and it is authorized by `MISSION.md:86`.
