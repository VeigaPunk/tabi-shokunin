# R93Exec1 — C1 cold reproduction (wave w1)

## Commands & exit codes
```
node scripts/check-cross-session-answer-round93.mjs --lane TABI --expect-driver-sha256 a0deddda855a... --live --scratch /fast/scratch/hyaku/tabi-r93/R93Exec1/run1 --ports 19401,19402,19403 --json   → exit 0
node scripts/check-cross-session-answer-round93.mjs --lane TABI --expect-driver-sha256 a0deddda855a... --live --scratch /fast/scratch/hyaku/tabi-r93/R93Exec1/run2 --ports 19404,19405,19406 --json   → exit 0
node scripts/negatives-cross-session-answer-round93.mjs --lane TABI --receipt w1/R93Exec1-run1-receipt.json --expect-nonce tabi-r93-live-19858f8344ad --expect-driver-sha256 a0deddda855a... --scratch /fast/scratch/hyaku/tabi-r93/R93Exec1/neg --json > w1/R93Exec1-battery.json   → exit 0
```
(Lane = `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Driver pin matched in both runs, so counter did not reject.)

## Verdicts / checkCount
- run1: verdict `clean`, checkCount 101, findings [] — nonce `tabi-r93-live-19858f8344ad`, revision bf0bd62299c2... driverRun status 0, legs 6, failures 0
- run2: verdict `clean`, checkCount 101, findings [] — nonce `tabi-r93-live-30f053ab2404`, identical shape
- battery: ok 65 / cases 65, failed [] (all 65 negatives pass)

## Per-leg fields (jq extract)
Cross-site arm (X, all 3 reps, both runs):
- `describePage.nodeName` = `#document`, `describePage.error` = null
- `describeChooser.nodeName` = `INPUT` (iframe session) — B is the INPUT on iframe session
- `pagePierceInputS` = 0
- `crossAnswer.error` = `Node is not a file input element` (page session)
- `filesAfterCross` = [] (no file delivered)
- `childFiles` = `[["tabi-r93-answer.txt", 22]]` after iframe-session answer (answer.session=iframe, error=null)

Same-site arm (S, all 3 reps, both runs):
- `describePage.nodeName` = `INPUT`, `pagePierceInputS` = 1, `childFiles` = `[["tabi-r93-answer.txt", 22]]`

## Cleanup
- Ports 19403/19406: no chromium processes remain (`pgrep` empty after runs).
- Scratch `/fast/scratch/hyaku/tabi-r93/R93Exec1` removed before yield; receipts copied to w1.

VERDICT C1: neutral — .ufo/waves/round-93/w1/R93Exec1-run1-receipt.json
