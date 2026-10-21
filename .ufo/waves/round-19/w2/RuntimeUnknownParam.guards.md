# RuntimeUnknownParam — validation-guard implementation handoff

## Assignment and axes

Follow-up slice assigned by L1 TabiR19: implement SentinelValidation findings 2–5 in **only** `scripts/webmcp-validation-round19.mjs`, from attacked checkpoint R `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`, in this seat's private clone and new branch. Source finding record: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w2/SentinelValidation.md:27-75`; conditional filesystem-race boundary at `:13-25` was also read.

Axes: **operability** (fail-closed launch/interception/scans), **depth/provenance** (retained per-context decisions), **isolation** (single implementation path, no LANE production write), and **compatibility** (unchanged pins, CLI, inputs and validation comparisons).

## Delivered implementation

Commit **`2dbdc54733cdb0faa79525884313b38c09046402`**.

Producer SHA-256 **`2a4a5b739f28d28dcdc6569cb85693d7e4bd4ea0d6151be22ba339ed86929bdb`**.

Exactly one production path was edited and committed:

- `scripts/webmcp-validation-round19.mjs`

### Finding 2 — exact effective-argv guards

- Named required Chromium and Blink feature sets replace duplicated feature-list spellings; their values remain the same.
- Existing Playwright default feature merging is preserved. The effective main enable token must still equal the merged expected token and appear exactly once.
- The Blink enable switch must appear exactly once and contain exactly the two required features, without duplicates. Membership is exact, not a case-insensitive WebMCP substring match.
- Resolver switches are counted including bare/ambiguous forms; exactly one switch with the exact deny/loopback-exclusion token is accepted.
- The effective disable-features token must equal the expected merged/default token exactly and appear once. Duplicate/ambiguous Blink-disable switches are rejected, and required-feature conflicts are checked across both disable lists, including trimmed feature names and Chromium feature decorations.
- Checked argv, parsed lists, counts, conflicts, and launch acceptance/DevTools-port decisions are retained rather than discarded.

Implementation anchor: `launchChromiumImpl`, effective-argv block (new lines 608–688); required sets at 44–51. Existing sandbox/pipe/no-TCP-port checks remain in that block.

### Finding 3 — WebSocket installation errors propagate

`guardLoopback` no longer catches and ignores `context.routeWebSocket` installation failure. It returns success evidence only after both route installations finish, before fixture navigation. The evidence explicitly scopes this control to page HTTP(S) requests and intercepted WebSocket connections, **not OS-level egress confinement**.

Implementation anchors: `guardLoopback` (785–808), `evaluateCase` assignment of `machine.run.loopbackGuard` (1181).

### Finding 5 — available, descriptor-bound executable identity

- `sha256Executable` opens the requested object once, hashes that descriptor, validates its regular-file metadata before/after hashing, and checks canonical-path/object consistency. File-descriptor closure is guaranteed in `finally`.
- Each browser identity is obtained by opening its actual `/proc/<pid>/exe` object, rather than resolving that link and subsequently hashing only the resolved pathname.
- Any identity-observation/hash failure throws `chromium_identity_unavailable`; null identities no longer compare equal and pass.
- Every accepted context requires a nonempty canonical executable path and a 64-hex SHA-256. The final cross-context check also requires complete identity data and compares canonical path, digest and file metadata across all contexts.
- The retained identity includes device, inode, size and nanosecond modification/change timestamps alongside the digest.

Implementation anchors: `sha256Executable` (477–507), launch identity/guards (655–688), final availability and cross-context checks (1424–1434).

This descriptor-bound executable proof is **not** a claim to have closed the separate case/fixture/output pathname races.

### Finding 4 — two-root, before/after, fail-closed artifact accounting

- Every artifact snapshot scans both `runTempDir` and `processTmpDir` for all leaves under any `playwright-artifacts-*` subtree. Filenames need not match a download's suggestion.
- Root disappearance, invalid root type, directory-read failure or entry-stat failure is retained as an incomplete snapshot, never converted into an empty successful scan.
- Snapshots retain each root's complete file list, skipped non-artifact symlinks, error records and completeness result. Physical directories are traversed without following symlink targets; Chromium's normal profile lock/socket symlinks are recorded as skipped rather than mistaken for artifact trees. An artifact-subtree symlink itself remains an artifact leaf.
- A two-root baseline is captured before launching cases.
- Each context retains `before-case-close` (before page closing can erase transient artifacts), `before-context-close`, and `after-context-close` snapshots. Context shutdown/process draining still happens before scan failure is propagated.
- Per-case artifact failure uses the union of retained snapshots, so an artifact present only before shutdown is not lost. Paths are now absolute/root-qualified, avoiding collisions between identical relative paths in the two roots.
- Cleanup captures one final two-root `before-temp-removal` snapshot before deleting either root, even on error/abort cleanup. Cleanup success requires all retained scans to be complete; any late new artifact also adds a run-level fail finding.

Implementation anchors: scan/capture/assert/delta helpers (863–912), `closeContextBounded` (987–1007), `evaluateCase` finalization (1250–1268), cleanup/final assertion (1303–1344), baseline and final findings in `main`.

This slice does not add all-page download listeners or download-failure settlement. It strengthens the explicitly assigned artifact-root/timing/completeness boundary; it does not claim every additional remediation suggested in SentinelValidation finding 4 has been runtime-proven.

## Receipt evidence and preserved contract

New receipts retain:

- `observed.contextLabel`, linking each case to `contexts[]`;
- per-context effective argv, parsed feature/resolver decisions, launch guard result, HTTP/WebSocket installation evidence, canonical executable proof and artifact snapshots;
- `artifactBaseline`;
- full `cleanup`, including final root snapshots and `artifactScansComplete`;
- explicit `filesystemAssumptions` declaring the trusted/immutable-parent prerequisite and absence of same-uid pathname-race protection.

The existing receipt schema identifier, case/input/expected/observed/pass records, case/fixture digest maps and comparison semantics remain. No case, fixture, source, decision manifest or committed receipt was edited. The existing 66-case input population is unchanged. Runtime pins remain Chromium `154.0.8037.97`, Playwright `1.64.0`, Node `24.21.0`; signal handlers, bounded shutdown and exit-2 abort/no-receipt path remain. No `--fixtures` flag or other CLI surface was added.

## Conditional pathname-race prerequisite — explicitly not closed

Input loading and final receipt creation retain their existing static symlink, regular-file, containment and exclusive-create refusals. They are **not** migrated to no-follow, parent-FD-bound input/output resolution. Accordingly:

**The case/fixture input trees and receipt-output ancestors must be trusted and immutable for the entire run. Same-uid concurrent pathname replacement is not a protected boundary.**

This prerequisite is now documented in the script header and declaratively retained in new receipts. Another pathname preflight is not presented as race closure. The permitted fallback from L1's assignment was selected instead of introducing an unverified platform-specific parent-descriptor subsystem. L1 must not label SentinelValidation finding 1 closed by this commit.

## Exact retained evidence and verification status

- Base/source checkpoint: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Pre-edit producer SHA-256 (R): `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4`.
- Committed implementation: `2dbdc54733cdb0faa79525884313b38c09046402`.
- New producer SHA-256, observed via `sha256sum /fast/scratch/tabi-r19/fx-RuntimeUnknownParam/scripts/webmcp-validation-round19.mjs`: `2a4a5b739f28d28dcdc6569cb85693d7e4bd4ea0d6151be22ba339ed86929bdb`.
- Path-limited commit completed successfully. Commit hooks were disabled for that invocation to obey the no-checks instruction; no global Git setting was modified.
- **No checks were run for this implementation:** no syntax check, browser probe, test, full corpus, C1/C2/C3 counter, build, linter or formatter. The earlier `RuntimeUnknownParam.md` / JSON / two receipts are evidence for unchanged **R only**, not passing evidence for this new producer.
- No tools were installed or updated. The mounted tool inventory has no LSP device; no symbol refactor was attempted. No new process/service/browser was started beyond the foreground Git/hash commands.

Implementation claims above describe the edited source; runtime acceptance is **unverified pending L1's single post-integration gate**.

## L1 handoff, risks and remaining gate ownership

Import only the script from this commit, for example read it with:

```sh
git -C /fast/scratch/tabi-r19/fx-RuntimeUnknownParam show 2dbdc54733cdb0faa79525884313b38c09046402:scripts/webmcp-validation-round19.mjs
```

L1 should run its final verification once after integration, covering the unchanged 66 cases plus the routed malformed-argv, WebSocket-installation-rejection, unavailable-executable-identity and two-root transient/scan-error negatives. In particular, pre-close filesystem scanning intentionally treats a concurrent missing/unreadable entry as incomplete; its real-browser behavior has not been exercised by this seat. Regenerate the canonical receipt for the new producer; the R receipt's old producer hash is intentionally not rewritten here.

Shared registry/docs updates and the unsupported self-test recipe are outside this script-only ownership. This report and the script header document the filesystem prerequisite; L1 owns any corresponding shared-document wording. The selected-page download listener remains selected-page scoped, and no OS-level network-isolation or same-uid pathname-race closure is asserted.

## Isolation

- Clone: `/fast/scratch/tabi-r19/fx-RuntimeUnknownParam`.
- Branch: `r19/RuntimeUnknownParam-guards`.
- Base: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R; implementation follow-up from the falsification sandbox).
- Commit: `2dbdc54733cdb0faa79525884313b38c09046402`.
- Changed production paths: `scripts/webmcp-validation-round19.mjs` only, in the private clone.
- Direct LANE write for this follow-up: `.ufo/waves/round-19/w2/RuntimeUnknownParam.guards.md` only; earlier falsification artifacts are preserved unchanged.
- No LANE Git/jj write, fleet/sibling production mutation, delegation/background job, host/package/service/configuration mutation, or pacman transaction.
