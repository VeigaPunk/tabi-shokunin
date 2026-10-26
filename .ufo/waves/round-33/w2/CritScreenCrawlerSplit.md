# CritScreenCrawlerSplit — the 21 `crawler-discipline-vs-publishing` screen rows (round 33, w2)

Revision attacked: `042d6d9abf97d567d495652a85eabc851b81adc1` (lane clone, read-only in the lane).
Kake side read at the frozen candidate pin `044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md` (447 lines).
Claim attacked: C1 adjacency — that every unaccounted browser-domain line is disposed of honestly, and that a
`same-surface` screen is a statement about *no real overlap* rather than a parking place (`SKILL.md:2853-2859`).

## Verdict

**Categorisation holds for all 21 rows; one low-severity precision defect (ledger row 34, kake `PROVINCE.md:411`).**
Every one of the 21 lines is, in context at the pin, kake's own publisher half of the split (publisher crawl
knowledge, offline audits, vendor sentences, headings, or provenance) and none asserts a browser, driver, CDP
session, interaction record or dynamic-page-evidence claim, so none is a distinct overlap tabi must map. The
screen is also the *only legal* accounting for the lines that literally restate the split (`:338`, and `:323` on
the robots surface): a second map row on the same folded `surface + sibling` pair is `duplicate_row` at the gate
(fixture A below), so "map it instead" is not available without inventing a synonym surface, which the lane
declined although the frozen counter would have rewarded it (fixture B). The defect is confined to one quote
span that does not carry the segment that decides the disposition (`SKILL.md:2850`); it changes no count and no
disposition.

## Evidence

### 1. Mechanical layer is clean (43/43 rows, not just the 21)

```
$ node check-quotes.mjs          # parses corpus/adjacency-screen.tsv, resolves every pin through its own lane repo
HEADER: ["sibling_ref","reason","surface","quote","note"] OK
TOTAL_ROWS 43 BAD_ROWS 0
VERBATIM_ALL true
WORD_RANGE 4 16 NS_MIN 34
EXIT:0
```
Receipt: `quote-verify.txt`, script `check-quotes.mjs`. Every quote is a verbatim substring of its cited line at
its pin, every row has 5 columns, every `same-surface` row names a surface and every other reason writes `-`
(the column rules at `SKILL.md:2845-2851`).

### 2. The 21 rows are accounted and the surface they cite is owned for kake

```
$ node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs --repo "$S/clone" \
    --fleet /home/vgpnk/Projects/shokunin --rev 042d6d9abf97d567d495652a85eabc851b81adc1 --json
{"predicate":true,"candidates":52,"mapped":9,"screened":43,"unaccounted":0,"newMapped":4,
 "adjacency":{"verdict":"clean","rows":14,"verified":14,"findings":0},"screenFindings":[]}
EXIT:0
```
Receipt: `c1-042d.json`. `screenFindings` empty means every `same-surface` surface is carried by a
verification-passing map row for the *same* sibling: `crawler-discipline-vs-publishing` is map row 6
(`corpus/adjacency.tsv:6`, kake at `7c61c8cc791bde36dd5e3688bdfea2678d90146c:PROVINCE.md:30`, whose line text
equals the frozen pin's `:34`). 9 + 43 = 52 candidates exactly, so no line is both mapped and screened.

### 3. A second map row on this surface is impossible — the screen is forced, not convenient

`scripts/check-adjacency.mjs:151-153` and its self-test `:1588-1597` make `duplicate_row` fire on a repeated
folded `surface + sibling` pair. Fixture A (my scratch clone; commit inside the clone only, `--show-toplevel`
asserted equal before every git call):

```
$ git -C "$D" reset --hard 042d6d9… && append row: crawler-discipline-vs-publishing / kake /
    kake-shokunin@044048597…:PROVINCE.md:338 / "Boundary unchanged: publisher-side placement is kake's;
    client-side crawling stays with tabi." / PROVINCE.md:16 / "web *publishing* (→ kake)," / split-declared / - / …
$ node scripts/check-adjacency.mjs --repo "$D" --fleet /home/vgpnk/Projects/shokunin --at "$REV"
ADJACENCY verdict=failed rows=15 verified=14
finding row=16 reason=duplicate_row detail=surface=crawler-discipline-vs-publishing sibling=kake pin=kake@PROVINCE.md:338 first_row=6
GATE_EXIT:1
```
Receipt: `fixtureA-duplicate-surface.txt`. So the literal split restatements at the frozen pin (`:338`, and
`:323` on the robots surface) cannot be given a truthful second row; `SKILL.md:2879-2881` ("when the same line
could be mapped truthfully … map it") has no referent here, because no truthful row can pass the gate.

### 4. The honest path was taken although the counter would have paid for cheating

Fixture B renames the same fixture row's surface to a synonym and keeps everything else identical:

```
ADJACENCY verdict=clean rows=15 verified=15                                        GATE_EXIT:0
{"predicate":true,"candidates":52,"mapped":10,"screened":42,"unaccounted":0,"newMapped":5, …}
COUNTER_EXIT:0
```
Receipt: `fixtureB-synonym-surface.txt`. A synonym surface lifts `newMapped` 4 → 5 with the gate clean and the
predicate true; the frozen counter cannot distinguish it (the disclosed limit, `claims.json` C1
`feasibilityDisclosed`). The lane screened `:338` instead. That is the difference between an accounted sweep and
a gamed target, and it is the reason this seat does not report the screens as "inconvenient".

### 5. Per-line reading of the 21 (kake `PROVINCE.md` at `044048597…`, in context)

Ledger line numbers are `corpus/adjacency-screen.tsv:<line>`.

| ledger | kake line | what the line is, in context | distinct overlap? |
|---|---|---|---|
| 6 | :22 | Frontier bullet: "Crawl hygiene per host (robots.txt, sitemap scope, canonical signals)" — publisher artifacts; kake's `:34` boundary names them kake's | no — publisher half; the JS half is `:23`, separately screened on the js-rendering surface |
| 14 | :338 | "Boundary unchanged: publisher-side placement is kake's; client-side crawling stays with tabi." — literal restatement of the mapped split | no — same surface+sibling as map row 6; fixture A shows the map row cannot be duplicated |
| 19 | :352 | heading "Round-51 canonical-selection and crawler-identity frontier step" — knowledge-step label; canonical selection is kake's by tabi's own declaration (`SKILL.md:2887`) | no — heading claims no act; tabi has no crawler-identity/UA claim (grep: no `user-agent` line in `SKILL.md`) |
| 20 | :358 | "covers only the declaration side and explicitly disclaims selection." — publisher declaration-vs-selection prose | no — publisher ground; quote span omits the matched filename (see below) |
| 21 | :359 | "(S263) holds the identity half of the crawl signal — \"Googlebot\" names two crawlers, the subtype" — vendor knowledge about UA naming | no — a documented engine signal, not an act tabi practises |
| 23 | :364 | "crawl-error-status-table) stay true as vendor sentences but inherit subtype ambiguity; a round" — caveat on kake's own held entries | no |
| 24 | :367 | heading "Round-52 per-engine crawl hygiene (and a correction to the round-51 wording)" | no — block heading over kake's publisher block |
| 25 | :373 | "Round 52 adds three entries on per-engine crawl hygiene beyond Google" — opener | no |
| 26 | :375 | "not weighed when results are ordered — it is not a crawl refusal" — rel=nofollow vendor sentence | no — tabi claims no nofollow handling (grep: no `nofollow`/`X-Robots-Tag` claim in `SKILL.md`) |
| 27 | :376 | "tagged URL is still used to find new pages" — same entry continued; token is the filename `baidu-friendly-crawl-guidance.md` | no |
| 28 | :377 | "one `User-agent: Baiduspider` block binds the PC and mobile crawlers together, the crawler" — robots.txt refusal-file semantics | no — robots.txt is the robots surface's subject; both surfaces are kake-owned, so no accounting effect (surface-label observation below) |
| 29 | :394 | "They extend the per-engine crawl-hygiene ground of round 52 from link attributes" — self-description | no |
| 31 | :398 | "Yahoo! JAPAN crawler-address, user-agent-list and deleted-URL pages in the staging" — pages not adopted (`:399`) | no — cited, not claimed |
| 32 | :408 | heading "Round-56 Yahoo! JAPAN crawl handling: link-target restriction, deleted URL, non-existent URL" | no |
| 33 | :410 | "three entries on what one operator's pages say a server's answer does to the crawl" — opener | no |
| 34 | :411 | "re-grounded against a fresh retained body fetched 2026-10-25" — provenance sentence; the token and the subject are in the omitted filename `yahoo-japan-link-target-crawl-restriction.md` | no overlap, **quote-span defect** (below) |
| 35 | :412 | "(S367, a held row re-opened: a page refuses the crawl of the link targets it contains from its own head" — meta-robots/`X-Robots-Tag` publisher declaration | no — tabi's committed robots discipline is robots.txt-only (`SKILL.md:327`: first request `/robots.txt`, `Disallow:` prefix never issued), so there is no tabi side to cite |
| 36 | :418 | "is not read as an error page and the crawl continues" — soft-404 server-answer semantics | no — tabi's network rung (`SKILL.md:374`) captures wire truth for its own driven session, not what an engine's crawler does with a 200 |
| 37 | :420 | "They continue the per-engine crawl-hygiene ground of rounds 52 and 55 from link attributes" | no |
| 39 | :431 | "what one operator's own pages say a dead link is and how its crawler treats one" — publisher documentation | no |
| 40 | :438 | "They continue the per-engine crawl-hygiene ground of rounds 52, 55 and 56" | no |

No line in the set asserts kake drives, captures or executes anything: the acts are knowledge entries, offline
audits (`:302`, `:304`), retained-body GETs (`:411`) and headings, all of which kake already keeps on its side of
the split (`kake PROVINCE.md:304`, tabi `SKILL.md:2888`, `PROVINCE.md:16`). The two lines that *do* name tabi
inside this set (`:338` literal split; `:323` on the robots surface) are restatements of surfaces already
answered and cannot carry a second row (fixture A).

### 6. Defects / observations

1. **Defect — low severity, `corpus/adjacency-screen.tsv:34` (kake `PROVINCE.md:411`).** The quote
   `re-grounded against a fresh retained body fetched 2026-10-25` is verbatim and the right length, but it is
   not "the span that decides the disposition" (`SKILL.md:2850`): the line's only regex token and its whole
   subject sit in the segment the quote drops — `` `corpus/knowledge/yahoo-japan-link-target-crawl-restriction.md` ``.
   From the ledger alone a reader cannot see why the line was a candidate; the note has to say it. The lane's own
   convention elsewhere includes the filename (`corpus/adjacency-screen.tsv:17` quote contains
   `crawl-budget-consequences.md`; `:9` contains `burnerchrome`). No count, disposition or predicate changes.
2. **Observation — same rule, borderline, rows 20 (`:358`) and 27 (`:376`).** Their spans carry the substance
   (declaration-vs-selection; a tagged URL's use) but still omit the matched filename token
   (`crawler-identity.md`, `baidu-friendly-crawl-guidance.md`). Same shape as (1), materially weaker: the span
   itself already shows publisher-side prose, so it decides the disposition without the token.
3. **Observation — surface label, row 28 (`:377`).** The line is robots.txt `User-agent:`/wildcard semantics, so
   the more exact owner is `robots-txt-publisher-audit-vs-client-obedience` (map row `corpus/adjacency.tsv:13`,
   kake `:304`) rather than `crawler-discipline-vs-publishing`. Both are kake surfaces and the counter checks
   only same-sibling ownership, so this is a labelling imprecision, not an accounting gap. Row 6 (`:22`, robots
   inside a three-signal parenthetical) is a legitimate umbrella use of the same label.
4. **Observation — the counter's blind spot is real and was not exploited.** Fixture B shows a synonym surface
   reaches `newMapped 5` with the gate clean on a line that is not a second overlap. The lane's `:338` screen is
   therefore evidence of restraint; the closure's spot-check should keep this as the semantic guard that
   `claims.json` `feasibilityDisclosed` says the counter is not.

### 7. Commands, exit codes, environment

- `git clone --shared …/tabi-shokunin "$S/clone"; git -C "$S/clone" checkout -q --detach 042d6d9…` — exit 0,
  `rev-parse HEAD` = `042d6d9abf97d567d495652a85eabc851b81adc1`.
- `node check-quotes.mjs` — exit 0 (43 rows, 0 bad). `node dump21.mjs` — exit 0 (`rows21.txt`).
- Frozen counter at `042d6d9…` — exit 0, predicate true (`c1-042d.json`).
- Fixture A gate — exit 1 `duplicate_row`; fixture B gate — exit 0, counter — exit 0 `newMapped 5`
  (`fixtureA-duplicate-surface.txt`, `fixtureB-synonym-surface.txt`). Both fixtures lived only in the scratch
  clone; the clone was reset to `042d6d9…` afterwards (verified `reset --hard` output before deletion).
- Read-only git in `kake-shokunin` (`git cat-file blob 044048597…:PROVINCE.md`, 447 lines) — exit 0. Lane files
  were not edited; the only fixture commits are in `$S/clone` with `-c user.name=CritScreenCrawlerSplit`.
- No tool installs, no pacman, no network fetches (nothing needed fetching; every line is local evidence).
- No chromedriver/chromium was started by this seat. `pgrep -fa 'chromedriver|chromium'` returned one line,
  `1371 /usr/bin/earlyoom -r 3600 --avoid (^|/)(Hyprland|Xwayland|sddm|init|systemd|sshd|pipewire|wireplumber|waybar)$ --prefer (^|/)(java|node|chromium|python3?)$`
  — earlyoom matching its own `--prefer` argument, not a process I own.
- Scratch `$HYAKU_SCRATCH/tabi-r33/CritScreenCrawlerSplit` deleted after the receipts were copied.

## Deliverables

- This report: `.ufo/waves/round-33/w2/CritScreenCrawlerSplit.md`
- Receipts: `.ufo/waves/round-33/w2/CritScreenCrawlerSplit/` — `quote-verify.txt` (mechanical layer, exit 0),
  `rows21.txt` (the 21 quotes against their full lines), `c1-042d.json` (frozen counter at the attacked
  revision), `fixtureA-duplicate-surface.txt`, `fixtureB-synonym-surface.txt`, `check-quotes.mjs`,
  `dump21.mjs`.
