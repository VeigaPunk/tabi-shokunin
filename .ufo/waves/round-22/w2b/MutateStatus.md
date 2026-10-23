# MutateStatus — round-22/w2b mutation probe

Review revision: **e3cf4e0d30bb835532ff44b118c5ad52e09eb76d**. All source line references below are to that revision, not a later repair. Scope: status/errorText checks in `.ufo/waves/round-22/measure-c1.mjs`, using the unchanged `.ufo/waves/round-22/selftest-c1.mjs` as detector.

## Axes and bounded result

Axes: wrong-status rejection; exact error-text value/presence rejection; preservation of the existing positive population; isolated execution and byte-exact restoration.

**Six single-defect variants: three killed, three survived.** One survivor (M6) demonstrably admits a wrong error-text value while the unchanged selftest remains **44/44**. M2/M3 remove overlapping status guards; their survival did not demonstrate acceptance of invalid evidence. A separate first M2 attempt failed environmentally with ENOSPC and is **inconclusive**, not a kill.

This is a regression-detector coverage finding, **not a demonstrated bug in the committed oracle**: pristine and restored oracle bytes reject the one-character counterexample. No browser was run; no new observations, capability, depth, scalar, or promotion are claimed. The positive population stayed the same retained 12 rows.

## F1 — exact errorText value comparison can become self-comparison without failing selftest

**Kind:** non-equivalent surviving mutant / semantic-oracle regression coverage gap.

Exact anchors at the review revision:

- `.ufo/waves/round-22/measure-c1.mjs:294–298`: construct expected `errorText`, compare the complete response, and emit `semantic_error`.
- `.ufo/waves/round-22/selftest-c1.mjs:190–197`: the error-text recipe deletes the property; it does not change a present value.
- `.ufo/waves/round-22/fixtures/expected.json:196–261`: all six direct error-text fixtures use `missing-error-text`.
- `corpus/evidence/round-21/runtime/na-reject.json:196–205`: response sequence 15 has status `Error` and errorText `respondWith promise was rejected`.

Smallest code mutant, at measure line 294:

```diff
- if (Object.hasOwn(expectedResponse, 'errorText')) expectedParams.errorText = expectedResponse.errorText;
+ if (Object.hasOwn(expectedResponse, 'errorText')) expectedParams.errorText = response.params.errorText;
```

This is a one-expression expected/actual mix-up. The unchanged detector returned `{"verdict":"clean","cases":44,"passed":44}`, process exit **0**, for this mutant. Its unchanged positive remained `exit=0, value=12, verdict=clean, findings=[]`.

### Smallest counterexample and preserving positive

Starting with the retained `na-reject` row, append exactly one character to the correlated response's present string:

```text
respondWith promise was rejected
respondWith promise was rejected!
```

Keep status, invocation ID, frame sequence/timestamps, page errors, fixtures, producer and expectations unchanged. Update the matching receipt `after.responses` copy and only the dependent raw/receipt/acquisition hashes, so this tests semantics rather than stale binding. The probe operated on an in-memory file map; it did not rewrite retained observations on disk.

Actual bounded witness results (each witness process exited **0**; `evaluate.exit` is reported separately):

| Oracle bytes | Unmodified preserving positive | One-character counterexample | Counterexample finding |
|---|---|---|---|
| Pristine P | evaluator exit 0; clean; value 12; 12 rows | evaluator exit 1; failed; value 0; 12 rows | `semantic_error`, `na-reject:exact-error-text-or-output-presence` |
| M6 | evaluator exit 0; clean; value 12; 12 rows | evaluator exit 0; clean; value 12; 12 rows | none |
| Restored P | evaluator exit 0; clean; value 12; 12 rows | evaluator exit 1; failed; value 0; 12 rows | `semantic_error`, `na-reject:exact-error-text-or-output-presence` |

No `evidence_binding` finding occurred in this witness. Original raw SHA-256: `a57b41bd0b1c904162f32798b5d0a5797c57ec1a667ef40357846c7dac49f741`. Counterexample raw SHA-256: `81ae2fb561c64520fd5605102eb9d614ec7576e3f4ec36b7e9491595bbaafffd`.

The missing-property fixtures still kill missing text under M6: the mutant builds an own `errorText: undefined` property, which deep equality distinguishes from an absent actual property. Therefore property-deletion fixtures do not establish comparison against the independent expected string.

**Smallest fix:** leave committed line 294 unchanged. Add one `wrong-error-text` fixture recipe using the existing helpers, and one expected `na-reject` fixture requiring exit 1, value 0, verdict `failed`, finding `semantic_error`:

```js
changeCase(files, caseId, (record, raw) => {
  responseFor(raw, record).params.errorText += '!';
  syncResponses(record, raw);
});
```

`changeCase` already reseals acquisition links. Preserve the existing positive fixture at value 12. This single addition would distinguish pristine from the demonstrated M6 counterexample; it is a recommended test change, **not applied in this report-only assignment**.

## All mutation outcomes

`exit, passed/cases` refers to the actual selftest child, not the evaluator's status on an intentionally invalid fixture. Every completed run had empty stderr and no signal/error. P0 was the initial direct pristine run. Each previous exact restoration also serves as the next variant's pristine run; M2 was re-baselined after the environmental failure.

| Mutant | Original measure lines | One change | Pristine detector | Mutated detector | Restored detector | Verdict |
|---|---|---|---|---|---|---|
| M1 | 291 | `status !== expectedResponse.status` → `status === expectedResponse.status` | P0: 0, 44/44 | 1, 43/44 | R1-pristine: 0, 44/44 | Killed |
| M2 | 291 | Delete the `outcome-status` guard | R2-after-ENOSPC: 0, 44/44 | 0, 44/44 | R2-pristine: 0, 44/44 | Survived; overlapping status checks |
| M3 | 259–260 | Delete `finite-window-response-statuses` branch | R2-pristine: 0, 44/44 | 0, 44/44 | R3-pristine: 0, 44/44 | Survived; overlapping status checks |
| M4 | 294 | `Object.hasOwn(expectedResponse, errorText)` → its negation | R3-pristine: 0, 44/44 | 1, 43/44 | R4-pristine: 0, 44/44 | Killed |
| M5 | 297–298 | Drop only error-specific mismatch diagnostic; keep output mismatch branch | R4-pristine: 0, 44/44 | 1, 38/44 | R5-pristine: 0, 44/44 | Killed |
| M6 | 294 | `expectedResponse.errorText` → `response.params.errorText` | R5-pristine: 0, 44/44 | 0, 44/44 | R6-pristine: 0, 44/44 | Survived; demonstrated acceptance regression |

Actual failed selftest cases:

- **M1:** only `positive` failed; observed evaluator exit 1, value 0, verdict `failed`, with 11 `semantic_status` / `outcome-status` findings. The comparison reversal rejects valid responses. Detector: 43/44, exit 1.
- **M4:** only `positive` failed; evaluator exit 1, value 0, verdict `failed`, with five `semantic_output` and six `semantic_error` findings. Detector: 43/44, exit 1.
- **M5:** six cases failed: `missing-cancel-text-na-reset`, `missing-cancel-text-na-remove`, `missing-error-text-na-reject`, `missing-error-text-na-throw`, `missing-error-text-na-invalid-submit`, `missing-error-text-auto-invalid`. Each invalid fixture was incorrectly returned as evaluator exit 0, value 12, clean, no findings. Its preserving positive stayed clean at 12. Detector: 38/44, exit 1.
- **M2/M3/M6:** no failed selftest case; detector 44/44, exit 0. M6's additional counterexample above demonstrates why its survival matters.

### Status-branch survivors: observed overlap, not a proven acceptance bug

The existing `status-na-reject` fixture changes the response from Error to Completed and changes its payload consistently (`selftest-c1.mjs:144–151`). Its unmodified preserving positive is the same 12-row fixture. Actual observations:

| Oracle | Fixture evaluator output | Finding details |
|---|---|---|
| Pristine | exit 1, value 0, failed | `finite-window-response-statuses`, `outcome-status`, `exact-error-text-or-output-presence` |
| M2, line 291 removed | exit 1, value 0, failed | `finite-window-response-statuses`, `exact-error-text-or-output-presence` |
| M3, lines 259–260 removed | exit 1, value 0, failed | `outcome-status`, `exact-error-text-or-output-presence` |

All twelve wrong-status fixtures still passed their rejection expectations under both deletions. `selftest-c1.mjs:382` requires inclusion of a finding **ID**, not a particular detail, so either remaining status check satisfies it. **[INFERENCE]** These guards overlap for this pinned contract; global equivalence was not proved. No invalid accepted status counterexample is claimed.

Smallest response if these individual diagnostic branches must themselves be protected: assert the specific `outcome-status` and `finite-window-response-statuses` details on the existing status fixture. Otherwise retain the distinction between redundant-guard survivors and the non-equivalent F1 survivor; no production semantic fix is established by M2/M3.

## Before/after hashes and restoration

P, the original and every restored `measure-c1.mjs` SHA-256:

```text
47176aed1955f60547c97303d23530069848320f0f2ab773e0f68ee0b6b0775c
```

Each mutant was applied alone in the private clone. For every completed mutation detector run, its before/after source hash was identical to the mutant hash below; the subsequent restored detector run had P both before and after execution.

| Mutant | Mutated measure SHA-256 | Source transition |
|---|---|---|
| M1 | `30e3247c116f4ff247c6f5a6d216026d8dff69be9183eebbdc494d00fe6a689e` | P → mutant → P |
| M2 | `736f5ae0d64c341a142ba482b17beefce8abf655d5bb7a7d1224cb62d9928255` | P → mutant → P |
| M3 | `8c91007a6535287de8f30957bab1e7fb91f994363cd45e4430eec8545544e0cc` | P → mutant → P |
| M4 | `c47f667a275b1d046a54f0a04a8fd764e942891c6458945128736dad0abe0441` | P → mutant → P |
| M5 | `31bcf6c658cab518f15000a5f67040e5f3ab3915b4f445aaaf5d26fab5305de3` | P → mutant → P |
| M6 | `e63ba8c60a073b600f71bce00e2726ddcddecc270439c86038b247b47c765055` | P → mutant → P |

The selftest and its expected fixture were never edited. Their hashes were unchanged in all 13 recorded wrapper receipts, including all seven pristine/restoration runs:

```text
selftest-c1.mjs      985aa9c77452368bb8381695ed406fa3b633940e3c328f4c96773248f98dc5b6
fixtures/expected.json b1380a0b21a26d320729514b4bc5c7d8a2f5361d5df6d9af5badde95f9fadade
```

R1, R2-after-ENOSPC, R2, R3, R4, R5 and R6 each returned exit 0, clean, 44/44, with positive value 12. Restoration was completed even after the environmental failure.

## Execution receipts and bounds

All repository checks ran with `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node` (**v24.21.0**) and cwd `/tmp/tabi-r22-w2b-MutateStatus`, never in the lane. The scratch detector wrapper invoked this exact unchanged command synchronously, with a 120-second outer timeout and the selftest's unchanged per-CLI 30-second timeout:

```text
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node .ufo/waves/round-22/selftest-c1.mjs
```

The wrapper only recorded child stdout/stderr, actual exit/signal/error and before/after hashes; it did not alter fixture cases or oracle expectations. It set TMPDIR inside the private clone for its selftest's own temporary Git repositories.

| Wrapper label / exercised argument | Actual detector exit | Actual passed | Raw detector stdout SHA-256 |
|---|---|---|---|
| `M1-flip-status` | 1 | 43/44 | `c54fb2fba0214ca962cbce661139b4a1600809c375645889b0275807c54a1dd0` |
| `R1-pristine` | 0 | 44/44 | `044699f40be437ebec6607bf2efe55a317118a199b477b3d8955807e68a67f3b` |
| `R2-after-ENOSPC` | 0 | 44/44 | `0d018bb93546a5acc64764712832d7397ad9631ceabb7703a5db28ef64ed7785` |
| `M2-drop-status-retry` | 0 | 44/44 | `1fc60b6a97cdf7352ad9ba796430a8353884f9a2b9c64c2edfd1d1707ad6fce0` |
| `R2-pristine` | 0 | 44/44 | `195d35e3b329b5ddccbf5ef1b93d1a0713a08dcad13f076204873914e609384d` |
| `M3-drop-window-status` | 0 | 44/44 | `33533beab0564dff892ab2cd63ec7efc0917260b279bb3e0342c8d7842cea377` |
| `R3-pristine` | 0 | 44/44 | `1f1240fe5c0ccc707f449fb5cf307ccc9eb38d53f3da16fc9a8d21759b762ff0` |
| `M4-flip-error-branch` | 1 | 43/44 | `0861707cd0d64ef40db26fd9789b866bb12a0c95e36cb73e6ee63d31ce04576d` |
| `R4-pristine` | 0 | 44/44 | `8e363f2f83a0f9da6d8249321ef907d0dd501eb2823a6cc2ef0e04b1e9af0b86` |
| `M5-drop-error-diagnostic` | 1 | 38/44 | `3471bd4f9e38e9dbea0f4a741cd39bc4c1228cfc486edb8388302eaefa848544` |
| `R5-pristine` | 0 | 44/44 | `344ce36d9322d2f3febc547ab579fb6d1efa2c3f18bcc90c842f3996b0d4f841` |
| `M6-copy-observed-error-text` | 0 | 44/44 | `e3794bd118d74a1e82f29208b7e2c3152753a5c4f51471ff9d92e629ffd4d6cb` |
| `R6-pristine` | 0 | 44/44 | `9b9fab4a0e76c11fcc8f84dfb10253179268b5212e41976175e941e5960e6470` |

Raw stdout includes temporary fixture commit identities, so restored runs need not have identical stdout digests. The original direct P0 invocation also exited 0, clean, 44/44; its unmodified positive returned 12.

Other exercised commands and actual outcomes:

- `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin ls-tree -r --name-only <review-revision>`: exit 0. An earlier literal `ls-tree` path-filter attempt returned empty output, exit 0; the complete tree resolved the paths.
- `git clone --no-hardlinks /home/vgpnk/Projects/shokunin/tabi-shokunin /tmp/tabi-r22-w2b-MutateStatus` followed by private `checkout --detach <review-revision>`: combined exit 0; checkout printed `HEAD is now at e3cf4e0`.
- `git -C <lane> show <review-revision>:PATH` for `measure-c1.mjs`, `selftest-c1.mjs`, `fixtures/expected.json`, and `corpus/evidence/round-21/runtime/na-reject.json`: exit 0 for each. Production content was read through these revision-pinned commands.
- Assigned `node --version`: exit 0, `v24.21.0`. `sha256sum` on oracle, selftest and expected fixture: exit 0, hashes above.
- `.mutation-error-witness.mjs pristine`, `mutated`, and `restored`, each run with the assigned Node binary: process exit 0 each; evaluator outputs are shown in F1. This helper loaded checked-out input bytes and changed only the in-memory counterexample map.
- Initial M2 attempt: no JSON result; actual stderr contained `Error: ENOSPC: no space left on device, open '/tmp/tabi-r22-w2b-MutateStatus/.mutation-selftest-temp/tabi-r22-c1-cli-selftest-mbiJ4K/positive/SKILL.md'` (errno -28). The wrapper's outer exit was not retained because writing its receipt also failed; **no exit value is invented**. This attempt is inconclusive. `df -h /tmp` exited 0 and showed only 352K available. `du` exited 0 and showed the private clone at 112M, including 35M of private Git objects.
- After immediately restoring P, `rm -rf -- /tmp/tabi-r22-w2b-MutateStatus/.git && df -h /tmp`: exit 0; 130M available. This removed only disposable cloned object storage, not lane/fleet Git state. The checked-out source bytes were retained; the selftest creates its own isolated repositories. R2-after-ENOSPC then passed 44/44 before M2 was retried.
- Final `rm -rf -- /tmp/tabi-r22-w2b-MutateStatus && test ! -e /tmp/tabi-r22-w2b-MutateStatus`: exit 0. **The entire scratch copy, helpers and receipts were removed after evidence collection.**

14 detector invocations completed (P0 plus 13 recorded wrapper invocations); one additional environmental attempt was inconclusive. No separate `run-checks.py` cohort, other suite, live-browser/runtime acquisition, service, REA, installation/update, delegation, messaging, or lane/fleet VCS mutation was performed. No production repair is included. The sole lane write is this report.

Report: .ufo/waves/round-22/w2b/MutateStatus.md
