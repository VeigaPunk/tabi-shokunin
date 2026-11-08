# R82Exec2 — leg (b) cold runs + space-path scratch

Seat ran the frozen r82 driver twice more and scored both with the frozen counter,
plus one run under a scratch path containing a space.

## Driver pin (verified before running)
- `scripts/chrome-cdp-showpicker-round82.mjs` sha256 `2085c2a78a2bc87208404ca6d477964ed8aa29eea52cd31b92a94fe88cc373f1` == freeze.txt
- `scripts/check-showpicker-r82.mjs` sha256 `d0d26fe59b6f5067b6a8021d6e7e039466e6ded46bb4cd4f5eda6f07b444d62e` == freeze.txt

## Runs
1. nonce `tabi-r82-cold3-5204a0581de5`, ports 19266/19267/19268
   - driver exit 0, 10 legs, failures []
   - receipt: `.ufo/waves/round-82-seats/R82Exec2/receipt-cold3.json`
   - fixture sha256 `93dbc3cac0d222497542fd7251e51bc2821c66a3add7034b6c37d30759443858`
   - counter exit 0, verdict `clean`, checkCount 64, findings []
   - scored output: `.ufo/waves/round-82-seats/R82Exec2/counter-cold3.json`
2. nonce `tabi-r82-cold4-5204a0581de5`, ports 19269/19270/19271
   - driver exit 0, 10 legs, failures []
   - receipt: `.ufo/waves/round-82-seats/R82Exec2/receipt-cold4.json`
   - fixture sha256 `1298e2c6c99601f85639b130994beb40d13fc9a7f631d0ef94c546e363863c98`
   - counter exit 0, verdict `clean`, checkCount 64, findings []
   - scored output: `.ufo/waves/round-82-seats/R82Exec2/counter-cold4.json`
3. Space-path variant: nonce `tabi-r82-cold3-5204a0581de5` (reused), ports 19266/19267/19268,
   scratch `/fast/scratch/hyaku/tabi-r82/R82Exec2/scratch with space`
   - driver exit 0, 10 legs, failures []; answer file paths inside the receipt literally
     contain the space, e.g. `/fast/scratch/hyaku/tabi-r82/R82Exec2/scratch with space/upload-57e793848f62/tabi-r82-dir`
   - receipt: `.ufo/waves/round-82-seats/R82Exec2/receipt-space.json`
   - fixture sha256 `93dbc3cac0d222497542fd7251e51bc2821c66a3add7034b6c37d30759443858` (same as cold3)
   - counter exit 0, verdict `clean`, checkCount 64, findings []
   - scored output: `.ufo/waves/round-82-seats/R82Exec2/counter-space.json`
   - Conclusion: the driver's absolute-path handling of scratch is space-safe.

## Counter invocation (each run)
```
node scripts/check-showpicker-r82.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --receipt <abs receipt> --expect-driver-sha256 2085c2a78a2bc87208404ca6d477964ed8aa29eea52cd31b92a94fe88cc373f1 \
  --expect-nonce <nonce> --expect-fixture-sha256 <fixture sha256 of that receipt> \
  --prior-set .ufo/waves/round-82/controls/c1/prior-set.txt \
  --tree-exempt-sha256 75c3c4428fdf47baf07e486e9c7fd9b3bac1a292ed0e3441253a5398378537d4 --json
```
The `--tree-exempt-sha256` value is the sha256 of the scored evidence receipt
(`corpus/evidence/round82/chromium-showpicker/receipt.json`) — needed because
all three seat receipts live outside the two walked trees and `prior-set-complete`
otherwise flags that committed receipt as an unmatched prior. Without the exemption,
each scored run exits 1 with the single finding `prior-set-complete` naming that
file — a mechanical prior-completeness refusal, not a leg (b) refusal.

## Honest refusals
None. Zero leg (b) failures across all three runs; every frozen law check
(including the order discriminator, cross-origin color/month/week/time laws,
webkitdirectory/accept answers, and click-while-open) held on every run.

## Assignment deviation (reported, not a refusal)
The assignment named `--prior /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-82/controls/c1/probes/tabi-r82-probe2.json`,
which does not exist: `controls/c1/probes/` contains only `prior1.json` (searched
the full round-82 wave and seats trees — no `tabi-r82-probe2.json` anywhere).
Passing it yields counter exit 2 `prior-unreadable`. Scored with the frozen
committed prior set only, as above; the counter still ran its replay rule against
`prior1.json` (absMatched 0, refused false for every run).

## Cleanup
Scratch root `/fast/scratch/hyaku/tabi-r82/R82Exec2/` removed before yielding.
No tool installs (pacman guard honored; none needed). No writes outside the seat dir
and this report; no git/jj mutations.
