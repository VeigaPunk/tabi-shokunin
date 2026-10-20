# InputTrust — critic: snapshot_tampered ordering and labelling (round 15, w1)

Author-side critic report. It certifies nothing. It is read-only: no gate, self-test, witness, counter or browser was run,
and no source was edited. The only command run was `sha256sum` over the anchored inputs, plus `git status` and
`git log`. Line numbers refer to `scripts/check-aria-metadata.mjs` at HEAD `e570380` (worktree unmodified when read,
blob tag FB3C).

## Contract quoted

`PROTOCOL.md:395-397`: "the gate verifies those digests before comparing verdicts: an edited snapshot is
`snapshot_tampered` (could-not-evaluate), not a compared verdict".

The precedent implementations are `.ufo/gates/root-ledgers.py:323,350` (`snapshot_tampered` sets exit 2) and
`.ufo/waves/round-15/closure-check.py:1814-1817`. The latter short-circuits with `return result` before
`_compare_baseline`.

## Observed state (static read)

- The gate contains no `snapshot_tampered` token (grep over `scripts/` found none).
- Every anchor mismatch is folded into ordinary findings, with exit 1 and `verdict=red`:
  - `evaluateAnchors` :731-774 produces `R14-ARIA-ANCHOR-01` with problems `receipt_sha256`, `pin_sha256` and `worker_sha256:*`.
  - `evaluateSourceIdentity` :594-655 produces `R14-ARIA-SOURCE-01` with problems `manifest.currentSha256`, `spec.currentSha256` and `config.currentSha256`.
  - `evaluateAll` :826-845 sets `ok=false`, `runCheck` :1117 and :1135 set `exit: ok ? 0 : 1`, and `main` :2234 prints `verdict=red`.
- **Ordering:** `prepareContext` :776-824 parses the receipt (:779), then follows `receipt.workers[].file` through
  `loadWorkerContext` (:782, :524). It then runs semantic source, manifest and pin comparisons (:783-790), all before
  the anchor digest is consulted (:791). `evaluateAll` then runs `evaluateCleanup` and `evaluateNode` (:827-828) on the
  same unauthenticated bytes, so semantic comparisons always run on tampered input.
- All anchors match the worktree today. I recomputed each one:
  - receipt `b458b351…`, pin `4d894756…`, worker `0d0f00e2…`, manifest `56764241…`, spec `03cb4e17…`, config `87ae779b…`.
  - producer `scripts/aria-loopback-round13.mjs` is `1d54c9e9…`, equal to `ANCHORS.producerSourceSha256`.
  - So a byte-level tamper pre-check would leave production behaviour unchanged.

## Findings (counterexample → evidence → axes → smallest safe correction)

### F1 HIGH — tamper is labelled `failed`, exit 1
- **Counterexample.** Append `\n` to the canonical receipt in an isolated copy (see T1). The gate reports exit 1,
  `ARIA_METADATA check verdict=red`, `ARIA_METADATA findings R14-ARIA-ANCHOR-01,R14-ARIA-CLEANUP-LISTENING-AFTER-01`.
  This is a compared verdict, not could-not-evaluate. The output is predicted from code paths :735-737 → :843 → :1117 → :2234; it was not run.
- **Axes.** calibration (C2 claim itself), operability.
- **Correction.**
  - Add one `verifySnapshot()` that runs on raw `readEntry` bytes before any `decodeJson` result is used.
  - Call it at the top of `prepareContext`, or before it in every mode: `runCheck`, `runDerive` :1331, `runWitness` :1489, and the `resolveCheckInput` sidecar path.
  - On any mismatch, return
    `{exit:2, verdict:'could-not-evaluate', finding:'snapshot_tampered', tampered:[{path,expectedSha256,actualSha256}]}`
    and skip `loadWorkerContext`, the semantic evaluate* functions, `evaluateCleanup`, `evaluateNode` and `evaluateSidecar` entirely.

### F2 HIGH — a tamper that makes semantics pass must not be reachable as green
- **Counterexample.** Rewrite the canonical receipt so that `cleanup.server.listeningAfter=false`, keeping it valid JSON.
  Today this is blocked only because ANCHOR-01 joins the `every(pass)` conjunction (:843). With no sidecar it gives
  exit 1, which is mislabelled but not green.
- **Risk.** An implementation that moves ANCHOR-01 out of `evaluateAll` to a separate exit-2 branch without the
  short-circuit could let `postEvaluation.ok` (:1131) or derive's `onlyContradiction` (:1336) proceed on tampered bytes.
- **Axes.** calibration (false acceptance).
- **Correction.**
  - The tamper branch must return before any `ok` is computed.
  - Add test T2: the tampered-to-clean receipt must exit 2, never 0 or 1, and `findings` must contain no `R14-ARIA-CLEANUP-*`.

### F3 HIGH — do not over-classify (the reverse mislabel)
`R14-ARIA-ANCHOR-01` mixes true digest tamper with problems where the bytes are authentic:
- `anchored_receipt_bytes_at_noncanonical_path` / `anchored_pin_bytes_at_noncanonical_path` (:739-744): the bytes
  equal the anchor and only their location differs.
- `canonical_pair:receipt_not_canonical|pin_not_canonical` (:751-753): a mix of authentic canonical and fixture inputs.
- `worker:unanchored:<name>` (:748): an unknown name, not a digest mismatch. Folding it into the worker-set rule is a separate decision.
- `receipt_pin_binding` (:754-756): this cannot fire when both anchors match, so it is redundant with `pin_sha256`.

**Counterexample.** `--receipt corpus/evidence/round-13/aria/receipt.json --pin <fixture pin>`. Mapping the whole
ANCHOR-01 to `snapshot_tampered` would report authentic bytes as tampered.

**Correction.**
- Only `actual sha256 ≠ pinned anchor` for an authenticated identity is `snapshot_tampered`. The authenticated identities are:
  - canonical receipt and canonical pin;
  - every worker name in `ANCHORS.workers`;
  - manifest, spec and config at their fixed paths;
  - the producer, see F5.
- The other problems keep exit 1 under a distinct id, for example `R14-ARIA-ANCHOR-01` reduced to path and pairing problems.
- Test T3 pins both directions.

### F4 MEDIUM — the sidecar is the claim, not a snapshot input
- `sidecar-bad-receipt-digest` (`corpus/evidence/round-14/aria-metadata/expected-fixtures.json:187-204`, exit 1,
  `R14-ARIA-SIDECAR-BINDING-01`) is a *claimed* digest that disagrees with the actual input. It must stay exit 1.
- Same principle as `.ufo/waves/round-13/freeze-snapshot.py:375-379`: "`expected.json` … excluded: they are the claim,
  not an input."
- Reading "Snapshot/input digest mismatches" too broadly would flip the historical round-14 cases
  `sidecar-bad-receipt-digest` and `witness-rejects-bad-sidecar` to exit 2. That breaks preserved behaviour.
- **Correction.** Exclude `evaluateSidecar` binding (:924-968) from the tamper class. Test T4.

### F5 MEDIUM — producer bytes are never authenticated
- `SOURCE_PATHS.producer` is compared only as a string (:615). `ANCHORS.producerSourceSha256` is compared only against
  receipt and worker *fields* (:613-638). No `readEntry(SOURCE_PATHS.producer)` exists (grep :524,640,641 are the only
  non-receipt reads).
- Editing `scripts/aria-loopback-round13.mjs` is therefore invisible today.
- **Correction.** Add the producer to the `verifySnapshot` set. Its current hash `1d54c9e9…` matches the anchor, so production is unaffected.

### F6 MEDIUM — the witness masks tamper as "not-demonstrated" with exit 1
- `runWitness` :1511 requires `red.exit === 1`. A tampered input gives `red.exit === 2`, so the witness becomes
  `ok=false` and returns `exit: ok ? 0 : 1`, which is exit 1, printed `verdict=red transition=not-demonstrated` (:2170-2176).
- **Correction.** If `red` or `green` is the tamper result, `runWitness` returns exit 2, prints
  `verdict=could-not-evaluate finding=snapshot_tampered`, and leaves `red_finding` absent.
- `originalUnchanged` (:1499-1505) should also compare against the anchors, not only before against after.

### F7 MEDIUM — the downstream counter would accept a tamper witness as red (route to CounterDiagnostics)
- The round-14 `measure.mjs:768` rejects only `before.exit === 0`, and :771/:785/:790 reject only `/could_not_evaluate/`.
- A line `finding=snapshot_tampered` (exit 2) is picked up by `namedFinding` (:272). It would pass as a valid red witness.
- That file is historical and stays immutable. The round-15 counter must:
  - require red exit === 1;
  - reject any exit-2 verdict and any `snapshot_tampered` or `could-not-evaluate` token as red;
  - count C2's "snapshot_tampered exit2" only from a dedicated tamper observation, never from the red arm.

### F8 LOW — output grammar of the exit-2 path
- Today `fatal` prints `verdict=red` with exit 2 (:2252), and usage prints `verdict=invalid` (:2143).
- **Required grammar for the new branch:**
  - Print `ARIA_METADATA check verdict=could-not-evaluate finding=snapshot_tampered exit=2 tampered=<path>[,<path>]`.
  - Do NOT print an `ARIA_METADATA findings <semantic ids>` line, so parsers cannot pick a semantic id.
  - In JSON, `findings` contains exactly `[{id:'snapshot_tampered',status:'could-not-evaluate',detail:{tampered:[…]}}]`, with no semantic findings.
- **Self-test harness.** `runSelfTest` :1841-1852 compares `match.status` exactly, so the new expectations need `status:'could-not-evaluate'` support.
- **Not in scope:** the exit-1 label `red` stays as is, because the round-14 measure only matches `verdict=clean`.

### F9 LOW — precedence rule
- Readable bytes whose digest differs from the anchor → `snapshot_tampered`, even if they are also invalid JSON. The
  digest is checked before `decodeJson`.
- Missing, symlinked, non-regular or unreadable *anchored* inputs are not tamper. Give them a distinct reason
  (`input_unavailable`, exit 2) or keep the current exit-1 behaviour. Either way they must never be `snapshot_tampered`.
- Non-canonical fixture inputs have no anchor. They stay semantic: `malformed-receipt` stays exit 1, as preserved at
  round-14 `expected-fixtures.json:171-186`.

## Isolation constraint for tests (important)

- Receipt and pin anchors apply only when `abs === resolve(ROOT, DEFAULT_*)` (:733-734). `ROOT` is `dirname(SCRIPT)/..` (:47-48).
- Workers, manifest, spec and config are always read from `ROOT` (:524, :640-641, :781).
- So no `--receipt <tmp>` fixture can exercise the receipt or pin tamper branch. Live mutation is forbidden.
- **Safe design.**
  - `mkdtemp` a tree T.
  - Copy the gate bytes to `T/scripts/check-aria-metadata.mjs`. The gate imports only `node:` builtins (:29-45).
  - Copy the 7 anchored files to the same relative paths.
  - Record that the copied gate's sha256 equals the production gate's sha256.
  - Spawn the copy with `cwd: T`.

## Proposed isolated tests (new round-15 expectations; round-14 `expected-fixtures.json` untouched)

| id | mutation in T copy only | expected |
|---|---|---|
| T0 copy-faithful | none | exit 1, `R14-ARIA-CLEANUP-LISTENING-AFTER-01` fail (live red reproduced, proves the copy is faithful) |
| T1 receipt-byte | receipt + `\n` | exit 2, `snapshot_tampered`, tampered=[receipt]; no semantic findings |
| T1b receipt-invalid-json | receipt truncated | exit 2, `snapshot_tampered` (digest before parse) |
| T2 tamper-to-clean | receipt `listeningAfter:false` | exit 2, never 0/1 |
| T1c pin / worker / manifest / spec / config / producer | one byte each, separate trees | exit 2, the tampered path named |
| T3a authentic-noncanonical | real receipt copied to `T/elsewhere.json` | exit 1, not `snapshot_tampered` |
| T3b canonical+fixture-pin | canonical receipt, fixture pin | exit 1, not `snapshot_tampered` |
| T4 sidecar-baddigest | unchanged round-14 case | exit 1 `R14-ARIA-SIDECAR-BINDING-01` |
| T5 sidecar-on-tamper | T1 tree + valid sidecar | exit 2, `accepted` absent or false, no SIDECAR findings |
| T6 derive-on-tamper | T1 tree + `--derive … --out` | exit 2, no file written |
| T7 witness-on-tamper | T1 tree + `--witness` | exit 2, `red_finding` absent, `transition` ≠ red->clean |
| T8 old→new differential | HEAD `e570380` gate bytes vs new gate, same T1 tree | old exit 1 `R14-ARIA-ANCHOR-01` → new exit 2 `snapshot_tampered` |

Must hold in all cases: original live receipt, pin, worker and sidecar sha256 are unchanged after the run, and the
round-14 cases keep their exits.

## Commands for L1 (after integration; not run here)

- `node scripts/check-aria-metadata.mjs` → still exit 1, `R14-ARIA-CLEANUP-LISTENING-AFTER-01` (production unchanged).
- `node scripts/check-aria-metadata.mjs --sidecar corpus/evidence/round-14/aria-metadata/corrected.json` → exit 0, `accepted=true`.
- `node scripts/check-aria-metadata.mjs --self-test` → includes T0-T8, `verdict=clean`.
- `sha256sum corpus/evidence/round-13/aria/{receipt.json,runtime-pin.json,manifest.json,aria-loopback.spec.mjs,playwright.config.mjs} corpus/evidence/round-13/aria/actual/workers/*.json scripts/aria-loopback-round13.mjs corpus/evidence/round-14/aria-metadata/corrected.json`
  → expect the values above; `corrected.json` = `e156b922…`.

## Tooling

No installs or updates.
