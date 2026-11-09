# R98Mut — Counter mutation sweep (round 98, C1)

Scratch mirror `S=/fast/scratch/hyaku/tabi-r98/R98Mut` (removed after run), counter sha256 `e55581ea…c75b3d3c5a`, driver pin `f8e95a98…092aa2`, positive receipt nonce `tabi-r98-ctl-positive`. Runner: `R98Mut-run_mutants.py`; raw results: `R98Mut-results.json`.
Commands (in scratch): `python3 R98Mut-run_mutants.py` (86 single-point mutants; per mutant, battery `--receipt` on the positive receipt in a per-mutant lane mirror; first run mis-wired mlane missing the driver file → all battery `setup`/false-killed, discarded and rerun after fix).

## Results: 86 mutants — 76 killed, 10 survived, 0 setup

Killed by the frozen battery (representative; full list in `R98Mut-results.json`): T/U swap (3), every ARM event-table flip/input-only/empty (10), ANSWER/PAYLOAD size/type/text/name (9), PUR size/name, PLLM files/read (2), NOT_FOUND message/name + ENOENT prefix/errname/message (5), every dropped/ignored leg check incl. `leg-arm` fields (mode/isLocal/input/childUrl), every dropped top-level check (schema/nonce/driver-pin/chromium/reps/libs/answer/payload/missing/ports/leg-set/failures/fresh-browser), libs version/treeFiles bumps + sizes, outcome polarity, iframe targets, browser swap, fresh-browser distinct/uuid, `exit-invert`.

## Survivors (10)

### Battery gaps — killed by verified receipt mutations (frozen rc 1 with the stated id; mutant rc 0 or missing that id)

1. **`ignore-parentUrl`** — edit: `- l.parentUrl === parentUrl` → `+ true`. Frozen battery has `pua-child-same-site` (childUrl only), no wrong-parentUrl case. Killer (`R98Mut-killer-parenturl.json`): PUA-1 parentUrl `…/parentX.html?leg=PUA-1`. Verified: frozen rc 1 `leg-arm`, mutant rc 0 clean.
2. **`ports-lb-1023`** — edit: `- p >= 1024` → `+ p >= 1023`. Battery only tests port 80. Killer (`R98Mut-killer-port-lo.json`): ports.http 1023. Verified: frozen rc 1 `ports` (+ leg-arm/frames noise from port change), mutant lacks `ports`.
3. **`ports-ub-65536`** — same bound edit at the top. Killer (`R98Mut-killer-port-hi.json`): ports.http 65536. Verified as above (frozen `ports`, mutant lacks it).
4. **`ports-int-drop`** — edit: `- Number.isInteger(p) &&` → `+ true &&`. No fractional-port battery case. Killer (`R98Mut-killer-port-fraction.json`): ports.http 31861.5. Verified: frozen `ports`, mutant lacks it.
5. **`fresh-browser-length-drop`** — edit: `- ids.length > 0` → `+ true`. Empty-legs receipt still fires `leg-set`, so battery (which only checks presence of its expected id) can't isolate this conjunct. Killer (`R98Mut-killer-empty-legs.json`): empty legs. Verified: frozen rc 1 `fresh-browser`+`leg-set`, mutant only `leg-set`. Adding an exact-ids case would kill it.

### Live-only (all 3 covered by `livekillers-…-round98.mjs`; harness read, not run — ports reserved, battery mode cannot reach them)

6. **`live-driver-exit-drop`** — `- check('driver-exit', driverRun.status === 0` → `+ check('driver-exit', true`. Live-killer K-exit (driver exit 4) expects exactly `driver-exit`.
7. **`live-ports-bound-drop`** — `- check('ports-bound', isObj(…` → `+ check('ports-bound', true`. Covered by K-ports.
8. **`live-missing-bound-drop`** — `- check('missing-bound', receipt.missingPath === liveMissing` → `+ check('missing-bound', true`. Covered by K-missing.

### Equivalent / vacuous-strength on `--receipt` mode

9. **`ENOENT-no-missingpath-guard`** — edit: `- !!missingPath && l.errMessage ===` → `+ l.errMessage ===`. Killer attempt (`R98Mut-killer-enoent-path.json`, missingPath `/somewhere/other.txt`, PLLM errMessage updated to match): frozen and mutant both rc 1 `missing`+`outcome` — when `missingPath` is null the mutant stringifies `"null"` and still fails, so the conjunct is redundant in receipt mode. Classify: equivalent (defense-in-depth only).
10. **`verdict-invert`** — edit: `- verdict: findings.length ? 'findings' : 'clean'` → swapped. Battery checks exit code + finding ids only, never the `verdict` string, so it survives. Killer (`R98Mut-killer-verdict.json`): PUA-1 childEvents untrusted. Verified: frozen rc 1 `verdict=findings`, mutant rc 1 `verdict=clean` with same ids. Battery gap on the verdict-string axis (harmless to exit-code consumers; a checker that parses `verdict` would be misled).

## Restoration / cleanliness
No lane files touched (mirror only). Scratch `/fast/scratch/hyaku/tabi-r98/R98Mut` removed. No chromium left: `pgrep -f remote-debugging-port=` empty. No tools installed (stdlib python3 + node only).

VERDICT C1: neutral
