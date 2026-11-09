# R94Scribe — round 94, knowledge-note draft for C1

Seat `R94Scribe` (scribe, axes depth+coverage, milestone "knowledge note draft"). Lane
`/home/vgpnk/Projects/shokunin/tabi-shokunin`, base `d7744d04`, freeze `2308b6ce`, scored `012776cf`.
No subagent dispatch (leaf member), no commits, no git/jj mutation, no Chromium run (my seat has no
port triple in the wave dispatch). No files edited outside `.ufo/waves/round-94/w1/`.

## What I produced

| artifact | what it is |
|---|---|
| `.ufo/waves/round-94/w1/R94Scribe-note.md` | the knowledge-note draft for C1 (r93-note header shape: `source` / `verified-at` / `recheck`) — 255 lines |
| `.ufo/waves/round-94/w1/R94Scribe-sources.json` | proposed SOURCES rows S233 and S234 in the 11-column shape, with the staged bytes' digests, a re-fetch receipt, and `wc -w` counts for both quotes |
| `.ufo/waves/round-94/w1/R94Scribe-counter-receipt-mode.json` | my receipt-mode counter run output (cited as evidence below) |

The note covers, in the order the seat spec asked: what was measured (C vs M vs S, per-arm B values
2 / 302 / 305 and every page-session outcome); the law in one sentence (a `backendNodeId` sent on
another renderer's session is looked up in **that** renderer's map — collision with whatever node it
numbered B, or a miss); the Blink chain (`BuildObjectForNode` → `IdentifiersFactory::IntIdForNode`
(S233) → `Node::GetDomNodeId` (S234) → `DOMNodeIds::IdForNode` (S232); `AssertNode` → `NodeForId`
(S231)); the practical rule for automation clients (always send a `backendNodeId` on the session of
the target whose event reported it; an error is the lucky case, a collision silently targets the
wrong node); the three pre-freeze probes as observations under limit 3; and the six declared limits
plus a "what is NOT measured" list. S231–S234 are cited by id throughout; the two `[INFERENCE]`
markers name what the round did not establish (who minted the input's id first; the possibility of a
collision landing on a non-`#document` node).

## Numbers I re-derived (and how)

Per-arm table, straight from the scored receipt
(`.ufo/waves/round-94/scored/live-receipt.json`, sha256 `8070fcdc787189a18cb888da20765579bfe0240fa53d16264301fcf7ffc37354`):

```
C-1  1  1  iframe  2   #document  null                            2  0  15  Node is not a file input element  []  [["tabi-r94-answer.txt",22]]
M-1  1  1  iframe  302  null      No node found for given backend id  2  0  15  No node found for given backend id  []  [["tabi-r94-answer.txt",22]]
S-1  0  0  page    305  INPUT     null                            2  1  635  null                            null [["tabi-r94-answer.txt",22]]
```

(the same three rows repeated verbatim for reps 2 and 3 — every rep carried identical B values and
identical page-tree maxima). Columns: leg, attached iframes, listed iframe targets, chooser
session, B, page `describeNode(B)` nodeName, its error, page root id, page pierced `INPUT#s`, page
pierced max id, page `setFileInputFiles(B)` error, `filesAfterCross`, `childFiles`.

**Check count re-derivation.** The scored run reports `checkCount: 165`. I re-derived it from the
counter's own source: 12 receipt-level checks (`schema, nonce, driver-pin, chromium, cross-host,
reps, pad, answer, ports, leg-set, failures, fresh-browser`) + 17 per leg × 9 legs = 12 + 153 = 165.
No difference. (Method: read `scripts/check-backendnode-collision-round94.mjs`, count the `check(...)`
calls inside the per-leg loop; the `leg-shape` guard is a non-object-leg branch that does not fire.)

**The S arm's B is 305, not 302.** Worth the L1's attention because the M arm's B is 302 and the
naive expectation is "same-site = same id". They differ by 3. [INFERENCE] The same-site child shares
the parent renderer, so its input's id is drawn from the *same* counter the parent page already
advanced — hence a slightly different number than the isolated child renderer of the M arm. The note
states the measured values and does not generalise the difference; the exact 3-id offset is not
explained by anything this round measured.

**The C-arm collision is with the parent's own root**, not with an arbitrary node: page root id = 2
= B, `documentURL` = the parent URL, and `describePage(B)` returns that same `#document`. The M arm
is a genuine miss (B = 302 > the page tree's maximum 15), and the same-site control resolves B on
the page session (305, `INPUT#s`, 1 input in the pierced tree).

## Commands I ran (exact, with exit codes)

```
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin
$ sha256sum scripts/chrome-cdp-backendnode-collision-round94.mjs scripts/check-backendnode-collision-round94.mjs \
    scripts/negatives-backendnode-collision-round94.mjs .ufo/waves/round-94/scored/live-receipt.json \
    corpus/evidence/round94/chromium-oopif-backendnode-collision/receipt.json
518f40ff9b34727254a3bb0cd30603c70ce8488a911fa3a26a55273220f9686f  scripts/chrome-cdp-backendnode-collision-round94.mjs
d7fd2cbe0899ec59b639752d99f3cd22594dbe600300596cdcc6ce30abf2a95a  scripts/check-backendnode-collision-round94.mjs
b750ee17b7784d23fbc6c13f5356d1485f05f5702023e48f928730b6cfcd7822  scripts/negatives-backendnode-collision-round94.mjs
8070fcdc787189a18cb888da20765579bfe0240fa53d16264301fcf7ffc37354  .ufo/waves/round-94/scored/live-receipt.json
8070fcdc787189a18cb888da20765579bfe0240fa53d16264301fcf7ffc37354  corpus/evidence/round94/chromium-oopif-backendnode-collision/receipt.json
(exit 0 — all three instrument digests match `.ufo/waves/round-94/controls/instrument-sha256.txt`;
 the two receipt copies are byte-identical)

$ node scripts/check-backendnode-collision-round94.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
    --expect-driver-sha256 518f40ff9b34727254a3bb0cd30603c70ce8488a911fa3a26a55273220f9686f \
    --receipt corpus/evidence/round94/chromium-oopif-backendnode-collision/receipt.json \
    --expect-nonce tabi-r94-live-240f4c5100c3 --json > .ufo/waves/round-94/w1/R94Scribe-counter-receipt-mode.json
(exit 0 — verdict clean, mode receipt, checkCount 165, findings 0, receiptSha256 8070fcdc…;
 output copied to the w1 dir above and cited in the note)

$ printf 'int IdentifiersFactory::IntIdForNode(Node* node) { return node->GetDomNodeId();\n' | wc -w   → 6
$ printf 'DOMNodeId Node::GetDomNodeId() { return DOMNodeIds::IdForNode(this);\n' | wc -w               → 5
(both quotes ≤ 25 words; the counts recorded in R94Scribe-sources.json are these two)

$ curl -sS -o <scratch>/inspector_identifiers_factory.cc.b64 -w '%{http_code}' \
    'https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/inspector/identifiers_factory.cc?format=TEXT'   → 200 (7,404 B base64 → 5,551 B)
$ curl -sS -o <scratch>/dom_node.cc.b64 -w '%{http_code}' \
    'https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/dom/node.cc?format=TEXT'                                  → 200 (192,152 B base64 → 144,114 B)
$ cmp <scratch>/inspector_identifiers_factory.cc .ufo/waves/round-94/sources/identifiers_factory.cc   → IDENTICAL
$ cmp <scratch>/dom_node.cc .ufo/waves/round-94/sources/node.cc                                        → IDENTICAL
```

`node scripts/check-sources.mjs` on the lane's working tree exits with the SOURCES gate
`verdict=failed, rows=234, findings=15` — all 15 findings are `duplicate_url` on rows S171–S223,
**none on S233/S234**; the failures pre-date this round and are not in my scope. Against
`HEAD:corpus/SOURCES.md` (232 rows) the same gate reports 372 findings, because the scratch copy has
no `corpus/knowledge/` tree to resolve `used-by` paths against — a harness artefact of my scratch
root, not a lane defect. My two proposed rows match the L1's already-staged S233/S234 rows
byte-for-byte (compared cell-by-cell against `corpus/SOURCES.md`).

## Findings

1. **The note's per-arm table is fully backed by the scored receipt**; the numbers quoted (B = 2 /
   302 / 305; page-tree maxima 15 / 635; page root id 2 in every leg) are the receipt's own fields,
   not re-derived from a second run. The scored run's `checkCount: 165` re-derives exactly as
   12 + 17 × 9.
2. **The probe series is a clean isolation of "painted content", not "serialization".** probe1
   (300 `display:none` spans + pre-click serialization) → B = 2, collision; probe2 (300 *painted*
   spans + the same pre-click serialization) → B = 302, miss; probe3 (painted, no serialization) →
   B = 302, miss, all three arms over 3 reps. Serialization therefore did not move B; painting did.
   The note presents this as an observation under limit 3 and does **not** claim a threshold or a
   minting order.
3. **Two limits worth flagging for the L1's integration** (not falsifications):
   (a) the plan's M arm says "every backendNodeId in it is < B" while the counter binds the
   driver's reported maximum (`pp.maxBackendNodeId < B`). These coincide only if the driver's
   `treeStats` maximum is the true maximum of the pierced tree — true for this driver (it walks
   `children`, `contentDocument` and `shadowRoots`), but it is a trust relation on the pinned
   driver bytes rather than a re-derivation by the counter;
   (b) the "painted content moves the child's numbering" reading is an inference from three probe
   receipts, not from the predicate — the note marks it as such and limit 3 already excludes it.
4. **No wording or number falsification found by this seat.** I checked the committed counter
   clause-by-clause against the frozen predicate in `plans/round-94.md` §Claim for the arms I
   quote (chooser count/session/frame, `describeNode` on the chooser's own session, the answer and
   `childFiles`, the trusted click, the page root's identity in C and its inequality in M, the
   pierced-tree bounds in C/M/S, the two exact error strings, the iframe-target model, the
   fresh-browser rule) and the receipt-level checks; the counter enforces each of them. I did not
   run `--live` (no port triple assigned to this seat), so I claim nothing from a live run of my
   own; the live evidence I rely on is the L1's scored run, read and re-hashed.

## Out of scope for this seat

- Editing `corpus/SOURCES.md`, `corpus/knowledge/chromium-oopif-backendnode-collision-round-94.md`
  or `corpus/lessons/round-94.md` — the L1 is the integration owner; my deliverables are the files
  named above plus this report.
- Any Chromium run (no port triple assigned to `R94Scribe` in `w1-dispatch.json`; ports
  19541–19563 in the dispatch belong to `R94Exec1`, `R94Exec2` and `R94Critic2`).
- The wording-vs-counter adjudication itself (`R94Critic1`'s milestone); finding 3 above is
  reported to the L1 as an observation for that seat to weigh, not as a verdict of my own.

## Tooling

No installs or upgrades were needed or performed; the round's tools (`node`, `curl`, `base64`,
`cmp`, `sha256sum`, `jq`) were already present. Nothing was written outside my scratch root and my
own `w1/R94Scribe*` paths; the scratch root `/fast/scratch/hyaku/tabi-r94/R94Scribe/` was removed.

VERDICT C1: neutral
