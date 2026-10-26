# CritC2Boundary — round 35 w2 — C2 milestone: lesson M1 red state + fix shape, and the boundary-control audit of every other numeric constant

## Verdict

**Holds — M1's red state and its fix's shape are both confirmed by fresh scoring, and no OTHER numeric predicate constant in either frozen counter lacks a boundary control.** I reconstructed the M1 boundary construction in my own scratch clone (the wave-1 construction tree 86d6df42 is not in the lane repo), scored it with the byte-verified frozen counter: **admitted 15, failing 0, unmeasured 2, predicate true, exit 0** — field-for-field the reading committed at `.ufo/waves/round-35/measure/c2-M1-boundary-15.json`, i.e. the hole is real and reproducible: the frozen counter's `TARGET = 14` admits a state one step short of the declared `admitted >= 16`. A scratch-only patch of that one constant to 16 scores the identical construction **predicate false, exit 1** — exactly the boundary control QUALITY 98 requires, so the fix shape (raise the constant; add a one-step-short control that must exit 1) is sound. The audit of the remaining numeric constants — C2 run count ≥ 2, C2 s1 ≥ 1 S-id, C1 `NEW_TARGET = 2`, C1 quote bounds (≥4 words, ≤25 words, ≥20 non-space chars), C1 `unaccounted == 0` — found a boundary control for **every** one: each one-step-short/outside construction flips its counter to predicate false / exit 1. No new defect; M1 itself is already recorded (lesson round-35.md:84–93). Two info-level observations recorded below (construction trees absent from the lane; a cosmetic binding-message quirk).

## Evidence

Scratch: `S=/fast/scratch/hyaku/tabi-r35/CritC2Boundary` (deleted at close, artifacts copied to the output dir first). Clone: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone" && git -C "$S/clone" checkout -q --detach 083c5c643be7aa5965a5de3458a32ed0d289ead3` → exit 0, HEAD `083c5c643be7aa5965a5de3458a32ed0d289ead3`, `rev-parse --show-toplevel` = the clone dir (asserted before every commit).

**Frozen bytes verified.** `git -C "$S/clone" show a4bfef0f75027c915e715649950b1d46dcb33d83:.ufo/waves/round-35/counters/c2-firefox-bidi.mjs` → sha256 `7cc7f17fa0a86355b582f506af619dd2807e925fe836fe39e95a436d59cd954e`; same for `c1-adjacency-sweep-v3.mjs` → `5707a93742565c17d24dd4df37d2289e1a9dfe4646e313108357770909b436b9` — both equal `claims.json` frozenDigests, and the worktree copies under `.ufo/waves/round-35/counters/` are byte-identical (sha256sum, exit 0). `git merge-base --is-ancestor a4bfef0f 083c5c64` → 0.

### (1) M1 red state — reconstructed and re-scored

Construction A: in the clone at 083c5c64, entry `corpus/knowledge/webdriver-bidi-firefox-runtime-round-35.md` line 121, R17's Measured cell `yes` → `no — boundary` (single-cell edit; diff `construction-A-r17-no-boundary.patch`); commit `3d4888e4d24b0317569b96470504908686830cb9`.

```
TMPDIR=$S/tmp node $S/counter-frozen-c2.mjs --rev 3d4888e4d24b0317569b96470504908686830cb9 --repo $S/clone --json > $S/red-M1.json
exit=0
```
Reading (`red-M1.json`): population 17, **admitted 15**, failing 0, unmeasured 2, entryFinding null, receiptFinding null, binding null, **predicate true**; rows R16/R17 verdict `no`, all others admitted; sourceWitness S134 → `corpus/lessons/round-35.md:15`; live leg ran (commands 28, events 20, firstShotSha256 `7a3ae6a9b0d65497f52ec1ed6ddea1970e32025e0fb8a36d2debdfc201cbfd02` — byte-identical to the committed runs' first screenshot). This matches the committed `.ufo/waves/round-35/measure/c2-M1-boundary-15.json` field-for-field (rev and live-session identity excepted: fresh construction commit, fresh live session). The hole stands: **the frozen counter exits 0 on a state the declared predicate (`admitted >= 16`, claims.json C2) scores false.**

### (2) Fix shape — TARGET 14 → 16 (scratch copy only)

`counter-target16.mjs` = frozen bytes with line 77 `const TARGET = 14;` → `const TARGET = 16;` (own sha256 `5aa223a584f705bc1369d361e902bc0a0f40d46b178deb3991d1bc1d9d527894`, recorded in its output `counterSha256`; copied to the output dir).

```
TMPDIR=$S/tmp node $S/counter-target16.mjs --rev 3d4888e4d24b0317569b96470504908686830cb9 --repo $S/clone --json > $S/fixed-M1-target16.json
exit=1
```
Reading: admitted 15, failing 0, unmeasured 2, binding null, live commands 28, **predicate false**. The identical construction that the frozen counter passes is rejected by the declared threshold — the fix shape works, and the only change needed is the constant (the counter's other clauses are untouched and still green on this construction).

### (3) Boundary-control audit of every other numeric constant

Constructions (each committed in the scratch clone; diffs in the output dir):

- **B — C2 run count ≥ 2** (`c2-firefox-bidi.mjs:390` `receipt.runs.length < 2 → 'fewer than two runs'`): receipt `corpus/evidence/round-35/bidi-firefox/receipt.json` with `runs` reduced to run1 only (JSON re-validated: `runs: 1`); commit `080282cb6d5138ad7a1471fb8403baf9286a0b12`.
  `TMPDIR=$S/tmp node $S/counter-frozen-c2.mjs --rev 080282cb… --repo $S/clone --json` → **exit 1**; receiptFinding `"fewer than two runs"`, admitted 0, failing 16, unmeasured 1, binding null, live null (live leg skipped — no browser launched). **Control present.**
- **D — C2 s1 ≥ 1 S-id** (`:352` `matchAll(/\bS\d{3,}\b/g)`, `:366` `s1-source-row`): entry `source:` line mangled to `ource:` so zero S-ids are cited; commit `bcc797ed8c40e1d0279d085c647f40769a2abddc`.
  Frozen C2 → **exit 1**; entryFinding `s1-source-row` ("no S-id on the source: line"), failing 17, predicate false, live null. **Control present.**
- **Integration rev as the C1 NEW_TARGET one-step-short** (`c1-adjacency-sweep-v3.mjs:80` `NEW_TARGET = 2`, applied `:307`): the wave-1 integration state itself is one step short (unaccounted 0, adjacency clean, newMapped 1).
  `TMPDIR=$S/tmp node $S/counter-frozen-c1.mjs --rev 083c5c64… --repo $S/clone --fleet /home/vgpnk/Projects/shokunin --json` → **exit 1**; candidates 383, unaccounted 0, newMapped 1 (row 18 `cdp-bridge-vault-dom-refusal`, kagi, split-declared), adjacency clean, screenFindings 0, **predicate false**. Green side at exactly 2: the committed control `baseline/c1-J8-residual-lexical-forgery.json` (rev `75b53a1d…`, newMapped 2, predicate true) — cited, not re-run (its construction tree is absent from the lane repo, see observations). **Control present.**
- **C — C1 quote bounds** (`:131` `goodQuote` = ≥4 words ∧ ≤25 words ∧ ≥20 non-space chars; applied `:242`): three ledger rows' quote cells replaced with verbatim substrings of their own candidate lines (verified `includes()` against the pinned blobs): row 86 → 26-word quote (one over the max), row 240 → 3-word quote `missing canonical paths` (one under the min, 21 chars so char-min not conflated), row 188 → 4-word quote `does not prove the` (15 non-space chars, one under the char min); commit `18a67b3843b838957350f1247ba1c3464dee2b65`.
  Frozen C1 → **exit 1**; candidates 383, unaccounted 3, newMapped 1, adjacency clean, **screenFindings = `screen-quote` ×3 at rows 86, 188, 240**, predicate false. **All three edges enforced — control present on each.**
- **C1 `unaccounted == 0`** (`:307`): red side covered by construction C (unaccounted 3 → predicate false, exit 1, fresh) and by the committed baseline control J1 (unaccounted 383 → false). **Control present.**

No other numeric scoring constants exist in either counter: the remaining numeric literals are operational (live-leg timeouts/retries 90000/10000/5000/50/20, `maxEncodedDataSize: 65536` — parameters of the counter's own session recipe, not scoring predicates) or structural parses (registry row 0–3 leading spaces / 11 cells, `SCREEN_HEADER.length`, ref line `[1-9][0-9]*`), none of which gate the predicate.

### Constant → construction → verdict table

| Constant (frozen bytes) | One-step-short/outside construction | Reading | Verdict |
|---|---|---|---|
| C2 `TARGET = 14` (`c2-firefox-bidi.mjs:77`; predicate comment `:54`, applied `:462`) | A: R17 `no — boundary` → admitted 15 | predicate **true**, exit 0 | **No control — the M1 hole** (red state confirmed); TARGET 16 patch → predicate false, exit 1 (fix shape confirmed) |
| C2 runs ≥ 2 (`:390`) | B: receipt with 1 run | `fewer than two runs`, predicate false, exit 1 | Control present |
| C2 s1 ≥ 1 S-id (`:352`, `:366`) | D: zero S-ids on `source:` | `s1-source-row`, predicate false, exit 1 | Control present |
| C1 `NEW_TARGET = 2` (`c1-adjacency-sweep-v3.mjs:80`, `:307`) | integration rev: newMapped 1, unaccounted 0, clean | predicate false, exit 1 (green at 2 per committed J8) | Control present |
| C1 quote word-min 4 (`:131`, `:242`) | C row 240: 3-word quote | `screen-quote`, predicate false, exit 1 | Control present |
| C1 quote word-max 25 (`:131`, `:242`) | C row 86: 26-word quote | `screen-quote` | Control present |
| C1 quote char-min 20 (`:131`) | C row 188: 4 words, 15 chars | `screen-quote` | Control present |
| C1 unaccounted == 0 (`:307`) | C: unaccounted 3 (fresh); baseline J1: 383 (committed) | predicate false | Control present |

## Observations (info-level, no scoring impact)

1. **Construction trees exist only in wave-1 seat clones.** `86d6df42cb743691cff0e13f2503dcaf2ed70651` (M1 boundary) and `75b53a1d6ca6261a482d92e34b128ebc7f594961` (J8) are absent from the lane repo (`git cat-file -t` → fatal); only their output JSONs are committed. The measurement rule requires raw output committed, which is satisfied — but re-scoring a construction from the lane alone requires reconstruction, as this seat did for M1. No defect: the frozen counter + frozenDigests make the reconstruction deterministic in shape.
2. **Binding message on a skipped live leg.** With an entry finding and a valid 2-run receipt, the binding clause runs (`c2:~430` `else if (!liveRec)`) and reports `binding = "live session failed: null"` even though the live leg was skipped by the entry-finding short-circuit (`:417`), not failed. Cosmetic: predicate is already false via the entry finding, and whenever `entryFinding` is null the live leg always runs. Also observed: an entry finding marks even `no` rows failing (failing 17 in construction D) because the entry-finding check precedes the unmeasured branch — cosmetic, predicate unaffected.
3. Lesson M1's citation `c2-firefox-bidi.mjs:54` is the header comment line stating `admitted >= 14`; the constant itself sits at `:77`. No errata needed — the citation resolves.

## Hygiene

- Browsers: the frozen counter's own live leg launched exactly 2 headless Firefox sessions (red run + TARGET-16 run), each inside the counter's mkdtemp scratch under my `TMPDIR=$S/tmp`, with the counter's own free ports (never 9222), loopback fixture, and its finally-block teardown. Post-run `pgrep -af geckodriver | grep -c 'tabi-r35-c2-live|CritC2Boundary'` → 0 and `pgrep -af firefox | grep -c '/fast/scratch/hyaku/tabi-r35/CritC2Boundary'` → 0: no leftover processes.
- No tools installed or upgraded this round (none needed). No network fetches made (all evidence is local git objects + the counter's own loopback session). No lane tracked file, lane index, fleet file, or sibling repo written; commits only inside `$S/clone` with `user.name=CritC2Boundary`.
- Scratch `$S` deleted after copying all artifacts; nothing left on disk.

## Deliverables

- Report: `tabi-shokunin/.ufo/waves/round-35/w2/CritC2Boundary.md` (this file)
- `tabi-shokunin/.ufo/waves/round-35/w2/CritC2Boundary/red-M1.json` — fresh M1 red score (frozen counter, construction A)
- `tabi-shokunin/.ufo/waves/round-35/w2/CritC2Boundary/fixed-M1-target16.json` — fix-shape score (TARGET 16, same construction)
- `tabi-shokunin/.ufo/waves/round-35/w2/CritC2Boundary/boundary-runs1.json` — 1-run receipt score
- `tabi-shokunin/.ufo/waves/round-35/w2/CritC2Boundary/boundary-quotes.json` — quote-bound probes score
- `tabi-shokunin/.ufo/waves/round-35/w2/CritC2Boundary/boundary-newmapped1.json` — NEW_TARGET one-step-short score at 083c5c64
- `tabi-shokunin/.ufo/waves/round-35/w2/CritC2Boundary/boundary-s1-zero.json` — s1 zero-S-id score
- `tabi-shokunin/.ufo/waves/round-35/w2/CritC2Boundary/construction-{A-r17-no-boundary,B-receipt-one-run,C-quote-bound-probes,D-s1-zero-sids}.patch` — the four construction diffs
- `tabi-shokunin/.ufo/waves/round-35/w2/CritC2Boundary/counter-target16.mjs` — the scratch TARGET-16 patch (sha256 `5aa223a584f705bc1369d361e902bc0a0f40d46b178deb3991d1bc1d9d527894`)
