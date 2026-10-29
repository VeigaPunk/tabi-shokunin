# MutC2Pin — mutation: remove the r1 measure blob pin comparison

Seat: `MutC2Pin` · role: mutation-tester · lane: tabi · round 43, attempt 1 · wave w1
Axis judged: **calibration** (C2)
Date: 2026-10-29

## Verdict in one line

**Load-bearing: YES.** Removing the r1 measure blob pin comparison makes the checker **green (exit 0, findingCount 0)** a self-consistent V0 fabrication that the frozen bytes **refuse (exit 1, findingCount 1, `r1-measure-blob-pin-mismatch`)**. The pin is the only wall.

## Scope and bounds observed

- Scratch root used: `/fast/scratch/hyaku/tabi-r43/MutC2Pin/` (created by me; deleted before yield).
- Lane bytes: **untouched**. `sha256` of `.ufo/waves/round-43/counters/check-routed-defects-round43.mjs` is still `2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743` (== the frozen digest in `claims.json.frozenDigests` and == `git show 7ca6f018…:` of the same path). `git status --porcelain -- .ufo/waves/round-43/{counters,fixtures,claims.json,controls}/` is empty.
- All mutated/fixture artifacts lived under my scratch. Fixture git repos were created with `git init -q` under scratch; `git rev-parse --show-toplevel` was asserted to equal the fixture dir before any commit; identity was a throwaway local to the fixture.
- No commits, pushes, fetches, jj operations, or writes outside `.ufo/waves/round-43/w1/MutC2Pin/` (this report + evidence) and my scratch.
- No agent dispatch (leaf seat).
- No tools installed; no pacman invoked. Tooling used: `node` (v24.21.0, fnm-managed), `git`, `python3`, `sha256sum`, `diff` — all preinstalled, no new channel used. (`/home/vgpnk/.omp/agent/RULES.md` read; it permits installs but none were needed.)

## The mutant

Frozen source (copy): `/fast/scratch/hyaku/tabi-r43/MutC2Pin/checker-frozen.mjs`
sha256 `2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743` (byte-identical to the lane file).

Mutant: `/fast/scratch/hyaku/tabi-r43/MutC2Pin/checker-mutant.mjs`
sha256 `75031d7ab688b66a412a3b9ecbd0fc15ec1166977b995374f751e83bf4df1dcf`

Exact diff (evidence `MutC2Pin/mutant.diff`):

```diff
--- checker-frozen.mjs
+++ checker-mutant.mjs
@@ -88,8 +88,7 @@
 let measureDoc = null;
 {
   if (requireBlob('r1-measure', MEASURE)) {
-    const id = gitBlobId(MEASURE);
-    if (id !== MEASURE_BLOB_PIN) add('r1-measure-blob-pin-mismatch', `${MEASURE} object id ${id} != pinned ${MEASURE_BLOB_PIN}`);
+    // MUTATION MutC2Pin: the r1 measure blob pin comparison has been REMOVED.
     const raw = gitShow(MEASURE);
     try { measureDoc = JSON.parse(raw.toString('utf8')); } catch { add('r1-measure-unparseable', `${MEASURE} does not parse as JSON`); }
   }
```

The mutation is confined to the pin comparison: the `PREDICATE` constant is byte-identical in both copies (1314 chars, still names the pinned blob id `8ff64d691f5c09569a50f2a5a038bb23774c3d35`), the `MEASURE_BLOB_PIN` constant is left in place, and `gitBlobId()` remains defined and unused-by-the-rule. `node --check` passes on both copies.

**Note on the mutant's own output:** the mutant still *prints* the predicate sentence that requires the pinned blob id, while no longer enforcing it — a sentence/implementation divergence that is itself a calibration defect shape.

## Detector

Expected detector: the committed V0-fabrication control (`.ufo/waves/round-43/controls/c2-v0-probe.json`) says the V0 self-consistent fabrication is *refused* by the frozen checker via the measure-blob pin, and the r42 checker bytes *green* it (`r42CheckerExit: 0`). The detector is therefore: **rebuild the V0 fixture with the frozen generator, run the checker copy over it, and compare exit/findings.**

## Commands and outputs (exact)

### 1. Rebuild V0 fixture from the frozen generator (in scratch)

```
node /fast/scratch/hyaku/tabi-r43/MutC2Pin/v0-fabrication.mjs \
  --out /fast/scratch/hyaku/tabi-r43/MutC2Pin/evidence/v0-probe-rebuilt.json \
  --work /fast/scratch/hyaku/tabi-r43/MutC2Pin/work \
  --slice /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-42/quarantine/slice-ids.txt
```

exit `0`. Rebuilt probe receipt (evidence `MutC2Pin/v0-probe-rebuilt.json`):

```json
{ "schema": "tabi-r43-c2-v0-probe",
  "fixtureRev": "ce08441c82dfc04ba76acfee00e653fb5827d7fb",
  "generatorDigest": "b87470625b11aa5b13d72cf1ac888ed004bff7b1d2ef7501f746d2142cb0b80c",
  "refused": true, "checkerExit": 1,
  "findingIds": ["r1-measure-blob-pin-mismatch","r5-claims-absent","r6-probe-absent"],
  "r42CheckerExit": 0, "r42FindingCount": 0, "r42FindingIds": [] }
```

`generatorDigest` matches the frozen `claims.json` digest for `v0-fabrication.mjs` (`b8747062…`), so the fixture generator bytes are the frozen ones. The rebuilt fixture reproduces the committed control's shape (same three finding ids, same r42-green signature).

### 2. Frozen checker vs mutant on the plain V0 fixture (`ce08441c…`)

```
node checker-frozen.mjs --rev ce08441c82dfc04ba76acfee00e653fb5827d7fb --repo …/work/v0-fixture --json   → exit 1
node checker-mutant.mjs --rev ce08441c82dfc04ba76acfee00e653fb5827d7fb --repo …/work/v0-fixture --json   → exit 1
```

| copy | findingCount | finding ids |
|---|---|---|
| frozen | 3 | `r1-measure-blob-pin-mismatch`, `r5-claims-absent`, `r6-probe-absent` |
| mutant | 2 | `r5-claims-absent`, `r6-probe-absent` |

Lost by the mutant: `r1-measure-blob-pin-mismatch`. Added by the mutant: none.
(The plain V0 fixture does not commit the round-43 freeze/controls, so `r5`/`r6` remain red for both copies — the pin finding is the delta.)

### 3. Decisive probe: V0 fabrication + the round-43 freeze and controls committed

To isolate the pin as the *only* remaining wall, I copied the V0 fixture repo in scratch and committed the frozen freeze + control bytes into it, so `r5` and `r6` go green and the pin stands alone:

```
D=/fast/scratch/hyaku/tabi-r43/MutC2Pin/work/v0-freeze-fixture
cp -a …/work/v0-fixture "$D"
git -C "$D" rev-parse --show-toplevel      # → $D  (asserted equal before commit)
git -C "$D" config user.email v0-freeze-fixture@fixture.local
git -C "$D" config user.name  V0FreezeFixture
git -C <lane> show 7ca6f018…:.ufo/waves/round-43/claims.json            > "$D/.ufo/waves/round-43/claims.json"
for f in c1-baseline-tree-count.txt c1-battery-r43.json c1-replay-r42-refused.json \
         c1-synthetic-refused.json c1-relabel-refused.json c2-baseline-red-r43.json \
         c2-v0-probe.json c2-tree-fixture.json; do
  git -C <lane> show 7ca6f018…:.ufo/waves/round-43/controls/$f > "$D/.ufo/waves/round-43/controls/$f"
done
git -C "$D" add -A && git -C "$D" commit -q -m "v0 fabrication + round-43 freeze and controls committed"
REV2=38ceabc0191c22e9b36f9822d9643c8e09d8205d
```

Every control blob copied in was verified byte-identical to the freeze commit, and its sha256 equals the value bound in the frozen `claims.json` `controlBindings` (e.g. `c2-v0-probe.json` → `c24d24f8e39a61c2bdb072ff9d1006296a236d6551b0a6fd572d3cb9772e9a6c`, `c2-tree-fixture.json` → `3443ad72fc05b0390d577be8ad9dc88b9ac903dbfb2b7e8d07124f7ec12ac3bf`).

Results at `REV2` (evidence `MutC2Pin/v0freeze-frozen.json`, `MutC2Pin/v0freeze-mutant.json`):

```
node checker-frozen.mjs --rev 38ceabc0191c22e9b36f9822d9643c8e09d8205d --repo …/v0-freeze-fixture --json  → exit 1
node checker-mutant.mjs --rev 38ceabc0191c22e9b36f9822d9643c8e09d8205d --repo …/v0-freeze-fixture --json  → exit 0
```

| copy | exit | findingCount | predicate | findings |
|---|---|---|---|---|
| frozen | 1 | 1 | false | `r1-measure-blob-pin-mismatch` — `.ufo/waves/round-41/measure/c1-measure.json object id 8dae9fba5e5b13975908aeb4971f871a6d350da4 != pinned 8ff64d691f5c09569a50f2a5a038bb23774c3d35` |
| mutant | 0 | 0 | **true** | none |

The fabrication's measure blob id is `8dae9fba5e5b13975908aeb4971f871a6d350da4` (verified by `git -C … rev-parse REV2:.ufo/waves/round-41/measure/c1-measure.json`), i.e. a **self-authored** measure record, not the pinned `8ff64d69…`.

**This is the exact acceptance criterion for "load-bearing": the mutated copy GREENS input the frozen bytes refuse.** The mutant's JSON still carries the predicate sentence that *requires* the pinned blob id, yet reports `"predicate": true` on a revision whose measure blob id is not the pinned one — a self-inconsistent instrument.

### 4. Regression / control checks

| probe | copy | exit | findingCount | finding ids |
|---|---|---|---|---|
| tree fixture `6019f190…` | frozen | 1 | 8 | `r1-measure-blob-pin-mismatch`, `r1a-not-a-blob`, `r1b-too-small`, `r2-sources-absent`, `r3-baseline-absent`, `r4-slice-absent`, `r5-claims-absent`, `r6-probe-absent` |
| tree fixture `6019f190…` | mutant | 1 | 7 | `r1a-not-a-blob`, `r1b-too-small`, `r2-sources-absent`, `r3-baseline-absent`, `r4-slice-absent`, `r5-claims-absent`, `r6-probe-absent` |
| honest lane tree at HEAD `ba433c94b14a0e0d5ecf2eba1be0a8ee3064491c` | frozen | 0 | 0 | none (predicate true) |
| honest lane tree at HEAD `ba433c94…` | mutant | 0 | 0 | none (predicate true) |

Reading: the tree fixture still reports `r1a-not-a-blob` under the mutant (the S151 type gate is independent of the pin and survives), so the mutation removed exactly one rule and nothing else. On the honest committed tree both copies agree (green), i.e. the mutant does not manufacture a false positive on the real lane — the divergence appears only on the fabricated input.

The tree fixture was rebuilt from the frozen generator for the same reason: `node <lane>/.ufo/waves/round-43/fixtures/tree-vs-blob.mjs --out …/evidence/tree-fixture-receipt.json --work …/work`, receipt `tree-fixture-receipt.json`, `fixtureRev 6019f1900503242e5eedd9eaaad357d1a5702780`.

## Restoration evidence

- The mutation existed **only** in the scratch copy `checker-mutant.mjs` (sha256 `75031d7a…`). The lane file was never opened for writing.
- Post-run verification of the lane file:
  `sha256sum /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-43/counters/check-routed-defects-round43.mjs` → `2f150b8422c1c70c816a49129eb0709ef759c82b3fa19733673f2314f8911743` — identical to the frozen digest in `claims.json.frozenDigests` and to `git show 7ca6f018…:` of the same path. **Byte-identical, unchanged.**
- `git -C <lane> status --porcelain -- .ufo/waves/round-43/counters/ .ufo/waves/round-43/fixtures/ .ufo/waves/round-43/claims.json .ufo/waves/round-43/controls/` → empty output.
- Scratch root `/fast/scratch/hyaku/tabi-r43/MutC2Pin/` removed (`shutil.rmtree`) after receipts were copied into this seat dir. (The git fixture repos under it were throwaway-local and are gone with it.)

## Limitations

- The mutation is a single-point probe on the C2 r1 pin comparison only, as tasked. It does not test the other C2 rules (r1a/r1b digest binding, r2, r3, r4, r5, r6) — those are unmutated here and their load-bearing status is unknown from this seat.
- The "V0+freeze" fixture (§3) is my construction, not a committed lane control. It is a *strengthening* of the committed V0 control, not a substitute: it exists only so that r5/r6 are green and the pin is the sole differentiator between the two checker copies. The committed control `.ufo/waves/round-43/controls/c2-v0-probe.json` was reproduced independently in §1 with the frozen generator (same finding-id shape, same r42-green signature).
- `findingCount` on the *plain* V0 fixture drops 3 → 2, not to 0, because that fixture does not commit the round-43 freeze. The "drops to 0" criterion is met on the V0+freeze input (§3), where the pin is the only wall.
- No byte-level fuzzing of the checker's other inputs; no performance or concurrency dimension; the checker is read-only and single-shot.
- I did not verify whether any *other* committed rule would also independently refuse the V0 fabrication once the pin is gone — by construction on V0+freeze there is none (findingCount 0).

## Evidence index (all under `.ufo/waves/round-43/w1/MutC2Pin/`)

| file | content |
|---|---|
| `mutant.diff` | exact frozen→mutant diff |
| `v0-probe-rebuilt.json` | §1 rebuilt V0 probe receipt (frozen generator) |
| `v0-generator-stdout.json` | §1 generator stdout |
| `v0-frozen.json` / `v0-mutant.json` | §2 checker JSON on the plain V0 fixture |
| `v0freeze-frozen.json` / `v0freeze-mutant.json` | §3 checker JSON on the V0+freeze fixture (the decisive pair) |
| `tree-fixture-receipt.json` | §4 tree fixture receipt |
| `tree-frozen.json` / `tree-mutant.json` | §4 checker JSON on the tree fixture |
| `frozen-at-lane-head.json` / `mutant-at-lane-head.json` | §4 checker JSON on the honest lane tree at HEAD |

## Interpretation for the C2 claim (calibration)

The C2 predicate sentence names the pinned measure blob id `8ff64d691f5c09569a50f2a5a038bb23774c3d35` as a *requirement* of rule (r1a). Removing the enforcement of that single comparison lets a fully self-consistent, browser-less fabrication satisfy every other rule of the checker and be reported as `"predicate": true` with exit 0. The pin clause is therefore **load-bearing** for C2's calibration claim: it is the clause that converts a self-authored measure record from "green" to "refused". A checker with that clause removed and its own sentence left intact is a sentence/implementation divergence — the exact defect class the round-43 checker was written to close.

This seat is a mutation probe, not an adjudication: it establishes that the clause is load-bearing, i.e. that the committed control `c2-v0-probe.json` genuinely exercises the pin and is not vacuous. No amendment to the frozen checker, claims or controls is proposed or applied.

VERDICT ok
