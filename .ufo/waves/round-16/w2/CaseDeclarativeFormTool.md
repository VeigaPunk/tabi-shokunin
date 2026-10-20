# CaseDeclarativeFormTool — receipt case `declarative-form-tool`

Round 16 wave 2 (FALSIFY), leaf reviewer. Lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`. Measured snapshot
`b444ca8e024f386124418169e8e400221524bba3` (commit A
`8f7feb3ff7a0c0ceef220a362581e325a95d6f3a` + counter repair). Runtime used:
node v24.21.0, Chromium 154.0.8037.97, playwright 1.64.0 (the pinned values in
`corpus/evidence/round-16/webmcp/runtime-pin.json`). No tool installs or
upgrades were performed. All writes were under `/tmp`; `git status --porcelain
corpus/evidence/round-16/webmcp/ scripts/webmcp-loopback-round16.mjs` was empty
after the probes.

## Attack item

`corpus/evidence/round-16/webmcp/receipt.json` case `declarative-form-tool` and
its producer `scripts/webmcp-loopback-round16.mjs`: (a) is the expectation set
from a named oracle before observation (QUALITY 17), (b) is `pass` vacuous, (c)
does the fixture bind. Re-ran the harness and compared this case field by field.

## Commands and observed results

1. Rerun (lane root):
   `node scripts/webmcp-loopback-round16.mjs --out /tmp/w2-declarative-form-tool.json`
   → `WEBMCP_LOOPBACK verdict=pass cases=11 passed=11 failed=0 missing=0`, exit 0;
   `declarative-form-tool status=pass`, `comparison={"missing":[],"unexpected":[],"fieldMismatches":[]}`.
2. Field compare against the committed receipt: `expected` and `comparison`
   are byte-identical; `actual`/`toolsAdded`/`eventLog` differ only in the
   per-run CDP `frameId` (`135336A6…` → `60EB6877…`) and `atMs` (12 → 13).
   `durationMs` 32 → 43. No behavioral divergence.
3. Fixture binding:
   `sha256sum corpus/evidence/round-16/webmcp/fixtures/declarative-form.html`
   → `7816ea656af94966989f51eb126d3bde0f8c44b7a88bd3da35fdff0b4568350e` =
   receipt `fixtureSha256`. `git rev-parse b444ca8:…/declarative-form.html` =
   `3aa80d62f582b0188eb47f8cdd6a73b2f487d1e9` = `git hash-object` of the
   worktree file, so the served bytes are the measured-revision bytes.
   `producerSha256` `961874e…` equals sha256 of the worktree harness, whose git
   blob id `ffbfc69a…` equals `b444ca8:scripts/webmcp-loopback-round16.mjs`.
4. Oracle binding: evaluated the fixture's own inline script in a `vm` context —
   `fixture-declared expectedTools == receipt.expected.tools` is `true`;
   `expectedTools` occurs once in the fixture; no `setTimeout`/`setInterval`/
   `addEventListener`/`MutationObserver` in the fixture.
5. C2 counter:
   `node .ufo/waves/round-16/measure.mjs b444ca8e024f386124418169e8e400221524bba3 --claim C2`
   → `{"c2_webmcp_held":1,…,"failures":[]}`, exit 0, `inputsRead` includes all
   7 fixture blobs and the receipt/harness.
   At `e38d2599a922cb729186353830fff8e159b4fef0` →
   `{"c2_webmcp_held":0,"failures":["note, receipt or harness absent at revision"]}`, exit 0.
6. Mutation probes on copies of `fixtures/` under `mktemp -d`, each run with
   `--fixtures <copy> --out /tmp/...`:
   - form `toolname="search"` → `"searchx"`: case `fail`, `missing=1 … unexpected=1`.
   - remove `required` from the category input: case `fail`, `fieldMismatches=1`,
     actual `required: []`.
   - `tooldescription="Search"` → `"SearchX"`: case `fail`, `fieldMismatches=1`.
   - expected-side only: `enum: ['relevance','date']` → `enum: ['bogus','wrong']`
     in `__webmcpFixture.expectedTools` (form unchanged): case **`pass`**,
     `comparison={"missing":[],"unexpected":[],"fieldMismatches":[]}`, while
     receipt-side `expected enum` is `["bogus","wrong"]` and `actual enum` is
     `["relevance","date"]`.
   - browser-side only: `<option value="relevance|date">` → `zzz|qqq` (expected
     unchanged): case **`pass`**, `comparison` empty.
7. Post-observation oracle probe: a copied fixture whose `expectedTools` is
   populated after load from `document.modelContext.getTools()` (parsing the
   string `inputSchema` this build returns) → case **`pass`** with
   `expectedProvenance: "fixture __webmcpFixture.expectedTools"`, and the
   receipt-side `expected` now carries the page-derived `anyOf/const` shape.

## Findings

### F1 — MEDIUM — BREAKS: declared `enum`/`anyOf` constraints are not compared

`schemaEquivalent` (scripts/webmcp-loopback-round16.mjs:153-192) normalizes a
string-valued `enum` and a string-only `anyOf` away (`delete copy.enum` /
`delete copy.anyOf`, lines 163-172) before comparing. In this case the fixture
oracle declares `sort: {enum:['relevance','date'], description:'Sort order'}`
(receipt `expected.tools[0].inputSchema.properties.sort`). Probe 6d shows the
same case passing with `expected enum ["bogus","wrong"]` against
`actual enum ["relevance","date"]` and an empty `comparison`; probe 6e shows it
passing with actual enum `["zzz","qqq"]`. So `comparison.fieldMismatches: []`
does **not** mean the expected schema matched: name, description, property set,
type, and `required` are enforced (6a-6c fail correctly), but the declared
enum/`anyOf` values are inert. `divergence: false` is therefore overstated for
that schema dimension.

### F2 — MEDIUM — BREAKS/UNPROVEN at harness level: the expectation is read after observation from live page state

`caseDeclarativeForm` navigates, then
`await waitFor(() => cdp.toolsAdded.length > 0, …)`, and only then calls
`fixtureDeclaration(page)` and reads `decl?.expectedTools`
(scripts/webmcp-loopback-round16.mjs:865-869). The expectation is not read or
committed before the browser runs; it is whatever the page exposes at read
time, and `expectedProvenance` still labels it "fixture
__webmcpFixture.expectedTools". Probe 7 makes that concrete: a page that
computes its own `expectedTools` from `document.modelContext.getTools()` passes
the case with no hand-authored oracle. For the *committed* fixture the property
holds in substance — the fixture assigns `expectedTools` once, statically, with
no timers or mutation handlers (probe 4), and the receipt's expected equals
those bytes — but the harness has no pre-observation commitment or
independence check, so a future fixture (or a mutated fixture) can self-oracle
and still be labelled as a fixture oracle.

### F3 — LOW — C2 counter does not inspect `expected` or `comparison`

`.ufo/waves/round-16/measure.mjs:193-253` counts C2 from receipt `status`,
`fixtureFile`/`fixtureSha256` against the git blob at REV, `producerSha256`,
and `toolsAdded.length > 0` for the positive case. It never reads
`expected`, `comparison`, or re-runs the harness. The F1 weakening therefore
does not change `c2_webmcp_held` (still 1, `failures: []`) and the count cannot
detect it; a hand-edited receipt with `status:"pass"` would also not be
distinguished by this counter. This is a receipt-trust boundary, reported here
because it is the route from the case to the counted claim.

## What holds

- Rerun reproduces the case: same status, same expected, same empty comparison;
  only per-run `frameId`/`atMs` change. Not fabricated and not flaky in one run.
- Fixture digest binding holds: receipt `fixtureSha256` = on-disk sha256 = blob
  at the measured revision; `producerSha256` = harness blob at the revision;
  C2 recomputes the fixture digest and reports no failure.
- The committed expectation is a named, fixed oracle in substance: it is the
  fixture's single static `expectedTools` assignment and the receipt copies it
  exactly (probe 4).
- The pass is not globally vacuous: empty expectation is rejected
  (`expected.length > 0`, line 872) and name/description/`required` mutations
  fail (probes 6a-6c).
- The claimed C2 movement is real: 0 at `e38d259…` (files absent) → 1 at
  `b444ca8…` (`failures: []`), exit 0 both.

## Verdict

**BREAKS (partial, scoped to the case's schema-conformance guarantee).** The
observation, reproduction, and fixture-digest binding hold; but the case's
`pass`/empty `comparison` is vacuous for the `sort` enum/`anyOf` constraints
its own `expected` declares (F1, demonstrated with expected
`["bogus","wrong"]` vs actual `["relevance","date"]`), and the harness reads
the expectation from page state after observation with no pre-observation
commitment (F2, demonstrated with a page-derived oracle that passes while
keeping the fixture provenance label). C2's 1 is unaffected because the
counter never reads those fields (F3).

## Residual risk and verification gaps

- One run of the rerun (11/11, 8.6 s); no repeat-run flake test was performed.
- `frameId` is per-run and not comparable; it is not treated as a binding
  failure. `atMs`/`durationMs` are timing only.
- The dynamic-oracle probe altered a fixture copy only; the committed fixture
  was not modified and the lane stayed clean.
- Observation from probe 7: this build's page API
  `document.modelContext.getTools()` returns `inputSchema` as a JSON string,
  while CDP returns an object. That is a build-shape fact outside this case's
  assertion (the case's `actual.getTools` records names only) and was not
  scored.
- Not attacked here: whether a hand-edited receipt would pass C2 without a
  re-run (F3), and the other ten cases.
