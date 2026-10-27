# W1-62 — C1/C2 cross-axis overlap scan

Axes: calibration (C1), coverage (C2). No adjudication; this is a bounded predicate-overlap review.

## Evidence

- Frozen claims distinguish C1's round-37 routed-defect repair from C2's Playwright Firefox/Juggler capability: `.ufo/waves/round-38/claims.json:18-41`. C1 expressly says S144 is only for C2 and its source is the round-37 spotcheck (`claims.json:29`); C2 requires a newly opened S144 row (`claims.json:40-41`). Thus they have different declared evidence/source dependencies.
- C1 D1-D6 are all correction/measurement checks, and D2 specifically reads reports under `.ufo/waves/round-37/w1` (`counters/c1-routed-defects.mjs:13-44,103-138`). C2 operates its own embedded loopback fixture; its driver records requests, interaction, screenshots, and cleanup (`scripts/playwright-firefox-loopback-round38.mjs:27-57,60-143`). No shared runtime predicate is evident.
- D1's correction-presence predicate uses broad lexical proximity: a later line matching a seat-count phrase or a w2-absence phrase plus a nearby round-38/correction term qualifies (`c1-routed-defects.mjs:83-89`). This is a calibration boundary risk: an unrelated correction paragraph nearby can satisfy the textual part; the independent seat-count/w2 evidence mitigates but does not bind the correction to a specific claim or section.
- C2's driver registers browser request/response events (`:88-90`) and samples `ss` every 400ms, counting only sampled lines for PIDs captured from a process-list snapshot (`:74-83`). Its stated zero-observed-non-loopback-sockets is therefore sampled evidence, not a proof of no transient or unobserved egress. The predicate wording appropriately says “observed” (`claims.json:37`), but should not be generalized into an unconditional network-isolation claim.

## Overlap / confounding conclusion

No duplicated claim predicate or direct source dependence between C1 and C2 is established by frozen declarations: separate axes, source materials, and runtime surfaces. The concrete shared risk is evidentiary language, not shared behavior: C1's D1 lexical correction test and C2's sampled socket metric can be over-read as stronger semantic/negative guarantees than their implementations provide. The sibling-domain boundary is especially relevant to C2: Playwright Firefox/Juggler loopback capability demonstrates a local fixture workflow, not broad browser coverage or production-network security.

## What would falsify

- C1/C2 predicate overlap: show the C1 counter consumes C2's driver/receipt or that C2's counted success depends on C1's D1-D6 artifacts; current declared/source paths do not show this.
- D1 correction-boundary concern: demonstrate a malformed nearby correction paragraph is rejected by the counter, or that its match is structurally constrained to the intended correction.
- C2 network-boundary concern: provide continuous/process-attributed socket evidence covering the full browser lifetime (including launch/close edges) and show all browser traffic is constrained to loopback; current 400ms polling cannot exclude unsampled intervals.

## Proposed bounded move

Keep claims independent; tighten only interpretation/evidence: describe C2 as sampled zero-observed non-loopback sockets (not no-egress), and require D1's correction text to be tied to a named round-38 correction section or explicit correction marker rather than proximity. This preserves both axes and reduces false confidence without coupling their predicates.
