# ExecC2TreeFixture — round-43 C2 tree-fixture rebuild (calibration)

Seat: `ExecC2TreeFixture`. Wave: `round-43`, lane `tabi`. Milestone: rebuild the tree
fixture and structurally compare it with the committed control.
Claim under test: **C2 (calibration, instrument-repair)** — the round-42 routed-defect
checker hardened with a `git cat-file -t` blob-type gate (rule r1a / S151), a pinned
measure blob id, V0 refusal and freeze-binds-controls.

Verdict: **ok** — the fixture rebuilds cleanly, the round-43 checker names the type
violation `r1a-not-a-blob`, the round-42 bytes name no type violation, and the rebuilt
receipt is byte-identical to the committed control once the fixture's commit timestamp is
pinned. No hole found in the model I was asked to exercise.

---

## 1. Scope and bounds observed

- Wrote only under `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/w1/ExecC2TreeFixture/`
  (this report plus evidence files) and this report's seat-scoped sibling
  `.ufo/waves/round-43/w1/ExecC2TreeFixture.md`.
- The production tree, the fleet repo, sibling `*-shokunin` repos and `/home/vgpnk/Projects/shokuknow`
  were **read-only**; nothing under `shokuknow` was written (the round-39 incident is not repeated).
- **No commits, no pushes, no git/jj mutation** in any repo. The only git writes were inside a
  throwaway fixture repo created under my scratch by the frozen fixture script itself.
- No agents spawned. No network. Loopback/local files only.
- Counter/claims/checker bytes were **not** amended; no amendment is proposed. The one
  observation I found (timestamp-dependence of `fixtureRev`) is routed below as a note, not a
  byte amendment, because the committed control binding is by sha256 + verbatim quote, not by
  re-running the fixture.
- Scratch root `/fast/scratch/hyaku/tabi-r43/ExecC2TreeFixture/` was created, used, and deleted
  before yield.

## 2. Frozen-byte check (inputs were the frozen bytes)

Commit under test: `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc` (baseline
`ab592825cd195599822ca227f7768914df208201`). Working-tree HEAD at run time was
`ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c`.

```
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin && sha256sum \
    .ufo/waves/round-43/fixtures/tree-vs-blob.mjs \
    .ufo/waves/round-43/counters/check-routed-defects-round43.mjs \
    .ufo/waves/round-43/controls/c2-tree-fixture.json
7407f6cd498362658fb0c78b61698489c373444ff3ce6982824ded877259ab6d  .ufo/waves/round-43/fixtures/tree-vs-blob.mjs
2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743  .ufo/waves/round-43/counters/check-routed-defects-round43.mjs
3443ad72fc05b0390d577be8ad9dc88b9ac903dbfb2b7e8d07124f7ec12ac3bf  .ufo/waves/round-43/controls/c2-tree-fixture.json

$ git show 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc:.ufo/waves/round-43/fixtures/tree-vs-blob.mjs | sha256sum
7407f6cd498362658fb0c78b61698489c373444ff3ce6982824ded877259ab6d  -
$ git show 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc:.ufo/waves/round-43/counters/check-routed-defects-round43.mjs | sha256sum
2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743  -
$ git show 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc:.ufo/waves/round-43/controls/c2-tree-fixture.json | sha256sum
3443ad72fc05b0390d577be8ad9dc88b9ac903dbfb2b7e8d07124f7ec12ac3bf  -
```

Both the fixture script and the round-43 checker digest-match the frozen digests recorded in
`.ufo/waves/round-43/claims.json` (`frozenDigests.tree-vs-blob.mjs` = `7407f6cd…`,
`check-routed-defects-round43.mjs` = `2f150b84…`), and both match the bytes at the freeze
commit `7ca6f01…`. The control file's sha256 `3443ad72…` is the value bound in
`claims.json controlBindings[]` for `.ufo/waves/round-43/controls/c2-tree-fixture.json`.

## 3. The rebuild (as specified)

```
$ S=/fast/scratch/hyaku/tabi-r43/ExecC2TreeFixture && mkdir -p "$S" && cd "$S"
$ node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/fixtures/tree-vs-blob.mjs \
    --out "$S/tree.json" --work "$S"
{"schema":"tabi-r43-c2-tree-fixture","fixtureRev":"7b3a79cfc8d43d42162e05dd4d0651192364e204","typeViolationNamed":true,"v2":{"exit":1,"findingIds":["r1-measure-blob-pin-mismatch","r1a-not-a-blob","r1b-too-small","r2-sources-absent","r3-baseline-absent","r4-slice-absent","r5-claims-absent","r6-probe-absent"]},"r42":{"exit":1,"findingIds":["r1a-unparseable","r1b-too-small","r2-sources-absent","r3-baseline-file-absent","r4-slice-absent","r4-quarantine-absent"]},"note":"receipt path is a tree object; v2 names r1a-not-a-blob (cat-file -t, S151); r42 bytes record what the missing type check allowed"}
EXIT=0
```

Observed: **exit 0**, stderr empty, `typeViolationNamed: true`, v2 exit 1 with
`r1a-not-a-blob` present, r42 exit 1 with **no** type-violation id.

Expected per seat spec — all four satisfied:
1. exit 0 ✔
2. `typeViolationNamed` true ✔
3. v2 findings include `r1a-not-a-blob` ✔
4. r42 findings name no type violation ✔ (r42 ids are `r1a-unparseable`, `r1b-too-small`,
   `r2-sources-absent`, `r3-baseline-file-absent`, `r4-slice-absent`, `r4-quarantine-absent`;
   none is a type violation — grep for `not-a-blob` / `object type` in the r42 JSON returns nothing).

Evidence: `tree-receipt.json`, `fixture-stdout.txt`.

## 4. The fixture repo is a genuine tree-at-a-checked-path

```
$ git -C "$S/tree-blob-fixture" rev-parse --show-toplevel
/fast/scratch/hyaku/tabi-r43/ExecC2TreeFixture/tree-blob-fixture      # == the fixture dir (toplevel guard held)
$ git -C "$S/tree-blob-fixture" rev-parse HEAD
7b3a79cfc8d43d42162e05dd4d0651192364e204
$ git -C "$S/tree-blob-fixture" cat-file -t "HEAD:corpus/evidence/round41/playwright-egress/receipt.json"
tree
$ git -C "$S/tree-blob-fixture" cat-file -s "HEAD:corpus/evidence/round41/playwright-egress/receipt.json"
2100                      # > 1000 → passes the size floor, so the type gate is what fires
$ git -C "$S/tree-blob-fixture" cat-file -t "HEAD:corpus/evidence/round41/playwright-egress/receipt.witness.json"
blob
$ git -C "$S/tree-blob-fixture" config user.name / user.email
TreeVsBlobFixture / tree-vs-blob@fixture.local   # local throwaway identity, set inside the fixture repo only
```

The fixture's own toplevel assertion (`rev-parse --show-toplevel` must equal the fixture dir,
else it dies before committing) was asserted inside the script and independently re-verified
above. The throwaway identity was scoped to the scratch fixture repo via `git -C "$D" config`;
nothing was configured or committed in any other repository.

## 5. Direct checker invocations (not just the fixture's summary)

Both checkers were run directly against the fixture revision with the counter's own CLI.

Round-43 checker (`--rev <REV> --repo <fixture dir> --json`), exit 1:

```
$ node .../round-43/counters/check-routed-defects-round43.mjs --rev 7b3a79cf… --repo "$S/tree-blob-fixture" --json
{ "schema": "tabi-r43-routed-defects", "rev": "7b3a79cf…", "predicate": false, "findingCount": 8,
  "findings": [
   { "id": "r1-measure-blob-pin-mismatch", "detail": ".ufo/waves/round-41/measure/c1-measure.json object id 0f2fb23c… != pinned 8ff64d691f5c09569a50f2a5a038bb23774c3d35" },
   { "id": "r1a-not-a-blob", "detail": "corpus/evidence/round41/playwright-egress/receipt.json resolves to object type 'tree', frozen sentence requires blob" },
   { "id": "r1b-too-small", "detail": "…/receipt.witness.json committed blob is 982 bytes (<1000)" },
   { "id": "r2-sources-absent", … }, { "id": "r3-baseline-absent", … },
   { "id": "r4-slice-absent", … }, { "id": "r5-claims-absent", … }, { "id": "r6-probe-absent", … } ] }
```

Round-42 checker (same rev/repo), exit 1:

```
$ node .../round-42/counters/check-routed-defects-round42.mjs --rev 7b3a79cf… --repo "$S/tree-blob-fixture" --json
{ "schema": "tabi-r42-routed-defects", "rev": "7b3a79cf…", "predicate": false, "findingCount": 6,
  "findings": [
   { "id": "r1a-unparseable", "detail": "corpus/evidence/round41/playwright-egress/receipt.json does not parse as JSON" },
   { "id": "r1b-too-small", … }, { "id": "r2-sources-absent", … },
   { "id": "r3-baseline-file-absent", … }, { "id": "r4-slice-absent", … }, { "id": "r4-quarantine-absent", … } ] }
```

Evidence: `v2-checker-raw.json`, `r42-checker-raw.json`.

**Why the r42 miss happens (mechanism, observed in the frozen bytes).** The r42 checker has no
`cat-file -t` call at all; it only has `gitBlobSize` (`cat-file -s`), which returns 2100 for a
*tree* object just as it would for a large blob. The tree therefore clears the 1000-byte floor
and is handed to `JSON.parse`, where the raw tree listing (`"corpus/evidence/…"\n\npart-00\n…`)
fails to parse — so r42 misreports the defect as `r1a-unparseable` (a content defect) rather
than naming the actual type violation. The round-43 bytes add `gitObjectType` + `requireBlob`
(S151) and name `r1a-not-a-blob`. This is the exact defect class C2 claims to close.

## 6. Structural comparison with the committed control

```
$ python3 - "$S/tree.json" .../controls/c2-tree-fixture.json
structural_equal_minus_fixtureRev: True
v2 has r1a-not-a-blob: True
r42 names type violation: False
typeViolationNamed: True
```

All fields are identical to the committed control **except** `fixtureRev`:
rebuilt `7b3a79cfc8d43d42162e05dd4d0651192364e204` vs committed
`d28c27897e203857195a88e59683b6c129d0c804`. The raw diff of the two files is exactly that
one line:

```
--- controls/c2-tree-fixture.json
+++ tree.json
@@ -1,6 +1,6 @@
 {
  "schema": "tabi-r43-c2-tree-fixture",
- "fixtureRev": "d28c27897e203857195a88e59683b6c129d0c804",
+ "fixtureRev": "7b3a79cfc8d43d42162e05dd4d0651192364e204",
  "typeViolationNamed": true,
```

### 6a. The `fixtureRev` difference is timestamp, not behaviour — and is reproducible

`fixtureRev` is the SHA of a commit the fixture creates, so it is a function of the commit
timestamp. Pinning `GIT_AUTHOR_DATE`/`GIT_COMMITTER_DATE` to the control's creation time
reproduces the committed bytes exactly:

```
$ GIT_AUTHOR_DATE="2026-10-29T17:36:28-0300" GIT_COMMITTER_DATE="2026-10-29T17:36:28-0300" \
    node .../fixtures/tree-vs-blob.mjs --out "$S/repro/tree.json" --work "$S/repro"
EXIT=0
$ sha256sum "$S/repro/tree.json" .../controls/c2-tree-fixture.json
3443ad72fc05b0390d577be8ad9dc88b9ac903dbfb2b7e8d07124f7ec12ac3bf  …/repro/tree.json
3443ad72fc05b0390d577be8ad9dc88b9ac903dbfb2b7e8d07124f7ec12ac3bf  …/controls/c2-tree-fixture.json
$ cmp …/controls/c2-tree-fixture.json "$S/repro/tree.json"     # exit 0 — byte-for-byte identical
```

A one-second sweep confirms the mapping is exact and 1:1 (each timestamp yields a distinct rev):

```
2026-10-29T17:36:26-0300 -> 8b1f0076ee22cecf44c487191a0c3ae8d7d3dd05
2026-10-29T17:36:27-0300 -> bd875a7a82dd4072c38056da461c12d5c4f37540
2026-10-29T17:36:28-0300 -> d28c27897e203857195a88e59683b6c129d0c804   *** MATCHES committed control ***
2026-10-29T17:36:29-0300 -> 6af9f928dae33ab106cd8b1f2e2c11073eb7c8c5
2026-10-29T17:36:30-0300 -> faad76600d5844f5aa2915d24fe7dd29b30f75bb
```

Two further unpinned reruns produced different revs (`9ca194a5…`, `7b3a79cf…`) but
**structurally identical** receipts (`run1 == run2 (minus fixtureRev): True`), and two pinned
reruns in different directories produced the **same** rev `e75c138079bed5024367e78b8dec4ef9088c9e98`.
The receipt content is deterministic; only the rev string varies with wall-clock commit time.

Evidence: `tree-receipt-repro-pinned-date.json`, `fixture-stdout-repro-pinned-date.txt`.

### 6b. The control's r5 binding holds on the rebuilt bytes

The freeze binds this control by sha256 plus a verbatim quote line
(`claims.json controlBindings[]` → `path: .ufo/waves/round-43/controls/c2-tree-fixture.json`,
`sha256: 3443ad72…`, `quote: " \"typeViolationNamed\": true,"`).

```
$ grep -n '"typeViolationNamed": true,' .../controls/c2-tree-fixture.json
4: "typeViolationNamed": true,
```

The quote line is present verbatim in the committed control bytes and the sha256 matches, so
the round-43 checker's r5 (freeze-binds-controls) would accept this control at the measured
revision.

## 7. Mutation check (scratch copy only, never in place)

To confirm the `r1a-not-a-blob` finding is produced by the type gate and not by accident, the
frozen round-43 checker was **copied to scratch** and its type gate deleted:

```python
old = "  if (t !== 'blob') { add(`${id}-not-a-blob`, `${p} resolves to object type '${t}', frozen sentence requires blob`); return false; }"
new = "  /* MUTANT: type gate disabled */"
```

Result on the same fixture revision: `r1a-not-a-blob` **disappears** and is replaced by
`r1a-unparseable` — the mutant's finding list becomes byte-identical in shape to the r42
checker's, i.e. disabling the gate reproduces the round-42 behaviour exactly. The gate is
load-bearing for the C2 claim. The mutant was run only from scratch; the frozen checker was
never modified.

Evidence: `mutant-type-gate-disabled-raw.json`.

## 8. Findings

**No hole found in the model this seat exercises.** The rebuilt fixture exercises rule r1a
exactly as claimed: v2 names the type violation, r42 names none, and the mutant confirms the
gate is what makes the difference.

**Note (non-blocking, routed to the closure rather than amended).** `fixtureRev` in the
control is a function of the fixture's commit timestamp, so the committed control's rev is
reproducible only with `GIT_AUTHOR_DATE`/`GIT_COMMITTER_DATE` pinned to
`2026-10-29T17:36:28-0300`. This is not a claim defect: the control is bound by sha256 +
verbatim quote over committed bytes (r5), and the structural content of the receipt is
timestamp-independent (verified: identical across four runs, two pinned and two unpinned).
It is recorded because a future seat doing a naive whole-file `cmp` against the control
would see a false mismatch. No byte change is proposed; the frozen files are untouched.

## 9. Limitations

- I verified the tree-fixture limb only. I did not re-run the baseline-red control, the V0
  probe control, the C1 battery, or the r42 checker against the *real* repository at the
  round-43 measured revision — those are other seats' limbs, and the round-43 checker is
  C2's scoring instrument rather than my object of study.
- The mutation I ran is one mutant (type gate removed). I did not enumerate the full mutant
  set of the checker.
- `predicate: false` on the fixture revision is expected and correct: the fixture repo is a
  synthetic tree-only repo that lacks SOURCES.md, the baseline control, the slice, the
  claims file and the V0 probe, so r2–r6 report "absent". Only r1a's behaviour is in scope
  here. This is why the fixture's exit code reflects `r1a-not-a-blob` presence, not a green run.
- The fixture's `r1-measure-blob-pin-mismatch` finding is likewise a fixture-repo artifact
  (the fixture's own measure blob is not the pinned `8ff64d69…`); it is expected.

## 10. Tools

No tool was installed, upgraded or removed. Tooling directive read at
`/home/vgpnk/.omp/agent/RULES.md`; no `pacman` invocation was made (PACMAN GUARD observed —
no package transaction at all), and no install was planned or needed.

| tool | version | channel |
|---|---|---|
| node | v24.21.0 | pre-installed (fnm-managed) |
| git | 2.56.0 | pre-installed (`/usr/bin/git`) |
| python3 | 3.14.8 | pre-installed (`/usr/bin/python3`) |

## 11. Evidence index (all under `.ufo/waves/round-43/w1/ExecC2TreeFixture/`)

| file | what it holds |
|---|---|
| `report.md` | this report |
| `tree-receipt.json` | the rebuilt fixture receipt (exit 0, `typeViolationNamed: true`) |
| `fixture-stdout.txt` | stdout of the specified rebuild command |
| `tree-receipt-repro-pinned-date.json` | receipt rebuilt with the pinned timestamp; byte-identical to the committed control (sha256 `3443ad72…`) |
| `fixture-stdout-repro-pinned-date.txt` | stdout of that pinned rebuild |
| `v2-checker-raw.json` | round-43 checker raw JSON on the fixture rev (names `r1a-not-a-blob`) |
| `r42-checker-raw.json` | round-42 checker raw JSON on the fixture rev (names no type violation) |
| `mutant-type-gate-disabled-raw.json` | scratch mutant with the type gate removed; `r1a-not-a-blob` gone |

The scratch root `/fast/scratch/hyaku/tabi-r43/ExecC2TreeFixture/` (fixture repos, mutant
copy, raw outputs) was deleted after these receipts were copied in.

VERDICT ok — tree fixture rebuilds at exit 0, v2 names `r1a-not-a-blob`, r42 names no type violation, and the rebuilt receipt is byte-identical to the committed control once the fixture commit timestamp is pinned.
