VERDICT: PASS

## Findings

**Anchor.** `webmachinelearning/webmcp` main = `51ed75653aaa7f174f8dbe05d1bc327359bbc57c`
(2026-10-20T10:57:14-04:00, `#334`); `git ls-remote` HEAD and `refs/heads/main` both that SHA.
One commit after r16's `cb3d1696`. GitHub compare: `ahead_by=1`, files `[index.bs +55 -0]` — only
`index.bs` moved; README/declarative/continuations/questionnaire are byte-identical to r16's commit
(raw sha256 equal). Row novelty is scope, not revision.

**Target's `docs/` paths do not exist.** `docs/` holds exactly one file; contents API at the commit
returns `['service-workers.md']`. Codes at 51ed7565: docs/proposal.md 404, docs/security-privacy.md
404, docs/security-privacy-questionnaire.md 404, docs/README.md 404, docs/index.md 404,
docs/service-workers.md 200. The security-privacy questionnaire is at repo root (200).

**What it teaches (C2).** Call = agent → browser → page: browser mediates, invokes `execute` with
schema-shaped args, callback return is the response (README.md:308-313); `executeTool(tool,args,{signal})`
runs in the owner's execution context (README.md:375). Declarative proposal adds
`SubmitEvent.agentInvoked` + `respondWith(Promise<any>)`, which suppresses navigation and requires
`preventDefault()` first (declarative-api-explainer.md:157-171) — and declarative is "not part of the
specification at this time" (README.md:319). Limits: no `toolautosubmit` ⇒ no submission
(declarative:49-53); response path for navigating forms "currently under debate" (declarative:119);
navigation ends the call with no success signal (continuations:15-20); abandoned on disconnect, "not
yet spec'd" (questionnaire:93-100); annotations may skip confirmation (questionnaire:63).

**Decisive separation for the C2 decision table.** `grep -rn
'invokeTool\|CDP\|DevTools\|invocationId\|toolInvoked\|toolResponded' --include='*.md' .` → 0 hits at
51ed7565. This source grounds *semantics* only; `WebMCP.invokeTool` / `toolInvoked` / `toolResponded`
shapes must cite S035 (WebMCP.pdl).

**C1: no support.** Nothing here touches jj/git revision anchoring; do not count this row toward C1.

**No contradiction with S030 / S031 / the round-16 note.** README:319 and
declarative:108-115 are unchanged, so both anchors still resolve exactly; scopes are disjoint
(S030 = what is spec vs explored; S031 = schema synthesis; this = response/invocation semantics).
The r16 note's "No tool is invoked in the receipt" stands — this source names no CDP command.
Minor: `.ufo/waves/round-16/w1/SrcExplainer.md:17` ("toolactivated … not in the explainer") vs `:224`
(cites declarative:175-178) is the same file's README-vs-declarative wording, not byte drift.

**Caution for the harness.** `invoke-navigation-pending` must predicate "pending → terminated/
abandoned, no success output" (continuations:18-19, questionnaire:100), not "a response arrives after
navigation" (declarative:119 leaves that under debate). `invoke-input-schema-mismatch` must not assume
browser-side rejection (README:523) — validation is modelled in `execute` (README:456-458).
`invoke-unknown-tool` has no sourced invocation-side error vocabulary (questionnaire:102-104).

**Deliverable produced.** Draft row with 13 pipe fields (`awk NF=13`, malformed 0; id `S0??` because
the L1 assigns — first free is S041) plus Gate entry with URLs, 2026-10-20 access, quote+location and
shas for all four files, in `.ufo/waves/round-17/sources/ExplainerExec.md`. Status drafted `queued`
with the exact integration transition `queued→mined` / `—→corpus/knowledge/webmcp-invocation-round-17.md`
so the mined-used-by census stays clean until the note exists.

**Tooling.** None installed or upgraded; no pacman transaction attempted. Temp clone
`/tmp/wmcp-explain/webmcp` and raw copies `/tmp/rawfetch` removed.

Files written:
- .ufo/waves/round-17/sources/ExplainerExec.md
- .ufo/waves/round-17/w1/SrcExplainerExec.md
