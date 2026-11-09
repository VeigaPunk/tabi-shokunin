---
source: S233 (Blink `identifiers_factory.cc` at Chromium tag 155.0.8059.84 — `IdentifiersFactory::IntIdForNode` returns `node->GetDomNodeId()`, lines 119-120), S234 (Blink `node.cc` at the same tag — `Node::GetDomNodeId` returns `DOMNodeIds::IdForNode(this)`, lines 354-355), read with S231 (Blink `inspector_dom_agent.cc`: `BuildObjectForNode` sets `backendNodeId` from `IdentifiersFactory::IntIdForNode(node)` at line 2546; `AssertNode` resolves a sent id with `DOMNodeIds::NodeForId`, lines 645-648, miss text "No node found for given backend id"; `setFileInputFiles` answers "Node is not a file input element" at line 1809) and S232 (Blink `dom_node_ids.cc`: one process-static counter `g_last_id`, line 18, and one process-static id→node map, line 30); staged copies `.ufo/waves/round-94/sources/` (sha256 in `sha256.txt`) and `.ufo/waves/round-93/sources/`
verified-at: 2026-11-08 (round 94, Linux host, Chromium 155.0.8059.84 `--headless=new`; scored run `.ufo/waves/round-94/scored/c1-live.json`, nonce `tabi-r94-live-240f4c5100c3`, verdict `clean`, 165 checks, 0 findings)
recheck: `node scripts/check-backendnode-collision-round94.mjs --lane <ABS lane> --expect-driver-sha256 518f40ff9b34727254a3bb0cd30603c70ce8488a911fa3a26a55273220f9686f --receipt corpus/evidence/round94/chromium-oopif-backendnode-collision/receipt.json --expect-nonce tabi-r94-live-240f4c5100c3 --json` → exit 0, `verdict: clean`, 165 checks (receipt mode on a byte copy of `.ufo/waves/round-94/scored/live-receipt.json`, sha256 `8070fcdc7871…`; the claim's counting command is the `--live` form in `plans/round-94.md` §Counting command)
---

# A cross-site iframe's chooser id on the page session — collision or miss, decided by the parent renderer's own numbering

Capability `chromium-oopif-backendnode-collision-linux` (new, first-working round 94). Round 93 showed
that a cross-site iframe chooser's `backendNodeId` B, sent on the PAGE session, names "a `#document`"
and declared (limit 3) that it did not say whose document or why. Round 94 binds whose — the parent's
own root — and produces the other branch of the same lookup: a B the parent renderer never minted
resolves to no node at all.

## The law in one sentence

*Measured (9/9 legs, 3 reps × 3 arms):* a `backendNodeId` reported on an out-of-process iframe's
session, sent on the parent page's session, is looked up in the PARENT renderer's id map — with an
unpadded child it collides with the parent's own root document (same id, `documentURL` = the parent
URL, and `DOM.setFileInputFiles` fails with "Node is not a file input element"), and with 300 painted
elements before the input it is larger than every id in the parent's tree and resolves to nothing
("No node found for given backend id" for both `DOM.describeNode` and `DOM.setFileInputFiles`); on the
same-site control the page session owns the input and B names it.

*Explained (S231–S234, not a predicate clause):* the integer is the node's own DOM node id
(`IntIdForNode` → `GetDomNodeId` → `DOMNodeIds::IdForNode`), minted from a counter that is static per
renderer PROCESS, and `AssertNode` resolves a sent id with `NodeForId` in the process that receives the
command. Two renderers number their nodes independently from 1, so a foreign id is either somebody
else's node or nobody's.

## What was measured

Scored receipt `corpus/evidence/round94/chromium-oopif-backendnode-collision/receipt.json` (C-1, M-1,
S-1, C-2, M-2, S-2, C-3, M-3, S-3; fresh browser and profile per leg; parent
`http://127.0.0.1:<http>/parent.html?leg=<id>`, child `http://<host>:<child>/child.html?leg=<id>&pad=<p>`):

| arm | child host / pad | chooser session, B | page `describeNode(B)` | page root id | page tree max id | page `setFileInputFiles(B)` | chooser-session answer |
|---|---|---|---|---|---|---|---|
| C | `localhost` / 0 | iframe, B = 2 | `#document`, backendNodeId 2, `documentURL` = parent URL | 2 (= B) | 15 (≥ B) | "Node is not a file input element", files `[]` | ok, `[["tabi-r94-answer.txt",22]]` |
| M | `localhost` / 300 | iframe, B = 302 | "No node found for given backend id" | 2 (≠ B) | 15 (< B) | "No node found for given backend id", files `[]` | ok, same file |
| S | `127.0.0.1` / 300 | page, B = 305 | `INPUT` type=file id=s, backendNodeId 305 | 2 | 635 (≥ B) | — (same session) | ok, same file |

The exact B values (2, 302, 305) and maxima (15, 635) are what this fixture produced on every rep;
the predicate binds the relations (= root id, ≥ / < the tree maximum), not the numbers.

## Practical rule for automation clients

Send a `backendNodeId` only on the session of the target whose event or reply carried it. Sent to
another target's session, the LUCKY outcome is an error; the unlucky one is a collision that silently
operates on an unrelated node of the other renderer. Which of the two happens depends on how many ids
each renderer has minted so far — page content, not the client, decides — so neither error text is a
safe signal that "this id is foreign". Production clients route by the frame's own session
(Playwright `crPage.ts`, S230, r92).

## Pre-freeze probes (observations; plan limit 3)

`.ufo/waves/round-94/probes/`: 300 `display:none` empty spans plus a pre-click iframe-session
`DOM.getDocument {depth:-1}` left B = 2 (a collision) although that serialization minted ids up to 318
in the child renderer; 300 painted `<span>x</span>` made B = 302. So the input's id had been minted
before any DevTools request touched it in these legs, and painted content ahead of it advances the
child's counter while hidden content did not. S234 shows any caller of `GetDomNodeId` can mint; which
caller minted the input's id first is NOT established here.

## Wave findings beyond the claim (round-94 w1; observations, not predicate clauses)

- **Collision or miss is MEMBERSHIP of B in the parent renderer's live id map, not a comparison with
  the parent's largest id** (R94Critic2, `.ufo/waves/round-94/w1/R94Critic2-results.json`, 1 rep per
  variant). Child pads 1, 5, 20, 100, 300 gave B = 3, 7, 22, 102, 302 (pad + 2). Pad 1 collided with a
  parent `#document` whose `documentURL` is `about:blank` (NOT the root, root id 2); pads 5-300 missed
  — including B = 7 while the parent's pierced tree reached id 16. So "collision iff B ≤ parent max"
  is false, and "the collision is always the parent root" is false. The frozen C-arm root equality
  holds for B = 2 in this fixture only.
- **A busier parent turns the miss into a collision.** 400 painted spans in the PARENT with the M
  child (B = 302): page `describeNode(302)` named a parent `#text` node and page `setFileInputFiles`
  answered `Node is not a file input element`. The miss is a property of the parent+child pair.
- **Hidden content does not move B.** 300 `display:none` spans: B = 2, collision with the parent
  root, as at pad 0 (R94Critic2 variant d; pre-freeze probe1).
- **When B is fixed** (R94Critic3, `.ufo/waves/round-94/w1/R94Critic3-*.json`, 3 reps each): an
  iframe-session `DOM.getDocument` before the click finds the input already at 302 (= the chooser's B;
  DevTools does not mint it); 300 painted spans inserted by script after load leave B = 2; 300
  painted spans AFTER the input in DOM order leave B = 2. Supported reading: the input's id is fixed at
  the child document's first render, in tree order, counting nodes rendered before it. Paint-path
  minting sites exist at the tag (R94Scout: `text_fragment_painter.cc` line 747,
  `paint_property_tree_builder.cc` line 852 — leads, conditional, not rows); WHICH pass mints the
  input is not isolated.
- **Order.** With the chooser-session answer sent first, the page-session call's error text is
  unchanged but `filesAfterCross` reads the delivered file (limit 4: the "files stay `[]`" read is
  order-dependent).

So the practical rule above stands and sharpens: a foreign `backendNodeId` resolves to whatever the
receiving renderer numbered with that integer — a document, a text node, nothing — depending on page
content on both sides.

## Corrections to earlier lane notes (round 94; appended there as well)

- r92 `chromium-crosssite-iframe-chooser-round-92.md` §Wave probes: "consistent with `backendNodeId`
  being scoped to the reporting session's document tree [INFERENCE]" — the id is scoped to the
  RENDERER PROCESS, not the session (r93 S231/S232, r94 S233/S234); the page-session error came from a
  collision with the parent's own id 2.
- r93 `chromium-oopif-backendnode-scope-round-93.md` rule 2 reads the absence of
  `No node found for given backend id` as part of the r93 law's contrast; r94's M arm produces exactly
  that miss for the same cross-site setup with a padded child. Neither error text is a stable
  signature of a foreign id.

## Declared limits (from the frozen plan)

One Chromium build (155.0.8059.84, Arch package, `--headless=new`, Linux); "cross-site" only as
`localhost` vs `127.0.0.1`; two fixture shapes (pad 0 and pad 300), no threshold claimed; one id per
leg in fresh browsers; the chooser intercepted and answered programmatically; the `--receipt` mode is
forgeable by construction, the counting command is `--live`.

## Evidence

- Plan, predicate, controls: `plans/round-94.md`; freeze `2308b6ce`, scored `012776cf`.
- Controls: `.ufo/waves/round-94/controls/rc.txt` (no-work rc 128 / rc 1; wrong-site rc 1; pad-0 rc 1;
  positive rc 0, 165 checks; busy-port, counter-SIGTERM, driver-SIGKILL all `setup` rc 2 with 0
  chromium left; battery 74/74).
- Wave: `.ufo/waves/round-94/w1/` and `.ufo/waves/round-94/claim-falsification.tsv`.
