VERDICT: PASS

Counter `.ufo/waves/round-17/measure-c2.mjs` implemented and hardened through three CriticC2 rounds
(§A5a baseline isolation, §A3 fixture binding + distinctness, §A3 control substance + control error).
sha256(`.ufo/waves/round-17/measure-c2.mjs`) = `079dcc3924d36b34e56996efe694d35e474455489d611812a78615f3821fc3e1`
(printed as `hashes.counterSelf`; `hashes.counterAtRevision` is the blob at REV — null at baseline).
> Wave-2 repair applied below after ForgeC2Counter found 12 survivor forgeries.

## What it measures

`node .ufo/waves/round-17/measure-c2.mjs REV` → one JSON line; exit 0 counted (0 allowed with
`failures`), exit 2 could-not-evaluate. Inputs are `git cat-file` blobs at REV only, minimal Git env
(as `.ufo/waves/round-16/measure.mjs:94-104`), `spawnSync` argv, no shell, no writes.

- Note `corpus/knowledge/webmcp-invocation-round-17.md`: header `source: S###`; every cited
  `corpus/SOURCES.md` Registry row is 13 pipe-split fields, tier A/B, mined, used-by names the note;
  ≥1 cited row must be **new since 5859243** (id absent at the baseline), opened ≥ 2026-10-20,
  non-`own-work`, A/B, mined, used-by note — all on that SAME row. Baseline id set is a hard
  prerequisite (absent ⇒ exit 2). Closes §A5a: S030–S037 are also opened 2026-10-20.
- Receipt `corpus/evidence/round-17/webmcp-invoke/receipt.json`: verdict `pass`; caseSetOk true
  (nested or flat); `summary.failed` 0; all 11 REQUIRED_CASES present and `pass`; `producerSha256` ==
  sha256(harness blob at REV); every required case declares `fixtureFile` + `fixtureSha256` equal to
  the committed fixture blob under `corpus/evidence/round-17/webmcp-invoke/fixtures/`;
  `invoke-imperative-success`, `invoke-declarative-form`, `invoke-iframe-frameid` name different
  fixture files AND different fixture digests; `invoke-imperative-success` contains a raw
  `WebMCP.toolResponded` with `params.status === "Completed"` while `invoke-flags-off-control`
  contains none; every run has positive integer pid, non-empty string argv (`argv` or
  `effectiveArgv`), `gone:true`; `runtime.observed.chromium.realExecutableSha256` 64-hex;
  `loopback.externalRequestCount` 0.
- **Control error (this round):** `invoke-flags-off-control` must also record a raw CDP error
  response — `{id,error:{code,message}}` or the same `code`/`message`/`id` fields flat — so a control
  that records nothing cannot pass. Collection is a generic subtree walk keyed only on CDP field
  names, no harness-private paths.
- `corpus/README.md` mentions `knowledge/webmcp-invocation-round-17.md`.
- Seven counter-owned probes from an in-memory synthetic base; base must evaluate 1 (else exit 2) and
  every tampered copy must evaluate 0. Results are printed in every run.

## Baseline at 5859243 — exit 0, c2_invocation_held 0 (verbatim, one line)

{"revision":"5859243183c4d7ac5429dfdb8a73ce0d9a43d583","c2_invocation_held":0,"failures":["note corpus/knowledge/webmcp-invocation-round-17.md absent at revision","README does not mention the note path","receipt corpus/evidence/round-17/webmcp-invoke/receipt.json absent at revision"],"cited":[],"caseIds":[],"requiredCases":["invoke-imperative-success","invoke-imperative-throws","invoke-imperative-rejects","invoke-unknown-tool","invoke-input-schema-mismatch","invoke-declarative-form","invoke-after-unregister","invoke-concurrent-ids","invoke-flags-off-control","invoke-iframe-frameid","invoke-navigation-pending"],"runCount":0,"baseline":"5859243183c4d7ac5429dfdb8a73ce0d9a43d583","baselineSourceIds":40,"fixtureBoundCases":0,"probes":[{"probe":"producer_sha_flipped","held":0,"failures":["producerSha256 != harness blob at revision"]},{"probe":"required_case_removed","held":0,"failures":["required case invoke-imperative-success missing"]},{"probe":"cited_row_queued","held":0,"failures":["S900 status queued","no cited row is new since 5859243183c4d7ac5429dfdb8a73ce0d9a43d583 and opened >= 2026-10-20, tier A/B, mined, used-by note, not own-work"]},{"probe":"cited_row_preexisting","held":0,"failures":["no cited row is new since 5859243183c4d7ac5429dfdb8a73ce0d9a43d583 and opened >= 2026-10-20, tier A/B, mined, used-by note, not own-work"]},{"probe":"control_shows_completed","held":0,"failures":["invoke-flags-off-control observed a Completed toolResponded event"]},{"probe":"positive_not_completed","held":0,"failures":["invoke-imperative-success has no WebMCP.toolResponded status Completed event"]},{"probe":"control_records_nothing","held":0,"failures":["invoke-flags-off-control records no CDP error response"]}],"probesOk":true,"hashes":{"note":null,"sources":"099115bea5172e46b87f8bf9a90fce1b3bb012d08ad2c3e38839321bb498c994","readme":"d79584ff97f8ce0e4d71c0bee368844ceeec180badf562b6c94db760a181616b","receipt":null,"harness":null,"counterAtRevision":null,"counterSelf":"2cba594b5b4e1be332b8949d64ba1a3218843d1332c10e7a58789459f9ec17ac"},"inputsRead":[".ufo/waves/round-17/measure-c2.mjs","corpus/README.md","corpus/SOURCES.md","corpus/evidence/round-17/webmcp-invoke/receipt.json","corpus/knowledge/webmcp-invocation-round-17.md","scripts/webmcp-invoke-round17.mjs"]}

## Probe results (seven tampered copies, all held 0; `probesOk:true`)

| probe | held | first failure |
|---|---|---|
| producer_sha_flipped | 0 | `producerSha256 != harness blob at revision` |
| required_case_removed | 0 | `required case invoke-imperative-success missing` |
| cited_row_queued | 0 | `S900 status queued` |
| cited_row_preexisting | 0 | `no cited row is new since 5859243183…` |
| control_shows_completed | 0 | `invoke-flags-off-control observed a Completed toolResponded event` |
| positive_not_completed | 0 | `invoke-imperative-success has no WebMCP.toolResponded status Completed event` |
| control_records_nothing | 0 | `invoke-flags-off-control records no CDP error response` |

## Synthetic positive — 1 path proved in disposable sandbox commits (raw output)

Valid set: fake harness; four committed fixture files (imperative/declarative/frame/common); receipt
with producerSha256 = harness blob sha, 11 cases each carrying fixtureFile+fixtureSha256,
imperative-success carrying `toolResponded{status:Completed}`, flags-off control carrying the raw
`{id,error:{code:-32000,message}}` response, runtime realExecutableSha256 64-hex, loopback 0, run
pid/argv/effectiveArgv/gone; note `source: S041`; S041 Registry row (A/mined/2026-10-20/docs/used-by
note); README map row. Exit 0:

{"revision":"a84459cd5c8ba4816722955636aa0f0f43060b47","c2_invocation_held":1,"failures":[],"cited":["S041"],"caseIds":["invoke-imperative-success","invoke-imperative-throws","invoke-imperative-rejects","invoke-unknown-tool","invoke-input-schema-mismatch","invoke-declarative-form","invoke-after-unregister","invoke-concurrent-ids","invoke-flags-off-control","invoke-iframe-frameid","invoke-navigation-pending"],"requiredCases":["invoke-imperative-success","invoke-imperative-throws","invoke-imperative-rejects","invoke-unknown-tool","invoke-input-schema-mismatch","invoke-declarative-form","invoke-after-unregister","invoke-concurrent-ids","invoke-flags-off-control","invoke-iframe-frameid","invoke-navigation-pending"],"runCount":1,"baseline":"5859243183c4d7ac5429dfdb8a73ce0d9a43d583","baselineSourceIds":40,"fixtureBoundCases":11,"probes":[{"probe":"producer_sha_flipped","held":0,"failures":["producerSha256 != harness blob at revision"]},{"probe":"required_case_removed","held":0,"failures":["required case invoke-imperative-success missing"]},{"probe":"cited_row_queued","held":0,"failures":["S900 status queued","no cited row is new since 5859243183c4d7ac5429dfdb8a73ce0d9a43d583 and opened >= 2026-10-20, tier A/B, mined, used-by note, not own-work"]},{"probe":"cited_row_preexisting","held":0,"failures":["no cited row is new since 5859243183c4d7ac5429dfdb8a73ce0d9a43d583 and opened >= 2026-10-20, tier A/B, mined, used-by note, not own-work"]},{"probe":"control_shows_completed","held":0,"failures":["invoke-flags-off-control observed a Completed toolResponded event"]},{"probe":"positive_not_completed","held":0,"failures":["invoke-imperative-success has no WebMCP.toolResponded status Completed event"]},{"probe":"control_records_nothing","held":0,"failures":["invoke-flags-off-control records no CDP error response"]}],"probesOk":true,"hashes":{"note":"3c8fa017135675ccf2dd6d69d3a6b8587a9ed2e6f9edd0524e22dd6cee093065","sources":"a9c9d23d3eb1b7586bba5a0161c8020b4db21cc2449b9ca2c34df2488ba696a5","readme":"b91b8bcb5cc3967214502b54f4527e49e395f11faf8dfaf470abed4edf1f24fd","receipt":"2504c823f7f36c9c4db74bcb6c7d2fb92935f5b96106ec0382d4fdfcc38377a5","harness":"d7a652f9421decb3fa7f264b38280df36b1d54ff86a4a4269026663ec166f3ad","counterAtRevision":"2cba594b5b4e1be332b8949d64ba1a3218843d1332c10e7a58789459f9ec17ac","counterSelf":"2cba594b5b4e1be332b8949d64ba1a3218843d1332c10e7a58789459f9ec17ac"},"inputsRead":[".ufo/waves/round-17/measure-c2.mjs","corpus/README.md","corpus/SOURCES.md","corpus/evidence/round-17/webmcp-invoke/fixtures/common.html","corpus/evidence/round-17/webmcp-invoke/fixtures/declarative.html","corpus/evidence/round-17/webmcp-invoke/fixtures/frame.html","corpus/evidence/round-17/webmcp-invoke/fixtures/imperative.html","corpus/evidence/round-17/webmcp-invoke/receipt.json","corpus/knowledge/webmcp-invocation-round-17.md","scripts/webmcp-invoke-round17.mjs"]}

## Sandbox falsifiers beyond the in-counter probes (all exit 0)

- Control error (this round): same valid commit with the control's `cdp` emptied →
  `c2_invocation_held:0`, `invoke-flags-off-control records no CDP error response`.
- Control substance: control given a Completed `toolResponded` event → 0 (`…observed a Completed
  toolResponded event`).
- Fixture binding: one required case's `fixtureSha256` flipped to `0`×64 → 0 (`required case
  invoke-imperative-success fixture digest mismatch for imperative.html`).
- A5a: valid set whose note cites only pre-existing S035 (used-by patched) → 0 (`no cited row is new
  since 5859243183…`).
- Worktree independence: fake note/receipt on disk, counter at baseline → 0 with `hashes.note/receipt`
  null. Structural: only `git cat-file`; no fs writes (grep clean).
- Edge: no arg → usage exit 2; `--bad` → exit 2; `nosuchrev` → exit 2; `/tmp` run byte-identical;
  stdout exactly 1 line; `node --check` clean.

## Remaining wave-2 items (routed, not silently dropped)

- A counter-owned case→fixture map once C2Harness's fixture names are final (currently the
  three-case distinctness rule stands in; C2Harness confirmed the receipt shape this wave).
- Raw-payload nonce/invocationId/page-ledger re-derivation once the per-case payload schema lands.
The counter header records the current limit: shape + provenance, not a browser re-run.

## Wave-2 repair (post-ForgeC2Counter)

ForgeC2Counter built 24 sandbox commits against wave-1 (`/tmp/tabi-r17w2-ForgeC2Counter-ENaP/forge-results.json`):
11 rejected outright, 12 forged receipts scored 1. CriticC2 then issued a wave-2 repair request. This
counter was repaired; forge rerun (`rerun-c2counter-w2.json`) now: **all 23 forge commits 0, base M 1**.

Changes:
- `receipt.controls` REQUIRED (array, non-empty); counter-owned copy of the L1 control id list
  (`invoke-before-enable`, `invoke-cancel`, `invoke-declarative-navigation-result`,
  `invoke-domain-disabled`); uniqueness enforced on both `cases` and `controls` ids.
- Fail-closed statuses: every `cases` + `controls` entry must `status === 'pass'` — controls counted
  even when only `cases` count toward the summary.
- `summary` recomputed: `cases`/`passed`/`failed`/`missing` must equal the observed counts and
  `failed` must be the number 0 (undefined ⇒ failure); `caseSetOk` true (top or nested); when
  `summary.caseSet` is present, `ran`/`passed`/`failed`/`missing`/`duplicates` are checked too.
- `fixtureSha256`/`fixtureFile` binding extended from required cases to EVERY `cases` and
  `controls` entry against `corpus/evidence/round-17/webmcp-invoke/fixtures/` blobs at REV.
- New `predicateExtraction` + `predicatesBound`: a code-level scanner finds `predicate:` keys in
  `scripts/webmcp-invoke-round17.mjs`, slices each literal (arrow/function/object), and requires
  every entry's `predicate.fnSha256` to equal sha256 of a literal found in the harness blob
  (Function.prototype.toString round-trip, `scripts/webmcp-invoke-round17.mjs:802,951`). Non-literal
  sites skip membership rather than false-reject (`predicateExtraction` reports `verified N literal(s)`).
- In-counter probes 7→17: + `duplicate_case_selfconsistent`, `nonrequired_case_failed`,
  `summary_counts_mismatch`, `summary_failed_absent`, `controls_absent`, `required_control_missing`,
  `control_failed`, `control_duplicate`, `control_fixture_mismatch`, `predicate_sha_unbound` — all held 0.

Forge table (rerun; first failure each): v01 producerSha256 · v02a summary.cases · v02b/v02c/v02d/v18/v19
duplicate case id · v03a case status fail · v03b control status fail · v04 S041 tier C · v05 no
frontier row · v06 used-by lacks note · v07 README mention · v08 run gone · v09 externalRequestCount ·
v10 summary.cases · v11 fixture digest · v12/v16 summary.failed · v13 control status fail · v14
controls not array · v15 control fixture digest · v17 duplicate control id.

M (6c97851) re-verified: `c2_invocation_held:1`, `failures:[]`, `fixtureBoundCases:15`,
`predicatesBound:15`, `predicateExtraction:"verified 16 harness literal(s)"`, 4 controlIds.
Baseline 5859243: `c2_invocation_held:0`, 3 absence failures, `probesOk:true`, one JSON line.

## Notes for L1 / C2Harness

- Enforced per required case: `fixtureFile` + `fixtureSha256` matching the committed fixture blob;
  the three structurally different cases on different fixtures; imperative-success has a Completed
  `WebMCP.toolResponded`; flags-off control has none and records a raw CDP error response
  (`{id,error:{code,message}}` or flat code/message/id).
- `runs[].effectiveArgv` accepted where `argv` is absent; nested or flat `summary.caseSetOk`.
- No peer-owned or byte-frozen path touched; no tools installed.

Files written:
- .ufo/waves/round-17/measure-c2.mjs
- .ufo/waves/round-17/w1/C2Counter.md
