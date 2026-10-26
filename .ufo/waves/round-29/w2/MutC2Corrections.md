# MutC2Corrections — mutation-test of the C2 corrections (round-29 w2, attacks C2)

Seat: MutC2Corrections (leaf, no subagents). Detector: frozen counter
`scripts/check-selfassessment.mjs` (sha256 `728128008e2242b635bda30a28313de20b06d381d7855f11f18fa5043ba560c4`,
byte-identical to the frozen-counter sha in `.ufo/waves/round-29/claims.json` C2), invoked as
`node <clone>/scripts/check-selfassessment.mjs --repo <clone> --rev HEAD --json` with
`TMPDIR=$S/tmp`. No tools installed (none needed).

## Setup
- Scratch: `$HYAKU_SCRATCH/tabi-r29/MutC2Corrections/` (`/fast/scratch/hyaku/tabi-r29/MutC2Corrections`), receipts in `receipts/`, temp in `tmp/`.
- Fixture: `git clone --shared` of lane tip `32008a453737a27f69e9ab401d0b9775d2a944f7`, detached HEAD, `git rev-parse --show-toplevel` verified equal to the clone dir before every commit; every git call used `-C <clone>`. Pre-mutation tree: `ac2310e8c21cfa1c46f9b86cefbe9941b86df832`; `git status --porcelain` empty.
- Pristine run (before any mutation): exit=0, `mismatches=0`, `superseded=12` — the six C2 stale tallies (SCORECARD.md:410, :1138, :1139, :1151, :1439, LOG.md:221) all `superseded=true` (`receipts/pristine.json`).

## Method
One correction attacked per mutant: edit the correction text in the clone, commit there, run the frozen counter, record `mismatches`/`counted`, then `git reset --hard 32008a45` and confirm porcelain 0. "Counted again" = the stale finding the correction was supposed to clear reappears in `counted` (mismatches > 0, exit 1). All counter runs executed only lane gate self-tests via the frozen counter's own spawn logic.

## Mutant table

| # | Mutant (one correction each) | Edit | Expected | mismatches | counted again (line: claimed vs observed) | exit | Verdict |
|---|---|---|---|---|---|---|---|
| M1 | cite the other document | SCORECARD.md:1463 `SCORECARD.md:410` → `LOG.md:410` | 410 recount | 1 | SCORECARD.md:410 (25 vs 26) | 1 | killed |
| M2 | off-by-one line (below) | LOG.md:2007 `LOG.md:221` → `LOG.md:220` | 221 recount | 1 | LOG.md:221 (8 vs 12) | 1 | killed |
| M3 | stale number instead of observed | LOG.md:2008 `cases: 12` → `cases: 8` | 221 recount | 1 | LOG.md:221 (8 vs 12) | 1 | killed |
| M4 | drop the script name | SCORECARD.md:1463 remove `` `scripts/check-sources.mjs` `` | 410 recount | 1 | SCORECARD.md:410 (25 vs 26) | 1 | killed |
| M5 | drop the correction word | SCORECARD.md:1464 `correction — supersedes` → `note — mentions` (citation kept) | 1138/1139/1151 recount | 3 | SCORECARD.md:1138, :1139, :1151 (12 vs 13 each) | 1 | killed |
| M6 | move the LOG correction above LOG.md:221 | paragraph 2007-2008 relocated to 220-221 (above the stale line; stale line shifts 221→225) | 221 recount | 6 | LOG.md:225 (8 vs 12) **plus** :339, :395, :1094, :1107, :1668 (see finding below) | 1 | killed |
| M7 | off-by-one line (above) | SCORECARD.md:1463 `SCORECARD.md:410` → `SCORECARD.md:409` | 410 recount | 1 | SCORECARD.md:410 (25 vs 26) | 1 | killed |
| M8 | range end truncated | SCORECARD.md:1464 `1138-1139` → `1138-1138` | 1139 recount, 1138 still cleared | 1 | SCORECARD.md:1139 (12 vs 13); 1138 stayed cleared | 1 | killed |

Per-mutant counter JSON: `receipts/m1-crossdoc.json`, `m2-offbyone.json`, `m3-stalenum.json`, `m4-noscript.json`, `m5-nomarker.json`, `m6-above.json`, `m7-offbyone-above.json`, `m8-rangeend.json` (under `/fast/scratch/hyaku/tabi-r29/MutC2Corrections/`). Mutant tree hashes: M1 `d85789ef…`, M2 `69b63bec…`, M3 `6e21f268…`, M4 `33585fb9…`, M5 `a18ab5cb…`, M6 `ad96d367…`, M7 `89bd67f1…`, M8 `d0d12c8e…`.

## Commands (representative; identical shape per mutant, all run, exit codes pasted)
```
test "$(git -C "$C" rev-parse --show-toplevel)" = "$C" || exit 9   # ok every time
git -C "$C" add -A && git -C "$C" commit -q -m "Mx …"              # ok every time
TMPDIR="$S/tmp" node "$C/scripts/check-selfassessment.mjs" --repo "$C" --rev HEAD --json > "$S/receipts/mx.json"; echo "exit=$?"
  → pristine exit=0; M1..M8 exit=1
git -C "$C" reset -q --hard 32008a453737a27f69e9ab401d0b9775d2a944f7 && git -C "$C" status --porcelain | wc -l
  → 0 every time
```

## Restoration evidence
- After M8: `git reset --hard 32008a45` → HEAD `32008a4` ("round-29: S094 404 nonce normalisation…"), tree `ac2310e8c21cfa1c46f9b86cefbe9941b86df832` = pre-mutation tree, porcelain 0.
- Restored-bytes detector run (`receipts/restored.json`): exit=0, `mismatches=0`, `superseded=12`, `clean=true` — identical to pristine.
- sha256 of restored docs: SCORECARD.md `3fc146df8e6e1ce359f7cc1578e3db119cb651931ac423d039653374bb299fc6`, LOG.md `b64c7ab11716499612c530bccf144697ce6e319b0f6aaf9c2e50a7807bea06c9`.

## Findings
1. **All 8 mutants killed.** Every required guard of the doc-bound matcher is load-bearing: document name (M1), exact line/range containment (M2, M7, M8), oracle-correct number via a tally shape (M3), script name (M4), correction marker (M5), and later-paragraph ordering (M6). No mutant made the counter false-clear a stale tally; every mismatch reappearance was the matching stale line, not collateral.
2. **Coverage finding (from M6, not a defect in the counter):** the correction mechanism is line-number-fragile. Inserting 4 lines above LOG.md:221 shifted every later stale tally by +4, so the round-28 corrections' absolute citations (`LOG.md:335`, `:391`, `:1090`, `:1103`, `:1664` at LOG.md:1853-1924) no longer contained the moved lines — five unrelated corrections went mechanically dead and the counter correctly counted all six LOG-window stale tallies (mismatches=6). The counter stays sound (it counts more, never false-clears), but any future edit that inserts lines above a corrected stale line silently regresses C2 to 6 without any counter bug. Corrections citing absolute line numbers are only stable while nothing is inserted above them; a range- or content-anchored citation would survive drift. Recorded as a coverage observation only — no contract change proposed, per mutation-tester bounds.
3. M3 note: the mutated correction paragraph's own tally line became `could-not-evaluate` (ambiguous script association in the multi-script round-29 section), so the stale-number mutant produced exactly 1 mismatch, not 2 — the counter does not double-count a self-inconsistent correction in that section shape.
