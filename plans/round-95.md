# tabi — round 95

L1 `TabiR95`. Base `7b3912bbba828aaa17cb65179b4513ec2c2a2a24` (lane tip at round start; `jj-lane.sh state`
ahead=0 behind=0, clean; no earlier attempt of r95 in `.ufo/watchdog.log`). Round 94 closed `ok`
admitted (spot-check `corpus/lessons/round-94-verifier-spotcheck.md`). Discipline carried from r92-r94:
ONE claim, worded as the conjunction of the counter's checks and nothing more; its no-work, no-reach,
wrong-site, setup and forgery controls executed and committed in the same commit that freezes the
claim and the instrument bytes, before the scored run and before any seat is dispatched;
`claims.json.frozenAt` is stamped before the freeze commit is made.

## Claim (frozen before data)

### C1 — coverage (capability `chromium-oopif-backendnode-misdelivery-linux`, new; first-working round 95)

Surface moved: r94 showed two outcomes of sending a cross-site iframe chooser's `backendNodeId` B on the
PAGE session (B = the parent's root; B = no node) and declared nothing about a parent that owns a node
at id B other than its root. This round adds the third and dangerous branch — B names one of the
PARENT's own `<input type=file>` elements, so a page-session `DOM.setFileInputFiles(B)` returns no error
and fills the wrong input in the wrong document — and binds all three branches to one law checked per
leg against the page's own pierced snapshot. No earlier lane instrument puts a file input in the parent,
compares page `describeNode(B)` with the snapshot node at B, or reads the parent's inputs after a cross
answer. Sourced: S235 (Blink `file_input_type.cc` @155.0.8059.84 — `FileInputType::CreateShadowSubtree`
gives every file input a UA shadow root holding a button with id `file-upload-button` and a span; why
consecutive parent file inputs are 4 ids apart and B can land on a shadow button or text node), opened
this round, read with S231-S234.

**Predicate `C1-BACKENDNODE-MISDELIVERY-R95`.** On this host's Chromium 155.0.8059.84
(`/usr/bin/chromium --headless=new`, Linux), `scripts/check-backendnode-misdelivery-round95.mjs --live`
runs the pinned driver `scripts/chrome-cdp-backendnode-misdelivery-round95.mjs` (sha256 checked before it
runs; nonce passed in its environment; receipt written inside a fresh `mkdtemp` directory) for 3
repetitions of the legs P286, P287, P288, P289, Z, S in that order (18 legs), each in a fresh browser and
profile, with a parent page `http://127.0.0.1:<http>/parent.html?leg=<id>&q=<q>` holding `q` painted
`<span>x</span>` elements, then six file inputs `#p0`..`#p5`, then one iframe whose child document
`http://<host>:<child>/child.html?leg=<id>&pad=300` holds 300 painted `<span>x</span>` elements followed by
one file input `#s` (P<q>: host `localhost`, q as named; Z: host `localhost`, q = 0; S: host `127.0.0.1`,
q = 288); after a left click sent on the PAGE session at `#s`'s centre, with B the `backendNodeId` of the
chooser event and T the node the page session's `DOM.getDocument {depth: -1, pierce: true}` snapshot
(taken after the chooser, before any page-session `describeNode`) carries with backendNodeId B, it exits
0 iff:

- **every leg**: exactly one `Page.fileChooserOpened` (within 1500 ms) for the child frame with an
  integer B > 0, on the iframe session in P/Z legs and on the page session in S legs; `DOM.describeNode
  {backendNodeId: B}` on that session is an `INPUT` with `type=file`, `id=s` and backendNodeId B; the
  snapshot root is a `#document` whose `documentURL` is the parent URL, at most one snapshot node carries
  B, and the snapshot lists exactly `#p0`..`#p5` (in order) as file inputs with 6 distinct integer ids;
  `DOM.describeNode {backendNodeId: B}` on the PAGE session returns no error and equals T on nodeName,
  nodeType, attributes and backendNodeId when T exists, and returns exactly the error `No node found for
  given backend id` when it does not; `DOM.setFileInputFiles {backendNodeId: B}` on the chooser session
  returns no error and the child's `#s` then holds exactly `[["tabi-r95-answer.txt", 22]]`; the child
  recorded exactly one trusted `click` on `#s`; the DevTools `/json/version` `Browser` is
  `Chrome/155.0.8059.84`; the 18 legs carry 18 distinct UUID-shaped DevTools browser ids;
- **P and Z legs** (exactly one attached and one listed `iframe` target, same targetId, URL = child URL,
  = child frame id; 0 `INPUT#s` in the snapshot): `DOM.setFileInputFiles {backendNodeId: B}` on the PAGE
  session, after which the parent's six inputs and the child's `#s` are read:
  - T is one of the parent's file inputs `#pN` → the call returns no error, `#pN` and no other parent
    input then holds exactly `[["tabi-r95-answer.txt", 22]]`, and the child's `#s` holds `[]`;
  - T is any other node → the call returns exactly `Node is not a file input element`, all six parent
    inputs and the child's `#s` hold `[]`;
  - no T → the call returns exactly `No node found for given backend id`, all six parent inputs and the
    child's `#s` hold `[]`;
- **Z legs**: no T, and every backendNodeId in the snapshot is below B;
- **S legs** (zero attached and zero listed `iframe` targets): T and the page `describeNode(B)` are the
  child `INPUT#s` (1 `INPUT#s` in the snapshot); no cross answer is sent;
- **leg set**: at least one P leg where T is a parent file input (misdelivery) and at least one P leg
  where T is a parent node that is not a file input.

The counter also requires the receipt's schema, nonce, driver pin, a `chromium` string containing
`155.0.8059.84`, `reps` 3, `pad` 300, `qs` [286,287,288,289], `zq` 0, `sq` 288, `k` 6, `crossHost`
`localhost`, the answer `{name, size 22}`, three distinct ports in 1024..65535, an empty `failures` list
with no leg carrying an `error`, per-leg `arm`/`rep`/`q`/`pad` equal to the leg label, the B echoed on
the snapshot, describe, cross and answer records equal to the chooser's B, and `http:` child/parent URLs
without userinfo or fragment on the named hosts, ports, paths and queries.

**Before → after.** Before (base `7b3912bb`): the counting command does not exist (`git cat-file -e
7b3912bb:scripts/check-backendnode-misdelivery-round95.mjs` → rc 128), and the lane's newest
backendNodeId receipt (r94, no parent inputs, no snapshot node at B, no misdelivery leg) scored by the
frozen counter gives `findings` (rc 1). After: `--live` exit 0 with 0 findings over the 18 legs (scored
run recorded in `.ufo/waves/round-95/scored/`).

**Kill rule.** C1 fails if the scored `--live` run exits non-zero, or if a frozen control below does not
give its expected verdict, or if any wave artifact shows a leg-level statement of the predicate false on
a `--live` run of the pinned driver on this host (a reproduction with ≥1 finding that is not a
setup/port/host-resource failure named as such).

### Declared limits (part of the frozen claim; the claim says nothing beyond them)

1. One Chromium build (155.0.8059.84, Arch Linux package via `/usr/bin/chromium` with the host user's
   `chromium-flags.conf`), `--headless=new` only; headed mode, other builds and OSes are unmeasured.
2. "Different site" is realised only as `localhost` vs `127.0.0.1` (r92-r94 limit 2).
3. The claim states that the page-session lookup acts on the snapshot's node at B. It does NOT state
   WHICH P leg misdelivers: the parent's ids jitter by ±1 between fresh browsers (pre-freeze probes:
   P286 hit 3/3 in `probe-a`, P286 1 and P289 2 of 3 in the positive control), so only "at least one P
   leg misdelivers and at least one collides" is claimed. The snapshot itself serializes the whole
   parent tree, which mints ids for nodes not yet numbered (S234); T is "the node at B after that
   serialization", not before it (pre-freeze `probe0-single-input-q250`: describe before serialization
   missed, the cross answer after it collided).
4. One backendNodeId per leg (the chooser's), fresh browsers; the order "correct-session answer first",
   longer-lived renderers and other page shapes are unmeasured. What a CDP client library (Puppeteer,
   Playwright) does is not measured here: the driver sends raw CDP.
5. The chooser is intercepted (`Page.setInterceptFileChooserDialog`) and answered programmatically; no
   dialog UI is observed. "Exactly one" chooser means within the 1500 ms window after the click.
6. The counter in `--receipt` mode reads a file: a forger who writes a whole consistent receipt passes
   that mode, and T is the driver's own record of the snapshot (a raw observation, not re-derived by
   the counter). The claim's counting command is `--live`. `--reps` other than 3 measures other legs;
   the claim is the default.

### Pre-freeze probes (observations only; committed under `.ufo/waves/round-95/probes/`)

Run by the L1 while building the driver, BEFORE these bytes were frozen (not scored):
`probe0-single-input-q*.json` (variant driver `probe0-driver-variant.mjs`, one parent file input after q
spans, child pad 300, B = 302): q 0 miss; q 250/290 describe miss before serialization but cross answer
`Node is not a file input element` after it; q 296/300 `#text`; q 298 describe = the PARENT's `INPUT#p`
and the cross answer filled it, 6/6 (`probe0-single-input-q298-reps5.json` plus `q298`).
`k290.json`/`k285.json` (12 parent inputs): consecutive inputs 4 ids apart, ±1 jitter between browsers,
B landing on `#p2` (misdelivery), a `#text`, or the shadow `INPUT type=button id=file-upload-button`.
`probe-a-driver-prefreeze.json` (this driver's bytes before the freeze): 18 legs, P286 misdelivery 3/3.

## Controls (executed and committed with the freeze, before the scored run)

All under `.ufo/waves/round-95/controls/` (script `run-controls.sh`, instrument sha256 in
`instrument-sha256.txt`, rc lines in `rc.txt`):

| control | command (abridged) | expected | observed |
|---|---|---|---|
| no-work (base) | `git cat-file -e 7b3912bb:scripts/check-backendnode-misdelivery-round95.mjs` | absent | rc 128 |
| no-work (r94 receipt) | counter `--receipt corpus/evidence/round94/…/receipt.json --expect-nonce tabi-r95-donothing` | rc 1 | rc 1, 15 ids incl. schema, describe-page, snapshot, parent-inputs, branch-misdelivery, branch-collision |
| parent never reaches B | driver `--qs 0,1,2,3`, then counter `--receipt` | rc 1 incl. branch-misdelivery, branch-collision | rc 1: branch-misdelivery, branch-collision (+ fixture, leg-arm, leg-set) |
| wrong-site live run | driver `--cross-host 127.0.0.1 --reps 1`, counter `--receipt --reps 1` | rc 1 with behaviour ids | rc 1: iframe-targets, chooser, describe-chooser, snapshot, cross-answer, parent-files, z-miss, branch-misdelivery (+ host ids) |
| positive | driver (defaults), then counter `--receipt` | rc 0 | rc 0, 336 checks; misdelivery P286-2, P289-2, P286-3, P289-3; collision 8 P legs; miss Z-1..3 |
| forgery battery | `scripts/negatives-backendnode-misdelivery-round95.mjs` on the positive receipt | 77/77 | 77/77 killed incl. positive clean |
| setup (busy port) | counter `--live`, port 31971 held | rc 2 `setup` | rc 2 `setup`, driverRun status 2 |
| setup (counter SIGTERM 8 s in) | `kill -TERM` the counter | rc 2 `setup` with driverRun, 0 chromium left | rc 2 `setup`, `driverRun.interruptedBy` SIGTERM, 0 left |
| setup (driver SIGKILL 8 s in) | `pkill -KILL` the driver | rc 2 `setup`, 0 chromium left | rc 2 `setup`, signal SIGKILL, 12 swept, 0 left |
| setup (receipt path is a directory) | counter `--receipt <dir>` | rc 2 `setup` | rc 2 `setup` (r94 F4) |
| setup (chromium cannot start) | counter `--live` with a 90+-byte `TMPDIR` | rc 2 `setup` | rc 2 `setup`, driver exit 3 (r94 F2) |

The forgery battery carries the tabi r63 binding classes: a producer-verdict polarity pair (failures
listed while legs are clean; a leg error with empty failures), an ignored producer `verdict: clean` on a
broken receipt, a contradictory duplicate leg and a fabricated leg label (`P290-r`), plus a COL leg
relabelled as a file input (snapshot and describe forged together, killed by `parent-files`).

## Counting command

```sh
node scripts/check-backendnode-misdelivery-round95.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --expect-driver-sha256 <driver sha256 in claims.json> --live --scratch <ABS scratch> --ports <http,child,cdp> --json
```

Exit 0 and `verdict: clean` → C1 after-state met.

## Record work (not claimed; routed r94 spot-check §8)

1. R94Sentinel F1-F4 (item 1): nonce via environment and a `mkdtemp` receipt path (F1, narrows — a
   same-UID writer can still read `/proc/<pid>/environ`; limit 6 stands), chromium launch failure →
   `setup` (F2), `driverRun` in the counter-signal `setup` JSON (F3), receipt path not a regular file →
   `setup` (F4); each shown by a control above.
2. R94Mut gaps (item 2): the r95 battery carries ports < 1024, duplicate ports and non-UUID browser ids;
   seat kill selectors are scoped to the seat's own ports and scratch in the wave contract.
3. D2 (item 3): the scored record and the tip re-run each name a committed receipt copy with its sha256.
4. D1 (item 4): the report names the measured revision (`claims.json`/receipt `revision`) separately from
   the commit that ships the run.
5. Carried: r93 §8 item 5 (append-only check aware of SOURCES table inserts) and r91 items 3/5.
