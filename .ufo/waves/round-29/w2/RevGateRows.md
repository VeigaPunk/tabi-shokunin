# RevGateRows — round-29 w2 falsification: SKILL.md gate-registry section review

Seat: RevGateRows (reviewer, leaf — no subagent dispatch). Date: 2026-10-26.
Item: review the round-29 SKILL.md gate registry section and
`node scripts/check-gate-registry.mjs --rev 32008a453737a27f69e9ab401d0b9775d2a944f7`
(expect nonconformant=0; baseline 856fa9e had 2); check each new row's self-test tally
against an actual run of that self-test at 32008a45 in a clean clone; verify that
superseding the round-28 rows is append-only.

## Method

- Frozen claims read first: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-29/claims.json` (commit 97be89bc).
- Clean clone: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin /fast/scratch/hyaku/tabi-r29/RevGateRows/clone`, then `git checkout 32008a453737a27f69e9ab401d0b9775d2a944f7`.
  `git rev-parse HEAD` → `32008a453737a27f69e9ab401d0b9775d2a944f7`; `git status --porcelain | wc -l` → `0`. node v24.21.0.
  TMPDIR pointed at the seat scratch for every self-test run.
- No lane tracked file edited; all git invocations read-only, in the clone or against the lane repo for log/diff/show only.
- No tool installs (none needed; node preexisting).

## Verdict

**PASS on all three named checks, with one finding (F1, medium) on the new release-pins row's pinned-value path.**

1. Conformance counter at tip: `nonconformant=0` (expected 0). ✓
2. Same instrument at baseline: `nonconformant=2` (expected 2). ✓
3. All three new rows' self-test tallies reproduce exactly against real runs. ✓
4. Supersession of the round-28 rows is append-only (15 added, 0 deleted lines). ✓

## Evidence

### 1. Counter at tip — expect nonconformant=0

```
$ node scripts/check-gate-registry.mjs --rev 32008a453737a27f69e9ab401d0b9775d2a944f7
GATE name=check-release-pins script=scripts/check-release-pins.mjs row=2543 rows=1 conformant
GATE name=check-s106-evidence script=scripts/check-s106-evidence.mjs row=2544 rows=3 conformant
GATE name=check-selfassessment script=scripts/check-selfassessment.mjs row=2545 rows=4 conformant
GATE_REGISTRY verdict=clean rev=32008a453737a27f69e9ab401d0b9775d2a944f7 rows=32 gates=18 nonconformant=0 findings=0
exit=0
```

18 gates / 32 rows; the three round-29 rows (:2543 release-pins, :2544 s106-evidence,
:2545 selfassessment-counter) are the latest rows for their gates and all conformant.
release-pins is a new 18th gate in the derived set.

### 2. Counter at baseline 856fa9e — expect 2

```
$ node scripts/check-gate-registry.mjs --rev 856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb
FINDING id=e2-field-incomplete gate=check-s106-evidence line=2529 detail=latest row missing: name, selftest
FINDING id=e2-field-incomplete gate=check-selfassessment line=2530 detail=latest row missing: name, selftest
GATE_REGISTRY verdict=failed rev=856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb rows=29 gates=17 nonconformant=2 findings=2
exit=1
```

Matches the round-29 preamble ("`e2-field-incomplete`: parenthesised name, no self-test
command"): the round-28 rows name themselves `s106-evidence (revision binding)` /
`selfassessment-counter (exact line citations)` and their self-test cells are prose
("7 cases in CASES (not run at round-28 tip)" / "20 cases in CASES (not run at round-28
tip)"), not commands.

Instrument identity: `git diff --name-only 856fa9e..32008a45 -- scripts/check-gate-registry.mjs`
is empty — the identical counter measured both revisions, so the 2→0 delta is the registry
change, not an instrument change. The counter's own self-test at tip:
`GATE_REGISTRY_SELFTEST verdict=clean cases=22 passed=22`, exit=0 (matches row :2478's pin).

### 3. New rows' self-test tallies vs actual runs (clean clone at tip)

| Row (SKILL.md line) | Pinned tally in row | Actual run at 32008a45 | Verdict |
|---|---|---|---|
| release-pins :2543 | `--selftest` (cases=20, passed=20) | `RELEASE_PINS_SELFTEST verdict=clean cases=20 passed=20`, exit=0 | match |
| s106-evidence :2544 | `--selftest` (cases=7, passed=7) | `S106_SELFTEST verdict=clean cases=7 passed=7`, exit=0 | match |
| selfassessment-counter :2545 | `--selftest` (cases=22, passed=22) | `SELFASSESSMENT_SELFTEST verdict=clean cases=22 passed=22`, exit=0 | match |

Case-level observations:

- s106 self-test includes `measured-revision-bytes-match` and `measured-revision-bytes-mismatch`
  (both PASS) — the two case ids C1's predicate requires; 7/7 PASS.
- release-pins self-test 20/20 PASS, including the junk controls named in claims.json C3:
  `copied-old-as-new-caught-by-refetch`, `refetch-missing-unresolved`,
  `refetch-same-seat-unresolved`, `sha-mismatch-unresolved`, `range-not-in-anchor-unresolved`,
  `new-bytes-under-old-tag-unresolved`, `digest-binding-mismatch-unresolved`.
- selfassessment self-test 22/22 PASS, including the cross-document citation refusals
  (`m1-scorecard-crossdoc-citation-not-superseded`, `m1-log-crossdoc-citation-not-superseded`)
  that encode the C2 doc-bound supersession rule.

### 4. Pinned-value paths of the new rows at the rev

```
$ for p in corpus/evidence/round-29/release-pins/receipt.json \
           corpus/evidence/round-29/release-pins/bytes \
           corpus/evidence/round-29/release-pins/refetch \
           corpus/evidence/round-29/s106-selftest/mutation.txt \
           corpus/evidence/round-26/sources/s106.json \
           corpus/evidence/round-24/c2-measurements.json; do \
    git cat-file -e "32008a453737a27f69e9ab401d0b9775d2a944f7:$p" && echo "present  $p" || echo "ABSENT   $p"; done
present  corpus/evidence/round-29/release-pins/receipt.json
present  corpus/evidence/round-29/release-pins/bytes
ABSENT   corpus/evidence/round-29/release-pins/refetch
present  corpus/evidence/round-29/s106-selftest/mutation.txt
present  corpus/evidence/round-26/sources/s106.json
present  corpus/evidence/round-24/c2-measurements.json

$ sha256sum scripts/check-selfassessment.mjs
728128008e2242b635bda30a28313de20b06d381d7855f11f18fa5043ba560c4  scripts/check-selfassessment.mjs
```

The selfassessment row's counter sha256 equals the frozen-counter sha in claims.json
exactly. `bytes/` holds 23 decoded files per tag (154.0.8037.97 and 156.0.8078.47) per
`git ls-tree -r --name-only`. `refetch/` is absent — see F1.

### 5. Append-only supersession of the round-28 rows

```
$ git log --oneline 856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb..32008a453737a27f69e9ab401d0b9775d2a944f7 -- SKILL.md
59e8167 round-29: C1 repair s106 self-test (+mutation receipt), C2 doc-bound corrections, round-29 gate registry rows

$ git diff --numstat 856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb 32008a453737a27f69e9ab401d0b9775d2a944f7 -- SKILL.md
15	0	SKILL.md

$ git diff 856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb 32008a453737a27f69e9ab401d0b9775d2a944f7 -- SKILL.md | grep -c '^-[^-]'
0        (grep exit 1: no deleted/modified lines)
```

Only commit 59e8167a touched SKILL.md between baseline and tip; 15 lines added, 0 deleted
or modified (2530 → 2545 lines). The added lines are the blank separator plus the round-29
section (heading, 6 prose lines, blank, canonical 8-column header + separator, 3 rows).
The round-27 and round-28 rows are byte-identical at tip (the round-28 table still reads
"7 cases in CASES (not run at round-28 tip)" and "20 cases in CASES (not run at round-28
tip)"). Supersession operates through the counter's latest-row-wins rule (its self-test
case `supersession-latest-wins` passes), not through editing old rows. **Append-only: confirmed.**

## Findings

### F1 (medium) — release-pins row pins a `refetch/` path that is empty at the registered rev; the row's clean verdict is not exercisable at tip

- Row :2543 Pinned-value path cell names `corpus/evidence/round-29/release-pins/receipt.json` + `bytes/` + `refetch/`.
- `corpus/evidence/round-29/release-pins/refetch/` does not exist at 32008a45
  (`git cat-file -e` → ABSENT; `git ls-tree -r --name-only 32008a453737a27f69e9ab401d0b9775d2a944f7 | grep -i refetch` → no matches anywhere in the tree).
- The counter hard-requires those records: `scripts/check-release-pins.mjs` :72
  `REFETCH_ROOT = "corpus/evidence/round-29/release-pins/refetch"`; `refetchFor` reads
  `<REFETCH_ROOT>/<id>.json`; every file entry without a confirming record from a
  different seat gets reason `f6-refetch` (:217-220).
- Actual counter state at tip:

```
$ node scripts/check-release-pins.mjs --rev 32008a453737a27f69e9ab401d0b9775d2a944f7 --stable 156.0.8078.47
UNRESOLVED id=S033 reasons=f6-refetch third_party/blink/renderer/core/script_tools/model_context_supplement.idl
UNRESOLVED id=S034 reasons=f6-refetch third_party/blink/renderer/platform/runtime_enabled_features.json5
... (all 23 rows, f6-refetch as the only reason)
RELEASE_PINS verdict=failed rev=32008a453737a27f69e9ab401d0b9775d2a944f7 stable=156.0.8078.47 population=23 resolved=0 unresolved=23 holds=0 drifted=0
exit=1
```

  JSON mode agrees: `{"population":23,"unresolved":23,"holds":0,"drifted":0}`.
- So at the rev where the row is registered, the row's `0=clean (population>=1,
  unresolved=0)` verdict class cannot occur, and one of the three named pinned-value
  components is absent.
- Mitigating context: receipt.json's note says per-row entries are the w1 seat outputs
  `.ufo/waves/round-29/w1/pins/<id>/entry.json` verbatim, and f6 requires a re-fetch by a
  *different* seat — the independent re-fetch records are plausibly a pending w2/L1
  deliverable, so an empty directory may be expected mid-flight. But the registry row was
  committed asserting the path as pinned provenance. Before C3 closes, the 23
  `refetch/<id>.json` records must be committed at REFETCH_ROOT (or the row's
  pinned-value cell corrected); until then the row overstates the evidence base.
- This is a row-honesty defect, not a conformance failure: the conformance counter has no
  pinned-path-existence rule, so `nonconformant=0` stands.

No other findings. The other two new rows' pinned paths all exist at the rev.

## Residual risk / verification gaps

- I did not adjudicate the C1/C2/C3 claims themselves (other seats' items); the C3 counter
  run above is evidence for the row-state observation only.
- Counter modes exercised: plain and `--json` for release-pins; plain for gate-registry
  (its `--json` path not exercised; not needed for the verdict).
- Two earlier attempts to capture the release-pins JSON via shell redirection reported
  "(no output)" from the tool's temp shell; the capture file was in fact written
  (6090 bytes) and the plain rerun reproduced the same verdict, so the evidence above is
  from the plain run.
- Self-tests ran with TMPDIR inside the seat scratch; per their declared write scope they
  write/delete only their own temp trees — I observed exit behavior and tallies, not a
  filesystem audit of their cleanup.
- Scratch `/fast/scratch/hyaku/tabi-r29/RevGateRows` (clone + tmp + capture files) removed
  after this report was written.

## Tool installs

None (node v24.21.0 already present; no pacman/uv/npm activity).
