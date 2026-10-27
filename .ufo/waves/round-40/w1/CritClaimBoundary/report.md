# CritClaimBoundary — C1 TCP-only scope vs UDP/QUIC, DNS, IPv6, non-browser processes

Axis: coverage. Milestone: falsification. Frozen inputs read, not modified:
`claims.json` (B350), `scripts/playwright-firefox-egress-round39.mjs` (tag 1E89, lines 44-236, 238-408),
`scripts/measure-c1-round40.mjs`, `.ufo/waves/round-40/counters/c1-sample-span-v3.mjs`, `.ufo/waves/round-40/sources/S145-open.txt`,
`corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md`, `corpus/evidence/round-39/playwright-egress/receipt.json`.
No browser run, no external traffic, no repo writes. Scratch `/fast/scratch/hyaku/tabi-r40/CritClaimBoundary/` created and removed. No tools installed.

## 0. Verdict on the frozen predicate text
The C1 **predicate, title, target and killRule are correctly scoped**: title says "loopback TCP observation"; predicate says "all *observed* nonLoopback counts are zero";
S145-open.txt:7 says "does not establish UDP coverage, continuous egress visibility, or process ownership"; the round-39 knowledge note (Limits, line 20) says "Do not generalize the receipt to 'no egress.'"
No frozen sentence asserts comprehensive egress or external-site behavior. The defects are in **names and fields that will be quoted downstream** (receipt, SCORECARD row, lesson Gate), not in the predicate. The claim must not be amended; the downstream wording rules in §3 apply.

## 1. What the observer actually sees (source-traced)
| Surface | Code | Covers | Does not cover |
|---|---|---|---|
| `ss -Htnp` | driver :117-136 | TCP sockets (any state ss lists by default) whose `pid=` is in the fixed owned tree; peer = field 4 | UDP (no `-u`), raw, Unix-domain, sockets of pids outside the tree |
| /proc | driver :202-224 | inodes of owned pids' fds matched in `/proc/net/tcp` + `/proc/net/tcp6`; LISTEN and `rem==0` rows skipped | `/proc/net/udp{,6}` never opened; netns other than driver's |
| owned tree | :91-113, :254-255, :266 | children of the node pid whose argv matches `ms-playwright/firefox-N`, + ppid-descendants, enumerated **once** 400 ms after launch; samples reuse `rec.owned.tree` (:279) | node process itself (it hosts the fixture HTTP server and Playwright's transport), Playwright's driver child, any process outside the spawn set, any Firefox child spawned after tree0 |

## 2. Falsifier per overbroad clause
Each row: an overbroad reading someone could attach to C1, why the artifacts do not support it, a falsifier (F) that leaves the frozen counter at exit 0 or is host-observable, and the observed evidence where I ran one (local-only, zero packets).

**B1. "no UDP / QUIC / HTTP/3 egress"** — NOT SUPPORTED.
F: a UDP socket owned by the Firefox tree connected to `192.0.2.1:443` (the QUIC port) never enters either surface.
Observed (python process, UDP `connect()` sends no packet; TEST-NET-1 so nothing could answer anyway):
`ss -Htnp` → `[]` for that pid; `ss -Hunp` → `...192.168.0.253:46442  192.0.2.1:443 users:(("python",pid=2080467,fd=9))` and an IPv6 one `[2804:14d:5c56:36ef:...]:58924 [2001:db8::1]:443`; its socket inodes were not present in `/proc/net/tcp`+`tcp6` (`inode in /proc/net/tcp*: []`). The driver's `ss` call has no `-u` and never opens `/proc/net/udp*`. A Firefox HTTP/3 or WebRTC/STUN flow would therefore yield `nonLoopback:0` on both surfaces.
Also note the fixture is plain `http://127.0.0.1`; no external request is *attempted*, so zero is partly "nothing tried". The launch pins only `network.dns.disablePrefetch` (:251); no http3/proxy/TRR/background-service prefs are pinned, so whether Firefox's own background services stay silent is [INFERENCE], not observed.

**B2. "no DNS egress / no name resolution"** — NOT SUPPORTED (two independent holes).
(a) Classic resolver traffic is UDP/53 — blind per B1.
(b) Worse, DNS over TCP to the local stub is counted as **loopback, i.e. a pass**. This host's `/etc/resolv.conf` is `nameserver 127.0.0.53` (systemd-resolved listening TCP+UDP 53: `ss -Hltn` → `LISTEN ... 127.0.0.53%lo:53`, `127.0.0.54:53`). Observed: a TCP connection to 127.0.0.53:53 appears as `ESTAB ... 127.0.0.1:46698  127.0.0.53:53 users:(("python",pid=2080467,fd=9))`, and the driver's `isLoopbackPeer('127.0.0.53:53')` → `true` (tested by evaluating driver lines 137-145 verbatim). So a loopback peer is "not egress" only by label: the resolver (or any local proxy/tunnel/VPN stub on 127/8, e.g. a local SOCKS/HTTP proxy) forwards off-host. "nonLoopback==0" means "no TCP peer outside 127/8 and ::1 at poll instants", never "no bytes left the host".

**B3. "no IPv6 egress"** — parser is correct, scope is not general.
Tested by evaluating the driver's own functions: `isLoopbackPeer`: `[::1]:80` true; `[::ffff:127.0.0.1]:80` true; `[::ffff:93.184.216.34]:443` false; `[2001:db8::1]:443` false; `[fe80::1]%eth0:443` false; `isLoopbackHexRem` (proc): `...01000000:1F90` (::1) true; `...FFFF00000100007F` (::ffff:127.0.0.1) true; `...FFFF0000EE12D85D` false; `B80D0120…01000000:01BB` (2001:db8::1) false; all-zero:0 → false (reached only after the explicit skip at :217). So the TCP IPv6 loopback/non-loopback classification is sound; the host has loopback IPv6 enabled (`net.ipv6.conf.lo.disable_ipv6 = 0`) and a global IPv6 address, so the path is live. Limit: IPv6 **UDP** is blind exactly as B1 (observed `-Hunp` IPv6 row above). Do not write "IPv4 and IPv6 covered" without "TCP" and "sampled".

**B4. "no egress from the browser" / "the process under test"** — NOT SUPPORTED for process scope.
The owned set is a fixed snapshot: `ownedTree` is called once at :255 and samples iterate `rec.owned.tree` (:279). Any Firefox child forked after 400 ms (content/utility/GPU/RDD processes spawned at `newPage`, :286) is never in `pid=(...)` filter nor `/proc/<pid>/fd` walk. The receipt records `tree 5` pids for both runs and the sampled `tree.size` step (:323) just echoes that frozen list. Its `survivorPids` check is likewise restricted to the same list. Falsifier: after `newPage`, diff `ps` descendants of the Firefox root against `rec.owned.tree`; any extra pid holding a non-loopback TCP socket is invisible. (I did not launch Firefox, so the existence of such late pids on this build is [INFERENCE]; the code path that would hide them is source-observed.) Also unobserved by construction: the node driver process (owns the fixture server and the Playwright pipe), any non-Firefox process on the host, other netns. S145-open.txt:7 already disclaims "process ownership"; the receipt field name `owned.tree` reads stronger than that.

**B5. "positive ticks ⇒ coverage"** — the clause is trivially true.
`ticks` is the literal `1` whenever the surface returned a non-null value (driver :135, :223). Receipt round-39 shows `ticks 1/1` on every sample. The final sweep (:344) runs **after** `browser.close()` + 600 ms, over a dead tree; round-39 receipt: `finalSweep.ss.lines 0, proc.inodes 0, ticks 1`. So "positive ticks on every sample and final sweep" proves the tools ran, not that any socket of the session was seen at that tick. The counter (`usable()`, v3 :6) never reads `lines`/`inodes`, so a run where Firefox's sockets were all missed (e.g. empty-tree-like pid miss, mid-sample `socketInodesOfPid → null` `continue`, :211) still scores. Round-39 evidence: max 1 socket per sample, 6 observations per surface across 8-9 samples.
Falsifier: take a valid receipt, set every `ss.lines`/`proc.inodes` to 0 → v3 counter still exit 0 (it checks only ticks and nonLoopback). Required wording: "observed N loopback TCP socket-polls" must come from `sockets.*.observations`, which the counter does not gate.

**B6. "external-site behavior / real-site / authorized"** — NOT SUPPORTED.
Every navigation is `http://127.0.0.1:<port>` to the driver's own `createServer` (:240-247, :295, :312). Nothing in the receipt speaks to TLS, third-party hosts, redirects, service workers, extensions, cookies on real sites, or rate/rights (SCORECARD calibration ceiling "rate/rights/site-gotcha records still unmeasured"). Falsifier: change one `goto` to a public hostname → the predicate still says nothing; the fixture-only receipt cannot differentiate. Wording: "fixture observation", never "safe to run against site X".

**B7. "continuous / between-poll" coverage ("samples over ≥1000 ms")** — a sample *window*, not a socket-lifetime guarantee.
100 ms `setInterval` (:39, :277-283), `ss` and procfs read at slightly different instants; connections that open and close inside one interval (or sit in TIME_WAIT with inode 0, ownerless) are not seen. Owned by CritSamplingGap; recorded here only as a boundary. Wording: "polled at ~100 ms", not "monitored for the session".

**B8. "the receipt/run is session-authentic" (nonce)** — the nonce binds produced-vs-replayed receipt, not truth of the observation.
`measure-c1-round40.mjs` passes the nonce to the driver and compares what the driver wrote; it records `driverSha256` but does not compare it to `frozenDigests` (:17, :25). A modified driver writing the nonce and zeros passes. This is an integrity limit, not scope; mention only because "fresh" must not be read as "authentic". Frozen digest comparison is a recommendation, not a defect of the predicate.

## 3. Language rules that keep C1 inside its evidence (for claim/report/scorecard/lesson text)
Allowed: "two fresh-nonce Playwright Firefox runs against a local 127.0.0.1 fixture; ~100 ms polls of TCP tables (ss + /proc/net/tcp{,6}) for a once-enumerated Firefox process tree; 0 TCP peers outside 127/8, ::1, ::ffff:127/8 observed at those polls; host/build/fixture-specific."
Disallowed without a new claim: "no egress", "no network access", "no outbound traffic", "DNS/UDP/QUIC/IPv6 covered", "all browser processes", "extension/WebMCP/site safe", "continuous", "authentic session", "external-site behavior".
Field-name risk: `egressNonLoopback`, schema `tabi-pw-firefox-egress-receipt-r40`, script `playwright-firefox-egress-*` and `receipt.sockets.*.nonLoopback` read as general egress. They are frozen (digests in claims.json) and must not be renamed mid-round; downstream prose must gloss them as "TCP, loopback-vs-not, polled". A SCORECARD row should name the capability "playwright-firefox-loopback-tcp-observation", not "egress".

## 4. Smallest safe corrections (no freeze amendment)
1. Do not touch the predicate (it is already scoped). Put the §3 allowed sentence verbatim in the SCORECARD row and lesson Gate for C1.
2. Carry B1-B5 as the row's Limits list (UDP/QUIC, DNS incl. loopback stub forwarding, UDP IPv6, late-spawned/non-browser processes, `ticks` is tool-liveness only).
3. Recommendation for a *future* claim (not this one): add `ss -Hunp` + `/proc/net/udp{,6}`, re-enumerate the tree every tick, require `observations>0` on the loopback fixture socket, and treat 127.0.0.53/54:53 peers as DNS-forwarding rather than plain loopback.

## 5. Limitations
No Firefox launch (not assigned; avoided external-capable process). Late-spawned Firefox children, HTTP/3 behavior and background-service silence are [INFERENCE]; the code paths that would hide them are source-observed. UDP demonstration used a python stand-in for the process, not Firefox. Host-specific resolver details (systemd-resolved) observed on this host only.

Commands run (observed): evaluation of driver lines 137-145 and 175-200 via `new Function` in node against 11 ss peers and 8 hex peers (outputs above); python UDP/TCP connect probes with `ss -Htnp/-Hunp/-Hltn/-Hlun`; `node -e` over round-39 receipt (`tree 5`, `ticks 1/1`, `maxLines 1`, `finalSweep lines 0`).

VERDICT finding C1 predicate is correctly TCP/loopback-scoped, but the observer is blind to UDP/QUIC and UDP-IPv6, counts loopback-stub DNS/proxy peers as loopback passes, snapshots the process tree once, and `ticks>0` is a constant 1 (B1-B5); ship C1 only with the §3 wording and no "egress"/"comprehensive"/"external-site" language.
