# w2 RerunC1Live — independent re-run of C1's counting command at b234a589

## Verdict

**C1's predicate HOLDS on an independent re-run.** In a clean shared clone of the lane checked out at `b234a58920134424e0d104f137311ff54a16d26b`, with both frozen counters byte-identical to `claims.json.frozenDigests` (sha256 `2f25af5a…` / `77b5c8ed…`) and an empty freeze→HEAD diff on both, the counting command `node scripts/check-bidi-runtime.mjs --rev HEAD --baseline d805d1d6132430118b206a848b85753ab35d1014 --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --live --json` was run **twice**: both runs exited **0** with **population 16, admitted 16, failing 0, binding null** — byte-identical JSON outputs. That is strictly above the claim target (admitted ≥ 14, failing = 0, exit 0). The `--live` leg was proven to be a real browser session two independent ways (a chromedriver-less PATH refusal at exit 2, and direct process-table observation of chromedriver + headless chromium under my scratch profile dir during a third live run). No defect found in this item's scope; the counter, receipt, entry, and gate behaved exactly as the frozen claim describes.

## Preconditions (all verified in `$S/clone`, `$S=/fast/scratch/hyaku/tabi-r32/RerunC1Live`)

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"   # ok
git -C "$S/clone" checkout -q --detach b234a58920134424e0d104f137311ff54a16d26b
git -C "$S/clone" rev-parse HEAD          # b234a58920134424e0d104f137311ff54a16d26b  exit 0
git -C "$S/clone" status --porcelain      # (empty)  exit 0
sha256sum scripts/check-bidi-runtime.mjs  # 2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393  == frozenDigests ✓
sha256sum scripts/check-selfassessment.mjs# 77b5c8ed503bd9bc93e8ef634a10627613672eaa39bca84cf7339d37b6d4c6a9  == frozenDigests ✓
git -C "$S/clone" diff --name-only 4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6 HEAD -- scripts/check-bidi-runtime.mjs scripts/check-selfassessment.mjs
                                          # (empty)  exit 0
node --version                            # v24.21.0
/usr/bin/chromium --version               # Chromium 154.0.8037.97 Arch Linux
/usr/bin/chromedriver --version           # ChromeDriver 154.0.8037.97
```

## The two counting runs

`TMPDIR=$S/run{1,2} node scripts/check-bidi-runtime.mjs --rev HEAD --baseline d805d1d6132430118b206a848b85753ab35d1014 --entry corpus/knowledge/webdriver-bidi-runtime-round-32.md --live --json`

| Run | exit | population | admitted | failing | binding | entryFinding | clean |
|---|---|---|---|---|---|---|---|
| run1 | 0 | 16 | 16 | 0 | null | null | true |
| run2 | 0 | 16 | 16 | 0 | null | null | true |

`cmp run1/out.json run2/out.json` → **byte-identical**. Both `rev` fields read `b234a58920134424e0d104f137311ff54a16d26b`; both `fixtureSha256` = `343cbcedd56f6fb1914d529119fadfd69cd7901ed919c6e1ae84d213bc112843`.

### Per-row results (identical in both runs)

- R1–R15 (entry lines 67–81) and R17 (entry line 83): `admitted: true, reason: null, detail: null` — every predicate held on both committed receipt runs **and** on the counter's own live session (`l1-live` would have fired otherwise; check-bidi-runtime.mjs:566-570).
- R16 (entry line 82) is **not in the population**: its `Measured` cell reads `no — no BiDi command`, and the counter counts only rows whose cells[3] lowercases to `yes` (scripts/check-bidi-runtime.mjs:508). This matches the claim's feasibility disclosure verbatim ("R16 has no BiDi command"); the `x2-no-counterpart` branch (line 564) exists as a guard, not a silent pass.
- Population 16 = 17 table rows − R16. All 16 admittable rows admitted.

### Binding (t3) — null means passed

`binding: null` in both runs: the two committed transcripts' first `browsingContext.captureScreenshot` PNGs are present and identical to each other **and** to the screenshot from the counter's fresh live session; `chromedriverVersion` present and equal across both runs and the live session (check-bidi-runtime.mjs:546-556). So the committed evidence is bound to a rendering this host reproduces today — the w1 CritC1Forgery / M2 hole answer is live in the gate I ran.

### Receipt integrity (enforced before any row is scored)

The committed `corpus/evidence/round-32/bidi/receipt.json` passed every gate: schema `tabi-bidi-receipt-v1`, `fixtureSha256` equals the counter's constant, `browserVersion` "154.0.8037.97", driver `scripts/bidi-loopback-round32.mjs` is not the counter and its sha256 at rev (`55dbef88ed4bc5a980af0afe2eb0c6586e6869d41a1e8b98dbb7980b6dff070a`) matches `driverSha256` (re-verified by me with sha256sum), `runs.length >= 2` (exactly two: `run1`, `run2` → `corpus/evidence/round-32/bidi/run{1,2}/transcript.jsonl`), both transcripts present with matching sha256s (check-bidi-runtime.mjs:516-535).

## Liveness of `--live` (falsification attempts on the run itself)

1. **Negative control — counter refuses without a driver.** With `PATH` containing only node+git (no chromedriver): `BIDI_RUNTIME verdict=could-not-evaluate detail=chromedriver or chromium not found`, **exit 2** (run3b). A first attempt with `env -i PATH=/nonexistent` refused earlier at `unresolvable revision: HEAD` (exit 2) because git itself was missing — recorded for completeness. The exit-0 runs therefore really resolved and drove a chromedriver.
2. **Positive observation — real browser processes.** During a third live run (exit 0, again 16/16/0/binding null) a 0.05 s-interval `pgrep -fa 'chromedriver|chromium'` sampler captured 179 samples including `chromedriver --port=…` and the chromium tree (`--headless=new --no-sandbox --enable-automation --test-type=webdriver --user-data-dir=/fast/scratch/hyaku/tabi-r32/RerunC1Live/run4/tabi-bidi-live-7zH2s3/profile`, gpu/renderer children). The session ran against my throwaway scratch profile only, loopback fixture per the counter (webSocketUrl must match `^ws://(127.0.0.1|localhost):…`).
3. The 2.2 s wall time of runs 1–2 is consistent with one chromedriver session + 16 WebSocket commands; run 3 with the sampler attached took ~24 s wall purely from sampler contention, same result.

## Predicate assessment

- admitted ≥ 14: **16 ≥ 14** ✓ (both runs)
- failing = 0: **0** ✓ (both runs)
- exit 0: **yes** (both runs; `clean = !entryFinding && population ≥ 1 && failing === 0`, check-bidi-runtime.mjs:582)
- kill-rule triggers: none — counter never exited 2 during a counting run, counter bytes equal frozenDigests, `git diff --name-only 4181fffb… HEAD -- <both counters>` empty.

**No defect found in this item's scope.** (Observation, not a defect: population counts only `Measured == yes` rows, so "admitted ≥ 14 of 16" is the honest ceiling; the entry itself states R16 as `no — no BiDi command` with the gate refusing a `yes` there.)

## Hygiene

- Process cleanup: after all runs, `pgrep -fa 'chromedriver|chromium'` shows only PID 1371 `/usr/bin/earlyoom` (system daemon since boot; its argv merely mentions chromium). **No chromedriver/chromium process of mine remains.**
- Receipts copied to `.ufo/waves/round-32/w2/RerunC1Live/` before scratch removal: `run1.json`, `run2.json`, `run3-procsampled.json`, `refusal-no-chromedriver.err.txt` (+ empty `refusal-no-chromedriver.json`, refusal text went to stderr), `live-process-samples.txt`.
- Tooling: **no tools installed or upgraded** (used host node v24.21.0, /usr/bin/chromium 154.0.8037.97, /usr/bin/chromedriver 154.0.8037.97 as contracted). Scratch `$S` deleted after this report was written.
