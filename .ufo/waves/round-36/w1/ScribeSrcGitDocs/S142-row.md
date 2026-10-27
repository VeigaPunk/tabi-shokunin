# S142 — drafted registry row (DRAFT, not inserted)

Seat: ScribeSrcGitDocs, tabi round 36 w1. This seat **did not edit** `corpus/SOURCES.md`.
The registry currently ends at **S141** (141 data rows, `grep -c '^| S[0-9]{3}'` = 141;
`S14[0-9]` occurrences = S140, S141 only), so **S142** is the next free id.

Schema: the 11-column header of `corpus/SOURCES.md` (`id | source | kind | tier | scope |
anchor | teaches | status | opened | recheck | used-by`). Format copied from the last mined
row (S141: URL in the `source` cell after an em dash, fetch facts with byte counts and sha256
in `anchor`, a single `mined`, an ISO date, a cadence token, comma-separated `used-by`).

Proposed row (one line, tab-free; markdown pipes only):

| S142 | git-show manual — https://git-scm.com/docs/git-show | docs | A | what `git show` reads and how a revision addresses a file's contents: the `<object>` argument's meaning (§DESCRIPTION) and the `<rev>:<path>` blob read (§EXAMPLES) — the object-addressing primitive a pin-versus-head text comparison depends on; also the page's silence about line-number stability across revisions. Not diff algorithms (git-diff, cited as support only), not repository integrity or object format, not working-tree state, and not the general `<rev>:<path>` grammar (gitrevisions(7), unopened this round) | page fetched 2026-10-27T09:29:57Z (200, 246,608 B, sha256 0a95cbcd8868054d851eedb192864798092c597592851989f5d1bb392730168a); §DESCRIPTION first paragraph at line 3272 "Shows one or more objects (blobs, trees, tags and commits)." (10 words, verbatim); §EXAMPLES at lines 5566-5571: synopsis `git show next~10:Documentation/README` with the definition "Shows the contents of the file Documentation/README as they were current in the 10th last commit of the branch next." (20 words, whitespace-normalised — the paragraph is line-wrapped at 5568-5571); support fetch of https://git-scm.com/docs/git-diff 2026-10-27T09:29:57Z (200, 229,155 B, sha256 5ae80d1deee5dc2c1acafff5491c5ba019629b9a785e6781a3e8a411cf9e22ed) §DESCRIPTION lines 3243-3246, fragment "changes between two blob objects" at line 3245 | `git show` emits one or more repository objects, and the `next~10:Documentation/README` example fixes the reading that `<rev>:<path>` yields a file's contents as of that commit — so a line read at a pinned revision and the same path at a delta head are comparable blobs, which is exactly the comparison the adjacency drift audit performs; the page documents no line-number guarantee, so "the cited text moved" stays a derivation over two objects and never a documented invariant | mined | 2026-10-27 | 180d | corpus/knowledge/adjacency-drift-audit-r36.md |

## Insertion notes for the L1

- `status` = `mined` (the page was opened, quoted and hashed by this seat this round; the
  taught fact is scoped to the two located passages).
- `recheck` = `180d` (living docs page with no release marker; low churn expected but the
  whole page is unversioned, so the digest is the only pin).
- `tier` = A: upstream vendor documentation for the tool the method calls, not a secondary
  blog or a community answer.
- One template deviation to flag: the ≤25-word quote rule is met by the DESCRIPTION line (10
  words) and by the EXAMPLES definition (20 words), but the EXAMPLES sentence is cited
  **whitespace-normalised** because the source hard-wraps it across four HTML lines. If the L1
  prefers strictly verbatim bytes, the DESCRIPTION line alone carries the row.
- `used-by` names the entry this seat drafted in the same seat dir; the entry itself is a DRAFT
  until the L1 lands both.
- Do **not** read this row as evidence for the drift ledger's statuses — it grounds the
  addressing primitive only.
