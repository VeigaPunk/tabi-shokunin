# R63ExecNeg — independent forgery set for C1 (tabi round 63, wave w1)

Seat: `R63ExecNeg` (leaf executor). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Wave dir: `.ufo/waves/round-63/w1/R63ExecNeg/`. Report: `.ufo/waves/round-63/w1/R63ExecNeg.md`.
Input read first: `.ufo/waves/round-63/claims.json` (C1 coverage, C2 calibration). This seat attacks C1 only.
Nothing under the freeze was written, rebuilt, renamed or edited. No tool was installed
(node v24.21.0 was already present; no pacman transaction, per the host-wide pause).

## 1. Frozen bytes verified before use

Every hash below was produced by `sha256sum` on the on-disk bytes I then fed to the CLI.
`cwd=/home/vgpnk/Projects/shokunin/tabi-shokunin`.

| frozen file | observed sha256 | claim pin |
|---|---|---|
| `scripts/chrome-cdp-loopback-round63.mjs` | `b00efd59ac10fd047014b76b2a5d16cc8b0acaab0730e8c6029a0b53a0d6c040` | `b00efd59…d6c040` (match) |
| `.ufo/waves/round-63/counters/chromium-wheel-r63.mjs` | `084705695a394256198b45c15fb7568b629e3bc750bbd46cfcb81cdb312d7178` | `08470569…d7178` (match) |
| `.ufo/waves/round-63/controls/smoke/receipt-run1.json` (base) | `844f9facd15de4bd6ceb83ef5ae22765486062e66f1ffa241197ab8d2defd48f` | control base |
| `.ufo/waves/round-63/controls/smoke/receipt-run2.json` | `954cee8a2acaf191c328058ccc60674d300b10e217b1e9c149bf8bd7711b6250` | control base |
| `corpus/evidence/round63/chromium-wheel-scroll/receipt.json` (scored data) | `3aa3ce40b49eb2e3516cfb82923eae8761f3a9ba052a3da4cc58764164ad28a1` | scored data |
| `controls/smoke/{a-wheel-down,b-wheel-up,c-swallow}.png` | `c8de49678abad8433a822370a92ab3b2b35ac53603d5122193f21d66fdd95b9a` | — |
| `controls/smoke/d-release.png` | `1bc648c80b682620cf2eef31942be3e90ad1b928a2d09580bcf48ea7b7605ce0` | — |

## 2. What I ran (argv, cwd, exit codes)

Production CLI shape, identical to `controls/no-work/smoke-live-green.command.json`:

```
node .ufo/waves/round-63/counters/chromium-wheel-r63.mjs <receipt.json> \
  --driver scripts/chrome-cdp-loopback-round63.mjs \
  --expect-driver-sha256 b00efd59ac10fd047014b76b2a5d16cc8b0acaab0730e8c6029a0b53a0d6c040 \
  --shot <shot-dir> --json
cwd = /home/vgpnk/Projects/shokunin/tabi-shokunin
```

Literal argv for all 73 invocations: `commands/<id>.command.json`; stdout/stderr: `raw/<id>.stdout|.stderr`.

| run class | count | exits | outcome |
|---|---|---|---|
| counter `--selftest` (`ST-selftest`) | 1 | 0 | `TABI_R63_COUNTER_SELFTEST verdict=clean cases=22 passed=22` |
| positives `P0` smoke-run1, `P1` smoke-run2, `P2` scored data | 3 | 0,0,0 | `predicate=true`, `findings=[]` |
| own negatives (`negatives/*.json`, base = smoke-run1) | 42 | 1 ×42 | 42/42 refused, expected findings only |
| mandated ten re-based on the scored data receipt (`rebased/*.json`) | 10 | 1 ×10 | 10/10 refused |
| invocation-level attacks | 5 | 1,1,1,2,2 | refused (`shot-bytes`; driver pin/file errors) |
| committed negatives re-run (`controls/negatives/*.json`) | 10 | 1 ×10 | 10/10 refused (unchanged files) |
| probes (surfaces no check claims) | 12 | 0 ×12 | green, classified §6 |
| leaf+structural fuzz over the base receipt | 174 | 122 × exit 1, 52 × exit 0 | 122 refused, 52 accepted, 0 crashes |

`results.json` is the machine receipt for the CLI case classes (selftest, positives, negatives, rebased, invocation, probes); `fuzz.json` is the fuzz receipt; `manifest.json` pins each case's
single declared mutation and receipt sha256; `differences.json` proves the mutation is single.

## 3. The ten mandated negatives — each changes exactly one thing

Every receipt differs from `controls/smoke/receipt-run1.json` in exactly one place
(`differences.json` → `mandatoryAllSingleField: true`; array-element cases reported as one
removal/addition). All exit 1 with exactly the predicted finding.

| # | receipt | the one change | check (counter line) | exit | findings | receipt sha256 |
|---|---|---|---|---|---|---|
| i | `n01-producer-true-hypothesis-refuted` | `wheelHypothesis` `CONFIRMED→REFUTED`, predicate stays true | `producer-verdict` (:54) | 1 | `producer-verdict` | `e01dfaf9a7520cf7486258786316d0e8b1c46381fe79e698fd16116ea3c5d970` |
| ii | `n02-producer-false-hypothesis-confirmed` | `predicate` `true→false`, hypothesis stays CONFIRMED | `producer-verdict` (:54) | 1 | `producer-verdict` | `76f9ed2a090523b2882ba54fc0e41a081a1af9d2b9915b2de42627a15feec5fb` |
| iii | `n03-duplicate-seq-contradictory` | `wheellog[4].seq 5→4`: keys 4 and 5 share seq 4, differ in ts/`defaultPrevented` | `wheellog-sequence` (:40) | 1 | `wheellog-sequence` | `fe51fdfe35291a333727621c349f3783c8e96a59fb083ebfaf24357fb8d457bb` |
| iv | `n04-fabricated-step-sha` | `steps[1].sha256` → sha256 of bytes present in no shot file (`db8e35c2…eb56e`) | `shot-bytes` (:48) | 1 | `shot-bytes` | `a046fd6c41012b9e797a8dc3144228c8cc6accd487bef8797a65ccc3d7870bd4` |
| v | `n05-scroll-arithmetic-down2` | `legs[2].scrollY 240→239` | `scroll-arithmetic` (:37) | 1 | `scroll-arithmetic` | `63a331374602d56c6804235a76a8e032ded1e9615dd82462c8dd5b34d0464071` |
| vi | `n06-swallowed-leg-moved` | `legs[4].scrollY 120→240` (swallowed leg moves) | `scroll-arithmetic` (:37) | 1 | `scroll-arithmetic` | `fbad60c9dd46fc034298736f39bf1a5f21cbf1e5ea6dd831204df7bf5a1fbd26` |
| vii | `n07-delta-y-mutated` | `wheellog[0].deltaY 120→121` | `delta-y-passthrough` (:41) | 1 | `delta-y-passthrough` | `27d52f8ea5d6798f2ff61856eb20367830a8f499bd299b430396bf1147d3d377` |
| viii | `n08-teardown-survivor` | `teardown.survivors []→[4242]`, sweep count stays 0 | `survivors` (:50) | 1 | `survivors` | `5ec1b4823082b57a83f89cc85cc47979f0a2b983569aea64c9a1c7f35fee92d2` |
| ix | `n09-nonce-page-mismatch` | `nonceOnPage → tabi-r63-smoke-two` (nonce untouched) | `nonce-binding` (:29) | 1 | `nonce-binding` | `0a9464bcfaa6d9f02c424b6031a85a8bc5f27b846bc417e88741bfa4e8ea1fe6` |
| x | `n10-launch-guard-removed` | `host.argv` element `[13]` `--disable-smooth-scrolling` removed | `launch-guards` (:33) | 1 | `launch-guards` | `116605b359c784751f05b75b5b3ebd23a4a9ade9ebf80568ac7603c88d05fbb9` |

## 4. Full check coverage — 25/25 counter checks exercised

The remaining 32 negatives give every other check its own single-field refusal. All exit 1;
findings are exactly the listed check unless stated.

| id | the one change | check (:line) |
|---|---|---|
| `n11-schema` | `schema → tabi-chrome-cdp-r62` | `schema` (:28) |
| `n12-driver-binding` | `driverSha256 → d×64` | `driver-binding` (:30) |
| `n13-fixture-binding` | `fixture.sha256 → e×64` | `fixture-binding` (:31) |
| `n14-loopback-origin` | origin host `127.0.0.1 → localhost` | `loopback-origin` (:32) |
| `n15-legs-reordered` | `legs[4]`/`legs[5]` swapped | `legs-shape` (:36) |
| `n16-leg-wheellog-count` | `legs[4].wheellogLen 4→3` | `wheellog-count` (:38) |
| `n17-delta-mode` | `wheellog[2].deltaMode 0→1` | `delta-mode-pixels` (:42) |
| `n18-trusted` | `wheellog[0].isTrusted true→false` | `trusted-fields` (:43) |
| `n19-cancelation-released` | `wheellog[3].defaultPrevented true→false` | `cancelation` (:44) |
| `n20-target-binding-dispatch-y` | `wheellog[2].scrollYAtDispatch 240→239` | `target-binding` (:45) |
| `n21-scroll-event-witness` | `pageState.scrollEvents 4→0` | `scroll-event-witness` (:46) |
| `n22-step-label-fabricated` | `steps[1].name → b-fabricated` (png/sha/bytes untouched) | `shot-records` (:47) |
| `n23-server-witness-foreign-path` | `serverLog → [{path:/index.html}]` | `server-witness` (:49) |
| `n24-closed-ports-devtools` | `portProbes.devtools closed→open` | `closed-ports` (:51) |
| `n25-launch-witness-midrun` | `sweeps.midRun 13→0` | `launch-witness` (:52) |
| `n26-failures-recorded` | `failures []→[{id:wheel-dispatch}]` | `failures` (:53) |
| `n27-page-final-state` | `pageState.scrollY 240→239` | `page-final-state` (:55) |
| `n28-shot-length-lie` | `steps[0].bytes 14275→14276` (sha correct) | `shot-bytes` (:48) |
| `n29-step-sha-borrowed-real-file` | `steps[3].sha256` = a-wheel-down's real hash | `shot-bytes` (:48) |
| `n30-launch-guards-all-removed` | `host.argv → [--headless=new]` | `launch-guards` (:33) |
| `n31-sequence-gap` | `wheellog[2].seq 3→4` | `wheellog-sequence` (:40) |
| `n32-sequence-swap` | seq 1 and 2 swapped | `wheellog-sequence` (:40) |
| `n33-nonce-format` | `nonce`+`nonceOnPage → tabi-r63-BAD_NONCE` | `nonce-binding` (:29) + `fixture-binding` (:31) |
| `n34-nonce-page-empty` | `nonceOnPage → ""` | `nonce-binding` (:29) |
| `n35-postkill-sweep-count` | `postKillSweepCount 0→1` | `survivors` (:50) |
| `n36-postkill-curl` | `postKillCurl.fixture 7→0` | `closed-ports` (:51) |
| `n37-delta-x` | `wheellog[1].deltaX 0→1` | `delta-mode-pixels` (:42) |
| `n38-type-scroll` | `wheellog[0].type wheel→scroll` | `trusted-fields` (:43) |
| `n39-ts-negative` | `wheellog[0].ts 15→-1` | `trusted-fields` (:43) |
| `n40-server-witness-empty` | `serverLog → []` | `server-witness` (:49) |
| `n41-duplicate-seq-appended` | append contradictory duplicate of `wheellog[3]` (seq 4, different ts) → length 6 | `wheellog-sequence` + 5 length-guarded checks |
| `n42-extra-wheellog-event` | append sixth event `seq 6` | `wheellog-sequence` + 5 length-guarded checks |

Round-63's three added defences each have their own control in this set:
both producer polarities → `n01`/`n02`; strictly-increasing unique sequence → `n03`/`n31`/`n32`/`n41`/`n42`;
step-label re-hash → `n04`/`n22`/`n28`/`n29` plus invocation cases `i01`–`i03`.

### 4a. The ten mandated attacks re-based on the scored data receipt

Same ten single mutations applied to `corpus/evidence/round63/chromium-wheel-scroll/receipt.json`
(sha `3aa3ce40…`), run against the scored data shot dir. **10/10 exit 1** with the same findings
(`results.json` → `rebased`; e.g. `R-n01` `747af945…`, `R-n04` `21de41c5…`, `R-n10` `a8761a2d…`).
The checks are constant-driven, so the refusals are base-independent.

## 5. Invocation-level attacks

| id | attack | exit | findings |
|---|---|---|---|
| `i01-shot-dir-swapped-bytes` | `--shot` at a copy dir with the four PNGs byte-swapped between steps | 1 | `shot-bytes` |
| `i02-shot-dir-missing-file` | `--shot` at a copy dir without `d-release.png` | 1 | `shot-bytes` |
| `i03-shot-dir-absent` | `--shot` at a nonexistent path | 1 | `shot-bytes` |
| `i04-driver-pin-wrong` | `--expect-driver-sha256 f×64` | 2 | `counter invocation driver pin mismatch` (:116) |
| `i05-driver-file-missing` | `--driver` nonexistent | 2 | ENOENT caught at :133 |

These show the step hash is recomputed from the supplied directory (counter :122–:129), not
read out of the receipt — the 42 negatives' `shot-bytes` findings are not merely echoing the
receipt's own claim.

## 6. Positive controls and committed controls

- `P0` smoke-run1 → exit 0, `findings=[]`; `P1` smoke-run2 → exit 0; `P2` scored data receipt + scored shot dir → exit 0. The untouched receipt is accepted, as required.
- Committed negatives (`controls/negatives/index.json`) re-run through the same CLI: **10/10 exit 1**, findings `producer-verdict`×2, `scroll-arithmetic`, `wheellog-sequence`, `delta-y-passthrough`, `cancelation`, `shot-bytes`, `survivors`, `nonce-binding`, `launch-guards` (`committed-negatives.json`). The committed files were not edited (they are git-tracked and `git status` lists none of them as modified).
- Counter selftest: exit 0, `cases=22`, `verdict=clean` (`raw/ST-selftest.stdout`).

## 7. Probes: surfaces the counter accepts (no check claims them)

Twelve probes and 174 one-leaf/one-array-structural fuzz mutations map the receipt surface that is **not** constrained.
Their green exit is **not** a forgedGreen against a declared check; each is classified.

| id | accepted mutation | counter relation | class |
|---|---|---|---|
| `p01-ts-not-monotonic` | ts series reordered `427, 255.2, 15, …` | `trusted-fields` (:43) reads only finiteness/≥0 | **medium ambiguity** (see F1) |
| `p09-ts-duplicate` | all five ts = 15 | same | **medium ambiguity** (see F1) |
| `p07-ctrl-modified-wheels` | all five `ctrlKey: true` | modifier flags never read (:43) | low (F2) |
| `p08-uniform-step-bytes` | all four steps one hash; shot dir four copies of one PNG | `shot-bytes` (:48) verifies consistency only | low (F3) |
| `p10-nonce-rebound` | fresh nonce + `fixture.sha256` recomputed from driver bytes | `nonce-binding` (:29)/`fixture-binding` (:31) | low (F4) |
| `p11-duplicate-json-key` | raw text has earlier `"predicate": false` before the real `true` | `JSON.parse` last-wins (:114) | low (F5) |
| `p06-origin-port-zero` | `fixture.origin → http://127.0.0.1:0` | regex `[0-9]+` (:32) | low (F6) |
| `p02-declaredStepNames-foreign` | `declaredStepNames` arbitrary | field never read | info (F7) |
| `p03-viewport-lie` | `viewport 1×1` | field never read | info (F7) |
| `p04-host-chromium-lie` | `host.chromium → Firefox 128.0` | field never read | info (F7) |
| `p05-unknown-field` | extra top-level `forged:true` | never read | info (F7) |
| `p12-scroll-events-in-range` | `pageState.scrollEvents 4→3` | band 1..5 (:46) | info (F8) |

Leaf fuzz (`fuzz.json`): 174 mutations over every scalar leaf plus array-empty/dup-first cases —
**122 refused, 0 crashes, 52 accepted**. Every accepted mutation sits on a path no check reads:

| accepted path | count | note |
|---|---|---|
| `wheellog[].ts` | 5 | ordering/uniqueness unchecked |
| `wheellog[].ctrlKey/shiftKey/altKey/metaKey` | 20 | modifier flags unchecked |
| `host.argv[]` non-guard entries + program path | 12 | only the four guard tokens are pinned |
| `host.argv` structural | 1 | guard-token list is a subset test |
| `declaredStepNames[]` + structural | 6 | unread field |
| `fixture.viewport.*` | 2 | unread |
| `host.chromium`, `host.launchToken` | 2 | unread |
| `serverLog[].query`, `serverLog` structural | 3 | only `path` is read |
| `sweeps.midRun` | 1 | bound `> 0` only |

No mutation of `legs`, `wheellog.{seq,deltaX,deltaY,deltaZ,deltaMode,type,isTrusted,cancelable,defaultPrevented,targetId,scrollYAtDispatch}`,
`steps.{name,png,sha256,bytes}`, `pageState.{scrollY,wheellogLen}`, `fixture.{sha256,origin,target}`,
`teardown.*`, `sweeps.{preLaunch,postKill}`, `failures`, `schema`, `driverSha256`, `predicate`,
`wheelHypothesis` was accepted (122/122 refused).

## 8. Findings by severity

**High / blocking: none.** No declared check false-greens: 42/42 independent negatives and
10/10 data-base rebases exit 1 with the expected finding; 0 wrong exits; 0 unexpected findings;
the untouched receipts and the 22-case selftest pass (`chromium-wheel-r63.mjs:105` for the selftest exit).
No forgedGreen to name.

**F1 — medium, ambiguity (not a demonstrated kill).** Timestamp order is unconstrained.
`trusted-fields` (`chromium-wheel-r63.mjs:43`) only requires `Number.isFinite(e.ts) && e.ts >= 0`;
`wheellog-sequence` (`:40`) keys on `seq`, not `ts`. Evidence: `p01` exits 0 with ts
`427, 255.2, 15, 605.4, 755.2`; `p09` exits 0 with all five ts = 15; fuzz accepts 5/5 ts perturbations.
If C1's "strictly increasing unique sequence" is read over the timestamp series, this is a
false-green; the check id plus mandatory (iii)'s explicit "sharing one seq" make the `seq` reading
defensible. Recommend the claim name `seq` explicitly or the next generation add
`ts[i] > ts[i-1]`.

**F2 — low.** Modifier flags are carried but never asserted. `trusted-fields`
(`chromium-wheel-r63.mjs:43`) does not read `ctrlKey/shiftKey/altKey/metaKey`; `p07` (all five
`ctrlKey:true`, the ctrl+wheel zoom shape) exits 0, as do 20/20 fuzz mutations. C1's limits
explicitly exclude "ctrl+wheel zoom", so this is inside the declared boundary — but the fields
exist in the receipt, which invites the reading that they were meant to be pinned.

**F3 — low, disclosed by the limits.** Step bytes are caller-supplied and only internally
consistent. The re-hash at `chromium-wheel-r63.mjs:122–:129` binds `steps[].png/sha256/bytes` to
the `--shot` directory (proved by `i01`–`i03` and `n04`/`n28`/`n29`), but nothing ties those
bytes to the driver's capture: `p08` supplies four copies of one PNG for all four labelled steps
and the counter exits 0. Claim limits ("does not authenticate the receipt") disclose this; the
screenshot axis therefore adds no independent evidence beyond relabel-resistance.

**F4 — low, disclosed by the limits.** The nonce/fixture binding is self-consistent only.
`chromium-wheel-r63.mjs:117–:121` derives the expected fixture hash from the driver template and
`r.nonce`; `p10` mints `tabi-r63-forged-one`, recomputes that hash from the same public driver
bytes, and exits 0. There is no secret, by construction.

**F5 — low, evidence-review risk.** `JSON.parse` at `chromium-wheel-r63.mjs:114` is last-key-wins.
`p11` carries an earlier `"predicate": false` in the raw bytes before the real `"predicate": true`
and exits 0. Machine parsers agree on the last value, but a human or `grep`-based review of the
raw file sees a contradiction; duplicate keys are not refused.

**F6 — low.** `loopback-origin` (`chromium-wheel-r63.mjs:32`) uses `[0-9]+` for the port, so
`http://127.0.0.1:0` is accepted (`p06` exit 0). No claim pins the port range, but a live
loopback origin cannot be port 0.

**F7 — info.** Unread receipt fields: `declaredStepNames`, `fixture.viewport`, `host.chromium`,
`host.launchToken`, `serverLog[].query`, plus arbitrary extra top-level keys. `p02`–`p05` and the
fuzz show them free to forge; none is cited by a check or by C1's statement.

**F8 — info.** Bound-only fields behave as written: `sweeps.midRun > 0` (any positive value) and
`pageState.scrollEvents` in 1..5 (`chromium-wheel-r63.mjs:46`, `:52`; `p12` = 3 accepted).
The witness is a band, not an exact value; C1 does not claim an exact `scrollEvents` count.

## 9. Not run (skipped, not passed)

- No browser was launched and no live driver run was made: cold-run stability, the four PNG
  sha256 comparisons and the scored data receipt's provenance belong to the driver seats.
- The eight exact-line mutants and their matrix were not executed: that is the mutation-testers'
  seat; this seat supplies the negative controls those mutants must false-green.
- C2 (self-assessment gate) was not touched.
- I did not re-derive pins from git; I hashed the bytes on disk and compared to `claims.json`.

Scope hygiene: this seat's writers (`forge-r63.mjs`, `fuzz-leaves.mjs`, `diff-check.mjs`) only
create files under `.ufo/waves/round-63/w1/R63ExecNeg/`; every receipt path passed to the CLI is
inside it or read-only under `controls/`. `git status --porcelain` nevertheless shows tracked
edits to `LOG.md`, `SCORECARD.md`, `SKILL.md`, `corpus/QUALITY.md`, `corpus/README.md` and
`corpus/SOURCES.md` with mtimes 16:04–16:13 during this wave — concurrent sibling seats, not this
one. The frozen counter, driver, control receipt and control PNGs re-hash to their pins after all
runs (§1, re-checked at the end).

## 10. Artifact hashes (this wave dir)

| artifact | sha256 |
|---|---|
| `forge-r63.mjs` (builder+runner, standalone) | `b7aeed31da55354f2195cf770caebd49e94f9f1e2860cdb99b21e88823450af7` |
| `fuzz-leaves.mjs` | `570b68058de6cc4148c4e6641c5f790e2b63dce1cf721fd369cc95b8ce2c80e3` |
| `diff-check.mjs` (single-change audit) | `f03b7db2f3d59bf4272d7d7fcdc193997946a228fd6318ba7adc3d809bdc733e` |
| `results.json` | `3e022eccf1e29405b0846f465f8c6144117e82b992044d83948eca5f71039605` |
| `manifest.json` | `53d8c994970d63860a2322b75aaeb4f624d0094154ba210f5eb80d6b7f406cd5` |
| `fuzz.json` | `ed321330200698ba00297083b8f5f4f7042c3091183e6a37d09d0ea6461fa6ca` |
| `differences.json` | `47bf58ff2a46e67a56a9d7843f70f3f037780f197241104b56732ee34801074d` |
| `committed-negatives.json` | `9b890edaba1056c9ba9dbc60ade5622c5efff79af41019967947d07f1cf0bba7` |

Contents: 42 receipts in `negatives/`, 10 in `rebased/`, 12 in `probes/`, 4 shot fixtures
(`shot-swapped/`, `shot-missing/`, `shot-uniform/` from frozen PNG bytes), 73 `commands/`,
146 `raw/` files, 52 accepted fuzz receipts in `fuzz/`. Scratch
`/fast/scratch/hyaku/tabi-r63/R63ExecNeg/` was deleted before this report; `ls` on it returns
ENOENT. No tree was left on disk.

## 11. Risks

- Negatives are derived from the committed smoke receipt; the ten mandated ones are also re-based
  on the scored data receipt, but the other 32 are not (same constant-driven checks, so the risk
  is bookkeeping, not behaviour).
- Probes are advisory: they name surfaces, and F1 is the only one whose reading could change a
  kill decision.
- Fuzz perturbs one leaf at a time; multi-field forgeries that satisfy every check simultaneously
  are covered only where the check constants make them impossible, not by fuzz.

VERDICT: C1's frozen r63 counter refuses all 42 independently built single-change negatives (0 forgedGreen, 0 wrong exit, 0 wrong finding), accepts all three untouched positive receipts and its 22-case selftest, and re-refuses the ten mandated attacks re-based on the scored data — the only unconstrained surfaces are fields no check claims (timestamp order, modifier flags, caller-supplied PNG bytes, forgeable nonce, duplicate JSON keys, port range).
