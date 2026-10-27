# ScribeQuarantine — tabi round 36, w1: quarantine slice re-derivation (count + membership)

Register read (read-only, unchanged since the round-22 hand-check):

| property | value |
|---|---|
| path | `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` |
| sha256 | `5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833` (== `registerSha256` frozen in `.ufo/waves/round-22/assimilation/quarantine-verdicts.json`) |
| size / mtime | 83621 bytes / 2026-10-24 08:37:00 -0300 |
| lane registry compared | `tabi-shokunin/corpus/SOURCES.md`, sha256 `68bcc3eb1ec3eddf46559a3bda56dc5b183664514038da30456dd94a1104a618`, identical at worktree, `HEAD` (`2e7b7a8` = frozen `2e7b7a89…`) and the round-start baseline `11c64b96…` |

No URLs were fetched (rounds 22–23 verdicts stand; this seat is count + membership only).

## 1. Count re-derivation — 38 (agrees)

Commands, verbatim:

```
awk -F'|' '$3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/' REGISTER | wc -l        -> 303   (all lanes)
awk -F'|' '$2 ~ /`tabi`/ && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/' REGISTER | wc -l -> 38   (lane tabi)
grep -c '`tabi`' REGISTER                                                 -> 39   (38 data rows + the "By lane" total row `| `tabi` | 37 |` at line 236)
awk ... '$2 ~ /`tabi`/ ...' | sort | uniq -d on the id cell               -> (empty)  no duplicate ids inside the slice
```

Slice by round: round1 8, round2 11, round3 9, round4 6, round5 4 = **38**.

Class split from the class cell: **37 `payload-absent` + 1 prose/unreachable (S171)**. This is exactly the
round-22 hand-check split (`quarantine-verdicts.tsv`: 37 `absent-refused` + 1 `unverifiable-unreachable`;
classes 37 `payload-absent` + 1 `unreachable`). Round-35's re-derivation
(`corpus/lessons/round-35.md:52`, "quarantine slice re-derived (38 rows), verdicts stand from rounds 22–23")
also reads 38. Three independent derivations agree; the byte-identical register hash means they read the same input.

Slice stability across rounds: `.ufo/waves/round-22/assimilation/quarantine-slice` (38 ids) and
`.ufo/waves/round-25/assimilation/quarantine-ids.txt` (38 ids) both intersect my set 38/38 with 0 extras.

## 2. Membership cross-check — 19/38 ids absent from the lane registry, and 0/38 identity matches

Registry id space at the frozen revision: `grep -cE '^\| S[0-9]{3} \|' corpus/SOURCES.md` -> **141 rows**,
`S001`–`S141`, contiguous (`seq -f 'S%03g' 1 141 | comm -23 - <present-ids>` is empty), i.e. no gaps and no
row above S141.

| check | result |
|---|---|
| slice ids present as a registry row (`grep -cE "^\| ${id} \|"`) | **19 / 38** (S102,S106,S109,S110,S111,S114,S117,S118,S124,S125,S126,S130,S131,S133,S134,S135,S137,S138,S140) |
| slice ids missing from the lane registry | **19 / 38** (S142,S143,S144,S145,S147,S148,S149,S153,S154,S158,S163,S164,S165,S166,S167,**S171**,S174,S175,S176) |
| present id whose registry row cites the same source as the slice row | **0 / 38** |
| slice cited URL found in the registry at *some* id | **8 / 38** — S106→S119,S123 (rfc9309); S110→S120; S117→S020; S124→S107 (rfc9110); S125→S102 (rfc6265bis-13); S126→S121; S142→S107; S145→S102 |
| slice cited URL ever present in `corpus/SOURCES.md` history (`git log --all -S<url> -- corpus/SOURCES.md`) | **8 / 38**; the other 30 never appear in any revision |

Registry state at the register's own generation date
(`git log --before=2026-10-24T23:59:59 -1 -- corpus/SOURCES.md` -> `0f24164`): **101 rows, max id S101**;
first version (`a4115fa`, 2026-10-19): 27 rows, max S027. So at census time *not one* slice id
(S102–S176) could have been a registry key.

## 3. Row table (id | round | class | id in registry | registry id holding this URL | same source at same id | note)

| id | round | class | in reg | url at | same src | note |
|---|---|---|---|---|---|---|
| S102 | round1 | payload-absent | Y | — | N | registry S102 = SameSite Cookie Attributes (rfc6265bis-13) |
| S106 | round1 | payload-absent | Y | S119,S123 | N | registry S106 = Chromium 154 content_features.cc |
| S109 | round1 | payload-absent | Y | — | N | registry S109 = Chromium 156 Blink ModelContext |
| S110 | round1 | payload-absent | Y | S120 | N | registry S110 = Chromium 156 form_mcp_schema.cc |
| S111 | round1 | payload-absent | Y | — | N | registry S111 = Chromium 156 html_form_element.cc |
| S114 | round1 | payload-absent | Y | — | N | registry S114 = Chromium 156 form callback navigation sentinel |
| S117 | round1 | payload-absent | Y | S020 | N | registry S117 = Discord rate limits |
| S118 | round1 | payload-absent | Y | — | N | registry S118 = DevTools frontend WebMCPModel.ts |
| S124 | round2 | payload-absent | Y | S107 | N | registry S124 = W3C WebDriver BiDi WD 2026-10-08 |
| S125 | round2 | payload-absent | Y | S102 | N | registry S125 = ChromeDriver 154 session_commands.cc |
| S126 | round2 | payload-absent | Y | S121 | N | registry S126 = WebDriver W3C WD 02 July 2026 |
| S130 | round2 | payload-absent | Y | — | N | registry S130 = Chromium 154 base/token.cc |
| S131 | round2 | payload-absent | Y | — | N | registry S131 = chromium-bidi CdpTargetManager.ts |
| S133 | round2 | payload-absent | Y | — | N | registry S133 = Arch chromium PKGBUILD |
| S134 | round2 | payload-absent | Y | — | N | registry S134 = geckodriver Flags |
| S135 | round2 | payload-absent | Y | — | N | registry S135 = geckodriver Capabilities |
| S137 | round2 | payload-absent | Y | — | N | registry S137 = geckodriver v0.37.1 marionette.rs |
| S138 | round2 | payload-absent | Y | — | N | registry S138 = remote protocol preferences |
| S140 | round2 | payload-absent | Y | — | N | registry S140 = Firefox 158.0.1 release dir |
| S142 | round3 | payload-absent | N | S107 | N | id absent; URL (rfc9110) sits at S107 |
| S143 | round3 | payload-absent | N | — | N | id absent; URL nowhere in registry |
| S144 | round3 | payload-absent | N | — | N | id absent; URL nowhere in registry |
| S145 | round3 | payload-absent | N | S102 | N | id absent; URL (rfc6265bis-13) sits at S102 |
| S147 | round3 | payload-absent | N | — | N | id absent; URL nowhere in registry |
| S148 | round3 | payload-absent | N | — | N | id absent; URL nowhere in registry |
| S149 | round3 | payload-absent | N | — | N | id absent; URL nowhere in registry |
| S153 | round3 | payload-absent | N | — | N | id absent; URL nowhere in registry |
| S154 | round3 | payload-absent | N | — | N | id absent; URL nowhere in registry |
| S158 | round4 | payload-absent | N | — | N | id absent; URL nowhere in registry |
| S163 | round4 | payload-absent | N | — | N | id absent; URL nowhere in registry |
| S164 | round4 | payload-absent | N | — | N | id absent; URL nowhere in registry |
| S165 | round4 | payload-absent | N | — | N | id absent; URL nowhere in registry |
| S166 | round4 | payload-absent | N | — | N | id absent; URL nowhere in registry |
| S167 | round4 | payload-absent | N | — | N | id absent; URL nowhere in registry |
| S174 | round5 | payload-absent | N | — | N | id absent; URL nowhere in registry |
| S175 | round5 | payload-absent | N | — | N | id absent; URL nowhere in registry |
| S176 | round5 | payload-absent | N | — | N | id absent; URL nowhere in registry |
| S171 | round5 | unreachable (prose cell) | N | — | N | id cell corrupt (`S171\``); class cell is prose; URL nowhere |

Machine-readable copies: `awk-rows.tsv` (38 rows from the register), `slice.tsv` (38 rows with membership
flags), `table.md` (the table above).

## 4. Findings

1. **Count re-derives: 38.** Agreement with rounds 22, 23 and 35 on the same register bytes; class split
   37 + 1 matches the round-22 hand-check exactly.
2. **19 slice ids do not exist in the lane registry** (list above) and **the other 19 are accidental id
   collisions**: not one of the 19 present ids cites the same source as the registry row at that id, and
   the registry covered only S001–S101 on the register's own date. The register's `id` column therefore is
   not a key into `tabi-shokunin/corpus/SOURCES.md` at any revision checked — it indexes a census input
   whose numbering the lane registry does not share. Consequence for the round: a refused row cannot be
   re-keyed into the lane corpus by id; only 8/38 can be re-keyed by cited URL (mapping above). This does
   not weaken the rounds 22–23 verdicts (refused / unverifiable stand) and does not license renumbering.
3. **Register self-inconsistency (already logged, reconfirmed):** header totals say 194 rows / 324 ABSENT
   quotes while the file holds 303 data rows (194 `payload-absent` + 78 "source could not be fetched" +
   31 "gate block named no locator"); the "By lane" table says `tabi` 37 while the file has 38 tabi data
   rows — the missing one is the prose-classed S171. Round-22's lesson records the same staleness.
4. **Row-format defect at S171 (register line 362):** the id cell is `` S171` `` (unbalanced backtick) and
   the class cell holds the sentence "the cited source could not be fetched, so no quote was checked"
   instead of a class token. Any counter that classifies by class *token* silently loses this row and
   reports 37/37 `payload-absent`; classification must read the cell text and map that sentence to
   `unreachable`. My derivation does that and reproduces 37 + 1.
5. Registry bytes are identical at worktree, `HEAD`/freeze `2e7b7a8` and the round-start baseline
   `11c64b96`, so no registry drift can explain the mismatch; and `git status --porcelain corpus/SOURCES.md`
   is clean.

## 5. Gates run

- Register hash equals the round-22 frozen `registerSha256` (same bytes as the hand-check).
- Id-space determinism: 141 contiguous ids S001–S141, no gaps, unchanged across the three revisions.
- Duplicate-id control inside the slice: none.
- Predicate-coverage control: the 39th `tabi` line (the "By lane" totals row) is correctly excluded by the
  data predicate; `grep '`tabi`' | awk -F'|' '!($3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/)'` returns exactly that
  one line.
- Positive/negative membership control: 19 ids grep to 1, 19 to 0 (both classes present), so the membership
  test is not returning a constant.
- Cross-round stability: round-22 slice and round-25 id list intersect 38/38, 0 extras.

## 6. Touched surfaces (all read-only except my seat dir)

Read: the register; `tabi-shokunin/corpus/SOURCES.md` (worktree + `git show` at `2e7b7a8`, `11c64b96`,
`0f24164`, `2f35bd4`, `a4115fa`); `.ufo/waves/round-22/assimilation/{quarantine-verdicts.tsv,
quarantine-verdicts.json,quarantine-slice,quarantine-rows-full}`; `.ufo/waves/round-25/assimilation/
quarantine-ids.txt`; `corpus/lessons/round-22.md`, `corpus/lessons/round-35.md`. All git use read-only
(`log`, `show`, `cat-file`, `rev-parse`, `status`). Wrote only
`.ufo/waves/round-36/w1/ScribeQuarantine/` and `ScribeQuarantine.md`. No product code, judge, counter,
claim, commit or fetch touched. No subagents spawned. No pacman, no installs (no tool needed).

## 7. Out of scope / known limits

- No URL re-fetch: absence verdicts are not re-litigated and no fabrication accusation is added here.
- Membership was tested against `corpus/SOURCES.md` only (the registry the assignment names); the census
  input that produced the register's ids is not in this repo and is unidentified — the id-space mismatch is
  reported as observed, not explained.
- `git log -S` search covers only refs present in the local clone (`--all`).
- Nothing in this report originates from the frozen claims' counters; `claims.json` was read for scope only.

VERDICT finding — tabi quarantine slice re-derives to 38 rows (37 `payload-absent` + 1 unreachable S171),
matching rounds 22/23/35 on the byte-identical register (`5afe1810…`); but 19/38 slice ids are absent from
`corpus/SOURCES.md` (S001–S141) and the other 19 are id collisions with 0/38 source-identity matches (the
registry held only S001–S101 on the register's date), so the register's id column is not a lane-registry key
— only 8/38 rows re-key by cited URL, and the S171 row's corrupt id/class cells make token-based class
counters lose the unreachable row.
