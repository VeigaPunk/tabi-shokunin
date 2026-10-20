VERDICT: HOLDS

# ReopenS041 — re-fetch of SOURCES row S041 at M (round-17 wave 2)

Read-only seat. Lane `TabiR17.ReopenS041`, M = `6c97851034e9d8f58b135d28ff969f1f28fa2f7d`,
B = `5859243183c4d7ac5429dfdb8a73ce0d9a43d583`. Sandbox `/tmp/tabi-r17w2-ReopenS041-3092`
(`git clone --no-hardlinks`, `checkout --detach M`), removed after this report. No lane write
except this report. No tool installed or upgraded (curl 8.23.0, git 2.56.0, python 3.14.8,
node v24.21.0 as provided).

## Attacked

`corpus/SOURCES.md:55` (M), row S041:

> `| S041 | Chromium 154 WebMCP domain PDL — https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl | code | A | CDP WebMCP invocation contract at the 154.0.8037.97 tag: invokeTool, cancelInvocation, toolInvoked and toolResponded, InvocationStatus | tag 154.0.8037.97 fetched 2026-10-20, commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d, lines 7 and 58-122, sha256 26e62f29…37ff | invokeTool returns an invocationId before any tool event, so the outcome including Canceled arrives only in toolResponded | mined | 2026-10-20 | on-release | corpus/knowledge/webmcp-invocation-round-17.md |`

Wave-1 Gate quote is at `.ufo/waves/round-17/sources/PdlInvoke.md:144-146` (seat report
`.ufo/waves/round-17/w1/SrcPdlInvoke.md:21-27`): `"Unique identifier for this invocation.
Response is sent before tool events."` at line 68.

## Evidence (all re-fetched 2026-10-20, not trusted from wave 1)

1. **URL resolves.** `curl -sS -o /dev/null -w '%{http_code}'` on the row URL → `200`
   (`text/html`, 41,626 B, quote text present once). With `?format=TEXT` → `200`, 5,292 B
   base64. Tag metadata `+/refs/tags/154.0.8037.97?format=JSON` → `200`, `commit =
   b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` — exactly the row's commit.
2. **Bytes / digest.** Decoded fetch: 3,969 B, 123 lines,
   sha256 `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff` — row's
   `26e62f29…37ff`. Raw base64 fetch sha256 `0ea9bf3f3d06269e993b6d7367494843ae072c909ff2dde9a9ca3a47d84d47e4`
   (the dossier's labelled raw digest). `git hash-object` of the decoded file =
   `13490686045341e0e01e9572294856a2d37f2a32` = gitiles file metadata `id` and the dossier's
   blob. Independent route: GitHub mirror `raw.githubusercontent.com/chromium/chromium/154.0.8037.97/...`
   → `200`, same sha256 `26e62f29…37ff`; fetch at the bare commit via gitiles also decodes to the
   same sha256 and same transport sha256.
3. **Anchor lines exist and say what the row implies.** Fetched file:
   `:7 experimental domain WebMCP`; `:58 # Invokes a registered tool.` / `:59 command invokeTool`;
   `:68 # Unique identifier for this invocation. Response is sent before tool events.` /
   `:69 string invocationId`; `:72 command cancelInvocation` (no `returns`); `:98 event toolInvoked`;
   `:110 event toolResponded`; `:115 InvocationStatus status`; `:122 optional Runtime.RemoteObject exception`.
   `:26-30` = `type InvocationStatus` / `Completed` / `Canceled` / `Error`.
4. **Gate quote verbatim, ≤25 words.** `grep -cF` of the quote in the decoded bytes → `1`
   (unique); it is line 68 after stripping the PDL comment marker; 11 words. The dossier Gate
   entry (`PdlInvoke.md:146`) carries the same quote, line 68, commit, and both digests.
5. **Tier / scope / teaches honest.** Contract `.ufo/waves/kaika/SOURCES-CONTRACT-v1.md:26-30`:
   A = primary/authoritative for the scope, explicitly including "source code"; `kind=code` is an
   allowed kind and A is not community. Scope is tag-scoped and every element it names exists in
   the fetched file (invokeTool 59-69, cancelInvocation 72-75, toolInvoked 98-107, toolResponded
   110-122, InvocationStatus 26-30). `teaches` follows from line 68 (response before tool events ⇒
   command response is not the result) plus `toolResponded.status` (`:115`) over the enum
   `Completed/Canceled/Error` (`:28-30`); `cancelInvocation` declares no return (`:72-75`), so the
   outcome has no other protocol surface. Not over-broad: no spec, build-behaviour or receipt claim
   is attributed to the PDL.
6. **Status / used-by consistent.** `status=mined`; named used-by file exists at M
   (`git show M:corpus/knowledge/webmcp-invocation-round-17.md` → 126 lines) and cites S041 in the
   body, not only the header: note `:1 source: S041`, `:70` (line 68 quote), `:74`, `:84`, `:88`.
   `node scripts/check-sources.mjs` on the sandbox checkout of M →
   `SOURCES_GATE verdict=clean rows=53 tiers=A:43,B:4,C:6 status=queued:6,mined:41,rejected:6 findings=0`, exit 0.
   Contract census awk: S041 `NF=13`, malformed rows `0`; `opened` 2026-10-20 = access date; `recheck`
   `on-release` is an allowed cadence for a tag-pinned source.
7. **Identity.** No S041 row exists at B (`grep -c '^| S041'` → 0; B has 40 rows, last S040), so the
   id is the next unused and not reused. No other row carries the same URL (S033/S034/S035/S042/S044/
   S045 point at different files; S045 only cites `WebMCP.pdl:68` inside its anchor).

## Precision notes (non-falsifying — row stands as written)

1. The anchor cell "lines 7 and 58-122" does not include `:26-30`, the `InvocationStatus` enum that
   the row's own scope names and whose `Canceled` the `teaches` uses; the range contains only the
   *use* at `:115`. Every cited line is true, so this is an omission, not a false citation. The
   registry is append-only (`SOURCES-CONTRACT-v1.md:49-51`: only status/recheck/used-by change in
   place; a correction is a superseding row), so an in-place anchor edit would itself violate the
   contract — no correction recommended for a complete, true citation. Future rows of this shape
   should cite `lines 7, 26-30 and 58-122`.
2. The recorded sha256 is the decoded-file/content digest, while the row's URL (no `?format=TEXT`)
   serves HTML; reproducible by `?format=TEXT` + `base64 -d`, by the gitiles file `id`, or directly
   from the GitHub mirror tag (all three checked, same digest). The dossier labels raw vs decoded;
   the row does not, but the value is the file's content identity and matches all routes.

## Residual dependency (round-level, not an S041 defect)

`corpus/lessons/round-17.md` does not exist at M (nor at B), so contract rule 1's round-lesson
`## Gate` record for S041 is still staged, not landed. The entry is ready verbatim in
`PdlInvoke.md:146`; PLAN assigns the lesson to L1 (`PLAN.md:195`) and defers it past the measured
revision (`PLAN.md:217`). [INFERENCE] This resolves at round close; no wave-1 row can be faulted for
it, but if L1 lands the lesson without S041's URL/date/quote, the row's rule-1 record is unmet.

## Files written

- `.ufo/waves/round-17/w2/ReopenS041.md` (this report)
