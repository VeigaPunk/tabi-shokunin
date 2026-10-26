# Corrections — round-34 closure routed defects 1 and 6 (round 35 w1, draft only)

Seat: ScribeErrataR34 (frontier, leaf). Lane tip read: `a4bfef0f75027c915e715649950b1d46dcb33d83` (the round-35
freeze); working tree clean for every cited path (`git status --porcelain` lists only the untracked
`.ufo/waves/round-35/` files). Source item: `.ufo/waves/round-35/w1-dispatch.json`, seat `ScribeErrataR34`; routed as
`corpus/lessons/round-34-verifier-spotcheck.md:159-176` §"Routed defects (tabi, next round)", items 1 and 6.

Nothing below is landed: seats never edit lane files. Each block is written to be appended at EOF of the document that
carries the stale byte, so no cited line moves and no earlier byte changes (verified: §4, prefix sha256 test). Contract
basis: the same E30 shape the round-34 corrections used — `.ufo/waves/round-31/a2w1/ScribeErrata/errata.md:160-163`,
"nothing may be inserted above a cited line after the corrections are written; the landed block sits at EOF";
`/home/vgpnk/Projects/shokunin/CORPUS.md:53-56` ("Corrections are new entries, never rewrites").

Two targets, four blocks:

| # | Routed item | Target file | Anchor (append after) | Stale site |
|---|---|---|---|---|
| 1 | defect 1 (corrections sweep) | `corpus/README.md` | EOF, after `:804` | `:794` ("four new map rows"), `:799` ("`adjacency.tsv` rows 15–18 … four new boundaries") |
| 2 | defect 6a (S131 span) | `corpus/lessons/round-34.md` | EOF, after `:165` | `:33` (locator `CdpTargetManager.ts:245-247`) |
| 3 | defect 6b (`noHarmRule` cells) | `corpus/lessons/round-34.md` | EOF, after `:165` (same block as 2) | `.ufo/waves/round-34/claims.json:75` (a frozen fleet file, not editable) |
| 4 | defect 6c (RFC 4122 refusal basis) | `corpus/lessons/round-34.md` | EOF, after `:165` (same block as 2) | `.ufo/reports/round-34/tabi.md:116` (a fleet file, not editable) |

Blocks 2–4 are one appended section in one file; they are written to land together.

## 1. Locate — the stale bytes, read not assumed

Every line below was read at `a4bfef0f` in the lane working tree (tracked, unmodified — porcelain clean for these paths);
the `claims.json` and report rows are the fleet repository's files, read at their committed state.

| Item | Command | Exit | Result |
|---|---|---|---|
| README `:794` | `grep -n "four new map rows" corpus/README.md` | 0 | `794:Append-only. One knowledge row, one new screen ledger, four new map rows; no earlier line is edited.` |
| README `:799` | `grep -n "rows 15–18" corpus/README.md` | 0 | `799:\| \`adjacency-screen-skill.tsv\` *(round 34, with \`adjacency.tsv\` rows 15–18)* \| … four new boundaries: kake live delivery (headers, redirects), kake lab performance runs (Lighthouse/DevTools), kotoba agent-facing tool text, kasegi authenticated consequential driving (refused-route) \| … \|` |
| lesson `:33` | `grep -n "CdpTargetManager.ts:245-247" corpus/lessons/round-34.md` | 0 | `33:\| S131 \| … \| \`CdpTargetManager.ts:245-247\`: "// New context. BrowsingContextImpl.create( targetInfo.targetId, parentId, userContext," \| admit (mined) \|` |
| clause cells | `grep -n "noHarmRule" tabi-shokunin/.ufo/waves/round-34/claims.json` | 0 | `75: "noHarmRule": … corpus/adjacency-screen.tsv (round-33 ledger) may change only by the routed relabel of its kake 396/422/440 rows …` |
| report line | `grep -n "source drafts refused as duplicate URLs" .ufo/reports/round-34/tabi.md` | 0 | `116:  - Rejects on record: withdrawn w1-numbered rows 15, 17 and 18 (live delivery, kotoba, kasegi); source drafts refused as duplicate URLs.` |

Supporting reads (same revision):

| Fact the draft asserts | Command | Exit | Result |
|---|---|---|---|
| the final map holds 16 rows and rows 15–17 are the three new ones | `grep -c '^[^#]' corpus/adjacency.tsv`; `grep -n "lab-performance-tool-runs\|recorded-har-producer-channel\|screenshot-pair-compare-semantics" corpus/adjacency.tsv` | 0; 0 | `17` (header + 16 rows); `15:lab-performance-tool-runs kake …:SKILL.md:697`, `16:recorded-har-producer-channel kaidoku …:queue-ops.md:151`, `17:screenshot-pair-compare-semantics kaidoku …:queue-ops-2.md:117` |
| the three w1-numbered rows were withdrawn | `sed -n '104,111p' corpus/lessons/round-34.md` | 0 | `:108` row 15 withdrawn (re-keys row 12), `:109` row 16 kept, `:110` row 17 withdrawn (third-lane-report), `:111` row 18 withdrawn (third-lane-report) |
| the kake `:411` change is the note column only | `git diff 15dfaccb 71a87305 -- corpus/adjacency-screen.tsv \| grep 411`; per-side `awk -F'\t' '{print NF, $1..$4}'` | 0 | both sides 5 columns; `c1..c4` byte-identical (`…:PROVINCE.md:411`, `same-surface`, `crawler-discipline-vs-publishing`, `re-grounded against a fresh retained body fetched 2026-10-25`); only `$5` differs |
| the relabel is listed in the lesson | `grep -n "411" corpus/lessons/round-34.md` | 0 | `151: rows 31, 35, 39, 42 relabelled (kake \`PROVINCE.md:396\` → same-surface robots-txt…, \`:411\` note, \`:422\`/\`:440\` → …)` |
| the S131 quote spans 244-248 | see §2 (independent re-open) | 0 | lines 244 `// New context.`, 245-247 as the row quotes them, 248 `userContext,` |
| RFC 4122 was drafted in round 34 and opened at 200 | `grep -rn "4122" .ufo/waves/round-34/ \| grep -v CritC1Counter` | 0 | `ScoutSessionBinding/rows.md:23` (S134, RFC 4122, `https://www.rfc-editor.org/rfc/rfc4122.txt`), `:34` (2026-10-26T19:48:03Z, 200, 59319 B, sha256 `3825a334…66e0c31`) |
| the registry's S131 row is **not** stale | `grep -n "S131" corpus/SOURCES.md`; `sed -n '145p' corpus/SOURCES.md \| awk -F'\|' '{print $7}'` | 0 | `:145` quotes `245-247` only — `CdpTargetManager.ts:223` (`case 'page'`), `245-247` (`BrowsingContextImpl.create(targetInfo.targetId, parentId, …)`), `135-136` (…) — a whitespace-normalised three-line span with an ellipsis, so its own locator matches its own quote |

## 2. Correction 1 — README `:794` and `:799`: three new rows, not four; 15–17, not 15–18

**Target:** `corpus/README.md`, append after line 804 (EOF; file ends `0a`).
**Stale bytes (`:794`, verbatim, whole line):**

````
Append-only. One knowledge row, one new screen ledger, four new map rows; no earlier line is edited.
````

**Stale bytes (`:799`, verbatim; the two fragments the correction moves are inside the long table row):**

````
| `adjacency-screen-skill.tsv` *(round 34, with `adjacency.tsv` rows 15–18)* | The 67 sibling lines outside `PROVINCE.md` … mapped or screened with a closed reason; four new boundaries: kake live delivery (headers, redirects), kake lab performance runs (Lighthouse/DevTools), kotoba agent-facing tool text, kasegi authenticated consequential driving (refused-route) | sibling `SKILL.md`/`corpus/knowledge` lines at their pins; `SKILL.md` §Round 34 declarations |
````

**Why stale (re-derived).** `corpus/adjacency.tsv` at `a4bfef0f` carries 16 rows; `:15`-`:17` are the only rows absent
at the round-34 baseline `15dfaccb` (`lab-performance-tool-runs`, `recorded-har-producer-channel`,
`screenshot-pair-compare-semantics`). The w1 integration `04f9623d` numbered four new rows 15–18; wave 2 withdrew 15
(`live-delivery-observation`), 17 (`agent-facing-tool-text-craft`) and 18 (`authenticated-consequential-driving`)
(`corpus/lessons/round-34.md:108-111`), and the surviving rows were renumbered 15–17. So both the count and the row
range in the README are the withdrawn wave-1 state, and the boundary list keeps one boundary of four (kake lab
performance) while omitting the two kaidoku boundaries that do survive. `:799`'s parenthetical tags the kasegi boundary
`(refused-route)`; that tag belonged to withdrawn row 18 — the map's three `refused-route` rows (`reverse-engineering-
of-shipped-artifacts` ×2, `secrets-vault-ops`) are rows 3, 4 and 9 and are identical at `15dfaccb` and `a4bfef0f`
(`git show 15dfaccb:corpus/adjacency.tsv` — 3 `refused-route`, same keys). `:794`'s other claims stand (one knowledge
row, one new screen ledger).

**Correction text (paste at EOF):**

````
## Round 34 — corrections to the round-34 rows (append-only; cites the stale lines in this document; round-35 errata intake 1)

- `corpus/README.md:794` and `corpus/README.md:799`: correction — "four new map rows" (`:794`) and "`adjacency.tsv` rows
  15–18 …, four new boundaries" (`:799`) are superseded. The final map carries three new rows, `adjacency.tsv` 15–17:
  `lab-performance-tool-runs` (kake lab performance runs, Lighthouse/DevTools) and the two restored kaidoku rows
  `recorded-har-producer-channel` and `screenshot-pair-compare-semantics`. Wave 1's rows 15 `live-delivery-observation`,
  17 `agent-facing-tool-text-craft` and 18 `authenticated-consequential-driving` were withdrawn in wave 2 — row 15
  re-keyed the mapped row 12 js-rendering, rows 17 and 18 are third-lane reports — and are screened in
  `adjacency-screen-skill.tsv`. The section's "one knowledge row" and "one new screen ledger" stand. (Round-34
  spot-check, routed defect 1; `corpus/lessons/round-34.md:104-111`.)
````

**Post-append invariants checked here.** Prefix sha256 identical (§4). No `| R` row (`grep -c '^| R[0-9]'` → 0 before
and after); no `\| Frontier item` row (12 → 12); one new `## ` heading (37 → 38); EOF byte stays `0a`. No
`scripts/*.mjs` token and no tally shape in the block, so `check-selfassessment.mjs`'s `m1` window for
`corpus/README.md` (line-scoped, `scripts/check-selfassessment.mjs:527` passing `lineOnly = true`) finds nothing new.
`corpus/README.md` is in `APPEND_ONLY` (`scripts/check-round-contract.mjs:25`); the append adds lines and deletes none.

## 3. Corrections 2–4 — the round-34 lesson

**Target:** `corpus/lessons/round-34.md`, append after line 165 (EOF; file ends `0a`).

### 3a. Correction 2 — the S131 locator moves to 244-248

**Stale bytes (`:33`, verbatim quote cell and locator):**

````
| S131 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/chromium-bidi/src/bidiMapper/modules/cdp/CdpTargetManager.ts | 2026-10-26T19:49:29Z, HTTP 200, 20,140 B raw `f3483993…c33599`, decoded 15,104 B `cd435aa8…5cce9d9` | `CdpTargetManager.ts:245-247`: "// New context. BrowsingContextImpl.create( targetInfo.targetId, parentId, userContext," | admit (mined) |
````

**Why stale (independently re-derived, not taken from the spot-check).** The row's own URL was re-fetched and decoded
this round:

| field | value |
|---|---|
| URL | `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/chromium-bidi/src/bidiMapper/modules/cdp/CdpTargetManager.ts?format=TEXT` |
| attempt 1 | 2026-10-26T21:12:35Z, HTTP **503**, 1,459 B (body discarded by the retry's overwrite — recorded by status and byte count only, QUALITY 93) |
| attempt 2 | 2026-10-26T21:12:39Z, HTTP **200**, 20,140 B, raw sha256 `f3483993a72e09531b8efe322ca317727f8241c06b708ddc8270c88102c33599` — equal to the row's `f3483993…c33599` |
| decoded | 15,104 B — equal to the row's figure |
| lines | `:244` `          // New context.`; `:245` `          BrowsingContextImpl.create(`; `:246` `            targetInfo.targetId,`; `:247` `            parentId,`; `:248` `            userContext,` |

The quote opens with `// New context.` (line 244) and closes with `userContext,` (line 248), so the locator `245-247`
excludes both ends. The quoted text, the URL, the receipt figures and the `admit (mined)` decision are all correct; only
the locator is short by one line at each end. The registry row is **not** affected: `corpus/SOURCES.md:145` quotes the
three-line span alone (`245-247` (`BrowsingContextImpl.create(targetInfo.targetId, parentId, …)`)), so its `245-247`
locator matches its own bytes. Only this lesson row carries the widened quote with the narrow locator.

**Correction text (paste at EOF; bullets 3a-3c are one section):**

````
## Corrections — round 35 errata intake 6 (append-only)

- Round 35 correction — supersedes the S131 locator at `corpus/lessons/round-34.md:33` (`CdpTargetManager.ts:245-247`):
  the quoted span is lines 244-248, so the locator reads `244-248`. Re-opened 2026-10-26T21:12:39Z from the row's own
  URL with `?format=TEXT`: HTTP 200, 20,140 B raw sha256 `f3483993a72e09531b8efe322ca317727f8241c06b708ddc8270c88102c33599`
  (equal to the row's `f3483993…c33599`), decoded 15,104 B — `:244` `// New context.`, `:245-247`
  `BrowsingContextImpl.create(` / `targetInfo.targetId,` / `parentId,`, `:248` `userContext,`. The row's URL, receipt,
  quote and admit decision are unchanged; only the locator moves. (Round-34 spot-check, routed defect 6.)
````

### 3b. Correction 3 — the no-harm clause names three cells; the relabel touched four

**Stale bytes (`.ufo/waves/round-34/claims.json:75`, the clause's cell list; a frozen fleet file, not editable):**

````
corpus/adjacency-screen.tsv (round-33 ledger) may change only by the routed relabel of its kake 396/422/440 rows (round-33 spot-check routed defect 5), each change listed in the round lesson
````

**Why stale.** `git diff 15dfaccb 71a87305 -- corpus/adjacency-screen.tsv` rewrites four rows, not three: the kake
`:411` row's fifth column (note) gains "the deciding token (`corpus/knowledge/yahoo-japan-link-target-crawl-restriction.md`)
sits on the same line but outside the quoted span …". Columns 1-4 of that row are byte-identical on both sides
(§1 table), so the change is the note cell alone, and the lesson lists it (§Errata intake 5, `:151`). The frozen clause's
cell list does not name it. That is a freeze precision defect, not a harm: the gate's pass/fail cells are untouched and
the screen reason (same-surface `crawler-discipline-vs-publishing`) is unchanged.

**Correction text (continues the section opened in 3a):**

````
- Round 35 correction — the frozen `noHarmRule` at `.ufo/waves/round-34/claims.json:75` names only the kake
  `396`/`422`/`440` rows as relabelable, while the routed relabel also rewrote the note cell of the kake
  `PROVINCE.md:411` row (`corpus/adjacency-screen.tsv`, screened row 35; §Errata intake 5 at `:151` names it). No harm:
  the change is the fifth column only — columns 1-4 are byte-identical at `15dfaccb` and `71a87305`, and the screen
  reason (same-surface `crawler-discipline-vs-publishing`) is unchanged. The round-35 freeze names every routed cell by
  path:line and column. (Round-34 spot-check, routed defect 6.)
````

### 3c. Correction 4 — two refusals, not one: RFC 4122 was refused as not needed

**Stale bytes (`.ufo/reports/round-34/tabi.md:116`, the report's reject record; a fleet file, not editable):**

````
  - Rejects on record: withdrawn w1-numbered rows 15, 17 and 18 (live delivery, kotoba, kasegi); source drafts refused as duplicate URLs.
````

**Why stale.** The round's reject set has two distinct grounds. The W3C drafts (BiDi WD §4 and WebDriver WD §Sessions)
were refused as census duplicates — both URLs are already registered (S124, S126)
(`corpus/lessons/round-34.md:43-45`). RFC 4122, the same seat's S134, was refused as **not needed by any kill case** —
the ChromeDriver id is not a UUID string and the entry does not rely on one (`:45-46`) — and it was opened this round in
the ordinary way: `ScoutSessionBinding/rows.md:34` records 2026-10-26T19:48:03Z, HTTP 200, 59,319 B, sha256
`3825a334d337243035be8e2656508551a48e0cd42ae16cebf66f164ca66e0c31`. The report's one phrase therefore misstates one of
its two refusals. The report is `/home/vgpnk/Projects/shokunin/.ufo/reports/round-34/tabi.md` — the fleet repository's
file — so the correction is recorded in the lane lesson instead.

**Correction text (continues the section opened in 3a):**

````
- Round 35 correction — supersedes the round-34 report's "source drafts refused as duplicate URLs"
  (`.ufo/reports/round-34/tabi.md:116`): only the two W3C drafts (BiDi WD §4 and WebDriver WD §Sessions — both URLs
  already registered as S124 and S126) were refused as duplicates. RFC 4122, the same seat's S134
  (`https://www.rfc-editor.org/rfc/rfc4122.txt`, 2026-10-26T19:48:03Z, HTTP 200, 59,319 B, sha256
  `3825a334d337243035be8e2656508551a48e0cd42ae16cebf66f164ca66e0c31`), was refused as not needed by any kill case — the
  ChromeDriver id is not a UUID string and the entry does not rely on one (`:45-46` above;
  `.ufo/waves/round-34/w1/ScoutSessionBinding/rows.md:23,34`). The report is the fleet repository's file and is not
  edited here. (Round-34 spot-check, routed defect 6.)
````

**Post-append invariants checked here (lesson).** Prefix sha256 identical (§4). One new `## ` heading (8 → 9); the
appended block adds no `| row |` table row, no `\`scripts/*.mjs\`` token and no tally shape; EOF byte stays `0a`. The
block cites `:45-46` and `:151` of the same document, both inside the file (165 lines) and both correct at
`a4bfef0f`.

## 4. Verification run for this draft (commands and exit codes)

Run from `/home/vgpnk/Projects/shokunin/tabi-shokunin` (read-only) and from
`/fast/scratch/hyaku/tabi-r35/ScribeErrataR34` (writes; deleted before yield).

| Command | Exit | Result |
|---|---|---|
| `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD` | 0 | `a4bfef0f75027c915e715649950b1d46dcb33d83` |
| `git status --porcelain` | 0 | only untracked `.ufo/waves/round-35/…`; every cited path clean |
| `grep -n "four new map rows" corpus/README.md` | 0 | line 794 (bytes in §1) |
| `grep -n "rows 15–18" corpus/README.md` | 0 | line 799 (bytes in §1) |
| `grep -n "CdpTargetManager.ts:245-247" corpus/lessons/round-34.md` | 0 | line 33 (bytes in §1) |
| `grep -n "noHarmRule" .ufo/waves/round-34/claims.json` | 0 | line 75; cell list names `kake 396/422/440` only |
| `grep -n "source drafts refused as duplicate URLs" .ufo/reports/round-34/tabi.md` | 0 | line 116 |
| `git diff 15dfaccb 71a87305 -- corpus/adjacency-screen.tsv \| grep 411` | 0 | one `-`/`+` pair, row key `…:PROVINCE.md:411`, fifth column differs |
| column check on that pair (`awk -F'\t'` per side) | 0 | both 5 columns; `$1`-`$4` identical; only `$5` differs |
| `grep -c '^[^#]' corpus/adjacency.tsv` | 0 | 17 (header + 16 rows) |
| `grep -n "lab-performance-tool-runs\|recorded-har-producer-channel\|screenshot-pair-compare-semantics" corpus/adjacency.tsv` | 0 | lines 15, 16, 17 |
| `grep -n "S131" corpus/SOURCES.md` and `awk -F'\|' '{print $7}'` on `:145` | 0 | registry quote is `245-247` only (whitespace-normalised, ellipsis); its locator is not stale |
| `awk -F'\t' 'NR>1{print $7}'` on `corpus/adjacency.tsv` and on `git show 15dfaccb:corpus/adjacency.tsv` | 0 | 4 `contested-open`, 3 `refused-route`, 1 `ruled`, 8/5 `split-declared`; the same three `refused-route` keys at baseline (`reverse-engineering…` ×2, `secrets-vault-ops`) |
| `curl -q -sS --proto =https` on the S131 URL (`?format=TEXT`), attempt 1 | 0 (curl) | 2026-10-26T21:12:35Z, HTTP 503, 1,459 B |
| same, attempt 2 | 0 | 2026-10-26T21:12:39Z, HTTP 200, 20,140 B, sha256 `f3483993…c33599` |
| `base64 -d` + `wc -c` + `sed -n '240,250p'` | 0 | 15,104 B; the five quoted lines at 244-248 |
| prefix test: `head -c <orig bytes> appended \| sha256sum` vs `sha256sum <orig>` (both targets) | 0 | README `d62bc6e2…2c55f` = `d62bc6e2…2c55f` (80,600 → 81,615 B, +1,015); lesson `790bc779…06b0` = `790bc779…06b0` (17,480 → 19,672 B, +2,192) |
| row/heading census before→after | 0 | README `\| R` rows 0→0, `\| Frontier item` rows 12→12, `## ` 37→38; lesson `## ` 8→9 |
| tally/script scan of both blocks (`scripts/*.mjs`, `--self-test`, `N-case`, `cases=N`, `N cases`) | 1 | no match in either block |
| EOF byte of both appended copies (`tail -c 1 \| xxd`) | 0 | `0a` on both |

## 5. Findings for the L1

1. **The spot-check's S131 reading is confirmed independently** (§3a): the 244-248 span is re-derived from the row's own
   URL at 200 with the row's own raw sha256, not taken on trust. The first Gitiles response this round was a 503, as
   the lane's round-34 search log also records for these URLs; the retry returned 200.
2. **The stale locator is the lesson's alone — do not "fix" the registry row.** `corpus/SOURCES.md:145` also carries
   S131, but its quote is the three-line span `245-247` (`BrowsingContextImpl.create(targetInfo.targetId, parentId, …)`,
   whitespace-normalised with an ellipsis), so its locator matches its own bytes. The lesson row at `:33` is stale
   because its quote additionally carries `// New context.` (244) and `userContext,` (248). Rewriting `SOURCES.md:145`
   to `244-248` would make that row's locator disagree with its quote.
3. **The README `:799` defect is wider than its row range.** Besides "four new map rows"/"rows 15–18", the same line's
   boundary list keeps one of four boundaries and its `(refused-route)` tag belonged to withdrawn row 18, not to any
   round-34 row (the map's three `refused-route` rows are pre-existing rows 3, 4 and 9, identical at the baseline). The
   drafted correction names all of it, so a later reader does not have to re-derive the withdrawn wave-1 state to make
   sense of the line.
4. **The `noHarmRule` precision gap is confirmed byte-level** (§3b): four rows changed, three named; the unnamed one is
   the note column of `PROVINCE.md:411`. The drafted text records the column, not just the line, so the round-35 freeze
   can name every routed cell without re-reading the diff.
5. **The report's refusal phrase covers two grounds** (§3c). The lesson's own rejected-candidates paragraph is already
   correct, so the correction's job is to keep a future reader from copying the report's summary as the round's
   refusal record. Nothing in the lane is falsified by it: `corpus/SOURCES.md` holds no RFC 4122 row.
6. **No landing hazard found.** Both targets take an EOF append; the prefix test shows no earlier byte moves; neither
   block introduces a tally or a gate script token, so `check-selfassessment`, the `APPEND_ONLY` check
   (`scripts/check-round-contract.mjs:25`) and the frontier tables are unaffected.
