# ExecC2FreezeRev — C2 counting command at the freeze rev (tabi round 43, wave 1)

Seat: `ExecC2FreezeRev` (executor, leaf). Axis: **calibration**. Milestone: **C2 counting
command at the freeze rev**.

Frozen claim under test: **C2 (calibration)** — round-42 routed-defect checker hardened
(`.ufo/waves/round-43/counters/check-routed-defects-round43.mjs`, `--rev <rev> --repo <repo> --json`).
Claim and counter bytes are frozen at `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc`
(baseline `ab592825cd195599822ca227f7768914df208201`).

No counter/claims/checker bytes were amended, proposed for amendment, copied into place, or
mutated. No commits, pushes, fetches, agent spawns, or writes outside this seat's report path
and seat evidence dir.

---

## 1. Environment and tooling

| tool | version | channel | reason |
|---|---|---|---|
| node | v24.21.0 | pre-installed (no install performed) | runs the frozen `.mjs` counter |
| git | 2.56.0 | pre-installed (no install performed) | shared clone, `cat-file`/`rev-parse` plumbing |

No tool was installed or upgraded this seat (no `pacman`, no `uv tool`, no `~/.local/bin`
writes). `/home/vgpnk/.omp/agent/RULES.md` was read first; the pacman guard was honoured by
running no pacman transaction at all.

Scratch root (created by this seat, deleted before yield):
`/fast/scratch/hyaku/tabi-r43/ExecC2FreezeRev/`
`→ clone/` (shared clone), `→ fx/` (fixture repos), plus run outputs.

## 2. Clone and freeze-rev identity checks (read-only)

```
S=/fast/scratch/hyaku/tabi-r43/ExecC2FreezeRev
D="$S/clone"
mkdir -p "$S"
git clone --shared --quiet /home/vgpnk/Projects/shokunin/tabi-shokunin "$D"
git -C "$D" rev-parse --show-toplevel
git -C "$D" cat-file -t 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc
git -C "$D" cat-file -t ab592825cd195599822ca227f7768914df208201
git -C "$D" checkout --quiet 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc
git -C "$D" rev-parse HEAD
```

Observed:

```
/fast/scratch/hyaku/tabi-r43/ExecC2FreezeRev/clone
commit
commit
7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc
```

`git -C "$D" status --porcelain` after checkout: empty (clean tree at the freeze rev).

**Frozen-byte identity** (checker / claims / controls identical at the freeze rev, in the lane
working tree, and at HEAD `ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c`):

| path | freeze rev blob | lane worktree blob | HEAD blob |
|---|---|---|---|
| `.ufo/waves/round-43/counters/check-routed-defects-round43.mjs` | `72804f929c814540c5bc0801255191db411b0e71` | `72804f9…` | `72804f9…` |
| `.ufo/waves/round-43/claims.json` | `f3036d9eddad68da5ef2899b6b0da8737cc5f40e` | `f3036d9…` | `f3036d9…` |
| `.ufo/waves/round-43/controls/c2-baseline-red-r43.json` | `e028ea1ef8c5ffbc7bd56de8d6dd5bfde478d847` | `e028ea1…` | `e028ea1…` |
| `.ufo/waves/round-43/controls/c2-v0-probe.json` | `5fbee5a0879553842a1e96ce92d689460ccb9bb0` | `5fbee5a…` | `5fbee5a…` |
| `.ufo/waves/round-43/controls/c2-tree-fixture.json` | `0b575459d5b4db72a3b91ae9985e5063f7a029b4` | `0b575459…` | `0b575459…` |

## 3. The counting command at the freeze rev — EXIT 0, findingCount 0 (expected)

```
cd "$D"
node .ufo/waves/round-43/counters/check-routed-defects-round43.mjs \
  --rev 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc --repo "$D" --json
```

Observed (JSON truncated only in the `predicateSentence` field by the transcript viewer; the
full bytes are in the evidence file):

```json
{
 "schema": "tabi-r43-routed-defects",
 "predicateSentence": "check-routed-defects-round43 counts zero findings at the measured revision where (r1a) … (r6) …",
 "rev": "7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc",
 "predicate": true,
 "findingCount": 0,
 "findings": []
}
EXIT=0
```

Evidence: `w1/ExecC2FreezeRev/freeze-rev-clone-repo.json`
(sha256 `b1e62cd2ce17616d1e0b616e9396135ce1dec14a4683cb6a35e78361a4496620`).

Reproducibility / repo-independence (three runs, all exit 0, all byte-identical output):

| run | `--repo` | exit | findingCount | output sha256 |
|---|---|---|---|---|
| 1 | clone (at freeze rev) | 0 | 0 | `b1e62cd2…96620` |
| 2 | clone (rerun, same) | 0 | 0 | `b1e62cd2…96620` |
| 3 | lane repo (read-only) | 0 | 0 | `b1e62cd2…96620` |

Evidence: `freeze-rev-clone-repo.json`, `freeze-rev-clone-repo-rerun.json`,
`freeze-rev-lane-repo.json`.

Additional data point (not required, but it shows the green is rev-specific, not ambient):
the same command at HEAD `ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c` also exits 0 with
`findingCount 0`.

## 4. Baseline `ab592825cd195599822ca227f7768914df208201` — committed red control reproduces

```
cd "$D"
node .ufo/waves/round-43/counters/check-routed-defects-round43.mjs \
  --rev ab592825cd195599822ca227f7768914df208201 --repo "$D" --json
```

Observed:

```json
{
 "schema": "tabi-r43-routed-defects",
 "rev": "ab592825cd195599822ca227f7768914df208201",
 "predicate": false,
 "findingCount": 2,
 "findings": [
  { "id": "r5-claims-absent",
    "detail": ".ufo/waves/round-43/claims.json not committed at REV" },
  { "id": "r6-probe-absent",
    "detail": ".ufo/waves/round-43/controls/c2-v0-probe.json not committed at REV" }
 ]
}
EXIT=1
```

The **committed control's own command verbatim** (`--repo /home/vgpnk/Projects/shokunin/tabi-shokunin`,
read-only git plumbing only) was also executed and produced a **byte-identical** JSON document:

```
diff baseline-rev-clone-repo.json baseline-rev-lane-repo.json   → no differences
sha256sum both → 0abcb2c7eac613ca134ac39c4ea9b04057ace9c8f793d4f5ebb42c9be6035e19
```

Committed control `.ufo/waves/round-43/controls/c2-baseline-red-r43.json` claims
`exit 1`, `findingCount 2`, `findingIds ["r5-claims-absent","r6-probe-absent"]`,
`predicate false` at rev `ab592825…` — **all four fields reproduced exactly**.

Evidence: `w1/ExecC2FreezeRev/baseline-rev-clone-repo.json`,
`w1/ExecC2FreezeRev/baseline-rev-lane-repo.json`.

## 5. Independent re-derivation (guard against a vacuous zero)

The frozen checker was **not** trusted on its own word. A separate script written for this seat
(`w1/ExecC2FreezeRev/independent-rederive.mjs`, 7154 bytes, does not import or reuse the
checker's code) re-derives all six branches from raw git plumbing (`cat-file -t`, `cat-file -s`,
`rev-parse`, `show`) plus sha256, at rev `7ca6f018…`:

| branch | independently re-derived state at the freeze rev |
|---|---|
| r1 measure pin | `.ufo/waves/round-41/measure/c1-measure.json` is a blob, object id `8ff64d691f5c09569a50f2a5a038bb23774c3d35` == pinned id |
| r1a receipt | blob, 1 167 198 B, parses as JSON, sha256 `416f6e4b…6db1` == recorded `receiptSha256` |
| r1b witness | blob, 1 153 988 B, parses as JSON, sha256 `d3c9972e…9d3` == recorded `witnessSha256` |
| r2 S148/S146 | S148 present, teaches `supersedes S146 — A space-separated list of command-line options.`, prefix ok, quote 6 words (≤25), quote verbatim in the committed staged node-CLI blob; S146 status `rejected` |
| r3 baseline | blob, 343 B, records `ls-tree` and the digit `0` |
| r4 TSV | slice ids 38 = TSV rows 38, id sets equal, no duplicate ids, no verdict outside `{present,absent,misbound,partial,unreachable}`, 38 evidence paths all committed blobs ≥ 200 B |
| r5 freeze binds controls | 8 control bindings (≥5 required); every bound control committed as a blob, every committed sha256 == frozen sha256, every frozen quote present verbatim in the committed control bytes |
| r6 V0 probe | committed blob; `refused: true`; findingIds include `r1-measure-blob-pin-mismatch`; `fixtureRev` 40-hex; `generatorDigest` 64-hex = `b87470625b11aa5b13d72cf1ac888ed004bff7b1d2ef7501f746d2142cb0b80c`, which is exactly the sha256 of the frozen generator `.ufo/waves/round-43/fixtures/v0-fabrication.mjs` at the freeze rev |

Every branch the frozen predicate sentence names is **earned** by committed bytes; the zero is
not vacuous and not a no-op path.

At the baseline rev the same independent re-derivation shows r1–r4 already satisfied and only
the two round-43 additions missing (claims.json and the V0 probe absent) — matching the
checker's two baseline findings exactly, i.e. the red control isolates precisely the two
round-43-specific branches.

Evidence: `w1/ExecC2FreezeRev/independent-rederivation-freeze.json`,
`w1/ExecC2FreezeRev/independent-rederivation-baseline.json`,
`w1/ExecC2FreezeRev/independent-rederive.mjs`.

## 6. Fixture controls of the same command re-run (calibration of the refusal paths)

Both committed fixture controls were regenerated from their frozen generator scripts, into
scratch only (each generator builds its own throwaway git repo under my scratch, verifies
`git rev-parse --show-toplevel` before its first commit, and uses a fixture-local identity):

```
node <lane>/.ufo/waves/round-43/fixtures/tree-vs-blob.mjs \
  --out "$S/fx/tree-fixture-repro.json" --work "$S/fx/treework"      → EXIT 0
node <lane>/.ufo/waves/round-43/fixtures/v0-fabrication.mjs \
  --out "$S/fx/v0-probe-repro.json" --work "$S/fx/v0work" \
  --slice <lane>/.ufo/waves/round-42/quarantine/slice-ids.txt        → EXIT 0
```

* **Tree fixture** (`r1a-not-a-blob` live, S151 type gate): reproduced v2 findings
  `["r1-measure-blob-pin-mismatch","r1a-not-a-blob","r1b-too-small","r2-sources-absent","r3-baseline-absent","r4-slice-absent","r5-claims-absent","r6-probe-absent"]`
  and r42 findings
  `["r1a-unparseable","r1b-too-small","r2-sources-absent","r3-baseline-file-absent","r4-slice-absent","r4-quarantine-absent"]`
  — byte-equal to the committed `c2-tree-fixture.json` on every field except the fixture rev
  (regenerated `a5d882da540fa31eb8f5378b86131dc70b2e4364` vs committed
  `d28c27897e203857195a88e59683b6c129d0c804`; the rev necessarily differs because the fixture
  is a fresh commit).
* **V0 probe** (self-consistent fabrication refused via the measure-blob pin): reproduced
  `refused: true`, `checkerExit: 1`, findingIds
  `["r1-measure-blob-pin-mismatch","r5-claims-absent","r6-probe-absent"]`, `r42CheckerExit: 0`
  with `r42FindingCount: 0`, and the same `generatorDigest`
  `b87470625b11aa5b13d72cf1ac888ed004bff7b1d2ef7501f746d2142cb0b80c` — byte-equal to the
  committed `c2-v0-probe.json` on every field except the fixture rev (regenerated
  `e3fc18ee04e68d4a47d4241bcf11f88928045957` vs committed
  `a1f3887724f5ec3f6213c068199e9d8454948ece`).

Evidence: `w1/ExecC2FreezeRev/tree-fixture-repro.json`, `w1/ExecC2FreezeRev/v0-probe-repro.json`.

## 7. Interface discipline probes (the counter cannot be made vacuously green by a typo)

```
node … --rev 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc --json          # missing --repo
→ {"schema":"tabi-r43-routed-defects","error":"usage: node check-routed-defects-round43.mjs --rev <40-hex rev> --repo <lane repo> [--json]"}
  EXIT=2

node … --rev HEAD --repo "$D" --json                                   # non-40-hex rev
→ same usage error, EXIT=2

node … --rev 0000000000000000000000000000000000000000 --repo "$D" --json   # well-formed, nonexistent
→ predicate=false, findingCount=8,
  ["r1-measure-absent","r1a-absent","r1b-absent","r2-sources-absent",
   "r3-baseline-absent","r4-slice-absent","r5-claims-absent","r6-probe-absent"]
  EXIT=1
```

A malformed or unresolvable revision produces a loud refusal (exit 2 / exit 1 with eight
absent-path findings), never a green zero.

## 8. Scope, side effects and limitations

* Files written by this seat: `.ufo/waves/round-43/w1/ExecC2FreezeRev.md` (this report),
  `.ufo/waves/round-43/w1/ExecC2FreezeRev/report.md` (identical copy of this report, inside the
  seat dir), the ten evidence files listed below, and `SHA256SUMS.txt` (sha256 manifest of the
  seat dir, written after the ten) — all inside `.ufo/waves/round-43/w1/ExecC2FreezeRev/`.
  Nothing else was written anywhere. No commit, push, fetch, tag, branch, or other git/jj
  mutation was performed in any repository; the only commits created were inside the two
  throwaway fixture repos under my scratch, created by the frozen fixture generators themselves
  with fixture-local identities.
* The lane repo `/home/vgpnk/Projects/shokunin/tabi-shokunin` was used **read-only**: `git clone
  --shared` (object reads), `git show`/`cat-file`/`rev-parse`/`hash-object` (object reads).
  `git status --porcelain` at the end of the seat shows the same entries as at the start
  (`?? .ufo/waves/round-43/w1/`, `?? .ufo/waves/round-43/w1.ready.dispatched`,
  `?? corpus/knowledge/receipt-authenticity-signing-round-43.md`, plus `M corpus/README.md`).
  `M corpus/README.md` appeared *between* my first and last status observations and is **not
  mine** — I never wrote outside my seat paths; it is a concurrent change by another seat, and
  the head commit `ba433c94` likewise pre-exists my seat.
* Limitations: the fixture revs in §6 necessarily differ from the committed ones (fresh commits
  in fresh fixture repos); every other field of both committed fixture controls reproduced
  byte-for-byte. The checker was exercised at exactly three revisions
  (`7ca6f018…`, `ab592825…`, `ba433c94…`) plus two synthetic revs (nonexistent 40-hex, and the
  two argument-error cases); no other revision history was walked. This seat attests to the
  **calibration** of the C2 counting command only — it makes no claim about C1, the SIGNATURE-
  AUTHENTICATED Playwright chain, or the residual model declared in `claims.json`.
* The C2 counter's green at the freeze rev is a statement about **committed bytes at that
  revision**, not about the current working tree (which is ahead of the freeze rev at HEAD
  `ba433c94`).

## 9. Evidence index (all under `.ufo/waves/round-43/w1/ExecC2FreezeRev/`)

| file | content |
|---|---|
| `freeze-rev-clone-repo.json` | freeze-rev run output, `--repo` = scratch clone (exit 0, 0 findings) |
| `freeze-rev-clone-repo-rerun.json` | second identical freeze-rev run (determinism) |
| `freeze-rev-lane-repo.json` | freeze-rev run output, `--repo` = lane repo (byte-identical) |
| `baseline-rev-clone-repo.json` | baseline run output, `--repo` = scratch clone (exit 1, 2 findings) |
| `baseline-rev-lane-repo.json` | baseline run output, committed control's verbatim command |
| `independent-rederive.mjs` | independent re-derivation script used in §5 (7154 B) |
| `independent-rederivation-freeze.json` | its output at the freeze rev |
| `independent-rederivation-baseline.json` | its output at the baseline rev |
| `tree-fixture-repro.json` | regenerated tree-vs-blob control receipt |
| `v0-probe-repro.json` | regenerated V0-probe control receipt |

## 10. Result

* Freeze rev `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc`: **exit 0, `predicate: true`,
  `findingCount: 0`, `findings: []`** — as expected. Deterministic across reruns and
  independent of the `--repo` path used.
* Baseline `ab592825cd195599822ca227f7768914df208201`: **exit 1, `findingCount: 2`,
  ids `r5-claims-absent`, `r6-probe-absent`, `predicate: false`** — the committed red control
  `.ufo/waves/round-43/controls/c2-baseline-red-r43.json` reproduces exactly.
* Both committed fixture controls of the same counter (tree-type gate, V0 refusal) regenerate
  field-for-field; all six predicate branches are independently re-derived from committed
  bytes; malformed/unresolvable revisions refuse loudly.
* No hole in the C2 counter's calibration was found by this seat. No amendment to the frozen
  counter, claims, or controls is proposed.

VERDICT ok C2 counting command reproduces exit 0 / findingCount 0 at the freeze rev 7ca6f018 and the committed red control reproduces exactly (exit 1, r5-claims-absent + r6-probe-absent) at baseline ab592825, with all six predicate branches independently re-derived from committed bytes.
