# Round 34 wave 2 — seat RerunC1 (independent C1 re-run)

**Item:** re-run claim C1 independently at the integration commit `04f9623dde8ad35d470cecf766e421eafbcb47fa`, with the counter taken from the freeze commit `59f1b47aae277e1670e4a824173da8cde7e388ee`, and say whether the L1's reading reproduces.

## Verdict

**Holds (no defect).** An independent re-run in a clean clone at `04f9623dde8ad35d470cecf766e421eafbcb47fa` reproduces the L1 reading byte-for-byte: the frozen counter `c1-adjacency-sweep-v2.mjs` hashes to the digest frozen in `claims.json` (`0dba816c…a8781e`), the counter's internal pin for `scripts/check-adjacency.mjs` (`4e2c2a64…324aac`) equals the sha256 of that file at REV, and the counter exits **0** reporting `predicate: true`, `candidates 67` (A 38 / B 29), `mapped 5`, `screened 62`, `unaccounted 0`, `newMapped 4` (map rows 15–18), `adjacency {verdict: clean, rows 17, verified 17, findings 0}`, `screenFindings []`. The same counter at the baseline `15dfaccb…8d600c` exits **1** with `unaccounted 66, newMapped 0, mapped 1, screened 0, adjacency 13/13 clean` — exactly the frozen `c1-J1-do-nothing` before-values — so the met predicate is not a constant-true artifact. A verifier written from scratch for this seat (no code shared with the counter) re-derives the same four new rows, the same five mapped candidates, 62 individually valid screen rows and zero unaccounted candidates. Nothing found to break; the semantic weight of the four rows and the 62 screen reasons is the other wave-2 seats' target and is not claimed here.

## Evidence

Scratch: `S=/fast/scratch/hyaku/tabi-r34/RerunC1`; `TMPDIR=$S/tmp`; clone `$S/clone` (`git rev-parse --show-toplevel` → `/fast/scratch/hyaku/tabi-r34/RerunC1/clone`).

| # | command | exit | result |
|---|---|---|---|
| 1 | `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone` then `git -C $S/clone checkout -q --detach 04f9623dde8ad35d470cecf766e421eafbcb47fa` | 0 | `rev-parse HEAD` = `04f9623d…47fa`; `rev-parse master` = same; `status --porcelain` empty; `replace -l` empty |
| 2 | `git -C …/tabi-shokunin show 59f1b47aae277e1670e4a824173da8cde7e388ee:.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs > $S/c1.mjs; sha256sum` | 0 | `0dba816ccab0b7bf690c3a4da6d850ce4a5a092d9aec895e33c9e7fe75a8781e` == `claims.frozenDigests[".ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs"]` |
| 3 | `git -C $S/clone show 04f9623d…:scripts/check-adjacency.mjs \| sha256sum` | 0 | `4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac` — equals the pin at `$S/c1.mjs:65` (`ADJ_GATE_SHA256`) and `claims.frozenDigests` |
| 4 | `TMPDIR=$S/tmp node $S/c1.mjs --rev 04f9623d… --repo $S/clone --fleet /home/vgpnk/Projects/shokunin --json` | **0** | predicate true (projection below); stderr empty; 1254 bytes |
| 5 | `TMPDIR=$S/tmp node $S/c1.mjs --rev 15dfaccb… --repo $S/clone --fleet … --json` | **1** | `predicate false, candidates 67 (A38/B29), mapped 1, screened 0, unaccounted 66, newMapped 0, adjacency 13/13 clean, screenFindings 0` — identical to `baseline/c1-J1-do-nothing.json` |
| 6 | repeat of #4 | 0 | output sha256 `1892b23365c2…d977a` twice → deterministic |
| 7 | `node $S/c1.mjs --list-candidates … \| sort` vs `baseline/c1-candidates.tsv \| sort` | 0 | `diff` → 0 lines; 67 rows; sets A 38 / B 29 |
| 8 | `node $S/verify-c1.mjs $S/clone … 04f9623d… baseline/c1-candidates.tsv` | 0 | mapped 5 (rows 11,15,16,17,18), screened 62 unique / 0 findings, overlap 0, unaccounted 0, newMappedVerified 4 |
| 9 | `node $S/adjgate.mjs --at 04f9623d… --repo $S/clone --fleet … --json` (gate taken verbatim from REV) | 0 | `{"verdict":"clean","rows":17,"verified":17,"findings":[]}` |

### jq projection (claims `countingCommand`, literal)

```json
{
  "predicate": true, "candidates": 67, "mapped": 5, "screened": 62,
  "unaccounted": 0, "newMapped": 4,
  "newMappedRows": [
    {"row":15,"surface":"live-delivery-observation","sibling":"kake","disposition":"split-declared"},
    {"row":16,"surface":"lab-performance-tool-runs","sibling":"kake","disposition":"split-declared"},
    {"row":17,"surface":"agent-facing-tool-text-craft","sibling":"kotoba","disposition":"split-declared"},
    {"row":18,"surface":"authenticated-consequential-driving","sibling":"kasegi","disposition":"refused-route"}
  ],
  "adjacency": {"verdict":"clean","rows":17,"verified":17,"findings":0},
  "screenFindings": []
}
```
(pipe status `0 0`)

### Independent clause re-derivation of the four new rows (`verify-out2.json`)

All four, checked from git objects only, not via the counter:

- (surface, sibling) folded key absent from `corpus/adjacency.tsv` at `15dfaccb…` — true ×4. Map rows at REV 17, at baseline 13; the 17 REV keys are unique.
- `sibling_ref` parses as `<lane>-shokunin@<40hex>:<path>:<line>`, lane == sibling, and the cited line's trimmed text equals the frozen candidate text for that same path — true ×4.
- `tabi_ref` parses `path:line`; that line's trimmed text is **absent** from the same tabi file at the baseline; the line contains `tabi_quote`; `tabi_quote` names the sibling — true ×4.
- Disposition: rows 15/16/17 `split-declared` with `sibling_quote` containing `tabi`; row 18 `refused-route` — all accepted by the frozen rule.

Map rows (file lines `corpus/adjacency.tsv` at REV) and their declaration lines (`SKILL.md` at REV, inside the section headed `## Round 34 — sibling-overlap declarations (outside PROVINCE)` at `SKILL.md:2917`):

- row 15 `live-delivery-observation` / kake / `kake-shokunin@044048…:SKILL.md:408` / `SKILL.md:2921`
- row 16 `lab-performance-tool-runs` / kake / `kake-shokunin@044048…:SKILL.md:697` / `SKILL.md:2922`
- row 17 `agent-facing-tool-text-craft` / kotoba / `kotoba-shokunin@65a5c7…:corpus/knowledge/sibling-overlap-census-round49.md:171` / `SKILL.md:2923`
- row 18 `authenticated-consequential-driving` / kasegi / `kasegi-shokunin@9a10b0…:corpus/knowledge/mission-control.md:119` / `SKILL.md:2924`

### Screen ledger (`corpus/adjacency-screen-skill.tsv` at REV, sha256 `4435bbc…d20e1`, 63 lines = header + 62)

Header byte-exact `sibling_ref\treason\tsurface\tquote\tnote`; 62 data rows, 62 unique `sibling_ref`, every `sibling_ref` an exact frozen candidate key, every reason in the closed vocabulary, every quote a verbatim substring of the frozen candidate text at 4–25 words / ≥20 non-space chars, `same-surface` rows naming a verified row of the same sibling, all other rows `surface = -`. Findings 0. Reason distribution: `same-surface` 35, `third-lane-report` 23, `no-claim-declared` 3, `not-browser-sense` 1.

Accounting closes: mapped 5 + screened 62 = 67, intersection empty.

`leadsReanchored` = 1 (`corpus/knowledge/mirror-pitfalls.md:39@044048… -> 40`), `leadsUnresolved` = 0.

## Observations (not defects of the C1 predicate)

1. `.ufo/waves/round-34/measure/` has **no committed after-measure raw output** at REV — `git ls-tree -r 04f9623 .ufo/waves/round-34/` lists only `measure.sh` under `measure*`. `claims.measurementRule` says raw output is committed under `measure/` before the report. Process item for the L1's closure commit; does not affect the predicate, which I re-derived myself.
2. `mapped` is defined by the frozen counter on `(lane, path, trimmed text)`, not on the pin: row 11 cites `kama-shokunin@54a2926…:corpus/knowledge/listener-census.md:355` while the frozen candidate key carries pin `0163fea2…`. This is the disclosed definition and the claims name row 11 as mapped, but a pin-exact reader would count baseline `mapped 0`. Recorded so the number is not misread.
3. Semantic judgement of the four rows and of the 62 screen reasons is out of this seat's scope (`claims.feasibilityDisclosed`: the semantic guard is wave 2, one attack per new row and per screen-reason group). This seat only certifies that the frozen counter's computation and the L1's reported numbers agree.

No tool installs or upgrades; no network fetches; no browser launched. Scratch `$S` deleted after copying receipts.

## Deliverables

- Report: `.ufo/waves/round-34/w2/RerunC1.md`
- Receipts: `.ufo/waves/round-34/w2/RerunC1/` — `c1.mjs` (frozen counter copy, sha256 `0dba816c…a8781e`), `c1-out.json` (REV run, `1892b233…d977a`), `c1-baseline.json`, `verify-c1.mjs`, `verify-out2.json`, `adjgate-out.json`, `cands-live.tsv`, `frozen-c1-candidates.tsv`, `frozen.s`, `live.s`
