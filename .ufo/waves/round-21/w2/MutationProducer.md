# Round21 w2 — MutationProducer

## Scope and axes

- **Depth:** distinguish immutable source identity, receipt-relative byte integrity, and behavioral/authenticity claims.
- **Calibration:** separate persisted expected findings and static predictions from executed detector results.
- Author-side leaf review only. No admission, integration, fleet-state, actor-quiescence, branch-coverage, or source-to-binary-equivalence claim.
- **Execution status: static-only.** No producer, counter, selftest, browser, build, test, linter, formatter, or alternative runtime was invoked. No scratch mutation was authorized or made. All mutant outcomes below are **[INFERENCE]**, not observed kills/survivals. The only commands executed were two identical read-only `sha256sum` inventories.

## Four existing finite identity controls

The independent persisted oracle is `.ufo/waves/round-21/fixtures/expected.json:33-54`. The mutation builder is `selftest-c1.mjs:17-31`; its four early returns intentionally bypass the rehashing code at lines 97-98.

| Control | Exact existing data mutation | Pin deliberately left unchanged | Counter detection anchor | Persisted expected result |
|---|---|---|---|---|
| `producer-edit` | `files['scripts/webmcp-lifecycle-round21.mjs'] += '\nchanged'` (`selftest:28`) | `receipt.producer.sha256` | `measure-c1.mjs:47` recomputes producer SHA-256 and checks the fixed producer path | exit 1, value 0, finding `producer_digest` (`expected:33-36`) |
| `source-edit` | append `\nchanged` to `.ufo/waves/round-21/sources/html_form_element.cc` (`selftest:29`) | opening metadata, registry row, and validator's fixed `SOURCE_SHA` | `measure:33-34,58` checks the source body against the literal digest and exact S100 URL/ID | exit 1, value 0, finding `source_binding` (`expected:39-42`) |
| `evidence-edit` | append one LF to the first case JSON (`selftest:30`) | first receipt case's `evidence.sha256` | `measure:67-70` hashes the original JSON bytes, not parsed/canonicalized JSON | exit 1, value 0, finding `evidence_digest` (`expected:45-48`) |
| `fixture-edit` | append `changed` to the first case HTML (`selftest:31`) | evidence object's `fixture.sha256` | `measure:74-77` checks fixture path/hash/nonce and form autosubmit presence | exit 1, value 0, finding `fixture_digest` (`expected:51-54`) |

[INFERENCE] On an otherwise clean positive fixture, each mutation isolates its named finding: the evidence LF preserves the parsed object; the fixture suffix preserves its nonce and opening form tag; producer/source bytes are never executed by the counter. These are byte-integrity controls, not proof that changed producer/fixture behavior was exercised.

The oracle is loaded separately from `fixtures/positive-ordered.json` (`selftest:10-11`). Each case clones BASE, applies its named mutation, copies the current counter, commits a disposable repository, and invokes the revision CLI with a 30-second timeout (`selftest:103-111`). The assertion checks exact process exit and value plus **membership** of the expected finding; it does not require an exact singleton finding set (`selftest:113-115`). Thus the IDs above are stable required findings, not a claim that the assertion rejects every additional diagnostic.

## One proposed behavior-bearing mutant and smallest finite red

**Mutant:** accidentally trust the producer's declared digest instead of recomputing it. In an L1-owned isolated copy only, change the expression at `measure-c1.mjs:47`:

```js
receipt.producer.sha256 !== sha(get(PRODUCER))
```

to:

```js
receipt.producer.sha256 !== receipt.producer.sha256
```

This is one expression-level defect. The path/existence checks remain intact; only producer byte binding is lost. **Not applied here.**

**Expected detector:** the already-persisted `producer-edit` CLI case and independent `expected.json:33-36`. The smallest equivalent data red is one appended LF in BASE's producer string, with `receipt.producer.sha256` frozen; the existing `\nchanged` mutation is sufficient without any new fixture/oracle entry. Do not regenerate expected results from the counter under mutation.

| Detector state | Expected result, conditional on the pristine positive fixture being clean | Actual output in this seat |
|---|---|---|
| Pristine counter, positive fixture | [INFERENCE] exit 0, value 12, no findings | Not run |
| Pristine counter, `producer-edit` data red | [INFERENCE] exit 1, value 0, includes `producer_digest` | Not run |
| Self-comparison mutant, same `producer-edit` data red | [INFERENCE] exit 0, value 12, no findings; selftest case `pass:false`, aggregate failure | Not run |
| Exactly restored counter, same data red | [INFERENCE] restores exit 1, value 0, includes `producer_digest` | Not run |

**Verdict:** unexecuted/static; inconclusive as a mutation-kill claim. The existing control is structurally capable of detecting this omission, but no pristine/mutated/restored behavioral results are reported. A baseline failure in L1's later serial probe would remain inconclusive, not a kill.

## Digest-only forgery boundary: concrete missing repinning controls

The four stale-pin edits do **not** establish immutable identity for every artifact. `measure:104-110` binds inputs to the requested full Git commit, but a new commit can contain mutually rewritten artifacts. With the validator unchanged:

| Coordinated data edit | Predicted boundary, not an executed result |
|---|---|
| Append LF to BASE producer and replace `receipt.producer.sha256` with the new hash | [INFERENCE] `producer_digest` disappears; no independent expected producer digest is consulted at `measure:47`. This is receipt-relative consistency, not an immutable producer allowlist. |
| Append LF to first evidence JSON and update its receipt `evidence.sha256` | [INFERENCE] `evidence_digest` disappears and all parsed relationships are unchanged. A correct digest does not authenticate observation origin. |
| Append one character after BASE's first `</form>`, update `e.fixture.sha256`, serialize evidence, then update receipt evidence hash | [INFERENCE] `fixture_digest` and `evidence_digest` disappear: nonce, form tag and autosubmit state remain unchanged. The counter does not establish that the rehashed fixture generated the transcript. |
| Append LF to the source body, update opening `decodedSha256` and the S100 row digest to the new hash | [INFERENCE] still red with `source_binding`: `measure:33,58` compares opening, body and row against the validator's literal original `SOURCE_SHA`. Rewriting local metadata alone cannot move this anchor. |

These exact coordinated repinning controls are not present in the inspected mutation switch (`selftest:22-95`) or persisted case names (`expected.json:1-170`). A useful additional **finite red** is the source-body repinning row above, retaining expected exit 1/value 0/`source_binding`; it separates immutable source anchoring from a mere body-versus-manifest hash comparison. The three producer/evidence/fixture repinning examples are limit controls, not reasons to change their expected result to red without changing the declared contract.

The positive fixture itself demonstrates the producer-authenticity limit: JSON pointer `/files/scripts~1webmcp-lifecycle-round21.mjs` in `fixtures/positive-ordered.json` is exactly `fixture producer, never executed`, with its digest `123b9cac07cd26af4f542e60c996844de58216d4ea19e7b8e3bdd3d0a7454754` recorded in the embedded receipt. Its first HTML is `<form>fixture-nonce-independent-00</form>`, not the real executable lifecycle fixture. The counter's job is finite recorded relationships; passing this synthetic data cannot demonstrate producer execution.

Additional trust limits directly visible in the same code:

- `source_binding` does not authenticate raw/compressed source carriers: `INPUT_PATHS` at `measure:27` includes the decoded `.cc` and opening JSON, not the stored `.base64.gz`; `measure:58` does not validate opening `rawSha256`/`storedSha256`. These fields are not independently verified by this counter.
- The persisted oracle is independent of the mutation builder, but not externally immutable. `selftest:103` uses EXPECTED itself as the case list and `selftest:117-118` uses `reports.every(...)` without a minimum inventory assertion. [INFERENCE] deleting an expected row removes that test; an empty oracle would make the empty report list satisfy `every`. Oracle edits are outside this probe, and no such edit was made.
- These are declared authenticity limits, not a newly proven production exploit: `corpus/knowledge/webmcp-nonautosubmit-round-21.md:98-106` explicitly excludes malicious-author observation authentication and all possible harness stubs. S100 is source interpretation; S101 is own-work (`corpus/SOURCES.md:114-115`; note:14-21). No independent admission follows from this leaf review.

## Current-run binding, not historical artifacts

The current producer's measured hash is `5363d576f52e72dc4e82d5838706aa307f371648e73242eed99e9776f06eceb9`. It equals the recorded fields in current `runtime/receipt.json:4-6` and `.ufo/waves/round-21/runtime-execution-bounded.json:11-12`. This is observed hash arithmetic, **not a rerun** of the acquisition or CLI. No pinned/ordered/final historical acquisition was substituted.

The current first-case receipt points to `na-pending.json` with hash `ae7e555b5a2d98a687857afa94454e01be9038d29bb35d0f32e5c68f846f9e20` (`receipt:53-55`); that evidence points to `na-pending.html` with hash `867d098aaf4a011988e40558c05840bce30f434951ee15d6cfeb695e3b357a18` (`na-pending.json:8-10`). Both match the two read-only inventories below. The source body matches the literal source digest, opening:6 and registry:114.

## Actual outputs and restoration evidence

The following SHA-256 values were identical in both actual `sha256sum` calls, before and after this read-only review. Each row gives **before = after**; no mutation bytes or restoration action exist because no inputs were written.

| Input path | Before = after SHA-256 |
|---|---|
| `.ufo/waves/round-21/measure-c1.mjs` | `4b6f271f3948b298918df150d5413f68b4134842b7106de8905cc70873221554` |
| `.ufo/waves/round-21/selftest-c1.mjs` | `c0a4cd27c8d7b7fe3194fe14493b392e616ea41dbaebb5c2e25b5d9cb0269e89` |
| `.ufo/waves/round-21/fixtures/expected.json` | `d2a50551af65fb35e904a4cf97de84f1142c369b6ad7096aad0cfe33a1130979` |
| `.ufo/waves/round-21/fixtures/positive-ordered.json` | `d12f5dde27e7dee40b8d2b088c86e8ad825c3e890463cbd9f76fcdd74bcdc98f` |
| `scripts/webmcp-lifecycle-round21.mjs` | `5363d576f52e72dc4e82d5838706aa307f371648e73242eed99e9776f06eceb9` |
| `.ufo/waves/round-21/source-opening.json` | `d14acf47215e3411d3b0b136fe28aa140bddc9dde76a5c054c19c9f45ef9a0cd` |
| `.ufo/waves/round-21/sources/html_form_element.cc` | `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916` |
| `corpus/evidence/round-21/runtime/receipt.json` | `323ccd591d82a8867903ea859ae45bac46eb0beb42bf27997aefac9c8773e6a6` |
| `corpus/evidence/round-21/runtime/na-pending.json` | `ae7e555b5a2d98a687857afa94454e01be9038d29bb35d0f32e5c68f846f9e20` |
| `corpus/evidence/round-21/runtime/na-pending.html` | `867d098aaf4a011988e40558c05840bce30f434951ee15d6cfeb695e3b357a18` |

Only this requested report was written. No tool installs/updates, Git/jj/index changes, delegation, peer-source writes, or live-browser operations occurred. Final serial CLI controls remain L1-owned; no result is preclaimed.

Report: .ufo/waves/round-21/w2/MutationProducer.md
