# CritScreenKotoba — round 34 / w2 FALSIFY: every kotoba screen row of `corpus/adjacency-screen-skill.tsv`

Seat: CritScreenKotoba (leaf, findings only, no repair). Milestone C1. Lane rev attacked:
`04f9623dde8ad35d470cecf766e421eafbcb47fa` (the round-34 w1 integration on master).

## Verdict

**Holds with one defect (severity: low, note-text only).** All 12 kotoba rows of
`corpus/adjacency-screen-skill.tsv` (file lines 7-16, 61, 62) are accounted, each quote is verbatim on the line
it pins, and every reason is right in kind: **no kotoba candidate is a real tabi↔kotoba overlap that was
screened away (0 rows should be a map row)**, the one mapped line (`sibling-overlap-census-round49.md:171`)
and its three `same-surface` screens (`:172/:173/:175`) are the same paragraph and therefore the same
boundary, and the named surface `agent-facing-tool-text-craft` really does carry that boundary at REV. The
defect is in the *note* of `sibling-description-rewrites-round8.md:136`: it asserts that the kagi-description
line "quotes kagi's own boundary that kake owns the property fleet and the shared burner-chrome lease", but
that sentence is kotoba's **proposed** replacement for kagi's `description` (its own arbitration rule), and no
committed kagi line ever says kake owns the lease — kagi says the lease is *shared* and *contested*. Screening
the line is still correct, and the frozen C1 counter is unaffected by the note (re-run below: predicate true,
`unaccounted 0`, `screenFindings []`); the note is what a closure spot-check reads as evidence, so it is
reported rather than waved through.

## What I attacked

1. Every screen row whose `sibling_ref` names `kotoba-shokunin@65a5c7a663249e0522cc49e4a148424200d9ddfe`
   (`sibling-overlap-census-round49.md:86/:172/:173/:175`, `sibling-overlap-census-round74.md:70/:101/:126/:150/:151/:152`,
   `sibling-description-rewrites-round8.md:136`, `fleet-skill-audit-round5.md:45`), read **in context at the
   pinned commit** (`git -C /home/vgpnk/Projects/shokunin/kotoba-shokunin show <pin>:<path>`, ±10 lines, plus
   the proposed-block boundaries and the derivation notes at `:141-:164`).
2. The map row each `same-surface` screen rests on (`corpus/adjacency.tsv:17`, surface
   `agent-facing-tool-text-craft`): its quote, its new tabi declaration (`SKILL.md:2923`), the novelty of that
   line at the baseline, and the declaration's own citation of kotoba `PROVINCE.md:13`.
3. The notes' factual claims (provenance hunt): the `1313/1450` byte fact at two tabi pins, kotoba's checker
   rule, kagi's committed text for the lease, kotoba's own `PROVINCE.md` state for the tabi row.
4. Mechanical re-accounting: the frozen C1 counter, taken from the freeze commit, over the integrated REV.

## Evidence (commands, exit codes)

All lane-script runs are in a `--shared` clone under `$HYAKU_SCRATCH/tabi-r34/CritScreenKotoba`; nothing ran in
the lane checkout. No network fetches were made this seat, so there are no URL/time/status/sha records to give.

```
$ git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"            # exit 0
$ git -C "$S/clone" rev-parse --show-toplevel        -> /fast/scratch/hyaku/tabi-r34/CritScreenKotoba/clone
$ git -C "$S/clone" checkout -q --detach 04f9623dde8ad35d470cecf766e421eafbcb47fa          # exit 0
$ git -C "$S/clone" show 59f1b47aae277e1670e4a824173da8cde7e388ee:.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs > "$S/c1.mjs"
$ sha256sum "$S/c1.mjs"
0dba816ccab0b7bf690c3a4da6d850ce4a5a092d9aec895e33c9e7fe75a8781e   # == claims.json frozenDigests
$ cd "$S/clone" && TMPDIR="$S/tmp" node "$S/c1.mjs" --rev 04f9623… --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json
exit=0
{"predicate":true,"candidates":67,"mapped":5,"screened":62,"unaccounted":0,"newMapped":4,
 "newMappedRows":[15 live-delivery-observation/kake split-declared, 16 lab-performance-tool-runs/kake split-declared,
                  17 agent-facing-tool-text-craft/kotoba split-declared, 18 authenticated-consequential-driving/kasegi refused-route],
 "adjacency":{"verdict":"clean","rows":17,"verified":17,"findings":0},"screenFindings":[]}
perLane.kotoba = 13        # = 1 mapped (:171, row 17) + 12 screened
```

Ledger quote/line re-check for every kotoba row (script `receipts/check-kotoba.mjs`, reading the ledger at REV
and each kotoba file at `65a5c7a66…` through `git show`; `exit 0`):

```
ROW 6  …round49.md:86   quoteInLine=true candidateTextEqualsPinLine=true words=17 nonSpace=88 set=A
ROW 7  …round49.md:172  quoteInLine=true candidateTextEqualsPinLine=true words=6  nonSpace=32 set=A
ROW 8  …round49.md:173  quoteInLine=true candidateTextEqualsPinLine=true words=9  nonSpace=54 set=A
ROW 9  …round49.md:175  quoteInLine=true candidateTextEqualsPinLine=true words=10 nonSpace=39 set=A
ROW 10 …round74.md:70   quoteInLine=true candidateTextEqualsPinLine=true words=15 nonSpace=74 set=A
ROW 11 …round74.md:101  quoteInLine=true candidateTextEqualsPinLine=true words=4  nonSpace=29 set=A
ROW 12 …round74.md:126  quoteInLine=true candidateTextEqualsPinLine=true words=9  nonSpace=35 set=A
ROW 13 …round74.md:150  quoteInLine=true candidateTextEqualsPinLine=true words=8  nonSpace=45 set=A
ROW 14 …round74.md:151  quoteInLine=true candidateTextEqualsPinLine=true words=6  nonSpace=34 set=A
ROW 15 …round74.md:152  quoteInLine=true candidateTextEqualsPinLine=true words=8  nonSpace=31 set=A
ROW 60 …round8.md:136   quoteInLine=true candidateTextEqualsPinLine=true words=10 nonSpace=54 set=B
ROW 61 …round5.md:45    quoteInLine=true candidateTextEqualsPinLine=true words=7  nonSpace=47 set=B
12/12 quotes verbatim on their pinned line, 12/12 candidate texts byte-equal (trimmed) to the pin line,
all 4..25 words and >=20 non-space chars.
```

Context/provenance reads (each `git -C <repo> show <rev>:<path>` piped to `nl -ba | awk`, exit 0):

- `kotoba@65a5c7a6:corpus/knowledge/sibling-overlap-census-round49.md:76-96` — census table; `:86` is the tabi
  row; `:90` points per-row evidence at `.ufo/…/Census<Lane>.md`; `:171-176` is one paragraph (the mapped
  `:171` plus the screened `:172/:173/:175`), `:175-176` closes with kotoba correcting its own build seat.
- `kotoba@65a5c7a6:corpus/knowledge/sibling-overlap-census-round74.md:60-80`, `:95-132`, `:138-164` — `:70`/`:101`
  are the census and census-with-delta tabi cells; `:126` the what-changed cell (`+89/-0`, `none → none`);
  `:139-156` is the limitation block holding `:150-152`; `:149` cites `verifiers/check_sibling_census.py:595-604`.
- `kotoba@65a5c7a6:verifiers/check_sibling_census.py:588-610` — the `none` rule really is at `:595-601`
  (`if classification == "none": … token_in(SELF_LANE, description) or token_in(SELF_LANE, province_text)`), so
  the `:595-604` citation in the `:150` note is apt (the function ends at `:602`, the cell-name tuple is `:604`).
- `kotoba@65a5c7a6:corpus/knowledge/sibling-description-rewrites-round8.md:114-138`, `:164` — §3.1
  "### 3.1 kagi-shokunin — secrets & vault ops", `:116` **Current (verbatim, `kagi-shokunin/SKILL.md:3`)**,
  `:122` **Proposed (paste over line 3)**, so `:135-137` is kotoba's *proposed* kagi description; `:164` gives
  kotoba's own derivation ("L216 … Rule in the description: kagi owns vault auth + the CDP bridge; kake owns the
  property fleet and the shared burner-chrome lease; lease conflicts go to kake").
- `kotoba@65a5c7a6:corpus/knowledge/fleet-skill-audit-round5.md:41-51` — `:45-46` "both describe CDP-bridge flows
  (kagi L31–32/L71–72 vs kake L84–87); neither description names the other" — the note's paraphrase is exact.
- `kotoba@65a5c7a6:PROVINCE.md:3-33` and `grep -n -w -i tabi PROVINCE.md` → `:73` only (the § Adjacent tabi row,
  class `none`, "it states no split with kotoba on its scope surfaces"). `PROVINCE.md:13` is "Agent-definition,
  always-on (AGENTS.md-class) and dispatch-prompt craft"; `:19` is the MCP server `instructions` core surface.
- `tabi@856fa9e1:SKILL.md:1310-1316` and `:1446-1453` — both cited lines are the same watchdog roster string
  ``LANES="protocol aggregator kasegi kengaku kake kumitate kotoba kagi kama"``;
  `git show 856fa9e1:SKILL.md | grep -n -w -i kotoba` prints exactly `1313:` and `1450:` and nothing else
  (`rc=0`); the same grep at the round-49 pin `e3cf4e0d` prints the same two lines. **The `:150-152` byte fact
  is fully verified at both pins, including "the same two at the round-49 pin".**
- `tabi@e3cf4e0d:PROVINCE.md:3-4` — the census quote spans two lines (`:3` ends "…— driving real", `:4` begins
  "browsers against real sites…"), see observation O2.
- `git -C kagi-shokunin show 69b61db4:SKILL.md | grep -n "property fleet\|burner-chrome\|shared burner"` → empty;
  `git -C kagi-shokunin show master:SKILL.md | grep -n …` → empty; `git -C kagi-shokunin log --all --oneline -S "property fleet" -- SKILL.md PROVINCE.md`
  → empty; kagi `PROVINCE.md:43` (master and pin) = "CDP `9222` + `~/.local/share/the-musketeer/chrome-profile` —
  **contested with kake** (lease/profile ownership unresolved …)"; kagi `SKILL.md:450` (pin) = the `L216`
  checklist line "CDP port 9222 + musketeer profile are shared with the kake fleet: report lease conflicts,
  don't absorb them." — this is the defect.
- `tabi@04f9623:corpus/adjacency.tsv:17` and `SKILL.md:2917-2924` — row 17 = `agent-facing-tool-text-craft` /
  `kotoba` / `kotoba-shokunin@65a5c7a66…:corpus/knowledge/sibling-overlap-census-round49.md:171` /
  "tabi's round-16 wave drafts state a split with kotoba" / `SKILL.md:2923` / "the craft of those names,
  descriptions and schemas as agent-facing text a model reads stays kotoba's" / `split-declared`;
  `SKILL.md:2923` is inside the new `## Round 34 — sibling-overlap declarations (outside PROVINCE)` section.
- Baseline novelty: `git show 15dfaccb:SKILL.md | awk 'END{print NR}'` → 2915; the same file has **no** match for
  `agent-facing text a model reads stays kotoba` (`grep` `rc=1`), and its last § declarations section is the
  round-33 one at `:2883-2890`. So `SKILL.md:2923` is a genuinely new tabi line, as the claim requires.
- `tabi@.ufo/waves/round-16/drafts/DraftAdjacency.md:39` (round-16 commit) — the C-C paragraph
  "**C-C — tool names, descriptions and schemas as agent-facing text.** … kotoba owns the craft of such text
  (`kotoba PROVINCE.md:13,20`); … Route craft findings to kotoba." Kotoba's `:172-173` citation of that draft
  line is correct, and it is the same boundary row 17 declares.

## Per-row verdicts, grouped by reason

### `same-surface` (3 rows — right; the named surface really carries the boundary)

| ledger line | candidate | verdict |
|---|---|---|
| `:8` | `round49.md:172` "Route craft findings to kotoba\", tabi" | **right.** Same paragraph as the mapped `:171` (one sentence wrapped over `:171-173`), same boundary; `agent-facing-tool-text-craft` is a verified row for the same sibling (map row 17, `verified=17`), and the quoted draft text at tabi `.ufo/…/DraftAdjacency.md:39` is verbatim the C-C split the row declares. Restatement, no second surface. |
| `:9` | `round49.md:173` "over tool names, descriptions and schemas as agent-facing text" | **right.** Names the subject matter of that same split and adds only "It never reached tabi's scope surfaces", which row 17 does not contradict (tabi's side is *recording verbatim, grading no wording*, not a craft surface). |
| `:10` | `round49.md:175` "a later round should ask tabi whether to land it" | **right.** Same undecided split; tabi landing it (row 17) is the answer kotoba asked for. The second half of the line corrects kotoba's own build-seat sweep sentence, not a tabi line. |

### `third-lane-report` (8 rows — 7 right, 1 right-in-kind with a false note)

| ledger line | candidate | verdict |
|---|---|---|
| `:7` | `round49.md:86` census tabi row | **right.** A roster row (pin, skill file, class `none`, `PROVINCE.md:3` quote); tabi's `PROVINCE.md` names kotoba at **no** pin (`grep -w -i kotoba` at `e3cf4e0d`, `856fa9e1`, `04f9623` → `rc=1`), so kotoba's own `none` rule (`:595-601`) is not engaged and nothing here allocates tabi ground. |
| `:11` | `round74.md:70` census tabi cell | **right.** Same class of roster cell at the newer pin; no claim. |
| `:12` | `round74.md:101` census-with-delta cell | **right.** The tabi row plus `+89/-0` and "PROVINCE.md:3 unchanged"; a delta cell is a measurement of tabi bytes, not a boundary. |
| `:13` | `round74.md:126` what-changed cell | **right.** Two pins, a delta and `none → none`; kotoba's class is a census judgement, not a tabi surface allocation. |
| `:14` | `round74.md:150` limitation bullet | **right.** Its two factual claims check out: the checker rule at `verifiers/check_sibling_census.py:595-604` and a byte fact about tabi's `SKILL.md`. |
| `:15` | `round74.md:151` grep invocation | **right.** `grep -n -w -i kotoba` on `tabi@856fa9e1:SKILL.md` returns exactly lines 1313 and 1450 (`rc=0`); command evidence for a byte fact. |
| `:61` | `round8.md:136` kagi description rewrite | **reason right in kind, note false (defect D1).** The line is inside kotoba's *proposed* kagi `description` and asserts a kagi/kake lease allocation; that is a third lane's text about kagi/kake, not a claim on tabi ground — but the note misdescribes it as a quotation. |
| `:62` | `round5.md:45` audit of kagi's and kake's descriptions | **right.** `:45-46` reports the kagi↔kake CDP-bridge overlap and that neither description names the other; the lease/9222 boundary is already mapped for kagi and kake (map rows 6, 7, both `contested-open`), and nothing is asserted on tabi ground. `same-surface` is not available here — the mapped surface is not a surface of *kotoba* — so `third-lane-report` is the correct expressible reason. |

### `no-claim-declared` (1 row — right)

| ledger line | candidate | verdict |
|---|---|---|
| `:16` | `round74.md:152` "a citation, not a split, so tabi stays" | **right.** The bullet's own verdict. Verified independently: both occurrences of `kotoba` in tabi's `SKILL.md` at both pins are the one watchdog `LANES` roster string, "not a browser surface". |

**No row is a real overlap screened away; no row should be a map row.** The only tabi↔kotoba boundary in this
sibling's corpus files is the agent-facing-tool-text split, and it is mapped once (row 17) with the rest of its
paragraph screened `same-surface`, which is exactly the "count boundaries, not surface strings" rule.

## Defect

### D1 (low) — false provenance in the note of `corpus/adjacency-screen-skill.tsv:61`

The note says the line "quotes kagi's own boundary that kake owns the property fleet and the shared
burner-chrome lease". Both halves fail against committed bytes:

- The sentence is kotoba's **proposed** text: `sibling-description-rewrites-round8.md:114` heads the section
  "3.1 kagi-shokunin", `:116` gives the current `SKILL.md:3` **verbatim** (which is *not* this sentence), and
  `:122` "**Proposed (paste over line 3):**" opens the block that contains `:135-137`. Kotoba's own derivation
  at `:164` calls it a "Rule in the description", i.e. authored, not quoted.
- No committed kagi text says kake owns the lease: `git -C kagi-shokunin log --all -S "property fleet" -- SKILL.md PROVINCE.md`
  is empty, and kagi's committed lines say the opposite of an allocation — `SKILL.md:450` "are **shared** with the
  kake fleet: report lease conflicts, don't absorb them" and `PROVINCE.md:43` "**contested with kake**
  (lease/profile ownership unresolved)". The "property fleet" phrase is kake's own subject
  (`kake@0440485:SKILL.md:8`), not a kagi boundary.

Impact on C1: none to the predicate — the row is accounted either way, `third-lane-report` stays the only
expressible reason, and the frozen counter is clean (`screenFindings []`). Impact on the closure spot-check:
the note is the evidence a reviewer reads, and here it launders a third lane's *allocation of a contested
resource* (map rows 6-7 are `contested-open`, l0 question `:62`) into a quotation of kagi. Impacted axis:
adjacency (evidence quality of the C1 screen ledger), not the measured count.

**Smallest safe correction:** replace the note's provenance clause with: "kotoba's *proposed* kagi
`description` — its own arbitration rule derived from kagi `SKILL.md:450` ('shared … don't absorb') and kake
`SKILL.md:161`; nothing kagi committed assigns the lease to kake (kagi `PROVINCE.md:43` calls it contested), and
the lease is already mapped contested-open for kagi and kake, so the proposal asserts nothing on tabi ground."
No reason, surface, quote, or ledger row changes.

## Observations (informational — not counted as defects)

- **O1 — row 17's declaration pointer is approximate.** `SKILL.md:2923` closes "…stays kotoba's (kotoba
  `PROVINCE.md:13`)". At the pin, `PROVINCE.md:13` is "Agent-definition, always-on (AGENTS.md-class) and
  dispatch-prompt craft" — adjacent, but it does not name tool names/descriptions/schemas. The kotoba lines that
  do are `PROVINCE.md:19` (MCP server `instructions`) and `SKILL.md:75-76` (the "which surface / that tool's
  `description`" table). The boundary is real and the disposition is right; only the pointer is loose. If the
  integrator wants the citation to survive a literal check, point it at `PROVINCE.md:19`/`SKILL.md:75-76` or
  qualify `:13` as the prompt-craft core. (Tabi's own round-16 draft cited `:13,20`; the `:20` half is now
  "Callee-rename-robust omp extraction", i.e. that half has drifted, which is likely why the declaration kept
  only `:13`.)
- **O2 — the `:86` note's "verbatim quote of tabi PROVINCE.md:3" spans two lines.** At `tabi@e3cf4e0d`,
  `PROVINCE.md:3` ends "— driving real" and `:4` is "browsers against real sites with evidence discipline.";
  kotoba's census cell renders the whitespace-collapsed sentence and its own quote-shape rule
  (`sibling-overlap-census-round49.md:154`, "found within two lines of `path:line`") makes the cell correct by
  convention. A literal check of ":3" alone fails, so `PROVINCE.md:3-4` would read cleaner; not wrong.
- **O3 — future staleness of the `:16` note.** "tabi SKILL.md:1313/1450 is a watchdog LANES roster string" is
  exactly true at the pins it talks about, but at REV tabi's `SKILL.md` now also names kotoba in a real
  declaration (`:2923`), so kotoba's next census (`grep -w -i kotoba` over tabi's body) will see three
  occurrences, one of them a split. Nothing to fix in this ledger; flagged so the next kotoba census does not
  cite this note as still current.
- **O4 — row 17's sibling side is a report of tabi's own draft** (`:171` is kotoba recounting tabi's round-16
  C-C, and kotoba's class stays `none`; kotoba `PROVINCE.md:73` "it states no split with kotoba on its scope
  surfaces"). The frozen split-declared rule (sibling_quote contains `tabi`) is met and both sides do name each
  other, so the disposition holds; recorded only because the evidence chain is tabi-draft → kotoba-census →
  tabi-declaration, which a closure spot-check may want to name.

## Deliverable paths

- Report: `tabi-shokunin/.ufo/waves/round-34/w2/CritScreenKotoba.md` (this file)
- Receipts: `tabi-shokunin/.ufo/waves/round-34/w2/CritScreenKotoba/receipts/`
  - `c1-out-04f9623.json` — frozen C1 counter JSON at REV (sha256 `1892b23365c231cefb90cddb011d333d63e59fbee28a809c6f08a0c7b48d977a`)
  - `kotoba-rows.txt` — per-row quote/line re-check output (sha256 `49fe6b904022cb4a1652c62824c2ae28229c9abe75c2618f17c587ac461f6469`)
  - `check-kotoba.mjs` — the re-check script (sha256 `f0286818f276eab7c2bc04340d849608bd75f5199d7363526d1e68e25d7435cf`)

## Hygiene

- No lane tracked file, lane index, lane jj state, fleet file, sibling repo or `~/.local/bin` was written. All
  git calls on the lane and on sibling repos were read-only (`show`, `rev-parse`, `log`); the only clone is
  under `$HYAKU_SCRATCH/tabi-r34/CritScreenKotoba/clone` and its toplevel was asserted before `checkout`.
- No installs, no upgrades, no pacman transactions, no browser launches, no network fetches.
- Scratch dir `$HYAKU_SCRATCH/tabi-r34/CritScreenKotoba` is removed before yield (receipts copied above first).
