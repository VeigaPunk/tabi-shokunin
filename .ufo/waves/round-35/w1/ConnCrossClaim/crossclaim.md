# Cross-claim scan — round 35 w1 (seat ConnCrossClaim)

Author: ConnCrossClaim-4. Read-only scan of sibling repos at the frozen pins (`baseline/c1-pins.json`), the frozen C1 counter, the adjacency map, and the installed geckodriver. No lane files edited.

## 1. C2→C1: do siblings at their pins claim Firefox/geckodriver/Marionette/non-Chromium engines?

Command (one per lane, pin-fixed; paths SKILL.md corpus PROVINCE.md):

```
git -C /home/vgpnk/Projects/shokunin/<lane>-shokunin grep -n -i -E 'firefox|gecko|marionette|webkit' <pin> -- SKILL.md corpus PROVINCE.md
```

Result: 10 of 20 lanes have hits; all hits are outside candidate scope or fail the frozen BG regex, so **no sibling claims an engine surface and there is zero new adjacency ground**.

### Hit inventory (lane → hits → verdict)

| Lane | Hits (file:line) | Scope | Verdict |
|---|---|---|---|
| audio | `corpus/live/gst-scout/probe-inventory-r77.json:958` ("Gecko (RealAudio G2) decoder"); `corpus/live/r62-boundary/src/codec_desc.c:2930` | outside candidate paths (live/json+c) | codec name, not a browser engine; not new ground |
| chousa | none (git grep exit 1) | — | no claim |
| game-dev-2d | binary matches only: 7 × `corpus/live/r25-export-*/.../fixture.x86_64` | outside candidate paths (binaries) | binary blobs, no textual claim; not new ground |
| game-dev-3d | `corpus/fixtures/r94vendor/three.core.js:50538` (`window.webkitAudioContext`); `:52503` (comment "code path for Chrome and Firefox (see #14393)") | outside candidate paths (vendored fixture) | vendored library code, not a lane claim; not new ground |
| kagi | none (exit 1) | — | no claim |
| kaidoku | none (exit 1) | — | no claim |
| kake | `corpus/SOURCES.md:26,193` (S018 DebugBear row: "Firefox And Safari Now Support Two Core Web Vitals Metrics", registry-half narrative); `corpus/lessons/round-20.md:188,220,263` (Firefox 114 vs 144.0 interactionId lesson) | outside candidate paths (SOURCES/lessons) | source-registry/version-check documentation about Firefox as a product, not an engine-driving claim; not new ground |
| kama | none (exit 1) | — | no claim |
| kasegi | `corpus/source-snapshots/round-24/S011.txt:335`, `round-32/S049.txt:391`, `round-35/S052.txt:*` (Mozilla advisory snapshots: Firefox/WebKit/WebKitGTK products) | outside candidate paths (source snapshots) | archived external advisories, not lane claims; not new ground |
| kengaku | `corpus/evidence/round12-fleet/r12-prior-art-transport.md:500,522` (UA strings containing AppleWebKit) | outside candidate paths (evidence) | user-agent transport records, no engine claim; not new ground |
| kotoba | none (exit 1) | — | no claim |
| kotodama | `corpus/QUALITY.md:68,70`; `corpus/SOURCES.md:470,471,836`; `corpus/knowledge/culture-material/worldbuilding-setting-practice.md:3`; lessons round-62/64/73 (all UA-record/fetch-log lines mentioning "like Gecko", "Firefox UA") | one hit in candidate path: `worldbuilding-setting-practice.md:3` | the in-scope line is a fetch record with a browser-shaped UA string; it contains no BG token (BG has no plain `chrome`/`firefox`/`webkit` alternatives — see §4) → not a candidate; no engine claim; not new ground |
| kotodama | `corpus/SOURCES.md:151` (S199 Firefox Source Docs); `corpus/knowledge/jj-workspace-seat-containment.md:2,75,80,167`; lessons round-64/65 | in-scope knowledge hits: `jj-workspace-seat-containment.md` lines | all four knowledge lines mention Firefox contributor docs (`./mach vcs-setup`, "Firefox's own setup"), none matches BG (no geckodriver/webdriver/chromium/cdp token) → not candidates; no engine claim; not new ground |
| lore | none (exit 1) | — | no claim |
| mado | `corpus/knowledge/idle-lock-route-r17.md:39` (README quote "used by e.g. firefox or steam"); `corpus/knowledge/walker-deep.md:285` (search-example "firefox#https://") | in-scope knowledge hits | plain `firefox` tokens only, no BG token → not candidates; no engine claim; not new ground |
| mori | `corpus/evidence/recheck-r32/*.src`, `sources-r32/r36/r37/*.src` (HTML/JS snapshots: `-webkit-*` CSS, MDN/RFC text naming Firefox) | outside candidate paths (evidence snapshots) | fetched page bytes, not lane claims; not new ground |
| revenger | none (exit 1) | — | no claim |
| souji | none (exit 1) | — | no claim |
| tameshi | none (exit 1) | — | no claim |
| tsukuroi | none (exit 1) | — | no claim |

Cross-checks:

- `grep -inE 'firefox|gecko|marionette|webkit' .ufo/waves/round-35/baseline/c1-candidates.tsv` → exit 1 (zero hits): none of the 383 frozen candidates carries an engine term.
- Frozen BG regex (`c1-adjacency-sweep-v3.mjs:82`) includes `geckodriver` but NOT `firefox`/`gecko`/`marionette`/`webkit`; the word `Chrome` alone is not a BG token. A sibling line that merely names Firefox or WebKit is therefore not even a candidate this round — only a geckodriver (or other BG-token) line would be.

**Verdict:** C2's Firefox surface is this round exclusively tabi's own acquisition; no sibling pin claims any non-Chromium engine, and no engine-bearing line can enter the C1 sweep.

## 2. geckodriver default `--websocket-port 9222` = musketeer CDP lease port

Verified on the installed driver:

```
$ /home/vgpnk/.local/bin/geckodriver --version
geckodriver 0.37.1 (300705c65d1b 2026-07-17 09:25 +0000)   # exit 0
$ /home/vgpnk/.local/bin/geckodriver --help 2>&1 | grep -iE 'websocket'
      --websocket-port <PORT>
          Port to use to connect to WebDriver BiDi [default: 9222]   # exit 0
```

The default 9222 is the operator's musketeer CDP lease port on 127.0.0.1:9222, mapped at `corpus/adjacency.tsv`:

- Row 7 `musketeer-cdp-9222-profile-lease` — kake `PROVINCE.md:35` ("The the-musketeer Chrome profile lease is contested scope (kagi/tabi/kake)"), disposition `contested-open`, ruling `fleet@ebeb396f7db43c55de2711baa409f8bb9b71147b:.ufo/l0-questions.md:62` ("rule the lease owner between kagi and kake, or declare the split"), tabi side `SKILL.md:556`.
- Row 8 same surface — kagi `PROVINCE.md:43` ("**contested with kake** (lease/profile ownership unresolved"), same ruling.
- Row 11 `cdp-live-target-census` (kama, `corpus/knowledge/listener-census.md:355`) confirms 9222 is a watched live resource.

The frozen C2 counter already enforces the launch discipline this note formalizes: `c2-firefox-bidi.mjs:57-58` — "a free --websocket-port (never the 9222 default)". The instrument check's committed ws URLs are ephemeral (`ws://127.0.0.1:41155/session/…`, `…:37361/…` in `c2-instrument-check.json`).

### Draft lane note (SKILL.md style, one paragraph)

> **Firefox launches always pass a free `--websocket-port` (and a free `--port`).** geckodriver's default BiDi websocket port is 9222 (`geckodriver --help`), which is the operator's musketeer CDP lease port on 127.0.0.1:9222 — contested between kake and kagi (`corpus/adjacency.tsv` rows 7–8, ruling `fleet@ebeb396f…:l0-questions.md:62`) and watched by the kama live-target census (row 11). Binding the default would collide with that lease and breach the host guard, so every launch line selects an ephemeral websocket port; the frozen C2 counter does the same (`c2-firefox-bidi.mjs:57-58`).

**Classification: same-surface fact — not a new boundary.** The loopback-9222 resource is already mapped (contested lease rows 7/8; census row 11); what is new is only geckodriver 0.37.1's *default* instantiating that existing resource. Per QUALITY 91 this is launch guidance anchored to the existing verified rows, not a new map row or a new overlap.

## 3. Sibling-overlap scan: post-pin commits touching SKILL.md / corpus/knowledge

Command per lane:

```
git -C /home/vgpnk/Projects/shokunin/<lane>-shokunin log --format='%h %ad %s' --date=short <pin>..HEAD -- SKILL.md corpus/knowledge
```

| Lane | Commits after pin touching SKILL.md / corpus/knowledge |
|---|---|
| kaidoku | 1: `d764389e 2026-10-26 round-41: freeze — claims R41-C1 (AVM-BE Core on V3/V4/L3/L4, exact-path counter) and R41-C2 (triage table v3 vs independent evaluator), tools, carriers, controls, wave-1 evidence` — touches `SKILL.md` (+78/−4) and `corpus/knowledge/2026-10-26-r41-sqfs-triage-v3.md` (+111/−0) |
| other 19 lanes | 0 commits |

Ancestry guard: `git merge-base --is-ancestor <pin> HEAD` exits 0 for all 20 lanes → every pin remains reachable from its lane tip, so the gate's sibling reads at pins stay valid.

**Verdict:** the candidate set is read at the pins and cannot be moved by post-pin sibling commits within this round. Only kaidoku has advanced since its pin (one round-41 freeze); its tip is now the round-41 freeze, which is the revision a next round should re-pin. No sibling lane's post-pin activity can change this round's 383 candidates or any map row's verified sibling line.

## 4. Frozen BG regex (reference, `c1-adjacency-sweep-v3.mjs:82`)

```
/\b(?:playwright|puppeteer|chromedriver|geckodriver|webdriver|selenium|chromium|headless[ -](?:chrome|chromium|browser|firefox)|devtools protocol|chrome devtools|chrome-devtools|cdp|remote-debugging|browser automation|webbridge|burner[- ]?chrome|musketeer)\b/i
```
