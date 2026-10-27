# Round 37 — verifier spot-check (closure)

author: hyaku closure (non-author integrator, @m_opus)
date: 2026-10-27
lane: tabi round 37 · baseline `ed8ccfc00ad3784bc424aa118e056f8edf4ee803` · tip `bf8ecd5a663d9773d92c4842ed1874814b8a9a83`
report: `.ufo/reports/round-37/tabi.md` (fleet commit `11b43d35b7efbe48f1b44f493a73d83ddd9f2865`, author `tabi-shokunin <tabi@shokunin.local>`)

Dispatch/complete digest (.ufo/watchdog.log, mutable — copied at closure):
`2026-10-27T10:04:51-03:00 launch tabi round=37 pgid=465460 driver=hyaku-inline attempt=1`;
`2026-10-27T11:15:35-03:00 complete tabi round=37; hyaku-inline attempt=1`.

## Step-1 conformance

| Check | Command | Observed | Verdict |
|---|---|---|---|
| Report committed by lane identity | `git -C fleet log --format='%an %ae %H' -- .ufo/reports/round-37/tabi.md` | `tabi-shokunin <tabi@shokunin.local> 11b43d35…` | pass |
| SHONEN heading, one line per box | `grep -n '^## SHONEN'` + `grep -c '^- \['` | heading at report line 124; 4 box lines, all `[~]` with pointers | pass |
| Cited commits exist + ancestor of branch | `git cat-file -t` + `git merge-base --is-ancestor <h> master` for ed8ccfc, 99437d29, f76da09, 34ed508c, 5a2ebb6a, f485cce, bf8ecd5 | all 7 exist, all ancestors of `master` | pass |
| Lane pushed, no round leftovers | `scripts/hyaku/jj-lane.sh state` + `git status --porcelain` | `local=remote=bf8ecd5 ahead=0 behind=0`; porcelain empty | pass |
| Prompt carries template contract | read `.ufo/prompts/tabi-round-37.md` | §1–§5 round contract (mission/axes, claims, frontier, L2 floor, report path, commit-before-report, SHONEN heading, hash-citation, write scope, L0) + run-10 addendum verbatim | pass |
| Dispatch/complete lines | `grep 'tabi round=37' .ufo/watchdog.log` | both lines match the digest above | pass |

Real report, not a marker. Status: **ok**.

## Claims — re-check (closure-run measurements + committed-evidence verification)

No lane gate/counter executed (PROTOCOL §Gate standard, Closure consequence). Frozen-instrument
digests, receipt fields and quoted outputs below were re-derived from committed bytes by the
closure; per-run counter outputs are evidence-verified against the committed receipts.

### C1 — adjacency (counter v5 + build tool v2) — VERIFIED (met)

- Freeze integrity: `git show 99437d29:<instrument> | sha256sum` for c1/c2/buildTool/measure/controls
  all equal `claims.json frozenDigests` (`9c6289b7…`, `eda339eb…`, `a85152cd…`, `9f89697c…`, `3a08367f…`).
- Pins digest: `git show 34ed508c:.ufo/waves/round-36/baseline/c1-delta-pins.json | sha256sum` →
  `810193620393f6e8b76faac4b606977508198de1b9ffd00d3a7440e8f1910655` = the v5 constant; same at tip `bf8ecd5`.
- Measure receipt `.ufo/waves/round-37/measure/c1-at-34ed508.json` (rev `34ed508c…`):
  `predicate: true`; adjacency clean 16/16 findings 0; completeness unaccounted 0;
  drift total 307 / auditCoverage 307 / auditFindings [] / staleFindings [];
  delta unaccounted 0 / screenFindings []; `deltaPinsSha256` bound. Matches report field-for-field.
- Controls (committed `baseline/`): J1 v4 exit 0 → v5 exit 2 (sha256 mismatch refusal);
  J2 v4 exit 1 → v5 exit 0 (`verbatim at :N` clause parses); J3 honest v5 exit 0 predicate true.
- Sentence byte-identity (4 sites): claims.json `predicate` == v5 `PREDICATE_SENTENCE` ==
  header comment line == receipt `predicateSentence` (len 295; all four `===`).
- Build tool v2: kama pin 40 hex `e8fa87ef19ec5eb28f5fd9701a0a42da45bd688d` (v1 was 39, non-resolving);
  PINS resolvability guard present. Red control EXISTS in committed wave evidence
  (`.ufo/waves/round-37/w1/ExecBuildTool/report.md` §4: four one-pin mutations → exit 1, no ledger write;
  §5b future-repin divergence: typo-built ledger refused by the frozen counter, corrected admitted).

### C2 — operability (counter v3 + harness v2) — VERIFIED (met)

- Measure receipt `measure/c2-at-34ed508.json` (rev `34ed508c…`): `predicate: true`;
  admitted 16, failing 0, survivors 0, `receiptFinding: null`, `binding: null`,
  `live.egress.nonLoopback: 0`; `counterSha256` == frozen pin.
- Controls: J1 v2 exit 0 → v3 exit 2 (`refs/replace present … refusing`); J2 v2 exit 0 →
  v3 exit 1 with receiptFinding `run1: observed captureScreenshot.sha256 != transcript first screenshot`;
  J3 honest v3 exit 0, admitted 16 / survivors 0 / egress 0.
- Source verified in frozen bytes: every git read under `GIT_NO_REPLACE_OBJECTS=1`; replace-ref
  enumeration refusal before blob reads; survivor check; `runs[*].observed` binding;
  measure.sh absolute OUT, clone-relative numstat, `check-freshness --worktree --repo`.
- Sentence byte-identical at 4 sites (len 154). S143 grounding: registry row + counter header + claims.json `source`.
- Godspeed directive bytes: all 34 w1 task texts carry `skill://godspeed/directive.md` bytes verbatim.

### No-harm — VERIFIED

- `git diff --numstat ed8ccfc bf8ecd5`: only LOG.md (+6), SCORECARD.md (+53),
  corpus/SOURCES.md (1 add/1 del = the S143 row), lessons/round-37.md (new) outside `.ufo`;
  **zero deletions anywhere else**; SKILL.md, PROVINCE.md, SHONEN.md, corpus/QUALITY.md,
  corpus/README.md byte-identical to baseline.
- SCORECARD: pure tail append; adjacency 8 → 8, operability 9 → 9 with explicit no-auto-bump
  rubric wording; no other axis row touched.
- No-harm receipt `measure/noharm-at-34ed508.txt`: gate self-test tallies green (committed
  evidence, not re-executed); `check-selfassessment` mismatches 0; two nonzeros both pre-existing —
  `check-frontier-admission` exit 1 (green at baseline per w1 RevNoHarm evidence) and the retired
  r35-c1 leg exit 1 (baseline reproduction committed at
  `w1/RevHarness/measure-smoke/r35c1-at-ed8ccfc.json`: predicate false, unaccounted 0, screenFindings []).
- Census: `sources-census.sh validate --root … tabi` → exit 0, `tabi ok`, 20 pre-existing W04;
  manual counts re-derived: 143 rows, A:127 B:7 C:9, mined 119, queued 15, rejected 9, malformed 0,
  no duplicate ids. Start gate line: 142 rows, mined 118 (w1/ExecCensus/census-w1.txt).

## Per-axis verdicts

| Axis | Verdict | Basis |
|---|---|---|
| adjacency | improved | C1 met under the frozen predicate; instrument hardened (digest binding, canonical parse, sentence discipline, build tool v2 with red controls); score held 8 → 8 per declared rubric |
| operability | improved | C2 met; replace-ref refusal + survivor check + observed binding land with red controls; harness v2 per contract; score held 9 → 9 |
| coverage | unchanged | untouched, byte-identical |
| depth | unchanged | untouched, byte-identical |
| freshness | unchanged | no SKILL/prose drift; census green |
| calibration | unchanged | SCORECARD claims match observed repo state (modulo routed defect D2 below, a SCORECARD prose overclaim) |

## Discernment spot-check (LEARNING.md — non-author, outside)

| Item | Gate decision | Re-opened source | Agree/disagree | Reason |
|---|---|---|---|---|
| S143 git-replace manual | admit, tier A, mined | `curl -sS https://git-scm.com/docs/git-replace` → HTTP 200, 38,351 B, sha256 `46750b9f957b96a0660e158438dec14105a955801b02f7c3a009cf47b88d9105` (exact match with lesson/row record); quote located in page text | **agree** | quote "The GIT_NO_REPLACE_OBJECTS environment variable can be set to achieve the same effect as the --no-replace-objects option." — 16 words ≤ 25, located; page digest unchanged since the lane's fetch |
| `merge/tabi/` assimilation set | reject (no staged theme touches claim surfaces) | `/home/vgpnk/Projects/shokuknow/merge/tabi/MERGE-REPORT.md` + `knowledge/` listing | **agree** | staged themes do not touch adjacency-instrument or git-object-evidence ground; the only "replace" hit is a generic append-instruction verb, not a theme |
| Quarantine slice (tabi register rows) | reject, carried (rounds 22–23 verdicts) | `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` — re-derived slice: 38 data rows, all `payload-absent` | **agree** | slice re-count matches the Gate's re-count cadence; nothing adoptable this round |
| SOURCES.md row 143 (new row quote check) | — (row under test) | row 143 committed bytes: 12 pipes = 11 columns, tier A, status mined, opened 2026-10-27, recheck 180d, used-by `.ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs` exists | **agree** | row parses, scope cell bounds the tier claim, used-by path resolves; Gate quote is the ≤25-word check |

Closure census command re-run: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0.

## Trend verdicts

- **expansion: unchanged** — no new `knowledge/` entry; S143 is instrument ground for the C2 counter, not new domain coverage (verified: no knowledge/ byte changed in the round window).
- **quality: improved** — all eight round-36 routed defects land as frozen amendments; the v4/v2 exit-0 attack receipts become v5/v3 exit-2/1 refusals/findings on the same fixtures (receipts re-derived); the M2 red control exists in committed w1 ExecBuildTool evidence.
- **discernment: improved** — this closure's outside spot-check agrees with the gate on the sampled admit and both rejects (table above); per LEARNING.md an agreeing outside check grades improved (same grading pattern as the round-36 closure).

## Routed defects for round 38 (status-neutral here; lane must fix next round)

1. **SCORECARD wave-block overclaim** — `SCORECARD.md` "### Round 37 — waves and seats" states
   "the round contains **68 seats** (w1 34 + w2 34)"; w2 was never dispatched (no `w2.ready`, no
   `w2/` dir; the report itself honestly discloses the settle-pending state). Append a correction
   entry (append-only; never rewrite) naming the true shape: 34 seats, w2 deferred.
2. **Report seat-verdict tally wrong** — the report's "18 seats returned `VERDICT ok`, 16
   finding-grade" reproduces no extraction over the committed reports; the closing verdict per
   report is 23 ok / 11 finding (`CritC1a` carries its verdict as a `## VERDICT ok` heading).
   Correct in the round-38 report.
3. **LOG.md round-37 section accuracy** — (a) the freeze entry actually landed at `34ed508c`, not
   at `99437d29` as the report's Landed-changes bullet states; (b) no round-37 commit hash appears
   in LOG.md (grep = 0 for all five cited hashes); (c) no per-commit landed ledger (round 36 had
   one). Append hash-carrying entries per the file contract.
4. **Lesson M3 row missing `Captured-by`** — M1/M2 carry the field; M3 (`surface-mismatch`) does
   not (round-36 LOG attributed the sentence mismatch to W2 RevFrozenDigests, so it was fillable).
   Also: M3's byte-identity fix is green-only — no mutated-sentence red control exists (the w2
   falsify wave that was to attack it was never dispatched); ship one next round.
5. **Census receipts are validate-only logs** — `census-start.txt` and `census-end.txt` are the 20
   W04 warnings + `tabi ok` line, byte-identical to each other; they do not witness the 142→143
   delta (witnessed only by gate lines in seat evidence). Have the census step record the parsed
   counts alongside the validate output.
6. **Numstat receipt window** — the committed `numstat-at-34ed508.txt` diffs `11c64b96..REV`
   (two-round window, lane-disclosed in its own lesson); the report's "diff ed8ccfc..f485cce"
   wording is imprecise. The appends-only claim itself holds on the true round window
   (closure re-derived: zero deletions outside the one registry-row insert).

## Notes for the operator

- SHONEN boxes are all `[~]` author-asserted; every box now looks fully checkable by a named
  non-author reviewer (decision tables at `SKILL.md:697`, evidence ladder, runbook; LOG end-to-end
  entries; executor-sufficiency verdict; PROVINCE accuracy). Promotion review is operator-owned;
  this is pointer-only, as required.
- The orchestrator marker commit `bf8ecd5` (w1.ready.dispatched, 2 lines) rides the lane tip under
  the lane identity via the helper; report HEAD at filing `f485cce` is its parent. Conformance-neutral.
- Wave-settlement debt: w1 was unsettled at filing (one seat process alive, no `w1-results.json`);
  the round honestly disclosed it. The w2 falsify wave (34 committed items in `gen-w2-spec.py`) and
  the 64-seat floor pass to round 38 per the report.
