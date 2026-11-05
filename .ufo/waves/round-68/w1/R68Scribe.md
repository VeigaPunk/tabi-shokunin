# R68Scribe — r68 lesson draft, gate mistakes, pre-freeze claim candidates

Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin. Base 1746c53de7d56e8aeaf420a68b5b95e6af96adf8.
Status: DRAFT. No claim is frozen. No row is an adjudication. Nothing here is a non-author verdict.
Receipts: .ufo/waves/round-68/w1/R68Scribe/receipts/ (argv and outputs below; producer shas in producer-shas.txt).

## 1. Probes run (own scratch, deleted after use)

| # | argv (paths abbreviated to lane-relative) | producer sha256 | input sha256 | rc | stdout (abridged) |
|---|---|---|---|---|---|
| P1 | `node .ufo/waves/round-68/counters/build-worksheet-r68.mjs --ledger .ufo/waves/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv --snapshot .ufo/waves/round-66/measure/snapshot-live-r66.tsv --out <scratch>/regen.tsv` | 85e16802… (counter) | ledger 3739288392…, snapshot a5fccf44… | 0 | `{"ok":true,"rows":49,…}` |
| P2 | `cmp regen.tsv corpus/adjacency-adjudication-r68.tsv` | regen a6028e70… | committed a6028e70… | 0 | IDENTICAL |
| P3 | `node scripts/check-adjacency-adjudication-r68.mjs --ledger … --worksheet corpus/adjacency-adjudication-r68.tsv --snapshot … --fleet /home/vgpnk/Projects/shokunin --expect-ledger-sha256 3739288392ad7083c819637347bed14348a6e350b121492fc2653bf3e57b1105 --expect-snapshot-sha256 a5fccf44aad0e4e67dc4592a18e15c3f7c6c88adebd236c4da723ad9d9370a74 --repo . --expect-pending 49 --max-adjudicated 0 --json` | 55c6acbc… | as P1 + worksheet a6028e70… | 0 | `{"ok":true,"findings":[],"byCheck":{},"checked":49,"pending":49,"adjudicated":0,…}` |
| P4 | `node scripts/check-adjacency-adjudication-r68.mjs --selftest --scratch <scratch>/c1-selftest` | 55c6acbc… | — | 0 | `verdict: clean, cases: 19, failed: 0` |
| P5 | `node scripts/check-instrument-registry-r68.mjs --skill SKILL.md --repo . --json` | 091933a0… | SKILL.md (live) | 0 | `{"ok":true,"findings":[],"expected":7,…}` |
| P6 | `node scripts/check-instrument-registry-r68.mjs --selftest --scratch <scratch>/c2-selftest` | 091933a0… | — | 0 | `verdict: clean, cases: 7, failed: 0` |

Note on the selftest counts: the lane's C1 selftest case list has 19 cases (the r68 controls
receipt `c1-selftest-postfix.json` also reports 19). The C2 selftest has 7 cases. The IRC message
said "15-case" for C1; that figure is stale relative to the current file and the observed 19.

Full stdout of P1-P6 is in receipts/*.json and receipts/*.stderr (stderr empty in all runs).
Installs or updates: none.

## 2. Verified facts (observed in this seat)

- The r66 ledger header is `type lane path provinceSha256 lines bgHits quote disposition head`.
  So quote is column index 6, disposition is index 7, head is index 8. The counter (r[6]) and
  the gate (r[6], r[7], r[8]) agree with this header.
- The ledger has 49 `line` rows with disposition `contested-open`. The corrected counter emits
  49 rows, byte-identical to the committed corpus/adjacency-adjudication-r68.tsv (P1, P2).
- The committed worksheet has 0 rows with quote `-` and 49 `pending-non-author` status rows
  (awk count of column 5). Adjudicator, verdict, reason and date cells are all `—`.
- C1 gate passes live (P3) and its selftest passes 19/19 (P4).
- C2 gate passes live on the current SKILL.md section `## Instrument registry — round 68` (line 3110),
  7/7 expected instruments, and its selftest passes 7/7 (P5, P6).

## 3. Lesson draft — `## Gate`

- C1 gate: `check-adjacency-adjudication-r68.mjs`. Inputs pinned by sha256. Worksheet must equal
  the contested-open set of the r66 ledger, one row per key. Each row must bind its quote to the
  committed bytes at the snapshot head (sibling checkout, `git show head:path`), and the quote
  must sit on the cited line. Pending rows must have all four adjudication cells `—`. Adjudicated
  rows need a non-lane, non-author adjudicator, a verdict matching the status, a reason, and an ISO date.
- C2 gate: `check-instrument-registry-r68.mjs`. For each of seven expected instrument paths it
  checks: a registry row exists; the sha256 in the row equals the blob on disk; the entry command
  names the path; verdicts, scope and owner are stated; the selftest cell is stated or explicitly `—`.
- Gate rule carried forward: a gate's selftest must exercise the production inputs it claims to guard.
  See mistake M3 below.

## 4. Lesson draft — `## Mistakes` (observed only; unavailable items labelled)

M1. Quote column off by one in the worksheet generator (r[5] instead of r[6]).
  - Observed: R68Sentinel F5 (MED) found the committed worksheet with quote `-` on all 49 rows,
    because r[5] is bgHits, which is `-` on `line` rows.
  - Observed: the counter now reads r[6]; P1/P2 show the regenerated output matches the committed
    file byte for byte; no `-` quotes remain.
  - Observed: red receipt `controls/c1-red-quote-column.json` shows the pre-fix counter's gate
    selftest failing the green case with `quote-mismatch: 3`.
  - Lesson: derive column indices from the header row by name, not by position. (Not yet
    implemented in the lane counter; R68Exec1 wrote a header-name version as a proposed file only.)

M2. C2 selftest does not read the production EXPECTED list.
  - Observed: R68Mut2 M10 removed `scripts/verify-live-r67.mjs` from EXPECTED. The mutant
    survived the internal selftest (selftest passes `['tool.mjs']`) and was caught only by public
    CLI fixtures.
  - Observed: R68Mut2 kill table: 2 of 11 mutants were killed by the internal selftest; 9 of 11
    were caught only by the public parser (M02, M03, M05, M06 among them).
  - Lesson: a selftest that uses its own expected list cannot guard the production list. Add a
    case that loads the production gate with the production EXPECTED.

M3. C1 accepted degenerate or swapped quotes and lane self-adjudication (review finding, earlier version).
  - Observed: R68Exec1 noted that `includes()` lets a forged quote `-` pass `quote-unresolved`.
  - Observed: current gate has `quote-degenerate` (quote `-` or under 8 characters),
    `quote-off-line` (quote present in file but not on the cited line), and `adjudicator-author`
    (lane identity check). Selftest cases for each exist in the 19-case list.
  - Status: the current file covers these; the pre-fix version's failures are not kept as files
    beyond the receipts named above.

M4. `--json` argv handling in both new gates.
  - Observed: `controls/argv-json-before-after.txt` records a pre-fix run with `--json` and a
    post-fix run. The pre-fix bytes are stated as "kept in attempt-1 receipts", which I did not
    find in the lane. Pre-fix output is UNAVAILABLE to this seat.
  - Observed now: both gates parse `--json` as a boolean flag (P3, P5 rc 0).
  - The exit-code line after the usage text in that file reads `exit=0`; that is inconsistent with
    a usage error, and I did not reproduce it. Labelled UNVERIFIED.

M5. Selftest constant defined after use.
  - UNAVAILABLE: I did not find this in the current files, and no receipt names it. Not claimed.

M6. K1 note line range 163 versus 165.
  - UNAVAILABLE: no K1 note exists in round-67 or round-68 files that I could find. The only
    `r163`/`r165` hits are in round-67 R67Reviewer1.md about mado-shokunin PROVINCE.md lines,
    unrelated. Not claimed.

## 5. Pre-freeze claim candidates (not frozen; no non-author adjudication exists)

C1 — adjacency adjudication worksheet, 49 contested-open rows.
  - Evidence: P1-P4 above. Worksheet is pinned to the r66 ledger and snapshot by sha.
  - Status for every row: pending-non-author. No row has an adjudicator, verdict, reason or date.
  - This is a pending worksheet. It is NOT adjudication. No non-author has judged any row.
  - Axis and do-nothing question: the claim proves the worksheet matches the ledger; it does not
    prove any row is correct. A do-nothing comparison would leave the 49 rows contested-open; the
    worksheet adds no verdict. The claim deserves its axis only as a coverage/binding claim.

C2 — registry repair for seven r67 instruments in SKILL.md.
  - Evidence: P5-P6 live pass. Mut2 shows the selftest misses production-list drift (M2).
  - Do-nothing: the seven r67 instruments stay unregistered at the registry home (r67 spotcheck D1).
  - The claim deserves its axis for the registration; the gate's selftest weakness (M2) should be
    closed before the claim counts as gate-verified.
  - Unobserved here: whether the section is the only registry home; whether the sha pins match
    the committed blobs at the freeze commit (the gate checks disk, not git history).

C3 — docs-held `synthesizeScrollGesture` knowledge from Chromium 155 Input PDL (S173).
  - Evidence: NONE in this seat. I did not open any Chromium PDL source, and I did not fetch any
    quote. Any quote or version claim would be invented.
  - Status: unverified. It needs a primary source, a pinned quote, a location and an access date
    before it can be a candidate row.
  - Do-nothing question: unanswered by this seat.

## 6. Open items for L1

- Decide whether M2 (C2 selftest does not read production EXPECTED) is fixed before freeze.
- Replace position-based column reads in the C1 counter with header-name lookup (M1 hardening).
- Supply the pre-fix `--json` receipts or drop the claim that they exist (M4).
- Supply the K1 note and the selftest-const receipt, or drop M5 and M6.
- C3 needs a primary source before it can be scored.

No product files, git state, or sibling files were touched. Own scratch deleted.
