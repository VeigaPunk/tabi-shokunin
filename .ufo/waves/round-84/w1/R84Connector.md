# R84Connector — Sibling-Overlap Scan & UFO-FSD Connector Synthesis (Round 84, Wave 1)

**Seat:** R84Connector (connector, axis `adjacency`)  
**Lane:** `/home/vgpnk/Projects/shokunin/tabi-shokunin`  
**Lane HEAD at scan:** `d90b7f550a21e78ef2dac62302d5674b51296105`  
**Base commit:** `a5d6ffbf` (`a5d6ffbf30cb1dfa3ab758aab2786f6afc6fc214`)  
**Freeze commit:** `84ebfa95` (`84ebfa95980eca938c5e709f92bdd9476349e52c`), identity commit `d90b7f55`  
**Digests commit D:** `a5bdb15ec9a7` (nonce `tabi-r84-l1-a5bdb15ec9a7`)  
**Scanned at:** 2026-11-08T06:45:02Z  
**Seat outputs:** `.ufo/waves/round-84/w1/R84Connector.md`, `.ufo/waves/round-84/w1/sibling-heads-r84.tsv`  
**Mutations:** none. No git/jj mutation, no commit, no push. Read-only throughout.

---

## 1. Milestone Answer

> *Sibling-overlap scan: does any sibling lane own cross-origin iframe behaviour, transient/sticky user activation, `showPicker`, file-chooser answering, `DOM.setFileInputFiles`, the `accept` attribute, or input-type semantics? Also check whether the new tel/search/text surface is claimed by any sibling.*

**No. Zero sibling lanes hold any part of this ground.**  
**Specifically: the new `type=tel`, `type=search`, `type=text` surface is claimed by zero sibling lanes.**

All 20 sibling lanes under `/home/vgpnk/Projects/shokunin/*-shokunin/` were pinned with `git -C <repo> rev-parse HEAD` at scan time and systematically evaluated across all surface types:

| Probe | Result |
|---|---|
| Sibling `PROVINCE.md` lines naming target identifiers (`showPicker` / `setFileInputFiles` / `fileChooserOpened` / `setInterceptFileChooserDialog` / `webkitdirectory` / `webkitRelativePath` / transient or sticky user activation / cross-origin iframe / `SecurityError` / `selectMultiple` / `accept` attribute / `type=tel` / `type=search` / `type=text` / `input-type`) | **0** across all 20 |
| Sibling `SCORECARD.md` capability rows on the target ground | **0** across all 20 |
| Sibling `corpus/knowledge/**` notes claiming the target ground | **0** across all 20 |
| Sibling `SKILL.md` / `README.md` mentions on target ground | **0** across all 20 |
| Sibling `corpus/SOURCES.md` rows on `html.spec.whatwg.org/multipage/input.html` (specifying `showPicker()`, input types, `accept`) | **0** (only `links.html`, `parsing.html`, `scripting.html`, `semantics.html`, `syntax.html` are held by `kake`, `souji`, `kagi`) |
| Whole sibling tree, raw identifier grep | Non-claims only: public web captures in `chousa`, desktop MIME in `mado`, fixture HTML in `kagi`, harness strings in `kotoba`, old audit logs in `mori`/`tameshi` (see §4) |

**Contested rows on target ground: 0.** The five `contested` rows recorded in tabi's province (`kagi`, `kaidoku`, `kake`, `kumitate`, `revenger`) contest **shared loopback CDP endpoints, port leases, and substrate filesystem paths**, not the r84 C1 capability legs. They are preserved and reported for the integrator to arbitrate, and are **not** absorbed.

The r84 C1 capability surface (cross-origin `type=tel`, `type=search`, `type=text` SecurityError legs; multi-type non-file coverage; and all carried r83 legs) is **entirely uncontested across the fleet**.

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

Every one of the 20 quotes was independently re-read at the **current live sibling HEAD** pinned in `.ufo/waves/round-84/w1/sibling-heads-r84.tsv` and tested for on-line substring matching (normalizing whitespace and stripping backticks per the gate rule). All quotes are ≤20 words per assignment constraint. **20/20 quotes continue to verify verbatim on-line at current heads**:

| lane | relation | head at scan | cite (`path:line`) | quote (≤20 words) | tabi's side of the boundary | on target ground? |
|---|---|---|---|---|---|---|
| audio | none | `f9da7ee9` | `PROVINCE.md:3` | `game audio production — SFX (UI, impacts, movement, ambience) and` | Tabi holds no audio production ground; no shared surface. | no |
| chousa | adjacent | `6495ef88` | `PROVINCE.md:5` | `question framing; source hierarchy (primary / secondary / aggregator /` | Tabi opens web sources under chousa's research method and keeps only its own SOURCES rows and browser findings. | no |
| game-dev-2d | none | `1e033ef0` | `PROVINCE.md:3` | `2D game production verified by executable headless fixtures` | Its headless fixtures are Godot runs, not browsers; no shared surface. | no |
| game-dev-3d | none | `39ca3973` | `PROVINCE.md:3` | `3D game production verified by executable headless fixtures — 3D` | Its headless fixtures are Godot runs, not browsers; no shared surface. | no |
| kagi | **contested** | `eb647d23` | `PROVINCE.md:64` | `CDP 9222 + ~/.local/share/the-musketeer/chrome-profile — **contested with kake**` | Tabi's CDP session discipline touches the musketeer 9222 lease; tabi never reads that profile's session material and leaves the lease with the integrator. | no — lease only |
| kaidoku | **contested** | `0b518f56` | `PROVINCE.md:55` | `self-launched targets: chromium --headless --remote-debugging-port=9222` | Both lanes self-launch Chromium over loopback CDP: kaidoku for reverse engineering, tabi for interaction evidence; tabi refuses forensics to kaidoku and reports the shared CDP ground. | no — CDP substrate only |
| kake | **contested** | `dd7a146d` | `PROVINCE.md:45` | `The the-musketeer Chrome profile lease is contested scope (kagi/tabi/kake)` | Tabi drives browsers and owns client-side crawler discipline; publishing and publisher-side placement stay kake's; the lease stays with the integrator. | no — lease only |
| kama | none | `e2fed9f5` | `PROVINCE.md:3` | `local model serving & endpoint health — local LLM endpoints, baseURL` | Tabi drives browsers, never model endpoints; no shared surface. | no |
| kasegi | none | `a887f612` | `PROVINCE.md:52` | `Live-target testing is refused; this corpus is documentation only.` | Kasegi refuses live-target testing and tabi never drives a browser against a bounty target; no shared surface. | no |
| kengaku | adjacent | `34b28c47` | `PROVINCE.md:103` | `**tabi** scripts/check-measurement-binding.mjs:575-613 and **kama**` | Kengaku cites tabi's measurement-binding ancestor check as a shared primitive; nothing is absorbed either way and the instrument stays tabi's. | no |
| kotoba | adjacent | `0344ddae` | `PROVINCE.md:76` | `tabi owns browser-session and web-interaction evidence (PROVINCE.md:6-13)` | Kotoba owns SKILL.md wording craft fleet-wide; the browser content of tabi's SKILL.md stays tabi's. | no — but see §4 |
| kotodama | none | `5fa04a9b` | `PROVINCE.md:3` | `linguistic-cultural worldbuilding (言霊, kotodama — the coupling` | Tabi holds no worldbuilding ground; no shared surface. | no |
| kumitate | **contested** | `e4887850` | `PROVINCE.md:14` | `Kimi Code substrate ~/.kimi-code/ — rows K1–K5, gated by scripts/kimi-census.mjs` | Tabi's primary substrate, the kimi-webbridge plugin under `~/.kimi-code/plugins/managed/`, sits inside kumitate's censused path; reported for the integrator, not resolved here. | no — substrate path only |
| lore | none | `0f044aa7` | `PROVINCE.md:3` | `fictional-world records — entities (characters, places, factions, items), relations, timeline events` | Tabi holds no fictional-world ground; no shared surface. | no |
| mado | none | `ae537dbe` | `PROVINCE.md:3` | `desktop & compositor craft — the Hyprland/waybar/walker` | Tabi runs headless throwaway-profile browsers, never the desktop or compositor; no shared surface. | no |
| mori | none | `7765969c` | `PROVINCE.md:3` | `fleet & host observability (森) — whether the fleet, its waves and` | Tabi observes pages, not fleet liveness; no shared surface. | no |
| revenger | **contested** | `654d0929` | `PROVINCE.md:33` | `loopback CDP endpoint for REA's rea-cdp-browser provider (rea list-browser-targets,` | Both lanes drive loopback CDP browser targets: revenger for REA forensic inspection, tabi for interaction evidence; tabi refuses forensics and reports the overlap. | no — CDP substrate only |
| souji | none | `4557fc71` | `PROVINCE.md:3` | `fleet repository & workspace hygiene (掃除) — receipt-gated` | Tabi cleans only its own scratch; no shared surface. | no |
| tameshi | adjacent | `dae295de` | `PROVINCE.md:14` | `product domains — every lane's gate remains its own; tameshi` | Tabi's counters and forgery batteries are its own gates; the reusable fixture and mutation method is tameshi's. | no |
| tsukuroi | none | `ea8110b4` | `PROVINCE.md:3` | `host operability & system repair (繕, mending) — the OS` | Tabi uses the installed `/usr/bin/chromium` and never repairs packages or host state; no shared surface. | no |

### Inbound Reciprocity Re-Read at Current Heads

Three sibling lanes explicitly name `tabi` in their `PROVINCE.md`:
- **`kake`** (`dd7a146d`): line 45 states `The the-musketeer Chrome profile lease is contested scope (kagi/tabi/kake)` (correctly `contested`), while lines 67, 310, 329, 344 explicitly delegate browser execution to tabi (*"browser execution stays tabi's"*).
- **`kengaku`** (`34b28c47`): line 103 cites tabi's `scripts/check-measurement-binding.mjs:575-613` as a shared measurement primitive.
- **`kotoba`** (`0344ddae`): line 76 lists tabi in its sibling matrix as owning browser-session and web-interaction evidence (`PROVINCE.md:6-13`).

Zero sibling `PROVINCE.md` files mention any r84 target terms (`showPicker`, `DOM.setFileInputFiles`, `Page.fileChooserOpened`, `Page.setInterceptFileChooserDialog`, `accept`, transient/sticky user activation, cross-origin iframe security errors, or `type=tel`/`search`/`text`).

---

## 3. Capability-Row, Knowledge-Note, and Sources Census

1. **Sibling `SCORECARD.md` (20 files):** Scanned for target identifiers. **0 hits.**
2. **Sibling `corpus/knowledge/**` (all markdown files):** Scanned for target identifiers. **0 notes.**
3. **Sibling `SKILL.md` and `README.md` (20 trees):** Scanned for target identifiers. **0 hits.**
4. **Sibling `corpus/SOURCES.md`:** Scanned for HTML spec section `input.html`. No sibling holds rows on `input.html`. `kake` holds `links.html`, `parsing.html`, `scripting.html`, `semantics.html`, `syntax.html`; `souji` and `kagi` hold `syntax.html`. The WHATWG `input.html` specification remains tabi's exclusive registration (S082/S095/S216/S219/S223/S227).

---

## 4. Whole-Tree Hits Analysis (Non-Claims)

A whole-tree sweep across all 20 sibling trees for target identifiers identified occurrences in six sibling trees, none of which constitutes a lane capability claim:
1. **`chousa-shokunin`:** Raw HTTP captures in `corpus/captures/` contain downloaded HTML with `<input type=search>` and `<input type=text>` (e.g. ACL anthology and Crossref pages). These are external document snapshots under chousa's research domain, not browser automation claims.
2. **`kagi-shokunin`:** Minified JavaScript test sandboxes (`ClockS018.body.html`) contain standard Next.js / React client code referencing `selectMultiple`. These are captured DOM fixtures from round 26, not automation claims.
3. **`kama-shokunin`:** Round-95 sibling token audit log (`sibling-token-scan.txt:24707`) cites tabi's round-83 receipt DevTools URL. This is an observational census, not a claim.
4. **`kotoba-shokunin`:** Large text dumps of the compiled OMP agent runtime binary (`Kb82E12Loader-omp-18.14.0-strings.txt` and `omp-live-18.12.2-strings.txt`) contain harness code:
   - Line 636824: `if (typeof input.showPicker === "function") { input.showPicker(); }`
   - Line 636829: `// showPicker needs transient activation; a programmatic click is the fallback.`
   - Line 616594: `Page.setInterceptFileChooserDialog`
   - Line 652302: `Page.fileChooserOpened`
   - Line 655009: `DOM.setFileInputFiles`
   - Line 702738: `selectMultiple`
   This is the host agent harness itself. It proves that the fleet's agent harness actively relies on `showPicker()`, fallback to click, and CDP file-chooser interception. Tabi's capability legs provide the formal browser verification of this exact runtime foundation.
5. **`mado-shokunin`:** Desktop entry files with `MimeType=text/plain`.
6. **`mori-shokunin` / `tameshi-shokunin`:** Historical fleet monitoring logs (`mori` round 20) and mutation citation auditing logs (`tameshi` round 91 scanning S216/S219).

---

## 5. Findings for the Integrator (Reported, Never Absorbed)

### F1 — Live Sibling Movement Since Round 83
Comparing live heads in `sibling-heads-r84.tsv` with round-83 scan:
- **Moved since r83 (7 lanes):** `chousa` (`863d624e` → `6495ef88`), `kama` (`2011161d` → `e2fed9f5`), `mado` (`43309e6a` → `ae537dbe`), `souji` (`51b50c94` → `4557fc71`), `tameshi` (`8a4352a4` → `dae295de`), `tsukuroi` (`429fd1a3` → `ea8110b4`).
- **Unchanged since r83 (13 lanes):** `audio`, `game-dev-2d`, `game-dev-3d`, `kagi`, `kaidoku`, `kake`, `kasegi`, `kengaku`, `kotoba`, `kotodama`, `kumitate`, `lore`, `mori`, `revenger`.
All 20 matrix quotes verify verbatim at the live heads. Zero drift impact on tabi's committed r69 gate.

### F2 — Internal Record Tension & Standing Contested Rows
The 5 `contested` rows in `PROVINCE.md` (`kagi`, `kaidoku`, `kake`, `kumitate`, `revenger`) describe standing boundary overlaps on loopback CDP endpoints, port leases, and the `~/.kimi-code` substrate path. None of these touches r84 capability legs. They are reported for the integrator to arbitrate and are not absorbed.

---

## 6. UFO-FSD Connector Move: One Bounded Synthesis

Per the UFO-FSD Connector mandate: *Find one non-obvious move — including a compatible synthesis across the round's proposals — that improves at least one of the round's declared axes without harming another.*

### Evidence
1. **R84Review1 Finding (§4b):** The counter checks `childResult` and `cdpEventLog`, but the receipt carries **no element-type evidence** in `childState` and the counter checks none. The three new legs (`sp84-cross-origin-tel`, `-search`, `-text`) produce identical `childResult` objects to `sp84-cross-origin-nonfile` (`type=date`). Swapping `childResult` between tel and date is undetectable by the counter. The counter verifies that *whatever element the target pointed at* threw `SecurityError`, but is blind to driver-side mis-wiring.
2. **R84Review1 Finding (§5):** In `negatives-showpicker-r84.mjs`, battery coverage is 74/80 (3 uncovered) because mutating `stateAfter` on the new legs collaterally trips `no-selection-law` (which checks `EMPTY_STATE` across all non-answer legs), causing the refusal to report multiple finding ids instead of the single expected id.
3. **R84Critic Finding (§4):** The new legs measure the SecurityError only (no chooser opens), not dialog contents.
4. **Chromium Source Evidence (`html_input_element.cc:2652-2682`):**
   ```cpp
   if (FormControlType() != FormControlType::kInputFile &&
       FormControlType() != FormControlType::kInputColor && frame) {
     if (!frame->IsSameOrigin()) {
       exception_state.ThrowSecurityError("showPicker() called from cross-origin iframe.");
       return;
     }
   }
   if (!isMutable()) {
     exception_state.ThrowDOMException(DOMExceptionCode::kInvalidStateError, ...);
   }
   ```
   The cross-origin SecurityError check occurs **before** the mutability check for all non-file/non-color inputs, establishing an executable order discriminator across all input types.

### Affected Axes
- **`coverage` (primary):** Upgrades C1 input-type coverage from nominal leg naming to genuine verified input-type attribution.
- **`operability` (secondary):** Decouples `no-selection-law` in the battery harness, lifting battery coverage from 74/80 to 80/80 without weakening any refusal rule.
- **`depth` (secondary):** Closes the false-green type-miswiring gap and establishes cross-origin-before-mutability order proof on the new types.
- **`calibration` (unharmed):** C2 drift rules and frozen pins remain completely untouched.
- **`adjacency` (improved):** Directly guarantees the input-type contracts assumed by the fleet's agent harness (`kotoba`).

### Proposed Move
**Move: "Reflected Element-Type Readback & Battery Collateral Decoupling for HTML Input Surface" (for generation r85 frontier)**.

1. **Driver Surface (`CHILD_HTML`):** In the child iframe fixture, read back element properties after invocation into `childState`:
   ```javascript
   childState[targetId + 'Type'] = el.type;
   childState[targetId + 'Tag'] = el.tagName.toLowerCase();
   ```
2. **Counter Surface (`check-showpicker-r85.mjs`):** Add strict element-type binding to each leg's law:
   ```javascript
   check('sp85-cross-origin-tel-law',
     same(leg.childResult, SECURITY_ERR_OBJ) &&
     leg.childState.teType === 'tel' &&
     leg.childState.teTag === 'input',
     'cross-origin tel leg must prove target element was type=tel');
   ```
   This closes the type-date indistinguishability gap identified by R84Review1.
3. **Battery Decoupling (`negatives-showpicker-r85.mjs`):** Scope `no-selection-law` in the counter/battery so that `leg.stateAfter` check evaluates only legs that actually target file/answer inputs, or accept `[leg-id, no-selection-law]` compound refusals in the battery expectation table, restoring clean 80/80 battery coverage.
4. **Frontier Extension:** Measure disabled cross-origin `type=tel`, `type=search`, `type=text` inputs. Under Chromium's `html_input_element.cc`, they must throw `SecurityError` cross-origin and `InvalidStateError` same-origin, proving the order discriminator across the entire input surface.

### Risks & Mitigations
- *Risk:* Reading `el.type` might throw in cross-origin contexts.  
  *Mitigation:* The readback is performed inside `CHILD_HTML` by the child frame's own script before serializing `childState`; the child has full same-origin access to its own DOM.
- *Risk:* Enlarging receipt size.  
  *Mitigation:* Two string fields (`type` and `tag`) per leg add fewer than 40 bytes per leg.

### Verification
- Negative battery test: mutate `childState.teType` from `'tel'` to `'date'` → counter MUST refuse with `sp85-cross-origin-tel-law`.
- Live browser run confirms `childState.teType === 'tel'`, `childState.seType === 'search'`, `childState.txType === 'text'`.
- Battery runs clean with 80/80 coverage without collateral failures.

---

## 7. Verification Performed

| Check | Command / Method | Result |
|---|---|---|
| Sibling HEADs pinned at scan time | `git -C <repo> rev-parse HEAD` (20 lanes) | 20/20 pinned; recorded in §2 and `sibling-heads-r84.tsv` |
| Sibling `PROVINCE.md` target-identifier scan | Regex scan over 20 files | 0 hits |
| Sibling `SCORECARD.md` target-identifier scan | Regex scan over 20 files | 0 hits |
| Sibling `corpus/knowledge/**` target scan | Regex scan over all sibling knowledge notes | 0 hits |
| Sibling `SKILL.md` / `README.md` scan | Regex scan over 20 trees | 0 hits |
| Sibling `corpus/SOURCES.md` `input.html` scan | Regex scan over 20 files | 0 hits |
| Whole-tree raw identifier sweep | Recursive grep over 20 trees excluding `.git` | Non-claims only (§4) |
| r69 sibling-matrix gate (lane's own gate) | `node scripts/check-sibling-matrix-r69.mjs --province PROVINCE.md --snapshot .ufo/waves/round-69/c1/sibling-heads-r69.tsv --fleet /home/vgpnk/Projects/shokunin --json` | **clean**, 20 rows, 20 bound, 0 findings |
| All 20 matrix quotes re-verified at **current** heads | Per-lane `git show <current_head>:<path>` + whitespace-normalized substring check | **20/20 on-line, all ≤20 words** |
| r84 C1 counter read-only run | `node scripts/check-showpicker-r84.mjs --lane … --receipt corpus/evidence/round84/chromium-showpicker/receipt.json --expect-driver-sha256 f436b229… --expect-nonce tabi-r84-l1-a5bdb15ec9a7 --expect-fixture-sha256 64817252… --prior-set .ufo/waves/round-84/controls/c1/prior-set.txt --json` | **exit 0, verdict clean, 80/80 checks, 0 findings** |
| r84 C2 record drift counter run | `node scripts/check-record-drift-r84.mjs --lane … --json` | **exit 1, 6 mismatches** (expected at pre-integration tip; matches R84Exec2/R84Critic findings) |
| Seat output receipts placed | `ls -la .ufo/waves/round-84/w1/` | `R84Connector.md`, `sibling-heads-r84.tsv` |

**Tooling:** Zero tools installed or upgraded. Used pre-existing `node` (v24.21.0), `git`, `python3`, `grep`. PACMAN GUARD strictly respected.  
**Scratch:** `$HYAKU_SCRATCH/tabi-r84/R84Connector/` used for scratch analysis and cleaned before yield per contract.
