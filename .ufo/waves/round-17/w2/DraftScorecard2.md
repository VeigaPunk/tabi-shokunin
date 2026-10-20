VERDICT: ISSUES

Attacked: the measured values and claim table I drafted for the round-17 SCORECARD section at M
`6c97851034e9d8f58b135d28ff969f1f28fa2f7d` (B `5859243183c4d7ac5429dfdb8a73ce0d9a43d583`), against the
PLAN claims C1/C2/C3 and the capability row. Each counter was re-run at M and at B. The three
counts hold at the lane root. One counter is path-sensitive (C3), and that is recorded as an issue, not repaired.

Measured (all exit 0, run with `--repo /home/vgpnk/Projects/shokunin/tabi-shokunin`):
- C1 `measure-c1.mjs M` → `c1_anchor_safe` 4 of 8 entries (behavior: round-contract-production,
  user-contract-production, measurement-binding-round16-manifest, user-contract-fixture-full-read;
  label-only not credited: round-contract-count-witness, user-contract-witness,
  user-contract-count-witness, user-contract-diagnostic-witness). B → 0. Matches PLAN claim 4.
- C2 `measure-c2.mjs M` → `c2_invocation_held` 1, failures [], probesOk true (7 negative probes
  each held 0). B → 0. Receipt verdict `pass`, 11/11 cases, 4 controls, 3 runs with pids gone,
  externalRequestCount 0, `producerSha256` = sha256 of `scripts/webmcp-invoke-round17.mjs`.
- C3 `measure-c3.mjs M --repo <lane> --fleet-root /home/vgpnk/Projects/shokunin` →
  `c3_adjacency_verified` 9 (ruled 1, contested-open 2, split-declared 2, refused-route 4). B → 0.

Findings:
1. C3 counter is path-sensitive (ISSUE). `measure-c3.mjs` sets `ownToken` from
   `basename(laneRepo).replace(/-shokunin$/,'')` (`measure-c3.mjs` ~line 1100). The self-venue
   author check (`checkSelfVenue`, `:296-299`) then compares the last author of
   `corpus/lessons/round-16-verifier-spotcheck.md` against `${ownToken}-shokunin`. Run from a clone
   named `tabi-r17w2-…` the same M map gives `c3_adjacency_verified` 8, with row 0 (kaidoku CDP,
   `ruled`, `corpus/lessons/round-16-verifier-spotcheck.md:142`) failing `ruling_venue`. Run from
   the lane root the value is 9. The scorecard must cite the lane-root command. Repair:
   hard-code the lane token (`tabi`) or derive it from `.ufo/` identity instead of the directory name,
   and add a counter probe that asserts the same count from a clone with a different basename.
   C1 was re-run from a differently named clone and gave the same 4 (C1 is not basename-sensitive
   in this run).
2. Scalar decision (not a defect; flagged for L1). I drafted all six scalars unchanged (depth 8,
   coverage 9, operability 8, freshness 8, calibration 9, adjacency 8), with C1/C2/C3 verdicts
   "improved". Precedent: counts of covered entries did not move scalars in rounds 13, 15, 16
   (`SCORECARD.md:537-538`, `:603`, `:673`, `:743-744`). If L1 moves operability or adjacency to 9,
   that is a new rule and must be justified in the section; the draft does not do it.
3. Capability row: `webmcp-cdp-invocation` enters with first-working round17 (receipt is a
   demonstration run in this round). Top-level `## Capabilities` still reads "— none yet —"
   (`SCORECARD.md:385` at M; round-16 row lives only in the per-round table). L1 decides whether
   round-16 and round-17 rows enter the top-level table.
4. Round-18 position: the round-17 capability restarts the window, so round 18 is position 1
   (same reading as round 16, `SCORECARD.md:773`). Saturation 8 / window 3 unchanged; retired none.
5. Sources and knowledge (measured, `corpus/SOURCES.md` registry rows): 40→53 rows; tier A 31→43,
   B 4→4, C 5→6; mined 33→41, queued 2→6 (S049–S052), rejected 5→6 (S053). Knowledge notes 33→34.
6. Counter digests at M (`git show M:<path> | sha256sum`), recorded in the draft:
   measure-c1 `47185c8c…22d9f`, measure-c2 `2cba594b…17ac`, measure-c3 `8dec4972…07c3`,
   check-adjacency `5a7ea9a2…70aff`, corpus/adjacency.tsv `7319cccc…bf85`, receipt `0cfaeb7e…ce346`,
   harness `de62820d…52d7`, note `48960841…1427`, check-round-contract `1579a794…1828`,
   check-user-round-contract `568c0421…3273`, check-measurement-binding `388c2b49…4af74`,
   selftest-measurement-binding `8324692c…26b3` (full digests in the draft).
7. Not run by this seat (not in scope, not claimed): `check-adjacency.mjs --self-test`,
   `selftest-measurement-binding.mjs`, the round-end `measurement-binding.json --check --reproduce`
   receipt (routed defect 3, `PLAN.md:164-166`), trend verdicts, and the ROUND_SCRIPT identity constants.

Concrete repair (only for finding 1): one-line change in `measure-c3.mjs` owner token + one probe.
Owned by C3Counter; this seat did not edit it.

Tools: none installed or updated. Checks run: counters C1/C2/C3 at M and B (listed above); temporary
clone at `/tmp/tabi-r17w2-DraftScorecard2-XwFH` created and removed; counter outputs kept at
`/tmp/r17w2sc/` (`c1M.out`, `c1B.out`, `c1M-lane.out`, `c1B-lane.out`, `c2M.out`, `c2B.out`,
`c3M.out`, `c3B.out`). Lane `git` was read-only (`show`, `log`, `ls-tree`, `rev-parse`); no git write,
no `jj`, no lane record written.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/drafts/scorecard2.md (new; draft SCORECARD section)
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/w2/DraftScorecard2.md (this report)
