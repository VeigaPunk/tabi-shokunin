# R84Exec1 — C1 leg (b): two independent cold runs of the frozen driver, scored by the frozen counter

- Lane: `tabi-shokunin` (round 84, base `a5d6ffbf`, D `a5bdb15ec9a7`)
- Seat: `R84Exec1` (coverage axis; leg b only)
- Date: 2026-11-08
- Report: `.ufo/waves/round-84/w1/R84Exec1.md` (this file)
- Scored counter JSONs: `.ufo/waves/round-84/w1/cold1-counter.json`, `.ufo/waves/round-84/w1/cold2-counter.json`

## Axes (godspeed framing)

1. **Coverage of the r84 surface**: the two new cross-origin `type=tel/search/text` legs (12–14 of 18) and all 18 legs incl. every carried r83 leg.
2. **Independence of the two runs**: distinct fresh nonces, distinct single-file, distinct script-driver runs — futures about the same frozen code path, not reruns of a marked-bad attempt.
3. **Reproducibility**: a third party re-runs the exact commands below and hits the same 80/80 exits.
Verbatim frontier-walk: any change that improves (1) or (2) and harms none was kept; the driver/counter/pins were frozen inputs, not targets.

## Pins used (verified before launch)

```
f436b229df3a9194f074d9489dbeed54a24081afaae3d3027ff46aad4198807e  scripts/chrome-cdp-showpicker-round84.mjs
e88e9fc7a7f5f4ca47c2aca40b77cf6d93a0347dfdf5f60e427ba036b3d315a7  scripts/check-showpicker-r84.mjs
```

- `sha256sum` of both files matched `freeze.txt` / `claims.json` pins exactly (see Evidence).
- Host: Node `v24.21.0`, Chromium `Chromium 155.0.8059.84 Arch Linux`, CDP `Chrome/155.0.8059.84` / protocol `1.3`. Rust script: script required.
- No tools installed or updated (assignment needs only the frozen driver/counter; RULES.md read per instruction).

## Runs

Driver, run twice in parallel, once per nonce. Distinct single-file: each driver run got its own `--scratch` dir.

### Cold1

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-showpicker-round84.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --nonce tabi-r84-cold1-a5bdb15ec9a7 \
  --scratch /fast/scratch/hyaku/tabi-r84/R84Exec1/cold1 \
  --out /fast/scratch/hyaku/tabi-r84/R84Exec1/cold1/receipt.json \
  --http-port 19460 --cdp-port 19461 --child-port 19462
```

- Driver exit: `0` (`COLD1_EXIT=0`), 18 legs, 0 failures, 18/18 `done, errors=0`.
- Fixture SHA256 (from receipt): `1cca638fc70e053397aa035ad90538ff49d666853bd5883cd83623d08c76aed0`
- Receipt nonce field: `tabi-r84-cold1-a5bdb15ec9a7`.

### Cold2

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/chrome-cdp-showpicker-round84.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --nonce tabi-r84-cold2-a5bdb15ec9a7 \
  --scratch /fast/scratch/hyaku/tabi-r84/R84Exec1/cold2 \
  --out /fast/scratch/hyaku/tabi-r84/R84Exec1/cold2/receipt.json \
  --http-port 19473 --cdp-port 19474 --child-port 19475
```

- Driver exit: `0` (`COLD2_EXIT=0`), 18 legs, 0 failures, 18/18 `done, errors=0`.
- Fixture SHA256 (from receipt): `fdfff8e0be6e8b22ed1260997046cfa500f42a7bbef7235939e2e1deec6567cb`
- Receipt nonce field: `tabi-r84-cold2-a5bdb15ec9a7`.

### Scoring (both runs)

The counter walks the frozen wave/evidence trees and therefore required the
already-committed on-record scored receipt for the round-84 line to be
unambiguously content-exempted. First-pass scoring (without the exemption flag)
correctly returned verdict `findings` with a single `prior-set-complete`
finding naming `corpus/evidence/round84/chromium-showpicker/receipt.json`
(sha256 `29347958cfbc2c246af1e89cb2286b8a21fbdbde5d55fd78e69e1bca732cf59c`)

- cold1 first pass: exit `1`, `checkCount 80`, 79/80 true, only `prior-set-complete` false.
- cold2 first pass: exit `1`, `checkCount 80`, 79/80 true, only `prior-set-complete` false.

That is counter hygiene, not a leg failure (every leg check and every law check
passed on both runs). No rerun was made to hide a failure — the same two
receipts were re-scored with the frozen content-bound exemption, exactly as the
counter's usage line prescribes (`--tree-exempt-sha256 <hex>`, resolved inside
the walked trees; a hash matching nothing would itself be refused, and was not).

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-showpicker-r84.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --receipt /fast/scratch/hyaku/tabi-r84/R84Exec1/cold1/receipt.json \
  --expect-driver-sha256 f436b229df3a9194f074d9489dbeed54a24081afaae3d3027ff46aad4198807e \
  --expect-nonce tabi-r84-cold1-a5bdb15ec9a7 \
  --expect-fixture-sha256 1cca638fc70e053397aa035ad90538ff49d666853bd5883cd83623d08c76aed0 \
  --prior-set /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-84/controls/c1/prior-set.txt \
  --tree-exempt-sha256 29347958cfbc2c246af1e89cb2286b8a21fbdbde5d55fd78e69e1bca732cf59c \
  --json
```

- Cold1 counter: exit `0`, verdict `clean`, `checkCount 80`, findings `[]`.
- Cold2 counter (same shape, its own receipt/fixture/nonce/ports): exit `0`, verdict `clean`, `checkCount 80`, findings `[]`.

Full commands for cold2:

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-showpicker-r84.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --receipt /fast/scratch/hyaku/tabi-r84/R84Exec1/cold2/receipt.json \
  --expect-driver-sha256 f436b229df3a9194f074d9489dbeed54a24081afaae3d3027ff46aad4198807e \
  --expect-nonce tabi-r84-cold2-a5bdb15ec9a7 \
  --expect-fixture-sha256 fdfff8e0be6e8b22ed1260997046cfa500f42a7bbef7235939e2e1deec6567cb \
  --prior-set /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-84/controls/c1/prior-set.txt \
  --tree-exempt-sha256 29347958cfbc2c246af1e89cb2286b8a21fbdbde5d55fd78e69e1bca732cf59c \
  --json
```

- `treeExemptResolved` on both clean outputs: `["/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round84/chromium-showpicker/receipt.json"]` — the content-bound exemption resolved, never a silent no-op.

## Results summary

| Run | nonce | ports | driver exit | legs | fixture sha256 | counter exit | verdict | checkCount | findings |
|---|---|---|---|---|---|---|---|---|---|
| cold1 | `tabi-r84-cold1-a5bdb15ec9a7` | 19460/19461/19462 | 0 | 18 | `1cca638f…76aed0` | 0 | clean | 80 | 0 |
| cold2 | `tabi-r84-cold2-a5bdb15ec9a7` | 19473/19474/19475 | 0 | 18 | `fdfff8e0…6567cb` | 0 | clean | 80 | 0 |

Both runs independently confirm the r84 frontier legs behave as the frozen law
pins (sample from cold1; cold2 identical):

```
leg sp84-cross-origin-tel done, errors=0 showPicker=null choosers=0
leg sp84-cross-origin-search done, errors=0 showPicker=null choosers=0
leg sp84-cross-origin-text done, errors=0 showPicker=null choosers=0
```

(The `showPicker=null` is by construction — those legs call inside the
cross-origin child iframe; every one of the 18 leg checks `leg-sp84-*` and the
matching `sp84-*-law` checks passed on both runs, 80/80 true.)

Driver stdout announced `failures: []` on both runs (`cold*-driver.log`,
20 489 bytes each). So the milestoned **leg (b)** — two independent cold runs
of the frozen driver, scored by the frozen counter — is **verified**.

## Files

- This report: `.ufo/waves/round-84/w1/R84Exec1.md` (this file)
- `.ufo/waves/round-84/w1/cold1-counter.json` — scored cold1 counter (`clean`, 80, `[]`)
- `.ufo/waves/round-84/w1/cold2-counter.json` — scored cold2 counter (`clean`, 80, `[]`)
- Scratch (cleaned after copy): `/fast/scratch/hyaku/tabi-r84/R84Exec1/` — receipts, driver stderr/stdout, per-leg Chromium profiles. Deleted per scratch contract; the scored JSONs above are the citable evidence.

Nothing was committed. No lane file was edited outside `.ufo/waves/round-84/w1/`. `claims.json`, `freeze.txt`, `prior-set.txt`, the scored receipt, and all scored outputs were left untouched.
