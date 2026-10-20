# w2 — case `opaque-sandboxed-iframe` (attack: oracle-before-observation, vacuity, fixture binding)

Seat: `TabiR16.CaseOpaqueSandboxedIframe` (leaf, read-only lane; every mutation below ran in `/tmp`).
Target: receipt case `opaque-sandboxed-iframe` at measured revision `b444ca8e024f386124418169e8e400221524bba3`
(commit A `8f7feb3` + counter repair `b444ca8`), receipt `corpus/evidence/round-16/webmcp/receipt.json:1808-1869`,
harness `scripts/webmcp-loopback-round16.mjs:1194-1265` (case), `:1402` (case table), `:1229-1236` (pass predicate),
`:1345-1356` (`fixture`/`fixtureSha256` field assembly).

**Verdict: HOLDS at b444ca8** — the expectation is a constant named-oracle assertion written before the passing
observation, the recorded pass exercises the strong branch and flips under the counterfactual, and the fixture
carries no claim. One medium predicate finding (F1: `mcType !== 'object'` admits a vacuous pass — demonstrated) and
two provenance/traceability findings (F2, F3). Nothing here makes the recorded `actual` false.

Author-side falsification, not a non-author certification.

## Axes

| Axis | Question | Verdict |
|---|---|---|
| A1 | Expectation fixed from a named oracle BEFORE observation (QUALITY 17) | HOLDS |
| A2 | Is `pass` vacuous — can status=pass occur without the claimed cause? | HOLDS on this build; vacuous branch exists and was demonstrated (F1) |
| A3 | Does the fixture bind the stimulus/expectation? | No binding; declared as harness-specified (F2) |
| A4 | Reproduces the committed case at b444ca8 | HOLDS |

QUALITY 17 as stated in this lane (`corpus/QUALITY.md:48-52`): “A runtime negative control has a complete case-input
manifest and checks the pinned producer's actual rejection cause, not any exception or source-reasoned diagnostic
spelling. Retain the real expected/actual structure and a positive control”. A1/A2/A3 below track those four clauses.

## A1 — expectation precedes observation, from a named oracle

1. The two retained receipts carry **byte-identical** `expected` and `expectedProvenance` while their producers
   differ — the expectation was not fitted to the passing observation:

```
$ node -e '
const a=require("./corpus/evidence/round-16/webmcp/receipt.json").cases.find(c=>c.id==="opaque-sandboxed-iframe");
const b=require("./corpus/evidence/round-16/webmcp/receipt-first-run-failed.json").cases.find(c=>c.id==="opaque-sandboxed-iframe");
console.log("expected_equal", JSON.stringify(a.expected)===JSON.stringify(b.expected));
console.log("provenance_equal", a.expectedProvenance===b.expectedProvenance);'
expected_equal true
provenance_equal true
```

| receipt | producer sha256 | generatedAt | case status |
|---|---|---|---|
| `receipt-first-run-failed.json` | `cedccdf9b649fcead09b391cfe7b34fcbcb992ce503aac8adf21a55699149779` | 2026-10-20T14:46:36.879Z | fail |
| `receipt.json` | `961874e48f608983ddde31a8b7800ec1bb22616bea36b610677d1e916f8e2be1` | 2026-10-20T14:48:16.345Z | pass |

The expectation is also a code literal, not derived from `report` (`:1238-1243` returns fixed literals; only `actual`
varies), and the red set of the first run includes this case:
`fail failed ids: [ 'navigation-clears-tools', 'frame-tools', 'opaque-sandboxed-iframe' ]`.

2. Named oracle observed **before the first retained harness run**: `.ufo/waves/round-16/probes/WebmcpProbeSecure.json`
   (`producedAt 2026-10-20T14:30:00.446Z`, sha256 `97c377f48256f10f1568365594b5c31b4ba3112176c9153ce251230b12a5e3cd`)
   carries the paired control:

```
sandbox_iframe_opaque:       sandbox "allow-scripts", frame modelContextType "object", navigator false,
                             frameImperative.registered false,
                             error "NotAllowedError: Access to the feature \"tools\" is disallowed by permissions policy.",
                             toolsAddedCount 0
sandbox_iframe_same_origin:  sandbox "allow-scripts allow-same-origin", frameImperative.registered true,
                             toolsAddedCount 2
```

3. The cited section exists and says exactly this. Re-opened `https://webmachinelearning.github.io/webmcp/` this
   session (access 2026-10-20; page states “Draft Community Group Report, 20 October 2026”, `meta-revision:
   51ed75653aaa7f174f8dbe05d1bc327359bbc57c`):

   - §4.4 Permissions policy integration: “Access to the APIs in this specification is gated behind the
     policy-controlled feature "tools", which has a default allowlist of 'self'.” (21 words)
   - §4.2 `registerTool(tool, options)` step 4: “If tool owner is not allowed to use the "tools" feature, then
     return a promise rejected with a "NotAllowedError" DOMException.” (20 words) — this is the **only**
     `NotAllowedError` rejection path in `registerTool` (steps 3/13 reject `InvalidStateError`; 8/9/10/14
     `InvalidStateError`; 12 rethrows), so `errorName === 'NotAllowedError'` identifies the cause uniquely.

4. Pre-declared in-repo before the harness: `.ufo/waves/round-16/w1/CriticC2.md:79` (N3) already requires
   “opaque sandboxed iframe: `registerTool` rejects `NotAllowedError` with the exact message … and 0 events”.

Finding F3 (below) qualifies the strength of the red leg only.

## A2 — pass is not vacuous on this build; one reachable vacuous branch (F1)

Pass predicate, `scripts/webmcp-loopback-round16.mjs:1232-1236`:

```js
const pass =
  report !== null &&
  !report.timeout &&
  (report.mcType !== 'object' || (report.settled !== 'resolved' && report.errorName === 'NotAllowedError')) &&
  sandboxedAdded.length === 0;
```

Three mutation runs (copies in `/tmp/w2-opaque-BiibfJ/scripts/`; lane fixtures passed via `--fixtures`):

**M1 — counterfactual, `sandbox="allow-scripts"` → `"allow-scripts allow-same-origin"`** (`origin.mjs`):

```
$ cd /tmp/w2-opaque-BiibfJ && node scripts/origin.mjs \
    --fixtures /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-16/webmcp/fixtures \
    --out /tmp/w2-opaque-BiibfJ/out-origin.json --force
WEBMCP_CASE id=opaque-sandboxed-iframe status=fail
WEBMCP_LOOPBACK verdict=fail cases=11 passed=10 failed=1 missing=0 out=/tmp/w2-opaque-BiibfJ/out-origin.json

detail: report={"mcType":"object","regType":"function","error":null,"errorName":null,"settled":"resolved"} sandboxedAdded=1
actual.toolsAddedDelta[0]: {"name":"sandboxed-tool","frameId":"F44E707B11EC5179B153FDE950FC398E", ...}, event atMs 19
```

Only the sandbox token changed; the case flips to fail. This also proves the CDP delta clause (`sandboxedAdded
length === 0`) is not structurally vacuous: a subframe tool **is** captured with its `frameId`, 19 ms after
registration, well inside the 1000 ms wait at `:1229`.

**M2 — registration never attempted** (`noattempt.mjs`: the body becomes `post(); return;` before `registerTool`):

```
$ node scripts/noattempt.mjs --fixtures <lane fixtures> --out /tmp/w2-opaque-BiibfJ/out-noattempt.json --force
WEBMCP_CASE id=opaque-sandboxed-iframe status=fail
detail: report={"mcType":"object","regType":"function","error":null,"errorName":null,"settled":null} sandboxedAdded=0
```

Status=pass therefore requires the actual `NotAllowedError` rejection, not merely “no tool was added”.

**M3 — WebMCP flags removed** (`flags.mjs`: `const WEBMCP_FEATURE_ARGS = []`) — the vacuity hole:

```
$ node scripts/flags.mjs --fixtures <lane fixtures> --out /tmp/w2-opaque-BiibfJ/out-flags.json --force
WEBMCP_CASE id=declarative-form-tool status=fail
...
WEBMCP_CASE id=opaque-sandboxed-iframe status=pass
WEBMCP_LOOPBACK verdict=fail cases=11 passed=3 failed=8 missing=0 out=/tmp/w2-opaque-BiibfJ/out-flags.json

actual.iframeReport: {"mcType":"undefined","regType":"undefined","error":null,"errorName":null,"settled":null}
detail: "opaque sandboxed iframe denied: modelContext undefined (no modelContext)"
```

With the API absent (`mcType === 'undefined'`) the first disjunct short-circuits and the case reports **pass** and a
“denied” detail without ever exercising the permissions policy. On b444ca8 this branch is *not* taken — the recorded
`actual` is `mcType:"object", regType:"function", settled:"rejected", errorName:"NotAllowedError"` — so the measured
evidence is the strong branch. But a regression that removes `document.modelContext` only inside opaque contexts
(precisely the `[SecureContext]`-style hypothesis whose *inheritance* the w1 probe establishes, not a spec guarantee)
would pass this case silently. That is F1.

Residual, not a break: the CDP negative window is a single 1000 ms wait (`:1229`) taken after the iframe has already
posted its settled report; there is no settle margin or second sampling of the delta. M1 shows observed event
latency 19 ms and M2 shows the no-rejection case fails, so the window is adequate on this build. The predicate also does not assert the message substring (only `errorName`), but the message is retained
in `actual.error`, and §4.2 step 4 is the only `NotAllowedError` path, so the cause is still identifiable.

## A3 — the fixture does not bind the case (declared, so no false claim)

`plain.html` declares `expectedTools: []`, `actions: {}`, `expectedRemoved: []`; the fixtures README row for
`plain.html` says only “No `toolsAdded`/`toolsRemoved`; `document.modelContext` present; `getTools()` → `[]`”.
Neither declares the sandbox behavior. The stimulus is the inline `srcdoc` at `:1213-1226`; the expectation is the
literal at `:1238-1243`, with `expectedProvenance` honestly saying “harness-specified”.

**M4 — emptied fixture** (`plain.html` replaced by a 121-byte page with no `__webmcpFixture`, served via `--fixtures`):

```
$ node scripts/h.mjs --fixtures /tmp/w2-fx-3092 --out /tmp/w2-opaque-BiibfJ/out-emptyfix.json --force
WEBMCP_CASE id=opaque-sandboxed-iframe status=pass
WEBMCP_LOOPBACK verdict=pass cases=11 passed=11 failed=0 missing=0 out=/tmp/w2-opaque-BiibfJ/out-emptyfix.json

detail: "opaque sandboxed iframe denied: NotAllowedError (NotAllowedError: Access to the feature \"tools\" is disallowed by permissions policy.)"
fixtureSha256: 75037230a37ea2a06bafa7581e41c75181670294fba683b48a1ffcf4685804ae  (the mutated file)
```

The case still passes unchanged: the fixture is a host page only. F2 records the two traceability consequences.

## A4 — reproduction at b444ca8

```
$ cd /home/vgpnk/Projects/shokunin/tabi-shokunin && node scripts/webmcp-loopback-round16.mjs --out /tmp/w2-opaque-sandboxed-iframe.json
WEBMCP_CASE id=opaque-sandboxed-iframe status=pass
WEBMCP_LOOPBACK verdict=pass cases=11 passed=11 failed=0 missing=0 out=/tmp/w2-opaque-sandboxed-iframe.json
EXIT=0   (real 0m8.5s)
```

Fresh case object equals the committed one except `durationMs`:

```
$ node -e '... strip durationMs, JSON compare committed vs fresh ...'
identical_except_duration: true
```

Producer identity: `sha256sum scripts/webmcp-loopback-round16.mjs` = `git show 8f7feb3:... | sha256sum` =
`git show b444ca8:... | sha256sum` = `961874e4…8e2be1`, which equals `receipt.producerSha256`. Runtime identity is unchanged: Chromium
`Chrome/154.0.8037.97`, sha256 `eaed39c3…a172b`, matching `receipt.runtime.observed.chromium`.

## Findings

| id | severity | finding | evidence |
|---|---|---|---|
| F1 | **medium** | `pass`'s first disjunct `report.mcType !== 'object'` accepts API absence as “denied”. Demonstrated: flags-off run reports `status=pass` with `detail "… modelContext undefined (no modelContext)"` while 8 sibling cases fail. On b444ca8 the strong branch is taken, so the recorded case is sound, but `status` alone cannot distinguish it. Harden to `mcType === 'object' && regType === 'function' && settled !== 'resolved' && errorName === 'NotAllowedError'` (or a distinct `skipped_api_absent` status), and optionally assert the message contains `"tools"`/`permissions policy`. | `scripts/webmcp-loopback-round16.mjs:1232-1236`; M3 output |
| F2 | low | The fixture does not bind the stimulus or expectation. Emptied `plain.html` still passes (M4). The receipt's `fixture` string is a hard-coded lane-relative path (`:1345-1351`) even when `--fixtures` points elsewhere; the recorded sha is live (M4: `750372…` while `fixture` still reads `corpus/.../plain.html`), so a changed fixture is detectable but the path string is not the source. QUALITY 17's “complete case-input manifest” is partial: fixture sha + producer sha are recorded, but the two named oracle inputs (S020 §4.4 revision/text; probe json `97c377…`) are cited by name only, not digested in the case record. | `fixtures/plain.html`; `fixtures/README.md` plain row; `:1345-1356`; M4 |
| F3 | medium (provenance) | The first-run producer `cedccdf9…` is retained nowhere: only `8f7feb3` ever touched the harness (`git log --all --oneline -- scripts/webmcp-loopback-round16.mjs`), both commit and HEAD blobs hash `961874e4…`, stash empty, and no `.mjs`/`.js` file in the lane hashes `cedccdf9…`. The 8/11 red receipt is therefore reproducible only as JSON, not as a producer. This weakens, but does not break, A1: the identical `expected`/`expectedProvenance` in that receipt is still temporal evidence, and the expectation is a literal in the committed producer. | `receipt-first-run-failed.json` `producer.sha256`; `git log --all`; hash sweep over 138 lane `.mjs`/`.js` files |
| F4 | info (not mine to close) | Citation pin drift: `corpus/SOURCES.md:34` pins S020 as “CG-DRAFT 2026-10-16, revision f14762e6”; the live page this session reports “20 October 2026”, `meta-revision: 51ed7565…`. §4.4 and the `registerTool` step are unchanged, so the case's citation still holds. Belongs to `TabiR16.ReopenS020`. | live fetch vs `SOURCES.md:34` |

## Residual risk / gaps

- The harness case set has **no same-origin sandboxed-iframes control**; the paired control exists only in
  `probes/WebmcpProbeSecure.json`. My M1 supplies the counterfactual ad hoc, but a reader of the receipt alone cannot
  see that the case discriminates. Adding the pair (opaque vs `allow-same-origin`) as two case ids would close
  QUALITY 17's “retain … a positive control” clause inside the receipt.
- Negative CDP observation is a fixed 1000 ms window with no settle protocol; adequate here (19 ms observed), but
  event-latency regressions would be read as “0 tools”.
- `toolsAdded` filtering by the literal name `sandboxed-tool` (`:1231`) would miss an announcement under a renamed
  tool; the `settled === 'resolved'` clause still fails that scenario, so no hole on this path.

## Lane state

No lane files were modified by this seat. `git status --porcelain` during the session showed no modified tracked
files; the untracked `.ufo/waves/round-16/w2/` and `corpus/evidence/round-16/measurement-binding.json` are peer
artifacts (the latter appeared during the session, not from any command here). All receipts and mutated producers
live under `/tmp/w2-opaque-BiibfJ/` and `/tmp/w2-fx-3092/`. No tools installed or upgraded.
