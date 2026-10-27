# MutD7Variants — tabi round 39 w1 — v2 sentence-mutation probe on claims fixtures

- Seat: MutD7Variants (mutation-tester, leaf). Scratch: `/fast/scratch/hyaku/tabi-r39/MutD7Variants/` (removed before yield).
- REV under test: `1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4` (lane branch tip at run time; clone HEAD verified equal).
- Instrument: `.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs`, sha256 `eefc8997f9952a4f2fe9cdef0da3929cb46d14b54bc5d98b379826aa32058c7c` — equals `frozenDigests` entry in claims.json and the blob at REV. Frozen bytes were run, from the clone.
- Pristine claims bytes: `git show REV:.ufo/waves/round-39/claims.json`, sha256 `ed88855a29ed9054ef6dced6f63d32c62eaa292706394b220b6d426e7fde89b6` (identical to the worktree claims.json).

## Mutants (exactly one point each; substitution occurrence asserted == 1 on the whole file)

| leg | single-point delta (claims[1].predicate) | sha256 | size | first diff byte |
|---|---|---|---|---|
| pristine | none | `ed88855a29ed9054ef6dced6f63d32c62eaa292706394b220b6d426e7fde89b6` | 5030 | — |
| m1-punct | `D1 stale-line-present AND` → `D1 stale_line_present AND` (hyphen→underscore) | `3f5591d47913bd7823bf376f9011e80e430bcedf53c00367683c871ae178725a` | 5030 | 2836 |
| m2-ws | `hash present and ancestor` → `hash present  and ancestor` (one inserted space) | `0858b6e1b67281a54eb66e4ffcf78b71fdded5fdb13faf3c5228c29319587053` | 5031 | 3022 |
| m3-case | `AND the round-39 claims predicate is byte-identical` → `aND the …` (A→a) | `a8465e0b834ea136500868eec4b8ce76d4bc9410cb96569ba60940b7b410f7fa` | 5030 | 3459 |
| m4-num | `re-derived seats == 34 AND` → `re-derived seats == 35 AND` (4→5) | `9cb2830cfc5bb3f7b403f62df450824be58d5bd4a22b038240f63c37f515ee9d` | 5030 | 2910 |
| m5-c1pred (supplementary) | claims[0] (C1 predicate) `first-shot sha256` → `sha257` | `5bfbcf085f8c1069e03cabaae353cc708f2ef840ad22959fc3ce6408db174db7` | 5030 | — |

## Commands (cwd scratch; S=scratch, REV above)

```
git clone --no-hardlinks /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone
git -C $S/clone show $REV:.ufo/waves/round-39/claims.json > $S/claims-at-rev.json
node $S/clone/.ufo/waves/round-39/counters/c2-routed-defects-v2.mjs \
  --rev $REV --repo $S/clone --claims $S/fixtures/<fixture>.json --json \
  > $S/out/<leg>.json 2> $S/out/<leg>.stderr; echo $? > $S/out/<leg>.exit
# same invocation without --json captured to $S/out/<leg>.txt (human FINDING lines)
```

## Observed results

| leg | exit | d7.sentenceMatch | findings |
|---|---|---|---|
| pristine-pre | 1 | true | d5-receipt, d6-file |
| m1-punct | 1 | **false** | d5-receipt, d6-file, **d7-sentence-mismatch** |
| m2-ws | 1 | **false** | d5-receipt, d6-file, **d7-sentence-mismatch** |
| m3-case | 1 | **false** | d5-receipt, d6-file, **d7-sentence-mismatch** |
| m4-num | 1 | **false** | d5-receipt, d6-file, **d7-sentence-mismatch** |
| m5-c1pred | 1 | true | d5-receipt, d6-file (no d7) |
| pristine-restored | 1 | true | d5-receipt, d6-file (identical to pristine-pre; fixture sha re-verified `ed88855a…`) |

Exact human output, m1-punct (`out/m1-punct.txt`):

```
FINDING d5-receipt .ufo/waves/round-39/measure/census-end.txt absent at REV
FINDING d6-file .ufo/waves/round-39/measure/numstat-at-1ace2fde.txt absent at REV
FINDING d7-sentence-mismatch claims[1].predicate is not byte-identical to the counter sentence (mutated-sentence control must be refused)
C2_ROUTED_DEFECTS_V2 predicate=not-met rev=1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4 findings=3 seats=34 tally=23/11 census=undefined d7=false
txt-exit=1
```

All four enumerated mutants: `d7-sentence-mismatch` emitted, exit 1 (nonzero). m2/m3/m4 text identical to m1 except the fixture sha line.

## Controls and verdict reasoning

- Pristine baseline: no d7 finding; `d7=true`. The d7 leg of the detector passes on frozen bytes, so mutant verdicts are killed, not inconclusive.
- The exit=1 on pristine legs comes from `d5-receipt`/`d6-file` (census + `numstat-at-1ace2fde.txt` receipts absent at this tip REV) — identical across every leg, independent of the claims bytes mutated here. The discriminating leg (d7) is the only leg that differs between control and mutant in all four probes.
- Restoration: post-run pristine fixture sha256 re-verified `ed88855a…`; restored run reproduces pristine-pre exactly (same findings, d7=true).
- m5 (supplementary, beyond the enumerated item): a single-point mutation in claims[0] (C1 predicate) does NOT trip d7 — D7 binds `claims[1].predicate` only, no index confusion, no d7 bypass in the other direction.
- No lane files were modified; all writes were scratch + this seat dir. Scratch deleted before yield.

## Evidence

- `fixtures/` pristine + 4 mutants + m5 + `manifest.json` (hashes, deltas, byte offsets)
- `out/` per-leg `.json` (counter JSON), `.txt` (FINDING lines + exit + fixture sha), `.exit`, `.stderr` (all empty)
- `run.log` exact commands and all human outputs; `hashes.txt`

VERDICT ok — all four enumerated mutants (punctuation, whitespace, case, numeral) refused by the frozen v2 counter with d7-sentence-mismatch and nonzero exit; pristine/restored controls clean on the d7 leg
