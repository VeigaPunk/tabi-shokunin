# Round 6 lessons — tabi-shokunin (2026-10-14)

Training round 6 (fleet "training r5"), 32-lane wave (2 lanes rerouted
alibaba→hyper) — seats B6-1 fixture v2, B6-2 revival assessment +
live-state snapshot, B6-4 landing watcher, plus AUD-B6 and SCR-B6;
VER-B6 named as verifier in the LOG. Axis move: **freshness + calibration**
(`SCORECARD.md:85`). The claim: one axis-move, two branches — Branch G (the
top rung, real-site observation under a recorded grant) or Branch L (the
loopback mechanism both the r4 audit and the async note independently named:
the wire-class / cache-revalidation matrix), with the fixture edge-classes
(L2) and guards (L3) riding the same branch (`plans/round-6.plan.md`; 208
`wc -l`, sha256 `b86c95c75323…`). Evidence: commit `c0467a6` ("probation
round 6 (training r5): see LOG", 2026-10-14 15:17:26 -03; 9 files,
+1,957/−1); `LOG.md:133`; the verification table
`plans/round-6-record-draft.md` (370 `wc -l`); `reports/r6-aud-b6.md`
(178 `wc -l`).

## The gate — how the branch was read (measured)

The operator channel has exactly one measurement surface: `.ufo/l0-questions.md`
content (answers arrive by in-place edit; operator presence is never itself a
grant channel). The round-6 gate read the file four times spanning
17:40:11–17:43:52Z, byte-identical every time — 25 lines / 21,539 B /
`02c53ec60acf…` / mtime 2026-10-14 14:05:52 -03 / one `tabi` region (`:25`,
the round-5 filing line, packet sha `94dc63f5fb9e…`). The lane's bounded poll
then held it byte-identical for 40/40 iterations (17:41:20–18:00:50Z).
**No diff / no answer → Branch L**; silence is not a denial; ask-count stays
**1**, the packet is not re-asked. Clause (c) (`date -u +%F` → 2026-10-14)
stayed impossible by construction: carried, not failed.

## What was claimed, and how each clause verified

| Clause | How verified (measured) | Outcome at round 6 |
|---|---|---|
| L0 gate record | the four L0 reads recorded **before** any act; classification Branch L; read-back-before-act rule never triggered | **PASS** |
| L1a/L1b — the matrix (rule + falsifier + cells) | no note, no cell logs; scratch `/tmp/w6-tabi-b61/` holds the chain runs and probes, not the matrix | **CARRIED** (becomes round-7's L0 obligation) |
| L2a/L2b/L2c — fixture v2 | note landed 14:52:24 -03: 569 `wc -l` / `4aa604f1788b…`; 302→303→307 chain with cross-path hop and origin change `127.0.0.1:19541`→`19543`; four rate/ToS-shaped instruments (robots-shaped body, `429`+`Retry-After`, `403`, CAPTCHA-shaped interstitial served as 200); stop-and-report proved from runner plan **and** server request log; "a loopback 429 is an instrument, never a C6 datum" written into §8 | **LANDED** (committed) |
| L3 — guards | the fixture's own closure-per-run lines and stop proof landed inside its runs; the matrix's byte-identity rows do not exist | **PARTIAL / CARRIED** |
| N1 — note + coverage row + SKILL distillation | 2 notes landed; SKILL `+31/−1` → `a8ba10b86138…` (795 `wc -l` / 64,401 B blob) with the fixture-usage section, the revival block and the finding that the recorded "8-field" `/status` reading undercounts (two samples carry 9 keys); the `README.md` coverage row did **not** land | **PARTIAL — row DEBT** |
| N2 — lessons count | 4 files at the sweep (`round-1..4.md`); `round-5.md` (139 `wc -l` / `46029f48e27d…`) landed mid-round — the corpus's one-wave-late pattern, closing the round-6 draft's U-d | **PASS — count asserted 5 at commit** |
| N3 — §Pins | same-day re-derivation 16/16 MATCH; strictly-later-date **CARRIED** (earliest 2026-10-15) | **PARTIAL (time-gated)** |
| N4 — LOG + commit | `c0467a6`: LOG, SCORECARD, SKILL, the 2 notes, `round-5.md`, the record draft, `round-7.plan.md`, `r6-aud-b6.md` | **PASS** |
| N5 — standing Brave reject | `NativeMessagingHosts` only → agree; the count is contested on the record (r3 "third", r5 "fifth", the r6 plan's "5th"): SCR-B6 re-derived **6th** and printed the derivation | **PASS (count printed)** |
| AC — anti-claim | L0 unchanged (no grant can exist — default-deny by construction); every observed artifact is a loopback fixture; no browser run against any external site | **HOLDS** |
| FL — fleet | tabi still absent from the watchdog `LANES` roster (`scripts/shokunin-watchdog.sh:14`) — reported, not absorbed | **REPORTED** |

## What landed

- `corpus/knowledge/external-class-fixture-v2.md` (B6-1): the external-class
  edge fixture as a lane-authored loopback build (robots trap, gate, chain) —
  the redirect chain measured across all three network surfaces, the four
  instruments, the stop predicate proved from both sides. The fixture bytes
  are embedded in the note (§3), so the class survives `/tmp`.
- `corpus/knowledge/webbridge-revival-assessment.md` (B6-2): an **assessment,
  not an act** — daemon down (no listener on 10086, no process, stale pointer
  files), restart mechanics doc-specified but not executed, the handshake
  judged not doc-authorizable operator-free, and the enabling state measured
  (operator chromium with the extension installed while the daemon is down) —
  the named input round 7's Branch D gates on.
- `corpus/lessons/round-5.md` — the round-5 gate record, landing one wave
  late.
- SKILL.md `+31/−1` → `a8ba10b86138…` and `reports/r6-aud-b6.md` (179
  insertions): the 9-check verdict table, all PASS.

## Method lessons

- **A plan with two branches can land neither of its own L1 cells.** Round 6's
  own move (the matrix) did not land; the L2 fixture did. The record kept the
  distinction cell-by-cell instead of scoring the round by the fixture — and
  round 7 then made the unlanded matrix its carried-debt obligation. A fixture
  is not a mechanism; the plan's own measure list is what says which is owed.
- **An audit binds a revision, not a note.** The fixture note was in active
  revision through the audit (≥8 revisions in ~5 min; closing stamp
  `4aa604f1…`, 569 `wc -l`), and its runner pin moved `d6ea04c8…` →
  `ccc3d837…` mid-audit. AUD-B6 re-ran **both** pinned runner revisions so its
  verdict survives whichever pin the record adopts; anything after the closing
  stamp is U2. "The audit passed" is only meaningful with the revision named.
- **The archive obligation is decided by the pin window, not by intent.** The
  older runner revision (`d6ea04c8…`) survived only in `/tmp` after the audit
  (U5); the round's notes' pins stayed provisional until their groups reached
  `corpus/evidence/` (round 7's commit). Hash a file when it is frozen, or
  record the window: a moving target's hash is a timestamp.
- **An instrument never becomes the datum it stands in for.** A loopback `429`
  is an instrument, never a C6 datum — written into the note's §8 and audited
  (AUD-B6 1a/1g) — and approval-table U1 (the real rate/ToS surface) stays an
  absence. The loopback stand-in buys the mechanism, never the surface.
- **Environment facts are state, not causes.** The daemon's no-listener state
  was re-measured (pid 3934817 not running; pointer files stale); the revival
  was assessed and left operator-owned; the change point (when/why the
  listener died) stays unknown (U-h). Record the state you measured and name
  the disposition owed.
- **Self-match kills recur.** AUD-B6's `pkill -f` matched its own shell's
  command line (exit −1) — the second fleet instance in two rounds after
  AUD-TAB1 §4. Preference recorded: PID from `ps` with a character-classed
  pattern, and verify after.
- **Counts that drift are printed, not harmonized.** The Brave reject's
  consecutive count reads "third" (r3), "fifth" (r5), "5th" (the r6 plan);
  SCR-B6 re-derived 6th from the record and printed the derivation. Same
  family: the audit table's `round-3.md` line count (68 vs `wc -l` 69 on a
  byte-identical file) and the driver's "server-a request lines: 6" counting a
  404 message line (the note's `issuedRequestsAtTrip 5` is the correct
  counter) — kept as-is, append-only.
- **A verifier's scope is a boundary.** AUD-B6's U1–U5 (log/URL-level egress
  only; the note still moving; the two `h` cells not re-run;
  pixel-determinism not re-run; r1's runner bytes sourced second-hand) are
  recorded risks, not absorbed into "PASS".

## Gate

- Candidates: the fixture-v2 note; the revival assessment; `round-5.md`; the
  SKILL r6 revision; AUD-B6; the SCR-B6 verification table as the record's
  machinery.
- Admitted: the fixture note, the assessment, `round-5.md`, the SKILL
  revision, AUD-B6 — all committed in `c0467a6` (9 files, +1,957/−1).
- Rejected / deferred, with reasons: round-6's L1 matrix (no artifact —
  CARRIED to round 7's L0); the E3 third-party-JS-shaped async cells (carried
  in the fixture note's own handoff `:561-563`); the `README.md` coverage rows
  (not landed); SCORECARD r4/r5/r6 verdict tables and the axes refresh (not
  landed; row 6 appended after "Planned / retired"); the packet's cold-read
  verdict (DEBT since round 5); the daemon change point and its operator-side
  disposition (unmeasured); the bridge revival (operator-owned — assessed,
  not executed).
- Spot-check (non-author — AUD-B6, author of no round-6 note): re-ran one
  fixture interaction on both pinned runner revisions (r1 `d6ea04c8…`, r2
  `ccc3d837…`) → identical trips; 12/12 harness/fixture pins; `trip.json`
  byte-equal three ways after dropping timestamp fields; independent closure
  (ports closed, `curl` exit 7) and peer census `127.0.0.1` only; the 84-B
  429 body sha re-derived from the note's own authored bytes. SCR-B6 §8
  SC-1–SC-7: 16/16 pins same-day, 269/269 archive lines OK (3 groups), L0
  byte-identical across four reads, one `## Gate` per lesson file,
  daemon/substrate reads agreeing with lane B6-2, and three lanes (SCR-B6,
  B6-2, PREP-B7) reporting the same frozen values with no contradiction.
- Falsifier: a manifest line failing `sha256sum -c`; a lesson file without a
  `## Gate`; a clause-(c) stamp dated 2026-10-14 asserted as satisfying the
  clause; an L0 append without a byte-prefix proof; a loopback `429`/`403`
  asserted as a real rate/ToS datum; an audit verdict cited for a revision the
  audit never read.
- Re-run commands (from the lane root; `.ufo/` is the fleet root):
  ```sh
  ls -A corpus/lessons | wc -l                                     # 5 at round-6 close; 7 once round 8 lands round-6/7.md
  grep -c '^## Gate' corpus/lessons/round-{1,2,3,4,5}.md           # 1 each
  cd corpus/evidence/tabi-r2-2-state && sha256sum -c MANIFEST.txt  # 6/6 OK
  date -u +%F                                                      # 2026-10-14 → (c) still impossible
  grep -c '^tabi' .ufo/l0-questions.md                             # 1
  sha256sum .ufo/l0-questions.md                                   # 02c53ec6… (25 lines / 21,539 B)
  ```
- Carried debt out of this round: the L1 matrix (round 7's L0); the E3 async
  cells; the `README.md` coverage row and SCORECARD r4–r6 verdicts/axes; the
  packet's cold-read verdict; the two round-6 notes' pins (provisional until
  their `/tmp` groups were archived — landed in round 7's commit; see
  `round-7.md`); F1/F3 from the round-5 receipt.