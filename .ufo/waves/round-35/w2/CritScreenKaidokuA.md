# CritScreenKaidokuA — wave-2 seat report (round 35, w2, falsify)

Item: Attack the C1 screen rows of sibling lane `kaidoku` — the rows ranked 1–69 among
kaidoku rows in file order of `corpus/adjacency-screen-browser.tsv` — against the decision
rule (`SKILL.md:2861-2881`) and the actual map-row ground (`corpus/adjacency.tsv`).

## Verdict

**HOLDS.** All 69 kaidoku screen rows (ranks 1–69 of 137 kaidoku rows) survive attack:
every reason matches the decision rule in order, every `same-surface` row names a surface
whose existing verified map row is really the same ground (checked against the split's own
quotes, not just the label), and no line is a real overlap that should have been mapped
(no kaidoku line in this range states a side on a tabi PROVINCE surface that an existing
row does not answer). Mechanical integrity also holds: all 69 quotes are verbatim
substrings (or whole trimmed lines, ≤25 words) of the pinned sibling lines, surfaces are
all mapped-verified for the same sibling, no duplicate screen keys, and zero rows are
screen-flagged/unaccounted by the frozen counter. One borderline label noted (rank 43,
`third-lane-report` on a host-environment fact — no better closed reason exists; ground is
sound). No defect, no relabel, no should-map. Severity: none.

## Scope

The ledger has 137 kaidoku screen rows. This seat attacks ranks 1–69 in file order
(keystone peer CritScreenKaidokuB covers ranks 70–137). Ranks 1–69 = file lines 58–126 of
the ledger; extracted by `awk` from `corpus/adjacency-screen-browser.tsv`.

## Evidence

### 1. Pin and candidate membership

- `git -C /home/vgpnk/Projects/shokunin/kaidoku-shokunin cat-file -t 49096c7e6f226af0c750c4b003be58883cb6049f` → `commit` (exit 0). The pin equals `c1-pins.json` `kaidoku`.
- Every one of the 69 `sibling_ref` paths/line numbers resolves at that pin (`git show <pin>:<path> | sed -n '<lo>,<hi>p'`; 69/69 non-empty; sample `git show <pin>:SKILL.md` worked).
- Independent re-derivation of candidatehood with the counter's frozen regexes (BG, TABI) on the 69 pinned lines: 0 lines fail BG, 0 contain `\btabi\b`, 0 collide with round-34 prior candidates (67-row `c1-candidates.tsv` at BASELINE) — all 69 are genuine C1 candidates.
- Quote check (frozen rule, counter line 242: `goodQuote(quote) && c.text.includes(quote)` OR `quote === c.text.trim() && words(quote) <= 25`): all 69 pass. Six quotes (ranks 18, 22, 41, 45, 61, 63) are 2–3-word strings that are the *whole trimmed candidate line* (≤25 words), i.e. the second branch; independently replicated in Node with the counter's own word/token semantics, all `PASS=true`.

### 2. Frozen counter at the integration commit (ground truth)

- Clean clone at the wave-1 integration: `git clone --shared <lane> $S/clone && git -C $S/clone checkout -q --detach 083c5c643be7aa5965a5de3458a32ed0d289ead3` (rev resolved, exit 0).
- `TMPDIR=$S/tmp node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --rev 083c5c643be7aa5965a5de3458a32ed0d289ead3 --repo $S/clone --fleet /home/vgpnk/Projects/shokunin --json` → exit **1** (predicate false, as integrated); JSON: `adjacency {verdict:"clean", rows:17, verified:17, findings:0}`, `candidates:383`, `mapped:1`, `screened:382`, `unaccounted:0`, `newMapped:1`, `screenFindings:[]`, `unaccountedKeys:[]`, `perLane.kaidoku:137`.
- Re-import of the counter module (`evaluate(...)` with the same args) reproduces `screenFindings []`, `unaccounted 0`, `screened 382` — no screen row, including the six short-quote rows, is rejected.
- (First counter attempt exited 2 only because I had deleted the clone's `.git` pointer by mistake; rebuilt the clone and the run above succeeded — tooling hiccup, not a finding.)

### 3. Semantic review method (per row)

For each of the 69 rows: (a) read the pinned line +-2 lines of context (`git show <pin>:<path>`), (b) apply the decision rule `SKILL.md:2861-2881` in order, (c) for `same-surface`, compare the line's ground to the mapped split's own content in `corpus/adjacency.tsv`:

| kaidoku map row (adjacency.tsv) | split ground checked against |
|---|---|
| row 2 `cdp-runtime-observation` (ruled; sibling quote PROVINCE.md:53 "self-launched targets: chromium --headless --remote-debugging-port=9222 … capture-browser-scenario"; ruling: kaidoku keeps CDP only as an REA provider surface for shipped-artifact analysis) | all 53 rows named `cdp-runtime-observation` |
| row 3 `reverse-engineering-of-shipped-artifacts` (refused-route; kaidoku PROVINCE.md:3) | ranks 52–53 |
| row 16 `recorded-har-producer-channel` (split-declared; sibling quote r10-01-queue-ops.md:151 "any har-schema-valid capture", which playwright's recordHar satisfies.") | ranks 2, 3, 64, 69 |
| row 17 `screenshot-pair-compare-semantics` (split-declared) | not used in ranks 1–69 |

None of the 69 lines asserts a side on an *unmapped* tabi surface (web publishing, robots,
accessibility-at-execution, crawl rate, secrets/vault, kimi-plugin internals, screenshot
pair-compare). The 9 `not-browser-sense` rows are genuine lexical hits (kimi-webbridge as
REA run/carrier label; chromium as crashed-process EXE path in a coredump corpus;
playwright-cli as an npx stub name). Rank 43 is the only borderline label (see Verdict).

## Counts (ranks 1–69)

- Total rows reviewed: 69
- Verdict `ok`: 69 (of which 1 borderline-label note: rank 43)
- Verdict `relabel`: 0
- Verdict `should-map`: 0
- Reason distribution: same-surface 59 (cdp-runtime-observation 53, recorded-har-producer-channel 4, reverse-engineering-of-shipped-artifacts 2), not-browser-sense 9, third-lane-report 1, no-claim-declared 0.
- Quote/integrity failures: 0.

## Deliverables

- `Report: .ufo/waves/round-35/w2/CritScreenKaidokuA.md` (this file)
- `.ufo/waves/round-35/w2/CritScreenKaidokuA/verdicts.tsv` — 69 rows, columns `key | verdict | reason+surface | one-sentence ground`
- `.ufo/waves/round-35/w2/CritScreenKaidokuA/c1-run-integration-083c5c6.json` — frozen-counter reading at the integration commit
- `.ufo/waves/round-35/w2/CritScreenKaidokuA/pinned-context-ranks1-69.txt` / `pinned-lines-ranks1-69.txt` — pinned sibling lines with context (evidence of (a))
- `.ufo/waves/round-35/w2/CritScreenKaidokuA/kaidoku-screen-rows-all137.tsv` — all 137 kaidoku screen rows with rank and ledger line for the A/B split
