# tabi-shokunin — round 10 record — DRAFT (scribe prep)

**Status: DRAFT, not the record.** This file is the round-10 **verification
table + pivot note** — written 2026-10-14T20:51–21:0xZ (17:51–18:0x -03) by lane
**SCR-B10** (round-10 scribe prep; assignment: this file only). The round-10
record itself (LOG entry, SCORECARD verdicts + move log + axes refresh, README
coverage rows, SKILL distillation for any round-10 note, commit) is assembled
later by the round-10 scribe from the seats' landed files plus this table. Round
10 is the **final lane round** of the training chain (`plans/round-10.plan.md:1-11`);
nothing here presumes a round 11.

Measurements are read-only (lane tree, `.ufo/l0-questions.md`, the webbridge
substrate, `/tmp` scratch of sibling seats); nothing outside this file was
written by this lane. Scratch: `/tmp/w10-scrb10/` (volatile: `poll.sh`,
`poll.log`, `spot-*.txt`). Discipline (`corpus/QUALITY.md:1-7`): observation /
inference / unknown separated; secrets shape-only (never content-read);
substrates read-only; no external site; as-of stamps UTC unless marked `-03`.
Values measured 20:51:12–20:5xZ unless stamped otherwise; **every value that
moves must be re-derived at record time** — round-10 seats were working while
this table was measured (§6: the r9 evidence group landed at 20:52:46Z;
`arc-synthesis.md` landed ~20:55Z and was still moving at the second read;
`round-9.md` landed ~20:56Z, `lessons` 8 → 9).

## 0. The pivot note — the l0-answer-check outcome (decides the branch)

**Outcome: no answer. Round 10 runs Branch L (loopback).** First read
20:51:12Z; re-checked by this lane's bounded poll (40 × 20 s, started
20:51:24Z) — byte-identical across every iteration to the last row read at the
write stamp (20:56Z; §9 E1 carries the poll close).

| Quantity | Round-5 filing state (record) | Round-8 gate record | Round-9 gate record (committed) | Measured now | Verdict |
|---|---|---|---|---|---|
| lines | 25 (`wc -l`) | 25 | 25 | **25** | unchanged |
| bytes | 21,539 | 21,539 | 21,539 | **21,539** | unchanged |
| sha256 | `02c53ec60acfda4889e0cd57eb08e8f1bd5583708fcb8399bfc5a5593713613f` | same | same | **same** | unchanged |
| mtime | 2026-10-14 14:05:52 -03 | 2026-10-14 14:05:52.482908587 -03 | same | **2026-10-14 14:05:52.482908587 -03** | unchanged |
| tabi regions | 1 (line `:25`, the round-5 filing) | 1 (`:25`) | 1 (`:25`) | **1** (`:25`; `grep -n 'tabi'` → one hit) | unchanged |
| line budget (plan :157-171) | — | — | 1 | **1** = 2 − 1 | printed |
| pre-append state (round-5 record) | 24 lines / 20,653 B / `0a86973bd17c37f7` | — | — | — | filing proof stands (AUD-B5 §4, cited not re-run) |

- The single `tabi`-matching region is `:25` — the round-5 filing line (packet
  `94dc63f5fb9e…`); full line read this session; it ends *"Filing seat B5-4."*
  Nothing below it.
- Comparison base: the plan's Step 0.1 (:175-180) makes the **round-9 gate
  record** the base and it is findable — `plans/round-9-record-draft.md` §0
  (`:20-74`; committed in `ad735dd`; 542 `wc -l` / `0b99e96e957b…`): the same
  table, classification **Branch L**, revivals disposition `carried-unasked`,
  clause (c) CARRIED, line budget 1, plus its E-blocks. The r8 §0 fallback
  (`plans/round-8-record-draft.md:25-58`) is **not needed** and is not used.
- Classification per the gate table (`plans/round-10.plan.md:137-144`):
  **SILENT** (:144) — no diff vs the round-5 filing (sha + line count + mtime
  byte-identical) → **Branch L**.
- **Revival-decision disposition** (Step 0.2, :181-185): **carried-unasked** —
  no BRIDGE-NAMING line, no BRIDGE-DECLINED line, no grant, no denial. The
  decision line (the round's one permitted new line, :157-171) was **not filed
  by this lane** — SCR-B10's write scope is this file; the gate seat owns the
  material-change test and files at most one line. If the gate seat files it,
  the disposition becomes `line-filed` and read-back-before-act governs (:148).
- **Line decision**, separately: **not filed / not permitted for this lane**;
  budget arithmetic printed above. Filing conditions (:163-171), all required:
  (a) budget ≥ 1 — holds (round 9 filed nothing; one `tabi` line); (b) the gate
  names the material change against the round-5 filing in writing (candidates:
  the r6 assessment checklist pinned, the v2 stop-rule, the archive tranches);
  (c) a decision request with no site scope inferred.
- **Clause (c) state** (:206-214, :419-431): `date -u +%F` → **2026-10-14**
  (20:51Z) — **in force** at this read. The strictly-later-date state becomes
  available only at **21:00 -03** (2026-10-15T00:00Z, ≈ 2 h 9 m after this
  write stamp). Mechanical three states: **closed** (a dated in-repo block
  whose commit is ≥ 2026-10-15, `git show -s --format=%cI` recorded →
  re-derive + match count + hold — none exists, checked: HEAD `ad735dd` is
  2026-10-14T17:47:30-03); **executable** (no witness and `date -u +%F` ≥
  2026-10-15 → execute the pass this round: dated block + commit; same-day
  re-derivations do not close it); **in force** (date not moved → stamp with
  the date, carry). If the training window ends before the flip, the round-5
  four-clause claim closes **3/4** with clause (c) named structurally
  time-blocked and the synthesis's continuation block carrying the unblock
  command — never a same-day closure claim (:433-437).
- Silence span: filing mtime **2026-10-14 17:05:52Z** → this lane's first gate
  read **20:51:12Z** = **3 h 45 m 20 s** (13,520 s); poll row 1 (20:51:24Z)
  re-read byte-identical (13,532 s to that stamp). Ask-count stays **1**; no
  re-ask; a verbatim repeat of R1/R2/R3 stays banned (:169-171).
- Mid-round switching rule (:150-151 (ii)): a mid-round answer may be acted on
  only inside its stated scope, after its own read-back. Nothing observed
  triggers it — direct read + poll iterations byte-identical.
- Standing rule (:148-155 (iii)): the final record does not close without a
  recorded status classification, a recorded revival-decision disposition, and
  a recorded clause (c) state (this round's standing rule, every branch) —
  this section is the scribe-side copy; the gate seat's own read-back (with its
  before/after counts and mtime) enters the record verbatim.

## 1. Plan reference (measured)

| Item | Value |
|---|---|
| `plans/round-10.plan.md` sha256 | `4d2acdb32d96a9296a9918f6e3e594eb19585411f584989bf21b55e88028069c` |
| lines | `wc -l` → **567**; logical **568** (last line unterminated; tail byte `.`) / 38,690 B |
| git state | committed in `ad735dd` (`plans/round-10.plan.md \| 568 +++`); worktree == HEAD for this path (re-derived) |
| design/authority | the plan **is** the design text (lane PREP-B10, run inside the round-9 wave; header freeze 2026-10-14T20:01:14Z; design reads 19:55–20:01Z) |

**Record note (no delta — state it):** the round-9 record draft's E-blocks
(`plans/round-9-record-draft.md` E1/E2) fingerprinted this plan untracked at
**567 `wc -l` / 38,690 B / `4d2acdb32d96…`** (20:03–20:07Z). The committed
revision re-derives **identical** — the plan was committed as written, unlike
the round-9 plan (458→473→493 lines across its own wave). No harmonization
needed; one value stands.

**Curated line map (for the record's citations):** claims :112-128; operator
status table :137-144; both-branch clauses (i)–(v) :146-155; round-10 line rule
:157-171; Step 0 :173-227 (precondition sweep :187-227); Branch D :229-272;
Branch G :274-306; Branch L :308-344 (L0 ladder :314-330); synthesis (clause S)
:346-415 (output path :348); freshness rider :417-437 (honesty rule :433-437);
Measure :439-469; seats :471-491; bounds :492-526; discipline :527-537;
post-freeze block :539-568 (to EOF).

## 2. Step 0 gate — precondition sweep (round-9 clauses a–d, checked not assumed)

The round-10 plan (`:187-227`) makes the **round-9 clauses** this round's
precondition set. Status vocabulary: **PASS** · **CARRIED** (impossible/owed by
construction, recorded in force) · **DEBT** (owed, named) · **N/A** (no object —
grant/approval absent by default-deny) · **IN FLIGHT** (round-10 seat working;
partial artifacts observed) · **NOT LANDED** (no artifact).

| # | Predicate | Evidence as measured | Status |
|---|---|---|---|
| a | round-9's Step-0 read-back and branch classification findable in the round-9 record (plan :189-190) | `plans/round-9-record-draft.md` §0 (`:20-74`; committed `ad735dd`; 542 `wc -l` / `0b99e96e957b…`): table with `:25` / `02c53ec6…` / 25 / 21,539 / mtime + classification **Branch L** + `carried-unasked` + budget 1; `LOG.md:136` round-9 entry | **PASS** |
| b-L-r6 | round-6 L1 matrix (wire-class / cache-revalidation) executed as carried debt (plan :314-321) | **Still open.** `SKILL.md:1146-1148` *"Still open after r9: the round-6 wire-class / cache-revalidation matrix (`carried-debt-closure-r8.md` §2)"*; the r9 note names it unlanded itself (`state-changing-matrix-r9.md` §11 U8) | **CARRIED** (round-10 L0.1) |
| b-L-r9 | round-9 L1 (the stateful client across runs): up to the plan's own reading (cells complete vs planned, closure lines, rules, falsifiers, replay contract) | **PARTIAL.** Landed: the replay half — L1b cross-client replay contract (note §8; `SKILL.md:1126-1140`), L1d per-cell token-state decision table + idempotency classes (note §3/§7; `SKILL.md:1093-1124`); 9 cells × 2 cold reps + 2 rep3 = **20 runs**, closure proven per run (note §0–§2, §10 SC-4). Not landed, named: **L1a** cookie lifecycle across a browser restart and **L1c** cache × cookie freshness scope (note §11 U8); rules M1–M8 each with falsifier (note §9). Non-author re-run of the r9 cells: **owed** — note §10 SC-2 *"no independent seat has re-run this note's cells"*; `SKILL.md:1151-1153` (as written, pre-audit) | **PARTIAL** (L1a/L1c + verification owed → L0.2) |
| b-L-verify | the audit's own scope, so it is not over-read | `reports/r9-aud-b9.md` re-ran **2 cells of the round-8 fixture** (`post-form`, `token-once`; bindings bind `journey.mjs` `282511320499f1f5…`, the r8 runner) + F1 audit (`83/83 OK`); the **r9 note's** cells: zero non-author re-runs. Both readings stand; no over-claim | **recorded** |
| c | freshness / clause (c) (:206-214) | `date -u +%F` → **2026-10-14**; no witness ≥ 2026-10-15 (HEAD `ad735dd` `2026-10-14T17:47:30-03`); same-day re-derivation in §4 | **CARRIED / IN FORCE** at read (flip 21:00 -03) |
| d1 | round-9 note + coverage row + SKILL distillation (:215-216) | note **LANDED** (`state-changing-matrix-r9.md` `ec540be07ed5` / 388 / 28,989 B, committed); distillation **LANDED** (`SKILL.md:1059-1189`, 133+/1−; pre-append `3b79ed2dea6c`/1057 recorded in-block); coverage row **NOT LANDED** — `corpus/README.md` `e156bb99af2c` / 59 lines, header still round-3: *"8 knowledge notes, 1944 lines … Lessons: 0"* vs actual **21 / 6,621 / 9** at the write stamp | **DEBT** (coverage row; header) |
| d2 | LOG entry + commit (:215) | **LANDED** — `ad735dd` *"probation round 9 (training r8): see LOG"* (2026-10-14T17:47:30-03; 9 files, +2,093/−1); `LOG.md` 136 lines, round-9 entry last (`:136`); `SCORECARD.md` 88 lines, move-log row 9 at `:88` | **PASS** |
| d3 | lessons count with Gates (:215-217) | `ls -A corpus/lessons` → **8** at open (`round-1..8.md`, one `## Gate` each, shas §5) → **9** at 20:56Z (`round-9.md` landed in-wave: 277 `wc -l` / 22,174 B / `07c3039ea5bdb2dc…`, `## Gate` present; untracked, moving). `round-10.md` is this round's own to land (:217) | **PARTIAL** (r9 landed; r10 owed) |
| d4 | archive present + spot re-hash ≥ 3 groups vs owning notes' pins (:218-220) | At open: **35 groups / 35 manifests / 1,451 files / 9,222,920 B**. The **round-9 tranche landed in-wave** — `corpus/evidence/w9-tabi-b91/` (36th group; archived 2026-10-14T20:52:46Z by lane B10-2; 269 files + `MANIFEST.txt` = **270 files** / 1,096,027 B; self-check **269/269 OK, rc 0**; manifest excludes 2,396 files / 58,072,105 B under `*profile*` paths per rule). Spot re-hashes (this lane): `w6-tabi-b61` **139/139** · `w7-b71-synth` **3/3** · `w5-tabi-b53` **9/9** · `tabi-b1-r3b-journey` **83/83** = **234/234 OK, rc 0 each** (§8 SC-2). **Still unarchived:** the round-8 tranche (`/tmp/w8-tabi-b81/` 12 top-level entries + `runs/`; `/tmp/w8-ver-b81/`) — carried; and the r10 receipt (`archive-receipt-r10.md`, promised by the w9 manifest's comment) not yet landed | **PARTIAL** (r9 landed; r8 tranche + receipt owed) |
| d5 | packet `/tmp`-free + the L0 filing line (:221) | packet 121 `wc -l` / 13,103 B / `94dc63f5fb9e…` (**byte-identical to filing**); `grep -c '/tmp/'` → **0** (rc 1); L0 `:25` cites the packet + its sha | **PASS** |
| d6 | standing Brave reject re-run (:221-224) | `ls -A ~/.config/BraveSoftware/Brave-Browser/` → **`NativeMessagingHosts` only** → agree. **Count asserted: 10th consecutive** — lineage: r1/r2 agreement rows (SCORECARD :22-24/:34-36), r3 *"third consecutive"* (:51), r5 *"fifth"*, SCR-B6 derived 6th, SCR-B7 asserted 7th, SCR-B8 asserted 8th (`plans/round-8-record-draft.md:120`), SCR-B9 asserted 9th (`plans/round-9-record-draft.md` §2 d6). The round-6 plan's own "5th" drift note stays recorded, not harmonized | **PASS** |
| d7 | carried design-time debt re-derived (:221-227) | **README**: stale (`e156bb99af2c` / 59; header round-3; coverage rows stop at round 3; Frontier *"thirteen `/tmp` evidence groups"* `:48` vs **36** groups). **SCORECARD**: primary-verdict tables r1–r3 only (`:18`, `:26`, `:38`) — **r4–r9 verdict tables absent**; axes table `:53-62` still r1-pinned (depth 7 / coverage 5 / operability 5 / freshness 3 / calibration 6 / adjacency 5); move-log rows **4–9** under "## Planned / retired" (`:73`) at `:83-88`. **Packet cold-read verdict** still `[unknown]` (`operator-approval-request.md:100`). **Packet note-pin block** 9/9 stale (`packet-readiness-r7.md` §0-§2, re-read). **SKILL :963/:1024** pin `archive-receipt-r8` at the pre-append `0587605db913` (191) — superseded by the F1-erratum append (§4 F-1). Lessons r9/r10 (d3) | **DEBT** (all named; nothing silently repaired) |
| d8 | the plan's carried-debt list (:221-227) as a set | = d7 + the r8/r9 archive tranche (d4) + the clause (c) pass (c). The r9 tranche **landed during this read** (d4); the rest ride as above | **PARTIAL / DEBT** |

Naming drift found (observation, not repaired): the round-10 plan's L0.1 names
*"round-6 L1 matrix (wire-class / cache-revalidation)"* (`:314-321`) while the
r9 note's U8 attaches both the r6 matrix **and** the r9 note's own L1a/L1c
debts to the same "still unlanded" set; the closure note's split
(`carried-debt-closure-r8.md` §2 :104-107) stands as written. The record should
cite the split, not merge it.

## 3. The round-10 claim's verification table (Branch L — the operative branch)

Predicates below are the round-10 plan's clauses F/S/B + Measure, made
mechanical. "Observed" is this lane's read at 20:51–20:5xZ; status vocabulary
as in §2. Round-10 seats were live throughout (§6).

| # | Predicate (pass condition) | Expected | Observed @ 20:51–20:5xZ | Status |
|---|---|---|---|---|
| B1 | operator-status classification + read-back recorded before any act (plan :146-155 (i)) | read-back first | §0 — direct read + poll; classification SILENT → Branch L; the gate seat's own read-back still owed into the record | **SCRIBE-COPY DONE** (gate seat's verbatim copy owed) |
| B2 | revival-decision disposition + line decision recorded with reason (:181-185) | disposition + reason | `carried-unasked` (default); line **not filed by this lane**; gate seat's call + material-change test owed; budget 1 printed | **SCRIBE-COPY DONE** (gate seat's call owed) |
| F-c | clause (c) reaches a recorded final state (:417-431) | closed / executable-executed / in force, with date + witness + match count | **in force** at read (`date -u +%F` → 2026-10-14); flip 21:00 -03; §4 gives the same-day match count; no ≥ 2026-10-15 witness exists | **IN FORCE** (re-derive at record; possible r10 crossing) |
| F-a1 | archive tranche: r9 evidence bytes archived with receipt in the r5/r8 pattern (:314-330, :439-455) | group + `MANIFEST.txt` + receipt | **group landed in-wave** (`corpus/evidence/w9-tabi-b91/`; 270 files incl. manifest / 1,096,027 B; **269/269 OK**; manifest comment names pin source + exclusions + `archive-receipt-r10.md` check B). Receipt: **not landed** at last read | **GROUP LANDED / receipt owed** |
| F-a2 | archive tranche: r8 evidence bytes (`/tmp/w8-tabi-b81/`, `/tmp/w8-ver-b81/`) archived or named with reason (:326-330) | group or named debt | **not archived** at last read; both scratch trees present (w8-tabi-b81: 12 top-level entries + `runs/`; w8-ver-b81: 6 files + `runs/`); the r8 note's §11 "one revision cannot be restored" (`e22a967ed69e9f6e…` runner) still needs its receipt naming | **NOT LANDED** (named) |
| F-p | §Pins refresh over the re-derived set (:417-431, :455) | re-derivation date + match count | §4: same-day re-derivation, **26/28 existing assertions exact + 2 superseded-with-declared-errata**, 0 unexplained; strictly-later-date remains **TIME-GATED** | **SAME-DAY DONE / later-date CARRIED** |
| S1 | synthesis note lands (clause S, :346-415) | the note + admission decision | **LANDED in-wave** — `corpus/knowledge/arc-synthesis.md` (lane B10-1; assignment-named output; header §0–§6: ladder/approval/archive/perimeter, every row citing an in-repo anchor; observed `6e46d1bb0a7e…` / 183 at 20:55:44Z → `1b4b273141ba…` / 183 / 25,068 B at 20:56:11Z — **still moving; re-derive**). Note the **path divergence**: the plan's candidate path was `ten-round-synthesis.md` (:348); the landed file is `arc-synthesis.md` (the assignment named the output); one of the two seat polls (`/tmp/w10-tabi-b104`) watches the candidate path and reads `no-synth` — record the actual path | **LANDED (moving)** |
| S2 | synthesis ↔ SCORECARD axes agree cell-for-cell (:385-389) | agreement or finding | SCORECARD axes table still r1-pinned (`:53-62`); the refresh is owed; a disagreement is a finding | **OWED** |
| S3 | debt ledger ↔ residue-set equality (:390-393) | equality | synthesis §? carries the debt/residue rows; verifier's re-run owed (non-author seat) | **OWED** |
| M-note | new note + coverage row + SKILL distillation (round-10 note = arc synthesis) | row + distillation | note landed; README row **absent**; SKILL distillation **owed** (r10 block) | **PARTIAL / DEBT** |
| M-log | LOG entry + commit (lane identity, `AGENTS.md:3`) | round-10 entry cites evidence; commit | owed — HEAD `ad735dd`; untracked at the write stamp: `corpus/evidence/w9-tabi-b91/`, `corpus/knowledge/arc-synthesis.md`, `corpus/lessons/round-9.md`, (+ this file) | **NOT LANDED (owed by scribe)** |
| M-lessons | lessons → r9 (landed) + r10 own | 9 → 10 | 8 → 9 in-wave (`round-9.md`); `round-10.md` owed | **PARTIAL** |
| M-brave | Brave reject (as §2 d6) | agree or disagreement recorded | agree; 10th asserted | **PASS** |
| M-packet | packet cold-read verdict present-or-named (:221-222) | verdict or named debt | still `[unknown]` (`:100`); named, not repaired | **DEBT (named)** |
| AC | anti-claim: no external site; loopback only; packet stays filed; not re-asked | nothing external; nothing filed | holds as far as measurable: L0 untouched (no grant can exist — default-deny by construction; 1 `tabi` line); no real-site note; this lane ran no browser; no external request from any measured artifact; `.ufo/l0-questions.md` never written (re-hash per poll row) | **HOLDS** (restate in record) |
| FL | fleet-level, reported not absorbed: tabi outside the watchdog `LANES` roster | named, not fixed by this lane | `scripts/shokunin-watchdog.sh:14` → `LANES="protocol aggregator kasegi kengaku kake kumitate kotoba kagi kama"` — **tabi still absent** (carried from r5). Fleet round-9 closeout landed: `b5a9723` *"training wave-9 closeout: round 9 — cadence tick fired; 5-plane census; state-changing matrix; all lanes 8/10"* (2026-10-14T17:47:30-03) | **REPORTED** |

Boundary: this lane did **not** author or audit the seats' work; the statuses
above are reads of file presences, timestamps, hashes and process/port states.
The verification seat + outside spot-check (`LEARNING.md:37-43`) own the
verdicts.

## 4. §Pins re-derivation — same-day (2026-10-14, 20:51–20:5xZ)

Pin authority: the §Pins errata refresh block (`SKILL.md:807-829` — its
post-append table `:814-826`; TIME-GATED line `:829`) + the round-6 block
(`:830`) + the round-7 block (`:930-946`) + the round-8 block (`:948-1057`;
carried-debt pointer table ending at the clause (c) row `:1058`) + the round-9
block (`:1059-1189`) + §Pins itself (`:37-66`: the r4 report pin + the
substrate trio). The plan's rider (:428-431) names the refresh list as it
stands at gate time: the note set (20 at open → **21** when `arc-synthesis.md`
landed), reports r4–r9, the 3 substrate pins, and the current `SKILL.md`
revision. **The count this table asserts: 26/28 existing assertions match + 2
superseded-with-declared-errata + 0 unexplained** (plus history pins 5/5 and
the SKILL historical anchors 2/2; new/unpinned values recorded).

| # | Source | Pin (authority) | Re-derived @ 20:51–20:5xZ | `wc -l` |
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
| 12 | `archive-receipt-r5.md` | `b41c2f6fb5a4` (:945) | `b41c2f6fb5a4` | 180 ✔ |
| 13 | `external-class-fixture-v2.md` | `4aa604f1788b` (:830) | `4aa604f1788b` | 569 ✔ |
| 14 | `webbridge-revival-assessment.md` | `a07c8aedc161` (:830) | `a07c8aedc161` | 322 ✔ |
| 15 | `layer-routing-synthesis.md` | `7725ee421716` (:836) | `7725ee421716` | 254 ✔ |
| 16 | `packet-readiness-r7.md` | no SKILL pin; last fingerprint `7185642c2e41` (r8 draft §4) | `7185642c2e41` | 122 ✔ |
| 17 | `archive-receipt-r8.md` | `0587605db913` / 191 (:963, :1024) | **`de45b805e5a4`** | 218 — **superseded (F-1)** |
| 18 | `stateful-fixture-evidence.md` | `e89bc89bff38` / 773 (:961; declared supersession) | **`f04e2e473cf9`** (also the r9 block's cited value) | 855 — **superseded (F-2, declared)** |
| 19 | `carried-debt-closure-r8.md` | `48dc8db69c57` / 149 (:962) | `48dc8db69c57` | 149 ✔ |
| 20 | `state-changing-matrix-r9.md` | `ec540be07ed5` / 388 (:1073, :1083; *"untracked, moving"*) | `ec540be07ed5` | 388 ✔ (now committed — caveat discharged) |
| 21 | `arc-synthesis.md` | **no pin** (landed in-wave) | **`1b4b273141ba…`** (moving at 20:56:11Z — re-derive) | 183 |
| 22 | report `reports/r4-aud-tab1.md` | `5f44b0f94483` (SKILL:62) | `5f44b0f94483` | 167 ✔ |
| 23 | report `reports/r5-aud-b5.md` | `d09f1712cbcf` (r7 draft §4) | `d09f1712cbcf` | 170 ✔ |
| 24 | report `reports/r6-aud-b6.md` | `9428ddec52b9` (r7 draft §4) | `9428ddec52b9` | 178 ✔ |
| 25 | report `reports/r7-aud-b7.md` | `ea4b16a4a844` (:916, :945) | `ea4b16a4a844` | 260 ✔ |
| 26 | report `reports/r8-aud-b8.md` | no external pin | **`a191832be152`** | 181 |
| 27 | report `reports/r9-aud-b9.md` | no external pin (r9 draft E2 saw it untracked) | **`df34bf6c63e1`** | 174 |
| 28 | substrate `kimi.plugin.json` | `e70aff5c40ff` (:64-66) | `e70aff5c40ff` | ✔ |
| 29 | substrate `skills/kimi-webbridge/SKILL.md` | `84a8e69d04c5` (158 lines) | `84a8e69d04c5` | ✔ |
| 30 | substrate `skills/kimi-webbridge/references/operations.md` | `b811d9c23dfd` (34 lines) | `b811d9c23dfd` | ✔ |
| 31 | `SKILL.md` (this revision) | anchor — historical: `3b79ed2dea6c`/1057 (r9 pre-append), `8874306672b6`/945 (r8 pre-append) | **`c07d29c3e8d178da…` / 1189 / 97,231 B** | 1189 |

**Match summary**: 26/28 existing pin assertions exact (rows 1–16, 19–25,
28–30); **2 superseded with declared errata** (row 17 F-1; row 18 F-2 —
declared by the owning files themselves); **0 unexplained mismatches**. Rows
21, 26, 27 and 31 are new/anchor values with no prior external pin. History
pins re-derived from git: `49f0735b0594` / `9e4d69dcd658` / `034b1e53b004`
(`git show 7961735:<path>`), `56224aa88430` (`5d2e95d`), `452bc514d387` / 576
(`094c27a:SKILL.md`) — **5/5 match**. Daemon binary first16 `71067480bd99c2ba…`
✔ (= `webbridge-daemon-disposition.md` §8).

Findings (append-only; the record must carry, not repair):

- **F-1 — `SKILL.md:963` / `:1024` pin `archive-receipt-r8.md` at the
  pre-append revision.** The pin reads `0587605db913` (191 `wc -l`, committed
  `b377007`); the file's committed revision is **`de45b805e5a4…` / 218** after
  the F1-erratum append (27 lines added in `ad735dd`; the receipt's own appended
  block declares *"This append moves the file's sha; the published
  `0587605db9138631` (191 lines, committed `b377007`) stands as the pre-append
  revision"*). Audited by `reports/r9-aud-b9.md` F1 (group file list unchanged;
  receipt append re-derived). No unexplained mismatch; no repairing append
  made here (SKILL edits belong to a distillation seat).
- **F-2 — `stateful-fixture-evidence.md` pin declared-superseded (as r8's F-a
  already recorded).** `SKILL.md:961` names `e89bc89bff38` / 773 with its own
  *"untracked, moving in-wave — re-derive"* caveat; the committed revision is
  `f04e2e473cf9…` / 855 — the same value the r9 block and r9 draft row 18
  re-derive. Keep as a match-with-declared-supersession, not a drift.
- **F-3 — the r9 matrix note's "untracked, moving" caveat is discharged.**
  `SKILL.md:1073`/`:1083` cite `ec540be07ed5` / 388 as untracked; the committed
  revision (`ad735dd`) re-derives the same sha/line count. The caveat stands as
  written (append-only); the record may cite the value as committed.
- **F-4 — `corpus/README.md` header + coverage rows still round-3.**
  `:5-9` *"Held at round 3 (2026-10-14): 8 knowledge notes, 1944 lines …
  Lessons: 0 — `ls -A corpus/lessons \| wc -l` → 0"* vs re-derived **21 / 6,621
  / 9** at the write stamp (the notes set grew twice during the read window:
  `arc-synthesis.md` 21st note; `round-9.md` 9th lesson); coverage rows stop at
  round 3; the Frontier block's *"thirteen `/tmp` evidence groups"* (`:48`) is
  stale against **36** archived groups. Named, not repaired.
- **F-5 — SCORECARD r4–r9 verdicts/axes/move-log placement.** Primary-verdict
  tables exist for r1–r3 only (`:18`, `:26`, `:38`); the axes table `:53-62` is
  r1-pinned (depth 7 / coverage 5 / operability 5 / freshness 3 / calibration
  6 / adjacency 5); move-log rows 4–9 sit under "## Planned / retired" (`:73`)
  at `:83-88`. The synthesis's §2 refresh and this record's SCORECARD work are
  the closing surface.
- **F-6 — packet cold-read verdict still `[unknown]`** (`:100`) since r5; the
  packet's note-pin block 9/9 stale (`packet-readiness-r7.md:18-20`); both
  named in §2 d7. The round-10 record-debt seat's call.
- **F-7 — no browser is running at this read** (process census only):
  `pgrep -c chromium` → **0** (also `brave` 0, `chrome` 0) — vs **19** chromium
  processes at the r9 reads. Environment event, recorded; it removes the D2
  experiment's precondition, which is moot under Branch L (`carried-unasked`)
  regardless.
- **F-8 — the arc-synthesis landed under a different path than the plan's
  candidate.** Plan :348 names `corpus/knowledge/ten-round-synthesis.md`; the
  landed file is `corpus/knowledge/arc-synthesis.md` (B10-1; its header cites
  its own assignment). The plan itself allows the admission seat to decide the
  path (admission against `corpus/QUALITY.md:1-8`); record the landed path, do
  not cite the candidate as fact. One sibling poll watches the candidate path
  and reads `no-synth` — a naming artifact of the same divergence, not a
  missing deliverable.

Same-day limit (restated): this is a 2026-10-14 derivation; clause (c) requires
a **strictly later date** and remains **CARRIED / IN FORCE** at this read
(earliest 2026-10-15 00:00Z = 21:00 -03; if the round crosses the flip the pass
becomes executable and needs the dated witness: dated in-repo block + commit,
`git show -s --format=%cI` recorded).

## 5. Baseline anchors (repo state @ 20:51–20:5xZ)

- HEAD `ad735dda71c9b55a7882da467c768a1305e65209` *"probation round 9
  (training r8): see LOG"* (2026-10-14T17:47:30-03); `git status --short` →
  **0** at first read; **1** from 20:52:46Z (`?? corpus/evidence/w9-tabi-b91/`);
  **2** from 20:55:44Z (`?? corpus/knowledge/arc-synthesis.md`); **3** from
  20:56:04Z (`?? corpus/lessons/round-9.md`); this file makes 4.
- Round-9 commit contents (measured): 9 files, +2,093/−1 — `LOG.md` (+1 → 136,
  `bb58f8afc29c…`), `SCORECARD.md` (+1 → 88, `2a7b02743265…`), `SKILL.md`
  (133+/1− → 1189 `wc -l` / 97,231 B, `c07d29c3e8d1…`), `archive-receipt-r8.md`
  (+27 → 218, `de45b805e5a4…`), `state-changing-matrix-r9.md` (389+ → 388 /
  28,989 B, `ec540be07ed5…`), `corpus/lessons/round-8.md` (257+ → 256 / 19,829 B,
  `d974eadc29f6…`), `plans/round-10.plan.md` (568+ → 567 / 38,690 B,
  `4d2acdb32d96…`), `plans/round-9-record-draft.md` (543+ → 542 / 45,680 B,
  `0b99e96e957b…`), `reports/r9-aud-b9.md` (175+ → 174 / 15,013 B,
  `df34bf6c63e1…`). **No evidence-tree change in that commit** — the round-9
  tranche was archived in this wave instead (§2 d4).
- Knowledge: **20 notes / 6,438 lines** at open → **21 / 6,621** at 20:55:44Z
  (`arc-synthesis.md` in).
- `SKILL.md`: **`c07d29c3e8d178da…` / 1189 `wc -l` / 97,231 B** (committed).
- Archive: **35 groups / 35 manifests / 1,451 files / 9,222,920 B** at open →
  **36 / 36 / 1,721 / 10,318,947 B** at 20:55Z (the w9 group adds 270 files /
  1,096,027 B).
- Lessons: **8** at open (`round-1..8.md`; shas `bdd46c85b349` / `a862d69cb0b9`
  / `153a1b9831bb` / `cde3960eb1a9` / `46029f48e27d` / `86da9d2b9419` /
  `88c8244c2bab` / `d974eadc29f6`; 59/60/69/87/139/150/172/256 lines; one
  `## Gate` each) → **9** at 20:56:04Z (`round-9.md` `07c3039ea5bdb2dc…` / 277 /
  22,174 B, `## Gate` present, untracked).
- Packet: 121 / 13,103 B / `94dc63f5…`; `/tmp` → 0. L0: 25 / 21,539 B /
  `02c53ec6…`; mtime unchanged (§0).
- Reports: r4 167 `5f44b0f94483`; r5 170 `d09f1712cbcf`; r6 178
  `9428ddec52b9`; r7 260 `ea4b16a4a844`; r8 181 `a191832be152`; r9 174 / 15,013 B
  `df34bf6c63e1`.
- `corpus/README.md` 59 / `e156bb99af2c`; `SCORECARD.md` 88 / `2a7b02743265`;
  `LOG.md` 136 / `bb58f8afc29c`.
- Daemon (read-only re-measure): `ss -ltn` → **no listener on 10086** (grep
  rc 1); `pgrep -x kimi-webbridge` → **none** (rc 1); `~/.kimi-webbridge/`
  shapes only — `daemon.pid` 8 B, `daemon.addr` 16 B (both mtime 2026-10-14
  10:46), `identity.json` 36 B mode 600 (never content-read), `logs/` dir;
  binary first16 `71067480bd99c2ba`. Matches the recorded post-shutdown
  pattern (disposition §10).
- Browser side (process census only, no profile content): `pgrep -c chromium`
  → **0** (F-7); no extension-attachment claim made; D not operative without a
  BRIDGE-NAMING line.
- Brave reject: `NativeMessagingHosts` only (10th asserted, §2 d6).
- Debt line refs: `corpus/README.md:5-9` stale header; Frontier `:48`
  *"thirteen `/tmp` evidence groups"*; `SCORECARD.md` primary-verdict tables
  r1–r3 only (`:18`, `:26`, `:38`), axes `:53-62` (r1-pinned), "## Planned /
  retired" `:73`, move-log rows 4–9 `:83-88`; packet status `:100`
  `[unknown]`; SKILL stale pins `:963`/`:1024` (F-1).
- Fleet repo (`/home/vgpnk/Projects/shokunin`): HEAD
  `b5a972330d2198259ce2194a29ceb41e827ac13a` *"training wave-9 closeout: round
  9 — cadence tick fired; 5-plane census; state-changing matrix; all lanes
  8/10"* (2026-10-14T17:47:30-03); untracked reported: `kwin.txt`,
  `logs_dummy.txt`, `logs_mut.txt` + `shokunin-train-20261101-w17` task files
  (the `…-wNN` series is **another fleet's** wave — audio / g2d / g3d per its
  spec; not this training chain's registry).

## 6. In-flight sibling state (this lane's reads, not audits)

| Input | Expected from | Observed @ 20:51–20:5xZ |
|---|---|---|
| round-10 archive seat — the r9 tranche | lane **B10-2** (`/tmp/w10-tabi-b10-2/`: `MANIFEST.txt` 30,103 B, `source.hashes`/`dest.hashes`/`dest.list`/`select.list`/`excluded.list`, `snapshot.txt` 20:52:16Z, `copied-at.txt` 20:52:46Z) | **LANDED (untracked)**: `corpus/evidence/w9-tabi-b91/` — 269 files + `MANIFEST.txt` (274 lines = 5 comments + 269 entries); manifest comment: lane B10-2, excluded 2,396 files / 58,072,105 B under `*profile*`; pin source = the r9 note §0 + §11 and `SKILL.md:1166-1174`; receipt `archive-receipt-r10.md` check B promised — **not yet landed at last read**; r8 tranche not yet touched at last read |
| round-10 synthesis seat — clause S | lane **B10-1** (`/tmp/w10-b101-arc/` per the note's header; not read) | **LANDED (untracked, moving)**: `corpus/knowledge/arc-synthesis.md` — §0 counts, §1–§6 (ladder / approval / archive / perimeter); 183 `wc -l` / ~25 K B; two shas minutes apart (`6e46d1bb0a7e…` → `1b4b273141ba…`) — **re-derive; do not cite either as final** |
| round-10 poll seat — watching the candidate path + this file | lane **B10-4** (`/tmp/w10-tabi-b104/poll.sh` + `poll.log`; 15 s cadence, 1,800 s cap from ≈20:51:11Z; `SYN=corpus/knowledge/ten-round-synthesis.md`; `SIDE` rows for `corpus/lessons/round-10.md` and this file) | **IN FLIGHT**: rows `no-synth` through 20:55:56Z — its watched path is the plan's **candidate** name while the landed file is `arc-synthesis.md` (F-8); its `SIDE` watch will first see this file at the write stamp |
| lessons seat — round-9 lesson | one round-10 seat (self-id inside the file) | **LANDED (untracked, moving in-wave)**: `corpus/lessons/round-9.md` — 277 `wc -l` / 22,174 B / `07c3039ea5bdb2dc…`; `## Gate` present; header names seats B9-1/B9-3/B9-4/SCR-B9/AUD-B9/VER-B9/PREP-B10 + the F1-closure append |
| the r8/r9 evidence scratch | carried debts | `/tmp/w8-tabi-b81/` (12 top-level entries + `runs/`), `/tmp/w8-ver-b81/` (6 files + `runs/`), `/tmp/w9-tabi-b91/` (source of the landed group) — all present at last read; volatile |
| other provinces' lanes | fleet-wide scratch | `/tmp/w10-m10-1`, `w10-mado-m10-2`, `w10-t10-1`/`t10-3`/`t10-4-*`, `w10-tsukuroi-*`, `w10-tameshi-*`, `w10-prep-m11`, `w10-preps11-tsukuroi`, `w10-ver-m10` — named only; `/tmp/w10-*` grew 12 → 38 dirs during the read window; `/tmp/w9-*` 33 |
| this lane's own scratch | SCR-B10 | `/tmp/w10-scrb10/` — `poll.sh` + `poll.log` (40 × 20 s from 20:51:24Z; rows byte-identical on L0 throughout; `kn` 20 → 21 at 20:55:44Z; `ev` 35 → 36 at 20:52:44Z; `dirty` 0 → 1 → 2; `lessons` 8 → 9 expected next row) + `spot-*.txt` (volatile) |

Poll plan for the final scribe: this lane's bounded poll (40 × 20 s, ≈20:51–
21:05Z) plus the B10-4 poll and whatever the seats log. Every moving value
(pins, counts, L0 lines, manifests, scratch, in-flight note arrivals) must be
**re-derived at record time** — the r4–r9 lesson.

## 7. Unknowns (explicit)

- U-a: whether the r8 tranche (`/tmp/w8-tabi-b81/`, `/tmp/w8-ver-b81/`) is
  archived with a receipt in the r5/r8 pattern before the round closes; until
  then every hash in the r8 note stays provisional; the r8 note §11's
  unrecoverable runner revision (`e22a967ed69e9f6e…`) must be named in any
  receipt.
- U-b: whether `archive-receipt-r10.md` lands and re-binds the r9 note's pins
  (the w9 manifest names "check B" as the byte-identity proof; the receipt is
  its promised home).
- U-c: whether clause (c) crosses 2026-10-15 (21:00 -03) inside the wave —
  if it does, the pass becomes **executable** and needs the dated witness
  (dated in-repo block + commit ≥ 2026-10-15); if not, it ends **in force**
  and the claim closes 3/4.
- U-d: whether the gate seat files the one permitted bridge/A4 decision line
  (material-change test; budget 1) — if not, the revival decision stays
  `carried-unasked`.
- U-e: whether `arc-synthesis.md` is stable (its sha moved once during the
  read window), whether a non-author verifier re-resolves ≥ 3 rows + ≥ 1
  negative claim, and whether its admission decision is recorded (admitted /
  rejected-kept).
- U-f: whether the round lands the README header + coverage rows, SCORECARD
  r4–r10 verdicts + axes refresh + move-log placement, and `round-10.md`.
- U-g: whether the packet cold-read test executes (its §6 falsifier; verdict
  `[unknown]` since r5) and whether the packet's 9/9 stale note-pin block is
  re-bound or the decision recorded.
- U-h: whether the r9 note's L1a/L1c cells (cookie lifecycle across restart;
  cache × cookie scope) land in round 10 as L0.2 debt or ride to the synthesis
  residue — either is a recorded outcome.
- U-i: whether any non-author re-runs the r9 note's cells (owed per its §10
  SC-2) before close.
- U-j: whether the r9↔r10 naming questions (plan candidate path vs landed
  `arc-synthesis.md`; the "mixed" L0.1 naming split) are recorded as findings
  or silently harmonized — the record should cite both values (§2 naming
  drift; F-8).
- U-k: whether a browser runs at record time (census 0 at this read, F-7; D
  not operative without a BRIDGE-NAMING line regardless).
- U-l: the fleet-level items — tabi outside the watchdog `LANES` roster
  (reported, not absorbed) and the wave-10 closeout entry (other lanes' work).

## 8. Spot-checks performed by this lane (non-author of every checked artifact)

- **SC-1 — §Pins re-derivation:** **26/28 existing assertions matched** + 2
  superseded-with-declared-errata (F-1, F-2), 0 unexplained; history pins 5/5;
  substrate 3/3; daemon binary first16 ✔; new/unpinned values recorded (rows
  21, 26, 27, 31) (§4).
- **SC-2 — archive pin equality (spot, 4 prior groups + the new group):**
  `sha256sum -c MANIFEST.txt` → `w6-tabi-b61` **139/139** · `w7-b71-synth`
  **3/3** · `w5-tabi-b53` **9/9** · `tabi-b1-r3b-journey` **83/83** = **234/234
  OK, 0 FAILED, rc 0**; the new `w9-tabi-b91` group **269/269 OK, rc 0**
  (raw logs `/tmp/w10-scrb10/spot-*.txt`).
- **SC-3 — L0 negative control:** direct read 20:51:12Z + poll iterations
  20:51:24–20:56:04Z, byte-identical (25 / 21,539 B / `02c53ec6…` / mtime) on
  every row; diff vs the round-5 filing state = none; the r5 append proof
  (`head -c 20653` = `0a86973b…`) is AUD-B5's, cited not re-run.
- **SC-4 — harness instance pins vs the notes' own text (read-only):** from
  `/tmp/w9-tabi-b91/` — `server.py` `ac0013e03288ed28…` · `journey.mjs`
  `cecf3373bceaabdc…` · `compare.mjs` `764fec22578c6827…` · `verify.py`
  `67883a80d19fcbe9…` · `driver.sh` `de31bea55f1aae9c…` · `curl-replay.sh`
  `f1763acb73a6f345…` — **6/6 = the r9 note §0's pins**; from
  `/tmp/w8-tabi-b81/` — `server.py` `ac0013e03288ed28…` · `journey.mjs`
  `282511320499f1f5…` · `curl-control.sh` `8737d42b8c9ac176…` — **3/3 = the r8
  note's and AUD-B9's pins**.
- **SC-5 — daemon + substrate:** independent read-only re-measurement (no
  listener 10086, no process, pointer shapes §5) and substrate 3/3 + daemon
  binary first16 — all match recorded values.
- **SC-6 — Brave reject:** `NativeMessagingHosts` only (agree; count asserted
  10th; drift lineage printed, §2 d6).
- **SC-7 — history pins:** 5/5 re-derived from git (§4).
- **SC-8 — plan fingerprint delta:** `plans/round-10.plan.md` re-derived
  `4d2acdb32d96…` / 567 / 38,690 B = the r9 draft E1's untracked value — no
  delta; committed-as-written (§1). Sibling plan/draft fingerprints re-derived
  from the committed tree (`round-8-record-draft.md` `970c727c5787…` / 379;
  `round-9-record-draft.md` `0b99e96e957b…` / 542).
- **SC-9 — cross-lane corroboration:** (i) the w9 group's manifest comment,
  the r9 note §11, and `SKILL.md:1166-1174` agree on the tranche's shape (269
  non-profile files; 2,396 profile files excluded); (ii) the arc-synthesis §0
  re-derives the same as-of counts this lane measured (HEAD `ad735dd`, 20
  notes at its stamp, 36 groups at 20:53Z, L0 `02c53ec60acf…` / budget 1);
  (iii) `round-9.md`'s header names the same seats the r9 draft's §6 carried.

## 9. Errata — append-only

- *(none yet at the main write; corrections append below with date + evidence.
  The round-10 record supersedes this file, not the other way around.)*E1 — 2026-10-14T20:58Z, by SCR-B10 (post-write re-check; §9's "none yet" superseded here, not rewritten)

- **This draft's fingerprint immediately before this block:** 447 `wc -l` /
  41,267 B / sha256 `e8805e54ee36b8e72dd97d75ff2b39f0433837a518af11f9b7daf014c1651c60`.
  Any later append (including this one) moves the hash by construction —
  re-derive with `sha256sum`; the round-10 record supersedes this file. Sibling
  poll `/tmp/w10-tabi-b104` logged `SIDE plans/round-10-record-draft.md
  e8805e54ee36… 447` at 20:57:41Z (cross-lane read of this file).
- **L0 post-write re-check (20:57Z):** unchanged — 25 / 21,539 B / `02c53ec6…` /
  mtime `2026-10-14 14:05:52.482908587 -03`. **Branch L stands**; budget 1;
  nothing filed by this lane.
- **New landings during this lane's write window (all untracked; HEAD still
  `ad735dd`)** — §2–§6 are as measured at 20:51–20:5xZ; this block is the delta:
  - `corpus/knowledge/arc-synthesis.md` (lane **B10-1**) — observed three shas
    in four minutes: `6e46d1bb0a7e…` (25,011 B) → `1b4b273141ba…` (25,068 B) →
    `f42428bd9af738c5…` (183 `wc -l` throughout) — **still moving; do not cite
    any of the three as final**; §3 S1 and §4 row 21 stand as read-time values.
  - `corpus/lessons/round-9.md` (round-10 lessons seat; self-id inside) —
    mtime `2026-10-14 17:56:08.715917601 -03` = 20:56:08Z; `07c3039ea5bdb2dc…`
    / 277 / 22,174 B; `## Gate` present; stable across two reads. The poll
    shows `lessons` 8 → **9** at 20:56:24Z (row 16).
  - `plans/round-11.plan.md` (lane **PREP-B11**) — `21317a8ad672ce79…` / **716**
    `wc -l` / 49,270 B / mtime 17:56 -03. Its header recites the chain-length
    measurement (fleet `MANIFEST.json` round counters; closeout commits `c272828`
    "all lanes 7/10" → `b5a9723` "all lanes 8/10") and concludes **lane round 11
    = training r10 = the last round**, contradicting this lane's round-10 plan
    premise (`plans/round-10.plan.md:8-11`: "Round 10 is the final lane round").
    [observation] Both statements now stand on record; nothing is harmonized
    here. This file's status block quotes the round-10 plan's premise; for
    chain-length questions the reader should weigh the PREP-B11 measurement
    (counters over prose). Out of this lane's scope otherwise.
  - `corpus/evidence/w9-tabi-b91/` — as landed (§2 d4, §6). The B10-2 scratch
    shows a source-drift re-check pair new at 17:57 -03 (`select-now.list`,
    `source-now.hashes`); the r8 tranche was still untouched at that stamp
    (`/tmp/w8-tabi-b81/` 12 top-level entries).
  - Counts moved: knowledge **20 → 21** (6,438 → 6,621 lines); lessons
    **8 → 9**; evidence **35 → 36** groups (1,451 → 1,721 files; 9,222,920 →
    10,318,947 B); SKILL sha unchanged; HEAD unchanged.
  - `git status --short` at 20:57:44Z (poll row 20): **5** untracked — the four
    above + this draft; no commit by this lane.
- **Poll:** `/tmp/w10-scrb10/poll.sh` started 20:51:24Z (40 × 20 s ≈ 13 min; log
  `/tmp/w10-scrb10/poll.log`). Observed through row 20 (20:57:44Z): L0
  byte-identical on **all** iterations; `dirty` 0 → 1 (20:52:44Z, the w9 group)
  → 2 (20:55:44Z, arc-synthesis) → 4 (20:56:24Z, round-9.md + round-11 plan)
  → 5 (20:57:44Z, this draft); `kn` 20 → 21 (20:55:44Z); `ev` 35 → 36
  (20:52:44Z); `lessons` 8 → 9 (20:56:24Z); SKILL sha `c07d29c3e8d1` and HEAD
  `ad735dd` unchanged end-to-end; `/tmp/w10-*` dirs 12 → 38. The poll's
  remaining iterations and any later landings are the scribe's to read;
  **re-derive every value at record time.**
- This lane writes nothing after the E2 block below; the round-10 record
  supersedes this file.E2 — 2026-10-14T21:02Z, by SCR-B10 (closing fingerprint + append-only corrections; append-only)

- **Fingerprint immediately before this block:** 497 `wc -l` / 44,977 B /
  sha256 `de6efceb1b639f8d90513cac1b60eeaf932fca3cc35568ee4b53e05ea5d1ccf5`.
  Any later append moves the hash by construction — re-derive with `sha256sum`;
  the round-10 record supersedes this file.
- **Poll closed — cut at its background cap, not the program cap.** 30/40 rows
  ran (20:51:24Z → 21:01:04Z); the task was killed at its 600 s cap 21:01:24Z.
  **Correction of E1 (append-only; E1's text is not rewritten):** E1's phrase
  "40 × 20 s ≈ 13 min" describes the script, not the run — the run ended at row
  30; its "remaining iterations" sentence is superseded. Full-run observations
  (all 30 rows): L0 byte-identical on **every** row; `kn` 20 → 21 (20:55:44Z)
  → 22 (21:00:04Z); `kl` 6,438 → 6,621 → 6,824; `ev` 35 → 36 (20:52:44Z);
  `dirty` 0 → 1 → 2 → 4 → 5 → 6; `lessons` 8 → 9 (20:56:24Z); `sk`
  `c07d29c3e8d1` on all rows (the SKILL append landed after the last row);
  `head` `ad735dd` throughout; `w10dirs` 12 → 38; `w9dirs` 33.
- **L0 final re-check (21:02:14Z):** unchanged — 25 / 21,539 B / `02c53ec6…` /
  mtime `2026-10-14 14:05:52.482908587 -03`. **Branch L stands**; budget 1;
  nothing filed by this lane.
- **New landings after E1 (all untracked unless noted; HEAD still `ad735dd`):**
  - `corpus/knowledge/archive-receipt-r10.md` (lane **B10-2**) —
    `c6f4445ebd0358f8…` / 203 `wc -l` / 15,197 B: the r9 tranche's receipt in
    the r5/r8 pattern (checks A–D + SC1–SC7; tree 35 → 36 groups / 1,451 →
    1,721 files / 9,222,920 → 10,318,947 B; 2,396 files / 58,072,105 B excluded
    by path; source drift re-check 20:57:23Z → no drift). Knowledge count
    21 → **22** (this receipt is the 22nd note). §2 d4 / §3 F-a1's "receipt
    owed" is **closed by this landing** — re-derive its own revision.
  - `SKILL.md` — **modified in-wave** (+131 insertions; `cafe81f83a9b2310…` /
    1319 `wc -l` / 107,004 B): new block at `:1190` *"Errata — round-10 append
    (the ten-round index + the arc-synthesis pointer)"*; it cites this file's §4
    (the same-day pass) and stamps clause (c) **IN FORCE / claim 3/4** at its
    write. §5's SKILL anchor (`c07d29c3e8d1` / 1189) is **superseded** — the
    r4–r10 refresh work must re-derive the SKILL revision at record time. Not
    this lane's write.
  - r8 tranche still **unarchived** at last check (`/tmp/w8-tabi-b81/` 12
    top-level entries; the B10-2 scratch shows continued verification activity —
    `verify-rep3.py`, `source-post.hashes` — shapes only).
  - Moving files at the close: `arc-synthesis.md` `f42428bd9af738c5…` / 183
    (stable over the last ~6 min — still re-derive); `round-9.md`
    `07c3039ea5bdb2dc…` / 277; `round-11.plan.md` `21317a8ad672ce79…` / 716.
- **Further append-only corrections:** §2 d3's and §5's "(lessons) → 9 at
  20:56:04Z" resolve precisely as: file mtime 20:56:08Z (`round-9.md`), first
  poll row with `lessons=9` at 20:56:24Z (E1 carried the same; restated here).
- `git status --short` at 21:02:14Z: **7** entries — ` M SKILL.md` + 6 untracked
  (`corpus/evidence/w9-tabi-b91/`, `corpus/knowledge/arc-synthesis.md`,
  `corpus/knowledge/archive-receipt-r10.md`, `corpus/lessons/round-9.md`,
  `plans/round-11.plan.md`, this file); no commit by this lane.
- This lane writes nothing after this block; the round-10 record supersedes
  this file. Every §2–§6 value must be **re-derived at record time**.