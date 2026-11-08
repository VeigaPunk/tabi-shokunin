# R83Drift — C2 calibration controls

Seat: R83Drift (godspeed). Lane: tabi-shokunin. Counter: `scripts/check-record-drift-r83.mjs` (pin `4d0343b5e0798cbe5367e9a64e7ce8dd58b465f7961e2cf5d514fc4fe55e470f`).

## Axes

- **Direction binding** — does the counter refuse a reversed correction, or only check strings are present?
- **Truth binding, not presence** — does it check the true statement/number identity, or just that *some* statement exists?
- **Granularity** — single-statement removal: does one removed claim trip the counter, or does redundancy mask it?

## Mirror setup

Scratch mirror at `/fast/scratch/hyaku/tabi-r83/R83Drift/mirror/tabi-shokunin/` (cloned to `mirror2`/`mirror3` for isolation). Copied at same relative paths: `SCORECARD.md`, `LOG.md`, `SKILL.md`, `corpus/QUALITY.md`, `corpus/lessons/round-83.md`, `corpus/lessons/round-82.md`, `corpus/knowledge/chromium-showpicker-runtime-round-82.md`, `corpus/knowledge/chromium-showpicker-runtime-round-83.md`, `.ufo/waves/round-83/claims.json`, `.ufo/waves/round-83/scored/*.json`, plus `.ufo/waves/round-82/scored/*.json` (counter reads `r82-verdicts-preserved` from there), `.ufo/waves/round-83/census/{start,end}.txt`, `.ufo/waves/round-83/lesson-proof/*.json`, and `controls/c1/` (counter does not read prior-set for C2, but included for completeness).

**Baseline mirror run:** `node scripts/check-record-drift-r83.mjs --lane <mirror> --json` → **exit 0, 0 mismatches, 7 claims** (matches live-lane `c2-after.json` shape).

## Control results

| Control | Mutation | Exit | Mismatches | Failed ids | Verdict |
|---|---|---|---|---|---|
| **Control 1 — reversed correction** | `23 -> 20` → `20 -> 23` in mirror lesson (`corpus/lessons/round-83.md` correction cell) | **1** | 1 | `direction-bound` | `cellAnchor=false controlRefused=true reversedOnly=true` |
| **Control 2 — stale removed** | All `74 checks` → `<removed>` in mirror `SCORECARD.md` (4 occurrences) | **1** | 1 | `r83-numbers` | `okNums` true from scored JSONs, `stated` false |
| **Control 2′ — single-stale (intermediate)** | One `74 checks` in one line only | **0** | 0 | — | **NOT refused** — redundancy masks single-line removal |
| **Control 3 — nonce swapped** | `tabi-r83-l1-b6496e6f5d4f` → `tabi-r83-l1-c016710129da` (superseded receipt nonce) in `SCORECARD.md` (3 refs), `LOG.md` (1), `lesson` (1) | **1** | 1 | `r83-identity` | `cited=["c016710129da"] wrong=["c016710129da"]` |

Receipts committed as JSON under `.ufo/waves/round-83-seats/R83Drift/`:

- `control-1-reversed.json` — exit 1, failed `[direction-bound]`
- `control-2-stale-removed.json` — exit 1, failed `[r83-numbers]` (full-removal)
- `control-3-nonce-swapped.json` — exit 1, failed `[r83-identity]`

## Does the counter bind direction and truth, or only presence?

**Control 1 (reversed correction): BINDS DIRECTION — not presence-only.**

The `direction-bound` claim requires three conjuncts:

1. `cellAnchor`: `/23\s*->\s*20/` present in the lesson (the correct direction);
2. `controlRefused`: `.ufo/waves/round-83/lesson-proof/c2-controls.json` carries a reversed control with `"refused": true`;
3. `!reversedOnly`: the lesson does NOT carry `20 -> 23` as its only direction.

A presence-only grep would pass on `{23 -> 20 anywhere} AND {both numbers anywhere}` and would NOT fail on the mirror where the correction cell is flipped. The reversal makes `cellAnchor=false` AND `reversedOnly=true` simultaneously, because the lesson now contains *only* `20 -> 23` (the true `23 -> 20` string is gone). The `reversedOnly` guard is the direction-binding piece: it checks the *absence of the true anchor alongside the presence of the reversed anchor*, not just the presence of either.

However, note what it does **not** bind: the `controlRefused` leg reads JSON and checks `/refused\s*["'\s:]*true/i && /reversed/i` on the committed `c2-controls.json`. The counter's header claims it "re-executes the reversed control on a scratch mirror" but the code (lines 76-86) only string-matches the committed file — it does not spawn a re-execution itself. This report's Control 1 is the external re-execution that makes that committed `refused:true` true. I.e., the committed counter is *statically* direction-bound via `cellAnchor` + `reversedOnly`, but the "re-execution" half is true *only because R83Drift ran it here* — the counter does not self-prove it.

**Control 2 (stale removed): BINDS TRUTH for wholesale removal, but presence-only for single-line removal.**

`r83-numbers` requires: scored `counter.checkCount==74`, `battery.failed==0`, `killpower.survived==0` AND `scorecard/log/lesson.includes('74 checks')`.

- **Wholesale removal (all 4 scorecard `74 checks` → `<removed>`): correctly refused** — `r83-numbers` fails. This binds truth: the scored JSONs still say 74, but the narrative records no longer corroborate it.
- **Single-line removal (1 of ~5+ total `74 checks` statements): NOT refused — exit 0.** This is presence-only binding: the claim is `>=1 occurrence` across three files. Removing one redundant statement does not reduce the count below 1, so the counter is blind to a single stale-statement deletion in a redundant record set. If the r82 spotcheck's intent was "catch a single dropped statement," the counter fails that axis. If the intent was "catch a wholesale drift where the stated numbers vanish," it binds.

Recommendation for L1 (for L1 to consider, not to amend here): the `stated` leg could count occurrences (e.g. require N statements, or require each file to carry `74 checks` independently) if single-statement robustness is wanted. As frozen, it is presence-only at `>=1`.

**Control 3 (nonce swapped): BINDS TRUTH-of-identity — not presence-only.**

`r83-identity` collects `tabi-r83-l1-([0-9a-f]{12})` from scorecard/log/skill/lesson, and requires every cited hex to end-match `claims.nonce` plus `scorecard.includes(D.slice(0,8))`. Swapping to the superseded receipt nonce `c016710129da` gives `cited=["c016710129da"] wrong=["c016710129da"]` → fail. This is exactly truth binding: the counter compares *values*, not `regex.exists(nonce)`. A presence-only check (`/tabi-r83-l1-[0-9a-f]{12}/` tested) would pass Control 3. It does not.

One nuance: the swap replaced **all** refs in scorecard/log/lesson at once (3+1+1). A single-file nonce swap (e.g. only LOG.md) would also be caught, because `cited` is a union across all four records — any one wrong hex lands in `wrong`. So Control 3 binds even single-file identity drift.

## Counter summary

- Binds **direction** on `23 -> 20` (yes — reversed fails) but the "re-execution" leg is a committed-file check, externally re-executed here.
- Binds **truth** on nonce identity (yes — superseded value fails).
- Binds **truth** on stated numbers only at wholesale-removal granularity; at single-statement granularity it is **presence-only** (`>=1`).
- 7 claims, stable; `claim-count-stable` always true.

## Tooling

No tools installed. Used `node` (v24.21.0 per receipt), `cp`, `python3`, `grep`, `cat`. No pacman/uv/npm installs. Per RULES.md PACMAN GUARD: no pacman transaction attempted (host-wide PAUSED).

## Scratch cleanup

Scratch mirrors under `/fast/scratch/hyaku/tabi-r83/R83Drift/{mirror,mirror2,mirror3}` deleted before yield; receipts copied to seat dir first.

## What L1 should run

```bash
node scripts/check-record-drift-r83.mjs --lane <ABS lane> --json   # expect exit 0
# control receipts (verify failed ids):
jq '.failed' .ufo/waves/round-83-seats/R83Drift/control-1-reversed.json      # ["direction-bound"]
jq '.failed' .ufo/waves/round-83-seats/R83Drift/control-2-stale-removed.json # ["r83-numbers"]
jq '.failed' .ufo/waves/round-83-seats/R83Drift/control-3-nonce-swapped.json # ["r83-identity"]
```

Report: .ufo/waves/round-83/w1/R83Drift.md
