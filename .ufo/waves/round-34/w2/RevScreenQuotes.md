# RevScreenQuotes — tabi round-34 w2 — mechanical integrity of the C1 integration

## Verdict

**HOLDS.** I attacked the mechanical integrity of the C1 integration at 04f9623dde8ad35d470cecf766e421eafbcb47fa — all 62 rows of `corpus/adjacency-screen-skill.tsv` and the 4 new map rows (rows 15–18) of `corpus/adjacency.tsv` — with an independent script that re-reads every cited line from the fleet sibling repos at the cited pins and the lane at REV, and found **zero defects**: every quote (62 screen quotes; sibling/tabi/ruling quotes of the 4 new rows) is a verbatim substring of the line it cites, within 4–25 words and ≥ 20 non-space chars; every screen key is a frozen candidate key of `.ufo/waves/round-34/baseline/c1-candidates.tsv`, none duplicated; every same-surface surface names a map row verified by `check-adjacency` for the same sibling and every other reason carries surface `-`; all 67 candidates appear **exactly once** (5 mapped by verified rows, 62 screened, unaccounted 0, no candidate covered twice). The frozen counter at that rev reports `predicate=true, mapped=5, screened=62, unaccounted=0, newMapped=4, screenFindings=[]` and `check-adjacency` is `verdict=clean rows=17 verified=17` (exit 0). The L1's claimed numbers reproduce from frozen bytes in a clean clone; on the mechanical axis this integration is not broken.

## What I ran (clean clone, exit codes verbatim)

Setup: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"; git -C "$S/clone" checkout -q --detach 04f9623dde8ad35d470cecf766e421eafbcb47fa` → `rev-parse --show-toplevel` = the clone; `rev-parse HEAD` = `04f9623d…`. Byte identity before executing: worktree counter sha256 = `0dba816ccab0b7bf690c3a4da6d850ce4a5a092d9aec895e33c9e7fe75a8781e` = `frozenDigests["…c1-adjacency-sweep-v2.mjs"]`; worktree `scripts/check-adjacency.mjs` sha256 = `4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac` = the digest pinned inside the counter; worktree `corpus/adjacency.tsv` and `corpus/adjacency-screen-skill.tsv` byte-equal their REV blobs (`git cat-file blob`).

- `node <clone>/scripts/check-adjacency.mjs --at 04f9623d… --repo <clone> --fleet /home/vgpnk/Projects/shokunin` → exit **0**, stdout line 1: `ADJACENCY verdict=clean rows=17 verified=17`.
- Same with `--json` → exit **0**, `verdict=clean rows=17 verified=17 findings=[]` (no flagged row; all 17 map rows verified).
- `node <clone>/.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs --rev 04f9623d… --repo <clone> --fleet /home/vgpnk/Projects/shokunin --json` → exit **0**; text mode also exit **0**: `C1_ADJACENCY_SWEEP_V2 predicate=met rev=04f9623d… adjacency=clean candidates=67 mapped=5 screened=62 unaccounted=0 newMapped=4 screenFindings=0`.
- `node <clone>/.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs --list-candidates --repo <clone> --fleet /home/vgpnk/Projects/shokunin` → exit **0**; output is **byte-identical** to the frozen `c1-candidates.tsv` (67 rows, line-for-line), so the counter's candidate set equals the frozen-before-data list.
- `node verify-c1-mechanical.mjs` (my script, on the same clone) → exit **0**, `"findings": []`, `"verdict": "HOLDS"`.

Frozen counter output, jq-selected as the item requires:

```json
{
  "predicate": true,
  "candidates": 67,
  "mapped": 5,
  "screened": 62,
  "unaccounted": 0,
  "newMapped": 4,
  "newMappedRows": [
    { "row": 15, "surface": "live-delivery-observation", "sibling": "kake", "disposition": "split-declared" },
    { "row": 16, "surface": "lab-performance-tool-runs", "sibling": "kake", "disposition": "split-declared" },
    { "row": 17, "surface": "agent-facing-tool-text-craft", "sibling": "kotoba", "disposition": "split-declared" },
    { "row": 18, "surface": "authenticated-consequential-driving", "sibling": "kasegi", "disposition": "refused-route" }
  ],
  "adjacency": { "verdict": "clean", "rows": 17, "verified": 17, "findings": 0 },
  "screenFindings": []
}
```

## Mechanical checks, per condition of the item

My script (`verify-c1-mechanical.mjs`, delivered) re-derives every fact from git objects — `git -C <fleet>/<lane>-shokunin show <pin>:<path>` for sibling sides, `git -C <clone> show REV:<path>` / `BASE:<path>` for tabi sides — it does not trust the ledger's own bytes for any quote target.

1. **Frozen candidate list integrity** — 67 keys (set A 38, set B 29), each parses as `<lane>-shokunin@<40hex>:<path>:<line>`, each unique; every set-A pin equals the same lane's pin in `c1-pins.json` (and in the counter's frozen `PINS`); and for all 67 the frozen text column equals the line read from the sibling repo at the key's own commit (trimmed compare). No drift between the frozen list and the repos.
2. **Screen quotes verbatim at the pin** — for each of the 62 rows: `quote` is a substring of the candidate's raw line at the commit named in its key (0 failures); words 4–25 and ≥ 20 non-space chars (0 failures); header is exactly `sibling_ref⇥reason⇥surface⇥quote⇥note`; every row has 5 columns.
3. **Screen keys frozen + unique** — all 62 `sibling_ref` values are keys of the frozen list (0 orphans); no key appears twice. By reason: same-surface 35, third-lane-report 23, no-claim-declared 3, not-browser-sense 1 (= 62).
4. **Same-surface targets verified** — every `same-surface` row's (folded surface, sibling of the candidate) is a map row that `check-adjacency` verified at REV (flagged set empty, so all 17 rows count); every non-same-surface row carries surface `-` (0 violations).
5. **New map rows (corpus/adjacency.tsv lines 15–18)** — their folded (surface, sibling) keys are absent from the baseline map (13 rows at 15dfacc…), giving exactly 4 new rows. For each: `sibling_quote` verbatim at its own pinned sibling line; `tabi_quote` verbatim at the cited line of the tabi file at REV; that declaration line is absent (trimmed) from the same file at the baseline; `tabi_quote` names the sibling (`\b<kake|kotoba|kasegi>\b`); disposition clause holds (split-declared rows 15–17 have `\btabi\b` in `sibling_quote`; row 18 is refused-route) with `ruling_ref` = `-` and `ruling_quote` verbatim inside the tabi file named by `tabi_ref`. All quote-length limits hold. 0 failures.
6. **Exactly-once coverage** — each of the 67 candidates is mapped by exactly one verified map row (lane + path + trimmed pinned line text) or screened by exactly one row: unaccounted 0, no candidate in both, no candidate in two (mapped 5 = 1 baseline row `cdp-live-target-census`/kama + 4 new; screened 62; 5 + 62 = 67).
7. **Counter/gate cross-check** — the counter's own `screenFindings` is `[]` and my independent findings list is empty; the one `leadsReanchored` entry (`corpus/knowledge/mirror-pitfalls.md:39@044048… -> 40`) is the counter's documented ±2 anchoring, and both the frozen candidate key and screen row already cite `:40`, so the quoted-against line is the anchored one.

## Residual risk / scope notes

- Mechanical only: this seat does not judge whether a `same-surface` or `not-browser-sense` reason is *semantically* deserved (count boundaries vs surface strings) — those belong to the per-reason semantic attack seats. On the six conditions named in my item, nothing moves.
- My first run reported one "major" finding — `expected 18 data rows, found 17` — which was my own wrong expectation (13 baseline + 4 new = 17 data rows; the goal's "rows 15-18" refers to file line numbers under the header). Artifact corrected in my script only; no lane file touched, no repair made anywhere.
- No network fetches, no tool installs/updates, no browser launches. All git mutations were confined to the scratch clone (`rev-parse --show-toplevel` asserted equal to the clone before use). Lane repo, fleet repo, sibling repos read-only.

## Deliverables

- Report: `tabi-shokunin/.ufo/waves/round-34/w2/RevScreenQuotes.md` (this file)
- Script: `tabi-shokunin/.ufo/waves/round-34/w2/RevScreenQuotes/verify-c1-mechanical.mjs`
- Full verification output (gate JSON, counter JSON, coverage, findings): `tabi-shokunin/.ufo/waves/round-34/w2/RevScreenQuotes/verify-c1-mechanical.json`
- Selected counter output: `tabi-shokunin/.ufo/waves/round-34/w2/RevScreenQuotes/counter-selected.json`
- Scratch `/fast/scratch/hyaku/tabi-r34/RevScreenQuotes/` deleted after copying receipts.
