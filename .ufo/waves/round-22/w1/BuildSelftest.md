# BuildSelftest — round 22 C1 selftest

## Files changed

Implementation files created in the private clone:

- `.ufo/waves/round-22/selftest-c1.mjs` — executable disposable-Git CLI selftest.
- `.ufo/waves/round-22/fixtures/expected.json` — independent fixed expected exit, value, verdict, and finding for 41 cases.

Private-clone commits (fixture identity `tabi-fixture`):

- `1677262f97b3054d5ed8c2a21eb237426ffacaac` — added the selftest and independent expected fixture.
- `81311bade38a8e6b75172bdc7040951413ebc2fe` — aligned invalid-revision expected values with the oracle result contract.

SHA-256:

- `.ufo/waves/round-22/selftest-c1.mjs` — `b45d41bfc7afca0c8b661fcf897cf7c76e340ee538d091ddc3a0f71542b72582`
- `.ufo/waves/round-22/fixtures/expected.json` — `8029a0e85bf3d93e592796f98be2480de660377eef6002732dbeab04ad41bcbe`

This report is at `.ufo/waves/round-22/w1/BuildSelftest.md`; it is not part of the implementation commit.

## Behavior

The selftest builds one isolated Git repository per case with the fixture author identity, isolated Git configuration, and replacement objects disabled, then invokes the round-22 CLI with the committed full revision. It uses the retained round-21 positive payload and carrier as its factual base. It covers the positive and baseline states, each of the 12 case-status mismatches, output/error/native-navigation/delayed/timing semantics, duplicate and missing cases, note provenance, producer/acquisition/raw-evidence binding, malformed inputs, and invalid revisions. It checks CLI exit, reported exit, verdict, metric/value, and the required stable finding; semantic mutations are resealed through raw evidence, receipt, and acquisition pins so they do not rely on stale-digest failures.

The one explicit old-vs-new contrast changes `na-reset` from `Canceled` to `Error`, mirrors the response in the receipt summary, and reseals raw, receipt, and acquisition hashes. Independent expectations are old frozen round-21 counter: exit `0`, `c1_lifecycle_observations: 12`; round-22 oracle: exit `1`, value `0`, finding `semantic_status`. These are test expectations, not exercised results.

The selftest reads `.ufo/waves/round-22/measure-c1.mjs`, `corpus/evidence/round-22/semantic-expectations.json`, and `corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` from the integrated working tree only when executed. It copies the round-21 measure into the contrast fixture only for that case and does not edit the frozen counter or its inputs.

## Retained evidence

The positive fixture is sourced from `.ufo/waves/round-21/fixtures/positive-ordered.json` and `.ufo/waves/round-21/fixtures/source-carrier.gz`. The retained payload includes the round-21 receipt, all 12 case JSON/HTML artifacts, producer, execution record, source-opening record/body, registry, and existing round-21 note. Inspected raw records establish the actual outcome classes: pending; Completed for click, requestSubmit, native submit, delayed, and auto-positive; Canceled for reset and remove; Error for reject, throw, invalid-submit, and auto-invalid. The native record retains an array output and `after.submits: null`; delayed evidence retains a pre-release observation and release marker.

Exact retained source paths used by the harness:

- `.ufo/waves/round-21/fixtures/positive-ordered.json`
- `.ufo/waves/round-21/fixtures/source-carrier.gz`
- `.ufo/waves/round-21/runtime-execution-finalized.json`
- `.ufo/waves/round-21/measure-c1.mjs` (read-only contrast input)
- `corpus/evidence/round-21/runtime/receipt.json`
- `corpus/evidence/round-21/runtime/{na-pending,na-click,na-requestsubmit,na-native-submit,na-reset,na-remove,na-reject,na-throw,na-delayed,na-invalid-submit,auto-positive,auto-invalid}.{json,html}`

## Risks and blockers

- No selftest, build, lint, formatter, or smoke check was run, as instructed. The post-integration CLI selftest remains the parent's gate.
- The integrated round-22 oracle, note, and expectations were not read or copied by this seat; the selftest consumes them from the integrated tree only at execution. Runtime compatibility is therefore unverified.
- No tools were installed or updated.
