# AttackHarmGates — no-harm gate check at the measured revision

- Item: run the six standing contract/freshness gates at `b444ca8e024f386124418169e8e400221524bba3` and compare with `.ufo/waves/round-16/harm-baseline.json`.
- Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin` (all commands run with that cwd).
- Measured instant: 2026-10-20 11:57:21 and 11:58:10 -0300, HEAD `b444ca8e024f386124418169e8e400221524bba3`, tracked worktree clean.
- Host: `node v24.21.0` (matches baseline `host.node`).

## Verdict

**HOLDS.** No gate newly red, no gate verdict changed, no protected path moved. The single
output delta (`check-sources`) is fully explained by the declared S020 re-open + S030–S039
addition and preserves `verdict=clean findings=0`. The only non-zero exit is the gate already
red at baseline, with byte-identical stderr.

## What I ran and what came back

Each command was executed twice (`/tmp/harmgates.imzrqi`, `/tmp/harmgates2.F1rE6l`); both runs
produced identical digests. Digests are sha256 of the full stdout/stderr captured to files.

| # | Command | Exit | stdout sha256 | stderr sha256 | vs baseline |
|---|---|---|---|---|---|
| 1 | `node scripts/check-round-contract.mjs` | 0 | `25e66498180565a95122221af203fba2a053e8cb87ca152b1ee25e077158bd61` | `e3b0c442…b855` (empty) | identical |
| 2 | `node scripts/check-user-round-contract.mjs` | 1 | `e3b0c442…b855` (empty) | `47e9ffdc4fa167e16d3635ee9aca74d30ea8f365dc571dc21b03566a3daada53` | identical (already red) |
| 3 | `node scripts/check-freshness.mjs --worktree` | 0 | `6f99a374838256d5d9ab69a0ed1214d16fe6571180b0782b5317372bd2401b9a` | `e3b0c442…b855` | identical |
| 4 | `node scripts/check-sources.mjs` | 0 | `4d3e4d632290180668a1dd04321ed0910d54a5f31f3bb159a1b4516e2d105584` | `e3b0c442…b855` | **differs** (baseline `deb8216a…2164`, same 124 bytes / 1 line) |
| 5 | `node scripts/check-sources.mjs --self-test` | 0 | `8a1efa8b30d2864dcc97e1e680be5b23ac1d8fda0f2bbe0d1ea2156a47a884a0` | `e3b0c442…b855` | identical |
| 6 | `node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json` | 0 | `afdc9fad5e09016a7e16880c9067f31273d84af93381fa09e7eb9cfbde5514ab` | `e3b0c442…b855` | identical |

Observed terminal lines:

```
ROUND_CONTRACT verdict=clean rounds=10 consequential=0
USER_ROUND_CONTRACT verdict=failed finding=round_count detail=Found 6 user rounds, expected 10
FRESHNESS_GATE verdict=clean finding=freshness_worktree matched=34 unique=34 lane=31 public=3 revision=worktree baseline=c24eaea14dfc0c4a3848742d31673db5675f9183 profile=production
SOURCES_GATE verdict=clean rows=39 tiers=A:31,B:4,C:4 status=queued:3,mined:32,rejected:4 findings=0 file=corpus/SOURCES.md
SOURCES_SELFTEST verdict=clean cases=26
ARIA_METADATA check verdict=clean findings=28 failed=0 accepted=true sidecar=corpus/evidence/round-14/aria-metadata/corrected.json input=corpus/evidence/round-14/aria-metadata/corrected.json reason=clean
```

Exit 1 occurs exactly once, on `check-user-round-contract`, and its stderr is byte-identical
to the baseline's recorded `round_count` finding (`Found 6 user rounds, expected 10`). No exit
2 (could-not-evaluate) appeared.

## Delta analysis — `check-sources` (the only changed output)

```
baseline: SOURCES_GATE verdict=clean rows=29 tiers=A:23,B:4,C:2 status=queued:3,mined:24,rejected:2 findings=0 file=corpus/SOURCES.md
HEAD:     SOURCES_GATE verdict=clean rows=39 tiers=A:31,B:4,C:4 status=queued:3,mined:32,rejected:4 findings=0 file=corpus/SOURCES.md
```

Independent count from `git show <rev>:corpus/SOURCES.md`, mapping columns by the registry
header (`| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |`):

```
e38d2599a922cb729186353830fff8e159b4fef0 rows=29 status[mined]=24 status[queued]=3 status[rejected]=2 tier[A]=23 tier[B]=4 tier[C]=2
b444ca8e024f386124418169e8e400221524bba3 rows=39 status[mined]=32 status[queued]=3 status[rejected]=4 tier[A]=31 tier[B]=4 tier[C]=4
```

The gate's own numbers are reproduced exactly. The diff accounts for every count:

- `S020` status `queued` → `mined` (tier A unchanged) plus a `used-by` pointer to the round-16 note: +1 mined.
- `S030`–`S036` (seven new tier-A rows, all `mined`) and `S037` (one new tier-A row, `queued`): +8 A, +7 mined, +1 queued.
- `S038`, `S039` (two new tier-C rows, `rejected`): +2 C, +2 rejected.

Arithmetic: rows 29+10=39; A 23+8=31; C 2+2=4; mined 24+8=32; rejected 2+2=4; queued 3+0=3.
Verdict and finding count are unchanged (`clean`, `0`); the baseline pins no digest for this
gate's stdout (`protectedPaths["check-sources"]: "pinnedPaths": "none by digest"`), so the
recorded digest was an observation, not a contract.

## Structural corroboration (why the other five are identical by construction)

Blob comparison at the two revisions (`git rev-parse <rev>:<path>`):

```
SAME  scripts/check-round-contract.mjs        SAME  corpus/evidence/fleet-round-1-freshness/pins.tsv
SAME  scripts/check-user-round-contract.mjs   SAME  .ufo/rounds/fleet-round-1-interactive-20261015/freshness.expected.json
SAME  scripts/check-freshness.mjs             SAME  corpus/evidence/pstack-20261015/baseline-census.tsv
SAME  scripts/check-sources.mjs               SAME  corpus/evidence/round-14/aria-metadata/corrected.json
SAME  scripts/check-aria-metadata.mjs         SAME  SHONEN.md
DIFF  corpus/SOURCES.md                       DIFF  SKILL.md
```

All five gate scripts (six commands, since `check-sources.mjs` is run twice), the freshness pin
table and expected manifest, the pstack census, the aria sidecar, and SHONEN.md are blob-identical
between `e38d259` and `b444ca8`; `corpus/SOURCES.md`
is the only gate input that moved, which is precisely the one gate whose output moved.
Ancestry is linear: `e38d259` (round-15 verifier spot-check) → `8f7feb3` → `b444ca8`, and
`git merge-base --is-ancestor e38d259 b444ca8` is true. A separate blob check of the nine
remaining aria-pinned inputs (round-13 `receipt.json`, `runtime-pin.json`, `manifest.json`,
`aria-loopback.spec.mjs`, `playwright.config.mjs`, the worker-0 JSON, `scripts/aria-loopback-round13.mjs`,
and round-15 `expected-fixtures.json` + `mirror-contract.json`) returned `SAME` for all nine.

Every changed path outside the round-16 evidence/draft directories is:

```
M SKILL.md          M corpus/QUALITY.md   M corpus/README.md   M corpus/SOURCES.md
A corpus/knowledge/webmcp-chromium-loopback-round-16.md
A scripts/check-measurement-binding.mjs  A scripts/selftest-measurement-binding.mjs
A scripts/webmcp-loopback-round16.mjs
```

No path in the protected set changed — the frozen lessons, both pstack/fleet baselines, the
fleet-round-1 plans/reports/continuation dirs, `scripts/check-freshness.mjs`, or `SHONEN.md`:

```
$ git diff --name-only e38d259 b444ca8 | grep -E '^(corpus/lessons/|corpus/evidence/fleet-round-1-freshness/|\.ufo/rounds/fleet-round-1-interactive-20261015/|\.ufo/reports/fleet-round-1-attempt-20261015/|\.ufo/plans/fleet-round-1-interactive-20261015|\.ufo/continuation/fleet-round-1-interactive-20261015|scripts/check-freshness\.mjs|SHONEN\.md|corpus/evidence/pstack-20261015/|reports/pstack-20261015)'
NONE
```

(An earlier draft of this check anchored the pattern after a `git diff --name-status` tab and
therefore could not match `SKILL.md`, `corpus/README.md`, or `corpus/QUALITY.md`; the corrected
`git diff --name-only` form above is what reports `NONE`, and the append-only three are listed
separately below.)

Exactly three append-only files did change, and each is a pure append (`git diff --numstat`):
`SKILL.md +50/-1`, `corpus/README.md +20/-0`, `corpus/QUALITY.md +13/-0`. The single SKILL.md
deletion is the final pre-existing line re-emitted with a terminating newline (diff marker
`\ No newline at end of file` on the removed side); no earlier line changed. This matches the
gate's own append-only rule (`check-round-contract.mjs` `checkHistory`: for every `APPEND_ONLY`
path it requires `after.subarray(0, before.length).equals(before)`), which passed.

## Liveness — identical output is a verdict, not a vacuum

Every gate ships a self-test; running them (read-only fixtures in `/tmp`) shows the comparisons
that produced the six verdicts above are live:

| Gate | Self-test result |
|---|---|
| `check-round-contract.mjs --self-test` | `ROUND_CONTRACT_SELFTEST verdict=clean cases=32 alias_checks=1`, exit 0 |
| `check-user-round-contract.mjs --self-test` | `USER_ROUND_CONTRACT_SELFTEST verdict=clean cases=42 fixtures=32 alias=1 committedCounts=6 countWitness=1 diagnosticWitness=1 reasonControls=1`, exit 0 |
| `check-freshness.mjs --self-test` | `FRESHNESS_SELFTEST verdict=clean cases=12`, exit 0 (includes `changed_bytes → content_drift`, `missing_target → target_set`, `public_file_symlink → unsafe_file`) |
| `check-sources.mjs --self-test` | `SOURCES_SELFTEST verdict=clean cases=26`, exit 0 |
| `check-aria-metadata.mjs --self-test` | all cases `result=PASS`, `ARIA_METADATA_JSON … "ok":true,"exit":0`, exit 0 |

The freshness `changed_bytes` case is the direct control: the same pin comparison that returned
`clean` here returns `content_drift` when bytes differ, so the clean verdict is meaningful.

## Baseline authenticity

The baseline was committed inside this wave (`8f7feb3` added `harm-baseline.json`), so I checked
that its recorded observations really describe `e38d259`:

- `git log -1 --format=%s e38d259` → `round-15 verifier spot-check (integrator, hyaku): non-author admit/reject`, exactly `baselineSubject`.
- `node scripts/check-freshness.mjs --witness e38d2599…` exit 0; its 34 `PIN_MATCH` lines are byte-identical to the 34 `PIN_MATCH` lines recorded in the baseline (`identical: true`), and its summary is `FRESHNESS_GATE verdict=clean finding=freshness_witness matched=34 unique=34 lane=31 public=3`.
- The baseline's `check-sources` line reports `rows=29`, a shape only the pre-wave `SOURCES.md` has; at HEAD that gate necessarily reports 39. So the baseline predates the wave's source edits rather than post-dating them.

## Residual risk and verification gaps

1. **`check-freshness` treats `SKILL.md` as prefix-grow, not exact bytes.** For that target it
   compares `current.subarray(0, original.length)` to the `c24eaea` bytes and only requires
   `current.length > original.length` (`pre-append@baseline`, `witness_append`); the digest it
   prints is the pin identity, not the live file. Identical output therefore does not by itself
   attest that nothing above the prefix changed. I checked the wave's append independently
   (`+50/-1`, deletion is the EOF newline only), so no pre-existing line was edited.
2. **The freshness target set is frozen at `c24eaea`** (`git ls-tree <baseline> -- corpus/knowledge reports SKILL.md`).
   Files added after that baseline — including this wave's `corpus/knowledge/webmcp-chromium-loopback-round-16.md` —
   are outside the pin set, so `verdict=clean` says nothing about their contents. The baseline
   documents this. The note is an addition, not an edit of a pinned file, so no pinned drift was masked.
3. **Concurrency.** During the run, `corpus/evidence/round-16/measurement-binding.json` appeared
   as an untracked file (mtime 11:57:18; its content is a `tabi-measurement-binding-v1` manifest
   and its mtime coincides with `.ufo/waves/round-16/w2/record.json` — [INFERENCE] it is the C1
   gate's orchestrator output; I did not observe the writing process). Both of my gate runs happened after
   it (`11:57:21`, `11:58:10`) and were byte-identical, so it provably does not perturb any of the
   six gates. Tracked worktree stayed clean throughout; the only untracked paths are
   `.ufo/waves/round-16/w2/` and that one file. If a sibling commits while this report is being
   read, the check must be re-run at the new HEAD.
4. **Scope.** These six gates do not exercise `scripts/check-measurement-binding.mjs`,
   `scripts/selftest-measurement-binding.mjs`, `.ufo/waves/round-16/measure.mjs`, or the WebMCP
   harness. Their correctness is attacked by other items; nothing here certifies them.
5. I did not reproduce the gates against a reconstructed `e38d259` worktree (that would require
   writing in the lane). Baseline authenticity is established indirectly as above, and output
   equivalence for five of six gates is structurally forced by identical gate scripts plus
   identical pinned inputs.

## Tooling

No tools were installed or upgraded. Node `v24.21.0` was already present and matches the
baseline's recorded host runtime.
