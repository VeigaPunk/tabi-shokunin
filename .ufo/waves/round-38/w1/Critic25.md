# Critic25 — W1-25

Axes: calibration (C1), coverage (C2).

## C1 finding — frozen predicate fails on frozen REV

Command (lane repo, frozen commit):

```text
node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json
```

Observed exit 1. JSON starts with `d1.stalePresent:true`, `d1.supersedingCorrection:false`; D2 reports `recomputed:{ok:23,finding:11,error:0,none:0,reports:34}` but `stated:null`; the frozen counter reports predicate false. These are direct counterexamples to C1's predicate assertion (claims.json lines 24-28, frozen C1 counter lines 84-89 and 108-111). In particular the committed evidence does not satisfy the counter's defined D1 correction or D2 stated-scorecard matching conditions. Thus C1 is not established at the frozen measured REV; this is not a hypothetical mutation.

## C2 — no finding in bounded live reproduction; caveat on egress evidence

Ran the pinned driver twice (no install):

```text
node scripts/playwright-firefox-loopback-round38.mjs --out /fast/scratch/hyaku/tabi-r38/Critic25/receipt.json --runs 2
```

Observed: `runs:2`, `binding:true`, `egress:0`, `survivors:0`; both first-shot hashes were `3e0c070a75f041986f63792a036addf08f0915b79713fd655499c601ec56378c`. Receipt records Playwright 1.64.0 and browserVersion 157.0, both runs `errors:[]`, `portClosed:true`, `firefoxSurvivorPids:0` (scratch receipt lines 2-6, 11-12, 146, 158-191, 327, 339-372, 375-381). This supports the demonstrated runtime loopback interaction, repeatability, and observed cleanup for these runs.

Important limit: the driver's claimed zero non-loopback sockets is a weak observation, not an enforced egress boundary. `scripts/playwright-firefox-loopback-round38.mjs` lines 73-83 launches Firefox without network isolation, samples `ss` every 400ms, and classifies only sampled lines containing one of the Firefox PIDs captured at line 74; it does not prevent egress, and short-lived sockets between samples or browser child processes omitted from that PID snapshot can escape observation. Counterexample to interpreting `egressNonLoopback:0` as proof of loopback-only requests: a non-loopback request/socket opened and closed between samples would leave the recorded value at zero. This does not falsify the actual bounded run receipt; it limits the strength of the C2 wording/predicate's egress guarantee (claims.json lines 36-41). Smallest safe correction: describe this as zero *sampled* non-loopback sockets and distinguish that from guaranteed network confinement, or run under an enforceable network namespace/firewall and include all browser descendants in monitoring.

Scratch receipt and directory removed after inspection. No installs or production edits.