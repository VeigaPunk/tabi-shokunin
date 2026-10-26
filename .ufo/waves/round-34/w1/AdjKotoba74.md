# Round 34 w1 — AdjKotoba74 (C1 build, kotoba candidates rows 13–18, 65)

**Verdict.** All seven assigned kotoba candidates are **screens, not map rows**: six are `third-lane-report` and one (`census-round74.md:152`) is `no-claim-declared`. The seven lines are a sibling census of tabi's committed bytes (commit cell, delta cell, re-pin cell, and the three physical lines of one census-limitation bullet) plus one line inside kotoba's kagi-description rewrite that quotes **kagi's** boundary, not kotoba's. None of them states a claim by kotoba on tabi's browser ground, so none is an overlap; mapping any of them would be mapping a non-overlap, and the one line that touches a real boundary (`rewrites-round8.md:136`, the shared burner-chrome lease at CDP 9222) restates a boundary already mapped twice (`musketeer-cdp-9222-profile-lease`, kake and kagi) — counting it again under a kotoba surface is the surface-string duplication the round's counting rule forbids. Consequence for the lane: **this seat contributes 0 to `newMapped`**; the C1 target's `newMapped >= 3` must be carried by the seats holding the kake/kasegi/kotoba-round49 candidates the freeze names. My contribution is 7 of the 66 unaccounted candidates, all verified: `screened 7`, `unaccounted 66 -> 59`, `screenFindings []`, adjacency `clean rows=13 verified=13`.

## Per-candidate decisions

| # | key (candidate) | decision | reason (grounded in both sides) |
|---|---|---|---|
| 13 | `kotoba-shokunin@65a5c7a6…:corpus/knowledge/sibling-overlap-census-round74.md:70` | screen `third-lane-report`, surface `-` | A census table cell (`\| tabi \| master \| 856fa9e1… \| SKILL.md \| none \| no \| no \| PROVINCE.md:3 …`) recording tabi's commit, skill file and kotoba-side classification: a roster fact about tabi's bytes; tabi's actual scope statement is its own `PROVINCE.md:3`, which the row merely quotes. No kotoba claim on a browser surface. |
| 14 | `…census-round74.md:101` | screen `third-lane-report`, surface `-` | The same tabi row with recomputed `delta` (`+89/-0`) and `evidence` (`PROVINCE.md:3 unchanged …`): kotoba's audit cells, no browser claim and no new tabi surface named. |
| 15 | `…census-round74.md:126` | screen `third-lane-report`, surface `-` | `\| tabi \| \`e3cf4e0d\` \| \`856fa9e1\` \| +89/-0 \| none → none \|` — the "what changed since round 49" cell; kotoba's own class stays `none → none`, i.e. the line asserts no overlap. |
| 16 | `…census-round74.md:150` | screen `third-lane-report`, surface `-` | First line of the census-limitation bullet: kotoba's own `none` rule (`verifiers/check_sibling_census.py:595-604`) plus a byte fact — tabi's `SKILL.md` carries the whole word. A fact about tabi's file, not a browser-ground claim. |
| 17 | `…census-round74.md:151` | screen `third-lane-report`, surface `-` | Same bullet, continued: `twice inside one watchdog roster string` with the `git … show 856fa9e1:SKILL.md \| grep -n -w -i kotoba` command and line numbers 1313/1450. Command evidence for a byte fact; no surface claimed. |
| 18 | `…census-round74.md:152` | screen `no-claim-declared`, surface `-` | The bullet's own verdict, `a citation, not a split, so tabi stays \`none\``: kotoba explicitly declares the naming is not a split, so it claims nothing on tabi ground. Cross-checks tabi `SKILL.md:1313`/`:1450`, where the word sits in a watchdog `LANES=` roster string, and the round-33 precedent `corpus/adjacency-screen.tsv` kotoba `PROVINCE.md:73` (`no-claim-declared`). |
| 65 | `kotoba-shokunin@65a5c7a6…:corpus/knowledge/sibling-description-rewrites-round8.md:136` | screen `third-lane-report`, surface `-` | `owns the property fleet and the shared burner-chrome lease (CDP` sits inside the reworded **kagi** frontmatter, quoting kagi's own sibling boundary (`kake owns … - report lease conflicts to kake, never absorb`): another lane's claim about kagi/kake, not kotoba's claim on tabi ground. The lease boundary it restates is already dispositioned as `musketeer-cdp-9222-profile-lease` (map rows for kake and kagi, contested-open); a kotoba row would count the same boundary a third time. |

No row was drafted for tabi's side, so `decl.md`, `rows.tsv` and `l0.txt` are empty (0 bytes each; a new map row would have required a new `## Round 34 — sibling-overlap declarations (outside PROVINCE)` bullet in `SKILL.md`, and none of these lines is an overlap).

## Evidence

### Quote verification (`grep -F` against the `git show` bytes, pin `65a5c7a663249e0522cc49e4a148424200d9ddfe`)

```
$ git -C kotoba-shokunin show $PIN:corpus/knowledge/sibling-overlap-census-round74.md | grep -cF -- '| tabi | master | 856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb | SKILL.md | none | no | no |'
2                     (matches :70 and :101, the two cells sharing the prefix)
$ … | grep -cF -- '+89/-0 | PROVINCE.md:3 unchanged'          → 1
$ … | grep -cF -- '| tabi | `e3cf4e0d` | `856fa9e1` | +89/-0 |' → 1
$ … | grep -cF -- "tabi's frozen \`SKILL.md\` body carries the whole word" → 1
$ … | grep -cF -- 'twice inside one watchdog roster string'    → 1
$ … | grep -cF -- 'a citation, not a split, so tabi stays'     → 1
$ git -C kotoba-shokunin show $PIN:corpus/knowledge/sibling-description-rewrites-round8.md | grep -cF -- 'owns the property fleet and the shared burner-chrome lease (CDP' → 1
```

Exact-line containment (quote must be on the cited line, 4–25 words, ≥20 non-space chars, no TAB):

```
corpus/knowledge/sibling-overlap-census-round74.md:70  line-has-quote=True words=15 non_space=74 ok_quote=True tabs=False
corpus/knowledge/sibling-overlap-census-round74.md:101 line-has-quote=True words=4  non_space=29 ok_quote=True tabs=False
corpus/knowledge/sibling-overlap-census-round74.md:126 line-has-quote=True words=9  non_space=35 ok_quote=True tabs=False
corpus/knowledge/sibling-overlap-census-round74.md:150 line-has-quote=True words=8  non_space=45 ok_quote=True tabs=False
corpus/knowledge/sibling-overlap-census-round74.md:151 line-has-quote=True words=6  non_space=34 ok_quote=True tabs=False
corpus/knowledge/sibling-overlap-census-round74.md:152 line-has-quote=True words=8  non_space=31 ok_quote=True tabs=False
corpus/knowledge/sibling-description-rewrites-round8.md:136 line-has-quote=True words=10 non_space=54 ok_quote=True tabs=False
```

### Sibling context read (each candidate ±8 lines, `git show <pin>:<path>`)

- `sibling-overlap-census-round74.md:55-81` — the 20-lane table; row 13 is tabi's cell. `:56-135` — the same 20 rows with `delta`/`evidence` cells; row 14 is tabi's. `:140-164` — the limitations bullets and `## Recheck`; rows 16–18 are three physical lines of the third bullet.
- `:140-149` states the census's own limits: classes are audit-side facts about committed bytes and are assigned to wave-2 reviewers of *kotoba's* census; `:147-149` records the mechanical `none` rule.
- `sibling-description-rewrites-round8.md:125-150` — the block is kagi's rewritten `description:` in YAML (`Secrets and vault ops … Sibling boundary: kagi owns vault auth and the CDP bridge itself; kake owns the property fleet and the shared burner-chrome lease (CDP 127.0.0.1:9222) - report lease conflicts to kake, never absorb.`), followed by kotoba's per-sentence accounting. Row 65 is the wrapped second line of that quoted boundary.

### tabi side read

- `PROVINCE.md:3` (domain), `:8-14` (owns: CDP session discipline, interaction records, dynamic-page evidence), `:15-18` (refuses: RE craft → revenger/kaidoku, publishing → kake, secrets → kagi) — none of the seven kotoba lines names any of these surfaces as claimed by kotoba.
- `SKILL.md:1313` and `:1450` — `LANES="protocol aggregator kasegi kengaku kake kumitate kotoba kagi kama"`, the watchdog roster string the census bullet counts; it is a roster value, not a browser-craft surface.
- `corpus/README.md` coverage map (`:1-40`) — the lane's held notes are substrate/census/CDP/live-capture/journey/interaction-approval/executor-sufficiency; no kotoba surface appears.
- `corpus/adjacency.tsv` — 13 rows; kotoba appears in none, so no existing kotoba surface exists and `same-surface` is unavailable in-vocabulary for a kotoba candidate (the counter requires the named surface to be a verified row of the same sibling).

### Validation in my scratch clone (freeze `59f1b47aae277e1670e4a824173da8cde7e388ee`)

Clone: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone` + `git -C $S/clone checkout -q --detach 59f1b47ae…`; `git -C $S/clone rev-parse --show-toplevel` → `$S/clone`. My commit adds only the new ledger (`git show --stat` → `corpus/adjacency-screen-skill.tsv | 8 ++++++++`, 1 file changed, 8 insertions); `SKILL.md`, the map and every tracked prior file are untouched.

```
$ node $S/clone/scripts/check-adjacency.mjs --at 9e4481f75453598322ad9dd03880457b438ad09d \
      --repo $S/clone --fleet /home/vgpnk/Projects/shokunin --json
exit=0
{"schema":"tabi-adjacency-check-v1","verdict":"clean","rows":13,"verified":13,"selfRulings":[2],
 "at":"9e4481f75453598322ad9dd03880457b438ad09d", …}
```

```
$ TMPDIR=$S/tmp node .ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs \
      --rev 9e4481f75453598322ad9dd03880457b438ad09d --repo $S/clone \
      --fleet /home/vgpnk/Projects/shokunin --json
exit=1
{"predicate":false,"candidates":67,"candidatesBySet":{"A":38,"B":29},"mapped":1,"screened":7,
 "unaccounted":59,"newMapped":0,"newMappedRows":[],
 "adjacency":{"verdict":"clean","rows":13,"verified":13,"findings":0},"screenFindings":[]}
perLane {"kotoba":13, "kake":13, "kaidoku":9, "mori":8, "kumitate":5, "tameshi":5, "kagi":4,
         "kama":4, "kasegi":3, "tsukuroi":2, "chousa":1, …}
```

- `screened 7` with `screenFindings []` is this seat's whole ledger: every one of my rows parsed, matched a candidate key, carried an in-vocabulary reason, a `-` surface (no row uses `same-surface`) and a valid quote.
- The 6 kotoba candidates still unaccounted are **not mine**: `sibling-overlap-census-round49.md:86,171,172,173,175` and `fleet-skill-audit-round5.md:45` (read from the counter's `unaccountedKeys`). Row 13–18 and 65 are gone from that list.
- Exit 1 is the frozen predicate (`unaccounted 0 AND newMapped >= 3`), expected for a single seat's slice; my rows are additive to whatever the other C1 seats land, and the ledger file `corpus/adjacency-screen-skill.tsv` did not exist at the baseline (`git cat-file -t 15dfacc…:corpus/adjacency-screen-skill.tsv` → rc 128, "exists on disk, but not in" that commit).

## Deliverables

- `.ufo/waves/round-34/w1/AdjKotoba74/screen.tsv` — 7 screen rows, 5 TAB columns, no header (sha256 `abe68fd2491f6109b3123832e46705f064a7b5ff73b9f732a9b71486d44e5483`, 2661 bytes).
- `.ufo/waves/round-34/w1/AdjKotoba74/rows.tsv` — empty (0 map rows).
- `.ufo/waves/round-34/w1/AdjKotoba74/decl.md` — empty (0 declaration bullets).
- `.ufo/waves/round-34/w1/AdjKotoba74/l0.txt` — empty (no contested-open line).
- `.ufo/waves/round-34/w1/AdjKotoba74/adj-gate-at-9e4481f7.json` — gate receipt (verbatim stdout).
- `.ufo/waves/round-34/w1/AdjKotoba74/c1-at-9e4481f7.json` — frozen-counter receipt (verbatim JSON).
- Integration form: prepend the header
  `sibling_ref	reason	surface	quote	note` to `screen.tsv` and append as `corpus/adjacency-screen-skill.tsv` (that is exactly what my scratch commit `9e4481f7` does, 8 lines).

## Notes for the L1 / wave-2

1. **`newMapped` liability.** This seat adds 0. If the lane reaches `newMapped >= 3`, it does so without these rows; my 7 screens only move `unaccounted` 66 → 59.
2. **Rows 16–18 are one Markdown-wrapped bullet.** I screened each physical line on its own text: `:150`/`:151` report the byte fact (`third-lane-report`), `:152` carries the explicit no-split verdict (`no-claim-declared`). A reviewer preferring one reason for the whole bullet can relabel `:150`/`:151` to `no-claim-declared` with no change to accountability; the reverse relabel of `:152` would lose the only line that states kotoba's non-claim explicitly.
3. **Row 65 and `same-surface`.** In-vocabulary `same-surface` requires the named surface to be a verified map row of the *same* sibling; kotoba has none, so the row is screened `third-lane-report` and the already-mapped lease boundary is named in the note instead. Do not turn it into a third `musketeer-cdp-9222-profile-lease` row under a kotoba key.
4. **Duplicate keys.** These 7 keys are this seat's; a second screen row on any of them from another seat would read `screen-duplicate` in the counter.
5. **Not run here (by design).** No lane build/lint/formatter, no browser launch, no network fetch, no L0 edit, no tool installs. The counter ran with `TMPDIR=$HYAKU_SCRATCH/tabi-r34/AdjKotoba74/tmp`; scratch removed after receipts were copied.
