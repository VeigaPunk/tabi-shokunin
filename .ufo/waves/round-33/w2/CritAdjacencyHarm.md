# CritAdjacencyHarm — no-harm attack on adjacency at 042d6d9a (round 33, w2)

**Verdict: no absorbed ground — the lane's declared province did not move, and none of the round's new
sibling-ground text takes a sibling's surface. Two low-severity defects and two low-severity observations are
recorded below; none changes the C1 predicate and none is a wrong disposition of a real overlap.**

Attacked: (a) `PROVINCE.md` and `corpus/adjacency.tsv` between baseline `b7d16fb8` and integration `042d6d9a`,
(b) every added line of the round's prose that names a sibling lane, (c) the frozen C1 counter and the map gate at
`REV`. `PROVINCE.md` is byte-identical at both revisions (sha256 `16c27b12…a946a`, `git diff` 0 bytes), the ten
baseline map rows are byte-identical, and four rows are appended. The four declarations (`SKILL.md:2887-2890`, map
rows 12–15) each quote a kake line that either already cedes browser-side execution to tabi (`kake:61`, `kake:304`,
`kake SKILL:559-560`) or explicitly keeps the publisher/declaration half with kake (`kake:342-347`, `kake:355-358`,
`kake:79-80`): they cede, they do not absorb. No added line claims kake publishing, kagi secrets, kaidoku/revenger
RE, kama serving or kumitate tooling.

## Evidence

All lane reads are read-only at `/home/vgpnk/Projects/shokunin/tabi-shokunin`; script runs are in a `--shared` clone
detached at `042d6d9abf97d567d495652a85eabc851b81adc1` (`git rev-parse --show-toplevel` =
`/fast/scratch/hyaku/tabi-r33/CritAdjacencyHarm/clone`). Receipts: `.ufo/waves/round-33/w2/CritAdjacencyHarm/`.

### 1. Surface did not move

```
git diff b7d16fb8 042d6d9a -- PROVINCE.md                      -> 0 bytes, exit 0
git diff --numstat b7d16fb8 042d6d9a -- PROVINCE.md corpus/adjacency.tsv
                                                               -> "4	0	corpus/adjacency.tsv" only, exit 0
git show b7d16fb8:PROVINCE.md | sha256sum  = 16c27b12a60dbbcc43903d40334c314f6587bd8703d1e890e076398eac1a946a
git show 042d6d9a:PROVINCE.md | sha256sum  = 16c27b12a60dbbcc43903d40334c314f6587bd8703d1e890e076398eac1a946a
```

Row-level compare of `corpus/adjacency.tsv` (`git show` both revs, python): header + the ten baseline rows
**byte-identical (True)**; exactly four rows appended (`corpus/adjacency.tsv:12-15`, all `split-declared` vs kake at
pin `044048597d62f3199494b63b36e90dd57825e350`: `js-rendering-browser-execution`, `robots-txt-publisher-audit-vs-client-obedience`,
`accessibility-browser-at-execution`, `crawl-budget-vs-client-crawl-thresholds`). So the lane added declarations, not
province.

### 2. The frozen instruments agree at REV

```
TMPDIR=… node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs --repo CLONE --fleet … --rev 042d6d9a --json
  exit 0 -> predicate true, candidates 52, mapped 9, screened 43, unaccounted 0, newMapped 4,
            adjacency {clean, rows 14, verified 14}
node scripts/check-adjacency.mjs --at 042d6d9a --repo CLONE --fleet … --json
  exit 0 -> verdict clean, rows 14, verified 14, selfRulings 2, findings []
sha256sum: counter da59d157…c6380 (frozenDigests), gate 4e2c2a64…4aac (pinned) — both unchanged
```

Independent audit of the 43 screen rows against `baseline/c1-candidates.tsv` (python, receipts in `audit.txt`):
**0 findings** — every `sibling_ref` is exactly a frozen candidate ref (no duplicates), every quote is a verbatim
substring of that candidate's line at its frozen pin within 4–25 words and ≥20 non-space characters, every
`same-surface` names a surface that a verified map row already carries for that same sibling, and every other reason
writes `-`. Coverage closes exactly: 9 mapped + 43 screened = 52, unaccounted 0.

The five baseline-mapped candidates are mapped by *equal line text*, not merely by a pin: `kaidoku:53` (pin
`9011581d`:53 vs frozen `8b9634e`:53), `kake:30` vs `kake:34`, `kake:35` vs `kake:39`, `kagi:43` (pin `c2cab35b`:43
vs `69b61db`:43), `revenger:5` (pin `cf02419`:5 vs `6da884c`:5) — all five compare True.

### 3. Absorbed-ground sweep over the round's added text

`git diff BASE REV | grep '^+' | grep -inE 'publish|secrets?|vault|credential|reverse|REA|artifact|serve[sd]?|service|kumitate|webbridge|kama|kagi|kake|kaidoku|revenger|kasegi'`
over `SKILL.md`, `corpus/knowledge/bidi-runtime-gate-v2-round-33.md`, `corpus/lessons/round-33.md`, `corpus/README.md`,
`corpus/SOURCES.md`, `corpus/QUALITY.md`, `SCORECARD.md`, `LOG.md` (206 hit lines, saved verbatim in
`sweep-hits.txt`; the pattern is coarse — `serve[sd]?` also matches "observed") — every hit is one of three
classes, or an incidental use of a token:

- **the four declarations, all ceding** — `SKILL.md:2887` "canonical declaration and selection stay kake's"; `:2888`
  "publisher-side robots and sitemap placement and its offline audit stay kake's"; `:2889` "the publisher-side WCAG
  review preparation stays kake's"; `:2890` "what a search engine's crawl budget does to a published host is kake's
  publisher-side knowledge …, never absorbed here". Each matches the sibling's own line at the pin: `kake:61-62`
  "browser execution stays tabi's / adjacent province and publication/account operations stay operator-owned";
  `kake:304` "browser-driving and client-side crawler discipline belong to tabi"; `kake SKILL.md:559-560` "tabi
  receives authorized browser/AT evaluation, kagi owns any credential custody, and publishing stays operator-owned";
  `kake:347-348` "backoff reduces the crawl rate across the whole hostname (S274). Publishing / stays operator-owned".
  The claims tabi makes on its *own* side are all ground kake hands over in those same lines, so nothing of kake's is
  taken.
- **counts** — `round-33.md:13` "42 kake, 4 kagi, 2 kaidoku …" (candidate census), `round-33.md:306-307` the `awk`
  recount. No ownership statement.
- **incidental token** — `round-33.md:333` "`ScribeSrcSession` (all three published by the end of drafting)" is
  published reports, not web publication; the remaining matches are "observed"/"server" through `serve[sd]?`.
- **lead disclosure, not claim** — `round-33.md:126-128` "34 real overlaps outside the frozen PROVINCE regex
  (kasegi's CDP 9222 burnerchrome, kumitate's webbridge routing, kama's CDP pins, kaidoku's Playwright and
  accessibility-tree capture) — leads for a later round, not counted", restated at `corpus/README.md:770` as "open —
  … not in the frozen sweep". That is a disclosure of unmapped overlaps; it grants no ground and claims none.

The v2 BiDi note (`corpus/knowledge/bidi-runtime-gate-v2-round-33.md`) and the SCORECARD/LOG round-33 additions
contain no sentence that claims sibling ground (the LOG's only sibling lines, `LOG.md:46-49`, restate the candidate
census; the other added-line matches there are `packages` in a packaging URL and a LOG correction whose subject is the
lane's own tally).

Negative checks for the five named grounds: no added line says tabi publishes/serves a site (kake); no added line
reads, stores or claims session/credential material (kagi — `kagi:81` "Local typed-review and revision-accounting
fixtures do not absorb research method, secret-scanner ownership, browser leases or authenticated endpoint
operations from siblings" is screened `same-surface` on the lease, and nothing in tabi's new text conflicts); no
added line claims REA/asar/APK analysis (kaidoku/revenger); no added line claims a listener or service (kama); no
added line claims `kumitate` tooling (the kimi-webbridge row, `corpus/adjacency.tsv:10`, is baseline and untouched).

## Findings

### D1 — defect (low): `SKILL.md:2887` pins the canonical-selection cession to lines that do not state it

`SKILL.md:2887` reads "… executing a page in a browser to see what a crawler would render is tabi's (dynamic-page
evidence, loopback or operator-approved only); **canonical declaration and selection stay kake's (kake
`PROVINCE.md:60-61`)**." At kake pin `044048597d…`, lines 60–62 read "was repaired or a Google-selected canonical
observed. The broader crawl and / JS-rendered-canonical frontier above remains open; browser execution stays tabi's /
adjacent province and publication/account operations stay operator-owned." They support the first clause (browser
execution is tabi's, the JS-rendered-canonical frontier is open) but say nothing about who *owns* declaration or
selection. The supporting text is at the same pin, `kake:355-358`: "`corpus/knowledge/canonical-selection.md` (S262)
holds the selection half of the canonical signal … the lane's held `static-canonical-preflight.md` covers only the
declaration side and explicitly disclaims selection."

Impact: none on the predicate or on sibling ground (the proposition is true of kake and moves no surface), but the
only pin a reader can follow for the cession does not carry it — false provenance inside new text, and the gate does
not check this clause (the map row's quotes are on `kake:61` and the tabi line).
Smallest safe correction: `(kake `PROVINCE.md:61`, `:355-358`)`.

### D2 — defect (low): `corpus/README.md:766` claims a population the frozen regex does not cover

`README.md:766`: "`adjacency-screen.tsv` *(round 33, with `adjacency.tsv` rows 12–15)* | **Every browser-domain line**
of the twenty sibling `PROVINCE.md` files at frozen pins, mapped or screened with a closed reason …". Under the
lane's own vocabulary this is false at the very pin the map uses: kake pin `044048597d…` `PROVINCE.md:67` reads "This
is not rendered-DOM observation, navigation/readiness approval or permission to publish." — rendered-DOM observation
and navigation/readiness are precisely `PROVINCE.md:9-14` ("CDP session discipline (endpoints, targets,
screenshot/DOM evidence capture) … dynamic-page evidence patterns") — and it matches no token of the frozen regex, so
it is in neither `corpus/adjacency.tsv` nor `corpus/adjacency-screen.tsv`. Same for `kake:354` ("… narrows Frontier line 23: `canonical/JS rendering") and
`kake:361`/`:363`, the lines around candidate `kake:362` ("JS rendering / stays open and stays tabi's adjacent
province for anything that executes a browser"). `SKILL.md:2824-2827` is accurate — it defines the population as "whose text matches the frozen
browser-domain regex" — and the counter reads the regex it was frozen with, so the ledger and the predicate are
self-consistent; the README sentence (and the C1 `surface`/`before` wording in `claims.json`, "the 52 browser-domain
lines") promotes a regex-defined population to "every browser-domain line".

Impact: low. None of the missed lines is an overlap this lane must map: `kake:67` disclaims the browser work, and
`kake:354-363` is kake's own canonical/crawler knowledge already dispositioned by map row 12 (`adjacency.tsv:12`)
against `kake:61`/`:362`. The specific in-PROVINCE gap is also not what `round-33.md:125-128` discloses (that
disclosure is about sibling `SKILL.md`/knowledge files). But a future round reading "Every browser-domain line" will
believe the population is bounded when the vocabulary (`dom`, `screenshot`, `render(ed|ing)`, `headless`,
`navigation`) is not.
Smallest safe correction: "Every `PROVINCE.md` line matching the frozen browser-domain regex …", and record the
under-approximation (lines `kake:67`, `:354-363` outside the token set) in `corpus/lessons/round-33.md` §Gate as a
carried limit for the next adjacency round.

### O1 — observation (low): screen row for `kake:358` names the wrong mapped surface

`corpus/adjacency-screen.tsv:20` screens kake `PROVINCE.md:358` `same-surface` with surface
`crawler-discipline-vs-publishing`. The `quote` cell is "covers only the declaration side and explicitly disclaims
selection." — the regex hit is the `crawler-identity.md` filename on the next segment of the line, as the note
says, but the sentence's subject is canonical selection, whose owning row for kake is
`js-rendering-browser-execution` (`adjacency.tsv:12`, whose tabi side is exactly "canonical declaration and selection
stay kake's"). The round's own decision rule (step 2, `SKILL.md:2868-2869`) requires the `surface` cell to repeat the
row that owns that surface. `corpus/adjacency-screen.tsv:19` (`kake:352`, the section heading naming both
canonical-selection and crawler-identity) is mixed and defensible.
Impact: none on the predicate (the counter only requires a surface that exists for that sibling); a reader following
the row is pointed at the wrong split. Not a mis-screened overlap: the line declares kake's own publisher knowledge.
Smallest safe correction: `surface` on line 20 → `js-rendering-browser-execution` (note unchanged).

### O2 — observation (low): the four new rows' tabi side is the declaration itself, not a practice line

For each of `corpus/adjacency.tsv:12-15`, `tabi_ref` names one of `SKILL.md:2887-2890` and `ruling_quote` is a
substring of *that same line*, so two of the nine columns come from one sentence written in the same commit that
declares the split. The ten baseline rows (`adjacency.tsv:2-11`) cite a pre-existing surface (`PROVINCE.md:3/6/9/15/16`, `SKILL.md:556`), and
`round-33.md:116-117` records that the draft's js-rendering tabi side was moved from `PROVINCE.md:12` to the new
declaration line. Gate-legal (the gate checks each quote against its cited line, not the two quotes' independence),
and the claims already disclose that "four new rows on candidate lines whose quotes name the other side reach
newMapped 4 whatever their disposition is worth" (`claims.json` C1 `feasibilityDisclosed`). It does mean the map's
new rows evidence a declaration of a declaration rather than two independently committed practice surfaces.
Optional correction: keep the declaration line but cite `PROVINCE.md:12` ("dynamic-page evidence patterns (what to
capture so a claim about a page is re-verifiable)") as `tabi_ref` for js-rendering; `PROVINCE.md:10-11`
("rate/rights discipline") is available for the robots and crawl rows. Not a blocker, no harm to a sibling.

## What was not found

No absorbed sibling ground, no duplicate authority (the four new surfaces are distinct from the ten baseline rows';
the nearest, `crawler-discipline-vs-publishing` at `adjacency.tsv:6`, splits crawler discipline vs publishing on
`kake:34`, and `adjacency.tsv:15` adds the rate-threshold instance on `kake:347`),
no identity change (the map's pins, surfaces and dispositions of the ten baseline rows, `adjacency.tsv:2-11`, are
byte-identical; `scripts/check-adjacency.mjs`
digest is the pinned `4e2c2a64…`), no false sibling pin (all four new pins are kake `0440485`, reachable from kake's
`refs/heads/master` per the gate's own tip record), and no premise that `PROVINCE.md` moved.

## Hygiene

- No network fetch, no browser/`chromedriver`/`chromium` run, no tool installed or upgraded, no lane write, no fleet
  write, no sibling write. Scratch clone and TMPDIR under `/fast/scratch/hyaku/tabi-r33/CritAdjacencyHarm/` (removed
  before yield; receipts copied to the output dir here).
- `pgrep -fa 'chromedriver|chromium'` after the work returns only lines that are not a browser: `/usr/bin/earlyoom …
  --prefer (^|/)(java|node|chromium|python3?)$` (a host process that names chromium in its preference regex) and
  another seat's `curl … chromium.googlesource.com`. `pgrep -fa chromedriver`, `pgrep -x chromium` and
  `pgrep -fa 'chromium --'` all return nothing: no browser process was started, none is mine.
- Commands and exit codes: `.ufo/waves/round-33/w2/CritAdjacencyHarm/commands.txt`;
  payloads `c1-counter.json`, `c1-gate.json`, `audit.txt`, `gap-scan.txt`, `absorbed-ground-sweep.txt`,
  `sweep-hits.txt`, `numstat.txt`, `diff-PROVINCE.txt`, `diff-adjacency.txt`.
