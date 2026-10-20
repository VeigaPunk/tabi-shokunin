VERDICT: PASS

# R17 signal/cleanup probes at B — red-before evidence

**Axes:** H1 signal/result correctness; H2 run-temp-tree cleanup. `PASS` means the requested red-before evidence was collected, not that the round-17 harness meets the round-18 contract.

## Evidence basis

- Plan contract: `.ufo/waves/round-18/PLAN.md:22-35` defines H1/H2; `.ufo/waves/round-18/PLAN.md:79-89` specifies the B-sandbox probes.
- Sandbox was cloned from `/home/vgpnk/Projects/shokunin/tabi-shokunin` to `/tmp/tabi-r18-R17RedSignals-vVM6Gz`, then checked out detached at `2bff864fdfee684ddbcd066cc8e735adaba2735c`. Clone output: `Cloning into '/tmp/tabi-r18-R17RedSignals-vVM6Gz'...` / `done.` / `HEAD is now at 2bff864 round-17 verifier spot-check (integrator, hyaku): non-author admit/reject`. `git rev-parse HEAD` returned `2bff864fdfee684ddbcd066cc8e735adaba2735c`, matching `refs/heads/master` at probe start.

Exact sandbox setup commands:

```sh
git clone --no-hardlinks /home/vgpnk/Projects/shokunin/tabi-shokunin /tmp/tabi-r18-R17RedSignals-vVM6Gz
git -C /tmp/tabi-r18-R17RedSignals-vVM6Gz checkout --detach 2bff864fdfee684ddbcd066cc8e735adaba2735c
git -C /tmp/tabi-r18-R17RedSignals-vVM6Gz rev-parse HEAD
git -C /tmp/tabi-r18-R17RedSignals-vVM6Gz show 2bff864fdfee684ddbcd066cc8e735adaba2735c:scripts/webmcp-invoke-round17.mjs | sha256sum
```
- Full harness blob SHA-256 at B, from `git -C <sandbox> show 2bff864fdfee684ddbcd066cc8e735adaba2735c:scripts/webmcp-invoke-round17.mjs | sha256sum`: `de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7`.
- Runtime: `node --version` → `v24.21.0`; `chromium --version` → `Chromium 154.0.8037.97 Arch Linux`; `jq` was available.

## Commands

For each signal probe, `TMPDIR` was a newly created empty directory. From the sandbox working directory, the target argv was exactly:

```sh
TMPDIR=<fresh-absolute-TMPDIR> node scripts/webmcp-invoke-round17.mjs --out <fresh-absolute-TMPDIR>/r.json
```

A Node parent launched that child with `cwd: process.cwd()` (the sandbox) and the same environment, watched child stdout, and sent the selected signal to the child's Node PID on receipt of the first complete `WEBMCP_INVOKE_CASE ` line. The signal-controller body used for TERM, INT, and HUP was:

```js
import { spawn } from "node:child_process";
import { constants } from "node:os";
const [sig, out] = process.argv.slice(1);
const child = spawn(process.execPath, ["scripts/webmcp-invoke-round17.mjs", "--out", out], { env: process.env, cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"] });
let stdout = "", stderr = "", pending = "", firstCase = null, signalSent = false;
child.stdout.on("data", (chunk) => {
  const text = chunk.toString(); stdout += text; pending += text;
  for (;;) { const i = pending.indexOf("\n"); if (i < 0) break; const line = pending.slice(0, i); pending = pending.slice(i + 1);
    if (firstCase === null && line.startsWith("WEBMCP_INVOKE_CASE ")) { firstCase = line; signalSent = child.kill(sig); }
  }
});
child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
child.on("close", (code, signal) => {
  const exit = code ?? 128 + (constants.signals[signal] || 0);
  process.stdout.write(`NODE_PID=${child.pid}\nFIRST_CASE_LINE=${JSON.stringify(firstCase)}\nSIGNAL_SENT=${signalSent}\nCLOSE_CODE=${code}\nCLOSE_SIGNAL=${signal}\nSHELL_EXIT_CODE=${exit}\nSTDOUT_BEGIN\n${stdout}STDOUT_END\nSTDERR_BEGIN\n${stderr}STDERR_END\n`);
  process.exit(exit);
});
```

Signals were passed as `SIGTERM`, `SIGINT`, and `SIGHUP`, with each output path `<its TMPDIR>/r.json`. Post-run receipt inspection used `jq '{verdict,findings:[.findings[]|{severity,code,case}]}'` when a receipt existed; TMPDIR listings used `find "$TMP" -mindepth 1 -maxdepth 3 -printf '%y %p\n' | sort`; surviving Chromium checks enumerated `pgrep -x chromium` and retained only argv containing that run's TMPDIR.

Normal-run command:

```sh
TMPDIR=/tmp/tabi-r18-R17RedSignals-TMPDIR-NORMAL-1792523297-3092 node scripts/webmcp-invoke-round17.mjs --out /tmp/tabi-r18-R17RedSignals-TMPDIR-NORMAL-1792523297-3092/r.json
```

## Signal results

### SIGTERM

TMPDIR `/tmp/tabi-r18-R17RedSignals-TMPDIR-TERM-1792523226-3092`; child Node PID `868390`. Controller output: `FIRST_CASE_LINE="WEBMCP_INVOKE_CASE id=invoke-imperative-success status=pass"`, `SIGNAL_SENT=true`, `CLOSE_CODE=1`, `CLOSE_SIGNAL=null`, `SHELL_EXIT_CODE=1`; stderr was empty.

Child stdout, verbatim:

```text
WEBMCP_INVOKE_CASE id=invoke-imperative-success status=pass
WEBMCP_INVOKE_CASE id=invoke-imperative-throws status=fail
WEBMCP_INVOKE_CASE id=invoke-imperative-rejects status=fail
WEBMCP_INVOKE_CASE id=invoke-unknown-tool status=fail
WEBMCP_INVOKE_CASE id=invoke-input-schema-mismatch status=fail
WEBMCP_INVOKE_CASE id=invoke-declarative-form status=fail
WEBMCP_INVOKE_CASE id=invoke-after-unregister status=fail
WEBMCP_INVOKE_CASE id=invoke-concurrent-ids status=fail
WEBMCP_INVOKE_CASE id=invoke-flags-off-control status=pass
WEBMCP_INVOKE_CASE id=invoke-iframe-frameid status=fail
WEBMCP_INVOKE_CASE id=invoke-navigation-pending status=fail
WEBMCP_INVOKE_CONTROL id=invoke-before-enable status=fail
WEBMCP_INVOKE_CONTROL id=invoke-cancel status=fail
WEBMCP_INVOKE_CONTROL id=invoke-declarative-navigation-result status=fail
WEBMCP_INVOKE_CONTROL id=invoke-domain-disabled status=pass
WEBMCP_INVOKE verdict=fail cases=11 passed=2 failed=9 missing=0 controls=4 out=/tmp/tabi-r18-R17RedSignals-TMPDIR-TERM-1792523226-3092/r.json
```

Receipt query result:

```text
verdict=fail cases=11 passed=2 failed=9 missing=0
findings=case_failed:invoke-imperative-throws,case_failed:invoke-imperative-rejects,case_failed:invoke-unknown-tool,case_failed:invoke-input-schema-mismatch,case_failed:invoke-declarative-form,case_failed:invoke-after-unregister,case_failed:invoke-concurrent-ids,case_failed:invoke-iframe-frameid,case_failed:invoke-navigation-pending
```

The first finding detail was `case error: browserContext.newPage: Target page, context or browser has been closed`; subsequent findings report the closed browser / failed new-tab errors. `find` output was only `f /tmp/tabi-r18-R17RedSignals-TMPDIR-TERM-1792523226-3092/r.json`. Matching surviving Chromium processes: `none`.

### SIGINT

TMPDIR `/tmp/tabi-r18-R17RedSignals-TMPDIR-INT-1792523276-3092`; child Node PID `900939`. Controller output: `FIRST_CASE_LINE="WEBMCP_INVOKE_CASE id=invoke-imperative-success status=pass"`, `SIGNAL_SENT=true`, `CLOSE_CODE=130`, `CLOSE_SIGNAL=null`, `SHELL_EXIT_CODE=130`; stderr was empty. No receipt existed, so jq reported `JQ_RECEIPT=absent (/tmp/tabi-r18-R17RedSignals-TMPDIR-INT-1792523276-3092/r.json)`.

Child stdout, verbatim:

```text
WEBMCP_INVOKE_CASE id=invoke-imperative-success status=pass
WEBMCP_INVOKE_CASE id=invoke-imperative-throws status=fail
WEBMCP_INVOKE_CASE id=invoke-imperative-rejects status=fail
WEBMCP_INVOKE_CASE id=invoke-unknown-tool status=fail
WEBMCP_INVOKE_CASE id=invoke-input-schema-mismatch status=fail
WEBMCP_INVOKE_CASE id=invoke-declarative-form status=fail
WEBMCP_INVOKE_CASE id=invoke-after-unregister status=fail
WEBMCP_INVOKE_CASE id=invoke-concurrent-ids status=fail
```

`find` output (`find "$TMP" -mindepth 1 -maxdepth 3 -printf '%y %p\n' | sort`):

```text
d /tmp/tabi-r18-R17RedSignals-TMPDIR-INT-1792523276-3092/tabi-r17-webmcp-invoke-rdtfOR
d /tmp/tabi-r18-R17RedSignals-TMPDIR-INT-1792523276-3092/tabi-r17-webmcp-invoke-rdtfOR/flagged-home-9zvDpr
d /tmp/tabi-r18-R17RedSignals-TMPDIR-INT-1792523276-3092/tabi-r17-webmcp-invoke-rdtfOR/flagged-home-9zvDpr/.cache
d /tmp/tabi-r18-R17RedSignals-TMPDIR-INT-1792523276-3092/tabi-r17-webmcp-invoke-rdtfOR/flagged-home-9zvDpr/.config
d /tmp/tabi-r18-R17RedSignals-TMPDIR-INT-1792523276-3092/tabi-r17-webmcp-invoke-rdtfOR/flagged-profile-WpGMsh
d /tmp/tabi-r18-R17RedSignals-TMPDIR-INT-1792523276-3092/tabi-r17-webmcp-invoke-rdtfOR/flagged-profile-WpGMsh/component_crx_cache
d /tmp/tabi-r18-R17RedSignals-TMPDIR-INT-1792523276-3092/tabi-r17-webmcp-invoke-rdtfOR/flagged-profile-WpGMsh/Default
d /tmp/tabi-r18-R17RedSignals-TMPDIR-INT-1792523276-3092/tabi-r17-webmcp-invoke-rdtfOR/flagged-profile-WpGMsh/GPUPersistentCache
d /tmp/tabi-r18-R17RedSignals-TMPDIR-INT-1792523276-3092/tabi-r17-webmcp-invoke-rdtfOR/flagged-profile-WpGMsh/NativeMessagingHosts
d /tmp/tabi-r18-R17RedSignals-TMPDIR-INT-1792523276-3092/tabi-r17-webmcp-invoke-rdtfOR/flagged-profile-WpGMsh/OptimizationGuideModelsManifest
d /tmp/tabi-r18-R17RedSignals-TMPDIR-INT-1792523276-3092/tabi-r17-webmcp-invoke-rdtfOR/flagged-profile-WpGMsh/Safe Browsing
d /tmp/tabi-r18-R17RedSignals-TMPDIR-INT-1792523276-3092/tabi-r17-webmcp-invoke-rdtfOR/flagged-profile-WpGMsh/segmentation_platform
d /tmp/tabi-r18-R17RedSignals-TMPDIR-INT-1792523276-3092/tabi-r17-webmcp-invoke-rdtfOR/flag-off-home-ym8Xcf
d /tmp/tabi-r18-R17RedSignals-TMPDIR-INT-1792523276-3092/tabi-r17-webmcp-invoke-rdtfOR/flag-off-profile-nJe00v
f /tmp/tabi-r18-R17RedSignals-TMPDIR-INT-1792523276-3092/tabi-r17-webmcp-invoke-rdtfOR/flagged-profile-WpGMsh/DevToolsActivePort
f /tmp/tabi-r18-R17RedSignals-TMPDIR-INT-1792523276-3092/tabi-r17-webmcp-invoke-rdtfOR/flagged-profile-WpGMsh/first_party_sets.db
f /tmp/tabi-r18-R17RedSignals-TMPDIR-INT-1792523276-3092/tabi-r17-webmcp-invoke-rdtfOR/flagged-profile-WpGMsh/first_party_sets.db-journal
f /tmp/tabi-r18-R17RedSignals-TMPDIR-INT-1792523276-3092/tabi-r17-webmcp-invoke-rdtfOR/flagged-profile-WpGMsh/Last Version
f /tmp/tabi-r18-R17RedSignals-TMPDIR-INT-1792523276-3092/tabi-r17-webmcp-invoke-rdtfOR/flagged-profile-WpGMsh/Local State
f /tmp/tabi-r18-R17RedSignals-TMPDIR-INT-1792523276-3092/tabi-r17-webmcp-invoke-rdtfOR/flagged-profile-WpGMsh/Variations
```

`MATCHING_CHROMIUM_PROCESSES:` / `none`.

### SIGHUP

TMPDIR `/tmp/tabi-r18-R17RedSignals-TMPDIR-HUP-1792523284-3092`; child Node PID `923771`. Controller output: `FIRST_CASE_LINE="WEBMCP_INVOKE_CASE id=invoke-imperative-success status=pass"`, `SIGNAL_SENT=true`, `CLOSE_CODE=1`, `CLOSE_SIGNAL=null`, `SHELL_EXIT_CODE=1`; stderr was empty.

Child stdout, verbatim:

```text
WEBMCP_INVOKE_CASE id=invoke-imperative-success status=pass
WEBMCP_INVOKE_CASE id=invoke-imperative-throws status=fail
WEBMCP_INVOKE_CASE id=invoke-imperative-rejects status=fail
WEBMCP_INVOKE_CASE id=invoke-unknown-tool status=fail
WEBMCP_INVOKE_CASE id=invoke-input-schema-mismatch status=fail
WEBMCP_INVOKE_CASE id=invoke-declarative-form status=fail
WEBMCP_INVOKE_CASE id=invoke-after-unregister status=fail
WEBMCP_INVOKE_CASE id=invoke-concurrent-ids status=fail
WEBMCP_INVOKE_CASE id=invoke-flags-off-control status=pass
WEBMCP_INVOKE_CASE id=invoke-iframe-frameid status=fail
WEBMCP_INVOKE_CASE id=invoke-navigation-pending status=fail
WEBMCP_INVOKE_CONTROL id=invoke-before-enable status=fail
WEBMCP_INVOKE_CONTROL id=invoke-cancel status=fail
WEBMCP_INVOKE_CONTROL id=invoke-declarative-navigation-result status=fail
WEBMCP_INVOKE_CONTROL id=invoke-domain-disabled status=pass
WEBMCP_INVOKE verdict=fail cases=11 passed=2 failed=9 missing=0 controls=4 out=/tmp/tabi-r18-R17RedSignals-TMPDIR-HUP-1792523284-3092/r.json
```

Receipt query result was the same as SIGTERM: `verdict=fail cases=11 passed=2 failed=9 missing=0`, with nine `case_failed` findings for `invoke-imperative-throws`, `invoke-imperative-rejects`, `invoke-unknown-tool`, `invoke-input-schema-mismatch`, `invoke-declarative-form`, `invoke-after-unregister`, `invoke-concurrent-ids`, `invoke-iframe-frameid`, and `invoke-navigation-pending`. `find` output was only `f /tmp/tabi-r18-R17RedSignals-TMPDIR-HUP-1792523284-3092/r.json`. Matching surviving Chromium processes: `none`.

## Normal-run control

Observed stdout, verbatim:

```text
WEBMCP_INVOKE_CASE id=invoke-imperative-success status=pass
WEBMCP_INVOKE_CASE id=invoke-imperative-throws status=pass
WEBMCP_INVOKE_CASE id=invoke-imperative-rejects status=pass
WEBMCP_INVOKE_CASE id=invoke-unknown-tool status=pass
WEBMCP_INVOKE_CASE id=invoke-input-schema-mismatch status=pass
WEBMCP_INVOKE_CASE id=invoke-declarative-form status=pass
WEBMCP_INVOKE_CASE id=invoke-after-unregister status=pass
WEBMCP_INVOKE_CASE id=invoke-concurrent-ids status=pass
WEBMCP_INVOKE_CASE id=invoke-flags-off-control status=pass
WEBMCP_INVOKE_CASE id=invoke-iframe-frameid status=pass
WEBMCP_INVOKE_CASE id=invoke-navigation-pending status=pass
WEBMCP_INVOKE_CONTROL id=invoke-before-enable status=pass
WEBMCP_INVOKE_CONTROL id=invoke-cancel status=pass
WEBMCP_INVOKE_CONTROL id=invoke-declarative-navigation-result status=pass
WEBMCP_INVOKE_CONTROL id=invoke-domain-disabled status=pass
WEBMCP_INVOKE verdict=pass cases=11 passed=11 failed=0 missing=0 controls=4 out=/tmp/tabi-r18-R17RedSignals-TMPDIR-NORMAL-1792523297-3092/r.json
```

Exit status was `0`. The jq result was `verdict=pass`, summary `{cases:11, passed:11, failed:0, missing:0, caseSetOk:true}` and `findings:[]`. `find` output was only `f /tmp/tabi-r18-R17RedSignals-TMPDIR-NORMAL-1792523297-3092/r.json`; matching surviving Chromium processes: `none`.

## Findings / cleanup

- **H1 red:** TERM and HUP after the first case line end with exit `1` and a `verdict=fail` receipt containing interruption-induced case failures, rather than exit `2`/`run_aborted`. INT ends `130` without a receipt, also not the required abort contract.
- **H2 red:** the SIGINT exit leaves the run-owned temp tree and Chromium profile files under TMPDIR. TERM/HUP complete teardown; normal completion leaves only the explicitly requested `r.json`, not the run temp tree. No Chromium processes matching any probe TMPDIR survived any probe.
- One preliminary invocation from the fleet-root cwd failed before the harness loaded (`Cannot find module '/home/vgpnk/Projects/shokunin/scripts/webmcp-invoke-round17.mjs'`, no case line, no receipt, no Chromium). It was excluded from results; the probe was corrected to run with the sandbox as cwd.
- All signal TMPDIRs, the normal TMPDIR, the empty preliminary TMPDIR, and the sandbox were listed and then removed. No tool was installed. No lane code or evidence receipt was changed; this report is the sole lane file written.

Files written:
`/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/R17RedSignals.md`
