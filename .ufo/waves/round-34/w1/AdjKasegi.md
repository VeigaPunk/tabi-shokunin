# AdjKasegi — round 34 w1 (C1 build): kasegi candidate rows 62–64

**Verdict.** All three kasegi candidates that name tabi-adjacent browser ground are now accounted for, and the mapping is a **single new verified map row**, not three: `kasegi`'s external-effect lane drives an *operator-authenticated* browser over CDP 9222 to perform bounty submissions (`corpus/knowledge/mission-control.md:119`, pin `9a10b02f`), which is exactly the class tabi refuses at lane level (C4 third-party consequential, "lane execution refused; approval routes the act to the operator" `SKILL.md:727`; C5 login-required, "session stores never touched" `SKILL.md:728`; `PROVINCE.md:15-19`). Disposition is therefore **`refused-route`** — tabi does not claim authenticated consequential driving, so there is nothing to contest and no second side to split with; the two remaining kasegi lines are the same boundary in roster form (`SKILL.md:267`) and receipt form (`ufo-workspaces.md:272`) and are screened `same-surface` against the new surface `authenticated-consequential-driving`. `split-declared` was unavailable on evidence, not preference: the gate requires a split row's `sibling_quote` to contain `tabi` (`scripts/check-adjacency.mjs:795-803`) and none of the three cited kasegi lines contains that token (`grep -ci tabi` → 0, 0, 0), so the only honest declaration is tabi's own, i.e. `refused-route`. `contested-open` was refused for the same reason a contest must be claimed by both sides: kasegi claims the submission act on its own fleet ground and tabi refuses that act, so `l0.txt` is `none`. At my seat commit the gate is clean (14/14 rows) and the frozen counter reports all three keys accounted, `newMapped` 1 for my row, `screenFindings` 0.

## Evidence

Clone: `/fast/scratch/hyaku/tabi-r34/AdjKasegi/clone`, `--shared` of the lane, detached at `59f1b47aae277e1670e4a824173da8cde7e388ee` (the freeze); seat commit `af7ec475b20f6c4ae988e46122172f1b42d30738` on top of it; `TMPDIR=/fast/scratch/hyaku/tabi-r34/AdjKasegi/tmp`. `git -C "$C" rev-parse --show-toplevel` = `$C` before every mutation.

Sibling side read in context (read-only, `git -C /home/vgpnk/Projects/shokunin/kasegi-shokunin show 9a10b02f…:<path>`), the three candidate lines with neighbourhood:

- `SKILL.md:257-277` — kasegi dispatcher/claim-tag doctrine; line 267: ``Sibling L1s: `fleets/claimer-mission.md` (CDP browser submissions,`` followed by ``operator-authed), `fleets/review-mission.md` (486-item drop/continue/leave``.
- `corpus/knowledge/mission-control.md:109-129` — "## Sibling L1 contracts"; line 118 ``- **`fleets/claimer-mission.md`** — the external-effect lane: operator-``, line 119 `authenticated burnerchrome at CDP 9222 (attach by URL substring, never`, line 120 `steal his tab). Submission queue with per-package field plan; severity at`.
- `corpus/knowledge/ufo-workspaces.md:262-282` — round-9 recovery audit; line 272 `veigapunk, CDP 9222, `submission_verified: true`, 0 mutations) — corroborates` (a `final-audit.json` receipt of three preexisting submissions).

Tabi side (freeze 59f1b47): `PROVINCE.md:15-19` (refuses; "Never performs consequential actions on external sites … observation and operator-approved interaction only"), `SKILL.md:725-728` (approval table C2–C6; C4/C5 as quoted above), `SKILL.md:660-665` (session-material discipline, shape-only), `SKILL.md:756` (A9 row), `SKILL.md:1347` (the never-set list: consequential external acts · session-material content-reads · out-of-province work).

Commands and outcomes (all run in the scratch clone, lane scripts taken from the freeze checkout):

| command | exit | result |
|---|---|---|
| `node scripts/check-adjacency.mjs --at af7ec47… --repo "$C" --fleet /home/vgpnk/Projects/shokunin --json` | 0 | `verdict=clean rows=14 verified=14`, `findings: []` → receipt `check-adjacency.json` |
| `node <lane>/.ufo/waves/round-34/counters/c1-adjacency-sweep-v2.mjs --rev af7ec47… --repo "$C" --fleet /home/vgpnk/Projects/shokunin --json` | 1 (predicate not met at seat level) | `candidates 67`, `mapped 2`, `screened 2`, `unaccounted 63`, `newMapped 1`, `newMappedRows [{row:15, surface:"authenticated-consequential-driving", sibling:"kasegi", disposition:"refused-route"}]`, `adjacency clean 14/14`, `screenFindings []` → receipt `c1-sweep-v2.json` |
| quote checks `grep -cF` against `git show 9a10b02f…:<path> \| sed -n '<line>p'` | 0 (match) | sibling_quote on `mission-control.md:119` → 1; screen quote on `SKILL.md:267` → 1; screen quote on `ufo-workspaces.md:272` → 1 |
| `sed -n '2921p' clone/SKILL.md \| grep -cF <quote>` | 0 | `tabi_quote` → 1, `ruling_quote` → 1, `grep -cw kasegi` → 1 |
| `git show 59f1b47…:SKILL.md \| grep -c "kasegi's claimer lane"` and `… \| grep -c "Round 34 — sibling-overlap declarations"` | 1 (0 matches) | both 0 → the declaration line and its section are absent at the baseline, which is what the counter's new-line clause requires |
| `grep -ci tabi` on each cited kasegi line | grep status 1 each (no match; the loop was `\|\| true`) | 0, 0, 0 → `split-declared` is structurally unavailable (see verdict) |
| map row field count `awk -F'\t'` | 0 | 9 columns; screen ledger rows 5 columns with the exact header |

Exit 1 on the counter is expected and correct for a single seat: the predicate is a lane-level target (`unaccounted 0 AND newMapped >= 3`) that the L1 reaches by integrating the other seats' rows. My contribution is `mapped +1`, `screened +2`, `newMapped +1`, `screenFindings 0`, and the adjacency gate stays clean with the new row added (no collision with the 13 baseline rows; the other seats' rows are not present in this clone, so their verification is theirs and the L1's).

Row as landed (line 15 of `corpus/adjacency.tsv`, 9 TAB columns):

```
authenticated-consequential-driving	kasegi	kasegi-shokunin@9a10b02fe411bb8d9d71aed3b1d3a5949d50d16b:corpus/knowledge/mission-control.md:119	authenticated burnerchrome at CDP 9222 (attach by URL substring, never	SKILL.md:2921	kasegi's claimer lane owns its operator-authed CDP 9222 bounty submissions	refused-route	-	tabi refuses to drive an operator-authenticated browser into a submission act
```

Declaration as landed (`SKILL.md:2916-2921`, after the round-33 wave-2 block):

> ## Round 34 — sibling-overlap declarations (outside PROVINCE)
>
> These lines state this lane's side of overlaps the round-34 sweep found in sibling `SKILL.md` / `corpus/knowledge/` lines (never `PROVINCE.md` again); each new line backs a map row in `corpus/adjacency.tsv` or a screen row in `corpus/adjacency-screen-skill.tsv` and absorbs no sibling ground.
>
> - Authenticated consequential driving: tabi refuses to drive an operator-authenticated browser into a submission act — C4 third-party consequential and C5 login-required route the act out of this province (`SKILL.md:727-728`), session stores stay shape-only (A9, `SKILL.md:662-663`); kasegi's claimer lane owns its operator-authed CDP 9222 bounty submissions (`mission-control.md:119`), and tabi keeps only CDP observation and session-shape reporting.

Screens (fresh `corpus/adjacency-screen-skill.tsv`, header `sibling_ref reason surface quote note`):

- `SKILL.md:267` → `same-surface` `authenticated-consequential-driving`, quote `` `fleets/claimer-mission.md` (CDP browser submissions, `` — a fleet roster entry for the claimer lane, no distinct boundary.
- `corpus/knowledge/ufo-workspaces.md:272` → `same-surface` `authenticated-consequential-driving`, quote `veigapunk, CDP 9222, `submission_verified: true`, 0 mutations` — a `final-audit.json` receipt of submissions made through the same authenticated browser; records outcomes of the mapped practice, claims nothing new.

## Findings

1. **The kasegi ground is one boundary, not three.** `SKILL.md:267` (roster), `mission-control.md:119` (contract) and `ufo-workspaces.md:272` (audit receipt) all describe the same claimer-lane practice on the operator's authenticated browser; mapping a second row off another of these lines would have been surface-splitting, which `check-adjacency.mjs` also blocks per sibling pin (`duplicate_row` would not fire across paths, so the guard is judgement, not code). Depth-2 attack for wave 2: argue that `SKILL.md:267`'s roster line is a set-A-style *census of kasegi's own fleet* (third-party to tabi but first-party to kasegi) and therefore `not-browser-sense` rather than `same-surface`; I chose `same-surface` because the line's only substantive content is the CDP-submission claim itself.
2. **`refused-route` is the load-bearing judgement and rests on tabi's refusal lines, not on a PROVINCE arrow.** Unlike the existing `refused-route` rows (`PROVINCE.md:15-17` arrows to revenger/kaidoku, kake, kagi), tabi's province names no arrow to kasegi. The route here is the C4 gate's own wording — "lane execution refused; approval routes the act to the operator" (`SKILL.md:727`) — with kasegi's claimer lane as the lane that holds the operator's authority for those submissions. If the L1 prefers to keep `refused-route` strictly arrow-backed, the fallback is to screen `mission-control.md:119` `third-lane-report` ("kasegi reports its own claimer lane's operator-authed practice") and lose this seat's `newMapped` contribution; I did not take that path because the practice is a real overlap with tabi's owned CDP/login-session rules, which a screen cannot answer for.
3. **Declared limit.** I did not attack the round-33 frozen forgery battery, the C2 gate, or any other seat's rows; my run of the C1 counter is seat-scoped (`--rev` only reaches this clone's commit, where the other seats' rows are absent). The lane-level predicate (`unaccounted 0`, `newMapped >= 3`) is not met by this seat alone and is not claimed here.
4. **No tabi line was edited, no lane feature, no network.** No fetches: nothing in this assignment needed upstream sources (C1 is a map/screen build against frozen pins). No browser launched, no pacman/uv/npx install, no tool change.

## Deliverables (all under `.ufo/waves/round-34/w1/AdjKasegi/`)

- `rows.tsv` — the new map row with `tabi_ref` as `SKILL.md:DECL1` placeholder.
- `rows.resolved.tsv` — same row with the real landed line (`SKILL.md:2921`), byte-identical to line 15 of the committed map.
- `decl.md` — the section heading and DECL1 bullet, with the tabi-ground citations and the quote roles.
- `screen.tsv` — the two screen rows (5 TAB columns, no header).
- `l0.txt` — `none` (no `contested-open`; the reasoning is in `candidates.md`).
- `candidates.md` — per-candidate table (key | decision | grounded reason) plus why split and contested were refused.
- `patch.diff` — `git show -U0 af7ec47…` (parent `59f1b47…`): SKILL.md +6, `corpus/adjacency.tsv` +1, new `corpus/adjacency-screen-skill.tsv` +3. This is the file to apply for integration; the L1 substitutes the final `tabi_ref` line number if the SKILL.md append lands at a different offset.
- Receipts: `check-adjacency.json` (exit 0), `c1-sweep-v2.json` (exit 1, seat scope), `decl-line.txt` (the exact line 2921 text), `commands.log`.

Report path: `.ufo/waves/round-34/w1/AdjKasegi.md`.
