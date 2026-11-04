# R62Exec1 — frozen C1 evidence support

Axes: adjacency completeness; disposition conservatism; frozen-input fidelity. No production implementation or instrument changes.

## Observed results

- Frozen v21 selftest: **exit 0, 44/44, allPass true**. Includes strict-header refusal/acceptance and guarded disposable Git host fixtures. Full stdout/stderr retained.
- Frozen rebind at `1ec5eb3fc8cd17f696a7b7f03617bf69a6a5c2a4`: **exit 0**, no unresolved branch, preflight findings **0**, predicate **true**. Roster 20; map/audit 16/16; delta files 25; delta line rows 149. Sources: 31 carried keys, 119 explicit keys.
- Exact downstream v21 invocation with frozen snapshot and explicit candidate audit/delta: **exit 0, predicate true, findingCount 0, unresolvableHead 0**. This validates candidates, NOT a committed-data after-pass.
- Audit classifications: 10 unchanged, 5 stale, 1 moved. These are disclosed observations, not repairs.
- Downstream drift disclosure retained for kaidoku, kama, kotodama, souji and tameshi. Snapshot heads, not those live heads, supplied evidence.

## Adjudications

`R62Exec1/adjudications-r62.json` contains exactly the 119 control rows, each with lane, path, whole-line quote, disposition and basis. Every quote was compared verbatim with its line in Git bytes at the frozen sibling head. Per-file full bytes, SHA256/head pins and selected surrounding context are retained.

74 `no-tabi-ground`; 45 `contested-open`; zero new `overlap-declared` assertions:

| Lane | no-tabi-ground | contested-open |
|---|---:|---:|
| kagi | 2 | 2 |
| kaidoku | 0 | 37 |
| kake | 69 | 1 |
| kama | 0 | 5 |
| kengaku | 2 | 0 |
| mado | 1 | 0 |

All 37 kaidoku queue-operation hits remain contested-open, including Chromium/Playwright provisioning, screenshots, capture comparisons and related Node/CDP analysis. The split between browser operation and artifact analysis is NOT an answered overlap ruling; pending operator/L0 round59. Kake's shared burner-profile lease instructions and kagi's unresolved profile ownership remain contested. Kama's report-only DevTools census is conservatively open. Kake's remaining hits describe publisher-side vendor knowledge, offline audits, explicit tabi execution boundaries or negative crawler-observation limits; kengaku's headless-terminal is a terminal-task name; mado explicitly excludes screenshot execution.

The carried r61 adjudications were compared by exact lane/path/quote: 109 matched current rows, 10 did not. The r61 blanket `overlap-declared` labels are not inherited as rulings. Detailed comparison: `R62Exec1/carried-r61-comparison.json`. Rebind's built-in previous-delta carry remains 31 keys; 119 explicit rows take precedence. Unused old adjudications were not copied into the new file.

## Commands and exits

All commands started with cwd `/fast/scratch/hyaku/tabi-r62/R62Exec1`; Node `v26.12.0`. Exact argv/cwd/exit codes, including each pinned-context Git read, are in `R62Exec1/commands.json`. Main commands (each exit 0):

```sh
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/counters/c1-adjacency-host-v21.mjs --selftest
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/counters/rebind-r62.mjs --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --rev 1ec5eb3fc8cd17f696a7b7f03617bf69a6a5c2a4 --fleet /home/vgpnk/Projects/shokunin --snapshot /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/c1/snapshot-r62.tsv --out /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/w1/R62Exec1/candidates --scratch /fast/scratch/hyaku/tabi-r62/R62Exec1 --adjudications /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/w1/R62Exec1/adjudications-r62.json --json
node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/counters/c1-adjacency-host-v21.mjs --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --rev 1ec5eb3fc8cd17f696a7b7f03617bf69a6a5c2a4 --fleet /home/vgpnk/Projects/shokunin --snapshot /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/c1/snapshot-r62.tsv --audit /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/w1/R62Exec1/candidates/adjacency-host-audit-r62.tsv --delta /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-62/w1/R62Exec1/candidates/adjacency-host-delta-r62.tsv --json
```

## Exact pins

All six declared instrument/snapshot SHA256 values matched both worktree bytes and `git -C ... cat-file -p FREEZE:path` bytes; complete record `R62Exec1/pins.json`. Relevant exact pins:

- v21: `b845973c0f16433b05080829cf66641df303cffa09a9dc291d1773b9b9c8afa6`
- rebind: `b627cc8be99b4813b1d2578179b5b4eb80bfe20f2dab775edd530c264374f14f`
- snapshot: `1e47eb02b0387393f87c501d16a196a2802ed6d75d8906d23b36970f23dedae4`
- carried adjudications input: `bac2f60d6086eadfdcc0fa2f04bd3634e08051cb38d3e10b86c2fbb23b708f46`
- unresolved control input: `a4bb5ddc6c21057854931118e1358263f3bef4e9909fb8a155a17fe33a5e0ab4`
- generated adjudications: `e4bcfdf9730cf22a4e069527e4b4fe694ddc76fa9132a25802182f55d035a01c`
- candidate audit: `329c2edb735de9409817c8bfad284ca66f44048d3d0a170bea6e0fb53d17251e`
- candidate delta: `d6108b3526dfce682705f3a2fb477fd648fea247e687576df90b6f9f5b85bee2`

## Retained evidence and boundaries

All artifacts below are under `.ufo/waves/round-62/w1/R62Exec1/`:

- `v21-selftest.stdout`, `.stderr`; `rebind.stdout`, `.stderr`; `v21-downstream.stdout`, `.stderr`.
- `candidates/adjacency-host-audit-r62.tsv`, `adjacency-host-delta-r62.tsv`, `rebind-snapshot.json`.
- `adjudications-r62.json`, `carried-r61-comparison.json`, `pinned-contexts.txt`, `context-input-pins.json`, `context-0.stdout` through `context-7.stdout` with paired stderr, `input-pins.json`, `pins.json`, `commands.json`, `cleanup.json`.

No browser was started, no packages installed, no lane/fleet VCS mutated, no production copies made. Only assigned checks ran. Own scratch removed after durable receipts were written; frozen selftest removes its own guarded mkdtemp fixture and its shared base was not deleted. No code symbols were changed; LSP refactoring was inapplicable and no LSP tool is exposed in this seat.

Risks: vocabulary compliance and zero findings do not settle substantive browser ownership; the 45 contested rows remain open. Reviewer independently reported frozen-meter delta-duplicate acceptance; this seat did not reproduce or repair it. Outside admission and final committed-data validation remain integration-owner responsibilities, not passed checks here. Frozen no-work exit3/119 and v20 baseline exit1 are retained contract controls, not relabeled passes.

Self-evaluation (advisory, not judging the claim): accuracy 4/5 (candidate green is not committed-data green); completeness 4/5 (all assigned checks/119 rows delivered; substantive operator rulings deliberately absent); clarity 4/5 (verbose exact commands retained for reproducibility); actionability 4/5 (candidate paths and digests supplied; parent owns integration); conciseness 4/5 (per-row pin/basis repetition favors auditability). Overall 4.0. Improvements: obtain operator rulings without retroactively changing pins; have the parent run the committed-data after-pass. The explicit limitations should match the user's expected evidence boundary.
