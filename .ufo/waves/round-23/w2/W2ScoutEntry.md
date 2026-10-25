# W2ScoutEntry — internal-consistency audit of the staged-ground entry (round 23, wave 2)

Seat: L1Tabi23.W2ScoutEntry. Lane root `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Audited bytes: `corpus/knowledge/csrf-defense-shape-boundary.md`, 141 lines, 8978 B,
sha256 `28cb1bbd01278bc7bfa395ed0c82c33d33264bfe11b91d22784f9c46f0b79f0e`, mtime 2026-10-25 04:29:57 -0300.
**The file changed mid-audit** (an earlier read, ~04:28, was a shorter revision; §2, §3, §6 and the
PROVINCE citation differ). Every finding below is pinned to the digest above.
Staged bytes: `/home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/corpus/knowledge/csrf-defense-boundary.md`,
37 lines, 2351 B, sha256 `3d709e7d94ec8ff8d55333ac16362c8bef6d3c80e396c36ac44047959803dfe5`.
Sources re-used read-only from `.ufo/waves/round-23/scratch/SrcS102/rfc6265bis-13.txt`
(sha `06223931…d85fbf`, 146976 B) and `SrcS103/owasp-csrf.html` (sha `6f32bfbf…872312`, 157809 B):
both digests equal the entry's front matter. No fetch, no git/jj write, no tracked-file edit.

## Verdict

**FAIL — 3 blocking internal contradictions, 6 secondary mismatches.** The three errata claims
(E1/E2/E3) themselves match the staged bytes; what fails is the entry's own closure sentences and
one SOURCES-row/quote pair.

## The four asked checks

| # | check | result |
|---|---|---|
| a | every quoted span introduced by a section the SOURCES row names | **FAIL** — §3:74 quotes §Limitations of SameSite; the S103 row (:4) names only §Employing Custom Request Headers and §Dealing with Client-Side CSRF |
| b | every table row's inference labelled | **PASS with caveat** — rows :50-51 carry inline `[INFERENCE]`; :52 does not, and its Note makes a mechanism claim whose section (§Custom Headers and CORS) is also absent from :4. The blanket paragraph at :61-64 does label the column |
| c | "not measured here" block does not contradict §4 | **PASS for §4** (§4:86-97 is prescriptive); **FAIL against §2:64 and §6:124-127**, which claim a captured instance |
| d | E1/E2/E3 each match the staged bytes | **PASS** — verified span-by-span below |

## Findings (blocking)

1. **Blanket "nothing observed" vs a claimed capture.** :9 "Nothing in this entry was run, captured
   or observed in a browser" contradicts :64 "Nothing in this table was captured **except** the
   round-8 fixture instance named in §6" and :124-127 "That is one captured instance of the
   token-shaped row". One of the two sentences must go; §4's `none-observed` default survives either way.
   `sed -n '9p;64p;124,127p' corpus/knowledge/csrf-defense-shape-boundary.md`
2. **§3 quotes a section its SOURCES row does not name.** :74-76 attributes the span to
   §"Limitations of SameSite"; the row at :4 lists two other sections. The span is real and sits in
   that section (txt :371, under the heading at :365, before :372) — the locator ledger is the defect.
   `sed -n '4p;74,76p' corpus/knowledge/csrf-defense-shape-boundary.md; sed -n '365p;371p' .ufo/waves/round-23/scratch/SrcS103/owasp-csrf.txt`
3. **§5's closure contradicts E1.** :117 "None of the three is a fabrication: every quoted span is
   present in the fetched bytes" — E1 (:105-108) records a quoted span that is *absent*
   (`grep -c 'offers a robust defense'` → 0), and the entry prints that span in quotation marks while
   stating it. Scope the sentence to the spans the entry now carries.
   `grep -c 'offers a robust defense' .ufo/waves/round-23/scratch/SrcS102/rfc6265bis-13.txt; sed -n '105,108p;117p' corpus/knowledge/csrf-defense-shape-boundary.md`

## Findings (secondary)

4. **Errata count is not closed.** :100 says "Three defects", but a fourth staged defect is corrected
   silently: staged :18 quotes `"it is, however, prudent…"` (lowercase `i`) where the draft has
   sentence-initial `It is,` (:2816); the entry quotes `It is,` at :29. `.ufo/waves/round-23/w1/SrcS102.md`
   recorded this as a distinct quote defect ("Quote 2 also lowercases a sentence-initial capital").
   `sed -n '18p' /home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/corpus/knowledge/csrf-defense-boundary.md; sed -n '29p' corpus/knowledge/csrf-defense-shape-boundary.md`
5. **§1 locator is wrong and disagrees with the registry.** :24 says "lines 2815–2828"; the quoted spans
   are 2815–2816, 2816–2818, 2822–2824, and 2826–2828 is a third paragraph never quoted. :23's "in the
   same paragraph" is false for quote 3 (a separate paragraph, 2821–2824). Registry row S102 says
   "lines 2815-2824".
   `sed -n '2813,2828p' .ufo/waves/round-23/scratch/SrcS102/rfc6265bis-13.txt; sed -n '116p' corpus/SOURCES.md`
6. **Wrong round on the cited evidence.** :124 calls the fixture "round-8"; the artefacts it names live
   in round 9's archive (`corpus/evidence/w9-tabi-b91/`, lane B9-1).
   `sed -n '1p' corpus/knowledge/state-changing-matrix-r9.md; ls corpus/evidence/w9-tabi-b91`
7. **The named artefact does not carry the claim.** :125 says a hidden `token` input "whose value also
   appeared in the captured POST"; the cited `facts.json` records only `tokenShape = {"len":16,"cls":"lower-hex"}`
   (shape-only). The co-occurrence is documented in `stateful-fixture-evidence.md:277-281,516`
   (body `token=<16 hex>&note=cell%3Dpost-form`), which §6 does not cite. The `submit-refused` /
   `reason: token-consumed` ledger entry (:126-127) **does** exist (`ledger-after.json` seq 9).
   `sed -n '516p' corpus/knowledge/stateful-fixture-evidence.md; grep -n 'tokenShape' corpus/evidence/w9-tabi-b91/runs/replay-consumed-post/rep1/facts.json`
8. **PROVINCE.md does not say what §1 and the header attribute to it.** :13 and :19 cite it for the
   bounded-runs rule and for "provenance … no security verdict"; the 21-line file contains none of
   `third-party|provenance|verdict|bounded`. The rule is at `corpus/README.md:38`, the classes at
   `corpus/knowledge/interaction-approval-table.md:58-62`; PROVINCE.md:17-21 does say "Never performs
   consequential actions on external sites" / "Out of province → report, never absorb".
   `grep -c 'third-party\|provenance\|verdict\|bounded' PROVINCE.md`
9. **§2 row 3's Note is locator-less and untagged.** :52's "the 'cannot set' half is the preflight rule"
   resolves to §Custom Headers and CORS (txt :305), unnamed at :4; the tagging convention moved into
   prose (:61-63) after being inline for :50-51.
   `sed -n '50,52p;61,64p' corpus/knowledge/csrf-defense-shape-boundary.md; sed -n '305p' .ufo/waves/round-23/scratch/SrcS103/owasp-csrf.txt`

## Verified correct (do not re-file)

- E1: staged :18 `"offers a robust defense"`; draft has `offer` (1 hit) and 0 hits for `offers` — E1 states it exactly.
- E2: staged :4 cites §"Common CSRF weaknesses and protection mechanisms"; 0 occurrences in the sheet and
  0 of 34 h1–h4 headings match (34 reproduces as h1..h4 only; 39 including h5). The custom-header
  sentence is under §Employing… (txt :292, heading :291); the JavaScript sentence under §Dealing with
  Client-Side… (txt :316, heading :314). E2 matches staged.
- E3: staged :26-27 joins the two sentences into one 28-word quote (counted); the cap is real
  (`scripts/check-adjacency.mjs:184 MAX_QUOTE_WORDS = 25`). E3 matches staged.
- Every span the entry now quotes is verbatim in the fetched bytes: draft 2815-2816 / 2816-2818 / 2822-2824;
  sheet custom-header (HTML only — the `.txt` extraction drops it: 0 hits even whitespace-normalised),
  "No token is needed…", the JS span, the §Limitations span. All quoted spans are ≤21 words.
- `multi-step-journey.md` §2 and §6 is the **right** locator for `typed`/`link`/`form_submit` (§4 is the
  determinism boundary). `QUALITY.md` rules 1–10 and 61–63 exist; rule 3 is the observation/inference
  separation the table relies on.

## Unknowns

- S103's `last-modified 2026-10-25T06:56:47Z` cannot be checked: only the body was retained, no headers.
- Whether the 04:29:57 edit is the author's final bytes or an intermediate; a later edit invalidates the
  digest pin, not the source-byte findings.
- C2 is not yet observable: `git grep -lE '^source: S10[23] ' HEAD -- corpus/knowledge | wc -l` → 0;
  the entry is untracked (`??`) and `corpus/SOURCES.md` is modified (` M`). Also, `claims.json` carries
  no `revisions` block (`grep -n revisions claims.json` → exit 1), so the post-freeze corrections the
  brief points at are not in that file.

No tool installed or upgraded this seat.
