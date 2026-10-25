# round-27 assimilation scratch — redirect/Retry-After theme (addendum §10)

- `reg-ids` — lane registry ids (106), `grep -oE '^ {0,3}\|[[:space:]]*S[0-9]{3,}'` over corpus/SOURCES.md at baseline.
- `staged-ids` — staged ids (148), same pattern over /home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md (read-only).
- `collisions` — comm -12: S102-S106 (staged ids are a parallel S-space; none adopted by id, all id assignment is by document).
- `guard-fixture/` — indented `  | S124 |` scratch registry + its comm output `fix-collisions` (S124 caught: the 0-3-space pattern is proven before any append).
- `rfc9110.txt` — fresh fetch this round (2026-10-25): 502941 B, sha256 21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a. The bytes the admitted entry's quotes are located in.
- `staged-row.txt` — the byte-exact staged S124 row (SOURCES.append.md line 29).
- `s107-row.txt` — the transformed fleet-schema row actually appended (recheck '730d' bare; anchor cell carries this round's access date, byte count and sha256; used-by exactly the admitted entry).
- `staged-census.txt` — scratch-mirror census over registry+byte-exact staged row: exit 1, `file  E09  S124 recheck=730d (errata only)` — the do-nothing append is impossible.
- `xform-census.txt` — scratch-mirror census over registry+transformed S107+admitted entry: exit 0 (`file ok`).
- Mirror trees (copy of corpus/ + row + entry) were scratch; pruned after the receipts above were taken. Their inputs and outputs are all reproduced by these files.
