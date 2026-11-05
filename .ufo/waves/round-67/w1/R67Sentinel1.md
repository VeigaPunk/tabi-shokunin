# R67Sentinel1 — scoped findings (copy of w1/R67Sentinel1/report.md)

Full evidence, grep counts, exit codes and remediation: `.ufo/waves/round-67/w1/R67Sentinel1/report.md`.

Frozen driver sha256 matches `ac0561ac85fb4ce544e728d6805da1e477a45e23cdd66d0e9573e103130a70e0`.

| # | Sev | file:line | Finding |
|---|---|---|---|
| 1 | MEDIUM | scripts/check-receipt-provenance.mjs:31,63 | v3 gate accepts repo escape: `../outside.mjs` → exit 0, failures 0; in-repo symlink to outside → exit 0. Digest oracle over readable files. |
| 2 | LOW | scripts/check-receipt-provenance.mjs:52 | `stdoutFile` absolute or `../` unchecked. |
| 3 | LOW | scripts/chrome-cdp-loopback-round67.mjs:260,273 | Scratch profile path written to committed receipts: `--user-data-dir=/fast/scratch/hyaku/...` in 74/74 receipt.json (`grep -rnI '/fast/\|/home/' --include=receipt.json … \| wc -l` = 74). |
| 4 | LOW | scripts/chrome-cdp-loopback-round67.mjs:408 | `stderrHead` stores Chromium stderr incl. DevTools ws URL and browser GUID (e.g. measure/smoke1/receipt.json:29). |
| 5 | LOW | scripts/chrome-cdp-loopback-round67.mjs:300,303 | Full host env passed to Chromium. |
| 6 | LOW | scripts/chrome-cdp-loopback-round67.mjs:137,144,152,158 | Process sweep substring match with no uid/self-pid guard; PID-reuse window. Needles are unique; low. |
| 7 | LOW | scripts/chrome-cdp-loopback-round67.mjs:116,314-317,319 | Port TOCTOU; readiness does not verify child identity on devPort. Nonce binding fails closed. |
| 8 | LOW | scripts/verify-live-r67.mjs:118-120,166 | Pin-then-exec TOCTOU on driver path (same-user). |
| 9 | LOW | scripts/chrome-cdp-loopback-round67.mjs:79-83 | `validateOut` accepts any absolute `.json` path. |

Checked clean: all binds 127.0.0.1; no shell (`grep -cE 'exec\(|execSync|shell *:|/bin/(ba)?sh'` = 0 in both files); no sudo/sysctl/chmod/chown/umask (grep exit 1); group kill scoped to own detached child (:279, :303); nonce regex-gated (:98).

Wave evidence (paths only): `/home/` outside lane = 27 (w1-spec/plan/dispatch.json 6 each; R67Critic1 and R67MutTester2 files); `op://` = 3 (w1-spec.json:115, w1-plan.json:234, w1-dispatch.json:229, prohibition list); `cookie` = 3 and `Bearer` = 3 (same three files); credential-shaped values (vendor prefixes, long token assignments) = 0 files.

v4 gate `counters/check-receipt-provenance-v4.mjs`: present; not reviewed as code. `scripts/verify-live-r67.mjs`: present; reviewed.
