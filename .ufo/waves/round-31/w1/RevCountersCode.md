# Round 31 w1 — seat RevCountersCode (code review of the frozen counters)

Date: 2026-10-26. Lane: tabi. Base: 9505a10eb80b2a0b273ebaba3f7f872ad302192d (freeze), baseline 96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc.

## Verdict

Both frozen counters are correct on their claims' happy path — at the freeze tree the C1 counter exits 1 with
population 0 (entry absent, the claimed "before"), the C2 v2 counter exits 1 with exactly the nine claimed
mismatches (SKILL.md 1614/2479/2514/2515/2529/2530/2543/2544, corpus/README.md:613, observed 26/30/10/30/10/30/29/10/30), both self-tests pass (34/34 and 30/30, exit 0), both honour `TMPDIR` via `os.tmpdir()` and contain no hardcoded `/tmp`. The defects found are robustness and verdict-semantics gaps on the edges, none of which affect the round-31 measurement as specified:

1. **C1 `normalise` crashes with an uncaught `RangeError` on an out-of-range numeric HTML entity** (`&#1114112;` → `String.fromCodePoint` throws, line 141) — the process dies with a stack trace and exit 1, no JSON verdict; one bad entity in any cited page's fetched bytes aborts the whole evaluation.
2. **C1 Markdown table parse is silent and misattributing**: a cell containing an escaped pipe `\|` (legal Markdown) yields a 7-cell row that fails with a misleading `t2-signal` reason (probe P2); a data row without the trailing `|` (legal Markdown) silently truncates the table (population 0, exit 1, no diagnostic; probe P3); only the first header-matching table is read and the header search is not code-fence-aware.
3. **C2 verdict semantics: `could-not-evaluate` findings never fail the gate** — `clean` is `counted.length === 0`, so if any gate's blob differs from its working copy (or a gate is absent), every tally becomes could-not-evaluate and the counter exits 0 with mismatches 0 while comparing nothing (probe P5). The claim predicate "exits 0 and reports mismatches = 0" is satisfiable vacuously; the `--json` output does carry `couldNotEvaluate`, but the claim's `jq '{mismatches, counted}'` drops it.
4. **C2 oracle ignores the gate's own self-test health**: `gateTally` records `exit`/`tally` but only the `cases=N` number is compared; a gate whose self-test fails (exit 3, `passed=11`) still serves as a matching oracle, so a document claiming `(cases=13, passed=13)` stays clean against a broken gate (probe P6).
5. **C2 documented tally shapes are scanned inconsistently**: the line-level claim patterns accept `cases=N` but not the documented `cases: N` (probe P4; `statedTallyNumbers` accepts both), and fraction claims are anchored within 24 chars of `--selftest` (probe P7) — stale tallies written in those shapes are silently missed (false negatives only, fail-open in the "missed stale line" direction, mitigated by the 0-deleted-lines kill rule).

Evidence below is the actual commands and exit codes. Findings are recorded for the next round; the counters are frozen and were not modified. No tools were installed (none required; no pacman transaction).

## Evidence

### 1. Frozen digests match claims.json at the freeze commit

```
$ git -C /fast/scratch/hyaku/tabi-r31/RevCountersCode/clone show 9505a10...:scripts/check-decision-table.mjs | sha256sum
d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832
$ git -C ... show 9505a10...:scripts/check-selfassessment.mjs | sha256sum
143d66ff2ba3fc2c113d461f1f2dd0555c94fb00b292e24eb4799e22dadb2fce
```
Both equal `frozenDigests` in claims.json.

### 2. C1 at the freeze tree (entry absent — the claimed "before")

```
$ node scripts/check-decision-table.mjs --rev 9505a10... --baseline 96a2d1a... --entry corpus/knowledge/rate-signal-decision-table.md --json
{ ..., "entryPresent": false, "tablePresent": false, "population": 0, "admitted": 0, "failing": 0, "clean": false }
$ echo $? → 1
```

### 3. C2 v2 at the freeze tree (the claimed "before": mismatches 9)

```
$ TMPDIR=$HYAKU_SCRATCH/tabi-r31/RevCountersCode/tmp node scripts/check-selfassessment.mjs --rev 9505a10... --json   (73.8s)
exit 1; mismatches 9; couldNotEvaluate 103; superseded 20
counted: SKILL.md:1614 25v26 · SKILL.md:2479 13v30 · SKILL.md:2514 5v10 · SKILL.md:2515 17v30 ·
         SKILL.md:2529 7v10 · SKILL.md:2530 20v30 · SKILL.md:2543 20v29 · SKILL.md:2544 7v10 ·
         corpus/README.md:613 17v30
```
Exactly the nine lines named in claims.json; observed values match the claims (26/30/10/30/10/30/29/10/30).

### 4. Self-tests

```
$ TMPDIR=$HYAKU_SCRATCH/tabi-r31/RevCountersCode/tmp node scripts/check-decision-table.mjs --selftest ; echo $?
DECISION_TABLE_SELFTEST verdict=clean cases=34 passed=34 ; exit 0
$ TMPDIR=$HYAKU_SCRATCH/tabi-r31/RevCountersCode/tmp node scripts/check-selfassessment.mjs --selftest ; echo $?
SELFASSESSMENT_SELFTEST verdict=clean cases=30 passed=30 ; exit 0
```

### 5. Probes (fixtures in scratch under $HYAKU_SCRATCH/tabi-r31/RevCountersCode/tmp; full JSON in `RevCountersCode/probes.json`, P1 fixture script `p1-fixed.mjs`)

| Probe | Result | Finding |
|---|---|---|
| P1 `&#1114112;` entity in receipt bytes | exit 1, stderr `RangeError: Invalid code point 1114112` at check-decision-table.mjs:141, no verdict line | **C1-1 crash path** |
| P2 escaped pipe `\|` in signal cell | population 1, failing 1, reason `t2-signal` (misattributed; real cause is cell splitting) | C1-2 |
| P3 data row without trailing `|` | population 0, tablePresent true, exit 1, no row diagnostic | C1-2 |
| P4 SKILL.md stale `(cases: 12, passed: 12)` | exit 0, mismatches 0 (stale line missed) | C2-5 |
| P5 gate blob ≠ disk (post-commit drift) | exit 0, mismatches 0, couldNotEvaluate 2, clean true | **C2-3 vacuous clean** |
| P6 gate self-test fails (exit 3, passed 11) + doc claims 13/13 | exit 0, mismatches 0 | C2-4 |
| P7 stale fraction 12/12 >24 chars from `--selftest` | exit 0, mismatches 0 (missed) | C2-5 |

### 6. TMPDIR / temp hygiene

- No literal `/tmp` anywhere in either script (`grep -n '/tmp'` → no matches); both use `mkdtempSync(join(tmpdir(), ...))`, honouring `TMPDIR`; the C2 counter additionally passes `TMPDIR/TMP/TEMP` to each gate subprocess it spawns.
- Selftest/probe runs with `TMPDIR` under `$HYAKU_SCRATCH/tabi-r31/RevCountersCode/tmp` left nothing under `/tmp` (the single pre-existing `/tmp/tabi-sa-FYE6LA` is dated 04:48, before this seat's first run at 05:46, and is not ours).
- Minor: if `makeFixture` throws after `mkdtempSync` (e.g. fixture `git init` fails), that one temp dir leaks (cleanup is only in the `finally` of the loop, not around construction); same pattern in both counters.

## Findings (severity, line evidence)

### check-decision-table.mjs (C1)

- **C1-1 — Medium — uncaught `RangeError` on numeric entities (line 141).** `String.fromCodePoint(parseInt(k.slice(1), 10))` throws for any code point > 0x10FFFF (and hex `#x` equivalents, line 140). `normalise()` is called from `loadReceipt` (line 255) before any quote check, so a single malformed entity in a cited page's committed bytes crashes the whole run: `main` rethrows non-Refusal errors (line 469→472), node prints a stack and exits 1 with no `DECISION_TABLE verdict=` line. Exit 1 collides with the declared "failed" code, so the crash is indistinguishable from a legit failed verdict except by the missing JSON. Fail-closed for the claim, but the verdict contract ("declared exit codes") is violated and one bad row discards the evaluation of all rows.
- **C1-2 — Low/Medium — silent Markdown table parse failure.** `splitRow` (lines 193–198) splits on every `|` (no escaped-pipe handling) and requires the line to end with `|` after trim. (a) A cell containing `\|` yields 7 cells; `evaluate` (line 273) then falls back to `[cells[0], "", …]` so the row fails `t2-signal` — misleading reason, no parse diagnostic (probe P2). (b) A data row without the trailing `|` — legal Markdown — returns null from `splitRow` and `parseTable` **breaks** (line 213), silently dropping every later row from population (probe P3). (c) Only the first header-matching table is read (line 202) and the scan is not code-fence-aware; an example table with the same header inside a fenced block would hijack parsing. All fail-closed (no false admits), but population undercounts with zero diagnostics.
- **C1-3 — Low — registry row with a literal `|` in a cell is skipped.** `parseRegistry` (lines 98–107) requires `line.trim().split("|")` to be exactly 13 parts; any cell containing `|` (e.g. a source or used-by mention) drops the row silently, so its S-id later fails `r1-row-missing`. Fail-closed.
- **C1-4 — Info — `--live` cache key is (url, quote), not url.** Header comment says "one read-only HTTPS GET per cited row url", but `liveCache` (lines 261, 313) keys on `${g.url}\u0000${quote}`; two rows sharing a URL with different quotes fetch twice. Cosmetic doc drift.
- **C1-5 — Info — closed-vocabulary gaps.** `UNIT_RE` (line 58): `retries` has no singular `retry`; `DECISIONS` (line 52) requires `backoff` as one word (`back off` fails); `numbersIn` (lines 231–241) lacks forty/fifty/eighty/thousand/million (and `hundreds`); scientific notation (1e3) unsupported. All false negatives only, author-controlled.
- **C1-6 — Info — `git()` (lines 78–81) lacks the `GIT_CONFIG_GLOBAL/SYSTEM=/dev/null` scrubbing that C2's `git()` has; `curlFetch` inherits the operator env. Consistent hardening would help; no exploitable impact observed.

### check-selfassessment.mjs v2 (C2)

- **C2-3 — Medium — could-not-evaluate findings never fail the gate.** `evaluate` (lines 438–446): `counted` filters `observed !== null`; `clean` is `counted.length === 0`. `main` (line ~881) exits 0 when `clean`, irrespective of `couldNotEvaluate`. Probe P5: committing the gate, then drifting its working copy, yields 2 could-not-evaluate findings, mismatches 0, **exit 0**. Under the claim predicate ("exits 0 and reports mismatches = 0") a run in which every comparison was refused reads as clean; the `jq '{mismatches, counted}'` in the countingCommand drops `couldNotEvaluate`. The measurement rule's clean-checkout requirement mitigates this for round 31, but the frozen counter itself has no guard (e.g. failing clean on `couldNotEvaluate > 0`, or at least counting C-N-E as mismatches).
- **C2-4 — Low/Medium — oracle ignores gate self-test exit and passed count.** `gateTally` (lines 169–197) reads only the `cases=N` token of the summary line (last `<NAME>_SELFTEST` line, else fallback to the first `cases=`/fraction token, which retains the round-30 M8 shape for gates without a summary line). `exit` is recorded but never compared, and `passed` is ignored. Probe P6: a gate printing `verdict=failed cases=13 passed=11` with exit 3 still yields tally 13, so a document claiming 13/13 is clean against a broken gate.
- **C2-5 — Low — claim-shape grammar is narrower than documented.** Line-level patterns (lines ~120–122, reused in `m1Findings`/`m1LogFindings`): `\bcases\s*=\s*(\d+)` (equals only), while `statedTallyNumbers` (supersession, lines ~290–299) accepts `[:=]`; the fraction pattern is anchored to `--selftest` within 24 non-pipe chars, and bare `N/M` or `N of M` fractions are not claimed at all. Probe P4 (`cases: 12` stale line missed) and P7 (12/12 beyond 24 chars missed). The 0-deleted-lines kill rule and append-only constraint contain the exploit surface; still, the header's documented tally shapes are not all scanned.
- **C2-6 — Low — inconsistent env scrubbing.** `git()` (lines 85–93) nulls `GIT_CONFIG_GLOBAL/SYSTEM`, but the `spawnSync` calls in `m2Findings` (line ~380) and `m3Findings` (line ~407) and `gateTally`'s node spawn do not; `GIT_DIR`/`GIT_WORK_TREE` env vars are not scrubbed anywhere. Operator-env caveat.
- **C2-7 — Info — dead code.** `TALLY_PATTERNS` (line 122) is defined and never referenced; `statSync` imported (line 71) unused.
- **C2-8 — Info — exit 3 (selftest failure) is undocumented.** Header verdict table declares 0/1/2; `main` exits 3 on failed selftest. Header says "any other nonzero code is undeclared and reads as could-not-evaluate" — internally inconsistent.
- **C2-9 — Info — m3 mixes rev-blob and live-worktree state.** The newest `## Round N — executed disposition` heading is read from the blob at `--rev`, but `git status --porcelain` runs on the live worktree; running `--rev` older than the worktree checkout compares different states. The measurement rule (clean checkout of REV) covers the claim run.

## Verification gaps / notes

- The "before" C1 controls (c1-J1…J5) and the J-units for C2 were not re-run; the freeze-tree readings above reproduce the claimed `before` values for both counters exactly.
- 0-deleted-lines and byte-identical-counter checks are measurement-time steps, not counter behavior; not exercised here (frozen tree read-only).
- All runs were made in the seat's shared clone of the freeze commit (`git clone --shared`, checked out at 9505a10…) with `TMPDIR` under `$HYAKU_SCRATCH/tabi-r31/RevCountersCode`; no lane files were written by this seat. Tools installed: none.
