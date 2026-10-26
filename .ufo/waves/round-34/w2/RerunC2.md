# tabi round 34 w2 (FALSIFY) — seat RerunC2: independent re-run of C2

**Verdict: HOLDS.** I independently re-ran the frozen C2 counter
(`.ufo/waves/round-34/counters/c2-gate-mutants.mjs`, bytes from freeze commit `59f1b47a`, sha256
`3cf5eb69…325b82` = `claims.json:frozenDigests`) against a fresh shared clone of the lane checked out at the
wave-1 integration `04f9623dde8ad35d470cecf766e421eafbcb47fa`, with `TMPDIR` under my scratch, and got
`predicate true`, 20/20 killed, no survivors, no unappliable mutants, no failing twins, pristine/neutral/decoy
all exit 0, and the round-33 forged-receipt battery `predicate true` (H0/H1/H2 admitted, 0 of 8 forgeries).
Two consecutive runs produced **byte-identical JSON** (`f0df510b…bd479d`): no nondeterminism observed. The
counter also reproduces the frozen *before* at `15dfaccb` (killed 8, survivors exactly
M01 M03 M04 M05 M06 M07 M08 M09 M10 M16 M18 M19, pristine 44 cases), and the twenty embedded mutants are
verbatim the round-33 `MutGateV2/mutants.jsonl` pairs. I found no defect on this axis: the twelve `v3-*` cases
are the sole killers of their assigned mutants, the gate's rule region is byte-identical to the baseline, and
the disclosed residual (a self-test that sniffs its own source) is **not** instantiated — the gate's only
self-source read is used as fixture bytes. Severity of anything found: none.

## Evidence

### E1 — counter identity and frozen digests

```
git -C <lane> show 59f1b47a….ufo/waves/round-34/counters/c2-gate-mutants.mjs > c2.mjs   # exit 0
sha256sum c2.mjs  -> 3cf5eb699934eae48b77c991dae8761780c1c010da1121c1b9623a4d5d325b82
claims.json frozenDigests[".ufo/waves/round-34/counters/c2-gate-mutants.mjs"]          -> 3cf5eb69…325b82
git -C clone show 04f9623d….ufo/waves/round-34/counters/c2-gate-mutants.mjs | sha256sum -> same 3cf5eb69…325b82
```
The counter is unchanged at the integration commit, so the freeze bytes and the REV bytes agree.

### E2 — primary measurement (twice)

```
TMPDIR=$S/tmp node $S/c2.mjs --rev 04f9623dde8ad35d470cecf766e421eafbcb47fa --repo $S/clone --json > run1.json   # exit 0, 60.31 s
TMPDIR=$S/tmp node $S/c2.mjs --rev 04f9623dde8ad35d470cecf766e421eafbcb47fa --repo $S/clone --json > run2.json   # exit 0, 62.24 s
sha256sum run1.json run2.json -> f0df510bb8349f9d813792718ba5f5ba0d2e33be2504b1598617f9e663bd479d (both)
```

```json
{"predicate": true,
 "killedCount": 20, "survivors": [], "unappliable": [], "twinsFailing": [],
 "pristine": {"exit": 0, "last": "BIDI_RUNTIME_SELFTEST verdict=clean cases=56 passed=56"},
 "neutral":  {"exit": 0, "last": "BIDI_RUNTIME_SELFTEST verdict=clean cases=56 passed=56"},
 "decoy":    {"exit": 0, "last": "BIDI_RUNTIME_SELFTEST verdict=clean cases=56 passed=56"},
 "battery":  {"exit": 0, "predicate": true, "forgeriesAccepted": 0,
              "honest": {"H0": true, "H1": true, "H2": true}}}
```
`run2.json` is byte-identical to `run1.json` (diff of parsed objects empty; same sha256), so the counter is
deterministic over these two runs.

Per-mutant outcome (`exit`, failing case ids) — identical in both runs:

| mutant | exit | failing cases |
|---|---|---|
| M01 | 3 | v3-a-m01-duplicate-id-twice |
| M01b | 3 | v2-f2-duplicate-ids, v3-a-m01-duplicate-id-twice |
| M02 | 3 | v2-f7-decorated-measured |
| M03 | 3 | v3-a-m03-measured-cell-uppercase |
| M04 | 3 | v3-b-m04-transcript-path-repeated |
| M05 | 3 | v3-b-m05-transcript-sha-repeated |
| M06 | 3 | v3-a-m06-session-id-uppercase |
| M07 | 3 | v3-b-m07-ws-session-segment-unbound |
| M08 | 3 | v3-a-m08-context-id-lowercase |
| M09 | 3 | v3-a-m09-driver-imports-rows |
| M10 | 3 | v3-a-m10-driver-imports-servefixture |
| M11 | 3 | v2-f6-driver-reexports-gate, v3-a-m09-driver-imports-rows |
| M12 | 3 | v2-f6-driver-reexports-gate |
| M13 | 3 | v2-f5-driver-is-gate-copy |
| M14 | 3 | v2-f8-junk-source-row, v3-b-m16-gate-row-without-sha |
| M15 | 3 | 48 cases (host-equality inversion; killed at baseline already) |
| M16 | 3 | v3-b-m16-gate-row-without-sha |
| M17 | 3 | v2-m19-unmeasured-row-counted, v3-b-m18-clean-with-zero-admitted |
| M18 | 3 | v3-b-m18-clean-with-zero-admitted |
| M19 | 3 | v3-b-m19-sessionid-repeated |

### E3 — the frozen *before* reproduces

```
TMPDIR=$S/tmp node $S/c2.mjs --rev 15dfaccb34601c2d221c78501e2befd8998d600c --repo $S/clone --json > baseline-run.json  # exit 1, 50.19 s
```
`predicate false`, `killedCount 8`, `survivors ["M01","M03","M04","M05","M06","M07","M08","M09","M10","M16","M18","M19"]`,
`pristine {exit 0, cases=44}`, `battery.predicate true`. Survivor set is equal to
`baseline/c2-J1-do-nothing.json` (compared programmatically: `survivor sets equal: True`), and to the
round-33 `MutGateV2/mutants.jsonl` self-test readings (its 12 survivors are exactly these ids).

### E4 — delivered mutant set is the frozen one (no easier mutants)

Parsed the counter's `MUTANTS` array and the round-33 file
`.ufo/waves/round-33/w2/MutGateV2/mutants.jsonl` (at REV): 20 rows each; `id`, `area`, `find`, `replace` are
**verbatim equal for all 20** (`MISMATCHES: none`). Each `find` occurs exactly once in the REV gate (counter
`unappliable: []`), and their line numbers (144-867) all lie inside the rule region that is byte-identical
between baseline and REV, so mutations at REV mutate the same rule text they mutated at baseline.

### E5 — rule lines untouched; only cases / fixture options added

`git diff --numstat 15dfaccb 04f9623d -- scripts/check-bidi-runtime.mjs` → `62 7`. All seven deletions are
inside fixture builders and the self-test harness (`goldenLines()` option list at `scripts/check-bidi-runtime.mjs:878`
and the `wsUrl` line in that builder; `lessonsDoc()` at `:949-956`; the `runSelftest()` `lessonsDoc(...)` call at
`:1093`; the `pass`/`results.push` lines at `:1163-1165`). Lines 1-877 — every rule line — hash identically at
both revs: `c30b13f09f500a82a7cbfc044752b223edb4bcca71cfe63f538bb1576c96edeb`. Gate blob sha256 at REV
`370e8e95417e16dd3535f2dd5015a0b820655934200d489434fb642db7d86c87` (= `gateSha256` in both runs); baseline
`eded1be04a47fbd2b87fbff42ef5187e0d473e6fe2bca55ac1c622ab8bde61c1` (matches the claim's stated baseline).

### E6 — each kill comes from the rule it targets (attribution probe)

Built the gate at REV plus each single mutant in `/scratch/mod/` and ran `--selftest --json` directly
(pristine exit 0, every mutant exit 3). Observed behaviour of the intended case under its mutant:

| case (`scripts/check-bidi-runtime.mjs`) | pristine reading | under its mutant |
|---|---|---|
| v3-a-m01 (`:1027`) | exit 1, pop 2, `x3-duplicate-id`, "R2 appears 2 times" | exit 0, **admitted 2** |
| v3-a-m03 (`:1031`) | exit 0, admitted 2 | exit 1, **admitted 0** (`Yes` no longer folded) |
| v3-a-m06 (`:1036`) | detail "sessionId is not 32 lowercase hex" | shape passes; refused later by the ws-url shape → detail differs |
| v3-a-m08 (`:1040`) | detail "browsing-context id not ChromeDriver-shaped" | exit 0, **admitted 16** |
| v3-a-m09 (`:1043`) | detail "driver imports non-allow-listed gate symbol(s): ROWS" | exit 0, **admitted 16** |
| v3-a-m10 (`:1046`) | exit 0, admitted 16 | exit 1, "…non-allow-listed gate symbol(s): serveFixture" |
| v3-b-m04 (`:1051`) | detail "transcript path repeated…" | sha rule fires instead → detail mismatch |
| v3-b-m05 (`:1053`) | detail "transcript sha256 repeated…" | sessionId rule fires instead → detail mismatch |
| v3-b-m07 (`:1056`) | detail "webSocketUrl session segment … != sessionId" | exit 0, **admitted 16** |
| v3-b-m16 (`:1059`) | `s1-source-row`, "no … `## Gate` row with an https URL and a 64-hex sha" | exit 0, **admitted 16** |
| v3-b-m18 (`:1062`) | exit 1, admitted 0, clean guard | exit 0 |
| v3-b-m19 (`:1065`) | detail "sessionId repeated across runs: 0f1e…" | exit 0, **admitted 16** |

`detailIncludes` compares gate *output* (`firstDetail`, `:1161`, from `entryDetail` or the first non-admitted
row's `detail`; `:1164`), never gate bytes, so the two ambiguous cases (M04/M05, where a sibling rule refuses
the same fixture) pin which finding fired instead of weakening the case. Cross-kills noted: M01b also fails
v3-a-m01, M11 also fails v3-a-m09 (its inverted resolve makes the gate-imported `ROWS` invisible to the
allow-list check), M14 also fails v3-b-m16 (its dropped witness requirement admits the no-sha Gate row),
M17 also fails v3-b-m18 (its arithmetic admits unmeasured rows). All are monotone: no mutant survives, and no
kill depends on an unrelated case disappearing.

### E7 — the disclosed residual is not instantiated

The gate's self-test does read its own source (`scripts/check-bidi-runtime.mjs:1086`
`const gateSource = readFileSync(fileURLToPath(import.meta.url));`), but the only uses are as fixture bytes:
`:1127` (`driverCopyOfGate ? gateSource : …`) and `:1129` (`fx.put(GATE_IN_FIXTURE, gateSource)`). There is no
`gateSource.includes(...)`, normalised-text, hash or length comparison anywhere in the file (grep for
`gateSource` returns exactly those three lines). Consistently, the neutral edit (`G + comment`) and the decoy
comment quoting **every** mutant replacement both exit 0, and all 20 whitespace twins (first space in each find
doubled) exit 0 (`twinsFailing: []`). The residual counter limit — a *normalised find-text sniff* would pass
these probes — remains a code-read obligation, and the code read clears it.

### E8 — no-harm leg re-run independently

Fetched the round-33 battery bytes from `e6b0a907` (sha256 `51ace65f…24e812b` = pinned) and ran it myself:

```
TMPDIR=$S/tmp node battery.mjs --rev 04f9623dde8ad35d470cecf766e421eafbcb47fa --repo $S/clone --json   # exit 0, 5.25 s
-> {"predicate": true, "forgeriesAccepted": 0, "honest": {"H0": true, "H1": true, "H2": true}}
```

### E9 — sourcing leg spot-check (context, not the counter's predicate)

`corpus/SOURCES.md` rows S130-S133 are new between baseline and REV (S130 `base/token.cc` 32 upper-case hex,
S131 mapper `targetId` naming, S132 session minting/no dedupe, S133 PKGBUILD); the new note
`corpus/knowledge/bidi-gate-selftest-round-34.md:1-2` cites S127/S125 (re-opened) and S130/S131/S132 (opened
this round), matching the C2 "sourced" type. The gate's inline comments on the M06 case cite S127 directly and
the M08 case cites the round-32 transcript rather than S130/S131 — a citation-completeness nit in a comment,
not a predicate failure; the substantive sourcing lives in the knowledge note and lesson Gate table.

## Non-findings / residual limits of this seat

- Nondeterminism: none across two full runs (identical bytes, identical per-mutant failing-case ids).
- The counter cannot, by construction, prove each kill is *semantic* rather than incidental; I probed all 12
  previously surviving mutants (plus M01, M11, M14 for the cross-kills) and every kill is a direct behaviour
  change at the named rule (E6). I did not re-derive the remaining baseline-killed 5 (M02, M12, M13, M15,
  M17) beyond their recorded failing case.
- `detailIncludes` adds one more string the self-test must match; a case whose expected detail drifts would
  fail loudly (exit 3), not silently pass — no weakening observed.
- No browser was launched; no network fetch was made; no tool was installed or upgraded; no lane file was
  modified (`git -C $S/clone status --porcelain` empty; lane checkout untouched; scratch `$S/tmp` empty after
  the counter removed its clones, and the whole `$S` tree is deleted before yield).

## Deliverables

- Report: `.ufo/waves/round-34/w2/RerunC2.md` (this file)
- `tabi-shokunin/.ufo/waves/round-34/w2/RerunC2/run1.json`, `run2.json` (byte-identical counter output, predicate true)
- `tabi-shokunin/.ufo/waves/round-34/w2/RerunC2/baseline-run.json` (before-reproduction: 8 killed, 12 named survivors)
- `tabi-shokunin/.ufo/waves/round-34/w2/RerunC2/battery-run.json` (independent round-33 battery: predicate true)
- `tabi-shokunin/.ufo/waves/round-34/w2/RerunC2/st-*.json` (per-gate self-test readings: pristine + 14 mutants used for attribution)
- `tabi-shokunin/.ufo/waves/round-34/w2/RerunC2/commands.txt` (commands, timings, exit codes, digests)
- stderr files for all four counter/battery runs (all empty)
