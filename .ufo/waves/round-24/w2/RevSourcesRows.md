# RevSourcesRows — attack on S104/S105 in corpus/SOURCES.md

Scope: the two new rows at `corpus/SOURCES.md:119-120` (S104 web.dev bfcache, S105 Page.pdl
at Chromium 154.0.8037.97), their anchor cells vs committed bytes in
`corpus/evidence/round-24/sources/`, the census, and the prose that repeats them.
Lane tip inspected: `ad125e85c235e1c4ec6a08e398bd64da01f68a08`. Read-only review; fixtures
under `.ufo/waves/round-24/scratch/RevSourcesRows/`.

## Census (item's named command)

`bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`
→ **exit 0**, `tabi ok corpus/SOURCES.md`. Codes: **16×W04, 0×E** (output saved at
`.ufo/waves/round-24/scratch/RevSourcesRows/tip.out`). All 16 W04s are "same URL across
scopes" for ids **S058–S100 — none for S104/S105**. Baseline reproduction (`git archive
573c99e | tar -x` into scratch fixture root + `shokunin.conf`, same command): exit 0,
103 rows, 16×W04, W04 id set `diff`-identical to tip (baseline.out). The lesson's claim
"103 rows, 16 W04 → 105 rows, same 16 warnings" is mechanically accurate.
`node scripts/check-sources.mjs` (the registry's own structural gate) → exit 0,
`verdict=clean rows=105`.

## Findings

### F1 — MEDIUM: S104/S105 were appended *outside* the registry table

`corpus/SOURCES.md` table header at :13-14; body runs :15–117 (S103), then a **blank line
at :118**, then S104 at :119 and S105 at :120, then `## Paths` at :121. In GFM a blank
line terminates the table: the two rows render as a literal pipe paragraph, not rows.
Observed: `awk 'NR<=125 && $0==""' corpus/SOURCES.md` → `2 10 12 118 122`; the table body
(:15–117) contains no blank line — the :118 blank pre-existed as the separator before
`## Paths`, and the new rows were inserted *after* it (`git diff 573c99e..ad125e8` hunk
context). Demonstration: `awk 'NR==13{inTable=1} NR>=15 && $0==""{inTable=0} inTable==0
&& /^\|[[:space:]]*S[0-9]+/{print}' corpus/SOURCES.md` flags exactly S104 and S105.

Both instruments are blind: the census scans `^\|[[:space:]]*S[0-9]{3,}` lines regardless
of table membership (exit 0), and check-sources.mjs parses `fields.length === 13` line-wise
(counted rows=105 anyway). Consequence: any consumer that reads the registry *as a markdown
table by header name* — the discipline the lane just codified in `corpus/QUALITY.md:64`
("table shapes are read by header name, never by cell position") — sees a 103-row registry
and misses S104/S105 entirely. Fix: delete the blank at :118 (rows become body members) or
move the rows above it.

### F2 — MEDIUM-LOW: S105's anchor cell states a byte count its own digest contradicts

Row cell (verbatim): "tag 154.0.8037.97 PDL fetched 2026-10-25, **82548 bytes decoded**,
sha256 e944a3b…". The committed decoded bytes are **61911**: `sha256sum
corpus/evidence/round-24/sources/page.pdl` → `e944a3b19fa2c87b4ed0a84cca85b16b127618725394496ba046a2dfdf9405be` ✓
(digest correct), `wc -c` → `61911`. 82548 = `((61911+2)//3)*4` — the base64 transport
length of the `?format=TEXT` payload. The cell labels the encoded fetch size as the decoded
size; the same wrong figure propagates to `corpus/lessons/round-24.md` §Gate (S105 row) and
`corpus/knowledge/navigation-history-bfcache-evidence.md:4` (`source:` line). Minor as
errors go, but it sits in the cell whose entire job is exactness (contract: anchor = "exact
section / heading / page / line plus revision").

### F3 — LOW: located quotes are de-marked-up; not byte-present

The lesson §Gate quote for S104 and the entry §1 blockquote render
"…is essentially instant, because…" but the bytes carry
`…is <em>essentially instant</em>, because…` (bfcache.html:2531); the entry §2 quote renders
"don't use bfcache" where bytes have `don&#39;t` (bfcache.html:2893). `grep -cF` of both
exact strings → 0; markup-bearing forms → 1 each. Meaning preserved and lines located
correctly, but C3's kill rule ("if any cited quote is absent from the bytes this round
fetched, the row is refused") is only satisfied under a de-markup/entity-decode convention
no file states. Notably the round's own scout report kept raw markup
(`.ufo/waves/round-24/w1/ScoutBfcacheWeb.md:18` quotes `don&#39;t`), so the lane switched
quote convention silently mid-round.

### F4 — LOW: S104 scope's third clause is unanchored

Scope claims "…and what disqualifies a page from the cache"; the anchor locates 2531
(restore), 2893 (NotRestoredReasons) and 2511 (all browsers ship one) — no line for the
disqualifier content, though it exists (bfcache.html:2569 "blocked from using the bfcache",
:2629 "make pages ineligible for bfcache if they add an unload listener"). `teaches` also
never covers it, so the claim is scope-anchored by proximity, not by an exact location.

### F5 — OBSERVATION (not scored): search-log gap

`## Search log` (SOURCES.md:132+) has no round-23 or round-24 entries. Contract rule 5
covers question/query logging; the lesson frames S104/S105 as opened (lane re-fetch), not
a query log, so this MAY be within contract — flagged for the log's owner, not asserted
as a defect.

## Verified clean (no defect)

- **Shape:** both rows NF=13 → exactly 11 columns; `grep -c '\\|'` → 0 across the file;
  no trailing whitespace at :119/:120.
- **Ids:** unique (`sort|uniq -d` empty), contiguous S001–S105, 105 rows; no reuse.
- **Vocabulary:** `docs/B` and `code/A` inside contract enums; `mined` status consistent
  with non-`—` used-by; B-tier for S104 is honest (expert write-up, not spec), A-tier for
  S105 legitimate (primary protocol source at pinned tag — matches S074/S077/S096 cohort).
- **Anchor digests:** `sha256sum` of both committed files equals the cells' digests
  (0dd45292…, e944a3b…). Cited lines all verified against committed bytes: 2531 (restore
  cell — confirmed inside the `<td>` of the "With bfcache" table row), 2893, 2511;
  page.pdl:1345 (`BackForwardCacheRestore` enum member), :1706 (`experimental event
  backForwardCacheNotUsed`), :1713 (`array of …notRestoredExplanations`, no `optional`
  → required ✓). page.pdl is complete (Copyright/`domain Page` header, clean trailing
  `binary content` command, no truncation).
- **used-by:** repo-relative single path, resolves at tip (`git cat-file -e`), and the
  entry's `source:` lines cite both ids — passes the gate's `used_by_uncited` check and
  the C3 counter: `git grep -lE '^source: S10[45] ' ad125e8 -- corpus/knowledge | wc -l` → 1.
- **Recheck:** `90d` / `on-release` both inside the E09 vocabulary; `on-release` is the
  dominant precedent (80/105 rows). For an immutable pinned tag it is defensible
  (recheck when the lane re-pins); for the live web.dev page 90d is aggressive-but-honest
  given the same-round drift the entry itself discloses in U4.
- **U4 disclosure confirmed:** scout copy `.ufo/waves/round-24/scratch/ScoutBfcacheWeb/
  bfcache.html` is 157667 bytes sha256 `4535f93b…`; committed copy is 157667 bytes sha256
  `0dd45292…` — same size, different bytes, exactly as reported. "Re-opened itself" is
  corroborated, not fabricated.
- **Lesson §Gate per contract rule 1:** URL + access date + ≤25-word quote with location
  present for both rows (S104 quote = 25 words).

## Residual risk / verification gaps

- Digest *provenance* not re-verified against the live sources — no external fetch
  authorized in this item beyond the census; only internal consistency (digest ↔ committed
  bytes, bytes ↔ cited lines) is proven. The 157667-byte bfcache page is complete HTML and
  the PDL is a complete domain file, consistent with claimed origins.
- No instrument anywhere validates anchor-cell *byte counts* or *quote substring presence*;
  F2/F3-type errors are structurally invisible to both the census and check-sources.mjs.
- F1 is invisible to every committed check; only a header-name table reader exposes it.

## Verdict

Rows are contract-conformant in all machine-checked dimensions and carry correct digests,
ids, vocabulary and used-by wiring; the lane's own re-open is corroborated. Two grounded
defects: **F1** (rows outside the table — a real structural break the round's own
header-name discipline contradicts) and **F2** (82548-vs-61911 mislabeled byte count
propagated to three files), plus quote-exactness looseness (F3) and one unanchored scope
clause (F4). None changes the census's exit or C3's count of 1; F1 blocks clean
"conformant" status for the row set as markdown.
