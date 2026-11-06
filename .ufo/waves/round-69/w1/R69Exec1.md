# R69Exec1 — C2 coverage leg (b): independent cold scored run

Verdict: **PASS** (one run, no retries). Full report: `.ufo/waves/round-69/w1/R69Exec1/report.md`.

## Pins (verified before running)
- driver `scripts/chrome-cdp-synthscroll-round69.mjs` = `13ea3f8ae67fb7761a94c4763e575c9ee487905dd9b405d916d55fca562abce3` (required) — match
- counter `scripts/check-synthscroll-r69.mjs` = `c1b3763c9781ad4cebd26d5298de46529258c4fe40b54cd2c6c62080492da795` (required) — match
- battery `scripts/negatives-synthscroll-r69.mjs` = `37e8f9627d12a229d0a24a6bcabf5fcf07d6f82caaf27d61e15d87b5b20c7f97` (freeze.txt) — match

## Executed (exactly once)
```
node scripts/chrome-cdp-synthscroll-round69.mjs \
  --scratch /fast/scratch/hyaku/tabi-r69/R69Exec1/run \
  --out .ufo/waves/round-69/w1/R69Exec1/receipt.json \
  --nonce tabi-r69-exec1-a8d7aa1f --http-port 41713 --cdp-port 41831
```
- driver exit **0**; `predicate=true`, `synthScrollHypothesis=CONFIRMED`, `degenerate=null`
- receipt sha256 `b46c7468c267b4bf467c112577507508c922de6bc4dbc3dbd7f0e45849d9a6b2`; stdout in `w1/R69Exec1/driver-stdout.json`
- legs scrollY: start 0→0, mouse 0→600, default 600→300, repeat 300→900, touch 900→900
- wheel deltaY sums: 0 / +600 / −300 / +600 / 0; all events trusted
- exactly 4 `Input.synthesizeScrollGesture` calls with frozen params, no other `Input.*`, no script scroll
- page nonce on page; fixture served as `run=tabi-r69-exec1-a8d7aa1f`
- teardown: postKillSweepCount 0, survivors [], ports closed, curl exit 7 both; sweeps 0/13/0

```
node scripts/check-synthscroll-r69.mjs \
  --receipt .ufo/waves/round-69/w1/R69Exec1/receipt.json \
  --expect-driver-sha256 13ea3f8a… --json > .ufo/waves/round-69/w1/R69Exec1/counter.json
```
- counter exit **0**, `verdict=clean`, `checkCount=63`, `findings=[]`

```
node scripts/negatives-synthscroll-r69.mjs --real .ufo/waves/round-69/w1/R69Exec1/receipt.json \
  --work /fast/scratch/hyaku/tabi-r69/R69Exec1/neg \
  --out .ufo/waves/round-69/w1/R69Exec1/negatives.json \
  --laundered …/controls/c2-degenerate/{js-scroll,dispatch-wheel,skip-touch}-receipt.json
```
- battery exit **0**: 44/44 negatives refused for their expected finding id, positive control clean
- 45 rows total = 40 targeted forgeries + wrong-pin (`driver-sha256-pin`) + 3 laundered degenerate receipts + positive
- battery recorded the pinned counter sha `c1b3763c…`

## Evidence files (in `.ufo/waves/round-69/w1/R69Exec1/`)
`receipt.json`, `counter.json`, `negatives.json`, `driver-stdout.json`, `driver-stderr.txt` (empty), `report.md`.

## Notes
- Dead fixture constants in the pinned driver (`BAND_*`, `CONTENT_*`, stale `LEG_NAMES`, `SWEEP_*`) do not
  participate in the executed legs; pin matches freeze digest, so no edit proposed. See report §Findings.
- Scratch `/fast/scratch/hyaku/tabi-r69/R69Exec1/` removed before yield; receipts copied out first.
- No git/jj mutation, no subagents, no host changes, no tool installs. User's Chromium untouched (token-bound sweeps).

## Blockers
None.
