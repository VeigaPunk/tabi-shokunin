# CriticNoHarm — round 19 wave 2 falsification

**Advisory outcome: ISSUES; not a canonical judgment.** Six selected inherited gates retain their B exits at R, but that is insufficient for no-harm: the unchanged first user-history error masks one newly refused lesson. Two new registry rows also evade duplicate-URL detection through punctuation. The retained C1 measurement is not bound to R's changed inputs.

## Axes and scope

Named axes: **depth, coverage, operability, freshness, calibration, adjacency**. Inherited scores are 8/9/8/8/9/8 respectively; this review assigns no scores. Primary protection axes here are operability (gate behavior and reproducibility), calibration (complete refusal reasons and measurement identity), and freshness (pins/source identity); depth is affected by a stale C1 count. No coverage or adjacency regression is established by this scoped review.

- B: `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Attacked R: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`.
- Read PLAN through its final revision, including the revised C1 decision metric and the exclusion of inherited H1/F6 behavior from new C2 credit.
- Read every one of the 23 baseline argv/exit records at R. The baseline is **22 exit 0, one exit 1**, not all green. Its already-red user-history finding names `round-18.md`, not `round_count`.
- Read the full B→R changed-path inventory: **251 paths = 245 additions + six modifications**, no deletions. The six modified files are `LOG.md`, `SCORECARD.md`, `SKILL.md`, `corpus/QUALITY.md`, `corpus/README.md`, and `corpus/SOURCES.md`; their diffs are additions only (32/8/67/48/14/22 lines). Existing scripts are unchanged. The only new production scripts are `webmcp-invoke-round19.mjs` and `webmcp-validation-round19.mjs`. Existing lessons, knowledge, round≤18 wave files, and evidence do not change in the endpoint diff. History-sensitive checking additionally matters below.
- Full changed-path inventory SHA-256: `60f2c69ba55335360830b088d9c113ca7a563ecda94c5cb1b51bc70b91c5ebf6`.

## All 23 baseline argv/exit records

Every row's argv begins with N = `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`; the remainder is transcribed below. `—` means **not run by this seat**, not passed. Selected executions used the exact recorded argv arrays and the sandbox lane as cwd.

| # | Baseline argv after N | B exit | R exit |
|---|---|---:|---:|
| 1 | `scripts/check-round-contract.mjs` | 0 | — |
| 2 | `scripts/check-round-contract.mjs --self-test` | 0 | — |
| 3 | `scripts/check-round-contract.mjs --witness 75e7836b6c3090180aee2754e20a5d3cfb186e74` | 0 | — |
| 4 | `scripts/check-round-contract.mjs --count-witness bebe2efc4565bb068efd905e9ef78011bb6b4efd` | 0 | — |
| 5 | `scripts/check-user-round-contract.mjs` | 1 | 1 |
| 6 | `scripts/check-user-round-contract.mjs --self-test` | 0 | — |
| 7 | `scripts/check-user-round-contract.mjs --witness 75e7836b6c3090180aee2754e20a5d3cfb186e74` | 0 | — |
| 8 | `scripts/check-user-round-contract.mjs --count-witness bebe2efc4565bb068efd905e9ef78011bb6b4efd` | 0 | — |
| 9 | `scripts/check-user-round-contract.mjs --diagnostic-witness` | 0 | — |
| 10 | `scripts/check-freshness.mjs --worktree` | 0 | 0 |
| 11 | `scripts/check-freshness.mjs --witness 5859243183c4d7ac5429dfdb8a73ce0d9a43d583` | 0 | 0 |
| 12 | `scripts/check-freshness.mjs --self-test` | 0 | — |
| 13 | `scripts/check-sources.mjs` | 0 | 0 |
| 14 | `scripts/check-sources.mjs --self-test` | 0 | — |
| 15 | `scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json` | 0 | — |
| 16 | `scripts/check-aria-metadata.mjs --self-test` | 0 | — |
| 17 | `scripts/check-aria-metadata.mjs --witness` | 0 | — |
| 18 | `scripts/check-aria-metadata.mjs --witness-mirrors` | 0 | — |
| 19 | `scripts/check-measurement-binding.mjs --self-test` | 0 | — |
| 20 | `scripts/check-measurement-binding.mjs --check corpus/evidence/round-16/measurement-binding.json --at 1205d261776a349af99a5a205c7c2467fbabae16 --reproduce` | 0 | 0 |
| 21 | `scripts/check-measurement-binding.mjs --check corpus/evidence/round-17/measurement-binding.json --at 1b0bc7bbfec0305e0332a5e3b382d78f22248551 --reproduce` | 0 | 0 |
| 22 | `scripts/check-adjacency.mjs --fleet /home/vgpnk/Projects/shokunin` | 0 | — |
| 23 | `scripts/check-adjacency.mjs --self-test` | 0 | — |

## Faithful sandbox and exercised results

Created the requested private R clone, then a separate real fleet topology for the selected reproduction gates, not symlink substitutes:

- Seed: `/fast/scratch/tabi-r19/fx-CriticNoHarm`, branch `r19/fx-CriticNoHarm`, R.
- Fleet: `/fast/scratch/tabi-r19/fx-CriticNoHarm-fleet`, `master` at baseline-recorded fleet revision `07a46044d93c13a4249d0852a8787407c5216ddd`.
- Execution lane: `/fast/scratch/tabi-r19/fx-CriticNoHarm-fleet/tabi-shokunin`, `master` at R.
- Six real sibling clones use the baseline's exact branch names/tips: kagi master `c2cab35bc92e57e39e5489bac3386db078345b3f`; kaidoku main `d0690fd44f46d8a7fe9da5f01c6be723d12abd41`; kake master `7c61c8cc791bde36dd5e3688bdfea2678d90146c`; kama master `54a29268e2083caa2b1e0d54ee1e7d90961302f3`; kumitate master `1770305fae20826b39905a8251ddeca6b4957ac4`; revenger main `cf02419276e5dd8aafb6fe09d4e9aaa6bcb78c97`.

Node was **v24.21.0**, its bin first in PATH. Six selected gate processes ran concurrently, were all awaited, exited normally, and had no timeout. No browser, background job, canonical judge, alternate runtime, or service was launched by this seat. The historical binding reproductions ran their own existing Node/Git counters; neither launches a browser.

| Gate | R observation | Output comparison with B |
|---|---|---|
| user production | exit 1, inherited first `history_rewritten` error | stdout/stderr identical; hidden additional reason audited below |
| freshness worktree | exit 0; 34 matches, 34 unique, 31 lane + three public | stdout/stderr identical |
| freshness witness | exit 0; same 34 matches at the recorded witness | stdout/stderr identical |
| sources production | exit 0; 94 rows, A81/B4/C9; queued19/mined66/rejected9; findings0 | stdout changes with the new rows, stderr unchanged |
| round-16 binding reproduction | exit 0; `claims=2 bound=2` | stdout/stderr identical |
| round-17 binding reproduction | exit 0; `claims=3 bound=3` | stdout/stderr identical |

All four relevant producer digests equal their baseline-recorded digests. Five of the six complete output pairs are byte-identical to B. Source stdout SHA-256 changes from `85601730e2cb2b455a0055649721651f8ec4f446c30888cd4e80ef897b9b47dc` to `70545b97e8eff112f47add2e840c997fad2e833f8b9d0053fe6c80cc208fdcdd`; that is the observed row-count update, not an observed gate failure.

### NH1 — Same first error conceals a new history refusal

**Counterexample:** the original lesson-history predicate refuses only `round-18.md` at B but refuses **both `round-18.md` and `round-19.md` at R**. New refusal set size: **1 → 2**, despite the same gate exit and even identical stderr bytes.

Evidence at R:

- `/fast/scratch/tabi-r19/fx-CriticNoHarm/scripts/check-user-round-contract.mjs:330-341`: a lesson absent from the hard baseline is allowed only as an initial addition with no subsequent M/D/R/T commit in the pinned history.
- Same file `:411-418`: all drifted paths are filtered, but only the first is printed.
- `git log` shows `corpus/lessons/round-19.md` added at `08e817394fa27f54441c46fac17228c37f86bf73`, then modified at R itself.
- The diagnostic executes the gate's **verbatim extracted `git`, `blob`, and `lessonDrift` functions**, with `laneTip` bound once to each explicit B/R revision. It does not suppress the inherited error, modify the production checker, or rerun the B production gate.
- B refused lessons: `[corpus/lessons/round-18.md]`; R: `[corpus/lessons/round-18.md, corpus/lessons/round-19.md]`. The round-18 mutation commits are unchanged; the new round-19 mutation commit is R.
- Actual R stderr remains `USER_ROUND_CONTRACT verdict=failed finding=history_rewritten detail=Pstack bytes changed: A\tcorpus/lessons/round-18.md`, SHA-256 `884ef937e7f575cdbf4bf0f58150e0a8bec853e0e3e232532c50e231e897e3ce`.

**Impacted axes:** calibration and operability. This is **not** a newly red inherited gate; it is a new forbidden history event masked by a preexisting red path.

**Smallest safe correction:** report the expanded refusal set to the canonical L1/judge; do not call R no-harm based on exit or first-message equality. A later content revert cannot erase an already recorded M event. With R fixed in ancestry and the checker byte-frozen, this is not repairable through another content edit. A lawful replacement proposal would need the final round-19 lesson added only once on a B-descended history, if canonical integration rules permit such a replacement; only the L1 may decide that route. Do not relax the frozen gate, erase inherited evidence, or rename/delete a required lesson merely to evade its predicate. Acceptance of a new violation is a tradeoff, not a no-harm fix.

### NH2 — Two new duplicate source identities are punctuation-dependent

**Counterexample:** production `check-sources` is green, but removing only Markdown/separator punctuation from two new source cells turns it red with **two E04 duplicate_url findings**. URLs, anchors, teaching text, status, dates, and used-by remain the same.

- `/fast/scratch/tabi-r19/fx-CriticNoHarm/corpus/SOURCES.md:55,93`: S079 repeats S041's tagged `WebMCP.pdl` URL, but its first URL is followed immediately by `;`.
- Same registry `:91,107`: S093 repeats S077's tagged `form_mcp_schema.cc?format=TEXT` URL inside `[implementation](...),` Markdown. S077 already explicitly supersedes S071; S093 has no supersession marker.
- `/fast/scratch/tabi-r19/fx-CriticNoHarm/scripts/check-sources.mjs:180-186,292-299`: the existing first-URL regex retains `;`, `),`, and similar punctuation as URL identity; only literal `supersedes S###` teaching text permits a normalized duplicate.
- Exact primary identities are `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` and `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT`. These were read as local registry data, not fetched remotely.
- Scratch fixture `CriticNoHarm.sources.canonical-punctuation-v2.md`, SHA-256 `2d52a60f2e8f06c07d9cef2826d0745dad08be1cc3786da8bfb8f154b4548493`, changes only the two source cells to bare URLs separated by spaces. The unmodified gate with `--file` exits 1 and reports `duplicate_url` for **S079 and S093**, findings2. Stdout SHA-256 `4ab1da4ddba9c4dc216a2fca81b9af738a3c8e680dea4ee2d737e0c0833bc38b`.
- An initial normalization probe left a comma attached to S093's first URL; it found only S079. That partial result is retained, not presented as a two-row success. The refined probe removes both wrappers and separator punctuation and finds both.

**Impacted axes:** calibration and source freshness/identity. The regex weakness is inherited and unchanged; the newly added rows exercise it. This is a new registry-semantic defect, **not** an observed 0→1 production exit regression, and no numerical source-diversity inflation is established here.

**Smallest safe correction:** use canonical primary URL identities and explicit, truthful source-reuse/supersession metadata in the corrected proposal, preserving old evidence according to the append-only contract. Reuse S041/S077 for the same bytes; distinguish genuinely additional inspector/header material rather than treating punctuation as another source. Do not weaken E04 or change the byte-frozen checker. If a merged scope is genuinely a supersession, name that relationship explicitly rather than inventing independent provenance.

### NH3 — Historical binding passes do not bind the current C1 count

**Counterexample:** the two inherited binding argv vectors deliberately check historical revisions, not R. At R the latest retained C1 measurement is still `c1-ea170da3.json`, measured at `ea170da3d39089566f080a3095d2b7bb5c7002b7`, **count24**, whereas `/fast/scratch/tabi-r19/fx-CriticNoHarm/corpus/lessons/round-19.md:12-16` states 27 admitted decisions.

- C1 producer digest is consistent at measured revision and R: `a5126e5e5423e8e370aa60c67ece3253431662717550e934b986c04f7e2b7858`. This is input drift, not producer substitution.
- `/fast/scratch/tabi-r19/fx-CriticNoHarm/.ufo/waves/round-19/measure-c1.mjs:122-135` declares the files it reads. Seven of those inputs change after the latest measurement: SKILL, SOURCES, the retained 404 body, date-time cases, number-range cases, decisions manifest, and validation receipt.
- No `corpus/evidence/round-19/measurement-binding.json` is present in R's tree. The per-counter JSON files are raw measurement records, not binding manifests.
- I constructed a **diagnostic, uncommitted** v1 manifest from the actual retained C1 argv, producer hash, measured revision/count, B=0, and exactly the counter's declared input population. The unchanged binding gate at explicit R, **without `--reproduce`**, exits 1: `MEASUREMENT_BINDING verdict=failed claims=1 bound=0`, reason **`counted_input_changed`**. It executes no round-19 counter or browser. Manifest SHA-256 `fc48f77037a143d3900d0787df86524615285ed246ac3896270c198bec5af6e2`; stdout SHA-256 `3f391a4fa53cb62332079d40404db5dfea17070b99fdf4310a740a9639f2071b`.

**Impacted axes:** calibration and depth. This is a current-checkpoint evidence gap, not a regression of the unchanged archival binding gates. The fresh C1 count at R was **not run by this seat**; neither 24 nor 27 is asserted here as R's freshly reproduced count. C2/C3's retained records have consistent producer hashes; this review does not infer their counts changed merely because C1 inputs did.

**Smallest safe correction:** the L1 must measure the final counted-input revision and record the existing binding contract's producer digest, explicit input population, measured revision, and before/after count; keep earlier measurements labeled historical. Do not cite the inherited round-16/17 green gates as a round-19 binding receipt. This is a fixable evidence defect; final counter reproduction remains the L1's verification responsibility.

### Separately owned live counterexample: C2 broad scan

`TabiR19.CriticSeparability` supplied a fresh R control that observed `c2_h4_properties=0`, exit0/complete, because the clean successor run failed on a new `flagged-profile-*/extensions_crx_cache/metadata.json` file at `afterClose`. I read the retained result at `/fast/scratch/tabi-r19/fx-CriticSeparability/critic-separability/R-c2.json`; this is **peer-run evidence, not my own browser run**, and I did not rerun it.

The clean result has a matching nonce, observed invocation/response, a settled refusal, complete scan, and no scan errors, but the profile-cache file is in `newFiles`. Source corroboration at `/fast/scratch/tabi-r19/fx-CriticNoHarm/scripts/webmcp-invoke-round19.mjs:812-813,841-870,898-911,2882-2889`: the new scanner includes the entire run/profile tree, gathers all new files, and requires its union to be empty. This is not evidence of claim coupling and is not covered by the 23 historical gate argv vectors.

**Impacted axis:** operability. **Smallest safe correction:** retain the required any-new-file assertion for `playwright-artifacts-*`, while separating unrelated profile churn from download-artifact classification; retain marker/ownership checks on broader roots. Do not add a filename-specific cache exemption that could conceal a planted artifact. Detailed live-probe ownership stays with CriticSeparability and the invoke sentinel; canonical acceptance cannot be inferred from a stale C2=2 record.

## Evidence retention and limits

No external source body was fetched or quoted by this seat. URLs above identify registry records; code references are local, anchored observations accessed **2026-10-21**. All stdout/stderr and clone pins for the selected gates are retained in the raw JSON below. No full suite, build, lint, formatter, all-23 rerun, fresh validation-browser run, or canonical judgment was performed.

All paths in this table are under `/fast/scratch/tabi-r19/`:

| Artifact | SHA-256 |
|---|---|
| `fx-CriticNoHarm-probe.mjs` — faithful topology + six selected gates | `2157074f24f4fbf6c9b13b0e100abd5bec7f316eb90e38691336d636ddb5d7df` |
| `fx-CriticNoHarm-probe.json` — full selected stdout/stderr, hashes, exact argv, timing, pins | `952269f8d6d8281d930424b6e96249225065251b88a03334de669ef4596dbe6d` |
| `fx-CriticNoHarm-diagnostics.mjs` — exact lesson predicate + first punctuation probe + measurement inspection | `f1a3b9c9a850752b6e4672732ab58603f1c4f6972a24bf629ea454e3c2a2a7b4` |
| `fx-CriticNoHarm-diagnostics.json` — B/R complete lesson refusal sets and partial punctuation result | `345e1749ec63a54e6dcbc5e2b973dda8e563ab20572ca8e91c9918cb42dea14a` |
| `fx-CriticNoHarm-refined.mjs` — two-row punctuation probe + diagnostic current C1 binding | `eb2a5edb82662af69ff334069cfb1234a1ac613d73aab35baa8466a44f1f75e9` |
| `fx-CriticNoHarm-refined.json` — full two-row E04 result, diagnostic manifest, binding result | `e9d8d74c2e4ac48022d33e0f57fb6a4e70cc09334b4c57cb749d22ddef888ff5` |

R's `harm-baseline.json` SHA-256: `3eb0a63acdb20fef81dcffc686c041b2a1bebb486ffc398e60ebac233d59aa2c`.

Relevant unchanged producer SHA-256 values:

- sources: `afd047874a1aa136efc252290bef8c76bb90d85f405d1ecf593e9d407125df77`;
- user history: `568c0421906278fe2d0ba0094c4bc48a5ae867bd683b1c5dfeabffe74585f273`;
- freshness: `93d196377d0553e0d94712a1e2aac099b96b0539d932fda85078fc52df96930b`;
- measurement binding: `388c2b4987bbb9f39f172cd40ca392b03bc9c869c1682b77576b0b986c14af74`.

No tools were installed or updated. No host/profile/service/domain-source mutation. All directly started finite probe/gate processes returned; no timeout or browser/service required killing. There is no scoped investigation blocker.

## Isolation

- Production changes: **none**; report-only critic. No integration, judgment, or commit performed.
- Requested private clone: `/fast/scratch/tabi-r19/fx-CriticNoHarm`.
- Branch: `r19/fx-CriticNoHarm`.
- Sandbox base and commit: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R, as required for falsification; comparison baseline B is `66251bfc1aef393e4aec599e950a8deb867736bb`).
- Production changed paths in that clone: none.
- Faithful execution clone: `/fast/scratch/tabi-r19/fx-CriticNoHarm-fleet/tabi-shokunin`; branch `master`; base/commit R. Only disposable uncommitted diagnostic inputs were added: `CriticNoHarm.sources.canonical-punctuation.md`, `CriticNoHarm.sources.canonical-punctuation-v2.md`, `CriticNoHarm.c1-record-binding.json`. No tracked file was modified.
- Seat-owned scripts/results are the six retained scratch artifacts listed above. No production commit exists beyond the unchanged R checkpoint.
- Only LANE write: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-19/w2/CriticNoHarm.md`. No git write was run in LANE, the fleet, or a sibling lane.
