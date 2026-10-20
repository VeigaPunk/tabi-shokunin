VERDICT: ISSUES

Attacked: SOURCES row S049 at M (`6c97851034e9d8f58b135d28ff969f1f28fa2f7d:corpus/SOURCES.md:63`) and the
wave-1 dossier `.ufo/waves/round-17/sources/JjColocation.md` row 1: its URL, pinned revision, line/paragraph
locator, Gate quote, recorded sha256s, tier/scope/teaches, and status/used-by consistency.

Evidence (all commands run 2026-10-20, scratch dirs `/tmp/tabi-r17w2-ReopenS049-*`, deleted after):

- Row shape at M: 11 data cells (`awk -F'|'` → NF=13), kind `docs`, tier `A`, status `queued`,
  opened `2026-10-20`, recheck `on-release`, used-by `—`.
- Structural gate: `node scripts/check-sources.mjs` →
  `SOURCES_GATE verdict=clean rows=53 tiers=A:43,B:4,C:6 status=queued:6,mined:41,rejected:6 findings=0`, exit 0.
- URL resolves: `curl -sSL https://docs.jj-vcs.dev/v0.45.1/git-compatibility/` → **200**, 58,508 bytes,
  sha256 `5362168d6cd398ea2f6a2d9ed6cad2807f356ee2e8800b277767c2f0987c0367` — identical to the dossier's
  recorded versioned-page hash (sources/JjColocation.md). `latest` page → 200, 61,334 B, sha256
  `db9c9a760810386858e6b1bad4a7a334c56bd48c77692dbc1c343657ae0ca254`, also as recorded.
- Revision exists: `api.github.com/repos/jj-vcs/jj/git/ref/tags/v0.45.1` → `commit
  7c41cdeb16b6b321c64e789a966b6adf723816a5`; commit API → 200; host `jj --version` →
  `jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5`.
- Raw doc bytes: tag URL and commit URL both 12,284 B, sha256
  `0fb71f992b0ed05d547e597d3f5f1cd33ed9e5d56a4e4e4cb851ba30c766c641` (matches recorded), `cmp` rc=0.
- Gate quote: 13 words / 56 non-space chars (≤25 words, ≥20 chars). Raw `docs/git-compatibility.md:114-115`
  reads `… is that \`jj\` commands will usually put the Git / repo in a "detached HEAD" state, since in \`jj\`
  there is not concept of a …`; flattened text is verbatim, and the same sentence is present in the rendered
  v0.45.1 page (`One reason for this (see below for more) is that jj commands will usually put the Git repo in
  a "detached HEAD" state …`). The cited range `113-115` is the containing sentence ("One reason…" starts at
  line 113), so the quote sits inside the cited span; the quoted fragment itself starts at line 114.

Defect found (the only falsified cell):

- Anchor cell (S049, field 6) and dossier line 31 say `§Colocated Jujutsu/Git workspaces ¶5`. The quote is
  paragraph **3** of that section in both artifacts:
  - raw: § starts line 100; ¶1 = 102-106, ¶2 = 108-109, ¶3 = 111-117 (contains the quote);
  - rendered v0.45.1: `<h2 id="colocated-jujutsugit-workspaces">`; the 3rd `<p>` is the `It is allowed to
    mix jj and git commands…` paragraph carrying the quote.
  - ¶5 is `You can disable colocation with the --no-colocate flag…` (raw 123-129), rendered 5th `<p>`.
  The line numbers are correct; the paragraph ordinal is not.

Adjacent honesty checks (no break):

- Tier A / kind docs: primary upstream mdBook page, not a derived write-up.
- Scope ("git HEAD, index and refs; not jj command UX") matches content: HEAD/staging area at 44-51,
  colocated HEAD at 111-117, refs/import at 121 and 142-146, `refs/jj/` at 229.
- Teaches: the descriptive clause (`usually detached with no current branch`) is verbatim-supported at
  111-117; `jj-owned` is a fair summary; the tail (`so a gate must resolve an exported branch ref, never HEAD`)
  is the C1 rule derived from the source — [INFERENCE]-grade, not a sentence in the doc, and it is the cell's
  stated lesson rather than a misquotation.
- Status/used-by: `queued` + `—` is consistent with `PLAN.md:217` ("Sources S049–S052 … stay queued") and with
  E11, which only constrains `mined`. `corpus/lessons/round-17.md` does not exist at M
  (`git cat-file -e 6c978510…:corpus/lessons/round-17.md` → rc=128), so a `mined` row would have failed E11;
  the M placement correctly stayed queued (the wave-1 draft's `mined | corpus/lessons/round-17.md` was not
  copied). Paths section at `corpus/SOURCES.md:77` lists `jj-colocated-anchor — S049 → S050 → S051 → S052`.

Concrete repair:

1. In `corpus/SOURCES.md:63`, anchor field: `¶5` → `¶3`; optionally narrow `113-115` → `114-115` if the locator
   is meant to name the quote rather than the sentence.
2. Same two edits in `.ufo/waves/round-17/sources/JjColocation.md:13` (row 1) and line 31 (Gate quote line).
   The `113-115` span in both files contains the quote and can stand if kept as sentence-level provenance.

Limits / unresolved:

- Paragraph ordinals were taken by blank-line splitting of the raw file and `<p>` scanning of the rendered
  page; both agree (3, not 5). No alternative numbering yields 5.
- Only the §Colocated Jujutsu/Git workspaces section was compared between `latest` and `v0.45.1` at wave 1;
  this re-open re-checked the v0.45.1 anchor only (the row pins v0.45.1).
- No gate or script was run against the network beyond read-only curl; no packer/git write in the lane.

Tooling: no installs or upgrades (host `jj 0.45.1`, `git 2.56.0`, `curl`, `python3` sufficed); no pacman,
no npx, no browser.

Files written:
- `.ufo/waves/round-17/w2/ReopenS049.md`
