FINDINGS

# R76Mut1 — semantic mutants beyond the frozen kill-power set (tabi round 76, C1 `chromium-js-dialog-linux`)

Frozen counter `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-dialog-r76.mjs`, sha256 `505055381ee4d4697a0f2c4fad69f661b64a0adabd44ab451a97b3cd30dddcf4`; frozen scored receipt `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round76/chromium-js-dialog/receipt.json` (nonce `tabi-r76-l1-97bf5d560d03`); driver pin `152ffc116b0b15968eb18ab8682b9de3ac49a2f9f3f81ff22e77153526fbdd51`; prior set `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-76/controls/c1/prior-set.txt`. No file outside this seat's scratch and this seat's directory was written; the frozen counter, the battery, the driver, the planned prior set and the predicate are untouched.

## 1. What was run

60 single-edit **semantic** mutants of the frozen counter, each one edit string that occurs **exactly once** in the counter bytes (the harness refuses to build otherwise). Mutants are not "force a check true": each changes an operator, a table literal, a typed()/errOk()/evShapeOk()/leg-record conjunct, a greedy-matcher comparator, a leg-window or seq index, an allow-list EXPRS/EMPTY entry, a planCalls entry, or a prior-set walk element. None of the 60 edit strings equals a kill-power SEMANTIC entry (all 56 frozen entries were read from the control file and every `from` string here is a different substring). Four edits land on a rule the frozen set also touches, with a different operator or site — X12 flips the pair-match comparator `<` to `<=` where the frozen set changes the TOL value; X39 removes the leg-record elapsed floor where the frozen set lowers it to 0; X43 loosens the served-row counts where the frozen set loosens the `/next` count inside beforeunload-law; X50 turns the send-log allow-list `every` into `some` where the frozen set drops one EXPRS membership test. The other 56 target conjuncts, tables, indices, roots and matchers the frozen set never edits.

For every mutant the harness built a directory holding the mutated counter **and a copy of the battery and of the pinned driver beside it**, then ran:

```
node <copy>/negatives-dialog-r76.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --real /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round76/chromium-js-dialog/receipt.json \
  --expect-driver-sha256 152ffc116b0b15968eb18ab8682b9de3ac49a2f9f3f81ff22e77153526fbdd51 \
  --expect-nonce tabi-r76-l1-97bf5d560d03 \
  --prior-set /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-76/controls/c1/prior-set.txt \
  --laundered .../degenerate-page-stub.receipt.json --laundered .../degenerate-eval-trigger.receipt.json \
  --laundered .../degenerate-swap-accept.receipt.json --work <scratch>/w<k> --first-failure --jobs 4 --json
```

Classification is byte-for-byte kill-power-r76.mjs's `classify()`: battery exit 0 with allOk = `survived`; exit 1 with a named case = `killed`; exit 1 failing only `(positive)` where the positive run exits 1 with >= 1 finding id = `killed-positive`; anything else = `crashed`.

Commands and observed results (all exit codes as recorded in `run-results.json`):

| step | command (node, absolute paths) | exit |
|---|---|---|
| mutant batch, run 1 | `run-mutants.mjs --conc 6 --jobs 4` over 60 mutants | 0 |
| mutant batch, run 2 (after replacing the one invalid edit) | same | 0 |
| unmutated battery (baseline, inside each batch) | battery with `--first-failure`; both batches | 0, allOk, passed 251/251 |
| witness/parity/refusal probes | `probe.mjs` (18 probes, mutant + frozen counter on each receipt) | 0, allAsClaimed true |

Determinism: run 1 and run 2 agree on all 59 mutants present in both batches (0 outcome diffs); the baseline battery is `survived` 251/251 in both. The only difference is the replaced mutant (see §7).

## 2. Result

| class | count |
|---|---|
| semantic mutants | 60 |
| killed (named battery case) | 16 |
| killed-positive (mutant refuses the honest receipt with a named finding) | 21 |
| survived (battery allOk) | 23 |
| crashed | 0 |
| survivors with an **acceptance witness** | 7 |
| survivors shown equivalent (parity probe or construction) | 11 |
| survivors stricter-only, with a **refusal witness** | 3 |
| survivors stricter-only, direction proved by construction | 2 |

So the battery kills **37 / 60** of these semantic defects and misses **23**, of which **7** are receipt-level escapes: for those, a receipt the frozen counter *refuses* is *accepted* by the mutant (see mutants.json field evidence.probe). The remaining survivors are either logically equivalent edits (the dropped conjunct is implied by another check that the receipt must pass) or strictly stricter edits (their accepted set is a subset of the frozen counter's, so no acceptance witness can exist — each is backed by a refusal witness or a set argument). This is a **coverage finding against the battery, not a defect claim against the predicate**: the frozen check set as a whole still refuses every receipt the mutants accepted only because each mutant removed one conjunct at a time; no single edit below proves the frozen counter accepts a bad receipt.

## 3. Killed (named battery case)

| mutant | line | edit (from → to) | battery exit | failing case(s) |
|---|---|---|---|---|
| `X02-typed-eventtype-set-dropped` | 259 | `EVENT_TYPES.has(e.type) && ` → `` | 1 | event-types-unknown-type |
| `X04-typed-nonreturn-ret-dropped` | 262 | `: e.kind === null && e.ret === null)` → `: e.kind === null)` | 1 | event-types-ret-on-pointer |
| `X06-typed-buttons-null-pair-dropped` | 261 | `&& (e.x === null) === (e.buttons === null)` → `` | 1 | event-types-half-null-xy |
| `X07-typed-trusted-type-relaxed` | 260 | `typeof e.isTrusted === 'boolean'` → `e.isTrusted !== undefined` | 1 | event-types-trusted-string |
| `X13-match-advance-swapped` | 203 | `else if (d < 0) i++; else j++;` → `else if (d > 0) i++; else j++;` | 1 | replay-timeline-gap-at-threshold |
| `X16-prior-walk-nested-skip` | 217 | `if (e.isDirectory()) walk(p); ` → `if (e.isDirectory()) continue; ` | 1 | prior-set-complete-omitted |
| `X33-window-end-always-closed` | 271 | `i + 1 < marks.length ? marks[i + 1].at : r.closedAt` → `r.closedAt` | 1 | event-leg-window-late-label |
| `X34-window-prev-ts-compared` | 272 | `num(events[i - 1].at) && e.at >= events[i - 1].at` → `num(events[i - 1].at) && e.at >= events[i - 1].ts` | 1 | event-leg-window-order |
| `X37-legrec-keys-dropped` | 234 | `if (canon(Object.keys(l).sort()) !== canon(['elapsedMs', 'handleError…` → `` | 1 | leg-records-extra-key |
| `X39-legrec-elapsed-floor-dropped` | 238 | `if (!num(l.elapsedMs) \|\| l.elapsedMs < 290) bad('elapsedMs');` → `if (!num(l.elapsedMs)) bad('elapsedMs');` | 1 | leg-records-elapsed-short |
| `X41-legrec-navkeys-dropped` | 253 | `\|\| canon(Object.keys(l.triggerResult).sort()) !== canon(p.name === 'u…` → `\|\| false)` | 1 | leg-records-nav-result-missing-loader |
| `X43-server-root-count-ge` | 170 | `servedRoot.length === 1 && servedNext.length === 1` → `servedRoot.length >= 1 && servedNext.length >= 1` | 1 | server-log-next-twice |
| `X46-count-navigate-ge` | 278 | `n('Page.navigate') === 3` → `n('Page.navigate') >= 3` | 1 | dialog-call-count-third-navigate |
| `X50-allowlist-every-to-some` | 327 | `sendLog.every(allowed)` → `sendLog.some(allowed)` | 1 | lookalike-stub-confirm, lookalike-script-click, lookalike-events-push, lookalike-call-function-on, lookalike-file-chooser, lookalike-add-script, lookalike-bypass-csp |
| `X52-runwindow-upper` | 223 | `t1 - t0 < 600000` → `t1 - t0 < 6000000` | 1 | run-window-long |
| `X53-quantum-every-to-some` | 221 | `events.every((e) => isObj(e) && onGrid(e.ts) && onGrid(e.at))` → `events.some((e) => isObj(e) && onGrid(e.ts) && onGrid(e.at))` | 1 | event-time-quantum, event-time-quantum-at, event-time-quantum-bracket-2e-5 |

## 4. Killed-positive (mutant refuses the honest receipt; the finding is the mutant's own)

| mutant | line | edit (from → to) | positive exit | positive findings |
|---|---|---|---|---|
| `X05-typed-beforeunload-xy-dropped` | 263 | `(e.type === 'beforeunload' ? e.x === null : e.type === 'dialog-return…` → `(e.type === 'dialog-return' \|\| Number.isInteger(e.x))` | 1 | event-types |
| `X19-plan-root-slash-dropped` | 281 | `origin + '/?run='` → `origin + '?run='` | 1 | dialog-call-params |
| `X20-plan-pressed-buttons` | 283 | `{ type: 'mousePressed', x: p.at[0], y: p.at[1], button: 'left', butto…` → `{ type: 'mousePressed', x: p.at[0], y: p.at[1], button: 'le…` | 1 | dialog-call-params |
| `X21-plan-handle-only-dropped` | 285 | `if (p.kind !== null) planCalls.push(['Page.handleJavaScriptDialog', p…` → `if (p.kind !== 'handle-only') planCalls.push(['Page.handleJ…` | 1 | dialog-call-params |
| `X22-button-table-p-to-a` | 71 | `const BUTTON = { 150: 'a', 300: 'c', 450: 'p' };` → `const BUTTON = { 150: 'a', 300: 'c', 450: 'a' };` | 1 | return-value-law, closed-echo-law, coordinate-law |
| `X23-kindof-prompt-to-confirm` | 72 | `const KIND_OF = { a: 'alert', c: 'confirm', p: 'prompt' };` → `const KIND_OF = { a: 'alert', c: 'confirm', p: 'confirm' };` | 1 | return-value-law, closed-echo-law |
| `X24-message-alert-suffixed` | 73 | `MESSAGE = { alert: 'tabi-alert', confirm: 'tabi-confirm', prompt: 'ta…` → `MESSAGE = { alert: 'tabi-alert!', confirm: 'tabi-confirm', …` | 1 | closed-echo-law |
| `X25-defaultprompt-confirm-nonempty` | 74 | `DEFAULT_PROMPT = { alert: '', confirm: '', prompt: 'tabi-default', be…` → `DEFAULT_PROMPT = { alert: '', confirm: 'tabi-default', prom…` | 1 | closed-echo-law |
| `X26-nodialog-code` | 75 | `const NO_DIALOG = { code: -32602, message: 'No dialog is showing' };` → `const NO_DIALOG = { code: -32601, message: 'No dialog is sh…` | 1 | leg-no-dialog-error, no-dialog-law |
| `X27-wantret-alert-null` | 365 | `kind === 'alert' ? 'undefined'` → `kind === 'alert' ? 'null'` | 1 | return-value-law |
| `X28-wantret-prompt-prefix-dropped` | 365 | `h.accept ? 'string:' + (h.promptText ?? '') : 'null'` → `h.accept ? String(h.promptText ?? '') : 'null'` | 1 | return-value-law |
| `X29-block-return-index` | 384 | `return k !== 4 \|\| es.length !== 6` → `return k !== 3 \|\| es.length !== 6` | 1 | blocking-law |
| `X31-seq-index-base` | 256 | `events.every((e, i) => isObj(e) && e.seq === i + 1)` → `events.every((e, i) => isObj(e) && e.seq === i)` | 1 | seq-monotonic |
| `X32-window-index-offbyone` | 271 | `const i = RECORDED.indexOf(name) + 1;` → `const i = RECORDED.indexOf(name);` | 1 | event-leg-window |
| `X40-legrec-sendid-plus2` | 249 | `l.handleSendId !== l.triggerSendId + 1` → `l.handleSendId !== l.triggerSendId + 2` | 1 | leg-records |
| `X45-count-dispatch-eleven` | 278 | `n('Input.dispatchMouseEvent') === 12` → `n('Input.dispatchMouseEvent') === 11` | 1 | dialog-call-count |
| `X47-exprs-drop-late` | 315 | `'window.__late', ` → `` | 1 | send-log-allowlist |
| `X48-exprs-recorded-slice` | 316 | `...RECORDED.map((nm) => 'window.__setLeg(' + JSON.stringify(nm) + ')')` → `...RECORDED.slice(0, -1).map((nm) => 'window.__setLeg(' + J…` | 1 | send-log-allowlist |
| `X49-empty-set-frame-tree-dropped` | 317 | `const EMPTY = new Set(['Browser.getVersion', 'Page.enable', 'Runtime.…` → `const EMPTY = new Set(['Browser.getVersion', 'Page.enable',…` | 1 | send-log-allowlist |
| `X51-allowlist-id-base` | 327 | `sendLog.every((c, i) => isObj(c) && c.id === i + 1)` → `sendLog.every((c, i) => isObj(c) && c.id === i)` | 1 | send-log-allowlist |
| `X55-cdpview-nav-path` | 333 | `: ['navigated', pathOf(e.params.url)]` → `: ['navigated', e.params.url]` | 1 | leg-unload-accept-dialog, legshape-consistency |

## 5. Survivors — acceptance witnesses (mutant exit 0, frozen counter exit 1)

Each witness receipt is beside this report as `<probe>.receipt.txt` (JSON content; the prior-set walk only reads `*.json`, so a receipt kept under the lane tree under this name cannot race another seat's run).

| mutant | line | edit (from → to) | witness receipt | mutant | frozen | frozen findings |
|---|---|---|---|---|---|---|
| `X01-typed-ts-nonneg` | 259 | `num(e.ts) && e.ts > 0 && num(e.at) && e.at > 0` → `num(e.ts) && e.ts >= 0 && num(e.at) && e.at > 0` | `W-X01-ts-zero.receipt.txt` | exit 0, [] | exit 1 | event-types |
| `X10-evshape-aftersend-int-dropped` | 291 | `&& Number.isInteger(e.afterSendId) && EV_KEYS[e.method] !== undefined` → `&& EV_KEYS[e.method] !== undefined` | `W-X10-aftersend-string.receipt.txt` | exit 0, [] | exit 1 | cdp-event-log-closed |
| `X35-marks-monotonic-dropped` | 268 | `marks.every((m, i) => isObj(m) && num(m.at) && m.at > 0 && (i === 0 \|…` → `marks.every((m, i) => isObj(m) && num(m.at) && m.at > 0)` | `W-X35-marks-order.receipt.txt` | exit 0, [] | exit 1 | leg-marks, event-leg-window |
| `X38-legrec-kind-dropped` | 235 | `if (l.kind !== p.kind) bad('kind');` → `` | `W-X38-leg-kind-handle-only.receipt.txt` | exit 0, [] | exit 1 | leg-records |
| `X44-server-query-conjunct-dropped` | 170 | ` && s.query === 'run=' + encodeURIComponent(String(r.nonce))` → `` | `W-X44-server-query.receipt.txt` | exit 0, [] | exit 1 | server-log-binding |
| `X59-argv-length-ge` | 189 | `hargv.length === 17` → `hargv.length >= 17` | `W-X59-argv-18.receipt.txt` | exit 0, [] | exit 1 | host-argv |
| `X60-fixture-viewport-dropped` | 182 | ` && canon(r.fixture.viewport) === canon(VIEWPORT)` → `` | `W-X60-viewport.receipt.txt` | exit 0, [] | exit 1 | fixture-hash |

Reading: the battery never exercises these conjuncts. X01 (`ts > 0`), X10 (`Number.isInteger(afterSendId)`), X35 (mark monotonicity), X38 (leg-record `kind`), X44 (the served-row `query`), X59 (`argv.length === 17`) and X60 (fixture viewport) can each be deleted from the counter and the battery still reports 251/251 allOk, while a receipt that violates only that conjunct is accepted. The battery's coverage is by check id (every declared id is the expected id of >= 1 refusal case) — these seven show that one case per id does not pin the conjuncts *inside* the id.

## 6. Survivors — equivalent or stricter-only

| mutant | line | verdict | evidence |
|---|---|---|---|
| `X03-typed-ret-string-dropped` | 262 | equivalence | parity: mutant exit 1 [leg-alert-accept-ret, return-value-law, legshape-consistency], frozen exit 1 [event-types, leg-alert-accept-ret, return-value-law, legshape-consistency] on `E-X03-ret-number.receipt.txt` |
| `X08-errok-code-int-dropped` | 228 | equivalence | parity: mutant exit 1 [leg-no-dialog-error, no-dialog-law, legshape-consistency], frozen exit 1 [leg-records, leg-no-dialog-error, no-dialog-law, legshape-consistency] on `E-X08-code-float.receipt.txt` |
| `X09-errok-message-string-dropped` | 228 | equivalence | parity: mutant exit 1 [leg-no-dialog-error, no-dialog-law, legshape-consistency], frozen exit 1 [leg-records, leg-no-dialog-error, no-dialog-law, legshape-consistency] on `E-X09-message-number.receipt.txt` |
| `X11-evshape-method-known-dropped` | 291 | equivalence | parity: mutant exit 1 [cdp-event-log-closed, dialog-event-binding], frozen exit 1 [cdp-event-log-closed, dialog-event-binding] on `E-X11-unknown-method.receipt.txt` |
| `X18-prior-walk-needle-unquoted` | 215 | equivalence | implied by construction (no probe needed) |
| `X30-block-target-coupling-dropped` | 384 | equivalence | parity: mutant exit 1 [leg-alert-accept-seq, legshape-consistency], frozen exit 1 [leg-alert-accept-seq, blocking-law, legshape-consistency] on `E-X30-ret-target.receipt.txt` |
| `X36-legcount-conjunct-dropped` | 225 | equivalence | implied by construction (no probe needed) |
| `X42-legrec-handle-method-dropped` | 243 | equivalence | parity: mutant exit 1 [dialog-call-count, dialog-call-params], frozen exit 1 [leg-records, dialog-call-count, dialog-call-params] on `E-X42-handle-method.receipt.txt` |
| `X56-cdpview-defaultprompt-nullish-dropped` | 332 | equivalence | implied by construction (no probe needed) |
| `X57-eventlegdomain-all-legs` | 257 | equivalence | parity: mutant exit 1 [event-leg-window, leg-unload-accept-seq, leg-unload-accept-trusted, leg-unload-accept-prevented, leg-unload-accept-xy, coordinate-law, legshape-consistency], frozen exit 1 [event-leg-domain, event-leg-window, leg-unload-accept-seq, leg-unload-accept-trusted, leg-unload-accept-prevented, leg-unload-accept-xy, coordinate-law, legshape-consistency] on `E-X57-unload-event.receipt.txt` |
| `X58-devtools-url-prefix-loose` | 196 | equivalence | parity: mutant exit 1 [devtools-port-binding, replay-devtools-url], frozen exit 1 [devtools-port-binding, replay-devtools-url] on `E-X58-devtools-url-path.receipt.txt` |
| `X12-match-strict-to-nonstrict` | 203 | direction | stricter-only by set argument |
| `X14-pairmatch-at-dropped` | 205 | direction | refusal: mutant exit 1 [replay-event-timeline], frozen exit 0 [] on `R-X14-prior-ts-only.receipt.txt` |
| `X15-gaps-gte-to-strict` | 206 | direction | stricter-only by set argument |
| `X17-prior-walk-realpath-dropped` | 217 | direction | refusal: mutant exit 1 [prior-set-complete], frozen exit 0 [] on `R-X17-prior-symlink.receipt.txt` |
| `X54-legshape-json-stringify` | 405 | direction | refusal: mutant exit 1 [legshape-consistency], frozen exit 0 [] on `R-X54-legshape-key-order.receipt.txt` |

### 6.1 Equivalence arguments (11)

- X03-typed-ret-string-dropped (/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-dialog-r76.mjs:262) — typed() is the only reader of raw ret; derived.ret is compared canonically to SHAPE[leg].ret in leg-<leg>-ret, and every SHAPE ret is a string, so any receipt the mutant accepts has a string ret anyway. Parity probe: both counters refuse a numeric ret.
- X08-errok-code-int-dropped (/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-dialog-r76.mjs:228) — errOk admits only null or a {code,message}-keyed object, and leg-<leg>-error compares the same object canonically to SHAPE errors; the only non-null SHAPE error is NO_DIALOG (integer code), so any accepted receipt has an integer code. Parity probe: both counters refuse code -32602.5.
- X09-errok-message-string-dropped (/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-dialog-r76.mjs:228) — same argument as X08 via the canonical leg-<leg>-error comparison to NO_DIALOG.message. Parity probe: both counters refuse a numeric message.
- X11-evshape-method-known-dropped (/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-dialog-r76.mjs:291) — evShapeOk keeps `canon(Object.keys(e.params).sort()) === canon(EV_KEYS[e.method])`; for an unknown method EV_KEYS[method] is undefined and an array never canon-equals undefined, so the dropped guard is implied. Parity probe: both counters refuse an unknown-method entry.
- X18-prior-walk-needle-unquoted (/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-dialog-r76.mjs:215) — for any file whose parsed top-level schema is SCHEMA the schema string appears quoted in the bytes, so the quoted needle is present exactly when the unquoted token is; the wider prefilter cannot change which files reach the `j.schema === SCHEMA` predicate.
- X30-block-target-coupling-dropped (/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-dialog-r76.mjs:384) — leg-<leg>-seq compares the dialog-return target to SHAPE (same button as the click), so for any accepted receipt the two targets are already equal. Parity probe: both counters refuse a dialog-return on another button.
- X36-legcount-conjunct-dropped (/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-dialog-r76.mjs:225) — canon(legs.map(name)) === canon(LEG_ORDER) forces the same length, so removing the explicit length conjunct cannot change the outcome.
- X42-legrec-handle-method-dropped (/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-dialog-r76.mjs:243) — a handle send carrying another method changes the filtered gotCalls list in dialog-call-params and the method counts in dialog-call-count, so the dropped method conjunct is implied. Parity probe: both counters refuse a renamed handle send.
- X56-cdpview-defaultprompt-nullish-dropped (/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-dialog-r76.mjs:332) — in arrays canon(undefined) and canon(null) both serialise to null (JSON.stringify([undefined]) === "[null]"), so the two forms are indistinguishable wherever cdpView output is compared.
- X57-eventlegdomain-all-legs (/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-dialog-r76.mjs:257) — LEG_ORDER minus RECORDED is exactly [unload-accept], whose SHAPE event list is empty; any event labelled unload-accept fails leg-unload-accept-seq and event-leg-window (RECORDED.includes is false). Parity probe: both counters refuse an unload-accept event.
- X58-devtools-url-prefix-loose (/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-dialog-r76.mjs:196) — browserId() requires /devtools/browser/<uuid> at the end of the same URL and replay-devtools-url demands a non-null id, so every URL the loose prefix admits but the strict prefix rejects is also refused by replay-devtools-url. Parity probe: both counters refuse a mistyped /devtools/browsr/ path.

### 6.2 Stricter-only (5): accepted set is a subset of the frozen counter's

- X12-match-strict-to-nonstrict (/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-dialog-r76.mjs:203) — `<=` only widens the greedy matcher accepted-pair set, so matchCount is non-decreasing and the gap fraction can only rise: the mutant refuses a superset, i.e. its accepted set is a subset of the frozen counter's, so no acceptance witness can exist. The battery brackets 0.049 ms (refuse) and 0.051 ms (accept) and both pass; the only boundary 0.05 ms is unreachable for on-grid receipt times (0.1 ms grid) against on-grid priors.
- X14-pairmatch-at-dropped (/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-dialog-r76.mjs:205) — dropping the `at` conjunct in pairMatch only widens matching, so the abs fraction is non-decreasing and the mutant refuses a superset (accepted set subset). Refusal witness R-X14: a prior whose ts equal the receipt's while its at are re-spaced is refused by the mutant (replay-event-timeline) and accepted by the frozen counter.
- X15-gaps-gte-to-strict (/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-dialog-r76.mjs:206) — gaps() drops exactly-50.0 ms gaps. Receipts without a 50.0 gap produce identical gap lists; with one, the receipt's own gap count falls (stricter, ownGaps >= 6) and the only prior gap that can be lost is itself exactly 50.0 (which could only match a receipt gap already in the stricter case). So the accepted set is a subset of the frozen counter's; no acceptance witness can exist.
- X17-prior-walk-realpath-dropped (/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-dialog-r76.mjs:217) — replacing the realpath set with a raw-path set can only shrink the recognised prior set, so more receipts become `outside` (stricter). Refusal witness R-X17: a prior supplied through a symlink is accepted by the frozen counter (realpath match) and refused by the mutant (prior-set-complete).
- X54-legshape-json-stringify (/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-dialog-r76.mjs:405) — canon sorts keys at every depth while JSON.stringify keeps insertion order, so the mutant refuses a superset (accepted set subset); no acceptance witness can exist. Refusal witness R-X54: legShape with one leg record's keys reversed is accepted by the frozen counter and refused by the mutant (legshape-consistency).

## 7. The one invalid mutant (discarded, recorded)

`X34a-window-at-monotonic-dropped`: replacing `&& (i === 0 || (num(events[i - 1].at) && e.at >= events[i - 1].at))` with `)` left `&& )` in the source — a syntax error, not a semantic edit. The battery exited 1 with an unparsable summary and the harness classified it `crashed`; it is excluded from the table and was replaced by `X34-window-prev-ts-compared` (compare `e.at` against the previous event's `ts` instead of `at`; killed by `event-leg-window-order`).

## 8. Honest statement of what this does and does not show

- It does **not** falsify C1-JSDIALOG-R76: the frozen counter still refuses the seven witness receipts, and no mutant was run against the predicate's scored legs.
- It does show the battery is not mutation-complete at conjunct granularity: 23 of 60 semantic edits survive, 7 of them with a receipt the frozen counter refuses and the mutant accepts. The killed set (37) still includes every edit that changes the plan, the host pins, the return-value law, the blocking law, the closure checks and the allow-list gates, so the battery's strength is concentrated where receipts are structurally attacked, not where a single type/table/every→some conjunct is dropped.
- The batch is deterministic: two full runs, 0 outcome diffs, baseline allOk 251/251 both times (`run-results.json` → `results[*].outcome`; `run 1` vs `run 2` comparison reported in §1).

## 9. Housekeeping

- Scratch: all clones, mutant copies, batteries, probe receipts and work dirs lived under `/fast/scratch/hyaku/tabi-r76/R76Mut1/` and were removed after the cited receipts were copied here as `*.receipt.txt`.
- Disk guard checked before the heavy pass: `/fast/scratch/hyaku` 50% used, 409.4G free.
- Tool installs/upgrades: none (node, git and coreutils already on the host); nothing was written to a PATH directory.
- Files here: `report.md`, `mutants.json` (60-row table: edit strings, counter line, outcome, failing cases, evidence), `run-results.json` (raw per-mutant battery summaries from the final batch), `witnesses.json` (18 probes with both counters' exits and finding ids), `run-mutants.mjs` and `probe.mjs` (the harness and the probe script, so the counts can be re-derived), and the probe receipts `*.receipt.txt` (JSON content; also `R-X14-prior-ts-only.prior.receipt.txt`, the crafted prior the refusal witness uses).
