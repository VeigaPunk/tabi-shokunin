# ExecQuarantineSlice — round 39 w1: complete tabi quarantine slice re-derivation

Axes: operability. Milestone: executable-check.

Seat scope: re-derive the complete tabi quarantine slice from the absent-defect register with the
canonical awk extraction; report the row count, the IDs, whether any summary row was accidentally
included, and confirm every data row carries an S-id. **No source fetch was performed** (as the item
states); the derivation is a read over the register only.

## 0. Input identity (read-only, verified before and after)

```
$ sha256sum /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md
5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833  .../absent-defect-register.md
$ stat -c 'size=%s mtime=%y' .../absent-defect-register.md
size=83621 mtime=2026-10-24 08:37:00.746072780 -0300
$ wc -l < .../absent-defect-register.md
375
```

The digest equals the `registerSha256` frozen in the round-22 hand-check receipt
(`.ufo/waves/round-22/assimilation/quarantine-verdicts.json` → `registerSha256:
5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833`), so this seat read the same bytes
as the rounds 22–23 hand-check. The digest was re-checked after all reads and was unchanged
(`verify.out` §7). The sibling repo was not written to
(`git -C /home/vgpnk/Projects/shokuknow status --porcelain -- .ufo/waves/corpus-expansion-1/absent-defect-register.md`
→ empty).

## 1. The exact awk command

The round-39 wave item says "the required awk extraction" without restating it. The canonical
extraction for this lane is the one the lane itself used and published in round 36 (§10 form) and
round 25; the two spellings differ only in strictness and are recorded here because the difference
matters (see §5):

```
# canonical (round-36 §10 form) — lane cell + round cell + S-id cell
awk -F'|' '$2 ~ /`tabi`/ && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/' REGISTER

# looser (round-25 form) — same slice, wider cell patterns
awk -F'|' '$2 ~ /tabi/ && $3 ~ /round/ && $4 ~ /S[0-9]+/' REGISTER
```

Both were run against the same register bytes (GNU Awk 5.4.1).

## 2. Row count

```
### A: all-lanes data predicate
awk -F'|' '$3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/' REGISTER | wc -l   ->  303
### B: canonical lane predicate (round-36 form)
awk -F'|' '$2 ~ /`tabi`/ && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/' REGISTER | wc -l   ->  38
### C: looser lane predicate (round-25 form)
awk -F'|' '$2 ~ /tabi/ && $3 ~ /round/ && $4 ~ /S[0-9]+/' REGISTER | wc -l   ->  38
### D: every line containing the lane token `tabi` (data rows + By-lane summary row)
grep -n '`tabi`' REGISTER | wc -l   ->  39
```

**Complete tabi quarantine slice = 38 data rows.** 39 lines carry the `` `tabi` `` token; the 39th is
the By-lane summary row, correctly excluded (§4).

Slice by round cell: `round1=8 round2=11 round3=9 round4=6 round5=4` (total 38).

Class split from the class cell: **37 `payload-absent` + 1 `unreachable` (S171)** — byte-identical to
the round-22 hand-check receipt's `summary: {"absent-refused": 37, "unverifiable-unreachable": 1}`.
The count 38 also agrees with the round-35, round-36 (38) and round-37 (38) re-derivations.

## 3. IDs (register row order, 38)

```
S102 S106 S109 S110 S111 S114 S117 S118 S124 S125 S126 S130 S131 S133 S134 S135 S137 S138 S140
S142 S143 S144 S145 S147 S148 S149 S153 S154 S158 S163 S164 S165 S166 S167 S174 S175 S176 S171
```

- Distinct ids: 38 (no duplicates — `awk … | sort | uniq -d` → empty, `dup_count=0`).
- Per-row id / round / class / cited source: `slice.tsv` in this seat directory.
- Cross-check against both prior lane derivations: set intersection **38/38 common, 0 only-mine,
  0 only-prior** against `.ufo/waves/round-22/assimilation/quarantine-slice` and
  `.ufo/waves/round-25/assimilation/quarantine-ids.txt`.
- Cross-check against the round-39 generator's own 8-way deterministic row-order partition
  (`gen-w1-spec.py` `quar` table): all 8 partitions match the derived row order exactly,
  `PARTITION_MISMATCHES: 0` (`verify.out` §6). The generator's nominal id lists are therefore
  consistent with the slice this seat re-derived — no silent skipping on the scout side.

## 4. Was any summary row accidentally included? — No

The register has three table shapes. The extraction was checked against each:

| register table | shape | matched by the slice predicate? |
|---|---|---|
| `## Totals` (lines 16–24) | `\| class \| rows \|` — 2 columns | no (no lane cell, no round cell, no S-id cell) |
| `## By lane` (lines 232–254) | `\| lane \| rows \|` — 2 columns | **no** — the tabi summary row `\| \`tabi\` \| 37 \|` (line 236) is excluded |
| `## Rows` (lines 26–231) | 7-column data rows | yes (37 tabi rows) |
| `## Rows whose quotes were NEVER CHECKED` (lines 256–375) | 5-column data rows | yes (1 tabi row: S171, line 362) |

Direct evidence:

```
$ grep -n '`tabi`' REGISTER | awk -F'|' '!($3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/)'
236:| `tabi` | 37 |
```

That is the *only* `` `tabi` `` line the predicate excludes — i.e. exactly the By-lane summary row and
nothing else. Negative control (injected a synthetic duplicate of the By-lane row into a scratch
copy of the register):

```
-- original slice count:      38
-- injected-file slice count: 38      (equal => the predicate ignores By-lane-style summary rows)
```

A second control injected a summary-shaped row that *does* carry a round cell and an S-id in the
wrong cells (`| \`tabi\` | round9 | S999 |`) and the slice became 39 — confirming the predicate is
**positional, not semantic**. It is safe against the register's actual summary rows, but it is not a
schema validator: a future row in the By-lane table that happened to carry `roundN` and `S<digits>`
cells would be picked up.

Also observed: the By-lane table declares `tabi = 37` while the tabi data-row slice is **38**. This
is not a contamination of the slice — it is the summary table's own scope. A per-lane recomputation
over the register shows `declared == "## Rows" section count` for **every one of the 19 lanes** (e.g.
`game-dev-3d` declared 4 / checked 4 / never-checked 20; `lore` declared 0 / checked 0 /
never-checked 9; `tabi` declared 37 / checked 37 / never-checked 1). The By-lane table therefore
counts only the checked ("Rows") rows and omits the "NEVER CHECKED" rows, uniformly for all lanes.

## 5. Does every data row have an S-id? — Yes (one cell is not a pure token)

```
### G: every data row carries an S-id? (rows whose id cell lacks S<digits>)
rows_without_sid=0
```

All 38 extracted rows carry an S-id in the id cell. Two refinements, both material to a counter:

1. **Strict-token test** (id cell must be exactly `S<digits>` after whitespace trim, no other
   characters): `pure_sid_rows=37  non_pure_sid_rows=1`. The one exception is **S171**, whose id cell
   is `` S171` `` — an unbalanced trailing backtick (register line 362):
   `| \`tabi\` | round5 | S171\` | the cited source could not be fetched, so no quote was checked | https://chromestatus.com/features/5117755740913664 |`
   It still satisfies the unanchored `S[0-9]+` predicate (so it is in the slice), but it fails an
   anchored `^S[0-9]+$` test — the anchored variant yields **37**, not 38:
   `D: ANCHORED $4~/^S[0-9]+$/ (stricter) -> 37`, and the row it drops is exactly S171.
2. **Class-token hazard**: S171's class cell holds the prose sentence "the cited source could not be
   fetched, so no quote was checked", not a class token. A counter that classifies by class *token*
   reports `payload-absent=37` and silently loses the unreachable row; classifying by cell text and
   mapping that sentence to `unreachable` yields 37 + 1.

An independent, non-awk re-parse (the round-22 hand-check parser's own semantics, network fetch
removed — `reparse.mjs`) reproduces the same slice:

```json
{ "rows": 38, "byClass": { "payload-absent": 37, "unreachable": 1 },
  "duplicateIds": [], "everyRowHasSId": true,
  "byRound": { "round1": 8, "round2": 11, "round3": 9, "round4": 6, "round5": 4 } }
```

So the 38/ids/class split are not artifacts of the awk predicate.

## 6. Findings

**F1 — The lane's committed round-37 verifier spot-check mis-states the slice's class distribution.**
`corpus/lessons/round-37-verifier-spotcheck.md:98` reads: "re-derived slice: 38 data rows, **all
`payload-absent`**". The observed bytes are 37 `payload-absent` + 1 `unreachable` (S171). The row
count 38 is right; the "all payload-absent" clause is false. The round-36 report
(`.ufo/waves/round-36/w1/ScribeQuarantine/report.md` §4 findings 3–4) already recorded both the
register-summary understatement (37 vs 38) and the S171 corrupt id/class cells, so the round-37
lesson inherited the wrong phrasing. Status-neutral for the frozen claims (no C1/C2 counter reads
that lesson line), but it is a committed inaccurate statement about the slice this round re-derives.

**F2 — S145 is an overloaded token in round 39.** The register's tabi slice row `S145`
(`rfc6265bis-13`, `payload-absent`, line 200) is a *different document* from the round-39 source row
being planned for the lane registry:
- register `S145` = `https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt`
  (round-23's id map records staged `S145` → lane **`S102`**, which is exactly where
  `rfc6265bis-13` lives in `corpus/SOURCES.md` today);
- round-39 planned lane-registry `S145` = `proc_pid_net(5)` man page, per `claims.json` C1
  (`"source": "S145 (proc(5) man page, /proc socket observation) opened this round"`) and per the
  untracked `corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md:1`
  (`source: S145 — proc_pid_net(5) …`).

  There is **no registry collision** — `corpus/SOURCES.md` currently has 144 contiguous rows
  `S001`–`S144` (no gaps, `max_id=S144`) and **no** `S145` row yet (`grep -cE '^\|[[:space:]]*S145[[:space:]]*\|' corpus/SOURCES.md` → 0), so the next append-only id is free. The hazard is textual: within round 39 the token `S145` denotes the proc(5) man page in the claims/knowledge side while also denoting `rfc6265bis-13` in the quarantine-slice side that `ScoutQuarantine05` is adjudicating (its nominal id list is `S143 S144 S145 S147 S148`). Two different documents, one label. Round-23 already established that register ids are not lane-registry keys (19/38 slice ids absent from the registry; the rest are label collisions with 0/38 source-identity matches), so this is the known namespace skew surfacing again inside a single round.

**F3 — The slice predicate is positional, not schema-checked.** Documented in §4; safe on the current
register bytes (negative control proves the By-lane summary row is excluded), but it validates
*positions* rather than *columns*.

**F4 — Register self-inconsistency (re-confirmed, unchanged).** The `## Totals` block declares "rows
with at least one ABSENT quote: **194**" and "ABSENT quotes: **324**", while the file holds **303**
data rows (194 in `## Rows` + 109 in `## Rows whose quotes were NEVER CHECKED`); the `## Rows whose
quotes were NEVER CHECKED` heading declares "rows: **109**" and the file holds exactly 109 rows
there. The `194` figure is the checked-section count, not the file's data-row count.

Non-findings / limits:

- No URL was fetched; absence verdicts are not re-litigated (rounds 22–23, 36, 37 stand). This seat
  is count + membership + format only, exactly as the item scopes it.
- Membership of the 38 ids against the lane registry was measured read-only: 19 of 38 present
  (`S102 S106 S109 S110 S111 S114 S117 S118 S124 S125 S126 S130 S131 S133 S134 S135 S137 S138
  S140 S142 S143 S144`), 19 absent (`S145 S147 S148 S149 S153 S154 S158 S163 S164 S165 S166 S167
  S171 S174 S175 S176`). Same skew as round-36, with the window shifted by the three rows appended
  since (S142/S143/S144 landed; S145 pending).
- Nothing here originates from the frozen claims' counters; `claims.json` was read for scope only.

## 7. Evidence (all under `.ufo/waves/round-39/w1/ExecQuarantineSlice/`)

| file | content |
|---|---|
| `derive.sh` | the derivation script (read-only over the register; writes only into this seat's scratch) |
| `derive.out` | its verbatim output: counts A–D, excluded-summary line E, slice table F, S-id test G, duplicate test H, id order I, round histogram J, class distribution K, column-count profile L, prior-round cross-checks M, totals N |
| `verify.sh` / `verify.out` | section attribution of each row, strict-id test, summary-row controls (incl. the two injected controls), round-39 generator partition match, post-read hash re-check, class-token hazard |
| `reparse.mjs` / `reparse.out` | independent non-awk re-parse with the round-22 parser semantics (no network) |
| `slice.tsv` | the 38 rows: id, round cell, class cell, cited source |

The scratch root `/fast/scratch/hyaku/tabi-r39/ExecQuarantineSlice/` was removed after the evidence
above was copied into this seat directory.

## 8. Touched surfaces

Read-only: the register (sibling repo `shokuknow`, untouched — `git status --porcelain` on that
path → empty), `tabi-shokunin/corpus/SOURCES.md`, `tabi-shokunin/corpus/lessons/round-{22,23,27,35,
36,37,38}*.md`, `.ufo/waves/round-{22,25,36,37}/…` prior artifacts, `.ufo/waves/round-39/claims.json`,
`.ufo/waves/round-39/{w1-spec.json,gen-w1-spec.py}`. Git use was read-only (`status`, `ls-files`,
`grep` on tracked bytes). No git/jj mutation, no commit, no push, no spawn, no browser, no network
fetch, no pacman, no tool install. Written: this seat directory and the outer seat summary
`.ufo/waves/round-39/w1/ExecQuarantineSlice.md` only.

VERDICT finding — the complete tabi quarantine slice re-derives to **38 rows** (37 `payload-absent` +
1 `unreachable` S171) with the canonical awk extraction over the byte-identical register
(`5afe1810…`, unchanged by this seat), and **no summary row is included** (the By-lane row
`| \`tabi\` | 37 |` at line 236 is the only `` `tabi` `` line the predicate excludes, proven by an
injected-duplicate control); every one of the 38 data rows carries an S-id (37 pure `S<digits>`, S171
carries a stray trailing backtick and an anchored `^S[0-9]+$` variant would drop it to 37); but two
defects stand — the committed round-37 verifier spot-check mis-states the slice as "all
`payload-absent`" (F1) and the token `S145` denotes two different documents inside round 39 (F2).
