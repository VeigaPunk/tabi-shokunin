# RevKillsM09M10 — round 34 w2 — kill cases for mutants M09 and M10

## Verdict

HOLDS — no defect. At the wave-1 integration commit 04f9623dde8ad35d470cecf766e421eafbcb47fa both frozen mutants are killed by the gate's own `--selftest` alone, each by exactly the case built for it and no other: applying the frozen M09 find/replace makes `node scripts/check-bidi-runtime.mjs --selftest` exit 3 with the single FAIL line `v3-a-m09-driver-imports-rows`, and applying M10 makes it exit 3 with the single FAIL line `v3-a-m10-driver-imports-servefixture`, while the pristine gate passes all 56 cases (exit 0). The frozen counter run at the integration rev reports predicate true (20/20 killed, survivors 0, unappliable 0, pristine/neutral/decoy exit 0, all twins pass, round-33 battery true), its M09/M10 find/replace pairs are byte-identical to round-33 `MutGateV2/mutants.jsonl`, and both find texts occur exactly once in the gate. Both cases test gate behaviour on a synthetic fixture (never the gate's own source text), their expected values are the pristine gate's real outcome, neither uses `detailIncludes` (so a rewording of the finding message cannot break them — no fragility), and neither rests on an id shape, so no S-row dependency exists; their factual premise (the honest round-32 driver's import line) is verified in the repo. Two low-severity observations recorded, neither actionable as a defect.

## Evidence

### Setup

```
S=/fast/scratch/hyaku/tabi-r34/RevKillsM09M10
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"   # ok
git -C "$S/clone" checkout -q --detach 04f9623dde8ad35d470cecf766e421eafbcb47fa
git -C "$S/clone" rev-parse HEAD        # 04f9623dde8ad35d470cecf766e421eafbcb47fa
git -C "$S/clone" rev-parse --show-toplevel   # == $S/clone
```

Lane worktree HEAD is the same commit (`git -C tabi-shokunin rev-parse HEAD` → 04f9623…); `scripts/check-bidi-runtime.mjs` and `corpus/knowledge/bidi-gate-selftest-round-34.md` in the worktree are byte-identical (sha256) to their blobs at 04f9623.

Frozen counter digest: `sha256sum .ufo/waves/round-34/counters/c2-gate-mutants.mjs` → `3cf5eb699934eae48b77c991dae8761780c1c010da1121c1b9623a4d5d325b82` = `frozenDigests["…c2-gate-mutants.mjs"]`. ✔

### (1) Mutant applied → self-test exits 3 with THAT case failing

M09 (counter `MUTANTS` id M09, "DRIVER_ALLOW widened with ROWS"; find/replace byte-identical to `mutants.jsonl` — see pair check below). Applied to `$S/clone/scripts/check-bidi-runtime.mjs:144`:

```
find:    const DRIVER_ALLOW = new Set(["FIXTURE", "FIXTURE_SHA256", "FIXTURE_HEADER", "VIEWPORT", "DATA_TEXT", "serveFixture"]);
replace: const DRIVER_ALLOW = new Set(["FIXTURE", "FIXTURE_SHA256", "FIXTURE_HEADER", "VIEWPORT", "DATA_TEXT", "serveFixture", "ROWS"]);
```

```
TMPDIR=$S node scripts/check-bidi-runtime.mjs --selftest   # in $S/clone
exit=3
CASE id=v3-a-m09-driver-imports-rows expected_exit=1 exit=0 expected_admitted=0 admitted=16 expected_population=16 population=16 expected_reason=t1-receipt reason=- FAIL
BIDI_RUNTIME_SELFTEST verdict=failed cases=56 passed=55
```

Exactly one FAIL line — the M09 case; no collateral case failures. Under the mutant the driver import `{ FIXTURE, ROWS }` is fully allow-listed, the fixture reads clean (exit 0, admitted 16), and the case's expected refusal (exit 1, admitted 0, `t1-receipt`) is not produced. Receipt: `m09-selftest.json`.

M10 (counter id M10, "DRIVER_ALLOW drops serveFixture"; find `", "VIEWPORT", "DATA_TEXT", "serveFixture"]);` → replace `", "VIEWPORT", "DATA_TEXT"]);`). Applied to the same line (the resulting line is byte-identical to the counter's suffix replacement: `…new Set(["FIXTURE", "FIXTURE_SHA256", "FIXTURE_HEADER", "VIEWPORT", "DATA_TEXT"]);`):

```
TMPDIR=$S node scripts/check-bidi-runtime.mjs --selftest   # in $S/clone
exit=3
CASE id=v3-a-m10-driver-imports-servefixture expected_exit=0 exit=1 expected_admitted=16 admitted=0 expected_population=16 population=16 expected_reason=- reason=t1-receipt FAIL
BIDI_RUNTIME_SELFTEST verdict=failed cases=56 passed=55
```

Exactly one FAIL line — the M10 case. Under the mutant the honest driver's `serveFixture` import becomes non-allow-listed, the gate refuses with `t1-receipt` (exit 1, admitted 0), and the case's expected admission (exit 0, admitted 16) is not produced. Receipt: `m10-selftest.json`.

Exit-code semantics confirmed in source: `--selftest` maps any failed case to `process.exit(out.ok ? 0 : 3)` (gate line 1216) — a real CASE FAIL exit, not a crash or timeout (the counter counts only exit 3 with a `CASE … FAIL` line as a kill).

### (2) Pristine gate passes both cases

```
TMPDIR=$S node scripts/check-bidi-runtime.mjs --selftest   # in $S/clone, unmutated
exit=0
CASE id=v3-a-m09-driver-imports-rows expected_exit=1 exit=1 expected_admitted=0 admitted=0 expected_population=16 population=16 expected_reason=t1-receipt reason=t1-receipt PASS
CASE id=v3-a-m10-driver-imports-servefixture expected_exit=0 exit=0 expected_admitted=16 admitted=16 expected_population=16 population=16 expected_reason=- reason=- PASS
BIDI_RUNTIME_SELFTEST verdict=clean cases=56 passed=56
```

Receipt: `pristine-selftest.json`.

### Frozen counter at the integration rev (whole predicate)

```
TMPDIR=$S/counter-tmp node .ufo/waves/round-34/counters/c2-gate-mutants.mjs \
  --rev 04f9623dde8ad35d470cecf766e421eafbcb47fa --repo $S/clone --json
exit=0   (~72 s)
predicate: true   killedCount: 20   survivors: []   unappliable: []
pristine: 0   neutral: 0   decoy: 0   twinsFailing: []   battery: true
M09: killed=true  exit=3  failingCases=['v3-a-m09-driver-imports-rows']
M10: killed=true  exit=3  failingCases=['v3-a-m10-driver-imports-servefixture']
```

Receipt: `c2-counter-at-rev.json`.

### Mutant pairs and find-text uniqueness

`cmp-mutants.cjs` (receipt in output dir) evaluates the frozen counter's `MUTANTS` array and compares with `.ufo/waves/round-33/w2/MutGateV2/mutants.jsonl`:

```
M09 find match: true | replace match: true | area: "DRIVER_ALLOW widened with ROWS"
M10 find match: true | replace match: true | area: "DRIVER_ALLOW drops serveFixture"
counter mutant count: 20
```

Find-text occurrence in the gate at 04f9623 (the counter requires exactly once, else `unappliable`): M09 find count 1; M10 find count 1. ✔

### Rule lines byte-identical baseline → integration (no rewording)

`git -C $S/clone diff --numstat 15dfaccb..04f9623dde -- scripts/check-bidi-runtime.mjs` → `62  7`. Grepping the diff for `DRIVER_ALLOW|SESSION_ID|CONTEXT_ID|MEASURED|idCounts` yields no changed lines. The 7 deleted lines are all self-test-harness/fixture-builder lines: `goldenLines` signature (gains `bWsSessionSegment`), the `wsUrl` template line, `lessonsDoc(ids)` signature (gains `o`), the lessons row template (gains `accessed(id)`), the `fx.put(LESSONS, lessonsDoc(["S002"]))` call, and the two `pass`/`results.push` expressions (gaining the `detailIncludes` fields). No rule line touched. ✔

### (3) Case tests the rule (gate behaviour on a fixture), not source text; expectations are the pristine outcome

Code read of `runSelftest` (gate lines 1084-1170): every case builds a throwaway git fixture (`makeFixture`), writes registry/lesson/entry/transcripts/receipt/driver into it, and calls the gate's production path `evaluate(fx.root, {rev, baseline, entry, …})`; the assertion is on the gate's runtime output only — `exit`, `admitted`, `population`, first finding `reason`, and (optionally) `detailIncludes`. The gate's own source is read once (`const gateSource = readFileSync(fileURLToPath(import.meta.url))`, line 1086) and used ONLY for `o.driverCopyOfGate` (line 1127, the v2-f5/M13 case) and `o.gateBlob` (line 1129, same case). Neither `v3-a-m09-driver-imports-rows` nor `v3-a-m10-driver-imports-servefixture` sets either option — their driver bytes come from `o.driverText` (line 1127's else-branch). So neither case can pass by sniffing its own bytes; the neutral/decoy/twin probes of the frozen counter also all exit 0 at this rev, confirming no byte-keying.

Expected values are the pristine gate's real outcome, not tuned: the pristine run's PASS lines show `expected_*` == actual on every asserted field for both cases (section (2) above), i.e. the cases state what the unmutated gate actually does with those fixtures, and fail when — and only when — the one rule they isolate is disabled (sections (1)).

Isolation check: for the M09 fixture (golden everything, driver = named import `{ FIXTURE, ROWS }` resolving to `GATE_PATH`) the only rule that can refuse is the allow-list check (`driverGateFinding`, gate lines ~440-446: named kind → `bad = names.filter(n => !DRIVER_ALLOW.has(n))`, line 443; message line 445) — it is not a re-export/namespace/default/side-effect relation (M11/M12 site) and not a byte copy (M13 site). Under M09 that refusal disappears entirely (admitted), so the case's failure is attributable to the allow-list rule alone. Symmetrically the M10 fixture differs from golden only in driver text, and under M10 the only new refusal is the allow-list check. Both kills are rule-attributable.

### (4) `detailIncludes` — not used by these cases; no message-rewording fragility

Neither `v3-a-m09-driver-imports-rows` nor `v3-a-m10-driver-imports-servefixture` sets `detailIncludes` (gate lines 1043, 1046). Both pin the structural finding id `reason: "t1-receipt"` — assigned at gate line 847 (`row.reason = "t1-receipt"; row.detail = receiptFinding;`) whenever any receipt-level finding fires — never the detail message built at line 445 (`driver imports non-allow-listed gate symbol(s): ${bad.join(", ")}`). A semantically equivalent rewording of that message therefore cannot break either case: no fragility to record. (The `detailIncludes` mechanism itself, used by the v3-b cases, asserts `out.entryDetail || row.detail` — gate runtime output, never gate bytes — per the harness comment at lines 1160-1163.)

### (5) Sourced shapes vs S-rows

M09 and M10 exercise no id shape: the session-id shape (S127, ChromeDriver 154 `util.cc` — 32 lower-case hex), the browsing-context/target-id shape (S130 `base/token.cc` — 32 upper-case hex) and the mapper naming (S131 `CdpTargetManager.ts`) are not involved in either case; the claims' sourcing rule ("id-shape kill cases must rest on registry rows opened this round, SOURCES S130+") binds the id-shape cases (M06/M07/M08/M19), which the round-34 note §3 sources accordingly. The M09/M10 grounding is repo-internal and verified:

- M10's premise — "the honest round-32 driver imports FIXTURE_SHA256, VIEWPORT and serveFixture" — is true: `scripts/bidi-loopback-round32.mjs:31` is exactly `import { FIXTURE_SHA256, VIEWPORT, serveFixture } from "./check-bidi-runtime.mjs";` (comment at :10-11 states the same), and the round-32 receipt `corpus/evidence/round-32/bidi/receipt.json` names that driver.
- M09's premise — ROWS is a gate-internal decision symbol — is true: `export const ROWS = { R1: … R17: … }` at gate line 204 (the matrix §2 order the entry's row ids must follow).
- Registry cross-reference: SOURCES.md rows S130, S131, S132 each list `bidi-gate-selftest-round-34.md` in used-by (3 hits), and the note's `verified-at` line records S130/S131 opened by round-34 w1 ScoutContextIdSource and S132 (+S125/S127 re-opened) by ScoutSessionBinding.

## Observations (low severity, no action required)

1. **Neither case pins which allow-list entry fired** (no `detailIncludes`). Not a defect: for each case's fixture the allow-list check is the only rule whose outcome differs between pristine and mutant (isolation argument above), and under M09 the mutant's effect is admission — the asserted opposite — so any deviation fails the case. If a future gate refused the M09 driver for an unrelated new reason, the case would still fail (reason mismatch) — over-kill, harmless.
2. **M10's grounding is the repo's own round-32 driver, not an S-row.** Consistent with the claims' wording, which requires S-rows only for id-shape kill cases; the premise is verified against `scripts/bidi-loopback-round32.mjs:31` and the committed round-32 receipt, so nothing rests on an unverified string.

## Tooling

No tools installed or upgraded (pacman guard respected; nothing written outside the paths named below).

## Deliverable paths

- Report: `tabi-shokunin/.ufo/waves/round-34/w2/RevKillsM09M10.md` (this file)
- Receipts (copied from scratch before deletion):
  - `tabi-shokunin/.ufo/waves/round-34/w2/RevKillsM09M10/pristine-selftest.json` — pristine `--selftest` stdout, exit 0, 56/56
  - `tabi-shokunin/.ufo/waves/round-34/w2/RevKillsM09M10/m09-selftest.json` — selftest under M09, exit 3, one FAIL line
  - `tabi-shokunin/.ufo/waves/round-34/w2/RevKillsM09M10/m10-selftest.json` — selftest under M10, exit 3, one FAIL line
  - `tabi-shokunin/.ufo/waves/round-34/w2/RevKillsM09M10/c2-counter-at-rev.json` — frozen counter at 04f9623, predicate true
  - `tabi-shokunin/.ufo/waves/round-34/w2/RevKillsM09M10/cmp-mutants.cjs` — pair-comparison script (counter ↔ mutants.jsonl)
- Scratch `/fast/scratch/hyaku/tabi-r34/RevKillsM09M10` deleted after copying receipts (clone included).
