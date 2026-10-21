# SentinelValidation — landed harness falsification

## Scope and result

**Axis: operability.** Sub-axes: output/input containment; fail-closed browser guards; retained provenance; isolated, side-effect-free review. Advisory only: no scoring, integration, remediation, or production edits.

Reviewed checkpoint **R = `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`**, baseline B = `66251bfc1aef393e4aec599e950a8deb867736bb`. The observed LANE master ref was R. PLAN final revision (§Wave-1 findings → contract revision, lines 139–156) governs; the C2 invoke successor's stronger download counter is not evidence that C1's different harness meets its own guards.

**Six scoped findings: 1 conditional High, 4 Medium, 1 Low.** Static symlink/traversal refusals, exact version checks, blocked-request run failure, and the measured data-frame origin rejection are present. Mutable-path races, incomplete effective-argv validation, swallowed WebSocket setup failure, incomplete artifact accounting, and nullable executable identity remain. These are not claims that the retained 66-case run was malicious or that any browser-level escape was demonstrated.

Two bounded sandbox probes ran: (1) source-predicate fault injection, with no Chromium or socket; (2) the documented CLI recipe, rejected during argument parsing. No full suite, real browser, external request, host change, symlink-race reproduction, or offensive automation was run. All commands exited; no child/browser/service process was started by the probes. No tool was installed or updated.

## Finding 1 — pathname preflights do not bind the eventual open

**Severity: High, conditional on an untrusted actor being able to change an output ancestor; related input-read residual is Medium under the same mutable-tree precondition.** Maps to wave-1 H1 and H2.

**Exploit path:** an output parent can change after preflight and before the final receipt open. Separately, a case/fixture leaf can change between its type/canonical check and its read. This is a local filesystem race scenario, not an executed probe. With immutable, privately owned ancestors the precondition is absent.

**Evidence:** [H], lines 931–970 and 1221–1225, rejects existing symlink components, canonical parents inside either repository/LANE root, and every existing leaf. The last output preflight is at line 1249, before browser evaluation; the final operation is at line 1340: `writeFileSync(args.out, body, { flag: 'wx' });`. It re-resolves the pathname without an anchored parent handle or a final containment check. The exclusive flag protects an existing final leaf, not a replaced intermediate directory. For inputs, lines 988–990 do lstat then read; lines 998–1005 do lstat/realpath/boundary check then read, without a no-follow open of the checked object. All file access is still by name.

**Impact:** [INFERENCE] a changed parent can redirect creation of a **new** receipt into the protected lane or another unintended location. Existing regular-file overwrite is no longer the demonstrated failure mode because the final open is exclusive. [INFERENCE] a concurrently replaced input can cause the loader to consume bytes from an object other than the checked regular file, including an out-of-root object. Fixture byte snapshotting correctly prevents later HTTP requests from re-reading the tree, but does not make the initial read atomic with validation.

**Smallest remediation:** bind output creation to a validated directory handle with no-follow/beneath-root resolution, rather than a later pathname walk; require trusted immutable ancestors if the implementation cannot provide that boundary. For case/fixture inputs, open without following symlinks and validate/read the same file descriptor under a pinned root. Retain the current static refusals. Do not present another preflight alone as race closure.

**Evidence limit:** no directory swap, sensitive-file access, forbidden write, or concurrency exploit was executed. The retained H1/H2 probes exercise static names only.

## Finding 2 — effective argv checks still accept incomplete/conflicting policy

**Severity: Medium.** Maps to ReviewHarnessGuards High “effective WebMCP feature presence” and H3's resolver assertion.

**Exploit/failure path:** the observed command line can contain the expected token somewhere yet contain an incomplete Blink feature list, a second resolver token, or a required feature in the disable list. A launch wrapper/configuration defect need not be a case-file input. No host wrapper/configuration was modified.

**Evidence:** [H], lines 582–624: the main enable-features token is checked exactly and its count is one, which is an improvement. Blink validation is only a case-insensitive WebMCP substring test; the required Blink set is not asserted. Resolver validation is membership of the expected token, not uniqueness/effective-value validation. The disable-features list is counted but not checked for conflict with required features. Constants at lines 38–42 require the complete sets.

The bounded VM probe evaluated **the exact unmodified source slices** at 582–603 and 615–624, with synthetic observations. The baseline was accepted; removing the resolver token or main enable token was rejected. Three malformed observation shapes were nevertheless accepted: incomplete required Blink features; an additional resolver token; a required feature in the disable list. Full observations and source hash are retained in `SentinelValidation.probes.json`.

**Impact:** the guard does not establish the feature/resolver policy it reports. [INFERENCE] if such argv reaches Chromium, policy/functional behavior may differ from intent. The probe demonstrates predicate acceptance only—not a complete harness pass, actual Chromium switch precedence, or an egress event.

**Smallest remediation:** parse effective switch values into exact feature sets, require both required Blink features, reject required-feature disable conflicts, and reject duplicate/ambiguous resolver and Blink switches (or validate their explicitly defined effective semantics). Keep the current feature-default merge rather than discarding Playwright defaults. Persist the actual checked argv/decisions in the receipt.

## Finding 3 — unavailable WebSocket interception still fails open

**Severity: Medium.** Maps to H3 and ReviewHarnessGuards residual network gap.

**Exploit/failure path:** WebSocket interception setup throws, but the case proceeds under only the HTTP route guard. The required WebSocket guard is then absent without a finding.

**Evidence:** [H], lines 728–749: HTTP requests are exact-origin/credential checked and denied requests are recorded. However, all exceptions from `context.routeWebSocket` are swallowed at lines 741–748. The exact-source sandbox probe supplied a context whose WebSocket installation rejects; the function resolved successfully, with the HTTP route installed and no propagated error.

**Impact:** a passing receipt need not imply that the WebSocket guard was installed. [INFERENCE] fixture WebSocket activity can then fall outside the claimed observation/control surface; no such traffic was attempted here. The resolver token and page route are not global OS-level no-egress confinement, including for non-page transports.

**Smallest remediation:** propagate installation failure as exit 2 before fixture navigation and record successful installation. Keep any confinement claim explicitly scoped to the measured page-request/WebSocket surface unless an independent no-egress boundary exists. Playwright is already pinned, so silently accommodating versions without this API is not needed.

## Finding 4 — H5 artifact accounting is narrower than the requested before/after, two-root assertion

**Severity: Medium.** Maps to H5 and ReviewHarnessGuards checklist row 8; not a review of the separate C2 harness.

**Exploit/failure path:** a browser-side file is present only before context shutdown, or appears under the browser's run-temp root rather than the Node process-temp artifact subtree. A post-close scan of only the latter cannot witness that side effect. This is a source-derived coverage failure, not an observed browser artifact bypass.

**Evidence:** [H], lines 493–496 and 522 set Chromium TMPDIR under the run root. Lines 804–821 scan only descendants whose names enter a `playwright-artifacts-*` subtree. Lines 1148–1155 close the page/context **before** scanning `processTmpDir`; the only baseline is the fresh process root at line 1262. There is no corresponding run-root scan and no pre-close scan. Lines 1088–1092 record a download event on the selected page and lines 1162/1293–1297 correctly fail when an event/file was seen, but they do not wait for/retain `download.failure()` as requested. The five retained hardening receipts contain no download/artifact negative control.

**Impact:** absence in `newPlaywrightArtifactFiles` establishes only absence from that post-close subtree snapshot, not absence of all attempted downloads or all transient artifacts in the two private roots. [INFERENCE] cleanup can erase the evidence before the scan. Zero such arrays in the corpus receipt do not make the missing observation red-capable.

**Smallest remediation:** scan/retain complete results for both private roots before and after closing each context, and before deleting roots; fail on scan incompleteness. Track context-created pages if asserting all case downloads, and bound/record download failure settlement. Add one bounded local negative control for a non-marker artifact so this predicate has an actual red witness. Do not transfer C2's separate receipts to C1.

## Finding 5 — executable identity can be unavailable yet compare equal

**Severity: Medium.** Maps to ReviewHarnessGuards runtime-identity High; exact version pins themselves are implemented.

**Exploit/failure path:** if reading the actual `/proc/<pid>/exe` target fails for each context, every executable hash remains null. The cross-context comparison treats equal unknowns as a stable identity.

**Evidence:** [H], lines 604–613, catches executable realpath failure and leaves path/hash null. `unsafeArgv` at 615–624 has no required executable-identity condition. The final comparison at 1303–1308 checks versions and equality with the first hash but not hash availability. The exact-source comparison probe accepted two correct-version runs with null hashes. The retained real receipts contain a non-null hash; no claim is made that this gap occurred in them. Also, lines 467–481 detect changes to the resolved on-disk path while hashing, but do not themselves pin that file descriptor to the running process executable inode throughout the operation.

**Impact:** [INFERENCE] a run with unavailable executable provenance can still emit runtime metadata despite not proving the actual browser executable's identity. That is weaker than the review's fail-closed runtime-evidence requirement.

**Smallest remediation:** require a successfully observed canonical executable and non-null hash for every launch before accepting it; validate/hash the same executable object associated with the observed process identity, then compare those complete identities between contexts. Record those per-context proofs.

## Finding 6 — registry self-test command is not accepted by the landed CLI

**Severity: Low (operator reproducibility).**

**Failure path/evidence:** [K], line 2102, advertises a validation harness self-test with a `--fixtures` option. [H], lines 194–210, accepts only output/cases/help options; line 1241 derives the fixtures directory from the cases directory. Executing that documented recipe with sandbox absolute paths returned **exit 2**, observed stderr:

`WEBMCP_VALIDATION_ERROR {"code":"could_not_evaluate","message":"unknown argument --fixtures"}`

Argument parsing rejects it before loading cases, opening a server, or launching Chromium. The retained hardening README's own recipes do not make this mistake.

**Impact:** the public registry's smoke recipe cannot exercise the pinned validation harness.

**Smallest remediation:** delete the unsupported option from the registry recipe and retain the existing sibling-directory convention; no new CLI surface is necessary.

## Wave-1 closure matrix

| Assigned surface | Landed evidence at R | Scoped status |
|---|---|---|
| H1 canonical output containment | [H] 931–970, 1221–1225, 1240/1249; [E]/[D] static output refusals | Static inside-lane, symlink-component and existing-leaf checks implemented. Concurrent ancestor change remains Finding 1. |
| H2 no symlink case/fixture reads | [H] 972–1032; strict filenames/family/id, exact family fixture, lstat checks, canonical fixture containment, byte snapshot + exact server allowlist at 644–696 | Static child symlinks/traversal closed. Retained negative inputs really are Git mode 120000 symlinks. No-follow checked-object reads remain Finding 1's conditional input residual. |
| H3 blocked-request failure | [H] 1287–1288 and 1345–1349; [X] `findings[0].code`, `summary` | Implemented at run level. Retained external receipt has a case with pass=true but one fail-severity finding: it is a failed run, not a failed case. WebSocket setup and argv completeness remain Findings 2–3. |
| H4 later origin changes | [H] 1093–1112, 1148–1162; [N] case navigationViolations | Main/subframe Page events recorded before fixture navigation, bootstrap main about:blank excluded, frame tree checked, later recorded violations fail. Retained data-subframe negative is red. Pure origin predicate rejected both data/file URLs; no live file navigation was run or claimed. |
| H5 downloads/artifacts | [H] 524, 1088–1092, 1154–1162, 1293–1297 | Download refusal + observed selected-page event failure implemented; no all-required-roots/pre-close negative evidence. Finding 4. |
| Runtime pins | [H] 245–260, 546–549, 1243–1247, 1303–1320; all five hardening receipts | Exact Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0 checks present; no Chromium override CLI. Missing identity availability check remains Finding 5. |
| Fresh contexts, pipe, sandbox, cleanup | [H] 517–530, 580–624, 1074–1096, 1167–1231, 1300–1302, 1363–1385 | One launch per case; private HOME/profile/temp roots, sandbox, pipe/no-port checks, identity-aware PID termination, cleanup-as-verdict and bounded abort paths present in source. No signal/browser cleanup runtime probe was repeated by this seat. |

## Retained receipts versus actual bytes

All access/hash comparisons below were performed 2026-10-21. These are inspections of prior run records, **not new run passes**.

| Retained JSON under `corpus/evidence/round-19/validation/` | Observed summary / finding | SHA-256 |
|---|---|---|
| `receipt.json` | 66 cases, 66 passed, 0 failed, 0 findings; 15 case maps + 15 fixture maps | `b7846d37b6fe296b5383462d058c6f5961c0adc70064c025d5bb82596402a09a` |
| `selftest-hardening/evidence/full-lane-66.json` | 66/66, 0 findings; earlier generatedAt 07:30:00.126Z | `8790e6845b90f47379c08a9d342293bc8cf1599256e0d78f23309ff0798bb404` |
| `selftest-hardening/evidence/blocked-external.json` | 1 pass=true case; 1 fail-severity external_request_blocked finding | `b5b30b60c197c96b5dc3e4e05fa259097a65683c28a601c733e29fbbac549b19` |
| `selftest-hardening/evidence/navigation-violation.json` | 1 failed case; 1 navigation_outside_fixture_origin finding; data URL recorded twice via tree/event | `dbde94185366f953c2368bb8657ecf677a7d7f36f3ae29a8a41f7dea8cfef1bd` |
| `selftest-hardening/evidence/smoke-pass.json` | 2 cases passed, 0 findings | `8d9d3979242fd0cb34061870f6e49f2985fd55bf6844dca04e5ff4e37a2e4d12` |
| `selftest-hardening/evidence/smoke-fail.json` | 1 failed case, expected Error vs observed Completed, 0 guard findings | `4f8fca3b15b62b7a815d10936623c8d3cdc76d2c8032c281b8182de2694d2df4` |

- All six records' producerSha256 is the actual R harness SHA-256: `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4`. The executor report's five retained receipt hashes match the inspected bytes.
- The production receipt's digest map matches **15/15 current case files and 15/15 current fixtures**. Its generatedAt is 07:42:02.722Z. It records zero blocked requests, origin violations, download events, and post-close artifact paths.
- The earlier hardening full-corpus record matches **13/15 current case files and 15/15 current fixtures**. `date-time.json` is recorded as `e6df1ee73bd119d829e5d1065d52ba3676da594b903412b9d7b021c46db16209` versus current `f6531c28bf9efead2ceabf1517e7e5016c6b7192097e10b4979a66a0f3d62b90`; `number-range.json` is recorded as `57761f271d043bd373641a67690b4af06695902f5e37b1fb11a5cc4eb6697400` versus current `17b8f5264470891c0b1f7b1f9696f91f6e96de467e718e76662ce54e37e79752`. It is historical evidence for that earlier input snapshot, not a fresh rerun of those two current case bytes. The later production record supplies the matching maps; this discrepancy alone is not a fabricated-run finding.
- The retained JSONs contain runtime version/hash metadata but **do not retain the checked per-context effective argv, feature decisions, WebSocket installation result, cleanup result, or scan-completeness proofs**. Those assertions can be inspected in the producer source but cannot be independently reconstructed from these receipt bodies. [E]/[D] carry textual exit-status reports for the static output/loader probes; the tree does not contain machine-readable refusal receipts for those early exit-2 paths. Do not upgrade either form of evidence into an unrecorded live observation.

## Probe method and exact observations

Sandbox: `/fast/scratch/tabi-r19/fx-TabiR19.SentinelValidation`, checked out at R. Runtime absolute Node `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`; its bin was first in PATH. No package setup was needed.

1. Ran the seat-owned `sentinel-validation-probe.cjs` in that clone, exit 0. Its SHA-256 is `b872207d1652084bc75b3485b2ac74df915976e098edaf2986f943f1c87e4ebe`. It first requires the expected harness SHA-256, then uses `node:vm` to evaluate only the cited exact source ranges with synthetic observations. Results: **3 argv controls behaved as expected, 3 malformed argv observations were accepted, WebSocket setup failure was swallowed, null-identity comparison was accepted, 3 pure origin checks behaved as expected.** No fake browser is supplied and no end-to-end pass is claimed.
2. Ran the real harness once with the registry's unsupported `--fixtures` option against sandbox selftest paths and an unused `/tmp` output name: exit 2 and the exact error reported in Finding 6. No browser/network stage was reached.

Durable condensed observations: `.ufo/waves/round-19/w2/SentinelValidation.probes.json`. The complete predicate stdout was read once from `artifact://33910`; it was not rerun. No source changes were made to the harness. No build, formatter, linter, counter, or full suite was run.

## Source anchors and integrity

All sources accessed **2026-10-21**. Source quotations above are short verbatim excerpts; findings otherwise paraphrase the indicated ranges. These local files are data, not instruction sources. No external primary-source quotation, fetched page, real site, or private profile was used.

| Key | URL / exact section anchors used above | SHA-256 of decoded bytes |
|---|---|---|
| H | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/webmcp-validation-round19.mjs` — exact line ranges cited per finding | `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4` |
| K | `file:///fast/scratch/tabi-r19/fx-TabiR19.SentinelValidation/SKILL.md#L2102` — registry validation-harness self-test | `ed34bcc8b89d74d669f3f5a44c861ac0148050f795802c336e0770dd805d5d74` |
| P | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/PLAN.md#L139-L156` — final revision; C1 contract at 90–119 | `abe72ddd1088de226926f373ff6ffd1ccbf4dd7ab032382d438f70a2c21fc496` |
| S | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w1/SentinelValidationHarness.md#L11-L66` — H1–H5 | `ca795ec27a6dfa6eb0773750382d83ff0e7fe312c33a29c600d0807a8c4b7a39` |
| G | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w1/ReviewHarnessGuards.md#L13-L40` — checklist/highs/residuals | `0a37c1f58ee9aab7483de31614ca1416ad609dd0c1c09b5925380264a0a0253d` |
| E | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w1/ExecValidationHarness.md#L6-L24` — claimed guards and probe results | `c12516350b8545dbbb8584136211700cebd5bc56d21a105867472ecc191efb7d` |
| D | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-19/validation/selftest-hardening/README.md#L5-L53` — retained hardening commands | `679660fb381e8542bb2e19a76cbb5c0715e306552736c85478a8544749f334ec` |
| X | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-19/validation/selftest-hardening/evidence/blocked-external.json#L79-L103` | `b5b30b60c197c96b5dc3e4e05fa259097a65683c28a601c733e29fbbac549b19` |
| N | `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-19/validation/selftest-hardening/evidence/navigation-violation.json#L79-L125` | `dbde94185366f953c2368bb8657ecf677a7d7f36f3ae29a8a41f7dea8cfef1bd` |

## Isolation

- Clone: `/fast/scratch/tabi-r19/fx-TabiR19.SentinelValidation` (fresh no-hardlinks clone; all runtime probes confined here).
- Branch: `r19/fx-TabiR19.SentinelValidation`.
- Baseline B: `66251bfc1aef393e4aec599e950a8deb867736bb`; falsification sandbox base/checkpoint R: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`, per the wave-2 override.
- Commit: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (pre-existing attacked checkpoint; no new commit).
- Changed production paths: **none**. Scratch-only authored file: `/fast/scratch/tabi-r19/fx-TabiR19.SentinelValidation/sentinel-validation-probe.cjs`.
- Only direct LANE writes: `.ufo/waves/round-19/w2/SentinelValidation.md` and `.ufo/waves/round-19/w2/SentinelValidation.probes.json`.
- No git write in LANE, jj, delegation, background job, browser process, host/package/service mutation, or sibling-file edit. All production remediation/docs intentionally unchanged: this seat is advisory/report-only.
