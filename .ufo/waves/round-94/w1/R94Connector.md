# R94Connector — sibling overlap scan on C1's surface (backendNodeId across sessions)

Read-only. Scanned sibling lane corpora under `/home/vgpnk/Projects/shokunin/*-shokunin/corpus/` for
the surface C1 lives on: `backendNodeId` resolution across sessions/targets/renderers, `DOMNodeIds`,
OOPIF sessions, `DOM.describeNode` / `documentURL`, `DOM.setFileInputFiles`. Then compared the tabi
lane's own committed statements against what r94 measured. No browser was launched; no lane file
outside `.ufo/waves/round-94/w1/` was touched.

## Method (exact commands, exit codes)

```
cd /home/vgpnk/Projects/shokunin
for t in backendNodeId DOMNodeIds describeNode setFileInputFiles OOPIF 'out-of-process' documentURL
         pierce 'No node found for given backend id' 'renderer-scoped' 'frameId.*backend'; do
  grep -ril -e "$t" -- */corpus; done          # rc 0 (hits printed); lane set per term below
for lane in audio chousa game-dev-2d game-dev-3d kagi kaidoku kake kama kasegi kengaku kotoba \
            kotodama kumitate lore mado mori revenger souji tameshi tsukuroi; do
  grep -rliE 'file ?chooser|DevTools Protocol|remote debugging|\bCDP\b|chromium|headless chrome' \
       "$lane-shokunin/corpus/knowledge" "$lane-shokunin/corpus/SOURCES.md"; done   # rc 0/1 per lane
tar -tf .../S048/rea-agents-6.5.0-cited-members.tar |
  while read m; do tar -xOf <tar> "$m" | grep -q backendNodeId && echo HIT $m; done  # rc 0, 1 HIT
```

Wide-grep lane counts (concept terms, `knowledge/` + `SOURCES.md`): mado 12, kaidoku 13, kagi 9,
kake 7, revenger 4, kasegi 3, tsukuroi 3, kama 2, kotoba 2, chousa/kumitate 1 each, and
audio/game-dev-2d/game-dev-3d/kengaku/kotodama/lore/mori/souji/tameshi 0.

## Sibling-lane overlap table (20 sibling lanes)

| lane | path:line | what it says | relation to C1's law |
|---|---|---|---|
| kaidoku | `corpus/evidence/round-42/local-sources/S048/rea-agents-6.5.0-cited-members.tar` → member `cli-runtime/cli.js:33808-33812,33833` | a bundled CDP client (rea-agents 6.5.0) gets `DOM.getDocument {depth:0}` → root `nodeId`, resolves a selector, then `DOM.describeNode {nodeId}` to *obtain* `backendNodeId`, stored as `selected_node.backend_node_id` | **neutral/adjacent**: ids are read and used inside one session; never sent to another session, no cross-session law, no `setFileInputFiles` |
| kaidoku | same tar, `cli-runtime/cli.js:28236-28237` | `capturedSvgNodeKind` sends `DOM.describeNode {backendNodeId: query.backendNodeId}` | neutral: same-session reuse of an id it already holds |
| kaidoku | same tar, `cli-runtime/cli.js:29837` | WebMCP tool record: `declaration_kind = numberValue(backendNodeId) === undefined ? "imperative" : "declarative"` | neutral: presence-as-classifier; says nothing about resolution scope |
| kaidoku | `corpus/SOURCES.md:54` (S048 row) | S048 is scoped to the four RE verbs (`cli/reverseEngineeringCommands.js` etc.) | adjacent **scope note**: the tar also carries `cli-runtime/cli.js`, which is outside S048's cited scope and holds the CDP client above |
| revenger | `corpus/knowledge/round-93-browser-cdp-runtime-evidence.md:31-48` | one saved `inspect_web_page` record: `target.type page`, `frames[0].url`, `dom_urls` — shape facts only | unrelated: target/frame identity, no node ids, no chooser, no cross-session send |
| kumitate | `corpus/knowledge/kimi-skills-plugins.md:402,421` | webbridge skill keyword list incl. `cdp`; tool table rows incl. `upload` | adjacent, silent: a production client surface that would inherit the collision, but no statement about how upload addresses an input or a session |
| mado | `corpus/knowledge/portal-keyfile-bytes-r93.md:63,137,157`, `mime-magic-sniff-r95.md:41` | XDG desktop-portal `FileChooser` *interface keys* (KDE/GTK) | unrelated: different "file chooser" (desktop portal config), no CDP |
| kagi / kake / kasegi / kama / kotoba | `kagi:knowledge/adjacency-scope.md:9,28`, `cdp-bridge-1password.md:1`; `kake:knowledge/mirror-pitfalls.md:38`; `kasegi:knowledge/mission-control.md:119`; `kama:knowledge/listener-census.md:355`; `kotoba:knowledge/fleet-skill-audit-round5.md:45` | CDP as a *port/endpoint/bridge* (`:9222`, `cdp-bridge ensure`, listener census) | unrelated: infrastructure, no DOM node ids |
| kengaku | `corpus/evidence/round50/c1-receipt.txt:1`, `lessons/round-50-verifier-spotcheck.md:193` | "out-of-process harness" = `python3 -I` counter isolation | unrelated (term collision) |
| tameshi | `corpus/SOURCES.md:30` ("Pierce" — author surname), `corpus/routed-defects.json:127` (out-of-process python harness) | — | unrelated (term collisions) |
| kotodama | `corpus/SOURCES.md:297`, `knowledge/culture-material/bathing-and-body-hygiene.md:45` ("pierced" dome) | — | unrelated (term collisions) |
| game-dev-2d | `corpus/live/**/fixture.x86_64` | `documentURL` occurs inside ELF bytes | unrelated (binary noise) |

Fifteen sibling lanes (audio, chousa, game-dev-3d, kagi, kake, kama, kasegi, kotoba, kumitate, lore,
mado, mori, revenger, souji, tsukuroi) have **zero hit** for every exact term; they appear above only
through unrelated nouns (portal `FileChooser`, CDP-as-endpoint) or not at all. **No sibling lane
carries any statement, measurement or rule about `backendNodeId` resolution across sessions,
`documentURL` binding, or the miss branch** — the only on-surface sibling artifact is kaidoku's
archived third-party code.

## Tabi-lane own corpus (statements r94 can contradict)

| path:line | what it says | relation |
|---|---|---|
| `corpus/README.md:1203-1207` | r93 capability summary, **unconditional**: "the `backendNodeId` B of a cross-site iframe's file chooser, sent on the PAGE session, names a `#document` node there …, pierced document holds 0 `INPUT#s`, and `DOM.setFileInputFiles(B)` … fails with exactly `Node is not a file input element`" | **contradicted as written** — r94 M (cross-site, pad 300) gives `No node found for given backend id` for *both* commands (receipt C-1/M-1…: `pagePierce.maxBackendNodeId` 15 < B 302) |
| `corpus/knowledge/chromium-crosssite-iframe-chooser-round-92.md:129-134` | "consistent with `backendNodeId` being scoped to the reporting session's document tree [INFERENCE — the node it resolved to was not read]" | **contradicted in substance** (superseded): r94 C resolves a foreign id to the parent's own root; the id space is per-renderer with collisions, not a session-scoped view. r92 bracketed it as INFERENCE and r93 already replaced the reading |
| `corpus/knowledge/chromium-oopif-backendnode-scope-round-93.md:17-21` (law) | "in the cross-site arm, the … id sent on the page session names a `#document` … (6/6 legs)" | agrees for its own fixture; its limit 4 (one DOM shape: lone input at a fixed position) already excludes r94's pad 300 — so not contradicted, but the sentence is fixture-scoped |
| `…round-93.md:100-106` (rule 2) | "can silently name a different node — here the parent `#document` — **rather than fail with `No node found`**" | **contradicted as a contrast**: r94 M is exactly that fail. The note's own §What-is-NOT-measured ("Not 'the other session always fails'") keeps the miss branch outside its claim, so this is over-general wording, not a false measurement |
| `…round-93.md:33` + `corpus/lessons/round-93.md:33,101` | page-session `DOM.getDocument {depth:0}` root has `backendNodeId` 2 = B and `documentURL` = parent URL, 3/3 X legs (w1 probe) | agrees; r94 promotes the probe into the C-arm predicate (counter `page-root`, `describe-page`) |
| `corpus/knowledge/cdp-evidence-patterns.md:130-137` | "root `backendNodeId` is per-capture, not 2 … record `backendNodeId` per capture, never key on it" | agrees with tension: r94 binds an *equality* (page root id == B) read within one capture, not a literal. Residual risk, named by r94 limits 1/3: if a capture minted the parent root at another number the C arm would turn M-shaped |
| `corpus/QUALITY.md:1019-1021` (#150) | an id assigned per serialization history "is never pinned to a literal: … the id is reported, not required" | agrees: r94's clauses are relational (`= root id`, `≥`/`<` tree max); 2/302/305 and 15/635 are receipt observations, not requirements |
| `corpus/knowledge/chromium-file-chooser-runtime-round-78.md:13-24` | the chooser id comes from serialization history ("`#s` 5 in 23 runs and 4 in one") | agrees: pad 300 moves B 2 → 302 (receipt C-1 vs M-1), i.e. the value is history-sensitive; r94 pins relations, and finds within-shape determinism (3/3 per arm) |
| `corpus/knowledge/chromium-showpicker-runtime-round-79..91.md` (e.g. r80:64) | "the chooser … `DOM.setFileInputFiles` on the event's `backendNodeId` delivers the exact bytes" | agrees: same session as the event; no cross-session statement |
| `corpus/knowledge/chromium-oopif-backendnode-collision-round-94.md` (this round, already written) | law, table (C 2/15, M 302/15, S 305/635), rule "lucky outcome is an error" | agrees with the receipt and with r93; §Pre-freeze probes wording is ambiguous (see notes) |
| `corpus/knowledge/chromium-156-release-pin-recheck.md:15` | Stable Linux moved to 156.0.8078.47 (prev 155.0.8059.84) | adjacent: r94 pins 155 (limit 1, predicate requires `Chrome/155.0.8059.84`); no conflict, but the capability is build-pinned while Stable has moved |
| `corpus/lessons/round-89-verifier-spotcheck.md:78` | prior connector: "21-lane scan finds zero overlap on … `setFileInputFiles`" | still true for statements; r94's scan adds one *code* artifact (kaidoku tar) for `describeNode`/`backendNodeId` only, and zero sibling `setFileInputFiles` hits |

## Overlap count

- Sibling lanes scanned: **20**; lanes with any term hit: **5** (kaidoku, kengaku, tameshi, kotodama,
  game-dev-2d); off-surface term collisions: **4**; lanes with zero hits: **15**.
- Sibling artifacts genuinely on C1's surface: **1 file** (kaidoku's `rea-agents` tar, member
  `cli-runtime/cli.js`, 3 code sites); sibling *knowledge statements* about cross-session resolution,
  `documentURL`, or the miss branch: **0**.
- Tabi-lane artifacts carrying statements about the surface: **11** rows above (9 pre-round-94 notes
  plus QUALITY #150, README, and the new r94 note); statements contradicted by r94: **2**
  (README §r93 clause; r92's scoping INFERENCE); over-general wordings to correct: **1**
  (r93 rule 2's "rather than fail"); agreeing: **7**; agreeing-with-tension: **1**.

## Contradictions (stated, not smoothed)

1. **README:1203-1207 vs r94 M.** The r93 contract summary says the page session answers
   `Node is not a file input element`; r94 M shows both commands answer `No node found for given
   backend id` in the same cross-site shape with 300 painted spans. r93's note is saved by its
   limit 4; the README summary is not. This is a *prior-round* statement falsified by r94, never a
   clause of C1.
2. **r92:133 vs r94 C.** "Scoped to the reporting session's document tree" predicts a foreign id
   resolves to nothing; r94 C resolves B to the parent's own root (`documentURL` = parent URL). The
   bracket (`INFERENCE — the node it resolved to was not read`) and r93's replacement reading make
   this a superseded inference, not a live error.
3. **r93 rule 2's contrast ("rather than fail")** over-reads: both branches occur in one build, and
   which one occurs is decided by the parent renderer's minted-id count, not by the client.
4. No sibling-lane statement contradicts C1. C1's own numbers re-derive clean (below).

## Non-obvious adjacency notes

- **The parent's tree maximum does not move with the child's padding.** `pagePierce.maxBackendNodeId`
  is 15 in C (pad 0) and 15 in M (pad 300), while B moves 2 → 302; in S it is 635 with B 305. So the
  M miss is a property of the parent renderer's own numbering, not of the child's count — the pad
  only moves B. Any future note that says "the threshold is in the parent" would be wrong.
- **r93's forgery battery already treats the miss branch as a mutation**:
  `scripts/negatives-cross-session-answer-round93.mjs:32,37` (at base `d7744d04`) injects
  `describePage.error = 'No node found…'` and `crossAnswer.error = 'No node found…'` and expects the
  r93 counter to kill them. The same receipt field shape is green in r94's M arm — the two rounds are
  compatible only because each counter is arm-shape-specific. Worth one sentence wherever a client
  rule is derived from both.
- **The r94 knowledge note's probe wording is ambiguous**, not wrong: "300 `display:none` spans …
  left B = 2 (a collision) although that serialization minted ids up to 318 in the child renderer"
  reads as if one serialization did both. Receipt-grounded reading: the input's id 2 was minted at
  load, the *later* probe serialization then minted ids up to 318 without renumbering it
  (`probes/probe1-hidden-pad-preserialize-receipt.json`: C-1/M-1 B = 2, S-1 B = 5).
- **kaidoku's client pattern is the safe one**: it obtains `backendNodeId` from `nodeId` on the same
  session it inspected (`DOM.getDocument` → `DOM.describeNode`), which is why its code never meets
  the collision. That is a second, independent corroboration of the "read the id where you will use
  it" rule; it is code, not measurement.

## Verification I ran (nothing beyond this)

```
TMPDIR=/fast/scratch/hyaku/tabi-r94/R94Connector node scripts/check-backendnode-collision-round94.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --expect-driver-sha256 518f40ff9b34727254a3bb0cd30603c70ce8488a911fa3a26a55273220f9686f \
  --receipt corpus/evidence/round94/chromium-oopif-backendnode-collision/receipt.json \
  --expect-nonce tabi-r94-live-240f4c5100c3 --json
# rc=0; verdict clean, mode receipt, checkCount 165, findings 0, driverSha256 518f40ff…, receiptSha256 8070fcdc…
sha256sum scripts/{chrome-cdp,check,negatives}-backendnode-collision-round94.mjs
# 518f40ff…, d7fd2cbe…, b750ee17… — identical to .ufo/waves/round-94/controls/instrument-sha256.txt
sha256sum corpus/evidence/round94/…/receipt.json .ufo/waves/round-94/scored/live-receipt.json
# both 8070fcdc787189a18cb888da20765579bfe0240fa53d16264301fcf7ffc37354
jq '.legs[]|{leg,choosers:.choosers[0].backendNodeId,root:.pageRoot.backendNodeId,max:.pagePierce.maxBackendNodeId,inputS:.pagePierce.inputS}' receipt.json
# C-*: B 2, root 2, max 15, inputS 0 | M-*: B 302, root 2, max 15, inputS 0 | S-*: B 305, root 2, max 635, inputS 1
git grep -n -e documentURL -e 'No node found for given backend id' d7744d04 -- scripts   # rc 0,
#   only negatives-cross-session-answer-round93.mjs:32,37; no counter binds documentURL at base
```

Discipline: no chromium process started (no port triple assigned, none used); no commits, no git/jj
mutation; scratch `mkdir -p` then `rm -rf` before yield; no lane file written outside
`.ufo/waves/round-94/w1/R94Connector.md`. One discipline slip to disclose: an intermediate
`git grep > /tmp/.x` wrote one transient file under `/tmp` (removed immediately, `rm -f`, no content
retained); every later pipeline wrote nothing outside the scratch root.

Evidence artifact: `.ufo/waves/round-94/w1/R94Connector.md` (this file), grounded on
`corpus/evidence/round94/chromium-oopif-backendnode-collision/receipt.json` (sha256 8070fcdc…,
re-deriving 165 checks / 0 findings) and `.ufo/waves/round-94/probes/probe{1,2,3}-*-receipt.json`.

VERDICT C1: neutral
