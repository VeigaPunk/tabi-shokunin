# ReceiptSecurity — round-14 w1 (sentinel, read-only)

Scope: the C2 metadata checker `scripts/check-aria-metadata.mjs` and the round-13 aria evidence it reads.
Threat model: malformed JSON, symlinks, source-hash tampering, path drift. I made no edits outside this
report, ran no checks or self-tests, and installed no tools. When I wrote this, the checker,
`corpus/evidence/round-14/**`, and `.ufo/waves/round-14/measure.mjs` did not exist yet, so the findings
below come from the historical evidence and the old runner. They are also the contracts the new checker
must meet. I sent the contracts to `TabiR14.ReceiptRepair` by direct message.

## Observed facts (read-only: `sha256sum`, `git ls-files -s`, `git status`, `git config --local`, `find -type l`)

- HEAD = baseline `bebe2efc4565bb068efd905e9ef78011bb6b4efd`. `git status --short` is clean for `corpus/evidence/round-13` and `scripts`.
- There is no `.gitattributes`, and `git check-attr -a` on the receipt is empty. So working-tree bytes equal blob bytes (no eol or filter rewriting), and a file sha256 is a valid anchor for the committed content.
- `.git/config` (local) has no hooks path, filters, or textconv.
- Working-tree sha256 values (all committed, mode 100644 except the runner, which is 100755):
  - `corpus/evidence/round-13/aria/receipt.json` → `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7` (blob `eea79f8a`)
  - `corpus/evidence/round-13/aria/runtime-pin.json` → `4d8947564ee911a18ff2b931b8628910edada4781024fa40008d87e3cd16ccd2` (blob `41f35e54`). This equals `receipt.runtime.pinned.pinSha256` at receipt.json:37.
  - `corpus/evidence/round-13/aria/actual/workers/worker-0-1530637-1792474958700.json` → `0d0f00e214c92f9e0b83b704e3488ff17a58c5141d2cd788cf337d599603a5e7` (blob `432a1651`)
  - `scripts/aria-loopback-round13.mjs` → `1d54c9e98a85022c4382d0a0eeb16e15f0256b7f561329258e7ca77152e4af9c`. This equals receipt.json:8 and :13, and worker:12 and :17.
  - manifest `56764241…2112`, spec `03cb4e17…e4fc`, and config `87ae779b…b3f4` all equal the receipt's recorded values. The note `a720f541…c9` equals receipt.json:445.
- Symlinks under `corpus/evidence/round-13` and `scripts`: only `aria/node_modules/.bin/playwright{,-core}`. Both are gitignored (`aria/.gitignore`: `node_modules/`, `artifacts/`) and are not C2 inputs.

## Defect being corrected (root cause, not a new finding)

- `scripts/aria-loopback-round13.mjs:605` has inverted semantics: `listeningAfter: serverProofs.every((proof) => proof.listeningAfter === false)` sets the value to `true` exactly when every worker reported not listening. That is how receipt.json:2521 says `"listeningAfter": true`, while the only proof says `false` at receipt.json:2529, receipt.json:656, and worker.json:2377.
- Node: receipt.json:20 observed `26.12.0`. The pin at runtime-pin.json:15-16 has `recorded 24.21.0` and `minimumMajor 20`. The runner never compares Node (lines 388-403 only cover Playwright, Chromium, and the browser version). So `pinned.matched: true` (receipt.json:38) is silent on Node and must not be read as a Node match.

## Findings (severity · exploit path · evidence · impact · smallest remediation)

### RS-1 · HIGH · Original receipt does not digest-bind the worker proof
- **Exploit path:** Edit `cleanup.server.listeningAfter` in the worker file (or swap the file at the same path). The receipt still verifies, because `receipt.workers[0]` (receipt.json:2365-2385) stores only `file`, `worker`, and summary booleans, with no sha256. If a derive step trusts the worker file, it can then emit `listeningAfter=false` from forged proof. The reverse also works: corrupt the proof so a correct derive refuses.
- **Evidence:** No `0d0f00e2…` or `432a1651…` appears anywhere in the lane except as computed above. A grep for the worker path finds only `file` fields.
- **Impact:** The C2 correction would be derived from an unbound input, which is fabricated provenance.
- **Remediation:** Put the worker sha256 above into the checker as a code constant, alongside the receipt, pin, and runner constants. Never accept anchor digests from the CLI or the environment. The sidecar records all four digests. Cross-check that the worker `cleanup.server` deep-equals both receipt copies: `receipt.server.perWorker[i].proof` (receipt.json:652-660) and `receipt.cleanup.server.perWorker[i]` (receipt.json:2525-2533).

### RS-2 · HIGH · `--out` can overwrite the byte-pinned original
- **Exploit path:** Run `--derive … --out corpus/evidence/round-13/aria/receipt.json`, or pass an `--out` whose parent is a symlink into round-13. This replaces the receipt that C2 requires to stay byte-for-byte.
- **Impact:** It destroys the retained original and silently turns the correction into a rewrite.
- **Remediation:** `--out` must be a relative path that resolves (after `realpath` of the parent) strictly inside `corpus/evidence/round-14/aria-metadata/`. `lstat` the parent chain and refuse symlinks. Write with `writeFileSync(out, bytes, { flag: 'wx' })`, which refuses to overwrite an existing file.

### RS-3 · MEDIUM · Symlink and TOCTOU substitution of inputs
- **Exploit path:** Replace `runtime-pin.json` or the worker file with a symlink to an attacker JSON. Alternatively, swap the file between hashing it and parsing it when the code calls `readFileSync` twice.
- **Remediation:** For every input, `openSync(p, O_RDONLY | O_NOFOLLOW)`, then `fstatSync(fd).isFile()`, then read the bytes from that fd. Hash and `JSON.parse` the same buffer, exactly once. An `lstat` symlink or a non-regular file is a finding (suggested ID `input-not-regular-file`).

### RS-4 · MEDIUM · Path drift in the worker set
- **Exploit path:** The old runner's `listJson()` (runner:161-170) globs `actual/workers/*.json`. A stale or planted worker file then joins the set. The earlier run's receipt `corpus/evidence/round-13/aria-second-receipt.json:2345,2365` names two worker files that no longer exist, which shows the directory drifts between runs. A `receipt.workers[].file` of `../../…` or an absolute path escapes the lane.
- **Remediation:** The worker set is exactly `receipt.workers[].file`, with no readdir. Reject absolute paths, any `..` segment, and any prefix other than `corpus/evidence/round-13/aria/actual/workers/`. The basename must match `^worker-(\d+)-(\d+)-(\d+)\.json$`, with groups 1 and 2 equal to `worker.index` and `worker.pid` (`"0"` and `1530637`). Require `n ≥ 1` and `n == summary.workers (2610) == cleanup.server.perWorker.length == server.perWorker.length`. Each file must exist (fail closed, `worker-missing`). The `--derive OLD_RECEIPT OLD_PIN` arguments are advisory paths: the code constants are authoritative, and a mismatch is a finding.

### RS-5 · MEDIUM · Malformed or ambiguous JSON and non-boolean fields
- **Exploit path:** Duplicate keys (`{"listeningAfter":true,"listeningAfter":false}`), because `JSON.parse` keeps the last one. String `"false"`, `0`, or `null` values that pass a truthiness check. A missing `perWorker`, or an empty array where `every()` returns true vacuously.
- **Remediation:** The digest constants (RS-1) close the duplicate-key hole for the real inputs. For structure, use `Object.hasOwn` and `typeof v === 'boolean'` on every field. Each proof must satisfy `closed===true`, `listeningBefore===true` (the probe can detect listening), `listeningAfter===false`, `refusedAfterClose===true`, `closeError===null`, and `refusalDetail==='ECONNREFUSED'`. A refusal alone is not "not listening"; both fields are required. An empty or missing array is a finding (`perWorker-empty`). A `JSON.parse` throw is a finding (`json-malformed`), never a skip.

### RS-6 · MEDIUM · Stale or overstated Node claim
- **Exploit path:** The sidecar copies `pinned.matched: true` or says "Node pinned". That reads as an exact Node 24.21.0 match, but the observed version was 26.12.0.
- **Remediation:** Parse `receipt.runtime.node` and every worker's `runtime.node` (worker.json:24) strictly with `/^(\d+)\.(\d+)\.(\d+)$/`, and require them to agree. Emit `{observed:"26.12.0", recorded:"24.21.0", exactRecordedMatch:false, minimumMajor:20, minimumMajorSatisfied:true}`. Do not emit any `matched` key for Node. If `pin.node.recorded` or `minimumMajor` is missing or has the wrong type, that is a finding.

### RS-7 · LOW · Fail-closed ordering versus self-test observability
- **Risk:** If the checker stops at the first digest mismatch, every mutated fixture reports only `digest-mismatch`. The self-test then cannot show that the structural checks (RS-4 to RS-6) exist. The obvious workaround, a CLI flag that overrides the anchors for fixtures, would itself bypass RS-1.
- **Remediation:** Run every check and collect all findings, and exit non-zero if any finding exists. Self-test fixtures are mutated copies of the real bytes in an `mkdtemp` dir (removed afterwards). Each fixture asserts that its specific finding ID appears in the list, alongside `digest-mismatch`. The positive fixture is an unmodified byte copy and must exit 0 with zero findings. No anchor override exists.

### RS-8 · LOW · The sidecar must not imply new execution, and must be reproducible
- **Remediation:** Make the sidecar deterministic, with no wall-clock field, or with one excluded from comparison. Verifying it then means re-deriving it into a temp path and comparing byte-equality. It states `executed:false` and `derivedFrom` the static receipt/worker/pin bytes with their sha256 values, and records the checker's own sha256. It makes no new browser or server claim. `listeningAfter:false` appears only when RS-1 through RS-5 all pass.

## Contract for MeasureClaims (C2 count 0→1)

C2 counts 1 only if all of these hold:
- The sidecar under `corpus/evidence/round-14/aria-metadata/` exists in git at REV and is read via `git cat-file blob REV:<path>` through `execFile` with an argument array. That is not a shell, and `cat-file blob` bypasses textconv and filters.
- Its four input digests equal the constants above.
- The four round-13 blobs at REV still hash to those constants, so the original is retained byte-for-byte.
- The committed checker receipt records `exit 0`, `findings: []`, a checker sha256 equal to the blob at REV, and a sidecar sha256 equal to the blob at REV.

If the evidence is missing, the count is 0. If it is present but malformed, the gate fails; it must not count 0 instead.

## Commands for L1 (after ReceiptRepair lands; I ran none of these)

```
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
sha256sum corpus/evidence/round-13/aria/receipt.json corpus/evidence/round-13/aria/runtime-pin.json corpus/evidence/round-13/aria/actual/workers/worker-0-1530637-1792474958700.json scripts/aria-loopback-round13.mjs   # expect b458b351…, 4d894756…, 0d0f00e2…, 1d54c9e9…
git diff --exit-code bebe2efc4565bb068efd905e9ef78011bb6b4efd -- corpus/evidence/round-13 scripts/aria-loopback-round13.mjs
node scripts/check-aria-metadata.mjs --self-test
node scripts/check-aria-metadata.mjs --derive corpus/evidence/round-13/aria/receipt.json corpus/evidence/round-13/aria/runtime-pin.json --out "$(mktemp -u -p corpus/evidence/round-14/aria-metadata rederive-XXXX.json)"   # then cmp against the committed sidecar, then rm the temp file
node scripts/check-aria-metadata.mjs --derive corpus/evidence/round-13/aria/receipt.json corpus/evidence/round-13/aria/runtime-pin.json --out corpus/evidence/round-13/aria/receipt.json   # must exit non-zero; receipt sha unchanged
```

Red controls the self-test must cover, by finding ID:
- `json-malformed`
- `field-not-boolean` (`"false"` string)
- `perWorker-empty`
- `proof-contradiction` (`listeningAfter:true` together with `refusedAfterClose:true`)
- `input-not-regular-file` (symlinked pin)
- `worker-path-escape` (`../`)
- `worker-missing`
- `digest-mismatch` (one byte flipped)
- `node-version-malformed`
- `out-outside-round14`
- `out-exists`

Residual risk, out of scope: someone with commit rights who rewrites both the baseline blobs and the checker constants in the same commit. Separating claim C1 from C2 relies on L1 checking that the constants match the baseline `bebe2ef`, not just HEAD.
