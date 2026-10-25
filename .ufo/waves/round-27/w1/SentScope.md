# SentScope — round-27 wave-1 scope and safety audit (re-dispatch at tip `5ed6484`)

Seat `SentScope` (sentinel, leaf, read-only reporter). Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`
(`git rev-parse --show-toplevel` → that path). Baseline `f185b4e7ab10cd9e8925e8ec614c9c111772357d` → tip
`master` = `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0` (`git rev-parse master`; `HEAD` equals it; 10 commits in
range). Measured 2026-10-25 17:32–17:44Z (14:32–14:44 -03:00) while wave 1 was still writing; every number below
is a point-in-time reading with the command that produced it.

**Supersession note.** An earlier report already stood at this path, written from tip `336d5d1` by the parent-side
seat of the same name. I preserved it verbatim before rewriting:
`scratch/SentScope/prior-SentScope-at-336d5d1.md`, 358 lines, sha256
`82c673b5672a529bede4cf63eb1752c6551bba29b813897f6d5246a263cbba20`. Two commits landed after it (`5198e28`,
`5ed6484`), so this report re-measures at the later tip and states which of its defects survive; where I agree with
it I say so and re-derive rather than cite.

**Axes.** A1 scope confinement — no write escapes declared paths. A2 evidence integrity — no verdict outruns its
receipt. A3 re-derivability — a reader can recompute a number from the repo alone. A4 blast radius — nothing outside
the lane is mutated.

---

## Verdict per assigned item

| item | verdict | one-line evidence |
|---|---|---|
| (a) landed paths in scope | **PASS, one flag, one live-drift caveat** | 34 paths, all `A`/`M`, 0 deletions; only `SCORECARD.md` outside the item's literal enumeration; the *worktree* is dirty with 8 tracked files (F3) |
| (b) shokuknow read-only | **PASS** | 0 files under that tree newer than round start; `.git/index`, `packed-refs`, `FETCH_HEAD` untouched; one transient lock-churn touch attributable to audit reads (F9) |
| (c) fetches limited to named URLs | **PASS with one receipt gap** | only `www.rfc-editor.org` is fetch-evidenced; my own GET is byte-identical; the landed receipt records no HTTP status |
| (d) no credential/session material | **PASS** | 0 real hits over 24 landed blobs and 46 378 scratch files; the 8 textual matches are RFC 9110 grammar/examples |
| (e) fixture discipline | **PASS with deviations** | 61 fixture repos, all self-rooted, 0 remotes, 0 commits shared with lane history; deviations F2 (relative-path fixture in the *fleet* repo) and F7 |
| (f) fleet repo | **FAIL — two misrooted strays** | lane artifact `.ufo/waves/round-27/w1/SimplifyEvidence.md` and a fresh `git init` at `r2/`, both untracked in the fleet repo (F1, F2) |

Findings ranked by blast radius, not by ease.

---

## F1 — HIGH (A4/f) A lane seat wrote its report into the **fleet** repo

Evidence.
- `git -C /home/vgpnk/Projects/shokunin status --porcelain -uall` → `?? .ufo/waves/round-27/w1/SimplifyEvidence.md`;
  `ls -la .ufo/waves/round-27/w1/` → 13926 B, mtime `2026-10-25 14:42:31 -0300`.
- It is not the lane copy: `sha256sum` fleet → `2185ce6e6f9df9e5c03e0859186e9144686daad84d545da73fcabbf73d094120`
  (210 lines), lane → `cd3fcca1efd5d83424d7a917428d0520013f69dc37ee6650fdb13f77139ef14d` (213 lines).
- Different seat banner: fleet copy "Seat: `SimplifyEvidence` (wave-1 simplifier …)"; lane copy "Seat:
  `TabiR27.SimplifyEvidence`". So this is a *different* seat, mis-rooted, not a duplicate write of one seat.
- Never tracked: `git -C fleet log --oneline -- .ufo/waves/round-27` → no output.

Exploit path. The fleet repo is the sanctioned commit target for lane reports via
`scripts/hyaku/fleet-commit.sh`, whose guard is a *pathspec allow-list* — it refuses paths a lane names but does
nothing about untracked files an orchestrator-side `git add -A`/jj snapshot might sweep. A lane's read-only report
sitting at `.ufo/waves/round-27/w1/` in the fleet tree is exactly what a fleet-side "collect the wave" glob would
match; if any tool lands `.ufo/waves`, a lane artifact enters fleet history with no review, and the round-27 fleet
directory gains a subtree the fleet never sanctioned.

Impact. Repository-boundary breach (a lane wrote outside its repo and outside its declared report path); latent
history contamination. It is *not* yet committed and the pending `--as tabi` commit cannot carry it (pathspec).

Smallest remediation. Orchestrator deletes or relocates the two stray paths (nothing committed, nothing to lose),
then the dispatch generator emits the report path as an absolute lane-rooted path in every seat prompt — the
`SentScope` prompt in `gen-w1.mjs:110` already does this, so one sibling prompt is missing it.

## F2 — HIGH (A4/A1) A fixture git repo was created with a **relative** path inside the fleet repo

Evidence.
- `find r2 -maxdepth 3` → `r2/.git/**` only, nothing else; directory mtime `2026-10-25 14:40:39 -0300`.
- `git -C r2 rev-parse --show-toplevel` → `/home/vgpnk/Projects/shokunin/r2`;
  `git -C r2 log` → "your current branch 'main' does not have any commits yet"; `r2/.git/index` absent → never
  staged or committed.
- `git -C fleet status --porcelain -uall` → `?? r2/`: the fleet `.gitignore` does **not** cover it.
- Contrast with the contract's fixture shape: `D=$(mktemp -d) && git -C "$D" init -q`. Eight `/tmp` fixtures in
  this round do follow it (F9 detail: all self-rooted, no remotes).

Exploit path. `r2/` is a nested repository whose worktree is the fleet repo's root-adjacent space. Any fleet-wide
`git add -A` would record mode `160000` (gitlink) and a later tree walk would treat `r2` as a submodule; a
`git clean -xdf` in the fleet repo would delete it silently. `git status` in the fleet repo is now permanently noisy
for every other lane's report check. The guard in `fleet-commit.sh` protects *lane* commits only, not the
orchestrator's own.

Impact. Cross-lane interference and a live trap for the orchestrator's commit path; no data at risk (repo is empty).

Smallest remediation. Remove `r2/` (empty, no refs, no index), and add fleet `.gitignore` coverage for stray
fixture names or require `mktemp -d` explicitly in every executor prompt that creates a repo.

## F3 — MEDIUM/HIGH (A2/A1) Tracked lane files are being rewritten in the worktree **during** a read-only wave

Evidence (final capture 17:43:30Z; `git status --porcelain` → 8 `M`, `git diff --numstat master`):

| file | mtime (local) | numstat vs `master` (+/-) |
|---|---|---|
| `LOG.md` | 14:40:46 | 22 / 0 |
| `SCORECARD.md` | 14:41:22 | 5 / 5 |
| `corpus/QUALITY.md` | 14:37:50 | 14 / 17 |
| `corpus/README.md` | 14:38:47 | 8 / 5 |
| `corpus/SOURCES.md` | 14:39:11 | 1 / 1 |
| `corpus/knowledge/redirect-and-retry-after-semantics.md` | 14:38:34 | 18 / 16 |
| `corpus/lessons/round-27.md` | 14:42:08 | 28 / 14 |
| `scripts/check-s106-evidence.mjs` | 14:41:07 | 5 / 5 |

The set grew while I measured (5 files at 14:38, 7 at 14:39, 8 at 14:43), always at mtimes *after* the tip commit
`5ed6484` (14:35:59). Nothing is staged (`git diff --cached --stat` → empty), so all of it is worktree drift.

Exploit path. Three concrete failures follow from it:
1. A seat told to "verify the tip" and reading files instead of blobs measures **different bytes** than the
   receipts record — the C1/C2/C3 receipts are keyed to `master`, the tree is not.
2. The C1 counter's m3 class counts `git status --porcelain --untracked-files=all`. While 8 tracked files are dirty
   and 27+ untracked paths stand, any "clean-tree `mismatches=0`" claim is unreachable — the drift *creates* the
   condition that falsifies the round's own calibration claim (F4).
3. Remediation applied in the tree bypasses the L1 landing decision and splits the record from the receipts it
   cites: `corpus/QUALITY.md` now says `cases=5` for the s106 gate while the landed SCORECARD row still says 4/4
   (F6), so two records of the same gate now disagree *because of* the drift.

Attribution: **UNKNOWN**. I read no session material. The content is tabi-specific (S107 §15.4 history anchor
7260-7264, s106 gate tally, `scripts/report-contract.mjs` referenced by the rewritten QUALITY criterion 68), so it
is lane-side rather than a sibling lane; whether L1 or a seat, I cannot say.

Impact. The audit target moved during the audit; the round cannot close on a stable revision until these are either
landed as one labelled commit or reverted.

Smallest remediation. L1: stop concurrent tree edits, land the accepted edits in one commit that re-points the
receipts it changes, and require every verification seat to read `git show <rev>:<path>` or pin `--rev`.

## F4 — MEDIUM (A2/A3) C1 is sold as `mismatches=0 / met` while no receipt records 0 — still true at the new tip

Evidence.
- `grep -o '"mismatches"[^,]*'` over the three receipts: `measure-c1-fd722a7.json` → **1**,
  `selfassess-baseline-raw.json` → **6**, `selfassess-tip-raw.json` → **5**.
- `git grep -c '"mismatches": 0' master -- .ufo/waves/round-27/` → no match anywhere in the wave dir.
- `SCORECARD.md:1396` states "tip `mismatches=0` under a clean tree … **met**"; `LOG.md:1902` states "the extended
  counter at the tip then reports `mismatches=0` (measured receipt in the claim block below)".
- The receipt named "tip" is not one: `selfassess-tip-raw.json` carries `"rev": f185b4e…` — the round-27 *baseline*.
  Anyone reading receipts by filename mis-attributes the 5.
- Both later commits (`5198e28`, `5ed6484`) touch the s106 gate, not the C1 receipt set, so the gap survives to
  `5ed6484`. This is the same defect the earlier in-place report recorded at `336d5d1`; it was not repaired.

Exploit path. A closure reader takes the SCORECARD row as disposition and does not re-run the gate; a reader who
does re-run it cannot obtain 0 while the tree is dirty (F3).

Impact. The claim that exists to certify calibration is the one artifact asserted without a receipt. (Claim
verdicts belong to the C1 seats — `ExecC1Tip`, `RevC1FrozenFit` — I record only the provenance shape, which is my
axis.)

Smallest remediation. Land the post-integration clean-tree run as a receipt and cite that path, **or** hold C1 at
"pending tip run". Rename or annotate `selfassess-tip-raw.json` so its `rev` is not contradicted by its name.

## F5 — LOW/MEDIUM (A1/A2) An ignored evidence file was force-landed, defeating a structural guard

Evidence.
- `.ufo/waves/round-27/w1-validate.err` is tracked at `master`, 0 bytes
  (`git ls-tree -l master -- …` → `e69de29b… 0`).
- It matches an ignore rule today: `git check-ignore -v --no-index .ufo/waves/round-27/w1-validate.err` →
  `.gitignore:8:.ufo/waves/*/*.err`, exit 0.
- Tracked `.err` files: baseline **12** → `master` **13**, the increment being this path.
- `.gitignore:6-7` states the rule's purpose: "dispatch/record captures are never landed (same class as the
  round-23 .err leftovers; defect 2 composition)".

Exploit path. The round-24 rule exists because a composition defect landed 1 034 paths; the mechanism is bypassed by
`git add -f`, and nothing in the L1 flow refuses a staged path that an ignore rule names. The file is empty, so the
direct harm is nil — the defect is that the guard is decorative.

Impact. Low today; it re-establishes the exact bypass class the rule was written to close.

Smallest remediation. Delete the tracked empty file, and add a landing assertion that no tracked path matches an
ignore pattern (`git ls-files -ci --exclude-standard` must be empty).

## F6 — LOW (A2) The C2 gate's case count disagrees four ways at `master`

Evidence (`5ed6484`).
- `scripts/check-s106-evidence.mjs:8` header: "`--selftest` (4 isolated cases over temporary sandbox".
- Same file's CASES table: 5 ids (`clean-fixture-valid`, `sha-mismatch-invalid`, `anchor-off-by-one-invalid`,
  `missing-bytes-could-not-evaluate`, `missing-receipt-could-not-evaluate`).
- `SKILL.md:2514`: "`cases=5, passed=5`" — correct.
- `SCORECARD.md:1397`, the row that carries C2 **met**: "selftest 4/4; receipt `measure-c2-5577d1b.json`".
- `corpus/QUALITY.md:367` (committed): "`cases=4`".
- `measure-c2-557d1b.json` carries `valid/sha_match/anchor_*` but no `cases` field, so "4/4" is unsourced.

Exploit path. The verdict row cites a number that is wrong in its own repository, and the correction is being made
in the worktree (F3) instead of the record, so until that lands the discrepancy is invisible to anyone reading the
revision.

Impact. Same class C1 exists to prevent (a tally that disagrees with its gate); here it is the *claim* row that is
stale.

Smallest remediation. One commit that fixes header line 8, `SCORECARD.md:1397`, and `corpus/QUALITY.md:367` to the
table's 5, and adds `cases` to the C2 receipt schema so the number is receipted.

## F7 — LOW (A1) Loose throwaway files outside the sanctioned scratch root (mine included)

Evidence.
- Seat-authored in shared `/tmp`, mtimes 14:33–14:35: `url_laneS102.txt`, `url_laneS107.txt`,
  `url_stagedS124.txt`, `url_stagedS125.txt`, `url_stagedS142.txt` (43–69 B), and six zero-byte
  `mutc1-*.err` / `mut-run-err.txt` captures (`ls -la /tmp/url_*.txt /tmp/mut*`).
- My own deviation, self-caught: three lists (`sentscope_union.txt`, `sentscope_diff.txt`,
  `sentscope_fxheads.txt`) written to `/tmp`. I copied them to `scratch/SentScope/`, re-derived the union from the
  repo (`UNION_REPRODUCED`), and removed the `/tmp` copies (`ls /tmp | grep -c '^sentscope'` → 0).

Exploit path. `/tmp` is shared with the souji/kengaku rounds launched in the same hour; a name collision or a
cleanup sweep by another lane can destroy evidence that a report cites, and the files are invisible to the round's
own hygiene checks (which look under scratch). No file here landed and none left `/tmp`.

Impact. Low; evidence durability and attribution only.

Smallest remediation. Seats write under `scratch/<SeatId>/`; executors that need `mktemp` get it by the contract's
already-named form.

## F8 — INFO (A4/f) Fleet repo: 6 modified harness paths, one whitespace stray, one empty-digest baseline

Evidence.
- `git -C /home/vgpnk/Projects/shokunin status --porcelain` → 6 `M`: `.ufo/state/{kasegi,kengaku,souji,tabi}.report-baseline`
  (each a one-token round bump, e.g. tabi `26 e3b0c442…` → `27 e3b0c442…`) and `.ufo/watchdog.log` (+7 run-7
  lines: kotodama/mado completes, `launch tabi round=27 pgid=16364`, …).
- Fleet `LOG.md` also carries `M` with a one-line diff: a **blank line appended** after the last entry
  (`git diff -- LOG.md` → `@@ -1292,3 +1292,4 @@` `+` empty). Unattributed; no lane report has been fleet-committed
  for round 27 (`ls .ufo/reports/round-27 | grep -c tabi` → 0; last fleet commits are souji round-26 and the run-7
  operator commits).
- The tabi baseline's digest is `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` = sha256 of the
  empty string. As pre-commit state it is expected; as a *baseline* it binds no report content, so a digest check
  that compares a report against it can be satisfied by an empty or missing report. Flagged for the orchestrator;
  not a lane defect, and I did not touch it.
- Lane worktrees cannot appear as fleet strays: `git -C fleet check-ignore -v tabi-shokunin/LOG.md` →
  `.gitignore:1:*-shokunin/`, exit 0.

Exploit path (of the whitespace stray). A dynamic round's fleet diff is read by the next operator session to see
what run 7 changed; a content-free diff line is indistinguishable from a truncated append and costs a manual check.

Impact. Informational, plus the empty-digest observation above.

Smallest remediation. Orchestrator drops the stray blank line at its next fleet commit; whichever tool writes
`report-baseline` records the report digest (or an explicit `absent`) instead of the empty-string hash.

## F9 — INFO (A3/b) shokuknow: no content mutation during round 27; one transient lock-churn touch

Evidence.
- `find /home/vgpnk/Projects/shokuknow -type f -newermt '2026-10-25T17:00:00Z'` → **0 files**. Round start is
  bounded above by the fleet's own `launch tabi round=27` at `2026-10-25T13:52:06-03:00` (16:52:06Z).
- Newest file there is `lanes/tabi/round8/.work/ratelimit-series.tsv`, mtime `16:34:48Z` — 17 minutes before that
  launch; `merge/tabi/{MERGE-REPORT.md,SOURCES.append.md}` are `2026-10-24 23:33` (02:33Z), i.e. pre-round, and
  `find … -maxdepth 4 -name '*round-27*'` → nothing.
- No fetch, no push, no ref write: `.git/index` `2026-10-24T23:33:24Z`, `.git/FETCH_HEAD` `2026-10-24 03:33`,
  `.git/packed-refs` `2026-10-24 10:51`, `.git/refs/heads` and `.git/logs/HEAD` `2026-10-24 11:02`; HEAD commit
  `8b94c5c1 2026-10-24 11:02:02 -0300`. `find .git -newermt 2026-10-25T17:00:00Z` → 0 files. (A remote *does*
  exist — `origin https://github.com/VeigaPunk/shokunin-corpus-expansion.git` — so this is evidence of no push, not
  structural impossibility.)
- Campaign tools: `renumber-staged.py`, `merge-plan.py`, `quote-lint.py`, `absent-defect-register.py` appear only in
  contract prose (`gen-w1.mjs:49-50`, `w1-spec.json`, `w1-dispatch.json`); no invocation record in the round tree
  and no new output under `merge/tabi`.
- Caveat, and it is mine as much as anyone's: the `.git` **directory** mtime moved twice inside the round window —
  `17:30:07Z` and `17:38:38Z`. No file under it changed, so this is transient lock creation/removal by a read-only
  `git` invocation (I ran `git status --porcelain` there at ~17:33Z; another seat ran one later). Lock churn is a
  write to the directory, not to content.

Impact. None observed on content. Residual: any `git` run in a read-only tree can take the index lock, and on a
tree with 1 918 modified paths a refresh could rewrite the index.

Smallest remediation. Reads of the staged package use `read`/`grep`; if a git read is unavoidable, set
`GIT_OPTIONAL_LOCKS=0` (as I did for the status/remote calls in this report's last passes).

## F10 — INFO (A2/d) Credential sweep: zero real hits

Evidence.
- Landed blobs (24 files under `.ufo/waves/round-27/` at `master`) searched for GitHub PAT prefixes, AWS access-key
  id prefixes, GitHub OAuth/app prefixes, Slack token prefixes, `Bearer <token>`, `Authorization:`, `Set-Cookie`,
  PEM private-key markers, `ssh-ed25519`, three-part JWTs and `api_key|secret|password` words → 8 matching lines,
  **all inside `assimilation/rfc9110.txt`**: the RFC's grammar (`credentials = auth-scheme …`), its prose about
  "user:password is deprecated", and its example `Proxy-Authorization: basic aGVsbG86d29ybGQ=` (base64 of
  "hello:world" — an RFC sample, not a secret).
- No `.env`/`.pem`/`.key`/`.netrc`/`.p12` names landed (`git ls-tree -r master -- .ufo/waves/round-27/ | grep -Ei`).
  No environment dumps (`^(HOME|PATH|USER|SHELL|SSH_AUTH_SOCK)=` → 0).
- Scratch sweep (46 378 files / 764 MB) for raw token shapes → 0 files.
- The single `w1/` hit is the earlier in-place report quoting the sweep's own pattern list; my rewrite names the
  patterns in prose and embeds no matching literal.
- Absolute paths in landed evidence are the lane root plus two rule-file paths (`/home/vgpnk/.omp/agent/RULES.md`,
  `/home/vgpnk/.agents/skills/godspeed/directive.md`) — paths, not content.

Impact. None.

## F11 — INFO (A1/e) Fixture hygiene: 61 self-rooted repos, no lineage bleed

Evidence.
- 53 nested repos under `scratch/` (`find . -type d -name .git`), 8 under `/tmp` (7 `tmp.*` + one seat-named
  `c1kill-gitrepo-76wl02nz`). For every one: `git -C D rev-parse --show-toplevel` equals its own realpath
  (**61/61**, tally `toplevel_eq_self=53` in scratch + 8 in `/tmp`), `remote.origin.url` unset (0), `core.worktree`
  unset (0).
- No lineage bleed: the 62 distinct fixture HEADs (`git -C D rev-parse HEAD | sort -u`) intersect lane master
  history in **0** commits (`git rev-list master | grep -Fxf <heads>` → 0).
- Scratch cannot land: `git check-ignore -v` on a fixture path → `.gitignore:5:.ufo/waves/*/scratch/`, and
  `git ls-tree -r master | grep -c '\.ufo/waves/round-27/scratch/'` → 0. (The 49 tracked paths containing
  "scratch/" are pre-existing `corpus/evidence/w6-aud-b6-scratch/**` and `w7-aud-b7-scratch` — not this round.)
- Nested `.git` anywhere else in the lane worktree: only the root `./.git`.
- Deviations: F2 (`r2/` relative-path fixture in the *fleet* repo) and F7 (loose `/tmp` files).

---

## Item-by-item detail

### (a) Landed scope

`git diff --name-status f185b4e… master` → **34 paths, all `A` or `M`, zero `D`**; `git diff --summary | grep -c
'delete mode'` → 0. The union of paths touched by any commit in the range equals the diff set exactly (34 = 34,
scratch list `scratch/SentScope/sentscope_union.txt`), history is linear (`git log --merges … | wc -l` → 0), and the
baseline is an ancestor (`git merge-base --is-ancestor …` → YES).

Split: `.ufo/waves/round-27/` **24 files / 799 371 B** (of which `rfc9110.txt` is 502 941 B, `w1-dispatch.json`
63 922 B, `w1-spec.json` 53 141 B, `w1.ready` 148 B, `w1-validate.err` 0 B); `scripts/` 2; `corpus/` 6
(`QUALITY.md`, `README.md`, `SOURCES.md`, `knowledge/redirect-and-retry-after-semantics.md`,
`lessons/round-27.md`); `LOG.md`; `SKILL.md`; `SCORECARD.md`.

Shapes: no symlinks (mode 120000) and no gitlinks (160000) in the diff; no path contains `..` or a leading `/`; two
`create mode 100755` (`gen-w1.mjs`, `check-s106-evidence.mjs` — intended executables), the rest 100644 or unchanged
mode; `scripts/check-selfassessment.mjs` stays 100755.

**Flag.** `SCORECARD.md` is the one landed path outside the item's literal enumeration (`scripts/`, `corpus/`,
`LOG.md`, `SKILL.md`, `.ufo/waves/round-27/`). It is the lane's standing round ledger — `git log -8 --oneline --
SCORECARD.md` shows all eight most recent round commits touch it — so this is an enumeration omission, not a lane
violation. Nothing else is out of scope: no path under `.ufo/` outside `round-27/`, no sibling-lane path, no fleet
path.

**Caveat that belongs to (a).** The *committed* set is clean, but the worktree is not (F3), and it gained an
untracked file inside a tracked tree: `scripts/report-contract.mjs` (mtime 14:37:24, header "routed lesson UTILITY
(tabi r27; r26 LOG next-iteration (b))"). A subsequent `git add scripts` would sweep an unreviewed 300-line utility
into the round. Also untracked and expected: `.ufo/waves/round-27/{gen-w2.mjs, w2-spec.json, w1.ready.dispatched}`
and the wave-1 report dir `w1/` (30 files, seats' reports — correctly unlanded).

### (b) shokuknow

Covered in F9. Cross-check of the landed evidence: `git grep -In 'shokuknow' master -- .ufo/waves/round-27/` hits
only read instructions (README:4, `gen-w1.mjs:48/74/110/111`, the two wave JSONs), never a redirection, copy, or
tool invocation against that path.

### (c) External fetches

Bound established from the record, not from trust. `curl` occurrences in the landed generator are prose and
instruction only (`gen-w1.mjs:55` contract text; `:73` a documented RFC GET for `ScoutReverifyRfc`; `:80` a
documented chromium GET for `ExecC2Reopen`); the generator itself has no `spawn`/`execFile`, only `writeFileSync`.
Host census over landed round-27 evidence *excluding* the fetched RFC body → `rfc-editor.org` 5 (the S107/S124
source URL and the GET instruction), `chromium.googlesource.com` 3 (registry row URLs inside the census outputs),
`playwright.dev` 6 — and those six are a JSON string literal inside an m1 finding's recorded command, not a fetch
(checked structurally: `findings[110].command`, 367 chars, no fetch verb).

So the only fetch-evidenced host this round is `www.rfc-editor.org`, which the item names. My own GET (allowed,
documented, saved under scratch):

```
curl -sSL -o scratch/SentScope/rfc9110-get2.txt \
  -w 'http_status=%{http_code} size=%{size_download} url=%{url_effective}\n' \
  https://www.rfc-editor.org/rfc/rfc9110.txt
→ http_status=200 size=502941 url=https://www.rfc-editor.org/rfc/rfc9110.txt
sha256 21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a
cmp <bytes> assimilation/rfc9110.txt → identical (BYTES_IDENTICAL)
```

The committed blob and the live document agree to the byte: `git cat-file -s` → 502 941, `git cat-file blob … |
sha256sum` → `21c1cdce…`. Two seat refetch copies agree as well (`scratch/ScoutReverifyRfc/rfc9110.txt`, the earlier
`scratch/SentScope/rfc9110-refetch.txt` → same sha). The C2 re-open's chromium bytes match the committed round-26
evidence exactly (`s106-decoded.cc` `9b93fe64…` = `corpus/evidence/round-26/sources/content-features-154.0.8037.97.cc`;
`s106-encoded.bin` `f17347b2…` = the S106 row's recorded encoded digest), so whether it re-fetched or re-read is
**UNKNOWN** — either way the host is on the named list.

**Gap (receipt discipline).** The landed fetch record gives bytes and sha256 but no HTTP status:
`assimilation/README.md:7`, the S107 row and the corpus entry all say "502941 B, sha256 21c1cdce…". The contract's
own standard is "a fetch records status, byte count and sha256", and the lane has precedent — 13 earlier evidence
lines record a status (`git grep -IhoE 'status[ =:]+200|HTTP 200' master -- corpus/evidence/round-26 corpus/knowledge`
→ 13). Add the status line; it costs nothing and makes the receipt self-contained.

### (d) Credentials

F10. Two sweeps, zero real hits: landed blobs and the whole scratch tree; plus filename and environment-dump
checks. The only matches are RFC 9110's own grammar and examples inside the fetched document.

### (e) Fixtures

F11. 61 self-rooted fixture repos (53 scratch, 8 `/tmp`), 0 remotes, 0 `core.worktree`, 0 commits shared with lane
history, scratch structurally ignored and nothing from it tracked. Deviations: F2 (relative-path `r2` inside the
fleet repo — the one that hurts), F7 (loose `/tmp` evidence files, mine included). Positive note worth recording:
the seat fixtures I could inspect commit with `-C` on their own root and the `/tmp` ones use `mktemp` names.

### (f) Fleet repo

F1, F2, F8. Beyond the strays: the sanctioned path exists and is well-guarded (`scripts/hyaku/fleet-commit.sh`:
flock-serialised, repo-relative paths only, rejects `..` and absolute paths, rejects `.ufo/state/*` and
`.ufo/watchdog.log`, jj snapshots with `snapshot.auto-track="none()"`), no tabi report has been fleet-committed yet
(`.ufo/reports/round-27/` has no `tabi.md`), and the lane worktree itself cannot surface as a fleet stray because
of `.gitignore:1 *-shokunin/`. All 6 modified fleet paths are harness bookkeeping plus one blank line; nothing I
found is lane-authored *content* in a tracked fleet path. I touched nothing there.

---

## What I did not verify / cannot verify

- Attribution of F3's drift and of the two misroots — no session material read (out of bounds); UNKNOWN by design.
- Whether the C2 re-open fetched chromium live or re-read committed bytes — bytes agree, provenance indistinguishable.
- Whether C1 reaches 0 after integration: that is the L1's clean-tree run and the point of F4.
- RFC 9110's fetch *date*: the bytes prove content, not arrival time.
- The prior in-place report's F3 composition claim (3 × 3 196 = 9 588 of a 9 603 count): its mirror trees were
  pruned, so the arithmetic is unreproducible from the repo. Not adopted here.

## Method receipts

`git rev-parse`, `git log [--name-only --merges --format]`, `git diff [--name-status --stat --numstat --raw
--summary --cached]`, `git ls-tree [-r] [-l]`, `git show <rev>:<path>`, `git cat-file [-s blob]`, `git grep`,
`git merge-base --is-ancestor`, `git status --porcelain [-uall --ignored]`, `git check-ignore -v [--no-index]`,
`git config --get`, `find -newermt/-printf/-size/-maxdepth`, `stat`, `sha256sum`, `wc`, `cmp`, `du`, `ls`, `awk`,
`sed -n`, one `curl -sSL` GET (receipt above), `/proc/*/cwd` readlink scan, and one `python3` structural JSON read.

Writes made: this report only, plus `scratch/SentScope/` (`prior-SentScope-at-336d5d1.md` copy,
`rfc9110-get2.txt`, `sentscope_union.txt`, `sentscope_diff.txt`, `sentscope_fxheads.txt`). Three short lists were
first written to `/tmp` in error, then moved here and deleted (F7). No tracked file touched, no git/jj write, no
gate/build/linter/formatter run, no subagent, no message to another seat. Tooling installed or upgraded: **none**
(pacman untouched per the host-wide guard).
