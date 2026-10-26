# AdjKumitate1 — tabi round 35, wave w1, C1 chunk (17 kumitate candidates)

## Verdict

All 17 candidate lines in my chunk — every one of them from
`kumitate-shokunin@8d557f85312de4fcc82e09ff735d21436bc3746d:corpus/knowledge/kimi-skills-plugins.md`
— are dispositioned as screen rows: 14 `same-surface` on the already-verified map surface
`kimi-webbridge-plugin-internals` (map row 10) and 3 `not-browser-sense` (`:218` heading, `:224`/`:225`
filesystem identity probes). I propose **zero map rows and zero DECL lines**, because no candidate line
states kumitate's own side of any unmapped browser surface: the frozen counter's `SIDE` regex matches no
candidate line except `:247`, whose only hit is the possessive `its own title` (not an ownership
statement), and the file's own boundary clause at `kimi-skills-plugins.md:318-321` routes the daemon, the
browser-extension payloads and the CLI workflow out of its scope and to tabi — the split row 10 already
maps. The frozen counter at my clone commit `d0b5c608145f2cc64ee279117f6275d81fcb62a2` reads adjacency
`clean` (16 rows, 16 verified, 0 findings), `screenFindings` `[]`, my 17 keys absent from
`unaccountedKeys`; lane-wide it reads `unaccounted 366, newMapped 0` because the remaining 366 candidates
belong to other seats' chunks and no new rows exist yet anywhere at my commit. **This chunk contributes no
`newMapped`; the C1 target must be carried by chunks whose lines actually state a sibling side.**

## Evidence

### Reads (all git objects, read-only, no lane write)

```
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 8d557f85…:corpus/knowledge/kimi-skills-plugins.md   # 581 lines
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 8d557f85…:PROVINCE.md                                # K1-K5 band
```

Decisive sibling bytes:

- `kimi-skills-plugins.md:3-8` — the document is kumitate's census of *the skills and plugins plane* of
  Kimi Code CLI (`~/.kimi-code/skills/`, `~/.kimi-code/plugins/installed.json`, the managed plugin).
- `kimi-skills-plugins.md:224-225` — "This member is a plain directory, not a symlink and not a second view
  of the managed plugin tree" (`find … -type l` → 0 links; `stat … inode=95866022`).
- `kimi-skills-plugins.md:269-286` — §"Relation to the managed plugin tree — a different, older install,
  not a copy": the `skills/` copy is a separate install (19437 B, `2.0.26`) from the plugin copy
  (11880 B, `1.11.3`), cross-tree inode intersection 0.
- `kimi-skills-plugins.md:318-321` — "Plugin internals — the daemon, the browser-extension payloads and the
  CLI workflow — are **out of this note's scope**; they belong to
  `tabi-shokunin/corpus/knowledge/webbridge-plugin-anatomy.md` (the K-block boundary clause routes
  `plugins/managed/kimi-webbridge` internals to tabi)." This is the sibling's own side of the split map
  row 10 records (`kumitate SCORECARD.md:1556` ↔ `tabi PROVINCE.md:6`).
- `kimi-skills-plugins.md:250` — "the daemon itself is tabi's ground, not described here" (line 250 itself
  names tabi, so it is not a candidate; the attribution half `:249` is, and it screens `same-surface`).
- tabi's own `corpus/knowledge/webbridge-plugin-anatomy.md:12-14,52-58,214` documents the *plugin* copy's
  SKILL.md frontmatter `name`/`description` (`:2-4`) and `metadata.version` (`:5-6`) plus file
  bytes/digests — the same documentation surface the 14 `same-surface` rows sit on.

### Decision-rule application (`SKILL.md:2861-2881`, asked in order)

1. Browser craft at all? `:218` (a bare heading), `:224` (symlink count), `:225` (stat format) are
   filesystem facts whose only browser-ground token is the directory name → `not-browser-sense`. The
   remaining 14 are about the webbridge skill artifact → step 2.
2. Does a verification-passing map row own that surface for this sibling? Yes: row 10
   `kimi-webbridge-plugin-internals` (kumitate, `split-declared`, verified 16/16 at the baseline). The 14
   lines are kumitate-side facts (frontmatter keys/values, title, rename, version, digest, inventory) inside
   that answered split → `same-surface`; the surface cell repeats `kimi-webbridge-plugin-internals`.
3-4. Not reached for those 14; and never reached for anything as a *map* row: no candidate carries a
   `SIDE` word, so every split-declared draft would be refused `n4-split-quote-states-no-side`, and no
   ruling / fleet L0 line / tabi refusal names these lines (`ruled` / `contested-open` / `refused-route`
   have no truthful ref). I did not convert the gap into a forged row (QUALITY 88, 97).

### Commands and exit codes

```
# clone at the freeze, detached
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"        # exit 0
git -C "$S/clone" checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83  # exit 0
git -C "$S/clone" rev-parse HEAD   -> a4bfef0f75027c915e715649950b1d46dcb33d83
git -C "$S/clone" rev-parse --show-toplevel -> /fast/scratch/hyaku/tabi-r35/AdjKumitate1/clone

# ledger written in the clone only: corpus/adjacency-screen-browser.tsv (header + 17 rows)
git -C "$S/clone" add corpus/adjacency-screen-browser.tsv
git -C "$S/clone" -c user.name=AdjKumitate1 -c user.email=AdjKumitate1@scratch.local \
    commit -q -m "r35 w1 AdjKumitate1: C1 screen ledger for 17 kumitate kimi-skills-plugins candidates"
    # exit 0, HEAD d0b5c608145f2cc64ee279117f6275d81fcb62a2

node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs \
    --rev d0b5c608145f2cc64ee279117f6275d81fcb62a2 \
    --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json       # exit 1 (predicate false)
```

Counter output (`counter-check.json`), verbatim fields:

```
schema      tabi-r35-c1-adjacency-sweep-v3
rev         d0b5c608145f2cc64ee279117f6275d81fcb62a2
adjacency   {"verdict":"clean","rows":16,"verified":16,"findings":0}
candidates  383   priorCandidatesSkipped 22
mapped 0   screened 17   unaccounted 366
newMapped 0      newMappedRows []      newRowRefusals []
screenFindings []
predicate   false
perLane.kumitate 66
```

Key-level check (independent of the aggregate): of my 17 keys, `0` appear in `unaccountedKeys`; all 17 are
in the ledger with `screenFindings` `[]`. Lane-wide `unaccounted 366` is the untouched remainder of the 383
(other chunks); `newMapped 0` is expected — I added no map row, and no other seat's rows exist at my
commit.

## Findings / notes for L1

1. **No new rows from this chunk.** All 17 kumitate candidates are already-answered surface or non-craft;
   the wave's `newMapped >= 2` has to come from chunks whose sibling lines state a side. My chunk's
   mechanical evidence for that: `SIDE` matches no candidate line except the lexical `its own title` at
   `:247`.
2. **Surface reading to double-check at integration.** The 14 `same-surface` rows cite
   `kimi-webbridge-plugin-internals` for facts about the *skills* copy (a different install from the
   managed plugin per `:269-286`). My ground is the sibling's own clause `:318-321` routing "the
   browser-extension payloads" (the SKILL.md frontmatter/title/version/digests) to tabi, plus row 10's
   split. If a wave-2 attack reads the skills copy as outside the plugin surface, the fallback honest
   reading for `:232,235,236,238,239,241,242,243,244,247,256` is the same split applied to the payload
   copy; `:6,230,249` name the plugin path or the daemon and do not depend on that reading.
3. **Precedent consistency.** `corpus/adjacency-screen-skill.tsv:19-24` already screens this same file at
   `:250,278,320,321,324` as `same-surface kimi-webbridge-plugin-internals`; my `:249` row is the
   attribution half of the `:249-250` sentence whose second half is precedent-19. No key of mine appears in
   either existing ledger (`adjacency-screen.tsv`, `adjacency-screen-skill.tsv`), so there is no duplicate
   ref.
4. No tool installs, no network fetches, no browser launches, no builds/linters run (lane rule). Scratch
   tree `/fast/scratch/hyaku/tabi-r35/AdjKumitate1` (clone inside) deleted after receipts were copied.

## Deliverables

- `.ufo/waves/round-35/w1/AdjKumitate1/screen.tsv` — 17 rows, 5 TAB columns, no header
- `.ufo/waves/round-35/w1/AdjKumitate1/rows.tsv` — empty (no map rows)
- `.ufo/waves/round-35/w1/AdjKumitate1/decl.md` — no DECL lines, with the mechanical reason
- `.ufo/waves/round-35/w1/AdjKumitate1/l0.txt` — empty (no contested-open)
- `.ufo/waves/round-35/w1/AdjKumitate1/decisions.md` — key | decision | sibling↔tabi ground
- `.ufo/waves/round-35/w1/AdjKumitate1/counter-check.json` — raw frozen-counter output
- clone commit to cherry-pick: `d0b5c608145f2cc64ee279117f6275d81fcb62a2` (adds only
  `corpus/adjacency-screen-browser.tsv`)
