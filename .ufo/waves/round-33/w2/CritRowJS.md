# CritRowJS — round 33 w2 attack on map row 12 `js-rendering-browser-execution`

Seat: CritRowJS. Attacked revision `042d6d9abf97d567d495652a85eabc851b81adc1` (L1 integration), live clone
`/fast/scratch/hyaku/tabi-r33/CritRowJS/clone` (`git clone --shared`, detached at that revision, toplevel asserted).
Target: `corpus/adjacency.tsv` data row 12 (file line 12) — `js-rendering-browser-execution | kake |
kake-shokunin@044048597d62f3199494b63b36e90dd57825e350:PROVINCE.md:61 | "browser execution stays tabi's" |
SKILL.md:2887 | "executing a page in a browser to see what a crawler would render is tabi's" | split-declared |
- | "canonical declaration and selection stay kake's"`. Blobs: `adjacency.tsv` `1cd0b38c…`, `SKILL.md` `adf60e7f…`,
kake `PROVINCE.md` `175fdab3…`.

## Verdict (one paragraph)

**Holds as a map row.** It is a real overlap: at the frozen kake pin `04404859…` kake holds publisher-side JS-rendering
and canonical knowledge (`corpus/knowledge/js-rendering-queue.md`, `dynamic-rendering-workaround-limits.md`,
`static-canonical-preflight.md`, `canonical-selection.md`) and cedes execution (`PROVINCE.md:61`, restated at `:362`);
tabi holds the execution/rendered-state surface (`PROVINCE.md:9-13`, `SKILL.md:371-401`,
`corpus/knowledge/live-dynamic-capture.md`). `split-declared` is the only applicable disposition (kake cedes, tabi
accepts and cedes canonical back; tabi refuses RE/publishing/secrets, not rendering; no fleet L0 row exists for this
surface, so `contested-open` is unavailable and no ruling exists). Both quotes sit verbatim on the cited lines and the
gate passes. The surface is not a cosmetic rename of `crawler-discipline-vs-publishing` (kake held none of the four
canonical/JS entries at that row's pin `7c61c8cc…`; tabi's artifacts are disjoint), nor of the musketeer lease. Two
**low-severity precision defects** are in the tabi-side declaration line only (`SKILL.md:2887`): its qualifier
"loopback or operator-approved only" is narrower than the lane's standing observation scope and a held external
public-observation capture, and its citation `(kake PROVINCE.md:60-61)` does not state the canonical-held half of the
sentence (kake `PROVINCE.md:355-362` / `canonical-selection.md` do). Neither defect changes the disposition or the C1
accounting; the smallest safe correction is a wording/citation edit in `SKILL.md:2887`, not the map.

## Evidence (commands, exit codes, file:line)

Working dir for all runs: `/fast/scratch/hyaku/tabi-r33/CritRowJS/clone`.

1. Clone + detach (exit 0):
   `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"` then
   `git -C "$S/clone" checkout -q --detach 042d6d9abf97d567d495652a85eabc851b81adc1` →
   `git rev-parse HEAD` = `042d6d9abf97d567d495652a85eabc851b81adc1`.

2. Gate (exit **0**):
   `TMPDIR=$S node scripts/check-adjacency.mjs --at 042d6d9abf97d567d495652a85eabc851b81adc1 --repo "$PWD" --fleet /home/vgpnk/Projects/shokunin --json`
   → `{"verdict":"clean","rows":14,"verified":14,"selfRulings":[2],…}` (`CritRowJS/gate.json`).

3. Frozen C1 counter (exit **0**):
   `TMPDIR=$S node .ufo/waves/round-33/counters/c1-adjacency-sweep.mjs --rev 042d6d9abf97d567d495652a85eabc851b81adc1 --repo "$PWD" --fleet /home/vgpnk/Projects/shokunin --json`
   → `predicate true, candidates 52, mapped 9, screened 43, unaccounted 0, newMapped 4`, row 12 listed in
   `newMappedRows` (`CritRowJS/c1-counter.json`).

4. Load-bearing test (scratch mutant `05066059d7f0a4b78ded9c7d7476074b51f0f82d`, row 12 deleted, committed with
   `-c user.name=CritRowJS -c user.email=CritRowJS@scratch.local` after asserting the clone toplevel; clone restored to
   `042d6d9` afterwards). Counter on the mutant → exit **1**: `predicate false, mapped 8, screened 40, unaccounted 4,
   newMapped 3`; unaccounted keys are kake `PROVINCE.md:23,60,61,362`, and the three `same-surface` screens for those
   lines fail with `screen-surface-unmapped` (`CritRowJS/c1-counter-row-drop.json`). So this row is the sole licence
   for 3 screens plus its own candidate — its correctness matters for 4 of 52 candidates, not 1.

5. Overlap: kake `PROVINCE.md:61` at pin `0440485` is
   `JS-rendered-canonical frontier above remains open; browser execution stays tabi's` (sentence continues at `:62`
   `adjacent province and publication/account operations stay operator-owned.`); restated at `:362`
   `stays open and stays tabi's adjacent province for anything that executes a browser.` Kake holdings at that pin
   (file heads read): `corpus/knowledge/js-rendering-queue.md` (render-queue contract), `dynamic-rendering-workaround-limits.md`,
   `static-canonical-preflight.md` (declaration side), `canonical-selection.md` ("the half of the canonical signal the
   lane's held static preflight explicitly disclaims"), and `PROVINCE.md:355-362` says the frontier "is now partly
   held" while "JS rendering stays open and stays tabi's adjacent province".

6. Tabi side: `PROVINCE.md:9-13` owns "dynamic-page evidence patterns (what to capture so a claim about a page is
   re-verifiable)"; `SKILL.md:371-401` carries the rendered-state evidence ladder; `corpus/knowledge/live-dynamic-capture.md`
   (16,111 B, round-2 loopback CDP before/after capture) exists; `grep -n -i -E 'render queue|rendering queue|canonicaliz|googlebot'
   SKILL.md PROVINCE.md corpus/knowledge/*.md` returns **no** hits, i.e. tabi holds no vendor canonical/crawl semantics —
   the line absorbs no kake ground.

7. Distinctness: at the `crawler-discipline-vs-publishing` row's pin `7c61c8cc…`, all four kake entries named in (5)
   are **ABSENT** (`git cat-file -e`); at `0440485` all four are present. That row's kake line `:30` is
   `` `tabi` drives browsers and owns client-side crawler discipline; kake owns `` publisher-side placement
   (robots/sitemap); its tabi quote is `PROVINCE.md:16` (refusal of publishing). The js row's objects (rendered
   canonical / render queue) and tabi artifacts (rendered-state capture) are disjoint from crawler discipline
   (`corpus/knowledge/rate-signal-decision-table.md`) and from the musketeer profile/CDP-9222 lease. Caveat: the *cession
   grammar* at `:61` ("…stays tabi's") is the same Adjacent-bullet pattern as `:30`; distinctness rests on the disjoint
   artifact sets, which is the stronger evidence.

8. Quotes verbatim: kake `PROVINCE.md:61` equals the frozen candidate line
   (`.ufo/waves/round-33/baseline/c1-candidates.tsv:12`) after trim, and contains the sibling quote; `SKILL.md:2887` at
   `042d6d9` contains the tabi quote and the ruling quote; sibling quote 4 words / 26 non-space chars, tabi quote 15
   words, both inside the gate's 4-25-word and >=20-non-space bounds. `tabi` is in the sibling quote and `kake` in the
   tabi quote (criterion 88 naming rule satisfied).

## Per-question verdicts

- **Q1 real overlap — holds.** Both lanes hold committed artifacts on the same object (rendered page → canonical /
   render queue): kake the publisher/vendor half, tabi the execution/render-capture half; kake states the split itself
  at `PROVINCE.md:61,362`.
- **Q2 disposition `split-declared` — holds.** `refused-route` is wrong: `PROVINCE.md:15-19` refuses RE forensics,
  publishing and secrets, not rendering, and tabi holds the rendering surface. `contested-open` is unavailable: no
  `tabi | round-<N> |` fleet L0 row names kake on rendering (`/home/vgpnk/Projects/shokunin/.ufo/l0-questions.md`;
  tabi rows :25,:34,:62,:65,:76,:77,:91,:155,:165 are namespace, lease, CDP-scope, lessonDrift, quota and
  quarantine items). No ruling exists. `ruled` therefore inapplicable.
- **Q3 tabi declaration truthful / no absorption — holds on substance, two low-severity precision defects.**
  (a) The execution/rendered-evidence claim is true and holds no kake ground (evidence 6). (b) **Defect low** —
  `SKILL.md:2887` "(dynamic-page evidence, loopback or operator-approved only)" contradicts the lane's standing scope
  `SKILL.md:683` ("observation + operator-approved interaction only") and `PROVINCE.md:18-19` (observation is allowed
  on external sites; only *interaction* needs approval), and a held artifact records an external, unapproved rendered
  CDP capture: `corpus/knowledge/example-domain-observation.md:5-10` and
  `corpus/evidence/pstack-20261015-r04/public/capture.json` (`class: public-observation`, `url: https://example.com/`,
  `consequential: false`, DOM/screenshot sha256). Smallest safe correction: phrase the bound as "loopback fixtures
  first, public observation under `PROVINCE.md:18-19`, operator-approved interaction", or delete "only".
  (c) **Defect low** — the same line's citation `(kake PROVINCE.md:60-61)` does not state the canonical-held half: at
  the pin, `:60` says kake did *not* observe a Google-selected canonical and `:61` says the frontier "remains open",
  while the held selection/declaration claim lives at kake `PROVINCE.md:355-362` and `corpus/knowledge/canonical-selection.md`.
  The sentence is true; the citation under-supports it. Correction: cite `:60-61` and `:355-362`. Neither defect
  affects the row's disposition or the C1 counter.
- **Q4 quotes verbatim — holds.** See evidence 8; both on the cited lines at the cited pins; gate verified row 12.
- **Q5 distinct surface (vs crawler-discipline / musketeer lease) — holds.** See evidence 7; not a rename. Note the
  `:61` cession grammar matches `:30`, so future reviewers should keep the artifact-set distinction as the evidence,
  not the phrasing.

## Impacted axes

- C1 adjacency veracity (row 12 of 14; sole licence for kake:23/60/362 screens, so a wrong surface would move 4
  accounts). Criterion 88 (naming necessary not sufficient — semantic sufficiency checked here and holds).
- Criterion 87 (sweep accounting) unaffected: gate clean, counter predicate true at the attacked revision.
- Nothing in C2; no lane file was edited by this seat.

## Tooling / environment

No tool installed or upgraded. No browser launched; `pgrep -fa 'chromedriver|chromium'` after work returns only the
host's `earlyoom` line (pid 1371, its `--prefer` pattern text), no process owned by this seat. No network fetch.
Scratch `/fast/scratch/hyaku/tabi-r33/CritRowJS` removed after the receipts below were copied.

## Deliverables

- Report: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/CritRowJS.md`
- Receipts in `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-33/w2/CritRowJS/`:
  `gate.json` (exit 0, clean 14/14), `gate.err` (empty), `c1-counter.json` (exit 0, predicate true),
  `c1-counter-row-drop.json` (exit 1, unaccounted 4, 3 x `screen-surface-unmapped`), `map-row-12.tsv`,
  `kake-line-61.txt`, `tabi-line-2887.txt`.
