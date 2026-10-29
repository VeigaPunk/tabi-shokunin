# RevEvidenceR42 — r41 evidence bindings re-derivation (C2 r1)

Seat: RevEvidenceR42 · Wave: round-43 w1 · Milestone: r41 evidence bindings re-derivation
Judged axis: calibration · Lane bounds: leaf, no subagent dispatch
Date: 2026-10-29 · Repo: /home/vgpnk/Projects/shokunin/tabi-shokunin (read-only)

## Task

Re-derive C2 rule r1's bindings at the round-43 freeze commit:

1. sha256 of `corpus/evidence/round41/playwright-egress/receipt.json` and `receipt.witness.json`
   equal the fields inside the committed `.ufo/waves/round-41/measure/c1-measure.json`
   (pinned measure blob id `8ff64d691f5c09569a50f2a5a038bb23774c3d35`).
2. `git rev-parse <rev>:.ufo/waves/round-41/measure/c1-measure.json` at the r41 closure
   (123e55c…, full hash to be found in r42 wave evidence), the r42 freeze
   `9b6de3a19de11abdb80e82a1310abc64a40215bb`, the r42 tip
   `15b75a7337089ed42208555a71ed89a966b21932`, baseline
   `ab592825cd195599822ca227f7768914df208201`, and the r43 freeze
   `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc` all equal the pin.

## Resolved revision identities

- r43 freeze (correct bytes): `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc`
  (`git rev-parse --disambiguate=7ca6f018` → exactly this one object; subject
  "round-43: freeze C1 signature-authenticated chain + C2 hardened checker").
  **The seat spec and w1-dispatch spell it `7ca6f018280b08dcc6c519e11…` — one nibble
  wrong at position 20 (`c` vs `a`); that string names no object.** See evidence 06.
  All checks below used the real object.
- r41 closure full hash: `123e55c77bb101be008db4cbf8ffca626423335a`. The r42 wave
  evidence (`.ufo/waves/round-42/w1/CritC2Ledger/report.md`) uses only the
  abbreviation `123e55c`; the full form resolves uniquely
  (`git rev-parse --disambiguate=123e55c` → one candidate) and is cross-confirmed in
  the r43 sibling seat ExecPinProbe's committed evidence
  (`.ufo/waves/round-43/w1/ExecPinProbe/evidence/01-rev-parse-five-revs.txt`).
  Subject: "round-41: record measured results and honest queued-wave disposition",
  2026-10-28 08:52:35 -0300.

## Results

### 1. sha256 bindings at the freeze commit — both hold

```
$ git cat-file blob 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc:corpus/evidence/round41/playwright-egress/receipt.json | sha256sum
416f6e4bb893bd31208106005dcd2b53689a6f74ada2e987b98b247277446db1
$ git cat-file blob 7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc:corpus/evidence/round41/playwright-egress/receipt.witness.json | sha256sum
d3c9972e2724e8737027c8a511434d780eff661aa2b2d70e70e848e2240f39d3
```
Fields of the committed measure record (blob `8ff64d691f5c09569a50f2a5a038bb23774c3d35`):
`receiptSha256 = 416f6e4b…446db1`, `witnessSha256 = d3c9972e…f39d3`. **Equal.**
(Evidence: `02-sha256-bindings.txt`.) The receipt sha256 also matches the r42 wave
evidence line (`CritC2Ledger/report.md` line 148). Measure file bytes hash to
`5e2a83ac02b9a4ec3f7d0ebec21f5fa9b3469d4110ac23f8e78af18b43913f13`, matching the
`5e2a83ac…` value recorded in that same r42 report.

### 2. Measure blob id at all five revisions — all equal the pin

```
123e55c77bb101be008db4cbf8ffca626423335a  8ff64d691f5c09569a50f2a5a038bb23774c3d35
9b6de3a19de11abdb80e82a1310abc64a40215bb  8ff64d691f5c09569a50f2a5a038bb23774c3d35
15b75a7337089ed42208555a71ed89a966b21932  8ff64d691f5c09569a50f2a5a038bb23774c3d35
ab592825cd195599822ca227f7768914df208201  8ff64d691f5c09569a50f2a5a038bb23774c3d35
7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc  8ff64d691f5c09569a50f2a5a038bb23774c3d35
```
(Evidence: `01-rev-parse-five-revs.txt`.) History-wide, only two commits ever touched
the measure path (`123e55c77…`, `59f21592…`), both carrying blob `8ff64d…`; the r43
tip commits `b77e84a0…`, `ba433c94…` also resolve to it; `git diff` r41-closure..freeze
on the path is empty (exit 0). (Evidence: `03-measure-blob-history.txt`.)

### 3. r1 blob-type/size gates at the freeze — hold

`git cat-file -t` → both `receipt.json` and `receipt.witness.json` are `blob` at the
freeze; sizes 1,167,198 and 1,153,988 bytes (both ≥ 1000). Receipt blob
`7b2ece05dc30cf1ba33724c8f8bb41e002ff7aff`, witness blob
`5930d20f82348be349e64565a3df74b20642d0a1`, constant at every rev that carries them.
(Evidence: `04-blob-type-size-and-evidence-blobs.txt`.)

### 4. Frozen checker at the freeze revision — green

`node .ufo/waves/round-43/counters/check-routed-defects-round43.mjs --rev
7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc --repo … --json` → exit 0,
`"predicate": true, "findingCount": 0`. (Evidence: `05-frozen-checker-at-freeze.json`.)

## Observations (informational, no checker/claim defect)

- **Freeze-hash typo in lane text:** seat spec + w1-dispatch carry
  `7ca6f018280b08dcc6c519e11…`; the committed object is
  `7ca6f018280b08dcc6a519e11…`. Prefix `7ca6f018` is unique, so resolution is
  unambiguous; no frozen artifact (claims.json, counters) contains the wrong form.
- **Evidence files absent at r41 closure:** at `123e55c77…` the tree has
  `corpus/evidence/round41/` empty — receipt/witness first enter the tree at the r42
  freeze `9b6de3a…` (consistent with the named r41 D1 class: >1 MiB files skipped by
  the directory-commit tool). The measure record committed at r41 closure names those
  paths; the byte-binding has held from `9b6de3a…` through the r43 tip. C2 r1 is
  evaluated "at the measured revision", so this history does not contradict the claim.
- Working tree at run time: HEAD `ba433c94…` (detached), unrelated unstaged changes to
  `corpus/README.md` pre-existing; all checks read committed objects only.

## Evidence index (seat dir `.ufo/waves/round-43/w1/RevEvidenceR42/`)

- `01-rev-parse-five-revs.txt` — the five rev-parse values, all `8ff64d…`
- `02-sha256-bindings.txt` — sha256 of receipt/witness vs measure fields
- `03-measure-blob-history.txt` — every commit touching the measure path; tip values; empty diff
- `04-blob-type-size-and-evidence-blobs.txt` — cat-file -t/-s gates; evidence blob ids across revs
- `05-frozen-checker-at-freeze.json` — frozen checker output at the freeze rev (exit 0, 0 findings)
- `06-freeze-hash-typo.txt` — one-nibble typo note with disambiguation proof

## Limitations

Read-only re-derivation from the local object store (no fetch possible/allowed); r42
wave evidence cites the r41 closure only in abbreviated form, resolved via unique-prefix
disambiguation and cross-confirmed against a sibling seat's committed evidence.

VERDICT ok all r41 evidence bindings re-derive at the freeze: sha256 pair matches the pinned measure record (blob 8ff64d…), and the measure blob id equals the pin at all five revisions
