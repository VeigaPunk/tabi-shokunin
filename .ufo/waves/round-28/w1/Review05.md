# Review05 — C2 claim-fit review

## Finding — High: the frozen C2 target matches the actual matcher defect

Frozen claim source: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-28/claims.json`, C2, baseline `eb23c0b84668afc48ebab8bd7e4a8a4457407cc4`.

`node scripts/check-selfassessment.mjs --rev eb23c0b84668afc48ebab8bd7e4a8a4457407cc4 --json` reports the `LOG.md` finding at line 221 as claimed 8 / observed 12 / `superseded=true`; it is consequently absent from `counted`. Overall `mismatches=1` is the unrelated live-worktree `m3-unlanded-paths` finding (39 paths), so the baseline total alone does not prove the desired C2 target. The same output lists `LOG.md:254` as the later 12-case tally.

Matcher evidence: `scripts/check-selfassessment.mjs:319-327` scopes corrections to later paragraphs and checks same script, `/supersed|correct/i`, `/:\d+/`, and the observed tally. The citation regex is not compared to `f.line`. This conflicts with its stated `:/LINE/` condition at lines 309-315. The paragraph starting at `LOG.md:265` contains a time token `05:16:28Z`, names `scripts/check-freshness.mjs`, and states the 12-case result; it clears line 221 without citing it. `LOG.md:1904-1911` is another later paragraph which clears line 221 via correction text citing lines 335/391, not 221. `LOG.md:1929-1933` independently records the same diagnosis. Thus the frozen target's line-specific predicate is appropriately scoped; do not alter historical LOG prose.

## Required red/green controls

- **Red unrelated-citation control:** fixture stale tally at `LOG.md:6` says 12 where oracle is 13; a later correction paragraph names `scripts/check-fixture.mjs`, says correction/supersedes, gives 13, but cites a different line (e.g. `LOG.md:5`). It MUST remain a mismatch (`m1-selftest-tally`, exit 1), with `superseded=false`.
- **Green exact-citation control:** same stale tally at line 6 and correct oracle 13; later correction names the same script, cites `LOG.md:6`, and states 13. It MUST supersede the stale tally (exit 0).

The existing `m1-log-stale-then-corrected` fixture is a positive control: `logDoc` places tally at line 6 (`check-selfassessment.mjs:430-440`) and its correction cites `LOG.md:6` (line 512). Existing `m1-log-wrong-number-correction` is a different negative control (wrong number), not the required unrelated-citation case. The baseline selftest command `node scripts/check-selfassessment.mjs --selftest` returned `SELFASSESSMENT_SELFTEST verdict=clean cases=17 passed=17`; none of the displayed LOG cases tests wrong-line citation.

## Residual risk and verification gaps

- The frozen after-condition should be judged by the specific line-221 finding being counted as a mismatch, not merely aggregate `mismatches>0`; baseline aggregate is already 1 due m3, whose implementation uses live porcelain (`m3Findings`, `check-selfassessment.mjs:379-388`).
- The source's selftest 17/17 and baseline command outputs are observations at this checkout. No post-change controls were run; this is a read-only review, not implementation or acceptance of the claim.
- Tool installs/updates: none.
