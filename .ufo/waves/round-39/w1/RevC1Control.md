# RevC1Control — C1 do-nothing control

- Frozen C1 counter SHA-256 matches claims digest and freeze: `75e823e45bcaff817fb93d677df5dba714560b3be77e62103c73e1a0937c3b6e`.
- Current tip `1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4` descends from freeze `9c09ebb1e2ff594c70ce72093b5d4133c1734dca`; round-38 v1 receipt is unchanged at freeze and tip.
- Clean-clone counter result at current tip: predicate true; no findings; exit 0. The v1 receipt is present and refused with exactly five reasons: wrong schema (v1 vs required v2), run1 no owned pid tree, run1 `sampleCount` undefined/<8, run2 no owned pid tree, run2 `sampleCount` undefined/<8.
- Round-38 driver uses global `ps|grep` PID discovery, PID-filtered `ss`, and 400 ms sampling; receipt has two samples/run. Empty-PID plus zero observed sockets cannot reach the C1 predicate: schema, session-owned tree, and sample-count checks reject the v1 receipt. The counter's control branch does not independently check coverage duration; that omission does not admit this receipt because the three categories above fail.
- Detailed commands, counter output, source paths, and verification gap: `.ufo/waves/round-39/w1/RevC1Control/report.md`.

VERDICT ok — frozen counter rejects the committed v1 control; legacy global-grep/400ms/empty-set behavior cannot reach the C1 predicate.
