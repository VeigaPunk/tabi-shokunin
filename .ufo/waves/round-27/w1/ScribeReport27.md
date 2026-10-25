# tabi — round 27 report (hyaku run 7, attempt 1) — SKELETON

**Status: report skeleton, refreshed mid-wave.** Drafted by `ScribeReport27`
before wave adjudication and refreshed at lane HEAD
`5ed6484da66e6bf73654281d2e9ba3703f0c2ef0` after two late commits
(`5198e28`, `5ed6484`) landed on top of the first draft's `336d5d1`. Wave-1
seat reports keep landing in this directory (23 `*.md` at the last snapshot;
`ExecC2Reopen.md`, `RevC2Gate.md`, `RevSourcesS107.md`, `MutC2Gate.md`,
`ScribeLOG27.md`, …) — they are **referenced, not adjudicated** here.
Everything marked `<PENDING: …>` waits on wave falsification or the L0.

Lane HEAD `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0` == `refs/heads/master`
(`git rev-parse master HEAD` → both `5ed6484…`); the checkout itself is
detached at that commit (`git rev-parse --abbrev-ref HEAD` → `HEAD`). Round
baseline `f185b4e7ab10cd9e8925e8ec614c9c111772357d`; C1 counter baseline
`4ad4c77eed78bca1a149e65a7ec6a84b5f71c925`. Claim set:
`.ufo/waves/round-27/claims.json` (`frozenBeforeData: true`), re-dispatching
`.ufo/waves/round-26/claims.json` with predicate/counter/kill rule unchanged.

**Working tree at refresh time (observed, not this seat's).**
`git status --porcelain` → `M corpus/QUALITY.md`,
`M corpus/knowledge/redirect-and-retry-after-semantics.md`,
`?? .ufo/waves/round-27/gen-w2.mjs`, `?? .ufo/waves/round-27/w1.ready.dispatched`,
`?? .ufo/waves/round-27/w1/`, `?? .ufo/waves/round-27/w2-spec.json`,
`?? scripts/report-contract.mjs`. Tracked-file edits belong to other seats and
are **uncommitted**; every counter below is quoted at a commit. This seat wrote
only this file (plus no scratch — it ran no fixtures).

The tree moved again while this file was being written: a later
`git status --porcelain` additionally showed `M corpus/README.md`,
`M corpus/SOURCES.md`, `M corpus/lessons/round-27.md` and (still) the three
edits above. All findings below therefore name the commit they were measured
at; none rests on the dirty tree.

**Marker rule.** `<PENDING: …>` marks wave-, seat- or L0-dependent content and
is never a measured value. Three evidence levels are kept apart: *tracked-record
claim* (SCORECARD/LOG/lesson prose), *receipt* (a commit under
`.ufo/waves/round-27/`), *reporter-run* (a command this seat executed
read-only). Disagreements between levels are recorded verbatim under
"Conflicts on record", never smoothed.

## Work performed

- Re-dispatched the three round-26 frozen claims under round-27's own frozen
  record (`.ufo/waves/round-27/claims.json`, committed in `fd722a7`); the
  record carries one pre-data revision (`controlArmFalsified`, C3).
- L1 landed all three claims pre-wave: C1 `fd722a7`, C2 `5577d1b`, C3
  `6ca3b89`; conformance rows `ef7a274` / `024d60c` / `5a0178c`; wave evidence
  + measurement receipts `8e07f0b`; round records `336d5d1`; then two late C2
  corrections `5198e28` (absent receipt → could-not-evaluate) and `5ed6484`
  (empty fixture commit permitted in the new selftest case).
- Built and validated wave 1: `w1-spec.json` 32 items (`wave=tabi-r27-w1`,
  `maxLanes=32`; role census `executor 9, scribe 5, reviewer 4, scout 3,
  critic 3, simplifier 2, mutation-tester 2, connector 2, sentinel 1,
  revenger 1`), `w1-dispatch.json` `counts.spawn=32`, `w1-validate.err` 0
  bytes, `w1.ready` naming L1 `TabiR27`, `w1.ready.dispatched` =
  `2026-10-25T14:23:37` (all reporter-run via `python3 -c` over the JSON and
  `cat`).
- Wave 2 is **prepared, not dispatched**: `w2-spec.json` 36 items
  (`executor 13, critic 5, scribe 4, scout 4, mutation-tester 3, reviewer 2,
  sentinel 2, connector 2, simplifier 1`), the file *untracked*; `w2/` empty;
  no `w2-dispatch.json`, no `w2-validate.err` (`ls` in
  `.ufo/waves/round-27/`). See conflict 2.
- No tool installs or upgrades this round (channel n/a, nothing needed).
- No gate, selftest or census was executed by this seat (the L1 runs the lane
  gates once after integration); every number below is a receipt read, a
  committed-byte hash/`git grep`/`git show` count, or a file inventory.
- Nothing in this report lands in tracked files.

Seats executed / dead seats: `<PENDING: W1+W2 seat outcomes>`.

## Landed changes

| Commit | Change |
|---|---|
| `fd722a7` | C1: `scripts/check-selfassessment.mjs` m1 window extended to `LOG.md` (+188/−12), `claims.json`, `selfassess-baseline-raw.json`, `selfassess-tip-raw.json`, `census-before.txt`, `LOG.md` +47 (append-only corrections) |
| `5577d1b` | C2: `scripts/check-s106-evidence.mjs` new, 4-case selftest |
| `6ca3b89` | C3: `corpus/knowledge/redirect-and-retry-after-semantics.md` (55 lines), `corpus/SOURCES.md` +1 row (S107 at line 121), assimilation receipts (fresh bytes, staged/transformed rows, census arms, guard fixture) |
| `ef7a274`, `024d60c`, `5a0178c` | `SKILL.md` gate-registry rows for the s106 gate + a refreshed self-assessment row (verdict-map wording corrected twice) |
| `8e07f0b` | wave-1 spec + dispatch payload + `measure-c1-fd722a7.json` + `measure-c2-5577d1b.json` + `census-after-c3.txt` + empty `w1-validate.err` + `w1.ready` |
| `336d5d1` | `corpus/lessons/round-27.md`, `corpus/QUALITY.md` criteria 67–68, `corpus/README.md` round-27 row, `SCORECARD.md` round-27 blocks |
| `5198e28` | `SKILL.md` (s106 row → cases=5), `corpus/lessons/round-27.md` +13 lines (M3), `scripts/check-s106-evidence.mjs` +8/−1 (absent receipt throws `Refusal`) |
| `5ed6484` | `scripts/check-s106-evidence.mjs` +1/−1 (allow an empty missing-receipt fixture commit in the 5th case) |

Command for the table: `git show --stat --format='%H %s' <rev>` per hash.

**Untracked (not evidence of record):** `.ufo/waves/round-27/{w1/,
w2-spec.json, gen-w2.mjs, w1.ready.dispatched}` and
`scripts/report-contract.mjs` (`git status --porcelain`). The report-contract
script is the utility QUALITY criterion 68 (committed text) names, but it is at
no commit and its header declares "Not a gate"; `grep -n 'id: "\|--selftest\|cases'
scripts/report-contract.mjs` → no matches, i.e. it has no self-test.

## Before → after measurements

Values were read from committed receipts by this seat (`python3 -c
'json.load(...)'` over each named file); no gate was executed here.

### C1 — calibration, `mismatches`

Frozen: m1 window covers `LOG.md` round entries as well as `SCORECARD.md`;
`≥1` at baseline, `0` at tip; `--selftest cases 13 → ≥15`.

| Point | `mismatches` | counted classes | LOG m1 findings (superseded) | Source |
|---|---|---|---|---|
| `4ad4c77` (baseline) | 6 | 5 m1 LOG (`:335`,`:391`,`:1090`,`:1103`,`:1664`) + 1 `m3-unlanded-paths` (observed 6) | 15 (1) | receipt `selfassess-baseline-raw.json` |
| `f185b4e` (round tip) | 5 | 4 m1 LOG (same lines minus `:1664`) + m3 (observed 4) | 17 (2) | receipt `selfassess-tip-raw.json` |
| `fd722a7` (post-C1) | **1** | `m3-unlanded-paths` only (observed **9603**) | 17 (6) | receipt `measure-c1-fd722a7.json` |
| `5ed6484` (HEAD) | **no receipt** | — | — | `ls .ufo/waves/round-27/*.json` |

- LOG-window outcome at `fd722a7`: all five baseline lines carry
  `superseded: true` (`:335`, `:391`, `:1090`, `:1103`, `:1664`); the 17 m1
  LOG findings include 12 with `script: null` that are could-not-evaluate and
  never counted (`couldNotEvaluate: 92` overall).
- The LOG correction block (`LOG.md:1904-1925`, five bullets) names the
  instrument, states the oracle number, carries a `Correction (supersedes
  LOG.md:<line>)` marker and cites the superseded line — the shape the frozen
  rule requires, and the receipt marks those lines superseded.
- Selftest count, static derivation (not executed): `grep -c 'id: "'` over the
  `CASES` array → `4ad4c77` **11**, HEAD **15**; `runSelftest()` adds 2
  synthetic refusal results (`refusal-bad-rev-syntax`,
  `refusal-unresolvable-rev`), i.e. **13 → 17**. HEAD's 15 ids include the
  four LOG-window cases the frozen `failureCapable` named
  (`m1-log-stale-tally`, `m1-log-stale-then-corrected`,
  `m1-log-wrong-number-correction`, `m1-log-ambiguous-section-not-counted`).
- Kill-rule check (m1 only): `git show fd722a7 -- scripts/check-selfassessment.mjs
  | grep -E '^\+.*(m2|m3)'` → one added line, the findings-assembly call
  (`...m2Findings(...), ...m3Findings(...)`); no added logic inside the m2/m3
  classes.
- **The frozen `after` (`mismatches=0`) is recorded by no receipt.** The only
  post-C1 receipt records `1` (live `m3` class, porcelain count 9603 at the
  measurement instant). `SCORECARD.md:1396` and `corpus/lessons/round-27.md`
  assert a clean-tree `0`; neither cites a receipt for it.
- Out-of-window tallies (outside the frozen window by construction, so the
  counter cannot report them): `corpus/QUALITY.md:353` (`cases=13` for
  `scripts/check-selfassessment.mjs`) and `SKILL.md:2479`
  (`selfassessment-counter` row, `cases=13`), while `SKILL.md:2515` carries a
  second, refreshed row for the same gate name with `cases=17`
  (`grep -c '^| selfassessment-counter ' SKILL.md` → **2**).

Verdict: `<PENDING: W1/W2 C1 falsification; tracked record says "met">`.
Tracked-record claims to test: `SCORECARD.md:1396`,
`corpus/lessons/round-27.md` claims table, `LOG.md:1901-1902`.

### C2 — depth, `valid`

Frozen: gate reads `corpus/evidence/round-26/sources/s106.json`, recomputes
`decoded_sha256` over the committed bytes, requires the anchor at its recorded
line; `valid` must be `true`; receipt absent → could-not-evaluate (exit 2).

- Receipt `measure-c2-5577d1b.json` (rev `5577d1b`): `present=true`,
  `sha_match=true`, `anchor_located=true`, `anchor_unique=true`,
  `byte_count_match=true`, `valid=true`; `decoded_bytes=73952`,
  `decoded_sha256=9b93fe64…6c44`, anchor line 187, occurrences 1.
- Reporter-run on the committed bytes at HEAD:
  `wc -c corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc`
  → 73952; `sha256sum` →
  `9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44`;
  `grep -cF 'BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);'`
  → 1 (line 187). All three agree with the receipt.
- HEAD gate, static: `grep -c 'id: "'` →
  **5** cases (`clean-fixture-valid`, `sha-mismatch-invalid`,
  `anchor-off-by-one-invalid`, `missing-bytes-could-not-evaluate`,
  `missing-receipt-could-not-evaluate`); the absent-receipt path now throws
  ``Refusal(`receipt absent at ${rev}`)`` (`git show HEAD:scripts/check-s106-evidence.mjs`,
  line 111).
- Wave-1 finding on record (not adjudicated here): `RevC2Gate.md` F1 —
  receipt-absent exited 1 where the frozen kill rule says exit 2, with no
  selftest covering it. The path and the 5th case are now **committed**
  (`5198e28`, `5ed6484`), so the fix is evidence of record; no receipt records
  a post-fix run (`grep -rl '5ed6484\|5198e28' .ufo/waves/round-27/*.json` →
  no match).
- Record drift after the fix: `SCORECARD.md:1397` and
  `corpus/lessons/round-27.md:21` still say "selftest 4/4";
  `corpus/QUALITY.md:367` (committed) says `cases=4`, while the uncommitted
  working-tree QUALITY edits that criterion to `cases=5`; `SKILL.md:2514`
  says `cases=5, passed=5`.

Verdict: `<PENDING: W1/W2 C2 falsification; tracked record says "met">`.

### C3 — coverage, `assimilated_entries_citing_new_row`

Frozen: `git grep -lE '^source: S107 ' <REV> -- corpus/knowledge | wc -l`
`0 → ≥1`, plus census exit 0 at 107 rows.

- Reporter-run counting command: `f185b4e` → **0**; `6ca3b89` → **1**
  (`corpus/knowledge/redirect-and-retry-after-semantics.md:3`); HEAD → **1**.
- Registry rows: `git show <REV>:corpus/SOURCES.md | grep -cE '^\| *S[0-9]+ '`
  → `f185b4e` **106**, `6ca3b89` **107**, HEAD **107**; `grep -cE '^\| *S107 '`
  → 0 / 1 / 1. S107 sits at `corpus/SOURCES.md:121` (11 cells: `spec`, tier
  `A`, `status=mined`, `opened=2026-10-25`, `recheck=730d`, used-by exactly
  the admitted entry, anchor cell carrying the fetch date/bytes/sha256).
- Fresh bytes: `wc -c .ufo/waves/round-27/assimilation/rfc9110.txt` → 502941;
  `sha256sum` →
  `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`; both
  match the entry's `source:` line (entry line 3), the row's anchor cell and
  the lesson Gate. No external GET was executed by this seat.
- Quote re-location, reporter-run against those bytes (line numbers as cited
  in the entry):
  - §10.2.3, lines 4805-4807 — "When sent with any 3xx (Redirection) response,
    Retry-After indicates the minimum time that the user agent is asked to
    wait" (present verbatim at those lines; the 503 sentence at 4803-4804 and
    the value forms at 4809-4813 are also present).
  - §15.4.4, line 7413 — 303 sentence present; "a retrieval request targeting
    that URI (a GET or HEAD request if using HTTP)" spans 7416-7418.
  - §15.4.8, line 7494 — "MUST NOT change the request method if it performs an
    automatic redirection" (entry cites 7493-7495; the clause itself starts on
    7494).
  - §15.4.9, lines 7507-7523 — `sed -n '7507,7523p' … | grep -n 'MUST NOT'` →
    no match (exit 1), so the entry's "no MUST-NOT clause in these bytes" and
    its **INFERENCE** label for 308 method preservation hold against the fresh
    bytes.
- Staged arms: `staged-census.txt` → `file  E09  S124 recheck=730d (errata only)`;
  `xform-census.txt` → `file ok`; `staged-row.txt` is the byte-exact staged
  S124 row, `s107-row.txt` the transformed row (bare `730d`, this round's
  anchor cell, used-by exactly the admitted entry). The do-nothing append is
  therefore blocked by the census gate, and the counting command additionally
  requires the entry's `source:` line to be re-pointed to S107.
- Refusals on record (`corpus/lessons/round-27.md` §Gate): staged **S125**
  refused (its document already stands as S102 — duplicate URL), staged
  **S142** refused (same RFC 9110 document as S107's row, §15.4 overlap —
  merge into the existing row, not a second row). Both carry flip conditions.
- Quarantine slice (38 tabi rows): closed since round 22, verdicts carried,
  nothing adopted. `considerthese/`: `ls -d considerthese` → no such directory
  in this lane.
- Dirty-tree note: the admitted entry is `M` in the working tree (its
  `ground:` line rewritten, 1 insertion/1 deletion) by another seat; the
  committed entry at HEAD is the 55-line version measured above.

Verdict: `<PENDING: W1/W2 C3 falsification; tracked record says "met">`.

### Conflicts on record (verbatim, for the canonical judge)

1. **C1 `after` vs its own receipt.** `LOG.md:1902` states "`mismatches=0`
   (measured receipt in the claim block below)"; the only receipt
   (`measure-c1-fd722a7.json`) records `"mismatches": 1`, `"clean": false`.
   The round-27 LOG entry ends at the file's last line (`git show HEAD:LOG.md |
   wc -l` → 1925; heading `LOG.md:1880`), so there is no "claim block below"
   it. `SCORECARD.md:1396` adds "under a clean tree" and asserts the tip run
   "records the same `mismatches=0`", which no receipt shows.
2. **Wave count / dispatch state.** `SCORECARD.md:1405-1412` says "Two v1
   waves (32 + 32 = 64 seats)" and "W2 dispatched after W1 findings landed".
   Measured: `w2-spec.json` has **36** items, is untracked, `w2/` is empty, and
   no `w2-dispatch.json` / `w2-validate.err` exists.
3. **Census evidence shape.** `census-before.txt` and `census-after-c3.txt` are
   byte-identical (`diff -q` → exit 0; `wc -l` → 17 / 17; 16 `W04` lines + a
   final `tabi ok …/corpus/SOURCES.md` line each). Neither records a row count
   or an exit code, so `106 → 107` rests on the row counts above and `exit 0`
   on the `ok` line alone. The committed receipt matches the working-tree copy
   (`git show HEAD:.ufo/waves/round-27/census-after-c3.txt | diff -` → exit 0).
4. **C2 case-count drift.** `SCORECARD.md:1397` and
   `corpus/lessons/round-27.md:21` say "selftest 4/4";
   `corpus/QUALITY.md:367` (committed) says `cases=4`;
   `SKILL.md:2514` and the HEAD gate itself say 5; the uncommitted QUALITY diff
   changes the criterion to `cases=5`. The lesson's own M3 already says "the
   fifth selftest case asserts exit 2".
5. **Duplicate gate-registry row.** `SKILL.md` carries two
   `selfassessment-counter` rows — `:2479` with `cases=13` and `:2515` with
   `cases=17` (`grep -c '^| selfassessment-counter '` → 2). Only the second
   matches the gate at HEAD.

## Sources & frontier

Counting command: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh
validate --root /home/vgpnk/Projects/shokunin tabi` (not re-executed by this
seat; receipts read).

- **Before**: exit 0, 106 rows, 16 W04 warnings
  (`.ufo/waves/round-27/census-before.txt`). **After**: same receipt shape,
  107 rows per row count (`census-after-c3.txt`; byte-identical to before — see
  conflict 3). Row counts independently confirmed reporter-run (106 → 107).
- **Row added**: S107 (tier A, `spec`, `mined`) — staged S124 transformed to
  fleet schema; the byte-exact staged append is impossible (E09 on its prose
  recheck cell), so the do-nothing arm bites. **Rows touched old→new**: none.
  **Frontier rows advanced**: S107 staging→mined.
- **Refused rows on record**: S125 (duplicate URL of S102), S142 (same-document
  §15.4 overlap with S107's row); flip conditions in
  `corpus/lessons/round-27.md` §Gate.
- **Quarantine**: 38 tabi rows, closed since round 22, verdicts carried,
  nothing adopted. **`considerthese/`**: does not exist in this lane (recorded
  per contract).
- **Frontier restatement** (`corpus/README.md:593`, round-27 row at `:599`):
  "redirects on journeys — documented semantics held; measured redirect
  untested"; the 308 method-preservation is carried as an **INFERENCE**
  (verified reporter-run: no MUST-NOT inside §15.4.9's 7507-7523 body).
- **Entry counts** (reporter-run): `ls corpus/knowledge/*.md | wc -l` → 46;
  `grep -cE '^\| S10[0-7] ' corpus/SOURCES.md` → 8.
- **Other rows opened**: none. Evidence-of-record: S106 decoded bytes were
  committed in round 26; this round only gates them (C2).

## Trend verdicts

Shape only, pending wave falsification; each axis states what is measurable now
and what is owed.

- **expansion — measured now: +1 entry, +1 registry row (106 → 107), one
  frontier item advanced (S107).** No other admission. Outstanding:
  `<PENDING: W1/W2 whether entry and row survive review>`.
- **quality — measured now: the C2 receipt's five flags are all true at
  `5577d1b` and reproduce from the committed bytes (size, sha256, anchor line
  and uniqueness); C3's quotes re-locate at the cited lines in the committed
  fresh bytes, and the 308 clause genuinely is absent.** Counter-evidence on
  record: `RevC2Gate.md` F1 (exit 1 vs the frozen exit 2), now committed as a
  fix but unreceipted; committed records disagree about the case count
  (conflict 4). Outstanding: `<PENDING: W1/W2 quality verdict, incl. the
  non-author read of the entry and criteria 67–68>`.
- **discernment — measured now: two refusals with flip conditions, one
  pre-data control-arm falsification disclosed, one over-assertion (308)
  caught by the frozen kill rule and labelled INFERENCE.** The C1 `0`-vs-`1`
  conflict is not dispositioned by any tracked file. Outstanding:
  `<PENDING: W1/W2 discernment verdict>`.
- **calibration — measured now: the m1 window covers LOG.md and reports the
  five named baseline lines as `superseded: true` at `fd722a7`; the counter's
  own last recorded tip value is `1`, not `0` (conflict 1); two out-of-window
  `cases=13` tallies and one duplicate registry row remain.** Outstanding:
  `<PENDING: W1/W2 calibration verdict; clean-tree rerun receipt>`.
- **operability — unchanged scalar (8); one gate landed with a registry row
  (`ef7a274`/`024d60c`/`5a0178c`), and `scripts/report-contract.mjs` exists as
  an untracked utility.** `check-gate-registry.mjs clean` is a
  tracked-record claim this seat did not execute. `<PENDING: W2 operability
  verdict>`.
- **freshness — unchanged; on-release rows S104–S106 await the next browser-tag
  bump; the only fresh bytes this round are RFC 9110 (committed under
  `.ufo/waves/round-27/assimilation/`).** `<PENDING: W2 freshness verdict>`.

## SHONEN

Copied from `SHONEN.md` statuses (file unchanged from baseline to HEAD:
`git diff --stat f185b4e HEAD -- SHONEN.md` → empty). All four stay `[~]`;
none is upgraded on this round's evidence.

- [~] SKILL.md contains real decision tables, error patterns, checklists, cited sources — `SKILL.md` §Approval table (`:697`), §Evidence ladder, §Runbook, `:1598-1617` kaika decision rows; round 27 appended gate-registry rows (`ef7a274`, corrected by `024d60c`/`5a0178c`) — pending wave falsification.
- [~] At least one end-to-end domain task executed and logged in LOG.md — `corpus/knowledge/multi-step-journey.md` §1–§2, §7; logged in `LOG.md` round-3 entry; round 27 ran no live journey — pending wave falsification.
- [~] Instructions executable by an agent without oral context — `corpus/knowledge/executor-test-sufficiency.md` §0, §4 (verdict SUFFICIENT) — pending wave falsification.
- [~] No cross-domain bleed (PROVINCE.md still accurate) — `PROVINCE.md:3-19`; refusal routes revenger/kaidoku/kake/kagi held (`corpus/evidence/user-20261015-r02/boundary/refusal-receipt.txt`) — pending wave falsification.

## Stale-lane

Respawn-per-round driver; no other mission of this lane is open. Round-27
records are append-only on round 26; the round-26 frozen claims are now
executed pre-wave (C1's `after` contested — conflict 1). Next round's
resumption point is whatever the canonical judge records for these three
claims. This file is wave evidence, not the fleet report: QUALITY criterion 68
targets `.ufo/reports/round-27/tabi.md`, and the utility refuses a
`.ufo/waves/` path by design.

## Open items (owed, named)

(a) A clean-tree C1 receipt recording `mismatches` at the delivered tip — the
only receipt says 1 (live-tree m3, porcelain count 9603), while
`SCORECARD.md:1396` asserts 0. (b) `LOG.md:1902` dangling forward reference
("claim block below") with no such block in the entry. (c)
`SCORECARD.md:1405-1412`: "32 + 32 = 64" vs the 36-item `w2-spec.json`, and
"W2 dispatched" vs W2's empty directory. (d) A post-fix C2 receipt at
`5198e28`/`5ed6484` — the committed fix and the 5th case are not yet measured
by any receipt, and `SCORECARD.md:1397` / `corpus/lessons/round-27.md:21` still
say "4/4". (e) `corpus/QUALITY.md:353` (`cases=13`) and `SKILL.md:2479`
(`cases=13`) are outside the m1 window — widen the window or restate them.
(f) `SKILL.md` duplicate `selfassessment-counter` row (`:2479` vs `:2515`).
(g) `scripts/report-contract.mjs` is untracked and has no self-test, yet
committed QUALITY 68 relies on it. (h) `<PENDING: W1/W2 seat outcome ledger +
L0 questions>`.

**L0 questions this round:** `<PENDING: L0>`.

**Seats/reports referenced, not adjudicated:** `.ufo/waves/round-27/w1/` (23
`*.md` at the last snapshot) — including `ExecC2Reopen.md`, `RevC2Gate.md`
(F1/F2/F3), `RevSourcesS107.md`, `MutC2Gate.md`, `ScribeLOG27.md`;
`swarm-registry.json` lists the wave-1 roster with `agentId: null` at
validation time (`python3 -c 'json.load(...)'`).
