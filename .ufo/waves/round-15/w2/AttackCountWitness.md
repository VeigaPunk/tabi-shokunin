# AttackCountWitness — round-15 falsification of delivered bytes

Author-side falsifier output. Not a non-author verifier certificate. Source reading only: no gate, test, self-test, counter, witness or browser was executed. Read-only fact commands used: `git rev-parse`, `git status`, `git ls-tree`, `git cat-file`/`git show` (blob reads), `git hash-object`, `sha256sum`, `grep -F`/`grep -n`, and read of the JSON assets through the `read` tool. No installs; no pacman.

## Attacked revision and digests

- HEAD: `72dcf031b9da24796b718517ea575f21e4f7caae` (`round-15: enforce historical metadata contracts and retain build wave`). Baseline in snapshot: `7054a5e1068538349b4dbb0d291c2fe8643802f2`.
- C1 source last changed at `c138bea` (`round-15: precise USER refusal diagnostics`). `git status` shows `scripts/` clean, so the worktree bytes equal HEAD.
- `scripts/check-user-round-contract.mjs`: blob `12b14bdf288dc9877820f699677fb11651d254c1`, sha256 `abf174c31db616c78bf52cb6f520bcdb7c42ebd4f2a84e867455e66519b60a3d`. Matches `build-snapshot.json`.
- `scripts/check-aria-metadata.mjs`: sha256 `5738296263a327807e0ea4b756ea6b643e88c6e3803b7a4cc42ed8e2e83e4eb0`. Matches snapshot. Clean against HEAD.
- Snapshot entries `.ufo/waves/round-15/measure.mjs` (`62e98f…`) and `metadata-witness.py` (`44cd37…`) also match the worktree.
- Pinned legacy and diagnostic identities re-derived from git objects: bebe2ef `scripts/check-user-round-contract.mjs` blob `7df3ee9f4df6db3c36c886f9173715bc299ce43a`, sha256 `690661217f4ba3fb47a416611d7e45bfcb2440fc093123a25efb97ab63f32171` (matches the code comment). 5c7710d blob `347ae9bbcdc692c3ad55fdfd931fa2cce13fec6d`, sha256 `bde18c672d79dbe1ebf340f265d013a8956da8f961d85fb3862573b7a6a505f3` (matches `DIAGNOSTIC_BASELINE_SHA256`).
- Aria anchors re-derived by `sha256sum` on the worktree: receipt `b458b351…`, pin `4d894756…`, manifest `56764241…`, spec `03cb4e17…`, config `87ae779b…`, producer `1d54c9e9…`, worker `0d0f00e2…`. All match `ANCHORS`.

## Temporal limit

- `corpus/lessons/round-15.md` exists (59 lines). Its "Actual command receipts" section (line 59) is an unfilled placeholder: "added here before this lesson's first commit".
- No C1 or C2 receipts exist under `corpus/evidence/round-15/` (only `source-index.json`, `misroot-recovery.json`, `metadata/mirror-contract.json`, `metadata/expected-fixtures.json`).
- Findings below therefore concern source and committed assets only. No receipt was attacked, and none is claimed.

## Defects (ordered by severity)

### F1 — HIGH, C1: mask-guard fragment is duplicated, so the diagnostic witness and `--self-test` cannot pass on delivered bytes (source-derived; not executed)

- `scripts/check-user-round-contract.mjs:429` contains `const masked = spec.kind === 'grep' && result.status === 1;`.
- `scripts/check-user-round-contract.mjs:859` defines `const MASK_GUARD = "const masked = spec.kind === 'grep' && result.status === 1;";`. The string literal contains the identical fragment.
- `grep -nF` on the committed file returns exactly those two lines for that fragment.
- `runDiagnosticWitness` (`:940`) does `scriptBytes.toString('utf8').split(MASK_GUARD)` (`:953`) and requires `guardParts.length === 2` (`:954`). The file yields 3 parts, so the function fails with `could_not_evaluate` exit 2, "Mask guard appears 2 times in the evaluator source", before any arm runs.
- Consequences:
  - `--diagnostic-witness` (`:1038-1047`) exits 2 on its first call.
  - `--self-test` (`:1049`) reaches `runDiagnosticWitness()` at `:1267` after all earlier cases and exits 2 there. The final `USER_ROUND_CONTRACT_SELFTEST verdict=clean` line (`:1287`) is never printed.
- Documented claims contradicted by these bytes:
  - `SKILL.md:1799` lists `--self-test` and `--diagnostic-witness` as gate commands for `historical-user-contract`.
  - `corpus/lessons/round-15.md:36` admits C1 only if "an isolated regressed-mask control must fail the intended oracle". That control lives in `runDiagnosticWitness` and cannot run.
- Bounded correction: build the constant without the full literal, for example
  `const MASK_GUARD = ["const masked = spec.kind", " === 'grep' && result.status === 1;"].join('');`
  Then confirm with `grep -cF` that the full guard string occurs only at `:429`, and that `const masked = true;` (`MASK_MUTANT`, `:860`) occurs once. Keep the `guardParts.length !== 2` refusal.

### F2 — MEDIUM, C1: count-witness OLD arm is parsed with an unanchored first-match, and its legacy reason is never observed or asserted

- `runCountWitness` (`:862-919`) takes the legacy arm through `gateFields(before)` (`:894`). `gateFields` (`:740-751`) applies `/(?:^|\s)verdict=([a-z-]+)/` and `/(?:^|\s)finding=([a-z_]+)/` to stdout+stderr with no anchor.
- `receiptOf` (`:753-776`) documents why that is unsafe: "the ROUND progress line echoes lesson `spot=` prose that a fixture could make look like a finding". The count witness ignores its own rule for the OLD arm.
- `oldFinding` (`:913`) and the OLD print (`:923`) use that unanchored value. The OLD line prints no `reason=` token at all, while the NEW line prints `reason=${newReason ?? 'none'}`. Absence is therefore indistinguishable from "not printed".
- `pass` (`:903-909`) never asserts `oldArm.reason === null` or the legacy finding. The legacy bytes do carry no reason: `git cat-file blob 7df3ee9f…` contains no `reason=` token and its `fail()` calls take no reason argument (`:403-495` range). The truth is correct at the byte level, but the witness does not check or print it.
- Bounded correction: parse the OLD arm with `receiptOf` (anchored last `USER_ROUND_CONTRACT` line on stdout for the clean legacy run). Add `&& oldArm.reason === null` to `pass`. Print `old_reason=${run.oldArm.reason ?? 'none'}` on the OLD line, mirroring the NEW line.

### F3 — LOW, C1: positive controls do not assert absent reason

- `selfTest` clean cases (`:1060`, `:1073-1081`, `:1141-1143`, `:1185`) give `exit` and `finding` only. `receiptMatches` (`:781-786`) skips `reason` when `expected.reason === undefined`.
- A clean run carrying a stray `reason=` would pass unobserved.
- Bounded correction: add `reason: null` to these expectations. `receiptMatches` already compares `observed.reason === expected.reason` when the field is present.

### F4 — MEDIUM, C2: authenticity is not enforced in verdicts when receipt or pin paths are overridden (source-derived; not executed)

- `verifySnapshot` (`scripts/check-aria-metadata.mjs:871-925`) hashes only the canonical `DEFAULT_RECEIPT`, `DEFAULT_PIN`, manifest, spec, config, producer and worker. It does not hash a `--receipt` or `--pin` argument.
- `parseArguments` (`:3078-3143`) accepts any `--receipt` and `--pin` for every mode, including `--witness` and `--witness-mirrors`. `--derive` takes both paths positionally.
- `evaluateAnchors` (`:826-869`) fails only two cases: canonical path with wrong bytes (`:830`) and anchored bytes at a non-canonical path (`:834-837`). Unknown bytes at a non-canonical path pass, so `R14-ARIA-ANCHOR-01` is `pass`.
- `runWitnessMirrors` computes `authenticatedAnchors` (`:2032-2033`) and returns it (`:2069`), but `ok` (`:2034-2036`) is `baselineAccepted && mirrorRejected && legacyCheckedFindingsAllPass && originalUnchanged`. Authenticity is absent from `ok`.
- The human witness-mirrors line (`:3197-3206`) prints `original_unchanged` but not authenticity. Authenticity appears only in the JSON payload (`witnessMirrorsPayload`, `:2989-3017`).
- `evaluatePin` (`:793-824`) and `evaluateSourceIdentity` (`:689-750`) bind to declared fields, not to receipt file bytes. The sidecar binding (`:1148-1173`) binds to the supplied receipt's own sha.
- [INFERENCE] A byte-altered copy of the receipt, with the same semantics and the canonical pin, placed at another path, would likely make `--witness-mirrors --receipt <copy>` print `verdict=clean` with `original_unchanged=true`. The same copy could also make `--check --receipt <copy> --sidecar <s>` accept a sidecar. The JSON would say `authenticatedAnchors:false`; the human line would not. This is not executed.
- Compatibility constraint: `corpus/evidence/round-15/metadata/expected-fixtures.json` expects `clean-perworker-listening` with `@receipt-green` to exit 0 in `--check` mode. Fixture semantics for `--check` must stay. Only the witness modes need tightening.
- Bounded correction: for `--witness`, `--witness-mirrors` and `--derive`, refuse non-default `--receipt`/`--pin` with exit 2 usage, or add `authenticatedAnchors` to `ok` and print `authenticated=` on the human line. Leave `--check` fixture behavior unchanged.

### F5 — LOW, C2: static legacy value printed as an exit token

- `scripts/check-aria-metadata.mjs:3202` prints `legacy_exit=${result.legacy?.legacyExitForSameBytes}`. That value is the constant `LEGACY_ROUND14.legacyExitForSameBytes: 0` (`:138`). It is never executed; `legacy_executed=false` is printed on the same line (`:3203`).
- The token reads like an observation. Bounded correction: print `legacy_static_exit=0`, or `legacy_exit=static:0`.

### F6 — LOW, C2: mirror-contract equality is enforced only by `--self-test`

- The header (`:98-100`) says "the committed mirror-contract asset must match them exactly, so a new emitted mirror cannot ship without an enforcement entry".
- The only comparison is in `runSelfTest` (`:2272-2340`: `contract.cleanup.fields` and `qualification.fields` compared with `stableStringify(...)` at `:2324` and `:2328`).
- `runWitnessMirrors` (`:1915-2079`) and `runCheck` (`:1385-1438`) do not read `DEFAULT_MIRROR_CONTRACT`. Enforcement therefore exists only where the self-test runs.
- Bounded correction: either load and compare the mirror contract in `runWitnessMirrors` before evaluation, or narrow the header claim to "self-test-enforced".

## Positive verifications (source/bytes only)

- C1 reason vocabulary is closed (`COUNT_REASONS`, `:92-99`). All six ids (`unsupported_counting_command`, `counting_revision_mismatch`, `counting_command_failed`, `score_not_improved`, `before_count_mismatch`, `after_count_mismatch`) appear in `fail()` call sites (`:413`, `:414`, `:430`, `:616`, `:618`, `:619`) and in self-test cases (`:1061-1107`).
- `receiptOf` (`:759-776`) anchors the failure line and rejects prose. `receiptMatches` (`:781-786`) compares exit, finding, reason and detail independently.
- The `unsupported` vs `after_count_mismatch` decoy is discriminated (`:1236-1242`). The reason-negative control is logically sound.
- The grammar (`TREE_COUNT` `:367`, `GREP_COUNT` `:368`) is anchored, and no token reaches a shell. The masked-status case is limited to `grep` status 1 (`:429`).
- C2 snapshot classification: `snapshotOutcome` (`:927-970`) returns exit 2 with `reason=snapshot_tampered` for mismatches and `snapshot_unavailable` for unreadable anchors. It is reached from `runCheck` (`:1386`), `runDerive` (`:1618`) and `runWitnessMirrors` (`:1916`). `runWitness` reaches it through `runCheck` (`:1790`).
- C2 mirror field sets: `corpus/evidence/round-14/aria-metadata/corrected.json` has cleanup keys `{allClosed, allNotListeningAfter, allRefusedAfterClose, derivedListeningAfter, perWorkerCount, summaryServerOk}` and qualification keys `{allProofsComplete, allProofsSupportCorrection, everyProofClosed, everyProofListensBefore, everyProofNotListeningAfter, everyProofRefusedAfterClose, proofCount, qualified}`. These equal the code tables (`:101-118`) exactly, so the canonical correction keeps its field sets under the stricter field-set check.
- Mirror values are recomputed from raw `receipt.cleanup.server.perWorker` (`:1129`, `expectedMirrorValues` `:989-1018`), not from a prior sidecar.

## Commands L1 should run after integration (not run by this lane)

1. `node scripts/check-user-round-contract.mjs --diagnostic-witness`. Predicted by F1: exit 2, "Mask guard appears 2 times".
2. `node scripts/check-user-round-contract.mjs --self-test`. Predicted by F1: exit 2 after the count-witness comparison, before the diagnostic and alias cases.
3. `node scripts/check-user-round-contract.mjs --count-witness bebe2efc4565bb068efd905e9ef78011bb6b4efd`. Expected to work, but it prints no OLD reason (F2).
4. `node scripts/check-aria-metadata.mjs --witness-mirrors --receipt <byte-altered copy of corpus/evidence/round-13/aria/receipt.json> --pin corpus/evidence/round-13/aria/runtime-pin.json`. Predicted by F4: `verdict=clean`, `original_unchanged=true`, no authenticity field on the line.
5. After any F1 fix: `grep -cF "const masked = spec.kind === 'grep' && result.status === 1;" scripts/check-user-round-contract.mjs` should print `1`.

## Residual risk and gaps

- No execution performed. Every defect is source-derived. F1 is the strongest prediction because it follows from a literal string comparison, but the runtime outcome still needs one run by L1.
- Receipts and lesson receipt section are absent (temporal limit above).
- The aria `--witness-mirrors` checker covers only the canonical default paths under `verifySnapshot`. F4 is limited to overridden paths.
- Not checked: the W1 reports in `.ufo/waves/round-15/w1/` (predating edits), external validator paths, and the remaining 3,000 lines of aria self-test fixtures beyond the tables and dispatch.
