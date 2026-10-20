# Round 16 — measurement binding and native WebMCP on Chromium 154

Steered round 16, attempt 1, 2026-10-20 (hyaku phase 2). Baseline
`e38d2599a922cb729186353830fff8e159b4fef0`, clean lane. Measured revision
`3254740c694e4fc7851ca9d88b39230db3042ba6`. C1 operability 8 (lowest
non-retired tie with depth/freshness/adjacency): enforced measurement-binding
contracts 0→1. C2 coverage 9 + capability `webmcp-cdp-observation`, sourced:
native-WebMCP held entries 0→1. No exploratory claim; no scalar moves. Round 16
is position 3 of the stagnation window since the round-13 capability; C1 meets
the lowest-axis rule either way, and C2's capability restarts the window.

## Gate

Author-side admission criteria (not a claim that an unrun check passed):

- admit C1 only if `node .ufo/waves/round-16/measure.mjs REV --claim C1` counts 1 at
  the measured revision and 0 at baseline, where 1 requires the revision's own selftest
  (59 cases, every vocabulary reason exercised) to pass, the same selftest to go red
  against a counter-owned always-clean stub gate, and `--legacy` on the real round-15
  file to give the exact finding sets under three counter-made variations; and only if
  `--check corpus/evidence/round-16/measurement-binding.json --at <delivered HEAD>
  --reproduce` exits 0 with both claims bound.
- admit C2 only if the receipt at the measured revision is the committed harness's
  output (producer digest), 11/11 cases pass with the counter-owned case→fixture map and
  fixture digests, the flag-off control has a real browser pid/argv with no WebMCP
  switch, the note cites only mined A/B rows with the note in used-by, and the README map
  row exists.
- rejected: coverage 9→10 and operability 8→9 (one build, loopback only; USER 6/10 still
  red; r12/r13 precedent; wave-2 CriticScalarsW2); "available in Chrome" or unflagged
  claims; tool invocation as committed evidence; confinement beyond page-level
  HTTP(S)/beacon/page-WebSocket; `--legacy` completeness (`counted_input_changed` and
  ancestry are evaluated only by `--check`, wave-2 AttackC1Legacy); any lane-dispatched
  seat as non-author verification. SHONEN stays four `[~]`.

### Rows opened this round (access date 2026-10-20; quotes ≤25 words)

| Row | URL | Located quote | Location / identity |
|---|---|---|---|
| S020 (re-open) | https://webmachinelearning.github.io/webmcp/ | "It is not a W3C Standard nor is it on the W3C Standards Track." | §Status, raw HTML line 878; L1 fetch sha256 `180c55ba…0d1a`, meta revision `cb3d1696…` |
| S030 | https://github.com/webmachinelearning/webmcp/blob/main/README.md | "but it is not part of the specification at this time." | README.md:319 at `cb3d1696` |
| S031 | https://github.com/webmachinelearning/webmcp/blob/main/declarative-api-explainer.md | "Chromium is implementing a loose version of this and will conduct testing/trials" | lines 114-115, sha256 `4587c9f2…bd28` |
| S032 | https://developer.chrome.com/docs/ai/webmcp | "Open Chrome and navigate to chrome://flags/#enable-webmcp-testing" | §Local WebMCP step 1; page last updated 2026-10-07 |
| S033 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context_supplement.idl | "[SecureContext, SameObject] readonly attribute ModelContext modelContext;" | line 11; L1 fetch sha256 `50dd337d…6364` |
| S034 | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/platform/runtime_enabled_features.json5 | `implied_by: [ "WebMCPDeclarativeFileInput", "WebMCPFormAssociatedCustomElements", "WebMCPTesting" ], status: "experimental",` | lines 7030-7035; L1 fetch sha256 `99b92e67…1d2b` |
| S035 | https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl | "Enabling the domain will trigger a toolsAdded event for all currently registered tools." | lines 53-54, sha256 `f386bcfd…f99f` |
| S036 | https://github.com/ChromeDevTools/devtools-frontend/blob/66df492aaa0129d090937e933dd44c5389ab24d2/front_end/models/web_mcp/WebMCPModel.ts | "if (executionContext.isDefault && executionContext.frameId) {" | line 194; L1 fetch sha256 `c23d575e…b632`; 154 DEPS line 424 pins the commit |
| S037 | https://modelcontextprotocol.io/specification/2026-07-28/server/tools | "JSON Schema defining expected parameters" | tools.md line 290, sha256 `09be49a0…25c3` |
| S038 | https://github.com/Sgr57/webmcp-fork/blob/main/e2e/web-standards-showcase/CHROMIUM_FLAGS.md | "console.log('modelContext available:', !!navigator.modelContext);" | line 140, sha256 `351c02db…` |
| S039, S040 | https://bug0.com/blog/webmcp-chrome-146-guide | "The API lives at navigator.modelContext." | §How it actually works para 1; published 2026-02-11 |
| S021 (re-open, unchanged) | https://developer.chrome.com/docs/devtools/agents | "With Chrome DevTools for agents, your AI agent can interact with the Chrome browser to test code, emulate users, and catch bugs" | lead paragraph; JSON-LD dateModified 2026-03-22; 0 WebMCP mentions |

Per-seat fetch commands, raw digests and second-seat re-opens:
`.ufo/waves/round-16/w1/Src*.md`, `.ufo/waves/round-16/drafts/DraftSources.md` §B/§C
(its S0xx keys predate the final numbering: its "S034"/"S036" are not the registry's),
`.ufo/waves/round-16/w2/ReopenS0*.md`.

### Registry transitions (old→new, in-place cells only)

- S020: status queued→mined; used-by —→`corpus/knowledge/webmcp-chromium-loopback-round-16.md`;
  anchor, opened (2026-10-19) and recheck unchanged. The anchor names revision `f14762e6`;
  the page read this round was `cb3d1696` (diff: one added Editor line) and wave 2 saw a
  later editor-only `51ed7565`. Quotes hold at all three.
- S037: added queued in commit `8f7feb3`, then queued→mined and used-by —→ the note in
  `3254740` once the note body cited it.
- S039: unchanged in place; superseded by S040 (append-only) because the dated post was
  correct on 2026-02-11 (spec and Chrome 146 then had a Navigator partial; spec commit
  `c7b5c70`, 2026-05-27, moved it) — wave-2 ReopenS039.
- S021: re-opened, queued→queued, used-by —→—; its anchor "no revision marker" is imprecise
  (dateModified 2026-03-22); left for a later supersedes row, not needed by any claim.
- Fastly "149 through 156" rejection (drafted in wave 1) was withdrawn before admission:
  chromestatus gives origin trial 149→156, extended to 162 on 2026-09-28.

### Census

Start (`.ufo/waves/round-16/PLAN.md:5`):
`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi`
→ exit 0, `tabi	ok	…/corpus/SOURCES.md`; `census` → rows 29, A23/B4/C2, mined24/queued3/rejected2.
End (same commands, after `3254740`): exit 0 `ok`; rows 40, A31/B4/C5, mined33/queued2/rejected5.
Added by tier: A8 (S030–S037), C3 (S038–S040). Knowledge notes 32→33.

## Mistakes

| Class | Evidence pointer | Captured-by | Fix / shown able to fail |
|---|---|---|---|
| identity-drift — counter pinned only by revision | `corpus/lessons/round-15-verifier-spotcheck.md:120`; `corpus/evidence/round-16/binding/r15-counter-identity.json` | none (no binding rule existed) | `scripts/check-measurement-binding.mjs` + QUALITY 22; fails on real history: `binding/legacy-r15.json` exit 1, C1 `counter_digest_unrecorded`/`counter_changed_since_measurement`, C2 `counter_digest_mismatch` |
| measured ≠ delivered HEAD | spot-check `:121`; the r15 counter itself changed b7cf044→36240c7 | none | manifest `corpus/evidence/round-16/measurement-binding.json` + `--check --reproduce` at the delivered HEAD; a wave-2 clone showed a later SOURCES edit flips it to `counted_input_changed` (`.ufo/waves/round-16/w2/CriticTrendsW2.md`) |
| stale-premise — hypothesised API path recorded with a negative gloss | `corpus/knowledge/browser-surface-census.md:188`; `corpus/README.md:181` ("not `navigator.modelContext`") | QUALITY 14 only partly; QUALITY 23 alone would not catch it (`w2/AttackQuality23.md`) | QUALITY 23 + 24; receipt `model-context-location` now requires a real `[object ModelContext]` (fails for `null`/`{}`, `w2/CaseModelContextLocation.md`) |
| self-certifying counter — C1 counter trusted the revision's printed selftest output | `w2/AttackC1Liar.md` (3 liar commits counted 1) | none | stub-gate probe + three legacy variations; `corpus/evidence/round-16/measure/c1-liar-probes.json`: all three liars count 0, honest revision 1; QUALITY 25 |
| vacuous proofs — page-target `SystemInfo` always failed (pid null), argv filter matched the profile path, sandbox case passed when the API was absent | `w2/CaseFlagsOffNegativeControl.md`, `AttackReceiptClosure.md`, `CaseOpaqueSandboxedIframe.md` | QUALITY 17/18 (should have) | harness repairs in `3254740`; receipt runs now carry real pid/argv/exe; null pid fails closure |
| surviving gate mutants | `w2/Mut*.md` (unresolved input, worktree-differs, constant/string counter, schema-name, basename argv, dash ref) | the selftest | 16 new selftest cases (59 total); L1 re-killed two mutants (`if (false && !worktreeOk)`, ancestry+dash disabled) |
| consumer bug — C2 counter read a display label as a path | `corpus/evidence/round-16/measure/count-after-c2-first-counter-defect.json` (count 0 at `8f7feb3`) | none | counter uses `fixtureFile`; the failing count is retained |
| plan defect — "unrecorded for both r15 claims" | `.ufo/waves/round-16/PLAN.md` §C1; six wave-1 seats (e.g. `w1/ConnFleetBinding.md`) | wave-1 review | one identity predicate in `--legacy`; selftest `legacy_r15_shape_digest_mismatch` |
| expectation guessed before oracle; pre-commit producer not retained | `receipt-first-run-failed.json` (producer `cedccdf9…` in no commit) | QUALITY 17 | repairs named with oracles in the note §Corrections; residual: the 8/11 run is not reproducible |
| over-eager rejection of a dated source | S039 (wave-2 `ReopenS039.md`); drafted Fastly reject | CORPUS rule 1 re-open | S040 supersedes S039; Fastly rejection withdrawn |

Operational record (not a lane-content mistake): six wave-1 executor seats died on the
m_swe free-tier rate limit (BindCore, MeasureCounters, WebmcpHarness, WebmcpProbeDeclarative,
WebmcpProbeLifecycle, WebmcpProbeFrames; `w2/ScoutDeadSeats.md`); their partial files were
integrated by L1 and MeasureCounters' unrunnable draft is kept as
`.ufo/waves/round-16/measure.seat-draft-unrunnable.mjs`. Misroot sweep: `git -C
/home/vgpnk/Projects/shokunin status --porcelain` showed only `.ufo/state/*`, the watchdog log
and orchestrator `scripts/hyaku/jj-lane*.sh.new` files — none tabi's (`w2/ScoutMisroot.md`).

## Routed defect disposition (round-15 outside spot-check :118-124)

1. Counter identity: closed by C1 (gate, manifest, counter digest per claim).
2. Measured vs delivered: closed by the manifest's `--check --reproduce` at the delivered HEAD.
3. Erratum adoption: SKILL round-16 section points at the erratum (`:90-101`).
4. Frozen step-1/step-4 closure-checker certification: protocol/operator debt, carried.
5. USER 6/10, r07 survivor replay, user-record freezing, IPv6, Git env/hooks/config/PATH,
   external-validator pin: carried unchanged.

## Adjacency

kaidoku's Core "Runtime observation (CDP)" row overlaps the C2 harness surface; reported as
contested scope for an integrator ruling (note §Adjacency), not absorbed.
