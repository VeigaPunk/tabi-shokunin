# CaseDevtoolsDomainDisabled — attack on receipt case `devtools-domain-disabled`

Seat: `TabiR16.CaseDevtoolsDomainDisabled`, wave 2 (FALSIFY), 2026-10-20.
Lane root: `/home/vgpnk/Projects/shokunin/tabi-shokunin`, HEAD `b444ca8e024f386124418169e8e400221524bba3`
(commit A `8f7feb3ff7a0c0ceef220a362581e325a95d6f3a` + counter repair).
Producer under attack: `scripts/webmcp-loopback-round16.mjs` (`sha256 961874e4…`), case at `:815-859`,
launch args at `:71-74`, receipt `corpus/evidence/round-16/webmcp/receipt.json`.
Read-only on the lane; all mutation probes ran in `/tmp/w2-devtools-probe` (script copies + `corpus` symlink).
No tool installs or updates were needed or performed.

## Verdict

| Sub-attack | Verdict |
|---|---|
| Expectation set from a named oracle before observation (QUALITY 17) | **HOLDS** (oracle named, prior by timestamp, content matches; binding is free text only) |
| Pass vacuous | **HOLDS — not vacuous**; the ablation conjunct discriminates. One of three conjuncts is entailed (finding M1) |
| Fixture binds the case | **BREAKS** — the case passes with a different page and with tool-free fixture bytes (finding H1) |

Overall: **BREAKS on the fixture-binding axis.** The case's two substantive assertions
(page API present under blink WebMCP; `WebMCP.enable` absent under
`--disable-features=DevToolsWebMCPSupport`) are true, reproduce exactly, and fail when the
ablation is removed. Nothing in the case depends on its declared fixture, and the third
conjunct (`toolsAdded === 0`) cannot fail once the domain is absent.

## Reproduction (honest path)

```
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin
$ node scripts/webmcp-loopback-round16.mjs --out /tmp/w2-devtools-domain-disabled.json
WEBMCP_CASE id=devtools-domain-disabled status=pass
WEBMCP_LOOPBACK verdict=pass cases=11 passed=11 failed=0 missing=0 out=/tmp/w2-devtools-domain-disabled.json
```

Case record compared field-by-field against the committed receipt
(`status`, `expected`, `expectedProvenance`, `actual`, `toolsAdded`, `events`, `flags`):
`equal: true`.

```
$ node .ufo/waves/round-16/measure.mjs b444ca8 --claim C2
{"revision":"b444ca8e024f386124418169e8e400221524bba3","c2_webmcp_held":1,...,"failures":[]}
```

Evidence from the honest run (receipt case, verbatim):

- `expected.documentModelContext` = `"object (page API present via blink WebMCP)"`,
  `actual.documentModelContext` = `"object"`
- `expected.webmcpEnable` = `"error 'wasn't found' (…)"`,
  `actual.webmcpEnableResult.error` = `cdpSession.send: Protocol error (WebMCP.enable): 'WebMCP.enable' wasn't found`
- `toolsAdded` = `[]`, `events` = `[]`
- `fixtureFile` = `declarative-form.html`, `fixtureSha256` = `7816ea656af94966989f51eb126d3bde0f8c44b7a88bd3da35fdff0b4568350e`
  (= `sha256sum` of the working file and of `git show b444ca8:…/declarative-form.html`).

## H1 — Fixture does not bind (BREAKS)

The case navigates to `declarative-form.html` (`:822`) but never reads the page content: the
pass predicate (`:828-833`) is `typeof document.modelContext === 'object'` + domain-absent
error + no CDP events. To test dependence, two probes were run from `/tmp/w2-devtools-probe`
(script copies; `corpus` symlinked read-only to the lane).

**Probe A — different page.** `caseDevtoolsDomainDisabled` changed to `gotoFixture(page, base, 'plain.html')`:

```
$ node /tmp/w2-devtools-probe/scripts/mut-fixture-plain.mjs --out /tmp/w2-devtools-probe/mut-fixture-plain.json
WEBMCP_CASE id=devtools-domain-disabled status=pass
WEBMCP_LOOPBACK verdict=pass cases=11 passed=11 failed=0 missing=0
```

**Probe D — different fixture bytes.** Committed `declarative-form.html` replaced (in a copy of
the fixtures dir) by a tool-free page, digest `250847f9ea777d936a194248363e342ee664618938b83fbbca5da49ada32c374`:

```
$ node …/webmcp-loopback-round16.mjs --fixtures /tmp/w2-devtools-probe/fx2 --out /tmp/w2-devtools-probe/mut-fixture-content.json
WEBMCP_CASE id=devtools-domain-disabled status=pass
WEBMCP_LOOPBACK verdict=fail cases=11 passed=8 failed=3 missing=0
```

The case passed while the record states
`fixtureSha256: "250847f9…"` under `fixture: "…/fixtures/declarative-form.html"` — i.e. the
per-case digest is whatever was served, and the pass is invariant to it. (At the lane revision
the counter re-hashes the committed blob, so the receipt cannot misreport *which* bytes were
served; what it cannot show is that those bytes mattered.)

**Why this is a real gap, not just a style point.** The same page under the enabled launch does
emit a tool (`declarative-form-tool` case; mutation C below shows it from this case's own page:
`toolsAdded` = one `search` tool). The page-side API under the ablation also carries the tool —
a copy with `getToolsSnapshot(page)` added to this case reports:

```
$ node /tmp/w2-devtools-probe/scripts/mut-gettools.mjs --out /tmp/w2-devtools-probe/mut-gettools.json
WEBMCP_CASE id=devtools-domain-disabled status=pass
actual.pageTools = [{"name":"search"}]
```

So the fixture-bound observation (`getTools()` = `[search]`, CDP events = `[]`) is available at
zero extra browser cost and is not recorded. As written, the case contributes no
fixture-dependent evidence to C2; that role rests entirely on `declarative-form-tool`.

## M1 — `toolsAdded === 0` is entailed by the domain-absent conjunct (pass not vacuous overall)

`attachCdp` subscribes to `WebMCP.*` events before enabling (`:435-444`). When
`'WebMCP.enable' wasn't found`, the domain does not exist, so no `WebMCP.toolsAdded` can ever be
delivered and `cdp.toolsAdded` is `[]` by construction. The case then asserts
`cdp.toolsAdded.length === 0` (`:832`) and the receipt presents `expected.toolsAdded: 0` /
`toolsAdded: []` as if observed. It is entailed, not observed; with `getTools` missing (H1) the
record cannot distinguish "page has no tools" from "channel cannot carry tools".
The `waitFor(() => cdp.toolsAdded.length > 0, 1500)` at `:823` waits for an event that cannot
arrive.

The case is nevertheless not vacuous: removing the ablation flips it.

**Probe C — ablation removed.** Launch args in the case replaced with `WEBMCP_FEATURE_ARGS`:

```
$ node /tmp/w2-devtools-probe/scripts/mut-domain-enabled.mjs --out /tmp/w2-devtools-probe/mut-domain-enabled.json
WEBMCP_CASE id=devtools-domain-disabled status=fail
detail: "docMc=object enable={} tools=1"
WEBMCP_LOOPBACK verdict=fail cases=11 passed=10 failed=1 missing=0
```

The `enableNotFound` conjunct and the page-API conjunct are each load-bearing.

## M2 — The oracle is named and prior, but not digest-bound; `expected` is never compared

Ordering (all 2026-10-20, UTC):

| Artifact | Timestamp | Source |
|---|---|---|
| oracle `.ufo/waves/round-16/probes/WebmcpProbeFlags.json` | `14:33:18.074Z` (`producedAt`) | probe file |
| first harness run `receipt-first-run-failed.json` | `14:46:36.879Z` (`generatedAt`) | retained receipt |
| committed receipt | `14:48:16.345Z` (`generatedAt`) | `receipt.json` |
| commit `8f7feb3` (contains harness + probe + receipt) | `14:54:43Z` (`%ci`) | `git show -s` |

The oracle's case `blink-WebMCP+disable-DevToolsWebMCPSupport` has args exactly
`["--enable-blink-features=WebMCP","--disable-features=DevToolsWebMCPSupport"]` and the tuple
`webMcpEnable.ok:false, surface.documentModelContextTypeof:"object", events:[]` — identical to
the case's expectation and predicate. The probe is a separate producer (own imports, own page)
and its bytes are unchanged since the commit: `git show b444ca8:…WebmcpProbeFlags.json | sha256sum`
= `c5569fa91b5be4c0eabf1685217c6139b222dba575edd6b7c692ed81ec6f88dd` = working-tree file.
No earlier harness observation of this case is retained or committed (`git log --all -- corpus/evidence/round-16/webmcp/receipt.json`
→ only `8f7feb3`; the first retained run is 14:46). Ordering therefore rests on the probe's
self-declared `producedAt` plus the retained first-run receipt; both the probe and the harness
land in the same commit, so git order cannot corroborate it.

Gaps in the binding, all code-level and reproducible:

- The receipt records the oracle only as a free-text string (`expectedProvenance`, `:840`); there
  is no `{path, sha256, locator}` and no digest of the probe anywhere in the receipt, so a later
  edit to the oracle would be invisible to the receipt and to both gates
  (`grep -n provenance .ufo/waves/round-16/measure.mjs scripts/check-measurement-binding.mjs` → no matches).
- The `expected` block is documentation, not an oracle the code compares. Probe B replaced it
  with contradictory values (`documentModelContext: 'undefined (CONTRADICTORY MUTATION)'`,
  `webmcpEnable: 'success {} (CONTRADICTORY MUTATION)'`, `toolsAdded: 7`); the case still passed:

```
$ node /tmp/w2-devtools-probe/scripts/mut-expect-flip.mjs --out /tmp/w2-devtools-probe/mut-expect-flip.json
WEBMCP_CASE id=devtools-domain-disabled status=pass
WEBMCP_LOOPBACK verdict=pass cases=11 passed=11 failed=0 missing=0
```

This is consistent with QUALITY 17 as written (expectation + real expected/actual retained;
actual rejection cause checked through the real CDP error channel, not a source-reasoned
spelling) but falls short of the wave-1 required schema (`.ufo/waves/round-16/w1/RevEvidenceSchema.md`
H5: provenance `{path,sha256,locator}`), which neither gate enforces.

## M3 — `actual.launchedArgs` is declared, not observed

`actual.launchedArgs` is `run.launchedArgs` (`:742` = `[HOST_RESOLVER_DENY, ...extraArgs]`), i.e.
the requested argv. In the committed receipt every run records `pid: null, effectiveArgv: null,
webmcpArgvTokens: []` — the `SystemInfo.getProcessInfo` lookup at `:712` yielded no browser
entry (its catch also leaves `pid` null), so `effectiveArgv` was never read (`:730-731`) and
`realExecutable` is null. For this case the
ablation is therefore evidenced behaviourally (enable error + page API), not by observed argv.
The behaviour plus the probe's 11-case flag matrix (enable succeeds with `DevToolsWebMCPSupport`
present, fails only when it is disabled) supports the causal attribution, but the receipt itself
does not show the browser received the flag. (`runtime.observed.realExecutable` is also null in
the committed receipt for the same reason.)

## Residual risk

- `enableNotFound` is a regex over the message (`/wasn't found|not found/i`, `:828`), not an
  anchored method-not-found code; an unrelated `not found` error on that send would satisfy it.
  `CDP` reports this class only as a message string on this build, and no other failure was
  reachable with the pinned browser, so the risk is theoretical.
- `expectedProvenance` cites the probe by path only. If the probe were rewritten after the
  receipt, only git archaeology could detect it; the probe is currently unchanged at HEAD.
- `summary.caseSetOk` (`:1509`) forces all 11 ids, so this case cannot silently drop out; but the
  counter's per-case checks (`measure.mjs:230-252`) re-verify only `status`, `fixtureFile` and
  `fixtureSha256`, never `expected`, `expectedProvenance` or the case's two observed facts. A
  receipt with a false `expected` block (probe B) would still count C2 = 1 if committed.

## Verification gaps (not exercised)

- No non-author certification; this is an author-side report.
- No `--force` path, cleanup/closure proof, or flags-off argv assertion was re-derived here
  (sibling seats own those); only this case's code and record were attacked.
- The `/proc` argv channel could not be exercised because the harness's own PID discovery failed
  in every run; a direct launch-side argv check was not run (out of scope for this case).
- Lane state observed but not authored by this seat: untracked
  `corpus/evidence/round-16/measurement-binding.json` (mtime `2026-10-20 11:57:18 -0300`, before
  this seat's first write at 12:04) and the untracked `.ufo/waves/round-16/w2/` report directory.
  No other lane files were changed; the only lane write from this seat is this report.
