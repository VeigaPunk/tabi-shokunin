# ScoutGateRegistry — gate registry field contract and drafted rows (round 29, w1)

Read-only scout. Nothing in the lane was written except this report. Scratch clone
`/fast/scratch/hyaku/tabi-r29/ScoutGateRegistry/` (git clone --shared at 190052c, a draft commit there only) was removed on exit.

## 1. Where rows live and how the gate finds them

- Registry home is `/home/vgpnk/Projects/shokunin/tabi-shokunin/SKILL.md` (check-gate-registry.mjs:21-24). SKILL.md is 2530 lines at 190052c; the last registry tables are Round 28 at SKILL.md:2527-2530.
- The gate reads only the committed blob `SKILL.md` at `--rev` (check-gate-registry.mjs:240). It is schema-aware: `parseTables` (:128-146) takes any pipe line followed by a separator line (`SEPARATOR` :126) as header + body. Columns are found by header regex, not position (`col` :148, `fieldOf` :157). Header regexes (:175-182): name `^name$` (fallback col 0), kind `/kind/i`, entry `/entry/i`, verdict `/verdict/i`, selftest `/self-?test|self-invocation/i`, pinned `/pinned|persisted/i`, scope `/write scope|scope/i`, owner `/owner/i` (legacy "Kind / owner" cell: owner after the slash, :183-187).
- Only tables whose Kind cell starts with `gate` or `probe` (:173) produce rows. Escaped `\|` is content (:112).
- Gate set (:246-258) = every `scripts/*.mjs` at rev whose basename matches `GATE_CONVENTION` (`check-*.mjs` or `*audit*.mjs`, :62) UNION scripts named in a gate-kind row's Entry or Self-test cell (`SCRIPT_TOKEN` :205, `scriptsInRow` :207-217).
- Row ownership (:263): a row is for gate G if `row.name === G.name` (G.name = basename without `.mjs`, e.g. `check-release-pins`) OR the row's Entry/Self-test cell names the script. The LATEST owned row in document order wins (:264) — append-only supersession. So the row Name need not equal the script basename.
- Findings: `e1-missing-row` (no owning row, :269), `e2-field-incomplete` (latest row fails `missingFields`, :272), `e3-row-script-absent` (latest row's script not in the tree, :275). Counted field `nonconformant` = gates with any finding. Exit 0 clean / 1 failed / 2 could-not-evaluate (header :4-6).

## 2. Field contract (`missingFields`, check-gate-registry.mjs:219-234)

| Field | Column | Passes when | Line |
|---|---|---|---|
| name | `Name` | matches `^[A-Za-z0-9][A-Za-z0-9 ._/-]{2,}$` — NO parentheses, colons, commas | :221 |
| kind | `Kind` | cell begins with `gate` (`probe` registers a probe, a defect for a convention-named script) | :222 |
| entry | `Entry command` | length >= 8 | :223 |
| verdictMap | `Verdict map` (else Entry) | text matches all three: `\b0\b[-=:>]*clean`, `\b1\b[-=:>]*(failed\|findings\|finding\|red\|semantic failed)`, `\b2\b[-=:>]*(could not evaluate\|usage\|refus…)` — write `0=clean`, `1=failed`, `2=could-not-evaluate` | :224-228 |
| selftest | `Self-test…` | cell contains `--selftest` or `--self-test` literally (a bare "7 cases in CASES" fails) | :229 |
| pinned | `Pinned-value path` | length >= 8 and contains `/` or `.` (or 7+ hex) | :230 |
| scope | `Write scope` | length >= 10 and matches `read\|writ\|temp\|isolat\|stdout\|nothing\|no ` | :231 |
| owner | `Owner` | length >= 2 and matches `tabi\|lane\|L1\|shokunin\|owner` — use `tabi L1` | :232 |

Canonical header (check-gate-registry.mjs:295-296, SKILL.md:2467-2468, :2512-2513, :2527-2528):
`| Name | Kind | Entry command | Verdict map | Self-test | Pinned-value path | Write scope | Owner |` then `|---|---|---|---|---|---|---|---|`.

## 3. Measured state at the dispatch baseline

`node scripts/check-gate-registry.mjs --rev 97be89bc66139eb45526a04af59a35dccc006eb9 --json` → `nonconformant=3` (the same 3 at HEAD 190052c; `--rev HEAD` run, exit 0 of the gate pipeline shown above, verdict=failed):

1. `e1-missing-row` check-release-pins — no row at all.
2. `e2-field-incomplete` check-s106-evidence, row SKILL.md:2529 — missing `name, selftest`.
3. `e2-field-incomplete` check-selfassessment, row SKILL.md:2530 — missing `name, selftest`.

Cause of 2 and 3 (observed): the round-28 rows are named `s106-evidence (revision binding)` and `selfassessment-counter (exact line citations)` — parentheses fail the name regex (:221) — and their Self-test cell is `7 cases in CASES (not run at round-28 tip)` / `20 cases in CASES (not run at round-28 tip)`, with no `--selftest` token (:229). Because the latest row wins, those two defective round-28 rows are what the registry judges. A round-29 append that restores a conformant row for each fixes them; no earlier byte may be edited.

Observed self-test tallies at 190052c in a scratch clone (`TMPDIR=<scratch> node scripts/<gate>.mjs --selftest`):
- check-release-pins: `RELEASE_PINS_SELFTEST verdict=clean cases=20 passed=20`, exit 0.
- check-selfassessment: `SELFASSESSMENT_SELFTEST verdict=clean cases=22 passed=22`, exit 0.
- check-s106-evidence: `ReferenceError: existsSync is not defined`, exit 1 (C1 not yet landed; `grep -c id:` over CASES at 97be89b gives 7 cases: clean-fixture-valid, measured-revision-bytes-match, measured-revision-bytes-mismatch, sha-mismatch-invalid, anchor-off-by-one-invalid, missing-bytes-could-not-evaluate, missing-receipt-could-not-evaluate). Do not claim a tally until the post-C1 run prints it.

## 4. Drafted rows (NOT written; append-only at the end of SKILL.md under a new `## Round 29 — …` heading, header + separator exactly as in section 2)

```
## Round 29 — registry rows for the release-pin counter and restated tallies (2026-10-26; append-only; never edit above)

<one-paragraph prose: C1 repaired s106 self-test; C2 frozen doc-bound counter; C3 new counter; round-28 rows for s106/selfassessment were nonconformant (name parentheses, no --selftest) and are superseded by the rows below>

| Name | Kind | Entry command | Verdict map | Self-test | Pinned-value path | Write scope | Owner |
|---|---|---|---|---|---|---|---|
| release-pins | gate | `node scripts/check-release-pins.mjs --rev REV --stable A.B.C.D [--receipt PATH] [--json]` | 0=clean (population>=1, unresolved=0); 1=failed (one or more unresolved rows); 2=could-not-evaluate (usage, unreadable revision, registry absent, malformed --stable, unparseable receipt, empty population) | `node scripts/check-release-pins.mjs --selftest` (cases=20, passed=20) | `scripts/check-release-pins.mjs` CASES table; `corpus/evidence/round-29/release-pins/receipt.json` + `bytes/` + `refetch/`; `.ufo/waves/round-29/claims.json` C3 | stdout/stderr only; production reads committed git blobs and never fetches; self-test writes and deletes only its own temporary repositories | tabi L1 |
| s106-evidence | gate | `node scripts/check-s106-evidence.mjs --rev REV [--json]` | 0=clean (revision_match, sha_match, anchor_located, anchor_unique, byte_count_match); 1=failed (revision/source bytes or evidence mismatch); 2=could-not-evaluate (usage, unresolved revision, missing receipt/source bytes, malformed receipt) | `node scripts/check-s106-evidence.mjs --selftest` (cases=<N>, passed=<N>; N measured after C1 lands, N >= 7) | `scripts/check-s106-evidence.mjs` CASES table; `corpus/evidence/round-26/sources/s106.json` + decoded bytes; `corpus/evidence/round-29/s106-selftest/mutation.txt` | stdout/stderr only; committed git blobs read; self-test writes and deletes only its own temporary repositories | tabi L1 |
| selfassessment-counter | gate | `node scripts/check-selfassessment.mjs --rev REV [--json]` | 0=clean; 1=failed (one or more mismatches); 2=could-not-evaluate (usage, unreadable revision, git failure); 3=self-test disagreement | `node scripts/check-selfassessment.mjs --selftest` (cases=22, passed=22) | `scripts/check-selfassessment.mjs` CASES table; `corpus/evidence/round-24/c2-measurements.json`; counter sha256 `728128008e2242b635bda30a28313de20b06d381d7855f11f18fa5043ba560c4` | stdout/stderr only; executes lane scripts gates and read-only Git receipts; self-test writes and deletes only its own temporary repositories | tabi L1 |
```

Placeholders: only `<N>` in the s106 row; replace it with the number from the post-C1 `S106_SELFTEST verdict=clean cases=N passed=N` line (claims.json C1 requires N >= 7). If C1 does not land, write `cases not measured (self-test exits 1, ReferenceError existsSync)` but keep the literal `` `node scripts/check-s106-evidence.mjs --selftest` `` so the selftest field passes — and do not put a digit-bearing tally in it.

Verification of the draft (scratch clone, appended the three rows above with N omitted from tally, committed in the scratch only): `node scripts/check-gate-registry.mjs --rev HEAD` → `GATE_REGISTRY verdict=clean … rows=32 gates=18 nonconformant=0 findings=0`, exit 0. (The `<N>` literal contains no digit, so it parsed the same as in the scratch test, which used `cases=N`.) Remember the gate is evaluated at a committed revision: the rows only count once the commit lands.

## 5. m1 stale-tally exposure (check-selfassessment.mjs)

- The m1 counter reads ONLY `SCORECARD.md` (:402, `m1Findings` :184) and `LOG.md` (:405-406, `m1LogFindings` :280). It does NOT read `SKILL.md` (evaluate :400-419). Therefore no SKILL.md registry line — including the drafted rows and the stale historical ones — can be read as an m1 stale claim. Registry rows are safe from the counter.
- Stale-tally-bearing SKILL.md lines that m1 does not see but a human reader would misread (all superseded by the round-29 append; none counted): :2479 `cases=13` (selfassessment, actual 22), :2515 `cases=17`, :2530 `20 cases` (actual 22), :2514 `cases=5` (s106, actual ≥7), :2529 `7 cases` (s106, not measured), :2478 `cases=22` (gate-registry, not re-measured here).
- The tally shapes m1 recognises on any line in SCORECARD/LOG (:122-126, :194-199, :288-296): `` `--selftest` (N/N) ``, `N-case`, `cases=N`, `N cases`, `N isolated cases`, `N CLI cases`; the LOG supersession statement helper additionally reads `cases:N` and any `a/b`. A line is judged only if it contains `self-test` or `case` (:191, :287), sits in a `##` section naming a runnable gate script (`RUNNABLE_GATE` :79: `check-*.mjs` or `round-evidence-audit.mjs`) and names that script on its own line, or is the section's only script.
- If the registry text or a round-29 summary is mirrored into SCORECARD.md or LOG.md, the drafted tallies must equal the oracle (gate's own self-test at the measured rev, only when the rev blob is byte-identical to the runnable working copy, :147-156): release-pins 20, selfassessment 22, s106 N from the post-C1 run. Any other number on a line naming that script counts as a mismatch (:408) unless a later paragraph (LOG) or later line (SCORECARD) names the stale line's own document+line and states the correct number with a correction marker (:231-239, :323-334, `citesLine` :269-277).
- Hazards: (a) a line naming both `check-selfassessment.mjs` and `check-s106-evidence.mjs` with one tally is compared with both gates (:216); (b) while `check-s106-evidence.mjs --selftest` still crashes, any tally attributed to it is could-not-evaluate (no oracle tally, :171-172), counted as `couldNotEvaluate`, not a mismatch; once C1 lands it becomes live and a wrong number there will count; (c) the gate's oracle requires the gate blob at `--rev` to match the working copy, so measure in a clean checkout of REV.
- Known stale m1 population at baseline (claims.json C2): SCORECARD.md:410, :1138, :1139, :1151, :1439 and LOG.md:221 — not registry lines; separate C2 corrections.

## 6. Commands run (all read-only or scratch-only)

- `node scripts/check-gate-registry.mjs --rev 97be89bc66139eb45526a04af59a35dccc006eb9 --json` → findings listed in section 3 (nonconformant=3).
- `node scripts/check-gate-registry.mjs --rev HEAD` → verdict=failed, nonconformant=3.
- In scratch clone at 190052c with `TMPDIR=<scratch>`: `--selftest` of check-release-pins (exit 0, cases=20 passed=20), check-selfassessment (exit 0, cases=22 passed=22), check-s106-evidence (exit 1, ReferenceError existsSync).
- Scratch draft append + `node scripts/check-gate-registry.mjs --rev HEAD` → clean, nonconformant=0, exit 0.
- No tools installed. Unresolved: the s106 N value (depends on C1 landing).
