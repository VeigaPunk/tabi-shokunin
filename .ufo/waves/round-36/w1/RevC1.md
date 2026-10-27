# RevC1 — C1 fabrication-class review (tabi round 36, w1)

Seat: RevC1 · Scope: C1 claim end-to-end fabrication classes · Freeze: 2e7b7a8920bff47fae6f75c3d06e48e37767099e

## Verdict summary

The C1 claim verifies end to end. All four assigned checks pass. One minor latent defect found
in the frozen build tool (generator PINS.kama typo, 39-hex, unresolvable) — no effect on the
derived ledger, the frozen counter, or any control; disclosed below as a finding for wave-2/L1
awareness.

## Check 1 — every ledger row's status derivable from git objects (sampled 14 rows, 9 lanes)

Sampled across lanes with independent `git show` re-derivation (pin text vs head text; moved
rows checked for verbatim relocation at the named line):

- 11 `unchanged` rows (chousa archived-export-intake.md:141; kaidoku SKILL.md:98,188; kake SKILL.md:20;
  kama consumer-registry.md:61; kumitate kimi-skills-plugins.md:6,218; mado hyprland-gkeep-geometry-r43.md:70;
  mori observability-census-r1.md:142; tameshi gates-survey-kagi.md:287; tsukuroi SKILL.md:2547) — all re-derived `unchanged`.
- 3 `moved` rows (kaidoku SKILL.md:585→:748, :621→:784, :652→:815) — cited text differs at the head line and
  verifies verbatim at exactly the named relocation line in each case. Matches the claim's sentence
  (SKILL.md 585->748, 621->784, 652->815).

Two further full-pool derivations agree: (a) the frozen build tool run to scratch regenerated a ledger
**byte-identical** to the committed `corpus/adjacency-screen-drift.tsv` (307 rows: 304 unchanged, 3 moved,
0 stale); (b) the frozen counter re-derived all statuses with `auditFindings: 0`, `auditMissing: 0`.

## Check 2 — 'before' sentence true at the baseline

- `git cat-file -e 11c64b96f357de106c30a71c5e21ca44a3eacdc0:.ufo/waves/round-36/baseline/c1-delta-pins.json` → exit 128
  (absent at baseline). ✓
- c1-J0-absent-instrument receipt: exit 2, stderr "c1-delta-pins.json absent at 11c64b96…". ✓
- c1-J1-do-nothing receipt: exit 1, `drift.auditCoverage 0`, `auditMissing 307`, predicate false. ✓
- All frozen digests match at the freeze commit: counter 8a223faf…, generator c8153a5a…, delta pins
  81019362…, check-adjacency.mjs 4e2c2a64…, controls.mjs 27dba3eab…, measure.sh 6a652aca…. ✓

## Check 3 — no universal clause hides an unmeasured set (307 two ways + delta pool)

- Way 1: `wc -l` ledger data rows = **307** (304 unchanged, 3 moved, 0 stale; header `sibling_ref\tstatus\tnote`).
- Way 2: frozen counter at 2e7b7a8 → `drift.total = 307`, `auditCoverage 307`, `auditMissing 0`,
  observed {unchanged:304, moved:3, stale:0}.
- Key-set equality: the 307 ledger refs == the 307 screen-ledger rows citing drifted lanes
  (per-lane counts chousa 1, kaidoku 137, kake 51, kama 9, kumitate 66, mado 20, mori 2, tameshi 1,
  tsukuroi 20; kasegi/kengaku/revenger drifted with 0 citing rows); no duplicate refs; no fabricated keys.
- Closed-pool integrity: screen ledger 383 data rows all validate as candidates (`screenFindings 0`,
  `completeness.unaccounted 0`) — rows were neither added (forging extra drift rows is refused by the
  screen check) nor deleted (completeness would rise).
- Delta leg: `delta.total 0` two ways — counter, and an independent `git diff pin..head` over the 12
  drifted lanes' SKILL.md + corpus/knowledge/*.md (0 added browser-ground non-tabi lines, 0 new vs pin
  text set). Claim's "post-pin delta pool is EMPTY (0 added browser-ground lines … verified by git diff)" holds.
- 12 drifted lanes confirmed from the pins file vs the counter's PINS; all 12 frozen delta heads resolve
  in their sibling repos (9 sampled by hand incl. kasegi/kengaku/revenger; all 12 via the counter's
  resolveCommit, which would Refusal otherwise). 0 stale / 0 files gone.
- Predicate sentence is identical across claims.json C1, the counter header comment, and the counter's
  `predicate` field (verified line by line); counter run at freeze: exit 0, predicate true.

## Check 4 — controls bind

Read receipts + provenance + controls-summary.json; all six match the claims.json controls block exactly:

- c1-J0: exit 2 (instrument cannot read round-start tip; pins absent). ✓
- c1-J1: exit 1, auditCoverage 0/307, auditMissing 307. ✓
- c1-J2-all-unchanged: exit 1, **exactly 3 findings**, all `audit-status-mismatch` ("unchanged != observed
  moved") on rows 6-8 naming exactly the 3 kaidoku moved refs; auditCoverage 304. ✓ (the assigned check)
- c1-J3-wrong-relocation: exit 1, exactly 3 `audit-moved-wrong-relocation` findings. ✓
- c1-J4-delta-screen-junk: exit 1, auditCoverage 307, `delta.screenFindings` exactly 1
  (`screen-not-a-delta-candidate`, junk kama@head:SKILL.md:1 row) — refused against the empty delta pool. ✓
- c1-J5-honest-floor: exit 0, predicate true, 307/307 — the claim is reachable. ✓

## Findings

1. **minor — latent pin typo in the frozen build tool; claim and ledger unaffected.**
   `.ufo/waves/round-36/baseline/c1-drift-audit-build.mjs:21` pins kama at
   `e8fa87ef19ec5eb28f5fd9701a0a42a45bd688d` — 39 hex chars, not a valid git object id — while the frozen
   counter `.ufo/waves/round-36/counters/c1-adjacency-sweep-v4.mjs:102` and the round-35 v3 counter pin kama
   at `e8fa87ef19ec5eb28f5fd9701a0a42da45bd688d` (40 chars, resolves in kama-shokunin, commit
   "round-46: final tip receipts…"). Effect this round: none, proven three ways — the generator only uses
   PINS for drifted-set membership (`deltaPins[kama] 3a600d2f… ≠ either string`), it reads the pin from each
   screen ref (not PINS) for the derivation, and its regenerated ledger is byte-identical to the committed
   one. Latent divergence: in the hypothetical where a drifted lane's frozen head equals the true round-35
   pin, the generator would call kama drifted when the counter calls it not-drifted. The file is
   digest-frozen (c8153a5a…), so the typo is part of the frozen contract; correcting it is a later-round
   amendment, not a w1 edit. Wave 2 should derive statuses from the counter, not from the generator's PINS.

## Residual risk / verification gaps

- Statuses beyond the 14-row manual sample rest on the frozen counter's re-derivation plus the build tool's
  byte-identical regeneration; both read only git objects and agree at 307/307 with 0 findings. A full
  307-row by-hand re-derivation was not done (sampling plus two full-pool derivations judged sufficient
  against the fabrication classes).
- The counter's delta-head resolvability and stale re-disposition legs are exercised by the live run
  (predicate true); the stale re-disposition branch itself is dead this round (0 stale rows), as disclosed.
- No disagreement with any claim sentence found. C2 was out of scope.

## Tooling

No installs or upgrades were needed (git, node, jq, awk already present). Nothing added to PATH.

VERDICT finding minor: C1 claim verifies end to end (307/307 derived, before-sentence true, delta pool empty
two ways, all six controls bind exactly as disclosed); one minor latent defect — c1-drift-audit-build.mjs:21
PINS.kama is a 39-hex typo of the true round-35 pin (counter line 102 has the correct 40-hex pin); no effect
on the derived ledger, the frozen counter, or any control this round.
