# R90Exec1 — C1 cold-run reproduction (round 90, wave w1)

Lane `/home/vgpnk/Projects/shokunin/tabi-shokunin`, base `a9f1da08`, instrument freeze D.
Scored receipt `corpus/evidence/round90/chromium-showpicker/receipt.json` (nonce
`tabi-r90-l1-e573334c78fa`, driver pin `ac5a7a5e…7bd7ac8`, fixture pin `5fb1f0f7…7bd7ac8`).
Claims read from `.ufo/waves/round-90/claims.json`; no predicate, counter, pin, prior,
threshold or kill rule was edited, re-proposed or worked around.

## Answer

Two fresh cold runs of the frozen driver, each under its own nonce and its own port triple,
both completed with **driver exit 0**, **41 legs**, **`failures: []`**. Both reproduce the
scored receipt's law set:

- frozen counter: **checkCount 107**, every check true, `verdict: clean`, exit 0 (scored with
  the in-tree scored receipt declared through the counter's documented content-bound
  `--tree-exempt-sha256` interface — see "Scoring" below for why that declaration is required);
- field-by-field law comparison against the scored receipt: **41/41 legs, 0 mismatches** for
  both cold receipts.

Both cold receipts also refuse the *literal* seat command with exit 1 and the single finding
`prior-set-complete` (106/107 checks true). That refusal is prior-set bookkeeping — the lane's
own in-tree scored receipt is an undeclared prior relative to an external receipt under test —
and is measured and explained below. It is not a law divergence: the same bytes are clean 107
the moment the scored receipt is declared, and every law check (including `plan-calls`) was
already true in the literal run.

## Instrument identity (freeze D)

`sha256sum` of the pinned files matches `.ufo/waves/round-90/freeze.txt`:

```
ac5a7a5e56537acc8f61058059294c5f343b236de9b52b8d691995f1e6c49c8d  scripts/chrome-cdp-showpicker-round90.mjs
1d3dfb0b3330f7334b9ea84df9cf7463fa28d61f411c65f9c03c9968d4b7be37  scripts/check-showpicker-round90.mjs
```

Host: Chromium 155.0.8059.84 Arch Linux, Chrome/155.0.8059.84, CDP 1.3, node v24.21.0 —
identical to the scored receipt's `host` block (the counter's `host` check is green on both
cold receipts).

## Runs

Commands (scratch root `/fast/scratch/hyaku/tabi-r90/R90Exec1`, created with `mkdir -p`,
passed explicitly; `cd` into the scratch root before each invocation):

```
node …/scripts/chrome-cdp-showpicker-round90.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --nonce tabi-r90-cold1-cold00001 --scratch /fast/scratch/hyaku/tabi-r90/R90Exec1/cold1 \
  --out /fast/scratch/hyaku/tabi-r90/R90Exec1/cold1.json \
  --http-port 19990 --cdp-port 19991 --child-port 19992            → exit 0

node …/scripts/chrome-cdp-showpicker-round90.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --nonce tabi-r90-cold2-cold00002 --scratch /fast/scratch/hyaku/tabi-r90/R90Exec1/cold2 \
  --out /fast/scratch/hyaku/tabi-r90/R90Exec1/cold2.json \
  --http-port 19993 --cdp-port 19994 --child-port 19995            → exit 0
```

| run | driver exit | legs | failures | started (UTC) | finished (UTC) | run window | ports (http/cdp/child) |
|---|---|---|---|---|---|---|---|
| cold1 | 0 | 41 | `[]` | 14:21:21.309 | 14:25:17.206 | 235 897 ms | 19990 / 19991 / 19992 |
| cold2 | 0 | 41 | `[]` | 14:25:52.996 | 14:29:51.737 | 238 741 ms | 19993 / 19994 / 19995 |

Per-receipt identity (fixture hash is computed over the nonce-substituted fixture document, so it
is necessarily per-nonce; each cold receipt was scored with **its own** hash, never the scored
run's):

| run | receipt file sha256 | nonce | fixture sha256 | child sha256 | driver sha256 |
|---|---|---|---|---|---|
| cold1 | `67c36c59d41244e3665ba5fd945a959b18766eb9e1fe847a38b61695d9d1c91e` | `tabi-r90-cold1-cold00001` | `8781a5368863863f5b3bd74979fb71d1916e10ce0f59397f44d4a8974642cf55` | `674122990091baaa29b891c2b84b3431f1d6208e1767ed3e87acad3d34a441c2` | `ac5a7a5e…7bd7ac8` |
| cold2 | `9be2512264b3585db80c1a7de8842935f96fd35d2465fb4015b83b0b36f28d17` | `tabi-r90-cold2-cold00002` | `f7d48b9075a434f247d6a308b0c30304080bb69e02e26fef88308bf9728f5cbe` | `3dc11931582d8a523c4a28b054a0a47a93076b0b0479f4c937034a3fb7478fdf` | `ac5a7a5e…7bd7ac8` |

Both runs are honest fresh runs: distinct nonces, distinct port triples, distinct per-leg launch
tokens and devtools browser ids, fixture/child server logs bound to the cold nonce
(`server-log-binding`, `child-server-log-binding`, `replay-launch-token`,
`replay-devtools-url` all green), and teardown closure green (0 survivors, all three port probes
`closed`, post-kill curl 7).

## Scoring

All three invocations use the frozen prior-set, the cold receipt's own nonce and its own fixture
sha256, and the frozen driver pin. Nothing in the lane was touched between them.

| invocation | cold1 | cold2 |
|---|---|---|
| literal seat command (prior-set only) | exit **1**, `findings`, **107** checks, failed `[prior-set-complete]` (106/107 true) | exit **1**, `findings`, **107** checks, failed `[prior-set-complete]` (106/107 true) |
| + `--tree-exempt-sha256 be8a5c38a8f3a6d9edb469f8867b1448a6f120654337a4b31bffa5dfb7d1f4f9` | exit **0**, `clean`, **107** checks, 0 findings | exit **0**, `clean`, **107** checks, 0 findings |
| + `--prior corpus/evidence/round90/chromium-showpicker/receipt.json` | exit **0**, `clean`, **107** checks, 0 findings | exit **0**, `clean`, **107** checks, 0 findings |

The exemption hash is the sha256 of the in-tree scored receipt file
(`be8a5c38…d1f4f9`, measured), it resolves to exactly that file
(`treeExemptResolved: […/corpus/evidence/round90/chromium-showpicker/receipt.json]`), and the
counter refuses an unmatched hash via `prior-set-unmatched-exempt` — so the exemption cannot
hide a settle-leg finding.

**Why the literal command refuses (honest statement).** The cold receipts live outside both
walked trees (`/fast/scratch/...`). `prior-set-complete` walks `.ufo/waves/round-90` and
`corpus/evidence/round90` and, for a receipt under test that is *not* the in-tree scored receipt,
finds the scored receipt itself undeclared:

```
cold1: exit 1, findings [{id:"prior-set-complete", detail:"receipts of schema
tabi-chrome-cdp-showpicker-r90 in the round-90 wave/evidence trees, not the receipt under test
(path ../../../../../fast/scratch/hyaku/tabi-r90/R90Exec1/cold1.json), not exempted by sha256 and
not among the priors: …/corpus/evidence/round90/chromium-showpicker/receipt.json"}]
cold2: same finding, path …/R90Exec1/cold2.json
```

This is the same structural case the w1 reviewer documented for external forgeries
(`R90Review2.md`: external receipt + in-tree scored receipt ⇒ one `prior-set-complete` finding),
and it is orthogonal to the browser law: under both declarations the receipt is clean at 107,
and even the literal run has every settle/law check true. The valid gate-safe ways to score an
external receipt are the content-bound exemption or `--prior` (both frozen interfaces); the cold
run does not get to redefine the prior set.

Replay accounting in the `--prior` runs (frozen rule: refuse when `absMatched >= ceil(0.5 * prior
events) = 105`): cold1 `absMatched` 0 / 209 against each of the two probes and 0 / 209 against
the scored receipt; cold2 0 / 209, 0 / 209 and **1** / 209 against the scored receipt. None
refused. The cold receipts are not replays — 209/209 page events differ from the scored run for
cold1 and 208/209 for cold2 beyond the 0.05 ms pair tolerance — and launch tokens, devtools ids
and server logs are distinct.

## The four domread legs' send-log tail (cold1; cold2 identical)

All four domread legs in the first cold receipt carry the distinct settle call exactly once,
immediately after the first `window.__state()` evaluate, and before the post-hoc
`{enabled:true, cancel:true}` dismiss. Full tail, cold1 ids 21–28:

| id | method | expression / params | sp89-text | sp89-png | sp89-multimime | sp89-whitespace |
|---|---|---|---|---|---|---|
| 21 | `Runtime.evaluate` | `window.__setLeg("settle")` | ✓ | ✓ | ✓ | ✓ |
| 22 | `Runtime.evaluate` | `JSON.stringify({isActive: navigator.userActivation.isActive, hasBeenActive: navigator.userActivation.hasBeenActive})` | ✓ | ✓ | ✓ | ✓ |
| **23** | `Runtime.evaluate` | **`window.__state()`** | ✓ | ✓ | ✓ | ✓ |
| **24** | `Runtime.evaluate` | **`window.__inputs(true)`** (returnByValue) | ✓ | ✓ | ✓ | ✓ |
| **25** | `Page.setInterceptFileChooserDialog` | `{enabled: true, cancel: true}` | ✓ | ✓ | ✓ | ✓ |
| 26 | `Runtime.evaluate` | `window.__state()` (post-dismiss) | ✓ | ✓ | ✓ | ✓ |
| 27 | `Runtime.evaluate` | `window.__closeRecord()` | ✓ | ✓ | ✓ | ✓ |
| 28 | `Runtime.evaluate` | `window.__late` | ✓ | ✓ | ✓ | ✓ |

Per leg: `__inputs(true)` count = 1, `settleIx === stateIx + 1` (adjacent), dismiss ack `{}`,
`dismissError: null`, no page `cancel` event, and `stateAfterDismiss` equals `stateAfter`.
Aggregate over the whole cold1 receipt: **4** `__inputs(true)` evaluations in 41 legs, one on
each domread leg, **zero** on the other 37 legs; the same holds for cold2. Trigger/answer send ids
are 19/20 on every domread leg, and each answer's `backendNodeId` equals the leg's single
`Page.fileChooserOpened` id (text 20, png 19, multimime 19, whitespace 20).

DOM-parsed token lists at settle (cold1, target): text/`aw` `["image/*"]`, png/`am`
`["image/png",".txt"]`, multimime/`a2` `["image/png","application/pdf"]`, whitespace/`aws`
`["image/png",".txt"]` — identical to the scored receipt and to the frozen `DOMREAD` matrix,
which is why `accept-domread-law` and `plan-calls` are green.

## Law-set reproduction

Beyond the counter, each cold receipt was compared field-by-field against the scored receipt over
the law-bearing payload, excluding only identity/volatile fields (nonce, timestamps, ports,
launch tokens, devtools/browser ids, frame ids, backendNodeIds, absolute upload paths). Compared
per leg: `showPicker`/`showPicker2`, trigger/trigger2 results and errors, `activationBefore/After`,
`stateAfter`/`stateAfterDismiss`, dismiss presence/result/error, intercept result/error,
`childResult`/`childActivation*`/`childState`/`childLate`/`parentCrossAccess`, every
`childEvents` and `pageEvents` entry as `[type,target,isTrusted,act,x,y,buttons,files,ret]` in
order, chooser `mode`/count/shape and the open→send binding class, `answer` (files, basename,
set result/error, backend matches the last chooser), `upload`/`uploadDir`/`uploadPng`/`uploadSecond`
hashes and hex, `domRead`, `clickWhileOpen*`, settle-call count/adjacency, `errors`, mark names,
teardown closure. Receipt-level: schema, host identity, fixture patch, viewport, `fixtureInputs`,
`failures`. Result for both cold receipts: **`same-law-set`, 41 legs, 0 mismatches**.

## Evidence archived under this directory

Receipts are archived **losslessly as gzip** (`gzip -9 -n`); the uncompressed sha256 equals the
scratch receipt sha256 exactly (`zcat R90Exec1-cold1.json.gz | sha256sum` =
`67c36c59…d9d1c91e`, `…cold2…` = `9be25122…36f28d17`). Restore with
`zcat R90Exec1-cold1.json.gz > cold1.json`. Plain `.json` copies were deliberately **not** left
in the walked tree: measured in a mirror lane, a plain cold-receipt copy under
`.ufo/waves/round-90/w1` makes the frozen `counter-clean` command on the scored receipt exit 1
with `prior-set-complete` (`R90Exec1-mirror-plain-copy.json`), while the same bytes gzipped keep
it clean 107 (`R90Exec1-mirror-gz-copy.json`). After this archive, the literal `counter-clean`
command on the in-tree scored receipt was re-run: exit 0, `clean`, 107 checks, 0 findings.

| file | sha256 |
|---|---|
| `R90Exec1-cold1.json.gz` | `00c576f9bc6dfab318d9c2cf860afc8c4816a7c0d1bb98c89a5e1227c92741e9` |
| `R90Exec1-cold2.json.gz` | `238c6cd3bd85342f15e1772f9812b363730f131478c8019416849a4e75451d0a` |
| `R90Exec1-cold1-score-literal.json` | `a19bf87857f39f80986037ed149f62d446467ecd99f32d61a9da337177531b2e` |
| `R90Exec1-cold2-score-literal.json` | `e4539502cd43ce76b6ac7eb8af65812cda80c2283851dc2d784288ae412627fe` |
| `R90Exec1-cold1-score-exempt.json` | `6e949ec98ddf9994c6e2b5c478ca7024b3fc0fcc28ec6124a186c0b1c1214767` |
| `R90Exec1-cold2-score-exempt.json` | `a6b5b160ae78d4ecc48636581cc0ef9b455a3c9deee481fdd4540faad9d2828d` |
| `R90Exec1-cold1-score-prior.json` | `5158c9ee36f7d2c54fa7928950b7f39261916a99ee008bb08b3121ab25bfcf80` |
| `R90Exec1-cold2-score-prior.json` | `f9e45582abb53c83ec66851d3631e3eb56eb7838dceb6e1f72da8355f3ffd44a` |
| `R90Exec1-cold1-lawdiff.json` | `0aaa82612f4aaaebee2cc52f8a9ae5901793f2799c97ae6a0f13cc3f2b22f8d0` |
| `R90Exec1-cold2-lawdiff.json` | `c61a7ea22c66354884c84f39ea86213a2de0b4bfc980ecba01b606c01f5f07b8` |
| `R90Exec1-mirror-plain-copy.json` | `8729ac2d1d6747dca1c3fac8737b6d9eb71b317af4b2121f541da254820704d1` |
| `R90Exec1-mirror-gz-copy.json` | `ffef61f8ab8f8f7771052141fa3f7f1bb99d9767f64dcffb3c822d5003cd25ce` |
| `R90Exec1-post-archive-scored.json` | `99e9d5a9f02901701b9f12806cc2093859b4dbf229b4e6092032fb57bd1e309d` |

## Risks, limits, operability

1. **Literal command vs external receipt (structural).** Any external receipt scored against this
   lane needs the in-tree scored receipt declared (`--tree-exempt-sha256 be8a5c38…d1f4f9` or
   `--prior corpus/evidence/round90/chromium-showpicker/receipt.json`) or the run refuses on
   `prior-set-complete` with all law checks already true. This is the counter's design (the same
   case as `R90Review2`'s external forgeries), not a cold-run failure.
2. **Walked-tree copies.** Do not place plain r90 receipts under `.ufo/waves/round-90` or
   `corpus/evidence/round90` while the frozen `counter-clean`/`battery` gates are expected green:
   a plain copy flips `counter-clean` to exit 1 `prior-set-complete` (measured in the mirror and
   archived). The gzip archive here is byte-exact and invisible to the JSON walk; if the L1 needs
   first-class plain receipts, they must be declared/exempted by every later counter invocation.
3. **Per-nonce fixture hash.** `fixture.sha256` is `sha256(FIXTURE_HTML)` with `__NONCE__`
   substituted, so every cold nonce has a different fixture hash (and child hash). The scored
   pin `5fb1f0f7…` remains correct only for the scored nonce; each cold receipt was scored with
   its own measured hash, as instructed. No pin was amended.
4. **Replay proximity.** cold2 vs the scored receipt matched 1 page event within the 0.05 ms pair
   tolerance out of 209 (threshold 105); reported, not refused. All other replay checks
   (launch token, devtools url, event timeline against both probes) are green.
5. **Cosmetic driver warning.** Both cold runs emitted
   `MaxListenersExceededWarning … 11 SIGINT/SIGTERM listeners` on stderr at leg 10. It did not
   affect any receipt field: 41/41 legs, `failures: []`, driver exit 0, and every counter host/
   teardown check green.
6. No browser/law divergence was observed in either cold run: the four domread laws (settle call
   present once and adjacent, dismiss ack, no cancel, token lists) and the other 102 checks hold
   in both.

## Tooling and hygiene

No tool was installed or upgraded; no pacman transaction was run (all pacman transactions are
paused host-wide); no host service was restarted. No git/jj mutation, no commit, no push, no
write to the fleet root, `~/.local/bin` or any PATH directory. Both driver invocations were
single foreground commands (the harness auto-backgrounded each after 60 s and both were collected
with `wait`); no daemon or service was started. All scratch work lived under
`/fast/scratch/hyaku/tabi-r90/R90Exec1/` and was deleted after the receipts were archived here;
no subagent was dispatched.
