VERDICT: ISSUES

Review: prompt §6.4 jj rules (`/home/vgpnk/Projects/shokunin/.ufo/prompts/tabi-round-17.md:256-283`) against lane `SKILL.md` (1892 lines) and `AGENTS.md` (6 lines); plus the row set that would land the corrections (`.ufo/waves/round-17/drafts/skill.md`).
Baseline at review: `jj-lane.sh state` → `branch=master local=remote=5859243183c4… ahead=0 behind=0 head=detached`; `git rev-parse @{u}` → `fatal: HEAD does not point to a branch` (exit 128); `git rev-parse --abbrev-ref HEAD` → `HEAD`; `git branch --show-current` → empty. jj 0.45.1. No tool installed.
Caveat: the worktree changed while reading (C1 gate patches are uncommitted: `M scripts/check-{measurement-binding,round-contract,user-round-contract,selftest-measurement-binding}.mjs`); any gate line number below not prefixed `5859243:` is the worktree at read time.

## Findings

F1 [high] `SKILL.md:1851` — "`--check --reproduce` that is clean at the delivered HEAD". This is the only SKILL sentence defining the delivery anchor, and it is wrong under §6.4: HEAD is detached and may name an unlanded commit. The landed gate already says so: `scripts/check-measurement-binding.mjs:24-31` ("--at defaults to the lane tip, not HEAD … a gate that reads HEAD can certify bytes that are on no branch"), `laneTip()` `:249-282`. A green gate on an unpushed commit would be reported "delivered".

F2 [medium] `SKILL.md:1337` table header "Command (re-run verbatim)" + rows `:1341` (`git log --oneline -1; git show --stat`) and `:1346` ("repo | HEAD `d24b98d` … | `git log --oneline -1; git status --short`"). These are the live stamp recipes and both read bare HEAD. Reproduced in a /tmp colocated-jj sandbox: after moving the branch bookmark, `HEAD=2f27ede` vs `master=14d6bf3`, `ahead=1`, `git status` empty, `git show HEAD:f=one` ≠ `git show master:f=base`, `git log -1` printed the off-branch commit. Routed audit agrees (`JjAuditTabi.md:69-93`: clean status with `HEAD != master != origin/master`). Note `:1341`/`:1346` sit in the round-11 append (`:1321`, T1 `:1335`), not round-10 as the draft says.

F3 [medium] `SKILL.md:1677`, `:1678`, `:1800` — round-contract / user-round-contract registry rows carry no revision and production mode is bound to the lane root (`isProduction` realpath, `scripts/check-round-contract.mjs:51-57`) with every committed read at HEAD (`:119,170,231,504,614`; `check-user-round-contract.mjs:167,230,308,529` at `5859243`). C1 changes those reads to the lane tip, but the registry rows never state the anchor, and `--repo` is not a production revision selector (it flips `isProduction` off). Under jj a HEAD-bound verdict can certify a commit on no branch (`JjAuditTabi.md:44-67`).

F4 [medium] `SKILL.md:704` — `git show HEAD:SKILL.md` no longer reproduces its own claim. Today `git show HEAD:SKILL.md | sed -n 225p` is the cleanup block ("**13. Cleanup + closure proof…**"), not the C2/C3 umbrella row, and the cited pre-upgrade revision is a content sha256 prefix (`ea7122d92d7b`) with no git object (`git cat-file -t` → "Not a valid object name"). The paragraph's own escape hatch (resolve by quoted rule text, `:705-706`) is the only reproducible form.

F5 [low] `SKILL.md:1298` — rev-less `git show -s --format=%cI` reads detached HEAD; a re-derivation block that runs it verbatim can date the wrong commit.

F6 [low] `SKILL.md:1505-1511` — REV is "the actual witness commit", a recorded 40-hex. Under jj that 40-hex is the helper's landed hash, not `HEAD`; substituting the current tip is valid only while `corpus/evidence/fleet-round-1-freshness/pins.tsv` is byte-identical between the two.

F7 [pass] The premise that SKILL/AGENTS contain `git add`/`git commit` text is false. `grep -rnE 'git (add|commit|push|stash|checkout|switch|reset|pull)\b' SKILL.md AGENTS.md` → no matches; `@{u}`, `--abbrev-ref`, `show-current` → no matches in either file. Repo-wide `*.md` (excluding `.ufo/`) also has none. Lane `@{u}` text exists only in wave evidence (`.ufo/waves/round-14/w1/DebtScribe.md:74`, `.ufo/waves/round-16/w2/SentinelGate.md:28`) — historical, not a runbook.

F8 [pass] `AGENTS.md:6` "Commits carry the lane identity" holds: `.git/config` `user.name=tabi-shokunin`, `user.email=tabi@shokunin.local` (`git config --show-origin`), and the helper stamps author+committer per command (`/home/vgpnk/Projects/shokunin/scripts/hyaku/jj-lane.sh:225-232`). No AGENTS.md change needed.

F9 [pass] Registry/runbook argv that pass an explicit revision are jj-safe: `SKILL.md:1481-1482` (baseline 40-hex), `:1509-1511` (`"$REV"`), `:1515-1516` (baseline 40-hex), `:1559` (`--witness REV`), `:1840` (`--at REV`), `:1882` (`measuredRevision REV`). `SKILL.md:1559`'s `--worktree` candidate mode reads the worktree by design.

F10 [gap] Neither file has a landing protocol. `grep -n 'jj-lane\|fleet-commit\|\bjj\b' SKILL.md` → 0 lines; the §6.4 rules exist only in the transient prompt. A reader of SKILL alone has no instruction that git writes are forbidden and the helper is the only writer; §6.4 itself notes "jj resets the git index on every mutation" (`tabi-round-17.md:274-275`).

## Proposed append-only SKILL rows (round-17 section; L1 writes)

R1 — lane-tip anchor rule (new subsection):
- Recorded revisions are the lane branch tip as 40-hex: `git rev-parse --verify refs/heads/master` (branch resolution `/home/vgpnk/Projects/shokunin/scripts/hyaku/jj-lane.sh:53-65`) or `jj-lane.sh state <lane>` (`local=`, `remote=`, `ahead=`, `:68-82`). Never `HEAD`, `@{u}`, `--abbrev-ref HEAD`, `branch --show-current`: HEAD is detached and may name a commit on no branch (`.ufo/waves/hyaku/jj-w1/reports/JjAuditTabi.md:44-93`). A landed revision is the helper's final `pushed` 40-hex (this helper `:111`; a newer helper prints `landed`), cited only after `state` shows `ahead=0`.
- Read-only checks use `GIT_OPTIONAL_LOCKS=0 git status --porcelain`; plain `git status` (and `jj-lane.sh state`) may rewrite `.git/index` when stat info is stale (`JjAuditTabi.md:163-182`; reproduced in a /tmp sandbox — index mtime moved after `touch`, unchanged with `GIT_OPTIONAL_LOCKS=0`).

R2 — override `SKILL.md:1851`: "clean at the delivered HEAD" reads as clean at the delivered lane tip — the helper's `pushed`/`landed` 40-hex with `jj-lane.sh state` `ahead=0 behind=0`, passed as `--at <tip>` (or omitted only on the C1 gate, whose default is the lane tip). A detached HEAD is never a delivered revision.

R3 — override `SKILL.md:1840` (`--at` default): after C1 (`<<SHA>>`) `--at` defaults to the lane tip — the attached branch ref, else `refs/heads/master` when detached (`scripts/check-measurement-binding.mjs:249-282`); explicit `--at REV` unchanged. The pre-C1 default `options.at ?? 'HEAD'` (`5859243:scripts/check-measurement-binding.mjs:833`) is historical.

R4 — override `SKILL.md:1337-1346`: the T1 "re-run verbatim" commands predate jj; `git log --oneline -1` prints the detached commit, which can be ahead of the branch while `git status` is clean. Stamp with `git rev-parse --verify refs/heads/master` + `jj-lane.sh state`. `:1341`'s target is the round-11 closeout commit, not the tip: use the `LOG.md` pointer or `git log --all --oneline --grep='round-11'`.

R5 — override `SKILL.md:704`: `git show HEAD:SKILL.md` does not reproduce the note (HEAD:225 today is the cleanup block; the cited mid-edit revision is a content sha256 with no git object). Resolve by the quoted rule/class text (`:705-706`) or a pinned blob SHA-256; never HEAD.

R6 — override `SKILL.md:1298` (and the rev-less `git show --stat` at `:1341`): pass the explicit 40-hex.

R7 — override `SKILL.md:1505-1511`: REV is the recorded witness 40-hex (helper landed hash), not `HEAD`; a later branch tip is valid only if `git diff --quiet "$REV" "$TIP" -- corpus/evidence/fleet-round-1-freshness/pins.tsv`.

R8 — override `SKILL.md:1559`: `--witness REV` takes a 40-hex lane revision. `--witness HEAD` is accepted by the byte-frozen gate (`scripts/check-freshness.mjs:49-50,65`) and prints `revision=HEAD` (`JjAuditTabi.md:184-191`) — never pass it. Invocation: `node scripts/check-freshness.mjs --witness "$(git rev-parse --verify refs/heads/master)"` after `state ahead=0`.

R9 — override `SKILL.md:1677`, `:1678`, `:1800`: production is bound to the lane root (`isProduction` realpath, `scripts/check-round-contract.mjs:51-57`) and after C1 reads the lane tip, not HEAD (`<<SHA>>`); there is no production revision flag (`--repo` flips `isProduction` off). Run only when `jj-lane.sh state` shows `ahead=0`, and record that 40-hex.

R10 — gap-fill, "Landing a round (jj lane VCS)": commits only via `/home/vgpnk/Projects/shokunin/scripts/hyaku/jj-lane.sh commit <lane> --as tabi -m … -- <paths>`; cite only its final pushed/landed 40-hex (`:111`). Never run `git add/commit/stash/checkout/switch/reset/pull/push` or a mutating jj command in the lane (`new`, `commit`, `describe`, `squash`, `rebase`, `abandon`, `bookmark`, `undo`, `op restore/revert`, `git fetch/push`); jj resets the git index on every mutation (`tabi-round-17.md:271-275`). Exit 3 = committed but not pushed → `jj-lane.sh push <lane>`, never force.

## Defects in the proposed draft (`.ufo/waves/round-17/drafts/skill.md`) — fix before appending

D1 [high] Override 6 (`SKILL.md:704`) says "re-run with `refs/heads/master`". That does not restore the claim: `refs/heads/master` is today's 1892-line SKILL, whose line 225 is cleanup code, not the cited 432-line mid-edit revision. Replace with R5.

D2 [medium] Override 5 (`SKILL.md:1840`) says "today it is HEAD (`:833`)". True only of the committed blob `5859243:scripts/check-measurement-binding.mjs`; the live worktree already resolves the lane tip (`:876`), and after C1 lands the appended row's `:833` would cite unrelated code. Replace with R3.

D3 [medium] Override 3 conflates `:1341` and `:1346` and calls them "round-10 stamps". Both are in the round-11 append (`:1321`, T1 `:1335`); only `:1346` runs `git log --oneline -1`, and `:1341` is about locating the round-11 commit. Replace with R4.

D4 [medium] Override 2 sets REV to the current branch tip for the `:1505-1511` witness rows; `:1505` says REV is the actual witness commit (a past 40-hex). Substituting the tip is only equivalent while `pins.tsv` is unchanged. Replace with R7.

D5 [medium] Override 4 reads `:1851` as "clean at the delivered lane tip, `refs/heads/master`". Local ref ≠ delivered: a commit can be on local master with `ahead>0` (exit-3 path). Replace with R2 (`ahead=0`/landed hash).

D6 [low] The draft's protectedPath citations are off by one at `5859243`: `check-round-contract.mjs:102` should be `:101` (function at `:94`), `check-user-round-contract.mjs:150` should be `:151` (function at `:144`). Cite the ranges `:94-103` / `:144-153`, or re-pin at the landed `<<SHA>>`.

D7 [low] The draft's present-tense "Gates read committed blobs at HEAD" is the pre-C1 defect; after C1 it is false. Phrase as history.

## Residual risk / unobserved

- Push-recovery path not exercised against a real remote: `do_push` sets the bookmark to the rebased tip (`jj-lane.sh:121-122`) or to `BRANCH@origin` (`:126`); jj refuses backwards/sideways bookmark moves without `--allow-backwards` (observed in sandbox: "Refusing to move bookmark backwards or sideways"). Whether the `:126` arm is reachable is [INFERENCE]; route to the helper owner, not SKILL.
- The round-3 mid-edit SKILL bytes are absent from this clone, so `SKILL.md:704`'s `:225` mapping cannot be verified — only its present non-reproducibility is measured.
- Gate line numbers will move when C1 lands; all rows above use `<<SHA>>` where the landed revision is required.

## Files written

- `.ufo/waves/round-17/w1/RevSkillJjRule.md` (this report)
