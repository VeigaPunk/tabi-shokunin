# R92Critic2 — real-browser counterexample hunt, C1

Claim attacked: `C1-IFRAME-CHOOSER-R92` (plans/round-92.md §Claim + §Declared limits).
Driver pin verified before every run: `0feca90ba0272…` matches
`scripts/chrome-cdp-iframe-chooser-round92.mjs`; counter sha256 `d4d84f92…`.
Chromium: `Chromium 155.0.8059.84 Arch Linux`. Node v24.21.0. Ports 19201/19202/19203
(one run at a time). No leftover chromium after each run (`pgrep -f
"remote-debugging-port=19203"` empty). No tool installs; none needed.

## Commands run (exact, with exits)

1. Frozen driver, reps 10 (spec run 1), exit 0:
```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-iframe-chooser-round92.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --nonce tabi-r92-critic2-reps10 --scratch /fast/scratch/hyaku/tabi-r92/R92Critic2/d --out /fast/scratch/hyaku/tabi-r92/R92Critic2/r10.json --http-port 19201 --child-port 19202 --cdp-port 19203 --reps 10
# → {"out":".../r10.json","legs":20,"failures":0}, driver exit=0
```
Scored in `--receipt` mode with `--reps 10`, exit 0, clean, 289 checks, 0 findings:
```
node scripts/check-iframe-chooser-round92.mjs --lane … --expect-driver-sha256 0feca90ba0272d92d3444d1b23bf0e85a089946408fe52e383e8ddf740321688 --receipt /fast/scratch/hyaku/tabi-r92/R92Critic2/r10.json --expect-nonce tabi-r92-critic2-reps10 --reps 10 --json
# → exit=0, verdict clean, checkCount 289, findings []
```
All 20 legs: exactly 1 chooser (X on `iframe`, S on `page`), answer error null,
files `[["tabi-r92-answer.txt", 22]]`. No leg finding that is not a named setup
failure — the 3-rep wording's generality was not falsified at 10 reps.

2. Counter `--live` at reps 10 (also run; exit 0, clean, 289 checks, 0 findings) and
two further default `--live` runs, both exit 0, clean, 93 checks, 0 findings:
```
node scripts/check-iframe-chooser-round92.mjs --lane … --expect-driver-sha256 0feca90… --live --scratch /fast/scratch/hyaku/tabi-r92/R92Critic2/live2 --ports 19201,19202,19203 --json
# → exit=0, nonce tabi-r92-live-e2e9daa7ba11, legs 6, failures 0, checkCount 93
node scripts/check-iframe-chooser-round92.mjs --lane … --expect-driver-sha256 0feca90… --live --scratch /fast/scratch/hyaku/tabi-r92/R92Critic2/live3 --ports 19201,19202,19203 --json
# → exit=0, nonce tabi-r92-live-99ef7a3c17b1, legs 6, failures 0, checkCount 93
```

3. Own probe (scratch only, `/fast/scratch/hyaku/tabi-r92/R92Critic2/probe.mjs`, exit 0):
X-arm repeated 3× with a 5000 ms window, recording EVERY `Page.fileChooserOpened`
per session. Result: exactly one chooser per leg, all on the `iframe` session
(mode `selectSingle`), none on the page/other session, none late between
1500 ms and 5000 ms; answer on that session succeeded; files
`[["tabi-r92-answer.txt", 22]]`. No second or delayed chooser observed.

## Findings

No real-browser counterexample found. Nothing produced shows the stated wording
false or wider than what the counter enforces. The 1500 ms "exactly one"
window (limit 4) held under a 5000 ms observation, and no chooser arrived on a
different session (relevant to limit 5, which the claim does not measure).

VERDICT C1: neutral
Evidence: .ufo/waves/round-92/w1/R92Critic2-r10.json (.ufo/waves/round-92/w1/R92Critic2-score10.json)
.ufo/waves/round-92/w1/R92Critic2-live10-summary.json .ufo/waves/round-92/w1/R92Critic2-live2-summary.json .ufo/waves/round-92/w1/R92Critic2-live3-summary.json .ufo/waves/round-92/w1/R92Critic2-probe.json .ufo/waves/round-92/w1/R92Critic2-live2.json .ufo/waves/round-92/w1/R92Critic2-live3.json
