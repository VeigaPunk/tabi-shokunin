# Round 10 lessons — tabi-shokunin (2026-10-14)

Training round 10 (fleet "training r9"), wave-10 32-lane (1 lane rerouted
alibaba→hyper — `SCORECARD.md:89`); seats named in the artifacts: PREP-B10
(design), B10-1 (the arc synthesis), B10-2 (the r9 archive tranche +
`archive-receipt-r10.md`), B10-3 (lesson round-9), B10-4 (SKILL distillation +
the bounded poll), SCR-B10 (the record draft), AUD-B10 (the audit — the round's
landed verifier artifact), VER-B10 (cited by the LOG as verifier — **no
artifact or scratch found**; finding in the Gate), plus the in-wave PREP-B11
(round-11 design, swept into the commit) and the cross-lane AUD-X10
(scratch-only; audited no tabi artifact). Axis move: **calibration**
(`SCORECARD.md:89`). The claim (plan, 568 logical / 567 `wc -l`,
`4d2acdb32d96a9296a9918f6e3e594eb19585411f584989bf21b55e88028069c`, 38,690 B):
one closing move, operator-status-branched — clause **F** (clause (c) final
state + the r8/r9 archive tranches + the §Pins refresh) + clause **S** (the
ten-round synthesis) + clause **B** (the branch), executed on **Branch L**
(gate SILENT; no L0 diff). Evidence: commit `d24b98d` ("probation round 10
(training r9): see LOG", 2026-10-14T18:28:23 -03; 279 files, +28,253/−0);
`LOG.md:137`; `SCORECARD.md:89`; the record draft
`plans/round-10-record-draft.md` (546 logical / 545 `wc -l`,
`66b3a868848eb502…`, 48,575 B); the note `corpus/knowledge/arc-synthesis.md`
(184 logical / 183 `wc -l`, `f42428bd9af738c5…`, 25,125 B); the receipt
`corpus/knowledge/archive-receipt-r10.md` (204 logical / 203 `wc -l`,
`c6f4445ebd0358f8…`, 15,197 B); the archive group
`corpus/evidence/w9-tabi-b91/` (269 files + `MANIFEST.txt` 274 lines /
30,103 B; 1,065,924 B evidence bytes / 1,096,027 B `du -sb`); the audit
`reports/r10-aud-b10.md` (212 logical / 211 `wc -l`, `11dd09350de76b4f…`,
19,367 B); the lesson `corpus/lessons/round-9.md` (`07c3039ea5bdb2dc…` / 277,
22,174 B); the SKILL round-10 append (`:1190-1320`; pre-append
`c07d29c3e8d178da…` / 1,189 / 97,231 B → committed `453ed25a07f62a08…` /
1,320 / 107,005 B). Written 2026-10-14T21:39Z by lane **B11-2** (round 11 —
lessons land one wave late); every value below re-derived read-only from the
committed tree (HEAD `d24b98d`) and the surviving scratch; nothing outside
this file was written.

## The gate — how the branch was read (measured)

- `.ufo/l0-questions.md` did not move: first round-10 read 20:51:12Z; the
  SCR-B10 poll's 30 rows (20:51:24–21:01:04Z) byte-identical on every row;
  re-read at this write — **25 lines / 21,539 B / `02c53ec60acf…` / mtime
  2026-10-14 14:05:52.482908587 -03 / one `tabi` region** (`:25`, the round-5
  filing; packet `94dc63f5fb9e…`). No diff vs the filing ⇒ **SILENT** (plan
  table `:137-144`) ⇒ **Branch L**; silence is not a denial.
- **Revival-decision disposition: `carried-unasked`**; no BRIDGE-NAMING /
  BRIDGE-DECLINED line exists. **Line decision: not filed** — budget = 2 − 1 =
  **1, unspent**; ask-count **1**; no re-ask, no paraphrase. Read-back precedes
  every branch act (draft §0; the gate seat's own read-back enters the record
  verbatim).
- **Clause (c): IN FORCE at every round-10 read — stamped, not failed.**
  `date -u +%F` → 2026-10-14 at every read; the flip is 2026-10-15T00:00Z
  (= 21:00 -03); the round-10 commit is `2026-10-14T18:28:23 -03` — before the
  flip. Same-day §Pins re-derivation: **26/28 existing assertions match + 2
  superseded-with-declared-errata (F-1, F-2) + 0 unexplained**; history pins
  5/5; substrate 3/3 (draft §4; the r10 SKILL block re-binds, `:1266-1288`).
- Span arithmetic, stated not harmonized: filing mtime 17:05:52Z → the
  round-10 first gate read 20:51:12Z = **3 h 45 m 20 s**; filing → this
  lesson's read (21:36:44Z) = **4 h 30 m 52 s**.

## What was claimed, and how each clause verified

| Clause | How verified (measured) | Outcome at round 10 |
|---|---|---|
| L0.1 — round-6 L1 matrix (wire-class / cache-revalidation) executed as carried debt | not executed; the record draft's b-L-r6 row re-derives it still open (`SKILL.md:1146-1148`, re-read); no fixture cell ran this round (the plan's "no new fixture class in the final round" held) | **CARRIED AGAIN (r9's table recorded the 4th naming)** |
| L0.2 — round-9's L1a/L1c cells (cookie lifecycle across a browser restart; cache × cookie) | no cell ran; the r9 note's §11 U8 stands; named in the draft's b-L-r9 row | **CARRIED (named)** |
| L0.3 — the r8 evidence tranche archived or named | `/tmp/w8-tabi-b81/` + `/tmp/w8-ver-b81/` present at this write (5,105 / 980 files) — not copied; `archive-receipt-r10.md` §6 names it owed | **NOT LANDED (named)** |
| F-c — clause (c) reaches a recorded final state | the three states read mechanically; date unmoved; no witness ≥ 2026-10-15; stamped with the unblock recipe (dated in-repo block + commit; same-day passes never close it) | **IN FORCE — claim 3/4** |
| F-a1 — r9 evidence archived with a receipt in the r5/r8 pattern | group landed + committed; `sha256sum -c` → **269/269 OK, rc 0** (this lesson re-ran); checks A–D + SC1–SC7; source drift re-check 0 diff; 2,396 files / 58,072,105 B excluded by path, never read | **LANDED** |
| F-a2 — r8 evidence archived or named with reason | named, not archived (L0.3) | **NOT LANDED (named)** |
| F-p — §Pins refresh over the re-derived set | same-day 26/28 + 2 declared supersessions + 0 unexplained; 5/5 history; 3/3 substrate; strictly-later-date remains TIME-GATED | **SAME-DAY DONE / later-date CARRIED** |
| S1 — synthesis note lands; admission decided | `arc-synthesis.md` landed + committed; path divergence from the plan's candidate recorded (F-8); AUD-B10 re-derived C1–C3 (PASS) with findings F1–F3; **no separate admit/reject line is on record** — the draft's own U-e asked the question, and the landing + commit are the operative facts | **LANDED (3 findings riding; errata surface = the note's §7)** |
| S2 — synthesis ↔ SCORECARD axes agree cell-for-cell | not executed: the landed note carries no axes-trajectory section; `SCORECARD.md:53-62` still r1-pinned | **OWED** |
| M1 — note + coverage row + SKILL distillation | note + SKILL append landed (`:1190-1320`, +131); `corpus/README.md` **NOT touched** (`e156bb99af2c…` / 59 lines; header still round-3) | **PARTIAL — row DEBT** |
| M2 — lessons count | 8 → **9**: `round-9.md` (B10-3) committed; `round-10.md` is this file, landing one wave late | **PASS (this file)** |
| M3 — LOG + commit | `d24b98d` at 18:28:23 -03, 279 files, +28,253/−0; `LOG.md:137`; `SCORECARD.md:89` (move-log row 10) | **PASS** |
| M4 — standing Brave reject | `NativeMessagingHosts` only → agree; count asserted **10th** at r10 (drift lineage printed, draft §2 d6); re-read at this write — still `NativeMessagingHosts` only | **PASS (count printed)** |
| M5 — read-back precedes any act; ask-count + budget printed | draft §0 precedes all branch work; ask-count 1; budget 1, unspent; nothing filed; L0 byte-identical on every r10 read | **PASS** |
| AC — anti-claim | no external site (no `real-site` note — sweep → 0, synthesis §4.2); packet stays filed, `/tmp`-free; session material shape-only (the 2,396 excluded files never read); no browser launched by any r10 seat (census 0 at the draft read, F-7) | **HOLDS** |
| FL — fleet | tabi outside the watchdog `LANES` roster (`scripts/shokunin-watchdog.sh:14`); fleet closeout `494d32a` "training wave-10 closeout: round 10 … all lanes 9/10, one round remains" (18:28:23 -03) | **REPORTED (not absorbed)** |

## What landed

- `corpus/knowledge/arc-synthesis.md` (B10-1; `f42428bd9af7…`, 184 logical /
  183 `wc -l`, 25,125 B, stable from 20:56:19Z per the audit): the ten rounds
  indexed as four arcs — the evidence ladder (4 rungs + extensions, each with
  its measured boundary, §1), the approval discipline (rules + the operator
  arc measured, §2), the archive as infrastructure (receipt pattern, tranche
  table with read times, open debts, §3), the loopback perimeter + the gate's
  final state (§4; clause (c) IN FORCE, disposition `carried-unasked`);
  unknowns §5; provenance pins §6; errata §7 (none at commit). AUD-B10 bound
  this revision; its findings F1–F3 ride unrepaired in §7.
- `corpus/knowledge/archive-receipt-r10.md` (B10-2; `c6f4445ebd0358f8…`,
  204/203, 15,197 B): the r9 tranche's receipt in the r5/r8 pattern — checks
  A (269/269 OK), B (source↔archive 0 diff), C (7/7 owning pins re-hashed +
  the §2-fence extraction reproducing the archived `server.py`), D (390
  tokens; 220 archived matches; all 170 non-matches classified), SC1–SC7;
  exclusions 2,396 / 58,072,105 B; F1 malformed 37-char HEAD pin in
  `carried-debt-closure-r8.md:5` (erratum owed); F5 `verify.py` ROOT
  hard-coded. First write `a73cd2d9…` / 197 L; final revision committed.
- `corpus/evidence/w9-tabi-b91/` — 269 files + `MANIFEST.txt` (5 header +
  269 lines / 30,103 B); composition 12 top-level + 1 `__pycache__` `.pyc`
  (the tree's first — recorded decision) + 256 `runs/` artifacts over 9 cell
  dirs / 20 rep dirs; census 35 → 36 groups, 1,451 → 1,721 files,
  9,222,920 → 10,318,947 B; evidence excluding manifests 1,685 / 10,135,246 B.
- `reports/r10-aud-b10.md` (AUD-B10; `11dd09350de76b4f…`, 212/211, 19,367 B):
  the verdict table C1–C3 / T1–T8 / R1–R6 / A1; the three synthesis claims
  re-derived (method → result); findings F1–F3 + the loose-label naming note;
  unknowns U1–U5; the R4 scope note (the 170-token partition is the receipt's
  own measurement — the audit re-derived the aggregate + 3 classifications).
- `corpus/lessons/round-9.md` (B10-3; `07c3039ea5bd…`, 278/277, 22,174 B) —
  the lesson for round 9, landed in-wave (the one-wave-late pattern).
- `SKILL.md` round-10 append (B10-4; committed `453ed25a07f6…` / 1,320 /
  107,005 B; `:1190-1320`, +131): the ten-round table + the synthesis pointer;
  pin re-binds (F-1/F-2/F-3 + the three new pins); clause (c) IN FORCE / 3-4;
  residual pointers (chain-length divergence, the fleet roster item, the
  integrating round's owed list).
- `LOG.md:137` + `SCORECARD.md:89` (move-log row 10: axis calibration,
  wave-10 32-lane, 1 rerouted) + the committed record draft
  (`plans/round-10-record-draft.md`) with `plans/round-11.plan.md` swept in +
  commit `d24b98d` (279 files, +28,253/−0).
- `VER-B10` — cited by `LOG.md:137` as a verifier; **no artifact and no
  surviving scratch found** (repo-tree grep + a bounded `/tmp` sweep → only
  the LOG line). The confirmation the LOG names ("rung-1 CONFIRMED by
  archived-byte re-hash") re-derives through AUD-B10 R5 / receipt SC3–SC5
  (Method lessons). Recorded as a finding; not counted as landed.
- `AUD-X10` (cross-lane; scratch-only `/tmp/w10-audx10-ev/verdict.md`): a
  20:54:20–21:12:30Z window audit of the other three lanes' claims; tabi
  appears only as HEAD/porcelain; it audited no tabi artifact and wrote no
  fleet file.

## Method lessons

- **An archive receipt pays the "provisional until archived" debt, and the pin
  battery is the receipt.** [observation] 269/269 manifest OK (re-run here),
  source↔archive 0 diff, 7/7 owning pins re-hash from archived bytes, and the
  §2-fence extraction reproduces the archived `server.py`
  (`ac0013e03288ed28…` / 12,311 B). [inference] after the copy the claims
  survive `/tmp` expiry; what the snapshot fixes is exactly what was copied
  (20:52:46Z), never what `/tmp` holds now (receipt U1) — say which.
- **For derived facts, archived bytes turn a re-run into a re-hash — a real
  verification, not a shadow of one.** [observation] rep3 digests re-derived
  from the archive (`verify.py` ROOT → archive; `ec26a525bc7c6537` /
  `ab95cdd4b0b002a7` ALL_IDENTICAL); `ledger-after.json` byte-equal 3/3
  (`5d0884813ccb65da…` / `50956809aa556a75…` — re-hashed here); PNGs and
  `facts.json` single-sha per cell across rep1–3 (re-hashed here);
  `matrix.tsv` vs `compare-out.txt` → `cmp` IDENTICAL. [inference] the
  rung-1/derived-artifact claims are falsifiable from the archive alone; raw
  timings and CDP inter-kind order remain outside (r8 §9.2-3) — state which
  side a confirmation sits on.
- **A synthesis is auditable only row-by-row, and the audit found the
  row-level failure classes.** [observation] F1: the r7-tranche row reads
  `25 → 35` while its own citation (`archive-receipt-r8.md:7-14`) says
  `28 → 35`; F2: §0 pairs `36 … at 20:53Z` with a `35 … at 20:53:05Z`
  pre-state the lane's own scratch contradicts; F3: "4 rungs + 5 measured
  extensions" is not enumerated (4 bullets). All three re-read at this
  lesson's write (`arc-synthesis.md:18`, `:42`, `:97`). [inference] a
  synthesis row is a measurement — count + command + read time; anything
  assembled beyond one source needs its split shown.
- **The count moves under the writer — the round demonstrated the failure and
  the repair.** [observation] knowledge 20 → 22, lessons 8 → 9, evidence
  35 → 36, SKILL 1,189 → 1,320 across the wave; the SCR-B10 poll caught each
  transition row-by-row; F2 is the one row that paired the right counts with
  the wrong stamp. [inference] same as r7/r9: stamp every count with its read
  time; the later reader re-derives and the divergence is a finding.
- **A verifier cited is not a verifier landed.** [observation] `LOG.md:137`
  cites VER-B10; no artifact, no scratch, no poll row anywhere names it; the
  confirmation the line describes re-derives through AUD-B10 and the receipt
  instead. [inference] r9's lesson ("the pass is not landed until it is a
  file") recurs exactly: land the pass or name its surface; a citation with
  no surface cannot be re-read.
- **The assignment's output path is the deliverable; the plan's candidate
  path is a guess.** [observation] the plan named `ten-round-synthesis.md`;
  the landed note is `arc-synthesis.md` (F-8) — and a sibling poll watching
  the candidate path kept reading `no-synth` after the note existed.
  [inference] watch the assignment's output and cite the landed path; a poll
  on a guessed path manufactures a false absence.
- **An erratum path routed into a file must name both outcomes.**
  [observation] the plan routed any synthesis rejection into this file's
  Gate; the note landed, so the Gate records the fallback **closed
  unexercised** and the three audit findings as the live errata surface
  instead. [inference] when a plan assigns a fallback to a named file, the
  happy-path closure is that file's job too — otherwise the next reader
  cannot tell "no rejection" from "not checked".
- **Exclusion rules are load-bearing; the census must count what it keeps and
  name what it drops.** [observation] component-exact `*profile*` excluded
  2,396 files / 58,072,105 B, none read; the same rule admitted the tree's
  first `.pyc` (decision recorded). [inference] the archived copy is bytes +
  a rule; both the count and the rule travel in the manifest so a cold reader
  can re-derive the partition.
- **Premises compete with counters; the counters won, and the record kept
  both.** [observation] the round-10 plan called itself "the final lane
  round"; PREP-B11's plan (counters over prose) measured one more; both texts
  stand un-harmonized, and this file's existence in round 11 is the
  resolution by construction. [inference] count by command, state the premise
  as a premise; a plan's self-description is not evidence about the chain.
- **The one-wave-late lesson binds the committed revision.** [observation]
  `round-9.md` (B10-3) was written mid-wave from HEAD `ad735dd` + surviving
  scratch, with its SC-C marked "observed not authored"; this lesson binds
  HEAD `d24b98d` and re-derives every cited value at the write. [inference]
  the lag is structural — its cost is that moving values must be re-derived
  twice; its value is that the lesson reads a settled tree.

## Gate

- Candidates: the arc synthesis (B10-1); the archive receipt + the w9 group
  (B10-2); AUD-B10; the SKILL r10 append (B10-4); `round-9.md` (B10-3); the
  record draft (SCR-B10); `plans/round-11.plan.md` (PREP-B11, swept); the
  commit `d24b98d`. Not candidates: AUD-X10 (fleet scratch; tabi unaudited by
  it); VER-B10 (cited, no surface).
- Admitted: all of the above as committed in `d24b98d` — **with AUD-B10's
  F1–F3 riding as recorded findings, not repairs** (append-only; the
  synthesis's §7 is the owning lane's errata surface). The round's
  fleet-recorded verdicts are all-`improved` on the five axes (fleet
  `MANIFEST.json`, tabi round-10 record: "arc synthesis; r9 archive; rung-1
  CONFIRMED by archived-byte re-hash"); tabi's own SCORECARD r4–r10 verdict
  tables remain absent (owed — S2 unexecuted). The discernment datum this
  lesson owes is the spot-check set below (an admit whose findings re-derive;
  **agree**, nothing reversed).
- Rejected / deferred, with reasons: **VER-B10 as evidence** (no
  artifact/scratch — finding); the r8 tranche archive (named; scratch present
  5,105 / 980 files, volatile); clause (c) (in force; witness ≥ 2026-10-15
  owed — the round-11 gate owns the pass per its plan); the synthesis F1–F3
  errata + the receipt's F1 malformed-pin erratum (owning lanes; this file's
  write scope is this file); the README header + coverage rows 4–10
  (untouched); the SCORECARD r4–r10 verdict tables + axes refresh + move-log
  placement (row 10 landed under "## Planned / retired" `:73`; refresh
  absent); the packet cold-read verdict (`[unknown]` since r5) + its 9/9
  stale note-pin block; the r6 L1 matrix; the r9 note's L1a/L1c + U-items;
  the non-author re-run of the r9 note's cells (the archived-byte re-analysis
  — receipt SC3 / audit R5 — re-derived its rep3 claims; recorded as partial,
  the note's §10 SC-2 debt as written stands); the `*profile*`-excluded bytes
  (never read; kagi's province); the r9-audit/scribe/verifier scratch (not
  named as archive debt by any owning note — receipt U2).
- Spot-check (non-author): **AUD-B10** — verdict table C1–C3 / T1–T8 /
  R1–R6 / A1, every row PASS (two rows with findings; R4 explicitly
  spot-only); the manifest battery re-ran independently; the three findings
  re-read at this write against the synthesis text and all three re-derive;
  **agree** — with its scope limits kept.
- Spot-check (this lesson, non-author of every round-10 artifact):
  - **SC-A — the archive re-checked from disk:**
    `cd corpus/evidence/w9-tabi-b91 && sha256sum -c MANIFEST.txt` →
    **269/269 OK, 0 FAILED, rc 0**; composition 269 = 12 + 1 + 256;
    `verify-out.txt` carries the two rep digests twice each.
  - **SC-B — rep-equality re-hashed from archived bytes:**
    `ledger-after.json` `5d0884813ccb65da…` (guard-skip) /
    `50956809aa556a75…` (consumed-pre) single-valued across rep1–3;
    `after-abort.png` / `after-replay.png` / `facts.json` single-sha per cell
    across rep1–3; `matrix.tsv` vs `compare-out.txt` → `cmp` IDENTICAL.
  - **SC-C — the audit's findings re-derived from the synthesis text:** F1
    (`:97`: `25 → 35` vs its citation's `28 → 35`), F2 (`:18`), F3 (`:42` vs
    §1.1's four bullets) — all three present as recorded; the draft's U-e
    ("whether its admission decision is recorded") still resolves to
    *not separately recorded*.
  - **SC-D — controls at this write:** L0 byte-identical to the filing
    (25 / 21,539 B / `02c53ec6…` / mtime; one `tabi` line);
    `ls -A corpus/lessons` → **9** before this file; Brave →
    `NativeMessagingHosts` only; HEAD `d24b98d`; `git status --short` shows
    the round-11 wave's in-flight edits (` M SKILL.md`, plus untracked
    `corpus/knowledge/closeout-r11.md`, `plans/completion-evidence.md`) —
    read as shapes, not cited; knowledge count at this write 23 / 7,058
    lines (22 / 6,824 at the r10 SKILL write — the count moved again under
    the round-11 wave).
- Falsifier: a manifest line failing `sha256sum -c`; a rep-equality claim
  whose archived bytes disagree; a synthesis row whose citation contradicts
  its cell (F1 class); a "confirmed" verifier with no artifact and no scratch
  (VER-B10 class); a same-day claim that clause (c) closed; a count without
  its read time; a candidate path cited as the landed one; a lesson file
  without a `## Gate`.
- Re-run commands (from the lane root; the fleet root is the parent —
  `.ufo/` lives there):
  ```sh
  ls -A corpus/lessons | wc -l                                  # 10 with this file (9 before it)
  grep -c '^## Gate' corpus/lessons/round-{1..10}.md            # 1 each once this file exists
  cd corpus/evidence/w9-tabi-b91 && sha256sum -c MANIFEST.txt   # 269/269 OK, rc 0
  sha256sum corpus/knowledge/arc-synthesis.md                   # f42428bd9af738c5…
  sha256sum corpus/knowledge/archive-receipt-r10.md             # c6f4445ebd0358f8…
  sha256sum reports/r10-aud-b10.md                              # 11dd09350de76b4f…
  sha256sum corpus/lessons/round-9.md                           # 07c3039ea5bdb2dc…
  git show -s --format='%cI' d24b98d                            # 2026-10-14T18:28:23-03:00
  git show d24b98d:SKILL.md | sha256sum                         # 453ed25a07f62a08…
  sha256sum ../.ufo/l0-questions.md                             # 02c53ec6… (25 lines / 21,539 B)
  grep -c '^tabi' ../.ufo/l0-questions.md                       # 1
  date -u +%F                                                   # 2026-10-14 → (c) in force / carried
  ```
- Carried debt out of this round: the r8 tranche archive (`/tmp/w8-tabi-b81`,
  `/tmp/w8-ver-b81`); clause (c) (witness ≥ 2026-10-15); README header +
  coverage rows 4–10; SCORECARD r4–r10 verdict tables + axes refresh +
  move-log placement; the packet cold-read verdict + note-pin block; the
  synthesis F1–F3 errata and the receipt's F1 malformed-pin erratum (owning
  lanes, append-only); the r6 L1 matrix (next naming); the r9 note's
  L1a/L1c + U-items; the r9 cells' non-author re-run (partial via archived
  bytes); the r9-audit/scribe/verifier scratch (unnamed debt); and
  `round-10.md` is this file, so the one-wave-late pattern's next file is
  `round-11.md` (the round-11 wave's own — its record-debt seat owns it,
  `plans/round-11.plan.md:594-596`).