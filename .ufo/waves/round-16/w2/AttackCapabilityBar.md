# AttackCapabilityBar — `webmcp-cdp-observation` against AXES §Capabilities

Seat: TabiR16.AttackCapabilityBar (critic, author-side; not non-author certification).
Snapshot attacked: `b444ca8e024f386124418169e8e400221524bba3`. Date 2026-10-20.
Bar (`/home/vgpnk/Projects/shokunin/AXES.md:57-64`): "Rows enter only through a round that
demonstrates the capability running; a capability without a passing demonstration in the
round report is pre-claiming and does not enter the table."

## Item 1 — Does a committed receipt from the committed harness show the capability running this round?

**Verdict: HOLDS (core bar), with two fixable defects (D1, D2) and one entry precondition (P1)
that are not yet satisfied at b444ca8.**

### Evidence that holds

1. Receipt producer digest = committed harness blob, at both commits.
   ```
   git show 8f7feb3:scripts/webmcp-loopback-round16.mjs | sha256sum  → 961874e4…8f2be1
   git show b444ca8:scripts/webmcp-loopback-round16.mjs | sha256sum  → 961874e4…8f2be1
   receipt.json .producerSha256                                    → 961874e4…8f2be1
   ```
   Receipt `generatedAt` is 2026-10-20T14:48:16Z. The commit `8f7feb3` is 11:54:43-03:00, which is 14:54:43Z.
   The run therefore came before the commit. The run used working-tree bytes that are identical to the committed blob,
   so the digest binds the run to the committed harness. The commit itself was not the run source.
2. Receipt verdict `pass`, 11/11. `receipt.stdout.txt`: `WEBMCP_LOOPBACK verdict=pass cases=11 passed=11 failed=0 missing=0`.
3. **Independent re-run this session at the lane root (worktree = b444ca8, harness sha 961874e4…)**:
   ```
   node scripts/webmcp-loopback-round16.mjs --out /tmp/acb-cH10/rerun.json
   → WEBMCP_LOOPBACK verdict=pass cases=11 passed=11 failed=0 missing=0 out=/tmp/acb-cH10/rerun.json   exit=0 (8.5 s)
   ```
   Field-by-field comparison with the committed receipt: producer equal and fixtures inventory equal.
   Six of the 11 cases are byte-identical after port, frameId and loader normalisation. The other five differ
   only in `eventLog[*].atMs` and `durationMs` timing values.
4. Runtime pin still matches the host: `sha256sum /usr/lib/chromium/chromium` → `95b17db7…b330a`
   and `/usr/bin/chromium` → `eaed39c3…a172b`. These equal `runtime-pin.json` and receipt `launchSha256`.
   `pacman -Q chromium` (read-only query) → `chromium 154.0.8037.97-1`.
5. The pass depends on what the browser actually does. Two mutation probes ran in my own `/tmp` copies, and the lane was not touched.
   - The fixture probe removed `toolname` from a copy of `declarative-form.html`. Command: `node scripts/webmcp-loopback-round16.mjs --fixtures /tmp/acb-mut-5tpQ/fx --out /tmp/acb-mut-5tpQ/mut.json`.
     Result: `verdict=fail passed=8 failed=3` (declarative-form-tool, navigation-clears-tools and data-url-declarative fail), exit=1.
   - The flag probe replaced the copied harness's `WEBMCP_FEATURE_ARGS` (lines 68-69) with `--no-first-run`. Command: `node /tmp/acb-mut2-7XMM/scripts/webmcp-loopback-round16.mjs --out /tmp/acb-mut2-7XMM/noflags.json`.
     Result: `verdict=fail cases=11 passed=3 failed=8`, exit=1.
6. C2 counter: `node .ufo/waves/round-16/measure.mjs b444ca8e… --claim C2` returned `"c2_webmcp_held":1, "failures":[]`, exit 0.
   The counter only checks file shape: status strings, digests, and toolsAdded for two cases. It does not execute anything.
   The demonstration of the capability running comes from item 3, not from the counter.

### D1 — `opaque-sandboxed-iframe` passes without the WebMCP feature (non-discriminating case)

- Counterexample: in the no-flags mutant (5b), `opaque-sandboxed-iframe` still reports `status: pass`.
  Its `actual.iframeReport` there is `{mcType:"undefined", regType:"undefined", error:null, settled:null}`
  and its `detail` is `opaque sandboxed iframe denied: modelContext undefined (no modelContext)`.
- Cause, in `scripts/webmcp-loopback-round16.mjs` at the pass predicate of the case (around line 1238):
  `(report.mcType !== 'object' || (report.settled !== 'resolved' && report.errorName === 'NotAllowedError'))`.
  When the API is missing, the predicate counts that as "denied".
- Impact: the committed receipt's `actual` does show the real denial (`mcType:"object"`, `regType:"function"`,
  `errorName:"NotAllowedError"`, `settled:"rejected"`). So the note's table row is supported by what was observed.
  The case's `pass` status does not show it, though. The "11/11 cases pass" figure therefore includes one case
  that would also pass with WebMCP absent. Axes affected: coverage/capability evidence strength, and calibration of
  the "11/11" wording.
- Smallest fix: require `report.mcType === 'object' && report.regType === 'function' && report.settled === 'rejected' && report.errorName === 'NotAllowedError'`.
  After that, re-run and retain the new receipt. If no new run is made, the row or report wording must say
  "11 cases pass; opaque-sandboxed-iframe's pass predicate also admits feature absence; denial is shown by its recorded `actual`".

### D2 — False provenance: "first committed-code run"

- Note line 98 says: "The first committed-code run (`receipt-first-run-failed.json`, producer digest inside it)".
- The producer digest inside that file is `cedccdf9…149779`. I hashed every blob in the `b444ca8` tree with sha256
  (`git ls-tree -r b444ca8 | … git cat-file blob | sha256sum`), and none matched (`scan-done`, no `FOUND`).
  Only one commit (`8f7feb3`) touches the harness, and its blob is `961874e4…`. The first failing run therefore
  came from harness bytes that were never committed.
- Impact: provenance and calibration. Keeping the failure is honest, but the label overstates how it is bound.
- Smallest fix: append-only correction, e.g. "first L1 run, from pre-commit harness bytes sha256 `cedccdf9…`
  (never committed); the repaired committed harness is `961874e4…`".

### P1 — Entry precondition not yet met at b444ca8 (not a defect; it governs entry)

- `SCORECARD.md` at b444ca8 has no `webmcp-cdp-observation` row. The `## Capabilities` sections are unchanged in the
  `e38d259..b444ca8` diff. Correctly, nothing has been pre-entered.
- No round-16 report is committed. `DraftReport.md` is a "SKELETON DRAFT" with
  `Capability row: PENDING(...)`, and no `corpus/lessons/round-16.md` exists
  (`git ls-tree … corpus/lessons` lists only rounds 13–15).
- AXES requires the passing demonstration to be **in the round report**. The row may enter only when the committed
  round report cites both of these:
  - the receipt with its producer digest;
  - a re-run command with its observed line, e.g. `node scripts/webmcp-loopback-round16.mjs --out /tmp/…` → `verdict=pass cases=11 passed=11`.
- Related dangling forward pointer: `corpus/QUALITY.md:83` and `:89` cite `corpus/lessons/round-16.md#mistakes`,
  which does not exist at b444ca8. Before closure, either land the lesson or keep the citation out of the delivered HEAD.

## Pre-claiming wording (what the row or report must not say)

The evidence base is the receipt plus my re-run, both on Chromium 154.0.8037.97 with flags, on loopback fixtures.

| Wording | Why it pre-claims | Evidence actually held |
|---|---|---|
| "WebMCP available/works in Chromium/Chrome", or any unflagged/default-profile phrasing | Only the flagged runs show the page API. The flag-off control shows it absent | flag-gated, 154 only |
| "invokes / executes page tools" | No receipt case calls `invokeTool`. That evidence is probe-only (`.ufo/waves/round-16/probes/`) | observation of `toolsAdded`/`toolsRemoved` only |
| "observes WebMCP tools on real sites" / "audits pages" | Loopback fixtures only, and every other request is aborted | 7 committed fixtures |
| "agent / MCP-client consumption of page tools" | Not observed (the note's Limits section says so) | none |
| "permissions-policy denial verified by the gate (11/11)" | D1: that case's pass also admits feature absence | the recorded `actual` only |
| "minimal flag `--enable-blink-features=WebMCP` exposes the CDP event stream" as receipt-held. `SKILL.md` round-16 table row 1 places this under receipt cases `flags-off-negative-control` vs `declarative-form-tool` | The receipt's flagged run uses the full flag set. The `devtools-domain-disabled` run (blink `WebMCP` only) shows `document.modelContext` present but disables the domain. The minimal-flag CDP claim is from `WebmcpProbeFlags.json`, which is probe-only | page API with the minimal flag is receipt-held; CDP stream with the minimal flag is probe-held |
| "Chromium 152 probed" / closes U3 for 152 | 152 is not run | 154 only; the note says 152 stays unprobed |
| "first committed-code run failed 3/11" | D2 | pre-commit bytes `cedccdf9…` |
| "no WebMCP token reached the flag-off browser argv" | `runs[*].pid` and `effectiveArgv` are `null` in the receipt and in my re-run | harness argument list only (the note says so) |
| Commit subject `8f7feb3` "native WebMCP loopback capability" read as table entry | AXES entry needs the round report. The commit message is not the report | P1 |

Suggested "what it can now do" line, within what the evidence holds: "Observe page-registered WebMCP tools
(declarative and imperative) and their add/remove lifecycle over CDP `WebMCP.*` on Chromium 154.0.8037.97 with
WebMCP flags, on loopback fixtures, with flag-off and domain-disabled controls." Evidence pointer: the
`node scripts/webmcp-loopback-round16.mjs --out /tmp/…` command, `corpus/evidence/round-16/webmcp/receipt.json`
(producer `961874e4…`), and the note. First-working round: 16, conditional on P1.

## Impacted axes

coverage (C2 evidence strength: D1), calibration (wording: D1, D2, the pre-claim table), capability-table entry
(P1). These are all fixable defects. None is a tradeoff the judge must reject. The core bar (a committed receipt
from the committed harness, running this round and re-run independently) holds.

## Tooling

No installs or updates. No pacman transaction. The only pacman call was the read-only `pacman -Q chromium`.
Temp dirs: `/tmp/acb-cH10`, `/tmp/acb-mut-5tpQ`, `/tmp/acb-mut2-7XMM`. No lane file was modified except this report.
