# CritCalibrationClaims — Calibration attack, round 35 wave w2 (Tabi)

**Attacked:** every count/state the round-35 new text asserts about the lane — README round-35 rows, SKILL.md §Round 35, lesson round-35 (§C1/§C2 decisions), LOG entries, SOURCES S134–S141, QUALITY 98–100 red states, the knowledge entry's verified-at/digests, the census correction, and the round-34 corrections appended this round. All re-derivations run at the wave-1 integration rev **083c5c643be7aa5965a5de3458a32ed0d289ead3** (clone `/fast/scratch/hyaku/tabi-r35/CritCalibrationClaims/clone`, detached, `git rev-parse HEAD` = 083c5c…). Host facts were re-read from the live machine; immutable source bytes were re-fetched from the official hosts.

## Verdict: **HOLDS — no calibration harm found.**

Every re-derivable number, digest, line number and state asserted by the round's new text reproduced exactly. No mismatch (calibration harm) found in: screen counts per reason (225/119/30/8), ledger rows (382), candidate set (383, per-lane 137/66/56/51/20/20/20/9/2/1/1), map row 18 + tabi declaration at SKILL.md:2970, frozen counter/measure bytes (all 6 digests), C1 counter reading at the rev (unaccounted 0, newMapped 1, predicate false, exit 1), receipt/transcript/entry digests (incl. first-screenshot 7a3ae6a9…, 9451 B, 640×480), gate fixture hash, ROWS=17 / 16 BiDi rows, w1 seat counts (51/51/0), S134–S141 rows and their immutable fetch receipts (capabilities.rs, marionette.rs, SHA256SUMS line 235 of 4921), host binary pins (geckodriver f831b7e6…, firefox a19472941a…, firefox-bin 46e2c204…, 340,636,387 B / 51 files), census pre-append hash a33c2264…, QUALITY 98–100 cited counter lines (:54, :77, :57-58), the c2-M1 boundary reading (admitted 15, unmeasured 2, exit 0), and the round-34 corrections (S131 span 244–248; kake :411 row = screened row 35; adjacency.tsv 15–17).

## Evidence (commands, output, exit codes)

All paths relative to the clone root unless noted. X = exit code.

### 1. Candidate set (claims.json / LOG / SKILL.md: "383", per-lane counts)
```
$ cut -f1 .ufo/waves/round-35/baseline/c1-candidates.tsv | sed 's/:.*//' | sort | uniq -c
1 chousa-shokunin@00f8c7f5…  56 kagi…  137 kaidoku…  51 kake…  9 kama…
20 kotoba…  66 kumitate…  20 mado…  2 mori…  1 tameshi…  20 tsukuroi…
# total 383; matches claims.json surface and LOG per-lane numbers exactly.
```
### 2. C1 frozen counter at the measured rev
```
$ node .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --rev 083c5c643be7aa5965a5de3458a32ed0d289ead3 --repo "$C" --fleet /home/vgpnk/Projects/shokunin --json   [X=1]
{"adjGateSha256":"4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac",  # = frozen pin
 "adjacency":{"verdict":"clean","rows":17,"verified":17,"findings":0},
 "candidates":383,"priorCandidatesSkipped":22,"mapped":1,"screened":382,"unaccounted":0,
 "newMapped":1,"newMappedRows":[{"row":18,"surface":"cdp-bridge-vault-dom-refusal","sibling":"kagi","disposition":"split-declared"}],
 "newRowRefusals":[],"screenFindings":[],"unaccountedKeys":[]}
```
Matches README/lesson/LOG/assignment: unaccounted 0, newMapped 1, predicate false (exit 1).

### 3. Screen ledger
```
$ wc -l corpus/adjacency-screen-browser.tsv          → 383 (1 header + 382 data rows)
$ cut -f2 corpus/adjacency-screen-browser.tsv | sort | uniq -c
8 no-claim-declared  119 not-browser-sense  225 same-surface  30 third-lane-report  1 reason(header)
$ tail -n +2 corpus/adjacency-screen-browser.tsv | wc -l   → 382
```
Header `sibling_ref<TAB>reason<TAB>surface<TAB>quote<TAB>note`; only the four allowed reasons used. Matches README/lesson/LOG (225/119/30/8; rows 382) exactly.

### 4. New map row + tabi declaration
```
$ sed -n '18p' corpus/adjacency.tsv        # cdp-bridge-vault-dom-refusal | kagi | kagi-shokunin@69b61db4…:SKILL.md:40 | …
$ git show 083c5c…:SKILL.md | sed -n '2970p'
# "The 1Password native-messaging bridge is kagi's custody surface: the `open-popup` refusal kagi states at
#  `kagi-shokunin/SKILL.md:40`, …" — names sibling + path (n1 form)
$ git show 2d2c8a…:corpus/adjacency.tsv | wc -l      → 17 (16 rows + header)
$ wc -l corpus/adjacency.tsv                          → 18 (17 rows + header)
```
Candidate line `kagi-shokunin@69b61db4…:SKILL.md:40` exists in c1-candidates.tsv with text byte-equal to the row's `sibling_quote`.

### 5. Frozen bytes (claims.json `frozenDigests` vs committed bytes)
```
$ sha256sum .ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs          → 5707a93742565c17d24dd4df37d2289e1a9dfe4646e313108357770909b436b9 ✓
$ sha256sum .ufo/waves/round-35/counters/c2-firefox-bidi.mjs                → 7cc7f17fa0a86355b582f506af619dd2807e925fe836fe39e95a436d59cd954e ✓
$ sha256sum .ufo/waves/round-35/baseline/controls.mjs                       → 32c0f6bc17060d9d71550961c5783b5293a08610760355fc81db22da7533d8b1 ✓
$ sha256sum .ufo/waves/round-35/measure.sh                                  → 1fdbe8c4125e737cbcaddea1fd428489254fc015a7a35e28db0cc57d15033188 ✓
$ sha256sum scripts/check-adjacency.mjs                                     → 4e2c2a64b9eae9c10b9e92022e9b33661bba8e3b45b149e6354ecc9592324aac ✓
$ sha256sum scripts/check-bidi-runtime.mjs                                  → 370e8e95417e16dd3535f2dd5015a0b820655934200d489434fb642db7d86c87 ✓
```

### 6. Receipt / entry digests (entry `verified-at` fields)
```
$ sha256sum corpus/evidence/round-35/bidi-firefox/receipt.json   → 58d5142c0d5e82e189aedfe8eceb1ba70779404d26c0bdcd2ad7b16d5821f881
$ sha256sum corpus/evidence/round-35/bidi-firefox/run1.jsonl     → 0ef2e7e5c20241565aa4b307bddbac9886c8099cca80360660bbbbcb16a2f62a  (= receipt/entry)
$ sha256sum corpus/evidence/round-35/bidi-firefox/run2.jsonl     → 6754ec2dca56c417341431f00cf773964bec68ad10b35e2e6aeb32f92a06f687  (= receipt/entry)
$ sha256sum scripts/bidi-firefox-loopback-round35.mjs            → fb8c5fdfeb4350948dc7b62c26883b657efe5d0190274dbd8c0ea8716320ba9b  (= receipt driverSha256)
$ node --input-type=module -e "import('./scripts/check-bidi-runtime.mjs').then(m=>console.log(m.FIXTURE_SHA256))"
  → 343cbcedd56f6fb1914d529119fadfd69cd7901ed919c6e1ae84d213bc112843 (= receipt fixtureSha256)
```
Transcript facts (parsed, both runs): 28 commands / 20 events / 28 success responses, ids 1–28; session ids distinct UUIDs (0bbeca6a-… / 8efe5e35-…); `browserVersion` 158.0.1 both; `moz:geckodriverVersion` 0.37.1 both; `webSocketUrl` `ws://127.0.0.1:<port>/session/<uuid>`; first screenshot base64 decodes to sha256 `7a3ae6a9b0d65497f52ec1ed6ddea1970e32025e0fb8a36d2debdfc201cbfd02`, 9451 B, IHDR 640×480 (matched on both runs — entry's "both first screenshots 7a3ae6a9b0d65497…", "9,451 bytes, 640×480"); `network.responseCompleted` for `/a.html` has status 200 and header `x-tabi-fixture: r32`; locateNodes returns one `h1`.

### 7. Gate rows (16 BiDi rows, R16 none)
```
$ node --input-type=module -e "import('./scripts/check-bidi-runtime.mjs').then(m=>console.log(Object.keys(m.ROWS).length, JSON.stringify(m.ROWS.R16)))"
  → 17 R1,…,R17 ; R16 "Stop loading / nav-cancel"
$ grep -n 'R16: ()' scripts/check-bidi-runtime.mjs → 357: R16: () => "no-bidi-counterpart"
```

### 8. Wave-1 integration state (LOG: "w1 51 seats, 51 non-empty results, 0 dead"; lesson: 27 chunk scribes; ConnBoundaries counts)
```
$ python3: w1-results.json → lanes 4, round 35, wave 2, seats 51, results list len 51; 0 dead; 0 results lacking output.
$ ls .ufo/waves/round-35/w1/Adj* | count → 27 chunk-scribe seats (AdjKagi1-4, AdjKaidoku1-9, AdjKake1-3, AdjKotoba1-2, AdjKumitate1-4, AdjMado1-2, AdjMixed, AdjTsukuroi1-2).
$ w1/ConnBoundaries/boundaries.md → "238 candidates are same-surface, 66 … not-browser-sense, 51 declare no claim, 28 … third-lane records", total 383 (matches lesson quote).
$ w1/ExecFirefoxDeterminism/summary.txt → sessions=28 ok=27 errors=1; distinct firstShotSha256=1 [7a3ae6a9…]; error session tag=pathlong, "Error: websocket open failed" (matches lesson M-claim).
```

### 9. SOURCES S134–S141 + lesson Gate
```
$ grep -cE '^\| S13[4-9] \|' corpus/SOURCES.md → 6 ; '^\| S14[01] \|' → 2  (8 rows total, lines 148–155)
$ lesson round-35 ##Gate table lists exactly S134–S141 with matching URLs/bytes/sha256.
```
Immutable re-fetches (this seat) — all byte-identical to the rows:
| URL | UTC | status | bytes | sha256 | row |
|---|---|---|---|---|---|
| raw.githubusercontent.com/mozilla/geckodriver/v0.37.1/src/capabilities.rs | 2026-10-26T21:41Z | 200 | 54316 | d3e65953dca6b6e1653326fbeae49d4c6cd1abfba8df47de9f9d9ca2ac870359 | S136 (lesson) |
| raw.githubusercontent.com/mozilla/geckodriver/v0.37.1/src/marionette.rs | 2026-10-26T21:41Z | 200 | 66012 | 757e395547ed775b4a34b67deee472c78030ab977fdb7b5284140996019997a3 | S137 (lesson) |
| ftp.mozilla.org/pub/firefox/releases/158.0.1/SHA256SUMS | 2026-10-26T21:41Z | 200 | 551210 | 6e1f529f499ece5fb4c0762a3b7e3cf146f977aa83a23586e482c8a3d8a94b38 | S140 (sibling fetch) |
`grep -n 'firefox-158.0.1.tar.xz' SHA256SUMS` → line **235** `dce45470139242cf294eb6ada3d192a9bb334696842b02b71ade448a139eb41a linux-x86_64/en-US/firefox-158.0.1.tar.xz`; `wc -l` → 4921 — matches lesson S140 quote "SHA256SUMS:235 of 4,921 lines" and SCORECARD `dce45470…eb41a`.

### 10. Host binary pins (census corrections; SCORECARD install paragraph)
```
$ sha256sum /home/vgpnk/.local/bin/geckodriver                      → f831b7e61454804e8a307edd951bf8a5f373efe3f718e75454a6485a51f6e39f ✓
$ sha256sum /home/vgpnk/.local/opt/firefox-158.0.1/firefox         → a19472941a7cd7252ab5e61b02eb616a50389a784323c21dc6873a23fd700789 ✓
$ sha256sum /home/vgpnk/.local/opt/firefox-158.0.1/firefox-bin     → 46e2c204ab769f1cb49fea4918e134c84829d2ab38278fb087a072f77b6e7294 ✓
$ geckodriver --version → geckodriver 0.37.1 (300705c65d1b 2026-07-17 09:25 +0000) ✓
$ firefox --version → Mozilla Firefox 158.0.1 ✓
$ application.ini → Version=158.0.1 BuildID=20261019185856 SourceStamp=48a735cc74a7e6d730f9bf59c3de58f750287a23 ✓
$ du -sb ~/.local/opt/firefox-158.0.1 → 340636387 ; find -type f | wc -l → 51 ✓
$ git show 2d2c8a…:corpus/knowledge/browser-surface-census.md | sha256sum → a33c22644d646a3c08c25d7e65d324f4db2c65d5da6e1ed45740150d0e25d75b ✓ (pre-append hash)
```

### 11. QUALITY 98–100 red states and lesson M1/M3/M4 (verified as recorded; not re-reported as new)
```
$ sed -n '54p;77p;57,58p' .ufo/waves/round-35/counters/c2-firefox-bidi.mjs
54: //   admitted >= 14.
77: const TARGET = 14;
57: // live leg runs geckodriver with --profile-root, HOME, TMPDIR and XDG_* inside that scratch,
58: // a free --websocket-port (never the 9222 default), headless, loopback FIXTURE only.
```
`measure.sh` invokes both counters with neither `--firefox` nor `--geckodriver`, records both binaries' `--version` and sha256 in provenance, and takes counters from the FREEZE commit (`git show $FREEZE:$f`) — M4 fix verified. Boundary `measure/c2-M1-boundary-15.json`: rev 86d6df42cb743691cff0e13f2503dcaf2ed70651, `population 17, admitted 15, failing 0, unmeasured 2, binding null, exit 0` — matches lesson M1's statement.

### 12. Instrument check and control receipts
```
$ baseline/c2-instrument-check.json → two sessions (59aa1fd4-…/df776540-…), distinct ws ports 41155/37361,
  bv 158.0.1, gdv 0.37.1, shot both 7a3ae6a9…, R1–R15/R17 null, R16 no-bidi-counterpart, errs [] — matches feasibility disclosure.
$ baseline/controls-summary.json → 13 controls (8 C1 + 5 C2); spot-checked files match claims.json blocks:
  c1-J1 (candidates 383, unaccounted 383, predicate false), c1-J2 (screened 383, unaccounted 0, newMapped 0),
  c1-J8 (mapped 2, newMapped 2, predicate true), c2-J5 (population 17, failing 16, binding null).
```

### 13. Round-34 corrections appended this round (errata intake 6)
- S131 span: fresh Gitiles fetch of `CdpTargetManager.ts` at tag 154.0.8037.97 (`?format=TEXT`, decoded 15104 B): lines 244–248 = `// New context.` / `BrowsingContextImpl.create(` / `targetInfo.targetId,` / `parentId,` / `userContext,` — matches the correction (244–248) exactly.
- kake `PROVINCE.md:411`: `grep -n 'PROVINCE.md:411' corpus/adjacency-screen.tsv` → row **35**, reason same-surface `crawler-discipline-vs-publishing`, note cell carries the corrected fifth column — matches `corpus/lessons/round-34.md` correction.
- `sed -n '15,17p' corpus/adjacency.tsv` → `lab-performance-tool-runs`, `recorded-har-producer-channel`, `screenshot-pair-compare-semantics` — matches the README correction (three new rows, 15–17).

## Note (limits)
- Leaf seat: no browser launched (only C2 rerun/egress/receipt seats launch Firefox). The C2 live-leg binding (admitted 16 / failing 0 / binding null) was not freshly re-derived by a live session; it is corroborated by the committed transcripts' facts above, the frozen counter mechanics, and the w1 record `w1/ExecFirefoxDriver/counter-check.json` (rev 245c4c61…, admitted 16, failing 0, binding null, predicate true — matches the entry's claim).
- Living Sphinx/MDN pages (S134/S135/S138/S139) are not byte-stable post hoc; only the immutable tag/release bytes were re-fetched and matched (above).
- Entry §1 prose "three seats' recorders" for five sessions includes the baseline instrument check (not a seat) — phrasing observation, not a numeric mismatch.

## Deliverables
- Report: `.ufo/waves/round-35/w2/CritCalibrationClaims.md`
- Output dir: `.ufo/waves/round-35/w2/CritCalibrationClaims/CritCalibrationClaims.md` (copy)
- Scratch cleared; no processes left running; no lane/fleet files edited.
