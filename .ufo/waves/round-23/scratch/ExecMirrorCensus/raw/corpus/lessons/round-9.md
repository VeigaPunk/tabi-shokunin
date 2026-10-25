# Round 9 lessons — tabi-shokunin (2026-10-14)

Training round 9 (fleet "training r8"), wave-9 32-lane (2 lanes rerouted
alibaba→hyper — `SCORECARD.md:88`); seats named in the artifacts: PREP-B9
(design), B9-1 (the state-changing matrix note), B9-3 (lesson round-8), B9-4
(SKILL distillation), SCR-B9 (record draft / verification table), AUD-B9
(audit), VER-B9 (an independent re-derivation — scratch only; finding in the
Gate), the F1-closure append to `archive-receipt-r8.md` (the seat is not
self-named in the artifact), and the in-wave PREP-B10 (the round-10 design,
swept into the commit). Axis move: **depth** (`SCORECARD.md:88`). The claim
(plan, 494 logical / 493 `wc -l`, `36fd8f75ac0d…`): one axis-move,
operator-status-branched — Branch D/G only inside a recorded decision, else
**Branch L**: the carried loopback debt first, then the round's own class —
**the stateful client across runs** (cookie/token lifecycle and the cold-run
replay contract of a state-changing step); both branches carry the freshness
rider. Evidence: commit `ad735dd` ("probation round 9 (training r8): see LOG",
2026-10-14T17:47:30 -03; 9 files, +2,093/−1); `LOG.md:136`; `SCORECARD.md:88`;
the record draft `plans/round-9-record-draft.md` (543 logical / 542 `wc -l`,
`0b99e96e957b47df…`, 45,680 B); the note
`corpus/knowledge/state-changing-matrix-r9.md` (389 logical / 388 `wc -l`,
`ec540be07ed5a06c…`, 28,989 B, mtime 20:08:03Z); the audit
`reports/r9-aud-b9.md` (175 logical / 174 `wc -l`, `df34bf6c63e1da96…`,
15,013 B); the SKILL round-9 append (`:1059-1189`; post-append
`c07d29c3e8d178da…` / 1,189 `wc -l` / 97,231 B; pre-append `3b79ed2dea6c…` /
1,057); the F1 closure in `archive-receipt-r8.md` (`de45b805e5a4cc49…` / 218
`wc -l`); the lesson `corpus/lessons/round-8.md` (`d974eadc29f69ece…` / 257
logical / 256 `wc -l`, 19,829 B). Written 2026-10-14T20:55Z by lane **B10-3**
(round 10 — lessons land one wave late); every value below re-derived read-only
from the committed tree (HEAD `ad735dd`) and the surviving scratch, nothing
edited above.

## The gate — how the branch was read (measured)

- `.ufo/l0-questions.md` did not move: first gate read 19:58:09Z; the SCR-B9
  poll's **27/27** iterations (19:58:09–20:06:49Z) byte-identical; post-write
  re-checks to 20:07:33Z; re-read by this lesson at 20:52Z — **25 lines /
  21,539 B / `02c53ec6…` / mtime 2026-10-14 14:05:52.482908587 -03 / one
  `tabi` region** (`:25`, the round-5 filing; packet `94dc63f5fb9e…`). No diff
  vs the filing ⇒ **SILENT** (plan table `:110-117`) ⇒ **Branch L**; silence is
  not a denial.
- **Revival-decision disposition: `carried-unasked`** (the SILENT row's
  default); no BRIDGE-NAMING / BRIDGE-DECLINED line exists. **Line decision:
  none filed** — budget = 2 − 1 = **1, unspent**; the round-10 read still finds
  exactly one `tabi` line; ask-count **1**. Read-back precedes every branch act
  (draft §0; the record copies the gate seat's own read-back, not the draft's).
- **Clause (c): carried, not failed.** `date -u +%F` → 2026-10-14 at the gate
  and at this write (20:55Z); the strictly-later-date §Pins pass needs a witness
  ≥ 2026-10-15 (the UTC date flips at 21:00 -03 local). Same-day re-derivation:
  **25/26** existing assertions match + 1 superseded-with-declared-errata + 5/5
  history pins (draft §4, F-a).
- Span arithmetic, recorded not harmonized: the round-8 draft's "≈5h 04m"
  silence span re-derives as **2 h 04 m 34 s** at its read (filing 17:05:52Z;
  SCR-B9 §3 erratum candidate); the round-9 gate's own span is **2 h 52 m 17 s**
  (filing → first read).

## What was claimed, and how each clause verified

| Clause | How verified (measured) | Outcome at round 9 |
|---|---|---|
| L0.1 — round-6 L1 matrix (wire-class / cache-revalidation) executed as carried debt | note §1 row d: "not touched here — different matrix (no state-changing step); still open"; `carried-debt-closure-r8.md` §2 stands; the r9 SKILL append lists it still open; the r6-L1 naming drift ("wire-class/cache-revalidation" vs `packet-readiness-r7.md:64`'s "(the state-changing step)") recorded, not harmonized (draft §2) | **CARRIED AGAIN (4th naming)** |
| L1a/L1c — cookie/token lifecycle across a browser restart; cache × cookie freshness scope | note §1 row c + its own U8: **not this note's cells** | **NOT LANDED** |
| L1b — cold-run replay contract across two independent cold clients | note §5–§6: two independent curl jars, one server; A mints / B consumes / both later `409`; double-apply via a fresh token (`counter 2`, `distinct: true`); token binds to nothing (`apply sid: null`) | **LANDED (replay half)** |
| L1d — per-cell layer decision + replay contract | note §3 (the "decided by" column: server token table), §7 (10 idempotency classes), §8 (6 contract rules); rules M1–M8, each with a falsifier | **LANDED** |
| the owed r8 replay probes (§9.4 item 4 / the r8 note's §11 U2) | note §3: guarded skip → replay accepted, applies once (`counter 0→1`, `{minted 1, consumed 1, refused 0}`), 3/3 cold reps | **LANDED — r8 U2 closed** |
| L2 — instruments | fixture reused **byte-identical** (`ac0013e03288ed28…` / 12,311 B; one revision across all 20 runs); runner/driver extended (new revisions); E3 async cells still unlanded since r6 | **REUSE + CARRY** |
| L3 — guards | 20/20 closures (18 matrix + 2 rep3; kill by PID, ports closed, `curl` exit 7); byte-identity per artifact — `facts.json` 7/7, normalized `http.log` 9/9, `ledger-after.json` 9/9, PNG 10/10 rep1↔rep2 + rep3 equal; the one divergence class = the hidden `#token` input's DOM value, exactly 1 changed line (§8.4) | **LANDED** |
| L4 — boundary | loopback only; every fixture byte lane-authored (r8 reuse); shape-only; no mirrored real-site artifact | **HOLDS** |
| FR — freshness rider | `date -u +%F` → 2026-10-14 ⇒ carried (witness ≥ 2026-10-15 still owed); same-day §Pins re-derivation **25/26 match + 1 superseded (F-a) + 5/5 history pins** (draft §4) | **CARRIED (values matched)** |
| M1 — note + coverage row + SKILL distillation | note landed; SKILL append landed (`:1059-1189`, B9-4); `corpus/README.md` **NOT touched** (`e156bb99af2c…` / 59 lines; header still "Held at round 3 … 8 knowledge notes, 1944 lines … Lessons: 0" vs re-derived 20 / 6,438 / 8 at this write) | **PARTIAL — row DEBT** |
| M2 — lessons count | 7 → **8**: `round-8.md` (B9-3) committed in `ad735dd`; `round-9.md` is this file, landing one wave late | **PASS (this file)** |
| M3 — LOG + commit | `ad735dd` at 17:47:30 -03, 9 files, +2,093/−1; `LOG.md:136`; the commit sweeps `plans/round-10.plan.md` (PREP-B10) in | **PASS** |
| M4 — standing Brave reject | `NativeMessagingHosts` only → agree; count asserted **9th** (drift lineage printed, draft §2 d6); re-checked at this write — still `NativeMessagingHosts` only | **PASS (count printed)** |
| M5 — read-back precedes any act; ask-count + budget printed | the gate record §0 precedes all branch work; ask-count **1**; budget **1**, unspent; no line filed | **PASS** |
| F1 — the F1 erratum closure (r8 debt riding r9) | one append to `archive-receipt-r8.md` (+27 → `de45b805e5a4cc49…` / 218 `wc -l`), outside the archived group; group self-check **83/83 OK**; pin file **7 OK / 2 FAILED** (exactly `driver.sh` + `compare.mjs`); file list unchanged, three ways (manifest list / git diff empty since `bc4b7d5` / source-list equality; 459,293 B); AUD-B9 F1a–F1d all PASS | **CLOSED by erratum** |
| AC — anti-claim | no external name resolved or contacted; 127.0.0.1 lines only in the access logs; nothing filed; cookie/token values never printed | **HOLDS** |
| FL — fleet | tabi still outside the watchdog `LANES` roster (`scripts/shokunin-watchdog.sh:14`); fleet wave-9 closeout `b5a9723` ("…all lanes 8/10", 2026-10-14T17:47:30 -03) — reported, not absorbed | **REPORTED** |

## What landed

- `corpus/knowledge/state-changing-matrix-r9.md` (B9-1; final
  `ec540be07ed5a06c…`, 389 logical / 388 `wc -l`, 28,989 B): the replay half of
  the state-changing matrix — 9 cells × 2 cold reps + 2 rep3 = 20 runs on
  ports 19881/19882, 0 journey errors, 256 non-profile run-artifact files. §3
  the token-state table; §4 terminus + 307; §5 double-apply via fresh token;
  §6 cross-client; §7 the 10 idempotency classes (r8 rows cited, r9 rows
  measured); §8 six contract rules; §9 M1–M8; §10 SC-1–SC-4; §11 archive debt +
  U1–U10; §12 errata none. Lineage: closes the r8 note's owed replay probes and
  r7's L1d; the r6 matrix and E3 kept open (§1).
- The F1-closure append to `archive-receipt-r8.md` (stamps 20:44Z; copies ER-F1
  verbatim; cites the audit's F1b/F1d) — "the F1 erratum closed without touching
  archived bytes" (`LOG.md:136`).
- `SKILL.md` round-9 append (B9-4; +132/−1): the matrix usage distillation (the
  token-state decision table, the classes table, the six replay-contract usage
  rules, boundary — loopback-only, a loopback `409` is an instrument, never a
  real-server datum), and the archive-discipline update (census unchanged
  35/35; the r9 tranche named open, 2,665 files / 269 non-profile; two scratch
  spot-checks).
- `reports/r9-aud-b9.md` (AUD-B9): verdict table M1–M7 + F1a–F1d + A1 (PASS;
  M7 *noted* for scope); re-ran `post-form` + `token-once` on its own ports
  (19981/19982) — byte-identical ledgers rep-to-rep **and to the recorded runs**
  under a later runner revision (finding 5.1); SC-1–SC-4; findings 5.1–5.5;
  unknowns 6.1–6.5.
- `plans/round-9-record-draft.md` (SCR-B9; committed as-is): §0 the pivot /
  classification; §2 the 12-row precondition sweep; §3 the claims table + the
  span-erratum candidate; §4 §Pins (25/26 + 1 + 5/5); §5 baselines; §6
  in-flight; §7 U-a–U-l; §8 SC-1–SC-9; §9 E1/E2 post-write blocks.
- `corpus/lessons/round-8.md` (B9-3; committed in `ad735dd`).
- `LOG.md:136` + `SCORECARD.md:88` (move-log row 9: axis depth, "10 idempotency
  classes, replay contract, the token-state decision table", wave-9 32-lane /
  2 rerouted) + commit `ad735dd` (9 files, +2,093/−1).
- `VER-B9` — no landed artifact; its scratch carries a completed independent
  re-derivation (Gate, SC-finding D).

## Method lessons

- **A same-request replay is a discriminator, not a repeat.** [observation] r8
  measured the three abort arms as indistinguishable to the client at the
  moment of abandonment (its §7.1, R5/R6); r9's one repeated request splits
  them: `200` ⇒ the token had survived (guarded skip) and the replay applied;
  `409` ⇒ consumed (either apply timing) (§3, M5). [inference] For an abandoned
  non-idempotent step, the replay is the cheapest client-side classifier of the
  server's decision — and it costs one apply in the survived case.
- **"Abandoned" is not "consumed" — the guarded skip leaves a recovery path,
  exactly once.** [observation] `apply-skipped(client-gone)` leaves the token
  unconsumed; the replay consumes it and applies (`counter 0 → 1`) — 3/3 cold
  reps; the other two arms (`apply=pre`, `apply=post`, and a completed submit)
  refuse the replay identically (M2/M3). [inference] Whether an abandonment
  burned the one-shot token is a server-architecture fact; the token arithmetic
  bounds recovery to a single replay.
- **The token is an attempt guard, not a resource-idempotency key.**
  [observation] A fresh render mints a new token and the same body applies again
  (`counter 2`, `distinct: true`); the token binds to no session/client/run —
  B consumes A's token (`apply sid: null`), and every later replay from either
  client is refused (M4/M7, §5–§6). [inference] Per-token guarding cannot
  deduplicate distinct attempts; dedup, if any, is a resource-level fact absent
  from this fixture — state the arithmetic, not "the manager prevents
  double-apply".
- **Separate the state surfaces before porting a claim.** [observation]
  Cross-client: the token is consumable by the non-minting client, while
  sessions/visits stay per-client (ledger `[{s1,0},{s2,0}]`; A's visits 1 → 2,
  B's stay 1) (§6). [inference] The ledger is client-independent; the session
  identity is client-carried. Name which surface a claim is about, or the
  generalization is wrong on one of them.
- **Determinism is per artifact — the divergence class is the datum.**
  [observation] PNG byte-identical 10/10 rep1↔rep2 plus the four rep3 captures;
  the DOM shape diverges by exactly **one changed line** — the hidden `#token`
  input's per-run value — while the pixels are identical (§8.4, M8). [inference]
  A DOM capture of a token-bearing page is non-reproducible by construction; the
  pixel surface is the reproducible one. r8's "all PNGs identical" claim
  re-observed on the new pairs.
- **The fixture is the continuity; extend around it, and pin both sides.**
  [observation] The r8 fixture was reused byte-identical across the r9 runs and
  the audit (`ac0013e03288ed28…`, one revision in all 20 runs; the §2-fence
  extraction reproduces it modulo the fence's final newline — AUD-B9 M1/5.3);
  the runner gained a revision (`cecf3373bceaabdc…` vs the r8 pin). [inference]
  Cross-round comparability lives in the fixture; the runner revision must be
  named wherever runs are compared.
- **A re-run under a later revision that reproduces exactly is a stronger
  statement — if the split is disclosed.** [observation] AUD-B9's
  `post-form`/`token-once` re-runs: ledgers byte-identical rep-to-rep and to the
  recorded runs, PNG/shape equal; the recorded runs used `e22a967ed69e9f6e…`,
  the re-run the final revision (5.1). [inference] State the bound: 2 of the r8
  matrix's 14 cells, and the edited hop/stop cells un-re-run — the same
  lesson r8's E1 taught, now with the runner revision as the variable.
- **A matrix debt splits cleanly: land the measured half, name the rest by
  item.** [observation] r9 lands the replay half; the r6
  wire-class/cache-revalidation matrix is "not touched here — different matrix;
  still open" (§1 row d); the note's own U8 names the cookie-lifecycle and
  cache×cookie cells, U2 the two-browser (non-curl) pair, U4/U5/U6 the expiry /
  body-modification / simultaneous-race probes. [inference] "Still open" is only
  useful with its next probe named — r9 did that for every item in its §1
  table, which is what keeps the debt ladder mechanical.
- **An erratum closes a debt by pointing, not by editing.** [observation] F1:
  one append outside the archived group; file list unchanged, three ways
  (manifest list / git history since `bc4b7d5` empty / source-list equality;
  83 files, 459,293 B); the "4-line" shorthand re-measured 3 changed lines and
  kept, not harmonized (AUD-B9 F1c, 5.4). [inference] Frozen groups + external
  errata scale; the price is that every reader must follow the pointer.
- **A scribe table is a read, not a verdict — and the note moved under it.**
  [observation] SCR-B9's statuses (IN FLIGHT / NOT LANDED) were true for its
  window (19:57–20:02Z); the matrix note landed at the window's edge and kept
  moving (`e8212476a46f…` → `52c6b2b5ec98…` → final `ec540be07ed5a06c…`, mtime
  17:08:03 -03); the draft's own "re-derive every value at record time" rule is
  what kept the record honest. [inference] The revision that binds is the
  committed one; a status without its read time is a trap.
- **A verifier's pass is not landed until it is a file.** [observation] VER-B9's
  scratch carries a completed independent re-derivation of `replay-guard-skip`
  (rep1 + rep2; own port 19981; curl instrument, not the browser runner; the
  ledger arithmetic equals the note's cell — `{minted 1, consumed 1, refused 0}`,
  `apply-skipped client-gone` → `apply pre 50`; the only event delta is the
  browser's absent `/favicon.ico` line; closure `pass`, `== rep1 end
  2026-10-14T20:02:13Z`) — yet no artifact landed, the note's §10 SC-2 still
  records the non-author re-run as **owed**, and the record draft lists the seat
  IN FLIGHT. [inference] Append the pass where it can be read (r8's E1 pattern)
  or it will be re-derived as absent — this lesson is that reading. [unknown:
  whether the r10 wave lands it or re-runs the cells.]
- **Counts move under the lesson itself.** [observation] knowledge 19 → 20 /
  6,023 → 6,438 lines; lessons 7 → 8 (this file → 9); evidence 35 groups at
  commit — at this write a `w9-tabi-b91` group is **landing** (untracked; 36
  dirs on disk; see Gate SC-C). [inference] Same as r7/r8's count lesson: bind
  every count to its read time, or the next reader measures a contradiction.

## Gate

- Candidates: the state-changing matrix note (B9-1); the F1 closure append; the
  SKILL r9 append (B9-4); AUD-B9; the record draft (SCR-B9); `round-8.md`
  (B9-3); the commit `ad735dd` — with `plans/round-10.plan.md` swept in.
- Admitted: all of the above, committed in `ad735dd` (9 files, +2,093/−1). The
  round's three trend verdicts are **owed by the record's tables** —
  `SCORECARD.md` still carries r1–r3 primary-verdict tables only
  (`:18`/`:26`/`:38`), axes still round-3-pinned (`:53-62`); the discernment
  datum this lesson owes is the spot-check below.
- Rejected / deferred, with reasons: the round-6 L1 matrix (recorded open, 4th
  naming); E3 async cells; the r9 cells' **non-author re-run** (owed; §10 SC-2 —
  VER-B9's scratch-only pass noted, not counted as landed); the README coverage
  rows rounds 4–9 (untouched since r5); the SCORECARD r4–r9 verdict tables +
  axes refresh + move-log placement (rows 4–9 still under "## Planned /
  retired" `:73`); the packet cold-read verdict (`[unknown]`,
  `operator-approval-request.md:100`) and the lapsed pin block; the F-a/F-b pin
  supersessions (SKILL `:971` and the r8 audit bind the pre-E1 revision —
  recorded; re-bind left to the record); the note's U1–U10 (named unknowns, not
  converted to claims); the archive tranches (r8 `/tmp/w8-tabi-b81/` +
  `/tmp/w8-ver-b81/` present; r9 `/tmp/w9-tabi-b91/` — landing mid-write, SC-C).
- Spot-check (non-author): **AUD-B9** — the verdict table M1–M7 + F1a–F1d + A1
  (PASS/noted only), the 2-cell cross-revision re-run, SC-1–SC-4, findings
  5.1–5.5, unknowns 6.1–6.5; **agree** — with its scope limit kept (it re-ran
  r8's cells, not r9's; 8 of 14 still un-re-run by any non-author).
- Spot-check (this lesson, non-author of every round-9 artifact):
  - **SC-A — F1 re-measured from disk:** `sha256sum -c MANIFEST.txt` → 83/83 OK,
    rc 0; `sha256sum -c methodology-sha.txt` → 7 OK / 2 FAILED, rc 1 (exactly
    `driver.sh` + `compare.mjs`) — matches the erratum verbatim and AUD-B9 F1b.
  - **SC-B — raw-scratch re-read of three cells' final ledgers:**
    `xclient-consume` rep1 `{counter 1, tokens {1,1,2}, sessions [{s1,0},{s2,0}],
    apply sid null, bodyBytes 35}`; `replay-consumed-post` rep1 `{counter 1,
    tokens {1,1,1}, apply mode "post", bodyBytes 53, submit-refused}`;
    `replay-guard-skip` rep1 `{apply-skipped client-gone → apply pre 50,
    counter 1, tokens {1,1,0}}` — every number equals the note §3/§6.
  - **SC-C — the archive landing, observed not authored:**
    `corpus/evidence/w9-tabi-b91/` appeared mid-write (untracked; 270 files /
    1,096,027 B / `MANIFEST.txt` 274 lines; `__pycache__` present). The r9
    note's every hash stays provisional until this group's receipt lands;
    re-derive at record time.
  - **SC-D — gate controls:** L0 byte-identical (25 / 21,539 B / `02c53ec6…` /
    mtime); `ls -A corpus/lessons` → 8 before this file; Brave →
    `NativeMessagingHosts` only.
- Falsifier: a replay whose outcome differs between two clients for the same
  token state; a guard-arm run whose token is already consumed at replay (or
  whose replay applies twice); a fresh-token submit refused (or accepted
  without a counter move); a PNG that differs across cold reps; a claim of `409`
  as a real-server datum (a loopback `409` is an instrument — U9); a silence
  span carried without the re-derivation; a verifier's pass cited as landed
  while it exists only in scratch; a lesson file without a `## Gate`.
- Re-run commands (from the lane root; the fleet root is the parent — `.ufo/`
  lives there):
  ```sh
  ls -A corpus/lessons | wc -l                                  # 9 with this file (8 before it)
  grep -c '^## Gate' corpus/lessons/round-{1..9}.md             # 1 each once this file exists
  sha256sum corpus/knowledge/state-changing-matrix-r9.md        # ec540be07ed5a06c…
  sha256sum reports/r9-aud-b9.md                                # df34bf6c63e1da96…
  git show -s --format='%cI' ad735dd                            # 2026-10-14T17:47:30-03:00
  cd corpus/evidence/tabi-b1-r3b-journey && sha256sum -c MANIFEST.txt   # 83/83 OK, rc 0
  sha256sum -c methodology-sha.txt                              # 7 OK / 2 FAILED — ER-F1's pair, expected
  cat /tmp/w9-tabi-b91/runs/replay-guard-skip/rep1/ledger-after.json  # U2 closure's cell — while the scratch survives
  sha256sum ../.ufo/l0-questions.md                             # 02c53ec6… (25 lines / 21,539 B)
  grep -c '^tabi' ../.ufo/l0-questions.md                       # 1
  date -u +%F                                                   # 2026-10-14 → (c) carried
  ```
- Carried debt out of this round: the round-6 L1 matrix (still open; its
  fixture bytes archived in `w6-tabi-b61`); E3 async cells; the r9 note's
  U1–U10 (incl. U8's cookie-lifecycle + cache×cookie, U2's two-browser pair);
  a non-author re-run of the r9 cells; the README header + coverage rows
  (rounds 4–9); the SCORECARD r4–r9 verdict tables + axes refresh + move-log
  placement; the packet cold-read verdict + lapsed pin block; the F-a/F-b pin
  supersessions; the archive — r8 tranche present in `/tmp` (`/tmp/w8-tabi-b81`,
  `/tmp/w8-ver-b81`), r9 tranche landed untracked at this write
  (`w9-tabi-b91`, receipt owed); clause (c) (time-gated, witness ≥ 2026-10-15);
  `round-9.md` is this file, so the one-wave-late pattern's next file is
  `round-10.md`.