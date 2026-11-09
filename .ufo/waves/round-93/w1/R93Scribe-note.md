---
source: S231 (Blink `inspector_dom_agent.cc` at Chromium tag 155.0.8059.84 — `AssertNode` resolves a `backendNodeId` through `DOMNodeIds::NodeForId` (lines 636-649; the miss branch at 647-649 answers "No node found for given backend id") and `setFileInputFiles` answers "Node is not a file input element" for a node that is not a file input (lines 1795-1810, error at 1809)), S232 (Blink `dom_node_ids.cc` at tag 155.0.8059.84 — one process-static id counter `g_last_id` (line 18) and one process-static id→node map `IdToNodeMap()` (lines 28-34); `IdForNode` mints from that counter (48-61) and `NodeForId` reads that map (69-78)); staged copies `.ufo/waves/round-93/sources/` (digests in `.ufo/waves/round-93/sources/sha256.txt`: `dom_node_ids.cc` 33f40333b67fb9a00071dcd69131671ac007da23c3755f0c2777bcbdb4d40e3b, `inspector_dom_agent.cc` e7c983b4b00f47757dbb29c69a129693b8ac61a2e0e60643aa124bbae203c84f); receipt `.ufo/waves/round-93/scored/live-receipt.json` (driver `scripts/chrome-cdp-cross-session-answer-round93.mjs`, sha256 pin `a0deddda855a3eb48f9dd02f6d01eee0f607e9ab319dd74c6182c1d9ecc9a4a0` in `.ufo/waves/round-93/controls/instrument-sha256.txt`)
verified-at: 2026-11-08 (round 93, Linux host, Chromium 155.0.8059.84 `--headless=new`; scored run `.ufo/waves/round-93/scored/c1-live.json`, nonce `tabi-r93-live-b39038e077b0`, verdict `clean`, 101 checks, 0 findings)
recheck: `node scripts/check-cross-session-answer-round93.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin --expect-driver-sha256 a0deddda855a3eb48f9dd02f6d01eee0f607e9ab319dd74c6182c1d9ecc9a4a0 --receipt .ufo/waves/round-93/scored/live-receipt.json --expect-nonce tabi-r93-live-b39038e077b0 --json` → exit 0, `verdict: clean`, 101 checks (receipt mode; the claim's counting command is the `--live` form in §Evidence)
---

# The cross-site iframe's chooser id on the WRONG session — what a `backendNodeId` names when it crosses sessions

Capability `chromium-oopif-backendnode-scope-linux` (new, first-working round 93). Round 92 measured
*which CDP session* a chooser opened inside an iframe arrives on and proved the answer must be sent
there; it declared, as limit 5, that answering on the other session was unmeasured. Round 93 moves
that surface: **the same chooser id, sent on the other session, silently names a different node.**

## The law in one sentence

*A CDP `backendNodeId` is scoped to the renderer process that minted it, so on any other session it
resolves — or silently mis-resolves — to whatever node that other process happens to hold under the
same integer, and a file chooser must therefore be answered on the session the chooser arrived on.*

## The fixture

One parent document at `http://127.0.0.1:<http>/parent.html?leg=<id>` holds one iframe whose child
document at `http://<childHost>:<child>/child.html?leg=<id>` carries one file input `#s` (plus a
`click` recorder and a `files` reader). Six legs: arms **X** (child host `localhost` — a different
site, own `iframe` target) and **S** (child host `127.0.0.1` on another port — same site, no own
target), three repetitions each, one fresh browser and profile per leg, run in the order
X-1, S-1, X-2, S-2, X-3, S-3. Per leg the driver clicks `#s`'s centre with
`Input.dispatchMouseEvent` **on the page session**, collects `Page.fileChooserOpened` for 1500 ms
across all sessions, and with the event's `backendNodeId` **B** asks `DOM.describeNode` and
`DOM.setFileInputFiles` on **both** sessions. Scored receipt ports: http 19361, child 19362, cdp
19363.

## The five per-leg observations (arm X — the cross-site arm)

Every cell is a receipt field; the jq that prints the whole table is under the table.

| # | observation | X (child `localhost`) | S (child `127.0.0.1`) | receipt path |
|---|---|---|---|---|
| 1 | the session the chooser arrived on | the **iframe** session | the **page** session | `legs[i].choosers[0].session` |
| 2 | `DOM.describeNode {backendNodeId: B}` on the chooser's own session | `INPUT`, attrs `type=file, id=s` | `INPUT`, attrs `type=file, id=s` | `legs[i].describeChooser` |
| 3 | `DOM.describeNode {backendNodeId: B}` on the **page** session | no error, `nodeName` **`#document`** | no error, `nodeName` **`INPUT`** (`type=file, id=s`) | `legs[i].describePage` |
| 4 | `DOM.setFileInputFiles {backendNodeId: B}` on the **page** session (the other session) | error exactly **`Node is not a file input element`**; the child input's `files` then read **`[]`** (no file delivered) | not attempted (no cross-session answer is sent); the page-session answer returns no error | `legs[i].crossAnswer`, `legs[i].filesAfterCross` |
| 5 | `DOM.setFileInputFiles {backendNodeId: B}` on the **chooser's own session** | no error; the child input's `files` then read `[["tabi-r93-answer.txt", 22]]` | no error; `files` then read `[["tabi-r93-answer.txt", 22]]` | `legs[i].answer`, `legs[i].childFiles` |

```sh
jq -r '.legs[]|[.leg,(.attached|length),(.browserIframeTargets|length),.choosers[0].session,
 (.choosers[0].backendNodeId|tostring),.describeChooser.nodeName,.describePage.nodeName,
 (.pagePierceInputS|tostring),(.crossAnswer.error//"null"),(.filesAfterCross|tostring),
 .answer.session,(.answer.error//"null"),(.childFiles|tostring)]|@tsv' \
 .ufo/waves/round-93/scored/live-receipt.json
```

Scored output (all six legs, verbatim from that command):

```
X-1  1  1  iframe  2  INPUT  #document  0  Node is not a file input element  []  iframe  null  [["tabi-r93-answer.txt",22]]
S-1  0  0  page    5  INPUT  INPUT      1  null                           null page   null  [["tabi-r93-answer.txt",22]]
X-2  1  1  iframe  2  INPUT  #document  0  Node is not a file input element  []  iframe  null  [["tabi-r93-answer.txt",22]]
S-2  0  0  page    5  INPUT  INPUT      1  null                           null page   null  [["tabi-r93-answer.txt",22]]
X-3  1  1  iframe  2  INPUT  #document  0  Node is not a file input element  []  iframe  null  [["tabi-r93-answer.txt",22]]
S-3  0  0  page    5  INPUT  INPUT      1  null                           null page   null  [["tabi-r93-answer.txt",22]]
```

Two facts sit behind observation 3/4 and are the reason the cross-site arm fails where the
same-site arm cannot fail: the X arm's child is its own target (one attached `iframe` target, one
`iframe` target in `Target.getTargets`, same `targetId`, equal to the child frame id) while the S arm
has zero `iframe` targets — and the page session's pierced `DOM.getDocument {depth:-1, pierce:true}`
holds **0** `INPUT#s` in X and exactly **1** in S
(`jq -r '.legs[]|[.leg,(.pagePierceInputS|tostring)]|@tsv' .ufo/waves/round-93/scored/live-receipt.json`).
So in X the id B=2 that the iframe session reads as the child's `INPUT` is read by the page session
as a `#document` — a node that is not in the child's document at all.

```sh
jq -r '.legs[]|[.leg,(.attached|length),(.browserIframeTargets|length)]|@tsv' \
 .ufo/waves/round-93/scored/live-receipt.json
# X-1 1 1 / S-1 0 0 / X-2 1 1 / S-2 0 0 / X-3 1 1 / S-3 0 0
```

## The Blink explanation (S231 + S232 — the knowledge entry's reading, not a predicate clause)

`DOM.setFileInputFiles` and `DOM.describeNode` both begin at `InspectorDOMAgent::AssertNode`
(S231, `inspector_dom_agent.cc:636-649`). When only a `backendNodeId` is given, that function calls
`DOMNodeIds::NodeForId(backend_node_id.value())` — **the receiving renderer's** lookup — and, if the
id is absent from that map, answers `"No node found for given backend id"` (S231, line 647-649).

The ids themselves are minted and stored per renderer process (S232, `dom_node_ids.cc`): a single
file-static counter `DOMNodeId g_last_id = 0;` (line 18) hands out ids through `NextId()`
(lines 21-26), and a single file-static map `IdToNodeMap()` (lines 28-34, a `DEFINE_STATIC_LOCAL`
`Persistent<GCedHeapHashMap<DOMNodeId, WeakMember<Node>>>`) records `id → node`; `IdForNode`
(48-61) inserts, `NodeForId` (69-78) reads. Both statics live in the Blink *renderer*, so each
renderer process has its own counter and its own map.

Two consequences, both observed here:

1. **The integer is not global.** The cross-site child runs in its own renderer (site isolation,
   r92's `localhost` vs `127.0.0.1` split), so the child's `INPUT` was minted id 2 in *that*
   process's map; the parent renderer independently minted id 2 for *its own* `#document`. Sending
   B=2 to the page session therefore does not hit a hole — it hits the parent's document node.
2. **The error text tells you which case you are in.** `"No node found for given backend id"` would
   mean the id was absent from the receiving process's map. The observed error is instead
   `"Node is not a file input element"` (S231, line 1809 — reached because the resolved node is not
   an `HTMLInputElement` with `FormControlType::kInputFile`), which means the id **did** resolve,
   to the wrong node. A collision is silent at `describeNode` time and only surfaces as a type
   complaint at answer time.

In the same-site arm both documents share one renderer, so one map holds the ids and B=5 names the
`INPUT` on the page session too.

## The practical rule for a CDP client

1. **Answer a chooser only on the session it arrived on.** Read `Page.fileChooserOpened`'s session
   and send `DOM.setFileInputFiles {files:[…], backendNodeId:<that event's B>}` there. In the
   cross-site arm that is the iframe session; in the same-site arm it is the page session.
2. **A `backendNodeId` from another session can silently name a different node** — here the parent
   `#document` — **rather than fail with "No node found"**. So a "not a file input element" error on
   a chooser answer is the symptom of an id crossing a process boundary, not of a wrong element.
   The safe diagnosis is to re-read the id on the session that received the event, never to reuse
   an id captured on another session.
3. `DOM.describeNode` on the other session is a cheap probe: in X it returns a `#document` (no
   error), in S the `INPUT` itself. The predicate binds only the `nodeName` `#document`; it does not
   bind *whose* document that is — see limit 3 and the wave probe below.
4. To decide which session to expect, use the target model, not the URL: a cross-site iframe arrives
   as an attached `iframe` target (and its `targetId` is the child frame id), a same-site iframe does
   not (round 92's rule, unchanged here).

**Wave probe beyond the claim (round-93 w1):** the *identity* of the `#document` the page session
names in X is the **parent** document. R93Critic3 (`.ufo/waves/round-93/w1/R93Critic3.md`,
`R93Critic3-results.json`) probed, in 3/3 X legs, that the page session's `DOM.getDocument{depth:0}`
root has `backendNodeId` == B (2), `nodeName` `#document` and `documentURL` ==
`http://127.0.0.1:<http>/parent.html?leg=<id>`, and that `DOM.describeNode(B)` on the page session
equals that same root. This is consistent with the S232 reading (the parent renderer minted id 2 for
its own document) and is **outside** the frozen wording (limit 3); the counter binds only
`describePage.nodeName === '#document'` and never reads `frameId`/`documentURL`.

## Limits (copied from `plans/round-93.md` §Declared limits, in substance)

1. One Chromium build (155.0.8059.84, Arch Linux package, launched through `/usr/bin/chromium` with
   the host user's `chromium-flags.conf`), `--headless=new` only; headed mode, other builds and other
   OSes are unmeasured.
2. "Different site" is realised only as `localhost` vs `127.0.0.1` (r92 limit 2 and W6).
3. The claim states WHICH node the page session names only as "a `#document` node"; it does not
   state whose document it is (no `frameId`/`documentURL` is bound) nor why that id maps to it. The
   source reading (S231/S232) is the knowledge entry's explanation, not a predicate clause.
4. One backendNodeId per leg (the chooser's), one DOM shape (a lone file input at a fixed position),
   fresh browsers; other node ids, longer-lived renderers and other page shapes are unmeasured. The
   cross-session answer is sent before the correct-session answer; the reverse order is unmeasured.
5. The chooser is intercepted (`Page.setInterceptFileChooserDialog`) and answered programmatically;
   no dialog UI is observed. "Exactly one" chooser means within the 1500 ms window after the click.
6. The counter in `--receipt` mode reads a file: a forger who writes a whole consistent receipt
   passes that mode. The claim's counting command is `--live`. `--reps` other than 3 measures other
   legs; the claim is the default.

## What is NOT measured

- **Not "the other session always fails".** Only this id (B) on this session pair is measured; the
  claim is what B *names* on the other session, not a general failure law (limit 4).
- **No whose-document binding in the predicate.** The receipt records `describePage.frameId` but the
  counter reads only `session`/`error`/`nodeName`; the parent-document identity is the w1 probe
  above, not the claim (limit 3).
- **No native dialog** (limit 4); **no headful, other build, other OS** (limit 1); **no other site
  pair** (limit 2); **no reverse answer order, other id, longer-lived renderer** (limit 4).
- **No receipt-mode forgery resistance** (limit 6 — the claim's counting command is `--live`).
- **The 1500 ms window and "across all sessions" collection are driver behaviour**, not
  counter-enforced fields.
- **The answer file's 22 bytes are never read back** — the child's `files` reader reports
  name+size only, so the delivered content is not part of the measurement.
- **The error string is exactly compared, case- and whitespace-sensitive**
  (`l.crossAnswer.error === CROSS_ERROR`).

## Evidence

- Scored live run: `.ufo/waves/round-93/scored/c1-live.json` — `verdict: clean`, `checkCount: 101`,
  `findings: []`, `mode: live`, `nonce: tabi-r93-live-b39038e077b0`,
  `driverSha256: a0deddda855a3eb48f9dd02f6d01eee0f607e9ab319dd74c6182c1d9ecc9a4a0`.
  `jq -c '{verdict,mode,checkCount,findings:(.findings|length),nonce,driverSha256}' \
   .ufo/waves/round-93/scored/c1-live.json`
- Scored receipt: `.ufo/waves/round-93/scored/live-receipt.json` — `schema
  tabi-chrome-cdp-cross-session-answer-r93`, `chromium "Chromium 155.0.8059.84 Arch Linux"`,
  `crossHost "localhost"`, `reps 3`, `answer {"name":"tabi-r93-answer.txt","size":22}`,
  `ports {19361,19362,19363}`, `failures []`, 6 legs in order X-1,S-1,X-2,S-2,X-3,S-3, six distinct
  `browserId`s, every leg `browserVersion "Chrome/155.0.8059.84"`, every leg `childFiles
  [["tabi-r93-answer.txt",22]]` and `childClicks [{"target":"s","isTrusted":true}]`.
  `jq -c '{schema,nonce,chromium,crossHost,reps,answer,ports,failures:(.failures|length)}' \
   .ufo/waves/round-93/scored/live-receipt.json`
- Counter: `scripts/check-cross-session-answer-round93.mjs` (sha256
  `3c721b668e553050ed6450d7b2e1881a864d191ef243ce410c37d5f04e36f1e3`), 101 checks = 11
  receipt-level (`schema, nonce, driver-pin, chromium, cross-host, reps, answer, ports, leg-set,
  failures, fresh-browser`) + 15 per leg × 6 legs.
- Counting command (the claim's, `--live`):

  ```sh
  node scripts/check-cross-session-answer-round93.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
    --expect-driver-sha256 a0deddda855a3eb48f9dd02f6d01eee0f607e9ab319dd74c6182c1d9ecc9a4a0 \
    --live --scratch <ABS scratch> --ports <http,child,cdp> --json
  ```

- Controls (all committed with the freeze, before the scored run): `.ufo/waves/round-93/controls/` —
  no-work at base (rc 128), no-work on the r92 receipt (rc 1), wrong-site live run (rc 1 with the
  behaviour ids), positive (rc 0, 101 checks, 0 findings), busy-port setup (rc 2 `setup`), forgery
  battery (65/65 killed); exit codes in `controls/rc.txt`.
- Instruments: `scripts/chrome-cdp-cross-session-answer-round93.mjs` (driver, sha256
  `a0deddda…9a4a0`), `scripts/check-cross-session-answer-round93.mjs` (counter),
  `scripts/negatives-cross-session-answer-round93.mjs` (battery) — digests in
  `.ufo/waves/round-93/controls/instrument-sha256.txt`.
- Sources: `.ufo/waves/round-93/sources/` (`dom_node_ids.cc`, `dom_node_ids.h`,
  `inspector_dom_agent.cc`), digests in `.ufo/waves/round-93/sources/sha256.txt`; the two files this
  note quotes were re-fetched from `chromium.googlesource.com` at tag 155.0.8059.84 and their
  sha256 match the staged copies.
