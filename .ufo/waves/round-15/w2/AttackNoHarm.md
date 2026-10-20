# AttackNoHarm — round15 delivered-byte falsification (read-only, source reading)

Author-side report. Not a non-author verification or certification.
Lane root: /home/vgpnk/Projects/shokunin/tabi-shokunin

## Attacked revision and bytes

- HEAD: `72dcf031b9da24796b718517ea575f21e4f7caae` (matches build-snapshot.json `revision`; baseline `7054a5e1068538349b4dbb0d291c2fe8643802f2`).
- Snapshot digests re-read from bytes (sha256sum, no execution), equal to both working-tree bytes and HEAD blobs:
  - `scripts/check-user-round-contract.mjs` `abf174c31db616c78bf52cb6f520bcdb7c42ebd4f2a84e867455e66519b60a3d` (HEAD blob 12b14bdf)
  - `scripts/check-aria-metadata.mjs` `5738296263a327807e0ea4b756ea6b643e88c6e3803b7a4cc42ed8e2e83e4eb0`
  - `.ufo/waves/round-15/measure.mjs` `62e98fa858c0c29478d052b23206c726cacd457c26a41549058c473be1df02e7` (tracked at HEAD)
  - `.ufo/waves/round-15/metadata-witness.py` `44cd37c52aa87c09c15ebe36f0624c2c6cbbcf566d0617de3748747548f45831` (tracked at HEAD)
- Pinned historical identities re-checked by blob/sha (all match the constants in the checkers): ARIA baseline 7054a5e checker sha `ef37387217c7…` (= LEGACY_ROUND14.checkerSha256); USER diagnostic baseline 5c7710d blob `347ae9bb…` sha `bde18c67…`; USER count baseline bebe2ef blob `7df3ee9f…`; USER round-script cutover 1212207 sha `8478cd43…`; HEAD round-script sha `8a573b4e…`; round-13/14 ARIA receipt, pin, manifest, spec, config, producer, worker and corrected sidecar bytes identical between 7054a5e and HEAD.
- Uncommitted working-tree docs (SKILL.md, corpus/QUALITY.md, corpus/README.md, corpus/SOURCES.md) and untracked `corpus/lessons/round-15.md`, `corpus/evidence/round-15/{source-index,misroot-recovery}.json` are NOT covered by the snapshot digests. Findings about them are about uncommitted bytes.

## Temporal limits (reported, not treated as success)

- `corpus/evidence/round-15/user-diagnostics.json` (C1 receipt) is absent. `corpus/evidence/round-15/metadata-differential.json` (C2 receipt) is absent. Both probe counts are therefore 0 at HEAD; no C1/C2 success is claimed.
- `corpus/lessons/round-15.md` "Execution evidence" section is empty ("added here before this lesson's first commit"). Its mistakes and gate text are author-side admission criteria.
- LOG.md / SCORECARD.md have no round-15 rows and are not modified (L1 integration pending).
- build-snapshot.json: `verification: not yet exercised`. No gate, selftest, witness, counter, or browser was run by this report.

## Defects (ordered by severity)

### D1 (high) — `--check <sidecar>` lets the sidecar choose the evaluated receipt and pin; the snapshot authentication covers only the hardcoded canonical paths
- `scripts/check-aria-metadata.mjs:3052-3062` (`resolveCheckInput`): for a sidecar input, `receiptPathText` and `pinPathText` are read from the sidecar's own `original.receipt.path` / `original.pin.path`.
- `:3231-3263` (`main`) passes them to `runCheck`.
- `:1385-1398` (`runCheck`): `verifySnapshot()` takes no arguments and hashes only `DEFAULT_RECEIPT`/`DEFAULT_PIN`/manifest/spec/config/producer/workers (`:871-886`). `prepareContext(receiptPathText, pinPathText)` at `:1397` then evaluates the sidecar-named files. So a substituted receipt+pin pair (bytes not equal to the anchors) at a non-canonical path passes the snapshot check (defaults untouched).
- `evaluateAnchors` (`:826-852`) only fires when anchored bytes sit at a non-canonical path (`:834-838`) or when a canonical path is paired with a non-canonical one (`:846-851`). A wholly forged pair at attacker paths raises no anchor problem.
- `evaluatePin` (`:793-824`) checks the receipt against whatever pin was supplied (`receipt.runtime.pinned.pinSha256` and projection), so a forged pin is self-consistent. `evaluateNode` derives the Node floor from `pin.node.minimumMajor`, which is then attacker-controlled.
- BINDING-01 (`:1148-1208`) only compares the sidecar's own recorded sha to the evaluated file, which the attacker writes.
- Consequence [INFERENCE from source reading; not executed]: a clean `acceptedCorrection:true` / exit 0 verdict can be produced for an arbitrary receipt+pin pair, and the Node-minimum floor and `snapshot_tampered` classification no longer apply to the evaluated inputs. The forgeable field set beyond `pin.node.minimumMajor` and `receipt.runtime` was not enumerated.
- SKILL.md round-15 registry text discloses that noncanonical fixture inputs are semantically evaluated and not certified. That disclosure does not cover the production `--check <sidecar>` path, which returns exit 0 and `acceptedCorrection` for these inputs.
- Bounded correction (L1/owner): in `resolveCheckInput` (sidecar branch), return `{ok:false, reason:'sidecar:noncanonical_input'}` unless `original.receipt.path === DEFAULT_RECEIPT` and `original.pin.path === DEFAULT_PIN` (absolute-path equivalent accepted), or make `verifySnapshot` hash the evaluated receipt/pin paths. Add one isolated CLI case: sidecar with redirected receipt path must exit 2. Same guard for the `--receipt`/`--pin` override when a sidecar is present.

### D2 (high) — Python mirror witness pass predicate is satisfied by the generic ACCEPTED finding
- `.ufo/waves/round-15/metadata-witness.py:51`: `any('SIDECAR' in x for x in failed_ids(arms['after']))`.
- Every refused sidecar fails `R14-ARIA-SIDECAR-ACCEPTED-01` (`scripts/check-aria-metadata.mjs:1371-1378`), and that id contains `SIDECAR`. The predicate therefore passes whenever the mutant is refused for any reason and never requires `R14-ARIA-SIDECAR-CLEANUP-MIRROR-01` or `R14-ARIA-SIDECAR-QUALIFICATION-01` (`:1324`, `:1347`).
- This is the lesson's cited "durable metadata-witness.py" evidence for the mirror survivor class (`corpus/lessons/round-15.md`, mistakes table row 2). It cannot distinguish "mirror refused" from "some other sidecar finding refused".
- Bounded correction: for section `cleanup` require `failed_ids(after) - {'R14-ARIA-SIDECAR-ACCEPTED-01'} == {'R14-ARIA-SIDECAR-CLEANUP-MIRROR-01'}`; for `qualification` the same with `…QUALIFICATION-01`. Record the exact failed set in the output.

### D3 (high, claim-blocking for C2) — witness tamper field fails the measure's own field-identity test
- `.ufo/waves/round-15/metadata-witness.py:62`: `'field': spec_path` = `corpus/evidence/round-13/aria/aria-loopback.spec.mjs`.
- `.ufo/waves/round-15/measure.mjs:173` (`SNAPSHOT_FIELD = /sha256|digest|hash|bytes|revision|pin|snapshot|input|identity/i`) and `:1010-1011` (`snapshot_field` finding). The path string contains none of those tokens, so C2 rule 5 would fail even when the witness passes.
- Bounded correction: set `field` to an identity name such as `source.spec.sha256` (or `spec.sha256`), and carry the path in a separate key (`path`).

### D4 (high, C2 counting) — measure's ARIA self-test summary regex does not match the current checker
- `.ufo/waves/round-15/measure.mjs:887`: `/^ARIA_METADATA_SELFTEST verdict=clean cases=(\d+)\b/m`.
- Current checker prints `ARIA_METADATA_SELFTEST verdict=clean cli_cases=${n} helpers=${m}` (`scripts/check-aria-metadata.mjs:2838-2839`; blocked form `:2316`). The `cases=16` form is only in the frozen round-14 receipt (`corpus/evidence/round-14/aria-metadata/verification.json`).
- Result: `self_test_not_green` on every genuinely green round-15 run. C2 cannot count 1 for the current checker.
- Also the tally check at `measure.mjs:898-899` compares `cases` to case-line count; ARIA helper lines also carry `expected_exit` (`:2859`), so the expected sum is `cli_cases + helpers`.
- Bounded correction: parse `cli_cases=(\d+) helpers=(\d+)` and compare the sum with parsed case lines.

### D5 (medium, C1 counting) — shell-invocation detector misses shell-string APIs and absolute shell paths
- `.ufo/waves/round-15/measure.mjs:176` `SHELL_CALL` requires a literal bare shell name as the first argument (`'bash'`, `'sh'`, …). It does not flag `execSync('git ls-tree … | wc -l')`, `exec(...)`, `execFile('/bin/sh', …)`, or `spawnSync('/bin/sh', ['-c', …])`.
- Applied at `measure.mjs:532` (runCount body) and `:658` (whole source). The shipped gate currently passes, because it uses only `spawnSync('git', argv)` (`check-user-round-contract.mjs:117, 425, 631`). The detector would not catch a regression to any of the forms above.
- Bounded correction: flag every `exec`/`execSync` call, and any `/bin/(ba|z|da|fi|k)?sh` or `/usr/bin/…sh` literal, in addition to the existing patterns. Keep `SHELL_C` for runCount.

### D6 (low, truthfulness of emitted SELFTEST lines) — lines assert observations they did not make
- `scripts/check-user-round-contract.mjs:1252`: `count_committed_*` lines print `isolation=cli` though they run in-process `runCount` (no CLI spawn). `measure.mjs:550` classifies `count_committed_` as non-isolated, so the token contradicts the probe's own rule. These lines carry no `expected_reason`, so counts are not inflated.
- `:1243` (`reason_negative_control`) prints literal `actual_exit=0`; `:1265` (`count_witness_comparison`) and `:1273` (`diagnostic_witness_comparison`) print `actual_exit` derived from the predicate, not from an observed process status. Rule 3 of the C1 probe ("expected_exit == actual_exit") is therefore tautological for these lines.
- Bounded correction: drop `isolation=cli` from in-process lines (or label `isolation=in-process`); omit `actual_exit` on non-spawn lines or record the observed child status.

### D7 (low, probe trust model) — C1/C2 counts trust author-supplied receipt text
- `measure.mjs` validates the commit pin and gate blob digest (`validateCommitPin`), but `selfTest.stdout`, `selfTest.exit`, `production` and `tamper` are accepted from the receipt JSON. The probe never re-runs or reproduces them. This matches the stated design (author-side evidence) but should be stated in any count as author-side, not independent. No fix proposed beyond labelling.

### D8 (low) — witness code identity uses HEAD blob, not the worktree
- `metadata-witness.py:31-32`: `current = blob(HEAD, SCRIPT)`. The digest in the snapshot equals HEAD for this file, so there is no present divergence. If the worktree is edited before the run, the witness tests HEAD bytes while the report names worktree bytes. Bounded correction: compare the worktree file's sha to the HEAD blob and fail on mismatch.

### D9 (low) — `readEntry` symlink check is final-component only
- `scripts/check-aria-metadata.mjs:257-272`: `lstatSync` and `O_NOFOLLOW` apply to the last path component only. A symlinked parent directory under `corpus/evidence/...` is followed. Not exploited by any committed path; hardening only.

## Checked and not defective (source reading)

- USER `runCount` (`check-user-round-contract.mjs:418-440`): argv-only git spawn; grep-kind exit 1 masked only as the historical 0; missing revision → `counting_command_failed`. `COUNT_REASONS` (`:92-99`) covers every reason id used; `fail()` rejects unregistered reasons (`:101-106`).
- USER shell-free counting grammar (`:367-398`): literal-only regex subset; no shell string is built.
- USER diagnostic mutant (`:953-957`): single-occurrence guard; split-count check fails closed.
- Legacy gate arguments: round-14 diagnostic baseline (5c7710d) accepts `--pstack-pin` and emits `after measurement does not match`, so the diagnostic witness's baseline arm is compatible with its pinned bytes. The bebe2ef count baseline also accepts `--pstack-pin`.
- ARIA canonical mirror tables match `corpus/evidence/round-15/metadata/mirror-contract.json` field-for-field (`:101-118` vs the JSON).
- ARIA tamper classification (`:871-970`): snapshot mismatch returns exit 2 `snapshot_tampered` with `semanticEvaluation: 'skipped'`, and runs before semantic evaluation (`:1386-1387`), for canonical paths.
- Python witness snapshot inputs equal the HEAD bytes for all listed paths (verified above), so the `untouched` precondition holds at this revision.

## Commands L1 should run after integration (not run by this report)

1. `node scripts/check-user-round-contract.mjs --self-test` and `--diagnostic-witness` (expect the reason controls; expect `count_committed_*` lines to change after D6).
2. `node scripts/check-aria-metadata.mjs --self-test` and `--witness-mirrors` (expect `cli_cases=` format; compare with D4 regex).
3. `python3 .ufo/waves/round-15/metadata-witness.py` after D2/D3 fixes; require each mirror record's failed set to equal the exact mirror id.
4. `node .ufo/waves/round-15/measure.mjs HEAD --claim C1` and `--claim C2` only after receipts exist; expect 0 until then.
5. A negative check after D1 fix: `node scripts/check-aria-metadata.mjs --check <sidecar copy whose original.receipt.path is redirected>` must exit 2.

## Tooling

No installs or updates by this agent. No pacman use. Scratch copies of legacy gate bytes were written to /var/tmp/r15-attack-readonly for source reading and removed afterwards.
