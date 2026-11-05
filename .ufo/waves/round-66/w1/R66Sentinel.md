# R66Sentinel: round-66 security sweep (read-only)

Full report: `.ufo/waves/round-66/w1/R66Sentinel/report.md`.

Scope: `counters/check-receipt-provenance-v3.mjs`, `counters/rebind-ledger-r66.mjs`, `c2/mutants3/M5{a,b,c,d}.mjs`. No `.sh` files exist in scope. `c1/` holds data only.

Verdict: no Critical, High or Medium findings.

| # | Sev | Location | Finding |
|---|---|---|---|
| F1 | Low | `counters/rebind-ledger-r66.mjs:372` | Writes `diff-summary.json`; header line 9 says `diff-summary.txt`. Doc drift. |
| F2 | Low | `counters/check-receipt-provenance-v3.mjs:119` (also in the 4 mutants) | `rmSync(<scratch>/provenance-selftest, recursive)`; `--scratch` is caller-supplied and only checked to be absolute. |
| F3 | Low | `counters/check-receipt-provenance-v3.mjs:90` | Relative matrix input has no containment check (`../` escapes); read-only, acts as an existence oracle. |
| F4 | Info | `counters/rebind-ledger-r66.mjs:279,281,372` | All writes go under `--out-dir`. Compliant. |
| F5 | Info | `counters/rebind-ledger-r66.mjs:115` and sibling helpers | Sibling access is `git -C <fleet>/<ln> cat-file -p|-e` and `rev-parse`; read-only; no shell. Compliant. |

Commands and exit codes (full list in the report):
- `git -C tabi-shokunin grep --untracked -n -E 'writeFileSync|mkdirSync|…' -- counters c1 c2` → exit 0 (hits at the listed lines; all under caller-scoped roots).
- `git -C tabi-shokunin grep --untracked -n -i '/tmp' -- counters c1 c2` → exit 0 (quoted sibling prose in c1 TSVs only; no script hit).
- `git -C tabi-shokunin grep --untracked -n -E 'process\.env' -- counters c1 c2` → exit 1 (no hit).
- `git -C tabi-shokunin grep --untracked -n -E 'git (commit|add|push|checkout|reset|stash|pull|merge|rebase|revert|clean|apply|cherry-pick)\b' -- counters c1 c2` → exit 1 (no hit).
- `git -C tabi-shokunin grep HEAD -n -i -E 'token|secret|api[_-]?key|BEGIN [^-]*PRIVATE KEY|op://' -- .ufo/waves/round-66` → exit 1 (committed tree clean).
- Working-tree credential scan → exit 0 with 4 lines (c1 TSVs :39 and :164, both adjudicated and mechanical): `data.json?token=…` placeholder and prose quotes only. No credential value.

Rebind generator confirmed: reads siblings only through `git cat-file`, writes only under `--out-dir`.

No scratch created; nothing installed.
