# AttackC1Legacy — round-16 wave 2 (FALSIFY): the round-15 legacy finding set

Seat: `TabiR16.AttackC1Legacy` (reviewer, leaf; no delegation). Author-side report; this is not a non-author certification.
Snapshot attacked: `b444ca8e024f386124418169e8e400221524bba3` (commit A `8f7feb3` + C2 counter repair).
Lane writes: only this file. All mutation probes were made in `/tmp/a1legacy-probe.Wth52B` (a `mktemp -d` copy of the gate) and `/tmp/a1legacy.*.out`; nothing under the lane was created, modified or deleted.
Tools installed: none.
Node used: `v24.21.0`, same as the receipt.

## Verdict: **BREAKS** — completeness only; every emitted finding is true

Independently recomputed from git object bytes: the four counter blob digests, the ancestry of `9fd8bca` vs `b7cf044`, and the legacy finding set. The five emitted findings are each true and the gate run is byte-identically reproducible (exit 1, 1017-byte stdout, sha256 `87745dd9cfc01905dfb978a3690be9916d0c6cc6f5a9c050d12de1d20f48e04b`).

The break is that the set is **not complete relative to the gate's own closed vocabulary and `--check` semantics**:

1. `counted_input_changed` (`paths=.ufo/waves/round-15/measure.mjs`) is true for **both** claims — the counter blob demonstrably changed between the measured revision and `--at` — and `--check` emits it on the same facts, but `--legacy` never emits it. The selftest pins that omission as expected, so it is a contract gap, not an accident.
2. `measured_revision_not_ancestor` is **never evaluated** in `--legacy` at all (proved with `--at 27dfd98`); at the receipt's `--at 36240c7` the predicate would hold, so this one is latent rather than a missing line for this run.
3. For C2, `counter_changed_since_measurement` is keyed to `counterCodeRevision` (`9fd8bca`, a post-measurement commit), so the true statement "counter bytes differ between `measuredRevision` `b7cf044` and `--at` `36240c7`" is **not** reported for C2; the predicate is evadable by recording a post-measurement counter revision whose blob equals the target.

Secondary defect: the receipt's own stdout truncates (`DETAIL_MAX = 240`) exactly the digests and the `counterCodeRevision_ancestor_of_measured=no` token that substantiate the findings, so the receipt cannot be audited without re-running git + the gate.

## 1. Counter blob identity at the four named revisions

Command (run at the lane root):

```
for c in 27dfd98 b7cf044 9fd8bca 36240c7; do
  blob=$(git rev-parse $c:.ufo/waves/round-15/measure.mjs)
  sha=$(git cat-file -p $blob | sha256sum | cut -d' ' -f1)
  echo "$c blob=$blob sha256=$sha size=$(git cat-file -s $blob)"
done
```

Observed:

```
27dfd98 blob=f85f39c7a0f3c4c2e7c35d78ebaffbdf9f572a63 sha256=3ee59de095750e08fc719ed19eb5baea02caf443df05479d24897783240fe384 size=65187
b7cf044 blob=f85f39c7a0f3c4c2e7c35d78ebaffbdf9f572a63 sha256=3ee59de095750e08fc719ed19eb5baea02caf443df05479d24897783240fe384 size=65187
9fd8bca blob=912f5176e994845b81c6b453b3fa4b7609641a70 sha256=dd9c8675ab9bbc91c20f501a90f898197d046d2586f12d2389a564385281251d size=66068
36240c7 blob=912f5176e994845b81c6b453b3fa4b7609641a70 sha256=dd9c8675ab9bbc91c20f501a90f898197d046d2586f12d2389a564385281251d size=66068
```

Cross-check (independent Python `git cat-file blob` + `hashlib.sha256` pass) produced the same four digests. Identity checks: `git replace -l` → empty; `.git/info/grafts` → absent; `git config --list --show-origin | grep -Ei 'replace|graft|fsmonitor'` → none. The digests are therefore the committed blob bytes, not replace/graft substitutions.

Material result: `27dfd98` and `b7cf044` carry the **same** counter bytes; the repair appears at `9fd8bca` and persists at `36240c7`. This matches `corpus/evidence/round-16/binding/r15-counter-identity.json` exactly, and the gate's own header claim (`3ee59de0` at 27dfd98 vs `dd9c8675` at HEAD).

## 2. Ancestry of `9fd8bca` vs `b7cf044`

```
git merge-base --is-ancestor 9fd8bca b7cf044   # exit 1  -> NOT ancestor
git merge-base --is-ancestor b7cf044 9fd8bca   # exit 0  -> b7cf044 IS an ancestor
git log --oneline --reverse 27dfd98^..36240c7
```

Observed chain:

```
27dfd98 round-15: repair falsified diagnostics and evidence oracles
b7cf044 round-15: retain exercised evidence and source-grounded lessons
9fd8bca round-15: parse actual ARIA evidence without changing outcomes
36240c7 round-15: record verified diagnostic and metadata improvements
```

and `36240c7`'s parent is `9fd8bca`. So the counter repair (`9fd8bca`) is a **descendant** of the measured revision (`b7cf044`), not an ancestor of it; the measured revision is an ancestor-or-equal of the delivered revision (`git merge-base --is-ancestor b7cf044 36240c7` → exit 0). The C2 finding's hidden clause `counterCodeRevision_ancestor_of_measured=no` is therefore true.

## 3. Gate run vs the receipt

Command (exactly the receipt's argv, at the lane root):

```
node scripts/check-measurement-binding.mjs --legacy corpus/evidence/round-15/measurements.json --at 36240c70ee114347a79abb91cacab6c63044ce36
```

Observed: exit `1`, empty stderr, stdout 1017 bytes, sha256 `87745dd9cfc01905dfb978a3690be9916d0c6cc6f5a9c050d12de1d20f48e04b`.

Byte comparison against `corpus/evidence/round-16/binding/legacy-r15.json`:

```
stored_len 1017  mine_len 1017
equal_bytes True
stored_sha 87745dd9cfc01905dfb978a3690be9916d0c6cc6f5a9c050d12de1d20f48e04b
mine_sha   87745dd9cfc01905dfb978a3690be9916d0c6cc6f5a9c050d12de1d20f48e04b
stored_exit 1
argv_match True
gate_sha_match True
```

Receipt digests verified against real bytes:

```
worktree: 5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb  scripts/check-measurement-binding.mjs
worktree: 8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae  scripts/selftest-measurement-binding.mjs
8f7feb3 and b444ca8: same two digests (gate blob 1cbce204e45d952be9f3e98d5a262fc10f2bb422)
```

`corpus/evidence/round-15/measurements.json` is unchanged between `36240c7` and the worktree/HEAD (sha256 `1689f75f69f29fba5c4c8f088720b10ff8fa23fc5f496aecc86fc7649588b8e5`), so the run is reproducible today; the receipt itself records no manifest digest (residual risk below).

## 4. Independent derivation of the finding set (no gate code reused)

Predicates taken from the gate's header (`scripts/check-measurement-binding.mjs:44-58`) and `evaluateLegacy` (`:591-634`), recomputed from git bytes:

| claim | counterCodeRevision → blob | measuredRevision → blob | recorded digest | blob at `36240c7` |
|---|---|---|---|---|
| C1 | 27dfd98 → `3ee59de0…` | b7cf044 → `3ee59de0…` | absent | `dd9c8675…` |
| C2 | 9fd8bca → `dd9c8675…` | b7cf044 → `3ee59de0…` | `dd9c8675…` | `dd9c8675…` |

Derived per the documented legacy predicates:

- C1: no digest → `counter_digest_unrecorded`; no `countedInputs` → `counted_inputs_undeclared`; `blob(27dfd98) ≠ blob(36240c7)` → `counter_changed_since_measurement`.
- C2: `counterSha256 ≠ blob(b7cf044)` → `counter_digest_mismatch`; no `countedInputs` → `counted_inputs_undeclared`; `blob(9fd8bca) == blob(36240c7)` → no drift finding.

Predicted set:

```
[('C1','counted_inputs_undeclared'), ('C1','counter_changed_since_measurement'), ('C1','counter_digest_unrecorded'),
 ('C2','counted_inputs_undeclared'), ('C2','counter_digest_mismatch')]
```

This is exactly the five emitted lines, in sorted order. **No emitted finding is false.**

Substantive check of the C2 premise: `measurements.json` `C2.after.stdout` is byte-identical to `corpus/evidence/round-15/count-after-c2-repaired.json` (`True`), which records exit 0 / `c2_enforced_contract:1`; the earlier `count-after-c2.json` records exit 1 / `c2_enforced_contract:0`. So the recorded C2 "after" count was produced by counter bytes that do not exist at `b7cf044`; `counter_digest_mismatch` is identity-correct, not bookkeeping.

## 5. What is missing — the break

### 5a. `counted_input_changed` for both claims

The counter path is part of the full gate's drift pathspec (`diffInputs = [...countedInputs, counter.path]`, `:496`). The drift is real:

```
git diff --name-only b7cf044 36240c7 -- .ufo/waves/round-15/measure.mjs
.ufo/waves/round-15/measure.mjs
```

Proof on identical facts: a v1 manifest carrying the same revisions, digests, argv and the real declared counted inputs (`corpus/evidence/round-16/binding/r15-counter-identity.json` enumerates 2 for C1 and 11 for C2) was run in the `/tmp` copy:

```
node gate.mjs --check v1-equivalent-declared.json --at 36240c7… --repo <lane>
```

```
MEASUREMENT_BINDING verdict=failed claims=2 bound=0
finding claim=C1 reason=counted_input_changed
finding claim=C1 reason=counter_changed_since_measurement
finding claim=C2 reason=counted_input_changed
finding claim=C2 reason=counter_digest_mismatch
```

`--legacy` emits no `counted_input_changed` for either claim on the same history. `scripts/selftest-measurement-binding.mjs:317-341` pins the reduced legacy sets (`legacy_counter_changed` expects no `counted_input_changed`), so the omission is contractual — but the consequence is that the legacy receipt cannot report that the counter path's content changed between the measured and delivered revisions, which is precisely round-15 defect 2.

### 5b. `measured_revision_not_ancestor` never evaluated in `--legacy`

```
node scripts/check-measurement-binding.mjs --legacy corpus/evidence/round-15/measurements.json --at 27dfd98bd6bbd85fe77fb028d531691ce066031a
```

Observed findings: C1 `{counted_inputs_undeclared, counter_digest_unrecorded}`, C2 `{counted_inputs_undeclared, counter_changed_since_measurement, counter_digest_mismatch}` — **no** `measured_revision_not_ancestor`, although `b7cf044` is a descendant of `27dfd98`. The same facts under `--check --at 27dfd98` emit `measured_revision_not_ancestor` for **both** claims. At the receipt's `--at 36240c7` the predicate holds, so this produces no missing line for this run; it is a latent hole in the adapter.

### 5c. C2 drift is masked by keying on `counterCodeRevision`

`evaluateLegacy` computes drift as `blob(counterCodeRevision) ≠ blob(at)` (`:621-629`). For C2 `counterCodeRevision = 9fd8bca` is the post-measurement repair whose blob equals the target, so no drift finding fires, even though `blob(measuredRevision b7cf044) = 3ee59de0… ≠ blob(36240c7) = dd9c8675…`. A manifest can therefore evade `counter_changed_since_measurement` by recording a post-measurement counter revision equal to the target — exactly what the real C2 shape does. `--check` still reports the drift as `counted_input_changed`; `--legacy` reports nothing for C2.

## 6. Receipt observability defect (secondary)

`DETAIL_MAX = 240` (`scripts/check-measurement-binding.mjs:107`) truncates both long details in text and `--json` (cleanDetail is applied in the legacy `add`, `:596`). Observed receipt lines end:

```
… measuredRevision=b7cf0446a31014a81b4882857c9...    (C1 counter_changed_since_measurement)
… measuredRevision=b7cf0446a31014...                  (C2 counter_digest_mismatch)
```

Hidden tails (computed by length, then confirmed with a `DETAIL_MAX = 4000` copy in `/tmp/a1legacy-probe.Wth52B`):

```
C1 hidden:  sha256_at_measuredRevision=3ee59de0… at=36240c7… sha256_at_at=dd9c8675…
C2 hidden:  counterCodeRevision=9fd8bca99d60cc1612faeeac633e1436d231bde3 counterCodeRevision_ancestor_of_measured=no
```

The raised-cap copy printed both lines in full, e.g.:

```
finding claim=C2 reason=counter_digest_mismatch detail=counter=.ufo/waves/round-15/measure.mjs counterSha256=dd9c8675ab9bbc91c20f501a90f898197d046d2586f12d2389a564385281251d blob_at_measuredRevision=3ee59de095750e08fc719ed19eb5baea02caf443df05479d24897783240fe384 measuredRevision=b7cf0446a31014a81b4882857c90c565ebc14210 counterCodeRevision=9fd8bca99d60cc1612faeeac633e1436d231bde3 counterCodeRevision_ancestor_of_measured=no
```

Consequence: the receipt shows the finding *labels* but not the digest at `--at` for C1, and not the `counterCodeRevision` / `ancestor_of_measured=no` tokens for C2. It reproduces byte-for-byte but is not self-substantiating; auditing it requires re-running git and the gate. This does not make any finding false.

## 7. Counter coupling

`.ufo/waves/round-16/measure.mjs:71-74` hardcodes:

```js
const LEGACY_EXPECTED = {
  C1: ['counted_inputs_undeclared', 'counter_changed_since_measurement', 'counter_digest_unrecorded'],
  C2: ['counted_inputs_undeclared', 'counter_digest_mismatch'],
};
```

and requires exact set equality (`sameSet`, `:169-172`). Re-running the claim counter independently:

```
node .ufo/waves/round-16/measure.mjs b444ca8e024f386124418169e8e400221524bba3 --claim C1
# {"revision":"b444ca8…","c1_binding_contracts":1,...,"selftest":{"exit":0,"cases":43,
#  "summary":"MEASUREMENT_BINDING_SELFTEST verdict=clean cases=43 reasons=13","bad":0,"clean":21,
#  "missingVocab":[]},
#  "legacy":{"exit":1,"findings":{"C1":["counted_inputs_undeclared","counter_changed_since_measurement","counter_digest_unrecorded"],
#            "C2":["counted_inputs_undeclared","counter_digest_mismatch"]},"at":"36240c70…"},
#  "failures":[],"counterBlobAtRevisionSha256":"bda4e18e…","inputsRead":[
#   "corpus/evidence/round-15/measurements.json","scripts/check-measurement-binding.mjs",
#   "scripts/selftest-measurement-binding.mjs"]}   exit=0

node .ufo/waves/round-16/measure.mjs e38d2599a922cb729186353830fff8e159b4fef0 --claim C1
# {"c1_binding_contracts":0,"failures":["gate or selftest absent at revision"]}   exit=0
```

So the counter agrees with the receipt and the 0→1 shape holds. But the "honest finding set" is asserted by the counter, not derived; repairing `--legacy` to emit `counted_input_changed` would flip C1 to 0 unless `LEGACY_EXPECTED` is updated in the same change. That is a maintainability hazard, not a false claim.

## Residual risk and verification gaps

- **Not executed:** the historical round-15 counter (not required; `--legacy` refuses `--reproduce` and makes no reproduction claim). C2 count provenance is established by exact stdout equality with `count-after-c2-repaired.json`, not by execution.
- **`counterSha256` semantics ambiguity:** if the field is read as "digest of the counter at `counterCodeRevision`", the manifest is internally consistent (`dd9c8675` = blob at `9fd8bca`) and the true defect becomes "`measuredRevision` mis-recorded for C2". Under the gate's documented predicate ("recorded digest must equal the blob at `measuredRevision`") the mismatch finding is true. Either reading leaves the count unbound to the measured tree; I record the ambiguity rather than assert intent.
- **Receipt binding:** `legacy-r15.json` records no `measurements.json` digest. It is reproducible today (file unchanged since `36240c7`), but a later edit to `measurements.json` would not be visible from the receipt alone. The round-16 counter does read the manifest from the revision bytes (`inputsRead` above), so the *claim* is bound even though the receipt is not.
- **Scope:** only the `--legacy` finding set, its receipt, the four-revision blob identity and the ancestry were attacked. Round-16 C2/WebMCP evidence, the gate's non-legacy paths, and other wave-2 items were not reviewed.
- **Unproven:** whether the legacy contract intends `counted_input_changed` to be out of scope by design. The selftest pins it out, but nothing in the gate header says `--legacy` applies a subset of the documented vocabulary; the `--json` output advertises the full nine-reason vocabulary while applying four.

## Reproduction (all commands, absolute lane root)

```
cd /home/vgpnk/Projects/shokunin/tabi-shokunin

# 1. digests
for c in 27dfd98 b7cf044 9fd8bca 36240c7; do
  blob=$(git rev-parse $c:.ufo/waves/round-15/measure.mjs)
  echo "$c $(git cat-file -p $blob | sha256sum)"
done

# 2. ancestry
git merge-base --is-ancestor 9fd8bca b7cf044; echo $?   # 1
git merge-base --is-ancestor b7cf044 9fd8bca; echo $?   # 0

# 3. the receipt run
node scripts/check-measurement-binding.mjs --legacy corpus/evidence/round-15/measurements.json \
  --at 36240c70ee114347a79abb91cacab6c63044ce36   # exit 1; stdout sha256 87745dd9…

# 4. missing-finding probes (gate copy in /tmp; lane untouched)
D=$(mktemp -d /tmp/a1legacy-probe.XXXXXX); cp scripts/check-measurement-binding.mjs "$D/gate.mjs"
cd "$D" && node gate.mjs --check v1-equivalent-declared.json --at 36240c70ee114347a79abb91cacab6c63044ce36 \
  --repo /home/vgpnk/Projects/shokunin/tabi-shokunin     # adds counted_input_changed for C1 and C2
node gate.mjs --check v1-equiv.json --at 27dfd98bd6bbd85fe77fb028d531691ce066031a \
  --repo /home/vgpnk/Projects/shokunin/tabi-shokunin     # adds measured_revision_not_ancestor for both

# 5. full-detail view (DETAIL_MAX 240 -> 4000)
sed -i 's/^const DETAIL_MAX = 240;$/const DETAIL_MAX = 4000;/' "$D/gate.mjs"
node "$D/gate.mjs" --legacy /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-15/measurements.json \
  --at 36240c70ee114347a79abb91cacab6c63044ce36 --repo /home/vgpnk/Projects/shokunin/tabi-shokunin
```

`v1-equivalent-declared.json` used in step 4 (the same facts as `measurements.json`, plus the counted inputs enumerated in `corpus/evidence/round-16/binding/r15-counter-identity.json`):

```json
{"schema":"tabi-measurement-binding-v1","round":15,
 "baseline":"7054a5e1068538349b4dbb0d291c2fe8643802f2",
 "claims":[
  {"id":"C1","axis":"operability",
   "counter":{"path":".ufo/waves/round-15/measure.mjs",
              "sha256":"3ee59de095750e08fc719ed19eb5baea02caf443df05479d24897783240fe384",
              "argv":["node",".ufo/waves/round-15/measure.mjs","{REV}","--claim","C1"],
              "countField":"c1_truthful_diagnostics"},
   "countedInputs":["corpus/evidence/round-15/user-diagnostics.json","scripts/check-user-round-contract.mjs"],
   "measuredRevision":"b7cf0446a31014a81b4882857c90c565ebc14210",
   "before":{"revision":"7054a5e1068538349b4dbb0d291c2fe8643802f2","count":0},
   "after":{"revision":"b7cf0446a31014a81b4882857c90c565ebc14210","count":1}},
  {"id":"C2","axis":"coverage",
   "counter":{"path":".ufo/waves/round-15/measure.mjs",
              "sha256":"dd9c8675ab9bbc91c20f501a90f898197d046d2586f12d2389a564385281251d",
              "argv":["node",".ufo/waves/round-15/measure.mjs","{REV}","--claim","C2"],
              "countField":"c2_enforced_contract"},
   "countedInputs":["corpus/evidence/round-15/metadata-differential.json","scripts/check-aria-metadata.mjs",
     "corpus/evidence/round-13/aria/receipt.json","corpus/evidence/round-13/aria/runtime-pin.json",
     "corpus/evidence/round-13/aria/manifest.json","corpus/evidence/round-13/aria/aria-loopback.spec.mjs",
     "corpus/evidence/round-13/aria/playwright.config.mjs",
     "corpus/evidence/round-13/aria/actual/workers/worker-0-1530637-1792474958700.json",
     "scripts/aria-loopback-round13.mjs","corpus/evidence/round-14/aria-metadata/corrected.json",
     "corpus/evidence/round-14/aria-metadata/verification.json"],
   "measuredRevision":"b7cf0446a31014a81b4882857c90c565ebc14210",
   "before":{"revision":"7054a5e1068538349b4dbb0d291c2fe8643802f2","count":0},
   "after":{"revision":"b7cf0446a31014a81b4882857c90c565ebc14210","count":1}}]}
```

Evidence written by this attack: `/tmp/a1legacy.OjklOb.out` (exact rerun stdout), `/tmp/a1legacy-probe.Wth52B/` (gate copy, v1-equivalent manifests, patched-detail gate). Both are outside the lane.
