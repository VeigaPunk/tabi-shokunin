# Round 31 freeze-time receipts (tabi)

All controls ran on a scratch clone of the freeze tree T0 (baseline 96a2d1a3 + the two counters + the SKILL.md
round-31 registry section + the SCORECARD.md round-31 corrections; tree 192b06438ee03341904242d8e218f5ee80a307cc,
which equals the freeze commit's tree minus `.ufo/waves/round-31/`, a path neither counter reads). Script:
`controls.sh` (scratch under $HYAKU_SCRATCH/tabi-r31/l1, fixture identity, deleted on exit).

| File | What | Reading |
|---|---|---|
| c1-J1-do-nothing.json | C1 counter, freeze tree, --live | population 0, admitted 0, exit 1 |
| c1-J2-old-rows.json | rows citing S107/S116 (in registry at baseline) | population 2, admitted 0, r4-new-row |
| c1-J3-selfquote-offline.json | self-quote receipts, offline | admitted 2 (offline gameable) |
| c1-J3-selfquote-live.json | same, --live | admitted 0, l1-live |
| c1-J4-invented-thresholds.json | genuine RFC 9309 bytes/quotes, own thresholds | admitted 0, n1-threshold-sourced |
| c1-J5-package-as-is.json | merge/tabi entry copied as-is | population 0 |
| c2-J1-do-nothing.json | C2 counter v2, freeze tree | mismatches 9 |
| c2-J2-delete-lines.json/.numstat | stale lines deleted | mismatches 1; 9 deleted lines -> not verified |
| c2-J3-uncited-correction.json | blanket correction, no citation | mismatches 12 |
| c2-J4-wrong-doc-citation.json | wrong-document citations | mismatches 9 |
| c2-T0-reading.json | full v2 output at T0 | mismatches 9 (same as J1) |
| c1-counter-selftest.txt / c2-counter-selftest.txt | counter self-tests | 34/34, 30/30, exit 0 |
| m8-proof/ | v2 counter with the summary-line oracle removed | its regression case FAILS (28/30, exit 3): the fix is able to fail |
| census-start.txt | sources-census validate at round start | exit 0, tabi ok, 19 W04 |
| frozen-counter-sha256.txt | counter digests | = claims.json frozenDigests |
