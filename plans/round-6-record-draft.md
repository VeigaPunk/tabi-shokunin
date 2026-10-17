# tabi-shokunin — round 6 record — DRAFT (scribe prep)

**Status: DRAFT, not the record.** This file is the round-6 **verification
table + pivot note** — written 2026-10-14T17:44Z (14:44 -03) by lane **SCR-B6**
(round-6 scribe prep; assignment: this file only). The round-6 record itself
(LOG entry, SCORECARD verdicts + move log + axes, README coverage rows, commit)
is assembled later by the round-6 scribe from the seats' landed files plus this
table. Measurements here are read-only (lane tree, `.ufo/l0-questions.md`, the
webbridge substrate, `/tmp` scratch of sibling seats); nothing outside this
file was written by this lane. Scratch: `/tmp/w6-scrb6-*` (volatile).
Discipline (`corpus/QUALITY.md:1-7`): observation / inference / unknown
separated; secrets shape-only (never content-read); substrates read-only; no
external site; as-of stamps UTC unless marked `-03`. Commands ran from the lane
root unless a `cd` is shown. Values measured 17:40:11–17:42:53Z unless stamped
otherwise; every value that moves must be re-derived at record time.

## 0. The pivot note — the l0-answer-check outcome (decides the branch)

**Outcome: no answer. The round runs Branch L (loopback depth).** The check was
made mechanically at 17:40:11Z, re-checked at 17:41:20Z and 17:41:31Z, and
again at write time; `.ufo/l0-questions.md` did not move.

| Quantity | Round-5 filing state (record) | Measured now | Verdict |
|---|---|---|---|
| lines | 25 (`wc -l`) | **25** | unchanged |
| bytes | 21,539 | **21,539** | unchanged |
| sha256 | `02c53ec60acfda4889e0cd57eb08e8f1bd5583708fcb8399bfc5a5593713613f` | **same** | unchanged |
| mtime | 2026-10-14 14:05:52 -03 | **2026-10-14 14:05:52.482908587 -03** | unchanged |
| tabi regions | 1 (line `:25`, the round-5 filing) | **1** (`:25`, same line) | unchanged |
| pre-append state (round-5 record) | 24 lines / 20,653 B / `0a86973bd17c37f7` | — | filing proof stands |

- The single `tabi`-matching region is `:25` — the round-5 filing line
  (`tabi | round-5 | Operator approval requested — filed:
  tabi-shokunin/corpus/handoffs/operator-approval-request.md sha256
  94dc63f5fb9e3d9818008663fe46a4d08776ff7d79a7a1a821903b2d0f1ac0aa …`, full
  text in `.ufo/l0-questions.md:25`). No line below it, no edit inside it.
- The answer channel is the file itself: "the L0 answers by editing the file in
  place" (`MISSION.md:84-88`; read 17:41Z). Operator presence is never itself a
  grant channel — only the read-back is (round-6 plan Step 0.1).
- Classification per the round-6 plan, Step 0.2: **"No diff / no answer" →
  Branch L**. Silence is not a denial; the ask is unchanged; **ask-count stays
  1** and the packet is **not re-asked** (plan Branch L header).
- Consequence (plan Branch L): no external site; the packet stays filed on
  disk; loopback only; cleanup verified per run; the L1 mechanism rule + L2
  fixture edge-classes are the round's work.
- Mid-round switching rule (plan Step 0.3): a mid-round answer may be acted on
  only inside its stated scope, after its own read-back is recorded, and the
  record must show the read-back precedes the act. Nothing observed triggers
  it: the file was byte-identical across four reads spanning 17:40:11–17:44Z.
- Also unchanged and re-confirmed: the round-5 clause-(c) carry — `date -u +%F`
  → **2026-10-14**; a strictly-later-date §Pins re-derivation is impossible by
  construction today (earliest 2026-10-15). Carried, not failed.

## 1. Plan reference (measured)

| Item | Value |
|---|---|
| `plans/round-6.plan.md` sha256 | `b86c95c7532338560eac6023e5657e13ad7447606772138eba0d7c46265cda21` |
| lines | `wc -l` → **208**; logical lines `grep -c ''` → **209** (last line unterminated, last byte `2e`) |
| git state | tracked and committed in `bc4b7d5`; `git status --short` → empty (worktree == HEAD) |
| design/authority | this plan **is** the design text (lane PREP-B6, frozen 2026-10-14T17:04:57Z). Unlike round 5 there is no digest/design split: one file, one sha |

The plan's branch gate (verbatim, its §Step 0.2): *"No diff / no answer" →
Branch L*; *"Answer naming ≥1 of R1/R2/R3 … → Branch G; execute only the named
items; anything not named is not granted (default-deny holds)"*; an explicit
denial is a calibration datum resolving to Branch L; a scope-less answer is not
a grant. Seats (its §Seats): gate+record; branch execution (G: observation +
grant-discipline verifier · L: matrix seat + fixture seat); freshness/debt;
verification + outside spot-check (`LEARNING.md:37-43`); scribe. Write scope per
seat; `.ufo/l0-questions.md` is touched only by the seat filing the packet, only
if Step 0 finds it unfiled (it is filed; not touched this round).

Round-6 wave context (observed): this is the fleet's 32-lane training round 6;
sibling lane scratch observed live — `/tmp/w6-tabi-b61`, `b62`, `b64`,
`/tmp/w6-aud-b6-scratch`, plus the mado/tameshi/tsukuroi seats' dirs and
`/tmp/w6-s61-work`, `/tmp/w6-scr-m6`, `/tmp/w6-ver-t6` (fleet root `.ufo`).
Fleet HEAD `6963296` ("training wave-5 closeout: round 5 — ALL FOUR LANES
probation-complete"); the only fleet-tree dirty entry at 17:42Z is
` M .ufo/waves/shokunin-train-20261101-w15/registry.json` (another wave's file).

## 2. Step 0 gate — precondition sweep (round-5 clauses a–d, checked not assumed)

The round-6 plan says the round-5 clauses are this plan's precondition set and
are "checked at Step 0, never assumed". Status vocabulary: **PASS** (landed and
verified by this lane or by a named landed artifact) · **CARRIED** (impossible
today by construction, recorded in force) · **DEBT** (owed, named).

| # | Predicate | Verify command (as run) | Expected | Observed @ 17:40Z | Status |
|---|---|---|---|---|---|
| a1 | every archived group has `MANIFEST.txt` | `find corpus/evidence -mindepth 1 -maxdepth 1 -type d \| wc -l`; `find … -name MANIFEST.txt \| wc -l` | equal | **25 / 25** | PASS |
| a2 | manifest hashes match archived bytes (spot ≥3 groups, one pinned file each) | `cd corpus/evidence/<g> && sha256sum -c MANIFEST.txt` for `tabi-r2-2-state` (6), `tabi-r3-1-journey` (63), `w4-t41-network` (200) | 0 FAILED | **269/269 OK, 0 FAILED, exit 0 each** | PASS (3/25 sets; AUD-B5 audited the same 3, §7 hashes equal) |
| a3 | pin equality for note-pinned files | owning-note pins vs archived hashes (sample via a2's three sets; full sweep by AUD-B5 §2: 52 pin instances / 52 MATCH) | no mismatch | **no mismatch on any checked file**; the two known in-group pin-file failures are F1 (`tabi-b1-r3b-journey/methodology-sha.txt`, no owning-note pin) | PASS (with F1 kept as a recorded finding, never quietly repaired) |
| a4 | manifest schema (path · sha256 · bytes) | `head` of a `MANIFEST.txt` | bytes field, or explicit departure ruling | entries are two-field `sha256  path`; the bytes question from round 5 is superseded by `archive-receipt-r5.md` §1-2, which carries per-group file/byte totals | PASS as read (receipt is the owning note; §2 gives bytes per group) |
| b | 4 lesson files, each with `## Gate` (candidates / admitted / rejected+reasons / spot-check) | `ls -A corpus/lessons \| wc -l`; per file `grep -c '^## Gate'` | 4; 1 per file | **4 files; 1 `## Gate` each**; sha256 first16 `bdd46c85b349d37d` / `a862d69cb0b90d6e` / `153a1b9831bb3ed1` / `cde3960eb1a93366` (= AUD-B5 §7) | PASS |
| c | §Pins re-derived **on a date strictly later than 2026-10-14**, recorded with that date | `date -u +%F`; re-derivation table below | date ≥ 2026-10-15 | **2026-10-14** — impossible today; the round-6 plan says carry, do not fail | **CARRIED** (values re-derive same-day: see §4) |
| d1 | packet exists | `test -f corpus/handoffs/operator-approval-request.md` | file | exists: 121 lines, 13,103 B, sha256 `94dc63f5fb9e3d9818008663fe46a4d08776ff7d79a7a1a821903b2d0f1ac0aa` | PASS |
| d2 | zero `/tmp/` citations | `grep -c '/tmp/' corpus/handoffs/operator-approval-request.md` | 0 (exit 1) | **0** (exit 1) | PASS |
| d3 | exactly one L0 line naming the packet + its sha256 | `grep -c '^tabi' .ufo/l0-questions.md`; pre/post counts + byte-prefix proof | 0→1; 24→25 lines; line cites packet + sha | **1** (`:25`); 24→25 lines proven land (AUD-B5 §4: `head -c 20653` = `0a86973b…` = byte-identical prefix; 886-byte suffix) | PASS |
| d4 | packet cold-read falsifier (the packet's own §6 gate) | cold-reader verdict artifact | recorded verdict | packet self-contains the grant/deny form; **no cold-read verdict artifact observed** in `reports/` or `corpus/handoffs/` (dir mtimes ≤ 14:09) | **DEBT** (named, carried from round 5) |

## 3. The round-6 claim's verification table (Branch L — the operative branch)

Predicates below are the round-6 plan's Branch L + Measure sections, made
mechanical. "Observed" is this lane's read at 17:40–17:43Z; status vocabulary as
in §2, plus **IN FLIGHT** (seat working; partial artifacts observed) and **NOT
LANDED** (no artifact).

| # | Predicate (pass condition) | Verify command | Expected | Observed @ 17:42Z | Status |
|---|---|---|---|---|---|
| L1a | one named unexamined mechanism converted to a **measured rule + falsifier** (wire-class / cache-revalidation for repeated same-URL subresources) | the delivering note lands in `corpus/knowledge/` with the rule, the falsifier field filled, and a per-cell record of which of {wire-304, no-wire re-serve, client-status} obtained and which layer decided | rule + falsifier + named residual unknowns; negative result lands with the matrix | **no note yet**; the matrix seat's work in flight (`/tmp/w6-tabi-b61/` fixture + harness mtimes 14:40; no `b63` scratch observed at 17:42Z) | IN FLIGHT |
| L1b | controlled single-factor matrix, one factor per cell (cache headers / mtime age / repeat count / per-run fresh profile), N ≥ 2 cold runs per cell | cell logs + per-cell verdict lines in the delivering note/scratch | every planned cell recorded, complete vs planned counted; falsifier per rule | not yet measurable | IN FLIGHT |
| L2a | fixture edge-classes (E1–E3 of r5 §4), lane-authored only, baked as a note | `find . -iname '*external-class*'` (project trees + `/tmp`) | note `external-class-fixture-v2.md` (name per lane AUD-B6's poller brief, `/tmp/w6-aud-b6-scratch/poll.sh`, 14:39) | **bytes exist, note not landed** — `/tmp/w6-tabi-b61/`: `site-a/robots.txt` (44 B, `Disallow: /private/instrument/`), `site-a/gate/interstitial.html` (775 B, CAPTCHA-shaped gate), `site-a/private/instrument/probe` (95 B, "must never issue it" trap), `site-b/chain/landed.html` (308 B, "port 19541 to 19543"), `site-b/landed.css`, `server.py` (3,582 B), `v2-journey.mjs` (19,666 B) | IN FLIGHT |
| L2b | stop-and-report predicate delivered by **instruments** (429+`Retry-After`, 403, robots-shaped, CAPTCHA-shaped) — a loopback 429 is never a C6 datum | the note's disposition rule + the run that trips it (stop, record, never retry through) | the predicate fires at the first gate; refusal recorded as a corpus datum | pending the run; the fixture byte for the gate cell exists (L2a) | IN FLIGHT |
| L2c | third-party-JS-shaped async cells (late settle, beacon-shaped POST, canceled 404) | per-cell logs | cells recorded as instruments, not as real-site evidence | pending | IN FLIGHT |
| L3 | guards: capture bytes byte-identical across identical-cell reruns (or divergence measured and classified); both network surfaces kept; closure per run (kill by PID from the process table, ports closed, `curl` exit 7) | rerun compare + `ss -ltn`/PID table + `curl` exit codes, per run | every run closed with proof; divergence rows classified | pending the runs | NOT LANDED |
| N1 | the new note(s) land with a **coverage row** (`corpus/README.md`) and **SKILL distillation** | `grep -n '<note-name>' corpus/README.md SKILL.md` | row + SKILL section | **not landed**; `corpus/README.md:5-8` still states "Held at round 3 … 8 knowledge notes, 1944 lines … Lessons: 0" while `ls corpus/knowledge/*.md \| wc -l` → 12 and `wc -l … \| tail -1` → 3561; rounds 4–6 rows owed | NOT LANDED |
| N2 | lessons count | `ls -A corpus/lessons \| wc -l` | **4** "(or the missing file named)" (plan Measure) | **4** (`round-1..4.md`; `wc -l` 59/60/69/87). No `round-5.md` exists — the plan's literal measure reads 4; whether the record should now expect a round-5 gate file is an open reading (§7 U-d) | PASS as written |
| N3 | §Pins re-derivation date + match count | §4 table | recorded date + all matches | **same-day (2026-10-14): 16/16 MATCH**; strictly-later **CARRIED** | PARTIAL (time-gated) |
| N4 | LOG entry + commit | `git log -1` after the scribe lands | round-6 entry cites the round's evidence; commit carries lane identity | **not landed**; HEAD still `bc4b7d5`; no round-6 files in the tree | NOT LANDED |
| N5 | standing Brave reject re-run | `ls -A ~/.config/BraveSoftware/Brave-Browser/` | `NativeMessagingHosts` only (agree), or the disagreement recorded | **`NativeMessagingHosts` only** → agree. **Count bookkeeping contested**: r1/r2 verdict rows record agreement, r3 says "third consecutive", the r5 record says "fifth consecutive", the round-6 plan's Measure says "5th" for *this* round, and the round-7 plan (`plans/round-7.plan.md:124-129`) independently flags the drift and directs the gate to re-derive the count from the record. This lane's measurement is one more agreement — by the r5 record's own count that is the **6th occurrence**. The record must print the count it asserts | PASS |
| AC | anti-claim: no external site; loopback only; packet stays filed; not re-asked | external-evidence sweep of the round's artifacts; L0 diff (§0) | nothing external; nothing filed anywhere | holds as far as measurable today: L0 unchanged (no grant can exist — default-deny by construction), the branch seats' observed artifacts are loopback fixtures, this lane ran no browser | HOLDS (restate in record) |
| FL | fleet-level, reported not absorbed: tabi outside the watchdog `LANES` roster | `grep -n '^LANES' scripts/shokunin-watchdog.sh` | named, not fixed by this lane | `:14` → `protocol aggregator kasegi kengaku kake kumitate kotoba kagi kama` — **tabi still absent** (carried from r5 §7) | REPORTED |

Boundary on L1/L2: this lane did **not** author or audit the branch seats' work;
the statuses above are reads of scratch timestamps and file presences. The
verification seat + outside spot-check (`LEARNING.md:37-43`) own the verdicts.

## 4. §Pins re-derivation — 16 values, same-day (2026-10-14, 17:40Z)

Pin block authority: the §Pins errata at `SKILL.md:744-765` (lane B5-3's
post-append refresh "supersedes the note pins in §Pins above for post-append
use") + the 12th note (archive receipt, not in that block) + the substrate
files. Match = ALL 16.

| # | Source | Pin (post-append authority) | Re-derived @ 17:40Z | `wc -l` (convention = `wc -l`) |
|---|---|---|---|---|
| 1 | `corpus/knowledge/webbridge-plugin-anatomy.md` | `8d1488ab763e` | `8d1488ab763e` | 290 ✔ |
| 2 | `corpus/knowledge/browser-surface-census.md` | `a33c22644d64` | `a33c22644d64` | 265 ✔ |
| 3 | `corpus/knowledge/cdp-evidence-patterns.md` | `337ff64579e8` | `337ff64579e8` | 234 ✔ |
| 4 | `corpus/knowledge/live-dynamic-capture.md` | `01266495b761` | `01266495b761` | 245 ✔ |
| 5 | `corpus/knowledge/webbridge-daemon-disposition.md` | `fd5f6861aa3b` | `fd5f6861aa3b` | 274 ✔ |
| 6 | `corpus/knowledge/interaction-approval-table.md` | `b5e29a9a2adf` | `b5e29a9a2adf` | 246 ✔ |
| 7 | `corpus/knowledge/executor-test-sufficiency.md` | `32772e343848` | `32772e343848` | 329 ✔ |
| 8 | `corpus/knowledge/multi-step-journey.md` | `e0367890f1cf` | `e0367890f1cf` | 349 ✔ |
| 9 | `corpus/knowledge/network-evidence-rung.md` | `d1564f38dc14` | `d1564f38dc14` | 609 ✔ |
| 10 | `corpus/knowledge/async-step-evidence.md` | `05dcda5e60b9` | `05dcda5e60b9` | 282 ✔ |
| 11 | `corpus/knowledge/hygiene-sweep-r4.md` | `87155e12021d` | `87155e12021d` | 258 ✔ |
| 12 | `corpus/knowledge/archive-receipt-r5.md` (12th note, not in the block) | `b41c2f6fb5a4` (AUD-B5 §7 snapshot) | `b41c2f6fb5a4` | 180 |
| 13 | `reports/r4-aud-tab1.md` (report, not a note) | `5f44b0f94483` | `5f44b0f94483` | 167 ✔ |
| 14 | substrate `kimi.plugin.json` | `e70aff5c40ff` | `e70aff5c40ff` | 24 |
| 15 | substrate `skills/kimi-webbridge/SKILL.md` | `84a8e69d04c5` | `84a8e69d04c5` | 158 ✔ |
| 16 | substrate `skills/kimi-webbridge/references/operations.md` | `b811d9c23dfd` | `b811d9c23dfd` | 34 ✔ |

Also re-derived (anchors, not §Pins rows): `SKILL.md` now `dcc33f1bf531`
(765 `wc -l` / 766 logical; last byte `2e`) — the errata block's recorded
pre-append value for it was `1e2f87caddff` (741 lines); the substrate path,
counts and pins agree with lane B6-2's independent snapshot
(`/tmp/w6-tabi-b62/02-substrate-pins.txt`, 17:40:47Z — same three hashes,
24/158/34/216 counts).

Same-day limit (restated): this is a 2026-10-14 derivation; round-5 clause (c)
and the round-6 freshness rider both require a **strictly later date** and
remain **CARRIED** (earliest 2026-10-15). The durable witness should be a dated
in-repo block whose commit date is ≥ 2026-10-15.

## 5. Baseline anchors (repo state @ 17:40–17:43Z)

- HEAD `bc4b7d5c5041da6f45ed52a0c1f42c6353c135e3` ("probation round 5
  (training r4)…", 2026-10-14 14:33:30 -03); `git status --short` → **empty**.
- Round-5 commit contents (measured): 1,065 files — 1,035 under
  `corpus/evidence/` + 30 others: `LOG.md` (+1), `SCORECARD.md` (+1),
  `SKILL.md` (+25/−1), the 12 knowledge notes, the 4 lesson files,
  `corpus/handoffs/operator-approval-request.md`, `plans/round-5-record-draft.md`,
  `plans/round-5.plan.md`, `plans/round-6.plan.md`, `reports/r5-aud-b5.md`.
- Knowledge: **12 notes / 3,561 lines** (`ls corpus/knowledge/*.md | wc -l`;
  `wc -l … | tail -1`).
- `SKILL.md`: **765 `wc -l` / 766 logical**, sha256 first12 `dcc33f1bf531`.
- Archive: **25 groups / 25 manifests / 1,035 files / 6,889,272 B** in
  `corpus/evidence/` (`find … -type f | wc -l`; `du -sb`); receipt reports
  1,010 evidence files / 6,780,293 B + 25 manifests, 5,668 files /
  313,772,976 B excluded (profile trees, shape-only).
- Lessons: 4 files (59/60/69/87 `wc -l`; 60/61/70/88 logical) — **one
  discrepancy to record**: AUD-B5 §3's table lists `round-3.md` as **68** lines
  while `wc -l` → 69 / `grep -c ''` → 70, with the file's sha256
  (`153a1b9831bb3ed1…`) equal to the audit's own §7 snapshot — i.e. byte-
  identical file, a **counting slip in the audit's table** for that one row.
  The record should adopt `wc -l` (the convention SKILL.md:78-81 states) and
  keep the audit row as-is (append-only).
- Packet: 121 lines / 13,103 B / `94dc63f5…`; `grep -c '/tmp/'` → 0.
- L0: 25 lines / 21,539 B / `02c53ec6…` (§0).
- Reports: `r4-aud-tab1.md` 167 lines `5f44b0f94483`; `r5-aud-b5.md` 171 lines
  (round-5 audit; PASS on all three audited clauses, 52/52 pin instances).
- Daemon live state (re-measured by this lane, read-only, 17:42:53Z):
  `ss -ltnp` → **NO listener on 10086**; `ps -p 3934817` → **not running**;
  `~/.kimi-webbridge/` holds `daemon.pid` (8 B) and `daemon.addr` (16 B), both
  mtime 14:46 -03 (shape-only; `identity.json` never content-read). This
  **supersedes** the round-2–5 records' "pid 3934817 still listening" line; the
  change point (and whether the daemon OOM-died again, per the round-4 sweep
  finding) is **not measured** by this lane — the record should date the state
  and name the operator-side disposition owed (D2 lineage). Lane B6-2's
  independent snapshot (`/tmp/w6-tabi-b62/01-live-state.txt`, 17:40:47Z) agrees.
- Brave reject: `ls -A ~/.config/BraveSoftware/Brave-Browser/` →
  `NativeMessagingHosts` only (agree; 6th consecutive).
- Integration debt visible at record time: `corpus/README.md` still at round-3
  counts over a 12-note corpus and 4 lesson files; its Frontier block still says
  "thirteen `/tmp` evidence groups" where the archive now holds 25; SCORECARD
  has the round-4/5 move-log rows appended **after** the "Planned / retired"
  list (`SCORECARD.md:83-84`) with the axes table (:54-62) still round-3-pinned
  and no round-4/5 primary-verdict tables. The round-6 scribe should land these
  with (or before) the round-6 record.

## 6. In-flight sibling state + poll plan (this lane's reads, not audits)

| Input | Expected from | Observed @ 17:40–17:44Z |
|---|---|---|
| L1 matrix (rule + falsifier + cells) | branch lane(s) | fixture + harness under `/tmp/w6-tabi-b61/` (mtimes 14:40): `site-a/` + `site-b/` + `server.py` 3,582 B + `v2-journey.mjs` 19,666 B; **no note, no cell logs landed** |
| L2 fixture note `external-class-fixture-v2.md` | fixture seat | fixture bytes exist (§3 L2a); note absent; lane AUD-B6 polls project trees + `/tmp` for `*external-class*` (`/tmp/w6-aud-b6-scratch/poll.sh`, 14:39, cap 360×10 s) |
| live-state + substrate snapshot | lane B6-2 | `/tmp/w6-tabi-b62/{01-live-state.txt,02-substrate-pins.txt}`, stamped 2026-10-14T17:40:47Z; read by this lane; agrees with §4/§5 (substrate hashes, NO-LISTENER, stale pid) |
| landing watcher | lane B6-4 | `/tmp/w6-tabi-b64/poll.sh` (75×20 s, started 14:40); `poll.log` has one change event (17:40:50Z: b61/b62 dirs appearing); `snap.cur` tracks the tabi tree, `.ufo/reports`, `.ufo/waves`, and greps for `revival\|fixture-v2` |
| round-7 design plan | sibling design lane PREP-B7 | `plans/round-7.plan.md` landed 14:44:04 -03 (331 `wc -l` / 332 logical; sha256 first16 `4e0261de5d534739`). It independently re-derived the round-6 state (HEAD `bc4b7d5` clean; plan sha `b86c95c75323…`; L0 25 lines `02c53ec60acf…` no answer; 12 notes/3561; SKILL 765/`dcc33f1bf531`; archive 25/25; daemon no-listener; README/SCORECARD debt) and makes **round-6's L1 landing its carried-debt check** — i.e. if round 6 does not land the wire-class/cache-revalidation matrix, round 7 executes it first as debt, not as a second move |
| other wave lanes (mado/tameshi/tsukuroi seats, `w6-s61-work`, `w6-scr-m6`, `w6-ver-t6`, …) | fleet siblings | observed as live `/tmp` dirs; **out of this lane's province** — reported, not read beyond directory listings |

Poll plan for the final scribe: this lane ran a bounded poll — `/tmp/w6-scrb6-poll.sh`
(40 × 30 s ≈ 20 min cap, started 17:41:19Z), log `/tmp/w6-scrb6-poll.log`,
sampling the L0 file, the tabi tree and the wave's scratch dirs each iteration.
Iterations 1–6 (17:41:20–17:43:50Z): L0 byte-identical every time; the only new
tabi-tree files are this draft and `plans/round-7.plan.md`; the knowledge dir
did not move. No cap was stated in this lane's assignment; 20 minutes is the
cap adopted here and is recorded as such. Every moving value (pins, counts, L0
lines, manifests, scratch) must be **re-derived at record time** — the r4/r5
lesson (moving pins; `plans/round-5-record-draft.md` §8).

## 7. Unknowns (explicit)

- U-a: whether the L1 matrix note lands, under what filename, and whether any
  cell has to be recorded as incomplete (the plan allows a negative result with
  the matrix; it does not allow a claim by exhaustion).
- U-b: whether the L2 fixture note lands and whether any instrument cell trips
  the stop-and-report predicate in a run (a trip is a datum either way).
- U-c: whether the fixture seat reuses the r5 §4 E1–E3 fixture or replaces it —
  the observed `site-a/site-b` layout is new (robots trap, gate, chain), so
  "v2" here is a build, not a copy; the note must say which.
- U-d: lessons 4 vs 5 — `round-5.md` does not exist; the round-6 plan's Measure
  says `→ 4 (or the missing file named)`, so the literal check passes, but the
  record should say explicitly whether a round-5 gate file is owed.
- U-e: README coverage rows (rounds 4–6) and the SCORECARD round-4/5/6
  primary-verdict tables + axes updates — all open at write time (§5).
- U-f: when and where the strictly-later-date §Pins block lands (earliest
  2026-10-15) and what its durable witness is (in-repo dated block + commit
  date).
- U-g: archive debts from the r5 receipt, still open: F1 (the stale in-group
  pin file `tabi-b1-r3b-journey/methodology-sha.txt` — re-stamp or erratum);
  F3 (round-5 peer groups `/tmp/w5-tabi-b53/`, `/tmp/w5-aud-b5-work/`,
  `/tmp/w5-aud-b5-evidence/` were mid-write and not archived). Round-6 scratch
  (`/tmp/w6-tabi-b6{1,2,4}`, this lane's `/tmp/w6-scrb6-*`) will be the next
  tranche; until archived, every new hash is provisional (`cdp-evidence-patterns.md:92`).
- U-h: the daemon state change — when the listener died, and whether the record
  names an operator-side disposition owed (D2 lineage; the round-4 sweep
  already recorded one OOM death).
- U-i: whether an answer arrives before the round closes; if it does, the
  read-back rule (§0) governs and the branch may switch only inside the granted
  scope with the record showing read-back-before-act.
- U-j: the wave seats' own identities — this lane read scratch paths, not seat
  self-identifications (only the packet's `B5-4` style self-naming is on record
  from round 5); the record should use each seat's own self-id where the
  landed files carry one.

## 8. Spot-checks performed by this lane (non-author of every checked artifact)

- **SC-1 — §Pins re-derivation:** 16/16 values re-derived by `sha256sum` at
  17:40Z (§4), including the 12th note (archive receipt) that sits outside the
  §Pins errata block; line counts re-held. Same-day — recorded as such, does
  not satisfy clause (c).
- **SC-2 — archive pin equality (spot, 3/25 groups):** `sha256sum -c
  MANIFEST.txt` in `tabi-r2-2-state` (6), `tabi-r3-1-journey` (63),
  `w4-t41-network` (200) → **269/269 OK, 0 FAILED, exit 0** each; group set
  chosen to match AUD-B5's three audited sets so the two measurements are
  comparable (they agree; raw logs `/tmp/w6-scrb6-chk-*.txt`).
- **SC-3 — L0 negative control:** four reads spanning 17:40:11–17:43:52Z,
  byte-identical (25 lines / 21,539 B / `02c53ec6…`); diff vs the round-5
  filing state = none; the round-5 append-only proof (`head -c 20653` =
  `0a86973b…`) is AUD-B5 §4's, cited not re-run.
- **SC-4 — lessons:** 4 files, one `## Gate` each; sha256s equal AUD-B5 §7
  snapshots (files unchanged since the audit); **round-3 line-count
  discrepancy found and kept** (§5): audit table 68, `wc -l` 69 / logical 70 on
  a byte-identical file — a counting slip in the audit table, recorded, not
  silently harmonized.
- **SC-5 — daemon + substrate:** independent read-only re-measurement of the
  daemon state (NO listener 10086; pid 3934817 not running; pid/addr files
  present, shape-only) and 3/3 substrate pins; agrees with lane B6-2's snapshot.
- **SC-6 — Brave reject:** `NativeMessagingHosts` only (agree; count
  bookkeeping contested — see §3 N5).
- **SC-7 — cross-lane corroboration:** lane B6-2's snapshot (17:40:47Z) and
  PREP-B7's plan freeze (17:41:44Z) independently report the same L0, HEAD,
  corpus counts and daemon state as this lane. Three lanes, same measurements,
  no contradiction.

## 9. Errata — append-only

- (none yet; corrections append below with date + evidence. The final round-6
  record supersedes this file, not the other way around.)

### E1 — 2026-10-14T17:45Z, by SCR-B6 (post-write re-check; §9's "none yet" superseded here, not rewritten)

- **This draft's fingerprint at write:** 296 `wc -l` / 297 logical lines /
  27,241 B / sha256 first16 `3a4d1539ce3b3da9`.
- **L0 post-write re-check 17:44:50Z:** unchanged — 25 lines / 21,539 B /
  `02c53ec60acfda48…` / mtime 2026-10-14 14:05:52.482908587 -03. **Branch L
  stands**; ask-count 1; no re-ask.
- **New landing during this lane's write window (14:44:54 -03, after §3's
  snapshot):** `corpus/knowledge/webbridge-revival-assessment.md` — lane B6-2's
  round-6 deliverable; 322 `wc -l`, sha256 first16 `a07c8aedc1614d23`, git
  `??` (untracked). It self-describes as an **assessment, not a revival act**
  (no daemon started/stopped; no `/status` probe), with verdicts on restart
  mechanics (doc-specified, not executed) and on the handshake (not
  doc-authorizable operator-free), plus a new enabling state: the operator's
  chromium running with the Kimi extension installed while the daemon is down.
  Recorded consequences for the final record: (i) §3 N1 moves to **partial** —
  one round-6 note exists; its `corpus/README.md` coverage row and SKILL
  distillation remain owed; (ii) §5's daemon paragraph now has an owning
  round-6 artifact for the revival assessment (that note's §3/§5 — **not
  independently verified by this lane**); (iii) this note is the named input
  round-7's Branch D gates on.
- **Also landed since 14:35:** `plans/round-7.plan.md` (PREP-B7, 14:44:04 -03;
  sha256 first16 `4e0261de5d534739`; 331 `wc -l`) and this file.
- **Git state post-write:** `git status --short` → `?? corpus/knowledge/webbridge-revival-assessment.md`,
  `?? plans/round-6-record-draft.md`, `?? plans/round-7.plan.md`; HEAD still
  `bc4b7d5` (nothing committed by this lane — the commit is the scribe's).
- This lane's bounded poll runs to ~18:01Z (`/tmp/w6-scrb6-poll.log`); no
  further writes by this lane after this block. All statuses above are reads,
  not audits; the round-6 verification seat + outside spot-check own verdicts.

### E2 — 2026-10-14T17:46Z, by SCR-B6 (fingerprint after two write-glue repairs; append-only)

- Two formatting repairs were made to this file's own bytes — **no content
  changed**: a missing newline between §2's `d4` row and the `## 3.` heading
  (now line 101) and between §5's last paragraph and `## 6.` (now line 212).
  Re-checked: all ten sections `## 0.`–`## 9.` present, no other glued lines.
- File fingerprint **immediately before this block**: 328 `wc -l` / 329 logical
  / 29,330 B / sha256 first16 `13d07d63506242e0`. Any later append (including
  this one) moves the hash by construction — re-derive with `sha256sum`; the
  round-6 record supersedes this file.

### E3 — 2026-10-14T18:02Z, by SCR-B6 (landings during the poll window; statuses above superseded here, not rewritten)

The poll (`/tmp/w6-scrb6-poll.log`) ran to `POLL-END 2026-10-14T18:01:20Z`.
`.ufo/l0-questions.md` was byte-identical at **every** iteration (40/40,
17:41:20–18:00:50Z): 25 lines / 21,539 B / `02c53ec60acfda48…` — **Branch L held
through the whole window**; no answer, no denial, no edit. Round-6 artifacts
then landed (all untracked; HEAD still `bc4b7d5`):

| Artifact (lane) | Measure @ 18:01Z | Supersedes |
|---|---|---|
| `corpus/knowledge/external-class-fixture-v2.md` (B6-1) | 569 `wc -l` / 570 logical / 31,080 B / sha256 first16 `4aa604f1788b0531` / mtime 14:52:24 -03 | §3 **L2a, L2b, L2c → LANDED** (untracked, in-revision). Content per its own header + SKILL's entry: 302→303→307 chain with cross-path hop and loopback origin change `127.0.0.1:19541`→`19543` (+ same-origin counterpart); four rate/ToS-shaped instruments (robots-shaped body, `429`+`Retry-After`, `403`, CAPTCHA-shaped interstitial served as 200); stop-and-report proved from both sides (runner cell plan + server request log); fixture bytes embedded in its §3 (survive `/tmp`); `429`-is-never-a-C6 rule written in its §8 |
| `reports/r6-aud-b6.md` (AUD-B6) | 178 `wc -l` / 179 logical / 13,682 B / sha256 first16 `9428ddec52b9ebee` / mtime 14:53:47 -03 | the verification seat's artifact — **read by this lane only as its head**; verdicts are its own, not this draft's. Its head records that the audited note was **in active revision** during the audit (read revision `422ad0d8…`, 552 `wc -l` / 29,664 B, mtime 17:47:30Z) |
| `SKILL.md` distillation (integrating-round seat) | **795** `wc -l` / 796 logical / 64,401 B / sha256 first16 `a8ba10b86138fe39` / mtime 14:52:57 -03; `git diff --stat` → **+31/−1** | §3 **N1's SKILL half → LANDED** (new "### Fixture v2 — external-class edges (usage)" section + a revival-assessment block + **a field-count finding: the recorded "8-field" `/status` reading is an undercount — the two samples carry 9 keys**). N1's coverage-row half (`corpus/README.md`) still owed, and §5's README/SCORECARD debt unchanged |

- **L1 matrix: still not landed** — `ls corpus/knowledge/ | grep -i 'matrix\|cache\|reval'`
  → none; scratch `/tmp/w6-tabi-b61/` instead holds the full fixture run set
  (chain-run1/2/3, `compare-chain.tsv`, `probe-{robots,429,429b,429h,403,403h,captcha}/`,
  `server.py` 3,884 B, `v2-driver.sh`, `v2-journey.mjs` 21,062 B, `disk-shas.txt`,
  `note-hexes.txt`; mtimes 14:41–14:51). Round-7's plan makes round-6's L1 its
  carried-debt check — **the record must say whether L1 landed or is carried**.
- **Revision-binding warning for the record:** the fixture note moved after the
  audit read it (`422ad0d8…`/552 → `4aa604f1…`/569, and per SKILL's own entry it
  moved ≥3× over 17:48–17:52Z). AUD-B6's verdicts bind the revision it read;
  either the note is frozen at a revision and the audit re-bound to it, or the
  audit re-runs — the record should not imply the verdict covers bytes it never
  saw.
- This lane wrote nothing after this block. Statuses in §2–§5 remain as measured
  at 17:40–17:45Z; this E3 is the delta. The round-6 record supersedes this file.
