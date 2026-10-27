# W1-19 — adversarial claim attack

Axes: calibration (C1), coverage (C2).

## Counterexample: frozen REV fails C1's own predicate

Re-ran the frozen counter at the exact frozen commit:

```sh
node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json
```

Exit 1; output `predicate:false`. Concrete mismatches: D1 `supersedingCorrection:false`; D2 `stated:null` despite recomputed reports tally `{ok:23,finding:11,reports:34}`; D3 all six round-37 commits are commits and ancestors but `presentInR38Section:false`, with `freezeLandingStated:false`; D4 lesson and red-control receipt absent; D5 census receipt absent; D6 no numstat receipt. This is a direct counterexample to any assertion that C1 holds at frozen REV, and calibrates the counter to reject incomplete evidence. Exact evidence is the counter's JSON output above, sourced from the frozen counter at claims.json:45 and claim C1 predicate at claims.json:24-28.

This is not a falsification of the intended post-integration target: REV is the frozen claim snapshot and missing artifacts may be expected before integration. It does establish that the documented counterexample/control requirement matters; do not infer target success from the 23/11 computed tally alone.

## C2

No runtime experiment performed: the frozen REV is an earlier snapshot, and this seat's strongest bounded falsification was the direct C1 counter run. No independent C2 counterexample established; receipt/binding/egress/cleanup remain unverified here.

## Smallest safe correction

Retain the counter failure as the baseline-control result. Any C1 success claim must be evaluated at the actual measured integration REV and backed by the specified receipts; report counter-derived tally only alongside its missing/stated-evidence status. Do not change the frozen claims or production files.
