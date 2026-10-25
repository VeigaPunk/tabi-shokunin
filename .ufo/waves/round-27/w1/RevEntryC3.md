# RevEntryC3 — entry review: corpus/knowledge/redirect-and-retry-after-semantics.md

- Reviewer: RevEntryC3-2 (wave 1, round 27; read-only)
- Reviewed artifact: `corpus/knowledge/redirect-and-retry-after-semantics.md`, tracked at commit `6ca3b89ad2a7b480984859834b3d28f1e75a9a26` ("round-27 C3 (coverage): assimilate redirect/Retry-After theme — entry + registry row S107, re-grounded on fresh RFC 9110 bytes"); file present at tip `5ed6484da66e6bf73654281d2e9ba3703f0c2ef0` (`git ls-files --error-unmatch` OK).
- Ground bytes: `.ufo/waves/round-27/assimilation/rfc9110.txt` — `wc -c` = 502941 B; `sha256sum` = `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a` (matches entry line 3 and S107 row).

## (a) In-province — YES
PROVINCE.md domain is "browser & web-interaction craft (旅, journey)" — driving real browsers against real sites; the entry is documented-upstream vocabulary for redirect/Retry-After semantics a journey driver meets, explicitly kept spec-ground ("Documented upstream, not measured here"; README row: "Nothing in it was run, captured or observed in a browser"). No refused surface (forensics/publishing/secrets) is touched. In-province: knowledge supporting the journey driver, not a different lane's claim.

## (b) Front-matter trio + ground line — present and consistent with S107 row
- Trio present: `verified-at: 2026-10-25` (line 4), `recheck: 730d` (line 5), `ground: documented-upstream redirect semantics ...` (line 6).
- Source line (3) matches `corpus/SOURCES.md` row S107 (line 121): same URL `https://www.rfc-editor.org/rfc/rfc9110.txt`, same fetch metadata (2026-10-25, 502941 B, sha256 `21c1cdce…`), same cited sections (§15.4, §15.4.2-15.4.4, §15.4.8-15.4.9, §10.2.3), same scope bound ("bound to the sections cited, not the whole spec"). Row's anchor evidence (7413, 7416-7418, 7384-7387, 7406-7409, 7493-7495, 7507-7523, 7306-7307, 4805-4813) matches entry quotes. Row recheck `730d` matches `recheck` line (staged "errata only" prose stripped per LOG round-27 gate note).

## (c) Located quotes — verified against fresh bytes (sample = all eight quoted spans)
| Entry quote | Claimed cite | Bytes observed (read/grep) | OK |
|---|---|---|---|
| 303 "indicates that the server is redirecting the user agent to a different resource" | §15.4.4, 7413-7414 | 7413-7414 | ✓ |
| "can perform a retrieval request targeting that URI (a GET or HEAD request if using HTTP)" | 7416-7418 | 7416-7418 | ✓ |
| "Applicable to any HTTP method" | line 7423 | 7423: "This status code is applicable to any HTTP method." | ✓ |
| "For historical reasons... MAY change the request method from POST to GET ... the 308 (Permanent Redirect) status code can be used instead." | §15.4.2 note, 7384-7387 | 7384-7387 exact | ✓ |
| identical note pointing at 307 | §15.4.3, 7406-7409 | 7406-7409 exact | ✓ |
| "the user agent MUST NOT change the request method if it performs an automatic redirection" | §15.4.8, 7493-7495 | 7493-7495; MUST-NOT at 7494 | ✓ |
| "to unambiguously indicate method-preserving redirects" (history note) | §15.4, 7260-7264 | 7262-7263 within 7260-7264 | ✓ |
| Retry-After "minimum time... before issuing the redirected request" | §10.2.3, 4805-4807 | 4805-4807 exact; 503 at 4803-4804; value form at 4809-4813 | ✓ |
| "Change the request method according to the redirecting status code's semantics, if applicable" | §15.4 rewrite step 4 (no line cite in entry) | located at 7306-7307 (quote exact; S107 row cites 7306-7307) | ✓ (minor, below) |

Extra checks: §15.4 spans 7230-7531 (heading at 7230, §15.4.1 at 7322, §15.5 at 7532); a sweep of `MUST NOT` in lines 7260-7800 returns exactly one hit, line 7494 — so the entry's "the only MUST-NOT in the redirect sections is 307's at line 7494" holds within and beyond §15.4.

## (d) 308 INFERENCE — honestly labeled and bounded
The entry says "**INFERENCE, not a located normative sentence**: the preserving interpretation is supported by that history note, while the status-specific clause remains an open re-anchor" (lines 38-41), repeats it in the Unknowns block, and the README row restates it ("the clause lives in RFC 7538, not in the fetched RFC 9110 bytes"). It does not present 308 preservation as a normative quote; the absence of a MUST-NOT inside §15.4.9 (7507-7523) is accurately observed. Labeling is honest and the claim is bounded to the inference it actually is.

## (e) Junk-entry test (frozen C3 control) — PASS
The entry carries real, non-fakeable content: per-status normative-vs-Note distinctions (301/302 rewrite lives in a *Note*, not the normative body), line-pinned quotes, the 308 inference treatment, explicit unknown/runtime separation, and a "Why this matters" section tying the vocabulary to the lane's own measured loopback 303/307 observations. A `source: S107` filler (quote paste without analysis) could not produce the note-vs-normative reading or the inference bound.

## (f) Verdict — ADMIT
All six checks pass. The entry is in-province, grounded on the fresh registered RFC 9110 bytes, quotes located, inference honest, and substantive.

## Findings
- **Minor (cosmetic):** entry line 18 is a duplicated orphan fragment `  (line 7423).` left from an earlier line (lines 17-18 both end with "(line 7423)."). No semantic impact; worth a cleanup edit.
- **Minor (traceability):** the §15.4 rewrite-step-4 quote (7306-7307) lacks an inline line citation in the entry (the S107 row has it). Quote verified present; the missing line ref is a small deviation from the entry's "anchored" claim, not a mislocation.
- No blocking or major findings.

## Residual risk / verification gaps
- Fleet-side census (`sources-census.sh validate`) not re-run by this seat (read-only contract; L1 runs lane gates once after integration). Row S107 shape was confirmed by direct read of `corpus/SOURCES.md:121` only.
- No independent re-fetch of rfc9110.txt performed; local bytes re-derived: size + sha256 match the recorded fetch (consistent with QUALITY criterion 39 — digest re-derived from retained bytes).
- "Real-site journeys remain untested by rule" (entry's Why-it-matters) is a statement about lane state, not verified by this seat; it is clearly labeled as absence of measurement.
