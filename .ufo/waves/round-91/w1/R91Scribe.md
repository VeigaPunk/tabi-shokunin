# R91Scribe — round 91, wave w1 (scribe; axes depth, calibration)

Milestone: **record drafts** — filed on L1 attempt-3's request (`TabiR91a3`), after attempt-2 died at
13:23. Partial by construction: the round is committed (`df4ef1fc`, then `a60d2f75`), so the four
drafts below are *independent* re-drafts compared against the committed artifacts, plus the
divergences I can defend from bytes. Lane files were **not** edited, nothing was committed, no
mutating git/jj call was made, no subagent was dispatched, no background job was started.

---

## 1. Method and evidence base

Read (read-only): `.ufo/waves/round-91/{claims.json,freeze.txt,freeze-12cbe8a0267f.txt,w1-spec.json,w1-dispatch.json}`,
`.ufo/waves/round-91/scored/{selftest.json,drift-a.json,drift-before.json,control-*.json}`,
`corpus/knowledge/chromium-showpicker-proxy-runtime-round-91.md`, `corpus/lessons/round-91.md`,
`SCORECARD.md:4340-4395`, `corpus/QUALITY.md` rows 163/164, `plans/round-91.md` §Declared limits and
§Limits discovered by the wave, `scripts/{check-showpicker-proxy-round91,selftest-r91-gates,check-record-drift-round91}.mjs`,
`corpus/evidence/round91/chromium-showpicker-proxy/receipt.json`, the three staged sources under
`.ufo/waves/round-91/sources/`.

Executed (read-only, no writes into the lane; scratch `/fast/scratch/hyaku/tabi-r91/R91Scribe`):
`sha256sum` over the three staged sources and three instruments; `node -e` projections over the
receipt (leg table, activation states, proxy/proxyLog/choosers/answerSet/crossAccess); a Python
plain-text pass over the staged HTML to locate quote anchors; `grep` over the counters;
`git log --oneline -3` / `git rev-parse HEAD` (read-only; no worktree, no checkout).

Measured facts I rely on, and where they come from:

| Fact | Value | Source |
|---|---|---|
| staged S225 / S226 / S219 bytes + sha256 | 132,045 B `26fe488d4437`; 454,117 B `7499db18f2b3`; 687,515 B `b0202de1c0b4` | `sha256sum` over `.ufo/waves/round-91/sources/{web-messaging,interaction,input}.html` — matches the lesson and the scorecard |
| receipt identity | schema `tabi-chrome-cdp-showpicker-proxy-r91`, nonce `tabi-r91-l1-1d073adc0b8d`, driver `343eb0f2…3015`, host `Chromium 155.0.8059.84 Arch Linux`, ports 19961/19962/19963, 15 legs, `failures: []` | receipt root |
| fixture hashes | parent `a6ecf367…8bf0`, same `01380a98…5fe36`, child `01380a98…5fe36` (same-child by construction) | `receipt.fixture`, per-leg `parentSha256/sameSha256/childSha256` |
| gate runner | **five** gates: `counter-selftest`, `counter`, `battery`, `killpower`, `drift-selftest` | `scripts/selftest-r91-gates.mjs:37-41`; `scored/selftest.json` lists exactly those five |
| gate numerics | counter 30 checks, battery 44, killpower 32 | `scored/selftest.json` |
| drift gate | clean, `checkCount 8`, `checks` all true, `revision: "21e14593fd4ad7e21664b8e388c7cba96d6cc401"` | `scored/drift-a.json` |
| drift selftest cases | **8** causal cases | `scored/selftest.json` `drift-selftest.checkCount` |
| current instrument bytes | `selftest-r91-gates.mjs` `988c18e5…`; `check-record-drift-round91.mjs` `e2e51c6b…`; `check-showpicker-proxy-round91.mjs` `f2f052f2…` | `sha256sum` |
| lane tip at filing | `a60d2f75` (then `df4ef1fc`, then `21e14593` in that order of age) | `git log --oneline -3` |

---

## 2. (a) Knowledge-note body — independent draft

Target: `corpus/knowledge/chromium-showpicker-proxy-runtime-round-91.md`. Draft below is written to
be admissible as-is (frontmatter, five measured laws, field semantics, limits, frontier).

```markdown
---
source: S225 (WHATWG HTML §9.3.1 — postMessage targetOrigin and the wildcard), S226 (WHATWG HTML §6.4.1 — transient activation duration), S219 (the showPicker() steps: NotAllowedError and the File/Color exemption), S216 (the normative showPicker() algorithm), S221/S222 (CDP Page/DOM, carried); receipt `corpus/evidence/round91/chromium-showpicker-proxy/receipt.json` (driver `scripts/chrome-cdp-showpicker-proxy-round91.mjs`, pin in `.ufo/waves/round-91/freeze.txt`)
verified-at: 2026-11-08 (round 91, Linux host, Chromium 155.0.8059.84 `--headless=new`)
recheck: `node scripts/check-showpicker-proxy-round91.mjs --lane <ABS lane> --receipt corpus/evidence/round91/chromium-showpicker-proxy/receipt.json --expect-driver-sha256 <pin> --expect-nonce tabi-r91-l1-1d073adc0b8d --expect-parent-sha256 <pin> --expect-same-sha256 <pin> --expect-child-sha256 <pin> --prior-set .ufo/waves/round-91/controls/c1/prior-set.txt --json` -> exit 0, 30 checks
---

# The postMessage proxy capability r91 — one element shape, two origins

Capability `chromium-showpicker-proxy-linux` (new, first-working round 91). Round 90 named the
frontier and did not hold it: a same-element origin comparison reachable from both origins through a
`window.postMessage` proxy was "not constructible in the current loopback fixture"
(`chromium-showpicker-runtime-round-90.md` §Frontier). Round 91 constructs it.

## The fixture

A parent document at `http://127.0.0.1:<http>` (19961 in the scored run) holds two iframes: `#so`
at `/same.html` on the *parent* origin, and `#xo` at `http://127.0.0.1:<child>/child.html` (19963) on
a second loopback origin. Both children serve byte-identical documents (sha256 `01380a98…`): the same
three input shapes `#s` (`type=file`), `#dt` (`type=date`), `#co` (`type=color`) with identical rects,
one neutral activation pad `#cpad`, and one `message` handler that (i) accepts only
`e.origin === the parent origin the child was served under`, (ii) calls `showPicker()` on the named
element, and (iii) answers with `e.source.postMessage(result, e.origin)`. The parent owns one
`#ps` (`type=file`) that never receives a file in any leg. S225 grounds the receiving-side discipline:
never target `*` when the message is confidential; read `event.origin` and answer to `event.origin`.

## Field semantics that a reader will otherwise get wrong

`proxy`, `replies` and every `proxyLog` row record `origin` as the **sender's** origin — the parent
origin (19961) — because that is `event.origin` inside the child. The child's own origin appears only
in `fixture.child.origin` / `elements.xo.origin` (19963) and in the chooser's `frameId`. In the
scored receipt every `proxyLog[0].origin` is `http://127.0.0.1:19961` on all 13 proxy legs, including
the cross-origin ones; reading it as "the child's origin" would make `proxy-law` look vacuous.

## The measured laws

1. **No transient activation in either window -> `NotAllowedError`, no chooser, in BOTH iframes.**
   `sp91-so-direct-noact` and `sp91-so-proxy-noact` (same origin) and `sp91-xo-proxy-file-noact`
   (cross origin) all carry `name:"NotAllowedError"`, message `…showPicker() requires a user gesture.`,
   `choosers: []`, and both windows `{isActive:false, hasBeenActive:false}` — the direct and the proxy
   path agree with the trigger path.

2. **A parent click activates the same-origin child and not the cross-origin child.** On
   `sp91-so-direct-parentact` the same-origin child's `showPicker()` returns `undefined` and opens
   exactly one `Page.fileChooserOpened` owned by the same-origin frame; the same-origin child's
   post-leg activation reads `{isActive:false, hasBeenActive:true}` — the parent click propagated into
   the same-origin child and was then *consumed by the successful call*. On
   `sp91-xo-proxy-file-parentact` the SAME parent click leaves the cross-origin child at
   `{isActive:false, hasBeenActive:false}`, its proxy call throws `NotAllowedError`, `choosers: []`,
   while the parent window itself reads `{isActive:true, hasBeenActive:true}` (the throwing call did
   not consume it). The `hasBeenActive` split — true in the same-origin child, false in the
   cross-origin child, from one click — is the measured origin asymmetry.

3. **A click inside the cross-origin child opens its picker.** `sp91-xo-proxy-file-childact`: proxy
   result `undefined`, exactly one chooser whose `frameId` is the cross-origin child frame.
   `sp91-xo-proxy-file-answer` repeats it and then answers through `DOM.setFileInputFiles` on that
   chooser's `backendNodeId` (10): `childState: [["tabi-r91-answer.txt", 22, "text/plain"]]`,
   `parentState: []` — the file lands in the child input and the parent `#ps` stays empty.

4. **The exemption is measured through the proxy, and it does not extend to date.** Cross-origin
   `type=date` throws `SecurityError` (`…showPicker() called from cross-origin iframe.`) in BOTH
   activation states (`sp91-xo-proxy-date-noact`, `sp91-xo-proxy-date-childact`), `choosers: []`.
   Cross-origin `type=color` returns `undefined` with **no chooser event at all**
   (`sp91-xo-proxy-color-childact`, `choosers: []`), and the same-origin date under child activation
   also returns `undefined` with `choosers: []` (`sp91-so-proxy-date-childact`) — so "success" for
   date/colour is *the absence of an exception and of a FILE chooser*, not an observed picker.
   S219 is the normative ground for the split (NotAllowedError without activation; SecurityError
   inside a cross-origin iframe unless File Upload or Color).

5. **The parent cannot reach the cross-origin child directly.** `sp91-xo-direct-access`:
   `contentDocument: null`, `contentWindow.document` -> `SecurityError`, and the follow-on
   `getElementById` on the null document -> `TypeError: Cannot read properties of null (reading
   'getElementById')`. The proxy is the only path; that is why the proxy is the capability and not a
   convenience.

6. **Transient activation is consumed by success and survives a throw.** Post-leg reads: `isActive`
   false on every leg whose call returned `undefined`; `isActive` true on the two legs whose call
   threw with activation present (`sp91-xo-proxy-file-parentact` parent window,
   `sp91-xo-proxy-date-childact` both windows). `hasBeenActive` stays true on every post-activation
   leg. S226 grounds the few-second window and the consuming APIs.

## What the receipt cannot prove

- The proxy is a lane fixture convention: the child accepts `e.origin === its served parent origin`.
  Chromium's own origin check is measured only *through* that fixture.
- The native date and colour pickers are unmeasured. A date/colour "success" is the absence of a
  `Page.fileChooserOpened` event, not a UI observation.
- The answer is programmatic (`DOM.setFileInputFiles`); a human dialog is unmeasured.
- The activation states are the driver's post-leg reads, not a per-millisecond trace.
- The cross-origin child's document is byte-identical to the same-origin child's; the difference the
  receipt measures is the *served origin*, not the markup.
- The counter reads a receipt: a forger who rewrites every identity field and regenerates all
  synthetic launch tokens and devtools ids is outside the replay rule (the limit the counter prints).

## Frontier (named, not held)

- The colour popup itself (a UI-side probe, or a source-side reading of the colour chooser path).
- A second browser build (Edge/WebView2) for the proxy capability; this round pins one Chromium.
- Real-site cross-origin frames (operator approval absent; loopback only).
- The same-origin **proxy** arm under parent-only activation. Fifteen legs carry the same-origin
  proxy under child activation (`sp91-so-proxy-childact`) but not under a parent click; the direct
  arm covers parent activation. A leg `sp91-so-proxy-parentact` needs its own fresh activation
  because a successful `showPicker()` consumes it.
```

### Divergences from the committed note

| # | Committed text (verbatim) | Problem | My draft |
|---|---|---|---|
| N1 | "(`sp91-so-direct-parentact`, `sp91-so-proxy-childact` are the child-click arms; the parent-click arm is `sp91-so-direct-parentact`)" | Self-contradictory: it names `sp91-so-direct-parentact` as both a child-click arm and the parent-click arm, and `sp91-so-proxy-childact` is *child*-activated (`childPad:true` on the receipt). | No such parenthetical; arms are named per law, and the missing same-origin proxy-under-parent-activation arm is disclosed as a frontier (last bullet). |
| N2 | law 2: "its direct and proxy calls both return undefined and open exactly one chooser owned by that frame" | Unbound and self-defeating: no same-origin proxy leg runs under a parent click, and — per the note's own law 6 — one activation is consumed by the first success, so one activation cannot open "exactly one chooser" through two calls. | Law 2 states the direct call's success and the cross-origin proxy's `NotAllowedError`, and nothing more. |
| N3 | law 2: "the cross-origin child stays inactive" | True but weaker than the bytes: the receipt carries the *pair* `hasBeenActive:true` (same-origin child) vs `false` (cross-origin child) from the same click. | The `hasBeenActive` split is stated as the measured asymmetry, with both records cited. |
| N4 | law 4: "the colour input returns `undefined` and opens no FILE chooser" | "No FILE chooser" is narrower than measured: `choosers: []` on the colour leg — no chooser event of any mode was opened. The same holds for the same-origin date leg, which the committed note does not mention. | "no chooser event at all", plus the `sp91-so-proxy-date-childact` fact. |
| N5 | law 5: "a `getElementById` on the null document is a `TypeError`" | The receipt records the TypeError inside the `showPicker` field of `crossAccess`; the committed sentence needs the reader to know `crossAccess.showPicker` is the throw site. | Field named (`crossAccess.showPicker`). |
| N6 | ""proxy", "replies", "proxyLog" rows never define `origin`" | The receipt's `origin` is the *sender* (parent) origin on all 13 proxy legs, including cross-origin ones; the committed note does not say so, and `R91Exec4`'s accepted `proxyLog.origin` mutants hinge on exactly this. | A "field semantics" section before the laws. |
| N7 | "Fifteen legs, one fresh browser per leg." / fixture section | Does not state the parent document's own sha256 (`a6ecf367…`) or that both children are byte-identical (`01380a98…`), so the "same element shape" claim rests on the counter rather than on the note. | Both hashes named in the fixture section. |

Nothing in my draft changes a law, a leg name or a numeral: 15 legs, 13 proxy legs, one chooser per
successful leg, 22 B answer, five laws, same limits, same frontier (plus one disclosed leg gap).

---

## 3. (b) Lesson Gate source rows — draft

Draft `### Sources — opened this round` body. Anchors are line numbers in the staged plain text
(`.ufo/waves/round-91/sources/`); quotes are transcribed from the rendered text with tag boundaries
closed up.

```markdown
### Sources — opened this round

The L1 and the wave's scout fetched the living pages on 2026-11-08 and staged them under
`.ufo/waves/round-91/sources/`; the staged bytes hash to the live bytes.

- **S225** — WHATWG HTML §9.3.1 Cross-document messaging, the `targetOrigin` note
  (`web-messaging.html:111-113`; fetched 2026-11-08, 132,045 B, sha256 `26fe488d4437`):
  "Authors should not use the wildcard keyword (*) in the targetOrigin argument in messages that
  contain any confidential information" (19 words).
- **S226** — WHATWG HTML §6.4.1 Tracking user activation, data model (`interaction.html:519-520`;
  fetched 2026-11-08, 454,117 B, sha256 `7499db18f2b3`): the sentence begins "A user agent also
  defines a transient activation duration, which is a constant number indicating how long a user
  activation is available for certain user activation-gated APIs" (21 words from "A user agent";
  22 words for the quoted fragment that starts at "a transient") — the quoted fragment omits the
  leading "A user agent also defines" and the trailing "(e.g., for opening popups)".
- **S219** re-opened in place, not superseded (`input.html:5605-5610`; fetched 2026-11-08,
  687,515 B, sha256 `b0202de1c0b4`): "Throws a 'NotAllowedError' DOMException if called without
  transient user activation." (10 words) and "Throws a 'SecurityError' DOMException if input is
  inside a cross-origin iframe, unless input is in the File Upload or Color states." (21 words).
  Word counts treat each quoted DOMException name as ONE word; the HTML text nodes insert spaces
  inside the quotation marks, so a naive whitespace split of the printed form yields 12 and 24. The
  spaced punctuation (`iframe ,`) is a text-node boundary, not source punctuation.

Identified 3 / screened 3 / included 2 NEW rows / excluded 0 for a NEW row (S219 re-opened; its
`used-by` gained the r91 note, old→new: `…round-80.md, …round-81.md` → `…round-80.md, …round-81.md,
corpus/knowledge/chromium-showpicker-proxy-runtime-round-91.md`). Registry 224 → 226. `## Search log`
carries the round-91 entry.
```

Word-count verification I performed (this seat, on the staged bytes):

| Quote | Rendered exactly as | Count (quoted name = 1 word) | Naive whitespace split |
|---|---|---|---|
| S225 wildcard sentence fragment | `web-messaging.html:111-113` | 19 | 19 (no markup artifacts) |
| S226 duration fragment | `interaction.html:519-520` | 22 | 22 (`(e.g.,` excluded by the fragment) |
| S219 NotAllowedError | `input.html:5605-5606` | 10 | 12 (the two standalone `"` tokens) |
| S219 SecurityError exemption | `input.html:5608-5610` | 21 | 24 (the two standalone `"` tokens) |

Divergences from the committed lesson block:

| # | Committed | My draft |
|---|---|---|
| G1 | Both S219 quotes print as `" NotAllowedError "` / `" SecurityError "` with no convention stated, and carry 10 / 21 words. | Same numbers, but the convention is stated and the naive-split trap is named — otherwise any reviewer recounting gets 12 / 24 and files a false defect (this is exactly the shape of the `r89-s224-mark` 31→17 defect the C2 gate now counts). |
| G2 | S226 row quotes a fragment with no sentence start, so "22 words" has no visible begin. | Draft states the full sentence start ("A user agent also defines") and gives both counts. |
| G3 | "included 2 NEW rows / excluded 1 for a NEW row (S219 re-opened…)" — the `excluded 1` counts no exclusion (S219 is a re-open, not a rejection). | "excluded 0 for a NEW row (S219 re-opened…)" — the tally matches the sentence that follows it. |
| G4 | S226 described as "§6.4.1 Data model" with the quote about duration; my anchor is the same paragraph (`interaction.html:519`), so no change in substance — the section number is left as the committed one because I did not re-derive the section heading from the staged bytes. | Flagged, not changed: `[INFERENCE]` on §6.4.1, verified only that the paragraph exists at that line. |
| G5 | S219 has no anchor. | `input.html:5605-5610` added; a reviewer can recount in two greps. |

`[INFERENCE]` markers in this section: the section *numbers* (§9.3.1, §6.4.1) are taken from the
committed artifacts; I verified only that each quoted string occurs in the staged file at the cited
line.

---

## 4. (c) SCORECARD round-91 section — draft wording

### Claim table (two rows), with the numerics the bytes support

```markdown
| Claim / axis | Counting command (frozen predicate) | Before → after | Verdict |
|---|---|---|---|
| C1 coverage (9), capability `chromium-showpicker-proxy-linux` (sourced: S225/S226/S219) | `node scripts/check-showpicker-proxy-round91.mjs --lane <ABS lane> --receipt corpus/evidence/round91/chromium-showpicker-proxy/receipt.json --expect-driver-sha256 <pin> --expect-nonce tabi-r91-l1-1d073adc0b8d --expect-parent-sha256 <pin> --expect-same-sha256 <pin> --expect-child-sha256 <pin> --prior-set .ufo/waves/round-91/controls/c1/prior-set.txt --json` (predicate `C1-SHOWPICKER-PROXY-R91`); leg (b) battery + kill power; leg (c) capability row, knowledge note, SKILL registry, **five-gate** runner | base: no r91 receipt → exit 2 `receipt-unreadable`; proxy-flip control → exit 1 `law`; post-removed control → exit 1 `plan-calls`; r90 receipt under the r91 counter → exit 1 (schema among the findings); scored receipt → exit 0, **30 checks**, 15 legs, `failures: []`; battery **44/44**; kill power **32/32** killed, 0 survived/crashed/unapplied | **VERIFIED** on the predicate |
| C2 calibration (9), the six lane-measurable r90 spot-check §8 defects (`scripts/check-record-drift-round91.mjs`, predicate `C2-RECORDDRIFT-R91`) | `node scripts/check-record-drift-round91.mjs --lane <ABS lane> --json` (exit 0 iff 8 statements, 0 findings) | before (base `b1d8f07b` worktree): **8 findings**; after: **0 of 8**, `checkCount 8`; `--selftest` ok, **8 causal cases**; §8 items 4 and 6 disclosed as fleet-report/process, not counted | **VERIFIED** on the predicate, counted set stated (no widening) |
```

Two wording rules I would enforce in the table and that the committed table breaks:

- **Do not print a gate count and the gate names in one sentence unless they agree.** The committed
  round-91 prose has `"SKILL.md `## Round 91 gate registry` registers the six r91 instruments;
  `scripts/selftest-r91-gates.mjs` runs them in order (five gates)."` — six registered instruments is
  true (six `run(...)`-able scripts), five gates run is true
  (`selftest-r91-gates.mjs:37-41` = `counter-selftest, counter, battery, killpower, drift-selftest`),
  but the sentence reads as a defect. My draft prints the gate list, not a bare numeral.
- **Do not say "at the committed tip" when the artifact carries a `revision` nobody verified.**
  `scored/drift-a.json` records `revision: "21e14593…"`; `plans/round-91.md` §Limits records that
  `--revision` is an unverified echo and the gate reads the working tree. My draft writes "after:
  0 of 8" and leaves the revision to the plan's disclosure.

### Capability row

```markdown
| `chromium-showpicker-proxy-linux` | Reach the same file/date/colour input shapes in a same-origin and a cross-origin iframe through a `window.postMessage` proxy that accepts only the served parent origin, and measure the origin laws: no activation → `NotAllowedError` and no chooser in both iframes; a parent click → same-origin child `showPicker()` returns `undefined` with one same-origin-owned chooser and the child's `hasBeenActive` true, cross-origin child `NotAllowedError` with `hasBeenActive` false and the parent's activation unconsumed; a child click → cross-origin success with one cross-origin-owned chooser, and `DOM.setFileInputFiles` on it delivers a 22 B file to the child input while the parent input stays empty; cross-origin `type=date` → `SecurityError` in both activation states; cross-origin `type=color` → `undefined` with no chooser event; direct cross-origin access → `contentDocument:null`, `SecurityError`, `TypeError` | `corpus/evidence/round91/chromium-showpicker-proxy/receipt.json` (nonce `tabi-r91-l1-1d073adc0b8d`, driver `343eb0f2…`, 15 legs, `failures: []`); counter `30 checks`; battery `44/44`; kill power `32/32`; note `corpus/knowledge/chromium-showpicker-proxy-runtime-round-91.md`; gates `scripts/selftest-r91-gates.mjs` (five) | 91 |
```

Wording change vs the committed row: the committed row says "a parent click → success + one
parent-owned chooser same-origin" and, in the same table cell, does not say the cross-origin child's
`hasBeenActive` is the thing that distinguishes the two. It also omits the parent's
unconsumed-activation fact. Both are on the receipt (`sp91-so-direct-parentact`,
`sp91-xo-proxy-file-parentact`) and are the row's actual payload.

---

## 5. (d) Three `## Mistakes` candidates

| # | class | evidence | captured-by | fix |
|---|---|---|---|---|
| M1 | `claim-clause-unbound` — a frozen claim clause names two calls ("its direct and proxy calls return undefined and open exactly one chooser") that no single leg can produce, and no same-origin proxy leg under parent activation exists | `claims.json` C1 `type` law (2); receipt leg list has `sp91-so-proxy-noact`, `sp91-so-proxy-childact`, `sp91-so-proxy-date-{noact,childact}` but no `sp91-so-proxy-parentact`; counter expectations bind `sp91-so-direct-parentact` (direct only, `check-showpicker-proxy-round91.mjs:243`) and `sp91-xo-proxy-file-parentact` (`:250`); the committed note's own law 6 says a successful call consumes the activation, so one activation cannot open a chooser through two successes | the claim was written from the *design intent* (two origins, two calls) and the leg table was written one leg per (frame × mode × activation); nothing compared the clause to the leg cross-product, and the note's parenthetical at law 2 hedges instead of disclosing the gap | r92 leg `sp91-so-proxy-parentact` with its own fresh activation, then the clause reads "the same-origin child's direct call under a parent click succeeds; the same-origin child's proxy path is measured under its own click" — or the clause is narrowed to the direct call. The gap is disclosed now in the frontier, not amended in the frozen claim |
| M2 | `pin-map-not-refreshed-on-re-freeze` — the claims' `pins` object still carries D1 sha256 for two instruments that D2/D3 changed, so the claim artifact and the pin file disagree | `claims.json` `pins["scripts/selftest-r91-gates.mjs"] = e151c99a…` and `pins["scripts/check-record-drift-round91.mjs"] = 466496e1…`; `freeze.txt` lines 5-6 and `sha256sum` say `988c18e5…` and `e2e51c6b…`; `freezeHistory` D2/D3 disclose the instrument changes but not the pin map; `freeze.txt` footer digest `12cbe8a0267f` vs `claims.digestsCommit 1d073adc0b8d` | the re-freeze discipline covered the *pin file* (rewritten, and now repaired to read the nonce from `claims.json`) and the plan's §Re-freeze history, but no step asserted "claims.pins == freeze.txt lines"; the six literal pins live in two artifacts and only one was regenerated | one generator: `freeze.sh` emits both the pin file and the `pins` block (or the claims reference the pin file and carry no literals), plus a drift-gate statement `pins-match-freeze` over the pair. Until then, every reader must treat `freeze.txt` as the pin authority and the claims' two stale literals as historical |
| M3 | `plan-numeral-copied-not-measured` — two instrument counts were copied from the pre-freeze plan into the frozen claim and survived the instrument change that falsified them | `claims.json` C1 leg (c) "gate runner green (six gates)" vs `scripts/selftest-r91-gates.mjs:37-41` (five) and `scored/selftest.json` (`gates` length 5); `claims.json` C2 leg (c) "10 causal cases" vs `scored/selftest.json` `drift-selftest.checkCount` length 8 and `plans/round-91.md` §Limits ("The `--selftest` is 8 causal cases, not 10") | the numerals were typed into the claim before the instruments existed in final form; after D2 (runner 6→5) and the counter's own case count was measured, the *plan* was corrected on record but the two claim literals were not re-read — a frozen claim cannot be amended, and nothing in the armory re-reads a frozen claim against the shipped instrument | r92: C-leg numerals should be *emitted* by the instrument (`checkCount` read from the run output, never typed), and the gate runner should assert its own gate list length against the claim string it prints. Disclose the two numerals now as frozen-claim-vs-instrument divergence (the plan already carries the correction) |

Spare candidate (fourth, not offered as one of the three because it is a convention, not a defect):

| `quoted-name-double-counted` | word counts 10/21 are right only if a quoted DOMException name is one word; the printed quote splits it into three tokens | `corpus/lessons/round-91.md` S219 row vs `input.html:5605-5610` (`sha256` recount: naive split 12 / 24) | the counts were taken on the rendered sentence, the lesson prints the tag-stripped form | state the convention next to the count, or count on a normalized string and print the normalized string |

---

## 6. Findings handed to the canonical judge (verbatim conflicts, no amendment proposed)

1. **`claims.json` C1 leg (c) "six gates" vs five executed gates.** Evidence: `selftest-r91-gates.mjs:37-41`;
   `scored/selftest.json` `gates` = `counter-selftest, counter, battery, killpower, drift-selftest`.
   The committed SCORECARD already prints "five gates", so the frozen claim and its own record
   disagree in wording while both are green.
2. **`claims.json` C2 leg (c) "10 causal cases" vs 8.** Evidence: `scored/selftest.json`
   `drift-selftest.checkCount` has 8 entries; `plans/round-91.md` §Limits records the correction.
   A frozen claim whose numeral its own scored artifact contradicts: the judge should read this as a
   recorded divergence, not as a gate failure (the gate itself passed at 8).
3. **`claims.json` `pins` vs `freeze.txt`** — two sha256 literals are stale (`e151c99a…`, `466496e1…`
   vs current `988c18e5…`, `e2e51c6b…`), and the freeze file's own digest footer (`12cbe8a0267f`)
   differs from `claims.digestsCommit` (`1d073adc0b8d`). The Target's phrase "instrument freeze D1
   (sha256 in freeze.txt)" no longer describes the file's content: the file on disk is the D3
   re-freeze (only `freeze-12cbe8a0267f.txt` and `freeze.txt` exist, byte-identical, and the D1/D2
   bytes are gone — `plans/round-91.md` §Limits discloses this as Sentinel F3/F5 and records the
   repair to `freeze.sh`).
4. **C1 law (2) "direct and proxy calls … open exactly one chooser"** is unbound by any leg and is
   in tension with law 6 (activation consumed by success). Counter expectations bind the direct arm
   only (`:243`) plus the cross-origin proxy arm (`:250`). The committed note's attempt to name the
   arms is self-contradictory (N1 above). Whether this falsifies the claim is the judge's call; the
   receipt's `sp91-so-direct-parentact` and `sp91-xo-proxy-file-parentact` do bind the *asymmetry*
   the claim is really about.
5. **"at the committed tip"** in the SCORECARD tallies: `scored/drift-a.json.revision` is
   `21e14593fd4ad7e21664b8e388c7cba96d6cc401`; the lane has since moved to `df4ef1fc` and `a60d2f75`;
   `plans/round-91.md` §Limits records `--revision` as an unverified echo. Not a gate defect; a
   wording claim the artifact cannot carry.
6. **Precision gain, no defect:** `proxy`/`proxyLog[].origin` is the sender (parent) origin on all 13
   proxy legs (19961), while the cross-origin child's origin is 19963. Any r92 mutant/reviewer reading
   `origin` as "the child's origin" will mis-model `proxy-law` (and `R91Exec4`'s M04/M38 mirror is
   exactly this).

---

## 7. Unfinished (explicit)

- I did **not** re-run the frozen counter, the battery, kill power or the gate runner. Every numeric
  in this report is read from `scored/selftest.json`, `scored/drift-a.json`, `scored/drift-before.json`
  or the receipt — none is a fresh execution. Anything labelled a re-measure belongs to `R91Exec*`,
  not to this seat.
- I did **not** recount the 44 battery cases or the 32 mutants case-by-case; I report the counts the
  scored artifacts carry.
- I did **not** verify the S219/S226 *section numbers* (§9.3.1, §6.4.1) against the staged headings —
  marked `[INFERENCE]` above.
- I did **not** draft the LOG round-91 entry, the plan §Re-freeze history text, or the `SKILL.md`
  gate-registry block; the seat spec asked for (a)-(d) only.
- Divergences N1-N7 and G1-G5 are **drafts compared against the committed text**, not edits: the lane
  is committed and this seat may not edit lane files.

## 8. Scratch

`/fast/scratch/hyaku/tabi-r91/R91Scribe` was created with `mkdir -p`, used only for a `python3`
heredoc that read the staged sources (no artifacts were left behind), and is removed before yield.
This report is the only file this seat wrote.

## 9. Tooling

No installs, no upgrades, no package transactions (host-wide pacman pause respected). Tools used:
`python3` (system), `node` (system, v24.21.0 per the receipt's host block), `git` read-only,
`sha256sum`, `grep`.
