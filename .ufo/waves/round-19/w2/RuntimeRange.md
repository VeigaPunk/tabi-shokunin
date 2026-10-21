# RuntimeRange — round 19 W2 / C1 `range-color`

## Verdict and axes

**C1 family observations reproduced at R.** Two final, regular-copy family-only replays each exited **0**, with **5/5 cases passing, 0 failures, 0 findings**. Every case's input, expectation, status, error text, fields, submit count, and complete announced schema agrees with the committed receipt and both original raw probe passes. There were **0 semantic differences** and no observed behavioral/schema nondeterminism across the two final runs.

Axes: **behavior/schema fidelity**, **two-run reproducibility**, **writer/browser isolation**. This was a report-only falsification probe; no implementation, expectations, fixtures, or producer bytes were changed.

One **invocation-contract defect in the wave prompt**, not a family runtime defect, was observed: the supplied `--fixtures` flag is unsupported at R. The exact requested command exited **2**, produced no receipt, and emitted:

```text
WEBMCP_VALIDATION_ERROR {"code":"could_not_evaluate","message":"unknown argument --fixtures"}
```

The L1 clarified the supported interface. `scripts/webmcp-validation-round19.mjs:194–210` accepts `--cases`/`--out`; `:1240–1242` derives a sibling `fixtures` directory. The final runs therefore used a fresh temporary parent with **regular copies**, no symlinks: exactly `cases/range-color.json` (5,001 bytes) and `fixtures/range-color.html` (935 bytes). Two earlier passing runs using a sibling fixture-directory symlink completed before that clarification; their full commands/stdout/receipts remain in `RuntimeRange.json`, explicitly superseded and excluded from the final two-run verdict.

## Executed commands and identity

Private clone: `/fast/scratch/tabi-r19/fx-RuntimeRange`, detached at attacked checkpoint **`d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`**. Observed runtime, identical to the committed receipt: **Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0**. The absolute Node binary's directory was first in `PATH` for every invocation.

Final supported commands, each from that clone:

```text
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeRange/scripts/webmcp-validation-round19.mjs --cases /tmp/RuntimeRange-regular-pgxo0v_8/cases --out /tmp/RuntimeRange-regular-pgxo0v_8/range-color-run-1.receipt.json
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeRange/scripts/webmcp-validation-round19.mjs --cases /tmp/RuntimeRange-regular-pgxo0v_8/cases --out /tmp/RuntimeRange-regular-pgxo0v_8/range-color-run-2.receipt.json
```

Run 1 took 3.018 seconds; run 2 took 2.808 seconds. Both had empty stderr. Complete stdout, exact argv/cwd/PATH prefix, exits, and receipt SHA-256 values are retained in the JSON evidence, including the rejected original command.

## Per-case comparison

All rows below were `Completed`, with `errorText: null` in the harness observation and **one submission**. Original raw `toolResponded` events omit `errorText`; the raw summaries normalize absence to null. The independent comparison required null here even though the harness's `errorTextIncludes: null` alone does not assert absence.

| Case | Exact input | Actual/expected fields in both final runs, committed receipt, and both raw passes |
|---|---|---|
| `decl-range-color-01` | `{"range":99,"color":"#123456"}` | `{"range":"10","color":"#123456"}` |
| `decl-range-color-02` | `{"range":"not-a-number","color":"#123456"}` | `{"range":"6","color":"#123456"}` |
| `decl-range-color-03` | `{"range":4,"color":"red"}` | `{"range":"4","color":"#ff0000"}` |
| `decl-range-color-04` | `{"range":4,"color":"not-a-color"}` | `{"range":"4","color":"#000000"}` |
| `decl-range-color-05` | `{"range":4,"color":"#12GG56"}` | `{"range":"4","color":"#000000"}` |

The **complete** schema matched for all five cases, not just the assertion subsets:

```json
{"type":"object","properties":{"range":{"type":"number","minimum":0,"maximum":10,"multipleOf":2,"description":"Range"},"color":{"type":"string","format":"^#[0-9a-zA-Z]{6}$","description":"Color"}},"required":[]}
```

Comparison covered each committed `cases[].expected` against the source case's `expect` object; each replay's input against both raw `input` and `invokeTool.params.input`; the replay's parsed `toolInvoked.input`; status/error text/command error; full fields and schema; every schema assertion; submit counts; original `toolsAdded` schema; submitted fields, DOM control values and raw summaries. Both retained raw views (`raw` and flattened `passes`) are identical, and their `comparison` summaries agree. Each final replay also had no navigation violations, downloads, new Playwright artifact files, or blocked external requests.

**Expectation re-encoding:** the `range-color.json` bytes at R are identical to author commit `ccff39a822e2c493a2ab6551e401404f35aa5bb9`, read from the author's existing clone without mutation. This family needed no L1 field re-encoding. Its fixture (`fixtures/range-color.html:5–8`) has only the distinctly named `range` and `color` inputs: no checkbox/radio and no unnamed control. Checkbox string/null and empty-key conversions are therefore not exercised by this family and are not claimed verified. Here all field values are strings, and original DOM values and submitted FormData agree exactly.

The two full final receipt bodies differ only at `generatedAt` and transient frame/invocation IDs; all other paths match. Different full-body hashes are therefore not behavioral nondeterminism. Final decision-ledger entries `DV-23` and `DV-24` have their named five-case observations reproduced; no new decision or coverage credit is claimed.

## Exact retained evidence

All following paths are relative to `/home/vgpnk/Projects/shokunin/tabi-shokunin`:

| Retained artifact | SHA-256 |
|---|---|
| `.ufo/waves/round-19/w2/RuntimeRange.json` — command/exits/full stdout, raw/committed comparison, runtime, hashes, and superseded preliminary evidence | `86f7e3a47d674fbcdc9908284e377b9be597d355358c0e7021ce327860c3f513` |
| `.ufo/waves/round-19/w2/RuntimeRange.receipt.json` — complete final run 1 receipt | `45409a5e785559a45799d45e076889f38a2a5d46ec9dc0e96c2cf58a88bce04a` |
| `.ufo/waves/round-19/w2/RuntimeRange.repeat.receipt.json` — complete final run 2 receipt | `ed4465c6d32a4e97537d6bc8f8931841e838522d51991259ff47f11996bfe7ca` |

Compared immutable inputs at R:

| Repository path | SHA-256 |
|---|---|
| `scripts/webmcp-validation-round19.mjs` | `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4` |
| `corpus/evidence/round-19/validation/cases/range-color.json` | `55287213713732392ed1ad5f1c31369f138882820c3884279ad477318e546c9e` |
| `corpus/evidence/round-19/validation/fixtures/range-color.html` | `82ff414505767d3d2faf5d4a4b7069a90d351a36e70cd7659cd06d4aa2995087` |
| `corpus/evidence/round-19/validation/receipt.json` | `b7846d37b6fe296b5383462d058c6f5961c0adc70064c025d5bb82596402a09a` |
| `corpus/evidence/round-19/validation/probes/range-color.json` | `34bbea3a93b14d6755931df868a7017c2e3c7bea63a8c8042afef47bb2e91c62` |

The replay receipts bind the exact case, fixture, and producer hashes above. Their full runtime identities, including Chromium wrapper/real-executable hashes and Playwright directory, match the committed receipt.

## Risks, bounds, and blockers

- No remaining blocker to this scoped family comparison. The unsupported flag is retained as a prompt invocation defect and was resolved without producer edits.
- Findings cover these five cases, bounds/step, fixture, and pinned build only. No universal browser/input claim follows.
- Only this assigned family probe was run; no full suite, build, lint, formatter, or main integration gate ran.
- Fresh private profiles and loopback fixtures used the unchanged pipe-CDP harness. No real site, private browser profile, credentials, TCP DevTools endpoint, host configuration, or external substrate was accessed or modified.
- The harness checks cleanup before receipt emission (`scripts/webmcp-validation-round19.mjs:1227–1231,1300–1301`). Both runs reached receipt emission and exit 0. No independent post-exit PID census was performed.
- No tools were installed or updated. Temporary staging directories were removed after retaining the evidence; the private clone remains available.

## Isolation

- Clone: `/fast/scratch/tabi-r19/fx-RuntimeRange`
- Branch: detached HEAD (no production branch created)
- Base: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (falsification checkpoint R)
- Commit: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (existing; no new commit)
- Production changed paths: none; no writes inside the clone after checkout.
- Direct LANE writes only: `.ufo/waves/round-19/w2/RuntimeRange.md`, `.ufo/waves/round-19/w2/RuntimeRange.json`, `.ufo/waves/round-19/w2/RuntimeRange.receipt.json`, `.ufo/waves/round-19/w2/RuntimeRange.repeat.receipt.json`.
