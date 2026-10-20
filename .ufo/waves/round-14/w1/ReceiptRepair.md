# ReceiptRepair — round-14 C2 metadata correction (author-side, no checks executed)

Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
Seat: `TabiR14.ReceiptRepair` (leaf executor)
Scope: C2 only. C1 untouched. No delegation, no commits, no background jobs.

## Files written

| Path | SHA-256 | State |
|---|---|---|
| `scripts/check-aria-metadata.mjs` | `ef37387217c7c0b19f936be2c5b81ebe4ea25aafcdb84bc2af5250720e4343f6` | new, executable, 2263 lines |
| `corpus/evidence/round-14/aria-metadata/corrected.json` | `e156b922d0f59f6b66c4bba8aebc708bb0484c41cce1141960a0ab82c1a56745` | new, 4308 bytes |
| `corpus/evidence/round-14/aria-metadata/expected-fixtures.json` | `19339f3eb1a959bdf8b00a13c8652fb900a49c83317c341d01a1ef88376af342` | new, 6988 bytes |

`scripts/aria-loopback-round13.mjs` is byte-identical to the pinned historical source:
`1d54c9e98a85022c4382d0a0eeb16e15f0256b7f561329258e7ca77152e4af9c`. Per L1's revised
decision, the earlier producer line-605 repair was reverted exactly; this seat makes no
future-producer claim.

## Post-L1-verification correction (revision f942c625, initial receipts preserved)

L1's initial run observed `metadataSelfTest.json` exit 1 and `metadataCorrected.json` exit 1.
Two actual checker defects, not historical facts, caused it:

1. `evaluateNode` tested `node.minimumSatisfied`, but `deriveNode` returns
   `minimumMajorSatisfied`. The finding therefore always failed while its detail showed
   `minimumMajorSatisfied:true`. This produced the false `R14-ARIA-NODE-MINIMUM-01`
   failure in the clean fixture and in every green/sidecar path, and the derivative
   residual/acceptance failures.
2. `evaluateCleanup` required `cleanup.workers`, which the historical receipt schema does
   not contain (`cleanup.workers` is `undefined`; the real summary count is
   `summary.workers`). The count detail showed `cleanupWorkers:null`. The count check now
   compares only the actual available counts: `receipt.workers.length`,
   `summary.workers`, `cleanup.server.perWorker.length`, `server.perWorker.length`.

Initial failed execution receipts were not modified. No original/sidecar expected fact was
changed to force green; the historical summary remains `true`, the proof remains `false`,
Node remains observed `26.12.0` vs recorded `24.21.0`, and the sidecar remains
`e156b922…6745`. `expected-fixtures.json` is unchanged (`19339f3e…f342`); only its fixture
digests and expected exits/finding semantics remain as first committed. The self-test line
now also carries stable aliases `name=`, `actual_exit=` and `expected_finding=` alongside
`case=`, `expected_exit=`, `exit=` and `finding=`, preserving the prior grammar.



- Receipt: `corpus/evidence/round-13/aria/receipt.json`, SHA-256
  `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7`, 97073 bytes.
- Pin: `corpus/evidence/round-13/aria/runtime-pin.json`, SHA-256
  `4d8947564ee911a18ff2b931b8628910edada4781024fa40008d87e3cd16ccd2`, 1154 bytes.
- Worker: `corpus/evidence/round-13/aria/actual/workers/worker-0-1530637-1792474958700.json`,
  SHA-256 `0d0f00e214c92f9e0b83b704e3488ff17a58c5141d2cd788cf337d599603a5e7`.
- Producer identity recorded by the receipt: `1d54c9e9…e4af9c`; spec `03cb4e17…e7e4fc`;
  config `87ae779b…07b3f4`; manifest `56764241…0d72112`.
- Per-worker proof digest `3fec21b55a5987fbdcdebfa7694c64015d0a4ebbc9d418df48c1ddbc6dbe4f9a`;
  proof-set digest `49e64adb065b098df9b8e37642258926fb0560208a455530b412ff06706c6633`.

Historical fact checked: summary `cleanup.server.listeningAfter = true`,
sole proof `listeningAfter = false`, `closed = true`, `refusedAfterClose = true`,
`refusalDetail = "ECONNREFUSED"`, `closeError = null`; observed Node `26.12.0`,
pin `node.recorded = "24.21.0"`, `minimumMajor = 20`. The gate does not infer a new
browser run and does not rewrite any historical byte.

## Gate behavior

`node scripts/check-aria-metadata.mjs` — check mode; default receipt/pin, no sidecar.

- Fails closed on missing/symlinked/non-regular input, invalid UTF-8/JSON, non-object JSON,
  missing `runtime`, missing `cleanup.server`, absent/empty `perWorker`, non-boolean
  `listeningBefore|closed|listeningAfter|refusedAfterClose`, missing `closeError`,
  non-string/invalid `origin`, non-boolean summary fields, and non-integer worker counts.
- Requires complete, non-empty per-worker proofs: receipt worker set from
  `receipt.workers[].file` exactly, worker-directory set exactly equal to that set, file
  name `worker-<index>-<pid>-<ms>.json` matching `worker.index`/`pid`, three copies
  (`cleanup.server.perWorker[i]`, `server.perWorker[i].proof`, worker-file
  `cleanup.server`) byte-equal under canonical JSON, worker identities equal, and worker
  case union equal to the committed manifest's 8 case names without duplicates.
- Requires anchors as code constants (never CLI): receipt, pin, producer identity, spec,
  config, manifest, worker file. Current immutable spec/config/manifest bytes are also
  re-hashed and must match. Original receipt/pin digests are byte-pinned.
- Enforces Node semantics: strict `/^\d+\.\d+\.\d+$/` on receipt and worker
  `runtime.node`, receipt/worker agreement, and `observedMajor >= pin.node.minimumMajor`.
  The exact recorded mismatch is reported as a pass-with-detail (`exactMatch:false`,
  `descriptiveOnly:true`), never as a pin match.
- Stable red finding: `R14-ARIA-CLEANUP-LISTENING-AFTER-01` (summary raw state must equal
  `true` iff any complete proof reports `listeningAfter === true`; `false` only when every
  proof reports false). Default mode exits `1` on the committed receipt.
- `--sidecar <path>` accepts the correction only after: schema/kind, receipt+pin+proof-set+
  per-proof digest binding, exact single correction (`cleanup.server.listeningAfter`,
  `from:true`, `to:false`, `value:false`, `derived:false`, proof count), Node claim
  consistency, provenance (`browserExecuted:false`, `execution.browser:false`,
  `newBrowserExecution:false`), qualification flags, and a full post-correction
  re-evaluation. Any residual failure rejects. `accepted:true` only when all pass.
- `--check <input>` auto-detects a receipt (default pin) or a correction sidecar (uses
  `original.receipt.path` and `original.pin.path`); all source constraints are identical
  in both forms.
- `--witness` runs the same checker on the same receipt/pin twice: red without the sidecar,
  green with it; it asserts the stable red finding, green acceptance, and byte-identical
  receipt/pin hashes after both observations. Nested `command`/`stdout` are retained in the
  witness JSON.
- `--derive <receipt> <pin> --out <path>` refuses unless the only base failure is the
  stable contradiction, the receipt verdict is `pass`, all proofs pass, and the derived
  raw state is false. `--out` must be relative, resolve under
  `corpus/evidence/round-14/aria-metadata/`, have a non-symlink plain parent, and is
  written with `wx`; an existing byte-identical file returns `wrote:false, identical:true`;
  differing existing bytes are refused (exit `2`) and never overwritten.
- `--self-test` spawns this CLI in `mkdtemp` fixtures and checks persisted fixture digests,
  exit codes and finding IDs. Cases: clean per-worker/listening, Node observed/recorded,
  old contradiction, missing summary, empty per-worker, non-boolean listeningAfter,
  invalid Node minimum, valid sidecar acceptance, sidecar auto-detect, malformed receipt,
  bad receipt digest, wrong correction direction, false exact-Node claim, witness
  red→clean, witness rejects bad sidecar, and deterministic sidecar re-derivation.

## Sidecar

`corrected.json` is a static derivation, not a browser result. Key fields:
`schema:"tabi-aria-metadata-correction-v1"`, `qualified:true`, `status:"qualified"`,
`browserExecuted:false`, `execution.browser:false`, and
`corrections:[{path:"cleanup.server.listeningAfter",from:true,to:false,value:false}]`.
`original.receipt` and `original.pin` carry the exact historical paths, sizes and SHA-256
values above; `binding.proofSetSha256` and `binding.perWorker[0].sha256` are the digests
above. `node` records `observed:"26.12.0"`, `recorded:"24.21.0"`, `exactMatch:false`,
`minimumMajor:20`, `minimumMajorSatisfied:true`, `descriptiveOnly:true`. Provenance says
derived from historical runtime bytes, no browser launched, no historical file rewritten.

## Commands for L1

Run from `/home/vgpnk/Projects/shokunin/tabi-shokunin`:

```sh
# green check with the corrected sidecar (expect exit 0)
node scripts/check-aria-metadata.mjs --sidecar corpus/evidence/round-14/aria-metadata/corrected.json

# red control: original contradiction must remain observable (expect exit 1)
node scripts/check-aria-metadata.mjs

# auto-detect sidecar input (expect exit 0)
node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json

# same-gate witness red->green, original bytes unchanged (expect exit 0)
node scripts/check-aria-metadata.mjs --witness

# isolated subprocess self-test (expect exit 0)
node scripts/check-aria-metadata.mjs --self-test

# deterministic derivation reproduction (expect exit 0, wrote=false, identical=true)
node scripts/check-aria-metadata.mjs --derive \
  corpus/evidence/round-13/aria/receipt.json \
  corpus/evidence/round-13/aria/runtime-pin.json \
  --out corpus/evidence/round-14/aria-metadata/corrected.json
```

Expected markers:

- `ARIA_METADATA check verdict=clean … accepted=true`
- `ARIA_METADATA check verdict=red …` plus `ARIA_METADATA findings R14-ARIA-CLEANUP-LISTENING-AFTER-01`
- `ARIA_METADATA witness verdict=clean transition=red->clean red_exit=1 red_finding=R14-ARIA-CLEANUP-LISTENING-AFTER-01 green_exit=0 accepted=true original_unchanged=true`
- `ARIA_METADATA_SELFTEST verdict=clean cases=16`, with per-case `result=PASS ... expected_exit=…`
- `ARIA_METADATA derive verdict=clean …`, `wrote=false identical=true`

## Risks / limits

- No checks were executed in this authoring wave, per the assignment. The self-test
  fixture digests were computed by static canonical-JSON mirroring (Python parity with
  the checker's recursive key sort was independently confirmed on a sample); if any
  fixture value drifted, `--self-test` reports `result=FAIL fixture=… expected_sha256=…
  actual_sha256=…` rather than silently passing.
- No LSP tools are mounted in this seat; no symbol/reference queries were available.
- No tools were installed or upgraded.
- C2 calibration only: this is an exact historical metadata correction, not new browser
  execution, coverage, or a repair claim for the pinned legacy producer.
- `aria-second-receipt.json` (2-worker fail receipt) is not used or corrected; the gate's
  worker-set/verdict checks refuse it because its declared worker files no longer exist.
- No dependency on `.omp/agent` was read beyond the already-loaded rules/skills surface.
