# ReviewBinding: round-20 C1 binding manifest paths and measured-revision workflow

Seat: TabiR20.ReviewBinding (leaf reviewer, read-only). Lane: `tabi-shokunin`.
Baseline `c49929430d996b016dde2e3a3a5be380f3433fdb` = `refs/heads/master` = HEAD (detached; `git symbolic-ref -q HEAD` rc=1, so the gate's lane tip is `refs/heads/master`). Nothing committed; this file is the only write.

## Verdict

C1 is not bindable yet. Two preconditions fail today: the S096 source body is untracked, and the counter and decisions file do not exist. Once they land, the minimal binding is two exact counted files, a binding manifest beside the counter, and a measure, then bind, then receipt flow. Recommendations that name files which do not exist yet are prospective.

## Findings (severity order)

**F1 BLOCKER: S096 source bytes are untracked.**
`corpus/evidence/round-20/sources/html_form_element.cc` is not in git. `git ls-files --error-unmatch` fails, it appears in `git ls-files -o --exclude-standard`, and `git ls-tree -r refs/heads/master -- corpus/evidence/round-20` is empty. The worktree sha256 `8c8d6796...6916` equals the pin at `design.json:19`, so the content is right but no commit holds it. Every `countedInputs` entry must resolve in the measured tree (gate `:599-609`, `counted_inputs_undeclared`), and QUALITY 28 and 38 require committed bytes. Fix: commit it in the measured commit M.

**F2 HIGH: the S096 cited ranges do not cover LC11.**
`corpus/SOURCES.md:110` (S096, committed in `bf466e3`) cites `html_form_element.cc:174-328,729-758,818-842`. Checked all twelve spans in `design.json:25-120`: eleven lie inside those ranges. LC11 `787-815` (`design.json:109-110`) falls in the uncited gap 759-817. The source bytes do contain the LC11 text (`html_form_element.cc:787-815`, the preventDefault-without-respondWith error branch), so the claim is true, but the row does not declare those lines as opened (QUALITY 12). Fix before M: append a scope correction (QUALITY 4 and 33; the row is committed, so do not rewrite it), or narrow LC11. Note that a SOURCES.md append also flips r19 C1 (F4).

**F3 MEDIUM: design.json names no binding manifest; `manifest` is the decisions file.**
`design.json:14` sets `manifest` to `corpus/evidence/round-20/lifecycle/decisions.json`, whose schema is `tabi-webmcp-lifecycle-decisions-v1` (`design.json:122-123`). The gate accepts only `tabi-measurement-binding-v1` (`check-measurement-binding.mjs:455-457`) and would refuse that file with `manifest_schema_invalid` (exit 2). Add a separate key, for example `"bindingManifest": ".ufo/waves/round-20/measurement-binding.json"`, and keep `manifest` for data.

**F4 MEDIUM: counted scope must be exactly the two data files; append surfaces go red by design.**
- Count `decisions.json` and the source only. Do not count SKILL.md (the planned rendering target, `design.json:133`), `corpus/SOURCES.md`, `corpus/QUALITY.md`, `LOG.md`, `SCORECARD.md`, README, the gate, or the selftest.
- Lane precedent: r16 counted the gate and selftest (`corpus/evidence/round-16/measurement-binding.json:23-24`) and went red when the gate was later hardened (`corpus/evidence/round-17/binding/r16-check-at-tip.json:16`). r17 excluded SKILL.md for this reason (`corpus/evidence/round-17/measurement-binding.json:97`).
- Consequence: r19 C1 counts SKILL.md and SOURCES.md (`.ufo/waves/round-19/measurement-binding.json:30-31`), and r19 C3 counts QUALITY.md, LOG.md and SCORECARD.md (`:95-97`). Per-file `git log -n1` gives `3a93382` (r19's measured revision) for SKILL.md, LOG.md and SCORECARD.md, and `bf466e3` for QUALITY.md and SOURCES.md; the drift diff from `3a93382` is empty for all five. Any round-20 commit that touches those files flips r19 C1 and C3 to `counted_input_changed` at the round-20 tip. That matches the r16-to-r17 precedent, but the round-20 closeout must record it or re-bind r19. It must not stay silent.
- If the planner wants the rendered SKILL rows covered, use a separate uncounted check, or accept a red binding at the next SKILL append. Recommended: the former.

**F5 MEDIUM: four nested git repositories sit under the wave directory.**
`.ufo/waves/round-20/clones/{ExecCounter,ExecFixtures,ExecFrozen,ScribeLifecycle}` each contain a `.git` directory. `git add -A .ufo/waves/round-20` would record them as embedded repositories. Stage explicit paths only (workflow step 1). They are not ignored: they appear in `git ls-files -o --exclude-standard`.

**F6 LOW: the gate binds less than the manifest suggests.**
- `baseline` is checked only for 40-hex (`:459`) and never used in evaluation. `before.revision` is resolved (`:573`) and run as the before arm (`:643`) but is not checked for ancestry. Keep `before.revision == baseline == c49929...` by convention. It is a verified ancestor of master (`git merge-base --is-ancestor` rc=0).
- The manifest is read from the worktree (`:437`), not from git. Cite the commit that added it.
- Unknown keys are ignored. The r19 manifest carries `declaredTargets` and `claimVerdicts` prose (`.ufo/waves/round-19/measurement-binding.json:5-14`) that the gate never reads. Keep prose out of the round-20 manifest.
- `--reproduce` runs only when there are zero static findings (`:623`). A red static check says nothing about counts.

**F7 LOW: the r19 receipt pins `8913a53`, not the delivered `c499294`.**
`.ufo/waves/round-19/final/binding-at-delivered.json:20` records `revision: 8913a53`. `c499294` adds only that file (`git show --stat`). My drift diff from measured `3a93382` to `refs/heads/master`, over all three claims' inputs and counter paths, is empty, so r19 holds by drift. No `--at c499294 --reproduce` record exists, which QUALITY 22 and 26 ask for. Close it in the r19 closeout; no round-20 action.

**F8 LOW: r19 counter hard-codes a machine path, and the reproduction budget is tight.**
`.ufo/waves/round-19/measure-c1.mjs:35` hard-codes `/home/vgpnk/.local/share/fnm/.../bin/node`, and `:870` refuses when it is absent. The round-20 counter must not name any interpreter path; the gate already supplies `process.execPath`. The gate kills each counter arm at 120 s (`:115`). The r19 three-claim delivered check took 175,757 ms (receipt `:13`). A round-20 counter that reads two blobs and checks twelve quotes runs far under a second. Any harness run risks `counter_failed`.

**P0 precondition, not a defect: the counter and decisions do not exist.**
`.ufo/waves/round-20/measure-c1.mjs` and `corpus/evidence/round-20/lifecycle/decisions.json` are absent from the worktree and from master. `clones/ExecCounter` holds only `design.json`. Every C1 recommendation below is prospective.

**I1 INFO: the S096 URL is base64; the decoded pin matches.**
`...html_form_element.cc?format=TEXT` returns base64 (first bytes `LyoKICogQ29weXJpZ2h0`, which decodes to `/*` and ` * Copyright`). Fetched in this session, base64-decoded sha256 = `8c8d6796...6916`, equal to `design.json:19` and to the S096 row's "decoded sha256". Record the decode step wherever the URL is cited. The fetch went to `/tmp` and was removed.

**I2 INFO: adjacent spans share boundary lines.** LC04 and LC05 share line 218; LC08 and LC09 share line 298. The counter must say whether shared boundary lines are legal. The gate does not check spans.

## Recommended C1 manifest (minimal)

Path: `.ufo/waves/round-20/measurement-binding.json`. This follows the r18 and r19 convention, which places the binding record outside `corpus/evidence/`, so no future `corpus/evidence/round-20/` prefix can capture a changing record. The r16 and r17 manifests live under `corpus/evidence/`.

```json
{
  "schema": "tabi-measurement-binding-v1",
  "round": 20,
  "baseline": "c49929430d996b016dde2e3a3a5be380f3433fdb",
  "claims": [
    {
      "id": "C1",
      "axis": "depth",
      "counter": {
        "path": ".ufo/waves/round-20/measure-c1.mjs",
        "sha256": "<64-hex: git cat-file blob M:.ufo/waves/round-20/measure-c1.mjs | sha256sum>",
        "argv": ["node", ".ufo/waves/round-20/measure-c1.mjs", "{REV}"],
        "countField": "c1_lifecycle_decisions"
      },
      "countedInputs": [
        "corpus/evidence/round-20/lifecycle/decisions.json",
        "corpus/evidence/round-20/sources/html_form_element.cc"
      ],
      "measuredRevision": "<40-hex M, landed on refs/heads/master>",
      "before": { "revision": "c49929430d996b016dde2e3a3a5be380f3433fdb", "count": 0 },
      "after":  { "revision": "<40-hex M>", "count": 12 }
    }
  ]
}
```

Field rationale:
- `counter.path` must equal `argv[1]` exactly, be a clean repo path, and not start with a dash (`:359-369`, `:514-520`). Exactly one `{REV}` token. No `--claim` token, since this counter has a single claim.
- `countField` matches the `design.json` metric, and the gate requires an identifier.
- `countedInputs` are exact files. Directory prefixes would capture future receipts, and none are needed.
- `after.revision` must equal `measuredRevision` (`:504-507`).
- `axis` is optional; keep it for readers.

Counter contract (required so the gate's two arms can pass):
1. Accept exactly one 40-hex argument. Refuse any other shape with exit 2 and a reason on stderr.
2. Read only blobs at REV through `git cat-file blob`, which returns raw bytes with no textconv. Never read the worktree. Read only `decisions.json` and the source. Nothing else: no SKILL.md, SOURCES, note or README.
3. If `decisions.json` is absent at REV, print count 0 and exit 0. This is the baseline arm. If the file is present but malformed, or the source blob's sha256 differs from `source.sha256` recorded in `decisions.json`, exit non-zero with no count.
4. Count rows whose quote is a literal substring of the cited span lines and has at most 25 whitespace-separated words. A failing row lowers the count. Do not force the total to 12.
5. Stdout is exactly one JSON line carrying `c1_lifecycle_decisions`. Diagnostics go to stderr. The gate refuses multi-line stdout (`:551-554`).
6. Spawn only `git`. No interpreter paths, no harness, no network.
7. Negative controls in a committed receipt (QUALITY 21 and 37): quote outside span, more than 25 words, missing row, source sha mismatch, absent decisions at baseline. Positive control at M.

## Safe measured-revision workflow

Preconditions, all before M: F1 source committed; F2 S096 scope corrected; `decisions.json` final with twelve rows; counter final and committed in the same commit; counter negative-control receipt committed; per-writer ledger rows (QUALITY 45) recording clone, branch, base `c49929...`, commit, and `git diff --name-only base commit`, which must be a subset of each writer's assigned paths.

1. **Measure commit M.** Stage explicit paths only:
   `git add -- .ufo/waves/round-20/measure-c1.mjs corpus/evidence/round-20/lifecycle/decisions.json corpus/evidence/round-20/sources/html_form_element.cc`
   Never `git add -A .ufo/waves/round-20`. Land M on `refs/heads/master` as a fast-forward. M must be reachable from the tip, or the gate reports `measured_revision_not_ancestor`.
2. **Digest.** `git cat-file blob M:.ufo/waves/round-20/measure-c1.mjs | sha256sum`. The gate hashes blob bytes (`:400-411`), so do not use the worktree copy.
3. **Counts at committed bytes.** `node .ufo/waves/round-20/measure-c1.mjs <M>` must print 12. `node .ufo/waves/round-20/measure-c1.mjs c49929430d996b016dde2e3a3a5be380f3433fdb` must print 0. Any other value means the counter or decisions are not final.
4. **Manifest commit M2.** Write the manifest with M, the digest, `after.count` 12, and `before` as above. Commit only the manifest and non-counted notes. The gate checks drift from M to M2.
5. **Admission run.** From the lane root, at the delivered tip:
   `node scripts/check-measurement-binding.mjs --check .ufo/waves/round-20/measurement-binding.json --at "$(git rev-parse --verify refs/heads/master)" --reproduce --json`
   Expect exit 0, `claims=1 bound=1`, and an `at` field equal to that tip.
6. **Receipt M3.** Commit `.ufo/waves/round-20/final/binding-at-delivered.json` with argv, exit code, stdout, the gate's producer sha256 and the `at` revision. If the receipt lands after the admission run, the receipt names the run's revision and cites the drift statement (QUALITY 26): `git --literal-pathspecs diff --name-only <M2> <M3> -- corpus/evidence/round-20/lifecycle/decisions.json corpus/evidence/round-20/sources/html_form_element.cc .ufo/waves/round-20/measure-c1.mjs` must print nothing.

If a counted input changes after M, do not edit the manifest's revision to match. Re-measure at a new M' and keep the old receipt as history (QUALITY 30).

Failure modes:

| Shape | Gate finding | Precedent |
|---|---|---|
| source or decisions absent from M's tree | `counted_inputs_undeclared` | F1 today |
| digest taken from worktree or uncommitted bytes | `counter_digest_mismatch` | QUALITY 22 |
| counter edited after M | `counter_changed_since_measurement`, `counted_input_changed` | new M' required |
| SKILL, QUALITY, LOG, SCORECARD or SOURCES counted | `counted_input_changed` at next append | r19 C1 and C3 at round-20 tip |
| gate or selftest counted | `counted_input_changed` at hardening | `corpus/evidence/round-17/binding/r16-check-at-tip.json:16` |
| M not on master | `measured_revision_not_ancestor` | none |
| `measuredRevision` set to "uncommitted" | `manifest_schema_invalid`, exit 2 | QUALITY 29 allows it for worktree bytes only |
| counter prints a different after-count | `count_not_reproduced` | gate `:644` |
| counter fails at baseline on absent decisions | `counter_failed` | gate `:643` |

## r19 binding, as found

| Item | Value and evidence |
|---|---|
| manifest | `.ufo/waves/round-19/measurement-binding.json`, committed in `8913a53`; not under `corpus/evidence/` |
| baseline and measured revision | `66251bfc...` and `3a933829...`, the same for all three claims |
| C1 | depth; counter `.ufo/waves/round-19/measure-c1.mjs` (blob `d2af0a46...`, matches master); `c1_validation_decisions`; after 27 |
| C2 | operability; counter `.ufo/waves/round-19/measure-c2.mjs`; `c2_h4_properties`; after 2 |
| C3 | calibration; counter `.ufo/waves/round-19/measure-c3.mjs`; `c3_routed_closed`; after 3 |
| delivered receipt | `.ufo/waves/round-19/final/binding-at-delivered.json` at `c499294`: exit 0, verdict clean, claims 3, bound 3, `at` `8913a53`, producer `388c2b49...14af74` |
| drift now | empty over every C1, C2 and C3 input and counter path, `3a93382` to master (my run) |
| gate and selftest identity | worktree equals master blob: gate `388c2b49...14af74`, selftest `8324692c...26b3`, matching SKILL.md:1939 |

## Checks for main after integration (not run by me)

1. Admission run from workflow step 5: exit 0, `claims=1 bound=1`.
2. `node scripts/check-measurement-binding.mjs --check .ufo/waves/round-19/measurement-binding.json --at <tip> --reproduce`: expect red on C1 and C3 if round 20 touched their inputs. Record per claim; do not fold it into the round-20 verdict.
3. `node scripts/check-measurement-binding.mjs --self-test`: SKILL.md:1939 documents 76 cases. Cite a committed receipt (QUALITY 37).
4. Drift: the `git --literal-pathspecs diff --name-only <M> <tip> -- ...` command from workflow step 6 must print nothing.

## Verification performed and not performed

Performed, read-only: full read of `scripts/check-measurement-binding.mjs` (977 lines); selftest lines 1-123, 216-296 and 319-395; SKILL.md binding sections (1839-1857, 1939-1948, 2012-2023); `corpus/QUALITY.md` criteria 1-49; `design.json`; span containment for all twelve decisions (script); git read-only queries (`ls-files`, `ls-tree`, `cat-file`, `merge-base`, `diff --name-only`, `log -S`, `check-ignore`, `check-attr`) with `GIT_OPTIONAL_LOCKS=0`; sha256 of worktree files against blob copies; one HTTP GET of the S096 URL (removed afterwards).

Not performed: no gate, selftest, counter or decisions run; no commits; no installs; did not read the full selftest (623 lines) or the full r19 counter (1527 lines).

## Residual risk

- The gate cannot see undeclared counter reads. The counter's read-set must be enumerated and covered by its own negative controls.
- Source identity rests on the sha pin and the tag URL. Chromium commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` (S096 row) cannot be verified inside this lane.
- The gate's `bound` count means "no static finding", not "count reproduced". Only `--reproduce` binds counts.
- Decision quotes are unchecked by me because `decisions.json` does not exist yet.

Report: .ufo/waves/round-20/w1/ReviewBinding.md
