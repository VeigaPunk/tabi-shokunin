# ScribeCriteria — QUALITY.md criteria 61–63 (draft rows, append-only)

Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, baseline `a89f1935f523a64b00991d792fca6a8c0d321948`.
Seat `L1Tabi23.ScribeCriteria` (leaf scribe, read-only). Only this report was written. No tracked file
(`corpus/QUALITY.md`, lessons, SKILL/LOG/SCORECARD/PROVINCE, `scripts/**`) was edited; no git/jj write,
spawn, message, service, browser, network fetch, or tool install occurred. Claims read first from
`.ufo/waves/round-23/claims.json` (C1 operability, C2 coverage; no axis promoted).

## Proposed rows (append after criterion 60, verbatim)

61. Adds derivation-over-restatement: a round-evidence figure is derived by a command over
    the round's own committed receipts, never restated from prose; a detector that cannot
    fail on the round that produced the defect is not evidence. Red: `corpus/lessons/round-22.md:130`
    and `SCORECARD.md:1111` say 23 whole-payload refusals while
    `ls .ufo/waves/round-22/{w2,w2b}-cap-refusal-*.json | wc -l` → 24 (13 + 11); green: the
    derived 24 at `corpus/lessons/round-22-verifier-spotcheck.md:203`. Auditor class:
    c1-refusal-arithmetic. (lesson: corpus/lessons/round-23.md#mistakes M1)

62. Adds a pre-dispatch cap check: a wave's seat count is checked against the policy band
    before dispatch and the round total against the round cap, both recorded in the same
    commit; a replacement or degenerate (`0 spawned`) wave buys no larger band. Red:
    `.ufo/waves/round-22/w2b-spec.json:5` `maxLanes: 65`, round total 64 + 65 = 129 against
    the ≤128 cap; green: `.ufo/waves/round-23/w1-spec.json:5` `maxLanes: 44`. Auditor class:
    c2-wave-caps. (lesson: corpus/lessons/round-23.md#mistakes M2;
    `corpus/lessons/round-22-verifier-spotcheck.md:208-212`)

63. Adds change/entry binding: a landed change and its LOG entry are bound to one commit,
    or the landed-changes row says where the entry lands; a row citing a commit that
    touches no `LOG.md` is a finding. Red: `git show --name-only --format="" 47bfb5f |
    grep -c '^LOG.md$'` → 0 with the entry in `fbee618` → 1; green: one commit carrying
    both (`fbee618`), or the row naming it. Auditor class: c6-landed-log-binding.
    (lesson: corpus/lessons/round-23.md#mistakes M3;
    `corpus/lessons/round-22-verifier-spotcheck.md:223-226`)

## What these rows do not add

No new measurement, population, or target; no axis promotion (every score unchanged); no non-author
judgment (the red/green bytes are lane-derived). They bind three existing auditor classes to the bar:
c1 (61), c2 (62), c6 (63). Classes c3/c4/c5 are governed by criteria 6, 44, 58 and are not restated.

## Falsifier receipts (red trips, green clears)

| # | red bytes (detector must find) | green bytes (detector must clear) | command |
|---|---|---|---|
| 61 | `corpus/lessons/round-22.md:130` = "23 whole-payload"; `SCORECARD.md:1111` same | `...spotcheck.md:203` = "24 whole-payload" | `ls .ufo/waves/round-22/{w2,w2b}-cap-refusal-*.json \| wc -l` → 24 |
| 62 | `w2b-spec.json:5` maxLanes 65 > policy `waveMaxLanes: 64`; 64+65=129 > 128 | `w1-spec.json:5` maxLanes 44 | `python3 -c "import json;d=json.load(open('.ufo/waves/round-22/w2b-spec.json'));print(d['maxLanes'],len(d['items']))"` → 65 65 |
| 63 | `47bfb5f` rows touching `LOG.md` = 0 | `fbee618` rows touching `LOG.md` = 1 | `git show --name-only --format="" 47bfb5f \| grep -c '^LOG.md$'` → 0 |

Verified at baseline (each number is the command that produced it):

- `ls .ufo/waves/round-22/w2-cap-refusal-*.json | wc -l` → 13 (attempts 01–09, 11–14); `…w2b-cap-refusal-*.json | wc -l` → 11 (01–11) → 24 whole-payload refusals.
- `sed -n '130p' corpus/lessons/round-22.md` → "…64 validated seats, 0 spawned:** 23 whole-payload refusals"; `sed -n '1111p' SCORECARD.md` → "…W2 64 validated, 0 spawned (23 whole-payload cap".
- `python3 … w2-spec.json` → maxLanes 64, items 64; `… w2b-spec.json` → 65, 65. `w2b-cap-refusal-01.json` `acquire` reads `seats=65` (11/11 files carry it).
- `python3 … round-23/w1-spec.json` → maxLanes 44, items 44. Round-23 total at read time 44 (`.ufo/waves/round-23/w2/` empty, no spec) against the ≤128 cap.
- `git show --name-only --format="" 47bfb5f` → `measure-c1.mjs`, `selftest-c1.mjs`, `post-crash-repair.json`, fixtures, expectations — no `LOG.md`; `fbee618` → 1 `LOG.md` row.

## Limits and provenance

- `corpus/lessons/round-23.md` does not exist at baseline (`ls corpus/lessons/round-23.md` → No such file); the `#mistakes` anchor is a forward reference that becomes a resolving pointer only when the lesson lands in this round's integration commit (criteria 10, 28). The anchor spelling matches the lane convention (`corpus/lessons/round-22.md:70` `## Mistakes`).
- M1/M2/M3 labels are the round-23 dispatch's own candidate labels (`.ufo/waves/round-23/w1-spec.json`, seat ScribeMistakes); this file does not assert that the scribed rows keep those numbers — the section name is the binding anchor.
- The auditor `scripts/round-evidence-audit.mjs` is written by L1 under C1; this seat specified nothing about its implementation and observed no `--selftest` run. Class-to-row binding above is contract-derived (API in the dispatch), not execution evidence.
- Untested by this seat: whether each class's 12-case selftest reproduces these exact red/green bytes; whether the round-23 total stays ≤128 once w2 dispatches. Both are owed to integration, not claimed here.
- No quadrant of this file was promoted into `corpus/QUALITY.md`; that append is an integration action.
