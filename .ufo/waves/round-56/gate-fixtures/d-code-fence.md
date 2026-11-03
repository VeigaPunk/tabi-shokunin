# gate-fixtures/d-code-fence.md — case (d): citations inside a fenced block are extracted.

```
node meter.mjs --rev <REV> --json > .ufo/waves/round-56/measure/present.txt
# red control receipt: .ufo/waves/round-56/measure/missing-fenced.txt
```

Outside the fence, nothing else is cited.

Expected: exit 1; the fence is not skipped, so the fenced miss is found — the
only distinct missing path is `.ufo/waves/round-56/measure/missing-fenced.txt`
(another line below names it again, so three tokens are checked in total).
