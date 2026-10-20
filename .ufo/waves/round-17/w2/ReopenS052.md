VERDICT: ISSUES

Attacked: S052 `git-rev-parse(1)` — https://git-scm.com/docs/git-rev-parse — row at
`6c97851034e9d8f58b135d28ff969f1f28fa2f7d:corpus/SOURCES.md:66` (status `queued`, used-by `—`),
against its wave-1 Gate record `6c97851034e9d8f58b135d28ff969f1f28fa2f7d:.ufo/waves/round-17/sources/JjColocation.md:74-85` (row 4).
Re-opened the source for real: page + raw adoc at tag (sha256 recomputed), tag peeling via GitHub API,
quote/line/word checks, tier/scope/teaches reading, status/used-by and structural gate at M.
No rebase/rewrite; nothing was taken from the wave-1 prose without re-fetching it.

Evidence (M = 6c97851034e9d8f58b135d28ff969f1f28fa2f7d)

URL resolves, bytes/hash match the recorded fetch
- `curl https://git-scm.com/docs/git-rev-parse` → HTTP **200**, no redirect, **122459** bytes,
  sha256 `1e84fc200220b2cd356b78f2344766ee7cbaafa8bcef64679dbf47ec585f19da` — identical to
  `JjColocation.md:77-78`. Page drift since wave 1: none, byte-for-byte.

Anchor revision exists and is the one recorded
- `api.github.com/repos/git/git/git/refs/tags/v2.56.0` → 200, object `2478544319491bbd2a42cc57a83e3d2f4730a280`,
  type `tag`. Tag object endpoint → 200, type `tag`, tag `v2.56.0`, peels to **commit
  `a018953688f1b10bddf91bff8747068f5f4746a4`** — matches `SOURCES.md:66` and `JjColocation.md:78`.
- Raw `.../v2.56.0/Documentation/git-rev-parse.adoc` → 200, **17036** bytes, sha256
  `4d8e9aca13f6ea6808272eb44e417687a5cca7d23cf1ed311f25e9fdeb148902`; raw at the **peeled commit**
  hash → 200, same byte count and **same sha256**, so tag→commit resolution and the pinned bytes agree.
- Raw `.../v2.56.0/Documentation/revisions.adoc` → 200, **17266** bytes, sha256
  `b23a9eb17d9b193adccee6b79cb1c1fef450703dae925a33b8a1c6f6639d82ff` — both match `JjColocation.md:79-82`.

Anchor line exists; quote verbatim at :505 (record says :504 — defect, see below)
- Pointers were checked against the fetched adoc with exact line numbering. `git-rev-parse.adoc:498-505`
  exists (file is 505+ lines); quote **"This will error out if $REV is empty or not a valid revision."**
  is line **505**, 13 words, byte-exact (`L505 == q1 → True`).
- `JjColocation.md:83` records that quote "at `git-rev-parse.adoc:504`". Line 504 is the asciidoc
  continuation `+`; the rendering context is the EXAMPLES bullet
  (`$ git rev-parse --verify --end-of-options $REV^{commit}` then the sentence). Off by one.
- `git-rev-parse.adoc:355` is `include::revisions.adoc[]`, so the row's "included Documentation/revisions.adoc:49-51"
  is accurate; `revisions.adoc:50-51` defines ``HEAD``::: "names the commit on which you based the
  changes in the working tree." — line **51**, 13 words, byte-exact. The rendered page carries both
  strings (one occurrence each), confirming the include is served.

Tier / scope / teaches honest
- Tier A: vendor documentation for the tool's own revision syntax, scope-scoped to git 2.56.0 — row
  says so in the scope cell (`HEAD's meaning and safe revision resolution with --verify --end-of-options
  (git 2.56.0)`). No global claim.
- Teaches clause 1 "HEAD names the commit the working tree is based on" = `revisions.adoc:51`
  verbatim sense. Clause 2 "rev-parse --verify --end-of-options errors on empty or invalid revisions"
  = the example at `git-rev-parse.adoc:499-505`. The phrase "not a branch" is a gloss, not a sentence
  in the cited lines: `revisions.adoc:26-30` spells a branch as a separate `<refname>` form that
  *resolves to* a commit, so "HEAD names a commit, not a branch" is a fair summary and is contradicted
  nowhere in the anchor. [INFERENCE] the gloss carries the C1 point (HEAD is a commit pointer), and
  the detached semantics actually rest on S049/S051, not on this row.
- Empirical cross-check on the host (git **2.56.0**): `git rev-parse --verify --end-of-options ''`
  → rc **128** "fatal: Needed a single revision"; an invalid name → rc **128**; a valid object →
  rc **0** with the 40-hex. Consistent with the quoted sentence; recorded as a consistency check, not
  as source evidence.

Status / used-by consistent at M
- `SOURCES.md:66` = `queued`, used-by `—`. `PLAN.md:217-218` explicitly rules "Sources S049–S052
  (jj/git) stay `queued` this round (the lesson that cites them lands after the measured revision;
  used-by cannot point at it earlier)". `corpus/lessons/round-17.md` does not exist at M, and
  `git grep S052` at M hits only `PLAN.md:217`, the SOURCES row, its `Paths` line
  (`SOURCES.md:77`) and the search log (`:94`) — no SKILL.md or lesson citation. So no mined row is
  being passed off as unused, and there is no used-by path to validate (vacuous pass).
- Structural gate in a sandbox clone at M: `node scripts/check-sources.mjs` →
  `SOURCES_GATE verdict=clean rows=53 tiers=A:43,B:4,C:6 status=queued:6,mined:41,rejected:6 findings=0`,
  rc=**0**; S052 splits into 13 fields; URL not duplicated (S051 is git-symbolic-ref).
- Placement fidelity: dossier row at `JjColocation.md:74` equals `SOURCES.md:66` after `S0??`→`S052`
  substitution (string equality **True**), so the landed row is the reviewed draft.

Defects and repair

1. `JjColocation.md:83` — quote recorded "at `git-rev-parse.adoc:504`"; it is at **:505** (504 is `+`).
   Repair: change `:504` → `:505`. The landed row's range `498-505` already includes :505, so
   **no `SOURCES.md` change is needed** and the row's anchor remains true.
2. `JjColocation.md:102` (C1-F4) — cites `git-rev-parse.adoc:499-504` for the "errors on empty/invalid
   input" sentence that is at **:505**, i.e. one line short. Repair: `:499-504` → `:499-505`.
   Same class of off-by-one; no re-fetch, hash or status change follows from it.

Why not BREAKS: URL, revision, byte hashes, both quotes (verbatim, 13 words each), tier, scope and
queued status all hold; the error is two line pointers in the evidence dossier that point one line
short of a sentence the row's own range still covers. Why not HOLDS: the Gate record's stated quote
location is wrong as written, and the wave-1 ledger is the artifact a future lesson would trust.

Tooling: no installs or upgrades — curl, git 2.56.0, python3/awk (preinstalled) only; no pacman,
no REA/npx. Temporary fetch dirs and the M clone are deleted.

Files written: .ufo/waves/round-17/w2/ReopenS052.md
