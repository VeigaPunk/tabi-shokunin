# Round 8 lessons — tabi-shokunin (2026-10-14)

Training round 8 (fleet "training r7"), 32-lane wave (2 lanes rerouted
alibaba→hyper) — seats named in the artifacts: PREP-B8 (design), B8-1 (the
stateful fixture), B8-2 (carried-debt closure), B8-4 (SKILL distillation),
ARCH-TRANCHE-R8 (the archive receipt), AUD-B8 (audit), SCR-B8 (verification
table + scribe prep), VER-B8-1 (independent re-run — named in the LOG, and this
time with an artifact), plus in-wave seats for `round-6.md` / `round-7.md`.
Axis move: **depth** (`SCORECARD.md:87`). The claim: one axis-move,
operator-status-branched — Branch G (the answer executes) or Branch L (the
carried loopback debt first, then the round's own class: **the non-idempotent
step under failure** — interruption, abandonment, duplicate submission), with
the freshness rider (`plans/round-8.plan.md`; 389 logical / 388 `wc -l`, sha256
`3ad58f64c826…`). Evidence: commit `6a8861c` ("probation round 8 (training r7):
see LOG", 2026-10-14 16:55:09 -03; 10 files, +2,501/−1); `LOG.md:135`;
`SCORECARD.md:87`; the verification table `plans/round-8-record-draft.md` (380
logical / 379 `wc -l`, `970c727c5787…`); `reports/r8-aud-b8.md` (182 logical /
181 `wc -l`, `a191832be152…`); the round's note
`corpus/knowledge/stateful-fixture-evidence.md` (856 logical / 855 `wc -l`,
`f04e2e473cf9…`, post-E1). Written 2026-10-14T20:01Z by lane B9-3 (round 9 —
lessons land one wave late); every value below re-derived read-only from the
committed tree, nothing edited above.

## The gate — how the branch was read (measured)

Three whole-file reads of `.ufo/l0-questions.md` spanning 19:10:26–19:12:33Z
were byte-identical — 25 lines / 21,539 B / `02c53ec6…` / mtime unchanged
(2026-10-14 14:05:52.482908587 -03) / one `tabi` region (`:25`, the round-5
filing, packet sha `94dc63f5fb9e…`), and the record draft's post-write re-checks
held it byte-identical through 19:15:38Z. **No diff / no answer → Branch L**
(plan table `:93-99`); silence is not a denial; ask-count 1, no re-ask; the
read-back precedes every branch act. Clause (c): `date -u +%F` → 2026-10-14, so
the strictly-later-date §Pins pass was impossible by construction (earliest
2026-10-15) — carried, not failed; same-day the refresh matched **22/22**
existing assertions + 5/5 history pins (draft §4).

## What was claimed, and how each clause verified

| Clause | How verified (measured) | Outcome at round 8 |
|---|---|---|
| L0 — carried-debt check first | `carried-debt-closure-r8.md` (`48dc8db69c57…`): **F1 CLOSED by erratum** — one line (ER-F1), group file list unchanged, `MANIFEST.txt` 83/83 OK while the in-group pin file fails exactly on `driver.sh`/`compare.mjs` (7 OK / 2 FAILED; delta 3 changed lines / 1 changed line); **round-6 L1 matrix STILL OPEN** — 3-surface absence check (knowledge grep, `b377007`'s 425-path list, `LOG.md:134`) | **PARTIAL** — one closed, one re-carried (third naming) |
| L1a–L1e — the non-idempotent step under failure (the round's move) | `stateful-fixture-evidence.md` §3–§10: 14 cells × 2 cold reps, 0 journey errors; interrupt mid-POST (3 arms), hop aborts (2), nav-level negative (2 cells × 2 reps, plus 4 kept superseded-design runs), `dup-submit`, `token-once`, `post-form`/`post-303`/`post-307`, `multi-visit`, curl control; per-cell layer-decision record §8; replay contract §9; rules R1–R10, each with a falsifier | **LANDED** (for the loopback class) |
| L2 — instruments | the four v2 rate/ToS-shaped instruments reused (archived in `w6-tabi-b61`); E3 third-party-JS-shaped async (late settle, beacon-shaped POST, canceled 404) still unlanded since r6 | **PARTIAL** (reuse + carry) |
| L3 — guards | closure per run: 14/14 cells × 2/2 reps carry the `closure.txt` pass lines; VER-B8-1 7/7; byte-identity claimed in **both** directions (§9: holds on derived facts; does not hold on raw timings / CDP inter-kind arrival order) | **LANDED** |
| L4 — boundary | no mirrored real-site artifact; every fixture byte lane-authored; real-site classes stay default-deny | **HOLDS** |
| FR — freshness rider | date 2026-10-14 ⇒ carried; same-day §Pins 22/22 + 5/5; the durable witness (in-repo dated block, commit ≥ 2026-10-15) still owed | **CARRIED (values matched)** |
| M1 — note + coverage row + SKILL distillation | the note landed; the SKILL round-8 append landed (`SKILL.md:948-1058`, logical; `wc -l` → 1057; census superseded to 35 groups; carried-debt pointer table); the `corpus/README.md` coverage row did **not** land (still the round-3 header, `e156bb99af2c` / 59 lines) | **PARTIAL — row DEBT** |
| M2 — lessons count | 5 → **7**: `round-6.md` (`86da9d2b…`) and `round-7.md` (`88c8244c…`) landed in-wave; `round-8.md` is this file, landing one wave late | **PASS** |
| M3 — LOG + commit | `6a8861c`: 10 files, +2,501/−1 | **PASS** |
| M4 — standing Brave reject | `NativeMessagingHosts` only → agree; count asserted **8th**, with the drift lineage printed (r3 "third", r5 "fifth", r6 6th, r7 7th) | **PASS (count printed)** |
| M5 — read-back precedes any act; ask-count printed | the gate record precedes all branch work; ask-count **1**; no line filed | **PASS** |
| AC — anti-claim | L0 unchanged (no grant can exist — default-deny by construction); every round-8 artifact is loopback; no external name resolved or contacted (server access logs hold 127.0.0.1 lines only) | **HOLDS** |
| FL — fleet | tabi still absent from the watchdog `LANES` roster; reported, not absorbed | **REPORTED** |

Note on the table's source: the record draft's own §3 statuses (IN FLIGHT / NOT
LANDED) were as-measured mid-wave at 19:09–19:14Z; the landings above supersede
them, which is what the draft's own re-derivation rule requires.

## What landed

- `corpus/knowledge/stateful-fixture-evidence.md` (B8-1; 856 logical, 50,869 B,
  `f04e2e473cf9…`): the stateful fixture (server-side sessions, one-time
  tokens, an apply counter, a deterministic `/__ledger`) with its fixture v3
  embedded verbatim (§2), 14-cell matrix, the per-cell layer-decision record,
  the replay contract, rules R1–R10, unknowns U1–U10, and the archive debt
  (§11). §12 E1 is VER-B8-1's independent re-run append.
- `corpus/knowledge/carried-debt-closure-r8.md` (B8-2; 150 logical / 149
  `wc -l`, 14,746 B,
  `48dc8db69c57…`): the F1 erratum (ER-F1) landed as a note because adding a
  file inside the archived group would change a published file list; the
  round-6 L1 matrix recorded **still open**.
- The two independent passes (the round's second half):
  - **VER-B8-1** — `stateful-fixture-evidence.md` §12 E1 (19:53Z): dispatched to
    build the note, found it complete and pinned, and re-ran its cells instead —
    7 runs on ports 19781/19782, fixture copied and re-hashed before use
    (`ac0013e03288ed28…` / 12,311 B; all harness pins equal the §2 table),
    results stated against the claims they test, scope limit stated (11 of 14
    cells not re-run), one harness nit recorded, consequences named (the note's
    pins in `SKILL.md:971` and the audit's binding table now bind a superseded
    revision — re-derive).
  - **AUD-B8** — `reports/r8-aud-b8.md` (`a191832be152…`, 182 lines): a 20-row
    verdict table (fixture F1–F7, receipt D1–D8, closure E1–E4, plus the no-edit
    row); SC-1 an **independent visit pair** on its own ports (19931/19932,
    curl; `ledger-after.json` byte-identical across the pair,
    `45c1c4d13f124319…`); SC-2 all 1,057 C5 `: OK` lines resolved; findings
    5.1–5.6 with the audit's own count corrections; unknowns 6.1–6.6.
- `SKILL.md` round-8 append (B8-4; +113/−1 — the −1 is the file's missing
  final newline at the round-7 block; the append itself is additions-only) →
  `3b79ed2dea6c…` (1058 logical / 1057 `wc -l`): the stateful-evidence distillation, the
  harness-archive census supersede (35 groups / 1,451 files / 9,222,920 B), and
  the carried-debt pointer table.
- `corpus/lessons/round-6.md` (`86da9d2b…`) and `corpus/lessons/round-7.md`
  (`88c8244c…`) — the one-wave-late pattern closing the two owed files.
- `LOG.md:135` + `SCORECARD.md:87` (move-log row 8) + the committed record draft
  (`plans/round-8-record-draft.md`); the commit also sweeps in
  `plans/round-9.plan.md` (494 logical / 493 `wc -l` — the next round's design, the fleet's
  one-ahead pattern). The archive receipt r8
  (`archive-receipt-r8.md`, `0587605db913…`) and its 7 groups had already
  landed inside round 7's commit `b377007` (the r7 lesson's attribution note
  applies in reverse).

## Method lessons

- **A state question is answerable only through a surface built for it.**
  [observation] The fixture's quiet `/__ledger` (never logged, never counted in
  the request census; no timestamps, no random) is what made state readable
  before/after, rep-to-rep comparable and DOM-independent; the empty ledger of a
  fresh root is the proof the after-state was *this run's*, not inherited
  (§4, §9.1). The DOM is a rendering of state, not the state (R1). [inference]
  Generalize: pick the surface the measurement cannot perturb, or the
  before-state is unmeasurable.
- **One switch can turn a hard question into three measurable arms.**
  [observation] `?apply=pre` / `?apply=post` / `?apply=post&guard=1` produced
  `counter 1` / `counter 1` / `counter 0` (token consumed / consumed / unused)
  while all three arms left the client with the same surface — `AbortError`, no
  response event, no state trace (§7.1, R5/R6). [inference, strong] Whether an
  abandoned non-idempotent step applied is a **server-architecture fact, not a
  protocol fact**; no client-side artifact can recover it. This extends rung
  D3/D4 one step: the server line can exist for work the client left before it
  was computed.
- **A re-run must be built to be independent.** [observation] Both independent
  passes copied the fixture and re-hashed it *before* use, moved ports off the
  recorded ones (19781/19782, 19931/19932 vs 19681/19682) so runs cannot collide
  with the recorded evidence, compared derived facts (ledger byte-identity), and
  wrote down what they did **not** re-run — 11 of 14 cells (E1), the 14-cell
  verdicts (AUD-B8 §6.1). [inference] The pattern's value is exactly the bound
  it states; an unstated bound is a re-read wearing a re-run's clothes.
- **The re-run can be an append, not a rewrite.** [observation] VER-B8-1 landed
  its pass as §12 E1 with the pre-append fingerprint (773 lines / 45,705 B /
  `e89bc89bff38…`), the method, the runs, and the consequences — the note's
  cited pins now bind a superseded revision *by construction*, which is the
  append-only rule working, not a defect. Contrast `VER-B7` (round 7): named in
  the LOG, no artifact — a finding. [inference] A verifier's deliverable is the
  pass *and a durable fingerprint of what it verified*, wherever it can land.
- **Independence is strongest when it reaches the state surface.** [observation]
  AUD-B8's curl visit pair and the note's browser runs agree event-for-event on
  the ledger, differing only by the browser's `/favicon.ico` `write-ok` — "the
  state surface is client-independent" (5.5). [inference] A cross-client
  byte-equal state reading is a stronger reproduction than a same-client
  re-run: it also proves the client footprint is not the state.
- **Byte-identity is claimed in both directions, and non-determinism is
  classified.** [observation] Byte-identity holds on derived facts — ledger
  13/14 cells, 20/20 PNGs, normalized server logs 14/14, event-chain digests
  13/13 — and does not hold on raw timings or CDP's inter-kind event arrival
  order (`wire`/`resp`/`req` flips inside one requestId; the reason `verify.py`
  compares kind-separated sequences) (§9.2-3). The one deliberate
  non-determinism class is `dup-submit`'s ledger event order (rep1
  `apply→refused→write→write`; rep2 `apply→write→refused→write`) while the
  observable outcome is stable (§6, R9, U10). Averages would have hidden
  exactly the datum the matrix kept.
- **A negative result is kept at full strength.** [observation] 10/10
  `AbortController` runs left abort markers; 0/8 CDP navigation-command runs
  (`Page.stopLoading`, second `Page.navigate`) cancelled the held navigation at
  150 ms — the chain completed server-side, `/away` committed at ~897 ms (§7.3,
  R10). The note keeps the failed interruption as the datum, names U4
  (mechanism unexamined) and fences the rule ("do not over-generalize R10
  beyond this fixture/timing"); the superseded first design's 4 run dirs stay in
  the tree because the 0/8 count needs them (§3).
- **A file rewritten in place leaves only its pins.** [observation] `server.py`
  is one revision across all 30 surviving runs, but `journey.mjs` has two
  (`e22a967ed69e9f6e…` first ten browser cells; `282511320499f1f5…` the
  hop/stop/supersede cells) and the earlier revision's bytes are gone —
  overwritten in place before copying; only `driver.log` pins attest it (§3
  revision map; AUD-B8 5.4). Per-cell rep-vs-rep comparisons are unaffected
  (each cell's reps share one pin); a cross-round digest comparison would not
  be revision-homogeneous.
- **The shape-only rule survives a client that cannot see the value.**
  [observation] Four cookie surfaces were read on one interaction: server header
  (16 lower-hex, shape only), CDP store (`valueLen 16`, `size 24 =
  len(name)+len(value)`, session, HttpOnly), page JS (`len 0` — the HttpOnly
  delta), curl jar (`#HttpOnly_…`, `expires 0`). No value printed anywhere; the
  cross-surface identity correlation comes from the server's ledger ordinals
  (§5, R2). [inference] The honest limit is the pattern's own: on a real site
  no cooperating ledger exists, and a value-derived key (hashing the cookie)
  would break the shape-only rule.
- **The audit binds a revision — and the revisions moved.** [observation] The
  stateful note moved mid-audit (`5066d17d1f89f597` 768 lines → `e89bc89bff38…`
  773 lines; "30 run dirs" corrected to 32; U10 added), and the closure note
  moved a revision too (`e3b24db30479d0d2` → `8c6b0a38d7005e6d` → current);
  AUD-B8's binding table names the revision each verdict binds, and 5.6/6.5 keep
  later revisions out of scope. Its count findings are the same discipline:
  C3's "12/12 differ by exactly +2" measures 11× +2 and 1× +3 (`archive-receipt-r5.md`
  177 → 180; D5), the D-scan's 318-token set is exact only without the two notes
  that landed after the scan (today 340; 5.2), and the "4-line" F1 shorthand does
  not re-derive (3 changed lines; closure note §1.4, AUD-B8 E4). Nothing
  harmonized; read times kept.
- **A count is bound to its read time — including the lesson's own.** [observation]
  The closure note's absence check read "exactly 3 notes" carrying the L1-matrix
  phrase at 19:11–19:12Z; the same pattern at this write returns 4, the fourth
  being the closure note itself. [inference] The grep is the same; the set
  changed. This is round 7's lesson recurring in miniature, which is the point:
  lessons recur until the record's habits change.

## Gate

- Candidates: the stateful-fixture note (B8-1); the carried-debt closure note
  (B8-2); the archive receipt r8 + its 7 groups (ARCH-TRANCHE-R8, committed
  `b377007`); the SKILL r8 append (B8-4); AUD-B8; VER-B8-1's §12 E1; the SCR-B8
  verification table as the record's machinery; `round-6.md` / `round-7.md`.
- Admitted: the stateful fixture note, the closure note, the receipt's counts,
  the SKILL append, AUD-B8, the two lessons — all committed in `6a8861c`
  (10 files, +2,501/−1), with the record draft and `plans/round-9.plan.md`
  swept in. The round's three trend verdicts (expansion / quality /
  discernment) are **owed by the record's tables** — `SCORECARD.md` still
  carries r1–r3 primary-verdict tables only; the discernment datum this lesson
  owes is the spot-check below (an admit and a non-admit sampled, both
  agreed).
- Rejected / deferred, with reasons: the round-6 L1 matrix (status recorded,
  execution owed — carried a third time); the E3 async cells (carried since r6);
  `corpus/README.md` coverage row + header (still round-3); SCORECARD r4–r8
  primary-verdict tables + axes refresh (r1–r3 tables only; the r8 move-log row
  landed); the packet cold-read verdict (`[unknown]`,
  `operator-approval-request.md:100`) and the packet's lapsed note-pin block
  (9/9 stale; re-bound values in `packet-readiness-r7.md` §2); the note's U1–U10
  (named unknowns, not converted to claims); the stateful note's archive debt
  (32 run dirs + fixture in `/tmp/w8-tabi-b81/` — **present at this write**, all
  six harness pins re-derived MATCH, but unarchived); the earlier `journey.mjs`
  revision's bytes (gone — unarchivable by any seat).
- Spot-check (non-author): **AUD-B8** — the 20-row verdict table (every row
  PASS; F7 *noted* for scope, D5 PASS-with-count-erratum), with
  the visit pair re-run independently (SC-1), the largest archive check
  re-derived whole (SC-2), and the F1 staleness checked from both directions
  (SC-3); findings 5.1–5.6 and unknowns 6.1–6.6 recorded; **agree**, no admit
  reversed. **VER-B8-1** (non-author of the note) — 7 runs over 3 of 14 cells +
  control + before/after + cleanup; no re-derived claim false; scope limit
  stated. Verdict: **agree** — the outside check confirmed the admitted material
  and left the reserves named (the 11 cells, the browser-only surfaces, later
  revisions).
- Falsifier: a manifest line failing `sha256sum -c`; a re-run that does not
  re-hash the fixture before running, or whose pin differs from the note's; a
  note revision cited without naming the revision (E1 moved the hash; the cited
  `e89bc89bff38…` is a revision, not "the note"); a loopback 409/429/403 read as
  a real-server datum (fixture-refusal codes are instruments; approval-table U1
  stays an absence); a claim by exhaustion from N=2 reps; an abandoned-run claim
  made from a client surface where only the server ledger decides; a lesson file
  without a `## Gate`.
- Re-run commands (from the lane root; `.ufo/` is the fleet root):
  ```sh
  ls -A corpus/lessons | wc -l                                    # 8 with this file (7 before it)
  grep -c '^## Gate' corpus/lessons/round-{1,2,3,4,5,6,7,8}.md    # 1 each
  cd corpus/evidence/tabi-b1-r3b-journey && sha256sum -c MANIFEST.txt   # 83/83 OK, rc 0
  sha256sum -c methodology-sha.txt                                # 7 OK / 2 FAILED — ER-F1's erratum, expected
  grep -ril 'L1 mechanism matrix\|L1 matrix' corpus/knowledge/    # 4 today (3 at the closure note's own read)
  date -u +%F                                                     # 2026-10-14 → (c) carried
  grep -c '^tabi' .ufo/l0-questions.md                            # 1
  sha256sum .ufo/l0-questions.md                                  # 02c53ec6… (25 lines / 21,539 B)
  sha256sum /tmp/w8-tabi-b81/server.py                            # ac0013e03288ed28… — while the scratch survives
  ```
- Carried debt out of this round: the round-6 L1 matrix (third naming, still
  open; its fixture bytes are archived in `w6-tabi-b61`); the E3 async cells;
  the README header + coverage rows (rounds 4–8); the SCORECARD r4–r8 verdict
  tables and axes refresh (axes still round-3-stamped; move-log rows land after
  "Planned / retired"); the packet's cold-read verdict and lapsed pin block; the
  stateful note's archive (fixture + harness + 32 run dirs — provisional hashes
  until `cdp-evidence-patterns.md:92` is satisfied); the note's SKILL/audit pin
  values, superseded by E1; `round-8.md` itself is this file, so the
  one-wave-late pattern's next file is `round-9.md`.