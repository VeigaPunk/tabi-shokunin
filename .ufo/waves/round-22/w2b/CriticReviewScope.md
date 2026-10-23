# CriticReviewScope — round-22 w2b (author-side falsification)

Seat `TabiR22-2.CriticReviewScope-16`, critic, leaf. Item: does any round-22 artifact claim a review of bytes it did not review (for example W2 claims on `0f24164`, or W1 reviewing drafts)? This applies the round's own chronology classifier to the round itself.
Boundary: committed `e3cf4e0d30bb835532ff44b118c5ad52e09eb76d` (E3). I also read retained untracked round-22 wave artifacts in the lane worktree, which I name as untracked.

## Bottom line

No committed round-22 artifact credits W1 or W2 with reviewing the bytes at `0f24164` (0F) or E3. The W2 non-review is recorded honestly at `post-crash-repair.json:67`. The W1 reports pin draft identities that differ from 0F, and no document relabels them as final-byte review.

There are still six scope and provenance defects, F1 to F6. The most important is **F1**: a committed artifact labels this author-side w2b wave as the "non-author review" of the repair. F2 to F6 are a misstated refusal and crash chronology in the w2b boundary, check claims with no retained identity, an untracked receipt inside the boundary, citations to artifacts that do not exist, and ambiguous "reviewed" labels.

## Classifier applied to round-22 (static; the classifier was not executed)

The rule is at `E3:.ufo/waves/round-22/check-review-chronology.mjs:226-244`. It reports a gap when the producer digest mismatches, the artifact scope mismatches, or acquisition finishes after the review observation.

| Review → target | Reviewed identity (observed) | Review clock | Target finish | Static verdict | Claimed anywhere as final review? |
|---|---|---|---|---|---|
| W1 Attack/Critic/Rev seats → 0F oracle `76b47edd…` | Clone drafts `3d3a22e4…`/`fb6f2aca…`/`b45d41bf…` (`w1/AttackRevision.md:17-23`). Lane intermediate `a1d977a8…` (`w1/AttackDelayed.md:5`). Design only (`w1/CriticReview.md:90`). | ≤ `15:33:51Z` (`w1-returns.json` readAt upper bound) | 0F committer `15:35:37Z` | `review_scope_gap` (scope mismatch + acquisition after review) | **No.** `integration-changes.json` says "not yet executed". `LOG.md:1561-1562` says "not yet exercised". |
| W2 → 0F | none: 0 seats | none | — | nothing to classify | **No.** `post-crash-repair.json:67` explicitly denies it. |
| L1 `checks-pre-w2-0f24164.json` → 0F | Producer `76b47edd…`/`9e3f976c…` recorded per run | `16:30:18Z–16:31:28Z` | `15:35:37Z` | matched (author-side check, not review) | correctly labeled |
| L1 `checks-at-e3cf4e0.json` → E3 | Producer `47176aed…` recorded | `16:38:34Z–16:39:42Z` | E3 `16:38:27Z` | matched, but the receipt is untracked (F4) | — |
| Sandbox selftest/probes → `filesAfter` | **none recorded** | none | — | `producer_digest_unavailable` | `post-crash-repair.json:45-60` asserts the results (F3) |
| w2b → E3 | E3 per spec | spawn `17:14:05Z` | `16:38:27Z` | chronology OK | pre-labeled non-author (F1) |

Preserving positives I checked:
- All 44 `review-snapshot.json` path digests and byte counts equal the actual 0F blobs.
- All 64 `w1-returns.json` `reportSha256` values equal the 0F report blobs.
- The `post-crash-repair.json` `filesBefore` digests equal the 0F blobs, and its `filesAfter` digests equal the E3 blobs and the current worktree.
- `claim-classification.json` (`14:57:22Z`) cites W1 CriticClaim, CriticScope and ConnPlanner. Those files' final mtimes are 14:53–14:54Z, so they were cited after they were written.

## Findings

### F1 — HIGH (false provenance, non-author vs author): `post-crash-repair.json` pre-labels w2b as non-author review

- **Where:** `E3:.ufo/waves/round-22/post-crash-repair.json:67` says "Non-author review of this repair is the fresh post-crash wave and the closure."
- **Contradicted by:**
  - The same file at line 4: `"author": "TabiR22-2 (session-3 replacement L1)"`. That L1 dispatched w2b (`w2b-spawn-result.json`).
  - The w2b boundary (`w2b-spec.json:3`): "This is author-side falsification, not non-author admission."
  - The note at `E3:corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:113-114`: "All author-dispatched reviewers remain author-side; independent non-author admission … not self-attested."
- **Smallest counterexample:** a judge reads E3 `post-crash-repair.json` alone and credits all 65 w2b seats as non-author review of `47176aed…`. Every one of those seats was dispatched by the repair's own author.
- **Preserving positive:** the "closure" half stays valid. A genuinely non-author closure remains admissible as non-author review.
- **Smallest fix:** add an append-only post-w2b sidecar (do not rewrite the committed bytes): `{"supersedes":"post-crash-repair.json#/honesty","authorSideReview":"w2b (dispatched by TabiR22-2)","nonAuthorReview":"closure only"}`.
- **Axes:** honesty and review scope.

### F2 — MEDIUM (chronology of this round): the w2b boundary misstates the W2 refusal count and the crash order

- **Where:** untracked `w2b-spec.json:3` says "14 whole-payload cap refusals, 0 seats; its host session then died". My own assignment repeats this.
- **What the evidence shows:**
  - Only 13 refusals are retained: `w2-cap-refusal-01..09.json` (15:41–16:07Z) and `-11..14.json` (16:28–16:36Z).
  - Attempt 10 is not an observed refusal. `w2-cap-refusal-11.json:16` says: "attempt 10 by dead TabiR22 is unrecorded: slot granted 16:10:37Z, kernel died 16:10:51Z before any result". The host transcript tail agrees: "backoff before attempt 10" then "[Kernel died during execution; completion is uncertain…]".
  - The host died *during* attempt 10. The replacement session then made attempts 11–14 (`dispatcher: TabiR22-2`).
- **"0 seats" is inferred from absent transcripts.** QUALITY58 (`E3:corpus/QUALITY.md:284-289`) says unavailable is not empty. My read-only listing of the host session directory found no `TabiR22.Outcome*`, `Preserve*` or `Trace*` transcripts. That corroborates zero seats, but only as a snapshot.
- **Smallest counterexample:** a reader sums 14 observed refusals and treats attempt 10 as observed. They also place the crash after the last refusal, which hides that attempts 11–14 came from a different session.
- **Preserving positive:** "0 W2 seats ever reviewed 0F" is supported by 13 refusal records plus the transcript absence.
- **Smallest fix:** in the post-w2b record, write: "13 retained refusals (1–9, 11–14); attempt 10 outcome unobserved (slot 16:10:37Z, kernel death 16:10:51Z), 0 seats inferred from absent seat transcripts; replacement L1 made 11–14."

### F3 — MEDIUM (check claims without byte identity): sandbox and mutation-probe results in `post-crash-repair.json`

- **Where:** `E3:post-crash-repair.json:45-60` claims:
  - `sandbox.selftest "44/44 clean exit0"`;
  - `measureAt0f24164WithRepairedOracle "value12 clean exit0"`;
  - two `mutationProbes` at "43/44 failed".
- **The retained receipt cannot bind those claims:**
  - `E3:selftest-repair-sandbox.json` has no producer or oracle digest, no lane revision and no time. Its only revision field is a disposable selftest tree, `06cb0a83…`.
  - The measure-at-0F-with-repair run and both mutants have no receipt at all. The mutant bytes are described in prose only.
  - `selftest-pre-repair-0f24164.json` likewise has no 0F identity inside it.
- I verified that the pass/observed vectors of both selftest files equal the stdout of `oracle22-selftest` in `checks-pre-w2-0f24164.json` and `checks-at-e3cf4e0.json`. The final bytes are therefore covered later by L1's bound run. The probes and the 0F+repair measurement stay unbound.
- **Smallest counterexample:** replace `selftest-repair-sandbox.json` with output from any other 44-case oracle. No field in it detects the swap.
- **Preserving positive:** keep the `checks-at-e3cf4e0` runs[`oracle22-selftest`] binding (`producerSha256 47176aed…`).
- **Smallest fix:** in the sidecar, mark the probes and the sandbox measure as `unretained author observations`. Either rerun them with `{oracleSha256, selftestSha256, fixtureSha256, mutantDiffSha256, startedAt}` or cite the bound run instead.

### F4 — LOW-MEDIUM (boundary includes non-revision bytes): `checks-at-e3cf4e0.json` is untracked

- **Where:** the w2b boundary (`w2b-spec.json:3`) cites "checks-at-e3cf4e0.json (35/35)" while telling seats to read via `git show E3:PATH`.
- `git cat-file -e E3:.ufo/waves/round-22/checks-at-e3cf4e0.json` exits 128: the file is on disk but not in E3. Its current sha256 is `8f4679ad20d02e6b58078ce4bb346de7c0f503e25cd1ba61e615825fc8a1fbe9`.
- **Counterexample:** the worktree file is edited during w2b, and seats that "verified 35/35 at E3" reviewed mutable bytes.
- **Preserving positive:** the receipt's contents are sound. It records revision E3, `producerSha256 47176aed…` (the E3 blob), an empty status before and after, and 35/35 passing.
- **Fix:** pin that sha256 in the w2b record, or commit the receipt in a post-w2b-labeled commit.

### F5 — LOW (citations of artifacts that do not exist)

1. `E3:corpus/QUALITY.md:275,282,289` cite `corpus/lessons/round-22.md#mistakes`, which is absent at both 0F and E3. Fix: write the lesson, or mark the citation "pending".
2. `E3:corpus/knowledge/webmcp-lifecycle-oracle-round-22.md:61-62` says outputs "are retained in the round22 measurement receipts and binding manifest". No binding manifest exists at E3. At 0F no measurement receipt existed either. Fix: retain the binding manifest, or change "are retained" to "will be".
3. `E3:LOG.md:1561-1562` says 42 controls are "not yet exercised". E3 contains the exercised `checks-pre-w2-0f24164.json` (41/42), and `fixtures/expected.json` now has 44 cases. This is a stale state claim, not a review claim. Fix: a post-w2b LOG append.

### F6 — LOW (ambiguous review labels; latent chronology trap)

- `E3:review-snapshot.json:4` `"reviewedRevision": "0f24164…"` and `post-crash-repair.json:5` `"reviewedCheckpoint"` both name 0F as "reviewed".
  - No reviewer ever reviewed 0F; only L1 checks ran on it.
  - `review-snapshot.json` was itself untracked at W2 dispatch, even though `w2-spec.json:3` told seats to verify against it as if it were in the checkpoint.
- **Commit timestamp trap.** 0F's author date is `14:51:39Z` and its committer date is `15:35:37Z` (`git show -s --format='%ad / %cd'`).
  - The author date precedes the 64 W1 reports the commit contains, which were written 14:52–15:27Z.
  - If someone feeds `git log`'s default author date to `check-review-chronology.mjs` as the acquisition finish, every W1 return after 14:51:39Z passes the chronology test. Only the digest mismatch (for example `a1d977a8 ≠ 76b47edd`) still yields `review_scope_gap`.
- **Fix:**
  - In future schemas, use `reviewTargetRevision`. Here, add a W2 disposition sidecar: `{target:0F, seatsSpawned:0, reviewsReturned:0}`.
  - In classifier inputs, state that a commit's acquisition finish is its committer date (`%cI`).

## Non-findings (scope)

- W1 reviewing drafts is disclosed by the reports themselves: `AttackInputTypes.md:3`, `AttackChronology.md:4`, `CriticReview.md:90` and `AttackDelayed.md:5` pin draft identities. `AttackDelayed`'s title, "against the integrated r22 oracle", refers to the unretained lane intermediate `a1d977a8…`, not 0F. Nothing downstream credits it as 0F review. Optional: record the `a1d977a8` mapping in a sidecar.
- W2 attempts 13 and 14 (16:33:56Z and 16:36:56Z) offered the 0F review payload after L1 had seen 0F fail (16:31:28Z). The repair landed in the worktree at 16:38:20Z, 84 s after attempt 14. If attempt 14 had spawned, W2's "no code changes during the wave" promise would have been broken. This is a process tradeoff, not a false claim, because 0 seats spawned.
- Malicious-author authenticity of commit dates, mtimes and transcripts is out of scope.

## Exercised commands (all read-only on the lane)

Each command below exited 0 unless stated:
- `git show`, `ls-tree`, `log`, `status` and `cat-file -e` on E3, 0F and the base. The `cat-file -e` on `checks-at-e3cf4e0.json` exited 128, as expected.
- `sha256sum` comparisons:
  - the 44 `review-snapshot` paths against 0F and E3;
  - `filesBefore`/`filesAfter` against 0F, E3 and the worktree;
  - the 64 W1 report hashes against 0F.
- `node -e` JSON parses: receipt `runs`, selftest vector equality, spec path existence, and the W2/W2b attempt table.
- `stat` mtimes.
- In a throwaway `/tmp` clone (since deleted): `git fetch` of the three `history/*.bundle` files, to read the writer commit dates 15:02:49Z, 15:04:48Z and 15:06:25Z.
- A read-only listing and tail of host transcripts under `~/.omp/agent/sessions/-Projects-shokunin/…/TabiR22.jsonl`.

**Not run:** any lane script, including `check-review-chronology.mjs`, `measure-c1.mjs`, `selftest-c1.mjs` and `run-checks.py`. Verdicts in the classifier table are static traces of `check-review-chronology.mjs:226-244`.
No installs or updates were made. Nothing was written except this report.
