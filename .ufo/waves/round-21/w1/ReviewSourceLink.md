# ReviewSourceLink — round 21 S100 reopen

Scope: S100 reopening, registry used-by/status history, and containment of round-21 source citations. Read-only review; no production files changed. No tools installed or updated.
Axes: source identity/version; used-by and status history; anchor containment; counter source-binding.

## Findings

**F1 — Low, used-by transition history still needs a round-21 Gate entry.** The current registry backlink is correct, but its change from the round-20-only path is not yet recorded in a round-21 lesson/Gate.

- `corpus/lessons/round-20.md:83-89` records S100 as a new row initially mined, used by `corpus/knowledge/webmcp-completion-lifecycle-round-20.md`, with no other existing-row status or used-by change in that round.
- Current `corpus/SOURCES.md:114` lists both that round-20 note and `corpus/knowledge/webmcp-nonautosubmit-round-21.md` in S100's `used-by`; the row remains `mined`, opened `2026-10-21`, and `on-release`. The round-21 note names S100 at line 1 and uses its scoped source interpretation at lines 32-43.
- The lane has no `corpus/lessons/round-21.md` in the current lesson listing. `corpus/SOURCES.md:151-153` ends the bounded-anchor search log at round 20 and says later additions cite their own round lesson's Gate. Thus, if this registry state is final, the new used-by edge has no old→new history entry. This is a history gap, not evidence of a status transition.

**Minimum acceptance:** in the round-21 `## Gate`, record `S100 used-by: corpus/knowledge/webmcp-completion-lifecycle-round-20.md → corpus/knowledge/webmcp-completion-lifecycle-round-20.md, corpus/knowledge/webmcp-nonautosubmit-round-21.md`; state that status remains `mined` and recheck remains `on-release`. No immutable S100 row fields or status need changing.

**F2 — Medium, source-binding false negative (static inference; no counter run).** `.ufo/waves/round-21/clones/BuildCounter/.ufo/waves/round-21/measure-c1.mjs:31-39` declares `corpus/SOURCES.md` as an input, but its sole S100 registry check (`:178-192`) verifies only one S100 row and that the row contains `NOTE`, after pinning the source-opening ID/URL/digest and decoded body. It does not validate the registry row's source URL, `status`, anchor digest/ranges, or coverage of the note's S100 citations. The subsequent note check (`:195-203`) checks note/LC tokens and the SKILL backlink, not anchor coverage.

- **Falsifiable failure shape:** change only the S100 registry anchor to `html_form_element.cc:174-328`, retaining the S100 row and its `NOTE` path. The unchanged note cites S100 spans outside that range, including `729-758` and `834-842` (`corpus/knowledge/webmcp-nonautosubmit-round-21.md:35,41-43`). The inspected source-binding predicate still accepts the S100 row, and the counter has no other registry/anchor access; with all other inputs pristine, clean count 12 / exit 0 is **[INFERENCE]**, not an executed result. A queued status or mismatching registry URL likewise survives that predicate.
- **Minimum acceptance:** bind the unique S100 row's exact source URL, `mined` status, decoded digest and parsed anchor intervals to the pinned opening/body, and reject an anchor that fails to contain the S100-cited spans. Add independent negative cases for anchor, status and URL drift. The lane selftest's existing `wrong-source` mutation (`.ufo/waves/round-21/selftest-c1.mjs:41`) changes only `source-opening.json`, not the registry row; no selftest file is present in the BuildCounter clone. No test was run.

## Anchor and reopen audit

The stored S100 row's spans contain the inspected round-21 citations; F2 is the separate gap that the counter does not enforce this containment if the row drifts.

- `.ufo/waves/round-21/source-opening.json:2-11` identifies the exact Chromium tag URL, S100, quote, location `html_form_element.cc:213-214`, and raw/decoded/stored hashes. The saved decoded source hashes to `8c8d6796b17bf8e8348747386c0d8720815b3d7df6d0bc4de0f3d3d4b8c36916`, matching the S100 row at `corpus/SOURCES.md:114`; it is byte-identical to `corpus/evidence/round-20/sources/html_form_element.cc`. The compressed carrier and decoded-carrier hashes also match `source-opening.json`.
- The quote is present in the exact saved body at lines 213-214. It is contained in S100's registered `174-328` interval (`corpus/SOURCES.md:114`). The round-21 note's S100 references at `corpus/knowledge/webmcp-nonautosubmit-round-21.md:32-43` are within the registered intervals `174-328,635-842`: examples include `212-218` and `320-327` in the first interval, and `720-815`, `729-758`, `787-806`, `807-813`, and `834-842` in the second. Reset/removal are explicitly labeled S101-only at lines 36-37, rather than attributed to S100.
- The script-submission framing is also preserved: the round-17 probe records page-script `requestSubmit()` followed by submit and `Completed` at `.ufo/waves/round-17/w1/C2ProbeDeclarative.md:71-73`; the round-21 note labels `na-requestsubmit` as a page-script action and explicitly avoids inferring a human or agent cause from event flags at line 34. This is consistent with the round-20 rejection of the “only human submission can finish” framing at `corpus/lessons/round-20.md:22-28`.

## Residual risk and verification gaps

- S100's “extends its narrow anchor set” wording at `corpus/SOURCES.md:114` is true relative to the explicitly superseded S096 anchor, but S078 already had the broad `174-328,635-842` span at line 92. The round-20 review already records this comparator nuance at `.ufo/waves/round-20/w2/ReviewReopenS100.md:62`; this review found no containment failure, but later prose should not imply new span coverage relative to S078 or new source diversity.
- This review verifies the retained bytes and line containment, not upstream publisher authentication or source-to-binary equivalence; the round-21 knowledge note disclaims those claims at `corpus/knowledge/webmcp-nonautosubmit-round-21.md:14-21`.
- The BuildRuntime clone contains `.ufo/waves/round-21/clones/BuildRuntime/scripts/webmcp-lifecycle-round21.mjs`; a literal search found no S100/source-link references there. The BuildCounter counter is cited at its full path in F2; its clone directory has no selftest file.
- The `lsp` device is unavailable (`read xd://lsp` returned “No such tool”). No caller/definition/diagnostics graph was queried; source citations above are direct line-containment observations, not semantic-reference proof. No tests, builds, linters, formatter, or browser were run.

Report: `.ufo/waves/round-21/w1/ReviewSourceLink.md`
