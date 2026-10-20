# ReconMeasure15 — round-15 `measure.mjs` input map, revision handling, exit codes, commit 9fd8bca

Seat: `TabiR16.ReconMeasure15-5` (scout, read-only). Round 16 / wave 1.
Lane root for every path below: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Method: read `.ufo/waves/round-15/measure.mjs` in full (1448 lines at HEAD `e38d259`), plus read-only
`git show` / `git diff` / `git rev-parse` / `jq` / two `node -e` regex checks. No gate, selftest,
counter, census, browser, or network was run. No tool installs or upgrades were needed or made.

Every claim below is tagged `[OBSERVED]` (command or source line reproduced this session) or
`[INFERENCE]` (design consequence).

---

## 0. Probe identity and shape

- Path `.ufo/waves/round-15/measure.mjs`, mode `100755`, 1448 lines at HEAD.
  Blob sha256 at HEAD `e38d259`: `dd9c8675ab9bbc91c20f501a90f898197d046d2586f12d2389a564385281251d` `[OBSERVED]`
  (`git show e38d259:.ufo/waves/round-15/measure.mjs | sha256sum`).
- `ROOT` is derived from the module's own location: `measure.mjs:158`
  `const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');` — i.e. `.ufo/waves/round-15` → lane root.
  Copying the file to `.ufo/waves/round-16/` (same depth) preserves `ROOT`; moving it one level up/down silently
  rebases every read. `[OBSERVED from source; INFERENCE for round-16 reuse]`
- The probe executes nothing but `git` (`measure.mjs:238-240`, `spawnSync('git', args, {cwd: ROOT, encoding: null,
  maxBuffer: 64 MiB})`). It never spawns a gate, checker, census, browser, or test. `[OBSERVED]`
- CLI grammar (`measure.mjs:1330-1349`): exactly one revision plus at most one of `--claim C1`, `--claim C2`,
  `--histogram`; duplicate revision, unknown extra positional, `--claim` + `--histogram`, or a missing revision
  call `usage()` (1323-1328) → exit 2. `[OBSERVED]`

---

## 1. Exact repo paths read, per invocation

### 1.1 C1 (`--claim C1`)

| Path read (at the measured revision unless noted) | Code anchor |
|---|---|
| `corpus/evidence/round-15/user-diagnostics.json` | `measure.mjs:160` const; read at `:744` |
| `scripts/check-user-round-contract.mjs` **at `receipt.revision`** | `:763` pin; `:764` `reader(pin.codeRevision).file(C1_CHECKER)` |
| `scripts/check-user-round-contract.mjs` **at the measured revision** | `validateCommitPin` `:669-694` (second `reader(revision).file(checkerPath)` at `:687`) |

The receipt read set is exactly those two paths. `countC1` (`:725-941`) additionally parses, but does not read,
`receipt.selfTest`, `receipt.production`, `receipt.schema`/`kind`, `receipt.revision`, `receipt.codeSha256`.
Gate-source static analysis at `:768-771` (`analyzeRunCount` + `SHELL_CALL`/`SHELL_TRUE`).
No other file, directory, environment variable, or network resource is consulted. `[OBSERVED]`

### 1.2 C2 (`--claim C2`)

| Path read | Code anchor |
|---|---|
| `corpus/evidence/round-15/metadata-differential.json` | `:162` const; read at `:954` |
| `scripts/check-aria-metadata.mjs` **at `receipt.revision`** | `:973` → `validateCommitPin` `:669-694` |
| `scripts/check-aria-metadata.mjs` **at `receipt.baseline`** | `:982` `reader(baseline).sha(C2_CHECKER)` |
| `scripts/check-aria-metadata.mjs` **at the measured revision** | `:687` inside `validateCommitPin` |
| every key of `receipt.snapshotInputs` (8 in the r15 receipt) | `:1073` loop; `:1086` `read.file(path)` |
| `corpus/evidence/round-14/aria-metadata/corrected.json` (must equal `C2_SIDECAR`) | `:1211-1223` |
| `corpus/evidence/round-14/aria-metadata/verification.json` | `:1227` |
| `corpus/evidence/round-13/aria/receipt.json`, `corpus/evidence/round-13/aria/runtime-pin.json` | `:1257-1260` |

Receipt-declared `snapshotInputs` keys, observed `[OBSERVED]` (`jq -r '.snapshotInputs|keys'`):

```
corpus/evidence/round-13/aria/actual/workers/worker-0-1530637-1792474958700.json
corpus/evidence/round-13/aria/aria-loopback.spec.mjs
corpus/evidence/round-13/aria/manifest.json
corpus/evidence/round-13/aria/playwright.config.mjs
corpus/evidence/round-13/aria/receipt.json
corpus/evidence/round-13/aria/runtime-pin.json
corpus/evidence/round-14/aria-metadata/corrected.json
scripts/aria-loopback-round13.mjs
```

`receipt.originalsUnchanged` carries the same 8 keys but only booleans; digests are drawn from
`snapshotInputs` (`:1251-1266`). `[OBSERVED]`
Note: `corpus/evidence/round-14/aria-metadata/verification.json` is read directly at `:1227` and is **not** in
`snapshotInputs` — it is a distinct, un-digested-in-map input. `[OBSERVED]`

### 1.3 `--histogram`

| Path | Code anchor |
|---|---|
| `corpus/SOURCES.md` (parses only the `## Registry` table; cells[3]=tier, cells[7]=status) | `:1282`, `sourceHistogram` `:1276-1305` |
| `corpus/README.md` (literal search for `knowledge/<name>`) | `:1312`, `noteMap` `:1307-1317` |
| listing of `corpus/knowledge/` (only `corpus/knowledge/<name>.md`, top level) | `:1308` `read.list('corpus/knowledge')` |

### 1.4 No-flag (both claims)

Union of 1.1, 1.2, 1.3; `errors` merged and sorted, `reasons` merged (`:1407-1434`). `[OBSERVED]`

Nothing under `.ufo/waves/` is read by the probe itself; the counter path is bound only by the *manifest*
that cites it, never by the probe. `[OBSERVED]`

---

## 2. Revision handling

1. **CLI revision** (`resolveRevision`, `:242-251`): rejects empty, `-`-prefixed, or whitespace-containing
   arguments (exit 2); resolves with `git rev-parse --verify <arg>^{commit}`. Abbreviations and any
   rev-parse-able commitish are accepted on the command line. `[OBSERVED]`
2. **One binding per run** (`reader(revision)`, `:280-287`): `file`/`sha`/`list` are all evaluated at that single
   revision; `fileAt` (`:262-268`) first requires `git ls-tree -r <rev> -- <path>` to report a regular-file mode
   `100644`/`100755` (symlinks `120000` and directories return `null`), then `git show <rev>:<path>`.
   A committed **zero-byte** blob is treated as missing (`stdout && stdout.length ? … : null`). `[OBSERVED]`
3. **Receipt-supplied revisions** (`resolveCommitish`, `:314-319`) must be exactly 40 lowercase hex
   (`/^[a-f0-9]{40}$/`); branch/tag names in a receipt are rejected. `[OBSERVED]`
4. **Ancestry**: `receipt.revision` must be ancestor-or-equal of the measured revision
   (`merge-base --is-ancestor`, `:321-323`, used at `:676`). It does **not** need to equal the measured revision. `[OBSERVED]`
5. **Anti-staleness (the r15 fix that mattered)**: `validateCommitPin` (`:669-694`) requires
   `receipt.codeSha256` to equal the gate blob at `receipt.revision` **and** at the measured revision;
   otherwise `checker_source` / `checker_stale`. `[OBSERVED]`
6. **C2 baseline** (`:977-990`): `baseline` must resolve as 40-hex, be an ancestor of `receipt.revision`, and
   `reader(baseline).sha(C2_CHECKER)` must equal `oldCodeSha256` **and differ from** `codeSha256`. `[OBSERVED]`
7. Git is invoked with `cwd: ROOT` and inherits the caller's environment. The probe sets **no** git env
   (`GIT_CONFIG_NOSYSTEM`, `GIT_NO_REPLACE_OBJECTS`, …). The recorded runs pin that externally in
   `environmentPolicy` (e.g. `corpus/evidence/round-15/count-after-c1.json`), not in the probe. `[OBSERVED]`

---

## 3. Exit codes

`emit` (`:1365-1371`) writes the JSON object to stdout **first**, then, only if `errors.length > 0`, writes
`MEASURE verdict=failed errors=N` to stderr and sets `process.exitCode = 1`. Exit 0 is implicit.
Top-level catch (`:1436-1447`) writes `MEASURE verdict=could-not-evaluate detail=<message>` and exits
`error.exit ?? 2`. `[OBSERVED]`

| Condition | stdout | stderr | exit |
|---|---|---|---|
| Clean claim(s)/histogram | JSON, `errors: []` | — | **0** |
| Any check error | JSON with populated `errors` | `MEASURE verdict=failed errors=N` | **1** |
| Missing receipt | JSON `…count:0`, `reasons:[…]`, `errors:[]` | — | **0** (deliberate) |
| Bad usage / unresolvable revision | nothing | `MEASURE verdict=could-not-evaluate detail=…` | **2** |
| Unexpected throw | nothing | same | **2** (or `error.exit`) |

Observed instances `[OBSERVED]`:

- `corpus/evidence/round-15/count-after-c2.json`: `exit 1`, `stderr "MEASURE verdict=failed errors=14"`,
  and stdout is still a complete JSON object (so a consumer must check the exit code, not just parse stdout).
- `corpus/evidence/round-15/count-after-c1.json`: `exit 0`, `stderr ""`, `c1_truthful_diagnostics:1`.
- `corpus/evidence/round-15/count-after-c2-repaired.json`: `exit 0`, `c2_enforced_contract:1`, 0 errors.
- `corpus/evidence/round-15/histogram-after.json`: `exit 0`, rows 29 (A23/B4/C2; mined24/queued3/rejected2),
  notes 32/32 mapped.

Design-relevant consequences `[INFERENCE]`:

- A missing receipt is *not* a failure: the pre-measurement 0 and "evidence deleted" both exit 0. A binding
  gate therefore must compare the **count field**, exactly as the round-16 `--reproduce` contract plans
  (`count_not_reproduced`), and must not treat exit 0 as green.
- `--histogram` can never exit non-zero: `run` passes `[]` to `emit` (`:1415`) and both histogram readers
  return zeroed objects when files are absent (`:1276-1317`). Histogram drift is invisible unless values are compared.
- In default (no `--claim`) mode, a red C1 and a green C2 still exit 1; per-claim invocation is what isolates
  the two counters (the round-15 receipts confirm this is how they were run).

---

## 4. Commit `9fd8bca` — exactly what changed

`[OBSERVED]` Identity/scale:

```
git -C <lane> show --stat 9fd8bca
  parent: b7cf0446a31014a81b4882857c90c565ebc14210   (NOT 27dfd98)
  subject: round-15: parse actual ARIA evidence without changing outcomes
  10 files changed, 278 insertions(+), 16 deletions(-)
  measure.mjs 26 insertions(+), 9 deletions(-); 1431 → 1448 lines
```

The requested `git diff 27dfd98 9fd8bca -- .ufo/waves/round-15/measure.mjs` and the isolated
`git diff b7cf044 9fd8bca` are **byte-identical** (the file did not change at b7cf044; sha256 is
`3ee59de0…` at both 27dfd98 and b7cf044). Three functional hunks, all in the C2 consumer; C1 parsing is untouched.

### Hunk A — underscore prefix in `caseLineList` (`:335-341`)

```diff
-    .filter(line => /\bSELFTEST\b/.test(line)
+    .filter(line => /SELFTEST\b/.test(line)
```

`_` is a word character, so `\bSELFTEST` can never match `ARIA_METADATA_SELFTEST`. Proven on a real ARIA line
`[OBSERVED]`:

```
node -e '... line="ARIA_METADATA_SELFTEST result=PASS case=x expected_exit=0 actual_exit=0" ...'
old_boundary= false
new_prefix= true
```

Same check against the committed receipt `corpus/evidence/round-15/metadata-differential.json`
(`.selfTest.stdout`): `old_caseLines= 0`, `new_caseLines= 36` `[OBSERVED]`.
Consequence before the fix: `self_test_no_cases`, `self_test_no_mirror_cases`, `self_test_no_snapshot_case`.

### Hunk B — only failed payload findings count (`isFailedFinding` `:555-560`, `findingIdsOfValue` `:562-576`)

Old code `flatMap`ped every payload finding into the id set, so the 26 passing predicates in each `after`
payload were counted as extra "non-acceptance findings" and every mirror tripped `mirror_finding`.
New code drops entries whose `status` is `pass` or whose `ok` is `true`, and filters arrays before mapping. `[OBSERVED from diff]`

Ground truth in the r15 receipt `[OBSERVED]`:

```
mirrors[0].after.payload.findings: 26 status=pass, 2 status=fail
all mirrors: 234 pass, 18 fail (2 per mirror)
non-pass ids: R14-ARIA-SIDECAR-CLEANUP-MIRROR-01 (field failure),
              R14-ARIA-SIDECAR-ACCEPTED-01 (acceptance summary, ignored by /accepted/i filter)
```

Before: `c2_mirrors.refused: 0` and exactly 9 `mirror_finding` errors. After: `refused: 9`, no mirror errors.

### Hunk C — C2 self-test summary parse (`:1015-1022`)

```diff
-    const summaryLine = (/^ARIA_METADATA_SELFTEST\b[^\n]*\bverdict=[^\s]+/m.exec(text) || [])[0] ?? null;
-    const summaryTokens = summaryLine ? tokensOf(summaryLine) : new Map();
-    const summaryClean = summaryTokens.get('verdict') === 'clean';
-    const cliCases = Number(summaryTokens.get('cli_cases'));
-    const helpers = Number(summaryTokens.get('helpers'));
+    const summaryLine = text.split('\n').map(l => l.trim())
+      .find(l => l.startsWith('ARIA_METADATA_SELFTEST') && /\bverdict=clean\b/.test(l)) ?? null;
+    const cliMatch = summaryLine ? /\bcli_cases=(\d+)\b/.exec(summaryLine) : null;
+    const helperMatch = summaryLine ? /\bhelpers=(\d+)\b/.exec(summaryLine) : null;
```

The old match stopped at the end of the **first token** it could satisfy, so `cli_cases`/`helpers` never entered
the token map. Proven on the committed receipt `[OBSERVED]`:

```
old_summaryLine= "ARIA_METADATA_SELFTEST verdict=clean"
old_verdict= clean  cli= undefined  helpers= undefined
```

The real line is `ARIA_METADATA_SELFTEST verdict=clean cli_cases=36 helpers=4` (`:1` of `.selfTest.stdout`).
Before: two `self_test_summary` errors (both NaN). After: `cli_cases=36`, `helpers=4`, `36+4 >= 36 case lines`.

### Net observed effect of 9fd8bca

`count-after-c2.json` (HEAD-of-file before the fix, at `b7cf044`) `[OBSERVED]`:

```
exit 1, stderr "MEASURE verdict=failed errors=14"
errors: mirror_finding ×9, self_test_no_cases, self_test_no_mirror_cases,
        self_test_no_snapshot_case, self_test_summary ×2
c2_enforced_contract: 0, c2_mirrors.refused: 0, canonical: 1, snapshot.exit: 2
```

`count-after-c2-repaired.json` `[OBSERVED]`: `exit 0`, `c2_enforced_contract:1`, `refused:9`, errors `[]`.

Not changed by 9fd8bca: revision pinning, `validateCommitPin`, path constants, thresholds
(`MIN_SELFTEST_CASES`, `REQUIRED_MIRRORS`, `COUNT_REASONS`, `USER_FINDINGS`), exit codes, C1 parsing.
The commit also added `LOG.md`, the two counter receipts, `final-production.json`, `histogram-after.json`,
the round/user production records, `wrapup-misroot.json`, and updated `w1/MeasureContracts.md`.

---

## 5. The measurement-identity defect these facts establish (inputs to `countedInputs`)

`[OBSERVED]` Counter blob digests:

```
27dfd98 3ee59de095750e08fc719ed19eb5baea02caf443df05479d24897783240fe384
b7cf044 3ee59de095750e08fc719ed19eb5baea02caf443df05479d24897783240fe384
9fd8bca dd9c8675ab9bbc91c20f501a90f898197d046d2586f12d2389a564385281251d
36240c7 dd9c8675ab9bbc91c20f501a90f898197d046d2586f12d2389a564385281251d
e38d259 dd9c8675ab9bbc91c20f501a90f898197d046d2586f12d2389a564385281251d
```

`corpus/evidence/round-15/measurements.json` (schema `tabi-round15-measurements-v1`) `[OBSERVED]`:

- top level: `measuredRevision: b7cf044…`, `executedCodeRevision: 27dfd98…`; **no** counter digest.
- `C1.counterCodeRevision: 27dfd98…`; **no** `counterSha256` at all.
- `C2.counterCodeRevision: 9fd8bca…`; `counterSha256: dd9c8675…`.
- `C1.count: [0,1]`, `C2.count: [0,1]`; both `after` commands run against `b7cf044…`.

So the two claims in one manifest were produced by **two different counter blobs** (`3ee59de0` for C1,
`dd9c8675` for C2), and neither pin says "this counter at this measured revision". Re-running the cited C1
argv at HEAD now executes `dd9c8675`, a counter the C1 receipt was never measured with. This is exactly the
routed defect wording at `corpus/lessons/round-15-verifier-spotcheck.md:120-121` (counter identity; measured
revision vs delivered HEAD).

The **gates themselves did not drift** `[OBSERVED]`:

```
scripts/check-user-round-contract.mjs  27dfd98 f9be3a726c3d58d1cff07ffe260fb71a37f4bc156b5f8df8bf6be98b15518e7b
                                       e38d259 f9be3a726c3d58d1cff07ffe260fb71a37f4bc156b5f8df8bf6be98b15518e7b
scripts/check-aria-metadata.mjs       27dfd98 d707625ef967ff0c8bf041ebb0ec70b73b76a1c04d6cc95101c79a110c4a600b
                                       e38d259 d707625ef967ff0c8bf041ebb0ec70b73b76a1c04d6cc95101c79a110c4a600b
```

Both receipts' `revision`/`codeSha256` still validate at HEAD; the unbound object was the **consumer**.
This is the concrete failure mode the round-16 `counter.sha256` + `countedInputs` pair must close.

---

## 6. Requirements this imposes on the round-16 `countedInputs` design

`[INFERENCE]` derived from the read set in §1 and the defect in §5.

1. **Declare the receipt path, not just the gate.** Receipt bytes are read at the measured revision and are
   not digest-bound anywhere else. Editing a receipt after measurement changes the count but leaves every
   declared digest intact.
2. **Declare every gate path the probe hashes.** C1: `scripts/check-user-round-contract.mjs`.
   C2: `scripts/check-aria-metadata.mjs` (hashed at receipt revision, baseline, and measured revision).
3. **C2's dynamic `snapshotInputs` cannot be enumerated statically from the manifest.** Two honest options:
   list the 8 concrete paths as they exist at authoring time (the receipt itself is then the drift detector:
   adding/removing a map entry changes the receipt file, which is a declared input), or declare directory
   prefixes `corpus/evidence/round-13/aria/` and `corpus/evidence/round-14/aria-metadata/` plus
   `scripts/aria-loopback-round13.mjs`. `git diff --name-only A B -- <prefix>` covers prefixes, per the
   planned gate contract.
4. **`corpus/evidence/round-14/aria-metadata/verification.json` is read but absent from `snapshotInputs`.**
   It must be declared explicitly for C2 or it stays unbindable by the current counter.
5. **Histogram inputs are separate:** `corpus/SOURCES.md`, `corpus/README.md`, `corpus/knowledge/`.
   If round 16 measures `--histogram` as a claim, these three are its `countedInputs`; r15's manifest
   omitted them and recorded only before/after numbers.
6. **`countField` must match the new counter's real JSON key.** r15's keys are
   `c1_truthful_diagnostics` and `c2_enforced_contract`; the PLAN's example manifest says
   `c1_binding_contracts`. The round-16 counter is a different file, so this is a naming contract between
   `MeasureCounters` and `BindCore`, not a forced reuse — but `--reproduce` will report `count_not_reproduced`
   if the manifest names a key the counter does not emit.
7. **`measuredRevision == REV` makes `counted_input_changed` vacuous** (`git diff` is empty). The digest of
   the counter and the `--reproduce` count are then the only guard, which is why the counter digest must exist
   for *every* claim (r15 recorded it for C2 only).
8. **Counter identity is per claim.** A single manifest-wide `counterCodeRevision` is insufficient whenever
   different claims were produced by different counter blobs — as r15 shows. The planned per-claim
   `counter: {path, sha256, argv, countField}` shape is the correct granularity.
9. **`counter.path` is not an input.** The r15 probe reads nothing under `.ufo/waves/`; its own bytes matter
   only through the manifest digest, not through `countedInputs`.

---

## 7. Remaining unknowns

- I did not execute `measure.mjs` at any revision (read-only lane contract). Exit-code behavior in §3 is read
  from the code and corroborated by three committed run receipts; no fresh run was made.
- Whether `git show <40hex>:<path>` honours replace refs in a hostile local config is untested. The probe does
  not set `GIT_NO_REPLACE_OBJECTS`; the recorded runs only pinned it in their external `environmentPolicy`.
- The C1 gate-source heuristics are formatting-coupled (`functionBody` ends at the first column-zero `}`,
  `:598-621`; quoted `-c` anywhere in non-comment lines trips `shell_execution`, `:770`). Their sensitivity to
  future gate edits is not measured here; it reinforces treating the gate path as a counted input.
- Round-16 `scripts/check-measurement-binding.mjs` does not exist yet at this revision, so its legacy-mode
  handling of r15's `C2.counterSha256` vs `C1`'s missing digest is unverified.
