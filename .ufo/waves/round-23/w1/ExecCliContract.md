# ExecCliContract — round-evidence auditor CLI contract (C1, operability)

Verdict: contract pinned and exercised — throwaway `refuse.mjs` reproduces all four required refusals byte-for-byte, and conformance prototype `predicate-proto.mjs` yields exactly 6 classes on round-22 at `a89f1935f523a64b00991d792fca6a8c0d321948` (exit 1) and 0 on round-21 at `5f585773258b33d2d514b00cd0b0775333578db6` (exit 0).

## Flags

`node scripts/round-evidence-audit.mjs --rev <40-hex> --round <N> [--json]` or `--selftest`

| Flag | Parse rule | Effect |
|---|---|---|
| `--rev` | exactly `/^[0-9a-f]{40}$/`; no trim, uppercase or `~` | resolved via `git rev-parse --verify <rev>^{commit}`; normalized hash echoed |
| `--round` | `/^[1-9][0-9]?$/` (1–99, no sign, no leading zero) | wave root `.ufo/waves/round-<N>` |
| `--json` | valueless boolean | compact JSON on stdout |
| `--selftest` | MUST be the only argument | 12 in-memory cases; MUST NOT read repo, network, clock or expectations files |
| other token, positional | — | refusal `unknown-argument` |
| repeated flag | — | refusal `duplicate-flag` |

Lane root = `git -C <script dir> rev-parse --show-toplevel`; fleet root = `dirname(lane root)`. Report = lane-repo `.ufo/reports/round-<N>/tabi.md` at `--rev` if present, else the fleet-repo copy at fleet `HEAD`; only these two paths are tried. No other flag may be required: `--rev --round --json` alone MUST succeed (an optional `--round-cap` MAY exist but MUST default to 128).

## Exit codes

| Code | Meaning | stdout |
|---|---|---|
| 0 | clean, `findings: []` | result document |
| 1 | one or more findings | result document |
| 2 | usage or IO refusal | empty |
| 3 | selftest disagreement | selftest document |

Precedence: a refusal always wins over findings, and no check runs after a refusal.

## Refusals — fixed order, first failure wins; stdout empty; stderr `refused: <code>: <detail>\n`; exit 2

| Code | Trigger | Demonstrated here |
|---|---|---|
| `not-a-worktree` | `rev-parse --show-toplevel` fails | — |
| `unknown-argument` / `duplicate-flag` / `missing-value` / `missing-flag` | see flag table | — |
| `selftest-exclusive` | `--selftest` with any other token | — |
| `rev-not-40-hex` | rev fails the regex | `refused: rev-not-40-hex: a89f193` |
| `round-not-integer` | round fails the regex (`0`, `022`, `100`, `2a` refuse) | `refused: round-not-integer: 022` |
| `rev-unresolvable` | `git cat-file -e <rev>^{commit}` fails | `refused: rev-unresolvable: aaaa…aaaa` (40×`a`) |
| `wave-dir-absent` | `<rev>:.ufo/waves/round-<N>` absent or not a tree | `refused: wave-dir-absent: a89f1935…948:.ufo/waves/round-99` |
| `report-absent` | neither report path resolves | — |

Each demonstrated line was produced by `node refuse.mjs <flag case>` in `.ufo/waves/round-23/scratch/ExecCliContract/`, exit 2, stdout empty. `<detail>` is the offending token verbatim or `<rev>:<path>`; one LF-terminated line, no quoting.

## Result document (`--json` bytes)

- Key order/literals: `{"schema":"tabi-round-evidence-audit-v1","rev":"<40-hex>","round":<int>,"classes":6,"findings":[<finding>…],"clean":<bool>}`.
- `findings` ascending by class id (`c1`…`c6`), at most one entry per class; a class that does not trip emits no entry.
- Each finding: keys in order `class,cited,derived,evidence`; `cited`/`derived` are single-line `<key>=<value>[,<key>=<value>]*` with no spaces; `evidence` keys in order `root` (repo-relative POSIX path or `null`), `report` (`<path>@<sha256>`), `reportCommit` (40-hex).
- `clean === (findings.length === 0)`; exit 1 iff `!clean`. Serialization: `JSON.stringify` in that order + one `\n`; UTF-8, LF, no pretty-print, timestamps, environment values or absolute paths; arrays sorted by code point. Without `--json`: one `<class>\t<cited>\t<derived>` line per finding, then `clean` or `findings=<n>`.

## Six classes (`WAVE_MAX_LANES=64` from fleet `scripts/hyaku/ufo-wave-policy.json` @ `b5f635af…`, `ROUND_SEAT_CAP=128` from the round contract)

| class | reads (at `--rev`, plus report) | trips when | round-22 observed |
|---|---|---|---|
| `c1-refusal-arithmetic` | `w*-cap-refusal-*.json`; report first `(\d+)\s+whole-payload` | cited absent with receipts>0, or cited ≠ receipt count | 23 vs 24 |
| `c2-wave-caps` | `w*-spec.json` `maxLanes`; report `Round total:\s*(\d+)\s+seats` | maxLanes>64 or total>128 | 65, 129 |
| `c3-gate-spotcheck` | `corpus/lessons/round-<N>-verifier-spotcheck.md`; `## Gate` of `round-<N>.md` | artifact exists and no Gate line matches `(?i)spot-check\|owed to closure` | rows=0 |
| `c4-stale-attempts` | report `watchdog launches <dates>`; `^\s*[-*]\s+\*\*Attempt\s+\d+` | attempts>1 and graded<attempts | 3, 0 |
| `c5-registry-identities` | `**/swarm-registry.json` whose `reportDir` holds committed `.md` | any `agentId` null/`""` | 2 registries, 65/65 null (W2b) |
| `c6-landed-log-binding` | `## Landed changes` lines: each 7–40 hex token resolving to a commit | `git show --name-only --format= <c> -- LOG.md` is empty | 5 commits, 2 bound, 3 unbound |

## Selftest

12 cases, ids in order `c1-red,c1-green,c2-red,c2-green,c3-red,c3-green,c4-red,c4-green,c5-red,c5-green,c6-red,c6-green`; red MUST emit exactly its class, green MUST emit none; a constant printer or expectations-file reader fails a paired case. Output `{"schema":"tabi-round-evidence-audit-selftest-v1","cases":12,"passed":12,"failed":[],"clean":true}` with exit 0, or sorted `failed` ids + `clean:false` + exit 3.

## Expected outputs (exact one-line `--json` bytes)

`--rev a89f1935f523a64b00991d792fca6a8c0d321948 --round 22 --json`, exit 1:

```json
{"schema":"tabi-round-evidence-audit-v1","rev":"a89f1935f523a64b00991d792fca6a8c0d321948","round":22,"classes":6,"findings":[{"class":"c1-refusal-arithmetic","cited":"whole-payload-refusals=23","derived":"whole-payload-refusals=24","evidence":{"root":".ufo/waves/round-22","report":"../.ufo/reports/round-22/tabi.md@a838b5b4e45dd3f8767639fd18c136db80f47969d0bb3a48a30ed9db4ca9800e","reportCommit":"69449ed557b844e21705e711585aea454c551f98"}},{"class":"c2-wave-caps","cited":"declaredMaxLanes=65,roundSeats=129","derived":"waveMaxLanes=64,roundSeatCap=128","evidence":{"root":".ufo/waves/round-22","report":"../.ufo/reports/round-22/tabi.md@a838b5b4e45dd3f8767639fd18c136db80f47969d0bb3a48a30ed9db4ca9800e","reportCommit":"69449ed557b844e21705e711585aea454c551f98"}},{"class":"c3-gate-spotcheck","cited":"gate-spotcheck=absent","derived":"artifact=corpus/lessons/round-22-verifier-spotcheck.md,gateRows=0","evidence":{"root":"corpus/lessons","report":"../.ufo/reports/round-22/tabi.md@a838b5b4e45dd3f8767639fd18c136db80f47969d0bb3a48a30ed9db4ca9800e","reportCommit":"69449ed557b844e21705e711585aea454c551f98"}},{"class":"c4-stale-attempts","cited":"stale-lane=none","derived":"attempts=3,graded=0","evidence":{"root":null,"report":"../.ufo/reports/round-22/tabi.md@a838b5b4e45dd3f8767639fd18c136db80f47969d0bb3a48a30ed9db4ca9800e","reportCommit":"69449ed557b844e21705e711585aea454c551f98"}},{"class":"c5-registry-identities","cited":"registryIds=names-only","derived":"registries=2,members=129,unidentified=65","evidence":{"root":".ufo/waves/round-22","report":"../.ufo/reports/round-22/tabi.md@a838b5b4e45dd3f8767639fd18c136db80f47969d0bb3a48a30ed9db4ca9800e","reportCommit":"69449ed557b844e21705e711585aea454c551f98"}},{"class":"c6-landed-log-binding","cited":"rows=6","derived":"rows=6,commits=5,logBound=2,unbound=47bfb5f7ad3c87d0deb2629af6b7d7fe2076cf3e,be271a2d98f3e2f6ec3e179c8e17f50f80698571,e3cf4e0d30bb835532ff44b118c5ad52e09eb76d","evidence":{"root":null,"report":"../.ufo/reports/round-22/tabi.md@a838b5b4e45dd3f8767639fd18c136db80f47969d0bb3a48a30ed9db4ca9800e","reportCommit":"69449ed557b844e21705e711585aea454c551f98"}}],"clean":false}
```
Round-21 control, exit 0: `{"schema":"tabi-round-evidence-audit-v1","rev":"5f585773258b33d2d514b00cd0b0775333578db6","round":21,"classes":6,"findings":[],"clean":true}`

- In-flight `scripts/round-evidence-audit.mjs` (untracked, not mine) diverges from this contract: `--round-cap` is required (`:643`), the document is pretty-printed with `classIds`/`perClass` and no `classes: 6` (`:703`, `:407-416`), refusals are prefixed `round-evidence-audit: refused:` (`:719`), `--round` accepts `0`/leading zeros (`:642`), and the selftest document adds `runs` (`:565`) — reconcile before the counting command can pass.
- `c3` is rev-dependent: the obligation is observable only once the spot-check artifact is committed, so 6/6 holds at `a89f193…`; at `be271a2…` (before that artifact) it is 5/6 by design.
- `c6` reproduces defect 6 with three unbound commits (`e3cf4e0`, `be271a2`, `47bfb5f`), still one class; the report is read from fleet `HEAD` and pinned by `reportCommit` + sha256.
- Caps are policy, not round bytes; scratch files (`refuse.mjs`, `predicate-proto.mjs`) are throwaway, and `scripts/round-evidence-audit.mjs` was not written here.
