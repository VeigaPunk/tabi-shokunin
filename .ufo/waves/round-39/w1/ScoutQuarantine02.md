# Tabi quarantine hand-check (deterministic rows 2 of 8)

## Re-derivation
Command:
```sh
awk -F'|' '$2 ~ /`tabi`/ {print}' /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md
```
The full extraction returned 37 lines: 36 well-formed S-id rows, plus a malformed trailing `| `tabi` | 37 |` fragment and a partial `S171` unreachable row. The deterministic subset is actual positions 7-8 of the eight-row round-1 block, S117 and S118. A typed-row extraction confirmed:
```sh
awk -F'|' '$2 ~ /`tabi`/ && $4 ~ /S[0-9]+/ {print}' ...
```
with output positions 7-8:
- S117, round1, source `https://webmachinelearning.github.io/webmcp/`, quote `User awareness`.
- S118, round1, source `https://arxiv.org/abs/2305.11506`, quotes `User awareness`; `Chromium notifies users by rendering an infobar across all open browser tabs`; `User awareness`.

## Results
- **S117 — absent (fabrication relative to cited source).** Retrieved the live WebMCP draft at `https://webmachinelearning.github.io/webmcp/` (canonical URL `https://webmachinelearning.github.io/webmcp`). Exact searched phrase `User awareness` does not occur in the fetched document; the document is a WebMCP API draft and its extracted beginning includes abstract and API terminology, not that phrase. No matching quote or anchor was found. Thus the registry's quote is absent from this cited source. Confidence: high for source absence.
- **S118 — absent (fabrication relative to cited source).** arXiv API fetch at `https://arxiv.org/abs/2305.11506` resolved to “Chrowned by an Extension: Abusing the Chrome DevTools Protocol through the Debugger API” (arXiv:2305.11506, 2023-05-19). Its abstract discusses extension Debugger API vulnerabilities and does not contain any of the three quoted phrases; no user-awareness/infobar claim appears. Exact quote and anchor: none in fetched abstract. Confidence: high that the registered `User awareness` / all-tabs infobar quotations do not match this paper. Since the fetched view is arXiv metadata/abstract rather than full PDF, this finding is bounded to the retrieved record; whole-paper absence is not independently established.

Both URLs fetched successfully (not unreachable). Neither is marked unverifiable-family; no source-type-family rule was applied. Quotes are recorded as inline text without locator anchors, and no quoted passage was located, so exact quote evidence is the absence described above.

## Commands and observed output
```sh
awk -F'|' '$2 ~ /`tabi`/ {print}' /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md
# Output included S102,S106,S109,S110,S111,S114,S117,S118,... and malformed trailing partial row.
awk -F'|' '$2 ~ /`tabi`/ && $4 ~ /S[0-9]+/ {print}' /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md
# Actual positions 7-8 in round1 block: S117, S118 (full row text above).
```
Web reads: `https://webmachinelearning.github.io/webmcp/` and `https://arxiv.org/abs/2305.11506`; both succeeded. No tools installed. No source files or campaign/knowledge entries changed. Scratch directory `/fast/scratch/hyaku/tabi-r39/ScoutQuarantine02` was removed before completion.

VERDICT finding — S117 and S118 cited-source quotes are absent in the fetched materials; S118 whole-paper absence remains unverified beyond arXiv abstract.
