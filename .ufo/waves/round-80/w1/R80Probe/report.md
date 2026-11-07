# R80Probe — activation-tree probe (round 80 / w1)

**Verdict: H CONFIRMED.** Transient user activation on Chromium 155.0.8059.84 (`--headless=new`) propagates from a cross-origin child frame's trusted click to the parent window, and the child's successful `HTMLInputElement.showPicker()` consumes it tree-wide.

## Hypothesis under test
H: user activation is per-frame-tree, so a trusted click inside the cross-origin iframe makes the PARENT window's `navigator.userActivation.isActive` true, and the child's successful `showPicker()` consumes it tree-wide (the parent's `isActive` returns false).

## Method
The frozen driver `scripts/chrome-cdp-showpicker-round80.mjs` (sha256 `cb93935c…`, per freeze.txt) was copied byte-for-byte into `.ufo/waves/round-80-seats/R80Probe/probe-activation.mjs` (the lane's scripts untouched) with exactly three functional deltas:

1. `LEGS` replaced by one leg `sp80r-activation-tree-probe` (cross-origin child, button `#go`, target `#s`, `Page.setInterceptFileChooserDialog {enabled:true}`, no userGesture).
2. The child template's `#go` click handler marks `window.__mark = {clicked:true}` synchronously, then defers `showPicker()` on `#s` behind a gate: it polls `window.__gate` in a `setTimeout` chain until the probe sets it.
3. The probe flow in `runLeg`: after the real CDP click (`Input.dispatchMouseEvent` mousePressed/mouseReleased, trusted) and the child's page-side mark, it reads the **parent** context activation (default `Runtime.evaluate` context) *while the child's showPicker has not run*, plus the child's own activation via its context; then releases the gate, waits for the child's `window.__r`, and re-reads both.

The fixture template is still extracted at runtime from the lane's frozen round-78 driver (read-only), so the parent page is byte-identical to the frozen fixture; only the child page (my seat copy's template) carries the gate/mark delta. One fresh browser per leg, per-leg HOME/profile/XDG, teardown proven clean.

## Measured timeline (raw values)

| point | parent `127.0.0.1:19280` | child `127.0.0.1:19282` |
|---|---|---|
| before click | `isActive:false, hasBeenActive:false` | `isActive:false, hasBeenActive:false` |
| after trusted child `#go` click, **before** child's `showPicker` (gate held) | **`isActive:true, hasBeenActive:true`** | `isActive:true, hasBeenActive:true` |
| after child's `showPicker` succeeded (`ok:true`, chooser open) | **`isActive:false, hasBeenActive:true`** | `isActive:false, hasBeenActive:true` |
| settle (parent read) | `isActive:false, hasBeenActive:true` | — |

Ordering is structural, not timing-based: the parent mid-read happened 1 ms after the child's mark (`midAtMs=1`), with `window.__gate=0` still holding the child's `showPicker` off; the gate release led to the child's call completing in 21 ms (`chooserWaitMs=21`) and exactly one `Page.fileChooserOpened` (`mode:"selectSingle"`, `backendNodeId:7`). The click was fully trusted: `pointerdown/mousedown/pointerup/mouseup/click` all `isTrusted:true` on target `go`, with the child's `isActive` already true at `pointerdown`.

Run: nonce `tabi-r80-r80probe-act1`, exit 0, leg errors `[]`, ports 19280/19281/19282, `2026-11-07T22:27:53Z`–`22:27:59Z`, Chromium 155.0.8059.84 Arch Linux, node v24.21.0, teardown sweep 0 rounds / 0 survivors / all ports closed / no late events.

## Why this is conclusive for both conjuncts

- **Conjunct 1 (child click → parent active):** the parent's baseline had `hasBeenActive:false` — the flip to `isActive:true, hasBeenActive:true` can only come from the child's click. The parent frame received no input event of its own. The frozen scored run corroborates independently: in `sp80-cross-origin-disabled` the parent's settle read is `{isActive:true,…}` after the child's non-consuming `InvalidStateError` call.
- **Conjunct 2 (successful child `showPicker` consumes tree-wide):** the parent's `isActive` is true while the child's call is still gated off, and false immediately after the child's successful call — with `hasBeenActive` unchanged (sticky activation is not consumed; only the transient flag drops, in both frames at once).

## Sharp edges recorded for r81

- `hasBeenActive` propagates parentward too — a "parent was never activated" assertion keyed on `hasBeenActive` would be wrong after any child click; key on `isActive` with a pre-consumption read.
- Consumption is tree-wide on success only: a failed child call (`InvalidStateError` on the disabled input) leaves the parent's transient activation alive (frozen leg + this probe agree).
- Cross-origin reachability is unchanged (`contentDocument === null`, `contentWindow.document` throws SecurityError); the tree-wide sharing of activation state does not relax document access — the two facts together explain why page script cannot construct the spec's SecurityError case for `showPicker`.

## Scope and honesty
One probe, one leg, one run, one verdict, as assigned. Frontier evidence for r81 planning; not a capability leg, not counter-scored; no frozen file, claim, prior, pin or threshold touched. Raw JSON: `.ufo/waves/round-80-seats/R80Probe/probe-activation.json`; verdict with full values: `.ufo/waves/round-80-seats/R80Probe/verdict.json`; probe driver: `.ufo/waves/round-80-seats/R80Probe/probe-activation.mjs` (probe sha256 `9b81edaabfdecf3702b360870b3765dcea8a7ec303bdc5116a0ace7fef4d5a62`, fixture sha256 `08ff9134…`, child page sha256 `8b908a15…`). Scratch `/fast/scratch/hyaku/tabi-r80/R80Probe/` deleted before yield. No tools installed; no pacman use.
