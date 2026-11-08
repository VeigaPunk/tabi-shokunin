# R91Connector — sibling-overlap scan, round 91 (w1)

Read-only seat. This file is the only thing written under `tabi-shokunin`; nothing was written in any sibling lane, no git/jj command was run, no claim/predicate/pin/prior/threshold/kill rule is amended or proposed for amendment below. Scratch `/fast/scratch/hyaku/tabi-r91/R91Connector` was created with `mkdir -p` and deleted before yield; no artifact exceeded 50 MB, so no receipt was copied into `.ufo/waves/round-91/w1/`.

Ground scanned: the round's two claims as frozen in `.ufo/waves/round-91/claims.json` — C1 `C1-SHOWPICKER-PROXY-R91` (chromium-showpicker-proxy-linux: file/date/colour shapes in a same-origin and a cross-origin iframe reached through a `window.postMessage` proxy that accepts only the served parent origin) and C2 `C2-RECORDDRIFT-R91` (the six lane-measurable r90 spot-check §8 defects over eight record statements).

Token set (the seat's): `postMessage`, `contentWindow`, `same-origin`, `cross-origin`, `userActivation`, `transient activation`, `showPicker`, `record-drift-round91`. Surfaces: each lane's `corpus/knowledge`, `SCORECARD.md`, `scripts`, plus `PROVINCE.md` as a fourth surface (the prior connector at `kumitate-shokunin/.ufo/waves/round-90/K90Connector/overlap.md` used it, and it is where the fleet's CDP ground is actually declared).

## Commands run (from `/home/vgpnk/Projects/shokunin`)

```
PAT='postMessage|contentWindow|showPicker|userActivation|transient activation|same-origin|cross-origin|record-drift'
for L in *-shokunin; do            # four-surface matrix, one row per lane
  k=$(grep -rIlE "$PAT" "$L/corpus/knowledge" 2>/dev/null | wc -l)
  s=$(grep -lE  "$PAT" "$L/SCORECARD.md"      2>/dev/null | wc -l)
  x=$(grep -rIlE "$PAT" "$L/scripts"          2>/dev/null | wc -l)
  p=$(grep -lE  "$PAT" "$L/PROVINCE.md"       2>/dev/null | wc -l)
  printf '%s|%s|%s|%s|%s\n' "$L" "$k" "$s" "$x" "$p"
done
grep -rIlE 'postMessage|contentWindow|showPicker|record-drift-round91' .                       # whole-tree, noise dropped below
grep -rInE 'userActivation|transient activation|transient-activation' --include='*.md' --include='*.json' --include='*.sh' --include='*.py' --include='*.js' --include='*.mjs' .
grep -rIlE 'showPicker|type=["'\'']?file|file chooser|file picker|webkitdirectory' --include='*.md' */corpus/knowledge */SCORECARD.md
grep -rIlE 'iframe|window\.open|postMessage' --include='*.md' */corpus/knowledge */SCORECARD.md
grep -rInE 'chromium|headless|iframe|postMessage|cross-origin|same-origin' */PROVINCE.md
grep -rIlE 'headless=new|Page\.fileChooserOpened|Target\.attachToTarget|puppeteer|playwright|chrome-cdp|cdp\.json' */scripts */tools
find */scripts -maxdepth 1 -name '*drift*'          # tabi-only: scripts/check-record-drift-{r79..r89,round90,round91}.mjs
grep -n 'chromium-showpicker' MANIFEST.json         # capability rows, tabi-only (lines 57482..60074)
```

Raw hit lists stayed in scratch and were deleted; every line below is reproducible from the commands above.

## Per-lane result (20 sibling lanes, one line each)

Matrix order is `corpus/knowledge | SCORECARD.md | scripts | PROVINCE.md` file counts.

| Lane | k/s/x/p | State |
|---|---|---|
| audio-shokunin | 0/0/0/0 | NONE — audio content lane; no token hit on any surface. |
| chousa-shokunin | 0/0/0/0 | NONE on the four surfaces; the broad tree grep hits only capture bytes `corpus/captures/67983a3dbbd1d690aa648744.raw` and `corpus/captures/f221c90f69188f775e32cd34.raw` (fetched pages, not lane-authored ground). QUOTE. |
| game-dev-2d-shokunin | 0/0/0/0 | NONE — Godot 2D headless lane. |
| game-dev-3d-shokunin | 0/0/0/0 | NONE — Godot/Blender 3D headless lane; its "headless" is engine-render, not browser. |
| kagi-shokunin | 0/0/0/0 | NONE on the surfaces; `postMessage` appears only inside captured site bodies under `.ufo/waves/round-26/sandboxes/ClockS007/body.html` and siblings (a Mintlify docs page capture), i.e. third-party JS, not lane ground. QUOTE. |
| kaidoku-shokunin | 0/0/0/0 | **SAME SUBSTRATE, DIFFERENT QUESTION.** `PROVINCE.md:55` "Runtime observation (CDP)": self-launched `chromium --headless --remote-debugging-port=9222`, `xvfb-run electron --remote-debugging-port=9223`, `list_browser_targets`, `inspect-web-page`, `capture-browser-scenario`; registered at `corpus/README.md:182` (`2026-10-13-r3-runtime-observation`), lesson `corpus/lessons/2026-10-13-round-3.md:55-56`. It observes shipped Electron/Chromium apps; it holds no iframe/origin-proxy law and no `Page.fileChooserOpened` read. |
| kake-shokunin | 5/1/3/0 | **LABEL-ONLY.** `same-origin`/`cross-origin` as URL/header semantics, never as a frame or message channel: `corpus/knowledge/referrer-policy-effective.md:31,34-35,44`, `kimi-subpath-audit.md:17,79,99`, `sitemap-orphan-audit.md:50`, `vault-properties.md:44,61,102`, `render-static-sites.md:53`; `SCORECARD.md:697` (base-path audit of same-origin references outside the base); `scripts/referrer_policy_effective.py:19,22-23`, `scripts/header_change_class.py:58-59` (COOP/COEP/CORP header names), `scripts/fixtures/base-path/D6-absolute-same-origin-outside/expected.json:12`. Static-site HTML/header conformance, no browser, no messaging, no chooser. |
| kama-shokunin | 1/0/0/0 | NONE — `corpus/knowledge/ollama-evidence-replay.md:227` "Not current, same-origin or local." is prose about evidence freshness; `transient activation` appears only as a warmup comment in a wave-local `sgl_environ.py:1146` (outside the three declared surfaces). |
| kasegi-shokunin | 0/0/0/0 | NONE — `corpus/knowledge/program-quirks.md:40` is a QUOTE about a HackerOne portal's dropzone carrying a hidden `input[type=file]`; no picker measurement. |
| kengaku-shokunin | 0/0/0/0 | NONE — research/scouting lane. |
| kotoba-shokunin | 0/0/0/0 | NONE. |
| kotodama-shokunin | 0/0/0/0 | NONE — `tools/check-source-access.py:36` is a *policy* regex listing `playwright|puppeteer|selenium` so its own mining rows cannot claim browser access; no browser ground. |
| kumitate-shokunin | 0/0/0/0 | NONE on the tokens; same *class* as C2 (record consistency) but a different object: `scripts/cite-check.mjs`, `claims-check.mjs`, `counter-pins.mjs` [INFERENCE from filenames and lane domain — not opened] bind citations/pins of its own receipts, not eight prose statements. |
| lore-shokunin | 0/0/0/0 | NONE. |
| mado-shokunin | 0/0/0/0 | **SAME OBJECT, LOWER LAYER.** `corpus/knowledge/xdg-portal-routing-r12.md:47,64,115` (`org.freedesktop.impl.portal.FileChooser`, GTK as fallback backend; `:115` states "not a claim that a live file picker was exercised"), `xdg-mime-default-resolution-r92.md:355`, `mime-magic-sniff-r95.md:41`; instruments `tools/mado-mime.py` / `tools/mado-xdgmime.py` (`PROVINCE.md:507-527`, launch nothing, write nothing). Owns which OS handler receives a file, not whether a browser chooser opens. |
| mori-shokunin | 0/0/0/0 | NONE. |
| revenger-shokunin | 0/0/0/0 | NONE. |
| souji-shokunin | 0/0/0/0 | NONE. |
| tameshi-shokunin | 0/0/0/0 | NONE on these tokens; its `tools/receipt-bytes-bind.py` is the receipt-binding class (tool_sha256 ↔ committed bytes) for its own receipts — as described at `kumitate-shokunin/.ufo/waves/round-90/K90Connector/overlap.md` (secondhand, not re-opened here); a different property than statement-vs-state drift. |
| tsukuroi-shokunin | 0/0/0/0 | NONE — `corpus/knowledge/degraded-triage-r4.md:117`'s `type=file` is a tar entry field (label collision). |
| *(tabi, self)* | 26/1/87/1 | Own ground: `corpus/knowledge/chromium-showpicker-*` r77-r91, `scripts/check-showpicker-proxy-round91.mjs`, `scripts/check-record-drift-round91.mjs`. |

Classification counts over 20 sibling lanes: OWNED-BY-SIBLING (sibling already does this round's claim) **0**; same substrate / different question **1** (kaidoku CDP); same object / different layer **1** (mado file-chooser portal); label-only **1** (kake same-origin); quote / captured bytes **3** (chousa, kagi, kasegi); none **14**.

## Is anything this round claims contested?

No.

- C1's capability is tabi-exclusive in the fleet registry: `MANIFEST.json` carries `chromium-showpicker-linux` generations r79-r90 (e.g. `:57789` r81, `:60074` r90) and no other lane; no sibling `SCORECARD.md` declares an iframe/origin-proxy or picker-activation capability (the only token hit there is kake's base-path row). The closest substrate — kaidoku's CDP observation — measures third-party app behaviour, not Chromium's own picker/activation laws.
- The nearest *same object* is mado's portal `FileChooser` routing, and that lane explicitly does not exercise a live picker (`xdg-portal-routing-r12.md:115`). It cannot be read as, or against, C1's picker legs.
- C2's name and instrument are tabi-only: `find */scripts -name '*drift*'` returns nothing outside tabi, and every sibling's drift regime lives in its own `corpus/lessons/round-NN-verifier-spotcheck.md` (kaidoku `round-91.md:38` "D-1 (record drift)"; chousa `round-71-verifier-spotcheck.md`; kake `round-69-verifier-spotcheck.md`; mado `round-79.md`; kama `round-70.md`/`round-76.md`). Same *class*, disjoint objects: those count a sibling's own statements, none of them can serve as a control or a counter for tabi's eight.

No contradiction found between the round's claims and any sibling's recorded state. The one boundary worth writing down is vocabulary, not state: "record drift" and "same-origin" are both fleet-wide labels; cite them lane-qualified (see R3 below).

## One pattern this lane should reuse

**Target enumeration before attach — kaidoku's CDP discipline** (`PROVINCE.md:55` `list_browser_targets` against a self-launched `chromium --headless --remote-debugging-port=9222`; instrument registered with its lesson pointer at `corpus/README.md:182`). Concretely: ask `/json/list` what exists, record the target topology in the receipt, and treat "one page target saw no event" as a claim about *that* target, not about the browser.

Why it bites here: the r91 driver binds the whole measurement to the first page target it finds — `scripts/chrome-cdp-showpicker-proxy-round91.mjs:339` `.find((t) => t.type === 'page')` — and the file has no `Target.*` call at all (`grep -nE 'Target\.' …` → 0 hits). It is safe *today* only because both fixture origins are `http://127.0.0.1:<port>` (`:92-93`), i.e. cross-origin by port but same-site, so the child is not an out-of-process iframe and its `Page.fileChooserOpened` reaches the same Page session; the counter's frame binding (`scripts/check-showpicker-proxy-round91.mjs:345` `c.params.frameId !== l.childFrameId`) then attributes it correctly.

Do **not** copy kaidoku's launch detail `--user-data-dir=/tmp/...` (`corpus/lessons/2026-10-13-round-3.md:55`): fleet route R12 makes `/tmp` uncitable (kake `corpus/knowledge/kimi-subpath-audit.md:1`), and this round's contract puts scratch under `/fast/scratch`. Tabi's driver already complies — private profile at `chrome-cdp-showpicker-proxy-round91.mjs:261` `path.join(legDir, 'profile')`.

## Risks (second order, no amendment proposed)

- **R1 — the negative legs have a generality ceiling, not a defect today.** "The proxy call … opens no chooser in BOTH iframes" is measured as absence of `Page.fileChooserOpened` on a single top-level Page session. With the child on `127.0.0.1:<other port>` that is sound; the moment a generation serves the child cross-site (e.g. `127.0.0.2`), the child becomes an OOPIF whose chooser event never reaches the parent's Page session without `Target.setAutoAttach({flatten:true})`, and "no chooser" would pass silently. The receipt as scored cannot distinguish "no chooser" from "chooser in an unobserved target". Cost of acting now: zero; the useful artifact is a sentence in the ledger that the origin-level wording rests on a same-site fixture, plus the enumeration pattern above for any future arm.
- **R2 — layer boundary with mado.** Its portal/MIME ground answers "which handler receives the file", explicitly without exercising a picker; C1's limit line ("the native pickers themselves are unmeasured") is the correct boundary statement and should not be widened by citing mado.
- **R3 — citation collision.** Both "record drift" and "same-origin" are fleet-wide labels with disjoint objects (five sibling lanes use the first in their own spot-check lessons — chousa, kaidoku, kake, kama, mado; kake owns the second as header/URL semantics). Any report sentence should say *tabi's* eight statements / *iframe* origin, or a later auditor will read a sibling's finding as support for, or evidence against, this round's gate.
- **R4 — C2 has no sibling control and needs none.** None of the sibling spot-check regimes is a before-state for tabi's eight statements; the only valid BEFORE is the base `b1d8f07b` worktree run the claim already names.

## Unfinished

- Tabi's own 26 knowledge files were not re-classified line by line (own ground; out of scope for an overlap scan).
- Historical wave directories (`.ufo/waves/**`) outside the two cited lessons were not audited; they were treated as history and excluded from ground claims.
- No counter, battery, kill-power or drift gate was executed here (this seat verifies nothing; the main agent owns verification).
- kagi's round-26 sandboxes were checked only far enough to confirm they are page captures, not lane-authored postMessage instruments.
- No tool was installed or upgraded, so there is no tooling record to file.
