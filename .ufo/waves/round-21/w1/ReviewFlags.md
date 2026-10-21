# ReviewFlags

Axes reviewed: feature-switch fidelity, effective-launch observability, and resolver loopback policy.

## Finding — Medium: effective feature flags and resolver policy are not checked against Chromium's actual argv

**Falsifiable failure shape.** A duplicate, overridden, or omitted feature/resolver switch in Chromium's effective command line can coexist with a receipt that reports the intended flags and with a successful-looking run summary. The round-21 runtime never reads or validates the browser's effective argv: `scripts/webmcp-lifecycle-round21.mjs:28` declares `FLAGS`; `:100` copies that constant into `receipt.environment.flags`; `:118` passes it to `launchPersistentContext` with `ignoreDefaultArgs`; and `:44-57` reads `/proc/<pid>/cmdline` only to find the process owning the profile, then retains PIDs rather than argv. The runtime's evidence object likewise initializes PID arrays, not argv (`:114`). Thus the receipt's `flags` describes requested launch options, not demonstrated effective switches.

This matters for the exact round-21 target: the shared contract requires the round-19 flags and a loopback-only server (`.ufo/waves/round-21/w1-spec.json`, `context`); the configured round-21 WebMCP feature union and resolver string match the r19 declarations (`scripts/webmcp-lifecycle-round21.mjs:28`; `scripts/webmcp-validation-round19.mjs:44-52`). I found no source-level mismatch in those requested values. However, round 17 documented a real effective-argv pitfall: the flagged run had two `--enable-features` occurrences and Chromium used only the last (`corpus/knowledge/webmcp-invocation-round-17.md:99-104`; the receipt's flagged `effectiveArgv` and `featureSwitches` show both occurrences and the last token). The r19 successor explicitly reads the launched process argv, checks token multiplicity/content and the exact resolver rule (`scripts/webmcp-validation-round19.mjs:608-654`), and fails closed when those guards do not hold (`:669-688`). Round 21 has no equivalent guard.

**Minimum acceptance condition.** After launch, read the profile-owned Chromium main process's effective argv; before invoking the tool, reject unless it contains one merged `--enable-features` token with the required r19 WebMCP features (and the pinned Playwright default feature if intentionally retained), one `--enable-blink-features=WebMCP,WebMCPTesting`, no disable-feature conflict for those features, and exactly one `--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1`. Record the validated effective tokens (or the full argv) in the receipt/evidence so its digest binds the claim. The check must distinguish effective argv from the current `FLAGS` input constant.

The pinned execution record reports exit 0 and case summaries, but does not carry the launched argv (`.ufo/waves/round-21/runtime-execution-pinned.json:5-16`). The contract's expected output path is `corpus/evidence/round-21/runtime`; no files were present under that path in this review snapshot, so there is no runtime receipt/evidence available here to close the argv gap. This is an evidence/guard gap, not an observation that the current browser actually launched with incorrect flags.

## Residual risk and verification gaps

- The resolver rule configured in round 21 is text-identical to r19's rule and the r19 launch guard, and the configured feature list contains the r19 required names plus `CDPScreenshotNewSurface`; effective equality remains unobserved by the round-21 code/artifacts reviewed.
- Round 16 explicitly limited its network-confinement claim to page-level requests and noted uncovered WebRTC, WebTransport, and SharedWorker traffic (`corpus/knowledge/webmcp-chromium-loopback-round-16.md:120-127`). Do not broaden this loopback fixture result into a global browser-network-isolation claim.
- The LSP device is not mounted (`read xd://lsp` returned “No such tool”); direct source reads above are the cited evidence. No tests, checks, or browser run were performed. No tools were installed or updated.

Report: `.ufo/waves/round-21/w1/ReviewFlags.md`
