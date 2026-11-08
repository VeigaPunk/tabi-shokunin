# R92Exec1 — C1 cold reproduction (w1)

## Commands and exit codes

| command | rc |
|---|---|
| `sha256sum -c .ufo/waves/round-92/controls/instrument-sha256.txt` (from lane) | 0 — all three instruments OK |
| run1 live: `node scripts/check-iframe-chooser-round92.mjs --lane <lane> --expect-driver-sha256 <pin> --live --scratch /fast/scratch/hyaku/tabi-r92/R92Exec1/run1 --ports 19101,19102,19103 --json` | 0 |
| run2 live: same with `--scratch …/R92Exec1/run2 --ports 19104,19105,19106` | 0 |
| battery: `node scripts/negatives-iframe-chooser-round92.mjs --lane <lane> --receipt .ufo/waves/round-92/w1/R92Exec1-run1-receipt.json --expect-nonce <run1 nonce> --expect-driver-sha256 <pin> --scratch …/R92Exec1/neg --json > .ufo/waves/round-92/w1/R92Exec1-battery.json` | 0 |
| `pgrep -f "remote-debugging-port=19103"` / `…19106` | 1 (no chromium left) |

Pin used everywhere: `0feca90ba0272d92d3444d1b23bf0e85a089946408fe52e383e8ddf740321688`.

## Results

- run1 (`R92Exec1-run1.json`, receipt `R92Exec1-run1-receipt.json`): verdict `clean`, checkCount 93, findings `[]`, nonce `tabi-r92-live-fa8553266a83`, revision `4fe08d26…`.
- run2 (`R92Exec1-run2.json`, receipt `R92Exec1-run2-receipt.json`): verdict `clean`, checkCount 93, findings `[]`, nonce `tabi-r92-live-99dc3b0a24ac`, revision `4fe08d26…`.
- Battery (`R92Exec1-battery.json`): 31/31 ok, 0 failed; positive case rc 0 with no ids; all 30 mutants killed with the expected finding ids.
- Scratch `/fast/scratch/hyaku/tabi-r92/R92Exec1` removed before yield; no chromium processes remain on ports 19103/19106; no commits; no edits outside the w1 report/JSON paths.

## Verdict

`VERDICT C1: neutral` — both cold live reproductions on the frozen counter return exit 0, `verdict: clean`, 93 checks, 0 findings, matching the scored run's shape; the frozen battery kills 31/31 on the run1 receipt. Nothing in these artifacts shows the frozen wording false or wider than the counter enforces. Evidence: `.ufo/waves/round-92/w1/R92Exec1-run1.json`, `.ufo/waves/round-92/w1/R92Exec1-run2.json`, `.ufo/waves/round-92/w1/R92Exec1-battery.json`.
