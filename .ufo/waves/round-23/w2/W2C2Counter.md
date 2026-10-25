# W2C2Counter — C2 counter falsification (tabi r23 a1, baseline a89f1935)

Verdict: **0→1 for the right reason at delivered commit `03c1b4d`, but only because a new file carries
it — the frozen command cannot tell that from an append, a citation with no SOURCES row, or a bare
`git add`; until `03c1b4d` it existed nowhere but the index. The number holds; the counter as proof of
admission does not.**

| command (as frozen, `<REV>` substituted) | result |
|---|---|
| `git rev-parse HEAD` | `03c1b4d9a9ea7719ff4a13a63989fa9be36229c3` (first measurement: `a89f1935` = baseline) |
| `git grep -lE '^source: S10[23] ' a89f1935 -- corpus/knowledge \| wc -l` | `0` |
| `git grep -lE '^source: S10[23] ' 03c1b4d -- corpus/knowledge \| wc -l` | `1` |
| `git diff --diff-filter=A --name-only a89f1935 03c1b4d -- corpus/knowledge` | `corpus/knowledge/csrf-defense-shape-boundary.md` |

The added file and the counter's single match are the same path, so at `03c1b4d` the conjunction that
makes the reason right **does** hold. Two qualifications: at first measurement the tip *was* the
baseline, the note untracked, and both rev form and bare form read `0` (`git grep` searches tracked
paths only) while `grep -rlnE '^source: S10[23] ' corpus/knowledge` read the file; and
`git diff --stat …/csrf-defense-shape-boundary.md` → `26 insertions(+), 13 deletions(-)` uncommitted.

## Findings
**F1 high — the counter cannot distinguish admission from append.** It is per-file (`git grep -l`), so
one new `source:` line in an already-admitted note increments it. Fixture `scratch/W2C2Counter/repo2`
(HEAD bytes only): `git archive a89f1935 corpus/knowledge | tar -x` → commit → `BASE=0`; then
`printf 'source: S102 — appended only\n' >> corpus/knowledge/webmcp-lifecycle-oracle-round-22.md` →
commit → `AFTER_APPEND=1`, `NEW_NOTES=0`. That target exists at HEAD, already carries `^source: S101 `,
so the cheapest way to have faked C2 is one appended line.
**F2 high — it counts citations, not the two new SOURCES rows.** Rows live in `corpus/SOURCES.md`; the
counter greps `corpus/knowledge`. Fixture `repo5`: a new note with
`source: S102 — cites a row that does not exist` → `CITE_WITHOUT_ROW=1`, `ROW_EXISTS=` (empty). The
row count and used-by binding are right here only incidentally
(`git show HEAD:corpus/SOURCES.md | grep -cE '^\| S10[23] '` → `2`).
**F3 medium — a genuine admission can leave the count at 0.** The regex needs exactly `^source: S10[23] `
(line start, one trailing space). Fixture `repo3`: `source: S102, S103 — one line` → `0`;
`**source:** S103` → `0`. Either satisfies the claim's intent and fails its metric.
**F4 medium — staging alone moves it, and that was the state for the whole wave.** Fixture `repo4`:
untracked → rev `0`, no-rev `0`; after `git add corpus/knowledge/added.md` → no-rev `1`, rev `0`. The
live tree reproduced it before `03c1b4d`: `git grep -lE '^source: S10[23] ' -- corpus/knowledge | wc -l`
→ `0` while `git status --porcelain corpus/knowledge` → `?? …/csrf-defense-shape-boundary.md`.
**F5 medium — no C2 measurement manifest.** `find corpus/evidence/round-23 -maxdepth 2` →
`c1-measurements.json` only; `grep -c 'S102\|C2' …/c1-measurements.json` → `0`. `QUALITY.md` criterion
22 admits a count only via `scripts/check-measurement-binding.mjs --check <manifest> --at <delivered
HEAD> --reproduce`: nothing to bind, and `before: 0` carries no measured record.
**F6 medium — the delivered note is dirty after its own delivering commit** (`cf0d02b` → `cddee37`:
PROVINCE wording, §2/§3 prose); a scorer re-running C2 reads bytes HEAD does not carry. The two source
lines are unaffected (`sed -n '3,4p'` on both → identical).
**F7 low — the note and its row disagree on the line range, and the note is wrong.** Note line 23:
`lines 2815–2828`; row S102: `lines 2815-2824`. Retained bytes (`scratch/SrcS102/rfc6265bis-13.txt`,
sha256 `0622…` = declared digest): 2815 `"SameSite" cookies offer…`, 2817 `however, prudent…`,
2822–2824 `Developers are strongly encouraged…`, 2826 `8.8.2.  Top-level Navigations` — the quoted
spans end at 2824, so `…–2828` over-runs into §8.8.2.
**F8 low — the S103 digest pins bytes the quotes were not taken from.** Declared `157809 B, sha256
6f32…` = `owasp-csrf.html` (verified). Two of four quotes read `0` against that HTML (inline
`<strong>`/`<code>`) and `1` only against the 50111-byte `owasp-csrf.txt`, sha256 `59ea36d6…`
unrecorded — a verifier pinning `6f32…` cannot re-derive the quote check.

## Corroboration (bytes, not prose)
- Provenance reproduces: `sha256sum` on retained files → `0622393…` (146976 B), `6f32bfb…` (157809 B),
  matching delivered lines 3–4 exactly. Numbering is clean and re-pointed by document: baseline max row
  `S101`, `S10[23]` at baseline → `0`, staged `S145/S146` → `0`; both used-by cells name the note;
  `git show HEAD:corpus/README.md | grep -c 'csrf-defense-shape-boundary'` → `1`.
- Errata grounded: draft reads `offer`, not `offers` (`grep -nE 'not the extent of|usual server-side
  defenses'` → 2817, 2822); `grep -cFi 'weaknesses' owasp-csrf.html` → `0`, so the staged
  `§Common CSRF weaknesses…` anchor does not locate; the client-side quote is at HTML 5630 under `<h2
  id="dealing-with-client-side-…">` (5628) and `Limitations of SameSite` at 5695 under `<h4 …>` (5688) —
  the note's attribution is right, the staged one's wrong.
- No admission row in `QUALITY.md` is **not** a defect: it is a numbered criteria list (line 22 binds),
  and `SOURCES.md:8` "admission stays in `corpus/QUALITY.md`" refers to those criteria; the round's
  additions there are lessons 61–63.
- Fixtures `.ufo/waves/round-23/scratch/W2C2Counter/{repo2..repo5}`; `git ls-files …/W2C2Counter` → empty, none leaked into `03c1b4d`. No tool installed; no pacman transaction run.
