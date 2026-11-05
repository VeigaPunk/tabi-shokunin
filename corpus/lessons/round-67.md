# Round 67 — lesson

Round 67 (attempt 1, Linux host). Base `5400136b233579f7b716ab83a70b8be24ed88b26`. Pre-freeze evidence and
instruments `019efae0d84fd4cb19ac4230b02d2bc9dd190b57`. Claim freeze `e0fc04c2aab996325442b005944ce053832b9ce9`
(`.ufo/waves/round-67/claims.json`). Scored receipts: `.ufo/waves/round-67/scored/` (scored at the freeze revision).
Wave `w1`: 13 seats, one v1 wave, all settled, none dead (`.ufo/waves/round-67/w1-results.json`).

Outcome. Three claims were designed: C1 (adjacency, lowest owned axis, score 8), C2 (calibration, score 9),
C3 (coverage, capability `chromium-hscroll-domain-linux`, score 9). C1 was withdrawn before freeze: its own
do-nothing and no-regression controls refuted the rule. C2 and C3 were frozen and verified on their frozen
predicates. The round is not admitted, because C1 was the lowest-axis claim and is withdrawn.

## Gate

Opened 2026-11-05. Every row was opened in this round; the located quote is in the staged file.

| Candidate | Decision | Located evidence / flip |
|---|---|---|
| S172 CSSOM View Module, section 3.1 Scrolling and section 13.3 Event summary (Editor's Draft rev 909869d6b501d19e4bf632e458848f3c81af425f) | Admit, tier A, `spec`, scope "scrollend firing and scroll completion (when a scroll sequence has ended); not scroll timing or wheel-to-scroll latency" | URL https://drafts.csswg.org/cssom-view/ ; access 2026-11-05; staged `.ufo/waves/round-67/w1/R67Scout/sources/cssom-view-live.html` sha256 `e8f4fbda…a71f4a6`, 1,084,848 B. Quotes (grep -n on the staged file): line 2016, section 3.1 Scrolling: "when the scroll position has no more pending updates or translations and the user has completed their gesture." (18 words). Lines 4736-4737, section 13.3 Event summary: "the scroll sequence has ended and any scroll offset changes have been applied." (14 words; the preceding text is split by markup). Flip: a claim about scrollend timing or latency is not grounded by this row. |
| S167 CSSOM View Module, `scrollTop` getter (existing row) | Not re-cited as a new row; same URL, different scope | The census contract allows cross-scope duplicates (W04 warning only; S171 duplicates S157). S172 uses a distinct scope. |
| S166 MDN WheelEvent (existing row) | Cited in the knowledge note for delta semantics; not re-opened this round | Registry row; the note does not rest a claim on it. |
| Withdrawn C1 disposition rule (BG-word evidence per disposition, `v23`) | Reject as a source and as a predicate | Not a source. Refused by the committed ledger: 95 of 95 `no-tabi-ground` rows contain a BG word (`.ufo/waves/round-67/w1/R67Connector/report.md`). Flip: a semantic adjudication record per row that a counting rule can read. |
| CSSOM View, `scroll-completed` definition as a timing source | Reject for timing | Defines completion, not a time bound. Flip: a source that states a latency for the Chromium build. |

Registry census: before 171 rows (`.ufo/waves/round-67/census-start.txt`, exit 0); after S172 is appended: see the round report.

## Claims — measured

### C2 — calibration (receipt-provenance gate, repo-escape repair)

| Measurement | Command (frozen after-argv in `claims.json`) | Observed |
|---|---|---|
| v3 on the escape fixture (before) | `node .ufo/waves/round-66/counters/check-receipt-provenance-v3.mjs --dir c2/fixture/X/repo/controls --repo c2/fixture/X/repo --json` | exit 0, `ok true`, `failures 0` (accepts `../outside.mjs`) |
| v4 on the same fixture (after) | `node .ufo/waves/round-67/counters/check-receipt-provenance-v4.mjs ...` | exit 1, byCheck `matrix-input 1`, detail exactly `input escapes repo: ../outside.mjs` |
| v4 selftest | `... --selftest --scratch <ABS> --json` | verdict clean, 17 of 17, exit 0 |
| mutants M-E1 (guard removed), M-E2 (startsWith('..') only), M-E3 (absolute only) | `... --selftest` on each copy | each red: 15/17, 16/17, 15/17 (exit 1) |

Verdict on the frozen predicate: **verified**. Disclosed change: the v3 selftest case `matrix-input-relative-dir-base` moved its synthetic controls dir inside the synthetic repo, because the spec-literal escape refusal breaks that case otherwise; the expectation is unchanged. Limit: absolute paths outside `--repo` remain accepted by design (explicit, not a normalisation escape).

### C3 — coverage (capability `chromium-hscroll-domain-linux`)

| Measurement | Command (frozen after-argv in `claims.json`) | Observed |
|---|---|---|
| no-work base | `git ls-tree -r --name-only 5400136b -- corpus/evidence/round67/ \| wc -l` | 0 |
| live verifier, two cold runs | `node scripts/verify-live-r67.mjs --scratch <ABS> --driver scripts/chrome-cdp-loopback-round67.mjs --expect-driver-sha256 b7cd3b1d… --counter .ufo/waves/round-67/counters/chromium-hscroll-r67.mjs --evidence corpus/evidence/round67/chromium-hscroll-scrollend/receipt.json --evidence-shots corpus/evidence/round67/chromium-hscroll-scrollend --json` | exit 0 (see scored summary) |
| counter on the committed receipt | `node .ufo/waves/round-67/counters/chromium-hscroll-r67.mjs <receipt> --driver ... --expect-driver-sha256 b7cd3b1d… --shot <dir> --json` | exit 0, predicate true |
| selftest | `... --selftest --scratch <ABS> --json` | 37 of 37 |
| 35 declared negatives | `make-negatives-r67.mjs` | 35 refused, forgedGreen 0 |
| 13 exact-line mutants | `mutate-r67.mjs run` | 13 applied, 13 accept the live receipt, 13 killed, 0 survive |
| degenerate drivers M-A (no wheel), M-B (no scrollend), M-C3 (page overflow hidden) | counter on each receipt | exit 1 each (13, 23, 6 findings) |

Verdict on the frozen predicate: **verified**; the capability row enters `SCORECARD.md`.
The degenerate control M-C2 (clipped container) is an equivalent mutant: the window still scrolls, so both the
driver and the counter stay green; it is recorded as equivalent, not as a survivor.

### C1 — withdrawn before freeze (adjacency, lowest owned axis)

Designed rule: an `overlap-declared` delta line must quote a BG word; a `no-tabi-ground` line must quote none.
Refuted by four committed controls, all before the freeze:

- Unmutated v23 on the r66 adjudicated ledger: exit 1, predicate false, findingCount 95, all `delta-disposition-evidence`
  (`.ufo/waves/round-67/w1/R67Executor1/report.md`).
- Connector pre-measure: 95 of 95 `no-tabi-ground` rows refused; zeroHit 0 for every disposition
  (`.ufo/waves/round-67/w1/R67Connector/report.md`). The meter admits only line rows with a BG hit
  (`delta-line-invented`), so the `no-tabi-ground` branch cannot be satisfied by any legal row.
- Independent v22 flip sweep: 298 of 298 flips accepted; the do-nothing baseline is green on every flip
  (`.ufo/waves/round-67/w1/R67MutTester2/report.md`).
- Reviewer 1: "rule unsound as proposed" (`.ufo/waves/round-67/w1/R67Reviewer1/report.md`).

Lesson: BG words are lexical; the disposition is an adjudication of meaning. A counting rule cannot decide it from
the quote. The flip sweep the executor built was vacuous because the base was already red (its 54 "kills" are the
red base, not the flips). Nothing was frozen on this rule.

## Mistakes

Each row: class · evidence pointer · captured-by · fix. A fix counts only with its red state shown.

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| `number-drift` (own) | `.ufo/waves/round-67/measure/smoke1/receipt.json`: `REFUTED`, legs `overscroll`/`boundary` at 1000 under a 960 expectation. The fixture's 19 bands of 120 px overflow a 2240 px container, so the true max is 2280 - 1280 = 1000. | the smoke run itself (not a criterion) | container set to 2280 px; expectations 1000; green state `measure/smoke3/receipt.json` CONFIRMED and counter exit 0. Caveat: smoke1 embeds the superseded driver version; it is provenance, not a control for the frozen predicate. |
| `vacuous` (own, driver) | `.ufo/waves/round-67/measure/smoke2/receipt.json`: driver `CONFIRMED` while the nonce grid rendered black. The counter's `nonce-pixels` check failed (`R67Executor3` live counter exit 1; 256 cells black). The fixture had dropped the `#noncegrid i` white-cell rule. | the frozen counter's `nonce-pixels` check (the driver checks no pixels) | the rule restored; green state `measure/smoke3`. Criterion 123 added. |
| `scope` (own, disposition design) | the r67 C1 rule; `R67Executor1` unmutated v23 exit 1, 95 findings; `R67Connector` 95/95 refused, zeroHit 0 | pre-freeze controls (executor sweep, connector pre-measure, MutTester2 baseline) | C1 withdrawn before freeze; the record is in `claims.json` `withdrawn`. Criterion 125 added. |
| `survivor` (own, counter) | `.ufo/waves/round-67/w1/R67Executor3/report.md` (controlDerived mutants: M11 shot dimension clause and M13 host prefix clause survived; both `redundant`, a sibling clause caught the same negative). The pre-fix rerun output was overwritten by the post-fix battery in `controls/c3`; the seat report is the surviving record of the pre-fix state. | the mutant harness (survivor list) | isolating negatives `shot-bytes-dims` (1280x901 with the checked pixels unchanged) and `host-identity-prefix` (`HeadlessChrome/155`, same major): 35 negatives, 13 of 13 killed (`controls/c3/mutants.json`). |
| `scope` (gate F7, carried from r64/r66) | `.ufo/waves/round-66/counters/check-receipt-provenance-v3.mjs` accepts `../outside.mjs` (exit 0); reviewer 2 found five escape vectors accepted (`.ufo/waves/round-67/w1/R67Reviewer2/vectors.tsv`). The v3 selftest had no out-of-repo red case. | none (no red case existed; criterion 124 is about do-nothing controls, not this gate) | v4 refuses relative escapes incl. symlink (realpath); red state v3 exit 0, green state v4 exit 1 with the exact detail `input escapes repo: ../outside.mjs`; selftest 17/17. Absolute outside paths remain accepted by design (limit). |
| `stale-premise` (own, control) | degenerate-driver control M-C (`#wide` 1280 px): the seat's run showed bands still overflow the page, so the control was invalid; M-C2 (clipped container) is equivalent (both greens). | the seat's behavioural check (driver's own leg measurements) | M-C3 (page `overflow:hidden`) refutes at scrollLeft 0 (counter exit 1); M-C2 recorded as equivalent. Criterion 124. |
| `vacuous` (own, control runner) | `controls/c3/degenerate/INVALID-M-A-no-wheel-syntax`: the copy had an unbalanced parenthesis, so the driver exited 1 with no receipt; the counter's exit 2 was a missing-receipt refusal, not a verdict. | the missing receipt (no false green) | replaced the full statement; M-A now exit 1 with `REFUTED`, legs all 0. |
| `scope` (carried pointer, r66 S171 row) | round-66 lesson and report cite `corpus/SOURCES.md:186`; `grep -n S171` returns 185 (r66 spot-check §1). | the round-66 spot-check | errata below; no rewrite of r66. |

## Criteria added this round

Criteria 123-125 are in `corpus/QUALITY.md`, each citing this lesson.

## Errata — round 66

- Round 66's lesson and report cite the S171 row at `corpus/SOURCES.md:186`. `grep -n '^| S171' corpus/SOURCES.md` returns line 185 (r66 spot-check §1, conformance defect). The row is unchanged; the pointer is corrected here, append-only.
- Round 66's `claims.json` carried `frozenAt: "pending-commit"`; the freeze commit was `b1ecd665` (r66 spot-check §7 item 5). Corrected here: round 67's claims record `frozenAt` as `pending-commit` too and the freeze commit is recorded in this lesson and in the SCORECARD block (an in-file edit after freeze would itself be a change).

## Frontier and limits

- Adjacency is the lowest owned axis (score 8) and has no admitted move this round. The lexical disposition rule is refuted; a counting predicate cannot decide disposition meaning. Routed to the operator as an L0 question (`.ufo/l0-questions.md`).
- Horizontal scroll coverage is one Chromium build on Linux, one fixture, one run pair. Not claimed: smooth scrolling, trackpad phases, real sites, other engines.
- The driver's receipt records the host scratch and the Chromium stderr head (wave Sentinel F3/F4, low severity); receipts carry no secrets.
- Absolute outside-repo matrix inputs remain accepted by the gate (explicit paths; not a normalisation escape).

## Wave and disposition

One v1 wave `w1`, 13 seats: scout 1, connector 1, executor 4, scribe 1, reviewer 2, critic 1, mutation-tester 2, sentinel 1.
Attack seats 5 of 13 (38 %). The L1 holds the planner seat. Dead seats: none (`.ufo/waves/round-67/w1-results.json`).
Residual call: none. Tools installed: none (`node v24.21.0` pre-existing; Chromium 155.0.8059.84 pre-existing).
Assimilation: none — `considerthese/` is absent in this lane; the round-57 quarantine register shift remains an open L0 (adoption stays closed).
