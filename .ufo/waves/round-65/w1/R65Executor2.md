# R65Executor2 — C2 instrument (receipt-provenance gate v2)

Base: 58ed8c7a21b9dcb403e46fc1d4e2d8bb68511162. Scratch clone (removed after run). No lane writes, no git mutation, no commits.

## Deliverables (dir: .ufo/waves/round-65/w1/R65Executor2/)
- check-receipt-provenance-v2.mjs — sha256 49a7ec8a63f573aa0acf7b39852e22c8d346d6dad5bdc5a1bb7566802a3905ae
- selftest.stdout — 419d1907a5f393423400569d4852fb835f113d6c1b8b695211a2fde1dcbb09f4
- forgery-v1.json — 64133c284066fd8f7e8726f56a51dc28a1720dbe9995578a6437035dcb554037
- forgery-v2.json — ae002a30cb682b0a4be43174221940a3c9fcfa8401d6c6b040e654ba96068c3a
- scored-v2.json — 5317b6ad514b1c387818349750156b65c10e7735d31d627e1d5456ba6ce5fc25
- honest-v2.json — d4876347294f3c78646a77dc1ee6ba198c59d0488ad8c3eecbf1436b01b58bae
- c1-honest/honest-240.command.json — c6ab6a5855b9195e1967ac7d68f747fb90c887b8cf6e91f70177864d8e8d30da
- c1-honest/honest-240.stdout — acbf3426054eb2943640b7d941b8181fe3cc9c00a2f396a4ebaa7647d493e420
- c1-honest/matrix-honest.json — 5495b8bcf60396c4f10bf02da5ef4855c72ad3d713d824ae8f547c0b40715bc9
- c1-honest/matrix-honest.command.json — 3a224ddbe6000a5b220d40011c2d60a6cf126a35a93b45849befd8f3353cc6ce
- c1-honest/matrix-honest.stdout — 5495b8bcf60396c4f10bf02da5ef4855c72ad3d713d824ae8f547c0b40715bc9 (same bytes as matrix-honest.json)

## Change (v1 → v2, checkMatrix only)
- `evaluate()` and `checkMatrix()` receive `repo`. Receipt checks, `readAt`, CHECK_IDS, CLI and exit codes are unchanged.
- `checkMatrix`: after the existing `no input path+sha256` format check, when the format holds: resolve `input.path` (absolute as-is; relative: `<repo>/<path>`, then `<matrix dir>/<path>`), take the first candidate that is a file. None → `matrix-input` `input absent: <path>`. Found, sha256 ≠ pinned → `matrix-input` `input digest mismatch`.
- `matrix-command` check kept.
- Selftest: 12 cases = clean + 8 CHECK_IDS + `matrix-input-absent`, `matrix-input-digest`, `matrix-input-bound`. Clean fixture now pins the real sha of its named receipt.

## Results (all run from the scratch clone, absolute args)
- Selftest: `verdict=clean cases=12 passed=12`, exit 0.
- Forgery c1-fab (`--require-committed --min-receipts 12 --rev 58ed8c…`):
  - v1: exit 0, ok true, failures 0, checked 14, matrices 2.
  - v2: exit 1, failures 2, byCheck `{matrix-input: 2}`: `matrix-fab1.json` → `input absent: …/c1-fab/nonexistent-receipt.command.json`; `matrix-fab2.json` → `input digest mismatch`.
- Scored round-64 (`--rev e3f5215615f68490230bd0c6db94f7d84f0fc084 --require-committed --min-receipts 12`): v2 exit 0, ok true, checked 15, failures 0.
- Honest c1-honest (`--rev 58ed8c… --require-committed --min-receipts 1`): v2 exit 0, ok true, checked 2, matrices 1, failures 0.

## Honest fixture — binding choice
- Receipt `honest-240.command.json`: argv `["node","-e","console.log(240)"]`, executed by the cell, exit 0, stdout `240\n` with real digest, inputs `scripts/check-receipt-provenance.mjs` sha 947a595d… (verified equal to `git show 58ed8c…:scripts/check-receipt-provenance.mjs`), rev 58ed8c….
- Matrix `matrix-honest.json` names the receipt by ABSOLUTE path under this fixture dir, pinned to the receipt's real sha256 (c6ab6a58…). Relative-path form was not used. The absolute path is machine-specific and is a portability limit of this fixture.
- `matrix-honest.command.json`: argv `["node","-e",<script>]` — the script reads the receipt, computes its sha256, writes `matrix-honest.json` and prints it. Actually executed; stdout is the matrix bytes.

## Defects and residuals (not fixed here, per scope)
- v2 binds the input's existence and digest only. It does not check that the named input is a receipt. An invented receipt with a self-consistent digest still passes (the C2 declared residual).
- The honest matrix's input path is absolute and machine-specific (see above); a lane with another checkout path fails `matrix-input` for `c1-honest`. The L1 may want a repo-relative receipt copy if the fixture must be portable.
- Lane-tree controls were read-only. `c1-fab/` was used as provided by the L1 (present at wave start).

## Tooling
- None installed. Used Node (existing) and Bun (existing eval runtime). No pacman, no PATH writes.

## Command that proves the item
`node check-receipt-provenance-v2.mjs --selftest --scratch <ABS>` (expect `cases=12 passed=12`), then `node check-receipt-provenance-v2.mjs --dir .ufo/waves/round-65/controls/c1-fab --repo <clone> --rev 58ed8c… --require-committed --min-receipts 12 --json` (expect exit 1, byCheck matrix-input 2).
