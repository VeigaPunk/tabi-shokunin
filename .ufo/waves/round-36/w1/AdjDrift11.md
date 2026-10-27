# AdjDrift11 — C1 drift-verification chunk (tabi round 36, w1)

Seat: AdjDrift11 (leaf executor). Chunk: `.ufo/waves/round-36/w1-chunks/AdjDrift11.tsv`, 20 rows.
Scope executed: independent re-derivation of the audit status of those 20 ledger rows from git objects only,
compared against the committed ledger `corpus/adjacency-screen-drift.tsv`.

## Verdict

**VERDICT ok — 20/20 rows agree with the committed ledger, 0 mismatches.**

All 20 rows are `kumitate-shokunin@8d557f85312de4fcc82e09ff735d21436bc3746d:corpus/knowledge/kimi-skills-plugins.md:<line>`
(lines 224, 225, 230, 232, 235, 236, 238, 239, 241, 242, 243, 244, 247, 249, 256, 257, 258, 259, 260, 261).
Every derived status is `unchanged`; every committed ledger status is `unchanged`.

## Method (assignment rules, no counter executed)

Frozen inputs read first:
- `.ufo/waves/round-36/claims.json` (C1 predicate, derivation definition, kill rule).
- `.ufo/waves/round-36/baseline/c1-delta-pins.json` → `kumitate` delta head **H = d23892ad44b41e1af63b3edb949d265ca1dd812d**.

Per row: `git -C /home/vgpnk/Projects/shokunin/<lane>-shokunin show <pin>:<path>`, take line `<line>`, trim → CITED.
Then `git show <H>:<path>`; compare line `<line>` trimmed: equal → `unchanged`; else look for a head line whose
trimmed text equals CITED → `moved :N` (all such N); none → `stale`. Pin file/line absent → `stale: pin line absent`;
head file absent → `stale: head file absent`. Every git call ran with `GIT_NO_REPLACE_OBJECTS=1` and
`-c core.commitGraph=false`, `-C <repo>` named explicitly, read-only (`show`, `rev-parse`, `cat-file`,
`merge-base --is-ancestor`, `rev-list`). No mutating git command was run anywhere.

Exact commands: `w1/AdjDrift11/commands.txt`. Derivation driver `w1/AdjDrift11/derive.py` (copy of the scratch
driver; the scratch root has been deleted) with its full per-row stdout/stderr in
`w1/AdjDrift11/derive.stdout-stderr.log`; the machine-readable result is `w1/AdjDrift11/receipt.tsv`.

## Independently established facts (retained evidence)

1. Both revisions resolve as commits in `kumitate-shokunin`; the pin is an ancestor of the delta head with
   12 commits between them (`rev-list --count 8d557f85..d23892ad` = 12), so the lane is genuinely drifted
   while the cited file need not have changed.
2. The cited file's blob id is **identical** at pin and delta head:
   `3fd95114525f654ab1624ce4a9a17c63da1038b8` at both `8d557f85:…` and `d23892ad:…`. The file is byte-identical,
   so `unchanged` for all 20 lines is over-determined (not an artefact of a trim or off-by-one rule).
3. Line counts agree at both revisions: 581 newline-terminated lines (582 entries when the trailing empty string
   after the final `\n` is counted), so every assigned line index is in range in both blobs.
4. Per-line md5 of the trimmed text at each assigned index is equal pin-vs-head for all 20 indices (EQ ×20).
   Spot raw confirmation: line 230 is `` `name: kimi-webbridge` and `version: "2.0.26"` at the re-open. `` at both
   revisions; line 261 is the `site-exploration.md` hash row at head.
5. Relocation ambiguity is absent: each cited text occurs exactly once in the head blob (`grep -Fxc` = 1 for all 20),
   so the `moved` branch could not have been triggered by a second occurrence either.
6. Ledger key validity: all 20 refs occur exactly once as rows in `corpus/adjacency-screen-browser.tsv` (the drift
   pool source) and exactly once in `corpus/adjacency-screen-drift.tsv` (no duplicate audit rows for these refs).
   The committed drift ledger has 308 lines = header + 307 data rows, matching C1's "307 screen rows cite drifted lanes".

## Per-row results

`receipt.tsv` columns: `sibling_ref`, `my-status`, `my-note`, `ledger-status`, `agree|MISMATCH`.
All rows: derived `unchanged` (`same text at same line`), ledger `unchanged`, `agree`.

| line | cited text (trimmed, pin = head) | derived | ledger |
|---|---|---|---|
| 224 | `` `find ~/.kimi-code/skills/kimi-webbridge -type l` → 0 links, and `` | unchanged | unchanged |
| 225 | `` `stat -c '%F %s %a %y inode=%i' ~/.kimi-code/skills/kimi-webbridge` → `` | unchanged | unchanged |
| 230 | `` `name: kimi-webbridge` and `version: "2.0.26"` at the re-open. `` | unchanged | unchanged |
| 232 | `` Frontmatter of `~/.kimi-code/skills/kimi-webbridge/SKILL.md` (193 lines / 19437 B, `` | unchanged | unchanged |
| 235 | `` - `~/.kimi-code/skills/kimi-webbridge/SKILL.md:2` — `name: kimi-webbridge` `` | unchanged | unchanged |
| 236 | `` - `…SKILL.md:3` — `description: \|` (a **literal** `` | unchanged | unchanged |
| 238 | `` - `…SKILL.md:4` — the description text opens `` | unchanged | unchanged |
| 239 | `*"Kimi Browser Extension（Kimi 浏览器扩展，原 Kimi WebBridge）lets AI control the` | unchanged | unchanged |
| 241 | `` - `…SKILL.md:5` — `metadata:` `` | unchanged | unchanged |
| 242 | `` - `…SKILL.md:6` — `  version: "2.0.26"` `` | unchanged | unchanged |
| 243 | `` - `~/.kimi-code/skills/kimi-webbridge/SKILL.md:9` — the title line `` | unchanged | unchanged |
| 244 | `` `# Kimi Browser Extension (formerly Kimi WebBridge)` `` | unchanged | unchanged |
| 247 | `` `kimi-webbridge` while its own title and description say **Browser Extension**. The `` | unchanged | unchanged |
| 249 | `` `~/.kimi-webbridge/bin/kimi-webbridge` carries the same `2.0.26` string (found by the round-40 `` | unchanged | unchanged |
| 256 | `` \| `~/.kimi-code/skills/kimi-webbridge/SKILL.md` \| 19437 \| `600` \| `defba946e6693fd4` \| `` | unchanged | unchanged |
| 257 | `` \| `…/references/operations.md` \| 5911 \| `644` \| `7f60c9811cf2c875` \| `` | unchanged | unchanged |
| 258 | `` \| `…/cli-creator/companion-skill-template.md` \| 2511 \| `644` \| `f17d70fc178b5070` \| `` | unchanged | unchanged |
| 259 | `` \| `…/cli-creator/go-layout.md` \| 4907 \| `644` \| `89cbfb5127646ffb` \| `` | unchanged | unchanged |
| 260 | `` \| `…/cli-creator/login-handling.md` \| 1436 \| `644` \| `fd6aa463dfd25fbb` \| `` | unchanged | unchanged |
| 261 | `` \| `…/cli-creator/site-exploration.md` \| 4389 \| `644` \| `d7cdeb173add3dd5` \| `` | unchanged | unchanged |

Summary line in `receipt.tsv`: `# AdjDrift11: 20 rows, 0 mismatches`.

## Risks / limits of this chunk

- Coverage shape: all 20 rows come from one lane and one file, and that file's blob is unchanged across the delta.
  This chunk therefore exercises the `unchanged` class only; it cannot confirm or refute the `moved` class
  (C1's three kaidoku `SKILL.md` relocations 585→748, 621→784, 652→815) or any `stale` row — those refs live in
  other seats' chunks. A `moved`/`stale` mis-audit is not detectable from this chunk.
- Because the blob is identical, a rule defect in trim/normalisation or line indexing would not surface here;
  what this chunk does establish positively is that the ledger's 20 statuses equal the honest derivation and that
  these refs are valid, unique drift-pool keys.
- No frozen counter was executed (leaf scope, and the parent owns post-integration gates); this is an independent
  derivation, not a `c1-adjacency-sweep-v4.mjs` run, so it does not itself verify the C1 predicate.
- Only the status column was compared, per the assignment; the ledger `note` column (`-` for these rows) is not
  evaluated — `-` is the allowed note form for `unchanged`.

## Files written (all inside the seat dir)

- `.ufo/waves/round-36/w1/AdjDrift11/receipt.tsv` — 20 derived rows + summary line.
- `.ufo/waves/round-36/w1/AdjDrift11/derive.py` — the derivation driver (reproducible, read-only).
- `.ufo/waves/round-36/w1/AdjDrift11/derive.stdout-stderr.log` — per-row cited text, head length, derived status, ledger status.
- `.ufo/waves/round-36/w1/AdjDrift11/commands.txt` — exact git/derivation commands.
- `.ufo/waves/round-36/w1/AdjDrift11/report.md` — this report.
- `.ufo/waves/round-36/w1/AdjDrift11.md` — identical copy (both report paths named by the seat spec).

Tools installed/upgraded: none (python3 and git already present; no pacman, no network).

VERDICT ok — 20/20 rows agree with the committed ledger; 0 mismatches; no finding for C1 from this chunk.
