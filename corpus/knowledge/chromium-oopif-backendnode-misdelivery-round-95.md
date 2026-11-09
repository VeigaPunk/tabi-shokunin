---
source: S235 (Blink `file_input_type.cc` at Chromium tag 155.0.8059.84 — `FileInputType::CreateShadowSubtree` appends to every file input's user-agent shadow root an `INPUT type=button` with id `file-upload-button` (lines 396-397, 399) and a span (line 402)), read with S231 (Blink `inspector_dom_agent.cc`: `AssertNode` resolves a sent id with `DOMNodeIds::NodeForId`, miss text "No node found for given backend id" at line 648; `setFileInputFiles` answers "Node is not a file input element" at line 1809), S232 (Blink `dom_node_ids.cc`: one process-static counter and id→node map per renderer), S233 (`IdentifiersFactory::IntIdForNode` returns `node->GetDomNodeId()`) and S234 (`Node::GetDomNodeId` mints on first request)
verified-at: 2026-11-08 (round 95, Linux host, Chromium 155.0.8059.84 `--headless=new`; scored run `.ufo/waves/round-95/scored/c1-live.json`, nonce `tabi-r95-live-36ad06703d0b`, verdict `clean`, 336 checks, 0 findings)
recheck: `node scripts/check-backendnode-misdelivery-round95.mjs --lane <ABS lane> --expect-driver-sha256 24947b00d8a158ad3fea8f5fb035757b6b98aebf48e85d18d506433619e2ee82 --receipt corpus/evidence/round95/chromium-oopif-backendnode-misdelivery/receipt.json --expect-nonce tabi-r95-live-36ad06703d0b --json` → exit 0, `verdict: clean`, 336 checks (receipt mode on a byte copy of `.ufo/waves/round-95/scored/live-receipt.json`, sha256 `e5d13b767a42…`; the claim's counting command is the `--live` form in `plans/round-95.md` §Counting command)
---

# A cross-site iframe's chooser id on the page session can fill the PARENT's own file input

Capability `chromium-oopif-backendnode-misdelivery-linux` (new, first-working round 95). Round 94 showed
two outcomes of sending a cross-site iframe chooser's `backendNodeId` B on the PAGE session — B named
the parent's root document, or no node at all — because the parent renderer resolves B in its own id
map. Round 95 gives the parent its own file inputs near id B and shows the third, silent outcome.

## The law in one sentence

*Measured (18/18 legs, 3 reps × P286, P287, P288, P289, Z, S):* a `backendNodeId` reported on an
out-of-process iframe's session, sent on the parent page's session, acts on exactly the node the
parent's own pierced `DOM.getDocument` snapshot carries at that id — and when that node is one of the
parent's `<input type=file>` elements, `DOM.setFileInputFiles` returns **no error** and puts the file
into the PARENT's input, while the iframe's input that actually opened the chooser stays empty.

## What the scored run shows (receipt `corpus/evidence/round95/chromium-oopif-backendnode-misdelivery/receipt.json`)

Fixture: parent `127.0.0.1` page with `q` painted spans, then six file inputs `#p0`..`#p5`, then a
cross-site `localhost` iframe whose document holds 300 painted spans and the input `#s`; a trusted click
on `#s`; the chooser arrives on the iframe session with B = 302 in every P and Z leg.

| leg | parent `#p0..#p5` ids | node at B in the parent snapshot | page `setFileInputFiles(B)` | parent inputs after | child `#s` after |
|---|---|---|---|---|---|
| P286-1 | 290 294 298 302 306 310 | `INPUT type=file id=p3` | no error | `#p3` = `tabi-r95-answer.txt` (22 B) | `[]` |
| P287-1 | 291 295 299 303 307 311 | `#text` | `Node is not a file input element` | all `[]` | `[]` |
| P289-1 | 293 297 301 305 309 313 | `INPUT type=button id=file-upload-button` (UA shadow) | `Node is not a file input element` | all `[]` | `[]` |
| Z-1 (q = 0) | 4 8 12 16 20 24 (max id 59) | none | `No node found for given backend id` | all `[]` | `[]` |
| S-1 (same-site) | 293 … 313 | the child `INPUT#s` (B = 617, one renderer) | not sent | — | — |

In every leg the page session's `DOM.describeNode(B)` returned that same node (name, type, attributes,
id) or the miss error, and the answer sent on the session that reported the chooser filled the child's
`#s`. Over the 12 P legs, 1 misdelivered (P286-1) and 11 hit a non-file node; the pre-freeze positive
control had 4 misdeliveries (P286-2, P289-2, P286-3, P289-3) and the probe run 3 (P286 ×3).

## Why (S231–S235)

- The id in a CDP node record is the node's own DOM node id (S233), minted on first request (S234) from
  one counter per renderer process (S232); a command resolves the id it receives with `NodeForId` in
  the renderer that receives it (S231). Parent and child are different renderers, so the same integer
  names unrelated nodes in each.
- Every file input carries a UA shadow root with a button (id `file-upload-button`) and a span (S235).
  The parent's file inputs were therefore numbered 4 apart, and B could land on the input itself, on its
  shadow button, or on a text node — the three P outcomes above.
- The parent's numbering jitters by ±1 between fresh browsers (P286 gave `#p3` = 302 in one leg and 303
  in another), so WHICH padding misdelivers is not fixed; the law holds in every leg regardless.

## Practical rule for a CDP client

Answer an out-of-process iframe's file chooser ONLY on the session whose `Page.fileChooserOpened` carried
the `backendNodeId`. Sent on the page session, the same integer is a pointer into a different renderer:
it may fail loudly (`No node found…`, `Node is not a file input element`) — or, if the parent happens to
own a file input at that id, succeed silently and hand the user's file to a different input in a
different (cross-site) document. An error-free `DOM.setFileInputFiles` is not evidence that the right
input received the file; read the target input's `files` back in the frame that owns it.

## Declared limits (`plans/round-95.md` §Declared limits, by number)

1. One Chromium build (155.0.8059.84, Arch Linux `/usr/bin/chromium`), `--headless=new` only.
2. "Different site" is only `localhost` vs `127.0.0.1`.
3. The law says the lookup acts on the snapshot's node at B; it does not say which P leg misdelivers
   (±1 jitter), and T is the node at B after the snapshot's own serialization, which mints ids for
   nodes not yet numbered (S234; probe `probe0-single-input-q250.json`: describe before serialization
   missed, the cross answer after it collided).
4. One id per leg, fresh browsers; answer-first order, long-lived renderers, other page shapes and
   client libraries (Puppeteer, Playwright) are unmeasured — the driver sends raw CDP.
5. The chooser is intercepted and answered programmatically; no dialog UI is observed.
6. `--receipt` mode reads a file a forger can write, and T is the driver's own record of the snapshot;
   the claim's counting command is `--live`.
