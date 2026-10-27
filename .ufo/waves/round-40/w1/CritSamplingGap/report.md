# CritSamplingGap — does ">=8 samples over >=1000ms" prove continuous coverage? (C1, round 40)

Axes: coverage (primary), calibration (the predicate's evidence claim). Frozen bytes verified by sha256 against claims.json
(driver 1f8a15f0…, measure a0e564c7…, counter 0b452eac… — all match). Nothing under production was modified; no external connection.

## Answer: NO. The predicate proves sampling cadence/duration, not continuous coverage. Three independent counterexamples.

### 1. Short-lived connection between polls is invisible (local-only fixture)
Fixture (evidence/fixture.mjs, server.mjs, build.mjs): the frozen driver's own `observeSs`/`observeProc`/`sampleSockets` are sliced
verbatim out of the frozen driver (ROUND40=true) and polled every 100 ms exactly as `runOnce` does. A child process inside the owned
tree opens a NON-loopback connection (peer = host's own LAN address 192.168.0.253, served by a separate out-of-tree local process;
traffic never leaves the host) for `dur` ms, `n` times, every `period` ms.

| case | connections made | samples | span ms | samples that saw any socket | nonLoopback observed |
|---|---|---|---|---|---|
| child in tree, 3000 ms held (control) | 1 | 28 | 2698 | 26 | 52 |
| child in tree, 5 ms × 8, every 200 ms | 8 | 14 | 1304 | 1 | 1 |
| child in tree, 1 ms × 20, every 53 ms | 20 | 9 | 800 | 0 | 0 |

The 5 ms case shows 8 real non-loopback connections, 1 seen (by luck of phase). A 1000 ms span with ≥8 samples allows up to ~99 ms
blind gaps; nothing in the counter bounds them, and a closed connection leaves no pid-owned row in `ss -tnp` or /proc/<pid>/fd
(TIME_WAIT is ownerless). `allTicksPositive:true` in every case — the "positive ticks" are a hardcoded `ticks:1` returned whenever the
syscall succeeded (`observeSs`/`observeProc` return `{ticks:1,...}`), so they attest availability, not coverage.

### 2. Stronger: the owned tree is a static snapshot, so whole processes are never sampled
Driver computes `tree0` once, 400 ms after launch and BEFORE `newPage`, then samples `rec.owned.tree` forever. Fixture row
`late-child`: child spawned after the snapshot holds a non-loopback connection for 3000 ms →
`{"samples":31,"spanMs":2998,"samplesWithAnySocket":0,"nonLoopbackObserved":0,"allTicksPositive":true}` (results-A.txt).
Real browser confirmation (evidence/treegrow.mjs, loopback fixture page only): Playwright Firefox owned tree is 5 pids at launch+400 ms,
7 after first goto, 8 after a second page; 3 pids missed by the static snapshot (results-treegrow.txt). A content/socket process
spawned after the snapshot could egress for the whole session with 0 observations, ≥8 samples, span ≥1000 ms, predicate true.
(Also: pids in tree that exit mid-sample are silently `continue`d — no tick signal.)

### 3. The counter does not constrain sample spacing or require any observation
evidence/synth.mjs mutates the round-39 receipt (schema/nonce set) and runs the frozen counter:
- A: 7 samples within 7 ms then one at +1000 ms (993 ms blind gap) → exit 0, predicate true
- B: 1 sample at 0, then 7 clustered at ~1000 ms → exit 0, predicate true
- C: even 143 ms spacing → exit 0 (control); D: span 999 ms → exit 1 (control refuses)
All sample rows have `lines:0/inodes:0`; counter never requires a socket ever observed, so an all-zero-observation run passes.
Note this is a counter-level weakness; the live driver's setInterval makes A/B unlikely in practice (not a mitigation the predicate states).
Also unobserved by design: UDP/QUIC/DNS, UNIX sockets, IPv6 non-TCP; observation is TCP only.

## Impacted axes
coverage: claim "loopback-only observed" is sound only as "no non-loopback TCP seen at 100 ms polls on a launch-time pid set".
calibration: the predicate text/title implies continuous capture; the kill rule "nonzero observed nonLoopback" is vacuous for transient/late-process traffic.
The positive live run (if produced) is honest as *sampled observation*, not an egress-absence proof.

## Smallest safe correction (do not widen C1; state the limitation or add)
1. Re-enumerate the tree every tick (union of pids ever seen; record `treeMax`), and record per-sample `treeSize`; require every pid in the final union to have been sampled ≥1 time.
2. Counter: require max inter-sample gap ≤ ~250 ms (not just span), and bound with `observations` > 0 on at least one tick (the fixture connection must be seen), tick = real count of pids inspected.
3. Strongest: make absence structural rather than sampled — run the browser in `unshare -rn` with only lo up (or log `connect()` via `strace -f -e trace=connect`) so a non-loopback connect cannot occur / is recorded regardless of poll phase.
4. Minimum honest fix: rename claim wording to "sampled (100 ms, launch-time process set) loopback-only observation" and drop "continuous".

## Limitations
Fixture uses a node child and a LAN-address self-connection, not Firefox traffic; Firefox tree growth was measured, but a Firefox late-process egress was not (would need a non-loopback target). Phase luck in case 2 row is one trial. The counted live command was NOT run (not assigned; avoids polluting TabiR40a2 path). Tools installed: none. Scratch /fast/scratch/hyaku/tabi-r40/CritSamplingGap removed; 24 ownerless TIME_WAIT sockets to 192.168.0.253 from the fixture will expire on their own.

Evidence: .ufo/waves/round-40/w1/CritSamplingGap/evidence/

VERDICT finding — ">=8 samples over >=1000ms" does not prove continuous coverage: 5 ms non-loopback connections were missed (1/8 seen, 0/20 at 53 ms period); a late-spawned process's 3 s non-loopback connection yielded 0 observations with all ticks positive (real Firefox tree grows 5→8 pids after the static snapshot); frozen counter accepts 993 ms-gap and zero-observation receipts.
