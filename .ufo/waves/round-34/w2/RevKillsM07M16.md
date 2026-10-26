# RevKillsM07M16 — round-34 w2 FALSIFY, C2 kill cases for mutants M07 and M16

## Verdict

**Holds, with one low-severity fragility defect recorded.** Both assigned kill cases are genuine, behaviour-based kills of their mutants at the wave-1 integration commit 04f9623dde8ad35d470cecf766e421eafbcb47fa:

- `v3-b-m07-ws-session-segment-unbound` kills **M07** (webSocketUrl sessionId binding dropped): with the mutant applied, the self-test exits **3** with exactly one FAIL line — that case; the mutant gate admits all 16 rows and exits 0 where the pristine gate refuses (exit 1, t1-receipt).
- `v3-b-m16-gate-row-without-sha` kills **M16** (s1 Gate-row 64-hex sha256 requirement dropped): with the mutant applied, the self-test exits **3** with exactly one FAIL line — that case; the mutant gate accepts a sha-less `## Gate` row as witness and exits 0/admitted 16 where the pristine gate refuses (exit 1, s1-source-row).

Both cases exercise the gate's runnable behaviour on a synthetic fixture repo (in-process `evaluate()`), never the gate's own source text; their expected values are the pristine gate's real outcome (pristine self-test 56/56 PASS), and each mutant flips the outcome in exactly the asserted direction with no collateral case failures. Sourcing holds: the M07 case's premise rests on S127 (session id = exactly 32 lowercase hex, echoed verbatim as the W3C `sessionId` and inside the BiDi `webSocketUrl` path). M16 involves no id shape and claims no S-row.

**Low-severity defect (fragility, recorded not blocking):** the M07 case pins `detailIncludes: "webSocketUrl session segment"` — a literal phrase of the gate's runtime message built at `scripts/check-bidi-runtime.mjs:388`. A semantically equivalent rewording of that message (verified experimentally: `session segment` → `session id`) leaves every structural assertion intact (exit 1, admitted 0, reason t1-receipt) but makes the **pristine** self-test exit 3 with only the v3-b-m07 case failing on the detail substring — a false alarm, not a missed kill. The M16 case pins no detail and has no such coupling.

## Evidence

All commands run in the seat scratch clone `/fast/scratch/hyaku/tabi-r34/RevKillsM07M16/clone` (`git clone --shared` of the lane, detached at 04f9623dde8ad35d470cecf766e421eafbcb47fa; `git rev-parse --show-toplevel` = the clone). `TMPDIR` under the seat scratch. Exit codes pasted verbatim.

### 0. Mutant pair provenance and byte-identity (no find text reworded)

`node apply-mutant.mjs all` (script at `<scratch>/apply-mutant.mjs`) parsed the frozen counter's `MUTANTS` array (`.ufo/waves/round-34/counters/c2-gate-mutants.mjs:40-173`) and compared every pair against `.ufo/waves/round-33/w2/MutGateV2/mutants.jsonl` and the gate blob at 04f9623:

```
M07	counter==jsonl find:true replace:true	occurrences_in_gate:1	find_has_space:true
M16	counter==jsonl find:true replace:true	occurrences_in_gate:1	find_has_space:true
```

All 20 rows read `counter==jsonl find:true replace:true, occurrences_in_gate:1` — the counter's embedded pairs are byte-identical to the round-33 frozen mutants.jsonl, and each find occurs exactly once in the gate (so the counter's whitespace-twin probe is applicable and no mutant is unappliable). M07's find is gate line 388; M16's find is gate line 750.

### 1. Pristine gate passes both cases

`TMPDIR=$S/tmp node scripts/check-bidi-runtime.mjs --selftest` → **exit 0**, `BIDI_RUNTIME_SELFTEST verdict=clean cases=56 passed=56` (44 baseline cases + 12 v3 cases; receipt `pristine-selftest.txt`). The two assigned cases:

```
CASE id=v3-b-m07-ws-session-segment-unbound expected_exit=1 exit=1 expected_admitted=0 admitted=0 expected_population=- population=16 expected_reason=t1-receipt reason=t1-receipt PASS
CASE id=v3-b-m16-gate-row-without-sha expected_exit=1 exit=1 expected_admitted=0 admitted=0 expected_population=16 population=16 expected_reason=s1-source-row reason=s1-source-row PASS
```

From the `--json` run (`pristine-selftest.json`), the gate's actual runtime detail for the M07 case is

```
run1: webSocketUrl session segment bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb != sessionId e3a0ae31f5ca9591800dcbf63f70ae4f
```

and for the M16 case

```
S002: no corpus/lessons/round-*.md `## Gate` row with an https URL and a 64-hex sha256
```

— i.e. the pinned `detailIncludes` substring is genuine gate output, not a fabricated string.

### 2. M07 applied → self-test exit 3, that case failing

`git checkout -q -- scripts/check-bidi-runtime.mjs && node apply-mutant.mjs M07 && TMPDIR=$S/tmp node scripts/check-bidi-runtime.mjs --selftest` → **exit 3**:

```
CASE id=v3-b-m07-ws-session-segment-unbound expected_exit=1 exit=0 expected_admitted=0 admitted=16 expected_population=- population=16 expected_reason=t1-receipt reason=- FAIL
BIDI_RUNTIME_SELFTEST verdict=failed cases=56 passed=55
```

Exactly one FAIL; no collateral case failures. Attribution is clean: with the binding check deleted (find → empty replace), the mutant gate runs clean (exit 0, admitted 16, no reason) — the case fails precisely because the refusal disappeared, not because the mutant broke the gate's parse or some unrelated rule. The kill rests on the structural assertions (exit/admitted/reason all mismatch); the `detailIncludes` pin additionally confirms WHICH check fired under pristine.

### 3. M16 applied → self-test exit 3, that case failing

`git checkout -q -- scripts/check-bidi-runtime.mjs && node apply-mutant.mjs M16 && TMPDIR=$S/tmp node scripts/check-bidi-runtime.mjs --selftest` → **exit 3**:

```
CASE id=v3-b-m16-gate-row-without-sha expected_exit=1 exit=0 expected_admitted=0 admitted=16 expected_population=16 population=16 expected_reason=s1-source-row reason=- FAIL
BIDI_RUNTIME_SELFTEST verdict=failed cases=56 passed=55
```

Exactly one FAIL; no collateral case failures. With `&& HEX64.test(x.text)` dropped (gate line 750), the sha-less Gate row (`| S002 | https://e.test/s002 | 2026-10-26T00:00:00Z (HTTP 200, 12 B) | "fixture receipt quote" |`, built by `lessonsDoc` at gate lines 948-960 with `bGateRowNoSha`) is accepted as witness, the host check passes (`e.test` == `e.test`), and the gate runs clean — the case fails precisely because the s1-source-row refusal disappeared.

### 4. Case design: behaviour on a fixture, not source text

`runSelftest` (gate lines 1084-1170) builds a synthetic git fixture repo per case (`makeFixture`, lines 1068-1082), writes SOURCES/lesson/entry/transcripts/receipt, and calls the gate's own `evaluate(fx.root, { rev, baseline, entry, ... })` **in process**, asserting exit/admitted/reason/population/detail. The gate's source bytes are read (`gateSource`, line 1086) only for the `gateBlob`/`driverCopyOfGate` fixture options (the v2-f5 byte-copy case) — neither assigned case sets them. The case assertions observe the gate's refusal output, never its bytes; the frozen counter's neutral/decoy/twin probes independently refuse a source-sniffing self-test.

Fixture minimality (each case isolates its rule):

- M07: `run1: { bWsSessionSegment: "b".repeat(32) }` → `goldenLines` (gate line 882) changes ONLY run1's `webSocketUrl` to `ws://127.0.0.1:9515/session/bbb…b` (32 × `b`); the transcript's `sessionId` stays the derived 32-lowercase-hex value. The segment is S127-shape-valid, so `WS_SESSION` (line 148) and the session-shape check (line 382) pass it — the binding check (line 388) is the only rule that can refuse, and it does under pristine.
- M16: `bGateRowNoSha: true` → `lessonsDoc` (lines 949-951) changes ONLY the accessed cell (drops `, sha256 \`aaa…\``); URL and quote stay. The entry cites S002 (new at rev, mined, used-by the entry), so the Gate-row witness requirement (line 750) is the only rule that can refuse, and it does under pristine.

Expected values are the pristine gate's real outcome: the pristine run passes both cases with `ok: true` on every assertion, and each mutant flips the outcome in exactly the asserted direction (sections 2-3). Nothing is tuned to a hypothetical.

### 5. detailIncludes fragility (M07) — low defect, recorded

The pinned substring is the message built at gate line 388 (`webSocketUrl session segment ${m[1]} != sessionId ${sid}`, surfaced with the `run1: ` prefix at the receipt loop). Experiment: on the **pristine** gate (no mutant), reword the message `webSocketUrl session segment` → `webSocketUrl session id` (semantically equivalent, same refusal) → self-test **exit 3**:

```
CASE id=v3-b-m07-ws-session-segment-unbound expected_exit=1 exit=1 expected_admitted=0 admitted=0 expected_population=- population=16 expected_reason=t1-receipt reason=t1-receipt FAIL
BIDI_RUNTIME_SELFTEST verdict=failed cases=56 passed=55
```

All structural assertions still match — the FAIL is purely the detail substring. So the case over-couples to the message's literal phrase: a behaviour-preserving rewording of the gate's message produces a false self-test failure (which the counter's pristine probe would report as predicate-not-met). It cannot cause a missed kill (the M07 kill itself is structural). Severity: low. The M16 case pins no detail and has no such coupling. Receipt: `reword-selftest.txt`.

### 6. Sourced shapes vs S-rows

- **M07** — sourced. The case comment (gate lines 1054-1055) cites "ChromeDriver-shaped session id (S127 shape, 32 lower-case hex)". `corpus/SOURCES.md:141` (S127) teaches: ChromeDriver 154 mints the session id as two `base::RandUint64()` values printed `%016PRIx64%016PRIx64` → "exactly 32 lowercase hex characters, zero-padded, and is echoed verbatim as the W3C `sessionId` and inside the BiDi `webSocketUrl` path". The case's ws segment `"b".repeat(32)` is exactly that shape (so the shape rules cannot fire) and the binding premise (segment must equal the session's sessionId because ChromeDriver echoes the same id in both places) is S127's own teaching. Match confirmed.
- **M16** — no id shape involved; the case claims no S-row and needs none under the sourcing rule (which binds id-shape kill cases). It rests on the lane's own Gate-row receipt convention (a 64-hex sha256 in the lesson's `## Gate` row — the shape `corpus/lessons/round-32.md` uses, per the `lessonsDoc` comment at gate line 947); the fixture's synthetic sha `"a".repeat(64)` matches `HEX64 = /\b[0-9a-f]{64}\b/` (line 150). S130/S131 (browsing-context id = 32 UPPER-case hex targetId, verbatim) back seat A's `v3-a-m08` case, not these two.

### 7. Frozen counter corroboration

Full frozen counter run: `TMPDIR=$S/tmp node .ufo/waves/round-34/counters/c2-gate-mutants.mjs --rev 04f9623dde8ad35d470cecf766e421eafbcb47fa --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json` → **exit 0** (72 s), schema `tabi-r34-c2-gate-mutants-v1`, receipt `c2-counter.json`:

```
predicate: true   killed: 20   survivors: []   unappliable: []   twinsFailing: []
pristine.exit: 0  neutral.exit: 0  decoy.exit: 0  battery.predicate: true
{"id":"M07",...,"occurrences":1,"applied":true,"twinExit":0,"twinFailingCases":[],"exit":3,"failingCases":["v3-b-m07-ws-session-segment-unbound"],"killed":true}
{"id":"M16",...,"occurrences":1,"applied":true,"twinExit":0,"twinFailingCases":[],"exit":3,"failingCases":["v3-b-m16-gate-row-without-sha"],"killed":true}
```

The counter independently confirms both kills with sole-case attribution, and the twin probe (`twinExit: 0`, no failing cases on the whitespace-twin gate at each mutant site) is runtime evidence that neither case sniffs the gate's source for its find text — it exercises the rule.

## Deliverable paths

- Report: `tabi-shokunin/.ufo/waves/round-34/w2/RevKillsM07M16.md` (this file)
- Receipts: `tabi-shokunin/.ufo/waves/round-34/w2/RevKillsM07M16/` — `pristine-selftest.txt`, `pristine-selftest.json`, `m07-selftest.txt`, `m16-selftest.txt`, `reword-selftest.txt`, `c2-counter.json`
- Mutant-application script (scratch, not a deliverable): `/fast/scratch/hyaku/tabi-r34/RevKillsM07M16/apply-mutant.mjs`
