PASS

# R70Review2 — review of scripts/verify-live-r70.mjs at its frozen bytes

Seat: R70Review2 (leaf reviewer, no delegation). Verdict: **PASS** — run binding and override
semantics are sound; every committed c2 refusal fires for the right reason; one LOW finding
(evidence-leg provenance, demonstrated) and informational notes below. No HIGH/MEDIUM finding.
No lane file was modified; all probes ran from copies under my scratch.

Instrument under review: `scripts/verify-live-r70.mjs`, sha256
`99442a2c385387148d12167072cafb764590def99ef0172e41c0f90ed75376b8` — matches
`.ufo/waves/round-70/freeze.txt` (freeze 7c42ef25, parent b5d77c4c). Driver
`704efab8…df9577`, counter `a2ed7619…39756e` also match. LSP device: not available in this
session's toolset (no lsp tool mounted); findings are from full-text reads of the frozen bytes,
recorded here as the required unavailability note.

## Assignment checklist

1. **Pin order before any launch — sound.** `verify-live-r70.mjs:122-126` hashes driver and
   counter and refuses (exit 2 `driver-pin`/`counter-pin`) before the scratch guard (:133),
   `--no-run` (:135), the evidence counter (:144) and any spawn (:148+). Empirical: committed
   `controls/c2/tampered-driver.out` shows `runs: []`, `evidence: null` at exit 2; my probe of
   the real frozen verifier with an over-long scratch returned exit 2 with `runs: []` and no
   directories created (guard precedes `fs.mkdirSync` at :148).
2. **Counter pin — strong.** The counter path is not overridable (no `--counter` flag exists);
   it is always `LANE + prof.counter` and always compared to the frozen `prof.counterSha256`
   (:126) even under `--driver` override. The override flag set is closed: `--driver` without
   `--driver-sha256` (or vice versa) is usage exit 2 (:113-115); `pinSource` flips to
   `override` at :116 whenever either flag is present, and `predicate = clean && pinSource ===
   'frozen'` (:188) — an override can end only at 0 (impossible), 4 (clean), or 1.
3. **Run-binding checks — sound.** Per run (:155-173): `newFile` (existence + mtime ≥
   spawn−1 s; `existedBefore` at :156 is checked after the rm+mkdir and is always false — see
   F2), `nonce` (receipt nonce AND page nonce equal the drawn nonce), `driverDigest`
   (`receipt.driverSha256 === driverPin`, the digest of the bytes that were hashed at :124 —
   i.e. the executed binary), `cdpPort` (`host.argv` carries the drawn
   `--remote-debugging-port`), `httpPort` (`fixture.origin` equals the drawn HTTP origin).
   Each failure is an individual finding → exit 1. Probe D (garbage-writing override driver,
   receipt `receipts/garbage-receipt-override.json`): exit 1 with all bindings false except
   `newFile`, counter exit 2 per run, `cross-run-unmeasurable` + `evidence-unmeasurable` —
   fail-closed on unreadable JSON.
4. **Counter judged against the profile's FROZEN driver digest — verified.** `runCounter`
   (:136) defaults `expectSha = prof.driverSha256`; the evidence call passes it explicitly
   (:144); both live runs use the default (:174). Under override, receipts naming the override
   binary's digest fail the counter (`driver-sha256-pin`, observed verbatim in
   `controls/c2/forger-rewrite-full-honest.out`); receipts claiming the frozen digest fail
   `binding.driverDigest` (`forger-rewrite-full-lying.out`: exactly `run-a-driverDigest`,
   `run-b-driverDigest`). The two variants interlock: no receipt can satisfy both the executed
   binary's identity and the frozen pin unless the executed bytes ARE frozen (then exit 4 at
   best, committed control `override-copy-of-frozen`).
5. **Cross-run identity — sound, one vacuous conjunct.** :181 requires both launchTokens
   present, different, and nonces different. The nonce conjunct is vacuous (verifier-suffixed
   `-a`/`-b` can never collide); `launchToken` (driver-random 6 bytes per run, receipt field)
   is the load-bearing check and fires correctly in `forger-replay.out` / `forger-rewrite.out`
   (identical replayed receipts → identical token → `cross-run-identity`).
6. **Fingerprints — adequate as an agreement net, not an independent health oracle.** Tap
   fingerprint (:63-71) per 8 legs: leg name, non-move event type sequence with pointer types,
   click details, and the `Position out of bounds` flag. Blind spots: isTrusted, coordinates,
   target, dblclick, press→release ms, timestamps, ports. Every blind spot is covered by
   another frozen instrument (the 84-check counter: `leg-*-trusted/coords/target/no-dblclick/
   timing`; binding: nonce/ports; counter `run-window`: timestamps). Two broken runs can agree
   on the fingerprint only by being counter-clean AND evidence-shaped — at which point
   "broken" reduces to a capability-semantics dispute (C1's counter + S175), not a run-binding
   gap. Naming note (F3): `agreement.crossRun` is fingerprint equality only; in
   `forger-replay.out` it reads `true` while findings include `cross-run-identity`.
7. **Evidence agreement — shape-agreement, not provenance (F1, the one real gap).** See below.
8. **Exit 4 semantics — correct.** :188-189: clean + override → 4, `predicate:false` always.
   Committed control: exit 4, findings none, two real 10.4 s runs. My probe D override run
   with failing content → 1. No code path lets an override produce exit 0.
9. **Scratch-path guard — right reason, verified.** :128-133 computes
   `<scratch>/run-a/work/org.chromium.Chromium.XXXXXX/SingletonSocket` and refuses > 107
   bytes pre-launch. The path model is correct for the pinned drivers: the driver puts
   `TMPDIR: scratchDir` into chromium's env (`chrome-cdp-synthtap-round70.mjs:108`, likewise
   r69 driver :131), and scratchDir is exactly `<scratch>/run-a/work` (verifier :151).
   Reproduced on the frozen verifier: 128-byte scratch → exit 2 `scratch-path-too-long`, no
   writes. `run-a`-only in the formula is fine (`run-b` is the same length).
10. **Error paths — fail-closed.** Driver timeout: `spawnSync` timeout 600 s (:152) → status
    null → `run-x-failed` → exit 1 (code-cited, not executed — the frozen driver cannot reach
    it: 240 s page-wait cap, 30 s CDP timeouts, measured 12.4-12.6 s). Missing receipt: stat
    null → `newFile` false + all bindings false. Unreadable JSON: probe D. Counter
    timeout/non-JSON stdout: `runCounter` catch → exit null/verdict null → findings.
    Internal error: :191 → `internal-error` → 1.

## Ways to exit 0 without a live frozen-driver run on this host

- **Via flags/config: none found.** `--no-run` exits 1; `--driver` caps at 4; driver and
  counter pins bind before any launch; the profile set is closed; scratch must be absolute;
  the counter is not overridable.
- **Via the driver: closed.** Frozen-driver exit 0 (`predicate`) requires `nonceOnPage ===
  nonce` (read from the live fixture page over the CDP ws at driver :262-276), 8 frozen leg
  shapes computed from events collected live (:296), 7 `Input.synthesizeTapGesture` calls, 0
  lookalikes, empty failures (any CDP failure → `drive-error` → REFUTED → exit 1), and
  teardown-closure (ports probed closed, zero token-matched survivors). Chromium is spawned by
  absolute path `/usr/bin/chromium` (:206), so PATH substitution is moot. A hypothetical
  fabrication bug inside the frozen driver would be a driver defect, not a verifier bypass;
  this audit found none.
- **F1 (LOW, demonstrated): the evidence leg binds bytes-at-a-path, not provenance.** The
  evidence receipt has no pin (impossible pre-scored-run; correctly absent from PROFILES), so
  leg (6) certifies that the live runs agree in shape with whatever JSON currently sits at
  `corpus/evidence/round70/chromium-synth-tap-gesture/receipt.json`. Reproduction (receipts in
  `receipts/`): copy verifier+driver+counter to a scratch lane copy; rewrite only `nonce`,
  `nonceOnPage` and `serverLog[].run` of the committed scored receipt to
  `tabi-r70-review2-forge`; the frozen counter accepts it (exit 0, verdict clean — the
  counter-accepts-rewrite limit, now shown for the SCORED receipt, not just smoke1); then
  `node <lanecopy>/scripts/verify-live-r70.mjs --profile synthtap-r70 --scratch <short> --json`
  → **exit 0, predicate true, pinSource frozen, findings []**, with
  `evidence.sha256 = 0dcf26ed…` ≠ committed `0a51f3a6…` (receipts:
  `receipts/evidence-swap-exit0.json`, `receipts/forged-evidence-accepted.json`). The two live
  runs still happen and are genuine — this does not fake liveness — but exit 0 alone does not
  certify that the committed evidence came from the scored run. Mitigation that already
  exists: the committed `scored/c1-verify-live-L1.json` records `evSha 0a51f3a6…`, and
  `out.evidence.sha256` is printed on every run, so any post-hoc swap is detectable by
  comparing verifier outputs; the verifier itself never performs that comparison.
  Recommendation to L1 (no claims/freeze change): record the scored receipt sha256 in the
  closure or the r70 lesson so the comparison is mechanical.
- **Same-user active races (residual, out of the stated threat model):** byte-swap between
  hash (:123-124) and spawn; pre-listening fake CDP peer on the drawn port between `freePort`
  and chromium bind (driver fail-closes: stderr/ws/`/json/list` checks + launch-token sweep);
  receipt mtime/hardlink races inside `run-x` (need `spawnedAt−1 s` mtime and the frozen
  counter). An attacker with active same-user code-running capability defeats the verifier
  itself; none of these yield a passive false pass.

## Per-control refusal reasons (committed controls, c2 unless noted)

| control | observed | reason | right? |
|---|---|---|---|
| donothing-base | 1 MODULE_NOT_FOUND | verifier absent at base (git-archive copy) | yes — honest before-state |
| no-run | 1 no-run | no-work control, pre-launch | yes |
| tampered-driver | 2 driver-pin, runs:[] | byte digest ≠ pin, before launch | yes |
| forger-replay | 1 run-a/b-nonce + ports + cross-run-identity; counter EXIT 0 on same receipts | stale nonce/ports/token; counter proven form-only | yes — the r69 R1 lesson reproduced |
| forger-rewrite | 1 run-a-cdpPort/httpPort + cross-run-identity | nonce rewritten, ports/token stale | yes |
| forger-rewrite-full-lying | 1 run-a/b-driverDigest | receipt claims frozen pin, executed pin is the forger's | yes — kills "claim the frozen digest" |
| forger-rewrite-full-honest | 1 counter-a/b (`driver-sha256-pin`) | receipt honestly names forger; counter judges vs FROZEN pin | yes for the override contract; NOTE it is a digest-identity refusal, not a content-fabrication refusal |
| forger-degenerate-{js-scroll,dispatch-wheel,skip-touch} | 1 counter-a/b (`scored-run-not-degenerate`, `gesture-call-count`, `gesture-params`, `no-other-input-producer`, …) | real frozen r69 driver's degenerate receipt, exit masked to 0; content-level counter catch | yes — this trio is the actual content-catch proof (`run-X-driverDigest` present is an override artifact, harmless) |
| override-copy-of-frozen | 4, findings none | byte-identical copy; refusal is purely pinSource | yes — "an override run is never a pass" |
| scratch-too-long | 2 pre-launch, no writes | 128 > 107 sun_path; failure mode observed in c2/positive attempt 1 | yes |
| positive | 0 | two real ~10.4 s runs, all bindings true | yes |
| c1 counter-accepts-rewrite | 0, 84 checks clean on rewritten replay | counter's declared limit | yes |
| c1 donothing-live-no-evidence / donothing-no-receipt | 1 evidence-counter / 2 receipt-unreadable | evidence absent pre-freeze | yes (c1 forger-rewrite's extra `evidence-counter` finding is pre-freeze-era; subset matching keeps the row honest) |

Evaluator semantics (`controls/evaluate-controls.mjs`): exit equality + every expected finding
id present (subset; `none` = exactly empty) — sound and non-brittle; `summary.json` 31/31
consistent with the transcripts I sampled. I did not re-run the evaluator: it rewrites
`summary.json` in the lane tree, outside my write scope.

## Findings

- **F1 (LOW, demonstrated)** — evidence leg has no provenance binding; exit 0 accepts a
  counter-passing forgery at the evidence path. `verify-live-r70.mjs:141-147,186` +
  reproduction above. Mitigated post-hoc by `scored/c1-verify-live-L1.json` `evSha` and the
  printed `evidence.sha256`; recommend L1 record the scored receipt digest mechanically.
- **F2 (informational)** — `existedBefore` (:156) is checked after `rmSync`+`mkdirSync`
  (:150-151) and is always false; `newFile` (:167) is therefore existence+fresh-mtime only and
  passes for unparseable bytes (probe D). No impact (all other bindings fail), but the
  variable suggests an unimplemented intent; move the check before the rm or drop it. Frozen
  bytes — note only.
- **F3 (informational)** — `agreement.crossRun` (:184) is fingerprint equality, and reads
  `true` in `forger-replay.out` while `cross-run-identity` fires; a JSON-only reader can
  misread it. Documentation/naming note on frozen bytes.
- **F4 (informational)** — `wallMs` recorded (:160) but never plausibility-checked (19 ms in
  probe D); refusals rest on binding+counter, so no bypass; audit-trail value only.
- **F5 (informational)** — the scratch guard models the pinned drivers' TMPDIR layout; under
  `--driver` override the modeled socket path may not match the override binary
  (control-only; exit ≤ 4 anyway).
- **F6 (residual)** — hash-then-spawn TOCTOU on driver/counter bytes and same-user port/
  receipt races: outside the passive threat model; fail-closed under it.
- **F7 (residual)** — on a driver timeout `spawnSync` kills only the direct child; the pinned
  driver group-kills its chromium in teardown, but a SIGKILL race could orphan a browser.
  Unreachable for the frozen driver (internal caps ≪ 600 s); control-only.

## Verification gaps

- LSP unavailable (no lsp tool in this session) — all checks are full-text reads of the frozen
  bytes plus executed probes; no semantic-index cross-check.
- Driver-timeout and counter-timeout paths are code-cited, not executed (600 s/120 s waits);
  all other refusal paths were either reproduced by me (scratch-too-long, no-run,
  evidence-swap, garbage-receipt) or re-derived from committed transcripts plus matching
  code paths.
- I did not re-run `evaluate-controls.mjs` (writes lane `summary.json`) and did not re-run the
  committed r69 positive path (two live chromium runs already re-verified by me under the tap
  profile in probe C; the r69 positive control transcript shows two real 10.4 s runs).

Probes run (all under /fast/scratch/hyaku/tabi-r70/R70Review2, deleted after this report;
receipts copied to `receipts/` beside this file): long-scratch refusal, --no-run,
evidence-swap exit-0 demonstration (2 genuine live chromium runs, verifier-drawn ports),
garbage-receipt override error path (no chromium). No git/jj mutations; lane tree untouched.
