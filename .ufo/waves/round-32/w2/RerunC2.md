# RerunC2 — re-run of C2's counting command at b234a589 (round 32, w2 falsify)

## Verdict

**C2 holds.** In a clean shared clone checked out at `b234a58920134424e0d104f137311ff54a16d26b`, the frozen v3 counter `scripts/check-selfassessment.mjs` (sha256 `77b5c8ed503bd9bc93e8ef634a10627613672eaa39bca84cf7339d37b6d4c6a9`, byte-identical to `claims.json` `frozenDigests` and unchanged since the freeze commit) reads **mismatches 0, counted [] , exit 0, clean=true** (was 18 at the freeze reading), and `git diff --numstat 4181fffb..HEAD -- SKILL.md corpus/README.md SCORECARD.md LOG.md` shows **0 deletions** on all four documents (106/0, 62/0, 135/0, 41/0). All 18 baseline findings (15 m1 + 3 m4) are cleared by exactly the correction lines the round appended, each now `superseded: true` (superseded count 21 → 39, +18 exactly). **One honest residue: 2 NEW could-not-evaluate findings appear from round-32 text** — `LOG.md:2154` and `LOG.md:2155` (class m1-selftest-tally, `couldNotEvaluate: "ambiguous script association"`; couldNotEvaluate 104 → 106). No new counted finding exists. Severity **minor**: the claim's target (mismatches 0, deleted lines 0) is met and the gate exit is 0; but no append-only correction can ever clear these two CNEs, because the counter's supersession pass skips every finding with `observed === null` (`scripts/check-selfassessment.mjs:250`) — this is a frozen-counter observation, reported, not patched.

## Commands run (all in the scratch clone `$S/clone`, `S=/fast/scratch/hyaku/tabi-r32/RerunC2`)

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"        # ok
git -C "$S/clone" checkout -q --detach b234a58920134424e0d104f137311ff54a16d26b  # HEAD verified = b234a589…d26b
git -C "$S/clone" rev-parse --show-toplevel                                      # = "$S/clone"
git -C "$S/clone" status --porcelain                                             # empty (clean tree)
sha256sum scripts/check-selfassessment.mjs
# 77b5c8ed503bd9bc93e8ef634a10627613672eaa39bca84cf7339d37b6d4c6a9  = frozenDigests ✓
git -C "$S/clone" diff --name-only 4181fffb…d1e6 HEAD -- scripts/check-bidi-runtime.mjs scripts/check-selfassessment.mjs
# empty ✓ (measurementRule); also empty for 5ad1fcbf...4181fffb (exit 0)
TMPDIR="$S/tmp" node scripts/check-selfassessment.mjs --rev HEAD --json > "$S/out/c2-rerun-head.json"
# exit=0, 88304 bytes (140.7 s)
git -C "$S/clone" diff --numstat 4181fffb…d1e6 HEAD -- SKILL.md corpus/README.md SCORECARD.md LOG.md
# 106 0 LOG.md / 62 0 SCORECARD.md / 135 0 SKILL.md / 41 0 corpus/README.md ; exit 0
```

Headline counters (rerun vs freeze reading `baseline/c2-J1-do-nothing.json`):

| field | freeze reading (rev `5ad1fcbf…`) | rerun (rev `b234a589…`) |
|---|---|---|
| mismatches | 18 | **0** |
| counted | 15 m1 + 3 m4 | **[]** |
| couldNotEvaluate | 104 | 106 (+2, both from round-32 LOG text) |
| superseded | 21 | 39 (+18 = exactly the cleared findings) |
| clean | false | **true** (exit 0) |

Baseline note: the freeze control was scored at `5ad1fcbf` per `claims.json` `counterCommits.note`; the two counters are byte-identical between `5ad1fcbf`, `4181fffb` and HEAD (verified above), so the comparison is like-for-like.

## Which 18 were cleared, by which correction line

All 18 baseline counted findings are present in the rerun's `findings` (none disappeared) with `superseded: true`; the clearing text is append-only at the end of each document:

| Baseline counted finding (claimed → observed) | Cleared by (HEAD line, verified bytes) |
|---|---|
| m1 `SCORECARD.md:1439` 17→41 | `SCORECARD.md:1610` — "- `scripts/check-selfassessment.mjs` `--selftest` (41/41): correction — supersedes the stale tallies at `SCORECARD.md:1439`, `:1465`, `:1486`, `:1564`" |
| m1 `SCORECARD.md:1465` 22→41 | `SCORECARD.md:1610` (same bullet) |
| m1 `SCORECARD.md:1486` 22→41 | `SCORECARD.md:1610` (same bullet) |
| m1 `SCORECARD.md:1564` 30→41 | `SCORECARD.md:1610` (same bullet) |
| m4 `SCORECARD.md:1473` r29 inactive→active | `SCORECARD.md:1612-1616` — "Correction — supersedes the round-29 stagnation-nudge statement at `SCORECARD.md:1473`: the nudge was active. …" |
| m4 `SCORECARD.md:1515` r30 inactive→active | `SCORECARD.md:1618-1620` — same form, cites `:1515` |
| m4 `SCORECARD.md:1576` r31 inactive→active | `SCORECARD.md:1622-1626` — same form, cites `:1576` |
| m1 `SKILL.md:2479` 13→41 | `SKILL.md:2758-2762` — "- Correction — supersedes the nine stale tallies at `SKILL.md:2479`, `:2515`, `:2530`, `:2545`, `:2576`, `:2578`, `:2590`, `:2594`, `:2598` … `--selftest` (41/41) is the oracle-correct figure" |
| m1 `SKILL.md:2515` 17→41 | `SKILL.md:2758-2762` (same bullet) |
| m1 `SKILL.md:2530` 20→41 | `SKILL.md:2758-2762` (same bullet) |
| m1 `SKILL.md:2545` 22→41 | `SKILL.md:2758-2762` (same bullet) |
| m1 `SKILL.md:2576` 30→41 | `SKILL.md:2758-2762` (same bullet) |
| m1 `SKILL.md:2578` 30→41 | `SKILL.md:2758-2762` (same bullet) |
| m1 `SKILL.md:2590` 30→41 | `SKILL.md:2758-2762` (same bullet) |
| m1 `SKILL.md:2594` 30→41 | `SKILL.md:2758-2762` (same bullet) |
| m1 `SKILL.md:2598` 30→41 | `SKILL.md:2758-2762` (same bullet) |
| m1 `corpus/README.md:613` 17→41 | `corpus/README.md:743-746` — "- Correction — supersedes the two stale tallies at `corpus/README.md:613` and `:668` … `--selftest` (41/41)" |
| m1 `corpus/README.md:668` 30→41 | `corpus/README.md:743-746` (same bullet) |

Each clearing line satisfies the counter's four supersession conditions (`check-selfassessment.mjs:245-254`): names the same script, states the oracle-correct figure, carries a correction marker, cites the superseded line. Set-difference `gone findings = 0`; rerun counted = `[]`.

## m4 findings at HEAD — all 10, with claimed/observed/superseded

| line | round | claimed | observed | superseded | note |
|---|---|---|---|---|---|
| `SCORECARD.md:1126` | 23 | inactive | inactive | false | matches (was so at baseline) |
| `SCORECARD.md:1215` | 24 | inactive | inactive | false | matches |
| `SCORECARD.md:1277` | 25 | inactive | inactive | false | matches |
| `SCORECARD.md:1333` | 26 | inactive | inactive | false | matches |
| `SCORECARD.md:1382` | 27 | inactive | inactive | false | matches |
| `SCORECARD.md:1456` | 28 | inactive | null | false | CNE: "no `Axes at round start:` with all six axes in the round group" (unchanged from baseline) |
| `SCORECARD.md:1473` | 29 | inactive | active | **true** | cleared by `:1612-1616` |
| `SCORECARD.md:1515` | 30 | inactive | active | **true** | cleared by `:1618-1620` |
| `SCORECARD.md:1576` | 31 | inactive | active | **true** | cleared by `:1622-1626` |
| `SCORECARD.md:1643` | 32 | active | active | false | **new**, round-32 declared-claims text states the nudge correctly |

## NEW findings from round-32 text

7 findings exist at HEAD that do not exist at the freeze reading (full diff in `compare.json`):

- **NEW could-not-evaluate (the residue this seat reports):**
  - `LOG.md:2154` — m1-selftest-tally, claimed 27, observed null, `couldNotEvaluate: "ambiguous script association"`. Line reads "Self-tests at the freeze: `BIDI_RUNTIME_SELFTEST verdict=clean cases=27 passed=27` (exit 0)," — the `cases=` summary names no `scripts/*.mjs` path, so the m1 association finds no script target (`check-selfassessment.mjs:230-231`).
  - `LOG.md:2155` — same class, claimed 41, observed null, same why (`SELFASSESSMENT_SELFTEST … cases=41 passed=41`).
  - CouldNotEvaluate 104 → 106 (+2, exactly these two). **Minor defect.** Smallest append-only fix: none exists that clears them — the supersession pass skips `observed === null` findings (`check-selfassessment.mjs:250`), so no correction paragraph can mark a CNE superseded, and the stale lines cannot be edited. The only true fix is a counter/shape change (out of scope; counter frozen) — e.g. future round entries should state per-script tallies ("`scripts/check-bidi-runtime.mjs` `--selftest` (27/27)") as SKILL.md:2760 already does. This matches the round's own `notClaimed` disclosure ("word-numeral and `<name>_cases=` tallies … NOT claimed"): the shape is disclosed, the counter still publishes it as CNE. No claim, target, or gate verdict flips.
- **New but clean (not defects, they match their oracles):** `SCORECARD.md:1610` (41/41 measured), `SCORECARD.md:1657` (27/27, `check-bidi-runtime.mjs`), `SCORECARD.md:1643` (m4 r32 active/active), `SKILL.md:2760` (41/41), `corpus/README.md:744` (41/41).
- **NEW counted findings: none.** `counted: []`, `mismatches: 0`.

## Outside-counter observation (for completeness)

`LOG.md:2222-2226` appends "Correction (supersedes the round-31 stagnation-nudge statement at `LOG.md:2072`): the nudge was active for round 31 …". `LOG.md:2072` is not an m4 finding — the m4 class reads `SCORECARD.md` only (all 10 m4 findings above) — so this correction has no counter-visible effect; it supersedes the narrative statement only. Consistent with the round's LOG text, which says the frozen round-29/30/31 `claims.json` files carry the same statement and are not edited.

## Residual risk and verification gaps

- This seat re-ran C2 only; C1's live gate was not exercised here (not in my item).
- The two new CNEs inflate the published `couldNotEvaluate` count; anyone gating on CNE=0 would fail, but no frozen claim does.
- The counter's association/supersession semantics were read from the frozen source at HEAD (`check-selfassessment.mjs:224-254, 500-506, 528-539`) to interpret, not to modify, the output.
- No network fetches were needed for this item; no tools were installed (node v24.21.0 and git preexisting; pacman untouched).

## Hygiene

- No chromedriver/chromium was started (C2 is static + git only). `pgrep -fa 'chromedriver|chromium'` after the run shows one line: pid 1371 `/usr/bin/earlyoom -r 3600 … --prefer (^|/)(java|node|chromium|python3?)$` — the host OOM daemon whose config *mentions* chromium; no chromedriver/chromium process exists, none owned by this seat.
- Receipts copied to `.ufo/waves/round-32/w2/RerunC2/` before teardown: `c2-rerun-head.json` (raw counter output, 88,304 bytes), `compare.json` (baseline↔rerun set diff), `docs.diff` (freeze→HEAD diff of the four documents, 376 lines).
- Scratch `/fast/scratch/hyaku/tabi-r32/RerunC2` deleted after copying; nothing left on disk.
- Lane checkout untouched (read-only git; all runs in the scratch clone; `git rev-parse --show-toplevel` verified = clone before any command).
