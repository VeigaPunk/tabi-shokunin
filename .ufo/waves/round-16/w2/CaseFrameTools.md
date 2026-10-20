# CaseFrameTools — receipt case `frame-tools`

Round 16 wave 2 (FALSIFY), leaf reviewer. Lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`. Measured snapshot
`b444ca8e024f386124418169e8e400221524bba3` (commit A
`8f7feb3ff7a0c0ceef220a362581e325a95d6f3a` + counter repair). Runtime:
node v24.21.0, Chromium 154.0.8037.97, playwright 1.64.0. No tool installs or
upgrades were performed (nothing was missing). All writes were under `/tmp`;
`git status --porcelain corpus/evidence/round-16/webmcp/ scripts/webmcp-loopback-round16.mjs`
was empty after the probes. This report is author-side, not certification.

## Attack item

`corpus/evidence/round-16/webmcp/receipt.json` case `frame-tools` and its
producer `scripts/webmcp-loopback-round16.mjs` (`caseFrameTools`,
lines 1109-1190): (a) is the expectation set from a named oracle **before**
observation (QUALITY 17), (b) is `pass` vacuous, (c) does the fixture bind.
Re-ran the harness from the lane root and compared the case field by field,
then ran six fixture-mutation probes on copies under `/tmp`.

## Commands and observed results

1. Baseline rerun (lane root):
   `node scripts/webmcp-loopback-round16.mjs --out /tmp/w2-frame-tools.json`
   → `WEBMCP_CASE id=frame-tools status=pass`,
   `WEBMCP_LOOPBACK verdict=pass cases=11 passed=11 failed=0 missing=0`, exit 0.
2. Field compare against the committed receipt:
   `status SAME · detail SAME · events SAME · divergence SAME · fixtureSha256 SAME`;
   `expected DIFF · toolsAdded DIFF` only in the ephemeral port
   (`43245` → `41339`) and CDP `frameId` (`7281F0AA54545E606407C692EB7299D9` →
   `250C708E199CEEF903EBF8D3790661E9`); `atMs` 16 → 24, `durationMs` 36 → 53.
   In the committed case, `expected.perFrameTools[0].frameId` =
   `toolsAdded[0].frameId` = the CDP child-frame id `7281F0AA…`, and
   `cdpFrames` holds parent `07C895A2…/frame-parent.html` and child
   `7281F0AA…/frame-child.html`.
   Note `expected` records only `{frame, frameId, name}` — not the
   `description`/`inputSchema` the matcher actually compares (lines
   1159-1164); those are only visible in `actual.perFrameDeclarations`.
3. Fixture/producer binding to the measured revision:
   - `frame-parent.html`: worktree blob `d3acf1d076985f256638497a646bc45eacaf32c8`
     = `b444ca8:…`; sha256 `5b51e2700c73ab922e6573dce1e0aae1265d78d5fd2d89beeead354e91a96eb3`
     = receipt per-case `fixtureSha256`.
   - `frame-child.html`: worktree blob
     `dd7496fac9ccba4dbe580353b913edb4bdb396d7` = `b444ca8:…`; sha256
     `a4e060ada0e804aa4ab7220269b813ad4018365f364645118d88ba742e7727b6`
     = receipt `fixtures[1]`.
   - harness: worktree blob `ffbfc69a36beb6a36e489cea5a4b59d4f68fd862`
     = `b444ca8:…`; sha256 `961874e48f608983ddde31a8b7800ec1bb22616bea36b610677d1e916f8e2be1`
     = receipt `producerSha256`.
4. Mutation probes, each `--fixtures /tmp/w2ft.hov5IF/<L> --out /tmp/w2ft-<L>.json`
   on a copy of `fixtures/`; only `frame-*.html` changed:
   - **A — oracle name mutated** (both declarations `childSearch`→`childSearchX`,
     form unchanged): exit 1, `status=fail`,
     `detail: tool not observed: childSearchX (frame …/frame-child.html)`.
   - **B — observed tool renamed** (`toolname="childSearch"`→`"renamedTool"`,
     oracle unchanged): exit 1, `status=fail`,
     `detail: tool not observed: childSearch (frame …/frame-child.html)`,
     `toolsAdded: ["renamedTool"]`.
   - **D — tool moved to the parent frame** (parent gets the identical
     declarative form; child keeps only the `expectedTools` declaration):
     exit 1, `status=fail`,
     `detail: frameId mismatch for childSearch: expected FA60B79EA3FE369706B3574330B797CF, got E7588FDF5E5376C5A4D9B4B6642B437D`.
   - **F — expected schema tightened** (`required: []`→`["q"]`, form unchanged):
     exit 1, `status=fail`, `detail: tool not observed: childSearch
     (frame …/frame-child.html)`; observed `required: []`.
   - **C — frame marker contradicted** (iframe removed; identical declarative
     form in the parent; `expectedTools[0].frame` stays `'child'`): exit 0,
     **`status=pass`**, `detail: 1 tool(s) attributed to their declaring frames`,
     `expected.perFrameTools[0] = {frame: "http://127.0.0.1:35401/frame-parent.html",
     frameId: "E9BC0240AA8D948F632559F5213A2EE0", name: "childSearch"}` and the
     observed tool carries the same parent frameId. `frame:'child'` was silently
     satisfied by the top document.
   - **E — post-observation oracle**: child fixture's parse-time oracle is
     `{name:'WRONG', …}`; a page task (`setTimeout(rewrite, 0)`) changes it to
     `childSearch`; parent declares `[]`. Result: exit 0, **`status=pass`**,
     `expected … name:"childSearch"`; `actual.perFrameDeclarations` shows the
     rewritten child declaration. **E3** repeats this with **no timer**: the only
     rewrite path is `document.modelContext.ontoolchange` /
     `addEventListener('toolchange', rewrite)`; result: exit 0, **`status=pass`**,
     `expected … frame-child.html … name:"childSearch"`, i.e. the oracle was
     rewritten by the page's own tool-registration notification and then read by
     the harness.
5. Retained first-run receipt:
   `corpus/evidence/round-16/webmcp/receipt-first-run-failed.json` case
   `frame-tools` was `fail`, `detail: tool not observed: childSearch
   (frame http://127.0.0.1:35929/frame-child.html)`,
   `fixtureSha256 d281ff6656bae0f1910d7f68616de85c91a6464c7a8b14db2bc738a4fcd5a3c7`.
   Its inventory: `frame-child.html 6ed41b9a… 636 B`,
   `frame-parent.html d281ff… 561 B`; current bytes: `a4e060ad… 860 B`,
   `5b51e270… 583 B`. `git cat-file -t d281ff…` → `fatal: Not a valid object
   name`: those fixture bytes are not in the snapshot. The first-run observed
   tool payload already carried `properties.q.description = "Query"`; the
   current expectation adds that field. The pre-fix bytes are gone, so the
   attribution of the failure to the missing `description` is [INFERENCE]
   from the observed payload, the current expected schema and the fixture
   comment “Added after the first L1 run omitted it and failed”.
6. The committed fixtures are static oracles: one `expectedTools` assignment per
   frame file and no `setTimeout`/`setInterval`/`addEventListener`/
   `ontoolchange`/`MutationObserver`.

## Findings

### F1 — MEDIUM — BREAKS: the expectation is read after observation from mutable page state

`caseFrameTools` waits for the tool event first
(`await waitFor(() => cdp.toolsAdded.length > 0, WAIT_EVENT_MS)`,
line 1114), then reads `__webmcpFixture.expectedTools` from every live frame
(`pwf.evaluate`, lines 1127-1130), then resolves the expected `frameId` from
the post-event `Page.getFrameTree` (lines 1115, 1136, 1154). Nothing is
snapshotted or committed before the observation. Probe E3 shows this is not
theoretical: a fixture whose authored oracle says `WRONG` and which rewrites
its oracle inside `ontoolchange`/`toolchange` **passes**, and the receipt labels
the rewritten value `expectedProvenance: "fixture __webmcpFixture.expectedTools
per frame (frame marker attribution)"`. A page can therefore self-oracle after
the observation and still be recorded as a fixture oracle. For the *committed*
fixture the property holds in substance (single static assignment, probe 6),
but the harness enforces neither pre-observation commitment nor independence.

### F2 — MEDIUM — BREAKS: `frame:'child'` is not required to resolve to a child frame

At lines 1151-1153 the `frame` marker resolves as
`selfDeclared.get(name) ?? perFrame.find(f => f.url !== parentUrl)?.url ?? pf.url`.
When no non-parent frame exists, the last fallback is the declaring frame
itself. Probe C (iframe removed, same declarative form in the parent, marker
still `'child'`) returns `status=pass`, `expected.frame = …/frame-parent.html`.
So a pass certifies only “a matching tool exists in the frame the harness
resolved”, not “the tool was attributed to a child frame” as the fixture
marker claims. The substitution is visible in the receipt's `expected` (parent
URL), but the status is `pass`; the case cannot distinguish the intended shape
from this degenerate one.

### F3 — LOW — the retained first-run failure is not reproducible from the snapshot

The first-run receipt binds fixture hashes (`d281ff…`, `6ed41b9a…`) that are not
git objects and do not match the committed bytes (`5b51e270…`, `a4e060ad…`);
see item 5. The retained failure was produced against an uncommitted fixture
state and cannot be re-run. The correction itself is documented and
independently grounded — `<label>Query</label>` → parameter `description:
"Query"` is the rule also used and evidenced by `declarative-form.html` — so
this is a traceability gap for the falsification evidence, not proof of
laundering.

### F4 — LOW — per-case binding covers only half of the oracle, and `expected` under-reports the comparison

The case's `fixtureSha256` is `frame-parent.html` only; the child's
self-declared `expectedTools` (the frame that actually declares the observed
tool) is bound only by the receipt-level `fixtures` inventory. The case record's
`expected` carries `{frame, frameId, name}` while the matcher also enforces
`description` and `inputSchema` (lines 1159-1164); a verifier must correlate
`actual.perFrameDeclarations` to see what was compared. The `schemaEquivalent`
enum/`anyOf` normalization reported against `declarative-form-tool` is not
reachable here: the frame schema declares no `enum`/`anyOf`, and probe F shows
the `required` difference is enforced.

### F5 — LOW (code-read, not exercised) — existential matching and nullable frame checks

`match` is a `find` over all `toolsAdded` (lines 1159-1164); extra tools are
never treated as unexpected. A duplicate of the expected tool in the parent
frame would be ignored if the child's event is matched first (ordering
dependent; no probe run). The frameId checks are skipped when `exp.frameId`
is null (lines 1169, 1172), e.g. if URL lookup fails; the null is recorded in
`expected.frameId`, so it is visible, but the case would pass without frame
attribution.

## What holds

- Rerun reproduces the case under the measured revision: same `status`, same
  `detail`, same `fixtureSha256`, same event type; only the ephemeral port,
  CDP `frameId`, `atMs` and duration differ. Not fabricated, not flaky in one
  run; `closure.everyStopProof` true.
- Fixture/producer digests bind to `b444ca8` bytes (item 3); worktree and
  revision blobs agree, and `git status` is clean for the three paths.
- The committed pass is not globally vacuous: empty expectations are rejected
  (`expectations.length > 0`, line 1176), and probes A (oracle name), B
  (observed name), D (frame identity) and F (schema `required`) all fail with
  the expected diagnostics.
- With the committed fixture shape, frame attribution is actually checked:
  the observed tool's `frameId` equals the CDP child-frame id, and probe D
  (tool moved to the parent) fails on the frameId comparison.

## Verdict

**BREAKS (partial, scoped to the harness's oracle-timing and frame-attribution
guarantees).** The committed `frame-tools` pass reproduces and is non-vacuous
for name/description/schema/frameId under its own static fixtures. However:
(a) the QUALITY 17 “expectation before observation” property does not hold as
a harness invariant — the oracle is read from live page state after the
`WebMCP.toolsAdded` event and can be rewritten by the page's own `toolchange`
handler before the read (F1, probe E3); and (b) a fixture-declared
`frame:'child'` marker can silently resolve to the top frame and still pass
(F2, probe C). F3-F5 are traceability and completeness gaps.

## Residual risk and verification gaps

- The fixture server hashes a startup read of each file but serves from disk per
  request (`startFixtureServer`, lines 277-333) — a mid-run write could desync
  the receipt's `fixtureSha256` from the served bytes. Not exercised: the lane
  is read-only and a concurrent writer would be required; the committed
  receipt's hashes match the worktree today.
- Duplicate-tool ordering (F5) was not probed; a stable probe needs control of
  event order between the parent and child registration.
- Probe E3 establishes one rewrite path (`toolchange` handler) and one pass;
  it does not characterize every way a page could compute the oracle
  post-registration (the sibling `declarative-form-tool` report shows a
  `getTools()`-derived oracle passing for that case).
- One run per probe on a single host/build (Chromium 154.0.8037.97); the
  baseline matches the committed receipt field for field apart from ephemeral
  values.
