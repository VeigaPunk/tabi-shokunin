# CritDeclarations — the four round-33 declaration bullets (SKILL.md:2887-2890)

**Seat:** CritDeclarations (w2 = falsify), leaf, no dispatch, no lane edits.
**Target:** `/home/vgpnk/Projects/shokunin/tabi-shokunin/SKILL.md` §"Round 33 — sibling-overlap
declarations, tabi side", header + four bullets at lines 2883-2890, at
`042d6d9abf97d567d495652a85eabc851b81adc1`.
**Question set:** (1) is every factual statement about tabi's corpus true; (2) does any bullet claim
ground `PROVINCE.md` does not own (absorption) or contradict its refusals; (3) is a declaration written
in the same round as the row it satisfies an adjacency move or a way to satisfy the counter's naming rule.

---

## Verdict — **defect (moderate)**

Three of the four bullets state tabi's side truthfully and cede kake's half correctly; none contradicts
`PROVINCE.md:15-19`, and none takes kake ground (`kake PROVINCE.md:304`, `:342-347`, `:59-62`, and
`SKILL.md:559-560` at pin `0440485` all make the cessions the bullets record). The defect is concentrated
in bullet 3: it declares **"assistive-technology execution"** a tabi surface, and that surface is
(a) absent from `PROVINCE.md`'s `Owns` list, which this round left byte-identical to the baseline
(`git diff --stat b7d16fb… 042d6d9… -- PROVINCE.md` is empty), (b) unsupported by any tabi evidence
(a corpus-wide grep finds only role/accessible-name locators and aria snapshots, never an AT run), and
(c) expressly disclaimed by the one note the round cites as its evidence — `corpus/knowledge/aria-loopback-round-13.md:45`
"It is **not** an accessibility audit, keyboard/screen-reader test, WCAG certificate…". So the section
that is captioned "none absorbs kake ground" is accurate about kake and silent about the reverse
direction: it enlarges tabi's own province by declaration while the province text stays untouched, making
this append-only SKILL section a second, later authority on what tabi owns. Two further bullets carry
citation defects of the "attributed span does not say it" class (bullet 1 "canonical declaration and
selection stay kake's" cited to `kake PROVINCE.md:60-61`, which says only that the frontier is open and
browser execution is tabi's; the selection half is at `:354-358`), bullet 2 states a loopback fixture's
mechanical predicate as client obedience to a real host, and bullet 4 calls a table whose own tier line
reads "documented upstream, not measured in this lane" a set of "client-side crawl … thresholds". On
question 3 the measured answer is **both, and for two of the four rows the second role is load-bearing**:
substituting truthful pre-existing tabi lines for the declarations on the accessibility and crawl rows
keeps the gate clean and `unaccounted=0` but drops `newMapped` from 4 to 2 and fails the frozen C1
predicate — the only tabi text naming `kake` on those two surfaces is the declaration written in the same
commit that needed it. That is not fabrication (the declaration is a real statement of position) but the
map cannot distinguish "tabi already held this side" from "tabi asserted it when the sweep demanded one",
and for accessibility the asserted side is not held.

---

## 1. Per-bullet truth test (question 1)

### Bullet 1 — JS rendering (`SKILL.md:2887`)

- "executing a page in a browser to see what a crawler would render is tabi's" — **true**:
  `PROVINCE.md:3-4` (driving real browsers, evidence discipline), `PROVINCE.md:12-13` (dynamic-page
  evidence patterns), and kake's own cession `kake PROVINCE.md:61-62` "browser execution stays tabi's /
  adjacent province".
- "(dynamic-page evidence, loopback or operator-approved only)" — **true**: `corpus/knowledge/live-dynamic-capture.md:5`
  "no external site touched (loopback only"; `PROVINCE.md:18-19` "observation and / operator-approved
  interaction only". The note's own limit `live-dynamic-capture.md:216` "Real-site pages … — untested by
  rule this" is consistent with a scope statement, not a claim of having run one.
- "canonical declaration and selection stay kake's (kake `PROVINCE.md:60-61`)" — **citation defect
  (minor)**. At pin `0440485`, `:60-61` reads "was repaired or a Google-selected canonical observed. The
  broader crawl and / JS-rendered-canonical frontier above remains open; browser execution stays tabi's".
  That supports the cession of browser execution and says the canonical frontier was *open*; it does not
  say kake holds declaration *and* selection. Kake holds selection at `:355-357` ("`corpus/knowledge/canonical-selection.md`
  (S262) holds the selection / half of the canonical signal") and holds declaration at `:56-58`. The
  statement is true; the cited span is the wrong span for half of it.

### Bullet 2 — robots.txt (`SKILL.md:2888`)

- "tabi obeys robots.txt as a client" — **overstated (minor)**. Every basis is either a loopback
  fixture's own mechanical rule or an unexecuted upstream sentence:
  - `corpus/knowledge/external-class-fixture-v2.md:59-63` "Semantics, as executed — five rules … 1. **First
    request is the conventional permission probe** `/robots.txt`. Parse its `Disallow:` prefixes; if the
    *intended next cell's* path matches a prefix → **STOP before issuing it**" — the robots file is served
    by tabi's own loopback server, and the same note's U5 limit at `:550-552` reads "Real robots semantics
    (wildcards, per-agent groups, `Crawl-delay`) are / not exercised — the fixture's robots is a 2-line
    document; the parse rule here / is a prefix match on `Disallow:` lines only."
  - `SKILL.md:327` (the line the round-33 lesson cites) states the same thing as the *fixture runner's*
    predicate: "The stop-and-report predicate is mechanical … first request is `/robots.txt`".
  - `corpus/knowledge/rate-signal-decision-table.md:10` "tier: documented upstream, not measured in this
    lane" and `:12` "**Documented upstream, nothing executed.**" — D1-D5 are RFC 9309 sentences, not runs.
  No tabi receipt exists of a robots.txt fetch against a host it did not itself serve. The bullet's
  parentheticals are accurate about *which* rules exist; the clause "tabi obeys robots.txt as a client"
  presents the loopback predicate and the documented table as real-host conduct and drops the qualifier
  the corpus keeps.
- "decision table D1–D5" — **true as scope**: `rate-signal-decision-table.md:49-53` is exactly the five
  robots.txt rows.
- "publisher-side robots and sitemap placement and its offline audit stay kake's (`kake PROVINCE.md:304`)" —
  **true, verbatim-supported**: `:304` "Boundary: kake owns publisher-side robots/sitemap placement at the
  host it serves, while browser-driving and client-side crawler discipline belong to tabi"; "offline" is
  kake `:303` "does not observe live fetches, redirects, caching, or crawler behavior".

### Bullet 3 — Accessibility (`SKILL.md:2889`)

- "browser and assistive-technology execution for kake's accessibility review is tabi's" — **defect
  (moderate)**. The browser half is held: `corpus/knowledge/playwright-accessible-locators-and-snapshots.md`
  (role/label locators, aria snapshots) and the loopback run `corpus/evidence/round-13/aria/receipt.json`.
  The **assistive-technology half is held by nothing**: `git grep -niE 'assistive|accessibilit' b7d16fb… --
  SKILL.md PROVINCE.md` returns only two DOM-state/locator lines (`SKILL.md:402` accessibility-tree
  `snapshot`, `SKILL.md:1635` role-plus-accessible-name); no AT run, no AT note, no AT gate. The one
  accessibility runtime record refuses exactly this: `aria-loopback-round-13.md:45` "It is not an
  accessibility audit, keyboard/screen-reader test, WCAG certificate, screenshot/pixel comparison,
  real-site journey". Declaring AT execution is the round asserting a capability at the moment a map row
  needed a tabi side that names `kake`.
- "loopback or operator-authorized properties only" — **true and consistent with the refusals**:
  `PROVINCE.md:18-19`; `kake SKILL.md:559-560` (pin `0440485`) "The operator authorizes a named
  property/build/process scope; tabi receives / authorized browser/AT evaluation, kagi owns any credential
  custody, and".
- "the publisher-side WCAG review preparation stays kake's (`kake SKILL.md:559-560`, `PROVINCE.md:79-80`)" —
  **citation mismatch (minor)**: `SKILL.md:559-560` hands *execution* to tabi and says nothing about
  preparation being kake's; kake's preparation line is `PROVINCE.md:76-78` "publisher-side review
  preparation: sourced criterion / cards and an offline inventory gate". `PROVINCE.md:79-80` says AT
  execution is "separately authorized adjacent work" — it does not assign preparation to kake either. The
  claim is true; neither cited span carries it.

### Bullet 4 — Crawl rate (`SKILL.md:2890`)

- "tabi keeps the client-side crawl and rate thresholds of its decision table (D1–D13)" — **overstated
  (minor)**. The table exists and is tabi's (`rate-signal-decision-table.md:5-8` sources S119-S122), but
  D1-D13 is not a set of crawl-rate thresholds: D1-D5 bound the *retrieval and parsing* of robots.txt
  (redirect chain, cache age, 500 KiB parse floor), D7-D11 are GitHub REST published quotas and secondary
  ceilings (60/5,000 req/h, 100 concurrent, 900 points, 90 s CPU), and D13 is a 1 s pause between mutative
  requests that the row itself annotates "this lane sends none — observation-only province". The only
  client pacing thresholds are D6 (≥1 min after a 403/429 with no `retry-after`), D12 (stop at
  `remaining=0`) and D13. There is no crawl-rate row and no `Crawl-delay` support
  (`external-class-fixture-v2.md:550`). Bundling D7-D11 into "crawl … thresholds" over-includes, and the
  table's tier is documented-upstream-unexecuted (`:10`, `:12`).
- "what a search engine's crawl budget does to a published host is kake's publisher-side knowledge (`kake
  PROVINCE.md:342-347`)" — **true, verbatim-supported** at pin `0440485` (`:345-347` "Google will not shift
  newly available crawl budget to / other pages unless the capacity limit is already hit (S273), and the
  emergency / backoff reduces the crawl rate across the whole hostname (S274)").
- "never absorbed here" — **true**: `grep -rniE 'crawl(-| )budget' corpus/ SKILL.md PROVINCE.md` returns no
  tabi crawl-budget entry (only the round-33 lesson and the declaration itself).

## 2. Province / absorption test (question 2)

- `PROVINCE.md` was not touched this round: `git diff --stat b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd
  042d6d9abf97d567d495652a85eabc851b81adc1 -- PROVINCE.md` → empty, exit 0. The `Owns` list is still
  lines 6-13: webbridge plugin, browser inventory/profile, CDP session discipline, interaction records,
  dynamic-page evidence patterns. **No accessibility/AT surface is enumerated.**
- Bullet 3 therefore claims ground the province text does not own. This is not kake-absorption — kake
  cedes it (`kake PROVINCE.md:79-80` "Browser/assistive-technology / execution stays separately authorized
  adjacent work"; `kake SKILL.md:559-560` names tabi as receiver) — it is absorption from the *open
  frontier*: an unclaimed, unevidenced capability is written into an append-only declaration as owned,
  with no province amendment and no gate. Because `SKILL.md` is now the later authority and the map quotes
  it, the effect is duplicate authority: a reader of `PROVINCE.md` cannot learn that tabi owns AT
  execution; a reader of `SKILL.md:2889` cannot learn that no AT evidence exists.
- Bullets 1, 2, 4 do not absorb: they cede publisher-side canonical selection/declaration, robots/sitemap
  placement with its offline audit, and crawl-budget consequences to kake, matching kake's own lines.
- No bullet contradicts `PROVINCE.md:15-19`: all four keep work on loopback or operator-authorized
  properties, none claims publishing, none touches secrets, none claims a consequential action.

## 3. Same-round declaration: adjacency move or counter satisfaction? (question 3)

**Both, and for two rows the second is load-bearing. Measured, not asserted.**

Mechanism in the gate (the reason a same-round declaration is admissible at all):

- `scripts/check-adjacency.mjs:72-73` — "tabi_ref `<path>:<line>` in this lane, **resolved at the
  evaluated revision**". The sibling side carries a 40-hex pin that must be reachable from the sibling's
  lane-tip ladder; the tabi side carries no commit at all, so a line added in the same commit as the row
  is evidence by construction.
- `scripts/check-adjacency.mjs:89-92` — for `split-declared`/`refused-route`, "ruling_quote … verbatim
  substring of the tabi file named by tabi_ref (there is no third file to pin". So a split row's "both
  quotes state the split" test resolves to: one sibling line + one tabi line, and the tabi line is the
  declaration. Ancestry is enforced only for self-venue *rulings* (`:889-890`), never for `tabi_ref`.
- The frozen counter's naming rule is `c1-adjacency-sweep.mjs:221-223`:
  `/\btabi\b/i.test(siblingQuote) || new RegExp(…sibling…).test(tabiQuote)`.

Receipts: the section header and bullets first appear at `bf48b81…` — the same commit as map rows 12-15
(`git show <rev>:SKILL.md | grep -c 'Round 33 — sibling-overlap declarations, tabi side'` → 0 at
`b7d16fb…`, 1 at `bf48b81…` and at `042d6d9…`; `git show <rev>:corpus/adjacency.tsv | wc -l` → 11 / 15 /
15). The round's own lesson says the move was a choice: `corpus/lessons/round-33.md:114` "its row's tabi
side moved from `PROVINCE.md:12` to the round-33 declaration line".

The measured dependency test (scratch clone, my own commit `c9e89e6`, diff in
`…/CritDeclarations/variant-map.diff`): rows 14 (accessibility) and 15 (crawl) rewritten to cite truthful
**pre-existing** tabi lines — `SKILL.md:402` "webbridge `snapshot` (accessibility tree, `@e` refs) first"
and `PROVINCE.md:10` "interaction records: site-specific gotchas, rate/rights" — everything else unchanged.

```
ADJACENCY verdict=clean rows=14 verified=14                      (at c9e89e6, exit 0)
C1_ADJACENCY_SWEEP predicate=false … candidates=52 unaccounted=0 newMapped=2   (exit 1)
  newMappedRows = [row 12 js-rendering (sibling_quote "browser execution stays tabi's"),
                   row 13 robots     (sibling_quote names tabi)]
```

Reading: with pre-existing tabi lines the map still verifies (14/14) and the sweep is still fully
accounted (`unaccounted=0`), but two of the four "NEW verified rows" stop counting — precisely the two
whose naming token lives only in the new declaration. And the corpus makes that unavoidable by truth:
`git grep -niE '\bkake\b' b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd -- PROVINCE.md SKILL.md` piped through
`grep -iE 'accessib|robots|crawl|rate'` returns **no line** — before this round tabi had no committed
sentence naming kake on accessibility or crawl rate. So the declaration was *necessary* for the counter,
not gratuitous; the honest reading is that rows 14-15 are dispositions whose tabi side was authored to be
found by the rule, and the round should say so rather than present all four as four disposed adjacencies.

Two consequences worth naming in the lesson: (i) a `split-declared` row can be self-grounding — the
tabi side and the split evidence are the same newly written sentence; (ii) the round's second naming
weakness is avoidable: row 14's `sibling_quote` ("No actual website accessibility is evaluated.
Browser/assistive-technology") does not contain "tabi", while kake's naming line `SKILL.md:559-560` at the
same pin does — the gate would have accepted a `sibling_ref` on that file (rows already cite a sibling
`SCORECARD.md`/`corpus/…` path), so the row leans on tabi's own text for the receiver identity when the
sibling's does exist.

## 4. Smallest safe corrections (reported, not applied — attack seat)

1. **Bullet 3 (`SKILL.md:2889`)**: replace "browser and assistive-technology execution" with the
   capability the lane holds — browser execution of role/accessible-name queries and `ariaSnapshot`
   capture for kake's review (evidence: `playwright-accessible-locators-and-snapshots.md`,
   `corpus/evidence/round-13/aria/receipt.json`) — and add one clause that AT execution stays unowned
   adjacent work until an AT run is recorded (`aria-loopback-round-13.md:45` is the reason). The `kake`
   token survives, so row 14's naming rule still passes and the row stops certifying a surface that
   `PROVINCE.md` does not list. If AT is to be claimed, amend `PROVINCE.md`'s `Owns` list in the same
   commit — a declaration is not a province amendment.
2. **Bullet 1**: cite `kake PROVINCE.md:354-358` for the selection half (or narrow the clause to what
   `:60-61` says). **Bullet 3**: cite `kake PROVINCE.md:76-78` for "review preparation stays kake's".
3. **Bullet 2**: add the corpus's own qualifier — "on its loopback fixture; D1-D5 documented upstream,
   nothing executed" (`external-class-fixture-v2.md:550-552`, `rate-signal-decision-table.md:10,12`).
4. **Bullet 4**: narrow "(D1–D13)" to the rows that actually bound the client's pacing (D1-D5 retrieval,
   D6/D12/D13 rate) and drop the implication that the table carries a crawl-rate threshold.
5. **Structural (lesson, not retro-fix, the counter is frozen)**: give `tabi_ref` the predate property the
   sibling side has — for a row counted as *new*, the tabi line must exist at BASELINE — or report
   `newMapped` split into "tabi side pre-existed" vs "tabi side authored this round". That is the smallest
   change that stops a same-round declaration from being simultaneously disposition and evidence.

---

## Commands run (paste-ready, exit codes as observed)

```
git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone
git -C $S/clone checkout -q --detach 042d6d9abf97d567d495652a85eabc851b81adc1        # exit 0
git -C $S/clone rev-parse --show-toplevel                                            # $S/clone, exit 0

# gate at the attacked revision
node scripts/check-adjacency.mjs --repo $S/clone --fleet /home/vgpnk/Projects/shokunin \
     --at 042d6d9abf97d567d495652a85eabc851b81adc1                                   # exit 0
ADJACENCY verdict=clean rows=14 verified=14

# frozen counter at the attacked revision
node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs \
     --rev 042d6d9abf97d567d495652a85eabc851b81adc1 --repo $S/clone \
     --fleet /home/vgpnk/Projects/shokunin                                            # exit 0
C1_ADJACENCY_SWEEP predicate=met rev=042d6d9abf97d567d495652a85eabc851b81adc1
  adjacency=clean candidates=52 mapped=9 screened=43 unaccounted=0 newMapped=4 screenFindings=0

# variant: rows 14-15 on pre-existing tabi lines (my commit c9e89e6 inside $S/clone only)
node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs \
     --rev c9e89e699b8e505aeed99e1106c2f94a7d7bd3ed --repo $S/clone \
     --fleet /home/vgpnk/Projects/shokunin --json                                    # exit 1
{"adjacency":"clean","verified":14,"candidates":52,"unaccounted":0,"newMapped":2,
 "rows":[{"row":12,…js-rendering…},{"row":13,…robots-txt…}],"predicate":false}
node scripts/check-adjacency.mjs --repo $S/clone --fleet /home/vgpnk/Projects/shokunin \
     --at c9e89e699b8e505aeed99e1106c2f94a7d7bd3ed                                   # exit 0
ADJACENCY verdict=clean rows=14 verified=14

# read-only git evidence
git diff --stat b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd 042d6d9abf97d567d495652a85eabc851b81adc1 \
    -- PROVINCE.md                                                                   # empty, exit 0
git show b7d16fb…:SKILL.md | grep -c 'Round 33 — sibling-overlap declarations, tabi side'   # 0
git show bf48b81…:SKILL.md | grep -c 'Round 33 — sibling-overlap declarations, tabi side'   # 1
git show 042d6d9…:SKILL.md | grep -c 'Round 33 — sibling-overlap declarations, tabi side'   # 1
git show b7d16fb…:corpus/adjacency.tsv | wc -l                                        # 11
git show bf48b81…:corpus/adjacency.tsv | wc -l                                        # 15
git show b7d16fb…:SKILL.md | grep -c …                                                # see above
git grep -niE '\bkake\b' b7d16fb… -- PROVINCE.md SKILL.md | grep -iE 'accessib|robots|crawl|rate'
                                                                                      # no output, exit 1
git grep -niE 'assistive|accessibilit' b7d16fb… -- SKILL.md PROVINCE.md               # only 402, 1635
git -C /home/vgpnk/Projects/shokunin/kake-shokunin show 0440485…:SKILL.md | sed -n '558,561p'
git -C …/kake-shokunin show 0440485…:PROVINCE.md | sed -n '56,62p;79,80p;304p;347p;352,366p'
```

Line evidence pinned above: `SKILL.md:2883-2890`; `PROVINCE.md:6-13,15-19`;
`corpus/knowledge/rate-signal-decision-table.md:10,12,49-61`; `corpus/knowledge/external-class-fixture-v2.md:59-63,550-552`;
`corpus/knowledge/aria-loopback-round-13.md:45`; `corpus/knowledge/playwright-accessible-locators-and-snapshots.md:83`;
`corpus/knowledge/live-dynamic-capture.md:5,216`; `corpus/lessons/round-33.md:100-116`;
`scripts/check-adjacency.mjs:72-73,89-92,889-890`; `.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs:221-223`;
kake at pin `044048597d62f3199494b63b36e90dd57825e350`: `PROVINCE.md:56-62,76-80,303-304,342-347,354-366`,
`SKILL.md:558-561`.

No network fetch, no browser run, no lane/tracked-file edit, no fleet or sibling write.
`pgrep -fa 'chromedriver|chromium'` after the run: one line, `/usr/bin/earlyoom … --prefer (…|chromium|…)`
— an OOM-daemon regex, not a browser process I started. No chromedriver/chromium of mine.

## Deliverables (absolute)

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/CritDeclarations.md` (this report)
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/CritDeclarations/adjacency-gate-042d6d9.json`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/CritDeclarations/c1-sweep-042d6d9.json`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/CritDeclarations/c1-sweep-variant-c9e89e6.json`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/CritDeclarations/variant-map.diff`
- scratch `/fast/scratch/hyaku/tabi-r33/CritDeclarations/` removed before yield.
