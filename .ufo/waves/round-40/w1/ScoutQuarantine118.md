# ScoutQuarantine118 — S118 quarantine hand-check (tabi row)

## Row confirmed
Source register `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md` line 185 (read-only):
`tabi | round1 | S118 | payload-absent | https://arxiv.org/abs/2305.11506 | "User awareness" <br> "Chromium notifies users by rendering an infobar across all open browser tabs" <br> "User awareness"`.
The same ID S118 also appears for `kumitate` (L138) and `tameshi` (L218) and a `souji` unreachable row (L361). This seat sits in the tabi wave (round-40 `assimilation/quarantine-slice` S118 -> tabi), so the tabi row is the one classified. Other lanes' S118 rows were NOT evaluated.
Staged anchor (from shokuknow `census-adjudication.json` / `quote-lint-full*.json`, grep only): `§2.3 "User awareness"`.

## Fetch (access date 2026-10-27, UTC; scratch /fast/scratch/hyaku/tabi-r40/ScoutQuarantine118, removed)
- `curl -sSL https://arxiv.org/abs/2305.11506` -> HTTP 200, 43,266 B, sha256 `2a18e149...a20e32`. Landing page = "Chrowned by an Extension: Abusing the Chrome DevTools Protocol through the Debugger API". Grep (case-insens.) for `infobar|User awareness|notifies users`: 0 hits (abstract page only; the quote is not expected there).
- `curl -sSL https://arxiv.org/pdf/2305.11506` (the full text of the same cited paper) -> HTTP 200, 563,856 B, application/pdf, sha256 `e8131e4e...39d469`, 15 pages (pdfinfo), pdftotext extracted 118,459 B.

## Located passage
Section 2.3 "The Debugger extension API", paragraph headed "User awareness." (pdftotext, two-column; flattened text confirmed contiguous):
> "Chromium notifies users by rendering an infobar across all open browser tabs"
(continuing: "[74] as shown in Figure 2.") Preceded by "User awareness. When a debugging extension successfully attaches to a target," and followed by "...user can click on the cancel button to force all debuggers from an extension to be detached". Heading text "User awareness" occurs exactly as the run-in paragraph heading in §2.3 (also "SR01 – User Awareness" in a later table).

## Classification
**present** — all three register quote items (`User awareness`, the infobar sentence, `User awareness`) and the §2.3 anchor are located in the actual cited paper (full-text PDF). The register's `payload-absent` is a false absence relative to the full text: it holds only for the arXiv abs landing page (abstract), which does not carry body text. Not fabrication, not unreachable.

## Limitations
- Full text read via `arxiv.org/pdf/2305.11506` (same arXiv ID, version served on 2026-10-27, PDF creation date 2023-05-31), not the `/abs/` HTML; a classifier that only fetches `/abs/` would see the quote as absent (prior ScoutQuarantine02 r39 reported absent from the abstract only).
- Only the tabi S118 row classified; no earlier summaries used as evidence. No source repo / lane corpus edits. No tools installed.

VERDICT ok S118 (tabi) present: "Chromium notifies users by rendering an infobar across all open browser tabs" in §2.3 "User awareness" of arXiv 2305.11506 full-text PDF; absent only from /abs/ landing page
