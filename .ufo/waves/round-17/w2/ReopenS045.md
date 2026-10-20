VERDICT: HOLDS

# ReopenS045 — SOURCES row S045 re-fetched at M

Attacked: `corpus/SOURCES.md` row S045 (Chromium 154 web-test tree, tag 154.0.8037.97)
at M = 6c97851034e9d8f58b135d28ff969f1f28fa2f7d — URL liveness, anchor revision/lines,
wave-1 Gate quote (`.ufo/waves/round-17/w1/SrcWebTests.md` §Gate), recorded digests,
tier/scope/teaches honesty, status/used-by consistency.

## Row as read at M (all 12 populated cells)

- row: corpus/SOURCES.md:59; kind `code`; tier `A`; status `mined`; opened `2026-10-20`;
  recheck `on-release`; used-by `corpus/knowledge/webmcp-invocation-round-17.md`.
- URL: `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/web_tests/external/wpt/webmcp/imperative/executeTool-abort.https.html`
- anchor: `tag 154.0.8037.97 (commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d), executeTool-abort.https.html:87 and :113, inspector-protocol/webmcp/invoke-tool.js:38-51, WebMCP.pdl:68`

## Observed (commands run 2026-10-20; scratch under /tmp, deleted)

1. URL resolves. `curl -w '%{http_code}'` on the row URL → `200`; with `?format=TEXT`
   → `200`, base64 body decodes to 8013 bytes / 205 lines.
2. Revision exists and matches the anchor. `+/refs/tags/154.0.8037.97?format=JSON` →
   `"commit": "b510e9d7cd3a2fbd78d0ddc42234103206c5f78d"` — byte-identical to the anchor's
   recorded commit.
3. Gate quote verbatim at its line. `sed -n '87p'` of the decoded file:
   `assert_array_equals(events, ['tool started', 'toolactivated', 'execution_rejected', 'signal_aborted', 'toolcancel']);`
   — char-for-char equal to the Gate quote; 8 whitespace tokens as `sed -n 87p | wc -w`
   reported 7 (quote minus indentation; either way ≤25 words).
   `sed -n '113p'` (second grounding quote): `assert_equals(executionRejectionValue, 'already aborted');`
   — verbatim; the surrounding :104-113 is the pre-aborted-signal test whose comment
   states the rejection is synchronous (in the next microtask).
4. sha256 recorded in the dossier matches live bytes exactly:
   - `executeTool-abort.https.html` → `faf6e4889b9d71e9795b72950847ea17f9c1fd583536323f580ad9d9dda92c8e` (= dossier)
   - `inspector-protocol/webmcp/invoke-tool.js` → `4fc851748c4ac1600c15646731419d8ba17d0c03b3c10d1c3b07db8a55e84d9c` (= dossier)
   - `third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` → `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff` (= dossier)
   - `unregister-during-executeTool.https.html` → `2515eb0320970296ffab58d51850f65bc7538263f8acaa7ab54ad7ecd4b4793d` (= dossier)
5. Anchor lines exist and say what the row cites.
   - `invoke-tool.js:38-51` fetched live: `dp.WebMCP.invokeTool({frameId, toolName:"test_tool", input:{...}})`
     then `response.result.invocationId` compared to `event.params.invocationId` — supports
     "returns an invocationId that toolResponded echoes".
   - `WebMCP.pdl:68` = `# Unique identifier for this invocation. Response is sent before tool events.`
     (invokeTool command opens at :59; the cited line is the response-ordering comment) — supports
     the anchor's response-before-events reading.
   - `unregister-during-executeTool.https.html:85` and `:121` = `assert_equals(result, 'delayed_result' | 'same_doc_result', 'Pending execution Promise should resolve to tool result even if tool was unregistered mid-execution')`
     — supports "unregistering mid-execution still resolves".
6. teaches is honest as source assertions, not runtime evidence. Every teaches clause maps
   to read test text: caller abort rejects with the caller's own reason (:113, `'already aborted'`);
   `toolcancel` is in the asserted event array (:87); unregister-mid-execution still resolves
   (:85/:121); CDP `invocationId` echo (invoke-tool.js:44-50). The row says "Upstream asserts",
   and the dossier's `## Contradictions` §6 records that these tests are not proven passing
   (`TestExpectations` has no webmcp line; invoke-tool.js has no `-expected.txt`). Tier A
   scoped to "what the 154-tag test tree asserts, build-scoped" is therefore not inflated.
7. status/used-by consistent. `mined` requires an existing used-by path; at M,
   `git cat-file -e M:corpus/knowledge/webmcp-invocation-round-17.md` succeeds and the note
   names S045 at :5 and :96 ("upstream web-test expectations (S045) are not re-run here").
   The shipped census agrees: sandbox clone at M → `node scripts/check-sources.mjs` prints
   `SOURCES_GATE verdict=clean rows=53 tiers=A:43,B:4,C:6 status=queued:6,mined:41,rejected:6 findings=0`, exit 0.
   `opened 2026-10-20` matches the fetch date and the dossier's access date.

## Unresolved gaps / nits (none break the row)

- Dossier Gate labels the quote "(6 words, verbatim)"; it is 7 whitespace words plus the
  `assert_array_equals(events,` prefix token (8 incl. indentation-stripped line). The quote
  itself is verbatim and well under 25 words, so the ≤25-word criterion holds; only the
  word-count annotation in `w1/SrcWebTests.md` is off by one or two. No registry cell is affected.
- The anchor writes `inspector-protocol/webmcp/invoke-tool.js` without its
  `third_party/blink/web_tests/` prefix and `WebMCP.pdl` without its
  `third_party/blink/public/devtools_protocol/domains/` prefix. Both resolve uniquely at the
  tag (verified by fetch), and the registry treats them as tree-relative; ambiguity is
  cosmetic, [INFERENCE] that no other same-named file exists at the tag (not exhaustively searched).
- The tag's WPT copy is stale vs WPT master (dossier contradiction 4). The row is scoped to
  the tag and says so; not a break.

Repair: none required. Optional hardening only: change the dossier's "(6 words)" to "(8
words)" and prefix the two anchor paths with their full tree locations.

Tooling: nothing installed or upgraded; all fetches via `curl` against
chromium.googlesource.com, census run in a throwaway `git clone --no-hardlinks` checkout at
M under /tmp (removed after); no write touched the lane, fleet repo, MANIFEST.json, or state.

Files written:
- .ufo/waves/round-17/w2/ReopenS045.md
