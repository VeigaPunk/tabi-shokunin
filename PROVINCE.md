# tabi-shokunin — Province

**Domain:** browser & web-interaction craft (旅, journey) — driving real
browsers against real sites with evidence discipline.

**Owns (surfaces):** the kimi-webbridge plugin
(`~/.kimi-code/plugins/managed/kimi-webbridge/`) as primary substrate
documentation; browser inventory + profile surfaces (shape-only census);
CDP session discipline (endpoints, targets, screenshot/DOM evidence
capture); interaction records: site-specific gotchas, rate/rights
discipline, login-session handling rules (cookies/tokens shape-only,
never values); dynamic-page evidence patterns (what to capture so a
claim about a page is re-verifiable).

**Refuses:** reverse engineering as forensics (→ revenger/kaidoku),
web *publishing* (→ kake), secrets (→ kagi — session material is
shape-only, never content-read). Never performs consequential actions on
external sites (purchases, posts, deletions); observation and
operator-approved interaction only.

**Out of province → report, never absorb.**

## Host surfaces — corrected 2026-10-31 (round 44, new Windows host)

This province was written for the previous Linux host. Probed on the current host
(win32 10.0.26200 x64, Git Bash; probes committed at
`.ufo/waves/round-44/controls/host-probe.txt`):

- ABSENT: `~/.kimi-code/plugins/managed/kimi-webbridge/` (the primary substrate
  named above — recorded absent with date; the substrate documentation the lane
  holds stays valid as documentation), Firefox, geckodriver, Playwright
  (`ms-playwright` cache), any CDP bridge on `127.0.0.1:9222`.
- PRESENT: Google Chrome 156.0.8078.74, Microsoft Edge 156.0.4314.50, the
  Microsoft WebView2 runtime (`msedgewebview2.exe`, fixed version
  156.0.4314.50 under `C:\Program Files (x86)\Microsoft\EdgeWebView\Application\`),
  node v24.21.0, Python 3.13.15, the Framework 4.8 `csc.exe`. The lane's browser
  surfaces here are self-launched Chromium-class browsers on ephemeral loopback
  CDP ports with throwaway profiles, the surface declared per invocation
  (`scripts/chrome-cdp-loopback-round45.mjs --browser chrome|edge`;
  branded Chrome exposes the stderr DevTools line, branded Edge is stderr-silent and is
  discovered via the profile's `DevToolsActivePort` file — see
  `corpus/knowledge/chrome-cdp-loopback-round-45.md`; round 48 adds the third
  Chromium-class surface: the WebView2 runtime driven over raw CDP through the
  committed minimal COM host — `scripts/webview2-cdp-loopback-round48.mjs
  --runtime <dir> --loader <WebView2Loader.dll> --scratch <dir> --out <receipt.json>`;
  the webview is NOT a standalone surface — it requires a host application
  (S158/S159, `corpus/knowledge/webview2-cdp-loopback-round-48.md`)); public web
  surfaces are reached via raw HTTP fetch (curl/WebFetch) for source opens.
- The r35–r43 Firefox/geckodriver instruments and the `/proc`/`ss` socket
  surfaces are Linux-host-bound and do not run here; receipts they produced
  remain committed evidence, re-derivable only on a host that has the surface.
- Round 49 (2026-11-01): the webview2 runner is now `scripts/webview2-cdp-loopback-round49.mjs`
  (resolve-at-launch `--scratch`/`--out`, optional `--nav`); the r48 runner above stays frozen and
  takes ABSOLUTE paths only (S160: a relative `WEBVIEW2_USER_DATA_FOLDER` anchors at the host exe's
  directory — the routed r48-closure foot-gun, measured red at the r49 round open and fixed in the
  versioned runner; see `corpus/knowledge/webview2-cdp-loopback-round-48.md` round-49 append). The
  webview2 surface now also navigates: cross-page over an inline loopback HTTP fixture
  (`corpus/evidence/round49/webview2-nav/`).
- Round 50 (2026-11-01): the webview2 surface now carries a journey — `scripts/webview2-cdp-loopback-round50.mjs
  --journey` drives A -> B -> C over the pages' own anchor clicks with CDP history evidence
  (`Page.getNavigationHistory` + `Page.navigateToHistoryEntry`, S153 re-opened byte-identical this
  round; the measured model: the initial data: page occupies history slot 0 — `corpus/evidence/round50/webview2-journey/`).
  Runtime drift is the standing host condition: WebView2 auto-update REMOVED fixed-version folder
  156.0.4314.50 after round 49 (the host now offers 155.0.4283.62 / 156.0.4314.58), so the r50
  runner takes `--runtime` with NO default, and the r50 counter grades a missing pinned runtime as
  the DECLARED could-not-evaluate class `runtime-pin-host-drift` (disclosed, never a finding) while
  a folder present WITHOUT its exe stays a hard finding (`corpus/knowledge/webview2-journey-round-50.md`).
- Round 51 (2026-11-01): the webview2 surface now carries real form interaction — `scripts/webview2-cdp-loopback-round51.mjs
  --form` extends the r50 journey with an anchor-click to a GET form page and an input-domain fill+submit
  (`Input.dispatchMouseEvent` click into the field, `Input.insertText` of the invocation-bound nonce, the DOM value
  read back, a second mouse click on the form's own submit button), the submission witnessed by the fixture server's
  served log as well as the rendered echo page (`corpus/evidence/round51/webview2-form-journey/`; S153 re-opened
  byte-identical with the Input-domain quotes verbatim).
- Round 52 (2026-11-02): the webview2 surface now carries a per-key typing trace — `scripts/webview2-cdp-loopback-round52.mjs
  --form` replaces the r51 insertText fill with real `Input.dispatchKeyEvent` keyDown/keyUp pairs, one per nonce
  character with a per-character-derived `code`/`windowsVirtualKeyCode` (digits Digit<N>+48+N, letters Key<X>+65+,
  hyphen Minus+189), reading the field's DOM value back after EVERY keystroke (the per-keystroke prefix witness —
  `corpus/evidence/round52/webview2-keyevent-typing/`; S153 re-opened byte-identical a fourth time, the
  dispatchKeyEvent description located verbatim). Standing note for the adjacency gate: sibling lanes commit
  mid-round on this host, so the meter's green run can race a head that moved after the ledger snapshot — the
  frozen correction flow (re-snapshot -> re-bind -> commit -> re-run, two cycles) is the designed answer (r52
  consumed both cycles; r50 consumed one).
- Standing disposition — the L2-floor L0 (`tabi | round-44`, open since round 44, routed around every round since):
  this host has no AgentSwarm/Kimi L2 dispatch surface, so the >=8-L2-subagents floor is not satisfiable here; tabi
  rounds run L1-inline, disclose that in every predicate and claims.json, and route around the open question without
  treating it as answered. This standing line replaces the per-round re-statements (the r50 closure's consolidation
  routing); later rounds refer here instead of restating it. The question stays open for the operator.
