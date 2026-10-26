# MutC1Rows — mutation test of the four new map rows and the screen ledger (round 33, wave 2, C1)

## Verdict

**holds.** Against the four new map rows (`corpus/adjacency.tsv` rows 12–15, all split-declared kake rows) and the screen ledger (`corpus/adjacency-screen.tsv`, 43 rows) at `042d6d9abf97d567d495652a85eabc851b81adc1`, 17 single mutants covering all nine requested mutation classes were committed one at a time in a scratch clone and evaluated with both frozen instruments: `scripts/check-adjacency.mjs` (digest `4e2c2a64…24aac`, pinned inside the counter) and the frozen counter `.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs` (digest `da59d157…c6380`, byte-identical to `frozenDigests` in claims.json). 13 of 17 mutants are killed outright (gate finding or counter predicate false), 1 is detected-but-not-fatal, and 2 survive — all three non-kills are narrow, low-severity instrument-coverage findings, none of which lets a non-overlap become accounted or a real overlap go unaccounted: the two survivors are quote *truncations that remain verbatim substrings* of the cited line (a documented substring-semantics limit, check-adjacency.mjs:50-51), and the third is a duplicate screen row the counter reports in `screenFindings` but the frozen predicate ignores. No defect found in the rows or ledger themselves; the layering the frozen feasibility disclosure describes (counter judges structure and naming, wave 2 + closure spot-check judge semantics) is exactly what the mutants show.

## Setup

- Scratch: `/fast/scratch/hyaku/tabi-r33/MutC1Rows` (deleted before this report was written; receipts copied first).
- Clone: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"`; `git checkout -q --detach 042d6d9abf97d567d495652a85eabc851b81adc1`; `git status --porcelain` = 0 lines.
- Frozen counter extracted from the freeze commit: `git -C <lane> show e6b0a9074d434ccc307badd312ae7379d1193fea:.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs` → sha256 `da59d157c29ce53781fcfb6159149504a185b890d923efc6eecfe22d4b2c6380` (matches claims.json `frozenDigests`).
- `scripts/check-adjacency.mjs` at REV: sha256 `4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac` (matches the digest pinned inside the counter).
- Both instruments read git objects only at `--rev`, so each mutant was **committed** in the scratch clone (`git -c user.name=MutC1Rows -c user.email=MutC1Rows@scratch.local commit`) and evaluated at its own 40-hex rev; after each run the tree was restored with `git reset -q --hard 042d6d9a…` and the file hashes re-verified.

## Pristine baseline at 042d6d9a… (both green)

```
node $S/counter/c1-adjacency-sweep.mjs --rev 042d6d9a… --repo $S/clone --fleet /home/vgpnk/Projects/shokunin --json   # exit 0
  {"predicate":true, adjacency clean 14/14, candidates 52, mapped 9, screened 43, unaccounted 0, newMapped 4}
node scripts/check-adjacency.mjs --at 042d6d9a… --repo $S/clone --fleet /home/vgpnk/Projects/shokunin --json          # exit 0
  {"verdict":"clean","rows":14,"verified":14,"selfRulings":[2]}
```
Pristine hashes: `corpus/adjacency.tsv` = `da1207ae6e2943fd7a2fcd3e377cb99a6f8bc459b35c804975e9ceb93dd96ea1`, `corpus/adjacency-screen.tsv` = `a3ed0ad08f23566cbeea664a10c1fe5e0754aeb801eadab873556118e56950e1`; tree `0656254725773b808def1f98c90062f6f816dd64`.

## Per-mutant procedure (identical for every mutant)

```
edit one field in corpus/adjacency.tsv or corpus/adjacency-screen.tsv (single edit, working tree)
git add -A && git -c user.name=MutC1Rows -c user.email=MutC1Rows@scratch.local commit -q -m "<mutant>"
node scripts/check-adjacency.mjs --at <MUT> --repo $S/clone --fleet /home/vgpnk/Projects/shokunin --json   # gate
node $S/counter/c1-adjacency-sweep.mjs --rev <MUT> --repo $S/clone --fleet /home/vgpnk/Projects/shokunin --json  # counter
git reset -q --hard 042d6d9a… && sha256sum corpus/adjacency.tsv corpus/adjacency-screen.tsv  # must equal pristine hashes
```
Every run's full JSON is in `receipts/`; every mutant's diff is in `mutant-diffs/`.

## Results (17 mutants)

| mutant | commit | class | gate | counter | verdict |
|---|---|---|---|---|---|
| m1a | `63eb6826550c0dd009428eadcafd2ca6a40519ef` | row 12 sibling_quote one word off (`stays`→`remains`) | exit 1 `sibling_quote_absent` | exit 1 predicate false (unaccounted 4, newMapped 3) | **KILLED** |
| m1b | `e5b3aa432f7b5ae30b4987145a90a5cd06ef67aa` | row 12 sibling_quote truncated (`tabi's`→`tabi`, still a substring) | exit 0 clean | exit 0 predicate true | **SURVIVED** |
| m2 | `d70521b9dcbb0825d3a6bf2d6f1f9486958f1bf2` | row 14 sibling_ref line +1 (:79→:80) | exit 1 `sibling_quote_absent` | exit 1 predicate false (unaccounted 1: kake:79) | **KILLED** |
| m3 | `379b21bca691533b3f64918d6251e44d633190a2` | row 12 sibling pin → older kake commit `7c61c8cc…` (48-line PROVINCE.md) | exit 1 `sibling_unresolved` | exit 1 predicate false | **KILLED** |
| m4 | `8af9df2790c1637a74a1cd337234457af6a577ae` | row 13 disposition → contested-open, ruling_ref `-` | exit 1 `ruling_ref_invalid` | exit 1 predicate false | **KILLED** |
| m4b | `4ad2ba485b823eefe02902e45f27531a80353a9e` | row 13 → contested-open citing fleet l0 :65 (scope row about revenger/kama) | exit 0 clean | exit 0 predicate true | **SURVIVED** (probe partially invalid — see below) |
| m4b2 | `a7c007d658ce122990c18e678ce7ab5cd2f3ca60` | row 13 → contested-open citing fleet l0 :34 (tabi round-1 row, kake-free) | exit 1 `l0_line_absent` | exit 1 predicate false | **KILLED** |
| m5 | `1d0a7a60505434e7ca19f5592c65b71ad1f0c35e` | row 13 sibling_quote → verified substring naming neither side | exit 0 clean | exit 1 predicate false (newMapped 3) | **KILLED** (by counter) |
| m6 | `91ffa91cc915df0c5dcdb5642e88967e2c9f4852` | row 15 surface duplicated onto row 12's surface (same sibling) | exit 1 `duplicate_row` | exit 1 predicate false | **KILLED** |
| m7 | `88253870c92d3253c654b1f7e06ece42eb0f4b37` | screen kake:302 reason typo (`same-surface`→`same-surfac`) | exit 0 clean | exit 1 predicate false (`screen-reason-unknown`, unaccounted 1) | **KILLED** (by counter) |
| m8 | `ec1a44bc71767e6703ad2a8ca0bd9017dd203030` | screen kagi:20 surface → kaidoku's surface `cdp-runtime-observation` | exit 0 clean | exit 1 predicate false (`screen-surface-unmapped`, unaccounted 1) | **KILLED** (by counter) |
| m9 | `63283438083311c6a1676393f73309bb98555243` | delete screen row kagi:59 | exit 0 clean | exit 1 predicate false (unaccounted 1) | **KILLED** (by counter) |
| m10 | `0746ce1672a01f091e7ec54f39a30c26894200e4` | screen kengaku:54 quote truncated (`outages`→`outage`, still a substring) | exit 0 clean | exit 0 predicate true | **SURVIVED** |
| m10b | `5c6e62a3d5aae1950431e1cd58a9f64a4840c74b` | screen kengaku:54 quote one word off breaking substring (`journal`→`jurnal`) | exit 0 clean | exit 1 predicate false (`screen-quote`, unaccounted 1) | **KILLED** (by counter) |
| m11 | `6bb26af3a6bff8a0ee3bb7302ac06c21cd467514` | row 15 tabi_ref line −1 (SKILL.md:2890→:2889) | exit 1 `tabi_quote_absent` | exit 1 predicate false | **KILLED** |
| m12 | `ace2eb0373d1854f606585c77668432861bca50e` | row 15 tabi_quote → verified substring without `kake` | exit 0 clean | exit 1 predicate false (newMapped 3) | **KILLED** (by counter) |
| m13 | `6d17cc22abe84a9923e261718d27d529c1cc0be1` | duplicate screen row (kagi:20 twice) | exit 0 clean | exit 0 predicate true, `screenFindings:[screen-duplicate row 3]` | **DETECTED-NOT-FATAL** |

## Survivor analysis (the three non-kills)

1. **m1b / m10 — quote truncation that stays a substring survives both instruments.** The gate checks `line.text.includes(quote)` (scripts/check-adjacency.mjs:729-731) and the counter checks `c.text.includes(quote)` for screens (counter:202); a quote shortened *within* the cited line ("browser execution stays tabi's" → "…stays tabi"; "scraper outages" → "scraper outage") still passes word/char minima (4 words, 25 non-space chars) and both instruments stay green, predicate true. This is the documented substring semantics (check-adjacency.mjs:50-51: "quotes are matched as verbatim substrings after that trim"), so it is a coverage finding, not a rule violation: quote *fidelity* (completeness) is unenforced. It cannot manufacture or hide overlap accounting — `mapped` keys on the cited line's full text (counter:185-192), not the quote, and the naming regex still matched here (`/\btabi\b/` matches "tabi"). Severity: low.
2. **m4b — contested-open l0 check is token-anywhere, not aboutness.** The gate requires the cited `tabi | round-<N> |` l0 row to "name the sibling lane", implemented as `line.text.includes(sibling)` (check-adjacency.mjs:919-920). Fleet l0 line 65 at `b6b3b5e4…` (the round-17 CDP-ruling-scope row) mentions `kake` exactly once, incidentally ("kama routes the tab/target set to kake" — verified `grep -c kake` = 1 on that line), so a kake contested-open row citing that unrelated scope row passes both instruments. My probe was therefore only partially valid: the gate's documented rule *is* satisfied. The valid wrong-sibling probe (m4b2, citing the kake-free tabi round-1 row at :34) is killed with `l0_line_absent`. Residual gap: an l0 row that names the sibling for a *different* overlap satisfies the naming check — consistent with the frozen feasibility disclosure ("the counter cannot judge overlap semantics; the semantic guard is wave 2 … and the closure's spot-check"). Severity: low.
3. **m13 — duplicate screen row is reported but cannot fail the predicate.** The counter flags the second row `screen-duplicate` (counter:212-213) and surfaces it in `screenFindings`, but the frozen predicate is `gate clean && unaccounted == 0 && newMapped >= 4` (counter:249) — `screenFindings` do not enter it, and the first row already screens the candidate, so accounting is unchanged. Under the claims.json killRule (predicate false / exit 2 / bytes mismatch) a duplicated screen row can never fail the claim. Redundancy only — the duplicate adds no accounting and is visible in the JSON for the reviewer. Severity: low.

## What the kills establish

- **Map rows 12–15:** every structural forgery of a split-declared row is caught — broken quote (m1a), shifted sibling line (m2), stale sibling pin (m3), disposition upgrade without a ruling (m4), wrong-sibling l0 row (m4b2), duplicated surface (m6), shifted tabi line (m11). The counter's naming rule independently catches a *verified* row that stops naming the other side, on both paths: sibling_quote losing `tabi` (m5) and tabi_quote losing `kake` (m12) — gate clean 14/14 in both, counter `newMapped` 4→3, predicate false. This is precisely the layering the frozen feasibility disclosure promises.
- **Screen ledger:** all four screen forgeries are caught by the counter alone (gate never reads the ledger — m7/m8/m9/m10b all gate-clean): unknown reason (m7), surface naming another sibling's mapped row (m8), deleted row → unaccounted candidate (m9), quote no longer a substring of the candidate line (m10b). Every unaccounted candidate is named in `unaccountedKeys`.

## Restoration evidence

After every mutant: `git reset -q --hard 042d6d9a…`, then `sha256sum` of both files equal to the pristine hashes and `git status --porcelain` = 0 (observed after each of the 17 runs; identical values every time). Final state before scratch deletion: HEAD `042d6d9abf97d567d495652a85eabc851b81adc1`, tree `0656254725773b808def1f98c90062f6f816dd64`, final gate exit 0 (clean 14/14), final counter exit 0 (predicate true, mapped 9, screened 43, unaccounted 0, newMapped 4). The lane checkout, sibling repos and the fleet repo were never written; all git mutations happened inside `$S/clone` (verified toplevel = the clone on every commit).

## Hygiene

- No tools installed or upgraded (none needed); no network fetches (all sources were local git objects); no browser/chromedriver runs. `pgrep -fa 'chromedriver|chromium'` after work: one line, `/usr/bin/earlyoom -r 3600 … --prefer (^|/)(java|node|chromium|python3?)$` — the host daemon whose match pattern mentions chromium; no chromedriver/chromium process of mine exists.
- Scratch `/fast/scratch/hyaku/tabi-r33/MutC1Rows` deleted after receipts were copied; nothing left on disk (verified `ls /fast/scratch/hyaku/tabi-r33/`).

## Deliverables

- Report: `tabi-shokunin/.ufo/waves/round-33/w2/MutC1Rows.md` (this file)
- Mutant index: `tabi-shokunin/.ufo/waves/round-33/w2/MutC1Rows/mutant-index.tsv`
- Instrument JSONs (pristine ×2, final ×2, 17 gate + 17 counter): `tabi-shokunin/.ufo/waves/round-33/w2/MutC1Rows/receipts/`
- Per-mutant diffs vs `042d6d9a…`: `tabi-shokunin/.ufo/waves/round-33/w2/MutC1Rows/mutant-diffs/` (17 files)
