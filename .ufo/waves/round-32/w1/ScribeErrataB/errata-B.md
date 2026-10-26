# errata-B — carried errata E10–E18 re-checked at the round-32 freeze

Round 32, wave w1, seat `ScribeErrataB`. Item: routed defect 4 — the carried errata queue
`.ufo/waves/round-31/a2w1/ScribeErrata/errata.md`, entries **E10–E18 by its own numbering** (nine entries).

Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`, read at HEAD `4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6`
(tracked tree clean; all reads read-only). Counter bytes at that revision: `scripts/check-bidi-runtime.mjs`
`2f25af5a…c393` and `scripts/check-selfassessment.mjs` `77b5c8ed…c6a9` (both equal `.ufo/waves/round-32/claims.json`
`frozenDigests`), `scripts/check-decision-table.mjs` `d15f3bd7…f6832` (the round-31 frozen digest, unchanged).

**Method.** Every re-check is against current bytes with `path:line`. Where a run was needed it was made in a
`git clone --shared` of the lane checked out at the revision, `TMPDIR` under `$HYAKU_SCRATCH/tabi-r32/ScribeErrataB`,
counter JSON **redirected to a file** (a pipe truncates these counters' output — carried errata E42, and hit once
in this seat's own session). No `--live` fetch of any public page was made: these entries are about a counter's
behaviour, not about a source. No browser process was started or used.

**Shape.** One block per erratum: the carried text, the re-check, the verdict, then either an append-only correction
draft (target document, append point, cited line) or a refusal with reason and flip condition. The three drafts are
collected verbatim in §Drafts. Nothing here edits a lane tracked file, a counter, a frozen claim, a control or a
measured reading; `scripts/` is unchanged.

## Dispositions

| Erratum | Subject | Re-check | Disposition |
|---|---|---|---|
| E10 | every fetch failure reads `l1-live` | holds; one clause of the carried sentence overreaches | **correction** — Draft A, bullet 4 (`SKILL.md`, cites `:2575`) |
| E11 | `-q` effective only as argv[0] | holds as written | **no action** (nothing to correct) |
| E12 | uncaught `RangeError` on an out-of-range entity | holds, reproduced: exit 1, no verdict line | **correction** — Draft A, bullet 1 |
| E13 | silent Markdown table parse failures | holds, and stronger: a dropped row can read *clean* | **correction** — Draft A, bullet 2 |
| E14 | registry row with a literal pipe reported `r1-row-missing` | holds, reproduced; no live instance (122/122 rows parse) | **correction** — Draft A, bullet 3 |
| E15 | `--live` cache keyed on (url, quote) vs the header's one-GET claim | holds; the false statement is script-header bytes, repeated in no document | **refusal** |
| E16 | closed-vocabulary gaps | holds; false-negative direction only | **refusal** |
| E17 | C1 `git()`/`curlFetch` inherit the operator environment | holds; the lesson's "hermetic" is wider than its own parenthetical | **correction** — Draft B (`corpus/lessons/round-31.md`, cites `:163`) |
| E18 | `could-not-evaluate` never fails the gate | holds at v3, measured: 18 counted vs 104 refused, and an all-refused run exits 0 | **correction** — Draft C (`SCORECARD.md`, cites `:1582`) |

## Blocks

### E10 — `l1-live` collapses every fetch failure into one reason

- **Carried text (round 31, `errata.md`):** every fetch failure reads `l1-live` — "Dead link, TLS failure, absent
  `curl`, host refusal and 'the quote is gone' are one verdict with stderr discarded"; C1 `--live` oracle, carried.
- **Re-check at `4181fffb` (`path:line`, lane bytes):** `scripts/check-decision-table.mjs:197` returns `null` on
  curl's nonzero exit; `:211` (`!res || res.code !== 200`) returns `false` for a 403/429/404; `:290` is the single
  `fail("l1-live")`. `spawnSync` captures stderr at `:195-196` and the buffer is never read. The self-test already
  pins the collapse: `live-non-200` (`:361`, code 404) and `live-fetch-failed` (`:362`, `null`) both expect
  `reason: "l1-live"`. **One clause of the carried sentence is wrong:** a *pass* is informative — `:212` requires
  https on the row's own host and `:213` requires the quote in the normalised bytes. What carries no diagnostic is a
  *refusal*, not both sides.
- **Verdict:** holds on the refusal side, with the pass-side clause corrected.
- **Disposition:** **correction** — Draft A bullet 4, target `SKILL.md`, appended after line 2627 (EOF), citing
  `SKILL.md:2575`. Labelled in the draft as an added limit, not a corrected sentence, because the registry row never
  claimed per-cause diagnosis.
- **Flip condition:** a document reads a `l1-live` refusal as a cause — the likely trigger is a later `--live`
  re-read of S121/S122 against a host that can answer 403/429 — or counter v2 splits the reason id.

### E11 — `-q` is effective only as argv[0]

- **Carried text:** "`-q` is effective only as argv[0] … any reordering of `curlFetch`'s argv silently re-enables
  `.curlrc` … **No action** — holds as written."
- **Re-check:** `scripts/check-decision-table.mjs:195` builds `["-q", "-sS", …]`, so `-q` is argv[1]. curl 8.23.0's
  own manual (`man curl`, `col -b`, line 1111) states: "If used as the first parameter on the command line, the
  curlrc config file is not read or used." The property holds at current bytes.
- **Verdict:** holds.
- **Disposition:** **no action** — nothing is false; the erratum is recorded as the invariant that any future edit to
  that argv must preserve.
- **Flip condition:** any edit that moves `-q` off argv[1] or inserts an option before it; then the `.curlrc` surface
  reopens and a correction is owed.

### E12 — uncaught `RangeError` on an out-of-range numeric entity

- **Carried text:** "`String.fromCodePoint` throws on `&#1114112;` … one malformed entity in a cited page's
  committed bytes kills the process with a stack and exit 1, no `DECISION_TABLE verdict=` line — and exit 1 is the
  declared 'failed' code."
- **Re-check:** `scripts/check-decision-table.mjs:138-142` decodes numeric entities inside `normalise()`, which runs
  for HTML bytes only; `:141` is the `String.fromCodePoint(parseInt(...))`. **Measured** (receipt
  `probe-A-entity.txt`): fixture receipt bytes `<!DOCTYPE html>…&#1114112;…`, invocation
  `node scripts/check-decision-table.mjs --repo <fx> --rev <head> --baseline <base> --entry corpus/knowledge/fx.md
  --json` → **exit 1**, stdout 0 bytes, stderr `RangeError: Invalid code point 1114112` at
  `check-decision-table.mjs:141`, no verdict line. The verdict contract (`main`: `process.exit(out.clean ? 0 : 1)`)
  is bypassed entirely.
- **Verdict:** holds, reproduced.
- **Disposition:** **correction** — Draft A bullet 1 (same target and append point as E10), with the reading rule
  "no verdict line ⇒ could-not-evaluate".
- **Flip condition:** counter v2 catches the exception and returns exit 2, or the crash path prints a verdict line;
  either makes the disclosure unnecessary.

### E13 — silent Markdown table parse failures

- **Carried text:** "An escaped pipe `\|` yields a 7-cell row that fails as `t2-signal` … a data row without a
  trailing `|` truncates the table silently (population 0, no diagnostic); only the first header-matching table is
  read and the scan is not code-fence-aware."
- **Re-check:** `splitRow` (`:151-155`) requires a leading and a trailing pipe; `parseTable` (`:157-173`) breaks at
  the first line that is not a row, and the header test is exact (`:161-162`). **Measured** (receipt
  `probe-B-truncate.txt`): a two-row table whose second row lacks the trailing pipe → **exit 0**, population 1,
  admitted 1, `clean: true`, rows `[D1 line 7 admitted]`. That is stronger than the carried text: not `population 0`
  but a *clean pass* in which one row of the entry was never read.
- **Verdict:** holds, and the live consequence is worse than carried.
- **Disposition:** **correction** — Draft A bullet 2 (same target and append point), stating that `population` is the
  parsed rows, not the entry's rows.
- **Flip condition:** no flip is needed for the disclosure; the fix is counter v2. A fenced block containing a
  header-identical line would make the scan read the wrong table — no live instance (the landed entry has no fenced
  block).

### E14 — a registry row carrying a literal pipe is skipped, then reported `r1-row-missing`

- **Carried text:** "a registry row carrying a literal `|` is skipped, then reported `r1-row-missing` … **Carried**;
  S119–S122 parse (population 13)."
- **Re-check:** `scripts/check-decision-table.mjs:123-124`: `line.trim().split("|")`, then
  `if (cells.length !== 13) continue;`. **Measured** (receipt `probe-C-piperow.txt`): a registry row whose source
  cell carries `https://example.org/a | b` is skipped, and the citing table row is reported **`r1-row-missing`**
  although the id is present in `corpus/SOURCES.md` — the reason names the wrong defect. **No live instance:** an
  `awk -F'|'` audit of every `S<N>` registry line finds 122 rows and 0 with a pipe count other than twelve.
- **Verdict:** holds, reproduced; the misattribution is latent.
- **Disposition:** **correction** — Draft A bullet 3 (same target and append point), carrying the no-live-instance
  fact so the disclosure is not read as a measured failure of S119–S122.
- **Flip condition:** a registry row is written with a literal pipe in any cell (a URL carrying a pipe is the
  realistic case); the misattribution then becomes live, and the registry contract would need to say whether pipes
  are escaped.

### E15 — the `--live` cache is keyed on `(url, quote)` while the header claims one GET per url

- **Carried text:** "the `--live` cache is keyed on `(url, quote)`, while the header claims one GET per cited url;
  two rows sharing a URL with different quotes fetch twice … **No action** — doc drift only."
- **Re-check:** header `scripts/check-decision-table.mjs:19-20` reads "with `--live` it makes one read-only HTTPS GET
  per cited row url"; the cache key at `:288` is `` `${g.url}\u0000${quote}` ``. Confirmed. The false statement lives
  in frozen script bytes, and **no tracked document repeats it**:
  `grep -rn "one read-only HTTPS GET\|one GET per\|per cited row url\|per cited url" --include=*.md .` (lane root,
  excluding `.ufo/`) returns no hits (exit 1); `SKILL.md:2575` says only "makes read-only HTTPS GETs … of receipt
  urls".
- **Verdict:** holds; documentation drift confined to the frozen script header.
- **Disposition:** **refusal** — the only sentence to correct is in `scripts/check-decision-table.mjs`, which this
  round must not modify, and no document carries it, so an append-only correction has no target. Drafting one at a
  document that does not make the claim would manufacture a stale line.
- **Flip condition:** a document repeats the one-GET-per-URL cardinality (the round-31 registry row is the near
  miss), counter v2 lands, or a `--live` run is measurably harmed by duplicate fetching (rate limiting on the
  documented host).

### E16 — closed-vocabulary gaps in the decision-table counter

- **Carried text:** "`retries` has no singular `retry`, `backoff` rejects 'back off', `numbersIn` lacks
  forty/fifty/eighty/thousand/million, scientific notation is unsupported … false negatives only,
  author-controlled."
- **Re-check:** `UNIT_RE` (`:86`) lists `retries` and not `retry`; `DECISIONS` (`:85`) holds `backoff`, while `t3`
  takes `/^[a-z]+/` of the cell (`:266`), so "back off" yields `back` and fails; `NUMBER_WORDS` (`:87`) covers 0–12,
  fifteen, twenty, twenty-four, thirty, sixty, ninety, hundred and no further; the digit scan (`:184`) is
  `\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?` — no exponent. Each gap refuses a row the source supports; none admits a row
  the source does not.
- **Verdict:** holds; all gaps are in the false-negative direction.
- **Disposition:** **refusal** — no document asserts a vocabulary the counter does not read (`QUALITY.md:457-470`,
  criterion 80, binds the author's row-writing, not the counter), and the failing direction cannot inflate a
  reading. A correction would have to state a counter property, which is code, not prose.
- **Flip condition:** a landed table row is refused by one of these gaps (a measured false negative worth a limit),
  or a document states that the counter reads word numerals / `retry` / scientific notation.

### E17 — the C1 counter's `git()` and `curlFetch` inherit the operator environment

- **Carried text:** "the C1 counter's `git()` lacks the `GIT_CONFIG_GLOBAL/SYSTEM` scrubbing the C2 counter has, and
  `curlFetch` inherits the operator environment."
- **Re-check:** `scripts/check-decision-table.mjs:100-102` spawns `git` with `{ encoding, maxBuffer }` only — no
  `env`; `curlFetch` (`:194-198`) likewise. The calibration counter pins both at
  `scripts/check-selfassessment.mjs:104` (`env: { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_CONFIG_SYSTEM: "/dev/null" }`). The lesson sentence `corpus/lessons/round-31.md:163` says the counter "was
  written hermetic", with the em-dash pointing at `:194-213` (the fetch argv) — so the word is wider than its own
  scope.
- **Verdict:** holds; the asymmetry is real and the lesson's adjective overreaches its parenthetical.
- **Disposition:** **correction** — Draft B, target `corpus/lessons/round-31.md`, appended after line 356 (EOF),
  citing `round-31.md:163`.
- **Flip condition:** counter v2 pins the git environment (or a per-counter minimal child env lands, which is the E6
  fix); then "hermetic" becomes true and the correction is superseded.

### E18 — `could-not-evaluate` never fails the gate, so the target is vacuously reachable

- **Carried text:** "`clean` is `counted.length === 0` … a run in which *every* comparison is refused exits 0 with
  `mismatches 0` … the claim's `jq '{mismatches, counted}'` drops `couldNotEvaluate` entirely."
- **Re-check, v3 bytes** (`scripts/check-selfassessment.mjs`, the round-32 freeze): `:533`
  `mismatches: counted.length`, `:536` `couldNotEvaluate: findings.filter((f) => f.observed === null).length`,
  `:538` `clean: counted.length === 0`, `:1084` `process.exit(out.clean ? 0 : 1)` — the refusal count is computed
  and never gates. **Measured at `4181fff` in a clean clone** (receipt `c2-v3-at-4181fff.json`, run to a file):
  18 counted + 104 refused + 21 superseded + 52 agreeing = 195 findings; refusals by class 27 m1 / 76 m2 / 1 m4.
  **Measured vacuity** (receipt `probe-D-vacuous.txt`): a fixture whose only tally names a gate absent at the
  revision prints `SELFASSESSMENT verdict=clean … could_not_evaluate=1` and exits **0**.
- **Reference drift inside the carried item:** "`evaluate` 438-446 per the seat, `main` ≈881" is v2-era; at v3 bytes
  `evaluate` returns at `:517-540` (`clean` at `:538`) and `main`'s exit is `:1084`.
- **The 103 figure reconciled, not contradicted:** the carried "103" is v2 at `9505a10e`; measured there in its own
  clean clone with v2 bytes `143d66ff…2fce`: **9 mismatches, 103 refused, 20 superseded** (receipt
  `c2-v2-at-9505a10-clean.json`). At `4181fff` with v3 bytes: **18 / 104 / 21**. Each figure must be quoted with its
  revision and bytes. A v2 run given the `4181fff` working copy read 5 / 114 — invalid, because `gateTally` refuses a
  gate whose blob differs from the working copy (`:157-166`); discarded, and it is the reason the measurement rule
  names a clean checkout at REV.
- **Verdict:** holds at the v3 bytes; unchanged by v3's added oracle refusal, which lands in the same non-gating
  bucket.
- **Disposition:** **correction** — Draft C, target `SCORECARD.md`, appended after line 1603 (EOF), citing
  `SCORECARD.md:1582`.
- **Flip condition:** a counter fails a run whose refusal count exceeds zero, or the C2 counting command includes
  `couldNotEvaluate` in the reported figure; either makes the after-0 self-describing and retires the correction.

## Drafts (landable, append-only, zero deleted lines)

Each draft is appended at the named point, leaves every existing line as written, and cites the statement it limits.
They were **tested for window safety** (see §Integration notes): appended to a scratch clone at `4181fff` and
committed as `1396dc5fbb07b58440dd0e9ffe93be27ade44af6` after the text below was extracted from this file, the frozen
v3 counter returns the identical finding set at that commit.

### Draft A → `SKILL.md`, append after line 2627 (EOF; the round-32 registry section ends there)

```markdown
## Correction — the decision-table verdict map and reason ids cover evaluated rows only (append-only; cites the stale line in this document)

Measured 2026-10-26 at `4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6` with the counter blob the round-31 row pins
(`d15f3bd7…f6832`), against fixture repositories under the seat's scratch. The row at `SKILL.md:2575` maps the exit
codes of a run that reaches evaluation; four measured shapes fall outside that map. None of them changes a frozen
predicate or a measured reading, and the counter bytes are unchanged this round.

- **Uncaught exception reads as `failed`.** An HTML receipt carrying an out-of-range numeric entity (`&#1114112;`)
  throws `RangeError: Invalid code point 1114112` in `normalise()` (`scripts/check-decision-table.mjs:141`). The run
  exits 1 with empty stdout and no `DECISION_TABLE verdict=` line, the same code the map assigns to "a row not
  admitted", although no row was read.
- **A truncated table row is dropped silently.** A data row written without its trailing pipe is not a row of the
  parsed table (`:151-173`). A two-row fixture reads population 1, admitted 1, clean, exit 0, so the map's
  "0=clean (population>=1, every table row admitted)" is satisfied while a row of the entry was never read. Read
  `population` as the parsed rows.
- **A registry cell carrying a literal pipe misnames the defect.** The registry row is skipped by the eleven-cell
  unpack (`:124`) and the citing table row is reported `r1-row-missing`, though the id exists in `corpus/SOURCES.md`.
  No live instance at this revision: all 122 registry rows carry twelve pipes.
- **`l1-live` names one outcome, not one cause (added limit, not a corrected sentence).** A non-200 answer (`:211`), a
  null fetch (`:197` then `:290`), a TLS or DNS failure and a page that no longer carries the quote are one reason,
  and curl's stderr is discarded, so a `--live` refusal says only that the row is not admitted. A pass does
  establish https, same host, 200 and the quote present (`:211-213`).

Read any `decision-table` run that prints no `DECISION_TABLE verdict=` line as could-not-evaluate, whatever its exit
code; the crash path, the truncated table and the skipped registry row are counter v2 items (`SCORECARD.md` round-31
planned: depth line).
```

### Draft B → `corpus/lessons/round-31.md`, append after line 356 (EOF)

```markdown
## Correction — "hermetic" at M4 is the fetch argv, not the counter (append-only; cites the line in this document)

`corpus/lessons/round-31.md:163` says the round-31 decision-table counter "was written hermetic", with the em-dash
scoping the claim to `scripts/check-decision-table.mjs:194-213`. Read the scope literally. The fetch is pinned
(https only, same-host redirects, `-q` as the first argument); the counter's read path is not:
`scripts/check-decision-table.mjs:100-102` spawns `git` with no `env`, so `GIT_CONFIG_GLOBAL`, `GIT_CONFIG_SYSTEM`,
`GIT_DIR`, `GIT_WORK_TREE` and `PATH` are the operator's, and `curlFetch` (`:194-198`) inherits the environment as
well. The round-32 calibration counter pins two of those (`scripts/check-selfassessment.mjs:104`), which is the
asymmetry carried as a round-32 defect. Read "hermetic" as "the fetch argv", not "the counter": M4's landed half and
its red state are unchanged.
```

### Draft C → `SCORECARD.md`, append after line 1603 (EOF)

```markdown
## Correction — counted versus refused comparisons in the calibration reading (append-only; cites the line in this document)

Measured 2026-10-26 in a clean checkout of `4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6` with the v3 counter blob
(`77b5c8ed…c6a9`): the counter reports 18 mismatches, 104 refused comparisons, 21 superseded and 52 agreeing, and
those four figures sum to the 195 findings. The C2 row at `SCORECARD.md:1582` states "mismatches 9 → 0" and names the
window holes; that figure is over counted comparisons only, so it must be quoted with the refusal count.

A run in which every comparison is refused also reads clean: `clean` is `counted.length === 0`
(`scripts/check-selfassessment.mjs:538`) and the exit is `out.clean ? 0 : 1` (`:1084`), so a fixture whose only tally
names a gate absent at the revision prints `verdict=clean` and exits 0 with `could_not_evaluate=1`. State an after
reading together with its refusal count, never as "the statements were verified".
```

## Integration notes for the L1

1. **Append only, at EOF.** Every draft lands after the document's last line, so no cited line above it shifts.
   The line numbers named as append points (`2627`, `356`, `1603`) are the last lines at `4181fff`; other seats
   appended to `SKILL.md`, `SCORECARD.md`, `corpus/README.md`, `corpus/SOURCES.md` and two knowledge entries *after*
   this seat's reads (329 inserted lines, 0 deleted, none of it my draft text), so read each append point as "the
   current EOF of that document", not as a fixed number. The cited lines (`SKILL.md:2575`, `round-31.md:163`,
   `SCORECARD.md:1582`) are byte-checked against the `4181fff` blobs and do not shift under end-insertions.
   Carried errata E30 measured nine findings reappearing from a single inserted line above `SKILL.md:1614`; these
   three appends move nothing.
2. **Window safety, measured.** In a scratch clone at `4181fff` with the three drafts appended and committed
   (`1396dc5f`), `node scripts/check-selfassessment.mjs --rev <draft-commit> --json` returns
   `mismatches 18, couldNotEvaluate 104, superseded 21` — the same scalars as the freeze reading, the same 18 counted
   lines (`SCORECARD.md:1439,1465,1486,1564`; `SKILL.md:2479,2515,2530,2545,2576,2578,2590,2594,2598`;
   `corpus/README.md:613,668`; `SCORECARD.md:1473,1515,1576`), and the deduplicated finding sets are equal
   (157 keys each by `class/doc/line/refusal/claimed/observed`; no finding introduced, none cleared). The check was
   re-run from the drafts as written in this file — see §Verification.
3. **The drafts are curation, not clearance.** None of them touches one of C2's 18 counted mismatches; C2's
   after-zero needs the separate correction block that cites those numbered lines.
4. **Tally hygiene.** No line in any draft names a gate script and carries one of the four `TALLY_PATTERNS`
   (`scripts/check-selfassessment.mjs:130-135`) — checked mechanically. This matters: a receipt or population count
   on a gate-naming line is read as a self-test tally (carried errata E26).
5. **No round-group heading in `SCORECARD.md`.** Draft C's heading deliberately omits `Round N`, so the m4 scan
   (`:434-514`) does not open an empty round group and add a refusal to round 32's own reading. No draft contains a
   `nudge active|inactive` phrase.
6. **Draft A's reading rule** ("no `DECISION_TABLE verdict=` line ⇒ could-not-evaluate") is a hand-reading rule in
   the style of criterion 82: the frozen counter still exits 1 on that path, and nothing in the draft claims it does
   otherwise.

## Verification

- The three drafts were extracted from this file as written (3 fenced blocks, the heads quoted above), appended to a
  fresh `git clone --shared` of the lane checked out at `4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6` (porcelain
  empty), committed as `1396dc5fbb07b58440dd0e9ffe93be27ade44af6` (`git diff --numstat 4181fffb HEAD` =
  26/0 `SKILL.md`, 10/0 `corpus/lessons/round-31.md`, 11/0 `SCORECARD.md` — zero deleted lines), and scored with the
  frozen counter (`c2-v3-after-drafts-window-test-final.json`): 18 counted / 104 refused / 21 superseded, the same 18
  counted lines, and the finding sets set-equal (157 deduplicated keys; 0 only-before, 0 only-after). The landed text
  is window-neutral.
- Draft hygiene re-checked on the extracted text: no gate-naming line carries a tally shape, no nudge phrase, no
  `## Round N` heading.

## Commands and exit codes

All lane reads are read-only; every run was made in a scratch clone or fixture repo under
`$HYAKU_SCRATCH/tabi-r32/ScribeErrataB`.

| # | command | exit |
|---|---|---|
| 1 | `git -C <lane> rev-parse HEAD` | 0 → `4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6` |
| 2 | `sha256sum scripts/check-decision-table.mjs scripts/check-selfassessment.mjs scripts/check-bidi-runtime.mjs` | 0 → `d15f3bd7…f6832`, `77b5c8ed…c6a9`, `2f25af5a…c393` |
| 3 | `git clone --shared <lane> "$S/clone"` + `checkout -q --detach 4181fff…` + `git status --porcelain` | 0; 0 porcelain lines |
| 4 | `node scripts/check-selfassessment.mjs --rev 4181fff… --json > c2-v3-at-4181fff.json` | 1 (18 counted) |
| 5 | `git clone --shared <lane> "$S/clone-9505a10"` + `checkout -q --detach 9505a10…` + `node scripts/check-selfassessment.mjs --rev 9505a10… --json > …` | 0 / 0 / 1 (9 counted; v2 bytes `143d66ff…2fce`) |
| 6 | `node scripts/check-decision-table.mjs --repo <fx A> --rev <h> --baseline <b> --entry corpus/knowledge/fx.md --json` | 1 — `RangeError`, no verdict line |
| 7 | same, fixture B (row without trailing pipe) | 0 — population 1, admitted 1, clean |
| 8 | same, fixture C (registry row with a literal pipe) | 1 — `r1-row-missing` |
| 9 | `node scripts/check-selfassessment.mjs --repo <fx D> --rev <h> --json` | 0 — `could_not_evaluate=1`, `clean: true` |
| 10 | `node scripts/check-selfassessment.mjs --rev <draft-commit> --json` (drafts appended, committed) | 1 — identical finding set |
| 11 | `awk -F'\|' '/^ {0,3}\|[ \t]*S[0-9]{3,}[ \t]*\|/ {n=NF-1; if (n!=12) print NR": "n" cells"}' corpus/SOURCES.md` (and a companion count of the same rows) | no output; 122 rows, 0 malformed |
| 12 | `grep -rn "one read-only HTTPS GET\|one GET per\|per cited row url\|per cited url" --include=*.md .` (excl. `.ufo/`) | 1 (no hits) |
| 13 | `man curl \| col -b \| grep -A4 '^ *-q'` | 0 — curl 8.23.0, "first parameter on the command line" |
| 14 | `pgrep -fa 'chromedriver\|chromium' \| grep ScribeErrataB` | 1 (no processes started) |

## Limits and out of scope

- No public page was fetched this round by this seat; there is therefore no fetch receipt (URL, UTC time, status,
  bytes, sha256) to record. The entries re-checked here are counter behaviour, not source content.
- No browser or driver was started; no `--live` leg of either counter was run.
- The drafts record instrument limits in prose. They do not change the frozen counters, any claim, control or
  measured reading, and they cannot make C2's after-zero true.
- E18's vacuity survives in bytes: a fully refused run still exits 0. The correction changes what a reader may say
  about the figure, not what the counter does.
- All citations are positional. Any insertion above a cited line (`SKILL.md:2575`, `round-31.md:163`,
  `SCORECARD.md:1582`) moves them; that is why every draft is at EOF.
- The carried sentence in E10 was corrected in one clause here; the other eight carried texts were re-checked and
  read as written.

## Artefacts

Under `.ufo/waves/round-32/w1/ScribeErrataB/` (lane-relative): `errata-B.md` (this file), `anchors.txt` (the quoted
byte ranges), `c2-v3-at-4181fff.json`, `c2-v3-after-drafts-window-test-final.json` (the run on the drafts as
written here), `c2-v3-after-drafts-window-test.json` (an earlier run on the same literals), `c2-v2-at-9505a10-clean.json`,
`probe-A-entity.txt`, `probe-B-truncate.txt`, `probe-C-piperow.txt`, `probe-D-vacuous.txt`.
Scratch `/fast/scratch/hyaku/tabi-r32/ScribeErrataB` was deleted before this report was written.
