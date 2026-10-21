# Round 19 C1 harness — pre-implementation security review

**Axis:** operability (containment, trustworthy run output, and fail-closed behavior).  
**Verdict:** Reuse of the round-18 guarded launch is a sound baseline, but the C1 harness should not be treated as loopback-only or safe for untrusted case/fixture inputs until the open findings below are closed. Scope is limited to PLAN.md §C1. No exploit was executed.

## Evidence base

- Contract: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/PLAN.md`, §C1, lines 90–119 (especially case schema/fixture rules 96–109 and harness/CLI/output contract 111–119).
- Reference implementation: `file:///home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/webmcp-invoke-round18.mjs`, read 2026-10-21; SHA-256 `d1443344c745a3e60417e19edf3d173054e085b912fa0ba1b58943d407896baa`. Findings cite its line numbers. No external source quotations used.

## Findings

### H1 — `--out` can escape the required outside-LANE boundary through a parent symlink

**Severity: High (scope violation / unintended overwrite).**  
**Exploit path:** invoke with an output whose parent is a symlink to LANE (for example, a symlinked temporary directory pointing at `tabi-shokunin/corpus/evidence/...`), or simply choose a direct path inside LANE. The round-18 writer checks the final component with `lstat` and rejects a final symlink/non-file, but does not require the resolved destination to be outside LANE. A missing output under a symlinked parent passes the final-component check; directory creation and temp-file rename then follow the parent link. `--force` also permits replacement of a differing regular file.

**Evidence:** arg paths are only made absolute by `resolve` at lines 269–286. Existing-leaf checks and overwrite behavior are at 2964–2976; parent creation and temp/rename are at 2978–2981. There is no LANE containment check. The direct-leaf symlink defense is useful but does not close a symlinked-parent alias.

**Impact:** the C1 run can write its receipt inside the protected lane or overwrite a chosen regular file, violating the plan's explicit `--out <path outside LANE>` contract. A report path/receipt could also be redirected into a sensitive directory.

**Smallest remediation:** canonicalize the trusted LANE root and output parent, reject any output whose canonical parent+basename resolves inside LANE, and reject symlinked path components. Perform the check against the same directory handle used for the temp-file create/rename (or otherwise close the parent-swap race); retain `lstat` for a final symlink and keep temp creation exclusive.

### H2 — Treating case JSON `fixture`/file names as paths can read outside their roots; the static-server check does not protect the Node-side case loader

**Severity: High if case files or fixture directories are untrusted; Medium for immutable checked-in inputs.**  
**Exploit path:** a case names `../../...` or an encoded separator/traversal as its fixture, and a harness directly joins that value to the fixture directory before reading it. Alternatively, a `.json` or `.html` directory entry is a symlink to a sensitive file. These are Node-side file reads, so HTTP request routing and the static-server path check are not the guard. A fixture can also request an unrelated in-root file if the server serves every regular file rather than only the fixture inventory.

**Evidence:** the round-18 server is a good containment pattern: it canonicalizes the root at 586–588; decodes the request path at 591–607; normalizes and checks root containment, canonical target containment, final symlink status, and regular-file type at 667–699; it limits methods to GET/HEAD at 645–647. However, this protects only requests handled by that server. The round-18 inventory selects `.html` names from a directory and reads `join(args.fixtures, name)` at 1532–1537; an `.html` symlink is followed by that inventory read even though the server later refuses to serve a final symlink. C1's case schema makes `fixture` a caller/file-provided value (PLAN §C1 lines 96–103), which must not be used as an unchecked filesystem path.

**Impact:** local file contents may be read into the harness; at minimum this crosses the intended cases/fixtures trust boundary and can poison receipt inputs. Path checks by pathname also have a small TOCTOU window if an attacker can mutate the fixture tree while a request is served.

**Smallest remediation:** parse only regular `.json` case files directly enumerated under a canonical cases root; reject symlinks and validate `family`, `id`, and `fixture` against strict slugs plus the exact inventoried `family.html` mapping. Resolve and verify each file remains under its canonical root before opening it without following symlinks. Make the server serve only the exact validated fixture inventory, not arbitrary files under `--fixtures`; keep the existing decoded-path/canonical containment checks as a second layer. Do not let case JSON choose arbitrary file paths.

### H3 — “No external fetch” is not a fail-closed property; non-HTTP egress paths remain outside the page route

**Severity: High for a claimed no-egress guarantee; Medium if scoped strictly to ordinary page HTTP(S).**  
**Exploit path:** fixture JavaScript attempts standard external HTTP; the round-18 route aborts it and records the URL, but the run adds only an `info` finding and can still pass. A hostile fixture can also use WebRTC/UDP or other transports that the Playwright HTTP/WebSocket route does not confine. The source itself explicitly excludes WebRTC UDP/TCP, WebTransport, and SharedWorker traffic from its confinement claim. Further, the resolver-deny rule is included in launch args but its presence is not one of the fail-closed effective-argv assertions.

**Evidence:** host resolver rule constant at 66 and launch inclusion at 1036; effective argv is inspected at 1171–1197, while `unsafeArgv` checks pipe/port/sandbox/profile conditions at 1210–1222 but does not assert the resolver rule. Exact-origin HTTP allow/deny and WebSocket routing are at 931–964. The WebSocket route's unavailable-error is swallowed at 960–963. A blocked request is recorded as informational, not a failed run, at 2829–2831. The stated scope limitation is explicit at 2921–2933.

**Impact:** a fixture can violate the no-external-fetch requirement without making the receipt fail; non-HTTP transports can bypass the route-level claim. `--host-resolver-rules` alone is not proof that all browser network egress is prevented.

**Smallest remediation:** assert the exact host-resolver deny token in Chromium's observed effective argv and fail if unavailable WebSocket interception cannot be installed. Make any blocked external request a case/run failure for C1 (not informational). If the contract means actual no-egress rather than ordinary fetch blocking, use an OS/network-namespace egress deny or equivalent boundary and disable/deny alternate transports; otherwise narrow the receipt claim to the measured page-request surface and do not label it globally loopback-only.

### H4 — `file:`/`data:` navigation is not proven confined after the initial fixture load

**Severity: Medium (protocol escape / invalid observation).**  
**Exploit path:** a fixture script changes `location` or creates a nested frame targeting `file:` or `data:` after startup. The route permits only an exact loopback HTTP origin for requests that reach it, but the initial `page.url()` comparison is performed only immediately after `goto`. The source records `Page.frameNavigated` events, but no source check requires every later main-frame/child-frame URL to remain on the loopback origin. Do not assume a request route blocks browser-internal/non-network schemes. A `data:` document can execute fixture-controlled code; a `file:` navigation can expose local-file behavior depending on Chromium's file-origin policy. Ordinary external HTTP from such a document remains subject to H3's route gap/limitations.

**Evidence:** `guardLoopback` is HTTP-only and exact-origin at 931–954. Initial navigation and one-time URL check are at 1395–1397; navigation events are collected in `RECORDED_CDP_EVENTS` at 136–142, but no corresponding origin assertion exists in the cited attach flow. PLAN §C1 requires an intentionally active fixture submit listener, so source hygiene alone is not a sufficient boundary.

**Impact:** the harness may continue evaluating a page other than the declared loopback fixture and may lose the provenance/containment assumptions behind DOM state and result records.

**Smallest remediation:** enforce an allowed-origin policy for every main-frame and subframe navigation, including redirects and navigation after tool invocation, and reject unexpected schemes rather than only observing them. Add explicit negative probes for `file:` and `data:` navigation; keep the browser sandbox enabled and do not treat an opaque `data:` origin as a safe fixture origin.

### H5 — C1 must assert that downloads never occur, not merely configure refusal

**Severity: Medium (unobserved browser side effect).**  
**Exploit path:** a fixture triggers a download. Round-18 configures `acceptDownloads: false`, but that alone does not demonstrate the C1 run saw and rejected every download attempt or left no artifact. The round-18 implementation has a per-page download event tracker and its dedicated refusal case asserts a non-null failure plus marker absence before/after context close; C1's listed procedure does not state the equivalent zero-download assertion.

**Evidence:** browser launch uses `acceptDownloads: false` at 1107–1121 (especially 1115–1117). Event/failure tracking is at 1322–1365. The dedicated expected-refusal assertions and run-tree/process-temp scans are at 2681–2728. C1's reuse contract names the refusal setting but not an assertion over C1 cases (PLAN lines 111–119).

**Impact:** a passing C1 receipt could omit an attempted download or a browser-created artifact, weakening the claim that fixtures were inert apart from the measured WebMCP behavior.

**Smallest remediation:** install the download listener before fixture navigation, fail C1 on any download event, wait for its failure result, and verify the private run/process temp roots contain no download artifact before and after browser shutdown. Keep `acceptDownloads: false` as prevention-in-depth.

## Controls to retain

- **Loopback static server:** preserve the explicit `127.0.0.1` bind and post-bind assertion (714–721), GET/HEAD-only policy (645–647), and canonical root/symlink/traversal checks (667–699); strengthen inventory allowlisting as in H2.
- **No TCP DevTools:** the launch records/checks for a remote-debugging pipe, absence of a remote-debugging port and `DevToolsActivePort` (1190–1192, 1210–1222); CDP attaches to the case page through `context.newCDPSession(page)` (1398–1403). Keep these fail-closed checks.
- **Private profile:** each run creates separate profile and HOME directories under the run temp tree (1067–1071); Chromium gets a minimal environment that redirects HOME, XDG_CONFIG_HOME and TMPDIR (401–411, 1107–1117). Retain private temp roots and the cleanup proofs (811–905), including browser/process teardown, server close/port probe, and temp-root removal.

## Isolation

- Report-only artifact written at `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w1/SentinelValidationHarness.md`.
- No production files were written; no clone, branch, or commit was created (not applicable); changed production paths: none.
