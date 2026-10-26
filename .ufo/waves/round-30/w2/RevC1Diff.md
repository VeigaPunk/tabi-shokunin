# RevC1Diff (w2) — attack on C1's "only self-test code changed" premise

Seat: RevC1Diff · round 30 w2 · lane tip measured `072af95fe2822f0785a6ff88a578e2142dd258e5` · baseline `f7c0317e4f8445502005e79e3d65767430912dab` · 2026-10-26

## Verdict

**Holds.** I attacked C1's separability premise on the two C1 gate scripts: every hunk of
`git diff f7c0317e… 072af95fe2… -- scripts/check-s106-evidence.mjs scripts/check-release-pins.mjs`
(139 insertions, 4 deletions, 6 hunks) is in a self-test region or the header comment; the one hunk inside a
CLI function (`check-release-pins.mjs:537`, in `main()`) is confined to the `if (opts.selftest)` branch and is
unreachable on a production run, whose remaining lines are byte-identical; `evaluate()` and every other
production declaration in both files are byte-identical baseline→tip; all 40 catalogue find strings occur
exactly once at the tip and every catalogued check block is byte-identical baseline→tip; and the two named
production readings are unchanged and clean. No defect found in the premise. One precision note (§2, main():
537) and residual-risk items (§6) are recorded below; none rises to a defect of the premise.

Receipts (commands, raw outputs, structural JSON) are in `.ufo/waves/round-30/w2/RevC1Diff/`
(`gate-scripts.diff`, `analyze.json`, `s106-reading-tip.txt`, `pins-reading-tip.txt`, `s106-reading-base.txt`,
`base-pins-reading.txt`, `s106-selftest-tip.txt`, `pins-selftest-tip.txt`). Measurement environment: one
`git clone --shared` of the lane into `/fast/scratch/hyaku/tabi-r30/RevC1Diff/clone`, `checkout -q
072af95fe2…`; `git status --porcelain` empty before and after all runs; `TMPDIR=/fast/scratch/hyaku/tabi-r30/RevC1Diff/tmp`
for every node run; no lane file written, no network fetch, no tool installed.

Frozen-input check in the clone at tip: `sha256sum scripts/check-gate-mutants.mjs scripts/gate-mutants.json` →
`02945f882ea9…3a55` and `cd1c27a2a971…3833` — byte-equal to `claims.json:frozenDigests`. Exit 0.

## 1. Hunk inventory and attribution (all 6 hunks)

| # | file | tip lines | nature | enclosing region | self-test? |
|---|------|-----------|--------|------------------|------------|
| 1 | check-s106-evidence.mjs | 8 | modify 1 line | file header comment block (lines 1–43, before first decl) | header comment: `// Self-test: … (7 isolated cases` → `(10 isolated cases` |
| 2 | check-s106-evidence.mjs | 161–166 | pure addition | between `FIXTURE_SHA` (160) and `fixtureReceipt` (168): two new fixture consts + comments | self-test fixture data |
| 3 | check-s106-evidence.mjs | 233–278 | pure addition | inside `CASES` (183–292) | self-test data: 3 new cases |
| 4 | check-release-pins.mjs | 356–435 | pure addition | inside `CASES` (315–437) | self-test data: 9 new cases |
| 5 | check-release-pins.mjs | 490–494 | modify 2 lines | inside `runSelftest` (473–504) | self-test runner: reason-string pinning of case outcomes |
| 6 | check-release-pins.mjs | 537 | modify 1 line | inside `main` (521–563), **inside the `if (opts.selftest)` branch** | self-test reporting (see §2) |

New s106 fixture consts are used only by case builders: `FIXTURE_TAMPERED_BYTES` at lines 163 (def) and 242;
`FIXTURE_BYTES_DUPLICATE_ANCHOR` at 166 (def), 254, 258, 259 — all inside `CASES` (183–292). `CASES` is read
only in `runSelftest` in both files (s106 line 342; pins line 475); no production reference
(`analyze.json:identifierUsage`). The 6 added lines at 161–166 contain no code references at all beyond the
two const definitions over `FIXTURE_BYTES`/`FIXTURE_LINE`.

## 2. Production byte-identity (function-body level)

I extracted every top-level declaration in both files at base and tip and compared the bodies byte-for-byte
(`analyze.json:decls`; extraction = decl start line through the line before the next top-level decl).

- **check-s106-evidence.mjs: 20 of 24 declarations byte-identical.** Production set — `SCHEMA`,
  `SELFTEST_SCHEMA`, `RECEIPT_PATH`, `RECEIPT_SCHEMA`, `LANE`, `Refusal`, `git`, `readBlob`, `resolveRev`,
  `sha256`, `parseReceipt`, `evaluate`, `parseArgs`, `main` — all identical, including **`evaluate`
  (tip sha `e65257424888`, base sha `e65257424888`)**. Non-identical: `CASES` (self-test data), and the two
  new consts `FIXTURE_TAMPERED_BYTES` / `FIXTURE_BYTES_DUPLICATE_ANCHOR` (new self-test fixtures).
  `FIXTURE_SHA` is flagged non-identical only as an extraction artifact — its body window stretched over the
  inserted consts; its own statement is byte-identical in both revisions:
  `const FIXTURE_SHA = sha256(FIXTURE_BYTES);`
- **check-release-pins.mjs: 39 of 42 declarations byte-identical.** Production set — `SCHEMA`,
  `SELFTEST_SCHEMA`, `SOURCES_PATH`, `DEFAULT_RECEIPT`, `BYTES_ROOT`, `REFETCH_ROOT`, `LANE`, `VERSION_RE`,
  `ROW_RE`, `TAG_RE`, `Refusal`, `git`, `resolveRev`, `blob`, `sha256`, `refetchFor`, `cmpVersion`,
  `parseRegistry`, `normDash`, `rangeToken`, `anchorHasRange`, `rowDigests`, `digestMatches`, `normLine`,
  `blockIn`, **`evaluate`** — all identical. Non-identical: `CASES` (data), `runSelftest` (self-test runner),
  `main` (exactly one line, no. 537).
- **`main()` precision note (holds with this caveat):** the changed line 537 is the non-JSON `CASE` print
  inside `if (opts.selftest) { … process.exit(out.ok ? 0 : 3); }` — executed only with `--selftest`, and
  `process.exit` precedes any production code path. The production tail of `main` (arg checks, `evaluate(…)`,
  `UNRESOLVED`/`RELEASE_PINS verdict=` printing, `process.exit(out.clean ? 0 : 1)`) is byte-identical. So
  "CLI production paths byte-identical" is true; the changed line is self-test reporting, added to print the
  `expected_reasons`/`reasons` pinning introduced by hunk 5.

## 3. Catalogue find strings — exactly once, byte-identical blocks

`scripts/gate-mutants.json` at tip = 40 rows (27 fault + 13 benign; ids listed in `analyze.json:catalogue`).
For every row: **occurrences of the literal `find` string in its target script at tip = 1** (and also 1 at
baseline), so no counter exit-2 condition on uniqueness. 37 finds are single-line and sit on lines
byte-identical baseline→tip. 3 finds are multi-line and my line-level check cannot represent them:
`s106-revision-true` (fault) and `s106-revision-eq-swap` (benign) — the `const revisionMatch = measuredBytes !== null && …`
block, s106 `evaluate` lines 116–117; `pins-f6-refetch-all` (fault) — the `const confirmed = rf && …` block,
pins `evaluate` lines 218–219. Extracted blocks compared baseline→tip: **byte-identical in all 3**, and all 3
live in `evaluate()` — the production code this premise freezes. Conclusion: every catalogued check line is
byte-identical at the tip.

## 4. Production readings — unchanged, clean clone

All runs in the shared clone (tip) or its detached baseline worktree (`$S/base-wt` at `f7c0317e…`), `TMPDIR`
under scratch. Raw outputs in the receipt files named.

```
TMPDIR=$S/tmp node scripts/check-s106-evidence.mjs --rev 072af95fe2822f0785a6ff88a578e2142dd258e5
  → exit 0
  S106_EVIDENCE verdict=valid rev=072af95fe2822f0785a6ff88a578e2142dd258e5 present=true sha_match=true anchor_located=true valid=true
TMPDIR=$S/tmp node scripts/check-release-pins.mjs --rev 072af95fe2822f0785a6ff88a578e2142dd258e5 --stable 156.0.8078.47
  → exit 0
  RELEASE_PINS verdict=clean rev=072af95fe2822f0785a6ff88a578e2142dd258e5 stable=156.0.8078.47 population=23 resolved=23 unresolved=0 holds=16 drifted=7
TMPDIR=$S/tmp node scripts/check-s106-evidence.mjs --rev f7c0317e4f8445502005e79e3d65767430912dab   (baseline worktree)
  → exit 0
  S106_EVIDENCE verdict=valid rev=f7c0317e4f8445502005e79e3d65767430912dab present=true sha_match=true anchor_located=true valid=true
TMPDIR=$S/tmp node scripts/check-release-pins.mjs --rev f7c0317e4f8445502005e79e3d65767430912dab --stable 156.0.8078.47
  → exit 0
  RELEASE_PINS verdict=clean rev=f7c0317e4f8445502005e79e3d65767430912dab stable=156.0.8078.47 population=23 resolved=23 unresolved=0 holds=16 drifted=7
```

Tip verdicts are string-identical to baseline verdicts (same fields, same counts: population 23, holds 16,
drifted 7; `valid=true`; `unresolved=0`). Production readings unchanged.

## 5. Extra no-harm evidence: pristine self-tests clean at tip

```
node scripts/check-s106-evidence.mjs --selftest    → exit 0, "S106_SELFTEST verdict=clean cases=10 passed=10"
node scripts/check-release-pins.mjs --selftest     → exit 0, "RELEASE_PINS_SELFTEST verdict=clean cases=29 passed=29"
```

The updated header comment ("10 isolated cases") now matches the real case count — the previously stale "7"
was made truthful. The new pins cases pin each failing run to its reason strings (`reasons: [...]` matched via
`row.reasons[i].startsWith(p)`), which is the behavioural attribution shape wave-1 `CritC1Counter` §7 asked
for; the added lines reference none of `process.cwd()`, `process.ppid`, `process.env`, `import.meta.url`, or
any git blob read (verified over the full diff, `gate-scripts.diff`).

## 6. Residual risk and what I did not run

- **Not run here:** `node scripts/check-gate-mutants.mjs --rev … --json` itself (the C1 counting command) —
  this seat's item is the diff premise plus the two named readings; the counter measurement belongs to the
  designated measurement seat. Counter and catalogue bytes at tip were verified equal to `frozenDigests`, so
  the premise inputs are in place. Nothing in this report should be read as an `fs`/`bk` measurement.
- **Scope:** premise verified for these two scripts only; other round-30 changes (corpus, rows, lesson) are
  outside C1's separability surface for the counter, and outside my item.
- **w1 counter leak is orthogonal:** this diff neither introduces nor closes the `mutant-<i>` cwd channel
  from w1 `CritC1Counter` §2 — the counter bytes are unchanged; kills must still be attributed by reading
  `failing_cases`.
- Scratch hygiene: one clone + one baseline worktree under `/fast/scratch/hyaku/tabi-r30/RevC1Diff/`;
  `git worktree add` metadata lives in the scratch clone only; lane untouched (all lane git calls read-only:
  `clone`, `checkout`, `show`, `diff`, `status`).

Report: .ufo/waves/round-30/w2/RevC1Diff.md
