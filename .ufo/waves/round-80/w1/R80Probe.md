# R80Probe — scoped findings: is transient activation per-frame-tree?

**Milestone:** one falsifiable probe — does the child frame's trusted click make the PARENT's `isActive` true, and does the child's successful `showPicker()` consume it tree-wide?

**Verdict: H CONFIRMED.**

## Measured (Chromium 155.0.8059.84 --headless=new, 127.0.0.1:19280 parent / :19282 child, nonce tabi-r80-r80probe-act1, exit 0, leg errors [])

| point | parent isActive / hasBeenActive | child isActive / hasBeenActive |
|---|---|---|
| before trusted child `#go` click | false / false | false / false |
| after click, child `showPicker` still gated OFF | **true / true** | true / true |
| after child `showPicker` ok:true, 1 chooser (`selectSingle`) opened | **false / true** | false / true |
| settle | false / true | — |

Ordering is structural: a child page-side mark (`window.__mark.clicked`) gates `showPicker()` behind `window.__gate`; the parent is read (default `Runtime.evaluate` context) 1 ms after the mark and before gate release; the chooser fires 21 ms after release. All five click events `isTrusted:true`, target `go`; parent baseline `hasBeenActive:false` proves the mid flip came from the child's click. Teardown clean (0 survivors, ports closed, no late events).

## Consequences
1. Transient activation propagates cross-origin child → parent (per-frame-tree, not per-frame).
2. A successful child `showPicker()` consumes the transient flag tree-wide (both frames drop to `isActive:false` simultaneously); sticky `hasBeenActive` is unaffected and also propagates parentward.
3. Frozen-leg cross-check: `sp80-cross-origin-disabled` already showed the parent `isActive:true` at settle after the child's non-consuming `InvalidStateError` — consumption happens only on success.
4. r81 guidance: any parent-side "no activation" assertion must read `isActive` before a consuming child call and must not rely on `hasBeenActive`.

## Artifacts
- Raw receipt (counter-shaped, seat dir only): `.ufo/waves/round-80-seats/R80Probe/probe-activation.json`
- Verdict + exact values + provenance sha256s: `.ufo/waves/round-80-seats/R80Probe/verdict.json`
- Probe driver (frozen driver copy, LEGS + gated child handler delta only; lane scripts untouched): `.ufo/waves/round-80-seats/R80Probe/probe-activation.mjs`
- Prose report: `.ufo/waves/round-80/w1/R80Probe/report.md`

Scope: frontier probe evidence for r81; not a capability leg, not counter-scored; no frozen file, claim, prior, pin or threshold touched; scratch deleted.
