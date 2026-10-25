# RevGateRegistryImpact — the gate-registry check with two new gates (round 25, wave 1)

Seat: reviewer, read-only. Lane HEAD at review: `c8ef3084c6363f265b9d23285296ab3547654f57` (round-25 freeze commit; baseline `9e13666…` is its parent, checked with `git merge-base --is-ancestor`).
Scratch: `.ufo/waves/round-25/scratch/RevGateRegistryImpact/` (gitignored by `.gitignore:5`). It keeps `rows.md` (the final drafted block) and `sa-*.json`. The fixture repos were deleted after each run.
Tool installs: none.

## Verdict

Keeping `nonconformant=0` is **feasible, and I measured it**. If both scripts land together with the two drafted rows below, `check-gate-registry` returns `verdict=clean gates=16 nonconformant=0`. If either part lands without the other, the result is `nonconformant=2`. The registry gate can only check that a row is present and well-formed. It cannot check that the row tells the truth about the script: the flag spelling, the exit codes and the case count all go unchecked. Those must be matched by hand against the landed scripts. The lane copies of both scripts are still being written: they changed hash four times during this review, and **both self-tests crashed at the hashes I ran**.

## How the gate decides (cited)

- The set of gates comes from the tree, not the registry: `GATE_CONVENTION = /^(check-[a-z0-9-]+|[a-z0-9-]*audit[a-z0-9-]*)\.mjs$/` over `scripts/` at the revision, plus any `.mjs` named in a gate-kind row's entry or self-test cell (`scripts/check-gate-registry.mjs` `evaluate()` and `scriptsInRow()`).
- A row belongs to a gate if `r.name === gate.name` (the convention name is the file's basename, e.g. `check-bfcache-receipt`) **or** the row's entry/self-test cell names the script. The latest such row in the document wins.
- `missingFields()` checks:
  - the verdict text has `0=clean`, `1=failed`, and `2=could-not-evaluate` (or `usage`/`refus`);
  - the self-test cell matches `/--self-?test\b/`;
  - the pinned cell is at least 8 characters and contains `/`, `.` or a hex string;
  - the scope cell is at least 10 characters and contains a read/write/temp/stdout/no-style word;
  - the owner matches `tabi|lane|L1`.

  Exit code 3, case counts and flag behaviour are not checked.

## Baseline measurement

| Command (run from lane root) | Result |
|---|---|
| `node scripts/check-gate-registry.mjs --rev HEAD` | `verdict=clean rev=c8ef3084… rows=23 gates=14 nonconformant=0`, exit 0 |
| `node scripts/check-gate-registry.mjs --rev 9e13666759bcf30665abec84dec13adefc1fa86a` | `verdict=clean rows=23 gates=14 nonconformant=0`, exit 0 |

## Landing variants (fixture repos)

Each fixture is `git archive HEAD | tar -x` into a fresh `git init` repo, with only the change listed in the row. The check was then run with `node scripts/check-gate-registry.mjs --repo <fixture> --rev HEAD`.

| Variant | Result |
|---|---|
| V0: both scripts, no rows | `gates=16 nonconformant=2`: `e1-missing-row` for `check-bfcache-receipt` and `check-source-reopen-receipt`; exit 1 |
| V1 / final: both scripts plus the drafted block below | `verdict=clean rows=25 gates=16 nonconformant=0 findings=0`; exit 0 |
| V2: rows land before the scripts | `nonconformant=2`: `e3-row-script-absent` at lines 2489 and 2490; exit 1 |
| V3: only the C1 script and only the C1 row | `gates=15 nonconformant=0`; exit 0 (each gate can land on its own) |
| V4: C1 entry cell also names a scratch harness `.ufo/waves/round-25/scratch/ExecHarnessC1/journey.mjs` | `gates=17 nonconformant=1`: `e3-row-script-absent`. Scratch is gitignored, so this always fails |
| V5: row spells `--self-test` but the script accepts only `--selftest` | registry **clean**, exit 0. The script itself refused that flag (`unknown argument: --self-test`, exit 2) |
| V6: C1 row drops the code-2 clause | `e2-field-incomplete missing=verdictMap`; exit 1 |
| V7: C1 row's kind is `probe` | `e1-missing-row`; exit 1 (a `check-*` file cannot be registered as a probe) |

## Drafted rows (final text, simulated clean as shown)

Append this as a new `##` block at the end of `SKILL.md`, after line 2479. Do not add the rows to the round-24 table: its prose fixes that table's `nonconformant=0` claim to the round-24 tip.

```markdown
## Round 25 — gate registry rows (2026-10-25; append-only; never edit above)

Two gates enter the lane's convention set this round (`scripts/check-*.mjs`), so
`node scripts/check-gate-registry.mjs --rev <REV>` derives them from the tree, not from this table;
each needs its own eight-field row or it is `e1-missing-row`. No row above is edited.

| Name | Kind | Entry command | Verdict map | Self-test | Pinned-value path | Write scope | Owner |
|---|---|---|---|---|---|---|---|
| bfcache-receipt | gate | `node scripts/check-bfcache-receipt.mjs --rev REV [--json]` | 0=clean (receipt present and valid, restores>=1); 1=failed (receipt present but invalid, or restores=0; one stable finding id per broken check); 2=could-not-evaluate (usage, unresolvable revision, git failure, receipt absent at the revision); 3=self-test disagreement | `node scripts/check-bfcache-receipt.mjs --selftest` (cases=14, passed=14) | `scripts/check-bfcache-receipt.mjs` CASES table; `corpus/evidence/round-25/bfcache/receipt.json` (`events_sha256` binds the raw events array) | stdout/stderr only; production reads committed git blobs, launches no browser and opens no socket; self-test writes and deletes only its own temporary repositories | tabi L1 |
| source-reopen-receipt | gate | `node scripts/check-source-reopen-receipt.mjs --rev REV [--json]` | 0=clean (receipt present, reopened=6, unresolved=0); 1=failed (any row unresolved, a declared row missing, or a summary count mismatch); 2=could-not-evaluate (usage, unresolvable revision, git failure, receipt absent or unreadable at the revision); 3=self-test disagreement | `node scripts/check-source-reopen-receipt.mjs --selftest` (cases=12, passed=12) | `scripts/check-source-reopen-receipt.mjs` CASES table and declared row set (S013, S015, S016, S020, S023, S024); `corpus/evidence/round-25/freshness/reopened.json`; `corpus/SOURCES.md` at the same revision for supersession pointers | stdout/stderr only; production reads committed git blobs and never fetches (fetch date and digest are receipt fields); self-test writes and deletes only its own temporary repositories | tabi L1 |
```

The `cases=14` and `cases=12` figures are **[INFERENCE]**. They are static counts of `name: "…", exit: N` entries in the CASES tables (`rg -o 'name: "[a-z0-9-]+", exit: [0-9]' <script>`) at hashes `2331928df3c01806` (bfcache) and `97f8894376b370a6` (source-reopen). No self-test passed green at any hash I ran. The L1 must replace both figures with the `cases`/`passed` values printed by `node scripts/<gate>.mjs --selftest` at the landing commit.

## Do the spellings and verdict maps match the planned behaviour?

Checked against the lane's untracked `scripts/*.mjs` header comments and `main()`, and against the prototype `.ufo/waves/round-25/scratch/ExecCounterC1Proto/check-bfcache-receipt.mjs`.

- **Self-test flag.** Both lane scripts accept only `--selftest` (`args.includes("--selftest")`). In their header and usage lines, `--selftest` is the first match of `/--self-?test\b/`. That matters because `check-selfassessment.mjs` spawns each gate with the first spelling it finds in the gate's source, so neither script should mention `--self-test` before that point. Any other spelling falls through to the usage path, which exits 2 (the probe of `--self-test` returned 2). The drafted rows spell `--selftest`, which **matches**.
- **C1 verdict, code 0 vs 1.** The landed header says "1 failed (present but invalid, or restores=0)", so a valid receipt with `restores=0` exits 1. The prototype exited 0 in that case. The drafted row follows the landed header. If the L1 goes back to the prototype's meaning, the 0 and 1 clauses must change too.
- **C1 and C2 code 2.** Both lane headers declare code 2 for usage, missing receipt, and git failure; C2 also covers a malformed row. Both rows **match**.
- **Exit 3 (mismatch).** Both lane scripts exit `s.exit = passed === results.length ? 0 : 1` in self-test mode, so a self-test disagreement exits **1**, the same code as `failed`. The three round-24 gates exit 3 here: `check-gate-registry.mjs` (`process.exit(out.ok ? 0 : 3)`), `check-selfassessment.mjs`, and `round-evidence-audit` (its row declares `3=self-test disagreement`). The C1 prototype also exits 3. The drafted rows declare 3, so **the scripts must change to exit 3**. Otherwise, remove `3=self-test disagreement` from both rows and add "(self-test mode: 1=self-test disagreement)". PROTOCOL.md §Gate standard (lines 380–382) requires every code a gate exits to be declared in its row.

## Findings by severity

**High: both lane gate self-tests crash, and a crash exits 1 ("failed"), not could-not-evaluate.**
- At `scripts/check-bfcache-receipt.mjs`, hashes `33c2f1d813eb15ac` and `158648ea105269a4`, `node … --selftest` threw `TypeError: Cannot read properties of undefined (reading 'filter')` at `score()`, on `r.events.filter(…)` (line 116, then line 129). Exit was 1.
- At `scripts/check-source-reopen-receipt.mjs`, hash `c98632ddb62d93a2` gave `SyntaxError: Unexpected end of input` (the file was truncated mid-write). Hash `df12f2bf9c79202b` gave `ENOENT … corpus/evidence/round-25/freshness/bytes/S013.html` in `writeCase`. Exit was 1 both times.
- An uncaught exception exits with node's default code 1, which the registry maps to `failed`. A crash on a malformed receipt therefore reads as a measured failure. Both headers say a malformed receipt should give `f2-invalid-schema`, and could-not-evaluate is reserved for an unreadable receipt.
- Fix: catch non-domain errors in `main()` and exit 2.
- These were in-flight files (untracked, hash changing every ~30s), so they may be fixed before landing. Re-check at the landing commit.

**Medium: a crashing self-test leaks temp directories.**
- Both scripts create a per-case `r2 = mkdtempSync(…"tabi-*-case-")` and remove it with `rmSync(r2…)` inside the loop body (`check-bfcache-receipt.mjs:212/261`, `check-source-reopen-receipt.mjs:207/258`). The `finally` block removes only `root`, so any exception leaves `r2` behind.
- Observed: `/tmp/tabi-bfcache-case-*` and `/tmp/tabi-source-reopen-case-*` directories were left by crashed runs (`ls -d /tmp/tabi-bfcache-case-* /tmp/tabi-source-reopen-case-*`).
- I removed only the three my runs created: `tabi-bfcache-case-iOWSH7`, `tabi-bfcache-case-YVtg3r` and `tabi-source-reopen-case-jCRlpu`, matched by mtime to my runs and by the `ENOENT` path in my output. The others belong to another seat's runs and were left in place.
- The write-scope cell says "deletes only its own temporary repositories". Until removal moves into `finally`, that statement is false on the crash path.

**Medium: self-test disagreement exits 1, which collides with `failed`.** See "Exit 3" above.

**Medium: the registry cannot see a mismatch between a row and its script.**
- V5 shows a row spelling `--self-test` against a script that rejects it still passes `nonconformant=0`. The case count in a SKILL.md row is not checked by any gate either: `check-selfassessment.mjs` m1 reads `SCORECARD.md` only. `rg -n 'SKILL\.md' scripts/check-selfassessment.mjs` finds it only inside fixture strings.
- The only mechanical tally check is through `SCORECARD.md`. I simulated it on the V1 fixture with an appended SCORECARD line ``| C1 | `scripts/check-bfcache-receipt.mjs` `--selftest` (N/N) | landed |``, using the prototype script (which printed `cases=7`):
  - `7/7`: `mismatches=0`, exit 0 (claimed 7, observed 7).
  - `8/8`: `mismatches=1`, exit 1 (claimed 8, observed 7). Recorded in `sa-good.json` and `sa-stale.json`.
- So the capability-table rows in SCORECARD must carry the measured tally, with each gate named on its own line. A line naming both gates with one tally is "ambiguous script association": could-not-evaluate, not a match.

**Low: keep other `.mjs` paths out of the entry and self-test cells.** V4 shows that naming the probe harness, or any scratch or untracked `.mjs`, in those cells adds it to the gate set and gives `e3`. Put harness paths in the pinned or scope cells, which are not scanned. Also, if the journey probe lands under `scripts/`, its name must not match `check-*` or `*audit*`; otherwise it becomes a gate needing a gate row, and a probe row gives `e1` (V7).

**Low: landing order.** The scripts and rows must land in the same commit, or with rows following scripts within the round, before the closeout measurement. Either one alone gives `nonconformant=2` (V0 and V2). The round-24 table must not be edited (append-only). Supersession is not involved: no earlier row names either script or uses these row names.

## Residual risk and gaps

- **C2 kill rule vs the row.** The claim says that a row whose fetch failed at measure time is could-not-evaluate, and that more than one such row makes the target miss. That implies exactly one such row is tolerated, and that rule is neither in the landed header nor in my row. The landed header has no per-row could-not-evaluate class at all; a malformed row is whole-receipt code 2. Either the counter implements the 1-row allowance and the row's code-1 clause says "more than one row could-not-evaluate", or the L1 records that the claim's per-row clause is unimplemented. This is a contract gap for CritC2Vacuity and the integrator, not something the registry check can catch.
- **No green self-test observed.** The L1 must record both case counts at the landing commit; my figures are static counts.
- **Case-list churn.** The C1 lane script went from 10 named cases (hash `158648ea…`) to 14 (`2331928d…`), and the newer list includes a `forgiven-flag` case. I did not compare these against MutC1Counter's eight mutants.
- **Checks I did not run:** lane gates at a post-integration commit, LSP references (the targets are plain Node scripts with no LSP server in scope, so text and `rg` reads were the only option and are not semantic proof), and `check-selfassessment` against the real landed scripts.
