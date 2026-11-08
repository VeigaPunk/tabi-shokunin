# R87Exec1 — C1 cold-run reproduction (two fresh-nonce driver runs, frozen counter)

Seat: executor, round 87 wave w1. Milestone: C1 cold-run reproduction. Axes: coverage,
operability. Nothing was fixed, judged or integrated; the frozen driver and frozen counter ran
as committed. Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base `24765dd9`,
D `3dd4b0802d67`, frozen L1 nonce `tabi-r87-l1-3dd4b0802d67`.

## Instrument identity (verified before the runs)

| item | value |
|---|---|
| driver `scripts/chrome-cdp-showpicker-round87.mjs` sha256 | `7c54e786d78d455b955e822deb4bf0419b85c4859c5287c27380d6b568389e5f` (= `freeze.txt` pin) |
| counter `scripts/check-showpicker-r87.mjs` sha256 | `6a2bb03b63feb4835d9bf61b4b8970a27b81ac266e2e1e4cc130cd620bf9b181` (= pin) |
| prior set `controls/c1/prior-set.txt` sha256 | `cb28090747882c88c2b97702ba4fa2c96c74f7d94dafc6925d32fd4b2dbaa01d` (2 priors: `probes/prior1.json`, `probes/prior2.json`) |
| Chromium | `Chromium 155.0.8059.84 Arch Linux` (= counter `HOST.chromium` pin) |
| Node | `v24.21.0` (major 24 = pin) |
| ports | `19620/19621/19622` (cold1), `19630/19631/19632` (cold2); all free at start, distinct triples |

## 1. Runs — frozen driver, two fresh nonces

Commands (cwd `/fast/scratch/hyaku/tabi-r87/R87Exec1`; both runs in parallel, 5 s stagger):

```
node <lane>/scripts/chrome-cdp-showpicker-round87.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --nonce tabi-r87-cold1-3dd4b0802d67 --scratch /fast/scratch/hyaku/tabi-r87/R87Exec1/cold1 \
  --out /fast/scratch/hyaku/tabi-r87/R87Exec1/cold1.json \
  --http-port 19620 --cdp-port 19621 --child-port 19622
node <lane>/scripts/chrome-cdp-showpicker-round87.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --nonce tabi-r87-cold2-3dd4b0802d67 --scratch /fast/scratch/hyaku/tabi-r87/R87Exec1/cold2 \
  --out /fast/scratch/hyaku/tabi-r87/R87Exec1/cold2.json \
  --http-port 19630 --cdp-port 19631 --child-port 19632
```

| | cold1 | cold2 |
|---|---|---|
| nonce | `tabi-r87-cold1-3dd4b0802d67` | `tabi-r87-cold2-3dd4b0802d67` |
| ports (http/cdp/child) | 19620/19621/19622 | 19630/19631/19632 |
| legs | 34 | 34 |
| receipt `failures` | `[]` | `[]` |
| startedAt → finishedAt | 10:15:09.323Z → 10:17:55.837Z | 10:15:14.306Z → 10:18:00.664Z |
| duration | 166,514 ms | 166,358 ms |
| fixture sha256 (nonce/child-origin bound) | `a7a5d0ba89c8c1242855fc93141ccf1574092376097fe8d5d3d4352f6f1734ec` | `5a84d3a1dd92d9cd9134d3c687003e4f96427b0bb78d859638a6f8aa0adf1e0f` |
| driverSha256 | `7c54e786…e5f` | `7c54e786…e5f` |
| host | Chromium 155.0.8059.84 / Chrome/155.0.8059.84 / CDP 1.3 / v24.21.0 | same |
| log | 34× `leg … done, errors=0`, final summary `"failures": []` | same |

The driver's own exit code is `0` in both runs (`failures.length === 0`). The wrapper shell printed
`cold2 exit=127`: that is the wrapper's `wait` failing on a re-parented background pid
(`wait: pid … is not a child of this shell`), not the driver — cold2.json carries
`finishedAt`, 34 legs and `failures: []`, and its log ends with the full summary. No driver failure.

## 2. Frozen counter — verdict per run

Counter command (each run scored with **its own** receipt fixture sha, as assigned; the fixture
embeds nonce + child origin, so it can never equal the scored fixture `10e444f7…d94c4`):

```
node <lane>/scripts/check-showpicker-r87.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --receipt /fast/scratch/hyaku/tabi-r87/R87Exec1/cold<k>.json \
  --expect-driver-sha256 7c54e786d78d455b955e822deb4bf0419b85c4859c5287c27380d6b568389e5f \
  --expect-nonce tabi-r87-cold<k>-3dd4b0802d67 \
  --expect-fixture-sha256 <cold<k>.fixture.sha256> \
  --prior-set <lane>/.ufo/waves/round-87/controls/c1/prior-set.txt --json
```

| | cold1 | cold2 |
|---|---|---|
| counter exit | 1 | 1 |
| verdict | `findings` | `findings` |
| checkCount | **99** | **99** |
| checks true | 98 / 99 | 98 / 99 |
| findings | 1 | 1 |
| finding ids | `prior-set-complete` | `prior-set-complete` |
| priorSet / file sha | 2 / `cb280907…a01d` | 2 / `cb280907…a01d` |
| treeExemptSha256 | `[]` | `[]` |

Finding detail, identical in both runs:

```
prior-set-complete: receipts of schema tabi-chrome-cdp-showpicker-r87 in the round-87
wave/evidence trees, not the receipt under test (path …/R87Exec1/cold<k>.json), not exempted by
sha256 and not among the priors:
/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round87/chromium-showpicker/receipt.json
```

**Classification: declaration, not law.** `prior-set-complete` is the prior-set/declaration
completeness rule over the walked trees (`.ufo/waves/round-87`, `corpus/evidence/round87`). It
fails here solely because the canonical scored receipt is an in-tree r87 receipt that
`prior-set.txt` does not declare and that is not the receipt under test. The check's self-exclusion
(`w.path !== selfReal`) is exactly why the scored receipt scores clean against itself
(`scored/counter-a.json`, checkCount 99, verdict clean) and why any other receipt under test
exposes the declaration gap. No Chromium-behaviour check failed. This is the single legitimate
cold-run failure the assignment allows, not a law discrepancy.

All 98 other checks were true in both runs, including `schema`, `nonce-expected` (cold nonces),
`driver-pin`, `fixture-hash`, `host-chromium`, `host-node`, `ports-declared`, `plan-frozen`
(34 legs), `leg-order`, `leg-records`, `leg-marks`, `send-log-allowlist`, `plan-calls`,
`cdp-event-log-closed`, `event-types`, `event-time-quantum`, `event-leg-window`, `seq-monotonic`,
every per-leg check (`leg-sp84-*` 18, `leg-sp85-*` 6, `leg-sp86-*` 6, `leg-sp87-*` 4), every law
check (`gesture-law`, `activation-law`, `mode-law`, `cross-origin-nonfile-law`, `order-law`, 9
cross-origin `*-law`, `webkitdirectory-answer-law`, `accept-answer-law`, `click-while-open-law`,
`multiple-mode-law`, `accept-mime-answer-law`, **`accept-grammar-law`**, `same-origin-color-law`,
`second-chooser-answer-law`, `no-selection-law`, `same-origin-no-picker-law`, `intercept-law`,
`cancel-law`, `dismiss-law`, `trust-law`), host/teardown/descriptor/server-binding checks,
`run-window`, `replay-event-timeline`, `replay-launch-token`, `replay-devtools-url`,
`prior-set-unmatched-exempt`, `prior-set-unparsable`.

Replay limit block (both runs, same shape): `ownEvents` 153; priors 153 events each, `absNeed` 77;
`absMatched` **0** against both priors in both runs (cold1 gapMatched 0/0 with 5 own gaps; cold2
gapMatched 0/1 with 8 own gaps); neither prior refused. Fresh runs do not replay a prior timeline;
the gap side is reported, never a refusal (frozen limit sentence).

## 3. Coverage evidence — the four r87 accept legs, both cold runs

Raw `accept` attribute read back from the page; every delivered file landed in the input with its
bytes, trusted `input`+`change`, and page-read hex. Both runs identical:

| leg | target | raw accept (page) | delivered (page file list) | input+change trusted | page-read hex |
|---|---|---|---|---|---|
| `sp87-accept-audio-png` | `aa` | `audio/*` | `tabi-r87-b.png`, 21, `image/png` | yes/yes | `hex:89504e47…7238332d706e670a` |
| `sp87-accept-video-text` | `av` | `video/*` | `tabi-r87-a.txt`, 22, `text/plain` | yes/yes | `hex:74616269…616c7068610a` |
| `sp87-accept-multimime-text` | `a2` | `image/png,application/pdf` | `tabi-r87-a.txt`, 22, `text/plain` | yes/yes | `hex:74616269…616c7068610a` |
| `sp87-accept-whitespace-png` | `aws` | `  image/png ,  .txt  ` | `tabi-r87-b.png`, 21, `image/png` | yes/yes | `hex:89504e47…7238332d706e670a` |

Each answer's `DOM.setFileInputFiles` call returned `{}` with `setError: null`; the chooser event
backendNodeId was 19 in all four legs, as the counter's `nodeReport` records. The four new legs
reproduce the carried law — accept does not validate a programmatic answer — over the new token
forms, and `accept-grammar-law` passes.

## 4. Retained evidence and scratch

Scratch `/fast/scratch/hyaku/tabi-r87/R87Exec1/` was removed before yielding (bounds). Artifact
hashes recorded here so the numbers above stay bound to bytes:

```
e6ceb9b02c7004d61fbd3afa396893ecb5598e260c9a910bca392ee72d360eb9  cold1.json
3993cb96768af2860b315ebea2e2a8d2b86257634f4f9a0f720b556ec8f02e91  cold2.json
0d45c61c979973159aee5faae0f76a6fc8cb90b6375f9aea19507f1c0a8a7f74  cold1-counter.json
060ce5c09582bffbf9d45f12462207594780f35d267d9a56f9f2e06c2b8a7a81  cold2-counter.json
cafb47317cb2d3b0c8278dd9ed8c80716833cf5058654dd2444f651ea804ad36  cold1.log
c2276469e812d70b7dd034a58ae87d9b7fe24a6a9a474eaca0a34916a54965f6  cold2.log
```

No lane byte was written by the runs (the driver uses `--lane` only for `path.basename(lane)`);
nothing was written into `corpus/evidence/round87` or `.ufo/waves/round-87/scored`.

## Risks / observations (report only)

- **Declaration gap is the expected cold-run signature, not a pass.** Any receipt under test other
  than the in-tree scored receipt scores `verdict: findings`, exit 1, with `prior-set-complete`
  naming `corpus/evidence/round87/chromium-showpicker/receipt.json`. If the wave wants a cold run
  scored clean end-to-end, the scored receipt must be declared (prior or content exemption) — that
  is a declaration decision for the L1, not an instrument repair, and was not made here.
- **Fixture pin is per-run.** `fixture.sha256` is a function of nonce + child origin (ports), so the
  counter's `fixture-hash` check validates the receipt against whatever per-run fixture hash is
  supplied. This is inherent to the nonce-bound fixture; it does not affect the law checks, which
  are computed from the receipt's recorded bytes/events.
- **Parallel execution did not perturb the scored properties.** Two drivers ran concurrently on
  distinct ports/scratch; both finished 34/34 legs with 0 failures and 98/99 checks true. Event
  timestamps did not pair-match the priors at all (`absMatched 0`), so replay refusal is far from
  its threshold; no window/quantum/ordering check failed.

## Files changed

- This report only: `.ufo/waves/round-87/w1/R87Exec1.md`. No script, fixture, lane record,
  evidence byte or fleet-root file was written; no git/jj mutation of any kind.

## Tools

No install or upgrade. Node v24.21.0, Chromium 155.0.8059.84 and coreutils were already present
(existing host binaries; no pacman transaction, no `~/.local/bin` change).

## Blockers

None.
