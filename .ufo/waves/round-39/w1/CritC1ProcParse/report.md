# CritC1ProcParse — round 39

Axes: coverage, calibration. Scope: inspect the frozen driver’s `/proc/net/tcp{,6}` address decoder and loopback classifier with synthetic rows; no live browser or network access.

## Evidence and exact run

Read `scripts/playwright-firefox-egress-round39.mjs:154-192`. The test extracted the literal `decodeProcIp` and `isLoopbackHexRem` function bodies from that file into a scratch-only CommonJS probe, then used `node probe.cjs` in `/fast/scratch/hyaku/tabi-r39/CritC1ProcParse`.

Observed output:

```text
{"name":"v4loop","decoded":"7f000001","loopback":true}
{"name":"v4loopLast","decoded":"7ffffffe","loopback":true}
{"name":"v4near","decoded":"80000000","loopback":false}
{"name":"v4wild","decoded":"00000000","loopback":false}
{"name":"v4public","decoded":"08080808","loopback":false}
{"name":"v6loop","decoded":"00000000000000000000000000000001","loopback":true}
{"name":"v6mapped127","decoded":"00000000000000000000ffff7f000001","loopback":true}
{"name":"v6mapped128","decoded":"00000000000000000000ffff80000001","loopback":false}
{"name":"v6unspec","decoded":"00000000000000000000000000000000","loopback":false}
{"name":"v6public","decoded":"b80d0120000000000000000001000000","loopback":false}
{"name":"badchar","decoded":[127,0,0,null],"loopback":true}
{"name":"short","decoded":null,"loopback":false}
{"name":"long","decoded":null,"loopback":false}
{"name":"partial","decoded":[127,null,0,1],"loopback":true}
```

## Finding

False positive: malformed proc hex is accepted as loopback. `decodeProcIp` checks only string length, not hex syntax or decoded-byte finiteness. `parseInt` yields `NaN` (serialized as `null` above); the IPv4 predicate checks only byte zero, so `GG00007F` becomes `[127,0,0,NaN]` and is classified loopback. `0100ZZ7F` similarly decodes to `[127,0,NaN,1]` and returns true. This could hide a non-loopback socket only if malformed peer data reaches this parser; malformed proc table rows are not ordinary kernel output, so exploitability in live observations is conditional. Crucially the same `isLoopbackHexRem` helper feeds the `/proc` observations; the separate `ss` parser is not this parser, but dual-surface agreement is not independent validation against crafted/corrupt `/proc` rows. No false positives were observed for valid loopback, mapped 127/8, unspecified, or public fixtures. No valid-address false negatives observed in tested fixtures.

## Smallest safe correction

Require the input to match exact address-width hex (`/^[0-9a-fA-F]{8}$/` or `/^[0-9a-fA-F]{32}$/`) before decoding, or reject unless every decoded byte is an integer in 0..255. Make invalid input classify as non-loopback (fail closed for egress accounting). Keep IPv4, IPv6 loopback, and mapped-loopback rules unchanged.

Scratch evidence: `/fast/scratch/hyaku/tabi-r39/CritC1ProcParse/probe.cjs` (removed at cleanup). No installs. No production edits.

VERDICT finding — malformed proc hex is treated as loopback, a parser-level false positive affecting the /proc surface and weakening dual-surface independence under malformed input.
