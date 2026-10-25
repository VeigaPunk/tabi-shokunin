# ExecC1LineAudit — line-level audit of the four LOG corrections (round 27, wave 2)

Seat: `TabiR27.ExecC1LineAudit` (leaf executor, read-only reporter).
Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Nothing here touched tracked bytes;
git was read-only (`rev-parse`, `show`, `hash-object`, `status`). No builds/linters/formatters,
no installs (node v24.21.0 present).

Measured revisions: tip `bceb17dd82446a3b7514dd9759ec733673b4ba0d` (HEAD at run time; LOG.md worktree
clean, identical to the tip blob); oracle anchors named by the corrections: `f185b4e7ab10cd9e8925e8ec614c9c111772357d`
and the C1 counter baseline `4ad4c77eed78bca1a149e65a7ec6a84b5f71c925` (w1 receipts).

## 0. Bottom line

All four corrections (LOG.md:1904-1919, bullets for :335/:391/:1090/:1103) pass the four assigned
checks: **(a)** the cited line carries exactly the stale figure the correction describes; **(b)** each
correction names the script the counter associates to that line; **(c)** each stated oracle equals the
script's measured `--selftest` tally (12, 12, 26, 26 — re-measured here, at the worktree and at the
`f185b4e` blob); **(d)** the counter at the tip reports no finding and no detection on any correction
line (1904-1925). LOG.md:1863's correction is a for-the-record note: the cited line is could-not-evaluate
(never counted) at both baseline and tip, so the "supersedes" marker clears nothing the counter counts,
and it does not wrongly clear a future finding under the strict rule. The only residual tip mismatch is
m3 (live porcelain), the already-recorded wave-tree artefact.

Exact source lines (tip blob, `git show HEAD:LOG.md | sed -n '335p;391p;1090p;1103p;1863p'`):

| line | current text (tip) | stale figure the correction describes |
|---|---|---|
| 335 | `self-test receipt (`ROUND_CONTRACT_SELFTEST verdict=clean cases=4`). Seat` | `cases=4` (four-case ROUND_CONTRACT receipt) |
| 391 | `contract self-test receipt (`verdict=clean cases=4`). Seat s31 replayed the` | `cases=4` (four-case user-swarm contract receipt) |
| 1090 | `manifest `corpus/evidence/round-19/validation/decisions.json` (27 decisions, 66 cases); C2 operability` | `66 cases` (validation decisions) |
| 1103 | `Integration: 66/66 cases pass on Chromium 154.0.8037.97/Playwright 1.64.0/Node 24.21.0 after (a) the` | `66/66 cases` (integration validation cases) |
| 1863 | `mismatches=0, selftest cases=13 (unchanged — the extension never landed);` | `selftest cases=13` (check-selfassessment) |

Correction block at tip (LOG.md:1904-1925, `git show HEAD:LOG.md | sed -n '1904,1925p'`): five
bullets, each `- Correction (supersedes LOG.md:<line>): …`; the four audited bullets name
`scripts/check-freshness.mjs` (:335/:391) and `scripts/check-sources.mjs` (:1090/:1103) and state
`cases: 12` / `cases: 26` "at `f185b4e`"; the fifth names `scripts/check-selfassessment.mjs` and states
`cases: 17` (see §5).

## 1. (a) The cited line carries the stale figure the correction describes — HOLD, 4/4

Counter detection at the tip confirms the same association: `node scripts/check-selfassessment.mjs --rev
bceb17dd82446a3b7514dd9759ec733673b4ba0d --json` reports `LOG:335 claimed=4 observed=12`, `LOG:391
claimed=4 observed=12`, `LOG:1090 claimed=66 observed=26`, `LOG:1103 claimed=66 observed=26` — exactly the
figures the four corrections describe ("four-case figure" ×2, "sixty-six figure", "sixty-six-over-sixty-six
fraction"). The corrections' substantive characterisations also hold against the quoted lines: :335's
figure is the `ROUND_CONTRACT_SELFTEST` receipt, :391's is the user-swarm `verdict=clean cases=4` receipt,
:1090's is the round-19 decisions.json case count, :1103's is the integration 66/66.

## 2. (b) The correction names the associated script — HOLD, 4/4

The counter associates each cited line to the script named in that line's section:
`LOG:335/:391 → scripts/check-freshness.mjs`, `LOG:1090/:1103 → scripts/check-sources.mjs` (tip JSON).
Each correction bullet names exactly that script (§0). Script names match verbatim (`scripts/check-freshness.mjs`,
`scripts/check-sources.mjs`).

## 3. (c) Stated oracle equals the script's measured --selftest tally — HOLD, 4/4

Measured (commands exact, run from the lane root):

| correction | stated oracle | command | result | exit |
|---|---|---|---|---|
| :335, :391 | `cases: 12` at `f185b4e` | `node scripts/check-freshness.mjs --self-test` | `FRESHNESS_SELFTEST verdict=clean cases=12` | 0 |
| :1090, :1103 | `cases: 26` at `f185b4e` | `node scripts/check-sources.mjs --self-test` | `SOURCES_SELFTEST verdict=clean cases=26` | 0 |

The "at `f185b4e`" anchors also hold: the `f185b4e` blobs are byte-identical to the worktree for both
gates (`git rev-parse f185b4e:scripts/check-freshness.mjs` = `git hash-object scripts/check-freshness.mjs`
= `987c3267f1781db643e0269942a126ca9fee814a`; `3f96058fad6fd0163e9ec5f63347af4607e5646b` for
check-sources), so the same tally applies at that revision. Independent oracle read: the counter at
`f185b4e` measured `observed=12` (:335/:391) and `observed=26` (:1090/:1103); at the tip, the same
observed values. The fifth bullet's oracle 17 is verified in §5.

## 4. (d) The corrections carry no claim-shape tally the counter picks up — HOLD, 0/0

Counting command as frozen: `node scripts/check-selfassessment.mjs --rev bceb17dd82446a3b7514dd9759ec733673b4ba0d --json`
(saved at `.ufo/waves/round-27/scratch/ExecC1LineAudit/tip-counter.json`):
- exit 1, `mismatches=1`, `superseded=10`, `couldNotEvaluate=92`;
- `counted` = one entry, `m3-unlanded-paths observed=5` (live porcelain at run time — wave reports/scratch
  untracked; the known wave-tree artefact, not an m1 finding);
- all m1 LOG findings (doc "LOG.md"): 221, 254, 275, 335, 391, 471, 484, 972, 994, 1056, 1079, 1090,
  1103, 1664, 1812, 1863, 1864. **None falls in 1904-1925** (nor anywhere in 1904-1947); the correction
  lines are not even detected as tally carriers (not even as could-not-evaluate).

Why: the matcher's detection shapes (`TALLY_PATTERNS`, `scripts/check-selfassessment.mjs:121-126`, and
the inline equivalents at `:277-283`) are `--self-test N/N`, `N-case` (digits), `cases=N` (equals only)
and `N cases`. The correction block writes its numbers as ``cases: 12``/``cases: 26``/``cases: 17``
(colon form — not a detection shape) and as prose ("four-case figure", "sixty-six figure",
"sixty-six-over-sixty-six fraction" — no digits), so it is invisible to the counter. Note for accuracy:
the supersession helper `statedTallyNumbers()` (`:246-254`) *does* accept `cases: N` (colon) and bare
fractions — that is why the four dispositions clear — but detection does not.

Fold-in from wave 1 (CritC1Supersession, ExecC1Attacks, RevC1FrozenFit): the clear of :335/:391/:1090/
:1103 is real but is not per-bullet — the five bullets form one blank-line paragraph (0 blank lines inside
1904-1925), and the shipped matcher clears any finding for which the whole paragraph supplies script +
marker + any `:N` + the oracle number. The equality of each bullet's own citation is incidental to the
mechanism. This does not change the line-level audit answers above, but it means (d)'s cleanliness is
shape-luck (colon forms), not structural: if detection ever widened to `cases: N`, line 1920's quoted
"selftest `cases: 13`" would become a live 13-vs-17 finding created by the correction itself.

## 5. LOG.md:1863 — for-the-record note, not a wrongly-clearing supersession

The fifth bullet (LOG.md:1920-1925) says the round-26 wrap-up statement "selftest `cases: 13`" for
`scripts/check-selfassessment.mjs` is "in a multi-script section so the tally is could-not-evaluate, never
counted" and is "restated for the record anyway: … `--selftest` now measures `cases: 17`". Verified:

- The quote is accurate: line 1863 reads `mismatches=0, selftest cases=13 (unchanged — the extension never landed);`
  (it continues the line 1862 bullet that names `check-selfassessment.mjs --rev 4ad4c77`).
- The statement was *accurate at the time*, so this is a restatement, not an error fix: the check-selfassessment
  blob at `f185b4e` measures 13 cases (command: `git show f185b4e:scripts/check-selfassessment.mjs > …/f185b4e-blobs/check-selfassessment.mjs && node …/check-selfassessment.mjs --selftest` → `SELFASSESSMENT_SELFTEST verdict=clean cases=13 passed=13`, exit 0), and the round-26 entry says the extension never landed.
- "Multi-script section, could-not-evaluate": the round-26 section (LOG.md:1823-1880) names four scripts
  (`git show HEAD:LOG.md | sed -n '1823,1880p' | grep -oE 'scripts/[A-Za-z0-9_./-]+\.mjs' | sort -u` →
  `check-s106-evidence.mjs`, `check-selfassessment.mjs`, `report-contract.mjs`, `round-evidence-audit.mjs`);
  the counter reports `LOG:1863` as `couldNotEvaluate: "ambiguous script association"` at **both**
  `f185b4e` and the tip. Line 1863 is therefore never counted, so the bullet's "supersedes LOG.md:1863"
  marker clears nothing the counter counts.
- The new oracle is real: `node scripts/check-selfassessment.mjs --selftest` at the tip → `cases: 17,
  passed: 17, ok: true`, exit 0 (13 → 17, the four added m1-log-* cases, matching the "added four cases"
  claim).

Verdict: for-the-record. It does not wrongly clear a future finding: under the strict frozen predicate
(citation equality) the bullet can only affect line 1863, which is and remains CNE; and it creates no new
counted tally (§4). The one caveat is again the shipped paragraph-matcher: as part of the merged 1904-1925
paragraph it contributes to the already-recorded wrong-clear of `LOG:221` (w1 F1-F3) — a matcher defect
this bullet does not uniquely add, and which leaves the strict-rule tip at 1 uncorrected LOG finding
(`:221`, claimed 8 vs observed 12).

## 6. Counter receipts

- `.ufo/waves/round-27/scratch/ExecC1LineAudit/tip-counter.json` — `--rev bceb17dd82446a3b7514dd9759ec733673b4ba0d --json`
  (exit 1; mismatches=1 = m3; superseded=10; CNE=92).
- `.ufo/waves/round-27/scratch/ExecC1LineAudit/f185b4e-counter.json` — `--rev f185b4e7ab10cd9e8925e8ec614c9c111772357d --json`
  (exit 1; mismatches=5 = LOG :335/:391/:1090/:1103 + m3; superseded=6; CNE=92; LOG:1863 CNE).
- `.ufo/waves/round-27/scratch/ExecC1LineAudit/f185b4e-blobs/` — `f185b4e` script blobs; check-freshness
  and check-sources blobs identical to worktree; check-selfassessment blob measures 13 (worktree 17).

## 7. Risks / limits / unknowns

- Live tree at the tip run: m3 observed=5 (untracked wave paths); `mismatches=0` remains a clean-tree
  reading (already recorded by w1). All m1 LOG numbers are `--rev`-anchored and stable.
- Unknown: whether the lane tip moves again before integration; all numbers above are pinned to
  `bceb17d` and `f185b4e`.
- Tooling: nothing installed or upgraded.
