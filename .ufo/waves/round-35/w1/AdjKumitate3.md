# AdjKumitate3 — C1 build, kumitate chunk (round 35, w1)

## Verdict

All 17 candidate lines in `.ufo/waves/round-35/w1-chunks/AdjKumitate3.tsv` — every one of them a line of
`kumitate-shokunin@8d557f85312de4fcc82e09ff735d21436bc3746d:corpus/knowledge/kimi-skills-plugins.md` — are
**screened `same-surface`** on the surface `kimi-webbridge-plugin-internals` (verified map row 9, sibling
`kumitate`), and **no map row is proposed**: the section's only side-stating line (318-321, "Plugin internals … are
**out of this note's scope**; they belong to `tabi-shokunin/corpus/knowledge/webbridge-plugin-anatomy.md`") names
tabi and is therefore excluded from the candidate set by the counter's `TABI` filter, while the 17 candidates
themselves are kumitate's census facts about the plugin package (paths, layout, modes, manifest keys, install
record, frontmatter, declared tool table) — the sibling's own side of the already-mapped split, which kumitate's
own line 324 concedes ("the plugin copy's size, digests, version 1.11.3 and install record are tabi's ground").
Frozen counter at my scratch commit: **adjacency clean (16 rows, 16 verified, 0 findings), screenFindings `[]`, my
17 keys absent from `unaccountedKeys`**; lane-wide `unaccounted 366` and `newMapped 0` remain (the other 366
candidates belong to sibling chunks), so `predicate false` at this commit is expected and is not a claim about my
slice.

## Evidence (commands run, exit codes)

Scratch: `HYAKU_SCRATCH=/fast/scratch/hyaku`, `S=$HYAKU_SCRATCH/tabi-r35/AdjKumitate3`, `TMPDIR="$S"` passed to the
counter. Scratch tree deleted after the receipts were copied (`rm -rf -- "$S"`, exit 0).

1. Clone at the freeze — exit 0:
   `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"` then
   `git -C "$S/clone" checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83`;
   `git -C "$S/clone" rev-parse HEAD` → `a4bfef0f75027c915e715649950b1d46dcb33d83`;
   `git -C "$S/clone" rev-parse --show-toplevel` → `$S/clone`.
2. Candidate bytes verified against the sibling pin — for all 17 keys the chunk text equals the pinned line after
   trimming (4 lines carry leading indentation: 337, 338, 343 JSON body; 371 tree line):
   `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 8d557f85…:corpus/knowledge/kimi-skills-plugins.md`
   piped to `awk 'NR>=296 && NR<=410'`. BG and SIDE re-run over the 17 texts: BG true on all; SIDE true only on
   315 ("owned" — a basename owned by two skill members, not a lane side) and 381 ("own" — "the plugin's own
   manifest"); no line carries a side-stating word about browser ground.
3. Pristine counter at the freeze (pre-screen control) — exit 1, saved as `counter-check-prefreeze.json`:
   `node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --rev a4bfef0f75027c915e715649950b1d46dcb33d83
   --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json`
   → `adjacency {verdict clean, rows 16, verified 16, findings 0}`, `candidates 383`, `mapped 0`, `screened 0`,
   `unaccounted 383`, `screenFindings []`, all 17 of my keys unaccounted (perLane kumitate 66).
4. Screen ledger written to the clone only (`corpus/adjacency-screen-browser.tsv`, header + 17 rows), each row
   validated against the counter's own screen rule (5 columns, reason in the closed set, quote a verbatim
   substring with 4..25 words / ≥20 non-space chars or the whole trimmed line, no tabs beyond the separators):
   17 rows, 0 violations. `SKILL.md` and `corpus/adjacency.tsv` were **not** touched — zero map rows means zero
   declarations to append (the item's append step assumed rows).
5. Commit in the scratch clone — exit 0, toplevel asserted first:
   `git -C "$S/clone" add corpus/adjacency-screen-browser.tsv` then
   `git -C "$S/clone" -c user.name=AdjKumitate3 -c user.email=AdjKumitate3@scratch.local commit -q -m …`
   → `ed99af3ed8e658308d2c850ab565bfc6ecfcccfa`; `git status --porcelain` empty afterwards.
6. Frozen counter at that commit — exit 1 (predicate not met), `counter-check.json`:
   `node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --rev ed99af3ed8e658308d2c850ab565bfc6ecfcccfa
   --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json`
   → `adjacency {verdict clean, rows 16, verified 16, findings 0}`; `candidates 383`; `mapped 0`;
   `screened 17`; `unaccounted 366`; `newMapped 0`; `newMappedRows []`; `newRowRefusals []`;
   `screenFindings []`; **my 17 keys: 0 in `unaccountedKeys`**.

## Deliverables

- `.ufo/waves/round-35/w1/AdjKumitate3/screen.tsv` — 17 screen rows, no header
  (sha256 `151ec8d10bbc992cc2decb622471755399f115f5d96246adf6ef368beac35ca2`)
- `.ufo/waves/round-35/w1/AdjKumitate3/rows.tsv` — empty (0 map rows)
- `.ufo/waves/round-35/w1/AdjKumitate3/decl.md` — no DECL lines
- `.ufo/waves/round-35/w1/AdjKumitate3/decisions.md` — 17 rows, key | disposition | both-sides sentence
  (sha256 `3b868ee080ec8c08767c76714a168b52efae460548c1adbc6695571a1f9c493f`)
- `.ufo/waves/round-35/w1/AdjKumitate3/counter-check.json` — frozen counter output at `ed99af3e`
- `.ufo/waves/round-35/w1/AdjKumitate3/counter-check-prefreeze.json` — pre-screen control at the freeze
- `l0.txt` — not produced: no `contested-open` row, so nothing for L1 to file.

## Findings for the L1 / closure

1. **This chunk yields 0 of the ≥2 newMapped rows.** No line here states kumitate's side of a tabi surface; the
   side-stating line in the same section (318-321) is excluded by the counter's `TABI` filter, and row 9 already
   declares that split. Forcing a row from 315 ("now owned by two members", the only BG+SIDE match) would be the
   round-33 mislabel red state (QUALITY 88) and would fail QUALITY 97 (the sibling does not state a side of a
   *lane* split there — the "ownership" is two skill members sharing a basename).
2. **Attackable reading, disclosed before attack:** I read row 9's surface `kimi-webbridge-plugin-internals` as
   covering the whole plugin *package* — including the `installed.json` registry record (337/338/343) and the
   skill-name-collision lines (303/304/315). A wave-2 critic can argue those three groups are the Kimi *registry /
   skills plane* (kumitate's own K-block ground) rather than the plugin surface, which would make them
   `no-claim-declared` or `not-browser-sense` screens instead — same accounting outcome (screened), different
   reason. My ground for `same-surface` is kumitate's own line 324, which assigns the plugin copy's size, digests,
   version and install record to tabi's ground: the quoted registry values are exactly that record.
3. The 17 screens pass the counter's mechanical screen rule, but QUALITY 87's warning stands: screening is weaker
   evidence than a map row, and my chunk contributes only screens. The lane's `unaccounted 0` and `newMapped ≥ 2`
   must come from the other 366 candidates.

## Out of scope / not done

- No edits to lane tracked files, the lane git index, lane jj state, the fleet repo, sibling lanes or
  `/home/vgpnk/Projects/shokuknow`; all writes went to the output dir and `$S/clone`.
- No browsers launched, no network fetches, no tool installs or upgrades this seat (so no tool/version/channel
  record to add).
- No builds, linters or formatters of the lane; no subagent dispatch; no `agent://all` messages.
