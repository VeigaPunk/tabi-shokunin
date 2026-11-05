# Round-64 errata (append-only drafts, R65Scribe2)

Scope: routed defects D2–D5 of `corpus/lessons/round-64-verifier-spotcheck.md` §5. Each claim was re-run with the spot-check's own command before drafting; literal outputs are in `erratum-commands.txt` beside this file. No superseded line is edited here: each block names the superseded text and appends the correction. The lane commits these blocks; this draft is not committed by the seat.

Path convention: `superseded` paths are relative to the lane `tabi-shokunin/`, except where marked as the fleet-root report.

### Erratum D2 — seat count: ten of twelve seats left a report and receipts, not eleven

superseded: `corpus/lessons/round-64.md:93-94` (sentence spans the line break after "a")
> "eleven of twelve seats left a report and receipts (R64Sentinel left nothing; R64MutDriver stopped after `instruments/`)"

corrected:
> "ten of twelve seats left a report and receipts (R64Sentinel left nothing; R64MutDriver left 17 files under `attacks/` and `instruments/` and no report)."

evidence: `ls /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-64/w1/*.md | wc -l` → `10`; committed at base: `git ls-tree -r --name-only 58ed8c7a21b9dcb403e46fc1d4e2d8bb68511162 -- .ufo/waves/round-64/w1 | grep -c '^\.ufo/waves/round-64/w1/[^/]*\.md$'` → `10`; `ls -d .ufo/waves/round-64/w1/R64Sentinel` → `No such file or directory`.

### Erratum D3 — Mistakes rows: eleven, and the table is split by a blank line

superseded (count): `.ufo/reports/round-64/tabi.md:67` (fleet-root report, not in the lane tree)
> "mined per class (seven rows in `corpus/lessons/round-64.md` ## Mistakes)"

corrected (count):
> "mined per class (eleven rows in `corpus/lessons/round-64.md` ## Mistakes)"

superseded (table, `corpus/lessons/round-64.md:52-61`): the blank line at line 60 sits between data row 59 (fifth row) and data row 61 (sixth row), so the lesson carries two blocks, not one table.

corrected (table): the `## Mistakes` table is header line 53, separator line 54, and eleven data rows at lines 55–59 and 61–66. As committed, lines 61–66 follow a blank line and have no header or delimiter row, so GFM does not render them as table rows [INFERENCE: GFM table rule; not rendered in this seat]. The fix is to remove the blank line at line 60; this draft does not edit the lesson.

evidence: `awk '/^## Mistakes/{f=1;next} /^## /{if(f)exit} f && /^\|/ && !/^\|---/{n++} END{print "table lines incl. header:", n, "data rows:", n-1}' corpus/lessons/round-64.md` → `table lines incl. header: 12 data rows: 11`; `awk 'NR>=51 && NR<=67 {print NR": "$0}' corpus/lessons/round-64.md` → line 60 is empty and line 61 begins `| instrument-relative pin:`; `awk 'NR==67' .ufo/reports/round-64/tabi.md` → `report 67:   mined per class (seven rows in ...`.

### Erratum D4 — SCORECARD defect (c): 26 of 30 survive the declared negatives; 18 of those 26 accept their targeted forgery

superseded: `SCORECARD.md:3549-3550` (sentence spans the line break after "survive the")
> "(c) 18 of 30 independent counter loosenings survive the declared negatives (`R64MutCounter`)"

corrected:
> "(c) 26 of 30 independent counter loosenings survive the declared negatives (`R64MutCounter`; 18 of those 26 also accept their targeted forgery, and 8 survive without an accepted forgery)"

evidence: `python3 -c` over `.ufo/waves/round-64/w1/R64MutCounter/matrix.json` → `mutants 30`; `survivedDeclaredNegatives 26 rows-true 26`; `survivedButForgeryKills 18 rows-survived-and-forgery-accepted 18`; `survivorsNoForgery 8`; `killedByDeclaredNegative 4`.

### Erratum D5 — S169 quote: lines 208–219 are not one span; quote contiguous lines only

superseded: `corpus/lessons/round-64.md:24` (S169 row, Gate quote)
> `Quote (lines 208-219, read as one response shape): "command getVersion returns … string protocolVersion … string product … string revision … string userAgent … string jsVersion"`

corrected:
> `Quote (contiguous spans only): lines 208-209 "command getVersion" / "returns"; each field is a separate one-line quote: line 211 "string protocolVersion", line 213 "string product", line 215 "string revision", line 217 "string userAgent", line 219 "string jsVersion". Lines 210, 212, 214, 216 and 218 are "# …" comment lines, so the five fields are not one span.`

evidence: `awk 'NR>=208 && NR<=219 {print NR": "$0}' .ufo/waves/round-64/w1/R64Scribe/sources/s171-chromium155-Browser.pdl` → lines 208 `command getVersion`, 209 `returns`, 210 `# Protocol version.`, 211 `string protocolVersion`, 212 `# Product name.`, 213 `string product`, 214 `# Product revision.`, 215 `string revision`, 216 `# User-Agent.`, 217 `string userAgent`, 218 `# V8 version.`, 219 `string jsVersion`; `sha256sum .ufo/waves/round-64/w1/R64Scribe/sources/s171-chromium155-Browser.pdl` → `5e1faf7dbe56cce01447ea627ca6cc023418cafe7528bede3e5f2571363170da` (matches the pin on lesson line 24). The substance is unchanged: the five fields are present.
