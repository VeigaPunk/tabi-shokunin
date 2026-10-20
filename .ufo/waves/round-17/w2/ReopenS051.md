VERDICT: HOLDS

Attacked: SOURCES row S051 `git-symbolic-ref(1)` — https://git-scm.com/docs/git-symbolic-ref —
at M `6c97851034e9d8f58b135d28ff969f1f28fa2f7d:corpus/SOURCES.md:65` (queued, used-by `—`),
against its wave-1 Gate record `M:.ufo/waves/round-17/sources/JjColocation.md:55-69` (row 3, the
git-symbolic-ref entry). Re-opened the source for real (live page, pinned raw adoc, tag object,
host git 2.56.0 behaviour), recomputed byte digests, re-counted lines at the pinned commit, and
checked tier/scope/teaches/status/used-by plus the structural gate at M. No lane git writes; probe
and fetches ran in `/tmp/tabi-r17w2-ReopenS051-BByJ` (removed after). No tools installed.

Evidence (M = 6c97851034e9d8f58b135d28ff969f1f28fa2f7d)

URL resolves; fetch bytes match the recorded snapshot
- `curl -sS https://git-scm.com/docs/git-symbolic-ref` → HTTP **200**, final URL unchanged,
  **28804** bytes, sha256 `d706904473082a0ef07ed8eedd2c4d94be25dac852e58ff3b017048828c38872` —
  identical to `JjColocation.md:61-62`.
- The served page is the 2.56.0 manual: it renders "git-symbolic-ref last updated in 2.48.0" and
  "2.48.1 → 2.56.0 no changes", and carries both quoted clauses verbatim in rendered text.
- Pinned raw `https://raw.githubusercontent.com/git/git/v2.56.0/Documentation/git-symbolic-ref.adoc`
  → HTTP **200**, **2372** bytes, sha256 `c852e74cba71e5b574205fd4f0ba18817f38be0ab5447435754a326480b60692`
  — identical to `JjColocation.md:63-64`.

Anchor revision exists exactly as recorded
- `git ls-remote https://github.com/git/git 'refs/tags/v2.56.0*'` →
  `2478544319491bbd2a42cc57a83e3d2f4730a280 refs/tags/v2.56.0` and
  `a018953688f1b10bddf91bff8747068f5f4746a4 refs/tags/v2.56.0^{}`.
- `git cat-file -t 2478544…` → `tag`; `git cat-file -p 2478544…` → `object a0189536…`, `type commit`,
  `tag v2.56.0`, tagger `Junio C Hamano`, message `Git 2.56`. So "tag object … peels to …" is exact.
- Blob at the peeled commit (`cat-file blob a0189536…:Documentation/git-symbolic-ref.adoc`)
  sha256 = `c852e74c…0692`, byte-identical to the `v2.56.0` raw URL, so pin and commit agree.

Quote verbatim at the recorded line range (24 words ≤ 25)
- `nl -ba` at the peeled commit: lines **41-43** are, after joining asciidoc wraps,
  `Do not issue an error message if the <name> is not a symbolic ref but a detached HEAD; instead exit with non-zero status silently.`
  — word-for-word the Gate quote at `JjColocation.md:66-67`, 24 words (script count).
- Supporting fragment at `:72-73` = `will exit with status 0 if the contents of the symbolic ref were
  printed correctly` (15 words, substring of the line); `:74` continues
  `name is not a symbolic ref, or 128 if another error occurs.` The row's anchor `:72-74` covers the
  whole EXIT STATUS paragraph, so the "exits 1" half of `teaches` is anchored, not inferred.
- Line numbers now re-counted at the pinned commit; the lesson-gate draft's caveat
  (`drafts/lesson-gate.md:24`, "line numbers not re-counted") is closed: **41-43 and 72-74 are exact**.

Teaches honest — reproduced on host `git version 2.56.0`
- attached (`HEAD` file `ref: refs/heads/master`): `git symbolic-ref -q HEAD` → `refs/heads/master`,
  rc **0**; same with `--no-recurse`, the form the gates use (`scripts/check-round-contract.mjs:123`).
- detached (`HEAD` file = raw hash): stdout empty, rc **1**, stderr **0 bytes** → "exits 1 silently" exact.
- non-quiet detached: rc **128**; doc `:74` assigns 128 to "another error", so the `-q` distinction
  is the one the row claims. `man git-symbolic-ref` footer: `Git 2.56.0 2026-09-27`.
- Precision note (not a break): stdout is the full branch ref `refs/heads/<name>`, not the short name
  (`--short` gives `master`). The row's consumer depends on the full ref: laneTip matches
  `/^refs\/heads\//` and slices the newline (`scripts/check-round-contract.mjs:125-131`). "Prints the
  branch" is a metonym for the branch ref, so the row is not false, only loose.

Tier / scope honest
- Tier A: `SOURCES-CONTRACT-v1.md:26-28` — primary official documentation of the tool itself; scope
  cell names exactly the detached-HEAD + exit-status contract at 2.56.0, no global claim.
- Recheck `180d` is conservative: the page states no changes from 2.48.1 through 2.56.0.

Status / used-by consistent at M
- Row is `queued` with used-by `—`. Contract: `queued` = "opened, worth mining"; `mined` requires
  ≥1 citing path (`SOURCES-CONTRACT-v1.md:36-41`). `git grep S051` at M hits only
  `corpus/SOURCES.md:65` (the row) and `:77` (the `jj-colocated-anchor` Paths sentence) — no
  committed knowledge entry or lesson cites it, and `corpus/lessons/round-17.md` is absent at M
  (`git cat-file -e` → exit 128). `PLAN.md:217-218` explicitly mandates S049–S052 stay `queued`
  this round. So `queued`/`—` is the honest state at M, not a stale `mined`.
- Structure: 11 cells / split NF 13, no `|` inside cells; duplicate-id and enum/tier awk checks from
  `SOURCES-CONTRACT-v1.md:73-80` print nothing; `node scripts/check-sources.mjs` →
  `SOURCES_GATE verdict=clean rows=53 tiers=A:43,B:4,C:6 status=queued:6,mined:41,rejected:6 findings=0`, exit 0.

Non-breaking observations for L1 (nothing to repair in S051)
1. `corpus/SOURCES.md:77` says the trail "Ends at the round-17 lesson and the SKILL round-17 anchor
   rule". At M neither exists: `corpus/lessons/round-17.md` is absent and `SKILL.md` at M has no
   round-17 / lane-tip / symbolic-ref text (`git show M:SKILL.md | grep -n -i 'lane tip|round-17|symbolic-ref'`
   → no hits). This is the documented deferral (`PLAN.md:217-218`) and is not a row claim, but L1 must
   land both artifacts and flip S051 to `mined` with `used-by corpus/lessons/round-17.md` at
   integration, or the Paths sentence will be false at the round tip. [INFERENCE: the planned lesson
   is the intended citing path; the plan text says so.]
2. `teaches` says "prints the branch" where the command prints `refs/heads/<branch>`; a tightening
   would read "prints the branch ref". Contract rule 2 forbids editing `teaches` in place, and a
   superseding row is disproportionate for this paraphrase — leave as is, or use the wording above if
   a superseding row is ever opened for another reason.

Repair: none — every checked claim reproduces byte-for-byte and behaviourally.

Files written: .ufo/waves/round-17/w2/ReopenS051.md
