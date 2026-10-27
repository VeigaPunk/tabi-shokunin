# Environment-injection forgery class — loopback browser measurement integrity

source: S146 https://nodejs.org/docs/latest-v24.x/api/cli.html §`NODE_OPTIONS=options...` (v24.x docs, Added in v8.0.0); S147 https://man7.org/linux/man-pages/man5/proc_pid_environ.5.html §DESCRIPTION `/proc/pid/environ`; lane execution evidence `.ufo/waves/round-41/measure/` (battery + counter receipts).
verified-at: round-41 freeze commit (this entry rides the round-41 integration; `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin log -1 --format=%H -- corpus/knowledge/environment-injection-measurement-integrity-round-41.md`).
recheck: re-run `node scripts/measure-c1-round41.mjs --battery` — all attack cases must exit 2 with `environment-loader-contamination`; re-run `node .ufo/waves/round-41/counters/c1-session-bound-v4.mjs` over the round-39 receipt — must exit 1.

## What the class is

A loopback browser evidence run is only as strong as the process that produced
the receipt. The round-39/40 falsification campaign showed the receipt bytes
are not the weak link — the *producer chain* is: an attacker who controls the
environment of the measurement command can substitute the producer in-process
and emit a byte-perfect receipt without a browser. The round-40 F4-full attack
(`.ufo/waves/round-40/w1/CritControlReach/report.md`) demonstrated this
end-to-end: `NODE_OPTIONS=--require forger.cjs` replaced the driver at spawn,
read the fresh nonce from argv, wrote a nonce-bound forged receipt, exited 0
in 0.06 s, and the frozen wrapper + counter returned `predicate=true`.

## Why the environment is the trust boundary (sources)

- **S146** (Node.js CLI docs): `NODE_OPTIONS` is "a space-separated list of
  command-line options ... interpreted before command-line options" — preload
  flags (`--require`, `--experimental-loader`, `--import`, `--inspect`) enter a
  node process through its *environment*, invisible to argv inspection.
- **S147** (proc_pid_environ(5)): `/proc/pid/environ` "contains the initial
  environment that was set when the currently executing program was started
  via execve(2)" — a kernel record. A shim can `delete process.env.X` and
  redefine `process.execArgv`, but cannot rewrite its own `/proc/self/environ`;
  a *child* cannot hide what it was spawned with (measured: shim deletes
  NODE_OPTIONS, `/proc/self/environ` still reports it, `.ufo/waves/round-41/
  measure/probe-environ.txt`).

## Forgery-vector decision table (vector → detection channel → refusal path)

| # | Vector | Detection channel | Refusal path in the round-41 chain | Residual |
|---|---|---|---|---|
| V1 | `NODE_OPTIONS=--require <cjs>` → preload replaces driver or counter in its own realm | `/proc/self/environ` at every stage + `execArgv` flag-position check | measure stage-0 env gate refuses (exit 2); driver refuses at startup; counter child spawned scrubbed | a preload in the *measure caller's* realm before measure parses argv is out of scope — the counting command must be invoked by a clean caller (the L1) |
| V2 | `NODE_PATH=<dir>` → shadow module resolution | `/proc/self/environ` names scan | same env gate, name-level refusal | none observed for this vector |
| V3 | `LD_PRELOAD=<so>` / `LD_LIBRARY_PATH` → native interposition in the interpreter | `/proc/self/environ` `LD_*` name class | same env gate; never allowlisted into spawned children | kernel/native attacks below the env boundary are undeclared, not proven |
| V4 | `NODE_OPTIONS=--experimental-loader` / `--import` → ESM hook | `/proc/self/environ` | same env gate (name-level: any NODE_OPTIONS refuses) | ESM loader inside a clean env remains unprobed |
| V5 | `process.execArgv` flags → preload flags visible post-hoc | child reports `execArgv` flag position; counter requires clean | measure refuses when its own `execArgv` non-empty; gate child requires exactly `[--eval, src]` | `Object.defineProperty` can fake the value — trusted only together with the kernel environ read |
| V6 | producer-file substitution (edited driver/counter) → different bytes, same paths | sha256 of driver/counter/measure/node binary/firefox binary re-checked against frozen digests in `claims.json` | measure stage-1 refuses on mismatch; counter re-verifies post-hoc (`digest-mismatch:*` findings) | pins bind bytes at the frozen paths only; a swapped filesystem view is out of scope |
| V7 | zero-observation receipt (`ticks>0`, sockets never seen) → do-nothing reach | per-run owned-socket observation sums on both surfaces (ss, /proc) | counter `runN-zero-ss-observation` / `runN-zero-proc-observation` | sampling cadence still misses sub-50 ms connections — declared limit |
| V8 | stale/reused/unrelated pid in owned tree → borrowed session evidence | per-sample refreshed tree; each pid carries `startTicks` + exe; witness re-derives the descendant set independently | counter `pid-stale`/`pid-future`/`root-stale`/`root-exe` + `witness-driver-unseen`/`witness-no-owned-firefox`/`witness-no-overlap` | witness samples at 50 ms; a sub-50 ms fake browser is undetectable |

## Standing rule for this lane's measurement claims

1. Every measured claim names its producer digests at freeze; the counter
   refuses a producer whose bytes drifted (`digest-mismatch:*`).
2. Every spawned stage boundary (gate → driver → counter → witness) either
   refuses a contaminated exec-time environment or records it — fail-closed.
3. `/proc/self/environ` + `/proc/<ppid>/environ` are the detection channel for
   loader injection on this host; `process.env` and `process.execArgv` are
   self-reported and never sufficient alone.
4. A claim is **not admitted** when any verbatim committed attack still
   reaches the predicate; attack fixtures live under
   `.ufo/waves/round-41/fixtures/` and the battery re-runs them.
5. Capability rows are **deferred** until the hardened chain has passed an
   independent falsify wave; this entry asserts the forgery class and the
   refusal design, not a green run.

## Limitations (declared residuals, not defects)

- Realm hooks inside the *caller's* process (a shim that patches
  `child_process.spawn` before measure runs) bypass every in-band check; the
  frozen contract is that the L1 invokes the counting command from a clean
  environment, and the battery proves the verbatim committed attacks refuse.
- `/proc/pid/environ` shows the exec-time environment; an attacker with
  `prctl`/debugger-level control is outside this entry's threat model.
- Socket sampling at 100 ms (driver) and tree sampling at 50 ms (witness)
  bound, but do not eliminate, short-lived-connection blindness.
