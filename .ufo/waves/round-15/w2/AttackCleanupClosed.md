# AttackCleanupClosed — C2 `cleanup.allClosed` mutation vs independent proof predicate

Author-side falsifier seat (TabiR15 wave2). This is not non-author verification. I only read source. I ran no gate, test, selftest, counter, witness or browser. I edited no source. Every outcome below comes from reading code and is marked [INFERENCE] where it predicts runtime behavior. No tools were installed or updated.

## Attacked bytes

- HEAD `72dcf031b9da24796b718517ea575f21e4f7caae` (baseline `7054a5e1068538349b4dbb0d291c2fe8643802f2`). This matches `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-15/build-snapshot.json`.
- The HEAD blobs match the snapshot exactly: `git show HEAD:<path> | sha256sum`.
  - `scripts/check-aria-metadata.mjs` `5738296263a327807e0ea4b756ea6b643e88c6e3803b7a4cc42ed8e2e83e4eb0` (3313 lines). My working-tree reads all carried one read tag (`#1D45`), and my first worktree `sha256sum` equalled this digest. So every checker line I cite below is snapshot bytes.
  - `.ufo/waves/round-15/measure.mjs` `62e98fa8…02e7` and `.ufo/waves/round-15/metadata-witness.py` `44cd37c5…5831`. I re-read the lines I cite from `git show HEAD:` (measure :337-342, :366-370, :410-420, :984, :1107; witness :51).
  - `corpus/evidence/round-15/metadata/expected-fixtures.json` was read while it was still unmodified (35 CLI / 3 helpers). `mirror-contract.json` is `18857a4dbe8e9267f68598b0ad2064a967299c12fd383c5c453347923f18308e`.
- **Concurrent post-snapshot edits.** By the end of my review, `git status` showed the worktree modifying `scripts/check-aria-metadata.mjs`, `measure.mjs`, `metadata-witness.py`, `expected-fixtures.json` (36 CLI / 4 helpers) and `check-user-round-contract.mjs`. Those bytes are **not** the attacked snapshot, and I did not review them, except for the narrow observations in §"Post-snapshot observations".
- Untracked working-tree file outside the snapshot: `corpus/lessons/round-15.md`, `a5f5aa26ab923d144c3ce6b49d4e701269e07ee91c81e74ec8bc70962f803866` at the end of my read. **It changed while I was reading.** My first grep of row 37 read "C2 recomputes cleanup/qualification fields independently of the writer and ships single-field CLI negatives". The final read says "producer and checker may share that derivation, so independent literal expectations and the immutable historical fixture are the separate oracle … `metadata-witness.py` compares the same single-field malformed sidecars". My lesson findings apply to the final text only.

## Temporal limit

`/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-15/` contains `metadata/{expected-fixtures,mirror-contract}.json`, `source-index.json` and `misroot-recovery.json`. There is **no `metadata-differential.json`**, no selftest receipt and no witness output. `measure.mjs:828` would report "round-15 metadata differential receipt missing". Nothing about a runtime outcome for the allClosed differential can be admitted yet. Lesson :59 itself defers the receipts.

## Code under attack

- Shared predicate: `expectedMirrorValues` at `scripts/check-aria-metadata.mjs:989-1018`. Line 995 is `closed = complete && proofs.every(p => p?.closed === true)`, and it feeds both `cleanup.allClosed` (:1001) and `qualification.everyProofClosed` (:1013).
- Writer: `buildSidecar` at :1469, emitting at :1560-1577.
- Validator: `evaluateSidecar` at :1315-1355, using `mirrorFieldProblems` at :972-987. The validator takes proofs from the receipt (:1129-1132), not from the sidecar. That is correct.

## Findings

### F1 — HIGH — The per-proof `closed` predicate cannot be observed; every allClosed test reduces to `=== true`

- **Evidence.** Any receipt with a complete proof where `closed:false` already fails `R14-ARIA-CLEANUP-PROOF-01`:
  - `proofValueProblems` :371 makes `allProofsPass` false (:396).
  - `evaluateSidecar` then also fails `R14-ARIA-SIDECAR-CORRECTION-01` with `proofs_do_not_all_pass` (:1252).
  - It also fails `R14-ARIA-SIDECAR-RESIDUAL-01`, because postEvaluation still carries PROOF-01 (:1357-1367).
  - So on every accepted input, `expected.allClosed` is necessarily `true`, and the line-995 predicate never changes an accept/reject outcome.
  - The only input-dependent effect left is the *status* of `R14-ARIA-SIDECAR-CLEANUP-MIRROR-01` on inputs that are already rejected.
- **No fixture reaches the false branch.** `fixtureReceipt` (:2082-2167) varies only `summaryListeningAfter`, `node`, `workerCount`, `includeServer` and `listeningAfter:'false'` (:2360-2393). Every case clones `FIXTURE_PROOF` with `closed:true` (:188-191), and no fixture receipt has `closed:false`.
  - `sidecar-cleanup-mirrors` (:2438-2451) and the witness `--witness-mirrors` (:1973-1980) both set `allClosed:false` against all-closed proofs.
  - `metadata-witness.py:43-44` does the same, via `not value` on the canonical `true`.
  - All three test only `observed !== true`.
- **Counterexample [INFERENCE].** Replace :995 with `const closed = complete;`, or with the wave1-flagged alias `cleanupDerived.allProofsPass === true` (w1 `PriorRouting.md:42`, `MirrorQualification.md` F2). Then:
  - Writer and validator change together, because they share `expectedMirrorValues`.
  - The `sidecar-valid` bytes stay identical, so the pinned digest in `expected-fixtures.json` still matches.
  - `corpus/evidence/round-14/aria-metadata/corrected.json` (`allClosed:true`) is still accepted.
  - All 35 CLI cases and 3 helpers return the same results, and every `metadata-witness.py` record returns the same pass value.
  - So the claim that the allClosed mirror is "recomputed from raw proof data" is satisfied textually but is not distinguished by any shipped oracle. Lesson row 37's "independent literal expectations and the immutable historical fixture" encode only the all-true point.
- **Impacted axes.** C2 calibration (premature saturation of the "every mirror checked against proofs" claim); false provenance strength.
- **Smallest safe correction.** Add one twin pair of CLI cases to `expected-fixtures.json` and `runSelfTest`:
  - Receipt: `receipt-open` = `fixtureReceipt({proof:{...FIXTURE_PROOF, closed:false}})`, with summary `server.closed:false` and `serverClosed:false` so that CLEANUP-CLOSED-01 is not the discriminator.
  - Sidecar A: a clone of `sidecar-valid` with `cleanup.allClosed:false` and `qualification.everyProofClosed:false`.
  - Sidecar B: identical to A except `cleanup.allClosed:true`.
  - Assert exact `expectedFailedFindings` for both. They must differ only by `R14-ARIA-SIDECAR-CLEANUP-MIRROR-01`: present for B, absent for A. Binding, correction and residual failures are shared and cancel out.
  - This makes line 995 falsifiable without new browser runs. Otherwise, narrow the C2 wording to: on accepted inputs, mirrors are checked as literal `true`, and the per-proof predicate is defensive only.

### F2 — MEDIUM — The selftest helper's label claims independence its tautology cannot show

- **Evidence.** `derive-and-mirror-helper` (:2743-2787) compares `buildSidecar(...)` output with `expectedMirrorValues(deriveProofs, derivePre.derived.cleanup)`. `buildSidecar` itself calls the same function on the same inputs (:1469). On failure it pushes `derive:mirrors_not_independently_derived` (:2777), but it can only fail on nondeterminism.
  - `QUALITY.md` item 20 (:69-70) says a same-function comparison "proves determinism only". The final lesson row 37 also concedes shared derivation.
  - The committed problem token and the helper id still say "independently derived". `mirror-contract.json` `description` also says "values are independently recomputed … never from a previously emitted sidecar". That part is true, but readers take it as independence from the writer.
- **Correction.** Rename the token to `derive:mirrors_not_deterministic` (or drop the mirror half of the helper), and add "producer and checker share `expectedMirrorValues`" to the contract description. This is a helper-only change: the CLI case count is unchanged, and `caseCounts.helpers` stays 3.

### F3 — HIGH (measurement) — Witness arms cannot satisfy `measure.mjs`'s "exactly one named mirror finding"; the allClosed differential would be refused

- **Evidence.** For a single-field `cleanup.allClosed` mutation of `corrected.json` run under `--check`, the new checker fails exactly two findings [INFERENCE]:
  - `R14-ARIA-SIDECAR-CLEANUP-MIRROR-01`;
  - the roll-up `R14-ARIA-SIDECAR-ACCEPTED-01` (:1369-1373, which is always `fail` when `accepted=false`).
- `metadata-witness.py:19-25,47-51` stores arms as `{command, exit, stdout, stderr, payload}`. In `measure.mjs`, `namedFinding` (:410-420) then finds no name:
  - `findingFromValue` returns null when there are 2 failed ids (:366-370).
  - `checkPayload` (:2871-2938) has no `finding` key.
  - The stdout line `ARIA_METADATA findings R14-…-CLEANUP-MIRROR-01,R14-…-ACCEPTED-01` (:3284) does not match `/^ARIA_METADATA findings\s+([A-Za-z0-9._:-]+)\s*$/m` (:340), because of the comma. `findings=` is not `finding=` (:339).
- **Consequence [INFERENCE].** `measure.mjs:984` records `mirror_finding` for the allClosed record and for all 8 sibling records, so `result.count = 0` (:1107). If the L1 receipt is the witness output unmodified, the C2 0→1 count fails for a shape reason, not a semantic one.
- **The witness's own pass predicate is too weak.** It is `any('SIDECAR' in x for x in failed_ids(after))` (:51), and `R14-ARIA-SIDECAR-ACCEPTED-01` alone satisfies it. It does not prove that the cleanup mirror, or the `cleanup.allClosed` problem, caused the refusal.
- **Smallest correction (L1-owned files).** In `metadata-witness.py`:
  - Require `failed_ids(after) == {'R14-ARIA-SIDECAR-CLEANUP-MIRROR-01','R14-ARIA-SIDECAR-ACCEPTED-01'}` (QUALIFICATION-01 for the qualification group).
  - Require the mirror finding's `detail.problems == ['cleanup.allClosed']`.
  - Record on each `after` arm `finding` = the single failed id other than ACCEPTED-01, derived from the observed payload rather than invented.
- Alternatively, in `measure.mjs` `findingFromValue`, ignore the `*-ACCEPTED-01` roll-up when counting failed ids. Choose one owner. Do not change both.

### F4 — LOW — `allClosed` has two meanings in one checker

- The receipt-side `derivedClosed` (:401-402, used by CLEANUP-CLOSED-01) is `every(closed===true)`.
- The sidecar mirror `allClosed` (:992,995) is `complete && every(closed===true)`.
- For a shape-incomplete but all-closed set (e.g. a bad `origin`, :362), the receipt summary must say `closed:true` while the mirror must say `allClosed:false`. No acceptance outcome changes, because incomplete sets are rejected anyway. The gating is still undocumented in `mirror-contract.json`.
- **Correction.** Add one sentence to the contract description: "all*/everyProof* mirrors are false unless the proof set is complete and nonempty".

### F5 — LOW — CLI cases isolate the type branch for allClosed, not the value branch

- `sidecar-mirror-types` (:2463-2467) is the only case where `cleanup.allClosed` is the sole changed cleanup-group field, and it exercises the `:type` branch (:983).
- The `value !== expected` branch (:984) is isolated only for `allNotListeningAfter` (`sidecar-mirror-silent`, :2469-2475).
- `sidecar-cleanup-mirrors` changes six fields, including `perWorkerCount` 1→2, so any one comparison masks the others.
- Field-deletion regressions *are* covered: the `CLEANUP_MIRROR_FIELDS` table must equal `mirror-contract.json` (:2323-2326), and `mirrorFieldProblems` checks the exact key set (:975-978). The selftest asserts finding ids only, never `detail.problems` (:2582-2605).
- **Correction.** Either reuse F1's twin pair, or add `expectedProblems` matching to `evaluateOutput` for the mirror cases.

## No defect found (checked)

- The validator recomputes from receipt proofs (:1129), not from sidecar-supplied proofs. Binding pins the proof-set digest (:1186-1195).
- Empty or incomplete proofs give boolean `false`, not `null` (:992-997). This closes the wave1 null/boolean asymmetry (w1 `MirrorQualification.md` F3).
- The baseline checker emits `acceptedCorrection` (`git grep` at `7054a5e`, :1938) and `verdict=clean` stdout (:2236), so the witness before-arms are parseable by `cleanArm` [INFERENCE].

## Post-snapshot observations (worktree, not the attacked revision; diff read only)

- `metadata-witness.py` worktree diff: the pass predicate changes from `any('SIDECAR' …)` to `expected_finding in failed_ids(after)`, and each record gains a record-level `expectedFinding`. This partly addresses F3's weak predicate. It still does not require the exact failed set, and it does not require `detail.problems == ['cleanup.<key>']`.
- `measure.mjs` worktree: `namedFinding` still reads arm-level keys only (`finding`, `redFinding`, `findings`, nested `payload`/`result`). A grep finds no handling of the `*-ACCEPTED-01` roll-up, and the record-level `expectedFinding` is not consulted by `namedFinding`. So F3's `mirror_finding` refusal still appears to apply [INFERENCE].
- `check-aria-metadata.mjs` worktree diff at `expectedMirrorValues`: `derivedListeningAfter` and `qualification.qualified` are now complete-gated. Line 995 (`closed`) is unchanged, and the diff shows no fixture receipt with `closed:false`. F1 and F2 still apply to the worktree as far as the diff shows.

## Commands for L1 (not run by me)

1. `node scripts/check-aria-metadata.mjs --self-test`. Confirm 35 CLI / 3 helpers.
2. `python3 .ufo/waves/round-15/metadata-witness.py > /tmp/md.json`. Inspect `mirrors[0].after.payload.findings` for the exact failed set.
3. Run `measure.mjs --claim C2` against a receipt built from (2). Expect `mirror_finding` errors per F3 unless corrected.
4. After any F1 fixture is added: the mutation `:995 → const closed = complete;` must turn exactly the twin case red.
