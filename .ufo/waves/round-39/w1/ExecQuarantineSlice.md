# ExecQuarantineSlice — round 39 w1: complete tabi quarantine slice re-derivation

Axes: operability. Milestone: executable-check. Full report + evidence:
`.ufo/waves/round-39/w1/ExecQuarantineSlice/report.md` (same directory: `derive.sh/.out`,
`verify.sh/.out`, `reparse.mjs/.out`, `slice.tsv`).

No source fetch was performed (item scope). Read-only over the register; register digest unchanged
before and after the reads.

## Answer to the item

| question | observed answer |
|---|---|
| exact awk command | `awk -F'|' '$2 ~ /\`tabi\`/ && $3 ~ /round[0-9]+/ && $4 ~ /S[0-9]+/' REGISTER` (canonical round-36 §10 form; the round-25 looser form `$2 ~ /tabi/ && $3 ~ /round/ && $4 ~ /S[0-9]+/` gives the same 38) |
| row count | **38** data rows (all-lanes predicate over the same file: 303) |
| IDs (register row order) | S102 S106 S109 S110 S111 S114 S117 S118 S124 S125 S126 S130 S131 S133 S134 S135 S137 S138 S140 S142 S143 S144 S145 S147 S148 S149 S153 S154 S158 S163 S164 S165 S166 S167 S174 S175 S176 S171 — 38 distinct, no duplicates |
| summary row accidentally included? | **No.** 39 lines carry `` `tabi` ``; the only one the predicate excludes is the By-lane summary row `\| \`tabi\` \| 37 \|` (line 236). Injected-duplicate control: slice stays 38. Injected row *with* `roundN`+`S999` in the wrong cells: slice becomes 39 ⇒ the predicate is positional, not schema-checked. |
| every data row has an S-id? | **Yes — 38/38.** Strict-token check: 37 cells are exactly `S<digits>`; S171's cell is `` S171` `` (stray trailing backtick) — still matched by the unanchored `S[0-9]+`, but an anchored `^S[0-9]+$` variant yields 37 and drops exactly S171. |
| class split | 37 `payload-absent` + 1 `unreachable` (S171) — matches the round-22 hand-check receipt (`absent-refused` 37 / `unverifiable-unreachable` 1) |
| round split | round1=8 round2=11 round3=9 round4=6 round5=4 |
| cross-checks | prior lane derivations: 38/38 common, 0 extras either way (`round-22/assimilation/quarantine-slice`, `round-25/assimilation/quarantine-ids.txt`); the round-39 generator's own 8-way row-order partition matches the derived order exactly (`PARTITION_MISMATCHES: 0`); an independent non-awk re-parse (round-22 parser semantics, no network) reproduces 38 / 37+1 / no duplicates |

## Findings

**F1 — committed round-37 verifier spot-check mis-states the class distribution.**
`corpus/lessons/round-37-verifier-spotcheck.md:98` says "re-derived slice: 38 data rows, **all
`payload-absent`**". Observed: 37 `payload-absent` + 1 `unreachable` (S171). The count is right, the
"all payload-absent" clause is false. Round-36's report already recorded the S171 corrupt id/class
cells and the 37-vs-38 summary understatement; the round-37 lesson inherited the wrong phrasing.
Status-neutral for the frozen C1/C2 counters (neither reads that line).

**F2 — `S145` is an overloaded token in round 39.** The register's tabi slice row `S145` is
`draft-ietf-httpbis-rfc6265bis-13` (round-23's id map: staged S145 → lane **S102**, where that
document sits today), while round 39's planned lane-registry `S145` is the `proc_pid_net(5)` man
page (`claims.json` C1 `source`; `corpus/knowledge/playwright-firefox-session-bound-tcp-round-39.md:1`).
No registry collision: `corpus/SOURCES.md` has 144 contiguous rows S001–S144 and no S145 row yet, so
the next append-only id is free — but `ScoutQuarantine05` adjudicates register-S145
(`rfc6265bis-13`) while the claims cite S145 as the proc(5) man page. Same namespace skew round-23
and round-36 already documented (register ids are not lane-registry keys: 19/38 slice ids absent
from the registry, the rest label collisions with 0/38 source-identity matches).

**F3 — the slice predicate is positional, not schema-checked** (see the injected controls above).

**F4 — register self-inconsistency re-confirmed, unchanged.** `## Totals` declares 194 rows / 324
ABSENT quotes while the file holds 303 data rows (194 checked + 109 never-checked); the By-lane
table's `tabi = 37` counts only the checked section — recomputation shows `declared == "## Rows"
count` for all 19 lanes, so the omission is uniform, not tabi-specific.

## Touched surfaces

Read-only: the register (sibling `shokuknow` repo — `git status --porcelain` on that path empty),
`corpus/SOURCES.md`, `corpus/lessons/round-{22,23,27,35,36,37,38}*.md`, prior-round assimilation
artifacts, `.ufo/waves/round-39/claims.json`, `.ufo/waves/round-39/{w1-spec.json,gen-w1-spec.py}`.
Git read-only (`status`, `ls-files`). No git/jj mutation, no commit/push, no spawn, no browser, no
network fetch, no pacman, no tool install. Written: this seat directory and this file only. Scratch
root `/fast/scratch/hyaku/tabi-r39/ExecQuarantineSlice/` removed after the evidence was copied in.

VERDICT finding — the complete tabi quarantine slice re-derives to **38 rows** (37 `payload-absent` +
1 `unreachable` S171) over the byte-identical register (`5afe1810…`, unchanged), with **no summary
row included** and **every data row carrying an S-id** (37 pure tokens; S171's cell has a stray
trailing backtick and an anchored `^S[0-9]+$` variant would silently drop it to 37) — but the
committed round-37 spot-check mis-states the slice as "all `payload-absent`" (F1) and `S145` denotes
two different documents inside round 39 (F2).
