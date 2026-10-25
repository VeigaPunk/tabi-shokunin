# W2Cls2 — c2-wave-caps attack

Seat: `L1Tabi23.W2Cls2`. Target: `scripts/round-evidence-audit.mjs` (untracked), class `c2-wave-caps` (audit() ~L277–325). Ground-truth rev `a89f1935f523a64b00991d792fca6a8c0d321948`, round 22.

## Verified on round-22 bytes (canonical counter)

`node scripts/round-evidence-audit.mjs --rev a89f1935f523a64b00991d792fca6a8c0d321948 --round 22 --round-cap 128 --json` → exit 1; `c2-wave-caps` finding:
`detail = ".ufo/waves/round-22/w2b-spec.json: maxLanes 65 > policy waveMaxLanes 64; round total 129 spawned seats > round cap 128"` — both claimed legs present. `evidence` carries per-wave counts: w1 spec/64,64,64 receipt `w1-spawn-result.json`; w2 64,64,0 (refused receipt); w2b 65,65,65. Band (32–64) from `/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json`. ✔ claim verified.

## Break battery (fixtureCtx driver, scratch/W2Cls2/drive.mjs)

| case | result | expected |
|---|---|---|
| A: wave exactly 64 (spec/items/spawn 64) | clean | clean ✔ |
| B: two waves 64+64 = 128 at cap | clean | clean ✔ |
| C: items 65 > maxLanes 64 | trips `items 65 > maxLanes 64` | trip ✔ |
| D: spec only, no receipt | trips "no spawn-result and no refusal receipt … cannot be counted" | unaccounted ✔ |
| E: spec + validation, no receipt | same unaccounted trip | ✔ |
| F: spec + refusal receipt only | clean (accounted refusal, 0 seats) | ✔ |
| G: 64+65 = 129 > cap | trips round-total + items legs | ✔ |
| H: accounted + unaccounted mix | trips only the unaccounted wave; evidence still lists both | ✔ |
| I: spawn-result without marker nor refusal text | clean, spawned 0 | see F1 |
| J: numbered `w1-cap-refusal-NN.json` only | clean (accounted) | ✔ |
| K: unparseable spec | trips | ✔ |
| L: maxLanes 10 < waveMinLanes 32 | trips min leg | ✔ |
| M: registry 65 members > maxLanes 64 | trips registry leg | ✔ |
| N/N2/N3: spawned 65/70 > maxLanes 64 (items absent or 64) | **clean** | see F2 |
| O/Q/R: receipt in `w1/` subdir, `task-result`, raw-text marker | accounted clean | ✔ |

## CLI confinement

- `--round-cap` omitted → exit 2 ("required … a verdict without it would be fail-open"). Non-numeric/`0`/`-5`/`128x` → exit 2. `--selftest --rev` without `--round-cap` → exit 2.
- `--policy /tmp/evil-policy.json`, `/tmp/copy-policy.json` (fleet bytes copied out), `/tmp/link-policy.json` (symlink), `../fakehyaku/x.json` → all exit 2, naming the two fleet authority files. Only the two `FLEET_POLICIES` paths are accepted (`resolve()` + literal include); `…/hyaku/./ufo-wave-policy.json` resolves to the canonical path and is accepted — a different spelling of the same file, not a confinement break.
- `--policy` v2 (band 64–128) accepted; under it round-22's `maxLanes 65 > band` leg correctly disappears and only `round total 129 > cap` remains — tighten/widen rule holds (supplied band may equal a readable authority or tighten, never widen).

## Findings

1. **F2 (high): `spawned` is never compared to `maxLanes`/band.** A wave whose spec honestly declares 64 but whose receipt claims 70 spawns audits clean (cases N/N2/N3). Round-22 only trips because w2b's *spec* also says 65 — a spec lying low, or a spec without `items`, masks an over-band spawn. The round-total leg can still catch it above 128, but a 70-seat wave under a 128 cap sails.
2. **F1 (medium): a present-but-unrecognizable spawn receipt counts as `accounted`, spawned 0** (case I). `waveEvidence` returns `accounted:true` for any readable `-spawn-result.json` even when it carries neither `Spawned N` nor the refusal marker — the same silent-zero the class claims to distinguish ("0 seated and 0 unaccounted are not the same", L222). A wave whose only receipt is a non-marker failure blob (truncated JSON, different runner message) reports clean instead of unaccounted.
3. Minor: an unaccounted wave `continue`s before band/items checks, so a malformed spec + missing receipt reports only "unaccounted" — acceptable masking, noted not counted.
4. Verified clean: exact-boundary 64/128, all four break demands (exact-64 clean, exact-128 clean, items>maxLanes trips, spec-no-receipt unaccounted), exit-2 on omitted/invalid `--round-cap`, and `--policy` refused for every non-fleet path tried.

## Verdict

Claim verified on round-22 bytes, but **c2-wave-caps is falsified on honesty grounds**: the class silently passes two over-count states it advertises as caught (F1, F2). Recommendation: reject as-mechanized; needs `spawned > maxLanes`/`spawned > band` and "receipt present but unparseable → unaccounted" checks.
