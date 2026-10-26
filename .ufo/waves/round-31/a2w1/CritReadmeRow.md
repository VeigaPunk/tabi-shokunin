# CritReadmeRow — round 31 wave a2w1: the corpus/README.md round-31 section at 4860483

**Verdict (one paragraph).** The appended section's own numbers hold: the note row's thirteen enumerated
figures map one-to-one onto D1–D13 and each is the source's own number in its located quote; the correction's
provenance is exact (17 at the round-27 tip `eb23c0b` = `b4128c4^`, 20 at `b4128c4`, 22 at `97be89b`, 30 at
both the freeze `9505a10` and REV — all five re-measured by running the gate in a fixture of that commit); no
new tally shape is mis-read (the only tally the calibration counter extracts from the new section is
`README.md:668` `(30/30)`, observed 30 = claimed 30; line 613 17→30 supersedes, so the C1/C2 coupling the
claims flag does not bite); every pointer is live (entry, four receipts + four byte files, S119–S122 rows,
QUALITY 80–81, both cited commits, both counter commands). But the section does carry one **medium** defect
and three **low** ones. Medium: the round-31 entry has no `frontier: rate-tos-signal` line, so the frontier
item's own admission instrument still reports population 2 / admitted 2 over the two round-30 vocabulary notes
(`frontier.json`, exit 0) while `README.md:685` files the decision table under that item and points only at the
decision-table counter — the round-30 row's pointer (`README.md:651`) now silently returns the pre-round-31
population, and the "round-30 C2 reading not disturbed" no-harm check is true only because the new ground is
invisible to that instrument. Low: `README.md:680-681` narrows round-30's "still decide from an absence"
(`README.md:644-645`) to "an absence of any measured real-site rate datum", which is C6's basis but not C3's
(the table's C3, line 59 / §89-94, decides from a rights + unmeasured ToS/robots absence and a missing scoped
go-ahead); `README.md:686` says "multi-script lines stay unchecked" but all three unchecked README tally lines
and several unchecked SKILL/LOG lines sit in **single-script or zero-script** sections, so the named rule is
not the actual rule; `README.md:685` attributes "(decision table D1–D13)" to "the rate half" while D1–D5 are
robots.txt crawl bounds, not rate thresholds. No claim-level overclaim was found against the frozen C1/C2
predicates; the defects are prose and pointer-coherence defects inside the calibration/frontier restatement.

Attack surface: `git diff 9505a10eb80b2a0b273ebaba3f7f872ad302192d 486048356f0712e4396588c9dab58cd419243120 -- corpus/README.md`
→ **exit 0**, 25 insertions / 0 deletions; appended block = lines 663–686 at REV. Line numbers below are REV line numbers.

---

## Findings

### F1 — defect (medium): duplicate authority on the frontier item; the item's admission instrument silently stops measuring it

**What I attack.** `README.md:685` (new status row) and `README.md:651` (round-30 row, bytes unchanged) file the
same frontier item, *Rate/ToS surface for site-interaction records*, with two different instruments. The new
entry `/corpus/knowledge/rate-signal-decision-table.md` carries no `frontier:` tag:

```
$ cd "$S/clone" && git show 486048356f0712e4396588c9dab58cd419243120:corpus/knowledge/rate-signal-decision-table.md | grep -c "frontier"
0                       # exit 1 (no match)
$ git grep -l '^frontier: ' 486048356f0712e4396588c9dab58cd419243120 -- corpus/knowledge | wc -l
2                       # exit 0 — both are round-30: host-published-rate-limit-headers.md:6, rate-limit-policy-fields.md:6
$ git ls-tree -r --name-only 486048356f0712e4396588c9dab58cd419243120 -- corpus/knowledge | wc -l
50                      # exit 0
```

Consequently the pointer the lane gave this item in round 30 still reads the round-30 population:

```
$ TMPDIR=$S node scripts/check-frontier-admission.mjs --rev 486048356f0712e4396588c9dab58cd419243120 \
    --frontier rate-tos-signal --since 2026-10-26 --live --json > "$S/frontier.json"
exit 0; population 2, admitted 2, failing 0
entries: corpus/knowledge/host-published-rate-limit-headers.md [S117], corpus/knowledge/rate-limit-policy-fields.md [S116]
```

`check-frontier-admission.mjs` discovers only entries whose first 15 lines carry the exact line
`frontier: <slug>` (`scripts/check-frontier-admission.mjs:28`), and its default receipts root is
`corpus/evidence/round-30/frontier` (line 81) — so the round-31 entry (receipts under
`corpus/evidence/round-31/decision-table/`) is invisible to it. A reader who follows the round-30 row's
live pointer after round 31 concludes the item's ground has not moved this round, while `README.md:685`
declares it moved. The freeze no-harm check "population 2, admitted 2 (round-30 C2 reading not disturbed)"
is only true because the new ground is untagged — the reading is undisturbed, not extended.

**Impacted axes:** coverage (frontier admission), calibration (the item now has two counters with divergent
populations), operability (two live pointers that disagree about what the item contains).

**Smallest safe correction:** state the admission-counter reading in the round-31 row — "admission counter
`--frontier rate-tos-signal --since 2026-10-26` still reports population 2 (the two vocabulary notes); this
entry is filed on the item by this row, not by the tag" — or tag the entry and route its receipts so the same
pointer admits it (then 3/3; that change needs its own counter run, not assumed here).

---

### F2 — defect (low): approval table C3/C6 restatement misstates C3's deciding evidence

**What I attack.** `README.md:680-681`: "the approval table's C3/C6 dispositions are unchanged (still decided
from an absence of any measured real-site rate datum)". The round-30 restatement (`README.md:644-645`) said
"the approval table's C3 and C6 still decide from an absence (`knowledge/interaction-approval-table.md`, U1
stays open)" — an unspecified absence. The table itself separates them:

- C3 row (`corpus/knowledge/interaction-approval-table.md:59`): "rights: the third party's; ToS/robots surface
  **unmeasured** … → default-deny · rate: unmeasured (same rule)". §89-94: "Rights evidence is an absence, not
  a grant: the corpus holds no measured ToS/robots datum … Falsifier: a measured, recorded operator go-ahead
  naming the site + scope converts this class to an approved observation task."
- C6 row (line 62): "rate: **the deciding axis — and it is unmeasured here**". §120-127 confirm.

So the rate-datum absence is C6's deciding evidence, not C3's: C3 stays blocked for lack of a scoped
go-ahead and an unmeasured ToS/robots surface, and a rate datum would not lift it. The sentence is also in
tension with its own clause "the ToS half stays open" (`README.md:681`).

**Impacted axes:** depth (a restatement that misattributes the table's deciding evidence), adjacency (boundary
with the approval table's authority).

**Smallest safe correction:** restore the round-30 generic wording and make the split explicit —
"C3 and C6 still decide from an absence: C3 from an unmeasured ToS/robots surface and no scoped go-ahead,
C6 from an unmeasured rate surface (`knowledge/interaction-approval-table.md` C3/C6, U1 open)".

---

### F3 — defect (low): the calibration row misnames the rule that leaves tally lines unchecked

**What I attack.** `README.md:686`: "held for SCORECARD.md, LOG.md, SKILL.md and corpus/README.md — gate
tallies compared with each gate's own summary line; a gate whose summary spells its count otherwise
(`cli_cases=`) and multi-script lines stay unchecked".

Measured at REV with the frozen counter (`c2.json`, exit 0): 106 tally findings in the four documents, 79
evaluated, 27 un-evaluated. Distinct un-evaluated reasons, complete list:

```
["ambiguous script association", "script outside the runnable gate set", "command outside the closed re-run grammar"]
```

- The `cli_cases=` class the row names has **zero** instances at REV (`self-test printed no tally` does not
  occur; the third reason belongs to m2 receipts, not these documents).
- `script outside the runnable gate set` occurs **3 times**, and the row does not name it: `LOG.md:972`
  (claims 59), `SKILL.md:2027` (8), `SKILL.md:2028` (12) — the `scripts/freshness-witness.mjs`,
  `scripts/webmcp-invoke-round18.mjs` and `scripts/selftest-measurement-binding.mjs` probe tallies, refused by
  `RUNNABLE_GATE` (`scripts/check-selfassessment.mjs:80,148`).
- "multi-script lines" is not the rule that leaves the 21 ambiguous lines unchecked. The round-31 windows use
  `lineOnly = true` (no section fallback), so a tally line that names no script is unchecked even in a
  **single-script** section. Measured per line (heading-delimited section, script names in that section):

```
corpus/README.md:358 claimed=43 section-scripts=1 [scripts/check-adjacency.mjs]  line-scripts=[]
corpus/README.md:359 claimed=59 section-scripts=1 [scripts/check-adjacency.mjs]  line-scripts=[]
corpus/README.md:422 claimed=66 section-scripts=1 [scripts/webmcp-validation-round19.mjs] line-scripts=[]
LOG.md:471  claimed=4  section-scripts=0 []
LOG.md:484  claimed=25 section-scripts=1 [scripts/check-sources.mjs]
SKILL.md:2092 claimed=66 section-scripts=1 [scripts/webmcp-validation-round19.mjs]
```

So all three unchecked README tally lines and several SKILL/LOG ones are **not** multi-script lines. The
counter's stricter rule is defensible (the true owner of README:358-359 is a round-16/17 binding receipt gate,
not the section's `check-adjacency.mjs`), but the row's disclosure does not describe it; a reader cannot
decide from the row whether their line is checked.

**Impacted axes:** calibration (disclosure of the oracle's scope), operability (a reader checking a line gets
the wrong test).

**Smallest safe correction:** replace "`cli_cases=`) and multi-script lines stay unchecked" with "a summary
that does not print `<NAME>_SELFTEST … cases=N`, a tally line that does not name its own runnable gate (e.g.
`corpus/README.md:358-359`), and probe scripts outside the runnable gate set (`scripts/freshness-witness.mjs`,
`scripts/webmcp-invoke-round18.mjs`, `scripts/selftest-measurement-binding.mjs`) stay unchecked".

---

### F4 — defect (low): crawl rows attributed to "the rate half"

**What I attack.** `README.md:685` status: "docs-held with sourced thresholds on the rate half (decision table
D1–D13)". D1–D5 are robots.txt crawl bounds — 5-redirect chain, 30-day example period, 24-hour cache
lifetime, 500 KiB parse floor — not rate thresholds, and no frontier item in the corpus names a crawl/robots
half (the frontier-item name list at REV has no robots/crawl item). The item's own columns at
`README.md:676` call the entry "rate and crawl". The parenthetical therefore credits five crawl rows to the
rate half; it overstates what the rate half gained and leaves the crawl ground filed under an item whose name
does not cover it.

**Impacted axes:** coverage (item identity absorbs ground no item names), depth (a restatement that
over-attributes its entry's rows).

**Smallest safe correction:** split the parenthetical — "sourced thresholds on the rate half (D6–D13) and
robots/crawl bounds (D1–D5, filed under this item provisionally)".

---

## Holds (attacked, no defect found)

1. **Note row numbers ↔ D1–D13**, `README.md:676`. Each enumerated figure is the row's Threshold cell and
   appears in the row's located quote in committed bytes: S119 `"crawlers SHOULD follow at least five
   consecutive redirects"`, `"more than five consecutive redirects"`, `"for example, 30 days"`, `"cached
   version for more than 24 hours"`, `"parsing limit MUST be at least 500 kibibytes"`; S121 `60 requests per
   hour`, `5,000 requests per hour`, `No more than 100 concurrent requests`, `900 points per minute`,
   `90 seconds of CPU time per 60 seconds`, `wait for at least one minute`; S122 `wait at least one second
   between each request`, `x-ratelimit-remaining` + `header is` + `0` (HTML tags and line wraps normalised;
   `git show REV:corpus/evidence/round-31/decision-table/bytes/... | grep`, exit 0). D13's mutative scoping is
   the source's own adjacent sentence in the fetched page (`"large number of POST, PATCH, PUT, or DELETE"`,
   verified in the S122 bytes). RFC 6585 is prose-only in the entry and its `Retry-After: 3600` /
   50-requests-per-hour body are called illustrations at entry lines 137-138 — the row's "specimen values"
   clause matches; no D row cites S120.
2. **Correction provenance**, `README.md:668`. Re-measured by running the gate in a fixture repo of each
   commit (`git archive … | tar -x`, `git init` + commit, `git -C "$d" rev-parse --show-toplevel` = `$d`):
   `eb23c0b` (= `b4128c4^`, round-27 tip) `SELFASSESSMENT_SELFTEST verdict=clean cases=17 passed=17`;
   `b4128c4` cases=20; `97be89b` cases=22; `9505a10` cases=30; `4860483` cases=30 (each exit 0). The v2 added
   exactly eight cases (`grep -cE 'id: "v2-'` → 8, ids `v2-oracle-reads-summary-line-not-first-cases-token`,
   `v2-skill-*` ×3, `v2-readme-*` ×4). Line 613's stale figure is 17 at both the freeze and REV, so the
   cited line is stable and the citation is same-document.
3. **No tally-shape mis-read in the new section.** The counter extracts exactly five README findings:
   `358` (43, ambiguous), `359` (59, ambiguous), `422` (66, ambiguous), `613` (17 → 30, superseded=true),
   `668` (30 = 30). Nothing is extracted from `676`, `678-681`, `685` or `686` (no self-test/case claim on
   those lines), so the C1 rows introduce no tally the oracle could mis-read, and line 668's figure is
   oracle-correct. `superseded` 29 overall (the 9 freeze-time stale lines plus earlier rounds').
4. **Pointers live.** `/corpus/knowledge/rate-signal-decision-table.md` present; four receipts
   (`S119–S122.json`, each with url, `fetched_at` 2026-10-26T08:36Z, `http_status` 200, bytes path, sha256)
   + four byte files under `corpus/evidence/round-31/decision-table/`; SOURCES rows 133–136 (S119–S122), 0 at
   baseline `96a2d1a`; `corpus/QUALITY.md:457` (criterion 80) and `:472` (81); `LOG.md:1880` round-27 entry;
   commits `b4128c4` and `97be89b` exist with the messages the correction implies. Both cited counters run
   clean at REV with the frozen bytes: `check-decision-table --live` **exit 0**, population 13, admitted 13,
   failing 0 (`c1.json`); `check-selfassessment --rev` **exit 0**, mismatches 0, counted 0,
   couldNotEvaluate 103 (`c2.json`); `check-frontier-admission --live` **exit 0** (population 2, see F1).
5. **C2 predicate's supporting facts.** `git diff --numstat 9505a10 4860483 -- SKILL.md corpus/README.md
   SCORECARD.md LOG.md` → `4 0`, `22 0`, `25 0` (0 deleted lines); `git diff --name-only 9505a10 4860483 --
   scripts/ | wc -l` → 0; gate digests byte-identical at freeze and REV
   (`check-selfassessment.mjs` 143d66ff…, `check-decision-table.mjs` d15f3bd7…).
6. **No contradiction with the round-30 wave-2 correction** (rate-half-only docs-held, ToS and runtime open):
   `README.md:678-681` restates it faithfully apart from the F2 parenthetical; the earlier rows keep their
   bytes and are not edited.

## Observations (not defects)

- **O1.** The corrections block (663–668) is no longer at the end of the document: the round-31 rate section
  (670–686) follows it. C2's kill rule says corrections are appended at the end "so an insertion above a cited
  line does not shift later citations"; nothing shifted (613 is 613 at freeze and REV, 668 > 613, and the
  counter's supersession is paragraph-order based), so the rule's mechanism holds, but a future correction
  must append after 686 and the phrase "at the end" is no longer literally true for this document.
- **O2.** The GitHub receipts are not byte-reproducible: my live GETs of S121/S122 at 2026-10-26T12:35:25Z
  return the same byte counts as the committed files (337116, 328088) but a different sha256 (63 differing
  bytes each, first at offset 7897, inside the Next.js `_buildManifest.js` hash), while every quoted number is
  still present. The row's "vendor numbers are that vendor's at the access date" wording covers this; the
  quote-level live check passes. RFC bytes are byte-identical (S119 f633915d…, S120 f6d55d1b…).
- **O3.** `README.md:686` cites criteria "80–81"; 80 is the decision-table row standard (C1's axis), 81 the
  tally oracle (C2's). Defensible as a joint pointer (80 states the counter command and its
  necessary-not-sufficient status), but 81 alone is the calibration oracle.

---

## Measurements and fetches

Counter outputs (copied to this directory): `c1.json`, `c2.json`, `frontier.json`; fixtures `fx-<commit>/`
kept under `$HYAKU_SCRATCH/tabi-r31/CritReadmeRow/` until cleanup. One live clone at
`486048356f0712e4396588c9dab58cd419243120`, `git status --porcelain` empty (0 lines).

Direct fetches (own evidence, `curl -q -sS --proto =https -L`, UTC 2026-10-26T12:35:25Z, all HTTP 200):

| id | url | bytes | sha256 | vs committed receipt |
|---|---|---|---|---|
| S119 | https://www.rfc-editor.org/rfc/rfc9309.txt | 25265 | f633915daaa15b943cae56545d333bcf3ba4d156599e4555499686d6699fb207 | identical |
| S120 | https://www.rfc-editor.org/rfc/rfc6585.txt | 17164 | f6d55d1b491cd515c35827cf9181753b23b2a68c4df14e56d83dc445b3876e58 | identical |
| S121 | https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api | 337116 | 47031376e510aeca24d6c088365460bf065e50386e7a77c3314f52a6b63173d9 | differs (receipt 3a33f87b…) |
| S122 | https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-the-rest-api | 328088 | e4050f6bab26d33a4f6e8cc633555bb55478f9cc0c2857e37e77ff7ba38147b0 | differs (receipt b15c1c0b…) |

The `--live` runs of the two counters performed their own GETs (per receipt URL, `curl -q -sS --proto
=https`); their outputs record only booleans, hence the direct fetches above.

## Method notes

- Attack seat only: no repair attempted, no lane file edited, no lane git/jj state touched; all commits were
  made in fixture repos under `$HYAKU_SCRATCH/tabi-r31/CritReadmeRow/` (each verified
  `git -C "$d" rev-parse --show-toplevel` = `$d`).
- No tool installed or upgraded; nothing needed. No subagent dispatched.
- Commands quoted above are the exact forms run; exit codes are stated inline (0 unless noted; the two
  `grep -c` calls that returned no match report 1 with their output shown).
