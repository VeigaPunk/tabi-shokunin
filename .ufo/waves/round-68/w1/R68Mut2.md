# R68Mut2 — C2 registry gate mutation probe (round 68, w1)

Scope: 11 exact-location mutants on a scratch copy of `scripts/check-instrument-registry-r68.mjs`
(lane base 1746c53de7d56e8aeaf420a68b5b95e6af96adf8). Production gate not modified.

## Verdict

- 11/11 mutants applied (each old string matched exactly once; count asserted).
- 11/11 killed overall, but only **2/11 killed by the internal `--selftest`**.
- The internal selftest misses 9/11 mutants. All 9 are caught only by the public parser
  (`--skill` / `--repo`) against fixtures I built. The selftest is blind to public-parser
  integration and to the fixed `EXPECTED` list.

## Kill definitions (stated, not inferred)

- Selftest kill: selftest rc differs from pristine rc (0). Stdout-only differences are
  recorded separately and are not counted as kills.
- Public kill: rc or parsed `ok`/`findings` differs from pristine on at least one fixture.
  Stdout-only differences are not counted.

## Mutant table

| id | class | exact mutation | selftest verdict | public killers (verdict-level) |
|---|---|---|---|---|
| M01 | sha equality | `shaInRow !== sha256File(abs)` → `false` | **killed** (rc 1; sha-mismatch case observed 0) | fixture-bad7 (rc) |
| M02 | sha equality, prefix | regex `{64}`→`{8,64}` and `!==` → `!startsWith(shaInRow)` | survived (rc 0, identical stdout) | fixture-prefix (rc) |
| M03 | entry binding | `entry.includes(p)` → `entry.includes(basename(p))` | survived | fixture-entry2 (rc) |
| M04 | owner missing | drop `owner === '—'` clause | **killed** (rc 1; field-missing case observed 0) | fixture-owner (rc) |
| M05 | scope missing | `if (!scope…)` → `if (false)` | survived | fixture-mv (findings) |
| M06 | verdict missing | drop `verdicts === '—'` clause | survived | fixture-mv (findings) |
| M07 | section recognition | exact `=== SECTION` → dash-normalised match | survived | fixture-hyphen (rc) |
| M08 | section terminator | `break` on next `## ` removed | survived | fixture-tail (rc) |
| M09 | duplicate row | `byPath.has` duplicate-row check removed | survived | fixture-dup (rc) |
| M10 | EXPECTED list | `'scripts/verify-live-r67.mjs'` removed from EXPECTED | survived (selftest passes `['tool.mjs']`, never reads EXPECTED) | fixture-bad7, fixture-entry2, fixture-owner, fixture-prefix (rc) |
| M11 | selftest-unstated | drop `startsWith('—')` branch | survived | fixture-explicit (rc) |

Full per-fixture stdout for every mutant: `receipts/harness-report.json`.
Mutant sources: `receipts/mutants/mut-M01.mjs` … `mut-M11.mjs`.

Producer SHA-256 of each mutant (the file executed):

- M01 7d6a1af439c8ab7e0541388018ef0d2590135e4fc26cddcae19b4e697a11ccd1
- M02 07c072c252a5553bbdec569e7cf28ec1943f79bfbf979de1cfd365e7a90d3ac2
- M03 44923d0d1e494b8e73c47ee4818328eece742552ce49ba7e4c89d1b3bbba2e30
- M04 08ec512651a25c22211925cbec2eef762bcec4e8f32cc7a349a9af41e413e123
- M05 304a5812cce107abd1ab0f3eda930b43816ccbca9c5551458dd35dc1a1384cf1
- M06 7421d42e7bd645ec6d230eb3052b626c80025277f1dedea37f1dfdec0d6803d4
- M07 0f859fa143e4bc5d62eb06a4d4b897bc74f93b89080d158d30c4fe62fcde2609
- M08 3f76df4a0cb126c45fbe65eb59bf34e96cb6037fa8a29db033526fbfb5596f1c
- M09 89d511dc10764fce2a784888df7e8c8130609c3d8e24c6e4b774a47eb09bc886
- M10 5f78cda873f661b62ce48dfc6cc1a0ee62703f105082d488c240231631353a35
- M11 9b0ae6994d7a467cee184dc367d92f6ebf48da5458caf11042c6291cfc2f1dd4

## Receipts

Production gate (pristine, unmodified): `scripts/check-instrument-registry-r68.mjs`
sha256 `25cdc6c3c13fb73c12712d3fad8fce279d50fe5563ad077308eb369c4ffd0e17`, byte-identical
before and after the probe (rechecked at the end).

Harness: `receipts/harness.mjs` sha256 `3e4714c70d7bbdd07c5cae1a2ce6e24e36ebff1eacc284f4d49da76192e0d1a6`
(run with `node harness.mjs`, cwd scratch, node v24.21.0, no installs).

Pristine internal selftest:
- argv: `node gate.pristine.mjs --selftest --scratch <scratch>/st`
- rc: 0
- stdout: `{"verdict":"clean","cases":7,"failed":0,"results":[...7 cases...]}`
- `receipts/selftest/pristine-selftest.out`

Pristine public probes (argv: `node gate.pristine.mjs --skill fx/<f> --repo /home/vgpnk/Projects/shokunin/tabi-shokunin`):

| fixture | input sha256 | rc | stdout |
|---|---|---|---|
| fixture7.md (green 7-row) | 9b74af9f511703ef455f94dcd734de77e16f05b9141a6284dee87daed3ae119c | 0 | `{"ok":true,"findings":[],"byCheck":{},"expected":7,"gate":"check-instrument-registry-r68"}` |
| fixture-bad7.md (verify-live pinned wrong sha) | 7f39ca459c009a84fc7f36cf5b1dea1db7a67a615d68fd9e3b655e07c8fc85d8 | 1 | `{"ok":false,"findings":["sha-mismatch: scripts/verify-live-r67.mjs"],...}` |
| fixture-prefix.md (8-hex short pin) | 837ef7f42f81226d88a9fb8be53dfa85ce792129885a7f7eaa0673fa0544d825 | 1 | `{"ok":false,"findings":["sha-unstated: scripts/verify-live-r67.mjs"],...}` |
| fixture-mv.md (scope '—' + verdicts '—') | a11a1a0252ac7cad3ac1f9506e20a497ccf6f835556c0dd180afa61b9b3b4b26 | 1 | `findings: ["field-missing: …chromium-hscroll-r67.mjs:scope", "field-missing: …mutate-r67.mjs:verdicts"]` |
| (no-repo, cwd = lane, fixture7) | 9b74af9f… | 0 | identical to green row above |

Extra fixtures (pristine public probes, same argv form), input sha256:

- fixture-entry2.md f9eea3ea0dee970698aaa68e8a200e45ab44f87c3254b44b3c02446fc53262da
- fixture-owner.md d2ece408a7860678ebc91e1fddc9d0a7108a849914b12569547a0c5c30a5d733
- fixture-tail.md 92aa7df8b4391b1d52202ca00629438adc027222430a1f2ca1ecd012b8b058a1
- fixture-dup.md 9dacccab3e6aaa75d1816c22f7b6c2b93cef4b3047543cc1c09de9af4b7e4a53
- fixture-hyphen.md bc9e8ebe8383c2e5547fa35475244fc24bf4ba4c6b43419ede73ae1b53e447f2
- fixture-explicit.md 65cbba96c949c33cbbc83498e49a4c16a36e5ce14744430b7baf0013e7c3c80d

Full pristine/mutant stdout: `receipts/harness-report.json`.
Fixtures persisted: `receipts/fx/`. Per-fixture pristine public stdout: `receipts/public/`.

## Findings

1. **Selftest is internal-only and misses public-parser integration.** The selftest calls
   `check(text, scratch, findings, ['tool.mjs'])` and never calls `main()` or the CLI
   argv path. Any defect that needs the real `EXPECTED` list, the real
   `--skill`/`--repo` parse, or the 7-row section shape is invisible to it (M02, M03,
   M05, M06, M07, M08, M09, M10, M11 all survive the selftest).
2. **Fixed EXPECTED path integration is untested by selftest.** M10 (drop
   `verify-live-r67.mjs` from EXPECTED) passes the selftest and only shows up via public
   parsing: rc 1 → 0 on fixture-bad7, which holds a deliberately wrong pin for that row.
3. **Two selftest kills are real but narrow.** M01 is caught by the sha-mismatch case, and
   M04 is caught by the field-missing case because the selftest's owner cell is `—`. The
   selftest's field-missing case sets scope to `scratch`, not `—`, so scope/verdict
   checks have no selftest coverage (M05, M06 survive).
4. **Sha equality and prefix acceptance.** Full-equality (M01) is covered; a short-pin prefix
   acceptance (M02) is not in the selftest, only in the public path, and only because
   fixture-prefix carries an 8-hex pin.
5. **Entry binding is a substring check.** `entry.includes(p)` (M03 basename weakening)
   survives the selftest because the selftest uses one basename in one dir. Only a
   different-dir-same-basename fixture (fixture-entry2) distinguishes them.
6. **Section recognition is exact em-dash match.** A hyphen variant (M07 permissive) is only
   visible through the public parser with fixture-hyphen.
7. **Explicit-dash selftest reason is accepted by design but untested** (M11).
8. **Public kills are fixture-dependent.** Each survivor needed a purpose-built fixture
   (six extra fixtures were built; none existed in the lane). The gate's shipped tests
   therefore do not exercise these behaviors either.

## Prediction correction

Before running, I expected M04 (owner) to survive the selftest. It was killed, because the
selftest's field-missing row sets owner `—`, not scope. The harness result is the record.

## Calibration notes

- Kill used rc/ok/findings, not stdout alone. Under that rule every public kill above is a
  verdict-level kill (rc or findings differ). M10 is a verdict kill via rc on four fixtures,
  not a cosmetic `expected`-count diff.
- Selftest kill counted only on selftest rc change. Selftest per-case token changes that don't
  flip rc are not kills.

## Lane / tooling / hygiene

- No production or sibling file was modified. The lane gate sha was rechecked at the end:
  `25cdc6c3…` (unchanged).
- Mistake and cleanup: an early fixture generator wrote to `/home/vgpnk/fast/…` (path-join
  error). I moved the files to `/fast/scratch/hyaku/tabi-r68/R68Mut2/fx`, removed the stray
  `/home/vgpnk/fast` tree (confirmed absent), and fixed the generator to absolute paths.
- Scratch `/fast/scratch/hyaku/tabi-r68/R68Mut2` deleted after evidence was persisted to
  `.ufo/waves/round-68/w1/R68Mut2/receipts/`.
- Tooling: none installed or updated. Used the existing `node` v24.21.0 only.
- Git: no mutations; no git commands run.
- Report hygiene: one erroneous in-place edit truncated this file to its heading; the file was
  fully rewritten from the same content. The `receipts/` evidence was not affected.

## Checks for L1 to run

- None. Assignment says run only assigned probes; the harness and receipts above are the full
  record. L1 may re-run `node receipts/harness.mjs` against a fresh scratch dir with the
  same fixtures to reproduce all 11 verdicts (the harness writes into a scratch dir set by
  `S` in its source; point it at a fresh scratch first).
