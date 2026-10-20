VERDICT: ISSUES

CriticC2 (TabiR17.CriticC2-2), wave 1, read-only. Attacked C2 (coverage 9 + capability
`webmcp-cdp-invocation`, sourced). Lane HEAD = refs/heads/master = 5859243 (`git rev-parse HEAD
refs/heads/master`). No harness/counter/receipt/note/S041 row exists yet (glob: no
`scripts/webmcp-invoke-round17.mjs`, no `corpus/evidence/round-17/**`), so attacks target PLAN.md
§C2 and the dispatched seat contracts (`w1/spec.json` items C2Counter, C2Harness, Src*).
Nothing run against Chromium; the "unrun" checks below have not passed.

## A1 — "invocation is uncovered ground" — verdict: needs-change (framing), ground partly holds

Claim attacked: PLAN.md:24-28 / drafts/scorecard.md:25 "Before 0 grounded: the round-16 receipt
invokes no tool".
Counterexample (committed, digest-bound invocation already exists):
- `git ls-tree -r --name-only HEAD .ufo/waves/round-16/probes/` lists `WebmcpProbeInvoke.json`
  and `.mjs`; both landed in `8f7feb3` (`git log --oneline -1 -- …Invoke.json`).
- JSON `producerSha256` 34bcb776… == `git show HEAD:…/WebmcpProbeInvoke.mjs | sha256sum`.
- JSON :353-375 records `WebMCP.invokeTool{frameId,toolName:"echo",input}` → `invocationId`
  FCE0008E…, `toolInvoked.input` = JSON string, `toolResponded{status:"Completed",output}`;
  :380 `invocationIdMatchesInvokeResult:true`; :392-398 unknown tool → -32602 "Tool not
  found"; :399-408 schema-violating `{}` → Completed "echo:undefined"; :409-415 before enable
  → -32000 "WebMCP domain is not enabled".
- Admitted note already distils it: `webmcp-chromium-loopback-round-16.md:71-73`; SKILL.md:1878
  already governs "May the lane invoke a page tool?" (coverage = surfaces the skill governs,
  AXES.md:12).
So "tool invocation as committed evidence" (README:303) was literally already true in a weak
form; what is absent is an *admitted, counter-checked receipt*. The probe lacks: `runs[]`
pid/argv/gone, real-executable sha (only launcher sha `eaed39c3…`, `.runtime` keys), loopback
`externalRequestCount`, any control, predicates fixed in code (`jq has("runs")` → false etc.).
Genuinely new ground among PLAN's 11 cases: throws/rejects (Error + `errorText`/`exception`),
declarative-form invocation, after-unregister, concurrent ids, iframe frameId, navigation-pending.
Re-observations of r16-probe facts (NOT new): imperative-success, unknown-tool, input-schema-mismatch.
Repair: (1) note + SCORECARD + report state that r16 probe-observed invocation (cite the
probe path and 8f7feb3) and that r17's delta is evidence class probe→admitted receipt plus the
six new sub-surfaces; never write "invocation was unobserved". (2) Before-0 must be stated as
"0 admitted invocation receipts", not "no tool invoked". (3) Note's decision table marks each
row `new r17` vs `r16 probe, re-confirmed`.
Axes: coverage (overcount risk), calibration (false provenance if "first" wording ships).

## A2 — missing InvocationStatus member `Canceled` — verdict: needs-change

Evidence: committed build protocol `corpus/evidence/round-16/webmcp/protocol-domain.json`
InvocationStatus enum = `["Completed","Canceled","Error"]`; `cancelInvocation{invocationId}`
exists; probe :288 `cdpCancelInvocation:true`. PLAN.md:118-122 has no cancel case, so the
note cannot say anything about `Canceled` unless navigation-pending happens to emit it.
Repair: add counter-owned case `invoke-cancel` (pending `execute` awaiting a page-held promise;
`WebMCP.cancelInvocation` → expect `toolResponded.status` per observation, predicate seeded from
SrcBlinkInvoke/SrcPdlInvoke reading), or L1 records an explicit why-not prune.

## A3 — minimum receipt that makes "held" honest — verdict: needs-change (contract gaps)

Strongest counterexample: a receipt whose harness grades itself (`passed:true`) with weak
predicates satisfies every C2Counter condition (spec.json C2Counter §Change: verdict pass,
caseSetOk, ids present+passed, producerSha256, pid/argv/gone, README mention). This is the
r16 "self-certifying counter" mistake class (`corpus/lessons/round-16.md:88`, QUALITY 25) moved
from C1 to C2. Also the C2Counter contract drops r16 counter rigor: no counter-owned
case→fixture map + fixture digests (r16 `measure.mjs:290-305`, wave-2 AttackC2Forge), no
control-substance check (r16 `:308-311`), no `externalRequestCount==0`.
Minimum honest receipt (each must be in raw payloads the counter re-derives, not booleans):
1. Causality chain for `invoke-imperative-success`: a harness-generated runtime nonce appears in
   the `invokeTool` command input, `toolInvoked.input`, the page-side `execute` argument, and
   `toolResponded.output`; one `invocationId` across invokeTool result, toolInvoked, toolResponded.
2. Page-side observation out of band: `execute` hits a loopback server ledger (pattern
   `knowledge/stateful-fixture-evidence.md:28-31`, `/__ledger`) recorded by the harness server,
   not read back over the same CDP socket; ledger count 0 before invoke, 1 after.
3. Ordering: sequence numbers show the invokeTool response precedes toolInvoked (PDL text
   "Response is sent before tool events", protocol-domain.json:241).
4. Negative paths show `execute` NOT called (ledger unchanged) for unknown-tool and
   after-unregister.
5. Discriminating control: flags-off alone degenerates to "no tool registered" = same error as
   unknown-tool (probe :392-398), so it proves nothing about invocation. Pair it with
   `--disable-features=DevToolsWebMCPSupport` (r16 note :58: method absent) and invoke-before-
   enable (-32000) as the controls that distinguish the domain from the tool.
6. `invoke-input-schema-mismatch` predicate seeded from observation (probe :399-408: Chromium
   does NOT validate against inputSchema; Completed "echo:undefined"), never a guessed rejection
   (repeat of r16 correction 1, note :105-111).
7. Runs: real pid via /proc by unique profile, argv, gone, realExecutableSha256, fixture digests.
Repair to C2Counter (owner C2Counter): add counter-owned CASE_FIXTURES + fixture-digest check;
re-derive items 1, 4, 5 from raw payloads; require `loopback.externalRequestCount===0`; add
negative probe "nonce mismatch between toolInvoked.input and page ledger → 0".

## A4 — capability admission bar (AXES.md:57-64; prompt §6) — verdict: holds with conditions

Holds: actuation (invoke) is a different "what it can now do" than `webmcp-cdp-observation`
(SCORECARD.md:766), and AXES.md:62-64 only needs an in-round passing demonstration.
Conditions / counterexamples:
- First-working round: the probe demonstrates invocation running in round 16 (A1). A row
  "first-working round17" with no qualifier is false provenance. Repair: row text
  "round17 (receipt); probe-only invocation r16 `.ufo/waves/round-16/probes/WebmcpProbeInvoke.json`".
- Scope: drafts/scorecard.md:38 must keep "loopback fixture tools only; never external sites
  without operator approval" (SKILL.md:1878) and "harness-driven CDP, not agent-side consumption"
  (README:302 keeps agent-side open; note :128).
- Tradeoff for the judge (not fixable here): two consecutive capability rows on one WebMCP/CDP
  surface; r17 is window position 1 (drafts/scorecard.md:11) so no nudge benefit is taken now,
  but splitting one surface into observe/invoke rows must not be used to reset the window later.
- Adjacency: the integrator ruling says tabi owns page "observation"
  (round-16-verifier-spotcheck.md:141); invocation is actuation. No sibling PROVINCE claims it
  (grep webmcp/invoke over kaidoku/kumitate/kake/kagi PROVINCE → only kaidoku:53 CDP row), but
  note :137 names kumitate for the agent-side MCP plane. Repair: the note states invocation is
  covered as tabi browser/CDP craft under the ruling's "WebMCP page-tool surface" clause, and
  C3 records it (ruled, citing :141) so the extension is not silent.

## A5 — sourced-claim rule (prompt tabi-round-17.md:73-74: rests on a row opened THIS round)

A5a — counter date filter admits round-16 rows — verdict: FAILS.
Evidence: C2Counter contract uses "opened ≥2026-10-20 and kind != own-work". At HEAD, awk over
`git show HEAD:corpus/SOURCES.md` (mined, A/B, non-own-work, opened≥2026-10-20) prints 8 rows:
S030 S031 S032 S033 S034 S035 S036 S037. Round 16 and 17 share the date 2026-10-20 (PLAN.md:6).
A note citing only S035 + its used-by append scores 1 with zero rows opened this round.
Repair: the qualifying row's id must be absent from `git show 5859243:corpus/SOURCES.md` (or
numeric id ≥41), AND that SAME row must be non-own-work, tier A/B, mined, used-by note — not
"some row new" + "some row external" satisfied by different rows (contract wording is ambiguous).
Add negative probe: note citing only S035 (used-by patched) → 0.

A5b — decorative citation — verdict: needs-change.
The counter cannot see whether the S041+ row grounds the invocation claim. SrcPdlInvoke's 154-tag
PDL adds little over committed `protocol-domain.json` (the 154 build's own /json/protocol, which
S035 already names as build authority, SOURCES.md:49). Rows that can actually ground claims the
receipt cannot: SrcBlinkInvoke (154-tag status mapping for throw/reject/cancel/navigation),
SrcDevtoolsInvoke. Repair (L1 gate): the cited S041+ row's `scope`/`teaches` names invocation;
the note body cites it in the decision-table row it grounds (not header only); the lesson Gate
quote is invocation text; where source and receipt disagree the receipt wins and the row records
the divergence (QUALITY 23: spec citations back spec text only — S020 never cited for CDP).

A5c — own-work circularity — verdict: holds if A5a repair lands.
An own-work S041 pointing at the r17 receipt is "opened this round" but circular; the existing
non-own-work requirement blocks it only when bound to the same new row (A5a).

## A6 — pointer drift (known) — verdict: needs-change, trivial

PLAN.md:25 cites README:308-309; phrase is at README:303 (also reported by DraftScorecard :15,
DraftReadme :10, DraftSourcesLog :12). Fix at integration.

## Smallest safe correction set (ordered)

1. C2Counter: new-row test by baseline absence on the same external row; CASE_FIXTURES + digests;
   raw-payload re-derivation (nonce chain, invocationId, ledger) ; externalRequestCount 0;
   probes for S035-only citation and nonce mismatch.
2. C2Harness: runtime nonce + server ledger; seq numbers; domain-disabled and before-enable
   controls; schema-mismatch predicate from probe :399-408; add or prune-with-reason `invoke-cancel`.
3. Note/SCORECARD/LOG wording: r16 probe acknowledged; delta = evidence class + named new
   sub-surfaces; capability first-working qualified; agent-side stays open.
4. C3 row for invocation under ruling :141.

## Addendum — re-check of measure-c2.mjs sha256 f1479a58… (after C2Counter reply)

- A5a: holds now. The same-row frontier test is at `measure-c2.mjs:195-204`. "New" comes from
  the 5859243 id set (`:356-361`), not the date, and probe `cited_row_preexisting` (`:333`) must
  score 0. I did not re-run the sandbox S035-only proof C2Counter reported; that remains unrun here.
- A3 now partly fixed: fixture digest (`:242-255`), `externalRequestCount===0` and the
  real-executable sha (`:227-231`). Two gaps remain for wave 2:
  (i) The binding does not tie a case to a specific fixture. All 11 cases can cite one trivial
  committed fixture, which reopens r16 AttackC2Forge (r16 `measure.mjs:290-294`). Repair:
  a counter-owned case→fixture map once the harness names its fixtures.
  (ii) No check on what the controls actually show (r16 `:308-311`). Repair:
  invoke-flags-off-control has no `toolResponded` with status Completed, and
  invoke-imperative-success has one.
  The raw-payload nonce/ledger re-derivation is deferred until the harness schema exists.
  Accepted as wave-2 work; until it lands, C2 `held` rests on the harness's own grading.
- Re-check at sha256 41f51d5f… (`sha256sum` matches C2Counter's reported hash; sandbox runs not
  re-run here). Gap (i) is reduced: imperative, declarative and iframe must name different
  fixtures and different bytes (`:93`, `:288-294`); the full map is still owed. Gap (ii) is
  closed: the event walk (`:182-192`) requires a Completed `toolResponded` in the positive case
  and none in the control (`:298-307`), with probes `control_shows_completed` and
  `positive_not_completed` (`:404-412`). Remaining weakness: the control passes when it records
  no events at all, so an empty control is vacuous. Wave-2 repair: the control must also carry the
  raw CDP error response to its `WebMCP.invokeTool` (standard `{id,error:{code,message}}` shape).

Impacted axes: coverage (count honesty), calibration (provenance/first-working), operability
(counter rigor), adjacency (actuation vs observation ruling). No harm found to byte-frozen
surfaces (nothing written outside this report).

Tooling: none installed or updated.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/w1/CriticC2.md
