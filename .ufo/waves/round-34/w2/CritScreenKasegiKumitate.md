# CritScreenKasegiKumitate — screens for kasegi and kumitate (round 34 w2, FALSIFY)

Seat: CritScreenKasegiKumitate. Attacks the five screen rows the item names —
`kasegi SKILL.md:267`, `kasegi corpus/knowledge/ufo-workspaces.md:272`,
`kumitate corpus/knowledge/kimi-skills-plugins.md:320`, `:321`, `:324` — in
`corpus/adjacency-screen-skill.tsv` at the wave-1 integration
`04f9623dde8ad35d470cecf766e421eafbcb47fa`, and, because they are kumitate rows of the same
shape, the two adjacent kumitate reversal rows `:250` and `:278`. Report only: nothing was
repaired, no lane file was touched.

## Verdict

**Holds — no defect on any of the five named rows (severity: none).** All five are
`same-surface` and that is the right reason in each case: they restate, on the sibling's own
side, a boundary the map already carries (kumitate → map row 10 `kimi-webbridge-plugin-internals`;
kasegi → map row 18 `authenticated-consequential-driving`), and the named surface really does
carry the boundary on tabi's bytes, not just by name. Every quote is a byte-exact substring of
the frozen candidate line (whitespace and punctuation included), every key is exactly a frozen
candidate key, every row's work count is inside 4–25 words / ≥20 non-space chars, and no row is
a real overlap that should have been a map row. The two extra kumitate rows (`:250`, `:278`) also
hold. The frozen C1 counter reads the integration clean: predicate true, candidates 67, mapped 5,
screened 62, unaccounted 0, newMapped 4, adjacency clean 17 rows / 17 verified, `screenFindings: []`.

Two things the L1 should know rather than repair: (a) these five rows are the *only* semantic
guard on five of 67 candidates — the frozen counter cannot see a wrong reason at all (mutant B
below re-reasons all five to `not-browser-sense` and the predicate still reads true), which is
the claim's disclosed limit, not a new defect; (b) two informational nits, neither load-bearing,
listed at the end.

## Evidence (commands, exit codes, file:line)

Scratch posture: one shared clone at `$S/clone`
(`HYAKU_SCRATCH=/fast/scratch/hyaku`, seat dir `tabi-r34/CritScreenKasegiKumitate`), checked
`--detach 04f9623d…`; `git -C "$S/clone" rev-parse --show-toplevel` printed the clone path;
every git call named `-C "$D"`; commits only on scratch branches `mut-a`/`mut-b` with
`-c user.name=CritScreenKasegiKumitate -c user.email=…@scratch.local`. No network fetch, no
browser, no tool install, no formatter/linter/build of the lane.

### 1. Candidate ↔ screen-row identity and quote exactness (exit 0)

```
node -e '… compare corpus/adjacency-screen-skill.tsv rows for lane ∈ {kasegi,kumitate} with
         .ufo/waves/round-34/baseline/c1-candidates.tsv text; words/non-space; substring …'
```

| ledger row | candidate key | reason | surface | quote verbatim | words / non-space |
|---|---|---|---|---|---|
| 59 | `kasegi-shokunin@9a10b02…:SKILL.md:267` | same-surface | authenticated-consequential-driving | true | 4 / 50 |
| 60 | `kasegi-…:corpus/knowledge/ufo-workspaces.md:272` | same-surface | authenticated-consequential-driving | true | 7 / 55 |
| 17 | `kumitate-shokunin@8d557f85…:corpus/knowledge/kimi-skills-plugins.md:250` | same-surface | kimi-webbridge-plugin-internals | true | 9 / 46 |
| 18 | `kumitate-…:kimi-skills-plugins.md:278` | same-surface | kimi-webbridge-plugin-internals | true | 6 / 53 |
| 19 | `kumitate-…:kimi-skills-plugins.md:320` | same-surface | kimi-webbridge-plugin-internals | true | 4 / 79 |
| 20 | `kumitate-…:kimi-skills-plugins.md:321` | same-surface | kimi-webbridge-plugin-internals | true | 6 / 61 |
| 21 | `kumitate-…:kimi-skills-plugins.md:324` | same-surface | kimi-webbridge-plugin-internals | true | 13 / 72 |

Header bytes are exactly `sibling_ref\treason\tsurface\tquote\tnote`; 62 data rows, no duplicate
`sibling_ref` (`awk | sort | uniq -d` empty, exit 0). Reason census at REV: same-surface 35,
third-lane-report 23, no-claim-declared 3, not-browser-sense 1 = 62 — matches
`corpus/lessons/round-34.md` §"C1 gate decisions" ("same-surface 35, third-lane-report 23,
no-claim-declared 3, not-browser-sense 1").

### 2. Candidate lines read in context at the cited pins (exit 0 each)

`git -C <lane>-shokunin show <pin>:<path> | nl -ba | sed -n …`:

- kumitate `8d557f85…` `corpus/knowledge/kimi-skills-plugins.md:318-321`:
  "Plugin internals — the daemon, the browser-extension payloads and the CLI workflow — are **out
  of this note's scope**; they belong to `tabi-shokunin/corpus/knowledge/webbridge-plugin-anatomy.md`
  (the K-block boundary clause routes `plugins/managed/kimi-webbridge` internals to tabi)."
  → the K-block handoff itself; row 10's sibling clause is
  `kumitate SCORECARD.md:1556` "internals route to **tabi**, the `config.toml` REA MCP spawn key to
  **kaidoku**", tabi's side `PROVINCE.md:6-8` "Owns (surfaces): the kimi-webbridge plugin
  (`~/.kimi-code/plugins/managed/kimi-webbridge/`) as primary substrate documentation". Same
  boundary, so `:320` and `:321` are two lines of one restated clause (each is a separate frozen
  candidate and each needs its own row).
- kumitate `:322-324`: "… the plugin copy's size, digests, version 1.11.3 and install record are
  tabi's ground and agree with `tabi-shokunin/corpus/knowledge/webbridge-plugin-anatomy.md:12-14`
  and `:57-58`; … This section repeats those values only to show that the two installs differ."
  Tabi's bytes verified to hold exactly that: `webbridge-plugin-anatomy.md:10-18` is the
  sha256/bytes table (`kimi.plugin.json` `e70aff5c40ff`·1273, `SKILL.md` `84a8e69d04c5`·11880,
  `references/operations.md` `b811d9c23dfd`·2422) and `:57-58` is "manifest `1.11.3` == skill
  frontmatter". The named surface carries the boundary, so `:324` is not a new provenance surface.
- kumitate `:246-250`: "the daemon itself is tabi's ground, not described here" — the daemon is
  named as one of the internals at `:318`, so `:250` is the same boundary.
- kumitate `:271-278`: two dated host-probe dumps "as tabi records them at
  `tabi-shokunin/SKILL.md:1421-1424`" — tabi `SKILL.md:1421-1424` does record them
  (`03-browser-extension.txt`, chromium process table; `04-headroom.txt`, memory/swap/load
  snapshot, "Named, not repaired"). Citation true; same plugin-tree boundary.
- kasegi `9a10b02…` `SKILL.md:262-268`: "Sibling L1s: `fleets/claimer-mission.md` (CDP browser
  submissions, operator-authed), `fleets/review-mission.md` (486-item drop/continue/leave sweep)."
  Map row 18's sibling ref is `mission-control.md:118-120` "the external-effect lane:
  operator-authenticated burnerchrome at CDP 9222 … Submission queue with per-package field plan";
  tabi's declaration `SKILL.md:2924` refuses "to drive an operator-authenticated browser into a
  submission act — C4 … and C5 … (`SKILL.md:727-728`)", C4 naming
  "purchases/posts/deletions/submissions", plus `PROVINCE.md:15-19`. Line 267 states that same
  practice and its authorization condition — a restatement, not a second boundary.
- kasegi `ufo-workspaces.md:269-273`: "the three preexisting submissions (airtable 4002789 …, spotify
  4002810 …, mozilla 4002776 …; account veigapunk, CDP 9222, `submission_verified: true`, 0
  mutations) — corroborates round 9." A receipt of the practice row 18 refuses to tabi; sibling-
  side fact of an already-mapped split, so a screen per QUALITY criterion 91
  (`corpus/QUALITY.md:585-590`: "a map row whose only sibling-side ground is a fact on the
  sibling's own side of an already-mapped split is a screen").
- No-staleness check: the two kasegi candidate texts and the three kumitate texts are byte-identical
  at their lane tips (`kasegi master 5006097a…` — the pin `d65d823e…` and the lead commit
  `9a10b02…` are both ancestors of master, `git merge-base --is-ancestor` exit 0; `kumitate master
  8d557f85…` = the pin). So no row cites a line that has moved or vanished.
- No kasegi set-A line exists (`git grep -wi tabi d65d823e… -- SKILL.md 'corpus/knowledge/*.md'`
  prints nothing), which is why both kasegi rows are set-B leads; not a screen defect.

### 3. Frozen counter at the integration (exit 0)

```
node .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs \
     --rev 04f9623dde8ad35d470cecf766e421eafbcb47fa \
     --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json     # exit 0
→ predicate true, candidates 67, mapped 5, screened 62, unaccounted 0, newMapped 4
  (rows 15,16,17,18), adjacency clean rows 17 verified 17, screenFindings [],
  leadsReanchored ["mirror-pitfalls.md:39@044048597… -> 40"], leadsUnresolved []
```
Receipt: `c1-at-04f9623.json`, `c1-restored-04f9623.json` (same reading after restoring the clone
from my mutants: 0 porcelain entries).

### 4. Two mutants (prove load-bearing + prove the counter is reason-blind)

- **A — drop the five rows** (scratch branch `mut-a`, commit "mut A: drop five screened rows"):
  counter exit **1**, `screened 57, unaccounted 5, predicate false, screenFindings []`. The five
  rows carry the accounting for five candidates; nothing else covers them. Receipt
  `mut-a-drop-five.json`.
- **B — same quotes, reason changed to `not-browser-sense` with surface `-`** (scratch branch
  `mut-b` off 04f9623): counter exit **0**, `predicate true, screened 62, unaccounted 0,
  screenFindings []`. The frozen counter cannot distinguish a right reason from a wrong one
  (claims.json `feasibilityDisclosed` says so); this seat's semantic read above is therefore the
  only guard on these five candidates. Receipt `mut-b-reason-blind.json`.

## Per-row verdicts, grouped by reason

`same-surface` — **right on all five named rows** (and on `:250`, `:278`):

| row | judgement | why the surface carries it |
|---|---|---|
| kasegi `SKILL.md:267` | reason right; not a map row | restates row 18's refused-route boundary on kasegi's side; tabi's side exists at `SKILL.md:2924` + C4 `:727` + `PROVINCE.md:15-19` |
| kasegi `ufo-workspaces.md:272` | reason right; not a map row | receipt of the same authenticated CDP 9222 submissions; criterion 91 screen |
| kumitate `:320` | reason right | the K-block clause itself; row 10 sibling `SCORECARD.md:1556` |
| kumitate `:321` | reason right | second line of the same clause |
| kumitate `:324` | reason right; not a map row | provenance values are held by tabi: `webbridge-plugin-anatomy.md:10-18`, `:57-58`, `PROVINCE.md:6-7` |
| kumitate `:250`, `:278` (extra) | reason right | daemon = an internal per `:318`; probe dumps recorded at tabi `SKILL.md:1421-1424` |

No row in this set is a real overlap screened (the worst defect class): none states a boundary
absent from map rows 10/18, and the two candidate facts that could have been new — the plugin
copy's provenance (`:324`) and the submission receipts (`:272`) — are both bytes tabi already
holds (`webbridge-plugin-anatomy.md:10-18`, `:57-58`) or refuses (`SKILL.md:2924`, C4 `:727`).
No row is `not-browser-sense` in disguise: kake `fire-journal-codes.md:27` (the ledger's only
`not-browser-sense`) names infrastructure tokens and asserts no browser behaviour; these five
assert a practice (submissions), an allocation (internals to tabi) or a provenance agreement.

## Informational nits (not defects, no correction required)

1. The notes on ledger rows 17 (`:250`) and 18 (`:278`) are the same sentence naming the *other*
   line's subject ("the daemon and plugin-root probe dumps …"), so neither note says which of the
   two the row is about. Cosmetic; the reason and surface are right either way.
2. `SKILL.md:2924` (row 18's tabi declaration) writes "session stores stay shape-only (A9,
   `SKILL.md:662-663`)": `:662-663` is the session-material prose bullet; the A9 gate row is
   `SKILL.md:743` at both baseline and REV. The content match makes the parenthetical true, but
   the ID and the locator name different objects. Low, informational — the declaration's quoted
   fragment (the `refused-route` ruling_quote) is verbatim on `:2924` and the gate verifies row 18.

## Deliverables

- `.ufo/waves/round-34/w2/CritScreenKasegiKumitate.md` (this report)
- `.ufo/waves/round-34/w2/CritScreenKasegiKumitate/c1-at-04f9623.json`
- `.ufo/waves/round-34/w2/CritScreenKasegiKumitate/c1-restored-04f9623.json`
- `.ufo/waves/round-34/w2/CritScreenKasegiKumitate/mut-a-drop-five.json`
- `.ufo/waves/round-34/w2/CritScreenKasegiKumitate/mut-b-reason-blind.json`

Checks the main agent should run after all seats land: the frozen C1 counter at the closure REV
(`predicate`, `unaccounted 0`, `newMapped ≥ 3`, `adjacency clean`), `check-adjacency --at REV`
from a clean clone, and `check-selfassessment --rev REV --repo …` per QUALITY 92.
