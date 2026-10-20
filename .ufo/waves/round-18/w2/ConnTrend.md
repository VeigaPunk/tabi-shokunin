VERDICT: ISSUES

Axes: expansion (a new note counts only when it holds ground the coverage map did not hold), quality (recheck and correction of already-admitted rows), discernment (a prior outside disagreement encoded as a counter, with this round's non-author closure still open). Freshness C1, operability C2, and calibration C3 stay on their own counters. No tool was installed.

Trend at `530f40a9bc3f10436161a2af1ca0fe9bffffc004` (baseline `2bff864fdfee684ddbcd066cc8e735adaba2735c`):

- **expansion unchanged.** Knowledge notes 34→36. Both new files sit on ground the round-17 map already held: early quote recheck of the baseline registry, and a hardening contract for the already-held Chromium 154 loopback invocation surface. Source rows 57→64 are registry rows. `SCORECARD.md` has no round-18 block. `corpus/README.md:384-386` already says the sweep is quality work on already-held loopback ground.
- **quality improved on two measured sets, with two map defects.** `c1_rows_rechecked` 0→51 and `c3_routed_closed` 0→5. The recheck note's present-tense "57 rows" is false at this revision (64). The harness note sends observed counts to a `measurements.json` that is not in this revision. C2 was not run here.
- **discernment of the round-17 outside disagreement can improve, and this round's non-author closure is still pending.** `c3_routed_closed` 0→5 closes spot-check routed defects 1–5. QUALITY 33–37 cite those five. QUALITY 38 cites `.ufo/waves/round-18/w1/ReviewC1Contract.md`, an in-lane review, and is a different gain. `corpus/lessons/round-18.md:33` and `corpus/knowledge/source-recheck-round-18.md:2` and `:150` leave non-author judgment unclaimed.

## Evidence

Identity. `HEAD` is detached (`git symbolic-ref -q --no-recurse HEAD` exit 1). `git rev-parse --verify HEAD` and `git rev-parse --verify refs/heads/master` both print `530f40a9bc3f10436161a2af1ca0fe9bffffc004`. `git merge-base --is-ancestor 2bff864fdfee684ddbcd066cc8e735adaba2735c 530f40a9bc3f10436161a2af1ca0fe9bffffc004` exit 0. `git diff --stat 530f40a9bc3f10436161a2af1ca0fe9bffffc004 -- corpus/knowledge corpus/README.md corpus/QUALITY.md corpus/SOURCES.md LOG.md SCORECARD.md corpus/lessons/round-18.md` printed nothing.

```
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin diff --name-status \
  2bff864fdfee684ddbcd066cc8e735adaba2735c 530f40a9bc3f10436161a2af1ca0fe9bffffc004 -- \
  corpus/knowledge corpus/README.md corpus/QUALITY.md corpus/SOURCES.md LOG.md SCORECARD.md \
  corpus/lessons/round-18.md
```

exit 0:

```
M	LOG.md
M	corpus/QUALITY.md
M	corpus/README.md
M	corpus/SOURCES.md
A	corpus/knowledge/harness-hardening-round-18.md
A	corpus/knowledge/source-recheck-round-18.md
A	corpus/lessons/round-18.md
```

`git diff --name-only` on the same span for `scripts/check-freshness.mjs`, `scripts/check-sources.mjs`, `SHONEN.md`, `PROVINCE.md`, `corpus/lessons/round-17.md`, `corpus/lessons/round-17-verifier-spotcheck.md`, and `SCORECARD.md` printed nothing. Numstat on the changed map files is insertions only: LOG 24/0, QUALITY 21/0, README 19/0, SOURCES 9/0, harness note 64/0, recheck note 150/0. README, QUALITY, and LOG at baseline are a byte prefix of the same path at REV (`cmp` of the baseline file against the first baseline-line-count of the REV file, exit 0). README grew 368→387 lines in one hunk at the old end. The 34 knowledge files present at baseline are absent from the name-status list.

Note digests at REV (`git show REV:path | sha256sum`):

- `corpus/knowledge/source-recheck-round-18.md` `f66801cb16ef9ef2c353fb02158bd11bdd052703723db1bb1383191643e13540`
- `corpus/knowledge/harness-hardening-round-18.md` `b4aae6a26bdb26d5eaf358012bc6889d399dafba7e8f799013a6c539dfc63816`
- `.ufo/waves/round-18/recheck-fetch.mjs` `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` (matches the note at `:13`)
- `.ufo/waves/round-18/measure-c1.mjs` `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234` (blob equals the worktree file)
- `.ufo/waves/round-18/measure-c3.mjs` `cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a`

Map index. `LC_ALL=C comm -23` of `git ls-tree -r --name-only REV -- corpus/knowledge` (prefix `corpus/` stripped) against `grep -oE 'knowledge/[A-Za-z0-9._-]+\.md' README` was empty both ways. Every current note is named. The round-18 section does not repeat the round-16/17 snapshot sentence ("N notes; the earlier rows are unchanged"). The diff shows that fact anyway.

Receipt tree at REV: 51 `*.json` and 51 `*.excerpt.txt` under `corpus/evidence/round-18/source-recheck/`, zero other names. `git grep -h '"teachesVerdict"' REV -- corpus/evidence/round-18/source-recheck | sort | uniq -c` → `51 "teachesVerdict": "held"`. S029 is `teachesVerdict=held`, `quoteFound=true`, `httpStatus=null`, producer `f2ba0033…aa360`.

C1, committed inputs only (no `--live`):

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c1.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  2bff864fdfee684ddbcd066cc8e735adaba2735c
```

exit 0. `c1_rows_rechecked=0`, `eligible_rows=51`, `held=0`, `own_work=0`, `rejected` length 0. `row_classes.status` mined 42 / queued 8 / rejected 7. `row_classes.url` immutable_pinned 14 / living_live 42 / own_work 1. Stdout sha256 `c40b216771c3da609b53c7589e468ba5da339269537c3945246fb6ef901ad341`.

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c1.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  530f40a9bc3f10436161a2af1ca0fe9bffffc004
```

exit 0. `c1_rows_rechecked=51`, `eligible_rows=58`, `held=50`, `drift_superseded=0`, `own_work=1`, `rejected` length 0. `row_classes.status` mined 48 / queued 8 / rejected 8. `row_classes.url` immutable_pinned 17 / living_live 46 / own_work 1. `counterSha256` `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234`. Stdout sha256 `8cd3fd8c84279852cc291bfb3eacee0e35540ead1612ce8028674b76c5b1adf3`.

`held=50` plus `own_work=1` is the same 51 receipts. The counter's `held` field omits own-work. Every receipt's `teachesVerdict` is `held`, including S029. The note's table of 51 `teachesVerdict=held` matches the receipts. It must not be rewritten to 50.

`eligible_rows` is every registry id outside the fixed set S004, S039, S047, S049, S050, S053 (`measure-c1.mjs` `SUPERSEDED`). At REV that is 64−6=58. The seven new ids are inside that 58 and have no receipt, so they do not appear in `rejected`. `eligible_rows - c1_rows_rechecked` = 7. That gap is S058–S064. It is not seven missed baseline rechecks. The note at `:42` fences the baseline pair 51/0 and matches the baseline run. It does not publish the REV pair 58/51. `:149` says a row with no receipt is absent from the count and that the six superseded rows have none by design. Those six are already outside `eligible_rows`. The seven eligible rows with no receipt are unnamed there.

C3, git reads only:

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c3.mjs \
  2bff864fdfee684ddbcd066cc8e735adaba2735c
```

exit 0. `c3_routed_closed=0`. d1 `lesson_missing`, d2 `harm_receipt_missing`, d3 `adjacency_receipt_missing`, d4 `S058_missing`, d5 `rerun_index_missing`. Stdout sha256 `0f79c6dc3905acfc0b47d00533a04836bbf37dee69e00b3b89fab863074cb352`.

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/measure-c3.mjs \
  530f40a9bc3f10436161a2af1ca0fe9bffffc004
```

exit 0. `c3_routed_closed=5`. d1 `correction_line_verified`, d2 `20_historical_gates_verified`, d3 `adjacency_selftest_verified`, d4 `S058_supersession_verified`, d5 `7_reruns_verified`. `counterSha256` `cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a`. Stdout sha256 `c819532117dfec0c650152ad9ffb27dd49202e6b2276ac025d1050caae2843d5`.

Outside disagreement those five close, at `corpus/lessons/round-17-verifier-spotcheck.md:148-165` (unchanged on this span): expansion improved there because `webmcp-invocation-round-17.md` was map-uncovered ground with an in-round capability run; discernment improved because that outside check agreed on 2 admits and 3 rejects. Routed defects: (1) sibling prose 7 vs map 6, (2) harm set measured at `6c97851` rather than `93bfead`, (3) adjacency self-test only in a wave report, (4) S057 anchor still says individual publisher, (5) seven reruns kept as abbreviated digests. Line 165 lists `check-freshness --witness HEAD` as open, not a defect. Re-count: `git show 93bfead1f5f25f584353df3152a60209bbd89a2e:corpus/adjacency.tsv | cut -f2 | tail -n +2 | sort -u | wc -l` prints `6`. `corpus/lessons/round-17.md:116` still says "Map: 10 rows, 7 siblings." QUALITY 33–37 cite routed 4, 1, 2, 5, 3 in that order. QUALITY 38 cites the in-lane C1 review, not this spot-check.

S058 cells contain `individual publisher` 0 times. S057 contains it 1 time. Registry parser on `## Registry` rows: baseline n=57 tier A46/B4/C7 status mined42/queued8/rejected7; REV n=64 tier A52/B4/C8 status mined48/queued8/rejected8. Shared ids S001–S057: 0 lines differ. New rows: S058 docs/C/rejected/used-by `—`; S059–S061 and S063 docs/A/mined; S062 and S064 code/A/mined; S059–S064 used-by `corpus/knowledge/harness-hardening-round-18.md`. `## Paths` and `## Leads` are byte-identical. Search log diff is two added bullets (the round-18 recheck bullet and the harness-hardening bullet) and no edit of earlier bullets. The whole SOURCES numstat 9 insertions is those 7 rows plus those 2 bullets.

`git cat-file -e 530f40a9bc3f10436161a2af1ca0fe9bffffc004:corpus/evidence/round-18/measurements.json` exit 128, `path does not exist`. `measure-c2.mjs` at REV contains `c2_hazards_closed` and emits JSON on stdout. It contains no `measurements.json` string. `corpus/knowledge/harness-hardening-round-18.md:12` tells a reader to take observed counts from that committed file and from `node .ufo/waves/round-18/measure-c2.mjs REV`. This seat did not run `measure-c2.mjs`. Unrun C2 is not a pass and not a recorded failure.

Recheck population inside the 51, counted from REV registry cells excluding the six superseded ids and S058–S064: n=51, status mined 40 / queued 6 / rejected 5, tier A42/B4/C5. That matches the note's §2 table. The false sentence is the cardinality around it, `corpus/knowledge/source-recheck-round-18.md:11`: "`corpus/SOURCES.md` has 57 rows (S001–S057)." At this revision the registry has 64 rows. The id span S001–S057 is still 57 ids, and those lines are unchanged. The verb "has 57 rows" is the current file's cardinality, and QUALITY 34 requires a prose count to carry its command against a named revision. The same note's baseline counter line does that. This sentence does not. It is the same shape as the outside "7 siblings" count.

`corpus/knowledge/webmcp-invocation-round-17.md:99-104` already records the DevTools port, SIGTERM `verdict=fail`, surviving temp profiles, unrefused downloads, and two `--enable-features` switches as open debt on the held invocation surface. The round-18 harness note is that debt's contract. README `:384-386` does not flip real-site, agent-side, default-profile, or Chromium 152. Round 17's outside expansion test (new note on uncovered ground plus an in-round capability run) is not met. Round 14's rule that a new registry row is not knowledge expansion is the rule that fits S058–S064.

## Source changes

| Set | Baseline | REV | What changed |
|---|---|---|---|
| `corpus/knowledge/*.md` | 34 | 36 | added `source-recheck-round-18.md`, `harness-hardening-round-18.md`; prior 34 byte-identical |
| Registry rows | 57 | 64 | appended S058–S064; S001–S057 lines identical |
| Tier | A46/B4/C7 | A52/B4/C8 | +6 A (S059–S064), +1 C (S058) |
| Status | mined42/queued8/rejected7 | mined48/queued8/rejected8 | +6 mined, +1 rejected; queued unchanged |
| C1 url class (whole registry) | pinned 14 / live 42 / own-work 1 | pinned 17 / live 46 / own-work 1 | +3 pinned, +4 live |
| Paths, Leads | — | identical to baseline | no new learning path |
| Search log | — | two bullets appended | recheck of 51 baseline rows; seven dossiers, six included sources, S058 retained as rejection |
| Recheck receipts | 0 | 51 json + 51 excerpt | all `teachesVerdict=held`; producer `f2ba0033…aa360` |

## Proposed move

One append, integrator-owned, no edit to `measure-c1.mjs` and no edit to the prior 34 notes. In the round-18 SCORECARD/LOG trend sentence, bind three integers to three commands and add one erratum under the recheck note:

1. Expansion stays unchanged. Command: `git diff --name-status 2bff864fdfee684ddbcd066cc8e735adaba2735c 530f40a9bc3f10436161a2af1ca0fe9bffffc004 -- corpus/knowledge` shows only the two added notes. Snapshot sentence, same shape as README round 16/17: 36 notes, the 34 earlier byte-identical, both new files on already-held loopback ground. The 57→64 registry delta stays in the source table above.
2. Quality cites `c1_rows_rechecked` 0→51 and `c3_routed_closed` 0→5. Beside them, print `eligible_rows` 51 at baseline and 58 at REV, and say the difference of 7 is S058–S064 with no C1 receipt. Do not subtract those fields into a miss count. Erratum on `source-recheck-round-18.md`, append-only: at `530f40a9bc3f10436161a2af1ca0fe9bffffc004` the registry cardinality is 64 (`awk` over `## Registry` rows, command above); the 57 is the baseline id span S001–S057. Leave the 51 `teachesVerdict=held` figure alone.
3. Discernment cites `c3_routed_closed` 0→5 as the encoding of spot-check `:159-163` into QUALITY 33–37. State that non-author closure of this round's admits remains the orchestrator's (`round-18.md:33`). Keep QUALITY 38 on the C1 URL binding. Leave harness closure out of every trend word until a committed C2 receipt exists; `measurements.json` is absent and `measure-c2.mjs` was not run here.

## Risks

Changing `eligible_rows` inside `measure-c1.mjs` so that it stays 51 at REV would hide S058–S064 by redefining the counter. The trend sentence can show 58 and 51 together without that edit.

Calling `c3_routed_closed=5` a non-author closure of round 18 would contradict `round-18.md:33`. The five are the previous outside reviewer's defects, now checked by this lane's counter.

Copying `held: 50` over the note's 51 would drop S029, whose receipt is `teachesVerdict=held` and whose counter bucket is `own_work`.

Treating 34→36 notes, or 57→64 sources, as expansion would use a note-count shortcut that round 17's outside check reserved for uncovered ground with a capability run. This revision has neither.

## Verification

Re-run the four `node` commands and the registry `awk` after the sentence is appended. Expected unchanged: C1 0/51 then 51/58, C3 0 then 5, registry 64, S001–S057 line-diff empty, knowledge name-status still only the two added notes. C2 stays uncounted until its own receipt is committed.

Files written:

- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/ConnTrend.md
