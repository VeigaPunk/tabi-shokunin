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
