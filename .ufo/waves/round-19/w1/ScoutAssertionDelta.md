# C3 d2 — round-17/round-18 assertion delta

## Finding

Across the 15 carried-over checks (11 cases + 4 controls), six round-17 predicates asserted a numeric CDP error code and the corresponding round-18 predicates no longer did. Four now match the `Tool not found` message, one matches `WebMCP domain is not enabled`, and one checks only that the error message is nonempty. Thus **six** is the correct count for numeric-code-to-message-based assertion changes; strictly, only **five** use a concrete message substring.

| Case ID | Round 17: ID line; numeric predicate line(s) | Round 18: ID line; replacement predicate line(s) | Delta |
|---|---|---|---|
| `invoke-unknown-tool` | `webmcp-invoke-round17.mjs`: 1158; 1176–1178 | `webmcp-invoke-round18.mjs`: 1955; 1972–1975 | `-32602` + exact `Tool not found` → case-insensitive `Tool not found` substring |
| `invoke-after-unregister` | round17: 1327; 1377–1380 | round18: 2124; 2174–2177 | `-32602` + exact `Tool not found` → case-insensitive `Tool not found` substring |
| `invoke-flags-off-control` | round17: 1503; 1532–1535 | round18: 2300; 2329–2332 | `-32602` + exact `Tool not found` → case-insensitive `Tool not found` substring |
| `invoke-iframe-frameid` | round17: 1580; 1625–1628 | round18: 2377; 2422–2425 | `-32602` + exact `Tool not found` → case-insensitive `Tool not found` substring |
| `invoke-before-enable` | round17: 1750; 1756 | round18: 2547; 2553 | `-32000` plus the domain-gate text test → domain-gate message substring only |
| `invoke-domain-disabled` | round17: 1867; 1873 | round18: 2664; 2670 | `-32601` → message must be a nonempty string; **no method-not-found substring is asserted** |

Round-17 line references above point to each case’s predicate and show its numeric-code test; round-18 references point to the replacement predicate. The code-to-message changes are limited to these six shared IDs. The remaining nine checks among the original 15 do not have a numeric error-code assertion to replace.

## Count and denominator

The lane master ref was B (`66251bfc1aef393e4aec599e950a8deb867736bb`); both target script paths were clean in the working tree. The round-17 script has 15 `invoke-` check IDs. Round 18 retains those checks and adds `invoke-download-refused` at line 2681, so round 18 has 16 IDs total. That added check is outside the requested 11-case/four-control comparison and is not part of the denominator 15.

Deterministic counter against the baseline blobs (observed output: `round17: 6`, `round18: 6`):

```sh
node -e 'const {execFileSync}=require("node:child_process");const root="/home/vgpnk/Projects/shokunin/tabi-shokunin",base="66251bfc1aef393e4aec599e950a8deb867736bb";for(const [version,re] of [["round17",/o\.(?:invoke|second|negative)\.error\.code === -(?:32602|32000|32601)/g],["round18",/(?:\/Tool not found\/i\.test\(o\.(?:invoke|second|negative)\.error\.message\)|\/domain is not enabled\/i\.test\(o\.invoke\.error\.message\)|o\.invoke\.error\.message\.length > 0)/g]]){const src=execFileSync("git",["-C",root,"show",`${base}:scripts/webmcp-invoke-${version}.mjs`],{encoding:"utf8"});console.log(`${version}: ${[...src.matchAll(re)].length}`)}'
```

The round-17 regex counts the six numeric error-code predicates. The round-18 regex counts the six corresponding message-based predicates, including the generic nonempty-message predicate for `invoke-domain-disabled`.

## Evidence and limitations

- `SKILL.md:1991–1992` explains the transport distinction: round 17’s raw-WebSocket evidence is retained for that transport, while the round-18 CDPSession harness does not claim the wire-error-code facet is observable there. The predicate changes above match that rationale.
- No LSP device or LSP CLI was available (`xd://lsp` is not mounted; no `lsp`/`omp-lsp` executable was found). Text search was used only to locate candidates; each listed case and predicate was then read in surrounding source sections. These are direct source-text findings, not LSP semantic-reference results.
- No external sources were opened and no tools were installed.
