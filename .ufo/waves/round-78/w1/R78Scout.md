FINDINGS

# R78Scout — round 78 w1 source verification and next-frontier location

Seat scope: independently fetch S214 and S215, `cmp` against the L1-staged copies, locate the two
lines the r78 note cites and say whether they support what the note makes of them, then locate ONE
next-frontier source for the file-chooser surface with a located quote, and give a reject reason for
the alternatives.

Everything below is read-only verification. I ran no counter, no battery, no kill-power, no selftest;
I read no receipt, wrote no receipt, and edited no receipt. The only writes are this report and one
JSON under my own seat directory.

## 1. Independent re-fetch of S214 and S215

Both URLs were fetched by me, in this session, with `curl -sS -L --max-time 90`.

| id | url | http | bytes | sha256 | accessed at | `cmp` vs staged |
|---|---|---|---|---|---|---|
| S214 | https://playwright.dev/docs/api/class-filechooser | 200 | 50956 | `3dc2d551d6bf8799d16df72790cb979b0c28688fa907af5c8e99d5300171b948` | 2026-11-07T15:15:21-03:00 | exit 0 |
| S215 | https://pptr.dev/api/puppeteer.page.waitforfilechooser | 200 | 54126 | `9aa1a06eabe1508887a8291e67fbb5ca3eff49234de6466f6cb6bee5ceacc6fa` | 2026-11-07T15:15:21-03:00 | exit 0 |

- `cmp` commands: `cmp s214.html .ufo/waves/round-78/sources/playwright-filechooser.html` → exit 0;
  `cmp s215.html .ufo/waves/round-78/sources/puppeteer-waitforfilechooser.html` → exit 0. Both fetched
  copies are byte-identical to the staged ones.
- The bytes and hashes match `.ufo/waves/round-78/sources/FETCH.txt` exactly (`bytes=50956`/`bytes=54126`
  and the two sha256 values above), so the L1's fetch claims reproduce.
- Response headers: S214 `last-modified: Thu, 05 Nov 2026 18:50:07 GMT`, `etag: "6aeccfdf-c70c"`;
  S215 `last-modified: Fri, 06 Nov 2026 15:05:22 GMT`, `etag: "6aedecb2-d36e"`. Both are living
  documentation pages, which is why the SOURCES rows carry a 90d recheck.
- Staged copies on disk: mtime/atime 2026-11-07 12:56:42 -0300, sizes 50956 and 54126.

## 2. The two lines the note cites — located, and do they support it?

| id | quote (words) | locator | verbatim? | supports the note? |
|---|---|---|---|---|
| S214 | "Returns input element associated with this file chooser." (8) | `class FileChooser` → Methods → `element` (Added before v1.9); fetched-page byte offset 33823, text line 11 | yes | yes |
| S214 | "Returns whether this file chooser accepts multiple files." (8) | `class FileChooser` → Methods → `isMultiple` (Added before v1.9); byte offset 35397, text line 22 | yes | yes |
| S215 | "This must be called before the file chooser is launched. It will not return a currently active file chooser." (19) | `Page.waitForFileChooser()` method page → `caution` admonition; byte offset 43496, text line 6 | yes | yes |

Grep that located them (exit 0 each):
`grep -no "Returns input element associated with this file chooser\.\|Returns whether this file chooser accepts multiple files\." s214.html`
→ lines 11 and 22; `grep -no "This must be called before the file chooser is launched\. It will not return a currently active file chooser\." s215.html`
→ line 6.

Assessment, claim by claim:

- **Note §1, "the client answers a chooser through the input it belongs to, never through an id."**
  S214's `element` line states the chooser is tied to an input element, and `isMultiple` states the
  multiplicity is a property of that chooser/input — so the note's client-side reading is supported by
  the cited text. The note correctly scopes this to client-side usage (S214 is a Playwright API page,
  not Chromium behaviour), and the note's own lesson file already rejects the stronger reading
  ("`fileChooser.element` (S214) proves the CDP id binding"). One adjacent line the note does not cite
  but the page carries, at byte offset 38540: `fileChooser.setFiles` "Sets the value of the file input
  this chooser is associated with." — that is the line that states the answering step itself, and it is
  the sharpest client-side support for the note's §1 sentence. The note cites the two property lines
  instead; citing `setFiles` as well would make §1 self-contained.
- **Note §4, "a client must arm interception before the click that opens the chooser."** S215's caution
  supports it verbatim and in the right place: the caution block sits directly under "This method is
  typically coupled with an action that triggers file choosing." The note's claim that the driver's
  `Page.setInterceptFileChooserDialog` sends are therefore the first sends of their legs is an
  inference from this API contract onto the wire; it holds, but it is the note's inference rather than
  something S215 states about CDP.
- Nothing in the cited text supports any *Chromium* behaviour claim; the note does not ask them to.

## 3. Next frontier source — one row

**Source.** Chromium 155.0.8059.84's own WebDriver-BiDi file-dialog surface: the `chromium-bidi` mapper
bundled in the lane's Chromium source tree —
`https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/chromium-bidi/src/bidiMapper/modules/context/BrowsingContextImpl.ts`

| field | value |
|---|---|
| kind | code |
| tier | A |
| scope | How Chromium's own production BiDi client answers the file-chooser surface that CDP exposes: the CDP `Page.fileChooserOpened` event converted into the BiDi `input.fileDialogOpened` event, the mode→multiple mapping, the element binding through the shared id, and the `input.setFiles` command that delivers files to the opened input |
| anchor | tag 155.0.8059.84, `third_party/chromium-bidi/src/bidiMapper/modules/context/BrowsingContextImpl.ts:432-467` (CDP `Page.fileChooserOpened` handler; element bound at 445-453; multiple at 461), `src/bidiMapper/modules/script/SharedId.ts:20-26`, `src/bidiMapper/modules/input/InputProcessor.ts:76-254` (multiple guard 104, `DOM.setFileInputFiles` 230, zero-length fallback 152-157, untrusted-event note 235), `src/bidiMapper/modules/cdp/CdpTarget.ts:213-222`, `src/bidiMapper/CommandProcessor.ts:424-425` |
| teaches | Chromium's own client answers a chooser through the element, never through the bare browser id: it converts the CDP `backendNodeId` into a shared id **qualified by frame id and document id**, so the same id in another document is a different element. It maps the CDP mode to a boolean `multiple` exactly as the input's `multiple` attribute dictates, and refuses more than one file on a non-multiple input. It also records that the zero-length array is special (`DOM.setFileInputFiles` does not update the files) and that the resulting events are not trusted. |

**Located quote** (the reason for the choice), `BrowsingContextImpl.ts:461`:

> `multiple: params.mode === 'selectMultiple',`

second quote, `BrowsingContextImpl.ts:449-452`:

> `sharedId: getSharedId(this.id, this.#loaderId, params.backendNodeId),`

with the id's shape at `SharedId.ts:20-26`: `` return `f.${frameId}.d.${documentId}.e.${backendNodeId}`; ``

**Why this one.** It is a primary source pinned to the lane's exact Chromium tag, and it is Chromium's
own production client exercising the *same* CDP surface the r78 driver measures. It gives the r78 note
its missing mechanism for the drift the note reports in §1 (`#s` 5 in 23 runs and 4 in one, `#m` 7 and
10): a `backendNodeId` is meaningful only once qualified by the document it was issued in, which is
exactly what Chromium's own client does — `f.<frame>.d.<document>.e.<backendNodeId>`. It also
independently confirms the note's §2 mode claim from the other direction (Chromium derives a boolean
`multiple` from the CDP mode, and the spec derives it from the element's `multiple` attribute), and it
confirms the note's §6 zero-length and trusted-event claims from Chromium's side rather than from
Puppeteer's. The r78 counter's page-measured-descriptor binding is thus corroborated by Chromium's own
answer path, not only by Playwright's.

**Companion spec text** (same surface, normative wording): W3C WebDriver BiDi `index.bs` at commit
`ec17888e902359ce7fc5278dc4655b83ec3089a0` (2026-11-06, http 200, 555211 bytes, sha256
`325055ff4cb4bcaf3a34a6e020741795d1f51bbae8fa1f0fe5797b6dfa1c73a6`) — "The input.fileDialogOpened Event"
at line 15355 (`#event-input-fileDialogOpened`), "The input.setFiles Command" at line 15265
(`#command-input-setFiles`), and the multiple rule at 15395-15396 ("If |element| is not null and
|element|'s <{input/multiple}> attribute is set, set |multiple| to <code>true</code>."). Note this spec
text is a *second scope* of the existing S005 row (the BiDi spec), not a new registry entry; the new
registry entry is the Chromium-side implementation code.

**Note for the L1's SOURCES bookkeeping.** The Chromium-side implementation is not currently covered:
S012 is the chromium-bidi README only ("README only", explicitly), and S131 is `CdpTargetManager.ts` at
tag 154 for browsing-context id shape. A new row for the file-dialog path at tag 155.0.8059.84 is
therefore an addition, not a second scope — but its `used-by` should be the r78 note only after the note
cites it, and it must not be cited for the *scored* claims it cannot evidence (it is Chromium's BiDi
client, not the CDP interception contract the r78 counter measures).

## 4. Rejected candidates, with reasons

**Blink's `<input type=file>` HTML spec section** — https://html.spec.whatwg.org/multipage/input.html
(fetched http 200, 687515 bytes, sha256 `b0202de1c0b422d94d7aa23b4f1b0e3126d9d044bf7076394b6e00451f0fcd16`).

Reject, for two independent reasons. (a) It is a living, unpinned standard: the page carries no
revision marker and changes under the lane's feet, so it cannot be cited at Chromium 155.0.8059.84 — the
same defect that made the round-77 S-source set prefer `?format=TEXT` at a pinned tag. (b) It is the
wrong altitude for the open question. Its file-upload-state section (id `file-upload-state-(type=file)`,
§4.10.5.1.17) states the platform semantics of the input element — "the rules in this section apply.
The input element represents a list of selected files" — and says nothing about interception, the
chooser event, or how a client answers a chooser, so it supplies no line the note's open question
needs. It is also redundant here: the lane already holds Blink's implementation of that state at this
tag as S210 (`file_input_type.cc`, including the `input.Multiple()` probe the note cites as S211). Flip
condition: a dated WHATWG snapshot pinned to a commit, cited only for the file-upload-state normative
steps Blink's `file_input_type.cc` does not implement.

**DevTools frontend's file-chooser panel code** — `devtools-frontend` at revision
`a7b389bcb341f6e5e1bfa107992d3c327db75736`, which is the revision
`third_party/devtools-frontend/src` points at in tag 155.0.8059.84 (confirmed by
`curl .../refs/tags/155.0.8059.84/third_party/devtools-frontend/src/?format=JSON` → `revision
a7b389bcb341f6e5e1bfa107992d3c327db75736`); cloned read-only to scratch.

Reject because **there is no file-chooser panel to read**. The only two frontend handlers of the chooser
event are empty no-ops — `front_end/core/sdk/ResourceTreeModel.ts:1203-1204`
(`fileChooserOpened({}: Protocol.Page.FileChooserOpenedEvent): void {` + empty body) and
`front_end/core/sdk/ScreenCaptureModel.ts:236-237` (same shape, `_params`) — and no non-generated
frontend code calls `Page.setInterceptFileChooserDialog` at all: the only matches are the generated
protocol bindings (`front_end/generated/InspectorBackendCommands.ts:1165`,
`front_end/generated/protocol.ts:15813`) and the vendored Puppeteer copy under
`front_end/third_party/puppeteer/`. The nearest user-visible string is a back/forward-cache eligibility
message — `front_end/panels/application/components/BackForwardCacheStrings.ts:395`,
`contentFileChooser: 'Pages that use FileChooser API are not eligible for back/forward cache'` — which
is about the FileChooser API and cacheability, not about interception or binding. A panel that does not
exist cannot teach the binding question, and the vendored Puppeteer copy is the client-side contract the
note already cites as S215, so it adds no new source kind. Flip condition: a future frontend revision
that adds a visible chooser panel or gives one of those handlers a real body.

Worth noting for depth, since it is a genuinely new observation and it *corroborates* the note's
§4 arming claim from Chromium's own tree: the vendored `puppeteer-core` 25.10.0 in that same frontend
revision implements `waitForFileChooser` by sending the CDP arm inside the wait
(`front_end/third_party/puppeteer/package/src/cdp/Page.ts:513-540`, the
`Page.setInterceptFileChooserDialog` send at :537). So the "arm before the click" rule is not only an
API-page caution (S215) — it is what the client's code does.

## 5. Bearing on the note's claims

- **Note §1 (id is not an element property).** Consistent, and now mechanism-backed: Chromium's own
  client makes the id meaningful only by qualifying it with frame and document
  (`f.<frame>.d.<document>.e.<backendNodeId>`). A bare id carries no cross-document identity, which is
  why the r78 counter reports the id instead of requiring a literal.
- **Note §2 (mode is the input's attribute).** Independently confirmed from two directions: Chromium's
  mapper derives `multiple` from the CDP mode (`BrowsingContextImpl.ts:461`), and the BiDi spec derives
  it from the element's `multiple` attribute (`index.bs:15395-15396`).
- **Note §4 (arm before the click).** Supported by S215 as cited; the note's extension to "the driver's
  `Page.setInterceptFileChooserDialog` sends are therefore the first sends of their legs" is the note's
  inference, correct but not stated by S215.
- **Note §6 (zero-length and trusted events).** Corroborated from Chromium's side by
  `InputProcessor.ts:152-157` ("DOM.setFileInputFiles does not actually update the files in that case")
  and the `// XXX: We should dispatch a trusted event.` note at :235.
- **Note §5 (a consistently relabelled id is undetectable).** Still true, and consistent with the new
  source: no check pins a bare id, and Chromium's own client qualifies it rather than trusting it.

No defect found in the cited quotes or in what the note makes of them. The one gap is editorial, not
factual: note §1's sentence is carried by `fileChooser.element`/`isMultiple` while the page's
`fileChooser.setFiles` line is the one that states the answering step.

## 6. Scope, discipline and hygiene

- No `git`/`jj` mutation, commit or push anywhere; the only `git` use was `clone --depth 1` and
  `checkout` of the read-only devtools-frontend mirror into scratch, plus `rev-parse --show-toplevel`
  (printed `/fast/scratch/hyaku/tabi-r78/R78Scout/dtfe`, asserted before use) and `rev-parse HEAD`.
- Scratch: `/fast/scratch/hyaku/tabi-r78/R78Scout/` (fetched pages, the devtools-frontend mirror, the
  decoded Chromium sources), removed on exit.
- Disk guard checked before the heavy pass: `bash /home/vgpnk/Projects/shokunin/scripts/hyaku/disk-guard.sh status`
  → exit 0; `/fast/scratch/hyaku` at 50 % use, 402.2G free. No `--jobs` above 6 used.
- Tools installed or upgraded: **none**. No `pacman`, `uv tool install`, `cargo install` or `npm -g` this
  session; every fetch used `curl` and `git` already present.
- Writes: this report (`.ufo/waves/round-78/w1/R78Scout/report.md`) and one JSON under my own seat
  directory (`.ufo/waves/round-78-seats/R78Scout/source-verification.json`). Nothing else was written
  anywhere in the lane, fleet or sibling repos; in particular no JSON, no receipt and no file carrying
  the receipt schema string was written under `.ufo/waves/round-78/` or `corpus/evidence/round78/`, so
  the counter's prior-set walk is unaffected by this seat.
- The L1's mid-flight note about `prior-set-unparsable` naming
  `.ufo/waves/round-78/scored/selftest-r78-gates.out` was acknowledged; that is the L1's own artifact
  and I have no action on it (I ran no counter).

## 7. Verdict

**FINDINGS.** S214 and S215 re-fetch byte-identical to the L1-staged copies (`cmp` exit 0 both, http 200,
sha256 matching `FETCH.txt`); both cited lines located verbatim at stable locators and both support the
statements the note makes of them. One next-frontier source located with a located quote — Chromium
155.0.8059.84's own BiDi file-dialog path in `third_party/chromium-bidi`, which explains the r78 note's
observed id drift and corroborates its mode, zero-length and trusted-event claims from Chromium's side.
Both alternatives rejected with located evidence: the WHATWG section is unpinned and wrong-altitude
(Blink's implementation of the same state is already S210), and the DevTools frontend file-chooser panel
does not exist at the pinned revision (both chooser-event handlers are empty no-ops).

Unrun = not passed. This seat ran no counter, no battery, no kill-power and no selftest, and makes no
claim about C1 or C2 verdicts.
