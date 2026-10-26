# AdjMixed — C1 build, 13 candidate dispositions (round 35, wave w1)

## Verdict

All 13 candidate lines in `.ufo/waves/round-35/w1-chunks/AdjMixed.tsv` are dispositioned as **screens, 0 map
rows**: 5 `same-surface` (all on kama's existing `cdp-live-target-census` surface), 4 `not-browser-sense`
(kama `consumer-registry.md:61,:325`, mori `observability-census-r1.md:142,:145`), 2 `third-lane-report`
(kama `consumer-registry.md:332` census of other lanes' repos; tameshi's breadth-audit output row inside its
survey of kagi), 2 `no-claim-declared` (chousa's AP-03 denial of browser/CDP/profile/session reads; kama's
webbridge-daemon row under its explicit "not kama's serving surface" section). No line in this chunk states
the sibling's own side of ground that a verified map row does not already hold — the one line with real
sibling-side browser ground (kama `listener-census.md:356`) is the continuation of the item already mapped
`contested-open` as `cdp-live-target-census` (rule 2 precedes rule 5), and chousa's denial is rule 4's
deliberate refusal. So this chunk contributes **0 of the frozen `newMapped >= 2`** and no DECL/L0; it
contributes 13 of 383 screens. The frozen counter confirms every screen is form-clean: `screenFindings` empty,
all 13 keys gone from `unaccountedKeys`, adjacency still `clean` at 16 rows / 16 verified / 0 findings. The
predicate is not met at this commit (expected: 370 of 383 candidates are other seats' chunks).

## Evidence

Scratch (deleted before yield): `/fast/scratch/hyaku/tabi-r35/AdjMixed`, `HYAKU_SCRATCH=/fast/scratch/hyaku`,
`TMPDIR=/fast/scratch/hyaku/tabi-r35/AdjMixed/tmp`.

| # | command | exit |
|---|---|---|
| 1 | `git clone -q --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"` then `git -C "$S/clone" checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83` (`rev-parse --show-toplevel` = `$S/clone`) | 0 |
| 2 | wrote `$S/clone/corpus/adjacency-screen-browser.tsv` (header + 13 rows); no edit to `corpus/adjacency.tsv`, `SKILL.md` or any other lane file | 0 |
| 3 | `git -C "$D" -c user.name=AdjMixed -c user.email=AdjMixed@scratch.local commit -m "round-35 C1 AdjMixed: browser screen ledger, 13 chunk lines screened, 0 map rows"` → `2db644c5a6507a81f980baac0eda07149ca1a225`; `git diff --numstat a4bfef0f HEAD` = `14 0 corpus/adjacency-screen-browser.tsv` (only addition) | 0 |
| 4 | `TMPDIR=$S/tmp node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --rev 2db644c5a6507a81f980baac0eda07149ca1a225 --repo "$S/clone" --fleet /home/vgpnk/Projects/shokunin --json` | 1 (predicate not met) |
| 5 | same counter, text mode | 1 |
| 6 | control: same counter at the baseline `2d2c8a77428f9c95c3cd0eb4a3bbf0c6fb4ab684` | 1 (predicate not met) |

Counter output at my commit (JSON in `counter-check.json`):

```
C1_ADJACENCY_SWEEP_V3 predicate=not-met rev=2db644c5a6507a81f980baac0eda07149ca1a225 adjacency=clean
candidates=383 mapped=0 screened=13 unaccounted=370 newMapped=0 screenFindings=0
```

- `adjacency` = `{verdict clean, rows 16, verified 16, findings 0}`.
- `screenFindings` = `[]` — **0 findings on my keys** (no `screen-quote`, `screen-surface-unmapped`,
  `screen-not-a-candidate`, `screen-duplicate`, `screen-reason-unknown`).
- my 13 keys absent from `unaccountedKeys` (unaccounted 370 = 383 − 13, all other chunks).
- `newMappedRows` = `[]`, `newRowRefusals` = `[]` — this seat adds no map row, so nothing to refuse.
- `priorCandidatesSkipped` = 22 (round-34 exclusion, unchanged).
- control at baseline: `screened=0 unaccounted=383`, adjacency clean — the 13 screens are this seat's delta.

Read-only lane check (no writes made to the lane): `git -C …/tabi-shokunin --no-optional-locks status
--porcelain` lists only wave scaffolding untracked by other seats (`.ufo/waves/round-35/w1/`, `w1-chunks/`,
`w1-dispatch.json`, …); no tracked-file modification from this seat.

Grounds per line (sibling bytes at the frozen pins, tabi side where one exists) are in `decisions.md`. Key
citations: chousa `archived-export-intake.md:137-141` (AP-03 denial; gate `tools/research-gate.sh:210-218`);
kama `consumer-registry.md:53-62`, `:228-231` (non-model section disclaimer), `:269-284` (live verdicts),
`:319-332` (search roots), `endpoint-identity.md:119-129`, `listener-census.md:241-243`, `:349-359`;
mori `observability-census-r1.md:134-146`; tameshi `gates-survey-kagi.md:279-288` (survey of
kagi-shokunin, substrate read-only).

## Attack surface handed to wave 2

- The four `not-browser-sense` rows are the weakest labels (the tokens are genuine — webbridge / musketeer /
  the webbridge daemon — so rule 1 is being read as "the line's subject is not browser craft"). Their
  alternatives are `no-claim-declared` / `third-lane-report`; none of them becomes a map row either way.
- The five `same-surface` rows all lean on one coarse existing surface (`cdp-live-target-census`), which rule
  2 compels but which a critic may call over-broad.
- Honest limit: a screen carries no tabi side, so `newMapped` from this chunk is 0 and the frozen target must
  be reached by other chunks; this seat cannot verify that part of C1.

## Tooling

No tool installed or upgraded, no browser/driver launched, no network fetch made. Nothing to record under the
operator tooling directive.

## Deliverables (under `.ufo/waves/round-35/w1/AdjMixed/`)

- `screen.tsv` — 13 screen rows, no header (5 TAB columns).
- `ledger-with-header.tsv` — the committed `corpus/adjacency-screen-browser.tsv` bytes (header + rows),
  sha256 `db1c4546902ff9afcea88618b827cd9154e62ba35757825c9273f586b3e9b48b`.
- `rows.tsv` — empty (0 map rows).
- `decl.md` — no DECL emitted, with the reason.
- `l0.txt` — empty (no `contested-open`).
- `decisions.md` — key | screen+reason | grounded sentence, 13 lines.
- `counter-check.json` — frozen counter JSON at `2db644c5a6507a81f980baac0eda07149ca1a225`.
