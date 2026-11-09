# R99Mut — counter mutation sweep (round 99, C1)

Seat R99Mut (Godspeed). Target: `scripts/check-client-oopif-uploadsets-round99.mjs`
(sha256 `1a0f2529…a720`), detector: frozen battery
`scripts/negatives-client-oopif-uploadsets-round99.mjs` on the committed positive receipt
(nonce `tabi-r99-ctl-positive`), scratch mirror under `/fast/scratch/hyaku/tabi-r99/R99Mut` (removed before yield).
Driver pin (unchanged): `98efdc12…b89f8`. No live run, no chromium. Baseline battery on the mirror:
109/109 killed-or-clean, rc 0.

## Method

98 single-point mutants (string replacement of one expression in the frozen counter). Each mutant was
installed as the counter inside a scratch lane copy and the full battery re-run
(`--lane <mutant lane> --receipt …/receipt-positive.json --expect-nonce tabi-r99-ctl-positive
--expect-driver-sha256 98efdc12…b89f8`). Killed = battery rc 1 with ≥1 failed case (a weakened counter
wrongly passes a forged receipt); SURVIVED = battery rc 1 with zero failed cases (all 109 negatives still
caught, positive still clean). Three mutants initially had non-unique anchors (`eq(l.files, a.files)` etc.
appear twice: the `check` call and the `outcomes` condition); they were re-run with the anchor extended to
the `check(…)` call and all three were **killed** (recorded in the table as `child-files-s-only*` etc.).
Restoration: `sha256sum` of the mirror counter before/after matches the frozen value `1a0f2529…a720`;
results + mutant list in `R99Mut-results.json`.

## Result

**98 mutants: 68 killed, 30 survived (19 battery-survivors are unreachable without `--live`; 15 of those are
covered by the live-killer harness, 4 are partially covered; see §3).**

## 1. Killed mutants (68) — battery is adequate for receipt-mode law

Each row: the mutation let the battery's forged receipt through with the expected finding id. The battery
covers every receipt-mode check id: schema, nonce, driver-pin, chromium, reps, libs (5 field mutations),
files, payloads (3), missing, tmpdir, ports (4), leg-set, leg-label, leg-arm (11), leg-urls (2), browser (2),
frames, iframe-targets (3), parent-files, outcome (6 incl. ENOENT exact-message), child-files (incl.
plbm-p2-type order, plbx-type-octet/empty, puam-phantom-*, plam-phantom-filled, files-m-key-dropped),
child-events (13 trust/fill variants), child-reads (8 incl. plbx-fr-diverges, plbm-reads-swapped,
pllp-read-dropped, puam-fr-readable, puam-ab-other-error, puam-other-message, plbn-read-present,
plam-reads-null), failures (2), fresh-browser (distinctness/UUID), verdict/exit polarity, plus all
descriptor constants (FILE_A/B size/sha, P1/P2/BIN mime/size, NF name+message, ARM event tables,
legal arm field swaps, AB order, lib pins, SCHEMA/CHROMIUM_TAG/BROWSER constants, browser-version
ternary). Examples (mutant, line, change, killed-by):

| mutant | line | change | killed-by (battery case) |
|---|---|---|---|
| `schema-invert` | 216 | `=== SCHEMA` → `!== SCHEMA` | positive (clean receipt now fails) |
| `chromium-loosen` | 219 | `.includes(CHROMIUM_TAG)` → any string | `chromium-string` |
| `arm-plbx-trust` | 85 | `EV('s', false)` → `EV('s', true)` | `plbx-trusted-claimed` |
| `arm-plbm-p2type` | 86 | `'application/octet-stream'` → `'text/plain'` | `plbm-p2-typed-text` |
| `ab-order-swap` | 81 | `[A,B]` → `[B,A]` | `pllp-order-swapped` |
| `nf-msg` | 72 | Blink message truncated | `puam-other-message` |
| `arm-plbn-msg` | 87 | "single file" → "one file" | `plbn-other-message` |
| `arm-pucn-msg` | 90 | trailing `>` → `>!` | `pucn-other-message` |
| `enoent-startswith` | 261 | exact ENOENT → `startsWith('ENOENT')` | `plam-other-path` |
| `child-files-s-only*` | 265 | `eq(l.files, a.files)` → `eq(l.files?.s, …)` | `pucm-one-file`, `pllp-order-swapped`, `plbm-p2-typed-text`, `files-m-key-dropped` |
| `child-events-len-only*` | 266 | full events → length only | `plbx-trusted-claimed`, `pucm-events-on-s`, `pllp-events-reordered` |
| `child-reads-first-only*` | 267 | full reads → first read only | `pllp-read-dropped`, `pucm-read-error`, `plam-reads-null` |
| `iframe-targetid-drop` | 256 | targetId check removed | **SURVIVED** (see §2) |
| `outcome-drop-errmessage` | 259 | errMessage check on resolved legs removed | **SURVIVED** (see §2) |

`verdict-polarity`/`exit-polarity` / `legset-order-swap` / `fresh-distinct-drop` / `ports-*` / `libs-*` /
`payloads-*` / `browser-ternary-swap` / `legurls-parent-drop` / `leglabels` etc.: all killed (case names in
`R99Mut-results.json`, `survivors` empty for them).

## 2. Battery survivors (11, receipt-mode) — battery gaps

| mutant | line | change | battery reach | exhibited by scored receipt? |
|---|---|---|---|---|
| `pin-drop-file` | 218 | `receipt.driverSha256 === pin && driverSha === pin` → receipt only | pin pre-check in live mode + driver-pin control | No (scored driver = pin) |
| `missing-loose-eq` | 225 | `missingExists === false` → `== false` | battery `missing-exists`/`missing-exists-null` set `true`/`null` (neither `== false`) | No |
| `fresh-no-nonempty` | 239 | `ids.length > 0 &&` removed | `legs-empty` killed by `leg-set` first | No |
| `receipt-file-check-drop` | 194 | `st.isFile()` refusal removed | setup control (receipt-dir) is not in the battery | No |
| `receipt-unreadable-drop` | 198 | exit-3 unreadable-receipt refusal removed | live-only path (`partialLaunch`) | No (receipt readable) |
| `outcomes-drop` | 268 | `outcomes[a.cls].push(id)` → noop | outcomes are report-only; no battery case reads them | No |
| `arm-plam-cls` | 84 | PLAM `cls` renamed | same as outcomes | No |
| `iframe-targetid-drop` | 256 | targetId non-empty-string check removed | no battery case empties targetId (`plam-two-iframe-targets` pushes a second target) | No (real ids 32-hex) |
| `outcome-drop-errmessage` | 259 | errMessage-null check on resolved legs removed | `resolved-with-stale-error` sets both errName+errMessage; errName check still fires | No (null/null) |
| `outcome-drop-errname` | 259 | errName-null check removed | same case, symmetric | No (null/null) |
| `isobj-array` | 208 | `!Array.isArray(o)` removed | covered by `pllam-existing-array`? Not present; no battery case passes an array where an object is required | No |
| `eq-loose` | 207 | `===` → `==` in `eq()` | JSON strings never loosely equal when strictly unequal | No |

None of these 11 survivors is exhibited by the scored receipt, which has the pinned driver, `missingExists:
false`, 24 non-empty legs, a readable regular receipt, real targetIds, null/null err-fields on resolved
legs, and no array-for-object fields. So none corresponds to a falsified leg-level statement; they are
battery gaps, recorded for `TabiR99` to close in a future battery (one new case per line: e.g. a receipt
with `iframeTargets[0].targetId=""`; a resolved leg with only `errMessage` stale; a receipt whose
`legs` field is an array-carrying object). Classification: **battery gap, not a claim breach**.

## 3. `--live`-only survivors (19)

Battery cannot reach them because it runs `--receipt` mode only. Live-killer harness
(`scripts/livekillers-client-oopif-uploadsets-round99.mjs`, read but not executed — no live seats here;
6 killers, committed `livekillers.json` rc 0) coverage, by reading its killer definitions:

| mutant | line | change | live-killer coverage |
|---|---|---|---|
| `live-driver-exit-drop` | 211 | driver-exit → `true` | **K-exit kills it** (frozen rc 1 `driver-exit`, neutral rc 0) |
| `live-ports-bound-drop` | 212 | ports-bound → `true` | **K-ports kills it** (rc 1 `ports-bound`) |
| `live-missing-bound-endswith` | 213 | `=== liveMissing` → endsWith | **K-missing kills it** (missing path `<scratch>/k/…` fails any bound) |
| `live-tmpdir-bound-drop` | 214 | tmpdir-bound → `true` | **K-tmpdir kills it** (rc 1 `tmpdir-bound`) |
| `live-exit3-flag` | 187 | exit-3 flag → exit-4 | **K-partial / K-launchonly kill it** (partial mapping rc 1 `child-files` vs setup; launch-only rc 2 `setup`) |
| `live-status130` | 184 | exit-130 refusal → 131 | partially: K-launchonly rc 2 `setup` is the same refusal family (enumerated, not exact message) |
| `live-status2` | 185 | exit-2 refusal → 22 | driver-usage control is committed (`setup-no-deps` etc.); not a live-killer row |
| `live-signal-and` | 186 | `‖` → `&&` (signal/timedOut) | setup SIGTERM control (`setup-counter-sigterm` rc 2) exercises signal branch; timeout branch unmeasured |
| `live-pin-precheck-invert` | 132 | `!== pin` → `=== pin` | driver-pin control committed (rc 1 `driver-pin`, driver not run); would also break every live run (positive control) |
| `live-missing-wrong` | 151 | liveMissing path wrong | **K-missing kills it** (frozen `missing-bound`, neutral recovers) |
| `lawlegs-is-legs` | 236 | launch-failed legs unskipped | **K-partial kills it** (stale-law legs flagged, `child-files` still fires wrongly/noisily) |
| `law-exempt-child-files` | 92 | `child-files` added to LAW_EXEMPT | **K-partial kills it** (partial launch + law change must give rc 1 `child-files`, not `setup`) |
| `launchfail-includes` | 235 | `startsWith` → `includes` | partially: K-partial's error label is `'k-launch'`-prefixed, not containing LAUNCH_FAIL; `leg-error-failures-empty` (battery, benign) shows sensitivity |
| `launchfail-none-guard` | 237 | all-launch-failed→setup guard removed | K-launchonly kills it in spirit (expects rc 2 `setup`) |
| `partial-law-clear` | 272 | law list → `[]` (always setup) | **K-partial kills it** (expects rc 1 `child-files`, not `setup`) |
| `launchfail-const` | 64 | "came up" → "came never" | K-partial/K-launchonly kill it (launch-failed legs no longer skipped → `child-files` wrongly) |
| `driver-timeout` | 93 | 15 min → 1 ms | not covered by any killer (would make every live run `setup`); a catastrophic constant, visible on first live run |
| `mode-xor-drop` | 109 | live/receipt exclusivity removed | not covered by a killer; receipt-mode battery also passes (both flags false path) |

None of the 19 is exhibited by the scored receipt (driver exit 0, ports = `--ports`, `missingPath`/`tmpdirAtLoad`
bound, no exit-3 branch). The four `K-*` live-only checks plus the r98-D3 exit-3 branch are therefore
behaviorally verified by the committed live-killer suite; the remainder are either setup controls or
start-up-visible constants.

## 4. Falsifies-wording analysis

A survivor counts against the frozen claim only if the scored receipt exhibits it. The scored receipt
(`.ufo/waves/round-99/scored/live-receipt.json`, 24 legs) has: driver == pin, exit 0, ports matching,
`missingPath`/tmpdir bound, all `error`/err-fields consistent with the predicate, real UUID browser ids,
real targetIds, null/null on resolved legs. Only `arm-plam-cls`/`outcomes-drop` touch report fields
(`outcomes` object), which the claim sentence ("every events list is compared exactly" etc.) never asserts
values for; the counter output's `outcomes` lists are informational. No surviving mutant corresponds to a
leg-level sentence of the predicate being false in the scored data, and no receipt-mode survivor is
exhibited. Hence: **neutral**, with the §2/§3 gaps recorded as battery/live-harness strengthening
candidates for `TabiR99`.

## 5. Restoration evidence

- Mirror counter before: `sha256 1a0f25293771f1c4d9307b5ccd65cdf4c80696bd2e5756447ca2ea1a0689a720`
  (matches frozen `instrument-sha256.txt`).
- Mirror counter after (re-copied from lane): identical `1a0f2529…a720`. No lane file, jj/Git state, or
  `corpus/` file modified; chromium never started.
- Scratch removed with `rm -rf /fast/scratch/hyaku/tabi-r99/R99Mut` before yield; only this report and
  `R99Mut-results.json` persist under `.ufo/waves/round-99/w1/`.

## 6. Commands run (exit codes)

```
cp 4 scripts + r98 receipt + receipt-positive.json into scratch mirror   rc 0
node negatives-…-round99.mjs --lane mirror --receipt receipt-positive.json …   (baseline)   rc 0 (109/109)
python3 mk.py            (98 mutants, parallel)   rc 0 (script's own output; battery rc per mutant in json)
python3 mk.py child-files-s-only … (3 re-run)   rc 0, all killed
```

Tooling: `python3`, `node`, `sha256sum` already present; nothing installed, nothing upgraded
(RULES read; pacman paused — no installs needed).

VERDICT C1: neutral
