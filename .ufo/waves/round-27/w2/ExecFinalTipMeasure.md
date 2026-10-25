# ExecFinalTipMeasure — final-tip claim measurement sweep

Seat: `TabiR27.ExecFinalTipMeasure`. Round 27 wave 2, attempt 1 (hyaku run 7). Read-only reporter; writes: this report + `.ufo/waves/round-27/scratch/ExecFinalTipMeasure/` only.

**Tip measured:** `bceb17dd82446a3b7514dd9759ec733673b4ba0d` (`git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse master`). Re-checked at sweep end: `master == HEAD == bceb17dd…` (unchanged during the sweep). Node `v24.21.0`. No tool installs.

## Measurement table

| claim | command (exact) | exit | headline | details |
|---|---|---|---|---|
| C1 calibration | `node scripts/check-selfassessment.mjs --rev bceb17dd82446a3b7514dd9759ec733673b4ba0d --json` | 1 | `mismatches=1` | `counted[]` = exactly 1 entry: `m3-unlanded-paths` (`SCORECARD.md`, `claimed="landed"`, `observed=2`). `couldNotEvaluate=92`, `superseded=10`, `clean=false`. **0 LOG-window findings counted** — every LOG `m1-selftest-tally` finding reports `superseded=true`, incl. `LOG.md:221` (`claimed=8 observed=12 superseded=true`). |
| C2 depth | `node scripts/check-s106-evidence.mjs --rev bceb17dd82446a3b7514dd9759ec733673b4ba0d --json` | 0 | `valid=true` | `present=true`; `decoded_bytes=73952`; `decoded_sha256_claimed==decoded_sha256_observed==9b93fe64843ecf819202fa6de9833597203b3f53f6572c144b76f247424e6c44`; `sha_match=true`; `anchor_located=true`; `anchor_unique=true` (line 187, 1 occurrence); `byte_count_match=true`. Receipt `corpus/evidence/round-26/sources/s106.json`, bytes `corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc`. |
| C3 row | `git grep -lE '^source: S107 ' bceb17dd82446a3b7514dd9759ec733673b4ba0d -- corpus/knowledge \| wc -l` | 0 | `1` | single matching file: `corpus/knowledge/redirect-and-retry-after-semantics.md`; row at line 3: `source: S107 — https://www.rfc-editor.org/rfc/rfc9110.txt — §15.4, §15.4.2-15.4.4, §15.4.8-15.4.9, §10.2.3 — RFC 9110, June 2022; fresh plain-text fetch this round (2026-10-25, 502941 bytes, sha256 21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a)`. sha256 matches the committed receipt hash. |
| C3 census | `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi --today 2026-10-25` | 0 | `tabi ok` | final line `tabi	ok	/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md`; 16 `W04` duplicate-url warnings (S058/S065/S066/S068-S070/S073-S077/S095/S096/S098-S100), W-codes never change status. Companion `census … tabi`: `rows 107` (tier.A 92 / tier.B 6 / tier.C 9; status.mined 79 / queued 19 / rejected 9); FLEET aggregate `rows 107 missing 0`. |
| gate registry | `node scripts/check-gate-registry.mjs --rev bceb17dd82446a3b7514dd9759ec733673b4ba0d --json` | 0 | `nonconformant=0` | `clean=true`, `findings=[]`, `rows=27`, `gates=17` (all 17 `nonconformant:false`, `missing:[]`), `skillBytes=233850`. |

## counted[] (selfassessment)

```json
[{"class":"m3-unlanded-paths","doc":"SCORECARD.md","line":null,"claimed":"landed","observed":2}]
```

The 2 untracked paths at run time (measured, `git status --porcelain --untracked-files=all`):
`.ufo/waves/round-27/w1.ready.dispatched`, `.ufo/waves/round-27/w2/swarm-registry.json`. No tracked modifications were present in `git status` output (sibling edits not in flight at this moment).

## Behavior notes for the L1 quote

- C1 headline at tip: **`mismatches=1`, `counted[]` = `[m3-unlanded-paths observed=2]`, `couldNotEvaluate=92`, `superseded=10`, `clean=false`, exit 1.** The only counted finding is the m3 live-tree probe; the LOG calibration window contributes zero counted findings at the tip (all superseded, including LOG.md:221).
- C2 headline at tip: **`valid=true`, exit 0**, with all four conjuncts (`sha_match`, `anchor_located`, `anchor_unique`, `byte_count_match`) true; SHA-256 claimed == observed.
- C3 row headline at tip: **1 file / 1 row** matching `^source: S107 ` in `corpus/knowledge`; census validate exit 0, `ok`, 107 rows (106→107 holds).
- Gate registry headline at tip: **`nonconformant=0`, `clean=true`, exit 0**.

All outputs saved under `.ufo/waves/round-27/scratch/ExecFinalTipMeasure/`: `selfassessment.json`/`selfassessment.err`, `s106.json`/`s106.err`, `s107-files.txt`, `s107-lines.txt`, `census-validate.txt`, `census-rows.txt`, `gate-registry.json`/`gate-registry.err`.
