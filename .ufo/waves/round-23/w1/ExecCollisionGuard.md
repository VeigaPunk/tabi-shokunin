# ExecCollisionGuard — id-collision guard failure proof (round 23, read-only)

**Verdict:** the guard can fail: the prompt's 0–3-space extractor traps the indented collision (1 hit), while the column-zero-only extractor false-greens it (0 hits) on the same bytes, with a nonempty registry id list (not vacuous). Real corpus/SOURCES.md and the real staged append currently yield 0 collisions under both patterns; the real registry holds 0 indented rows today, so the false-green is latent, not active. No production writes.

Fixture (census shape, corpus/SOURCES.md:152 "accepts 0–3 leading ASCII spaces before Markdown table rows and headings; 4 or more spaces are indented code and are ignored." — fleet CORPUS.md, "Maintained parser note"):
- `scratch/ExecCollisionGuard/fx/registry-indented.md` = column-zero `| S010 |` + two-space-indented `  | S002 |`
- `scratch/ExecCollisionGuard/fx/staged.md` = `| S002 |` + `| S050 |`
- `FX=/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-23/scratch/ExecCollisionGuard/fx`

## Findings (each with its exact command)

1. **Long pattern trips on the indented row.** `grep -oE '^ {0,3}\|[[:space:]]*S[0-9]{3,}' "$FX/registry-indented.md" | grep -oE 'S[0-9]+' | sort > "$A/reg-ids"; grep -oE '^ {0,3}\|[[:space:]]*S[0-9]{3,}' "$FX/staged.md" | grep -oE 'S[0-9]+' | sort > "$A/staged-ids"; comm -12 "$A/reg-ids" "$A/staged-ids" > "$A/collisions"` (`A=$FX/out-long`) → reg-ids `S002 S010`, staged-ids `S002 S050`, collisions `S002`, `collision_count=1`.
2. **Narrow pattern false-greens the same bytes.** Same three commands with `'^\|[[:space:]]*S[0-9]{3,}'` (`A=$FX/out-narrow`) → reg-ids `S010` (nonempty, so green is not vacuous), staged-ids `S002 S050`, `collisions:` empty, `collision_count=0`.
3. **Green control on the long pattern.** Same long-pattern commands with `fx/staged-nocollide.md` (`S050 S051`) against `registry-indented.md` (`A=$FX/out-green`) → `green collisions=0`: the long pattern is not trip-happy.
4. **Boundary: 4-space rows are not rows.** `grep -oE '^ {0,3}\|[[:space:]]*S[0-9]{3,}' "$FX/registry-fourspace.md" | grep -oE 'S[0-9]+' | sort` (`registry-fourspace.md` = `| S010 |` + four-space `    | S002 |`) → `S010` only; matches CORPUS.md's ignore rule, so the wide pattern is correctly bounded, not merely wider.
5. **Real registry, long pattern.** `REG=/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md; STG=/home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md` then the three long-pattern commands against `"$REG"`/`"$STG"` (`A=scratch/ExecCollisionGuard/real-long`) → `reg_ids=101 staged_ids=148 collisions=0`.
6. **Real registry, narrow pattern.** Same three commands with `'^\|[[:space:]]*S[0-9]{3,}'` (`A=scratch/ExecCollisionGuard/real-narrow`) → `reg_ids=101 staged_ids=148 collisions=0`; identical to F5 today.
7. **Indent sweep of the real bytes (why F6 is not yet a live miss).** `grep -cE '^ {1,3}\|[[:space:]]*S[0-9]{3,}' "$REG"` → `0`; `... "$STG"` → `0`; `grep -cE '^[[:space:]]*\|[[:space:]]*S[0-9]{3,}' "$REG"` → `101` (equals the 101 ids, so no duplicate-id inflation in the id list).
8. **Real non-collision is positive, not vacuous.** `head -1/tail -1` of the sorted id lists (`A=.../real-long`) → registry `S001 … S101`, staged `S102 … S249`; `comm -12 "$A/reg-ids" "$A/staged-ids" | wc -l` → `0`; `sort -u "$A/staged-ids" | wc -l` → `148` (staged ids distinct, so the empty intersection is byte-grounded).
9. **Consequence for the append gate (inference from F1–F8).** One sibling-lane row written as `  | Sxxx |` (the kumitate/kotodama collision precedent, prompt §10) moves a real collision from F5's 0 to the narrow extractor's blind spot; the guard must therefore be the 0–3-space form, and a 0-collision claim under the narrow pattern alone is not evidence.
10. **Unknowns left open.** Whether the fleet census CLI (`scripts/sources-census.sh`) reparses indented rows identically was not exercised (read-only census run outside this item); F4 only tests the extraction regex against CORPUS.md's stated rule. Scratch fixtures are throwaway and unreferenced by any tracked file.

Artifacts: `scratch/ExecCollisionGuard/{fx/registry-indented.md,fx/staged.md,fx/staged-nocollide.md,fx/registry-fourspace.md,fx/out-long,fx/out-narrow,fx/out-green,fx/out-4sp,real-long,real-narrow}` (id lists, staged lists, collisions files). No tracked-file edits, no git/jj writes, no tool installs.
