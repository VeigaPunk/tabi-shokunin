# Exec16 — unrelated-citation adversarial fixture

Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`. Assigned scope: design the C2 adversarial fixture in which a later correction cites a different stale tally and therefore must not supersede the target stale tally. No production code or tracked files changed. No tools installed/upgraded; no pacman transaction.

## Axes

- **Calibration (C2):** test whether a correction's cited line is bound to the stale finding it purports to supersede.
- **Depth:** make the red control isolate citation association rather than missing correction marker, wrong oracle number, or missing script identity.

## Evidence and proposed case

Frozen claims were read from `.ufo/waves/round-28/claims.json` (C2, lines 12 in file): it requires mismatch retention unless the exact line is cited, plus a negative unrelated-citation and positive exact-citation selftest control. The same file names baseline `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4` (line 7). `git rev-parse HEAD` returned that exact baseline. `git status --porcelain | head -20` showed only `?? .ufo/waves/round-28/` at observation time; no tracked edit was made by this seat.

The required fixture can be added to `scripts/check-selfassessment.mjs`'s existing `CASES` fixture pattern (`logDoc`, lines 430–441; cases begin line 443), using two stale tally lines and then a correction paragraph explicitly citing only the *other* stale line:

```text
## Round 23 — executed disposition

`scripts/check-fixture.mjs` gate landed.
Non-vacuity: `--selftest` 12/12 across the fixture matrix.
Other stale tally: `--selftest` 11/11 in the earlier run.

Correction (supersedes LOG.md:7): `scripts/check-fixture.mjs` `--selftest` measured `cases: 13` at the tip.
```

In this literal fixture, the stale tally being tested is on `LOG.md:6`, while the correction cites `LOG.md:7`; the exact tally observation is 13 from the existing fixture gate source (`GATE_SRC`, line 416). Expected result: `LOG.md:6` remains counted as an `m1-selftest-tally` mismatch and the evaluation exits 1, despite the later correction's matching script, correction marker, and oracle-correct `cases: 13`. The second stale tally ensures `:7` is a plausible real stale target rather than an arbitrary nonexistent citation. A companion positive case should change only the citation to `LOG.md:6`; it should supersede that target stale tally (exit 0 for this isolated LOG condition). The assigned adversarial case must assert exact exit and finding class as the existing case runner does (lines 650–671).

## Grounded prior evidence

`corpus/lessons/round-27-verifier-spotcheck.md:15-16` records the live false-clear: at the round-27 measured tip, the counter said `mismatches=0` while `LOG.md:221` was claimed 8 / observed 12 / `superseded=true`, although the cited correction did not cite line 221. Lines 46–47 route the citation-binding and measurement-revision defects. `scripts/check-selfassessment.mjs:319-327` confirms the current LOG supersession predicate checks for any `:\d+` in the paragraph, not equality with `f.line`; this is the mechanism the proposed pair distinguishes. The proposed fixture is a design, not a run or measured result.

## Observation / inference / unknown

- **Observed:** baseline HEAD equals frozen baseline; only the round-28 wave directory appeared untracked in the sampled porcelain output. Source line ranges and prior evidence above were read directly.
- **Inference:** under the displayed current predicate, the negative fixture would incorrectly clear the `:6` finding because `:7` satisfies `/:\d+/`; this was not executed, and is not presented as test output.
- **Unknown:** no result from a post-change selftest or tip measurement; these are parent-owned integration gates. No installs or updates occurred.

## Report path

`.ufo/waves/round-28/w1/Exec16.md`
