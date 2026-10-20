# BindLegacyEvidence — wave 1 report (tabi round 16)

Seat: `TabiR16.BindLegacyEvidence-5`. Owned file:
`corpus/evidence/round-16/binding/r15-counter-identity.json` (new, 6952 bytes, parses). Nothing else written.

## What was computed

All git ran in `/home/vgpnk/Projects/shokunin/tabi-shokunin` under
`env -i GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null GIT_OPTIONAL_LOCKS=0 GIT_TERMINAL_PROMPT=0 GIT_NO_REPLACE_OBJECTS=1 HOME=$HOME PATH=$PATH TZ=UTC`.
Per command the evidence JSON records the full `argv` arrays (two argv rows for the
`git show` → `sha256sum` pipeline — the JSON itself holds no shell pipelines), stdout, and exit. Every command exited 0.

### Counter blob sha256 (`.ufo/waves/round-15/measure.mjs`)

| Revision | sha256sum |
|---|---|
| `27dfd98bd6bbd85fe77fb028d531691ce066031a` | `3ee59de095750e08fc719ed19eb5baea02caf443df05479d24897783240fe384` |
| `b7cf0446a31014a81b4882857c90c565ebc14210` | `3ee59de095750e08fc719ed19eb5baea02caf443df05479d24897783240fe384` |
| `9fd8bca99d60cc1612faeeac633e1436d231bde3` | `dd9c8675ab9bbc91c20f501a90f898197d046d2586f12d2389a564385281251d` |
| `36240c70ee114347a79abb91cacab6c63044ce36` | `dd9c8675ab9bbc91c20f501a90f898197d046d2586f12d2389a564385281251d` |
| `e38d2599a922cb729186353830fff8e159b4fef0` | `dd9c8675ab9bbc91c20f501a90f898197d046d2586f12d2389a564385281251d` |

### `git diff --name-only b7cf0446… 36240c70…` (13 files, verbatim stdout in JSON)

`.ufo/waves/round-15/measure.mjs`, `.ufo/waves/round-15/w1/MeasureContracts.md`,
`LOG.md`, `SCORECARD.md`,
`corpus/evidence/round-15/{count-after-c1,count-after-c2-repaired,count-after-c2,final-production,histogram-after,measurements,round-final-production,user-final-production,wrapup-misroot}.json`

### Changed counted inputs: none

Counted-input set taken from the r15 `measure.mjs` header at `27dfd98` (`--claim C1` "reads only"
lines 17–18, C2 lines 19–21, `--histogram` lines 24–25) plus constants lines 156–165 and the
`snapshotInputs`/`originalsUnchanged` keys committed in `metadata-differential.json` at `b7cf044`:

- C1: `corpus/evidence/round-15/user-diagnostics.json`, `scripts/check-user-round-contract.mjs`
- C2: `corpus/evidence/round-15/metadata-differential.json`, `scripts/check-aria-metadata.mjs`,
  `corpus/evidence/round-13/aria/{receipt,runtime-pin,manifest}.json`, `aria-loopback.spec.mjs`,
  `playwright.config.mjs`, `actual/workers/worker-0-1530637-1792474958700.json`,
  `scripts/aria-loopback-round13.mjs`, `corpus/evidence/round-14/aria-metadata/{corrected,verification}.json`
- histogram: `corpus/SOURCES.md`, `corpus/README.md`, `corpus/knowledge/`

Intersection with the 13 changed paths is empty. The drift was the counter blob itself
(`3ee59de0…` → `dd9c8675…`, already repaired by `9fd8bca`, which sits between the measured
`b7cf044` and delivered `36240c7`) and r15 derived artifacts — no counted input or gate changed.

## Verdict on the outside claim (`corpus/lessons/round-15-verifier-spotcheck.md:120-121`)

**Agree.** Both digests reproduce exactly: `3ee59de0…` at `27dfd98` (and still at measured
`b7cf044`), `dd9c8675…` at the delivered HEAD `36240c7` and at current baseline `e38d2599`.
The defect reading holds: re-running the cited C1 argv at delivered HEAD runs a different
counter blob than the one measured, while the outside claim's "no counted input or gate drift"
is confirmed — zero counted inputs changed in `b7cf044…36240c7`.

## Notes for BindCore / BindLegacy gate consumers

- `counter_changed_since_measurement` on the real r15 data is true at any REV ≥ `9fd8bca`
  (digest `3ee59de0…` → `dd9c8675…`); the detail should carry both digests — this file is a
  ready-made fixture source.
- Measured revision `b7cf044` is an ancestor of `36240c7`/`e38d2599`, so
  `measured_revision_not_ancestor` must NOT fire on the real r15 legacy manifest; the failure
  signature on real data is `counter_digest_unrecorded` + `counted_inputs_undeclared` +
  `counter_changed_since_measurement`.

## Installs

None (git/node/sha256sum already present; pacman pause honored — nothing needed).

## Risks / blockers

- None. Advisory only; L1 re-runs gates after integration.
- `env -i` drops nothing needed here, but note each command ran with inherited `HOME`/`PATH`
  recorded in the JSON for reproducibility.
