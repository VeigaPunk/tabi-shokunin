# CritNoHarm — w2 no-harm attack at integration 083c5c643be7aa5965a5de3458a32ed0d289ead3

## Verdict

**HOLDS** (no harm found; severity none). Every offline gate and self-test in the
`measure.sh` noharm block that was green at the freeze (a4bfef0f75027c915e715649950b1d46dcb33d83,
`noharm-at-a4bfef0.txt`) is green at the integration 083c5c643be7aa5965a5de3458a32ed0d289ead3:
28/28 lines exit=0 in both runs, identical command sequences, and all verdict fields match
except rev hashes and the expected data growth from the round's own deliverables (adjacency
rows 16→17 = the integrated map row; SOURCES rows 133→141 = S134–S141 opened). The round-34
C2 mutant counter still reports killed stays 20 (mutantsTotal=20, killedCount=20, survivors=0,
pristine/neutral/decoy exit 0, gate sha256 370e8e95… identical to freeze). `check-selfassessment.mjs`
at the integration rev reports mismatches=0.

## Evidence

### Setup
```
S=/fast/scratch/hyaku/tabi-r35/CritNoHarm        # HYAKU_SCRATCH passed explicitly; TMPDIR=$S/tmp
git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/c"
git -C "$S/c" checkout -q --detach 083c5c643be7aa5965a5de3458a32ed0d289ead3
toplevel=/fast/scratch/hyaku/tabi-r35/CritNoHarm/c   # git rev-parse --show-toplevel
head=083c5c643be7aa5965a5de3458a32ed0d289ead3
porcelain=0
```

### noharm block (measure.sh lines 38–56 replicated verbatim from the clone)
Runner: `run-noharm.sh` (scratch), output `noharm-at-083c5c.txt`. All 10 gates + 18
self-tests exit=0 (28/28). Key verdict lines (full lines in the artifact):

| gate | freeze a4bfef0 | integration 083c5c |
|---|---|---|
| check-adjacency --at REV --fleet | ADJACENCY verdict=clean rows=16 verified=16 | ADJACENCY verdict=clean rows=17 verified=17 |
| check-gate-registry --rev HEAD | GATE_REGISTRY verdict=clean rows=42 gates=22 nonconformant=0 findings=0 | identical (rev=083c5c…) |
| check-release-pins --stable 156.0.8078.47 | RELEASE_PINS verdict=clean population=23 resolved=23 unresolved=0 holds=16 drifted=7 | identical |
| check-s106-evidence --rev HEAD | S106_EVIDENCE verdict=valid present=true sha_match=true anchor_located=true valid=true | identical |
| check-frontier-admission --frontier rate-tos-signal --since 2026-10-26 | FRONTIER_ADMISSION verdict=clean live=false population=2 admitted=2 failing=0 | identical |
| check-decision-table --baseline 96a2d1a… | DECISION_TABLE verdict=clean live=false population=13 admitted=13 failing=0 | identical |
| check-bidi-runtime --baseline d805d1d… | BIDI_RUNTIME verdict=clean population=17 admitted=16 failing=0 unmeasured=1 distinct=16 live=false | identical |
| check-selfassessment --rev HEAD | SELFASSESSMENT verdict=clean mismatches=0 could_not_evaluate=116 superseded=48 | identical |
| check-sources.mjs | SOURCES_GATE verdict=clean rows=133 tiers=A:118,B:6,C:9 status=queued:15,mined:109,rejected:9 findings=0 | SOURCES_GATE verdict=clean rows=141 tiers=A:125,B:7,C:9 status=queued:15,mined:117,rejected:9 findings=0 |
| sources-census.sh validate | file ok | file ok |

Self-tests (all exit=0 at both): ADJACENCY_SELFTEST cases=57, ARIA_METADATA_JSON ok=true,
BFCACHE_SELFTEST 17/17, BIDI_RUNTIME_SELFTEST 56/56, DECISION_TABLE_SELFTEST 34/34,
FRESHNESS_SELFTEST cases=12, FRONTIER_ADMISSION_SELFTEST 24/24, GATE_MUTANTS_SELFTEST 12/12,
GATE_REGISTRY_SELFTEST 22/22, MEASUREMENT_BINDING_SELFTEST cases=76, RELEASE_PINS_SELFTEST 29/29,
ROUND_CONTRACT_SELFTEST cases=38, S106_SELFTEST 10/10, SELFASSESSMENT_SELFTEST 41/41,
SOURCE_REOPEN_SELFTEST 18/18, SOURCES_SELFTEST cases=26, USER_ROUND_CONTRACT_SELFTEST cases=45,
ROUND_EVIDENCE_AUDIT_SELFTEST cases=13.

Command+exit sequence diff (normalized rev) between freeze and integration: only difference is the
scratch path inside the sources-census `--file` argument; every other line identical.

### Round-34 C2 counter (frozen from a4bfef0, run at 083c5c)
```
git -C LANE show a4bfef0…:.ufo/waves/round-34/counters/c2-gate-mutants.mjs > $S/k/r34c2.mjs
node $S/k/r34c2.mjs --rev 083c5c… --repo $S/c --json   # exit=0
```
`r34c2-at-083c5c.json`: schema=tabi-r34-c2-gate-mutants-v1, rev=083c5c…,
gateSha256=370e8e95417e16dd3535f2dd5015a0b820655934200d489434fb642db7d86c87 (== freeze),
mutantsTotal=20, pristine/neutral/decoy all exit=0 signal=null failingCases=[], killedCount=20,
killed=[M01..M19,M01b], survivorsCount=0, unappliable=[], twinsFailing=[]. Identical to freeze
`r34c2-at-a4bfef0.json`.

### check-selfassessment at explicit integration rev
```
cd $S/c && node scripts/check-selfassessment.mjs --rev 083c5c643be7aa5965a5de3458a32ed0d289ead3 --json
# exit=0; json: "rev": "083c5c…", "mismatches": 0
```

## Deliverables
- Report: `.ufo/waves/round-35/w2/CritNoHarm.md`
- Output dir: `.ufo/waves/round-35/w2/CritNoHarm/`
  - `noharm-at-083c5c.txt` (full 28-line run log)
  - `r34c2-at-083c5c.json` + `r34c2-at-083c5c.stderr` (empty)
  - `selfassessment-at-083c5c.json`

## Notes
- No browser launched (no C2 rerun needed for this seat); no network fetches made; no tools
  installed; no lane files edited beyond the report/output dir sanctioned by the seat spec.
- Scratch `/fast/scratch/hyaku/tabi-r35/CritNoHarm` removed after copying evidence (verified gone).
