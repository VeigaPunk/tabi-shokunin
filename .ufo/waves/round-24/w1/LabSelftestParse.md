# LabSelftestParse — selftest tally token probe (wave-1)

Seat: `L1Tabi24.LabSelftestParse` (leaf, read-only reporter)
Date: 2026-10-25. Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (tip `573c99e4885382db38babc3a6fc90e77afeb42a6`).

## Hypothesis under test
Every lane gate's self-test prints a stable, machine-parseable tally token, so a
counter can compare a documented figure to the real one without reading the script's
source. Probe: run each gate's self-test twice from the lane root and once from
`/tmp` (absolute script path); record the token and whether it is identical.

## Method
For each gate with a documented self-test command, executed exactly:

- `node scripts/<gate>.mjs --self-test` (or `--selftest` where the row spells it that way) — twice from the lane root;
- `node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/<gate>.mjs --self-test` — once from `/tmp`.

Capture: exit code, full stdout/stderr, sha256(stdout). Raw captures are staged at
`.ufo/waves/round-24/scratch/LabSelftestParse/<gate>.{run1,run2,tmp}.{out,err}`
with `summary.json` (exits + stdout hashes). No lane files were modified; no git/jj
writes were made; no browser was opened.

## Results (token per gate)
`exit` = run1/run2/tmp exit codes; `sha` = identical stdout hash across all three runs.

| Gate (script) | Self-test command | exit | sha stable | Tally token (machine-parseable) |
|---|---|---|---|---|
| adjacency map | `node scripts/check-adjacency.mjs --self-test` | 0/0/0 | yes (d77890f224…) | `ADJACENCY_SELFTEST verdict=clean cases=57 reasons=18 could_not_evaluate=6` |
| aria historical metadata | `node scripts/check-aria-metadata.mjs --self-test` | 0/0/0 | yes (d6ae0b28d9…) | `ARIA_METADATA_SELFTEST verdict=clean cli_cases=36 helpers=4` (+ per-fixture PASS lines, then a JSON payload) |
| closeout-pin-witness | `node scripts/check-freshness.mjs --self-test` | 0/0/0 | yes (32d6959967…) | `FRESHNESS_SELFTEST verdict=clean cases=12` |
| measurement-binding | `node scripts/check-measurement-binding.mjs --self-test` | 0/0/**2** | no | `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=76 reasons=13` (lane root only; see F2) |
| historical-pstack-contract | `node scripts/check-round-contract.mjs --self-test` | 0/0/0 | yes (5e1c535b40…) | `ROUND_CONTRACT_SELFTEST verdict=clean cases=38 alias_checks=1` |
| sources-census | `node scripts/check-sources.mjs --self-test` | 0/0/0 | yes (8a1efa8b30…) | `SOURCES_SELFTEST verdict=clean cases=26` |
| historical-user-contract | `node scripts/check-user-round-contract.mjs --self-test` | 0/0/0 | yes (1a92202e16…) | `USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=45 fixtures=35 alias=1 committedCounts=6 countWitness=1 diagnosticWitness=1 reasonControls=1` |
| freshness witness (probe) | `node scripts/freshness-witness.mjs --self-test` | 0/0/0 | yes (ef0a3bd9d4…) | `FRESHNESS_WITNESS_SELFTEST cases=8 failed=0` |
| round-evidence-audit | `node scripts/round-evidence-audit.mjs --selftest` | 0/0/0 | yes (6edf5d31ee…) | JSON `{"schema":"tabi-round-evidence-audit-v1-selftest","cases":13,"passed":13,…}` |
| r12 claim-record-discipline | `node .ufo/waves/round-12/w1/mistake/check-claim-record.mjs --self-test` | 0/0/0 | yes (feabff132a…) | `CLAIM_SELFTEST verdict=clean cases=9/9` |
| r18 C1 counter | `node .ufo/waves/round-18/measure-c1.mjs --self-test` | 0/0/0 | yes (f92e3640…; run2==tmp; see F4 for env note) | JSON `{"selfTest":true,"cases":[…]}` — first case tally `count=51 eligibleRows=51` |
| r18 C3 counter | `node .ufo/waves/round-18/measure-c3.mjs --self-test` | 0/0/0 | yes (19ad032a…; run2==tmp; see F4) | JSON `{"selfTest":"pass","cases":38,…}` |
| r20 lifecycle documented-row counter | `node .ufo/waves/round-20/measure-c1.mjs --selftest` | 0/0/0 | yes (f98bd3d9f0…) | `MEASURE_C1_SELFTEST verdict=clean cases=45 reasons=24` |
| r20 wave-1 provenance gate | `node .ufo/waves/round-20/check-wave.mjs --selftest` | 0/0/0 | yes (fbe0902228…) | `CHECK_WAVE_SELFTEST verdict=clean cases=27 failed=0` |
| r21 lifecycle observation count | `node .ufo/waves/round-21/measure-c1.mjs --selftest` | 0/0/0 | tally yes, bytes no (F3) | JSON `{"verdict":"clean","cases":83,"passed":83}` |
| r22 semantic outcome oracle | `node .ufo/waves/round-22/measure-c1.mjs --selftest` | 0/0/0 | tally yes, bytes no (F3) | JSON `{"verdict":"clean","cases":45,"passed":45}` |
| r22 review-chronology classifier | `node .ufo/waves/round-22/check-review-chronology.mjs --selftest` | 0/0/0 | yes (49c733ea4b…) | JSON `{"schema":"tabi-round22-review-chronology-selftest-v1","verdict":"pass","exit":0,"cases":[…]}` |

## Findings

**F1 — Hypothesis holds for 14 of the 16 runnable self-tests.** They print a stable,
machine-parseable tally token, byte-identical across two consecutive runs and across
cwd (lane root vs `/tmp`).

**F2 — measurement-binding's `--self-test` is cwd-sensitive.** From the lane root it
prints `MEASUREMENT_BINDING_SELFTEST verdict=clean cases=76 reasons=13` (exit 0). From
`/tmp` it exits 2 with `MEASUREMENT_BINDING verdict=could_not_evaluate claims=0 bound=0`.
Source root cause: default repo/manifest resolve from `process.cwd()`
(`scripts/check-measurement-binding.mjs`: `repo: options.repo ?? process.cwd()` and
`manifestFile = resolvePath(process.cwd(), options.manifest)`). A counter must run this
gate from the lane root — or the gate must be given an explicit `--repo`.

**F3 — r21/r22 measure-c1: tally stable, raw bytes not.** The parsed tally fields
(`verdict=clean`, `cases=83/45`, `passed=83/45`) are identical across all three runs,
but full-stdout sha differs because each run embeds ephemeral disposable-git-tree
revision hexes inside nested `stdout` payloads (e.g. r21 run1 `94499e54…` vs run2
`dbf9b588…` vs tmp `51b8037b…`; r22 `1ad03ac9…` vs `3b86771d…`). Compare the parsed
tally fields, not bytes.

**F4 — r18 C1/C3 selftests are environment-sensitive, not defective.** `/tmp` is a
128 GB partition at 100% (529 MB free at probe time). Both self-tests failed with exit 2
the (`C1 counter: ENOSPC: no space left on device, mkdtemp '/tmp/tabi-r18-c1-self-test-XXXXXX'`;
C3: `{"selfTest":"could_not_evaluate","cases":0,"why":"selftest_failed"}`). With
`TMPDIR` redirected to `.ufo/waves/round-24/scratch/LabSelftestParse/tmp2/`, both pass
(exit 0), emit byte-stable JSON tokens, and behave identically from `/tmp` cwd.
Note also C1's flag spelling: `--self-test` (documented row) is correct; `--selftest`
is rejected (`C1 counter: unknown option --selftest`).

**F5 — Stale declared figures already present at tip (m1-relevant).**
- `sources-census` row (SKILL.md line 1614) declares **25** isolated CLI cases; the
  gate emits `cases=26`. The later correction note (line 1628, "Self-test: **26**
  cases") matches reality; the row figure is stale.
- `closeout-pin-witness` row (SKILL.md line 1559) declares **eight** isolated CLI
  cases; the gate emits `cases=12` (12 name-lines: worktree_clean … descriptor_symlink;
  fixture `freshness.expected.json` also has 12 `selftest` entries). The superseding
  note (line 1591, "12 same-CLI cases") matches reality; the row figure is stale.
- Round contract 38, user contract 45, adjacency 57/18, witness 8, measurement-binding
  76/13: declared figures match observed tokens.
- round-evidence-audit selftest now emits **13** cases (in agreement with the round-23
  commit message's "13 selftest cases" arm), so any surviving "12/12" figure aimed at
  this gate would be stale at tip.

**F6 — Gates whose tally is only derivable from source/receipts (no self-test token)
→ these need a declared tally in their registry row instead:**
- Round-19 `measure-c1/c2/c3` and `isolation/check-isolation.mjs`: their self-tests
  write receipts into `corpus/evidence/round-19/selftests/` in the executing repository
  (SKILL.md lines 2136–2138 explicitly warn "No self-test is a read-only lane
  command"). Refused under this seat's read-only contract, so no in-place re-run and no
  stdout tally; their figures exist only in committed receipts/source.
- `round-18/measure-c2.mjs` and `round-19/measure-c2.mjs` (C2 counters): browser-bound;
  not run (no browser allowed); tally only in committed receipts.
- WebMCP harnesses/probes (`webmcp-invoke-round17/18/19.mjs`,
  `webmcp-validation-round19.mjs`, `webmcp-lifecycle-round21.mjs`,
  `webmcp-loopback-round16.mjs`, `aria-loopback-round13.mjs`): no `--self-test`;
  tallies only from real runs/receipts.
- Round-17 counters (`measure-c{1,2,3}.mjs`): no declared self-test in registry.

## Evidence notes
- Every exit code, stdout hash and token above was captured by the probe driver; raw
  captures are in `.ufo/waves/round-24/scratch/LabSelftestParse/` (summary.json holds
  the three-run exit/hash matrix).
- Freshness fixture: `python3 -c` parse of
  `.ufo/rounds/fleet-round-1-interactive-20261015/freshness.expected.json` →
  `len(selftest)==12`.
- Source quotes for F2: `scripts/check-measurement-binding.mjs`
  (`repo: options.repo ?? process.cwd()`, `manifestFile = resolvePath(process.cwd(), options.manifest)`).
- No tools were installed/changed; vehicle was pre-existing `node`
  (fnm v24.21.0 runtime). No external sites probed.
