# DraftQuality — round 17 (QUALITY criteria 26–32, append-only draft for L1)

Status: draft prose for L1 integration. Not applied to `corpus/QUALITY.md`. Lane-relative pointers; fleet pointers use `<repo>@<hex>:<path>` (or the fleet root path, labelled) where noted. Line numbers were checked with `grep -n` / numbered reads at baseline `5859243`. Criteria 30–32 are the routed gaps proposed by ConnQualityRouted (`.ufo/waves/round-17/w1/ConnQualityRouted.md`, §Gaps); their facts were re-checked here (see Basis).

## Text to append after `corpus/QUALITY.md:101`

26. A run claim ("re-run at REV", a count, a verdict, an exit code) in a report, lesson or SCORECARD cell cites a receipt committed at the claimed revision (path, sha256, argv, exit), or says "holds by drift diff" and names the empty `git diff --name-only` over every counted input plus the counter path. A bare "again at REV" with no committed receipt is a finding. Falsifier: a drift diff that omits the counter path or one counted input still reads "holds" while that input changed; a receipt that records the pre-rebase `committed <hash>` instead of `pushed <hash>` passes while the cited bytes never reached the remote. (lesson: corpus/lessons/round-16-verifier-spotcheck.md:50-61, :150 — routed item 3; report `.ufo/reports/round-16/tabi.md:69` in the fleet repo.)

27. A probe, gate or selftest is described by the finite set of shapes it defeats. Each listed shape names the case id or counter probe that goes red on it. Absolute words ("unforgeable", "tamper-proof", "cannot be faked") are not admitted for a probe. A shape not listed is stated as untested. (lesson: corpus/lessons/round-16-verifier-spotcheck.md:76, quoted as the reviewer's paraphrase of an uncommitted author summary; corpus/lessons/round-16.md:88 — three liar commits counted 1; `.ufo/waves/round-16/w2/AttackQuality22.md:92-115` — undeclared counted inputs and a manifest with an omitted claim both admitted clean.) Falsifier: the criterion fails if a listed shape is not in fact red under its named probe, or if a shape the gate passes silently is left out of the list rather than marked untested — the round-16 manifest with C2 dropped returned `verdict=clean claims=1 bound=1 exit=0` (`AttackQuality22.md:106-111`), and no shape list had said so.

28. Every evidence pointer in a lesson, knowledge note, QUALITY/SCORECARD/README row, or lesson-cited report resolves as committed bytes at its cited revision: a lane-relative path tracked at that revision, or `<repo>@<40-hex>:<path>` for a sibling or fleet object. A `/tmp`, `/var/tmp` or untracked working-tree path is not a pointer; it may appear only as labelled history next to the object that does resolve. Existing `/tmp` rows are not rewritten (append-only). Falsifier: a pointer is checked against the working tree on the authoring host, so it passes while the object is absent from a fresh clone — `/tmp/tabi-r16-c1liar-93NO/repo` (`corpus/evidence/round-16/measure/c1-liar-probes.json:3`) exists on this host, yet `git cat-file -t 9ecfcc9` fails in the lane; the check must run in a fresh clone at the cited revision. (lesson: corpus/lessons/round-16-verifier-spotcheck.md:148 — routed item 1.)

29. A gate or counter that certifies the lane reads the branch tip, never git `HEAD`. It resolves the branch with `symbolic-ref -q HEAD`, falls back to `refs/heads/master` only when HEAD is detached, peels with `rev-parse --verify <ref>^{commit}` to a 40-hex, and prints that 40-hex in every `code_revision=`, `codeRevision=` and `measuredRevision=` field. Carve-out: the byte-frozen `scripts/check-freshness.mjs` is exempt (it is `protectedPath` in both contract gates); its literal `--witness HEAD` acceptance is recorded as a why-not, and the registry invocation passes an explicit 40-hex ref. Under jj colocation HEAD may name an empty or unlanded commit or snapshot content. (source: `.ufo/waves/hyaku/jj-w1/reports/JjAuditTabi.md` F1–F3, fleet repo — see Basis.) Falsifier: a non-exempt gate that still reads `HEAD` on a certification path passes while certifying a commit on no branch (JjAuditTabi F1: `68d0582` after `jj new`, `ROUND_CONTRACT verdict=clean` and `FRESHNESS_GATE … revision=HEAD`), or prints `committed=yes` for worktree bytes that differ from `master` (F3). The criterion also fails if a fixture with attached HEAD on a non-master branch resolves to master rather than its own branch.

30. A committed receipt records the producer it ran — path and sha256 of the gate, selftest, harness or counter — and a claim cites that receipt only when the digest equals the blob registered for the claim. A receipt produced by an earlier hardening is labelled history by a committed record in the superseding round that names the receipt path and producer digest; the frozen receipt itself is not edited. (lesson: corpus/lessons/round-16-verifier-spotcheck.md:149; count-scoped analogue corpus/QUALITY.md:78-84.) Falsifier: `corpus/evidence/round-16/binding/selftest.json:3-4` and `legacy-r15.json:3-4` record `gateSha256 5150611c…` / `selftestSha256 8c5426f2…`, while the blob registered for the claim at `5859243` is `1f84fb54…` (`git show 5859243:scripts/check-measurement-binding.mjs | sha256sum`); criterion 30 is falsified at baseline until RoutedHardened's receipts at `1f84fb54…` land. Disjoint from 26: 26 asks whether a receipt exists and is committed; 30 asks whether its producer is the registered blob.

31. Refines 24: when a row previously marked unchecked in a sha-pinned note is checked and superseded, the supersession names the frozen path and line (`corpus/knowledge/browser-surface-census.md:188`), not only a label such as "census U3", so a reader at the frozen surface can reach the correction. The pinned bytes stay untouched. (lesson: corpus/lessons/round-16-verifier-spotcheck.md:151.) Falsifier: `corpus/README.md:297` names "(census U3)" and never the path or line, so the row at `browser-surface-census.md:188` stays unreachable from the frozen surface; `pins.tsv` sha-pins that note, so the index row is the only legal carrier (`corpus/README.md:293`).

32. A contested scope with a sibling lane is dispositioned in a committed map row that quotes the sibling surface at a 40-hex revision with path and line; `ruled` cites the ruling at the revision that produced it, `contested-open` names the L0 question it waits on, and a declared split or refusal quotes both sides stating the split. An overlap acknowledged only in a report narrative, or a ruling quoted from an uncommitted message, is not a disposition. (lesson: corpus/lessons/round-16-verifier-spotcheck.md:152; ruling at :138-142.) Falsifier: a `ruled` row with `-` in `ruling_ref`, or a `ruling_ref` that does not resolve at its 40-hex, still verifies unless the C3 checker is red on a counter-mutated row. Satisfiable against C3's grammar (`.ufo/waves/round-17/PLAN.md:137-146`): `ruling_ref` = `tabi-shokunin@5859243:corpus/lessons/round-16-verifier-spotcheck.md:138`; sibling side `kaidoku-shokunin@<hex>:PROVINCE.md:53`.

## Basis (not for QUALITY.md; every pointer checked this round)

Lane `tabi-shokunin`, HEAD detached at `5859243` (`git symbolic-ref -q HEAD` → rc 1; `refs/heads/master` = `5859243183c4d7ac5429dfdb8a73ce0d9a43d583`). Worktree is not clean: `git status --porcelain` shows `M` on `scripts/check-measurement-binding.mjs`, `check-round-contract.mjs`, `check-user-round-contract.mjs`, `selftest-measurement-binding.mjs` and `?? scripts/check-adjacency.mjs`, `.ufo/waves/round-17/`, `corpus/evidence/round-17/` — sibling seats' in-flight edits, not HEAD. The gate sha at HEAD is `1f84fb54…`; the worktree file is `15af0111…`.

Criterion 26
- Spot-check drift method: `corpus/lessons/round-16-verifier-spotcheck.md:50-61` (diff command at :52; "The counts therefore hold at `1205d26`" at :61).
- Unreceipted run claim: fleet repo `.ufo/reports/round-16/tabi.md:69` ("…and again at `1205d26`"); spot-check routed item 3 at `corpus/lessons/round-16-verifier-spotcheck.md:150`.
- Receipt pattern that works: `corpus/evidence/round-16/binding/check.json` (argv + exit, cited at spot-check :70).
- Pushed-vs-committed: fleet `.ufo/waves/hyaku/jj-w1/reports/JjTrialTabi.md:121` (committed prints pre-rebase hash), :153 (hazard 8).

Criterion 27
- Overstatement: `corpus/lessons/round-16-verifier-spotcheck.md:76` ("unforgeable … overstates this: the probes defeat the three tested liar shapes").
- Word not located: `git grep -in unforgeable 5859243` returns only spot-check :76. The fleet r16 report `.ufo/reports/round-16/tabi.md` has no "forge" hit; `.ufo/waves/round-16/` has only "forged" in unrelated wave-1 text (`measure.mjs:290` comment and `w1/RevC1Count.md:29,51`, a different subject). So `.ufo/waves/round-17/PLAN.md:169` ("the r16 report word") is a misattribution; the word is a paraphrase of an uncommitted author summary.
- Three liar shapes and QUALITY 25: `corpus/lessons/round-16.md:88`; `corpus/QUALITY.md:97-101`; `corpus/evidence/round-16/measure/c1-liar-probes.json` (runs 9ecfcc9/0754e44/7b497d1 count 0).
- Gate gaps a shape list must show: `.ufo/waves/round-16/w2/AttackQuality22.md:92-104` (G1), :106-111 (G2: `verdict=clean claims=1 bound=1 exit=0`).
- Round-16 lesson lacks rows for routed items 1–3: `corpus/lessons/round-16.md:81-94` vs spot-check :146-157.

Criterion 28
- Unrooted liar evidence: `corpus/lessons/round-16-verifier-spotcheck.md:148`; `corpus/evidence/round-16/measure/c1-liar-probes.json:3`.
- Commits not in lane: `git cat-file -t 9ecfcc9` / `0754e44` / `7b497d1` → "Not a valid object name" (this round).
- Host-only pointer: `/tmp/tabi-r16-c1liar-93NO` exists on this host (this round).
- Volatile `/tmp` rows: `corpus/README.md` has 12 `/tmp/` matches (:16, :18, :19, :20, :145, :148, :149, :151, :153, :154, :155, :184); `/tmp/w8-tabi-b81`, `/tmp/tabi-r2-1-capture`, `/tmp/tabi-r4-2-async` are absent on this host; README:154 and :184 already say "unarchived".
- Untracked evidence: `?? .ufo/waves/round-17/`, `?? corpus/evidence/round-17/` (this round). `git ls-files .ufo/waves/round-16` → 199 tracked, so round-16 wave pointers resolve.
- Fleet pointers: `.ufo/waves/hyaku/jj-w1/reports/JjAuditTabi.md` lives in the fleet repo, cited by `.ufo/waves/round-17/PLAN.md:17-18`; admitted only as `<repo>@<hex>:<path>` (grammar `PLAN.md:137-146`).

Criterion 29
- Frozen carve-out: `scripts/check-round-contract.mjs:101` and `scripts/check-user-round-contract.mjs:151` (`path === 'scripts/check-freshness.mjs'` in `protectedPath`; also `check-user-round-contract.mjs:80`, :269).
- Gates reading HEAD on certification paths (`grep -n`, baseline): `scripts/check-round-contract.mjs:119, 170, 173, 177, 231-232, 504, 1007`; `scripts/check-user-round-contract.mjs:167, 230, 252, 254, 262, 308-309, 529, 793-795` (`committed` = worktree blob vs HEAD blob), `877-879`, `952-954`; `scripts/check-measurement-binding.mjs:833` (`options.at ?? 'HEAD'`).
- `scripts/check-freshness.mjs:49` accepts any non-`--` token for `--witness`; `:68`, `:71` use it as a revision; `:131` is the fixture's own `rev-parse HEAD` (correct, attached).
- Empirical: `JjAuditTabi.md:44-67` (F1), `:69-93` (F2), `:95-130` (F3), `:184-191` (F6: `--witness HEAD` → `revision=HEAD`).
- Helper anchor: `scripts/hyaku/jj-lane.sh:55` (`symbolic-ref`), `:77`.
- Not drafted: a push-state clause (tip = `origin/master`, or `ahead=N` stated). F2 shows an unpushed tip under a clean porcelain status.

Criterion 30 — `corpus/evidence/round-16/binding/selftest.json:3-4`, `legacy-r15.json:3-4` (both `5150611c…`/`8c5426f2…`); HEAD blob `1f84fb54…` (`git show 5859243:scripts/check-measurement-binding.mjs | sha256sum` → `1f84fb545f76ad77…`).

Criterion 31 — `corpus/README.md:297` ("unprobed (census U3)"; continues "is now held for Chromium 154 only"); `corpus/README.md:293` (index row); `corpus/knowledge/browser-surface-census.md:188` (U3 line); `corpus/pins.tsv` sha-pins the note (`corpus/evidence/fleet-round-1-freshness/pins.tsv`).

Criterion 32 — `corpus/lessons/round-16-verifier-spotcheck.md:138` (heading), :141 (tabi), :142 (kaidoku); the sibling side `kaidoku-shokunin/PROVINCE.md:53` cited by the ruling itself.

## Tools

None installed or updated. All checks were read-only (`git symbolic-ref|rev-parse|ls-files|ls-tree|cat-file|status|check-ignore|log|grep|show`, `grep -n`, `sha256sum`, `sed -n`). No `jj`, no git write, no lane edit.
