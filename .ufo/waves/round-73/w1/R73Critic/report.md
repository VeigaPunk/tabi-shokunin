FALSIFIED

# R73Critic — attack on `.ufo/waves/round-73/claims.json` (C1, `chromium-synth-pinch-gesture-linux`)

Scope of the verdict: the **limit sentence** (`claims.json:42`) and the evidentiary strength it implies
for predicate legs (a) and (b) (`claims.json:33`). Everything else the frozen claim asserts — the
instruments, the battery, the kill power, the source chain, the coverage naming — reproduces exactly as
declared. Nothing here says the committed (a) receipt is forged: it is a distinct, post-D run
(timeline `cb3cbaf2…` vs r72's `6565f52f…`; fixture sha `875ef7d7…` vs `fc5cd2d7…`; `startedAt`
2026-11-07T01:18:28.926Z = 22:18:28.9 -03:00, 6.9 s after D at 22:18:22). The defect is the guard,
not the observed run.

All commands and exits: `w1/R73Critic/runs.txt`. Instrument digests re-measured against `freeze.txt`
(all five equal, exit 0).

## 1. Can a look-alike producer meet legs (a)–(c)? Yes — with last round's receipt, four fields edited

| forgery | base | edits | counter (frozen pin, nonce, PRE) | file |
|---|---|---|---|---|
| F1 | `controls/c1/smoke1.receipt.json`, verbatim | none | exit 1: `nonce-expected` + 3 replay ids | `replay-zeroedit-smoke1.json` |
| F2 | smoke1 | nonce + both wall-clock stamps +1 h | exit 1: the 3 replay ids exactly | `forge-nonce-stamps.json.out` |
| F3 | smoke1 | nonce + launch token + DevTools id + **every** event ts | exit 0, clean 98 | `forge-smoke1-launder.json` |
| **F4** | **`corpus/evidence/round72/…/receipt.json` (r72 scored)** | **schema, nonce, nonceOnPage, driverSha256 + the nonce string; launch token `4da82a8d0e77`, DevTools browser id and every `ts`/`at` KEPT** | **exit 0, clean 98** | `forge-r72-relabel.json` |
| **F5** | **`.ufo/waves/round-72/controls/c1/smoke1.receipt.json`** | **same four fields, nonce `tabi-r73-exec1-3409ab53b905`, priors = PRE + the (a) receipt (13)** | **exit 0, clean 98** | `forge-legb-receipt.json` |
| F6 | r72 scored receipt, unmodified (the claim's control) | none | exit 1: `schema,nonce-shape,nonce-expected,driver-pin` | `r72-unmodified.json` |

F4 and F5 are rebuilt from committed bytes by `w1/R73Critic/forge-build.mjs`; re-scored at exit 0,
98 checks each.

**F4/F5 are outside the declared limit.** `claims.json:42` prices the escape as "rewrites the nonce,
the launch token, the DevTools browser id everywhere it occurs and every event time of a prior
receipt". F4 rewrites only the nonce; the launch token, the DevTools browser id and all 573 event
timestamps are byte-identical to a pre-freeze receipt of the previous generation. F5 does the same for
leg (b), scored with (a) as the 13th prior. So predicate (a) **and** (b) are satisfiable end to end
with zero r73 execution, while the claim's stated threshold is a full timeline re-author.

**The counter's logic is not at fault — the prior set is.** F4' scores the same forged receipt with the
r72 scored receipt added as one extra `--prior`: exit 1, exactly `replay-launch-token`,
`replay-devtools-url`, `replay-event-timeline` (`forge-r72-relabel-plus-r72prior.json`). The r73
replay checks would have bitten; the 12 PRE receipts simply do not contain the generation a forger
would copy from.

The r73 driver is the r72 driver with 15 changed lines (schema, nonce prefix, fixture title, header —
the header says so itself), and the r73 counter is r72 plus four checks (94 → 98: `nonce-expected` and
the three replay ids). The previous generation's receipt is therefore not merely "a" forge base; it is
the *shape-identical* one.

## 2. Is the limit sentence complete and honest? Honest in what it says, incomplete in what it omits

What the counter actually reads (`scripts/check-synthpinch-r73.mjs`): the receipt JSON; `--expect-driver-sha256`
compared to a receipt field only (line 138); `--expect-nonce` (line 133); and, from each `--prior`, only
`host.launchToken`, `host.devtoolsListening.url` and `hash([e.ts,e.at])` (lines 144–152). It never opens
the driver file, never reads any receipt that is not a `--prior`, and never sees process evidence.
"Not an execution oracle" (line 38, `claims.json:42`) is accurate and sufficient as a blanket statement.

Incomplete, concretely:

- The guard is **prior-list membership**, not receipt identity. The limit never says that every receipt
  outside the 12 PRE — the whole round-72 evidence and control set, the round-71 set, anything on disk —
  is a free forge base requiring **no** identifier rewrite. F4/F5 make that difference measurable.
- `doNothingControl` (`claims.json:34`) lists `r72 scored receipt -> exit 1 schema/nonce-shape/nonce-expected/driver-pin`
  as the do-nothing control. It is true of the byte-identical file and false of the file four fields
  away. A control that is green only on the exactly-unmodified artefact does not bound the look-alike
  class it is quoted for.
- `driver-pin` (line 138) compares the receipt's own `driverSha256` string. `--expect-driver-sha256`
  binds the receipt's claim to the pinned driver, not the driver bytes. Not stated in the limit.
- `host-chromium` (line 140) accepts `Chromium \d+.\d+.\d+.\d+` — any version, though the capability is
  named "Chromium 155". Not stated.

## 3. Coverage naming and the `sourced` field: both true

- **Named by the surface it moves.** `grep -c '^| `chromium-synth-pinch-gesture-linux` |' SCORECARD.md`
  = 0 at base `d7ff9f19` and 0 at tip `c44fcf6`; no other row covers `Input.synthesizePinchGesture`
  (5 rows, 4 distinct capabilities: `chromium-wheel-scroll-domain-linux` twice, `chromium-hscroll-domain-linux`,
  `chromium-synth-scroll-gesture-linux`, `chromium-synth-tap-gesture-linux`);
  no row reads the visual-viewport page scale. Real coverage move.
- **`sourced` is true as written.** `sha256sum` of the four staged files equals the digests in
  `corpus/SOURCES.md:194-197` (`146aa4c1…`, `31a6868e…`, `c00b3bf7…`, `5f43b8a5…`). The quoted lines
  are verbatim: `local_frame_view.cc:1994-1998` (`InputEventsScaleFactor = GetVisualViewport().Scale() * InputEventsScaleForEmulation()`),
  `web_input_event_conversion.cc:56-65,127-134` (`FrameScale` → `SetFrameScale`),
  `web_mouse_wheel_event.cc:103-105` (`delta_y / frame_scale_`), `wheel_event.cc:110-111`
  (`-event.DeltaYInRootFrame() / window.devicePixelRatio()`).
- The chain grounds `deltaY = −delta_y / (pageScale · emuScale · dpr)`; the law `Σ deltaY·pageScale = −100 ln(s)`
  follows from S179 **given emuScale·dpr = 1**. The remaining inference (`InputEventsScaleForEmulation()`
  = 1) is declared at `claims.json:42` and in the note ("**Still inference:** that
  `InputEventsScaleForEmulation()` is 1 on this host"). `dpr = 1` is a stated condition of the
  demonstration ("deviceScaleFactor 1") and `Emulation.setDeviceMetricsOverride` is pinned to
  `deviceScaleFactor: 1` by the send-log allowlist (line 191). No undeclared link.
- Law re-measured on the scored receipt: `in` −69.31476, `out` +69.31472, `clamp` +69.31471,
  `default` −40.54648; deviation ≤ 4.3e-5 against the ±0.5 bound.

## 4. Is anything in the predicate satisfiable without the round's work? Yes — (a) and (b); (c) rides on (a)

F4 satisfies (a) (exit 0, clean 98, frozen pin, frozen nonce, 12 PRE priors) from a pre-freeze r72
receipt. F5 satisfies (b)'s exact command shape (13 priors) from a pre-freeze r72 control receipt.
(c) is a function of the (a) receipt and holds whatever produced it — reproduced here at exit 0 with
`allOk true`, 228/228 cases, coverage gap `[]`, and kill power `holds true` (98/98 force-true, 19/19
semantic, unmutated exit 0). (d) is unlanded at the tip (row count 0), so the predicate is not yet
satisfied — the declared build order, not a defect.

What is *not* satisfiable without the round's work: the instruments, the battery cases, the kill-power
mutants, the S180–S183 sourcing, and the knowledge note. The round's work is real; what the predicate
does not establish is that the round's *execution* happened.

## Impacted axes

- **coverage** (the claimed axis): the capability and its row move coverage and the surface statement is
  grounded; the *evidentiary* leg for (a)/(b) is weaker than the claim conveys.
- **calibration**: the declared limit is the calibration artefact here, and it prices the forgery wrong
  by three identifiers and 573 timestamps.

## Smallest safe correction (for a later generation; nothing frozen is amended here)

1. Prior set = every synthpinch receipt in the tree, at minimum the previous generation's scored and
   executor receipts. Demonstrated sufficient: F4' fires all three replay ids on the same forged
   receipt that passes against PRE.
2. Restate the limit as: *the guard is the `--prior` list; any receipt outside it — including every
   receipt of the previous generation — is a valid forge base with no identifier rewrite; the only
   binding evidence of execution is the L1's and the executor's own process record.*
3. Run the do-nothing control on the cheapest edited form (a relabelled prior-generation receipt), not
   only on the byte-identical file.

## Verified and not falsified

Leg (a) reproduced exit 0 / 98 checks; battery reproduced exit 0, 228/228, gap `[]`; kill power
reproduced exit 0, holds true; F1/F2/F6 reproduce the declared refusals exactly; the source digests and
excerpts are exact; the coverage naming is true; no pinned instrument byte changed (all five digests
equal `freeze.txt`).
