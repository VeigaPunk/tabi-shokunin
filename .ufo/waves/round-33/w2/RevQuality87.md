# RevQuality87 — QUALITY criteria 87–90 review, tabi round 33 w2 (attempt 1)

Attacked: `corpus/QUALITY.md` criteria 87–90 at `042d6d9abf97d567d495652a85eabc851b81adc1` — (a) every cited lesson
target and evidence path exists, (b) every quoted red-state number reproduces from the committed receipts, (c)
criterion 88's naming rule and criterion 90's green/counter-example text are consistent with the w1 attack reports.
Method per assignment: open the named JSONs and check the quoted numbers; read-only git at pinned revs; no counters
re-run (the w1 control reviewers re-ran all seven controls — see Verification gaps).

## Verdict

**holds** — with five low-severity precision findings, none of which changes a quoted red-state number, breaks a
citation target, or alters a criterion's operative rule. Criteria 87–90 sit at `corpus/QUALITY.md:532`, `:545`,
`:558`, `:570` under the `:530` header "## Round 33 additions (append-only; never edit above)"; `git diff --numstat
b7d16fb8… 042d6d9… -- corpus/QUALITY.md` → `55 0` (pure append). Every lesson target they cite exists at the pin
(`corpus/lessons/round-33.md` §Gate `:24` incl. the C1-gate-decisions subsection `:93`, §Mistakes `:162`, M5 `:170`,
M1 `:173`; `corpus/lessons/round-32-verifier-spotcheck.md:151` = routed defect 4; `corpus/lessons/round-32.md` M2
`:57`/`:74`), every evidence path exists and is tracked at the pin, and every quoted number in all four criteria
matches the named committed receipt byte-for-byte. Criterion 88's naming rule matches the gate's and the counter's
enforced rules line for line (including the `tabi | round-<N> |` any-round form, correctly avoiding the round-33
restriction w1 RevC1Controls flagged in the goal text as not counter-enforced), and criterion 90's green form and
counter-example are consistent with w1 CritC1Counter, CritC1Axis, RevC1Controls, RevC2Controls and CritForgeNext.
The findings are count/pointer/wording precision defects of exactly the class this lane tracks (round-32 routed
defect 5 carried "the Gate word counts" and a wrong §-anchor as errata); the largest is a lesson evidence pointer
that miscounts its own receipt (three vs four refused-route rows).

## Evidence

### 1. Citations exist (all read at the pin via `git show 042d6d9…:<path>`; exit 0 each)

- Criteria: `QUALITY.md:530` header, `:532` (87), `:545` (88), `:558` (89), `:570` (90). Append-only:
  `git diff --numstat b7d16fb8a9405f09bf064e9ea51905b8f9fe66cd 042d6d9abf97d567d495652a85eabc851b81adc1 -- corpus/QUALITY.md`
  → `55	0`. Criteria absent at the freeze (`git show e6b0a90…:corpus/QUALITY.md | grep -cE '^8[789]\.|^90\.'` → 0),
  present at bf48b81 (→ 4): landed by the L1 with the wave, unchanged between bf48b81 and 042d6d9
  (`git diff --numstat bf48b81… 042d6d9…` lists only measure files, `w2-spec.json`, and `SCORECARD.md` `2 0`).
- Lesson targets at the pin: `corpus/lessons/round-33.md` — `## Gate` `:24`, `### C1 gate decisions —
  sibling-overlap admits and rejects` `:93`, `## Mistakes` `:162`, M5 row `:170`, M1 section `:173`.
  `corpus/lessons/round-32-verifier-spotcheck.md:151` = routed defect 4 ("`claims.json` C1 `feasibilityDisclosed` is
  false as written (M2). Append a named correction, since the frozen file cannot be edited, and carry it until it
  lands."). `corpus/lessons/round-32.md` M2 table row `:57`, section `:74`.
- Evidence paths tracked at 042d6d9 (`git ls-tree -r --name-only 042d6d9… | grep …`): all six named baseline JSONs
  plus their `.provenance`/`.stderr`; `.ufo/waves/round-33/w1/CritC1Counter/` (56 files, incl. `receipts/D.json`,
  `receipts/attackD-adjacency.tsv`), `.ufo/waves/round-33/w1/CritC1Axis/` (probe receipts); round-32
  `.ufo/waves/round-32/w1/CritC1Forgery.md` carries D1–D5 (`:91`, `:104`, `:113`, `:122`, `:132`).
- Criterion 87's premise (membership rule fixed before the map was edited): `git merge-base --is-ancestor
  e6b0a9074d434ccc307badd312ae7379d1193fea 042d6d9abf97d567d495652a85eabc851b81adc1` → exit 0; the candidate list
  `baseline/c1-candidates.tsv` is committed at the freeze, the map edits land at bf48b81/042d6d9.

### 2. Red states reproduce from the committed receipts (jq over the named JSONs; all numbers quoted in the criteria match)

- **87** → `baseline/c1-J2-screen-all.json`: `screened 47`, `unaccounted 0`, `newMapped 0`, `predicate false` ✓;
  `baseline/c1-J3-junk-rows.json`: `adjacency {verdict clean, rows 14, verified 14, findings 0}`, `unaccounted 47` ✓.
- **88** → `baseline/c1-J4-mislabel-unnamed.json`: rows 14, verified 14, `mapped 9`, `newMapped 0`, `unaccounted 43`,
  `predicate false` ✓; `c1-J3-junk-rows.json` equally clean and `newMapped 0` ✓. Construction verified in
  `baseline/controls.mjs:70-78`: `controls.mjs:74` filters `kake-` candidates to lines without `\btabi\b`
  (`!/\btabi\b/i.test(x.text)`), sibling_quote = the candidate line's first ≤12 words, tabi side = the
  `PROVINCE.md:3` Domain line — neither names a side, so "real kake candidate lines whose quotes name neither side"
  is exact (and the J4 rows are `split-declared`, as stated).
- **89** → `baseline/c2-J1-do-nothing.json`: `forgeriesAccepted 8`, `acceptedForgeries ["F1"…"F8"]`, honest
  H0/H1/H2 each `{accepted: true, population 16, admitted 16, failing 0}` (`results.H0/H1/H2` — the admitted count
  is stated), `selftest {exit 0, "…verdict=clean cases=27 passed=27"}` ✓; `c2-J2-reject-all.json`:
  `forgeriesAccepted 0`, honest H0/H1/H2 all false ✓; `c2-J3-whitelist.json`: `digestLiterals` = five 12-hex strings
  (`8aa97463c238`, `9918a716da71`, `92bd413caab0`, `b9dab912f0af`, `55dbef88ed4b`), `selftest {exit 3, last
  "BIDI_RUNTIME_SELFTEST verdict=failed cases=27 passed=25"}` ✓ — every number and the verbatim selftest line match
  criterion 89's text.
- **90** → round-32 `.ufo/waves/round-32/claims.json` C1 `feasibilityDisclosed` contains the quoted sentence
  verbatim: "it is not reachable without a committed receipt of two real runs from a driver other than the counter
  (controls J3/J4)" ✓; the four constructions match round-32 M2's list ✓; the downstream fix landed as named
  corrections citing the stale sentence: `LOG.md:2374-2379` and `SCORECARD.md:1790-1798` at the pin (both quote the
  stale clause and name the constructions) ✓; the green-form controls `c2-J1/J2/J3` are committed at the freeze ✓.

### 3. Criterion 88's naming rule vs the instruments and the w1 reports

- Gate (`scripts/check-adjacency.mjs` at the pin): header `:84` "ruling_quote must name the sibling lane" (ruled);
  `:85-87` contested-open = "exactly `fleet@<40-hex>:.ufo/l0-questions.md:<line>` naming a `tabi | round-<N> |` row
  that itself names the sibling lane"; implementation findings `ruling_quote_absent` (`:143-145`) and
  `l0_line_absent` (`:146-148`), `L0_TABI_ROW = /^tabi[ \t]*\|[ \t]*round-[0-9]+[ \t]*\|/` (`:231`). Criterion 88's
  "a `ruled` row's ruling line and a `contested-open` row's fleet L0 `tabi | round-<N> |` line name the sibling" ✓
  exact — including `<N>` (any round), which avoids the round-33 restriction that w1 RevC1Controls R4 recorded as
  not counter-enforced.
- Counter (`.ufo/waves/round-33/counters/c1-adjacency-sweep.mjs` at the pin): `:222-225` — split-declared/
  refused-route naming test `/\btabi\b/i.test(r.siblingQuote) || new RegExp(\`\\b${r.sibling…}\\b\`,'i').test(r.tabiQuote)`
  ✓ = criterion 88's "carries `tabi` in its sibling quote or the sibling lane token in its tabi quote".
- "Naming is necessary, not sufficient" ✓ evidenced by w1 CritC1Counter D1 (predicate true with manufactured
  naming; `receipts/D.json` `predicate: true`, `newMappedRows` rows 12–15) — with the count nit in F1 below.
- The landed rows satisfy the rule: `corpus/adjacency.tsv` rows 12–15 at the pin — rows 12/13 name via the sibling
  quote ("browser execution stays tabi's"; "…client-side crawler discipline belong to tabi"), rows 14/15 via the
  tabi quote ("…for kake's accessibility review is tabi's"; "…is kake's publisher-side knowledge");
  `measure/c1-at-bf48b81.json` `newMappedRows` = exactly those four (`split-declared`), `predicate true`,
  `unaccounted 0`, `screened 43`, `mapped 9`.
- No w1 adjacency report contradicts the rule: AdjKakeA/B/C, AdjKagi, AdjKaidoku, AdjOthers drafted rows/screens
  under it; RevC1Controls verified the claims text against the counter code clause by clause ("holds" on every
  item, incl. the naming filter at `:217-224`).

### 4. Criterion 90's green form and counter-example vs the w1 attack reports

- **Green form** ("C2 states the battery's finiteness only after F1-F8 and the reject-all and whitelist controls
  ran"): claims.json C2 `feasibilityDisclosed` states the finiteness ("The battery is finite: a gate can refuse
  F1-F8 by construction-specific tells and still admit a smarter forgery…") and bounds itself ("Wave 2 builds new
  constructions against v2 and reports survivors as limits; they do not change this frozen predicate"); the three
  controls are committed receipts at the freeze ✓. RevC2Controls re-ran all three and reproduced them exactly
  ("Controls re-run reproduces committed receipts — holds"), and its residual note calls the disclosed
  smarter-forgery / non-hex-whitelist limits "consistent with the frozen predicate, not a defect in it". w1
  CritC2Counter D3 went further and built the size/path whitelist the sentence names (`gate-5f494ed7.mjs`) — the
  named limit has since been exercised, which strengthens the green form. CritForgeNext's verdict agrees: "C2's
  frozen predicate is **not** contradicted (v2 can still refuse F1–F8)".
- **Counter-example** ("its sentence named the named-quote mislabel after the screen-all and mislabel controls ran,
  but w1 CritC1Counter and CritC1Axis found cheaper constructions it did not name"): C1's `feasibilityDisclosed`
  names the named-quote construction ("four new rows on candidate lines whose quotes name the other side reach
  newMapped 4 whatever their disposition is worth") and the wrong-reason screen; the screen-all (J2) and mislabel
  (J4) controls ran before the freeze ✓; CritC1Counter found D1 (reused `PROVINCE.md:16` tabi line as the only
  naming content), D2 (stale round-17 l0 line), D3 (re-filing an already-mapped candidate), D4 (screenFindings
  never gate), D5 (crash exits 1), D6 (regex undercount), D7 (off-line ruling_quote) and CritC1Axis found probes A
  (renamed restatements of the already-mapped kake split + full screen ledger), C (ruled re-citation), D (one-sided
  split) — all cheaper and unnamed by the sentence ✓, matching lesson M5's class claim ("reach predicate true more
  cheaply") and criterion 90's closing rule ("a feasibility sentence is bounded by the attacks actually run, and
  says so").

## Findings (all low; none changes a quoted number, a citation target, or a criterion's operative rule)

**F1 — low — lesson M5's evidence pointer miscounts its own receipt (three vs four).**
`corpus/lessons/round-33.md:170` (M5): "`D.json`: **three** `refused-route` rows reusing `PROVINCE.md:16` as the
only naming quote". The committed receipt shows **four**: `w1/CritC1Counter/receipts/D.json` `newMappedRows` =
rows 12–15, all `disposition: "refused-route"`; `receipts/attackD-adjacency.tsv` rows 12–15 all `refused-route`
with `tabi_ref PROVINCE.md:16` and the same tabi_quote. The error originates in the w1 report's own verdict
paragraph (`w1/CritC1Counter.md:9`: "**three** of the four dispositions are `refused-route` rows"), which also
contradicts that report's D1 section ("baseline map + four rows", all four listed refused-route) — plausibly a
merge artifact of the H2 phrasing at `:63` ("only **three** of the four rows answer a previously-unaccounted
line", where "three of four" is correct). Criterion 88's own text states no count and is accurate; criterion 90
cites M5 for the class, not the count. Fix per criterion 90's own rule: an append-only correction citing the
stale sentence.

**F2 — low — criterion 90's four-construction enumeration misaligns with CritC1Forgery's construction table.**
Criterion 90 (`QUALITY.md:574-576`): "four cheap constructions reached admitted 16 (an id listed 16 times, one
transcript cited as both runs, a driver re-exporting the gate, a synthetic transcript with a real first screenshot
spliced in)". `round-32/w1/CritC1Forgery.md`'s table (`:48-51`) defines the four committed constructions as
v1 = golden synthetic + real CDP screenshot + re-export driver (`b858b5d` — the re-export is v1's driver
component, not a standalone construction), v2 = `R2` ×16 (`e666174`), v3 = same transcript path twice
(`7912a62`), v4 = two byte-identical copies (`cee9539`). The criterion's parenthetical follows the report's intro
classes (a)–(d) (`:12-13`), where (c) spans v3+v4 and (d) is v1's component — read 1:1 it double-counts v1 and
omits v4. Round-32 lesson M2 (`:57`) shares the wording; the round-33 SCORECARD correction (`:1793-1796`)
enumerates the four correctly with commit ids. The count "four" is right; the enumeration is not.

**F3 — low — criterion 87's Check understates the screen-quote rule.** Criterion 87 (`QUALITY.md:540`): "every
screen quote is a verbatim 4-25-word substring of the candidate line". The counter additionally requires ≥ 20
non-space characters: `c1-adjacency-sweep.mjs:111` `goodQuote = (q) => words(q).length >= 4 && words(q).length
<= 25 && q.replace(/\s/g, '').length >= 20`, applied at `:202` with the substring test; the gate header
(`check-adjacency.mjs:71-72`) and the seat spec state the same conjunct. A reader implementing the criterion's
text alone would accept screens the counter flags `screen-quote`.

**F4 — low — criterion 88's headline overstates mutuality; the landed rows show the one-directional rule is
operative.** Headline (`QUALITY.md:545-546`): "its two quotes name each other's lane". The enforced rules are
one-directional per disposition: ruled/contested-open require the tabi-side line to name the sibling (gate `:84`,
`:85-87`) with no naming required of the sibling quote; split/refused require either direction (counter
`:222-225`). The L1's own landed rows 14–15 satisfy only the tabi-quote direction (sibling quotes = kake:79 "No
actual website accessibility is evaluated. Browser/assistive-technology" and kake:347 "backoff reduces the crawl
rate across the whole hostname" name no lane). The elaboration after the colon is exact; only the headline is
overstrict — no gaming consequence (it demands more than the instruments do, never less).

**F5 — low — criterion 89's lesson pointer lands on the wrong section.** Source line (`QUALITY.md:567-568`):
"corpus/lessons/round-33.md §Gate". As filed, §Gate (`round-33.md:24-92`) documents the S127–S129 SOURCES
admissions and the gate-v2 grounding; it contains no battery/population content (grep over the lesson:
"battery"/"forgeriesAccepted"/"whitelist" appear only in the intro `:15-18` and M1 `:166`, `:183-187`). The
three-population rule and its controls are documented in M1. Criterion 87's §Gate pointer is fine (§Gate includes
the C1-gate-decisions subsection `:93-131`). Origin: the w1 draft cited assigned sections before the lesson
existed (`w1/ScribeQuality.md:62`: "Criteria cite its assigned sections (`§Gate`, `§Mistakes`) and no M number;
the L1 assigns numbers on filing") — the L1 kept §Gate for 89 when filing, where M1 would have been the honest
pointer.

## Residual risk and verification gaps

- Per the assignment's method I opened the named JSONs and checked the quoted numbers; I did not re-run the
  counters. The w1 control reviewers independently re-ran all seven controls with identical counted fields
  (RevC1Controls per-item "holds" table; RevC2Controls §3–5), so the receipts are doubly attested; a third run was
  not required by my assignment.
- Out of scope, not checked here: the C2 battery's internal fixture construction and its D1–D6 blind spots
  (CritC2Counter/CritForgeNext own those); the live leg; the w2 row-by-row semantic attacks on the four landed
  rows (other seats'); the `SCORECARD.md` `2 0` delta between bf48b81 and 042d6d9 (the L1's mismatch clearing).
- Known and already recorded in the lesson, not re-flagged: the mutated controls' provenance revs do not resolve
  in the lane repo (round-33.md M3 residual).

## Hygiene

- No lane tracked file, lane git index, lane jj state, fleet repo, sibling repo or `/home/vgpnk/Projects/shokuknow`
  written; read-only git in the lane only (`show`, `ls-tree`, `diff --numstat`, `merge-base --is-ancestor`, `grep`)
  at pinned revs. No commits anywhere.
- No tool installed or upgraded; no network fetch; no browser, chromedriver or chromium started.
  `pgrep -fa 'chromedriver|chromium'` → only the host monitor `1371 /usr/bin/earlyoom … --prefer
  (^|/)(java|node|chromium|python3?)$` (its cmdline contains the word; no chromedriver/chromium process exists) —
  nothing owned by this seat.
- Scratch `/fast/scratch/hyaku/tabi-r33/RevQuality87` (created at start, unused — every number above is quoted
  from committed receipts) deleted before yield.

## Deliverable paths

- Report: `.ufo/waves/round-33/w2/RevQuality87.md` (this file)
- Output dir: `.ufo/waves/round-33/w2/RevQuality87/` (created; empty — no seat-generated artifacts; all evidence
  is quoted from committed receipts at the pin)
