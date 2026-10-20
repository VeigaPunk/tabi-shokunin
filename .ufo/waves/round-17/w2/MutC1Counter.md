VERDICT: BREAKS
Attacked: C1 COUNTER at M — whether a single reintroduced live HEAD read reduces `c1_anchor_safe` below 4.

Axes: detector sensitivity; single-defect isolation; byte-exact restoration. This is a counter-coverage finding, not a judgment or integration of C1.
M = `6c97851034e9d8f58b135d28ff969f1f28fa2f7d`.
Sandbox S = `/tmp/tabi-r17w2-MutC1Counter-YXy1/repo` (clone `--no-hardlinks` of the lane, detached at M).
Each mutant is an independent one-line, one-file commit whose sole parent is M; no mutants were stacked.
R = `scripts/check-round-contract.mjs`; U = `scripts/check-user-round-contract.mjs`; B = `scripts/check-measurement-binding.mjs`.
Source line numbers below are at M. Provenance: `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show M:<path> | sha256sum`, with M expanded above, matched the sandbox hashes recorded below.

## Detector and actual results
Expected detector: pristine/restored count 4; each HEAD-read mutant count <4. A count remaining 4 is the assigned counter-gap criterion.
Every run used the same pristine M counter, with only REV changed:
```sh
timeout --signal=KILL 240 node /tmp/tabi-r17w2-MutC1Counter-YXy1/repo/.ufo/waves/round-17/measure-c1.mjs REV --lane /tmp/tabi-r17w2-MutC1Counter-YXy1/repo
```
Pristine M ran before mutation; the common restored-M run ran after all five mutants. Five mutant detector processes ran concurrently and were fully awaited; no background jobs or delegation.
All seven detector commands exited 0, emitted parseable single-object JSON, and finished within the bound. Gate-arm exit 1 below is not a failed detector baseline: pristine and restored both reproduced the expected count 4.

| Run | Evaluated REV | `c1_anchor_safe` | Runtime ms | Mutation verdict |
|---|---|---:|---:|---|
| pristine | `6c97851034e9d8f58b135d28ff969f1f28fa2f7d` | 4 | 21915 | baseline usable |
| round-protected | `7f5480cad8f3cf5d34a040032d47d0024ab4f39f` | 2 | 18452 | killed |
| user-history | `3b6505b525528d3ffa9003711e0aaf621f84e81f` | **4** | 19701 | **survived — counter gap** |
| binding-blob | `0d223f03c6255783ca41bd10a2af4a399cb4b4f4` | 3 | 19689 | killed |
| round-witness-label | `89010951915301b8ceda76baafca2b0f8d2a58db` | 2 | 18555 | killed |
| binding-default | `1cde458397abbaf9f58e561689516d29593b7c36` | 3 | 19689 | killed |
| restored | `6c97851034e9d8f58b135d28ff969f1f28fa2f7d` | 4 | 17931 | restored detector matches baseline count |

Exact single-site substitutions:
- round-protected, R:310: `blob(root, rev, path)` → `blob(root, 'HEAD', path)`.
- user-history, U:339 (`lessonDrift`): git-log range `` `${pstackPin}..${tip}` `` → `` `${pstackPin}..HEAD` ``. All other lane-tip reads remain intact.
- binding-blob, B:591: `blobSha256(repo, atRev, counterPath)` → `blobSha256(repo, 'HEAD', counterPath)`.
- round-witness-label, R:1193: `laneTip(defaultRoot)` → `gitOk(defaultRoot, ['rev-parse', 'HEAD'])` for `codeRevision`.
- binding-default, B:941: the null-`--at` arm `laneTip(repo)` → `resolveCommit(repo, 'HEAD', '--at')`; explicit `--at` is unchanged.

Actual detector output excerpts (A/B/B2/C exit ordering):
```text
round-protected: round-contract-production pass=false exits=0/0/0/1 reasons=gate_static_head_residue
user-history: user-contract-production pass=true exits=1/1/1/1 reasons=-
user-history: user-contract-fixture-full-read pass=true exits=0/0/0/1 reasons=-
binding-blob: measurement-binding-round16-manifest pass=false exits=1/1/1/1 reasons=ab_exit_or_output_differs+b2_behavior_differs_from_a+gate_static_head_residue
round-witness-label: round-contract-production pass=false exits=0/0/0/1 reasons=gate_static_head_residue
binding-default: measurement-binding-round16-manifest pass=false exits=1/1/1/1 reasons=ab_exit_or_output_differs+b2_behavior_differs_from_a+gate_static_head_residue
```
The round-witness entry itself reports `revision_field_not_lane_tip_b`, `revision_field_not_lane_tip_b2`, `committed_not_yes_b`, and `committed_not_no_b2` (plus output-difference, label-only, and static-residue reasons).
Its B/B2 field is `code_revision=ca4afa9f99ba7698839c11f19ff8774b92fe7f16`, not mutant REV `8901095…`; `code_committed` is A=yes/B=no/B2=yes.
Both round mutants also make user production lose C sensitivity (`arm_c_not_sensitive`): A and C each print `USER_ROUND_CONTRACT verdict=failed finding=history_rewritten detail=Pstack bytes changed: M scripts/check-round-contract.mjs`. Thus count 2 is partly identity-chain fallout, not two independent HEAD-read detections.

## Surviving mutant: live history-range blind spot
For user-history the complete credited set is unchanged: `round-contract-production`, `user-contract-production`, `measurement-binding-round16-manifest`, `user-contract-fixture-full-read`.
All required checks on those four entries remain true (with `c_label_only=false`); all three gates report static residue 0. The four witness entries remain uncredited solely for `arm_c_label_only`, exactly as at pristine/restored M.
The user gate's residue output is `raw=8, excluded={nonRevision:5,site:2,fixtureFunction:1}, residue=0, lines=[]` even though its live git-log range now ends at HEAD.
At M, `.ufo/waves/round-17/measure-c1.mjs:465` defines `HEAD_TOKEN = /'HEAD'/g`; lines 486–487 ignore any line without that exact quoted token. The template-range regression therefore never reaches residue classification. Lines 384–385 explicitly acknowledge that template `..HEAD` ranges are outside the scan.
The existing user production poison adds user r07–r10 lessons (counter:107–115); its full-read poison changes a user spec (counter:172), not a protected lesson's post-addition history. Neither exposes this range regression. [INFERENCE] A detached off-branch modification of a newly added protected lesson can therefore affect the mutant's history query while the lane tip is unchanged.

Concrete repair (not applied): recognize HEAD revision/range operands, including the template `` `${pstackPin}..HEAD` ``, instead of restricting residue detection to the exact token `'HEAD'`; retain fixture exclusions. Add this one-line mutant as a counter regression requiring count <4. Also add a targeted history fixture: baseline lacks a round-N lesson, lane tip contains its initial addition, and detached P alone contains a subsequent modification; assert A=B and C reports drift. Do not relax the count contract to excuse the survivor.

## Hashes and restoration evidence
Every mutant was committed, retained under its own sandbox `refs/heads/mut-*` ref, then immediately restored with `git -C S checkout --detach M` before constructing the next mutant.
`git for-each-ref '--format=%(refname) %(objectname) %(parent)' 'refs/heads/mut-*'` showed all five full mutant hashes above with parent M.
For each mutated file, `sha256sum` was recorded before mutation, after mutation, and immediately after restoration. Final hashes again matched the initial hashes for all three gates, counter, and site inventory:

| File | Before = restored SHA-256 |
|---|---|
| R | `1579a794d9b504ff4de1f9039d5498f97706546945d7980087a3df95a6e91828` |
| U | `568c0421906278fe2d0ba0094c4bc48a5ae867bd683b1c5dfeabffe74585f273` |
| B | `388c2b4987bbb9f39f172cd40ca392b03bc9c869c1682b77576b0b986c14af74` |
| `.ufo/waves/round-17/measure-c1.mjs` | `47185c8c07bdd065b7e6cd4d1e3e3d57f07507b414c0f8bc3bb905d63a322d9f` |
| `.ufo/waves/round-17/c1-sites.json` | `90b5479f5cc272b3876b7c15dec7b2c646923fc1a1b1df4370133a4f2cf2804e` |

| Mutant | Mutated gate SHA-256 |
|---|---|
| round-protected | `7334f6731a338a81433b09f6e18fe57178ebaf93cda364b7faa69c50c13ba37c` |
| user-history | `96e3a5e7f2c795cb06f628445be9966d426962a7faa3624648600f4a57d228c3` |
| binding-blob | `e10ba413e970444d255139f36de79d42fa55a872d6c4bdb6a1e996803e6406ae` |
| round-witness-label | `080c4d05f8041b31caba417f82a9cd60d17e8d3bf634f7053f151919c63c353f` |
| binding-default | `c1d52c1b75c96dfcb00e9a09a3861857e3e937b218e8d57a7dd0aeaf4a0b0819` |

Tools: Node v24.21.0; git 2.56.0; no tool installed or upgraded. No lane git writes, production-source edits, browser actions, or integration performed.
Files written: `.ufo/waves/round-17/w2/MutC1Counter.md` only in the lane; the three gate paths and git metadata only inside `/tmp/tabi-r17w2-MutC1Counter-YXy1/repo`. Sandbox retained because the cited surviving mutant needs its reproducible commit/ref; its worktree gate bytes are restored exactly to M.
