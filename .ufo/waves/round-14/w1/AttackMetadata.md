# AttackMetadata — C2 historical ARIA receipt derivation (round 14, w1)

Role: critic. Read-only. I edited no code, receipt, pin, or sibling file, and ran no build, test, lint, format, smoke, self-test, or browser. When I wrote this, the new checker
`scripts/check-aria-metadata.mjs` and `corpus/evidence/round-14/aria-metadata/` did **not exist**. Glob shows both paths missing, so I attacked the historical cases directly. I sent the findings to `TabiR14.ReceiptRepair` by direct message.

Tool installs: none.

## Axes

A1 proof completeness (empty or dropped workers) · A2 boolean consistency (contradictory worker fields) · A3 refusal vs listening separation · A4 source/digest binding (substitution) · A5 Node claim truthfulness (stale or substituted) · A6 sidecar determinism, and whether it only corrects or also expands.

## Measured facts (commands run read-only during this review)

| Item | Value | How |
|---|---|---|
| receipt `corpus/evidence/round-13/aria/receipt.json` | sha256 `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7`, 97073 B; identical at `837b33a` and HEAD; absent at `9c547dd` | `sha256sum`, `git show <c>:… \| sha256sum` |
| pin `…/aria/runtime-pin.json` | `4d8947564ee911a18ff2b931b8628910edada4781024fa40008d87e3cd16ccd2`, 1154 B (= `receipt.runtime.pinned.pinSha256`) | same |
| runner `scripts/aria-loopback-round13.mjs` | `1d54c9e98a85022c4382d0a0eeb16e15f0256b7f561329258e7ca77152e4af9c` (= `receipt.sourceSha256` = `source.sha256`); unchanged `9c547dd`→HEAD | same |
| spec `…/aria/aria-loopback.spec.mjs` | `03cb4e17d3b02785335dfd55df4717fbe18edf637d7defe043f8328ba9d7e4fc` (= `source.specSha256`) | same |
| only worker file `…/aria/actual/workers/worker-0-1530637-1792474958700.json` | `0d0f00e214c92f9e0b83b704e3488ff17a58c5141d2cd788cf337d599603a5e7`; **no digest for it appears anywhere in the receipt** (`receipt.workers[0]` has only `file`) | `sha256sum`, `jq .workers` |
| aggregate vs raw | `cleanup.server.listeningAfter: true`; `cleanup.server.perWorker[0].listeningAfter: false` | `jq` |
| three proof copies | `cleanup.server.perWorker[0]`, `server.perWorker[0].proof`, and worker-file `.cleanup.server` have the same canonical hash: `dabc2cc3a41664e96cba9c1b2e5e7aa98162b37c8037e4cecf36f52d655d7e43` | `jq -S -c … \| sha256sum` |
| Node | `receipt.runtime.node` = worker `runtime.node` = `26.12.0`; `pin.node.recorded` `24.21.0`, `minimumMajor` 20; `runtime.pinned.matched: true` | `jq` |
| the node on my shell's PATH | `/run/user/1000/fnm_multishells/4118_1792460978869/bin/node` → `v24.21.0` | `command -v node; node --version` |

## Findings (counterexample → evidence → impacted axes → smallest safe correction)

### F1 — Worker-set completeness is circular, so the code that drops workers is the same code that counts them (A1)
- **Counterexample:** a worker crashes and writes a truncated or wrong-schema JSON file. The runner drops it at `scripts/aria-loopback-round13.mjs:321-323` (`.filter(entry => entry.data && entry.data.schema === …)`). It is then missing from both `workers.length` and `summary.workers`/`workerRestarts` (`:646-647`, both derived from the filtered set). The check `serverProofs.length === workers.length` (`:442`) holds over the survivors only. A worker with no `cleanup.server` is also dropped by `.filter(Boolean)` (`:439`), and in that case the aggregates `closed`/`refusedAfterClose` at `:604/:606` stay `true` over the remaining proofs.
- **Empty case:** with `[]` proofs, `[].every(...)` is `true` in JS. The runner guards with `length > 0`, but a checker that reimplements the predicate without that guard would vacuously "support" `listeningAfter=false`.
- **Correction:** the checker should require all of the following:
  - `receipt.workers.length === summary.workers === cleanup.server.perWorker.length === server.perWorker.length >= 1`.
  - Each `receipt.workers[i].file` exists as a regular, non-symlink file under `corpus/evidence/round-13/aria/actual/workers/`.
  - That directory holds **exactly** that set of `*.json` files, counted without any schema filter. Today that is 1 file.
  - The union of the `localCases` lists equals the manifest's 8 expected cases, with no duplicates.
  - An empty proof list is a hard finding, never a vacuous pass.

### F2 — The three proof copies must be checked against each other and against the worker identity (A1, A4)
- **Counterexample:** a forged sidecar or receipt edits only `cleanup.server.perWorker[0]` and leaves `server.perWorker[0].proof` and the worker file alone, or the reverse. A checker that reads only one copy accepts it.
- **Correction:** all three copies must be canonically deep-equal (today they share hash `dabc2cc3…`). `(index, pid)` must match across `receipt.workers[i].worker`, `server.perWorker[i].worker` and the worker file's `.worker` (today `{"index":"0","pid":1530637}`).

### F3 — Contradictory worker booleans: `closed` is weaker than it looks (A2)
- **Evidence:** spec `aria-loopback.spec.mjs:484` runs `SERVER.close(() => resolvePromise())`. The callback's error argument is **discarded**, so `closed = true` (`:485`) even when Node reports `ERR_SERVER_NOT_RUNNING`. `closeError` is filled only on a thrown exception. A proof `{listeningBefore:false, closed:true, listeningAfter:false}` therefore describes a server that never listened, not a teardown.
- **Correction:** derive the corrected value only when, for every proof:
  - each field is strictly of type boolean;
  - `listeningBefore === true` and `closed === true`;
  - `closeError === null`;
  - `listeningAfter === false`.
- **Reject these combinations:**
  - `listeningAfter: true` together with `ECONNREFUSED`;
  - `listeningAfter: false` together with a `refusalDetail` other than `"ECONNREFUSED"`;
  - any listening field that is a string, number or `null`, e.g. `"false"`, `0`, `null`.

### F4 — Refusal is not listening (A3)
- **Evidence:** spec `:491-497`. **Any** rejected fetch sets `refusedAfterClose = true`, including the `AbortSignal.timeout(T.serverRefusalMs)` `TimeoutError`, which happens when a server still listens but hangs. Only `refusalDetail` tells the cases apart.
- **Correction:**
  - The corrected `listeningAfter` must come **only** from the raw `listeningAfter` samples (`Server.listening`, spec `:490`), never from `refusedAfterClose`.
  - Refusal is a separate qualified fact, true only when `refusedAfterClose === true && refusalDetail === "ECONNREFUSED"`.
  - Self-test fixtures should include `{listeningAfter:false, refusedAfterClose:true, refusalDetail:"TimeoutError"}`, which must be rejected or qualified. They should also include `{listeningAfter:false, refusedAfterClose:false}`: the correction is still raw-supported, but cleanup must not be called green.

### F5 — Digest substitution: the receipt's source provenance is self-reported (A4)
- **Evidence:** `receipt.inputs[kind=source].expectedSha256` and `[kind=runtime-pin].expectedSha256` are both `null`. Only the `actualSha256` values the runner wrote are present. Someone who edits the runner plus `sourceSha256`/`source.sha256`/`inputs[].actualSha256` consistently passes any check that only compares receipt fields with each other or with working-tree bytes.
- **Correction:**
  - Persist constants in the checker and recompute every one from bytes on every run: receipt `b458b351…`, pin `4d894756…`, runner `1d54c9e9…`, spec `03cb4e17…`, worker `0d0f00e2…`.
  - Never trust digests the sidecar declares about itself.
  - The sidecar's correction list must be a whitelist of **exactly one** JSON pointer: `/cleanup/server/listeningAfter`, `true → false`.
  - Any other differing pointer is rejected; in particular `verdict`, `findings[*].status`, `runtime.node`, `pin.node.*`, `runtime.pinned.matched`.
  - Record canonical repo-relative paths, never the CLI argument path. Otherwise the bytes depend on how it was invoked, and moving or symlinking the input changes the sidecar.

### F6 — Stale Node claims and deriver-Node substitution (A5, A6)
- **Evidence:**
  - Both the run and the worker observed `26.12.0`. `pin.node.recorded = 24.21.0` came from the round-13 probe shell, which used fnm Node v24.21.0 (`.ufo/waves/round-13/w1/RuntimeInventory.txt:13-15`).
  - `.ufo/waves/round-13/w1/AriaRunner.txt:35` states "Node: v24.21.0" for the run. The receipt contradicts this, so that report line is a stale claim and must not be cited as runtime evidence. It is historical: record it, don't edit it.
  - `runtime.pinned.matched: true` covers only playwright, chromium and browserVersion (runner `:388-403`). Node never enters it. The spec enforces only `nodeMajor >= minimumMajor` (`:269`).
  - `corpus/knowledge/aria-loopback-round-13.md:11` scopes the runtime to "the versions … in runtime-pin.json", which implicitly includes the 24.21.0 Node recorded there.
- **Substitution hazard:** the runner itself falls back to the aggregator's `process.versions.node` when no worker runtime has `playwright` (`:405`). If the deriver repeated that pattern, the sidecar's Node would depend on the host. My shell's PATH resolves `v24.21.0`, while the L1 environment that produced the receipt resolved `26.12.0`. So deriving in a different shell would silently "match" the stale pin.
- **Correction:**
  - The sidecar records observed `26.12.0` from **both** the receipt and the worker file, and requires them to be equal.
  - It records the pin as `recorded 24.21.0` with the label `descriptive`, plus `exactMatch:false`, `minimumMajorSatisfied:true`, and `pinnedMatchedCoversNode:false`.
  - Never write `process.versions.node`, `generatedAt`, a pid or an absolute path into the sidecar. Then its bytes are deterministic and a persisted expected sidecar sha256 is stable across hosts.

### F7 — A real historical red case: the second receipt has worker proofs that can no longer be authenticated (A1, A6)
- **Evidence:**
  - `corpus/evidence/round-13/aria-second-receipt.json` (sha256 `4a2b0ded…`) shows the same inversion: aggregate `listeningAfter:true`, both per-worker proofs `false`. It also has `workers:2`, `workerRestarts:1` and `verdict:"fail"`.
  - Its worker files `worker-0-1528329-…json` and `worker-1-1529405-…json` no longer exist, because the runner deletes the actual directory at `:727-729`.
  - `aria-execution-final.json` is misleadingly named. It is the **earlier** failing run: workers 2, `durationMs` 6535, the same as the second receipt.
  - The committed pass receipt binds to `aria-execution-pass.json` only by `durationMs` 6062 and workers 1. That is a `TABI-ARIA-RESULT` stdout line with no receipt digest.
- **Correction:**
  - Use the second receipt as a historical negative fixture. `--derive` must refuse it with a missing-worker-file finding and must never move `verdict` from fail to pass.
  - The sidecar must not claim a cryptographic run→receipt binding; "derived from committed bytes" is the strongest claim it can make.

### F8 — Why round 13 missed it: a branch-shaped blind spot in the old gate (A2)
- **Evidence:** `.ufo/waves/round-13/measure.mjs:529-552` checks the aggregate `cleanup.server.listeningAfter` **only** in the `else` branch, i.e. when `perWorker` is not an array. The committed receipt has `perWorker`, so the inverted aggregate was never checked, and per-worker `false` values passed `:537`.
- **Correction:** the new default/check mode must flag aggregate-vs-perWorker disagreement even when `perWorker` is present. Use a stable finding ID, e.g. `R14-ARIA-META-LISTENING-INVERTED`. That is the required red result on the unchanged original receipt.

## Tradeoff for the judge, not a fixable defect

The correction can only re-state values already present in committed bytes. It cannot strengthen the teardown proof beyond what it is: Node's `Server.listening` sample plus one `ECONNREFUSED` to the recorded loopback origin, as also shown in `CleanupSemantics.md:21`. Claiming anything beyond "metadata correction derived from the historical runtime record, no new browser run" would be expansion, not calibration.

## Commands for L1 (after ReceiptRepair lands; not run by me)

```sh
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
sha256sum corpus/evidence/round-13/aria/receipt.json corpus/evidence/round-13/aria/runtime-pin.json scripts/aria-loopback-round13.mjs corpus/evidence/round-13/aria/actual/workers/*.json   # expect b458b351… 4d894756… 1d54c9e9… 0d0f00e2…
node scripts/check-aria-metadata.mjs corpus/evidence/round-13/aria/receipt.json; echo "exit=$?"   # expect nonzero + R14-…-LISTENING-INVERTED (F8)
node scripts/check-aria-metadata.mjs --self-test; echo "exit=$?"   # fixtures must include F1 empty/dropped, F2 copy mismatch, F3 listeningBefore:false / "false" string, F4 TimeoutError, F5 digest swap + extra changed pointer, F6 deriver-node, F7 missing worker file
git diff --exit-code -- corpus/evidence/round-13 scripts/aria-loopback-round13.mjs   # originals untouched
```

Check that the sidecar contains no `process.versions`, `generatedAt` or absolute path, and that running `--derive` twice gives byte-identical output (F6).
