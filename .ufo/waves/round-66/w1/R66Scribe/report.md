# R66Scribe report — round 66, wave w1, C1 adjacency drafts

Scope: prose drafting only. Two drafts written; no corpus, SCORECARD, LOG, PROVINCE, SKILL, MANIFEST, frozen counter, fleet-root, sibling or git-state write. No commits, no `git add`, no `jj` mutation. No tools installed or upgraded (no pacman, uv, npm or cargo action by this seat).

## Files
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66/w1/R66Scribe/knowledge-adjacency-live-heads-r66.md` — knowledge entry; provenance trio (`source:`, `verified-at:`, `recheck:`) opens the file.
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66/w1/R66Scribe/gate-rows-c1.md` — Gate rows (Candidate | Decision | Located evidence / flip), with `Spot-check: pending (non-author)`.
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66/w1/R66Scribe/report.md` — this file.
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-66/w1/R66Scribe.md` — same content, at the path the seat spec names.

## Findings
1. Before figure (committed): predicate false, findingCount 40 (`v22-live-r66.json`): head-mismatch 21, sha-mismatch 9, lines-mismatch 8, delta-quote-not-whole-line 1, audit-note-moved-line 1.
2. Re-run at this seat reproduces it: findingCount 40, predicate False, findings array equal to the committed one. It also discloses drift the committed file does not carry: `kengaku-shokunin` snapshot `00462b596f517cc70528f1773c20eac7dd530bfd`, live `c3f81f72495476db1f4e36706d2855347077fa36`. The L1 must re-take the snapshot or record the drift before freezing.
3. Independent cross-check (python, `git cat-file -p` at snapshot heads, BG_WORDS copied from meter line 34): 25 delta lane rows; 4 at the snapshot head; 21 not; 9 sha mismatches; 8 line-count mismatches; 0 bg-hit-count mismatches. Matches the meter.
4. Meter reads sibling bytes at the snapshot head (meter line 317 `heads.get(lane)`), not at the head in each audit reference. For kumitate the reference head `89cbd998` differs from snapshot `7218699c`.
5. No after figure exists. The knowledge entry and gate rows leave `[L1 to paste]` placeholders.

## Commands and exit codes
| # | Command (abridged; full forms in the drafts) | Exit | Result |
|---|---|---|---|
| 1 | `cat` of snapshot-live-r66.tsv, v22-live-r66.json, c1-adjacency-host-v22.mjs, RULES.md; `git rev-parse HEAD` of lane | 0 | snapshot read (20 rows); json read; lane HEAD `4bea87d5` (lane HEAD, not the base) |
| 2 | `node .ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs --repo . --rev 2816adb359a50c2fd83fa975e39f0650aa189984 --fleet /home/vgpnk/Projects/shokunin --snapshot .ufo/waves/round-66/measure/snapshot-live-r66.tsv --json` (run in lane root, stdout to scratch) | 1 | findingCount 40, predicate False, drift [kengaku-shokunin]; stderr 0 bytes |
| 3 | `python3` counter over `v22-live-r66.json` findings | 0 | Counter: head 21, sha 9, lines 8, quote 1, note 1 |
| 4 | `python3` cross-check (sha/lines/bg/head per delta lane row; `git -C /home/vgpnk/Projects/shokunin/<lane> cat-file -p <head>:<path>`) | 0 | 25 lane rows; 4 match; 21 mismatch; sha MISMATCH 9; lines MISMATCH 8; bg all ok |
| 5 | `git cat-file -p` reads: kake `d838e744…:SKILL.md` line 1358; kumitate `89cbd998…` and `7218699c…:SCORECARD.md` lines 1723/1885/1898 | 0 | line 1358 2254 chars vs quote 1937; 1898 verbatim at snapshot head; 1885 at 89cbd998 is a different line |
| 6 | `sha256sum .ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs` | 0 | `4d3a6b589d1c3a795314cc93b2cd481071c70309a957cb54031a6971002d50d5` (matches the README control in round-66/measure) |
| 7 | `grep -n` of meter source for rule lines (BG_WORDS 34, sha256 37, verify 90, obs 118, notes 121-122, sha 203, lines 205, quote 215, head 220, makeSibRefGit 315-317) | 0 | line numbers cited in drafts |
| 8 | `mkdir -p "$S"`, `trap 'rm -rf -- "$S"' EXIT` with `S=$HYAKU_SCRATCH/tabi-r66/R66Scribe` (HYAKU_SCRATCH default /fast/scratch/hyaku) | 0 | scratch created and removed at each call's exit; nothing persists |

Tool installs/updates by this seat: none.

## Known limits
- The after figure is not measured here; the L1 must re-run the recheck command on the frozen state.
- The cross-check python pass is this seat's reproduction, not the meter's verdict; it is not committed.
- The 'Decision (proposed)' column in the gate rows is the seat's proposal only.
- Quote and line lengths are Python `str` lengths (code points), not bytes.
- [INFERENCE] Regenerating the r62 ledgers at snapshot heads would clear the 38 lane-row findings; whether the predicate then holds is not measured.

Spot-check: pending (non-author).
