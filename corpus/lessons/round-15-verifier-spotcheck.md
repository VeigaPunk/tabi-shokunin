author: hyaku closure (non-author integrator, @m_opus)

# tabi round 15 — truthful USER diagnostics and checked historical metadata

## Decision and authority

**CLOSURE tabi r15 status=ok admitted=true.** C1 operability and C2 calibration verify in their declared, bounded senses; no axis is harmed. Baseline `7054a5e1068538349b4dbb0d291c2fe8643802f2`; delivered lane HEAD `36240c70ee114347a79abb91cacab6c63044ce36`. Neither claim is exploratory. This closure was dispatched by the hyaku orchestrator, not by the lane; it did not author round 15.

Counts, JSON propositions, code/input digests and history were re-measured over committed bytes (`git show`/`ls-tree`/`diff`, `jq`, `sha256sum`, `wc`, `awk`). Gate, selftest, witness, differential and counter outcomes are **evidence-verified** (PROTOCOL §Gate standard, Closure consequence), not re-executed: neither this closure nor its two read-only reviewer seats (RecheckC1, RecheckC2) ran any lane script, `measure.mjs`, `metadata-witness.py`, browser or runner. The mandated fleet source-census validator was executed. Tools installed/updated by this closure or its seats: none.

Dispatch/completion digest copied from the closure assignment (`.ufo/watchdog.log` is mutable; its line numbers are not evidence):

```text
2026-10-20T04:58:57-03:00 launch tabi round=15 pgid=2461539 driver=hyaku-inline attempt=1
2026-10-20T06:03:22-03:00 complete tabi round=15; hyaku-inline attempt=1
```

## Step-1 conformance

```sh
git -C /home/vgpnk/Projects/shokunin log --format='%an <%ae> %H %aI %s' -- .ufo/reports/round-15/tabi.md
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse HEAD
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-list --count '@{u}..HEAD'
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin ls-remote origin refs/heads/master
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin log --format='%h %an <%ae> / %cn %cI' 7054a5e..36240c7
```

| Check | Observed result |
|---|---|
| Real, landed report | `tabi-shokunin <tabi@shokunin.local> aabc693f2cb221c389677693df29dd86fa73c4e2 2026-10-20T06:03:00-03:00 round-15: tabi report`; work, evidence pointers, LOG-linked commit table, Sources & frontier, Trend verdicts and SHONEN present — not a marker |
| Lane HEAD and push | HEAD = `origin/master` = `36240c70ee114347a79abb91cacab6c63044ce36`; ahead count `0` |
| Clean lane | `status --porcelain` empty before this artifact was written |
| Ordering and attribution | six round commits `c138bea`…`36240c7`, all author/committer `tabi-shokunin <tabi@shokunin.local>`; last at `2026-10-20T06:00:34-03:00`, before the report commit `06:03:00` |
| Cited hashes | every word-bounded 7–40-hex commit string in the report (`7054a5e`, `c138bea`, `72dcf03`, `27dfd98…031a`, `b7cf044…4210`, `9fd8bca…bde3`, `36240c7…ce36`, full and short forms, 9 strings) resolves and passes `git merge-base --is-ancestor HASH 36240c7` |
| SHONEN | heading present, four `[~]` lines with pointers; no `[x]` |
| Prompt fidelity | Python loaded committed `templates/round-prompt.md` and `.ufo/prompts/tabi-round-15.md` via `git show HEAD:…` (prompt committed by `tabi-shokunin` in `3b728a8`), substituted `{{LANE}}`, `{{ROUND}}`, `{{FLEET_ROOT}}`, `{{AXES}}` (= prompt's `coverage + calibration (browser and web-interaction craft)`) and the lane working dir; `prompt.startswith(rendered.rstrip())` → `True`; the remainder is the hyaku addendum |
| History pin | `sha256(json.dumps(rounds[:48], sort_keys=True, separators=(',',':')))` at `ae19fca` and fleet HEAD both `ce97497ed699a8f0939be062d042cf4d6e3e7531116fbe4681593991d67f0a8e` = `.ufo/history-pin.json`; `ae19fca` is an ancestor of fleet HEAD |

The frozen step-1/step-4 closure-checker certification for these current inputs is still absent (disclosed by the lane, report line 75): **status-neutral protocol/operator debt**, not a pass. The manual checks above do not substitute for it.

## Independent measurements (C1, C2)

Report measurements name `b7cf0446a31014a81b4882857c90c565ebc14210` as the measured after-revision. Re-derived against delivered HEAD: `git diff --name-status b7cf044 36240c7` shows only `.ufo/waves/round-15/measure.mjs`, `w1/MeasureContracts.md`, `LOG.md`, `SCORECARD.md` modified plus 9 added receipts; `scripts/check-user-round-contract.mjs`, `scripts/check-aria-metadata.mjs`, `user-{diagnostics,diagnostic-witness,selftest}.json` and `metadata-{differential,selftest}.json` are byte-unchanged b7cf044→36240c7. The counts therefore hold at `36240c7`.

### C1 operability — verified diagnostic contracts 0→1 (evidence-verified gate, re-measured counts)

| Command (committed bytes) | Observed | Matches report |
|---|---|---|
| `git ls-tree -r REV -- corpus/evidence/round-15` for REV = 7054a5e, 36240c7 | 0 files → 29; all C1 receipts absent→present | yes |
| `jq '.exit,.stdout' count-before-c1.json count-after-c1.json` | exit0 `c1_truthful_diagnostics:0` (rev 7054a5e) → exit0 `:1` (rev b7cf044) | yes |
| `jq -r .stdout user-selftest.json` | exit0 tally `cases=42 fixtures=32 alias=1 committedCounts=6 countWitness=1 diagnosticWitness=1 reasonControls=1`; 42 PASS lines = 33 `child_cli` + 9 helper; 8 `expected_reason=` lines over 6 distinct reasons; 3 `applicable` / 39 `not_applicable`; 8 `isolation=cli` reason controls | yes |
| `jq user-diagnostic-witness.json` | exit0; baseline child exit1 `score_mismatch` reason none; repaired exit1 `after_count_mismatch`; missing-revision `counting_command_failed`; masking mutant `after_count_mismatch`; `wrong_reason_only_match=0`, `reasonless_match=1` | yes |
| `jq user-production.json user-final-production.json` | exit1 `finding=round_count detail=Found 6 user rounds, expected 10` | yes (honest red retained) |
| `sha256sum` of `git show REV:scripts/check-user-round-contract.mjs` | `f9be3a7…` at 27dfd98 = b7cf044 = 36240c7; `user-diagnostics.json` binds revision 27dfd98 / that digest | yes |

### C2 calibration — enforced canonical metadata contracts 0→1 (evidence-verified gate, re-measured counts)

| Command (committed bytes) | Observed | Matches report |
|---|---|---|
| `git cat-file -e` 14 C2 evidence paths at both revisions | 14/14 absent → present | yes |
| `jq '.exit,.stdout'` count-before-c2 / count-after-c2 / count-after-c2-repaired | exit0 `c2_enforced_contract:0` → genuine first failure exit1 `:0` (`errors:14`, `refused:0`) → exit0 `:1` (`emitted:9`, `refused:9`) | yes; failure retained, not relabeled |
| `git show --stat 9fd8bca`; `git diff --stat 9fd8bca^ 36240c7 -- corpus/evidence/round-15/metadata/` | sole code file in repair is `.ufo/waves/round-15/measure.mjs`; expected-fixtures/mirror-contract unchanged by the repair | yes (consumer-only) |
| `jq -r .stdout metadata-selftest.json` | exit0 `ARIA_METADATA_SELFTEST verdict=clean cli_cases=36 helpers=4` | yes |
| `jq metadata-differential.json` | 9/9 mirrors baseline exit0 accepted → repaired exit1 refused, failing set exactly {field finding, `R14-ARIA-SIDECAR-ACCEPTED-01`}; spec tamper old exit1 → new exit2 `could_not_evaluate`/`snapshot_tampered`; both untampered controls exit0; `originalsUnchanged` 8/8 | yes |
| `jq` metadata-original / -corrected / -witness | original exit1 `findings=18 failed=1` only `R14-ARIA-CLEANUP-LISTENING-AFTER-01`; corrected exit0 accepted; witness exit0 red→clean | yes |
| `jq final-production.json` | ROUND exit0 `verdict=clean rounds=10`; USER exit1 6/10 | yes |
| `sha256sum` of `git show REV:scripts/check-aria-metadata.mjs` | `d707625e…` at 27dfd98 = b7cf044 = 9fd8bca = 36240c7; differential `codeSha256` = that, `oldCodeSha256 ef37…` = 7054a5e | yes |
| `git diff --stat 7054a5e 36240c7 --` round-13 receipt/pin/spec, round-14 `corrected.json` | empty; digests `b458…`, `4d89…`, `03cb…`, `e156…` unchanged | yes (originals immutable) |

No evidence timestamp postdates its shipping commit (RecheckC2 sweep).

### Harm check

`git diff 7054a5e 36240c7 -- SCORECARD.md` is +71/−0, appending `## Round 15`; scalars depth 8→8, coverage 9→9, operability 8→8, freshness 8→8, calibration 9→9, adjacency 8→8 — none lowered. Source rows 29→29 (below). The disclosed `--derive` interface change was source-reviewed, not executed: `scripts/check-aria-metadata.mjs:1749` refuses `out:existing_bytes_differ_refusing_overwrite` when the regenerated Node note differs from the frozen round-14 sidecar, and SKILL.md:1811-1812 states it. That protects immutable round-14 bytes; the registered `--check` of `corrected.json` still exits 0 (metadata-corrected.json). Not a harm.

## Discernment and source spot-check

Census: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit0, `tabi	ok	/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/SOURCES.md`. CORPUS.md frozen census over `git show REV:corpus/SOURCES.md`: 7054a5e and 36240c7 both rows 29, malformed 0, A=23 B=4 C=2, mined=24 queued=3 rejected=2; mined used-by paths all exist; knowledge notes 32.

| Item (`corpus/lessons/round-15.md` `## Gate`) | Decision | Re-opened source | Agree? | Reason |
|---|---|---|---|---|
| C1 (line 9): exact refusal reason + applicability, wrong-reason decoy refused, production stays 6/10 | admit | `corpus/evidence/round-15/user-diagnostic-witness.json`, `user-selftest.json`, `user-final-production.json` | agree | baseline gives reasonless `score_mismatch`, repaired gives `after_count_mismatch`; wrong-reason-only comparison 0; 3 applicable/39 N/A explicit; production still `Found 6 user rounds, expected 10` |
| C2 (line 10): every emitted mirror recomputed, canonical correction passes, previously accepted false mirror now fails, pinned-byte change → `snapshot_tampered`/exit2 | admit | `metadata-differential.json`, `metadata-corrected.json`, `scripts/check-aria-metadata.mjs:147-158` (ANCHORS) | agree | 9/9 old-accept → new-refuse; tamper exit1 → exit2 `could_not_evaluate`; ANCHORS receipt `b458…`/pin `4d89…`/spec `03cb…`/producer `1d54c9…` equal `sha256sum` of the committed files |
| line 11: exact Node equality from static metadata | reject | `corpus/evidence/round-13/aria/receipt.json` `.runtime.node`, `runtime-pin.json` `.node` | agree | observed `26.12.0` ≠ recorded `24.21.0`; only `minimumMajor:20` is ever asserted (spec:269); nothing compares equality |
| line 12: whole-sidecar byte authentication | reject | `scripts/check-aria-metadata.mjs:147-158`, `:1112` | agree | ANCHORS pin receipt, pin, producer, spec, config, manifest and worker, but no sidecar digest; `:1112` only reports the sidecar sha256. Crediting whole-sidecar authentication would overclaim |

Source row re-opened: **S029** (the only row written this round: used-by `corpus/lessons/round-14.md` → `corpus/lessons/round-14.md, corpus/lessons/round-15.md`; `git diff 7054a5e 36240c7 -- corpus/SOURCES.md` 1 row changed, 0 added). Quote cell "The retained worker records listeningAfter=false while the aggregate says true; observed Node26.12.0 differs from descriptive recorded24.21.0" → `wc -w` 16 (≤25). Lesson locator: `git show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json | sed -n 2529p` → `"listeningAfter": false,`; `jq '.cleanup.server.perWorker[0].listeningAfter'` → `false` (one worker), `.cleanup.server.listeningAfter` → `true` at line 2521. The receipt at 837b33a and at HEAD share sha256 `b458b351…89b7`. Agree: quote, locator and used-by are accurate.

## Erratum to the round-14 verifier wording (non-author, recorded here; round-14 file unchanged)

**Superseded text** in `corpus/lessons/round-14-verifier-spotcheck.md` (sha256 `1e882d2e…a358`, committed at `7054a5e`, unchanged at `36240c7`):
- line 129: "the historical producer does not read pin.node", and "The producer's runtime pin match therefore cannot certify … historical minimum enforcement";
- line 184 (routed defect 1): "the historical producer, which never enforces pin.node".

**Judgment: warranted.** The statements are true only of the launcher file `scripts/aria-loopback-round13.mjs` (sha256 `1d54c9…af9c`), which has no `pin.node`/`minimumMajor` reference (`grep -n -E 'minimumMajor|pin\.node|PIN\.node'` → no launcher hits). They are overbroad for the historical round-13 run that produced the receipt:
- the frozen spec `corpus/evidence/round-13/aria/aria-loopback.spec.mjs` (sha256 `03cb4e17…e4fc`, equal to receipt `.source.specSha256` and byte-identical at `837b33a`) reads `PIN` from `runtime-pin.json` (:41) and `assertPinnedRuntime()` asserts `expect(RUNTIME.nodeMajor).toBeGreaterThanOrEqual(PIN.node.minimumMajor)` (:269);
- it is called in every case at :924, right after `record.phase = 'runtime-pin'` (:923). Phases then advance through inputs/config/…/`confinement` (:1131);
- all 8 receipt cases end `phase=confinement`, `status=pass`, `error=null`. The Node-minimum assertion therefore ran and held for every case (26 ≥ 20).

**Corrected statement:** the historical run enforced the Node *minimum* (major ≥ 20) per case in the spec. It never enforced *exact* Node equality to the recorded 24.21.0. The launcher's `runtime.pinned.matched` (launcher :403-423) and the spec's `runtimePinStatus()` (:241-259) both leave Node out of their match summaries, while the launcher records `runtime.node`. The retrospective checker re-evaluates the same minimum over the same recorded observation, so it is a second enforcement layer, not an independent runtime signal. Unaffected: round-14's line-142 reject of exact Node equality and both round-14 admits. The lane's round-15 SKILL.md/README qualification states this distinction correctly.

## Per-axis verdicts and trends

| Axis | Verdict | Basis |
|---|---|---|
| operability | improved | C1 verified 0→1 above |
| calibration | improved | C2 verified 0→1 above |
| depth | unchanged | scalar 8→8; no new knowledge |
| coverage | unchanged | knowledge/map 32/32, no new frontier |
| freshness | unchanged | no original runtime date/source bytes renewed |
| adjacency | unchanged | own-lane counters/evidence only |

- **expansion: unchanged.** Census 29→29 with identical tier/status histograms; 32 knowledge notes; no capability.
- **quality: improved.** Held contracts gain cause-exact USER diagnostics and executed mirror/tamper differentials over immutable originals. The genuine first C2 counter failure and USER red 6/10 stay recorded.
- **discernment: improved.** All four sampled gate decisions agree on re-opened sources. The lane's own source audit caught an outside-review overreach that this closure independently confirms (erratum above), and routed it without rewriting the round-14 bytes.

## Routed defects and retained debt (status-neutral)

1. **tabi — counter identity for C1.** `measurements.json` pins C1's counter only as `counterCodeRevision 27dfd98` (`measure.mjs` sha256 `3ee59de0…`). HEAD's `measure.mjs` is `dd9c8675…` (repaired at 9fd8bca), so re-running the cited C1 argv at HEAD runs a different counter. Record the counter digest per claim, and say which counter revision reproduces each receipt.
2. **tabi — measured revision vs delivered HEAD.** The report and SCORECARD measure at `b7cf044`, not the delivered `36240c7`. This closure confirmed no counted input or gate drift in between. Future rounds should measure at, or explicitly diff to, the delivered HEAD.
3. **tabi — adopt the erratum.** Future SKILL/lesson text citing round-14 Node wording should point to the erratum section of this file.
4. **protocol/operator — frozen step-1/step-4 closure-checker certification** for current inputs is still absent; carried as debt.
5. Inherited, unchanged: USER 6/10, r07 survivor replay, user-record freezing, IPv6 origin, Git env/hooks/config/PATH, external-validator pin.

SHONEN: all four boxes remain `[~]` with accessible pointers. This bounded closure did not cold-execute the instructions or certify promotion criteria, so the boxes are **not** all non-author-checkable from this review. No `[x]`, promotion, mint, lane-file edit or round-14 rewrite was made. L0 questions untouched.
