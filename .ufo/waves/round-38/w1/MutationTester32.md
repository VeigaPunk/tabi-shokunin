# W1-32 — C1/C2 falsification probe

## Scope and bounded check

Ran the frozen C1 counter against the named frozen revision:

```text
node .ufo/waves/round-38/counters/c1-routed-defects.mjs --rev a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --json
```

Actual process exit: `1` (evaluated predicate false). Output begins:

```json
{"schema":"tabi-r38-c1-routed-defects","rev":"a8e7d50c04254bb19f9de08b31ca2aa811fbe7fc","baseline":"3f42a5c7cc19a544c879577e4bad7b7fd9d61a35","d1":{"stalePresent":true,"supersedingCorrection":false,"w2Absent":true},"d2":{"stated":null,"recomputed":{"ok":23,"finding":11,"error":0,"none":0,"reports":34}
```

The command output was truncated by the tool after 768 bytes; the JSON was not captured in full. This is a baseline failure, hence inconclusive for killing a mutant. The counter source explains D1 correction test at `.ufo/waves/round-38/counters/c1-routed-defects.mjs:84-89`; D2 tally extraction and recomputation are at lines 105-138. At this REV, the D2 recomputation yields exactly 23/11 across 34 parsed reports, while the required stated tally is absent from the parsed Round-38 LOG section (`d2.stated: null`); therefore D2 does not pass despite matching derived counts. This is a falsifiable C1 counterexample to any assertion that the frozen counter currently establishes the complete claim predicate at this revision.

The frozen claims' kill rule says a stated number differing from counter-derived evidence is a kill; here the issue is not a contradictory number, but an absent parseable stated tally. D1 independently also fails because `supersedingCorrection:false`. Thus the detector's baseline is red and cannot support a valid mutation-kill verdict.

## Mutation protocol and C2

No mutant verdict is claimed: the baseline detector fails, and producing a meaningful kill comparison would require the pristine predicate to pass first. I did not mutate lane/production bytes or run the Firefox driver; consequently C2 runtime/binding/egress/cleanup was not evaluated by this probe. No tool installation performed.

## Verdict

C1: **inconclusive as a mutation test; concrete baseline falsification** at frozen REV: D1 correction false, D2 stated tally null, while D2 independently recomputes 23 ok / 11 finding / 34 reports. C2: **no finding (not exercised)**.
