# MutateLanding — post-crash landing-stage mutation probe

## Result

**Six isolated mutants: five killed, one survived the committed 44-case selftest.** The survivor removes the native landing's nonce-absence check. A directed, linkage-preserving negative demonstrates the lost behavior: pristine/restored reject it; the survivor accepts it and counts 12.

This is a **selftest coverage finding**, not a demonstrated bug in the production oracle at the reviewed revision, not malicious-author authentication, and not a browser-conformance or promotion finding. No production repair was made.

- Review revision: `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` throughout.
- Scope: `.ufo/waves/round-22/measure-c1.mjs:107-145`, specifically landing classification, nonce/submits/errors absence, and embedded query-token resolution/comparison.
- Axes: semantic rejection sensitivity; preservation of the retained positive population; exact-byte restoration and execution isolation.
- Production was read with `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show e3cf4e0d30bb835532ff44b118c5ad52e09eb76d:PATH`. Mutations and executions used only `/tmp/tabi-r22-w2b-MutateLanding`.
- The detector and its expectation table were never mutated. Shared-oracle probes were sequential so each had a clean baseline and exact restoration; independent source reads were batched.

## Detector and baseline

Expected behavioral detector, actually invoked by the reporting wrapper:

```text
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node .ufo/waves/round-22/measure-c1.mjs --selftest
```

Observed Node version: `v24.21.0`. Each complete selftest was bounded by a 90-second `spawnSync` timeout. The committed selftest independently bounds each fixture CLI to 30 seconds. No timeout occurred in a completed run.

The wrapper reported the child's actual process exit, selftest verdict/pass count, failing fixture outputs, and oracle SHA-256 before/after the detector. It also imported the current scratch oracle and ran `evaluate(filesAt(reviewRevision))`, followed by the single nonce-presence counterexample described below. Its wrapper exit equals the selftest exit for valid selftest JSON; a non-JSON infrastructure failure exits 2.

Pristine and every successful restored run produced:

```json
{"selftestExit":0,"verdict":"clean","passed":44,"cases":44}
```

The unmodified retained-positive evaluation produced:

```json
{"exit":0,"value":12,"verdict":"clean","findings":[]}
```

Pristine controls also produced the specific expected diagnostics, without `evidence_binding` masking:

| Existing control | Oracle exit/value | Exact finding |
|---|---|---|
| `native-submits-empty` | `1 / 0` | `semantic_status`, `na-native-submit:post:submit-observation` |
| `native-landing-errors` | `1 / 0` | `semantic_error`, `na-native-submit:post:page-errors` |
| `native-landing-wrong-query` | `1 / 0` | `semantic_navigation`, `na-native-submit:post:url` |

Control recipes are at reviewed-revision `.ufo/waves/round-22/selftest-c1.mjs:206-228`; their independent expected outcomes are at `.ufo/waves/round-22/fixtures/expected.json:273-305`. The selftest reads the integrated oracle at execution time at `.ufo/waves/round-22/selftest-c1.mjs:51-58`.

## Individual mutants and actual outputs

All source references in this table mean revision `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`, path `.ufo/waves/round-22/measure-c1.mjs`. Each row changes only the named statement; it is restored before the next row.

| Mutant | Smallest behavior change | Expected detector | Actual selftest output | Verdict |
|---|---|---|---|---|
| M1, line 117 | `const landing = id === 'na-native-submit';` — omit the post-stage guard | Positive fixture must detect erroneous treatment of the pre-action fixture as a fresh landing | Exit **1**, `43/44`, `failed`; only `positive` fails. Its oracle output is exit 1/value 0 with `semantic_status: na-native-submit:pre:nonce-state` and `semantic_error: na-native-submit:pre:page-errors` | **Killed** |
| M2, line 119 | Replace the ternary condition with `expectedNonce !== undefined && actual.nonce !== expectedNonce`, skipping nonce absence on the landing | A landing with an own `nonce` key must be rejected; a dedicated negative is needed to exercise this branch | Exit **0**, `44/44`, `clean`; positive remains exit 0/value 12. Directed nonce-presence negative also becomes exit 0/value 12/findings `[]` | **Survived selftest** |
| M3, line 122 | Replace `Object.hasOwn(actual, 'submits')` with `actual.submits?.length`, accepting an empty recorder instead of absence | `native-submits-empty` | Exit **1**, `43/44`, `failed`; only that control fails because its oracle output becomes exit 0/value 12/`clean`/findings `[]`. Positive remains clean at 12 | **Killed** |
| M4, line 129 | `if (landing ? false : !equal(actual.errors, expected.errors))` — skip landing error-recorder absence | `native-landing-errors` | Exit **1**, `43/44`, `failed`; only that control fails because its oracle output becomes exit 0/value 12/`clean`/findings `[]`. Positive remains clean at 12 | **Killed** |
| M5, lines 138-139 | `const expectedSearch = resolveTokens(expected.urlSearch, nonce, inputQ);` — regress to whole-value token resolution | Positive fixture with embedded `?q=$nonce` | Exit **1**, `43/44`, `failed`; only `positive` fails, with oracle exit 1/value 0 and `semantic_navigation: na-native-submit:post:url` | **Killed** |
| M6, line 140 | Replace `url.search !== expectedSearch` with `(url.search !== expectedSearch && !(landing && url.search.startsWith('?q=')))`, accepting any landing `q` value | `native-landing-wrong-query` | Exit **1**, `43/44`, `failed`; only that control fails because its oracle output becomes exit 0/value 12/`clean`/findings `[]`. Positive remains clean at 12 | **Killed** |

All completed mutated and restored selftests had empty stderr, null process signal, and no spawn error. For M1 and M5 the killed mutant rejects a valid positive; the **pristine baseline did not fail**. The production positive's required landing query is independently retained at reviewed-revision `corpus/evidence/round-22/semantic-expectations.json:78-81`.

## Finding COV-LANDING-NONCE: an absence-check regression survives

**Location:** revision `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d`, `.ufo/waves/round-22/measure-c1.mjs:117-120`; relevant selftest extension point `.ufo/waves/round-22/selftest-c1.mjs:217-228` and expectation-table controls `.ufo/waves/round-22/fixtures/expected.json:273-305`.

The production rule correctly requires an absent own `nonce` property on the native-submit post-action landing. The selftest covers absent-versus-empty `submits` and `errors`, but M2 establishes that its current 44 cases do not protect the corresponding nonce branch.

### Smallest counterexample

Start with `filesAt(e3cf4e0d30bb835532ff44b118c5ad52e09eb76d)`. In the `na-native-submit` **after-action page-state only**, add this one field:

```json
"nonce": "8a5839ad-fc49-4ed6-8661-501aa2c5c4a4"
```

This deliberately uses the correct current-case nonce: mere presence is invalid on the fresh landing, not only a mismatching value. The retained nonce is at `corpus/evidence/round-21/runtime/na-native-submit.json:4`. The post-action raw frame and page-observation mirror are at lines 242-249 and 271-280 respectively.

To keep the negative semantic rather than a stale-link test, the exercised in-memory probe:

1. Adds that own property to `raw.pageObservations`' `after-action` value.
2. Copies that value into the matching raw observation frame and `receipt.cases[na-native-submit].after.pageState`.
3. Re-encodes the raw artifact, updates that receipt row's raw SHA-256, re-encodes the receipt, and updates the acquisition's raw/receipt artifact digests plus `receiptSha256`.
4. Leaves nonce identity, fixture bytes, pinned expectations, response/output, navigation frames, timing, and all other cases unchanged.

This is the same linkage-preserving negative-fixture technique used by the committed selftest. It makes no claim about authenticating a hostile publisher.

Actual directed outputs:

| Bytes | Counterexample output | Preserving positive output |
|---|---|---|
| Pristine | `{"exit":1,"value":0,"verdict":"failed","findings":[{"id":"semantic_status","detail":"na-native-submit:post:nonce-state"}]}` | Exit 0/value 12/`clean`/findings `[]` |
| M2 | `{"exit":0,"value":12,"verdict":"clean","findings":[]}` | Exit 0/value 12/`clean`/findings `[]` |
| Restored | Same exact nonce-state rejection as pristine | Exit 0/value 12/`clean`/findings `[]` |

**Smallest fix:** keep production line 119 unchanged. Add one `native-landing-nonce` selftest recipe beside the existing landing controls, using `changeCase` to add `record.nonce` to the three page-state mirrors above; existing resealing handles the links. Add one independent expected case with exit 1, value 0, verdict `failed`, finding `semantic_status`. The exercised directed probe establishes the exact intended detail `na-native-submit:post:nonce-state`. Do not change the pinned semantic expectations or relax the absent-key contract. This report-only assignment does not implement that fix.

## Byte restoration evidence

Pristine oracle SHA-256, denoted **H** below:

```text
47176aed1955f60547c97303d23530069848320f0f2ab773e0f68ee0b6b0775c
```

Each detector recorded identical before/after hashes within its run. Across each mutation cycle:

| Mutant | Pristine hash | Mutated hash | Restored hash | Restored detector |
|---|---|---|---|---|
| M1 | H | `6461209b006e1e4b08248d2e15d00726aa36cde26412e50622ca42e0c0db6359` | H | Exit 0, 44/44 |
| M2 | H | `7a351e6380fad38436cb7cf22edcee84add79ba1dfc9b8a4c5fc8113fa564b23` | H | Exit 0, 44/44 |
| M3 | H | `c80476881cc939343100a4657e5dfc06b3aae9a36226d20856c2430b47b72197` | H | Exit 0, 44/44 |
| M4 | H | `c4f3d63c8b749dbc17eeb657f80cd862c29cf1198b0c81686cef81161984ec78` | H | Exit 0, 44/44 |
| M5 | H | `47789b8c82ebb07b0cf3c6b0d659d089ecf183bdc32ec0c38d2bae9ea32906fe` | H | Exit 0, 44/44 |
| M6 | H | `b69e0fda9cb9639c38e8e8ff8b860a842e8376d9355da547cc36d633fc8af0f8` | H | Exit 0, 44/44 |

Final `sha256sum` after the restored M6 detector exited 0:

```text
47176aed1955f60547c97303d23530069848320f0f2ab773e0f68ee0b6b0775c  .ufo/waves/round-22/measure-c1.mjs
985aa9c77452368bb8381695ed406fa3b633940e3c328f4c96773248f98dc5b6  .ufo/waves/round-22/selftest-c1.mjs
b1380a0b21a26d320729514b4bc5c7d8a2f5361d5df6d9af5badde95f9fadade  .ufo/waves/round-22/fixtures/expected.json
```

These match the initial scratch hashes and the committed post-crash repair's recorded after-hashes. After collecting this evidence, the private clone and both temporary reporting helpers were deleted. Cleanup command exited 0 and printed `Private clone removed; no scratch path remains.`

## Execution ledger and infrastructure interruptions

Common working directory for checks: `/tmp/tabi-r22-w2b-MutateLanding`. All commands below were exercised; no lane check was run in the production lane.

### Setup and read-only production access

- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin ls-tree -r --name-only e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` — exit 0.
- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show e3cf4e0d30bb835532ff44b118c5ad52e09eb76d:PATH` — exit 0 for each of: `AGENTS.md`; `.ufo/waves/round-22/measure-c1.mjs`; `.ufo/waves/round-22/selftest-c1.mjs`; `.ufo/waves/round-22/post-crash-repair.json`; `.ufo/waves/round-22/fixtures/expected.json`; `corpus/evidence/round-22/semantic-expectations.json`.
- `test ! -e /tmp/tabi-r22-w2b-MutateLanding && git clone --no-hardlinks --no-checkout /home/vgpnk/Projects/shokunin/tabi-shokunin /tmp/tabi-r22-w2b-MutateLanding && git -C /tmp/tabi-r22-w2b-MutateLanding checkout --detach e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` — exit 0.
- `mkdir /tmp/tabi-r22-w2b-MutateLanding/probe-tmp && /home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node --version && sha256sum ...` — exit 0; version and hashes recorded above.

### Detector invocations

`N` below is `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`.

Initial exact command family: `N probe-selftest.mjs LABEL`.

| Label | Wrapper exit | Detector result |
|---|---:|---|
| `pristine` | 0 | Clean, 44/44 |
| `M1-landing-stage-guard-removed` | 1 | Failed, 43/44; valid mutant kill |
| `restored-M1` | 0 | Clean, 44/44 |
| First `M2-landing-nonce-absence-disabled` attempt | 2 | Selftest child exit 1 before JSON: `git_failed:init:error: couldn't set 'HEAD'`; **inconclusive** |
| `restored-M2-after-inconclusive` | 2 | Selftest child exit 1 before JSON: `ENOSPC ... mkdtemp`; **inconclusive baseline**, never counted as a kill |
| `pristine-after-capacity-mitigation` | 2 | Selftest child exit 1 before JSON: Git could not write `malformed-raw-frames/.git/config: No space left on device`; **inconclusive baseline** |

The oracle was restored immediately after the first interrupted M2 run. `df -h /tmp` and `df -i /tmp` (both exit 0) observed full/near-full shared storage; one observation had only 352 KiB available. `du -sh .git corpus .ufo` and `du --inodes -s .git` (exit 0) scoped recovery to owned scratch data.

Scratch-only storage mitigation, all successful:

- `git -C /tmp/tabi-r22-w2b-MutateLanding sparse-checkout set --no-cone ...` retained only the oracle, selftest/fixture inputs, retained runtime, producer, note, and expectations needed for this probe — exit 0.
- `rm -rf /tmp/tabi-r22-w2b-MutateLanding/.git/objects` — exit 0, removing only duplicated private clone objects. A private `objects/info/alternates` file then pointed to the production object store **read-only**. No production Git write was performed.
- Because shared storage still filled during a pristine selftest, subsequent runs used an ephemeral user/mount namespace: a helper mounted a 256 MiB tmpfs at the private clone's own `probe-tmp` directory, then launched the unchanged reporting wrapper and unchanged selftest. The mount existed only in that child namespace and disappeared with its process. This did not alter the behavioral detector or invoke a browser/runtime acquisition.

Exact successful command family after storage isolation:

```text
unshare --user --map-root-user --mount --fork /home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node probe-private-ns.mjs LABEL
```

The namespace helper executed `/usr/bin/mount -t tmpfs -o size=256M,nr_inodes=65536 tmpfs /tmp/tabi-r22-w2b-MutateLanding/probe-tmp`, then `N probe-selftest.mjs LABEL`; it aborted on a mount failure. All listed namespace runs reached the original selftest and returned its exit.

| Label | Command/selftest exit | Actual result |
|---|---:|---|
| `pristine-private-tmpfs` | 0 | Clean, 44/44; fresh valid baseline |
| `M2-landing-nonce-absence-disabled` | 0 | Clean, 44/44; **survivor** |
| `restored-M2` | 0 | Clean, 44/44; also the pristine baseline for M3 |
| `M3-landing-submits-empty-accepted` | 1 | Failed, 43/44 |
| `restored-M3` | 0 | Clean, 44/44; also the pristine baseline for M4 |
| `M4-landing-errors-check-disabled` | 1 | Failed, 43/44 |
| `restored-M4` | 0 | Clean, 44/44; also the pristine baseline for M5 |
| `M5-query-whole-token-resolution` | 1 | Failed, 43/44 |
| `restored-M5` | 0 | Clean, 44/44; also the pristine baseline for M6 |
| `M6-landing-query-presence-only` | 1 | Failed, 43/44 |
| `restored-M6` followed by final `sha256sum` | 0 | Clean, 44/44; exact restoration hashes above |

The three storage-interrupted attempts are not survivor/kill evidence. The final M2 conclusion uses the complete fresh pristine → mutated → restored namespace runs.

Cleanup actually exercised:

```text
rm -rf /tmp/tabi-r22-w2b-MutateLanding && test ! -e /tmp/tabi-r22-w2b-MutateLanding && printf 'Private clone removed; no scratch path remains.\n'
```

Exit: 0.

## Limits

No browser, service, credential access, REA, delegation, background job, seat messaging, lane/fleet VCS mutation, or tool installation/update was performed. The only persistent write is this assigned report. No whole `run-checks.py` cohort, unrelated lane test, arbitrary-nonce URL-encoding matrix, or general browser semantics test was run or claimed. The scope remains author-side falsification over the same retained round-21 observations; population, metric, target, depth, scalar, and admission status are not changed by this probe.
