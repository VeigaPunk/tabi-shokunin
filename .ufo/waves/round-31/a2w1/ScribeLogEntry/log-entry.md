## Round 31 — 2026-10-26 — sourced rate/crawl decision thresholds (depth) and the calibration window over SKILL.md and corpus/README.md

Claims frozen before data at `.ufo/waves/round-31/claims.json` in commit
`9505a10eb80b2a0b273ebaba3f7f872ad302192d`, baseline `96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc`, with a do-nothing and
a junk control scored per claim before any claim data (`.ufo/waves/round-31/baseline/`, `controls-summary.txt`): C1 ran
five — do nothing, rows already in the registry, self-quote receipts offline and live, invented thresholds, package
copied as-is; C2 ran four — do nothing, stale lines deleted, uncited correction, wrong-document citation. Axis scores at
round start: depth 8, coverage 9, operability 9, freshness 9, calibration 9, adjacency 8. The lowest non-retired axis is
a tie at 8 (depth, adjacency) and the lane's prompt axes are coverage and calibration, so C1 works depth and C2 works
calibration; stagnation nudge inactive, no axis retired.

C1 depth: a decision table from an observable rate or crawl signal to exactly one driver action, each row carrying the
source's own number (`corpus/knowledge/rate-signal-decision-table.md`, D1–D13 — five rows from S119 RFC 9309, six from
S121 GitHub REST rate limits, two from S122 GitHub best practices, every row citing one registry row opened this round
and one quote the counter re-locates in committed receipt bytes and in the live page). S120 RFC 6585 is cited in the
entry's prose for 429 semantics and sources no row: its only numbers are a specimen response and an example body, which
the entry's own prose and QUALITY criterion 80 exclude. C2 calibration: the self-assessment counter's tally window
extended to `SKILL.md` and `corpus/README.md`, with same-document line citations and no section fallback, and its oracle
changed from the first tally token in a gate's output to that gate's own summary line
(`scripts/check-selfassessment.mjs`, v2); the nine stale statements the extension finds are corrected by paragraphs
appended at the end of their own documents, and nothing above a cited line was edited.

Counting commands and readings. The L1 substitutes its final revision for `<MEASURED>`; the after readings quoted here
are measured at `486048356f0712e4396588c9dab58cd419243120`, the before readings at the freeze tree. Every run was in a
clean checkout (`git status --porcelain` empty) with the counters byte-identical to `claims.json §frozenDigests` — the
blobs at `4860483` hash to `d15f3bd7…f6832` for `scripts/check-decision-table.mjs` and `143d66ff…b2fce` for
`scripts/check-selfassessment.mjs`, and the freeze revision's blobs hash to the same values
(`baseline/frozen-counter-sha256.txt`, re-derived in `w1/RevFreeze.md`).

- C1 — `node scripts/check-decision-table.mjs --rev <MEASURED> --baseline 96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc --entry corpus/knowledge/rate-signal-decision-table.md --live --json`.
  Before: population 0, admitted 0, failing 0, exit 1 —
  the entry is absent (`baseline/c1-J1-do-nothing.json` and `.exit`). After: population 13, admitted 13, failing 0,
  `live: true`, exit 0 (`measure/c1-live-at-4860483.json` and `.exit`). Target: admitted at least 10 with failing 0. The
  offline arm reads the same 13 admitted at the same revision (`measure/c1-offline-at-4860483.json`), so `--live` adds
  the re-fetch of each row's own URL, not rows.
- C2 — `node scripts/check-selfassessment.mjs --rev <MEASURED> --json`. Before: mismatches 9, the nine stale statements at
  `SKILL.md:1614`, `:2479`, `:2514`, `:2515`, `:2529`, `:2530`, `:2543`, `:2544` and `corpus/README.md:613`, exit 1. After:
  mismatches 0, exit 0, with 51 statements compared and agreeing, 29 superseded (of which the nine this round's
  appended corrections clear — each verified `superseded: true` at the revision) and 103 could-not-evaluate
  (`measure/c2-at-4860483.json`). The document condition held too: `git diff --numstat <freeze> 4860483 -- SKILL.md
  corpus/README.md SCORECARD.md LOG.md` reads 22/0, 25/0, 4/0 and no LOG.md change, i.e. zero deleted lines, and
  `git diff --name-only <freeze> 4860483 -- scripts/` is empty.

Frontier step: registry rows S119–S122 in `corpus/SOURCES.md` (opened 2026-10-26, status `mined`, eleven cells each,
`used-by` the new entry; row population 118 at the freeze, 122 at the landed work), receipts
`corpus/evidence/round-31/decision-table/S119.json`–`S122.json` with the fetched bytes under `bytes/` (S119 25,265 B
`f633915d…b207`; S120 17,164 B `f6d55d1b…6e58`; S121 337,116 B `3a33f87b…f755`; S122 328,088 B `b15c1c0b…a33e`), lesson
`corpus/lessons/round-31.md` (Gate, Assimilation none, Mistakes M1–M10), QUALITY criteria 80–81, the round-31 rows in
`corpus/README.md`, and the routed `SCORECARD.md:1523` correction.

Waves. w1 held 32 seats: 9 executor, 9 scribe, 5 critic, 3 reviewer, 2 connector, 2 mutation-tester, 1 scout, 1
sentinel (`w1-dispatch.json`, `w1/swarm-registry.json`). a2w1 also holds 32 seats, re-cut for falsification: 9 critic, 7
reviewer, 9 executor, 2 mutation-tester, 2 connector, 2 scribe, 1 scout (`a2w1-dispatch.json`). a2w1 is the attempt-2
redispatch of attempt-1 wave w2, which was abandoned unspawned — `w2.ready.dispatched` records, at
2026-10-26T09:04:54, that no seat was spawned after the attempt-1 L1 died with the orchestrator host crash (the salvage
commit's own message dates it 2026-10-26 ~08:50 -03), and `a2w1.ready.dispatched` marks the redispatch under the new
wave name at 09:26:26. The lane branch tip
`ae15a37ee8aa43964179a676a087604368cd1c41` is the orchestrator's salvage commit adding only `.ufo/waves/round-31/`
state on top of the landed work; it is not a landed round.

Counter holes disclosed. Both counters were frozen before data and were not changed, so these w1 falsifier findings
bound what the readings above certify. C1: `admitted` counts rows and no cross-row rule exists, so ten rows built on one
12-word RFC 9309 sentence and one new registry row reach admitted 10 live (`w1/CritC1Axis.md` Q2, `pad-live.json`); the
matched number need not be a threshold — a status code (429), the RFC's own number (6585), a table-of-contents section
number and the pronoun "one" all pass, and neither the unit nor the bound word is compared against the quote
(`w1/CritC1Counter.md` A1–A6); receipt bytes are checked against the receipt's own digest only, never against the
receipt's url (C); `--live` is ambient — `HTTPS_PROXY` with `SSL_CERT_FILE`, or a `curl` earlier in `PATH`, admits a row
with no packet reaching the cited host, a 200 error page that echoes the quote passes, and the fetched url need only be a
substring of the registry source cell (`w1/SentinelC1Live.md` findings 1–3); 60 targeted mutants of its own checks left 16
alive, mostly on untested boundaries (`w1/MutC1Counter.md`). C2: a stale tally written as a word numeral is invisible
(`SKILL.md:1559`, "eight", against the gate's own figure), seven tally shapes the windows do not parse, a gate whose
summary spells its count `cli_cases=` can never be read, a line naming two gates pairs its first tally with both, a
receipt or population count on a line naming a gate is read as that gate's tally, and a correction paragraph's stated
number need not be bound to its script (`w1/CritC2Counter.md` FN-1–FN-3, FP-1–FP-4, SG-1–SG-3); a could-not-evaluate
finding never fails the counter, so a tree where every gate blob differs reads zero while comparing nothing, and the
oracle ignores whether the gate's own checks pass (`w1/RevCountersCode.md` items 3 and 4). QUALITY criterion 80 states
the stronger row-by-row reading the C1 counter does not enforce, and criterion 81 fixes the summary-line oracle.

Routed defects. Handled this round: round-30 routed defect 2 (the calibration oracle must read a gate's own summary
line, not the first tally token in its output) is C2's frozen counter v2, with a red state in `baseline/m8-proof/` — the
same counter with the summary-line rule removed fails its regression probe; and the routed `SCORECARD.md:1523` sentence
("mismatches 0 after the round-30 corrections above") is corrected by an appended paragraph citing that line, the two
committed round-30 readings (3 at `0ffc6ea0`, 1 at `d3cd62a1`) and the cause recorded as lesson M3. Carried, named and
not claimed (`claims.json §notClaimed` and the lesson Mistakes table): the counter-v2 items for
`scripts/check-gate-mutants.mjs` and `scripts/check-frontier-admission.mjs` (round-30 routed defect 3) and the
release-pin counter v2 (defect 4), the six frontier-pointer defects of round 30 (M9), and the round-27 L0 question on
S114/S140. Assimilation is none: the register digest is unchanged, staged S126 — the same GitHub rate-limits page as
S121 — stays refused, the lane opened the four pages by document with its own fetches, bytes and quotes, used no package
bytes, rows or entry text, and adopted no staged row (`w1/RevAssimDecision.md`, `w1/ExecAssimGuard.md`; collisions
S102–S118 only).

Re-verification result. Each of the four pages was fetched three times 130–131 s apart with identical normalised text and
no redirect (`w1/ExecLiveStability.md`). S119's five selected spans pass the counter's row predicates against its
committed bytes (`w1/FetchS119.md`, `S119-recommended-rows.json`); S120's spans are located in its committed bytes except
the `meta refresh` element, which no row quotes (`w1/FetchS120.md`); the `--live` arm re-fetched each admitted row's own
URL and located its quote, which is what admitted 13 with failing 0 records, so live presence is the counter's reading
rather than a seat's claim. S121's two fetches 81 s apart returned distinct raw digests with identical normalised text,
so the receipt's `sha256` binds the committed bytes while the live re-fetch compares normalised text
(`w1/FetchS121.md`); S122's two fetches were byte-identical (`w1/FetchS122.md`). Each of the nine corrected statements
re-cleared only by a paragraph naming its own script, citing its own line in its own document and stating the gate's own
figure (`w1/ExecC2Verify.md`), and S120 sources no row, its numbers being a specimen response and an example body
(`w1/CritSourceChoice.md`). The final measurements at `<MEASURED>` are the L1's; no reading in this entry is taken at a
revision other than the one it names.

Round-31 commit ledger (lane `master`): `9505a10e` claims freeze, both frozen counters (the C1 decision-table counter
is new; the C2 self-assessment counter is v2), controls and their receipts, the SKILL.md registry rows and the
SCORECARD.md freeze-time corrections; `4860483` the C1 entry with rows S119–S122, four receipts and committed bytes,
the C2 appended corrections in SKILL.md and corpus/README.md, the routed SCORECARD.md:1523 correction, QUALITY 80–81,
the README frontier rows and lesson round-31; `ae15a37` the orchestrator's salvage of unlanded wave state, after which
attempt-1 wave w2 was abandoned unspawned and attempt-2 wave a2w1 dispatched. The measured commit and the final
measurements follow and are named in the report.
