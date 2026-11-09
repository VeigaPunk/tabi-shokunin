# R95Connector — cross-link scan (tabi round 95, wave w1)

Seat: R95Connector (leaf, read-only). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base `7b3912bb`,
freeze `1ecbca38`, scored `360d7cc9`. Range covered: (1) sibling-lane corpora under
`/home/vgpnk/Projects/shokunin/*-shokunin/corpus/knowledge/`; (2) tabi's own `corpus/knowledge/`,
`corpus/README.md`, `SKILL.md` (plus `corpus/QUALITY.md` and `cdp-evidence-patterns.md`, which state the
backendNodeId binding rules the r95 counter must live under).

## Instrument pins — verified first (all three match `claims.json.instruments` and the assignment)

```
$ sha256sum scripts/chrome-cdp-backendnode-misdelivery-round95.mjs
24947b00d8a158ad3fea8f5fb035757b6b98aebf48e85d18d506433619e2ee82  (driver)
$ sha256sum scripts/check-backendnode-misdelivery-round95.mjs
b7b464daa7c3c60f771b836cae8d8045fece1b2cca28aba4af70d154738d2775  (counter)
$ sha256sum scripts/negatives-backendnode-misdelivery-round95.mjs
1a670da5a9ffe200e6c757b0966d2df2e1bcca826da1f703c43d402f5075abf0  (battery)
$ sha256sum corpus/evidence/round95/chromium-oopif-backendnode-misdelivery/receipt.json
e5d13b767a4248ed59f3cac2e7613783336f0a768df612b9db057113609b3404  (= scored receiptSha256)
```

Evidence copy cited below: `.ufo/waves/round-95/w1/R95Connector-receipt.json` (sha256 `e5d13b76…`),
`R95Connector-c1-live.json` (sha256 `84f27926…`), `R95Connector-counter-receipt.json` (sha256 `baddea2a…`).

## Predicate vs the frozen sentence — no narrower property found, count re-derived

Read `plans/round-95.md` §Claim and §Declared limits 1–6, then compared the counter check-by-check against
the frozen bullets. Every bullet maps to a named check: describe-page uses `sameNode` (nodeName,
nodeType, attributes, backendNodeId) for T-present and `NO_NODE` with `nodeName === null` for T-absent on
**all** legs (S legs included); misdelivery uses only-the-target-non-empty plus `[ANSWER]`; collision and
miss use exact error strings; `z-miss` uses `maxBackendNodeId < B`; leg-set order is P286,P287,P288,P289,Z,S
× reps; the receipt-identity paragraph is covered by `schema/nonce/driver-pin/chromium/cross-host/reps/pad/
fixture/answer/ports/leg-set/failures/fresh-browser` plus per-leg arm/rep/q/pad, URL, B-echo and chooser
fields. Nothing the sentence states is left unenforced except the driver-internal facts that limit 6
declares (T is the driver's snapshot record; the pre-describe ordering).

Count re-derived from the code: 13 receipt-level + 2 branch checks + 3 reps × (4 P legs × 18 + Z 19 + S 16
= 107) = **336**, matching the claim. Independent read of the committed bytes:

```
$ TMPDIR=/fast/scratch/hyaku/tabi-r95/R95Connector node scripts/check-backendnode-misdelivery-round95.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --expect-driver-sha256 24947b00…e2ee82 \
  --receipt corpus/evidence/round95/chromium-oopif-backendnode-misdelivery/receipt.json \
  --expect-nonce tabi-r95-live-36ad06703d0b --json ; rc=0
{"verdict":"clean","checkCount":336,"findings":0,"mode":"receipt","receiptSha256":"e5d13b76…"}
branches: misdelivery ["P286-1"]; collision 11 P legs (P287-1/2/3,P288-1/2/3,P289-1/2/3,P286-2/3);
miss ["Z-1","Z-2","Z-3"]
```

## (1) Sibling lanes — no statement to contradict, none that already states the law

```
$ grep -rIl -E 'backendNodeId|setFileInputFiles|fileChooserOpened|Target\.setAutoAttach|OOPIF' \
    */corpus/knowledge/ (and each *-shokunin tree, --include '*.md' '*.mjs' '*.json')  → no matches (rc 1)
$ grep -rIl -E 'file-upload-button|shadowRoot|DOMNodeIds|IntIdForNode' */corpus/knowledge/ → tabi only
$ grep -rIln -iE 'iframe|cross-origin|cross-site' */corpus/knowledge/ → kake/kasegi/kengaku notes only
```

- **Zero sibling-lane statements** about CDP `backendNodeId`, `DOM.setFileInputFiles`, `fileChooserOpened`,
  OOPIF/iframe targets or CDP session routing. Nothing to contradict; nothing already stating the r95 law
  (the capability is fleet-novel).
- Adjacent but disjoint (term overlap only, no correction owed): `mado-shokunin/corpus/knowledge/mime-magic-sniff-r95.md:41`
  and `xdg-mime-default-resolution-r92.md:355` (GTK/XDG-portal file choosers — desktop MIME routing, not CDP);
  `mado-shokunin/corpus/knowledge/xdg-portal-routing-resolver-r90.md:36` (`FileChooser :77` — the portal
  interface, not a CDP session); `kagi-shokunin/corpus/knowledge/cdp-bridge-1password.md:1-10` (Chrome
  profile/port for 1Password, no target/session semantics); `revenger-shokunin/corpus/knowledge/round-93-browser-cdp-runtime-evidence.md:157-158`
  (`target.target_id and frame_id (per browser launch)` — voluntarily, corroborates r95's 18 distinct
  browser ids per leg); `kake-shokunin` iframe mentions (link-preview/CSP page semantics).

## (2) Tabi's own earlier statements the r95 law contradicts or narrows

Each row: statement as committed → what r95 shows → correction owed?

| path:line | committed statement | r95 relation | appended correction owed |
|---|---|---|---|
| `corpus/knowledge/chromium-crosssite-iframe-chooser-round-92.md:127-131` | “**Answering on the other session fails**… `setFileInputFiles` sent on the PAGE session … returned `Node is not a file input element`” | r95 shows the page-session call can return **no error** and fill a parent `#pN` (P286-1); “fails” holds only for the r92 fixture (parent owns no file inputs) | **Y** — narrow to the fixture and name the success branch |
| `corpus/knowledge/chromium-crosssite-iframe-chooser-round-92.md:105` | “No cross-session answer failure: answering in X on the page session is **untested**” | measured in r93 (error), r94 (collision/miss), r95 (misdelivery) | **Y** — stale limit; point at r93–r95 |
| `corpus/knowledge/chromium-oopif-backendnode-scope-round-93.md:16-18` | law sentence: the page-session answer “fails with `Node is not a file input element`, **delivering nothing**” | r95: with parent file inputs it succeeds and delivers into the parent; child `#s` stays `[]` | **Y** — the existing round-94 correction covers only error-text stability, not delivery |
| `corpus/knowledge/chromium-oopif-backendnode-scope-round-93.md:45` | table row 4: “no file delivered” | same as above (a file IS delivered, to a different document) | **Y** (same correction) |
| `corpus/knowledge/chromium-oopif-backendnode-collision-round-94.md:19-21` | law sentence: with 300 painted elements “it is **larger than every id in the parent’s tree** and resolves to nothing” | r95: six parent file inputs (UA shadow subtrees, S235) push the parent’s ids past B (P286-1 parent ids 290–310 vs B=302); B resolves to a parent input/`#text`/shadow button | **Y** — the note’s own wave finding already replaces “max id” with id-map membership; append the file-input variant |
| `corpus/README.md:1203-1208` | §Round 93 coverage: page pierced document “holds 0 `INPUT#s` … fails with … and **delivers nothing**” | r95’s parent owns six file inputs; delivery to a parent input is possible | **Y** — the existing round-94 correction fixes only “names a `#document`” |
| `corpus/README.md:1215-1220` | §Round 94 coverage: with 300 painted elements “B **exceeds every id in the parent’s tree**” and both calls fail `No node found…` | r95 contradicts as a general law: parent file inputs extend the parent’s ids; the call can succeed (fill) | **Y** |

Consistent (no correction owed), checked so the list is not one-sided:
- `corpus/README.md:15` and `corpus/knowledge/cdp-evidence-patterns.md:130-137`: root `backendNodeId` is
  per-capture, “record per capture, never key on it”. r95 keys on B **within one leg/capture window**
  (snapshot → describe → answer in one browser); the cross-capture rule stands.
- `corpus/QUALITY.md:1020` (item 150): an assigned chooser id is never pinned to a literal. r95 pins no
  literal — B is read per leg and bound by relations (echo, equality with T, distinctness). Complies.
- `SKILL.md:617-618`, `SKILL.md:742` (A8): cross-origin iframes are outside `click/fill/evaluate/snapshot`;
  navigate to the iframe URL. Not contradicted — raw CDP is not one of those tools; the r95 law is the
  reason the restriction is load-bearing (a page-session command resolves a foreign id on the top frame).
- `corpus/knowledge/chromium-oopif-backendnode-misdelivery-round-95.md` and `corpus/README.md:1233-1245`
  (r95 note/coverage): verified against the receipt — P286-1 `#p3`=302 filled; P287/P288 `#text`; P289
  shadow `INPUT type=button id=file-upload-button`; P286-2/3 `#text` (p3=303, ±1 jitter); Z max 59 < B=302;
  S B=617 `INPUT#s`; 1 misdelivery + 11 collisions over 12 P legs; positive control 4 misdeliveries
  (P286-2,P289-2,P286-3,P289-3) and `probe-a` 3 (P286×3). Table rows and counts match `.ufo/waves/round-95/
  scored/live-receipt.json`; no transcription error found.

## Calibration notes

- The r92 “fails” reading is a **wave probe outside the claim** (`round-92.md:127` says so), and r93:167
  already warns “Not ‘the other session always fails’”. So the owed corrections are scoping corrections,
  not claim reversals; C1's own wording is unaffected.
- The r95 law needs one distinction the earlier notes do not carry: success/failure is decided by
  **whether the parent renderer owns a file input at B**, not by the parent's id maximum and not by the
  error text alone. The r95 note states this; the r92–r94 notes still read “fails/errors/delivers nothing”
  as the outcome of the wrong-session answer.
- Adjacency risk for tooling readers: `SKILL.md:742` routes cross-origin iframes by navigation; a client
  that instead reuses a page-session `backendNodeId` gets no error when it hits a parent file input
  (r95). Worth one sentence in the r95 note's practical rule — already present there.

## What was not run

No `--live` run: this seat is a read-only cross-link scan, the scored `--live` result is committed, and a
live re-run would consume a port triple without adding a scan finding. No chromium was launched, no port
was used, no process was killed. Scratch `/fast/scratch/hyaku/tabi-r95/R95Connector/` was created for the
`TMPDIR` of the receipt-mode check and is removed before this report lands. No file outside
`.ufo/waves/round-95/w1/` was written; no git/jj state touched.

Evidence artifacts: `.ufo/waves/round-95/w1/R95Connector-counter-receipt.json`,
`R95Connector-receipt.json`, `R95Connector-c1-live.json`.

VERDICT C1: neutral
