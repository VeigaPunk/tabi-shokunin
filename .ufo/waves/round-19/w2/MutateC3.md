# MutateC3 — round 19 wave 2 falsification

## Result

**10 isolated, committed mutations: 8 killed, 2 survived, 0 inconclusive.** The surviving shapes were an incorrect count in the d1 correction and a fabricated clean d4 after-status snapshot. These are bounded calibration/coverage findings, not approval to change the contract or a judgment of the whole claim.

Axes: **calibration** (does a plausible record defect turn its routed predicate false?), **separability** (do unrelated predicates retain their values?), and **restoration/isolation** (are exact checkpoint bytes restored without changing LANE?). All eight kills changed only the targeted d; both survivors retained all four true. Every restoration returned the complete tracked tree and all measured input hashes to the attacked checkpoint.

- Attacked checkpoint R: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Historical round baseline B: `66251bfc1aef393e4aec599e950a8deb867736bb`.
- R/pristine tree: `052098c1dab594e127d29ede189f07f6462f0ed0`.
- Runtime actually used: `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`, observed `v24.21.0`; its bin was first in the detector's PATH. No browser was started and no other application runtime was invoked.
- Tool installations/updates: **none**.

## Detector and experiment

The same unchanged detector was run against full local commit IDs:

```text
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-MutateC3/.ufo/waves/round-19/measure-c3.mjs <REV>
```

Each detector invocation had a 50,000 ms child deadline; the detector's isolation-checker deadline is 45,000 ms. Each mutation was committed with only its stated delta, measured, restored with the exact inverse edit, committed again, and measured again. The restored run for one trial is also the pristine run immediately preceding the next trial: its tree equals R, its hashes equal the initial hashes, and all four predicates pass. There were **21 recorded executions** (one initial pristine, ten mutated, ten restored), plus one preliminary pristine execution with the same successful output. No full suite, self-test suite, build, formatter, or unrelated probe was run. No timeout, signal, evaluation error, or detector stderr occurred in these trials. All synchronous children exited and were reaped; no background job or persistent process was started.

Expected detector for every mutant: the named d becomes false, the count becomes 3, and the other three d values and reasons stay equal to pristine. At R, such a result also exits 1; a passing four-count exits 0. Exit status is recorded, not used as a substitute for reading the flags and reasons.

### Actual pristine/restored stdout

The initial recorded pristine and **all ten restored runs** emitted the following exact JSON line, with exit 0 and empty stderr:

```json
{"c3_routed_closed":4,"d1":{"pass":true,"reason":"correction_line_and_7_criteria_rederived"},"d2":{"pass":true,"reason":"correction_line_and_5_plus_1_ids_match;derived_ids=invoke-unknown-tool,invoke-after-unregister,invoke-flags-off-control,invoke-iframe-frameid,invoke-before-enable,invoke-domain-disabled;message_substring_ids=invoke-unknown-tool,invoke-after-unregister,invoke-flags-off-control,invoke-iframe-frameid,invoke-before-enable;message_nonempty=invoke-domain-disabled"},"d3":{"pass":true,"reason":"registries_match=1;records_match=1;r18_correction_names_all_four"},"d4":{"pass":true,"reason":"checker_verdict_clean_entries=23;tracked_diff_empty=true"}}
```

### Mutants and actual outputs

Paths and line numbers below are relative to the private clone at R, not edits to LANE. `T/F` vectors are ordered `[d1,d2,d3,d4]`. For each killed mutant, its complete JSON stdout equals the pristine JSON above except for `c3_routed_closed:3` and the target object shown below. Thus all unaffected values **and reasons** were retained. For both survivors, the complete JSON stdout equals pristine. Every row had empty stderr.

| Mutant | Smallest delta | Expected target | Observed count / vector / exit | Verdict |
| --- | --- | --- | --- | --- |
| d1-count | `LOG.md:1116`: `seven criteria` → `six criteria`; range and numbered list unchanged | d1 false | 4 / TTTT / 0 | **SURVIVED** |
| d1-range | `LOG.md:1116`: corrected endpoint `QUALITY 33–39` → `QUALITY 33–38`; count and list unchanged | d1 false | 3 / FTTT / 1 | **KILLED** |
| d2-id | `SCORECARD.md:870`: `invoke-unknown-tool` → `invoke-unknown-tools` | d2 false | 3 / TFTT / 1 | **KILLED** |
| d3-wave | `.ufo/waves/round-19/w1/swarm-registry.json:3`: `tabi-round-19-w1` → `tabi-round-19-w2`; spec unchanged | d3 false | 3 / TTFT / 1 | **KILLED** |
| d3-agent | Same registry, line 10: first member's `agentId` → JSON `null` | d3 false | 3 / TTFT / 1 | **KILLED** |
| d4-clone | `.ufo/waves/round-19/isolation/ledger.json:12`: first clone root `tabi-r19` → `tabi-r18` | d4 false | 3 / TTTF / 1 | **KILLED** |
| d4-branch | Same ledger, line 13: `r19/FamUnknownParam-4` → `r18/FamUnknownParam-4` | d4 false | 3 / TTTF / 1 | **KILLED** |
| d4-path | Same ledger, line 22: first changed path's `unknown-param.json` → `unknown-params.json`; assigned paths unchanged | d4 false | 3 / TTTF / 1 | **KILLED** |
| d3-empty | Rename the sole discoverable `w1/swarm-registry.json` to `w1/MutateC3-registry.disabled.json`; preserve its bytes and `record.json` | d3 false | 3 / TTFT / 1 | **KILLED** |
| d4-clean | Ledger line 5: replace `laneStatusAfter` with the empty string, i.e. fabricated clean porcelain status; before-status and method unchanged | d4 false | 4 / TTTT / 0 | **SURVIVED** |

Exact target objects emitted for killed mutants:

```json
{"mutant":"d1-range","d1":{"pass":false,"reason":"correction_line_missing"}}
{"mutant":"d2-id","d2":{"pass":false,"reason":"listed_ids_do_not_match_derived_ids;substring_ids_do_not_match_derived_ids;derived_ids=invoke-unknown-tool,invoke-after-unregister,invoke-flags-off-control,invoke-iframe-frameid,invoke-before-enable,invoke-domain-disabled;message_substring_ids=invoke-unknown-tool,invoke-after-unregister,invoke-flags-off-control,invoke-iframe-frameid,invoke-before-enable;message_nonempty=invoke-domain-disabled"}}
{"mutant":"d3-wave","d3":{"pass":false,"reason":".ufo/waves/round-19/w1/swarm-registry.json:wave_mismatch_or_null"}}
{"mutant":"d3-agent","d3":{"pass":false,"reason":".ufo/waves/round-19/w1/swarm-registry.json:agent_id_missing:SrcFormSchemaFill"}}
{"mutant":"d4-clone","d4":{"pass":false,"reason":"checker_not_clean_exit_1"}}
{"mutant":"d4-branch","d4":{"pass":false,"reason":"checker_not_clean_exit_1"}}
{"mutant":"d4-path","d4":{"pass":false,"reason":"checker_not_clean_exit_1"}}
{"mutant":"d3-empty","d3":{"pass":false,"reason":"no_round19_registries"}}
```

The `mutant` fields in that presentation identify the trial; they are not additional fields emitted by measure-c3. The target objects themselves are verbatim detector output.

## Interpretation of the two survivors

### d1-count: correction cardinality is not bound

Observed: changing the machine-checkable correction's cardinality to six still produced `correction_line_and_7_criteria_rederived` and counted d1. The range-only control was rejected, so this is not a wholly unexercised d1 path. At `.ufo/waves/round-19/measure-c3.mjs:113-142`, the correction predicate checks a round-19 line, the old line reference, and the 33–39 range; the separate QUALITY derivation re-derives seven but does not compare that result to the correction's cardinality text. The other, multiline explanatory correction in LOG remains unchanged and still says seven. The demonstrated gap is specifically acceptance of a contradictory **machine-checkable single-line correction**, not loss of every correct statement in LOG.

### d4-clean: snapshot content is not authenticated

Observed: replacing only the after-snapshot with `""` still produced `checker_verdict_clean_entries=23;tracked_diff_empty=true` and counted d4. At `isolation/check-isolation.mjs:176-238`, empty status parses as zero records and differences under the permitted round-19 report prefix are ignored. At `measure-c3.mjs:341-361`, a string satisfies the snapshot-shape check; these routines do not bind that string to the recorded evidence file or the reconstructed method.

Limit: the removed status entry in this trial was only the allowed `.ufo/waves/round-19/` entry. This probe demonstrates acceptance of fabricated clean snapshot content and non-equality of the two snapshots; **it does not demonstrate an actual forbidden lane write or prove that an outside-prefix drift supplied honestly in the ledger would be accepted**. No lane pollution was introduced to test that different proposition. The PLAN final revision already discloses the reconstructed after-snapshot, and this report does not relabel it as directly captured.

## Local commits and restoration evidence

Each mutation's pristine predecessor is R for d1-count, and the preceding row's restoration commit thereafter. Every predecessor and restoration measured all four true. Each mutation tree differs from R only at its stated file, except d3-empty's single path rename. All ten restoration commits have **tree `052098c1dab594e127d29ede189f07f6462f0ed0`**, no changed paths versus R, and the original input hashes below.

| Mutant | One-delta mutant commit | Exact-restoration commit |
| --- | --- | --- |
| d1-count | `48a8b2048d3987308c810f98b6c66607c60e7c77` | `5403ae49ef8c9b7e513218db4fe90916bcb62264` |
| d1-range | `77022ed9b5be5ae909d2b4a0725f20fd73b692cd` | `dc37737c9000ef704cde12db5f9eeb2841ee6781` |
| d2-id | `acb896d82b9eb18f41c76d557df740ffd9fe9c1f` | `e2ba40422f664515db825950aa3686b4fad86e07` |
| d3-wave | `d2537e9388048f419e59b813d5915be8996cc967` | `2f9338e365c62fd75e263a9d5e98e6133a3bf052` |
| d3-agent | `6ce9db3e3fdec6731b751e0691758ccf37ec4cd5` | `d4b875af90fa966c9812f1d8f8633da7c71e3cf0` |
| d4-clone | `32b5f04bb0b7ae6e935f05a0d34a9a904d806ecc` | `33bc9c6a5de7041f468a7e9552b14d09c150eb9a` |
| d4-branch | `b20c3b7096b1fa63650f127e8e26d9be4ea13bbd` | `d1c78cd380134944a99cbebf03b8f11aeec6ebf9` |
| d4-path | `f7e7f2e9b2feb48e1c6e6431f7d3b6e2e66ad5b2` | `bb4d86b818dade76fd83230ceed47c426b1c699f` |
| d3-empty | `2f3d12fe7f1478fe0379a44d7507669e4abad09f` | `520753ea149d335526849d37e7ad7dca8798652f` |
| d4-clean | `b48b973db677dfc9d870546861f3ffffd974c1c5` | `81db46607594f82ae0b69ff35c0a83dfefd93616` |

### Before/after SHA-256

Keys below are full-file byte hashes, not abbreviated digests. For **every** trial, the before and exact-restored hash is the relevant original hash in this table. Other measured inputs retain their original hash throughout that trial. The detector and isolation checker were never edited.

| Key / path | Pristine and restored SHA-256 |
| --- | --- |
| L — `LOG.md` | `ffff35e72b01b9e2cd1dc57fe3d5a5e9de4fb58c2d6c1fc81f21ebec989fa7af` |
| S — `SCORECARD.md` | `54ecbfb30f3013cdef82c7e305ae97e95bedf7daa0944d17054db1c2105cb8d2` |
| G — `.ufo/waves/round-19/w1/swarm-registry.json` | `5a802d7d7c656cbd18ccb48f5daae0bc5fb98acf6924827c5446ddf3e08bc79d` |
| I — `.ufo/waves/round-19/isolation/ledger.json` | `49aef3dc06bb092e7183206d25828a780345385fe714cab6877b67dd0e7623be` |
| Detector — `.ufo/waves/round-19/measure-c3.mjs` | `eaca75db1e26f26894eff87c9d2a124ae47052b6a4f3356bff2ae4ce72bad744` |
| Checker — `.ufo/waves/round-19/isolation/check-isolation.mjs` | `5c42b0af4cb1b88902a20aa81b72a1e6b822a34ebc62a0ab7abb36a42b7145a0` |

| Trial | Mutated input | Mutated SHA-256 |
| --- | --- | --- |
| d1-count | L | `af8f658f11f364694e76ab42ac02239fb5e2c3157b3b293c1aeb49b34f557540` |
| d1-range | L | `b6599bc740e1f7a3793f55734d8f4d50283dd1edb91d852d144d9ad8c73f8ff8` |
| d2-id | S | `0f85e292b0ecf5abed58dbe3b5706754f5cd261958281a9b86fafe52133fb72d` |
| d3-wave | G | `48f59e66476bf5eaa9a4544e439eba863691eb92b24d1cb6b27778a9b0b8b8f5` |
| d3-agent | G | `23685981dba4dac24761cb1dfdfe2f71847d58ebd6276882af38f92f5981a285` |
| d4-clone | I | `a307139b69ef7737a1c99708585c417eac35c8d7370b53478536fd5460e11421` |
| d4-branch | I | `b84406714f5d9845a2f305aa90e81bf127017f7b09483792e79668720792f09b` |
| d4-path | I | `4c1f0274a5201acc70bef91dcd16ffbdd93da253672f3972a6211bddfd7581c6` |
| d3-empty | G path absent; unchanged bytes at `w1/MutateC3-registry.disabled.json` | `5a802d7d7c656cbd18ccb48f5daae0bc5fb98acf6924827c5446ddf3e08bc79d` at temporary name; original name restored afterward |
| d4-clean | I | `e54f40196e4fc63a0b13be8b352e10b59256e1f82deaed975dfcea9e32167775` |

## Retained evidence and local source anchors

The complete machine-readable recording retains the command, full stdout/stderr, exit/signal/error, duration, commit/tree IDs, changed paths, and all seven path/hash observations for each recorded invocation:

- `/fast/scratch/tabi-r19/fx-MutateC3.probe.jsonl` — SHA-256 `1f16fc7ca61cf1f65a70c54076f8927a9842c3cdd999823b786b108605f85fdc`.
- `/fast/scratch/tabi-r19/fx-MutateC3.probe.mjs` — recording driver, SHA-256 `afef9d68501753259d8c1d73c0b01306b6337fc03082582585fe76b6a59883a4`. This retained evidence utility is outside the clone, not a production change or integration candidate.

All local source inspections were on 2026-10-21; no external source body was fetched or quoted. Exact anchors, URLs, and decoded-body/file SHA-256:

- [d1 correction and derivation, lines 113–142](file:///fast/scratch/tabi-r19/fx-MutateC3/.ufo/waves/round-19/measure-c3.mjs#L113-L142); [d3 population/agent checks, lines 280–325](file:///fast/scratch/tabi-r19/fx-MutateC3/.ufo/waves/round-19/measure-c3.mjs#L280-L325); [d4 snapshot shape, lines 341–361](file:///fast/scratch/tabi-r19/fx-MutateC3/.ufo/waves/round-19/measure-c3.mjs#L341-L361); [CLI exit policy, lines 610–624](file:///fast/scratch/tabi-r19/fx-MutateC3/.ufo/waves/round-19/measure-c3.mjs#L610-L624). File SHA-256 `eaca75db1e26f26894eff87c9d2a124ae47052b6a4f3356bff2ae4ce72bad744`.
- [Status parsing/comparison, lines 176–238](file:///fast/scratch/tabi-r19/fx-MutateC3/.ufo/waves/round-19/isolation/check-isolation.mjs#L176-L238); [clone/branch shape, lines 320–340](file:///fast/scratch/tabi-r19/fx-MutateC3/.ufo/waves/round-19/isolation/check-isolation.mjs#L320-L340); [changed paths, lines 432–448](file:///fast/scratch/tabi-r19/fx-MutateC3/.ufo/waves/round-19/isolation/check-isolation.mjs#L432-L448). File SHA-256 `5c42b0af4cb1b88902a20aa81b72a1e6b822a34ebc62a0ab7abb36a42b7145a0`.

The detector checks 23 ledger entries against machine-local original writer clones. Those clones were only read through the unchanged detector; none was edited. These outcomes apply to R and that available clone population, not to a later integrated revision or an environment where those clones are missing.

## Integration notice received from L1

L1 reported during this probe that the current C3 CLI exits 1 whenever the evaluated count is not four, so baseline count zero cannot reproduce through the frozen `check-measurement-binding.mjs` `reproduceArm`, which requires exit 0. This report accepts that reported integration failure; it was **not independently rerun** here. The R CLI source at `measure-c3.mjs:610-624` exhibits the reported exit policy, and the exit-1 partial-count rows above are direct observations of it.

L1 stated the planned integration change is only to the new C3 CLI: exit 0 for evaluated counts, read counts/reasons, retain exit 2 for evaluation errors and self-test exit 1, and do not make the registry-label probe a gate. No such edit was made by this seat. All exit columns in this report describe **R before that change**; no result for the future change is claimed.

## Isolation

- Clone: `/fast/scratch/tabi-r19/fx-MutateC3` (private falsification sandbox; no sibling source writes).
- Branch: `r19/fx-MutateC3`.
- Base: attacked R `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`, as required by the falsification override; historical production baseline B is `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Final exact-restoration commit: `81db46607594f82ae0b69ff35c0a83dfefd93616`.
- Final tracked tree: `052098c1dab594e127d29ede189f07f6462f0ed0`, equal to R; final changed paths versus R: **none**.
- Transient mutant paths: `LOG.md`, `SCORECARD.md`, `.ufo/waves/round-19/w1/swarm-registry.json`, `.ufo/waves/round-19/w1/MutateC3-registry.disabled.json` (rename only), `.ufo/waves/round-19/isolation/ledger.json`; all restored, temporary rename absent.
- Only direct LANE write by this seat: `.ufo/waves/round-19/w2/MutateC3.md`. No LANE Git write, jj invocation, integration, shipping, domain-source edit, real-site access, browser-profile access, host mutation, or package transaction was performed.
