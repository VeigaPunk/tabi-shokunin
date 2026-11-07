# R80Exec2 report — two additional cold runs, one under a scratch path containing a space

## What ran

Two fresh cold runs of the frozen r78-template-plus-patches driver (`scripts/chrome-cdp-showpicker-round80.mjs`, pinned sha256 cb93935c017daf1ca5ae654f0992e63ad0785042ee2566619623ae8bab4b19cc, matching freeze.txt and the `--expect-driver-sha256` pin), each with one fresh Chromium 155.0.8059.84 (`--headless=new`) per leg, 7 legs, distinct port triads:

- **cold3** — nonce `tabi-r80-cold3-f9ece6562c94`, ports 18966/18967/18968, scratch `/fast/scratch/hyaku/tabi-r80/R80Exec2/cold3`.
- **cold4** — nonce `tabi-r80-cold4-f9ece6562c94`, ports 18969/18970/18971, scratch `/fast/scratch/hyaku/tabi-r80/R80Exec2/scratch with space` (the absolute-path/space test).

Both receipts were written directly into the seat dir; both were scored with the frozen counter using the committed prior set (sha ecd70ecc…) plus `--prior` on the L1 receipt. Scoring JSONs persisted next to the receipts.

## Results

| run | driver exit | counter exit | verdict | checkCount | findings | fixture sha256 |
|---|---|---|---|---|---|---|
| cold3 | 0 | 0 | clean | 57 | `[]` | `d6fdda416ab0aebfc9c15ed5074a4b1818fe63262c2403811195ea87646c2499` |
| cold4 | 0 | 0 | clean | 57 | `[]` | `4d74e90fe3bddda109efd22d3412be707be24592678075967698d1cb911eae84` |

Every measured law the counter binds reproduced identically on both runs: `webkitdirectory` and `accept=".png"` each open a `selectSingle` chooser; two `Runtime.evaluate {userGesture:true}` calls both succeed with two `Page.fileChooserOpened` events (no already-open guard); the deferred `setTimeout(…,0)` call succeeds while activation is live (and the handler's own throwing call on the disabled input still leaves the activation usable); the cross-origin child opens its own picker with no SecurityError while the parent cannot reach the child document; the disabled child input throws InvalidStateError without consuming activation; the answered trigger delivers the exact 22-byte upload with trusted `input`+`change`.

**Leg (b) contribution: zero honest refusals.** The counter's replay/limit block shows `refused: false` for all four priors on both receipts with `absMatched 0` / `gapMatched 0`, and `findings` empty. These two runs give the round two more committed-candidate cold receipts beyond cold1/cold2.

## Space-scratch observations (the milestone's absolute-path test)

The only behavioral difference cold4 vs cold3 is where bytes live, and the driver + browser handled it cleanly end-to-end:

- The driver's own precheck computed the Chromium singleton socket path under the spaced scratch at 101 chars (≤ 107 limit) and proceeded.
- `DOM.setFileInputFiles` was answered with `…/scratch with space/upload-4040cb235c9c/tabi-r80-a.txt`; the input's state shows the same file name, 22-byte size, MIME `text/plain`, sha256 `253919d7b691c3e82b3a797550d8c12cf97211af74ef8e044d52a47f30341aa4` as cold3, with `C:\fakepath\tabi-r80-a.txt` — i.e. Chromium accepted the spaced absolute path without escaping issues.

## Artifacts

- Receipts: `.ufo/waves/round-80-seats/R80Exec2/receipt-cold3.json`, `receipt-cold4.json`
- Scores: `.ufo/waves/round-80-seats/R80Exec2/score-cold3.json`, `score-cold4.json`
- Scoped findings: `.ufo/waves/round-80/w1/R80Exec2.md`

## Hygiene

No writes into `.ufo/waves/round-80/` (except this report + the findings file, no JSON/receipt/schema-string content), none into `corpus/evidence/round80/`. Scratch root `/fast/scratch/hyaku/tabi-r80/R80Exec2/` removed after receipts/scores were secured in the seat dir. No git/jj mutations, no subagent dispatch, no tool installs (none needed; pacman untouched).
