# CritC1Counter — C1 first falsifier (round 33, w1)

Seat: CritC1Counter (attack only; no repairs, no lane writes).
Attacked: `.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs` (sha256 `da59d157…c6380`, equal to `claims.json.frozenDigests` **and** to the freeze-commit blob `e6b0a90:.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs`) and `claims.json` claim C1.
Gate under it: `scripts/check-adjacency.mjs` at `e6b0a90` = `4e2c2a64…4aac` (= the digest pinned inside the counter; the counter refuses otherwise).

## Verdict

**Defect (high).** C1's frozen predicate is reachable with zero overlap work, and cheaper than the disclosed mislabel: `predicate=true`, exit 0, `adjacency clean 14/14`, `unaccounted 0`, `newMapped 4` on a map where **three of the four dispositions are `refused-route` rows that carry no fleet evidence at all** — their only "names the other side" content is *one* tabi line (`PROVINCE.md:16`, `web *publishing* (→ kake), …`) reused verbatim as `tabi_quote` on all four rows, while each candidate-line `sibling_quote` names nobody (receipt `D.json`). The same counter accepts four `contested-open` rows backed by a **round-17** l0 line about the musketeer lease for lines the question never mentions (`A.json`), and a `ruled` row backed by a **round-17 spotcheck statistics bullet** that merely lists six sibling names (`I.json`). Two further counting defects are independent of disposition semantics: `newMapped` counts a row that re-covers a candidate **already mapped at the baseline** (the map's pin identity is line-number-based, so a sibling line that moved 30→34 becomes a second, "new" pin for the same sentence — `H2.json`), and `screenFindings` never gates the predicate, so a ledger with 43 schema-violating duplicate rows still exits 0 (`dup.json`). The multi-line/short-quote/cross-sibling surface/CRLF/row-number guards that the ticket asked about all **hold**; the candidate regex additionally drops one browser-domain line it should select (`kake:415`, "may keep being crawled"), and an infrastructure crash exits **1**, the code documented as "evaluated, predicate not met".

## Evidence

All runs: `HYAKU_SCRATCH=/fast/scratch/hyaku`, seat scratch `/fast/scratch/hyaku/tabi-r33/CritC1Counter` (deleted at the end), clone `git clone --shared …/tabi-shokunin $S/clone` detached at `e6b0a9074d434ccc307badd312ae7379d1193fea`, `TMPDIR=$S`, every git call `-C "$S/clone"` with `rev-parse --show-toplevel` verified equal to `$S/clone`. Counters run as

```
node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs \
  --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --rev <REV> --json
node scripts/check-adjacency.mjs --at <REV> --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json
```

### Baseline reproduces the claim's `before` (control)

`--rev b7d16fb8… --> EXIT=1`
`{"predicate":false,"candidates":52,"mapped":5,"screened":0,"unaccounted":47,"newMapped":0,"adjacency":{"verdict":"clean","rows":10,"verified":10,"findings":0}}` → `receipts/base.json`. Matches `claims.json` C1 `before` exactly. `corpus/adjacency-screen.tsv` absent at the freeze commit (`git show e6b0a90:corpus/adjacency-screen.tsv` → `fatal: path … does not exist`).

### D1 — high — `newMapped`'s "names the other side" is one reusable tabi line; no fleet evidence needed

Counter `.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs:217-233` (the `newMappedRows` filter), specifically `:222`
`return /\btabi\b/i.test(r.siblingQuote) || new RegExp(\`\\b${r.sibling…}\\b\`,'i').test(r.tabiQuote);`

Construction `attackD` (`REV=5c883af8dd71f67e1a85941dffde1e700168cd82`, `receipts/attackD-adjacency.tsv`, `receipts/D.json`): baseline map + four rows

```
refuse-crawl-budget-ground        kake kake-shokunin@0440…:PROVINCE.md:302 "Unknown records, including `Sitemap` and `crawl-delay`, are ignored"
refuse-crawl-contract-limits      kake …:303 "This contract does not observe live fetches, redirects, caching, or crawler behavior"
refuse-crawl-open-frontier        kake …:322 "Still open: live fetch, redirects, caching, crawler extensions, sitemaps"
refuse-crawl-budget-consequence   kake …:342 "Round 49 adds publisher-side crawl-budget consequence knowledge"
  all: tabi_ref PROVINCE.md:16, tabi_quote "web *publishing* (→ kake), secrets (→ kagi", disposition refused-route, ruling_ref "-"
```

`ADJ_EXIT=0` `verdict clean rows 14 verified 14 findings []`; `COUNTER_EXIT=0`
`{"predicate":true,"candidates":52,"mapped":9,"screened":43,"unaccounted":0,"newMapped":4,"adjacency":{"verdict":"clean","rows":14,"verified":14,"findings":0}}`.

Why this is beyond the disclosure: `claims.json` C1 `feasibilityDisclosed` says "four new rows on candidate lines **whose quotes name the other side**" reach `newMapped 4`. Here no candidate-line quote names tabi, no ruling exists, no l0 line exists, and **all four rows share one tabi sentence** — a sentence that enumerates every refused route (so it names `kake` and `kagi` for any candidate line, indefinitely). `check-adjacency` has no ruling_ref uniqueness rule (only `duplicate_row` on folded surface+sibling and on the sibling pin), so the same tabi line backs arbitrarily many rows.

Same class via `ruled`: construction `attackI` (`REV=2dd72a218d9d025a59913d1193e14503c0708b18`, `receipts/I.json`), one row `ruled` with
`ruling_ref tabi-shokunin@e6b0a90…:corpus/lessons/round-17-verifier-spotcheck.md:83`, `ruling_quote "Distinct \`sibling\` values: **6** (\`kagi kaidoku kake kama kumitate revenger\`)"` →
`ADJ_EXIT=0` `verdict clean rows 14 verified 14 selfRulings [2, 15]`, `COUNTER_EXIT=0`, `predicate true`, `newMapped 4`. A line whose subject is the map's own statistics certifies a disposition of `kake:60`'s JS-canonical frontier. The counter never reads `selfRulings` (`receipts/adjI.json`).

### D2 — high — `contested-open` accepts a stale round-17 l0 line, though the claim demands a round-33 one

The claim: "contested-open needs a fleet L0 line `tabi | round-33 | …` naming the sibling". `check-adjacency` requires only `tabi | round-<N> |` (header, `scripts/check-adjacency.mjs:88-91`), and the counter (`:220`) adds nothing.

Construction `attackA` (`REV=80f274d65409a5d87e7c681a1904f123b865cbb5`, `receipts/attackA-adjacency.tsv`, `receipts/A.json`): four rows, all `contested-open`, all citing **one** round-17 line `fleet@ebeb396f7db43c55de2711baa409f8bb9b71147b:.ufo/l0-questions.md:62` ("Contested scope … the the-musketeer Chrome profile / CDP … lease named by kagi … and kake …, Request: rule the lease owner between kagi and kake"), on candidates `kagi:20` (the-janitor CLI line), `kagi:59` (deliberate refusals), `kake:22` (crawl hygiene first entry), `kake:60` (broader crawl open).
`ADJ_EXIT=0` clean 14/14; `COUNTER_EXIT=0` `predicate true`, `mapped 9`, `screened 43`, `unaccounted 0`, `newMapped 4`. No round-33 l0 line, no ruling, and the cited question does not mention `kagi:20`/`kake:22`/`kake:60` at all.

### D3 — medium — `newMapped` counts a row that re-covers an already-mapped candidate

`byText` keys on `(sibling, trimmed line text)` at whatever commit the row cites (`:175-183`), while `check-adjacency`'s pin identity is `lane@path:line`, commit-independent. When a sibling's sentence moved between the baseline-cited pin and the frozen pin, the same sentence becomes a *second* valid pin.

Construction `attackB` (`REV=62750e305b183fdd15a98fa58e47102cf326f1f1`): four re-filings of the five already-mapped candidates at the frozen pins. `ADJ_EXIT=1` — rows 16/17/19 `duplicate_row` (`pin=kagi@PROVINCE.md:43 first_row=8`, `pin=kaidoku@PROVINCE.md:53`, `pin=revenger@PROVINCE.md:5`) — **but row 18 was clean**: baseline row 6 cites `kake-shokunin@7c61c8cc…:PROVINCE.md:30`, my row cites `kake-shokunin@04404859…:PROVINCE.md:34`, same sentence. `COUNTER_EXIT=1` with `"newMapped":5` and `newMappedRows` containing `{row:18, surface:'rex-kake-lease-line'}` — a "new verified map row" covering a candidate already mapped at baseline. `receipts/attackB-adjacency.tsv`, `receipts/B.json`, `receipts/adjB.json`.

Passing form — `attackH2` (`REV=6e2f65adf289951510008943a7632fd25054b262`, `receipts/H2.json`): 3 fresh `refused-route` rows + row 15 `refuse-lease-sentence-refiled` on `kake:34` (already mapped) + 44 screens → `ADJ_EXIT=0` clean 14/14, `COUNTER_EXIT=0`, `predicate true`, `newMapped 4` where **only three of the four rows answer a previously-unaccounted line**.

### D4 — medium — `screenFindings` never gates the predicate or the exit code

`screened`/`screenFindings` are built at `:186-210`; the predicate at `:239` is `gate.verdict === 'clean' && unaccounted === 0 && newMapped >= 4` — `screenFindings.length` is absent, and `:260` exits on `predicate` only.

Duplicate-ref variant (`REV` = the `dup` commit, `receipts/dup.json`, `receipts/c.json` for contrast): every one of the 43 screen rows duplicated.
`COUNTER_EXIT=0` `predicate true`, `screened 43`, `screenFindings` = 43 × `screen-duplicate`. `:206` records the finding and `continue`s, leaving the first row's screening in force — so a ledger can violate its own schema on 100 % of its rows and still pass. (`claims.json` C1's `killRule` also never mentions findings.)

### D5 — low-medium — a crash exits 1, the "predicate not met" class

`main()` rethrows every non-`Refusal` error (`:261-262`); Node exits 1 with an empty stdout, which the header documents as "0 predicate met; 1 evaluated, predicate not met; 2 could not evaluate" and `killRule` reads as "failed".

```
TMPDIR=/nonexistent/hyaku-tabi node …c1-adjacency-sweep.mjs --repo $S/clone --fleet … --rev 62750e30… --json
EXIT=1  stdout bytes: 0  stderr: Error: ENOENT … mkdtemp '/nonexistent/hyaku-tabi/tabi-r33-c1-XXXXXX'
```
`receipts/crash-out.txt`, `receipts/crash-err.txt`. Exit-2 paths are otherwise correct: malformed rev → 2 (`revision must be 40-hex: deadbeef`), unknown rev → 2, REV without the gate → 2.

### D6 — low — candidate selection misses crawl/scrape inflections

`REGEX` (`:65`) has `crawl(er|ers|ing)?` and `scrap(e|er|ers|ing)`: `crawled`, `crawls`, `scraped`, `scrapes` are excluded. Over all 20 sibling `PROVINCE.md` at the frozen pins exactly one line is browser/crawl-domain and excluded:

```
kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:415
"a new row: a deleted URL that answers `HTTP 200 OK` may keep being crawled; the page asks the publisher to confirm"
```
It is not in `receipts/cands.tsv` (52 keys) and `new RegExp('\\b(crawl(er|ers|ing)?|scrap(e|er|ers|ing))\\b','i').test('may keep being crawled')` → `false`. The sweep is therefore not exhaustive over its own vocabulary (undercount 1 at these pins, verified; `scraped/scrapes` matched no sibling line).

### D7 — low — `refused-route`'s ruling_quote need not be on the cited tabi_ref line

`check-adjacency.mjs:96-100` documents this ("for split rows, not in the tabi file"), and construction `attackF` (`REV=b295dc7adb8029b958015e5fb7ade4ae6e855f5d`, `receipts/attackF-adjacency.tsv`) confirms it: `tabi_ref PROVINCE.md:9` with `ruling_quote "**Refuses:** reverse engineering as forensics (→ revenger/kaidoku),"` (line 15) → `ADJ_EXIT=0` clean 11/11, counter `mapped 6`. Documented, but it is the mechanism that makes D1's single-reused-line cheat comfortable.

## Guards that hold (tested, no defect)

| Probe | REV | Result |
|---|---|---|
| `same-surface` naming a **verified surface of another sibling** (`secrets-vault-ops` on a kake candidate) | `fb4f8b30…` (`E.json`) | `screen-surface-unmapped`, 38 candidates unaccounted, `predicate false`, EXIT=1 |
| `same-surface` naming a verified surface of the **same** sibling | same | accepted (as designed; note the surface is never checked against the line) |
| 3-word quote / quote absent from the line / unknown reason | same | `screen-quote`, `screen-quote`, `screen-reason-unknown`; those candidates unaccounted, EXIT=1 |
| Screen ledger in CRLF | `crlf` commit (`crlf.json`) | `findings 0`, `predicate true` — CRLF neutralised |
| Map in CRLF | `bbe9e2d4…` (`G.json`, `adjG.json`) | gate clean 11/11, `mapped 6` — CRLF neutralised |
| Four rows on **one** candidate pin | `62750e30…` (`adjB.json`) | `duplicate_row` (commit-independent `lane@path:line`); only the moved-line row slipped through (D3) |
| Gate finding row number vs the counter's `parseMap` row number | `adjB.json` rows 16/17/19 ↔ map file lines 16/17/19 | aligned; flagged rows excluded from `verifiedRows`/`newMappedRows` |
| Cross-sibling map row (sibling_ref lane ≠ `sibling` column, or path ≠ `PROVINCE.md`) | read-only audit `:178-181` | guarded (`c.lane !== r.sibling`, `c.path !== PROVINCE`, `c.text === null` all skip) |
| Duplicate candidate texts within a lane (one row covering several candidates) | `--list-candidates` | none at these pins (0 duplicate `(lane, text)` pairs) — latent, not reachable |

## Impacted axes

- **adjacency 8** (the claimed move): the target is met by constructions that add no adjudication, so the axis would read as moved while nothing moved.
- **calibration**: the counter is the instrument; D1–D4 mean it cannot distinguish an honest sweep from a decorated one — the wave-2 semantic guard and the closure spot-check are the only remaining bound, and they are outside the frozen predicate.

## Smallest safe correction (round 34; the counter is frozen now)

1. Count **newly accounted candidates**, not new rows: require each `newMapped` row's candidate to be unaccounted at BASELINE, and require 4 distinct candidates (kills D3 and re-filing).
2. Make the "other side" proof non-reusable: require `ruling_ref`/`contested-open` refs to be unique across the map, require the l0 row to be `tabi | round-33 |`, drop `selfRulings` rows from `newMapped`, and drop the `tabi_quote` branch of `:222` (or require that tabi line's surface to be the row's own surface) (kills D1, D2).
3. Fold `screenFindings.length === 0` into the predicate and the exit-0 condition; make `screen-duplicate` leave the duplicated candidate unaccounted (kills D4).
4. Map every non-`Refusal` exception to exit 2 (kills D5).
5. `crawl(s|ed|er|ers|ing)?`, `scrap(e|es|ed|er|ers|ing)` (kills D6).
6. For `check-adjacency` next round: require split/refused `ruling_quote` to be on the cited `tabi_ref` line (D7).

For **this** round the honest path is unaffected: one disposition per line whose reason the line actually supports, at most one new row per cited ruling/l0 line, and no reuse of `PROVINCE.md:16` as a blanket refusal.

## Hygiene / tooling

- No lane tracked file, lane index/jj state, fleet repo or sibling repo was written; every edit lived in `$S/clone` (`rev-parse --show-toplevel` = `$S/clone`), commits made with `-c user.name=CritC1Counter -c user.email=CritC1Counter@scratch.local`.
- No browser, chromedriver or network fetch was used. `pgrep -fa 'chromedriver|chromium'` → no process owned by this seat.
- No tool installed or upgraded.
- Scratch `/fast/scratch/hyaku/tabi-r33/CritC1Counter` deleted after copying receipts.

## Deliverables

- This report: `.ufo/waves/round-33/w1/CritC1Counter.md`
- Receipts: `.ufo/waves/round-33/w1/CritC1Counter/receipts/` — `base.json`, `A.json`+`adjA.json`+`attackA-*`, `B.json`+`adjB.json`+`attackB-*`, `D.json`+`adjD.json`+`attackD-*`, `E.json`+`attackE-*`+`E-cases.json`, `F.json`+`adjF.json`+`attackF-adjacency.tsv`, `G.json`+`adjG.json`+`attackG-crlf-proof.txt`, `H2.json`+`adjH2.json`+`attackH2-*`, `I.json`+`adjI.json`+`attackI-*`, `dup.json`, `c.json`, `crlf.json`, `cands.tsv` (52 candidates), `crash-out.txt`, `crash-err.txt`, `*.rev` (commit ids of every constructed revision).
