# R93Critic3 — H: page-session B is the parent document (X arm)

**VERDICT C1: neutral** — artifact: .ufo/waves/round-93/w1/R93Critic3-results.json
(H is outside the frozen wording, declared limit 3; nothing observed falsifies C1 wording or numbers.)

## Hypothesis tested
In the X arm, the node the PAGE session returns for the chooser's backendNodeId B is
the parent document itself: page-session DOM.getDocument(depth:0) root backendNodeId == B
and DOM.describeNode(B) on the page session equals that root (#document, documentURL = parent URL).

## Method (exact commands, exit codes)
- `cp scripts/chrome-cdp-cross-session-answer-round93.mjs .ufo/waves/round-93/w1/R93Critic3-probe.mjs`
  (base sha256 matched pinned a0deddda…9a4a0 before edit).
- Added read-only probe after chooser, before setFileInputFiles: page DOM.getDocument{depth:0},
  page DOM.describeNode{B}, iframe DOM.describeNode{B}, iframe DOM.getDocument{depth:0}.
- `node --check …/R93Critic3-probe.mjs` → rc 0.
- `TMPDIR=/fast/scratch/hyaku/tabi-r93/R93Critic3 node …/R93Critic3-probe.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --nonce tabi-r93-critic3 --scratch /fast/scratch/hyaku/tabi-r93/R93Critic3 --out /fast/scratch/hyaku/tabi-r93/R93Critic3/receipt.json --http-port 19431 --child-port 19432 --cdp-port 19433 --reps 3` → EXIT=0, 6 legs, 0 failures.
- `pgrep -f "remote-debugging-port=19433"` → empty (chromium gone).
- Frozen instruments, claims.json, plan, controls: not edited (probe is a copy; pinned driver sha256 file unchanged).

## Result per X leg — H CONFIRMED 3/3
| leg | B | page getDocument{0} root | page describeNode(B) | iframe describeNode(B) | iframe root |
|---|---|---|---|---|---|
| X-1 | 2 | backendNodeId 2 (#document, documentURL http://127.0.0.1:19431/parent.html?leg=X-1, nodeId 14) | nodeId 14, #document, same parent URL | INPUT (input) | backendNodeId 1, child URL |
| X-2 | 2 | backendNodeId 2 (#document, …parent.html?leg=X-2, nodeId 14) | nodeId 14, #document, same parent URL | INPUT | backendNodeId 1, child URL |
| X-3 | 2 | backendNodeId 2 (#document, …parent.html?leg=X-3, nodeId 14) | nodeId 14, #document, same parent URL | INPUT | backendNodeId 1, child URL |

In each X leg: rootEqB=true, describeEqParentRoot=true, docURLConfirmsParent=true.
`DOM.describeNode(B, depth:0)` exposes `documentURL` on #document nodes — it does
(no frameId). Page pierce still 0 INPUT#s; page setFileInputFiles → exactly
"Node is not a file input element"; iframe answer → no error; files == [["tabi-r93-answer.txt",22]].
S arms (context): B=5 on page session is INPUT; page root backendNodeId=2 ≠ B — H correctly does not apply.

## Meaning for the Blink explanation
Staged `dom_node_ids.cc` shows a single process-static counter `g_last_id` and one map
`IdToNodeMap()` per renderer process: ids minted in the cross-site iframe's renderer live in
*that* process's map; `NodeForId` (called by `AssertNode` for `setFileInputFiles`/`describeNode`)
looks the id up in the *receiving* process's map. Here the iframe's first file input got id 2
in its renderer; the parent renderer independently minted id 2 for its own #document — so
when B=2 is sent on the page session it resolves to the parent document, not to an unmapped
hole. It is a collision, not a scope leak: the parent renderer's id 2 never named the iframe
input. The error "Node is not a file input element" follows because the parent-document node fails
the file-input check. S-arm: same renderer, same map, B is the INPUT consistently.

## Tooling
No installs/upgrades (pacman paused; driver run used existing node + /usr/bin/chromium only).

## Evidence paths (relative to tabi-shokunin/)
- .ufo/waves/round-93/w1/R93Critic3.md (this file)
- .ufo/waves/round-93/w1/R93Critic3-results.json (per-leg probe summary)
- .ufo/waves/round-93/w1/R93Critic3-receipt.json (full 6-leg receipt, incl. probes)
- .ufo/waves/round-93/w1/R93Critic3-probe.mjs (modified driver copy; pinned original untouched)
