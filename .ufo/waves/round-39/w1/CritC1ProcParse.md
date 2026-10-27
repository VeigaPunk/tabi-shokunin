# CritC1ProcParse — round 39

Axes: coverage, calibration. Scope: synthetic tests of frozen `decodeProcIp` and `isLoopbackHexRem` in `scripts/playwright-firefox-egress-round39.mjs:154-192`.

Observed with exact function bodies extracted into scratch-only `probe.cjs` and run as `node probe.cjs`: valid 127.0.0.1 and 127.255.255.254 returned loopback; 128.0.0.0, 0.0.0.0, 8.8.8.8, IPv6 `::1`, mapped `::ffff:127.0.0.1`, mapped `::ffff:128.0.0.1`, `::`, and `2001:db8::1` classified as expected. Malformed 8-char `GG00007F` decoded to `[127,0,0,NaN]` and returned loopback; malformed `0100ZZ7F` decoded to `[127,0,NaN,1]` and returned loopback. Cause: width-only validation then `parseInt`, followed by IPv4 predicate inspecting just first byte. `/proc` surface shares this helper; `ss` is a separate parser, so dual-surface agreement is not independent validation against malformed `/proc` rows.

Smallest correction: validate exact all-hex string and byte range before classification; invalid input must be counted non-loopback. No live network, browser, installs, or production edits. Scratch fixture removed before yield.

VERDICT finding — malformed proc hex is treated as loopback, a parser false positive that weakens `/proc` surface egress accounting.
