# CritRowLiveDelivery — round 34 w2, attack on map row 15 `live-delivery-observation` (kake `SKILL.md:408`)

## Verdict

**DEFECT — medium: row 15 re-keys the boundary already mapped by row 12 `js-rendering-browser-execution`, and the same round's own ledger already screened the identical sibling fact on that row.** The row is not a second boundary: every clause of kake `SKILL.md:408` (`04404859…`) lies on one of row 12's two already-mapped sides — "Google-selected canonical" on kake's side (row 12 ruling, kake `PROVINCE.md:354-358`), and "HTTP headers, redirects, content duplication or JS state" plus "route browser work to tabi" under the general sibling statement "browser execution stays tabi's" (row 12's own sibling pin, kake `PROVINCE.md:61`) — while the cell's only *new* content is kake's own tool limit ("This tool cannot establish it"), which is exactly the residue criterion 91 (`corpus/QUALITY.md:588-591`) declares a screen "whatever its surface name". The stronger form of the same counterexample is inside the integration itself: the round-34 ledger screens kake `corpus/knowledge/static-canonical-preflight.md:134` — *"not current delivery, rendered DOM (tabi's ground) or search-engine selection"*, the same preflight's receipt-limit sentence — as `same-surface` on `js-rendering-browser-execution` with the note "a fact on kake's side of that already-mapped split, not a second allocation" (`corpus/adjacency-screen-skill.tsv:6`), and w1's own clustering had bundled `SKILL.md:408` with that line in one group against that existing surface (`.ufo/waves/round-34/w1/ConnBoundaries/boundaries.tsv:5`). Row 15 then mints the "current delivery" that the ledger says row 12 covers as a new surface. Prescribed outcome: **withdraw** (screen the candidate `same-surface` on `js-rendering-browser-execution`). The frozen C1 predicate survives withdrawal — measured below, `newMapped 4 → 3` with `unaccounted 0` — but the margin becomes zero.

## Evidence

All runs read-only outside my scratch clone; the lane worktree, lane index/jj state, fleet repo and sibling repos were never written. Scratch `/fast/scratch/hyaku/tabi-r34/CritRowLiveDelivery` (removed after receipts; `TMPDIR` under it).

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"                  rc 0
git -C "$S/clone" checkout -q --detach 04f9623dde8ad35d470cecf766e421eafbcb47fa            rc 0
git -C "$S/clone" rev-parse --show-toplevel  -> /fast/scratch/hyaku/tabi-r34/CritRowLiveDelivery/clone   (asserted equal)
git -C "$S/clone" show 59f1b47a…:.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs > c1.mjs
sha256sum c1.mjs -> 0dba816ccab0b7bf690c3a4da6d850ce4a5a092d9aec895e33c9e7fe75a8781e   (= claims.json frozenDigests: counter is the frozen one)
```

### 1. Sibling bytes (the line and the row it is supposed to be distinct from)

```
# row 15 sibling pin, kake SKILL.md:408 @044048597d62f3199494b63b36e90dd57825e350 (receipt kake-SKILL-400-410.txt)
408 | Need Google-selected canonical, HTTP headers, redirects, content duplication or JS state | This tool cannot establish it; route browser work to tabi, publishing/account actions to the operator |
407 | Unsupported HTML, invalid manifest or unreadable input | Could not evaluate; use a proper HTML5/browser audit rather than calling it clean |
400 Canonical declarations are signals, not guarantees of Google's selection.

# row 12 sibling pin, kake PROVINCE.md:60-62 @same commit (receipt kake-PROVINCE-60-62.txt)
60  … not a claim that a live website was repaired or a Google-selected canonical observed. The broader crawl and
61  JS-rendered-canonical frontier above remains open; browser execution stays tabi's
62  adjacent province and publication/account operations stay operator-owned.
```

Line-by-line decomposition of `:408` against row 12's two sides:

| `:408` clause | where it already sits |
|---|---|
| "Google-selected canonical" | row 12 ruling/declaration: "canonical declaration and selection stay kake's" (`corpus/adjacency.tsv:12`, tabi `SKILL.md:2887`; selection half at kake `PROVINCE.md:354-358`, tabi `SKILL.md:2912` correction) |
| "JS state", "content duplication" | row 12's whole subject (surface name `js-rendering-browser-execution`; tabi `SKILL.md:2887` "executing a page in a browser to see what a crawler would render") |
| "HTTP headers, redirects" | "browser execution stays tabi's" (kake `PROVINCE.md:61`, row 12's sibling quote) — tabi's own practice is browser-driven: rung 4 is "a per-step CDP Network-domain slice" capturing "raw status, status line, header bytes" and "redirects" (`SKILL.md:374`), chains measured on the driven browser (`SKILL.md:327`) |
| "route browser work to tabi, publishing/account actions to the operator" | the same two-clause route, same parties, at row 12's pin: "browser execution stays tabi's adjacent province and publication/account operations stay operator-owned" (`PROVINCE.md:61-62`) — also already mapped generally by row 6's sibling quote (kake `PROVINCE.md:30-31`, "`tabi` drives browsers and owns client-side crawler discipline") |
| "This tool cannot establish it" | kake's own side of the split — a fact about `canonical_audit.py`, precisely criterion 91's "fact on the sibling's own side of an already-mapped split" |

Residue after the decomposition: **none**. There is no tabi↔kake boundary in `:408` that row 12 (or row 6) does not already state.

### 2. The in-integration contradiction (strongest counterexample)

```
# round-34 ledger at the integration rev (receipt tabi-ledger-line6.txt)
corpus/adjacency-screen-skill.tsv:6
kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:corpus/knowledge/static-canonical-preflight.md:134
  same-surface  js-rendering-browser-execution  "not current delivery, rendered DOM (tabi's ground) or search-engine"
  note: "rendered DOM is the product of the browser execution mapped in js-rendering-browser-execution; the line's new
  content is kake's own receipt limit (what bytes at fetchedAt prove), a fact on kake's side of that already-mapped
  split, not a second allocation."

# that sibling line @04404859 (receipt kake-preflight-128-135.txt)
134 `fetchedAt`, not current delivery, rendered DOM (tabi's ground) or search-engine
135 selection. Round 23's 12 owned surfaces are in
```

`:134` says "not **current delivery**, rendered DOM (tabi's ground) or search-engine selection"; the ledger screens it on row 12 because the new content is kake's own receipt limit. Row 15's surface is named for exactly that "current delivery" and mints it as a distinct allocation. w1 had already put the two lines in one group: `ConnBoundaries/boundaries.tsv:5` — `G4 kake SKILL.md:408; static-canonical-preflight.md:134   js-rendering-browser-execution (existing)   both restate mapped row 12 … if Adj splits it as a distinct live-delivery-observation surface, that is a judgment call, not a second boundary`. The integration screened one and mapped the other; criterion 91 (`corpus/QUALITY.md:588-591`) admits only the screen.

### 3. Frozen-counter readings (before and under the correction)

```
# the integrated bytes, frozen counter
node c1.mjs --rev 04f9623dde8ad35d470cecf766e421eafbcb47fa --repo "$S/clone" \
  --fleet /home/vgpnk/Projects/shokunin --json                                  rc 0
predicate true · adjacency clean rows 17 verified 17 · candidates 67 · mapped 5 · screened 62 · unaccounted 0
· newMapped 4 · newMappedRows rows 15 live-delivery-observation, 16 lab-performance-tool-runs,
  17 agent-facing-tool-text-craft, 18 authenticated-consequential-driving · screenFindings []

node "$S/clone/scripts/check-adjacency.mjs" --at 04f9623d… --repo "$S/clone" \
  --fleet /home/vgpnk/Projects/shokunin --json                                  rc 0   verdict clean 17/17
```

Row 15's three quotes are legal and on their cited lines (each `grep -cF` = 1; word / non-space counts):

```
sibling_quote 10 words / 61 ns  "route browser work to tabi, publishing/account actions to the operator"   on kake SKILL.md:408
tabi_quote    10 words / 56 ns  "every publishing or account action stay kake's and the operator's"        on tabi SKILL.md:2921
ruling_quote   7 words / 47 ns  "stay kake's and the operator's (kake `SKILL.md:408`)."                    on tabi SKILL.md:2921  (split-declared: legal, but self-referential)
```

So the row is mechanically clean; the defect is semantic (criterion 91), which is the class `claims.json` `feasibilityDisclosed` assigns to wave 2.

### 4. Correction measured (cheapest safe move)

In my clone only (commit `cb65edb7e0690f57b8006059aa6a8d69a20aaf95`, parent `04f9623d…`): delete row 15, append one screen row for the candidate, touch nothing else.

```
cb65edb7… : corpus/adjacency.tsv row 15 removed;
            corpus/adjacency-screen-skill.tsv + "kake-shokunin@04404859…:SKILL.md:408  same-surface
            js-rendering-browser-execution  route browser work to tabi, publishing/account actions to the operator …"
node "$S/clone/scripts/check-adjacency.mjs" --at cb65edb7… --repo "$S/clone" --fleet … --json   rc 0  clean rows 16 verified 16
node c1.mjs --rev cb65edb7… --repo "$S/clone" --fleet … --json                                  rc 0
predicate true · adjacency clean 16/16 · candidates 67 · mapped 4 · screened 63 · unaccounted 0 · newMapped 3
· newMappedRows rows 15 lab-performance-tool-runs, 16 agent-facing-tool-text-craft, 17 authenticated-consequential-driving
· screenFindings []
git -C clone diff --numstat 15dfaccb… cb65edb7… -- corpus/adjacency.tsv SKILL.md corpus/adjacency-screen-skill.tsv
3   0   corpus/adjacency.tsv          <- removing the round-34 row costs ZERO deletions: the three remaining
64  0   corpus/adjacency-screen-skill.tsv   round-34 rows are identical and still form the tail of the file
31  0   SKILL.md
```

The predicate holds at `newMapped 3` with `unaccounted 0`, so the row is not load-bearing *by itself* — but the margin to the frozen `>= 3` becomes exactly zero, and any second withdrawal (row 16 is the disclosed candidate, `AdjKakeDelegations.md` attack note 2) fails C1.

## The four assigned questions

1. **Real overlap, distinct from every existing boundary?** No. See the decomposition table: zero residue outside row 12 (and row 6). Criterion 91 therefore makes it a screen.
2. **Does the tabi declaration (`SKILL.md:2921`) claim ground tabi practises, without absorbing kake's?** Its tabi half **holds** on the bytes: rung 4 captures "raw status, status line, header bytes" and "redirects" (`SKILL.md:374`) and the chain rules are measured (`SKILL.md:327`), bounded to "loopback or operator-authorized properties only", which matches `PROVINCE.md:9-13` (dynamic-page evidence). Its kake half does **not absorb** kake's ground, but its *provenance* is wrong for one term: "Google's selection … stay kake's" is not at `:408` (which routes that need's browser work to tabi and, two lines up at `:400`, disclaims any guarantee of Google's selection); it is sourced at row 12's ruling (`PROVINCE.md:354-358`, `SKILL.md:2912`). That borrowing is itself evidence the row reuses row 12's split term. Low severity, subsumed by the withdrawal.
3. **Disposition right?** `split-declared` is formally correct *for the boundary as written* (sibling `:408` names tabi; tabi line names kake; both quotes verbatim — criterion 88's naming rule met). The defect is the row's existence, not its disposition label; no disposition change can rescue it. `contested-open` would be wrong (nothing is contested: kake's own `PROVINCE.md:61-62` already concedes browser work to tabi).
4. **Quotes verbatim and on the cited lines?** Yes — `grep -F` count 1 on kake `SKILL.md:408` for the sibling quote, and on tabi `SKILL.md:2921` for the tabi and ruling quotes; all inside 4-25 words / >= 20 non-space chars. No quote defect.

**Rejected rescue (named so the closure does not re-run it):** re-pointing the row at kake's live-capture line, `PROVINCE.md:65` ("The publisher-side canonical tool now consumes saved GET-response HTML from owned public properties through `scripts/live_snapshot.py`; live capture is GET-only … This is not rendered-DOM observation") fails twice: that line disclaims kake's own receipt scope rather than allocating anything to tabi, and it is a `PROVINCE.md` line, outside the frozen candidate set, so a row citing it maps no candidate and still leaves `newMapped 3`. Re-keying cannot preserve a count of 4 honestly.

## Impacted axes

- **adjacency (the worked axis)**: the frozen `mapped`/`newMapped` reading at REV is inflated by one row (5/4 instead of 4/3 after correction); the map records a second allocation for a mapped boundary, and the ledger records the same fact as `same-surface`. Target still met at 3 with `unaccounted 0`, margin 0.
- **quality / closure**: criterion 91 requires the reversal be recorded with its sibling-side ground; criterion 88's "each new row's overlap is judged by an attack seat and the closure, row by row" is satisfied by this report.
- **not impacted**: no other axis; the correction appends only (numstat deletions 0 on every protected path), so no-harm readings (`check-selfassessment`, `check-sources`, r33 C1 `unaccounted 0`) are untouched. C2 not read by this seat.

## Smallest safe correction (for the L1; seats do not repair)

1. `corpus/adjacency.tsv`: delete row 15 (`live-delivery-observation`, kake `SKILL.md:408`) — measured cost 0 deletions vs `15dfaccb` (`adjacency.tsv 3 0`).
2. `corpus/adjacency-screen-skill.tsv`: append `kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:SKILL.md:408` / `same-surface` / `js-rendering-browser-execution` / `route browser work to tabi, publishing/account actions to the operator` / note citing `PROVINCE.md:61-62` and criterion 91 (measured `screenFindings []`, `unaccounted 0`).
3. `SKILL.md`: append-only correction under `## Round 34 — corrections` in the round-33 precedent's shape (`SKILL.md:2912` for `:2890`): "`SKILL.md:2921`: correction — the live-delivery bullet no longer backs a map row: row 15 was withdrawn in round-34 wave 2 because kake `SKILL.md:408` restates the split already mapped as `js-rendering-browser-execution` (row 12); the line is now screened `same-surface` on that row." Do not edit line 2921 itself.
4. Re-run `measure.sh` so the committed `newMapped` reading matches the corrected map, and state `4 → 3` in the closure with the margin now zero.

## Deliverables

- `.ufo/waves/round-34/w2/CritRowLiveDelivery.md` (this report)
- `.ufo/waves/round-34/w2/CritRowLiveDelivery/`: `c1-at-04f9623.json` · `adj-at-04f9623.json` · `c1-variant.json` · `adj-variant.json` · `removed-row.txt` · `kake-SKILL-400-410.txt` · `kake-PROVINCE-60-62.txt` · `kake-preflight-128-135.txt` · `tabi-ledger-line6.txt` · `quotes.txt` · `numstat.txt` · `commands.txt`

No browser launched, no network fetch, no tool installed or upgraded, no subagent, no message to `agent://all`. Scratch removed (`ls` → "No such file or directory") after the receipts were copied.
