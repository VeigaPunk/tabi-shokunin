# R100Scout — source reconnaissance for C1 (round 100, `client-oopif-uploadsets-linux`)

Seat: scout. Axes: freshness + coverage of primary sources bearing on C1 and the next rounds.
Scope: fetch and open sources only — no instrument run, no chromium run, no row written (rows are the L1's).

## Verdict summary (read first)

Nothing I opened falsifies a leg-level statement of the frozen predicate, and I found no place where the
committed counter enforces a narrower property than the frozen sentence states. The scored `--live` run
committed at `88b488db` is clean (`.ufo/waves/round-100/scored/c1-live.json`: `verdict clean`, 18 legs,
`findings []`, 216 checks) and the pre-freeze probe shows all six arms behaving as the predicate states.
I did not run `--live` myself; the rubric's falsifies-wording bar ("instrument narrower than the
sentence" / "a leg-level statement false on a `--live` run") is not met, and no count is in dispute. Two
**citation-level** defects in the frozen §Claim "Sourced" paragraph are leads for the L1 (below) — they
change no predicate bullet.

Fetch evidence (URL, HTTP status, byte count, sha256, ≤25-word quote with anchor, and which frozen
sentence each source supports/bounds/contradicts): `.ufo/waves/round-100/w1/R100Scout-fetch-evidence.txt`.
Token/sentence-presence counts behind L1: `.ufo/waves/round-100/w1/R100Scout-whatwg-tokens.json` (staged
lane copy vs. my fresh fetch: identical sha256, `webkit`/`webkitRelativePath`/`webkitdirectory` = 0 in both;
entries API: 92/31/19). Copies of the two lane receipts I cite:
`R100Scout-cited-c1-live.json` (sha256 `795e8198d42d…`), `R100Scout-cited-probe-a-log.txt`
(sha256 `005c240dbe29…`), both beside this file.

## Sources opened (all HTTP 200 unless noted) — 24 documents + 12 GitHub API reads

| Source | Bytes / sha256 (prefix) | What it settles for C1 |
|---|---|---|
| html.spec.whatwg.org/multipage/input.html | 687515 / `b0202de1c0b4` | §4.10.5.1.17: filename/path-component rules; the `multiple` one-file constraint (S216 ✓) |
| wicg.github.io/entries-api/ | 316318 / `e38c31e1b582` | the real home of `webkitRelativePath` + `webkitdirectory` (S250's actual definition) |
| www.w3.org/TR/FileAPI/ (WD 2026-09-12) · fs.spec.whatwg.org/ | 567075 / `975b6f12f513` · 532385 / `0bf200adc73a` | neither the File API nor the File System API defines `webkitRelativePath` (0 hits) |
| playwright.dev class-locator#locator-set-input-files | 572368 / `f9138a4894` | `setInputFiles` takes `string \| Array<string> \| Object \| Array<Object>`; `webkitdirectory` ⇒ single directory path only |
| pptr.dev ElementHandle.uploadFile (v25.16.0) | 36863 / `a423b9d3fc2` | `uploadFile(...paths: string[])` — variadic paths, no payload/directory form |
| playwright v1.65.0 `server/dom.ts` · `server/fileUploadUtils.ts` · `client/elementHandle.ts` | 49422 `65cb43c91893` · 3437 `96dd5ef0713` · 15091 `b5e6046e19c` | S240 verbatim at dom.ts 756-761 (exact); S238's guard at fileUploadUtils 42-43 (plan says 44); S248/S249 verbatim at elementHandle 287/278 |
| playwright v1.65.0 `client/browserType.ts` · `types/types.d.ts` | 9237 `aba34e1963` · 1152533 `345bf3cb397` | `connectOverCDP` forwards `isLocal` (line 165); `isLocal` = "runs on the same host as the CDP server" |
| playwright v1.65.0 `injected/src/injectedScript.ts` · `server/chromium/crPage.ts` | 85112 `ff78c2368ac` · 59431 `918f0f9beed` | payload path ⇒ `input.files = dt.files` + `dispatchEvent(new Event(...))` ⇒ **untrusted**; path path ⇒ `DOM.setFileInputFiles` ⇒ browser assignment ⇒ **trusted** |
| puppeteer v25.16.0 `cdp/ElementHandle.ts` | 6124 / `c86ed958566` | S237 verbatim at lines 113-116 (exact) |
| chromium blink `file_input_type.cc` · `net/base/directory_lister.cc` · `chrome/browser/file_select_helper.cc` · blink `html_input_element.cc` | 23564 `98bb621e815` · 6357 `13431dbb3ce` · 38086 `32bb2af4673` · 101306 `7ebd88756dc` | `webkitdirectory` ⇒ `SetFilesFromDirectory` ⇒ Chromium's own enumeration; `NO_SORT_RECURSIVE` ⇒ `recursive = true`; relative path starts with the base dir's basename; `kWebkitdirectoryAttr` handled in Blink |
| issues.chromium.org issue 345393164 | 100409 / `5c9a0d835875` | upstream bug: headless `DOM.setFileInputFiles` historically ignored nested dirs |
| MDN `File.webkitRelativePath` · MDN `input` | 151687 `7e4f8ff3248` · 309441 `642b43a99ba` | "path relative to the directory selected by the user"; `webkitdirectory` "is defined in the File and Directory Entries API" |
| GitHub issues opened (5) · search reads (7) | — | playwright #16846, #31706, #43367, #6854; puppeteer #5499 — bodies read; searches cover duplicate-name / empty-file / mixed-call / webkitdirectory |

Non-200s (all in the evidence file): GitHub search API secondary rate limit → 403 on three puppeteer
queries; 404 on `playwright-core/src/server/connection.ts` and two Blink `file.cc` paths; 405 on the Chromium
issue `updates` endpoint (issue status not machine-readable from the API surface I reached); DNS for
`files.spec.whatwg.org` (File API taken from w3.org/TR instead); 404 on Chromium CL 4066986's body → the
directory-upload history was read from the issue comment, which quotes the CL.


## Mechanism corroboration (leg by leg) — every arm's stated cause holds at the pinned versions

- **DUP3 / EMPTY1** (`connectOverCDP`, no `isLocal`): payload path → server `injected.setInputFiles`
  (`injectedScript.ts` L1020-1029) assigns `input.files` from a `DataTransfer` and dispatches
  `new Event('input'|'change')` from page script ⇒ `isTrusted === false`, matching the predicate's
  untrusted events. Three payloads with two `dup.txt` names are three distinct `File`s in one
  `DataTransfer` ⇒ duplicates survive ⇒ "not deduped or renamed" is sound.
- **MIXED** (`connectOverCDP(url, {isLocal:true})`): the mixed check is **client-side**
  (`client/elementHandle.ts` L285-287, `items.some(isString) && !items.every(isString)` ⇒ throw
  `'File paths cannot be mixed with buffers'`) — it fires before any browser call, so "nothing set, no
  event, no read" is exactly right.
- **LAUNCH2PL / LAUNCH2PU** (client-launched, two paths): `localPaths` reach the browser as paths
  (`crPage.ts` L343-352 `DOM.setFileInputFiles`) ⇒ browser-side assignment ⇒ **trusted** events.
  Puppeteer's `uploadFile` asserts `files.length <= 1 || isMultiple` (S237) — legal here only because
  `#m` carries `multiple`.
- **DIR** (`isLocal:true`, one directory path, `#d`): client → server `localDirectory` → `dom.ts`
  `directoryUpload` branch (requires `webkitdirectory`, S240 L758) → `DOM.setFileInputFiles` → Blink
  `SetFilesFromDirectory` → Chromium's recursive enumeration. `webkitRelativePath` = `probe-dir/one.txt`,
  `probe-dir/sub/two.txt` is **Chromium's** construction (relative path *starting with the basename of the
  base dir*, `file_input_type.cc` L305-350), not a Playwright artefact and not a spec-mandated string.
- **Trusted vs untrusted** is therefore a client-vs-path distinction, exactly as the predicate has it:
  payload arms (DUP3/EMPTY1) inject synthetic Events (untrusted), path arms (LAUNCH2PL/PU) and the
  directory arm (DIR) go through `DOM.setFileInputFiles` (browser assignment, trusted).

## Leads (for the L1 to open and turn into rows; both citation-level, neither changes a predicate bullet)

**L1 — S250's source attribution is wrong for the half that matters.**
The plan (plans/round-100.md, §Claim "Sourced") says S250 is "WHATWG `input.html` §4.10.5.1.17 second
half: the File Upload state's filename/webkitRelativePath directory semantics — 'Filenames must not
contain path components...' **plus the `webkitRelativePath` definition**". The staged input.html
(`.ufo/waves/round-100/sources/whatwg-input.html`, sha256 `b0202de1c0b4…`, byte-identical to my fresh
fetch) contains **zero** occurrences of `webkit`, `webkitRelativePath` or `webkitdirectory` (counted on
the tag-stripped text as well as the raw bytes; see `R100Scout-whatwg-tokens.json`). The
`webkitRelativePath` IDL and getter live in the WICG File and Directory Entries API
(`https://wicg.github.io/entries-api/`, anchor `#dom-file-webkitrelativepath`: *"The webkitRelativePath
getter steps are to return this's relative path, or the empty string if not specified."*), which MDN
names as the spec for `File.webkitRelativePath` and for `webkitdirectory`; the File API (W3C WD
2026-09-12) and the File System API define it nowhere. The input.html half of S250 is correct — the quoted
"Filenames must not contain path components … entire directory hierarchy" sentence *is* in §4.10.5.1.17,
and it does the work the plan wants (it is why `File.name` is `one.txt` while the path rides in
`webkitRelativePath`). Suggested narrowing: attribute the `webkitRelativePath` definition to the entries
API and the *string values* to Blink (`file_input_type.cc` L305-350), keeping input.html for the filename
rule. **This is a citation defect, not a law defect** — no predicate bullet, count, or control changes.

**L2 — S238's line citation is off by one/two.** The plan cites "fileUploadUtils.ts v1.65.0 line 44" for
the exactly-one guard; in the pinned v1.65.0 file that construct sits on **lines 42-43** (`if
([payloads, localPaths, localDirectory, streams, directoryStream].filter(Boolean).length !== 1)` at 42,
the `throw new Error('Exactly one of payloads, localPaths and streams must be provided')` at 43). The
quoted code and the file are right; only the line number is wrong. The plan's other two fileUploadUtils
references ("line 80 the mimeType fallback", "line 62 the collocation branch") I verified as exact, as are
S240's dom.ts lines 756-761 and S237's ElementHandle.ts lines 113-116.

**L3 (coverage note, not a defect) — the DIR arm's exact strings depend on `isLocal: true`.**
`ConnectOverCDPOptions.isLocal` means "Playwright runs on the same host as the CDP server"
(types.d.ts L26060-26063) and is what lets `localDirectory` travel as a *path* (`fileUploadUtils.ts`
L39-40 rejects `localPaths` when the client is not local). In the remote/stream branch
(`client/elementHandle.ts` L291-309) the directory is copied to a temp root and the names are rebased on
that temp root, so `webkitRelativePath` would name the temp directory instead of `probe-dir/`. The frozen
predicate's strings are therefore reproducible only under the declared `isLocal` pin — worth a declared
limit in the next round, and worth a leg that runs DIR without `isLocal` to see the alternative shape.

## Coverage notes / gaps (honest limits of this seat's work)

- **Duplicate file names**: no upstream issue exists for duplicate names in `setInputFiles` — the search
  returned 12 hits, all unrelated (dependabot bumps, a docs alias dedupe). DUP3's "duplicates kept" rests
  on the counter's own observation plus WHATWG's filename rule; nothing else to cite.
- **Mixed path+payload calls**: the message `'File paths cannot be mixed with buffers'` appears in **no**
  upstream issue (search: 2 unrelated hits); the only source is the Playwright client code.
- **Zero-byte files**: closest upstream items are historical (puppeteer #5499 "uploadFile uploads empty
  file", v1.20-era; #8043, #5776, #5543 about empty `file.type`) — none contradicts the EMPTY1 arm.
- **webkitdirectory uploads**: playwright #43367 ("Directory setInputFiles can miss its input event and
  time out") and #31706 (Chromium *skips* a file uploaded into a directory input) are the real hazards;
  both are consistent with the DIR arm's "the directory path is passed, not a file". Chromium issue
  **345393164** ("Headless: DOM.setFileInputFiles does not upload nested directories") is the sharpest
  historical bound on the DIR arm's recursion: the nested walk is Chromium behaviour that was once broken
  headless. The frozen predicate states observed values on this build (probe-a DIR leg:
  `probe-dir/sub/two.txt`), and Blink's `NO_SORT_RECURSIVE` enumeration is the current mechanism — but a
  future round must not assume recursion is a Playwright guarantee.
- I did **not** read the WebKit/Juggler or Firefox upload paths beyond the issue text; #31706 and #43367
  show both behave differently, so a cross-engine round would need their own sources.

## Commands actually run (read-only fetches; no installs, no sudo, no git/jj mutation)

```
curl -sSL -w '%{http_code}' -o <file> <url>   # every document above
sha256sum <file> ; stat -c %s <file>          # byte count + digest for the evidence file
python3 - <<'PY' ...                         # tag-strip + token/sentence counting on the HTML copies
grep -n on lane files (read-only)             # plans/round-100.md, scripts/*, .ufo/waves/round-100/**
```

Tooling: nothing installed or upgraded this seat (curl/python3/git already present) — per the operator
directive of 2026-10-19 nothing to record beyond "no change". Scratch was
`/fast/scratch/hyaku/tabi-r100/R100Scout/` (fetched copies only; removed on exit). No chromium was launched
by this seat and `pgrep -f "remote-debugging-port"` is empty. Only files under `.ufo/waves/round-100/w1/`
were written; no lane file outside that directory was touched (`git status` shows no modified tracked file).

## What the L1 should do with this

1. Open the L1's own copy of the two sources behind S250 (WHATWG input.html vs. the WICG entries API) and
   decide whether the frozen §Claim "Sourced" paragraph needs the same treatment as Amendment A1's two
   narrowings. Predicate bullets, counting command and controls are untouched by this finding.
2. Optionally fold L3 into the next round's declared limits (DIR string shape depends on the `isLocal`
   pin), and open chromium issue 345393164 as the recursion bound for a follow-up directory round.

VERDICT C1: neutral
