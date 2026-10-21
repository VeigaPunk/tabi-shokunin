# ReviewSkillMirror — round-21 active SKILL rules

## Findings, by severity

### P2 — Active decision table misclassifies `auto-invalid` as an initial fill refusal

**Concrete attack:** compare the active SKILL table's `auto-invalid` classification with its correlated raw invocation, response, and page state; contrast it with the separate `na-invalid-submit` case.

- Active guidance at `SKILL.md:2378` pairs “Required field emptied / autosubmit invalid email” and instructs readers to “Distinguish later native-submit validation from initial fill refusal.” This frames `auto-invalid` as the initial-fill-refusal side of that contrast.
- The current fixture is explicitly autosubmitting with a required `type="email"` field (`corpus/evidence/round-21/runtime/auto-invalid.html:2-3`). In its raw trail, `auto-invalid.json:158-179`, `toolInvoked` carries `{"q":"not-an-email"}` at seq 11 and the matching `toolResponded` is `Error` with native email constraint text at seq 12. The pre-action observation follows at seq 13 and still reads `value: "not-an-email"`, with `submits: []` (`:181-196`); the `action: none` marker is later at seq 14 (`:199-209`). The invalid value was therefore filled and retained; this is not a refusal before filling.
- The receipt independently preserves the same ordering and state: the `auto-invalid` row has `autosubmit: true`, a matching Error already in its pre-action window (`responseCount: 1`), `submits: []`, and `pageState.value: "not-an-email"` (`receipt.json:637-673`).
- By contrast, `na-invalid-submit` begins with a filled valid nonce and no response; its `invalidRequestSubmit` action starts at seq 13, completes at seq 14, and only then produces the native required-field validation Error at seq 15 (`na-invalid-submit.json:168-205`; receipt `:529-564`). The note accurately distinguishes this page-side clearing followed by `requestSubmit` from `auto-invalid`'s malformed email case (`webmcp-nonautosubmit-round-21.md:41-43`), and calls the latter a held-ground negative control, not initial JSON-type validation.

**Effect:** following the active rule can lead a reader to report that Chromium refused the malformed email during fill, although the raw trail shows the value present and the error delivered by the autosubmit validation path before the no-action marker. It obscures the distinction between validation after a page-side mutation and validation after accepting the malformed email into the form.

**Recommendation:** state the two observed conditions directly: `na-invalid-submit` clears a required field after the tool filled it, then calls `requestSubmit`; `auto-invalid` retains `not-an-email` in the required email field and receives a native validation error on the autosubmit path before any later page action. Do not describe `auto-invalid` as a fill refusal.

## Axes and scope

Axes: factual accuracy of active operator guidance; raw invocation/state correlation; current-run versus historical-evidence separation. I read the current SKILL round-21 block, the round-21 knowledge note, current producer/counter/selftest and fixtures, the canonical receipt and raw case trails, and wave acquisition/history records. The one finding above is in the active `SKILL.md:2363-2398` section. The earlier round-20 wording at `SKILL.md:2255-2269` explicitly labels the superseded table as history and identifies corrected source-scoped guidance; I do not treat that untouched history as an active round-21 rule. `.ufo/waves/round-21/history/index.json:15-24` classifies `runtime-execution-final.json` as historical and `runtime-execution-bounded.json` as the current acquisition; this review used the canonical runtime linked to the bounded run, not archived drafts.

The remaining active round-21 decision rows are consistent with the inspected note and raw evidence: finite pending windows and active state; invocation-ID correlation and the non-human meaning of `isTrusted`/`agentInvoked`; native-submit navigation/output and unavailable old-document submit state; the exact reset/removal cancellation results with no mutation-wide generalization; rejected-promise versus preventDefault-then-throw errors; delayed release ordering; and the autosubmit positive control as held ground. The registry's CLI exit meanings and counter boundaries match the producer/counter code. No second actionable mismatch identified in this scoped SKILL review.

## Residual risk and verification gaps

- The note and SKILL correctly bound observations to the retained Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0 loopback run. This review does not establish other-build behavior, source-to-binary equivalence, real-site behavior, human agency, eventual settlement, repeated-run determinism, or evidence authenticity.
- The language-server interface is unavailable in this environment: reading `xd://lsp` returned “No such tool” and listed no mounted LSP device. Status, references, definition, and diagnostics could not run. I used direct file/data reads and literal `grep` only to locate SKILL references; grep is not semantic proof.
- No builds, tests, linters, formatters, browser runs, production writes, tool installs, or VCS/index mutations were performed. No runtime verification is claimed.

Report: .ufo/waves/round-21/w2/ReviewSkillMirror.md
