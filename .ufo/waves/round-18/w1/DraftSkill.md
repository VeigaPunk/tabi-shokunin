VERDICT: PASS

Scope: draft of the SKILL.md `## Round 18` append. Written to `.ufo/waves/round-18/drafts/skill-append.md` (8727 bytes). SKILL.md, the registries and every script are untouched. Integration is L1's job.

## Behavior
The draft contains four sections, in the round-17 style:
1. Source recheck procedure (C1): the `recheck-fetch.mjs` command lines for an HTTP row (S001), a repo-path row (S029, `--body`) and `--normalize-only`; exit map 0/1/2; drift → superseding row; `measure-c1.mjs REV [--live]`. Superseded set and target 51 are taken from PLAN.md:15-21.
2. Hardened harness decision rows (C2): hazard → rule → probe table covering H1, H2, H3, H4, S1 and F6, each cited to `w2/SentinelHarnessAfter.md` or PLAN.md:22-36. S2, S3, S6 and S8 are listed as not claimed, so they are not cited as closed.
3. Freshness-wrapper invocation replacing the round-17 SKILL-only rule at SKILL.md:1919-1922. It is an append that supersedes that rule; the original lines are not edited.
4. Registry rows for six new or round-18 scripts, with sha256 = `L1 FILL`.

## Gates
- No gate was run. Nothing in this draft is verified by execution. Probe commands are copied from PLAN.md and round-17 text.
- Every row I cite was checked against the source it names: `corpus/SOURCES.md:15` (S001 URL), the S029 source cell (path), `.ufo/waves/round-18/recheck-fetch.mjs` usage header (lines 4-10), `w2/SentinelHarnessAfter.md:17-75`.

## Open items for L1 (not resolved in the draft)
- The following files do NOT exist in the lane yet (checked at draft time): `.ufo/waves/round-18/measure-c1.mjs`, `measure-c2.mjs`, `measure-c3.mjs`, `scripts/webmcp-invoke-round18.mjs`, `scripts/freshness-witness.mjs`. Their argv and exit maps are marked [INFERENCE] where they are not stated in PLAN.md. L1 must confirm them against the committed files before integration.
- The `--rev` and `--dry-run` flags of the freshness wrapper come from PLAN.md's probe list. The default when `--rev` is omitted is not stated in PLAN.md, so the draft does not claim one.
- `recheck-fetch.mjs` observed sha256 at draft time: `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` (`sha256sum` on the lane file). This is an observation, not a pin. The registry keeps `L1 FILL` and the value must be re-hashed at REV.
- The draft points the C1 example at S001 and S029 only as shapes. Their quotes and verdicts are placeholders (`"<…>"`); no live fetch was made, so no quote is claimed.

## Out of scope (not touched)
- C3 routed defects (`corpus/lessons/round-18.md ## Corrections`, `routed/**`, S058): not in the requested draft; left to the scribe.
- S2, S3, S6, S8 hazards: stay open, as stated in the draft.
- No edits to SKILL.md, LOG.md, SCORECARD.md, QUALITY.md, README.md, SOURCES.md, any script, or any byte-frozen path.

## Tooling
No tools installed or upgraded. No pacman, no jj, no git writes, no network fetches, no browser runs.

## Files written
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/drafts/skill-append.md
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/DraftSkill.md
