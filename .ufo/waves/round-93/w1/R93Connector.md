# R93Connector — sibling-overlap scan for C1 (CDP `backendNodeId` scope across sessions)

Seat R93Connector (leaf). Round 93, wave w1. Read-only: no browser launched, no git/jj mutation, no
subagents. Scratch `/fast/scratch/hyaku/tabi-r93/R93Connector` created and removed (empty; this seat
produced no run artifacts). No ports used, so no chromium process of mine can exist.

Claim scanned: `plans/round-93.md` §Claim — predicate `C1-CROSS-SESSION-ANSWER-R93`: in arm X the
cross-site iframe chooser's `backendNodeId` B, sent on the PAGE session, names a `#document`
(`DOM.describeNode`), and `DOM.setFileInputFiles(B)` there fails with exactly `Node is not a file input
element` delivering no file, while the iframe session names the INPUT and answers; in arm S the page
session names the INPUT and answers.

## Commands run (exact; rc in brackets)

```
# assigned terms over every sibling lane corpus, six file types
for t in backendNodeId setFileInputFiles fileChooserOpened OOPIF out-of-process; do
  grep -ril --include='*.md' --include='*.txt' --include='*.json' --include='*.mjs' \
       --include='*.js' --include='*.ts' -e "$t" */corpus/ | grep -v '^tabi-shokunin/' | wc -l; done
  [rc 0]  → 0, 0, 0, 0, 4
# same five terms, sibling corpus/knowledge only ( *.md )
grep -ril --include='*.md' -e <term> */corpus/knowledge/ | grep -v '^tabi-shokunin/' | wc -l
  [rc 0]  → 0, 0, 0, 0, 0
# case-insensitive variants backendnode / setfileinput / filechooseropened / oopif / attachedtotarget
grep -ril <variant> */corpus/ | grep -v '^tabi-shokunin/'          [rc 1, no output, all five]
# widened sibling terms: backend_node_id, targetId, setAutoAttach, attachedToTarget, 'page session',
# 'iframe target', 'attached target', 'auto-attach', 'site-per-process', 'site isolation', describeNode
grep -ril --include='*.md' --include='*.txt' -e <term> */corpus/ | grep -v '^tabi-shokunin/'
  [rc 0/1 per term]  → see table; zero for every CDP session/target-model term
# tabi's own corpus (excluding node_modules)
grep -ril --include='*.md' -e <assigned term> tabi-shokunin/corpus/ | grep -v node_modules | wc -l
  [rc 0]  → backendNodeId 29, setFileInputFiles 26, fileChooserOpened 30, OOPIF 5, out-of-process 1
grep -rn --include='*.md' -e backendNodeId -e setFileInputFiles -e fileChooserOpened corpus/knowledge/
  [rc 0, 97 lines]
# scored artifact read
node -e '<read .ufo/waves/round-93/scored/live-receipt.json>'                        [rc 0, 6 legs]
grep -n 'out-of-process' corpus/SOURCES.md ; grep -rn OOPIF corpus/                 [rc 0]
```

Deviation disclosed: one intermediate command captured grep output in `/tmp/x.$$` (removed in the same
command). No artifact of it remains; nothing else was written under `/tmp`.

## 1. Sibling lanes — zero overlap on C1's surface

20 sibling lanes, all `*/corpus/**` (md/txt/json/mjs/js/ts). Four of the five assigned terms return
**0 files in every sibling lane**, including case-insensitive variants. There is **no sibling statement
that asserts, denies, measures or duplicates** cross-session `backendNodeId` resolution,
`DOM.setFileInputFiles`, `Page.fileChooserOpened`, or OOPIF sessions.

| term | sibling files (all types) | sibling `corpus/knowledge` files |
|---|---|---|
| `backendNodeId` (+ `backendnode`, `backend_node_id`) | 0 | 0 |
| `setFileInputFiles` (+ `setfileinput`) | 0 | 0 |
| `fileChooserOpened` (+ `filechooseropened`) | 0 | 0 |
| `OOPIF` / `oopif` | 0 | 0 |
| `out-of-process` | 4 | 0 |
| `setAutoAttach` / `attachedToTarget` / `describeNode` / `site-per-process` / `page session` / `iframe target` | 0 | 0 |

The only four `out-of-process` files, all **unrelated** (the phrase means "out-of-process *harness/tool*
execution", not Chromium's process model):

| lane | path:line | what it says | relation |
|---|---|---|---|
| kengaku | `corpus/evidence/round50/c1-receipt.txt:1` | "out-of-process harness, Q39 name hiding" | unrelated |
| kengaku | `corpus/lessons/round-50-verifier-spotcheck.md:193` | same receipt, digest change | unrelated |
| tameshi | `corpus/lessons/round-41-verifier-spotcheck.md:71` | routed item "out-of-process tool execution" | unrelated |
| tameshi | `corpus/routed-defects.json:127` | "the measured tool is never imported; every run is `python3 -I`" | unrelated |

### Adjacent, not overlapping (widened-term hits; none binds C1's law)

| lane | path:line | what it says | relation |
|---|---|---|---|
| mado | `corpus/knowledge/xdg-portal-routing-r12.md:47`; `.../portal-keyfile-bytes-r93.md:63` | XDG desktop-portal `org.freedesktop.impl.portal.FileChooser` routing/parse | unrelated (native dialog backend, no CDP, no page/target/session) |
| kagi | `corpus/knowledge/cdp-bridge-1password.md:1` | `the-janitor cmd_cdp_ensure` launches a burner Chrome profile for 1Password unlock | unrelated (no `Target.`, no node ids; operator-owned scope per kagi SCORECARD) |
| kaidoku | `corpus/knowledge/2026-10-14-r10-02-queue-ops-2.md:174` | a rea evidence field `backend_node_id 4` for `selected_node` in event-listener inspection | adjacent-naming only: one self-launched Chromium, one session, no cross-session use |
| kaidoku | `corpus/knowledge/2026-10-13-r3-runtime-observation.md:44` | `rea inspect-web-page <endpoint> <targetId>` | unrelated to node-id scope (targetId as a CLI argument) |
| revenger | `corpus/knowledge/round-93-browser-cdp-runtime-evidence.md:1` (374 lines; 0 hits `iframe`/`backend`) | oracle over a saved `inspect_web_page` record | unrelated (same round number, different surface) |
| kasegi | `corpus/knowledge/program-quirks.md:40` | HackerOne dropzone's hidden `input[type=file]` | unrelated (page-side quirk) |
| kotoba / kumitate / kake | `scoped-rules-round60.md:11`, `at-least-once-dedupe.md`, `referrer-policy-effective.md:34` | `sessionId` / "auto-attach" / "cross-origin" in unrelated senses | false positive |

**Sibling overlap count: 0.** No contradiction to report from any sibling lane.

## 2. Tabi's own earlier knowledge — prior art is corroborative, not contradictory

Question: does any earlier tabi entry state something C1 contradicts (e.g. that a page-session answer
works for an iframe's chooser, or that a node id is process-global so the page session names the INPUT)?

**No such entry exists.** The closest entries, all read at the cited lines:

| path:line | what it says | relation to C1 |
|---|---|---|
| `corpus/knowledge/chromium-crosssite-iframe-chooser-round-92.md:127-134` (§Wave probes, R92ExecProbe) | in arm X, page-session `setFileInputFiles` with the iframe chooser's B (2) returned `Node is not a file input element`, child `files` stayed `[]`, 3/3 reps; the iframe-session call then delivered `[["tabi-r92-answer.txt", 22]]` 3/3; **the node it resolved to was not read** ("[INFERENCE — … not read]") | **agrees** on error text, empty files and same-session success; C1's new content is exactly the unread idendity: `describeNode(B)` = `#document` on the page session, INPUT on the iframe session, INPUT on the page session in S |
| `.../chromium-crosssite-iframe-chooser-round-92.md:95,105` (limit 5 / "What is NOT measured") | "Answering on the OTHER session … is not measured; … not that another session fails" | not a contradiction: the r92 *claim* excluded it while the same entry's wave probe measured it ("probed, still outside the claim"). This is a doc-consistency hazard for the r93 lesson, not a C1 falsifier |
| `corpus/knowledge/chromium-file-chooser-runtime-round-77.md:46,76` | `ServerError("Node is not a file input element")` at `inspector_dom_agent.cc:1809`; same-session refusal on a button's remote object | **agrees** — the string is the generic "resolved node is not a file input" refusal, not a cross-session-specific signal, so C1's exact-message leg is the generic path |
| `corpus/knowledge/chromium-file-chooser-runtime-round-78.md:13-20` | B is assigned from the DOM agent's serialization history, not the element; ids vary across runs (5/7/14/18), one id per input within a run | **agrees + explains** why C1 must not pin B; C1 does not. Scored receipt's B = 2 (X) / 5 (S), the same values r92 recorded |
| `corpus/knowledge/cdp-evidence-patterns.md:128-137` (errata) | root document reads `nodeName:"#document"`, `nodeType:9`; root `backendNodeId` per capture (2 then 1); "record per capture, never key on it" | **agrees**: supplies the `#document` naming shape and the "never pin B" rule; says nothing about cross-session resolution |
| `corpus/knowledge/chromium-showpicker-proxy-runtime-round-91.md:38` + `corpus/lessons/round-91-verifier-spotcheck.md:149` | the "cross-origin" iframe there is same-site (127.0.0.1, other port); its chooser answered with `setFileInputFiles`, no session field recorded | **agrees** with C1's S arm; the cross-origin-vs-cross-site word hazard is already routed (r91 spot-check item 4) and C1 limit 2 avoids it |
| `corpus/SOURCES.md:245` (S230 Playwright `crPage.ts:636-637`) | an OOPIF is "already attached in the parent session", frame id == target id | **agrees** with the target model C1's X arm uses; silent on node-id resolution |
| `SCORECARD.md:4425` (r92 capability row) | cross-site vs same-site chooser discriminator | **agrees**; contains no cross-session statement |
| `corpus/QUALITY.md:1020`, `corpus/README.md:1130,1157` | bind the page-side element, report B instead of requiring it; a second chooser carries the SAME B | **agrees/orthogonal** — C1 uses one chooser per leg (limit 4), so the id-cannot-discriminate limit is out of scope |

**Tabi-internal contradiction count: 0.** No earlier entry says a page-session answer succeeds for an
iframe, nor that node ids are shared across sessions.

## 3. Scored artifact vs the frozen wording

`.ufo/waves/round-93/scored/live-receipt.json` (nonce `tabi-r93-live-b39038e077b0`, 6 legs, `failures`
`[]`): X-1..X-3 → chooser on `iframe`, B=2, `describeChooser` INPUT `type=file id=s`,
`describePage` `#document` with **no error**, cross answer `Node is not a file input element`, then
`childFiles` `[["tabi-r93-answer.txt",22]]`; S-1..S-3 → chooser on `page`, B=5, `describePage` INPUT
`type=file id=s`, cross answer `null`, files delivered. Every field matches §Claim as written.

Two second-order notes (neither falsifies a clause):

1. `describePage.frameId` is `null` in every leg, and that is expected, not a driver loss: the driver's
   `nodeShape` reads `n.frameId`, and `DOM.Node.frameId` is optional and documented "Frame ID for frame
   owner elements" (protocol 1.3 JSON, round-44 pin, `DOM.Node.frameId`). Only `DOMSnapshot.DOMNode.frameId`
   is documented "also for the document node". So limit 3's refusal to name *whose* document is not merely
   conservative — this instrument has no field that could name it. A later widening would need a
   DOMSnapshot read.
2. X's B=2 numerically equals the root-document `backendNodeId` cdp-evidence-patterns recorded in an
   unrelated fixture. The receipt binds no documentURL/frameId, so nothing follows about which document
   the page session named — precisely what limit 3 forbids inferring. The wording survives; an
   unwidened sentence such as "the iframe's document" would not be supported by this receipt.

Novelty framing: the *failure* of the page-session answer was already observed (r92 probe, 3/3,
independent artifact `.ufo/waves/round-92/w1/R92ExecProbe-results.json`). C1's new ground is the
conjunction, chiefly the `#document` identification and the S-arm page-session INPUT.

VERDICT C1: neutral — no sibling overlap, no tabi-internal contradiction; prior art corroborates the error
leg and C1 adds the node-identity read. Artifact: `.ufo/waves/round-93/w1/R93Connector.md`.

Tooling: nothing installed or upgraded this seat (no pacman/uv/npx/binary), so nothing to record per the
operator's 2026-10-19 directive.
