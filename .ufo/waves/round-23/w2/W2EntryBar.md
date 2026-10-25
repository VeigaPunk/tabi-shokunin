# W2EntryBar — `corpus/knowledge/csrf-defense-shape-boundary.md` vs QUALITY 1–10, 61–63

**Verdict: FAIL as written — 2 blocking (F1, F2), 4 medium (F3–F6), 1 low (F7).** Reviewed bytes:
commit `03c1b4d`, blob `cf0d02bfa9168a7b17ce522d3f3b9e05a17db7d2` = `git hash-object` of the
worktree file (entry was `??` when this seat started; the landing commit arrived mid-review; the
claims.json "revisions" block was read, including the `"0 of 34 headings"` carry-over F3 attacks.
**Post-review worktree state, not certified here:** the file now differs from `cf0d02b`
(worktree blob `19a557c`, sha256 `f0342cb8…e044a`) — an in-flight author repair that rewrites
`:78` (F2) and `:120` (F1); its new anchor `corpus/evidence/w9-tabi-b91/runs/replay-consumed-post/rep1/facts.json` exists, is tracked at HEAD and contains `tokenShape`, but the repaired text's semantics are outside this review's bound bytes.

- **F1 (blocking, crit. 2 — false observation claim) — :120.** "the loopback POST form already
  captured (round 6–8) had no token field" contradicts the lane's committed bytes: round 8 mints a
  one-time token per `/form` render and `POST /submit` consumes it. Cmd:
  `grep -nE 'token|form' corpus/knowledge/stateful-fixture-evidence.md` → `:64,:103,:104`;
  `sed -n '17p;70p;92,99p' corpus/knowledge/state-changing-matrix-r9.md`. The claim cites no anchor.
- **F2 (blocking, crit. 2 + 3) — :78.** Witness mislocated *and* capability overclaimed:
  `grep -nE '^## ' corpus/knowledge/multi-step-journey.md` → `§4` = "Determinism boundary" (`:171`);
  the witness is §2 (`:80-85`) and §6.1 (`:233-236`), and `:235` says "Record navigation history per
  step" — `transitionType` exists only for navigations, so a page-script `fetch` (the case §3 says
  SameSite misses) has no entry to classify. "available without a new capability" is unmarked inference.
- **F3 (medium, crit. 2) — :104.** "0 headings of 34 match" has no counting rule:
  `grep -oE '<h[1-6][^>]*>' .ufo/waves/round-23/scratch/SrcS103/owasp-csrf.html | wc -l` → **39**;
  levels 1–4 → **34** (h5 ×5). The same 34 is in claims.json, so an unstated rule propagates.
- **F4 (medium, crit. 2) — :110.** "this lane's ≤25-word Gate cap" names no gate, and no gate governs
  entry quotes: `grep -rn 'QUOTE_WORDS\|25 words' scripts/*.mjs` → only `check-adjacency.mjs:184`
  (`MAX_QUOTE_WORDS = 25`), applied at `:652` to `corpus/adjacency.tsv` fields;
  `grep -ciE 'quote|word' scripts/check-sources.mjs` → 0. The 28-word count itself is right.
- **F5 (medium, crit. 1) — :42.** "Three of them leave something a capture can hold" is false as a
  partition: the sheet's headings include "Fetch Metadata headers" and "Using Standard Headers to
  Verify Origin", both request-header observables (tag-stripped counts: `Sec-Fetch-Site` 11, `Origin`
  39, `Referer` 13). Intended sense "three token-shaped defences"; as written it is a count claim.
- **F6 (medium, crit. 2) — :100-101.** "Three defects … were corrected here" is a prose count without a
  command and undercounts its own wave-1 census: `w1/SrcDivergence.md` lists six must-cut/re-label
  items plus two row blockers (the dropped "shape on the wire … enumerable" and the absolute "never
  the whole defense" are cuts not among E1–E3).
- **F7 (low, anchor drift) — :23 vs SOURCES S102.** Entry says "lines 2815–2828", row says
  "lines 2815-2824"; the section body is 2815–2828
  (`awk 'NR>=2813&&NR<=2830' .ufo/waves/round-23/scratch/SrcS102/rfc6265bis-13.txt`), so the row
  truncates §8.8.1 while naming it; all three quoted spans sit inside both ranges.

## Verified clean

- S102: `sha256sum` = `062239316659673b9373865352e8ec5cb710c3d5fe66eedceacfaa6d34d85fbf`, 146976 B /
  3696 lines; headline quote verbatim with plural "offer"; `grep -c 'offers a robust defense'` → 0
  (E1 true); `grep -c 'not the extent of'` → 1 (front-matter recheck holds); third quote verbatim.
- S103: `sha256sum` = `6f32bfbf…4872312`, 157809 B; section map puts the custom-header sentence under
  "Employing Custom Request Headers for AJAX/API" and `circumventing the SameSite cookie policies`
  under "Dealing with Client-Side CSRF Attacks (IMPORTANT)", **not** under "Limitations of SameSite";
  "Common CSRF weaknesses and protection mechanisms" → 0; the three-sentence Limitations quote is
  verbatim.
- C2 at the delivered commit: `git grep -lE '^source: S10[23] ' HEAD -- corpus/knowledge` → the entry
  (1); at `a89f193` → 0; `git grep -cE '^\| S10[23] ' HEAD -- corpus/SOURCES.md` → 2.

## Criteria an entry of this class can never satisfy

6, 7, 8, 9, 10, 62, 63 (gate input pinning; wave aggregate in the round LOG; three-round reject
pinning; dispatch alias binding; per-round lesson admission; seat/round caps; landed-change LOG
binding) and the receipt half of 61. **Does it say so?** Partly: front matter "tier: documented
upstream, not measured in this lane" plus "**Nothing in this entry was run, captured or observed in
a browser**" is exactly 61's "the before arm cannot be run" wording, and the round commit carries
`LOG.md` (`git show --name-only --format= 03c1b4d | grep -c '^LOG.md'` → 1). It never states that the
round/gate criteria are inapplicable to an entry — silence, not declaration.

## Residual risk

- F1/F3 quote greps re-run only from untracked `scratch/SrcS102`, `scratch/SrcS103`; a reader with the
  commit alone cannot reproduce them.
- S103 `last-modified 2026-10-25T06:56:47Z` rests on `w1/SrcS103.md:14`; no GET was made here.
