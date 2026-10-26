# CritC1Forgery artifacts

All from a scratch clone of `4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6` (removed after copy).

- `runs/*.json`, `runs/*.err` — raw `--live --json` output and stderr per forgery variant
  (`v0` browserless golden, `v1` synthetic+CDP shot, `v2` R2×16, `v3` same path twice,
  `v4` identical copies, `v5` queued source row, `v6` single row, `v7`/`v7b` baseline-presence
  pair, `v8` R16+unknown row).
- `blobs/` — the forged committed files: v1 entry/receipt/driver (2-line re-export), v2 entry
  (16×R2), v3 receipt (same transcript path twice), v8 entry (R16, R18).
- `live1.meta.json`, `live1.jsonl` — one real BiDi record produced by the counter's own
  `liveRecord` (`dump-live.mjs`), serialised to transcript JSONL: shot sha
  `ee0edebad5ace8f10cd1db964076ad60929d6b84de236ad0030c59e05d51eca5`, 28 commands, 14 events.
- `cdp.meta.json`, `cdp-shot.png` — a real 640×480 render of the same FIXTURE via CDP
  `Page.captureScreenshot` (`cdp-shot.mjs`); byte-identical to the BiDi shot above.
- `variants.json` — variant name → scratch commit.
- `build-variants.mjs`, `dump-live.mjs`, `cdp-shot.mjs` — the three scratch tools.
- `clone-log.txt`, `clone-head.txt` — scratch history (junk commits only).

Reproduce: clone the lane at 4181fff, run `node dump-live.mjs <out>` and `node cdp-shot.mjs`
once, then `node build-variants.mjs` and run the counter per variant as quoted in
`../CritC1Forgery.md`.
