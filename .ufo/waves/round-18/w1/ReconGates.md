VERDICT: ISSUES

Scope: rules in `scripts/check-round-contract.mjs` (round gate), `scripts/check-user-round-contract.mjs`
(user gate), `scripts/check-sources.mjs` (sources gate), `scripts/check-measurement-binding.mjs`
(binding gate), plus `scripts/check-freshness.mjs` where it is the only gate that constrains a named
surface. Read at lane tip `2bff864fdfee684ddbcd066cc8e735adaba2735c` (B). Gate digests at B:
`check-round-contract.mjs` `1579a794d9b504ff4de1f9039d5498f97706546945d7980087a3df95a6e91828`,
`check-user-round-contract.mjs` `568c0421906278fe2d0ba0094c4bc48a5ae867bd683b1c5dfeabffe74585f273`,
`check-sources.mjs` `afd047874a1aa136efc252290bef8c76bb90d85f405d1ecf593e9d407125df77`,
`check-measurement-binding.mjs` `388c2b4987bbb9f39f172cd40ca392b03bc9c869c1682b77576b0b986c14af74`,
`check-freshness.mjs` `93d196377d0553e0d94712a1e2aac099b96b0539d932fda85078fc52df96930b`.

Short answer: no planned round-18 file turns any of the 20 gates red **as committed by the plan**,
but three integration shapes fail if done naively (SOURCES row placement, duplicate source URLs,
lesson amended after its add commit), and the byte-frozen round-17 binding manifest goes red
(`counted_input_changed claim=C2`) on the two shared-registry appends the plan mandates. All 20-gate
harm entries except `check-user-round-contract-production` (already red, `round_count`) were clean at
B; the round-18 additions do not touch the inputs of the other 19.

## 1. Which revision each gate reads (determines when a red appears)

| Gate | Reads | Evidence |
|---|---|---|
| round gate `check()` | committed **lane tip** (`symbolic-ref -q HEAD`, else `refs/heads/master`), resolved once | `scripts/check-round-contract.mjs:648`, tip helper comment/function at `:107-126` |
| user gate `check()` | committed lane tip; pstack drift is `git diff --name-status PSTACK_PIN..tip` | `scripts/check-user-round-contract.mjs:391-418`, `:407-408`, `:77-87` |
| sources gate | **worktree** `corpus/SOURCES.md` (no git read) | `scripts/check-sources.mjs:93` (root default), `:138-177` (`registryPath`/`readRegistry`), `:533-545` (`run`) |
| binding gate | `--at` default = lane tip; per-claim `git diff measuredRevision..at -- countedInputs counter` | `scripts/check-measurement-binding.mjs:24-33`, `:426-432`, `:565-615` |
| freshness `--worktree` | **worktree** `corpus/knowledge/`, `reports/`, `SKILL.md`, plus host public files | `scripts/check-freshness.mjs:56-113`, target set `:78-81` |

The 20-gate harm set (`check-measurement-binding` entry 20 is `--check corpus/evidence/round-16/measurement-binding.json --at 1205d26… --reproduce`,
**not** the round-17 manifest) is recorded at `.ufo/waves/round-17/harm-baseline.json:24,71,117,164,211,256,302,350,398,445,491,538,584,629,675,722,768,814,860,906`;
19/20 exit 0, entry 5 (`check-user-round-contract-production`) is already exit 1 `round_count`
(`.ufo/waves/round-17/harm-baseline.json:1061`).

## 2. (a) New files

| Surface | Rule | Evidence | Planned round-18 file | Go/No-go |
|---|---|---|---|---|
| `scripts/**` (new) | No gate enumerates new scripts. Exact-path pins only: `scripts/check-freshness.mjs` is protected by both round gates; `scripts/check-round-contract.mjs`, `scripts/pstack-seat.mjs`, `scripts/pstack-aggregate.mjs`, `scripts/check-freshness.mjs` are the user gate's pstack-diff scope; `scripts/check-{round,user-round,measurement-binding}.mjs` are round-17 C1 counted inputs | round `:175`; user `:77-87`, `:344-355`; manifest `:25-27` | `scripts/webmcp-invoke-round18.mjs`, `scripts/freshness-witness.mjs` | **GO** (no rule touches them; do not edit any listed exact path) |
| `corpus/evidence/round-18/**` | No general rule. Round gate's evidence rules are keyed to `pstack-20261015-r##` ids only (`aggregate.json`, `seats/`, `public/`, `sameTree`); user gate likewise for `user-*` ids | round `:540-614`; user `:577-649` | `source-recheck/S###.{json,excerpt.txt}`, `routed/*.json`, `routed/harness-reruns/*` | **GO** — but if a SOURCES `used-by` cell names one of these files, see §3 row 8 |
| `corpus/knowledge/**` (new note) | Freshness target set is built from the **baseline tree** (`c24eaea…`), so a new unpinned note is invisible; an *extra* `pins.tsv` row for it fails `target_set` | `scripts/check-freshness.mjs:78-81`, `:84-101` | `corpus/knowledge/*round-18*.md` (C2 note, C1 recheck note) | **GO** only as **new, unpinned** files. Never add a pins row; never edit an existing pinned note (`:100` `content_drift`) |
| `.ufo/waves/round-18/**` | No rule in any of the four gates mentions `.ufo/waves` (only `.ufo/rounds|reports|plans|continuation/fleet-round-1-*` are protected) | round `:168-177`; user `:226-235`; grep `.ufo/waves` in the four gates returns only a round-15 legacy counter constant and comments (`check-measurement-binding.mjs:37,39,111`) | `recheck-fetch.mjs`, `measure-c1/c2/c3.mjs`, wave reports | **GO** |
| `corpus/evidence/fleet-round-1-freshness/pins.tsv` | Byte-frozen by both round gates (prefix) and by the census row | round `:170`; user `:228`; census row `corpus/evidence/pstack-20261015/baseline-census.tsv:45`; digest pin `check-round-contract.mjs:30` | (not planned) | **NO-GO** if anyone edits it |

## 3. (b) `corpus/SOURCES.md` — appends and in-place edits

`SOURCES.md` is **not** in either gate's `APPEND_ONLY` list (`check-round-contract.mjs:25`,
`check-user-round-contract.mjs:76`) and is absent from the hard baseline (verified:
`git cat-file -e 7f506af…:corpus/SOURCES.md` → absent), so no byte-prefix rule and no protected-path
rule apply. The sources gate is the only structural gate, and it reads the worktree.

| # | Rule (finding id) | Evidence | Applies to round 18 |
|---|---|---|---|
| 1 | File must keep all four exact sections `## Registry`, `## Paths`, `## Search log`, `## Leads (unopened)` (`missing_section`) | `check-sources.mjs:29`, `:250-251` | appends OK; do not retitle |
| 2 | A row is only a row inside `## Registry`; the same shape anywhere else is `row_outside_registry` | `:255-271` | **tripwire**: appending S058/S059+ at EOF lands in `## Leads (unopened)` |
| 3 | Row grammar `^\| S[0-9]{3,} \|`, unique id (`duplicate_id`) | `:25`, `:285-289` | S058/S059+ unique |
| 4 | Exactly 11 data cells (13 fields after split) (`malformed_row`) | `:306-308` | a `\|` inside prose splits a cell → red |
| 5 | Duplicate normalized URL allowed only when `teaches` starts `supersedes S###` (`duplicate_url`); fragments and trailing `/` are stripped | `:180-201`, `:291-297` | **tripwire** for two S059+ rows citing one page (e.g. Playwright `class-browser` used for both launch/downloads/context) |
| 6 | `kind` enum, `tier` ∈ A/B/C, `status` ∈ queued/mined/rejected (`bad_*`) | `:26-28`, `:318-320` | rows must use these values |
| 7 | `opened` ISO date (and ≥ `--since` if passed); `recheck` ISO date or `\d+d` or `on-release` (`bad_opened`/`bad_recheck`) | `:321-322` | in-place recheck edits legal only in those forms — probed clean with ISO |
| 8 | `mined` needs ≥1 `used-by` path; each path must exist under root, be a regular file, and **contain the row id** (boundary-aware) (`mined_without_used_by`, `used_by_missing`, `used_by_uncited`, `used_by_escape`, `could_not_evaluate`) | `:203-260`, `:329-341` | if S059+ are `mined`, the C2 note must literally cite each id; `—` is red |
| 9 | `rejected` requires `REJECTED:` **and** `flip:` in `teaches` (`rejected_without_flip`) | `:325-327` | S058 is drafted `rejected` → both substrings required (planned) |
| 10 | `anchor` non-empty and not `—` (`bare_anchor`); tier A + community (`tier_inflation`) | `:323-324` | keep anchors |
| 11 | Whole-file credential scan (`op://`, private-key banner, `ghp_`, `AKIA`, `xox[baprs]-`) (`credential_material`) | `:344-351` | no credentials |
| 12 | In-place status/recheck/used-by edits have **no historical check** here; only current-text validity matters | evaluated text only, `:254-341` | **GO**, subject to rows 6–8 |

Empirical (sandbox clone at B, deleted): S058-shaped row appended at EOF →
`FINDING id=row_outside_registry … detail=section_leads_unopened_`; same row inserted after S057 →
`SOURCES_GATE verdict=clean rows=58 tiers=A:46,B:4,C:8 … findings=0`; recheck `180d`→`2026-10-20` →
clean; `queued`→`mined` with `—` → `FINDING id=mined_without_used_by fleet=W03 row=S051`; two rows on
`https://example.test/same` (second with `#frag`) → `FINDING id=duplicate_url fleet=E04 row=S060`;
`mined` + `used-by corpus/evidence/round-18/source-recheck/S061.json` containing `"S061"` → clean,
containing `"S062"` → `FINDING id=used_by_uncited … detail=row_id_absent`.

## 4. (c) Append-only surfaces — how "append" is verified

Both round gates verify **exact byte-prefix equality of the whole file**, baseline blob vs tip blob:
`after.subarray(0, before.length).equals(before)`; a missing tip file or any changed byte in the first
`before.length` bytes fails `history_rewritten` with detail `Append-only prefix changed: <path>`.
- Round gate: `APPEND_ONLY = ['LOG.md','SCORECARD.md','SKILL.md','PROVINCE.md','corpus/QUALITY.md','corpus/README.md']`
  at `scripts/check-round-contract.mjs:25`; loop `:316-321`.
- User gate: identical list at `:76`, loop `:401-406`.
- Files absent at the hard baseline are skipped (`if (!before) continue;`).
- Baseline is `HARD_BASELINE = 7f506affa55f6fb892d3c8073c75151c998bdf2c` (`:13`), not B.
- It is a byte prefix, not a line-level diff: inserting a line anywhere above EOF is red, even if
  the appended tail is intact.
- `SOURCES.md` is absent from both lists; its "append-only" status in `PLAN.md:57` is prose, not a
  gate rule.
- `SKILL.md` has one extra rule: current bytes must **grow** (`current.length > original.length`),
  `check-freshness.mjs:101` `witness_append`.
`PROVINCE.md` is additionally census-frozen, so any change fails `history_rewritten` regardless of
the append list: census loop `check-round-contract.mjs:322-337`, census row
`corpus/evidence/pstack-20261015/baseline-census.tsv:24`; the pins table itself is census row `:41`.

Empirical: `LOG.md` append + commit → `ROUND_CONTRACT verdict=clean rounds=10`; `README.md` append →
clean; one byte inserted mid-`SKILL.md` → `ROUND_CONTRACT verdict=failed finding=history_rewritten
detail=Append-only prefix changed: SKILL.md`.

Go/No-go: **GO** for appends to LOG/SCORECARD/SKILL/QUALITY/README; **NO-GO** for any in-place edit
of those five, and **NO-GO** for `PROVINCE.md`; `SHONEN.md` only per the canonical-seed policy
(`check-round-contract.mjs:187-250`) — unchanged is clean (`if (after === before) return;` at `:247`).

## 5. (d) New lesson `corpus/lessons/round-18.md`

| Rule | Evidence | Verdict |
|---|---|---|
| `## Gate`/`axis:`/admit/reject/one spot-check are **not** required for `round-18.md`: `parseLesson` is called only for ids from `roundIds()`, which matches `pstack-20261015-r##` (round gate) and `user-20261015-r##` (user gate) | round `:339-343`, `:346-359`, `:653,663`; user `:421-426`, `:428-438`, `:691,701` | no gate requirement |
| `## Mistakes` likewise has no gate rule; QUALITY 26–32 cite `round-1X.md#mistakes`, so include it for the QUALITY-33 pointers | `corpus/QUALITY.md:101-139` (anchor convention) | convention only |
| Protected-path freeze applies only to lessons **present at the hard baseline** (`round-1..round-10`) | round `:168-169`, `:308-313`; `git ls-tree 7f506af corpus/lessons` = round-1..round-10 | new lesson not frozen |
| **Single-add rule**: a lesson absent at the baseline must be status `A` and must have **no** later commit touching it (`MDRT`, `--no-renames -m`) inside `PSTACK_PIN..tip` | user `:333-343`, `:344-348`, `PSTACK_PIN` `:13` | **tripwire**: add the finished bytes once; never amend/append later |
| A new lesson is explicitly admitted by the round gate's own fixture | round self-test `future_lesson_allowed` `:1047-1050` | GO |

`PLAN.md:38-39` requires `## Corrections` (C3 d1). That is a counter/PLAN requirement, not a gate
rule, but it must be inside the single add commit.

Empirical: new `round-18.md`, one commit → round gate `clean`; user gate with
`--repo SANDBOX --baseline 7f506af… --expect 10 --pstack-pin 92d700d…` → `verdict=failed
finding=round_count detail=Found 6 user rounds, expected 10` (history passed; that failure is the
pre-existing red). Adding a second commit that appends bytes → `USER_ROUND_CONTRACT verdict=failed
finding=history_rewritten detail=Pstack bytes changed: A\tcorpus/lessons/round-18.md`.
Round-13..17 lessons confirm the pattern: `git log --diff-filter=MDRT 92d700d..B -- corpus/lessons/round-1{3..7}.md`
is empty for all five.

Go/No-go: **GO**, conditional on commit-once. The `L1 FILL` markers in the draft must be resolved
**before** the lesson commit.

## 6. (e) Round-17 manifest `countedInputs` vs planned round-18 files

Manifest: `corpus/evidence/round-17/measurement-binding.json`
(sha256 `edb6822a657771a937686b3b3a83716dea1933a4b9c1b546a4ab3d15a565fdc4`), measured at
`93bfead1f5f25f584353df3152a60209bbd89a2e`. Rule: any path changed between `measuredRevision` and
`--at` over `countedInputs + counter.path` yields `counted_input_changed`
(`check-measurement-binding.mjs:611-613`; diff at `:426-432`). At B the manifest is clean:
`node scripts/check-measurement-binding.mjs --check corpus/evidence/round-17/measurement-binding.json
--at 2bff864…` → `MEASUREMENT_BINDING verdict=clean claims=3 bound=3` exit 0, and
`git diff --name-only 93bfead 2bff864 -- <C2 inputs>` is empty.

| Claim | countedInputs (manifest lines) | Planned round-18 file that hits it | Result |
|---|---|---|---|
| C1 | `.ufo/waves/round-16/measure.mjs`, `.ufo/waves/round-17/c1-sites.json`, `corpus/evidence/round-15/measurements.json`, `corpus/evidence/user-20261015-r01/spec.json`, `corpus/lessons/pstack-20261015-r10.md`, `scripts/check-{measurement-binding,round-contract,user-round-contract}.mjs` (`:19-27`) | none (all byte-frozen by PLAN `:51-56`; no planned edit) | **no hit** |
| C2 | `corpus/README.md`, `corpus/SOURCES.md`, `corpus/evidence/round-17/webmcp-invoke/fixtures/`, `corpus/evidence/round-17/webmcp-invoke/receipt.json`, `corpus/knowledge/webmcp-invocation-round-17.md`, `scripts/webmcp-invoke-round17.mjs` (`:52-60`) | **`corpus/SOURCES.md`** (S058 + S059+ appends and in-place status/recheck edits), **`corpus/README.md`** (append-only index, QUALITY 31 row) | **HIT ×2** |
| C3 | `corpus/adjacency.tsv`, `corpus/lessons/round-16-verifier-spotcheck.md`, `scripts/check-adjacency.mjs` (`:83-88`) | none planned (D3 only runs the selftest; D1 only reads the tsv) — but a round-18 `adjacency.tsv` row would hit it | **no hit** (avoid an unplanned tsv edit) |

Empirical: sandbox commit adding only S058 → `MEASUREMENT_BINDING verdict=failed claims=3 bound=2` /
`finding claim=C2 reason=counted_input_changed detail=paths=corpus/SOURCES.md`; a branch adding only a
README line → same finding `paths=corpus/README.md`. So re-running the **round-17** manifest at the
round-18 tip is red after the mandated appends.

Consequence: this is not one of the 20 harm entries (entry 20 pins the round-16 manifest at
`1205d26…`), and round 18 should bind its own claims in a **new** `corpus/evidence/round-18/measurement-binding.json`
with its own `countedInputs`. But any outside checker that re-runs the round-17 manifest at the round-18
tip will report `counted_input_changed claim=C2`; the round-17 receipts must be cited as history at
`93bfead` (QUALITY 26/30), not re-verified by drift diff at REV.

## 7. Explicit go/no-go per planned change

| Planned change (PLAN.md) | Gates | Verdict |
|---|---|---|
| C1 receipts `corpus/evidence/round-18/source-recheck/S###.json`+`.excerpt.txt` (`:15-21`) | none of the four constrain round-18 evidence | **GO** |
| `.ufo/waves/round-18/recheck-fetch.mjs`, `measure-c1/c2/c3.mjs` (`:19-21,35-36`) | none | **GO** |
| C1 drift → new superseding SOURCES rows (`:20`) | sources rows 2,4,5,6,7,8,9 | **GO** if inserted inside `## Registry` and not a duplicate URL without `supersedes S### —` |
| C1 in-place status/recheck/used-by edits (`:57`) | sources rows 7,8,9,12 | **GO**; `mined` needs a used-by file that cites the id |
| C2 new `scripts/webmcp-invoke-round18.mjs`, `scripts/freshness-witness.mjs` (`:33-34`) | no enumeration; only exact-path pins | **GO** |
| C2 new SOURCES rows S059+ (`:35-36`) | sources rows 2–10 | **GO**, watch duplicate_url (one row per normalized page URL) and mined→used-by citation |
| C2 new knowledge note (drafts `harness-hardening-round-18.md`) | freshness `:78-81` | **GO** as new unpinned file; **NO-GO** if a pins row is added (`target_set`) or an existing note is edited (`content_drift`) |
| C3 `corpus/evidence/round-18/routed/**` including `harness-reruns/` (`:38-44`) | none | **GO** |
| C3 D1 `corpus/lessons/round-18.md` (`:38-39`) | user `:333-343` | **GO** only as one add commit, final bytes |
| C3 D4 S058 `supersedes S057 —`, rejected, no "individual publisher" (`:42-43`) | sources 2,4,5,8,9,10 | **GO** (duplicate URL is covered by the `supersedes` prefix; `REJECTED:`+`flip:` required) |
| Appends to LOG/SCORECARD/SKILL/QUALITY/README (`:57`) | round `:25,316-321`; user `:76,401-406`; freshness `:101` (SKILL grows) | **GO** for pure appends; **NO-GO** for edits above EOF |
| SOURCES appends (`:57`) | round gate: not append-checked; sources gate | **GO** in `## Registry`, not EOF |
| README/SOURCES appends at REV | round-17 binding C2 | **gate-red if the r17 manifest is re-checked at REV**; not a round-18 harm entry — bind round-18 claims in a new manifest |
| Any edit to `PROVINCE.md`, `SHONEN.md`, `scripts/check-*.mjs`, round-≤17 evidence/waves, existing lessons, existing pinned knowledge (`:51-56`) | round `:168-177,251-337`; user `:77-87,226-235,308-331`; freshness `:78-101`; binding C1/C2/C3 | **NO-GO** (would turn a gate red or violate a frozen input) |
| Unplanned `corpus/adjacency.tsv` row | round-17 binding C3 | **NO-GO** unless the round-17 manifest is accepted as history |

## 8. What these gates do *not* enforce (avoid treating as green)

- `SOURCES.md` has no byte-history rule: in-place edits to any cell are invisible to the round/user
  gates. Only the sources gate's current-text checks apply.
- `corpus/knowledge/*.md` added after baseline `c24eaea…` is unprotected by `check-freshness`
  (only the 23 baseline notes + reports + SKILL are pinned, `:78-80`). PLAN's "all knowledge existing
  at B sha-pinned" is broader than the gate; the actual freeze for round-17's note is the round-17 C2
  counted input.
- `scripts/check-sources.mjs`, `scripts/check-adjacency.mjs`, `scripts/check-aria-metadata.mjs` are not
  pinned by any of the four gates or the r17 manifest; PLAN `:51-56` freezes them by policy only.
- New `corpus/lessons/round-18.md` has no required-section gate; `## Gate`/`## Mistakes` are
  conventions plus QUALITY-citation targets.
- `check-round-contract`/`check-user-round-contract` read committed bytes; a scribe draft written
  straight into `corpus/SOURCES.md` or `corpus/knowledge/` shows up in `check-sources` /
  `check-freshness --worktree` before any commit. Integration must go through L1.

## 9. Remaining unknowns

- S059+ rows are not yet drafted, so URL distinctness and mined/used-by cells cannot be adjudicated;
  the rules and tripwires above are the check to apply when they land.
- I did not run the 20-gate harm set, any `--self-test`, or `--reproduce` (D2/D3/D5 are other seats'
  assignments; `--reproduce` would execute counters). Findings are code-read at B plus the targeted
  sandbox differentials quoted above; the sandbox was removed.
- No tool installs or upgrades were needed.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/ReconGates.md
