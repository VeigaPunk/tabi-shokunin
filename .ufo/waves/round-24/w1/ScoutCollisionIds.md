# Scout: §10 id-collision check (candidate rows S104, S105)

Round 24, wave 1 scout report. Read-only over `/home/vgpnk/Projects/shokuknow`; no campaign tool run; no tools installed.

## Sources and method

| Input | Path | Role |
|---|---|---|
| Lane registry | `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md` | committed registry home |
| Staged rows | `/home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md` | corpus-expansion-1 staged rows for lane tabi |

ID extraction pattern (0–3 leading-space tolerant): `^[ \t]{0,3}\| S[0-9]+ ` — a table row starting with a pipe, an `S` id, and a space. Derived with:

```
awk '/^[ \t]{0,3}\| S[0-9]+ / { if (match($0, /S[0-9]+/)) print substr($0, RSTART, RLENGTH) }' <file> | sort -u -tS -k2 -n
```

Full-file sweep: every row of both files was matched; total matched rows: 103 (registry), 148 (staged); no duplicate id rows inside either file; the grep-tool preview counts (108/150) include the reader's contextual wrapper lines, the awk derivation above is the exact artifact.

## 1. Lane registry ids (103: S001…S103, contiguous, no gaps)

S001 S002 S003 S004 S005 S006 S007 S008 S009 S010 S011 S012 S013 S014 S015 S016 S017 S018 S019 S020 S021 S022 S023 S024 S025 S026 S027 S028 S029 S030 S031 S032 S033 S034 S035 S036 S037 S038 S039 S040 S041 S042 S043 S044 S045 S046 S047 S048 S049 S050 S051 S052 S053 S054 S055 S056 S057 S058 S059 S060 S061 S062 S063 S064 S065 S066 S067 S068 S069 S070 S071 S072 S073 S074 S075 S076 S077 S078 S079 S080 S081 S082 S083 S084 S085 S086 S087 S088 S089 S090 S091 S092 S093 S094 S095 S096 S097 S098 S099 S100 S101 S102 S103

## 2. Staged ids (148: S102…S249, contiguous, no gaps)

S102 S103 S104 S105 S106 S107 S108 S109 S110 S111 S112 S113 S114 S115 S116 S117 S118 S119 S120 S121 S122 S123 S124 S125 S126 S127 S128 S129 S130 S131 S132 S133 S134 S135 S136 S137 S138 S139 S140 S141 S142 S143 S144 S145 S146 S147 S148 S149 S150 S151 S152 S153 S154 S155 S156 S157 S158 S159 S160 S161 S162 S163 S164 S165 S166 S167 S168 S169 S170 S171 S172 S173 S174 S175 S176 S177 S178 S179 S180 S181 S182 S183 S184 S185 S186 S187 S188 S189 S190 S191 S192 S193 S194 S195 S196 S197 S198 S199 S200 S201 S202 S203 S204 S205 S206 S207 S208 S209 S210 S211 S212 S213 S214 S215 S216 S217 S218 S219 S220 S221 S222 S223 S224 S225 S226 S227 S228 S229 S230 S231 S232 S233 S234 S235 S236 S237 S238 S239 S240 S241 S242 S243 S244 S245 S246 S247 S248 S249

## 3. Intersection count: 2

`comm -12 lane-registry-ids.txt staged-ids.txt` → **S102, S103** (both already landed in the lane registry; they are earlier staged rows that are already merged, not this round's candidate rows).

## 4. Candidate-row check (S104, S105)

- S104: present in staged list (yes); present in lane registry (no). → no collision.
- S105: present in staged list (yes); present in lane registry (no). → no collision.

**Verdict: the two candidate rows this round would append (S104, S105) do not collide with any committed lane-registry id.** The only id overlap between the staged set and the registry is S102/S103 (already-landed rows), which does not affect the candidates.

## 5. Next free ids

Union of both id sets is contiguous S001…S249 (249 unique ids, zero gaps), so the next free ids after the union max are **S250, S251, S252, S253, S254, S255, S256, S257, S258, S259** (first 10; `S<max+1>` onward is free).

## Evidence saved (wave evidence)

| List | File |
|---|---|
| Lane registry ids | `.ufo/waves/round-24/assimilation/lane-registry-ids.txt` |
| Staged ids | `.ufo/waves/round-24/assimilation/staged-ids.txt` |
| Intersection ids | `.ufo/waves/round-24/assimilation/intersection-ids.txt` |
| Next free ids | `.ufo/waves/round-24/assimilation/next-free-ids.txt` |
| Union (for next-free derivation) | `.ufo/waves/round-24/assimilation/union-ids.txt` |

All derived from the two inputs above; shokuknow touched read-only.
