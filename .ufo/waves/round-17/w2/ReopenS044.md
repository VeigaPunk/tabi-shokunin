VERDICT: HOLDS

Attacked: S044 at M (`6c97851034e9d8f58b135d28ff969f1f28fa2f7d:corpus/SOURCES.md:58`) —
re-fetched the pinned DevTools revision for real (raw.githubusercontent.com, curl, HTTP 200),
checked the URL/revision/anchors, the wave-1 Gate quote (`w1/SrcDevtoolsInvoke.md` §5) verbatim
at its line, recorded sha256/bytes, tier/scope/teaches honesty, and status/used-by consistency
against `corpus/knowledge/webmcp-invocation-round-17.md` at M. Read-only; no git write; temp
dir `/tmp/s044probe` removed after use.

## Observed facts

1. Row shape at M: 799 B, 11 cells / 13 pipe fields; `code | A | mined | 2026-10-20 | on-release`;
   used-by `corpus/knowledge/webmcp-invocation-round-17.md`. One row (grep count 1); one row in the
   file carrying `panels/application/WebMCPView.ts` (no duplicate URL vs S036, which pins the Model).
2. URL resolves: blob URL
   `https://github.com/ChromeDevTools/devtools-frontend/blob/66df492…/front_end/panels/application/WebMCPView.ts`
   HTTP 200; `https://github.com/ChromeDevTools/devtools-frontend/commit/66df492…` HTTP 200.
3. Content at the pinned commit (raw, HTTP 200): WebMCPView.ts 59 794 B, sha256
   `4b2fce64c708664f5f7c7953fea4fd2abba2998a29a629e10601a6c884a7540f`; WebMCPModel.ts 8 553 B,
   sha256 `c23d575e90f0e23b4d29010e3e0a062dd30d55976c83d3d0a88790191f08b632`. Both equal the
   wave-1 dossier §1 pins (the Model digest also equals S036's anchor pin). No sha256 is recorded
   in the S044 row, so the "sha256 if recorded" clause resolves to the dossier pin, reproduced.
4. Anchor line exists: `WebMCPView.ts:945` reads, byte-for-byte,
   `this.#lastDevToolsInvocationId = await this.#selectedTool.tool.invoke(this.#selectedTool.parameters) ?? null;`
   — the Gate quote verbatim, 6 words, inside the cited 942-945 `onRunTool` block (944 is
   `this.#selectedTool.parameters = event.data.parameters || {};`).
5. Cited spans contain the scope's claims (numbered read of the fetched bytes):
   - `WebMCPView.ts:561-565` status cell (`iconName(call)`, `statusString(call)`);
     `:575-576` output cell (`JSON.stringify(call.result.output)` else `call.result?.errorText`).
     Cited range 561-576 covers both exactly; the `errorText` fallback is on line 576, not 577.
   - `WebMCPModel.ts:128-139` `invoke(input)` → `invoke_invokeTool({toolName, frameId, input})`
     → `if (!response || response.getError()) return undefined;` → `return response.invocationId;`.
   - `WebMCPModel.ts:249-258` `toolResponded`: `#calls.get(params.invocationId)`, `return` when absent.
6. Revision identity: raw `chromium/chromium@154.0.8037.97/DEPS` HTTP 200, 197 649 B, sha256
   `dc1d7007e7d992729d3d34b79c2443971cd07029c5599856a16ddecd445c532d` (matches dossier §1);
   `grep -n` confirms line 424 is `'devtools_frontend_revision': '66df492aaa0129d090937e933dd44c5389ab24d2',`.
   The row's tag/line 424 claim is exact.
7. Protocol corroboration (dossier support, not the row's own claim): tag `154.0.8037.97` `WebMCP.pdl`
   base64-decodes to 3 969 B, sha256 `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff`
   (dossier §1 pin), with `object input` at line 66 and the invocationId comment at line 68.
   Consistent with the row's "object input".
8. Teaches honesty: "invokes a tool with an object input and binds the outcome only through a
   pre-seen toolInvoked id" is exactly the code. The sole write to `#calls` is in `toolInvoked`
   (`WebMCPModel.ts:245`); `toolResponded` only reads it (`:250`) and drops unknown ids (`:251-253`).
   The view has no alternate binding path: its post-invoke fallback (`WebMCPView.ts:946-953`)
   scans `model.toolCalls`, which `toolInvoked:245` populates; grep shows no other `#calls.set`.
9. Tier/scope honest: kind `code`, tier A scoped to the DevTools consumer at a pinned commit,
   not to the protocol text (S041 owns the tag PDL). The row's prescribed consequence ("a receipt
   must record both events") follows from the discard-on-unknown behavior; no over-read of the
   source. Gate's only tier heuristic (community-at-A) does not apply.
10. Status/used-by consistent: `git cat-file -e M:corpus/knowledge/webmcp-invocation-round-17.md`
    succeeds; the note cites `source: S044` (line 4) and uses it in the toolResponded table row
    (line 74: "pair through `toolInvoked` (S041; S044 binds by id)"); `mined` therefore has a
    real, citing used-by, and `opened 2026-10-20` / `recheck on-release` are the values actually
    fetched today.
11. Structural gate at M: `node scripts/check-sources.mjs` →
    `SOURCES_GATE verdict=clean rows=53 tiers=A:43,B:4,C:6 status=queued:6,mined:41,rejected:6 findings=0 file=corpus/SOURCES.md`, exit 0.

## Inference and limits

- [INFERENCE] "Chromium 154 shipped" is established by the tag DEPS pin (`DEPS:424`); no Chromium
  154 binary was launched and no DevTools UI was opened — the row is a source-read claim, which its
  `on-release` recheck and scope cell correctly signal.
- Line numbers hold for commit `66df492` only (raw fetch of that commit); no drift observed.
- Fetch channel: `curl` (system) + `node` (system gate); no installs or upgrades were made.

Repair if it breaks: n/a — the row and its wave-1 Gate quote verify as written.

Files written: `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/w2/ReopenS044.md`
