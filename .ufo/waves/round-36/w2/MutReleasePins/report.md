# MutReleasePins — round 36 w2

Target: `scripts/check-release-pins.mjs` from landing `f2f3f14555ec1db6d8c3a6dc9e4059ef9489b8c7`.

## Probe

Scratch tree was materialized from the requested landing bytes using `git archive`. The gate cannot resolve the landing SHA in an archive tree because that tree does not contain the source repository's Git objects. I initialized the scratch tree as a fixture repo (asserted its top-level path) and committed its archived contents; fixture revision: `ddd397c9856846014c3918e182f6faa87866ba49`.

- Pristine fixture-tree reading: `node .../check-release-pins.mjs --repo $S --rev HEAD --stable 156.0.8078.47 --json` exited **0**, population **24**, resolved **24**, holds **17**, drifted **7**, clean true.
- Pristine self-test: exited **0**, **29/29** passed.
- Initial requested-SHA invocation against the archive: exited **2**, `could-not-evaluate` / unresolvable revision (expected artifact of archive lacking git objects, not a gate failure).

## Mutation coverage

The requested paired honest/junk-tree probes were **not run**: no behavior-bearing mutant was introduced. Consequently m1 (f6 twin-seat), m2 (f5 digest), m3 (on-release cadence), and m4 (bytes-path existence) are **inconclusive**, not killed or survived. The pristine self-test does exercise named baseline cases for f5 digest mismatch, same-seat refetch, and absent committed bytes, but that is not mutant evidence; there is no cadence-mutant case identified in this run. No restoration claim is made for mutant bytes; the pristine gate SHA-256 remained `915a6bba21223a4871c7f4ebbf27c5b4295137910c9ddec11bd5c31e2f55a648`.

VERDICT could-not-evaluate — pristine baseline reproduced, but assigned m1–m4 paired mutation probes were not completed.