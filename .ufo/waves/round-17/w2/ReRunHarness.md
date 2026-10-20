VERDICT: HOLDS

Attacked: C2 reproducibility at M = `6c97851034e9d8f58b135d28ff969f1f28fa2f7d` (lane
`refs/heads/master`). Re-ran the committed harness in a `--no-hardlinks` clone detached at M and
compared every run with the committed receipt on verdict, per-case pass, `predicate.fnSha256`,
`producerSha256` and normalized CDP frame shapes. No case differed; no case flaked (two runs were
concurrent).

## Setup (each fact observed, not assumed)

- Sandbox `/tmp/tabi-r17w2-ReRunHarness-3092`: `git clone --no-hardlinks LANE`, `git checkout -q
  --detach 6c978510…`; `git rev-parse HEAD` = `6c97851034e9d8f58b135d28ff969f1f28fa2f7d`.
- Producer identity: `git show M:scripts/webmcp-invoke-round17.mjs | sha256sum` =
  `de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7` = receipt `producerSha256`
  (all runs) = `runtime.producer.sha256` (committed).
- Fixtures: all 7 `corpus/evidence/round-17/webmcp-invoke/fixtures/*` blobs at M hash-equal to the
  worktree files; receipt `fixtures[]` digest list is byte-identical between r1 and the committed
  receipt (7/7).
- Host: Node v24.21.0, Chromium 154.0.8037.97, Playwright 1.64.0 (node-prefix install). No installs.
- Every run: `node scripts/webmcp-invoke-round17.mjs --out /tmp/…/rN.json`, loopback only;
  `--user-data-dir` under `/tmp`, `--remote-debugging-port=0`, zero occurrences of `9222`, and
  `loopback.externalRequestCount == 0` in all 7 receipts plus the committed one.

## Runs

| run | mode | exit | verdict | passed/failed/missing | controls | elapsed |
|---|---|---|---|---|---|---|
| r1–r5 | sequential | 0,0,0,0,0 | pass ×5 | 11/0/0 ×5 | 4/4 pass ×5 | 16,15,16,16,16 s |
| r8, r9 | two instances concurrently | 0,0 | pass ×2 | 11/0/0 ×2 | 4/4 pass ×2 | 15.35 s wall (both) |

Receipt bytes differ per run, as designed (pids/ports/nonces): committed `0cfaeb7e…`, r1
`302cf584…`, r2 `15dbb149…`, r3 `1722b7dd…`, r4 `f788cc21…`, r5 `aef61aa4…`, r8 `2bc456c6…`,
r9 `a2f8462f…`. Stdout files are identical line-for-line except the trailing `out=<path>` field.

## Comparison 1 — declared fields and frame shapes (shape normalizer)

Per receipt: verdict, `summary{…}`, controls, per case `status`+`fnSha256`, ordered CDP frame
shapes (method/response/param tree, enum values kept), event list, `actual` keys. Results:

- Verdict `pass` in all 7 runs and the committed receipt; summary identical (`11/11/0/0`,
  `caseSetOk true`, same 11 expected ids); controls identical (`invoke-before-enable`,
  `invoke-cancel`, `invoke-declarative-navigation-result`, `invoke-domain-disabled`, all pass).
- `predicate.fnSha256` identical for all 11 cases in all 8 receipts (e.g. success
  `7924b713…`, throws `710b08b8…`, iframe `50dbd490…`).
- Frame counts per case identical: 11,11,11,9,11,11,15,15,8,14,16 (success, throws, rejects,
  unknown-tool, schema-mismatch, declarative, after-unregister, concurrent, flags-off, iframe,
  navigation-pending). Frame shapes: 0 differences r1↔r2…r9↔committed.
- Launched/effective argv identical across labels `flagged`,`flag-off`,`domain-disabled`
  (49/47/49 args after masking tmp path + port).

## Comparison 2 — whole-receipt strict diff (volatile-only mask)

Deep-diff of the whole JSON at 5,189 flattened paths, masking **only** ephemeral tokens: ports,
pids, temp profile paths, `generatedAt`, monotonic timings, nonces (`label-<12hex>`), 32-hex
invocation/frame ids, CDP `objectId`; every other value stays literal (status, output, errorText,
schema text, counts, booleans, ledger frames).

`diffCount == 0` for r2, r3, r4, r5 and the committed receipt; `diffCount == 0` for r8, r9
(concurrent). Comparator sensitivity: the same tool vs. the mutated-fixture receipt reports
**76 diffs**, including `status: fail`, `output: "echoX:<nonce>"`, `detail`, `fixtureSha256` —
so the 0 is not a vacuous comparison.

## Anti-tautology — the pass is live, not vacuous

Copied fixtures to `out/fixtures-mut/`, changed the echo tool's return in the copy from
`'echo:'` to `'echoX:'`, ran `--fixtures out/fixtures-mut`: `MUT_EXIT=1`,
`verdict=fail`, `passed=8 failed=3`, and exactly the three echo-asserting cases failed
(`invoke-imperative-success`, `invoke-input-schema-mismatch`, `invoke-concurrent-ids`), each
`detail: "predicate not satisfied"`. Predicates discriminate on real page output.

## Counter reproducibility (measure-c2)

- At M: `{"c2_invocation_held":1}` — `failures: []`, `fixtureBoundCases: 11`, `probesOk: true`,
  `runCount: 3`, `hashes.receipt 0cfaeb7e…`, `hashes.harness de62820d…`; every owned probe
  evaluates 0 (`probesOk: true`, e.g. `producer_sha_flipped`, `required_case_removed`,
  `cited_row_preexisting`, `control_shows_completed`).
- At B `5859243…`: `c2_invocation_held: 0` with the three absence failures (note/README/receipt).
- **Regenerated receipt still counts**: committed r1 over the receipt path in a sandbox commit
  `bfe9ab5a…` → `c2_invocation_held: 1`, `failures: []`, `fixtureBoundCases: 11`,
  `hashes.receipt 302cf584…` (different bytes from M). The count is reproducible from a fresh run,
  not only from the frozen bytes.
- **Fixture binding discriminates**: committed the mutated fixture blob while the receipt kept the
  old `fixtureSha256` (commit `985702ea…`) → `held: 0`, failures
  `required case invoke-imperative-success fixture digest mismatch for invoke-imperative.html`
  (4 such failures), `fixtureBoundCases: 2`.
- No-overwrite guard: `node scripts/webmcp-invoke-round17.mjs` with the default `--out` (the
  committed path) completed its run then exited 2 with
  `{"code":"receipt_differs",…,"existingSha256":"0cfaeb7e…"}` and the file's sha256 was unchanged
  afterwards. The same guard refused to overwrite a pre-existing differing `--out` after a full
  run (r6/r7 second attempt). The guard protects the committed receipt.

## Timing margins (no case near a deadline)

Per-case `durationMs`, max over r1–r5: success 146, throws 124, rejects 107, unknown-tool 856,
schema-mismatch 103, declarative 110, after-unregister 814, concurrent 106, flags-off 1258,
iframe 721, navigation-pending 8094 — 8.07 s is the deliberate 8 s absence window (>25× the next
longest, flags-off 1.26 s), against 8000/10000 ms deadlines. Under 2× contention nothing moved.

## Limits found (not falsifying the claim; concrete repairs if a wave-3 wants them)

1. `predicate.fixedBeforeRun: true` is a hard-coded literal (`scripts/webmcp-invoke-round17.mjs:803`),
   so it cannot itself evidence fixation, yet `.ufo/waves/round-17/w1/C2Harness.md:11` cites it with
   the hash. The claim holds via `producerSha256` + `fnSha256 = sha256(predicate.toString())`; fix:
   drop the boolean or compute it before the first browser launch and compare after the run.
2. Byte-level reproduction is impossible by construction: a bare re-run to the default `--out` always
   exits 2 `receipt_differs` (observed), which can be misread as `could_not_evaluate`. Fix: state that
   reproduction is semantic (masked diff = 0) and a default-path re-run is expected to refuse.
3. The harness records but never asserts fixture digests; a coordinated fixture+receipt change in one
   commit is invisible to `measure-c2`. Behaviour predicates are the only defence (probe above shows
   they work). Fix: pin the 7 fixture digests as counter constants, or add this frozen-receipt
   fixture-mutation as a counter probe.

## Files written

- `.ufo/waves/round-17/w2/ReRunHarness.md` (this report; lane untouched, HEAD and
  `refs/heads/master` still `6c978510…`, committed receipt sha256 still `0cfaeb7e…`).
- No lane file, no committed receipt and no fleet repo was modified. Sandbox
  `/tmp/tabi-r17w2-ReRunHarness-3092` removed after the report.
