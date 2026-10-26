# CritRowCrawlBudget — round 33 w2 — map row `crawl-budget-vs-client-crawl-thresholds`

Seat: leaf critic, one item, no dispatch. Revision attacked: `042d6d9abf97d567d495652a85eabc851b81adc1`
(the L1 integration every w2 seat attacks). Sibling pin attacked: `kake-shokunin@044048597d62f3199494b63b36e90dd57825e350`.

**Verdict: defect — severity medium (claim-calibration), high if the round books C1 as four distinct new
boundaries.** The row is honest in every mechanical respect the map can check (9 columns, both quotes verbatim on the
cited lines, gate `ADJACENCY verdict=clean rows=14 verified=14`, counter `predicate true` reproduced), the tabi-side
declaration is truthful about this lane's corpus and absorbs no kake ground, and `split-declared` is the right
disposition *if* the line is an overlap at all. What fails is the overlap itself. `kake PROVINCE.md:347` is the only
one of the four new-row anchors whose cited line contains **no other-lane hand-off at all** (`grep -c tabi` over
`PROVINCE.md:340-350` = 0; the block ends "Publishing stays operator-owned", `:347-348`), and its ground is filed by
kake itself as a continuation of the robots surface already mapped at row 13 ("The lane's held robots rows stop at
what a directive means. They do not say what blocking costs", `crawl-budget-consequences.md`; ground line "per-host
crawl hygiene — budget consequence of robots and status codes"). The boundary the new surface name asserts — client
crawl discipline is tabi's, publisher crawl knowledge is kake's — is stated verbatim by kake at `PROVINCE.md:34` and
already dispositioned by row 6 (`crawler-discipline-vs-publishing`), whose kake quote *is* that sentence. The row is
therefore a re-key of an already-mapped boundary carrying a new kake fact, and it is load-bearing: drop it and the
frozen predicate goes false twice over (unaccounted 5, newMapped 3). The map cannot see this, because the surface
string — not the boundary — is what `newMapped` counts (three probes below).

## Per-question verdicts

1. **Real overlap between a kake surface and a surface tabi actually holds? — defect (medium).** The tabi side is
   real (see Q3), but the kake side claims only publisher ground and names nobody. Rows 12, 13 and 14 each quote a
   kake line that states a hand-off ("browser execution stays tabi's", `PROVINCE.md:61`; "…belong to tabi",
   `:304`; "execution stays separately authorized adjacent work", `:79-80`). Row 15's kake quote names no lane and no
   boundary; the "other side" exists only because this round wrote `SKILL.md:2890`. The only new element versus row 6
   is a fact inside kake's already-declared side of that boundary, which the map's own convention screens rather than
   maps — the same ledger screens `kake:338` "Boundary unchanged: publisher-side placement is kake's; client-side
   crawling stays with tabi" as `same-surface` on `crawler-discipline-vs-publishing` (`corpus/adjacency-screen.tsv:14`).
   The w1 owner of these candidates reached the same reading and refused to coin a surface for it
   (`.ufo/waves/round-33/w1/AdjKakeB.md:52` "a search engine's own rate, not tabi's driving rate"; `:63` "Mapping any
   of them would invent a second surface for an already-dispositioned split").
2. **`split-declared` right rather than `refused-route` / `contested-open`? — holds (as a form).** Both lanes hold
   parts (kake the publisher consequence, tabi the client thresholds), so it is not a refusal; and no fleet L0 line
   contests crawl budget (`fleet .ufo/l0-questions.md:62` is the musketeer lease, `:65` the CDP-ruling scope; no
   `tabi | round-33 |` line exists), so `contested-open` would have no `l0_line_absent`-passing citation. If the
   finding in Q1 stands, the right landing is a screen row, not a different disposition.
3. **Tabi-side declaration truthful and non-absorbing? — holds.** `SKILL.md:2890` claims only what the lane holds:
   the decision table's thresholds exist and carry numbers (`corpus/knowledge/rate-signal-decision-table.md:49-61`,
   D1–D13, including the pacing rows D6 "at least 1 minute", D13 "at least 1 second"), and the lane's province names
   the rate surface (`PROVINCE.md:10` "rate/rights"; `SKILL.md:681` §Rights / rate boundary). No kake ground is
   absorbed: `S273`/`S274` appear nowhere in `corpus/SOURCES.md`, and the only occurrence of "crawl budget" in lane
   prose outside the round lesson and the map is the declaration line itself, which assigns the fact away ("is kake's
   publisher-side knowledge … never absorbed here"). kake's own file confirms no tabi-side fact was taken either
   ("Publishing stays operator-owned", `crawl-budget-consequences.md` §What this entry does not establish).
4. **Both quotes verbatim on the cited lines? — holds.** Independent substring check, not the gate's:
   `sibling_quote` "backoff reduces the crawl rate across the whole hostname" is a substring of
   `kake PROVINCE.md:347` at the pin (9 words, 48 non-space chars); `tabi_quote` (15 words) and `ruling_quote`
   (12 words) are both substrings of `SKILL.md:2890` at `042d6d9`; `tabi_ref` `SKILL.md:2890` resolves; 9 columns;
   `sibling` == the lane token in `sibling_ref`.
5. **Distinct surface from the existing kake rows, or a cosmetic rename? — defect (medium; the probes below are the
   evidence).** Functionally indistinguishable from a relabel: with identical content the predicate reads true under a
   synonym surface name (P3) and false when the same content is keyed under the already-mapped surface (P2b, gate
   `duplicate_row row=15 … first_row=6`). The boundary, not the label, is what should move the count.
6. **Lesson record accuracy (secondary, low).** `corpus/lessons/round-33.md:114-116` says the L1 re-screened
   "kake 340–364 `same-surface` … on the mapped split". The landed ledger does not: `:340`, `:342`, `:343`, `:345` are
   screened on the **new** surface name (`corpus/adjacency-screen.tsv:15-18`), `:347` is **mapped** (row 15), and
   `:352-367` are screened on `crawler-discipline-vs-publishing` (`:19-24`). Two clauses of the override sentence
   contradict the record it describes.

## Evidence (commands, exit codes, file:line)

Scratch `S=/fast/scratch/hyaku/tabi-r33/CritRowCrawlBudget`, `TMPDIR=$S/tmp`; clone
`git clone --shared …/tabi-shokunin "$S/clone"` then `git -C "$S/clone" checkout -q --detach 042d6d9…`
(`git rev-parse --show-toplevel` = `/fast/scratch/hyaku/tabi-r33/CritRowCrawlBudget/clone`; `git status --porcelain`
0 lines before any probe). Every commit is inside that clone only, made with
`-c user.name=CritRowCrawlBudget -c user.email=CritRowCrawlBudget@scratch.local`; the lane, the fleet and every sibling
were read-only. Receipts copied to the output dir before scratch removal.

```
# R1 lane gate at the attacked revision
node scripts/check-adjacency.mjs --at 042d6d9abf97d567d495652a85eabc851b81adc1 --repo "$S/clone" \
  --fleet /home/vgpnk/Projects/shokunin --json        -> exit 0
{"verdict":"clean","rows":14,"verified":14,"findings":[],"selfRulings":[2]}

# R2 frozen counter at the same revision (reproduces the L1 measure at bf48b81 exactly)
node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs --repo "$S/clone" \
  --fleet /home/vgpnk/Projects/shokunin --rev 042d6d9… --json   -> exit 0
{mapped 9, screened 43, unaccounted 0, newMapped 4, predicate true, adjacency clean 14/14}
[L1 receipt for comparison: .ufo/waves/round-33/measure/c1-at-bf48b81.json — identical projection]

# R3 quote check (python over `git show`, independent of the gate)
kake347 = 'backoff reduces the crawl rate across the whole hostname (S274). Publishing'
sib_quote verbatim: True (9 words / 48 non-space) | tabi_quote on SKILL.md:2890: True (15 words)
ruling_quote on SKILL.md:2890: True | cols 9 | disposition split-declared | ruling -

# P1 drop row 15 (corpus/adjacency.tsv:15); commit 8779b7a5… in the clone
node …/c1-adjacency-sweep.mjs --rev 8779b7a5… --json          -> exit 1
{mapped 8, screened 39, unaccounted 5, newMapped 3, predicate false, adjacency clean 13/13}
# the four screens naming the dropped surface go invalid (unaccountedKeys names kake:340,342,343,345,347)

# P2b re-key row 15 under the already-mapped surface, screens re-pointed too; commit 31de4db7…
node …/c1-adjacency-sweep.mjs --rev 31de4db7… --json          -> exit 1
{mapped 8, screened 43, unaccounted 1, newMapped 3, predicate false, adjacency failed 13/14}
node scripts/check-adjacency.mjs --at 31de4db7… -> exit 1
ADJACENCY verdict=failed rows=14 verified=13
finding row=15 reason=duplicate_row detail=surface=crawler-discipline-vs-publishing sibling=kake
  pin=kake@PROVINCE.md:347 first_row=6
# (P2, the same re-key with the mobile screens left behind: b7c5f3ac…, exit 1, unaccounted 5)

# P3 pure synonym rename of the surface, content byte-identical otherwise, screens re-pointed; commit cfcc4d17…
node …/c1-adjacency-sweep.mjs --rev cfcc4d17… --json          -> exit 0
{mapped 9, screened 43, unaccounted 0, newMapped 4, predicate true, adjacency clean 14/14}

# R4 kake-side reading at the pin
git -C kake-shokunin show 04404859…:PROVINCE.md | nl -ba | sed -n '34,35p;304p;340,350p'
:34  `tabi` drives browsers and owns client-side crawler discipline; kake owns
:35  publisher-side placement (robots/sitemap at the host it serves).
:304 Boundary: kake owns publisher-side robots/sitemap placement at the host it serves, while
     browser-driving and client-side crawler discipline belong to tabi (PROVINCE.md, Adjacent);
     this audit does not probe or publish an owned property.
:342 Round 49 adds publisher-side crawl-budget consequence knowledge
:347 backoff reduces the crawl rate across the whole hostname (S274). Publishing
:348 stays operator-owned. …
grep -c tabi over :340-350  ->  0

# R5 no absorbed kake ground in this lane
grep -rn -i "capacity limit|shift newly available|crawl budget|backoff" corpus/ SKILL.md PROVINCE.md  -> only SKILL.md:2890
grep -n "S273|S274" corpus/SOURCES.md -> no matches
```

Reading of the three probes together: the counter takes `newMapped` from rows whose folded `surface + sibling` pair is
absent at the baseline and which map at least one candidate (`c1-adjacency-sweep.mjs:216-224`); the gate refuses two
rows on one folded pair (`duplicate_row`). So P2b shows the honest statement of this boundary under the existing name
is *refused*, and P3 shows a label change with no content change is *accepted*. The judgement "is this the same
boundary?" is therefore carried by the surface string alone, and for this row the string is what keeps the reading at
four.

## Impacted axes

- **adjacency (8, lowest non-retired, the axis C1 works).** The frozen target is `unaccounted 0 AND newMapped >= 4`
  (`SCORECARD.md:1718`). It is met; the honest reading of the move is 4 verified new rows covering **3 kake-declared
  boundaries** (js-rendering, robots, accessibility) plus this re-key. The SCORECARD line that books adjacency on the
  target must not also claim four distinct boundaries: `SCORECARD.md:1737-1743` already discloses that "the counter
  cannot judge overlap semantics", so this finding is inside the disclosed hole — it is a reading correction, not a
  refutation of the counter's arithmetic (which reproduced exactly).
- **calibration (9).** No move if the reading above is recorded; a move if "4 new rows" is booked as four boundaries.
- Cross-row observation, **not** adjudicated here (seat `CritRowRobots` owns it): `kake:304` cites kake's own
  `(PROVINCE.md, Adjacent)` sentence, i.e. it restates `:34-35` — the line row 6 already maps. If the Q1 test is
  applied to row 13 as well, distinct kake-declared boundaries fall to 2 and the frozen target is missed on
  `newMapped`. I record the evidence (`PROVINCE.md:304`) and leave the judgement to the seat that owns that row and
  to the closure.

## Smallest safe correction (for the L1/closure; I repaired nothing)

1. Screen `kake-shokunin@04404859…:PROVINCE.md:347` `same-surface` on `robots-txt-publisher-audit-vs-client-obedience`
   (kake's crawl-budget entry is its robots surface continued, per its own first paragraph and ground line) or on
   `crawler-discipline-vs-publishing`; drop `corpus/adjacency.tsv:15`. Keep `SKILL.md:2890` — it is a truthful scope
   line and the right tabi-side evidence — but attach it to row 6 (replace row 6's weak `PROVINCE.md:16` publishing
   refusal, which does not state the crawler-discipline side of its own surface name) rather than to a new row.
2. Report the C1 reading as it then reads: `unaccounted 0`, `newMapped 3`, predicate false against the frozen target,
   with 3 distinct kake-declared boundaries (or 4 rows / 3 boundaries if the row is kept) — and say so in the
   SCORECARD round-33 line instead of booking adjacency on `newMapped 4` alone.
3. Correct `corpus/lessons/round-33.md:114-116` append-only: `:347` was mapped, not screened; `:340/342/343/345` are
   screened on the new surface name, not "on the mapped split".

## Process notes

- No browser run, so no chromedriver/chromium was started. `pgrep -fa 'chromedriver|chromium'` printed one line,
  `1371 /usr/bin/earlyoom … --prefer (^|/)(java|node|chromium|python3?)$` — the host's earlyoom daemon (argument text
  only), not a process I own or started.
- No tool install or upgrade; no network fetch was needed (every claim came from local git objects).
- Scratch `/fast/scratch/hyaku/tabi-r33/CritRowCrawlBudget` deleted after the receipts were copied into the output dir.

## Deliverables

- This report: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/CritRowCrawlBudget.md`
- Receipts (sha256, one line each, in the output dir):
  - `gate-at-042d6d9.json` `68bb5ff5d025cd6674a5c6bc9956e0786dbd8106506e75abd5c5bef49eed5a34`
  - `c1-at-042d6d9.json` `4547a1ffb2142f1d31f2219e6a58d1984b223bdeb93e644328684ace3b498c40`
  - `p1-drop-row.json` `8dde06b1e1b61d916504cd3a7886d31184c43584500de8dc33cc9b52fd32be52`
  - `p2-rekey-noscreens.json` `9e43e7de65cb41dd0dd900bf2b495c5ac4ce644a6b1c3f600864e99a830e3a84`
  - `p2b-rekey-withscreens.json` `af3761356e832c7371c943b14d775c5d3d6c44158b2f149a2c9cc73b3708b21e`
  - `p3-synonym-rename.json` `7ce36ffbfcd6f39e23aa8e894da420c4362c2e62f4b456a9b0338fa36e42f8e2`
