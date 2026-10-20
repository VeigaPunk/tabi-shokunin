## Round 17 — hyaku, 2026-10-20

DRAFT by scribe DraftScorecard2 (wave 2). Every value below was measured by re-running the
counters at the measured revision; nothing here is inferred. L1 copies the section into
`SCORECARD.md` at integration. Trend verdicts (expansion, quality, discernment) are not drafted here.

Baseline `5859243183c4d7ac5429dfdb8a73ce0d9a43d583` ("B"). Measured revision
`6c97851034e9d8f58b135d28ff969f1f28fa2f7d` ("M", commit "round-17: lane-tip anchored gates (C1),
WebMCP invocation receipt+note+sources (C2), checked adjacency map (C3), routed r16 evidence,
wave-1 evidence"; lane `master` = M). Every counter was run at both revisions with `--repo` set to
the lane root (see the C3 caveat below).

Claims: three, on three distinct axes, causally separable (`.ufo/waves/round-17/PLAN.md:36-40`).
- C1 works operability 8, a lowest non-retired tie (depth/operability/freshness/adjacency at 8;
  `PLAN.md:16`; scalars `SCORECARD.md:742-747`, round-16 table).
- C3 works adjacency 8, the same lowest tie (`PLAN.md:30-34`).
- C2 is a capability acquisition on coverage 9 (`PLAN.md:24-29`); coverage is not the lowest axis.
- Stagnation waiver: not used. C1 and C3 satisfy the lowest-axis rule on their own
  (`AXES.md:33-34`); the saturation line is 8 and the window is 3 (see Planned / saturation / retired).

| Axis | Scalar before → after | Round17 verdict / evidence |
|---|---|---|
| depth | 8→8 | unchanged; no depth claim declared |
| coverage | 9→9 | improved C2: held WebMCP-invocation entry 0→1 (`measure-c2.mjs` at M: `c2_invocation_held` 1, `failures` []); 10 withheld: one build, loopback only, real-site and agent-side consumption unmeasured (`corpus/README.md:302`; `corpus/knowledge/webmcp-invocation-round-17.md` Limits). Precedent: `SCORECARD.md:537-538`, `:743` |
| operability | 8→8 | improved C1: jj-anchor-safe gate entry points 0→4 (of 8 entries; 4 behavior-bearing entries pass, 4 label-only entries not credited); 9 withheld (count of gate entry points is not an operator-visible capability; precedent `SCORECARD.md:744`, `:537-538`) |
| freshness | 8→8 | unchanged; no freshness claim declared; S049–S052 added as queued rows (see Sources) |
| calibration | 9→9 | unchanged; no calibration claim declared; QUALITY criterion for the round-16 "unforgeable" overstatement is routed (`PLAN.md:169`), not scored here |
| adjacency | 8→8 | improved C3: verified adjacency dispositions 0→9 of 9 rows (`measure-c3.mjs` at M: `c3_adjacency_verified` 9; `by_disposition` ruled 1, contested-open 2, split-declared 2, refused-route 4); 9 withheld: two `contested-open` rows still await a fleet ruling |

| Claim | Before → after | Counting command | Measured revision / counter digest / evidence |
|---|---|---|---|
| C1 operability — jj-anchor-safe gate entry points | 0→4 | `node .ufo/waves/round-17/measure-c1.mjs 6c97851034e9d8f58b135d28ff969f1f28fa2f7d` → `{"c1_anchor_safe": N, ...}` (exit 0) | B: `c1_anchor_safe` 0 (`round-contract-production`, `user-contract-production`, `measurement-binding-round16-manifest`, `user-contract-fixture-full-read` all fail; B exits a0/b1/b2 1 on the first). M: 4 = `round-contract-production`, `user-contract-production`, `measurement-binding-round16-manifest`, `user-contract-fixture-full-read`. Label-only, not credited: `round-contract-count-witness`, `user-contract-witness`, `user-contract-count-witness`, `user-contract-diagnostic-witness`. Entries 8, dropped 0. Counter `measure-c1.mjs` sha256 `47185c8c07bdd065b7e6cd4d1e3e3d57f07507b414c0f8bc3bb905d63a322d9f`. Gates at M: `scripts/check-round-contract.mjs` `1579a794d9b504ff4de1f9039d5498f97706546945d7980087a3df95a6e91828`; `scripts/check-user-round-contract.mjs` `568c0421906278fe2d0ba0094c4bc48a5ae867bd683b1c5dfeabffe74585f273`; `scripts/check-measurement-binding.mjs` `388c2b4987bbb9f39f172cd40ca392b03bc9c869c1682b77576b0b986c14af74`; `scripts/selftest-measurement-binding.mjs` `8324692c65ca630dd31283e9840ea191b8ee973a1132e40465b6978122e426b3` |
| C2 coverage — held WebMCP-invocation entries | 0→1 | `node .ufo/waves/round-17/measure-c2.mjs 6c97851034e9d8f58b135d28ff969f1f28fa2f7d` → `{"c2_invocation_held": 1, ...}` (exit 0) | B: `c2_invocation_held` 0 (receipt and note absent at B; README does not name the note path). M: 1; `failures` []; `cited` S041–S048; `probesOk` true (7 counter-owned negative probes, each `held` 0: producer sha flipped, required case removed, cited row queued, cited row preexisting, control shows completed, positive not completed, control records nothing). Counter `measure-c2.mjs` sha256 `2cba594b5b4e1be332b8949d64ba1a3218843d1332c10e7a58789459f9ec17ac`; harness `scripts/webmcp-invoke-round17.mjs` sha256 `de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7` (= receipt `producerSha256`); receipt `corpus/evidence/round-17/webmcp-invoke/receipt.json` sha256 `0cfaeb7ed1b81ba797d81c23de41a4b9a24ad46b17c412f445278c26d17ce346`; note `corpus/knowledge/webmcp-invocation-round-17.md` sha256 `4896084105f2a2627a9d404de9c18d234ea84bc03fb0424cb3ae12c35a111427` |
| C3 adjacency — verified dispositions | 0→9 | `node .ufo/waves/round-17/measure-c3.mjs 6c97851034e9d8f58b135d28ff969f1f28fa2f7d --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --fleet-root /home/vgpnk/Projects/shokunin` → `{"c3_adjacency_verified": 9, ...}` (exit 0) | B: 0 (`corpus/adjacency.tsv` absent at B). M: 9 of 9 rows verified; `probes.tsv` `header_ok` true, 9 data rows; `probes.checker` present. Rows: kaidoku CDP `ruled` (self-venue line `corpus/lessons/round-16-verifier-spotcheck.md:142`, last touched by `protocol-shokunin`); 4 `refused-route`; `split-declared` kake (crawler discipline) and kumitate (WebBridge internals); `contested-open` kake and kagi (musketeer CDP profile lease). Counter `measure-c3.mjs` sha256 `8dec49726e968934df85c53c72ec30e09d8fb6e1d8cd67c125ea9759fca007c3`; checker `scripts/check-adjacency.mjs` sha256 `5a7ea9a2bf584c7cc610653510b5f91ff287d7994c503b60b9b0790120170aff`; map `corpus/adjacency.tsv` sha256 `7319ccccdd1b339d9b661ac46ca1a0c379a050e19ca03906e235ee61b7a9bf85` |

C3 caveat (recorded, not repaired): the counter derives the lane's own token from the basename of
its repo root (`measure-c3.mjs` `ownToken`). Run against a clone not named `*-shokunin` the same
M map reads `c3_adjacency_verified` 8 (row 0 fails `ruling_venue`). The 9 above is the lane-root value.

Capability (round 17):

| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
| webmcp-cdp-invocation | Invoke a page-registered WebMCP tool over CDP (`WebMCP.invokeTool`) on flag-enabled Chromium 154 loopback; record the invocation, `toolInvoked`/`toolResponded` events and the page-side result; flag-off and domain-off controls | `node scripts/webmcp-invoke-round17.mjs --out <receipt.json>`; `corpus/evidence/round-17/webmcp-invoke/receipt.json`: verdict `pass`, 11/11 required cases, 4 controls, 3 runs with pids gone, `loopback.externalRequestCount` 0 | round17 |

Limits carried with the capability: loopback only; one build (Chromium 154.0.8037.97); no real site
(`corpus/README.md:302`); agent-side consumption not claimed (`webmcp-invocation-round-17.md` Limits;
`webmcp-chromium-loopback-round-16.md:127` "No tool is invoked in the receipt" was the round-16 state).

Sources and knowledge (measured at M and B from `corpus/SOURCES.md` registry rows and `corpus/knowledge/*.md`):
- Sources 40→53 (tier A 31→43, B 4→4, C 5→6). Status mined 33→41, queued 2→6 (S049–S052 stay queued this round per `PLAN.md:217-218`), rejected 5→6 (S053, tier C corroboration only).
- Knowledge notes 33→34 (+`corpus/knowledge/webmcp-invocation-round-17.md`).

### Planned / saturation / retired — round17

- capability entered: `webmcp-cdp-invocation` (round 17). Under the window rule the round-17 capability restarts the stagnation window: round 18 is position 1 (same reading as round 16, `SCORECARD.md:773`).
- saturation 8 / window 3 unchanged. Stagnation nudge not applicable: C1 and C3 are on the lowest tie.
- retired: none. No axis declared saturated.
- planned for round 18 (candidates; L1 selects 1–3 claims, each with an axis or capability):
  - operability: convert the four label-only C1 entries into behavior-bearing entries (M counts 4 of 8; `measure-c1.mjs` output `label_only`).
  - adjacency: fleet ruling for the two `contested-open` rows (`corpus/adjacency.tsv` lines 6–7 at M: musketeer CDP profile lease, kake and kagi).
  - coverage: real-site WebMCP (operator-approval gated, `corpus/README.md:302`); agent-side consumption of page tools (`corpus/README.md:302-303`); Chromium 152 / CfT 156 untested (`webmcp-invocation-round-17.md` Limits).
  - carried: freshness re-verification of S001–S019 90-day / on-release rows (`SCORECARD.md:770-771`); operability USER 6/10 or ruled out of scope (`SCORECARD.md:771`).
