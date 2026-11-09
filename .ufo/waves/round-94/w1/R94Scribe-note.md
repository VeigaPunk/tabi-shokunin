---
source: S231 (Blink `inspector_dom_agent.cc` at Chromium tag 155.0.8059.84 — `BuildObjectForNode` stamps a node record with `IdentifiersFactory::IntIdForNode(node)` (line 2546), `AssertNode` resolves a sent `backendNodeId` through `DOMNodeIds::NodeForId` (lines 645-648; the miss branch at 647-649 answers "No node found for given backend id") and `setFileInputFiles` answers "Node is not a file input element" for a resolved node that is not a file input (line 1809)), S232 (Blink `dom_node_ids.cc` at the same tag — one process-static id counter `g_last_id` (line 18) and one process-static id→node map `IdToNodeMap()` (lines 28-34); `IdForNode` mints from that counter (48-61) and `NodeForId` reads that map (69-78)), S233 (Blink `identifiers_factory.cc` at the same tag — `IdentifiersFactory::IntIdForNode` returns `node->GetDomNodeId()` (lines 119-120)), S234 (Blink `node.cc` at the same tag — `Node::GetDomNodeId` returns `DOMNodeIds::IdForNode(this)` (lines 354-355)); staged copies `.ufo/waves/round-94/sources/` (digests in `.ufo/waves/round-94/sources/sha256.txt`: `identifiers_factory.cc` 8d8ee04ee5253f701bdd0d642ab1e7abade7a645c72f19d31203466ca79ed3bb, `node.cc` 1fa7935829ce6d568b26d8a5148899396af1119c96a5809bbecef48b5ce1cfd3; re-fetched from `chromium.googlesource.com` at tag 155.0.8059.84 on 2026-11-08, byte-identical to the staged copies); receipt `.ufo/waves/round-94/scored/live-receipt.json` = `corpus/evidence/round94/chromium-oopif-backendnode-collision/receipt.json` (sha256 8070fcdc787189a18cb888da20765579bfe0240fa53d16264301fcf7ffc37354), driver `scripts/chrome-cdp-backendnode-collision-round94.mjs`, sha256 pin `518f40ff9b34727254a3bb0cd30603c70ce8488a911fa3a26a55273220f9686f` in `.ufo/waves/round-94/controls/instrument-sha256.txt`
verified-at: 2026-11-08 (round 94, Linux host, Chromium 155.0.8059.84 `--headless=new`; scored run `.ufo/waves/round-94/scored/c1-live.json`, nonce `tabi-r94-live-240f4c5100c3`, verdict `clean`, 165 checks, 0 findings; the same receipt re-checked in `--receipt` mode on 2026-11-08 → exit 0, `verdict: clean`, 165 checks)
recheck: `node scripts/check-backendnode-collision-round94.mjs --lane <ABS lane> --expect-driver-sha256 518f40ff9b34727254a3bb0cd30603c70ce8488a911fa3a26a55273220f9686f --receipt corpus/evidence/round94/chromium-oopif-backendnode-collision/receipt.json --expect-nonce tabi-r94-live-240f4c5100c3 --json` → exit 0, `verdict: clean`, 165 checks (receipt mode, a byte copy of `.ufo/waves/round-94/scored/live-receipt.json`; the claim's counting command is the `--live` form in §Evidence)
---

# A cross-site iframe's chooser id on the page session — collision or miss, decided by the parent renderer's own numbering

Capability `chromium-oopif-backendnode-collision-linux` (new, first-working round 94). Round 93 showed
that a cross-site iframe chooser's `backendNodeId` B, sent on the PAGE session, names "a `#document`"
and declared (limit 3) that it did not say *whose* document or why. Round 94 binds whose — the
parent's own root — and produces the other branch of the same lookup: a B that the parent renderer
never minted resolves to no node at all. Both branches are the same operation seen from two sides of
the parent's id counter.

## The law in one sentence

*Measured (9/9 legs, 3 reps × 3 arms):* a `backendNodeId` reported on an out-of-process iframe's
session, sent on the parent page's session, is looked up in the **parent renderer's** id map — so it
either **collides** with whatever node the parent renderer happened to number B (with an unpadded
child: the parent's own root, a `#document` whose `backendNodeId` is B and whose `documentURL` is the
parent URL, and `DOM.setFileInputFiles` there fails with "Node is not a file input element"), or
**misses** (with 300 painted elements before the input: B is larger than every id in the parent's
tree, so `DOM.describeNode` and `DOM.setFileInputFiles` both answer "No node found for given backend
id"); on the same-site control the page session owns the input and B names it.

*Explained (S231–S234, not a predicate clause):* the integer is the node's own DOM node id
(`BuildObjectForNode` → `IntIdForNode` (S233) → `GetDomNodeId` (S234) → `DOMNodeIds::IdForNode`
(S232)), minted from a counter that is static per renderer **PROCESS**, and `AssertNode` resolves a
sent id with `NodeForId` (S231/S232) in the process that receives the command. Two renderers number
their nodes independently from 1, so a foreign id is either somebody else's node or nobody's.

## What was measured

Scored receipt `corpus/evidence/round94/chromium-oopif-backendnode-collision/receipt.json` (legs
C-1, M-1, S-1, C-2, M-2, S-2, C-3, M-3, S-3; a fresh browser and profile per leg; parent
`http://127.0.0.1:<http>/parent.html?leg=<id>`, child
`http://<host>:<child>/child.html?leg=<id>&pad=<p>`; the child carries `p` painted `<span>x</span>`
elements followed by one file input `#s`; the click on `#s`'s centre is sent on the PAGE session and
the chooser event carries B):

| arm | child host / pad | chooser session, B | page `describeNode(B)` | page root id | page tree max id | page `setFileInputFiles(B)` | chooser-session answer |
|---|---|---|---|---|---|---|---|
| C | `localhost` / 0 | iframe, B = 2 | `#document`, backendNodeId 2, `documentURL` = parent URL | 2 (= B) | 15 (≥ B) | "Node is not a file input element", files `[]` | ok, `[["tabi-r94-answer.txt",22]]` |
| M | `localhost` / 300 | iframe, B = 302 | "No node found for given backend id" | 2 (≠ B) | 15 (< B) | "No node found for given backend id", files `[]` | ok, same file |
| S | `127.0.0.1` / 300 | page, B = 305 | `INPUT` type=file id=s, backendNodeId 305 | 2 | 635 (≥ B) | — (same session) | ok, same file |

Every leg in all three reps carried these same numbers (B = 2 / 302 / 305; page-tree maxima 15 / 635).
The predicate binds the **relations** (= the page root id, ≥ / < the tree maximum), not the numbers;
the numbers are what this fixture produced.

The two cross-site arms (C and M) differ in one thing only — how many ids the child renderer had
minted before the chooser reported B — and that difference decides the outcome on the page session:

* **C (collision).** The child renderer had minted almost nothing, so B = 2. The parent renderer had
  independently numbered *its own* root document 2. Sending B to the page session therefore hit a
  live node: `DOM.describeNode` succeeded and returned the parent's `#document` (same
  `documentURL` = the parent URL, same `backendNodeId` = B = the page's `DOM.getDocument {depth: 0}`
  root id). The id was not "wrong" — it was a valid id in the receiving renderer, just for a different
  node. `DOM.setFileInputFiles` then refused it with "Node is not a file input element" and the
  child's `files` stayed `[]`: the answer was not delivered, and the error names the *type* of the
  resolved node, not the origin of the id.
* **M (miss).** The child renderer had numbered the input 302 instead of 2 — 300 ids later, and the
  pad is 300, so (probe observation, not a predicate clause — limit 3) the painted content ahead of
  the input is what moved the child's numbering — so B = 302 is larger than every id in the parent's
  pierced tree (max 15). The parent renderer's map has no 302, so
  `DOM.describeNode` and `DOM.setFileInputFiles` both answer "No node found for given backend id",
  and the child's `files` stay `[]`.
* **S (control).** Child host `127.0.0.1`: the iframe has no target of its own, parent and child
  share one renderer, so B (305) is an id in the page session's own map and names the input. The
  page's pierced tree holds exactly one `INPUT#s` and reaches id 635. No cross-session answer is
  sent in this arm — it is a control, not a failure case.

The arm discriminator is the target model, not the URL: C and M have exactly one attached `iframe`
target and one listed `iframe` target (same `targetId`, equal to the child frame id, URL = the child
URL); S has zero of each.

```sh
jq -r '.legs[]|[.leg,(.attached|length),(.browserIframeTargets|length),.choosers[0].session,
 (.choosers[0].backendNodeId|tostring),(.describePage.nodeName//"null"),(.describePage.error//"null"),
 (.pageRoot.backendNodeId|tostring),(.pagePierce.inputS|tostring),(.pagePierce.maxBackendNodeId|tostring),
 (.crossAnswer.error//"null"),(.filesAfterCross|tostring),(.childFiles|tostring)]|@tsv' \
 .ufo/waves/round-94/scored/live-receipt.json
```

Scored output (all nine legs, verbatim from that command; columns are tab-separated):

```
C-1	1	1	iframe	2	#document	null	2	0	15	Node is not a file input element	[]	[["tabi-r94-answer.txt",22]]
M-1	1	1	iframe	302	null	No node found for given backend id	2	0	15	No node found for given backend id	[]	[["tabi-r94-answer.txt",22]]
S-1	0	0	page	305	INPUT	null	2	1	635	null	null	[["tabi-r94-answer.txt",22]]
C-2	1	1	iframe	2	#document	null	2	0	15	Node is not a file input element	[]	[["tabi-r94-answer.txt",22]]
M-2	1	1	iframe	302	null	No node found for given backend id	2	0	15	No node found for given backend id	[]	[["tabi-r94-answer.txt",22]]
S-2	0	0	page	305	INPUT	null	2	1	635	null	null	[["tabi-r94-answer.txt",22]]
C-3	1	1	iframe	2	#document	null	2	0	15	Node is not a file input element	[]	[["tabi-r94-answer.txt",22]]
M-3	1	1	iframe	302	null	No node found for given backend id	2	0	15	No node found for given backend id	[]	[["tabi-r94-answer.txt",22]]
S-3	0	0	page	305	INPUT	null	2	1	635	null	null	[["tabi-r94-answer.txt",22]]
```

## The Blink chain (S231 + S232 + S233 + S234 — the knowledge entry's reading, not a predicate clause)

**How the number is produced.** `BuildObjectForNode` stamps every node record it serializes with
`IdentifiersFactory::IntIdForNode(node)` (S231, `inspector_dom_agent.cc:2546`). `IntIdForNode` is a
one-line delegation to the node itself — `return node->GetDomNodeId();` (S233,
`identifiers_factory.cc:119-120`) — and `GetDomNodeId` is `return DOMNodeIds::IdForNode(this);`
(S234, `node.cc:354-355`). `IdForNode` (S232, `dom_node_ids.cc:48-61`) hands out a fresh id from a
**file-static counter** (`DOMNodeId g_last_id = 0;`, line 18) and records `id → node` in a
**file-static map** (`IdToNodeMap()`, lines 28-34, a `DEFINE_STATIC_LOCAL`
`Persistent<GCedHeapHashMap<DOMNodeId, WeakMember<Node>>>`). Both statics live inside the Blink
*renderer*, so each renderer process has its own counter and its own map, and each renderer numbers
its own nodes from 1.

**How the number is consumed.** `DOM.describeNode` and `DOM.setFileInputFiles` both begin at
`InspectorDOMAgent::AssertNode` (S231, lines 636-649). When only a `backendNodeId` is given, that
function calls `DOMNodeIds::NodeForId(backend_node_id.value())` — **the receiving renderer's** lookup
— and, if the id is absent from that map, answers "No node found for given backend id" (S231, lines
647-649). If it is present, the resolved node is used; if that node is not a file input,
`setFileInputFiles` answers "Node is not a file input element" (S231, line 1809).

So the chain is: a node record's `backendNodeId` is minted by the renderer that *owns* the node
(S233 → S234 → S232), and a `backendNodeId` sent on a session is resolved by the renderer that
*receives* the command (S231 → S232). When those two renderers differ — a cross-site iframe is a
separate renderer process — the id crosses a numbering space that has no shared meaning.

Two consequences, both observed here:

1. **The integer is not global.** The cross-site child runs in its own renderer (site isolation,
   `localhost` vs `127.0.0.1`), so the child's `INPUT` was minted id 2 in *that* process's map; the
   parent renderer independently minted id 2 for *its own* `#document`. Sending B=2 to the page
   session therefore did not hit a hole — it hit the parent's document node.
2. **The error text tells you which branch you are in.** "No node found for given backend id" means
   the id is absent from the receiving process's map (the M arm). "Node is not a file input element"
   means the id **did** resolve — to the wrong node (the C arm). A collision is silent at
   `describeNode` time and only surfaces as a type complaint at answer time.

## Practical rule for a CDP client

1. **Answer a chooser only on the session it arrived on.** Read `Page.fileChooserOpened`'s session
   and send `DOM.setFileInputFiles {files:[…], backendNodeId:<that event's B>}` there. In the
   cross-site arms that is the iframe session; in the same-site arm it is the page session.
2. **Never reuse a `backendNodeId` captured on another session.** A foreign id can name an
   unrelated node of the other renderer instead of failing — here the parent `#document` — so the
   *error* is the lucky outcome. Re-read the id on the session that received the event, or convert
   it there with `DOM.pushNodesByBackendIdsToFrontend` and use the resulting `nodeId`.
3. **Read the error text as a diagnosis.** "No node found for given backend id" = the id was never
   in the receiving renderer's map; "Node is not a file input element" = the id resolved, to a node
   that is not an input. The second is the dangerous one: the id resolved *silently*, and nothing in
   the reply says "wrong node" — only that the node's type is not a file input. **[INFERENCE, not
   measured here]** a collision with another element's id would deliver the file to that element
   instead of failing; this round's collision happened to land on a `#document`.
4. **Expect the outcome to depend on page content, not on the client.** Whether a foreign id
   collides or misses depends on how many ids each renderer has minted so far, so the same client
   code can collide on one page and miss on another. Which session to expect is decided by the
   target model (a cross-site iframe arrives as an attached `iframe` target, a same-site iframe does
   not), not by the URL.

## Pre-freeze probes (observations; plan limit 3 — not predicate clauses)

`.ufo/waves/round-94/probes/`, run by the L1 while building the driver, before the frozen bytes;
receipts from earlier driver bytes, not scored:

| probe | child pad shape | pre-click serialization | B (M arm) | outcome on the page session |
|---|---|---|---|---|
| `probe1-hidden-pad-preserialize-receipt.json` | 300 `display:none` empty spans | yes, iframe-session `DOM.getDocument {depth:-1}` (child tree max id 318) | 2 | collision (`#document`, "Node is not a file input element") |
| `probe2-painted-pad-preserialize-receipt.json` | 300 painted `<span>x</span>` | yes, iframe-session `DOM.getDocument {depth:-1}` (child tree max id 618) | 302 | miss ("No node found for given backend id") |
| `probe3-painted-pad-receipt.json` | 300 painted `<span>x</span>` | none | 302 (C: 2, S: 305) | miss (C: collision, S: the input) |

What the probes do and do not establish: the outcome tracked **painted** content ahead of the input,
not the mere presence of 300 elements and not a serialization before the click (probe1 serialized and
still collided; probe2 serialized and still missed; probe3 without serialization reproduced
probe2). Consistent with S234, a caller of `GetDomNodeId` mints an id on demand, so any
serialization can advance a renderer's counter. **Which caller minted the input's id first — paint,
accessibility, serialization or the chooser itself — is NOT established**, and **no threshold
between pad 0 and pad 300 is claimed**; the frozen claim states two fixture shapes, not a boundary
(plan limit 3).

## Limits (copied from `plans/round-94.md` §Declared limits, in substance)

1. One Chromium build (155.0.8059.84, Arch Linux package via `/usr/bin/chromium` with the host
   user's `chromium-flags.conf`), `--headless=new` only; headed mode, other builds and other OSes are
   unmeasured.
2. "Different site" is realised only as `localhost` vs `127.0.0.1`.
3. The claim states what B resolves to on the page session in two fixture shapes (pad 0 and pad 300).
   It does NOT state when or by whom the child renderer minted B, nor that a padding threshold
   exists between 0 and 300; the probes above are observations, not predicate clauses. S231–S234 are
   the knowledge entry's explanation.
4. One `backendNodeId` per leg (the chooser's), fresh browsers; longer-lived renderers, other page
   shapes and the order "correct-session answer first" are unmeasured.
5. The chooser is intercepted (`Page.setInterceptFileChooserDialog`) and answered programmatically;
   no dialog UI is observed. "Exactly one" chooser means within the 1500 ms window after the click.
6. The counter in `--receipt` mode reads a file: a forger who writes a whole consistent receipt passes
   that mode. The claim's counting command is `--live`. `--reps` other than 3 measures other legs;
   the claim is the default.

## What is NOT measured

- **Not a general law about "the other session always fails".** Only this id (B), this session pair
  and these two fixture shapes are measured; the claim is what B *names* on the other session
  (limit 4).
- **Not a threshold, not a minting order.** pad 0 and pad 300 are two points, not a boundary; who
  minted the input's id first is unestablished (limit 3, and the probe table above).
- **No dialog UI** (limit 5); **no headful, other build, other OS** (limit 1); **no other site
  pair** (limit 2); **no longer-lived renderer, no other id, no reverse answer order in the claim**
  (limit 4).
- **No receipt-mode forgery resistance** (limit 6 — the claim's counting command is `--live`).
- **The 1500 ms window and the "collect choosers across all sessions" behaviour are driver
  behaviour**, not counter-enforced fields.
- **The answer file's 22 bytes are never read back** — the child's `files` reader reports name+size
  only, so the delivered content is not part of the measurement.
- **The error strings are compared exactly**, case- and whitespace-sensitive.
- **[INFERENCE]** The "collision lands on a `#document`" outcome is a property of this fixture (the
  parent's root happened to be id 2); a different parent document could collide with another node.

## Evidence

- Plan, frozen predicate, declared limits: `plans/round-94.md`; freeze commit `2308b6ce`
  (`claims.json.frozenAt` 21:49:37 -03:00), scored commit `012776cf`.
- Scored live run: `.ufo/waves/round-94/scored/c1-live.json` — `verdict: clean`, `checkCount: 165`,
  `findings: []`, `mode: live`, `nonce: tabi-r94-live-240f4c5100c3`,
  `driverSha256: 518f40ff9b34727254a3bb0cd30603c70ce8488a911fa3a26a55273220f9686f`,
  `receiptSha256: 8070fcdc787189a18cb888da20765579bfe0240fa53d16264301fcf7ffc37354`.
  The 165 checks re-derive as 12 receipt-level checks (schema, nonce, driver-pin, chromium,
  cross-host, reps, pad, answer, ports, leg-set, failures, fresh-browser) + 17 per leg × 9 legs
  (leg-arm, leg-error, browser-version, child-host, leg-pad, child-url, parent-url, iframe-targets,
  chooser, describe-chooser, describe-page, page-root, page-pierce, cross-answer, answer,
  child-files, child-click).
- Scored receipt: `.ufo/waves/round-94/scored/live-receipt.json` — `schema
  tabi-chrome-cdp-backendnode-collision-r94`, `chromium "Chromium 155.0.8059.84 Arch Linux"`,
  `crossHost "localhost"`, `reps 3`, `pad 300`, `answer {"name":"tabi-r94-answer.txt","size":22}`,
  `ports {19531,19532,19533}`, `failures []`, 9 legs in the order C-1, M-1, S-1, C-2, M-2, S-2, C-3,
  M-3, S-3, nine distinct `browserId`s, every leg `browserVersion "Chrome/155.0.8059.84"`, every leg
  `childFiles [["tabi-r94-answer.txt",22]]` and `childClicks [{"target":"s","isTrusted":true}]`.
- Counter: `scripts/check-backendnode-collision-round94.mjs` (sha256
  `d7fd2cbe0899ec59b639752d99f3cd22594dbe600300596cdcc6ce30abf2a95a`).
- Counting command (the claim's, `--live`):

  ```sh
  node scripts/check-backendnode-collision-round94.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
    --expect-driver-sha256 518f40ff9b34727254a3bb0cd30603c70ce8488a911fa3a26a55273220f9686f \
    --live --scratch <ABS scratch> --ports <http,child,cdp> --json
  ```

- Controls (all committed with the freeze, before the scored run): `.ufo/waves/round-94/controls/`
  — no-work at base (rc 128), no-work on the r93 receipt (rc 1), wrong-site live run (rc 1 with the
  behaviour ids), pad-0 live run (rc 1), positive (rc 0, 165 checks, 0 findings), busy-port setup
  (rc 2 `setup`), counter SIGTERM (rc 2 `setup`, 0 chromium left), driver SIGKILL (rc 2 `setup`, 14
  swept, 0 left), forgery battery 74/74; exit codes in `controls/rc.txt`.
- Instruments: `scripts/chrome-cdp-backendnode-collision-round94.mjs` (driver, sha256 `518f40ff…`),
  `scripts/check-backendnode-collision-round94.mjs` (counter, sha256 `d7fd2cbe…`),
  `scripts/negatives-backendnode-collision-round94.mjs` (battery, sha256 `b750ee17…`) — digests in
  `.ufo/waves/round-94/controls/instrument-sha256.txt`.
- Sources: `.ufo/waves/round-94/sources/` (`identifiers_factory.cc`, `node.cc`), digests in
  `.ufo/waves/round-94/sources/sha256.txt`; both files were re-fetched from
  `chromium.googlesource.com` at tag 155.0.8059.84 on 2026-11-08 and are byte-identical to the
  staged copies.
