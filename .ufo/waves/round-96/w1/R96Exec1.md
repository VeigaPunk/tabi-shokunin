# R96Exec1 — C1 cold reproduction (round 96, w1)

Seat: R96Exec1. L1 TabiR96 sole integration owner. Base b16b3aa1, freeze
ba611b22, scored 75fe36dc (verdict clean, 165 checks, 0 findings, nonce
tabi-r96-live-c1225d318ea6). Godspeed seat; executed the assigned move only.

## Tooling installed (recorded per tooling authorization)
- Client deps: npm registry → /fast/scratch/hyaku/tabi-r96/R96Exec1/deps
  (`npm init -y && npm install --no-audit --no-fund puppeteer-core@25.16.0
  playwright-core@1.65.0`), rc=0, 26 packages. Installed versions confirmed:
  puppeteer-core 25.16.0, playwright-core 1.65.0.
- No pacman (paused host-wide; none attempted). No installs elsewhere.

## Cold reproduction — run1 (rc=0)
Command (exit 0, 45.3s):
`node scripts/check-client-oopif-chooser-round96.mjs --lane <lane> --expect-driver-sha256 4020e57ef865e5eed506796238bb981bb4dbcb226e8fe80eb52728585ce63b91 --live --deps /fast/scratch/hyaku/tabi-r96/R96Exec1/deps --scratch /fast/scratch/hyaku/tabi-r96/R96Exec1/run1 --ports 32611,32612,32613 --json`
- verdict `clean`, checkCount 165, findings [], nonce tabi-r96-live-cb755efec541,
  driverRun status 0, driverSha256 as pinned, revision 75fe36dc.
- outcomes: timeout [PPX-1, PPW-1, PPX-2, PPW-2, PPX-3, PPW-3];
  chooser [PPS-1, PWX-1, PWS-1, PPS-2, PWX-2, PWS-2, PPS-3, PWX-3, PWS-3].
- Receipt sha256 cd94ad1af72518bacc40d8b6e002f7bdffb27680fb05c768e20208b03e6c006d.
- Saved: R96Exec1-run1.json + R96Exec1-run1-receipt.json (this directory).

## Cold reproduction — run2 (rc=0)
Same command with `--scratch .../run2`, `--ports 32611,32612,32613` (exit 0, 45.1s):
- verdict `clean`, checkCount 165, findings [], nonce tabi-r96-live-f8438bc04c24,
  driverRun status 0.
- outcomes identical: 6 Puppeteer cross-site timeouts (PPX/PPW), 9 choosers
  (PPS/PWX/PWS).
- Receipt sha256 1c75fa40715f722f46fd5985c21eb4f924b76a85c90694541e136945fc57c52e.
- Saved: R96Exec1-run2.json + R96Exec1-run2-receipt.json (this directory).

## Battery on run1 receipt (rc=0)
Command (exit 0):
`node scripts/negatives-client-oopif-chooser-round96.mjs --lane <lane> --receipt <W1>/R96Exec1-run1-receipt.json --expect-nonce tabi-r96-live-cb755efec541 --expect-driver-sha256 4020e57ef865e5eed506796238bb981bb4dbcb226e8fe80eb52728585ce63b91 --scratch .../bat --json > <W1>/R96Exec1-battery.json`
- battery `tabi-r96-client-oopif-chooser-negatives`: cases 63, ok 63, failed [].
- positive rc 0; all 62 negatives rc 1 with the expected finding ids verbatim
  (e.g. ppx-chooser-claimed→pp-timeout, ppx-child-filled→child-files,
  ppw-no-chooser-opened→witness, pwx-timeout→chooser, frames→frames,
  lib-*→libs, browser-*→browser, leg-*→leg-set/leg-label, failures→failures,
  producer-pass-ignored→pp-timeout). Full list in R96Exec1-battery.json.

## Fresh npm install vs pinned libs (counter `libs` check)
Run1 receipt `libs` (exact): puppeteer-core 25.16.0, integrity
sha512-VA5Pf54N8shfopNkZZXCdiiwfnnY8ZJYAMqFQRhlH5mGUhfwf53Ar770GPtdpTDLUqvQeYpIBtC9/G2Jij2IJw==,
file lib/puppeteer/cdp/Page.js, fileSha256 31a522df2d59bba82e92a8e057238c9a1fc009a708e5b269b87ed29c3e07e7a0;
playwright-core 1.65.0, integrity sha512-vNSKgH6YqtN7cdT/L334zo0a+YwkrpicyrHJlWWPIm/Q+Nn2SWInil01oT0mbu96U4GgoRtCYQD9CzJQgju+lA==,
file lib/coreBundle.js, fileSha256 4ef8330594818d8f464de939e32bca62b758099e0d0e94a56095406da963f7f1.
All match claims.json libraries exactly; the counter's `libs` check passed on
both live runs (no `libs` finding). Receipt identity also: chromium contains
155.0.8059.84, crossHost localhost, reps 3, timeoutMs 3000, answer
{tabi-r96-answer.txt,22}, ports {32611,32612,32613}, 15 legs PPX-1..PWS-3 in
order, driver-exit + ports-bound green.

## Evidence files (this directory, relative to lane)
- R96Exec1-run1.json, R96Exec1-run1-receipt.json, R96Exec1-run2.json,
  R96Exec1-run2-receipt.json, R96Exec1-battery.json.

## Hygiene / blockers / risks
- `pgrep -f remote-debugging-port=32613` empty after each run; no chromium left.
- Scratch /fast/scratch/hyaku/tabi-r96/R96Exec1/ removed after copying receipts.
- No lane files edited outside w1/; no git/jj mutation; no subagents; no commits.
- No setup/port/host-resource failures encountered; both runs completed normally.
- Risk: none observed. Confirm no reading of Frozen claim text was needed beyond
  plans/round-96.md §Claim + §Declared limits 1-6 (read in full, see target quote).

VERDICT C1: neutral
