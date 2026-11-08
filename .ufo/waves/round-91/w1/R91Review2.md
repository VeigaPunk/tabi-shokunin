# R91Review2 — origin-attribution attack on C1's postMessage proxy (tabi round 91, wave w1)

Seat: R91Review2 (leaf reviewer). Lane: `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base `b1d8f07b`.
Predicate under attack: `C1-SHOWPICKER-PROXY-R91`, leg (a) only.
Instruments: counter `scripts/check-showpicker-proxy-round91.mjs`
sha256 `f2f052f27c3a0e18ecef3217fc902c2897c59ab9f175d314ba66d526a7edb03e`; driver
`scripts/chrome-cdp-showpicker-proxy-round91.mjs`
sha256 `343eb0f202d9b37a21d948adf0f5eff84fbebf8c195ab99c272fd66580e33015`; scored receipt
sha256 `15e2167ea64b638e28fd8d8b3bba3170bd4d48becc2dc27c54039885c39d35c8`, nonce
`tabi-r91-l1-1d073adc0b8d`. Freeze digest at the time of review: D3 `12cbe8a0267f`.

No instrument was modified, no git/jj mutation was run, no subagent was dispatched. Every
mutant is a full receipt written under the seat scratch root and scored by the unchanged
counter with the frozen counting command:

```
node scripts/check-showpicker-proxy-round91.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --receipt <mutant>.json \
  --expect-driver-sha256 343eb0f202d9b37a21d948adf0f5eff84fbebf8c195ab99c272fd66580e33015 \
  --expect-nonce tabi-r91-l1-1d073adc0b8d \
  --expect-parent-sha256 a6ecf367adcfd31e3e54e82794db09e2f9845b8d910eb465ab47ca022b778bf0 \
  --expect-same-sha256 01380a98976c3fd8963a907a70f1f14d4d84a7b0eb94d088995919331775fe36 \
  --expect-child-sha256 01380a98976c3fd8963a907a70f1f14d4d84a7b0eb94d088995919331775fe36 \
  --prior-set .ufo/waves/round-91/controls/c1/prior-set.txt --json
```

Baseline (M00 = the scored receipt unchanged): **`clean`, checkCount 30, findings 0, exit 0** —
leg (a) reproduces.

## 1. What the counter actually binds around the proxy

The proxy path is carried by four blocks. Quote (counter line numbers):

- `proxy-law` (375–386):

```js
for (const l of legs) {
  if (!isObj(l) || l.mode !== 'proxy') continue;
  const log = arr(l.proxyLog);
  const replies = arr(l.replies);
  if (log.length !== 1 || !isObj(log[0]) || log[0].origin !== PARENT_ORIGIN || log[0].cmd !== 'showpicker' || log[0].target !== l.target) proxyBad.push(l.name + ':log ' + JSON.stringify(log));
  const wantReplyOrigin = l.frame === 'so' ? PARENT_ORIGIN : CHILD_ORIGIN;
  if (replies.length !== 1 || !isObj(replies[0]) || replies[0].origin !== wantReplyOrigin || !isObj(replies[0].data) || replies[0].data.cmd !== 'result') proxyBad.push(l.name + ':reply ' + JSON.stringify(replies));
  else if (!same(replies[0].data.result, l.proxy)) proxyBad.push(l.name + ':reply-result');
  if (!isObj(l.proxy) || l.proxy.target !== l.target || l.proxy.origin !== PARENT_ORIGIN) proxyBad.push(l.name + ':proxy-shape ' + JSON.stringify(l.proxy));
}
```

- `law` (352–361) pins the proxy object to the frozen table, target and origin:

```js
  if (w.proxy !== undefined && !same(l.proxy, { ...w.proxy, target: l.target, origin: PARENT_ORIGIN })) spBad.push(l.name + ':proxy ' + JSON.stringify(l.proxy));
```

- `chooser-event-law` (343–348) binds the chooser to the child **frame** and to a ±2 window
  of send ids:

```js
    if (c.params.frameId !== l.childFrameId) evBad.push(l.name + ':frame');
    const act = l.mode === 'direct' ? l.directSendId : l.postSendId;
    if (!(Number.isInteger(c.afterSendId) && c.afterSendId >= act && c.afterSendId <= act + 2)) evBad.push(l.name + ':binding ' + c.afterSendId + ' act ' + act);
```

- `send-log-allowlist` (277–281) proves the *text* of the evaluations, not their targets:

```js
  else if (!log.every((c) => c.method !== 'Runtime.evaluate' || evalAllowed(l, c.params))) sendBad.push(l.name + ':expression');
```

The driver side is origin-only, and records no sender:

```js
// driver 114-115
  window.__log.push({ origin: e.origin, cmd: d.cmd || null, target: d.target || null, at: performance.now() });
  if (d.cmd !== 'showpicker' || e.origin !== ${JSON.stringify(parentOrigin)}) return;
```

No `e.source` identity is compared (the only `e.source` use is the reply target, driver 120).
The child's log entry is `{origin, cmd, target, at}` — there is no sender frame id, and no
`targetOrigin` field anywhere in the receipt.

## 2. Forgeries scored (29 receipts, 15 refused / 14 accepted)

Scratch: `/fast/scratch/hyaku/tabi-r91/R91Review2/` (`M00`…`M28.json`,
`all-results.json`); archive copy under `.ufo/waves/round-91/w1/R91Review2/`.

| # | Manipulation of the scored receipt | Counter |
|---|---|---|
| M00 | scored receipt unchanged | **clean (exit 0)** |
| M01 | proxy+log+reply copied from `sp91-so-proxy-childact` into `sp91-xo-proxy-file-childact`; only the reply origin adjusted; `proxySendId` rerouted to a `window.__state()` read | **clean (exit 0)** |
| M02 | the child `JSON.stringify(window.__log)` read replaced by an allowed `window.__state()` evaluation; the `proxyLog` value kept | **clean (exit 0)** |
| M03 | parent reply only: `proxy = null` | refused (exit 1) | `law`, `proxy-law`, `prior-set` |
| M04 | proxy log right origin, wrong target (`dt` on a file leg) | refused (exit 1) | `proxy-law` |
| M05 | reply origin set to the child origin on a same-origin leg | refused (exit 1) | `proxy-law` |
| M06 | same-origin spoof: reply origin set to the parent origin on the cross-origin leg | refused (exit 1) | `proxy-law` |
| M07 | `elements.xo.s.accept = "image/png"`, every leg copy changed, `elements.so` untouched | refused (exit 1) | `same-element-law` |
| M08 | the same change on **both** `so` and `xo` and every leg copy | **clean (exit 0)** |
| M09 | chooser `params.frameId` set to the cross-origin frame on a same-origin leg | refused (exit 1) | `chooser-event-law`, `prior-set` |
| M10 | M09 plus `childFrameId` patched to the cross-origin frame | refused (exit 1) | `frame-tree` |
| M11 | answer delivered to the parent: `childState = []`, `parentState = [[answer,22,'text/plain']]` | refused (exit 1) | `state-law`, `prior-set` |
| M12 | `answerSet`/chooser keep node 10, but the `DOM.setFileInputFiles` send targets node 999 | **clean (exit 0)** |
| M13 | `answerSet.files` and the send's `files` rerouted to another directory (same basename) | **clean (exit 0)** |
| M14 | post expression text with `targetOrigin: "*"` | refused (exit 1) | `send-log-allowlist`, `plan-calls` |
| M15 | a chooser fabricated on `sp91-xo-proxy-file-parentact` (the "opens nothing" leg) + one appended dismiss send | refused (exit 1) | `plan-calls`, `prior-set` |
| M16 | two choosers on `sp91-so-proxy-childact` (the law says exactly one) | refused (exit 1) | `prior-set` only |
| M17 | `chooser.afterSendId = postSendId + 2` (window edge) | **clean (exit 0)** |
| M18 | `chooser.afterSendId = postSendId + 3` | refused (exit 1) | `chooser-event-law` |
| M19 | proxy log origin = child origin with a successful proxy on the xo leg | refused (exit 1) | `proxy-law` |
| M20 | chooser `mode` flipped to `selectMultiple` on a single-file chooser | **clean (exit 0)** |
| M21 | chooser `backendNodeId = 999` on a non-answer leg (chooser owned by no known element) | **clean (exit 0)** |
| M22 | answer leg: chooser, `answerSet` and the send all agree on `backendNodeId 777` | **clean (exit 0)** |
| M23 | answer leg: chooser node 777 while `answerSet` keeps 10 | refused (exit 1) | `state-law` |
| M24 | same-frame copy: proxy+log+reply copied verbatim from `sp91-xo-proxy-file-answer` into `sp91-xo-proxy-file-childact` (zero adjustment) | **clean (exit 0)** |
| M25 | `proxyLog[0].at = 0` (before the leg action) | **clean (exit 0)** |
| M26 | `proxy.origin` set to the child origin (message the child must have rejected) | refused (exit 1) | `law`, `proxy-law` |
| M27 | the child `window.__proxy` read's `contextId` replaced by `999999` (no such context) | **clean (exit 0)** |
| M28 | the same read rerouted into the **parent** context (`window.__proxy` is undefined there) | **clean (exit 0)** |

## 3. Findings, by severity

### H1 — The child-side proxy result has no bound read: `proxyLog` and `proxy` are asserted, not observed

`send-log-allowlist` only requires that every `Runtime.evaluate` be a member of an allowlist
(counter 260–272, 277–278); it never requires the child reads to be present, and never checks
`contextId` against the recorded child context (`evalAllowed` returns on membership only:
`if (p.contextId !== undefined) return child.includes(p.expression);`). The ids that would
bind the read are dead fields: `proxySendId` and `proxyLogSendId` are declared in `LEG_KEYS`
(counter 188) and **never read anywhere else in the file**.

- M02 (accepted): the child `window.__log` read is replaced by `window.__state()`; the
  `proxyLog` value stays and the counter is clean.
- M27/M28 (accepted): the `window.__proxy` read is attributed to a nonexistent context and,
  separately, to the parent context, where `window.__proxy` cannot have that value.

Consequence: `proxy-law`'s evidence chain (`log`/`replies[0].data.result`/`proxy` agree, all
three law-shaped) is satisfiable with no child evaluation behind it. The receipt cannot show
that the proxy value was read from the child at all, let alone that the read followed the post.

### H2 — Cross-leg copying of a proxy result+log+reply is invisible

`law` pins the value; `proxy-law` pins origin/target/self-agreement. Nothing pins provenance.

- M24 (accepted): the whole triple copied byte-for-byte from the sibling `sp91-xo-proxy-file-answer`
  leg (same frame, same target) — zero adjustment needed.
- M01 (accepted): copied across frames from `sp91-so-proxy-childact`; the single differing
  field is the reply origin, which is derived from the leg's own `frame` field.

So the counter proves "this leg's proxy record equals the law for its name", not "this leg's
run produced it".

### H3 — `DOM.setFileInputFiles` is completely unvalidated: the answer target and path are unbound

`actionFor` keys on the method name only (counter 300: `if (c.method === 'DOM.setFileInputFiles') got.push({ k: 'answer', id: c.id });`),
and `state-law` (393–397) binds `answerSet.backendNodeId` to `chooser.params.backendNodeId`.

- M12 (accepted): the send's `params.backendNodeId = 999` while `answerSet`/chooser claim 10 —
  the answer was delivered to a node that is not the chooser's node, and the counter is clean.
- M13 (accepted): the send's and `answerSet`'s `files` rerouted to another directory; only
  `path.basename` is checked (counter 394).
- M22 (accepted): chooser, `answerSet` and the send all agree on `777`; no element identity
  ties `777` to the child's `#s` (the `elements` record carries no node ids).

C1's "DOM.setFileInputFiles on that chooser delivers … to the child input" therefore rests on
the *state* read being honest; the command's target is not evidence. The state read itself is
bound only by name/size/type (counter 393) plus the answer descriptor hash (397), not by content.

### M1 — "exactly one chooser owned by that frame": frame is bound, count and element are not

- Frame ownership is genuinely enforced (M09 refused by `chooser-event-law`; M10, which repairs
  `childFrameId`, refused by `frame-tree` because `l.childFrameId === (l.frame === 'so' ? l.soFrameId : l.xoFrameId)`).
- Count is not a named check. `LAW[l.name].choosers` is used only to *derive* the expected
  dismiss (counter 318), and the law comparator (356–359) never looks at it.
- M16 (accepted by every named check, refused only by `prior-set`) adds a second chooser.
  `prior-set` catches it only through its comparative snapshot
  (`choosers: arr(l.choosers).length`, counter 444) against files the counter never hashes.
- M21/M20 (accepted): the chooser's `backendNodeId` may be any integer on a non-answer leg
  (`!Number.isInteger(c.params.backendNodeId)` is the only constraint, counter 344), and `mode`
  accepts `selectMultiple` for a single-file input.

The "opens nothing" arm of law (2) *is* enforced, but only incidentally: on a `LAW.choosers: 0`
leg, `plan-calls` derives `want` from the LAW (no dismiss slot, 318) while the dismiss requirement
derives from the receipt's own choosers (330). M15 (fabricated chooser on
`sp91-xo-proxy-file-parentact`) is refused with `sequence [...] want [...]`.

### M2 — "accepts only the served parent origin" cannot distinguish the parent document from any same-origin document

The acceptance predicate is `e.origin !== parentOrigin` (driver 115); `e.source` is never
compared, and the log records no sender (driver 114). On the same-origin legs the child's own
origin *is* the parent origin, so the origin test is satisfied by the sibling iframe as well as
by the top document, and the receipt has no field that could express the difference. Even for
the cross-origin leg, a message from the same-origin child frame would carry
`origin === PARENT_ORIGIN` and be accepted.

This is inexpressible as a mutant — that is the point: no receipt produced by this driver can
evidence *who* sent the message. The strongest reading the counter supports is "a message whose
origin string is the served parent origin".

### L1 — `targetOrigin` is lexical only

M14 (a `"*"` in the send-log expression) is refused by `send-log-allowlist` + `plan-calls`, but
the receiver cannot observe `targetOrigin` at all: `event.origin` is the sender's origin
regardless of `"*"`, and the child's log entry does not carry it (driver 114). A run that sent
`"*"` and logged the allowlisted string produces a receipt identical to M00, which is clean.
The counter's refusal is a rejection of a string, not of a delivery scope.

### L2 — The same-element record is self-consistent only

`sameEl` (counter 232) compares `so` against `xo` attribute by attribute; `same-element-law`
(234) additionally requires every leg's copy to equal the receipt record. M08 (accepted) changes
`accept` on both frames and every leg copy — nothing binds `accept`/`rect` to the pinned fixture
bytes. The counter never hashes the lane files: `fixture-pins` (198) compares receipt fields to
the CLI arguments, and the only `sha256` use in the counter is the answer descriptor (397).

### L3 — 21 of 78 leg fields are shape-only

Fields present in `LEG_KEYS` and never referenced outside it:
`actionAt childPadError childSha256 chooserWaitMs crossError crossResult directError directResult
dismissError dismissResult interceptError interceptResult interceptSendId parentPadError
parentSha256 postError postResult proxyLogSendId proxySendId replySendId sameSha256`.

Two of these matter here: `postResult`/`postError` (the post's own CDP result is never checked,
so a failed post is indistinguishable from a successful one) and the per-leg
`parentSha256`/`sameSha256`/`childSha256` (only leg 0's values reach `receipt.fixture`, driver
549–551; the other 14 legs' recorded fixture hashes are unbound).

## 4. What the counter refuses correctly (credit)

Value and identity deviations from the frozen LAW are refused with the right check: null proxy
with the reply intact (M03: `law`+`proxy-law` on `reply-result`/`proxy-shape`), wrong log target
(M04), wrong reply origin in both directions (M05/M06), cross-origin accept changed alone (M07),
chooser on the wrong frame (M09/M10), a state claim that moves the answer to the parent (M11),
a chooser on the zero-chooser leg (M15), an out-of-window `afterSendId` (M18), and a proxy value
whose embedded origin is not the parent origin (M19/M26). The error identities of laws (1)/(4)
are pinned to exact strings and are not forgeable without tripping `law`/`proxy-law`.

## 5. What the accepted classes mean for C1's wording

The counter is a strong **law-conformance and internal-consistency** checker. It is not a
**provenance** checker, and C1's type text claims provenance in three places:

1. "a `window.postMessage` proxy in each child **accepts only the served parent origin**" — the
   measured predicate is `e.origin === parentOrigin` with no sender identity (driver 114–115).
   Supported reading: *a message whose origin is the served parent origin*. The
   parent-document producer, and "only the parent" at frame granularity, are not measured and
   cannot be expressed by the receipt format.
2. "its proxy call returns undefined and opens **exactly one chooser owned by that frame**" —
   frame ownership is enforced; *exactly one* is not (M16), and the chooser's owning element is
   unconstrained (M20/M21/M22).
3. "`DOM.setFileInputFiles` **on that chooser** delivers tabi-r91-answer.txt (22 B) **to the child input**"
   — the child-side state read is law-shaped, but the send's target node and file path are
   unvalidated (M12/M13), so "on that chooser" and "to the child input" are assertions the
   counter cannot check.

In one sentence: a receipt can pass the counter while the child-side proxy result was not
produced by the parent's `postMessage` — by carrying a result copied from another leg, by
carrying a log whose reading evaluation never ran, or by attributing the read to a context that
cannot hold that value; and it can pass while the answer command targeted a different node.
The counter's verdict is therefore correctly read as "the per-leg record conforms to the frozen
15-leg law table and is self-consistent", not as "the parent's post caused the child's result".

## 6. Residual risk and verification gaps

- **`prior-set` carries more weight than its integrity supports.** It is the only gate that
  catches a second chooser (M16), a changed chooser frame (M09), a changed state (M11) and a
  fabricated chooser (M15), through `lawOf`'s comparative snapshot (444). The prior files are
  read with `JSON.parse` only (counter 178); the counter never hashes them, although freeze.txt
  pins `probe4.json 12b5ae6f…` and `probe5.json 2d76b87d…`. A receipt plus rewritten priors
  would pass those four mutants.
- **Freeze-file / claims-pin drift (outside this milestone, for the integration owner).**
  `freeze.txt` pins `scripts/selftest-r91-gates.mjs` at `988c18e5…` and
  `scripts/check-record-drift-round91.mjs` at `e2e51c6b…` (both match the current files);
  `claims.json`'s `pins` block still carries `e151c99a…` and `466496e1…`. Separately,
  `freeze.txt`'s comment line names the scored nonce as `tabi-r91-l1-12cbe8a0267f`, while
  `claims.json` and the seat target pin `tabi-r91-l1-1d073adc0b8d`. I verified
  `12cbe8a0267f` is the D3 digest (sha256 of the six pin lines joined with a trailing newline),
  i.e. the comment reflects the D3 freeze, not the scored nonce. The counter enforces the nonce
  through `--expect-nonce`, so leg (a) is unaffected; the two documents disagree textually.
- **Not tested:** C1 legs (b)/(c), the battery, the kill-power run, and the counter `--selftest`
  were not re-run (outside this milestone; `--selftest` also writes outside the seat scratch).
  I did not run a browser: every mutant is a receipt-level mutation, which is exactly the
  surface the counter occupies. I did not assess whether the live driver ever sends `"*"`; I
  only show the counter cannot tell.
- **Fixture bytes are never recomputed.** All fixture integrity in this counter is
  receipt-vs-CLI-argument; `elements` attributes are record-vs-record.

## 7. Artifacts

Archived to `.ufo/waves/round-91/w1/R91Review2/`: `M00.json`…`M28.json` (29 mutant receipts),
`all-results.json` (exit/verdict/findings per mutant), `forge.mjs`, `forge2.mjs`, `forge3.mjs`,
`forge4.mjs`, `score-all.mjs`, `detail.mjs`. Scratch root
`/fast/scratch/hyaku/tabi-r91/R91Review2` was deleted after the copy.
No host package install was needed; no pacman transaction was attempted.
