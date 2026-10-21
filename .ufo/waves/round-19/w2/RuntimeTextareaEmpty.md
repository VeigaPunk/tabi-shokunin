# RuntimeTextareaEmpty — C1 textarea-empty falsification

**Verdict:** reproduced the `textarea-empty` family at R: 5/5 cases passed, zero findings. The committed expectations agree with the committed receipt, the fresh semantic observation, and both raw-probe records (first/repeat) for each case. No production files changed.

## Replay and invocation contract

- Lane tip and private clone HEAD were both `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R). Clone: `/fast/scratch/tabi-r19/fx-RuntimeTextareaEmpty`.
- The requested argv included `--fixtures`; R's harness does not support it. Exact attempt: `PATH=/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin:$PATH /home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeTextareaEmpty/scripts/webmcp-validation-round19.mjs --cases /fast/scratch/tabi-r19/RuntimeTextareaEmpty-cases --fixtures /fast/scratch/tabi-r19/fx-RuntimeTextareaEmpty/corpus/evidence/round-19/validation/fixtures --out /fast/scratch/tabi-r19/RuntimeTextareaEmpty-rejected.receipt.json`. Observed exit 2; stdout was empty; stderr was `WEBMCP_VALIDATION_ERROR {"code":"could_not_evaluate","message":"unknown argument --fixtures"}`. The parser accepts only `--out` and `--cases` (`scripts/webmcp-validation-round19.mjs:194-210`).
- Following L1 clarification, I copied exactly the family JSON and matching fixture HTML as regular, non-symlink files into `/fast/scratch/tabi-r19/RuntimeTextareaEmpty-probe/{cases,fixtures}`. Their SHA-256 values are `247713c3f93f3ace117a1da11336a7f3c184f50410b3f74fffe73c3ea4786c41` (case) and `895792107eea4db0f9c8ad2cf9b5424d3add8f81277ee390ffce1fbad63b2237` (fixture). Only those two files are in the respective temp directories.
- Supported replay command (the unchanged harness resolves `fixtures` as the sibling of the selected `cases` directory; `scripts/webmcp-validation-round19.mjs:1234-1242`): `PATH=/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin:$PATH /home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeTextareaEmpty/scripts/webmcp-validation-round19.mjs --cases /fast/scratch/tabi-r19/RuntimeTextareaEmpty-probe/cases --out /fast/scratch/tabi-r19/RuntimeTextareaEmpty.receipt.json`. Exit 0; stderr empty; all five case lines passed and final stdout was `WEBMCP_VALIDATION verdict=pass cases=5 passed=5 failed=0 findings=0 out=/fast/scratch/tabi-r19/RuntimeTextareaEmpty.receipt.json`.
- Fresh receipt SHA-256: `ffe1416caea1bda41a2dc175c9977547da37f2839122a83b2c592945f6b34b2d`. Runtime identity: Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0; producer SHA-256 `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4`, equal to committed receipt's producer hash. Fresh receipt binds the copied case and fixture hashes above.
- Machine comparison: for all five IDs, case input and expectation equal the committed receipt; committed and fresh semantic observations equal; both raw-probe runs match input, status, errorText, fields, submitCount and schema. Fresh runtime summary is 5 cases / 5 passed / 0 failed / 0 findings. Full commands, exit statuses, stdout/stderr, hashes, per-case values, and comparison booleans are in `RuntimeTextareaEmpty.json`.

## Per-case observations

| Case | Input | Status / errorText | Submit count | Observed fields | Schema |
|---|---|---|---:|---|---|
| `decl-textarea-empty-01` | `memo="alpha\\r\\nbeta\\ngamma"`; `title="first\\r\\nsecond"` | `Completed` / null | 1 | `memo="alpha\\nbeta\\ngamma"`; `title="firstsecond"` | `memo`, `title`: string; required `[]` |
| `decl-textarea-empty-02` | both strings empty | `Completed` / null | 1 | both empty | same |
| `decl-textarea-empty-03` | `{}` | `Completed` / null | 1 | prefilled textarea and input values retained | same |
| `decl-textarea-empty-04` | both prefilled strings explicitly supplied | `Completed` / null | 1 | both prefilled strings unchanged | same |
| `decl-textarea-empty-05` | whitespace, Unicode, tab and LF input | `Completed` / null | 1 | both values round-trip exactly | same |

Raw probe evidence is `corpus/evidence/round-19/validation/probes/textarea-empty.json` (SHA-256 `151eec9d129f7409071c161d516ab5ca5628ff9e4d34f7462af2a08000267958`); committed receipt is `corpus/evidence/round-19/validation/receipt.json` (SHA-256 `b7846d37b6fe296b5383462d058c6f5961c0adc70064c025d5bb82596402a09a`). The fresh receipt is retained at `/fast/scratch/tabi-r19/RuntimeTextareaEmpty.receipt.json`. The raw family probe itself has matching `first` and `repeat` semantic values. Only one fresh harness replay was run because it matched; consequently I make no new fresh-run nondeterminism claim.

## L1 expectation re-encoding checks

- **Checkbox strings/null:** checked raw probe fields are `withoutValue="on"` and `withValue="checkbox-choice"`, matching the committed expectations. Unchecked raw `toolResponded.output.fields` is `{}`; committed cases encode both controls as null. This is accurate for the harness's normalized control inventory, which emits null for unchecked checkbox/radio controls (`scripts/webmcp-validation-round19.mjs:860-891`), but is not a literal copy of the raw FormData object. The distinction is important and the expectation is consistent with the harness contract.
- **Unnamed control:** `decl-disabled-hidden-04` supplies `{ "": "unnamed-after" }`. The raw probe's control inventory has `name: ""`, `value: "unnamed-after"`; normalized fields contain the empty-name key and value. Raw `toolResponded.output.fields` (FormData) omits the unnamed control and the disabled control, as the case answer states. The committed expected fields match normalized page-control inventory, not literal FormData; this re-encoding is evidence-consistent, not a mismatch.

No packages/tools were installed. No production changes or second replay were made.

## Isolation

- Private sandbox clone: `/fast/scratch/tabi-r19/fx-RuntimeTextareaEmpty`, detached at R `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Fresh case/fixture copies and harness receipt are under `/fast/scratch/tabi-r19/RuntimeTextareaEmpty-probe` and `/fast/scratch/tabi-r19/RuntimeTextareaEmpty.receipt.json`; the clone's producer bytes remained unchanged.
- Production file changes: none. Only this seat's report and evidence JSON were written in LANE; no branch/commit was created.
