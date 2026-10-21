# CriticC3Calibration — round 19 C3

## Verdict and axes

**Verdict: conditional / not yet closed.** d1 is independently measurable if the counter parses the actual QUALITY entries; d2 contains one factual overstatement and is vulnerable to a circular expected-ID list; d3 is a real metadata correction but remains bookkeeping unless the counter derives both old and new state; d4 is not proven by an L1-authored ledger, and its specified `git status --porcelain` snapshots have a concrete false-negative shape. Primary affected axis: **calibration** (accuracy of corrections and their evidence). d2 also limits confidence in the six round-18 error assertions; d4 is a writer-isolation/conformance boundary. Nothing here establishes changed browser behavior or a runtime-axis gain.

## Counterexample and evidence

### d1 — good correction shape, provided the count is derived from source records

The routed typo is concrete: `LOG.md:1059` says “QUALITY33–38 arise from the lesson's mistake rows” (round-18 verifier spot-check §Routed defects 1, lines 143–145). The current `corpus/QUALITY.md:139–165` has seven numbered criteria, 33–39, with round-18 lesson references. PLAN.md:44–45 correctly requires the counter to derive the count from QUALITY rather than accept the correction's number.

**False-positive boundary:** a substring count of numerals or a counter-owned literal `7` would not establish seven distinct criteria. It should parse each numbered criterion, require the exact consecutive set 33–39, verify each counted criterion cites `corpus/lessons/round-18.md`, then compare that derived result to the LOG correction. Otherwise a duplicate number, unrelated 33–39 mention, or missing criterion could still be called “seven.”

### d2 — circular-list risk; “six substrings” is not accurate

Independent comparison of the frozen round-17 and round-18 harnesses identifies six predicate IDs that stop asserting numeric protocol error codes: four regular cases (`invoke-unknown-tool`, `invoke-after-unregister`, `invoke-flags-off-control`, `invoke-iframe-frameid`) and two supplementary controls (`invoke-before-enable`, `invoke-domain-disabled`). The first five now assert observed message text; **`invoke-domain-disabled` only requires a nonempty error message**, not a specific substring. For example, r17 asserts `error.code === -32601` at `scripts/webmcp-invoke-round17.mjs:1872–1873`, while r18 checks only `typeof message === 'string' && message.length > 0` at `scripts/webmcp-invoke-round18.mjs:2668–2670`. Thus PLAN.md:47–49's phrase “six case ids whose … predicates replaced numeric CDP codes with message substrings” overstates one of the six. Correct it to “six original predicates no longer assert numeric codes: five assert message text, and domain-disabled asserts only nonempty text.”

The remaining source pairs corroborate the derivation: unknown-tool r17 `:1173–1183` vs r18 `:1970–1980`; after-unregister r17 `:1367–1386` vs r18 `:2163–2183`; flags-off r17 `:1527–1543` vs r18 `:2323–2340`; iframe r17 `:1613–1631` vs r18 `:2410–2428`; before-enable r17 `:1753–1756` vs r18 `:2551–2553`. The committed receipts show the original 11 case IDs and four control IDs are all `pass` in r17 and remain `pass` in r18; r18 adds `invoke-download-refused` (round-17 receipt `#/cases`, `#/controls`; round-18 receipt `#/cases`, `#/controls`). This supports “IDs and pass status retained,” but not unchanged assertion strength.

**Self-fulfilling counterexample:** if the SCORECARD correction lists six IDs and `measure-c3` copies that exact list as its `expectedIds`, the counter can pass even after a predicate ID is omitted/replaced in the harness, or when the correction list itself is wrong. Merely reading both a scribe list and a hardcoded copy does not independently derive the set. Derive per-ID predicates from the two source blobs at B, find old numeric `error.code` conditions whose new predicate removes that condition, classify the new text check (including the generic nonempty case), and require exact equality between derived IDs and the correction list. Compare the old/new receipts for preservation of all 15 IDs and pass outcomes. A red probe should mutate the correction list without touching either harness and require d2 to fail; another should change one predicate's assertion and require the derived set/classification to change.

### d3 — genuine but metadata-only; check records against their authorities

At B, both round-18 registries say `"wave": null` (`.ufo/waves/round-18/w1/swarm-registry.json:2–4`, `w2/swarm-registry.json:2–4`), while their specs declare `tabi-round-18-w1` and `tabi-round-18-w2` (`w1/spec.json:2`, `w2/spec.json:2`). The current round-19 w1 registry and spec both declare `tabi-round-19-w1` (`w1/swarm-registry.json:2–4`, `w1/spec.json:1–3`). This is a real, countable correction to traceability, not a runtime behavior change.

To avoid counting a narrative as evidence, enumerate every `round-19/**/swarm-registry.json` at REV and compare its `wave` to the corresponding spec's `wave`; independently verify both old null values against their B specs. Verify the correction note cites both paths and the stated dispatch-output/file distinction against the retained dispatch result, rather than accepting a copied cause sentence. If the counter checks only a fixed w1 path or literal note text, a missing w2 registry or an unsupported root-cause explanation can pass.

### d4 — ledger is an index, not independent proof; status snapshot collapses the relevant paths

The underlying defect is real: the non-author round-18 check says wave-1 writers used one checkout rather than separate writer worktrees (round-18 verifier spot-check §Routed defects 2, lines 146–148). But a ledger written by L1 cannot, by its own assertions, prove the clone paths, branch/base/commit, assigned-path boundary, complete writer inventory, or lane snapshots.

There is a concrete granularity counterexample in the existing pre-wave evidence: `round-19/isolation/lane-status-before-w1.txt:1` contains only `?? .ufo/waves/round-19/`. I independently read the current lane status: `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain` emitted that same one-line directory status; the same command with `--untracked-files=all` has **21** entries. Therefore two default porcelain snapshots can be equal while arbitrary new files are added beneath the already-untracked round-19 directory; they cannot demonstrate that only seat reports were added. This does not prove anyone bypassed isolation; it proves the proposed equality test cannot rule it out.

**Smallest safe correction:** keep the ledger as an index, but have the counter derive the expected writer roster and per-seat assigned paths from the wave spec/assignments, then inspect each actual clone's branch, B parent, commit tree, changed-path set and clean status instead of trusting the ledger's claims. Use path-complete status (`--porcelain=v2 -z --untracked-files=all`) and independently captured before/after snapshots from a non-L1 observer. The existing pre-wave snapshot is already too coarse; unless an independent full-detail pre-wave capture exists, d4 cannot be claimed closed retroactively from this ledger. Report “ledger recorded” only, or leave d4 uncredited until an independent audit can establish the full writer set and lane delta.

## Smallest plan changes

1. Clarify d2's six-ID wording: five message-substring predicates plus one generic nonempty-message predicate. Require the counter to derive IDs/classes from the two harnesses and compare—not copy—the correction list.
2. Specify d1's exact criterion-enumeration rule and d3's recursive registry/spec matching plus old-state checks.
3. Replace d4's L1-ledger-only authority/default porcelain equality with direct clone inspection and independent path-complete lane snapshots. Current pre-wave evidence is insufficiently granular; do not count d4 if no independent complete capture exists.

## Evidence scope

Reviewed only local round-18/round-19 plan, source, registry/spec, receipt and snapshot artifacts. No source tree, browser, test suite or runtime was exercised; no tool was installed or updated. The current lane-status command was a read-only, task-specific probe.

## Isolation

- Clone: none (read-only critic; no production file written).
- Branch/base/commit: not applicable.
- Changed path: `.ufo/waves/round-19/w1/CriticC3Calibration.md` (scoped report only).
