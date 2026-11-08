# R87Exec2 — leg (b) re-measure from the frozen bytes

Seat: executor, round 87 wave w1. Scope: re-run the negative battery, the kill power and the gate
selftest against the frozen instruments and the scored receipt, then compare the three outputs
byte-for-byte with `.ufo/waves/round-87/scored/*.json`. Nothing was fixed, no lane record was
edited, and no file under `corpus/evidence/round87` or `.ufo/waves/round-87/scored/` was written.
Axis: operability.

## State the measurement is anchored to

- Lane `tabi-shokunin`, HEAD `24765dd95b5ef01ffc24a19ae5f293315216f4e5` (base 24765dd9), 19
  working-tree entries at measurement time. The round-87 instruments and evidence are untracked
  working-tree bytes (`git cat-file -e 24765dd9:scripts/selftest-r87-gates.mjs` → absent), so
  "committed bytes" here means the frozen on-disk bytes validated against `freeze.txt`.
- `freeze.txt` sha256 `b1d06cf8db577d90103adf55348157e48546e8ad7937bcbb5164f8aa86ef6644` (D4).
- The wave was live while this seat ran: between my first read and the measured run the L1
  published D4 — `scripts/selftest-r87-gates.mjs` was rewritten from `3e41bd2e…` (D3; its receipt
  path named `corpus/evidence/round86/…`) to `4346700a…` (D4; `corpus/evidence/round87/…`),
  `freeze.txt` was re-pinned, `claims.json` was updated to D4, and `scored/selftest.json` was
  replaced. Every run below was hashed immediately before and after and the bytes did not move
  during the run.

| instrument | sha256 (measured) | freeze.txt | claims.json |
|---|---|---|---|
| `scripts/chrome-cdp-showpicker-round87.mjs` | `7c54e786d78d455b955e822deb4bf0419b85c4859c5287c27380d6b568389e5f` | match | match |
| `scripts/check-showpicker-r87.mjs` | `6a2bb03b63feb4835d9bf61b4b8970a27b81ac266e2e1e4cc130cd620bf9b181` | match | match |
| `scripts/negatives-showpicker-r87.mjs` | `9883807a5a60e20fb18cd28e4599c2e769c568a20f67e1e099527b4b652d22a5` | match | match |
| `scripts/kill-power-r87.mjs` | `c95b5305645e20e3b9d0e35bd3bbed4282caaffaf7ea39f8bb07c12597e002c4` | match | match |
| `scripts/selftest-r87-gates.mjs` | `4346700a85fef7cb96c65ce4b86ea46ad3194860529c99443e987e2014c8b541` | match (D4) | match (D4) |
| `scripts/check-record-drift-r87.mjs` | `603fb5874bf3743259a62209d9b41c023ccb78619239564e7f2a8a9e3c4397f7` | match | match |

Receipt identity: `corpus/evidence/round87/chromium-showpicker/receipt.json` sha256
`5d38d03703f717877376217d51df44ffb8ab2f47c93031e46717207c6c15b4ef`; embedded fixture sha256
`10e444f7fb840b6e132b4570794d3a0ed6f5db0781ca490a986685505e8d94c4`; driver pin
`7c54e786…89e5f`; nonce `tabi-r87-l1-3dd4b0802d67`; 34 legs, `failures: []`, 4 new sp87 legs
(`sp87-accept-audio-png`, `sp87-accept-video-text`, `sp87-accept-multimime-text`,
`sp87-accept-whitespace-png`). Prior set: 2 receipts, `prior-set.txt` sha256
`cb28090747882c88c2b97702ba4fa2c96c74f7d94dafc6925d32fd4b2dbaa01d` (as reported by the counter).
Host: node v24.21.0, Chromium 155.0.8059.84 (from the receipt). cwd for every command:
`/fast/scratch/hyaku/tabi-r87/R87Exec2`; all `--lane`/`--real`/`--prior-set`/`--work` absolute.

## Commands run (verbatim, `--json`)

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/negatives-showpicker-r87.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --real /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round87/chromium-showpicker/receipt.json \
  --expect-driver-sha256 7c54e786d78d455b955e822deb4bf0419b85c4859c5287c27380d6b568389e5f \
  --expect-nonce tabi-r87-l1-3dd4b0802d67 \
  --expect-fixture-sha256 10e444f7fb840b6e132b4570794d3a0ed6f5db0781ca490a986685505e8d94c4 \
  --prior-set /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-87/controls/c1/prior-set.txt \
  --work /fast/scratch/hyaku/tabi-r87/R87Exec2/battery --json

node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/kill-power-r87.mjs ...same args... \
  --work /fast/scratch/hyaku/tabi-r87/R87Exec2/killpower --json

node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/selftest-r87-gates.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --work /fast/scratch/hyaku/tabi-r87/R87Exec2/selftest --json
```

## 1. Negative battery — exit 0

```json
{"schema":"tabi-r87-battery","cases":209,"failed":0,
 "coverage":{"declared":99,"covered":99,"uncovered":[],"unknown":[]},"results":[]}
```

- cases **209**, failed **0**, coverage declared **99** / covered **99** / uncovered **[]** /
  unknown **[]**; wall 11.7 s (user 21.3 s).
- Byte-for-byte vs `scored/battery-a.json`: **identical**, both sha256
  `d405d0dfc31defd4061b9ed414c27d6a9fcc0b5f8c7800560ce6ea3ed4dfa220` (168 bytes).
- The 4 new legs are exercised: per-leg state mutations at `scripts/negatives-showpicker-r87.mjs:164-167`
  and `accept-grammar-law` refusal cases at lines 296-298 (`…-r87-video`, `…-r87-multimime`,
  `…-r87-whitespace`); the counter's `checks` block declares `leg-sp87-accept-*` (4) and
  `accept-grammar-law`.

## 2. Kill power — exit 0

```json
{"schema":"tabi-r87-kill-power","mutants":66,"killed":66,"survived":0,"crashed":0,
 "survivorsList":[],"unapplied":[],"results":[66 entries]}
```

- mutants **66**, killed **66**, survived **0**, crashed **0**, unapplied **[]**, survivorsList
  **[]**; wall 138.3 s (8-way concurrency; user 41 m).
- New-leg-relevant mutants and their observed `failed` counts: `accept-grammar-accept-any` 5,
  `accept-grammar-state-dropped` 2, `accept-grammar-bytes-dropped` 1, `leg-shape-seq-dropped` 8,
  `leg-order-any` 1, `plan-frozen-any` 1, `leg-records-keys-open` 1, `search-leg-law-skip` 8,
  `text-leg-law-skip` 8.
- Byte-for-byte vs `scored/killpower-a.json`: **differs** (mine `008b3342…da5de`, 7062 bytes;
  scored `5c6f8011…e2bc1`, 7062 bytes; first difference at byte 171, line 11). The difference is
  **array ordering only**: normalising `results` by mutant name makes the two documents equal, and
  a per-mutant map comparison over all 66 entries reports **0 per-mutant differences** (same
  outcome, same `failed` count, same `first`). `kill-power-r87.mjs` pushes results in
  worker-completion order under `CONCURRENCY = 8`, so the array is scheduler-dependent; the counts
  and every outcome are deterministic. See Finding F1.

## 3. Gate selftest — exit 0, 9/9 green

```json
{"schema":"tabi-r87-selftest","clean":true,"cases":9,"failed":[],"results":[9 gates]}
```

| gate | ok | detail |
|---|---|---|
| pins-match-freeze | true | `files whose sha256 differs from freeze.txt: []` |
| counter-clean | true | `exit 0 {"verdict":"clean","checks":99,"findings":[]}` |
| battery | true | `exit 0 {"cases":209,"failed":0,"coverage":{"declared":99,"covered":99,"uncovered":[],"unknown":[]}}` |
| kill-power | true | `exit 0 {"mutants":66,"killed":66,"survived":0,"crashed":0,"survivors":[]}` |
| nowork-control | true | `exit 1`, 48 finding ids incl. `schema` (round-85 receipt under D4 pins) |
| tree-exempt-path-refused | true | `exit 2` usage `tree-exempt-path-refused: the exemption interface is content-bound; pass --tree-exempt-sha256 <hex>` |
| tree-exempt-unmatched-refused | true | `exit 1` findings `["prior-set-unmatched-exempt"]` |
| record-drift | true | `exit 0 {"claims":5,"mismatches":0,"failed":[]}` |
| capability-status | true | `exit 0 {"rows":22,"claimed":21,"provisional":1,"mismatches":0}` |

- Selftest sha256 before and after the run: `4346700a…8b541` (unchanged); `freeze.txt` unchanged.
- Byte-for-byte vs `scored/selftest.json`: **identical**, both sha256
  `9215274ece941189f63048521049bd5ad92aa467d21e270b4636ace90853fbd4` (2824 bytes). My run is an
  independent reproduction of the D4 capture (the selftest output contains no clock/path
  material, so a re-run is byte-stable).

## 4. Extra exact checks (same frozen bytes, outside the three named commands)

- Counter on the scored receipt: exit 0, `verdict clean`, `checkCount 99`, `findings []`,
  `priorSet 2`; sha256 `72efc95d65f7340e8f55afd4115fcccaaa94dee430c3a7827151bd4fa4ffb192` —
  byte-identical to `scored/counter-a.json`. Legs `leg-sp87-accept-audio-png`,
  `leg-sp87-accept-video-text`, `leg-sp87-accept-multimime-text`, `leg-sp87-accept-whitespace-png`
  and `accept-grammar-law` are all `true`.
- Record drift: exit 0, claims 5, mismatches 0; sha256
  `5c835a10e4c7c547995e5c8b22ae24a635b0b1139144765695d9043c5d33c375` — byte-identical to
  `scored/drift-a.json`.

## Leg (b) verdict

**PASS.** From the D4 frozen bytes and the D3 scored receipt: battery exit 0 with 0 failed and
99/99 declared checks covered; kill power exit 0 with 0 survivors, 0 crashed, 0 unapplied (66/66
killed); selftest exit 0, clean `true`, 9/9 gates. No mismatch in any measured count or outcome.

## Findings

- **F1 — `scored/killpower-a.json` is not byte-reproducible (ordering only; no outcome change).**
  Re-running the frozen `kill-power-r87.mjs` produces the same 66 mutants with the same
  outcome/`failed`/`first` per mutant but a different `results` order (8 concurrent workers push on
  completion). The assignment's byte-for-byte comparison therefore fails on this one artifact even
  though the k-killed/s-survived/c-crashed/unapplied claims are identical. Anyone repeating this
  measurement should compare the per-mutant map, not the raw bytes. The instrument is frozen; this
  is reported, not amended.
- **F2 — the scored selftest artifact was replaced mid-wave (final state consistent).** At 07:15:56
  `scored/selftest.json` (7737 bytes) was the D3 red capture: `clean:false`, `failed:
  ["counter-clean","battery"]`, with `counter-clean` at `checks 95` and `battery` at `declared 95 /
  covered 0` — i.e. it ran the D3 selftest whose receipt path named the round-86 receipt. At
  07:18:56 it was replaced by the 2824-byte D4 green capture, which my independent run reproduced
  byte-for-byte. The final state is coherent (D4 `freeze.txt` `b1d06cf8…`, `claims.json` D4 pins
  incl. selftest `4346700a…`, plan §Re-freeze D4); the note is for any reader diffing mtimes or
  citing the D3 artifact. No defect is claimed against the final state.
- **F3 — one selftest gate executes an instrument outside the freeze pin table (limit, not a
  failure).** `capability-status` runs `scripts/check-capability-status.mjs`, which is not among
  the six files `freeze.txt` pins and which the selftest does not hash-assert; its bytes are fixed
  only by HEAD (`24765dd9`). The other eight gates run only pinned instruments (`selftest`,
  `check-showpicker-r87`, `negatives-showpicker-r87`, `kill-power-r87`, `check-record-drift-r87`,
  plus the driver pin inside the counter). Recorded as a coverage limit of "selftest green".

## Retained evidence

Hashes of the three named outputs (full JSON quoted above; the bodies are byte-identical to the
scored copies except the kill-power ordering):

| output | sha256 | vs scored |
|---|---|---|
| battery | `d405d0dfc31defd4061b9ed414c27d6a9fcc0b5f8c7800560ce6ea3ed4dfa220` | identical |
| kill power | `008b334282c7a95c3df0220aa11316412c2e3bc7004da7a3de0eec3cc69da5de` | order-only diff |
| selftest | `9215274ece941189f63048521049bd5ad92aa467d21e270b4636ace90853fbd4` | identical |
| counter (extra) | `72efc95d65f7340e8f55afd4115fcccaaa94dee430c3a7827151bd4fa4ffb192` | identical |
| record drift (extra) | `5c835a10e4c7c547995e5c8b22ae24a635b0b1139144765695d9043c5d33c375` | identical |

The battery and kill-power work directories (mirror lane + per-mutant counter copies) were created
only under `/fast/scratch/hyaku/tabi-r87/R87Exec2/` and removed before yielding.

## Files changed

- This report only: `.ufo/waves/round-87/w1/R87Exec2.md`. No lane record, script, fixture,
  `corpus/evidence/round87` byte, `.ufo/waves/round-87/scored` byte, fleet-root file, or
  `~/.local/bin` entry was written; no git/jj mutation was issued (read-only `git rev-parse`,
  `git status`, `git cat-file`, `git show` only). No build, lint or format was run.

## Tools

No install or upgrade. node v24.21.0 and git were already present (existing host binaries).

## Blockers

None.
