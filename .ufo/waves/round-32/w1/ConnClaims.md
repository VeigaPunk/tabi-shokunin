# ConnClaims — cross-claim pattern scan: are C1 and C2 causally separable?

**Verdict.** Yes — C1 and C2 are causally separable at the frozen counters: landing C1 (new gate
`scripts/check-bidi-runtime.mjs` with self-test 27/27, capability row `First-working round: 32` in
SCORECARD.md, registry row in SKILL.md, stub entry) leaves C2's frozen reading **byte-identical at
18 mismatches** (15 m1 + 3 m4), and C2's append-only corrections touch none of C1's paths — verified
by re-running the frozen v3 counter against five simulated post-landing trees in a scratch clone.
The coupling is narrow and one-directional on the *authoring* plane, not the counting plane: (1) the
round-32 block's own `nudge` statement and the new gate's tally are *new evaluated surface* for C2 —
if the L1 copies the stale rounds 29–31 pattern (`nudge inactive`) into round 32, C2 gains a 19th
finding (`m4 SCORECARD.md:1610 inactive→active`), and if the new gate's tally is misstated (e.g. 41),
C2 gains two m1 findings (`SCORECARD.md:1617`, `SKILL.md:2631`, claimed 41 vs observed 27); (2) C1's
capability row changes the **derived** nudge state for rounds 33–35 (window N−3..N−1 then contains
32), so round 33+ blocks must state `nudge inactive` — simulated round-33 `nudge active` produced
`m4 SCORECARD.md:1629 active→inactive`; (3) C1's SCORECARD/SKILL edits must stay append-only — an
in-place capability-table edit would inject deleted lines into C2's `git diff --numstat` leg (kill
rule) and, if made above line 1576, would shift the stale-line numbers that C2's corrections must
cite. With those three disciplines held, both claims land together: simulated C1+C2 tree reads
**mismatches 0, clean, exit 0, numstat 39/24/6 added, 0 deleted**.

## Setup

- Clone: `git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone` then
  `git -C "$S/clone" checkout -q --detach 4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6` (claims/controls
  freeze; `5ad1fcbf` counter-fix is its ancestor; `2f8535c5` counter freeze below it). Lane checkout
  untouched (read-only git only).
- Counter bytes verified against `frozenDigests`:
  `sha256sum scripts/check-selfassessment.mjs scripts/check-bidi-runtime.mjs` →
  `77b5c8ed…4c6a9`, `2f25af5a…c393` (match claims.json). Exit codes: both `0`-printing paths only.
- No browsers launched: `check-bidi-runtime.mjs --selftest` is hermetic (chromium appears only in
  `liveRecord`, the `--live` leg; verified by grep). `pgrep -fa 'chromedriver|chromium'` after all
  runs: only PID 1371 `earlyoom` (system daemon whose argv regex mentions chromium) — none owned by
  this seat. All counter runs with `TMPDIR=$HYAKU_SCRATCH/tabi-r32/ConnClaims/tmp`.
- Network: none (no fetches were needed).

## Baseline (do-nothing) — reproduces the freeze receipt

```
TMPDIR=$S/tmp node scripts/check-selfassessment.mjs --rev 4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6 --json
```
exit **1**; `mismatches 18` = 15 m1 (`SCORECARD.md:1439 17→41, :1465 22→41, :1486 22→41, :1564 30→41;
SKILL.md:2479 13→41, :2515, :2530, :2545, :2576, :2578, :2590, :2594, :2598; corpus/README.md:613,
:668`) + 3 m4 (`SCORECARD.md:1473, :1515, :1576 inactive→active`). Receipt: `receipts/baseline-c2.json`.
Also: `node scripts/check-bidi-runtime.mjs --selftest` → exit **0**,
`BIDI_RUNTIME_SELFTEST verdict=clean cases=27 passed=27` (this is the oracle C2's m1 will use for the
new gate once C1 lands).

## Simulation (committed trees in the scratch clone; C2 counter re-run per tree)

Variant bodies (all append-only): SCORECARD round-32 disposition block (axes at round start: all six
from claims.json `axisScoresAtRoundStart`; `Saturation 8 / window 3`; nudge word per variant; C1 row
naming `scripts/check-bidi-runtime.mjs … --live --json`), a per-round `## Capabilities` table whose
last cell is `32`, a SKILL.md round-32 registry row with the gate's `--selftest` tally, and the stub
entry `corpus/knowledge/webdriver-bidi-runtime-round-32.md`. Git identity `ConnClaims <ConnClaims@scratch.local>`.

| Variant | Tree | Command | Exit | mismatches | Delta vs baseline |
|---|---|---|---|---|---|
| A — C1 landed, correctly authored (`nudge active`, tally `(27/27)`) | `e77f6ac` | `node scripts/check-selfassessment.mjs --repo $D --rev e77f6ac --json` | 1 | 18 | none — counted list byte-identical to baseline |
| B — A but round-32 says `nudge inactive` | `17fa85c` | same against `17fa85c` | 1 | 19 | +1 m4 `SCORECARD.md:1610 inactive→active` |
| C — A but new-gate tally stated `(41/41)` | `2aeeaf8` | same against `2aeeaf8` | 1 | 20 | +2 m1 `SCORECARD.md:1617 41→27`, `SKILL.md:2631 41→27` |
| D — A + round-33 block stating `nudge active` | `04d6ee3` | same against `04d6ee3` | 1 | 19 | +1 m4 `SCORECARD.md:1629 active→inactive` |
| E — A + C2's 18 append-only corrections | `bbe1a3b` | same against `bbe1a3b` | **0** | **0**, clean | all 18 superseded (sup=39) |

Receipts per variant in `receipts/c2-{simA,simB,simC,vD,vE}.json` (plus `c2-simD/simE.json` from the
first, invalidated batch — see Receipts note).

Evidence that A's new content was genuinely evaluated (from `receipts/c2-simA.json`, `findings` but
not `counted`): `m4-nudge-state SCORECARD.md:1610 round 32 claimed active observed active`;
`m1-selftest-tally SCORECARD.md:1617 script scripts/check-bidi-runtime.mjs claimed 27 observed 27` —
i.e. the m1 oracle executes the new gate's hermetic self-test and the m4 rule re-derives round 32
against the new capability set. Variant D's `1629 active→inactive` additionally proves the parser
picked up the `32` capability row (window 30–32 for round 33 now contains it: rounds 33, 34 `[31,33]`
and 35 `[32,34]` also contain 32; round 36's window `[33,35]` does not).

Numstat legs (`git diff --numstat 4181fffb <rev> -- SKILL.md corpus/README.md SCORECARD.md LOG.md`):
A/B/C `20 0 SCORECARD.md, 4 0 SKILL.md`; D `26 0 …`; E `39 0 SCORECARD.md, 24 0 SKILL.md, 6 0
corpus/README.md` — **0 deleted lines everywhere** (exit 0 each; git diff exits 0 even with
differences, and the counts were read from stdout).

## Direction 1 — does landing C1 change C2's reading?

- Existing 18: **no.** The `First-working round: 32` row is outside the m4 stagnation windows of
  rounds 29–31 (`[26,28]`, `[27,29]`, `[28,30]`), so `SCORECARD.md:1473/:1515/:1576` still derive
  `active` against claims of `inactive`; the 15 m1 lines name `check-selfassessment.mjs`, whose
  oracle tally (41) is unchanged by C1. Variant A: counted list identical to baseline.
- New evaluated surface: **yes, conditionally.** Round 32's own nudge statement (observed `active` —
  window `[29,31]` contains no capability) and every line carrying the new gate's tally are checked.
  Correctly authored → zero new findings (A). Misauthored → B (+1 m4) and C (+2 m1). This is the
  only way C1 can move C2's *count*, and it is fully under the L1's pen.
- Future derived state: **yes.** C1's own capability entry makes the nudge derive `inactive` for
  rounds 33–35 (D). This does not affect C2-of-round-32 (whose `REV` is this round's tree) but is a
  real downstream obligation the L1 must write down.

## Direction 2 — does C2's correction text touch C1's paths?

**No.** C2's corrections are appends to `SCORECARD.md`, `SKILL.md`, `corpus/README.md` (LOG.md needs
none this round). C1's artifacts are `scripts/check-bidi-runtime.mjs` (frozen; untouched), the new
entry `corpus/knowledge/webdriver-bidi-runtime-round-32.md` (untouched), and its receipts under
`.ufo/waves/round-32/measure/` (untouched). Cross-checks: `grep -nE 'SCORECARD|SKILL|README|LOG\.md'
scripts/check-bidi-runtime.mjs` → no output (the C1 counter never reads the four documents C2 edits);
`git diff --name-only 4181fffb <vE>` = `SCORECARD.md SKILL.md corpus/README.md
corpus/knowledge/webdriver-bidi-runtime-round-32.md` — the shared files are exactly the append-only
ones, and C2's corrections never cite or modify anything under `scripts/`, `corpus/knowledge/`, or
the capability table. Appends do not shift earlier line numbers, so C2's `DOC:N` citations stay valid
no matter what C1 appends. One shared-file hazard in reverse: C1 must not edit the round-32 row into
an *existing* capabilities table (in-place row = 1 deleted line in numstat → C2 kill rule; insertion
above line 1576 would also shift every stale citation C2 must make).

Benign-by-construction surfaces: C2's m2 scans `corpus/evidence/**/*.json` for `command`/`exit`
pairs; C1's receipts live outside that tree, and even non-closed-grammar commands there read as
could-not-evaluate, never a counted mismatch. C2's m3 (unlanded paths) reads the newest
`## Round N — executed disposition` heading vs `git status --porcelain` — environment, not claim
content; both claims are measured in clean checkouts per the measurement rule.

## What the L1 must disclose

1. **Round 32 states `nudge active`.** The rounds 29–31 pattern (`nudge inactive`) is stale and
   copying it into round 32 creates a new m4 finding (B: `SCORECARD.md:1610`). C2's corrections for
   1473/1515/1576 remain necessary regardless of C1 — C1 does not clear them.
2. **New-gate tallies state 27**, in every window, with the script named on the tally's own line
   (SKILL.md/README windows are lineOnly — no section fallback): a 41-figure or an unassociated
   tally is a new m1 (C) or an ambiguity could-not-evaluate (never a match).
3. **The capability row is an append** (own `## Capabilities` table), preserving C2's 0-deleted-lines
   numstat leg and the stale-line citations.
4. **Rounds 33–35 derive `nudge inactive` because of round 32's own capability entry** (D) — future
   rounds must not carry `nudge active` forward, or land another capability inside the window.
5. Separability statement for the report: C1 and C2 verify independently at the frozen counters
   (E reaches mismatches 0 with C1 present), coupled only by the three authoring disciplines above —
   all within the L1's control, none requiring the other claim to land first.

## Receipts note

`receipts/` holds the eight counter JSON readings named above (`c2-simD/simE.json` are from an
intermediate batch whose sed substitution failed and whose branches were rebuilt as `simA–C` then
`vD/vE`; the branch tips `simD=87bbe3d`, `simE=f5aa3a9` measured inert-placeholder text and are
superseded by `vD=04d6ee3`, `vE=bbe1a3b`). Scratch clone, temp trees, and the `tmp/` dir were removed
after copying receipts (hygiene contract); no lane files were written; no tools installed.
