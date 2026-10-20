# CaseFlagsOffNegativeControl — `flags-off-negative-control` (round 16, wave 2)

Seat `TabiR16.CaseFlagsOffNegativeControl`, author-side attack, not certification. Lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`, measured revision `b444ca8e024f386124418169e8e400221524bba3`
(harness blob `961874e4…f8e2be1`, receipt blob `4429ed23…a172c1e`, both verified with `git show <REV>:… | sha256sum`).
Read-only on the lane; every mutant is a copy under `/tmp`. No tool installed or upgraded; pacman untouched.

## Verdict

**BREAKS.** The case's page-level observations are real and causally responsive, but its declared
`webmcpArgvTokens: 0` expectation is reported as satisfied with the browser argv never observed, and the
observation path is dead by construction (`SystemInfo.getProcessInfo` on a page target always errors). The
"effective argv clean" clause is not evidence; it is a constant. A second, latent defect would make the check
reject the *correct* flag-off run if observation were fixed. Under QUALITY 17 the case does not check the
producer's actual cause; it passes on a swallowed protocol error.

Sub-questions:

| Question | Verdict |
|---|---|
| Expectation from a named oracle, set before observation | **HOLDS** for before-observation (static source literal, not back-fitted); **UNPROVEN** as a named oracle (provenance names PLAN C2; PLAN contains no oracle/source line) |
| Is pass vacuous | **BREAKS** for the `argvClean` conjunct (dead observation + overbroad predicate); **HOLDS** for the other three conjuncts |
| Does the fixture bind | **BREAKS** case-locally (passes on a tool-less fixture); **HOLDS** at receipt/counter level (same-fixture positive control + committed-blob digest check) |

## Commands and observed output

**R1 — reproduction at HEAD**

```
cd /home/vgpnk/Projects/shokunin/tabi-shokunin
node scripts/webmcp-loopback-round16.mjs --out /tmp/w2-flags-off-negative-control.json
```

Observed: 11 `WEBMCP_CASE … status=pass` lines (the first is
`WEBMCP_CASE id=flags-off-negative-control status=pass`),
`WEBMCP_LOOPBACK verdict=pass cases=11 passed=11 failed=0 missing=0`, `EXIT=0`. Comparing the case record
with the committed receipt after deleting `durationMs`:

```
committed case==rerun case: true
rerun case: status=pass, expectedProvenance="harness-specified (PLAN C2 flag-off contract)",
  actual.effectiveArgv=null, actual.webmcpArgvTokens=[], detail="flags off: no document.modelContext,
  no toolsAdded, effective argv clean (pid null)"
rerun runs: flagged/flag-off/domain-disabled all pid=null, effectiveArgv=null, webmcpArgvTokens=[]
```

**R2 — root cause of `pid: null`** (`/tmp/w2-probe-procinfo.mjs`: same persistent-context launch, page CDP session):

```
PROCINFO_ERR cdpSession.send: Protocol error (SystemInfo.getProcessInfo): SystemInfo.getProcessInfo
  is only supported on the browser target
VERSION {"product":"Chrome/154.0.8037.97", ...}
ctxBrowser=[object Object]
```

`harness:710-717` calls `SystemInfo.getProcessInfo` on `context.newCDPSession(page)`, catches the error and sets
`pid = null`. This is deterministic, not a transient runtime failure: the command is invalid on a page target.

**M1 — tool-less fixture** (copy of the fixtures dir, `declarative-form.html` replaced by
`<!doctype html><html><body><p>no tools here</p></body></html>`, sha256 `98d51abe960040ba6cead7469b893dcaefb82ffb1a5a8f290dc9e91f39202b9b`):

```
node scripts/webmcp-loopback-round16.mjs --fixtures /tmp/w2-m1-Zmq6mU/fixtures --out /tmp/w2-m1-Zmq6mU/receipt.json
WEBMCP_CASE id=flags-off-negative-control status=pass
WEBMCP_CASE id=declarative-form-tool status=fail      (verdict=fail, EXIT=1)
flags-off record: status=pass, fixtureSha256=98d51a…b9b, detail="… effective argv clean (pid null)"
```

**M2 — WebMCP args injected into the flag-off launch** (one-line patch in a `/tmp` copy:
`launchChromium(..., [], 'flag-off')` → `launchChromium(..., WEBMCP_FEATURE_ARGS, 'flag-off')`):

```
WEBMCP_CASE id=flags-off-negative-control status=fail
detail="docMc=object navMc=false tools=1 argvTokens=[]"
run.launchedArgs=[host-resolver, "--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport,DeclarativeWebmcp",
                  "--enable-blink-features=WebMCP,WebMCPTesting"], run.webmcpArgvTokens=[]
```

**M6 — inert WebMCP token, live `/proc` capture** (one-line patch to pass
`['--enable-features=DeclarativeWebmcp']`; while the flag-off browser was alive, `cp /proc/<pid>/cmdline`):

```
argc=47
harness predicate hits (2):
  --enable-features=DeclarativeWebmcp
  --user-data-dir=/tmp/tabi-r16-webmcp-ZmsNlv/flag-off-profile-9igFE6
case status=pass reported tokens=[]
detail="flags off: no document.modelContext, no toolsAdded, effective argv clean (pid null)"
```

The `--user-data-dir=…/flag-off-profile-…` proves this was the flag-off launch. The token was in the real
process argv; the harness's own `/webmcp/i` filter (`harness:731`) matches it; the case still reports zero
tokens and passes. (M3, `--enable-features=WebMCP`, also flipped the case to fail with `docMc=object tools=1`,
corroborating that args passed through Playwright are effective.)

**C2 counter at REV** (context only):

```
node .ufo/waves/round-16/measure.mjs b444ca8e024f386124418169e8e400221524bba3 --claim C2
{"c2_webmcp_held":1, …, "failures":[]}
```

## Findings

**F1 (high) — the argv observation is dead code, so the `argvClean` conjunct cannot fail.**
`harness:730-731` computes `effectiveArgv = pid !== null ? readProcArgv(pid) : null` and
`webmcpArgvTokens = (effectiveArgv ?? []).filter(a => /webmcp/i.test(a))`. Because `pid` is always `null`
(F2/R2), `webmcpArgvTokens` is always `[]`, `argvClean` (`harness:775`) is always true, and the case's
`expected.webmcpArgvTokens: 0` can never diverge. This is not an unexercised branch in one run: all three
committed runs and all three rerun runs record `pid:null`, `effectiveArgv:null`. The header comment at
`harness:17-20` ("the effective argv is read back from /proc/<browser-pid>/cmdline; the flag-off control
asserts no WebMCP feature token reaches that argv") is false for the committed receipt. The `detail` string
"effective argv clean (pid null)" presents an unobserved value as a clean result. It is the exact
QUALITY-17 failure mode "passes on an exception rather than the actual cause".

**F2 (high) — the token predicate is overbroad and would reject the correct control if F1 were fixed.**
`/webmcp/i` matches the harness's own temporary profile path, because `main()` uses
`mkdtempSync(join(tmpdir(), 'tabi-r16-webmcp-'))` (`harness:1340`) and Playwright passes
`--user-data-dir=<that path>` into the browser argv. Applied to the captured real flag-off argv, the
harness's own predicate returns 2 hits (M6). A working pid therefore makes the legitimate, flag-free run
report at least one "WebMCP token" and fail. F1 and F2 mask each other: the green case depends on the
observation being dead.

**F3 (medium) — the case does not bind its fixture input.**
The flags-off case loads `declarative-form.html` but never checks that the page declared anything
(`fixtureDeclaration` is used by other cases, not here). M1 shows the case passing on a page with no
declarative tool, with the mutated fixture digest recorded (`98d51a…`). Binding exists only at receipt level:
the sibling `declarative-form-tool` case uses the same fixture and committed sha256 (`7816ea…`) and records
`toolsAdded=[search]` with `atMs:12`; `measure.mjs:241-251` additionally re-hashes `fixtureFile` against the
committed blob and requires `off.toolsAdded.length===0` and `pos.toolsAdded.length>0`. So the receipt and the
C2 counter bind the fixture; the case in isolation does not.

**F4 (medium) — expected and actual are not machine-comparable; `divergence:false` is a default.**
`expected` keys are `webmcpEnable, documentModelContext, navigatorModelContext, toolsAdded, webmcpArgvTokens`;
`actual` keys are `webmcpEnableResult, enableSeq, documentModelContext, navigatorModelContext,
isSecureContext, effectiveArgv, webmcpArgvTokens, issues`. `expected.webmcpEnable` (a prose sentence) is not
consulted by `pass`; `actual.webmcpEnableResult` is `{}` here and also `{}` in M2/M6 where WebMCP flags were
demonstrably active, so it is non-discriminating. `pushCase` writes `divergence: result.divergence ?? false`
(`harness:1360`) and this case returns no `divergence`, so the receipt asserts "no divergence" without
computing any comparison. QUALITY 17's "retain the real expected/actual structure" is met only as a
side-by-side of differently shaped objects, not as a checked expectation.

**F5 (medium) — the case is not bound to the pinned browser binary.**
`pid:null` also nulls `realExecutable` (`harness:732-738`), so `runtime.observed.chromium.realExecutable` and
`realExecutableSha256` are `null` in the receipt. The recorded `launchSha256` =
`eaed39c36bdf6ff6ff23f9f5215aaab017e59723b96f27f7fcd5e0be833a172b` is the `/usr/bin/chromium` wrapper
(verified by `sha256sum`), not the pinned `/usr/lib/chromium/chromium` =
`95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a` (`runtime-pin.json`). `Browser.getVersion`
gives `Chrome/154.0.8037.97` as a product string, not a binary digest.

**F6 (unproven, low) — "named oracle" is not established.**
`expectedProvenance` is `"harness-specified (PLAN C2 flag-off contract)"`; the expected object is a static
literal in the case function (`harness:785-790`) and is identical in the committed receipt and the rerun, so it
was set before observation and is not back-fitted. But `PLAN.md` contains no `oracle` line and cites no
spec/WPT/Chromium source for this expectation; the sibling `devtools-domain-disabled` case by contrast names
`.ufo/waves/round-16/probes/WebmcpProbeFlags.json`. For a definitional flag-off differential the negation is
the natural expectation, but the named-oracle claim itself is unsupported.

## What holds

- **Expected is pre-observation, not a capture.** The literal is in the producer source committed before the
  measured run; committed and rerun case records are byte-identical except `durationMs` (1720 vs 1740).
- **The page-level conjuncts are live.** M2/M3 flip the case to `fail` with `docMc=object tools=1`; the
  negative control does distinguish a genuinely flag-less launch from one with the feature set.
- **Positive control and receipt-level fixture binding.** `declarative-form-tool` on the same fixture and
  sha256 records `toolsAdded=[search]`, and the C2 counter re-verifies the committed fixture digest.
- **Wait budget is adequate.** Positive `WebMCP.toolsAdded` arrived at `atMs:12`; the negative control waits
  1500 ms for a positive signal before concluding absence.
- **No host-level flag injection found.** `/etc/chromium-flags.conf` does not exist, and `minimalBrowserEnv`
  redirects `HOME`/`XDG_CONFIG_HOME` to a temp dir, so the Arch launcher's per-user flags file is isolated.
  (The process-level check that would confirm this is the dead F1 path, but M2 shows Playwright-applied args
  are effective.)

## Residual risk and verification gaps

- F1's effect is deterministic (`SystemInfo.getProcessInfo` target scope error, reproduced with a standalone
  probe); I did not test an alternative Playwright version, but the page-target restriction is a protocol-level
  property of the command, not a version quirk.
- I did not audit the other ten cases; several share `attachCdp` and `launchChromium`, so F1/F5 likely affect
  every case's `run` record, not only this one.
- The `declarative-form.html` `__webmcpFixture.expectedTools` back-fitting concern raised in
  `.ufo/waves/round-16/w1/CriticC2.md` §1 is a sibling item and was not re-attacked here.
- The C2 counter still counts 1 at REV because it checks only case statuses, committed fixture digests and
  `toolsAdded` counts; it does not read `effectiveArgv`/`webmcpArgvTokens`. So this defect does not flip the
  counter, but the receipt's argv claim remains false either way.

## Reviewer advice (recommendation only)

Until the argv path is live and discriminating, this case should not be counted as QUALITY 17's "actual
cause" check. Minimal repair: obtain the browser pid (the harness already has `findProcessesUsing`, which can
locate the process by its `--user-data-dir=<profile>` marker), treat `pid === null` as
`could_not_evaluate`/fail instead of `argvClean = true`, exclude `--user-data-dir` and the harness temp marker
from the token predicate, assert the recorded `WebMCP.enable` result in `pass`, and either align the
expected/actual key spaces or compute `divergence` instead of defaulting it to false. The fixture binding is
already adequate at receipt level via the same-fixture positive case and the counter's committed-blob digest
check, so it need not be duplicated inside this case.
