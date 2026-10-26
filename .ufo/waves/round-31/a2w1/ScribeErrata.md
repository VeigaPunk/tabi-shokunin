# ScribeErrata — round-31 wave a2w1: append-only errata for wave-1 findings the `4860483` landing has not absorbed

Seat ScribeErrata (leaf, scribe). Lane `tabi`. Measured rev `486048356f0712e4396588c9dab58cd419243120`; freeze
`9505a10eb80b2a0b273ebaba3f7f872ad302192d`; baseline `96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc`; lane tip
`ae15a37` (adds only `.ufo/waves/round-31/` state — verified below).

## Verdict

I read the frozen claims and the round-31 lesson at `4860483`, then the verdict and findings sections of all 26
wave-1 reports that carry findings (nine end to end: `CritC1Axis`, `ScribeLessonMistakes`, `SentinelC1Live`,
`RevCountersCode`, `CritC2Counter`, `ExecC2Oracle`, `CritC2Axis`, `ConnClaims`, `ScribeC2Corrections`; the rest at
verdict depth plus the findings list),
and drafted **43 append-only erratum lines** for the wave-1 findings the landing does not record: **27 carried** to round
32, **12 corrected in the block itself** (9 as their only disposition, 3 as the written rule with the instrument carried
with them), and **4 `no action` with the reason stated**. Nine findings of the wave were *already* absorbed by the
landing (the m8-proof `cases=29 passed=28` denominator, the `befe2a3f` scratch-revision caveat, the `cli_cases=` gap,
the repetition/status-code admissions, the controls-vs-observables gap, the six frontier pointers, the three-fetch live
stability, S120 sourcing no row, the assimilation guard proof), so they are not restated. The high-value unabsorbed
items are: the `--live` oracle's ambient provenance (`HTTPS_PROXY` + `SSL_CERT_FILE` + `PATH` admit a row with zero
egress — SentinelC1Live F1); the `could-not-evaluate` vacuity of C2's `mismatches 0` (RevCountersCode C2-3, probe P5);
the round's total corrections being 13, not 9 (CritC2Axis F6); the axis-label risk of a calibration delta that lives
outside `SCORECARD.md`/`LOG.md` (CritC2Axis F1); `SKILL.md:1559`'s stale "eight isolated CLI cases" that no window can
see (CritC2Counter FN-1, still present at `4860483`); the landed frontier row's "multi-script lines stay unchecked",
which is the **opposite** of the counter's measured behaviour (CritC2Counter FP-1, code at `:221-227`); and M7's own
pointer citing `TALLY_PATTERNS`, a constant nothing reads. No product code, counter, claim, control or reading was
changed; no counter, gate or lane script was run by this seat.

## What I attacked, and what I did not

- **Attacked:** the completeness of the `4860483` landing's record against the wave-1 body of evidence. For each wave-1
  finding I decided one of three dispositions and, where the finding is a defect in the *record*, wrote the corrected
  statement into the errata block (claims are frozen, documents append-only, so a claim-prose defect can only be
  recorded — the assignment names exactly this for CritC1Axis Q1).
- **Not attacked / not repaired:** nothing was repaired. No claim was re-scored, no counter re-run, no row re-read, no
  fetch made, no lane tracked file edited. The C1/C2 readings quoted in this report are the wave-1 seats' and the L1's,
  attributed each time; I neither reproduced nor corroborated them.
- **Ambition limits:** I did not audit the four row-draft reports (`ScribeRows*`), `ScribeSourcesRows`, or
  `ExecAssimGuard` beyond their absorption into the lesson's Gate section and selection note; their outcome (which rows
  were kept and dropped) is already recorded in the Gate prose.

## Evidence — commands and exit codes

All read-only, in the lane checkout (no clone: this seat runs no lane script, so no working tree was needed). Full
transcripts: `.ufo/waves/round-31/a2w1/ScribeErrata/evidence/verify-at-4860483.txt`,
`…/evidence/absence-checks.txt`, `…/evidence/lane-tip-vs-4860483.txt`.

| # | command (cwd = lane root) | exit | reading |
|---|---|---|---|
| 1 | `git show 4860483:scripts/check-decision-table.mjs \| sha256sum` | 0 | `d15f3bd7…f6832` = `claims.json.frozenDigests` |
| 2 | `git show 4860483:scripts/check-selfassessment.mjs \| sha256sum` | 0 | `143d66ff…2fce` = `frozenDigests` |
| 3 | `git diff --name-only 9505a10 4860483 -- scripts/ \| wc -l` | 0 | `0` — no gate bytes moved from freeze to REV |
| 4 | `git show 4860483:corpus/lessons/round-31.md \| sha256sum` vs `sha256sum corpus/lessons/round-31.md` | 0 | `00ac53a4…8e98fd` both — the lesson in the tree is the `4860483` blob (294 lines) |
| 5 | `git diff --stat 4860483 ae15a37 -- ':!.ufo'` | 0 | empty — the tip adds only `.ufo/waves/round-31/` state, so `4860483` readings hold at the tip |
| 6 | `git diff --stat 4860483 -- SKILL.md corpus/README.md corpus/QUALITY.md corpus/lessons/round-31.md SCORECARD.md` | 0 | empty — no worktree edits to the documents the absence checks read |
| 7 | `git show 4860483:scripts/check-selfassessment.mjs \| grep -n TALLY_PATTERNS` | 0 | one hit, `122:` — the constant is defined and never read (E5) |
| 8 | `… \| sed -n '189p;199p;203p;216p;221p;223p;227p'` | 0 | `m1Findings` at `:189`; claim patterns `:199`, `:203`; `claims[0]` paired with every line script at `:221-227` (E5, E25) |
| 9 | `git show 4860483:SKILL.md \| sed -n '1559p' \| grep -o 'eight isolated CLI cases[^\|]*'` | 0 | `eight isolated CLI cases assert exit and stable finding` — stale tally still in bytes (E22) |
| 10 | `git show 4860483:SKILL.md \| sed -n '2469p'` | 0 | `(cases=12, measured round 24; the earlier "eight isolated CLI cases" figure is superseded)` — prose, no `:1559` citation (E22) |
| 11 | `git show 4860483:corpus/knowledge/host-published-rate-limit-headers.md \| sed -n '96,97p;105p'` | 0 | the two S117-sourced numbers behind E1 |
| 12 | `git show 4860483:corpus/knowledge/rate-signal-decision-table.md \| grep -c '^\| D'` | 0 | `13` rows |
| 13 | `… \| grep -n '^```' \| wc -l` | 0 | `0` fenced blocks — E13's parse holes are latent here |
| 14 | `… \| grep -n '^frontier:'` | **1** | no `frontier:` tag — the no-harm frontier population stays 2 (ConnClaims row 8 constraint honoured) |
| 15 | `git show 4860483:corpus/README.md \| sed -n '686p'` | 0 | the landed C2 frontier row's "multi-script lines stay unchecked" (E25) |
| 16 | `git show 4860483:corpus/QUALITY.md \| grep -n '^80\.\|^81\.\|^82\.\|Round 31 additions'` | 0 | `455` heading, `80.` `457`, `81.` `472`, no `82.` |
| 17 | `… \| grep -cE '^[0-9]+\. '` | 0 | `81` criteria — criterion 82 not landed (E35) |
| 18 | `git show 4860483:SKILL.md \| sed -n '/## Round 31 — corrections/,$p' \| grep -c '^- `scripts/'` | 0 | `8` bullets |
| 19 | `… \| grep -c 'scripts/[a-z0-9-]*\.mjs.*scripts/'` | **1** | `0` — no correction bullet names two scripts (E29) |
| 20 | lesson `grep -c` for `proxy`, `SSL_CERT`, `soft-404`, `1559`, `RangeError`, `couldNotEvaluate`, `RUNNABLE_GATE`, `multi-script`, `word numeral`, `ambiguous`, `13 across`, `held ground`, `host-published` | 0 each | `0` — absence evidence for E1, E6–E10, E18, E22–E25, E34 |

Nothing was piped into `jq` (the round's truncation trap); every counter output this seat read was a committed file or a
wave-1 receipt, not a live run.

## Coverage — wave-1 report by report

| w1 report | already recorded at `4860483` | errata items |
|---|---|---|
| `CritC1Axis.md` | Q2 repetition + status-code admission (M10); Q3 S120 sources no row (Gate prose) | **E1** (Q1 overstatement), **E2** (Q4 actor/scope) |
| `CritSourceChoice.md` | the defect class is M10's | **E3** (example values admitted; J4 cannot see them) |
| `ScoutProvince.md` | candidate-threshold ground (Gate prose) | **E1** (its §1 contradicts the claim's "before" sentence) |
| `ScribeEntryProse.md` | row selection (Gate prose) | **E4** |
| `SentinelC1Live.md` | the hermetic-argv half (M4) | **E6, E7, E8, E9, E10, E11** |
| `RevCountersCode.md` | none | **E12–E21** (C1-1…C1-6, C2-3…C2-9) |
| `CritC2Counter.md` | `cli_cases=` (M7); dead-constant consequence (E5) | **E22, E23, E24, E25, E26, E27, E28, E29** |
| `CritC2Axis.md` | m8-proof denominator (M1 limit); `befe2a3f` (M2 limit); the freeze-correction set (claims.json) | **E24** (F4), **E33** (F1), **E34** (F6, F3) |
| `ExecC2Oracle.md` | `cli_cases=` (M7); the M8 trap's mechanism (M1) | **E24, E32** |
| `ExecC2Verify.md` | the correction shape actually landed | **E30** (positional citations), **E31** (reading d) |
| `ConnClaims.md` | — | **E30**, **E25/E26** (rows 11), **E34** (row 1 coupling) |
| `ConnSiblings.md` | — | **E41** |
| `MutC1Counter.md` | — | **E37** |
| `MutC2Counter.md` | the M1 no-section-fallback red state (lesson "Corrections to freeze-time receipts") | **E38** |
| `ExecLiveStability.md` | three fetches 130 s apart, identical normalised text (Gate) | **E43** (qualification only) |
| `ExecNoHarmBaseline.md` | — | **E43** (freeze reading not a closure reading) |
| `ScribeQuality.md` | criteria 80-81 landed | **E35** (criterion 82), **E36** (verdict-blind oracle) |
| `ScribeC2Corrections.md` | the landed corrections at `SKILL.md`/`corpus/README.md`/`SCORECARD.md` | none (shape verified: 8 single-script bullets, E29) |
| `RevAssimDecision.md` | S126 refusal stands, id doctrine, collisions (Gate prose) | **E39** (URL identity), **E40** (refusal bases) |
| `FetchS119/S120/S121/S122.md`, `ScribeSourcesRows.md`, `ExecAssimGuard.md`, `ScribeRows*`, `ScribeLessonMistakes.md`, `RevFreeze.md` | receipts, guard proof, selection, M1–M10 and both receipt corrections are in the lesson | none new; `ScribeLessonMistakes`' six "must not lose" findings map to M1/M2/M7/M8/M9 and corrections section, all present |

## Findings about the landing itself (not about wave 1)

1. **One landed sentence is contradicted by the code it describes.** `corpus/README.md:686` says "multi-script lines
   stay unchecked"; `scripts/check-selfassessment.mjs:221-227` pairs `claims[0]` with every script on the line, so such
   a line is *checked* (fixture F1: claimed 13, observed 7, counted, exit 1). The errata block states the true
   behaviour (E25) and recommends a counter-v2 case; the row's bytes stay as landed (append-only).
2. **M7's own pointer is a dead-code line.** `corpus/lessons/round-31.md:212` cites
   `scripts/check-selfassessment.mjs:122-127`; that constant is never read. The mechanism is at `:189-203` (E5). The
   *finding* is unaffected — `cli_cases=36` is invisible to the grammar that actually runs.
3. **A stale self-description line survives the round's own after-0.** `SKILL.md:1559` reads "eight isolated CLI
   cases"; the gate measures 12, and the round-24 row at `SKILL.md:2469` says so in prose without citing `:1559`, which
   the frozen rule cannot credit. E22 records it as carried; the fix is a `:1559`-citing append in a parsed tally shape.
4. **Two coupling constraints held and were verified, not merely asserted.** The decision-table registry row
   (`SKILL.md:2575`, `cases=34`) is the only C1→C2 tally coupling and is oracle-true; the landed entry carries no
   `frontier:` tag, so the no-harm frontier population is still 2 (command 14, exit 1). No action needed (E34, E43).

## Gates and axes

- **Gates run by this seat: none.** No counter (`check-decision-table`, `check-selfassessment`), no lane gate, no
  build/lint/formatter. The two `--live`/`--offline` readings, the C2 before/after values and the no-harm matrix in this
  report are quoted from the L1 and the wave-1 seats; they are not this seat's measurements, and the assignment did not
  ask for them.
- **Axes:** unaffected either way. The errata repair the *record* (depth of accounting: what the round knows about its
  own instruments) and neither add rows nor change a count. If anything, E1 and E33/CritC2Axis F1 make the round's
  self-description more honest at no cost to the claim predicates.

## Touched surfaces

- Written (only these, all under the seat's own output directory):
  - `.ufo/waves/round-31/a2w1/ScribeErrata/errata.md` — the block for `corpus/lessons/round-31.md` under
    `## Wave findings carried`, 43 items, append-only, no lane document edited.
  - `.ufo/waves/round-31/a2w1/ScribeErrata/evidence/verify-at-4860483.txt` (22 commands, 22 exit codes),
    `…/evidence/absence-checks.txt` (per-keyword absence + pointer checks),
    `…/evidence/lane-tip-vs-4860483.txt` (tip differ by `.ufo/` only).
  - `.ufo/waves/round-31/a2w1/ScribeErrata.md` — this report.
- Lane tracked files: **none** edited; lane git index and jj state: untouched; no commit, no clone, no fixture repo.
- Scratch `/fast/scratch/hyaku/tabi-r31/ScribeErrata` (with `TMPDIR` pointed at it) was created and removed; nothing
  written under `/tmp`, under the fleet root, or in any sibling lane.
- Network: **none** — no fetch, no credential, no session material. Tools installed or upgraded: **none** (no pacman,
  no `uv`, no `npx`; the pacman guard was not exercised).

## Out of scope (deliberately not done)

- Appending the block to `corpus/lessons/round-31.md` — the L1 owns the lesson; this seat delivers the text.
- Repairing any item: the C1 counter's provenance and parse holes, the C2 counter's vacuity and grammar, the axis-label
  wording, criterion 82, the sixteen surviving C1 mutants, the three unproven C2 behaviours are all left as findings
  with their dispositions. Claims are frozen; counters are frozen.
- Re-measuring C1/C2 at `4860483` or at the tip; re-running the freeze controls; re-fetching any page.
- Reading the four row-draft reports in full and the assimilation executor beyond its Gate record.

## Known limits of this report

- "Not recorded" means: no hit in `corpus/lessons/round-31.md` at `4860483` for the finding's substance, checked by
  keyword and by reading M1–M10 plus both correction paragraphs, **and** no statement of it in QUALITY criteria 80–81,
  the `SCORECARD.md` round-31 sections, or the `corpus/README.md` round-31 rows where a criterion or row could carry it.
  A finding absorbed only in prose I did not think to grep for would be a false "not recorded"; the per-report table above
  is the audit trail for that judgement.
- The wave-1 numbers I quote (admitted counts, probe results, mutant tallies, `couldNotEvaluate 103`, the nine/13
  correction split) are the reporting seats' measurements. Two of them I did re-establish from lane bytes: the
  `SKILL.md:1559` staleness and the `claims[0]`-per-script pairing. I did not verify the rest.
- The L1's after-readings (population 13 / admitted 13 / failing 0 / live; mismatches 0; `couldNotEvaluate 103`) are
  the L1's and are used only as the state the errata describe, never as a check on them.
- Errata item counts: 43 total = 9 `corrected here` only (E1, E2, E5, E25, E34, E39, E40, E41, E42) + 3 `corrected here
  as a rule, carried as enforcement` (E3, E19, E36) + 27 `carried` (E4, E6–E10, E12–E14, E16–E18, E20–E24, E26–E28,
  E30–E33, E35, E37, E38) + 4 `no action` (E11, E15, E29, E43).

## Artifact paths

- Errata block: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-31/a2w1/ScribeErrata/errata.md`
- Receipts: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-31/a2w1/ScribeErrata/evidence/`
  (`verify-at-4860483.txt`, `absence-checks.txt`, `lane-tip-vs-4860483.txt`)
- Report: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-31/a2w1/ScribeErrata.md`
