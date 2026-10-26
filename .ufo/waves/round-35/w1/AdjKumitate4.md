# AdjKumitate4 — C1 dispositions, round-35 w1 (kumitate chunk)

**Verdict.** All 15 candidate lines in `.ufo/waves/round-35/w1-chunks/AdjKumitate4.tsv` are dispositioned as screens: 12 `same-surface` on the one verified kumitate surface (`kimi-webbridge-plugin-internals`, map row citing kumitate `SCORECARD.md:1556` at pin `1770305f…` — "internals route to **tabi**" — against tabi `PROVINCE.md:6` at `a4bfef0f…` — "**Owns (surfaces):** the kimi-webbridge plugin"), and 3 `not-browser-sense` (`:471` a log-absence row whose only hit is the word `webbridge` inside a grep pattern, `:574` a note-structure sentence announcing the user-skill section, `:581` a child-count census of `~/.kimi-code/skills/`). **No map row is proposed**: no candidate in this chunk carries a side-stating word (SIDE) on a surface the verified row does not already own — only `:415` matches SIDE, through the vacuous possessive "own schema URL" in the plugin-manifest fact the existing split already answers, and `:486` carries browser ground but no SIDE word at all, so no truthful `split-declared` row exists (n4) and no `ruled`/`contested-open`/`refused-route` venue applies. Validation in a scratch clone at the freeze + one commit: `ADJACENCY verdict=clean rows=16 verified=16`, `screenFindings=0`, all 15 keys accounted (`mineMissing: []`), `newMapped=0`, `newRowRefusals=[]`, counter exit 1 (predicate not met — expected for one chunk; 368 of the 383 lane-wide candidates remain for the other seats).

## Evidence (commands, exit codes)

Scratch: `HYAKU_SCRATCH=/fast/scratch/hyaku`, `S=$HYAKU_SCRATCH/tabi-r35/AdjKumitate4`, `TMPDIR=$S/tmp`. Clone: `git clone --shared …/tabi-shokunin "$S/clone"` then `git checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83`; `git rev-parse HEAD` printed the freeze and `git rev-parse --show-toplevel` printed `$S/clone` (exit 0). All git mutations were `-C "$S/clone"` with `-c user.name=AdjKumitate4 -c user.email=AdjKumitate4@scratch.local`.

1. Sibling reading (read-only): `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 8d557f85312de4fcc82e09ff735d21436bc3746d:PROVINCE.md` (exit 0) and `…:corpus/knowledge/kimi-skills-plugins.md` lines 1-40, 408-450, 465-510, 556-581 (exit 0). The file is kumitate's census of the Kimi skills/plugins plane; the only managed plugin it covers is `kimi-webbridge` (`~/.kimi-code/plugins/managed/kimi-webbridge/`), the plugin `PROVINCE.md:6` owns as primary substrate documentation.
2. Baseline counter (sanity against `baseline/c1-J1-do-nothing.json`):
   `TMPDIR=$S/tmp node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --rev a4bfef0f75027c915e715649950b1d46dcb33d83 --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json` → exit 1, `adjacency clean 16/16`, `candidates 383`, `mapped 0`, `screened 0`, `unaccounted 383`, `newMapped 0`, `screenFindings 0` — matches the frozen baseline.
3. Quote validation (`$S/gen.mjs`, exit 0): every screen quote checked against the sibling line at the pin with the counter's own rule — `goodQuote(q) && text.includes(q)`, or `q === text.trim() && words(q) <= 25` for short lines (the path/Sources lines are whole trimmed lines of 1-2 words; `:415` is a 4-word substring; the rest are 4-14-word substrings or whole lines). No tab/newline in any field; `same-surface` rows name only `kimi-webbridge-plugin-internals`, non-`same-surface` rows carry `-`.
4. Commit in the clone (toplevel asserted equal to `$S/clone`): `git -C "$D" … commit -q -m "round-35 C1 scratch: 15 kumitate kimi-skills-plugins screens"` → `4949856363e9fd777395caee7c531133a33c4575`. No append to `SKILL.md` or `corpus/adjacency.tsv` (0 map rows ⇒ 0 DECL lines, nothing to substitute).
5. Counter at the scratch commit:
   `TMPDIR=$S/tmp node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --rev 4949856363e9fd777395caee7c531133a33c4575 --repo "$D" --fleet /home/vgpnk/Projects/shokunin --json` → exit 1; `adjacency {verdict:"clean", rows:16, verified:16, findings:0}`, `candidates 383`, `mapped 0`, `screened 15`, `unaccounted 368`, `newMapped 0`, `screenFindings []`, `newMappedRows []`, `newRowRefusals []`, and `unaccountedKeys` contains none of my 15 keys.
6. Lane hygiene: `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain --untracked-files=no` → 0 lines (no tracked lane file touched; I wrote only the output dir and the report).

### File:line anchors used

- Sibling side of the split: `kumitate-shokunin@1770305fae20826b39905a8251ddeca6b4957ac4:SCORECARD.md:1556` — "internals route to **tabi**, the `config.toml` REA MCP spawn key to **kaidoku**,"
- Tabi side: `PROVINCE.md:6` at `a4bfef0f75027c915e715649950b1d46dcb33d83` — "**Owns (surfaces):** the kimi-webbridge plugin"
- Decision rule applied in order: `SKILL.md:2861-2881`; bars `corpus/QUALITY.md:545-556` (87-91), `:670-675` (97).
- Frozen definitions: `.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs:1-123` (BG/SIDE, screen rule, newMapped n1-n4); gate contract `scripts/check-adjacency.mjs:1-170`.
- Candidate lines (kumitate pin `8d557f85…`, `corpus/knowledge/kimi-skills-plugins.md`): 415, 432, 433, 442, 471, 486, 502, 503, 504, 505, 566, 569, 570, 574, 581.

### Disposition map

| line | disposition | one-line ground |
|---|---|---|
| 415 | screen same-surface | plugin manifest row (`kimi.plugin.json`, `installed.json`) — internals split to tabi |
| 432 | screen same-surface | plugin skill rendered under `### Extra` with its SKILL.md path — plugin internals |
| 433 | screen same-surface | path half of :432 — plugin SKILL.md |
| 442 | screen same-surface | collision inference about the kimi-webbridge skill — plugin identity; tie-break is Kimi-plane |
| 471 | screen not-browser-sense | log-absence row; `webbridge` only inside the grep pattern |
| 486 | screen same-surface | plugin daemon endpoint + CDP/extension transport; endpoint routed to kama |
| 502 | screen same-surface | Sources: `installed.json` + managed plugin dir |
| 503 | screen same-surface | Sources: plugin manifest path |
| 504 | screen same-surface | Sources: plugin SKILL.md path |
| 505 | screen same-surface | Sources: plugin `references/operations.md` path |
| 566 | screen same-surface | errata quotes the no-collision inference about the kimi-webbridge skill |
| 569 | screen same-surface | user-scope half of the observed name collision with the plugin skill |
| 570 | screen same-surface | plugin-scope `SKILL.md:2` half of the same collision |
| 574 | screen not-browser-sense | note-structure sentence announcing the user-skill section |
| 581 | screen not-browser-sense | child count of `~/.kimi-code/skills/`; `kimi-webbridge` is one directory name |

## Deliverables

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKumitate4/screen.tsv` — 15 rows, no header, 5 columns each (12 `same-surface`, 3 `not-browser-sense`).
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKumitate4/rows.tsv` — empty (0 map rows; no DECL placeholders).
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKumitate4/decl.md` — states no DECL lines, with the reason.
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKumitate4/decisions.md` — 15 key | disposition | grounded-sentence rows, plus the no-map-row justification.
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKumitate4/counter-check.json` — full counter JSON at `4949856363e9fd777395caee7c531133a33c4575`.
- `l0.txt` — not written (no `contested-open` row).

## Out of scope / known limits

- Leaf seat: no subagent dispatch, no lane edits, no builds/linters. No tools installed, no network fetch, no browser launched, no git mutation outside `$S/clone`.
- The counter judges form, not overlap semantics (claims `feasibilityDisclosed`): the 12 `same-surface` reasons and 3 `not-browser-sense` reasons are the wave-2 attack surface; each `same-surface` row leans on kumitate's own split line (`SCORECARD.md:1556`), so a judge that reads the collision errata (`:566`/`:569`/`:570`) as Kimi-plane census rather than plugin identity would move those three rows, not the manifest/Sources rows.
- `unaccounted 368` in my clone is expected: this clone carries only my chunk's ledger; the lane-wide `unaccounted 0` depends on the sibling Adj* seats' chunks and the L1 merge. `newMapped 0` from this chunk is the honest result — the C1 target's `newMapped >= 2` must come from other chunks.
- Scratch dir `/fast/scratch/hyaku/tabi-r35/AdjKumitate4` deleted after copying receipts (deliverables above are copies, not links).
