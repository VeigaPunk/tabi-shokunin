# R90Exec3 — C2 before-state and C1 do-nothing controls

- Seat: R90Exec3 (leaf executor, w1)
- Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
- Base: `a9f1da0828856ccd4987d1ee07df857fad044b15`
- Scratch: `/fast/scratch/hyaku/tabi-r90/R90Exec3` (created with `mkdir -p`, used, deleted before yield)
- Report: `.ufo/waves/round-90/w1/R90Exec3.md`

## Inputs / pins

`sha256sum -c .ufo/waves/round-90/freeze.txt` in the lane: all 8 files `OK`, exit 0
(driver `ac5a7a5e…`, counter `1d3dfb0b…`, battery `06c67275…`, kill power `686cb665…`,
selftest runner `0da4d405…`, drift gate `32a3595d…`, probes `cb4d260e…` / `ed44bd6f…`).
The instruments exercised below are therefore the frozen bytes.

Scored-receipt identity pins used for the C1 controls:
nonce `tabi-r90-l1-e573334c78fa`, driver sha256
`ac5a7a5e56537acc8f61058059294c5f343b236de9b52b8d691995f1e6c49c8d`, fixture sha256
`5fb1f0f7806c8f099976078f3f03c9e08d6814346cc29fdccd022f4037bd7ac8`.

## 1. C2 BEFORE — drift gate on a base `a9f1da08` worktree

```
git -C <lane> worktree add --detach /fast/scratch/hyaku/tabi-r90/R90Exec3/base a9f1da08
git -C /fast/scratch/hyaku/tabi-r90/R90Exec3/base rev-parse --show-toplevel  # -> that fixture dir
git -C /fast/scratch/hyaku/tabi-r90/R90Exec3/base rev-parse HEAD             # -> a9f1da0828856ccd4987d1ee07df857fad044b15
git -C /fast/scratch/hyaku/tabi-r90/R90Exec3/base status --porcelain          # -> empty (clean)
node <lane>/scripts/check-record-drift-round90.mjs \
  --lane /fast/scratch/hyaku/tabi-r90/R90Exec3/base --json
```

Exit **1**. `claims 8`, `mismatches 7`.

Failed ids (7), with the statement detail that carried each red:

| id | ok | detail |
|---|---|---|
| r89-claim-sweep | false | `amendment=missing correctionNamed=false` |
| r89-narrowing-pointers | false | `corrected=0 pointsReal=false sections=true live=[]` |
| r89-census-attribution | false | `censusOk=true says224=false r88attr=false quote=false words=-1` |
| r89-leak-enforcement | false | `removes=false asserts=false named=false` |
| r89-revision-naming | false | `namesWorktreeAndOrder=false` |
| gate-selftest | false | `wired=false counter=false battery=false killpower=false drift=false` |
| quality161-sweep | false | `cites=false sweeps=true` |

`scorecard-tallies` is **green**: `ok true`, `detail bad=[] tens=2 sanctioned=2 stray=[]`.

Intended-reason check: every red is a missing record/instrument at base, not an unreadable
file — `sections=true` (both named sections are present and readable), `sweeps=true` (the
QUALITY section is read), `censusOk=true` (census parses), and the tally statement reads
the SCORECARD successfully. The seven reds are the r90 corrections that do not exist at
base; the tally statement is already satisfied at base.

Reproduction check: the output is **byte-identical** to the scored before-run
`.ufo/waves/round-90/scored/drift-before.json`
(`sha256 0744efd4dded09c9484e91c352d639037007756098039bfc2690ad3c0b38dd89`; `cmp` exit 0).

Worktree removed as instructed:
`git -C <lane> worktree remove --force /fast/scratch/hyaku/tabi-r90/R90Exec3/base` -> exit 0;
the base path is gone and `git worktree list` no longer lists it.

## 2. C1 do-nothing controls

### 2a. r89 scored receipt under the r90 counter (self-consistent r89 identity pins)

```
node <lane>/scripts/check-showpicker-round90.mjs \
  --lane <lane> \
  --receipt corpus/evidence/round89/chromium-showpicker/receipt.json \
  --expect-driver-sha256 76b69b4f691d24c8c94a92897e33635d2386b9191f5aaa66640515dc998bd2d0 \
  --expect-nonce tabi-r89-l1-7bde5e6c2f2d \
  --expect-fixture-sha256 69acad5754e0effb480771dd68197c26815bf0aabd4e76afe63ce09ca462c5ed \
  --prior-set .ufo/waves/round-90/controls/c1/prior-set.txt --json
```

Exit **1**, `verdict findings`, `checkCount 107`. 32 finding ids:

- identity/plan: `schema`, `nonce-shape`, `plan-calls`
- 21 `leg-*` findings (the five `sp84-*` answer legs, five `sp86-*`, four `sp87-*`,
  three `sp88-*`, and the four `sp89-accept-domread-*` legs)
- 7 law ids: `webkitdirectory-answer-law`, `accept-answer-law`, `multiple-mode-law`,
  `accept-mime-answer-law`, `accept-grammar-law`, `accept-domread-law`,
  `second-chooser-answer-law`
- `prior-set-complete` (the r90 scored receipt sits in the walked round-90 evidence
  tree and is neither the receipt under test nor a prior here)

The two intended reds:

- `schema`: `schema tabi-chrome-cdp-showpicker-r89` (r89 receipt under the r90 schema).
- `plan-calls`: on **each of the four domread legs** the r89 send log carries zero
  distinct settle evaluates — detail fragments `sp89-accept-domread-text:settle-eval 0`,
  `sp89-accept-domread-text:settle-order`, and a sequence whose `want` inserts
  `Runtime.evaluate` (`window.__inputs(true)`) after the settle `window.__state()` and
  before the dismiss; the same three fragments repeat for `-png`, `-multimime`,
  `-whitespace`. The finding also lists `answer-files` on all answer/domread legs because
  the r89 page-answer filenames are `tabi-r89-*` while the r90 plan names `tabi-r90-*`.

The extra ids are generation-content drift (r89 filenames/identity, r90 receipt in the
walked tree), not a failure of the control: the control is red for the intended reasons
(schema is r89; the settle call is absent on all four domread legs).

### 2b. Runner-exact nowork-control (r90 identity pins)

The gate runner's `nowork-control` gate scores the same r89 receipt against the r90
pins. Reproduced with:

```
node <lane>/scripts/check-showpicker-round90.mjs \
  --lane <lane> \
  --receipt <lane>/corpus/evidence/round89/chromium-showpicker/receipt.json \
  --expect-driver-sha256 ac5a7a5e56537acc8f61058059294c5f343b236de9b52b8d691995f1e6c49c8d \
  --expect-nonce tabi-r90-l1-e573334c78fa \
  --expect-fixture-sha256 5fb1f0f7806c8f099976078f3f03c9e08d6814346cc29fdccd022f4037bd7ac8 \
  --prior-set .ufo/waves/round-90/controls/c1/prior-set.txt --json
```

Exit **1**, `verdict findings`, `checkCount 107`, 35 finding ids. `schema` and
`plan-calls` are both present (the runner accepts this control as `exit 1 && ids include
schema && ids.length >= 5`). Relative to 2a the only extra identity ids are `nonce-expected`,
`driver-pin`, and `fixture-hash` (the r89 receipt scored against r90 identity pins);
`nonce-shape` is already present in 2a. The 21 `leg-*`, 7 law ids and
`prior-set-complete` are unchanged.

### 2c. Nonexistent receipt

```
node <lane>/scripts/check-showpicker-round90.mjs \
  --lane <lane> \
  --receipt .ufo/waves/round-90/controls/c1/noreceipt.txt \
  --expect-driver-sha256 ac5a7a5e56537acc8f61058059294c5f343b236de9b52b8d691995f1e6c49c8d \
  --expect-nonce tabi-r90-l1-e573334c78fa \
  --expect-fixture-sha256 5fb1f0f7806c8f099976078f3f03c9e08d6814346cc29fdccd022f4037bd7ac8 \
  --prior-set .ufo/waves/round-90/controls/c1/prior-set.txt --json
```

Exit **2**, `verdict unreadable`, one finding: `receipt-unreadable`
(`ENOENT: no such file or directory, open '.../.ufo/waves/round-90/controls/c1/noreceipt.txt'`).
This is the path named in the frozen C1 `doNothingControl`; it is absent by design.

## 3. Drift gate's own `--selftest` (isolated)

```
HYAKU_SCRATCH=/fast/scratch/hyaku/tabi-r90/R90Exec3 \
  node <lane>/scripts/check-record-drift-round90.mjs --selftest --lane <lane> --json
```

Outer process exit **0**. Output: `ok true`, `cases 8`, `fixtureAbsent true`,
`decoyPresent true`, inner fixture-run `exit 1`.

Eight failed ids (exactly the eight statements):

```
r89-claim-sweep
r89-narrowing-pointers
r89-census-attribution
r89-leak-enforcement
r89-revision-naming
gate-selftest
quality161-sweep
scorecard-tallies
```

Intended-reason witnesses carried in the output:

- `sweep`: `amendment=missing correctionNamed=false`
- `pointers`: `corrected=0 pointsReal=false sections=false live=["corpus/lessons/round-89.md"]`
- `tallies`: `bad=["round-44-no-9","round-44-has-10"] tens=2 sanctioned=1 stray=[2]`

The fixture tree was removed by the process that created it (`fixtureAbsent true`) while
the planted decoy still existed (`decoyPresent true`); the decoy was then removed too.

Operability note (not a claim falsifier): the script's comment says `--selftest` is
standalone and takes no `--lane`, but the usage guard runs before the selftest branch, so a
bare `--selftest --json` exits 2 with `--lane must be an absolute path`. The wired runner
(`scripts/selftest-r90-gates.mjs`, gate `gate-selftest`) passes `--lane <lane>` and the
mode exits 0 as above. Only the bare-CLI documentation is off.

## Verdict on the do-nothing controls

- r89 receipt under the r90 counter: exit 1, red for the intended reasons — `schema` (r89
  schema) and `plan-calls` (no distinct `window.__inputs(true)` settle after
  `window.__state()` on any of the four domread legs). Reproduced under both pin sets.
- Nonexistent receipt: exit 2, `receipt-unreadable`. Intended reason.
- Drift `--selftest`: isolated, exit 0 outer, `fixtureAbsent true`, `decoyPresent true`,
  eight intended reds. Intended reason.
- C2 before-state: exit 1, 8 claims / 7 mismatches, `scorecard-tallies` green, byte-identical
  to the scored before artifact.

No control was green for a readable-file accident; each red carries its mechanism in the
statement detail.

## Retained evidence (under `.ufo/waves/round-90/w1/`)

| file | sha256 | content |
|---|---|---|
| `R90Exec3-drift-before.json` | `0744efd4dded09c9484e91c352d639037007756098039bfc2690ad3c0b38dd89` | base worktree drift run, exit 1 |
| `R90Exec3-drift-selftest.json` | `46fc7b85bd79bd29d48bc3247adb5e8ecd4522fd827603ef4e5478d37111af57` | drift `--selftest` output |
| `R90Exec3-nowork-r89-selfpins.json` | `eecb2a100acfaad2aadb2f9b5ba69c968cb577fa32991f5e3aca6fd55a157a51` | r89 receipt, r89 pins, exit 1 |
| `R90Exec3-nowork-r89-r90pins.json` | `ad58d04fb349cac68da6d278fa0b9e94a61e9fccdae107dc5e251792f3e661b2` | runner-exact nowork control, exit 1 |
| `R90Exec3-noreceipt.json` | `3bfeb3f4d33ab495565875ef3916bdc6e7f209f40593e5ed3476990f5badfd12` | nonexistent receipt, exit 2 |

The drift-before receipt is byte-identical to the lane's
`.ufo/waves/round-90/scored/drift-before.json` (same sha256).

## Cleanup / bounds

- Worktree `.../R90Exec3/base` removed (`--force`, exit 0); path gone.
- Scratch root `/fast/scratch/hyaku/tabi-r90/R90Exec3` deleted before yield; no `/tmp` use.
- Lane writes: this report plus the five receipt copies above only. No commits, no pushes,
  no git/jj mutation beyond the assigned `worktree add`/`worktree remove`.
- No tool installs or upgrades were needed.

## Risks / blockers

None blocking. Notes recorded: (i) the bare `--selftest` needs `--lane` despite its usage
comment (runner supplies it); (ii) the r89-under-r90 controls carry expected
generation-drift findings beyond `schema`/`plan-calls`, which the frozen claim's wording
("findings incl. `schema` and `plan-calls`") already allows and the runner's gate condition
(exit 1, schema present, >=5 findings) accommodates.
