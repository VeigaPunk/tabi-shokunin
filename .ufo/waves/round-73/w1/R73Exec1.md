HOLDS

Leg (b) independent cold run and leg (c) independent re-run both hold as frozen, predicate C1-SYNTHPINCH-R73. Seat R73Exec1 (R73Exec1), Godspeed execution — axes: digest fidelity, cold-run independence, counter/battery/kill-power re-execution.

Digest pin check — sha256sum of every file in .ufo/waves/round-73/freeze.txt vs lane bytes, `diff` clean (DIGESTS MATCH), sha256sum exit 0:
- scripts/chrome-cdp-synthpinch-round73.mjs = 3f0ffe24c8436400589dd856cff8503af150cccbcf338e7b895fb9c4ce5559c4 (freeze.txt:3)
- scripts/check-synthpinch-r73.mjs = 3104101a9ac8b0cd09337a870139653f7a64cfb7eb65067daf389119ce20d4d1 (freeze.txt:4)
- scripts/negatives-synthpinch-r73.mjs = 0a738780090a8483eda8290f513b7d88ba41dd221120b14950dd6649609b88af (freeze.txt:5)
- .ufo/waves/round-73/controls/c1/kill-power-r73.mjs = 5e4a8255f84b61a75da6643fba1ca4f8a4a64b52d1c02280cea2f92b0ee0a8fe (freeze.txt:6)
- .ufo/waves/round-73/claims.json = ef289314454ef4182ea40aa48404cf66fb4f08892df1c83cfd9c9003429f8d94 (freeze.txt:7)
- .ufo/waves/round-73/run-scored.sh = 8288728dad48a6a983c4d09d404158a6ff8328f1dbc070043f15f2fe3b971071 (freeze.txt:8)
Freeze line 1 records freeze d7387fb30b513fec0cf61193f275484aed750b45; digests commit D 3409ab53b905d12d0866c6c93373e1c9887eda10 corroborated by .ufo/waves/round-73/scored/digests-commit.txt sha256-sum read (cat exit 0); nonce expectation below uses first-12-hex suffix 3409ab53b905 as frozen.

Leg (b) cold driver run, exactly one launch (ports 23377/18841 free-checked via ss, exit 0):
`node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-synthpinch-round73.mjs --scratch /fast/scratch/hyaku/tabi-r73/R73Exec1/d --out /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-73/w1/R73Exec1/receipt.json --nonce tabi-r73-exec1-3409ab53b905 --http-port 23377 --cdp-port 18841`
driver rc=0 (echoed immediately after exit, receipt written 236088 bytes, never re-run). Receipt sha256 e0abd3e7d13d0336f580677bb0452e04fb517d8b5bc46d623f5cd84eee8c8815, schema tabi-chrome-cdp-synthpinch-r73, predicate true, synthPinchHypothesis CONFIRMED, nonce tabi-r73-exec1-3409ab53b905, driverSha256 3f0ffe24c8436400589dd856cff8503af150cccbcf338e7b895fb9c4ce5559c4, host Chromium 155.0.8059.84 / Chrome 155.0.8059.84 protocol 1.3, legs 11 (start,in,out,clamp,unit,default,touch,slow,pen,outside,zero), events 574, nonces verified against command line.
Counter (exit 0, counter.json): `check-synthpinch-r73.mjs --receipt .../R73Exec1/receipt.json --expect-driver-sha256 3f0ffe24...ce5559c4 --expect-nonce tabi-r73-exec1-3409ab53b905` with 12 PRE priors + L1 scored receipt as 13th prior; verdict clean, checkCount 98, checks length 98, findings [] (python3 JSON extraction exit 0); replay-launch-token, replay-devtools-url, replay-event-timeline, nonce-expected all true. Leg (b) HOLDS.

Leg (c) independent re-run (exit 0 all):
- Battery on L1 scored receipt (`negatives-synthpinch-r73.mjs --real corpus/evidence/round73/chromium-synth-pinch-gesture/receipt.json --expect-driver-sha256 3f0ffe24... --expect-nonce tabi-r73-l1-3409ab53b905`, 12 PRE priors, --laundered 3 degenerates): negA rc=0, negatives-a.json allOk true, passed 228/228 (refuse 216, mustAccept 9, laundered 3), failed [], coverageGap []. L1 receipt sha256 independently verified a3b9070bca0db67000d58eb34a990d05e8191a34b2882ec30a9316472d703ea8 matches scored/c1-counter-a claim exactly (sha256sum exit 0).
- Battery on my receipt (`--real .../w1/R73Exec1/receipt.json --expect-nonce tabi-r73-exec1-3409ab53b905; priors PRE + L1 receipt): negB rc=0, negatives-b.json allOk true, passed 228/228, failed [], coverageGap []. positiveOk true both.
- Kill power (exit 0, kill-power-a.json): unmutatedExit 0, force-true mutants 98 killed 98/98, semantic mutants 19 killed 19/19 (incl. M5 producer-verdict AND->OR), survivors [], holds true. First attempt with --jobs 6 hit the 1200s bash timeout with no kill-power-a.json written and only m90-m95 dirs present — that run is NOT evidence; second run with --jobs 12 completed in 814s, killrc=0, summary line `{"unmutatedExit":0,"forceTrue":{"mutants":98,"killed":98},"semantic":{"mutants":19,"killed":19},"survivors":[],"holds":true}`. Matches scored/c1-kill-power-a.json summary exactly (exit file 0). Leg (c) HOLDS.

Declared limit (not a falsification): controls/c1/controls-summary.json limit-full-identifier-rewrite exit 0 was not re-exercised; no evidence for or against it produced here. Unrun = not passed.

Tooling: no installs; node v24.21.0 via fnm_multi-shells (/run/user/1000/fnm_multishells/1589455_1794007303555/bin/node), python3 system. Scratch used: /fast/scratch/hyaku/tabi-r73/R73Exec1/{d,n,k,k2} — deleted pre-yield after copying receipts into the wave dir (rm -rf exit 0; receipts live in the wave dir below).

Files (relative to tabi-shokunin lane root for Report: trailers):
- .ufo/waves/round-73/w1/R73Exec1/report.md (this file)
- .ufo/waves/round-73/w1/R73Exec1/receipt.json (sha256 e0abd3e7..., 236088 bytes)
- .ufo/waves/round-73/w1/R73Exec1/counter.json (sha256 ad30874c..., verdict clean, 98 checks)
- .ufo/waves/round-73/w1/R73Exec1/negatives-a.json (sha256 ed470f96..., L1 receipt, 228/228)
- .ufo/waves/round-73/w1/R73Exec1/negatives-b.json (sha256 b05be4f5..., my receipt, 228/228)
- .ufo/waves/round-73/w1/R73Exec1/kill-power-a.json (sha256 06d125e4..., holds true)

Risks/blockers: none remaining in scope. Leg (d) remains L1-only as frozen. First kill-power attempt timed out at 1200s (tool timeout, not a counter finding) — retried with higher parallelism and completed; no partial output from attempt 1 was used.
