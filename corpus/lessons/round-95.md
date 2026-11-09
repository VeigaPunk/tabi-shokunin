# tabi — round 95

L1 `TabiR95`. Base `7b3912bb` (lane tip at round start; round 94 closed `ok`, admitted). ONE claim —
C1 coverage, the new capability `chromium-oopif-backendnode-misdelivery-linux` (a cross-site iframe
chooser's `backendNodeId` B sent on the PAGE session acts on whatever node the parent renderer holds at
id B — including one of the parent's own file inputs, which a page-session `DOM.setFileInputFiles`
then fills with no error) — worded as the conjunction of its counter's checks, frozen with its controls
in commit `1ecbca38` (`claims.json.frozenAt` 22:59:07 -03:00) before the scored run (`360d7cc9`) and
before the wave `.ready` was written (23:02:12).

## Gate

### Sources — opened this round

- **S235** (admit, tier A, `mined`) — Blink `third_party/blink/renderer/core/html/forms/file_input_type.cc`
  at tag 155.0.8059.84,
  https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.84/third_party/blink/renderer/core/html/forms/file_input_type.cc
  (accessed 2026-11-08 22:52 -03:00 by the L1, gitiles `?format=TEXT` base64-decoded; 31,220 B base64 →
  23,415 B, sha256 `f96265db986a`, staged in the freeze commit as
  `.ufo/waves/round-95/sources/file_input_type.cc` with `sha256.txt`). Lines 396-397 and 402:
  "button->setAttribute(html_names::kIdAttr, shadow_element_names::kIdFileUploadButton);" …
  "GetElement().UserAgentShadowRoot()->AppendChild(span);" (3 words by `wc -w` over both quoted
  statements). It teaches why each parent file input brings several numbered nodes (the input, its UA
  shadow root, an `INPUT type=button id=file-upload-button`, a span and the button's text), which is why
  the pre-freeze probes saw consecutive file inputs 4 ids apart and B landing on the shadow button.
- **Reject (not a row)** — Blink `inspector_dom_agent.cc` re-fetched at the same tag to locate the two
  error strings (lines 648 and 1809): already registered as S231 (r93); a second row would duplicate it.
  Flip: none needed — S231 is cited.

Status/recheck/used-by changes: S235 is a new row (none → `mined`, 90d, used-by the r95 note). No
existing row is edited (append-only). Search-log entry appended (`corpus/SOURCES.md`, round-95 line).

Assimilation: none (no `merge/tabi/` theme taken this round). considerthese: no `considerthese/`
directory in this lane.

## Mistakes

1. **Class: a scored record that cites a receipt whose bytes were never committed** (r94 spot-check §8
   item 3 / D2). Evidence: `.ufo/waves/round-94/scored/c1-live-final.json` names `receiptSha256
   acb87e1d…` at a `/fast/scratch` path; no committed lane blob has that sha256. Captured-by: none — r94
   committed the SCORED run's receipt (the spot-check could match it) but no gate tied every scored
   output to a committed receipt, so the tip re-run slipped. Fix: `scripts/check-scored-receipts-round95.mjs`
   reads every `.ufo/waves/round-<N>/scored/*.json` that carries `receiptSha256` at a revision and
   requires a committed blob with that sha256 under `corpus/evidence/` or the round's wave dir.
   **Shown able to fail:** on round 94 at master it exits 1 with exactly one finding
   (`receipt-uncommitted`, `.ufo/waves/round-94/scored/c1-live-final.json`); on round 95 it exits 0
   (`.ufo/waves/round-95/mined/scored-receipts-r94.json`, `-r95.json`, `rc.txt`). It runs again at the
   round-95 tip (`scored/scored-receipts-tip.json`).
2. **Class: a fixture port range chosen without checking which ranges sibling lanes use.** Evidence: the
   L1's first pre-freeze probe of the r95 driver on ports 29521-29523 refused with `free-port precheck:
   port 29521 busy` (rc 2) — another lane's seat held it at that moment (`ss -ltnp` a minute later showed
   29541 held by a python3 process). Captured-by: the driver's own free-port precheck (r93/r94), which
   turned the collision into a `setup` refusal instead of a mixed receipt — the gate worked. Fix: the r95
   wave contract assigns every seat its own port triple in 32011-32056, disjoint from the L1's
   31951-31993 ranges, and the probe was re-run on 31951-31953 (rc 0).
3. **Class: a frozen claim whose wording leans on its instrument's trust boundary without naming it.**
   Evidence: R95Critic1 (driver-only clauses, `--receipt` gaps) and R95Sentinel (same-UID substitution
   of a `--live` receipt) both returned `falsifies-wording`; the plan's limit 6 named only `--receipt`
   mode although the r94 F1 narrowing (nonce via environment) left the `--live` path substitutable.
   Captured-by: addendum §8 pre-file ledger (it surfaced both before filing). Fix: `plans/round-95.md`
   §Post-wave amendment A1 items 1-6 narrow the wording to what the instrument enforces; the r96 plan must
   state, before the freeze, which clauses are driver-byte-enforced and the `--live` trust model.
   Shown able to fail: the ledger rows for R95Critic1/R95Sentinel carry `falsifies-wording` and the gate
   refuses a `falsifies-wording` row without a narrowing pointer.

## Wave w1 (12 seats; every seat filed; artifacts in `.ufo/waves/round-95/w1/`)

executor ×3 (R95Exec1 2 cold `--live` clean + battery 77/77; R95Exec2 `--reps 10` clean 1085 checks,
misdelivery 9/40 P legs, default clean; R95Exec3 record gates clean), mutation-tester (R95Mut 45/63 killed,
17 receipt-mode survivors routed), critic ×3 (R95Critic1 wording map → amendment A1 1-5; R95Critic2
procedure variants, law holds off-qs; R95Critic3 Puppeteer 25.16.0 misses OOPIF choosers entirely —
lead), reviewer (freeze → scored → wave ordering, pins, legs), sentinel (setup controls; `--live`
substitution → amendment A1 item 6; unwritable scratch rc 1 routed), scout (S235 byte-identical; three
candidate rows as leads), scribe (note draft, cross-checked), connector (7 own-lane statements corrected).

## Leads (not rows this round)

R95Scout candidates: Blink `inspector_dom_agent.cc` pierce/UA-shadow lines (already S231), `html_input_element.cc`
@155.0.8059.84, devtools-protocol `DOM.pdl` at v0.0.1734725 — open and gate in r96 if a claim rests on them.
R95Critic3: Puppeteer `Page.ts` binds `Page.fileChooserOpened` to the primary target session only.
