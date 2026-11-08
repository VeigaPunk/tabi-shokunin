# R91Exec4 — proxy capability refusal matrix (v1 wave w1)

Seat: `R91Exec4` (leaf executor, coverage axis). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base `b1d8f07b`.
Mode: **read-only on lane files** — this seat mutated only clones of the scored receipt under its own scratch; no lane file was written except this report and the evidence copies named at the end.

## Instruments used (hashes as they stand on disk, verified at run time)

| instrument | sha256 | matches |
|---|---|---|
| `scripts/check-showpicker-proxy-round91.mjs` (the frozen counter) | `f2f052f27c3a0e18ecef3217fc902c2897c59ab9f175d314ba66d526a7edb03e` | freeze.txt **and** claims.json pin |
| clone of `corpus/evidence/round91/chromium-showpicker-proxy/receipt.json` | `15e2167ea64b638e28fd8d8b3bba3170bd4d48becc2dc27c54039885c39d35c8` | receipt file bytes (receipt bytes are not pinned; driver/fixture/nonce are) |
| `.ufo/waves/round-91/controls/c1/prior-set.txt` | `78ffc632b269a3c27d727432b9a17d2ce7cc1531b85272cd8ed5c3a3e17c2701` | freeze.txt |

The unmodified clone scores `verdict=clean`, `checkCount=30`, `findings=[]`, exit 0 under the frozen counting command. Every mutation below was scored with the identical arguments; only `--receipt` differs.

Observation (not an amendment request): `claims.json` pins `scripts/selftest-r91-gates.mjs` and `scripts/check-record-drift-round91.mjs` at the D1 bytes, while `freeze.txt` and the working tree carry the D2/D3 bytes (`988c18e5…`, `e2e51c6b…`). The counter pin, the one this matrix is scored with, agrees in both files.

## Method

1. `mkdir -p /fast/scratch/hyaku/tabi-r91/R91Exec4`, copy the scored receipt to `receipt.base.json`.
2. `mutate.mjs` deep-clones the base, applies **exactly one leaf** to **exactly one leg**, writes `mutants/<id>.json`, and spawns the frozen counter with the frozen pins.
3. `leaf-audit.mjs` diffs every mutant against the base and asserts the change is exactly one leaf path inside exactly one leg object → **55/55 single-leaf, single-leg**.
4. Refusal = counter exit 1; the counter's `findings[].id` names the check that refused. PASS = exit 0 (`verdict=clean`, `checkCount 30`), i.e. a field the binding does not read.

Exact command (one invocation per mutant; template identical to the frozen counting command):

```
node /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-showpicker-proxy-round91.mjs \
  --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --receipt /fast/scratch/hyaku/tabi-r91/R91Exec4/mutants/<ID>.json \
  --expect-driver-sha256 343eb0f202d9b37a21d948adf0f5eff84fbebf8c195ab99c272fd66580e33015 \
  --expect-nonce tabi-r91-l1-1d073adc0b8d \
  --expect-parent-sha256 a6ecf367adcfd31e3e54e82794db09e2f9845b8d910eb465ab47ca022b778bf0 \
  --expect-same-sha256 01380a98976c3fd8963a907a70f1f14d4d84a7b0eb94d088995919331775fe36 \
  --expect-child-sha256 01380a98976c3fd8963a907a70f1f14d4d84a7b0eb94d088995919331775fe36 \
  --prior-set .ufo/waves/round-91/controls/c1/prior-set.txt --json
```

Driver run: `cd /fast/scratch/hyaku/tabi-r91/R91Exec4 && node mutate.mjs && node leaf-audit.mjs`

Result: **55 mutations — 41 refused, 14 passed.** All mission-listed mutation kinds are covered (each has at least one row).

## Refusal matrix

Leg numbering is 1-based: leg01 `sp91-so-direct-noact`, leg02 `…-parentact`, leg03 `…-childact`, leg04 `sp91-so-proxy-noact`, leg05 `…-childact`, leg06 `so-proxy-date-noact`, leg07 `so-proxy-date-childact`, leg08 `xo-proxy-file-noact`, leg09 `xo-proxy-file-parentact`, leg10 `xo-proxy-file-childact`, leg11 `xo-proxy-file-answer`, leg12 `xo-proxy-date-noact`, leg13 `xo-proxy-date-childact`, leg14 `xo-proxy-color-childact`, leg15 `xo-direct-access`.

| mutation | leaf changed (one leg) | before | after | verdict | check(s) that refuse |
|---|---|---|---|---|---|
| M01-proxy-ok | leg08.proxy.ok | false | true | REFUSE | law, proxy-law, prior-set |
| M02-proxy-name | leg04.proxy.name | "NotAllowedError" | "SecurityError" | REFUSE | law, proxy-law, prior-set |
| M03-proxy-target | leg10.proxy.target | "s" | "dt" | REFUSE | law, proxy-law, prior-set |
| M04-proxy-origin | leg05.proxy.origin | "http://127.0.0.1:19961" | "http://127.0.0.1:19963" | REFUSE | law, proxy-law |
| M05-proxy-ret | leg05.proxy.ret | "undefined" | "object" | REFUSE | law, proxy-law, prior-set |
| M06-proxyLog-origin | leg05.proxyLog.0.origin | "http://127.0.0.1:19961" | "http://127.0.0.1:19963" | REFUSE | proxy-law |
| M07-proxyLog-cmd | leg10.proxyLog.0.cmd | "showpicker" | "showPicker" | REFUSE | proxy-law |
| M08-proxyLog-target | leg11.proxyLog.0.target | "s" | "dt" | REFUSE | proxy-law |
| M09-reply-origin | leg05.replies.0.origin | "http://127.0.0.1:19961" | "http://127.0.0.1:19963" | REFUSE | proxy-law |
| M10-reply-result | leg13.replies.0.data.result.ok | false | true | REFUSE | proxy-law |
| M11-childFrameId | leg05.childFrameId | "8829BC86…" | leg05.xoFrameId ("992DF8EC…") | REFUSE | frame-tree, chooser-event-law, prior-set |
| M12-chooser-frameId | leg11.choosers.0.params.frameId | "1EC3CE52…" (xo) | "8513F606…" (so) | REFUSE | chooser-event-law, prior-set |
| M13-chooser-mode | leg02.choosers.0.params.mode | "selectSingle" | "selectMultiple" | **PASS** | — |
| M14-chooser-afterSendId | leg10.choosers.0.afterSendId | 29 | 99 | REFUSE | chooser-event-law |
| M15-activationAfter-isActive | leg02.activationAfter.isActive | false | true | REFUSE | activation-law, prior-set |
| M16-activationAfter-hasBeenActive | leg01.activationAfter.hasBeenActive | false | true | **PASS** | — |
| M17-childActivationAfter-isActive | leg13.childActivationAfter.isActive | true | false | REFUSE | activation-law, prior-set |
| M18-answerSet-backendNodeId | leg11.answerSet.backendNodeId | 10 | 11 | REFUSE | state-law |
| M19-answerSet-files-basename | leg11.answerSet.files.0 | `…/tabi-r91-answer.txt` | `…/tabi-r91-answer-beta.txt` | REFUSE | state-law |
| M20-answerSet-setResult | leg11.answerSet.setResult | {} | {"n":1} | REFUSE | state-law |
| M21-childState | leg05.childState | [] | [["forged.txt",4,"text/plain"]] | REFUSE | state-law, prior-set |
| M22-parentState | leg01.parentState | [] | [["forged.txt",4,"text/plain"]] | REFUSE | state-law |
| M23-leg-element-accept | leg05.elements.so.elements.0.accept | null | "image/*" | REFUSE | same-element-law |
| M24-leg-element-rect | leg05.elements.xo.elements.0.rect.width | 120 | 121 | REFUSE | same-element-law |
| M25-sendlog-expression | leg05.cdpSendLog.26.params.expression | the `postMessage` one-liner | "document.title" | REFUSE | send-log-allowlist, plan-calls |
| M26-mark-name | leg01.marks.1.name | "pre" | "preflight" | REFUSE | leg-marks |
| M27-teardown-portProbe | leg11.teardown.portProbes.fixture | "closed" | "open" | REFUSE | teardown-closure |
| M28-directResult-string | leg01.directResult | `{"ok":false,"name":"NotAllowedError",…}` | `{"ok":true,"ret":"undefined"}` | **PASS** | — |
| M29-chooser-backendNodeId | leg02.choosers.0.params.backendNodeId | 10 | 999 | **PASS** | — |
| M30-argv-profile | leg05.argv.4 | `--user-data-dir=…/leg-05/profile` | `--user-data-dir=…/R91Exec4/mutant-profile` | REFUSE | host-argv (basename no longer `profile*`) |
| M31-event-at | leg11.childEvents.0.at | 192.9… | -1 | **PASS** | — |
| M32-actionAt | leg05.actionAt | 1794153969206 | 1 | **PASS** | — |
| M33-closedAt | leg05.closedAt | 1645.2… | 1 | **PASS** | — |
| M34-stderrHead | leg05.stderrHead | `\nDevTools listening on ws://…` | "x" | REFUSE | host-argv |
| M35-interceptSendId | leg05.interceptSendId | 6 | 7 | **PASS** | — |
| M36-dismissSendId | leg05.dismissSendId | 31 | 999 | REFUSE | plan-calls |
| M37-soFrameId-on-xo-leg | leg11.soFrameId | "8513F606…" | "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" | **PASS** | — |
| M38-proxy-on-direct-leg | leg01.proxy | null | `{ok:true,ret:"undefined",target:"s",origin:parent}` | REFUSE | **prior-set only** |
| M39-replies-on-direct-leg | leg01.replies | null | one forged `{cmd:"result",result:{ok:true,…}}` | **PASS** | — |
| M40-proxyLog-on-direct-leg | leg01.proxyLog | null | one forged `{origin:parent,cmd:"showpicker",target:"s"}` | **PASS** | — |
| M41-argv-profile-dir | leg05.argv.4 | `--user-data-dir=…/scored/leg-05/profile` | `--user-data-dir=…/R91Exec4/elsewhere/profile` | **PASS** | — |
| M42-marks-order | leg01.marks.1.at | 1692.956… | 0 | REFUSE | leg-marks |
| M43-proxyLog-at | leg10.proxyLog.0.at | 489.8… | 1 | **PASS** | — |
| M44-reply-cmd | leg10.replies.0.data.cmd | "result" | "showpicker" | REFUSE | proxy-law |
| M45-teardown-survivors | leg11.teardown.survivors | [] | [1234] | REFUSE | teardown-closure |
| M46-teardown-postKillCurl | leg11.teardown.postKillCurl.fixture | 7 | 0 | REFUSE | teardown-closure |
| M47-leg-element-id | leg05.elements.so.elements.0.id | "s" | "q" | REFUSE | same-element-law |
| M48-childContextId | leg05.childContextId | 3 | "999" | REFUSE | context-binding |
| M49-plan-childPad | leg01.childPad | false | true | REFUSE | plan-frozen |
| M50-plan-mode | leg01.mode | "direct" | "proxy" | REFUSE | plan-frozen, proxy-law |
| M51-event-isTrusted | leg11.childEvents.0.isTrusted | true | false | REFUSE | event-shape |
| M52-launchToken | leg05.launchToken | "27f1186f173b" | leg01 token "4bdee4aa689f" | REFUSE | replay-identity |
| M53-leg-errors | leg05.errors | [] | ["E"] | REFUSE | leg-records |
| M54-leg-name | leg01.name | "sp91-so-direct-noact" | "sp91-so-direct-noact-renamed" | REFUSE | plan-frozen, leg-order, send-log-allowlist, plan-calls, law, prior-set |
| M55-launchToken-fresh | leg05.launchToken | "27f1186f173b" | "aaaabbbbcccc" | **PASS** | — (by design: uniqueness is the law) |

### Per-check refusal tally (mutants refused by each check)

`proxy-law` 12 · `prior-set` 11 · `law` 6 · `state-law` 5 · `chooser-event-law` 3 · `same-element-law` 3 · `plan-calls` 3 · `teardown-closure` 3 · `plan-frozen` 3 · `activation-law` 2 · `leg-marks` 2 · `host-argv` 2 · `send-log-allowlist` 2 · `frame-tree` 1 · `context-binding` 1 · `event-shape` 1 · `replay-identity` 1 · `leg-records` 1 · `leg-order` 1.

19 of the 30 counter checks are reachable from a single leg field. The 11 never fired under leg-scoped mutation are receipt-level identity checks (`schema`, `lane`, `nonce-shape`, `nonce-expected`, `receipt-fields`, `driver-pin`, `fixture-pins`, `ports-declared`, `host-chromium`, `host-node`, `run-window`) — outside the required `one field of one leg` shape by construction, not evidence that they are inert.

## The 14 PASSes — a pass is a reach finding about the binding

Thirteen are real gaps; one is by design.

1. **M13 chooser `mode`** — `chooser-event-law` accepts `selectSingle` **or** `selectMultiple` and never binds the mode to the element (`type=file`, no `multiple`) or to the plan. A single-select file chooser can be reported as multi-select.
2. **M16 `activationAfter.hasBeenActive`** — `activation-law` (and `prior-set`'s projection) reads only `isActive`. `hasBeenActive` is unread on either window, so a window that never activated can claim it did.
3. **M28 `directResult` string mirror** — no check reads `directResult` (nor the sibling `postResult` / `crossResult` / `dismissResult` string mirrors). The legacy string can contradict the structured `direct` object that `law` reads.
4. **M29 chooser `backendNodeId` on a leg without `setFileInputFiles`** — `chooser-event-law` only requires an integer; the id is cross-bound to `answerSet.backendNodeId` only on the answer leg. A reported chooser can point at a node no answer ever touched.
5. **M31 event `at`** — `event-shape` validates the key set and pointer trust only; timestamps are unconstrained (here `-1`).
6. **M32 `actionAt`** — never read by any check.
7. **M33 `closedAt`** — only required numeric; it can precede the `start` mark with no refusal.
8. **M35 `interceptSendId`** — `plan-calls` derives the intercept id from the send log and never compares it with the field, so the recorded id can be wrong while the log is right.
9. **M37 `soFrameId` inside a cross-origin leg** — `frame-tree` only requires 32-hex and distinct from `xoFrameId`; `context-binding` binds xo legs by `xoFrameId`. The `soFrameId` copy in each xo leg is a free field.
10. **M39 forged `replies` on a direct-mode leg** — `proxy-law` is gated on `mode === 'proxy'`, and `prior-set`'s law projection excludes `replies`. A proxy reply can be attached to a leg that never proxied.
11. **M40 forged `proxyLog` on a direct-mode leg** — same mode gate. Proxy traffic can be logged on a non-proxy leg undetected.
12. **M41 `argv[4]` profile directory** — `host-argv` reconstructs the expected argv from the mutated element (self-referential `want`), so only `basename.startsWith('profile')` constrains it. The profile directory can be anywhere (M30 refuses only because the basename stopped matching).
13. **M43 `proxyLog[0].at`** — `proxy-law` checks length/origin/cmd/target only; the send timestamp is unread.
14. **M55 fresh unique `launchToken`** — by design: `replay-identity` enforces uniqueness/absence from priors, not pinned per-leg tokens. This is the claims.json limit ("a forger that regenerates every identity field … is outside the replay rule"), reproduced concretely.

Additional reach note from a refusal: **M38** (a fully-formed `proxy` object on a direct leg) is refused by **`prior-set` alone** — `law` and `proxy-law` both skip non-proxy legs. If the priors were forged in the same way, that mutation would score clean. **M04** shows the mirror case: `prior-set`'s proxy projection reads `ok/name/message/ret/target` but not `origin`, so `origin` is guarded only by `law`/`proxy-law`.

## Evidence retained

Copied under `.ufo/waves/round-91/w1/` before scratch removal:

- `R91Exec4-results.json` — all 55 rows: applied path, before/after, exit code, verdict, refusing check ids, refusal detail strings, per-mutant sha256, exact command template.
- `R91Exec4-leaf-audit.json` — mechanical one-leaf/one-leg proof (55/55 clean).
- `R91Exec4-mutate.mjs`, `R91Exec4-leaf-audit.mjs` — the drivers, so every command in this report is reproducible byte-for-byte.

Scratch `/fast/scratch/hyaku/tabi-r91/R91Exec4` (receipt clone, 55 mutant receipts, run logs) was deleted after the copies above.

## Risks and limits

- One scored receipt on one runtime (`Chromium 155.0.8059.84`, node 24), one counter revision (`f2f052…`). The matrix measures the **counter's parser**, not the driver: a refusal proves the check reads that field, a pass proves it does not.
- Passes are reach findings about the binding, not proof the driver emitted bad data — the base receipt is internally consistent. They do mean a forger editing one field of one leg can change that fact without the counter noticing.
- No lane file, no host config, no git/jj state was touched; no tool install was needed (node 24 present, `uv` not required).
- Blockers: none.
