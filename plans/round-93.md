# tabi — round 93

L1 `TabiR93`. Base `192535d7ea519439ce42ec09b45038ed6756c709` (lane tip at round start; `jj-lane.sh state`
ahead=0 behind=0, clean). Round 92 closed `ok admitted=true` (spot-check
`corpus/lessons/round-92-verifier-spotcheck.md`). This round keeps the r92 discipline: ONE claim, worded
as the conjunction of the counter's checks and nothing more; its no-work, wrong-site, setup and forgery
controls executed and committed in the same commit that freezes the claim and the instrument bytes,
before the scored run and before any seat is dispatched. `claims.json.frozenAt` is stamped before the
freeze commit is made (r92 spot-check §8 item 1).

Routed r92 spot-check §8 defects are record work outside the claim (§Record work below).

## Claim (frozen before data)

### C1 — coverage (capability `chromium-oopif-backendnode-scope-linux`, new; first-working round 93)

Surface moved: what a file chooser's `backendNodeId` names on a CDP session OTHER than the one the
chooser arrived on — the r92 declared limit 5 ("answering on the OTHER session is not measured"). No
earlier lane instrument sends a node id across sessions. Sourced: S231 (Blink `inspector_dom_agent.cc`
at tag 155.0.8059.84 — `AssertNode` resolves `backendNodeId` through `DOMNodeIds::NodeForId`;
`setFileInputFiles` returns "Node is not a file input element" for a non-file-input node) and S232
(Blink `dom_node_ids.cc` at the same tag — ids come from one process-static counter and map), both
opened this round.

**Predicate `C1-CROSS-SESSION-ANSWER-R93`.** On this host's Chromium 155.0.8059.84 (`/usr/bin/chromium
--headless=new`, Linux), `scripts/check-cross-session-answer-round93.mjs --live` runs the pinned driver
`scripts/chrome-cdp-cross-session-answer-round93.mjs` (sha256 checked before it runs) for 3
repetitions of two arms in the order X-1, S-1, X-2, S-2, X-3, S-3, each leg in a fresh browser and
profile, with a parent page `http://127.0.0.1:<http>/parent.html?leg=<id>` holding one iframe whose
child document `http://<host>:<child>/child.html?leg=<id>` holds one file input `#s`; after a left
click sent on the PAGE session at `#s`'s centre, with B the `backendNodeId` of the chooser event, it
exits 0 iff in every one of the 6 legs:

- **X** (child host `localhost`): exactly one attached `iframe` target and exactly one `iframe` target
  in `Target.getTargets`, same targetId, URL equal to the child URL, targetId equal to the child frame
  id; exactly one `Page.fileChooserOpened`, on that iframe session, for the child frame, with an
  integer B > 0; `DOM.describeNode {backendNodeId: B}` on the iframe session returns an `INPUT` with
  `type=file` and `id=s`; `DOM.describeNode {backendNodeId: B}` on the PAGE session returns no error
  and a node whose `nodeName` is `#document`; the PAGE session's `DOM.getDocument {depth: -1, pierce:
  true}` contains 0 `INPUT` nodes with `id=s`; `DOM.setFileInputFiles {backendNodeId: B}` on the PAGE
  session returns exactly the error message `Node is not a file input element` and the child input's
  `files` then read `[]`; `DOM.setFileInputFiles {backendNodeId: B}` on the iframe session then returns
  no error;
- **S** (child host `127.0.0.1`, other port): zero attached and zero listed `iframe` targets; exactly
  one `Page.fileChooserOpened`, on the page session, for the child frame, with an integer B > 0;
  `DOM.describeNode {backendNodeId: B}` on the page session returns an `INPUT` with `type=file` and
  `id=s`; the page session's pierced `DOM.getDocument` contains exactly 1 `INPUT` with `id=s`; no
  cross-session answer is sent; `DOM.setFileInputFiles {backendNodeId: B}` on the page session returns
  no error;
- **both**: the child input's `files` then read exactly `[["tabi-r93-answer.txt", 22]]`; the child
  document recorded exactly one `click` event, `isTrusted` true, targeting `#s`; the leg's DevTools
  `/json/version` `Browser` is `Chrome/155.0.8059.84`; and the 6 legs carry 6 distinct DevTools
  browser ids.

The counter also requires the receipt's schema, nonce, driver pin, a `chromium` string containing
`155.0.8059.84`, `reps` 3, `crossHost` `localhost`, the answer `{name, size 22}`, three distinct ports
in 1024..65535, an empty `failures` list with no leg carrying an `error`, per-leg `arm`/`rep` equal to
the leg label, and `http:` child/parent URLs without userinfo on the named hosts, ports, paths and
`?leg=<id>` queries.

**Before → after.** Before (base `192535d7`): the lane has no instrument for this predicate — the
counting command does not exist at base (`git cat-file -e 192535d7:scripts/check-cross-session-answer-round93.mjs`
→ rc 128), and the lane's newest iframe receipt (r92, which never sends B to another session) scored
by the frozen counter gives `findings` (rc 1). After: `--live` exit 0 with 0 findings over the 6 legs
(the scored run is recorded in `.ufo/waves/round-93/scored/`).

**Kill rule.** C1 fails if the scored `--live` run exits non-zero, or if a frozen control below does
not give its expected verdict, or if any wave artifact shows a leg-level statement of the predicate
false on a `--live` run of the pinned driver on this host (a reproduction with ≥1 finding that is not
a setup/port/host-resource failure named as such).

### Declared limits (part of the frozen claim; the claim says nothing beyond them)

1. One Chromium build (155.0.8059.84, Arch Linux package, launched through `/usr/bin/chromium` with
   the host user's `chromium-flags.conf`), `--headless=new` only; headed mode, other builds and other
   OSes are unmeasured.
2. "Different site" is realised only as `localhost` vs `127.0.0.1` (r92 limit 2 and W6).
3. The claim states WHICH node the page session names only as "a `#document` node"; it does not
   state whose document it is (no `frameId`/`documentURL` is bound) nor why that id maps to it. The
   source reading (S231/S232) is the knowledge entry's explanation, not a predicate clause.
4. One backendNodeId per leg (the chooser's), one DOM shape (a lone file input at a fixed position),
   fresh browsers; other node ids, longer-lived renderers and other page shapes are unmeasured. The
   cross-session answer is sent before the correct-session answer; the reverse order is unmeasured.
5. The chooser is intercepted (`Page.setInterceptFileChooserDialog`) and answered programmatically;
   no dialog UI is observed. "Exactly one" chooser means within the 1500 ms window after the click.
6. The counter in `--receipt` mode reads a file: a forger who writes a whole consistent receipt
   passes that mode. The claim's counting command is `--live`. `--reps` other than 3 measures other
   legs; the claim is the default.

## Controls (executed and committed with the freeze, before the scored run)

All under `.ufo/waves/round-93/controls/` (instrument sha256 in `instrument-sha256.txt`, rc lines in
`rc.txt`):

| control | command (abridged) | expected | observed |
|---|---|---|---|
| no-work (base) | `git cat-file -e 192535d7:scripts/check-cross-session-answer-round93.mjs` | absent | rc 128 |
| no-work (r92 receipt) | counter `--receipt corpus/evidence/round92/chromium-crosssite-iframe-chooser/receipt.json --expect-nonce tabi-r93-donothing` | rc 1 | rc 1: schema, nonce, driver-pin, describe-chooser, describe-page, pierce-input, cross-answer, answer, child-files, fresh-browser (`counter-donothing-r92.json`) |
| wrong-site live run | driver `--cross-host 127.0.0.1` (real browser, both arms same-site), then counter `--receipt` | rc 1 with behaviour ids | rc 1: iframe-targets, chooser, describe-chooser, describe-page, pierce-input, cross-answer, answer (+ host-label ids) (`counter-wrongsite.json`) |
| positive | driver (localhost), then counter `--receipt` | rc 0 | rc 0, 101 checks, 0 findings (`counter-positive.json`) |
| setup (busy port) | counter `--live` with port 19352 held by a listener (ss-verified) | rc 2 `setup` | rc 2 `setup`, driver free-port refusal (`counter-setup-busyport.json`; attempt 1 had no live holder and ran clean — disclosed in `rc.txt`, superseded) |
| forgery battery | `scripts/negatives-cross-session-answer-round93.mjs` on the positive receipt | 65/65 | 65/65 killed incl. positive clean (`battery.json`) |

## Counting command

```sh
node scripts/check-cross-session-answer-round93.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --expect-driver-sha256 a0deddda855a3eb48f9dd02f6d01eee0f607e9ab319dd74c6182c1d9ecc9a4a0 \
  --live --scratch <ABS scratch> --ports <http,child,cdp> --json
```

Exit 0 and `verdict: clean` → C1 after-state met.

## Record work (not claimed; routed r92 spot-check §8)

1. Future-dated `frozenAt` (item 1): this round stamps `frozenAt` before the freeze commit; an appended
   LOG correction names r92's stamp; the mined mistake's gate (`scripts/check-freeze-stamp-round93.mjs`)
   is shown able to fail on r92 and passing on r93.
2. Gate registry rows (item 2): `SKILL.md` `## Round 93 gate registry` carries complete rows (gate|probe,
   verdict map incl. exit 2, pinned value path, write scope, owner) for the r93 gates and appended
   complete rows superseding the r92 ones.
3. SCORECARD W6 (item 3): an appended SCORECARD note names W6.
4. Ledger note F1-F7 vs F1-F8 (item 4) and lesson word counts (item 5): recorded in the r93 lesson.
5. Carried r91 items 3/5 (item 6): r91 instruments are frozen history; still carried.
6. Battery gaps (item 7): the r93 battery carries the routed classes (two-iframe receipt, reps/answer/
   parent-url identity, leg order, non-object leg, per-leg `browserVersion`, fresh-browser identity);
   the r93 driver kills its chromium process group on exit/signals and the counter maps a driver
   usage refusal to `setup` exit 2 (W5). The r92 instruments are not edited.
