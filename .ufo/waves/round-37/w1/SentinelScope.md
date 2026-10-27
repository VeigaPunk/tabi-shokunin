# SentinelScope — round 37 w1 security review (read-only)

seat: `SentinelScope` · role: UFO-FSD sentinel · scope: **security review only, no remediation edits**
targets: C1 `c1-adjacency-sweep-v5.mjs`, C1 tool `c1-drift-audit-build-v2.mjs`, C2 `c2-firefox-bidi-v3.mjs`,
harness `measure.sh` (v2), control driver `.ufo/waves/round-37/baseline/run-controls.sh`
frozen ref: `99437d29de036415a9f2d0524343617a3b19988a` · measured tip `f76da09`
tooling: none installed (node/python3/git/ss/ps already present; pacman never invoked)

## Verdict summary

| # | Surface | Class |
|---|---|---|
| S1 | `measure.sh` REV/FREEZE validation (silently measures a different rev) | **finding (medium)** |
| S2 | `measure.sh` shared fixed scratch + `rm -rf` (34 seats, one path) | **finding (medium)** |
| S3 | C2 live-leg teardown has no signal handler → orphaned unauthenticated loopback WebDriver API | **finding (medium)** |
| S4 | C2 `egressNonLoopback` is near-vacuous (observed 2 samples; 0 samples passes) | **finding (low-medium)** |
| S5 | C2 `scratchSurvivors` is path-string scoped over all of `/proc` and SIGKILLs matches | **finding (low)** |
| S6 | `c1-drift-audit-build-v2.mjs` reads through `refs/replace` (no `GIT_NO_REPLACE_OBJECTS`) | **finding (low)** |
| S7 | `claims.json` `frozenAt` names a commit where no frozen instrument exists | **finding (low, metadata)** |
| a | C1 `--rev` / `--repo` / `--fleet` traversal | clean |
| b | C2 `--repo`/`--rev`/`--firefox`/`--geckodriver` traversal + binary pinning | clean |
| c | C2 live-leg spawn surface (argv, env literal) | clean (limits named) |
| d | `/proc` readers `treePids` / `socketInodesOf` / `nonLoopbackEstablished` | clean (own-tree scoped) |
| e | `safeWrite` lstat chain | clean (residual named) |
| f | Shell injection in `measure.sh` / `run-controls.sh` | limited (2 named) |
| g | C1 replace-ref refusal (asymmetry with C2 B1) | limited (no forgery path) |
| h | Fleet / out-of-scratch write scope | limited (named) |
| i | Receipt forgery surface by design | limited (declared limits named) |

Nothing here contradicts the claims' targets: the falsifiers I ran reproduce the intended
behaviour (C1 honest predicate true; C2 honest predicate true, 16 admitted, survivors 0,
egress 0; C2 refuses the graft at exit 2; builder resolves all 20 pins and reproduces the
committed ledger byte-for-byte). Every item below is a residual of the *instruments*, not a
claim result.

---

## Findings

### S1 — `measure.sh` validates neither `$1` nor `$3`; a bad REV silently measures a different commit (medium)

`measure.sh:17` `REV=$1; OUT=$(realpath -m "$2"); FREEZE=$3` — no 40-hex check on either, and
line 22 chains `git clone … && git checkout -q --detach "$REV"` with no `|| exit` and no
`set -e`. When the checkout fails, the clone stays on the lane's default branch and the script
carries on.

Exploit path (reproduced, scratch): clone `--shared`, then
`git checkout -q --detach deadbeef…` → rc 128, HEAD remains `f76da09`. The only guard,
`[ "$(git -C "$d" rev-parse --show-toplevel)" = "$d" ]`, still passes; `rev-parse HEAD`
returns the *tip*, and every counter then evaluates the tip while the receipt is filed under
caller-named filenames (`c1-at-<short>.json`). The provenance line does print the real
`rev=`, so the receipt is self-honest, but nothing fails: `measure.sh` exits 0 and prints
`measured f76da09`. `$FREEZE` is likewise unvalidated, so `FREEZE=HEAD` (mutable worktree tip)
or `FREEZE=master~5` silently substitutes the counter bytes the `measurementRule` says must
come from the freeze commit.

Impact: a receipt can assert a `REV` it never measured. Because `claims.json:measurementRule`
makes `measure.sh <REV> <OUT> <FREEZE>` *the* measurement contract, this is a correctness
defect in the instrument the claim is scored through.

Smallest remediation: `[[ $1 =~ ^[0-9a-f]{40}$ && $3 =~ ^[0-9a-f]{40}$ ]] || { echo "usage: measure.sh <40-hex REV> <OUT> <40-hex FREEZE>" >&2; exit 2; }`
and after the clone `git -C "$d" rev-parse --verify --quiet "${REV}^{commit}" >/dev/null || exit 9` plus
`[ "$(git -C "$d" rev-parse HEAD)" = "$REV" ] || exit 9`.

### S2 — `measure.sh` hard-codes one scratch path and `rm -rf`s it, twice (medium)

`measure.sh:19` `S=${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r37/L1/m` (identical for every
invocation), then `rm -rf -- "$S"` at start and `trap 'rm -rf -- "$S"' EXIT`. Round 37 dispatches
34 seats, and every seat is instructed to run `measure.sh` for its after-measurement. Two
concurrent runs delete each other's clone mid-flight: the loser's counter processes then fail
with `unresolvable revision`/`could not enumerate`, i.e. **exit 2 collisions that are
indistinguishable from instrument refusals** in the receipt.

Impact: fabricated-looking refusals or, worse, one run's `node` reading the other run's clone
while it is being repointed; both receipts are then unusable and the count is silently lost.

Smallest remediation: make the scratch per-invocation — `S=$(mktemp -d "${HYAKU_SCRATCH:-/fast/scratch/hyaku}/tabi-r37/m.XXXXXX")`
— and drop the leading `rm -rf`. Note `$HYAKU_SCRATCH` is also unvalidated: `HYAKU_SCRATCH=/home/vgpnk`
turns the trap into `rm -rf -- /home/vgpnk/tabi-r37/L1/m` (bounded, but an env-named recursive delete).

### S3 — no signal handler on the live leg: SIGTERM leaks geckodriver + firefox with an unauthenticated loopback WebDriver API (medium)

`c2-firefox-bidi-v3.mjs:328-343` does all teardown inside `finally`; there is no
`process.on('SIGTERM'|'SIGINT')` anywhere in the file (grep: none). Node's default SIGTERM
termination does **not** run `finally`. `measure.sh`-style wrappers (`timeout 300 node …`) and
any harness kill therefore orphan the whole session.

Evidence, live on this host: `pid 2570221 /home/vgpnk/.local/bin/geckodriver --port 44919
--websocket-port 43729 --binary …/firefox --profile-root /fast/scratch/hyaku/tabi-r36/ExecEgressLive/tmp/tabi-r36-c2-live-aGpVDp/profiles`,
started `09:05:28`, **1 h 34 m old**, now `ppid=1494` (reparented — its parent died). With it:
firefox `pid 2570248`, a `crashhelper`, and two `contentproc` children. `ss -ltnp`:
`LISTEN 127.0.0.1:44919` (geckodriver HTTP), `127.0.0.1:43729` (marionette/websocket),
`127.0.0.1:38581`. The seat that leaked it (`ExecEgressLive`) is one of the four *incomplete*
round-36 w2 seats, consistent with an abnormal exit.

Impact: geckodriver has no authentication; any same-host user can `POST /session` on
`127.0.0.1:44919` and drive a browser for as long as the orphan lives, and the counter's own
B2 survivor check cannot see it (it scans only *its own* scratch string, S5). Bind is loopback
(no LAN exposure), and because every seat on this host runs as the same unix user the reach is
"any process of that user" rather than "any network peer" — which on this host still means every
concurrent seat and every tool call in the fleet. Severity stays bounded by that. But the
"teardown survivor check" claim term is about the counter's own run, and the counter's own run is
the only case it covers; nothing covers a counter that is itself killed.

Smallest remediation: register `for (const s of ['SIGTERM','SIGINT','SIGHUP']) process.on(s, () => { try { gd.kill('SIGKILL'); } catch {} process.exit(130); })`
immediately after the geckodriver spawn (and `detached: false` so the tree dies with the
process group), or spawn geckodriver in its own process group and kill the group in the handler.

### S4 — the egress term is near-vacuous: observed 2 samples, and 0 samples satisfies the predicate (low-medium)

`c2-firefox-bidi-v3.mjs:231-241`: the sampler ticks every 400 ms and each tick is wrapped in
`catch { /* best-effort */ }`. `liveRecordFirefox` on the honest tip finished in ~2.4 s wall, so
the reading was `egress: {"samples": 2, "nonLoopback": 0, "pids": 9}` (my run, receipt below).
`out.egressNonLoopback` is `egress.nonLoopback` and the predicate only requires `=== 0`: a run
in which every tick throws (or in which the first tick lands after teardown) reports
`{"samples":0,"nonLoopback":0}` and passes the term vacuously.

Further, `nonLoopbackEstablished` parses only `/proc/net/tcp{,6}` and only `st == '01'`
(ESTABLISHED): UDP/QUIC (the common Firefox egress path), `SYN_SENT`, and any connection whose
lifetime sits between two ticks are invisible. The header declares "ESTABLISHED TCP", so this
is a declared definition — but the claim term `live.egressNonLoopback == 0` reads stronger than
what is measured, and the sample count is recorded and *not* gated.

Smallest remediation: add `samples` to the predicate (e.g. `live.egressSamples >= 25`, i.e.
≥10 s of observation, or sample from before `newSession` to after teardown) and add
`/proc/net/udp{,6}` with the same inode-ownership filter.

### S5 — `scratchSurvivors` is path-string scoped over all of `/proc` and SIGKILLs every match (low)

`c2-firefox-bidi-v3.mjs:467-479` scans **every** pid on the host, matches
`cmdline.includes(scratch)`, and lines 339-341 then `process.kill(pid, 'SIGKILL')` each match.
It is not descendant-scoped and it is not `cwd`/fd-scoped. Reproduced with the function
transcribed verbatim: a canary `node -e … canary <scratch>` whose only relation to the run is
that its argv names the scratch was selected (`scratchSurvivors() → [703787, 705853]`), and the
scan also selected the *scanning* process itself whenever that process's argv names the path.

Exploit/hazard path: an operator (or another seat) who inspects a live run with `tail -f`,
`grep -r`, `lsof`, or an editor opened on `<scratch>/...` is SIGKILLed at teardown; a pid
recycled between the `/proc` read and `process.kill` is killed blind (no `starttime` check).
Practical reach is narrow — the suffix is random from `mkdtemp` and the dir is 0700 — so this is
a hygiene/kill-scope defect, not a lateral-movement path.

Secondary defect in the same block: `survivors = survivors.concat(scratchSurvivors(scratch))`
(341) makes `rec.survivors` the pre-kill ∪ post-kill count, so a process that *was* successfully
killed is still reported as a survivor. Conservative (can only refuse, never admit), but the
reported number is not "survivors after teardown".

Smallest remediation: union `treePids(gd.pid)` with pids whose `/proc/<pid>/cwd` or an fd
`realpath` resolves under `scratch`, verify `/proc/<pid>/stat` field 22 (`starttime`) against
the value read at spawn before killing, and record `survivorsPreKill` and `survivorsPostKill`
separately.

### S6 — the C1 **builder** reads through `refs/replace`; the counter and gate do not (low)

`c1-drift-audit-build-v2.mjs:39` `const ENV = { PATH, HOME, GIT_CONFIG_NOSYSTEM, GIT_CONFIG_GLOBAL, LC_ALL }`
— no `GIT_NO_REPLACE_OBJECTS`, no `GIT_GRAFT_FILE`, and no `refs/replace` enumeration, for a
tool whose job is to *write* the drift ledger. Every other instrument in the C1 family has the
control: `c1-adjacency-sweep-v5.mjs:137` adds `GIT_NO_REPLACE_OBJECTS: '1'` per call, and
`scripts/check-adjacency.mjs:295-303` `minimalEnv()` sets `GIT_NO_REPLACE_OBJECTS=1` and
`GIT_GRAFT_FILE=/dev/null` for every git child.

Reproduced (differential, one clone with a single replace ref on
`.ufo/waves/round-36/baseline/c1-delta-pins.json` → forged `kama` head `000…0`):

| reader | bytes seen | result |
|---|---|---|
| plain `git show` | `"kama": "000…0"` | (forged) |
| `GIT_NO_REPLACE_OBJECTS=1 git show` | `"kama": "3a600d2f…"` | (true) |
| `c1-drift-audit-build-v2.mjs` | forged | **exit 0**, wrote `307 rows (295 unchanged, 3 moved, 9 stale)` |
| `c1-adjacency-sweep-v5.mjs` | true | exit 0, predicate true (env-protected) |

Impact: the builder silently emits a wrong ledger (9 `stale` rows where the committed ledger has
0) with exit 0 — exactly the "silent corruption" class routed defect 2 was opened for. No
admission path: the counter re-derives every observed status itself from env-protected reads, so
a forged ledger surfaces as `audit-status-mismatch` findings. The loss is that the *writer* of
the evidence is the one instrument a grafted clone can steer.

Smallest remediation: add `GIT_NO_REPLACE_OBJECTS: '1'`, `GIT_GRAFT_FILE: '/dev/null'` to `ENV`,
and refuse when `git -C <repo> for-each-ref --format='%(refname)' refs/replace/` is non-empty for
`--repo` or any sibling (mirror C2's `replaceRefs`, 5 lines).

### S7 — `claims.json:frozenAt` names a commit that does not contain the frozen instruments (low, metadata)

`claims.json` carries `"frozenAt": "ed8ccfc…"` and `"baseline": "ed8ccfc…"`. The instruments
freeze one commit later: `git cat-file -e ed8ccfc:.ufo/waves/round-37/counters/c1-adjacency-sweep-v5.mjs`
→ **absent on disk, not in `ed8ccfc`**, while `git show --stat 99437d2` adds all four instruments,
`measure.sh` and `claims.json` itself. All five `frozenDigests` do match the bytes at `99437d2`
and in the worktree (verified: `9c6289b7…`, `eda339eb…`, `a85152cd…`, `9f89697c…`).

Impact: a reader who tests the declared freeze point concludes the counters post-date it — i.e.
the claim's own freeze metadata fails its own audit. `baseline` already carries `ed8ccfc`, so
`frozenAt` is redundant and wrong.

Smallest remediation: set `"frozenAt": "99437d29de036415a9f2d0524343617a3b19988a"` before any
seat scores (pre-data; the `noAmendAfterScores` rule still holds).

---

## Surfaces reviewed and classified clean

**a. Path traversal via `--repo` / `--fleet` / `--rev` — clean.**
`--rev` is `^[0-9a-f]{40}$`-validated then resolved in the repo in both counters
(`c1:141`, `c2:128`); probes return exit 2 with a `Refusal` for `nothex`, for an absent 40-hex
rev, and for `--repo /nonexistent`. `--fleet` only ever appears as `join(fleet, "<fixed sibling
name>")` where the name list is a frozen constant (`PINS`), so it retargets the fleet root but
cannot address an arbitrary path component; sibling working trees are never touched (git objects
only, and `check-adjacency` uses `GIT_CEILING_DIRECTORIES` + `minimalEnv`). Every git call is
`spawnSync('git', [argv…])` — no shell anywhere in either counter. C2's `blob()` additionally
rejects `..` and absolute paths (`c2:134`); C1's `blob()` relies on git to reject them (it does:
`rev:../x` is an error) — cosmetic asymmetry only.

**b. C2 argument surface / binary pinning — clean.**
`--firefox` must byte-equal one of two registered paths *and* match the install-receipt digest;
`--geckodriver` must match its digest (`verifyBinaries`, `c2:433-445`), and it runs before the
live leg. Verified against the host: all three digests match `PINNED_BINARIES` exactly
(`a1947294…` firefox, `46e2c204…` firefox-bin, `f831b7e6…` geckodriver). M4 is closed.

**c. C2 live-leg spawn surface — clean, with limits named.**
`spawn(geckodriver, ['--port', N, '--websocket-port', N, '--binary', <pinned absolute>, '--profile-root', <scratch>])`
— argv has no caller-controlled free text (ports come from an OS-assigned `listen(0)` on
127.0.0.1, the binary and profile root are constants/scratch), and `spawn` takes no shell. The
**env is an allow-list literal, not an inheritance** (`c2:228`): `PATH, HOME, TMPDIR,
XDG_CONFIG_HOME, XDG_CACHE_HOME, XDG_DATA_HOME, XDG_STATE_HOME, MOZ_HEADLESS, LC_ALL`, with
`HOME`/`TMPDIR`/all `XDG_*` rooted inside the `mkdtemp` scratch. Observed, not just read: while
a real run was in flight I snapshotted `/proc/<pid>/environ` for every geckodriver/firefox pid —
the spawned browser carried **exactly 9 variables, all on the allow-list**, with `HOME` and
`TMPDIR` under the scratch. No `GIT_*`, no proxy vars, no `DISPLAY`. The only seeded item is
`PATH` (unfiltered, unlike the gate's `minimalEnv` which drops relative entries); geckodriver is
invoked by absolute path and firefox via `--binary`, so PATH is not on the exec path. Both
listening sockets bind loopback only (`--host` defaults to 127.0.0.1; confirmed on the leaked
session, S3), and the fixture is `serveFixture` on 127.0.0.1. Egress: see S4.

**d. `/proc` readers — `treePids`/`socketInodesOf`/`nonLoopbackEstablished` are own-tree scoped.**
`treePids(rootPid)` computes a ppid closure from `gd.pid` (so the leaked round-36 firefox is
*not* admitted — confirmed: a foreign firefox existed during my run and the count stayed 0).
`socketInodesOf(pids)` reads `/proc/<pid>/fd` only for those pids, and `nonLoopbackEstablished`
intersects `/proc/net/tcp{,6}` by owned inode. Correct scoping; limits are the sampling/state
ones in S4. Only `scratchSurvivors` breaks the pattern (S5).

**e. `safeWrite` lstat chain — sound.**
Both copies (`c1:245-262`, `c2:376-395`) walk the target's components from `dir` up to `/` and
refuse any symlink, then `openSync(target,'wx')` + `fstat` `isFile()`. The final component is
safe by construction (`O_CREAT|O_EXCL` refuses a symlink, including a dangling one, with
`EEXIST`), and `dir` is a fresh `mkdtemp` under `$TMPDIR`. Residual named: the lstat of
*intermediate* components is TOCTOU-open, so a differently-owned writable `$TMPDIR` (i.e. not
sticky, not 0700) could let another local user swap the `mkdtemp` dir for a symlink between the
check and the `open`. The bytes written are the digest-pinned gate source, so the worst case is
"known bytes written to an attacker-chosen path", not content injection. Worth one line in the
header as a declared limit; no code change required.

**f. Shell injection in the harness — limited, two named residues.**
`measure.sh`: the only `$($c)`-style expansion (line 49) re-parses a constant string whose
interpolated values are `$full` (always 40-hex from `git rev-parse`) and `$FLEET` (constant), so
no injection. `run-controls.sh`: every fixture command quotes its operands (`"$RA" "$A"`
etc.), `receipt()` json-escapes its free-text argument through `python3 json.dumps`, and
`run_c1`/`run_c2` capture `rc` correctly. Two residues:
(i) `$FREEZE` is unvalidated and lands as `git show "$FREEZE:$f"` — an option-shaped value is
parsed as an option. I probed the sharpest form (`--output=<path>:<file>`): `git show` then has
no revision left and exits 128 **without** creating the file, so there is no write primitive —
the real effect is that `FREEZE=HEAD`/`master~5` silently substitutes the counter bytes
(see S1), and a typo yields four counters' worth of confusing `exit=1` lines in the receipt;
(ii) `OUT` in both drivers is caller-supplied and used as `mkdir -p "$OUT"` / `> "$OUT/…"`
with no confinement, so the drivers can write anywhere the caller names (by design for L1; a
seat must never pass a fleet path).

**g. C1 replace-ref refusal — limited (no forgery path).**
C1 v5 does not enumerate `refs/replace` (C2 v3 does, and I independently reproduced the refusal:
`exit=2`, `refs/replace present in measured clone …`). Content integrity does hold: every C1
read goes through the per-call `GIT_NO_REPLACE_OBJECTS: '1'`, and the spawned gate restores it
via `minimalEnv()`, so a graft is *ignored*. Reproduced: clone + replace ref pointing
`corpus/adjacency-screen-drift.tsv` at a one-line forgery → C1 v5 exits 0 with
`drift.auditCoverage 307`, `auditFindings 0`, i.e. it read the true 308-line ledger (plain
`git show` on the same clone returns the one line). Residual: the receipt gives no signal that
the measured clone carried refs/replace, so a grafted clone is indistinguishable from an honest
one — the "loud, not laundered" property C2 buys is simply absent here. Smallest remediation:
copy C2's `replaceRefs(repo)` guard (7 lines) into C1 before the first blob read.

**h. Fleet / out-of-scratch write scope — limited (named).**
No counter writes outside its scratch: C1 writes only via `safeWrite` into a `mkdtemp` and
`rmSync`s it; C2 writes only `mkdirSync`/`safeWrite` under its `mkdtemp` (including the scoped
`HOME`/`XDG_*` tree) and removes it in `finally`; `check-adjacency.mjs` is read-only over
`--fleet` outside its self-test, whose writes are confined to
`mkdtempSync(join(tmpdir(),'tabi-adjacency-selftest-'))`. Two deliberate exceptions to name:
`c1-drift-audit-build-v2.mjs` **writes into the measured repo's worktree by default**
(`out = join(repo,'corpus','adjacency-screen-drift.tsv')`), so running it inside a measured
clone leaves `porcelain != 0` and will poison a later `provenance-*.txt`; and `measure.sh`
executes `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` — a **fleet-root, mutable,
unpinned** input whose exit code is recorded in `noharm-at-*.txt` while provenance hashes only
the three `scripts/check-*.mjs` files from the clone. Suggest hashing that script (or invoking
the clone's copy) in the provenance block.

**i. Receipt forgery surface left by design — declared limits, named.**
1. *No counter self-binding.* C1 reports no `counterSha256` at all; C2 reports one
(`out.counterSha256`) but it is self-measured and compared to nothing, so a rewritten counter
attests to its own bytes. The binding is entirely out-of-band: `claims.json:frozenDigests` plus
`measure.sh`'s `sha256 … (freeze) … at-rev …` lines. Smallest fix: embed the expected digest in
each counter and refuse on mismatch (the pattern `ADJ_GATE_SHA256` already uses).
2. *Self-referential receipt digests.* `receipt.driverSha256` and `run.transcriptSha256` are
checked against the blobs *in the same commit*, so they prove internal consistency, not
provenance — a forger who can commit can satisfy both.
3. *The external re-derivation is the live leg only*: `browserVersion`, `moz:geckodriverVersion`,
the first-screenshot sha256, and one `gate.PREDICATES[id](liveRec, ctx)` evaluation per admitted
row. Everything else — command/event transcripts, timings, per-run counts, context ids — is
self-asserted bytes.
4. *`observed` binding covers four steps* (`session`, `getTree`, `setViewport`,
`captureScreenshot`); every other step is display-only and never read (`c2:405-431`, declared).
5. *Rewritten-id clones* remain a recorded limit (A6 binds disjointness, not authenticity).
6. *A4's whitespace twin* catches byte-near copies only; the real guard is the driver
import allow-list (`driverFinding`), so an inlined copy of the counter with no imports passes.
7. *`--rev` is caller-chosen*: a receipt attests "predicate true at this rev", never "this is the
lane's tip" — which is why S1's silent substitution matters.
8. *Egress is 400 ms-sampled ESTABLISHED TCP* (S4), so "no egress" is a sampled claim, not an
observed one.

---

## Falsifiers I ran (independent reproductions, all in `/fast/scratch/hyaku/tabi-r37/w1/SentinelScope`)

| # | What | Result |
|---|---|---|
| 1 | C2 v3 honest leg, `--rev f76da09 --repo <clone>` | `exit 0`, predicate **true**, `admitted 16 / population 17 / failing 0`, `survivors 0`, `egressNonLoopback 0`, `egress {"samples":2,"pids":9}`, firefox 158.0.1 / geckodriver 0.37.1 |
| 2 | C2 v3 over a clone with a `refs/replace` graft on the receipt blob | `exit 2`, `refs/replace present in measured clone (refs/replace/88f73cf2…)`; **no firefox spawned** (pid count unchanged) |
| 3 | C1 v5 over the same clone with a graft on the drift ledger | `exit 0`, predicate **true**, `auditCoverage 307`, `auditFindings 0` — env protection held (plain `git show` returns the 1-line forgery) |
| 4 | `c1-drift-audit-build-v2.mjs` honest | `exit 0`, `307 rows (304 unchanged, 3 moved, 0 stale)`, output **byte-identical** to the committed ledger; all 20 `PINS` resolve; builder `PINS` == counter `PINS`, all 40-hex, `kama e8fa87ef…` |
| 5 | Same builder over the grafted clone | `exit 0`, `307 rows (295 unchanged, 3 moved, 9 stale)` — forged pins consumed (S6) |
| 6 | Predicate sentence byte-identity | C1 295 bytes identical across header / `PREDICATE_SENTENCE` / `claims.json`; C2 154 bytes identical across the same three sites |
| 7 | Digest binding | `DELTA_PINS_SHA256` == `sha256(git show ed8ccfc:…c1-delta-pins.json)` == `sha256(git show HEAD:…)`; all three binary digests == `PINNED_BINARIES`; four `frozenDigests` == worktree bytes |
| 8 | `measure.sh` bad-REV replica | checkout rc 128, HEAD stays at the lane tip, toplevel guard passes, script continues (§S1) |
| 9 | `git show --output=…:<path>` option injection | rc 128, no file written — no write primitive, substitution risk stands (§f) |
| 10 | `scratchSurvivors` verbatim transcription | selected a non-descendant canary and the scanning process itself (§S5) |
| 11 | Live child env snapshot (`/proc/<pid>/environ`, 20 ms poll) | spawned firefox: **9 vars, all on the allow-list**; `HOME`/`TMPDIR` under scratch |
| 12 | Orphan audit (`ps`, `ss -ltnp`) | round-36 `ExecEgressLive` session alive 1 h 34 m, `ppid=1494`, loopback-only listeners 44919/43729/38581 (§S3) |

Scratch `/fast/scratch/hyaku/tabi-r37/w1/SentinelScope/` was removed after the run; the
receipts quoted above are reproduced inline in this file rather than left on disk, and every
git fixture named `-C "$D"` with `rev-parse --show-toplevel` verified before its first commit.
No fleet-root, lane, or sibling repo file was created, modified or deleted; no pacman, no
mutating git/jj, no non-loopback browser target.

VERDICT finding 7 residuals, 2 of them medium-impact in the measurement harness (silent wrong-rev measurement; shared `rm -rf` scratch across 34 seats) and one medium in the C2 live leg (no signal handler → unauthenticated loopback WebDriver API left running), with the counters' core read integrity, argument validation, binary pinning, env confinement and `/proc` tree scoping otherwise clean.
