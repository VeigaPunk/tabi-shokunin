# MetadataMissing: read refusals and could-not-evaluate in `check-aria-metadata.mjs`

Seat: TabiR15.MetadataMissing (sentinel, read-only, author-side). I did not run anything: no gate, self-test, witness, counter, suite or browser, and I edited no source.

Audited bytes: `scripts/check-aria-metadata.mjs`, sha256 `ef37387217c7c0b19f936be2c5b81ebe4ea25aafcdb84bc2af5250720e4343f6`, 2263 lines. These are unmodified relative to HEAD commit `e570380d77180ab394256dd6187cac0c5eaf62ec` (checked with `git status`). All line anchors below refer to these bytes. MetadataEnforce owns this file and may move lines.

## Axes
1. Read-failure classes stay distinct: missing, symlink, non-regular, unreadable, invalid UTF-8, invalid JSON, not an object.
2. Each class maps to the right exit: could-not-evaluate is 2, semantic failure is 1.
3. Reason strings are stable and identify the input role.
4. Refusals cause zero mutation.
5. The self-test oracle can tell refusal classes apart.

## Standard being applied
- Fleet gate convention: exit 2 means could-not-evaluate. That covers missing input, parse error, bad usage and `snapshot_tampered` (`/home/vgpnk/Projects/shokunin/.ufo/waves/round-15/closure-check.py:64-71`, `/home/vgpnk/Projects/shokunin/.ufo/gates/root-ledgers.py:29-31`).
- Lane registry row `SKILL.md:1755` (aria-historical-metadata) declares "0 clean, 1 failed, 2 could-not-evaluate".
- `SKILL.md:1778` says a digest mismatch is `snapshot_tampered`, exit 2, while semantic disagreement stays exit 1.
- In-lane patterns to reuse:
  - `scripts/check-sources.mjs:70-72,154-170`: `could_not_evaluate` with details `registry_missing`, `registry_symlink_refused`, `registry_not_regular`, `registry_invalid_utf8`, plus a realpath check.
  - `.ufo/waves/round-12/w1/mistake/check-claim-record.mjs:76-101`: `input_missing`, `input_symlink_refused`, `input_not_regular`, `input_unreadable`, `input_invalid_utf8`.
- Routed defect 3 (`corpus/lessons/round-14-verifier-spotcheck.md:186`): anchor and source mismatches currently become exit-1 findings instead of `snapshot_tampered` could-not-evaluate.

## Findings

### MM-1 HIGH (calibration): no read refusal ever reaches exit 2, so the registered exit map is false in practice
- **Evidence:**
  - `readEntry` (`:158-215`) returns precise reasons: `missing`, `unreadable`, `symlink`, `not_regular`.
  - `decodeJson` (`:217-232`) adds `invalid_utf8`, `not_object` and `invalid_json`.
  - Every consumer then folds these into an ordinary `fail` finding:
    - `prepareContext` R14-ARIA-INPUT-01 (`:798-811`)
    - `evaluatePin` (`:700`)
    - `evaluateSourceIdentity` (`:626-627,642-645`)
    - `loadWorkerContext` (`:525-533`)
    - `evaluateSidecar` (`:858-883`, `sidecar_unreadable`)
  - `runCheck` maps any fail to exit 1 (`:1116-1117,1135`).
  - The only exit-2 paths in the file are usage (`:2153`), the top-level fatal handler (`:2261`) and derive-out refusal (`:1325`).
- **Exploit path:** `node scripts/check-aria-metadata.mjs --receipt /nonexistent --pin corpus/evidence/round-13/aria/runtime-pin.json` exits 1 with `verdict=red`. Static trace: INPUT, PIN binding, SOURCE, WORKER-SET, WORKER-PROOF, CLEANUP-* and NODE-* fail in cascade. That output has the same shape as a genuine semantic contradiction.
- **Impact:** A consumer counting "red" as a verified failure gets an infrastructure miss as if it were evidence. Round-14 `measure.mjs:527,537,771,785,790` rejects witnesses whose red finding is `could_not_evaluate`. That guard can never fire here, because the gate never emits that finding. The only distinction left is buried in `findings[].detail.problems`.
- **Smallest remediation:**
  1. Classify reads before evaluating anything.
  2. If any input entry or decode fails, short-circuit to `verdict=could-not-evaluate`, exit 2, finding `could_not_evaluate`, detail `<role>:<class>`, and skip the semantic evaluators.
  3. Classes: `input_missing`, `input_symlink_refused`, `input_not_regular`, `input_unreadable`, `input_invalid_utf8`, `input_invalid_json`, `input_not_object`.
  4. Keep semantic findings exit 1.

### MM-2 HIGH (calibration): `snapshot_tampered` is absent, and digest checks run after parsing and in parallel with it
- **Evidence:** `evaluateAnchors` (`:731-774`) records `receipt_sha256`, `pin_sha256` and `worker_sha256:*` as ordinary problems in R14-ARIA-ANCHOR-01. `evaluateSourceIdentity` records `manifest.currentSha256`, `spec.currentSha256` and `config.currentSha256` (`:623-645`). These run alongside the semantic evaluators in `evaluateAll` (`:826-845`).
- **Exploit path:** Flip one byte in the canonical receipt so it no longer parses. The result is INPUT-01 `receipt:invalid_json` plus ANCHOR-01 `receipt_sha256`, all exit 1. The tamper is reported as an ordinary compared verdict, which the Gate standard explicitly forbids.
- **Remediation:**
  - For each anchored input, check the digest on `entry.bytes` before `decodeJson`.
  - Anchored inputs are: `DEFAULT_RECEIPT` and `DEFAULT_PIN` at canonical paths, the manifest, spec, config, and workers by name.
  - When `entry.ok` and the digest differs from the anchor, emit `snapshot_tampered` with detail `<role>:<sha>!=<anchor>`, exit 2, and do no comparison.
  - Proposed precedence when several apply: `snapshot_tampered` > `input_missing` > `input_symlink_refused` > `input_not_regular` > `input_unreadable` > `input_invalid_utf8` > `input_invalid_json` > `input_not_object`. Emit all of them, and choose the primary deterministically in this order (integrity ranks first, matching the KQ16 pattern in `.ufo/reports/round-13/kama.md:13-17`).

### MM-3 MEDIUM (operability): reasons are lost or mislabeled
1. **Manifest:** `evaluateManifest` hardcodes `manifest:malformed` (`:659-661`). `evaluateSourceIdentity` pushes both `manifest:unreadable` and `manifest:malformed` (`:626-627`) whatever the actual reason. A missing manifest therefore reads as "malformed", and `manifestRead.entry.reason` is discarded.
2. **Pin:** `evaluatePin` never receives `pinRead.load` (`:790`). Invalid JSON or invalid UTF-8 in the pin is reported only as `pin:not_object` (`:701`), plus about 14 cascaded `pin.*` field problems (`:702-712`).
3. **Receipt:** INPUT-01 doubles and nests labels, e.g. `receipt:missing` plus `receipt:receipt.json:missing` (`:803-804`).
4. **Unstable reason tokens:** `readJson` labels with `basename(pathText)` (`:236`), so reason tokens contain a filename the caller chose (e.g. `receipt:malformed-receipt.json:invalid_json`). A committed literal-reason expectation cannot be path-independent.
- **Remediation:** Use fixed role labels (`receipt`, `pin`, `manifest`, `spec`, `config`, `worker[i]`, `sidecar`, `check-input`, `expectations`). Pass both `entry.reason` and `load.reason` through unchanged.

### MM-4 MEDIUM (calibration): other entry points also fold refusals into exit 1
- **`--check <path>`:** a missing, symlinked or non-regular input returns R14-ARIA-CHECK-INPUT-01 with exit 1 (`:2201-2221`; reason built at `:2031-2035`). It should be exit 2 with `check-input:input_*`. The semantic `sidecar:original_paths_missing` case (`:2053`) correctly stays exit 1.
- **Sidecar paths:** `--check sidecar` follows the untrusted `original.receipt.path` / `original.pin.path` from the sidecar (`:2050-2060`). If those point at missing files, the run cascades to exit 1. It should be exit 2.
- **Witness** (`:1486-1560`):
  - Unreadable before/after reads give `originalUnchanged=false` (`:1499-1505`), and `ok` requires `red.exit === 1` (`:1511`). Missing inputs give a witness exit 1 with `transition=not-demonstrated`.
  - After MM-1/MM-2 land, the witness should return 2 when either phase exits 2 or a before/after read is refused. It must not return 1.
  - The fallback at `:1490-1493` is dead: `parseArguments` always sets `sidecar = DEFAULT_SIDECAR` in witness mode (`:2132-2134`).
- **Self-test:** missing or invalid expectations returns `verdict=blocked` with exit 1 (`:1659-1677`). That is a missing input, so it should be `verdict=could-not-evaluate` with exit 2.
- **Fatal handler:** prints `verdict=red` with exit 2 (`:2252,2261`). The verdict word disagrees with the exit map; it should be `verdict=could-not-evaluate`.
- **Derive:** a missing receipt or pin falls into `shapeOk=false`, exit 1 (`:1333-1348`). It should be exit 2. Zero mutation already holds here: the write happens only after `shapeOk`, and out-path refusal returns before any read (`:1321-1330`).

### MM-5 MEDIUM (calibration): this conflicts with the committed round-14 oracle
- `corpus/evidence/round-14/aria-metadata/expected-fixtures.json`, case `malformed-receipt`, pins `expectedExit: 1`. The fleet standard classifies a parse error as exit 2.
- That round-14 file is historical evidence and must not be edited.
- **Remediation:** MetadataEnforce points `DEFAULT_EXPECTATIONS` (`:54`) at a new round-15 asset under `corpus/evidence/round-15/metadata/`, with `malformed-receipt` set to exit 2 and detail `receipt:input_invalid_json`. The supersession is recorded in the round-15 lesson; the round-14 file stays a byte-identical record.
- If instead L1 keeps parse errors at exit 1, that deviation from the standard needs an explicit SKILL row.

### MM-6 MEDIUM (operability): the self-test oracle cannot tell refusal classes apart
- `runSelfTest` asserts only `expectedFindings[].id/status` (`:1846-1852`). It records `finding` as the first expected id (`:1859`).
- A missing, symlinked, non-regular or invalid-JSON receipt all produce `R14-ARIA-INPUT-01 fail`, so each one passes the others' expectations.
- **Remediation:** expectations should carry `expectedVerdict`, `expectedFinding` and an exact `expectedDetail`. The case should pass only when `payload.verdict`, primary finding and detail match exactly. This matches the round-15 "right finding, wrong reason" bar (`SKILL.md:1779`).

### MM-7 LOW: symlink and regular-file refusal checks only the last path component
- `readEntry` uses `lstat` plus `O_NOFOLLOW` plus `fstat` (`:162-193`). That refuses a symlinked final component, but it accepts symlinked parent directories.
- There is no `realpathSync(abs) === abs` check of the kind `check-sources.mjs:157` and `check-claim-record.mjs:84` use.
- Worker refs are restricted only by prefix and the absence of `..` (`:508`), so a nested path like `workers/<sub>/worker-0-…json` is accepted. `readdirSync` checks only the top level (`:565`).
- **Impact is low:** canonical and worker bytes are digest-anchored, and copies of anchored bytes at non-canonical paths already fail (`:739-744`).
- **Remediation:** add the realpath check and refuse it as `input_symlink_refused`; require `dirname(file) === WORKER_DIR`.

### MM-8 LOW: open race, unbounded reads, and untrusted paths in summary lines
- **FIFO race:** `openSync` has no `O_NONBLOCK` (`:180`). If a FIFO is swapped in between `lstat` and `open`, the open blocks. Production has no timeout; child processes spawned by the self-test have 30 s.
- **No size cap:** `readFileSync(fd)` (`:195`) is unbounded on attacker-selected paths, including sidecar `original.*.path`.
- **Line injection:** raw path text goes into summary lines (`input=` and `sidecar=` at `:2216-2217,2236-2238`; witness `command:` at `:1527`). A path containing `\n` can forge an `ARIA_METADATA check verdict=clean` line or an `ARIA_METADATA findings` line in stdout, or in the witness `red.stdout`/`green.stdout` strings that measure-style parsers scan. Exit and JSON remain truthful.
- **Remediation:** reject control characters in path arguments as a usage error, exit 2, or print paths through `JSON.stringify`. Optionally open with `O_NONBLOCK` and add a byte cap that refuses as `input_unreadable`.

## Proposed isolated CLI tests (for MetadataEnforce's round-15 expectations)
All of these run in `mkdtemp`. Each asserts the exact exit, the `verdict` word, the primary finding and the exact detail. Each also records the sha256 of every fixture and original before and after the run, and requires them unchanged.

| id | setup | expect |
|---|---|---|
| receipt-missing | `--receipt <tmp>/absent.json --pin @pin` | 2, could_not_evaluate, `receipt:input_missing` |
| receipt-symlink | symlink in tmp to `@receipt-green` | 2, `receipt:input_symlink_refused` |
| receipt-parent-symlink | tmp/linkdir → tmp/real; receipt via linkdir | 2, `receipt:input_symlink_refused` (needs MM-7) |
| receipt-nonregular | `mkdir <tmp>/dir.json`; pass as receipt | 2, `receipt:input_not_regular` |
| receipt-invalid-utf8 | bytes `ff fe` | 2, `receipt:input_invalid_utf8` |
| malformed-receipt (supersedes R14 exit 1) | existing fixture | 2, `receipt:input_invalid_json` |
| receipt-not-object | `[]` | 2, `receipt:input_not_object` |
| pin-missing / pin-invalid-json | as above for `--pin` | 2, `pin:input_missing` / `pin:input_invalid_json` (not `pin:not_object`) |
| sidecar-missing / sidecar-symlink | `--sidecar` absent or symlink | 2, `sidecar:input_*` |
| check-input-missing | `--check <tmp>/absent.json` | 2, `check-input:input_missing` (today 1) |
| sidecar-original-path-missing | sidecar whose `original.receipt.path` is absent | 2, `receipt:input_missing` |
| witness-receipt-missing | `--witness --receipt <tmp>/absent.json …` | 2, not 1 |
| derive-receipt-missing | `--derive <tmp>/absent.json @pin --out <evidence>/x.json` | 2; out file absent afterwards (zero mutation) |
| copied-tree manifest missing / worker missing / anchored byte flip | copy the script and the anchored inputs into `<tmp>` with the same layout (ROOT = `dirname(SCRIPT)/..`, `:47-48`), mutate the copy, run the copied script | 2, `manifest:input_missing` / `worker[0]:input_missing` / `snapshot_tampered`; originals unchanged |
| semantic controls unchanged | old-contradiction, invalid-node-minimum, sidecar-wrong-direction | still exit 1, verdict red/failed (no regression into 2) |

The copied-tree approach gives isolated controls for missing canonical inputs and snapshot tampering without a production override seam and without touching the originals.

## Zero-mutation check
- Every check, witness and self-test path is read-only on originals. The self-test writes only `mkdtemp` (`:1680`) and removes it in `finally` (`:1926-1928`).
- Derive refusal precedes any write (`:1321-1330,1345`).
- The only mutation risk is a future implementation that writes on any error path. Each proposed control should assert before/after digests.

## Commands for L1 (not run by this seat)
- `node scripts/check-aria-metadata.mjs --self-test`
- `node scripts/check-aria-metadata.mjs --receipt /nonexistent --pin corpus/evidence/round-13/aria/runtime-pin.json; echo $?` (want 2 after the fix; 1 today by static trace)
- `node scripts/check-aria-metadata.mjs --check /nonexistent; echo $?` (want 2)
- `node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json; echo $?` (must stay 0 with accepted=true)
- `node scripts/check-aria-metadata.mjs --witness; echo $?` (must stay 0, original_unchanged=true)
- `git diff --exit-code -- corpus/evidence/round-13 corpus/evidence/round-14` (historical bytes unchanged)

## Tooling
No installs or updates.
