| # | mutant | line | edit (from -> to) | verdict | failed battery cases |
|---|---|---|---|---|---|
| 1 | `r72-in-span-lower-1` | 69 | `in: { seq: [], wheels: [5, 'in'], scale: 2, span: [150, 450]` -> `in: { seq: [], wheels: [5, 'in'], scale: 2, span: [1, 450]` | **SURVIVED** | — |
| 2 | `r72-zero-span-upper-100000` | 78 | `zero: { seq: [], wheels: [20, 'zero'], scale: 1.5, span: [3000, 6000]` -> `zero: { seq: [], wheels: [20, 'zero'], scale: 1.5, span: [3000, 100000]` | **SURVIVED** | — |
| 3 | `r72-pinch-params-first-only` | 181 | `canon(pinches.map((c) => c.params)) === canon(FROZEN.filter((l) => l.params).map((l) => l.params))` -> `canon(pinches.slice(0, 1).map((c) => c.params)) === canon(FROZEN.filter((l) => l.params).map((l) => l.params).slice(0, 1))` | **SURVIVED** | — |
| 4 | `r72-empty-params-open` | 188 | `if (EMPTY.has(c.method)) return canon(c.params) === '{}';` -> `if (EMPTY.has(c.method)) return true;` | **SURVIVED** | — |
| 5 | `r72-leg-mark-monotonic-dropped` | 171 | `(i === 0 \|\| m.at >= marks[i - 1].at)` -> `(i === 0 \|\| true)` | **SURVIVED** | — |
| 6 | `r72-browser-getversion-once-dropped` | 196 | ` && once('Browser.getVersion')` -> `` | **SURVIVED** | — |
| 7 | `r72-dmo-once-dropped` | 196 | ` && once('Emulation.setDeviceMetricsOverride')` -> `` | **SURVIVED** | — |
| 8 | `r72-leg-error-message-loose` | 229 | `leg.cdpError.includes(want.error)` -> `typeof leg.cdpError === 'string'` | **SURVIVED** | — |
| 9 | `r72-server-log-binding-some` | 137 | `served.every((s) => s.run === r.nonce)` -> `served.some((s) => s.run === r.nonce)` | **SURVIVED** | — |
| 10 | `r72-seq-first-free` | 160 | `events.every((e, i) => isObj(e) && e.seq === i + 1)` -> `events.every((e, i) => isObj(e) && (i === 0 \|\| e.seq === i + 1))` | **SURVIVED** | — |
| 11 | `r72-event-types-deltamode-dropped` | 165 | `num(e.deltaY) && num(e.deltaMode) && num(e.clientX) && num(e.clientY)` -> `num(e.deltaY) && num(e.clientX) && num(e.clientY)` | **SURVIVED** | — |
| 12 | `r72-initial-scale-cdp-dropped` | 233 | `near(legs[0]?.scaleBefore?.page, 1) && near(legs[0]?.scaleBefore?.cdp, 1)` -> `near(legs[0]?.scaleBefore?.page, 1)` | **SURVIVED** | — |
| 13 | `r73-replay-timeline-type-included` | 146 | `[e.ts, e.at]` -> `[e.ts, e.at, e.type]` | **SURVIVED** | — |
| 14 | `r73-replay-browserid-length-loose` | 145 | `/\/devtools\/browser\/([0-9a-f-]{36})$/` -> `/\/devtools\/browser\/([0-9a-f-]+)$/` | **SURVIVED** | — |
| 15 | `r73-replay-token-priors-last-only` | 148 | `priors.every((p) => !isObj(p.host) \|\| p.host.launchToken !== tok)` -> `priors.slice(-1).every((p) => !isObj(p.host) \|\| p.host.launchToken !== tok)` | **SURVIVED** | — |
| 16 | `r73-replay-token-priors-first-only` | 148 | `priors.every((p) => !isObj(p.host) \|\| p.host.launchToken !== tok)` -> `priors.slice(0, 1).every((p) => !isObj(p.host) \|\| p.host.launchToken !== tok)` | KILLED | ["replay-byte-identical","replay-nonce-stamps-rewritten","replay-token-only-shared"] |
| 17 | `r73-replay-token-shape-12-or-more` | 148 | `/^[0-9a-f]{12}$/.test(tok)` -> `/^[0-9a-f]{12,}$/.test(tok)` | **SURVIVED** | — |
| 18 | `r73-leg-marks-at-zero` | 171 | `num(m.at) && m.at > 0` -> `num(m.at) && m.at >= 0` | **SURVIVED** | — |
| 19 | `r73-closedat-floor-start-mark` | 172 | `r.closedAt >= marks[marks.length - 1].at` -> `r.closedAt >= marks[0].at` | KILLED | ["leg-marks-closed-early"] |
| 20 | `r73-marks-name-length-only` | 171 | `canon(markNames) === canon(['start', ...LEG_ORDER])` -> `markNames.length === LEG_ORDER.length + 1` | KILLED | ["leg-marks-fabricated-name"] |
| 21 | `r73-late-after-close-sign-dropped` | 172 | `Number.isInteger(r.lateAfterClose) && r.lateAfterClose >= 0` -> `Number.isInteger(r.lateAfterClose)` | KILLED | ["leg-marks-late-negative"] |
| 22 | `r73-run-window-floor-800` | 154 | `t1 - t0 >= 8000` -> `t1 - t0 >= 800` | KILLED | ["run-window-short"] |
| 23 | `r73-host-chromium-any-version` | 140 | `/^Chromium \d+\.\d+\.\d+\.\d+/` -> `/Chromium \d+/` | **SURVIVED** | — |
| 24 | `r73-devtools-stderr-dropped` | 143 | `typeof host.stderrHead === 'string' && host.stderrHead.includes(dl.url)` -> `true` | KILLED | ["devtools-stderr-absent"] |
| 25 | `r73-devtools-port-string-coercion` | 143 | `dl.port === argvPort` -> `Number(dl.port) === argvPort` | **SURVIVED** | — |
| 26 | `r73-scale-chain-dropped` | 235 | ` && LEG_ORDER.slice(1).every((n, i) => near(legOf(n).scaleBefore?.page, legOf(LEG_ORDER[i]).scaleAfter?.page))` -> `` | KILLED | ["scale-agreement-chain"] |
| 27 | `r73-event-window-strict-lower` | 175 | `return e.at >= w[0] && e.at <= w[1]` -> `return e.at > w[0] && e.at <= w[1]` | KILLED | ["accept-mark-equal-event-at"] |
| 28 | `r73-wheels-deltamode-number-only` | 222 | `wheels.every((e) => e.ctrlKey === true && e.deltaMode === 0)` -> `wheels.every((e) => e.ctrlKey === true && num(e.deltaMode))` | KILLED | ["in-wheel-delta-mode","out-wheel-delta-mode","clamp-wheel-delta-mode","default-wheel-delta-mode","zero-wheel-delta-mode"] |
| 29 | `r73-touch-seq-length-only` | 218 | `canon(nonMove) === canon(want.seq) && moveTypesOk` -> `nonMove.length === want.seq.length && moveTypesOk` | **SURVIVED** | — |
| 30 | `r73-teardown-curl-fixture-number` | 262 | `td.postKillCurl.fixture === 7` -> `typeof td.postKillCurl.fixture === 'number'` | **SURVIVED** | — |
| 31 | `r73-pinch-count-at-least-9` | 180 | `pinches.length === 10` -> `pinches.length >= 9` | KILLED | ["pinch-call-count","pinch-call-duplicate","pinch-method-suffix"] |
| 32 | `r73-producer-predicate-truthy` | 264 | `r.predicate === true && r.synthPinchHypothesis === 'CONFIRMED'` -> `r.predicate && r.synthPinchHypothesis === 'CONFIRMED'` | KILLED | ["producer-verdict-string-true","producer-verdict-one"] |
| 33 | `r73-layoutmetrics-params-open` | 188 | `if (EMPTY.has(c.method)) return canon(c.params) === '{}';` -> `if (EMPTY.has(c.method)) return c.method === 'Page.getLayoutMetrics' ? true : canon(c.params) === '{}';` | **SURVIVED** | — |
| 34 | `r73-origin-port-optional` | 182 | `/^http:\/\/127\.0\.0\.1:\d+$/` -> `/^http:\/\/127\.0\.0\.1(:\d+)?$/` | **SURVIVED** | — |
| 35 | `r73-schema-prefix-r7` | 131 | `r.schema === 'tabi-chrome-cdp-synthpinch-r73'` -> `typeof r.schema === 'string' && r.schema.startsWith('tabi-chrome-cdp-synthpinch-r7')` | KILLED | ["schema"] |
| 36 | `r73-leg-order-length-only` | 156 | `canon(legs.map((l) => l && l.name)) === canon(LEG_ORDER)` -> `legs.map((l) => l && l.name).length === LEG_ORDER.length` | KILLED | ["leg-order"] |
| 37 | `r73-leg-params-elapsed-nullable` | 157 | `num(l.elapsedMs) && l.elapsedMs >= 0` -> `l.elapsedMs != null` | KILLED | ["leg-params-elapsed-string"] |
| 38 | `r73-wheel-law-relative-tolerance` | 245 | `-100 * Math.log(FROZEN.find((l) => l.name === n).params.scaleFactor), 0.5)` -> `-100 * Math.log(FROZEN.find((l) => l.name === n).params.scaleFactor), Math.abs(lawSum(n)) * 0.02)` | KILLED | ["clamp-delta-off-0.8","out-delta-off-0.8","default-delta-off-0.8"] |
