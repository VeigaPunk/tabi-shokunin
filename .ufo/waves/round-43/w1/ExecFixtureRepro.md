# ExecFixtureRepro — round-43 C2 fixture determinism

**Seat:** `ExecFixtureRepro` · **Milestone:** fixture determinism · **Lane:** build-and-attack, wave 1
**Verdict scope:** operability of the two round-43 C2 fixture generators under repeated execution.
**Claim under test:** C2 calibration — the round-43 routed-defect checker and its two frozen fixture generators
(`.ufo/waves/round-43/fixtures/v0-fabrication.mjs`, `.../tree-vs-blob.mjs`) must produce reproducible evidence,
so that a re-run cannot silently change the committed control bytes.

## TL;DR

Both round-43 C2 fixture generators are **deterministic**. Each was executed **three times** (twice in fresh
scratch dirs under an identical environment as the spec requires, plus a third under a deliberately perturbed
environment as a robustness probe). In every pairing, the receipt differs in **exactly one field — `fixtureRev`** —
and is byte-identical elsewhere. The `fixtureRev` divergence was traced to its sole cause: the git **commit
envelope timestamp**. The committed **tree** object of each fixture is byte-identical across all runs, and
reconstructing run B's commit from run A's tree plus run B's envelope reproduces run B's rev exactly.

| Generator | Runs | Exit | Receipt fields compared | Non-`fixtureRev` diffs | Result |
|---|---|---|---|---|---|
| `v0-fabrication.mjs` | A, B, C | 0 / 0 / 0 | 10 | **0** | deterministic |
| `tree-vs-blob.mjs` | A, B, C | 0 / 0 / 0 | 8 | **0** | deterministic |

The two committed controls in the lane (`.ufo/waves/round-43/controls/c2-v0-probe.json`,
`c2-tree-fixture.json`) also reproduce byte-identically modulo `fixtureRev` against a fresh run — so the
committed control evidence is reproducible from the frozen generator bytes.

## Exact commands and output

### 0. Environment and frozen byte digests

```
$ node --version
v24.21.0
$ git --version
git version 2.56.0

$ sha256sum .ufo/waves/round-43/fixtures/v0-fabrication.mjs \
            .ufo/waves/round-43/fixtures/tree-vs-blob.mjs \
            .ufo/waves/round-43/counters/check-routed-defects-round43.mjs \
            .ufo/waves/round-42/counters/check-routed-defects-round42.mjs
b87470625b11aa5b13d72cf1ac888ed004bff7b1d2ef7501f746d2142cb0b80c  .ufo/waves/round-43/fixtures/v0-fabrication.mjs
7407f6cd498362658fb0c78b61698489c373444ff3ce6982824ded877259ab6d  .ufo/waves/round-43/fixtures/tree-vs-blob.mjs
2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743  .ufo/waves/round-43/counters/check-routed-defects-round43.mjs
b1d05df17137bfcf4db9c6d2851108e1313cf2229167b8b521fee2aa1c76b4a8  .ufo/waves/round-42/counters/check-routed-defects-round42.mjs
```

The `v0-fabrication.mjs` digest `b87470625b11…0b80c` equals the `generatorDigest` recorded in the committed
control `.ufo/waves/round-43/controls/c2-v0-probe.json`, and in every receipt produced by this seat — the r6
binding "names the frozen generator digest" holds against the bytes actually on disk.

### 1. The two mandated runs (fresh scratch dirs, identical environment)

Scratch root `/fast/scratch/hyaku/tabi-r43/ExecFixtureRepro/`; each generator got its own fresh `--work` dir;
a `sleep 2` between runs guarantees distinct commit timestamps.

```
$ node .../fixtures/v0-fabrication.mjs --out .../runA/v0-probe.json  --work .../runA/work  --slice .../round-42/quarantine/slice-ids.txt
=== EXIT: 0
$ node .../fixtures/v0-fabrication.mjs --out .../runB/v0-probe.json  --work .../runB/work  --slice .../round-42/quarantine/slice-ids.txt
=== EXIT: 0
$ node .../fixtures/tree-vs-blob.mjs --out .../runA/tree-receipt.json --work .../runA/twork
=== EXIT: 0
$ node .../fixtures/tree-vs-blob.mjs --out .../runB/tree-receipt.json --work .../runB/twork
=== EXIT: 0
```

All four runs exited 0 (each generator exits 0 only when its own success predicate holds: V0 must be refused
by the v2 checker *and* greened by the r42 checker bytes; the tree fixture must have `r1a-not-a-blob` named).

### 2. Structural comparison of the two receipts

Comparator `compare.mjs` (copied to the seat dir) flattens both receipts to JSON paths and diffs them.

**`v0-fabrication.mjs` — run A vs run B**
```json
{
 "label": "v0-fabrication A vs B",
 "totalPathsCompared": 10,
 "diffPaths": [ { "path": "fixtureRev",
                  "a": "\"b6abb4ba61e2e014bb925681386bddf8bdddad85\"",
                  "b": "\"d4e6e9bfb07c22a1cd467fa755696d9d0c9258e3\"" } ],
 "nonFixtureRevDiffCount": 0,
 "identicalIgnoringFixtureRev": true,
 "verdict": "DETERMINISTIC"
}
```

**`tree-vs-blob.mjs` — run A vs run B**
```json
{
 "label": "tree-vs-blob A vs B",
 "totalPathsCompared": 8,
 "diffPaths": [ { "path": "fixtureRev",
                  "a": "\"ec1ae0c2f4896752728aaac77f18fa972125847d\"",
                  "b": "\"2cdf8064513787b26306c5696ba901d075cad93e\"" } ],
 "nonFixtureRevDiffCount": 0,
 "identicalIgnoringFixtureRev": true,
 "verdict": "DETERMINISTIC"
}
```

The **named acceptance fields** are identical across the two runs:

- V0 receipt: `refused: true` in both; `findingIds: ["r1-measure-blob-pin-mismatch","r5-claims-absent","r6-probe-absent"]`
  in both; `checkerExit: 1`; `r42CheckerExit: 0`; `r42FindingCount: 0`; `r42FindingIds: []`; `generatorDigest` identical.
- Tree receipt: `typeViolationNamed: true` in both; `v2.findingIds` (8 ids, incl. `r1a-not-a-blob`) identical;
  `r42.findingIds` (6 ids, incl. `r1a-unparseable` — the unnamed type violation the r42 bytes allowed) identical;
  `v2.exit: 1`, `r42.exit: 1` in both.

### 3. Nothing else varies — byte-level, with `fixtureRev` normalised

Replacing only the 40-hex `fixtureRev` value with `<REV>` and hashing the whole receipt file:

```
v0-A-vs-B:    IDENTICAL  (e09c1bbaffe99f40ed50d2ec5dfdda8beb06d3c473d9f5ce24c611432fc75aa0 vs e09c1bb…7aa0)
v0-A-vs-C:    IDENTICAL  (e09c1bbaffe99f40ed50d2ec5dfdda8beb06d3c473d9f5ce24c611432fc75aa0 vs e09c1bb…7aa0)
tree-A-vs-B:  IDENTICAL  (31ee118586a3cb15a423d6cf5e91e9624d93f040343cfd89b0acfb9f7adf74ef vs 31ee1185…74ef)
tree-A-vs-C:  IDENTICAL  (31ee118586a3cb15a423d6cf5e91e9624d93f040343cfd89b0acfb9f7adf74ef vs 31ee1185…74ef)
committed-v0-vs-runA:   IDENTICAL
committed-tree-vs-runA: IDENTICAL
```

So the *entire receipt file* — not merely the compared fields — is byte-stable once the single rev string is
masked. The last two lines extend the comparison to the lane's committed control bytes, which reproduce
byte-identically modulo `fixtureRev` from a fresh run of the frozen generator.

### 4. Root cause of the `fixtureRev` divergence — proven, not assumed

The spec expects `fixtureRev` to differ because of commit timestamps. That expectation was **verified**, not
assumed:

**a) The committed tree is byte-identical across runs.**
```
## work/v0-fixture
  runA HEAD=b6abb4ba61e2e014bb925681386bddf8bdddad85 tree=4224bcef5319723f3b9de29a43a93b1b61cea21a ts=2026-10-29T17:53:09-03:00
  runB HEAD=d4e6e9bfb07c22a1cd467fa755696d9d0c9258e3 tree=4224bcef5319723f3b9de29a43a93b1b61cea21a ts=2026-10-29T17:53:12-03:00
## twork/tree-blob-fixture
  runA HEAD=ec1ae0c2f4896752728aaac77f18fa972125847d tree=2bae637ff7e0971fe7c70ad58f4122de5cad1578 ts=2026-10-29T17:53:14-03:00
  runB HEAD=2cdf8064513787b26306c5696ba901d075cad93e tree=2bae637ff7e0971fe7c70ad58f4122de5cad1578 ts=2026-10-29T17:53:16-03:00
```
Same tree id, different HEAD, timestamps 3 s and 2 s apart.

**b) Blobs+trees object DB is identical; only commit objects differ.**
```
### work/v0-fixture          blobs+trees: runA d197c84c5c27e4fc… == runB d197c84c5c27e4fc…   (IDENTICAL)
                            commits:     runA 93471f573c3757f5… != runB 49d37c9bdbda3482…   (DIFFER)
### twork/tree-blob-fixture blobs+trees: runA 2169853331b26a97… == runB 2169853331b26a97…   (IDENTICAL)
                            commits:     runA dfb1b2987c69c98d… != runB 42e798fd8a4895eb1…   (DIFFER)
```

**c) The commit envelope alone reproduces the other run's rev.** Taking run B's raw commit object and
substituting run A's tree id (keeping B's timestamp/identity) yields run B's rev exactly:
```
[v0]   treeA==treeB: True
[v0]   commit-with-B-envelope+treeA == revB: True  (d4e6e9bfb07c22a1cd467fa755696d9d0c9258e3 vs d4e6e9bfb07c22a1cd467fa755696d9d0c9258e3)
[tree] treeA==treeB: True
[tree] commit-with-B-envelope+treeA == revB: True  (2cdf8064513787b26306c5696ba901d075cad93e vs 2cdf8064513787b26306c5696ba901d075cad93e)
```
Conclusion: the rev variance is **exclusively** the commit timestamp (author/committer date). No path
length, cwd, hostname, umask, or ordering nondeterminism is present in the fixture content.

### 5. Third run under a perturbed environment (robustness probe)

Run C was executed with a different timezone, an overridden `HOME`, and a different cwd, to test that the
determinism is not an artifact of one environment:
```
( cd / && TZ=Asia/Tokyo HOME=/tmp node .../v0-fabrication.mjs --out .../runC/v0/v0-probe.json --work .../runC/v0/work --slice ... )   rc=0
( cd /tmp && TZ=America/Denver HOME=/tmp node .../tree-vs-blob.mjs --out .../runC/tree/tree-receipt.json --work .../runC/tree/twork )       rc=0
```
Both compared structurally identical to run A (see §3): `nonFixtureRevDiffCount: 0` for each.
`refused: true`, `typeViolationNamed: true`, and every `findingIds` list unchanged under the perturbation.

### 6. Repository hygiene — read-only respected

```
$ git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain
 M corpus/README.md
?? .ufo/waves/round-43/w1.ready.dispatched
?? .ufo/waves/round-43/w1/
?? corpus/knowledge/receipt-authenticity-signing-round-43.md
?? corpus/lessons/round-43.md
$ git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD
ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c
$ find /home/vgpnk/Projects/shokuknow -newermt '2026-10-29 17:52' -type f | head -5
(none — shokuknow untouched)
```
Every entry in the lane status is a pre-existing artifact of the wave or another seat's output; this seat
added only `.ufo/waves/round-43/w1/ExecFixtureRepro/` (its own scope) and `.ufo/waves/round-43/w1/ExecFixtureRepro.md`.
The lane HEAD is unchanged, no commit/push/git mutation was performed outside scratch, and the sibling
`shokuknow` tree (the round-39 incident site) has no file newer than seat start.

The fixture generators create their git repos under `--work` only, each verifying
`git rev-parse --show-toplevel` equals the fixture dir before committing, with a throwaway identity set
locally on the fixture repo (`v0-fabrication@fixture.local` / `tree-vs-blob@fixture.local`). Confirmed:

```
runA toplevel: /fast/scratch/hyaku/tabi-r43/ExecFixtureRepro/runA/work/v0-fixture
runB toplevel: /fast/scratch/hyaku/tabi-r43/ExecFixtureRepro/runB/work/v0-fixture
```
i.e. every fixture commit landed inside the scratch fixture, never in the lane or fleet repo.

## Findings

**No defects found.** Both generators are reproducible; the one varying field (`fixtureRev`) varies for
exactly the documented reason (commit timestamp), proven at object level.

Observations worth recording (none is a defect, and none proposes an amendment — the counter bytes are frozen):

1. `fixtureRev` is inherently non-reproducible across runs. The r6 checker validates it only by shape
   (`/^[0-9a-f]{40}$/`) and not against a pinned value, so a re-run with a new rev does not falsify the
   committed control. The control's semantic content (`refused`, `findingIds`, `generatorDigest`) is what
   r6 binds to, and that content is reproducible — as this seat measured.
2. Because the fixture **tree** is byte-stable, a re-run's rev could in principle be pinned by tree id
   (`4224bcef…` for the V0 fixture, `2bae637f…` for the tree fixture) rather than by rev. `[INFERENCE]` —
   not proposed, since counter bytes are frozen; noted only because it is the invariant this seat actually
   measured.

## Limitations

- Determinism was measured on this host with `node v24.21.0` / `git 2.56.0`, Linux x86-64. A different git
  version could in principle hash-commit differently, though the object-id algorithm is stable across git 2.x.
- Three runs per generator, not a statistical sample; the claim is that no source of nondeterminism was
  observed, not that none can ever exist.
- The tree fixture performs two commits ("wip" then "binding"); the intermediate commit's tree
  (`21047ea9…`) was also identical across runs, and the "binding" commit's tree is the one the checker reads.
- The V0 generator's `--slice` input was taken read-only from the lane's committed
  `.ufo/waves/round-42/quarantine/slice-ids.txt` (38 ids, matching the generator's own expectation of 38).
- This seat evaluated **operability/determinism only**. It makes no finding on the substantive merit of the
  C2 checker rules (r1a/r5/r6 content), which other seats own.

## Tooling

No tools were installed or upgraded. The operator tooling directive permits installs that help the task; none
was needed — the task required only the already-present `node` (v24.21.0) and `git` (2.56.0). Per the host
guard, **pacman was not invoked** (transactions are paused host-wide); no `pacman -S/-Sy/-Syu/-U/-R` was run.

## Evidence paths

All under `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1/ExecFixtureRepro/`:

- `evidence-transcript.txt` — full command/output transcript for every check above.
- `receipts/v0-runA-probe.json`, `receipts/v0-runB-probe.json`, `receipts/v0-runC-perturbed-probe.json`
- `receipts/tree-runA-receipt.json`, `receipts/tree-runB-receipt.json`, `receipts/tree-runC-perturbed-receipt.json`
- `compare.mjs` — the structural comparator used (JSON-path flattening diff).
- `reports/v0-runA.log`, `reports/v0-runB.log`, `reports/tree-runA.log`, `reports/tree-runB.log` — per-run command/exit/stdout/stderr.
- `reports/v0-runC.stdout`, `reports/tree-runC.stdout` — perturbed-environment run stdout.

Scratch root `/fast/scratch/hyaku/tabi-r43/ExecFixtureRepro/` was removed after the evidence above was copied
into the seat directory.

VERDICT ok both round-43 C2 fixture generators are deterministic: three runs each (two mandated fresh scratch dirs plus one perturbed-environment replication) exit 0 and produce receipts differing in exactly one field, fixtureRev, whose variance is proven to be the git commit timestamp alone (identical committed tree objects and identical blobs+trees object DBs across runs); every named acceptance field — refused, typeViolationNamed, and both findingIds lists — is identical across all runs, and the lane's committed control bytes reproduce byte-identically modulo fixtureRev.
