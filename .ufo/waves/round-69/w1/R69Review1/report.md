red

# R69Review1 — review of frozen C1 counter for false-greens and wrong-reason refusals

Scope: `scripts/check-sibling-matrix-r69.mjs` (sha256 b62f9c7d…, matches freeze.txt) and
`scripts/negatives-sibling-matrix-r69.mjs` (sha256 dac61e1b…, matches). Snapshot
`.ufo/waves/round-69/c1/sibling-heads-r69.tsv` (sha256 5aa91a58…, matches). Fleet root
`/home/vgpnk/Projects/shokunin`. Base PROVINCE.md = tabi `58d84eda` (no matrix yet). Each probe is
a complete PROVINCE.md built from the base plus a matrix whose 20 rows are real, frozen-head,
verbatim-cited rows, mutated in one respect. Counter run: `node check-sibling-matrix-r69.mjs --province <f> --snapshot <tsv> --fleet /home/vgpnk/Projects/shokunin --json`.
Claims and counter were not edited; defects are named for a later round.

Headline: the counter greens a matrix that **contradicts the sibling's own declared relation**
(R6), and it greens several forgeries of the `contested`, `Refuses`, and second-section checks.
The 19/19 battery cannot see any of this: every one of its 19 negatives expects a finding, and
its only green case is the positive control. A green here means "well-formed and mention-triggered",
not "the boundary is correct".

## Findings, ranked by severity

### F1 — CRITICAL — false-green: the sibling's declared relation is never compared
- Real evidence: kotoba `PROVINCE.md:76` (head 0344ddae) reads
  `| tabi | none | 856fa9e1… | tabi owns browser-session … it states no split with kotoba … |`.
- Tabi's row for kotoba says `adjacent` and cites exactly that line. Counter: **exit 0, bound 20/20, findings none.**
  Probe `R6-kotoba-contradiction` (= `A-base`).
- Inverse: setting kotoba to the relation kotoba actually declares (`none`) gives **exit 1**
  `inbound-relation-none` (probe `R10`). So the rule forces tabi to contradict the sibling's own
  statement, and accepts the contradiction.
- Cause: `check-sibling-matrix-r69.mjs:97-106` keys only on whether the sibling file *mentions*
  tabi (`/\btabi\b/i`) and whether the cited line *is* one of those mentions. It never parses the
  sibling's relation for tabi (the table row at kotoba:76 is a relation statement, and the counter
  ignores it). Pinning the sibling to a head does not help: the contradiction is between two pinned
  statements.
- Repro: `node scripts/check-sibling-matrix-r69.mjs --province .ufo/waves/round-69/w1/R69Review1/probes/R6-kotoba-contradiction.md --snapshot .ufo/waves/round-69/c1/sibling-heads-r69.tsv --fleet /home/vgpnk/Projects/shokunin; echo $?` → `0`.

### F2 — HIGH — false-green: outbound `Refuses` set taken from the FIRST `**Refuses:**` in the file, ending at the first blank line
- `check-sibling-matrix-r69.mjs:47` uses `prov.match(/\*\*Refuses:\*\*([\s\S]*?)(\n\n|$)/)`: first occurrence, first paragraph only.
- (a) Fake earlier paragraph: `**Refuses:** nothing routed anywhere.` placed before the real one →
  `outbound=[]`, rows revenger/kaidoku/kagi set to `none` → **exit 0** (probe `AK-fake-first`).
- (b) Prose mention: `` `**Refuses:**` `` in a code span earlier in the document → same, **exit 0** (probe `AL-code-refuses`).
- (c) Blank-line truncation: a lane named only in the second paragraph of the Refuses block, set to `none`
  → **exit 0** (probe `R2-para2-only`, `AM-refuses-para2`: audio/lore not flagged).
- Repro: `node scripts/check-sibling-matrix-r69.mjs --province .ufo/waves/round-69/w1/R69Review1/probes/AK-fake-first.md --snapshot … --fleet … --json` → `outbound: []`, exit 0.

### F3 — HIGH — false-green: only the first `## Adjacent — sibling matrix` section is validated
- `check-sibling-matrix-r69.mjs:53` uses `prov.search(...)`, the first match only; a second
  section is never read.
- Probe `R3-second-section-contradicts`: a valid first matrix (kotoba `adjacent`) followed by an
  appendix matrix with kotoba `none` → **exit 0**. Probe `I-two-sections` shows the same class with
  duplicated valid content.
- Repro: `… --province .ufo/waves/round-69/w1/R69Review1/probes/R3-second-section-contradicts.md …` → exit 0.

### F4 — HIGH — false-green: `contested` relation without any contested text
- The only contested rule is one-directional: `check-sibling-matrix-r69.mjs:103` forces `contested`
  when a sibling *line naming tabi* contains "contested". Nothing requires `contested` to be backed by
  text. A row may claim `contested` for a lane whose PROVINCE never says so.
- Probe `R9-arbitrary-contested` (lore → `contested`, lore PROVINCE has no contested text naming tabi) →
  **exit 0**. Probe `E-kengaku-contested` (kengaku → `contested`, same) → **exit 0**.
- The battery's `inbound-contested-as-adjacent` negative only tests the opposite direction.

### F5 — MEDIUM — false-green: `tabi side` accepts vacuous text
- `check-sibling-matrix-r69.mjs:95`: `words(side) < 4` counts whitespace tokens, so `— — — —` passes.
- Probe `R7-vacuous-side` / `AA-side-punct` → **exit 0**. Nothing checks that the side says anything about the boundary.

### F6 — MEDIUM — false-green: quote is not verbatim; cite can be any unrelated line
- `check-sibling-matrix-r69.mjs:94` strips backticks from BOTH the line and the quote before the substring test,
  so a quote with the backticks removed passes. Real example: audio `PROVINCE.md:17` is
  ``Only writes `.shokunin/audio/**` and its own reports.``; quote `Only writes .shokunin/audio/** and its own reports.`
  → **exit 0** (probe `Q-backtick-merge`, `G-audio-backtick`). The quote is not a substring of the cited file.
- The cited line need not relate to the boundary at all: probe `Z-unrelated-cite` (audio cited to an unrelated
  host line) → **exit 0**. The counter checks that the cite exists and carries 3–25 words, not that it supports the row.

### F7 — MEDIUM — false-green in structure: heading suffix and fenced-code tables accepted
- `check-sibling-matrix-r69.mjs:53` regex `^## Adjacent — sibling matrix\b.*$` matches `… matrix-extra` (probe `R8-heading-suffix`, exit 0).
- The matrix inside a fenced code block is still parsed as a table (probe `R4-fenced`, exit 0); the counter cannot tell rendered from quoted.
- Heading case is enforced (probe `J2-lowercase` → `matrix-missing`, correct), and `Audio`-case lanes are refused (`V-lane-case`, correct).

### F8 — MEDIUM — wrong-reason refusal: inbound triggers on a citation mention, not a boundary claim
- kengaku `PROVINCE.md:103`: `**tabi** `scripts/check-measurement-binding.mjs:575-613` and **kama** …` is a
  fleet-wide citation of a tabi script, not a statement of scope. Its `none` row → `inbound-relation-none` (probe `D-kengaku-none`, exit 1).
  A `SKILL.md`-only mention would not trigger this, a `PROVINCE.md` script citation does.
- The refusal is the frozen rule working as written; its reason is "a script path was cited", not
  "the boundary is in conflict". Calibration risk for the round, not a false-green.

### F9 — MEDIUM — wrong-reason refusal: CRLF PROVINCE.md refused as outbound
- The `Refuses` regex (`(\n\n|$)`) never matches `\r\n\r\n`, so the Refuses text runs to EOF and captures
  all 20 lane names, including every matrix row. Result on a CRLF copy of a valid matrix: `outbound-relation-none`
  for 14 rows, exit 1 (probe `R5-crlf`; `outbound` field lists all 20 lanes).
- A line-ending change turns a valid matrix red for a reason unrelated to the boundary.

### F10 — LOW — detection only on PROVINCE.md; word-boundary matches inside hyphen compounds
- `check-sibling-matrix-r69.mjs:97` reads only `PROVINCE.md`. Current fleet check: no sibling names tabi in SKILL.md only (`[]`);
  this is latent, not live. Any future sibling with its boundary only in SKILL.md is invisible.
- `\btabi\b` and the outbound `\blane\b` match inside `multi-tabi`, `prefix-audio-suffix`, etc. (probe `L-refuses-substring`, exit 1 on a hyphen compound). Conservative in the outbound direction, over-triggering on inbound.

### F11 — LOW — battery design: refusal-only, cannot detect a false-green
- `negatives-sibling-matrix-r69.mjs:67-87`: all 19 negatives expect a non-zero finding; the only green is the positive control. By construction the battery cannot detect F1–F7.
- Its fixture rows are all `none`/`adjacent`/`contested` constructions that the counter's own vocabulary accepts.
- Recommendation for a later round (not an amendment to this round): add positive-direction negatives with an expected **green** and a semantic check of the sibling's stated relation.

### Non-findings (checked, behaved correctly)
- Heading lowercase → matrix-missing (`J2`); table header renamed → matrix-header; lane dropped → lane-missing; lane duplicated → duplicate-lane; fabricated lane → unknown-lane; `Audio` case → unknown-lane; `audio` relation `None` → relation-vocab; cite traversal `../` → cite-file-absent; quote 26 words → quote-length; escaped pipe in quote → quote-off-line (H); kake `adjacent` (sibling says contested) → inbound-contested-unnamed (B); kake `none` → three findings (C).

## Verification gaps
- No check on the `--json` output field `inbound`/`outbound` vs the human-readable output (not part of the claim).
- F1 and F2 are demonstrated on fixtures derived from real frozen heads; I did not exercise every sibling PROVINCE through the counter with a semantically correct matrix, so the full set of contradictions in the real fleet is unmeasured here.
- Battery `scripts/negatives-sibling-matrix-r69.mjs` was not run in fixture mode in this seat (assignment asked for review, not scored runs); the 19/19 claim is taken from the assignment, not re-observed.
- I made no change to any frozen file, scored run, receipt, or fleet file.

## Reproduction
Probes and their PROVINCE.md bytes are archived beside this report:
- drivers: `drivers/probe.mjs`, `drivers/probe2.mjs`, `drivers/probe3.mjs` (they regenerate `probes/*.md` from the base PROVINCE at `58d84eda` via `git -C /home/vgpnk/Projects/shokunin/<lane>-shokunin show <head>:PROVINCE.md`)
- results: `drivers/probe-results.json`
- key fixtures: `probes/R6-kotoba-contradiction.md` (F1), `probes/AK-fake-first.md` and `probes/AL-code-refuses.md` (F2),
  `probes/R2-para2-only.md` (F2c), `probes/R3-second-section-contradicts.md` (F3), `probes/R9-arbitrary-contested.md` (F4),
  `probes/R7-vacuous-side.md` (F5), `probes/Q-backtick-merge.md` (F6), `probes/Z-unrelated-cite.md` (F6), `probes/R8-heading-suffix.md` (F7), `probes/R4-fenced.md` (F7), `probes/D-kengaku-none.md` (F8), `probes/R5-crlf.md` (F9), `probes/L-refuses-substring.md` (F10).
- Reproduce any fixture: `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-sibling-matrix-r69.mjs --province <fixture> --snapshot /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-69/c1/sibling-heads-r69.tsv --fleet /home/vgpnk/Projects/shokunin --json; echo "exit=$?"`

## Scoped instruction compliance
- No edits to any frozen counter, battery, claim, snapshot, or PROVINCE.md. No git mutations. No subagents.
- Scratch `/fast/scratch/hyaku/tabi-r69/R69Review1/` removed after copying receipts here.
- Tools: none installed or updated.
