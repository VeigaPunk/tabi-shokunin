# MetadataEnforce — round-15 w1 (executor, scoped implementation)

Owned paths only: `scripts/check-aria-metadata.mjs`, new `corpus/evidence/round-15/metadata/**`,
and this report. No historical round-13/round-14 evidence was edited. No gate, selftest,
build, lint, formatter, or smoke run was executed; every outcome below is an authored
expectation or a static derivation, and L1 owns post-integration checks.

## Axes and moves

| Axis | Move | Effect |
|---|---|---|
| calibration (C2) | Enforce all six emitted `cleanup` and eight `qualification` mirrors by independent recomputation from raw per-worker proofs | false mirror variants now exit 1 semantic; old corrected sidecar still accepted |
| calibration (C2) | Authenticated-input digest verification before any semantic evaluator | digest drift exits 2 `could_not_evaluate` / `snapshot_tampered`; sidecar false claims stay exit 1 |
| calibration (C2) | Enforce emitted Node descriptive aliases conjunctively and correction `derived`/`rule` mirrors | OR fail-open closed; old sidecar aliases already correct |
| operability | Isolated CLI selftest cases with committed exits, finding ids/statuses, exact failed sets, fixture digests, and per-input tamper literals | 36 CLI cases + 4 helpers, precise `cli_cases`/`helpers` counts |
| truthfulness | Corrected header comments and generated Node note: frozen spec did enforce minimumMajor; launcher pin summary omitted Node | no claim that the experiment skipped the floor; old frozen sidecar note stays accepted untouched |

## Files changed

- `scripts/check-aria-metadata.mjs` — sha256
  `d707625ef967ff0c8bf041ebb0ec70b73b76a1c04d6cc95101c79a110c4a600b`,
  3460 lines.
- NEW `corpus/evidence/round-15/metadata/expected-fixtures.json` — 24116 bytes,
  sha256 `3f84855045e6a29ae804e95a709464b08ebc7eaae3563796dbcca3a5f08ce70f`.
- NEW `corpus/evidence/round-15/metadata/mirror-contract.json` — 2110 bytes,
  sha256 `18857a4dbe8e9267f68598b0ad2064a967299c12fd383c5c453347923f18308e`.
- Historical bytes untouched and still match: round-14 `expected-fixtures.json`
  `19339f3eb1a959bdf8b00a13c8652fb900a49c83317c341d01a1ef88376af342`,
  round-14 `corrected.json` `e156b922d0f59f6b66c4bba8aebc708bb0484c41cce1141960a0ab82c1a56745`,
  round-13 `receipt.json` `b458b351…89b7`, round-13 `runtime-pin.json` `4d894756…ccd2`.
  No tools installed or updated.

## Enforced mirror contract

`buildSidecar` and the validator share one derivation function over the receipt's
`cleanup.server.perWorker` array; the validator never compares to a previously emitted
sidecar. Exact key sets and strict types are required (no extra keys inside these two
emitted objects).

`cleanup` (6): `perWorkerCount` integer `=== proofs.length`; `allClosed`,
`allRefusedAfterClose`, `allNotListeningAfter`, `derivedListeningAfter` boolean
per-field aggregates; `summaryServerOk` boolean admission. `derivedListeningAfter` is
`null` unless the proof set is nonempty and complete, so an incomplete snapshot cannot
claim a derived raw state.

`qualification` (8): `qualified` derives from nonempty complete proof support (not a
literal true); `proofCount`; `allProofsComplete`; `allProofsSupportCorrection`;
`everyProofListensBefore`; `everyProofClosed`; `everyProofRefusedAfterClose`;
`everyProofNotListeningAfter`. Empty or incomplete proof sets cannot pass
(`qualification.proofCount:empty`, `qualification.qualified`). Every one of the 14 emitted
cleanup/qualification fields now has a raw-data predicate. Generated values for the
historical pair are byte-identical to the committed sidecar except the corrected
`node.note` text.

`mirror-contract.json` declares those field/type sets, the tamper classification, and the
frozen legacy boundary; `--self-test` fails if code tables and asset diverge.

Node claim now requires `recordedRole === 'descriptive'` **and**
`recordedIsDescriptive === true`, plus emitted `exactRecordedMatch` and
`observedMatchesRecorded` equality. Correction `corrections[0].derived` and both
`rule` projections are checked. Schema detection is exact (`tabi-aria-metadata-correction-v1`);
the previous `kind`-regex fallback is removed.

Explicitly outside the contract: free-text `node.note`/`provenance.note` content, unknown
top-level extension keys, sidecar complete-byte identity, and any general equality policy
beyond this historical pair. The `sidecar-advisory` fixture proves advisory text and an
unknown top-level key remain accepted.

## Outcome classes

- exit 0 `evaluated` / `clean`
- exit 1 `evaluated` / `semantic_invalid` — contradictions, mirror/type/alias/binding claims
- exit 2 `could_not_evaluate` — surface refusal, and authenticated snapshot digest drift
  with reason `snapshot_tampered`; unreadable authenticated input yields
  `snapshot_unavailable`

Snapshot verification hashes canonical receipt, pin, manifest, spec, config, producer
(`scripts/aria-loopback-round13.mjs`, previously never read), and every anchored worker
before `prepareContext`/`evaluateAll`. On mismatch no semantic or sidecar finding is
emitted and no `ARIA_METADATA findings` line is printed.

Tamper CLI line (single finding token for the measure parser):

```text
ARIA_METADATA check verdict=could-not-evaluate classification=could_not_evaluate reason=snapshot_tampered finding=snapshot_tampered exit=2 sidecar=none
```

Tamper JSON schema (L1-facing):

```json
{
  "schema": "tabi-aria-metadata-check-v1",
  "mode": "check",
  "ok": false,
  "exit": 2,
  "classification": { "outcome": "could_not_evaluate", "reason": "snapshot_tampered" },
  "acceptedCorrection": false,
  "snapshot": {
    "ok": false,
    "mismatches": [
      {
        "label": "receipt",
        "path": "corpus/evidence/round-13/aria/receipt.json",
        "expectedSha256": "<anchor>",
        "actualSha256": "<observed>",
        "bytes": 0
      }
    ],
    "unavailable": []
  },
  "findings": [
    {
      "id": "snapshot_tampered",
      "status": "could_not_evaluate",
      "detail": {
        "code": "R14-ARIA-SNAPSHOT-TAMPERED-01",
        "reason": "snapshot_tampered",
        "problems": ["snapshot_tampered:receipt"],
        "mismatches": [ "…same entries…" ],
        "unavailable": [],
        "semanticEvaluation": "skipped"
      }
    }
  ]
}
```

`snapshot_unavailable` uses the same shape with `id`/`reason` `snapshot_unavailable`,
`code` `R14-ARIA-SNAPSHOT-UNAVAILABLE-01`, and `snapshot.unavailable` entries
`{label,path,expectedSha256,reason}`. `--witness`, `--derive`, and `--witness-mirrors`
propagate exit 2 instead of collapsing it to 1.

## Selftest precision and fixture evidence

`--self-test` now loads the round-15 expectations and contract, then reports:

- CLI cases: 36 = 15 preserved fixture cases + 10 new mirror/advisory/witness cases +
  11 isolated mirror-root cases (2 authentic controls + 8 one-file tamper cases +
  1 removed anchored-worker case asserting `snapshot_unavailable`).
- Helpers: 4 = `mirror-contract-fields`, `fixture-digest-set`,
  `derive-and-mirror-helper` (byte determinism + same-function mirror self-consistency;
  token renamed `derive:mirrors_not_self_consistent`, not an independent content oracle),
  and `mirror-aggregate-literals`. That helper's committed literal controls are:
  `[false,true] → allNot=false/derived=true`; `[false,false] → allNot=true/derived=false`;
  incomplete nonempty → `allNot=true/derived=null/qualified=false`; and
  `closed:false, refusedAfterClose:true, listeningBefore:true` with `complete=false` →
  `allClosed=false`, `everyProofClosed=false`, `allRefusedAfterClose=true`,
  `qualified=false` (catches closed/refused mapping swaps and a constant-true completeness
  flag). It exercises the same source function against committed literals, so it is a
  case-table control, not an independent implementation oracle; the independent
  enforcement evidence remains the CLI sidecar mutation cases, where the checker
  recomputes from receipt proofs.
- Fixture digests: 21 pinned + 1 intentionally unpinned (`sidecar-auto` embeds the mkdtemp
  path). Generated fixture-key set must equal pinned ∪ unpinned.
- Exact failed-finding sets are asserted for mirror refusals; exact finding-id sets for
  tamper and unavailable cases. `expected_finding=<id>` is the literal required predicate
  for the case; `finding=<id>` is the actual payload finding retrieved by that id **and**
  required status, with `finding_kind=required_predicate`. A missing matching predicate
  fails the case. Green cases therefore report the passing predicate they actually
  observed, not `none`; witness roots use the stable original
  `R14-ARIA-CLEANUP-LISTENING-AFTER-01` fail predicate from `red.findings`, and the
  mirror witness uses `R14-ARIA-SIDECAR-CLEANUP-MIRROR-01` fail from `mirror.failFindings`.

Fixture digests were computed with a replica calibrated byte-for-byte against the
committed round-14 sidecar (`e156b922…`, old note) and against all 8 previously pinned
receipt fixtures. New pinned sidecars: valid, baddigest, wrongto, exactnode,
cleanup-mirrors, qualification-mirrors, mirror-types, mirror-silent, node-descriptive,
node-alias, correction-derived, spec-mirror, advisory (13 sidecars total pinned).

Tamper cases copy a byte-identical checker plus authentic receipt, pin, manifest, spec,
config, producer, worker, and corrected sidecar into an mkdtemp tree (ROOT derives from
the copied script path), then append one newline (JSON) or
`\n// round15 selftest tamper\n` (JS), or rewrite the receipt with corrected semantics.
Each tamper case asserts exactly one mismatch and these literal tampered sha256 values:

| target | actual sha256 | anchor |
|---|---|---|
| receipt + LF | `481b49935d0450a53820a512f66cf0f26c54fe35eb096f6431cb02ac57f6bd54` | `b458b351…89b7` |
| receipt cleaned then reserialized | `caf8b69353912236abd5f11325bd60122d8221b961abe1dc32f2e2aeb82cd6ea` | `b458b351…89b7` |
| pin + LF | `c59c52042fadd49d3764a79b829dfdb765e4be29ea63d8c3793d0ee2b88fc0bd` | `4d894756…ccd2` |
| manifest + LF | `62e6ec0a7f0c7415bc6911c01957c41ee4da7505711bb9e625ffb369a94bd4f4` | `56764241…2112` |
| spec + comment | `449dbf65dd8663acb17e8a24673717ac15b13cf3d0ded0850b74c9cfb6f28ffe` | `03cb4e17…e4fc` |
| config + comment | `bf3179bbdeb3481d66e738d00e9eef3dd6b78354b163a0726acb0eb78de492c2` | `87ae779b…b3f4` |
| worker + LF | `c7a8ebaa6a5cefc8f041e78aec9b9830b6a6f892fc51b0b3f73ffabc3a700110` | `0d0f00e2…a5e7` |
| producer + comment | `5c4cb198f7124104ffa9ca86057bcd210db1ff6cd73b25406a291d873e867842` | `1d54c9e9…af9c` |

The eleventh mirror-root case removes the anchored worker file from the shadow tree and
asserts exit 2, classification `could_not_evaluate`/`snapshot_unavailable`, finding id
`snapshot_unavailable`, zero mismatches, and exactly one unavailable entry
`{label: "worker:worker-0-1530637-1792474958700.json", reason: "missing"}`.

The receipt-cleaned tamper would be a clean evaluation if bytes were trusted; it still
exits 2, proving digest verification precedes semantics. `buildMirrorRoot` refuses to copy
a live input that already differs from its anchor, so a drifted worktree cannot silently
produce a passing tamper case.

## Old sidecar and old-accept → new-refuse witness

`--witness-mirrors [--receipt P --pin P]` writes a derived baseline and an otherwise
identical sidecar whose only changes are the previously unchecked mirrors
(`cleanup.*` six fields; `everyProofListensBefore`, `everyProofClosed`,
`everyProofRefusedAfterClose`; `everyProofNotListeningAfter` stays true because the old
checker read it). Payload:

```json
{
  "schema": "tabi-aria-metadata-witness-mirrors-v1",
  "mode": "witness-mirrors",
  "ok": true,
  "exit": 0,
  "classification": { "outcome": "evaluated", "reason": "clean" },
  "baseline": { "exit": 0, "accepted": true, "sha256": "…", "bytes": 0, "failFindings": [] },
  "mirror": {
    "exit": 1, "accepted": false, "sha256": "…", "bytes": 0,
    "failFindings": ["R14-ARIA-SIDECAR-CLEANUP-MIRROR-01", "R14-ARIA-SIDECAR-QUALIFICATION-01", "R14-ARIA-SIDECAR-ACCEPTED-01"],
    "cleanupProblems": ["…"], "qualificationProblems": ["…"]
  },
  "legacy": {
    "revision": "e570380d77180ab394256dd6187cac0c5eaf62ec",
    "checkerSha256": "ef373872…43f6",
    "checkedCleanupMirrorFields": [],
    "checkedQualificationFields": ["…"],
    "uncheckedQualificationFields": ["everyProofListensBefore", "everyProofClosed", "everyProofRefusedAfterClose"],
    "legacyExitForSameBytes": 0,
    "legacyExecuted": false,
    "basis": "static subset derivation: …",
    "qualificationWouldPass": true,
    "legacyCheckedFindingsAllPass": true
  },
  "originalUnchanged": true,
  "authenticatedAnchors": true
}
```

The old-accept arm is a **static subset derivation, not an execution of the round-14
checker**: every legacy-checked finding passes on those bytes and `cleanup.*` was never
read. For an executed old→new differential, L1 can materialize the same mutated sidecar
and run `git show e570380d:scripts/check-aria-metadata.mjs` in a shadow tree; do not
overwrite any historical file.

## Commands L1 should run (registry form)

Registered gate command is unchanged; the asset path in the registry note must move from
round-14 to round-15 (L1-owned SKILL edit):

```sh
cd /home/vgpnk/Projects/shokunin/tabi-shokunin

node scripts/check-aria-metadata.mjs --self-test
# expect exit 0; first line: ARIA_METADATA_SELFTEST verdict=clean cli_cases=36 helpers=4
# 21 fixture PASS lines, 36 case PASS lines (case_class=cli), 4 helper PASS lines

node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json
# expect exit 0; accepted=true, findings=28, failed=0 (old sidecar still accepted)

node scripts/check-aria-metadata.mjs
# expect exit 1; findings=18 failed=1; ARIA_METADATA findings R14-ARIA-CLEANUP-LISTENING-AFTER-01

node scripts/check-aria-metadata.mjs --witness
# expect exit 0; transition=red->clean, original_unchanged=true, authenticated_anchors=true

node scripts/check-aria-metadata.mjs --witness-mirrors
# expect exit 0; baseline_exit=0 mirror_exit=1 mirror_accepted=false
# legacy_exit=0 legacy_executed=false original_unchanged=true
```

Isolated snapshot-tamper CLI demonstration (shadow tree; no live mutation):

```sh
tmp=$(mktemp -d)
mkdir -p "$tmp/scripts" \
  "$tmp/corpus/evidence/round-13/aria/actual/workers" \
  "$tmp/corpus/evidence/round-14/aria-metadata"
cp scripts/check-aria-metadata.mjs "$tmp/scripts/"
cp scripts/aria-loopback-round13.mjs "$tmp/scripts/"
cp corpus/evidence/round-13/aria/receipt.json \
   corpus/evidence/round-13/aria/runtime-pin.json \
   corpus/evidence/round-13/aria/manifest.json \
   corpus/evidence/round-13/aria/aria-loopback.spec.mjs \
   corpus/evidence/round-13/aria/playwright.config.mjs \
   "$tmp/corpus/evidence/round-13/aria/"
cp corpus/evidence/round-13/aria/actual/workers/*.json \
   "$tmp/corpus/evidence/round-13/aria/actual/workers/"
cp corpus/evidence/round-14/aria-metadata/corrected.json \
   "$tmp/corpus/evidence/round-14/aria-metadata/"
(cd "$tmp" && node scripts/check-aria-metadata.mjs)            # authentic control: exit 1 red
printf '\n' >> "$tmp/corpus/evidence/round-13/aria/receipt.json"
(cd "$tmp" && node scripts/check-aria-metadata.mjs); echo "exit=$?"
# expect exit=2, one finding token finding=snapshot_tampered,
# classification=could_not_evaluate; no ARIA_METADATA findings line
rm -rf "$tmp"
```

Derive caveat: the generated `node.note` now qualifies the retrospective/historical
enforcement split. Re-deriving into the historical path
`--out corpus/evidence/round-14/aria-metadata/corrected.json` therefore refuses with
exit 2 (`out:existing_bytes_differ_refusing_overwrite`) instead of rewriting history.
That is intentional: the old file stays byte-identical and is still accepted by
`--check`; fresh derivations to a new path remain available. If L1 needs a retained
round-15 derivation receipt, it should author that separately.

## Risks / explicit exclusions

- The registry/SKILL row still names round-14 expectations and needs L1's edit; also add
  `--witness-mirrors` as the mirror differential command if desired.
- Read-refusal classes outside digest drift (missing/symlink/unreadable non-anchor inputs,
  malformed `--check` input) retain their prior exit-1 semantics; this slice only adds
  exit-2 for authenticated snapshot digest drift and authenticated-input unavailability.
- Only canonical authenticated paths are digest-verified. Noncanonical receipt/pin copies
  remain accepted for historical test isolation; broad noncanonical-receipt acceptance is
  an explicit unclaimed boundary, not a new trust guarantee.
- Sidecar complete-byte identity is still not checker-pinned; verification/counter
  evidence owns that debt. This report does not claim whole-sidecar byte authentication.
- The fixed `WORKER_DIR` cannot isolate multi-worker algebra in this lane without new
  fixture roots; single-worker mirror algebra is covered, multi-worker cases remain
  uncredited (CleanupContext proposal).
- `--derive` historical idempotence no longer holds for the corrected note (see above);
  the derive determinism helper covers the new generated bytes.
- SELFTEST expectations are committed literals; if any fixture construction changes,
  `fixture-digest-set` and every digest line fail until the asset is regenerated.

No blockers. Checks not run by this seat.
