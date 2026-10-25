# W2Prune — round-23 file attribution and prune census

**Verdict:** all 17,677 files present at `2026-10-25T07:29:54Z` map to one of the eight producers (report 61, record 8, spec 3, tooling 3, dispatch 2, registry 2, fixture 2, refusal 0, scratch 17,596), but the round's landing commit `03c1b4d` — created at committer time `04:28:10 -0300` (`07:28:10Z`), mid-review, with its author date backdated to the parent's `03:50:10 -0300` — already commits 868 scratch files (23.6 MB, 292 unique blobs), while 16,834 files on disk stay untracked and six exceed 1 MiB.

Census fixture (mine): `scratch/W2Prune/census.txt`. No installs, no tool updates.

## Attribution at stamp (07:29:54Z; 17,677 files, 194.1 MB)
| producer | files | paths | owner |
|---|---|---|---|
| report | 61 | `w1/*.md` (44), `w2/*.md` (17, growing) | w1 is set-equal to the 44 members of `w1-record.json`; 44 `w2` members owe reports |
| record | 8 | `w{1,2}-record.json`, `w{1,2}-spawn-result.json`, `w{1,2}-{dispatch,record}.err` | wave runner; the 4 `.err` are 0 bytes |
| spec | 3 | `claims.json` (freeze), `w1-spec.json`, `w2-spec.json` | L1 |
| tooling | 3 | `gen-w1.mjs`, `gen-w2.mjs`, `measure.mjs` | spec generators + 1 stray |
| dispatch | 2 | `w1-dispatch.json`, `w2-dispatch.json` | wave runner |
| registry | 2 | `w1/swarm-registry.json`, `w2/swarm-registry.json` | wave runner (44 members each) |
| fixture | 2 | `fixtures/skipwork-control.mjs`, `fixtures/skipwork-receipt.json` | C1 control |
| refusal | 0 | — | absent; round 22 committed 24 cap-refusal receipts |
| scratch | 17,596 | `scratch/**`, `assimilation/validate/corpus/**` (91) | 34 of 35 dirs are registry-member names; `L1Tabi23.D4StaleAttempts` uses the agent-id form |

## Committed state (`HEAD` 03c1b4d, 926 files)
Committed: 45 `w1/` (44 reports + registry), 2 `fixtures/`, 11 root (`claims.json`, both `gen-*.mjs`, all `w{1,2}-{spec,dispatch,record,spawn-result}.json`), **868 `scratch/`**. Not committed: the whole `assimilation/` mirror (91), `measure.mjs`, all `w2/` reports, 16,834 on-disk files.

## Must not be added; 868 must be dropped before landing
`scratch/**` (throwaway fixtures by contract, incl. a skip-work control), `assimilation/validate/corpus/**` (gate mirror, not evidence), `measure.mjs` (wave-root tooling), the 4 zero-byte `.err`.

## Findings
1. **The round-23 commit appeared during this review and is backdated.** At 07:24Z `git ls-files .ufo/waves/round-23 | wc -l` → `0` and `git status --porcelain --ignored=matching .ufo` → `?? .ufo/waves/round-23/`; at 07:32Z it is 926 files in `03c1b4d` (`committer=04:28:10 -0300`, `author=03:50:10 -0300`) while wave 2 was still writing. `git log -1 --format='%h author=%ad committer=%cd' --date=iso; git ls-files .ufo/waves/round-23 | wc -l`
2. **868 of the 926 committed files are scratch (23.6 MB raw, 292 unique blobs), so the landing commit mixes throwaway fixtures with evidence.** `git ls-tree -r -l HEAD .ufo/waves/round-23/scratch | awk '{s+=$4} END{print s}'; git ls-tree -r HEAD .ufo/waves/round-23/scratch | wc -l`
3. **The tree is still growing and its size is dominated by live clones.** 1,151 files at 07:24 → 17,677 at 07:29:54 (194.1 MB) → 17,760 at 07:32:46; `scratch/W2Determinism/clone` and `scratch/W2C2Counter/repo5` account for most of it. `cd .ufo/waves/round-23 && date -u +%FT%TZ && find . -type f | wc -l && du -sb .`
4. **13 embedded `.git` entries (7,198 files) stay untracked; none became a gitlink, but any `git add -A` on `scratch/` would stage them as 160000 entries.** `find .ufo/waves/round-23 -name .git -printf '%y %p\n' | sort; git ls-files -s | awk '$1=="160000"' | wc -l` → `0`
5. **Six files exceed 1 MiB, all inside those two clones; no size cap exists in `scripts/*.mjs`, so a size-skipping walk drops 11.8 MB silently.** `find .ufo/waves/round-23 -type f -size +1M -printf '%s\t%p\n' | sort -rn` → `W2Determinism/clone/.../non-scalar.json` 3,320,476; `W2C2Counter/repo5/.../non-scalar.json` 3,320,476; 2 `.git` packs 1,862,121 / 1,129,754; 2 `receipt.json` 1,081,672. `grep -rn '1048576\|1 << 20\|MAX_FILE' scripts/*.mjs` → no hit.
6. **The assimilation mirror (91 files, untracked) is not the state that landed.** Its entry copy is the pre-adaptation stub (2,351 B, 37 lines, cites staged `S145`/`S146`, `verified-at: 2026-10-23`, "not run in this round"); the landed entry is 8,135 B / 128 lines citing `S102`/`S103` fetched 2026-10-25. `wc -c .ufo/waves/round-23/assimilation/validate/corpus/knowledge/csrf-defense-shape-boundary.md corpus/knowledge/csrf-defense-shape-boundary.md`
7. **Its SOURCES rows contradict the landed rows** (`S102` recheck `180d` vs `on-release`; title "Cookies: HTTP State Management Mechanism" vs "SameSite Cookie Attributes"; different quote cells) — committing it would put two conflicting `S102`/`S103` rows in the repo. `diff .ufo/waves/round-23/assimilation/validate/corpus/SOURCES.md corpus/SOURCES.md`
8. **89 of the mirror's 91 files are byte-identical to `HEAD:corpus` blobs** — zero information. `python3` sha256 loop over `assimilation/validate/corpus/**` vs `git show HEAD:corpus/<rel>` → identical 89, differing 1 (`SOURCES.md`), not-in-HEAD 1 (the entry).
9. **`measure.mjs` (6,019 B, 0755, 07:29:10Z) sits at the wave root, untracked** — a wave-2 seat wrote outside `w2/` and `scratch/<Name>/`; plus both committed generators embed absolute host paths and read `/home/vgpnk/.agents/skills/godspeed/directive.md`. `ls -l --time-style=+%FT%TZ .ufo/waves/round-23/measure.mjs; grep -n 'vgpnk\|directive.md' .ufo/waves/round-23/gen-w{1,2}.mjs`
10. **6 of 44 wave-1 reports carry no producer identity in their own bytes** (`D1RefusalArith`, `D2WaveCaps`, `D5RegistryIds`, `D6LogBinding`, `ScribeMistakes`, `ScribeScorecard`) — attribution rests on filename↔registry alone. `cd .ufo/waves/round-23 && for f in w1/*.md; do n=$(basename "$f" .md); grep -qF "$n" "$f" || echo "NO-SELF-ID $f"; done`
11. **0 of 44 wave-1 reports record a `Report:` trailer** (round 22: 23 of 65 did), so no report states its own path. `grep -L '^Report: ' .ufo/waves/round-23/w1/*.md | wc -l` → `44`; `git ls-tree -r --name-only HEAD .ufo/waves/round-22/w1 | grep -c .` → `65` with 23 trailers.
12. **No refusal artifact exists at the round root while round 22 committed 24, and `w2-record.json` (`updatedAt` 07:26:10Z) predates most of its own reports** (17 of 44 present at stamp) — the record is not a receipt of landed reports. `git ls-tree -r --name-only HEAD .ufo/waves/round-22 | grep -c cap-refusal; ls .ufo/waves/round-23/w2/*.md | wc -l; python3 -c "import json;print(len(json.load(open('.ufo/waves/round-23/w2-record.json'))['members']))"`

## Residual risk
The census cannot be reproduced: wave 2 wrote thousands of files during every measurement and the landing commit itself was created mid-review, so no hash taken now describes the tree any later reader sees. `refusal` is the one class I can only report as absent, not attribute.
