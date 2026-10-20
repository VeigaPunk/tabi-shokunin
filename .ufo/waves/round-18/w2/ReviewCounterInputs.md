VERDICT: ISSUES

# Round-18 counter-input falsification

Reviewed candidate `530f40a9bc3f10436161a2af1ca0fe9bffffc004` against baseline `2bff864fdfee684ddbcd066cc8e735adaba2735c`. At review start, `refs/heads/master` and `HEAD` both resolved to the candidate; tracked files were clean and `git status --porcelain` showed only `?? .ufo/waves/round-18/w2/`. Counter executions and mutations were performed in private `git clone --no-hardlinks` sandboxes; no Git writes or production edits were made in LANE.

Candidate SHA-256 identities observed in the private clone:

| Input | SHA-256 |
|---|---|
| `.ufo/waves/round-18/measure-c1.mjs` | `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234` |
| `.ufo/waves/round-18/measure-c2.mjs` | `71478eef46ca0c23684fd0c85467ad853cede15e862936d83bc8ce292fb7fcb6` |
| `.ufo/waves/round-18/measure-c3.mjs` | `cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a` |
| `.ufo/waves/round-18/recheck-fetch.mjs` | `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` |
| `scripts/webmcp-invoke-round18.mjs` | `0a1201a9c01e4ee23f8a94ad6d75b868c626f96c97960797acf05b6bdbfbe155` |
| `scripts/freshness-witness.mjs` | `a348912911ce63577147b4b4610ce88fa73cba888d888d158b092a74db8ecad1` |
| `corpus/evidence/round-18/routed/harm-runner.mjs` | `892466566850fd5edce2e901e20ca81dc79fa7a9957fa45380e12dfa6f03b98f` |

## Findings by severity

### HIGH — C1 accepts self-authored HTTP receipts and lets new rows replace the fixed baseline set

The claim at `.ufo/waves/round-18/PLAN.md:15-21` sets the target to **the 51 rows not superseded at B**. The receipt predicate at `measure-c1.mjs:315-377` does not bind HTTP `sha256`, quote, or excerpt to fetched source bytes: for HTTP rows, `sha256` is checked only for 64-hex shape (`:330`); the quote is required only to occur in the receipt's own committed excerpt (`:362-369`). Live fetching is optional, and the normal count does not use it (`:437-480`; plan `:76-77`). Independently, the counted set is `accepted.length` and eligibility is recalculated from the current REV registry (`:465-477`); no B row-ID set is read or checked. The self-test constructs its positive 51-row case from B (`:643-663`) but has no post-B row substitution case.

Counterexample, entirely in a private clone: renamed `S001.json` and `S001.excerpt.txt` to `S059.json` / `S059.excerpt.txt`; changed only the receipt identity/URL/command/excerpt-name fields to S059's committed URL (`https://playwright.dev/docs/api/class-browsertype`); retained S001's Chrome-blog quote, excerpt bytes, `sha256` (`c040a72e40a7bf4a00dd2942e80ed2b608d65a10959fd668d4b7bc19a89d6212`), and excerpt digest (`ae29eb05ecbea4d1bcb5f1f5bfd87c7c782de8111ce0872e864d5642af0a2bca`). This replaced one B-eligible receipt with S059, a row added after B. The sandbox commit was `4804473141465ea1a576bcacc80059575639f7ae`.

Exact counter invocation:

```text
node /tmp/tabi-r18-reviewcounter-iDAD7n/scope/repo/.ufo/waves/round-18/measure-c1.mjs 4804473141465ea1a576bcacc80059575639f7ae --lane /tmp/tabi-r18-reviewcounter-iDAD7n/scope/repo
```

Observed stdout fields: `rev=4804473141465ea1a576bcacc80059575639f7ae`, `c1_rows_rechecked=51`, `eligible_rows=58`, `held=50`, `own_work=1`, `rejected=[]`, `live=null`, `counterSha256=df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234`; exit **0**. The current REV also outputs `c1_rows_rechecked=51`, `eligible_rows=58`, `rejected=[]`, `live=null` (exit 0). Thus 51 is not evidence that all 51 B rows were rechecked; a new row and an excerpt copied from another source can replace one without changing the count.

### HIGH — C1 and C2 honor uncommitted Git replacement refs instead of immutable REV objects

C1's Git helper (`measure-c1.mjs:70-103`) and C2's sanitized environment (`measure-c2.mjs:84-118`) do not set `GIT_NO_REPLACE_OBJECTS=1`; consequently `git show`, `ls-tree`, and `cat-file` can resolve a local `refs/replace/<REV>` replacement tree while the counter continues to report the original full REV. C3 explicitly disables replacement refs (`measure-c3.mjs:59-68`).

In a private clone I ran `git -C /tmp/a/repo replace 530f40a9bc3f10436161a2af1ca0fe9bffffc004 2bff864fdfee684ddbcd066cc8e735adaba2735c`. `git rev-parse --verify 530f40a9bc3f10436161a2af1ca0fe9bffffc004^{commit}` still printed the candidate hash, but C1 read B's tree: invocation `node /tmp/a/repo/.ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004 --lane /tmp/a/repo` returned `rev=530f40a9bc3f10436161a2af1ca0fe9bffffc004`, `c1_rows_rechecked=0`, `eligible_rows=51`, baseline row-class counts, `rejected=[]`; exit **0**.

With the same replacement ref, `env TMPDIR=/tmp/a node /tmp/a/repo/.ufo/waves/round-18/measure-c2.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004` returned exit **0**, `rev=530f40a9bc3f10436161a2af1ca0fe9bffffc004`, `c2_hazards_closed=0`, and `artifact="scripts/webmcp-invoke-round17.mjs"` with SHA-256 `de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7`—the baseline artifact, not the newest round-18 artifact in the requested commit. In contrast, C3 with the same local replacement ref still returned 5/5 because its Git environment disables replacements. Thus the C1/C2 `rev` field alone does not prove their reads came from the immutable REV tree.


### MEDIUM — C1's Stack Exchange URL transform does not preserve question/answer identity

`measure-c1.mjs:217-226` checks that a Stack Overflow question URL has *some* numeric question component and that the row anchor has *some* answer ID, then constructs an API URL from the answer ID alone. It never binds the answer to the question ID or checks the API response's `question_id`. This bypasses the otherwise exact row-URL and approved-transform checks at `:328-358`.

Probe in a separate private clone: changed the S026 SOURCES URL question ID from `74920905` to `99999999`, updated receipt `rowUrl` to that changed URL, and left `url` at `https://api.stackexchange.com/2.3/answers/74926242?site=stackoverflow&filter=withbody`. The unchanged anchor still says `answer 74926242`; the committed receipt's `anchorObserved` says that answer belongs to `question_id 74920905`. Sandbox commit: `213475f92ebba47da4f92ab78151fce4acc87948`.

Exact invocation:

```text
node /tmp/tabi-r18-reviewcounter-iDAD7n/repo/.ufo/waves/round-18/measure-c1.mjs 213475f92ebba47da4f92ab78151fce4acc87948 --lane /tmp/tabi-r18-reviewcounter-iDAD7n/repo
```

Observed stdout fields: `c1_rows_rechecked=51`, `eligible_rows=58`, `rejected=[]`, `live=null`; exit **0**. No `--live` request was made for this probe. The predicate accepts a question URL and an API answer URL that refer to different questions.

### MEDIUM — C1 inherits caller `GIT_*` state and can be redirected away from the requested repository

`measure-c1.mjs:60-76` calls `spawnSync('git', ...)` without an `env`, so Node inherits the caller's environment; `git()` only prepends `-C lane` (`:70-71`). Unlike C2/C3, C1 does not clear `GIT_DIR` or isolate Git configuration. This is observable even with an explicit `--lane`.

In the private candidate clone I created an empty bare repo at `/tmp/tabi-r18-reviewcounter-iDAD7n/repo/.review-tmp/poison.git`, then ran:

```text
env GIT_DIR=/tmp/tabi-r18-reviewcounter-iDAD7n/repo/.review-tmp/poison.git node /tmp/tabi-r18-reviewcounter-iDAD7n/repo/.ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004 --lane /tmp/tabi-r18-reviewcounter-iDAD7n/repo
```

Observed stderr: `C1 counter: invalid revision: 530f40a9bc3f10436161a2af1ca0fe9bffffc004`; exit **2**. With the same clone and revision and no poison environment, C1 returned 51. The test proves `GIT_DIR` can change a valid measurement into a failure; it does not assert that a Git helper was executed. C2's whitelisted `gitEnv()` (`measure-c2.mjs:84-118`) and C3's `minimalEnv()` (`measure-c3.mjs:59-98`) both ignored the same `GIT_DIR` poison in their private-clone runs.

### MEDIUM — C2 counts a harness whose receipt lies about its producer digest

C2 selects and executes the newest committed `scripts/webmcp-invoke-round*.mjs` at REV (`measure-c2.mjs:126-143, 926-985`) and reports both its actual `artifactSha256` and the receipt's `producerSha256`. But `producerDigest()` only checks that the receipt value is 64-hex (`:528-531`); no code compares it to `artifactSha256` before counting hazards (`:845-882, 958-985`). The 21-case `--self-test` has no producer-digest-mismatch negative case.

Committed-harness counterexample in a private clone: changed only the harness's `const producerSha256 = sha256FileBestEffort(SCRIPT);` line (`scripts/webmcp-invoke-round18.mjs:1342`) to `const producerSha256 = '0'.repeat(64);`, leaving the tested behavior unchanged, then committed the one-line mutation as `8305dcb82523af8b1e05a0d357c72708bd9ac16c`. This was tested in normal revision mode, not via a worktree override:

```text
env TMPDIR=/tmp/a node /tmp/a/repo/.ufo/waves/round-18/measure-c2.mjs 8305dcb82523af8b1e05a0d357c72708bd9ac16c
```

Observed stdout fields: `rev=8305dcb82523af8b1e05a0d357c72708bd9ac16c`, `c2_hazards_closed=6`, all six hazards `pass=true`, `artifactSha256=d8199e3e58978a2d40bb436589b493d61aa79135b8fd0d8f3cdf066f54894988`, `producerSha256=0000000000000000000000000000000000000000000000000000000000000000`, `receiptSha256=a0aa073084ff4d9e92eb965c369fbe46d777991e790f1ec6fa2bc265acd65f15`; exit **0**. C2 must reject the mismatched receipt producer identity if it claims to bind the run to the selected harness.

### MEDIUM — C3 accepts tree objects and symbolic revisions as measured REV

C3's `assertRevision()` accepts any token matching a permissive rev-expression regex, then checks only `git ls-tree -d -z <rev>` (`measure-c3.mjs:100-107`). It does not require a commit object or canonicalize the reported revision; `main()` emits the original argument (`:1062-1068`). Unlike C1/C2, it therefore accepts a tree object as REV.

Exact command in a detached candidate clone:

```text
env TMPDIR=/tmp/tabi-r18-reviewcounter-iDAD7n/repo/.review-tmp/c3-run node /tmp/tabi-r18-reviewcounter-iDAD7n/repo/.ufo/waves/round-18/measure-c3.mjs '530f40a9bc3f10436161a2af1ca0fe9bffffc004^{tree}'
```

Observed stdout: `{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004^{tree}","c3_routed_closed":5,"defects":{"d1":{"pass":true,"why":"correction_line_verified"},"d2":{"pass":true,"why":"20_historical_gates_verified"},"d3":{"pass":true,"why":"adjacency_selftest_verified"},"d4":{"pass":true,"why":"S058_supersession_verified"},"d5":{"pass":true,"why":"7_reruns_verified"}},"counterSha256":"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"}`; exit **0**. The same counter also accepted `HEAD`, returned `rev:"HEAD"` and count 5 (exit 0). C1 rejected the same `^{tree}` argument with `invalid revision` (exit 2); C2 returned `c2_hazards_closed:0` with Git's `expected commit type` error (exit 2). C3 rejected `definitely-not-a-revision` (all defects unavailable, exit 2), so its gap is specifically failure to require a commit/canonical full ID.

## Verified passes and residual risks

- C1 `--self-test`: exit **0**, JSON summary `selfTest:true`, 24 cases, `allPass:true`. Its tests reject unrelated S016 URLs and arbitrary hosts, but do not cover S026 question/answer identity or baseline-row substitution.
- C2 `--self-test`: exit **0**, JSON `schema:"tabi-round18-c2-selftest-v1"`, `verdict:"pass"`, `cases:21`. The normal candidate run, with a short private sandbox path and hostile `GIT_DIR`, returned `c2_hazards_closed:6`, all h1/h2/h3/h4/s1/f6 true, `artifactSha256=producerSha256=0a1201a9c01e4ee23f8a94ad6d75b868c626f96c97960797acf05b6bdbfbe155`, `counterSha256=71478eef46ca0c23684fd0c85467ad853cede15e862936d83bc8ce292fb7fcb6`, `receiptSha256=c497b42d0c02722444a4bb4e41c9fce132b914bb4c02621d3a434015607865a2`; exit **0**. The wrapper probe reported `--rev HEAD` exit 2 and printed `refs/heads/master` while HEAD was on a poison commit. Wrapper SHA-256 at REV is `a348912911ce63577147b4b4610ce88fa73cba888d888d158b092a74db8ecad1`.
- C3 `--self-test`: exit **0**, JSON `selfTest:"pass"`, 26 cases. Candidate REV output was `c3_routed_closed:5`, all d1–d5 true, counter SHA-256 `cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a`. C3 ignored the tested ambient `GIT_DIR` poison and still returned 5.
- C3's historical producer separation is correctly implemented and observed: `REFERENCE_REV` is `93bfead1f5f25f584353df3152a60209bbd89a2e`; D2 hashes `corpus/evidence/round-18/routed/harm-runner.mjs` from candidate REV (`892466566850fd5edce2e901e20ca81dc79fa7a9957fa45380e12dfa6f03b98f`) and compares the exact 20-gate identities/exits and script digests re-derived from the historical baseline. The six historical gate-script SHA-256 values are `check-aria-metadata.mjs=d707625ef967ff0c8bf041ebb0ec70b73b76a1c04d6cc95101c79a110c4a600b`, `check-freshness.mjs=93d196377d0553e0d94712a1e2aac099b96b0539d932fda85078fc52df96930b`, `check-measurement-binding.mjs=388c2b4987bbb9f39f172cd40ca392b03bc9c869c1682b77576b0b986c14af74`, `check-round-contract.mjs=1579a794d9b504ff4de1f9039d5498f97706546945d7980087a3df95a6e91828`, `check-sources.mjs=afd047874a1aa136efc252290bef8c76bb90d85f405d1ecf593e9d407125df77`, `check-user-round-contract.mjs=568c0421906278fe2d0ba0094c4bc48a5ae867bd683b1c5dfeabffe74585f273`. D5 separately pins historical `scripts/webmcp-invoke-round17.mjs` to `de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7`. The new orchestration runner is not conflated with these gate producers.
- C2 path-length sensitivity: the harness chooses `/tmp` rather than the supplied TMPDIR when its Chromium socket candidate is ≥100 bytes (`scripts/webmcp-invoke-round18.mjs:1343-1350`), while the counter only discovers browser processes under its `run.tempPath` (`measure-c2.mjs:305-309, 423-475`). With the long private TMPDIR used in one diagnostic attempt, the candidate socket path was 148 bytes and C2 returned 3/6 (`browser argv=0`); with `/tmp/a` as the private sandbox root it was 96 bytes and the contained run returned 6/6. The long-path run is not treated as passing evidence; the harness selected `/tmp` and reported its run tree cleaned. This is a fail-closed false negative for long TMPDIRs, not a false positive.
- The C2 harness records Chromium path/executable digest/version, Playwright version/directory, and Node version in its transient receipt (`scripts/webmcp-invoke-round18.mjs:2647-2671`), but the counter emits only `receiptSha256` and deletes the sandbox/receipt (`measure-c2.mjs:855-882, 1000-1007`). The actual browser/runtime identity is therefore not inspectable from the counter output; Chromium version is recorded, not asserted by the harness.
- C1 and C2 `counterSha256` fields hash the executing file from the current filesystem (`measure-c1.mjs:480`, `measure-c2.mjs:970,989`); C3 instead reads its own blob from REV (`measure-c3.mjs:594-600`). The observed candidate runs used checked-out candidate code, but C1/C2 do not assert their executing counter file equals the requested revision's counter blob.
- No baseline-B counter run or C1 `--live` run was performed in this seat. No public-source request was made. No tools were installed or updated.
- LSP is unavailable in the provided device set: `read xd://lsp` returned `No such tool: xd://lsp`. No LSP status/references/definition/diagnostics result is claimed; no text grep is presented as semantic proof.
- The plan makes no scalar promotion or saturation claim. C2 tests one canonical latest-at-REV round-18 harness; C3 intentionally uses a distinct historical round-17 harness for D5.

Files written: /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/ReviewCounterInputs.md
