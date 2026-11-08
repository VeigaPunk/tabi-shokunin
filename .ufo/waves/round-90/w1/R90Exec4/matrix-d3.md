### Assigned eight + control

| id | mutation (send-log/send-record change) | exit | D3 verdict | D3 refusing check / sub-token | D1 delta |
|---|---|---|---|---|---|
| `m00-identity` | control: unmodified scored-receipt clone (same exemption) | 0 | PASS (clean 107) | — | same |
| `m01-remove-settle` | delete the settle `Runtime.evaluate` from `sp89-accept-domread-text`; renumber ids | 1 | refused | `plan-calls` (`settle-order`, `sequence`) | **D1** `plan-calls` (`settle-eval`, `settle-order`, `sequence`) |
| `m02-rename-plain-inputs` | rename the settle expression to plain `window.__inputs()` (allowlisted) | 1 | refused | `plan-calls` (`settle-order`, `sequence`) | **D1** `plan-calls` (`settle-eval`, `settle-order`, `sequence`) |
| `m03-duplicate-settle` | duplicate the settle `Runtime.evaluate` immediately after itself; renumber | 1 | refused | `plan-calls` (`sequence`) | **D1** `plan-calls` (`settle-eval`, `sequence`) |
| `m04-move-settle-after-dismiss` | move the settle `Runtime.evaluate` after the dismiss `{cancel:true}`; renumber | 1 | refused | `plan-calls` (`settle-order`, `sequence`) | same |
| `m05-add-settle-to-non-domread` | insert the settle `Runtime.evaluate` after the first `window.__state()` of `sp84-accept-answer` (kind showpicker-answer) | 1 | refused | `send-log-allowlist` | **D1** `plan-calls` (`settle-eval-unexpected`, `settle-eval`) |
| `m06-settle-returnbyvalue-false` | settle `returnByValue:false` | 1 | refused | `plan-calls` (`sequence`) | same |
| `m07-extra-eval-between-state-settle` | insert allowlisted `window.__late` between the settle `window.__state()` and the settle call | 1 | refused | `plan-calls` (`settle-order`) | same |
| `m08-swap-domread-logs` | swap the whole send logs of `sp89-accept-domread-text` and `sp89-accept-domread-png`; rebind ids | 1 | refused | `send-log-allowlist`, `plan-calls` (`sequence`, `answer-files`, `trigger-id`) | same |

### Swap class

| id | mutation (send-log/send-record change) | exit | D3 verdict | D3 refusing check / sub-token | D1 delta |
|---|---|---|---|---|---|
| `m09-swap-domread-with-same-target-answer` | swap send logs of `sp89-accept-domread-text` and `sp86-accept-wildcard-text` (same target `aw`/answer `a.txt`); event logs untouched | 1 | refused | `send-log-allowlist`, `plan-calls`, `cdp-event-log-closed` (`settle-order`, `sequence`) | **D1** `plan-calls`, `cdp-event-log-closed` (`settle-eval-unexpected`, `settle-eval`, `settle-order`, `sequence`) |
| `m10-swap-same-target-answer-logs` | swap send logs of `sp84-accept-answer` and `sp84-accept-mime-answer` (same target `k`); mirror the answer record | 1 | refused | `plan-calls`, `accept-answer-law`, `accept-mime-answer-law` (`sequence`, `answer-files`) | same |
| `m20-swap-answer-logs-pure` | swap send logs of `sp84-accept-answer` and `sp84-accept-mime-answer`; answer record untouched | 1 | refused | `plan-calls` (`sequence`, `answer-files`) | same |
| `m25-swap-same-target-coherent` | m09 made coherent: rebind ids, mirror the answer record, set each open event `afterSendId` to its trigger id | 1 | refused | `send-log-allowlist`, `plan-calls` (`settle-order`, `sequence`) | **D1** `plan-calls` (`settle-eval-unexpected`, `settle-eval`, `settle-order`, `sequence`) |

### Position/params/cross-field probes

| id | mutation (send-log/send-record change) | exit | D3 verdict | D3 refusing check / sub-token | D1 delta |
|---|---|---|---|---|---|
| `m14-rebind-settle-to-post-dismiss-state` | remove settle-state + settle; reinsert both after the surviving post-dismiss state | 1 | refused | `plan-calls` (`settle-order`, `sequence`) | same |
| `m15-move-state-settle-pair-after-dismiss` | move the (`window.__state()`, settle) pair after the dismiss | 1 | refused | `plan-calls` (`sequence`) | same |
| `m16-nonallowlisted-eval-after-settle` | insert non-allowlisted `window.__inputs(true)||0` between settle and dismiss | 1 | refused | `send-log-allowlist` | same |
| `m17-non-domread-preread-becomes-settle` | change `sp84-accept-answer`'s pre-read plain `window.__inputs()` to the settle expression | 1 | refused | `send-log-allowlist` | **D1** `plan-calls` (`settle-eval-unexpected`, `settle-eval`) |
| `m23-settle-params-key-order` | reorder the settle params keys (`returnByValue` first; semantically identical) | 1 | refused | `plan-calls` (`sequence`) | same |
| `m24-add-settle-to-cross-leg` | insert the settle `Runtime.evaluate` into cross-origin `sp84-cross-origin-nonfile` (parent context) | 1 | refused | `send-log-allowlist` | **D1** `plan-calls` (`settle-eval-unexpected`, `settle-eval`) |
| `m28-settle-contextid` | set the settle `params.contextId` to the page main default context id | 1 | refused | `send-log-allowlist`, `plan-calls` (`sequence`) | same |
| `m29-settle-extra-param-usergesture` | add `userGesture:true` to the settle params | 1 | refused | `plan-calls` (`sequence`) | same |
| `m30-extra-state-between-state-settle` | insert an extra `window.__state()` between the settle state and the settle call | 1 | refused | `plan-calls` (`settle-order`) | same |
| `m31-extra-state-before-anchor` | insert an extra `window.__state()` immediately before the settle state anchor | 1 | refused | `plan-calls` (`settle-order`) | same |
| `m32-settle-bare-params` | strip `returnByValue` from the settle params (bare `{expression}`) | 1 | refused | `plan-calls` (`sequence`) | same |
| `m22-remove-plain-preread` | delete the pre-read plain `window.__inputs()`; event `afterSendId` untouched | 1 | refused | `cdp-event-log-closed` | same |

### Reach probes (identity-adjacent changes)

| id | mutation (send-log/send-record change) | exit | D3 verdict | D3 refusing check / sub-token | D1 delta |
|---|---|---|---|---|---|
| `m11-extra-late-after-settle` | insert `window.__late` between the settle call and the dismiss | 0 | PASS (clean 107) | — | same |
| `m12-extra-plain-inputs-after-settle` | insert plain `window.__inputs()` between the settle call and the dismiss | 0 | PASS (clean 107) | — | same |
| `m13-plain-preread-returnbyvalue-false` | set the pre-read plain `window.__inputs()` (id 9) `returnByValue:false` | 0 | PASS (clean 107) | — | same |
| `m18-post-dismiss-state-returnbyvalue-false` | set the post-dismiss `window.__state()` `returnByValue:false` | 0 | PASS (clean 107) | — | same |
| `m19-extra-state-after-settle` | insert an extra `window.__state()` between the settle call and the dismiss | 0 | PASS (clean 107) | — | same |
| `m21-remove-post-dismiss-state` | delete the post-dismiss `window.__state()` | 0 | PASS (clean 107) | — | same |
| `m26-remove-plain-preread-coherent` | delete the pre-read plain `window.__inputs()` and shift event `afterSendId` > 9 down by one | 0 | PASS (clean 107) | — | same |
| `m27-plain-inputs-before-state-anchor` | insert a plain `window.__inputs()` immediately before the settle state anchor | 0 | PASS (clean 107) | — | same |

