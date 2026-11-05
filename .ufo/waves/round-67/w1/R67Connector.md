# R67Connector — scoped findings (C1 pre-measure)

Full report: `.ufo/waves/round-67/w1/R67Connector/report.md`. Refused rows: `.ufo/waves/round-67/w1/R67Connector/rows.tsv`.

- Ledger: `.ufo/waves/round-66/c1/adjudicated/adjacency-host-delta-r66.tsv` (149 line rows).
- BG_WORDS: copied from `.ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs:34` (13 words).
- Proposed rule refuses **95 / 149** line rows. All 95 are `no-tabi-ground`. `overlap-declared` refused 0 (5 total). `contested-open` refused 0 (49 total).
- zeroHit = 0 for every disposition. The meter only admits BG-hit lines (`v22.mjs:262-263`, `delta-line-invented`), so the `no-tabi-ground` branch cannot be satisfied by any legal row.
- Per-row verdict: disposition correct, rule wrong, for all 95. The BG token is lexical (headless Godot/Ghidra, SEO crawl, cdp-bridge subcommand, screenshot in negative scope).
- Commands: grep, awk (two counts), node counter, and an independent awk cross-check. All exit 0. Details in report.md.
