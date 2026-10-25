# W2IdMap — staged S145/S146 → lane S102/S103

Round 23, wave 2, seat `L1Tabi23.W2IdMap`. Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`. The tree moved
mid-review: first measurements at HEAD `a89f1935` (round uncommitted), then landing `03c1b4d`; the worktree lesson
was edited again after landing. Every claim below names the bytes it read.

**VERDICT: the id map holds by document and the registry is clean. Two Gate defects I found were repaired in the
worktree during review (verified); one substantive gap remains: "never arithmetic" has no witness.**

## Findings

**F1 CLOSED-DURING-REVIEW (was HIGH) — the C2 after-arm was unmeasurable before the landing.**
At the authored state (HEAD `a89f1935`, entry untracked) both literal forms returned 0:
`git grep -lE '^source: S10[23] ' a89f1935f523a64b00991d792fca6a8c0d321948 -- corpus/knowledge | wc -l` → `0`;
`git grep -lE '^source: S10[23] ' -- corpus/knowledge | wc -l` → `0`, `--untracked` → `1`.
At the landing `git grep -lE '^source: S10[23] ' 03c1b4d9a9ea7719ff4a13a63989fa9be36229c3 -- corpus/knowledge | wc -l` → `1`,
but that commit's own lesson names no revision (`git show 03c1b4d:corpus/lessons/round-23.md | grep -c '03c1b4d'` → `0`).
The worktree now names the checkpoint at `round-23.md:47` (`grep -c '03c1b4d' corpus/lessons/round-23.md` → `1`), so the
after-arm is repeatable; `claims.json` `C2.countingCommand` still carries a bare `<REV>` (no `revisions` entry touches it).

**F2 CLOSED-DURING-REVIEW (was MEDIUM) — the added-file control lacked its path limiter.**
The landing bytes said "`git diff --diff-filter=A` over the same range names exactly that one added file"; unscoped,
`git diff --diff-filter=A --name-only a89f1935..03c1b4d | wc -l` → `930` (`-- corpus/` → `3`, `-- corpus/knowledge` → `1`).
The worktree now scopes the command (`round-23.md:45-47`), which is the form the Gate needs.

**F3 MEDIUM — "cannot be read as arithmetic" still has no disconfirming witness in the Gate (three exist).**
`lane = staged − 43` reproduces both rows, so the two-point table is numerically consistent with arithmetic; it dies only on
the non-adopted points: staged `S102` (CDP contribution README) → `S059` = "Playwright launch options"
(`grep -oE '^\| S059 \| [^—]{0,60}' corpus/SOURCES.md`); staged `S103` (chrome.debugger reference) → `S060` = "Playwright
downloads"; staged `S144` (Puppeteer Page.ts) → `S101` = "Round21 loopback non-autosubmit lifecycle observations"; staged
`S147` (Cloudflare 1015) → `S104`, absent (`grep -c 'cloudflare-1xxx-errors/error-1015' corpus/SOURCES.md` → `0`). Put
`S059` or `S101` in the table and the claim fails on a named byte instead of on faith.

**F4 LOW — the staged `used-by` is already dangling, which is what makes the control real.**
Staged S145/S146 `used-by` = `corpus/knowledge/csrf-defense-boundary.md`; `ls corpus/knowledge | grep -i csrf` → only
`csrf-defense-shape-boundary.md`, so a verbatim staging-only append trips census `E11 used-by path missing on disk`. Lane rows
re-point correctly (`awk -F'|' '/^\| S10[23] /{print $12}' corpus/SOURCES.md` → both `csrf-defense-shape-boundary.md`), and
census emits no `E11`; name `E11` in the control text so the mechanism is auditable.

## Verified clean (with the command that says so)

- **Documents distinct.** Staged S102 = `…/blink/public/devtools_protocol/README.md` (code); staged S103 =
  `developer.chrome.com/docs/extensions/reference/api/debugger` (docs): `awk -F'|' '/^\| S10[23] /{print $3}'
  /home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md`. Neither is in the lane
  (`grep -c 'devtools_protocol/README.md\|extensions/reference/api/debugger' corpus/SOURCES.md` → `0`).
- **Map by document, URLs byte-equal.** Staged S145 URL == lane S102 URL
  (`https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt`); staged S146 == lane S103
  (`…Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html`) — source cells compared as strings, exact.
- **No duplicate id.** `awk -F'|' … | sort | uniq -d` → empty; ids contiguous `S001`…`S103` (103 rows, adjacency awk finds
  no gap); baseline `git show a89f1935:corpus/SOURCES.md | grep -cE '^\| S[0-9]{3} '` → `101`.
- **No duplicate URL added.** `bash scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` → exit 0,
  `E`-lines `0`, `W04` lines `16`, ids `S058 S065 S066 S068 S069 S070 S073 S074 S075 S076 S077 S095 S096 S098 S099 S100` — all
  ≤ S100, so the append added zero warnings; `grep -E 'S10[23]'` over the census TSV → empty. (My raw count of repeated URL
  strings was 18; W04 is per-row after normalisation and cross-scope, so the census output is the authority.)
- **Collision guard reproducible.** Staged space `grep -oE '^\| S[0-9]{3} ' SOURCES.append.md | sort | uniq -d` → empty,
  148 ids `S102`…`S249`; baseline `S001`–`S101` ∩ staged = ∅, so `reg_ids=101 staged_ids=148 collisions=0` derives.
- **Surrounding counts re-derive.** Rows `101 → 103`; tiers `1×A, 1×B` (S102 A/spec, S103 B/docs, matching staged S145
  A/spec, S146 B/docs); recheck `180d`/`180d` → `on-release`/`90d` (`git show 03c1b4d:corpus/SOURCES.md | grep -cE '^\| S[0-9]{3} '`
  → `103`; `awk -F'|' '/^\| S10[23] /{print $10}' corpus/SOURCES.md`).

## Residual risk / verification gaps

- The map is verified **by URL string**, not upstream content: no GET is authorized for this seat, so the sha256 values,
  byte counts (146976 / 157809) and the §8.8.1 line-2815 quote are unverified here; swapping a document under an unchanged URL
  would leave the map reading correct.
- Pre-landing F1/F2 are recorded because the Gate's literal text was false at the bytes it was authored against; the repairs
  arrived in the worktree after the landing, not in `03c1b4d`.
- All bytes are lane-side and author-side; no axis, route or judgment is claimed.
