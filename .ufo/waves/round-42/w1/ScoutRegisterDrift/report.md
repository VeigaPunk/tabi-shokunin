# ScoutRegisterDrift — tabi slice derivation cross-check

Seat: ScoutRegisterDrift. Lane: tabi. Read-only register; no writes under shokuknow; no git/jj mutation. No packages installed (RULES.md read; pacman not used; GNU awk 5.4.1 already present).

Axes: (1) buggy vs fixed extraction bytes, (2) byte identity of the id list with the freeze blob, (3) header and `## By lane` against a row recount, not the printed totals.

## Sources pinned

- Register: `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`
  - sha256 `5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833`
  - 83621 bytes, 375 lines
  - shokuknow HEAD `8b94c5c12c0521e4cd9ed8e5b6939afd8518c715`; `git status --porcelain` on that path was empty
- Freeze blob: `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 9b6de3a19de11abdb80e82a1310abc64a40215bb:.ufo/waves/round-42/quarantine/slice-ids.txt`
  - git blob `ec22e716f19bf160bb113ea2bc2f0ff03520a5db`
  - sha256 `373516272b385d1becce2e622292668dc82b7dc0012df64bcac8810f76e712cf`
  - 190 bytes, 38 lines, LF, no spaces
- Working-tree `slice-ids.txt` `cmp`s identical to that blob. tabi-shokunin HEAD at check time was `0081bfdb93b6bd1bf2853bb128996f1a976b7218` (not the freeze).
- Recorded dedup (not re-trusted; re-run below): `.ufo/waves/round-42/quarantine/slice-derivation.txt` lines 3–5. `cut -d" " -f1 | sort -u` is how `slice-ids.txt` was defined. The two-field awk stdout is not the file.

## 1. Buggy extraction (round-41)

```
awk -F'|' -v l='tabi' '$2 ~ ("`" l "`") && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/ {print $4, $5}' \
  "$REG"
```

38 lines. `awk '{print $1}' | sort -u` differs from `slice-ids.txt` by one line:

```
-S171
+S171`
```

S171 id-cell on register line 362 (the only tabi row under `## Rows whose quotes were NEVER CHECKED`):

```
| `tabi` | round5 | S171` | the cited source could not be fetched, so no quote was checked | https://chromestatus.com/features/5117755740913664 |
```

Id-cell bytes: `20 53 31 37 31 60 20` (space, `S171`, one `0x60`, space). The buggy first field is the five bytes `53 31 37 31 60`. That is one trailing backtick, not two. The comment spelling in `slice-derivation.txt:4` puts a second backtick next to the token as a closer; `od` shows a single `0x60`.

Printed buggy line 38: leading space from `$4`, then `S171` plus `0x60`, then three spaces (field trailing space + OFS + `$5` leading space), then the why-text. Evidence: `evidence/buggy.tsv`, `evidence/buggy-ids.txt`, `evidence/register-line-362.bin`.

All 109 NEVER CHECKED id cells end in a backtick (109/109). `## Rows` id cells: 0/194 contain a backtick. Inside the tabi predicate only S171 is malformed, because only S171 sits in that section.

## 2. Fixed extraction

```
awk -F'|' -v l='tabi' '$2 ~ ("`" l "`") && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/ {id=$4; gsub(/[^A-Za-z0-9]/,"",id); print id, $5}' \
  "$REG" | sort -u
```

38 lines, 38 unique ids. `cut -d' ' -f1 | sort -u` vs the freeze blob:

```
cmp -s fixed-ids-cut.txt slice-ids.txt  → CUT_CMP_IDENTICAL
sha256 both 373516272b385d1becce2e622292668dc82b7dc0012df64bcac8810f76e712cf
wc -c both 190
```

The full two-field stdout is not byte-identical to `slice-ids.txt` (it still has the class/why column). The id list is. S171's second field is the why-text, not `` `payload-absent` ``. The other 37 second fields are `` `payload-absent` ``.

Ids: S102 S106 S109 S110 S111 S114 S117 S118 S124 S125 S126 S130 S131 S133 S134 S135 S137 S138 S140 S142 S143 S144 S145 S147 S148 S149 S153 S154 S158 S163 S164 S165 S166 S167 S171 S174 S175 S176.

## 3. Header and `## By lane` (derived, not trusted)

Recount of the markdown tables, then the census the header names (`quote-lint-full-v5.json`, same directory; `.totals` and `.findings[].verdict`).

| claim | where | derived |
|---|---|---|
| rows with at least one ABSENT quote **194** | header L18 | 194 data rows in `## Rows`; 194 census rows with verdict `ABSENT` |
| ABSENT quotes **324** | header L19 | census `.totals.absent` = 324 and 324 findings with verdict `ABSENT`. A pipe-aware `<br>` recount of the rendered quote cells is **301** (17 rows short by 23 spans). Not an id error. |
| `` `payload-absent` `` **194** | header L23 | 194/194 `## Rows` class cells are that token |
| `## By lane` `` `tabi` `` **37** | L236 | 37 tabi rows in `## Rows`; 37 census `ABSENT` tabi ids. **Omits S171.** |
| By lane sum **194** over 19 lanes | L236–254 | equals `## Rows` per lane, and equals census `ABSENT` per lane. Lanes only in NEVER CHECKED are absent from the summary: `lore` 9, `mori` 3 |
| NEVER CHECKED `rows: **109**` | L263 | 109 markdown rows; census `fetch-failed` 78 + `no-locator` 31 = 109 distinct rows; none of them also `ABSENT` |

Tabi census `ABSENT` ids are the 37 above **without** S171. Census never-checked tabi row is exactly `('tabi','round5','S171')` (`fetch-failed`). The awk predicate matches both pipe tables, so it returns 37+1=38. Trusting `## By lane` drops S171; the freeze file does not.

Header 324 matches the census, not the rendered cells. The 17 short rows include two tabi slice ids: S118 (census 5 quotes, markdown 3) and S176 (census 5, markdown 3). Other short rows are not tabi. The class legend defines `` `unreachable` `` (L14) but neither table uses that token; never-checked rows use a why-sentence instead.

## Limitations

- Quote-span markdown count rejoins interior `|` and splits on `<br>`. Four kotoba rows have no standard note cell; their quote runs to EOL and is still counted. The census number is the check for 324.
- Register bytes are the shokuknow worktree at the sha256 above, not a tabi-shokunin commit.
- Scratch `/fast/scratch/hyaku/tabi-r42/ScoutRegisterDrift` deleted after evidence copy.

Evidence (this directory): `evidence/buggy.tsv`, `evidence/buggy-ids.txt`, `evidence/fixed.tsv`, `evidence/fixed-ids-cut.txt`, `evidence/slice-ids.txt`, `evidence/register-line-362.bin`, `evidence/s171-bytes.txt`.

VERDICT ok fixed-id list is byte-identical to frozen slice-ids.txt (38 ids, sha256 373516272b385d1becce2e622292668dc82b7dc0012df64bcac8810f76e712cf); By lane tabi 37 is ABSENT-only and omits S171
