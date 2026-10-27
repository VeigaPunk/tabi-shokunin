# ExecCounterReplay — round-40 C1 frozen counter execution (round-39 replay + sub-1000 ms span mutation)

Round 40, attempt 2, wave 1. Leaf seat: execute the frozen C1 counter
`.ufo/waves/round-40/counters/c1-sample-span-v3.mjs` against (a) the committed round-39
receipt and (b) scratch mutations of it whose observed sample span stays below 1000 ms, and
verify that the failure findings, input digests and exit codes are stable and distinct.
No live browser driver was invoked by this seat; no receipt was written to a counted path.

## 1. Frozen inputs (verified, unmodified)

Measured before the executions and re-measured after them — identical both times.

| path | sha256 | vs `claims.json` `frozenDigests` |
|---|---|---|
| `scripts/playwright-firefox-egress-round39.mjs` | `1f8a15f00a85c7a88214a768dbf89e4bc54a01893cd9158ecb0ac6396994545b` | match |
| `scripts/measure-c1-round40.mjs` | `a0e564c7d18bf75d709a6105119a7849a6f78d3364b24f12a3d26981d4ca0735` | match |
| `scripts/selftest-measure-c1-round40.mjs` | `5a0b702d90c37628ff03168112ab585c8a60e6981cc22f6fcbb6a52313995d82` | match |
| `.ufo/waves/round-40/counters/c1-sample-span-v3.mjs` | `0b452eac242803532d81cc2c01025b08ce3b704c74129f8912e7ad2002ef253c` | match |
| `corpus/evidence/round-39/playwright-egress/receipt.json` | `e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493` | not listed in `frozenDigests`; used as the replay input |
| `.ufo/waves/round-40/claims.json` | `3e304b2c55d03f20aa6b1ad6e8f86ceec80dfa5ec9f41d58ce98f9d55ebe0246` | read-only |

Predicate integrity: the counter's embedded `PREDICATE` constant is **byte-identical** to
`claims[0].predicate` (both 716 characters, compared programmatically). Nothing was widened,
amended or re-scored. Counting command under test (not executed here; it starts a browser):
`node scripts/measure-c1-round40.mjs --out corpus/evidence/round40/playwright-egress/receipt.json --scratch /fast/scratch/hyaku/tabi-r40/TabiR40a2/measure`;
`corpus/evidence/round40/` contains **0 files** (no counted receipt exists yet).

Runner: `node v24.21.0` (`/run/user/1000/fnm_multishells/.../bin/node`).
Tools installed: none (nothing needed; no pacman, no network).

## 2. Execution A — frozen counter vs committed round-39 receipt

Exact command (cwd `/home/vgpnk/Projects/shokunin/tabi-shokunin`):

```
node .ufo/waves/round-40/counters/c1-sample-span-v3.mjs \
  corpus/evidence/round-39/playwright-egress/receipt.json \
  --nonce a55c7b7bed905127dac74dd68454031565d7ca68fa78ec00b427f9ee07b1decb
```

Observed: **exit 1**, stderr empty, stdout (field values verbatim):

```
receiptSha256  e894f1d5950eeff25dbf98fb3f951ab2eea8484f2049b88b25252bf45ff8f493
nonceMatched   false
predicate      false
findings       ["schema","run-nonce-mismatch","run1-sample-span","run2-sample-span"]
predicateSentence length 716
```

The nonce above is a fresh 64-hex value generated for this invocation
(`crypto.randomBytes(32).toString('hex')`). The receipt carries `schema`
`tabi-pw-firefox-egress-receipt-v2` (not `…-r40`), `runNonce: null` at receipt level and on
both runs, and its observed sample spans are `run1 = 1793120278610-1793120277811 = 799 ms`
(9 samples) and `run2 = 1793120280715-1793120280014 = 701 ms` (8 samples) — both below 1000 ms,
exactly as stated in `claims.json` `before`. This reproduces the recorded control
`.ufo/waves/round-40/controls/c1-round39-replay-v3.json` (`exit 1; run-nonce-mismatch plus
schema and both sample-span findings`).

## 3. Execution B — scratch mutation with span kept below 1000 ms

Transformation (scratch only, committed bytes never touched; the round-39 receipt is copied,
then mutated):
`m2-r40-schema-nonce-span-kept.json` — copy of the committed receipt, `schema` set to
`tabi-pw-firefox-egress-receipt-r40`, a fresh 64-hex nonce stamped into `runNonce` at receipt
level **and** on both runs, `refused:false`, everything else byte-preserved (sample timestamps,
ss/proc observations, owned tree, survivors, portClosed, browserVersion, firstShotSha256).
File sha256 `5213ab5dab915f461b3edbe68e827d912215081c95b400e28b740b2ac07fe6a7`, 13509 bytes.

Result, two passes with the same file and the same stamped nonce (exit, findings):

```
pass1  exit 1  predicate false  nonceMatched true  findings ["run1-sample-span","run2-sample-span"]
pass2  exit 1  predicate false  nonceMatched true  findings ["run1-sample-span","run2-sample-span"]
```

So once schema and nonce are satisfied, the **only** remaining findings are the two sample-span
findings, one per run, and the span gate fires on the actual first-to-last sample timestamps
(799 ms / 701 ms) — not on the receipt's `coverageMs` field (1560 / 1461). Note that
`coverageMs` is `Date.now() - t0` for the whole session (`scripts/playwright-firefox-egress-round39.mjs:336`),
i.e. it includes pre-sampling setup; the frozen predicate's span is the sample-timestamp span,
and the counter reads it correctly.

## 4. Attribution matrix — the span finding is span-driven, not a constant

All mutations below start from the same `m2` base (schema+nonce fixed) and only re-space sample
timestamps uniformly, keeping sample count and strictly increasing order.

| case | run1 span | run2 span | exit | predicate | findings |
|---|---|---|---|---|---|
| `m1` round-39 bytes as-is, fresh nonce (sha == committed `e894f1d5…`, 13261 B) | 799 | 701 | 1 | false | `["schema","run-nonce-mismatch","run1-sample-span","run2-sample-span"]` |
| `m2` schema+nonce fixed, spans kept | 799 | 701 | 1 | false | `["run1-sample-span","run2-sample-span"]` |
| `m3` run1 re-spaced to 1200 ms, run2 untouched | 1200 | 701 | 1 | false | `["run2-sample-span"]` |
| `m5` both runs compressed (400/350 ms) | 400 | 350 | 1 | false | `["run1-sample-span","run2-sample-span"]` |
| `m4` both runs re-spaced to ≥1000 ms | 1200 | 1197 | 0 | **true** | `[]` |

Distinctness holds: the finding set tracks which run actually violates the span threshold
(`m3` isolates run2 only), and it does not appear when the spans are repaired. Every case was run
twice in the same invocation pattern; findings and exit codes were identical on both passes
(`stable true` in the harness output for all five cases).

### 4.1 Residual coverage note on `m4` (documented limitation, not a predicate change)

`m4` is a **timestamp-edited copy** of the round-39 receipt: schema tag changed, nonce stamped,
and only sample `t` values re-spaced. The frozen counter accepts it (`exit 0`, `predicate:true`,
`findings:[]`). That is precisely the failure mode named in `claims.json` `amendment.reason`
("structural receipt scoring alone admitted a synthetic positive copied from the round-39 receipt
with timestamp edits"); the counter by itself cannot attest that a nonce is *fresh* or that a
driver actually ran — it can only compare the receipt's nonce against the nonce it was handed.
Freshness therefore lives entirely in the counting command. I checked that path cheaply (its
first statement is the `fs.existsSync(outPath)` refusal, so no browser is started):

```
node scripts/measure-c1-round40.mjs --out /fast/scratch/hyaku/tabi-r40/ExecCounterReplay/m4-both-spans-repaired.json \
  --scratch /fast/scratch/hyaku/tabi-r40/ExecCounterReplay/wrapper-probe
exit 1
stderr: {"schema":"tabi-r40-c1-measure","finding":"output-already-exists","path":"/fast/scratch/hyaku/tabi-r40/ExecCounterReplay/m4-both-spans-repaired.json"}
```

`wrapper-probe/` was **not** created and the m4 file's sha256 was unchanged after the attempt
(`f1a8cc755c43f969636c0b75939d0f074e7b2ec44c22f51062094bf0f3d1520f`) — the wrapper refuses before
`mkdirSync` and before spawning the driver. Also observed: the round-39 receipt itself (unmodified
bytes) reaches exit 1, so the claim's kill-rule clause "round-39 receipt reaches exit 0" is not
triggered. The bare counter accepting a stamped+re-spaced derivative is not a deviation from the
frozen predicate; it is the residual the wrapper's exclusive-path + live-driver provenance covers.
Note also that the receipt carries no driver digest — `driverSha256` exists only in the wrapper's
stdout, so a receipt alone cannot prove which driver bytes produced it.

## 5. Refusal-surface probes (one broken field per case, everything else healthy)

Base for each probe: round-39 copy, schema `…-r40`, fresh nonce stamped, samples uniformly
re-spaced at 150 ms (both spans ≥1000 ms), `firstShotSha256` unified to `ab…ab` on both runs.
Each probe then breaks exactly one field.

| probe | mutation | exit | findings |
|---|---|---|---|
| `p1-healthy` | none | 0 | `[]` |
| `p2-single-run` | drop run2 | 1 | `["run-set"]` |
| `p3-order-broken` | run1 sample4 `t` = sample3 `t` | 1 | `["run1-sample-order"]` |
| `p4-ss-unavailable` | run1 sample3 `ss={unavailable:true}` | 1 | `["run1-sample3-ss-unavailable"]` |
| `p5-proc-nonzero-nonloopback` | run1 sample5 `proc={ticks:1,inodes:1,nonLoopback:1}` | 1 | `["run1-sample5-proc-egress"]` |
| `p6-owned-empty` | run1 `owned.tree=[]` | 1 | `["run1-owned-empty"]` |
| `p7-shot-hash-diff` | run2 `firstShotSha256` differs | 1 | `["shot-hash-diff"]` |
| `p8-survivors` | run2 `survivors:2`, `survivorPids:[1,2]` | 1 | `["run2-survivors"]` |
| `p9-port-open` | run1 `portClosed:false` | 1 | `["run1-port-open"]` |
| `p10-no-version` | run1 `browserVersion:""` | 1 | `["run1-version"]` |
| `p11-final-ss-unavailable` | run2 `finalSweep.ss={unavailable:true}` | 1 | `["run2-final-ss-unavailable"]` |
| `p12-sample-count-7` | run2 truncated to 7 samples | 1 | `["run2-sample-count","run2-sample-span"]` |
| `p13-run-nonce-missing` | receipt nonce set, run2 `runNonce:null` | 1 | `["run-nonce-mismatch"]` |

Every refusal names the offending run and sample index; `p12` additionally reports the span
because truncating samples also shrinks the observed span (both are true under the predicate,
not a duplicate-detection defect).

Nonce gate on the `m2` file (valid stamped nonce `5213…` file):

| given `--nonce` | exit | nonceMatched | findings |
|---|---|---|---|
| 63 hex `aaa…a` | 1 | false | `["run-nonce-mismatch","run1-sample-span","run2-sample-span"]` |
| 64 uppercase `AAA…A` | 1 | false | same |
| different fresh 64-hex | 1 | false | same |
| the stamped nonce | 1 | true | `["run1-sample-span","run2-sample-span"]` |

## 6. Operability / exit-code contract

| invocation | exit | stream |
|---|---|---|
| no arguments | 64 | stderr `usage: node c1-sample-span-v3.mjs <receipt.json> --nonce <runner nonce>` |
| non-existent receipt path | 2 | stderr `could-not-evaluate: ENOENT: no such file or directory, open '<path>'` |
| receipt with findings | 1 | stdout JSON (`predicate:false`, `findings` non-empty) |
| receipt satisfying the predicate (`p1`, `m4`) | 0 | stdout JSON (`predicate:true`, `findings:[]`) |

Codes are distinct (64 = usage, 2 = could-not-evaluate, 1 = refused, 0 = predicate true); the
usage and could-not-evaluate paths were each exercised once, the 1 and 0 paths repeatedly. The
counter has no side effects: it only `readFileSync`s the receipt argument
and writes stdout/stderr — verified by the unchanged digests in §1 after all executions, and by
mutant file digests that are identical before and after scoring.

## 7. Stability evidence

- Same input bytes + same nonce, repeated: identical findings and exit code (`m1`…`m5` each ran
  twice back to back; `p1`…`p13` ran once each, and the single `m2` file was additionally scored
  four times in the nonce-gate table with identical span findings each time).
- Same input bytes + different fresh nonces (`m1` via the direct run with nonce `a55c…` and via the
  harness with an independently generated nonce): identical findings `["schema","run-nonce-mismatch","run1-sample-span","run2-sample-span"]`, exit 1.
- Scratch `m1` clone is byte-identical to the committed receipt (13261 bytes, sha `e894f1d5…`), so the
  scratch harness measured the committed artifact, not a paraphrase of it.

## 8. Limitations

- The counter proves only structural consistency of a receipt plus equality with the nonce it is
  given. It cannot prove nonce freshness, that a driver ran, or that two browser sessions existed;
  `cmds`, `events`, `httpLog`, `playwrightVersion`, `binary`, `userAgent` and the driver digest are
  not inspected. §4.1 shows a stamped+re-spaced derivative accepted at exit 0 by the counter alone;
  refusal of that derivative was observed only at the counting command's pre-existing-output guard.
- This seat did not run the live driver or the two-round loopback loops (out of seat scope; other
  seats cover the runner). No claim token is asserted here; the C1 pass/fail decision rests on the
  counted command's own invocation.
- The `--nonce` gate validates the *expected* nonce's shape, so a malformed expected nonce surfaces
  as `run-nonce-mismatch` rather than a usage/exit-64 error. No predicate effect (still a refusal,
  exit 1); noted for operability only.
- Sibling-scope matters not re-verified here: whether a fresh r40 driver run yields ≥8 samples with
  ≥1000 ms span, identical first-shot hashes across two cold runs, and a closed fixture port.
- Scratch root `/fast/scratch/hyaku/tabi-r40/ExecCounterReplay/` was used exclusively (harnesses
  `replay-matrix.mjs`, `refusal-probes.mjs`, mutations `m1…m5`, `p1…p13`, captured stdout/stderr).
  It was deleted before yielding; every number above is reproduced verbatim in this report and is
  regenerable from the committed round-39 receipt by the transformations stated in §3/§5.

## 9. Boundary statement

No repository, corpus, fleet or `shokuknow` file was created, modified or deleted; no commit, push,
git/jj mutation, subagent, network fetch or pacman transaction occurred. Working tree writes were
limited to this report path and (after this report) the removal of the scratch root.

VERDICT ok — frozen counter exits 1 on the committed round-39 receipt with findings `["schema","run-nonce-mismatch","run1-sample-span","run2-sample-span"]` (sha `e894f1d5…`, 799/701 ms spans) and exits 1 on the schema+nonce-normalised sub-1000 ms mutation with exactly `["run1-sample-span","run2-sample-span"]`, stable across repeats and distinct per broken field (p1–p13, exit 64/2/1/0 contract confirmed); frozen digests and predicate string unchanged, and the counting command refuses a pre-existing synthetic receipt at exit 1 before starting a browser.
