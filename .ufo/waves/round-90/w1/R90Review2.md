# R90Review2 — C1 settle-call attribution attack

Round 90, wave w1, seat R90Review2. Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base `a9f1da08`, instrument freeze D
(`.ufo/waves/round-90/freeze.txt`). Scored receipt `corpus/evidence/round90/chromium-showpicker/receipt.json`
(nonce `tabi-r90-l1-e573334c78fa`, driver pin `ac5a7a5e…7bd7ac8`, fixture pin `5fb1f0f7…7bd7ac8`). Claims read from
`.ufo/waves/round-90/claims.json`; no predicate, counter, pin, prior, threshold or kill rule was edited or re-proposed.

## Answer

**Yes.** A receipt can score `clean` at `checkCount 107` while the four domread legs' `domRead` data was **not**
produced by the `window.__inputs(true)` call carried in their send logs. F1 and F2 below do exactly that and are
accepted (exit 0, 107 checks, zero findings). The counter binds the settle call *syntactically* — exact expression,
exactly one on domread legs, array-index adjacency to the first `window.__state()` expression, exact `params` inside
the ordered plan sequence — and it binds the `domRead` *content* against frozen constants. It never binds the call's
response (there is no response field in the receipt) to `domRead`. The phrase "the domRead data binding" in C1 is
therefore a content check, not an attribution/provenance check.

The syntactic envelope is real: the six listed forgery classes that move, duplicate, re-contextualise or reshape the
call are all refused (F3, F4a, F4b, F5, F6, plus controls F8/F11/F12). What passes is substitution of the *data*, and
replacement of the state *anchor* with a same-expression call of different shape (F7).

## Scoring setup

Baseline under the frozen counting command (no exemption), exactly the claim's leg (a):

```
node scripts/check-showpicker-round90.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --receipt corpus/evidence/round90/chromium-showpicker/receipt.json \
  --expect-driver-sha256 ac5a7a5e56537acc8f61058059294c5f343b236de9b52b8d691995f1e6c49c8d \
  --expect-nonce tabi-r90-l1-e573334c78fa \
  --expect-fixture-sha256 5fb1f0f7806c8f099976078f3f03c9e08d6814346cc29fdccd022f4037bd7ac8 \
  --prior-set .ufo/waves/round-90/controls/c1/prior-set.txt --json
→ exit 0, clean, checkCount 107, findings []
```

Forged receipts were written under `/fast/scratch/hyaku/tabi-r90/R90Review2/` (outside both walked trees,
`.ufo/waves/round-90` and `corpus/evidence/round90`). Because the in-tree scored receipt is then not the receipt under
test, an unexempted run adds one harness finding, `prior-set-complete`, and nothing else. To isolate the settle checks
I scored each forgery with the counter's documented content-bound exemption for the real scored receipt
(`--tree-exempt-sha256 be8a5c38a8f3a6d9edb469f8867b1448a6f120654337a4b31bffa5dfb7d1f4f9`); the exemption resolves to
that in-tree file by sha256 (the counter refuses an unmatched hash via `prior-set-unmatched-exempt`), so it cannot
mask a settle-leg finding. Baseline with the exemption: clean 107.

Proof the exemption is illustrative only: F1 and F2 unexempted exit 1 with findings `["prior-set-complete"]` and no
settle-leg finding (`R90Review2-f1-noexempt.json`, `R90Review2-f2-noexempt.json`). In a real run where the forged
receipt is the tree path, that finding disappears by construction (`selfReal = real(abs(rp))` is excluded from the
walk).

All forgeries keep the receipt's `driverSha256`, `fixture.sha256` and nonce untouched, so the pins still match.

## What the counter actually checks (quoted)

`scripts/check-showpicker-round90.mjs`:

1. Send-log id is positional, not an identity — line 566:

```js
if (log.length < 10 || !log.every((c, i) => isObj(c) && c.id === i + 1 && ALLOWED_METHODS.has(c.method) && isObj(c.params))) sendBad.push(leg.name + ':shape');
```

2. `window.__inputs(true)` is allowlisted on **every** leg — line 550 (the `parent` array passed to `evalAllowed`),
with `contextId` handled only for cross-origin legs — lines 559–560:

```js
const parent = [READY_EXPR(r.nonce), ACT_EXPR, 'window.__inputs()', 'window.__inputs(true)', 'window.__state()', 'window.__closeRecord()', 'window.__late',
...
if (params.contextId !== undefined) return CROSS.has(leg.name) && params.contextId === leg.childContextId && childExprs.has(params.expression);
return parent.includes(params.expression);
```

3. `plan-calls` adds the settle call to the ordered plan and counts/positions it — lines 602–615:

```js
if (p.kind === 'showpicker-domread') want.push({ method: 'Runtime.evaluate', params: { expression: 'window.__inputs(true)', returnByValue: true } });
if (p.intercept && opens.length > 0) want.push({ method: 'Page.setInterceptFileChooserDialog', params: { enabled: true, cancel: true } });
const got = log.filter((c) => c.method === 'Page.setInterceptFileChooserDialog' || c.method === 'Input.dispatchMouseEvent' || c.method === 'DOM.setFileInputFiles' || (c.method === 'Runtime.evaluate' && (c.params.expression === wrapperFor(p.target) || (p.kind === 'showpicker-domread' && c.params.expression === 'window.__inputs(true)'))));
if (p.kind === 'showpicker-domread') {
  const settle = log.filter((c) => c.method === 'Runtime.evaluate' && c.params && c.params.expression === 'window.__inputs(true)');
  if (settle.length !== 1) planBad.push(leg.name + ':settle-eval ' + settle.length);
  const stateIx = log.findIndex((c) => c.method === 'Runtime.evaluate' && c.params && c.params.expression === 'window.__state()');
  const settleIx = log.findIndex((c) => c.method === 'Runtime.evaluate' && c.params && c.params.expression === 'window.__inputs(true)');
  if (!(settleIx === stateIx + 1)) planBad.push(leg.name + ':settle-order');
} else {
  const settle = log.filter((c) => c.method === 'Runtime.evaluate' && c.params && c.params.expression === 'window.__inputs(true)');
  if (settle.length !== 0) planBad.push(leg.name + ':settle-eval-unexpected ' + settle.length);
}
if (!same(got.map((c) => ({ method: c.method, params: c.params })), want)) planBad.push(leg.name + ':sequence ' + JSON.stringify(got.map((c) => c.method)) + ' want ' + JSON.stringify(want.map((c) => c.method)));
```

`same` is `JSON.stringify(a) === JSON.stringify(b)` (line 147), so `:sequence` deep-equals the full `params` of the
settle call, including `returnByValue` and excluding extras.

4. `domRead` is read in exactly one place — lines 832–835:

```js
const desc = arr(leg.domRead).find((x) => isObj(x) && x.id === target);
const st = isObj(leg.stateAfter) ? leg.stateAfter[target] : null;
const toksOk = isObj(desc) && same(desc.acceptTokens, toks) && desc.accept === raw;
const ansOk = isObj(leg.answer) && same(leg.answer.files, [f.name]) && same(st, [[f.name, f.size, f.type, '']]) && arr(leg.pageEvents).filter((e) => e.type === 'read').length === 1 && arr(leg.pageEvents).find((e) => e.type === 'read').ret === 'hex:' + f.hex;
```

The comment at lines 819–822 says the counter binds "the raw string AND the DOM-parsed token list it produces"; the
code binds the self-declared `domRead` fields to constants, never to a call or a call result. `domRead` occurs
elsewhere only in the `LEG_KEYS` key set (line 499); there is no `domReadSendId`/`settleSendId`/`settleResult` field
anywhere in the counter or driver.

5. The receipt cannot carry the missing link. `scripts/chrome-cdp-showpicker-round90.mjs` line 415 pushes
`{ id, method, params }` into `cdpSendLog`; lines 419–423 return only `r.result.result.value`:

```js
const send = (method, params = {}, timeoutMs = 30000) => new Promise((resolve, reject) => {
  const id = ++msgId; cdpSendLog.push({ id, method, params });
...
const evalValue = async (expression, extra = {}) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, ...extra });
  if (r.result.exceptionDetails) throw new Error('eval-exception: ' + JSON.stringify(r.result.exceptionDetails).slice(0, 500));
  return r.result.result.value;
};
```

and line 597 writes the parsed value to `rec.domRead` without recording the send id or result:

```js
if (leg.kind === 'showpicker-domread') rec.domRead = JSON.parse(await evalValue('window.__inputs(true)'));
```

So the honest driver does have a causal link at run time, but it is not serialised; the counter can only check
content. This is the structural reason F1/F2 pass.

6. The fixture function takes no argument. The r90 driver patches the round-78 fixture's
`window.__inputs = function () { … }` (`scripts/chrome-cdp-filechooser-round78.mjs:196`, extracted as the template
at `scripts/chrome-cdp-showpicker-round90.mjs:103–105`) with a fixed 21-id map
(`scripts/chrome-cdp-showpicker-round90.mjs:140`:

```js
const PATCH_INPUTS_TO = "['s', 'm', 'd', 'k', 'f', 'dis', 'disd', 'tes', 'ses', 'txs', 'aw', 'am', 'ap', 'cos', 'aa', 'av', 'a2', 'aws', 'ac', 'au', 'amc'].map";
```

`window.__inputs(true)` therefore returns exactly what `window.__inputs()` returns — the `true` is discarded by the
function body. The r89→r90 difference the counter keys on is only the expression token in the send log; the value is
the same page snapshot. This is what the claim's limit means by "a lane convention", and it is why cross-leg and
cross-round `domRead` substitution is undetectable (F2).

## The six required forgeries — scores

Scratch artefacts were `f*.json` + `f*.out.json`; counter outputs are preserved under
`.ufo/waves/round-90/w1/R90Review2-*.json`. Reference points in the scored receipt: each of the four domread legs has
28 send entries; `window.__state()` at id 23 (index 22), `window.__inputs(true)` at id 24 (index 23, params
`{"expression":"window.__inputs(true)","returnByValue":true}`), dismiss at id 25. Non-domread answer legs have 27
entries with dismiss at id 24. All four honest `domRead` arrays are byte-identical (21 descriptors).

| # | Construct | Mutation (one leg unless stated) | Verdict | Findings |
|---|---|---|---|---|
| F1 | forged `domRead` + copied call id from another leg | `sp89-accept-domread-text`: `domRead` replaced by a fabricated one-entry array `[{"id":"aw","accept":"image/*","acceptTokens":["image/*"]}]`; settle entry replaced by the identical `{id:24,…}` record copied from `sp89-accept-domread-png` | **ACCEPTED** | none (clean 107) |
| F2 | call present, `domRead` taken from another leg | same leg: whole 21-entry `domRead` copied from `sp89-accept-domread-png` | **ACCEPTED** | none (clean 107) |
| F3 | right expression, different `contextId` | settle `params.contextId = 2` (the page's default execution context) | refused | `send-log-allowlist`, `plan-calls` (`:sequence`) |
| F4a | two calls, one the plain/bare expression | duplicate `Runtime.evaluate {"expression":"window.__inputs(true)"}` (no `returnByValue`) inserted after the settle; ids renumbered, coherence fields repaired | refused | `plan-calls` (`:settle-eval 2`, `:sequence`) |
| F4b | plain call in the anchor gap | `window.__inputs()` inserted between the state call and the settle; ids renumbered | refused | `plan-calls` (`:settle-order`) |
| F4c | two calls where one is the plain expression, placed before the anchor | `window.__inputs()` inserted immediately before the state call; ids renumbered | **ACCEPTED** | none (clean 107) |
| F5 | call moved one position later, ids not renumbered | settle and dismiss entries swapped in place, ids untouched | refused | `send-log-allowlist` (`:shape`), `plan-calls` (`:settle-order`, `:sequence`) |
| F6 | same move, ids renumbered around the swap | settle/dismiss swapped, all ids renumbered positionally, coherence fields repaired | refused | `plan-calls` (`:settle-order`, `:sequence`) |

Additional probes, same method:

| # | Probe | Verdict | Findings |
|---|---|---|---|
| F7 | state anchor replaced by a same-expression call of different shape: id-23 `window.__state()` becomes `{expression:'window.__state()', returnByValue:true, awaitPromise:true}` | **ACCEPTED** | none (clean 107) |
| F8 | settle call with an extra param (`userGesture:true`) | refused | `plan-calls` (`:sequence`) |
| F9 | `domRead` token list not lowercased (`["IMAGE/*"]`) | refused | `accept-domread-law` |
| F10 | `domRead = null` | refused | `accept-domread-law` |
| F11 | settle call with bare params `{expression}` (no `returnByValue`) at the correct position | refused | `plan-calls` (`:sequence`) |
| F12 | non-domread leg (`sp88-accept-mimeparam-png`) carries `window.__inputs(true)` in place of its dismiss | refused | `plan-calls` (`:settle-eval-unexpected 1`, `:sequence`) |

### F1 — accepted; forged data plus a copied call record

`sp89-accept-domread-text` keeps a syntactically perfect settle call at id 24, but the record is a copy of
`sp89-accept-domread-png`'s id-24 entry. Because line 566 forces `c.id === i + 1`, a send id is only the array
position; with the four domread logs structurally identical, the copied `{id:24, method:'Runtime.evaluate',
params:{expression:'window.__inputs(true)', returnByValue:true}}` is indistinguishable from the leg's own. The
`domRead` field is a fabricated one-entry array, missing the other 20 descriptors and every `rect`; the real evaluate
over the checked fixture returns all 21 (`PATCH_INPUTS_TO`, driver line 140; `__inputs` takes no parameter, fixture
line 196). The counter still scores clean 107:

- `accept-domread-law` (line 832) finds `{id:'aw', accept:'image/*', acceptTokens:['image/*']}` and passes; the
  `ansOk` half reads `leg.answer`/`leg.stateAfter`/`leg.pageEvents`, which are untouched.
- Nothing compares `domRead` with `fixtureInputs` (21 descriptors), with the other three legs' arrays, or with any
  call result.
- `plan-calls` sees exactly one `window.__inputs(true)` at index 23, `stateIx = 22`, and the exact params; the copied
  record satisfies all three.

This is the direct counterexample to "the domRead data binds to the settle call": the accepted data cannot be the
return value of any call over the checked fixture, yet no check fires.

### F2 — accepted; another leg's data

All four honest `domRead` arrays are `JSON.stringify`-identical, and the r89 receipt's four are identical to the r90
four as well. This is structural, not incidental: the fixture's `__inputs` ignores its argument and maps the same fixed
21 ids, so every call in every leg and round returns the same snapshot (the snapshot is a property of the fixture page,
not the call). Copying `sp89-accept-domread-png`'s entire array into `sp89-accept-domread-text` yields clean 107: the
text leg's `desc` lookup finds `aw` with the same frozen values. There is no per-leg provenance in `domRead` and no
send id to attach one to.

### F3 — refused; contextId

`evalAllowed` line 559 rejects any `contextId` on a non-CROSS leg, so the run has
`sp89-accept-domread-text:expression` in `send-log-allowlist`. The settle call also fails `:sequence` because its
`params` now carry the extra key. Note the diagnostic: the `:sequence` detail prints only method names (line 615), so
its "got" and "want" method lists are identical; the only visible clue is the finding id. Runtime truth (the call
would target the same page context) is irrelevant — the counter refuses the explicit context form.

### F4a/F4b/F4c — the plain-expression family

F4a inserts a second `window.__inputs(true)` with bare params (`{expression}` only). The count rule
(`settle.length !== 1`, line 607) reports `:settle-eval 2`; the extra entry is also in `got`, producing `:sequence`
with two `Runtime.evaluate` entries in a row. Refused.

F4b inserts `window.__inputs()` (the plain expression, no `true`) between the state call and the settle. It is
allowlisted (line 550) and is not in `got` (line 604), so the sequence check is silent; but the adjacency rule
(line 609–610) now sees `stateIx + 1 ≠ settleIx` and reports `:settle-order`. Refused.

F4c inserts the same plain call immediately **before** the state call. Both the state call and the settle shift one
slot later, so `settleIx === stateIx + 1` still holds; the plain call is invisible to `got`; ids are renumbered and the
coherence fields repaired. Clean 107. Consequence: the counter cannot distinguish the call that produced the data from
the plain `window.__inputs()` call; the honest log already carries one at id 9, and arbitrary extra plain calls are
unbounded (`parent` allows them, no count rule, `got` ignores them). The only real constraint is that nothing
`got`-filtered sits between the first state call and the settle, and nothing `got`-filtered is out of order.

### F5/F6 — moved one position later

F5 swaps the settle and dismiss entries without renumbering: the `id === i+1` shape rule fails (`:shape`), the settle
is now after the dismiss (`:settle-order`), and `got` yields dismiss-before-settle (`:sequence`). Refused.

F6 repeats the swap and renumbers all ids positionally, repairing `dismissSendId` to the dismiss's new id. Shape and
allowlist pass, but `stateIx`/`settleIx` are array indices: settle is at index 24, first state at 22, so
`stateIx + 1 = 23 ≠ 24` (`:settle-order`), and `got` still sees dismiss then settle (`:sequence`). Refused. So the
order rule survives id renumbering around the swap; what it actually constrains is array position, not send-id
identity.

## Additional findings

### F7 — accepted: the state anchor is expression-only

Replacing the first `window.__state()` call (id 23) with
`{id:23, method:'Runtime.evaluate', params:{expression:'window.__state()', returnByValue:true, awaitPromise:true}}`
scores clean 107. `stateIx` is a `findIndex` on the expression (line 608); the state call is excluded from `got`
(line 604), so its params are never deep-equalled; and no rule counts `window.__state()` occurrences. Consequences:

- The clause "immediately after the settle `window.__state()` evaluate" cannot identify *the settle* state read: any
  first expression-matching state call anchors the settle. A forger can replace the driver's settle state call with a
  different (allowlisted-expression) call of different shape, and the counter accepts it.
- `stateAfter` is a separate field; its values are shape-checked, but not tied to the state call either. F7 leaves
  `stateAfter` untouched, so no data check notices the anchor change.

This matters for the claim's wording because "the settle window.__state() evaluate" is not a distinguishable object
in the receipt.

### F8/F11 — the settle call itself is shape-bound

An extra param (`userGesture`, F8) or bare params (F11) are refused by `:sequence` (the deep-equal at line 615). So
the settle call, unlike the state anchor, must carry exactly `{expression,returnByValue:true}`. That is the strongest
part of the binding. Its diagnostic detail, however, prints only methods, so both refusals display identical `got`
and `want` method arrays.

### F9/F10 — the data content is genuinely bound

Wrong token casing (`["IMAGE/*"]`) and `domRead = null` are refused by `accept-domread-law`. The four r89 token lists
are content-enforced as the claim says. The binding is to the constants, not to any call.

### F12 — the "forbids it on every other leg" branch works

A non-domread leg carrying `window.__inputs(true)` (in place of its dismiss) is refused with
`sp88-accept-mimeparam-png:settle-eval-unexpected 1` plus `:sequence`. The claim's "forbids it on every other leg" is
verified.

## What this acceptance means for C1's wording

C1 type, clause by clause:

1. "The four domread legs' send logs carry a distinct `Runtime.evaluate` of `window.__inputs(true)` immediately after
   the settle `window.__state()` evaluate." — True of the scored receipt and enforced by F3–F6/F11/F12 for the call's
   syntax. But "the settle `window.__state()`" is not identifiable: any first state-expression call anchors the
   adjacency, with unchecked params (F7). The word "distinct" is enforced only as a separate expression entry, not as
   a causal distinction from the state read; the `true` token is likewise lexical, since the fixture function ignores
   its argument (point 6 above), so `window.__inputs()` and `window.__inputs(true)` return identical data.
2. "the counter's `plan-calls` requires that call on domread legs (exactly one, in that position) and forbids it on
   every other leg." — Verified: lines 606–613; F4a shows the count, F5/F6 show the position, F12 shows the
   other-legs branch.
3. "and includes it in the ordered plan sequence." — Verified: lines 602/604/615; F8/F11 show the params are
   deep-equalled.
4. "The domRead data binding and the four r89 token lists are unchanged." — The token lists are content-enforced
   (F9/F10). The "data binding" is **not** an attribution to the call: F1/F2 pass with data that no call produced or
   that another leg produced. The receipt has no evaluate-response field; the driver drops the CDP response body
   (driver 415, 419–423). So the honest reading is "the `domRead` field must carry the frozen token lists for its
   target", not "the `domRead` came from this call". The counter comment at 819–822 ("the token list it produces")
   overstates the implemented check.

The claim's `limit` block covers the expression being a lane convention, the acceptance-vs-dialog-filter distinction,
the colour arm's file-chooser metric, and the constant-offset replay escape; it does not name the call-versus-data
provenance gap. Nothing here asks for an amendment; it bounds what "the settle call is bound" can support.

## Residual risk / verification gaps

- **Substitution class is unkilled by the battery.** `scripts/negatives-showpicker-round90.mjs` has
  `plan-calls-settle-call` (change the expression, line 190), `plan-calls-settle-order` (swap settle with state,
  renumber, line 191), and four `accept-domread-law` mutations (token list, raw accept, read bytes, state; lines
  363–366). None mutates provenance: no case for a fabricated `domRead` that matches the frozen tokens, a `domRead`
  copied from another leg/round, an extra plain call, or a reshaped state anchor. F1/F2/F4c/F7 are outside the
  battery's coverage; the kill-power gate therefore cannot speak to them.
- **Counter --selftest covers absence only.** Its second case strips the `window.__inputs(true)` call (lines 39–58)
  and expects `plan-calls`; there is no selftest case for data substitution.
- **Diagnostics.** `:sequence` prints method arrays only (line 615). Param-only mismatches (F3, F8, F11) produce a
  finding whose "got" and "want" method lists are identical, so the printed detail does not localise the defect.
- **Scoring harness interaction.** Forged receipts outside the two walked trees require the content-bound
  `--tree-exempt-sha256` for the in-tree scored receipt, otherwise the only extra finding is `prior-set-complete`.
  The exemption is hash-enforced and resolves to the real scored receipt; I checked that it does not mask any
  settle-leg finding (unexempted F1/F2 show only `prior-set-complete`). Counter outputs copied into
  `.ufo/waves/round-90/w1/` use schema `tabi-chrome-cdp-showpicker-r90-counter`, so they are ignored by
  `prior-set-complete`; the frozen command re-run after copying still returns clean 107 (verified).
- **Content is fixture-global.** The four `domRead` arrays (and the r89 ones) are byte-identical, so content can never
  establish call provenance, even in principle, without a serialised response.

## Files

Counter outputs preserved under `.ufo/waves/round-90/w1/`:
`R90Review2-frozen-command.json`, `R90Review2-baseline-exempt.json`,
`R90Review2-baseline-outside-trees.json`, `R90Review2-nowork-control.json`,
`R90Review2-f1-…` through `R90Review2-f12-…json`, plus `R90Review2-f1-noexempt.json`,
`R90Review2-f2-noexempt.json`. The forged input receipts and the scratch tree
`/fast/scratch/hyaku/tabi-r90/R90Review2/` were deleted after the outputs were copied, per contract.

No tools were installed or upgraded; no pacman transaction was run; no git/jj mutation was made.
