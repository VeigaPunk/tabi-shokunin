# FixtureAutoInvalid — served fixture and provenance attack, `auto-invalid` only

Seat: TabiR21.FixtureAutoInvalid (scout, author-side lane seat, not independent admission).
Read-only. No browser, gate, counter, selftest, build or test was executed. Only computation run:
one in-memory rebuild of the fixture string from the producer's `fixture()` source, plus hashing, `jq` projections, and read-only `git ls-tree`, `git status` and `git hash-object`.
Tooling: nothing installed or updated.

## Bottom line

The retained `auto-invalid` bytes are internally consistent and match what the producer code would generate. The browser-side transcript independently witnesses autosubmit presence, the email-validation refusal, and the absence of a submit event. Two problems sit outside the bytes themselves:

1. **F1 (gate depth).** The counter accepts an `auto-invalid` case with zero responses. The committed synthetic positive control is exactly such a case, and it is scored as clean. So the note's row claim ("Error, native email validation text; no submit event") is not gated by `c1_lifecycle_observations`.
2. **F2 (provenance at HEAD).** At HEAD `1b5f449`, the producer `scripts/webmcp-lifecycle-round21.mjs` is untracked. The revision-bound counter reads git blobs only, so by static reading it cannot verify `producer_digest` at that commit.

## Observed facts (anchors)

| Fact | Anchor |
|---|---|
| Fixture sha256 `cf67300555e434f2a47d800849bfeb6e62981ad4472e692fba129bc731f96b8a`, 1108 bytes, ends `</script>` with no trailing newline | `runtime/auto-invalid.html`; `auto-invalid.json` `.fixture.sha256` |
| Evidence sha256 `c70c2aab6f8400c76e43e2cb2d5c4878874eb32108be8f8794c5bdb1aab16095`, equal to `receipt.json` case `.evidence.sha256` | `receipt.json` cases[11] |
| Producer sha256 `5363d576f52e72dc4e82d5838706aa307f371648e73242eed99e9776f06eceb9` matches `receipt.producer.sha256` and `runtime-execution-bounded.json.producerSha256` | working tree |
| Committed blobs for `auto-invalid.html` and `.json` (`035797d6…` and `2981bf0d…`) equal the working-tree `hash-object` output | `git ls-tree HEAD` |
| Rebuilding `fixture('auto-invalid','b2c990a6-…',true,'invalid')` from producer L105-123 gives byte-identical output (same sha, `Buffer.equals` true) | producer L105-123 |
| Nonce `b2c990a6-45dc-4bc1-bab8-70f4f1e33ea3` appears twice in the HTML: `window.observations.nonce` (L5) and the never-sent response `value` (L12) | html L5, L12 |
| Per-run nonce rotates across runs: v1 `112241eb…`, v2 `c72fed4a…`, v3 `cf498362…`, current `b2c990a6…` | `history/runtime-v*/auto-invalid.html` |
| `toolautosubmit` sits in the `<form>` tag; rebuilding with `autosubmit=false` removes it (leaves a double space). The counter regex gives true and false respectively | html L2; producer L107; measure L76 |
| Browser-side witness: `toolsAdded.annotations = {"autosubmit":true}` for auto-*; `null` for `na-pending` and `na-click` | json seq5; `na-*.json` |
| The input schema reports `q:{type:string}` and `required:[q]`; it does not expose `type=email` | json seq5 |
| The invoke input is the constant `{"q":"not-an-email"}` and carries **no nonce**. The `toolInvoked` input string matches it | json seq9, seq11; producer L202 |
| Correlation keys: invocationId `44FE24D2…` is the same in the result (seq10), `toolInvoked` (seq11) and `toolResponded` (seq12). frameId `B1FC6BBB…` is the same in `frameNavigated`, `toolsAdded`, `getFrameTree` and the sent params. The port is 35363 throughout | json seq3-12 |
| Response arrives 2 ms after the invoke result and before the pre-action observation: `Error`, `"Form validation failed: q: Please include an '@' … 'not-an-email' is missing an '@'.. "`. `preAction.responseCount=1`, `windowMs=254` | json seq12-13; receipt |
| Page echo: both observations show `nonce == case nonce`, `submits: []`, `errors: []`, `value: "not-an-email"`, `formActive: false`, same URL, no navigation | json seq13, seq16 |
| Action mechanism: `action:"none"`. The producer sets `pendingAction = Promise.resolve()` and records synthetic `action` (`phase:"no-action"`, seq14) and `action-complete` (seq15) frames with no browser interaction | producer L218-221 |
| Server log: exactly one GET `/auto-invalid` (at 033277, before `frameNavigated` at 033280). No `/landing` request in this case; the only `/landing` belongs to `na-native-submit` (nonce `de22b3e0…`) | `receipt.requests` |
| Cleanup: 9 PIDs with start ticks at launch, the same 9 at close, `browserPidsSeenAfterClose: []`, `browserPidsAfter: []`, `contextClosed: true`. No `closeError` key and no `forcedCleanup` key | json L263-366 |
| Repeated-run consistency: v1, v2 and v3 `auto-invalid` (different, historical producers) also recorded a single `Error` status | `history/runtime-v{1,2,3}` |

## Findings (one attack each)

### F1 — Gate accepts an `auto-invalid` case with no response (high confidence, static reading)
- Attack: replace the real case with one that has zero `toolResponded` frames and `responses: []`.
- `fixtures/positive-ordered.json` already does this for `auto-invalid`: `responseCount:0`, `responses:[]`, no `toolsAdded`. `expected.json` `positive` expects exit 0, value 12.
- `measure-c1.mjs` L63-99 has no per-case status or response-presence oracle. `event_identity` (L85-87) only requires responses (zero is fine) to follow `toolInvoked`.
- Consequence: a run in which `auto-invalid` returned `Completed` (validation bypassed) or never responded would still count toward 12. The note's row (L42) and the decision-rule bullet "do not collapse … native validity failure" rest on semantic review, not on the counter.
- Bound: this matches the "not 12 novel branches / not coverage" framing, and the note L11-12 says as much.

### F2 — Producer absent from the measured revision (high confidence, observed git state at about 13:22 UTC)
- `git status`: `?? scripts/webmcp-lifecycle-round21.mjs`. `git ls-tree -r HEAD` contains nothing under `scripts/`, and `check-ignore` reports the file is not ignored.
- HEAD `1b5f449` ("record finite non-autosubmit lifecycle evidence") commits the runtime, note, counter and fixtures without the producer.
- `filesAt()` (measure L104-111) reads only `ls-tree` blobs, so `get(PRODUCER)` is null and L47 adds `producer_digest`. [INFERENCE] `measure-c1.mjs 1b5f449…` therefore cannot count 12. Not executed, per bounds.
- `runtime-execution-bounded.json` records `measuredRevision: "uncommitted"`. The fixture-to-producer equivalence I showed holds only against the working-tree producer.

### F3 — Page-echo nonce is not gated (high confidence, static)
- Attack: rewrite `value.nonce` consistently in both observation frames, `pageObservations` and `receipt.after.pageState`, then recompute the evidence sha.
- The only nonce checks are measure L65-66 (case nonce shape/reuse), L73 (evidence equals receipt), L75 (HTML contains the nonce) and L81 (input). Nothing ties observation `value.nonce` to `c.nonce`.
- For `auto-invalid`, the input is the constant `not-an-email` (L81 invalid branch) and the handler never echoes. So the page echo is the **only** run-nonce witness from the browser side, and it is unchecked. Response-to-run binding relies on the invocationId and frameId alone.

### F4 — Handler `preventDefault`/`respondWith` ordering is unexercised in this case (high confidence, observed)
- Attack: claim the ordering for `auto-invalid`. `submits:[]` and `errors:[]` in both observations mean the listener (html L7-16) never ran. Native validity blocked before any submit event.
- Contrast: `auto-positive` recorded `submits[0] = {agentInvoked:true, isTrusted:true, active:true, respondWith:"function"}`.
- [INFERENCE] The listener was registered: `observations` exists and no script error was captured, even though the error listener (L6) was installed before `f.addEventListener` (L7).
- The fixture's `mode:"invalid"` falls into the `else e.respondWith(Promise.resolve(value))` branch (L15). That branch is dead for this case, so the ordering is a source fact only. The note row says "no submit event" correctly and makes no ordering claim.

### F5 — Served bytes are bound by construction, not by capture (medium, structural limit)
- The same JS string `html` is written to disk (producer L157) and served (L158, L140-142). Both use UTF-8 string encoding, and `sha(html)` hashes the same string (L160). No browser-side response-body capture exists: no `Network` domain and no `response.body()`.
- Attributes with a browser-side witness:
  - `toolname` and `tooldescription`: `toolsAdded`
  - `toolautosubmit`: `annotations.autosubmit`
  - `required` and the label "Dummy": `inputSchema`
  - `type=email`: the email-specific `errorText`
  - the nonce and observations object: page echo
- Attributes without a witness: `action="/landing" method="get"` (no navigation occurred), and the listener body.
- The counter checks the HTML hash, nonce substring and autosubmit regex. It never rebuilds bytes from the producer and never cross-checks `annotations.autosubmit` against `c.autosubmit`.

### F6 — Autosubmit regex is lexical (low, theoretical)
- The measure L77 regex `(?:\s)toolautosubmit(?:\s|=|>)` also matches inside an attribute value, e.g. `tooldescription="x toolautosubmit y"`. The current bytes do not trigger it.
- The browser-side `annotations` witness exists in the evidence but is not used.

### F7 — Profile isolation and PID cleanup: what is actually evidenced (medium)
- Producer side:
  - Fresh `mkdtemp` `tabi-r21-lifecycle-*/auto-invalid` profile, with `HOME` and `TMPDIR` set to the temp dir and `rmSync` at the end (L128, L159, L164, L255).
  - Playwright 1.64.0 appends `--user-data-dir=<profile>` itself (coreBundle L44737), which the PID root match uses (producer L58).
  - `ignoreDefaultArgs` filters by exact string (L41189), so it removes only Playwright's `--enable-features=CDPScreenshotNewSurface` (L36226) and keeps `--disable-breakpad` (L36214).
  - [INFERENCE] With breakpad disabled, no crashpad handler escapes the ppid tree.
- **Not retained in evidence:** the profile path, the temp root, the effective argv (Playwright's `--disable-features=` list, `--headless`, the duplicate `--disable-extensions`), and the env. Isolation is therefore a producer-code claim. The note L68-69 and the wave context ("requested flag strings, not full effective host argv") already acknowledge the argv part.
- `browserPidsBefore` is overwritten at close with the union of launch and close sets (producer L74). For this case the sets are identical, so the value is unchanged, but the field is not a pure pre-snapshot.
- Counter coverage (measure L97): only `browserPidsBefore` non-empty, `browserPidsAfter == []` and `contextClosed`. It does not check `processIdentities`, start ticks, `browserPidsSeenAfterClose`, `forcedCleanup` or `closeError`. The producer does throw on `closeError` (L237). A successful `forcedCleanup` (SIGKILL) would pass both the producer and the counter. Here the key is absent, which is an observed clean close.
- The process tree is two `/proc` snapshots plus ppid descent. Short-lived children between snapshots and reparented descendants are outside the claim; the note L64-67 bounds this.

## Missing mutants for `auto-invalid` (reported, not executed)

Every selftest mutant targets `cases[0]` (`na-pending`) (selftest L18-20). No case-11 control exists. Missing:

1. **auto-invalid-status-drift**: set the response status to `Completed` or delete it. Expected to stay clean today (F1).
2. **observation-nonce-drift**: rewrite the page-echo nonce consistently. Expected to stay clean today (F3).
3. **auto-invalid-autosubmit-off**: remove `toolautosubmit` from the case-11 HTML and rehash. Should be caught by `fixture_digest`; only the reverse direction is tested, on case 0.
4. **invalid-input-nonce**: set case-11 `input.q` to the nonce. Should be caught by `raw_invoke`; the `mode==='invalid'` branch at L81 is only exercised in the accept direction.
5. **mode-drift**: change case-11 `e.mode` from `invalid` to `success`. Should be caught by `case_identity`; untested for this index.
6. **annotation-drift**: set `toolsAdded.annotations.autosubmit = false` with the HTML unchanged. Expected to stay clean; no check exists.
7. **forced-cleanup-present / seen-after-close-nonempty**: expected to stay clean; no check exists.
8. **foreign-landing-request**: add a `/landing` request during the `auto-invalid` window in `receipt.requests`. Expected to stay clean; requests are unchecked.

## Remaining unknowns
- Whether L1 intends to commit the producer before the counter run (F2). The current state was observed, not predicted.
- Effective Chromium argv, and the absence of a crashpad process, at run time. Neither was retained.
- Equivalence between served bytes and retained bytes beyond code construction and the browser-side attribute witnesses (F5).
