# Seat R95Exec1 — C1 cold reproduction (twice) + battery

## Instruments pinned (pre-run sha256 verify)
```
b7b464da…27385  scripts/check-backendnode-misdelivery-round95.mjs      (counter: MATCH)
1a670da5…0f5075abf0  scripts/negatives-backendnode-misdelivery-round95.mjs  (battery: MATCH)
24947b00…82x2ee82  scripts/chrome-cdp-backendnode-misdelivery-round95.mjs (driver: MATCH)
```
All three equal the frozen pins in the assignment and in `.ufo/waves/round-95/claims.json`
(`instruments`: driver 24947b00…, counter b7b464da…, battery 1a670da5…). Scored reference:
`.ufo/waves/round-95/scored/c1-live.json` verdict `clean`, 336 checks, 0 findings, nonce
`tabi-r95-live-36ad06703d0b`, rc 0.

Frozen claim read first: `plans/round-95.md` §Claim + §Declared limits 1–6. Leg-level
statements tested cold, twice, with the exact frozen counting command.

## Commands run (verbatim, exit codes)
```
# run1
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-backendnode-misdelivery-round95.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --expect-driver-sha256 24947b00d8a158ad3fea8f5fb035757b6b98aebf48e85d18d506433619e2ee82 \
  --live --scratch /fast/scratch/hyaku/tabi-r95/R95Exec1/run1 --ports 32011,32012,32013 --json
# exit 0 — clean, 336 checks, 0 findings, nonce tabi-r95-live-6290c709f2d6
# receipt: /fast/scratch/hyaku/tabi-r95/R95Exec1/run1/receipt-Rh34PG/live-receipt-3cf9533e44b3.json

# run2 (same command, --scratch .../run2)
# exit 0 — clean, 336 checks, 0 findings, nonce tabi-r95-live-66192e9a43c3
# receipt: /fast/scratch/hyaku/tabi-r95/R95Exec1/run2/receipt-qht9wf/live-receipt-6794aab2096e.json

# battery on run1 receipt
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/negatives-backendnode-misdelivery-round95.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --receipt /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-95/w1/R95Exec1-run1-receipt.json \
  --expect-nonce tabi-r95-live-6290c709f2d6 \
  --expect-driver-sha256 24947b00d8a158ad3fea8f5fb035757b6b98aebf48e85d18d506433619e2ee82 \
  --scratch /fast/scratch/hyaku/tabi-r95/R95Exec1/bat --json
# exit 0 — cases 77, ok 77, 0 failures
```

## Artifacts (lane-relative, all under `.ufo/waves/round-95/w1/`)
- `R95Exec1-run1.json` (counter output, run1) + `R95Exec1-run1-receipt.json` (driver receipt copy)
- `R95Exec1-run2.json` (counter output, run2) + `R95Exec1-run2-receipt.json` (driver receipt copy)
- `R95Exec1-battery.json` (battery output: 77 cases, 77 ok)
- Verdicts: `jq -r '.verdict, .checkCount, (.findings|length)'` → `clean / 336 / 0` on both runs;
  `.findings` is `[]` verbatim on both — no law finding, no setup failure (no `setup` verdict anywhere).

## Run1 per-leg B / snapshot node T / page describe / cross answer (jq on run1 receipt)
- `P286-1/-2/-3`: B=302, T=`INPUT,type=file,id=p3`, describePage ok, crossErr `null`,
  parent `p3` filled `[["tabi-r95-answer.txt",22]]`, child after-cross `[]` → **misdelivery 3/3**
- `P289-2`: B=302, T=`INPUT,type=file,id=p2`, crossErr `null`, `p2` filled → **misdelivery 4th**
- `P287-{1,2,3}, P288-{1,2,3}`: B=302, T=`#text` nodeType 3, crossErr
  `Node is not a file input element`, all parent inputs `[]`, child after-cross `[]` → **collision**
- `P289-1/-3`: B=302, T=shadow `INPUT,type=button,id=file-upload-button` (UA file-upload button),
  crossErr `Node is not a file input element`, no fill → **collision** (matches S235 theory:
  consecutive file inputs 4 ids apart; B=302 lands on a neighbouring shadow button/text node)
- `Z-1/-2/-3`: B=302, T absent (`atB=[]`), describe+cross both error
  `No node found for given backend id`, all inputs `[]`, no fill → **miss** (claim: Z legs have no T ✓)
- `S-1/-2` (B=616), `S-3` (B=617): T=`INPUT,type=file,id=s`, page describe = child `#s`,
  no cross answer, final child `#s` filled → **same-site resolves to child INPUT#s** ✓

Branches (counter's own `.branches`): misdelivery `[P286-1,P286-2,P289-2,P286-3]` (4),
collision `[P287-1,P288-1,P289-1,P287-2,P288-2,P287-3,P288-3,P289-3]` (8), miss `[Z-1,Z-2,Z-3]` (3).
"At least one P misdelivers AND at least one P collides" satisfied by every rep-set in both runs
(run2: 4 misdelivery / 8 collision / 3 miss, identical split).

Driver-order note (limitation-safe): the driver's `childFiles` field is recorded AFTER the
correct-session answer (driver line 276, after line 273 `leg.answer`); the frozen claim's
"child `#s` holds `[]`" is checked by the counter against `filesAfterCross` (recorded between
the cross answer and the correct answer, driver line 270) — all P legs show `filesAfterCross == []`
with final `childFiles == [[answer,22]]`. No contradiction; the two fields are ordered so.
`#s`-stays-empty-during-misdelivery therefore holds as worded.

## Findings, risks, blockers
- No findings on either run; no clause failed; nothing to classify law-vs-setup.
- Limitation 3 respected: WHICH P leg misdelivers is NOT claimed (id jitter ±1);
  observed jitter exactly as declared (P286 3/3 + P289 1/3 this time; pre-freeze probes saw
  P286 3/3 / P286 1 + P289 2). Neutral to verdict either way.
- No tool installs needed; no pacman/sudo touched (per host-wide pause). Ports 32011-32013 only;
  `pgrep -f remote-debugging-port=3201[123]` empty before this report; scratch removed after copy.

VERDICT C1: neutral
