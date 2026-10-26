# ScribeErrataB — round 32 w1, carried errata E10–E18 re-checked (routed defect 4)

Lane `tabi-shokunin`, read at `4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6` (tracked tree clean; every lane read
read-only). Deliverable: `.ufo/waves/round-32/w1/ScribeErrataB/errata-B.md`, one block per erratum with either an
append-only correction draft (target document, append point, cited line) or a refusal with reason and flip condition.

## Verdict

Of the nine carried errata, six still hold against current bytes exactly as written, one holds with a corrected
clause, one holds in a stronger form than carried, and one is documentation drift inside frozen script bytes;
dispositions are **five corrections** (three landable drafts: `SKILL.md` EOF citing `:2575` for E12/E13/E14 plus
E10's limit clause, `corpus/lessons/round-31.md` EOF citing `:163` for E17, `SCORECARD.md` EOF citing `:1582` for
E18), **one no action** (E11 verified: `-q` is argv[1] at `scripts/check-decision-table.mjs:195`, and curl 8.23.0's
manual states the first-parameter rule), and **three refusals** (E15: the only false sentence is in the frozen
script header and no tracked document repeats it; E16: closed-vocabulary gaps are false-negative-only and asserted
by no document; each refusal carries a flip condition). Every correction is append-only at EOF with zero deleted
lines, and I measured their window safety rather than assuming it: with the drafts extracted from the written file,
appended to a fresh clone at the freeze revision and committed (`1396dc5f`), the frozen v3 calibration counter
returns an identical finding set (18 counted / 104 refused / 21 superseded; 26/0, 10/0 and 11/0 line changes, set-equal
findings), so the corrections are curation and clear none of C2's 18 counted mismatches. Three re-checks were made
by execution, not by reading: E12 reproduces exit 1 with a stack and no verdict line, E13 is stronger than carried
(a table row without its trailing pipe yields a *clean* exit 0 with one row never read), and E18's vacuity is
measured (an all-refused fixture prints `verdict=clean` and exits 0 at `could_not_evaluate=1`).

## Dispositions

| Erratum | Re-check | Disposition |
|---|---|---|
| E10 fetch failures all read `l1-live` | holds on refusal; carried text overreaches on the pass side (`:211-213` establishes 200, https, same host, quote) | correction — Draft A bullet 4 |
| E11 `-q` only as argv[0] | holds; `:195`, `man curl` line 1111 | no action |
| E12 uncaught `RangeError` | holds, reproduced (exit 1, 0 stdout bytes, no verdict line) | correction — Draft A bullet 1 |
| E13 silent table parse | holds; measured *clean* pass with a row dropped | correction — Draft A bullet 2 |
| E14 literal pipe in a registry row | holds, reproduced; no live instance (122/122 rows parse) | correction — Draft A bullet 3 |
| E15 cache key vs one-GET header | holds; script-header bytes only, no document repeats it | refusal |
| E16 closed-vocabulary gaps | holds; false negatives only | refusal |
| E17 `git()`/`curlFetch` inherit the environment | holds; `:100-102` vs `check-selfassessment.mjs:104` | correction — Draft B |
| E18 `could-not-evaluate` never gates | holds at v3; `:538`, `:1084`; 104 refused vs 18 counted | correction — Draft C |

## Evidence

Measured facts, each with the artefact that carries the bytes:

- Counter digests at the freeze equal `claims.json` `frozenDigests`: `check-selfassessment.mjs` `77b5c8ed…c6a9`,
  `check-bidi-runtime.mjs` `2f25af5a…c393`; `check-decision-table.mjs` is the round-31 `d15f3bd7…f6832`.
-, C2 at `4181fff`, v3 bytes, clean clone, JSON to a file: **18 counted + 104 refused + 21 superseded + 52 agreeing
  = 195 findings** (refusals 27 m1 / 76 m2 / 1 m4) — `c2-v3-at-4181fff.json`.
- C2 at `9505a10e`, v2 bytes `143d66ff…2fce`, its own clean clone: **9 / 103 / 20** — this is where the carried
  "103" figure comes from; `c2-v2-at-9505a10-clean.json`. A v2 run given the `4181fff` working copy read 5 / 114 and
  is **discarded** (`gateTally` refuses a gate whose blob differs from the working copy) — a live demonstration of
  why the measurement rule names a clean checkout at REV.
- E12: fixture receipt bytes carrying `&#1114112;` → exit **1**, stdout 0 bytes, `RangeError: Invalid code point
  1114112` at `check-decision-table.mjs:141`, no `DECISION_TABLE verdict=` line (`probe-A-entity.txt`).
- E13: two-row table, second row without its trailing pipe → exit **0**, population 1, admitted 1, `clean: true`
  (`probe-B-truncate.txt`).
- E14: registry row with `https://example.org/a | b` in its source cell → exit **1**, reason `r1-row-missing`
  although the id is in `corpus/SOURCES.md` (`probe-C-piperow.txt`); registry audit 122 rows, 0 with a pipe count
  other than twelve.
- E18: fixture whose only tally names a gate absent at the revision → exit **0**, `verdict=clean …
  could_not_evaluate=1`, `mismatches 0` (`probe-D-vacuous.txt`).
- E11: `man curl` (8.23.0) line 1111 — "If used as the first parameter on the command line, the curlrc config file is
  not read or used"; `:195` puts `-q` first.
- E15: `grep -rn "one read-only HTTPS GET\|one GET per\|per cited row url\|per cited url" --include=*.md .` (lane
  root, excluding `.ufo/`) → no hits, exit 1.
- Window safety: drafts extracted from the written `errata-B.md`, appended to a fresh clone at `4181fff`, committed
  `1396dc5fbb07b58440dd0e9ffe93be27ade44af6`; `git diff --numstat 4181fffb HEAD` = `26 0 SKILL.md`,
  `10 0 corpus/lessons/round-31.md`, `11 0 SCORECARD.md`; counter → 18 / 104 / 21, identical counted lines, finding
  sets set-equal (157 deduplicated keys, 0 only-before, 0 only-after) — `c2-v3-after-drafts-window-test-final.json`.
- Draft hygiene on the extracted text: no gate-naming line carries one of the four `TALLY_PATTERNS`
  (`check-selfassessment.mjs:130-135`), no `nudge active|inactive` phrase, no `## Round N` heading (Draft C
  deliberately omits it so m4 opens no empty round group).

Commands and exit codes (all lane reads read-only; runs in scratch clones/fixtures under
`$HYAKU_SCRATCH/tabi-r32/ScribeErrataB`, `TMPDIR` passed explicitly):

| # | command | exit |
|---|---|---|
| 1 | `git -C <lane> rev-parse HEAD` | 0 → `4181fffb…d1e6` |
| 2 | `sha256sum scripts/check-decision-table.mjs scripts/check-selfassessment.mjs scripts/check-bidi-runtime.mjs` | 0 |
| 3 | `git clone --shared <lane> "$S/clone"`; `checkout -q --detach 4181fff…`; `git status --porcelain` | 0; 0 lines |
| 4 | `node scripts/check-selfassessment.mjs --rev 4181fff… --json > c2-v3-at-4181fff.json` | 1 |
| 5 | clone at `9505a10…`; `node scripts/check-selfassessment.mjs --rev 9505a10… --json > …` | 0 / 1 |
| 6 | `node scripts/check-decision-table.mjs --repo <fx A> … --json` | 1 |
| 7 | `node scripts/check-decision-table.mjs --repo <fx B> … --json` | 0 |
| 8 | `node scripts/check-decision-table.mjs --repo <fx C> … --json` | 1 |
| 9 | `node scripts/check-selfassessment.mjs --repo <fx D> --rev <h> --json` | 0 |
| 10 | `node scripts/check-selfassessment.mjs --rev 1396dc5f… --json` | 1 (identical finding set) |
| 11 | registry pipe audit (`awk -F'\|' '/^ {0,3}\|[ \t]*S[0-9]{3,}', count pipes per row)` | no output; 122 rows |
| 12 | GET-cardinality `grep -rn … --include=*.md .` | 1 (no hits) |
| 13 | `man curl \| col -b \| grep -A4 "^ *-q"` | 0 |
| 14 | `pgrep -fa "chromedriver\|chromium" \| grep ScribeErrataB` | 1 (none) |

## Corrections to the input errata itself (recorded, not silently absorbed)

1. **E10's pass-side clause is wrong.** "a `--live` pass and a `--live` refusal are equally uninformative about
   cause" — a pass establishes 200, https, the row's own host and the quote present (`:211-213`). Only a refusal is
   cause-blind.
2. **E18's line pointers are v2-era.** "`evaluate` 438-446 per the seat, `main` ≈881" — at the v3 bytes `evaluate`
   returns at `:517-540` (`clean` at `:538`) and `main` exits at `:1084`.
3. **"103" is not round 32's figure.** It is v2 at `9505a10e` (re-measured: 103). At `4181fff` with v3 bytes the
   refusal count is 104. Quote either with its revision and bytes.

## Out of scope, limits

- No public page was fetched and no browser or driver was started, so no fetch receipt and no browser-process
  cleanup line exist: the entries are counter behaviour, not source content.
- No lane tracked file, counter, claim, control or measured reading was changed; the drafts are prose appended to
  document ends and cannot make C2's after-zero true (they clear none of the 18).
- E18's vacuity survives in bytes; the correction limits what a reader may say about the figure.
- Citations are positional: any insertion above `SKILL.md:2575`, `round-31.md:163` or `SCORECARD.md:1582` moves them,
  which is why every draft is at EOF. Those three lines were md5-checked against the `4181fff` blobs and match.
- The lane worktree changed after my reads: six tracked documents carry 329 inserted lines from other seats (0
  deletions, none containing my draft text — `grep -c "cover evaluated rows only" SKILL.md SCORECARD.md` = 0). My
  reads were taken while `git status --porcelain` was empty, so every `path:line` is the `4181fff` byte; each named
  append point is to be read as the document's current EOF.
- Scratch `/fast/scratch/hyaku/tabi-r32/ScribeErrataB` and `…-verify` are deleted; nothing of mine remains under
  `/fast/scratch/hyaku/tabi-r32`.

## Artefacts

`.ufo/waves/round-32/w1/ScribeErrataB/`: `errata-B.md` (the deliverable, with the three landable drafts),
`anchors.txt`, `c2-v3-at-4181fff.json`, `c2-v3-after-drafts-window-test-final.json`,
`c2-v3-after-drafts-window-test.json`, `c2-v2-at-9505a10-clean.json`, `probe-A-entity.txt`,
`probe-B-truncate.txt`, `probe-C-piperow.txt`, `probe-D-vacuous.txt`.
