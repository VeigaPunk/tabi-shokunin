# MutSupersessionEdge — supersession edge fixtures

## Scope and source

Attacked `scripts/check-selfassessment.mjs` at the live lane worktree, section `m1LogFindings` lines 309–327 (read output `[check-selfassessment.mjs#47F1]`). Its source comment states the paragraph must be later, name the same script, contain a correction marker, cite `:/LINE/`, and state the oracle tally. Frozen round-26 C1 `control` says a correction without line citation must not supersede (`.ufo/waves/round-26/claims.json:34`). Wave-1 `CritC1Supersession.md` independently reports paragraph-level false clears and that line-vs-paragraph unit differs from the frozen “correction line” claim; this is relevant context for (b).

## Probe and results

Created throwaway harness `scratch/MutSupersessionEdge/probe.mjs`; each fixture used a fresh `mktemp` repo under the assigned scratch directory, `git init -q`, and checked `git rev-parse --show-toplevel == $D` before its first fixture commit. Command: `node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-27/scratch/MutSupersessionEdge/probe.mjs`.

| Edge | Fixture shape | Actual result | Verdict |
|---|---|---|---|
| (a) malformed citation | correction paragraph has “supersedes note” and no digits; stale `--self-test (12/12)` | exit 0, but JSON finding has `observed:null`, `superseded:false`, `couldNotEvaluate:"script absent at <fixture rev>"` | **INCONCLUSIVE**: missing fixture gate prevents reaching supersession logic. |
| (b) same-paragraph correction | stale tally and later correction marker/citation/script/oracle all in one paragraph | exit 0, but `observed:null`, `superseded:false`, same absent-gate reason | **INCONCLUSIVE**: cannot determine intended same-paragraph behavior. Source predicate's `p.start <= f.line` guard rejects a correction paragraph whose start is the finding line, but no behavioral verdict established. |
| (c) one cited stale finding plus another stale finding for same script | two stale tallies followed by one correction citing `LOG.md:6` | exit 0, both findings `observed:null`, `superseded:false`, same absent-gate reason | **INCONCLUSIVE**: cannot determine over-clear behavior without measured oracle values. |

Fixture output snapshots: `scratch/MutSupersessionEdge/a-malformed.json`, `b-same-paragraph.json`, `c-cross-clearing.json`. The fixture intentionally did not claim a kill: all cases have no committed `scripts/check-fixture.mjs`, so the checker marks them could-not-evaluate before applying a measured supersession decision. The required detector cannot distinguish pass/fail when the measured tally is absent; baseline failure is not a killed mutant.

## Hash/restoration evidence

No mutation was applied to the lane implementation: probes were behavioral fixtures only. No tracked bytes were written or restored. Exact implementation hash before/after was not measured, so restoration hash evidence is **unknown**, not asserted. All generated material is limited to this report and `scratch/MutSupersessionEdge/`.

No tool installs or updates.