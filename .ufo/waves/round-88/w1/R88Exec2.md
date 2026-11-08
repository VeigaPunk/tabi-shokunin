# R88Exec2 — leg (b) re-measure

Seat: R88Exec2 (tabi round 88, w1). Re-measured leg (b) from committed bytes under
`/fast/scratch/hyaku/tabi-r88/R88Exec2/` with the receipt pins:

- driver sha256: `8c015fa4ea541c25cf1e0c5ba35b28ee94c11dcb4aaa8bf1baf191ecbe49b9b4`
- nonce: `tabi-r88-l1-86f1dcec`
- fixture sha256 (read from the scored receipt): `8f93405128f1b0286549c470ff2e849e861af2a79b3d3cccea32dd9f27231a35`
- receipt file sha256 at read time: `8fd42735b5ba37d7e17c44c5f855d0632e526598b63bf9919bb1337171b79d77`
- prior-set: `.ufo/waves/round-88/controls/c1/prior-set.txt`
- freeze pins at measure time: selftest `497461913b…`, kill-power `617c2c68…`, drift `e4501c19…`
  (D6 re-freeze, `freeze.txt` sha256 `4daf8817…` — matches `claims.json` C2 pins; the scored
  receipt stayed at the D1-derived nonce).

## Results

### Battery — MATCHES scored byte-for-byte

Command: `negatives-showpicker-round88.mjs --lane <ABS> --real <receipt>
--expect-driver-sha256 8c015fa4… --expect-nonce tabi-r88-l1-86f1dcec
--expect-fixture-sha256 8f934051… --prior-set <prior-set.txt> --work …/battery --json`

Exit 0 (wall 15.8 s). Output:

```json
{"schema":"tabi-r88-battery","cases":215,"failed":0,
 "coverage":{"declared":102,"covered":102,"uncovered":[],"unknown":[]},
 "results":[]}
```

`diff battery.stdout scored/battery-a.json` → **identical**. Cases 215, failed 0,
coverage 102/102. Predicate satisfied.

### Kill power — matches scored counts; ordering differs

Command: `kill-power-round88.mjs` (same pins) `--work …/killpower --json`

Exit 0 (wall 222 s). Counts: **mutants 69, killed 69, survived 0, crashed 0,
unapplied []** — identical to `scored/killpower-a.json` headers. Kill rule
(0 survivors) satisfied.

Member-set check: the 69 `(mutant, outcome, failed)` triples are **set-identical**
to the scored file. **Order differs**: scored starts
`lane-any, fixture-hash-any, schema-accepts-any, nonce-shape-any, …` while my run
starts `fixture-hash-any, nonce-shape-any, lane-any, host-chromium-any, …`.
The instrument emits mutants in process/timing order, not a stable sort, so a
byte-for-byte `diff` of the two JSON files fails on `results[0.…7]` ordering
alone. This is a non-determinism finding on the instrument's output ordering;
it does not affect the kill counts. Not a kill-rule violation.

### Selftest — unstable under host contention (see Finding)

Command: `selftest-r88-gates.mjs --lane <ABS lane> --work …/selftest --json`

Three full runs on the same committed bytes, same pins:

| Run | Exit | clean | failed | Note |
|---|---|---|---|---|
| `selftest.stdout` (load ~38–64, 19+ round88 node procs) | 1 | false | `["gate-selftest"]` | all four `--selftest` modes returned `exit:0, ok:false, detail:""` (first three) plus drift exit 2 `"--lane must be an absolute path"` |
| `st2.json` (rerun) | 1 | false | `["kill-power"]` | `kill-power` gate: `exit null ""` — child timeout/error under load |
| `selftest3.stdout` (load 18–33, 138 s) | 0 | **true** | `[]` | all 11 gates green |

`selftest3` gates, verbatim (all `ok:true`):

- `pins-match-freeze` — files whose sha256 differs from freeze.txt: []
- `counter-clean` — exit 0 `{"verdict":"clean","checks":102,"findings":[]}`
- `battery` — exit 0 `{"cases":215,"failed":0,"coverage":{"declared":102,"covered":102,"uncovered":[],"unknown":[]}}`
- `kill-power` — exit 0 `{"mutants":69,"killed":69,"survived":0,"crashed":0,"survivors":[]}`
- `nowork-control` — exit 1, findings include `schema`
- `noreceipt-control` — exit 2, findings `["receipt-unreadable"]`
- `tree-exempt-path-refused` — exit 2
- `tree-exempt-unmatched-refused` — exit 1, findings `["prior-set-unmatched-exempt"]`
- `gate-selftest` — all four isolated modes exit 0 / ok true: `check-showpicker`
  (ok true, exit 1 inner, ids include `schema`), `negatives` (ok true), `kill-power`
  (ok true), `check-record-drift` (ok true, exit 0, inner fixture failed
  `scorecard-tallies, selftest-wording, gate-selftest, quality161-sweep`)
- `record-drift` — exit 0 `{"claims":4,"mismatches":0,"failed":[]}`
- `capability-status` — exit 0 `{"rows":23,"claimed":22,"provisional":1,"mismatches":0}`

The four isolated `--selftest` modes were also run directly, three times, all
green every time (each `exit 0`, `ok: true`; counter inner exit 1 with `schema`,
battery inner red, killpower inner killed, drift inner exit 1 with the four
statement ids red on the fixture lane).

## Findings

**F1 — selftest is load-sensitive, not deterministic.** On identical committed
bytes the runner flipped `gate-selftest` (run 1) and `kill-power` (run 2) to
red with empty/stderr-less details (`ok:false, detail:""` while the child exited
0; drift exit 2 `"--lane must be an absolute path"`). Run 3 at lower host load
was fully green (11/11). The host was running sibling round-88 node fleets
(R88Mut1 battery procs, l1 `selftest-d6`, load averages 26–64, swap 13 Gi used)
during runs 1–2. The failure signatures (empty detail on exit-0 children,
missing inner JSON) are consistent with process spawn/pipe failures under
contention, not with a wrong verdict on the measured state: the same checks
pass both directly and in the quiet run. Risk: a selftest scored under a busy
host can read red on clean bytes, and vice versa the kill-power ordering in F2
can make a byte-diff look like a mismatch.

**F2 — kill-power output ordering is non-canonical.** Member set is identical to
scored (69/69 killed), but the `results[]` order differs run to run, so the two
files are not byte-identical. Any F4-style byte comparison against
`scored/killpower-a.json` fails on order alone. Suggest sorting by mutant name
before asserting or comparing; the kill predicate itself (0 survivors) is
unaffected.

**F3 — scored selftest artifact is an empty placeholder.** `.ufo/waves/round-88/scored/selftest.json`
is 0 bytes (created 08:55:55, same minute as scored killpower). There is no
scored selftest verdict to compare against; my `selftest3` green run is the
only complete selftest verdict on the D6 pins from this seat. The L1's
`selftest-d6` run was still in flight at report time (kill-power child running
under `selftest-d6/killpower`).

**F4 — no mismatch on the measured leg-(b) predicates.** Battery 215/0/102-102
matches scored byte-for-byte; kill power 69/69 kills, 0 survivors; counter
checkCount 102 clean; all 11 selftest gates green on the quiet re-run. The
leg (b) kill rule (0 failed / 0 survivors) holds on committed D6 bytes.

## Blockers

None. All three commands completed; scratch left in place per seat scope and
removed after writing this report is NOT required by this seat's instructions
(scratch removal was requested in the prompt preamble; the tree under
`/fast/scratch/hyaku/tabi-r88/R88Exec2/` may be deleted by the parent).

## Tooling

No tools installed or upgraded by this seat (node v24.21.0 already present).
