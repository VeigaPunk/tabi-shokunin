# SentinelSelftestV3 — security review of the round-34 self-test additions

Surface attacked: `scripts/check-bidi-runtime.mjs`, diff `59f1b47aae277e1670e4a824173da8cde7e388ee..04f9623dde8ad35d470cecf766e421eafbcb47fa`
(+62/−7, 5 hunks, every hunk at or after line 875 — i.e. entirely inside the `// ---- self-test`
section that starts at `scripts/check-bidi-runtime.mjs:871`; `evaluate()` and every rule line are
untouched: gate sha256 `eded1be0…61c1` at the freeze, `370e8e95…6c87` at REV). Item: new fixture
options (`bWsSessionSegment`, `bGateRowNoSha`, driver texts importing gate symbols), temp-dir
handling, code executed from fixture drivers, cleanup on failure, network use.

## Verdict

**Holds — no defect introduced by this diff.** The additions are test-only: no rule line, no
production path, no new import, no `child_process`/`eval`/`new Function`/`vm`/dynamic `import()`
surface. Driver bytes are hashed and text-parsed, never executed or imported (evidence below). The
56-case self-test makes **zero socket and zero connect syscalls** and still passes 56/56 inside
`unshare -rn` (no network at all). The two new fixture hooks are refusal-only (each can only make the
gate refuse a fixture that the default construction makes honest), and every new tmp dir is removed —
including on an abort inside a case body. Two **pre-existing** (not diff-introduced) low-severity
isolation defects sit on the same fixture surface and are reported because the round-34 counter runs
this self-test 20+ times per measurement: (V1) the fixture git calls inherit the ambient environment,
so an exported `GIT_INDEX_FILE` makes the self-test silently rewrite and empty the *caller's* git
index while still printing `verdict=clean`; (V2) a `makeFixture()` failure (ambient `GIT_DIR`, git
absent, root-mismatch guard) leaves one fixture repo on disk per attempt. Smallest remediation for
both is one sanitized env object in `makeFixture`'s `run()` (V1) and one `try/catch` around
`makeFixture()` (V2) — the C2 counter already sanitizes the same way
(`.ufo/waves/round-34/counters/c2-gate-mutants.mjs:174`).

## Evidence

Environment: node v24.21.0, `git` from PATH, no tool installed or upgraded this wave (host pacman is
paused; nothing was fetched over the network, so there are no URL receipts to record). One live
clone: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone` +
`git -C $S/clone checkout -q --detach 04f9623dde8ad35d470cecf766e421eafbcb47fa`; toplevel check
printed `$S/clone`, HEAD `04f9623dde8ad35d470cecf766e421eafbcb47fa`.

### 1. Pristine self-test, and "cleanup on failure" for the normal path

```
TMPDIR="$S/tmp" node scripts/check-bidi-runtime.mjs --selftest > out/selftest.txt 2> out/selftest.err
exit=0 ; grep -c '^CASE ' = 56 ; grep -v ' PASS$' = (none)
BIDI_RUNTIME_SELFTEST verdict=clean cases=56 passed=56
stderr bytes = 0 ; leftover dirs in $S/tmp = 0            (1.84 s)
```
`cases=56` = 53 `{ id: … }` entries in `CASES` (`:963-1066`, 12 of them new `v3-*`) + the 3
`refusal-*` legs, i.e. 54 fixture repos per run, each `mkdtempSync(join(tmpdir(),
"tabi-bidi-runtime-"))` at `:1069` and removed by the per-case `finally { rmSync(fx.root, …) }`
at `:1166` and the refusals leg's at `:1179`. Case ids are unique (`grep -o 'id: "[^"]*"' | sort |
uniq -c` → no duplicates; each of the 12 `v3-*` ids occurs once).

Abort **inside** a case body (`probe-p1-fail-in-try.mjs`, one injected `throw` after
`fx.commit()` at `:1093`): `PROBE_FAIL=1 node … --selftest` → exit 1, injected temp dir empty
(`[]`) → the `finally` cleanup is effective.
Abort **inside** `makeFixture` after `mkdtempSync` (`probe-p2-fail-in-makefixture.mjs`, throw after
`run(["init","-q"])` at `:1075`): exit 1 and `['tabi-bidi-runtime-BXU4zY']` left behind →
see V2.

### 2. Network use — none

```
unshare -rn node scripts/check-bidi-runtime.mjs --selftest   → exit 0, 56/56 clean
TMPDIR=… strace -f -e trace=socket,connect -o strace.net node … --selftest
  → exit 0 ; 2621 lines, of which 1253 are SIGCHLD delivery and 1368 are "+++ exited … +++";
    0 `socket(`, 0 `connect(`, 0 `AF_*` (main process and all git children under -f)
strace -e trace=connect -o t1 node -e 'require("net").connect(1,"127.0.0.1")'
  → connect(23, {sa_family=AF_INET, …}) = -1 EINPROGRESS   (control: the tracer does show connects)
```
The only network primitives in the file are the live leg (`fetch` at `:614/:703`, `spawn(chromedriver)`
at `:605`); they are unreachable from the self-test because `evaluate` gates them on `live`
(`if (live && out.population)` `:817`) and none of the 53 fixtures sets `live` except the pre-existing
`live-*` cases, whose runner is the injected synthetic `liveRunner` (`:1139-1144`), not
`liveRecord`.

### 3. Code executed from fixture drivers — none

Receipt `driver` handling (`:772-782`) is: `blob()` → `sha256` compare → byte-copy compare against the
gate → `importSpecs()`/`driverGateFinding()`, both line-based regex parsers (`:409-449`). The driver
blob is never `import()`ed, spawned or evaluated. `grep -n "eval(\|new Function\|vm\.\|import(\|spawn("`
over the file returns only `spawn(chromedriver)` at `:605`. The two new fixtures that carry driver
text — `v3-a-m09` (`import { FIXTURE, ROWS } from "./check-bidi-runtime.mjs"`, `:1043`) and
`v3-a-m10` (`FIXTURE_SHA256, VIEWPORT, serveFixture`, `:1046`) — are written by `fx.put(driver,
driverBytes)` at `:1128` and only ever read back as bytes by the gate.

Independently confirmed these two cases are load-bearing, not cosmetic: applying the frozen mutant
`M09` (allow-list widened with `ROWS`) → exit 3 with exactly `CASE id=v3-a-m09-driver-imports-rows …
FAIL`; applying `M10` (allow-list drops `serveFixture`) → exit 3 with exactly
`CASE id=v3-a-m10-driver-imports-servefixture … FAIL`; `M07` (ws binding removed) → exit 3 with
exactly `CASE id=v3-b-m07-ws-session-segment-unbound … FAIL`. Full 20-mutant matrix run from the
frozen `MUTANTS` table (`.ufo/waves/round-34/counters/c2-gate-mutants.mjs:52`), each applied once to a
scratch copy of the REV gate: **all 20 exit 3 with ≥ 1 CASE FAIL**, and each of the 12 baseline
survivors is killed by a `v3-*` case — M01→`v3-a-m01`, M03→`v3-a-m03`, M04→`v3-b-m04`,
M05→`v3-b-m05`, M06→`v3-a-m06`, M07→`v3-b-m07`, M08→`v3-a-m08`, M09→`v3-a-m09`, M10→`v3-a-m10`,
M16→`v3-b-m16`, M18→`v3-b-m18`, M19→`v3-b-m19`; the only extra failures are the expected collateral
of pre-existing mutants (M14 also trips `v3-b-m16`, M17 also trips `v3-b-m18`, M11 also trips
`v3-a-m09`, M15 floods as at baseline). Receipt: `mutant-matrix.json`.

### 4. New fixture options cannot make a dishonest fixture pass

`bWsSessionSegment` (`:878`, used at `:882`) replaces only the `/session/<id>` segment of the
synthesised `webSocketUrl` while `sessionId` stays; `WS_SESSION` requires 32 lower-case hex
(`:148`) and `sessionOf` refuses a segment that differs from `sessionId` (`:387-388`), and
`WS_LOOPBACK` (`:147`) still refuses any non-loopback host — so the hook can only produce a refusal
(its `null` default keeps `wsUrl` byte-identical to v2). `bGateRowNoSha` (`:948-951`) removes the
64-hex digest from the fixture `## Gate` row, and `gateRows`' filter requires `HEX64` (`:750`
`find((x) => firstHttps(x.text) && HEX64.test(x.text))`), so it can only turn a witness into
`s1-source-row`. Neither option is reachable from a receipt or from repository content: they exist
only in the gate's own `CASES` `build()` closures and in the exported `goldenLines` used by round
controls.

`detailIncludes` (`:1154-1162`) pins text the gate itself produced. Its precedence
(`out.entryDetail || first row detail`, `:1161`) cannot be spoofed from the sibling/entry side of the
receipt: every case that pins a detail expects `reason: "t1-receipt"`, and when `entryFinding` is set
the row loop overwrites every row's reason with it (`:840`), so an `s1-source-row` detail can
never satisfy a `t1-*` case. Residual (informational, not exploitable today): `t1-receipt` details
interpolate fixture-authored values (`sessionId is not 32 lowercase hex: ${JSON.stringify(sid)}`);
a future case that pins a substring which can appear inside such an interpolated value would be
satisfiable by fixture text rather than by the rule — keep `detailIncludes` strings disjoint from
fixture data.

### V1 — fixture git inherits the ambient environment: `GIT_INDEX_FILE` lets the self-test rewrite and empty the caller's index (low; pre-existing, not in this diff)

`makeFixture`'s `run()` (`:1070-1073`) and the file-level `git()` (`:454`) spawn git with the
inherited environment. `git -C <fixture> init/add/commit` therefore honours ambient `GIT_DIR`,
`GIT_WORK_TREE` and `GIT_INDEX_FILE`. Reproduced with a scratch canary repo (`staged.txt` staged,
index sha256 `63ccb863…b47d`):

```
GIT_INDEX_FILE=<canary>/.git/index node scripts/check-bidi-runtime.mjs --selftest
  → exit 0, "verdict=clean cases=56 passed=56"                     (no warning at all)
canary index sha256 after: d46c8431…1e6d (changed)
canary staged files before: ['staged.txt']   after: []
git -C canary ls-files → corpus/SOURCES.md                        (the FIXTURE's tree)
```
Exploit path: run the gate's `--selftest` from a git hook or any wrapper that exports
`GIT_INDEX_FILE` (git exports it for its hooks). Impact: the caller's staged snapshot is silently
replaced by the last fixture's index — commit/`git commit -a` then sees the wrong tree; no commit
objects or worktree files are lost. `GIT_DIR`/`GIT_WORK_TREE` alone fail closed instead: the
mismatch guard at `:1076` throws (`fixture root mismatch`), canary untouched (`HEAD` unchanged,
`rev-list --count` = 1) — but that throw happens after `mkdtempSync`, which is V2. Not currently
reachable from lane automation: the lane has no active hooks (`ls .git/hooks | grep -v .sample` → none,
`git config --get core.hooksPath` → unset) and no script/CI entry runs this gate; the C2 counter is
unaffected because it builds a sanitized `ENV` (`GIT_CONFIG_NOSYSTEM=1`, `GIT_CONFIG_GLOBAL=/dev/null`,
no `GIT_*` repo vars) at `.ufo/waves/round-34/counters/c2-gate-mutants.mjs:174`. Smallest
remediation: give `makeFixture`'s `run()` a scrubbed env (`GIT_DIR`, `GIT_WORK_TREE`,
`GIT_INDEX_FILE`, `GIT_OBJECT_DIRECTORY`, `GIT_COMMON_DIR` deleted; `GIT_CONFIG_NOSYSTEM=1`,
`GIT_CONFIG_GLOBAL=/dev/null`) — the read-only `git()` used against the lane repo must stay as is.

### V2 — temp-dir leak when `makeFixture()` throws after `mkdtempSync` (low; pre-existing, not in this diff)

`const fx = makeFixture();` sits **outside** the `try` at `:1089`, and `mkdtempSync` at `:1069`
precedes the `git init` / toplevel guard that can throw. Reproduced: the p2 probe left
`tmp/tabi-bidi-runtime-BXU4zY` (one repo: `.git`, `corpus/…`, receipt) after an exit-1 run; the
ambient-`GIT_DIR` run (`PROBE`-free, real gate) left exactly one such dir as well. Impact: unbounded
accumulation of small git repos when the fixture cannot be built (git missing, ambient `GIT_DIR`,
long TMPDIR, ENOSPC); no secret material (fixture content is synthetic, dir mode 0700), and nothing
outside TMPDIR. A SIGINT/SIGTERM mid-run leaves the in-flight case's dir too (no signal handler).
Smallest remediation: `let fx; try { fx = makeFixture(); … } catch (e) { if (fx) rmSync(fx.root,
{recursive:true, force:true}); throw e; }` — or move `mkdtempSync` after the git preconditions.

### Informational: the driver allow-list is still line-based (disclosed limit — do not read 20/20 as driver-provenance safety)

`importSpecs` (`:409`) matches one line at a time, so a multi-line named import
(`import {\n  FIXTURE_SHA256,\n  serveFixture,\n  ROWS\n} from "./check-bidi-runtime.mjs";`) is seen as
no relation to the gate and the driver is admitted. This is disclosed in the file's own Limits block
(`:115-117`, "a driver that reaches the gate through a computed specifier or a multi-line import is
not detected by it"), so it is not a defect of this round — but `v3-a-m09`/`v3-a-m10` pin only the
*contents* of `DRIVER_ALLOW` at one site, not the scan's completeness. Severity: informational, out
of the frozen C2 predicate.

## Verdict summary

| # | Finding | Severity | Introduced by this diff? |
|---|---|---|---|
| — | Additions (fixture options, driver texts, `detailIncludes`, temp handling, cleanup, network) | holds | — |
| V1 | Ambient `GIT_INDEX_FILE` → self-test rewrites/empties the caller's git index, exit 0 clean | low | no (pre-existing `makeFixture`/`git()`) |
| V2 | `makeFixture()` throw after `mkdtempSync` leaks one fixture repo per attempt | low | no (pre-existing) |
| O1 | Driver import scan is line-based; multi-line import evades the allow-list (disclosed limit) | informational | no |
| O2 | `detailIncludes` must stay disjoint from fixture-interpolated detail text | informational | note for future cases |

No lane file was edited, no commit was made, no lane script was run in the lane checkout; scratch
(`/fast/scratch/hyaku/tabi-r34/SentinelSelftestV3`, including its clone, canary repo and probes) was
deleted after the receipts were copied.

## Deliverable paths

- This report: `.ufo/waves/round-34/w2/SentinelSelftestV3.md`
- Receipts (`.ufo/waves/round-34/w2/SentinelSelftestV3/`):
  - `selftest-04f9623.txt` (56/56, exit 0; sha256 `4fe344f565c10803…`)
  - `selftest-unshare-net-none-04f9623.txt` (same, under `unshare -rn`; sha256 `4fe344f565c10803…`)
  - `strace-net-04f9623.txt` (0 `socket`, 0 `connect`; sha256 `180f811f79c543e6…`)
  - `strace-connect-control.txt` (tracer control showing an `AF_INET` connect; sha256 `99c155348b7c9aaf…`)
  - `mutant-matrix.json` (20 mutants × exit code × failing case ids; sha256 `8b03f68529fe761e…`)
  - `probe-p1-fail-in-try.mjs` (cleanup holds on abort inside a case; sha256 `8a26f580059450b3…`)
  - `probe-p2-fail-in-makefixture.mjs` (V2 leak, injected throw at `:1075`; sha256 `ff9d0110a5bb4193…`)
  - `canary-index-after-GIT_INDEX_FILE.txt` (`corpus/SOURCES.md`, the V1 clobber; sha256 `2aba310a9018a829…`)
