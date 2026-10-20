VERDICT: PASS

Read-only audit of `scripts/webmcp-loopback-round16.mjs` (1,660 lines, 65,472 B,
sha256 `0adbbe0e28c04e222b2e4e3bcd86f91a112e4bc35c0712b86b2a883f4367d088` — identical to that
file's own `receipt.producer.sha256`). No writes outside this report, no browser launched, no
`jj`/git writes, no tool installs. Deletions made: none (target is read-only).

## 0. The two questions, with evidence

1. **Exports: none.** `grep -E '\bexport\b|\bmodule\.exports\b|import\('` over the file →
   `No matches found`. Empirical: copied the file to /tmp with the tail from `const watchdog`
   (byte offset 65,091 of 65,453) removed, then `import()`ed it → `EXPORT_KEYS=[]`.
2. **Importing runs `main()` unconditionally, and it kills the importer.** `main().catch(...)`
   at `:1657-1660`, watchdog at `:1651-1655`. Empirical: set
   `process.argv=[execPath,'/tmp/x.mjs','--help']`, then
   `import('file://…/scripts/webmcp-loopback-round16.mjs')` → printed
   `node scripts/webmcp-loopback-round16.mjs [--out PATH] …` and exited 0; the importer's next
   statement never ran. `--help` (`parseArgs`, `:111-114`) is the only non-destructive branch;
   every other path reaches `process.exit` (`:1648`, and `failStart` `:1328`).

⇒ **Nothing here is importable.** A shared `scripts/lib/*.mjs` is not a monotone alternative
either: r16 is byte-frozen (PLAN "Byte-frozen surfaces", never edit), so an extracted module
would have exactly one consumer — a second convention with a single caller. **Copy is the only
clean route.** An argv/`process.exit`-trap import is additionally wrong on evidence grounds: the
r17 receipt would bind `producerSha256` to r16 bytes, run r16's 11-case suite (4 browser
processes: flagged, flag-off, domain-disabled, protocol fetch) as a side effect, and write-or-
refuse r16's frozen receipt. No extraction without editing r16: it owns process lifecycle
(`process.exit` in `failStart`/`main`), state (`launchedRuns`, `:97`) and paths (`:57-65`).

## 1. Inventory and disposition (r16 line ranges)

| r16 lines | symbol | r17 disposition |
|---|---|---|
| 35-55 | imports (crypto, child_process, fs, http, os, module, path, url) | COPY verbatim |
| 57-65 | `SCRIPT ROOT WEBMCP_DIR DEFAULT_OUT DEFAULT_FIXTURES COMMITTED_PROTOCOL DEFAULT_CHROMIUM PRODUCER_REL PLAYWRIGHT_REQUIRED` | COPY+EDIT: r16 paths → round-17, `PRODUCER_REL` |
| 67-79 | `WEBMCP_FEATURE_ARGS DOMAIN_DISABLED_ARGS HOST_RESOLVER_DENY WAIT_EVENT_MS WAIT_ACTION_MS CASE_TIMEOUT_MS RUN_TIMEOUT_MS` | COPY verbatim (flag parity is the contract) |
| 81-95 | `CASE_IDS` | REPLACE with the 11 `invoke-*` ids |
| 97 | `launchedRuns` | COPY |
| 99-121 | `parseArgs` (`--out/--fixtures/--chromium/--force`) | COPY+EDIT defaults; keep `--force` refusal |
| 123-135 | `sha256File`, `sha256FileBestEffort` | COPY |
| 137-147 | `stableStringify`, `deepEqual` | COPY |
| 149-192 | `schemaEquivalent` (declarative quirk tolerance) | COPY only if a case compares `inputSchema` |
| 197-228 | `candidatePlaywrightDirs`, `resolvePlaywright` | COPY — this **is** the runtime pin |
| 230-241 | `minimalBrowserEnv` | COPY |
| 243-271 | `readProcArgv`, `findProcessesUsing`, `findBrowserPid` | COPY |
| 273-285 | `CONTENT_TYPES` | COPY |
| 287-366 | `startFixtureServer` (loopback bind assert, realpath confinement, GET/HEAD) | COPY |
| 368-377 | `closeServer` | COPY |
| 379-393 | `probePortClosed` | COPY (closure proof) |
| 395-437 | `guardLoopback` | COPY minus its `data:` top-level-navigation exemption |
| 439-475 | `attachCdp` | COPY+EDIT event list — hazard H1 |
| 477-484 | `issueErrorTypes` | COPY (Audits.enable stays for the declarative case) |
| 486-494 | `waitFor` | COPY |
| 496-498 | `gotoFixture` | COPY |
| 500-515 | `fixtureDeclaration` (`__webmcpFixture` page contract) | COPY+EXTEND (`invocations`) |
| 517-529 | `runFixtureAction` (awaits to completion) | COPY + a fire-and-forget variant |
| 531-542 | `getToolsSnapshot` (returns names only) | EDIT: `{name,description,inputSchema,frameId}` |
| 544-576 | `parseDeclarativeTools` (markup fallback) | DROP (r17 fixtures are ours) |
| 578-604 | `toolMatches`, `compareTools` | DROP (r16 registration comparison) |
| 606-631 | `committedProtocolDomain` | DROP unless C2Counter binds `receipt.protocolDomain` |
| 633-711 | `fetchProtocolDomain` (second browser, temp profile) | DROP (same condition; 79 lines + 1 launch) |
| 713-780 | `launchChromium` (persistent ctx, pid/argv/realpath/version) | COPY |
| 782-885 | `caseFlagsOffNegativeControl`, `caseDevtoolsDomainDisabled` | DROP (new flag-off case) |
| 887-1322 | 9 r16 registration cases (11 `case*` total in file) | DROP in full |
| 1326-1329 | `failStart` | COPY |
| 1331-1649 | `main` (pushCase, missing-case fill, closure, verdict) | ADAPT |
| 1554-1624 | receipt literal | ADAPT (schema id, paths, safety text) |
| 1626-1643 | receipt writer (lstat/refuse-differs/tmp+`wx`+rename) | COPY |
| 1651-1660 | watchdog + top-level `main()` | COPY watchdog, new call |

## 2. Copy budget

Verbatim 420 lines (sum of the COPY ranges above). Edited ~94-138 (consts, `CASE_IDS`,
`parseArgs`, `attachCdp`, `getToolsSnapshot`, optionally `schemaEquivalent`). New ~490:
`invoke()` ~15, `awaitResponded()` ~12, 11 cases ~400, receipt/driver deltas ~60.
Expected ≈ **1,000-1,100 lines**; r16's 537-line case block and 105 lines of protocol fetching vanish.

## 3. Smallest harness structure (`scripts/webmcp-invoke-round17.mjs`)

1. Header: claim, loopback confinement, and the **inverted** untrusted rule (r16 `:22-24` says
   "never calls WebMCP.invokeTool" — false for this file).
2. Constants: imports, round-17 paths, `PRODUCER_REL`, `CASE_IDS`, launch args/timeouts.
3. Process + runtime pin: `parseArgs`, `sha256*`, `stableStringify/deepEqual`, `failStart`,
   `candidatePlaywrightDirs`+`resolvePlaywright`, launch/ELF shas, `Browser.getVersion`.
4. Fixture server (loopback `listen(0,'127.0.0.1')`, address assert).
5. Browser: `minimalBrowserEnv` + proc helpers + `launchChromium`.
6. CDP: `guardLoopback`; `attachCdp` (event list fixed); `invoke()` = raw
   `session.send('WebMCP.invokeTool',{frameId,toolName,input})`, store request+response;
   `awaitResponded(id)` = poll `toolResponded` **by `invocationId`, never by order**.
7. Page probes: `waitFor`, `gotoFixture`, `fixtureDeclaration`, `runFixtureAction`
   (+ non-awaited variant), widened tools snapshot.
8. 11 cases (one function each, same `{pass,expected,actual,detail,events}` shape).
9. Driver: same pushCase/missing-fill/closure/verdict skeleton; receipt write verbatim.

## 4. Copy hazards, ranked (each a silent-failure source if copied blind)

- **H1 `attachCdp` event list (`:439-475`)** subscribes `toolsAdded, toolsRemoved, toolsChanged,
  toolCalled, Audits.issueAdded`. The committed 154 domain has exactly `toolsAdded,
  toolsRemoved, toolInvoked, toolResponded` (extracted from `protocol-domain.json`:
  `experimental:true`, deps Runtime/Page/DOM, commands `enable,disable,invokeTool,cancelInvocation`).
  `toolCalled`/`toolsChanged` do not exist; both invoke events are missing. Verbatim copy ⇒ zero
  invoke evidence, every case failing plausibly. Two tokens, total consequence.
- **H2 defaults (`:57-65`)** point at frozen round-16 evidence. Verbatim copy's first run exits 2
  (`receipt_differs`) or, with `--force`, overwrites frozen bytes. `PRODUCER_REL` also makes
  `producer.path` lie.
- **H3 false safety claim**: header `:22-24` and `safety.toolInvocation` (`:1600`, "none — … no
  invokeTool/cancelInvocation/executeTool/submit") must be inverted: invocation IS performed,
  tools are read-only echo, `toolResponded.output` is page-declared-untrusted (PDL :118-119).
- **H4 `getToolsSnapshot` (`:531-542`)** returns `{name}` only → `invoke-unknown-tool` and
  `invoke-input-schema-mismatch` cannot bind `inputSchema` from page state.
- **H5 `data:` exemption in `guardLoopback`** (`url.startsWith('data:') && request.isNavigationRequest()`):
  no r17 case needs it; dropping it makes the origin claim strict (`127.0.0.1:<port>` only).
- **H6 `runFixtureAction` awaits the action** (`:517-529`) → a deliberately pending invocation
  (`invoke-navigation-pending`) hangs the `evaluate`. Needs a fire-and-forget evaluate.
- **H7** `pushCase` (inside `main`, `:1331-1649`) hardcodes
  `corpus/evidence/round-16/webmcp/fixtures/${file}` as `fixtureRel`.
- **H8** `receipt.pinned.note` (`:1576-1578`) points at r16 `runtime-pin.json`, which **the
  harness never reads** — the pin is only `PLAYWRIGHT_REQUIRED` + `resolvePlaywright` +
  `/proc/<pid>/exe` sha. r17 must also pin the required Chromium version in code, or the receipt
  cannot scope the invocation to a build without a mutable peer file.

## 5. Receipt contract deltas (PLAN text vs r16 bytes) — decide once, bind the counter to it

- `summary.caseSetOk`: PLAN lists it flat; r16 nests `caseSetOk` under `summary.caseSet`
  (`receipt.json` verified). Keep r16 nesting (the contract says "mirrors r16"); emitting both is
  duplicate authority.
- `runs[].gone`: PLAN requires it; r16 has `gone` only in `closure.pids[]`. Adding it to the runs
  map is 1 line (closure is computed before the receipt literal) and is safe.
- `.stdout.txt`/`receipt-first-run-failed.json` are runner-side; no harness change needed.
- Verdict vocabulary `pass|fail|could_not_evaluate` with exit 0/1/2 (`:1541`, `:1648`): keep.
- Console marker: r16 emits `WEBMCP_LOOPBACK …`. Use `WEBMCP_INVOKE …` and tell C2Counter, or
  keep r16's prefix verbatim — pick one, never both.

## 6. Reuse as data, not code

- `protocol-domain.json` (`f7cb1e8c…` per `ConnFrontierRows.md:215`): do not re-fetch
  `/json/protocol`; domain advertisement is an r16-held claim. Cite the committed digest if the
  note needs the surface. Saves 105 lines + one browser launch.
- `runtime-pin.json`: documentation only; the script never opens it (`:1576`).
- r16 fixtures: **not reusable** — r17 needs execute-side observation, a deferred/pending
  execute, and an unregister-after-invoke page. Write fresh fixtures under
  `corpus/evidence/round-17/webmcp-invoke/fixtures/` reusing only the `__webmcpFixture` contract
  shape (`:500-515`) extended with an `invocations` log.
- `.ufo/waves/round-16/probes/WebmcpProbeInvoke.mjs` (355 lines, raw `ws` CDP, inline fixture):
  shape reference for the invoke round-trip only (`send('WebMCP.invokeTool',…)` → poll
  `toolResponded` by `invocationId`). Copying it would put a second CDP transport beside
  Playwright — not monotone.

Files written: `.ufo/waves/round-17/w1/SimplifyC2Reuse.md`
