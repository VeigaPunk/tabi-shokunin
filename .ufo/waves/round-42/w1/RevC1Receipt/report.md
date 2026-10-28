# RevC1Receipt — C1 replay + battery controls audit, one novel bypass

Round 42, seat `RevC1Receipt`, leaf. One wave item: re-run the committed round-42 pre-data
C1 controls exactly as recorded and byte-compare finding sets, then attempt one novel bypass
against scratch copies of the wrapper/counter.

Repo under test: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (working tree HEAD
`0081bfdb93b6bd1bf2853bb128996f1a976b7218`; claims frozen at `9b6de3a`, baseline `34e1779`).
Production tree, fleet repo, sibling repos and shokuknow were read-only for the whole seat;
nothing outside `/fast/scratch/hyaku/tabi-r42/RevC1Receipt/` and this seat directory was
written, and no git/jj command was run.

Frozen producer bytes verified against `.ufo/waves/round-41/claims.json` before anything else:

```
4563e5de…95c76  scripts/measure-c1-round41.mjs                                   = pin
fb279c74…80a3   scripts/playwright-firefox-egress-round41.mjs                    = pin
cd71a59e…126a   .ufo/waves/round-41/counters/c1-session-bound-v4.mjs             = pin
416f6e4b…6db1   corpus/evidence/round41/playwright-egress/receipt.json           (receiptSha256 in the recorded r41 replay: same)
d3c9972e…39d3   corpus/evidence/round41/playwright-egress/receipt.witness.json
```

## 1. Controls, re-run and compared

All commands run from the repo root. Scratch root
`/fast/scratch/hyaku/tabi-r42/RevC1Receipt/` (`S` below). Recorded artifacts are in
`.ufo/waves/round-42/controls/`; my outputs are in this seat directory.

### 1.1 Battery

```
$ node scripts/measure-c1-round41.mjs --battery
BATTERY_EXIT=0
```

Six cases, same order and payload as the recorded `c1-battery-r42.json`:

| case | exit | finding |
|---|---|---|
| forger-r39-verbatim (`NODE_OPTIONS=--require …/forger-round39.cjs`) | 2 | environment-loader-contamination |
| forger-r41-retargeted (`NODE_OPTIONS=--require …/forger-round41.cjs`) | 2 | environment-loader-contamination |
| node-path (`NODE_PATH=…/shadow_modules`) | 2 | environment-loader-contamination |
| ld-preload (`LD_PRELOAD=…/libforger.so`) | 2 | environment-loader-contamination |
| esm-loader (`NODE_OPTIONS=--experimental-loader …/loader.mjs`) | 2 | environment-loader-contamination |
| clean | 0 | null |

`cmp` against the committed file: **byte-identical** (`battery.json`). `allPass=true`,
stderr 0 bytes.

### 1.2 Counter v4 replay refusals (fresh 64-hex nonce each, `openssl rand -hex 32`)

The recorded round-42 replay artifacts do not carry their command lines, and the command
documented in `.ufo/waves/round-41/claims.json#controls` (`… <receipt> --nonce <fresh>`)
does **not** reproduce the recorded r39/r40 sets: it yields `witness-missing` and drops
`firefox-bin-unbound`. The invocation that reproduces the recorded bytes exactly is
receipt + fresh nonce + `--witness <receipt sibling>.witness.json` (absent for r39/r40, so
`witness-unreadable`) + `--pins .ufo/waves/round-41/claims.json`:

```
$ N39=$(openssl rand -hex 32); node .ufo/waves/round-41/counters/c1-session-bound-v4.mjs \
    corpus/evidence/round-39/playwright-egress/receipt.json --nonce $N39 \
    --witness corpus/evidence/round-39/playwright-egress/receipt.witness.json \
    --pins .ufo/waves/round-41/claims.json
R39_REPLAY_EXIT=1    54 findings    byte-identical to c1-r39-replay-r42.json

$ N40=$(openssl rand -hex 32); node .ufo/waves/round-41/counters/c1-session-bound-v4.mjs \
    corpus/evidence/round40/playwright-egress/receipt.json --nonce $N40 \
    --witness corpus/evidence/round40/playwright-egress/receipt.witness.json \
    --pins .ufo/waves/round-41/claims.json
R40_REPLAY_EXIT=1    70 findings    byte-identical to c1-r40-replay-r42.json

$ N41=$(openssl rand -hex 32); node .ufo/waves/round-41/counters/c1-session-bound-v4.mjs \
    corpus/evidence/round41/playwright-egress/receipt.json --nonce $N41 \
    --witness corpus/evidence/round41/playwright-egress/receipt.witness.json \
    --pins .ufo/waves/round-41/claims.json \
    --measure .ufo/waves/round-41/measure/c1-measure.json
R41_REPLAY_EXIT=1    findings ["run-nonce-mismatch","witness-nonce-mismatch"]    byte-identical to c1-r41-replay-refused.json
```

`controls-compare.json` records, for all four controls, `findingsSetEqual=true` **and**
`wholeOutputByteEqual=true`. The requested set comparison therefore passes at the stricter
byte level. The r41 replay is the do-nothing control for the round-42 claim: the committed
receipt+witness carry the round-41 nonce `78df30…5b8f` and a fresh nonce is refused with
exactly the two nonce findings.

**Finding (controls documentation, not the claim):** the recorded r39/r40 control commands
are under-specified relative to their artifacts. Reproducing the committed bytes requires
`--witness` and `--pins`; the documented command omits both and produces a different
finding set. Counter/claims bytes are frozen, so this is routed, not amended.

## 2. Novel bypass attempt

Target: the claim's kill rule — "a forgery or counter hole that produces exit 0 without a
browser run". Two steps: first the primitive on the frozen counter, then the end-to-end
wrapper reach in a scratch copy of the chain.

### 2.1 Primitive: the fresh nonce is a plain field, not a binding

Copy the committed r41 receipt and witness, rewrite only `runNonce`/`runs[].runNonce` and
the witness `nonce` to a fresh 64-hex value, and run the **frozen** counter with the frozen
pins and the committed round-41 measure doc:

```
COUNTER_EXIT=0
{"predicate":true,"nonceMatched":true,"findings":[]}
```

No browser was started in this invocation; the bytes are the committed round-41 receipt with
two nonce strings replaced. The counter has no freshness check on `measuredAt`
(`2026-10-28T11:36:28.834Z`), and pid identity is only internally consistent
(`pids inside the run window`), so a relabelled past run is indistinguishable from a fresh
one. The round-42 r41 replay control only shows that the *unrelabelled* committed bytes are
refused; it does not probe forgeability.

### 2.2 End-to-end: check-then-use on the driver, plus a replaceable witness

Scratch harness at `S/tree/` mirroring the production layout. The chain bodies are the
frozen bytes except:

- `scripts/measure-c1-round41.mjs`: `ROOT` retargeted to `S/tree` (one line; every other
  path derives from it) — `patch-measure.diff`.
- `.ufo/waves/round-41/counters/c1-session-bound-v4.mjs`: the hardcoded repo root inside the
  post-hoc digest check retargeted to `S/tree` (one line, so the counter hashes the same
  driver path the wrapper spawns) — `patch-counter.diff`.
- `.ufo/waves/round-41/claims.json`: `frozenDigests` reduced to the **driver pin only**
  (byte-identical to the committed driver digest, `fb279c74…80a3`); `producerPins` and every
  other field unchanged. The measure self-pin and the counter self-pin are dropped only
  because both files had to be retargeted; no check logic was changed.

The harness is faithful, not weakened to pass: an unmodified run of the same harness reaches
the predicate honestly.

```
$ node S/tree/scripts/measure-c1-round41.mjs --out S/honest/receipt.json --scratch S/run-honest
HONEST_EXIT=0   counter.predicate=true   findings=[]   elapsedMs=23494   (real Firefox runs)
```

Bypass design (novel in this seat's terms): the wrapper performs its producer-digest check at
Stage 1 and spawns the driver later, after creating the scratch dir and starting the witness.
A watcher waits for the scratch dir, then atomically renames a forger over the driver path.
The forger:

1. finds the wrapper's witness child by scanning `/proc/*/environ` for
   `TABI_WITNESS_OUT=<out-with-.witness.json>`, and `SIGKILL`s it (the witness writes its
   snapshot only in its `SIGTERM` handler, so a kill leaves the path free);
2. writes the committed r41 receipt and witness with the wrapper-supplied nonce;
3. restores the original driver bytes over the driver path, so the counter's post-hoc digest
   read sees the pinned bytes;
4. sleeps past the counter's wall-clock leg (`elapsedMs >= spanSum + 500`), then exits 0.

Negative control (driver replaced *before* the digest check, no watcher) — pinning works:

```
WRAPPER_EXIT=2   {"finding":"producer-digest-mismatch", …}
```

Bypass runs (two identical executions; the second carries the process sampler and is the
one whose artifacts are in this directory):

| run | watcher swap | witness killed | wrapper | counter | receipt sha256 | witness sha256 |
|---|---|---|---|---|---|---|
| A (unsampled) | after scratch mkdir, 160 ms | pid 1659094 | exit 0 | predicate true, findings [] | `d2c08295…fae5` | `143375ba…e36c` |
| B (sampled) | after scratch mkdir, 148 ms | pid 1844379 | exit 0 | predicate true, findings [] | `baa253d2…31d7` | `36a5b7cb…3ee5` |

```
run B, wrapper stdout:
WRAPPER_EXIT=0
{"finding":null,"driverExit":0,"counterExit":0,"nonceMatches":true,
 "counterPredicate":true,"counterFindings":[],"elapsedMs":53885,
 "receiptSha256":"baa253d225c22a8c6ec38187b91915d5e4f5a6aab476624ff094b97b917131d7",
 "witnessSha256":"36a5b7cb696bd6dab507e15a9e54762c92d0c0f84138ad921e2bffcef63a3ee5"}
driver stdout: {"forger":"RevC1Receipt","killedWitnessPids":[1844379],"spanSum":52610,
                "sleepMs":53810,"nonce":"00a9d43b8629..."}
driver bytes after the run: fb279c74…80a3  (restored, equals the pin)
```

The wrapper itself recorded `receiptSha256`/`witnessSha256` equal to the two files on disk,
i.e. it accepted the forged witness as its own. Content proof that no browser ran:

```
receiptEqualApartFromNonce = true          (vs corpus/evidence/round41/…/receipt.json)
witnessEqualApartFromNonce = true          (766 witness samples)
produced measuredAt = 2026-10-28T11:36:28.834Z   (the round-41 timestamp)
owned.nodePid 2560459 → /proc/2560459 absent after both runs
```

Process observation (run B): `sampler.mjs` walked the wrapper's descendant tree every
~100 ms and resolved each pid's `/proc/<pid>/exe`; it collected 962 samples over 120 107 ms
(the window covers the whole 53 885 ms run; the loop ran to its own cap because the
backgrounded wrapper stayed a zombie until `wait`), `maxTree=3` (wrapper, witness, driver),
`maxFirefoxInTree=0`, `firefoxSeen=0` — `bypass-sampler.json`. No Firefox binary ever
appeared under the wrapper.

A first forger version that also compressed the sample timeline was refused by the counter
with 24+ `run1-sampleN-pid-future` findings: the pid-identity/timing legs have teeth, and the
passing forgery has to keep the round-41 timestamps untouched. The bypass therefore rests on
the two structural gaps in 2.2, not on a general thinness of the counter.


**What this shows.** The frozen chain as a *byte-checked producer* holds against environment
injection exactly as recorded (battery + three refusals, byte-identical). It does **not**
hold against a same-user attacker who can (a) write the driver path between Stage 1 and the
spawn and restore it before the counter reads, and (b) kill the wrapper's witness child and
write the witness path the wrapper later reads. With those two capabilities — not
environment variables, and not the in-process spawn hooking the r41 header already declares
out of scope — the counting command exits 0 with `predicate=true` and an empty findings list
while no browser is launched: a do-nothing reach of exactly the kind the round-42 kill rule
names. The primitive in 2.1 shows the nonce adds no cryptographic binding even without the
TOCTOU; the two missing properties are an open file descriptor / immutable handle for
producer bytes across check→use, and a witness whose nonce is attested by something the
driver cannot rewrite.

Severity is bounded by the precondition: this is not reachable by an env-only or read-only
participant, and the lane forbids seats from writing the tree. It is reachable by the same
user account that runs the counting command.

### 2.3 Supporting defect: the witness "driver seen" leg is tautological

`driverSamples` starts its BFS queue at `nodePid`, so `desc.has(nodePid)` is true for every
sample before any tree walk. Probe: the relabelled witness, each sample's `tree` truncated to
the `nodePid` entry only:

```
PROBE_EXIT=1   findings ["witness-no-owned-firefox","witness-no-overlap"]
```

`witness-driver-unseen` is unreachable whenever the witness has ≥10 samples; the real teeth
are `ownedFfSamples`/`sawOverlap`, which the bypass satisfies by replacing the witness file.
Minor, but it means the "driver attested by an independent witness" claim is one leg weaker
than the predicate sentence suggests.

## 3. Limitations / verification gaps

- The bypass was executed against scratch copies with two retargeted path constants and a
  reduced pin set (driver pin retained byte-exact). I did not write the production tree, so
  the production-path hash inside the counter was not exercised; the restore makes it pass by
  construction, and the scratch-rooted counter does exercise the same check against the path
  that was actually spawned.
- The successful bypass run before the sampled replay was not process-sampled; the sampled
  repetition is the observation recorded here.
- I did not run the battery or replays under a hostile parent environment beyond the six
  vectors the battery itself constructs.
- No tool was installed or upgraded; no package manager was touched.

## 4. Evidence in this directory

`battery.json`, `controls-compare.json`, `r39-replay.json`, `r40-replay.json`,
`r41-replay.json`, `replay-nonces.txt`, `counter-relabel-only.json`, `relabel-nonce.txt`,
`negcontrol-wrapper-stdout.json`, `honest-wrapper-stdout.json`, `bypass-wrapper-stdout.json`,
`bypass-receipt.json`, `bypass-receipt.witness.json`, `bypass-sampler.json`, `watcher.log`,
`witness-nodeprobe.json`, `forger.mjs`, `watcher.mjs`, `sampler.mjs`, `witness-probe.mjs`,
`mkpins.mjs`, `forge-relabel.mjs`, `patch-measure.diff`, `patch-counter.diff`.

VERDICT finding: all four recorded controls reproduce byte-identically, but a same-user
driver swap between the wrapper's digest check and its spawn, plus replacement of the
wrapper's witness, reaches wrapper exit 0 / predicate true / empty findings with the
committed r41 receipt relabelled and no browser run.
