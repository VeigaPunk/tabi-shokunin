# R80Exec2 — scoped findings: cold runs cold3/cold4 + space-scratch absolute-path leg

Frozen driver `scripts/chrome-cdp-showpicker-round80.mjs` (sha256 cb93935c017daf1ca5ae654f0992e63ad0785042ee2566619623ae8bab4b19cc), frozen counter `scripts/check-showpicker-r80.mjs`, committed prior set (sha256 ecd70ecc7c303898b817771a8b3cc473fbb1697253a277bdeb3ad49d2d4f28a6) + `--prior corpus/evidence/round80/chromium-showpicker/receipt.json`. Host: Chromium 155.0.8059.84 (`/usr/bin/chromium`), `--headless=new`.

## Per-run results

| run | nonce | driver exit | counter exit | verdict | checkCount | findings | fixture sha256 |
|---|---|---|---|---|---|---|---|
| cold3 | tabi-r80-cold3-f9ece6562c94 | 0 | 0 | clean | 57 | none (`[]`) | d6fdda416ab0aebfc9c15ed5074a4b1818fe63262c2403811195ea87646c2499 |
| cold4 | tabi-r80-cold4-f9ece6562c94 | 0 | 0 | clean | 57 | none (`[]`) | 4d74e90fe3bddda109efd22d3412be707be24592678075967698d1cb911eae84 |

- cold3: ports http/cdp/child 18966/18967/18968, scratch `/fast/scratch/hyaku/tabi-r80/R80Exec2/cold3`. Receipt: `.ufo/waves/round-80-seats/R80Exec2/receipt-cold3.json`; score: `score-cold3.json`.
- cold4 (space-scratch leg): ports 18969/18970/18971, scratch `/fast/scratch/hyaku/tabi-r80/R80Exec2/scratch with space` (contains a space). Receipt: `receipt-cold4.json`; score: `score-cold4.json`.

## Leg (b) result

- 7/7 legs per run, `failures: []` on both receipts; 57/57 counter checks true on both; **zero honest refusals** (limit block: `refused: false` for all 4 priors on both runs; `absMatched 0`, `gapMatched 0` everywhere).

## Space-path absolute-path handling (cold4)

- Driver's singleton-socket precheck accepted the spaced scratch (joined socket path 101 ≤ 107 chars); Chromium launched with profile under the spaced path.
- `DOM.setFileInputFiles` answered on backendNodeId 6 with `/fast/scratch/hyaku/tabi-r80/R80Exec2/scratch with space/upload-4040cb235c9c/tabi-r80-a.txt` (path contains a space); the input received the exact 22 bytes (upload sha256 253919d7b691c3e82b3a797550d8c12cf97211af74ef8e044d52a47f30341aa4, same as cold3) and fired trusted `input`+`change` (`sValue` `C:\fakepath\tabi-r80-a.txt`). No difference vs the unspaced cold3 path.
- All measured laws reproduced on both runs: webkitdirectory and accept=".png" open `selectSingle`; two gesture calls open two pickers; setTimeout(…,0) after the handler's own throwing call still succeeds while activation is live; child frame opens its own picker while parent `contentDocument` is null / `contentWindow.document` throws; disabled child input throws InvalidStateError without consuming activation.

## No defects found

No finding ids to report; no receiptSchema-string or file was written under `.ufo/waves/round-80/` or `corpus/evidence/round80/` by this seat (JSON artifacts live only in `.ufo/waves/round-80-seats/R80Exec2/`). Scratch root `/fast/scratch/hyaku/tabi-r80/R80Exec2/` deleted after receipts/scores were secured in the seat dir.

## Tooling installs

None (no new tools needed; no pacman use).
