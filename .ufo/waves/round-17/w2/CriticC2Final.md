VERDICT: ISSUES

Attacked: C2 as landed at M=6c97851 — (a) honesty of "held WebMCP-invocation entries 0→1" given the
round-16 probe already invoked a tool; (b) capability `webmcp-cdp-invocation` admission bar (in-round
demonstration, scope words); (c) coverage scalar must stay 9 with real-site / agent-side / Chromium 152 /
unflagged open; (d) sourced-claim rule (rests on rows opened this round). Inputs: note
`corpus/knowledge/webmcp-invocation-round-17.md`, receipt, README append, SOURCES S041–S053,
`drafts/scorecard.md`, `w1/CriticC2.md`. Sandbox `/tmp/tabi-r17w2-CriticC2Final-s91S` (clone, detached M).

## Commands run (sandbox)
- `node .ufo/waves/round-17/measure-c2.mjs 5859243…` → `c2_invocation_held 0`, failures = note/README/receipt
  absent; exit 0. `… 6c97851…` → `held 1`, `failures []`, cited S041–S048, `fixtureBoundCases 11`,
  `runs 3`, `probesOk true`, counterAtRevision == counterSelf; exit 0.
- `sha256sum scripts/webmcp-invoke-round17.mjs` = `de62820d…52d7` = receipt `producerSha256`.
- All 7 receipt `.fixtures[].sha256` equal `sha256sum` of the committed fixture files (7× ok).
- Independent re-derivation from raw `cases[].cdp.frames` (not harness booleans): imperative-success
  invokeTool seq8 → resp seq9 iid D30A0421… → toolInvoked seq10 input `"{\"text\":\"success-245555e41b72\"}"`
  → toolResponded seq11 `Completed` `echo:success-245555e41b72`; ledger 1 enter entry, same nonce.
  concurrent-ids: two ids, both sends (seq8,9) before responses, each paired. iframe: child frame
  `Completed`, main frame `-32602`. flags-off/unknown-tool: `-32602`, no events. All consistent.
- `scripts/sources-census.sh validate --root … tabi` → `tabi ok`, exit 0.

## (a) 0→1 honesty — HOLDS as a counted unit, ISSUE in pending wording
- r16 already invoked: `.ufo/waves/round-16/probes/WebmcpProbeInvoke.json` (invokeTool→toolInvoked→
  toolResponded). More: the *admitted* r16 note already states invocation facts —
  `webmcp-chromium-loopback-round-16.md:70-73` ("`WebMCP.invokeTool{frameId, toolName, input}` returns an
  `invocationId`, then `toolInvoked` … `toolResponded` carries `status`/`output`") — and B's SKILL.md:1878
  already governs "May the lane invoke a page tool? | `WebMCP.invokeTool` probe | Loopback fixtures only".
- So "0" is true only for the counter's unit (admitted, counter-checked invocation receipt+note): at B the
  counter scores 0 by absence. The note handles this honestly (`:21-29`: names the probe, delta = probe→
  receipt with run identity + seven sub-behaviours). I checked the "no round-16 artifact holds" seven: grep of
  every r16 probe JSON and the r16 receipt for invokeTool/toolResponded/agentInvoked/cancelInvocation finds
  invocation only in WebmcpProbeInvoke.json (echo success, unknown tool, before-enable, `{}` input); r16
  receipt `:759` "toolInvocation: none". Claim holds.
- ISSUE (pending integration, SCORECARD not yet written at M): `drafts/scorecard.md:25` "Before 0 grounded:
  the round-16 receipt invokes no tool" omits the probe and the admitted note `:70-73`; `:38` first-working
  "round17" unqualified. Wave-1 A1/A4 repairs are not yet applied to these drafts.
  Repair: `:25` → "0 admitted invocation receipts at 5859243; r16 held invocation as probe-only (note
  `:70-73`, probe `WebmcpProbeInvoke.json`)"; capability row first-working → "round17 (receipt); probe-only
  invocation r16".

## (b) capability admission — HOLDS at receipt level; row not yet in table
- In-round demonstration: receipt `generatedAt 2026-10-20T16:49:59Z`, producer = harness blob at M, 3 runs
  with pid/argv/`gone:true`, realExecutableSha256 `95b17db7…`, `externalRequestCount 0`, 11/11 + 4 controls.
  Actuation is distinct from r16 `webmcp-cdp-observation` (SCORECARD.md:766).
- At M the row is absent (SCORECARD.md unchanged B→M); prompt §6 requires it in the same round — L1 must land it.
- Scope words: `drafts/scorecard.md:38` lacks "fixture-owned tools only" and "harness-driven CDP, not
  agent-side consumption" (the note has both: `:77-78`). Repair: add both to the row text.

## (c) coverage stays 9 — HOLDS
- SCORECARD unchanged at M; draft `:16` withholds 10. README append keeps open: real-site, agent-side,
  unflagged/default-profile, Chromium 152; note `:77-78`, `:92` agree. Coverage is surfaces governed
  (AXES.md:12) and invocation was already governed at B (SKILL:1878, note r16 `:70-73`), so C2 is an
  evidence-class + sub-surface move, not a new surface — 9→9 is the only honest scalar.
- The flags-off run is a *negative* unflagged observation (no `document.modelContext`, `-32602`); it must
  not be read as unflagged ground for the open item — the README wording ("any unflagged/default-profile
  claim") already scopes it correctly.

## (d) sourced claim — HOLDS, two ISSUES
- S041–S048: all tier A, mined, opened 2026-10-20, non-own-work, used-by the note, and absent from
  SOURCES at B (counter frontier test `measure-c2.mjs:195-204`). Body grounding spot-checked: S041 "Response is
  sent before tool events" (`w1/SrcPdlInvoke.md:18`, line 68); S042 `model_context.cc:764-773` JSON+is-object
  only (`w1/SrcBlinkInvoke.md:45-57`) matches receipt `invoke-input-schema-mismatch`.
- ISSUE: no `corpus/lessons/round-17.md` at M (`git ls-tree HEAD corpus/lessons/` → none), so CORPUS rule 1
  (`## Gate` URL/date/≤25-word quote per new row) is unmet for S041–S053 at M. Must land before round end.
- ISSUE (low): S045 is cited only in the header and Limits `:96` ("not re-run here") — it grounds no row.
  Mined-by-mention. Repair: cite S045 in spec row `:86` (upstream asserts unregister mid-execution resolves),
  or move it to queued.

## Main defect (fixable, so not BREAKS) — note rows rest on uncommitted probe output (repeats a mined mistake)
Counterexample: three admitted-note statements rest only on round-17 probe output that is not committed:
- `:73` "unregistration does not cancel (round-17 probe `C2ProbeLifecycle`)";
- `:86` spec row "Unregistration mid-call … consistent (probe) | agree";
- `:110-111` "a bare `AbortSignal` as the second argument unregisters nothing (round-17 lifecycle probe)".
Evidence: `.ufo/waves/round-17/probes/` at M holds `invoke-lifecycle.mjs` but no JSON (only
`invoke-concurrency.json`); `w1/C2ProbeLifecycle.md:12-13` says output went to
`/tmp/tabi-r17-c2probe-invoke-lifecycle.json` (scratch). The receipt does not cover it: `invoke-after-unregister`
raw frames show toolResponded seq12 at 56 ms and toolsRemoved seq13 at 106 ms — unregistration *after*
completion, not mid-flight. r16 committed its probe JSONs; r17 does not. This is the exact class the round's
own draft mines (`drafts/lesson-r17.md:76` "evidence rooted only in /tmp") and draft QUALITY 28
(`drafts/quality.md:11`, every evidence pointer resolves as committed bytes).
Axes: calibration (claim stronger than committed evidence), operability (pointer does not resolve from a
fresh clone). Does not affect the counter (it reads only the receipt), so `held 1` stands.
Smallest safe correction (pick one): (1) re-run `invoke-lifecycle.mjs --out
.ufo/waves/round-17/probes/invoke-lifecycle.json`, commit it, and cite path:line in `:73`, `:86`, `:110`;
or (2) add a supplementary control `invoke-unregister-midflight` to the receipt (requires harness change →
new producerSha256 + re-run); or (3) append a correction marking those three statements "[probe,
uncommitted — `w1/C2ProbeLifecycle.md`]" and drop "agree" from `:86`.

## Not a defect (checked)
- Note `:37` "the only disable switch": argv has Playwright's default `--disable-features=…` first and
  `--disable-features=DevToolsWebMCPSupport` last; the note's own parenthesis covers last-wins. Wording
  could say "the last", not "the only" — cosmetic.
- flags-off control vs unknown-tool share `-32602`; discrimination comes from `invoke-domain-disabled`
  (`-32601`, `document.modelContext` object) and `invoke-before-enable` (`-32000`) — wave-1 A3.5 satisfied.
- Counter still shape-only (its own Limits block, `measure-c2.mjs:56-60`); my raw re-derivation found the
  receipt internally consistent, so no forgery observed [INFERENCE: does not exclude a determined forger].

Tooling: none installed or updated. Sandbox removed after the run.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/w2/CriticC2Final.md
