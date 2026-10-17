# tabi-shokunin — round 7 record — DRAFT (scribe prep)

**Status: DRAFT, not the record.** This file is the round-7 **verification
table + pivot note** — written 2026-10-14T18:28Z (15:28 -03) by lane **SCR-B7**
(round-7 scribe prep; assignment: this file only). The round-7 record itself
(LOG entry, SCORECARD verdicts + move log + axes, README coverage rows, commit)
is assembled later by the round-7 scribe from the seats' landed files plus this
table. Measurements here are read-only (lane tree, `.ufo/l0-questions.md`, the
webbridge substrate, `/tmp` scratch of sibling seats); nothing outside this file
was written by this lane. Scratch: `/tmp/w7-scrb7/` (volatile). Discipline
(`corpus/QUALITY.md:1-7`): observation / inference / unknown separated; secrets
shape-only (never content-read); substrates read-only; no external site; as-of
stamps UTC unless marked `-03`. Values measured 18:20:26–18:26:57Z unless
stamped otherwise; **every value that moves must be re-derived at record time**
— round-7 seats were landing artifacts while this table was being measured
(§5, §6, §9).

## 0. The pivot note — the l0-answer-check outcome (decides the branch)

**Outcome: no answer. The round runs Branch L (loopback depth).** The check was
made mechanically at 18:20:26Z, re-checked at 18:25:38Z and again at 18:26:57Z;
`.ufo/l0-questions.md` did not move across the three reads.

| Quantity | Round-5 filing state (record) | Measured now | Verdict |
|---|---|---|---|
| lines | 25 (`wc -l`) | **25** | unchanged |
| bytes | 21,539 | **21,539** | unchanged |
| sha256 | `02c53ec60acfda4889e0cd57eb08e8f1bd5583708fcb8399bfc5a5593713613f` | **same** | unchanged |
| mtime | 2026-10-14 14:05:52 -03 | **2026-10-14 14:05:52.482908587 -03** | unchanged |
| tabi regions | 1 (line `:25`, the round-5 filing) | **1** (`:25`, same line; `grep -c '^tabi'` → 1) | unchanged |
| pre-append state (round-5 record) | 24 lines / 20,653 B / `0a86973bd17c37f7` | — | filing proof stands (cited, not re-run) |

- The single `tabi`-matching region is `:25` — the round-5 filing line (packet
  `sha256 94dc63f5fb9e…`); no line below it, no edit inside it.
- The answer channel is the file itself ("the L0 answers by editing the file in
  place", `MISSION.md:84-88`); operator presence is never itself a grant channel
  — only the read-back is (plan Step 0.1 :75-81).
- Classification per the plan's gate (:83-101): **"No diff / no answer" →
  Branch L**. Silence is not a denial; the ask is unchanged; **ask-count stays
  1** and the packet is **not re-asked** (:99-101).
- Consequence (plan Branch L :219-263): no external site; the packet stays
  filed; loopback only; cleanup verified per run; round-6's L1 is the mechanical
  carried-debt check (L0) and the state-changing-step class is the round's move
  (L1).
- Mid-round switching rule (Step 0.3 :102-105): a mid-round answer may be acted
  on only inside its stated scope, after its own read-back is recorded, and the
  record must show the read-back precedes the act. Nothing observed triggers it:
  three reads, byte-identical.
- Clause (c) unchanged: `date -u +%F` → **2026-10-14** (18:20:26Z, 18:26:57Z); a
  strictly-later-date §Pins re-derivation is impossible by construction today
  (earliest 2026-10-15). Carried, not failed.

## 1. Plan reference (measured)

| Item | Value |
|---|---|
| `plans/round-7.plan.md` sha256 | `fa1394967c7405ac338df3529bb3afee4c13ae8d1932b14fe90bbbe883ebd6e6` |
| lines | `wc -l` → **342**; logical **343** (last line unterminated, ends `...only (PREP-B7).`) |
| git state | committed in `c0467a6`; worktree == HEAD for this path (`git diff HEAD` → empty) |
| design/authority | the plan **is** the design text (lane PREP-B7; header states freeze 2026-10-14T17:41:44Z; file mtime 14:45:18 -03 = 17:45:18Z) |

**Record delta, append-only (the record must carry this):** the round-6 record
draft (committed, itself a source) measured this plan at 17:45Z as sha first16
`4e0261de5d534739` / 331 `wc -l` (`plans/round-6-record-draft.md` E1). The
plan's final bytes are the 342-line revision above — the earlier reading was a
mid-write snapshot; nothing is harmonized, both values stand as recorded, and
the record cites the current sha.

The plan's branch gate (verbatim, :85-104): *"No diff / no answer" → Branch L*;
*"Answer naming ≥1 of R1/R2/R3" → Branch G* (default-deny; anything not named is
not granted); an explicit denial is a calibration datum resolving to Branch L; a
scope-less answer is not a grant; *"Bridge-path / daemon-revival approval … →
Branch D eligibility"*, D running only as far as the approval names (D0
:176-190 — the A1/U6 reading tension stays unexercised). Claim (:49-51): one
axis-move, exactly one branch. Seats (:296-307): gate + record; branch
execution; freshness/debt; verification + outside spot-check (`LEARNING.md:37-43`);
scribe. Write scope per seat; `.ufo/l0-questions.md` is touched by no lane this
round (no new line; a gate read only).

## 2. Step 0 gate — precondition sweep (round-6 clauses a–d, checked not assumed)

The round-7 plan (:107-134) makes the round-6 clauses this round's precondition
set. Status vocabulary: **PASS** · **CARRIED** (impossible/owed by construction,
recorded in force) · **DEBT** (owed, named) · **N/A** (no object — grant/approval
absent by default-deny) · **IN FLIGHT** (round-7 seat working; partial artifacts
observed) · **NOT LANDED** (no artifact).

| # | Predicate | Evidence as measured | Status |
|---|---|---|---|
| a | round-6's Step-0 read-back (line + sha + counts) and branch classification findable in the round-6 record | `plans/round-6-record-draft.md` §0 :17-52 (committed; 371 `wc -l`, `7ca4ab3d90f6…`): table with `:25` / `02c53ec6…` / 25 lines / 21,539 B / pre-state 24 / 20,653 B and the classification **Branch L**; `LOG.md:133` round-6 entry: *"l0 still unanswered — loopback branch held"* | **PASS** |
| b-G | G branch: note `real-site-observation-<host>.md` (or the refusal datum), budget, stop events | No grant exists (L0 unchanged; default-deny by construction); no such note among the 15 notes in `corpus/knowledge/` (B7-3's independent grep `-i 'real\|observation'` → no match, its §4) | **N/A** (nothing to verify) |
| b-D | D branch: daemon revival / bridge approval | No recorded bridge/daemon approval (L0 unchanged; the packet deliberately left the bridge un-asked; D0 unmet); daemon still down (this lane's read, §5) | **N/A** (D0 unmet) |
| b-L | L branch: round-6's L1 matrix (wire-class/cache-revalidation for repeated same-URL subresources) — compare-table verdict counts, cells complete vs planned, byte-identity rows, closure lines per run, rules added, falsifier fields | **NOT LANDED as a note.** The fixture-v2 note itself names the matrix *"a separate seat's"* (`external-class-fixture-v2.md:564-565`); round-6 record draft §3 L1a "IN FLIGHT" → its E3 "still not landed"; B7-3's readiness note independently records *"the round-6 L1 matrix … did not land"* (§4). Scratch only: `/tmp/w6-tabi-b61/` (chain-run1/2/3, `compare-chain.tsv` 13 rows, probe-{robots,429,429b,429h,403,403h,captcha}, mtimes 14:41–14:51 -03; read-only peek) — **now being archived** (`corpus/evidence/w6-tabi-b61/`, §5-§6) | **CARRIED** (round-7 L0 obligation, :225-230) |
| b-L2 | round-6's L2 fixture state (for the round-7 reuse rule) | Redirect chain + rate/ToS-shaped instruments **LANDED** (fixture-v2 note, committed `c0467a6`; 302→303→307 chain incl. cross-path hop + origin change, POST arm `/m/307`; four rate/ToS-shaped instruments; stop predicate proved from both sides; closure per run — note :76-77, :454-469). E3 third-party-JS-shaped async (late settle, beacon-shaped POST, canceled 404) **NOT landed** — the note's own handoff carries it (:561-563: *"stays unlanded and is carried to the round-6/7 record"*) | **Landed (2 of 3 item classes) / carried (async)** — plan :252-257 reuse applies to the landed part; never re-derive |
| c | freshness: §Pins re-derived on a date strictly later than 2026-10-14 | `date -u +%F` → **2026-10-14** — impossible today; plan says carry (:117-119, :265-272). Same-day values re-derived instead: §4 — **14/14 notes + 1/1 report + 3/3 substrate match**; history pins 5/5 | **CARRIED** (values re-derived same-day, §4) |
| d1 | new note + coverage row (`corpus/README.md`) + SKILL distillation | Notes **LANDED** (2, committed: `external-class-fixture-v2.md`, `webbridge-revival-assessment.md`); SKILL distillation **LANDED** (+32/−1 in `c0467a6`); coverage row **NOT LANDED** — `corpus/README.md` untouched by `c0467a6`; header `:5-9` still reads *"Held at round 3 … 8 knowledge notes, 1944 lines … Lessons: 0"* vs actual **15 / 4,565 / 5** (18:24Z) | **DEBT** (recorded as a finding first, per plan :288-290) |
| d2 | LOG entry + commit | **LANDED** — `c0467a6` *"probation round 6 (training r5): see LOG"* (15:17:26 -03; 9 files, +1,957/−1); `LOG.md` 133 lines, round-6 entry last | **PASS** |
| d3 | lessons count with Gates | re-derived **5** (`round-1..5.md`, one `## Gate` each; shas `bdd46c85b349`/59, `a862d69cb0b9`/60, `153a1b9831bb`/69, `cde3960eb1a9`/87, `46029f48e27d`/139). The plan's frozen **"→ 4"** (:120-124) predates round-6's landing of `round-5.md`; the count this table asserts is **5** | **PASS** (count asserted; §7 U-d for the round-6 lesson) |
| d4 | archive present (25 groups / 25 manifests) + spot re-hash ≥3 groups vs owning notes' pins | At 18:25Z: **28 group dirs / 28 `MANIFEST.txt` / 1,403 files / 9,007,188 B** — the round-5 25-group set (25 / 1,035 / 6,889,272 B) plus **3 round-6 scratch groups mid-landing** (`w6-tabi-b61` 140 f, `w6-ver-b6` 188 f, `w6-aud-b6-scratch` 40 f; dir mtimes 15:24 -03; round-7 archive seat, §6). Spot re-hash 3 groups (same as AUD-B5/r6/SCR-B6 for comparability): 269/269 OK, 0 FAILED, exit 0 each (§8 SC-2). Note-pin instances 3/3 MATCH (§8) | **PASS (spot) + IN FLIGHT** (tranche landing) |
| d5 | packet `/tmp`-free + the L0 filing line | packet 121 `wc -l` / 13,103 B / `94dc63f5fb9e…` (**byte-identical to filing**; B7-3 §0 concurs); `grep -c '/tmp/'` → **0** (exit 1); L0 `:25` cites the packet + its sha | **PASS** |
| d6 | standing Brave reject re-run | `ls -A ~/.config/BraveSoftware/Brave-Browser/` → **`NativeMessagingHosts` only** → agree. **Count asserted: 7th consecutive** — lineage: r1/r2 agreement rows (SCORECARD :21, :29), r3 "third consecutive" (:49), r5 record "fifth", SCR-B6 derived 6th for r6; the drift note (the round-6 plan's own "5th") stays recorded, not harmonized | **PASS** |
| d7 | carried design-time debt: README header counts + SCORECARD r4/r5 verdict tables | re-derived: **README** header stale (§d1) + its Frontier block still says "thirteen `/tmp` evidence groups" vs 28 dirs now; **SCORECARD** has primary-verdict tables for r1–r3 only (:18, :26, :38) — **r4/r5/r6 verdict tables absent**; axes table (:53-62) still carries the round-3-pinned scores (depth 7 / coverage 5 / operability 5 / freshness 3 / calibration 6 / adjacency 5; last-change stamps r3/r2/r1); move-log rows **4–6 sit after "## Planned / retired"** (:73) at :83-85 | **DEBT** (named; the round-7 scribe should land or name them) |

Also re-checked and found resolved (recorded, not silently): the old SKILL §Pins
"297 → 298" line-count nit — the count convention is now stated in §Pins (*"a
file whose last line is unterminated reads one lower than its logical line
count"*) and `hygiene-sweep-r4.md` §7 E2 rules it resolved on convention;
nothing needed re-editing.

## 3. The round-7 claim's verification table (Branch L — the operative branch)

Predicates below are the round-7 plan's Branch L + Measure sections, made
mechanical. "Observed" is this lane's read at 18:20–18:27Z; status vocabulary as
in §2.

| # | Predicate (pass condition) | Expected | Observed @ 18:2xZ | Status |
|---|---|---|---|---|
| L0 | round-6's L1 matrix executed first if unlanded (carried debt, not a second move) | rule + falsifier + cells, or the negative result with the matrix | round-6 L1 **not landed** (§2 b-L); no round-7 artifact yet (no matrix note among 15) | **IN FLIGHT / NOT LANDED** |
| L1a | POST form submit with a request body (closes the r3 gap directly) | cell logs + per-cell verdicts | no artifact yet | **NOT LANDED** |
| L1b | redirect-after-POST semantics, 303 vs 307, second hop measured on both surfaces | per-cell both-surface record | no artifact yet (r6's 302→303→307 chain is the available instrument, landed) | **NOT LANDED** |
| L1c | CSRF-shaped token instrument (minted per render, consumed once, second submit refused) | instrument + run | no artifact yet | **NOT LANDED** |
| L1d | replay contract for the non-idempotent step (fresh server-state root; token re-mint; divergence measured/classified) | stated contract + rows | no artifact yet | **NOT LANDED** |
| L1e | per-cell layer-decision record {wire, client, token, server state}; N ≥ 2 cold runs per cell; one factor per cell | filled cells + falsifiers | no artifact yet | **NOT LANDED** |
| L2 | instruments: execute only if unlanded by round 6; else reuse as-is | reuse | 2 of 3 landed by r6 (§2 b-L2); E3-async carried | **PARTIAL (reuse + carried)** |
| L3 | guards: byte-identity or measured divergence; both network surfaces kept; closure per run (kill by PID, ports closed, `curl` exit 7) | per-run closure lines | r6 provenance: closure per run with `closure.txt` (fixture-v2 :454-469); round-7 L1 runs pending | **PARTIAL (r6 provenance; r7 pending)** |
| L4 | lane-authored fixtures only; mirrored real-site artifact stays U7 default-deny | no mirrored artifact | no artifact yet; rule stands (fixture-v2 §1 header) | **HOLDS** |
| FR | freshness rider: strictly-later-date pass iff `date -u +%F` ≥ 2026-10-15 | date + match count | 2026-10-14 → **carried**; same-day 14/14 + 1/1 + 3/3 (§4) | **CARRIED (values matched)** |
| M1 | new note + coverage row + SKILL distillation (round-7 notes) | row + distillation | no round-7 branch note yet; the readiness note (B7-3) landed untracked 18:25Z with **no** coverage row yet; `SKILL.md` is being edited in-wave (+34, additions-only, §5) | **IN FLIGHT / DEBT** |
| M2 | lessons count | "→ 4 (or the missing file named)" | re-derived **5** (§2 d3) | **PASS (count asserted 5)** |
| M3 | LOG entry + commit (lane identity, `AGENTS.md:3`) | round-7 entry cites evidence; commit | owed — HEAD still `c0467a6`; round-7 files untracked/modified | **NOT LANDED (owed by scribe)** |
| M4 | Brave reject (as §2 d6) | agree or disagreement recorded | agree; 7th asserted | **PASS** |
| M5 | L0 read-back precedes any act; ask-count printed | read-back first | this table §0 (three byte-identical reads before any branch act); ask-count **1** | **PASS (as far as measurable)** |
| AC | anti-claim: no external site; loopback only; packet stays filed; not re-asked | nothing external; nothing filed | holds as far as measurable: L0 unchanged (no grant can exist — default-deny by construction); the round-7 artifacts observed are loopback fixtures/notes; this lane ran no browser | **HOLDS** (restate in record) |
| FL | fleet-level, reported not absorbed: tabi outside the watchdog `LANES` roster | named, not fixed by this lane | `scripts/shokunin-watchdog.sh:14` → `protocol aggregator kasegi kengaku kake kumitate kotoba kagi kama` — **tabi still absent** (carried from r5). Fleet closeout for round 6 landed: `b2bfcc6` *"training wave-6 closeout: round 6 … all lanes 5/10"* | **REPORTED** |

Boundary: this lane did **not** author or audit the branch seats' work; the
statuses above are reads of file presences, timestamps and heads. The
verification seat + outside spot-check (`LEARNING.md:37-43`) own the verdicts.

## 4. §Pins re-derivation — same-day (2026-10-14, 18:22–18:26Z)

Pin authority: the §Pins errata block (`SKILL.md:773-795` — the round-5 B5-3
refresh, *"supersedes the note pins in §Pins above for post-append use"*, its
post-append table at :778-794) + the round-6 SKILL-upgrade block (`SKILL.md:796`
— the two round-6 notes' pins) + the 12th note (archive receipt, outside the
block) + the report pin + the substrate trio. The plan's rider (:267-272) names
"12 notes + the report pin + the 3 substrate pins"; the current set is **14
notes** (the two r6 notes postdate the rider's count) — the refresh was executed
over all of it.

| # | Source | Pin (authority) | Re-derived @ 18:2xZ | `wc -l` |
|---|---|---|---|---|
| 1 | `async-step-evidence.md` | `05dcda5e60b9` | `05dcda5e60b9` | 282 ✔ |
| 2 | `browser-surface-census.md` | `a33c22644d64` | `a33c22644d64` | 265 ✔ |
| 3 | `cdp-evidence-patterns.md` | `337ff64579e8` | `337ff64579e8` | 234 ✔ |
| 4 | `executor-test-sufficiency.md` | `32772e343848` | `32772e343848` | 329 ✔ |
| 5 | `hygiene-sweep-r4.md` | `87155e12021d` | `87155e12021d` | 258 ✔ |
| 6 | `interaction-approval-table.md` | `b5e29a9a2adf` | `b5e29a9a2adf` | 246 ✔ |
| 7 | `live-dynamic-capture.md` | `01266495b761` | `01266495b761` | 245 ✔ |
| 8 | `multi-step-journey.md` | `e0367890f1cf` | `e0367890f1cf` | 349 ✔ |
| 9 | `network-evidence-rung.md` | `d1564f38dc14` | `d1564f38dc14` | 609 ✔ |
| 10 | `webbridge-daemon-disposition.md` | `fd5f6861aa3b` | `fd5f6861aa3b` | 274 ✔ |
| 11 | `webbridge-plugin-anatomy.md` | `8d1488ab763e` | `8d1488ab763e` | 290 ✔ |
| 12 | `archive-receipt-r5.md` (outside the block) | `b41c2f6fb5a4` | `b41c2f6fb5a4` | 180 |
| 13 | `external-class-fixture-v2.md` (r6, SKILL:796) | `4aa604f1788b` (provisional, "moving in-wave" at r6) | `4aa604f1788b` — **stable since 17:52Z; frozen at commit** | 569 |
| 14 | `webbridge-revival-assessment.md` (r6, SKILL:796) | `a07c8aedc161` | `a07c8aedc161` | 322 |
| 15 | report `reports/r4-aud-tab1.md` (not a note) | `5f44b0f94483` | `5f44b0f94483` | 167 ✔ |
| 16 | substrate `kimi.plugin.json` | `e70aff5c40ff` | `e70aff5c40ff` | 24 |
| 17 | substrate `skills/kimi-webbridge/SKILL.md` | `84a8e69d04c5` | `84a8e69d04c5` | 158 ✔ |
| 18 | substrate `references/operations.md` | `b811d9c23dfd` | `b811d9c23dfd` | 34 ✔ |

**Match: 18/18.** Also re-derived (anchors, not §Pins rows): `SKILL.md` at its
committed revision `a8ba10b86138…` (795 `wc -l` / 70,687 B — equals SCR-B6's
closing snapshot; **then moved in-wave**, §5); daemon binary `71067480bd99…`
(first16). History pins (re-derived from git): `49f0735b0594` / `9e4d69dcd658` /
`034b1e53b004` (`git show 7961735:<path>`), `56224aa88430` (`5d2e95d`),
`452bc514d387` / 576 (`094c27a:SKILL.md`) — **5/5 match**. Independent
corroboration: B7-3's readiness note re-binds the same 14 note values (its §2
list) — two lanes, same values, no contradiction.

**New artifacts, provisional (not §Pins; re-derive at record time):**
`corpus/knowledge/packet-readiness-r7.md` `e9bc7ee18606…` (113 `wc -l`,
17,609 B, untracked, 18:25Z — a round-7 note, moving); `reports/r5-aud-b5.md`
`d09f1712cbcf…` (170, 11,580 B); `reports/r6-aud-b6.md` `9428ddec52b9…` (178,
13,682 B); `corpus/lessons/round-5.md` `46029f48e27d…` (139); `LOG.md`
`9e19c5404539…` (133); `SCORECARD.md` `2a33215a455f…` (85); `corpus/README.md`
`e156bb99af2c…` (59). Every new hash is provisional until the archive/README
rows catch up (`cdp-evidence-patterns.md:92`).

Same-day limit (restated): this is a 2026-10-14 derivation; clause (c) requires a
**strictly later date** and remains **CARRIED** (earliest 2026-10-15). The
durable witness should be a dated in-repo block whose commit date is ≥
2026-10-15.

## 5. Baseline anchors (repo state @ 18:20–18:27Z)

- HEAD `c0467a67c7491051b80c3f4a8dd193e833a9fad7` *"probation round 6
  (training r5): see LOG"* (2026-10-14 15:17:26 -03). Round-6 commit contents
  (measured): 9 files — `LOG.md` (+1), `SCORECARD.md` (+1), `SKILL.md` (+32/−1),
  the 2 new notes, `corpus/lessons/round-5.md` (139), `plans/round-6-record-draft.md`
  (371), `plans/round-7.plan.md` (343), `reports/r6-aud-b6.md` (179) — 1,957
  insertions, 1 deletion total.
- **`git status --short` moved mid-measurement:** empty at 18:20:4xZ; at
  **18:25:38Z** → ` M SKILL.md`, `?? corpus/evidence/w6-aud-b6-scratch/`,
  `?? corpus/evidence/w6-tabi-b61/`, `?? corpus/evidence/w6-ver-b6/`,
  `?? corpus/knowledge/packet-readiness-r7.md` — the first round-7 landings (§6).
  Any earlier "clean tree" statement is superseded by this row.
- Knowledge: **15 notes / 4,565 lines** at 18:24Z (14 committed at `c0467a6` =
  4,452 lines + the untracked readiness note 113). `ls corpus/knowledge/*.md |
  wc -l` → 15.
- `SKILL.md`: at 18:24Z the committed revision `a8ba10b86138fe39…` / 795 `wc -l`
  / 70,687 B; at 18:26Z **in-flight edit** `c0d2629ecbcf…` / 829 `wc -l`,
  `git diff --stat` **+34/−0** (additions-only; new sections "Harness archive —
  durable harness/fixture bytes (usage)" and "Layer routing — which layer
  decides a claim"). The record re-derives.
- Archive: 28 groups / 28 manifests / 1,403 files / 9,007,188 B (round-5 set =
  25 / 1,035 / 6,889,272 B + 3 round-6 groups mid-landing, above). The r5
  receipt's own numbers stand as written (1,010 evidence files / 6,780,293 B +
  25 manifests; 5,668 files / 313,772,976 B excluded, shape-only).
- Lessons: 5 files (59/60/69/87/139 `wc -l`), one `## Gate` each (§2 d3).
- Packet: 121 / 13,103 B / `94dc63f5…`; `/tmp` → 0. L0: 25 / 21,539 B /
  `02c53ec6…`.
- Reports: r4-aud-tab1 167 `5f44b0f94483`; r5-aud-b5 170 `d09f1712cbcf`;
  r6-aud-b6 178 `9428ddec52b9`.
- Daemon (read-only re-measure at 18:25Z): `ss -ltn` → **no listener on 10086**
  (grep exit 1); `pgrep -x kimi-webbridge` → **none** (exit 1); `~/.kimi-webbridge/`
  shapes only — `daemon.pid` 8 B, `daemon.addr` 16 B (both mtime 2026-10-14
  10:46:31.840 -03), `identity.json` 36 B (never content-read), `logs/daemon.log`
  3,591 B (mtime 12:46 -03), `daemon.log.prev` 19,532 B (mtime Oct 11 18:39
  -03). Matches the recorded post-shutdown pattern (disposition §10); the change
  point is still not measured by any record (§7 U-g).
- Brave reject: `NativeMessagingHosts` only (7th asserted, §2 d6).
- Debt line refs: `corpus/README.md:5-9` stale header (and its Frontier block
  "thirteen `/tmp` evidence groups"); `SCORECARD.md:53-62` axes table
  (round-3-pinned), `:83-85` move-log rows after "Planned / retired" (`:73`), no
  r4/r5/r6 verdict tables.
- Fleet repo (`/home/vgpnk/Projects/shokunin`): HEAD `49f4a2f` *"w16: spec +
  SHARED + 10 wave-A briefs (g2d r76, g3d r85)"*; prior `b2bfcc6` *"training
  wave-6 closeout: round 6 — … all lanes 5/10"*; prior `6963296` *"training
  wave-5 closeout: round 5 …"*; sole dirty entry `?? kwin.txt`. Note (so the
  scribe does not conflate): the `.ufo/waves/shokunin-train-20261101-w16` dir is
  **another province's wave** (g2d/g3d arms; 10 seats) — not this round's
  registry; the round-6 record treated `…-w15` the same way.

## 6. In-flight sibling state (this lane's reads, not audits)

| Input | Expected from | Observed @ 18:2xZ |
|---|---|---|
| round-7 archive tranche (round-6 `/tmp` groups → `corpus/evidence/`) | archive seat (scratch `/tmp/w7-tabi-b72-*`: `archive/`, `man*.txt`, `fid*`, `diff.txt`, `src*.txt`) | **landing live**: `w6-tabi-b61` (140 f), `w6-ver-b6` (188 f), `w6-aud-b6-scratch` (40 f), each with `MANIFEST.txt`; dir mtimes 15:24 -03; total dirs 25 → **28**; done-ness not audited here |
| SKILL distillation for the round-7 state | synth seat (scratch `/tmp/w7-b71-synth`) | **`SKILL.md` modified in place** (+34/−0, additions-only, §5); not yet committed |
| packet readiness note | lane B7-3 (self-id in its header) | `corpus/knowledge/packet-readiness-r7.md` landed 18:25Z (17,609 B, 113 `wc -l`, untracked; its header stamps re-derivation 18:20–18:38Z — **a future time at this lane's read; recorded as-is, not smoothed**). Headline (its verdicts, not this lane's): 9/9 packet classes backed by landed notes; **9/9 cited note pins stale** (= r4-commit values; its re-bound list = §4's 14 values); substrate 3/3 hold; cold-read verdict still unexecuted; round-6 L1 debt confirmed |
| archive audit | AUD-B7 | `/tmp/w7-aud-b7-tabi-r4-1-network.check` (4,104 B), `…r4-2-async.check` (3,246 B), `…w4-t41-network.check` (7,333 B), all mtime 15:22 -03 — contents are `<file>: OK` lines over group methodology/fixture files (read as heads only); `/tmp/w7-aud-b7-scratch/` empty at 15:22. Verdicts are AUD-B7's |
| other provinces' lanes (mado, tsukuroi, tameshi, x7 seats) | fleet siblings | 49 `/tmp/w7-*` entries at 18:26Z (mado: `w7-aud-m7-{gate,poll,probe,regression}`, `w7-{m7-3,mado-m7-2,mado-m7-4,scr-m7,ver-m7-poll}`; tsukuroi: `w7-{s73-tsukuroi,scr-s7-tsukuroi,tsukuroi-s71,s72,s74,tsukuroi-vers7,preps8-tsukuroi}`; tameshi: `w7-{tameshi-1,tameshi-1-pins,tameshi-scr-t7,tameshi-t72,t7-3-work,t7-4-work,t7-4-regr}`; plus `prept8`, `aud-t7-*`, `aud-x7-*`) — **out of this lane's province**; reported, not read beyond listings |
| this lane's own scratch | SCR-B7 | `/tmp/w7-scrb7/` — `chk-{group}.txt` (3 archive checks), `poll.sh` + `poll.log` (bounded poll, §9 E1), volatile |

Poll plan for the final scribe: this lane ran a bounded poll — `/tmp/w7-scrb7/poll.sh`
(30 × 20 s ≈ 10 min cap, started 18:29Z; log `/tmp/w7-scrb7/poll.log`), sampling
the L0 file, the tabi tree, `corpus/knowledge/`, `corpus/evidence/`, `SKILL.md`
and the wave's scratch dirs each iteration. Every moving value (pins, counts, L0
lines, manifests, scratch, the in-flight SKILL/archive/note arrivals of §5-§6)
must be **re-derived at record time** — the r4/r5/r6 lesson.

## 7. Unknowns (explicit)

- U-a: whether round-6's L1 matrix (L0 debt) is executed in round 7 and lands as
  a note — filename, cells, verdicts unknown; a negative result is allowed with
  the matrix, never a claim by exhaustion.
- U-b: whether the round-7 L1 (state-changing step) matrix lands; which cells
  complete vs planned; whether the CSRF/replay instruments hold.
- U-c: whether the E3-async cells (late settle, beacon-shaped POST, canceled
  404) land (carried from r6 :561-563).
- U-d: the round-6 lesson — `corpus/lessons/round-6.md` does not exist; the
  pattern shows lessons land one wave late (`round-5.md` landed in the r6
  commit; `round-4.md` mid-r5). Whether round 7 lands `round-6.md` is open; the
  plan's "→ 4" is already superseded (5).
- U-e: README coverage rows (rounds 4–7) and SCORECARD r4/r5/r6 verdict tables +
  axes updates — open (§2 d1, d7); the readiness note also needs its coverage
  row.
- U-f: when/where the strictly-later-date §Pins block lands (earliest
  2026-10-15) and its durable witness (in-repo dated block + commit date).
- U-g: the daemon change point (when/why the listener died — r4 OOM lineage)
  still unmeasured; operator-side disposition owed (D2 lineage); D branch
  unexecutable without a recorded approval (D0) — none observed.
- U-h: whether a mid-round answer arrives; the read-back-before-act rule (§0)
  governs and the branch may switch only inside the granted scope.
- U-i: archive completeness of the live tranche — the 3 w6 groups landed
  mid-measurement; whether their manifests self-check, whether more groups
  (`w6-tabi-b62`/`b64`, `w6-scrb6-*`, w5 peers F3) follow, and whether the r6
  notes' provisional pins graduate.
- U-j: the packet's lapsed pin block (B7-3's finding) — whether the record or
  the operator re-binds it via append-only erratum or re-files (the packet's §6
  rule); the cold-read verdict (DEBT since r5) stays unexecuted.
- U-k: whether the in-flight `SKILL.md` revision (+34) completes as
  additions-only and which line refs shift; the record re-derives.
- U-l: whether AUD-B7's checks find any archive mismatch (their verdicts, not
  this lane's).

## 8. Spot-checks performed by this lane (non-author of every checked artifact)

- **SC-1 — §Pins re-derivation:** 18/18 current values (14 notes + report +
  substrate trio) + 5/5 history pins (§4), same-day; independently corroborated
  by B7-3's re-bound list (14/14 equal).
- **SC-2 — archive pin equality (spot, 3/25 groups + 3 note-pin instances):**
  `sha256sum -c MANIFEST.txt` → `tabi-r2-2-state` 6/6, `tabi-r3-1-journey` 63/63,
  `w4-t41-network` 200/200 = **269/269 OK, 0 FAILED, exit 0 each** (raw logs
  `/tmp/w7-scrb7/chk-*.txt`); instance checks vs owning-note pins: `journey.mjs`
  → `b52074a33876` (= `multi-step-journey.md:26`), `site/index.html` →
  `42d7a35b82be` (= its §2 pin), `net-journey.mjs` → `46c81f99decf` (=
  `network-evidence-rung.md:71`) — **3/3 MATCH**.
- **SC-3 — L0 negative control:** three reads spanning 18:20:26–18:26:57Z,
  byte-identical (25 / 21,539 B / `02c53ec6…`) + a post-write read (§9 E1); diff
  vs the round-5 filing state = none; the r5 append proof (`head -c 20653` =
  `0a86973b…`) is AUD-B5's, cited not re-run.
- **SC-4 — lessons + commit:** 5 files, one `## Gate` each, shas recorded
  (§2 d3); commit `c0467a6` stat re-read (9 files, §5).
- **SC-5 — daemon + substrate:** independent read-only re-measurement (no
  listener 10086, no process, pointer-file shapes §5) and 3/3 substrate pins +
  daemon binary first16 — all match recorded values.
- **SC-6 — Brave reject:** `NativeMessagingHosts` only (agree; count asserted
  7th; drift lineage printed, §2 d6).
- **SC-7 — cross-lane corroboration:** B7-3's readiness note (landed during this
  lane's measurement window; untracked) independently reports the same L0 state
  (25 / 21,539 / `02c53ec6…`), the same packet state (121 / 13,103 /
  `94dc63f5…` / 0 `/tmp`), HEAD `c0467a6`, substrate 3/3, and the same 14 note
  pins — two lanes, measured independently, no contradiction. AUD-B7's group
  checks exist (heads read); their verdicts are theirs.
- **SC-8 — the plan fingerprint delta:** the round-6 draft's `4e0261de`/331 vs
  the final `fa139496`/342 re-derived from the committed bytes (§1); both values
  kept (append-only).

## 9. Errata — append-only

- (none yet; corrections append below with date + evidence. The final round-7
  record supersedes this file, not the other way around.)E1 — 2026-10-14T18:29Z, by SCR-B7 (post-write re-check; §9's "none yet" superseded here, not rewritten)

- **This draft's fingerprint at write:** 333 `wc -l` / 334 logical lines / 30,179 B / sha256 `93b97ff5e1d69f7ec6376716a9a9870de6ece768289c526cc8190bd31cfb95b6`.
- **L0 post-write re-check 18:29:16Z:** unchanged — 25 lines / 21,539 B / `02c53ec6…`. **Branch L stands**; ask-count 1; no re-ask.
- **New landings during this lane's write window (18:28–18:29Z; all untracked/modified; HEAD still `c0467a6`)** — statuses in §2–§6 are as measured at 18:20–18:27Z; this block is the delta:
  - `reports/r7-aud-b7.md` (AUD-B7) — 256 `wc -l` / 19,963 B / first16 `6bc185c8de56`; audits the harness archive (manifest-pin equality, 3 groups) + the layer-routing table (2 rows re-derived); verdicts are AUD-B7's. Supersedes §6's "audit in flight" row's last clause.
  - `corpus/knowledge/layer-routing-synthesis.md` (lane B7-1, self-id in header) — 240 `wc -l` / 27,994 B / first16 `595c9e90415b`; the synthesis note the in-flight SKILL +34 edits distill (§6); untracked.
  - `plans/round-8.plan.md` (PREP-B8) — 388 `wc -l` / 25,207 B / first16 `3ad58f64c826`; round-8 design plan (its header stamps design reads 18:19–18:26Z — this round's own measurement window); recorded, out of this lane's scope.
  - `plans/round-7-record-draft.md` — this file.
  - `git status --short` at 18:29Z: ` M SKILL.md`; `??` the three `corpus/evidence/w6-*` dirs, `corpus/knowledge/layer-routing-synthesis.md`, `corpus/knowledge/packet-readiness-r7.md`, `plans/round-7-record-draft.md`, `plans/round-8.plan.md`, `reports/r7-aud-b7.md`. HEAD unchanged `c0467a6`; nothing committed by this lane — the commit is the scribe's.
- **Knowledge count moved again:** 16 files now (14 committed + `packet-readiness-r7.md` + `layer-routing-synthesis.md`) — amend §5's "15 / 4,565" accordingly; §4's provisional-pin list gains the three new shas above (all provisional, `cdp-evidence-patterns.md:92`).
- **Poll:** `/tmp/w7-scrb7/poll.sh` started 18:29:14Z (30 × 20 s ≈ 10 min cap; log `/tmp/w7-scrb7/poll.log`); iteration 1 (18:29:14Z): L0 byte-identical; knowledge dir shows both new notes; `corpus/evidence/` → 28 dirs. The final scribe reads the log's later iterations — and re-derives everything at record time.
- This lane writes nothing after this block; the round-7 record supersedes this file.E2 — 2026-10-14T18:30Z, by SCR-B7 (closing fingerprint; append-only)

- Fingerprint immediately before this block: 345 `wc -l` / 346 logical / 32,587 B / sha256 `8a07a636d3d5adebfdf44ed220f036791d95697894458d9eea3c37024bc3cd9d`. Any later append (including this one) moves the hash by construction — re-derive with `sha256sum`; the round-7 record supersedes this file.
- L0 across the poll's first two iterations (18:29:14Z, 18:29:34Z): byte-identical (`02c53ec6…` / 25 / 21,539 B). The poll runs to ≈18:39Z; log `/tmp/w7-scrb7/poll.log` for the scribe.
- No further writes by this lane.
