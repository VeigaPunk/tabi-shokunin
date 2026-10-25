# RevSourcesS107 — SOURCES.md row S107 vs census contract (round-27 W1, hyaku run 7)

Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin. HEAD reviewed: `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0`
(`git rev-parse HEAD`). Assignment baseline f185b4e7… is pre-C3; C3 registry row landed in `6ca3b89`
(`git log --oneline -3 -- corpus/SOURCES.md`). LSP device unavailable in this session; all checks below are
byte-level reads, git read-only subcommands, and one node sweep — grep used as literal fallback by necessity,
recorded per the role note.

## Verdict

**PASS with advisories.** The appended S107 row (corpus/SOURCES.md:121) satisfies every checked census axis
(a)–(e) on the worktree bytes, and every locator/claim in its anchor and teaches cells was re-located and found
true against the retained committed RFC 9110 bytes. One MEDIUM process finding (F1): the row was mutated in the
working tree **during this review window**, so the committed row the landed census certified (v1) differs from
the worktree row I reviewed (v2); the L1 must re-run the registry gate on whichever bytes get committed.

## Checks (a)–(e)

Sweep tool: `.ufo/waves/round-27/scratch/RevSourcesS107/sweep.mjs` (read-only, run via `node … corpus/SOURCES.md`).
Reviewed bytes frozen: worktree file sha256 `e7e32abacda4e0d3bfecef1adcfd2614240df8cc5dcf74257edbb114748f9403`,
line 121 sha256 `f85f36923aef28e32dab39098be8121c7d340ac5e75b9e869c911123aaeaa8bc` (stable across 3 checks).

- **(a) Structure/enums — PASS.** S107 row splits into 13 parts = 11 cells (`sweep.mjs` → `parts: 13`;
  sweep over all rows: `badPartsCount: []`, `totalRows: 107`). kind=`spec` ∈ kinds set, tier=`A` ∈ ['A','B','C'],
  status=`mined` ∈ statuses (`scripts/check-sources.mjs:26-28`, checks at :318-320). opened=`2026-10-25` = review
  date (past/present), calendar-validated by `isIsoDate` (`scripts/check-sources.mjs:93-103`). recheck=`730d`
  matches `/^[0-9]+d$/` (:322). used-by = exactly one path `corpus/knowledge/redirect-and-retry-after-semantics.md`;
  file exists in worktree (glob) and at HEAD (`git grep -lE '^source: S107 ' HEAD -- corpus/knowledge | wc -l` → 1),
  and the entry cites the row id (`grep -c 'S107' corpus/knowledge/redirect-and-retry-after-semantics.md` → 1),
  satisfying the gate's cited check (`check-sources.mjs:230-244`).
- **(b) Anchor quoted spans — PASS (with convention caveat, F3).** The row contains zero verbatim quoted spans;
  the only backticked token is `` `Retry-After` `` in the scope cell — the header's proper name, not a source
  excerpt. Under any reading every candidate span is ≤25 words, e.g. "MUST NOT change the request method"
  (rfc9110.txt:7494, 6 words). Anchors without quotes have precedent (S101 anchor, SOURCES.md:115). Convention
  doc named in the assignment (CORPUS.md) does not exist — see F3; I applied the registry's own stated rule
  (SOURCES.md header: "≤25-word quote with location, and raw-fetch sha256") and SKILL.md:33 ("Every claim:
  measured anchor (path:line, command output, evidence id)").
- **(c) Pipes in cells — PASS.** No literal `|` and no escaped `\|` inside any S107 cell; registry-wide sweep:
  `escapedPipeRows: []`, S107 `cellWithEscapedPipe: false`, `cellWithLiteralPipe: false`.
- **(d) Shape fidelity vs S105/S106 — PASS.** Same 11-column order, same kind/tier/status vocabulary, single-path
  used-by, same anchor style (fetch metadata + byte count + sha256 + line pointers) as S105/S119-120 rows.
  Only divergence: recheck=`730d` vs neighbors' `on-release` — both gate-valid forms (:322); S105/S106 anchors
  likewise pair sha256+line pointers (SOURCES.md:119-120).
- **(e) E04 duplicate URL(+scope) — PASS.** `grep -o 'https://www.rfc-editor.org/rfc/rfc9110.txt' corpus/SOURCES.md | wc -l`
  → 1: unique in the registry. The gate's test is URL-normalized with a `supersedes S###` exemption
  (`check-sources.mjs:287-293`); the sweep found 18 URL-sharing groups, every non-first member flagged
  `supersedes: true`, none involving S107. Ids are contiguous S001–S107, count 107 (py check) — the refused
  staged rows S125/S142 are not landed. No other row scopes RFC 9110, so the stricter URL+scope reading also passes.

## Re-grounding: bytes and every locator re-located

Retained committed bytes `.ufo/waves/round-27/assimilation/rfc9110.txt`:
`wc -c` → 502941; `sha256sum` → `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`; committed at
HEAD (`git ls-tree HEAD -- …rfc9110.txt` → blob `19a88abc`). Independent re-fetch
(`curl -sSL -o scratch/RevSourcesS107/rfc9110-refetch.txt https://www.rfc-editor.org/rfc/rfc9110.txt`):
**HTTP 200, 502941 bytes, sha256 `21c1cdce…f47232a` — byte-identical.**

Anchor locators verified against those bytes (`read` ranges + `grep -n` on the file):

| Anchor claim | Verified |
|---|---|
| §15.4 historical note at 7260-7264: 307/308 "unambiguously indicate method-preserving redirects" | ✓ spans 7260-7264 |
| §15.4.4 303 at lines 7413-7414 | ✓ heading 7411, sentence 7413-7414 |
| GET-or-HEAD at 7416-7418 | ✓ "a GET or HEAD request" 7417 |
| §15.4.2 note 7384-7387 / §15.4.3 note 7406-7409 | ✓ both "MAY change the request method from POST to GET" (7384-7385, 7406-7407) |
| §15.4.8 307 MUST-NOT at 7493-7495 | ✓ "MUST NOT change the request method" 7494 |
| §15.4.9 308 at 7507-7523, no status-specific MUST-NOT clause | ✓ body 7507-7522 has only SHOULD/MAY |
| §15.4 rewrite step 4 at 7306-7307 | ✓ `grep -n '^   4\.  Change the request method'` → 7306 |
| §10.2.3 Retry-After at 4805-4813 | partial — see F2 |

Teaches clauses all confirmed: 301/302 MAY rewrite (notes + step 4), 307 MUST NOT (7494), 303 GET/HEAD (7417),
308 history-only vs §15.4.9 silence (7260-7264 vs 7507-7522), Retry-After with any 3xx (4805-4807) and 503
(4803-4804). C3 counting command re-run independently: `git grep -lE '^source: S107 ' HEAD -- corpus/knowledge | wc -l`
→ 1.

## Findings by severity

- **F1 MEDIUM (process/integrity) — reviewed row mutated mid-review; committed ≠ worktree.** My first read of
  SOURCES.md returned the committed v1 of line 121; reads minutes later returned a modified v2. `py difflib`
  HEAD-vs-worktree: exactly 1 hunk, line 121 only (both files 170 lines). Committed row sha256 (line 121):
  `adc6abe7eb0970ccee915b97a5bafd1bed9a5a89c5e33c4d1eeeff910b327570`; worktree: `f85f3692…aa8bc`; whole-file:
  HEAD `30cd6a49…` vs worktree `e7e32abа…` (command chain in appendix). The landed census certified v1 at the
  tip; v2 is uncommitted at review close. Author and mechanism unobserved. Action for L1: commit deliberately,
  then re-run `node scripts/check-sources.mjs` (my sweep predicts clean on v2: 13 parts, enums, ISO date,
  used-by present+cited) and re-hash any receipt quoting the row.
- **F2 LOW (locator nit).** Anchor cites "§10.2.3 Retry-After at 4805-4813"; the 503 sentence backing the
  teaches clause "Retry-After may accompany any 3xx and 503" sits at 4803-4804, outside the cited span (section
  heading at 4799; the 3xx clause itself is exactly 4805-4807). Semantic content is correct; the span should
  read 4801-4807 (or cite the section).
- **F3 INFO (assignment pointer unresolved).** No `CORPUS.md` exists in the lane (glob `**/CORPUS.md`,
  gitignore-off/hidden → none) nor in /home/vgpnk/Projects/shokuknow (read-only glob → none). The lane's
  `.ufo/waves/kaika/` (fleet-ledger SOURCES-CONTRACT-v1.md per SOURCES.md header) is absent too
  (`glob …/.ufo/waves/kaika/**` → path not found). Fleet repo untouched per bounds. Convention applied from
  SOURCES.md header + SKILL.md:33 as the in-repo authority.
- **F4 INFO (v1→v2 delta, all three upgrades verified true).** Scope: "The normative redirect semantics a
  journey driver observes" → "Documented redirect semantics a journey driver may observe". Anchor: +§15.4
  history-note locator (verified, 7260-7264); "at line 7413" → "at lines 7413-7414" (more precise);
  "(no MUST-NOT clause" → "(no status-specific MUST-NOT clause" (more precise — SHOULD/MAY do appear in
  §15.4.9). Teaches: "308's preservation is an inference in this text;" → "RFC 9110's history note describes
  308 as method-preserving but §15.4.9 does not restate the rule normatively" (matches bytes exactly). v2 is a
  strict accuracy improvement; v1 had no contract violation (its locators were within tolerance).

## Residual risk and verification gaps

- Mutation author/time of F1 unobserved (ordering evidence only: two read snapshots + frozen hashes).
- I did not run lane gates (`check-sources.mjs`) per contract — L1 runs them; structural outcome predicted from
  my replica sweep, not from the gate binary.
- Fleet-ledger SOURCES-CONTRACT-v1.md unobtainable within bounds; the ≤25-word convention could not be checked
  against its canonical text (F3).
- `normalizeUrl` equivalence in my sweep replicates `check-sources.mjs:186-193`; replica divergence risk is
  nil for S107 (URL appears exactly once raw), nonzero in principle for other rows — immaterial here.
- No tools installed (none needed) — recorded per operator 2026-10-19 rule; pacman untouched per guard.

## Evidence appendix (commands)

- `git -C <lane> rev-parse HEAD` → 5ed6484da66e6bf73654281d2e9ba3703f0c2ef0
- `git -C <lane> show HEAD:corpus/SOURCES.md | sha256sum` → 30cd6a49e518065cf7600eff4b8f794a4b6e7a1608a4aed6daf6d6ccc3860bc3
- `sha256sum <lane>/corpus/SOURCES.md` → e7e32abacda4e0d3bfecef1adcfd2614240df8cc5dcf74257edbb114748f9403 (×3 stable)
- `git -C <lane> show HEAD:corpus/SOURCES.md | sed -n '121p' | sha256sum` → adc6abe7…; `sed -n '121p' <lane>/corpus/SOURCES.md | sha256sum` → f85f3692…
- `node <scratch>/RevSourcesS107/sweep.mjs <lane>/corpus/SOURCES.md` → JSON quoted above
- `wc -c` / `sha256sum` on `.ufo/waves/round-27/assimilation/rfc9110.txt` → 502941 / 21c1cdce…
- `git -C <lane> ls-tree HEAD -- .ufo/waves/round-27/assimilation/rfc9110.txt` → blob 19a88abc…
- `curl -sSL -w 'HTTP %{http_code} bytes %{size_download}\n' -o <scratch>/rfc9110-refetch.txt https://www.rfc-editor.org/rfc/rfc9110.txt` → HTTP 200 bytes 502941, sha256 21c1cdce… (identical)
- `git -C <lane> grep -lE '^source: S107 ' HEAD -- corpus/knowledge | wc -l` → 1
- `grep -c 'S107' <lane>/corpus/knowledge/redirect-and-retry-after-semantics.md` → 1
- `grep -o 'https://www.rfc-editor.org/rfc/rfc9110.txt' <lane>/corpus/SOURCES.md | wc -l` → 1
- py difflib HEAD-vs-worktree: 1 hunk (`@@ -121 +121 @@`); id contiguity S001–S107: True, count 107
