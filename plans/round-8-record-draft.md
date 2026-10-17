# tabi-shokunin — round 8 record — DRAFT (scribe prep)

**Status: DRAFT, not the record.** This file is the round-8 **verification
table + pivot note** — written 2026-10-14T19:09–19:1xZ (16:0x–16:1x -03) by
lane **SCR-B8** (round-8 scribe prep; assignment: this file only). The round-8
record itself (LOG entry, SCORECARD verdicts + move log + axes, README coverage
rows, SKILL distillation for any round-8 note, commit) is assembled later by
the round-8 scribe from the seats' landed files plus this table. Measurements
here are read-only (lane tree, `.ufo/l0-questions.md`, the webbridge substrate,
`/tmp` scratch of sibling seats); nothing outside this file was written by this
lane. Scratch: `/tmp/w8-scrb8/` (volatile). Discipline
(`corpus/QUALITY.md:1-7`): observation / inference / unknown separated; secrets
shape-only (never content-read); substrates read-only; no external site; as-of
stamps UTC unless marked `-03`. Values measured 19:09:50–19:14Z unless stamped
otherwise; **every value that moves must be re-derived at record time** —
round-8 seats were working while this table was measured (§6, §9; round-8
sibling scratch was already appearing at ~19:11Z).

## 0. The pivot note — the l0-answer-check outcome (decides the branch)

**Outcome: no answer. Round 8 runs Branch L (loopback).** The read was made at
19:10Z, re-checked at 19:12:13Z and 19:12:33Z (this lane's poll, §6);
`.ufo/l0-questions.md` did not move across the three reads.

| Quantity | Round-5 filing state (record) | Measured now | Verdict |
|---|---|---|---|
| lines | 25 (`wc -l`) | **25** | unchanged |
| bytes | 21,539 | **21,539** | unchanged |
| sha256 | `02c53ec60acfda4889e0cd57eb08e8f1bd5583708fcb8399bfc5a5593713613f` | **same** | unchanged |
| mtime | 2026-10-14 14:05:52 -03 | **2026-10-14 14:05:52.482908587 -03** | unchanged |
| tabi regions | 1 (line `:25`, the round-5 filing) | **1** (`:25`, same line; `grep -n '^tabi'` → one hit) | unchanged |
| pre-append state (round-5 record) | 24 lines / 20,653 B / `0a86973bd17c37f7` | — | filing proof stands (AUD-B5 §4, cited not re-run) |

- The single `tabi`-matching region is `:25` — the round-5 filing line
  (packet `sha256 94dc63f5fb9e…`); no line below it, no edit inside it. Full
  line read this session; it ends *"Filing seat B5-4."*
- The answer channel is the file itself ("the L0 answers by editing the file in
  place", `MISSION.md:84-88`); operator presence is never itself a grant
  channel — only the read-back is (plan Step 0.1 :116-124).
- Classification per the plan's gate table (:93-99): **SILENT** — no diff vs the
  round-5 filing (sha + line count + mtime byte-identical) → **Branch L**.
  Silence is not a denial; the ask is unchanged; **ask-count stays 1** and the
  packet is **not re-asked** (:109-114, default silence).
- Consequence (plan Branch L :213-259): no external site; the packet stays
  filed; loopback only; cleanup verified per run; the L0 carried-debt check runs
  first (round-6 L1, then round-7's clauses), then the round's own class — the
  non-idempotent step under failure (L1).
- Mid-round switching rule (Step 0.2-0.3 :102-105): a mid-round answer may be
  acted on only inside its stated scope, after its own read-back — the record
  must show read-back-before-act. Nothing observed triggers it: three reads,
  byte-identical.
- Clause (c) unchanged: `date -u +%F` → **2026-10-14** (19:09:50Z); a
  strictly-later-date §Pins re-derivation is impossible by construction today
  (earliest 2026-10-15). Carried, not failed.
- Round-8's standing rule (:104-107 (iii)): **the round does not exit without a
  recorded status classification**; this section is that classification's
  scribe-side copy — the gate seat's own read-back (with its before/after
  counts and mtime) is what enters the record verbatim.

## 1. Plan reference (measured)

| Item | Value |
|---|---|
| `plans/round-8.plan.md` sha256 | `3ad58f64c82681c0bb47c472670870ab049de0b11be43beb687b30da360e60e0` |
| lines | `wc -l` → **388**; logical **389** (last line unterminated, ends `...all of it at its gate.`); 25,207 B |
| git state | committed in `b377007`; worktree == HEAD for this path (`git status --short` → 0 entries) |
| design/authority | the plan **is** the design text (lane PREP-B8, run inside the round-7 wave; header freeze 2026-10-14T18:25:57Z; file mtime 15:28 -03 = 18:28Z) |

**Record delta, append-only (the record must carry this):** the round-7 record
draft (committed, itself a source; `plans/round-7-record-draft.md`, 349 `wc -l`,
`8aac0ae242161a4f`) fingerprinted this plan at 388 `wc -l` / 25,207 B / first16
`3ad58f64c826` in its E1 block — the same bytes re-derived here (sha and size
equal; nothing moved). No earlier snapshot of this plan is on record under any
other value.

The plan's branch gate (verbatim, :93-99): *SILENT → L; ANSWERED-SCOPED → G;
ANSWERED-SCOPE-LESS → neither; DENIED → L; BRIDGE-NAMING → G4*. Claim
(:74-84): one axis-move, operator-status-branched; at most one branch executes.
Seats (:304-321): gate + record; G/L branch seats; freshness/debt seat (clause
(c) rider + archive tranche + receipt); record-debt seat (README/SCORECARD/
lessons); verification + outside spot-check (`LEARNING.md:37-43`) + scribe.
Write scope per seat; `.ufo/l0-questions.md` is touched by no lane this round
except the one permitted re-ask line, only if the gate's material-change test
passes (count recorded).

**Plan values superseded at write (frozen vs re-derived; the plan's own
post-freeze block already flags part of the race) — do not cite the frozen
column as current:**

| Quantity | Plan's frozen read (18:19–18:26Z) | Re-derived 19:09–19:14Z |
|---|---|---|
| HEAD | `c0467a6` (clean) | **`b377007`** (clean) |
| knowledge notes / lines | 14 / 4,452 (post-freeze block: 16 / 4,776) | **17 / 5,019** |
| `corpus/evidence/` groups / manifests | 25 / 25 (post-freeze: 28) | **35 / 35** (1,451 files / 9,222,920 B) |
| `SKILL.md` revision | `a8ba10b86138` / 795 (post-freeze: `c0d2629ecbfb` / 829) | **`8874306672b65d8d` / 945** |
| lessons | 5 (`round-1..5.md`) | **5** (unchanged; `round-6.md`/`round-7.md` still absent) |
| packet / L0 | `94dc63f5…` / `02c53ec6…` | **same, byte-identical** |

## 2. Step 0 gate — precondition sweep (round-7 clauses a–d, checked not assumed)

The round-8 plan (:116-158) makes the round-7 clauses this round's precondition
set. Status vocabulary: **PASS** · **CARRIED** (impossible/owed by construction,
recorded in force) · **DEBT** (owed, named) · **N/A** (no object — grant/approval
absent by default-deny) · **IN FLIGHT** (round-8 seat working; partial artifacts
observed) · **NOT LANDED** (no artifact).

| # | Predicate | Evidence as measured | Status |
|---|---|---|---|
| a | round-7's Step-0 read-back (line + sha + counts) and branch classification findable in the round-7 record | `plans/round-7-record-draft.md` §0 (committed in `b377007`; 349 `wc -l`, `8aac0ae242161a4f`): table with `:25` / `02c53ec6…` / 25 / 21,539 and classification **Branch L**; `LOG.md:134` round-7 entry: *"l0 still unanswered — loopback held"* | **PASS** |
| b-G | G branch: note `real-site-observation-<host>.md` (or the refusal datum), budget, stop events | No grant exists (L0 unchanged; default-deny by construction); `ls corpus/knowledge/ \| grep -i 'real\|observation'` → no match (rc=1) | **N/A** (nothing to verify) |
| b-L-r6 | round-6's L1 matrix (wire-class / cache-revalidation for repeated same-URL subresources) executed as carried debt | **Still unlanded.** `layer-routing-synthesis.md:136-140`: *"The L1 mechanism matrix … is still unlanded and carried into round 7"* — no round-7 or round-8 landing found; nothing in round-7's commit addresses it | **CARRIED** (round-8 L0 obligation, plan :219-224) |
| b-L-r7 | round-7's L1/L2/L3 (the state-changing step, its instruments, its guards) | **Not landed as the plan's L1** — round-7's committed artifacts are the layer-routing synthesis + the archive tranche (LOG:134); `layer-routing-synthesis.md:143` and `SKILL.md:885-890` both state *"No measured case exists for a state-changing step … the corpus's own named gap"*; `packet-readiness-r7.md:64` concurs (*"POST form submit with a request body, a CSRF-shaped token minted/consumed once, and the non-idempotent replay contract … did not land"*) | **CARRIED** (round-8 L0/L1) |
| b-L2 | instruments: rate/ToS-shaped + third-party-JS-shaped async (E3) | E3 async cells (late settle, beacon-shaped POST, canceled 404) unlanded since r6 (`external-class-fixture-v2.md` §9 :560-563; synthesis :141-142); the four v2 rate/ToS-shaped instruments landed and archived | **PARTIAL (v2 instruments reuse; E3 carried)** |
| c | freshness: §Pins re-derived on a date strictly later than 2026-10-14 | `date -u +%F` → **2026-10-14** — impossible today; plan says carry (:263-279). Same-day values re-derived instead (§4): **22/22 existing assertions match** + 5/5 history | **CARRIED** (values re-derived same-day, §4) |
| d1 | new note + coverage row (`corpus/README.md`) + SKILL distillation | Round-7 notes **LANDED** (layer-routing-synthesis, packet-readiness-r7) + `archive-receipt-r8.md` (ARCH-TRANCHE-R8), all in `b377007`; round-7 SKILL distillation **LANDED** (152 changed lines; two new sections + append block, `SKILL.md:832-946`); coverage row **NOT LANDED** — `corpus/README.md` untouched since round 5 (`e156bb99af2c`, 59 lines); header `:5-9` still reads *"Held at round 3 … 8 knowledge notes, 1944 lines … Lessons: 0"* vs actual **17 / 5,019 / 5** | **DEBT** (recorded as a finding first, per plan :275-277) |
| d2 | LOG entry + commit | **LANDED** — `b377007` *"probation round 7 (training r6): see LOG"* (2026-10-14 16:06:31 -03; 425 files, +44,864/−1); `LOG.md` 134 lines, round-7 entry last (`:134`) | **PASS** |
| d3 | lessons count with Gates | re-derived **5** (`round-1..5.md`, one `## Gate` each — `grep -c '^## Gate'` → 1 each; shas `bdd46c85b349`/59, `a862d69cb0b9`/60, `153a1b9831bb`/69, `cde3960eb1a9`/87, `46029f48e27d`/139 `wc -l`). The plan's **"→ 6 (round-6.md owed by round-7's record; round-7.md is this record's to land)"** (:145-150) is not met: `corpus/lessons/round-6.md` and `round-7.md` **do not exist** | **DEBT** (both files named missing) |
| d4 | archive present (25/25 at design; 28 at post-freeze) + spot re-hash ≥3 groups vs owning notes' pins | `ls corpus/evidence/ \| wc -l` → **35**; `ls corpus/evidence/*/MANIFEST.txt \| wc -l` → **35**; 1,451 files / 9,222,920 B. This lane's spot `sha256sum -c` on 3 groups: `w6-tabi-b61` 139/139 OK · `w7-b71-synth` 3/3 OK · `w5-tabi-b53` 9/9 OK — **151/151 OK, 0 FAILED, exit 0** each (§8 SC-2); 4 instance pins vs the owning note's text + the archived bytes **4/4 MATCH** (§8) | **PASS (spot)** |
| d5 | packet `/tmp`-free + the L0 filing line | packet 121 `wc -l` / 13,103 B / `94dc63f5fb9e…` (**byte-identical to filing**); `grep -c '/tmp/'` → **0** (exit 1); L0 `:25` cites the packet + its sha | **PASS** |
| d6 | standing Brave reject re-run | `ls -A ~/.config/BraveSoftware/Brave-Browser/` → **`NativeMessagingHosts` only** → agree. **Count asserted: 8th consecutive** — lineage: r1/r2 agreement rows (SCORECARD :24, :36), r3 "third consecutive" (:51), r5 record "fifth", SCR-B6 derived 6th, SCR-B7 asserted 7th; the drift note (the round-6 plan's own "5th") stays recorded, not harmonized | **PASS** |
| d7 | carried design-time debt: README header/rows + SCORECARD r4–r7 tables/axes | re-derived: **README** header stale (§d1) and its coverage rows still stop at round 3 (8 notes); **Frontier** block still says "thirteen `/tmp` evidence groups" vs 35 dirs. **SCORECARD** has primary-verdict tables for r1–r3 only (:18, :26, :38) — **r4/r5/r6/r7 verdict tables absent**; axes table (:53-62) still carries the round-3-pinned scores (depth 7 / coverage 5 / operability 5 / freshness 3 / calibration 6 / adjacency 5); move-log rows **4–7 sit after "## Planned / retired"** (:73) at :83-86 | **DEBT** (named; the round-8 scribe should land or name them) |
| d8 | carried debts from the plan list (:151-158) | archive tranche + receipt **LANDED** (ARCH-TRANCHE-R8; `archive-receipt-r8.md` `0587605db913…`, 191 `wc -l`, committed `b377007`; its F3 closes the r5 peer groups, F1 recorded-kept, U2 open — §6). Remaining: packet cold-read verdict (still `[unknown]`, `operator-approval-request.md:100`); README rows rounds 4–7; SCORECARD r4–r7 + axes refresh + move-log placement | **PARTIAL / DEBT** (rest named) |

Naming drift found (observation, not repaired): the round-8 plan's L0 names
*"round-6 L1 — the wire-class / cache-revalidation matrix"* (:221-224) while
`packet-readiness-r7.md:64` attaches *"(the state-changing step)"* to *"the
round-6 L1 matrix"*. The corpus's own note (`layer-routing-synthesis.md:136-144`)
keeps them distinct (matrix vs state-changing step, both carried). Both values
stand as written; the record should cite the synthesis note's split.

## 3. The round-8 claim's verification table (Branch L — the operative branch)

Predicates below are the round-8 plan's Branch L + Measure sections, made
mechanical. "Observed" is this lane's read at 19:09–19:14Z; status vocabulary as
in §2. Round-8 seats were live but had landed no branch artifact at this read
(§6).

| # | Predicate (pass condition) | Expected | Observed @ 19:1xZ | Status |
|---|---|---|---|---|
| L0 | carried-debt check executes whichever the record shows unlanded, in order, as debt (not a second move) | cells + verdicts, or the negative result with the matrix | both debt items unlanded (§2 b-L-r6, b-L-r7); no round-8 artifact yet | **IN FLIGHT / NOT LANDED** |
| L1a | interrupt mid-POST: layers seen, whether the server applied the change, whether the token burned | per-cell logs + per-layer verdict | no artifact yet | **NOT LANDED** |
| L1b | interrupt between redirect hops: where the 302/303/307 chain stops, replayability, the surface showing the stop | per-cell both-surface record | no artifact yet (r6's 302→303→307 chain remains the available instrument, landed) | **NOT LANDED** |
| L1c | duplicate submission (same token twice): token-consumption vs double-apply; second submit's evidence per layer; lost-update edge on a counter | instrument + runs | no artifact yet | **NOT LANDED** |
| L1d | replay contract for the non-idempotent step extended to interrupted/duplicated runs (byte-identity where idempotent; divergence measured and classified) | stated contract + rows | no artifact yet | **NOT LANDED** |
| L1e | per-cell layer-decision record {wire, client status, token consumed, server state}; controlled single-factor matrix; N ≥ 2 cold runs per cell | filled cells + falsifiers | no artifact yet | **NOT LANDED** |
| L2 | instruments: execute only if unlanded; else reuse as-is (E3 async carried) | reuse or landing | E3 still unlanded (§2 b-L2); v2 instruments archived and reusable | **PARTIAL (reuse + carried)** |
| L3 | guards: byte-identity or measured divergence; both network surfaces kept; closure per run (kill by PID, ports closed, `curl` exit 7) | per-run closure lines | discipline holds corpus-wide (rung/route notes); round-8 runs pending | **HOLDS (round-8 runs pending)** |
| L4 | lane-authored fixtures only; mirrored real-site artifact stays U7 default-deny | no mirrored artifact | no mirrored artifact; no real-site note; rule stands (`PROVINCE.md:15-19`) | **HOLDS** |
| FR | freshness rider: strictly-later-date pass iff `date -u +%F` ≥ 2026-10-15; else recorded in force | date + match count + witness | 2026-10-14 → **carried**; same-day 22/22 + 5/5 history (§4) | **CARRIED (values matched)** |
| M1 | new note + coverage row + SKILL distillation (round-8 note) | row + distillation | no round-8 branch note yet; `archive-receipt-r8.md` landed (its owed items are the integrating round's, receipt §6); README row absent (§2 d1) | **IN FLIGHT / DEBT** |
| M2 | lessons count | "→ 6 (or each missing file named)" | re-derived **5**; `round-6.md`, `round-7.md` named missing (§2 d3) | **DEBT (as §2 d3)** |
| M3 | LOG entry + commit (lane identity, `AGENTS.md:3`) | round-8 entry cites evidence; commit | owed — HEAD `b377007`; round-8 files (none yet) untracked/modified | **NOT LANDED (owed by scribe)** |
| M4 | Brave reject (as §2 d6) | agree or disagreement recorded | agree; 8th asserted | **PASS** |
| M5 | L0 read-back precedes any act; ask-count printed | read-back first | this table §0 (three byte-identical reads before any branch act); ask-count **1** | **PASS (as far as measurable)** |
| AC | anti-claim: no external site; loopback only; packet stays filed; not re-asked | nothing external; nothing filed | holds as far as measurable: L0 unchanged (no grant can exist — default-deny by construction); no real-site note; this lane ran no browser; no external request from any measured artifact | **HOLDS** (restate in record) |
| FL | fleet-level, reported not absorbed: tabi outside the watchdog `LANES` roster | named, not fixed by this lane | `scripts/shokunin-watchdog.sh:14` → `LANES="protocol aggregator kasegi kengaku kake kumitate kotoba kagi kama"` — **tabi still absent** (carried from r5). Fleet closeout for round 7 landed: `904e4f0` *"training wave-7 closeout: round 7 … all lanes 6/10"* (MANIFEST.json only, +56) | **REPORTED** |
| M6 | operator-status datum: silence span from the filing mtime → round start; ask-count; re-ask decision recorded | span + counts | filing 2026-10-14 14:05:52 -03 → this read 19:10:26Z ≈ **5h 04m** of silence; ask-count **1**; re-ask decision **default silence** (plan :109-114; no material-change line filed by this lane) | **PASS (as far as measurable)** |

Boundary: this lane did **not** author or audit the branch seats' work; the
statuses above are reads of file presences, timestamps and heads. The
verification seat + outside spot-check (`LEARNING.md:37-43`) own the verdicts.

## 4. §Pins re-derivation — same-day (2026-10-14, 19:10–19:13Z)

Pin authority: the §Pins errata block (`SKILL.md:807-829` — the round-5 B5-3
refresh, *"supersedes the note pins in §Pins above for post-append use"*, its
post-append table at :814-826) + the round-6 SKILL-upgrade block (`SKILL.md:830`
— the two round-6 notes' pins) + the round-7 append block (`SKILL.md:930-946` —
synthesis, audit report, r5 receipt) + §Pins itself (`SKILL.md:37-66`: the r4
report pin + the substrate trio) + values recorded in the committed record
drafts. The plan's rider (:263-272) names **21 values** (14 notes + 3 reports +
3 substrate + SKILL); at record time the set is **25 values** (17 notes + 4
reports + 3 substrate + SKILL) — the refresh below was executed over all of it,
and the count this table asserts is **22/22**.

| # | Source | Pin (authority) | Re-derived @ 19:1xZ | `wc -l` |
|---|---|---|---|---|
| 1 | `async-step-evidence.md` | `05dcda5e60b9` (SKILL:815) | `05dcda5e60b9` | 282 ✔ |
| 2 | `browser-surface-census.md` | `a33c22644d64` (:816) | `a33c22644d64` | 265 ✔ |
| 3 | `cdp-evidence-patterns.md` | `337ff64579e8` (:817) | `337ff64579e8` | 234 ✔ |
| 4 | `executor-test-sufficiency.md` | `32772e343848` (:818) | `32772e343848` | 329 ✔ |
| 5 | `hygiene-sweep-r4.md` | `87155e12021d` (:819) | `87155e12021d` | 258 ✔ |
| 6 | `interaction-approval-table.md` | `b5e29a9a2adf` (:820) | `b5e29a9a2adf` | 246 ✔ |
| 7 | `live-dynamic-capture.md` | `01266495b761` (:821) | `01266495b761` | 245 ✔ |
| 8 | `multi-step-journey.md` | `e0367890f1cf` (:822) | `e0367890f1cf` | 349 ✔ |
| 9 | `network-evidence-rung.md` | `d1564f38dc14` (:823) | `d1564f38dc14` | 609 ✔ |
| 10 | `webbridge-daemon-disposition.md` | `fd5f6861aa3b` (:824) | `fd5f6861aa3b` | 274 ✔ |
| 11 | `webbridge-plugin-anatomy.md` | `8d1488ab763e` (:825) | `8d1488ab763e` | 290 ✔ |
| 12 | `archive-receipt-r5.md` | `b41c2f6fb5a4` (SKILL:945) | `b41c2f6fb5a4` | 180 ✔ |
| 13 | `external-class-fixture-v2.md` (r6) | `4aa604f1788b` (SKILL:830) | `4aa604f1788b` | 569 ✔ |
| 14 | `webbridge-revival-assessment.md` (r6) | `a07c8aedc161` (SKILL:830) | `a07c8aedc161` | 322 ✔ |
| 15 | `layer-routing-synthesis.md` (r7) | `7725ee421716` (SKILL:836) | `7725ee421716` | 254 ✔ |
| 16 | `packet-readiness-r7.md` (r7) | no SKILL pin; last fingerprints in drafts (`e9bc7ee18606`/113 → `b09f71461cdc` moving, r7 draft §4/§9) | **`7185642c2e41`** | 122 |
| 17 | `archive-receipt-r8.md` (r8) | no external pin yet; self-pins inside | **`0587605db913`** | 191 |
| 18 | report `reports/r4-aud-tab1.md` | `5f44b0f94483` (SKILL:62) | `5f44b0f94483` | 167 ✔ |
| 19 | report `reports/r5-aud-b5.md` | `d09f1712cbcf` (r7 draft §4) | `d09f1712cbcf` | 170 ✔ |
| 20 | report `reports/r6-aud-b6.md` | `9428ddec52b9` (r7 draft §4) | `9428ddec52b9` | 178 ✔ |
| 21 | report `reports/r7-aud-b7.md` | `ea4b16a4a844` (SKILL:916, :945) | `ea4b16a4a844` | 260 ✔ |
| 22 | substrate `kimi.plugin.json` | `e70aff5c40ff` (SKILL:64-66) | `e70aff5c40ff` | 24 |
| 23 | substrate `skills/kimi-webbridge/SKILL.md` | `84a8e69d04c5` | `84a8e69d04c5` | 158 ✔ |
| 24 | substrate `references/operations.md` | `b811d9c23dfd` | `b811d9c23dfd` | 34 ✔ |
| 25 | `SKILL.md` (this revision) | re-derived anchor — the round-7 block's own pre-append `c0d2629ecbfb`/829 is historical | **`8874306672b65d8d`** | 945 |

**Match: 22/22 existing assertions** (rows 1–15 + 18–24 re-derive equal to their
authority; rows 16/17 carry no external pin — recorded, provisional; row 25 is
the revision anchor). Also re-derived (anchors, not §Pins rows): daemon binary
`71067480bd99…` (first16). History pins (re-derived from git): `49f0735b0594` /
223, `9e4d69dcd658` / 197, `034b1e53b004` / 119 (`git show 7961735:<path>`),
`56224aa88430` / 220 (`5d2e95d`), `452bc514d387` / 576 (`094c27a:SKILL.md`) —
**5/5 match**.

Findings (append-only; the record must carry, not repair):

- **F-a — `SKILL.md`'s §Harness-archive census is stale.** The round-7 block
  (`SKILL.md:898-908`) states *"28 group dirs / 28 `MANIFEST.txt` … 1,375
  non-manifest files / 8,861,433 B"*; the tree now holds **35 / 35 / 1,416 /
  ~9.1 MB** (receipt r8 U4 says the same; its own numbers supersede for
  citation). The round-8 record should note the SKILL line as superseded.
- **F-b — `packet-readiness-r7.md` moved after its last in-draft fingerprint**
  (113 → 122 `wc -l`); no SKILL block cites it, so no assertion is broken; its
  provisionals graduate or are re-stamped at record time
  (`cdp-evidence-patterns.md:92`).
- **F-c — `archive-receipt-r8.md` landed in the round-7 commit** (self-labeled
  round-8 lane ARCH-TRANCHE-R8; §6). It is a round-8 artifact whose LOG/README/
  SKILL/SCORECARD integration the receipt itself leaves to the integrating
  round.

Same-day limit (restated): this is a 2026-10-14 derivation; clause (c) requires
a **strictly later date** and remains **CARRIED** (earliest 2026-10-15). The
durable witness should be a dated in-repo block whose commit date is ≥
2026-10-15 (`git show -s --format=%cI` recorded).

## 5. Baseline anchors (repo state @ 19:09–19:14Z)

- HEAD `b377007877be2d104cc9e3a73de56cf81a24ab0d` *"probation round 7
  (training r6): see LOG"* (2026-10-14 16:06:31 -03); `git status --short` →
  **0 entries** (clean tree).
- Round-7 commit contents (measured, non-evidence): `LOG.md` (+1, now 134
  lines, `f3b7bc3864ee…`), `SCORECARD.md` (+1, now 86 lines, `d2e6895264c6…`,
  move-log row 7 at :86), `SKILL.md` (152 changed lines → 945, `8874306672b6…`),
  `corpus/knowledge/layer-routing-synthesis.md`, `packet-readiness-r7.md`,
  `archive-receipt-r8.md`, `plans/round-7-record-draft.md` (349), `plans/round-8.plan.md`
  (388), `reports/r7-aud-b7.md` (260); plus the archive tranche under
  `corpus/evidence/` — **425 files, +44,864/−1**.
- Knowledge: **17 notes / 5,019 lines** (`ls corpus/knowledge/*.md | wc -l` →
  17; `wc -l … | tail -1` → 5019). Counts vs the round-7 draft's 15/16: the
  committed set plus the two r7 notes plus the r8 receipt.
- `SKILL.md`: **`8874306672b65d8d…` / 945 `wc -l` / 78,977 B** (committed).
- Archive: **35 groups / 35 manifests / 1,451 files / 9,222,920 B** (`ls` /
  `find` / `du -sb`); 1,416 evidence files + 35 manifests. Receipt r8 §7 re-ran
  A+B after landing: 41/41 OK, 0 diff; no change since (§6).
- Lessons: **5** files (59/60/69/87/139 `wc -l`), one `## Gate` each; shas above
  (§2 d3).
- Packet: 121 / 13,103 B / `94dc63f5…`; `/tmp` → 0. L0: 25 / 21,539 B /
  `02c53ec6…`; mtime unchanged (§0).
- Reports: r4-aud-tab1 167 `5f44b0f94483`; r5-aud-b5 170 `d09f1712cbcf`;
  r6-aud-b6 178 `9428ddec52b9`; r7-aud-b7 260 `ea4b16a4a844`.
- Daemon (read-only re-measure at 19:10Z): `ss -ltn` → **no listener on 10086**
  (grep exit 1); `pgrep -x kimi-webbridge` → **none** (exit 1);
  `~/.kimi-webbridge/` shapes only — `daemon.pid` 8 B, `daemon.addr` 16 B (both
  mtime 2026-10-14 10:46 -03), `identity.json` 36 B (never content-read),
  `logs/` dir; binary `71067480bd99…` (first16). Matches the recorded
  post-shutdown pattern (disposition §10).
- Brave reject: `NativeMessagingHosts` only (8th asserted, §2 d6).
- Debt line refs: `corpus/README.md:5-9` stale header (and its Frontier block
  "thirteen `/tmp` evidence groups"); `SCORECARD.md:53-62` axes table
  (round-3-pinned), `:73` "## Planned / retired", move-log rows 4–7 at `:83-86`,
  no r4–r7 verdict tables; packet status line `:100` `[unknown]`.
- Fleet repo (`/home/vgpnk/Projects/shokunin`): HEAD `904e4f0` *"training wave-7
  closeout: round 7 … all lanes 6/10"* (MANIFEST.json, +56); prior `02607f7`
  *"w16 registry: g2d r76 wave-B seats + work commit 6ca715d"*; sole dirty entry
  `?? kwin.txt`. Note (so the scribe does not conflate):
  `.ufo/waves/shokunin-train-20261014-w9/` is **another province's wave**
  (audio r70 + g2d r69 + g3d r78 per `spec.json`) — not this round's registry
  (the r6/r7 records treated `…-w15`/`…-w16` the same way).

## 6. In-flight sibling state (this lane's reads, not audits)

| Input | Expected from | Observed @ 19:0x–19:1xZ |
|---|---|---|
| round-6/7 archive tranche → `corpus/evidence/` + receipt | lane ARCH-TRANCHE-R8 (assignment in its own header; scratch `/tmp/w8-arch-tranche/`) | **LANDED and committed** (`b377007`): 7 new groups / 41 evidence files / 207,889 B; tree 28 → 35 groups; checks A+B re-run 19:06Z → 41/41 OK, 0 diff lines; C1–C7 + D pin scans (200 match / 118 classified / 0 unmatched naming an archived file); findings F1 (r3b stale in-group pin file — kept, owning-note pins authoritative), F2 (group-selection rule + excluded scratch listed), F3 (r5 peer groups now measured), F4 (`$GROUPS` reserved-name trap, no byte affected), F5 (named fixture groups already archived); unknowns U1–U5; owed items → integrating round (receipt §6) |
| round-8 branch seats | plan seats :304-313 | **IN FLIGHT**: `/tmp/w8-tabi-b81` (B8-1) appeared; `/tmp/w8-b82-manifest.log` (B8-2) shows manifest `: OK` lines for a harness (`compare.mjs`, `compare.stdout.txt`, `compare.tsv`, `driver.sh`, `driver-warm.sh` — head read only); `/tmp/w8-tabi-b84-poll/` (B8-4) runs its own 60 × 20 s progress poll (started 19:11:48Z; iter 1 19:12:08Z: clean tree, 17 notes, 35 groups). **No branch artifact had landed** at this read; statuses in §3 are as-measured |
| this lane's own scratch | SCR-B8 | `/tmp/w8-scrb8/` — `poll.sh` + `poll.log` (bounded: 27 × 20 s ≈ 9 min, started 19:12:13Z; iter 1: `l0=02c53ec60acf/25 kn=17 kl=5019 ev=35 sk=8874306672b6 dirty=0 head=b377007 lessons=5 w8dirs=24`), `spot-archive.txt`, `spot-instance.txt` (volatile) |

Poll plan for the final scribe: two independent bounded polls exist (B8-4's
60 × 20 s; this lane's 27 × 20 s) plus whatever the branch seats log. Every
moving value (pins, counts, L0 lines, manifests, scratch, in-flight note
arrivals) must be **re-derived at record time** — the r4/r5/r6/r7 lesson.

## 7. Unknowns (explicit)

- U-a: whether the round-6 L1 mechanism matrix and/or round-7's state-changing
  step lands in round 8 (L0 debt), in which file, with which cells; a negative
  result is allowed with the matrix, never a claim by exhaustion.
- U-b: how far the round-8 L1 (non-idempotent step under failure) gets: which of
  interrupt-mid-POST / interrupt-between-hops / duplicate-submission lands;
  N ≥ 2 cold runs per cell; whether the replay contract holds.
- U-c: whether the E3-async cells (late settle, beacon-shaped POST, canceled
  404) land (carried from r6 :560-563).
- U-d: whether `corpus/lessons/round-6.md` / `round-7.md` (and possibly
  `round-8.md`) land; the pattern shows lessons land one wave late.
- U-e: README coverage rows (rounds 4–8) + header; SCORECARD r4–r8
  primary-verdict tables + axes refresh + move-log placement — open (§2 d1,
  d7).
- U-f: when/where the strictly-later-date §Pins block lands (earliest
  2026-10-15) and its durable witness (in-repo dated block + commit date).
- U-g: the daemon change point (when/why the listener died — r4 OOM lineage)
  still unmeasured; operator-side disposition owed (D2 lineage); the D/G4
  branch unexecutable without a recorded approval — none observed.
- U-h: whether a mid-round answer arrives; the read-back-before-act rule (§0)
  governs and the branch may switch only inside the granted scope.
- U-i: whether the record updates the SKILL §Harness-archive census (F-a) and
  graduates `archive-receipt-r8.md`'s owed list (receipt §6) — including the U2
  decision about plan-draft-only scratch.
- U-j: the packet's cold-read verdict — `[unknown]` since r5
  (`operator-approval-request.md:100`); whether this round's non-author seat
  executes it.
- U-k: whether B8-1/B8-2/B8-4's branch work completes and lands; their verdicts
  are theirs, not this lane's.
- U-l: whether the round-8 note (if any) lands with the SHONEN boxes / verifier
  pattern intact (rounds 3+: named verifiers).

## 8. Spot-checks performed by this lane (non-author of every checked artifact)

- **SC-1 — §Pins re-derivation:** **22/22 existing assertions matched** + 5/5
  history pins (§4), same-day; the two unpinned notes (`packet-readiness-r7`
  `7185642c2e41`/122, `archive-receipt-r8` `0587605db913`/191) and the SKILL
  revision (`8874306672b65d8d`/945) recorded as current fingerprints.
- **SC-2 — archive pin equality (spot, 3/35 groups + 4 instance pins):**
  `sha256sum -c MANIFEST.txt` → `w6-tabi-b61` 139/139 · `w7-b71-synth` 3/3 ·
  `w5-tabi-b53` 9/9 = **151/151 OK, 0 FAILED, exit 0** (raw log
  `/tmp/w8-scrb8/spot-archive.txt`); instance checks vs the owning note's own
  text + the archived bytes: `server.py` `936f1584bf81…` (= `external-class-fixture-v2.md:264`),
  `v2-driver.sh` `ebdf950a5c6a…` (= :366), `v2-journey.mjs` `ccc3d83703e6…`
  (= :80), `compare-v2.mjs` `ddd839de8264…` (= :367) — **4/4 MATCH**.
- **SC-3 — L0 negative control:** three reads spanning 19:10:26–19:12:33Z
  (direct + two poll iterations), byte-identical (25 / 21,539 B / `02c53ec6…`)
  + a post-write read (§9); diff vs the round-5 filing state = none; the r5
  append proof (`head -c 20653` = `0a86973b…`) is AUD-B5's, cited not re-run.
- **SC-4 — lessons + commit:** 5 files, one `## Gate` each, shas recorded
  (§2 d3); commit `b377007` stat re-read (425 files, §5).
- **SC-5 — daemon + substrate:** independent read-only re-measurement (no
  listener 10086, no process, pointer-file shapes §5) and 3/3 substrate pins +
  daemon binary first16 — all match recorded values.
- **SC-6 — Brave reject:** `NativeMessagingHosts` only (agree; count asserted
  8th; drift lineage printed, §2 d6).
- **SC-7 — cross-lane corroboration:** ARCH-TRANCHE-R8's receipt independently
  re-ran manifest + copy checks on the enlarged tree (41/41 OK, 0 diff, 19:06Z)
  and its U4 (SKILL census stale) matches this lane's F-a; two lanes, measured
  independently, no contradiction.
- **SC-8 — plan fingerprint delta:** `plans/round-8.plan.md` bytes re-derived
  equal to the r7 draft's E1 fingerprint (§1); `plans/round-7.plan.md`
  `fa1394967c74…` / 342 and `plans/round-7-record-draft.md` `8aac0ae242161a4f` /
  349 re-derived from the committed tree — no drift since commit.

## 9. Errata — append-only

- (none yet; corrections append below with date + evidence. The final round-8
  record supersedes this file, not the other way around.)E1 — 2026-10-14T19:16Z, by SCR-B8 (post-write re-check; §9's "none yet" superseded here, not rewritten)

- **This draft's fingerprint immediately before this block:** 358 `wc -l` / 359 logical lines / 32,485 B / sha256 `07fbd551495920d2bb02801edb20110d950d446aa0ccf4ca7db12602d81434f4`. Any later append (including this one) moves the hash by construction — re-derive with `sha256sum`; the round-8 record supersedes this file.
- **L0 post-write re-check (19:14:55Z, 19:15:12Z):** unchanged — 25 lines / 21,539 B / `02c53ec6…` / mtime 14:05:52.482908587 -03. **Branch L stands**; ask-count 1; no re-ask; the mid-round switching rule is not triggered.
- **New landings during this lane's write window (19:12–19:15Z; all untracked; HEAD still `b377007`)** — the statuses in §2–§6 are as measured at 19:09–19:14Z; this block is the delta:
  - `corpus/knowledge/carried-debt-closure-r8.md` (lane **B8-2**, self-id in header) — 144 `wc -l` / 13,519 B / first16 `e3b24db30479d0d2`. Its own claim table: **(a) F1 CLOSED by erratum ER-F1** (landed here as a note since the archived group's file list must not change) and **(b) round-6 L1 matrix STILL OPEN** — status recording only, execution is the round's L0 seat. This **settles §2 b-L-r6's status** (CARRIED, now measured by a round-8 seat) and partially settles §2 d8's F1 item; its §1.3 logs the group manifest 83/83 OK.
  - `corpus/lessons/round-6.md` (lane B8-x; `6a9725fbbb70eb6a`, 150 `wc -l` / 11,176 B, `## Gate` at `:108`) — **supersedes §2 d3's "round-6.md does not exist"**: `ls -A corpus/lessons | wc -l` → **6** now; `round-7.md` still absent. The plan's Measure line "→ 6" is therefore met by count, with the round-7 lesson still owed.
  - `plans/round-9.plan.md` (lane **PREP-B9**) — 473 `wc -l` / 32,250 B / first16 `66120e6788a1c874`; next round's design plan, arriving in the same window as round-8's did (§1 delta pattern). Recorded, out of this lane's scope.
  - `plans/round-8-record-draft.md` — this file.
  - **Counts moved: knowledge 17 → 18 / 5,019 → 5,163 lines** (amend §5); lessons 5 → **6**; evidence stays 35 groups / 35 manifests.
  - `git status --short` at 19:14:55Z: `?? corpus/knowledge/carried-debt-closure-r8.md`, `?? corpus/lessons/round-6.md`, `?? plans/round-8-record-draft.md`, `?? plans/round-9.plan.md`. HEAD unchanged `b377007`; nothing committed by this lane — the commit is the scribe's.
- **Poll:** `/tmp/w8-scrb8/poll.sh` started 19:12:13Z (27 × 20 s ≈ 9 min; log `/tmp/w8-scrb8/poll.log`). Observed across iterations 1–9: L0 byte-identical throughout; `dirty` 0 → 1 (19:13:33Z) → 3 (19:14:53Z); knowledge 17 → 18 (19:13:53Z); `/tmp/w8-*` dirs 24 → 39; HEAD and SKILL sha unchanged. Sibling polls/scratch observed concurrently: `/tmp/w8-tabi-b81` (B8-1), `/tmp/w8-b82-manifest.log` (B8-2's manifest log), `/tmp/w8-tabi-b84-poll/` (B8-4's own 60-iteration poll).
- This lane writes nothing after this block; the round-8 record supersedes this file. The scribe must re-derive every §2–§6 value — B8-1/B8-3/B8-4 branch artifacts had not landed at this stamp.E2 — 2026-10-14T19:16Z, by SCR-B8 (closing fingerprint; append-only)

- **Fingerprint immediately before this block:** 370 `wc -l` / 371 logical / 35,599 B / sha256 `c4744cb9a10b795ba2c3f70465e94889628825cad0226035e36006e9d035deaf`. Any later append moves the hash by construction — re-derive with `sha256sum`; the round-8 record supersedes this file.
- **L0 across the poll's later iterations (through 19:15:33Z) and the direct read at 19:15:38Z:** byte-identical (`02c53ec6…` / 25 / 21,539 B). Branch L stands.
- **Delta since E1 (19:15–19:16Z; HEAD still `b377007`):**
  - `corpus/lessons/round-7.md` landed (`88c8244c2babdd82`, 172 `wc -l` / 12,669 B, `## Gate` at `:122`) — `ls -A corpus/lessons | wc -l` → **7** now. **§2 d3's debt is closed by landing** (both `round-6.md` and `round-7.md` now exist; the plan's measure line "→ 6" is exceeded). The record should still re-read both Gate blocks before citing.
  - `corpus/knowledge/carried-debt-closure-r8.md` was **edited in place after E1** (144 `wc -l`; 13,519 → **13,515 B**; first16 `e3b24db30479d0d2` → **`8c6b0a38d7005e6d`**; mtime 16:15 -03) — a moving file; its claim statuses (F1 closed by erratum; round-6 L1 matrix still open) re-derive at record time.
  - `git status --short` at 19:15:38Z: 5 untracked — the two lessons, the B8-2 note, `plans/round-8-record-draft.md` (this file), `plans/round-9.plan.md`. HEAD unchanged.
- **Poll:** `/tmp/w8-scrb8/poll.sh` continues to ≈19:21Z; `/tmp/w8-scrb8/poll.log` carries iterations 1–9 plus any later ones — the scribe reads the log's later iterations **and re-derives everything at record time** (the r4–r7 lesson).
- No further writes by this lane.
