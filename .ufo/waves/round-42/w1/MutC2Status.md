# MutC2Status — C2 S146-status mutation (round 42, wave 1)

Scope: one mutation probe of the frozen C2 checker
`.ufo/waves/round-42/counters/check-routed-defects-round42.mjs`
(lane sha256 `b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8`, read-only throughout).
No claim is judged; only whether the R2 `S146 status == 'rejected'` clause is
load-bearing for the checker's verdict.

## Mutation M

Smallest behaviour-bearing point in R2 — the single `else if` that enforces the
S146 status cell. Whole line deleted in the scratch copy; every other byte
identical.

```
-    else if (cell(s146, 8) !== 'rejected') add('r2-s146-not-rejected', `S146 status is '${cell(s146, 8)}', expected 'rejected'`);
```

Full unified diff: `evidence/mutation.diff`. Byte identity:

| file | sha256 |
|---|---|
| lane counter (frozen) | `b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8` |
| pristine scratch copy | `b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8` (byte-identical to lane) |
| mutant | `3dea69bf3ff06c314424526ab2194965d18a649c443ca488d69504054c02e58a` |
| restored (pristine bytes re-written, re-run) | `b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8` |

## Fixture

Scratch git repo `/fast/scratch/hyaku/tabi-r42/MutC2Status/fixture-repo`
(`git init -q`; `git -C "$D" rev-parse --show-toplevel` compared to `$D` **before**
the first commit — equal). 46 blobs, two revs:

- `rev1 = 31f10b5425ff1fccadc1eb216cff65ef1e4aaa6a` — *S146 left mined.*
  `corpus/SOURCES.md` = fixture header + the **real** S146 row with only its
  status cell rewritten `rejected` -> `mined` + the **real** S148 row appended
  verbatim (`supersedes S146 — A space-separated list of command-line options.`,
  which is a verbatim substring of the committed staged
  `node-cli-v24.21.0.html`). Blob sha256
  `428d6806574b1794756c5eb3b2fbbb007ddabd7755ed8d9be240b8cc4cd2273f`.
- `rev2 = 65d83cdaf264d206ebc6896e0fe61c9608ea6590` — identical tree except S146 status
  `rejected` (fixture-sensitivity control: proves rev1 differs from green only by
  the clause under test).

R1/R3 and the R4 slice set come from real committed blobs copied byte-for-byte
(`c1-measure.json` `5e2a83ac02b9a4ec3f7d0ebec21f5fa9b3469d4110ac23f8e78af18b43913f13`,
receipt 1,167,198 B, witness 1,153,988 B, staged HTML 281,098 B, baseline out 343 B,
`slice-ids.txt` 38 ids `373516272b385d1becce2e622292668dc82b7dc0012df64bcac8810f76e712cf`).
R4's TSV (`4d3a1eff3688d5963eb8f777866f88082a6358663e3d285a2c3105f03ccf9fb1`,
38 rows, verdict `present`, one >=200 B evidence blob per id) is fixture-synthetic —
see Limitations.

## Red/green table (same detector, same fixture, only script bytes vary)

| fixture | checker bytes | exit | predicate | findings |
|---|---|---|---|---|
| rev1 S146=mined | pristine `b1d05df` | **1** | false | `r2-s146-not-rejected` — "S146 status is 'mined', expected 'rejected'" |
| rev1 S146=mined | **mutant `3dea69b`** | **0** | **true** | `[]` |
| rev1 S146=mined | restored `b1d05df` | **1** | false | `r2-s146-not-rejected` (identical to pristine) |
| rev2 S146=rejected | pristine `b1d05df` | 0 | true | `[]` |
| rev2 S146=rejected | mutant `3dea69b` | 0 | true | `[]` |

The mutant greens a fixture the pristine checker refuses, and refuses nothing the
pristine checker accepts. **Verdict on the mutant: KILLED — the dropped clause is
load-bearing.** Baseline (pristine on rev1) does not crash, so the kill is not a
baseline failure.

## Exact commands and output

```
$ sha256sum .../round-42/counters/check-routed-defects-round42.mjs
b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8  .../check-routed-defects-round42.mjs

$ git -C /fast/scratch/hyaku/tabi-r42/MutC2Status/fixture-repo rev-parse --show-toplevel
/fast/scratch/hyaku/tabi-r42/MutC2Status/fixture-repo

$ node check-pristine.mjs --rev 31f10b5425ff1fccadc1eb216cff65ef1e4aaa6a --repo $D --json
{ "schema": "tabi-r42-routed-defects", "rev": "31f10b5425ff1fccadc1eb216cff65ef1e4aaa6a", "predicate": false,
  "findingCount": 1, "findings": [ { "id": "r2-s146-not-rejected",
  "detail": "S146 status is 'mined', expected 'rejected'" } ] }          # exit 1

$ node check-mutant.mjs --rev 31f10b5425ff1fccadc1eb216cff65ef1e4aaa6a --repo $D --json
{ "schema": "tabi-r42-routed-defects", "rev": "31f10b5425ff1fccadc1eb216cff65ef1e4aaa6a", "predicate": true,
  "findingCount": 0, "findings": [] }                                   # exit 0

$ node check-restored.mjs --rev 31f10b5425ff1fccadc1eb216cff65ef1e4aaa6a --repo $D --json
... findingCount 1, findings [r2-s146-not-rejected] ...                  # exit 1

$ node check-pristine.mjs --rev 65d83cdaf264d206ebc6896e0fe61c9608ea6590 --repo $D --json
... predicate true, findingCount 0 ...                                   # exit 0
```

`evidence/commands.sh` records the same sequence; raw stdout/stderr/exit for each
run is in `evidence/*-output.json`.

## Restoration evidence

Scratch copies only; the lane file was never opened for write. Before/after:
lane sha256 was `b1d05df...` at start and `b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8` after
all runs; `git -C <production tree> status` was not touched by this seat. The
restored scratch copy hash `b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8` equals the pristine/lane
hash exactly, and its re-run reproduces the pristine output byte-for-byte. Scratch
root `/fast/scratch/hyaku/tabi-r42/MutC2Status/` deleted after copying these
receipts.

## Limitations

- The fixture's SOURCES.md is a 4-line table (header + S146 mined + real S148),
  not the 146 KB corpus. The checker scans only rows matching
  `^\|\s*S\d{3,}\s*\|`, so the clause under test does not depend on the other
  rows; but the fixture does not exercise interaction with them.
- R4's TSV rows and its 38 evidence blobs are fixture-synthetic (>=200 B each) and
  record no external fact. They make the fixture green on R4 by construction, so
  this probe says nothing about R4 semantics — that is the 38 verdicts' job.
- Only one mutant shape was probed (whole-line deletion). An inverted comparison
  (`=== 'rejected'`) or a widened status set would be a different mutant.
- Fixture revs are local sha1s in a scratch repo, not production revisions; they
  exercise the checker's committed-bytes path but not the production history.
- No tools installed; no network; no pacman.

VERDICT ok — mutant (S146 status clause deleted) greens a fixture the pristine
checker refuses (exit 1, `r2-s146-not-rejected`), and greens nothing pristine
refuses on the control rev: clause is load-bearing; restoration byte-exact.
