# RuntimeEmailUrl — round 19 W2 falsification

## Verdict and axes

**Behavioral claim not falsified for this family.** At attacked checkpoint `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`, both primary, regular-copy replays returned **exit 0, 4/4 cases passed, 0 findings**. Every requested semantic dimension matched the committed family receipt and both original raw-probe repetitions. **No semantic nondeterminism was observed across the two primary runs**; this is a bounded observation, not a universal guarantee.

Axes: **depth** (native email/URL validation versus emitted schema), **fidelity** (input/expectation/raw/receipt agreement), **reproducibility** (two fresh family-only runs), and **isolation** (unchanged producer, regular copies, loopback fixtures, no production writes).

A separate **invocation-contract defect** was observed: the originally assigned `--fixtures` flag is unsupported at R. The exact command exited 2 before browser execution, emitted no stdout or receipt, and stderr identified `unknown argument --fixtures`. L1 confirmed the assignment-argv defect and authorized the supported sibling-copy layout. No harness patch was made.

## Execution and layout

- Node: `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`; PATH began with its installation bin directory; process-local `TMPDIR=/tmp`.
- Runtime observed in both receipts: **Chromium 154.0.8037.97 / Playwright 1.64.0 / Node 24.21.0**. The entire runtime object, including launcher/real executable digests, equaled the committed receipt.
- Fresh isolated checkout: `/fast/scratch/tabi-r19/fx-RuntimeEmailUrl`, detached at R. Initial lane `refs/heads/master` also resolved to R.
- Primary temporary parent: `/fast/scratch/tabi-r19/fx-RuntimeEmailUrl-copies-nceqke2c`. Its `cases/` contains only the regular byte copy `email-url.json`; sibling `fixtures/` contains only the regular byte copy `email-url.html`. Neither files nor directories are symlinks. Copy digests equal committed input digests.
- Two earlier supplemental runs used a sibling fixture-directory link, before L1's regular-copy clarification. Their commands, exit codes, stdout and exact receipts are retained, but **they are not primary acceptance evidence**. That linked temporary parent was removed after evidence retention.

Supported primary commands (same unchanged producer; distinct fresh output paths outside both clone and LANE):

```text
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeEmailUrl/scripts/webmcp-validation-round19.mjs --cases /fast/scratch/tabi-r19/fx-RuntimeEmailUrl-copies-nceqke2c/cases --out /fast/scratch/tabi-r19/fx-RuntimeEmailUrl-copies-nceqke2c/run1.receipt.json
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /fast/scratch/tabi-r19/fx-RuntimeEmailUrl/scripts/webmcp-validation-round19.mjs --cases /fast/scratch/tabi-r19/fx-RuntimeEmailUrl-copies-nceqke2c/cases --out /fast/scratch/tabi-r19/fx-RuntimeEmailUrl-copies-nceqke2c/run2.receipt.json
```

| Primary run | Exit | Cases / passed / failed / findings | Elapsed seconds | Receipt SHA-256 |
|---|---:|---|---:|---|
| 1 | 0 | 4 / 4 / 0 / 0 | 2.41 | `bf6b00325ed36bb9f33df956b39e2b848897f932bfa3cb0c6d8d43e8c88d69f2` |
| 2 | 0 | 4 / 4 / 0 / 0 | 2.231 | `3e22b636ed5a5cbbd7e6d7138c77d6d001107f6f9d1b1ed5a2bcd25468dcc1c2` |

Both full stdout streams contain four `WEBMCP_VALIDATION_CASE ... pass=true` lines and the family summary. They, both empty stderr streams, exact argv, cwd, environment overrides and start timestamps are retained in `RuntimeEmailUrl.json`. The exact rejected command and its full stderr are retained there too.

The CLI behavior is grounded in `scripts/webmcp-validation-round19.mjs:194-207` (accepted arguments) and `1240-1242` (fixtures inferred from the cases directory's sibling). Receipt production follows cleanup assertions at `1227-1231` and `1300-1302`; all started Node processes completed. No independent process-census claim is made. No background job or service was started outside the harness.

## Per-case findings

The observations below agreed in both primary runs, the committed receipt, and raw probe runs 1 and 2. Full exact error strings, including trailing spaces, are retained in the JSON and receipts rather than shortened for comparison.

| Case | Input email | Input URL | Status / exact error agreement | Submit count | Post-invoke fields |
|---|---|---|---|---:|---|
| `decl-email-url-01` | `not-an-email` | `https://valid.example.test/` | `Error`; exact malformed-email error matches | 0 | Both input strings retained |
| `decl-email-url-02` | `person@example.test` | `https://valid.example.test/` | `Completed`; `errorText=null` | 1 | Both input strings retained |
| `decl-email-url-03` | `person@example.test` | `not-a-url` | `Error`; exact malformed-URL error matches | 0 | Both input strings retained |
| `decl-email-url-04` | `person@example.test` | `https://valid.example.test/` | `Completed`; `errorText=null` | 1 | Both input strings retained |

All four toolsAdded schemas were exactly equal, not merely equal at expected dot paths:

```json
{"type":"object","properties":{"email":{"type":"string","description":"Email"},"url":{"type":"string","description":"URL"}},"required":[]}
```

Thus the schema has no email/URL `format` annotation while malformed strings still fail before submit. There are four case IDs but only three distinct input maps: cases 02 and 04 are the identical successful control for the two malformed-input decisions. This audit does not treat their duplicated input as a fourth distinct behavioral decision.

### Comparison depth

`RuntimeEmailUrl.json` retains each case's input, entire `expect`, both observations and an explicit boolean comparison matrix. Independently of the harness's `pass` flag, the audit compared:

- Case ID population, input and full expectation objects against both source cases and the committed receipt.
- Exact status, **full** errorText (including `null` for successes), entire fields map/key inventory, submit count and **full** schema against the committed receipt.
- Both original raw runs for each case: invokeTool input from the recorded outgoing CDP command; toolResponded status/error/output; tool inputSchema and raw toolsAdded schema; state and normalized fields/count; raw control `.value` inventory; and original submit call fields.
- Fresh CDP toolInvoked input parsed back to JSON, tool name, commandError and toolResponded output against their originals. Dynamic invocation/frame IDs were excluded, not behavioral values.
- Safety arrays: no navigation violation, download, new Playwright artifact file, or blocked external request in either primary receipt.

Totals: **4 cases, 8 primary case executions, 8 original raw rows, 16 replay-to-raw row comparisons, 0 mismatched cases**. The selected semantic record lists have equal SHA-256 `d360cb98212e992f6e6bc4cb2e07bc924fc6d739119554a08c7e70b716862d2b`. Raw receipt hashes differ because their generated timestamps and dynamic CDP IDs differ; this is not a semantic discrepancy.

### L1 field re-encoding check

No family-specific re-encoding was needed: every observed field map is exactly `{"email": <string>, "url": <string>}`, including malformed values. It exactly equals `expect.fields`, committed `observed.fields`, raw `state.fields`, raw `normalized.fields`, and raw control values. The full key set was compared, avoiding the harness's expected-subset comparison shortcut (`1043-1059`). Success `errorText=null` was also independently enforced although the harness only checks non-null substrings.

This fixture has **no checkbox/radio and no unnamed data control** (`fixtures/email-url.html:5-8`). Its unnamed submit button is correctly absent from the field map. Checkbox strings/null and the unnamed-control empty-string key are therefore **not exercised or generalized by this family**; the relevant harness representation is at `856-891`.

## Exact retained evidence

All paths below are relative to the lane, under `.ufo/waves/round-19/w2/`:

- `RuntimeEmailUrl.md` — this scoped report.
- `RuntimeEmailUrl.json` — complete command/exit/stdout/stderr record, source digests, source case document, committed family receipt, runtime identity and every comparison check.
- `RuntimeEmailUrl.receipt.json` — byte-exact primary run 1 receipt, SHA-256 `bf6b00325ed36bb9f33df956b39e2b848897f932bfa3cb0c6d8d43e8c88d69f2`.
- `RuntimeEmailUrl.run2.receipt.json` — byte-exact primary run 2 receipt, SHA-256 `3e22b636ed5a5cbbd7e6d7138c77d6d001107f6f9d1b1ed5a2bcd25468dcc1c2`.
- `RuntimeEmailUrl.linked1.receipt.json` — supplemental prior linked-layout run, SHA-256 `086d82788fc5d4a438c3410add4ee00567d21fab8ef4e52c69cdfb733ba22826`.
- `RuntimeEmailUrl.linked2.receipt.json` — supplemental prior linked-layout run, SHA-256 `c87f10f42985c5952d57832c9d09a536feb0c3ae156847fa216bf0860897f7ec`.

At R, relative to the checkout:

| Input | SHA-256 |
|---|---|
| `scripts/webmcp-validation-round19.mjs` | `4a1de295d6f7f7389395c86a28f23ea27fe6ebc2b6194a93d66567b0bab101a4` |
| `corpus/evidence/round-19/validation/cases/email-url.json` | `be690c81d578d6ae6cd2425bd47867883dd6f60718436c9813d3f0b3adcb1bcc` |
| `corpus/evidence/round-19/validation/fixtures/email-url.html` | `d59eab89819a8c14b1bc32aaf3d553a6ca0927e19a3e5aa457c45e078ad79bb3` |
| `corpus/evidence/round-19/validation/probes/email-url.json` | `b5967adc3283942a6661ee56e9bd2abe0e20063643293255b184b1919edf08ef` |
| `corpus/evidence/round-19/validation/receipt.json` | `b7846d37b6fe296b5383462d058c6f5961c0adc70064c025d5bb82596402a09a` |

Raw probe mapping: IDs 01/02/03/04 correspond to `email-malformed` / `email-valid` / `url-malformed` / `url-valid`, each with `.run` 1 and 2. The raw stability record is at `probes/email-url.json:2446-2462`; the actual raw rows, rather than only that stability assertion, were compared. Original valid submit calls recorded both agentInvoked and isTrusted true; fresh harness receipts retain only submit count, not those flags or native validity states. Those unretained facets were **not independently re-observed** in this replay.

## Risks, blockers and scope

- The unsupported assigned flag is a retained invocation-contract defect, not a browser decision failure. Supported execution is complete; no remaining blocker for this family.
- Findings cover only the four assigned email/URL cases and two primary repetitions. Other validation families, C2/C3 and global gate outcomes are intentionally unassessed.
- No production edit, commit, build, lint, formatter or full-suite run was performed. Parent owns integration gates.
- No tool installation/update, host mutation, real-site invocation, TCP DevTools endpoint or real browser-profile read occurred. LSP is not exposed in this leaf's mounted tool inventory; no source or symbol edit was required.
- A read-tool newline-framing discrepancy was reported through `xd://report_issue`; receipt retention restored terminal LF only when necessary to match the observed original `sha256sum` digest. All four retained receipt byte strings matched their original hashes before writing.

## Isolation

- Clone: `/fast/scratch/tabi-r19/fx-RuntimeEmailUrl`.
- Branch: detached HEAD (falsification sandbox; no production branch created).
- Base: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47` (R); historical claim baseline B is `66251bfc1aef393e4aec599e950a8deb867736bb`.
- Commit: `d5cf4d726c52c02b65c0a25a5aa3f49bd3e73e47`; no new commit created.
- Changed production paths: **none**. No LANE git-write command executed.
- Only LANE writes: the six seat-owned advisory artifacts listed above. Primary regular-copy scratch inputs/receipts remain at `/fast/scratch/tabi-r19/fx-RuntimeEmailUrl-copies-nceqke2c` as evidence; the obsolete linked-layout scratch parent was removed.
