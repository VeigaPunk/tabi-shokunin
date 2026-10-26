# RevQuality — review of QUALITY criteria 80–81 (round 31, attempt-2 wave a2w1)

Reviewed at lane revision `486048356f0712e4396588c9dab58cd419243120` in a clean scratch clone
(`git clone --shared` + `checkout -q 4860483…`; `git status --porcelain` = 0 before and after;
lane checkout never written). Frozen claims read first (`.ufo/waves/round-31/claims.json`).

## Verdict

**Criterion 80: holds.** Lesson-backed (round-31 lesson M10 exists as table row and subsection,
10/10 rows↔subsections; claim C1 exists in the frozen claims.json), its check command runs as
written at REV (exit 0; population 13, admitted 13, failing 0, live), its counter-behaviour claims
are true of the frozen bytes (n1 compares only the Threshold cell's numeric token against numbers
anywhere in the quote, `scripts/check-decision-table.mjs:286`; the cited w1 falsifiers are real),
and it contradicts neither criteria 1–79 nor the frozen claims — it discloses exactly the holes
claims.json and lesson M10 record and marks `failing 0` "necessary, not sufficient".

**Criterion 81: defect (medium), everything else verified true.** The case
`v2-oracle-reads-summary-line-not-first-cases-token` is present and passes (`--selftest` exit 0,
30 cases / 0 FAIL); the m8-proof receipt reads `verdict=failed` / `exit=3` and I reproduced the
failure independently with the committed `old-oracle.mjs` (sha256 matches the lesson's digest);
"the last such line" is enforced; the aria `cli_cases=` shape is real and outside the oracle.
**But the clause "a summary whose verdict is not `clean` is not a tally" is false of the frozen
counter bytes**: the summary regex never inspects `verdict=`, `gateTally` returns `measured`
regardless of the gate's exit, `m1Findings` never consumes `oracle.exit`, and a probe gate printing
`CHECK_REVQBAD_SELFTEST verdict=failed cases=13 passed=12` (exit 3) had its `cases=13` read as the
gate's tally (claimed 99 → observed 13). Secondary precision defect (low): "never the first
`cases=` token in its output" holds only when a summary line exists; with none, the code falls back
to the first `cases=`/N-M token (probe: no-summary gate, claimed 99 → observed 9).

## Criterion 80 — evidence

1. **Lesson-backed.** `corpus/lessons/round-31.md` carries `| M10 |` in the mistakes table and
   subsection `### M10 — the C1 counter admits repetition and numbers that are not thresholds`;
   `grep -c '^| M[0-9]'` = 10 and `grep -c '^### M[0-9]'` = 10 (criterion 77 conformance for the
   cited lesson). `claim C1` exists in `.ufo/waves/round-31/claims.json`.
2. **Check command runs as written.** In the clean clone at REV:
   `TMPDIR="$S/tmp" node scripts/check-decision-table.mjs --rev 486048356f0712e4396588c9dab58cd419243120 --baseline 96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc --entry corpus/knowledge/rate-signal-decision-table.md --live --json` → **exit=0**;
   JSON (receipt `qual80-check.json`): `population 13, admitted 13, failing 0, live: true, clean: true`.
   Counter bytes at REV: sha256 `d15f3bd7…f6832` (check-decision-table.mjs) and `143d66ff…2fce`
   (check-selfassessment.mjs) — both equal `frozenDigests`. `git diff --name-only 9505a10…..4860483… -- scripts/ | wc -l` → **0**.
3. **Counter-behaviour claims true.** `scripts/check-decision-table.mjs:286`:
   `if (!numbersIn(quote).has(tnum)) { fail("n1-threshold-sourced"); continue; }` — the numeric
   token of the Threshold cell is compared against numbers anywhere in the quote; nothing in the
   frozen bytes checks unit, bound word, force, scope or distinctness. Quote location (receipt
   bytes) and `--live` (https-only, same-host effective URL, `:194-213`) are the other machine
   checks. The criterion's "checks only that the number occurs in a located, live quote" is
   accurate for the threshold-content dimension it addresses.
4. **w1 falsifier citations true.** `.ufo/waves/round-31/w1/CritC1Axis.md` verdict paragraph: a
   ten-row table from one 12-word RFC 9309 quote and one new registry row → frozen counter exit 0,
   population 10, admitted 10, failing 0, live (`w1/CritC1Axis/pad-live.json`).
   `.ufo/waves/round-31/w1/CritC1Counter.md` row A3: status code `429` as a threshold admitted,
   exit 0; row B: one sentence reused for ten rows, offline and live population 10, admitted 10.
5. **No contradiction with criteria 1–79 or the frozen claims.** Complements 50 (decision-table
   semantics), 12/15 (tier A rows), 73 (criterion 80 discloses which clauses the counter enforces
   instead of claiming enforcement). Its disclosed holes match claims.json's known holes
   (repetition, non-threshold numbers admitted) and lesson M10's "not landed; read row by row"
   mitigation. Its command is the frozen C1 predicate command verbatim (modulo the `<REV>`
   placeholder).
6. **Criterion's own rules honored by the landed entry (spot-checks; full row reading is other
   seats' assignment).** D3 — the RFC example-period row — says "example" in its Signal cell
   ("the period is the RFC's example value") and Decision cell ("after the example period");
   declared-limit rows D7–D11 mark Decision `(derived)`; the derivation rule is stated once in the
   entry prose ("**A decision the quote does not instruct carries `(derived)`**…").

## Criterion 81 — evidence

1. **Lesson-backed.** `corpus/lessons/round-30.md` M8: table row `:344` and subsection `:346`
   ("two tallies on one line, and a counter that reads the first `cases=` it sees").
   `corpus/lessons/round-31.md` M1 (`### M1 — the calibration oracle read the first cases= token…`)
   and M7 (`### M7 — the window cannot read a cli_cases= figure…`) both exist.
2. **Check command runs as written.** `node scripts/check-selfassessment.mjs --selftest` in the
   clone → **exit=0**; 30 `CASE` lines, 0 FAIL; line 21:
   `CASE id=v2-oracle-reads-summary-line-not-first-cases-token expected_exit=0 exit=0 expected=- actual=- PASS`
   (receipt `qual81-selftest.txt`).
3. **m8-proof receipt true, and reproduced.** `.ufo/waves/round-31/baseline/m8-proof/old-oracle-selftest.txt`
   reads `SELFASSESSMENT_SELFTEST verdict=failed cases=29 passed=28` and `exit=3`, with the one
   FAIL on exactly the named case (`actual=m1-selftest-tally`). Independent rerun of the committed
   probe `sha256sum .ufo/waves/round-31/baseline/m8-proof/old-oracle.mjs` →
   `bfc9682b692339acfd1647bbddca7a1569c1410968aa742ad2ae8e5ed3962855` (equals the lesson M1
   digest); `node .ufo/waves/round-31/baseline/m8-proof/old-oracle.mjs --selftest` → **exit=3**,
   `old-oracle-rerun.txt:21` = `CASE id=v2-oracle-reads-summary-line-not-first-cases-token expected_exit=0 exit=1 expected=- actual=m1-selftest-tally FAIL`, `:30` = `verdict=failed cases=29 passed=28`.
   (Lesson M1's disclosed limit stands: the probe is a three-change revert — cases=29, not 30 —
   and only the oracle clause has an isolated red state; the criterion's "with the summary-line
   rule removed" is looser than the lesson's limit note but the failing case is the oracle case.)
4. **"The last such line" enforced.** `scripts/check-selfassessment.mjs:180-181`:
   `summaries[summaries.length - 1]`; the m8-proof noisy-gate case proves a per-case `cases=2`
   token is not read when a summary line exists.
5. **aria claim true.** `scripts/check-aria-metadata.mjs:2320`
   (`console.log('ARIA_METADATA_SELFTEST verdict=blocked cli_cases=0 helpers=0')`) and `:2983-2986`
   (`ARIA_METADATA_SELFTEST verdict=${ok ? 'clean' : 'blocked'} cli_cases=${cliCases.length} helpers=${helpers.length}`)
   — the gate prints that shape on both paths. The window's tally detector `\bcases\s*=\s*(\d+)`
   (`:124`) cannot match `cli_cases=36` (`_` is a word character, no boundary), so a tally stated
   for aria is indeed "unchecked, not matched" — consistent with lesson M7's silent non-read.
6. **No contradiction with criteria 1–79 or the frozen claims.** Consistent with 65 (compare at the
   graded revision), 70, 77; matches claims.json C2's "summary-line oracle" description.

## Findings

**F1 (medium — criterion 81): the verdict clause asserts an enforcement no line performs.**
"a summary whose verdict is not `clean` is not a tally" is false of the frozen v2 bytes:
- `scripts/check-selfassessment.mjs:180-181` — the summary regex
  `/^[A-Z][A-Z0-9_]*_SELFTEST\b[^\n]*?\bcases\s*[=:]\s*(\d+)/gm` contains no `verdict` token;
- `gateTally` (`:159-186`) returns `{status:"measured", tally, exit: r.status}` regardless of the
  gate's exit; `m1Findings` consumes only `oracle.tally` and never `oracle.exit`;
- no selftest case covers a non-clean verdict (30 cases, none named for verdict handling).
Empirical probe (scratch clone, fixture branch `revq-probe`, fixture revs
`3aa31592c91e8b69c1fdf300168d998d072c12de` / `d79ddbf76c16e206bc81a237b6584c4a127e9b9a`; gate
sources and doc lines in receipts `probe-gate-*.mjs`, `probe-scorecard-lines.md`):
`node scripts/check-selfassessment.mjs --rev d79ddbf… --json` → exit=1; findings
(`probe2.json:409-434`): `check-revqbad.mjs` (summary `CHECK_REVQBAD_SELFTEST verdict=failed
cases=13 passed=12`, exit 3) claimed 99 → **observed 13** — the failed selftest's summary was read
as the tally; control `check-revqgood.mjs` (clean, cases=13) claimed 13 → observed 13; a stale
tally stated for a failing gate would be "matched", not flagged. This violates criterion 73's own
standard ("a clause no line enforces is dropped from the sentence or enforced before data").
The round's measured C2 result (mismatches 0) is not invalidated — this is a criterion-text defect,
not a measurement defect.

**F2 (low — criterion 81): "never the first `cases=` token in its output" overstates.** True only
when a summary line exists; when none exists the same line falls back to
`/"?\bcases"?\s*[=:]\s*(\d+)/.exec(out) || /\b(\d+)\s*\/\s*(\d+)\b/.exec(out)` — the pre-v2
behaviour. Probe: `check-revqnosum.mjs` (prints `probe run done cases=9`, no `_SELFTEST` line)
claimed 99 → **observed 9** (`probe2.json:429-434`). The regex also does not require the
`verdict=` token the criterion's parenthetical shows.

**Criterion 80: no finding.**

## Fetch receipts (my `--live` rerun under a logging curl shim; read-only GETs, https only)

13 fetches, one per row (no per-URL cache), all HTTP 200, effective URL = requested URL (no
redirects), logged in `fetches.log` with UTC time, argv, status, byte counts, body sha256:
- `https://www.rfc-editor.org/rfc/rfc9309.txt` ×5 — 2026-10-26T12:39:46Z, 200, body 25,265 B,
  sha256 `f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207` (equals the S119
  receipt digest `f633915d…b207` recorded in the lesson);
- `https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api` ×6 —
  12:39:47Z, 200, body 337,116 B, sha256 `47031376e510aeca24d6c088365460bf065e50386e7a77c3314f52a6b63173d9`
  (raw bytes differ from the round's receipt `3a33f87b…f755` — expected; the counter compares
  normalised text, as the lesson discloses);
- `https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api` ×2 —
  12:39:47Z, 200, body 328,088 B, sha256 `e4050f6bab26d33a4f6e8cc633555bb55478f9cc0c2857e37e77ff7ba38147b0`
  (receipt `b15c1c0b…a33e`; same normalised-compare note).
No `rfc6585` fetch — S120 sources no row, consistent with the lesson. The shim rerun's counter
output is byte-identical to the first run (`cmp` clean) — determinism holds.

## Residual risk and verification gaps

- Row-by-row threshold/force/scope/distinctness reading of D1–D13 is other seats' assignment; I
  spot-checked only criterion 80's own rules against the landed entry (D3 example marking, the
  `(derived)` marks, the derivation sentence).
- The fixture revs die with my scratch cleanup (`clone --shared`); the probe is rebuildable from
  the copied gate sources and doc lines, and F1 is derivable from the code lines alone.
- I did not re-run the C2 counting command (`--rev` without `--selftest`) — C2's own reading is
  other seats' assignment; my probe runs exercised the same code path at fixture revs.

## Receipts (this output dir)

`qual80-check.json`, `qual80-check2.json` (byte-identical rerun), `fetches.log`,
`qual81-selftest.txt`, `old-oracle-rerun.txt`, `probe.json`, `probe2.json`,
`probe-gate-check-revqbad.mjs`, `probe-gate-check-revqgood.mjs`, `probe-gate-check-revqnosum.mjs`,
`probe-scorecard-lines.md`.

## Tooling

No tools installed or upgraded (operator authorization of 2026-10-19 unused; no pacman, no
`uv tool`, no npm/cargo installs). Scratch `/fast/scratch/hyaku/tabi-r31/RevQuality` removed after
receipt copy.
