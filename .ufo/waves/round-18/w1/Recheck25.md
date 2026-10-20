VERDICT: PASS

# C1 source recheck — S055, S056 (seat Recheck25)

Lane tip checked: `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse --verify refs/heads/master`
→ `2bff864fdfee684ddbcd066cc8e735adaba2735c` (baseline B). No git/jj write was run; fetches were read-only
`curl` GETs plus `git ls-remote`.

Producer: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/recheck-fetch.mjs`,
sha256 `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`; both receipts carry that
`producerSha256`.

Row shape at B: `git show 2bff864…:corpus/SOURCES.md` → S055 at :69, S056 at :70, each 11 data cells
(NF=13), `status=queued`, `opened=2026-10-20`, `recheck=on-release`, `used-by=—`; each row's `source`
cell contains its `rowUrl` verbatim. Neither id is in the PLAN.md superseded set (S004/S039/S047/S049/
S050/S053).

## S055 — Jujutsu docs, Git compatibility v0.45.1

Receipt: `corpus/evidence/round-18/source-recheck/S055.json` (schema `tabi-source-recheck-v1`)

- rowUrl / fetch url: `https://docs.jj-vcs.dev/v0.45.1/git-compatibility/` (same)
- http **200**, bytes **58508**, sha256 `5362168d6cd398ea2f6a2d9ed6cad2807f356ee2e8800b277767c2f0987c0367`
  (decode `html-text`)
- quote (13 words, found at normalized offset 7179):
  `jj commands will usually put the Git repo in a "detached HEAD" state`
  — `quoteSource: corpus/lessons/round-17.md:61` (Gate row S049, rendered form; the raw markdown wraps
  `jj` in backticks, the rendered page does not)
- `quoteFound: true`; excerpt `S055.excerpt.txt` sha256
  `e20e5d7e30c4b6af7f51714590207d85160337210e9018c21f72c6a3e2d9eeb6` (contains the quote and the
  surrounding paragraph)
- verdict **held**
- anchor observed: no version banner in the body; version comes from the `/v0.45.1/` URL path. The same
  sentence appears verbatim in tagged raw `docs/git-compatibility.md`, sha256
  `0fb71f992b0ed05d547e597d3f5f1cd33ed9e5d56a4e4e4cb851ba30c766c641` (12284 B), at `:114-115`, which
  is paragraph 3 of `#Colocated Jujutsu/Git workspaces` (raw `:111-117`; § starts `:100`; ¶1 `:102-106`,
  ¶2 `:108-109`).
- teaches judgment: **held**. ¶3 states that `jj` commands "will usually put the Git repo in a
  'detached HEAD' state, since in `jj` there is not concept of a 'currently tracked branch'" — that
  supports "git HEAD is jj-owned and usually detached with no current branch". The tail "so a gate must
  resolve an exported branch ref, never HEAD" is the row's own derived rule (`[INFERENCE]`, not a
  sentence in the doc), which is how the row already presents it; raw `:208`
  (`# Convince jj to update .git/HEAD to point to the working-copy commit's parent`) corroborates that
  HEAD tracks `@-` rather than a branch. The row already carries the round-17 correction (`¶3`,
  raw `113-115`), so no cell edit is warranted.

## S056 — Jujutsu CHANGELOG v0.45.1

Receipt: `corpus/evidence/round-18/source-recheck/S056.json`

- rowUrl / fetch url: `https://raw.githubusercontent.com/jj-vcs/jj/v0.45.1/CHANGELOG.md` (same)
- http **200**, bytes **212175**, sha256
  `05c34fb8d81f4de624c4f6754f6e31abdee14942ce3f32cc6925b7775b393c76` (decode `none`)
- quote (20 words, found at normalized offset 3219):
  ``In colocated workspaces, `jj workspace update-stale` now correctly resets the Git HEAD to the parent of the fresh working-copy commit.``
  — `quoteSource: corpus/lessons/round-17.md:62` (Gate row S050, in-bytes form with backticks)
- `quoteFound: true`; excerpt `S056.excerpt.txt` sha256
  `78147ee86ba8901db4c2340a27dd8112fa3431174a73186ae53258f8d02ea6e2`
- verdict **held**
- anchor observed: `:21` `## [0.45.1] - 2026-09-03`; `:36` `## [0.45.0] - 2026-09-02`; quote at `:96-97`
  inside §0.45.0 `### Fixed bugs`; per-worktree line at `:68-71` inside §0.45.0 `### New features`.
  `git ls-remote https://github.com/jj-vcs/jj 'refs/tags/v0.45.1*'` →
  `7c41cdeb16b6b321c64e789a966b6adf723816a5 refs/tags/v0.45.1` (lightweight, nothing to peel), matching
  the row's anchor cell.
- teaches judgment: **held**. `:96-97` states the `jj workspace update-stale` Git-HEAD reset to the
  fresh working-copy commit's parent (`@-`); `:68-71` states "Git HEAD state is now tracked per worktree
  internally". The clause "HEAD equals a bookmark exactly while `@-` is that bookmark commit, a state
  rather than a guarantee" is a derived semantics claim (`[INFERENCE]`) rather than a changelog sentence,
  but it is grounded by tagged docs `git-compatibility.md:208` (HEAD points to the working-copy commit's
  parent) and nothing in either anchored line contradicts it. This is the round-17-repaired wording
  (the removed "only by coincidence" claim is not reintroduced).

## Cross-checks

- Both fetched digests equal the round-17 Gate recordings: S055 HTML `5362168d…` (58508 B) and raw
  `0fb71f99…` (12284 B); S056 `05c34fb8…` (212175 B) (round-17 `corpus/lessons/round-17.md:61-62`).
  Three separate S055 fetches (~19:05-19:07Z) returned the identical 58508-byte body, so the page is a
  stable snapshot, not a per-response variant.
- `quoteWords` in both receipts equals the whitespace word count of `quote` (13 / 20, both ≤25);
  `excerptSha256` recomputed with `sha256sum` matches the JSON in both cases; `fetchedAt` is
  `2026-10-20T19:05:57Z` (S055 refetch) / `2026-10-20T19:05:57Z` (S056).
- No drift was found in either row, so no superseding SOURCES row and no new Gate entry are drafted.
- Remaining unknowns: the v0.45.1 docs page carries no in-body revision string, so the revision binding
  is the URL path plus the byte-level match against the tagged raw markdown (`0fb71f99…`), not a
  self-declared page version.

Tooling: no installs or upgrades; host `node v24.21.0`, `curl`, `git 2.56.0` sufficed. No pacman, no
npx/uv, no browser. Scratch dir `/tmp/tabi-r18-Recheck25` deleted.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S055.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S055.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S056.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S056.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/Recheck25.md
