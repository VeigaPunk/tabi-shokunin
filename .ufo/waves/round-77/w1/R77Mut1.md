FINDINGS

# R77Mut1 — mutation probe of the round-77 C1 counter (round 77, wave w1)

Seat: `R77Mut1` (mutation tester). Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base
`1320d428f0c0957b46d6969b59c122fd69199331`, instrument digests commit
`dcdf582add5871535dee5ebc07560b020017cf2d`. Target: the r77 counter for capability
`chromium-file-chooser-linux` (`scripts/check-filechooser-r77.mjs`, sha256
`ac17ff8dda4661e2e6217831158de5e1e19a584f3f7dad918b77faee6bab4aeb`, 183 declared checks) against
its own battery (`scripts/negatives-filechooser-r77.mjs`, sha256
`3925fe2a5f772123fd9d707c52829088ab7dcaec8d9aad70265c2528eef103ff`) on the committed scored receipt
`corpus/evidence/round77/chromium-file-chooser/receipt.json` (nonce `tabi-r77-l1-dcdf582add58`,
pinned driver sha256 `9954db0703e03aed157c4be9b13f678b1bc1a6240b4bf88491d0e1f5286558a6` beside it).

**Verdict word: FINDINGS.** 69 single-edit semantic mutants of the counter were built (68 not present
in the frozen kill-power semantic list; 1 is a semantic duplicate and is excluded from that count).
The frozen 336-case battery kills 20 by a named case and 7 more by refusing the honest receipt; **42
survive it unchanged**. Of those 42, 34 are killed by a witness case I injected into a battery copy and
verified in both directions, 6 are argued equivalent, and 2 remain unwitnessed. No predicate,
threshold, pin, prior, counter or kill-rule amendment is proposed — this is a coverage measurement of
the battery, nothing more.

## What was run (all measured, exit codes as observed)

| step | command | result |
|---|---|---|
| baseline | `node <copy>/negatives-filechooser-r77.mjs --lane <lane> --real <receipt> --expect-driver-sha256 9954db07… --expect-nonce tabi-r77-l1-dcdf582add58 --prior-set <.ufo/waves/round-77/controls/c1/prior-set.txt> --laundered <3 degenerate receipts> --work <scratch>/w0 --json` | exit **0**, `allOk:true`, 336/336 cases (323 refuse, 10 must-accept, 3 laundered), 183 check ids, `coverageGap:0`, `failed:0` |
| mutant batch 1 | `JOBS=4 node run.mjs` — 57 mutants, each a copy of the counter + battery + pinned driver in its own dir, battery run with `--first-failure --jobs 4` | 19 killed, 5 killed-positive, 33 survived, 0 crashed |
| mutant batch 2 | `JOBS=4 node run2.mjs` — 12 further mutants | 1 killed, 2 killed-positive, 9 survived, 0 crashed |
| witness verification | `JOBS=4 node witness-run.mjs` — each claimed case appended to a battery copy, that copy run twice: pristine counter (control) and mutated counter (probe) | control 34/34 `allOk`; probe failed **exactly** the claimed case 34/34 → 34 `KILLED-BY-WITNESS` |

Outputs, all in `.ufo/waves/round-77-seats/R77Mut1/`: `mutants.json` (every mutant, its edit strings,
outcome, failed cases, equivalence argument, witness spec and witness result), `witnesses.json` (the 34
witness runs with control and probe finding ids) and `baseline-battery.json` (the unmutated battery
summary). Scratch: `/fast/scratch/hyaku/tabi-r77/R77Mut1/` (removed at the end).

A mutant's `batteryExit`/outcome is from a copy of the battery run **by path** with the pinned driver
beside the counter, exactly as the frozen kill power does it. No file was written under
`.ufo/waves/round-77/` or `corpus/evidence/round77/` other than this prose report and its copy at
`.ufo/waves/round-77/w1/R77Mut1.md`; every JSON and every crafted case receipt lives under
`.ufo/waves/round-77-seats/R77Mut1/` or the scratch dir (removed at the end).

## The 69 mutants

Axes: `typed()` / `fileTriple` / `errOk` / `evShapeOk`, the leg-record checks, `frame-binding`, the
prior-set walk, the send allow-list, `AT_TARGET`/`OPENS`/`MULTIPLE`, the selection model, the
cross-leg laws, the mark/seq/window checks, the timeline thresholds, `planCalls`, host/fixture binding
and teardown. Single edit per mutant; each edit string occurs exactly once in the counter bytes
(checked before the run; one candidate was rejected for 0 occurrences and rewritten as
`WIN1-event-order-strict`). None is a `check()` force-true. Edit strings below are truncated at 44 and
34 characters; `mutants.json` → `edit.from` / `edit.to` holds the exact bytes.

| mutant | edit (from → to) | battery | status | named case / witness |
|---|---|---|---|---|
| `T1-filetriple-length-ge` | `f.length === 3 && typeof f[0] === 'string'` → `f.length >= 3 && typeof f[0] === '` | survived | killed-by-witness | event-types-file-quad |
| `T2-filetriple-size-nonneg-drop` | `f[1] >= 0 && typeof f[2] === 'string'` → `typeof f[2] === 'string'` | survived | killed-by-witness | event-types-file-size-negative |
| `T3-errOk-and-to-or` | `e === null \|\| (isObj(e) && same(Object.keys(` → `e === null \|\| (isObj(e) \|\| same(Ob` | survived | killed-by-witness | leg-records-error-code-float |
| `T4-errOk-code-number` | `Number.isInteger(e.code) && typeof e.message` → `num(e.code) && typeof e.message ==` | survived | killed-by-witness | leg-records-error-code-float |
| `T5-evshape-aftersend-num` | `Number.isInteger(e.afterSendId) && EVK[e.met` → `num(e.afterSendId) && EVK[e.method` | survived | killed-by-witness | cdp-event-log-aftersend-float |
| `T6-event-type-set-dropped` | `typeof e.type === 'string' && EVENT_TYPES.ha` → `typeof e.type === 'string' && num(` | killed | killed | event-types-unknown-type |
| `T7-ts-nonneg` | `num(e.ts) && e.ts > 0 && num(e.at) && e.at >` → `num(e.ts) && e.ts >= 0 && num(e.at` | survived | killed-by-witness | event-types-ts-negative |
| `T8-half-null-xy-dropped` | ` && (e.x === null) === (e.y === null)` → `` | survived | killed-by-witness | event-types-y-null-buttons-set |
| `T9-read-ts-order-dropped` | ` && typeof e.ret === 'string' && e.ts <= e.a` → ` && typeof e.ret === 'string'` | killed | killed | event-types-read-ts-after-at |
| `T10-read-files-one-to-ge` | `Array.isArray(e.files) && e.files.length ===` → `Array.isArray(e.files) && e.files.` | survived | killed-by-witness | event-types-read-two-files |
| `L1-legkeys-subset` | `if (!same(Object.keys(l).sort(), LEG_KEYS)) ` → `if (Object.keys(l).length < LEG_KE` | killed | killed | leg-records-extra-key |
| `L2-elapsed-number-dropped` | `if (!num(l.elapsedMs) \|\| l.elapsedMs < 290) ` → `if (l.elapsedMs < 290) bad('elapse` | killed | killed | leg-records-elapsed-string |
| `L3-object-subtype-dropped` | ` \|\| tr.subtype !== 'node'` → `` | survived | killed-by-witness | leg-records-object-subtype |
| `L4-object-id-empty-dropped` | ` \|\| tr.objectId === ''` → `` | survived | killed-by-witness | leg-records-object-id-empty |
| `L5-set-adjacency-dropped` | `if (p.kind === 'set-object' && l.setSendId !` → `` | survived | killed-by-witness | leg-records-set-not-adjacent |
| `L6-set-before-trigger-strict` | `l.setSendId <= l.triggerSendId` → `l.setSendId < l.triggerSendId` | survived | equivalent | equivalent (argued) |
| `L7-setresult-shape-loose` | `if (l.setError === null ? !same(l.setResult,` → `if (l.setError === null ? !isObj(l` | killed | killed | leg-records-set-result |
| `L8-intercept-params-loose` | `!same(c.params, p.intercept)` → `!isObj(c.params)` | killed | killed | leg-records-intercept-send-params |
| `F1-navs-count-ge` | `navs.length === 1 && isObj(navs[0].params)` → `navs.length >= 1 && isObj(navs[0].` | survived | killed-by-witness | frame-binding-second-nav |
| `F2-nav-after-navigate-strict` | `navs[0].afterSendId >= firstNav.id` → `navs[0].afterSendId > firstNav.id` | survived | killed-by-witness | accept-nav-after-navigate-send |
| `W1-unparsable-ext-case-sensitive` | `if (/\.json$/i.test(name)` → `if (/\.json$/.test(name)` | survived | killed-by-witness | prior-set-unparsable-uppercase-ext |
| `W2-realpath-to-resolve` | `const real = (p) => { try { return fs.realpa` → `const real = (p) => path.resolve(p` | survived | unwitnessed-hole | — |
| `W3-schema-string-not-exact` | `if (isObj(j) && j.schema === SCHEMA &&` → `if (isObj(j) && typeof j.schema ==` | killed-positive | killed-positive | positive: prior-set-complete |
| `W4-file-dedup-dropped` | `const rf = real(p); if (seen.has(rf)) contin` → `const rf = real(p);` | survived | equivalent | equivalent (argued) |
| `A1-once-browser-dropped` | `once('Emulation.setDeviceMetricsOverride') &` → `once('Emulation.setDeviceMetricsOv` | survived | killed-by-witness | allowlist-browser-getversion-twice |
| `A2-exprs-add-events` | `'window.__state()', readyExpr,` → `'window.__state()', readyExpr, 'wi` | survived | killed-by-witness | allowlist-eval-window-events |
| `A3-eval-params-shape-loose` | `same(c.params, { expression: c.params.expres` → `isObj(c.params) && typeof c.params` | killed | killed | allowlist-eval-extra-param |
| `AT1-at-target-f-to-s` | `'160,320': 'f'` → `'160,320': 's'` | killed-positive | killed-positive | positive: coordinate-law |
| `OP1-opens-f-to-f` | `f: 's' };` → `f: 'f' };` | killed-positive | killed-positive | positive: node-binding-law, selection-law, cancel-law |
| `MU1-multiple-d-true` | `d: false, k: false };` → `d: true, k: false };` | killed-positive | killed-positive | positive: mode-law |
| `TR1-trust-leg-set-widened` | `(e.leg === 'script-click' \|\| e.leg === 'forw` → `['script-click', 'forward-click', ` | survived | killed-by-witness | trust-law-trust-leg-pick-single |
| `TR2-trust-distinct-legs-dropped` | ` && new Set(untrusted.map((e) => e.leg)).siz` → `` | survived | killed-by-witness | trust-law-same-leg-twice |
| `AC1-bound-check-dropped` | `if (clicks.length !== 1 \|\| bound !== (want ?` → `if (clicks.length !== 1) actBad.pu` | killed | killed | activation-law, activation-law-script-activated |
| `NB1-four-inputs-dropped` | `nodeBad.length === 0 && Object.keys(nodeOf).` → `nodeBad.length === 0 && ` | survived | killed-by-witness | node-binding-law-three-inputs |
| `NF1-result-null-loose` | `nf.setResult === null` → `!isObj(nf.setResult)` | survived | killed-by-witness | not-file-input-law-array-result |
| `EL1-setresult-obj-loose` | `pe.setError === null && same(pe.setResult, {` → `pe.setError === null && isObj(pe.s` | survived | killed-by-witness | empty-list-law-setresult-extra |
| `IL1-cancel-set-id-dropped` | `ic.opened === true && ic.setSendId === null ` → `ic.opened === true && ` | survived | killed-by-witness | intercept-law-cancel-sets-files |
| `NF2-button-class-dropped` | `nf.triggerResult.className === 'HTMLButtonEl` → `isObj(nf.triggerResult) && ` | survived | killed-by-witness | not-file-input-law-class |
| `RL1-reads-count-ge` | `same(reads.map((e) => [e.leg, e.target,` → `reads.length >= wantReads.length &` | survived | equivalent | equivalent (argued) |
| `CO1-x-dropped` | `e.x !== p.at[0] \|\| e.y !== p.at[1]` → `e.y !== p.at[1]` | killed | killed | coordinate-law |
| `MD1-missing-open-skipped-as-bad` | `if (!o) return false;` → `if (!o) return o === undefined;` | killed-positive | killed-positive | positive: mode-law |
| `MK1-mark-strict-increase` | `(i === 0 \|\| m.at >= marks[i - 1].at)` → `(i === 0 \|\| m.at > marks[i - 1].at` | survived | killed-by-witness | accept-marks-equal-start |
| `SEQ1-seq-off-by-one-tolerated` | `events.every((e, i) => isObj(e) && e.seq ===` → `events.every((e, i) => isObj(e) &&` | survived | killed-by-witness | seq-monotonic-zero-based |
| `TM1-gapmin-strict` | `if (at[i] - at[i - 1] >= GAP_MIN) g.push` → `if (at[i] - at[i - 1] > GAP_MIN) g` | survived | killed-by-witness | accept-own-gap-50.0 |
| `TM2-absneed-floor` | `absNeed = Math.ceil(FRAC * np - 1e-9)` → `absNeed = Math.floor(FRAC * np)` | killed | killed | accept-prior-abs-below-threshold |
| `TM3-gapneed-floor` | `gapNeed = Math.ceil(GAP_FRAC * gp - 1e-9)` → `gapNeed = Math.floor(GAP_FRAC * gp` | killed | killed | accept-prior-tol-out-0.051, accept-prior-gap-below-threshold |
| `TM4-abs-strict` | `(np > 0 && absMatched >= absNeed) \|\| ` → `(np > 0 && absMatched > absNeed) \|` | killed | killed | replay-timeline-abs-at-threshold |
| `TM5-owngaps-floor-minus-one` | `ownGaps >= MIN_OWN_GAPS` → `ownGaps >= MIN_OWN_GAPS - 1` | killed | duplicate-of-frozen-mutant | replay-timeline-own-gap-49.9, replay-timeline-too-few-gaps |
| `B1-headless-dup-dropped` | ` && hargv.filter((a) => a === '--headless=ne` → `` | survived | killed-by-witness | host-argv-duplicate-headless-new |
| `B2-viewport-dropped` | ` && same(r.fixture.viewport, VIEWPORT)` → `` | survived | killed-by-witness | fixture-viewport |
| `B3-upload-missing-dropped` | `up.dir === upDir && up.missing === MISSING &` → `up.dir === upDir && ` | killed | killed | upload-missing-name |
| `B4-stderr-shape-only` | `typeof host.stderrHead === 'string' && host.` → `typeof host.stderrHead === 'string` | killed | killed | devtools-stderr-absent |
| `B5-favicon-query-dropped` | `(s.path === '/favicon.ico' && s.status === 4` → `(s.path === '/favicon.ico' && s.st` | killed | killed | server-log-favicon-query |
| `B6-curl-devtools-dropped` | ` && td.postKillCurl.devtools === 7` → `` | survived | killed-by-witness | teardown-devtools-curl |
| `B7-proto-version-dropped` | ` && td.portProbes.devtools === 'closed'` → `` | killed | killed | teardown-port-open |
| `B8-legshape-obj-only` | `check('legshape-consistency', same(r.legShap` → `check('legshape-consistency', isOb` | killed | killed | legshape-consistency, legshape-fabricated-leg |
| `B9-predicate-dropped` | `r.predicate === true && r.chooserHypothesis ` → `r.chooserHypothesis === 'CONFIRMED` | killed | killed | producer-verdict-false-CONFIRMED, producer-verdict-null-CONFIRMED |
| `WIN1-event-order-strict` | `(num(events[i - 1].at) && e.at >= events[i -` → `(num(events[i - 1].at) && e.at > e` | killed-positive | killed-positive | positive: event-leg-window |
| `P3-plan-content-dropped` | `check('plan-frozen', same(r.plan, FROZEN)` → `check('plan-frozen', arr(r.plan).l` | killed | killed | plan-frozen, plan-frozen-intercept |
| `E1-leg-domain-exempt-last` | `events.every((e) => isObj(e) && LEG_ORDER.in` → `events.filter((e) => e.leg !== 'in` | survived | equivalent | equivalent (argued) |
| `A4-once-emulation-dropped` | `once('Emulation.setDeviceMetricsOverride') &` → `once('Browser.getVersion')` | survived | killed-by-witness | allowlist-emulation-twice |
| `B10-argv-length-ge` | `hargv.length === 17` → `hargv.length >= 17` | survived | killed-by-witness | host-argv-extra-flag |
| `B11-argv-about-blank-dropped` | ` && hargv[16] === 'about:blank'` → `` | survived | killed-by-witness | host-argv-no-about-blank |
| `B12-window-size-dropped` | `hargv[15] === '--window-size=' + VIEWPORT.wi` → `` | survived | killed-by-witness | host-argv-window-size |
| `S1-selection-input-only` | `e.fileEvents.push(['input', inp, chosen], ['` → `e.fileEvents.push(['input', inp, c` | killed-positive | killed-positive | positive: selection-law |
| `CB1-binding-set-adjacency-dropped` | `(l.setSendId !== null && l.setSendId !== e.a` → `(l.setSendId !== null && false)` | survived | killed-by-witness | chooser-event-binding-set-gap |
| `TM6-pair-tolerance-le` | `Math.abs(v[0] - e.ts) < TOL && Math.abs(v[1]` → `Math.abs(v[0] - e.ts) <= TOL && Ma` | survived | unwitnessed-hole | — |
| `SRV1-status-ge-200` | `slog.filter((s) => isObj(s) && s.path === '/` → `slog.filter((s) => isObj(s) && s.p` | survived | equivalent | equivalent (argued) |
| `NF3-no-page-event-loose` | `ev.filter((e) => e.leg === 'not-file-input')` → `ev.filter((e) => e.leg === 'not-fi` | survived | equivalent | equivalent (argued) |

## Surviving mutants: the holes this measures

34 survivors are killed by a witness case that does **not** exist in the frozen battery. Each was
verified in both directions: with the pristine counter the appended case passes (the counter refuses
with the expected id, or is clean for a must-accept case), and with the mutated counter the case is the
**only** failing case. The witness case text is in `mutants.json` → `witness.caseBody`; reproduce by
inserting it before the `const JOBS = …` line of a battery copy and running that copy twice.

The six that matter most (a forger-side receipt can exploit them without any other check firing):

1. **`typed()` read branch — `event-types` only.** `T10` (`e.files.length === 1` → `>= 1`) survives
   because **every** other consumer of a `read` event looks only at `files[0]`: `derived.leg-*-read`
   maps `[target, files[0][0], ret]`, `read-law` maps the same, and `readBad` compares `files[0]`
   alone. A read event carrying a second file triple passes the whole counter under the mutant and is
   refused only by `event-types` under the frozen counter. Witness `event-types-read-two-files`.
2. **`leg-records` — sub-object shape.** `L3` (`triggerResult.subtype !== 'node'` dropped), `L4`
   (`triggerResult.objectId === ''` dropped) and `L5` (the set-object adjacency clause dropped) each
   survive: no other check reads `triggerResult.subtype`, treats an empty `objectId` as invalid, or
   enforces that the set immediately follows the object lookup. Witnesses
   `leg-records-object-subtype`, `leg-records-object-id-empty`, `leg-records-set-not-adjacent`.
3. **Send allow-list — repeat/exotic sends.** `A1` (the `once('Browser.getVersion')` conjunct),
   `A4` (the `once('Emulation.setDeviceMetricsOverride')` conjunct) and `A2` (an extra entry in
   `EXPRS`) survive: a repeat `Browser.getVersion {}` is already admitted by `EMPTY` and a repeat
   `Emulation.setDeviceMetricsOverride` by its own exact-params branch, `chooser-call-count` counts only
   `Input.*`/`DOM.setFileInputFiles`/`Page.setInterceptFileChooserDialog`, and `EXPRS` entries are only
   ever tested by membership. Witnesses `allowlist-browser-getversion-twice`,
   `allowlist-emulation-twice`, `allowlist-eval-window-events`.
4. **`host-argv` — the unbound slots.** `B10` (`hargv.length === 17` → `>= 17`), `B11` (the
   `hargv[16] === 'about:blank'` conjunct) and `B12` (the `--window-size=` conjunct) survive; the
   battery mutates `argv[0]`, `argv[1]`, `argv[3]`, `argv[4]`, `argv[13]` and the ordering, never the
   length, the size or the last entry. Witnesses `host-argv-extra-flag`,
   `host-argv-no-about-blank`, `host-argv-window-size`.
5. **Prior-set walk — the `.JSON` refusal path.** `W1` (dropping `/i` from the `.json` test) survives
   because the only unparsable case in the battery prefixes a bare `{`, which the first-byte clause
   catches regardless of the name. A schema-bearing, non-JSON-looking, truncated file named `*.JSON`
   is then *skipped* instead of refused. Witness `prior-set-unparsable-uppercase-ext`.
6. **`seq-monotonic`, `leg-marks`, `GAP_MIN`, the ts tolerance.** `SEQ1` (`e.seq === i+1 ||
   e.seq === i`), `MK1` (mark monotonicity made strict), `TM1` (`>= GAP_MIN` → `>`), `TM6` (`<` → `<=`
   on the `ts` leg of the pair tolerance) and `TM5` (the own-gap floor lowered by one) survive: no case
   uses a zero-based seq, an equal mark pair on a quiet leg, a gap of exactly 50.0 ms, an
   exactly-0.05 ms `ts` delta, or an own-gap count of exactly 10. Witnesses
   `seq-monotonic-zero-based`, `accept-marks-equal-start`, `accept-own-gap-50.0`; `TM6` unwitnessed
   (see below).

The remaining verified witnesses are `event-types-file-quad`, `event-types-file-size-negative`,
`event-types-y-null-buttons-set`, `event-types-ts-negative`, `leg-records-error-code-float`,
`cdp-event-log-aftersend-float`, `frame-binding-second-nav`, `accept-nav-after-navigate-send`,
`trust-law-trust-leg-pick-single`, `trust-law-same-leg-twice`, `node-binding-law-three-inputs`,
`not-file-input-law-array-result`, `empty-list-law-setresult-extra`, `intercept-law-cancel-sets-files`,
`not-file-input-law-class`, `fixture-viewport`, `teardown-devtools-curl`,
`chooser-event-binding-set-gap`, `allowlist-emulation-twice`.

## Six survivors argued equivalent (no case can distinguish them)

| mutant | argument |
|---|---|
| `L6-set-before-trigger-strict` | `setSendId === triggerSendId` would make one send both `Runtime.evaluate` and `DOM.setFileInputFiles`; both method tests are unconditional, so `<` and `<=` accept exactly the same receipts. |
| `W4-file-dedup-dropped` | the file-level `seen` entry only suppresses a second visit; `outside` and `unparsable` are tested for emptiness, so a duplicate changes finding text only. |
| `RL1-reads-count-ge` | the mutant keeps `same(reads.map(…), wantReads)`, and canonical equality already implies equal length. |
| `E1-leg-domain-exempt-last` | the exempted set is events labelled `intercept-off`, a `LEG_ORDER` member, so every exempted event satisfies the predicate the mutant skips. |
| `SRV1-status-ge-200` | a `/` row with status 201 joins `servedRoot` but is also classed into `otherRows` (status ≠ 200), so the check still refuses. |
| `NF3-no-page-event-loose` | a length is never negative. |

## Two holes without a witness

- `W2-realpath-to-resolve` (`real()` → `path.resolve`): only reachable by a prior that the prior set
  lists through a symlinked directory while the walked tree holds the real file (then `priorReal`
  stops matching and the receipt is flagged as outside), or by a symlink cycle. Building that needs a
  crafted prior-set file plus a mirror lane, which the battery's case harness does not expose; the
  witness is unwritten, so this hole is asserted from reading, not measured.
- `TM6-pair-tolerance-le` (`<` → `<=` on `ts` only): the distinguishing receipt needs a prior retimed
  by exactly 0.05 ms in `ts` with `at` untouched, on more than `absNeed` events. That is a new
  must-accept bracket; it is proposed in `mutants.json` (`accept-prior-ts-at-exact-tol`) and not built.

## Killed mutants (evidence that the frozen battery holds these axes)

20 mutants are killed by a named battery case and 7 by the battery's positive run (the counter refuses
the honest receipt, i.e. the mutant is over-strict); none crashed. Notable: `W3` (the receipt-schema equality loosened
to "any string") is killed-positive by `prior-set-complete`, and re-measuring the walk with the
loosened test shows why it is load-bearing: **28** files inside the two walked trees carry the receipt
schema *string* in their `priorSet`/`limit` blocks while declaring a different top-level `schema` and a
foreign `nonce` (the counter's own outputs under `controls/c1/pf/`, `lesson-proof/counter-pass1/` and
`scored/before/`), so the exact-schema test is what keeps them out of `outside`. `WIN1` (event order
made strict) is killed-positive by the honest receipt itself, i.e. the measured log has consecutive
events sharing one `at`, so `>=` is the correct rule.

One mutant, `TM5-owngaps-floor-minus-one` (`ownGaps >= MIN_OWN_GAPS - 1`), is semantically identical
to the frozen `M-timeline-min-own-gaps-10` and is therefore marked
`semanticallyIdenticalToFrozen` and excluded from the 68 new mutants. Five more share an edit **site**
with a frozen mutant but make a different edit (`CO1-x-dropped` vs `M-coordinate-y-dropped`,
`TM3-gapneed-floor` vs `M-timeline-gap-denominator-own`, `TM4-abs-strict` vs
`M-timeline-abs-test-dropped`, `B5-favicon-query-dropped` vs `M-server-favicon-any`,
`B9-predicate-dropped` vs `M5-producer-verdict-and-to-or`); each is listed in `mutants.json` with the
overlap flag.

## Restoration and bounds

- The lane is untouched by this seat: no git/jj mutation, no write outside
  `.ufo/waves/round-77-seats/R77Mut1/` and this report. `git -C <lane> status --porcelain` was not
  needed; every script copy is in scratch and the pinned driver was copied byte-for-byte
  (sha256 `9954db07…` re-checked before each batch).
- No tool was installed or upgraded; nothing to record under the tooling directive.
- Scratch `/fast/scratch/hyaku/tabi-r77/R77Mut1/` is removed at the end; the two JSON artefacts and
  this report carry everything.
- Unrun = not passed: every number above is from a command whose exit code is quoted. The two
  unwitnessed holes are labelled as read, not measured.
