# tabi — round 94

L1 `TabiR94`. Base `d7744d043ca4b606124dfaa7f385acfa89b352ff` (lane tip at round start; `jj-lane.sh state`
ahead=0 behind=0, clean; no earlier attempt of r94 in `.ufo/watchdog.log`). Round 93 closed `ok`
admitted (spot-check `corpus/lessons/round-93-verifier-spotcheck.md`). Discipline carried from r92/r93:
ONE claim, worded as the conjunction of the counter's checks and nothing more; its no-work, wrong-site,
no-padding, setup and forgery controls executed and committed in the same commit that freezes the claim
and the instrument bytes, before the scored run and before any seat is dispatched; `claims.json.frozenAt`
is stamped before the freeze commit is made.

## Claim (frozen before data)

### C1 — coverage (capability `chromium-oopif-backendnode-collision-linux`, new; first-working round 94)

Surface moved: r93 declared limit 3 — the r93 claim said the page session names "a `#document`" for a
cross-site iframe chooser's `backendNodeId` B and explicitly did not say whose document or why. This
round binds whose (the parent's own root, by backendNodeId and documentURL) and shows the other
branch of the same lookup: when the child renderer has minted more ids than the parent renderer, B
sent on the page session resolves to NO node. No earlier lane instrument binds `documentURL`, compares
B with the page root's backendNodeId, or produces the `No node found for given backend id` branch.
Sourced: S233 (Blink `identifiers_factory.cc` @155.0.8059.84 — `IntIdForNode` returns
`node->GetDomNodeId()`) and S234 (Blink `node.cc` @155.0.8059.84 — `GetDomNodeId` returns
`DOMNodeIds::IdForNode(this)`), both opened this round, read with S231/S232 (r93).

**Predicate `C1-BACKENDNODE-COLLISION-R94`.** On this host's Chromium 155.0.8059.84 (`/usr/bin/chromium
--headless=new`, Linux), `scripts/check-backendnode-collision-round94.mjs --live` runs the pinned driver
`scripts/chrome-cdp-backendnode-collision-round94.mjs` (sha256 checked before it runs) with pad 300 for 3
repetitions of three arms in the order C-1, M-1, S-1, C-2, M-2, S-2, C-3, M-3, S-3, each leg in a fresh
browser and profile, with a parent page `http://127.0.0.1:<http>/parent.html?leg=<id>` holding one
iframe whose child document `http://<host>:<child>/child.html?leg=<id>&pad=<p>` holds `p` painted
`<span>x</span>` elements followed by one file input `#s`; after a left click sent on the PAGE session
at `#s`'s centre, with B the `backendNodeId` of the chooser event, it exits 0 iff in every one of the 9
legs:

- **every leg**: exactly one `Page.fileChooserOpened` (within 1500 ms), for the child frame, with an
  integer B > 0, on the iframe session in C/M and on the page session in S; `DOM.describeNode
  {backendNodeId: B}` on that session returns an `INPUT` with `type=file`, `id=s` and backendNodeId B;
  `DOM.setFileInputFiles {backendNodeId: B}` on that session returns no error and the child input's
  `files` then read exactly `[["tabi-r94-answer.txt", 22]]`; the child recorded exactly one trusted
  `click` on `#s`; the page session's `DOM.getDocument {depth: 0}` root is a `#document` whose
  `documentURL` is the parent URL; the DevTools `/json/version` `Browser` is `Chrome/155.0.8059.84`;
  the 9 legs carry 9 distinct DevTools browser ids;
- **C** (child host `localhost`, pad 0; exactly one attached and one listed `iframe` target, same
  targetId, URL = child URL, = child frame id): `DOM.describeNode {backendNodeId: B}` on the PAGE
  session returns no error and a `#document` whose backendNodeId is B and whose `documentURL` is the
  parent URL; the page root's backendNodeId equals B; the page session's pierced `DOM.getDocument
  {depth: -1, pierce: true}` holds 0 `INPUT#s` and its largest backendNodeId is ≥ B;
  `DOM.setFileInputFiles {backendNodeId: B}` on the PAGE session returns exactly the error
  `Node is not a file input element` and the child's `files` then read `[]`;
- **M** (child host `localhost`, pad 300; the same iframe-target clause as C):
  `DOM.describeNode {backendNodeId: B}` on the PAGE session returns exactly the error
  `No node found for given backend id`; the page root's backendNodeId differs from B; the page
  session's pierced tree holds 0 `INPUT#s` and every backendNodeId in it is < B;
  `DOM.setFileInputFiles {backendNodeId: B}` on the PAGE session returns exactly the error
  `No node found for given backend id` and the child's `files` then read `[]`;
- **S** (child host `127.0.0.1`, pad 300; zero attached and zero listed `iframe` targets):
  `DOM.describeNode {backendNodeId: B}` on the page session is the child `INPUT` with backendNodeId B;
  the pierced tree holds exactly 1 `INPUT#s` and its largest backendNodeId is ≥ B; no cross-session
  answer is sent.

The counter also requires the receipt's schema, nonce, driver pin, a `chromium` string containing
`155.0.8059.84`, `reps` 3, `pad` 300, `crossHost` `localhost`, the answer `{name, size 22}`, three
distinct ports in 1024..65535, an empty `failures` list with no leg carrying an `error`, per-leg
`arm`/`rep`/`pad` equal to the leg label, the B echoed on every describe/cross/answer record equal to
the chooser's B, and `http:` child/parent URLs without userinfo or fragment on the named hosts, ports,
paths and queries.

**Before → after.** Before (base `d7744d04`): the counting command does not exist
(`git cat-file -e d7744d04:scripts/check-backendnode-collision-round94.mjs` → rc 128), and the lane's
newest backendNodeId receipt (r93, which binds neither documentURL nor the root id and has no M arm)
scored by the frozen counter gives `findings` (rc 1). After: `--live` exit 0 with 0 findings over the 9
legs (scored run recorded in `.ufo/waves/round-94/scored/`).

**Kill rule.** C1 fails if the scored `--live` run exits non-zero, or if a frozen control below does
not give its expected verdict, or if any wave artifact shows a leg-level statement of the predicate
false on a `--live` run of the pinned driver on this host (a reproduction with ≥1 finding that is not
a setup/port/host-resource failure named as such).

### Declared limits (part of the frozen claim; the claim says nothing beyond them)

1. One Chromium build (155.0.8059.84, Arch Linux package via `/usr/bin/chromium` with the host user's
   `chromium-flags.conf`), `--headless=new` only; headed mode, other builds and OSes are unmeasured.
2. "Different site" is realised only as `localhost` vs `127.0.0.1` (r92 limit 2, r93 limit 2).
3. The claim states what B resolves to on the page session in two fixture shapes (pad 0 and pad 300).
   It does NOT state when or by whom the child renderer minted B (paint, accessibility, serialization
   or the chooser itself) nor that a padding threshold exists between 0 and 300; the pre-freeze probes
   below are observations, not predicate clauses. S231–S234 are the knowledge entry's explanation.
4. One backendNodeId per leg (the chooser's), fresh browsers; longer-lived renderers, other page
   shapes and the order "correct-session answer first" are unmeasured.
5. The chooser is intercepted (`Page.setInterceptFileChooserDialog`) and answered programmatically;
   no dialog UI is observed. "Exactly one" chooser means within the 1500 ms window after the click.
6. The counter in `--receipt` mode reads a file: a forger who writes a whole consistent receipt
   passes that mode. The claim's counting command is `--live`. `--reps` other than 3 measures other
   legs; the claim is the default.

### Pre-freeze probes (observations only; committed under `.ufo/waves/round-94/probes/`)

Run by the L1 while building the driver, BEFORE these bytes were frozen (receipts from earlier driver
bytes; not scored): `probe1` — 300 `display:none` empty spans plus an iframe-session
`DOM.getDocument {depth:-1}` before the click: M still gave B = 2 and a `#document` collision
(serialization after load did not move B). `probe2` — 300 painted `<span>x</span>` plus the same
pre-click serialization: B = 302 and a miss. `probe3` — the frozen fixture without any pre-click
serialization, 3 reps: C B = 2 collision, M B = 302 miss, S B = 305 INPUT, all 9 legs.

## Controls (executed and committed with the freeze, before the scored run)

All under `.ufo/waves/round-94/controls/` (instrument sha256 in `instrument-sha256.txt`, rc lines in
`rc.txt`; attempts 1 and 2 kept as `rc-attempt1.txt`, `rc-attempt2.txt` and `*-attempt1/2.json`):

| control | command (abridged) | expected | observed (attempt 3) |
|---|---|---|---|
| no-work (base) | `git cat-file -e d7744d04:scripts/check-backendnode-collision-round94.mjs` | absent | rc 128 |
| no-work (r93 receipt) | counter `--receipt corpus/evidence/round93/…/receipt.json --expect-nonce tabi-r94-donothing` | rc 1 | rc 1, 14 ids incl. schema, describe-page, page-root, page-pierce, leg-set |
| wrong-site live run | driver `--cross-host 127.0.0.1`, then counter `--receipt` | rc 1 with behaviour ids | rc 1: iframe-targets, chooser, describe-chooser, describe-page, page-root, page-pierce, cross-answer, answer (+ host ids) |
| no padding (`--pad 0`) | driver `--pad 0`, then counter `--receipt` | rc 1 incl. describe-page / page-pierce / cross-answer | rc 1: describe-page, page-root, page-pierce, cross-answer (+ pad, leg-pad, child-url) |
| positive | driver (defaults), then counter `--receipt` | rc 0 | rc 0, 165 checks, 0 findings |
| setup (busy port) | counter `--live` with port 19523 held (ss-verified) | rc 2 `setup` | rc 2 `setup` |
| setup (counter SIGTERM mid-run) | `pkill -TERM` the counter 8 s into `--live` | rc 2 `setup`, 0 chromium left | rc 2 `setup`, 0 left |
| setup (driver SIGKILL mid-run) | `pkill -KILL` the driver 8 s into `--live` | rc 2 `setup`, 0 chromium left | rc 2 `setup`, signal SIGKILL, 14 swept, 0 left |
| forgery battery | `scripts/negatives-backendnode-collision-round94.mjs` on the positive receipt | 74/74 | 74/74 killed incl. positive clean |

Attempt 1 (counter `9a406e25…`) left 12 chromium processes after both signal controls; attempt 2
(counter `7d04a36e…`) mapped a counter SIGTERM to `findings` rc 1 (race with the driver's own exit 130)
and its orphan sweep matched 0 processes (chromium rewrites its argv, so NUL-split matching missed the
profile flag; 13 left). Both are recorded, not erased; attempt 3 is the frozen counter.

## Counting command

```sh
node scripts/check-backendnode-collision-round94.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --expect-driver-sha256 518f40ff9b34727254a3bb0cd30603c70ce8488a911fa3a26a55273220f9686f \
  --live --scratch <ABS scratch> --ports <http,child,cdp> --json
```

Exit 0 and `verdict: clean` → C1 after-state met.

## Record work (not claimed; routed r93 spot-check §8)

1. S232 word count (item 1): the r94 lesson appends the correction (lesson said 8, `wc -w` gives 6).
2. Scored-record receipt path (item 2): the r94 counter output carries `receiptSha256`; the r94 scored
   record names the committed receipt copy.
3. R93Sentinel S4/S5 (item 3): the r94 counter maps a signalled/interrupted driver and its own signals
   to `setup` and sweeps orphaned chromium; shown by the three setup controls above.
4. R93Mut survivors / R93Critic1 hardening (item 4): the r94 battery carries out-of-range port, S-arm
   `filesAfterCross` non-null, an ignored producer `verdict`, and B binding on describe/cross/answer;
   R93Critic3's parent-document reading is now the C-arm predicate.
5. Append-only check aware of SOURCES table inserts (item 5) and report errata discipline (item 6):
   the report is corrected only by appended errata; item 5 carried.
6. Carried: r91 items 3/5.
