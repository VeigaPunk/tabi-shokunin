VERDICT: BREAKS
Attacked: `corpus/knowledge/webmcp-invocation-round-17.md` at M=6c97851 (`:N` = note line at M), checked line by line
against `corpus/evidence/round-17/webmcp-invoke/receipt.json` at M (jq = jaq 3.1.1 on `git show M:<path>`), plus the harness, fixtures and
`preflight-smoke-failed.json` at M, and the header `source:` rows in `corpus/SOURCES.md` at M. Property attacked: every factual
cell matches a receipt field. It BREAKS at the cell level: the receipt or evidence contradicts three cells (F1–F3), and two cells rest on evidence the
lane does not hold (F4, F5). The header rows and the core receipt claims HOLD. The C2 held-entry count is not attacked here.

## Holds (with the receipt path for each)
- Header :1-10: S041…S048 each exist (SOURCES.md:55-62). Each is tier `A`, status `mined`, recheck `on-release`, and used-by is exactly this note.
  The body cites only these 8 ids, and no other row names the note. `node scripts/check-sources.mjs` in a sandbox clone at M printed
  `SOURCES_GATE verdict=clean rows=53 … findings=0` and exited 0. verified-at :9 = `.generatedAt` "2026-10-20T16:49:59.219Z".
- :15-18: `.schema`, `.verdict` "pass", `.summary.passed` 11, `[.controls[].status]` = 4×"pass". `.producerSha256` equals
  sha256(scripts/webmcp-invoke-round17.mjs at M) = de62820d…52d7.
- :35-38: `.runtime.observed.chromium.{version,launchSha256,realExecutableSha256}`, `[.runs[].pid]` [951249,951978,956298],
  `[.runs[].gone]` all true, `.runs[].realExecutable` (harness :649 realpath `/proc/<pid>/exe`), `.runtime.observed.playwright`, `.safety.cdpChannel`.
- :44-45: each of the 15 `.predicate.fnSha256` values equals the sha256 of a predicate arrow's source in the harness at M (acorn AST slice).
  14/15 are identical in the earlier smoke run, which supports "fixed before the run". All 7 `.fixtures[].sha256` equal the fixture blobs at M.
- Case rows :49-52, :54, :56-58, :60-63 match: `.cases[0].actual` (32-hex invocationId, string `invoked.input`, `observations.calls[0].inputType` "object", 1 ledger entry);
  `.cases[1|2].actual.responded` (Error, errorText "", no `output`, className Error); `.cases[3].actual.invoke.error` -32602 + `.afterEvents` [];
  `.cases[5].actual.navigationCount` 0 + output = `respondWith` value (fixture invoke-declarative.html:44); `.cases[7].actual` lastSendSeq 9 < firstResponseSeq 14;
  `.cases[8].actual` ["undefined",{},[],-32602]; `.cases[9].actual` invoked.frameId == childFrameId, negative -32602, toolsAddedForChild [];
  `.controls[0..3].actual`: -32000; `{status:"Canceled",errorText:""}`; Completed from invoke-decl-result.html; "object"/-32601.
- Decision rows :69-72, :74-75, :77-78: invokeTool result precedes its toolInvoked in all 12 invocations (0 violations); toolResponded param keys across all
  records = {invocationId,status,output,errorText,exception}; "Canceled" only in `.controls[1]`; `.safety.toolInvocation` = fixtures' own tools only.
- :21-25: r16 note :127 ("No tool is invoked in the receipt") and :61 hold; the r16 receipt has 0 invokeTool/toolInvoked/toolResponded frames.
  Lessons :141-142 hold, the cross-ref files exist, and the exit-code map at :123 matches harness :49-50, :2115.
- Upstream cites re-fetched at pinned revisions: S041 WebMCP.pdl (sha256 26e62f29…37ff = row anchor) line 68 "Response is sent before tool events.";
  S042 model_context.cc (blob c5ef637f, sha256 474083d6…8823) :764-773; S043 index.bs@51ed7565 :260-301/:555-560/:639-643/:1570-1572 say what the note says.

## Findings (by severity)
**F1 MEDIUM — :85 contradicts the receipt and the note's own :49.** The row "Input to `execute`" has the 154 cell "JSON string at the page API on 154,
object on 155+ (S047)". The receipt shows the tool `execute` received an object every time:
`[.. | objects | select(has("inputType")) | .inputType]` = "object"×5, and `.cases[0].actual.observations.calls[0].inputType` = "object".
S047's 155 boundary is about the page-side invoker `document.modelContext.executeTool` (SOURCES.md:61, "teaches" cell). The receipt never exercises it:
`executeTool` occurs 0 times in the receipt, the harness and all 7 fixtures. Only the r16 probe holds that fact
(`WebmcpProbeInvoke.json .inPageExecuteTool.objectInput.err` = "UnknownError: Failed to parse input arguments").
Repair:
- Change the 154 cell to "object at `execute` (`.cases[0].actual.observations.calls[0].inputType`); `toolInvoked.input` is a JSON string; CDP takes an object", with verdict "agree".
- Add a separate row "Input to page-side `executeTool`": "JSON string on 154, object on 155+ (S047, r16 probe); not exercised by this receipt".

**F2 MEDIUM — :37 "as the only disable switch" is false.** `.runs[2].featureSwitches.counts.disableFeatures` = 2, and
`.controls[3].actual.featureSwitches.counts` agrees. `.runs[2].effectiveArgv` has Playwright's `--disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,…`
(17 features) before `--disable-features=DevToolsWebMCPSupport`, so DevToolsWebMCPSupport is the last switch, not the only one.
The receipt's own last-wins note (`.runs[2].featureSwitches.note`) implies Playwright's default disables are not in force in that control run [INFERENCE].
So that run differs from the flagged run by more than the domain switch.
Repair: "…the last of two `--disable-features` switches; last-wins overrides Playwright's default disable list in this run (`.runs[2].featureSwitches`)".

**F3 MEDIUM — :18-19 and :116-118 say "Two pre-receipt smoke runs failed … kept as preflight-smoke-failed.json". The file at M holds one run:**
`.generatedAt` "2026-10-20T16:48:58.448Z", one pid triple `[.runs[].pid]` [913781,916945,918911], `.verdict` "fail", `.summary.failed` 2.
Its `.findings` are 2 × case_failed: after-unregister (TypeError at harness :1383) and navigation-pending (predicate not satisfied).
- So either this is one run with two failed cases, or a second failing run was not kept, against PLAN.md:126-127 "never delete failing history".
- The wording comes from w1/C2Harness.md:76 ("Two pre-receipt smoke runs"), which contradicts its own :102 ("pre-receipt diagnostic run").
- "Without weakening a predicate":
  - navigation-pending: fnSha256 1cefd6bd… is the same in both runs, so this half holds.
  - after-unregister: the smoke record has only the fallback `() => false` (fnSha256 28a21f75… = sha256("() => false"); harness :918).
    The smoke producer 9408d300… is not committed, so this half cannot be verified.

Repair: "One pre-receipt smoke run (16:48:58Z, producer 9408d300…) failed two cases (…)". Then mark after-unregister's non-weakening as unverified, or commit the 9408d300 harness bytes.

**F4 MEDIUM — three decision/spec cells rest on a probe only, and that probe's output is not committed.** The cells:
- :73 "unregistration does not cancel (round-17 probe `C2ProbeLifecycle`)"
- :86 "consistent (probe) | agree"
- :110-111 "a bare `AbortSignal` as the second argument unregisters nothing (round-17 lifecycle probe)"

No receipt case unregisters a tool while a call is in flight, or registers with a bare signal. `.cases[6]` aborts only after `firstResponded`
is Completed (harness :1350-1354), and it always registers with `{ signal: … }` (harness :1345). The probe JSON went to scratch
`/tmp/tabi-r17-c2probe-invoke-lifecycle.json` (w1/C2ProbeLifecycle.md:12-13). `.ufo/waves/round-17/probes/` at M has no lifecycle JSON, so the only record is the report text.
Repair (either):
- Add supplementary controls (unregister-while-pending; `{signal}` vs bare-signal A/B) to the harness and re-run.
- Or cite S045 (its row teaches "unregistering mid-execution still resolves") plus S043 :639-643 for :73/:86, and tag :110-111 "[probe; output not committed]".

**F5 LOW-MEDIUM — :103-104 says "…tabi's own reading, recorded here and in `corpus/adjacency.tsv`". It is not in adjacency.tsv.**
At M, `grep -c -i -E 'webmcp|invocation|page-tool|fixture-owned' corpus/adjacency.tsv` returns 0. Row `cdp-runtime-observation` quotes only
PROVINCE.md:9 and ruling :142 (the kaidoku line). Repair: drop "and in `corpus/adjacency.tsv`", or the L1 extends that row's tabi quote.

**F6 LOW — :22-23 "Round 16 did invoke a tool once" is wrong.** The r16 probe holds two completed CDP invocations:
`.invokeTool.result.invocationId` FCE0008E…, and `.invalidInputInvoke.toolResponded` Completed "echo:undefined".
It also holds a successful in-page `executeTool` (`.inPageExecuteTool.jsonStringInput.ok` true).
:25 "without … controls" understates what the probe holds: it also records `.unknownToolInvoke` and `.invokeBeforeEnable`, both listed at :24-25.
Repair: "twice over CDP (valid and `{}` input), plus one in-page `executeTool`; no flag-off or domain-off control run".

**F7 LOW — :53 "input passed through verbatim".** For `.cases[4]`, the raw `invokeTool` frame sends `{"unexpected":"x","nonce":…}`.
`toolInvoked.input` is `"{\"nonce\":…,\"unexpected\":\"x\"}"`, and `.cases[4].actual.observations.calls[0].keys` is ["nonce","unexpected"].
The input arrives deep-equal but with its key order rewritten. Repair: "passed through deep-equal (key order not preserved)".

**F8 LOW — :40 "a per-case nonce travels through `invokeTool.input`, `toolInvoked.input`, the ledger and `toolResponded.output`".**
This holds for 5 of 15 records: success, declarative-form, after-unregister first call, concurrent-ids, iframe. It does not hold for:
- throws/rejects: they send `{}` (`.cases[1].actual.invoke.request.params.input`).
- mismatch: its output is `echo:undefined`.
- cancel and navigation-pending: they have no output.
- decl-nav: its output is the ld+json array.

The ledger rows for throws/rejects/cancel exist only at `.server.ledger` (seq 2, 3, 11), not in the cited `.cases[].actual`.
Repair: scope the sentence to those 5 cases and cite `.server.ledger`.

**F9 LOW — :59 "`execute` entered (ledger), then a non-agent navigation" claims an order the receipt does not show.** `.cases[10].cdp.frames` run in this order:
invokeTool result seq 9, then `Page.frameStartedNavigating` seq 10 (atMs 5), then `toolInvoked` seq 12 (atMs 6), then `frameNavigated` seq 13.
Harness :1672-1673 navigates right after the invokeTool answer, not after a ledger entry. The receipt does show `execute` ran in the old document
before the new one committed: ledger seq 10 and `.cases[10].actual.storage.phase` "enter". But the ledger's epoch `at` and CDP `atMs` share no clock.
Repair: "navigation started right after the invokeTool answer (seq 10 precedes toolInvoked seq 12); execute still ran in the old document".

**F10 LOW — :92 "any unflagged/default profile are untested".** Unflagged 154 was tested, as the negative control
(`.runs[1].webmcpArgvTokens` [], `.cases[8].status` "pass"). Also, :93 "not recorded" understates `.safety.claimScope`, which says that traffic is "NOT confined".
Repair: "positive invocation without flags, a persistent default profile and Chromium 152 are untested", and ":93 not confined and not recorded".

**F11 LOW — citations are imprecise (the content they cite is true):**
- (a) :39 cites `.loopback`/`.flags.browserArgsAll`, but the HOME/XDG redirect is in `.safety.minimalEnv` and the origin is in `.server.{bind,port}`.
- (b) :72 cites "is-object (S042 :764-773)", but the IsObject test is at model_context.cc:137-139 (`JSONStringToScriptObject`).
  That is outside both the cite and S042's anchor (528-580, 748-811, 856-873).
- (c) The S043 cites :555-560, :639-643 and :1570-1572 fall outside S043's anchor cell (1023-1185, 260-301). Widen the anchor append-only.
- (d) :10 recheck names 7 of the 8 header rows; S044 is missing. This is a nit: the r16 note's recheck also listed only a subset.

## Residual risk and verification gaps
- Browser not re-run: I checked the committed receipt only; a re-run belongs to ReRunHarness/HarmAfter. S044–S048 were not re-fetched.
- Editing the body is safe before close: the note is not in pins.tsv (grep → 0). measure-c2.mjs reads the note header (its :13-15, :146-161 comments) [INFERENCE: body edits leave C2 unchanged].
- Tooling: acorn 8.19.0 via `npm install --prefix <sandbox>/p` (sandbox-local, not global; to slice predicate sources from the harness AST for fnSha256). No other installs, no pacman.
- Read-only fetches: index.bs@51ed7565 (sha256 76fcc35a…a004), WebMCP.pdl@154.0.8037.97 (26e62f29…37ff), model_context.cc (474083d6…8823).
- Sandbox `/tmp/tabi-r17w2-RevNoteVsReceipt-RCy9` (clone at M; check-sources only) removed. LANE was only read: `git show`/`log`/`ls-tree`/`grep`/`cat-file`, and `git clone --no-hardlinks` from it; no jj, no git write.

Files written: .ufo/waves/round-17/w2/RevNoteVsReceipt.md
