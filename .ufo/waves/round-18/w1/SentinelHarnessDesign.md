VERDICT: ISSUES

Axes reviewed: browser/network privilege, download/temp-file confidentiality, cleanup/availability, and evidence integrity.

Scope: this is a design review before implementation. Reading `scripts/webmcp-invoke-round18.mjs` returned “not found” at review time, so the items below are conditional risks and wave-2 attack assertions, not claimed defects in an unseen implementation.

## Findings

### C2-1 — CDP pipe / `newCDPSession(page)`
**Severity:** MEDIUM (conditional).

**Exploit path:** A wrong or stale page selection can attach the privileged CDP session to a non-fixture target; a harness that trusts the pipe merely because it is not TCP can also accidentally retain another debug transport. Switching from the round-17 raw socket to Playwright's CDPSession can silently reduce what the receipt records (e.g. raw request/response frames, protocol errors, event ordering) unless those observations are deliberately preserved.

**Evidence:** PLAN.md:27-32 requires pipe CDP and no TCP port; PLAN.md:81-89 defines the no-port/DevToolsActivePort probe. Round-17 describes its raw TCP CDP socket at scripts/webmcp-invoke-round17.mjs:34-37 and constructs `--remote-debugging-port=0` at :596-607.

**Impact:** An unintended target could be controlled or inspected, or the harness could report a weaker/incomplete observation as equivalent evidence. The pipe removes a listening TCP control endpoint, but does not make the in-process CDP session unprivileged.

**Smallest remediation:** Attach only to the explicitly created fixture page, detach in `finally`, and make the wave-2 probe verify no `--remote-debugging-port` or `DevToolsActivePort` while confirming all required CDP outcomes/events remain in the receipt. Treat the pipe/session as privileged; never route page-controlled text into session commands.

### C2-2 — `acceptDownloads:false`
**Severity:** MEDIUM (conditional).

**Exploit path:** A fixture triggers a browser download. `acceptDownloads:false` and not calling `saveAs()` may reject Playwright's accepted-download handling without proving Chromium never created bytes in its temporary download/profile area. A test that checks only the event or absence of a caller-specified output file can miss a temp artifact.

**Evidence:** PLAN.md:28-30 requires refused-download coverage and PLAN.md:86-87 requires no downloaded bytes under TMPDIR. The round-17 launch options at scripts/webmcp-invoke-round17.mjs:600-607 do not set `acceptDownloads`.

**Impact:** Untrusted fixture content can be written to disk despite the “refused” verdict, and may persist if teardown misses the browser's download area.

**Smallest remediation:** Make the fixture trigger an actual download; record the observed refusal outcome, then recursively verify the entire run TMPDIR/profile tree contains no downloaded bytes both before and after context close. Do not equate “no `saveAs`” or “download event rejected” with “no file written.”

### C2-3 — signal-driven cleanup
**Severity:** MEDIUM (conditional; high operational impact if it produces a passing receipt).

**Exploit path:** SIGTERM/SIGINT/SIGHUP arrives while launch is awaiting, before the returned context is added to the tracked set, or while ordinary cleanup is already closing contexts/removing files. A second signal can interrupt an asynchronous handler; concurrent cleanup can remove TMPDIR while Chromium is still alive or leave an untracked browser running.

**Evidence:** PLAN.md:25-26 specifies abort status and full temp cleanup; PLAN.md:82-84 probes SIGTERM. Round-17 has direct `process.exit(2)` paths in scripts/webmcp-invoke-round17.mjs:817-820 and :2118-2127, which bypass awaited cleanup. Its launch helper only returns the context after `launchPersistentContext` resolves (:596-607), so the new signal path must cover in-flight launch too.

**Impact:** Orphan browser/children, recreated temp files, leaked profile/download data, or a partial result mislabeled pass/fail.

**Smallest remediation:** Register handlers before creating the run tree or launching anything; funnel signals and normal completion through one idempotent async shutdown promise. Track/close in-flight launches, wait for the whole browser process tree to exit before deleting TMPDIR, and only then emit `exit 2` / `run_aborted` with no pass/fail receipt. Do not call `process.exit()` from the signal callback before that completes.

### C2-4 — browser TMPDIR nested in the run directory
**Severity:** MEDIUM (conditional).

**Exploit path:** Chromium or a child writes a temp/download artifact under the nested TMPDIR while cleanup is running, or uses a different environment/temp location than the harness assumes. If cleanup follows a caller-controlled or mis-resolved path rather than the fresh run directory, recursive removal can also affect the wrong tree.

**Evidence:** PLAN.md:25-26 requires removal of Chromium temp trees and setting browser TMPDIR inside the run dir; PLAN.md:84-85 requires an empty TMPDIR after signal and normal runs. Round-17 instead creates `tmpBase` under `os.tmpdir()` at scripts/webmcp-invoke-round17.mjs:856 and passes `tmpdir()` to the browser at :214-225; it removes the base at :1937-1940.

**Impact:** Temp artifacts can escape the scanned tree or reappear after cleanup; unsafe path derivation can widen deletion beyond this run.

**Smallest remediation:** Create one fresh, private run directory; pass its canonical absolute path as browser TMPDIR; use only that owned path for cleanup. Verify the child receives that value, all browser children are gone before recursive removal, the run tree is empty afterward, and cleanup never falls back to deleting a parent or caller-selected path.

### C2-5 — feature merging with `ignoreDefaultArgs`
**Severity:** HIGH if defaults are broadly ignored; otherwise MEDIUM.

**Exploit path:** Setting `ignoreDefaultArgs:true`, or using an overbroad filter to remove feature switches, can discard Playwright's generated launch arguments along with the duplicated feature token(s). The resulting argv may omit required pipe/safety behavior or lose default feature settings; trusting the requested options rather than effective argv can conceal a sandbox regression.

**Evidence:** PLAN.md:28-31 requires one effective `--enable-features=` and at most one `--disable-features=` with intended features preserved. Round-17 documents last-occurrence behavior and audits effective argv/counts at scripts/webmcp-invoke-round17.mjs:624-644. Its launch explicitly sets `chromiumSandbox:true` at :600-607.

**Impact:** Browser isolation or expected feature behavior can silently change while the harness still launches and produces a receipt.

**Smallest remediation:** Avoid boolean `ignoreDefaultArgs:true`; if filtering is necessary, remove only the exact conflicting feature arguments and reconstruct their complete intended union for the pinned Playwright version. Keep `chromiumSandbox:true`; audit every launch's effective argv and fail closed if `--no-sandbox` appears, the pipe is absent, required defaults/features are lost, or feature-switch counts violate PLAN.

## Round-17 launch-option audit

At scripts/webmcp-invoke-round17.mjs:596-607, the explicit args are the host-resolver deny rule, `--remote-debugging-port=0`, and caller-supplied feature args; launch options include `chromiumSandbox:true`, with no explicit `--no-sandbox`, proxy option, or extension-loading argument in that launch call. The source search found no explicit `--no-sandbox`, proxy, or `--load-extension` option in the script. Its minimal child environment at :214-225 passes only HOME, XDG_CONFIG_HOME, PATH, TMPDIR, TZ, and LANG, not proxy environment variables. This is a source-level observation, not a claim about a separately configured Chromium binary or observed runtime argv.

## Wave-2 attack checklist for `scripts/webmcp-invoke-round18.mjs`

- [ ] Exercise every launch variant (normal, feature-off/control, domain-disabled): inspect effective `/proc` argv, not just requested Playwright options. Require one `--enable-features=`, at most one `--disable-features=`, and the complete intended feature union.
- [ ] Confirm `chromiumSandbox:true` remains effective and `--no-sandbox` is absent; check the debug pipe is retained, `--remote-debugging-port` is absent, and no `DevToolsActivePort` appears.
- [ ] Check no proxy launch option, proxy-related argv, inherited proxy environment, extension-loading switch/path, or unexpected user Chromium config reaches the browser. Confirm the minimal environment is actually used.
- [ ] Verify CDPSession attaches only to the intended loopback fixture page, records required outcomes/errors/events, detaches on success and failure, and cannot be mistaken for an externally reachable endpoint.
- [ ] Trigger `invoke-download-refused`; assert the expected refusal is observed and scan the full run TMPDIR, profile, and download locations for bytes before and after context shutdown. Include a case where the download starts but the harness never calls `saveAs()`.
- [ ] Send SIGTERM at the PLAN probe point and test SIGINT/SIGHUP plus a repeated signal during launch, case execution/download, and cleanup. Require exit 2 / `run_aborted`, no pass/fail receipt, no surviving browser child, and no temp residue; verify cleanup is single-flight and handles a launch still in progress.
- [ ] Verify browser TMPDIR is the canonical private run directory, temp/profile paths stay beneath it, the browser process tree exits before deletion, and a normal run and every abort leave the directory empty without deleting anything outside it.

Files written: /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/SentinelHarnessDesign.md
