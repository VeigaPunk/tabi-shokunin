VERDICT: ISSUES

# S061 — Playwright CDPSession (round 18, wave 2)

Read-only. Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, measured revision
`530f40a9bc3f10436161a2af1ca0fe9bffffc004` (`git -C LANE rev-parse refs/heads/master` returns that
full 40-hex; `git status --porcelain=2` shows only `? .ufo/waves/round-18/w2/`). No production, fleet,
sibling, jj or Git-index write. No browser launched, no page JavaScript, no page tool, no REA device.
All fetch bodies and the cloned harness were written only under `/tmp/s061probe`; the single fresh
S058 listing fetch is GET-only. No tool installed or upgraded.

## 1. S061 row, Gate entry, dossier

- Row: `corpus/SOURCES.md:75` at REV (13 cells):
  `| S061 | Playwright CDPSession — https://playwright.dev/docs/api/class-cdpsession | docs | A | Page CDP sessions and launched-Chromium transport at Playwright 1.64.0 | §CDPSession first paragraph; v1.64.0 chromium.ts:355-358, browserType.ts:274-278, chromium/crBrowser.ts:606-620 | newCDPSession(page) uses the existing launched-browser pipe; session messages are not captured wire frames or wire request IDs | mined | 2026-10-20 | on-release | corpus/knowledge/harness-hardening-round-18.md |`
- Gate entry: `corpus/lessons/round-18.md:42`.
- Dossier: `.ufo/waves/round-18/sources/SrcPwCdpSession.md` §7 (Gate entry), §2 (source row), §5
  (facts), §8 (H3 reconciliation, lines 159-166).

## 2. Re-opened S061 URL — observed, full digests

Commands (two independent fetches):

```text
cd /tmp/s061probe
curl -sS -D h1 -o page.html --max-time 30 https://playwright.dev/docs/api/class-cdpsession
curl -sS -o page2.html --max-time 30 https://playwright.dev/docs/api/class-cdpsession
sha256sum page.html page2.html
cmp page.html page2.html; echo cmp_exit=$?
```

Observed:

- HTTP/2 200, `content-type` absent from header dump but body is the 54215-byte page;
  `last-modified: Tue, 20 Oct 2026 16:46:38 GMT`; `etag: "6ad79aee-d3c7"`;
  `x-origin-cache: HIT`; `date: Tue, 20 Oct 2026 20:02:16 GMT`.
- `sha256sum` both fetches:
  `21e1e5fae236a50b02bbe49e7abf04f6b832a0375f2898cfa4abbae27be41fba`
- `wc -c` 54215 B. `cmp` exit 0. This exactly reproduces the Gate's full digest and byte count.
- `node .ufo/waves/round-18/recheck-fetch.mjs --normalize-only --decode html-text --body page.html --quote '<quote>'`:

```json
{"found":true,"offset":1054,"normalizedLength":3362,"window":"stCase TestError TestResult TestStep Experimental Android AndroidDevice AndroidInput AndroidSocket AndroidWebView Electron ElectronApplication API reference Classes CDPSession On this page CDPSession The CDPSession instances are used to talk raw Chrome Devtools Protocol: protocol methods can be called with session.send method. protocol events can be subscribed to with session.on method. Useful links: Documentation on DevTools Protocol can be found here: DevTools Protocol Viewer . Getting Started with DevTools Protocol: htt"}
```

Exact quote (19 words):

> The CDPSession instances are used to talk raw Chrome Devtools Protocol: protocol methods can be called with session.send method.

`printf '%s' '<quote>' | wc -w` → `19`. Normalized offset 1054 of 3362 is reproduced exactly.

Docs source (both tag URLs, HTTP 200):

```text
https://raw.githubusercontent.com/microsoft/playwright/v1.64.0/docs/src/api/class-cdpsession.md
https://raw.githubusercontent.com/microsoft/playwright/v1.64.1/docs/src/api/class-cdpsession.md
sha256 d6e61eb3a96d3aaa4a9ead1112d15af88131f3eb2b1ae0fe2b621ecdf94c95c7  (5355 B, both)
cmp cdp-v1.64.0.md cdp-v1.64.1.md -> exit 0
```

`nl -ba cdp-v1.64.0.md | sed -n '4,6p'`:

```text
     4	The `CDPSession` instances are used to talk raw Chrome Devtools Protocol:
     5	* protocol methods can be called with `session.send` method.
     6	* protocol events can be subscribed to with `session.on` method.
```

Tag commits fetched from the GitHub refs API:
v1.64.0 `606ecd8b34bac100db32561b6278ffd76e5eb3cd`; v1.64.1
`cfe490d941f992655948eee8fd4fd94e1c4234bf`. Both match the dossier and Gate.

Playwright transport source at v1.64.0 (HTTP 200, exact digests; line checks):

```text
chromium.ts   24158 B  9fe3ffe11e57d54564a9ea360efc6f39fa8c9395c338299844acb917f2b3dd47
browserType.ts 17388 B f63faa5ac82e65629520d25a4c86496aafe9bffc49a5ed6242f885a700cd008e
crBrowser.ts   24665 B d8362d85b9a11ff6503e900df3401bc77fb2059286c75d59df648fdb656c7a96
```

- `chromium.ts:355-358`: `defaultArgs(...)` pushes `--user-data-dir=...` then
  `--remote-debugging-pipe`.
- `browserType.ts:274-278`: `if (!this.supportsPipeTransport(options)) { WebSocketTransport.connect(...) }
  else { const stdio = ...; transport = new PipeTransport(stdio[3], stdio[4]); }`
- `browserType.ts:341-343`: `supportsPipeTransport(options) { return true; }`
- `crBrowser.ts:606-620`: `newCDPSession(page)` resolves `_targetId` and returns
  `rootSession.attachToTarget(targetId)`; `:610-614` throws for a `Frame` without a separate session.

Installed runtime (`playwright/package.json` `"version": "1.64.0"`; bundled
`node_modules/playwright-core/lib/coreBundle.js` 3584989 B,
sha256 `2325ca4c1c83070e89dc49fb82525508f0a68e0cf12e2a624277968da216b7e0`) matches the dossier.

`node scripts/check-sources.mjs` → exit 0:

```text
SOURCES_GATE verdict=clean rows=64 tiers=A:52,B:4,C:8 status=queued:8,mined:48,rejected:8 findings=0 file=corpus/SOURCES.md
```

## 3. Findings

### F1 (S061, medium) — Row anchor drops the docs-source revision and the pipe condition

The row anchor at `corpus/SOURCES.md:75` is:

`§CDPSession first paragraph; v1.64.0 chromium.ts:355-358, browserType.ts:274-278, chromium/crBrowser.ts:606-620`

It does **not** cite `docs/src/api/class-cdpsession.md:4-5`, the tag commit
`606ecd8b34bac100db32561b6278ffd76e5eb3cd`, or `browserType.ts:341-343`
(`supportsPipeTransport` returning true, which is why the `:274-278` pipe branch is taken). The
dossier's own drafted row at `SrcPwCdpSession.md:132` did carry the docs source and commit; the Gate
entry at `round-18.md:42` carries `class-cdpsession.md:4-5` and says "byte-identical at v1.64.1" but
not the commit; the note at `corpus/knowledge/harness-hardening-round-18.md:3` carries
`class-cdpsession.md:4-6` and the tag but not the commit. The integrated row lost the docs-source
pointer entirely. The served page is `docs-default-stable`
(the dossier identifies stable as 1.64.1); only the docs source at both tags proves the quote is
1.64.0-identical. Row alone cannot establish the row's claimed 1.64.0 revision for the quoted page.

### F2 (S061, medium) — "First paragraph" is not where the quote lives; the quote spans `<p>` + first `<li>`

The served HTML (raw `page.html` byte ~28983) is:

```html
<p>The <code>CDPSession</code> instances are used to talk raw Chrome Devtools Protocol:</p>
<ul>
<li class="">protocol methods can be called with <code>session.send</code> method.</li>
<li class="">protocol events can be subscribed to with <code>session.on</code> method.</li>
</ul>
```

The quoted 19 words are the `<p>` plus the first `<li>`; the second sentence is a list item, not part of
the paragraph. The docs source lines 4-5 show the same split with backticks (`*` bullet). The Gate and
dossier say "served page §CDPSession, first paragraph" and "verbatim"; the normalizer strips tags and
concatenates the block boundary. The match is a normalize-only concatenation, not a contiguous paragraph
or contiguous DOM text. The dossier §3 discloses the docs-source backticks/bullet boundary, but neither the
lesson Gate entry nor the dossier discloses the served-page bullet; the location label is therefore
inaccurate. This is the direct answer to "does
quoted code differ by comment/backticks": the source has backticks and a `*` bullet; the served quote
strips them and crosses a `<p>/<li>` boundary.

### F3 (S061, high) — The `teaches` negative clause is true, but the row's cited evidence does not support it; the dossier's §8 says the opposite

Row `teaches` (second clause): "session messages are not captured wire frames or wire request IDs".
The row anchor cites only the docs quote plus `chromium.ts:355-358`, `browserType.ts:274-278`,
`crBrowser.ts:606-620` — pipe/attach evidence, not `CDPSession.send`/event shape. The docs quote says
`session.send`/`session.on`; it says nothing about wire frames or request IDs.

The clause is factually true at v1.64.0, which I verified independently:

- `packages/playwright-core/src/client/cdpSession.ts` (v1.64.0, 2001 B,
  sha256 `6001c962ca2218b6ef5d6e7d3fad1d11bedc702bb37c4a03558af3c64d34d9ea`):
  `:32-35` emits `event.method`/`event.params`; `:48-53` returns `result.result` from
  `_channel.send`. No wire message `id` is exposed.
- `packages/playwright-core/src/server/chromium/crConnection.ts` (9757 B,
  sha256 `2c082449486bff7d1f4b09d371234acb69ae3d02d5a0c0247981d3b9ab666468`):
  `:68-75` generates the wire id server-side; `:161-170` resolves `object.result` (not the full frame);
  `:224-225` emits child-session events as `{ method, params }`.
- The REV harness itself states the same at `scripts/webmcp-invoke-round18.mjs:827-829`:
  "Playwright's public CDPSession does not expose wire message ids or numeric protocol-error codes;
  synthetic ids correlate each recorded send/response". Its recorder records events as
  `{ method, params }` (`:841-847`) and synthetic ids (`:849-861`).
- The old byte-frozen harness did record parsed wire frames with their real `id`
  (`scripts/webmcp-invoke-round17.mjs:518-527`: `frame = JSON.parse(event.data); record('in', frame);
  if (frame.id ...)`).

But the source dossier at `SrcPwCdpSession.md:163` states the opposite:

> `session.on('event')` (v1.59) can keep the harness's verbatim inbound-frame record, and
> `session.send` replaces the outbound send.

That dossier claim is unsupported by the client/server source and by the REV harness's own comment: the
event payload has no wire `id`, and the new harness uses synthetic ids. The integrated row's negative
clause is the accurate correction, but it was added without updating the dossier §8 and without adding
`cdpSession.ts`/`crConnection.ts` (or the harness) to the row's anchor. This is both an unanchored
`teaches` clause and a stale, opposite premise left in the source dossier.

### F4 (S061/C1, medium) — S061 has no recheck receipt; `eligible_rows` at REV is 58, not 51

`test -e corpus/evidence/round-18/source-recheck/S061.json` → exit 1; the excerpt path → exit 1. The
receipt directory has 51 JSON files (S001-S057 minus S004/S039/S047/S049/S050/S053); none of
S058–S064 exists. `node .ufo/waves/round-18/measure-c1.mjs 530f40a9bc3f10436161a2af1ca0fe9bffffc004` output:

```json
{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","freshness_scope":"round-18 receipt date 2026-10-20 only; not a reusable freshness due-date gate","c1_rows_rechecked":51,"eligible_rows":58,"held":50,"drift_superseded":0,"own_work":1,"row_classes":{"kind":{"code":12,"community":5,"docs":37,"own-work":1,"paper":3,"spec":4,"tool":2},"status":{"mined":48,"queued":8,"rejected":8},"url":{"immutable_pinned":17,"living_live":46,"own_work":1}},"rejected":[],"live":null,"counterSha256":"df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234"}
```

The 51-row target is baseline-relative (57 rows at B minus 6 superseded) and S061 did not exist at B, so
no C1 receipt is required under that target. But the counter's own `eligible_rows` is 58 at REV, so the
same output reads as 51/58 if eligibility is taken at REV; the seven new rows S058–S064, including
S061, are inside `eligible_rows` and outside the receipt set. The row's only freshness marker is
`opened 2026-10-20` / `recheck on-release`. This is a finite C1 coverage limit, not a missing quote.

### F5 (S058, medium) — The integrated S058 `flip` follows S057 but drops the floor branch its dossier drafted and still calls S058's condition

Dossier drafted row `S058Listing.md:56` ends:

> `... flip: a Chrome-owned page or the extension's own published source stating that floor or publishing an invocation API contract | rejected | 2026-10-20 | on-release | — |`

Integrated row `corpus/SOURCES.md:72` ends:

> `... flip: listing or extension source publishes a concrete invocation API contract | rejected | ...`

The integrated row keeps `REJECTED:` and a `flip:` (so `check-sources.mjs` exits 0 and C3 d4 passes),
but it drops the dossier's "Chrome-owned page ... stating that floor" branch. The dossier's remaining
unknown `S058Listing.md:94` says: "Chrome 150 floor ... that is exactly S058's flip condition." In the
registry, the floor flip belongs to S053 (`corpus/SOURCES.md:67`: "a Chrome-owned page or source stating
the same floor"); S057's own flip (`:71`) is "the listing or the extension source publishes an
invocation API contract", which is the branch the integrated S058 row keeps. The integrated row is
therefore a valid supersession of S057, but it is narrower than the dossier's drafted row and it
contradicts the dossier's §6 claim that the floor is S058's flip condition. The row's rejection reason
("adds no invocation contract beyond S041/S048") matches S057's invocation-contract basis; S057's reason
also names the floor, but its flip does not. The C3 d4 counter (`measure-c3.mjs:452-471`) checks only the
`supersedes S057 —` prefix, the absence of the publisher literal, the corrected developer name, the
dossier pointer and the date; it does not read `REJECTED:`/`flip:` content. `measure-c3.mjs REV` →
`{"rev":"530f40a9bc3f10436161a2af1ca0fe9bffffc004","c3_routed_closed":5,"defects":{"d1":{"pass":true,"why":"correction_line_verified"},"d2":{"pass":true,"why":"20_historical_gates_verified"},"d3":{"pass":true,"why":"adjacency_selftest_verified"},"d4":{"pass":true,"why":"S058_supersession_verified"},"d5":{"pass":true,"why":"7_reruns_verified"}},"counterSha256":"cf99766282908f8948c8098a86d11b6ac6e5f94a09ca74f2344b34e92bcc346a"}`.

### F6 (S058, high) — The Gate cites a digest the dossier labels "NOT reproducible"

Dossier `S058Listing.md:71` says of `fbc214a894f4388ea811d9e76627757a727f2a294194b88fce09cc7cbd81c4d2`:
"**sha NOT reproducible**: four same-day fetches, four digests, lengths 649152/649160/649153/649152".
Dossier `:96`: "No digest of this listing should be cited as a verification handle". The Gate entry
`corpus/lessons/round-18.md:39` nonetheless records that exact digest in its `sha256` column, with only
the offset caveat; it does not repeat "NOT reproducible". Fresh GET on 2026-10-20T20:03:32Z:

```text
HTTP/2 200, 649152 B, sha256 c1249d2d76f619efe6b2b10726ab1f757b8ef5681bea4ada5841a772ca821554
```

Same length, different digest from `fbc214a894f4388ea811d9e76627757a727f2a294194b88fce09cc7cbd81c4d2`; the dossier's own warning is confirmed. The row's
`anchor` does not carry the digest, but the Gate's Gate-table row does, and a reader can mistake it for
a verification handle. The S058 row's `anchor` also cites "recorded byte 523625" without the dossier's
"offsets shift per fetch" caveat (the fresh body did have `Google Ireland, Ltd.` at 523625, but that is
not guaranteed).

### F7 (S058, medium) — Gate calls the developer-card quote "verbatim"; it is a flattened `<br>`/`\n` string

Dossier `S058Listing.md:38` (F7) gives the raw value:

`"Google Ireland, Ltd.<br>Gordon House Barrow Street\nDublin 4 D04 E5W5\nIE"` → flattened:
`"Google Ireland, Ltd. Gordon House Barrow Street Dublin 4 D04 E5W5 IE" (12 words)`

Fresh body contains the value as separate JSON/HTML fields with `\n` escapes; `grep -F` for the
Gate's space-joined quote returns 0. The Gate table (`round-18.md:39`) labels the flattened quote
"verbatim"; the dossier §4 line 71 calls it "one `br`-broken text node, contiguous up to the first
`<br>`", while dossier F7 line 38 calls the same string "flattened". The value is not one contiguous
text node, and the Gate's quote is the flattened form, not the raw form. This is the S058 analogue of
the S061 block-boundary issue.

### F8 (S058, medium) — The publisher premise survives in S053, S057 and the new recheck note; C3 d4 only checks S058

The S058 row itself is clean (`grep -i "individual publisher"` on the row → no match; C3 d4 passes).
But at REV:

- `corpus/SOURCES.md:67` (S053, anchor and `teaches`): `Offered by François Beaufort (individual publisher)` and `REJECTED: individual-publisher extension listing...`; status remains `rejected`.
- `corpus/SOURCES.md:71` (S057, anchor): `Offered by François Beaufort (individual publisher)`; its `teaches` begins `supersedes S053 — REJECTED: ...` but does not name S058.
- `corpus/knowledge/source-recheck-round-18.md:102` (new round-18 note, S057 row): repeats `Offered by François Beaufort (individual publisher)`; line 136 says `corpus/SOURCES.md` S057 still carries the wording and "the correction to that cell is outside this note." The note labels the row "registry-recorded ... (S053 record)" and says the receipt differs, so it is not a current assertion, but the literal remains in a newly added table cell.
- `measure-c3.mjs:457` checks `row.some(cell => /individual publisher/i.test(cell))` only for the unique S058 row; it does not scan S053, S057 or the note.

The lesson `corpus/lessons/round-18.md` says "S058 supersedes S057 in every cell that repeated the
unsupported publisher classification; ... Old S053/S057 and frozen historical quotations retain their
bytes as explicitly superseded records." The old rows do retain bytes, and S057's `teaches` names S053,
but S053's own cells do not name a successor and the new note repeats the literal. If "every cell"
(QUALITY 33) is read literally, the correction sweep is incomplete; the C3 d4 counter cannot see it.
This is the concrete answer to "does a correction leave an unsupported premise in another cell?" — yes,
in the new note's S057 cell and in the S053/S057 rows, though the note's §6 caveat and the append-only
policy partially mitigate it.

### F9 (S061 note, low) — S061 `used-by` and S059–S064 enumeration pass; one adjacent pointer mismatch remains

`corpus/knowledge/harness-hardening-round-18.md` has six `source:` lines, S059 through S064, each
exactly once; S061 appears at `:3` and is used at `:20`, `:26`, `:38`. The S061 row's `used-by` is
`corpus/knowledge/harness-hardening-round-18.md`; `check-sources.mjs` verdict is clean, exit 0. So the
assignment's "source note uses S059-S064 and used-by exists" holds for S061.

Adjacent (not S061): note line 5 cites S063 as
`https://nodejs.org/docs/v24.21.0/api/process.html#signal-events`, while `corpus/SOURCES.md:77` cites
the raw GitHub URL `https://raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/process.md`. Same
v24.21.0 pin, different pointer; the registry and note are not cross-identical.

## 4. Passes (observed, not inferred)

- S061 quote, byte count and full digest reproduce exactly twice: 54215 B,
  `21e1e5fae236a50b02bbe49e7abf04f6b832a0375f2898cfa4abbae27be41fba`; HTTP/2 200;
  `last-modified` 2026-10-20T16:46:38Z; 19 words; normalized offset 1054/3362 found=true.
- S061 docs source is byte-identical at v1.64.0 and v1.64.1:
  `d6e61eb3a96d3aaa4a9ead1112d15af88131f3eb2b1ae0fe2b621ecdf94c95c7` (5355 B), tag commits
  `606ecd8b34bac100db32561b6278ffd76e5eb3cd` and `cfe490d941f992655948eee8fd4fd94e1c4234bf`.
- S061 transport lines and hashes match: `chromium.ts:355-358`, `browserType.ts:274-278` and
  `:341-343`, `crBrowser.ts:606-620`; full digests in §2.
- S061 tier A is scoped to the Playwright 1.64.0 docs/source contract, not a global "Playwright always
  uses a pipe" claim; `connectOverCDP`/attach variants remain outside. `kind=docs` is accepted by
  `check-sources.mjs`.
- S058 rejection reason and flip exist in the row (`REJECTED:` and `flip:`), `check-sources.mjs`
  exits 0, and C3 d4 passes; the corrected developer fact is supported by the fresh body
  (`Google Ireland, Ltd.` at 523625, `Offered by` at 523264, version 1.9.19 at 522921) and by the token
  census (0 for `invokeTool`, `executeTool`, `invocationId`, `invoke`, `Invoke`, `toolInvoked`,
  `toolResponded`; 11 for `execute`; 2 for `Chrome 150.0.7861.0`).
- S058 C3 measured: `measure-c3.mjs REV` → `c3_routed_closed=5`, all five `pass:true`
  (`d4` `S058_supersession_verified`); this counter does not test the flip/hash/quote issues above.
- C1 measured: `measure-c1.mjs REV` → `c1_rows_rechecked=51`, `held=50`, `drift_superseded=0`,
  `own_work=1`, `rejected=[]`; the 51 receipts are the baseline set, not S058–S064.

## 5. Finite limits

- Only the S061 docs page and its v1.64.0/v1.64.1 docs source plus three server source files were
  fetched; no browser, no page JavaScript, no WebSocket, no CDP session, no real-site page tool.
- One fresh S058 listing GET was made; the listing is dynamic (dossier: four same-day digests at
  649152/649160/649153/649152 B; fresh: 649152 B, `c1249d2d76f619efe6b2b10726ab1f757b8ef5681bea4ada5841a772ca821554`). This report does not claim a stable
  S058 digest.
- S061 has no C1 receipt; the C1 counter's 51 is the baseline-51 target, while `eligible_rows` at REV is
  58. This report does not claim S061 freshness beyond the `opened`/`on-release` cells.
- No C2 behavioral probe was rerun; the harness evidence above is the REV file comment/code plus the
  old harness's raw-frame code. The C2 outcome is not adjudicated here.
- No production, fleet, sibling, jj or Git-index writes; all probes were read-only or under
  `/tmp/s061probe`.

Files written:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/NewS061.md`
