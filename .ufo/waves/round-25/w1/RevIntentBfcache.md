# RevIntentBfcache — why round 24 shipped bfcache as documented-upstream, and what the round-25 harness must change

Seat `L1Tabi25.RevIntentBfcache` (revenger, read-only leaf). Lane tip at read time
`c8ef3084c6363f265b9d23285296ab3547654f57` (`git rev-parse HEAD`). Baseline `9e13666` is its
parent: `git merge-base --is-ancestor 9e13666… HEAD` returned OK, and `git log 9e13666..HEAD`
lists one commit, `c8ef308 round-25: freeze claims, controls, census-before, wave-1 spec`.
I ran no browser and no server, made no network fetch, installed nothing, and wrote only this file.
I had no LSP server for these files (markdown, JSON, a vendored bundle), so every location below
comes from text search (`grep`/`git grep`) and is literal evidence, not semantic proof.

## TL;DR

- **The launch flag did not stop the round-24 probe. Policy did, and policy was settled before
  any seat ran.** Three layers excluded a browser run:
  1. The wave contract banned browsers. `.ufo/waves/round-24/gen-w1.mjs:42` says "never start
     services, never open a browser"; `gen-w2.mjs:36` says the same.
  2. The claim's metric needed no runtime. C3 was frozen as "frontier-entry admission
     (documented-upstream)", and its counter counts `^source: S10[45]` lines.
  3. `notClaimed` said so outright: "no new browser run, real site, default profile, served-wire
     identity or bfcache observation on this host" (`.ufo/waves/round-24/claims.json:60`).
- **The flag was named as the cause afterwards, and the correction only partly landed.** Wave 1
  read 140 Playwright-launched receipts as "the lane's harness". Wave 2 falsified that (it is a
  Playwright default, and no committed probe has ever performed a history step). Integration fixed
  `corpus/README.md:582` but left the entry's wording (`navigation-history-bfcache-evidence.md:11-14`
  and §4.2) and the LOG next-iteration (`LOG.md:1785-1786`) unchanged.
- **The round-25 harness has three new hazards the round-24 chain never reached:**
  1. **`Page.goBack` does not exist in CDP.** The frozen claim and the ExecHarnessC1 spec both
     name it. The pinned Page domain has `getNavigationHistory` and `navigateToHistoryEntry` only,
     and Playwright's own `goBack()` is built from those two calls.
  2. **The SKILL.md recipe launches the `chromium` wrapper.** The wrapper injects
     `~/.config/chromium-flags.conf`, which includes a `--load-extension`.
  3. **Eligibility of the A→B→A fixture.** The page must avoid the disqualifiers listed in
     "What the round-25 harness must do differently" below.
- **History-step precedent: none.** The round-3 multi-step journey only ever moved forward:
  index → detail → form → confirm, ending at "currentIndex 4 of 5 entries". It read history but
  never navigated it.

## 1. The chain that stopped a probe in round 24 (evidence chain, in order)

| # | Link | Location (quote) | Kind |
|---|---|---|---|
| 1 | The wave-contract boilerplate first bans browsers in round 23 and is carried verbatim into round 24 | `round-23/gen-w1.mjs:33` and `round-24/gen-w1.mjs:42`: "never start services, never open a browser, never probe external sites beyond the single documented HTTP GET your item names". Per-round sweep (`for r in 16..25; grep -o 'never open a browser\|MAY launch a local python http.server…' round-$r/gen-w1.mjs`): r16–r22 have no `gen-w1.mjs`; r23 and r24 have the ban; r25 has "loopback fixture: you MAY launch a local python http…" | observed |
| 2 | C3 was sized to a counter that a doc entry alone satisfies | `round-24/claims.json` C3 `type`: "frontier-entry admission (documented-upstream)"; `countingCommand`: `git grep -lE '^source: S10[45] ' <REV> -- corpus/knowledge \| wc -l`; `before 0`, `after 1` | observed |
| 3 | `notClaimed` excluded the observation outright | `round-24/claims.json:60`: "no new browser run, real site, default profile, served-wire identity or bfcache observation on this host" | observed |
| 4 | The round prompt's frontier step needed only a *sourced* claim, not a runtime one | `/home/vgpnk/Projects/shokunin/.ufo/prompts/tabi-round-24.md:73-74`: "At least one sourced claim — one of the round's claims rests on a `SOURCES.md` row opened this round" | observed |
| 5 | The scribe seat was told not to run anything | `round-24/gen-w1.mjs:73` (ScribeKnowledgeEntry): "Documented-upstream only: no runtime claim, no browser run, no measured credit" | observed |
| 6 | **The misattribution starts here.** The wave-1 reviewer framed the flag as a lane-harness property and as the runtime blocker | `round-24/w1/RevEntryQuality.md:112-114`: "**Prerequisite 2**: the lane's harness currently launches with `--disable-back-forward-cache` … a runtime observation of a restore is impossible under that flag"; `:48-49`: "the lane's own harness has historically **disabled** bfcache" | observed |
| 7 | The wave-1 distiller carried it forward as a NOTE | `round-24/w1/DistillW1.md:61` (C3-03): "if a runtime observation is ever added, it must drop `--disable-back-forward-cache`" | observed |
| 8 | The entry absorbed the framing | `navigation-history-bfcache-evidence.md:11-14`: "its own probe harness has historically launched with `--disable-back-forward-cache` (`.ufo/waves/round-17/`, round-18/19 receipts)"; §4.2 `:68-69`: "Any probe that intends to observe restores must drop `--disable-back-forward-cache`" | observed |
| 9 | Wave 2 falsified the framing on two fronts | `round-24/w2/RevEntryBfcache.md:77-89` (F6): "The flag is a **Playwright default**, not a lane-chosen launch arg … a probe needs `ignoreDefaultArgs: ['--disable-back-forward-cache']`". `round-24/w2/RevFrontierRows.md:39-63` (F2): 140 of 141 committed argv arrays carry the flag, all from Playwright launches; 1 does not; "no committed probe performs a history step"; the history-step grep → "zero hits". Distilled as `DistillW2.md:86` (C3-P1-8) and `:100` (PROSE-P1-3) | observed |
| 10 | Integration fixed one of three surfaces | `git diff f6f7f45 2f35bd4 -- corpus/knowledge/navigation-history-bfcache-evidence.md \| grep -E '^[-+]' \| grep -iE 'disable\|harness\|history step\|Playwright\|ignoreDefault'` → no lines, so the entry's flag sentences are unchanged since `f6f7f45`. `git show 9e13666:corpus/README.md \| sed -n 582p` → "no committed probe performs a history step at all (the `--disable-back-forward-cache` launch flag was a Playwright default, not a lane policy)" — corrected. `LOG.md:1785-1786` still frames the flag as the gate: "Observe a real `BackForwardCacheRestore` on a loopback fixture with `--disable-back-forward-cache` dropped" | observed |
| 11 | The round-24 lesson does not mine this | `corpus/lessons/round-24.md` §Mistakes holds only M1 (counter association) and M2 (stale tally) | observed |

**Reconstructed contract (inference, from links 1–5).** Round 24 used its claim slots on two
meta-gates (C1 operability, C2 calibration). It took coverage as a docs-held frontier entry
because that satisfied §2b's "sourced claim" requirement inside a wave contract that already
banned browsers. [INFERENCE: no artifact states this reasoning. It is the only reading consistent
with the claim freezing before data (`frozenBeforeData`) and the browser ban being boilerplate
copied from round 23.] The flag never had a chance to matter: no browser was going to launch. It
became the *stated* reason only in links 6–8, as post-hoc framing.

**Where behaviour diverges from the last-known-good invariant.** The lane's own raw-CDP harness
never carried the flag. Evidence:
- `SKILL.md:127-132` (runbook step 4): `chromium --headless=new --remote-debugging-port=19412 …
  --no-first-run --no-default-browser-check --disable-gpu --disable-background-networking
  about:blank`. No `back-forward` token.
- `multi-step-journey.md:47-48`: requested set `--remote-debugging-port=19422
  --remote-debugging-address=127.0.0.1 --disable-gpu --disable-background-networking`.
- The one non-Playwright launch from rounds 16–19, `.ufo/waves/round-17/probes/invoke-concurrency.json`
  `browser.effectiveArgv` (commit `6c97851`). It spawns `/usr/lib/chromium/chromium` directly with
  13 tokens and no flag (node walk of the JSON's `*argv` keys).

The flag enters only through Playwright's built-in launch defaults:
`corpus/evidence/round-13/aria/node_modules/playwright-core/lib/coreBundle.js:36212`
(`chromiumSwitches`, playwright-core `1.64.0`) reads `"--disable-back-forward-cache", // Avoids
surprises like main request not being intercepted during page.goBack().` Prevalence:
`git grep -l -- '--disable-back-forward-cache' HEAD -- ':!corpus/evidence/round-13/aria/node_modules/**' | wc -l` → 38 files.
Of those, receipts and probes sit only under rounds 16–19 (`corpus/evidence/round-16..19`:
1+2+8+7; `.ufo/waves/round-17..19`: 4+2+1). The rest are round-24/25 prose and specs that quote
the flag.

**The actual technical gap.** No committed probe has ever performed a history step:
`git grep -n -E 'navigateToHistoryEntry|goBack|history\.back\(|history\.go\(|history\.forward\(' HEAD -- scripts .ufo/waves/*/probes corpus/evidence ':!…node_modules' ':!corpus/evidence/round-24/sources' ':!corpus/evidence/w4-erb-b-append-proof' | wc -l`
→ 0. This matches ScoutFrontierSweep (round-25 w1) sweep (c) at `9e13666`.

## 2. History-step precedent in the older runbooks: none

`corpus/knowledge/multi-step-journey.md` (round 3) step list, `:30-37`, verbatim:

> Journey as executed (browser-driven; the driver never fetches fixture URLs itself):
> `Page.navigate` → `http://127.0.0.1:19421/index.html` (journey.mjs:253) → click `#item-1`
> (href `detail.html?id=1`) → click `#to-form` (href `form.html?id=1`) → click `#traveler`,
> `Input.insertText 'tabi-r3'` (journey.mjs:295), click `#mode-rail` → click `#submit` (form action
> `confirm.html`, GET) → confirm page.

Step table, `:80-85`: `step-1-index` navigate · `step-1-index-idem` re-capture · `step-2-detail`
click · `step-3-form` click · `step-3-form-filled` insertText + radio + blur · `step-4-confirm`
submit. History witness, `:107-110`: "`about:blank` auto_toplevel → `/index.html` **typed** →
`/detail.html?id=1` **link** → `/form.html?id=1` **link** → `/confirm.html?…` **form_submit**;
currentIndex 4 of 5 entries."

So the journey never went back. `currentIndex` ends at the last entry. The driver calls
`Page.getNavigationHistory` only as a read-back witness (`corpus/evidence/tabi-r3-1-journey/journey.mjs:200`
and `:328`; `git grep -c` → 2) and never `navigateToHistoryEntry`. Every committed descendant
(`tabi-r4-1-network`, `tabi-r4-2-async`, `w4-aud-tab1`, `w6-*/v2-journey.mjs`,
`w9-tabi-b91/journey.mjs`) is in the zero-hit sweep above.

**What is reusable.** Rules-delta 1 (`:234-236`, "Record navigation history per step.
`transitionType` … is a browser-side witness") and the `getNavigationHistory` read-back pattern
give a ready before/after witness for the back step. The new element is the step itself.

## 3. What the round-25 harness must do differently

### 3.1 History-step mechanism. Divergence: `Page.goBack` is not a CDP method

- Observed. `grep -c goBack corpus/evidence/round-24/sources/page.pdl` → 0. The Page domain at the
  pinned tag has `command getNavigationHistory` (`:850`, returns `currentIndex` and `entries`) and
  `command navigateToHistoryEntry` (`:913`, parameter `integer entryId`).
- The frozen claim reads "via CDP Page.goBack" (`round-25/claims.json` C1 `declared`). The
  ExecHarnessC1 item reads "navigate A -> B -> A using Page.goBack … zero npm deps beyond built-in
  WebSocket" (`round-25/w1-spec.json`). A raw-CDP `Page.goBack` call will fail. [INFERENCE: the
  method-not-found error shape is unmeasured here.]
- Precedent for the real mechanism, observed: Playwright's `goBack()` is
  `coreBundle.js:38765-38771`:
  `send("Page.getNavigationHistory")` → `history.entries[history.currentIndex + delta]` →
  `send("Page.navigateToHistoryEntry", { entryId: entry.id })`.
- **Required:** do exactly that with delta −1. Record:
  - the step as `action: "goBack"` (the vocabulary of the frozen control
    `round-25/control/fake-receipt-bfcache.json`, `steps[2].action`, and the counter prototype's
    rule (a)) with `mechanism: "Page.navigateToHistoryEntry"`;
  - the `entryId`;
  - the `getNavigationHistory` result before (`currentIndex` 2, entry at B) and after
    (`currentIndex` 1, entry at A).

  That gives the kill rule its "matching before/after target". Report the wording mismatch as a
  claim-text divergence, never as a reason to edit the frozen claim. `Runtime.evaluate("history.back()")`
  is a fallback; it is a renderer-initiated step, and the receipt must say which mechanism ran.

### 3.2 Flags and binary

- **Disabling flags.** The effective argv must contain neither `--disable-back-forward-cache` nor
  any `--disable-features=` value containing `BackForwardCache`. Check the *effective* command line
  (`/proc/<pid>/cmdline` of the browser process), not the requested list. That is what the claim's
  kill rule judges, and the PDL names the failure mode: `BackForwardCacheDisabledByCommandLine`
  (`page.pdl:1537`). Playwright's `disabledFeatures` list (`coreBundle.js:36170-36196`) does not
  include `BackForwardCache`; the only Playwright-borne blocker is the switch at `:36212`. If a
  Playwright-based harness is used anyway, it needs `ignoreDefaultArgs: ['--disable-back-forward-cache']`
  (RevEntryBfcache F6). A raw-CDP harness avoids the issue by construction.
- **Bypass the host wrapper.** `chromium` on this host is the Arch launcher `/usr/bin/chromium`,
  an ELF whose strings include `chromium-flags.conf` and `/usr/lib/chromium/chromium` (`file`, `head`).
  `~/.config/chromium-flags.conf` (212 B) injects:
  - `--ozone-platform=wayland`
  - `--ozone-platform-hint=wayland`
  - `--enable-features=TouchpadOverscrollHistoryNavigation`
  - `--load-extension=~/.local/share/omarchy/default/chromium/extensions/copy-url`
  - `--disable-features=Vulkan`

  `multi-step-journey.md:44-48` confirms these reappear in the effective child line, and the
  SKILL.md recipe (`:127`) calls `chromium`. A loaded extension is a named refusal class in the PDL
  enum: `EmbedderExtensions` `:1650`, `EmbedderExtensionMessaging` `:1651`,
  `EmbedderExtensionMessagingForOpenPort` `:1652`. [INFERENCE: whether copy-url triggers any of them
  is unmeasured.] A second `--disable-features` could also interact with any the harness passes
  [INFERENCE].
- **Required:** spawn `/usr/lib/chromium/chromium` directly (precedent: round-17
  `invoke-concurrency.json` `effectiveArgv[0]`), with `--headless=new
  --remote-debugging-port=<p> --remote-debugging-address=127.0.0.1 --user-data-dir=<fresh>
  --no-first-run --no-default-browser-check --disable-gpu`. Record the build:
  `pacman -Q chromium` → `chromium 154.0.8037.97-1`, which matches the S105 pinned tag.

### 3.3 Eligibility of the A→B→A fixture

Each requirement is grounded in S104's committed bytes (`corpus/evidence/round-24/sources/bfcache.html`,
markup-stripped lines) or the S105 enum (`page.pdl`):

| Requirement | Ground |
|---|---|
| Serve over `http://127.0.0.1`, never `file://` or `data:` | `SchemeNotHTTPOrHTTPS` `:1511` |
| Main document returns 200 | `HTTPStatusNotOK` `:1510` |
| No `Cache-Control: no-store` on the main resource | S104 `:2697` ("when Cache-Control: no-store is set on the page resource itself … browsers have chosen not to store the page in bfcache"); `MainResourceHasCacheControlNoStore` `:1574`. Record the served response headers. [INFERENCE: python http.server sends no Cache-Control by default; unmeasured here] |
| No `unload` listener. Use `pagehide`/`pageshow` with `event.persisted` as the in-page witness | S104 `:2621` ("never use the unload event. Ever!"), `:2585` (pageshow `persisted` "is true if the page was restored from bfcache"), `:2602`; `UnloadHandlerExistsInMainFrame` `:1550` |
| No opener relationship. Navigate A→B inside the same target with `Page.navigate` or a same-tab link, never `window.open` or `target=_blank` | S104 `:2742` ("a page with a non-null window.opener reference can't safely be put into bfcache"); `RelatedActiveContentsExist` `:1509` |
| No open IndexedDB, WebSocket, BroadcastChannel or Web Locks on A | S104 `:2752`, `:2757`; `WebSocket` `:1571`, `BroadcastChannel` `:1586`, `WebLocks` `:1591` |
| A must be loaded and idle before leaving: wait for `loadEventFired` and no outstanding fetch/XHR | `OutstandingNetworkRequestFetch` `:1598`, `…XHR` `:1599`, `Loading` `:1512` |
| B is a different document (a real URL), not a `#hash` or `pushState` change | PDL `:1702-1705`: `backForwardCacheNotUsed` fires "only for main-frame history navigation where the document changes (non-same-document navigations)"; same-document steps surface as `navigatedWithinDocument` (`:1722`) |
| Go back promptly, in the same profile and target | `Timeout` `:1518`, `CacheLimit` `:1519`, `CacheFlushed` `:1525` |
| Correlate events by `frameId`/`loaderId`, never by arrival order | PDL `:1702`: "Do not assume any ordering with the Page.frameNavigated event" |

**Record:**
- `Page.enable` before the first navigation;
- every raw `Page.frameNavigated` event verbatim, including the experimental `type`
  (`:1348-1352`, enum `Navigation`/`BackForwardCacheRestore` `:1341-1345`);
- every `Page.backForwardCacheNotUsed` event with `notRestoredExplanations` and the optional
  `notRestoredExplanationsTree` (`:1713-1715`);
- A's original `loaderId` from step 1, to compare with the restored frame [INFERENCE: a restore is
  expected to present A's loader, not a new one; unmeasured];
- a JS nonce set on A before leaving and read back after the back step.

A `BackForwardCacheDisabledByCommandLine` reason in a NotUsed event shows the run is invalid under
the kill rule. Running one deliberately flagged control alongside would show that the discriminator
discriminates. That is a recommendation, not part of the frozen control set.

**Unknowns (named, not claimed):**
- Whether headless=new on 154.0.8037.97 caches at all with a CDP client attached. S104 `:2800`
  ("Click the Run Test button. DevTools then tries to navigate away and back") is weak evidence
  that a DevTools attachment alone does not block it [INFERENCE].
- Whether `Network.enable` or `Fetch.enable` affect eligibility. The Playwright comment at
  `coreBundle.js:36213` concerns interception semantics, not eligibility [INFERENCE]. Keep `Fetch`
  off.

## 4. Divergences to route (status-neutral)

1. **D1.** The frozen claim text names a non-existent CDP method, `Page.goBack` (§3.1). It is
   resolvable inside the claim's intent ("a real history step"), provided the receipt names the
   mechanism.
2. **D2.** At the baseline, the entry still attributes the flag to "its own probe harness"
   (`:11-14`) and §4.2 still gives the round-24 F6-falsified instruction (`:68-69`). The
   README:582 correction did not reach the entry or `LOG.md:1785-1786`. An append-only
   supersession in the round-25 entry should cite RevEntryBfcache F6 and RevFrontierRows F2.
3. **D3.** The SKILL.md runbook recipe (`:127`) launches the flag-injecting wrapper. Harmless for
   past journeys; a named eligibility hazard for this one (§3.2).
4. **D4. Mined-mistake candidate for the round-25 lesson.**
   - Class: causal misattribution. A wave-1 reviewer named a technical blocker; it was carried
     through two distill/scribe hops as *the* reason. The real stop was a policy (wave-contract
     browser ban plus `notClaimed`), and the true gap was "no history step ever ran".
   - Captured-by: wave-2 falsification (RevEntryBfcache F6, RevFrontierRows F2). Its fix landed on
     1 of 3 surfaces (README yes; entry and LOG no).
   - Fix shape: a falsified wording is superseded on every surface that carries it. The sweep
     command is `git grep -n -- '--disable-back-forward-cache' <REV> -- corpus LOG.md SKILL.md`.
5. **D5 (minor).** The forged control states `"browser": "chromium 152.0.7977.82 (claimed, not
   observed)"`, while the host is 154.0.8037.97. It is irrelevant to its purpose (it has no event
   backing either way).

## 5. Confidence

- High for links 1–5 and 9–11: verbatim quotes from committed bytes.
- High for §3.1: PDL grep plus the Playwright source.
- Medium-high for links 6–8 as *the origin* of the misattribution. The sequence is ordered by wave
  (w1 → distill → entry → w2), but no artifact states its author's reasoning.
- Inference-labelled for the "why documented-upstream" intent and for every eligibility item
  marked [INFERENCE]. None of these was run.

## Tooling

None installed or updated. Read-only git (`rev-parse`, `log`, `show`, `grep`, `diff`,
`merge-base`), `grep`/`sed`/`awk`/`node -e` over committed bytes, and `pacman -Q chromium`
(a query, not a transaction).
