# ReopenS036 — non-author reopening of S036 (devtools-frontend WebMCPModel.ts)

Seat: TabiR16.ReopenS036 (wave 2, FALSIFY). Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`.
Lane revision at start: `b444ca8` (`round-16: repair C2 counter fixture-path read; retain first failing measurement`).
Author-side re-opening; this is not non-author certification. Read-only on the lane except this report. No tools installed or upgraded.

## Attack item (one)

Row under attack — `corpus/SOURCES.md:50`:

```
| S036 | devtools-frontend WebMCPModel.ts — https://github.com/ChromeDevTools/devtools-frontend/blob/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/models/web_mcp/WebMCPModel.ts | code | A | How the DevTools frontend shipped with Chromium 154 maintains its WebMCP tool registry | commit 66df492aaa0129d090937e933dd44c5389ab24d2 (Chromium 154 DEPS line 424), lines 192-203, sha256 c23d575e…b632 | The frontend drops a frame's tools when its default execution context is destroyed, so navigation removal is inferred, not sent as toolsRemoved | mined | 2026-10-20 | on-release | corpus/knowledge/webmcp-chromium-loopback-round-16.md |
```

Claims tested: (i) the row URL opens at commit `66df492a`; (ii) lines 192-203 exist and carry a ≤25-word quote grounding `teaches`; (iii) `66df492a` is the devtools-frontend revision pinned at Chromium 154 DEPS line 424; (iv) kind/tier/scope/status honesty under CORPUS.md §SOURCES contract v1 (`/home/vgpnk/Projects/kimi-shokunin/skills/shokunin/protocol/CORPUS.md:64-155`).

## Verdict: HOLDS

Every mechanical claim verifies at the pinned bytes. One scope qualification is recorded below: the final clause of `teaches` ("not sent as toolsRemoved") is a runtime observation, not something the cited lines 192-203 establish — the lane's own lifecycle probe observes it, and the lesson Gate must cite that probe for the clause rather than S036.

## Commands and observed outputs

All fetches to `/tmp/s036probe` (outside the lane). Access date 2026-10-20.

1. Row URL opens (browser page, not raw):
```
$ curl -sSL -o blob.html 'https://github.com/ChromeDevTools/devtools-frontend/blob/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/models/web_mcp/WebMCPModel.ts' -w 'blob HTTP %{http_code} bytes %{size_download}\n'
blob HTTP 200 bytes 428672
$ grep -o '<title>[^<]*</title>' blob.html
<title>devtools-frontend/front_end/models/web_mcp/WebMCPModel.ts at 66df492aaa0129d090937e933dd44c5389ab24d2 · ChromeDevTools/devtools-frontend · GitHub</title>
```
The URL resolves to the named file at the named commit.

2. Bytes and digest at the pinned commit:
```
$ curl -sSL -o WebMCPModel.ts 'https://raw.githubusercontent.com/ChromeDevTools/devtools-frontend/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/models/web_mcp/WebMCPModel.ts' -w 'HTTP %{http_code} bytes %{size_download}\n'
HTTP 200 bytes 8553
$ sha256sum WebMCPModel.ts
c23d575e90f0e23b4d29010e3e0a062dd30d55976c83d3d0a88790191f08b632  WebMCPModel.ts
```
Matches the row's truncated `sha256 c23d575e…b632` in both prefix and suffix; 8553 bytes, 261 lines.

3. Anchor lines 192-203:
```
$ sed -n '192p;202p' WebMCPModel.ts
  #executionContextDestroyed(event: Common.EventTarget.EventTargetEvent<SDK.RuntimeModel.ExecutionContext>): void {
  }
$ sed -n '203p' WebMCPModel.ts | od -An -c
  \n
```
Line 192 opens the handler, line 202 closes it, line 203 is the trailing blank. The anchor range contains the whole `#executionContextDestroyed` method and nothing unrelated.

4. ≤25-word quote at the anchor (verbatim lines 194-199; contiguous):
```
    if (executionContext.isDefault && executionContext.frameId) {
      const frameTools = this.#tools.get(executionContext.frameId);
      if (frameTools) {
        const toolsToRemove = [...frameTools.values()];
        this.#tools.delete(executionContext.frameId);
        this.dispatchEventToListeners(Events.TOOLS_REMOVED, toolsToRemove);
```
```
$ sed -n '194,199p' WebMCPModel.ts > quote.txt && wc -w quote.txt
19 quote.txt
```
19 whitespace-separated words, ≤25. It verbatim grounds the first clause of `teaches`: the frontend deletes the frame's entire tool map and dispatches `TOOLS_REMOVED` when that frame's default execution context is destroyed. The same statement is repeated by the wave-1 seat at `.ufo/waves/round-16/w1/RevengeDevtoolsFrontend.md:96-97`.

5. Chromium 154 DEPS line 424:
```
$ curl -sSL -o DEPS_154.0.8037.97 'https://raw.githubusercontent.com/chromium/chromium/154.0.8037.97/DEPS' -w 'HTTP %{http_code} bytes %{size_download}\n'
HTTP 200 bytes 197649
$ sed -n '424p' DEPS_154.0.8037.97
  'devtools_frontend_revision': '66df492aaa0129d090937e933dd44c5389ab24d2',
```
Exact string and exact line number. The same variable is consumed at line 2216 as the fetch pin for `devtools/devtools-frontend`, supporting "shipped with". `branch-heads/154` and `branch-heads/8037` are 404 on raw; the tag is the retrievable, versioned artifact. Host build:
```
$ /usr/bin/chromium --version
Chromium 154.0.8037.97 Arch Linux
```
so the tag used for the check is the host's exact build, not a proxy.

6. Row shape / enums / status:
```
$ awk -F'|' '/^\|[[:space:]]*S036[[:space:]]*\|/ {print "NF="NF}' corpus/SOURCES.md
NF=13
$ awk ... enum check on S036 ...
kind=code tier=A status=mined
```
11 columns, no `|` inside cells, all enum values legal, no `community`+`A` inflation.

7. `mined` requires a used-by path that exists and cites the row:
```
$ git ls-files --error-unmatch corpus/knowledge/webmcp-chromium-loopback-round-16.md
corpus/knowledge/webmcp-chromium-loopback-round-16.md
$ grep -c "S036" corpus/knowledge/webmcp-chromium-loopback-round-16.md
3
   line 8:  source: S036
   line 57: ... as DevTools does (S036)
   line 102: "no event, no stale tools" from S036 and the lane's lifecycle probe
```

8. Lane checker (read-only run mode; it only reads the registry and used-by files):
```
$ node scripts/check-sources.mjs --root /home/vgpnk/Projects/shokunin/tabi-shokunin --file corpus/SOURCES.md
SOURCES_GATE verdict=clean rows=39 tiers=A:31,B:4,C:4 status=queued:3,mined:32,rejected:4 findings=0 file=corpus/SOURCES.md
exit=0
```

## Tier / kind / scope honesty (contract v1)

- `kind=code` — the source is a TypeScript source file; legal enum value.
- `tier=A` — contract lists "source code" as A for the scope it covers, and the scope is exactly this file's behavior at the shipped pin. `community` is never A; not applicable here. No inflation.
- `scope` — "How the DevTools frontend shipped with Chromium 154 maintains its WebMCP tool registry". The file is the model that owns `#tools`, `toolsAdded`, `toolsRemoved` and `#executionContextDestroyed`; the commit is the 154 tag's DEPS pin. Scope and source match.
- `anchor` — carries a revision (full commit) and a line range; the DEPS citation additionally carries "Chromium 154" as the version.
- `status=mined` — used-by path exists, is tracked, and cites `S036` three times. `opened` is the access date 2026-10-20; `recheck=on-release` is a legal cadence.

## Qualifications (recorded, not verdict-changing)

Q1 — `teaches`' final clause is not anchored. "so navigation removal is inferred, not sent as toolsRemoved" cannot be derived from lines 192-203 alone; the same file's `toolsRemoved(params: Protocol.WebMCP.ToolsRemovedEvent)` at lines 204-215 shows the frontend also handles removals the protocol does send. The "navigation emits no event" half is observed by the lane, not by S036:
```
$ python3 ... .ufo/waves/round-16/probes/WebmcpProbeLifecycle.json → case cross_document_navigation
toolsRemoved: []
toolsAdded:  [{'seq': 71, ..., 'method': 'WebMCP.toolsAdded', 'params': {'tools': [{'name': 'toolB', ...}]}}]
```
`same_document_navigation` and `reload` likewise record `toolsRemoved: []`. So the clause is true and already evidenced — but the lesson Gate should attribute the inference half to S036 lines 194-199 and the "no event" half to the lifecycle probe, exactly as `corpus/knowledge/webmcp-chromium-loopback-round-16.md:101-102` already does. Citing S036 alone for "not sent" would over-attribute a runtime fact to source code.

Q2 — the DEPS citation does not name the tag. "Chromium 154 DEPS line 424" is line-bound: it verifies at tag `154.0.8037.97` (the host build) but line numbers shift across the branch, and unversioned `branch-heads/*` refs 404 on the raw endpoint. The Gate should record the tag `154.0.8037.97` next to the line number.

Q3 — rule 1's Gate record is not yet written. `corpus/lessons/round-16.md` does not exist at `b444ca8` (only `round-1` … `round-15` plus drafts), so the contract requirement that the round lesson's `## Gate` carry URL + access date + ≤25-word quote for this new row is a pending integration obligation. The row supplies all needed material; the quote above is measured and ready.

Q4 — draft ID collision. `.ufo/waves/round-16/drafts/DraftSources.md` uses `S036` for a different source (Chromium `runtime_enabled_features.json5` + `about_flags.cc`; its gate table at lines 54-56 quotes main-branch lines 7526/2378). In the final registry, S036 is devtools-frontend and the Chromium-154 features row is S034 (anchor `tag 154.0.8037.97, lines 7023-7050`). L1 must not copy a DraftSources "S036" gate quote by ID; it would attach the flags quote to the devtools row.

## Not verified (auxiliary only)

GitHub API commit metadata (`author.date`) was rate-limited (`API rate limit exceeded for 179.218.13.209`). The commit date is not part of the row and does not affect any claim above; reachability is proved by the HTTP 200 raw fetch at the full SHA and by the DEPS pin.

## Residual unknowns

- None on the row's four claims.
- Q1-Q4 are integration/attribution qualifications for the lesson Gate, not defects in the row's source identity, tier, kind or scope.

## Bottom line

S036 HOLDS: URL opens at `66df492a`, bytes match `c23d575e…b632`, lines 192-203 are the `#executionContextDestroyed` handler, and `66df492aaa0129d090937e933dd44c5389ab24d2` is exactly Chromium `154.0.8037.97` DEPS line 424. `kind=code`, `tier=A`, `scope`, `mined` and its used-by citation are honest under contract v1. The only correction to carry into the Gate is provenance granularity for the "not sent as toolsRemoved" clause and the DEPS tag.
