VERDICT: ISSUES

# C2 contract review

## Findings

### HIGH — h1 can count an ordinary startup failure as a handled signal

PLAN.md:83 allows the SIGTERM trigger at the first `case` line **or after 6 s**, but its success conditions only require exit 2, no `verdict=fail`/`pass` receipt, and no surviving browser pid. They do not require that the process was still alive and had reached a case when SIGTERM was delivered, that delivery succeeded, or that the result identifies `run_aborted`.

The round-17 harness has a concrete competing path: `failStart()` emits an error and calls `process.exit(2)` directly (`scripts/webmcp-invoke-round17.mjs:817-820`). If the six-second fallback fires after that startup failure, the harness already has the expected exit code and no verdict receipt or browser pid; the signal may never reach a live process. This can make the unfixed B artifact pass h1 without exercising signal handling. Require a live process and observed first-case boundary before signaling; treat failure to reach that boundary as an inconclusive/red probe, not success.

### HIGH — h2 does not exercise the documented leaking exits

The counter defines h2 as a TMPDIR check after h1's SIGTERM run and a normal run (PLAN.md:83-85). The reported H2 failures are different paths: the short watchdog timeout and SIGINT leave the run tree, profiles, and Chromium temp directories behind (SentinelHarnessAfter.md:29-40). The report says SIGTERM instead lets Playwright close browsers while `main` continues, writes a `verdict=fail` receipt, and exits 1 (lines 17-20); ordinary completion reaches the one `rmSync(tmpBase)` path, while a clean close removes Chromium's external temp dirs (lines 35-40).

[INFERENCE] Given those documented paths, B can leave TMPDIR empty after the h1 SIGTERM run and normal run, so h2 can be green at B despite the demonstrated watchdog/SIGINT leaks. Regardless of whether that exact SIGTERM run leaves a stray, h2 does not exercise the reported leak triggers and cannot substantiate “every exit path.” Add counter-owned abnormal-exit cases for the watchdog and a handled signal such as SIGINT, and inspect cleanup after each; keep normal-run cleanup as a separate control.

### MEDIUM — s1 checks token counts, not feature preservation

The C2 hazard requires one enable token and preservation of the union of intended features (PLAN.md:29-35). The counter only checks one `--enable-features=` and at most one `--disable-features=` token (PLAN.md:87-88). A revision can satisfy those counts while dropping required features or supplying an empty/unrelated set. That misses the reported S1 defect: the duplicate enable switch dropped Playwright's `CDPScreenshotNewSurface`, changing the flagged/flag-off comparison (SentinelHarnessAfter.md:69-75). Assert the expected feature membership/union for each launch as well as cardinality.

### MEDIUM — h4's post-run byte scan can miss an actual download

h4 accepts a passing `invoke-download-refused` case plus no bytes under TMPDIR after the normal run (PLAN.md:86-87). The r17 report records that Playwright removes the download artifacts directory both on browser close and on `process.exit(2)` (SentinelHarnessAfter.md:53-59). Therefore an actual download can leave no bytes for the post-run scan to find. The remaining signal is the harness-owned case status; the counter text does not require an independently observed attempted download or a recorded refusal event. Require a unique download attempt, verify the refusal/record while the run is live, and do not treat post-cleanup absence as evidence that no write occurred.

### MEDIUM — h3 is a marker check, not a listener check

For the exact r17 regression, the planned checks should be red: the report observed `--remote-debugging-port=0`, a `DevToolsActivePort` file, and a reachable `/json/list` endpoint (SentinelHarnessAfter.md:42-51). But PLAN.md:85-86 never requires observing listening sockets; it checks argv and a file only in “the run's profile dirs.” It does not specify that argv is the browser's complete effective argv, how every profile directory is discovered, or that observations cover every launch for the full run. Thus a port listener that is outside those observations (for example, a listener from a helper or a profile path not included in the scan) can coexist with a green h3. If the claim is “no TCP DevTools port,” inspect live listening sockets for every observed browser process throughout the run, in addition to checking the flag and active-port marker. The two current markers alone do not prove absence of a listener.

### MEDIUM — F6 closes the wrapper route, not the frozen CLI globally

The wrapper is a real improvement over a SKILL-only instruction for callers that invoke it. Without `--rev`, `freshness-witness.mjs` chooses the checked-out local branch or, for detached HEAD, `refs/heads/master`, and resolves it to a full commit hash (`:86-110`); it passes that hash to the frozen checker (`:152-154`). Its parser rejects `--rev HEAD` (`:117-123`). The planned detached-poison dry-run and rejection test exercise those wrapper behaviors (PLAN.md:88-89).

This is not a code-level closure of `check-freshness --witness HEAD` itself. The byte-frozen checker still accepts any non-`--` witness token (`scripts/check-freshness.mjs:49-50`), uses it in `git show` (`:63-71`), and prints it as `revision=` (`:113-114`). A direct invocation of `check-freshness.mjs --witness HEAD` still bypasses the wrapper. Round-17 PLAN.md explicitly records that acceptance as not fixed in code and relies on a SKILL invocation rule (round-17 PLAN.md:44-48). Round 18 closes that gap only for wrapper users; the plan does not make the wrapper mandatory or migrate/enforce all callers. Count F6 as wrapper-path closure, not global removal of the frozen CLI's HEAD behavior.

Also, the wrapper's explicit `--rev` path accepts any 40-lowercase-hex ancestor of `refs/heads/master` and passes that chosen revision through (`freshness-witness.mjs:140-149`). That can be a historical commit rather than the current tip. This may be intentional: QUALITY.md:121 says an explicit `--witness` is the caller's revision. If C2 intends only to prevent symbolic `HEAD` while allowing explicit historical revisions, say so; if it intends every invocation to witness the current lane tip, the wrapper contract and probe are narrower than that claim.

## Verification gaps / residual risk

- At this review snapshot, `.ufo/waves/round-18/measure-c2.mjs` was absent from the round-18 wave directory, so no executable C2 counter result was available to inspect. The working-tree `scripts/webmcp-invoke-round18.mjs` and `scripts/webmcp-invoke-round17.mjs` had identical SHA-256 `de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7` (`sha256sum`); the round-18 copy still contains the port argument (`:91, :599`) and browser `TMPDIR: tmpdir()` (`:221`). Consequently, this snapshot does not demonstrate green-on-REV behavior; in particular the current round-18 file would fail the stated h3 condition.
- No runtime counter probes were run for this review. No LSP device/route was exposed in the provided tool inventory, so no LSP status/references/definition/diagnostics checks were available.
- No tools were installed or updated.

Files written:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/ReviewC2Contract.md`
