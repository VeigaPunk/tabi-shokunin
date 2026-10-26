# RevSelftestCodeRead — round 34 w2 (C2), code read of the BiDi gate self-test

Rev: freeze `59f1b47aae277e1670e4a824173da8cde7e388ee` → integration `04f9623dde8ad35d470cecf766e421eafbcb47fa`, file `scripts/check-bidi-runtime.mjs`. Frozen counter: `.ufo/waves/round-34/counters/c2-gate-mutants.mjs` (sha256 `3cf5eb699934eae48b77c991dae8761780c1c010da1121c1b9623a4d5d325b82`, matches `claims.json.frozenDigests`). Disclosed residual under audit (counter header "Known residual"): *a self-test that reads its own source and checks a whitespace-normalised find text is not refused by these probes; the guard for that construction is the wave-2 code read.*

## Verdict

**HOLDS.** The freeze→w1 diff touches exactly 8 regions, all inside lines 878–1166 (fixture builders + CASES + the pass condition), and every added line builds or observes *fixture bytes* and *gate evaluation output* — never the gate's own bytes. The file's only self-byte read is `const gateSource = readFileSync(fileURLToPath(import.meta.url));` at w1:1086, byte-identical to the pre-existing freeze:1037 line, consumed only by the two pre-existing gate-copy fixture paths (`w1:1127` `driverCopyOfGate`, `w1:1129` `gateBlob`), neither referenced by any new case. Zero new lines contain any fs/env/self-path primitive (`readFileSync` 3→3 lines, `process.env` 2→2, `fileURLToPath` 3→3, `import.meta` 3→3, `statSync`/`readdirSync`/`process.argv` all unchanged — a raw-line set scan finds **0 new primitive lines**). Zero new non-comment lines name a mutant id; zero new lines contain any ≥12-char fragment of any of the 20 frozen find/replace texts; the only added `.includes(` tests the gate's runtime refusal message (`firstDetail.includes(c.detailIncludes)`, w1:1164), i.e. output, not source — which is exactly why the decoy comment and the whitespace twin pass. All 20 MUTANTS find texts occur exactly once in each blob on the same line numbers (144–867) with byte-identical lines; the 7 "deleted" diff lines are the old sides of fixture-builder edits (878, 882, 948, 952, 1043, 1109–1110), none a rule line. Empirically: pristine, neutral-comment, decoy and twin(M19) self-tests all exit 0 (56/56), while mutants M19 and M16 each die with exit 3 and a `CASE ... FAIL` line naming the new v3 case — behavioral kills. The disclosed residual remains a *limit of the counter*, not a property of this implementation.

## Change surface (freeze → w1)

`git diff --numstat`: **62 added, 7 deleted**, one file. Opcode regions (freeze lines → w1 lines), with classification:

| w1 lines | change | class |
|---|---|---|
| 878, 882 | `goldenLines({...})` gains `bWsSessionSegment = null`; `wsUrl` template emits it when set | fixture-builder option (allowed) |
| 948–951, 955 | `lessonsDoc(ids, o = {})` gains `bGateRowNoSha` — the fixture `## Gate` row keeps URL+quote, loses the 64-hex sha | fixture-builder option (allowed) |
| 1020–1065 | 12 new CASES appended at the END of the array (`v3-a-m01/m03/m06/m08/m09/m10`, `v3-b-m04/m05/m07/m16/m18/m19`), expectations are static literals of pristine behavior; `build()` returns fixture data only (`ids`, `cell`, `run1`, `run2`, `driverText`, `samePath`, `sameBytes`, `bGateRowNoSha`) | added cases (allowed) |
| 1092 | runner passes `o` through: `lessonsDoc(["S002"], o)` | plumbing for the new option |
| 1157–1161 | `const firstDetail = out.entryDetail \|\| (out.rows.find((r) => !r.admitted) \|\| {}).detail \|\| null;` — reads the gate's **evaluation output object** | output observation |
| 1162–1165 | pass condition extended with `(c.detailIncludes === undefined \|\| (typeof firstDetail === "string" && firstDetail.includes(c.detailIncludes)))`; `results.push` gains `detail` fields | output observation (makes cases stricter) |

Case count reconciles with the integration facts: CASES objects 41 → 53 (all 12 new ids `v3-*`, 41 pre-existing case lines content-identical in place), plus the unchanged 3 fixed refusal meta-probes (`refusal-bad-rev-syntax`, `refusal-unresolvable-rev`, `refusal-no-entry-arg`, loop at freeze:~1119–1128 / w1:~1174–1183) → `cases=44` → `cases=56`, exactly the selftest totals printed.

## Cheat-channel audit (the four categories of the item)

1. **Own-bytes reads beyond `gateSource`: none.** All `readFileSync`/`import.meta`/`fileURLToPath`/`process.argv`/`process.env`/fs-scan lines are byte-identical in both blobs (line numbers: production 142, 565, 570, 588, 605; selftest 1037→1086 `gateSource`, consumed at 1078→1127 and 1080→1129 only). A raw-line set difference over 11 primitives: **0 new lines**. No new case sets `driverCopyOfGate`/`gateBlob`, so even the pre-existing gate-copy fixture paths gain no new consumers.
2. **Text sniffing: none.** No new line contains any ≥12-char fragment of any of the 40 frozen find/replace strings. The `detailIncludes` strings (`"sessionId repeated across runs"`, `"transcript path repeated across runs"`, …) match the gate's runtime refusal message on a fixture, which the pristine gate itself produces — hence decoy and twin probes pass (verified by run). Nothing scans comments or source.
3. **Environment keying: none.** `process.env` appears only in the two pre-existing production lines (XDG_RUNTIME_DIR at 588, chromedriver spawn env at 605). New cases seed fixtures with constants (`sha256("tabi-v3-a-session")`, literal hex), no `platform`/`hostname`/argv branching added.
4. **Mutant special-casing: none.** 0 non-comment new lines contain an uppercase mutant id (ids appear only in case-id labels and comments). All 56 results flow through one generic pass condition; no code path branches on mutation state, which the gate cannot observe — it never reads its own bytes except the two fixture paths above.

## Rule lines (MUTANTS find texts) unchanged

All 20 counter find texts (M01, M01b, M02…M19) occur **exactly once** in the freeze blob and **exactly once** in the w1 blob, on the *same* line numbers, byte-identical lines: 144 (M09/M10 DRIVER_ALLOW), 145 (M06 SESSION_ID), 146 (M08 CONTEXT_ID), 149 (M02 MEASURED), 373 (M03 verdict fold), 388 (M07 ws binding), 434 (M11 re-export), 447 (M12 relation), 750 (M16 gateRow sha), 753 (M15 host), 757 (M14 witness), 778 (M13 byte-copy), 797 (M04 path), 798 (M05 sha), 811 (M19 sid distinct), 843 (M01/M01b dup id), 860 (M17 admitted), 867 (M18 clean). Since every change region starts at line 878 and every rule line is ≤ 867, no rule line is touched; the 7 deleted diff lines are the old sides of the fixture-builder/runner edits. Full table: `receipts/rule-lines-identical.tsv`.

## Empirical probe run (corroboration — commands and exit codes)

Scratch clone (deleted after): `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone && git -C $S/clone checkout -q --detach 04f9623dde8ad35d470cecf766e421eafbcb47fa` → `rev-parse HEAD` = `04f9623dde8ad35d470cecf766e421eafbcb47fa`; worktree gate sha256 `370e8e95417e16dd3535f2dd5015a0b820655934200d489434fb642db7d86c87`; freeze blob sha256 `eded1be04a47fbd2b87fbff42ef5187e0d473e6fe2bca55ac1c622ab8bde61c1` (== `claims.json` C2 surface pin `eded1be0...61c1`). `node v26.12.0`, `TMPDIR=$S/tmp`, `GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null LC_ALL=C`. Variants built beside the gate in the clone (counter's construction: neutral = gate + `\n// tabi-r34 neutral edit\n`; decoy = gate + one comment per mutant quoting its replace text; twin = M19 find's first space doubled; mutants = find→replace, asserted count 1).

`node <script> --selftest` (cwd clone), each ~1.3 s:

| run | exit | result |
|---|---|---|
| pristine | 0 | `BIDI_RUNTIME_SELFTEST verdict=clean cases=56 passed=56` |
| neutral | 0 | clean 56/56 — not keyed on own bytes |
| decoy | 0 | clean 56/56 — no source sniffing |
| twin-m19 | 0 | clean 56/56 — no find-text check in source |
| mut-m19 | 3 | `CASE id=v3-b-m19-sessionid-repeated expected_exit=1 exit=0 ... expected_reason=t1-receipt reason=- FAIL`; verdict=failed 55/56 |
| mut-m16 | 3 | `CASE id=v3-b-m16-gate-row-without-sha expected_exit=1 exit=0 ... expected_reason=s1-source-row reason=- FAIL`; verdict=failed 55/56 |

Kills are behavioral: the mutant changes evaluation output on a fixture, the case observes it, exit 3 with a `CASE ... FAIL` line — the counter's kill definition.

## Residual risk / not proven here

- The kill proof for the other 18 mutants rests on the frozen C2 counter's measurement (L1 reported predicate true), not my run; my probes exercise 2 of 20 mutants and 4 of the counter's probe classes. I did not run the frozen counter itself (out of this seat's item).
- The disclosed residual stands as a counter limit: a *future* self-test that reads its own source and checks whitespace-normalised find texts would still pass this counter's probes. This implementation does not do it (sections above); the guard remains the wave-2 code read, of which this is the round-34 instance.
- Semantic adequacy of cases (e.g. M03 upper-case `Yes`, M10 `serveFixture` import) is evidenced by the counter's 20/20 kill, not re-derived here.

## Deliverables

- Report: `tabi-shokunin/.ufo/waves/round-34/w2/RevSelftestCodeRead.md` (this file)
- `tabi-shokunin/.ufo/waves/round-34/w2/RevSelftestCodeRead/receipts/gate-freeze-59f1b47.mjs`, `gate-w1-04f9623.mjs`
- `tabi-shokunin/.ufo/waves/round-34/w2/RevSelftestCodeRead/receipts/diff-freeze-to-w1.txt`
- `tabi-shokunin/.ufo/waves/round-34/w2/RevSelftestCodeRead/receipts/rule-lines-identical.tsv`
- `tabi-shokunin/.ufo/waves/round-34/w2/RevSelftestCodeRead/receipts/selftest-probes.txt`

Write scope respected: lane untouched (read-only git), scratch `$HYAKU_SCRATCH/tabi-r34/RevSelftestCodeRead` removed after receipts were copied. No tools installed.
