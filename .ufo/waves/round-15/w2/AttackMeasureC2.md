# AttackMeasureC2 — round15 C2 falsification (read-only, source-reading)

Author-side seat. Not a non-author verifier; no certification is claimed.

## Attacked bytes

- Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- HEAD revision attacked: `72dcf031b9da24796b718517ea575f21e4f7caae` (snapshot `baseline` `7054a5e1068538349b4dbb0d291c2fe8643802f2`)
- Source digests (sha256 of worktree bytes; `git status --short` lists none of these four as modified, and `git show HEAD:scripts/check-aria-metadata.mjs` matches the first):

| path | sha256 | matches snapshot |
|---|---|---|
| `scripts/check-aria-metadata.mjs` | `5738296263a327807e0ea4b756ea6b643e88c6e3803b7a4cc42ed8e2e83e4eb0` | yes |
| `.ufo/waves/round-15/measure.mjs` | `62e98fa858c0c29478d052b23206c726cacd457c26a41549058c473be1df02e7` | yes |
| `.ufo/waves/round-15/metadata-witness.py` | `44cd37c52aa87c09c15ebe36f0624c2c6cbbcf566d0617de3748747548f45831` | yes |
| `scripts/check-user-round-contract.mjs` (C1, not attacked) | `abf174c31db616c78bf52cb6f520bcdb7c42ebd4f2a84e867455e66519b60a3d` | yes |

Historical input anchors re-hashed at HEAD and at baseline `7054a5e` and all equal the gate's `ANCHORS`: receipt `b458b351…`, pin `4d894756…`, producer `1d54c9e9…`, spec `03cb4e17…`, config `87ae779b…`, manifest `56764241…`, worker `0d0f00e2…`. Baseline checker `7054a5e:scripts/check-aria-metadata.mjs` = `ef373872…` (equals `LEGACY_ROUND14.checkerSha256`).

## Temporal limit (reported, not invented)

- `corpus/evidence/round-15/metadata-differential.json` does not exist. Nothing in the tree is a C2 receipt. C2 currently counts 0 by construction (`measure.mjs:826-829`).
- `corpus/evidence/round-15/user-diagnostics.json` (C1) also absent.
- `corpus/lessons/round-15.md` exists, but its `## Execution evidence` section (line 59) is a placeholder; no measured outcome is claimed.
- `LOG.md` / `SCORECARD.md` contain no round-15 row yet.
- No gate, selftest, measure, witness, or browser was executed by this seat. Hashing and `git show` were the only commands. Baseline checker and spec were copied to a scratch dir outside the lane (`/tmp/tabi-r15-attack`) for reading.

## Findings (severity order)

Each item is a source-derived prediction, not an execution result. Items H1–H3 each independently force C2 = 0 against the delivered bytes, so the first C2 receipt would be refused even when the gate behaves as designed.

### H1 — self-test summary grammar mismatch (blocks count)

- Gate prints `ARIA_METADATA_SELFTEST verdict=clean cli_cases=${n} helpers=${m}` (`scripts/check-aria-metadata.mjs:2837-2839`). No `cases=` token is emitted anywhere in that line.
- Probe requires `/^ARIA_METADATA_SELFTEST verdict=clean cases=(\d+)\b/m` (`.ufo/waves/round-15/measure.mjs:887`). Missing summary → `self_test_not_green` (`measure.mjs:895`), so `count = 0` (`measure.mjs:1107`).
- Result: the gate's real selftest output can never satisfy the probe.
- Bounded correction (pick one, same commit as the receipt): (a) probe accepts `^ARIA_METADATA_SELFTEST verdict=clean (?:cases|cli_cases)=(\d+)` and compares against the CLI case-line count (CLI lines = 35 per `expected-fixtures.json` `caseCounts.cliCases`); or (b) gate additionally prints `cases=${cliCases.length + helpers.length}`. Prefer (a) — no gate-byte change, so no re-pin.

### H2 — mirror refusals name two failing findings; probe reads zero (blocks count)

- Committed expectations pin two failed ids per mirror refusal: `expected-fixtures.json:319-332` (`R14-ARIA-SIDECAR-CLEANUP-MIRROR-01` + `R14-ARIA-SIDECAR-ACCEPTED-01`) and `:345-358` (`R14-ARIA-SIDECAR-QUALIFICATION-01` + `ACCEPTED-01`). Source: `check-aria-metadata.mjs:1371-1378` pushes `ACCEPTED-01` into the same `findings` array.
- Probe rule: "exactly one named mirror finding" (`measure.mjs:983-988`). `namedFinding` → `structuredFinding` → `findingFromValue(findings)` (`measure.mjs:358-373`): two `status:"fail"` items → `failedIds.length===2` → fallback `ids.length===1` false → returns `null`. Text fallbacks also miss: `findings=N` does not match `finding=`, and `ARIA_METADATA findings A,B` contains a comma outside the class in `measure.mjs:340`. Result: `mirror_finding: refusal has no unambiguous named finding`, count 0.
- Witness side is weaker still: `metadata-witness.py:51` uses `any('SIDECAR' in x …)`, which passes on the same output.
- Bounded correction: in the probe, select the unique failing id after excluding the summary `R14-ARIA-SIDECAR-ACCEPTED-01` (exactly one remaining must match `MIRROR_FINDING`); equivalently the witness records an explicit `finding` field computed that way. Do not change the gate bytes; the two-id output is pinned by the committed fixtures.

### H3 — committed producer cannot emit a valid receipt (blocks count)

`metadata-witness.py` result dict (`:64-68`) has no `selfTest` key and its `positive` is the raw run record (`:54-56`, keys `command/exit/stdout/stderr/payload`) with no `sidecar:{path,sha256}`. Probe requires both: `measure.mjs:879-881` (selfTest) and `:1048-1050` (positive.sidecar). No other producer exists in the tree (the header says "produced by the metadata differential harness", which is not present).
- Bounded correction: the harness must add `selfTest` (captured `check-aria-metadata.mjs --self-test` stdout/exit, run by L1 at closure) and `positive.sidecar = {path:"corpus/evidence/round-14/aria-metadata/corrected.json", sha256:<committed sidecar digest>}`. Until then, count 0 is the correct outcome, not a regression.

### M1 — tamper field fails the probe's identity regex

- Witness sets `tamper.field` to the spec path (`metadata-witness.py:62`: `'field': spec_path`, value `corpus/evidence/round-13/aria/aria-loopback.spec.mjs`).
- Probe checks `SNAPSHOT_FIELD = /sha256|digest|hash|bytes|revision|pin|snapshot|input|identity/i` against that value (`measure.mjs:173`, `:1010-1012`). I checked the literal string; it contains none of those tokens. Result: `snapshot_field`, count 0.
- Bounded correction: `field` names the identity, e.g. `"source.spec.sha256"` or `"specSha256"`, and the path goes in a separate `path` key.

### M2 — tamper "before" arm is permissive

- `measure.mjs:1021` accepts any exit-1 `tamper.before` (`refusalArm` only checks exit 1 and not-clean). A before arm that is a snapshot-tampered or could-not-evaluate red passes the probe. The witness's own check (`metadata-witness.py:62`: `'R14-ARIA-SOURCE-01' in failed_ids(before)`) is not re-checked by the probe, and the probe does not reject `could_not_evaluate`/snapshot ids on this arm, although the lesson requires "authentic semantic exit1" (`corpus/lessons/round-15.md:38`).
- Bounded correction: require `namedFinding(before)` to be non-snapshot, not could-not-evaluate, and equal to `R14-ARIA-SOURCE-01` for the spec differential.

### M3 — `recordedSha256` is not bound to the snapshot inputs

- `measure.mjs:1013-1017` checks only that recorded ≠ computed and both are 64-hex. The probe never checks `tamper.recordedSha256 === snapshotInputs[<authenticated path>]`. The witness sets it from BASE bytes (`metadata-witness.py:62`), which equal `snapshotInputs` (`:66`), but the probe would accept any well-formed hex.
- Bounded correction: require `recordedSha256 === snapshotInputs[spec path]` and that field-name identity matches (see M1).

### M4 — `emittedMirrors` optional, so newly enforced set is not enforced

- `measure.mjs:950-962` skips coverage when `emittedMirrors` is absent, and `:991-995` only runs `mirror_missing_differential` when it is declared. The witness omits it (`metadata-witness.py` result dict). A receipt can therefore omit any of the 9 newly enforced fields and still count 1.
- The newly enforced set is derivable: cleanup 6 fields (`check-aria-metadata.mjs:101-108`, `LEGACY.checkedCleanupMirrorFields=[]`) plus qualification `everyProofListensBefore`, `everyProofClosed`, `everyProofRefusedAfterClose` (`:109-118`, `:133-137` legacy unchecked list). The committed `corpus/evidence/round-15/metadata/mirror-contract.json` matches code tables exactly (checked).
- Bounded correction: require `emittedMirrors` present and equal to exactly those 9 names. The witness's hard-coded list (`metadata-witness.py:40-41`) should be derived from `mirror-contract.json` so the two cannot drift.

### M5 — C2 binds only the receipt revision, not the measured revision's gate bytes

- `validateCommitPin` (`measure.mjs:565-582`) checks that `receipt.revision` is an ancestor of the measured revision and that its blob hashes to `codeSha256`. No check compares the gate at the measured revision (grep for `diff`/`--name-only` on the gate path finds none; `measure.mjs:845`).
- Consequence: a later edit to `scripts/check-aria-metadata.mjs` (e.g. weakening a mirror) leaves C2 at 1 while the delivered gate differs from the receipt. The USER path forces re-pin for the same reason (`ReviewProtectedPaths.md`-style history rule; see `check-user-round-contract.mjs` `acceptedRoundScript`).
- Bounded correction: require `sha256(fileAt(revision, C2_CHECKER)) === codeSha256` (forces a fresh receipt after any later gate edit), or `git diff --quiet <codeRevision> <revision> -- scripts/check-aria-metadata.mjs`.

### L1 — snapshot anchors do not cover the canonical sidecar (residual, by stated scope)

- `verifySnapshot` (`check-aria-metadata.mjs:874-886`) hashes receipt, pin, manifest, spec, config, producer, worker only. `corrected.json` and `verification.json` are not anchored, so a changed canonical sidecar yields exit 1 semantic, not `snapshot_tampered`. The lesson explicitly scopes this (`round-15.md:12` rejects whole-sidecar byte authentication; `:47` keeps "sidecar false semantic claims" at exit 1), so this is a documented limit, not a defect. The probe checks canonical sidecar digest only at count time (`measure.mjs:1059-1071`).
- Not verified here: that `round-14/aria-metadata/verification.json` pins `e156b922…` (the measured `positive.sidecar.sha256` depends on it).

## Verified-as-correct (source-read)

- Snapshot tamper path: `snapshotOutcome` returns exit 2, classification `could_not_evaluate`, reason `snapshot_tampered`, single finding `snapshot_tampered` with status `could_not_evaluate` (`check-aria-metadata.mjs:927-949`). Probe's `snapshot_finding`/`snapshot_classification` checks accept this (`measure.mjs:1022-1030`).
- Historical sidecar mirror refusal exit 1 via `CLEANUP-MIRROR-01`/`QUALIFICATION-01` + `ACCEPTED-01` (`:1316-1355`, `:1371`).
- Baseline checker (`7054a5e`, read-only) checks only `qualified, proofCount, allProofsSupportCorrection, allProofsComplete, everyProofNotListeningAfter` and no cleanup mirror (`base :1060-1075`; no `sidecar.cleanup` reference found in `base :853-1109`). So the "authentic before exit 0 accepted" premise for the 9 new mirrors holds statically. Not executed.
- Baseline spec mismatch produces `R14-ARIA-SOURCE-01` fail (`base :640-647`, same function shape as HEAD `:640-647`), so `tamper.before` exit 1 is expected statically. Not executed.
- Mirror cases pass probe `mirror_field_scope` (`cleanup.*`/`qualification.*` match `MIRROR_FIELD`).

## Commands L1 should run after integration (not run by this seat)

1. `node .ufo/waves/round-15/metadata-witness.py` (after H3/M1/M3 corrections land in the producer).
2. `node scripts/check-aria-metadata.mjs --self-test` (verify H1 summary form and the two-finding mirror expectations).
3. `node .ufo/waves/round-15/measure.mjs HEAD --claim C2` only after the receipt is committed; expect 0 until H1–H3 and M1–M5 are addressed.

## Tools

None installed or updated by this seat. No pacman use.
