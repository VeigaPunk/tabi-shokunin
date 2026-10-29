# SimplifierC1 — seat directory

The scoped report for this seat lives at the seat's declared report path:
**`.ufo/waves/round-43/w1/SimplifierC1.md`** (relative to `/home/vgpnk/Projects/shokunin/tabi-shokunin`).

Evidence files for that report are in this directory, under `evidence/`:

- `battery-baseline.json` — fresh `--battery` output, byte-identical to the committed control
  `.ufo/waves/round-43/controls/c1-battery-r43.json` (sha256 `6cb61f1150406e490ec9ba8f54353bf0b8d7ce02ccd31df8388d17d813ef9aed`).
- `probe-parity.json` / `probe-parity.mjs` — battery-probe parity across the repo file and the
  scratch variants (7 contamination vectors × 4 targets).
- `make-variants.mjs` — generator for the scratch variants.
- `v1-deadcode.mjs`, `v2-minenv.mjs`, `v4-minenv2.mjs`, `v5-nohome.mjs`, `v6-nopath.mjs` — the mutated
  scratch copies that were executed (never in place).
- `run-*-stdout.json` — the wrapper's full stdout for each of the six runs.
- `run-summary.json` / `summarize-runs.mjs` — the per-run comparison table used in the report.

No repository producer byte was changed; the frozen wrapper, driver, counter and claims files are
byte-identical to commit `7ca6f018280b08dcc6a519e11ecc2c1ccbfc62bc`.
