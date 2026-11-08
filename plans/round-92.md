# tabi — round 92

L1 `TabiR92`. Base `bdf403ff40d9a9a59a2730636f9626e1195b06e2` (the round-91 verifier spot-check
commit; lane clean, `jj-lane.sh state` ahead=0 behind=0). Rounds 90 and 91 closed
`rejected-honest-stop`; both failures were the same class (amendment-59 autopsy class): a claim
sentence wider than what its counter binds, falsified by the round's own wave. This round declares
ONE claim, worded as the conjunction of the counter's checks and nothing more, with its no-work,
wrong-site and forgery controls executed and committed in the same commit that freezes the claim
and the instrument bytes, before the scored run and before any seat is dispatched.

Routed r91 spot-check §8 defects are handled as record work outside the claim (§Record work below);
none of them is claimed as an axis move.

## Claim (frozen before data)

### C1 — coverage (capability `chromium-crosssite-iframe-chooser-linux`, new; first-working round 92)

Surface moved: the CDP **target/session** on which an iframe's file chooser is reported and answered.
No earlier lane instrument enumerates `Target.*` (r91 spot-check §8 item 4: the r91 driver bound the
first `type=page` target and its "cross-origin" arm was same-site). Sourced: S227 (Target.pdl
`setAutoAttach`, tag 155.0.8059.84) and S228 (Chromium process-model doc, tag 155.0.8059.84: sites
are scheme plus eTLD+1 under site-per-process), both opened this round.

**Predicate `C1-IFRAME-CHOOSER-R92`.** On this host's Chromium 155.0.8059.84 (`/usr/bin/chromium
--headless=new`, Linux), `scripts/check-iframe-chooser-round92.mjs --live` runs the pinned driver
`scripts/chrome-cdp-iframe-chooser-round92.mjs` (sha256 checked before it runs) for 3 repetitions of
two arms, each leg in a fresh browser and profile, with a parent page `http://127.0.0.1:<http>/parent.html`
holding one iframe whose child document holds one file input `#s`, and exits 0 iff in every one of
the 6 legs:

- **X** (child `http://localhost:<child>/child.html`): the page session's flatten auto-attach
  reports exactly one attached target of type `iframe`; `Target.getTargets` lists exactly one
  `iframe` target, the same targetId, with URL equal to the child URL; that targetId equals the
  child frame id (the iframe session's `Page.getFrameTree` root);
- **S** (child `http://127.0.0.1:<child>/child.html`, same host, other port): zero attached `iframe`
  targets and zero `iframe` targets in `Target.getTargets`;
- **both**: after a left click (`Input.dispatchMouseEvent` pressed + released) sent on the PAGE
  session at the viewport point of `#s`'s centre, exactly one `Page.fileChooserOpened` is received
  within 1500 ms across all sessions, whose `frameId` is the child frame id, and it arrives on the
  iframe target's session in X and on the page session in S; `DOM.setFileInputFiles` with that
  event's `backendNodeId`, sent on that same session, returns no error; the child input's `files`
  then reads exactly `[["tabi-r92-answer.txt", 22]]`; and the child document recorded exactly one
  `click` event, `isTrusted` true, targeting `#s`.

The counter also requires the receipt's schema, nonce, driver pin, a `chromium` string containing
`155.0.8059.84`, `reps` 3, `crossHost` `localhost`, the answer `{name, size 22}`, empty `failures`,
leg set exactly {X-1..3, S-1..3}, per-leg `error` null, and the child/parent URL hosts and ports.

**Before → after.** Before (base `bdf403ff`): the lane has no instrument for this predicate — the
counting command does not exist at base (`git cat-file -e bdf403ff:scripts/check-iframe-chooser-round92.mjs`
→ rc 128), and the lane's newest iframe receipt (r91) scored by the frozen counter gives
`findings` (rc 1, schema and 20 other ids). After: `--live` exit 0 with 0 findings over the 6 legs
(the scored run is recorded in `.ufo/waves/round-92/scored/`).

**Kill rule.** C1 fails if the scored `--live` run exits non-zero, or if a frozen control below does
not give its expected verdict, or if any wave artifact shows a leg-level statement of the predicate
false on a run of the pinned driver on this host (a reproduction with ≥1 finding that is not a
setup/port/host-resource failure named as such).

### Declared limits (part of the frozen claim; the claim says nothing beyond them)

1. One Chromium build (155.0.8059.84, Arch Linux package), `--headless=new` only; headed mode,
   other builds and other OSes are unmeasured.
2. "Different site" is realised only as `localhost` vs `127.0.0.1` (no registrable domain); the
   claim does not measure process ids — the `iframe` target is Chromium's own target model, not a
   pid observation.
3. Auto-attach is the page session's `Target.setAutoAttach {autoAttach:true,
   waitForDebuggerOnStart:false, flatten:true}` only; non-flatten mode and browser-level discovery
   are unmeasured.
4. The chooser is intercepted (`Page.setInterceptFileChooserDialog`) and answered programmatically;
   no dialog UI is observed. "Exactly one" means within the 1500 ms window after the click.
5. Answering on the OTHER session (e.g. the page session in X) is not measured; the claim is where
   the event arrives and that answering on that session works, not that another session fails.
6. The counter in `--receipt` mode reads a file: a forger who writes a whole consistent receipt
   passes that mode. The claim's counting command is `--live`.

## Controls (executed and committed with the freeze, before the scored run)

All under `.ufo/waves/round-92/controls/` (instrument sha256 in `instrument-sha256.txt`):

| control | command (abridged) | expected | observed |
|---|---|---|---|
| no-work (base) | `git cat-file -e bdf403ff:scripts/check-iframe-chooser-round92.mjs` | absent | rc 128 (`rc.txt`) |
| no-work (r91 receipt) | counter `--receipt corpus/evidence/round91/.../receipt.json --expect-nonce tabi-r92-donothing` | rc 1 | rc 1, 21 finding ids (`counter-donothing-r91b.json`) |
| wrong-site live run | driver `--cross-host 127.0.0.1` (real browser, both arms same-site) then counter `--receipt` | rc 1 with behaviour ids | rc 1: `iframe-target-count`, `browser-iframe-targets`, `chooser-session`, `answer-session`, `iframe-target-url`, `iframe-target-frame` (+ host-label ids) (`counter-wrongsite.json`) |
| positive | driver (localhost) then counter `--receipt` | rc 0 | rc 0, 93 checks, 0 findings (`counter-positive.json`) |
| forgery battery | `scripts/negatives-iframe-chooser-round92.mjs` on the positive receipt | 31/31 | 31/31 killed incl. positive clean (`battery.json`) |

## Counting command

```sh
node scripts/check-iframe-chooser-round92.mjs --lane /home/vgpnk/Projects/shokunin/tabi-shokunin \
  --expect-driver-sha256 0feca90ba0272d92d3444d1b23bf0e85a089946408fe52e383e8ddf740321688 \
  --live --scratch <ABS scratch> --ports <http,child,cdp> --json
```

Exit 0 and `verdict: clean` → C1 after-state met.

## Record work (not claimed; routed r91 spot-check §8)

1. Filed report never rewritten — this round's report is written once, after the last lane commit;
   any correction is an appended erratum.
2. Append-only repairs: a LOG.md correction entry naming the r90 entry's in-place rewrite
   (`LOG.md:4079-4086`, commit range `b1d8f07b..878bc912`) and a superseding QUALITY row naming row
   163's in-place edit.
3. r91 C1 binding gaps: not repaired — the r91 instrument is frozen history; recorded as carried.
4. SCORECARD capability row `chromium-showpicker-proxy-linux`: an appended correction narrowing
   "cross-origin" to same-site cross-origin (no own target); this round's C1 measures the
   distinction.
5. r91 C2 meter strength: not repaired (r91 instrument frozen); recorded as carried.
6. `corpus/lessons/round-89.md:117` "(the committer time)": appended correction.
7. Gate revision: the r92 counter records `git rev-parse master` in its output (`revision`).
8. Claims text frozen before dispatch: this file and `claims.json` land in the freeze commit.

Mined mistake (lesson `## Mistakes`): r91 repaired append-only records by in-place rewrite. Fix:
`scripts/check-append-only-round92.mjs` (base bytes must be a byte prefix of tip bytes for the named
files), shown able to fail on `b1d8f07b..878bc912` (LOG.md, corpus/QUALITY.md) and passing on this
round's range.
