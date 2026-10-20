VERDICT: PASS

## What was opened

`jj` 0.45.1 documentation on colocated Jujutsu/Git workspaces, plus the 0.45 CHANGELOG entries that
fix the git-HEAD invariant, plus the two git 2.56.0 man pages the C1 `laneTip()` rule depends on.
Four draft rows are in `.ufo/waves/round-17/sources/JjColocation.md`; the L1 assigns ids
(`S0??` = next free after S040). Nothing else in the lane was written.

## Primary row (13 fields, no `|` in cells)

| S0?? | Jujutsu docs — Git compatibility (v0.45.1) — https://docs.jj-vcs.dev/v0.45.1/git-compatibility/ | docs | A | Co-located jj/Git workspace semantics for git HEAD, index and refs; not jj command UX | v0.45.1 (tag 7c41cdeb16b6b321c64e789a966b6adf723816a5), §Colocated Jujutsu/Git workspaces ¶5; raw docs/git-compatibility.md:113-115 | In a colocated workspace git HEAD is jj-owned and usually detached with no current branch, so a gate must resolve an exported branch ref, never HEAD | mined | 2026-10-20 | on-release | corpus/lessons/round-17.md |

Gate: named URL `https://jj-vcs.github.io/jj/latest/git-compatibility/` → HTTP 301 →
`https://docs.jj-vcs.dev/latest/git-compatibility/` 200 (61,334 B, sha256 `db9c9a76…0ca254`);
versioned anchor `https://docs.jj-vcs.dev/v0.45.1/git-compatibility/` 200 (58,508 B, sha256
`5362168d…7c0367`); raw markdown at the tag 200 (12,284 B, sha256 `0fb71f99…66c641`). Revision
`v0.45.1` = `7c41cdeb16b6b321c64e789a966b6adf723816a5`, identical to the host binary's
`jj --version` build string. Quote (13 words, `git-compatibility.md:113-115`):
`jj commands will usually put the Git repo in a "detached HEAD" state`. Supporting clause
(`:114-115`): `since in jj there is not concept of a "currently tracked branch"` (source typo kept).
Access date 2026-10-20. All nine quotes in the file were re-checked as verbatim substrings of the
fetched bytes (script output in this session: every primary `verbatim=True`, 13/20/24/13 words).

## Findings

- **C1 now has primary sources, not just the routed audit.** `JjAuditTabi.md` F1/F2/F3/F6 showed
  HEAD-certified bytes; the docs say why this is normal for the lane
  (`docs/git-compatibility.md:113-115`), and jj 0.45's CHANGELOG pins the invariant that HEAD is
  the parent of the working-copy commit (`CHANGELOG.md:96-97`, `:68-71`).
- **Live probe on jj 0.45.1 reproduced it** in a disposable sandbox clone (`git clone
  --no-hardlinks`, then `jj git init --colocate`, `jj new`): `symbolic-ref -q HEAD` rc=1;
  HEAD = `@-` = `7febd351…`; `refs/heads/master` = `5859243…`; `merge-base --is-ancestor HEAD
  master` rc=1; HEAD survives only as `refs/jj/keep/7febd351…`. Full transcript in the source file.
- **Probe gotcha worth a gate rule:** `git rev-parse --short HEAD master` exits 128
  (`fatal: Needed a single revision`) — `--short` takes one revision. Gates that batch `--short`
  args lose every value; resolve one ref per call.
- **Contradiction found (routed report, not the round-16 note):** `JjTrialTabi.md:133` says the
  gates "read objects by hash/ref …, never `HEAD` or the index — colocation-transparent". Baseline
  bytes disagree: 25 `'HEAD'` tokens in `check-round-contract.mjs` (`:119`, `:170-177`, `:231`,
  `:266`, `:466-487`, …) and 33 in `check-user-round-contract.mjs`. The trial's parity run had
  HEAD = master = `5859243` — exactly the state where reading HEAD is invisible. This is the
  sharpest reason the C1 rule must resolve the ref every run rather than compare hashes once.
- **Round-16 note: no contradiction.** `corpus/knowledge/webmcp-chromium-loopback-round-16.md`
  makes no git/jj/HEAD claim; its `:127` ("No tool is invoked in the receipt") is C2's target.
  No existing SOURCES row mentions jj/Jujutsu (grep: no match), so row 1 opens a new family.
- **C2: no direct fact.** This source cannot support a WebMCP/CDP claim. The only link is
  **[INFERENCE] C2-F0**: "committed evidence" should mean reachable from the branch tip, because a
  receipt committed under detached HEAD can live only in HEAD/`refs/jj/keep`. The C2 receipt should
  print the lane-tip 40-hex.
- **Placement hazard:** `scripts/check-sources.mjs:25` matches `^\| *S[0-9]{3,} *\|`; a literal
  `| S0?? |` row lands in the `bad_id` branch at `:274-281` and exits 1 (E02). Substitute the L1's
  id. Row 1 is `mined` against `corpus/lessons/round-17.md`; if it is placed before that lesson
  exists, place `queued`/`—` and flip at the Gate (E11 enforces used-by).

## Limits / unresolved

- Only the §Colocated Jujutsu/Git workspaces section was compared between `latest` and `v0.45.1`
  (identical, 3,564 chars); other sections of the live page may track a newer revision.
- `git-scm.com` pages are unversioned; the hashes are recorded, and the tag-pinned `.adoc` files
  carry the line anchors. Local man pages (Git 2.56.0, 2026-09-27) matched the adoc text.
- `jj commit` (audit F2) was not re-probed; only `jj new` was run this round.
- Sandbox `/tmp/tabi-r17-SrcJjColocation-dbVH` and the fetch scratch dir `/tmp/jjcoloc` were
  removed after the run; no cited failure depends on them.

## Tooling

No installs or upgrades: host `jj 0.45.1-7c41cdeb…`, `git 2.56.0`, `curl`, `man`, `python3` were
sufficient. No pacman, no npx, no browser.

Files written:
- `.ufo/waves/round-17/sources/JjColocation.md`
- `.ufo/waves/round-17/w1/SrcJjColocation.md`
