# CritRowRobots — the new map row `robots-txt-publisher-audit-vs-client-obedience`

Seat: critic (w2 falsify, round 33). Target attacked: `corpus/adjacency.tsv:13` at `042d6d9a`
(`robots-txt-publisher-audit-vs-client-obedience` / kake `PROVINCE.md:304` @ `04404859`), against
`SKILL.md:2888` as its tabi side. Read-only clone at `/fast/scratch/hyaku/tabi-r33/CritRowRobots/clone`,
detached at `042d6d9abf97d567d495652a85eabc851b81adc1`. No lane file was touched; no browser was started.

## Verdict

**Holds on the substance; defect (severity: low) on surface bookkeeping.** The row is a *real* overlap: kake
holds an offline robots.txt rule auditor as a live claim (`scripts/robots_audit.py`, kake `PROVINCE.md:299`
and the round-38 re-claim at `:310`, contract limits `:300-303`) and tabi holds client-side rules for the same
RFC 9309 (`corpus/knowledge/rate-signal-decision-table.md:49-53` — D1–D5 are all robots.txt client rules —
plus the measured stop predicate at `SKILL.md:327` and `corpus/knowledge/external-class-fixture-v2.md:61,86,123-132`).
`split-declared` is the right disposition (kake `:304` hands "browser-driving and client-side crawler
discipline" to tabi; `SKILL.md:2888` hands "publisher-side robots and sitemap placement and its offline
audit" back to kake; nothing in the fleet l0 questions contests robots, and tabi does not refuse the
surface). All three quotes are byte-verbatim on their cited lines at the cited pins, and the tabi line
absorbs no kake ground. What does not hold is the *boundary*: the surface is a narrowing of the already-mapped
`crawler-discipline-vs-publishing` split edge, no written criterion separates the two, and the delivered
screen ledger assigns the same split restatements to the two rows inconsistently — so the 4th "new" row cannot
be audited from the artifacts as distinct rather than as a granularity choice made under a `>= 4` target.
Consequence for C1: none mechanically — `C1_ADJACENCY_SWEEP predicate=met … unaccounted=0 newMapped=4`
(exit 0) — but the row's distinctness is an unrecorded judgement.

## Per-question verdicts

### Q1 — real overlap between a kake surface and a surface tabi actually holds? **holds**

- kake side is a claimed artifact, not a passing mention: kake `PROVINCE.md:299` "an offline robots.txt
  expectation audit (`scripts/robots_audit.py`): each manifest check compares an expected allow/disallow
  result …"; `:310` "Round 38 re-claims `scripts/robots_audit.py`"; `:302` leaves "sitemap parsing/scope and
  crawler-specific extension behavior" open; `:334`/`:337` name robots `Sitemap:` lines and "robots
  cross-submission" as open publisher-side items.
- tabi side is practised, not only declared: `SKILL.md:327` "first request is `/robots.txt`; an intended cell
  whose path matches a `Disallow:` prefix is **never issued**"; the runner implements it —
  `corpus/knowledge/external-class-fixture-v2.md:61` ("First request is the conventional permission probe
  `/robots.txt`"), `:86` `robotsDisallowMatches`, `:123-132` the `robots-probe` cell and its trip record; and
  `corpus/knowledge/rate-signal-decision-table.md:49-53` holds five robots.txt client rules (D1 redirects,
  D2 chain bound, D3 unavailable, D4 cache bound, D5 500 KiB parse floor).
- Both lanes therefore hold RFC 9309 rule implementations, which can disagree on the same file — an overlap of
  substance, not of vocabulary. The candidate line is also exactly the pinned line: the frozen
  `c1-candidates.tsv` :304 text compares equal (`==` True) to `cat-file 04404859…:PROVINCE.md` line 304.

**Scope limit on the tabi side (recorded, not a falsity).** tabi's robots evidence is a loopback instrument:
the fixture note says the audit is "**not**: a rate-limit measurement, a robots-semantics study, a ToS
reading" (`external-class-fixture-v2.md:53`) and that `site-a/robots.txt` is "a robots-**shaped** document,
an instrument" (`:178`); `SKILL.md:726` marks "Third-party read-only … Default-deny — ToS/robots surface
unmeasured", and `SKILL.md:694` says "No measured live-site rate limit or ToS surface exists in the probation
notes — do not assert one". tabi's `PROVINCE.md` never mentions robots at all (`grep -c robots PROVINCE.md` →
`0`, exit 1), so `SKILL.md:2888` is the lane's only robots-claim line. Read as a lane stance grounded in the
rule table + fixture predicate it is truthful; it is not a live-host measurement and should not be quoted as one.

### Q2 — is `split-declared` right (vs `refused-route` / `contested-open`)? **holds**

- Both sides state the split: kake `:304` "kake owns publisher-side robots/sitemap placement at the host it
  serves, while browser-driving and client-side crawler discipline belong to tabi"; tabi `SKILL.md:2888`
  "publisher-side robots and sitemap placement and its offline audit stay kake's".
- Not `contested-open`: the two contested rows are the CDP `9222` question (fleet `.ufo/l0-questions.md:65`)
  and the the-musketeer profile lease (`:62`); nothing contests robots, and the lesson records "Contested-open
  rows: none new" (`corpus/lessons/round-33.md:120-122`).
- Not `refused-route`: tabi claims robots obedience positively, it does not route the surface away.
- The gate agrees mechanically: `ADJACENCY verdict=clean rows=14 verified=14`, exit 0 (both `--json` and text
  mode), and the split rule is satisfied by `sibling_quote` naming `tabi`.

### Q3 — is `SKILL.md:2888` truthful about tabi's corpus, free of absorbing kake ground? **holds**

- "decision table D1–D5" resolves exactly: `corpus/knowledge/rate-signal-decision-table.md:49-53` is D1…D5,
  every row a robots.txt client rule; the file's own tier is "documented upstream, not measured in this lane"
  (`:10`), so the citation does not borrow measurement it lacks.
- "first request `/robots.txt`, a `Disallow:` prefix never issued" resolves to `SKILL.md:327` + fixture `:61`,
  `:86`, `:123-132` as above.
- No absorption: the same sentence returns publisher-side placement **and its offline audit** to kake, and
  kake's audit is indeed kake's (`PROVINCE.md:299-303`, `:310`). tabi claims no publisher-side placement,
  sitemap authoring or audit. The only risk in the other direction (generality, above) is a scope limit, not
  an overclaim of kake ground.

### Q4 — do both quotes sit verbatim on the cited lines? **holds**

Independent of the gate, `git cat-file blob` at both pins:

| field | words | non-space chars | on cited line | controls/bidi |
|---|---|---|---|---|
| `sibling_quote` (`kake …:PROVINCE.md:304`) | 19 | 126 | yes | none |
| `tabi_quote` (`SKILL.md:2888`) | 14 | 84 | yes | none |
| `ruling_quote` (`SKILL.md:2888`, split row) | 11 | 67 | yes | none |

9 TAB columns; `tabi_ref` `SKILL.md:2888` is the line that actually carries the declaration
(`sed -n '2888p'`: "- robots.txt: tabi obeys robots.txt as a client (first request `/robots.txt`, a
`Disallow:` …"); the pin `04404859…` resolves from kake's `refs/heads/master` ladder (`--json` `tips`). The
candidate is not also screened — `grep ':PROVINCE.md:304' corpus/adjacency-screen.tsv` → no match (exit 1) —
so there is no double accounting.

### Q5 — distinct from the existing kake rows, or a cosmetic rename? **defect (severity: low)**

Not the musketeer lease, obviously. The live comparison is `crawler-discipline-vs-publishing` (baseline row,
kake `:34` / older pin `:30`), and the new row restates the *same* split edge:

- new `sibling_quote`: "…while browser-driving and client-side crawler discipline belong to tabi";
  baseline `sibling_quote`: "`tabi` drives browsers and owns client-side crawler discipline; kake owns".
  Same sentence family, same two lanes, same disposition. What is new on the tabi side is the mechanism
  (`D1–D5`, the stop predicate), not a claimed scope.
- It is nevertheless **not merely cosmetic**: the discriminator that saves it is the pair of concrete
  artifacts — kake's offline auditor contract vs tabi's client rule table — and that discriminator appears
  nowhere in the delivered text. `corpus/lessons/round-33.md:105` gives only "both lanes hold RFC 9309 robots
  rules", with no rule saying why that is not `crawler-discipline-vs-publishing` for kake.
- The screen ledger then assigns identical content to the two rows inconsistently, which is the observable
  defect (all line numbers at pin `04404859`):
  - `corpus/adjacency-screen.tsv:6` — kake `:22` "Crawl hygiene per host (robots.txt, sitemap scope,
    canonical signals)" → surface `crawler-discipline-vs-publishing`, note: "robots.txt, sitemap and canonical
    are publisher-side artifacts; the client-vs-publisher crawl split is already dispositioned at kake :34
    (crawler-discipline-vs-publishing) and this line names no tabi surface." That note is contradicted by the
    row under attack, whose kake object *is* "publisher-side robots/sitemap placement".
  - `corpus/adjacency-screen.tsv:14` — kake `:338` "Boundary unchanged: publisher-side placement is kake's;
    client-side crawling stays with tabi." → `crawler-discipline-vs-publishing`, note "Same split restated in
    one sentence after the sitemap audit step."
  - `corpus/adjacency-screen.tsv:12-13` — kake `:322`/`:323` (the *robots* audit's open items, `:323` =
    "Client-side crawler discipline stays with tabi; kake keeps") → the new robots row.
  - kake `:338` sits directly under a sitemap-audit paragraph that names "robots `Sitemap:` lines"
    (`:334`) and "robots cross-submission" (`:337`) — the same neighbourhood as `:323`, yet lands on the other
    surface. Identical-shaped restatements, two different surfaces, no stated rule.

That is not a mechanical gate failure (`duplicate_row` keys on surface+sibling and on the pin, both distinct),
and it does not move the counter; it is an evidence-quality defect: the artifacts cannot answer "is the 4th
new row a real distinct overlap or a granularity choice made to reach `>= 4`", and one screen row's recorded
rationale ("already dispositioned at kake :34") is superseded by this round's own map.

## Smallest safe correction (recommendation only — this seat repairs nothing)

Pick one surface per line and write the rule down; do not delete the row (it is the map's only record of
tabi's robots-client stance against kake's auditor, and both sides are real):

1. `corpus/lessons/round-33.md` §"C1 gate decisions": one sentence of discriminator —
   `crawler-discipline-vs-publishing` = who drives browsers vs who publishes;
   `robots-txt-publisher-audit-vs-client-obedience` = the two lanes' RFC 9309 rule implementations (kake's
   offline `scripts/robots_audit.py` contract, kake `PROVINCE.md:299-303`; tabi's `D1–D5` table and the
   external-class fixture stop predicate). Without it the two rows are indistinguishable on the page.
2. `corpus/adjacency-screen.tsv:6` (kake `:22`): reattribute to `robots-txt-publisher-audit-vs-client-obedience`
   — its text names robots.txt and sitemap, i.e. the new row's kake object — and drop the "already
   dispositioned at kake :34" clause; apply the same rule to kake `:338` (`:14`) if the criterion above puts
   it with `:323`. Counter impact: none (`screened` stays 43, `unaccounted` 0, `newMapped` 4).
3. Optional, if the L1 wants the tabi side unattackable: record in the errata (append-only, not by editing
   `SKILL.md:2888`) that the obedience is grounded in the fixture predicate and `D1–D5` and asserts no
   live-site robots surface — consistent with `SKILL.md:694` and `:726`.

If the L1 instead judges the surface a restatement, the honest move is to screen kake `:304` `same-surface`
onto `crawler-discipline-vs-publishing` and report `newMapped 3` / predicate false — not to keep a rename.
On the artifact evidence above I judge the overlap real, so the row should stay.

## Commands, exit codes, evidence

All run in `/fast/scratch/hyaku/tabi-r33/CritRowRobots` with `TMPDIR` set there; full transcript in
`receipts.txt` beside this report.

| command | result | exit |
|---|---|---|
| `git clone --shared …/tabi-shokunin "$S/clone" && git -C "$S/clone" checkout -q --detach 042d6d9a…` | `rev-parse HEAD` = `042d6d9a…` | 0 |
| `node clone/scripts/check-adjacency.mjs --at 042d6d9a… --repo "$PWD/clone" --fleet … --json` | `verdict":"clean","rows":14,"verified":14","selfRulings":[2]`; kake tip `refs/heads/master` | 0 |
| same, text mode | `ADJACENCY verdict=clean rows=14 verified=14` | 0 |
| `node clone/.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs --repo "$PWD/clone" --fleet … --rev 042d6d9a…` | `predicate=met … candidates=52 mapped=9 screened=43 unaccounted=0 newMapped=4 screenFindings=0` | 0 |
| `python3` byte check (`cat-file blob` at both pins) | 9 cols; quotes `in` line = True ×3; 19/14/11 words; 126/84/67 non-space; no C0/C1/bidi/ZW | 0 |
| `grep -c robots clone/PROVINCE.md` | `0` | 1 |

Browser hygiene: this seat started no chromedriver/chromium. `pgrep -fa 'chromedriver|chromium'` returned two
lines, neither mine — `earlyoom … --prefer …chromium…)` (its own argument list) and a peer seat's
`curl … chromium/-/raw/…/PKGBUILD` URL. No pixel/browser run was needed for a map-row review.

Tool installs/upgrades: none (no `pacman`, `uv`, `npx` or binary install this seat).

Scratch deleted after copying `receipts.txt`: `/fast/scratch/hyaku/tabi-r33/CritRowRobots` removed.

## Deliverable paths

- Report: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/CritRowRobots.md` (this file)
- Output dir: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/CritRowRobots/`
  (`receipts.txt`)
