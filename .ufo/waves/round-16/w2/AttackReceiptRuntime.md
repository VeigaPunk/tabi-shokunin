# W2 attack — receipt runtime identity (launch path vs engine; realExecutable; closure pids)

Snapshot: `b444ca8e024f386124418169e8e400221524bba3` (commit `b444ca8`; parent `8f7feb3`).
Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Lane untouched: all probes ran in
`/tmp`. I made no lane writes other than this report; `git status` also shows the pre-existing
untracked `w2/` and an untracked `corpus/evidence/round-16/measurement-binding.json`
(mtime `11:57:18`, before my harness run) written by a concurrent seat — I neither created nor
touched it.

**Verdict on the attacked item: BREAKS — narrowly.**
The note's *byte-level* identity statements verify exactly (A1–A3 below). What fails is the
identity/limit boundary: the cited receipt does not record the engine at all, its
`realExecutable`/`realExecutableSha256` are null in every run (structurally, not transiently),
and the three `closure.pids` entries are null with `gone:true` assigned vacuously. §Scope's
"Both are recorded" is true only as a union of two artifacts with no shared run binding, and
§Limits discloses the pid-null consequence only for the `effective-argv` claim. A reader who
takes the "Scope and runtime identity" row together with the receipt concludes the pinned
engine was verified for the run; it was not. No hash or size statement in the note is false.

## Attacked text

`corpus/knowledge/webmcp-chromium-loopback-round-16.md:32` (§Scope):

> `/usr/bin/chromium` is a 14 KB launcher (sha256 `eaed39c3…a172b`, hashed by the receipt)
> that execs `/usr/lib/chromium/chromium` (sha256 `95b17db7…b330a`, pinned by runtime-pin).
> Both are recorded; they are different files | runtime-pin.json; receipt

`:111-113` (§Limits):

> The receipt's flag-off case asserts page-API and event absence; its effective-argv readback
> from `/proc/<pid>/cmdline` recorded `pid null`, so "no WebMCP token reached the browser argv"
> is not independently proven beyond the harness's own argument list.

`:128` cross-reference: `knowledge/cdp-evidence-patterns.md — effective launch line, channel
identity and closure`, whose own discipline says "record the child line, not what you typed"
(`corpus/knowledge/cdp-evidence-patterns.md:85`) and whose launcher note is `:18`.

## Sub-claim verdicts

| # | Proposition under test | Verdict | Decisive evidence |
|---|---|---|---|
| A1 | `/usr/bin/chromium` is a ~14 KB launcher, sha256 `eaed39c3…` | HOLDS | `stat` 14,424 B; `sha256sum` matches note and `receipt.runtime.observed.chromium.launchSha256` |
| A2 | It execs `/usr/lib/chromium/chromium` | HOLDS | `strace -f -e trace=execve` shows the execve pair (below) |
| A3 | Engine sha256 `95b17db7…` = runtime-pin's pin, and the same launch mechanism runs that file | HOLDS | `sha256sum`; probe's `/proc/<pid>/exe` on processes carrying the profile marker resolves to that engine with that sha |
| A4 | "Both are recorded" carries run identity (receipt records the pair the run used) | **BREAKS** | receipt has **0** occurrences of `/usr/lib/chromium`; `realExecutable` and `realExecutableSha256` null in all 3 runs in the committed receipt **and** in a fresh re-run |
| A5 | §Limits bounds the pid-null defect completely | **BREAKS** | §Limits scopes it to argv; the same defect nulls `realExecutable` and makes 3 `closure.pids[].gone` vacuous `true` (`scripts/webmcp-loopback-round16.mjs:1454-1465`) |
| A6 | `closure.pids[].gone` is evidence the browser processes stopped | **BREAKS** (field vacuous) — closure itself still corroborated by other checks | code assigns `gone = true` when `pid === null`; `everyStopProof` counts those entries (`:1473-1478`) |

## Observed commands and outputs

### 1. Committed receipt: identity fields null, engine never named

```
$ jq '{runtime:.runtime.observed.chromium, pids:.closure.pids, everyStopProof:.closure.everyStopProof}' \
     corpus/evidence/round-16/webmcp/receipt.json
{
  "runtime": {
    "launchPath": "/usr/bin/chromium",
    "launchSha256": "eaed39c36bdf6ff6ff23f9f5215aaab017e59723b96f27f7fcd5e0be833a172b",
    "realExecutable": null,
    "realExecutableSha256": null,
    "product": "Chrome/154.0.8037.97",
    "version": "Chrome/154.0.8037.97",
    "versionSource": "CDP Browser.getVersion on flagged run"
  },
  "pids": [
    {"label":"flagged","pid":null,"gone":true},
    {"label":"flag-off","pid":null,"gone":true},
    {"label":"domain-disabled","pid":null,"gone":true}
  ],
  "everyStopProof": true
}

$ grep -c '/usr/lib/chromium' corpus/evidence/round-16/webmcp/receipt.json
0

$ jq '[.runs[]|{label,pid,effectiveArgv,realExecutable}]' corpus/evidence/round-16/webmcp/receipt.json
[{"label":"flagged","pid":null,"effectiveArgv":null,"realExecutable":null},
 {"label":"flag-off","pid":null,"effectiveArgv":null,"realExecutable":null},
 {"label":"domain-disabled","pid":null,"effectiveArgv":null,"realExecutable":null}]

$ jq '{everyStopProof:.closure.everyStopProof, temps:(.closure.tempPaths|length), strays:(.closure.strayProcesses|length), port:.closure.server.portRefusedAfterClose.refused}' \
     corpus/evidence/round-16/webmcp/receipt.json
{"everyStopProof":true,"temps":6,"strays":0,"port":true}
```

The retained first-run artifact has the same nulls (`realExecutable:null`,
`realExecutableSha256:null`, all three run pids null), so the counter repair at `b444ca8` did
not introduce or remove this gap; `git log --follow` shows `receipt.json` last written at
`8f7feb3`, and `git diff 8f7feb3 b444ca8` touches only `.ufo/waves/round-16/measure.mjs` and
the measurement evidence directory.

### 2. The static identity pair is real

```
$ stat -c '%n %s' /usr/bin/chromium /usr/lib/chromium/chromium
/usr/bin/chromium 14424
/usr/lib/chromium/chromium 329260096

$ sha256sum /usr/bin/chromium /usr/lib/chromium/chromium
eaed39c36bdf6ff6ff23f9f5215aaab017e59723b96f27f7fcd5e0be833a172b  /usr/bin/chromium
95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a  /usr/lib/chromium/chromium
```

(launcher matches note and receipt `launchSha256`; engine matches `runtime-pin.json`
`commands[1].stdout` and the fresh probe.)

```
$ H=$(mktemp -d /tmp/rt-strace-home.XXXXXX); \
  HOME="$H" XDG_CONFIG_HOME="$H/.config" \
  strace -f -e trace=execve -o /tmp/rt-execve.trace /usr/bin/chromium --version
Chromium 154.0.8037.97 Arch Linux

$ grep execve /tmp/rt-execve.trace
3326127 execve("/usr/bin/chromium", ["/usr/bin/chromium", "--version"], 0x7ffc0481b000 /* 261 vars */) = 0
3326127 execve("/usr/lib/chromium/chromium", ["/usr/lib/chromium/chromium", "--version"], 0x563c1372a8a0 /* 264 vars */) = 0
```

`/etc/chromium-flags.conf` is absent on this host; `~/.config/chromium-flags.conf` exists and the
harness's `HOME`/`XDG_CONFIG_HOME` redirect (`scripts/webmcp-loopback-round16.mjs:232-241`)
keeps it out of the launch, consistent with `:33`.

### 3. `realExecutable` null is structural, not a one-off

The harness reads the pid from **a page-target** CDP session
(`scripts/webmcp-loopback-round16.mjs:710-719`) and only then reads `/proc/<pid>/exe`
(`:730-737`). Chrome rejects that call on a page target, so `pid` is always null. A bounded
probe with the same global Playwright 1.64.0 and the same launch options
(`/tmp/rt-probe.mjs`, temp profile under `/tmp`, loopback-denying resolver rule, no lane writes):

```
PAGE_SESSION SystemInfo ERR cdpSession.send: Protocol error (SystemInfo.getProcessInfo): SystemInfo.getProcessInfo is only supported on the browser target
PAGE_SESSION getVersion OK Chrome/154.0.8037.97
PROC_SCAN_HITS 11
PID 3326645 EXE /usr/lib/chromium/chromium SHA 95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a
PID 3326729 EXE /usr/lib/chromium/chromium SHA 95b17db7512c34bf5d78a0d55e0e49719725c73736c47eb0a7a831553c4b330a
CTX_BROWSER object
BROWSER_SESSION SystemInfo OK {"type":"browser","id":3326645,"cpuTime":0.24}
CLOSED true
```

So (a) the null is deterministic on this Playwright/Chromium pair, (b) the browser process *is*
the pinned engine (`/proc/<pid>/exe` + sha), and (c) the harness already has the machinery to
recover it (`findProcessesUsing` scans `/proc/*/cmdline` for the run's temp marker, `:253-261`;
`context.browser()` returned an object and a browser CDP session answered, despite the
persistent-context docs). The harness simply never uses either path for pid identity.

### 4. Fresh end-to-end harness run (read-only lane; output in /tmp)

```
$ OUT=/tmp/rt-harness-1792508424-3092.json; \
  node scripts/webmcp-loopback-round16.mjs --out "$OUT"; echo exit=$?
WEBMCP_LOOPBACK verdict=pass cases=11 passed=11 failed=0 missing=0 out=/tmp/rt-harness-1792508424-3092.json
exit=0

$ jq '{chromium:.runtime.observed.chromium.realExecutable, pids:[.runs[].pid], closure:.closure.pids}' "$OUT"
{"chromium":null,"pids":[null,null,null],
 "closure":[{"label":"flagged","pid":null,"gone":true},
            {"label":"flag-off","pid":null,"gone":true},
            {"label":"domain-disabled","pid":null,"gone":true}]}

$ jq '{everyStopProof:.closure.everyStopProof, temps:(.closure.tempPaths|length), strays:(.closure.strayProcesses|length), port:.closure.server.portRefusedAfterClose.refused}' "$OUT"
{"everyStopProof":true,"temps":6,"strays":0,"port":true}
```

The harness reaches `verdict=pass` and `closure.everyStopProof=true` while no run has a pid or a
resolved executable. The identity fields are structurally dead in any run of this producer
(sha256 `961874e4…e2be1`, equal to `receipt.producerSha256`).

### 5. The C2 counter does not inspect runtime identity

`.ufo/waves/round-16/measure.mjs:193-265` (`countC2`) verifies the note cites `source:` rows,
names the receipt, the receipt schema/verdict/`caseSetOk`, `producerSha256`, case statuses and
fixture digests. It never reads `runtime.observed`, `realExecutable`, `closure` or `pids`. So
C2=1 is insensitive to this defect; the note is the only artifact that carries the identity
claim, which is why its §Scope/§Limits wording is load-bearing.

## Findings

1. **MEDIUM — §Limits under-discloses a deterministic identity blind spot.** §Limits says the
   `/proc/<pid>/cmdline` read "recorded `pid null`" and concludes only that argv is not
   independently proven. It does not say the same null leaves `realExecutable` and
   `realExecutableSha256` null, so the engine pin in `runtime-pin.json` is not bound to the
   receipt run, nor that the three closure pid stop-proofs are vacuous. Because the pid
   acquisition is rejected by protocol on every run (§3), this is permanent for this producer,
   not a bad night.
2. **MEDIUM — §Scope's "Both are recorded" reads as run identity but is only artifact-union.**
   The launcher hash is in the receipt; the engine path+hash is in `runtime-pin.json`, a separate
   static capture (only `capturedAt: 2026-10-20`, no run id, no WS endpoint, no time). The
   receipt itself contains zero engine references. The row does correctly attribute each hash to
   its artifact ("hashed by the receipt" / "pinned by runtime-pin"), so a strict literal reading
   holds; what fails is the identity table's implication, already labelled "runtime identity".
3. **LOW — `closure.pids` is not evidence.** With `pid === null`, `gone` is initialised `true`
   and never tested (`:1454-1465`); `everyStopProof` still includes those three entries
   (`:1473-1478`). Closure is not actually unsound: `strays` (a real `/proc/*/cmdline` scan for
   the temp base, `:253-261,1472`) returned `[]`, all six temp paths are removed, and the port
   refused connections. But the receipt and any verifier that counts `pids[]` as stop proof
   over-read it.
4. **LOW — the note's cross-referenced discipline is not met.** `cdp-evidence-patterns.md:85`
   requires the child process line, `:18` says the typed command is not the effective command.
   The round-16 receipt has no effective launch line and no child executable; the cross-reference
   at note `:128` ("effective launch line … closure") is therefore aspirational for this receipt.

## Residual risk

- The note's operative admissible claim is unaffected: the build identity comes from
  `Browser.getVersion` on the flagged run (`Chrome/154.0.8037.97`), a runtime self-report, and it
  matches the pinned package. "Flag-gated on 154.0.8037.97" survives.
- The engine *bytes* are not run-bound. Any future run that executed a different same-version
  binary (or had `/usr/lib/chromium/chromium` replaced after pinning) would produce the same
  receipt shape: launcher hash + product string, null `realExecutable`. The note's "one build,
  one host" frame would silently keep its engine confidence without evidence for it.
- The world is currently correct: the probe shows the browser process is exactly the pinned
  engine (`95b17db7…b330a`). The defect is in the receipt/limits, not in the fact.

## What would clear it (author-side, cheap)

- Acquire pid from `context.browser().newBrowserCDPSession()` (verified working: returned
  `{"type":"browser","id":3326645,…}`) or from the existing `/proc` marker scan before teardown,
  then record `/proc/<pid>/exe` + sha256; that makes `realExecutable`/`realExecutableSha256`
  non-null and gives the note's §Scope row its run binding.
- Emit `gone:null`/`"not_applicable"` (and exclude from `everyStopProof`) when `pid` is null,
  so closure cannot present vacuous truths.
- Add one §Limits bullet: "the engine hash is a separate static pin (`runtime-pin.json`), not a
  receipt-bound observation; `realExecutable` is null because `SystemInfo.getProcessInfo` is
  browser-target-only and the harness calls it on a page session."

## Verification gaps

- Did not re-run the committed receipt's exact three-case sequence a second time beyond the one
  fresh full run (8.5 s, 11/11 pass) — the fresh run already reproduces every null field.
- The original run's processes are gone, so I could not inspect the receipt run's own
  `/proc/<pid>/exe`; the reproduction uses the same producer, Playwright, launch options and
  host files, which makes the mechanism conclusive but not the historical PID.
- I did not test coercing `/usr/bin/chromium` to exec a different engine; the launcher's strings
  expose a fixed `/usr/lib/chromium/chromium` path and no alternative on this host.

## Tooling / hygiene

No installs or upgrades. Used existing `/usr/bin/strace`, global Playwright `1.64.0`, Node
`24.21.0`. All probe files under `/tmp` (`/tmp/rt-probe.mjs`, `/tmp/rt-execve.trace`,
`/tmp/rt-harness-1792508424-3092.json`); no lane mutation other than this report.

## Appendix — probe source (verbatim, `/tmp/rt-probe.mjs`)

```js
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const require = createRequire('/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/lib/node_modules/');
const { chromium } = require('playwright');
const base = mkdtempSync(join(tmpdir(), 'rt-probe-'));
const prof = mkdtempSync(join(base, 'prof-'));
const home = mkdtempSync(join(base, 'home-'));
const env = { HOME: home, XDG_CONFIG_HOME: join(home, '.config'), PATH: process.env.PATH, TMPDIR: tmpdir(), TZ: 'UTC', LANG: 'C.UTF-8' };
const ctx = await chromium.launchPersistentContext(prof, { executablePath: '/usr/bin/chromium', headless: true, args: ['--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1'], env, chromiumSandbox: true, serviceWorkers: 'block' });
const page = await ctx.newPage();
const s = await ctx.newCDPSession(page);
try { const r = await s.send('SystemInfo.getProcessInfo'); console.log('PAGE_SESSION SystemInfo OK', JSON.stringify(r).slice(0,160)); }
catch (e) { console.log('PAGE_SESSION SystemInfo ERR', String(e.message).split('\n')[0]); }
try { const v = await s.send('Browser.getVersion'); console.log('PAGE_SESSION getVersion OK', v.product); }
catch (e) { console.log('PAGE_SESSION getVersion ERR', String(e.message).split('\n')[0]); }
const hits = [];
for (const d of readdirSync('/proc')) {
  if (!/^\d+$/.test(d)) continue;
  try { const a = readFileSync(`/proc/${d}/cmdline`, 'utf8').split('\0').filter(Boolean); if (a.join(' ').includes(prof)) hits.push({ pid: Number(d), argv0: a[0] }); } catch {}
}
console.log('PROC_SCAN_HITS', hits.length);
for (const h of hits.slice(0, 4)) {
  try { const exe = realpathSync(`/proc/${h.pid}/exe`);
    const sha = createHash('sha256').update(readFileSync(exe)).digest('hex');
    console.log('PID', h.pid, 'EXE', exe, 'SHA', sha);
  } catch (e) { console.log('PID', h.pid, 'EXE_ERR', String(e.message)); }
}
const b = ctx.browser();
console.log('CTX_BROWSER', b === null ? 'null' : 'object');
if (b) { try { const bs = await b.newBrowserCDPSession(); const r = await bs.send('SystemInfo.getProcessInfo'); const bp = (r.processInfo||[]).find(p=>p.type==='browser'); console.log('BROWSER_SESSION SystemInfo OK', JSON.stringify(bp)); } catch (e) { console.log('BROWSER_SESSION ERR', String(e.message).split('\n')[0]); } }
await ctx.close();
rmSync(base, { recursive: true, force: true });
console.log('CLOSED', !readdirSync(tmpdir()).includes(base.split('/').pop()));
```
