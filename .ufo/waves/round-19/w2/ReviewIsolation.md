# ReviewIsolation — round 19 W2

## Verdict

**Recommend d4 be treated as bounded retrospective evidence, not a clean closure.** The 23 ledger records match real clones and final commit path sets, and L1's named case edits are traceable to observations. However, the wave-return status was not captured, and the ledger's writer universe is narrower than PLAN's literal definition of a production file (which includes evidence). One L1-added case also exceeds its worker task's 2–5 case bound without an explicit waiver in the final plan.

## Findings (severity order)

### Medium — d4 does not have direct, file-granular wave-return status evidence

`isolation/ledger.json:4-8` records identical before/after strings, but explicitly labels the after value and `trackedDiffEmpty` as reconstructed from mtimes, not captured at wave return. The source record says the mtime comparison was taken at 04:25 after the L1 import began at 04:07:12. The saved pre-wave file is only the collapsed directory entry `?? .ufo/waves/round-19/` (`isolation/lane-status-before-w1.txt:1`); the post-import inventory is the later `lane-status-uall-0425.txt:1-65`. PLAN explicitly preserves this limitation (`PLAN.md:153-156`), and `w1/ReviewC3Contract.md:15-19` explains why the collapsed before status cannot establish nested-path equality.

The committed `c3-1f453819.json:8-10` reports `d4.pass=true` with 23 entries and `tracked_diff_empty=true`, but that is the counter evaluating the reconstructed ledger fields; it is not an independently captured wave-return snapshot. Therefore it supports only the ledger's bounded reconstruction, not the stronger “clean” isolation claim.

### Medium — the ledger's 23 entries omit source-evidence writers under PLAN's stated definition

PLAN defines a production file as anything L1 lands outside a seat's report, explicitly including evidence (`PLAN.md:71-79`). The W1 assignment list includes 16 source-only `Src*` tasks (`w1/assignments.json:2-17`) with retained `.gz` source-evidence files in the lane; several reports explicitly state no clone/commit. Examples: `SrcCdpToolResponded.md:78-84` lists three retained source bodies and no clone; `SrcPwArtifactsDir.md:49-54` lists seven `.body.gz` lane artifacts and no production clone; `SrcWebmcpSpecDecl.md:73-79` lists its retained source body and no clone. All 27 retained source-body gzip files are present in L1's landing commit `08e817394fa27f54441c46fac17228c37f86bf73` (read-only `git cat-file -e` checks).

All 16 source-evidence reports are absent from the 23-entry ledger. If these wave-local research attachments are intentionally excluded from “production writers,” the current PLAN wording needs an explicit carve-out; as written, the ledger is not a complete inventory of every writer of committed evidence. This is an additional reason not to credit d4 as clean.
Omitted source seats: `SrcFormSchemaFill`, `SrcFormSchemaBuild`, `SrcFormSchemaTests`, `SrcHtmlFormTool`, `SrcScriptToolError`, `SrcCdpToolResponded`, `SrcDeclExplainer`, `SrcChromeDeclDocs`, `SrcWhatwgConstraints`, `SrcWhatwgSubmit`, `SrcJsonSchemaValidation`, `SrcSelectFill`, `SrcValueSanitization`, `SrcWebmcpSpecDecl`, `SrcPwArtifactsDir`, and `SrcSignalsChild`.

### Low — L1's non-scalar success control exceeds the assigned case-count bound

The `FamNonScalar` task at `w1/plan.json:786-788` says to write 2–5 cases. The final file has six (`cases/non-scalar.json:6-221`), with `decl-non-scalar-06` at lines 197-220. Its answer explicitly attributes the success control to L1; the retained receipt records it as `pass:true` with a successful submit and matching fields (`validation/receipt.json`, `#/cases` entry `decl-non-scalar-06`). The later C1 revision requires an in-family success control (`PLAN.md:141-145`), but does not explicitly waive the 2–5 case limit. The added case is honestly labeled and observed; the unresolved issue is assignment compliance, not evidence fabrication.

## Verified clone and commit inventory

Read-only Git checks over every ledger entry found:

- 23/23 clone paths resolve to their claimed repository root; 23/23 branch names and commit IDs are unique; each checked-out branch and `HEAD` match the ledger.
- B is an ancestor of all 23 commits. Seventeen commits have B as immediate parent; six are linear descendants with intermediate commits (FamMissingRequired, FamTextareaEmpty, ExecValidationHarness, ExecMeasureC1, ExecMeasureC2, ExecMeasureC3). No merge ancestry or out-of-scope final tree delta was found.
- For all 23, `git diff --name-only B <commit>` exactly matches the ledger's `changedPaths`; all 89 resulting paths match their assigned path patterns. The `imported-w1.json` clone/branch/base/commit/path records match the ledger 23/23, and the ledger's assignments match the corresponding W1 task assignments.
- 21 clones were clean. `ExecValidationHarness` has the copied validation snapshot untracked for its reported full-corpus probe; `ExecInvokeR19` has an untracked `round19-normal-receipt.json` run output outside its single committed script path. Neither is part of its committed diff or LANE landing.

### L1's four commits for seats reporting “no commit”

The four seat reports state that the worker created no commit (`FamNumberRange.md:44-55`, `FamRadio.md:41-48`, `FamTextConstraints.md:50-59`, and `ExecValidationHarness.md:26-35`). The recorded clone commits have L1 author identities/messages, rather than masquerading as seat commits: FamNumberRange `bfcfdff93c63547fc17b362c4b596e0d4ae3c09b`, FamRadio `c34dbb6a77313a170e42d5696b79b045a080dd8a`, FamTextConstraints `a5ad23a41ea7202389d50dee8907e7deed24ec02`, and ExecValidationHarness `44f72d43bc96b8f3055000333eab0149db9474ce`. The harness commit message and author identify L1's on-behalf action; its final script blob matches the landed LANE blob and the reported SHA-256 `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4`. The two symlink targets in the landed hardening fixture were normalized from clone-absolute paths to relative in-tree targets.

### Non-scalar landing and L1 case/field edits

The 3,320,476-byte `probes/non-scalar.json` blob is byte-identical in the FamNonScalar clone and LANE: SHA-256 `6797c1e6bd79afaf066667ce60f6595e2e1494d4aa6c0720fde6d4675ce0c87b`. Commit `1f45381930a31015ffb026cb22cb9c31b486fe29` adds that single 7,155-line file; the clone commit and landed file have the same blob size and digest.

The L1 changes to existing case expectations are honest against the retained raw probes and receipt:

- `number-range`'s three validation error substrings and `date-time`'s range error were expanded to the observed Chromium text in commit `d5cf4d7`; all nine rows' status/field values and updated error substrings match the family probes.
- `checkbox` expectations changed from booleans to checked value/null. This matches the final harness's field reader (`scripts/webmcp-validation-round19.mjs:860-891`), the raw checkbox control states, and all five receipt rows. The historical `FamCheckbox.md:7` describes the earlier boolean representation; the committed case/receipt use the later harness contract.
- L1 added `decl-unknown-param-04` and `decl-non-scalar-06` as in-family successful controls. Both are marked as L1 integration controls in the case answers and both have passing observed entries in the receipt. The latter is the six-case finding above.

The retained integrated receipt states 66/66 cases pass, zero findings, and its `producerSha256` matches the landed harness. This review read that receipt and family probes; it did not rerun the browser suite.

## Residual risk and verification gaps

- No build, test suite, browser probe, or C3 counter was run for this review. The counter result above is read from its committed measurement record, not rerun.
- No LSP route is mounted: `read xd://lsp` and `write xd://lsp_status` both returned “No such tool.” No LSP references/definition/diagnostics were available; text search was used only to locate anchors, with conclusions taken from direct file and Git-object reads.
- No tools were installed or updated. No jj helper was invoked.

## Evidence digests

All hashes below are SHA-256 of the local UTF-8 file or raw artifact bytes:

- `PLAN.md`: `abe72ddd1088de226926f373ff6ffd1ccbf4dd7ab032382d438f70a2c21fc496`
- `isolation/ledger.json`: `49aef3dc06bb092e7183206d25828a780345385fe714cab6877b67dd0e7623be`
- `isolation/imported-w1.json`: `f53cea07f98a143d229271dd1c71e1c9ae566a478d3fbcc4138b6bfe740901e4`
- `isolation/lane-status-before-w1.txt`: `e271694cdefbcf6132564f7723fec4bde9b3b3bd2a4be8fed0f93004c7ce2612`
- `isolation/lane-status-uall-0425.txt`: `fbda417ea7cf749d10ba7ecff993ebed4090248bb6552a2ab8ebf2748ba998f2`
- `measurements/c3-1f453819.json`: `c490b2ba0a4b2d6eefafd9060f7e1fa9a1196575393899b11892740736160793`
- `validation/receipt.json`: `b7846d37b6fe296b5383462d058c6f5961c0adc70064c025d5bb82596402a09a`
- `scripts/webmcp-validation-round19.mjs`: `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4`
- `validation/probes/non-scalar.json`: `6797c1e6bd79afaf066667ce60f6595e2e1494d4aa6c0720fde6d4675ce0c87b`

## Isolation

- Clone: N/A — review-only; no production files written.
- Branch: N/A.
- Base: `66251bfc1aef393e4aec599e950a8deb867736bb` (read-only reference).
- Commit: none.
- Changed path: `.ufo/waves/round-19/w2/ReviewIsolation.md` only.
- Tool installs/updates: none.
