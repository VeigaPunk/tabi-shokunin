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
- Round 53 (2026-11-02): the webview2 surface now carries Shift modifier chords — `scripts/webview2-cdp-loopback-round53.mjs
  --form` extends the r52 per-key trace with a second trace: the invocation-bound nonce UPPERCASED typed into the form's
  second field with real Shift keyDown/keyUp rides around every uppercase letter's pair (the letter's event carrying
  `modifiers: 8` — S153's dispatchKeyEvent modifiers bit field, Shift=8, re-opened byte-identical a fifth time this round),
  digits/hyphen unshifted, the DOM value read back after EVERY keystroke on BOTH fields, the GET submit carrying both
  query parameters witnessed server-side and client-side (`corpus/evidence/round53/webview2-modifier-chords/`). Standing
  host note: a freshly `csc`-compiled host exe may be refused by `spawn` with UNKNOWN (errno -4094) — the refusal follows
  the compiled blob (per-blob verdicts, e.g. Defender real-time), not the path; the runner's reuse-if-exists branch is the
  deterministic answer (seed the scratch with a blob that already spawned; provenance pinned by hostExeSha256 + the
  committed source's hostCsSha256) — see `corpus/knowledge/webview2-keyevent-modifier-chords-round-53.md`.
  ROUND-54 DISCLOSURE SHAPE CORRECTION: the reuse is disclosed by the receipt's
  `{"step": "host-exe-reused"}` note step plus the hostExeSha256/hostCsSha256 pins — there is NO `compileReuse` key
  in any receipt (the r53 lesson's prose name-leftover, corrected of record in `corpus/lessons/round-54.md`;
  measured at `.ufo/waves/round-54/measure/d2-receipt-shape-check.txt`). The spawn-verdict condition RECURRED at the
  r54 data run and the committed-stderr rule (QUALITY.md criterion 108, named in the round-54 lesson) applied: the
  blocked run's full stderr is committed at `.ufo/waves/round-54/controls/c2-live-run1-spawn-unknown.txt`; cited
  run stderr always resolves to committed bytes from this round forward.
- Round 54 (2026-11-02): the webview2 surface now carries the FULL modifier domain with a page-side witness —
  `scripts/webview2-cdp-loopback-round54.mjs --form` carries the r52 plain trace and r53 Shift chords unchanged and
  adds the chord-domain leg: the form fixture page embeds an inline keydown recorder (`window.__keylog` — the page's
  OWN record of every delivered keydown with its modifier booleans), three real chords Control/Alt/Meta
  (S153's dispatchKeyEvent modifiers bits 2/1/4 — Shift=8 rode in r53; S153 re-opened byte-identical a sixth time;
  the DOM booleans are S161 NEW: the W3C UI Events KeyboardEvent attribute definitions) on the nonce-derived letter
  (first [a-f] of the hex tail) into a never-submitted third field (no name attribute), 12 key events, the
  bit↔boolean correspondence measured live (2↔ctrlKey, 1↔altKey, 4↔metaKey; shiftKey false; the modifier keys' own
  keydowns delivered Control/ControlLeft/17, Alt/AltLeft/18, Meta/MetaLeft/91), the field staying EMPTY (a modifier
  chord inserts nothing — the negative witness), and `journey.form.pageKeylog` — the page's complete keydown record
  of the fill — re-derived end to end by the r54 counter from the receipt's own nonce and matched entry by entry
  (`corpus/evidence/round54/webview2-modifier-chords/`;
  `corpus/knowledge/webview2-modifier-domain-round-54.md`).
- Round 55 (2026-11-02): the webview2 surface now carries the KEY-DOMAIN control keys with
  page-side witnesses — `scripts/webview2-cdp-loopback-round55.mjs --form` carries the r52
  plain trace, r53 Shift chords and r54 chord-domain leg unchanged and adds the control-domain
  leg: End (VK 35) re-anchors the caret with the NEGATIVE EDIT WITNESS (the field value read
  back UNCHANGED — a mouse click into a non-empty input places the caret at the click point;
  the pre-freeze smoke run's red control is committed at
  `.ufo/waves/round-55/controls/c2-smoke-caret-midtext-red.json`), Backspace (VK 8) deletes
  exactly the last character (the residue re-derived by the r55 counter from the receipt's own
  nonce) with the removed character re-typed to an exact restore, Tab (VK 9) moves focus
  field -> field2 witnessed by document.activeElement, and ONE Enter keyDown (VK 13, text \r)
  from the tabbed-to field drives the implicit submission — the default-button contract is
  S083 re-opened this round (§4.10.22.2); the keylog gains exactly +4 entries and
  journey.form.pageKeylog is re-derived end to end by the r55 counter from the receipt's own
  nonce (the Enter keydown's own DOM record is not witnessed — the submission navigates the
  document; disclosed) (`corpus/evidence/round55/webview2-control-keys/`;
  `corpus/knowledge/webview2-control-keys-round-55.md`; the r55 counter ships 103 fixtures
  incl. seven new control-domain refusal cases).
- Round 56 (2026-11-03, Linux host): the webview2 surface cannot run here (no Windows host);
  the Linux host offers `/usr/bin/chromium` = Chromium 155.0.8059.84 (Arch) — and it is a
  WRAPPER that prepends the user's `~/.config/chromium-flags.conf` and would load the user's
  own extension into a fixture browser, with the crashpad handler writing into the user's
  default profile (sentinel-measured). The surface's control-domain key leg therefore runs
  with `HOME`/`XDG_CONFIG_HOME` redirected to a throwaway dir under the scratch plus
  `--disable-extensions` (`scripts/chrome-cdp-loopback-round56.mjs --form`-equivalent leg:
  End negative-edit witness, Backspace residue + exact restore, Tab activeElement witness,
  ONE Enter keyDown with `text: "\r"` driving the implicit submission — S083 §4.10.22.2 +
  S153 modifiers + S161 §3.5.1; `corpus/evidence/round56/chromium-control-keys/`).
- Round 57 (2026-11-03, Linux host): the chromium surface now carries the modifier-chord
  domain — `scripts/chrome-cdp-loopback-round57.mjs --form` extends the r56 control-keys
  leg with the Shift-chord trace (the nonce UPPERCASED into field2, every uppercase letter
  riding a real Shift keyDown/keyUp with modifiers 8 + the shifted key/text, per-keystroke
  DOM read-backs on BOTH fields) and the chord-domain leg (Control/Alt/Meta chords, bits
  2/1/4 per S153, on the nonce-derived letter into the never-submitted field3, the page's
  own __keylogFull recording every keydown/keyup with its booleans, field3 staying EMPTY),
  with Enter LAST making the submit carry field=nonce AND field2=nonce.toUpperCase()
  (R57Critic's declared strengthening); the r57 counter re-derives both traces and the
  keylog plan from the receipt's own nonce (`corpus/evidence/round57/chromium-modifier-chords/`;
  S153 ninth open + S161 byte-identical re-open).
- Standing disposition — the L2-floor L0 (`tabi | round-44`, open since round 44, routed around every round since):
  this host has no AgentSwarm/Kimi L2 dispatch surface, so the >=8-L2-subagents floor is not satisfiable here; tabi
  rounds run L1-inline, disclose that in every predicate and claims.json, and route around the open question without
  treating it as answered. This standing line replaces the per-round re-statements (the r50 closure's consolidation
  routing); later rounds refer here instead of restating it. The question stays open for the operator.

## Round 62 — Linux observed surfaces (2026-11-04)

The historical Windows-host disposition above does not describe this round's
observed transport: the inline ready handoff returned WAVE-DONE for 11 seats,
recorded in `.ufo/waves/round-62/w1-results.json`. This observation does not
answer the operator-owned round-44/61 planner/topology questions.

The existing Linux Chromium loopback surface produced a secondary-button
receipt at `corpus/evidence/round62/chromium-secondary-button/receipt.json`.
It is experimental evidence, not a newly admitted capability: the frozen
counter's declared M5 mutation survived its selftest (round-62 lesson). No
real-site interaction, keyup-value ruling or sibling-overlap ownership is
added to the core province.

## Adjacent — sibling matrix

| lane | relation | head | cite | quote | tabi side |
|---|---|---|---|---|---|
| audio | none | f9da7ee97e0ba95da1803c2afe9c616c519bae18 | PROVINCE.md:1 | # audio province | tabi holds no audio ground |
| chousa | none | 378fda82dc2cbcc555a0565052cc408121813cef | PROVINCE.md:1 | # chousa-shokunin — Province | tabi holds no chousa ground |
| game-dev-2d | none | 1e033ef053beedf9a201daa21fbeb9c8b2f72dc3 | PROVINCE.md:1 | # game-dev-2d province | tabi holds no game-dev-2d ground |
| game-dev-3d | none | 39ca3973c7865456d97fae18033f3f460c6cf8c1 | PROVINCE.md:1 | # game-dev-3d province | tabi holds no game-dev-3d ground |
| kagi | adjacent | f5977284a8ce5bab09252be8196ee5dc18489926 | PROVINCE.md:1 | # kagi-shokunin — Province | tabi holds no kagi ground |
| kaidoku | adjacent | 0b518f568da7b40a4ab026508d63c942faa7badf | PROVINCE.md:1 | # kaidoku-shokunin — Province | tabi holds no kaidoku ground |
| kake | contested | dd7a146df338ec3de07a88f08f36c8278760afec | PROVINCE.md:45 | The the-musketeer Chrome profile lease is contested scope (kagi/tabi/kake) | tabi holds no kake ground |
| kama | none | 9b4c7af16fdd4bba9e4815f4615f4b003f340747 | PROVINCE.md:1 | # kama-shokunin — Province | tabi holds no kama ground |
| kasegi | none | d16d2124fd5262f5a8088aa598f1e628f897d3ab | PROVINCE.md:1 | # kasegi-shokunin — Province | tabi holds no kasegi ground |
| kengaku | none | 34b28c47bc38b4e0aa11f44f2dfe7c9470d551ac | PROVINCE.md:103 | **tabi** `scripts/check-measurement-binding.mjs:575-613` and **kama** | tabi holds no kengaku ground |
| kotoba | adjacent | 0344ddaea831b92546360a55ae02db2654fbccf8 | PROVINCE.md:76 | \| tabi \| none \| 856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb \| | tabi holds no kotoba ground |
| kotodama | none | 5fa04a9bbda25aa31c8270265fd9997eb97d9ebb | PROVINCE.md:1 | # kotodama-shokunin — Province | tabi holds no kotodama ground |
| kumitate | none | 814068f08c523f57055840b694a53f875a753cbf | PROVINCE.md:1 | # kumitate-shokunin — Province | tabi holds no kumitate ground |
| lore | none | 0f044aa7c7e4e17cfd5b6278179709b60db45d61 | PROVINCE.md:1 | # lore province | tabi holds no lore ground |
| mado | none | 24ba2a9ddac21c1211579231e6ee1d98963f9988 | PROVINCE.md:1 | # mado-shokunin — Province | tabi holds no mado ground |
| mori | none | 7765969c79e6f3df44cce2e303e6a0cf2b054d8b | PROVINCE.md:1 | # mori-shokunin — Province | tabi holds no mori ground |
| revenger | adjacent | 654d09298960d0886274d37a0492b8e6d98b2c96 | PROVINCE.md:1 | # revenger province | tabi holds no revenger ground |
| souji | none | e063a2fcb3f5f3fb8fb19d2ae1592b1f22e6a333 | PROVINCE.md:1 | # souji-shokunin — PROVINCE | tabi holds no souji ground |
| tameshi | none | f256302b394ae3253df014fe1131e2c20e2c16b6 | PROVINCE.md:1 | # tameshi-shokunin — Province | tabi holds no tameshi ground |
| tsukuroi | none | 64f45b790f2dbbf63b9b343c47810118a79f7a35 | PROVINCE.md:1 | # tsukuroi-shokunin — Province | tabi holds no tsukuroi ground |
