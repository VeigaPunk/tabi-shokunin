# ExecC2V0Probe — rebuild the round-43 V0-fabrication fixture

Seat: `ExecC2V0Probe` · lane: tabi round 43, wave 1 · judged on: calibration
Milestone: rebuild V0 fixture · wave item: `ExecC2V0Probe`

## Verdict in one line

The round-43 V0-fabrication fixture rebuilds cleanly (exit 0, `refused: true`, pin finding
present, `r42CheckerExit: 0`) and its receipt is **structurally identical** to the committed
control `.ufo/waves/round-43/controls/c2-v0-probe.json` on every non-volatile field; only
`fixtureRev` differs (new git object id, as expected for a fresh fixture commit).

---

## 1. Scope and what was (not) touched

* Read-only: the production tree `/home/vgpnk/Projects/shokunin/tabi-shokunin`, the fleet root
  `/home/vgpnk/Projects/shokunin`, sibling `*-shokunin` repos, `/home/vgpnk/Projects/shokuknow`.
  Nothing was written, committed, fetched or pushed in any of them.
* No commits, no pushes, no git/jj mutation anywhere except inside the throwaway fixture repo
  created by the fixture generator itself (under my scratch).
* No spawned subagents (leaf seat; the "single labrat" allowance was not needed).
* No network access of any kind: the fixture is fully local, and the fixture's `corpus/SOURCES.md`
  decoy row references a nodejs.org URL as *text only* — no HTTP GET was issued.
* Writes made: only `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1/ExecC2V0Probe/`
  (this seat dir, report + evidence) and `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1/ExecC2V0Probe.md`
  (the path named by the `Report:` trailer).
* Scratch root `/fast/scratch/hyaku/tabi-r43/ExecC2V0Probe/` was created and **deleted before
  yield** (see §7).

## 2. Frozen-byte check (pre-flight)

Counter/claims/checker bytes are frozen at `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc`.
Verified that the worktree copies of the three inputs are byte-identical to that commit
(`git rev-parse <commit>:<path>` vs `git hash-object <worktree path>` — equal in all cases, so
the working tree has not drifted from the freeze):

```
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin && git rev-parse HEAD
ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c
$ git log --oneline -1 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc
7ca6f01 round-43: freeze C1 signature-authenticated chain + C2 hardened checker; controls red
pre-data; S150/S151 opened; live measurement clean
$ git diff --stat 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc -- \
    .ufo/waves/round-43/fixtures/v0-fabrication.mjs \
    .ufo/waves/round-43/counters/check-routed-defects-round43.mjs \
    .ufo/waves/round-42/counters/check-routed-defects-round42.mjs \
    .ufo/waves/round-43/controls/c2-v0-probe.json
DIFF_EXIT=0            # no output => no differences
```

Per-file git blob ids (worktree == freeze commit):

| path | git blob id |
|---|---|
| `.ufo/waves/round-43/counters/check-routed-defects-round43.mjs` | `72804f929c814540c5bc0801255191db411b0e71` |
| `.ufo/waves/round-43/fixtures/v0-fabrication.mjs` | `581e42003e3e15718e0ae3a3d76f9fcbd772dac6` |
| `.ufo/waves/round-42/counters/check-routed-defects-round42.mjs` | `df98d84e765c69a6db50781e4eff4c7d88abfa47` |
| `.ufo/waves/round-43/controls/c2-v0-probe.json` | `5fbee5a0879553842a1e96ce92d689460ccb9bb0` |

sha256 of the fixture generator and the two checkers as executed:

```
b87470625b11aa5b13d72cf1ac888ed004bff7b1d2ef7501f746d2142cb0b80c  .ufo/waves/round-43/fixtures/v0-fabrication.mjs
2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743  .ufo/waves/round-43/counters/check-routed-defects-round43.mjs
b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8  .ufo/waves/round-42/counters/check-routed-defects-round42.mjs
```

The fixture generator's sha256 `b87470…b80c` is **identical** to the `generatorDigest` recorded
in the committed control — i.e. the control was produced by these exact generator bytes, so a
digest mismatch would have been a hard failure signal.

## 3. The run

Environment: `node --version` → `v24.21.0`; `git --version` → `git version 2.56.0`.

```
$ S=/fast/scratch/hyaku/tabi-r43/ExecC2V0Probe; mkdir -p "$S"
$ cd "$S" && node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/fixtures/v0-fabrication.mjs \
    --out "$S/probe.json" \
    --work "$S" \
    --slice /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-42/quarantine/slice-ids.txt
EXIT=0
```

stdout (verbatim, also saved as `fixture-stdout.txt`):

```json
{"schema":"tabi-r43-c2-v0-probe","fixtureRev":"96890784678bc3f8a58b15fb4346cd93d9ad6c28","generatorDigest":"b87470625b11aa5b13d72cf1ac888ed004bff7b1d2ef7501f746d2142cb0b80c","refused":true,"checkerExit":1,"findingIds":["r1-measure-blob-pin-mismatch","r5-claims-absent","r6-probe-absent"],"r42CheckerExit":0,"r42FindingCount":0,"r42FindingIds":[],"note":"V0 self-consistent fabrication; v2 refuses via the measure blob pin; r42 checker bytes recorded for the hole they greened"}
```

stderr: empty.

Every expectation in the seat spec is met:

| expectation | observed |
|---|---|
| exit 0 | `EXIT=0` |
| `refused true` | `"refused":true` |
| pin finding present | `findingIds` contains `r1-measure-blob-pin-mismatch` |
| `r42CheckerExit 0` | `"r42CheckerExit":0` (and `r42FindingCount:0`, `r42FindingIds:[]`) |

Fixture repo hygiene (the generator's own guard, plus independent re-verification):

```
$ git -C "$S/v0-fixture" rev-parse --show-toplevel
/fast/scratch/hyaku/tabi-r43/ExecC2V0Probe/v0-fixture     # == the fixture dir
$ git -C "$S/v0-fixture" log --oneline
9689078 v0 fabrication fixture                            # exactly one commit
$ git -C "$S/v0-fixture" config user.email
v0-fabrication@fixture.local                              # throwaway identity, local to the fixture
$ git -C "$S/v0-fixture" config user.name
V0FabricationFixture
```

The generator asserts `git rev-parse --show-toplevel` equals the fixture dir before its first
commit and dies (exit 64) on mismatch; it did not fire. The slice input had exactly the 38 ids
the generator requires (`wc -l …/round-42/quarantine/slice-ids.txt` → `38`).

## 4. Structural comparison against the committed control

Compared my `probe.json` against
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/controls/c2-v0-probe.json`
field by field (key set, then each value):

```
== control keys == ['checkerExit', 'findingIds', 'fixtureRev', 'generatorDigest', 'note', 'r42CheckerExit', 'r42FindingCount', 'r42FindingIds', 'refused', 'schema']
== probe  keys == ['checkerExit', 'findingIds', 'fixtureRev', 'generatorDigest', 'note', 'r42CheckerExit', 'r42FindingCount', 'r42FindingIds', 'refused', 'schema']
key-set equal: True
MATCH  checkerExit: control=1 mine=1
MATCH  findingIds: control=['r1-measure-blob-pin-mismatch', 'r5-claims-absent', 'r6-probe-absent'] mine=['r1-measure-blob-pin-mismatch', 'r5-claims-absent', 'r6-probe-absent']
VOLATILE fixtureRev: control='a1f3887724f5ec3f6213c068199e9d8454948ece' mine='96890784678bc3f8a58b15fb4346cd93d9ad6c28' differ=True
VOLATILE generatorDigest: control='b87470…b80c' mine='b87470…b80c' differ=False
MATCH  note: control='…' mine='…'
MATCH  r42CheckerExit: control=0 mine=0
MATCH  r42FindingCount: control=0 mine=0
MATCH  r42FindingIds: control=[] mine=[]
MATCH  refused: control=True mine=True
MATCH  schema: control='tabi-r43-c2-v0-probe' mine='tabi-r43-c2-v0-probe'
NON_VOLATILE_DIFFS: []
refused_match: True
findingIds_match: True
r42FindingIds_match: True
r42CheckerExit_match: True
checkerExit_match: True
r42FindingCount_match: True
schema_match: True
note_match: True
```

`fixtureRev` is the only differing field. It differs by construction: the fixture is a fresh
single-commit git repo, so its HEAD object id is a function of the commit timestamp, which
changes per run. `generatorDigest` did **not** differ here (identical generator bytes), so only
one of the two declared-volatile fields actually moved.

## 5. Independent verification (not trusting the fixture's own report)

The fixture could in principle mis-report its own outcome, so both checkers were re-run by
hand against the fixture repo, outside the fixture process.

Round-43 checker (must refuse the fabrication):

```
$ node .ufo/waves/round-43/counters/check-routed-defects-round43.mjs \
    --rev 96890784678bc3f8a58b15fb4346cd93d9ad6c28 \
    --repo "$S/v0-fixture" --json
R43_EXIT=1
{
  "schema": "tabi-r43-routed-defects",
  "rev": "96890784678bc3f8a58b15fb4346cd93d9ad6c28",
  "predicate": false,
  "findingCount": 3,
  "findings": [
    { "id": "r1-measure-blob-pin-mismatch",
      "detail": ".ufo/waves/round-41/measure/c1-measure.json object id 8dae9fba5e5b13975908aeb4971f871a6d350da4 != pinned 8ff64d691f5c09569a50f2a5a038bb23774c3d35" },
    { "id": "r5-claims-absent",  "detail": ".ufo/waves/round-43/claims.json not committed at REV" },
    { "id": "r6-probe-absent",   "detail": ".ufo/waves/round-43/controls/c2-v0-probe.json not committed at REV" }
  ]
}
```

Round-42 checker bytes (the documented hole — they green the fabrication):

```
$ node .ufo/waves/round-42/counters/check-routed-defects-round42.mjs \
    --rev 96890784678bc3f8a58b15fb4346cd93d9ad6c28 \
    --repo "$S/v0-fixture" --json
R42_EXIT=0
{ "schema": "tabi-r42-routed-defects",
  "rev": "96890784678bc3f8a58b15fb4346cd93d9ad6c28",
  "predicate": true, "findingCount": 0, "findings": [] }
```

The refusal is genuinely the **measure-blob pin**, not an incidental type/size failure:

```
$ git -C "$S/v0-fixture" cat-file -t "$REV:corpus/evidence/round41/playwright-egress/receipt.json"        → blob
$ git -C "$S/v0-fixture" cat-file -t "$REV:corpus/evidence/round41/playwright-egress/receipt.witness.json" → blob
$ git -C "$S/v0-fixture" cat-file -t "$REV:.ufo/waves/round-41/measure/c1-measure.json"                      → blob
$ git -C "$S/v0-fixture" rev-parse "$REV:.ufo/waves/round-41/measure/c1-measure.json"
8dae9fba5e5b13975908aeb4971f871a6d350da4        # self-authored replacement
8ff64d691f5c09569a50f2a5a038bb23774c3d35        # pinned
```

Every checked path is a genuine blob (so the S151 `cat-file -t` type gate passes cleanly and is
*not* what fired), and the only difference is the self-authored measure record's object id. That
is exactly the r1 hole the round-43 pin closes.

Calibration cross-check — the same round-43 checker bytes on the **real** lane repo at the freeze
commit are green (the checker is not simply always-refusing):

```
$ node .ufo/waves/round-43/counters/check-routed-defects-round43.mjs \
    --rev 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json
predicate: True  findingCount: 0  findings: []      # exit 0
```

and the pinned blob id is the real one at both the freeze commit and HEAD:

```
$ git cat-file -t 8ff64d691f5c09569a50f2a5a038bb23774c3d35   → blob   (3284 bytes)
$ git rev-parse 7ca6f018…:.ufo/waves/round-41/measure/c1-measure.json → 8ff64d691f5c09569a50f2a5a038bb23774c3d35
$ git rev-parse HEAD:.ufo/waves/round-41/measure/c1-measure.json      → 8ff64d691f5c09569a50f2a5a038bb23774c3d35
```

## 6. Determinism of the rebuild (second run)

A second independent run into a separate scratch subdir, to confirm the rebuild is stable and
the only drift is the fixture rev:

```
$ node …/v0-fabrication.mjs --out "$S/run2/probe.json" --work "$S/run2" --slice …/round-42/quarantine/slice-ids.txt
RUN2_EXIT=0
run2 refused=True  r42CheckerExit=0  checkerExit=1
run1 fixtureRev: 96890784678bc3f8a58b15fb4346cd93d9ad6c28
run2 fixtureRev: 4696191ce57048187d1760cdbc29b23ce42d3585
rev differs (expected): True
generatorDigest equal: True
NON_VOLATILE_DIFFS run1 vs run2: []
```

## 7. Write-boundary audit and scratch cleanup

```
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin && git status --porcelain
 M corpus/README.md
?? .ufo/waves/round-43/w1.ready.dispatched
?? .ufo/waves/round-43/w1/
?? corpus/knowledge/receipt-authenticity-signing-round-43.md
$ cd /home/vgpnk/Projects/shokunin && git status --porcelain
 M .scratch/goal-20261029-hyaku-run12.md
?? tools/
```

Every one of those entries is a **pre-existing** working-tree change made by the parent session
or by sibling seats (the `w1/` tree is the wave seat dir; `corpus/README.md` and
`corpus/knowledge/…` are the parent's artifacts) — none is mine. Targeted confirmation that my
run wrote nothing outside my seat dir and scratch:

```
$ find .ufo/waves/round-43 -newermt '-30 minutes' -not -path '*/w1/*'
                              # (no output — no round-43 file outside w1/ touched)
$ git diff --stat HEAD -- .ufo/waves/round-42/
                              # (empty — round-42 quarantine and the r42 counter untouched)
$ ls -la --time-style=full-iso .ufo/waves/round-43/controls/ .ufo/waves/round-43/fixtures/
                              # all mtimes 17:32–17:41, i.e. before my 17:51+ run
```

The fixture generator writes only under `--work` plus the single `--out` receipt; both were
inside my scratch. Scratch deleted at the end of the seat (see `scratch-cleanup.txt`).

## 8. Limitations

* `fixtureRev` cannot be reproduced byte-for-byte across runs — a fresh git commit's object id
  depends on its timestamp. The control's `a1f38877…` is therefore not expected to reappear;
  only the non-volatile fields are reproducible, and they matched exactly.
* The comparison is a **field-level** structural comparison of the two JSON documents. It does
  not assert byte-identity of the two files, which is impossible while `fixtureRev` differs.
* `r42FindingCount` was compared as `0 == 0` and `r42FindingIds` as `[] == []`; the r42 checker's
  own JSON was also captured verbatim in `r42-checker-direct.json` so the comparison is auditable.
* The fixture exercises the **r1 pin** refusal path. The `r5-claims-absent` and
  `r6-probe-absent` findings are also present in both my run and the committed control — they
  are artifacts of the fixture repo not containing the round-43 claim/probe files (the
  fabrication cannot contain the very control that would catch it), and they reproduce exactly.
* No claim is made here about C1 coverage, the battery, the tree fixture, or the other
  round-43 controls — those are other seats' items and were not evaluated here.
* The round-42 counter and the round-43 counter were executed from the frozen worktree copies
  whose bytes I verified equal the freeze commit; I did not re-verify them against any
  published digest list beyond that.

## 9. Tooling

No tool was installed, upgraded, or modified. The task plan was "No install is planned", and
the run needed only `node` v24.21.0 and `git` 2.56.0, both already present. Per the operator
directive of 2026-10-19 I read `/home/vgpnk/.omp/agent/RULES.md` first; it mandates the pacman
channel order, which is **paused host-wide** (PACMAN GUARD) — no pacman transaction was run,
and no install was attempted through any channel.

## 10. Evidence files (all under the seat dir)

| file | content |
|---|---|
| `report.md` | this report |
| `probe.json` | the rebuilt fixture receipt (verbatim copy of the fixture's `--out`) |
| `fixture-stdout.txt` | the fixture's stdout, verbatim |
| `fixture-stderr.txt` | the fixture's stderr (empty) |
| `r43-checker-direct.json` | independent run of the round-43 checker against the fixture repo |
| `r42-checker-direct.json` | independent run of the round-42 checker against the fixture repo |
| `scratch-cleanup.txt` | receipt that the scratch root was deleted before yield |

Scratch artifacts (the fixture git repo, run-2 copy, direct checker outputs) lived under
`/fast/scratch/hyaku/tabi-r43/ExecC2V0Probe/` and were deleted before yield; the receipts that
matter are copied into this seat dir first.

VERDICT ok the round-43 V0 fixture rebuild reproduces the committed control exactly on all non-volatile fields (refused, findingIds, r42FindingIds, r42CheckerExit, checkerExit, r42FindingCount, schema, note) and independently refuses the fabricated repo via the measure blob pin while the round-42 checker bytes green it.
