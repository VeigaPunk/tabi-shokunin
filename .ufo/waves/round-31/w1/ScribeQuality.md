# ScribeQuality — frontier step, QUALITY.md drafts (round 31, w1)

**Verdict.** The three criteria are drafted and every command in them was run before it was written:
append-ready additions **80, 81, 82** to `corpus/QUALITY.md` (highest criterion at the freeze is 79
at line 446; file 453 lines), each with one-sentence rule, a command, and its lesson citation. Axis
the block carries: the lane's written bar — depth (C1's threshold rule, 80), the round-30 M8 oracle
(81), and C2's window scope (82). Two measurements the block rests on are new this wave rather than
repeated from the claims: (i) a gate's `<NAME>_SELFTEST` prefix does not delimit its summary —
`scripts/check-aria-metadata.mjs --self-test` prints **62** such lines, one carrying `verdict=`,
none carrying `cases=`, and its summary spells the count `cli_cases=36 helpers=4`, so the frozen v2
oracle returns could-not-evaluate for a gate whose tally two window documents state; (ii) the oracle
reads `cases=N` without reading `verdict=`, so a gate that did not run
(`MEASUREMENT_BINDING_SELFTEST verdict=could_not_evaluate cases=0 reasons=0`, exit 2) would be read
as a tally of **0**. Criterion 82 lands over two measured gaps — `corpus/QUALITY.md` (5 tally lines,
criteria 65/67/74/75/76) and `corpus/knowledge/webmcp-chromium-loopback-round-16.md` (1 line) state
gate tallies outside the calibration window with no declaration — and the criterion states them
rather than assuming them away; a red→green run shows the pipeline clears once the two sentences
exist. No lane file was edited, nothing under `scripts/` was touched, and no network fetch was made.

## Deliverable

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-31/w1/ScribeQuality/quality.md` —
  criteria 80–82, append-ready, plus the measurement table and four integration notes.
- Receipts beside it in `…/ScribeQuality/receipts/`: `aria.out` (62-line aria self-test output),
  `self-freeze.json` (frozen v2 counter at 9505a10), `dt-selftest.txt`,
  `mb-could-not-eval.out`, `window-scripts.txt` (27 window-cited scripts), `dated2.txt` (330 tally
  lines in the 177 dated-record documents).

## Readings I was given, and what I did with them

- `.ufo/waves/round-31/claims.json` — read first, as instructed: C1 `admitted >= 10, failing 0` with
  before 0; C2 `mismatches 9 → 0`, 0 deleted lines; frozen digests for both counters;
  §assimilation "none this round".
- `.ufo/waves/round-31/baseline/README-receipts.md` — read second: controls C1 J1–J5, C2 J1–J4,
  `c1-counter-selftest 34/34`, `c2-counter-selftest 30/30`, `m8-proof` 28/30 exit 3.
- `.ufo/waves/round-31/baseline/m8-proof/` cited by criterion 81 as the able-to-fail state; I did not
  re-run the controls (the receipts are the artefact; re-running them is the verifier's job).
- `corpus/lessons/round-30.md` §M8 (two tallies on one line; counter read the first `cases=`),
  `corpus/lessons/round-30-verifier-spotcheck.md` §Routed defects 1–4. `corpus/lessons/round-31.md`
  does not exist yet (the L1 writes it from drafts), so criteria cite its `#mistakes` section by
  path, exactly as criterion 78 cites `round-29-verifier-spotcheck.md` without an M-number.

## Evidence (one scratch clone at 9505a10, `git status --porcelain` 0 before and after every run)

| What | Command | Exit | Reading |
|---|---|---|---|
| numbering | `grep -nE '^[0-9]+\. ' corpus/QUALITY.md \| tail -1`; `wc -l corpus/QUALITY.md` | 0 | `446:79.`; 453 lines |
| C1 counter self-test | `node scripts/check-decision-table.mjs --selftest` | 0 | `DECISION_TABLE_SELFTEST verdict=clean cases=34 passed=34` |
| counter admits a value-only quote | case `threshold-thousands-separator`, `scripts/check-decision-table.mjs:354` | — | `exit 0, admitted 1` on `"The limit is 5,000 requests per hour."` |
| criterion 80's force-class awk | fixture with a `MUST` row, a value row, the peer's lower-case conditional (D14) and its example-response row (D6) | 0 | `D1 UPPER`, `D2 none`, `D14 lower`, `D6 none` |
| criterion 82 population | shape grep over `git ls-files '*.md'`, descriptive trees only | 0 | 6 documents / 66 lines: SKILL.md 32, SCORECARD.md 26, corpus/QUALITY.md 5, corpus/README.md 1, LOG.md 1, webmcp-chromium-loopback-round-16.md 1 |
| criterion 82 gap | same pipeline + `grep -qF "$f is outside the calibration window"` | 0 | prints `corpus/QUALITY.md`, `corpus/knowledge/webmcp-chromium-loopback-round-16.md` |
| declaration red→green | append one declaration sentence to each of the two clone files, rerun, `git checkout --` both | 0 | red: 2 paths; green: 0 paths; clone restored (0 porcelain lines) |
| excluded dated-record class | same shape grep restricted to `.ufo/`, `corpus/lessons/`, `corpus/evidence/` | 0 | 330 lines in 177 documents |
| criterion 81 population | `git grep -ohE 'scripts/[a-z0-9-]+\.mjs' -- SKILL.md SCORECARD.md LOG.md corpus/README.md \| sort -u \| wc -l` | 0 | 27 |
| criterion 81 survey, 3 of 27 | the loop from criterion 81 on aria / measurement-binding / sources | 0 | `verdict_lines/with_cases` = `1/0`, `1/1`, `1/1` |
| aria summary shape | `node scripts/check-aria-metadata.mjs --self-test` | 0 | 62 `ARIA_METADATA_SELFTEST` lines; 1 with `verdict=`; 0 with `cases=`; 0 `N/M`; summary `verdict=clean cli_cases=36 helpers=4` |
| could-not-evaluate prints `cases=0` | move `scripts/selftest-measurement-binding.mjs` aside in the clone; `node scripts/check-measurement-binding.mjs --self-test`; restore | 2 | `MEASUREMENT_BINDING_SELFTEST verdict=could_not_evaluate cases=0 reasons=0`, stderr `selftest child absent: …` |
| frozen C2 counter at the freeze | `node scripts/check-selfassessment.mjs --rev 9505a10… --json` | 1 | `mismatches 9`, `couldNotEvaluate 103`, `superseded 20`, 174 findings |

## Findings

1. **Two window lines state a tally the oracle cannot measure, and no instrument sees them.**
   `SCORECARD.md:1199` and `SKILL.md:2474` state aria's self-test tally as
   `cli_cases=36, helpers=4`. The frozen v2 oracle looks for `\bcases\s*[=:]\s*(\d+)` inside a
   `_SELFTEST` line; `cli_cases` has no word boundary before `cases`, so `gateTally` finds no
   summary and no fallback (the output contains no `N/M`), i.e. could-not-evaluate. Separately the
   counter's claim shape also requires `\bcases`, so those two lines are not even *claims*: the
   freeze run reports **no finding at those lines at all**. Consequence for C2: `mismatches 0` at
   REV will not mean "every stated tally was checked" — two window lines are outside both the shape
   and the oracle. Criterion 81 states the rule that closes this (a gate that spells its count
   otherwise is outside the oracle, and the document must say its tally is unread or bring the gate
   in). Severity: **medium** — it is a blind spot in the calibration axis, not a false pass of C2's
   own predicate.
2. **`case=N` without `verdict=` turns "not run" into zero.** `check-measurement-binding.mjs:787`
   and `:798` print `verdict=could_not_evaluate cases=0 reasons=0` (exit 2) when the self-test child
   is absent or fails to spawn; I triggered it by moving the child aside in the clone. The v2
   summaries regex accepts any `_SELFTEST` line carrying `cases=`, so that summary reads as tally
   **0**. M8's class is fixed; this adjacent class is not. Criterion 81 requires the verdict.
   Severity: **medium** (requires a broken child to fire; then it silently inverts a "did not run").
3. **Criterion 80 lands a constraint the frozen counter does not enforce, and needed a case rule.**
   `n1-threshold-sourced` compares the threshold number against the quote; the counter's own
   `threshold-thousands-separator` case shows a value-reporting quote admitted at `admitted 1` with
   `exit 0`. So `failing 0` cannot distinguish "the source says to do X within N" from "the source
   reports N and the author chose the action". After `ScribeEntryProse` applied the shape to its
   15-row hand-off two seams surfaced and are now settled in the criterion: (a) case — a lower-case
   "you should not" inside a conditional is the page's directive and counts as a quoted force
   (class `lower`), while capitals are reserved for RFC 2119 keywords, so D14's `(derived)` marker is
   unnecessary; (b) an example/specimen response block (D6's `HTTP/1.1 429 … Retry-After: 3600`) is
   class `none` *and* inadmissible, because an instance is not a statement, so that row is re-sourced
   instead of marked. The awk returns the three classes (`D1 UPPER`, `D14 lower`, `D2`/`D6` `none`).
   Severity: **informational for C1 as frozen** (the claim never asserted force/scope), **medium for
   the prose draft** (a folded marker would have let a sample value pass as a declared limit).
4. **The bar document itself is outside the calibration window.** `corpus/QUALITY.md` carries 5
   gate-tally stamps (criteria 65, 67, 74, 75, 76) and no declaration; nothing reads the file. The
   drafted criterion 82 names it and the webmcp knowledge entry as the two gaps, with the exact
   sentence that closes each, and the red→green run proves the pipeline clears. Severity: **low**
   (one sentence per document), but uncounted without the criterion.

No conflict between sources; nothing contradicted the freeze. Where I first over-counted (a shape
without `\b` matches `cli_cases=36`, adding two documents to the population), the block uses the
counter's shapes and the note records the observation.

## Peer coordination (provenance, not verification)

`ScribeEntryProse` read criterion 80 from my output dir and applied it to its 15-row hand-off: 9 rows
now carry `<verb> (derived)` (D4, D6–D12, D14), and its entry prose states at
`entry-prose.md:37-45` that the action is the one the declared limit implies. It flagged two seams,
both settled in the criterion (see finding 3): the lower-case conditional "you should not" is class
`lower` and admissible as a quoted force, so D14's marker is unnecessary but harmless; an example
response block is class `none` and must be re-sourced, not folded into `(derived)`. It also reports
that `t3-decision` still passes with the markers, which is what the loop above predicts (the cell
begins with a closed-set verb). Its artifact digests are peer-reported and were not re-computed by
me: `entry-prose.md` `a660ac57…`, `sourced-thresholds.md` `0c1ddb3a…`.

## Out of scope / not done

- No lane file written or edited; no lane git index, jj state, fleet repo or sibling lane touched;
  commits only inside the scratch clone, and none were needed.
- No `scripts/` run outside the scratch clone; no build, lint, formatting, or lane-wide gate sweep.
  Criterion 81's survey was run on 3 of its 27 scripts (aria, measurement-binding, sources); the
  other 24 were not run by me — the criterion says how to run them at landing and why it is slow.
- No network. The decision table's own C1 reading (`--live`, `admitted >= 10`) is the C1 seats'
  claim and was not measured here; `corpus/knowledge/rate-signal-decision-table.md` does not exist
  in the worktree yet, so criterion 80's awk was tested on a fixture (`D1`/`D2`), not on the entry.
- The frozen C2 counter was run once as a cross-check (exit 1, mismatches 9 — equal to
  `baseline/c2-J1-do-nothing.json`); the C2 before/after measurement and the append-only corrections
  are the C2 seats' and the L1's, not mine.
- No tooling install or upgrade was needed (nothing missing: node, git, jq, awk, grep all present).
- Scratch `$HYAKU_SCRATCH/tabi-r31/ScribeQuality/` removed after the receipts were copied into the
  output dir; nothing written under `/tmp`.

Report: .ufo/waves/round-31/w1/ScribeQuality.md
