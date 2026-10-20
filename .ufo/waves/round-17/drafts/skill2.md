## Round 17 — lane-tip anchoring, freshness witness rule, adjacency map, WebMCP invocation (2026-10-20)

Appended after `SKILL.md:1892` (end of file; `git diff --stat 5859243 6c97851 -- SKILL.md` is empty, so the append point is unchanged). Nothing above is edited. Paths are lane-relative. Pinned values are read at the wave-2 measured revision `6c97851034e9d8f58b135d28ff969f1f28fa2f7d` ("M"); the baseline is `5859243183c4d7ac5429dfdb8a73ce0d9a43d583`. No count is asserted in this append (see §8).

This append supersedes `.ufo/waves/round-17/drafts/skill.md` overrides 1–6 and its `<<SHA>>`/`<<C2>>`/`<<C3>>` placeholders; the corrected jj overrides are §7 (`w1/RevSkillJjRule.md` R1–R10 with its D1–D7 defects applied).

### 1. Lane-tip anchor rule (C1; jj evidence S049–S052)

Why:
- The lane is jj-colocated. Git HEAD is detached after the first helper commit and can name an unlanded or empty commit: `.ufo/waves/hyaku/jj-w1/reports/JjAuditTabi.md:44-68` (F1, after `jj new` HEAD `68d0582` is on no branch and both gates print clean), `:69-94` (F2, `HEAD != master`, `@{u}` fails, `git status` clean), `:95-131` (F3, HEAD can hold snapshot content on no branch).
- Source status at M: S049 (jj 0.45.1 colocated git HEAD is jj-owned and usually detached), S050 (jj 0.45 resets Git HEAD to the working-copy parent), S051 (`git symbolic-ref -q HEAD`: exit 0 + branch when attached, exit 1 silently when detached), S052 (`rev-parse --verify --end-of-options`) are all `queued` in `corpus/SOURCES.md` at M. Per `PLAN.md` "L1 amendments" (last bullet), a row cites them as mined only after L1 mines them. Until then this rule rests on JjAuditTabi F1–F3 and the gate code below.

Rule:
- Every recorded revision is the lane branch tip, printed as 40-hex. Never record bare `HEAD`, `@{u}`, `--abbrev-ref HEAD` or `branch --show-current`. The lane branch is `master` (`PLAN.md:3-5`).
- Branch tip: `git rev-parse --verify refs/heads/master` (read-only; not a git write).
- When `--at` is omitted, each gate resolves the tip itself: attached HEAD → its own branch; detached HEAD → `refs/heads/master`; a symref anchor, a reflog-spelled anchor or a non-commit → could-not-evaluate naming the anchor. Code: round gate `laneTip` `scripts/check-round-contract.mjs:114`; user gate `laneTip` `scripts/check-user-round-contract.mjs:160`; binding gate `laneTip` `scripts/check-measurement-binding.mjs:267`, default `--at` `:941`; adjacency gate `resolveLaneTip` `scripts/check-adjacency.mjs:410`. An explicit `--at` names a commit; the adjacency gate refuses HEAD-relative tokens (`scripts/check-adjacency.mjs:447-454`).
- Read-only status: `jj-lane.sh state` calls `git status --porcelain` (`scripts/hyaku/jj-lane.sh:78`) and moves `.git/index` mtime; `GIT_OPTIONAL_LOCKS=0` does not (JjAuditTabi F5, `:163-182`). Use `GIT_OPTIONAL_LOCKS=0 git status --porcelain` for a status read. OPEN (L1 ruling): the operator prompt names `jj-lane.sh state` as the source of `local=` and `ahead=` (`.ufo/prompts/tabi-round-17.md:256-283`); `state` is the only documented `ahead=` source, and F5 says it is not read-only.
- Landing (R10, §7): commit only through the helper, `/home/vgpnk/Projects/shokunin/scripts/hyaku/jj-lane.sh commit /home/vgpnk/Projects/shokunin/tabi-shokunin --as tabi -m "round-17: <what>" -- <repo-relative path>...`. Cite only the `landed <hash>` line (helper output contract `scripts/hyaku/jj-lane.sh:58-59`; printed by `report_landed` `:252`, `:258`). Exit 3 = committed, not pushed → `jj-lane.sh push <lane>`, never force.
- Never run in the lane: `git add|commit|stash|checkout|switch|reset|pull|push`, or a mutating jj command (`new`, `commit`, `describe`, `squash`, `rebase`, `abandon`, `bookmark`, `undo`, `op restore|revert`, `git push|fetch`) (`.ufo/prompts/tabi-round-17.md:256-283`). A gate or selftest that runs git writes runs on a sandbox clone.
- Identity chain: `scripts/check-user-round-contract.mjs:35` pins `ROUND_SCRIPT_CURRENT_SHA256 = 1579a794…`, which equals the sha256 of `scripts/check-round-contract.mjs` at M (§3). That is this round's current identity; executors do not edit that constant (L1 owns it).

### 2. Freshness witness: why not `--witness HEAD` (check-freshness is byte-frozen)

Why-not (fix is a rule, not code):
- `scripts/check-freshness.mjs` is byte-identical at baseline and M (`git diff --name-only 5859243 6c97851 -- scripts/check-freshness.mjs` is empty; sha256 `93d19637…`, §3). It is in `protectedPath` for both round gates: `scripts/check-round-contract.mjs:168-177` (entry `:175`) and `scripts/check-user-round-contract.mjs:226-235` (entry `:233`). At baseline the same functions were at `:94-103` and `:144-153`.
- It accepts any `--witness` value that does not start with `--`: `scripts/check-freshness.mjs:49-50`. The value goes to `git show -s --format=%ct` (`:65`) and into the printed `revision=` field. Result: `--witness HEAD` prints `revision=HEAD` (JjAuditTabi F6 `:184-194`; F1 output shows the same run clean while HEAD `68d0582` was on no branch).
- The sibling gates require hex: `scripts/check-round-contract.mjs:286` and `:290`; `scripts/check-user-round-contract.mjs:375` and `:379` (`/^[a-f0-9]{7,40}$/`).

Invocation rule (run from the lane root; after the landing reports `ahead=0`):

```sh
cd /home/vgpnk/Projects/shokunin/tabi-shokunin && node scripts/check-freshness.mjs --witness "$(git rev-parse --verify refs/heads/master)"
```

The witness must descend from the baseline (`scripts/check-freshness.mjs:68`) and have `%ct` at or above the threshold (`:65-67`). The round and user gates' `--witness <rev>` is not the tip: it names the revision whose gate bytes are the red-before arm (usage text `scripts/check-round-contract.mjs:286`, `scripts/check-user-round-contract.mjs:375`). Do not pass the tip to those.

### 3. Registry rows — changed and new gates (C1, C2, C3)

Verdict map (all rows): 0 clean · 1 failed/finding · 2 could-not-evaluate. Write scope: none in the lane; self-tests create and remove temporary repos only. sha256 = `git show 6c97851034e9d8f58b135d28ff969f1f28fa2f7d:<path> | sha256sum`.

| Name | Kind / owner | Entry (argv) | Pinned / checked | sha256 at M |
|---|---|---|---|---|
| historical-pstack-contract | gate / tabi | `node scripts/check-round-contract.mjs`; `--witness <rev>`; `--count-witness <rev>`; `--self-test`; isolated fixture `--repo PATH --baseline HASH --expect N` (argv `:272-290`) | HARD_BASELINE `:11`; LEGACY_GATE_BLOB `:38`; COUNT_WITNESS_BLOB `:42`; COUNT_WITNESS_REV `:43`; `isProduction` `:51`; tip `laneTip` `:114`; APPEND_ONLY `:25`; protectedPath `:168-177` | `1579a794d9b504ff4de1f9039d5498f97706546945d7980087a3df95a6e91828` |
| historical-user-contract | gate / tabi | `node scripts/check-user-round-contract.mjs`; `--witness <rev>`; `--count-witness <rev>`; `--diagnostic-witness`; `--self-test` (argv `:361-379`) | HARD_BASELINE `:12`; PSTACK_PIN `:13`; ROUND_SCRIPT_CURRENT_SHA256 `:35` (L1 only); LEGACY_USER_GATE_BLOB `:54`; tip `laneTip` `:160`; protectedPath `:226-235` | `568c0421906278fe2d0ba0094c4bc48a5ae867bd683b1c5dfeabffe74585f273` (see §8 item 1) |
| measurement-binding | gate / tabi | `node scripts/check-measurement-binding.mjs --check <manifest> [--at REV] [--reproduce] [--json]`; `--legacy <measurements.json> [--at REV]`; `--self-test`; `--reasons` (usage `:14-17`) | `--at` default = lane tip `:941`; `laneTip` `:267`; round-16 manifest `corpus/evidence/round-16/measurement-binding.json` sha256 `72c77ed4a32038416f094b2ca685c5a2de9fbe29739f298663615706d1caee64`; round-17 manifest `[pending L1]` | `388c2b4987bbb9f39f172cd40ca392b03bc9c869c1682b77576b0b986c14af74` |
| measurement-binding selftest | selftest / tabi | `node scripts/selftest-measurement-binding.mjs [--gate <path>]`; spawned by `--self-test` (`check-measurement-binding.mjs:788-799`) | detached case `lane_tip_detached_off_branch` `:462` (fixture `detachedOffBranch` `:446`) | `8324692c65ca630dd31283e9840ea191b8ee973a1132e40465b6978122e426b3` |
| freshness (invocation rule only) | gate / tabi | `node scripts/check-freshness.mjs --witness "$(git rev-parse --verify refs/heads/master)"` (§2) | byte-frozen; `--witness HEAD` accepted, never passed | `93d196377d0553e0d94712a1e2aac099b96b0539d932fda85078fc52df96930b` (unchanged since 5859243) |
| check-adjacency | gate / tabi (C3) | `node scripts/check-adjacency.mjs [--at REV] [--json] [--fleet <dir>] [--repo <dir>]`; `--self-test`; `--reasons` (argv `:1080-1110`) | data `corpus/adjacency.tsv` (§5); `--at` default lane tip `:410`; `--fleet` default = parent of the lane (`:503`); sandbox clones must pass `--fleet` (usage `:32-38`) | checker `5a7ea9a2bf584c7cc610653510b5f91ff287d7994c503b60b9b0790120170aff`; data `7319ccccdd1b339d9b661ac46ca1a0c379a050e19ca03906e235ee61b7a9bf85` |
| webmcp-invoke-round17 | harness / tabi (C2) | `node scripts/webmcp-invoke-round17.mjs [--out PATH] [--fixtures DIR] [--chromium PATH] [--force]` (usage `:42-45`) | verdict/exit `:49-50`: pass→0, fail→1, could_not_evaluate→2; refuses to overwrite differing receipt bytes unless `--force` | `de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7` |
| webmcp-invocation receipt | receipt / tabi (C2) | `corpus/evidence/round-17/webmcp-invoke/receipt.json`; stdout `receipt.stdout.txt` sha256 `a183161b886d58eee7b5b5d88f491fa5a9c341e7880ab538bac6fcec58ce3737` | schema `tabi-round17-webmcp-invoke-v1`; `verdict pass`; `summary` cases 11/11, controls 4; `producerSha256` = harness sha (matches) | `0cfaeb7ed1b81ba797d81c23de41a4b9a24ad46b17c412f445278c26d17ce346` |
| webmcp-invocation note | knowledge / tabi (C2) | `corpus/knowledge/webmcp-invocation-round-17.md` (`source: S041`–`S048`) | §6 | `4896084105f2a2627a9d404de9c18d234ea84bc03fb0424cb3ae12c35a111427` |
| preflight failed receipt | evidence (kept history) | `corpus/evidence/round-17/webmcp-invoke/preflight-smoke-failed.json` | not counted; never delete | `71a0df0d3bd6238860cfd139bb2f2e75adc82ec07223316304d4eb9edaa9cb3e` |

Counters (not gates; L1 runs them, §8): `.ufo/waves/round-17/measure-c1.mjs` `47185c8c07bdd065b7e6cd4d1e3e3d57f07507b414c0f8bc3bb905d63a322d9f`; `measure-c2.mjs` `2cba594b5b4e1be332b8949d64ba1a3218843d1332c10e7a58789459f9ec17ac`; `measure-c3.mjs` `8dec49726e968934df85c53c72ec30e09d8fb6e1d8cd67c125ea9759fca007c3`. Usage `node .ufo/waves/round-17/measure-cN.mjs REV`; definitions `PLAN.md` C1/C2/C3 sections.

C1 fixed entry list (`.ufo/waves/round-17/measure-c1.mjs:94-164`, ids): `round-contract-production`, `user-contract-production`, `round-contract-count-witness`, `user-contract-witness`, `user-contract-count-witness`, `user-contract-diagnostic-witness`, `measurement-binding-round16-manifest`, `user-contract-fixture-full-read`. `check-freshness` is excluded (byte-frozen). Label-only entries are reported and not credited.

Detached-HEAD self-test cases (the C1 "must fail against baseline bytes" requirement): round gate `lane_tip_detached_head` (`scripts/check-round-contract.mjs:904`); user gate `detached_head_reads_lane_tip` (`scripts/check-user-round-contract.mjs:1290`); binding selftest `lane_tip_detached_off_branch` (`scripts/selftest-measurement-binding.mjs:462`). Red-before evidence recorded by the gate seats: binding at baseline gate bytes `verdict=failed cases=76 reasons=13`, exit 1, including `lane_tip_detached_off_branch` (`w1/GateBindAnchor.md:53-55`); round production on baseline bytes exits 1 `finding=report_missing` for the jj-like detached fixture (`w1/GateRoundAnchor.md` Measurements 2); user new-case red/green table (`w1/GateUserAnchor.md:44-47`).

Self-test case totals as measured by the gate seats (not re-measured at M): round `cases=38` (`w1/GateRoundAnchor.md` Measurements 3); user `cases=45` (`w1/GateUserAnchor.md` Regression); binding `cases=76` (baseline `cases=59`, `w1/MutBindSelftest.md:26`; `w1/GateBindAnchor.md:50-52`).

### 4. Verdict map and reason vocabulary — check-adjacency (C3)

- Exit classes: 0 evaluated clean; 1 evaluated, per-row findings; 2 could not evaluate (`map_unreadable`, `map_schema_invalid`, `revision_unresolved`, `lane_tip_unresolved`, `git_failed`, `usage`) (header `scripts/check-adjacency.mjs` "Exit classes").
- Text stdout: first line `ADJACENCY verdict=clean|failed|could_not_evaluate rows=N verified=M`, then one sorted `finding row=<n|-> reason=<reason> detail=<text>` line per finding (`:147`). `--json`: exactly one JSON object line (`:151`). `--reasons` prints the closed vocabularies as one JSON line (`:160`).
- `--fleet` defaults to the parent directory of the lane (`/home/vgpnk/Projects/shokunin` for `/home/vgpnk/Projects/shokunin/tabi-shokunin`). Siblings resolve as `<fleet>/<lane>-shokunin`; both must be non-symlink directories whose git toplevel is exactly that directory (`:32-38`). A sandbox clone must pass `--fleet <real fleet>` so the cited sibling commits resolve (`:38`).
- Every git child runs with `GIT_CEILING_DIRECTORIES` set to the repo's parent, so a broken lane `.git` cannot fall through to the fleet repo (`:39-41`).
- Sibling pins must be reachable from the sibling's `refs/heads/master`, then `refs/heads/main` (`:58-66`).
- Self-test: `node scripts/check-adjacency.mjs --self-test` (builds a disposable fleet; `selfTest` `:1249`).

### 5. Adjacency map and integrator-ruling record (C3)

`corpus/adjacency.tsv` at M: header line 1, then nine TAB-separated rows (lines 2–10). Columns: `surface sibling sibling_ref sibling_quote tabi_ref tabi_quote disposition ruling_ref ruling_quote`.

| line | surface | sibling | tabi_ref | disposition | ruling_ref (short) |
|---|---|---|---|---|---|
| 2 | cdp-runtime-observation | kaidoku | `PROVINCE.md:9` | ruled | `tabi-shokunin@5859243…:corpus/lessons/round-16-verifier-spotcheck.md:142` |
| 3 | reverse-engineering-forensics | kaidoku | `PROVINCE.md:15` | refused-route | `-` |
| 4 | reverse-engineering-forensics | revenger | `PROVINCE.md:15` | refused-route | `-` |
| 5 | crawler-discipline-vs-publishing | kake | `PROVINCE.md:16` | split-declared | `-` |
| 6 | musketeer-cdp-9222-profile-lease | kake | `SKILL.md:556` | contested-open | `fleet@ebeb396…:.ufo/l0-questions.md:62` |
| 7 | musketeer-cdp-9222-profile-lease | kagi | `SKILL.md:556` | contested-open | `fleet@ebeb396…:.ufo/l0-questions.md:62` |
| 8 | secrets-and-session-material | kagi | `PROVINCE.md:16` | refused-route | `-` |
| 9 | cdp-consequential-submissions | kasegi | `SKILL.md:727` | refused-route | `-` |
| 10 | kimi-webbridge-plugin-internals | kumitate | `PROVINCE.md:6` | split-declared | `-` |

Totals by disposition: ruled 1, contested-open 2, split-declared 2, refused-route 4 (9 rows). Sibling pins: kaidoku `9011581d…`, revenger `cf024192…`, kake `7c61c8cc…`, kagi `c2cab35b…`, kasegi `922a4dde…`, kumitate `1770305f…` (full 40-hex in the TSV).

Integrator ruling (row 2): `corpus/lessons/round-16-verifier-spotcheck.md:141-142` at 5859243 — line 141: "**tabi** owns live browser/CDP page observation, including the WebMCP page-tool surface."; line 142: "**kaidoku** keeps CDP only as an REA provider surface for shipped-artifact analysis (`kaidoku-shokunin/PROVINCE.md:53` …)". The self-venue is admitted because the last touching commit `5859243` is authored by `protocol-shokunin`, not `tabi-shokunin` (`git log -1 --format=%an 5859243 -- corpus/lessons/round-16-verifier-spotcheck.md`).

Contested-open (rows 6–7): fleet `.ufo/l0-questions.md:62` at `ebeb396f7db43c55de2711baa409f8bb9b71147b` — a `tabi | round-17 |` line: "Contested scope, no ruling on record: the the-musketeer Chrome profile / CDP 127.0.0.1:9222 lease named by kagi (…) and kake (…)". No ruling exists; the disposition stays `contested-open` until L0 rules. The lane does not rule on it.

### 6. WebMCP invocation (C2)

Scope (`corpus/knowledge/webmcp-invocation-round-17.md:14-29`): Chromium `154.0.8037.97` (`/usr/bin/chromium` launcher sha256 `eaed39c3…`, executes `/usr/lib/chromium/chromium` sha256 `95b17db7…`), flag-enabled, loopback fixtures only. Receipt: `verdict pass`, 11/11 required cases, 4/4 controls. Round-16 recorded no invocation (`knowledge/webmcp-chromium-loopback-round-16.md:127`); a round-16 probe invoked one echo tool without run identity or predicates (`:21-27`).

Decision table — what an invocation claim may assert from which evidence (note `:67-78`; copy the rule, do not widen it):

| Claim | Evidence required | Admissible? |
|---|---|---|
| "Tool T on page P, invoked with input I, returned O on build B" | one `invocationId` across `invokeTool`, `toolInvoked`, `toolResponded`; same nonce in the page-side ledger; flags and fixture digests | yes: loopback fixtures, flags on, 154 only |
| "`invokeTool` returned an id, so the tool ran" | the id alone | no: the command answers before tool events; outcome is `toolResponded.status` |
| "The tool failed with message M" | `status:"Error"` + `exception.description` | yes; `errorText` is empty on throw/reject, never read M from it |
| "Chromium validated the input against `inputSchema`" | — | no: mismatching input ran (`invoke-input-schema-mismatch`); the 154 Blink path checks only JSON syntax and is-object (S042) |
| "A pending call is cancelled by navigation / unregistration" | — | no: navigation left no `toolResponded` in the window; unregistration does not cancel; only `cancelInvocation` produced `Canceled` |
| "`toolResponded` identifies tool and session" | — | no: pair through `toolInvoked` by `invocationId` (S041, S044) |
| "Invocation works without the page feature" | — | no: flag-off has no `document.modelContext` |
| "Declarative invocation is spec behaviour" | — | no: cite the receipt and S033–S035, never S020 |
| "An agent or MCP client invoked the tool" | — | no: a test harness drove CDP |
| "Invoking a real site's tool is safe" | — | no: only fixture-owned tools with no external effect |

Cases (receipt; predicates fixed in the harness before the run, each with its function sha256): `invoke-imperative-success`, `invoke-imperative-throws`, `invoke-imperative-rejects`, `invoke-unknown-tool` (`-32602 Tool not found`), `invoke-input-schema-mismatch` (ran as `echo:undefined`), `invoke-declarative-form`, `invoke-after-unregister`, `invoke-concurrent-ids`, `invoke-flags-off-control`, `invoke-iframe-frameid`, `invoke-navigation-pending`; controls `invoke-before-enable`, `invoke-cancel`, `invoke-declarative-navigation-result`, `invoke-domain-disabled` (note `:42-63`).

Limits (note `:90-97`): one build, one host, flags on; Chromium 152 and unflagged profiles untested; confinement is page-level (WebRTC, WebTransport, SharedWorker not recorded); navigation result bounded by an 8,000 ms window; the iframe tool's `toolsAdded` was not seen; tool names, schemas and outputs are page-declared untrusted data.

Recheck (note `:120-126`): `node scripts/webmcp-invoke-round17.mjs --out /tmp/webmcp-invoke-recheck.json` from the lane root (0 pass, 1 fail, 2 could not evaluate). A changed `chromium.version` or `realExecutableSha256` makes every row historical until re-run.

Unchanged row (round 16, `SKILL.md:1878`): loopback fixtures only; never on an external site without operator approval.

### 7. jj-era overrides (append-only; supersede the earlier revision-reading text)

Each override names the text it replaces. Earlier rows stay as written.

- R1 — new anchor rule: §1. Helper citation corrected: the current helper prints `landed <hash>` (`scripts/hyaku/jj-lane.sh:58-59`), not `pushed`.
- R2 — overrides `SKILL.md:1851` ("`--check --reproduce` that is clean at the delivered HEAD"): read "the delivered lane tip": the `landed <hash>` 40-hex with `jj-lane.sh state` `ahead=0 behind=0`, passed as `--at <tip>`, or omitted on the measurement-binding gate (default lane tip `scripts/check-measurement-binding.mjs:941`). A detached HEAD is never a delivered revision.
- R3 — overrides `SKILL.md:1840` (`--at` default): after C1 the default is the lane tip (`:941`, `laneTip` `:267`); explicit `--at REV` is unchanged. The pre-C1 default `options.at ?? 'HEAD'` is historical: `git show 5859243:scripts/check-measurement-binding.mjs` line 833.
- R4 — overrides `SKILL.md:1337-1346` (round-11 T1 stamp table): `:1341` (`git log --oneline -1; git show --stat`) and `:1346` (`git log --oneline -1; git status --short`) print the detached commit. Re-stamp with `git rev-parse --verify refs/heads/master` and `GIT_OPTIONAL_LOCKS=0 git status --porcelain`. `:1341` locates the round-11 closeout commit, not the tip: use the `LOG.md` pointer or `git log --all --oneline --grep='round-11'`.
- R5 — overrides `SKILL.md:704` (`git show HEAD:SKILL.md`): that command no longer reproduces the note. `HEAD:SKILL.md:225` is the cleanup block; the cited mid-edit revision is a content sha256 prefix (`ea7122d92d7b`) with no git object. Resolve by the quoted rule text (`:705-706`) or a pinned blob sha256; never HEAD.
- R6 — overrides the rev-less reads at `SKILL.md:1298` (`git show -s --format=%cI`) and `:1341` (`git show --stat`): pass the explicit 40-hex.
- R7 — overrides `SKILL.md:1505-1511`: `REV` is the recorded witness 40-hex (`:1505`), not `HEAD`. A later branch tip is valid only while `git diff --quiet "$REV" "$TIP" -- corpus/evidence/fleet-round-1-freshness/pins.tsv` holds.
- R8 — overrides `SKILL.md:1559` (`--witness REV`): a 40-hex lane revision, never `HEAD`. Invocation: §2.
- R9 — overrides `SKILL.md:1677-1678` and `:1800` (round and user gate rows): production mode is bound to the lane root (`isProduction`, `scripts/check-round-contract.mjs:51`); committed reads use the lane tip after C1 (`laneTip` `:114`). There is no production revision flag (`--repo` turns `isProduction` off). Run production only when the lane is at `ahead=0`, and record the 40-hex.
- R10 — gap-fill, landing: §1 "Landing" and "Never run in the lane". Exit 3 → `jj-lane.sh push`, never force.

### 8. Pending at integration — open items (L1 rules or fills)

1. User-gate measurement gap. M's `scripts/check-user-round-contract.mjs` is sha256 `568c0421…` (§3). Every recorded user-gate measurement (`w1/GateUserAnchor.md:7` "sha256 after `5c30b14c…`"; `w1/C1Counter.md:89` "user `5c30b14c…`") was taken on `5c30b14c…`, which is not the M blob. No wave-1 report measures `568c0421…`. Before any user-gate count, pass, or `cases=` claim is written: re-run the user self-test, witness, count-witness, diagnostic-witness and the C1 entries 2, 4, 5, 6 and 8 at M.
2. Counts at M are not measured in this append. Recorded counts were taken at sandbox commits that are absent from the lane object store (`git cat-file -t` → absent for `7babdfd2…`, `a84459cd…`, `66b80768…`, `8c330c8d…`): C1 `c1_anchor_safe=4` (`w1/C1Counter.md:113`, at 7babdfd, user gate `5c30b14c`); C2 `c2_invocation_held=1` (`w1/C2Counter.md:62`, at a84459cd); C3 `c3_adjacency_verified=9` (`w1/C3Counter.md:95-98`, at 66b80768, TSV sha `7319cccc…` = M, checker sha not recorded). L1 runs `node .ufo/waves/round-17/measure-c1.mjs 6c97851034e9d8f58b135d28ff969f1f28fa2f7d` (and c2, c3) at M and records the one-line output. Until then the SKILL row states no count.
3. Read-only conflict: F5 (`jj-lane.sh state` is not read-only) versus the prompt's instruction to read `ahead=` from `state` (`.ufo/prompts/tabi-round-17.md:256-283`). §1 uses `GIT_OPTIONAL_LOCKS=0 git status --porcelain` for status and keeps `state` for `ahead=`; L1 rules.
4. Sources S049–S052 are `queued` at M; the §1 text does not cite them as mined.
5. Round-17 manifest `corpus/evidence/round-17/measurement-binding.json` is absent at M; L1 writes it, and §3's `[pending L1]` stays open until then.
6. Self-test case totals in §3 were measured by the gate seats, not at M; re-measure with the §3 argv.
7. `check-freshness --witness HEAD` remains accepted by the byte-frozen gate (§2). The rule, not code, is the fix.
