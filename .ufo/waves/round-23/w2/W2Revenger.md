# W2Revenger — tabi r23 / W2: provenance of the filed "23"

**Verdict:** the filed `23` is a *file-family* count, not an event count. The claim's own cited scope
(`.ufo/waves/round-22/w2-*`) holds exactly 23 refusal receipts of 64 refused seats each, which resolve
to **13** distinct refusals (attempts 1–9, 11–14) plus **10** byte-identical duplicate recordings.
The mechanism reproduces; the arithmetic does not. All bytes read at baseline
`a89f1935f523a64b00991d792fca6a8c0d321948` (`R`).

## Reconstructed contract — four surfaces assert 23, all W2-scoped
`SCORECARD.md:1111`; `corpus/lessons/round-22.md:130` (names the evidence scope: "across
`.ufo/waves/round-22/w2-*`"); `LOG.md:1584`; fleet report `.ufo/reports/round-22/tabi.md:180`.
All four add the same ordering clause: refusals "then the host session died".
`git grep -c '23 whole-payload' $R -- SCORECARD.md corpus/lessons/round-22.md LOG.md` → `1/1/1`.

## Mechanism supported by bytes
| family | files | refused seats/file | count |
|---|---|---|---|
| `w2-cap-refusal-{01..09,11..14}.json` (wrapped receipts) | 13 | 64 | 13 |
| `w2-attempt{02..09,11}-result.json` (bare payloads) | 9 | 64 | 9 |
| `w2-spawn-result.json` (bare payload, attempt 1) | 1 | 64 | 1 |
| **sum = W2 envelope family** | | | **23** |

Reproduction (one selector, no hand-picking): `git ls-tree -r --name-only $R -- .ufo/waves/round-22 | grep -E 'round-22/w2(-cap-refusal-[0-9]+|-attempt[0-9]+-result|-spawn-result)\.json$' | wc -l` → **23**.
The `b` in `w2b` is excluded by that pattern, which is exactly why W2b's 11 refusals never enter the
figure. Receipt-shaped selector (64 names, `Background job limit` per name) also returns 23.

**The 10 extra files are duplicates, not events.** Text sha equality pairs the bare payloads to the
wrappers: `w2-spawn-result` = `w2-cap-refusal-01` (`b450bf5b`), `attemptNN` = `cap-refusal-NN` for
NN 2–9 (`da7bd74c,9cdc92c3,0df564e5,d613fcc2,698150ae,7214b036,2a33b8df,5b42a3c1`), and
`attempt11` = `cap-refusal-11` (`03b70e04`). `attempt11.at` and `cap-refusal-11.at` are the same
string, `2026-10-21T16:28:27.783022+00:00` — one event, two filenames.
`git show $R:.ufo/waves/round-22/w2-cap-refusal-NN.json | python3 -c 'import json,sys,hashlib;…'`
Distinct over the 23: **13** text shas, **13** `at` values.

## Alternatives tested and rejected
- **13** (distinct refusals): correct as events, but the lesson's own `w2-*` glob cannot return it.
- **24** (`git ls-tree … | grep -c cap-refusal` → 24): the W2+W2b umbrella; the filed figure is one
  short of it and 11 long of the W2 scope — it is neither scope.
- **14** (`w2b-spec.json:3`, `w2b/CriticAuthority.md:16` "14 cap refusals"): attempt-number maximum,
  not a receipt count; attempt 10 has **no** receipt — `git ls-tree -r --name-only $R -- .ufo/waves/round-22 | grep -E 'round-22/w2-(attempt10|cap-refusal-10)\.' | wc -l` → `0`.
  `w2-cap-refusal-11.json` says so in its `note`: "attempt 10 by dead TabiR22 is unrecorded: slot granted 16:10:37Z, kernel died 16:10:51Z before any result".
- **24 − 1**: arithmetically 23 but requires dropping one of 24 comparable wrappers with no byte rule
  that selects it [INFERENCE, unsupported].
- **13 + 10 wrappers mid-flight** (17:08:04–17:11:05Z on 2026-10-21): reproduces 23 from wrapper files
  alone, but attributes W2b receipts to W2 and needs a value inherited from a three-minute window. No
  committed artifact records a 23 before the 2026-10-25 landing, when all 24 wrappers existed
  [INFERENCE, unsupported].

## Divergences (bytes vs the sentence)
1. **"23 refusals" vs 13 refusals.** All 13 wrappers carry one payload sha `070e13cd…` and
   `reason: "whole64 payload refused at 100-job cap; same args unchanged"` — the same 64-seat payload
   refused 13 times. `git show $R:.ufo/waves/round-22/w2-cap-refusal-11.json` (keys, `reason`).
2. **Ordering is false.** Four of the 13 (attempts 11–14, 16:28:27–16:36:56Z) carry
   `dispatcher: TabiR22-2` and post-date the death; the death is at attempt 10
   (16:10:37–16:10:51Z). `… | grep -o '"dispatcher": "[^"]*"'` on the 13 wrappers → 9×`TabiR22`, 4×`TabiR22-2`.
3. **W2b is silently outside the scope.** 11 files with 65 refused seats and sha `d81e11a1…`
   (16:41:02–17:11:05Z) precede W2b's successful attempt 12 (`w2b-spawn-result.json`, 0 failures);
   no committed surface counts them.
   `git ls-tree -r --name-only $R -- .ufo/waves/round-22 | grep -c w2b-cap-refusal` → `11`.
4. **Two facts fused.** `spawnedSeats: 0` holds for all 23 envelopes, so "23 refusals … 0 spawned"
   is true of the receipts and says nothing about seat execution (`w2/` holds only `swarm-registry.json`).

## Confidence
**High** (re-derived from committed blobs): 23 receipts; 13 events; 10 duplicates; the duplicate
pairs; the 9/4 dispatcher split; attempt-10 gap; W2b count 11. **Medium:** that the author used the
`w2-*` family selector — 23 is reproducible under it, but no artifact records the command.
**Unknown:** whether the figure was inherited from a 2026-10-21 draft; intent is inference, not finding.

No tracked-file edits, no git/jj writes, no spawns, no tool installs (git 2.56.0, python 3.14 present).
