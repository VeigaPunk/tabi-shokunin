# JjColocation — jj-owned git HEAD in the colocated lane (C1 source open)

Seat `TabiR17.SrcJjColocation-2`, opened 2026-10-20, lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Purpose: source **C1** (`PLAN.md` C1, operability 8) — the round gates must anchor to the lane branch
tip, never to `git HEAD`. Routed inputs: `JjAuditTabi.md` F1/F2/F3/F6 and `JjTrialTabi.md`
(`/home/vgpnk/Projects/shokunin/.ufo/waves/hyaku/jj-w1/reports/`), plus the C1 `laneTip()` contract.
Contract: `CORPUS.md` §SOURCES.md (SOURCES contract v1). This file is a **draft**: the L1 places the
rows in `corpus/SOURCES.md` and assigns ids (`S0??` = next free id after S040).

## Row 1 (PRIMARY, required) — jj git-compatibility docs

```
| S0?? | Jujutsu docs — Git compatibility (v0.45.1) — https://docs.jj-vcs.dev/v0.45.1/git-compatibility/ | docs | A | Co-located jj/Git workspace semantics for git HEAD, index and refs; not jj command UX | v0.45.1 (tag 7c41cdeb16b6b321c64e789a966b6adf723816a5), §Colocated Jujutsu/Git workspaces ¶5; raw docs/git-compatibility.md:113-115 | In a colocated workspace git HEAD is jj-owned and usually detached with no current branch, so a gate must resolve an exported branch ref, never HEAD | mined | 2026-10-20 | on-release | corpus/lessons/round-17.md |
```

Gate entry (row 1):

- URL as named by the assignment: `https://jj-vcs.github.io/jj/latest/git-compatibility/` →
  **HTTP 301**, `location: http://docs.jj-vcs.dev/latest/git-compatibility/`.
- Final: `https://docs.jj-vcs.dev/latest/git-compatibility/` → **200**, 61,334 bytes,
  sha256 `db9c9a760810386858e6b1bad4a7a334c56bd48c77692dbc1c343657ae0ca254`.
- Version-pinned page (row anchor): `https://docs.jj-vcs.dev/v0.45.1/git-compatibility/` → **200**,
  58,508 bytes, sha256 `5362168d6cd398ea2f6a2d9ed6cad2807f356ee2e8800b277767c2f0987c0367`.
- Raw markdown at tag: `https://raw.githubusercontent.com/jj-vcs/jj/v0.45.1/docs/git-compatibility.md`
  → **200**, 12,284 bytes, sha256 `0fb71f992b0ed05d547e597d3f5f1cd33ed9e5d56a4e4e4cb851ba30c766c641`.
- Revision: tag `v0.45.1` = commit `7c41cdeb16b6b321c64e789a966b6adf723816a5` (GitHub API
  `repos/jj-vcs/jj/git/ref/tags/v0.45.1`, type `commit`). Host binary `jj --version` →
  `jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5`, the same commit.
- Access date: 2026-10-20.
- Quote (13 words), verbatim, raw `docs/git-compatibility.md:113-115` (§Colocated Jujutsu/Git
  workspaces, ¶5; identical text in the rendered page):
  `jj commands will usually put the Git repo in a "detached HEAD" state`
- Supporting clause, same paragraph, `:114-115`: `since in jj there is not concept of a "currently
  tracked branch"` — the source's "is not concept" is its own typo and is quoted verbatim.

## Row 2 (optional, supporting) — jj CHANGELOG at v0.45.1

```
| S0?? | Jujutsu CHANGELOG (v0.45.1) — https://raw.githubusercontent.com/jj-vcs/jj/v0.45.1/CHANGELOG.md | docs | A | jj 0.45.0/0.45.1 git-HEAD behaviour in colocated workspaces | v0.45.1 (tag 7c41cdeb16b6b321c64e789a966b6adf723816a5), §0.45.0 Fixed bugs:96-97; §0.45.0 New features:68-71 | jj 0.45 resets the Git HEAD to the parent of the working-copy commit and tracks Git HEAD per worktree, so HEAD equals a bookmark only by coincidence | queued | 2026-10-20 | on-release | — |
```

Gate entry (row 2): `https://raw.githubusercontent.com/jj-vcs/jj/v0.45.1/CHANGELOG.md` → **200**,
212,175 bytes, sha256 `05c34fb8d81f4de624c4f6754f6e31abdee14942ce3f32cc6925b7775b393c76`; revision
`v0.45.1` as above; access 2026-10-20.

Quote (20 words, markdown code spans flattened) at `CHANGELOG.md:96-97`:

    In colocated workspaces, jj workspace update-stale now correctly resets the Git HEAD to the
    parent of the fresh working-copy commit.

Supporting quotes, same revision: `Git HEAD state is now tracked per worktree internally.`
(`:68-69`, 9 words); `jj git import in non-colocated repositories no longer imports commits from a
detached Git HEAD branch.` (`:50-51`, 16 words).

## Row 3 (optional, supporting) — git-symbolic-ref(1) at 2.56.0

```
| S0?? | git-symbolic-ref(1) — https://git-scm.com/docs/git-symbolic-ref | docs | A | Detached-HEAD detection and the symbolic-ref exit-status contract (git 2.56.0) | git 2.56.0 (tag object 2478544319491bbd2a42cc57a83e3d2f4730a280 peels to a018953688f1b10bddf91bff8747068f5f4746a4), Documentation/git-symbolic-ref.adoc:41-43 and :72-74 | git symbolic-ref -q HEAD exits 0 and prints the branch when HEAD is attached, and exits 1 silently when HEAD is detached | queued | 2026-10-20 | 180d | — |
```

Gate entry (row 3): `https://git-scm.com/docs/git-symbolic-ref` → **200**, 28,804 bytes, sha256
`d706904473082a0ef07ed8eedd2c4d94be25dac852e58ff3b017048828c38872`; pinned raw
`https://raw.githubusercontent.com/git/git/v2.56.0/Documentation/git-symbolic-ref.adoc` → **200**,
2,372 bytes, sha256 `c852e74cba71e5b574205fd4f0ba18817f38be0ab5447435754a326480b60692`. Local
`man git-symbolic-ref` (Git 2.56.0, 2026-09-27) carries the same text. Access 2026-10-20. Quote
(24 words) at `git-symbolic-ref.adoc:41-43`: `Do not issue an error message if the <name> is not a
symbolic ref but a detached HEAD; instead exit with non-zero status silently.` Supporting
`:72-73` (15 words, leading asciidoc quote marks dropped): `will exit with status 0 if the
contents of the symbolic ref were printed correctly`

## Row 4 (optional, supporting) — git-rev-parse(1) at 2.56.0

```
| S0?? | git-rev-parse(1) — https://git-scm.com/docs/git-rev-parse | docs | A | HEAD's meaning and safe revision resolution with --verify --end-of-options (git 2.56.0) | git 2.56.0 (tag object 2478544319491bbd2a42cc57a83e3d2f4730a280 peels to a018953688f1b10bddf91bff8747068f5f4746a4), Documentation/git-rev-parse.adoc:498-505 and included Documentation/revisions.adoc:49-51 | HEAD names the commit the working tree is based on, not a branch, and rev-parse --verify --end-of-options errors on empty or invalid revisions | queued | 2026-10-20 | 180d | — |
```

Gate entry (row 4): `https://git-scm.com/docs/git-rev-parse` → **200**, 122,459 bytes, sha256
`1e84fc200220b2cd356b78f2344766ee7cbaafa8bcef64679dbf47ec585f19da`; pinned raw
`.../git/git/v2.56.0/Documentation/git-rev-parse.adoc` → **200**, 17,036 bytes, sha256
`4d8e9aca13f6ea6808272eb44e417687a5cca7d23cf1ed311f25e9fdeb148902`; included
`.../Documentation/revisions.adoc` → **200**, 17,266 bytes, sha256
`b23a9eb17d9b193adccee6b79cb1c1fef450703dae925a33b8a1c6f6639d82ff`. Access 2026-10-20. Quote
(13 words) at `git-rev-parse.adoc:504`: `This will error out if $REV is empty or not a valid
revision.` Supporting (13 words) `revisions.adoc:51`: `names the commit on which you based the
changes in the working tree.`

## Knowledge facts this source supports

C1 (each fact carries its own anchor):

- **C1-F1** — A jj-colocated repo's git HEAD is usually detached, because jj has no "currently
  tracked branch". Row 1, `docs/git-compatibility.md:113-116`.
- **C1-F2** — git HEAD is set to the **parent** of the jj working-copy commit (`@-`), not to `@`.
  Row 1, `docs/git-compatibility.md:208` ("Convince jj to update .git/HEAD to point to the
  working-copy commit's parent"); Row 2, `CHANGELOG.md:96-97` restates the same invariant.
- **C1-F3** — Detached HEAD is a silent, exit-code-only test: `git symbolic-ref -q HEAD` exits 0
  and prints the ref when attached, exits 1 with no message when detached, 128 on other errors.
  Row 3, `git-symbolic-ref.adoc:41-43` and `:72-74`.
- **C1-F4** — `HEAD` is defined as "the commit on which you based the changes in the working
  tree", i.e. a checkout pointer, not a branch; `git rev-parse --verify --end-of-options
  <rev>^{commit}` is the resolution idiom that errors on empty/invalid input rather than echoing
  it. Row 4, `revisions.adoc:51` and `git-rev-parse.adoc:499-504`.
- **C1-F5** — Observed on the host's jj 0.45.1 (sandbox clone, see below): after `jj new`,
  `symbolic-ref -q HEAD` → rc 1; `HEAD` = `@-` = `7febd3512a52…`; `refs/heads/master` stays
  `5859243183c4…`; `merge-base --is-ancestor HEAD refs/heads/master` → rc 1; `git branch -a
  --contains HEAD` → `* (no branch)`. HEAD was kept alive only by `refs/jj/keep/7febd351…`.
- **C1-F6** — The area is live upstream: 0.45 tracks Git HEAD per worktree and changed import
  behaviour for detached HEAD. Row 2, `CHANGELOG.md:50-51` and `:68-71`. This is why the recheck
  cadence is `on-release`, not a day count.

C2 — **no direct fact.** This source says nothing about WebMCP, CDP or tool invocation; it cannot
support any C2 claim. The one C2-relevant consequence is an inference, marked as such:

- **[INFERENCE] C2-F0** — "committed evidence" must mean *reachable from the lane branch tip*, not
  *reachable from HEAD*: a receipt committed while HEAD is detached can be reachable only from
  HEAD/`refs/jj/keep`, the same class of unlanded revision rows 1-2 establish. A C2 receipt gate
  should print the lane-tip 40-hex, not HEAD. Nothing in round 16 or in the round-16 note asserts
  otherwise.

## Contradictions

- **No contradiction with the round-16 note.** `corpus/knowledge/webmcp-chromium-loopback-round-16.md`
  makes no git/jj/HEAD claim; its `:127` ("No tool is invoked in the receipt") is C2's target, not a
  statement this source touches.
- **No contradiction with any existing row.** `grep -in 'jujutsu\|jj-vcs\|colocat'
  corpus/SOURCES.md` → no matches; S001-S040 contain no jj row. Row 1 opens a new family and its URL
  is not duplicated (normalized-URL check).
- **Contradicts a routed claim in `JjTrialTabi.md:133`**, which says the three gates "read objects
  by hash/ref …, never `HEAD` or the index — colocation-transparent". Baseline bytes disagree:
  `git show HEAD:scripts/check-round-contract.mjs` contains **25** `'HEAD'` tokens (`:119`, `:170`,
  `:173`, `:177`, `:231`, `:266`, `:466`, `:487`, …) and
  `git show HEAD:scripts/check-user-round-contract.mjs` contains **33**. `JjAuditTabi.md` F1/F3
  already showed HEAD-certified bytes; the trial's parity test ran when HEAD, `refs/heads/master`
  and `origin/master` all equalled `5859243` — exactly the state in which reading HEAD is
  invisible. "Usually detached" is not "always unequal to the tip", which is why the anchor rule
  must resolve the ref every run instead of comparing hashes once.
- Historical prose `SKILL.md:704` (`git show HEAD:SKILL.md`) and `SKILL.md:1346` (`HEAD d24b98d`)
  is not contradicted, but it is the pattern the C1 SKILL rule supersedes as a revision identity.

## Fetch sweep (2026-10-20)

| URL | code | bytes | sha256 / note |
|---|---|---|---|
| https://jj-vcs.github.io/jj/latest/git-compatibility/ | 301 | 162 | location http://docs.jj-vcs.dev/latest/git-compatibility/ |
| https://docs.jj-vcs.dev/latest/git-compatibility/ | 200 | 61334 | `db9c9a76…0ca254` |
| https://jj-vcs.github.io/jj/v0.45.1/git-compatibility/ | 301 | 162 | location http://docs.jj-vcs.dev/v0.45.1/git-compatibility/ |
| https://docs.jj-vcs.dev/v0.45.1/git-compatibility/ | 200 | 58508 | `5362168d…7c0367` |
| https://raw.githubusercontent.com/jj-vcs/jj/v0.45.1/docs/git-compatibility.md | 200 | 12284 | `0fb71f99…66c641` |
| https://raw.githubusercontent.com/jj-vcs/jj/v0.45.1/CHANGELOG.md | 200 | 212175 | `05c34fb8…393c76` |
| https://api.github.com/repos/jj-vcs/jj/git/ref/tags/v0.45.1 | 200 | — | commit `7c41cdeb…16a5` |
| https://git-scm.com/docs/git-symbolic-ref | 200 | 28804 | `d7069044…8872` |
| https://raw.githubusercontent.com/git/git/v2.56.0/Documentation/git-symbolic-ref.adoc | 200 | 2372 | `c852e74c…0692` |
| https://git-scm.com/docs/git-rev-parse | 200 | 122459 | `1e84fc20…19da` |
| https://raw.githubusercontent.com/git/git/v2.56.0/Documentation/git-rev-parse.adoc | 200 | 17036 | `4d8e9aca…8902` |
| https://raw.githubusercontent.com/git/git/v2.56.0/Documentation/revisions.adoc | 200 | 17266 | `b23a9eb1…82ff` |
| https://api.github.com/repos/git/git/git/refs/tags/v2.56.0 | 200 | — | tag object `2478544…` peels to `a0189536…46a4` |

Section equality: the §Colocated Jujutsu/Git workspaces text on `latest` and on `v0.45.1` is
identical (3,564 characters after tag-stripping); other sections were not compared.

## Observed probe — jj 0.45.1, sandbox clone, 2026-10-20

Sandbox `/tmp/tabi-r17-SrcJjColocation-dbVH` (`git clone --no-hardlinks` of the lane), deleted after
the run. Commands and output, in order:

```
$ git symbolic-ref -q HEAD            # plain clone, before jj init
refs/heads/master                     rc=0
$ jj git init --colocate
Initialized repo in "."
$ git symbolic-ref -q HEAD            rc=0     -> refs/heads/master (still attached)
$ jj new
Working copy  (@) now at: pslpwonn aa99864c (empty) (no description set)
Parent commit (@-)      : qooxryyx 7febd351 (empty) (no description set)
$ git symbolic-ref -q HEAD            rc=1     (detached, no message)
$ git rev-parse --short HEAD          7febd35
$ git rev-parse --short refs/heads/master   5859243
$ jj log --no-graph -r @  -T 'commit_id.short()'   aa99864c
$ jj log --no-graph -r @- -T 'commit_id.short()'   7febd351
$ git merge-base --is-ancestor HEAD refs/heads/master ; echo rc=$?   rc=1
$ git branch -a --contains HEAD       * (no branch)
$ git for-each-ref | grep 7febd35     refs/jj/keep/7febd3512a52027e69763eaff2763f8f1ea58db2
```

So HEAD names `@-`, an empty jj snapshot commit that is on no branch, while `refs/heads/master`
remains the exported bookmark. This reproduces `JjAuditTabi.md` F1 on jj 0.45.1 specifically.

Operational gotcha found while probing: `git rev-parse --short HEAD master` exits **128** with
`fatal: Needed a single revision` — `--short` cannot take two revisions. Resolve each revision in
its own `rev-parse` call; a gate that batches `--short` args silently loses every value.

## Placement notes for the L1

- **Substitute `S0??` before placing.** `scripts/check-sources.mjs:25` matches rows only as
  `^\| *S[0-9]{3,} *\|`; a literal `| S0?? |` line falls through to the `bad_id` branch at
  `:274-281` and exits 1 (E02). The id is the L1's assignment; do not reuse S040.
- Each row above splits into **13** fields (leading and trailing empty included) and no cell
  contains `|`.
- Row 1 is `mined` with `used-by corpus/lessons/round-17.md`. That file does not exist yet: place
  row 1 after the lesson exists, or place it `queued` with `—` and flip at the Gate
  (`check-sources.mjs` enforces `used_by_missing`, E11). Rows 2-4 are `queued`; flip a row to
  `mined` only when the lesson (or the row that cites it) actually cites its id.
- Recheck: `on-release` for the jj rows because 0.45 changed HEAD tracking; `180d` for the git
  rows because the `symbolic-ref` exit-status contract has been stable but is load-bearing for the
  anchor probe.
- Structural check after placement: `node scripts/check-sources.mjs` (structure only; it cannot
  see whether a source was opened).
