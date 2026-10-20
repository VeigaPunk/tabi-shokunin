VERDICT: PASS

## Findings

- Completed C3 D5 with seven sequential reruns from the measured revision `93bfead1f5f25f584353df3152a60209bbd89a2e`, using a separate fresh `TMPDIR` for each invocation. The run receipts are new 2026-10-20 observations, not the unrecoverable `/tmp` outputs from round 17; this distinction is recorded in the index (`.ufo/waves/round-18/PLAN.md:43-45,99-101`; `corpus/evidence/round-18/routed/harness-reruns/index.json:2-8`).
- Revision evidence: `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse --verify refs/heads/master` printed `2bff864fdfee684ddbcd066cc8e735adaba2735c`. The sandbox checkout printed `HEAD is now at 93bfead round-17: wave-2 falsification repairs ...` and `git -C /tmp/tabi-r18-D5HarnessReruns-Bf1GWy/sandbox rev-parse HEAD` printed `93bfead1f5f25f584353df3152a60209bbd89a2e`. `git -C /tmp/tabi-r18-D5HarnessReruns-Bf1GWy/sandbox show HEAD:scripts/webmcp-invoke-round17.mjs | sha256sum` printed `de62820dd35e5cf7804b656ef3fe1678da8a15bdf4248c8b7fa737f878b052d7`; the same producer path and digest are embedded in all seven receipts and the index (`index.json:4-6`; `run-1.json` through `run-7.json`, `producer`).
- Each child invocation ran `node scripts/webmcp-invoke-round17.mjs --out /tmp/tabi-r18-D5HarnessReruns-Bf1GWy/run-<k>.json` in the sandbox, sequentially, with `TMPDIR=/tmp/tabi-r18-D5HarnessReruns-Bf1GWy/tmp-<k>`. Captured stdout summary lines and exit codes are below. All seven exited 0; all have verdict `pass`, 11/11 cases passed with zero failed or missing, and all four controls passed (`index.json:10-93`; receipts `run-1.json`–`run-7.json`). The `runtimeMs` values are monotonic-clock durations measured around each child process.

| k | file | bytes | sha256 of committed receipt bytes | exit | startedAt | runtimeMs | verdict | cases (total/pass/fail/missing) | controls (total/pass/fail) | stdout summary line |
|---:|---|---:|---|---:|---|---:|---|---|---|---|
| 1 | `run-1.json` | 309004 | `5bd314d694987ef97ccfa6a07feaeffac05772bc8322e7df6fefeecf8906afa6` | 0 | `2026-10-20T19:06:20.322Z` | 15467 | pass | 11/11/0/0 | 4/4/0 | `WEBMCP_INVOKE verdict=pass cases=11 passed=11 failed=0 missing=0 controls=4 out=/tmp/tabi-r18-D5HarnessReruns-Bf1GWy/run-1.json` |
| 2 | `run-2.json` | 308941 | `eed6fd3ecfd25780be3d010ecaa9948964d8e286f6136f9275a499ade2bf6e0b` | 0 | `2026-10-20T19:06:46.481Z` | 15120 | pass | 11/11/0/0 | 4/4/0 | `WEBMCP_INVOKE verdict=pass cases=11 passed=11 failed=0 missing=0 controls=4 out=/tmp/tabi-r18-D5HarnessReruns-Bf1GWy/run-2.json` |
| 3 | `run-3.json` | 308961 | `0d33a8d73656387022dd5b4c641611e78ee8603bc698d51f5652b2209881e33f` | 0 | `2026-10-20T19:07:07.933Z` | 15076 | pass | 11/11/0/0 | 4/4/0 | `WEBMCP_INVOKE verdict=pass cases=11 passed=11 failed=0 missing=0 controls=4 out=/tmp/tabi-r18-D5HarnessReruns-Bf1GWy/run-3.json` |
| 4 | `run-4.json` | 308962 | `cbda47fac4fafe745823db61d8b2104b7671776f5fb53f89cd5177b18b9c7e2b` | 0 | `2026-10-20T19:07:23.009Z` | 14986 | pass | 11/11/0/0 | 4/4/0 | `WEBMCP_INVOKE verdict=pass cases=11 passed=11 failed=0 missing=0 controls=4 out=/tmp/tabi-r18-D5HarnessReruns-Bf1GWy/run-4.json` |
| 5 | `run-5.json` | 308962 | `cd0b6398206ff1cb8c71ff63a4a5837c4614030fbe22de3a4b8ef819cfad78eb` | 0 | `2026-10-20T19:07:37.996Z` | 15043 | pass | 11/11/0/0 | 4/4/0 | `WEBMCP_INVOKE verdict=pass cases=11 passed=11 failed=0 missing=0 controls=4 out=/tmp/tabi-r18-D5HarnessReruns-Bf1GWy/run-5.json` |
| 6 | `run-6.json` | 308988 | `f60782b297a2e830e21cd37afd600c0ecf84f9b7ed238135bad0e20015897905` | 0 | `2026-10-20T19:07:53.039Z` | 15127 | pass | 11/11/0/0 | 4/4/0 | `WEBMCP_INVOKE verdict=pass cases=11 passed=11 failed=0 missing=0 controls=4 out=/tmp/tabi-r18-D5HarnessReruns-Bf1GWy/run-6.json` |
| 7 | `run-7.json` | 308975 | `8c9a2db1a7cac8b235c0e9ead714be8f7f32286a10a9a48fd733e164dd372902` | 0 | `2026-10-20T19:08:08.166Z` | 15111 | pass | 11/11/0/0 | 4/4/0 | `WEBMCP_INVOKE verdict=pass cases=11 passed=11 failed=0 missing=0 controls=4 out=/tmp/tabi-r18-D5HarnessReruns-Bf1GWy/run-7.json` |

- `wc -c` on the committed receipts returned the byte counts shown above (all ~309 KB); `sha256sum` returned the full digests shown above. `cmp -s` across each of the seven sandbox outputs and its copied receipt succeeded; command output: `byte-identical source/output pairs: 7/7`. The sandbox and all temporary outputs were then removed; command output: `removed sandbox and temporary run outputs`.
- No blockers. No tools were installed or updated. No build, lint, formatter, or test suite was run.

## Files written:

- `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/routed/harness-reruns/run-1.json`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/routed/harness-reruns/run-2.json`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/routed/harness-reruns/run-3.json`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/routed/harness-reruns/run-4.json`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/routed/harness-reruns/run-5.json`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/routed/harness-reruns/run-6.json`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/routed/harness-reruns/run-7.json`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/routed/harness-reruns/index.json`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/D5HarnessReruns.md`
