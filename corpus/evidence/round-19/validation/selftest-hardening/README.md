# Round-19 validation harness hardening probes

These are isolated loopback-only probes. The paths below are the exact clone and outputs used; the output receipts are retained in `evidence/`. To repeat a browser probe, substitute a new, absent `/tmp` output path because the harness refuses existing files. All `exit` values are process exit statuses.

## (a) Output-path refusal

1. Canonical parent inside LANE:

   `node /fast/scratch/tabi-r19/ExecValidationHarness/scripts/webmcp-validation-round19.mjs --out /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w1/hardening-refusal.json`

   Observed: exit `2`, code `out_inside_lane`; no output was created.

2. Symlinked path component:

   `test ! -e /tmp/tabi-r19-hardening-output-link-v2 && ln -s /tmp /tmp/tabi-r19-hardening-output-link-v2 && node /fast/scratch/tabi-r19/ExecValidationHarness/scripts/webmcp-validation-round19.mjs --out /tmp/tabi-r19-hardening-output-link-v2/out.json; rc=$?; rm /tmp/tabi-r19-hardening-output-link-v2; printf 'SYMLINK_COMPONENT_EXIT=%s\\n' "$rc"; test "$rc" -eq 2`

   Observed: exit `2`, code `out_symlink_component`; the temporary symlink was removed.

3. Existing output leaf:

   `node /fast/scratch/tabi-r19/ExecValidationHarness/scripts/webmcp-validation-round19.mjs --out /tmp/tabi-r19-fullvalidation-ExecValidationHarness-v2.json`

   Observed: exit `2`, code `out_exists`; the existing 66-case receipt was unchanged.

## (b) Case/fixture loader refusal

Each command was run with the indicated `--cases` directory. All returned exit `2` before launching Chromium and wrote no receipt.

- `node /fast/scratch/tabi-r19/ExecValidationHarness/scripts/webmcp-validation-round19.mjs --out /tmp/tabi-r19-hardening-invalid-family-v2.json --cases /fast/scratch/tabi-r19/ExecValidationHarness/corpus/evidence/round-19/validation/selftest-hardening/invalid-family/cases` — `invalid family in invalid.json`.
- `node /fast/scratch/tabi-r19/ExecValidationHarness/scripts/webmcp-validation-round19.mjs --out /tmp/tabi-r19-hardening-invalid-id-v2.json --cases /fast/scratch/tabi-r19/ExecValidationHarness/corpus/evidence/round-19/validation/selftest-hardening/invalid-id/cases` — `invalid case id for family invalid-id in invalid.json`.
- `node /fast/scratch/tabi-r19/ExecValidationHarness/scripts/webmcp-validation-round19.mjs --out /tmp/tabi-r19-hardening-fixture-mismatch-v2.json --cases /fast/scratch/tabi-r19/ExecValidationHarness/corpus/evidence/round-19/validation/selftest-hardening/fixture-mismatch/cases` — `fixture must be fixture-mismatch.html in invalid.json`.
- `node /fast/scratch/tabi-r19/ExecValidationHarness/scripts/webmcp-validation-round19.mjs --out /tmp/tabi-r19-hardening-case-symlink-v2.json --cases /fast/scratch/tabi-r19/ExecValidationHarness/corpus/evidence/round-19/validation/selftest-hardening/case-symlink/cases` — `case file is not a regular file: .../case-symlink/cases/alias.json`.
- `node /fast/scratch/tabi-r19/ExecValidationHarness/scripts/webmcp-validation-round19.mjs --out /tmp/tabi-r19-hardening-fixture-symlink-v2.json --cases /fast/scratch/tabi-r19/ExecValidationHarness/corpus/evidence/round-19/validation/selftest-hardening/fixture-symlink/cases` — `fixture is missing or not a regular file: .../fixture-symlink/fixtures/fixture-symlink.html`.

The malformed family, ID, and fixture records are retained under `invalid-family/`, `invalid-id/`, and `fixture-mismatch/`. `case-symlink/cases/alias.json` and `fixture-symlink/fixtures/fixture-symlink.html` are symlinks to the corresponding retained in-tree targets.

## (c) Blocked external request

`node /fast/scratch/tabi-r19/ExecValidationHarness/scripts/webmcp-validation-round19.mjs --out /tmp/tabi-r19-hardening-external-v2.json --cases /fast/scratch/tabi-r19/ExecValidationHarness/corpus/evidence/round-19/validation/selftest-hardening/external/cases`

Observed: exit `1`; receipt finding `external_request_blocked` records `https://example.invalid/blocked.png`. The fixture route blocked the request; it was not fetched from a real site. Retained receipt: `evidence/blocked-external.json`.

## (d) Non-loopback frame navigation

`node /fast/scratch/tabi-r19/ExecValidationHarness/scripts/webmcp-validation-round19.mjs --out /tmp/tabi-r19-hardening-navigation-v2.json --cases /fast/scratch/tabi-r19/ExecValidationHarness/corpus/evidence/round-19/validation/selftest-hardening/navigation/cases`

Observed: exit `1`; case `decl-hardening-navigation-01` failed with `navigation_outside_fixture_origin`. Both `Page.getFrameTree` and `Page.frameNavigated` recorded `data:text/html,hardening-navigation` with origin `null`. Retained receipt: `evidence/navigation-violation.json`.

## Full corpus and smoke receipts

The copied LANE `cases/` directory ran as 66 cases, 66 passed, 0 failed, 0 findings (exit `0`). The receipt is retained at `evidence/full-lane-66.json`; it has 15 case-file digests and 15 fixture digests in `fixturesSha256`.

The valid plus unknown-parameter smoke cases passed 2/2 (exit `0`; `evidence/smoke-pass.json`). The deliberately wrong expectation failed 1/1 (exit `1`; `evidence/smoke-fail.json`).
