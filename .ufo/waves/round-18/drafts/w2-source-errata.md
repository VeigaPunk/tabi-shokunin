# Round 18 wave 2 — source errata and disposition ledger (draft, L1 integrates)

Scope: findings in the delivered `.ufo/waves/round-18/w2/LiveS###.md` reports, classified as (M) a registry `teaches`/anchor assertion the cited source does not support, which needs a superseding row, or (D) a receipt note, excerpt, counter, or reproducibility limit, which needs an errata entry only. Lane tip read on 2026-10-20: `refs/heads/master` = `530f40a9bc3f10436161a2af1ca0fe9bffffc004` (64 registry rows; S001–S064). No production file is edited here. Receipts stay as historical attestations; disposition is recorded in §4 and never by hand-editing receipt metadata. No new IDs are assigned here except where parent reserved them (S065–S070); other M candidates are marked `L1 assigns`.

Provenance key used below:
- **seat-read**: the source was opened in this round by the named LiveS seat; this draft seat read the report and did not re-fetch it.
- **this-seat**: opened or grep-verified directly by this seat on 2026-10-20.

## 1. Material corrections (M)

| # | Row (superseded) | Proposed new ID | Class | What the registry cell asserts | What the opened source shows | Provenance |
|---|---|---|---|---|---|---|
| M1 | S052 | S065 (reserved) | M, teaches | "HEAD names the commit the working tree is based on, **not a branch**" | The cited text names HEAD as the commit; it does not say "not a branch". Attached HEAD is a symbolic ref to a branch (`git symbolic-ref HEAD` → `refs/heads/master`, host git 2.56.0). Under "HEAD does not name a branch" the clause is false; under "HEAD is not itself a branch ref" it is true but unsupported by the cited anchor. | seat-read: LiveS052 §3–§4 (raw adoc, body, probe) |
| M2 | S008 | S066 (reserved) | M, teaches | "Selenium exposes BiDi through a WebSocket capability and low-level domains; **binding support is a per-API fact**" | The page documents enabling BiDi through a browser-options capability and says the low-level BiDi domains are accessible but not documented. It contains no per-binding or per-API support statement (0 hits for `supported`/`not supported`; `binding` 0 case-sensitive). The per-API fact is S009's, not S008's. | seat-read: LiveS008 §3; this-seat: S008 row, S009 row (SOURCES.md:22–23) |
| M3 | S029 | S067 (reserved) | M, teaches | "The retained worker records listeningAfter=false while the aggregate says true" | The raw aggregate `cleanup.server.listeningAfter=true` is the all-workers-not-listening predicate, not an active listener: `scripts/aria-loopback-round13.mjs:605` (this-seat grep) `listeningAfter: serverProofs.length > 0 ? serverProofs.every((proof) => proof.listeningAfter === false) : null`. The round-14 correction (`corpus/evidence/round-14/aria-metadata/corrected.json`, this-seat read) sets `derivedListeningAfter: false` with rule "raw post-close state is true iff any complete nonempty perWorker proof reports listeningAfter===true; false only when every proof reports false", and `"from": true, "to": false`. The Node version fields are unchanged. | this-seat: corrected.json:20,30,36–40 and runner :605; seat-read: LiveS029 §4 F1 |
| M4 | S044 | S068 (reserved) | M, teaches | "…so an invocation receipt must record both events" | Source does not state this. The panel keeps the invoke return id (`WebMCPView.ts:945`) and binds `toolInvoked` by id. `ToolRespondedEvent` carries `invocationId` (`WebMCPModel.ts:249-257`), so a `TOOL_RESPONDED`-only receipt can correlate a known invocation. Recording both events is tabi policy. | seat-read: LiveS044 §3, F5 |
| M5 | S010 | S069 | M, teaches | "Historical baseline of which browsers **first** shipped BiDi" | Page text contains 0 occurrences of `first` or `initial`; the only shipping sentence says both shipped in 2022 and gives no order. | this-seat: S010.json (quote, offset 3222, 15 words); seat-read: LiveS010 F-finding at lines 157–165 |
| M6 | S063 | S070 | M, teaches | "an abort handler must explicitly own shutdown and its exit result" | Node v24.21.0 documents that a listener removes the default termination for SIGTERM/SIGINT/SIGHUP. The "must own shutdown and its exit result" rule is a tabi-derived consequence, not Node wording. | seat-read: SrcNodeSignals.md §3–§5 (tag v24.21.0, doc/api/process.md:756-766); this-seat: S063 row (SOURCES.md:77) |
| M7 | S003 | L1 assigns | M, anchor | "blog last updated 2023-06-12, §Discover a dedicated Chrome flavor for testing" | No section with that name exists in the fetched page; the phrase is a docs nav title. The row URL `…/blog/chrome-for-testing` returns HTTP 301 to `/docs/automation-and-testing/chrome-for-testing` (observed without `-L`). Content identity held; URL and "blog" label drifted. | seat-read: LiveS003 F1, F2 |
| M8 | S001 | L1 assigns | M-candidate, attribution | "Branded Chrome ≥136 ignores remote-debugging switches…" | The S001 page contains 0 occurrences of `brand`/`GOOGLE_CHROME_BRANDING`. The branding gate is S028's claim. | seat-read: LiveS001 (teaches finding, lines 88–97) |
| M9 | S028 | L1 assigns | M-candidate, teaches | "the source shows the check compiled **only** under `GOOGLE_CHROME_BRANDING`" | The outer block is `#if BUILDFLAG(IS_WIN) || BUILDFLAG(IS_MAC) || BUILDFLAG(IS_LINUX)`, with the branding check nested inside; "only" is incomplete. The quote used in the receipt is a port-fallback comment, not the taught block (excerpt does not contain lines 169–177). | seat-read: LiveS028 §2, §4 (F1, F3) |
| M10 | S031 | L1 assigns | M, teaches | "Chromium **ships** a loose version" | Body reads "Chromium **is implementing** a loose version … and **will conduct testing/trials**"; 0 occurrences of `ships`/`shipped`. | seat-read: LiveS031 F1 (declarative-api-explainer.md:114–115) |
| M11 | S030 | L1 assigns | M-candidate, teaches | "explicitly outside the specification, so … never spec citations" | Source: "not part of the specification **at this time**", with README:321 contemplating addition. The absolute "never" is the row's, not the source's. | seat-read: LiveS030 F2 |
| M12 | S034 | L1 assigns | M-candidate, teaches | "…no DeclarativeWebmcp feature exists there, so that flag token is inert" | The json5 has no such feature token. "Inert" is a runtime claim; the 154 binary contains a `kDeclarativeWebmcp` string whose declaration is unresolved. | seat-read: LiveS034 F2 |
| M13 | S054 | L1 assigns | M-candidate, anchor | "raw-body sha256 differs per response (CSP nonce)" | Two same-argv fetches differ in digest (189556 B each); the cause "CSP nonce" is not shown by any observation. | seat-read: LiveS054 F1 |
| M14 | S046 | L1 assigns | M-candidate, teaches | "…not a navigation response or user consent" | "Consent" occurs 0 times in the four editor documents read. The clause is an admissibility limit authored by tabi, not source content. | seat-read: LiveS046 F2 |
| M15 | S056 | — (recheck action, not errata) | event-trigger | `recheck` cell `on-release` | LiveS056 reports jj v0.46.0 published 2026-10-07 (13 days before the row's 2026-10-20 open date), a release for the same subject. This is a fired recheck-cell trigger, not a teaches falsehood. L1 decides whether to recheck S056 against v0.46.0. | seat-read: LiveS056 F1 (not re-observed here) |

Already covered, no new row: S057 anchor ("individual publisher") — superseded at REV by S058 (`corpus/SOURCES.md:72`, this-seat grep). The note line that says "not a superseding row" conflicts with S058 and is an errata item (D5).

## 2. Documentary and low items (D) — errata in note or receipt only; no row

Each item is an errata line, not a new row. Receipts are not edited.

| D# | Receipt or note | Finding | Source/evidence | Provenance |
|---|---|---|---|---|
| D1 | S007 receipt note | Section names wrong: the launch flag is in §Launching the browser; the ws:// endpoint in §Getting the WebSocket URL; the introduction holds the requirement. | LiveS007 lines 159–161 | seat-read |
| D2 | S025 note / row | "before asserting it by role" is not in the APG page quote. Label it as lane application derived from APG, not a page quote. | LiveS025 F1 | seat-read |
| D3 | S051 receipt `anchorObserved` | "no version banner" is false. The body has `Latest version`, `last updated in 2.48.0`, `2.48.1 → 2.56.0 no changes`. The quote is version-insensitive: `/docs/git-symbolic-ref/2.48.0` returns identical text at the quote offset with different bytes. The 2.56.0 anchor holds via the tag-pinned adoc (`v2.56.0`, raw sha c852e74c…). | LiveS051 findings 1–2 | seat-read |
| D4 | S051 receipt `note` | Exit-status sentence (`will exit with status 0`, normalized 3831) is outside the committed excerpt; the note cites 0/1 and omits 128. | LiveS051 finding 3 | seat-read |
| D5 | `knowledge/source-recheck-round-18.md:146` | Says the S057 digest mismatch is "not a superseding row", but S058 supersedes S057 at REV. | LiveS057 F2 | seat-read |
| D6 | `knowledge/source-recheck-round-18.md:11` | "57 rows" is B-scoped and present tense; REV has 64. Add "at baseline B". | LiveS009 F2, LiveS013 F1, LiveS017 F1, LiveS025 F3, LiveS033 F3, LiveS048 F2, LiveS054 F3, LiveS057 F1 (this-seat grep: `grep -c '^| S0'` at REV = 64) | this-seat + seat-read |
| D7 | S057 receipt / note line 102 | The live listing bytes differ from the registry record (695881 B receipt vs 649153 B recorded); the note's anchor reproduces the falsified "individual publisher" text. | LiveS057 F3, F7 | seat-read |
| D8 | S052 receipt `note` | Conjunct 1 ("HEAD names the commit on which you based the changes") sits outside the committed excerpt window. | LiveS052 F1 | seat-read |
| D9 | S022 excerpt | Excerpt truncates the supporting sentence "This research aims to explore the root causes" (producer ±600 window). | LiveS022 F1 | seat-read |
| D10 | S009 receipt | First quote occurrence is in `<head>` metadata, not the anchored §Add network intercept section. | LiveS009 F1 | seat-read |
| D11 | S012 receipt note | "new README note" is wrong: the source move existed in Sep 2023. Free-text provenance only. | LiveS012 F1, parent instruction | seat-read; parent |
| D12 | S043 receipt `quoteSource: "new"` | Only the raw markup spelling is new (`Web*MCP*`, `[=browser agent=]`); the sentence is at `corpus/lessons/round-17.md:55`. | LiveS043 F1 | seat-read; parent |
| D13 | S034 receipt note | Locator typo: `experimental` is at line 7035, not 7036. | LiveS034 F1 | seat-read; parent |
| D14 | S036 receipt note | The "not sent as toolsRemoved" statement is navigation-scoped in the row; the receipt note's universal reading is false (explicit unregister does send it). Scope the note. | LiveS036 F2 | seat-read |
| D15 | S040 excerpt | Excerpt does not carry the flag-recipe half of the `scope` cell; body does. | LiveS040 | seat-read |
| D16 | S035 receipt | Quote supports clause 1 only; clauses 2–3 rest on body text not in the excerpt; clause 4 is a caution. Witness scope. | LiveS035 F1 | seat-read |
| D17 | S027 scope cell | Quote supports "everyday profile + 9222", not the "Chrome ≥136" version (external, S001). Rejected row. | LiveS027 L1 | seat-read |
| D18 | S029 receipt | Excerpt does not cover the Node-metadata clause (runtime/pin values at normalized 73,911 and 72,656 characters before the quote). | LiveS029 F2 | seat-read |
| D19 | S030 registry anchor | HEAD pointer `cb3d1696` is stale against live `51ed7565`; content identity holds for README. | LiveS030 F1 | seat-read |
| D20 | S031 receipt `quoteOffset` | 5241 is a normalized index; raw byte offset 5343. Offset domain is undocumented. | LiveS031 F3 | seat-read |
| D21 | S032 raw-body sha | One-response snapshot; not reproducible across fetches. Already disclosed in note §6. | LiveS032 F2 | seat-read |
| D22 | All HTTP receipts `command` | Not shell-replayable: the user agent is unquoted; `recheck-fetch.mjs:98` joins argv with spaces. The counter reproduces the same join (`measure-c1.mjs:233–236`), so it cannot flag it. Producer unchanged per instruction; route to L1. | LiveS052 F3, LiveS044 F4, LiveS031 F4, LiveS033 F4, LiveS036 F3, LiveS043 F3, LiveS048 F1, LiveS057 F5 | seat-read |
| D23 | Counter / `c1_rows_rechecked` | 51 counts all accepted receipts including one own-work row (S029). Denominator is B-scoped (51); at REV `eligible_rows` is 58. Headline should read as 50 live + 1 own-work with 12 pinned rows named. | LiveS017 F2, LiveS029 F3, LiveS044 F2 | seat-read |
| D24 | S055 note | "or sooner when … Jujutsu v0.45.1 ships" is unsatisfiable: v0.45.1 predates the row. | LiveS055 F2 | seat-read |
| D25 | S020 receipt | `anchorObserved` records revision `51ed7565`; anchor cell says `f14762e6`. Moving anchor, not drift. | LiveS020 | seat-read |
| D26 | S022 note | Row URL is not fetchable by the recheck method (IEEE challenge page); the canonical abstract page is the witness. | LiveS022 F2 | seat-read |
| D27 | S032 / S033 counter | Counter admits receipts whose body digest is not bound to the row (`measure-c1.mjs:330`). Measure boundary; no receipt change. | LiveS033 F2 | seat-read |
| D28 | S042 `quoteSource` | Round-17 location wrapped across comment lines; the normalizer does not join them. | receipt note (not re-checked by this seat) | seat-read: receipt note only |

Low annotation (no action beyond the note): LiveS001 cross-row synthesis, LiveS002, LiveS005, LiveS014, LiveS015 (F1 scope), LiveS016, LiveS019, LiveS023, LiveS024, LiveS026, LiveS038, LiveS041, LiveS055 (F3 cosmetic), LiveS048 (F2 covered by D6). LiveS010 is classified as M5 above. These reports were PASS or non-falsifying.

## 3. New rows and Gates (drafted; L1 assigns final IDs for non-reserved items)

### S065 — supersedes S052 (reserved)

- Kind `docs`, tier A, scope "HEAD's meaning in the cited git 2.56.0 manual text; no claim about branch state".
- Source: git-rev-parse(1) — https://git-scm.com/docs/git-rev-parse (raw: `Documentation/git-rev-parse.adoc`, `Documentation/revisions.adoc` at tag v2.56.0).
- Anchor: tag v2.56.0, object `2478544319491bbd2a42cc57a83e3d2f4730a280` peels to `a018953688f1b10bddf91bff8747068f5f4746a4`; `git-rev-parse.adoc:505`; `revisions.adoc:50-51`.
- Gate: access 2026-10-20 (seat-read: LiveS052 §1). Quote A (≤25 words, 13 words): "This will error out if $REV is empty or not a valid revision." (`git-rev-parse.adoc:505`). Quote B (14 words): "HEAD names the commit on which you based the changes in the working tree" (`revisions.adoc:50-51`, body normalized offset 16317). Digests: body `1e84fc200220b2cd356b78f2344766ee7cbaafa8bcef64679dbf47ec585f19da` (122459 B, live 2026-10-20); raw `git-rev-parse.adoc` `4d8e9aca13f6ea6808272eb44e417687a5cca7d23cf1ed311f25e9fdeb148902`; raw `revisions.adoc` `b23a9eb17d9b193adccee6b79cb1c1fef450703dae925a33b8a1c6f6639d82ff`. Probe (seat-read): `git rev-parse --verify --end-of-options "HEAD^{commit}"` → exit 0; `""`, `"^{commit}"` → exit 128.
- teaches: "supersedes S052 — HEAD names the commit the working tree is based on; rev-parse --verify --end-of-options errors on empty or invalid revisions. Whether HEAD names a branch is not stated by this anchor; branch state is S051's topic."

### S066 — supersedes S008 (reserved)

- Kind `docs`, tier A, scope "Selenium's documented BiDi activation and low-level domain scope; not per-binding or per-API support".
- Source: WebDriver BiDi — Selenium — https://www.selenium.dev/documentation/webdriver/bidi/ ; section §Enabling BiDi in Selenium; last modified 2026-08-15.
- Gate: access 2026-10-20 (seat-read: LiveS008 §1). Quote A (14 words): "The low-level BiDi domains will be accessible in the code to the end user" (normalized offset 4770). Quote B (≤25): "setting the capability in the browser options will enable the required functionality" (offset 4024). Quote C (8 words): "the low-level components will not be documented" (offset 4946, normalized). Body sha256 `c919558a0ec5e42fb7b33560d633f508dd6f30dfb39f4821270cdfe0b3a9c97b` (92317 B, this round, matches receipt).
- teaches: "supersedes S008 — Selenium's page says BiDi is enabled through a browser-options capability and that the low-level BiDi domains are accessible to end users but not documented. It states no per-binding or per-API support; that claim is S009's."

### S067 — supersedes S029 (reserved)

- Kind `own-work`, tier A, scope "recorded Node metadata and the raw aggregate field's meaning in the round-13 receipt".
- Source: `corpus/evidence/round-13/aria/receipt.json` at commit `837b33a3988ebeea7f6b4ef5c04698da88909a73` (blob sha256 `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7`, 97073 B, this-seat re-hash). Producer semantics: `scripts/aria-loopback-round13.mjs:605` (this-seat grep). Correction: `corpus/evidence/round-14/aria-metadata/corrected.json` (sha256 `e156b922d0f59f6b66c4bba8aebc708bb0484c41cce1141960a0ab82c1a56745`, this-seat hash).
- Gate: access 2026-10-20. Quote A (≤25 words): "listeningAfter: serverProofs.length > 0 ? serverProofs.every((proof) => proof.listeningAfter === false) : null" (`scripts/aria-loopback-round13.mjs:605`; this-seat). Quote B (≤25 words): "raw post-close state is true iff any complete nonempty perWorker proof reports listeningAfter===true; false only when every proof reports false" (`corrected.json:30`; this-seat).
- teaches: "supersedes S029 — the retained worker proof records listeningAfter=false. The raw aggregate cleanup.server.listeningAfter=true is the all-workers-not-listening predicate, not an active listener; the round-14 correction gives derived listeningAfter=false. Observed Node 26.12.0 differs from the descriptive pin 24.21.0 (minimumMajor 20); no new runtime observation."

### S068 — supersedes S044 (reserved)

- Kind `code`, tier A, scope "what the Chromium 154 DevTools consumer records and correlates; not what a receipt must record".
- Source: `front_end/panels/application/WebMCPView.ts` at commit `66df492aaa0129d090937e933dd44c5389ab24d2` (raw URL in S044).
- Gate: access 2026-10-20 (seat-read: LiveS044 §1). Quote (6 words): "this.#lastDevToolsInvocationId = await this.#selectedTool.tool.invoke(this.#selectedTool.parameters) ?? null;" (line 945). Body 59794 B, sha256 `4b2fce64c708664f5f7c7953fea4fd2abba2998a29a629e10601a6c884a7540f` (LiveS044 two identical fetches). Model: `WebMCPModel.ts:249-257` (ToolRespondedEvent carries invocationId; seat-read).
- teaches: "supersedes S044 — the panel invokes a tool with an object input, keeps the returned invocation id, and binds the outcome by that id on toolInvoked and toolResponded. Recording both events is tabi's policy; toolResponded's invocationId alone can correlate a known invocation."

### S069 — supersedes S010 (L1 assigns ID; proposed S069)

- Kind `docs`, tier A, scope "Chrome's historical 2022 BiDi shipping statement; background only".
- Source: https://developer.chrome.com/blog/webdriver-bidi-2023 §Where are we now?, last updated 2023-05-09.
- Gate: access 2026-10-20 (this-seat: `S010.json`). Quote (15 words, offset 3222): "In 2022, both Chrome/ChromeDriver 106 and Firefox 102 shipped support for the WebDriver BiDi standard." Receipt body sha256 `691ce80ffcc67eff9852ab7936560d9b25d9b3a78a4b8caebf60aa4c7632fbe2` (112335 B).
- teaches: "supersedes S010 — the page says Chrome/ChromeDriver 106 and Firefox 102 both shipped BiDi support in 2022; it gives no order between them, so 'first shipped' is not supported."

### S070 — supersedes S063 (L1 assigns ID; proposed S070)

- Kind `docs`, tier A, scope "Node v24.21.0 POSIX signal default and listener behaviour; the abort-handler rule is tabi-derived, not Node text".
- Source: Node.js v24.21.0 `doc/api/process.md`, §Signal events, tag v24.21.0 (commit `955266bfdd854cd280dffd47548673914484e4c0`), lines 756–766; raw sha256 `3107879760e5fcd72bc2c48e77460b418b714a693a54073c51314934586ab3b7` (134327 B; SrcNodeSignals gate).
- Gate: access 2026-10-20 (seat-read: SrcNodeSignals §3–§4, rows and checks A–C). Quote (20 words, exact): "If one of these signals has a listener installed, its default behavior will be removed (Node.js will no longer exit)." Location: `doc/api/process.md:757-759` at tag v24.21.0, §Signal events; normalized offset 23798 in the md, 31411 in the versioned HTML. Digests: raw md `3107879760e5fcd72bc2c48e77460b418b714a693a54073c51314934586ab3b7` (134327 B); versioned HTML `1224adf135fbd77cddbada63b43a8fbcd6f56e22d8c2ac02c46a2d9b9180a4b5` (359605 B).
- teaches: "supersedes S063 — at v24.21.0 Node documents that installing a listener on SIGTERM/SIGINT/SIGHUP removes that signal's default termination (\"… its default behavior will be removed (Node.js will no longer exit)\"). The rule that an abort handler must own shutdown and its exit result is tabi-derived policy, not Node text. The v24.22.0 rolling page drops the parenthetical and adds an asynchronous-emission sentence; that page is outside this row's v24.21.0 scope."
- Erratum to the round-18 note (D-level): the note's sentence "signal events may run after Node exited" misstates the v24.22.0 sentence. The verbatim v24.22.0 sentence is "Signal events are emitted asynchronously, so Node.js may exit before the listener is called if the event loop is otherwise empty." (live page, offset 31499, absent from the v24.21.0 tag; documentation scope outside S070's v24.21.0 scope).

## 4. Disposition ledger (historical receipts kept as attestations)

Receipts are not edited. Each row below records what the receipt says, the current disposition, and where the errata lives.

| Row | Receipt status | Current disposition |
|---|---|---|
| S003 | held (anchor label wrong) | M7 → superseding row (L1 ID) |
| S008 | held | M2 → S066 |
| S010 | held | M5 → S069 |
| S028 | held | M9 → L1 ID (candidate) |
| S029 | held | M3 → S067; D18 erratum |
| S031 | held | M10 → L1 ID |
| S034 | held | D13 (typo); M12 → L1 ID (candidate) |
| S044 | held | M4 → S068; D-command in D22 |
| S046 | held | M14 → L1 ID (candidate) |
| S052 | held | M1 → S065; D8 erratum |
| S054 | held | M13 → L1 ID (candidate) |
| S063 (not a receipt row) | — | M6 → S070 |
| S001 | held | M8 → L1 ID (candidate) |
| S030 | held | M11 → L1 ID (candidate); D19 |
| S051 | held | D3, D4 erratum |
| S056 | held | M15 recheck-cell trigger |
| S057 | held | D7; superseded at REV by S058 (D5 note) |
| S007, S025, S009, S012, S022, S027, S031, S035, S036, S040, S043, S020, S032, S033 | held | D-level erratum only (§2) |

All other receipts: no errata beyond D22–D23 (producer-wide and counter-wide).

## 5. Limits

- Lane tip and receipts were read at `530f40a`. The counter and receipts were not re-run in this draft, and no producer, counter, or receipt was changed.
- Provenance is honest about reading: seat-read items were not re-fetched by this seat. This seat re-hashed `corrected.json` and `scripts/aria-loopback-round13.mjs` (grep), the S010 and S044 receipts, and the SOURCES rows.
- Several M candidates (M8–M14) are classified from one seat's read; L1 decides which become rows, so no speculative quota is created.
- The D22 producer defect is routed to L1; the producer is unchanged per instruction.
- No tool was installed or updated. No pacman. No git or jj write in the lane.

## 6. S071 — supersedes S042 (reserved) and index errata (from LiveS042, F1–F2)

### S071 row (draft)

- Kind `code`, tier A, scope "input validation on the Chromium 154 WebMCP invoke path, by tool kind; not a general schema validator".
- Source: Chromium 154.0.8037.97 Blink sources, commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, tag `154.0.8037.97`. Files: `third_party/blink/renderer/core/script_tools/model_context.cc` (imperative branch 752-811; dispatch 562-565, 719); `third_party/blink/renderer/core/html/forms/html_form_element.cc` (174, 192-194, 232, 245-258); `third_party/blink/renderer/core/html/forms/form_mcp_schema.cc` (208-243; unknown parameter 214-219; value validation 221-230). URL pattern as S042: `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/<path>?format=TEXT` (constructed from the S042 pattern; LiveS042 cites the paths by tag, not by these exact URLs).
- Gate, access 2026-10-20 (seat-read: LiveS042 §1–§5; this seat did not re-fetch):
  - Quote A (imperative, 22 words, the S042 quote, offset 27811, `model_context.cc:765-770`): "auto script_object = JSONStringToScriptObject(script_state, input_arguments); ScriptValue script_value = script_object; if (try_catch.HasCaught() || script_value.IsEmpty()) { OnToolFailed(…" — the report states the quoted lines are the imperative parse and failure branch. Use the excerpt-verified 22-word S042 quote only as the imperative bound, not as declarative evidence.
  - Quote B (declarative, 9 words, `form_mcp_schema.cc:214-219`): "but there is no such parameter for the tool". The full message template is "Input contains a parameter … but there is no such parameter for the tool" (LiveS042 §5, read at the tag). The ellipsis is the parameter name, substituted at runtime.
  - Digests available from LiveS042: `model_context.cc` as served `039e24a0a9548ae615c9defd65fc57b83beea14c9211205712d832172365d24d` (66824 B); decoded `474083d6c455f31071fd5356d4ebcaeae4f173ee647009e452228350d6c18823` (50117 B); git blob `c5ef637f8e676ecc56050982a07f1c8e9056218c`.
  - Digests NOT recorded in LiveS042 for `html_form_element.cc` and `form_mcp_schema.cc`. L1 must fetch these two files at the tag, record blob hashes and byte counts, and add them here before admission. This draft does not supply them.
- teaches: "supersedes S042 — the statement that input is never checked against inputSchema holds only for the imperative ExecuteV8Tool branch (model_context.cc 752-811), which parses the input as JSON and requires an object. The declarative form branch (FormMCPSchema::FillData, form_mcp_schema.cc 208-243) rejects an unknown parameter name and a value failing its validator before execution. The S042 quote and excerpt cover the imperative branch only."

### Index and knowledge-note errata (append-only; no frozen edits)

- **SKILL.md:1956** row "Does Chromium enforce `inputSchema`? | No — mismatching input ran `Completed`" is ambiguous. Erratum to append in SKILL.md (not an edit to the row): "Correction (round 18, S071): the r17 probe `invoke-input-schema-mismatch` showed no enforcement on an imperative execute tool. For declarative form tools, FillData enforces two checks, unknown parameter name and value-validation failure (form_mcp_schema.cc:208-243, LiveS042 F1). Whether required-field absence is checked is not established. Scope the answer by tool kind." Tool kind of the r17 probe is not recorded in the knowledge note; [INFERENCE] imperative, from the `echo:undefined` JS-return output.
- **corpus/knowledge/webmcp-invocation-round-17.md:54 and :73** (byte-frozen; do not edit). Erratum entry in the round-18 note or the lane lesson: line 54 "no inputSchema enforcement" and line 73 "the 154 Blink invoke path checks only JSON syntax and is-object" are true of the imperative branch only. The declarative branch enforces parameter name and value checks (S071). The S042 anchor range 748-811 covers ExecuteV8Tool, as line 73 says; the declarative path is outside that range.
- **S042 receipt** `note` ("no inputSchema comparison on the invocation path") and `teachesVerdict: held` are historical attestations, kept unedited. Disposition: M-level teaches falsehood (this section), superseded by S071.
- **Scope of the verdict**: LiveS042 F2 found that the S042 anchor cell cites `model_context.cc` only, while the status clauses (`Completed`, `Error`, `Canceled`) live in `inspector_web_mcp_agent.cc:210-243` and `model_context.cc:582-647`. These are documentary: the status clauses are true in-tree, and the S042 anchor range is incomplete. Add those files to the anchor when S071 is admitted, or cite them separately.
- **Limit**: the S071 claim is code-level, not runtime. No browser, no probe, and no WebMCP invocation were run for it. L1 must decide whether a runtime probe of `FillData` rejection (the `{"y":1}` finite counterexample in LiveS042 F1) is wanted before the index answer changes.

## 7. S072–S075 rows and Gates (from existing w2 reports; no new fetch)

Source-mandate rule for the note append: any sentence in a registry cell or note that states a requirement ("must", "never", "only", "is inert", "never checked") is tabi-derived policy or a measured observation unless it is a quoted source sentence with a location. Such a sentence is labelled as derived, not attributed to the source.

### S072 — supersedes S003 (proposed; L1 assigns final ID)

- Kind `docs`, tier A, scope "Chrome for Testing identity and purpose; canonical URL and section title only".
- Source: https://developer.chrome.com/docs/automation-and-testing/chrome-for-testing (canonical). The row URL `https://developer.chrome.com/blog/chrome-for-testing` returns HTTP 301 to that path (observed without `-L`, 2026-10-20 20:02 GMT).
- Gate, access 2026-10-20 (seat-read: LiveS003 §A–F). Quote (18 words, normalized offset 5639): "a dedicated flavor of Chrome targeting the testing use case, without auto-update, integrated into the Chrome release process". Section: "The solution: Chrome for Testing" (`id="the_solution_chrome_for_testing"`, raw offset 87270). The title "Discover a dedicated Chrome flavor for testing" is a left-nav title (raw offset 55571).
- Digests (full, from LiveS003): fetch B, canonical docs URL `03f8c76de7a731a74eed13292090d32ee816361b1f452c3c827529b8e17d6c1f` (107908 B). Fetch A, blog URL after `-L`, `83281d4d86d221567372084082b561b9cc0175936e6af591d5de1af464197e9a` (107908 B). Producer normalized html-text, identical for A and B: `352cbe795ddf3850ed1416340bb59c2ef1600b9c7b8719e86671324ca0a20269` (7892 chars). The S003 receipt `6091506bf107b8066c3e5d1e3a914edd7d6212f5de1dbef878f8239f1b3bc53b` matches neither fetch: per-response variance (CSP nonce and script array), so the raw digest is not identity.
- teaches: "supersedes S003 — the canonical page is the docs path, which the blog URL redirects to; the statement that Chrome for Testing is a dedicated flavor for the testing use case appears under 'The solution: Chrome for Testing'. No body section is titled 'Discover a dedicated Chrome flavor for testing'; that string is a navigation title."

### S073 — supersedes S031 (proposed; L1 assigns final ID)

- Kind `docs`, tier A, scope "Proposed declarative WebMCP form surface: implementation status and open questions in the editors' explainer".
- Source: https://github.com/webmachinelearning/webmcp/blob/main/declarative-api-explainer.md; blob `68af790f7b625ea6b926113a0e13f7670f93ca90`; parent commit `cb3d16964ab3e92cfd5f09901ed0504373a906e8` serves identical bytes (LiveS031).
- Gate, access 2026-10-20 (seat-read: LiveS031 Source identity, F1). Quote (12 words): "Chromium is implementing a loose version of this and will conduct testing/trials" (line 114; raw byte offset 5343; normalized 5241 per S031 receipt). Body digest `4587c9f2540b673210c4eb0221d12ceda39496910dcdd6e649dc8ffa968bbd28` (10417 B). "Form-to-schema synthesis is TBD" supported at lines 108–112. Token `ships`/`shipped` count in body: 0.
- teaches: "supersedes S031 — the explainer says Chromium is implementing a loose version of the proposal and will conduct testing and trials to decide whether it should be supported; form-to-schema synthesis is TBD in the proposal. It does not say Chromium ships the surface."

### S074 — supersedes S034 (proposed; L1 assigns final ID)

- Kind `code`, tier A, scope "WebMCP feature declarations in the Chromium 154.0.8037.97 runtime-enabled-features file; declaration only, not runtime".
- Source: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/platform/runtime_enabled_features.json5 (commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`).
- Gate, access 2026-10-20 (seat-read: LiveS034 §F1–F2). Quote (2 words): `status: "experimental",` (line 7035 at tag). Absence check: case-insensitive search of the full decoded file for `declarativewebmcp` returns no match (`grep -in`, exit 1). Digest of the as-served body `3dc33e9d2e40f0c448c13e1ab7d1ea4f5a74dc1e95c72b943fbd5b43f2a478d0` (310220 B, commit fetch). Decoded digest is recorded in LiveS034 only truncated (`99b92e67…1d2b`); L1 must record the full 64-hex decoded digest before admission. This draft does not supply it.
- teaches: "supersedes S034 — the file declares WebMCP status experimental and has no DeclarativeWebmcp token. This file does not establish that any flag token is inert at runtime; that claim is outside this row and rests on the round-16 flags probe. A binary-string check would not settle it either."

### S075 — supersedes S054 (proposed; L1 assigns final ID)

- Kind `docs`, tier A, scope "Imperative API page: stable article text; per-response raw-byte variance".
- Source: https://developer.chrome.com/docs/ai/webmcp/imperative-api (living page; footer "Last updated 2026-10-16 UTC").
- Gate, access 2026-10-20 (seat-read: LiveS054 §fetches, F1). Quote (17 words, offset 11615 in the receipt's normalized text): "This asynchronous method returns the result of the tool execution, or null when a navigation is triggered."
- Digests (full, from LiveS054): receipt `eebe1d1a07960397dc3a8ab1888f54d1e27d1c285e9a5ccdaa61d07c9e6e4d9d` (189556 B); fetch 1 `df5fc9dff4d54fa1bcde65f817701e941cfe8ce95dcbadbc7d645126fdf01836` (189556 B); fetch 2 `d3f0f19f5c4cc1585b3e0ac85a78d5add686f921976df30c6b27b5824fbfcf79` (189556 B). Same-length bodies differ in 3203 byte positions (`cmp -l | wc -l`), first at 183030, last at 188199. The nonce run is 29 B at 183029–183057. The remaining differences are a per-response devsite bootstrap experiment-flag array inside the same `<script>`.
- teaches: "supersedes S054 — the raw body changes between same-length fetches, from a per-response CSP nonce and a per-response experiment-flag array. The nonce is not shown to be the sole cause. The quoted sentence and anchor text are stable across fetches; compare by normalized text, not by raw digest."

### Qualifications (no new row; errata in the note append)

- **M8 (S001 + S028, branding attribution).** The S001 page gives the default-data-dir refusal and the `--user-data-dir` requirement from Chrome 136 and contains no branding term (0 `brand` matches). The "branded" qualifier is S028's source claim. The S001 cell is a cross-row synthesis; clarify in the ledger, no new row.
- **M9 (S028, "only under GOOGLE_CHROME_BRANDING").** Branding is a necessary condition, not a sufficient one. The enclosing guard is `#if BUILDFLAG(IS_WIN) || BUILDFLAG(IS_MAC) || BUILDFLAG(IS_LINUX)` and the branding check sits inside it (LiveS028 §4). The refusal is branded and desktop-OS-gated; the row's "only" omits the OS scope. Errata only.
- **M11 (S030, "never spec citations").** Scope to the pinned revision `cb3d1696…`: "not part of the specification at this time" (README). It does not cover every future revision. Errata only.
- **M14 (S046, "not … user consent").** "Consent" appears 0 times in the four editor documents read (LiveS046 F2). The exclusion is tabi's evidentiary scope, not a source assertion; label it as derived policy. Errata only.

### Ledger additions

- S003 → S072; S031 → S073; S034 → S074; S054 → S075 (superseding rows; original receipts kept as historical attestations, `teachesVerdict: held` unedited).
- S001 and S028 → M8/M9 errata; S030 → M11; S046 → M14.
- S070 (proposed) quote is the exact 20-word v24.21.0 sentence, including "(Node.js will no longer exit)". The earlier 15-word form in this draft is withdrawn.
- Open record items for L1: the full decoded digest for S074 (`99b92e67…1d2b` is truncated in LiveS034), and the blob hashes for `html_form_element.cc` and `form_mcp_schema.cc` for S071.
