# ScoutAssimilationPrep — round 25 w1: assimilation id-collision guard + quarantine slice

Seat: L1Tabi25.ScoutAssimilationPrep (scout, read-only). Date 2026-10-25.
Lane tip observed: `c8ef3084c6363f265b9d23285296ab3547654f57` (`git rev-parse HEAD`); baseline
`9e13666759bcf30665abec84dec13adefc1fa86a` is an ancestor (`git merge-base --is-ancestor 9e13666… HEAD` → true).
`corpus/SOURCES.md` has no changes compared with HEAD (`git diff --stat HEAD -- corpus/SOURCES.md` → empty).

Inputs (sha256 via `sha256sum`):
- lane registry `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md` — `c1826c75923e96af655d6d08c7db3b9cda938e2c34c80d40662017df3709de98`
- staged package `/home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md` — `7f646b3b787350d96125faed95f8d6d49daca529b7df4098196954823a86cab6`
- register `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` — `5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833`

## 1. Id-collision guard (observed)

Commands (run from the lane root, `A=.ufo/waves/round-25/assimilation`):

```
grep -oE '^ {0,3}\|[[:space:]]*S[0-9]{3,}' corpus/SOURCES.md | grep -oE 'S[0-9]+' | sort > $A/reg-ids.txt
grep -oE '^ {0,3}\|[[:space:]]*S[0-9]{3,}' /home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md | grep -oE 'S[0-9]+' | sort > $A/staged-ids.txt
comm -12 $A/reg-ids.txt $A/staged-ids.txt > $A/collisions.txt
```

Files written:
- `.ufo/waves/round-25/assimilation/reg-ids.txt`: **105** ids, from S001 to S105, with 0 duplicates (`wc -l`; `uniq -d` gives no output).
- `.ufo/waves/round-25/assimilation/staged-ids.txt`: **148** ids, from S102 to S249, with 0 duplicates (`wc -l`; `uniq -d` gives no output).
- `.ufo/waves/round-25/assimilation/collisions.txt`: **4** ids, **S102 S103 S104 S105** (`wc -l`, `cat`).

The ids collide but the rows do not match. Each pair is a different source (`grep -nE "^ {0,3}\|[[:space:]]*$id\b"` on both files):

| id | lane row (SOURCES.md line) | staged row (SOURCES.append.md line) |
|---|---|---|
| S102 | L116 SameSite cookies, rfc6265bis-13 | L7 CDP contribution guidelines README |
| S103 | L117 OWASP CSRF cheat sheet | L8 `chrome.debugger` API reference |
| S104 | L118 web.dev bfcache | L9 Chrome DevTools for agents — Configuration |
| S105 | L119 Page.pdl @ 154.0.8037.97 | L10 auto-connect use-case page |

Sweep for misses: a looser pattern `^[[:space:]]*\|[[:space:]]*S[0-9]{3,}` counts 105 lines in the registry and 148 in the staged file, the same as the strict counts. Neither file has any row indented 1–3 spaces (`grep -cE '^ {1,3}\|…'` → 0 and 0). So nothing slips past the tolerant pattern in today's bytes.

The registry is the same at the baseline and at HEAD: 105 rows, highest id S105 (`git show <rev>:corpus/SOURCES.md | grep -cE …`).

**Load-bearing finding for C1 (observed):** C1 says S106 will be "opened this round". The staged package already uses S106, at L11 (RFC 9309 Robots Exclusion Protocol). Once the lane appends its own S106, S106 joins the collision list. Every staged id from S102 to S249 collides with any id the lane opens in that range. [INFERENCE] Any adoption therefore has to renumber the staged rows or drop them; it cannot append them under their staged ids.

## 2. Guard proof on an indented scratch fixture (observed)

The fixture is in `.ufo/waves/round-25/scratch/ScoutAssimilationPrep/`:
- `fixture-registry.md` has the row `  | S104 | …` (2-space indent) and a flush `| S001 |` row.
- `fixture-staged.md` has `| S104 |` and `| S900 |`.

I ran the same three commands on the fixture:
- With the tolerant pattern: reg=[S001 S104], staged=[S104 S900], `collisions.txt`=[S104], 5 bytes. `test -s` → **PASS (nonempty)**.
- Control with the strict pattern `^\|`: reg=[S001], `collisions-anchored.txt` is 0 bytes. This shows the strict pattern would have missed the indented collision; the tolerant pattern catches it.
- Boundary check: a 4-space-indented row (`fixture-registry-4sp.md`) gives 0 matches. This is intended, since a 4-space indent is a CommonMark code block, not a table row.

## 3. Tabi quarantine slice (observed)

Command:
```
awk -F'|' '$2 ~ /tabi/ && $3 ~ /round/ && $4 ~ /S[0-9]+/' absent-defect-register.md > .ufo/waves/round-25/assimilation/quarantine-slice.md
```

- Rows: **38** (`wc -l`). Rows without an S-id: **0** (`grep -vcE '\|[^|]*\|[^|]*\|[^|]*S[0-9]{3,}'`).
- Ids: 38, all unique, written to `.ufo/waves/round-25/assimilation/quarantine-ids.txt`:
  S102 S106 S109 S110 S111 S114 S117 S118 S124 S125 S126 S130 S131 S133 S134 S135 S137 S138 S140 S142 S143 S144 S145 S147 S148 S149 S153 S154 S158 S163 S164 S165 S166 S167 S174 S175 S176 S171
- By class (`awk -F'|' '{print $5}' | sort | uniq -c`):
  - 37 rows are `payload-absent`, from the `## Rows` section (L178–214). This matches the register's own `## By lane` count for `tabi` (37, at L236).
  - 1 row is S171, from `## Rows whose quotes were NEVER CHECKED` (L256, row at L362): "the cited source could not be fetched". The register says this class is "re-fetch, or mark the row unverifiable — do NOT call it a fabrication". S171 is quarantined as **unverifiable**, not as a fabrication.
- Negative sweep: of all register lines mentioning tabi, only L236 (`| \`tabi\` | 37 |`, the by-lane total) falls outside the awk filter. It is a summary row, not a defect.
- Every quarantined id is a staged id (`comm -12 staged-ids quarantine-ids | wc -l` → 38).
- The only id in both the collision list and the quarantine list is **S102**.

[INFERENCE] Several payload-absent quotes look shifted by one row. For example, staged S106 (RFC 9309) carries zh-TW WebMCP quotes that belong to S107's page, and S110 (RFC 6585) carries WebMCP secure-tools quotes. This points to a systematic quote/row misalignment in the staged package, not 37 independent fabrications. It is unverified here; re-grounding would have to confirm it.

## Gate summary for the assimilation item

- Collision guard: **4 collisions (S102–S105)**, plus S106 as soon as the lane opens it for C1. The staged ids cannot be appended as they are.
- Quarantine: **38 tabi rows** (37 payload-absent, 1 unreachable). Any theme row an adopted entry cites must be re-grounded against fresh bytes and given a fresh id before it can be appended.

## Unknowns

- I did not check which staged ids the candidate theme `webmcp-devtools-agent-surface-r25` cites. That intersection with the quarantine list decides adoption, and it was out of scope for this seat.
- The quote-shift explanation above is inference and has not been verified.

## Tooling

No tools installed or upgraded. Every write stayed inside `.ufo/waves/round-25/{assimilation,scratch/ScoutAssimilationPrep,w1}/`. Nothing was written to shokuknow, and no git writes were made.
