# AdjKakeB — round 33 w1, C1 build: kake candidates 302–364

**Verdict.** All 16 assigned kake candidates are accounted for as **screens, zero new map rows**: 11 `not-browser-sense`, 1 `no-claim-declared`, 4 `same-surface` (`crawler-discipline-vs-publishing`). Every screen row verifies against the frozen counter (screened 16, `screenFindings` []), `check-adjacency` stays clean (10 rows, 10 verified, exit 0), and the lane's `corpus/adjacency.tsv` is byte-identical to the FREEZE commit. No candidate in this slice is a real overlap that is not already dispositioned by the existing `crawler-discipline-vs-publishing` split, so I coined no new kake surface and did not map a non-overlap to reach the wave target: this slice contributes `unaccounted 47 -> 31` and `newMapped +0`. The wave's `newMapped >= 4` must come from the 26 kake lines outside my slice and the 10 non-kake candidates; my slice cannot supply it honestly.

- Frozen pin for every kake candidate: `kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:<line>` (from `.ufo/waves/round-33/baseline/c1-candidates.tsv`).
- Scratch clone: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"`, `checkout -q --detach e6b0a9074d434ccc307badd312ae7379d1193fea`, toplevel verified equal to `$S/clone`.
- Validation commit (scratch clone only): `04a601e2087e3037c12a9986296baebab5f0d29e` — adds `corpus/adjacency-screen.tsv` (header + 16 rows); `corpus/adjacency.tsv` untouched.

## Commands, exit codes, receipts

All commands ran with `HYAKU_SCRATCH=/fast/scratch/hyaku`, `S=$HYAKU_SCRATCH/tabi-r33/AdjKakeB`, `TMPDIR=$S/tmp`; lane scripts were run only from the scratch clone.

| # | command | exit |
|---|---|---|
| 1 | `git clone --shared <lane> "$S/clone" && git -C "$S/clone" checkout -q --detach e6b0a907… && git -C "$S/clone" rev-parse --show-toplevel` (== `$S/clone`) | 0 |
| 2 | `node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs --rev e6b0a907… --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json` (baseline) | 0 |
| 3 | `git -C "$S/clone" -c user.name=AdjKakeB -c user.email=AdjKakeB@scratch.local commit --amend -m …` (screen ledger only) | 0 |
| 4 | `node "$S/clone/scripts/check-adjacency.mjs" --at 04a601e2087e3037c12a9986296baebab5f0d29e --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json` | **0** |
| 5 | `node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs --rev 04a601e2087e3037c12a9986296baebab5f0d29e --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json` | **1** (predicate false — expected for a screen-only slice) |
| 6 | `grep -F -c <each quote> "$S/out/kake-PROVINCE@044048597….txt"` (bytes from `git -C kake-shokunin show <pin>:PROVINCE.md`) | **0, exactly 1 hit, on the cited line — all 16** |
| 7 | `pgrep -fa 'chromedriver\|chromium'` | only host `earlyoom … (?\|/)chromium` (argv match, not mine); no browser or driver started |

Counter before (receipt `c1-baseline.json`, at FREEZE `e6b0a907…`):
`predicate false, candidates 52, mapped 5, screened 0, unaccounted 47, newMapped 0, adjacency clean 10/10`.

Counter after (receipt `c1-after.json`, at `04a601e2087e3037c12a9986296baebab5f0d29e`):
```
predicate=False candidates=52 mapped=5 screened=16 unaccounted=31 newMapped=0
screenFindings=[]  adjacency={verdict:clean, rows:10, verified:10, findings:0}
kake unaccounted at REV = [22,23,60,61,72,79,367,373,375,376,377,394,396,398,408,410,411,412,418,420,422,431,438,440]
mine still unaccounted  = []
```

`check-adjacency` at `04a601e2087e3037c12a9986296baebab5f0d29e` (receipt `adjacency.json`): `verdict=clean rows=10 verified=10 findings=0`, tips resolved from the lane-tip ladder for kaidoku/main, revenger/main, kake/master, kagi/master, kumitate/master, kama/master, tabi/master, fleet/master.

`adjacency.tsv` at `04a601e2087e3037c12a9986296baebab5f0d29e` is byte-identical to `e6b0a907:corpus/adjacency.tsv` (`diff` exit 0), so the map's 10 verified rows and its `crawler-discipline-vs-publishing` (kake) surface the screens key on are the baseline bytes.

## Per-candidate dispositions

| candidate key | decision | reason (both sides) |
|---|---|---|
| `kake@0440485…:302` | screen: `not-browser-sense` | Kake line is its `robots_audit` parser's limit (unknown records incl. `Sitemap`/`crawl-delay` ignored; "crawler-specific extension behavior" open) — publisher-side declaration parsing; tabi's practised surface (driving real browsers, CDP evidence capture — `PROVINCE.md:9-13`) is not claimed or touched. |
| `kake@0440485…:303` | screen: `no-claim-declared` | "This contract does not observe live fetches, redirects, caching, or crawler behavior" — kake explicitly declares no claim on exactly the live-fetch/redirect/cache/crawler ground tabi practises (`PROVINCE.md:3-4`); it disclaims the adjacent surface instead of claiming it. |
| `kake@0440485…:304` | screen: `same-surface` → `crawler-discipline-vs-publishing` | Restates the split ("browser-driving and client-side crawler discipline belong to tabi"); the reciprocal side is the already-verified row's tabi quote `PROVINCE.md:16` "web *publishing* (→ kake)". |
| `kake@0440485…:322` | screen: `not-browser-sense` | "Still open: live fetch, redirects, caching, crawler extensions, sitemaps…" lists kake's own publisher-audit gaps; the hit `crawler extensions` is robots extension semantics, not a driven browser. |
| `kake@0440485…:323` | screen: `same-surface` → `crawler-discipline-vs-publishing` | "Client-side crawler discipline stays with tabi; kake keeps" — split restated; tabi side `PROVINCE.md:16`. |
| `kake@0440485…:338` | screen: `same-surface` → `crawler-discipline-vs-publishing` | "publisher-side placement is kake's; client-side crawling stays with tabi" — split restated in one sentence after the sitemap step. |
| `kake@0440485…:340` | screen: `not-browser-sense` | Section heading of kake's publisher-side crawl-budget step; `crawl` is a search engine's budget, not tabi's client-side practice (tabi's rate boundary, `SKILL.md:681`, is its own request rate). |
| `kake@0440485…:342` | screen: `not-browser-sense` | "Round 49 adds publisher-side crawl-budget consequence knowledge" — publisher-side vendor knowledge, "no gate and no property measured" (344-347); no tabi surface named. |
| `kake@0440485…:343` | screen: `not-browser-sense` | Continuation naming `corpus/knowledge/crawl-budget-consequences.md` and S273/S274; the regex hit sits in a publisher-side knowledge filename. |
| `kake@0440485…:345` | screen: `not-browser-sense` | Quotes Google's crawl-budget allocation sentence — publisher-side vendor fact; tabi's rights/rate boundary is neither named nor affected. |
| `kake@0440485…:347` | screen: `not-browser-sense` | Vendor fact that emergency backoff throttles the crawl host-wide — a search engine's own rate, not tabi's driving rate. |
| `kake@0440485…:352` | screen: `not-browser-sense` | Heading for the canonical-selection/crawler-identity knowledge step; crawler identity is a search-engine signal, not a browser surface. |
| `kake@0440485…:358` | screen: `not-browser-sense` | Contrasts kake's declaration note with canonical selection inside its own publisher ground; the regex hit is the filename `crawler-identity.md`. |
| `kake@0440485…:359` | screen: `not-browser-sense` | Vendor knowledge that Googlebot subtype is read from the HTTP user-agent header; no browser driven, entry declared knowledge-only (361-362). |
| `kake@0440485…:362` | screen: `same-surface` → `crawler-discipline-vs-publishing` | "JS rendering stays open and stays tabi's adjacent province for anything that executes a browser" — split restated at the JS-rendering edge; the browser-execution half is already dispositioned. |
| `kake@0440485…:364` | screen: `not-browser-sense` | Caveat that held vendor entries (`crawl-error-status-table`) inherit subtype ambiguity; publisher knowledge, no browser execution. |

Full-length pins and verbatim quotes (4–25 words, >= 20 non-space chars each) are in `screen.tsv`; the exact-reason rationale is repeated in `candidate-decisions.tsv`.

## Findings and limits

1. **Zero new map rows (by judgement, not by omission).** Every one of the 16 lines is either (a) kake's publisher-side robots/sitemap/crawl-budget/canonical knowledge, (b) an explicit non-observation statement, or (c) a restatement of the publisher-vs-client split already mapped as `crawler-discipline-vs-publishing`. Mapping any of them would invent a second surface for an already-dispositioned split or map a non-overlap; both are refused by the seat contract. No new kake surface was coined (nothing to prefix/dedupe).
2. **The one call most open to attack** is `303 -> no-claim-declared`: it reads both as a tool limit (`not-browser-sense`) and as an explicit non-claim about tabi's ground. I chose the latter because the sentence enumerates exactly tabi's practised ground (live fetch, redirects, caching, crawler behaviour) and says the contract observes none of it; a wave-2 attacker should test that reading first. The other 11 `not-browser-sense` rows rest on the hit word sitting in kake's publisher-side knowledge/audit, with tabi's practice surfaces (`PROVINCE.md:9-13`, `SKILL.md:681` rights/rate boundary) untouched.
3. **`same-surface` rows key on the verified baseline surface.** `crawler-discipline-vs-publishing` is a `split-declared` row for kake in the baseline map (10/10 verified here), so the screens' surface column resolves; if a later round renames that surface, these four screens break with `screen-surface-unmapped`.
4. **Counter semantics limit** (as disclosed in `claims.json`): the counter cannot judge overlap; my receipts prove accounting and quote validity, not the semantic choices. The wave-2 attacks on the `same-surface` and `no-claim-declared` groups are the guard.
5. **No-harm:** no lane tracked file was edited (the lane worktree received only my report and output dir), no lane/fleet/sibling git state was touched, no commit outside `$S/clone`, no browser/chromedriver started, no tool installed (nothing needed; `pacman` untouched), no network fetch made.
6. Scratch `$S` was removed after receipts were copied here.

## Deliverables

- Report: `.ufo/waves/round-33/w1/AdjKakeB.md`
- Output dir `.ufo/waves/round-33/w1/AdjKakeB/`: `screen.tsv` (16 rows, 5 TAB columns, no header; sha256 b44e10a2d5b8b87bb4c08bfc01f3aa198b3b865146ad89058f6fa08df7c024f6), `rows.tsv` (0 bytes: zero map rows), `candidate-decisions.tsv`, `adjacency-screen.tsv.committed` (header + 16 rows as committed at `04a601e2087e3037c12a9986296baebab5f0d29e`), `adjacency.json`, `c1-after.json`, `c1-baseline.json`, `quote-checks.txt`, `exit-codes.txt`, `rev.txt`.
