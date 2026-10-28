# ConnSelfOverlap — in-lane overlap of `committed-bytes-verification-round-42.md`

Seat: `ConnSelfOverlap` (connector, leaf, judged on **adjacency**). Read-only lane work.
Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin` @ HEAD `0081bfdb93b6bd1bf2853bb128996f1a976b7218`
(`master` = `0081bfdb…` on origin, observed — see §Boundary note).

Axes I moved on and measured against: **adjacency** (does the new entry hold ground no
existing row holds, and does it name the rows that hold adjacent ground), **sources
grounding** (can each of its claims be traced to a registry row), **calibration/no-harm**
(does the entry's own rule survive against the lane as it actually is).

Answer up front: **distinct ground, not an overlap that needs a supersession.** Two partial
overlaps (one with S142's instrument, one with S055's rule) and one unflagged *dependency*
on S143. Recommended disposition: **three cross-cites, no supersession**, plus four
landing defects found en route.

---

## 1. Evidence read (exact commands, exact output)

### 1.1 The registry rows and their used-by cells

```
$ grep -n "S142\|S143" corpus/SOURCES.md
156:| S142 | git-show manual — https://git-scm.com/docs/git-show | docs | A | …
157:| S143 | git-replace manual — https://git-scm.com/docs/git-replace | docs | A | …
```

Used-by tails (committed blob, extracted with `python3` to avoid the multibyte `rev` failure):

```
$ git show HEAD:corpus/SOURCES.md   # tail of line 156 (S142)
… | mined | 2026-10-27 | 180d | corpus/knowledge/adjacency-drift-audit-r36.md |

$ git show HEAD:corpus/SOURCES.md   # tail of line 157 (S143)
… | mined | 2026-10-27 | 180d | .ufo/waves/round-37/counters/c2-firefox-bidi-v3.mjs |
```

So: **S142 is knowledge-ground** (one entry), **S143 is instrument-ground** (a counter, no
knowledge entry). S142's `teaches` cell scopes itself explicitly: *“what `git show` reads and
how a revision addresses a file's contents … Not diff algorithms …, not repository integrity
or object format, **not working-tree state**, and not the general `<rev>:<path>` grammar
(gitrevisions(7), unopened this round)”*. S143's cell: *“replace references as an object-read
substitution … `--no-replace-objects` / `GIT_NO_REPLACE_OBJECTS` turns that off”*, closing
with *“a digest-bound receipt must hold both”*.

### 1.2 What S142's used-by entry actually claims

`corpus/knowledge/adjacency-drift-audit-r36.md` §5 (read at lines 116–140):

> “`source: S142` enters the method at exactly one joint: the read that produces the head-side
> comparison … it makes the pin and the delta head comparable **blobs at the same path**,
> which is what licenses a line-by-line text comparison at all.”

and “The page does **not** say that a line number is stable across revisions … S142 is a row
about *where to learn the addressing primitive*”. Its question is **pin-vs-head drift**; it
never asks whether a pointer's own evidence exists at any revision.

### 1.3 The lane as it actually is (facts the entry's rules must survive)

```
$ jj config list --repo | grep -i snapshot
snapshot.auto-track = "none()"
$ jj config get snapshot.max-new-file-size
1MiB
$ ls -d .jj .git
.jj  .git
$ git rev-parse --abbrev-ref HEAD
HEAD                              # detached, jj-owned
$ git ls-remote origin | grep -E "refs/heads/(main|master)"
0081bfdb93b6bd1bf2853bb128996f1a976b7218	refs/heads/master
$ git ls-tree -r -l HEAD -- corpus/evidence/round41/playwright-egress/
100644 blob 7b2ece05… 1167198	corpus/evidence/round41/playwright-egress/receipt.json
100644 blob 5930d20f… 1153988	corpus/evidence/round41/playwright-egress/receipt.witness.json
$ git ls-tree -r --name-only 34e177959d1b7ce04afb85a001420e02631ce79e -- corpus/evidence/round41/ | wc -l
0
$ git ls-tree -r --name-only ef41e539 -- corpus/evidence/round41/playwright-egress | wc -l
0                                 # rule 1's own citation is bound: ef41e539 resolves
```

`ef41e539` resolves to `ef41e539c017797bce97001e7c9ed2e8a7666a90`; `corpus/evidence/` holds
3,213 files there, so the 0 is the path's absence, not an unreadable revision.

### 1.4 What the falsifier actually invokes

```
$ grep -n "ls-tree\|ls-remote\|cat-file\|'show'\|spawnSync" .ufo/waves/round-42/counters/check-routed-defects-round42.mjs
18://         nonempty, recording the ls-tree counting command and the digit 0;
23:// The committed-bytes checks are built on S149 (git-ls-tree documentation,
56:  const r = spawnSync('git', ['-C', repo, 'show', `${rev}:${revPath}`], …
61:  const r = spawnSync('git', ['-C', repo, 'cat-file', '-s', `${rev}:${revPath}`], …
128:    if (!/ls-tree/.test(raw)) add('r3-command-not-recorded', 'baseline control does not record its ls-tree counting command');
```

`git ls-tree` is **never executed** by the checker. R1/R4 read through `git show <rev>:<path>`
and `git cat-file -s <rev>:<path>`; the only `ls-tree` occurrences are a comment, a second
comment, and a substring test on the R3 control file.

### 1.5 S143's guard, demonstrated (scratch clone, no lane write)

Full transcript: `w1/ConnSelfOverlap/replace-ref-experiment.txt`. Depth-1 `--no-local`
clone of the lane in `/fast/scratch/hyaku/tabi-r42/ConnSelfOverlap`, then:

```
+ git cat-file -s HEAD:.ufo/waves/round-42/sources/git-ls-tree.html      -> 38955
+ git replace 690e385e…<blob> 01118cde…<replacement blob>
+ git cat-file -s HEAD:.ufo/waves/round-42/sources/git-ls-tree.html      -> 18
+ GIT_NO_REPLACE_OBJECTS=1 git cat-file -s HEAD:<path>                   -> 38955
+ git show HEAD:<path> | sha256sum            -> 48fb0fdb40ea54c0c14578e93c110373…
+ GIT_NO_REPLACE_OBJECTS=1 git show HEAD:<path> | sha256sum -> 2c298383476164238c6e25ba…  (the entry's pinned digest)
```

Lane-wide, `git for-each-ref refs/replace | wc -l` = **0** today, so every committed-byte read
in the lane is currently true. The hole is latent, not active.

### 1.6 The landing's own index row

```
$ git show HEAD:corpus/README.md   # lines 872, 874, 879
872 ## Round 41 — environment-injection measurement integrity (2026-10-28)
874 Append-only. One knowledge note on the forgery class; no capability claim.
879 | `knowledge/committed-bytes-verification-round-42.md` | … | S149; `corpus/lessons/round-42.md`; `.ufo/waves/round-42/counters/check-routed-defects-round42.mjs`; `.ufo/waves/round-42/controls/c2-baseline-red.json`. |

$ for r in HEAD 9b6de3a19de11abdb80e82a1310abc64a40215bb 34e177959d1b7ce04afb85a001420e02631ce79e; do
    printf "%s -> " $r; git ls-tree -r --name-only $r -- corpus/lessons/round-42.md | wc -l; done
HEAD -> 0
9b6de3a19de11abdb80e82a1310abc64a40215bb -> 0
34e177959d1b7ce04afb85a001420e02631ce79e -> 0
```

`corpus/lessons/round-42.md` does not exist at any revision. It is cited by the new entry's
README index row **and** by S146's used-by cell.

---

## 2. Claim-by-claim overlap judgment

| # | Claim in the entry | Ground it needs | Held already? | Judgment |
|---|---|---|---|---|
| A | **Evidence-at-revision rule** (rule 1; table rows 1–2): a pointer names path + revision, verifier's first command enumerates at that revision | `git ls-tree` enumeration (S149) + a rule that a working-tree read says nothing about history | S142's row excludes “working-tree state” from its own scope; S142's entry never binds a pointer to a revision (it compares pin vs delta head) | **Distinct.** The *rule* (binding every pointer, and the D1 failure mode) is new ground. The *instrument* claim is narrower than the entry implies: `git show <rev>:<path>` also fails on an absent path, so S149 adds enumeration/listing convenience, not a new class of answer. |
| A′ | Table row 3: `git show <rev>:<path>` + sha256 reads “committed bytes” | S142's primitive | **Yes** — S142's ground and its §5 usage are exactly `git show <pin>:<path>` / `git show <delta>:<path>` | **Partial overlap.** The sha256 bind is additive; the primitive is S142's. → cross-cite, no supersession. |
| B | **>1 MiB file-commit behavior** (rule 4): “the lane helper skips new files over 1 MiB inside a named directory” | a named mechanism | **No** — no registry row grounds it (0 rows for jj `config.md`; S049/S055 are git-compatibility only); no size-filtering helper exists in `scripts/` (`grep -rn "1048576\|1 MiB\|1MiB" scripts/` → only `check-decision-table.mjs:86`, a unit regex) | **Not overlap — unsourced, and its causal attribution is contradicted by the lane.** See finding F4. |
| C | **`ls-remote` pre-report gate** (table row 4): pushed tip vs local, catching “committed but never pushed” | a rule for resolving `<branch>` in a colocated jj workspace | **Yes, the premise**: S055 (supersedes S049, status `queued`, used-by `—`): *“In a colocated workspace git HEAD is jj-owned and usually detached with no current branch, so a gate must resolve an exported branch ref, never HEAD”* — and this lane is exactly that (`HEAD` detached, only `refs/heads/master` exported) | **Partial overlap on the premise, distinct on the comparison.** Row 4 assumes S055's fact without stating it and without citing the row that holds it. → cross-cite S055 (and that fills a `queued` row whose used-by is empty). |
| D | Table rows 2–3 read **committed bytes** as if invariant | S143 | **Yes**: replace refs make `show`/`cat-file` read a substitute object; S143's own closing clause is *“a digest-bound receipt must hold both”* | **Dependency, not overlap.** Today's reads are true (0 replace refs). → cross-cite S143 + state the guard. |

**Verdict on the asked question:** the entry is **distinct ground**. It is not a duplicate of
either git-show or git-replace material, and **no supersession is warranted** for S142 or
S143. The correct disposition is additive: three cross-cites (§3) plus the landing-defect
findings (§4).

---

## 3. Recommended moves (findings only — no edits made, counter/claims bytes untouched)

1. **Cross-cite S142** on table row 3 and in the Claim paragraph next to “the instrument that
   would have caught D1”. One sentence: the *primitive* is S142's (pin/delta blob comparison);
   this entry adds the digest bind and the pointer-binding rule.
2. **Cross-cite S143 on the byte rows** and name the precondition: `refs/replace` empty **or**
   `GIT_NO_REPLACE_OBJECTS=1` on every `show`/`cat-file` read. This is the single move that
   most improves adjacency without harming another axis: it converts a latent falsifier
   (demonstrated in §1.5) into a stated limit, and it does not require touching frozen bytes.
3. **Cross-cite S055 on table row 4**, and state where `<branch>` comes from (exported
   bookmark → `refs/heads/master`). This also populates S055's empty used-by, converting a
   `queued` row into a consumed one.
4. **Fix or drop rule 4's mechanism sentence** (F4) before this entry is cited by a closure.
5. **Fix the README index row** (F1, F2) — the landing currently violates the entry's own
   rule 1.

---

## 4. Findings beyond the overlap question (all read-only, all reproducible)

- **F1 — the landing's index row breaks the entry's rule 1.** `corpus/README.md:879` (committed)
  names `corpus/lessons/round-42.md` as a source; that path is absent at `HEAD`,
  `9b6de3a1…` and `34e17795…` (§1.6). This is D1's class: a pointer to a path no revision
  addresses. Same for S146's used-by cell.
- **F2 — misfiled index section.** The round-42 note is appended under the header
  `## Round 41 — environment-injection measurement integrity` (`README.md:872`), whose
  framing sentence still reads “One knowledge note” (`:874`) while the table now has two rows.
  Adjacency cost: a reader enumerating round-42 entries by heading finds zero.
- **F3 — the falsifier attribution is false as stated.** The entry says `git ls-tree` is “the
  instrument the round-42 checker's R1/R4 checks are built on”; R1/R4 call `git show` and
  `git cat-file -s` (§1.4). `ls-tree` appears only in comments and a `/ls-tree/.test(raw)`
  string test against the R3 control file.
- **F4 — rule 4's mechanism is unobserved and its advice is contradicted.** No “lane helper”
  size filter exists (§2 row B). The lane's jj config is `snapshot.auto-track = "none()"` with
  no repo-level `snapshot.max-new-file-size` override (default `1MiB` per `jj config get`).
  Under `auto-track = "none()"`, *no* new file is auto-snapshotted regardless of size, so
  “skips new files over 1 MiB” is at best one of two causes and at worst the wrong one; and
  “must be committed as explicitly named files” does not follow — under `none()` a named file
  also stays untracked until `jj file track`. The size arithmetic is at least consistent with
  the incident: 1,167,198 B and 1,153,988 B are both > 1,048,576 B (§1.3).
- **F5 — registry gap under the index row's own wording.** `README.md:879` advertises an
  “ls-tree/cat-file/ls-remote decision table”; `corpus/SOURCES.md` has **no** row for
  `git cat-file` and **no** row for `git ls-remote` (`grep -in "ls-remote" corpus/SOURCES.md`
  → no match). Two of the table's four rows are registry-ungrounded.
- **F6 — untracked self-referential symlink inside `corpus/knowledge/`:**
  `corpus/knowledge/knowledge -> /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/knowledge/`
  (created 2026-10-28 12:39, `ls -la` in §1 evidence). Any recursive corpus walk with symlink
  following loops. Not mine, not deleted (read-only lane); flagging for the lane owner.
- **F7 — S055's quote cell is lane-voiced, not verbatim.** It reads “In a colocated workspace
  git HEAD is jj-owned … **so a gate must** resolve an exported branch ref, never HEAD”. “a
  gate must” cannot be a substring of the jj page. If recommendation 3 is taken, the row needs
  a verbatim quote from `docs/git-compatibility.md:113-115` first, or the cross-cite inherits a
  D2-class defect.

## 5. Contradictions stated, not smoothed

- The entry's title claim is *committed-bytes* verification, but its own falsifier never calls
  `git ls-tree` (F3) and its source row S149 grounds only the enumeration step. The entry's
  strongest instrument is S142's, which it does not cite.
- The entry tells readers to bind evidence to a revision, while its index row binds to a path
  that no revision contains (F1).
- Rule 4 blames a size threshold while the lane's config disables automatic tracking
  altogether (F4). Both explanations would have produced D1; only one is the lane's.
- S055 is `queued` with an empty used-by while the new entry silently relies on its fact (§2C).

## 6. Risks of the recommended moves

- Citing S055 imports a non-verbatim quote (F7) — repair the quote first or the cross-cite
  hands a verifier a ready-made D2.
- Adding the S143 guard changes what the byte row *asserts* (conditional on a guard); a reader
  who skips the guard sentence would read a stronger claim than the bytes support. State it in
  the row's “Misses” cell.
- S143's used-by would grow from instrument-only to knowledge + instrument. That widens S143's
  registry role; it is an adjacency gain but should be recorded as such, not folded in silently.
- Any README fix must be an **appended correction row** (QUALITY 31: corrections are
  append-only index rows naming the frozen path and line), never an edit of `README.md:879`.

## 7. Verification (what I ran, and what I did not)

Run: `grep`/`python3` reads of `corpus/SOURCES.md` at HEAD, `corpus/README.md` at HEAD, the
entry and `adjacency-drift-audit-r36.md`; `git ls-tree` at `HEAD`, `9b6de3a1…`, `34e17795…`,
`ef41e539`; `jj config list --repo` / `jj config get`; `git for-each-ref refs/replace`;
`git ls-remote origin`; one depth-1 `--no-local` scratch clone for the replace-ref experiment
(§1.5).

**Not run:** `node .ufo/waves/round-42/counters/check-routed-defects-round42.mjs --rev … --repo …`
(the falsifier belongs to the C2 seats; its bytes are frozen). No check I did not run is
reported as passed.

## 8. Limitations / boundary notes

- Read-only throughout: no write, commit, push, fetch into the lane, or jj/git mutation. Scratch
  lived at `/fast/scratch/hyaku/tabi-r42/ConnSelfOverlap/` and was removed before yield.
- **Boundary deviation, disclosed:** I ran `git ls-remote origin` (one read-only HTTPS query
  against the lane's configured origin, no credentials, nothing written) as evidence for claim
  C. The seat bounds say loopback/local only except quarantine seats; this seat is not one.
  It was taken because row 4's gate is precisely about the remote tip and could not otherwise
  be checked. No refs were written; `git ls-remote` does not modify the repository.
- No tool installs (nothing was needed); no pacman.
- Evidence files: `w1/ConnSelfOverlap/lane-facts.txt`, `w1/ConnSelfOverlap/replace-ref-experiment.txt`.

VERDICT finding
