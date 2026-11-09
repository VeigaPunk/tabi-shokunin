# R96Connector — sibling and own-lane overlap scan for C1 (round 96, w1)

Seat: R96Connector (leaf). Mode: read-only scan; no `--live` run, no instrument audit, no chrome started,
no ports claimed. Scratch `/fast/scratch/hyaku/tabi-r96/R96Connector/` created empty and removed.

Axes walked: (1) own corpus `corpus/knowledge/*.md` statements about client libraries / file choosers /
OOPIF session routing; (2) sibling lanes `/*-shokunin/corpus/knowledge/` for Puppeteer/Playwright chooser or
OOPIF statements. Calibration target: separate *contradiction of C1* from *over-generalised lane prose that
C1 now contradicts*.

## Method (commands and results)

| # | command | result |
|---|---|---|
| 1 | grep `Puppeteer\|Playwright\|waitForFileChooser\|filechooser\|fileChooser` over `tabi-shokunin/corpus/knowledge` | 39 hit lines, 18 files (list below) |
| 2 | grep `waitForFileChooser\|filechooser\|fileChooser\|FileChooser` over `*-shokunin/corpus/knowledge` (all 21 lanes, gitignore respected) | **No matches found** |
| 3 | grep `Puppeteer\|puppeteer-core\|connectOverCDP\|waitForFileChooser` over `*-shokunin/corpus/knowledge`, `gitignore:false` | only `tabi-*` files (lanes 2's own corpus) |
| 4 | grep `OOPIF\|out-of-process iframe\|site-per-process\|site isolation` over `*-shokunin/corpus/knowledge`, `gitignore:false` | only `tabi-*` (r92, r93, r94, r95) |
| 5 | grep `Puppeteer\|Playwright\|iframe\|file ?chooser\|FileChooser` over `*-shokunin/corpus/knowledge`, `gitignore:false` | non-tabi hits are homonyms/tooling only (see §3) |
| 6 | `read .ufo/waves/round-96/scored/live-receipt.json` (legs) | 6 timeouts PPX/PPW-1..3, 9 choosers; PPW witness `frameId` == `iframeTargets[0].targetId` on all 3 reps |

Evidence base for the cross-check: scored live run `.ufo/waves/round-96/scored/c1-live.json`
(`verdict: clean`, `checkCount: 165`, `findings: []`, nonce `tabi-r96-live-c1225d318ea6`,
`driverSha256 4020e57e…63b91`) and its receipt (each PPW leg: `witnessEvents[0].frameId` == the iframe
`targetId`, `mode selectSingle`, `backendNodeId 2`, while the same leg's `outcome` is `timeout`,
`errName TimeoutError`, `childFiles []`, `parentFiles []`). Staged source
`.ufo/waves/round-96/sources/Page.ts`: `:339` `const clientEmitter = new EventEmitter(this.#primaryTargetClient)`,
`:361` `clientEmitter.on('Page.fileChooserOpened', this.#onFileChooser.bind(this))`, `:561-562`
`this.#primaryTargetClient.send('Page.setInterceptFileChooserDialog', {enabled:true})`, `:305`
`this.#primaryTargetClient = newSession` (prerender swap).

## 1. Own-lane hits (path:line — quote — relation)

| path:line | quote (abridged) | relation |
|---|---|---|
| `corpus/knowledge/chromium-oopif-backendnode-collision-round-94.md:52` | "safe signal that \"this id is foreign\". **Production clients route by the frame's own session** (Playwright `crPage.ts`, S230, r92)." | **contradicts (for Puppeteer)** — see §2.1 |
| `corpus/knowledge/chromium-crosssite-iframe-chooser-round-92.md:66-67` | "S230: Playwright's Chromium client treats an OOPIF as \"already attached in the parent session\" and identifies it by `frame.id === targetId`" | narrower/true-as-scoped; wording hazard — see §2.2 |
| `corpus/knowledge/chromium-crosssite-iframe-chooser-round-92.md:59-60` | "Enable interception on every session you might receive a chooser on: the page session *and* each attached `iframe` session" | **agree, and predicts C1** — the rule raw-CDP drivers follow; C1 shows the client that follows it only on the primary session |
| `corpus/knowledge/chromium-crosssite-iframe-chooser-round-92.md:41` (table) | "session the chooser arrived on | the **iframe** session | the **page** session" | agree — C1's PPW witness reproduces it (3/3) |
| `corpus/knowledge/chromium-oopif-backendnode-scope-round-93.md:114-116` | "**Answer a chooser only on the session it arrived on.** Read `Page.fileChooserOpened`'s session and send `DOM.setFileInputFiles` there" | agree (raw-CDP rule); C1 does not touch the answer path, only the wait |
| `corpus/knowledge/chromium-oopif-backendnode-misdelivery-round-95.md:55-58` | "Answer an out-of-process iframe's file chooser ONLY on the session whose `Page.fileChooserOpened` carried the `backendNodeId`" | agree; no client claim |
| `corpus/knowledge/chromium-oopif-backendnode-misdelivery-round-95.md:71` | "other page shapes and **client libraries (Puppeteer, Playwright) are unmeasured** — the driver sends raw CDP" | **agree — states exactly the gap C1 fills** (novelty sentence is consistent) |
| `corpus/knowledge/chromium-file-chooser-runtime-round-78.md:50-52` | "A client must arm interception before the click that opens the chooser: Puppeteer's `Page.waitForFileChooser` says \"This must be called before the file chooser is launched…\"" | agree/narrower — C1 shows arming happens (on the primary client) and the failure is target scope, not ordering |
| `corpus/knowledge/chromium-file-chooser-runtime-round-78.md:26-29` | "Playwright's `FileChooser` exposes `element` … and `isMultiple` … — the client answers a chooser through the input it belongs to, never through an id" | agree — C1 PWX/PWS check `chooser.element()` id `s`; measured upgrade of a documentation sentence |
| `corpus/knowledge/chromium-file-chooser-runtime-round-77.md:48-54` | Puppeteer `cdp/ElementHandle.ts` sets `element.files` via `DataTransfer` because `DOM.setFileInputFiles` no-ops on `[]` | agree, **different API** (`uploadFile`/`setInputFiles`, not the chooser wait); C1 limit 4 excludes it — see §2.3 |
| `corpus/knowledge/chrome-remote-debugging-profile-boundary.md:93` | "only official products (DevTools frontend, Lighthouse, Puppeteer, ChromeDriver) are supported consumers" | agree (supported-consumer list), no chooser law |
| `corpus/knowledge/webdriver-bidi-capability-matrix.md:46-47`; `source-recheck-round-12.md:43-44` | "Puppeteer's Chrome CDP support remained unchanged" (S011, version-scoped) | agree, no chooser law |

No own-lane hit states or implies that Puppeteer *succeeds* on a cross-site chooser; no hit narrows C1's
sentence below what the counter checks.

## 2. Calibration notes (what is and is not a C1 problem)

### 2.1 `round-94:52` is over-generalised prose, not a C1 defect — errata candidate
"Production clients route by the frame's own session" is plural with a Playwright-only citation
(`crPage.ts`). Puppeteer 25.16.0 is a production client and does **not**: the staged source binds the
chooser listener and `Page.setInterceptFileChooserDialog` to `this.#primaryTargetClient` only
(`Page.ts:339`, `:361`, `:561-562`), and the lane's own scored data shows the iframe target carrying the
one `Page.fileChooserOpened` (witness `frameId` == iframe `targetId`, 3/3 PPW) while Puppeteer times out
6/6 cross-site legs. Exact-scope rewrite: "**Playwright's Chromium client** routes by the frame's own
session". This is an errata for r94's note, not a falsification of C1; C1 is the sentence that exposes it.
The same sentence's first clause (ids are not safe foreignness signals) is untouched.

### 2.2 `round-92:66-67` — "already attached in the parent session" is about target attachment, not event delivery
Read alone it invites the inference "the parent session receives the child's chooser", which r92's own
table (`:41`) and C1's PWX legs contradict (Playwright resolves while the chooser opens on the iframe
target/session). As written it stays true (attachment bookkeeping, `frame.id === targetId`) but it is the
one sentence a future reader can use to reconstruct a *false* Puppeteer expectation; a half-line
qualifier ("…attached, but the chooser listener is per frame session") would close it.

### 2.3 `round-77:48-54` (S213) is an adjacent, not competing, Puppeteer fact
It documents `uploadFile`'s `DataTransfer` path for the empty-list case. It says nothing about
`waitForFileChooser`, and C1 limit 4 names `ElementHandle.uploadFile` as unmeasured. Risk is a reader
carrying "Puppeteer handles file inputs over CDP" into "Puppeteer handles iframe choosers"; C1's
declared limits already fence that, so no edit is owed here — only a reading guard.

### 2.4 C1's novelty sentence survives the scan
`grep waitForFileChooser` over the own corpus hits only r78:50-52 (the API quote, no client run); r95:71
names client libraries as unmeasured. Together they are consistent with the plan's claim that no lane
instrument ever ran a client library against a cross-site chooser.

## 3. Sibling lanes: no overlap (and the look-alikes that are not overlap)

All 21 sibling `corpus/knowledge` trees (1,400+ files; audio 18 … tsukuroi 153) return **no** hits for
`waitForFileChooser`, `filechooser`, `fileChooser`, `Puppeteer`, `puppeteer-core`, `connectOverCDP`,
`OOPIF`, `out-of-process iframe`, `site-per-process`, `site isolation`. The hits a wider pattern returns
are homonyms and are **not** adjacency to C1:

- `mado-shokunin/corpus/knowledge/{xdg-portal-routing-r12.md:47, portal-keyfile-bytes-r93.md:63, xdg-portal-routing-resolver-r90.md:36, mime-magic-sniff-r95.md:41}` — `FileChooser` is the
  **xdg-desktop-portal interface** (`org.freedesktop.impl.portal.FileChooser`), a desktop picker route,
  not the CDP `Page.fileChooserOpened` surface. Name collision only; do not cite as agreement.
- `kaidoku-shokunin/corpus/knowledge/{2026-10-13-r3-runtime-observation.md:99-102, 2026-10-13-r4-08-observe-verbs.md:161-166}` — Playwright used as a *capture tool* (`connect` scenarios, `_electron.launch`);
  no chooser, no OOPIF, no client-behaviour law.
- `kake-shokunin/corpus/knowledge/accessibility-review-cards.json:260-263` — "iframes" as review scope
  prose; `pages-base-path.md:53,60` — `iframe` as an HTML tag in a link audit. Neither measures a browser.

Conclusion: no sibling lane holds a statement that C1 contradicts, and no sibling supplies a prior
client-library result that would narrow C1's novelty.

## 4. What this seat did not establish

- No `--live` run of the pinned driver (executor seats own that); the contradiction in §2.1 is derived
  from the already-committed scored receipt plus the staged source, not from new execution.
- No audit of whether `check-client-oopif-chooser-round96.mjs` enforces a narrower property than the
  frozen sentence (reviewer/critic seats); this seat only compared prose to prose and prose to data.
- `--receipt` mode re-scored 163 checks vs `--live` 165 in the lane's own records (`R96Scribe-recheck-corpus.json`
  vs `scored/c1-live.json`), consistent with the plan's two extra live checks (`driver-exit`,
  `ports-bound`); not re-derived here.

Carries: this report only (no receipts copied; every number above is re-readable from
`.ufo/waves/round-96/scored/c1-live.json` and `.ufo/waves/round-96/scored/live-receipt.json`).

VERDICT C1: neutral
