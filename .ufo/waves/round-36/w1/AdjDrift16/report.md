# AdjDrift16 — independent re-derivation of 7 drift-ledger rows

Round tabi 36 (attempt 1), wave w1, milestone C1 (adjacency), seat AdjDrift16.
Frozen contract read first: `.ufo/waves/round-36/claims.json` (frozen at `2e7b7a8920bff47fae6f75c3d06e48e37767099e`).
Method: derivation from git objects only, per the C1 drift-audit definition (no claim/ledger input beyond the final comparison).

## Inputs

- chunk: `.ufo/waves/round-36/w1-chunks/AdjDrift16.tsv` — 7 rows, all lane `tsukuroi-shokunin`, all pin `a968393c678171f8a5a2907da5015735396da4cc`.
- frozen delta head for `tsukuroi`: **`3629c46a0e787121f1e1d4ccb53bc830e4a7633f`** (`.ufo/waves/round-36/baseline/c1-delta-pins.json`).
- committed ledger compared: `corpus/adjacency-screen-drift.tsv` (lines 302–306, 307–308; each ref appears exactly once — `cut -f1 … | sort | uniq -d` is empty).
- exact commands: `.ufo/waves/round-36/w1/AdjDrift16/commands.txt`.

## Pin / head integrity

- `a968393c…` and `3629c46a…` both resolve as commits; `merge-base --is-ancestor a968393c… 3629c46a…` exits 0 — the pin is a genuine ancestor of the frozen head, so this is a real delta, not a self-comparison.
- The head genuinely moved: `git diff --name-only a968393c… 3629c46a…` lists **3375** changed files. Neither cited file is among them.
- Blob identity across pin, frozen head, and current lane `HEAD` (`768191979457094b7e9993e243fc0d23405bb47a`):
  - `corpus/knowledge/oom-event-plane.md` = `05372dc87ab13ea12f5ef2b61cc56630bd68bfb4` at all three revs.
  - `corpus/knowledge/update-safety-v2.md` = `5ff99454cf9c7cd47aac6deab27323d5883f6e03` at all three revs.
  ⇒ `git diff --stat pin..head -- <both files>` is empty; `unchanged` is confirmed at the line level (spec) and independently at the blob level.

## Per-row derivation (spec: line n trimmed at pin vs head; equal ⇒ unchanged)

| # | sibling_ref | cited text (pin, line n) | my status | ledger | verdict |
|---|---|---|---|---|---|
| 1 | `…:corpus/knowledge/oom-event-plane.md:205` | `- **6 Chromium scopes started** … at 13:08:45.18,` | unchanged | unchanged | agree |
| 2 | `…:corpus/knowledge/oom-event-plane.md:304` | `\| top consumers \| `ps -eo pid,user,rss,pmem,comm --sort=-rss` \| live \| none \| 14:42: kimi 706 MB, …` | unchanged | unchanged | agree |
| 3 | `…:corpus/knowledge/oom-event-plane.md:332` | `\| **everything inside the old session's cgroup tree** … no per-process record exists** …` | unchanged | unchanged | agree |
| 4 | `…:corpus/knowledge/oom-event-plane.md:349` | `\| 6 \| `oom_score_adj` steering \| user workload at +200 (120 tasks), …` | unchanged | unchanged | agree |
| 5 | `…:corpus/knowledge/oom-event-plane.md:386` | `\| Q6 \| Who starts 6 Chromium scopes in the 110 s before event B \| …` | unchanged | unchanged | agree |
| 6 | `…:corpus/knowledge/update-safety-v2.md:59` | `\| 14 \| workload contention \| 75 × `ffmpeg` at 10:51 (`:324-330`) \| no ffmpeg this window; …` | unchanged | unchanged | agree |
| 7 | `…:corpus/knowledge/update-safety-v2.md:230` | `18.88 GiB available, swap 34.25 GiB; process census top: `bash` 26, `chromium` 15,` | unchanged | unchanged | agree |

All 7 cited lines are non-empty after trim (measured lengths 104/146/384/354/156/222/82 bytes), so no `unchanged` verdict here is a vacuous blank-line match.

## Result

`receipt.tsv`: **7 rows, 0 mismatches**, 0 stale, 0 moved. No row needed the head-file search branch (line n at head is byte-equal to the pin-cited line in every case), so there is no relocation-line output to validate for this chunk.

No defects found in the committed ledger for this chunk. Independent corroboration (blob hash equality across `pin`, frozen head and current `HEAD`) means these rows also stay correct if the wave-2 audit reads at the lane tip rather than the frozen head.

## Scope / limits

- Read-only git only; no writes outside `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-36/w1/AdjDrift16/` and the scratch root `/fast/scratch/hyaku/tabi-r36/AdjDrift16/` (deleted at exit). No subagents, no builds/lints/tests (parent owns the gate).
- Tooling: none installed, none upgraded.
- Not evaluated here by design: the other 300 drift rows (peer chunks), the delta pool, and the counter itself — only my 7 assigned rows.

VERDICT ok — AdjDrift16: 7/7 rows re-derived independently from tsukuroi git objects at pin a968393c and frozen delta head 3629c46a; all agree with corpus/adjacency-screen-drift.tsv (0 mismatches, 0 stale, 0 moved).
