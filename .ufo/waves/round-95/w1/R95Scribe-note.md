---
source: S235 (Blink `file_input_type.cc` at Chromium tag 155.0.8059.84 — `FileInputType::CreateShadowSubtree` gives every `<input type=file>` a user-agent shadow root holding an `INPUT type=button` with id `file-upload-button` and a `span`, lines 396-397 and 402; staged `.ufo/waves/round-95/sources/file_input_type.cc`, sha256 `f96265db986a…`), read with S231 (Blink `inspector_dom_agent.cc`: `AssertNode` resolves a sent id with `DOMNodeIds::NodeForId`, lines 645-648, miss text "No node found for given backend id"; `setFileInputFiles` answers "Node is not a file input element" at line 1809), S232 (Blink `dom_node_ids.cc`: one process-static counter `g_last_id`, line 18, and one process-static id→node map, line 30), S233 (Blink `identifiers_factory.cc`: `IdentifiersFactory::IntIdForNode` returns `node->GetDomNodeId()`, lines 119-120) and S234 (Blink `node.cc`: `Node::GetDomNodeId` returns `DOMNodeIds::IdForNode(this)`, lines 354-355)
verified-at: 2026-11-08 (round 95, Linux host, Chromium 155.0.8059.84 `--headless=new`; scored run `.ufo/waves/round-95/scored/c1-live.json`, nonce `tabi-r95-live-36ad06703d0b`, verdict `clean`, 336 checks, 0 findings)
recheck: `node scripts/check-backendnode-misdelivery-round95.mjs --lane <ABS lane> --expect-driver-sha256 24947b00d8a158ad3fea8f5fb035757b6b98aebf48e85d18d506433619e2ee82 --receipt corpus/evidence/round95/chromium-oopif-backendnode-misdelivery/receipt.json --expect-nonce tabi-r95-live-36ad06703d0b --json` → exit 0, `verdict: clean`, 336 checks (receipt mode on a byte copy of `.ufo/waves/round-95/scored/live-receipt.json`, sha256 `e5d13b767a42…`; the claim's counting command is the `--live` form in `plans/round-95.md` §Counting command)
---

# A cross-site iframe's chooser id on the page session — it acts on the parent's node at that id, and may silently fill an unrelated parent file input

Capability `chromium-oopif-backendnode-misdelivery-linux` (new, first-working round 95). Round 94 bound
the cross-site case to two outcomes — the parent's own root document (collision) and no node at all
(miss) — and left a parent that owns a node at the foreign id other than its root unmeasured. Round 95
adds that third and dangerous branch, and binds all three to one law checked per leg against the page's
own pierced `DOM.getDocument` snapshot.

## The law in one sentence

*Measured (18/18 legs, 3 reps × 6 arms: P286, P287, P288, P289, Z, S):* a cross-site iframe's file
chooser reports a `backendNodeId` B on the IFRAME session; sent on the PAGE session, B is looked up in
the PARENT renderer's id map, and it acts on exactly the node T that the page's own pierced
`DOM.getDocument {depth: -1, pierce: true}` snapshot carries at id B — and when T is one of the parent's
own `<input type=file>` elements, the page-session `DOM.setFileInputFiles(B)` returns NO error and fills
that parent input, while the child's own `#s` stays empty: a silent misdelivery.

*Explained (S231–S235, not a predicate clause):* the integer is the node's own DOM node id
(`IntIdForNode` → `GetDomNodeId` → `DOMNodeIds::IdForNode`), minted from a counter that is static per
renderer PROCESS and handed out on first request, and `AssertNode` resolves a sent id with
`NodeForId` in the process that receives the command. Two renderers number their nodes independently,
so a foreign id is somebody else's node or nobody's — and, per S235, a file input is not one node but
several (its user-agent shadow root holds an `INPUT type=button` with id `file-upload-button` and a
`span`), so consecutive parent file inputs sit 4 ids apart and a foreign id can land on the input
itself, on its shadow button, or on a text node.

## What was measured

Scored receipt `corpus/evidence/round95/chromium-oopif-backendnode-misdelivery/receipt.json`
(byte-identical to `.ufo/waves/round-95/scored/live-receipt.json`, sha256 `e5d13b767a42…`; counter
`verdict: clean`, 336 checks, 0 findings; branches: misdelivery `P286-1`; collision 11 P legs; miss
`Z-1..3`). Fresh browser and profile per leg; parent `http://127.0.0.1:<http>/parent.html?leg=<id>&q=<q>`
holding `q` painted spans then `#p0`..`#p5`, then one iframe; child
`http://localhost:<child>/child.html?leg=<id>&pad=300` holding 300 painted spans then `#s`.

The three branches, one observed leg each (B, T and the cross answer quoted from the receipt):

| branch | leg | B (chooser, iframe session) | T = snapshot node at B | page `describeNode(B)` | page `setFileInputFiles(B)` | after the cross answer |
|---|---|---|---|---|---|---|
| misdelivery | `P286-1` | 302 | `INPUT` `type=file` `id=p3`, backendNodeId 302 (the PARENT's own third input) | no error, equals T | no error | parent `#p3` = `[["tabi-r95-answer.txt", 22]]`, `#p0/#p1/#p2/#p4/#p5` = `[]`, child `#s` = `[]` |
| collision | `P287-1` | 302 | `#text` (nodeType 3), backendNodeId 302 | no error, equals T | `Node is not a file input element` | all six parent inputs `[]`, child `#s` = `[]` |
| miss | `Z-1` | 302 | none (snapshot carries no node at 302; snapshot max id 59 < 302) | `No node found for given backend id` | `No node found for given backend id` | all six parent inputs `[]`, child `#s` = `[]` |

Same-site control (`S-1`): the chooser is reported on the PAGE session, B = 617, the page snapshot
carries exactly one `INPUT#s` at id 617, page `describeNode(617)` equals it, and no cross answer is sent
— the page session owns the input.

What the parent inputs looked like (receipt `snapshot.parentInputs`, same leg set): the six ids are 4
apart — `P286-1` `p0=290, p1=294, p2=298, p3=302, p4=306, p5=310`; `P287-1` `p0=291 … p5=311`;
`Z-1` `p0=4, p1=8, p2=12, p3=16, p4=20, p5=24`. So B = 302 lands on `#p3` in `P286-1` (misdelivery), on a
`#text` node in `P287-1`/`P288-1` (collision), and on the parent's UA shadow upload button in
`P289-1`/`P289-2`/`P289-3` — `INPUT` `type=button` `id=file-upload-button`,
`pseudo=-webkit-file-upload-button` — which the cross answer rejects with
`Node is not a file input element` (collision). The shadow button is S235 made visible: the foreign id
can land on any of the several nodes one file input contributes.

In every leg the answer sent on the CHOOSER's own session returned no error and the child's `#s` then
held exactly `[["tabi-r95-answer.txt", 22]]`, and the child recorded exactly one trusted `click` on `#s`.

## Practical rule for automation clients

Answer an out-of-process iframe's file chooser ONLY on the session that reported it. A page-session
answer is not a no-op and not necessarily an error: if the parent's renderer happens to own a file input
at that integer, the page-session `DOM.setFileInputFiles(B)` succeeds silently and fills a DIFFERENT,
UNRELATED file input in the parent document, with no error and nothing in the child. Neither error text
("No node found for given backend id", "Node is not a file input element") is a safe signal that the id
is foreign — the first means the receiving renderer has not numbered that integer, the second means it
has, but the node there is not a file input. Which of the three outcomes you get is decided by how many
ids each renderer has minted so far — page content, not the client, decides. Production clients route by
the frame's own session (Playwright `crPage.ts`, S230, r92).

## Declared limits (from the frozen plan, verbatim by number)

1. One Chromium build (155.0.8059.84, Arch Linux package via `/usr/bin/chromium` with the host user's
   `chromium-flags.conf`), `--headless=new` only; headed mode, other builds and OSes are unmeasured.
2. "Different site" is realised only as `localhost` vs `127.0.0.1` (r92-r94 limit 2).
3. The claim states that the page-session lookup acts on the snapshot's node at B. It does NOT state
   WHICH P leg misdelivers: the parent's ids jitter by ±1 between fresh browsers (pre-freeze probes:
   P286 hit 3/3 in `probe-a`, P286 1 and P289 2 of 3 in the positive control), so only "at least one P
   leg misdelivers and at least one collides" is claimed. The snapshot itself serializes the whole
   parent tree, which mints ids for nodes not yet numbered (S234); T is "the node at B after that
   serialization", not before it (pre-freeze `probe0-single-input-q250`: describe before serialization
   missed, the cross answer after it collided).
4. One backendNodeId per leg (the chooser's), fresh browsers; the order "correct-session answer first",
   longer-lived renderers and other page shapes are unmeasured. What a CDP client library (Puppeteer,
   Playwright) does is not measured here: the driver sends raw CDP.
5. The chooser is intercepted (`Page.setInterceptFileChooserDialog`) and answered programmatically; no
   dialog UI is observed. "Exactly one" chooser means within the 1500 ms window after the click.
6. The counter in `--receipt` mode reads a file: a forger who writes a whole consistent receipt passes
   that mode, and T is the driver's own record of the snapshot (a raw observation, not re-derived by
   the counter). The claim's counting command is `--live`. `--reps` other than 3 measures other legs;
   the claim is the default.

## Evidence

- Plan, predicate, controls: `plans/round-95.md`; freeze `1ecbca38`, scored `360d7cc9`.
- Scored run: `.ufo/waves/round-95/scored/c1-live.json` (verdict `clean`, 336 checks, 0 findings, nonce
  `tabi-r95-live-36ad06703d0b`), receipt `.ufo/waves/round-95/scored/live-receipt.json` and
  `corpus/evidence/round95/chromium-oopif-backendnode-misdelivery/receipt.json`, sha256
  `e5d13b767a4248ed59f3cac2e7613783336f0a768df612b9db057113609b3404`.
- Instruments (sha256 as frozen): driver `24947b00d8a158ad3fea8f5fb035757b6b98aebf48e85d18d506433619e2ee82`,
  counter `b7b464daa7c3c60f771b836cae8d8045fece1b2cca28aba4af70d154738d2775`, forgery battery
  `1a670da5a9ffe200e6c757b0966d2df2e1bcca826da1f703c43d402f5075abf0`.
- Controls: `.ufo/waves/round-95/controls/rc.txt`; staged Blink source
  `.ufo/waves/round-95/sources/file_input_type.cc`.
- Pre-freeze probes (observations only): `.ufo/waves/round-95/probes/`.
