# ConnSourcePattern — summary (full report: .ufo/waves/round-40/w1/ConnSourcePattern/report.md)

- S145 `/proc/net/tcp` remote field: scoped correctly. Verbatim (fresh fetch, sha256 `5e1700ff…f726f`, matches retained copy): "The "rem_address" is the remote address and port number pair (if connected)." (11-word span `"rem_address" is the remote address and port number pair (if connected)`, 2 hits, tcp + udp paragraphs; the tcp one is the anchor).
- Frozen C1 citation supports only that clause. Not supported by S145: tcp inode column (f[9]), LISTEN code `0A`, `/proc/net/tcp6`, little-endian byte order.
- Findings: F1 retained `S145-open.txt` quote form not verbatim (0 hits); F2 `corpus/QUALITY.md:715` (criterion 102) over-attributes little-endian decoding to S145; F3 namespace limit lives in the `/proc/net/` paragraph, not the cited anchor.
- Frozen digests of the four C1 files match `claims.json`. No SOURCES/knowledge edits, no tool installs, scratch removed.

VERDICT finding — remote-field scoping correct; citation supports only that clause (F1–F3 above).
