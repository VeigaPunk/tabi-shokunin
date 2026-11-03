# Round 61 lesson — tabi, 2026-11-03 (Linux host, attempt 1)

Draft skeleton for `corpus/lessons/round-61.md` (R61Scribe). Every `<L1-fills: ...>` is a value the L1 supplies from the instrument freeze, the data pass and the wave results. This draft asserts no result. Delete this paragraph at integration.

Claims (frozen at `7032914cb5229dc9ce2b867827e6f1ee5db7673b`; lane baseline `6c5c2a2ef5dc9c790426e7d9efe2d3025a156441`; wave w1; instrument freeze `<L1-fills: revision>`; pre-data corrections `<L1-fills: none, or list with revisions>`):

- **C1 adjacency** (lowest owned axis, score 8): the v20 snapshot-bound adjacency meter generation + the r61 ledger rebind + the wide-screen re-clear. The meter `node .ufo/waves/round-61/counters/c1-adjacency-host-v20.mjs --rev <data-rev> --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --fleet /home/vgpnk/Projects/shokunin --snapshot .ufo/waves/round-61/c1/snapshot-r61.tsv --json` must exit 0 with predicate true, keeping the v19 core mechanics (P1 audit re-derivation, P2 roster completeness, P3 bounded delta screen, generation strings relabelled and the r61 audit/delta ledgers regenerated at the snapshot heads), replacing per-run heads with the frozen snapshot (sibling bytes read by `git cat-file` at the snapshot heads, live-head drift disclosed and NOT a finding), carrying every v19 selftest case plus the moved-sibling / missing-snapshot / unresolvable-head cases, and re-clearing the unchanged r60 wide-screen counter at `scope=wide` over the same snapshot (`enumeratedMd == screenedMd`, `unscreenedMd 0`, `rowMismatch 0`, `unresolvableHead 0`, `roster 20`). Kill rules K1–K5. **Verdict: `<L1-fills: VERIFIED / KILLED by K<n>>`.**
- **C2 coverage** (score 9; capability `chromium-pointer-event-domain-linux`): the Linux Chromium 155 loopback surface carries the pointer-event domain — `Input.dispatchMouseEvent` with `pointerType: "mouse"` delivers page-visible PointerEvents whose `pointerType`, numeric `pointerId`, `isTrusted`, `button` and `buttons` the page's own recorder witnesses; the press focuses the fixture input; the nonce-typed field trace re-derives per keystroke; teardown closes with 0 survivors and both ports closed. The r61 counter `chromium-receipt-r61.mjs` (`sha256 <L1-fills: pinned at instrument freeze>`) must green the committed live receipt, refuse the frozen forgery set F = {f1 pointerType touch, f2 first pointerdown deleted, f3 pointerId removed, f4 pointermove isTrusted removed} with `forgedGreen 0`, and pass selftest carrying the r60 110 cases plus the pointer forgery/mutant cases; the unchanged r60 counter must refuse the pointer receipt (cross-refusal). Kill rules f1–f5. **Verdict: `<L1-fills: VERIFIED / KILLED by f<n>>`.**

Round verdict: **`<L1-fills: admitted / not admitted>`**.

## Gate

Sources opened this round (fetch guard R57-S3: final host equals cited host, `num_redirects` 0, HTTP 200; receipts under `.ufo/waves/round-61/sources/`).

### Candidates

| Source | Opened | Located quote (≤25 words) | Decision |
|---|---|---|---|
| S164 — W3C Pointer Events (Level 4) — https://www.w3.org/TR/pointerevents/ (NEW row; staged `s164-pointerevents.html`, 948,439 B, sha256 `ed503a5e0a6becf0898c0156bec45f0491132dab75cbebb73a14552e9e3318b8`; receipt `sources/s164-fetch-receipt.json`, HTTP 200, 0 redirects, host match, guardOk true) | 2026-11-03 | `Indicates the device type that caused the event (such as mouse, pen, touch).` — dd of dfn `dom-pointerevent-pointertype` (raw 1699; dfn raw 1697) | `<L1-fills: admit / reject>` |
| S164 — same fetch | 2026-11-03 | `A unique identifier for the pointer causing the event.` — dfn `dom-pointerevent-pointerid` (raw 1630, body 1630–1632) | `<L1-fills: admit / reject>` |
| S164 — same fetch | 2026-11-03 | `The user agent MUST fire a pointer event named pointerdown when a pointer enters the active buttons state.` — §3.3.3 pointerdown (raw 2261) | `<L1-fills: admit / reject>` |
| S164 — same fetch | 2026-11-03 | value-table cells `Mouse mouse`, `Pen / stylus pen`, `Touch contact touch` (raw 1705–1707) | `<L1-fills: admit / reject>` |
| S164 — same fetch | 2026-11-03 | `isTrusted` occurs exactly 3 times (raw 3822, 3937, 3992), all three href `https://dom.spec.whatwg.org/#dom-event-istrusted`; `definesIt` false (`sources/s164-quotes.json`) | **reject as the definition site of `isTrusted`** — referenced only; the counter's `isTrusted` check is a page-side behaviour witness |
| S153 — CDP `browser_protocol.json` at `@master` (re-open; receipt `sources/s153-reopen-receipt.json`) | 2026-11-03 | `Input.dispatchMouseEvent` raw 14458, dispatch description raw 14459; byte-identical to the registered anchor: 1,423,170 B, sha256 `d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7` | `<L1-fills: admit the re-open / record as a new claim>` |
| S161 — W3C UI Events (re-open; receipt `sources/s161-reopen-receipt.json`) | 2026-11-03 | keydown row raw 2222, Cancelable cell `Yes` raw 2224; byte-identical to the registered anchor: 920,762 B, sha256 `8ded5eaf4f190b13c59582d5e92b81d3585112dde963d71d65d8e5991212b918` | `<L1-fills: admit the re-open / record as a new claim>` |

### Admitted

- `<L1-fills: one bullet per admitted source, the located quote and the admission ground>`

### Rejected

- S164 as the definition site of `isTrusted` — the served bytes reference the bit in coalesced/predicted-event rules and the inherited-property rule; they never define it. No registered row scopes the DOM Standard's `Event.isTrusted` (S163 is scoped to `cancelable`), so the note admits the page-side witness as measured behaviour only.
- `<L1-fills: any fetch the scout refused or the L1 re-classified>`

### Spot-check result

- Definition-site sweep (QUALITY criterion 111), verified against `sources/s164-quotes.json`: `pointerType` is a definition site (dfn id `dom-pointerevent-pointertype`, raw 1697, `data-dfn-type="attribute"`, `data-dfn-for="PointerEvent"`); `pointerId` is a definition site (dfn id `dom-pointerevent-pointerid`, raw 1630, same attribute/interface attributes); `isTrusted` is NOT a definition site in S164 — three occurrences, all href `https://dom.spec.whatwg.org/#dom-event-istrusted`, `definesIt` false.
- S153 quote-set gap: the staged bytes locate the `dispatchMouseEvent` command at raw 14458 and its description at 14459, but the `pointerType` parameter is at raw 14558–14561 (`"description": "Pointer type (default: \"mouse\")."`) and is NOT in `sources/s153-quotes.json`. The knowledge note cites it from the staged bytes; the L1 decides whether to extend the receipt's quote set or drop the CDP-parameter sentence from the note.
- `<L1-fills: independent re-fetch or receipt byte check by the L1, and the verdict>`

## Work performed — evidence pointers

`<L1-fills: claims/freeze, snapshot, wave seats, instruments (counter sha256, driver sha256, rebind sha256), seat reports, receipts, controls>`

## Measurements (counting commands; pasteable)

C1 — before-state at the frozen baseline:
```
node .ufo/waves/round-59/counters/c1-adjacency-host-v19.mjs --rev 6c5c2a2ef5dc9c790426e7d9efe2d3025a156441 --repo /home/vgpnk/Projects/shokunin/tabi-shokunin --fleet /home/vgpnk/Projects/shokunin --json
#  -> exit 1, predicate false, findingCount 18 (`controls/c1-v19-at-round-open.json`; frozen measurement)
```
C1 — the claim's after-command, the wide-screen re-clear, the do-nothing control:
```
<L1-fills: the four runbook commands (step 2a–2d) with exit codes and counts>
```
C2 — the live receipt, the forgery set, the cross-refusal, the carried-schema check, the selftest:
```
<L1-fills: the runbook step 3a–3f commands with exit codes and findings>
```

## Mistakes

| Class · evidence | Captured-by | Fix |
|---|---|---|
| **1. Stale premise: the C2 do-nothing sweep was first written as "grep finds none".** That sentence was false. Vendored bundles, pinned upstream release bytes, fetched source snapshots and the WebDriver BiDi sent-command strings all carry `pointerdown` mentions; what is absent is a lane-authored artifact that witnesses a page-side `PointerEvent`. Evidence pointer `.ufo/waves/round-61/controls/pointer-absence-sweep.txt` (as committed: lane-authored section `exit=2`, vendor/upstream section `exit2=0` with four BiDi transcript paths). | none — the freeze self-check caught it pre-commit | The sweep wording was corrected to "no lane-authored artifact witnesses a page-side PointerEvent" BEFORE the freeze landed; the frozen claims carry the corrected sentence (`.ufo/waves/round-61/claims.json` C2 `remedies` and `doNothingControl`). |
| _(empty — L1 fills from wave findings)_ | — | — |
| _(empty — L1 fills from wave findings)_ | — | — |
| _(empty — L1 fills from wave findings)_ | — | — |

## Census

Start: `sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` -> exit 0, `tabi ok`, 163 rows, 22 W04 (`controls/census-start.txt`; frozen).
End: `<L1-fills: exit code, row count 164, W04 count; `controls/census-end.txt`>`. `node scripts/check-sources.mjs` -> `<L1-fills: verdict, rows, findings>`.

## Sources & frontier

- Registry: 163 -> 164 (S164 new, `mined`, `used-by` = `corpus/knowledge/chromium-pointer-event-domain-round-61.md`, `corpus/lessons/round-61.md`). S153 `used-by` extended old -> new with `corpus/knowledge/chromium-pointer-event-domain-round-61.md` and `corpus/lessons/round-61.md` (the note cites the dispatchMouseEvent parameter; the lesson records the re-open). S161 `used-by` extended old -> new with `corpus/lessons/round-61.md` only (the note does not cite S161). No in-place anchor edit (R1). S161's old chain ends `corpus/lessons/round-60.md`; S153's old cell is the `@master` re-open chain.
- Knowledge notes: 74 -> `<L1-fills: 75 if the note is admitted>` (`chromium-pointer-event-domain-round-61.md`).
- Frontier advanced: `<L1-fills: what ground moved from unheld to held, with the evidence pointer; name what stays open (touch/pen pointers, pointer capture, coalesced events, isTrusted definition site)>`.
- Assimilation: none — adoption stays closed (L0 `tabi | round-57`); `considerthese/` does not exist in the lane repo (claims.json checked 2026-11-03).
- Sourced claim: C2 rests on S164 (opened this round) and the S153/S161 re-opens.

## Limits (named, not smoothed)

- `<L1-fills: C1 and C2 residuals from the data pass and the attack seats; none may be smoothed>`
- One host (Linux, Chromium 155 loopback). No real site, no touch or pen pointers, no multi-pointer chords; S164's value set is named but only `mouse` is measured.
- `pointerId` is implementation specific (S164 raw 1635); the observed value is a witness of one run, not a rule.
- `isTrusted` has no registered definition site; the page-side `isTrusted: true` is measured, not sourced from S164.
- S153's registered scope names Page.captureScreenshot and `/json/new`; the dispatchMouseEvent `pointerType` parameter is read from the same pinned bytes and the scope mismatch is disclosed, not repaired, this round.

## Corrections of record

- L0 `tabi | round-59` (may a next counter generation run as a new claim) stays open: no operator answer is recorded; this round declares C2 as a NEW capability claim with its own axis and predicate.
- No earlier round's record is edited.
