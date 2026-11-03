# R56Critic — round 56 wave w1 findings (read-only, pre-data)

Full list with evidence: `.ufo/waves/round-56/critic/attack.md`. Probes: `critic/c1-fixture-probe.sh` (+ `critic/probe-out/probe-run.txt`), `critic/bg-scan.mjs` (+ `critic/bg-scan.txt`), `critic/probe-out/v15-rerun-now.json`.

## Verdicts
- C1 (adjacency): 8 of 9 attacks succeeded. The meter does recompute status, sha, lines and bgHits from snapshot bytes (failed-to-break on ledger editing for those fields).
- C2 (coverage): 9 of 9 design attacks succeeded. The planned counter and runner do not exist yet; nothing C2 was executed.

## Blocking for freeze (the L1 folds these in before the data pass)
1. C1 head check is in the `else` branch only (v15 lines 227-252): a delta head is unbound when the screened file is absent or HEAD is unresolvable. Probe D green, E red with the same fake head.
2. C1 HEAD-unresolvable is conflated with `sibling-absent` (v15 lines 268-270, 167): probe A (present dir, dangling `.git`) green; B red.
3. C1 `sibling_ref` SHA is never read (`parseRef` returns `rev`, `verify` ignores it): probe C green with a different SHA.
4. C1 red reach: 14 of 19 findings are lane-presence changes, not content moves; 3 are alias rows (`shokunin-repo-hygiene` and `shokunin-reverse-engineering` carry sha+head identical to live `souji-shokunin` and `kaidoku-shokunin`; `shokunin-binary-forensics` absent). Drop absent-lane rows; screen souji and kaidoku under their own names.
5. C1 "before" re-run is not reproducible: today 20 findings (19 + tsukuroi head). Record the committed receipt sha instead of a re-run.
6. C1 keyword screen: 14 unscreened browser-word lines (chrome/browser/scrape) at round-open heads; disclose as the screen's limit with the bg-scan total at the data heads.
7. C2 counter: nonce check fires only on absent-from-both; no page-side nonce echo, no keylog entry-by-entry, no `host.chromium`/headless check, no `isTrusted`, no Referer, `enter.submitted` and `serverSawField` are driver-written booleans, `/echo` count not exact, End and Tab witnesses are vacuous without keylog entries, and the green fixture can be copied as a no-op receipt.
8. C2 after-command in claims.json does not match the counter spec (`--shot`, relative path, `couldNotEvaluate`); the do-nothing sentence ("refused by pinned driver digest") is forgeable, since the digest is public.

## Residual (disclosed, not blocking)
- Dispositions are vocabulary-checked, not judged.
- Mapped-only lane heads are provenance, not predicate-bound.
- Live fleet moves during the round (4 heads moved between round open and today's re-run).
- Lane alias hypothesis for the three absent delta lanes is [INFERENCE], not verified.

## Installs and writes
- No tools installed. No repo file written outside `.ufo/waves/round-56/critic/` and this report. No git mutation. Scratch removed.
