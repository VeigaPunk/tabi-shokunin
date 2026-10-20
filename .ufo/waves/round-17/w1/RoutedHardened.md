VERDICT: PASS

# Round 17 — routed defects 2 and 3 (RoutedHardened)

Scope: `corpus/evidence/round-17/routed/binding-hardened/**` (new), PLAN.md ownership row
`RoutedHardened`. Defects: `corpus/lessons/round-16-verifier-spotcheck.md:149` (defect 2,
pre-hardening gate receipts) and `:150` (defect 3, delivered-HEAD `--check --reproduce` receipt).

## Gate identity verified before any receipt

Sandbox `git clone --no-hardlinks` checkouts, clean tree (`git status --porcelain` empty), node
v24.21.0:

- `git show 3254740c694e4fc7851ca9d88b39230db3042ba6:scripts/check-measurement-binding.mjs | sha256sum`
  → `1f84fb545f76ad776fc88411319dcd2d8145187014ca34bf569753acdde8b1f6` (expected 1f84fb54…).
- `git show 3254740…:scripts/selftest-measurement-binding.mjs | sha256sum`
  → `481eefaec846fa8a58390652f7825122aef57a8ceb6de2fdb06d96f58c3414b3` (expected 481eefae…).
- Same two worktree digests at `1205d261776a349af99a5a205c7c2467fbabae16`; manifest there
  sha256 `72c77ed4a32038416f094b2ca685c5a2de9fbe29739f298663615706d1caee64`.
- Sandboxes: `/tmp/tabi-r17-RoutedHardened-5ubB/{s3254740,s1205d26}` (removed after capture; confirmed
  absent at 16:06Z — `ls -d /tmp/tabi-r17-RoutedHardened-*` fails — so each receipt's
  `sandbox.removedAfterCapture: true` is verified, not assumed).
  Each receipt records `cwdRev`, both blob digests, and `sandbox.reproduce` (clone + checkout +
  argv); `index.json` repeats them under `registeredGate`.

## Receipts (schema tabi-round17-routed-binding-receipt-v1)

Each JSON carries `argv`, `cwd`, `cwdRev`, `at`, `gateSha256`, `selftestSha256`, `node`, `exit`,
`summary`, `stdout`, `stderr`, `startedAt`, `completedAt`, `generatedAt`, `sandbox`.

(a) `selftest.json` — exit **0** — summary `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=59 reasons=13`
    (59 `PASS` lines, 0 `FAIL`; expected 59 clean). cwdRev 3254740…; started 15:49:48Z, completed
    15:49:51Z. sha256 `5d40fe444009589b51b0545077d52aba9f2498f512a86f06d0fff6cfc618ec1a`.

(b) `legacy-r15.json` — exit **1** — summary `MEASUREMENT_BINDING verdict=failed claims=2 bound=0`;
    five closed-vocabulary findings: C1 `counted_inputs_undeclared`, `counter_changed_since_measurement`,
    `counter_digest_unrecorded`; C2 `counted_inputs_undeclared`, `counter_digest_mismatch`. Exit 1 is
    the legacy evaluator's correct outcome (r15 predates declared countedInputs and counterSha256), not
    a harness error: stdout begins `MEASUREMENT_BINDING verdict=failed claims=2 bound=0`, stderr empty.
    cwdRev 3254740…; at 36240c70ee114347a79abb91cacab6c63044ce36. sha256
    `08d0f9681dd1599ec145f55747ad6cb9ee88c44101e227f6647cde632cc075cd`.

(c) `check-at-1205d26.json` — exit **0** — summary `MEASUREMENT_BINDING verdict=clean claims=2 bound=2`;
    `--reproduce` re-ran both counters at `e38d259` (before) and `3254740` (measuredRevision) and
    reproduced the recorded counts; worktree counter was byte-verified against the blob at `--at`.
    cwdRev and `at` both 1205d261776a349af99a5a205c7c2467fbabae16; manifest sha256 72c77ed4…ee64.
    sha256 `63b40ea456f0f600b6c04f5060ca53c68d969c875d7b28cab825123187fa45a3`.

## History labelling — `index.json`

- `corpus/evidence/round-16/binding/selftest.json` → `status: history`, pre-hardening gate
  `5150611c3d597fd7a70314e2d7cd835be62c5688e521297803e4907fdaa0d6fb` /
  selftest `8c5426f254b76e4c7c0a0374d513c33f2832a5dfff5e92b938f4bd9d7168f2ae`, 43 cases
  (independently recounted: 43 `PASS`); file sha256 at baseline
  `ac3d486f9beef26f4ec6c97433aa8ed43a52a35ae8c9fde0cafd3c648f9624ec`; last commit 8f7feb3f….
- `corpus/evidence/round-16/binding/legacy-r15.json` → `status: history`, same pre-hardening digests;
  file sha256 `489cd1af4299abcbbcb0ac757d03a1772357daabcf0e531578a42d65f048ff63`; last commit 8f7feb3f….
  Its `run.stdout` is byte-identical to the new `legacy-r15.json` stdout (1017 bytes, exit 1, same five
  findings), verified by exact string comparison; only the gate-identity header and provenance envelope differ.
- `receipts[].status` on all three round-17 receipts is `registered-at-3254740`, not `current`: the
  round-17 lane is changing the gate, so 3254740 is a fixed registration point rather than current-tip output.
- `index.json` also holds `defectRefs` (`:149`, `:150`), `registeredGate` (3254740, 59 cases,
  `verifiedAt` both revisions), `receipts[]` with per-file sha256, and `labelForAppendOnly` — the exact
  sentence for L1 to append to `LOG.md` / `corpus/README.md` (L1-owned append-only; not touched here).

`index.json` itself is sha256 `6588b12365c8813291889743e0fe8cdc7b8de1fd0ac9a9e60b0d282c4807ccee` and
records the per-receipt digests above plus `sandboxRemoval` (removal check text and timestamp, backing
`removedAfterCapture: true`). JSON parses; cross-checked by the validator described next.

## Verification performed

- Three independent executions per argv; stdout byte-identical each time (`diff -q` clean), stderr
  empty. No run was repeated to paper over a mismatch; the identical outputs are the determinism record.
- Independent validator (node, run against the lane repo) recomputed per receipt: file sha256 vs
  `index.receipts[].fileSha256`; `gateSha256`/`selftestSha256` vs `git show <cwdRev>:<path>`;
  `manifestSha256` vs `git show <cwdRev>:corpus/evidence/round-16/measurement-binding.json`;
  history `fileSha256AtBaseline` vs the frozen files. Output: `VALIDATION: all receipts and history
  rows consistent`.
- Lane tracked modifications under `scripts/` belong to sibling seats' in-flight work; these receipts
  were produced only inside the pinned sandbox checkouts, so concurrent lane edits cannot alter them.

## Risks / notes

- Receipt `cwd` paths no longer exist after sandbox cleanup; provenance is rooted in `cwdRev` + blob
  digests + `sandbox.reproduce`, not in the tmp path.
- The legacy receipt is expected to exit 1; a reader should compare its finding list, not expect clean.
- No tooling installed or upgraded this wave.

Files written:
- corpus/evidence/round-17/routed/binding-hardened/selftest.json
- corpus/evidence/round-17/routed/binding-hardened/legacy-r15.json
- corpus/evidence/round-17/routed/binding-hardened/check-at-1205d26.json
- corpus/evidence/round-17/routed/binding-hardened/index.json
- .ufo/waves/round-17/w1/RoutedHardened.md
