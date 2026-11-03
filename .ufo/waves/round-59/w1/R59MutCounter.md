# R59MutCounter — mutation runs on the r59 counter (tabi round 59, w1)

Seat: R59MutCounter (mutation tester, leaf). Lane: tabi-shokunin. Baseline revision:
`4e7fb89d7b71a6fdf661680891440be6577759e8`; working tree HEAD at start `dd337bb3`.
Authority: `.ufo/waves/round-59/claims.json` (read at dispatch, then re-read after each L1
pre-data pin: `a40822d9`/`03f64a39` critic pins incl. f1–f8, `e7cc1331` f9, final
`3325f2ccf016ae2ca2a6871c260f60a134e67df300e60b57c87f5119fa2d4957`). C2’s restatement
(measured-negative delivery boundary `chromium-keyevent-delivery-boundary-linux`, R1/D1/D2/D4,
f1–f9) is what the mutants are judged against.

## Instrument pin (and one drift, disclosed)

| state | sha256 | bytes | note |
|---|---|---|---|
| author-declared FINAL | `35461bbeb9e26981941d5b597b16c8138181ebdb919c06d53dbdc44f81bf9332` | 125756 | 90 selftest cases |
| **frozen bytes cited by every receipt here** | `b287cfa21bfb9193a445c293d52aceebae99412191fd588c184c82078bee5136` | 131074 | 91 cases, mtime 18:24:40 |

The file changed at 18:24:40 after the author's FINAL message: the L1-requested pre-freeze D1
positional strengthening (R59Probes’ d6 maskability class) plus the 91st case
`keylog-flag-mismatch-masked-control`. I flagged the drift to `agent://R59Counter` and
`agent://TabiR59`; R59Counter confirmed in writing that `b287cfa2…` **is** the intended freeze
bytes. All receipts below cite `b287cfa2…`; the earlier 90-case run is recorded as history in
each kill receipt and is not treated as authoritative. Fixture set integrity: 208 files,
`fixtures-sha256.txt` `9f1b5447647dc653c5ffdf4fa089993a85109cc41548d201c22a78b4a2cfd12c`
(208/208 entries match their bytes, no file outside the manifest), `f-probes-map.json`
`632fc872b9ec1afc96eaf3cd057084904cd8ebc135b9f6f5b09a8fa05488040c`.
The canonical counter and its fixtures were never written by me: post-run
`sha256sum` = `b287cfa2…`, size 131074, mtime unchanged at 18:24:40.

## Method (three independent detectors per mutant)

1. **Selftest detector** — `node <mutant-copy> --selftest`, exact per-case finding sets, run on
   (a) the pristine copy in the scratch workdir, (b) the mutated copy, (c) the byte-restored copy
   (`sha256` re-equal to canonical). Baseline must be 91/91 all-pass; a baseline failure is
   INCONCLUSIVE, never a kill.
2. **Fixture-level detector** — pristine vs mutant counter bytes on the fixture receipt the kill
   rule names (exit + findings).
3. **Independently forged receipt detector** — a receipt authored by me in scratch
   (`forge/build-receipt.mjs`) from the r58 committed receipt shape with **my own** nonce
   `tabi-r59-a1b2c3d4e5f6`, 18 own PNGs, my own stub driver and host token: the base is GREEN on
   the canonical counter (exit 0, findings [], couldNotEvaluate []), then each f1–f9 forgery is
   applied on top, so each shape isolates exactly one forge. Deterministic: two builds of the same
   shape are byte-identical (`diff -r` clean).

Mutant copies are always scratch copies; edits are exact string replacements applied once
(`found`/`ok` recorded). No edit touches the canonical file.

## Results (frozen bytes `b287cfa2…`, selftest fixture set 91 cases)

| id | declared defect | mutated sha256 | selftest | exact-findings fixture | forged receipt | verdict |
|---|---|---|---|---|---|---|
| C1 | D1 dropped (both call sites: positional/distinct-occurrence block compare + continuation-loop block compare) | `2d723b9d28d4c0fab685bc18a6f59f77086de01988c19fae18dd653bdefb50f3` | FAIL, 3 cases: `keylog-flag-mismatch-masked-control`, `keylog-flag-mismatch`, `swallow-pagekeylog-continuation` | `keylog-flag-mismatch.json`: 1→`[keylog-flag-mismatch]`, mutant 0→`[]` | f4-forged-page-flag: canonical `[keylog-flag-mismatch]`, mutant `[]` | **KILLED** |
| C2 | D2 dropped (recorded plan and declared plan never compared) | `0325dbe6adfd83c0f6c35a1bd0e08de366e68d1f75915669cd4c938f471f64d9` | FAIL, 7 cases incl. `step-plan-reordered`, `step-plan-extra-step`, `step-plan-shot-set`, the three crossgen cases | `step-plan-reordered.json`: 1→`[step-plan-mismatch]`, mutant `[]` | f2-step-reorder and f8-shot-set: canonical `[step-plan-mismatch]`, mutant `[]` | **KILLED** |
| C3 | caps absence guard relaxed to accept any caps reading (the restated claim has no latch order; the equivalent defect is admitting a true read) | `6978fdf71ec3648ba20e43378af95898edae7a1a2b97d9e761d29d49240e8b4e` | FAIL, 1 case: `caps-flag-true` | `caps-flag-true.json`: 1→`[caps-flag-true]`, mutant `[]` | f5-caps-true: canonical `[caps-flag-true]`, mutant `[]` | **KILLED** |
| C4 | per-form single-submission relaxed: `rows2.length !== 1` → `< 1` (two `/echo2` accepted) | `f6471cee8c9d8b1edc60b3fbd1fdb78ce9fc12cb4d8989f62237f30fa25d7d8e` | FAIL, 1 case: `echo2-double` | `echo2-double.json`: 1→`[echo2-count-wrong]`, mutant `[]` | f7-two-echo2: canonical `[echo2-count-wrong]`, mutant `[]` | **KILLED** |
| C5 | absent receipt exits 0 (`receipt-missing` no longer emitted; load still short-circuits) | `a653b39f7db6da8d4756ca7bac59f8b838e2162e6ebadbcce009b14724353a44` | FAIL, 1 case: `receipt-missing` | absent-by-construction: pristine exit 1 `predicate:false`, mutant exit 0 `predicate:true` | n/a (the absent-receipt case is the detector) | **KILLED** |
| C6 | delivered-shape `cancelable` requirement dropped (SHAPE_KEYS presence loop + strict `cancelable!==true` return) | `4f7417218e2df13cb0bd471d8735e065e2c3f4df1be08cbc6e263a1719297d6c` | **SURVIVED** (91/91 still all-pass) | author `missing-delivered-shape-field.json` (keyCode variant): mutant **still refuses** → hole is cancelable-specific | f6-missing-cancelable: canonical 1→`[missing-delivered-shape-field]`, mutant 0→`[]` | **KILLED-BY-FORGED-RECEIPT** (selftest survivor disclosed) |
| C7 | Shift detector forced positive (constant-false recorder accepted) | `bc8e7822c135ee153699c5c766d621d3efa68d9f73c0cc13827a8c67eb2e714d` | FAIL, 2 cases: `shift-detector-negative`, `crossgen-r57-receipt-to-r56-counter` | `shift-detector-negative.json`: 1→`[shift-detector-negative]`, mutant `[]` | f9-shift-constant-false: canonical `[shift-detector-negative]`, mutant `[]` | **KILLED** |

Every mutant’s selftest run recorded: baseline exit 0 / allPass true, mutated exit 1 / allPass
false, restored exit 0 / allPass true with `restored.sha256 === canonicalSha` (byte restore).
C6: baseline and mutated both 91/91 (that is the finding); restored matches canonical.

### Disclosed survivor (not smoothed)

C6 is the one mutant the frozen fixture set does **not** kill: no case exercises the
`cancelable`-absence branch of `SHAPE_KEYS` (the author’s f6 fixture removes `keyCode`, caught by
the VK branch). The gap is a fixture-coverage finding, not permission to change the contract: the
canonical counter still refuses the forged f6 receipt, and the mutant is killed by that
independently authored receipt. Recorded in `coverage.json` → `variantNote.f6` and in
`C6-kill.json` → `variantFinding`.

### Independent coverage audit (`coverage.json`)

* canonical `--selftest`: exit 0, **91/91 all-pass**, `idCoverage {required 58, covered 58,
  uncovered [], stray []}`.
* independent parse of the source bytes: **58** declared finding ids, **58** distinct
  `add('id', …)` emission sites, union 58; **91** fixture cases; ids with **no** exact-findings
  fixture: **none**; fixture-only ids: none; declared-but-unemitted: none; emitted-but-undeclared:
  none.
* f1–f9 kill-rule shapes: **9/9 covered**, each by a fixture whose expected set is exactly that id
  and whose observed set equals it (`f7` has two legs: `echo2-double` for `/echo2`, carried
  `swallow-enter-chord-leak` for the `/echo` count; `f2` and `f8` share `step-plan-mismatch` via
  `step-plan-reordered` / `step-plan-shot-set`).
* my independent forged receipts reproduce each shape: f1→`[schema-wrong]`,
  f2→`[step-plan-mismatch]`, f3→`[driver-sha-mismatch]`, f4→`[keylog-flag-mismatch]`,
  f5→`[caps-flag-true]`, f6→`[missing-delivered-shape-field]`, f7→`[echo2-count-wrong]`,
  f8→`[step-plan-mismatch]`, f9→`[shift-detector-negative]`.
* residual, named and not counted as a gap: **a byte-perfect replica of a genuine receipt is
  indistinguishable by construction** — genuineness rests on the L1 live pass plus committed
  provenance (frozen killRules.C2 residual).
* variant note: f6 is covered by the `keyCode` variant only; the `cancelable` branch is pinned
  solely by the forged f6 receipt (C6).

## Artifacts (all under `.ufo/waves/round-59/mutant-counter/`, sha256)

| path | bytes | sha256 |
|---|---|---|
| `C1-kill.json` | 5271 | `8590d4a948fac57aa23ad2fcd5054a1eaa7aeca22f3c8fc9cfe18ca2a2f7c30d` |
| `C2-kill.json` | 10402 | `d9905576858b82650681f3fec973a1575d0612e0ad73904c0999b4a53b1a802c` |
| `C3-kill.json` | 4133 | `7b9bd117ebd9140fbbfefd6a9182acc82fddf84de85849681ce5a7a95a36a848` |
| `C4-kill.json` | 3985 | `c9c8bca729b549dae6abbee3479af52fb829534bf42703e085e10409627d6e68` |
| `C5-kill.json` | 3720 | `0cf6b9f7e25bdaa21934c3133c05aaa19f674d15fcc17433bb5124ed1d095b6d` |
| `C6-kill.json` | 4528 | `5d295c9352435aafddc439be1e3de26d9e86746b4378dc7f2ae1dadd96f8aaa1` |
| `C7-kill.json` | 5237 | `ece169781785f037229cf3a7547d919dc2e6e44d8925b31ccedfe44270e343a0` |
| `coverage.json` | 19486 | `37df88737a9fcaee95b0c31d974d3b8039b4b858dce2bc3bd2206a0d6e8d19a1` |
| `index.json` | 10960 | `9c9de351f57d6742ecfeebb152238e32c3dd810156206a2e0a5736bc5b12f96e` |
| `counter-drift-35461bbe-to-b287cfa2.diff` | 10879 | `94c0f7d5d2f2930d2ffaad5fcdb44f272327c43bc48d49ffb1818ca2e0f13966` |
| `forge/build-receipt.mjs` | 19978 | `4c08058f72fb34fded821c220e70906e53e3efd94de488dbcdeac6e5b09f5942` |
| `forge/f6-missing-cancelable/receipt.json` | 83831 | `4b0a31248cd9d07c3f79607eeb8f1405cafcb15b0eb017992ace816ba12656b0` |
| `forge/f6-missing-cancelable/driver-stub-r59mut.mjs` | 110 | `3a771f8a468e04d422c3b8961b123b1ec603806fbddf33ff0fe05adb6c008b9c` |
| `forge/f6-missing-cancelable/canonical-probe.json` | 898 | `fe6f8c1436051f697de4586f54f7307f10f661a0278d749232c6eafad6952538` |
| `forge/f6-missing-cancelable/{a-start..r-form2-echo}.png` (18 files, 73 B each) | 73 ea | `cfeee85c…`, `f3a0e951…`, `748829af…`, `d66cf453…`, `3209e9d8…`, `ce148ef7…`, `c2b0f3f4…`, `25b108a0…`, `2de22b08…`, `806411c5…`, `c66c5a3e…`, `3da7e64e…`, `a216a296…`, `cb912c85…`, `21c7f935…`, `a66397ed…`, `569146a1…`, `a7c1e835…` (full list in `index.json`) |
| `forge/f1-schema/receipt.json` / `canonical-probe.json` | 83856 / 761 | `31b4c447e85d9e79ce254aaa7c25623e9b24ebb0f01edcbce97a06e0c7ea9077` / `c99d51b10dc2d3379fd8cdaa0b42585f9844ce63c063c62bd7e2866faa3c15b0` |
| `forge/f2-step-reorder/receipt.json` / `canonical-probe.json` | 83856 / 1585 | `0f2a80ff223ff0cc5d7727d98845aa96fc7576de7a787418c6c259e18b2af44b` / `dbfe029b6a81536bad23c645cafe5c14c58ca44cbeb3d271ba1439e7fd78f938` |
| `forge/f3-driver-sha/receipt.json` / `canonical-probe.json` | 83856 / 1048 | `7e42064cf6937679b546f556850a68c64a0aad0e94936c90d3dd9756897a5344` / `58c88db7db41f9c079544c26177cfa2d98210da12053a0faa418d840bc3eeeef` |
| `forge/f4-forged-page-flag/receipt.json` / `canonical-probe.json` | 83857 / 1121 | `d0809af82441dbd013bca72bf4d8430e4a87c9df9d4940d6619e384ab4fd6aa7` / `a0dd2f1882b617e24782e42c508777999a2b1aee179cd7d3b8ed8866bf7581ec` |
| `forge/f5-caps-true/receipt.json` / `canonical-probe.json` | 83855 / 876 | `e2145a9484508392b6d8b5b8e657fbc463e3a9d455eda85029be86fbba3e5d7f` / `e85f288dab3b44018ea6f5fc1cb06aa81169d0a00d2f52466ac1478b6ccf6699` |
| `forge/f7-two-echo2/receipt.json` / `canonical-probe.json` | 84024 / 861 | `beba40681141ce5dfcece418fdf157523b72770ad627f66d2abfd2e727420593` / `909f0a85f2265f615425b72604897177cb38febbf617beb524ea55de6463059f` |
| `forge/f8-shot-set/receipt.json` / `canonical-probe.json` | 83856 / 889 | `85cfa006aec8fae876006e868352869dd2f2312e72a3613ad1fb05f2ed83e020` / `fed49331fef60d90f1027c791ebcf03d4dd94ea10f3366b818a29d2750a78db0` |
| `forge/f9-shift-constant-false/receipt.json` / `canonical-probe.json` | 83900 / 1036 | `0dcf9b82336d4e5d10e9e332372c993555fb7134ca0968eb2dae5f2786d09f38` / `ac6ad752329e0f34dc900ed3fe96638e4d148abbb60c198e94d983ad45cc56cd` |

`index.json` carries the authoritative sha/bytes list for all 47 artifacts (the per-shape receipts
other than f6 ship without their PNGs, which rebuild byte-identically with
`node forge/build-receipt.mjs --out <dir> --forge <shape>`; the builder is included).
Write discipline disclosure: every file was written once in one composed finalize run, with two
exceptions — (1) this report was corrected once before final write (a placeholder sha for
`index.json` was replaced by the computed `24653b4e…`); (2) after that run I appended the
`counter-drift-35461bbe-to-b287cfa2.diff` evidence and its `index.json` entry, so the pre-addition
`index.json` sha was `24653b4e6dad1cbdb40d28eceff6b82e24a4a4b0d4810a231be72867e2e8c8cd` (the
current one is `9c9de351…`). The diff also preserves the superseded bytes: reverse-applying it to
the frozen counter reproduces `35461bbe…` / 125756 B exactly (`patch -R` verified).

## Commands run (all outcomes)

1. `read .ufo/waves/round-59/claims.json` (+ jq-style dumps of C2/killRules after each L1 pin):
   policy read, no mutation; the final read sha is `3325f2cc…`.
2. `read /home/vgpnk/.omp/agent/RULES.md` — tooling policy read; **no installs were needed or
   made** (node v24.21.0 and python3 sufficed).
3. `ls`/`stat`/`sha256sum` on `.ufo/waves/round-59/{,counters,runner,measure}` and the fixtures
   manifest — presence/sha observations only.
4. Bounded polls (20 s cadence, exit 3 on expiry): counter absent for the first ~22 min, then
   `35461bbe…` stable across 3 checks/60 s; runner appeared at 160190 B.
5. `node chromium-receipt-r59.mjs --selftest` → exit 0, `90/90` (on `35461bbe…`), then exit 0,
   `91/91` on `b287cfa2…`; `idCoverage 58/58`.
6. `node forge/build-receipt.mjs --out … --forge none` → base receipt GREEN on the canonical
   counter: exit 0, findings `[]`, couldNotEvaluate `[]` (own nonce/pngs/driver/host token).
7. `node probe-receipt.mjs …` per forged shape (f1…f9) → each exit 1 with exactly the named id
   (table above); repeat after the byte drift, same results.
8. `node run-mutant.mjs --id C{1..7} --edits … --out kills/C<k>.json` ×7 on `35461bbe…` and ×7 on
   `b287cfa2…`. Frozen-byte outcomes: C1–C5, C7 KILLED (selftest exit 1 / allPass false, restore
   byte-identical); C6 SURVIVED. Earlier-byte outcomes: identical except C1 used the then-valid
   single `blockIds = []` edit (2 failing cases); all recorded in each receipt’s `history`.
9. `node fixture-probe.mjs --id C<k> --case <fixture>` ×7 → pristine exit 1 with the exact id vs
   mutant exit 0 (C6 author variant: mutant still exit 1 — the disclosed hole).
10. `node probe-receipt.mjs --counter mut/C<k>.mjs --receipt forge/<shape>/receipt.json` → each
    matching mutant greens the forged receipt the canonical counter refuses.
11. `node audit-coverage.mjs coverage.json` → `COVERAGE-OK`: 91 cases, 58/58 ids, 9/9 f-shapes,
    no uncovered id.
12. `diff -u canonical-35461bbe.mjs canonical-b287cfa2.mjs` → the D1 positional strengthening +
    91st fixture only (documented above), no predicate/kill-rule text change.
13. Fixture-manifest recomputation (208 files) → 0 missing, 0 mismatched, 0 extras.
14. `node finalize.mjs` → 46 artifacts written under `.ufo/waves/round-59/mutant-counter/` (a 47th, the drift diff, was appended afterwards — see the discipline note);
    `sha256sum` of the canonical counter afterwards unchanged (`b287cfa2…`, 131074 B, mtime
    18:24:40).
15. Scratch `/fast/scratch/hyaku/tabi-r59/R59MutCounter/` deleted after this report; receipts and
    evidence live only in the wave dir.

No VCS mutation, no commit/add/push/stash, no write outside
`.ufo/waves/round-59/mutant-counter/` and my scratch dir, no pacman/uv/npx install, no browser
launch, no background job left running.

## Report

`.ufo/waves/round-59/w1/R59MutCounter.md`
