# W2ScoutEntry — internal-consistency audit of the adopted CSRF entry (round 23, wave 2)

Seat L1Tabi23.W2ScoutEntry. Audited `corpus/knowledge/csrf-defense-shape-boundary.md`, 142 lines, 9135 B, sha256 `2915dfc3f0f7c2764e66cef667ab2dd63e5bf55ce8e940d2a11c2629ebde0ded`, mtime 2026-10-25 04:32:47 -0300. **The file was edited twice during this audit** (an ~04:28 revision, then `28cb1bbd…` at 04:29:57, then this one); the §1 locator defect I first recorded was fixed at 04:32:47. Findings pin `2915dfc3…`; a later edit voids the pin, not the source-byte facts.
Staged bytes: `/home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/corpus/knowledge/csrf-defense-boundary.md`, 37 lines, sha256 `3d709e7d94ec8ff8d55333ac16362c8bef6d3c80e396c36ac44047959803dfe5`.
Source bytes re-used read-only from `.ufo/waves/round-23/scratch/SrcS102/rfc6265bis-13.txt` (sha `06223931…d85fbf`) and `SrcS103/owasp-csrf.html` (sha `6f32bfbf…872312`) — both equal the entry's front-matter digests. No fetch, no git/jj write, no tracked-file edit, no tool install.

## Verdict

**FAIL — 3 blocking contradictions, 5 secondary mismatches.** E1/E2/E3 each match the staged bytes and every span the entry quotes is verbatim in the fetched bytes; the entry's own closure sentences and one SOURCES-row/quote pair fail.

## Asked checks

| check | result |
|---|---|
| every quoted span introduced by a section the SOURCES row names | **FAIL** — §3:75 quotes §Limitations of SameSite; the S103 row (:4) names only §Employing Custom Request Headers and §Dealing with Client-Side CSRF |
| every table row's inference labelled | **PASS, caveat** — :50-51 tag `[INFERENCE]` inline, :52 does not; :61-65 labels the column in prose and its "except the round-8 fixture" clause is F1 |
| "not measured here" block vs §4 | **PASS for §4** (:99-109 is prescriptive); **FAIL vs :9 / :65 / :129**, which assert a capture |
| E1/E2/E3 match the staged bytes | **PASS** — span-by-span, see Verified |

## Blocking

1. **Blanket "nothing observed" against an asserted capture** — :9 "Nothing in this entry was run, captured or observed in a browser" vs :65 "Nothing in this table was captured **except** the round-8 fixture instance named in §6" and :129 "That is one captured instance of the token-shaped row"; one of the two must go. `sed -n '9p;65p;129p' corpus/knowledge/csrf-defense-shape-boundary.md`
2. **A quoted span outside its SOURCES row** — :75-78 quotes §"Limitations of SameSite"; :4 names two other sections. The span is genuine and correctly placed (txt :371, heading :365, next heading :372), so the locator ledger is the defect, not the quote. `sed -n '4p;74,78p' corpus/knowledge/csrf-defense-shape-boundary.md; sed -n '365p;371p' .ufo/waves/round-23/scratch/SrcS103/owasp-csrf.txt`
3. **§5 closure contradicts E1** — :118 "None of the three is a fabrication: every quoted span is present in the fetched bytes", while E1 (:106-109) records a quoted span that is absent (0 hits) and prints it in quotation marks. Scope the sentence to the spans the entry now carries. `grep -c 'offers a robust defense' .ufo/waves/round-23/scratch/SrcS102/rfc6265bis-13.txt; sed -n '106,109p;118p' corpus/knowledge/csrf-defense-shape-boundary.md`

## Secondary

4. **Errata undercounts** — :101 "Three defects", but a fourth staged defect is fixed silently: staged :18 quotes `"it is, however…"` (lowercase `i`) where the draft has sentence-initial `It is,` (:2816), and the entry quotes `It is,` at :29; `.ufo/waves/round-23/w1/SrcS102.md` logged it as a separate quote defect. `sed -n '18p' /home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/corpus/knowledge/csrf-defense-boundary.md; sed -n '29p' corpus/knowledge/csrf-defense-shape-boundary.md`
5. **Wrong round on the cited evidence** — :125 calls it "round-8"; the artefacts it names live in round 9's archive (`corpus/evidence/w9-tabi-b91/`, lane B9-1). The fixture is round 8, the capture round 9. `sed -n '1p' corpus/knowledge/state-changing-matrix-r9.md; sed -n '125,129p' corpus/knowledge/csrf-defense-shape-boundary.md`
6. **The named artefact does not carry the claim** — :127-128 says a hidden `token` input "whose value also appeared in the captured POST", but the cited `facts.json` records only `tokenShape = {"len":16,"cls":"lower-hex"}` (shape-only: no values, no co-occurrence). The co-occurrence is in `stateful-fixture-evidence.md:277-281,516` (body `token=<16 hex>&note=cell%3Dpost-form`), uncited. The `submit-refused` / `reason: token-consumed` ledger entry (:128) does exist (`ledger-after.json` seq 9). `grep -n 'tokenShape' corpus/evidence/w9-tabi-b91/runs/replay-consumed-post/rep1/facts.json; sed -n '516p' corpus/knowledge/stateful-fixture-evidence.md`
7. **PROVINCE.md does not say what :13 and :19 attribute to it** — :13 cites it for the bounded-runs rule, :19 for "keeps this lane to provenance and records no security verdict"; the 21-line file has 0 hits for `third-party|provenance|verdict|bounded`. The rule is `corpus/README.md:38`, the classes `interaction-approval-table.md:58-62`; PROVINCE.md:17-21 says only "Never performs consequential actions on external sites". claims.json's C2 revision agrees PROVINCE.md "carries no CSRF line". `grep -c 'third-party\|provenance\|verdict\|bounded' PROVINCE.md`
8. **§2 row 3 carries an untagged, locator-less mechanism claim** — :52 "the 'cannot set' half is the preflight rule" resolves to §Custom Headers and CORS (txt :305), unnamed at :4; the `[INFERENCE]` convention moved into prose (:61-64) after being inline for :50-51. `sed -n '50,52p;61,65p' corpus/knowledge/csrf-defense-shape-boundary.md; sed -n '305p' .ufo/waves/round-23/scratch/SrcS103/owasp-csrf.txt`

## Verified correct (do not re-file)

- E1 exact: staged "offers" absent (0 hits), draft "offer" present (1). E2 exact: staged §"Common CSRF weaknesses and protection mechanisms" has 0 occurrences in the sheet and 0 of 34 h1–h4 headings match (h1..h5 = 39, so the denominator implies an unstated h5 exclusion); custom-header sentence under §Employing… (txt :292, heading :291), JavaScript sentence under §Dealing with Client-Side… (txt :316, heading :314). E3 exact: staged :26-27 joins the two sentences into a 28-word quote; the cap is real (`scripts/check-adjacency.mjs:184 MAX_QUOTE_WORDS = 25`).
- All seven spans the entry quotes are verbatim, 1 hit each, ≤21 words: draft 2815-2816 / 2816-2818 / 2822-2824 and the sheet's four. The custom-header span exists only in the HTML — the `.txt` extraction drops it (0 hits even whitespace-normalised), so a verifier grepping the txt would false-negative; the row hashes the HTML.
- §1:24 now reads "lines 2815–2828; the quoted spans sit at 2815–2824" — correct, consistent with registry row S102 ("lines 2815-2824"); the "same paragraph" error is gone (fixed at 04:32:47).
- `multi-step-journey.md` §2 and §6 is the right locator for `typed`/`link`/`form_submit` (§4 is the determinism boundary). `QUALITY.md` 1–10 and 61–63 exist; rule 3 is the separation the table relies on.

## Unknowns / outside the entry

- S103's `last-modified 2026-10-25T06:56:47Z` is uncheckable: body only was retained, no headers.
- C2 not yet observable: `git grep -lE '^source: S10[23] ' HEAD -- corpus/knowledge | wc -l` → 0; the entry is untracked (`??`) and `corpus/SOURCES.md` is modified (` M`). claims.json now carries a `revisions` block (5 entries, appearing after my first read) whose C2 revision already concedes the staging citation layer fails — the same three defects E1–E3 document.
