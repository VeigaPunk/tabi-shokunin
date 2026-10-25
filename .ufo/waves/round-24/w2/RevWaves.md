# RevWaves — round-24 wave-evidence audit (w2, falsify)

Seat: `L1Tabi24.RevWaves` (reviewer, read-only leaf). Tip under audit: `ad125e85c235e1c4ec6a08e398bd64da01f68a08`
(`git rev-parse HEAD`). Scope: the committed wave-1 evidence set in `.ufo/waves/round-24/` — claims, w1 spec,
w1 dispatch payload, 31 seat reports, swarm registry — plus the absence of `scratch/` from the committed tree.
Every number carries the command that produced it; wave-2 in-flight files are excluded and noted separately.

## Verdict summary

- Seat count vs spec: **32 spec items, 32 dispatch tasks, 32 registry members, 31 landed reports** — matches the
  committed SCORECARD census at `SCORECARD.md:1265–1267` (32 seats, 31 reports, `ScribeLesson` dead, not replaced).
- The dead seat: **`ScribeLesson`** (scribe) — in spec item 13, dispatch task 13, and registry member; no
  `w1/ScribeLesson.md`. Already self-recorded by `DistillW1.md:8` and the SCORECARD census. No committed evidence
  shows *why* it returned without writing (no record/attempts artifact exists).
- Reports whose content does not match their item: **one real mismatch** (`MutMismatchCounter` — deliverable not
  produced), **four disclosed partials** (details below).
- Spec/dispatch divergence: **one material grant** — dispatch appends a labrat permission to 6 executor seats that
  the spec's context contract never grants; otherwise uniform and mechanical.
- Frozen-claims contradiction (new): committed `claims.json` says C2 before=**4**; committed `SCORECARD.md:1220`
  declares C2 before=**5**; the `revisions` block designed to record post-freeze corrections is **empty**.

## 1. Required artifacts — present and committed

Commands: `git ls-tree -r --name-only ad125e8 -- .ufo/waves/round-24/` (41 paths); `ls .ufo/waves/round-24/w1/`
(32 entries = 31 `.md` + `swarm-registry.json`).

| Required | Status at ad125e8 |
|---|---|
| `claims.json` | present (`git show` returns the frozen blob, `revisions: []`) |
| `w1-spec.json` | present; regenerates byte-for-byte from committed `gen-w1.mjs` (see §4) |
| `w1-dispatch.json` | present; `counts = {spawn:32, resume:0, total:32}`, `resumeSends: []`, `compaction.applied:false` |
| 31 seat reports | all 31 committed; `git status --porcelain .ufo/waves/round-24/w1/` → clean (no worktree drift) |
| `w1/swarm-registry.json` | present; 32 members |
| `assimilation/` (5 files) | present — `intersection-ids.txt`, `lane-registry-ids.txt`, `next-free-ids.txt`, `staged-ids.txt`, `union-ids.txt` (ScoutCollisionIds's wave evidence) |

Wave-2 files in the worktree (`gen-w2.mjs`, `w2-spec.json`, `w2-dispatch.json`, `w2-dispatch.err`, `w2/`,
`scratch/`) are uncommitted and in-flight; excluded from the committed-set count.

## 2. Scratch absence — verified

- `git ls-tree -r --name-only ad125e8 | grep -c '/scratch/'` → **0** (round-wide, not only round-24).
- Deletion count: `git show --name-only --format='' 9e52cb2 | grep -c '^\.ufo/waves/round-23/scratch/'` → **1,034**,
  matching the M5 figure claimed.
- Ignore rule: `git show ad125e8:.gitignore` → line 5 `.ufo/waves/*/scratch/` (comment at line 2 ties it to the
  round-23 routed defect). `git check-ignore -v .ufo/waves/round-24/scratch/` → `.gitignore:5` (exit 0).
- Worktree: `.ufo/waves/round-24/scratch/` exists on disk, appears in `git status --porcelain --ignored` as `!!`
  only — ignored, not tracked. Requirement met exactly as stated.

## 3. Seat count vs spec

`python3` over `w1-spec.json`/`w1-dispatch.json`/`w1/swarm-registry.json`:

- spec `items`: 32; `maxLanes: 32`; `reportDir: .ufo/waves/round-24/w1`; item order == dispatch task order.
- dispatch `taskCall.tasks`: 32; name set identical; `agent` field == spec `role` for all 32.
- registry members: 32; identical name set; role histogram `scout×6, executor×6, reviewer×6, scribe×4, critic×4,
  mutation-tester×2, connector×1, revenger×1, simplifier×1, sentinel×1` — identical to the SCORECARD:1265 census.
- reports on disk: 31; **missing: `ScribeLesson`** (spec position 13, scribe). Dead seat confirmed.

**Registry provenance gap (observation).** All 32 registry members carry `agentId: null` and `item: null`;
`createdAt == updatedAt == 2026-10-25T08:15:27.045Z` (never updated after spawn). The dispatch-embedded registry
equals the committed file member-for-member. So the committed registry records the intended roster only — it
binds no agent identity and no per-member outcome. There is no `record.json`/`dispatch-attempts.json` for round 24
(`git ls-tree -r --name-only ad125e8 | grep -c 'round-24/\(record\|dispatch-attempts\|assignments\)'` → 0).
19/31 reports self-declare an `L1Tabi24.<Name>` seat id (grep over `w1/*.md`); the remaining 12 are identified by
filename only. The census therefore rests on file presence, not dispatch receipts — stated as a verification gap,
not a defect.

## 4. Spec provenance and spec/dispatch divergence

**Provenance.** `gen-w1.mjs` is committed and, run against a scratch `WAVE_DIR`, reproduces `w1-spec.json`
byte-for-byte after normalizing only the output path (`scratch/RevWaves/gen-w1-copy.mjs` → regenerated spec;
context, all 32 prompts, order, roles identical; diff of raw bytes reduces to the redirected paths alone).

**spec → dispatch.** For every task: `dispatch.task = "/skill:godspeed\n\n" + spec.prompt + trailer`, where the
trailer is exactly:

```
\n\nLane bounds: leaf member — no subagent dispatch[ except your single labrat].\n\nReport: write your scoped findings to .ufo/waves/round-24/w1/<Name>.md
```

- Divergence D1 (material): the labrat clause `except your single labrat` is granted to **6 seats**
  (`ExecRegistryProto`, `ExecMismatchProto`, `ExecControlSkip`, `ExecScratchCensus`, `LabSelftestParse`,
  `LabFreshness`); the other 26 get the plain leaf bound. The spec's own `context` contract grants **no** seat any
  subagent dispatch. So the dispatch payload carries a privilege the spec never declares — and it conflicts with
  `maxLanes: 32`/`waveMinLanes: 32` only if exercised. No report claims a spawned labrat
  (`grep -rl labrat w1/` → nothing); `ExecControlSkip.md` self-declares "no subagent dispatch". Latent only.
- Divergence D2 (provenance): the trailer is not produced by the committed generator — `grep -n "Lane bounds\|Report: write your scoped" gen-w1.mjs` → 0 hits; `gen-w1.mjs` writes only `w1-spec.json`. The dispatch payload's trailer therefore has no committed-code provenance (harness-generated); it is uniform and verified mechanical, but not regenerable from committed bytes.
- Non-divergences checked: `context` field byte-identical (`context equal: True`, 4,901 B each); name sets,
  order, role↔agent mapping identical; the embedded `registry` block equals `w1/swarm-registry.json` exactly.

## 5. Reports vs their items

Method: each item's demanded deliverables checked against the report (heading map + keyword coverage + spot reads;
coverage ≥0.75 for 29/31; two low-coverage reports were read in full).

| Seat | Match | Evidence |
|---|---|---|
| **MutMismatchCounter** | **mismatch — deliverable not produced** | Report: "Inconclusive; requested production-counter matrix not executed" and "Scratch fixtures were not created" (`w1/MutMismatchCounter.md:5`); `ls .ufo/waves/round-24/scratch/MutMismatchCounter` → **absent** (verified worktree). The item demanded the matrix on copies under `scratch/MutMismatchCounter/` with "exact byte changes and expected finding ids" — no such fixtures exist; the seat substituted an expected-behavior table. It declared the miss honestly (item subject still addressed), but the evidence payload is missing. |
| ScribeKnowledgeEntry | partial + id inversion | Draft's citation block maps `S104` → the **Page.pdl** URL and leaves `S105` as `QUOTE-PENDING:<url>` (`w1/ScribeKnowledgeEntry.md:3–4`). Committed convention (`corpus/SOURCES.md:119–120` and the landed entry) is S104=web.dev, S105=Page.pdl. `DistillW1.md` §1 repeats the draft's inverted mapping ("S104 Page.pdl"). The item asked for a complete `source: S104`/`source: S105` block; the draft ships one real citation and one placeholder. |
| ScoutRegistryRows | partial — second deliverable declared unresolved | Report explicitly leaves "which gate scripts have NO row at all" **Unresolved** ("a row-aware inventory … is needed"), after showing its literal path-presence scan over-reports (`w1/ScoutRegistryRows.md`, "Important distinction"). Per-field verdicts and PROTOCOL quote are delivered. |
| LabFreshness | partial | Gate 2 (`check-selfassessment.mjs`) reported "NOT TESTABLE (script absent)" — accurate (script did not yet exist), but half the item's test surface unevaluated; it supplies verification commands for the L1 instead. |
| ExecRegistryProto | partial | Prototype returned `{"nonconformant":0,"gates":[]}` — self-declared parser defect (heading selection bug), so the item's "nonconformant count, per-gate missing-field lists" were not produced as data; the report documents the defect and ambiguity resolutions. |

All other 26 reports answer their item's stated question (heading-to-demand check); none writes outside its
named report path; no cross-seat content bleed (`ExecScratchCensus` cites `ScoutCiteScan`, `ScoutGateScripts`
cites `LabFreshness` — legitimate cross-references, not wrong-item content).

Minor internal wrinkle: `DistillW1.md:8` says "**30 of 31** expected seat reports read" while listing 30 names —
the directory held 31 reports (30 others + itself). Whether the denominator means "31 present" or "32 spec seats",
either count is off by one; harmless to the census since the true numbers are stated elsewhere.

## 6. Cross-artifact contradictions (wave evidence vs committed prose)

| # | Contradiction | Commands / evidence |
|---|---|---|
| X1 | **C2 before-figure drift, unrecorded.** Frozen `claims.json`: `"before": 4` and declared text "three stale `--selftest` 12/12 figures …, one unlanded-path mismatch" (4 findings). Committed `SCORECARD.md:1220` declares `5 → 0` and `SCORECARD.md:1233` lists five baseline findings — adding the `check-sources` 25-vs-26 stale tally at `:410`. The schema-typed `revisions` block in `claims.json` is `[]`, so the correction exists only in SCORECARD prose, not in the block built to record it. | `git show ad125e8:.ufo/waves/round-24/claims.json \| python3 -c 'json.load'` → `revisions: []`; `git show ad125e8:SCORECARD.md \| sed -n '1219,1234p'` |
| X2 | **S105 anchor cell mislabels raw as decoded.** `corpus/SOURCES.md:120` and `corpus/lessons/round-24.md:16` record `82548 bytes decoded`; the committed artifact is 61,911 B (`wc -c corpus/evidence/round-24/sources/page.pdl` → 61911; `git show ad125e8:…/page.pdl \| wc -c` → 61911). 82,548 is the raw base64 transfer size (82,548×3/4 = 61,911 exactly, confirmed by w2's ScoutReopenS105). The sha256 `e944a3b1…` does match the committed file, so the anchor's identity field is fine; only the byte-count cell is wrong. | `sha256sum corpus/evidence/round-24/sources/page.pdl`; `git show ad125e8:corpus/SOURCES.md \| sed -n '119,120p'` |
| X3 | **S104 digest is the lane's re-fetch, not the wave-1 scout's.** Committed row/entry carry `0dd45292…`; `w1/ScoutBfcacheWeb.md:10` records `4535f93b…` for the same 157,667-byte page. Disclosed honestly at `corpus/lessons/round-24.md:32` (live page changed between two in-round fetches). Because scout scratch is ignored, the scout's bytes are unverifiable from committed state — the w1 report's digest is self-declared only. | `sha256sum corpus/evidence/round-24/sources/bfcache.html` → `0dd45292…`; `wc -c` → 157667 |

## Residual risk / verification gaps

- No committed artifact binds seat names to agent ids (§3): the dead-seat classification ("returned without
  writing") cannot be distinguished from "report written then lost" by committed bytes alone.
- `MutMismatchCounter`'s missing fixtures mean the m2-class mutation matrix entered the production selftest without
  a seat-produced fixture baseline — verify `--selftest` covers the seat's five demanded cases independently.
- X1's unrecorded revision makes the frozen claims file disagree with the lane's own declared-claims block;
  whichever figure is correct, one of the two committed documents is stale.
- Wave-2 registry/reports are landing now; this audit covers wave-1 committed evidence only.

## Tooling

No installs or updates. Regeneration harness for the spec provenance check: `node` (already present), copy of the
committed `gen-w1.mjs` retargeted to `scratch/RevWaves/genout/` — output byte-diff shown above. All other commands
listed inline.
