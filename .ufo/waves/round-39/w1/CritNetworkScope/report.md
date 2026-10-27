# C1 network-scope review

## Counterexample and evidence

The title/predicate overclaims if read as a claim of general browser egress coverage. The driver samples only TCP: `ss -Htnp` is invoked without `-u` (lines 114–127), and the `/proc` implementation reads only `/proc/net/tcp` and `/proc/net/tcp6` (198–199). It never samples UDP/QUIC, DNS traffic on UDP/TCP, Unix-domain sockets, or browser-originated requests as an independent request-level surface. A browser can therefore issue DNS/QUIC traffic or use a Unix socket while both implemented TCP surfaces report no non-loopback socket. This is a direct counterexample to unqualified “egress” / “zero non-loopback egress”, not to the narrower measured TCP-connection claim.

The process itself is session-oriented: the driver comments identify the launched Firefox tree (75–80), and the counter predicate requires dual surfaces and a final sweep. However, that does not widen the protocol coverage of those surfaces. DNS may be seen only if it uses a tracked TCP socket; UDP/QUIC/DNS-over-UDP are omitted. Unix sockets are not IP TCP endpoints and external requests are not enumerated at request level.

## Axes impacted

- **Coverage:** false completeness implication for all network egress; measured scope excludes UDP/QUIC, DNS generally, Unix sockets, and request-level external destinations.
- **Calibration:** predicate is strong evidence for observed owned TCP sockets, but is not calibrated to a general egress assertion.

## Smallest safe correction

Rename the claim to “Playwright Firefox session-bound TCP socket observation (loopback fixture)” and narrow the predicate’s zero-observation clause to “zero non-loopback TCP socket observations on ss and /proc/net/tcp{,6}”. Explicitly state DNS/UDP/QUIC, Unix-domain sockets, and request-level external requests are outside the observation contract. No instrumentation change is needed for this correction; broadening coverage would require additional independently evidenced surfaces.

## Commands / observed evidence

- Read `.ufo/waves/round-39/claims.json`: C1 title is “Playwright Firefox session-bound egress loopback capability”; predicate says zero non-loopback socket observations on ss and `/proc`.
- Read `.ufo/waves/round-39/counters/c1-egress-session-bound.mjs`: frozen sentence repeats the broad “egress” wording; lines 18–24.
- Read `scripts/playwright-firefox-egress-round39.mjs:114-216`: `ss -Htnp`; `/proc/net/tcp` and `/proc/net/tcp6` only.
- Initial combined `cat` attempt for counters failed because the path was a directory; corrected inspection used file reads.

VERDICT finding — observed TCP-only socket sampling does not establish general browser egress coverage.
