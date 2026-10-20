VERDICT: PASS

## Findings

- Added a self-contained Node ESM C1 counter. It resolves the lane from the script directory (or `--lane`), validates `REV` as a commit, and reads SOURCES, the receipt tree, receipt/excerpt blobs, and the fetcher producer bytes from that commit via Git; receipt counts do not consult the worktree. Validation covers the §C1 receipt contract and rejects duplicate row receipts as a group. Implementation: `.ufo/waves/round-18/measure-c1.mjs:12-19, 89-110, 134-178, 219-258`.
- The output includes current-row histograms by `kind` and `status`, plus source URL classes (`living_live`, `immutable_pinned`, `own_work`, with `mixed`/`unclassified` available for other cases): `.ufo/waves/round-18/measure-c1.mjs:151-178, 348-360`. The B census was 10 code, 5 community, 32 docs, 1 own-work, 3 paper, 4 spec, 2 tool; statuses mined 42, queued 8, rejected 7; URL classes immutable-pinned 14, living/live 42, own-work 1.
- Own-work receipts remain in `c1_rows_rechecked` and are exposed separately as `own_work`; they are not included in freshness `held` or `drift_superseded`. The pinned 2026-10-20 receipt date is explicitly labeled as a round-18-only check, not a reusable freshness due-date gate: `.ufo/waves/round-18/measure-c1.mjs:348-359`.
- `--live` uses the fetcher’s curl argv for HTTP row URLs. For non-HTTP receipts it checks the committed `rowUrl` Git object; unavailable/non-path references are reported in `live.not_http`, not as live failures. The self-test exercises the committed-object path with a local fixture: `.ufo/waves/round-18/measure-c1.mjs:260-324, 496-505`.

## Verification evidence

Command: `node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c1.mjs --self-test`

Exact output (15 cases; all pass):
```json
{"selfTest":true,"cases":[{"name":"wrong producer sha","pass":true,"count":0,"expectedCount":0,"own_work":0,"live":null,"reason":"wrong producer sha","observedReasons":["wrong producer sha"]},{"name":"quote not in excerpt","pass":true,"count":0,"expectedCount":0,"own_work":0,"live":null,"reason":"quote not in excerpt","observedReasons":["quote not in excerpt"]},{"name":"excerpt sha mismatch","pass":true,"count":0,"expectedCount":0,"own_work":0,"live":null,"reason":"excerpt sha mismatch","observedReasons":["excerpt sha mismatch"]},{"name":"quoteWords >25","pass":true,"count":0,"expectedCount":0,"own_work":0,"live":null,"reason":"quoteWords >25","observedReasons":["quoteWords >25"]},{"name":"quoteWords mismatch","pass":true,"count":0,"expectedCount":0,"own_work":0,"live":null,"reason":"quoteWords mismatch","observedReasons":["quoteWords mismatch"]},{"name":"rowUrl not in row","pass":true,"count":0,"expectedCount":0,"own_work":0,"live":null,"reason":"rowUrl not in row","observedReasons":["rowUrl not in row"]},{"name":"superseded row","pass":true,"count":0,"expectedCount":0,"own_work":0,"live":null,"reason":"superseded row","observedReasons":["superseded row"]},{"name":"unknown row","pass":true,"count":0,"expectedCount":0,"own_work":0,"live":null,"reason":"unknown row","observedReasons":["unknown row"]},{"name":"drift without superseding row","pass":true,"count":0,"expectedCount":0,"own_work":0,"live":null,"reason":"drift without superseding row","observedReasons":["drift without superseding row"]},{"name":"duplicate row receipt","pass":true,"count":0,"expectedCount":0,"own_work":0,"live":null,"reason":"duplicate row receipt","observedReasons":["duplicate row receipt","duplicate row receipt"]},{"name":"wrong fetchedAt date","pass":true,"count":0,"expectedCount":0,"own_work":0,"live":null,"reason":"wrong fetchedAt date","observedReasons":["wrong fetchedAt date"]},{"name":"non-64-hex sha","pass":true,"count":0,"expectedCount":0,"own_work":0,"live":null,"reason":"sha256 is not 64-hex","observedReasons":["sha256 is not 64-hex"]},{"name":"httpStatus != 200","pass":true,"count":0,"expectedCount":0,"own_work":0,"live":null,"reason":"httpStatus != 200","observedReasons":["httpStatus != 200"]},{"name":"honest receipt","pass":true,"count":1,"expectedCount":1,"own_work":0,"live":null,"reason":null,"observedReasons":[]},{"name":"own-work live git object","pass":true,"count":1,"expectedCount":1,"own_work":1,"live":{"checked":1,"live_held":1,"failures":[],"not_http":[]},"reason":null,"observedReasons":[]}],"allPass":true}
```

Command: `node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c1.mjs 2bff864fdfee684ddbcd066cc8e735adaba2735c`

Exact B output (receipt directory absent at B):
```json
{"rev":"2bff864fdfee684ddbcd066cc8e735adaba2735c","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":0,"eligible_rows":51,"held":0,"drift_superseded":0,"own_work":0,"row_classes":{"kind":{"code":10,"community":5,"docs":32,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":42,"queued":8,"rejected":7},"url":{"immutable_pinned":14,"living_live":42,"own_work":1}},"rejected":[],"live":null,"counterSha256":"488c5952f8c1d8d9dcc3eb0eec61c2d3085cf58eb237850f11d677c0fde1a1f8"}
```

## Risks and blockers

- URL classes are deterministic path-shape classifications, not a claim that a remote host cannot move a version/tag; `mixed` and `unclassified` preserve non-simple cases.
- Verification did not perform live HTTP requests. The self-test did exercise non-HTTP live checking against a committed Git object.
- No blockers. No tools installed or updated.

Files written:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c1.mjs`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/C1Counter.md`
