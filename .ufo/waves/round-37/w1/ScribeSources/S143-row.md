# S143 registry row — draft for the L1 to land (tabi round 37, w1)

Seat: `ScribeSources` (scribe, leaf). Scope: draft only — this seat never edits `corpus/SOURCES.md`.

## Pre-checks (executed 2026-10-27 from `/home/vgpnk/Projects/shokunin/tabi-shokunin`)

| Check | Command | Result |
|---|---|---|
| Current max id | `grep -oE '^\| S[0-9]{3} \|' corpus/SOURCES.md \| sort \| tail -5` | `S138 S139 S140 S141 S142` → max **S142**, so the next unused id is **S143** |
| Row count before | `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md` | `142` (landing S143 makes 143) |
| URL not already registered | `grep -n 'git-replace' corpus/SOURCES.md` | no match — E04 duplicate-URL+scope cannot fire |
| Used-by target exists | `.ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs` | present (43,441 B) — E11 cannot fire |
| Cells contain no pipe | `awk -F'\|' '{print NF}'` on the row below | `13` (= 11 cells, no literal or escaped `\|` in any cell) |

## Row (single line, 11 columns, NF=13 with the leading/trailing pipes)

Append immediately after the `S142` row inside `## Registry` (before `## Paths`).

| S143 | git-replace manual — https://git-scm.com/docs/git-replace | docs | A | what the git-replace page states about replace references as an object-read substitution: a `refs/replace/<object>` entry whose content is the replacement object's SHA-1 makes Git commands read the replacement by default, and `--no-replace-objects` or `GIT_NO_REPLACE_OBJECTS` turns that off; not which commands fall outside the page's own exception list (reachability traversal: prune, pack transfer, fsck), not object-format or repository-integrity rules, not the counter's digest/binding rules, and not any other Git version's wording; the id is the registry's next-free S143 and is unrelated to the quarantine register's S143 label (separate namespace, same spelling) | page fetched 2026-10-27T13:35:05Z by seat `ScoutSrc` (curl -sSL, HTTP 200, no redirect, 38,351 B, sha256 46750b9f957b96a0660e158438dec14105a955801b02f7c3a009cf47b88d9105; server date 2026-10-27T13:34:54Z, last-modified 2026-10-26T14:52:01Z, manual banner "git-replace last updated in 2.55.0" at raw line 1328) and independently re-fetched by seat `ScribeSources` at 2026-10-27T13:34:56Z with the same 38,351 B and sha256; §DESCRIPTION (`<h2 id="_description">` at raw line 1658): line 1662 "Adds a replace reference in refs/replace/ namespace.", lines 1680-1682 "Replacement references will be used by default by all Git commands except those doing reachability traversal (prune, pack transfer and fsck).", line 1686 the `--no-replace-objects` option, the cat-file pair at 1693 and 1700-1705, lines 1708-1709 "The GIT_NO_REPLACE_OBJECTS environment variable can be set to achieve the same effect as the --no-replace-objects option."; receipts in `.ufo/waves/round-37/w1/ScoutSrc/s143-evidence.md` and `.ufo/waves/round-37/w1/ScribeSources/` | Replace refs rewrite what a Git command reads for an object without touching stored bytes, and `--no-replace-objects` / `GIT_NO_REPLACE_OBJECTS` restore the raw read, so a digest-bound receipt must hold both | mined | 2026-10-27 | 180d | .ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs |

## Column mapping (contract v1, `.ufo/waves/kaika/SOURCES-CONTRACT-v1.md`)

1. `id` — `S143`, next unused registry id after S142; the cell itself disclaims the quarantine register's unrelated `S143` label (quarantine slice ids are a separate namespace — cf. registry S106 vs quarantine S106).
2. `source` — title — canonical URL.
3. `kind` — `docs` (official upstream Git manual page).
4. `tier` — `A`, scoped to the cell above (official upstream manual, not a third-party write-up).
5. `scope` — what the page grounds, with the negatives stated.
6. `anchor` — section + raw-HTML line numbers + two independent fetch timestamps, byte size and sha256 (never a bare homepage).
7. `teaches` — one line: replace refs rewrite object reads; `--no-replace-objects` / `GIT_NO_REPLACE_OBJECTS` disable them.
8. `status` — `mined` (cited by the C2 counter path in `used-by`).
9. `opened` — `2026-10-27`.
10. `recheck` — `180d`.
11. `used-by` — `.ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs` (repo-relative; exists at draft time).

## Quote measurements (this seat's own re-hash and text extraction)

`git-replace.html` fetched by this seat: 38,351 B, sha256
`46750b9f957b96a0660e158438dec14105a955801b02f7c3a009cf47b88d9105` — byte-identical to
`ScoutSrc`'s receipt (`s143-evidence.md`). After stripping inline markup and normalising
whitespace (raw exact-string grep cannot match: the sentence is split across `code` spans):

| quote | exact occurrences | words | location |
|---|---:|---:|---|
| "The GIT_NO_REPLACE_OBJECTS environment variable can be set to achieve the same effect as the --no-replace-objects option." | 1 | **16** | raw lines 1708-1709, §DESCRIPTION |
| "Replacement references will be used by default by all Git commands except those doing reachability traversal (prune, pack transfer and fsck)." | 1 | **21** | raw lines 1680-1682, §DESCRIPTION |

`ScoutSrc`'s receipt states 17 words for the first sentence; the measured count is 16
(`The / GIT_NO_REPLACE_OBJECTS / environment / variable / can / be / set / to / achieve / the / same /
effect / as / the / --no-replace-objects / option.`). Both counts satisfy ≤25; the Gate must carry
the measured 16. The manual banner on the page reads `git-replace last updated in 2.55.0` (raw line 1328).

## Parse verification (required by the assignment)

Row appended to a **copy** of the registry at
`/fast/scratch/hyaku/tabi-r37/w1/ScribeSources/lane/corpus/SOURCES.md`, with `corpus/knowledge`
and `corpus/lessons` copied in and the counter mirrored under the same fake lane root so
`used-by` resolution has real targets.

```
$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <copy>
W04=20 ok=1                     # 20 pre-existing duplicate-URL warnings, NO E-codes
exit=0                          # ← required, met
$ grep 'S143' <validate output> # (no finding)
$ node scripts/check-sources.mjs --root <copy-lane> --file corpus/SOURCES.md
SOURCES_GATE verdict=clean rows=143 tiers=A:127,B:7,C:9 status=queued:15,mined:119,rejected:9 findings=0
exit=0
$ baseline copy without S143, same two commands
W04=20 ok=1 / verdict=clean rows=142 tiers=A:126,B:7,C:9 status=queued:15,mined:118,rejected:9 findings=0
```

A `diff` of the code column between the baseline run and the S143 run is empty: the new row adds
no finding class and no warning. The contract's inline census over the copy reports `rows 143`,
`malformed (NF!=13) 0`, no duplicate ids, tier `A=127 B=7 C=9`, status `mined=119 queued=15 rejected=9`,
no enum/tier-inflation violation, and every `mined` used-by path resolving on disk.
