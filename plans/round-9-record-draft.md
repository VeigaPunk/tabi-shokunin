# tabi-shokunin — round 9 record — DRAFT (scribe prep)

**Status: DRAFT, not the record.** This file is the round-9 **verification
table + pivot note** — written 2026-10-14T19:57–20:0xZ (16:57–17:0x -03) by
lane **SCR-B9** (round-9 scribe prep; assignment: this file only). The round-9
record itself (LOG entry, SCORECARD verdicts + move log + axes, README coverage
rows, SKILL distillation for any round-9 note, commit) is assembled later by
the round-9 scribe from the seats' landed files plus this table. Measurements
here are read-only (lane tree, `.ufo/l0-questions.md`, the webbridge substrate,
`/tmp` scratch of sibling seats); nothing outside this file was written by this
lane. Scratch: `/tmp/w9-scrb9/` (volatile: `poll.sh`, `poll.log`, `spot-*.txt`).
Discipline (`corpus/QUALITY.md:1-7`): observation / inference / unknown
separated; secrets shape-only (never content-read); substrates read-only; no
external site; as-of stamps UTC unless marked `-03`. Values measured
19:57:35–20:02:29Z unless stamped otherwise; **every value that moves must be
re-derived at record time** — round-9 seats were working while this table was
measured (§6; sibling scratch `/tmp/w9-tabi-b91/` was writing run dirs during
the read window).

## 0. The pivot note — the l0-answer-check outcome (decides the branch)

**Outcome: no answer. Round 9 runs Branch L (loopback).** First read 19:58:09Z;
re-checked by this lane's bounded poll spanning 19:58:09–20:02:29Z (27 × 20 s,
started 19:58:09Z, iterations 1–14) — `.ufo/l0-questions.md` did not move
across any read.

| Quantity | Round-5 filing state (record) | Round-8 gate record (committed) | Measured now | Verdict |
|---|---|---|---|---|
| lines | 25 (`wc -l`) | 25 | **25** | unchanged |
| bytes | 21,539 | 21,539 | **21,539** | unchanged |
| sha256 | `02c53ec60acfda4889e0cd57eb08e8f1bd5583708fcb8399bfc5a5593713613f` | same | **same** | unchanged |
| mtime | 2026-10-14 14:05:52 -03 | 2026-10-14 14:05:52.482908587 -03 | **2026-10-14 14:05:52.482908587 -03** | unchanged |
| tabi regions | 1 (line `:25`, the round-5 filing) | 1 (`:25`) | **1** (`:25`; `grep -n 'tabi'` → one hit) | unchanged |
| line budget (plan :127-138) | — | — | **1** = 2 − 1 | printed |
| pre-append state (round-5 record) | 24 lines / 20,653 B / `0a86973bd17c37f7` | — | — | filing proof stands (AUD-B5 §4, cited not re-run) |

- The single `tabi`-matching region is `:25` — the round-5 filing line (packet
  `sha256 94dc63f5fb9e…`); full line read this session; it ends *"Filing seat
  B5-4."* Nothing below it.
- Comparison base: the plan's Step 0.1 (:142-147) makes the **round-8 gate
  record** the base; it is findable — `plans/round-8-record-draft.md` §0
  (:19-58; committed in `6a8861c`, 379 `wc -l`, `970c727c5787…`): table with
  `:25` / `02c53ec6…` / 25 / 21,539 / mtime and classification **Branch L**
  (:40-42), three byte-identical reads 19:10:26–19:12:33Z plus post-write
  re-checks (E1 :362, E2 :374). The file has not moved since the round-5
  filing across five rounds of reads (r6/r7/r8/r9 + filing).
- Classification per the plan's gate table (:110-117): **SILENT** (:117) — no
  diff vs the round-5 filing (sha + line count + mtime byte-identical) →
  **Branch L**.
- Revival-decision disposition (:121-124 (iii)): **carried-unasked** (the
  SILENT row's default, :117) — no BRIDGE-NAMING line, no BRIDGE-DECLINED
  line, no grant, no denial. The decision line (the round's one permitted new
  line, :127-138) was **not filed by this lane** — SCR-B9's write scope is this
  file; the gate seat owns the material-change test and files at most one line.
  If the gate seat files it, the disposition becomes `line-filed` and the
  read-back-before-act rule (:119-120 (i)) governs.
- Silence is not a denial; the ask is unchanged; **ask-count stays 1**; the
  packet is not re-asked (default silence); a verbatim repeat of R1/R2/R3
  remains banned (:135-138).
- Mid-round switching rule (:119-120 (ii)): a mid-round answer may be acted on
  only inside its stated scope, after its own read-back. Nothing observed
  triggers it — direct read + 14 poll iterations, byte-identical.
- Clause (c) (:165-168, :328-346): `date -u +%F` → **2026-10-14** (19:57:35Z) —
  a strictly-later-date §Pins pass is impossible today by construction
  (earliest 2026-10-15 = 21:00 -03 today); no round-8 witness exists (HEAD
  `6a8861c`, commit date 2026-10-14T16:55:09-03; no in-repo block dated ≥
  2026-10-15). **CARRIED** — if the round runs past 2026-10-14 21:00 -03 the
  rider becomes executable and the witness must be a dated in-repo block +
  commit ≥ 2026-10-15; the gate re-derives.
- Round-9's standing rule (:121-124 (iii)): the round does not exit without a
  recorded status classification and a recorded revival-decision disposition;
  this section is that classification's scribe-side copy — the gate seat's own
  read-back (with its before/after counts and mtime) is what enters the record
  verbatim.

## 1. Plan reference (measured)

| Item | Value |
|---|---|
| `plans/round-9.plan.md` sha256 | `36fd8f75ac0dcc6fe55d045d8c3fedc8ddbac0463d9f693a3960c1646bda0d7e` |
| lines | `wc -l` → **493**; logical **494** (last line unterminated, ends `…all of it at its gate.`); 33,833 B |
| git state | committed in `6a8861c` (`plans/round-9.plan.md \| 494 +++`); worktree == HEAD for this path |
| design/authority | the plan **is** the design text (lane PREP-B9, run inside the round-8 wave; header freeze 2026-10-14T19:12:29Z; design reads 19:09–19:12Z; file mtime 16:15:37.304380251 -03) |

**Record delta, append-only (the record must carry this):** the round-8 record
draft's E1 (:366) fingerprinted this plan at 473 `wc -l` / 32,250 B / first16
`66120e6788a1c874` (untracked, in flight, 19:14:55Z). The committed revision is
**493 / 33,833 B / `36fd8f75ac0d`** — the plan grew ~20 lines while its own
post-freeze block closed the round-8 race (the same window in which the
round-8 draft grew 358 → 370, its E2 :377-379). Nothing is harmonized; both
values stand as recorded. No earlier snapshot of this plan is on record under
any other value.

**Curated line map (for the record's citations):** gate table :110-117 (SILENT
:117) · both-branch clauses (i)–(v) :119-138 · Step 0 :140-186 · Branch D
:188-233 · Branch G :235-268 · Branch L :270-326 · freshness rider :328-346 ·
Measure :348-375 · seats :377-394 · bounds :396-425 · discipline :427-435 ·
post-freeze block :437-494.

**Plan values superseded at write (frozen vs re-derived; do not cite the
frozen column as current):**

| Quantity | Plan's frozen read (19:09–19:12Z; post-freeze block to 19:15:33Z) | Re-derived 19:57–20:02Z |
|---|---|---|
| HEAD | `b377007` (clean) | **`6a8861c`** (clean; one untracked lesson mid-read, §6) |
| knowledge notes / lines | 17 / 5,019 (post-freeze block: 18 / 5,163) | **19 / 6,023** |
| `corpus/evidence/` groups / manifests | 35 / 35 (1,451 files / 9,222,920 B) | **35 / 35** (1,451 / 9,222,920 B) |
| `SKILL.md` revision | `8874306672b6` / 945 (post-freeze: unchanged) | **`3b79ed2dea6c` / 1057** |
| lessons | 5 (`round-1..5.md`; post-freeze: 6 → 7) | **7 → 8** (`round-8.md` landed 20:01:07Z, §6) |
| packet / L0 | `94dc63f5…` / `02c53ec6…` | **same, byte-identical** |

## 2. Step 0 gate — precondition sweep (round-8 clauses a–d, checked not assumed)

The round-9 plan (:140-186) makes the round-8 clauses this round's precondition
set. Status vocabulary: **PASS** · **CARRIED** (impossible/owed by
construction, recorded in force) · **DEBT** (owed, named) · **N/A** (no object
— grant/approval absent by default-deny) · **IN FLIGHT** (round-9 seat
working; partial artifacts observed) · **NOT LANDED** (no artifact).

| # | Predicate | Evidence as measured | Status |
|---|---|---|---|
| a | round-8's Step-0 read-back and branch classification findable in the round-8 record | `plans/round-8-record-draft.md` §0 (:19-58; committed in `6a8861c`; 379 `wc -l`, `970c727c5787…`): table with `:25` / `02c53ec6…` / 25 / 21,539 / mtime + classification **Branch L** (:40-42), post-write re-checks E1 :362 / E2 :374; `LOG.md:135` round-8 entry | **PASS** |
| b-G | G branch: real-site note (or refusal datum), budget, stop events | No grant exists (L0 unchanged; default-deny by construction); `ls corpus/knowledge/ \| grep -i 'real\|observation'` → no match (rc 1) | **N/A** |
| b-L-r6 | round-6 L1 matrix (wire-class / cache-revalidation) executed as carried debt | **Still open.** `carried-debt-closure-r8.md` §2 (:63-95) verdict *"STILL OPEN"* with the full evidence chain; `SKILL.md:1052` (round-8 block) rows it **open**; `layer-routing-synthesis.md:136-140` names it carried; no note carries cells (19-note set re-checked, §4) | **CARRIED** (round-9 L0 obligation, plan :276-290) |
| b-L-r7 | round-7 L1/L2/L3 (the state-changing step, its instruments, its guards) | **Closed for the loopback class** — `stateful-fixture-evidence.md` §6–§9 (855 `wc -l`, `f04e2e473cf9…`); `SKILL.md:1050` *"closed for the loopback class (this round)"*; residual: real-site classes stay default-deny; U1–U10 named (§11 :741-770) | **PASS (loopback class; real-site N/A)** |
| b-L-r8 | round-8 L1 (the non-idempotent step under failure) | **Measured** — same note §7–§10; `SKILL.md:1051` *"measured; U1–U10 named"*; VER-B8-1's E1 (:776-856) re-ran 7 runs on its own ports with independent bytes | **PASS** |
| b-L2 | instruments: rate/ToS-shaped + third-party-JS-shaped async (E3) | v2's rate/ToS instruments landed + archived (`w6-tabi-b61`, 139/139 OK this read, §8 SC-2); E3 async cells (late settle, beacon-shaped POST, canceled 404) still unlanded since r6 (`external-class-fixture-v2.md` §9) | **PARTIAL (E3 carried)** |
| c | freshness: §Pins re-derived on a date strictly later than 2026-10-14 | `date -u +%F` → **2026-10-14** — impossible today; no witness ≥ 2026-10-15 exists | **CARRIED** (same-day values re-derived, §4) |
| d1 | new note + coverage row + SKILL distillation | Round-8 notes **LANDED** (`stateful-fixture-evidence.md`, `carried-debt-closure-r8.md`) + SKILL round-8 append **LANDED** (`SKILL.md:948-1058`; 113+/1−; pre-append `8874306672b6`/945); coverage row **NOT LANDED** — `corpus/README.md` untouched since round 5 (`e156bb99af2c…`, 59 lines); header :5-8 still *"Held at round 3 … 8 knowledge notes, 1944 lines … Lessons: 0"* vs actual **19 / 6,023 / 8** | **DEBT** (recorded as a finding first) |
| d2 | LOG entry + commit | **LANDED** — `6a8861c` *"probation round 8 (training r7): see LOG"* (2026-10-14 16:55:09 -03; 10 files, +2,501/−1); `LOG.md` 135 lines, round-8 entry last (`:135`) | **PASS** |
| d3 | lessons count with Gates | re-derived **7** at first reads (round-1..7; one `## Gate` each) → **8** at 20:01:07Z (`round-8.md`: 254 `wc -l` / 19,735 B / `e2f3698fc2dc…`, `## Gate` present; untracked). The plan's "→ 8 (or each missing file named)" (:170-175) is **met by landing**, mid-wave; the file is owed to the commit | **PASS (owed to commit)** |
| d4 | archive present (35/35) + spot re-hash ≥3 groups vs owning-note pins | `ls -d corpus/evidence/*/ \| wc -l` → **35**; manifests → **35**; 1,451 files / 9,222,920 B. Spot `sha256sum -c`: `w6-tabi-b61` **139/139** · `w7-b71-synth` **3/3** · `w5-tabi-b53` **9/9** — **151/151 OK, 0 FAILED, rc 0** each (§8 SC-2); instance pins **4/4 MATCH** (v2) + **5/5 MATCH** (stateful harness, /tmp-based, provisional). **New since r8: none** — the stateful fixture + 32 run dirs still live only in `/tmp/w8-tabi-b81/` (and VER-B8-1's `/tmp/w8-ver-b81/`), both present; archive obligation named (note §11 :728-739; r5/r8 receipt pattern) | **PASS (spot); round-8 tranche DEBT** |
| d5 | packet `/tmp`-free + the L0 filing line | packet 121 `wc -l` / 13,103 B / `94dc63f5fb9e…` (**byte-identical to filing**); `grep -c '/tmp/'` → **0** (rc 1); L0 `:25` cites the packet + its sha | **PASS** |
| d6 | standing Brave reject re-run | `ls -A ~/.config/BraveSoftware/Brave-Browser/` → **`NativeMessagingHosts` only** → agree. **Count asserted: 9th consecutive** — lineage: r1/r2 agreement rows (SCORECARD :24, :36), r3 "third consecutive" (:51), r5 record "fifth", SCR-B6 derived 6th, SCR-B7 asserted 7th, SCR-B8 asserted 8th (`plans/round-8-record-draft.md:120`); the drift note (the round-6 plan's own "5th") stays recorded, not harmonized | **PASS** |
| d7 | carried design-time debt: README header/rows + SCORECARD r4–r8 tables/axes | re-derived: **README** stale (§d1) — coverage rows still stop at round 3; Frontier bullet still counts *"thirteen `/tmp` evidence groups"* (:48-54). **SCORECARD**: primary-verdict tables r1–r3 only (:18, :26, :38) — **r4–r8 verdict tables absent**; axes table (:53-62) still round-3-pinned (depth 7 / coverage 5 / operability 5 / freshness 3 / calibration 6 / adjacency 5); move-log rows **4–8 sit under "## Planned / retired"** (:73) at :83-87 (row 8 landed in `6a8861c`, +1 line) | **DEBT** (row 8 landed; rest named) |
| d8 | carried debts from the plan list (:178-186) | round-8 tranche **NOT LANDED** (d4); packet cold-read verdict still `[unknown]` (`operator-approval-request.md:100`); README rows 4–8; SCORECARD r4–r8 + axes refresh + move-log placement; lessons landed (§d3); SKILL's round-8 stateful-note pin stale (§4 F-a) | **PARTIAL / DEBT** (rest named) |

Naming drift found (observation, not repaired): the round-9 plan's L0 names
*"round-6 L1 — the wire-class / cache-revalidation matrix"* (:279-283) while
`packet-readiness-r7.md:64` attaches *"(the state-changing step)"* to *"the
round-6 L1 matrix"* (already recorded at `carried-debt-closure-r8.md` §2
:104-107). Both values stand as written; the record should cite the closure
note's split.

## 3. The round-9 claim's verification table (Branch L — the operative branch)

Predicates below are the round-9 plan's Branch L + Measure sections, made
mechanical. "Observed" is this lane's read at 19:57–20:02Z; status vocabulary
as in §2. Round-9 seats were live (§6) but no round-9 branch artifact had
landed in the repo at the last poll iteration (20:02:29Z: `dirty=1` — the
round-8 lesson only).

| # | Predicate (pass condition) | Expected | Observed @ 19:57–20:02Z | Status |
|---|---|---|---|---|
| L0.1 | round-6 L1 matrix executed as debt (plan :276-290): cells + verdicts, or the negative result with the matrix | filled matrix note | no matrix artifact; status as §2 b-L-r6 | **IN FLIGHT / NOT LANDED** |
| L0.2 | round-7 L1/L2/L3 landed or the deficiency named | closure or named debt | closed for the loopback class (round-8 note §6–§9) | **PASS** |
| L0.3 | round-8 L1 landed or named | same | measured (round-8 note §7–§10) | **PASS** |
| L1a | cookie/token lifecycle (plan :295-299): the value's fate across a browser restart in the lane's **own cold profile**; what the second cold run sees; per-run vs per-profile persistence | per-cell record, shape-only | seat live (`/tmp/w9-tabi-b91/`: `replay-consumed-pre`, `replay-guard-skip` rep1+rep2, `replay-unknown-token`, `xclient-consume` run dirs); no repo artifact yet | **IN FLIGHT** |
| L1b | cold-run replay contract across two independent cold clients (:300-304): which layer rejects/accepts, what the token binds to, whether the resource double-applies | contract + rows | as L1a (cells address it; bytes not yet landed) | **IN FLIGHT** |
| L1c | freshness scope (:305-308): `Cache-Control`/`Vary`/`ETag`-shaped interactions with a cookie-bearing second request (matrix extension, if L0.1 landed) | cells | not observable yet | **NOT LANDED** |
| L1d | per cell: which layer decided {wire, client status, token, cookie jar, server state}; replay contract extended **across clients** (:309-314) | filled cells + falsifiers | not observable yet | **NOT LANDED** |
| L2 | instruments (only if unlanded): v2 rate/ToS + E3 async + v2 U1 rider (:315-320) | reuse or landing | v2 instruments archived/reusable; E3 still unlanded (as §2 b-L2) | **PARTIAL (reuse + carried)** |
| L3 | guards (:321-324): byte-identity or measured divergence; both network surfaces kept; closure per run (kill by PID, ports closed, `curl` exit 7) | per-run closure lines | discipline holds corpus-wide (rung/route notes); round-9 runs pending; the round-8 runs' closure proven (32/32 closure files, `reports/r8-aud-b8.md` F5) | **HOLDS (round-9 runs pending)** |
| L4 | lane-authored fixtures only; mirrored real-site artifact stays U7 default-deny (:325-326) | no mirrored artifact | no real-site note (§2 b-G); rule stands (`PROVINCE.md:15-19`) | **HOLDS** |
| FR | freshness rider (:328-346): strictly-later-date pass iff `date -u +%F` ≥ 2026-10-15; else recorded in force | date + match count + witness | **2026-10-14** → carried; same-day re-derivation 25/26 match + 1 superseded (§4) | **CARRIED (values matched)** |
| M1 | new note + coverage row + SKILL distillation (round-9 note) | row + distillation | no round-9 branch note yet; README row absent (§2 d1) | **IN FLIGHT / DEBT** |
| M2 | lessons count | "→ 8 (or each missing file named)" | `ls -A corpus/lessons \| wc -l` → **8** (round-1..8; `round-8.md` landed 20:01:07Z, untracked) | **PASS (owed to commit)** |
| M3 | LOG entry + commit (lane identity, `AGENTS.md:3`) | round-9 entry cites evidence; commit | owed — HEAD `6a8861c`; at last read the only untracked file was `corpus/lessons/round-8.md` | **NOT LANDED (owed by scribe)** |
| M4 | Brave reject (as §2 d6) | agree or disagreement recorded | agree; 9th asserted | **PASS** |
| M5 | L0 read-back precedes any act; ask-count and line budget printed | read-back first | this table §0 (direct read + 14 poll iterations before any branch act); ask-count **1**; line budget **1**; the one permitted line not filed by this lane | **PASS (as far as measurable)** |
| M6 | operator-status datum: silence span from the filing mtime → round start; ask-count; line decision recorded | span + counts | filing **2026-10-14 17:05:52Z** → first gate read 19:58:09Z = **2 h 52 m 17 s**; ask-count **1**; line decision **none filed** (§0) | **PASS (as far as measurable)** |
| AC | anti-claim: no external site; loopback only; packet stays filed; not re-asked | nothing external; nothing filed | holds as far as measurable: L0 unchanged (no grant can exist — default-deny by construction); no real-site note; this lane ran no browser; no external request from any measured artifact; `.ufo/l0-questions.md` not written by this lane (poll re-hashes) | **HOLDS** (restate in record) |
| FL | fleet-level, reported not absorbed: tabi outside the watchdog `LANES` roster | named, not fixed by this lane | `scripts/shokunin-watchdog.sh:14` → `LANES="protocol aggregator kasegi kengaku kake kumitate kotoba kagi kama"` — **tabi still absent** (carried from r5). Fleet closeout for round 8 landed: `c272828` *"training wave-8 closeout: round 8 — … all lanes 7/10"* (2026-10-14T16:55:09-03) | **REPORTED** |

**Span-arithmetic erratum candidate (append-only; recorded, not harmonized):**
the round-8 draft's M6 row (`plans/round-8-record-draft.md:157`) reads *"filing
2026-10-14 14:05:52 -03 → this read 19:10:26Z ≈ 5h 04m of silence"* —
re-derived here, the true span is **2 h 04 m 34 s** (filing = 17:05:52Z;
19:10:26Z − 17:05:52Z = 7,474 s). The "5h 04m" value appears to subtract the
`-03` local mtime from a UTC read. The round-8 value stands as written; this
note records the re-derivation [observation].

Boundary: this lane did **not** author or audit the branch seats' work; the
statuses above are reads of file presences, timestamps, hashes and
process/port states. The verification seat + outside spot-check
(`LEARNING.md:37-43`) own the verdicts.

## 4. §Pins re-derivation — same-day (2026-10-14, 19:58–20:02Z)

Pin authority: the §Pins errata block (`SKILL.md:807-829` — the round-5 B5-3
refresh, *"supersedes the note pins in §Pins above for post-append use"*, its
post-append table at :814-826) + the round-6 SKILL-upgrade block (`:830`) + the
round-7 append block (`:930-946`) + the round-8 append block (`:948-1058`) +
§Pins itself (`:37-66`: the r4 report pin + the substrate trio). The plan's
rider (:341-346) names the set as it stands at gate time: **19 notes + 5 reports
+ 3 substrate + the current SKILL revision**. The count this table asserts is
**25/26 existing assertions match + 1 superseded (declared)**.

| # | Source | Pin (authority) | Re-derived @ 19:58–20:02Z | `wc -l` |
|---|---|---|---|---|
| 1 | `async-step-evidence.md` | `05dcda5e60b9` (:815) | `05dcda5e60b9` | 282 ✔ |
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
| 13 | `external-class-fixture-v2.md` | `4aa604f1788b` (:830) | `4aa604f1788b` | 569 ✔ |
| 14 | `webbridge-revival-assessment.md` | `a07c8aedc161` (:830) | `a07c8aedc161` | 322 ✔ |
| 15 | `layer-routing-synthesis.md` | `7725ee421716` (:836) | `7725ee421716` | 254 ✔ |
| 16 | `packet-readiness-r7.md` | no SKILL pin; last fingerprint `7185642c2e41` (r8 draft §4) | `7185642c2e41` | 122 ✔ |
| 17 | `archive-receipt-r8.md` | `0587605db913` (:961, :963) | `0587605db913` | 191 ✔ |
| 18 | `stateful-fixture-evidence.md` | `e89bc89bff38` / 773 (:971) | **`f04e2e473cf9`** | 855 — **superseded (F-a)** |
| 19 | `carried-debt-closure-r8.md` | `48dc8db69c57` / 149 (:962) | `48dc8db69c57` | 149 ✔ |
| 20 | report `reports/r4-aud-tab1.md` | `5f44b0f94483` (SKILL:62) | `5f44b0f94483` | 167 ✔ |
| 21 | report `reports/r5-aud-b5.md` | `d09f1712cbcf` (r7 draft §4) | `d09f1712cbcf` | 170 ✔ |
| 22 | report `reports/r6-aud-b6.md` | `9428ddec52b9` (r7 draft §4) | `9428ddec52b9` | 178 ✔ |
| 23 | report `reports/r7-aud-b7.md` | `ea4b16a4a844` (SKILL:916, :945) | `ea4b16a4a844` | 260 ✔ |
| 24 | report `reports/r8-aud-b8.md` | no external pin yet; self-bindings carry the pre-E1 note revision (F-b) | **`a191832be152`** | 181 |
| 25 | substrate `kimi.plugin.json` | `e70aff5c40ff` (SKILL:64-66) | `e70aff5c40ff` | 24 ✔ |
| 26 | substrate `skills/kimi-webbridge/SKILL.md` | `84a8e69d04c5` | `84a8e69d04c5` | 158 ✔ |
| 27 | substrate `skills/kimi-webbridge/references/operations.md` | `b811d9c23dfd` | `b811d9c23dfd` | 34 ✔ |
| 28 | `SKILL.md` (this revision) | anchor — the round-8 block's pre-append `8874306672b6`/945 is historical | **`3b79ed2dea6c`** | 1057 |

**Match: 25/26 existing assertions** (all re-derive equal except row 18, whose
supersession the owning note itself declares); rows 24 and 28 are new /
anchors with no prior external pin. Also re-derived (anchors): daemon binary
`71067480bd99c2ba…` (first16; = `webbridge-daemon-disposition.md` §8) ✔;
history pins (from git): `49f0735b0594` / `9e4d69dcd658` / `034b1e53b004`
(`git show 7961735:<path>`), `56224aa88430` (`5d2e95d`), `452bc514d387`
(`094c27a:SKILL.md`) — **5/5 match**.

Findings (append-only; the record must carry, not repair):

- **F-a — `SKILL.md:971`'s pin for the stateful note is superseded.** The
  round-8 block pins `stateful-fixture-evidence.md` at `e89bc89bff38` (773
  `wc -l`) with its own caveat *"untracked, moving in-wave — re-derive"*
  (:961). The committed revision is **`f04e2e473cf9`** (855 `wc -l` / 50,869 B
  / 856 logical), whose §12 E1 (:776-856) appends VER-B8-1's independent re-run
  and states the supersession itself (*"This note's sha pins in `SKILL.md`
  (`e89bc89bff38`) and `reports/r8-aud-b8.md` are superseded by this append —
  re-derive"*). No unexplained mismatch; recorded.
- **F-b — `reports/r8-aud-b8.md` binds the pre-E1 note revision.** Its
  bindings table binds `e89bc89bff38dc7a` (773 L / 45,705 B) and records the
  moving tree openly ("the tree was moving during the audit — recorded, not
  smoothed"). Its verdicts are unaffected (its re-run bytes are its own); the
  record's call whether to re-bind the rows to `f04e2e473cf9`.
- **F-c — the round-8 lesson landed during this read (untracked).**
  `corpus/lessons/round-8.md` (`e2f3698fc2dc89e5…`, 254 `wc -l` / 19,735 B,
  mtime 2026-10-14 17:01:07.310951894 -03 = 20:01:07Z), written by lane
  **B9-3** (its own header: *"Written 2026-10-14T20:0xZ by lane B9-3 (round 9 —
  lessons land one wave late)"*); it corroborates `stateful-fixture-evidence.md`'s
  final revision (`856 logical / 855 wc -l, f04e2e473cf9…, post-E1`) and the
  round-8 commit contents. Owed to the round-9 commit.
- **F-d — `corpus/README.md` header still counts round 3.** `:5-8` *"Held at
  round 3 (2026-10-14): 8 knowledge notes, 1944 lines … Lessons: 0 —
  `ls -A corpus/lessons \| wc -l` → 0"* vs re-derived **19 / 6,023 / 8**
  (`e156bb99af2c…`, 59 lines — same bytes as the round-5 read). Coverage rows
  stop at round 3; the Frontier section's *"thirteen `/tmp` evidence groups"*
  (:48-54) is stale against 35 archived groups + the unarchived round-8 `/tmp`
  groups.
- **F-e — SKILL's harness census re-derives equal** (no new tranche this
  wave): `SKILL.md:1019-1024` *"35 group dirs / 35 `MANIFEST.txt` / 1,416
  evidence files + 35 manifests = 1,451 files / 9,222,920 B"* — re-derived
  digit-for-digit. `corpus/evidence/` gained nothing since `b377007`.

Same-day limit (restated): this is a 2026-10-14 derivation; clause (c)
requires a **strictly later date** and remains **CARRIED** (earliest
2026-10-15; if this round crosses 21:00 -03 the pass becomes executable and
needs the dated witness).

## 5. Baseline anchors (repo state @ 19:57–20:02Z)

- HEAD `6a8861c1385c900b58a69fbefa1cba16c07e1b86` *"probation round 8
  (training r7): see LOG"* (2026-10-14T16:55:09-03); `git status --short` →
  **0 entries** at first reads (19:58Z); **1 entry** from 20:01Z
  (`?? corpus/lessons/round-8.md`).
- Round-8 commit contents (measured, non-evidence): 10 files, +2,501/−1 —
  `LOG.md` (+1 → 135 lines, `3757f7195ca1…`), `SCORECARD.md` (+1 → 87 lines,
  `24365e29b794…`, move-log row 8 at :87), `SKILL.md` (113+/1− → 1057 `wc -l` /
  86,899 B, `3b79ed2dea6c…`), `corpus/knowledge/carried-debt-closure-r8.md`
  (150 insertions → 149 `wc -l`, `48dc8db69c57…`), `corpus/knowledge/stateful-fixture-evidence.md`
  (856 insertions → 855 `wc -l`, 50,869 B, `f04e2e473cf9…`),
  `corpus/lessons/round-6.md` (151 → 150, `86da9d2b9419`),
  `corpus/lessons/round-7.md` (173 → 172, `88c8244c2bab`),
  `plans/round-8-record-draft.md` (380 → 379, `970c727c5787…`),
  `plans/round-9.plan.md` (494 → 493, `36fd8f75ac0d…`), `reports/r8-aud-b8.md`
  (182 → 181, `a191832be152…`). **No evidence-tree change in the commit**
  (the round-8 `/tmp` tranche still unarchived, §2 d4).
- Knowledge: **19 notes / 6,023 lines** (`ls corpus/knowledge/*.md | wc -l`;
  `wc -l … | tail -1`).
- `SKILL.md`: **`3b79ed2dea6c…` / 1057 `wc -l` (1058 logical; last line
  unterminated, tail byte `|`) / 86,899 B** (committed).
- Archive: **35 groups / 35 manifests / 1,451 files / 9,222,920 B**
  (`ls -d` / `ls …MANIFEST.txt` / `find` / `du -sb`).
- Lessons: **8** files after 20:01:07Z — `round-1..8.md` (59/60/69/87/139/150/
  172/254 `wc -l`; shas `bdd46c85b349` / `a862d69cb0b9` / `153a1b9831bb` /
  `cde3960eb1a9` / `46029f48e27d` / `86da9d2b9419` / `88c8244c2bab` /
  `e2f3698fc2dc`); one `## Gate` each (`grep -c '^## Gate'` → 1 each).
- Packet: 121 / 13,103 B / `94dc63f5…`; `/tmp` → 0. L0: 25 / 21,539 B /
  `02c53ec6…`; mtime unchanged (§0).
- Reports: r4 167 `5f44b0f94483`; r5 170 `d09f1712cbcf`; r6 178
  `9428ddec52b9`; r7 260 `ea4b16a4a844`; r8 181 `a191832be152`.
- Daemon (read-only re-measure at 19:58Z): `ss -ltn` → **no listener on
  10086** (grep rc 1); `pgrep -x kimi-webbridge` → **none** (rc 1);
  `~/.kimi-webbridge/` shapes only — `daemon.pid` 8 B, `daemon.addr` 16 B (both
  mtime 2026-10-14 10:46 -03), `identity.json` 36 B mode 600 (never
  content-read), `logs/` dir; binary first16 `71067480bd99c2ba`. Matches the
  recorded post-shutdown pattern (disposition §10).
- Browser side (process census only, no profile content): `pgrep -c chromium`
  → **19** (the plan's design read: 15 — both are instantaneous counts, not a
  floor; no extension-attachment claim made; D not operative without
  BRIDGE-NAMING).
- Brave reject: `NativeMessagingHosts` only (9th asserted, §2 d6).
- Debt line refs: `corpus/README.md:5-8` stale header; Frontier *"thirteen
  `/tmp` evidence groups"* :48-54; `SCORECARD.md` primary-verdict tables r1–r3
  only (:18, :26, :38), axes table :53-62 (round-3-pinned), "## Planned /
  retired" :73, move-log rows 4–8 at :83-87; packet status line :100
  `[unknown]`.
- Fleet repo (`/home/vgpnk/Projects/shokunin`): HEAD
  `c272828e8feff30203e0896357909a6bd8fc1f77` *"training wave-8 closeout: round
  8 — VER-S8 closes the r7 OOM-arm gap; tameshi's 3rd co-extensive instance;
  all lanes 7/10"* (2026-10-14T16:55:09-03); dirty: `?? kwin.txt` + 3 untracked
  task files under `.ufo/waves/shokunin-train-20261101-w17/tasks/`
  (`audio-gst-scout.md`, `g2d-godot-scout.md`, `g3d-bpy-scout.md`). Note (so the
  scribe does not conflate): the `shokunin-train-20261101-wNN` series is
  **another fleet's** wave (audio / g2d / g3d per `spec.json`) — not this
  training round's registry (the r6–r8 records treated the `…-w15`/`…-w16`
  series the same way).

## 6. In-flight sibling state (this lane's reads, not audits)

| Input | Expected from | Observed @ 19:57–20:02Z |
|---|---|---|
| round-9 branch seat — the replay / cross-client cells | a B9-N seat (`/tmp/w9-tabi-b91/`, naming pattern ⇒ B9-1; not otherwise confirmed) | **IN FLIGHT**: harness copied from the round-8 bytes (`server.py` `ac0013e03288ed28…` = the round-8 note's fixture pin) + extended runner (`journey.mjs` `cecf3373bceaabdc…` / 27,536 B — a new revision vs the round-8 pin `282511320499f1f5` / 21,271 B) + `curl-replay.sh`, `run-all-replay.sh`; run dirs so far: `replay-consumed-pre`, `replay-guard-skip` (rep1+rep2), `replay-unknown-token`, `xclient-consume`; scratch grew 262 → 506 files during the read window; no repo artifact landed |
| lessons seat | lane B9-3 (self-id in the lesson file) | **LANDED (untracked)**: `corpus/lessons/round-8.md` — §4 F-c |
| audit seats | `/tmp/w9-aud-b9-f1/` (manifest check outputs: `disk-list.txt`, `manifest-list.txt`, `disk-list-noManifest.txt`, `manifest-check.txt`) and `/tmp/w9-aud-b9-harness/` (a `post-form` rep1+rep2 re-run on its own ports; console header carries `pins: server.py ac0013e03288ed28 journey.mjs 282511320499f1f5`) | **IN FLIGHT** — reads of their scratch only; their verdicts are theirs |
| verifier seat | `/tmp/w9-ver-b9-work/` (`poll.sh` + `watchb9.sh`; `poll.log` rows: `kn=19 dirty=1 b91files=262→506 reps=2→3 notes=[?? corpus/lessons/round-8.md]`) | **IN FLIGHT** |
| other provinces' lanes | fleet-wide scratch | mado M9-*, tameshi T9-*, tsukuroi S9-*, verifiers/audits; round-10 prep lanes already visible (`/tmp/w9-prepm10`, `/tmp/w9-preps10-tsukuroi`, `/tmp/w9-prept10-regression`, `/tmp/w9-prept10-selftest`) — same pattern as PREP-B9 inside wave 8; named only |
| this lane's own scratch | SCR-B9 | `/tmp/w9-scrb9/` — `poll.sh` + `poll.log` (bounded 27 × 20 s, started 19:58:09Z; iterations 1–14 byte-identical on L0; `dirty` 0 → 1 at 20:01:09Z; `lessons` 7 → 8) + `spot-*.txt` (volatile) |
| `/tmp/w9-*` population | fleet-wide | 7 dirs at 19:58:09Z → **32** at 20:00:29Z |

Poll plan for the final scribe: this lane's bounded poll (27 × 20 s, ≈19:58–
20:07Z) plus the verifier's own poll (+ whatever the seats log). Every moving
value (pins, counts, L0 lines, manifests, scratch, in-flight note arrivals)
must be **re-derived at record time** — the r4–r8 lesson.

## 7. Unknowns (explicit)

- U-a: whether the round-6 L1 matrix lands in round 9 (L0.1), in which file,
  with which cells; a negative result is allowed with the matrix, never a
  claim by exhaustion.
- U-b: how far the round-9 L1 (the stateful client across runs) gets: which of
  cookie/token lifecycle across restarts / cross-client replay contract /
  freshness scope lands; N ≥ 2 cold runs per cell; whether the token's binding
  and the double-apply question get answered; the seat's cells observed so far
  address replay-after-consumption, replay-after-guard-skip (the r8 note's U2),
  unknown-token and cross-client consumption.
- U-c: whether the round-8 tranche (`/tmp/w8-tabi-b81/`, `/tmp/w8-ver-b81/`)
  is archived with a receipt in the r5/r8 pattern; until then every hash in the
  round-8 note is provisional.
- U-d: whether `corpus/lessons/round-8.md` is committed as-is; whether README
  rows/header (rounds 4–8) and SCORECARD r4–r8 verdict tables + axes refresh
  land (placement debt: move-log rows 4–8 under "Planned / retired").
- U-e: whether clause (c) executes this round (date crosses 2026-10-14
  21:00 -03 = 2026-10-15T00:00Z) and with which witness (dated in-repo block +
  commit ≥ 2026-10-15).
- U-f: whether the gate files the one permitted A4/bridge decision line (line
  budget 1; material-change test) — if not, the revival decision stays
  `carried-unasked`; a mid-round answer is read-back-before-act; either way the
  disposition must be recorded in the round record.
- U-g: the daemon change point (when/why the listener died — r4 OOM lineage)
  still unmeasured; operator-side disposition owed.
- U-h: whether a browser carrying the webbridge extension is running at gate
  time (D's precondition — D unexecutable without a BRIDGE-NAMING line
  regardless; chromium census 19 taken, attachment unmeasured).
- U-i: whether the round-9 SKILL distillation (and/or the record) re-binds the
  stale pins F-a/F-b, or leaves them to the notes' own errata (both recorded).
- U-j: the packet's cold-read verdict — `[unknown]` since r5
  (`operator-approval-request.md:100`); whether this round's non-author seat
  executes it.
- U-k: whether the round-9 branch seats complete and land; their verdicts are
  theirs, not this lane's.
- U-l: whether the round-9 note (if any) lands with the SHONEN boxes /
  verifier pattern intact (rounds 3+: named verifiers).

## 8. Spot-checks performed by this lane (non-author of every checked artifact)

- **SC-1 — §Pins re-derivation:** **25/26 existing assertions matched** + 1
  superseded-with-declared-errata (row 18 / F-a) + 5/5 history pins (§4);
  new/unpinned values recorded (r8 report `a191832be152`/181; SKILL revision
  `3b79ed2dea6c`/1057).
- **SC-2 — archive pin equality (spot, 3/35 groups + instance pins):**
  `sha256sum -c MANIFEST.txt` → `w6-tabi-b61` **139/139** · `w7-b71-synth`
  **3/3** · `w5-tabi-b53` **9/9** = **151/151 OK, 0 FAILED, rc 0** (raw logs
  `/tmp/w9-scrb9/spot-*.txt`); instance checks vs the owning notes' text + the
  archived bytes: `server.py` `936f1584bf81…` (= `external-class-fixture-v2.md:264`),
  `v2-driver.sh` `ebdf950a5c6a…` (= :366), `v2-journey.mjs` `ccc3d83703e6…`
  (= :80), `compare-v2.mjs` `ddd839de8264…` (= :367) — **4/4 MATCH**; stateful
  harness (from `/tmp/w8-tabi-b81/`, provisional until archived): `server.py`
  `ac0013e03288ed28…` (= note §0/:86), `journey.mjs` `282511320499f1f5…`,
  `curl-control.sh` `8737d42b8c9ac176…`, `compare.mjs` `435f623823b80b7d…`,
  `verify.py` `30466a46045b142e…` — **5/5 MATCH**.
- **SC-3 — L0 negative control:** direct read 19:58:09Z + 14 poll iterations
  spanning 19:58:09–20:02:29Z, byte-identical (25 / 21,539 B / `02c53ec6…` /
  mtime) + a post-write read (§9); diff vs the round-5 filing state = none; the
  r5 append proof (`head -c 20653` = `0a86973b…`) is AUD-B5's, cited not re-run.
- **SC-4 — lessons + commit:** 8 files, one `## Gate` each, shas recorded (§5);
  the 8th landed mid-read (20:01:07Z, untracked); commit `6a8861c` stat re-read
  (10 files, +2,501/−1).
- **SC-5 — daemon + substrate:** independent read-only re-measurement (no
  listener 10086, no process, pointer shapes §5) and 3/3 substrate pins + daemon
  binary first16 — all match recorded values. Path note: the trio's
  `references/operations.md` resolves under `skills/kimi-webbridge/`
  (`…/kimi-webbridge/skills/kimi-webbridge/references/operations.md`,
  `b811d9c23dfd…`); the pin is about the file, and it matches.
- **SC-6 — Brave reject:** `NativeMessagingHosts` only (agree; count asserted
  9th; drift lineage printed, §2 d6).
- **SC-7 — cross-lane corroboration:** (i) `corpus/lessons/round-8.md` (B9-3,
  independent) re-derives the round-8 note's final revision as `856 logical /
  855 wc -l, f04e2e473cf9…, post-E1` — matches this lane's row 18; (ii)
  `reports/r8-aud-b8.md` D1 re-derived the archive receipt's counts digit-exact
  (this lane's §5 re-derives the same 1,451 / 9,222,920 B); (iii) the verifier's
  poll (`/tmp/w9-ver-b9-work/poll.log`) shows the same `kn=19 / dirty=1 /
  lessons` movement this lane's poll recorded.
- **SC-8 — plan fingerprint delta:** `plans/round-9.plan.md` bytes re-derived
  (`36fd8f75ac0d`/493/33,833 B) vs the round-8 draft E1's 473/32,250 B/
  `66120e6788a1c874` (§1); `plans/round-8.plan.md` `3ad58f64c826…`/388,
  `plans/round-7.plan.md` `fa1394967c74…`/342, `plans/round-7-record-draft.md`
  `8aac0ae24216…`/349, `plans/round-8-record-draft.md` `970c727c5787…`/379
  re-derived from the committed tree — no drift since commit.
- **SC-9 — span arithmetic:** M6's silence span re-derived from timestamps
  (filing 17:05:52Z → 19:58:09Z = 2 h 52 m 17 s); the round-8 draft's claimed
  value re-checked → 2 h 04 m 34 s at its read vs its recorded "5h 04m"
  (§3 erratum candidate).

## 9. Errata — append-only

- (none yet; corrections append below with date + evidence. The final round-9
  record supersedes this file, not the other way around.)E1 — 2026-10-14T20:05Z, by SCR-B9 (post-write re-check; §9's "none yet" superseded here, not rewritten)

- **This draft's fingerprint immediately before this block:** 444 `wc -l` / 445
  logical lines / 38,672 B / sha256 `cea3f6b28d653f718518c81c32466bfe4b1891ce1dfb39e0dfafbbbdd5048d9c`.
  Any later append (including this one) moves the hash by construction —
  re-derive with `sha256sum`; the round-9 record supersedes this file.
- **L0 post-write re-check (20:04:46Z):** unchanged — 25 lines / 21,539 B /
  `02c53ec6…` / mtime `2026-10-14 14:05:52.482908587 -03`. **Branch L stands**;
  ask-count 1; line budget 1; no re-ask; the mid-round switching rule is not
  triggered.
- **New landings during this lane's write window (20:01–20:05Z; all untracked;
  HEAD still `6a8861c`)** — the statuses in §2–§6 are as measured at
  19:57–20:02Z; this block is the delta:
  - `corpus/lessons/round-8.md` (lane **B9-3**) — already carried at §4 F-c:
    254 `wc -l` / 19,735 B / `e2f3698fc2dc…` / mtime 17:01:07.310951894 -03.
  - `plans/round-10.plan.md` (lane **PREP-B10**; next round's design plan,
    arriving as PREP-B9 did: 567 `wc -l` / 38,690 B / `4d2acdb32d96…` / mtime
    17:03:40.867250391 -03; its header states round 10 is the final lane round
    and its freeze stamp is 20:01:14Z). Recorded, out of this lane's scope.
  - `reports/r9-aud-b9.md` (lane **AUD-B9**) — 174 `wc -l` / 15,013 B /
    `df34bf6c63e1…` / mtime 17:03:43.016254521 -03; its own bindings table
    binds `stateful-fixture-evidence.md` at **`f04e2e473cf9…` / 855 `wc -l` /
    50,869 B** — the same revision this draft's §4 row 18 re-derives
    (cross-lane corroboration, §8 SC-7 (iv) below); it audits the state-changing
    matrix (2 cells re-run) + the F1 erratum against
    `tabi-b1-r3b-journey/MANIFEST.txt` (`54ec7a12314d…`, 83 entries).
  - `plans/round-9-record-draft.md` — this file.
  - **Counts moved: none** — knowledge stays **19 / 6,023**; lessons **8**;
    evidence stays **35 groups / 35 manifests**; SKILL sha unchanged.
  - `git status --short` at 20:04:46Z: 4 untracked — `corpus/lessons/round-8.md`,
    `plans/round-10.plan.md`, `plans/round-9-record-draft.md` (this file),
    `reports/r9-aud-b9.md`. HEAD unchanged `b377007`→`6a8861c` (no commit by
    this lane — the commit is the scribe's).
- **Poll:** `/tmp/w9-scrb9/poll.sh` started 19:58:09Z (27 × 20 s ≈ 9 min; log
  `/tmp/w9-scrb9/poll.log`). Observed across iterations 1–20 (through
  20:04:29Z): L0 byte-identical throughout; `dirty` 0 → 1 (20:01:09Z) → 2
  (20:02:49Z) → 3 (20:03:09Z); `lessons` 7 → 8 (20:01:09Z); knowledge 19 /
  evidence 35 / SKILL sha / HEAD unchanged; `/tmp/w9-*` dirs 7 → 33. The poll's
  later iterations (to ≈20:07Z) and any post-poll landings are the scribe's to
  read; **re-derive every value at record time.**
- Sibling seat still in flight at this stamp: `/tmp/w9-tabi-b91/` (the
  replay/cross-client cells; no repo artifact yet); `/tmp/w9-ver-b9-work/`;
  audit scratch `/tmp/w9-aud-b9-f1/` + `/tmp/w9-aud-b9-harness/` (their verdicts
  are now in `reports/r9-aud-b9.md`).
- This lane writes nothing after this block; the round-9 record supersedes this
  file. The scribe must re-derive every §2–§6 value.E2 — 2026-10-14T20:07Z, by SCR-B9 (closing fingerprint + append-only correction; append-only)

- **Fingerprint immediately before this block:** 489 `wc -l` / 491 logical /
  41,947 B / sha256 `6c6f53038ede4a4a4312f11ef890d639e6729ccd6a18c06f5ca694638ca79334`.
  Any later append moves the hash by construction — re-derive with `sha256sum`;
  the round-9 record supersedes this file.
- **Correction of E1 (append-only; E1's text is not rewritten):** E1's sentence
  *"HEAD unchanged `b377007`→`6a8861c`"* is miswritten — HEAD was **`6a8861c`
  throughout this lane's window** (19:58:09–20:07:33Z); no transition occurred.
  The sentence's intent is only *"no commit by this lane"*.
- **Poll closed:** `/tmp/w9-scrb9/poll.sh` completed 27/27 iterations
  (19:58:09Z → last row 20:06:49Z). Observed across the full run: L0
  byte-identical on **all 27** iterations; `kn` 19 → 20 and `kl` 6,023 →
  6,399 → 6,402 (20:05:29–20:06:49Z); `dirty` 0 → 1 (20:01:09Z) → 2 → 3 →
  4 (20:04:49Z) → 5 (20:05:29Z); `lessons` 8 from 20:01:09Z; HEAD `6a8861c`
  and SKILL sha `3b79ed2dea6c` unchanged end-to-end; `/tmp/w9-*` dirs 7 → 33.
- **Landings during the write window (all untracked; HEAD still `6a8861c`; the
  five-file list at this stamp):**
  - `corpus/lessons/round-8.md` (lane **B9-3**) — §4 F-c: 254 `wc -l` /
    19,735 B / `e2f3698fc2dc…`.
  - `plans/round-10.plan.md` (lane **PREP-B10**) — 567 `wc -l` / 38,690 B /
    `4d2acdb32d96…` / mtime 17:03:40.867250391 -03; its header states round 10
    is the final lane round (freeze stamp 20:01:14Z). Out of this lane's scope.
  - `reports/r9-aud-b9.md` (lane **AUD-B9**) — 174 `wc -l` / 15,013 B /
    `df34bf6c63e1…` / mtime 17:03:43.016254521 -03; binds
    `stateful-fixture-evidence.md` at `f04e2e473cf9…` / 855 `wc -l` / 50,869 B
    (corroborates §4 row 18) and audits the state-changing matrix (2 cells
    re-run) + the F1 erratum against `tabi-b1-r3b-journey/MANIFEST.txt`
    (`54ec7a12314d…`, 83 entries).
  - `corpus/knowledge/state-changing-matrix-r9.md` (lane **B9-1**) — **the
    round's matrix note, landing at the window's edge and still moving**:
    observed `e8212476a46f…` / 382 `wc -l` / 28,644 B / mtime 20:07:08Z, then
    `52c6b2b5ec98…` at 20:07:33Z (re-derive; do not cite either as final). Its
    own header: the replay half of the round-6/7-deferred state-changing
    matrix on the round-8 fixture (reused byte-identical, `server.py`
    `ac0013e03288ed28…`), 9 cells × 2 cold reps plus third reps on the two
    central cells = **20 runs**, ports 19881/19882, the probes round 8 left
    owed (`stateful-fixture-evidence.md` §9.4 item 4 / §11 U2), cross-client
    cells on separate curl jars. Knowledge count 19 → **20 / 6,405 lines** at
    this stamp.
  - `plans/round-9-record-draft.md` — this file.
- **Consequence, read precisely (no over-claim):** §2 b-L-r6 and §3's L0.1/L1
  rows read "open / NOT LANDED / IN FLIGHT" for the measurement window
  19:57–20:02Z; the matrix note landed in the window's last minutes and was
  still being appended at this stamp. Its cells, verdicts, sha, and its own
  archive debt (`/tmp/w9-tabi-b91/`, 20 run dirs — volatile) are the record's
  to re-derive; nothing here converts the landing into a verdict.
- **L0 final re-check (20:07:33Z):** unchanged — 25 lines / 21,539 B /
  `02c53ec6…` / mtime `2026-10-14 14:05:52.482908587 -03`. **Branch L stands**;
  classification and revival-decision disposition as §0.
- `git status --short` at 20:07:33Z: **5** untracked entries (the five files
  above, this draft included); no commit by this lane.
- This lane writes nothing after this block; the round-9 record supersedes
  this file.
