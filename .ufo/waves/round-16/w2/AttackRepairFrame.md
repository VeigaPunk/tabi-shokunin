# AttackRepairFrame — frame-tools post-failure repair: grounded or back-fitted?

Seat: `TabiR16.AttackRepairFrame` (leaf reviewer, wave 2). Lane root
`/home/vgpnk/Projects/shokunin/tabi-shokunin`, measured revision
`b444ca8e024f386124418169e8e400221524bba3` (commit A `8f7feb3f`, plus counter repair).
Scope: the `description: 'Query'` added to
`corpus/evidence/round-16/webmcp/fixtures/frame-{parent,child}.html` after the first
harness run failed `frame-tools`. Author-side report; not non-author certification.

## Verdict

**Attack-item verdict: HOLDS.** The label→schema-property `description` rule is
independently grounded at the exact measured build tag (Chromium
`154.0.8037.97`, `form_mcp_schema.cc` precedence `toolparamdescription` → label
text → `aria-description`), was independently observed *before* the first harness
run by the wave-1 probe (`param-with-label`, 14:32:14Z vs first run 14:46:36Z),
and my forward mutation with a never-observed label (`Find things`) predicts and
passes while the stale `Query` expectation fails. The repaired expectation is
therefore source-grounded, not an arbitrary copy of the observation.
`frame-tools` remains a live check, not a vacuous pass.

**Collateral verdict: BREAKS — recorded provenance.** The knowledge note's
correction #2 cites "the label rule already observed in `declarative-form-tool`";
the artifacts falsify that citation. `declarative-form-tool` observed only the
`toolparamdescription` override (`q.description = "Query text"`, not the label
`Query`), and every `declarative-form.html` control carries
`toolparamdescription`. Within the committed fixtures, the repaired
`frame-child.html` is the *only* case that exercises label fallback. The repair
is also mechanically a back-fit: the exact pre-repair fixture bytes reconstruct
from the first-run receipt hashes, and the delta is exactly the observed
`description` value. The value is source-correct, but the note's stated basis is
not.

## Evidence (commands and observed output)

### 1. Committed state and what git can/cannot show

```
$ git log --oneline -- corpus/evidence/round-16/webmcp/fixtures/frame-parent.html \
    corpus/evidence/round-16/webmcp/fixtures/frame-child.html
8f7feb3 round-16: measurement-binding gate, native WebMCP loopback capability, sources and wave-1 evidence

$ git diff 8f7feb3 HEAD -- corpus/evidence/round-16/webmcp/fixtures/
(no output)
```

The repaired fixtures are already in commit A; the only retained before-state is
the first-run receipt (fixture SHA-256 + byte counts + evaluated declarations) and
`receipt-first-run-failed.stdout.txt`.

### 2. Exact pre-repair bytes reconstructed (content-addressed)

Removing the three-line comment block (202 B) and `, description: 'Query'` (22 B)
from `frame-child.html`, and only `, description: 'Query'` (22 B) from
`frame-parent.html`:

```
$ node -e '... remove comment + description, sha256 ...'
comment present: true len 202
child  reconstructed bytes 636 sha256 6ed41b9aac86ce1fc987f446daf0cb14a0129f4374f10b793c14137e7db89b24
parent reconstructed bytes 561 sha256 d281ff6656bae0f1910d7f68616de85c91a6464c7a8b14db2bc738a4fcd5a3c7
```

These equal the first-run receipt's recorded hashes exactly:

```
frame-child.html  636  6ed41b9aac86ce1fc987f446daf0cb14a0129f4374f10b793c14137e7db89b24
frame-parent.html 561  d281ff6656bae0f1910d7f68616de85c91a6464c7a8b14db2bc738a4fcd5a3c7
```

So the repair delta is provably only the `description: 'Query'` expectation in
both declarations (child 636→860 B, parent 561→583 B), plus the explanatory
comment in the child. No HTML/label change occurred.

### 3. Baseline reproduction on the committed fixtures

```
$ node scripts/webmcp-loopback-round16.mjs --out /tmp/r16a-frame/baseline.json
...
WEBMCP_CASE id=frame-tools status=pass
WEBMCP_LOOPBACK verdict=pass cases=11 passed=11 failed=0 missing=0 out=/tmp/r16a-frame/baseline.json
real 0m8.7s
```

### 4. Pre-repair fixtures under the current harness → same failure

```
$ sha256sum /tmp/r16a-frame/fx-OLD/frame-child.html /tmp/r16a-frame/fx-OLD/frame-parent.html
6ed41b9a...  /tmp/r16a-frame/fx-OLD/frame-child.html
d281ff66...  /tmp/r16a-frame/fx-OLD/frame-parent.html

$ node scripts/webmcp-loopback-round16.mjs --fixtures /tmp/r16a-frame/fx-OLD \
    --out /tmp/r16a-frame/receipt-OLD.json
WEBMCP_CASE id=frame-tools status=fail
WEBMCP_LOOPBACK verdict=fail cases=11 passed=10 failed=1 missing=0
EXIT=1

detail: tool not observed: childSearch (frame http://127.0.0.1:42317/frame-child.html)
actual q: {"type":"string","description":"Query"}
fixtureSha256: d281ff6656bae0f1910d7f68616de85c91a6464c7a8b14db2bc738a4fcd5a3c7
```

The `frame-tools` failure is reproduced exactly (same detail string) and only the
description expectation decides it.

### 5. Forward mutation with a never-observed label (falsification test)

Copies under `/tmp/r16a-frame/fx-*`; lane untouched.

| Mutant | Label in `frame-child.html` | Expected `q.description` | Exit | `frame-tools` | Actual `q.description` |
|---|---|---|---|---|---|
| A | `Find things` | `Query` (stale) | 1 | **fail** | `Find things` |
| B | `Find things` | `Find things` (predicted) | 0 | pass | `Find things` |
| C | `Query` + `toolparamdescription="Wrapped"` | `Wrapped` | 0 | pass | `Wrapped` |

```
$ node scripts/webmcp-loopback-round16.mjs --fixtures /tmp/r16a-frame/fx-A \
    --out /tmp/r16a-frame/receipt-A.json
WEBMCP_CASE id=frame-tools status=fail
WEBMCP_LOOPBACK verdict=fail cases=11 passed=10 failed=1 missing=0 out=/tmp/r16a-frame/receipt-A.json
EXIT=1
actual: {"type":"object","properties":{"q":{"type":"string","description":"Find things"}},"required":[]}

$ node scripts/webmcp-loopback-round16.mjs --fixtures /tmp/r16a-frame/fx-B ...
WEBMCP_LOOPBACK verdict=pass cases=11 passed=11 failed=0 ... EXIT=0
actual: q.description = "Find things"

$ node scripts/webmcp-loopback-round16.mjs --fixtures /tmp/r16a-frame/fx-C ...
WEBMCP_LOOPBACK verdict=pass cases=11 passed=11 failed=0 ... EXIT=0
actual: q.description = "Wrapped"
```

Mutant A shows the pinned value is binding, not a wildcard; B and C show the rule
generalises to a novel string and the override precedence, inside a same-origin
iframe with a wrapping `<label>`.

### 6. Source at the measured tag (opened this session)

```
$ curl -sS -m 120 -o /tmp/r16a-frame/form_mcp_schema_154.cc \
  "https://raw.githubusercontent.com/chromium/chromium/154.0.8037.97/third_party/blink/renderer/core/html/forms/form_mcp_schema.cc"
HTTP 200 bytes 51703
sha256 904b75e705f89910522ff7db733c5cd3729178cf496607d50b6124e96502152f
1440 form_mcp_schema_154.cc
```

`FormMCPSchema::ComputeDescription` (`form_mcp_schema.cc:1147-1189`, tag
`154.0.8037.97`, accessed 2026-10-20):

- `:1154` — "Prefer 'toolparamdescription' when present."
- `:1160` — "Absent a 'toolparamdescription' attribute, use concatenated label text."
- `:1165` — "Last resort: aria-description."
- `LabelText` (`:1219-1240`) uses `control.labels()`, joining
  `TextContentExcludingLabelable().StripWhiteSpace()` with `"; "`.

Wrapping `<label>Query <input name="q"></label>` therefore yields
`description: "Query"` for the single-control parameter `q` — the repaired
expectation, derived from the source rather than from the first-run output.

### 7. Independent pre-repair runtime observation

`.ufo/waves/round-16/probes/WebmcpProbeIssues.json`, `generatedAt`
`2026-10-20T14:32:14.437Z` (before the first harness run at
`2026-10-20T14:46:36.879Z`):

| probe case | observed `inputSchema` | issueCodes |
|---|---|---|
| `param-with-label` (`<label for>`) | `q: {type:"string", description:"Query"}` | `[]` |
| `param-missing-title-and-description` (no label/attr) | `q: {type:"string"}` | 2 GenericIssue |
| `param-with-toolparamdescription` | `q: {type:"string", description:"Query text"}` | `[]` |

This establishes the fallback rule independently of the frame fixture and before
the failure being repaired.

### 8. The `declarative-form` route does not demonstrate the fallback

```
$ node -e '... receipt.json declarative-form-tool ...'
declarative-form-tool status: pass
toolsAdded[0].inputSchema.properties:
  q:        {"type":"string","description":"Query text"}
  category: {"type":"string","description":"Category filter"}
  sort:     {... "description":"Sort order"}
```

`declarative-form.html` line 7-10: every control carries `toolparamdescription`;
`q`'s label text is `Query` but the observed description is `Query text`. The case
therefore evidences the override precedence, not the label fallback. The only
label-only, tool-registering fixture in the committed set is the repaired
`frame-child.html` (`declarative-missing-name.html` has a label-only input but no
`toolname`, so it registers nothing).

## Findings

### F1 — MEDIUM — the note's stated basis for the repair is false (provenance)

`corpus/knowledge/webmcp-chromium-loopback-round-16.md` §Corrections #2:
"frame-tools expected no `description` for a labelled input; repaired from the
label rule already observed in `declarative-form-tool`." Falsified by §8:
`declarative-form-tool` observed the `toolparamdescription` override only. The
fixture comment (`frame-child.html:17-21`, "same rule as declarative-form.html")
overstates in the same way. Accurate citations are
`form_mcp_schema.cc:1147-1189` at the 154 tag and the 14:32Z `param-with-label`
probe. The value is right; the recorded derivation is wrong and should be
corrected (note + fixture comment), else the provenance record invites a
back-fit reading that the evidence does not support.

### F2 — LOW — "expected no description" misdescribes the first-run failure

The first-run declaration simply had no `description` key under `q`; because
`schemaEquivalent` (`scripts/webmcp-loopback-round16.mjs:153-206`) treats a
property schema as closed (an extra actual key fails), the observed
`description:"Query"` rejected it. At the tool level a null description *is*
unconstrained (`toolMatches`/`caseFrameTools`), so the failure originated in the
nested-schema comparator, not in an explicit "no description" assertion. Pinning
the observed, source-predicted value was the only strict repair; loosening the
comparator would have been the vacuous alternative and was not taken (mutant A
proves the pin is live).

### F3 — INFO — repair is mechanically a back-fit but not vacuous

Content-addressed reconstruction (§2) proves the repair copied the first-run
actual `"Query"` into the expectations. That is a back-fit by provenance, yet the
repaired expectation is source-predicted (154 tag), was independently observed
pre-repair (§7), and survives a novel-string forward test (A fails, B/C pass).
`frame-parent.html`'s copy is inert: the harness skips a parent entry with a frame
marker when the child self-declares the same tool name
(`scripts/webmcp-loopback-round16.mjs:1149-1155`); only the child's expectation is
evaluated.

## Residual risk and verification gaps

- One build (`Chromium 154.0.8037.97`), one host; Playwright `1.64.0`, Node
  `24.21.0`. No installs or upgrades were performed (nothing needed).
- The first-run *harness* bytes are not retained, only `producerSha256
  cedccdf9…` vs the current `961874e4…`; the claim that only the three documented
  repairs changed cannot be verified for harness code. The fixture delta is
  exactly verified by hash.
- The independent probe used `<label for>`; the fixture uses a wrapping
  `<label>`. Mutants A/B/C bridge that difference at runtime in an iframe.
- `declarative-form-tool`'s own expectation is fixture-declared and its
  `expectedProvenance` says "observed baseline", so the receipt's oracle quality
  is uneven across cases; this item is sound only on the external grounds above.
- All mutation work was done on copies under `/tmp/r16a-frame/`; the lane was
  read-only apart from this report. Harness runs used `--out /tmp/...` only.
