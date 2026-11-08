# R92Connector — sibling-overlap scan for C1 (CDP target / cross-site iframe file chooser)

Seat: R92Connector (leaf). Round 92, wave w1. Read-only scan; no browser launched, no git/jj mutation,
no files written outside this report. Scratch `/fast/scratch/hyaku/tabi-r92/R92Connector` created and
removed (empty; the seat produced no run artifacts).

Claim under scan: `plans/round-92.md` §Claim / §Declared limits — predicate `C1-IFRAME-CHOOSER-R92`
moves the CDP **target/session** on which an iframe's `Page.fileChooserOpened` is reported and answered:
X arm (child `localhost`, a different site) → one `iframe` target, chooser on the **iframe** session;
S arm (child `127.0.0.1`, other port) → no `iframe` target, chooser on the **page** session.

## Commands run (exact; rc in brackets)

```
grep -ril -E 'setAutoAttach|attachedToTarget|OOPIF|out-of-process iframe|site-per-process|fileChooserOpened|setFileInputFiles' */corpus/knowledge */SCORECARD.md   [rc 0, no output]
grep -ric 'chromium' */SCORECARD.md ; grep -ric 'iframe' */SCORECARD.md ; grep -ric 'chooser' */SCORECARD.md   [rc 0, every one of the 20 sibling files = 0]
grep -rinE 'setAutoAttach|attachedToTarget|OOPIF|site-per-process|fileChooserOpened|setFileInputFiles|iframe|chromium' */PROVINCE.md   [rc 0, 1 sibling hit: kaidoku:55]
grep -rin -- 'setAutoAttach|...' corpus/knowledge/ (tabi own)                                                       [rc 0]
grep -nE 'Target\.|attach|sessionId|flatten' scripts/chrome-cdp-showpicker-{round80,round81,round84,proxy-round91}.mjs  [rc 0; Target. count = 0 in all four]
node -e '<read corpus/evidence/round91/chromium-showpicker-proxy/receipt.json>'                                      [rc 0]
```

## 1. Exact keyword set — zero sibling hits

20 sibling lanes, 1750 `corpus/knowledge` files, 20 sibling `SCORECARD.md`. Every one of the seven
assigned terms returns **0 files** outside tabi-shokunin. There is **no overlap and no contradiction**
with any sibling lane on the C1 surface; nothing in a sibling lane binds, refutes, or duplicates the
`Target.setAutoAttach` / OOPIF / `Page.fileChooserOpened` session question.

| term | sibling knowledge files | sibling SCORECARD lines |
|---|---|---|
| `setAutoAttach` | 0 | 0 |
| `attachedToTarget` | 0 | 0 |
| `OOPIF` | 0 | 0 |
| `out-of-process iframe` | 0 | 0 |
| `site-per-process` | 0 | 0 |
| `fileChooserOpened` | 0 | 0 |
| `setFileInputFiles` | 0 | 0 |

## 2. Near-term hits (adjacent, not overlapping)

| path:line | term | relation | why |
|---|---|---|---|
| `mado-shokunin/corpus/knowledge/xdg-portal-routing-r12.md:47,64,114` | `FileChooser` | adjacent | XDG **desktop portal** interface routing (`org.freedesktop.impl.portal.FileChooser`), not Chromium CDP; no page/target/session |
| `mado-shokunin/corpus/knowledge/xdg-portal-routing-resolver-r90.md:36,204,211` | `FileChooser` | adjacent | same resolver, `FileChooser=kde` key semantics |
| `mado-shokunin/corpus/knowledge/portal-keyfile-bytes-r93.md:63,72,102,137,157,159` | `FileChooser[]=…` | adjacent | keyfile parse of the same desktop portal key |
| `mado-shokunin/corpus/knowledge/xdg-mime-default-resolution-r92.md:355` | "GTK file choosers" | adjacent | GIO/MIME resolution, native dialog, no CDP |
| `mado-shokunin/corpus/knowledge/mime-magic-sniff-r95.md:41` | "GTK file choosers" | adjacent | same |
| `kagi-shokunin/corpus/knowledge/cdp-bridge-1password.md:1-12` | CDP bridge | adjacent | `the-janitor cmd_cdp_ensure` launches/attaches for 1Password unlock; grep for `Target.`/`iframe`/`attach`/`session` in that note = 0 hits |
| `kagi-shokunin/SCORECARD.md:37,48,66,1398,1415` | "CDP 9222" | adjacent | CDP 9222 + musketeer profile declared **contested/operator-owned scope**, explicitly "reported, not absorbed" — reinforces that tabi owns this instrument, no scope collision |
| `kaidoku-shokunin/PROVINCE.md:55` | CDP target enumeration | adjacent | self-launched `chromium --remote-debugging-port=9222`, `list_browser_targets` / `inspect-web-page`; passive record of top-level pages, no auto-attach, no iframe target, no chooser |
| `kaidoku-shokunin/corpus/knowledge/2026-10-13-r3-runtime-observation.md:44,78`; `2026-10-13-r4-08-observe-verbs.md:29,49,98` | `targetId` | adjacent | REA verbs take a `targetId` argument (Electron/desktop targets); naming only |
| `revenger-shokunin/SCORECARD.md:806-809,825,874,1721,1764` | browser-runtime via real CDP | adjacent | host Chrome/156 headless + `rea-cdp-browser` passive record; different build, no iframe/chooser, no session model |
| `kasegi-shokunin/corpus/knowledge/program-quirks.md:40` | `input[type=file]` | adjacent | HackerOne upload dropzone (React-controlled), page-side quirk only |
| `kotoba-shokunin/corpus/knowledge/scoped-rules-round60.md:11,25` | "auto-attach" | non-overlap (false positive) | Cursor rule-file auto-attachment, unrelated to CDP |
| `kake-shokunin/corpus/knowledge/referrer-policy-effective.md:34,35` | "cross-origin" | non-overlap (false positive) | referrer-policy tokens |

No sibling row asserts, denies, or measures anything about the chooser's target/session.

## 3. Tabi's own earlier knowledge — the direct question

Question: does any prior tabi artifact claim a **cross-origin iframe's chooser arrives on the page
session** (which the X arm would contradict)?

**No such claim exists — and the prior evidence is not in tension with X, because every prior iframe
fixture is same-site.** Evidence:

- The r80/r81/r84/r91 drivers each have **zero `Target.*` calls** (`grep -cE 'Target\.'` = 0 in all
  four) and bind the tab's `webSocketDebuggerUrl` directly from `/json/list` (`chrome-cdp-showpicker-proxy-round91.mjs:339-343`).
  Therefore every `Page.fileChooserOpened` those receipts contain is **by construction a page-session
  event** — but for a frame served from `http://127.0.0.1:<child>` (`child.html` hosts in all four
  drivers), i.e. same scheme+host, other port = **same site** under the claim's own definition.
- The r91 receipt records no session field at all: leg `sp91-xo-proxy-file-childact` `choosers` =
  `[{"params":{"frameId":"5085…","mode":"selectSingle","backendNodeId":10},"afterSendId":29}]`, and
  `sp91-xo-proxy-file-answer` carries `answer` with no `session`. So the "page session" attribution is
  a property of the r91 driver's construction, never a written claim.
- The r91 note (`corpus/knowledge/chromium-showpicker-proxy-runtime-round-91.md:16-17,29-38`) and the
  capability row (`SCORECARD.md:4366`) call that frame "cross-**origin**", and the r91 evidence is
  exactly the shape of this round's **S** arm (same-site, other port → no own target → page session).
- The r92 plan already pre-declares this wording repair: `plans/round-92.md:107-108` appends the
  correction narrowing the r91 row's "cross-origin" to "same-site cross-origin (no own target)".
- Nothing in tabi's knowledge uses site-per-process/eTLD language (`grep -rinE 'different site|eTLD|site-per-process|registrable' corpus/knowledge/` → 0), and no note pairs "chooser" with
  "session" (`grep -rinE 'chooser.{0,40}session|session.{0,40}chooser|arrives on' corpus/knowledge/` → 0).
  The only "page session" prose is `corpus/knowledge/cdp-evidence-patterns.md:49` (a page session is
  obtained without `Target.attachToTarget` — background, not a chooser claim) and
  `harness-hardening-round-18.md:38` (port-access security).

**Adjacency to state, not smooth over:** the word "cross-origin" is used in two senses across the lane
(r91 = other port, same site; r92 = other site). A reader who carries the r91 sense into r92 could read
the X arm as contradicting r91. It does not: r92 X is `localhost` vs `127.0.0.1` (`chrome-cdp-iframe-chooser-round92.mjs:52,115`;
counter `child-url` requires hostname `localhost` for X, `127.0.0.1` for S,
`check-iframe-chooser-round92.mjs:112-120`), and r91 never ran a `localhost` child
(`grep -rln localhost scripts/` → only r92's three instruments + the round-35 BiDi/round-32 notes).
This is the pre-declared limit-2 repair, not a defect.

## 4. Wording-vs-counter note (observation, no attack artifact produced)

`chooser-session` / `answer-session` (`check-iframe-chooser-round92.mjs:132,134`) compare a
**driver-labelled** `session` field (`'iframe'` in X, `'page'` in S) that the driver derives from the
`attachedToTarget` event's `sessionId` (`chrome-cdp-iframe-chooser-round92.mjs:146-157,189`). The
counter therefore binds the wire session through the pinned driver's map, not a raw sessionId in the
receipt; `iframe-target-count` (exactly one `iframe` attachment) closes the obvious second-target
loophole. This is inside the claim's declared limit 6 (the counting command is `--live`) and no sibling
or prior-lane artifact widens it.

## Counts

| quantity | value |
|---|---|
| sibling lanes scanned | 20 |
| sibling `corpus/knowledge` files scanned | 1750 |
| sibling `SCORECARD.md` files scanned | 20 |
| exact-keyword hits (7 terms) | 0 |
| near-term hits classified | 14 rows over 10 lanes |
| overlap | 0 |
| contradiction | 0 |
| tabi prior claims of "chooser on the page session" for a different-site frame | 0 |

VERDICT C1: neutral — evidence `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-92/w1/R92Connector.md` (§1–§3): zero sibling hits on all seven terms; the lane's only prior page-session chooser observation is r91's **same-site** (`127.0.0.1:<other port>`) fixture — the S arm's shape, not a counterexample to X — and the r91/r92 "cross-origin" wording collision is already scheduled for an append-only correction at `plans/round-92.md:107-108`. No artifact produced by this seat shows the claim's stated wording false, or wider than what the counter enforces.
