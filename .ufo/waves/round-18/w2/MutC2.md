VERDICT: ISSUES
# MutC2 — committed fault injections against the unchanged round-18 counter

Local mutation-detector findings only; no admission, integration, or shipping judgment.

## Scope and axes

- Assigned candidate: `530f40a9bc3f10436161a2af1ca0fe9bffffc004`.
- Historical round baseline `2bff864fdfee684ddbcd066cc8e735adaba2735c` was not measured in this assignment. “Pristine” below means the assigned candidate, not that historical baseline.
- Axes: startup/signal discrimination; signal-cause evidence rather than exit-code coincidence; actual browser execution versus receipt replay; feature-union preservation despite single-switch composition; transient download detection before deletion; exact-byte restoration and finite reproducibility.
- Production was read-only except this assigned report. All five source mutations and commits were made only in `/tmp/tabi-r18-mutc2-lUlneVEc/repo`, a `git clone --no-hardlinks` of the lane. No fleet/sibling/jj/index write in the lane; no subagent/runtime dispatch.
- Each mutant is a separate direct child of the candidate; mutations are not stacked. The only changed tracked path in each mutant is `scripts/webmcp-invoke-round18.mjs`. The counter and freshness wrapper were not edited.
- Node `v24.21.0`; Chromium `154.0.8037.97 Arch Linux`; Git `2.56.0`. The actual harness accepted its enforced Playwright `1.64.0` pin and retained coverage passed in both clean controls. No tools installed or upgraded. No pacman/system/service operation.

## Main finding

**H4 grants download-refusal credit to a program that launches no browser.** The seven-line entry-point shortcut below replays the candidate's committed passing receipt, updates both producer digests to the mutant's actual SHA-256, prints the expected download-pass case line, waits 1 s, writes the receipt, and returns 0 before any Chromium-launch code. The unchanged counter reports `c2_hazards_closed=3`, `h4.pass=true`, `coverage.pass=true`, while its own H3/S1 diagnostics report **zero observed browser argv**. H1 and F6 also remain true; F6 is the unchanged wrapper and is not itself the injected defect.

Source boundary: `.ufo/waves/round-18/measure-c2.mjs:551-580` accepts functional coverage from JSON case/control statuses. Its H4 predicate at `:646-689` trusts the receipt's invocation/refusal/pre/post-scan objects plus a stdout case line and does not require an observed browser or fresh counter-owned download transaction. H3 `:618-628` and S1 `:742-756` do independently reject zero browser samples, but that failure is not shared with H4. This is a hazard-level survivor, not a 6/6 survivor. The report records it as a coverage finding and does not change the contract or counter.

The other four requested faults lose their appropriate credit. The accepted-download fault is caught before close even though its post-close scan is clear. Thus the observed hole is receipt-replay/browser causality, not failure to notice the unmodified real harness's pre-close marker scan.

## Clean controls and initial environmental limitation

The first attempted `async:true` recorder invocation was refused before execution with `Background job limit reached (100). Wait for running jobs to finish or cancel one.` The same recorder was then invoked synchronously. No detector result is attributed to the refused invocation.

The first completed pristine run used a long private TMPDIR beneath the report sandbox and returned 3/6: H2/H3/S1 had zero observed browser argv, despite a passing 11-case/4-control/download receipt. This is an **inconclusive control for those hazards**, not a mutant kill. The harness's socket-path guard at `scripts/webmcp-invoke-round18.mjs:1345-1349` falls back to `/tmp` when the candidate Chromium socket path is >=100 characters, while the counter samples processes by its child TMPDIR marker (`measure-c2.mjs:449-460`). The long environment therefore escapes the counter's process marker. Its exact output is retained below, not hidden or relabeled a pass.

To keep every browser tree under its actual counter-owned marker, the recorder was changed only to allocate a unique private 4-hex-named directory immediately below `/tmp` (mode 0700). At a 9-character temp root such as `/tmp/b43e`, the harness's candidate socket path is 99 characters, satisfying its `<100` branch. The unchanged counter then measured pristine **6/6**, all hazards true. Every mutant and the restored clean control used this same short-root environment policy. The restored result was also **6/6**. These two passing clean controls, not the long-path diagnostic run, are the controls for the mutation verdicts.

## Exact detector and limits

Counter path: `/tmp/tabi-r18-mutc2-lUlneVEc/repo/.ufo/waves/round-18/measure-c2.mjs`.

The recorder invokes exactly the `argv`, `cwd`, and TMPDIR/TMP/TEMP overrides embedded in each capture below; no worktree-artifact/wrapper override and no `--self-test` was used. Command surface:

```text
node /tmp/tabi-r18-mutc2-lUlneVEc/run-counter.mjs pristine-short 530f40a9bc3f10436161a2af1ca0fe9bffffc004
```

Actual labels/commits are given explicitly below. The recorder captures stdout/stderr bytes, records their SHA-256, and has a 660000 ms outer deadline (SIGTERM, then SIGKILL 5000 ms later). None reached that deadline. All evaluated counter invocations returned exit **0**, which means “evaluated” in this counter (`measure-c2.mjs:72,926-998`), **not** that six hazards passed. Its own child exit codes and diagnostic evidence are in stdout.

Counter bounds at the measured bytes: first-case wait 6000 ms; post-signal cleanup observation 5000 ms; post-signal close wait 30000 ms; SIGTERM and SIGINT early probes; normal timeout 480000 ms; watchdog source-only substitution `RUN_TIMEOUT_MS = 420000` → `6000`, watchdog-child timeout 26000 ms; process/download sampling 200 ms; each `ss -H -ltnp` scan timeout 1000 ms; clone timeout 120000 ms; ordinary Git/command timeout 30000 ms; maxBuffer 64 MiB. The counter's watchdog transformation and exact before/after producer hashes appear in every output record. It is counter-owned instrumentation applied identically, not a mutation to the counter itself.

Browser work was limited to the harness's fixture-owned loopback with fresh private HOME/profile/temp trees and the Playwright CDP pipe. No 9222, real-site page invocation, credentials, or public-source mutation. Each counter deletes its own nested clone and probe temp trees in its `finally` path; the recorder deletes its short outer temp root. Only this report is retained after final sandbox cleanup.

## Isolation/commit command evidence

Executed clone/setup commands, exit 0:

```sh
git -c core.hooksPath=/dev/null clone --no-hardlinks /home/vgpnk/Projects/shokunin/tabi-shokunin /tmp/tabi-r18-mutc2-lUlneVEc/repo
git -C /tmp/tabi-r18-mutc2-lUlneVEc/repo -c core.hooksPath=/dev/null checkout --detach 530f40a9bc3f10436161a2af1ca0fe9bffffc004
```

Observed setup output: `Cloning into '/tmp/tabi-r18-mutc2-lUlneVEc/repo'...`, `done.`, `HEAD is now at 530f40a round-18: source rechecks, guarded harness, routed correction evidence and build wave`.

Each branch was created from the candidate with the following exact commands, each exit 0:

```sh
git -C /tmp/tabi-r18-mutc2-lUlneVEc/repo -c core.hooksPath=/dev/null switch -c probe-startup-exit2
git -C /tmp/tabi-r18-mutc2-lUlneVEc/repo -c core.hooksPath=/dev/null switch -c probe-swallow-sigterm
git -C /tmp/tabi-r18-mutc2-lUlneVEc/repo -c core.hooksPath=/dev/null switch -c probe-forged-receipt
git -C /tmp/tabi-r18-mutc2-lUlneVEc/repo -c core.hooksPath=/dev/null switch -c probe-dropped-defaults
git -C /tmp/tabi-r18-mutc2-lUlneVEc/repo -c core.hooksPath=/dev/null switch -c probe-accept-download
```
 Source deltas below were applied with the surgical edit tool. The exact common commit argv (only message changes) was:

```sh
git -C /tmp/tabi-r18-mutc2-lUlneVEc/repo -c core.hooksPath=/dev/null add -- scripts/webmcp-invoke-round18.mjs
git -C /tmp/tabi-r18-mutc2-lUlneVEc/repo -c core.hooksPath=/dev/null -c user.name=TabiR18.MutC2-2 -c user.email=tabi-mutc2@example.invalid -c commit.gpgSign=false commit -m 'probe: return exit 2 before browser launch'
git -C /tmp/tabi-r18-mutc2-lUlneVEc/repo -c core.hooksPath=/dev/null switch --detach 530f40a9bc3f10436161a2af1ca0fe9bffffc004
```

All five add/commit/restore command chains exited 0. Their exact branch, message, commit, and patch are retained below; after each commit `switch --detach` restored the same candidate before the next branch. The final checkout restored the exact candidate bytes before running the clean restored detector. The five independent mutants and restored counter were executed concurrently in one six-call batch. No production Git write occurred.

## Before/after byte evidence

SHA-256, full:

- Counter before, every measured run, and restored: `71478eef46ca0c23684fd0c85467ad853cede15e862936d83bc8ce292fb7fcb6`.
- Harness pristine and restored: `0a1201a9c01e4ee23f8a94ad6d75b868c626f96c97960797acf05b6bdbfbe155`.
- Empty stderr in every completed detector run: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.

| Mutant | Commit | Mutated harness SHA-256 | Expected hazard result | Observed count | Outcome |
|---|---|---|---|---:|---|
| startup-exit2 | `8f34cadf6b45b7f4ee9c4788356c2982f9ff80e8` | `30ecc46a8dc5e9316ff4be586003e070b8ebf446583b2ca09ab5b6e8be94995f` | H1=false; missing coverage rejects credit | 0 | KILLED |
| swallow-sigterm | `3d4a68f3c893a5f92b1c6c5566cfcfdd2c445476` | `fbc2e60aa8ec3845d32a66e1bb36fb163908f42e8b09e4ec14e7a5ee0af2e50a` | H1=false | 5 | KILLED |
| forged-receipt | `2cb4143290e12b489f3822d9274874c033ea50a8` | `b6b38a33f798f7cdd789622a74f09912c326a42fc800aa1ee835426416c1ce5a` | H4=false; no real browser invocation | 3 | SURVIVED at H4; other browser hazards rejected |
| dropped-defaults | `c174f9722f56bb8c4b82245da86fb2e42650efb3` | `b65f4651c89fe729640a0da8ad3541f4a7aab1b78aa7fa9cac11e4606831d766` | S1=false | 5 | KILLED |
| accept-download | `7a7502e8fdb87e05b420ab2961e0727ee5779639` | `c53b9d16d613b0f5cdb22db011c093e39b60130c815c86fbb86eb8969d39a000` | H4=false | 0 | KILLED |

Each mutated SHA is also independently reported as `artifactSha256` by the unchanged counter. `sha256sum` after final restore printed the original harness and counter hashes above, and the restored counter independently selected those same hashes. The report does not claim byte-identical dynamic receipts: paths, timestamps, nonces, and poison-commit IDs differ; exact receipt/output hashes are retained below.

## Mutation 1: startup-exit2

Branch `probe-startup-exit2`; commit `8f34cadf6b45b7f4ee9c4788356c2982f9ff80e8`; parent `530f40a9bc3f10436161a2af1ca0fe9bffffc004`.

Commit message: `probe: return exit 2 before browser launch`.

Expected detector: H1 and retained functional coverage must not be credited for a pre-launch exit 2.

Observed verdict: **KILLED: 6 → 0; h1=false, no case started, no signal sent, no coverage receipt.**

Exact independent source delta relative to the candidate (all in `scripts/webmcp-invoke-round18.mjs`):

```diff
--- a/scripts/webmcp-invoke-round18.mjs
+++ b/scripts/webmcp-invoke-round18.mjs
@@ -1303,6 +1303,7 @@
 async function main() {
   const t0 = Date.now();
   const args = parseArgs(process.argv.slice(2));
+  return 2;
   if (args.help) {
     await cleanup();
     console.log('node scripts/webmcp-invoke-round18.mjs [--out PATH] [--fixtures DIR] [--chromium PATH] [--force]');
```

## Mutation 2: swallow-sigterm

Branch `probe-swallow-sigterm`; commit `3d4a68f3c893a5f92b1c6c5566cfcfdd2c445476`; parent `530f40a9bc3f10436161a2af1ca0fe9bffffc004`.

Commit message: `probe: swallow SIGTERM and self-exit 2 after cleanup`.

Expected detector: H1 must reject a swallowed SIGTERM followed by a cleanup/timer-driven exit 2 without signal-abort evidence; normal functional coverage should remain passing.

Observed verdict: **KILLED: 6 → 5; only h1=false. Counter observed exit=2, no receipt, no surviving TMPDIR process, but run_aborted/SIGTERM=false.**

Exact independent source delta relative to the candidate (all in `scripts/webmcp-invoke-round18.mjs`):

```diff
--- a/scripts/webmcp-invoke-round18.mjs
+++ b/scripts/webmcp-invoke-round18.mjs
@@ -2780,6 +2780,10 @@
 
 for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
   process.on(signal, () => {
+    if (signal === 'SIGTERM') {
+      setTimeout(() => { void cleanup().then(() => process.exit(2)); }, 250);
+      return;
+    }
     if (!abortState) markAborted({ kind: 'signal', signal, message: `received ${signal}` });
     void cleanup().then(
       () => {
```

## Mutation 3: forged-receipt

Branch `probe-forged-receipt`; commit `2cb4143290e12b489f3822d9274874c033ea50a8`; parent `530f40a9bc3f10436161a2af1ca0fe9bffffc004`.

Commit message: `probe: fabricate passing receipt without launching browser`.

Expected detector: Browser-execution-dependent hazard credit, especially H4, must be withheld when the program only replays a passing receipt and emits a live case line without launching Chromium.

Observed verdict: **SURVIVED AT H4: total 6 → 3, h4=true with observed browser argv=0. h2/h3/s1 reject the absent browser; h1/f6 also remain true. This is not a claim that the whole mutant retained 6/6.**

Exact independent source delta relative to the candidate (all in `scripts/webmcp-invoke-round18.mjs`):

```diff
--- a/scripts/webmcp-invoke-round18.mjs
+++ b/scripts/webmcp-invoke-round18.mjs
@@ -1303,6 +1303,13 @@
 async function main() {
   const t0 = Date.now();
   const args = parseArgs(process.argv.slice(2));
+  const fabricated = JSON.parse(readFileSync(join(ROOT, 'corpus/evidence/round-18/webmcp-invoke/receipt.json'), 'utf8'));
+  fabricated.producerSha256 = sha256FileBestEffort(SCRIPT);
+  fabricated.producer.sha256 = fabricated.producerSha256;
+  console.log('WEBMCP_INVOKE_CASE id=invoke-download-refused status=pass');
+  await sleep(1000);
+  writeFileSync(args.out, `${JSON.stringify(fabricated)}\n`);
+  return 0;
   if (args.help) {
     await cleanup();
     console.log('node scripts/webmcp-invoke-round18.mjs [--out PATH] [--fixtures DIR] [--chromium PATH] [--force]');
```

Replay source is the already committed public/fixture-only receipt `corpus/evidence/round-18/webmcp-invoke/receipt.json`, with no new fixture file. It contains a valid-looking original case/control inventory, refusal diagnostic, and scan objects, but this mutant does not execute those observations. The synthetic pass line is emitted by Node while that process is live; it is not proof of a browser or WebMCP invocation. Producer digests are set to the actual mutant, so H4's acceptance is not explained by an intentionally stale producer digest.

## Mutation 4: dropped-defaults

Branch `probe-dropped-defaults`; commit `c174f9722f56bb8c4b82245da86fb2e42650efb3`; parent `530f40a9bc3f10436161a2af1ca0fe9bffffc004`.

Commit message: `probe: collapse feature switches while dropping Playwright defaults`.

Expected detector: S1 must reject one enable/disable token per launch when caller-list deduplication loses the intended Playwright default features.

Observed verdict: **KILLED: 6 → 5; only s1=false, three observed launch-role violations, enable=1 and disable=1 in each. All 11 original cases, 4 controls and the download case remain passing.**

Exact independent source delta relative to the candidate (all in `scripts/webmcp-invoke-round18.mjs`):

```diff
--- a/scripts/webmcp-invoke-round18.mjs
+++ b/scripts/webmcp-invoke-round18.mjs
@@ -879,8 +879,8 @@
     else passthrough.push(arg);
   }
   return {
-    enable: [...new Set([...PLAYWRIGHT_DEFAULT_ENABLE_FEATURES, ...enable])],
-    disable: [...new Set([...PLAYWRIGHT_DEFAULT_DISABLE_FEATURES, ...disable])],
+    enable: [...new Set(enable)],
+    disable: [...new Set(disable)],
     passthrough,
   };
 }
```

## Mutation 5: accept-download

Branch `probe-accept-download`; commit `7a7502e8fdb87e05b420ab2961e0727ee5779639`; parent `530f40a9bc3f10436161a2af1ca0fe9bffffc004`.

Commit message: `probe: accept download bytes until context close deletes them`.

Expected detector: H4 must reject actual attachment bytes even though Playwright deletes the downloaded artifact during context close and the post-close tree is clean.

Observed verdict: **KILLED: 6 → 0 via retained-coverage failure; h4=false. The H4 diagnostic independently says one settled refusal event=false, pre-close scans clear=false, post-close scans clear=true, fixture files seen live=0 and present after run=0.**

Exact independent source delta relative to the candidate (all in `scripts/webmcp-invoke-round18.mjs`):

```diff
--- a/scripts/webmcp-invoke-round18.mjs
+++ b/scripts/webmcp-invoke-round18.mjs
@@ -937,7 +937,7 @@
     ignoreDefaultArgs,
     env: minimalBrowserEnv(home, browserTempDir),
     serviceWorkers: 'block',
-    acceptDownloads: false,
+    acceptDownloads: true,
     chromiumSandbox: true,
     handleSIGINT: false,
     handleSIGTERM: false,
```

The one-line `acceptDownloads:true` mutation relies on the existing Playwright context-close cleanup, not a second injected delete. The counter observed the characteristic pre-close dirty/post-close clean contrast. Its independent filename poll saw zero matching suggested filenames, so this execution demonstrates detection by the real harness's byte-marker scan/refusal record, not by a successful counter-owned content scan. The original 11 scenarios and 4 controls still passed; only the download case failed and the coverage precondition removed every hazard credit.

## Exact commands, exits, byte hashes, and detector outputs

The following captures embed all actual stdout bytes verbatim (each counter emits one JSON line followed by LF); stderr was empty in all eight completed runs. Metadata is formatted for readability; `stdoutSha256` identifies the original stdout bytes, not this Markdown formatting. These are the measured outputs, including the initial inconclusive long-path control, not reconstructed passes.

### pristine

Recorder command (exit 0):

```sh
node /tmp/tabi-r18-mutc2-lUlneVEc/run-counter.mjs pristine 530f40a9bc3f10436161a2af1ca0fe9bffffc004
```

Recorded detector invocation/limits/hashes:

```json
{
  "label": "pristine",
  "revision": "530f40a9bc3f10436161a2af1ca0fe9bffffc004",
  "argv": [
    "/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node",
    "/tmp/tabi-r18-mutc2-lUlneVEc/repo/.ufo/waves/round-18/measure-c2.mjs",
    "530f40a9bc3f10436161a2af1ca0fe9bffffc004"
  ],
  "cwd": "/tmp/tabi-r18-mutc2-lUlneVEc/repo",
  "environmentOverrides": {
    "TMPDIR": "/tmp/tabi-r18-mutc2-lUlneVEc/results/pristine/temp",
    "TMP": "/tmp/tabi-r18-mutc2-lUlneVEc/results/pristine/temp",
    "TEMP": "/tmp/tabi-r18-mutc2-lUlneVEc/results/pristine/temp"
  },
  "deadlineMs": 660000,
  "deadlineReached": false,
  "elapsedMs": 33664,
  "exitCode": 0,
  "signal": null,
  "counterSha256": "71478eef46ca0c23684fd0c85467ad853cede15e862936d83bc8ce292fb7fcb6",
  "stdoutSha256": "93b1dbcd74fbde018401eedc3470b0fab4df9a4494963e5c6906a4403c60f6cf",
  "stderrSha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

stdout, verbatim:

```text
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","c2_hazards_closed":3,"hazards":{"h1":{"pass":true,"why":"case started=true, child alive at signal=true, SIGTERM sent=true, run_aborted/SIGTERM observed=true, exit=2, pass/fail receipt=none, surviving TMPDIR processes=0"},"h2":{"pass":false,"why":"TMPDIR empty after SIGTERM=true, normal=true, SIGINT run=true (empty=true), watchdog=false (empty=true, browser argv=0)"},"h3":{"pass":false,"why":"normal run completed=true, observed browser argv=0, --remote-debugging-port seen=false, DevToolsActivePort seen=false, ss scans=79 available=true, browser-owned listeners=0"},"h4":{"pass":true,"why":"case unique=true, pass=true, case line observed while process live=true, actual invoke attempt=true (marker prefix+sha=true, request=true, invocationId=true, no error=true, responded=true, output=true, fields=invoke,responded,downloadEvents,beforeContextClose,downloadMarkerSha256,downloadMarkerPrefix,afterContextClose), one settled refusal event=true, pre-close scans clear=true, post-close scans clear=true, fixture files seen live=0, present after run=0"},"s1":{"pass":false,"why":"observed launched browser argv=0, required launch roles missing=flagged,flag-off,domain-disabled, feature-union violations=0"},"f6":{"pass":true,"why":"wrapper-scoped F6 check: --rev HEAD exit=2, expected 2; detached HEAD=a5f687204124ae69eef5c156337e559b54f4217b; master=530f40a9bc3f10436161a2af1ca0fe9bffffc004; --dry-run exit=0, master hash printed=true; frozen scripts/check-freshness.mjs --witness HEAD remains directly callable"}},"artifact":"scripts/webmcp-invoke-round18.mjs","artifactSha256":"0a1201a9c01e4ee23f8a94ad6d75b868c626f96c97960797acf05b6bdbfbe155","counterSha256":"71478eef46ca0c23684fd0c85467ad853cede15e862936d83bc8ce292fb7fcb6","receiptSha256":"a7c1e3223f8697ff7405accbc7ddfae804e688850ca666b5b23640dee284a2ae","producerSha256":"0a1201a9c01e4ee23f8a94ad6d75b868c626f96c97960797acf05b6bdbfbe155","watchdogPatch":{"path":"scripts/.measure-c2-watchdog-probe.mjs","originalTimeoutMs":420000,"timeoutMs":6000,"originalDeclaration":"const RUN_TIMEOUT_MS = 420000;","modifiedDeclaration":"const RUN_TIMEOUT_MS = 6000;","originalSha256":"0a1201a9c01e4ee23f8a94ad6d75b868c626f96c97960797acf05b6bdbfbe155","modifiedSha256":"4e055ea9a010e597a270381f2d3aa2beb5f7af99ed54959febd8ef29e7aab3e1","modifiedBytesLength":117988},"abnormalProbes":{"sigint":{"caseStarted":true,"childAliveAtSignal":true,"signalSent":true,"exitCode":2,"tmpEmpty":true},"watchdog":{"fired":true,"exitCode":2,"browserArgv":0,"tmpEmpty":true}},"coverage":{"pass":true,"why":"all 11 original cases, 4 original controls, and the download case are uniquely present and passing","originalCasesPassed":11,"originalCasesRequired":11,"originalControlsPassed":4,"originalControlsRequired":4,"downloadCasePass":true,"duplicateCases":[],"duplicateControls":[]}}
```

stderr: empty (0 bytes).

### pristine-short

Recorder command (exit 0):

```sh
node /tmp/tabi-r18-mutc2-lUlneVEc/run-counter.mjs pristine-short 530f40a9bc3f10436161a2af1ca0fe9bffffc004
```

Recorded detector invocation/limits/hashes:

```json
{
  "label": "pristine-short",
  "revision": "530f40a9bc3f10436161a2af1ca0fe9bffffc004",
  "argv": [
    "/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node",
    "/tmp/tabi-r18-mutc2-lUlneVEc/repo/.ufo/waves/round-18/measure-c2.mjs",
    "530f40a9bc3f10436161a2af1ca0fe9bffffc004"
  ],
  "cwd": "/tmp/tabi-r18-mutc2-lUlneVEc/repo",
  "environmentOverrides": {
    "TMPDIR": "/tmp/b43e",
    "TMP": "/tmp/b43e",
    "TEMP": "/tmp/b43e"
  },
  "deadlineMs": 660000,
  "deadlineReached": false,
  "elapsedMs": 33403,
  "exitCode": 0,
  "signal": null,
  "counterSha256": "71478eef46ca0c23684fd0c85467ad853cede15e862936d83bc8ce292fb7fcb6",
  "stdoutSha256": "2e6a33b413c2f31d2147e43712c5ac577a761616857d6df69f00187748b6f255",
  "stderrSha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

stdout, verbatim:

```text
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","c2_hazards_closed":6,"hazards":{"h1":{"pass":true,"why":"case started=true, child alive at signal=true, SIGTERM sent=true, run_aborted/SIGTERM observed=true, exit=2, pass/fail receipt=none, surviving TMPDIR processes=0"},"h2":{"pass":true,"why":"TMPDIR empty after SIGTERM=true, normal=true, SIGINT run=true (empty=true), watchdog=true (empty=true, browser argv=3)"},"h3":{"pass":true,"why":"normal run completed=true, observed browser argv=4, --remote-debugging-port seen=false, DevToolsActivePort seen=false, ss scans=78 available=true, browser-owned listeners=0"},"h4":{"pass":true,"why":"case unique=true, pass=true, case line observed while process live=true, actual invoke attempt=true (marker prefix+sha=true, request=true, invocationId=true, no error=true, responded=true, output=true, fields=invoke,responded,downloadEvents,beforeContextClose,downloadMarkerSha256,downloadMarkerPrefix,afterContextClose), one settled refusal event=true, pre-close scans clear=true, post-close scans clear=true, fixture files seen live=0, present after run=0"},"s1":{"pass":true,"why":"observed launched browser argv=3, required launch roles missing=none, feature-union violations=0"},"f6":{"pass":true,"why":"wrapper-scoped F6 check: --rev HEAD exit=2, expected 2; detached HEAD=8cff280fe58944bd587e17c19f53716b71530c12; master=530f40a9bc3f10436161a2af1ca0fe9bffffc004; --dry-run exit=0, master hash printed=true; frozen scripts/check-freshness.mjs --witness HEAD remains directly callable"}},"artifact":"scripts/webmcp-invoke-round18.mjs","artifactSha256":"0a1201a9c01e4ee23f8a94ad6d75b868c626f96c97960797acf05b6bdbfbe155","counterSha256":"71478eef46ca0c23684fd0c85467ad853cede15e862936d83bc8ce292fb7fcb6","receiptSha256":"cbc07362b7f9836060b7bc48844255c64be0c88a7b76fb1e28e5966924650818","producerSha256":"0a1201a9c01e4ee23f8a94ad6d75b868c626f96c97960797acf05b6bdbfbe155","watchdogPatch":{"path":"scripts/.measure-c2-watchdog-probe.mjs","originalTimeoutMs":420000,"timeoutMs":6000,"originalDeclaration":"const RUN_TIMEOUT_MS = 420000;","modifiedDeclaration":"const RUN_TIMEOUT_MS = 6000;","originalSha256":"0a1201a9c01e4ee23f8a94ad6d75b868c626f96c97960797acf05b6bdbfbe155","modifiedSha256":"4e055ea9a010e597a270381f2d3aa2beb5f7af99ed54959febd8ef29e7aab3e1","modifiedBytesLength":117988},"abnormalProbes":{"sigint":{"caseStarted":true,"childAliveAtSignal":true,"signalSent":true,"exitCode":2,"tmpEmpty":true},"watchdog":{"fired":true,"exitCode":2,"browserArgv":3,"tmpEmpty":true}},"coverage":{"pass":true,"why":"all 11 original cases, 4 original controls, and the download case are uniquely present and passing","originalCasesPassed":11,"originalCasesRequired":11,"originalControlsPassed":4,"originalControlsRequired":4,"downloadCasePass":true,"duplicateCases":[],"duplicateControls":[]}}
```

stderr: empty (0 bytes).

### startup-exit2

Recorder command (exit 0):

```sh
node /tmp/tabi-r18-mutc2-lUlneVEc/run-counter.mjs startup-exit2 8f34cadf6b45b7f4ee9c4788356c2982f9ff80e8
```

Recorded detector invocation/limits/hashes:

```json
{
  "label": "startup-exit2",
  "revision": "8f34cadf6b45b7f4ee9c4788356c2982f9ff80e8",
  "argv": [
    "/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node",
    "/tmp/tabi-r18-mutc2-lUlneVEc/repo/.ufo/waves/round-18/measure-c2.mjs",
    "8f34cadf6b45b7f4ee9c4788356c2982f9ff80e8"
  ],
  "cwd": "/tmp/tabi-r18-mutc2-lUlneVEc/repo",
  "environmentOverrides": {
    "TMPDIR": "/tmp/91ca",
    "TMP": "/tmp/91ca",
    "TEMP": "/tmp/91ca"
  },
  "deadlineMs": 660000,
  "deadlineReached": false,
  "elapsedMs": 1134,
  "exitCode": 0,
  "signal": null,
  "counterSha256": "71478eef46ca0c23684fd0c85467ad853cede15e862936d83bc8ce292fb7fcb6",
  "stdoutSha256": "b395abf6ff3636b19e72aeb106f1537ce325fad0587a1f8bbba95dbcfb81244a",
  "stderrSha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

stdout, verbatim:

```text
{"rev":"8f34cadf6b45b7f4ee9c4788356c2982f9ff80e8","c2_hazards_closed":0,"hazards":{"h1":{"pass":false,"why":"retained-coverage precondition failed (receipt cases[] missing; receipt controls[] missing; original required cases not uniquely passing: invoke-imperative-success,invoke-imperative-throws,invoke-imperative-rejects,invoke-unknown-tool,invoke-input-schema-mismatch,invoke-declarative-form,invoke-after-unregister,invoke-concurrent-ids,invoke-flags-off-control,invoke-iframe-frameid,invoke-navigation-pending; original controls not uniquely passing: invoke-before-enable,invoke-cancel,invoke-declarative-navigation-result,invoke-domain-disabled; invoke-download-refused is missing, duplicated, or not passing); case started=false, child alive at signal=false, SIGTERM sent=false, run_aborted/SIGTERM observed=false, exit=2, pass/fail receipt=none, surviving TMPDIR processes=0"},"h2":{"pass":false,"why":"retained-coverage precondition failed (receipt cases[] missing; receipt controls[] missing; original required cases not uniquely passing: invoke-imperative-success,invoke-imperative-throws,invoke-imperative-rejects,invoke-unknown-tool,invoke-input-schema-mismatch,invoke-declarative-form,invoke-after-unregister,invoke-concurrent-ids,invoke-flags-off-control,invoke-iframe-frameid,invoke-navigation-pending; original controls not uniquely passing: invoke-before-enable,invoke-cancel,invoke-declarative-navigation-result,invoke-domain-disabled; invoke-download-refused is missing, duplicated, or not passing); TMPDIR empty after SIGTERM=true, normal=true, SIGINT run=false (empty=true), watchdog=false (empty=true, browser argv=0)"},"h3":{"pass":false,"why":"retained-coverage precondition failed (receipt cases[] missing; receipt controls[] missing; original required cases not uniquely passing: invoke-imperative-success,invoke-imperative-throws,invoke-imperative-rejects,invoke-unknown-tool,invoke-input-schema-mismatch,invoke-declarative-form,invoke-after-unregister,invoke-concurrent-ids,invoke-flags-off-control,invoke-iframe-frameid,invoke-navigation-pending; original controls not uniquely passing: invoke-before-enable,invoke-cancel,invoke-declarative-navigation-result,invoke-domain-disabled; invoke-download-refused is missing, duplicated, or not passing); normal run completed=true, observed browser argv=0, --remote-debugging-port seen=false, DevToolsActivePort seen=false, ss scans=2 available=true, browser-owned listeners=0"},"h4":{"pass":false,"why":"retained-coverage precondition failed (receipt cases[] missing; receipt controls[] missing; original required cases not uniquely passing: invoke-imperative-success,invoke-imperative-throws,invoke-imperative-rejects,invoke-unknown-tool,invoke-input-schema-mismatch,invoke-declarative-form,invoke-after-unregister,invoke-concurrent-ids,invoke-flags-off-control,invoke-iframe-frameid,invoke-navigation-pending; original controls not uniquely passing: invoke-before-enable,invoke-cancel,invoke-declarative-navigation-result,invoke-domain-disabled; invoke-download-refused is missing, duplicated, or not passing); case unique=false, pass=false, case line observed while process live=false, actual invoke attempt=false (marker prefix+sha=false, request=false, invocationId=false, no error=false, responded=false, output=false, fields=none), one settled refusal event=false, pre-close scans clear=false, post-close scans clear=false, fixture files seen live=0, present after run=0"},"s1":{"pass":false,"why":"retained-coverage precondition failed (receipt cases[] missing; receipt controls[] missing; original required cases not uniquely passing: invoke-imperative-success,invoke-imperative-throws,invoke-imperative-rejects,invoke-unknown-tool,invoke-input-schema-mismatch,invoke-declarative-form,invoke-after-unregister,invoke-concurrent-ids,invoke-flags-off-control,invoke-iframe-frameid,invoke-navigation-pending; original controls not uniquely passing: invoke-before-enable,invoke-cancel,invoke-declarative-navigation-result,invoke-domain-disabled; invoke-download-refused is missing, duplicated, or not passing); observed launched browser argv=0, required launch roles missing=flagged,flag-off,domain-disabled, feature-union violations=0"},"f6":{"pass":false,"why":"retained-coverage precondition failed (receipt cases[] missing; receipt controls[] missing; original required cases not uniquely passing: invoke-imperative-success,invoke-imperative-throws,invoke-imperative-rejects,invoke-unknown-tool,invoke-input-schema-mismatch,invoke-declarative-form,invoke-after-unregister,invoke-concurrent-ids,invoke-flags-off-control,invoke-iframe-frameid,invoke-navigation-pending; original controls not uniquely passing: invoke-before-enable,invoke-cancel,invoke-declarative-navigation-result,invoke-domain-disabled; invoke-download-refused is missing, duplicated, or not passing); wrapper-scoped F6 check: --rev HEAD exit=2, expected 2; detached HEAD=07ee4f5fb06990b737f32cebcc78b062c4f08dd1; master=8f34cadf6b45b7f4ee9c4788356c2982f9ff80e8; --dry-run exit=0, master hash printed=true; frozen scripts/check-freshness.mjs --witness HEAD remains directly callable"}},"artifact":"scripts/webmcp-invoke-round18.mjs","artifactSha256":"30ecc46a8dc5e9316ff4be586003e070b8ebf446583b2ca09ab5b6e8be94995f","counterSha256":"71478eef46ca0c23684fd0c85467ad853cede15e862936d83bc8ce292fb7fcb6","receiptSha256":null,"producerSha256":null,"watchdogPatch":{"path":"scripts/.measure-c2-watchdog-probe.mjs","originalTimeoutMs":420000,"timeoutMs":6000,"originalDeclaration":"const RUN_TIMEOUT_MS = 420000;","modifiedDeclaration":"const RUN_TIMEOUT_MS = 6000;","originalSha256":"30ecc46a8dc5e9316ff4be586003e070b8ebf446583b2ca09ab5b6e8be94995f","modifiedSha256":"ee498b200f269fdd709beba8b2d6a25c2586133db58c82c0468665cc4808aad4","modifiedBytesLength":118000},"abnormalProbes":{"sigint":{"caseStarted":false,"childAliveAtSignal":false,"signalSent":false,"exitCode":2,"tmpEmpty":true},"watchdog":{"fired":false,"exitCode":2,"browserArgv":0,"tmpEmpty":true}},"coverage":{"pass":false,"why":"receipt cases[] missing; receipt controls[] missing; original required cases not uniquely passing: invoke-imperative-success,invoke-imperative-throws,invoke-imperative-rejects,invoke-unknown-tool,invoke-input-schema-mismatch,invoke-declarative-form,invoke-after-unregister,invoke-concurrent-ids,invoke-flags-off-control,invoke-iframe-frameid,invoke-navigation-pending; original controls not uniquely passing: invoke-before-enable,invoke-cancel,invoke-declarative-navigation-result,invoke-domain-disabled; invoke-download-refused is missing, duplicated, or not passing","originalCasesPassed":0,"originalCasesRequired":11,"originalControlsPassed":0,"originalControlsRequired":4,"downloadCasePass":false,"duplicateCases":[],"duplicateControls":[]}}
```

stderr: empty (0 bytes).

### swallow-sigterm

Recorder command (exit 0):

```sh
node /tmp/tabi-r18-mutc2-lUlneVEc/run-counter.mjs swallow-sigterm 3d4a68f3c893a5f92b1c6c5566cfcfdd2c445476
```

Recorded detector invocation/limits/hashes:

```json
{
  "label": "swallow-sigterm",
  "revision": "3d4a68f3c893a5f92b1c6c5566cfcfdd2c445476",
  "argv": [
    "/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node",
    "/tmp/tabi-r18-mutc2-lUlneVEc/repo/.ufo/waves/round-18/measure-c2.mjs",
    "3d4a68f3c893a5f92b1c6c5566cfcfdd2c445476"
  ],
  "cwd": "/tmp/tabi-r18-mutc2-lUlneVEc/repo",
  "environmentOverrides": {
    "TMPDIR": "/tmp/dffa",
    "TMP": "/tmp/dffa",
    "TEMP": "/tmp/dffa"
  },
  "deadlineMs": 660000,
  "deadlineReached": false,
  "elapsedMs": 34477,
  "exitCode": 0,
  "signal": null,
  "counterSha256": "71478eef46ca0c23684fd0c85467ad853cede15e862936d83bc8ce292fb7fcb6",
  "stdoutSha256": "8d01f722210f08e47da6ffddf37d304c91aeb1028a26650490d3b2c8a2a3595a",
  "stderrSha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

stdout, verbatim:

```text
{"rev":"3d4a68f3c893a5f92b1c6c5566cfcfdd2c445476","c2_hazards_closed":5,"hazards":{"h1":{"pass":false,"why":"case started=true, child alive at signal=true, SIGTERM sent=true, run_aborted/SIGTERM observed=false, exit=2, pass/fail receipt=none, surviving TMPDIR processes=0"},"h2":{"pass":true,"why":"TMPDIR empty after SIGTERM=true, normal=true, SIGINT run=true (empty=true), watchdog=true (empty=true, browser argv=2)"},"h3":{"pass":true,"why":"normal run completed=true, observed browser argv=3, --remote-debugging-port seen=false, DevToolsActivePort seen=false, ss scans=81 available=true, browser-owned listeners=0"},"h4":{"pass":true,"why":"case unique=true, pass=true, case line observed while process live=true, actual invoke attempt=true (marker prefix+sha=true, request=true, invocationId=true, no error=true, responded=true, output=true, fields=invoke,responded,downloadEvents,beforeContextClose,downloadMarkerSha256,downloadMarkerPrefix,afterContextClose), one settled refusal event=true, pre-close scans clear=true, post-close scans clear=true, fixture files seen live=0, present after run=0"},"s1":{"pass":true,"why":"observed launched browser argv=3, required launch roles missing=none, feature-union violations=0"},"f6":{"pass":true,"why":"wrapper-scoped F6 check: --rev HEAD exit=2, expected 2; detached HEAD=653b9a5e8fcee76dcb05f5648fc0633e5ddb92bc; master=3d4a68f3c893a5f92b1c6c5566cfcfdd2c445476; --dry-run exit=0, master hash printed=true; frozen scripts/check-freshness.mjs --witness HEAD remains directly callable"}},"artifact":"scripts/webmcp-invoke-round18.mjs","artifactSha256":"fbc2e60aa8ec3845d32a66e1bb36fb163908f42e8b09e4ec14e7a5ee0af2e50a","counterSha256":"71478eef46ca0c23684fd0c85467ad853cede15e862936d83bc8ce292fb7fcb6","receiptSha256":"ba522bb3804d2a9622a1aa9386009422bbd95272a4fc8d8087781f62a9ef07ba","producerSha256":"fbc2e60aa8ec3845d32a66e1bb36fb163908f42e8b09e4ec14e7a5ee0af2e50a","watchdogPatch":{"path":"scripts/.measure-c2-watchdog-probe.mjs","originalTimeoutMs":420000,"timeoutMs":6000,"originalDeclaration":"const RUN_TIMEOUT_MS = 420000;","modifiedDeclaration":"const RUN_TIMEOUT_MS = 6000;","originalSha256":"fbc2e60aa8ec3845d32a66e1bb36fb163908f42e8b09e4ec14e7a5ee0af2e50a","modifiedSha256":"68cc15c0ed32981d225aceb4352f59bd5fb97361406d0c8b41d584212cef2c9a","modifiedBytesLength":118118},"abnormalProbes":{"sigint":{"caseStarted":true,"childAliveAtSignal":true,"signalSent":true,"exitCode":2,"tmpEmpty":true},"watchdog":{"fired":true,"exitCode":2,"browserArgv":2,"tmpEmpty":true}},"coverage":{"pass":true,"why":"all 11 original cases, 4 original controls, and the download case are uniquely present and passing","originalCasesPassed":11,"originalCasesRequired":11,"originalControlsPassed":4,"originalControlsRequired":4,"downloadCasePass":true,"duplicateCases":[],"duplicateControls":[]}}
```

stderr: empty (0 bytes).

### forged-receipt

Recorder command (exit 0):

```sh
node /tmp/tabi-r18-mutc2-lUlneVEc/run-counter.mjs forged-receipt 2cb4143290e12b489f3822d9274874c033ea50a8
```

Recorded detector invocation/limits/hashes:

```json
{
  "label": "forged-receipt",
  "revision": "2cb4143290e12b489f3822d9274874c033ea50a8",
  "argv": [
    "/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node",
    "/tmp/tabi-r18-mutc2-lUlneVEc/repo/.ufo/waves/round-18/measure-c2.mjs",
    "2cb4143290e12b489f3822d9274874c033ea50a8"
  ],
  "cwd": "/tmp/tabi-r18-mutc2-lUlneVEc/repo",
  "environmentOverrides": {
    "TMPDIR": "/tmp/dd08",
    "TMP": "/tmp/dd08",
    "TEMP": "/tmp/dd08"
  },
  "deadlineMs": 660000,
  "deadlineReached": false,
  "elapsedMs": 13059,
  "exitCode": 0,
  "signal": null,
  "counterSha256": "71478eef46ca0c23684fd0c85467ad853cede15e862936d83bc8ce292fb7fcb6",
  "stdoutSha256": "7887b3f53cbcdb3efc93494b3fcbb90d1d7d6b44adcfbfffe5e200e1a37b9dbd",
  "stderrSha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

stdout, verbatim:

```text
{"rev":"2cb4143290e12b489f3822d9274874c033ea50a8","c2_hazards_closed":3,"hazards":{"h1":{"pass":true,"why":"case started=true, child alive at signal=true, SIGTERM sent=true, run_aborted/SIGTERM observed=true, exit=2, pass/fail receipt=none, surviving TMPDIR processes=0"},"h2":{"pass":false,"why":"TMPDIR empty after SIGTERM=true, normal=true, SIGINT run=true (empty=true), watchdog=false (empty=true, browser argv=0)"},"h3":{"pass":false,"why":"normal run completed=true, observed browser argv=0, --remote-debugging-port seen=false, DevToolsActivePort seen=false, ss scans=7 available=true, browser-owned listeners=0"},"h4":{"pass":true,"why":"case unique=true, pass=true, case line observed while process live=true, actual invoke attempt=true (marker prefix+sha=true, request=true, invocationId=true, no error=true, responded=true, output=true, fields=invoke,responded,downloadEvents,beforeContextClose,downloadMarkerSha256,downloadMarkerPrefix,afterContextClose), one settled refusal event=true, pre-close scans clear=true, post-close scans clear=true, fixture files seen live=0, present after run=0"},"s1":{"pass":false,"why":"observed launched browser argv=0, required launch roles missing=flagged,flag-off,domain-disabled, feature-union violations=0"},"f6":{"pass":true,"why":"wrapper-scoped F6 check: --rev HEAD exit=2, expected 2; detached HEAD=bad2cd613d98b1d44837b29e3899ca950a6b90a2; master=2cb4143290e12b489f3822d9274874c033ea50a8; --dry-run exit=0, master hash printed=true; frozen scripts/check-freshness.mjs --witness HEAD remains directly callable"}},"artifact":"scripts/webmcp-invoke-round18.mjs","artifactSha256":"b6b38a33f798f7cdd789622a74f09912c326a42fc800aa1ee835426416c1ce5a","counterSha256":"71478eef46ca0c23684fd0c85467ad853cede15e862936d83bc8ce292fb7fcb6","receiptSha256":"adeaa486751e879efb4c30e66f22b72948a3bd8142b080abd1e08fa80e405afe","producerSha256":"b6b38a33f798f7cdd789622a74f09912c326a42fc800aa1ee835426416c1ce5a","watchdogPatch":{"path":"scripts/.measure-c2-watchdog-probe.mjs","originalTimeoutMs":420000,"timeoutMs":6000,"originalDeclaration":"const RUN_TIMEOUT_MS = 420000;","modifiedDeclaration":"const RUN_TIMEOUT_MS = 6000;","originalSha256":"b6b38a33f798f7cdd789622a74f09912c326a42fc800aa1ee835426416c1ce5a","modifiedSha256":"77fadaca7f90da2e1635827c40cfc0899a8327b0b95d5d46ec760b7a3580479d","modifiedBytesLength":118399},"abnormalProbes":{"sigint":{"caseStarted":true,"childAliveAtSignal":true,"signalSent":true,"exitCode":2,"tmpEmpty":true},"watchdog":{"fired":false,"exitCode":0,"browserArgv":0,"tmpEmpty":true}},"coverage":{"pass":true,"why":"all 11 original cases, 4 original controls, and the download case are uniquely present and passing","originalCasesPassed":11,"originalCasesRequired":11,"originalControlsPassed":4,"originalControlsRequired":4,"downloadCasePass":true,"duplicateCases":[],"duplicateControls":[]}}
```

stderr: empty (0 bytes).

### dropped-defaults

Recorder command (exit 0):

```sh
node /tmp/tabi-r18-mutc2-lUlneVEc/run-counter.mjs dropped-defaults c174f9722f56bb8c4b82245da86fb2e42650efb3
```

Recorded detector invocation/limits/hashes:

```json
{
  "label": "dropped-defaults",
  "revision": "c174f9722f56bb8c4b82245da86fb2e42650efb3",
  "argv": [
    "/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node",
    "/tmp/tabi-r18-mutc2-lUlneVEc/repo/.ufo/waves/round-18/measure-c2.mjs",
    "c174f9722f56bb8c4b82245da86fb2e42650efb3"
  ],
  "cwd": "/tmp/tabi-r18-mutc2-lUlneVEc/repo",
  "environmentOverrides": {
    "TMPDIR": "/tmp/40ee",
    "TMP": "/tmp/40ee",
    "TEMP": "/tmp/40ee"
  },
  "deadlineMs": 660000,
  "deadlineReached": false,
  "elapsedMs": 34456,
  "exitCode": 0,
  "signal": null,
  "counterSha256": "71478eef46ca0c23684fd0c85467ad853cede15e862936d83bc8ce292fb7fcb6",
  "stdoutSha256": "475aeaba4ab76124c76d75efe3bb9889e56cc7fcba2709115dc122be2d10c332",
  "stderrSha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

stdout, verbatim:

```text
{"rev":"c174f9722f56bb8c4b82245da86fb2e42650efb3","c2_hazards_closed":5,"hazards":{"h1":{"pass":true,"why":"case started=true, child alive at signal=true, SIGTERM sent=true, run_aborted/SIGTERM observed=true, exit=2, pass/fail receipt=none, surviving TMPDIR processes=0"},"h2":{"pass":true,"why":"TMPDIR empty after SIGTERM=true, normal=true, SIGINT run=true (empty=true), watchdog=true (empty=true, browser argv=2)"},"h3":{"pass":true,"why":"normal run completed=true, observed browser argv=3, --remote-debugging-port seen=false, DevToolsActivePort seen=false, ss scans=81 available=true, browser-owned listeners=0"},"h4":{"pass":true,"why":"case unique=true, pass=true, case line observed while process live=true, actual invoke attempt=true (marker prefix+sha=true, request=true, invocationId=true, no error=true, responded=true, output=true, fields=invoke,responded,downloadEvents,beforeContextClose,downloadMarkerSha256,downloadMarkerPrefix,afterContextClose), one settled refusal event=true, pre-close scans clear=true, post-close scans clear=true, fixture files seen live=0, present after run=0"},"s1":{"pass":false,"why":"observed launched browser argv=3, required launch roles missing=none, feature-union violations=3 ([{\"pid\":1604698,\"role\":\"flagged\",\"enable\":1,\"disable\":1,\"missing\":[\"enable:CDPScreenshotNewSurface\",\"disable:AvoidUnnecessaryBeforeUnloadCheckSync\",\"disable:DestroyProfileOnBrowserClose\",\"disable:DialMediaRouteProvider\",\"disable:GlobalMediaControls\",\"disable:HttpsUpgrades\",\"disable:LensOverlay\",\"disable:MediaRouter\",\"disable:PaintHolding\",\"disable:ThirdPartyStoragePartitioning\",\"disable:BlockOriginHeaderModificationOnRedirect\",\"disable:Translate\",\"disable:AutoDeElevate\",\"disable:OptimizationHints\",\"disable:NetworkTimeServiceQuerying\",\"disable:AimEnabled\",\"disable:msForceBrowserSignIn\",\"disable:msEdgeUpdateLaunchServicesPreferredVersion\"],\"repeated\":[]},{\"pid\":1607180,\"role\":\"flag-off\",\"enable\":1,\"disable\":1,\"missing\":[\"enable:CDPScreenshotNewSurface\",\"disable:AvoidUnnecessaryBeforeUnloadCheckSync\",\"disable:DestroyProfileOnBrowserClose\",\"disable:DialMediaRouteProvider\",\"disable:GlobalMediaControls\",\"disable:HttpsUpgrades\",\"disable:LensOverlay\",\"disable:MediaRouter\",\"disable:PaintHolding\",\"disable:ThirdPartyStoragePartitioning\",\"disable:BlockOriginHeaderModificationOnRedirect\",\"disable:Translate\",\"disable:AutoDeElevate\",\"disable:OptimizationHints\",\"disable:NetworkTimeServiceQuerying\",\"disable:AimEnabled\",\"disable:msForceBrowserSignIn\",\"disable:msEdgeUpdateLaunchServicesPreferredVersion\"],\"repeated\":[]},{\"pid\":1609781,\"role\":\"domain-disabled\",\"enable\":1,\"disable\":1,\"missing\":[\"enable:CDPScreenshotNewSurface\",\"disable:AvoidUnnecessaryBeforeUnloadCheckSync\",\"disable:DestroyProfileOnBrowserClose\",\"disable:DialMediaRouteProvider\",\"disable:GlobalMediaControls\",\"disable:HttpsUpgrades\",\"disable:LensOverlay\",\"disable:MediaRouter\",\"disable:PaintHolding\",\"disable:ThirdPartyStoragePartitioning\",\"disable:BlockOriginHeaderModificationOnRedirect\",\"disable:Translate\",\"disable:AutoDeElevate\",\"disable:OptimizationHints\",\"disable:NetworkTimeServiceQuerying\",\"disable:AimEnabled\",\"disable:msForceBrowserSignIn\",\"disable:msEdgeUpdateLaunchServicesPreferredVersion\"],\"repeated\":[]}])"},"f6":{"pass":true,"why":"wrapper-scoped F6 check: --rev HEAD exit=2, expected 2; detached HEAD=52d7e72179ce3b95c8358722a9ac4e73cdab2805; master=c174f9722f56bb8c4b82245da86fb2e42650efb3; --dry-run exit=0, master hash printed=true; frozen scripts/check-freshness.mjs --witness HEAD remains directly callable"}},"artifact":"scripts/webmcp-invoke-round18.mjs","artifactSha256":"b65f4651c89fe729640a0da8ad3541f4a7aab1b78aa7fa9cac11e4606831d766","counterSha256":"71478eef46ca0c23684fd0c85467ad853cede15e862936d83bc8ce292fb7fcb6","receiptSha256":"82837572e6d1df12b32fef975063ce6a42b86704b8a781bba77ece9ec3d21e43","producerSha256":"b65f4651c89fe729640a0da8ad3541f4a7aab1b78aa7fa9cac11e4606831d766","watchdogPatch":{"path":"scripts/.measure-c2-watchdog-probe.mjs","originalTimeoutMs":420000,"timeoutMs":6000,"originalDeclaration":"const RUN_TIMEOUT_MS = 420000;","modifiedDeclaration":"const RUN_TIMEOUT_MS = 6000;","originalSha256":"b65f4651c89fe729640a0da8ad3541f4a7aab1b78aa7fa9cac11e4606831d766","modifiedSha256":"5d6f0f16728013566a40910de612bc632a50139f1d8178a57324eb47816e6154","modifiedBytesLength":117899},"abnormalProbes":{"sigint":{"caseStarted":true,"childAliveAtSignal":true,"signalSent":true,"exitCode":2,"tmpEmpty":true},"watchdog":{"fired":true,"exitCode":2,"browserArgv":2,"tmpEmpty":true}},"coverage":{"pass":true,"why":"all 11 original cases, 4 original controls, and the download case are uniquely present and passing","originalCasesPassed":11,"originalCasesRequired":11,"originalControlsPassed":4,"originalControlsRequired":4,"downloadCasePass":true,"duplicateCases":[],"duplicateControls":[]}}
```

stderr: empty (0 bytes).

### accept-download

Recorder command (exit 0):

```sh
node /tmp/tabi-r18-mutc2-lUlneVEc/run-counter.mjs accept-download 7a7502e8fdb87e05b420ab2961e0727ee5779639
```

Recorded detector invocation/limits/hashes:

```json
{
  "label": "accept-download",
  "revision": "7a7502e8fdb87e05b420ab2961e0727ee5779639",
  "argv": [
    "/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node",
    "/tmp/tabi-r18-mutc2-lUlneVEc/repo/.ufo/waves/round-18/measure-c2.mjs",
    "7a7502e8fdb87e05b420ab2961e0727ee5779639"
  ],
  "cwd": "/tmp/tabi-r18-mutc2-lUlneVEc/repo",
  "environmentOverrides": {
    "TMPDIR": "/tmp/d402",
    "TMP": "/tmp/d402",
    "TEMP": "/tmp/d402"
  },
  "deadlineMs": 660000,
  "deadlineReached": false,
  "elapsedMs": 34467,
  "exitCode": 0,
  "signal": null,
  "counterSha256": "71478eef46ca0c23684fd0c85467ad853cede15e862936d83bc8ce292fb7fcb6",
  "stdoutSha256": "b2765ba6f050d9e228f4201a48846153a4fe12c42fb0312692121857c04c318c",
  "stderrSha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

stdout, verbatim:

```text
{"rev":"7a7502e8fdb87e05b420ab2961e0727ee5779639","c2_hazards_closed":0,"hazards":{"h1":{"pass":false,"why":"retained-coverage precondition failed (invoke-download-refused is missing, duplicated, or not passing); case started=true, child alive at signal=true, SIGTERM sent=true, run_aborted/SIGTERM observed=true, exit=2, pass/fail receipt=none, surviving TMPDIR processes=0"},"h2":{"pass":false,"why":"retained-coverage precondition failed (invoke-download-refused is missing, duplicated, or not passing); TMPDIR empty after SIGTERM=true, normal=true, SIGINT run=true (empty=true), watchdog=true (empty=true, browser argv=2)"},"h3":{"pass":false,"why":"retained-coverage precondition failed (invoke-download-refused is missing, duplicated, or not passing); normal run completed=true, observed browser argv=3, --remote-debugging-port seen=false, DevToolsActivePort seen=false, ss scans=81 available=true, browser-owned listeners=0"},"h4":{"pass":false,"why":"retained-coverage precondition failed (invoke-download-refused is missing, duplicated, or not passing); case unique=true, pass=false, case line observed while process live=false, actual invoke attempt=true (marker prefix+sha=true, request=true, invocationId=true, no error=true, responded=true, output=true, fields=invoke,responded,downloadEvents,beforeContextClose,downloadMarkerSha256,downloadMarkerPrefix,afterContextClose), one settled refusal event=false, pre-close scans clear=false, post-close scans clear=true, fixture files seen live=0, present after run=0"},"s1":{"pass":false,"why":"retained-coverage precondition failed (invoke-download-refused is missing, duplicated, or not passing); observed launched browser argv=3, required launch roles missing=none, feature-union violations=0"},"f6":{"pass":false,"why":"retained-coverage precondition failed (invoke-download-refused is missing, duplicated, or not passing); wrapper-scoped F6 check: --rev HEAD exit=2, expected 2; detached HEAD=147b48165d7bbdfa99dff56101e847ad512a70d0; master=7a7502e8fdb87e05b420ab2961e0727ee5779639; --dry-run exit=0, master hash printed=true; frozen scripts/check-freshness.mjs --witness HEAD remains directly callable"}},"artifact":"scripts/webmcp-invoke-round18.mjs","artifactSha256":"c53b9d16d613b0f5cdb22db011c093e39b60130c815c86fbb86eb8969d39a000","counterSha256":"71478eef46ca0c23684fd0c85467ad853cede15e862936d83bc8ce292fb7fcb6","receiptSha256":"c485f91190d716b3fee67bfb5fcf015d343bad5f06ee8996647041fadeabefee","producerSha256":"c53b9d16d613b0f5cdb22db011c093e39b60130c815c86fbb86eb8969d39a000","watchdogPatch":{"path":"scripts/.measure-c2-watchdog-probe.mjs","originalTimeoutMs":420000,"timeoutMs":6000,"originalDeclaration":"const RUN_TIMEOUT_MS = 420000;","modifiedDeclaration":"const RUN_TIMEOUT_MS = 6000;","originalSha256":"c53b9d16d613b0f5cdb22db011c093e39b60130c815c86fbb86eb8969d39a000","modifiedSha256":"bc7ad20def4e1c152aa23f5d419b2601c5ae7480727d0d60b8e092a7cf051358","modifiedBytesLength":117987},"abnormalProbes":{"sigint":{"caseStarted":true,"childAliveAtSignal":true,"signalSent":true,"exitCode":2,"tmpEmpty":true},"watchdog":{"fired":true,"exitCode":2,"browserArgv":2,"tmpEmpty":true}},"coverage":{"pass":false,"why":"invoke-download-refused is missing, duplicated, or not passing","originalCasesPassed":11,"originalCasesRequired":11,"originalControlsPassed":4,"originalControlsRequired":4,"downloadCasePass":false,"duplicateCases":[],"duplicateControls":[]}}
```

stderr: empty (0 bytes).

### restored

Recorder command (exit 0):

```sh
node /tmp/tabi-r18-mutc2-lUlneVEc/run-counter.mjs restored 530f40a9bc3f10436161a2af1ca0fe9bffffc004
```

Recorded detector invocation/limits/hashes:

```json
{
  "label": "restored",
  "revision": "530f40a9bc3f10436161a2af1ca0fe9bffffc004",
  "argv": [
    "/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node",
    "/tmp/tabi-r18-mutc2-lUlneVEc/repo/.ufo/waves/round-18/measure-c2.mjs",
    "530f40a9bc3f10436161a2af1ca0fe9bffffc004"
  ],
  "cwd": "/tmp/tabi-r18-mutc2-lUlneVEc/repo",
  "environmentOverrides": {
    "TMPDIR": "/tmp/97c7",
    "TMP": "/tmp/97c7",
    "TEMP": "/tmp/97c7"
  },
  "deadlineMs": 660000,
  "deadlineReached": false,
  "elapsedMs": 34459,
  "exitCode": 0,
  "signal": null,
  "counterSha256": "71478eef46ca0c23684fd0c85467ad853cede15e862936d83bc8ce292fb7fcb6",
  "stdoutSha256": "26d833f9b9b99b5affc84951ccf33717e818a1c43870cba6d4d7bcf41ff490e6",
  "stderrSha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

stdout, verbatim:

```text
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","c2_hazards_closed":6,"hazards":{"h1":{"pass":true,"why":"case started=true, child alive at signal=true, SIGTERM sent=true, run_aborted/SIGTERM observed=true, exit=2, pass/fail receipt=none, surviving TMPDIR processes=0"},"h2":{"pass":true,"why":"TMPDIR empty after SIGTERM=true, normal=true, SIGINT run=true (empty=true), watchdog=true (empty=true, browser argv=2)"},"h3":{"pass":true,"why":"normal run completed=true, observed browser argv=3, --remote-debugging-port seen=false, DevToolsActivePort seen=false, ss scans=81 available=true, browser-owned listeners=0"},"h4":{"pass":true,"why":"case unique=true, pass=true, case line observed while process live=true, actual invoke attempt=true (marker prefix+sha=true, request=true, invocationId=true, no error=true, responded=true, output=true, fields=invoke,responded,downloadEvents,beforeContextClose,downloadMarkerSha256,downloadMarkerPrefix,afterContextClose), one settled refusal event=true, pre-close scans clear=true, post-close scans clear=true, fixture files seen live=0, present after run=0"},"s1":{"pass":true,"why":"observed launched browser argv=3, required launch roles missing=none, feature-union violations=0"},"f6":{"pass":true,"why":"wrapper-scoped F6 check: --rev HEAD exit=2, expected 2; detached HEAD=9694fe1792ded43304bc727de4a760a1d9d020e0; master=530f40a9bc3f10436161a2af1ca0fe9bffffc004; --dry-run exit=0, master hash printed=true; frozen scripts/check-freshness.mjs --witness HEAD remains directly callable"}},"artifact":"scripts/webmcp-invoke-round18.mjs","artifactSha256":"0a1201a9c01e4ee23f8a94ad6d75b868c626f96c97960797acf05b6bdbfbe155","counterSha256":"71478eef46ca0c23684fd0c85467ad853cede15e862936d83bc8ce292fb7fcb6","receiptSha256":"fdd508e3d61e6844f4ba0f6bacca076ec3115553286e108d46cf50a642a0f355","producerSha256":"0a1201a9c01e4ee23f8a94ad6d75b868c626f96c97960797acf05b6bdbfbe155","watchdogPatch":{"path":"scripts/.measure-c2-watchdog-probe.mjs","originalTimeoutMs":420000,"timeoutMs":6000,"originalDeclaration":"const RUN_TIMEOUT_MS = 420000;","modifiedDeclaration":"const RUN_TIMEOUT_MS = 6000;","originalSha256":"0a1201a9c01e4ee23f8a94ad6d75b868c626f96c97960797acf05b6bdbfbe155","modifiedSha256":"4e055ea9a010e597a270381f2d3aa2beb5f7af99ed54959febd8ef29e7aab3e1","modifiedBytesLength":117988},"abnormalProbes":{"sigint":{"caseStarted":true,"childAliveAtSignal":true,"signalSent":true,"exitCode":2,"tmpEmpty":true},"watchdog":{"fired":true,"exitCode":2,"browserArgv":2,"tmpEmpty":true}},"coverage":{"pass":true,"why":"all 11 original cases, 4 original controls, and the download case are uniquely present and passing","originalCasesPassed":11,"originalCasesRequired":11,"originalControlsPassed":4,"originalControlsRequired":4,"downloadCasePass":true,"duplicateCases":[],"duplicateControls":[]}}
```

stderr: empty (0 bytes).

## Restoration evidence and finite conclusion

- All five committed mutations were removed from the scratch working tree by returning to the candidate, not by attempting an inverse text edit. No original file was reconstructed approximately.
- Final `sha256sum` command, exit 0:

```sh
sha256sum /tmp/tabi-r18-mutc2-lUlneVEc/repo/scripts/webmcp-invoke-round18.mjs /tmp/tabi-r18-mutc2-lUlneVEc/repo/.ufo/waves/round-18/measure-c2.mjs
```

Observed output:

```text
0a1201a9c01e4ee23f8a94ad6d75b868c626f96c97960797acf05b6bdbfbe155  /tmp/tabi-r18-mutc2-lUlneVEc/repo/scripts/webmcp-invoke-round18.mjs
71478eef46ca0c23684fd0c85467ad853cede15e862936d83bc8ce292fb7fcb6  /tmp/tabi-r18-mutc2-lUlneVEc/repo/.ufo/waves/round-18/measure-c2.mjs
```

- The same unchanged revision-mode counter selected exactly these bytes and returned 6/6 in the restored run above. This is the shared restoration control for all five independent direct-child mutants.
- Finite result: four targeted defects killed; receipt replay without a browser partially rejected but H4 survived. No additional mutants, remediation, broader regression suite, self-test, or historical-baseline run is claimed.
- The initial long-path pristine result remains inconclusive for process-observation-dependent hazards. It was not counted among the mutation kills. Short-path pristine and restored controls both pass every credited hazard.
- All exact mutant deltas and output bytes are preserved in this report so the private sandbox need not remain. No lane production change or speculative pass is proposed.

Final cleanup command, exit 0:

```sh
rm -rf -- /tmp/tabi-r18-mutc2-lUlneVEc && test ! -e /tmp/tabi-r18-mutc2-lUlneVEc && printf 'sandbox_removed=1 path=/tmp/tabi-r18-mutc2-lUlneVEc\n'
```

Observed stdout:

```text
sandbox_removed=1 path=/tmp/tabi-r18-mutc2-lUlneVEc
```

The private clone, source mutants, commits, recorder, and capture files have been removed. Their exact attack source deltas and observed detector outputs are embedded above. No scratch sandbox is required for the failure receipt.

Files written (retained):
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/MutC2.md
