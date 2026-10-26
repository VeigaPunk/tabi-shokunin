# Round 30 — gate mutation-kill coverage and the rate/ToS frontier (2026-10-26)

Baseline `f7c0317e4f8445502005e79e3d65767430912dab`; claims frozen before data in
`061e62024c0523d3c6c7e819506a773ff2cd7d75` (`.ufo/waves/round-30/claims.json`); controls and baseline
receipts in `.ufo/waves/round-30/baseline/` (provenance `baseline/README-receipts.md`). Waves: w1 build +
first falsifiers (`.ufo/waves/round-30/w1/`), w2 falsify (`.ufo/waves/round-30/w2/`). Integrated by TabiR30.

## Gate

New registry rows (both opened 2026-10-26; status `mined`; tier scoped to each row's `scope`; adopted from the
`merge/tabi/` package and renumbered by document: staged S159 → S116, staged S182 → S117):

| row | URL | accessed | receipt quote (≤25 words, located in the committed bytes) |
|---|---|---|---|
| S116 | https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt | 2026-10-26T06:39:52Z (FetchS159; refetch ScribeEntryRateLimitFields 06:40:26Z, byte-identical) | §3 "RateLimit-Policy Field", -11 lines 308–311: "The field value SHOULD remain consistent over a sequence of HTTP responses. It is this characteristic that differentiates it from the RateLimit (Section 4) field" |
| S117 | https://docs.discord.com/developers/topics/rate-limits | 2026-10-26T06:40:02Z (FetchS182; refetch ScribeEntryDiscordHeaders 06:40:32Z, normalised text identical) | the per-guild exception paragraph: "limited on a per-guild basis to prevent abuse. This means that the quota returned by our APIs may be inaccurate, and you may encounter 429s." |
| S118 | https://github.com/ChromeDevTools/devtools-frontend/blob/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/models/web_mcp/WebMCPModel.ts | 2026-10-26T07:02:46Z (Gitiles TEXT, 11,404 B served / 8,553 B decoded, sha256 `c23d575e…b632`; directory listing 07:02:04Z) | `WebMCPModel.ts:249-250` "toolResponded(params: Protocol.WebMCP.ToolRespondedEvent): void { const call = this.#calls.get(params.invocationId);" |

Further located spans (ScribeRows, `.ufo/waves/round-30/w1/ScribeRows/gate-block.md`): S116 §3 "It is this
characteristic that differentiates it from the RateLimit (Section 4) field that contains information that MAY change
on every request."; S117 §Header Format "For most API requests made, we return optional HTTP response headers
containing the rate limit encountered during your request."

Receipts: `corpus/evidence/round-30/frontier/S116.json`, `S117.json` (bytes under `bytes/`), independent refetch records
under `refetch/` (a different seat than the receipt's `fetched_by`; S116 refetch bytes byte-identical, sha256
`d6016dd0…d412`; S117 raw bytes differ per response, normalised text identical).

Tier: S116 is A for the normative field vocabulary. S117 is A **only** for its scope — what Discord publishes about its
own API's rate-limit headers (first-party documentation of the publisher's own wire headers); the package graded it B,
the right grade for evidence of observed behaviour, which this row does not claim.

Transform notes (staged → lane schema): staged S159's anchor named draft `-09` and its recheck cell carried the prose
"180d (the draft revision moves)" with "-10 and later return 404" in the anchor; live on 2026-10-26 `-09`, `-10`
(2025-09-27) and `-11` (2026-05-23) all return HTTP 200 and `-12` returns 404, so the lane row pins `-11` and recheck
`180d`. Staged S182's recheck "90d" kept; its teaches generalised the per-guild caveat to the whole API, corrected in the
entry (§2) to the emoji-control routes the page scopes it to. No staged row was appended as-is
(control `.ufo/waves/round-30/baseline/c2-control-J2-package-as-is.json`).

S118 (round-29 routed defect 6; ExecS044Supersede) supersedes S044: its anchor's `front_end/panels/application/WebMCPModel.ts` returns HTTP 404 at devtools `66df492…` (Chromium 154 DEPS line 424) and `bf69d041…` (M156); the model the row describes is `front_end/models/web_mcp/WebMCPModel.ts` at the same line numbers. Same-URL twin S068 names the same path and is covered by the same correction (S118 teaches). Supporting spans (same decoded bytes, each verified contiguous and unique by
`re.search` over whitespace-collapsed text; see `receipts/quote-check.txt`):

- `WebMCPModel.ts:130-133` "const response = await target?.webMCPAgent().invoke_invokeTool({ toolName: this.name, frameId: this.#protocolTool.frameId, input," (10 words) — the invoke request the panel's `invoke` sends.
- `WebMCPView.ts:575-576` "${call.result?.output !== undefined ? JSON.stringify(call.result.output) : call.result?.errorText ?? ''}" (9 words) — the panel renders output/errorText, i.e. the status and output rendering S044's scope names.

Correction this row records: S044's anchor places `WebMCPModel.ts:128-139, 249-258` under
`front_end/panels/application/`; that path returned HTTP 404 at 66df492 (Chromium tag 154.0.8037.97,
DEPS line 424) and at bf69d041 (M156) — `bytes/NOT_FOUND.panels-application.WebMCPModel.ts@*.b64`.
The panel directory (85 entries) holds `WebMCPView.ts`, `WebMCPView.test.ts`, `WebMCPTreeElement.ts`,
`webMCPView.css` only; its BUILD.gn lists those and no model. The model is
`front_end/models/web_mcp/WebMCPModel.ts` (BUILD.gn `sources = [ "WebMCPModel.ts" ]`; barrel
`import * as WebMCPModel from './WebMCPModel.js';`), 8,553 B, sha256
`c23d575e90f0e23b4d29010e3e0a062dd30d55976c83d3d0a88790191f08b632`, byte-identical at both commits.
Committed bytes and receipts: `corpus/evidence/round-30/s118/`. The knowledge entry citing S044 (`corpus/knowledge/webmcp-invocation-round-17.md`) carries an appended round-30 anchor correction citing S118; its header `source:` lines were not edited.

### Assimilation (§10)

- Theme: rate/ToS signal vocabulary (`/home/vgpnk/Projects/shokuknow/merge/tabi/`, read-only).
- **Admitted** (re-grounded in-round): `host-rate-limit-signal-classes-r14.md` → `corpus/knowledge/rate-limit-policy-fields.md`
  (S116); `host-rate-limit-header-set-r16.md` → `corpus/knowledge/host-published-rate-limit-headers.md` (S117).
- **Rejected (assimilation), with flip conditions:**
  - `merge/tabi/knowledge/corpus/knowledge/rate-and-tos-signal-vocabulary.md` (staged rows S106/S110). **Reason:** its citations do not resolve to its cited bytes. The round-27 quarantine re-fetched both cited URLs on 2026-10-25: RFC 9309 (`rfc9309.txt`, HTTP 200, 25,265 B) contains neither recorded quote (`使用 WebMCP 時，請注意下列事項`, `確認 WebMCP 工具曝光度`), and RFC 6585 (`rfc6585.txt`, HTTP 200, 17,164 B) contains none of its three (`Add hints to your tools`, `Expose your tools carefully`, `Last updated 2026-09-01 UTC`); the quoted spans belong to WebMCP documents, not to those RFCs (`corpus/lessons/…` → `.ufo/waves/round-27/quarantine/QuarantineA.md`, rows S106 and S110). An entry whose quotes are absent from its cited sources grounds nothing, whatever its prose asserts. **Flip:** the robots/429 claims re-cited on rows opened in-round whose located quotes are copied from their own bytes (the RFC sentences the prose paraphrases), each with a committed receipt and a different-seat refetch; then the entry can be re-grounded without a new claim.
  - `merge/tabi/knowledge/corpus/knowledge/host-rate-limit-signal-classes-r13.md` (staged rows S147/S148/S149). **Reason:** quote drift across sibling rows. Round 27 found S147's `Error 1020: Access denied` verbatim three times on S148's cited page and absent from S147's, while S148's `Crawl-delay`/`Sitemap` and S149's `The daemon`/`/status JSON fields` are absent from their cited pages (`.ufo/waves/round-27/quarantine/QuarantineC.md`, rows S147–S149). Three of the entry's source lines point at pages that do not carry its quotes. **Flip:** each quote corrected onto the page it was actually fetched from (the Cloudflare 1015 and 1020 pages, and a robots.txt that really carries those lines), re-opened in-round with a receipt, a located quote and a different-seat refetch.
- Reject spot-check: RevQuarantineCarry (`.ufo/waves/round-30/w1/RevQuarantineCarry.md`) re-fetched all five cited URLs
  on 2026-10-26 (HTTP 200 ×5, byte-identical to the round-27 fetches) — the register quotes remain absent; flips not met.
- Id collision check (0–3-space pattern; `.ufo/waves/round-30/assimilation/`): lane registry 115 ids
  (S001–S115), staged 148 ids; collisions 14: S102 S103 S104 S105 S106 S107 S108 S109 S110 S111 S112 S113 S114 S115. None of the collisions is an adopted
  staged id. Guard proof: a scratch registry with an indented `  | S159 |` row gives collisions `S159` under the 0–3-space
  pattern and none under the column-zero pattern (`guard-proof.txt`). Renumber map (by document): S159 → S116
  (draft-ietf-httpapi-ratelimit-headers, re-pinned -09 → -11), S182 → S117 (docs.discord.com Rate Limits). S118 is the
  S044 superseding row (below), not a package row.
- Quarantine slice: 38 data rows (`assimilation/quarantine-slice`; register sha256 `5afe1810…d833`, unchanged since
  round 27, so the round-27 per-row verdicts stand); no slice row is adopted this round.
- considerthese/: no such directory in this lane.

### `used-by` changes (CORPUS rule 2; round-29 routed defect 1)

`corpus/knowledge/chromium-156-release-pin-recheck.md:3` cites 23 re-opened rows whose `used-by` omitted it
(`.ufo/waves/round-30/w1/ScribeUsedBy23/`). Old → new:

| id | used-by old | used-by new |
|---|---|---|
| S033 | `corpus/knowledge/webmcp-chromium-loopback-round-16.md` | `corpus/knowledge/webmcp-chromium-loopback-round-16.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S034 | `corpus/knowledge/webmcp-chromium-loopback-round-16.md` | `corpus/knowledge/webmcp-chromium-loopback-round-16.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S041 | `corpus/knowledge/webmcp-invocation-round-17.md` | `corpus/knowledge/webmcp-invocation-round-17.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S042 | `corpus/knowledge/webmcp-invocation-round-17.md` | `corpus/knowledge/webmcp-invocation-round-17.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S045 | `corpus/knowledge/webmcp-invocation-round-17.md` | `corpus/knowledge/webmcp-invocation-round-17.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S062 | `corpus/knowledge/harness-hardening-round-18.md` | `corpus/knowledge/harness-hardening-round-18.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S064 | `corpus/knowledge/harness-hardening-round-18.md` | `corpus/knowledge/harness-hardening-round-18.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S071 | `corpus/knowledge/source-recheck-round-18.md` | `corpus/knowledge/source-recheck-round-18.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S074 | `corpus/knowledge/source-recheck-round-18.md` | `corpus/knowledge/source-recheck-round-18.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S077 | `corpus/knowledge/webmcp-declarative-validation-round-19.md` | `corpus/knowledge/webmcp-declarative-validation-round-19.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S078 | `corpus/knowledge/webmcp-declarative-validation-round-19.md` | `corpus/knowledge/webmcp-declarative-validation-round-19.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S079 | `corpus/knowledge/webmcp-declarative-validation-round-19.md` | `corpus/knowledge/webmcp-declarative-validation-round-19.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S080 | `—` | `corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S081 | `—` | `corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S093 | `—` | `corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S094 | `corpus/lessons/round-19.md` | `corpus/lessons/round-19.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S096 | `corpus/knowledge/webmcp-declarative-validation-round-19.md, corpus/knowledge/webmcp-completion-lifecycle-round-20.md` | `corpus/knowledge/webmcp-declarative-validation-round-19.md, corpus/knowledge/webmcp-completion-lifecycle-round-20.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S097 | `corpus/knowledge/webmcp-declarative-validation-round-19.md` | `corpus/knowledge/webmcp-declarative-validation-round-19.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S098 | `—` | `corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S099 | `corpus/knowledge/webmcp-declarative-validation-round-19.md` | `corpus/knowledge/webmcp-declarative-validation-round-19.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S100 | `corpus/knowledge/webmcp-completion-lifecycle-round-20.md, corpus/knowledge/webmcp-nonautosubmit-round-21.md, corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md` | `corpus/knowledge/webmcp-completion-lifecycle-round-20.md, corpus/knowledge/webmcp-nonautosubmit-round-21.md, corpus/knowledge/webmcp-nonautosubmit-round-21-corrected.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S105 | `corpus/knowledge/navigation-history-bfcache-evidence.md` | `corpus/knowledge/navigation-history-bfcache-evidence.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |
| S106 | `corpus/knowledge/bfcache-runtime-observed-round-25.md` | `corpus/knowledge/bfcache-runtime-observed-round-25.md, corpus/knowledge/chromium-156-release-pin-recheck.md` |

### Re-grounded Gate quotes for S110, S114, S115 (round-29 routed defect 2)

Each quote below is contiguous in the committed 156 bytes (`corpus/evidence/round-29/release-pins/bytes/156.0.8078.47/`)
and in a live Gitiles refetch on 2026-10-26 (same sha256), and grounds the row's own `teaches`; these lines supersede the
round-29 Gate lines for the three rows (`corpus/lessons/round-29.md`, Gate table).

| id | url | 2026-10-26 | "quote" | file:line | why it grounds teaches |
|---|---|---|---|---|---|
| S110 | https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc?format=TEXT | 2026-10-26 | "if (it == name_to_controls_.end()) { return ScriptToolError( ScriptToolErrorCode::kInvalidInputArguments," | form_mcp_schema.cc:215-217 | S110 teaches that `FormMCPSchema::FillData` still rejects unknown parameters and invalid values and that this file is byte-identical at 154 and 156. This is FillData's unknown-parameter branch returning `kInvalidInputArguments` (the invalid-value branch returns the same code at :221-230), and the span sits at 154.0.8037.97:215-217 too, the same sha256 at both tags — which is exactly what a re-pin asserts. |
| S114 | https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT | 2026-10-26 | "executing_tool->CallDoneCallback(base::ok(String()));" | html_form_element.cc:867 | S114 is the navigation-sentinel row: this is the null-String tool result that marks a navigation triggered after `ScheduleFormSubmission` (:862), i.e. the `CallDoneCallback` ordering the teaches names, and it shows the sentinel path survived the new guard with only a line shift (154:829 → 156:867). S111's comment at :201-202 describes the guard, not this sentinel. |
| S115 | https://chromium.googlesource.com/chromium/src/+/refs/tags/156.0.8078.47/third_party/blink/renderer/core/html/forms/html_form_element.cc?format=TEXT | 2026-10-26 | "if (!form_->GetDocument().IsActive()) { return std::move(done_callback) .Run(base::unexpected( ScriptToolError(ScriptToolErrorCode::kToolInvocationFailed," | html_form_element.cc:203-206 | S115 teaches the guard newly inserted after the `FillFormControls` success path that fails the invocation with `kToolInvocationFailed` when the document is no longer active. This span is the guard's condition plus its error code, it is absent from the 154 bytes entirely (guard first appears at 156), and it stops before :207 so it never crosses the two string literals. |

The two-literal span. The round-29 S110/S115 Gate quote "The document was detached while filling out the form" is not a contiguous
substring of any byte form of `html_form_element.cc`, and never can be: at tag 156 the message is written as two
adjacent C++ string literals, `"The document was detached while filling out "` on line 207 and `"the form")));` on
line 208, which the compiler concatenates but the source does not. Checked mechanically (committed bytes and live
refetch, whitespace-normalised the way `scripts/check-frontier-admission.mjs` normalises): the 52-character message
occurs 0 times in the raw bytes and 0 times in the normalised text, while each literal alone occurs once
(`The document was detached while filling out ` → present; `the form")` → present); the 31-character gap between
them is exactly `"` + `\n` + 28 spaces + `"` — the closing quote of the first literal, the line break, the
indentation and the opening quote of the second — so no quote may span it without including those four characters. Consequence for
every future citation of this message: quote one literal, or quote around the boundary, never across it. The three
replacement quotes above respect that; S115's in particular stops at `kToolInvocationFailed,` on line 206.

## Mistakes

Mined from this round's own build and from round-29's routed defects 1 and 2 (`corpus/lessons/round-29-verifier-spotcheck.md:118`):
one row per mistake, in the `CORPUS.md` §5 vocabulary (`vacuous`, `survivor`, `stale-premise`, `reference-drift`,
`number-drift`, `scope`, `attribution`, `landing`, `provider`). Each fix names a red state that a stored command turns on;
the receipts (commands, exit codes, bytes and live-fetch records) are under `.ufo/waves/round-30/w1/ScribeMistakes/`.

| # | class | evidence pointer | captured by | fix |
|---|---|---|---|---|
| M1 | `attribution` | `corpus/lessons/round-29.md:20` (S114 Gate quote is S111's, the detached-document comment) — routed at `corpus/lessons/round-29-verifier-spotcheck.md:118` | `none` | round-30.md §"Re-grounded Gate quotes for S110, S114, S115" gives S114 its own span (`html_form_element.cc:867`); the frozen frontier counter's `g5-quote-located` requires a receipt quote to be a substring of **that row's** committed bytes |
| M2 | `stale-premise` | `/home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/corpus/knowledge/host-rate-limit-signal-classes-r14.md:6` (sha256 `844ef05f…9c42a`): "`-10` and later currently return 404" | `none` | lane row S116 re-pins the draft at `-11` with `recheck: 180d` and drops the ceiling claim; `ScribeMistakes/anchor-ceiling-probe.mjs` fails on any ceiling a fetched revision contradicts |
| M3 | `survivor` | `.ufo/waves/round-29/w1/MutC3.md` mutant row 8 and survivor note 5 (f4-anchor-token survived: the case failed through the drift path, and the self-test asserted only exit + unresolved count) | `none` | round-30's `check-release-pins.mjs` self-test pins `reasons` per case (and `check-s106-evidence.mjs` pins `field`/`fieldValue`), so a case cannot be satisfied by a neighbouring failure path |
| M4 | `attribution` | `corpus/lessons/round-29-verifier-spotcheck.md:118` (routed defect 1): `corpus/knowledge/chromium-156-release-pin-recheck.md:3` cites 23 rows whose `used-by` omit the entry | `none` | the 23 in-place `used-by` appends logged old→new in round-30.md §"`used-by` changes"; the frontier counter's `r3-used-by` rejects a row whose `used-by` omits the citing entry |
| M5 | `vacuous` | `.ufo/waves/round-30/w1/CritC1Counter.md` §1–§2: the frozen C1 counter runs each mutant copy in `<work>/mutant-<catalogue index>`, so a one-line self-test case reading `process.cwd()` "kills" every fault mutant without exercising any check — `fault_survivors 0`, `benign_killed 0`, exit 0 with frozen digests | `none` (the round-30 freeze controls caught length-fingerprint, site-grep and literal-blacklist junk, not environment leaks) | not landed this round (the counter is frozen for C1). Compensating check: the wave-2 kill-attribution audit reads `failing_cases` per fault at the tip and certifies each killing case builds a fixture and calls the gate's `evaluate()` (`.ufo/waves/round-30/w2/`). Counter v2 (next round, planned in SCORECARD): neutral run-directory names, killer attribution in the kill rule |
| M6 | `scope` | `.ufo/waves/round-30/w1/SentinelFetchScope.md` and `CritC2Counter.md` §2: the frozen C2 counter's `fetchLive` accepts `file://` (added for its own offline self-test), follows redirects off-host, and inherits `~/.curlrc`/`~/.netrc`; a self-quoting junk receipt with a `file://` url reaches admitted 2 with `--live` and no network | `none` | not landed this round (the counter is frozen for C2). Compensating check: the committed receipts' urls are all `https://` and equal the rows' source urls (wave-2 sentinel audit), and the claim's live reading is re-taken inside a network namespace with no network, where the https receipts must fail `l1-live`. Counter v2: https-only production fetch, same-host redirects only, `curl -q` |

### M1 — a row's Gate quote was another row's quote

- **Class:** `attribution`.
- **Evidence:** `corpus/lessons/round-29.md:20` records S114's located quote as "`:201-202` same comment as S111 (same blob,
  different scope: navigation sentinel)" — a pointer, not a quote; the span it points at is S111's, and S114's scope is the
  navigation sentinel (`html_form_element.cc:767-796,856-880`). Routed at `corpus/lessons/round-29-verifier-spotcheck.md:118`
  (defect 2).
- **Captured by:** `none` — no criterion in force at round 29 required a Gate quote to be locatable in the row's own bytes.
- **Fix:** round-30.md §"Re-grounded Gate quotes for S110, S114, S115" replaces the cell with
  `executing_tool->CallDoneCallback(base::ok(String()));` at `html_form_element.cc:867`
  (`corpus/evidence/round-29/release-pins/bytes/156.0.8078.47/…/html_form_element.cc`), and the frozen frontier counter's
  `g5-quote-located` rejects a receipt quote that is not a substring of the normalised bytes of that receipt's own
  `bytes_path`.
- **Able to fail** (`ScribeMistakes/a-demo.out`; frozen counter `cadef57e…9eca`, fixtures under scratch):
  - the round-29 Gate cell text as the receipt quote → `reasons: ["g5-quote-located S114"]`, exit 1;
  - S111's 17-word quote as S114's receipt quote → **also** `g5-quote-located`, exit 1: the quote is not contiguous in the
    156 bytes either, because line 202 re-opens with `//` ("…events, // whose handlers…"); the first line alone is present;
  - S114's own-scope quote (`If this form already made a request to navigate another frame which is`, line 857) → exit 0,
    admitted 1, so the fixture is not failing for an unrelated reason.

### M2 — a package anchor asserted a draft revision ceiling the archive contradicts

- **Class:** `stale-premise`.
- **Evidence:** `host-rate-limit-signal-classes-r14.md:6` (package file sha256 `844ef05f5d2531b2cf96958a0fa305b86d30e92c4cecab48d5c17fef7ea9c42a`)
  states "recheck: 180d — the draft revision moves; -10 and later currently return 404 (not run in this round)". Live on
  2026-10-26T07:06:06Z: `-09` 200 (67,876 B), `-10` 200 (67,803 B), `-11` 200 (67,097 B), `-12` 404 (77,297 B);
  receipts under `ScribeMistakes/receipts/draft-*.json`. The `-11` live bytes are byte-identical to the lane's committed
  S116 bytes (`d6016dd0…d412`).
- **Captured by:** `none` — no criterion required a staged anchor's negative ("N and later return 404") to be run, and the
  package row itself marks it "not run in this round".
- **Fix:** lane row S116 pins `-11` and states `recheck: 180d`; the ceiling claim is dropped
  (round-30.md §Gate, "Transform notes"). `ScribeMistakes/anchor-ceiling-probe.mjs` re-checks a `-N and later … 404`
  claim against live-fetch receipts.
- **Able to fail** (`ScribeMistakes/b-demo.out`):
  - staged line 6 → `CEILING_CLAIM contradicted: … -10 returned 200 (67803 bytes), -11 returned 200 (67097 bytes)`, exit 1;
  - the lane's corrected recheck text → `CEILING_CLAIM none`, exit 0;
  - control `-12 and later currently return 404` → `holds`, exit 0; control `-09 and later …` → `contradicted`, exit 1
    (the probe reads statuses, it does not always fail).

### M3 — a self-test that asserted exit + count let a mutant pass through the wrong path

- **Class:** `survivor`.
- **Evidence:** `.ufo/waves/round-29/w1/MutC3.md` mutant row 8 (`f4-anchor-token`, SURVIVED) and survivor note 5: the only
  anchor-token case was still unresolved through the drift path, and "the self-test asserts only exit + unresolved count,
  not the reason".
- **Captured by:** `none` — round-29's self-test format had no per-case expectation of the failure path.
- **Fix:** round-30's `scripts/check-release-pins.mjs` self-test carries `reasons: [...]` per case and the runner compares
  them (`reasonsOk`); `scripts/check-s106-evidence.mjs` gains `field`/`fieldValue` cases (`same-length-tamper-invalid`,
  `duplicate-anchor-invalid`, `receipt-byte-count-mismatch-invalid`). New case
  `f4-anchor-lacks-range-token-unresolved` (ranges `[[4,5]]`, anchor without a range token) makes the bypass change the
  verdict, not only the reason.
- **Able to fail** (`ScribeMistakes/e-demo.out`, `ScribeMistakes/c-demo.out`; catalogue mutant `pins-f4-anchor-token`,
  find string occurs exactly once):
  - frozen round-29 self-test bytes (`061e620:scripts/check-release-pins.mjs`, sha256 `56763720…3770`) + mutant →
    `verdict=clean cases=20 passed=20`, exit 0 — the survivor reproduces;
  - the same bytes with `reasons: ["f4-ranges"]` on `range-not-in-anchor-unresolved` and the reason comparison → pristine
    clean, mutant `verdict=failed`: the row is `exit 1 unresolved 1 expected_reasons ["f4-ranges"] rowReasons
    ["s1-drift-unsuperseded"]`, i.e. the reason is the only discriminator and the pin catches it;
  - round-30 bytes (`38891ca:scripts/check-release-pins.mjs`) + mutant → exit 3, case
    `f4-anchor-lacks-range-token-unresolved` FAIL.

### M4 — a citing entry's rows did not name it back

- **Class:** `attribution`.
- **Evidence:** `corpus/lessons/round-29-verifier-spotcheck.md:118` (routed defect 1): `corpus/knowledge/chromium-156-release-pin-recheck.md:3`
  cites 23 re-opened rows in `source:`, but their `used-by` cells omit the entry (e.g. `SOURCES.md:47` S033, `:59` S045).
- **Captured by:** `none` — `r3-used-by` was enforced only for frontier-tagged entries, and none of the 23 rows was on a
  frontier surface at round 29.
- **Fix:** 23 in-place `used-by` appends, logged old→new in round-30.md §"`used-by` changes"; `corpus/SOURCES.md` at the
  lane tip names the entry in 31 cells. The frontier counter's `r3-used-by` rejects a row whose `used-by` omits the citing
  entry path.
- **Able to fail** (`ScribeMistakes/a-demo.out`, case `a4-used-by-omits-entry`): a registry row whose `used-by` is
  `corpus/knowledge/other.md` while the tagged entry is `corpus/knowledge/fx-entry.md` → `reasons: ["r3-used-by S114"]`,
  exit 1, population 1, admitted 0.
- **Scope limit:** `r3-used-by` runs only on entries carrying a `frontier:` tag, so reciprocity between a non-frontier
  entry and its rows is still unchecked; the round-30 fix for those 23 rows is the curation edit, not a gate.

## Release-pin population rule (round-29 routed defect 5)

Round 29's "23 on-release rows pinned to 154.0.8037.97" is a true count of the rule
`scripts/check-release-pins.mjs:178` evaluates, not a statement of it. The rule: a row enters the population iff its
recheck cell is `on-release` and its **source** cell carries `refs/tags/<A.B.C.D>/` for a tag below `--stable`. Rows
that are `on-release` and coupled to the Chromium release but outside that rule are, by name: six rows pinned only
through the DEPS-selected devtools-frontend commit `66df492aaa0129d090937e933dd44c5389ab24d2` (S036, S044, S068, S088,
S089, S090 — the Chromium tag appears in their anchor cell, not their source cell) and three `main`-branch rows (S004,
S028, S035). Measured at `061e62024c0523d3c6c7e819506a773ff2cd7d75`: 23 of 89 `on-release` rows selected
(`.ufo/waves/round-30/w1/ScribePopulationRule/population-split.json`). Decision this round: name the rule and the
excluded rows; do not widen the round-29 claim after the fact (its frozen record stays as written); a counter v2 that
maps DEPS-pinned rows through the tag's committed `DEPS` line is planned, not built. QUALITY criterion 79 makes the
naming duty general.

## Scope note

No real-site interaction beyond read-only HTTPS GETs of public documentation, specifications and source
(www.ietf.org, datatracker.ietf.org, docs.discord.com, chromium.googlesource.com, github.com). No API was called, no
credential, cookie or session material was read or stored.

## Wave-2 corrections (append-only; `.ufo/waves/round-30/w2/`)

Registry in-place changes (CORPUS rule 2), old → new:

| id | cell | old | new | why |
|---|---|---|---|---|
| S080 | status | `queued` | `mined` | now cited in `used-by` by `corpus/knowledge/chromium-156-release-pin-recheck.md` (RevUsedByChange) |
| S081 | status | `queued` | `mined` | same |
| S093 | status | `queued` | `mined` | same |
| S098 | status | `queued` | `mined` | same |
| S116 | recheck | `180d` | `2026-11-24` | the `-11` draft expires 2026-11-24 (CritEntryPolicyFields D4) |
| S118 | used-by | `corpus/knowledge/webmcp-invocation-round-17.md` | `corpus/knowledge/webmcp-invocation-round-17.md, corpus/knowledge/source-recheck-round-18.md` | the second entry citing S044 now carries a pointer to S118 (RevS118) |

Corrections to this lesson's own lines (the lines above keep their bytes):

- §Gate, S116 row: the receipt quote spans `-11` lines 308–310, not 308–311 (CritC2Surface F3).
- §Gate, S118 paragraph: S068 does not literally name the 404 path; its anchor's pathless `Model:249-257` implies it
  only through the directory of its `WebMCPView.ts` URL (which returns 200). S118's `teaches` cell says the
  panels/application path "S044 and its twin S068 name … returns 404"; the 404 path is
  `front_end/panels/application/WebMCPModel.ts` (implied by both anchors), not the rows' `WebMCPView.ts` URL
  (ExecCensusTip, RevS118). The cell is append-only; the wording is fixed when S118 is next superseded.
- §Gate, S118 paragraph: two entries cite S044 — `webmcp-invocation-round-17.md` (correction appended) and
  `source-recheck-round-18.md` (pointer appended this wave).

Entry errata appended this wave: `corpus/knowledge/rate-limit-policy-fields.md` §Errata (D1–D7, F1),
`corpus/knowledge/host-published-rate-limit-headers.md` §Errata (shared-scope 429 carve-out; receipt quote scope),
`corpus/knowledge/chromium-156-release-pin-recheck.md` (first hunk line 156:126), `corpus/README.md` (the frontier
row's `docs-held` covers the rate half only).

Counter weaknesses found after the freeze (the frozen rules stay the claims' rules; these are disclosed, not repaired):

- C1: the counter's run directory names the mutant (`mutant-<index>`), so a self-test can recognise it (w1
  CritC1Counter; w1 CritClaimSizing control J5 reaches 27/27 killed, 0 benign killed). Independent re-derivation: the
  same catalogue run by a scratch copy of the counter with random run-directory names gives fault_survivors 0,
  benign_killed 0 at `072af95` (`.ufo/waves/round-30/measure/c1-identity-blind-*`); w2 RevC1KillAttribution reads each of
  the 14 formerly-surviving faults' killing case and finds a fixture-building case that calls `evaluate()` — no self-test
  code reads cwd, argv, env, /proc or its own source. One kill (`pins-f3-bytes-absent`) is a crash on `sha256(null)`,
  not a named failing case (MeasureC1Clean §6). The C1 counter's own self-test misses five of twelve guard mutants
  (w1 MutC1Counter).
- C1 scope: claims.json's implementer note said only self-test cases and fixtures change; the landed diff also
  changed the self-test runner (a per-case `reasons` assertion) and the self-test print line. Production code is
  byte-identical (w2 RevC1Diff); w1 CritClaimSizing shows the new cases reach 0 survivors under the unmodified runner.
- C2: `--live` shells to `curl` without `-q`, protocol or host pinning, accepts `file://`, and follows off-host
  redirects (w1 SentinelFetchScope, CritC2Counter; w2 MeasureC2Clean shows a `~/.curlrc` remap forges a live 2/2);
  `g7` checks a refetch's seat label and bytes, not its independence (w1 CritClaimSizing J5). For the committed
  receipts: all urls are `https://` on the row's host (w2 SentinelReceipts); in a network namespace with no route the
  live run fails `l1-live` on both (w2 MeasureC2Clean), so the recorded live reading reached the network; the refetch
  records match independently logged fetches by other seats (w2 CritC2Fabrication), and a third seat's live fetch
  normalises identically (w2 RefetchLiveS117, RefetchLiveS116).

### Additional mistake row (wave 2)

| # | class | evidence pointer | captured by | fix |
|---|---|---|---|---|
| M7 | `vacuous` | `.ufo/waves/round-30/w1/CritClaimSizing.md` (controls J5: `c1-control-J5-mutant-identity.json`, `c2-control-J5-copyrefetch-live.json` meet both frozen targets) | prompt §9 (the cheapest control that skips the work is built and scored before freezing) — partially: the freeze built do-nothing and junk controls against the *work*, none against the *counter's own observables* (run directory, refetch labels) | a freeze checklist item: for each counter, list what the code under test or the evidence writer can observe about the counter (paths, env, labels, schemes) and build one junk per observable before freezing; the w1 J5 controls are that junk for this round's counters and stay committed as the red state |

### M5 — the C1 counter told the code under test which mutant it was

- **Class:** `vacuous`.
- **Evidence:** `.ufo/waves/round-30/w1/CritC1Counter.md` §1–§2 (a one-line `process.cwd()` case reaches the frozen
  target); `.ufo/waves/round-30/w1/CritClaimSizing/c1-control-J5-mutant-identity.json` (27 killed, 0 benign killed,
  exit 0 with frozen digests).
- **Captured by:** `none`.
- **Fix:** not landed (the counter is frozen for C1). Compensating evidence this round:
  `.ufo/waves/round-30/measure/c1-identity-blind-at-072af95.json` (random run-directory names: 0 survivors, 0 benign
  killed) and w2 RevC1KillAttribution / CritC1EnvLeak (no environment read in either gate's self-test). Red state for
  the planned v2 rule: the J5 control above.

### M6 — the C2 counter's live check accepted non-network evidence

- **Class:** `scope`.
- **Evidence:** `.ufo/waves/round-30/w1/SentinelFetchScope.md` Verdict (a)–(d); `.ufo/waves/round-30/w1/CritC2Counter.md`
  Verdict and §F1 (`file://`); `.ufo/waves/round-30/w2/MeasureC2Clean.md` Verdict (a `~/.curlrc` remap forges a live
  2/2).
- **Captured by:** `none`.
- **Fix:** not landed (frozen). Compensating evidence: the committed receipts are `https://` on their rows' hosts
  (w2 SentinelReceipts) and the live run fails `l1-live` in a namespace with no route (w2 MeasureC2Clean). Red state for
  v2: the `file://` and curlrc fixtures in those reports.

### M7 — freeze controls attacked the work, not the counter

- **Class:** `vacuous`.
- **Evidence:** `.ufo/waves/round-30/w1/CritClaimSizing.md` (both J5 controls meet the frozen targets).
- **Captured by:** prompt §9, partially (see the row above).
- **Fix:** the freeze checklist item in the M7 row; shown able to fail by the two committed J5 controls, which a
  freeze following it would have built and scored red-before.

Corrections to the §Mistakes rows above (w2 CritMistakes D1–D3):

- M1's pointer: the S114 Gate-quote defect is routed at `corpus/lessons/round-29-verifier-spotcheck.md:119` (routed
  defect 2); `:118` is routed defect 1, M4's.
- M6's pointer `CritC2Counter.md` §2 should read its Verdict and §F1 (`:80–101`); that file has no numbered §2.
- M3's fix is narrower than written: 9 of the 29 release-pin self-test cases (the nine added this round) assert a
  failure reason; the other 20 still assert exit + tally only, and 7 of the 10 s106 cases assert a field value. The
  catalogued faults are all killed (C1), but uncatalogued checks may still be seen only through exit + tally
  (w2 MutC1Beyond).
