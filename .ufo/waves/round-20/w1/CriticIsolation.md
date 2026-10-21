# CriticIsolation: round-20 w1 clone isolation and integration timing

Seat: TabiR20.CriticIsolation (critic, leaf, no dispatch). Read-only audit of precreated clones, output ownership, and nested-clone and post-return integration hazards. The only file written is this report.

Window: 09:52Z to 10:18Z. Times are given per item.

Provenance: the L1 order quoted below is known to me only through ExecCounter's account (10:17Z). I have not seen it directly.

Side effects: plain `git status`, `git diff`, `git cat-file`, `git show`, and `git log` ran without `--no-optional-locks`, so indexes may have been refreshed opportunistically. No content was written to the lane or any clone. Scratch files in /tmp were created and removed. No tests, builds, formatters, or jj commands were run. No tools were installed or updated.

## Axes

- A1 write containment (where bytes land)
- A2 commit identity and provenance
- A3 ownership completeness (every input and output has one owner)
- A4 integration timing (return boundary, SHA pinning, clone lifetime, contract versioning)
- A5 ledger observability (what the snapshot can and cannot see)

## Verdict

- A1: no breach. Lane tracked and cached diffs are empty. HEAD = master = origin/master = c49929430d996b016dde2e3a3a5be380f3433fdb (10:17Z). Wave-dir churn is L1 bookkeeping (F6).
- A2: no breach. All four writers have committed, and every commit is authored and committed as tabi-shokunin. Each touches only its assigned paths.
- A3: blocker remains. The S096 source and design.json are still untracked, so nothing commits them (F1). The S100 row that L1 requires is not registered (F9). The design sha is now decided (F15).
- A4: the return boundary is still all 64 seats settled. ExecCounter's commit 33ebd05 was L1-directed, so my advisory hold of 10:09Z is void (F16). Only the full-wave snapshot can fix the final SHAs.
- A5: the lane snapshot cannot see clone content (F5).

## Clone topology (10:17Z)

| Seat | Clone | Branch | Base | HEAD | Commits | Author | Clone state |
|---|---|---|---|---|---|---|---|
| ExecCounter | clones/ExecCounter | round20/ExecCounter | c499294 | 33ebd05 | 2 (c1dc034, then 33ebd05) | tabi-shokunin, verified | clean except untracked inputs |
| ExecFixtures | clones/ExecFixtures | round20/ExecFixtures | c499294 | 7908955 | 1 (07:16:44 -03) | tabi-shokunin, verified | clean except untracked inputs |
| ExecFrozen | clones/ExecFrozen | round20/ExecFrozen | c499294 | ce92ca3 | 1 (07:00:09 -03) | tabi-shokunin, verified | clean except untracked inputs |
| ScribeLifecycle | clones/ScribeLifecycle | round20/ScribeLifecycle | c499294 | 900cf5c | 5 (06:54 to 07:05 -03) | tabi-shokunin, verified | clean except untracked inputs |

Verified for all four:

- Independent repositories: `.git` is a directory, no alternates, one worktree line each. Origin is the lane path.
- Objects are not shared. A sampled pack and a sampled loose object have distinct inodes, each with link count 1.
- Untracked in every clone: `.ufo/waves/round-20/design.json` and the S096 source `corpus/evidence/round-20/sources/html_form_element.cc` (sha256 8c8d6796..., identical to the lane copy). The clone's design.json is the declared copy (sha256 37fa4eab...).
- Clone-local git config has no user identity, so the global fallback `r20` applies. Every commit so far carries the explicit tabi-shokunin identity.

## Planned output ownership

| Owner | Writes | Overlap |
|---|---|---|
| ExecCounter | `.ufo/waves/round-20/measure-c1.mjs` (committed in c1dc034 and 33ebd05) | none |
| ExecFixtures | `.ufo/waves/round-20/selftest-c1.mjs`, `corpus/evidence/round-20/selftests/expected.json` (committed in 7908955) | none |
| ExecFrozen | `.ufo/waves/round-20/check-wave.mjs`, `corpus/evidence/round-20/wave-check-expected.json` (committed in ce92ca3) | none |
| ScribeLifecycle | `corpus/evidence/round-20/lifecycle/decisions.json`, `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`, `.ufo/waves/round-20/lifecycle-skill-section.txt` (committed in 900cf5c) | none |
| 60 other seats | own report `.ufo/waves/round-20/w1/<Seat>.md` only | none observed |
| L1 | wave-dir bookkeeping; SKILL, README, LOG, SCORECARD, SOURCES edits | no writer owns these (F8) |

Eight output paths, four owners, no overlap.

## Findings

### F1. Blocker (A3, A4). Untracked inputs have no committing owner

Evidence: `git cat-file -e c499294:corpus/evidence/round-20/sources/html_form_element.cc` and `git cat-file -e c499294:.ufo/waves/round-20/design.json` both fail. Both are untracked in the lane and in every clone. No task commits either path.

Effects:

- measure-c1.mjs reads the S096 body and the manifest, note, and registry at the measured commit (`ls-tree -z <commit>` at line 584, `cat-file blob` at line 670). Without a committed S096 body, the counter returns could-not-evaluate or passes on absence.
- It reads no design file (see F15). design.json matters for the contract record, not for counting.
- The note's evidence pointer is not committed bytes (criterion 28).
- The S096 used-by backlink has no owner. ScribeGate's task says "Do not mutate registry."

Smallest correction: L1 commits the S096 source, the authoritative design.json (1c9f536e), and the S096 used-by row in one explicit-pathspec commit before any count. Counts run only at that commit.

### F2. High, latent (A1, A4). Directory-level staging embeds clones

Evidence (sandbox probe, git 2.56.0): `git add --dry-run -A` lists `add '.../clones/A/'` with an embedded-repository warning. After `git add -A` and a commit, the tree holds `160000 commit <sha> .../clones/A`, and `git cat-file -t <sha>` in the lane fails because the object is absent. In the real lane each clone appears as one `??` line.

Smallest correction: explicit pathspecs only. Pre-commit guard: `git diff --cached --name-only` equals the allowlist, and `git ls-files -s | grep '^160000'` is empty. Never run `git add -A` or `git add .ufo/waves/round-20`.

### F3. Resolved (A2). Identity

Every committed writer commit is authored and committed as `tabi-shokunin <tabi@shokunin.local>`: ExecCounter (c1dc034, 33ebd05), ExecFixtures (7908955), ExecFrozen (ce92ca3), and ScribeLifecycle (five commits). Import gate: every imported commit keeps that identity. Recheck it at the full-wave snapshot.

### F4. High (A4). Return boundary and SHA pinning

Evidence: ScribeLifecycle reported fdf9e14 in its report and 2f86841 by message. Git then showed b9028815 (07:00:17 -03) and 900cf5c (07:05:49 -03). L1 directed these corrections before full-wave return, so the drift is expected. ExecCounter's 33ebd05 and ExecFixtures' 7908955 also landed after the 10:09Z snapshot. `before.json` is `before-dispatch` (09:50:49.209Z) and cannot serve as a return snapshot.

Smallest correction, matching L1's sequence:

1. Wait until all 64 registry members are terminal.
2. Full-wave snapshot: lane `status -uall`, lane tracked diff, and per writer `rev-parse HEAD`, `diff --name-only c499294 HEAD`, and `status -uall`.
3. Fetch each writer by its recorded SHA into a non-master ref (for example `refs/r20/<Name>`), after confirming HEAD still equals the recorded SHA.
4. On any drift, abort and re-snapshot. Take no SHA from a message.

### F5. Medium (A5; criterion 45). Snapshot blindness and wave-directory loophole

Evidence (probe): a commit and a new file inside a clone leave the lane's `status -uall` output unchanged. Criterion 45 accepts any `??` under `.ufo/waves/round-20/`, so a writer that writes its output into the lane wave directory passes the snapshot test.

Smallest correction: compare the after-snapshot to an exact allowlist, not a directory prefix: seat reports, the seven w1 JSONs, the four clone entries, design.json, the S096 source, and named L1 files. Per writer, require `git cat-file -e <sha>:<assigned path>` for every output, and `diff --name-only base sha` as a subset of the assignment.

### F6. Medium (A3; criteria 30, 45). L1 wave-dir churn needs timestamped attribution

Evidence (lane, 10:08Z to 10:17Z):

- `design-declared.json` created 10:02:19Z (sha 37fa4eab..., 4056 B). This is the declared copy all clones hold.
- `design.json` rewritten 10:02:31Z (sha 1c9f536e..., 4198 B).
- `source-opening.json` rewritten and `source-opened.base64.gz` created at 10:02:56Z. Re-fetch ran 10:02:55.75Z to 10:02:56.80Z. decodedSha256 is unchanged (8c8d6796...). rawSha256 ff55d511..., 91040 B.
- `source-counts-before.json` (present in listings at 06:52 -03) is absent. Deleted or renamed by L1. It is in no commit.
- `lesson-history.mjs` created 10:04:46Z (1827 B, untracked). Its style matches L1's `counts.mjs`. No task names this filename. Attribution is probably L1, unconfirmed.
- `census-before.json`, `counts-before.json`, `counts.mjs`, and `run-checks.py` are unchanged since 06:51 to 06:54 -03.

Smallest correction: the ledger records each wave-dir file with timestamp and sha, and states the deletion. Commit `run-checks.py`, `counts.mjs`, and `lesson-history.mjs` before any receipt cites their digests (criterion 30).

### F7. Medium (A4; criteria 21, 46). Zero-count passes are real, and run-checks status is not the lane's

Evidence: measure-c1.mjs lines 25 to 26 state: "Baseline (manifest and note both absent) is 0 with exit 0." run-checks.py sets `lane = fleet/'tabi-shokunin'`, a fresh clone at FULL_REV. Its `statusBefore` and `statusAfter` describe that scratch clone, not the production lane, and cannot show untracked inputs.

Smallest correction: require count == 12 at FULL_REV, not exit 0 alone. Record lane `status -uall` as a separate receipt field. Fail if design.json or the S096 source is absent from the scratch clone.

### F8. Medium (A3; criteria 7, 11, 43). No owner for index edits

Evidence: no writer owns the SKILL.md splice, the corpus/README.md row and coverage counts, the LOG.md round entry, SCORECARD, the S096 used-by row, or the S100 row. The four scribes without clones (ScribeGate, ScribeMistakes, ScribeChecklist, ScribeFrontier) return drafts as text only. `lifecycle-skill-section.txt` is staging text.

Smallest correction: L1 writes these in the integration commit and re-derives every count by command at that commit.

### F9. Blocker for the counter's pass (A3; criteria 12, 28, 33, 38). S100 is required, and it is not registered

Evidence:

- L1's order, as quoted by ExecCounter: "LC11 override source S100 required."
- measure-c1.mjs pins `SUPERSEDING_SOURCE_ID = 'S100'` (line 60) for LC11. A comment near line 454 requires the S100 row's `teaches` to begin "supersedes S096 —".
- The ScribeLifecycle note cites `S096+S100`, and its commit 900cf5c renders LC11 as S100. The note says "S100 is the same file, read at more line ranges."
- `git show c499294:corpus/SOURCES.md` contains no S100 row (grep count 0; highest id S099).
- S096 remains the citing source for the other eleven decisions. A whole-row "supersedes" claim misstates that scope. Criterion 33 requires a superseding row to remove the falsified premise from every cell. Criterion 38 requires row URL to bind to fetched URL, so a same-file alias needs its own identity check and earns no source-diversity credit.

Smallest correction: L1 registers the S100 row, with its teaches wording, opened record, and same-file statement, in the integration commit, and records that it adds no source. Writers add no rows.

### F10. Medium (A4; criterion 46). Fixture and counter versions must match at integration

Evidence: ExecFixtures committed 7908955 (parent c499294, paths selftest-c1.mjs and expected.json only). Its header states it is "built against lane design.json sha256 1c9f536e..." and its subject says "for counter v3". Its expected.json is 8522 B, sha256 458a9f3f.... The fixtures have not been run, per contract. The counter they target is 33ebd05 (version 3). Version 2 (c1dc034) lacks the anchor-range binding.

Smallest correction: L1 integrates 33ebd05 and 7908955 together. The selftest and counter run at FULL_REV, and their results are recorded. If any fixture expects a version-3 behavior that is not in the integrated counter, the expectation changes with the original retained (criterion 46).

### F11. Low (A1). Push and colocated jj

Evidence: each clone's origin is the lane path. Global config sets `push.autosetupremote=true`. The lane's `.jj/repo/store/git_target` is `../../../.git`, so the lane is jj-colocated. HEAD is detached.

Effect (INFERENCE, untested; no jj command run): a `git push` from a clone would write `refs/heads/round20/*` into the lane, and jj may import those refs on its next command. A jj snapshot may also ingest the nested repos.

Smallest correction: no pushes (writers were told), fetch-only integration, no jj command in the lane until the clones are removed.

### F12. Low (A4). Integration mechanics

- HEAD is detached while `lane.branch=master`. An integration commit made with plain git lands on no branch. Advance `refs/heads/master` explicitly, since QUALITY 29 anchors on it.
- Global `rerere.enabled=true` and `rerere.autoupdate=true`. `.git/rr-cache/6ff223d.../preimage` holds a recorded LOG.md conflict. Integrate with `git -c rerere.enabled=false`.
- Unfetched writer commits exist only in clones (probe P6). Fetch by SHA before any `rm -rf` of clones, `git clean -fdx`, or wave cleanup.

### F13. Low (A1). Default cwd is the parent repository

The default cwd `/home/vgpnk/Projects/shokunin` is a git repository (HEAD master cd67417, identity r20). Its `.gitignore` line 1 (`*-shokunin/`) hides the lane, so an accidental commit there would be silent. Always use `git -C <absolute path>`.

### F14. Decision for L1 (A1, A2). Labrat clause

`w1/dispatch.json` has "except your single labrat" three times (ExecCounter, ExecFixtures, ExecFrozen). The taskCall context says "No nested agents." The registry has 64 members and no labrat. Smallest correction: strike the clause, or register any labrat with its own ledger row. The three executors were told not to dispatch.

### F15. Decided by L1, not bound in the artifact (A3, A4; criteria 22, 46)

Evidence:

- L1's order, as quoted by ExecCounter: "CURRENT lane design.json SHA 1c9f536e… is authoritative, original design-declared 37fa… retained history."
- The lane design.json is 1c9f536e (sha256). design-declared.json keeps the declared copy (37fa4eab...). Their only difference is the LC11 sourceId and the LC12 topic, and the skillRendering text. Ids and spans are unchanged.
- ExecCounter read the declared copy for spans, quotes, and the twelve-decision target. It read 1c9f536e with jq and adopted the LC11 sourceId. It ran nothing.
- measure-c1.mjs reads no design file. Its only design references are comments and pins. ExecFixtures' header names 1c9f536e, which agrees with L1.

Effects: the choice is made, but the artifact does not bind it. A receipt that cites a design sha is informational, not checked.

Smallest correction: the receipt records 1c9f536e as the declared design input, with the note that the counter does not read it. If L1 wants a mechanical binding, the counter asserts that its pins equal the design's decisions at the measured commit. Either way, re-run counts at FULL_REV (criterion 46).

### F16. Resolved by L1 order (A4, A5). The 33ebd05 commit, and a stale report

Evidence:

- ExecCounter committed 33ebd05 at 10:14:35Z. It is authored as tabi-shokunin, changes only measure-c1.mjs, and is a child of c1dc034. Its blob is version 3: git blob 5af9654f64a1816e639721d2313de33120382811, sha256 fab3bde4..., 30974 B. c1dc034 remains version 2: sha256 178bc869..., 27656 B.
- ExecCounter quotes L1's order: "Commit version3 NOW as NEW commit (never amend) … CriticIsolation advisory hold is superseded by this L1 order." My 10:09Z hold was advisory and is void. I hold nothing.
- The stale report: `.ufo/waves/round-20/w1/ExecCounter.md` line 10 still says HEAD `c1dc034`, and line 15 still reads "Commit hold: Per CriticIsolation: no further commit or amend…". ExecCounter did not correct it, because L1 told it to stop writing.

Effects: the commit is authorized, but the counter's own report contradicts git. A reader who trusts that report would integrate version 2.

Smallest correction: L1 orders ExecCounter to correct its report (its own file), or L1 declares that git, not the report, is authoritative for SHAs. The ledger row reads SHAs from git. Two counter versions remain in history. Only one may be counted, and the ledger names it.

## Verified OK

- Eight output paths, four owners, disjoint.
- Only four clones exist. The other 60 seats have no clone. The lane delta from seats is reports and hub JSON only.
- Round-20 paths do not match the visible `protectedPath` predicates (`scripts/check-round-contract.mjs:168-176`, `scripts/check-user-round-contract.mjs:226-233`). The `LEGACY_LESSON` and `SHONEN_PATH` bodies were not inspected.
- S096 source: the lane copy and all four clone copies are sha 8c8d6796...; the L1 re-fetch decoded to the same sha.
- Every writer commit touches only its assigned paths and carries the tabi-shokunin identity.
- Registry: 64 members, 64 non-null agentIds. Dispatch: 64 tasks.

## Snapshot (10:17Z)

- Lane tracked and cached diff: 0. HEAD = master = origin/master = c499294.
- Lane status: 84 entries = 4 clone dirs + 63 w1 `.md` + 7 w1 JSONs + 10 wave-dir and source entries. The 10 wave-dir entries are unchanged since 10:14Z.
- No transport bundle has been created. The four `corpus/evidence/round-17/routed/liar/originals.bundle` files are tracked baseline evidence, present in every clone.

## Ledger rows for L1 (fill at the full-wave snapshot)

- ExecCounter: HEAD 33ebd05 (parent c1dc034). Changed path `.ufo/waves/round-20/measure-c1.mjs`. Blob 5af9654f64a1816e639721d2313de33120382811, content sha256 fab3bde4..., 30974 B. Superseded: c1dc034 (content sha256 178bc869..., 27656 B). Authored tabi-shokunin.
- ExecFixtures: HEAD 7908955 (parent c499294). Changed paths `.ufo/waves/round-20/selftest-c1.mjs` and `corpus/evidence/round-20/selftests/expected.json` (8522 B, sha256 458a9f3f...). Authored tabi-shokunin.
- ExecFrozen: HEAD ce92ca3 (parent c499294). Changed paths `.ufo/waves/round-20/check-wave.mjs` and `corpus/evidence/round-20/wave-check-expected.json`. Authored tabi-shokunin.
- ScribeLifecycle: HEAD 900cf5c (five commits, parent c499294). Changed paths `corpus/evidence/round-20/lifecycle/decisions.json`, `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`, and `.ufo/waves/round-20/lifecycle-skill-section.txt`. Authored tabi-shokunin.
- For each writer, read HEAD from git at snapshot time, and record `diff --name-only base HEAD`, author, committer, and `status -uall`.

## Coordination sent

- ExecCounter: identity, explicit staging, no push, labrat clause (earlier). Design drift and the pins-versus-sha mismatch (10:09Z). My hold request (10:09Z), since superseded by L1's order. Verification of 33ebd05 and the reply on its authorization (10:15Z to 10:17Z).
- ExecFixtures and ExecFrozen: design drift (10:04Z). ExecFrozen replied it has no design dependency beyond baseline and source.path.
- ScribeLifecycle: verified commits, S100 left to L1, freeze after the last commit, return SHA read from git (earlier).

## Untested

- jj behavior with nested repositories.
- Gitiles `?format=TEXT` recheck. I made no fetch. L1's `source-opening.json` records base64 decoding.
- All counters, selftests, and gates. None were run, per contract.

## Smallest safe sequence for L1

1. Accept the decided design sha 1c9f536e (F15) and the counter 33ebd05 (F16). Decide the S100 row content (F9). Order ExecCounter to correct its stale report, or declare git authoritative for SHAs (F16).
2. Wait until all 64 seats are terminal.
3. Take the full-wave snapshot, reading each writer HEAD from git (F4, F5).
4. Fetch writers by recorded SHA into non-master refs. Commit the S096 source, the design.json (1c9f536e), the S096 used-by row, and the S100 row explicitly (F1, F9). Integrate with explicit pathspecs, the gitlink guard (F2), rerere disabled (F12), and master advanced explicitly.
5. Make index and count edits in the same commit (F8).
6. Run checks at the integrated FULL_REV. Assert count 12, record lane status, and run the selftest and the full case set (F7, F10, F15).
7. Remove clones last (F12).
