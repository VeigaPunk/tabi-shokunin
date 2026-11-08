# R85Connector — Sibling-Overlap Scan & UFO-FSD Connector Synthesis (Round 85, Wave 1)

**Seat:** R85Connector (connector, axis `adjacency`)  
**Lane:** `/home/vgpnk/Projects/shokunin/tabi-shokunin`  
**Base commit:** `c574d593`  
**Freeze commit:** `5c1961525e83efe2682cab389b8995d67c0ab4f0`  
**Digests commit D:** `dbecb1a18905` (nonce `tabi-r85-l1-dbecb1a18905`)  
**Scanned at:** 2026-11-08T07:36:28Z  
**Seat outputs:** `.ufo/waves/round-85/w1/R85Connector.md`, `.ufo/waves/round-85/w1/sibling-heads-r85.tsv`  
**Mutations:** none. No git/jj mutation, no commit, no push. Read-only throughout.

---

## 1. Milestone Answer

> *Sibling-overlap scan: does any sibling lane own transient/sticky user activation, `showPicker`, input types and picker availability, same-origin/cross-origin gating, or CDP interception of pickers?*

**No. Zero sibling lanes hold any part of this ground.**  
**Specifically: the six new same-origin legs (`sp85-same-origin-{tel,search,text}` and their `-activated` forms), the same-origin `NotAllowedError` / `undefined` picker availability laws, cross-origin `SecurityError` gating, and CDP file-chooser interception (`Page.setInterceptFileChooserDialog`, `Page.fileChooserOpened`, `DOM.setFileInputFiles`) are claimed by zero sibling lanes.**

All 20 sibling lanes under `/home/vgpnk/Projects/shokunin/*-shokunin/` were pinned with `git -C <repo> rev-parse HEAD` at scan time and systematically evaluated across all surface types:

| Probe | Result |
|---|---|
| Sibling `PROVINCE.md` lines naming target identifiers (`showPicker` / `setFileInputFiles` / `fileChooserOpened` / `setInterceptFileChooserDialog` / transient or sticky user activation / `same-origin` or `cross-origin` gating / `NotAllowedError` / `SecurityError` / `type=tel` / `type=search` / `type=text` / picker availability) | **0** across all 20 |
| Sibling `SCORECARD.md` capability rows on the target ground | **0** across all 20 |
| Sibling `corpus/knowledge/**` notes claiming the target ground | **0** across all 20 |
| Sibling `SKILL.md` / `README.md` mentions on target ground | **0** across all 20 |
| Sibling `corpus/SOURCES.md` rows on `html.spec.whatwg.org/multipage/input.html` (specifying `showPicker()`, input types, picker availability) | **0** (only `links.html`, `parsing.html`, `scripting.html`, `semantics.html`, `syntax.html` are held by `kake`, `souji`, `kagi`) |
| Whole sibling tree, raw identifier grep | Non-claims only: public web captures in `chousa`, desktop MIME in `mado`, fixture HTML in `kagi`, harness strings in `kotoba`, old audit logs in `mori`/`tameshi` (see §4) |

**Contested rows on target capability ground: 0.** The five standing `contested` rows recorded in tabi's province (`kagi`, `kaidoku`, `kake`, `kumitate`, `revenger`) contest **shared loopback CDP endpoints, port leases, and substrate filesystem paths**, not the r85 C1 capability legs or picker availability laws. They are preserved and reported for the integrator to arbitrate, and are **not** absorbed.

The r85 C1 capability surface (the six new same-origin legs for `tel`, `search`, `text`; transient activation requirement; same-origin without activation `NotAllowedError`; same-origin with activation `undefined` + 0 choosers; cross-origin `SecurityError`; and all carried r84 legs) is **entirely uncontested across the fleet**.

---

## 2. Per-Lane Relation, Cite, Quote, and Tabi's Side

Relation labels and citations are anchored to tabi's committed adjacency matrix (`PROVINCE.md` → `## Adjacent — sibling matrix`, gated by `scripts/check-sibling-matrix-r69.mjs`). That matrix binds to the **frozen r69 snapshot** `.ufo/waves/round-69/c1/sibling-heads-r69.tsv`.

Re-running the committed gate read-only at scan time:
```
node scripts/check-sibling-matrix-r69.mjs --province PROVINCE.md \
  --snapshot .ufo/waves/round-69/c1/sibling-heads-r69.tsv --fleet /home/vgpnk/Projects/shokunin --json
→ {"verdict":"clean","siblings":20,"rows":20,"bound":20,
   "inbound":["kake","kengaku","kotoba"],
   "outbound":["kagi","kaidoku","kake","revenger"],"findings":[]}
```

Every one of the 20 quotes was independently re-read at the **current live sibling HEAD** pinned in `.ufo/waves/round-85/w1/sibling-heads-r85.tsv` and tested for on-line substring matching (normalizing whitespace and stripping backticks/markdown formatting per the gate rule). All quotes are ≤20 words per assignment constraint. **20/20 quotes continue to verify verbatim on-line at current heads**:

| lane | relation | head at scan | cite (`path:line`) | quote (≤20 words) | tabi's side of the boundary | on target ground? |
|---|---|---|---|---|---|---|
| audio | none | `f9da7ee9` | `PROVINCE.md:3` | `game audio production — SFX (UI, impacts, movement, ambience) and` | Tabi holds no audio production ground; no shared surface. | no |
| chousa | adjacent | `f484d94f` | `PROVINCE.md:5` | `question framing; source hierarchy (primary / secondary / aggregator /` | Tabi opens web sources under chousa's research method and keeps only its own SOURCES rows and browser findings. | no |
| game-dev-2d | none | `1e033ef0` | `PROVINCE.md:3` | `2D game production verified by executable headless fixtures` | Its headless fixtures are Godot runs, not browsers; no shared surface. | no |
| game-dev-3d | none | `39ca3973` | `PROVINCE.md:3` | `3D game production verified by executable headless fixtures — 3D` | Its headless fixtures are Godot runs, not browsers; no shared surface. | no |
| kagi | **contested** | `eb647d23` | `PROVINCE.md:64` | `CDP 9222 + ~/.local/share/the-musketeer/chrome-profile — **contested with kake**` | Tabi's CDP session discipline touches the musketeer 9222 lease; tabi never reads that profile's session material and leaves the lease with the integrator. | no — lease only |
| kaidoku | **contested** | `0b518f56` | `PROVINCE.md:55` | `self-launched targets: chromium --headless --remote-debugging-port=9222` | Both lanes self-launch Chromium over loopback CDP: kaidoku for reverse engineering, tabi for interaction evidence; tabi refuses forensics to kaidoku and reports the shared CDP ground. | no — CDP substrate only |
| kake | **contested** | `dd7a146d` | `PROVINCE.md:45` | `The the-musketeer Chrome profile lease is contested scope (kagi/tabi/kake)` | Tabi drives browsers and owns client-side crawler discipline; publishing and publisher-side placement stay kake's; the lease stays with the integrator. | no — lease only |
| kama | none | `bbdfc930` | `PROVINCE.md:3` | `local model serving & endpoint health — local LLM endpoints, baseURL` | Tabi drives browsers, never model endpoints; no shared surface. | no |
| kasegi | none | `a887f612` | `PROVINCE.md:52` | `Live-target testing is refused; this corpus is documentation only.` | Kasegi refuses live-target testing and tabi never drives a browser against a bounty target; no shared surface. | no |
| kengaku | adjacent | `34b28c47` | `PROVINCE.md:103` | `**tabi** scripts/check-measurement-binding.mjs:575-613 and **kama**` | Kengaku cites tabi's measurement-binding ancestor check as a shared primitive; nothing is absorbed either way and the instrument stays tabi's. | no |
| kotoba | adjacent | `0344ddae` | `PROVINCE.md:76` | `tabi owns browser-session and web-interaction evidence (PROVINCE.md:6-13)` | Kotoba owns SKILL.md wording craft fleet-wide; the browser content of tabi's SKILL.md stays tabi's. | no — but see §4 |
| kotodama | none | `5fa04a9b` | `PROVINCE.md:3` | `linguistic-cultural worldbuilding (言霊, kotodama — the coupling` | Tabi holds no worldbuilding ground; no shared surface. | no |
| kumitate | **contested** | `e4887850` | `PROVINCE.md:14` | `Kimi Code substrate ~/.kimi-code/ — rows K1–K5, gated by scripts/kimi-census.mjs` | Tabi's primary substrate, the kimi-webbridge plugin under `~/.kimi-code/plugins/managed/`, sits inside kumitate's censused path; reported for the integrator, not resolved here. | no — substrate path only |
| lore | none | `0f044aa7` | `PROVINCE.md:3` | `fictional-world records — entities (characters, places, factions, items), relations, timeline events` | Tabi holds no fictional-world ground; no shared surface. | no |
| mado | none | `ae537dbe` | `PROVINCE.md:3` | `desktop & compositor craft — the Hyprland/waybar/walker` | Tabi runs headless throwaway-profile browsers, never the desktop or compositor; no shared surface. | no |
| mori | none | `7765969c` | `PROVINCE.md:3` | `fleet & host observability (森) — whether the fleet, its waves and` | Tabi observes pages, not fleet liveness; no shared surface. | no |
| revenger | **contested** | `654d0929` | `PROVINCE.md:33` | `loopback CDP endpoint for REA's rea-cdp-browser provider (rea list-browser-targets,` | Both lanes drive loopback CDP browser targets: revenger for REA forensic inspection, tabi for interaction evidence; tabi refuses forensics and reports the overlap. | no — CDP substrate only |
| souji | none | `705fa138` | `PROVINCE.md:3` | `fleet repository & workspace hygiene (掃除) — receipt-gated` | Tabi cleans only its own scratch; no shared surface. | no |
| tameshi | adjacent | `b392f5fa` | `PROVINCE.md:14` | `product domains — every lane's gate remains its own; tameshi` | Tabi's counters and forgery batteries are its own gates; the reusable fixture and mutation method is tameshi's. | no |
| tsukuroi | none | `b6447374` | `PROVINCE.md:3` | `host operability & system repair (繕, mending) — the OS` | Tabi uses the installed `/usr/bin/chromium` and never repairs packages or host state; no shared surface. | no |

---

## 3. Inbound Reciprocity & Adjacency Scan

Three sibling lanes explicitly name `tabi` in their `PROVINCE.md`:
1. **`kake`** (`dd7a146d`):
   - Line 45: `The the-musketeer Chrome profile lease is contested scope (kagi/tabi/kake)` (`contested`).
   - Lines 40, 67, 310, 344, 368: explicitly delegate browser driving and execution to tabi (*"tabi drives browsers and owns client-side crawler discipline"*, *"browser execution stays tabi's"*, *"stays tabi's adjacent province for anything that executes a browser"*).
2. **`kengaku`** (`34b28c47`):
   - Line 103: cites tabi's `scripts/check-measurement-binding.mjs:575-613` as a shared measurement-binding ancestor.
3. **`kotoba`** (`0344ddae`):
   - Line 76: explicitly lists tabi in its sibling matrix as owning browser-session and web-interaction evidence (`PROVINCE.md:6-13`).

### Sibling Term Scans for the Five Topics:
1. **transient/sticky user activation:** Zero sibling lanes claim browser user activation. `kotoba` L21 mentions "transient text without a date" regarding prompt rules; `mado` L596/L620 mentions D-Bus application activation (`DBusActivatable`); `tsukuroi` L549 mentions a transient `Job=` systemd unit value. All are completely disjoint.
2. **`showPicker`:** Zero mentions in any sibling `PROVINCE.md`.
3. **input types and picker availability:** Zero mentions in any sibling `PROVINCE.md`. `game-dev-2d` (L3, L16, L24) and `game-dev-3d` (L6, L53) mention Godot/engine input loops; `mado` (L103, L104, L114, L124) mentions compositor keyboard options (`kb_layout`, `repeat_rate`); `mori` and `kengaku` mention test input files. All are completely disjoint.
4. **same-origin/cross-origin gating:** Zero mentions in any sibling `PROVINCE.md`. `kama` (L406, L415) mentions "pin origin"; `kasegi` (L12, L18) mentions the filesystem path `origin-work`; `souji` (L23) mentions git remote `origin`. All are completely disjoint.
5. **CDP interception of pickers:** Zero mentions in any sibling `PROVINCE.md`. `kagi` (L41, L64, L83, L91) and `revenger` (L30, L33) cite loopback CDP endpoints for 1Password bridge and REA inspection; `kaidoku` (L55, L139) cites self-launched headless Chromium CDP targets. None mentions `Page.setInterceptFileChooserDialog`, `Page.fileChooserOpened`, or `DOM.setFileInputFiles`.

---

## 4. Whole-Tree Non-Claim Hits

A whole-tree sweep across all 20 sibling trees for target identifiers confirmed occurrences in six sibling trees, none of which constitutes a lane capability claim:
1. **`chousa-shokunin`:** Downloaded HTML captures in `corpus/captures/` contain web forms with `<input type=search>` and `<input type=text>`. These are external document snapshots under research, not automation claims.
2. **`kagi-shokunin`:** Minified test sandboxes (`ClockS018.body.html`) contain standard React client code referencing `selectMultiple`.
3. **`kama-shokunin`:** Token audit logs cite tabi's receipt URLs observational data.
4. **`kotoba-shokunin`:** Compiled OMP agent runtime binary string dumps (`Kb82E12Loader-omp-18.14.0-strings.txt` and `omp-live-18.12.2-strings.txt`) contain harness code:
   - Line 636824: `if (typeof input.showPicker === "function") { input.showPicker(); }`
   - Line 636829: `// showPicker needs transient activation; a programmatic click is the fallback.`
   - Line 616594: `Page.setInterceptFileChooserDialog`
   - Line 652302: `Page.fileChooserOpened`
   - Line 655009: `DOM.setFileInputFiles`
   This confirms that the host's agent harness directly relies on `showPicker()`, transient activation fallback to click, and CDP file-chooser interception. Tabi's capability legs provide the formal browser verification of this exact runtime substrate.
5. **`mado-shokunin`:** Desktop MIME definitions (`MimeType=text/plain`).
6. **`mori-shokunin` / `tameshi-shokunin`:** Historical monitoring and mutation-audit logs.

---

## 5. Findings for the Integrator (Reported, Never Absorbed)

### F1 — Live Sibling Movement Since Round 84
Comparing live heads in `sibling-heads-r85.tsv` with round-84:
- **Moved since r84 (5 lanes):**
  - `chousa`: `6495ef88` → `f484d94f`
  - `kama`: `e2fed9f5` → `bbdfc930`
  - `souji`: `4557fc71` → `705fa138`
  - `tameshi`: `dae295de` → `b392f5fa`
  - `tsukuroi`: `ea8110b4` → `b6447374`
- **Unchanged since r84 (15 lanes):** `audio`, `game-dev-2d`, `game-dev-3d`, `kagi`, `kaidoku`, `kake`, `kasegi`, `kengaku`, `kotoba`, `kotodama`, `kumitate`, `lore`, `mado`, `mori`, `revenger`.

All 20 matrix quotes verify verbatim at the live heads under whitespace and markdown normalization. Zero drift impact on tabi's committed r69 gate.

### F2 — Standing Contested Rows and Integrator Questions
The 5 standing `contested` rows in `PROVINCE.md` raise the following specific coordination questions for the protocol integrator:

1. **`kagi` (`eb647d23`, L64):**
   *Ground:* CDP port 9222 and `~/.local/share/the-musketeer/chrome-profile` lease.
   *Integrator Question:* Does tabi's ephemeral loopback CDP session discipline (allocating dynamic high ports per invocation) conflict with kagi's 1Password native-messaging profile lease on loopback CDP port 9222?
2. **`kaidoku` (`0b518f56`, L55):**
   *Ground:* Self-launched headless Chromium over loopback CDP.
   *Integrator Question:* Should loopback CDP port allocations (tabi ephemeral high ports vs kaidoku 9222) be codified fleet-wide to prevent port collision during concurrent test runs?
3. **`kake` (`dd7a146d`, L45):**
   *Ground:* `the-musketeer` Chrome profile lease.
   *Integrator Question:* With kake explicitly delegating all browser execution to tabi (PROVINCE.md:40,67,310,368), should the contested musketeer Chrome profile lease be assigned exclusively to tabi or retired?
4. **`kumitate` (`e4887850`, L14):**
   *Ground:* `~/.kimi-code/` substrate path custody.
   *Integrator Question:* Does kumitate's shallow member census of `~/.kimi-code/` conflict with tabi's ownership of the `kimi-webbridge` plugin documentation and interaction surfaces under `~/.kimi-code/plugins/managed/`?
5. **`revenger` (`654d0929`, L33):**
   *Ground:* Loopback CDP browser endpoint inspection for REA.
   *Integrator Question:* Since revenger uses loopback CDP for REA forensic inspection while tabi uses CDP for browser interaction evidence, should a shared port reservation protocol be arbitrated by the integrator?

---

## 6. UFO-FSD Connector Move: One Bounded Synthesis

Per the UFO-FSD Connector mandate: *Find one non-obvious move — including a compatible synthesis across the round's proposals — that improves at least one of the round's declared axes without harming another.*

### Evidence
1. **R85Review1 Findings (§1 MEDIUM-3, MEDIUM-4):**
   - C1 claims "the SecurityError is origin-determined: same-origin without activation throws NotAllowedError, same-origin WITH activation returns undefined and opens NO chooser (no picker exists for these types), cross-origin throws SecurityError".
   - However, the measured fixture design is a 3-cell comparison, not 2×2. Every cross-origin leg invokes `showPicker()` *inside the child's click handler* (`go12/go13/go14`), so cross-origin **without** transient activation is never measured. The (cross-origin, no-activation) cell is missing from the receipt.
   - The phrase "(no picker exists for these types)" is an unrecorded inference: the receipt records only that `showPicker()` returned `undefined` and chooser count is 0.
2. **R85Critic Findings (§1):**
   - The activation confound is real: same-origin non-activated and cross-origin activated differ on **two** variables simultaneously (origin and activation).
   - Furthermore, the elements differ (`tes` same-origin vs `te` cross-origin).
3. **R85Scout Source Evidence (Chromium `blink/renderer/core/html/forms/html_input_element.cc:2652-2670`):**
   ```cpp
   if (FormControlType() != FormControlType::kInputFile &&
       FormControlType() != FormControlType::kInputColor && frame) {
     if (!frame->IsSameOrigin()) {
       exception_state.ThrowSecurityError("showPicker() called from cross-origin iframe.");
       return;
     }
   }
   if (!LocalFrame::HasTransientUserActivation(frame)) {
     exception_state.ThrowDOMException(DOMExceptionCode::kNotAllowedError, "showPicker() requires a user gesture.");
     return;
   }
   if (!isMutable()) {
     exception_state.ThrowDOMException(DOMExceptionCode::kInvalidStateError, "showPicker() may not be called on a disabled or read-only input.");
     return;
   }
   ```
   Chromium's implementation enforces a strict **3-tier exception cascade**:
   **Step 1:** Cross-origin check throws `SecurityError` immediately.
   **Step 2:** Transient activation check throws `NotAllowedError`.
   **Step 3:** Mutability check throws `InvalidStateError`.
   Because Step 1 precedes Step 2, a cross-origin iframe calling `showPicker()` **without** transient user activation will throw `SecurityError`, NOT `NotAllowedError`.

### Affected Axes
- **`coverage` (primary):** Completes the missing 4th cell of the 2×2 orthogonal design (Origin: {same, cross} × Transient Activation: {none, present}), upgrading C1 from an unbalanced 3-cell design to a complete 4-cell matrix.
- **`calibration` (primary):** Resolves the activation confound identified by R85Critic and R85Review1 empirically on the browser runtime, proving that `SecurityError` dominates `NotAllowedError`.
- **`depth` (secondary):** Formalizes and verifies Chromium's 3-tier DOMException precedence cascade (`SecurityError` > `NotAllowedError` > `InvalidStateError`).
- **`operability` (unharmed):** Battery and kill-power coverage remain complete; new refusal cases are added without breaking existing conjuncts.
- **`adjacency` (improved):** Directly verifies the iframe error-handling model relied upon by `kotoba`'s agent harness binary.

### Proposed Move
**Move: "The 2×2 Origin-Activation Orthogonal Matrix & 3-Tier Exception Cascade Verification" (Generation r86 frontier)**.

1. **Driver Surface (`CHILD_HTML` in `chrome-cdp-showpicker-round86.mjs`):**
   Add a message-driven, non-gesture invocation path in the cross-origin child iframe:
   ```javascript
   window.addEventListener('message', (ev) => {
     if (ev.data && ev.data.action === 'call-showpicker-no-gesture') {
       const el = document.getElementById(ev.data.targetId);
       try {
         const ret = el.showPicker();
         parent.postMessage({ leg: ev.data.leg, ok: true, ret: String(ret) }, '*');
       } catch (e) {
         parent.postMessage({ leg: ev.data.leg, ok: false, name: e.name, message: e.message }, '*');
       }
     }
   });
   ```
2. **Three New Cross-Origin Non-Activated Legs:**
   Measure `sp86-cross-origin-{tel,search,text}-unactivated`.
   - The parent posts message to child iframe without clicking or passing `userGesture`.
   - Child invokes `showPicker()`.
   - Measured law: throws `SecurityError` ("showPicker() called from cross-origin iframe."), NOT `NotAllowedError`.
   - This directly proves on live browser bytes that origin takes precedence over user activation, completely eliminating the confound.
3. **Counter Surface (`check-showpicker-r86.mjs`):**
   Add strict law asserting that cross-origin unactivated throws `SecurityError`:
   ```javascript
   check('sp86-cross-origin-cascade-law',
     same(leg.childResult, SECURITY_ERR_OBJ) &&
     leg.childActivationBefore.isActive === false &&
     leg.childActivationAfter.isActive === false,
     'cross-origin unactivated call must throw SecurityError (order discriminator over NotAllowedError)');
   ```
4. **Wording Precision:** Demote "(no picker exists for these types)" to explicit `[INFERENCE]`, and state the law as: *"same-origin without activation throws NotAllowedError; same-origin with activation returns undefined and opens zero choosers; cross-origin with OR without activation throws SecurityError"*.

### Risks & Mitigations
- *Risk:* `postMessage` delivery timing could introduce async flakiness into driver runs.  
  *Mitigation:* Reuse the existing bounded event-loop await pattern with fixed timeout and explicit message correlation ID already proven in `chrome-cdp-filechooser-round78.mjs`.
- *Risk:* Potential collateral impact in negative battery.  
  *Mitigation:* The new legs are purely additive (3 new legs in receipt, 3 new law checks), cleanly isolated from existing `ACT_LAW` and `CHILD_ACT_LAW`.

### Verification
- Negative battery test: mutate `childResult.name` from `'SecurityError'` to `'NotAllowedError'` on the unactivated leg → counter MUST refuse with `sp86-cross-origin-cascade-law`.
- Live browser run confirms `childResult.name === 'SecurityError'` despite `childActivationBefore.isActive === false`.
- Full 2×2 matrix verified:
  - same-origin, no-activation → `NotAllowedError`
  - same-origin, activated → `undefined` (0 choosers)
  - cross-origin, no-activation → `SecurityError`
  - cross-origin, activated → `SecurityError`

---

## 7. Verification Performed

| Check | Command / Method | Result |
|---|---|---|
| Sibling HEADs pinned at scan time | `git -C <repo> rev-parse HEAD` across 20 sibling lanes | 20/20 pinned; recorded in §2 and `sibling-heads-r85.tsv` |
| Sibling `PROVINCE.md` target-identifier scan | Regex scan over 20 sibling files | 0 hits on capability ground |
| Sibling `SCORECARD.md` target-identifier scan | Regex scan over 20 sibling files | 0 hits |
| Sibling `corpus/knowledge/**` target scan | Regex scan over all sibling knowledge notes | 0 hits |
| Sibling `SKILL.md` / `README.md` scan | Regex scan over 20 trees | 0 hits |
| Sibling `corpus/SOURCES.md` `input.html` scan | Regex scan over 20 files | 0 hits |
| Whole-tree raw identifier sweep | Recursive grep over 20 trees excluding `.git` | Non-claims only (§4) |
| r69 sibling-matrix gate (lane's own gate) | `node scripts/check-sibling-matrix-r69.mjs --province PROVINCE.md --snapshot .ufo/waves/round-69/c1/sibling-heads-r69.tsv --fleet /home/vgpnk/Projects/shokunin --json` | **clean**, 20 rows, 20 bound, 0 findings |
| All 20 matrix quotes re-verified at **current** heads | Per-lane `git show <current_head>:<path>` + `clean()` check | **20/20 on-line, all ≤20 words** |
| Seat output receipts placed | `ls -la .ufo/waves/round-85/w1/` | `R85Connector.md`, `sibling-heads-r85.tsv` |

**Tooling:** Zero tools installed or upgraded. Used pre-existing `node` (v24.21.0), `git`, `python3`. PACMAN GUARD strictly respected.  
**Scratch:** `/fast/scratch/hyaku/tabi-r85/R85Connector/` cleaned before yield per contract.
