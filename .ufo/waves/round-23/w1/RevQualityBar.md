# RevQualityBar — C2 staged CSRF entry vs the lane admission bar

Verdict: **ADMISSIBLE ONLY AFTER 4 NOTE-SIDE EDITS.** The two SOURCES rows are already re-pointed and re-fetched in-flight (S102/S103, opened 2026-10-25, digests present); the staged **note** still fails the bar and is not in the lane tree.

## Basis (read-only; no fetch, no gate run, no tracked write by me)
- `git show a89f1935:corpus/SOURCES.md | grep -cE '^\| S[0-9]{3} '` → 101 (max `S101`); `git grep -lE '^source: S10[23] ' a89f1935 -- corpus/knowledge | wc -l` → 0; `git ls-tree --name-only a89f1935:corpus/knowledge | grep -ci csrf` → 0.
- Live: `grep -cE '^\| S10[23] ' corpus/SOURCES.md` → 2 (S102/S103, `opened 2026-10-25`, anchor cells carry fetched byte counts + sha256).
- `ls corpus/knowledge | grep -ic csrf` → 0 while both rows' `used-by` names `corpus/knowledge/csrf-defense-shape-boundary.md`.
- `comm -3 <(ls corpus/knowledge|LC_ALL=C sort) <(grep -oE 'knowledge/[a-z0-9._-]+\.md' corpus/README.md|sed 's#knowledge/##'|LC_ALL=C sort -u)` → empty (41 notes = 41 indexed).
- Staged quote lengths, script over staged bytes: 7, 19, 18, 21, 7, 18 words — all ≤25 (pass).

## Findings
| # | Status | Criterion | Evidence command | Minimum edit |
|---|---|---|---|---|
| F1 | **blocking** | 11, 7, 43 | rows cite `csrf-defense-shape-boundary.md`; `ls corpus/knowledge \| grep -ic csrf` → 0 | Land the note at exactly the `used-by` path (or fix both rows) plus one `corpus/README.md` index row and a command-derived note count, in the same commit; otherwise `check-sources` → `used_by_missing` and the 41=41 index set breaks |
| F2 | **blocking** | 50 + CORPUS.md "a quote names its location" | staged `source:` line: §"Common CSRF weaknesses and protection mechanisms", §"Limitations of SameSite"; landed S103 anchor: §"Employing Custom Request Headers for AJAX/API", §"Dealing with Client-Side CSRF Attacks (IMPORTANT)" | Re-open found different headings: write the note's `source:` line with the observed headings and one § per quoted span; never copy the staged locations |
| F3 | **blocking** | 2, 28 | staged: "Wave 2 supplied the cookie mechanics…"; `ls corpus/knowledge \| grep -icE 'cookie\|samesite'` → 0; that note exists only under `shokuknow/merge/tabi/knowledge/…/cookie-samesite-semantics.md` | Ground on lane bytes (`corpus/README.md:183`, `corpus/knowledge/multi-step-journey.md:287-289`) or cite the sibling as `<repo>@<40-hex>:<path>` and label it unadmitted staging |
| F4 | **blocking** | 14 + C2 | staged: "This round supplies the limit and the observability" | Add the documented-tier line: no measured credit, population unchanged, in the round-22 README form (`101→101, mined73→73`) |
| F5 | gate gap | 54 | `scripts/check-sources.mjs:232` matches the row id anywhere in the body, not the first `source:` line | Do not let a clean `check-sources` stand as first-line binding; show `source: S102` on the first `source:` line explicitly |
| F6 | minor | 3, 50 | staged: "leaves a **shape** on the wire"; "SameSite in **strict mode** 'offers a robust defense…'" | Label the wire-shape sentence as documentation-derived inference; quote the draft's own mode qualifier or drop "in strict mode" |
| F7 | minor | 39 | staged: `ensuring that \"safe\" HTTP methods…` — backslashes defeat a byte substring match | Emit the source's own quoting (plain or curly), not escaped markdown delimiters |
| F8 | minor | 43, 34 | staged rows: S145 `180d`, S146 `180d`; landed: S102 `180d`, S103 `90d` | Let the landed rows govern the note's `recheck:` line; state the divergence rather than copying the staged cadence |
| F9 | info | 22, 26, 30, 37 | no run, counter or receipt exists for this entry | Keep the note free of any run/exit/self-test sentence; those criteria are unmatched by design |

## What already passes
- Rows re-pointed by document to S102/S103 (MERGE-REPORT.json `first_id:"S102"`, `renumbered:[]`), opened and re-fetched this round with sha256 + byte size + line range in `anchor` (F1–F3 of the staged-row class are resolved in-flight).
- Tier 12/15: `spec`@A and `docs`@B match `CORPUS.md:96-97`; tier C is not sole support.
- No duplicate ground: `MERGE-REPORT.json` entries[22] `collides_with_existing:false`, `has_duplicate:false`; no lane csrf note.
- Documented-not-measured labelling already present ("Documented upstream, not measured here"); quote lengths ≤25 words measured.
- C2's before→after is measurable as declared: baseline `^source: S10[23] ` count 0 → 1 after the note lands.

## Criteria a documented-tier entry can never satisfy — and why that is acceptable here
- 22, 26, 30, 35, 36, 37 (measurement binding, run receipts, producer digests, self-test receipts): nothing is executed; the entry claims no run.
- 25, 40, 41, 42 (counter-owned probes, download predicates, signal-abort sets, revision-shape refusals): no carrier.
- 17–21, 23–24, 27, 44–60: runtime/gate/registry classes with no object in a documentary note.
- 2's "measured anchor" degrades to URL + § + fetched digest. Acceptable only because C2 is documented-upstream, its metric counts a row citation, and no axis is promoted. It stops being acceptable if the note's observability sentence is cited as measured evidence for a journey receipt — so F6's label must land before admission.

## Residual risk and verification gaps
- Round-22 base rate: 37 of 38 staged rows' quotes were absent from re-fetched sources (`corpus/README.md:531-536`). The landed rows claim re-fetch, but I did not fetch (forbidden by my item); quote presence and word-exactness for the six spans remain unverified by me.
- Not verified: the draft's "strict mode" wording; whether the staged six-span text survives normalisation against the fetched 146,976-byte and 157,809-byte bodies.
- No gate was run; no tracked file was written by this seat; nothing installed.
