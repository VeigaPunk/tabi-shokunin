# CritC2Counter — round 31 w1: first falsifier on check-selfassessment.mjs v2

**Verdict.** The frozen v2 counter is sound on the nine live tallies it can read — at
`9505a10eb80b2a0b273ebaba3f7f872ad302192d` it exits 1 with `mismatches 9`, all nine are
self-test tallies in gate-registry/frontier rows and all nine were already stale at the
baseline (sources 25 vs 26, selfassessment 13/17/20 vs 22, s106 5/7 vs 10, release-pins 20
vs 29, README 613 17 vs 22), so there is **no false positive among the counted** and no
false negative among the tallies its four shapes capture. Its coverage is nevertheless
narrower than C2's surface: at least 7 tally-bearing lines in the two new windows produce no
finding at all (one of them stale — `SKILL.md:1559` "eight isolated CLI cases" against the
gate's measured 12), 9 more are reported could-not-evaluate and excluded (7 ambiguous, 2
outside `RUNNABLE_GATE`), and the summary-line oracle cannot read a gate whose own tally token
is `cli_cases=` (check-aria-metadata prints `cli_cases=36 helpers=4`), so **`mismatches 0`
can be reached while those lines stay unchecked**. Three parsing/supersession defects that
are invisible at the freeze produce false positives on plausible shapes: a line naming two
scripts pairs the first tally with both (documented in `SCORECARD.md:1548-1552` but unchanged
in v2), a receipt/population count on a line naming a gate is read as a self-test tally, and
a correction paragraph's "stated correct number" need not be bound to its script — a date
(`10/26`) or a round range (`round-30/31`) supplies it. Cross-script clearing is blocked
unless the paragraph names the other script, and a combined multi-script correction paragraph
is self-defeating; the five-paragraph, one-script-per-paragraph correction shape is clean
(measured). Counter bytes, digest, clean-tree and before-reading all hold; findings are
recorded and the counter stays frozen.

## State and before-reading

- Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`; scratch clone
  `/fast/scratch/hyaku/tabi-r31/CritC2Counter/clone`, checked out at
  `9505a10eb80b2a0b273ebaba3f7f872ad302192d` (tree `ae297f3ba9a9ebdc2665c8e7c19db1999385a09a`).
- `sha256sum scripts/check-selfassessment.mjs` = `143d66ff2ba3fc2c113d461f1f2dd0555c94fb00b292e24eb4799e22dadb2fce`
  = `claims.json` `frozenDigests["scripts/check-selfassessment.mjs"]`. `git status --porcelain | wc -l` = 0.
- `node scripts/check-selfassessment.mjs --selftest --json` → exit 0, `{"cases":30,"passed":30,"ok":true}`.
- Reading at REV: `mismatches 9`, `couldNotEvaluate 103`, `superseded 20`, exit 1
  (`c2-freeze-run.json`). The nine counted:

| doc:line | script | claimed | observed |
|---|---|---|---|
| SKILL.md:1614 | check-sources.mjs | 25 | 26 |
| SKILL.md:2479 | check-selfassessment.mjs | 13 | 30 |
| SKILL.md:2514 | check-s106-evidence.mjs | 5 | 10 |
| SKILL.md:2515 | check-selfassessment.mjs | 17 | 30 |
| SKILL.md:2529 | check-s106-evidence.mjs | 7 | 10 |
| SKILL.md:2530 | check-selfassessment.mjs | 20 | 30 |
| SKILL.md:2543 | check-release-pins.mjs | 20 | 29 |
| SKILL.md:2544 | check-s106-evidence.mjs | 7 | 10 |
| corpus/README.md:613 | check-selfassessment.mjs | 17 | 30 |

- Baseline truth measured, not assumed: at `96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc` the four gates
  printed `SOURCES cases=26`, `SELFASSESSMENT cases=22 passed=22`, `S106 cases=10 passed=10`,
  `RELEASE_PINS cases=29 passed=29` (all exit 0). Every counted figure was therefore stale when
  written — none is a historical receipt wrongly promoted.

## Findings

### FN-1 (medium) — a stale self-test tally in the C2 surface the counter cannot see: `SKILL.md:1559`

`SKILL.md:1559` (round-1 registry row, gate `scripts/check-freshness.mjs`): "`--self-test`; **eight**
isolated CLI cases assert exit and stable finding". The counter parses digitis only, so the line yields
no claim and no finding. The gate's measured tally is 12 (`FRESHNESS_SELFTEST verdict=clean cases=12`,
exit 0) and the newest row (`SKILL.md:2469`) itself says `(cases=12 … the earlier "eight isolated CLI
cases" figure is superseded)`. Counterexample: a document whose only stale tally is written as a word
numeral reads `mismatches 0`. This is a live stale figure inside C2's declared surface that the count
does not cover.

### FN-2 (medium) — tally shapes with no extracted claim (7 lines, no finding at all)

| line | text shape | target | doc figure | measured | counter outcome |
|---|---|---|---|---|---|
| SKILL.md:1559 | "eight isolated CLI cases" | scripts/check-freshness.mjs | 8 | 12 | no finding (word numeral) — **stale** |
| SKILL.md:1988 | "original11 cases" | round-18 harness (no `scripts/` path) | 11 | n/a | no finding (digits fused to the word) |
| SKILL.md:2030 | "`--self-test`:38" | .ufo/waves/round-18/measure-c1.mjs | 38 | 38 (cases array length) | no finding (colon form) |
| SKILL.md:2031 | "`--self-test`:26" | .ufo/waves/round-18/measure-c2.mjs | 26 | 26 (`cases=26`) | no finding (colon form) |
| SKILL.md:2032 | "`--self-test`:38" | .ufo/waves/round-18/measure-c3.mjs | 38 | 38 (`cases=38`) | no finding (colon form) |
| SKILL.md:2474 | "cli_cases=36, helpers=4" | scripts/check-aria-metadata.mjs | 36 | 36 cli + 4 helpers | no finding (`\bcases` fails at `_`; oracle also unreadable — FN-3) |
| corpus/README.md:591 | "selftests 17/17 and 18/18" | bfcache / source-reopen gates | 17, 18 | 17, 18 | no finding (fraction needs a `--self-test` prefix) |

The four parsed shapes are `` `--self-test` … (N/M) ``, `N-case`, `cases=N`, `N cases`; `--self-test`:N,
`cases: N` (colon), `selftests N/N`, `cli_cases=N`, word numerals and fused digits are not parsed by the
line scan (the colon form *is* parsed inside correction paragraphs — an asymmetry). The only stale line
of the seven is `SKILL.md:1559`; the rest are correct-but-unverified.

### FN-3 (medium) — the summary-line oracle cannot read a gate's `cli_cases=` tally

`node scripts/check-aria-metadata.mjs --self-test` (exit 0) prints 61 `ARIA_METADATA_SELFTEST result=…`
lines and one verdict line: `ARIA_METADATA_SELFTEST verdict=clean cli_cases=36 helpers=4`. The v2 oracle
requires `^[A-Z][A-Z0-9_]*_SELFTEST\b[^\n]*?\bcases\s*[=:]\s*(\d+)`; `\bcases` does not match inside
`cli_cases`, and both fallbacks miss too (replayed on the captured bytes: `summaries 0 fallback null =>
could-not-evaluate: self-test printed no tally`). Fixture F11 cites the real gate script with
`(cases=36)`: the finding is `claimed=36 observed=null couldNotEvaluate="self-test printed no tally"`,
exit 0 — a wrong aria figure would never be counted. The document's 36 is correct today, but it is
unverifiable by this instrument.

### FN-4 (low) — nine lines in the two windows are could-not-evaluate and excluded from `mismatches`

Ambiguous association, no script on the line: `SKILL.md:1886` ("selftest 59 cases", historical at
`3254740`), `SKILL.md:2092` ("66 cases, 27 decisions", round-19 probe population), `SKILL.md:2471`
("(cases=9/9)", script path `.ufo/waves/round-12/…/check-claim-record.mjs` has no `scripts/` segment;
that gate does measure 9), `SKILL.md:2579` ("22-case tally", correction prose), `corpus/README.md:358`
("(43 cases)"), `:359` ("59 cases"), `:422` ("66-case population"). Script outside the runnable set:
`SKILL.md:2027` (`scripts/freshness-witness.mjs`, claimed 8, measured 8) and `SKILL.md:2028`
(`scripts/webmcp-invoke-round18.mjs`, "real12-case/four-control receipt"; that script rejects
`--selftest`, exit 2 `unknown argument --selftest`, so 12 is a receipt count, not a tally).
`RUNNABLE_GATE = ^scripts/(check-[a-z0-9-]+\.mjs|round-evidence-audit\.mjs)$` permanently excludes
`scripts/freshness-witness.mjs`, `scripts/webmcp-*.mjs`, `scripts/selftest-measurement-binding.mjs` and
every `.ufo/waves/**` gate; their tallies can never be counted.

### FP-1 (medium, documented, unchanged in v2) — a line naming two scripts pairs the first tally with both

Fixture F1: one line naming `scripts/check-a.mjs` (cases=13) and `scripts/check-b.mjs` (cases=7), both
correct → `SKILL.md:7 check-b claimed=13 observed=7`, `mismatches 1`. Only `claims[0]` is used and it is
applied to every script on the line. This is the exact behaviour recorded at `SCORECARD.md:1548-1552`
("the frozen calibration counter pairs each line's first tally with every script named on it"); v2 did
not change it and the new windows inherit it. No live SKILL/README line carries a tally plus two scripts
today (checked against the findings list), but nothing prevents the closure from creating one.

### FP-2 (medium) — receipt/population counts on a line naming a gate are counted as self-test tallies

Fixture F2: `| \`scripts/check-a.mjs\` | real12-case/four-control receipt |` with the gate at 13 →
`claimed=12 observed=13`, counted. Live analogue: `SKILL.md:2028`'s "real12-case/four-control receipt"
is excluded only because `webmcp-invoke-round18.mjs` fails `RUNNABLE_GATE`. Precedent in the older LOG
window: `LOG.md:1090`/`:1103` "66 cases" (the round-19 validation population) were counted against
`check-sources` (26) and needed an explicit prose withdrawal at `LOG.md:1912-1918` ("the sixty-six
figure at :1090 counts integration validation cases, not a `scripts/check-sources.mjs` self-test tally").

### FP-3 (low) — only the first claim on a line is compared; a later correct figure is ignored

Fixture F5: "earlier `--selftest` (5/5); now `--selftest` (13/13)" → `claimed=5 observed=13`, counted,
exit 1, although the same line states 13. Live rows use "(cases=N, passed=N)" (same number twice), so
no live instance; the same-line "was X, now Y" idiom cannot be used.

### FP-4 (by design, noted) — prose supersession without a line citation is invisible

`SKILL.md:2470` calls the 25 figure "superseded" and `:2560/:2561/:2576` restate the current figures, but
none cites the stale line, so 1614/2514/2515/2529/2530/2543/2544 still count. This matches the frozen
predicate (corrections must cite their stale line); the closure cannot rely on prose alone.

### SG-1 (medium) — supersession's "stated correct number" is not bound to its script

The clearing test is `statedTallyNumbers(paragraph).includes(observed)` over the whole paragraph, and
`statedTallyNumbers` accepts any `N/M` fraction. Fixture F6: a stale line `check-s106-evidence.mjs`
(claimed 7, observed 10) is cleared by "Correction: `scripts/check-s106-evidence.mjs` was re-measured on
**10/26** at `SKILL.md:5`" — the 10 comes from the date. Fixture F9: a stale line (claimed 17, observed
30) is cleared by "the round-**30/31** cutover left `scripts/check-s-selfassessment.mjs` untouched on
10/26" — the 30 comes from the round range. In both cases the paragraph never states the gate's tally,
yet the stale line is dropped from `mismatches` (`superseded=true`, exit 0). A wrong figure could thus
be retired by a coincidental number; nothing in the freeze corrections exercises this.

### SG-2 (low) — the correction marker matches "incorrectly"

`/supersed|correct/i` matches "incorrect"/"incorrectly". Fixture F7: "Incorrectly cited above:
`scripts/check-a.mjs` at `SKILL.md:1-8`; the run printed 13/13" clears a 5→13 line, exit 0. The number is
stated correctly, so the harm is the semantics of the marker, not the figure.

### SG-3 (medium, operational) — a combined multi-script correction paragraph is self-defeating

Fixture F3: one paragraph naming both scripts, citing `SKILL.md:1-8`, stating 13 and 7 clears both stale
lines (5→13, 6→7) but the paragraph itself is then counted as `check-b claimed=13 observed=7`, exit 1.
Fixture F4 (control): the same paragraph naming only `check-a` does **not** clear `check-b` — the
script-name gate holds, and range citations cannot clear another script's line unless that script is
named. Fixtures F8/F10: one paragraph per script, each citing every stale line of that script with exactly
one tally, read `mismatches 0` with all stale lines superseded. This is the shape the closure must use;
`SCORECARD.md`'s round-31 correction (30/30 citing 1439/1465/1486) already follows it.

## Commands and exit codes

Scratch clone (contract shape): `git clone --shared <lane> "$S/clone"`; `git -C "$S/clone" checkout -q
9505a10eb80b2a0b273ebaba3f7f872ad302192d`; `sha256sum` → `143d66ff…2fce`; `node v24.21.0`, `git 2.56.0`.

| command | exit |
|---|---|
| `git -C clone status --porcelain \| wc -l` → 0 | 0 |
| `TMPDIR=$S/tmp node scripts/check-selfassessment.mjs --rev 9505a10… --json` → mismatches 9, CNe 103, superseded 20 | 1 |
| `node scripts/check-selfassessment.mjs --selftest --json` → cases 30, passed 30, ok true | 0 |
| at `96a2d1a`: `node scripts/check-sources.mjs --self-test` → cases=26 | 0 |
| at `96a2d1a`: `node scripts/check-selfassessment.mjs --selftest` → cases=22 passed=22 | 0 |
| at `96a2d1a`: `node scripts/check-s106-evidence.mjs --selftest` → cases=10 passed=10 | 0 |
| at `96a2d1a`: `node scripts/check-release-pins.mjs --selftest` → cases=29 passed=29 | 0 |
| `node scripts/check-freshness.mjs --self-test` → `FRESHNESS_SELFTEST verdict=clean cases=12` | 0 |
| `node scripts/check-aria-metadata.mjs --self-test` → 61 result lines + `verdict=clean cli_cases=36 helpers=4` | 0 |
| `node .ufo/waves/round-18/measure-c1.mjs --self-test` → cases array length 38 | 0 |
| `node .ufo/waves/round-18/measure-c2.mjs --self-test` → `"cases":26` | 0 |
| `node .ufo/waves/round-18/measure-c3.mjs --self-test` → `"cases":38` | 0 |
| oracle replay on the aria bytes → `could-not-evaluate: self-test printed no tally` | n/a (snippet) |
| `node .ufo/waves/round-12/w1/mistake/check-claim-record.mjs --self-test` → `CLAIM_SELFTEST … cases=9/9` | 0 |
| `node scripts/webmcp-invoke-round18.mjs --selftest` → `unknown argument --selftest` | 2 |
| fixtures F1–F11 (`node <clone>/scripts/check-selfassessment.mjs --repo <fixture> --rev HEAD --json`) | F1 1, F2 1, F3 1, F4 1, F5 1, F6 0, F7 0, F8 0, F9 0, F10 0, F11 0 |

No network access was made (no HTTPS GETs); no tool was installed or upgraded. Fixtures are private git
repos under `$S/fx/`; `git -C "$F" rev-parse --show-toplevel` equals `$F` for each, commits use
`-c user.name=crit -c user.email=crit@scratch.local`, and no commit touched the lane.

## Impacted axes

- **calibration (C2, primary).** The nine counted are real and the before-reading is faithful; the zero
  target certifies nine lines, not the windows. FN-1 leaves a live stale tally (`SKILL.md:1559`) inside
  the declared surface; FN-3 makes one gate's tally permanently unreadable; FP-1/FP-2 can manufacture a
  mismatch on shapes the closure may legitimately write; SG-1/SG-2 let a stale line be retired by a
  coincidental number.
- **coverage (secondary).** Seven tally-bearing lines in the two windows are outside the instrument's
  grammar; the registry rows they sit in remain unmeasured by calibration.
- No other axis is harmed; nothing here touches depth, freshness, operability or adjacency.

## Smallest safe corrections (recorded, not executed — the counter stays frozen)

1. **Closure shape (no counter change, 0 deleted lines):** five end-appended paragraphs, one script each,
   every stale line cited, exactly one tally — e.g. ``Correction (round 31, supersedes `SKILL.md:2479`,
   `SKILL.md:2515`, `SKILL.md:2530`): `scripts/check-selfassessment.mjs` `--selftest` (30/30).`` and the
   same shape for s106 (2514, 2529, 2544 · 10/10), sources (1614 · 26/26), release-pins (2543 · 29/29),
   and `corpus/README.md:613` (30/30). Measured clean in F10. Do **not** combine two scripts in one
   paragraph (F3).
2. **Instrument (next freeze, not this round):** parse `cli_cases=` and `--self-test`:N / `selftests N/N`;
   treat a tally line naming two scripts as could-not-evaluate (or pair claims by position) and add the
   missing regression case to `CASES`; bind supersession numbers to the script (or require the tally shape
   adjacent to the script name); tighten the marker to `supersede|correction|corrected`.
3. **`SKILL.md:1559`** can only be retired by a correction paragraph that states the freshness tally in a
   parsed shape (as a word numeral it is invisible to any correction the counter could verify).

## Artifacts

`.ufo/waves/round-31/w1/CritC2Counter/`: `c2-freeze-run.json`, `c2-selftest-30.json`, `gate-tallies.txt`,
`aria-selftest.txt`, `counter-sha256.txt`, `fixtures/F1..F11.json` (+ each `SKILL.md`), all copied from
`/fast/scratch/hyaku/tabi-r31/CritC2Counter/` before scratch removal.
