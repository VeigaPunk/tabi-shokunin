# AdjKaidoku4 — C1 chunk dispositions (round 35, w1)

**Verdict.** All 16 candidate lines in my chunk (`AdjKaidoku4.tsv`, all kaidoku at pin `49096c7e…`) are kaidoku's own runtime-observation and asar-analysis receipts on surfaces that a verification-passing map row already owns for kaidoku, so each is a **screen row** and none is a map row: 13 `same-surface` on `cdp-runtime-observation` (the ruled row, `kaidoku@9011581d:PROVINCE.md:53`), 2 `same-surface` on `reverse-engineering-of-shipped-artifacts` (the refused-route row, `kaidoku@9011581d:PROVINCE.md:3`), and 1 `same-surface` on `recorded-har-producer-channel` (the split row, `kaidoku@fa6a8a3f:corpus/knowledge/2026-10-14-r10-01-queue-ops.md:151`). Mapping any of them would convert a fact on kaidoku's own side of an already-mapped split into a new declaration, which QUALITY 91 and 97 forbid; `decl.md` therefore carries no DECL line and `SKILL.md` was not touched. The frozen counter at my scratch commit `fcee9f4dfd8c24c7e19c79ea60ee1df480b48dac` reads adjacency `clean` 16/16 verified, `screenFindings []`, all 16 of my keys screened and absent from `unaccountedKeys`, `newMapped 0`, `newRowRefusals []`; the lane predicate is false at that partial commit only because the other 367 candidates belong to sibling chunks (screened 16 of 383, unaccounted 367) — expected for one seat.

## Dispositions

| # | key (path:line) | decision | surface |
|---|---|---|---|
| 1 | `2026-10-13-r3-runtime-observation.md:146` | screen same-surface | cdp-runtime-observation |
| 2 | `2026-10-13-r3-runtime-observation.md:159` | screen same-surface | cdp-runtime-observation |
| 3 | `2026-10-13-r3-runtime-observation.md:177` | screen same-surface | cdp-runtime-observation |
| 4 | `2026-10-13-r4-06-1password-asar.md:225` | screen same-surface | reverse-engineering-of-shipped-artifacts |
| 5 | `2026-10-13-r4-06-1password-asar.md:230` | screen same-surface | reverse-engineering-of-shipped-artifacts |
| 6 | `2026-10-13-r4-08-observe-verbs.md:11` | screen same-surface | cdp-runtime-observation |
| 7 | `2026-10-13-r4-08-observe-verbs.md:13` | screen same-surface | cdp-runtime-observation |
| 8 | `2026-10-13-r4-08-observe-verbs.md:35` | screen same-surface | cdp-runtime-observation |
| 9 | `2026-10-13-r4-08-observe-verbs.md:55` | screen same-surface | cdp-runtime-observation |
| 10 | `2026-10-13-r4-08-observe-verbs.md:161` | screen same-surface | cdp-runtime-observation |
| 11 | `2026-10-13-r4-08-observe-verbs.md:176` | screen same-surface | cdp-runtime-observation |
| 12 | `2026-10-13-r4-08-observe-verbs.md:198` | screen same-surface | cdp-runtime-observation |
| 13 | `2026-10-13-r4-08-observe-verbs.md:203` | screen same-surface | cdp-runtime-observation |
| 14 | `2026-10-13-r4-08-observe-verbs.md:239` | screen same-surface | cdp-runtime-observation |
| 15 | `2026-10-13-r4-08-observe-verbs.md:247` | screen same-surface | cdp-runtime-observation |
| 16 | `2026-10-13-r4-16-frontier-rescan.md:180` | screen same-surface | recorded-har-producer-channel |

Every quote is the whole trimmed candidate line (each line is ≤ 16 whitespace-separated words; the short fragments at `:11`, `:203`, `:247` can only be quoted whole). Reasons are grounded in the lines' own bytes and in the sibling PROVINCE at the pin: `PROVINCE.md:53` is kaidoku's own "Runtime observation (CDP)" row — self-launched `chromium --headless --remote-debugging-port=9222` / `xvfb-run electron … --remote-debugging-port=9223` — and the r3/r4 entries are its receipts; the 1Password lines are findings inside kaidoku's asar analysis (`PROVINCE.md:3`/`:49`); `r4-16:180` names a HAR producer channel, which the split row already answers.

## Evidence (commands, exit codes)

Freeze and counter bytes:

```
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse a4bfef0f75027c915e715649950b1d46dcb33d83
→ a4bfef0f75027c915e715649950b1d46dcb33d83                       # exit 0
git -C …/tabi-shokunin show a4bfef0f…:.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs > $S/counter.mjs
sha256sum $S/counter.mjs
→ 5707a93742565c17d24dd4df37d2289e1a9dfe4646e313108357770909b436b9   # equals claims.json frozenDigests, exit 0
git clone --shared …/tabi-shokunin $S/clone; git -C $S/clone checkout -q --detach a4bfef0f…
git -C $S/clone rev-parse --show-toplevel → /fast/scratch/hyaku/tabi-r35/AdjKaidoku4/clone   # exit 0
```

Freeze tree check: `corpus/adjacency.tsv` present (16 data rows + header), `corpus/adjacency-screen-browser.tsv` **absent** at the freeze; `corpus/adjacency-screen.tsv` and `corpus/adjacency-screen-skill.tsv` exist.

Scratch commit (clone asserted toplevel first):

```
test "$(git -C $D rev-parse --show-toplevel)" = "$D"              # exit 0
git -C $D -c user.name=AdjKaidoku4 -c user.email=AdjKaidoku4@scratch.local add corpus/adjacency-screen-browser.tsv
git -C $D -c user.name=AdjKaidoku4 -c user.email=AdjKaidoku4@scratch.local commit -q -m "r35 w1 AdjKaidoku4: screen 16 kaidoku browser-ground candidates"
→ fcee9f4dfd8c24c7e19c79ea60ee1df480b48dac  1 file changed, 17 insertions(+)      # exit 0
```

Counter (frozen file from the freeze commit, TMPDIR under my scratch):

```
TMPDIR=$S/tmp node $S/counter.mjs --rev fcee9f4dfd8c24c7e19c79ea60ee1df480b48dac \
  --repo $S/clone --fleet /home/vgpnk/Projects/shokunin --json > $S/counter-check.json
# exit=1 (predicate false: 367 candidates from other chunks remain unaccounted)
```

Pasted `counter-check.json` fields:

```
adjacency  {verdict: clean, rows: 16, verified: 16, findings: 0}
candidates 383  mapped 0  screened 16  unaccounted 367  newMapped 0  predicate false
screenFindings []
newRowRefusals []
my keys unaccounted: []      # all 16 of my keys absent from unaccountedKeys
my keys screened: 16
perLane kaidoku 137
```

No map row was proposed, so `newMapped` is 0 for this chunk and `rows.tsv` is empty; no `contested-open` question exists, so there is no `l0.txt`. No browser was launched, no network fetch was made, no tool was installed, and no lane tracked file was edited outside the scratch clone.

## Deliverables (output dir `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-35/w1/AdjKaidoku4/`)

- `screen.tsv` — 16 screen rows, no header (the rows also written into the scratch clone's `corpus/adjacency-screen-browser.tsv` with the exact header `sibling_ref<TAB>reason<TAB>surface<TAB>quote<TAB>note`).
- `rows.tsv` — empty (no map row from this chunk).
- `decl.md` — no DECL lines, with the reason.
- `decisions.md` — per-key decision and the both-sides ground.
- `counter-check.json` — the frozen counter's full JSON at `fcee9f4dfd8c24c7e19c79ea60ee1df480b48dac`.

## Known limits

- The counter judges screen form, not overlap semantics: the `same-surface` choice for the two 1Password sandbox lines (screen vs. a `not-browser-sense` read) and for the cleanup-inventory fragment at `r4-08:247` is the semantic judgement wave-2 attack seats should test; both lines were screened, so no map-side claim rides on it.
- This chunk's honest contribution to the lane's `newMapped >= 2` is zero; the predicate cannot be reached from these 16 already-mapped kaidoku lines without a forged declaration.
