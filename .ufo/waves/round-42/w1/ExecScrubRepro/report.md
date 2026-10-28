# ExecScrubRepro — r41 control reproducibility sweep (tabi round 42, w1)

Leaf seat. One item: re-run the committed round-41 control set with fresh nonces and
byte-compare the findings **sets** (names only; timestamps/nonces ignored) against the
committed round-41 control receipts.

## Axes named

1. **Reproducibility** — does the committed r41 control set re-emit the committed findings set?
2. **Determinism** — is any delta caused by randomness (nonce/timestamp) or by the invocation surface?
3. **Refusal preservation** — does each control still refuse (exit 1, `predicate:false`, `nonceMatched:false`)?
4. **Pin binding** — do `--pins` digest legs hold against the frozen producer bytes?

## Frozen inputs (verified, read-only)

Measured tree: `/home/vgpnk/Projects/shokunin/tabi-shokunin`, `git rev-parse HEAD` =
`0081bfdb93b6bd1bf2853bb128996f1a976b7218`. Controls are tracked and clean vs index
(`git diff --quiet -- .ufo/waves/round-41/controls/` exit 0):

```
100644 blob 11850590f28925aee846ae00d5c71f208929b2ec  .ufo/waves/round-41/controls/c1-battery.json
100644 blob 457de6fd0aae0edf929d91898892ce74d46c6a17  .ufo/waves/round-41/controls/c1-round39-replay.json
100644 blob 9ad179d085892f2981d7a6e04c83e60328ff8149  .ufo/waves/round-41/controls/c1-round40-replay.json
```

Producer digests vs round-41 claims `frozenDigests` — **all equal** (`sha256sum`):

```
4563e5deccc9bcba8e75c72867c88b8f65de0241a4726c81659d9d82e9895c76  scripts/measure-c1-round41.mjs
fb279c74b82abe6202680c214fd087b45b1134a19c5e21b028abeae3549180a3  scripts/playwright-firefox-egress-round41.mjs
53cded9ec0ad1816488fbc6cee228ad29180137261c6a5654ae7499eea8820b8  scripts/check-c2-knowledge-round41.mjs
cd71a59efa575fc260c4e487b7d52f69a9cd9f3b98bc6d4333abdb9a0cff126a  .ufo/waves/round-41/counters/c1-session-bound-v4.mjs
5fda9774b0be61c2a373efe69ff81852585b5cecd12e3b7013490b770a24642d  .ufo/waves/round-41/fixtures/forger-round39.cjs
308d445d68d36cd8ddbc883866348567d42a400615eab0592e923c6bc202ebda  .ufo/waves/round-41/fixtures/forger-round41.cjs
5d313fd8f030bfd27702cdcc75095b148dadd2b9d861290ffbb5ed23427e9f4d  .ufo/waves/round-41/fixtures/loader.mjs
```

Node: `v24.21.0`, `process.execPath` = `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`,
sha256 `7fde7b8afa198da66257f42ee2001d874c7355631e6d1579a5fb5ef1f246df4c` = r41 claims `producerPins.nodeSha256`.

Replayed receipts (sha256 = the committed `receiptSha256` of each control):

```
e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493  corpus/evidence/round-39/playwright-egress/receipt.json
a72f4eea8a9a9245dff1760b4de2f3e3e8de84a7755e0ceba1e8699d830c3722  corpus/evidence/round40/playwright-egress/receipt.json
```

## Exact commands and observed results

All commands run with cwd `/home/vgpnk/Projects/shokunin/tabi-shokunin`; full ledger in
`evidence/commands.txt`; raw outputs in `evidence/run-*.json`, `evidence/battery-run1.json`,
`evidence/battery-run2.json`.

```
1  node .ufo/waves/round-41/counters/c1-session-bound-v4.mjs corpus/evidence/round-39/playwright-egress/receipt.json --nonce N1
   -> exit 1; findings n=53; predicate=false; receiptSha256 e894f1d5...
2  node .ufo/waves/round-41/counters/c1-session-bound-v4.mjs corpus/evidence/round40/playwright-egress/receipt.json   --nonce N2
   -> exit 1; findings n=69; predicate=false; receiptSha256 a72f4eea...
3  node scripts/measure-c1-round41.mjs --battery
   -> exit 0; allPass=true; 6/6 cases identical to controls/c1-battery.json
```

Fresh nonces (node `crypto.randomBytes(32)`): N1=52a45b8c...9034ca, N2=5e403d83...7b1307,
N3=6005b661...e7292, N4=5898853a...784dcf2, N5=2e6e613e...7b8c, N6=9a454be9...63a16
(`evidence/nonces.txt`). N1/N2 are the documented-recipe runs, N4/N5/N6 are reruns,
N3 is the assigned-variant run.

### Item 1 — round-39 replay, findings SET (names only) vs controls/c1-round39-replay.json

Exact committed recipe (counter only, `--nonce`): **set_equal=True, seq_equal=True,
added=[], removed=[]**. Reruns with N4 and N5 give the same result
(`evidence/run-r39-second-nonce.json`, `evidence/run-r39-third-nonce.json`), so the name set is
nonce-invariant. `run-nonce-mismatch` is receipt-driven (the legacy receipt carries no matching
nonce), so it is red for every fresh nonce rather than flipping.

Committed set (n=53):

```json
["schema", "run-nonce-mismatch", "env-check-unreadable", "env-check-forbidden", "env-check-execargv", "env-check-nonce", "run1-sample-span", "run1-sample1-tree-empty", "run1-sample1-no-firefox-exe", "run1-sample2-tree-empty", "run1-sample2-no-firefox-exe", "run1-sample3-tree-empty", "run1-sample3-no-firefox-exe", "run1-sample4-tree-empty", "run1-sample4-no-firefox-exe", "run1-sample5-tree-empty", "run1-sample5-no-firefox-exe", "run1-sample6-tree-empty", "run1-sample6-no-firefox-exe", "run1-sample7-tree-empty", "run1-sample7-no-firefox-exe", "run1-sample8-tree-empty", "run1-sample8-no-firefox-exe", "run1-sample9-tree-empty", "run1-sample9-no-firefox-exe", "run1-zero-ss-observation", "run1-zero-proc-observation", "run1-root-exe", "run1-summary-ss-mismatch", "run1-summary-proc-mismatch", "run2-sample-span", "run2-sample1-tree-empty", "run2-sample1-no-firefox-exe", "run2-sample2-tree-empty", "run2-sample2-no-firefox-exe", "run2-sample3-tree-empty", "run2-sample3-no-firefox-exe", "run2-sample4-tree-empty", "run2-sample4-no-firefox-exe", "run2-sample5-tree-empty", "run2-sample5-no-firefox-exe", "run2-sample6-tree-empty", "run2-sample6-no-firefox-exe", "run2-sample7-tree-empty", "run2-sample7-no-firefox-exe", "run2-sample8-tree-empty", "run2-sample8-no-firefox-exe", "run2-zero-ss-observation", "run2-zero-proc-observation", "run2-root-exe", "run2-summary-ss-mismatch", "run2-summary-proc-mismatch", "witness-missing"]
```

Re-run set (n=53, N1):

```json
["schema", "run-nonce-mismatch", "env-check-unreadable", "env-check-forbidden", "env-check-execargv", "env-check-nonce", "run1-sample-span", "run1-sample1-tree-empty", "run1-sample1-no-firefox-exe", "run1-sample2-tree-empty", "run1-sample2-no-firefox-exe", "run1-sample3-tree-empty", "run1-sample3-no-firefox-exe", "run1-sample4-tree-empty", "run1-sample4-no-firefox-exe", "run1-sample5-tree-empty", "run1-sample5-no-firefox-exe", "run1-sample6-tree-empty", "run1-sample6-no-firefox-exe", "run1-sample7-tree-empty", "run1-sample7-no-firefox-exe", "run1-sample8-tree-empty", "run1-sample8-no-firefox-exe", "run1-sample9-tree-empty", "run1-sample9-no-firefox-exe", "run1-zero-ss-observation", "run1-zero-proc-observation", "run1-root-exe", "run1-summary-ss-mismatch", "run1-summary-proc-mismatch", "run2-sample-span", "run2-sample1-tree-empty", "run2-sample1-no-firefox-exe", "run2-sample2-tree-empty", "run2-sample2-no-firefox-exe", "run2-sample3-tree-empty", "run2-sample3-no-firefox-exe", "run2-sample4-tree-empty", "run2-sample4-no-firefox-exe", "run2-sample5-tree-empty", "run2-sample5-no-firefox-exe", "run2-sample6-tree-empty", "run2-sample6-no-firefox-exe", "run2-sample7-tree-empty", "run2-sample7-no-firefox-exe", "run2-sample8-tree-empty", "run2-sample8-no-firefox-exe", "run2-zero-ss-observation", "run2-zero-proc-observation", "run2-root-exe", "run2-summary-ss-mismatch", "run2-summary-proc-mismatch", "witness-missing"]
```

### Item 2 — round-40 replay, findings SET vs controls/c1-round40-replay.json

Exact committed recipe: **set_equal=True, seq_equal=True, added=[], removed=[]** (n=69).
Rerun with N6 also `set_equal=True seq_equal=True`.

Committed set:

```json
["schema", "run-nonce-mismatch", "env-check-unreadable", "env-check-forbidden", "env-check-execargv", "env-check-nonce", "run1-sample1-tree-empty", "run1-sample1-no-firefox-exe", "run1-sample2-tree-empty", "run1-sample2-no-firefox-exe", "run1-sample3-tree-empty", "run1-sample3-no-firefox-exe", "run1-sample4-tree-empty", "run1-sample4-no-firefox-exe", "run1-sample5-tree-empty", "run1-sample5-no-firefox-exe", "run1-sample6-tree-empty", "run1-sample6-no-firefox-exe", "run1-sample7-tree-empty", "run1-sample7-no-firefox-exe", "run1-sample8-tree-empty", "run1-sample8-no-firefox-exe", "run1-sample9-tree-empty", "run1-sample9-no-firefox-exe", "run1-sample10-tree-empty", "run1-sample10-no-firefox-exe", "run1-sample11-tree-empty", "run1-sample11-no-firefox-exe", "run1-sample12-tree-empty", "run1-sample12-no-firefox-exe", "run1-sample13-tree-empty", "run1-sample13-no-firefox-exe", "run1-zero-ss-observation", "run1-zero-proc-observation", "run1-root-exe", "run1-summary-ss-mismatch", "run1-summary-proc-mismatch", "run2-sample1-tree-empty", "run2-sample1-no-firefox-exe", "run2-sample2-tree-empty", "run2-sample2-no-firefox-exe", "run2-sample3-tree-empty", "run2-sample3-no-firefox-exe", "run2-sample4-tree-empty", "run2-sample4-no-firefox-exe", "run2-sample5-tree-empty", "run2-sample5-no-firefox-exe", "run2-sample6-tree-empty", "run2-sample6-no-firefox-exe", "run2-sample7-tree-empty", "run2-sample7-no-firefox-exe", "run2-sample8-tree-empty", "run2-sample8-no-firefox-exe", "run2-sample9-tree-empty", "run2-sample9-no-firefox-exe", "run2-sample10-tree-empty", "run2-sample10-no-firefox-exe", "run2-sample11-tree-empty", "run2-sample11-no-firefox-exe", "run2-sample12-tree-empty", "run2-sample12-no-firefox-exe", "run2-sample13-tree-empty", "run2-sample13-no-firefox-exe", "run2-zero-ss-observation", "run2-zero-proc-observation", "run2-root-exe", "run2-summary-ss-mismatch", "run2-summary-proc-mismatch", "witness-missing"]
```

Re-run set (N2):

```json
["schema", "run-nonce-mismatch", "env-check-unreadable", "env-check-forbidden", "env-check-execargv", "env-check-nonce", "run1-sample1-tree-empty", "run1-sample1-no-firefox-exe", "run1-sample2-tree-empty", "run1-sample2-no-firefox-exe", "run1-sample3-tree-empty", "run1-sample3-no-firefox-exe", "run1-sample4-tree-empty", "run1-sample4-no-firefox-exe", "run1-sample5-tree-empty", "run1-sample5-no-firefox-exe", "run1-sample6-tree-empty", "run1-sample6-no-firefox-exe", "run1-sample7-tree-empty", "run1-sample7-no-firefox-exe", "run1-sample8-tree-empty", "run1-sample8-no-firefox-exe", "run1-sample9-tree-empty", "run1-sample9-no-firefox-exe", "run1-sample10-tree-empty", "run1-sample10-no-firefox-exe", "run1-sample11-tree-empty", "run1-sample11-no-firefox-exe", "run1-sample12-tree-empty", "run1-sample12-no-firefox-exe", "run1-sample13-tree-empty", "run1-sample13-no-firefox-exe", "run1-zero-ss-observation", "run1-zero-proc-observation", "run1-root-exe", "run1-summary-ss-mismatch", "run1-summary-proc-mismatch", "run2-sample1-tree-empty", "run2-sample1-no-firefox-exe", "run2-sample2-tree-empty", "run2-sample2-no-firefox-exe", "run2-sample3-tree-empty", "run2-sample3-no-firefox-exe", "run2-sample4-tree-empty", "run2-sample4-no-firefox-exe", "run2-sample5-tree-empty", "run2-sample5-no-firefox-exe", "run2-sample6-tree-empty", "run2-sample6-no-firefox-exe", "run2-sample7-tree-empty", "run2-sample7-no-firefox-exe", "run2-sample8-tree-empty", "run2-sample8-no-firefox-exe", "run2-sample9-tree-empty", "run2-sample9-no-firefox-exe", "run2-sample10-tree-empty", "run2-sample10-no-firefox-exe", "run2-sample11-tree-empty", "run2-sample11-no-firefox-exe", "run2-sample12-tree-empty", "run2-sample12-no-firefox-exe", "run2-sample13-tree-empty", "run2-sample13-no-firefox-exe", "run2-zero-ss-observation", "run2-zero-proc-observation", "run2-root-exe", "run2-summary-ss-mismatch", "run2-summary-proc-mismatch", "witness-missing"]
```

### Item 3 — battery vs controls/c1-battery.json

`node scripts/measure-c1-round41.mjs --battery` twice: exit 0 both times; `allPass=true`;
`cases` deep-equal to the committed control; the two runs are byte-identical (`cmp` clean).

```
forger-r39-verbatim    exit=2 finding=environment-loader-contamination pass=true identical_to_committed=true
forger-r41-retargeted  exit=2 finding=environment-loader-contamination pass=true identical_to_committed=true
node-path              exit=2 finding=environment-loader-contamination pass=true identical_to_committed=true
ld-preload             exit=2 finding=environment-loader-contamination pass=true identical_to_committed=true
esm-loader             exit=2 finding=environment-loader-contamination pass=true identical_to_committed=true
clean                  exit=0 finding=None                            pass=true identical_to_committed=true
```

## Findings

### F1 (drift, invocation surface) — the assigned recipe `--witness <nonexistent> --pins <claims>` does not reproduce either committed findings set; the delta is `witness-missing` -> `witness-unreadable`

Run exactly as assigned (`--nonce N3 --witness $S/nonexistent-witness.json --pins .ufo/waves/round-42/claims.json`),
both replays exit 1 / `predicate:false` / same `receiptSha256`, n unchanged (53 and 69), but:

```
r39: added=['witness-unreadable']  removed=['witness-missing']
r40: added=['witness-unreadable']  removed=['witness-missing']
```

Cause is the counter's own branch, not nondeterminism: `if (witnessFile) ...` emits
`witness-unreadable` when the path cannot be parsed, and only the `else` arm pushes
`witness-missing` when the flag is absent (`c1-session-bound-v4.mjs:103-131`). A nonexistent
witness path is present-but-unreadable, so the committed name is replaced. The committed controls
were produced by the recipe documented in `.ufo/waves/round-41/claims.json` controls
(`... <receipt> --nonce <fresh 64-hex>`, no `--witness`, no `--pins`), which yields
`witness-missing` — confirming the drift is a recipe difference, and refusing behaviour is
unchanged. Isolation runs confirm each flag's contribution independently:

```
--witness nonexistent only            r39: added=['witness-unreadable'] removed=['witness-missing']
--pins (round-41 claims) only         r39: added=['firefox-bin-unbound'] ; r40: added=['firefox-bin-unbound']
--witness + --pins (round-41 claims)  r39/r40: added=['witness-unreadable','firefox-bin-unbound'] removed=['witness-missing']
```

Full r39 sets on the assigned variant — committed:

```json
["schema", "run-nonce-mismatch", "env-check-unreadable", "env-check-forbidden", "env-check-execargv", "env-check-nonce", "run1-sample-span", "run1-sample1-tree-empty", "run1-sample1-no-firefox-exe", "run1-sample2-tree-empty", "run1-sample2-no-firefox-exe", "run1-sample3-tree-empty", "run1-sample3-no-firefox-exe", "run1-sample4-tree-empty", "run1-sample4-no-firefox-exe", "run1-sample5-tree-empty", "run1-sample5-no-firefox-exe", "run1-sample6-tree-empty", "run1-sample6-no-firefox-exe", "run1-sample7-tree-empty", "run1-sample7-no-firefox-exe", "run1-sample8-tree-empty", "run1-sample8-no-firefox-exe", "run1-sample9-tree-empty", "run1-sample9-no-firefox-exe", "run1-zero-ss-observation", "run1-zero-proc-observation", "run1-root-exe", "run1-summary-ss-mismatch", "run1-summary-proc-mismatch", "run2-sample-span", "run2-sample1-tree-empty", "run2-sample1-no-firefox-exe", "run2-sample2-tree-empty", "run2-sample2-no-firefox-exe", "run2-sample3-tree-empty", "run2-sample3-no-firefox-exe", "run2-sample4-tree-empty", "run2-sample4-no-firefox-exe", "run2-sample5-tree-empty", "run2-sample5-no-firefox-exe", "run2-sample6-tree-empty", "run2-sample6-no-firefox-exe", "run2-sample7-tree-empty", "run2-sample7-no-firefox-exe", "run2-sample8-tree-empty", "run2-sample8-no-firefox-exe", "run2-zero-ss-observation", "run2-zero-proc-observation", "run2-root-exe", "run2-summary-ss-mismatch", "run2-summary-proc-mismatch", "witness-missing"]
```

re-run (N3):

```json
["schema", "run-nonce-mismatch", "env-check-unreadable", "env-check-forbidden", "env-check-execargv", "env-check-nonce", "run1-sample-span", "run1-sample1-tree-empty", "run1-sample1-no-firefox-exe", "run1-sample2-tree-empty", "run1-sample2-no-firefox-exe", "run1-sample3-tree-empty", "run1-sample3-no-firefox-exe", "run1-sample4-tree-empty", "run1-sample4-no-firefox-exe", "run1-sample5-tree-empty", "run1-sample5-no-firefox-exe", "run1-sample6-tree-empty", "run1-sample6-no-firefox-exe", "run1-sample7-tree-empty", "run1-sample7-no-firefox-exe", "run1-sample8-tree-empty", "run1-sample8-no-firefox-exe", "run1-sample9-tree-empty", "run1-sample9-no-firefox-exe", "run1-zero-ss-observation", "run1-zero-proc-observation", "run1-root-exe", "run1-summary-ss-mismatch", "run1-summary-proc-mismatch", "run2-sample-span", "run2-sample1-tree-empty", "run2-sample1-no-firefox-exe", "run2-sample2-tree-empty", "run2-sample2-no-firefox-exe", "run2-sample3-tree-empty", "run2-sample3-no-firefox-exe", "run2-sample4-tree-empty", "run2-sample4-no-firefox-exe", "run2-sample5-tree-empty", "run2-sample5-no-firefox-exe", "run2-sample6-tree-empty", "run2-sample6-no-firefox-exe", "run2-sample7-tree-empty", "run2-sample7-no-firefox-exe", "run2-sample8-tree-empty", "run2-sample8-no-firefox-exe", "run2-zero-ss-observation", "run2-zero-proc-observation", "run2-root-exe", "run2-summary-ss-mismatch", "run2-summary-proc-mismatch", "witness-unreadable"]
```

Full r40 sets on the assigned variant — committed:

```json
["schema", "run-nonce-mismatch", "env-check-unreadable", "env-check-forbidden", "env-check-execargv", "env-check-nonce", "run1-sample1-tree-empty", "run1-sample1-no-firefox-exe", "run1-sample2-tree-empty", "run1-sample2-no-firefox-exe", "run1-sample3-tree-empty", "run1-sample3-no-firefox-exe", "run1-sample4-tree-empty", "run1-sample4-no-firefox-exe", "run1-sample5-tree-empty", "run1-sample5-no-firefox-exe", "run1-sample6-tree-empty", "run1-sample6-no-firefox-exe", "run1-sample7-tree-empty", "run1-sample7-no-firefox-exe", "run1-sample8-tree-empty", "run1-sample8-no-firefox-exe", "run1-sample9-tree-empty", "run1-sample9-no-firefox-exe", "run1-sample10-tree-empty", "run1-sample10-no-firefox-exe", "run1-sample11-tree-empty", "run1-sample11-no-firefox-exe", "run1-sample12-tree-empty", "run1-sample12-no-firefox-exe", "run1-sample13-tree-empty", "run1-sample13-no-firefox-exe", "run1-zero-ss-observation", "run1-zero-proc-observation", "run1-root-exe", "run1-summary-ss-mismatch", "run1-summary-proc-mismatch", "run2-sample1-tree-empty", "run2-sample1-no-firefox-exe", "run2-sample2-tree-empty", "run2-sample2-no-firefox-exe", "run2-sample3-tree-empty", "run2-sample3-no-firefox-exe", "run2-sample4-tree-empty", "run2-sample4-no-firefox-exe", "run2-sample5-tree-empty", "run2-sample5-no-firefox-exe", "run2-sample6-tree-empty", "run2-sample6-no-firefox-exe", "run2-sample7-tree-empty", "run2-sample7-no-firefox-exe", "run2-sample8-tree-empty", "run2-sample8-no-firefox-exe", "run2-sample9-tree-empty", "run2-sample9-no-firefox-exe", "run2-sample10-tree-empty", "run2-sample10-no-firefox-exe", "run2-sample11-tree-empty", "run2-sample11-no-firefox-exe", "run2-sample12-tree-empty", "run2-sample12-no-firefox-exe", "run2-sample13-tree-empty", "run2-sample13-no-firefox-exe", "run2-zero-ss-observation", "run2-zero-proc-observation", "run2-root-exe", "run2-summary-ss-mismatch", "run2-summary-proc-mismatch", "witness-missing"]
```

re-run (N3):

```json
["schema", "run-nonce-mismatch", "env-check-unreadable", "env-check-forbidden", "env-check-execargv", "env-check-nonce", "run1-sample1-tree-empty", "run1-sample1-no-firefox-exe", "run1-sample2-tree-empty", "run1-sample2-no-firefox-exe", "run1-sample3-tree-empty", "run1-sample3-no-firefox-exe", "run1-sample4-tree-empty", "run1-sample4-no-firefox-exe", "run1-sample5-tree-empty", "run1-sample5-no-firefox-exe", "run1-sample6-tree-empty", "run1-sample6-no-firefox-exe", "run1-sample7-tree-empty", "run1-sample7-no-firefox-exe", "run1-sample8-tree-empty", "run1-sample8-no-firefox-exe", "run1-sample9-tree-empty", "run1-sample9-no-firefox-exe", "run1-sample10-tree-empty", "run1-sample10-no-firefox-exe", "run1-sample11-tree-empty", "run1-sample11-no-firefox-exe", "run1-sample12-tree-empty", "run1-sample12-no-firefox-exe", "run1-sample13-tree-empty", "run1-sample13-no-firefox-exe", "run1-zero-ss-observation", "run1-zero-proc-observation", "run1-root-exe", "run1-summary-ss-mismatch", "run1-summary-proc-mismatch", "run2-sample1-tree-empty", "run2-sample1-no-firefox-exe", "run2-sample2-tree-empty", "run2-sample2-no-firefox-exe", "run2-sample3-tree-empty", "run2-sample3-no-firefox-exe", "run2-sample4-tree-empty", "run2-sample4-no-firefox-exe", "run2-sample5-tree-empty", "run2-sample5-no-firefox-exe", "run2-sample6-tree-empty", "run2-sample6-no-firefox-exe", "run2-sample7-tree-empty", "run2-sample7-no-firefox-exe", "run2-sample8-tree-empty", "run2-sample8-no-firefox-exe", "run2-sample9-tree-empty", "run2-sample9-no-firefox-exe", "run2-sample10-tree-empty", "run2-sample10-no-firefox-exe", "run2-sample11-tree-empty", "run2-sample11-no-firefox-exe", "run2-sample12-tree-empty", "run2-sample12-no-firefox-exe", "run2-sample13-tree-empty", "run2-sample13-no-firefox-exe", "run2-zero-ss-observation", "run2-zero-proc-observation", "run2-root-exe", "run2-summary-ss-mismatch", "run2-summary-proc-mismatch", "witness-unreadable"]
```

The differing name sits at index 52 of 53 (r39, both sets) and index 68 of 69 (r40, both sets);
every other refusal name is retained, none is lost, and no predicate-bearing finding turns green.

### F2 (pin surface) — `--pins .ufo/waves/round-42/claims.json` is inert; the owning r41 claims adds `firefox-bin-unbound`

`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-42/claims.json` has no
`frozenDigests` and no `producerPins` keys, so the counter's pin block runs with empty maps and
adds nothing (`--pins` truthy, every leg skipped). Passing the owning r41 claims instead
exercises the digest legs: no `digest-mismatch:*` and no `digest-unreadable:*` finding appears —
current producer bytes and the node binary equal the frozen pins — but both legacy receipts gain
`firefox-bin-unbound` because their `owned.roots` entries carry no `exe` field, so the firefox
binary cannot be bound from a legacy receipt. That is still a refusal (exit 1, `predicate:false`).

## Limitations

- The replay legs never launch a browser: they score the committed r39/r40 receipts, so this
  sweep tests counter determinism and refusal preservation, not the live measurement path.
- `--battery` exercises only the spawn-level environment gate (5 contamination vectors + clean
  probe); it does not reach the driver.
- The nonce is fresh by construction, but both legacy receipts carry no matching nonce, so
  `run-nonce-mismatch` is red before and after by design.
- No tool installs, no pacman, no git/jj mutation, no network egress. Scratch
  `/fast/scratch/hyaku/tabi-r42/ExecScrubRepro` removed before yield.

## Evidence index (under `.ufo/waves/round-42/w1/ExecScrubRepro/evidence/`)

`commands.txt`, `nonces.txt`, `drift-table.txt`, `run-r39-claims-exact.json`,
`run-r40-claims-exact.json`, `run-r39-second-nonce.json`, `run-r39-third-nonce.json`,
`run-r40-second-nonce.json`, `run-r39-assigned-witness-r42pins.json`,
`run-r40-assigned-witness-r42pins.json`, `run-r39-witness-only.json`,
`run-r39-r41pins-only.json`, `run-r39-witness-r41pins.json`, `run-r40-r41pins-only.json`,
`run-r40-witness-r41pins.json`, `battery-run1.json`, `battery-run2.json`.

## Drift table (evidence/drift-table.txt)

```
### committed (round-41 controls)
c1-round39-replay.json predicate=False n=53 receiptSha256=e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493
c1-round40-replay.json predicate=False n=69 receiptSha256=a72f4eea8a9a9245dff1760b4de2f3e3e8de84a7755e0ceba1e8699d830c3722
c1-battery.json allPass=True cases=6

### control 1 - round-39 replay
CONTROL r39 variant=claims-exact (documented recipe), N1         n_new=53 n_base=53 predicate=False receiptSha256=e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493
  set_equal=True seq_equal=True
  added  =[]
  removed=[]
CONTROL r39 variant=rerun N4                                     n_new=53 n_base=53 predicate=False receiptSha256=e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493
  set_equal=True seq_equal=True
  added  =[]
  removed=[]
CONTROL r39 variant=rerun N5                                     n_new=53 n_base=53 predicate=False receiptSha256=e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493
  set_equal=True seq_equal=True
  added  =[]
  removed=[]
CONTROL r39 variant=assigned: --witness nonexistent + --pins round-42 n_new=53 n_base=53 predicate=False receiptSha256=e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493
  set_equal=False seq_equal=False
  added  =['witness-unreadable']
  removed=['witness-missing']
CONTROL r39 variant=--witness nonexistent only                   n_new=53 n_base=53 predicate=False receiptSha256=e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493
  set_equal=False seq_equal=False
  added  =['witness-unreadable']
  removed=['witness-missing']
CONTROL r39 variant=--pins round-41 only                         n_new=54 n_base=53 predicate=False receiptSha256=e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493
  set_equal=False seq_equal=False
  added  =['firefox-bin-unbound']
  removed=[]
CONTROL r39 variant=--witness nonexistent + --pins round-41      n_new=54 n_base=53 predicate=False receiptSha256=e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493
  set_equal=False seq_equal=False
  added  =['firefox-bin-unbound', 'witness-unreadable']
  removed=['witness-missing']

### control 2 - round-40 replay
CONTROL r40 variant=claims-exact (documented recipe), N2         n_new=69 n_base=69 predicate=False receiptSha256=a72f4eea8a9a9245dff1760b4de2f3e3e8de84a7755e0ceba1e8699d830c3722
  set_equal=True seq_equal=True
  added  =[]
  removed=[]
CONTROL r40 variant=rerun N6                                     n_new=69 n_base=69 predicate=False receiptSha256=a72f4eea8a9a9245dff1760b4de2f3e3e8de84a7755e0ceba1e8699d830c3722
  set_equal=True seq_equal=True
  added  =[]
  removed=[]
CONTROL r40 variant=assigned: --witness nonexistent + --pins round-42 n_new=69 n_base=69 predicate=False receiptSha256=a72f4eea8a9a9245dff1760b4de2f3e3e8de84a7755e0ceba1e8699d830c3722
  set_equal=False seq_equal=False
  added  =['witness-unreadable']
  removed=['witness-missing']
CONTROL r40 variant=--pins round-41 only                         n_new=70 n_base=69 predicate=False receiptSha256=a72f4eea8a9a9245dff1760b4de2f3e3e8de84a7755e0ceba1e8699d830c3722
  set_equal=False seq_equal=False
  added  =['firefox-bin-unbound']
  removed=[]
CONTROL r40 variant=--witness nonexistent + --pins round-41      n_new=70 n_base=69 predicate=False receiptSha256=a72f4eea8a9a9245dff1760b4de2f3e3e8de84a7755e0ceba1e8699d830c3722
  set_equal=False seq_equal=False
  added  =['firefox-bin-unbound', 'witness-unreadable']
  removed=['witness-missing']

### control 3 - battery
run1 allPass=True cases_deep_equal_committed=True
run2 allPass=True cases_deep_equal_committed=True run1==run2=True
  case0 forger-r39-verbatim    exit=2 finding=environment-loader-contamination pass=True identical_to_committed=True
  case1 forger-r41-retargeted  exit=2 finding=environment-loader-contamination pass=True identical_to_committed=True
  case2 node-path              exit=2 finding=environment-loader-contamination pass=True identical_to_committed=True
  case3 ld-preload             exit=2 finding=environment-loader-contamination pass=True identical_to_committed=True
  case4 esm-loader             exit=2 finding=environment-loader-contamination pass=True identical_to_committed=True
  case5 clean                  exit=0 finding=None pass=True identical_to_committed=True

### witness finding placement
r39 witness-unreadable index=52 of 53
r39 committed witness-missing index=52 of 53
r40 witness-unreadable index=68 of 69
r40 committed witness-missing index=68 of 69
r39 r41pins-only firefox-bin-unbound index=53 of 54 (after witness leg)
```

VERDICT ok: committed r41 controls reproduce — r39 (53 findings, nonces N1/N4/N5) and r40 (69
findings, nonces N2/N6) sets are unchanged with exit 1/predicate=false, and the battery is byte-identical
to controls/c1-battery.json with allPass=true; the only drift is the assigned recipe's
`--witness <nonexistent>` swapping `witness-missing` for `witness-unreadable` (F1, recipe artifact,
no refusal lost).
