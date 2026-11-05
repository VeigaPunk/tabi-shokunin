# R66Scribe report — round 66, wave w1, C1 adjacency drafts

Scope: prose drafting only. Two drafts written; no corpus, SCORECARD, LOG, PROVINCE, SKILL, MANIFEST, frozen counter, fleet-root, sibling or git-state write. No commits, no `git add`, no `jj` mutation. No tools installed or upgraded by this seat.

Full report (same content): `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66/w1/R66Scribe/report.md`

## Files
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66/w1/R66Scribe/knowledge-adjacency-live-heads-r66.md` — knowledge entry; provenance trio first.
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66/w1/R66Scribe/gate-rows-c1.md` — Gate rows, `Spot-check: pending (non-author)`.

## Findings
1. Before (committed `v22-live-r66.json`): predicate false, findingCount 40 — head 21, sha 9, lines 8, quote 1, note 1.
2. Re-run at this seat (`node .ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs --repo . --rev 2816adb359a50c2fd83fa975e39f0650aa189984 --fleet /home/vgpnk/Projects/shokunin --snapshot .ufo/waves/round-66/measure/snapshot-live-r66.tsv --json`): exit 1, findingCount 40, predicate False, findings equal to committed; drift now discloses `kengaku-shokunin` (snapshot `00462b596f517cc70528f1773c20eac7dd530bfd`, live `c3f81f72495476db1f4e36706d2855347077fa36`). Re-take the snapshot or record the drift before freeze.
3. Independent python cross-check (`git cat-file -p <head>:<path>`): 25 delta lane rows; 4 at snapshot head; 9 sha and 8 line-count mismatches; bg counts all agree. Matches the meter.
4. Meter reads sibling bytes at the snapshot head (meter line 317), not at the head in each audit reference (kumitate ref `89cbd998` vs snapshot `7218699c`).
5. No after figure exists; placeholders `[L1 to paste]` mark it.

## Commands and exit codes
- `node …c1-adjacency-host-v22.mjs … --json` (lane root): exit 1.
- python counter over the committed findings: exit 0.
- python cross-check via `git -C /home/vgpnk/Projects/shokunin/<lane> cat-file -p`: exit 0.
- `git cat-file -p` reads of kake SKILL.md (d838e744) line 1358, kumitate SCORECARD.md (89cbd998, 7218699c) lines 1723/1885/1898: exit 0.
- `sha256sum` of the frozen meter: exit 0, `4d3a6b589d1c3a795314cc93b2cd481071c70309a957cb54031a6971002d50d5`.
- Scratch `$HYAKU_SCRATCH/tabi-r66/R66Scribe` (default /fast/scratch/hyaku): created, removed by trap.

## Known limits
- The after figure is not measured here; the L1 re-runs the recheck on the frozen state.
- The cross-check is this seat's reproduction and is not committed.
- Decisions in the gate rows are proposals.

Spot-check: pending (non-author).
