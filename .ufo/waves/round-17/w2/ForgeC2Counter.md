VERDICT: BREAKS

Attacked: `.ufo/waves/round-17/measure-c2.mjs` at M `6c97851034e9d8f58b135d28ff969f1f28fa2f7d`, with 23 forged commits whose single parent is M. All were built and measured in
`/tmp/tabi-r17w2-ForgeC2Counter-ENaP` (`git clone --no-hardlinks` of LANE, `git checkout --detach M`); the sandbox is kept because the survivors are cited. Every forgery:
`git reset -q --hard M; <edit>; git add -A; git commit; node .ufo/waves/round-17/measure-c2.mjs <commit>` (cwd = sandbox).
Base at M: exit 0, `c2_invocation_held:1`, `failures:[]`, `probesOk:true`, `fixtureBoundCases:11`, `runCount:3`, `cited:S041..S048`.

Assigned forgeries, held=0 (rejected):
| forgery | commit | counter failure |
|---|---|---|
| producerSha256 = 64 zeros | d25f93c | `producerSha256 != harness blob at revision` |
| required case `invoke-navigation-pending` removed | 41a9358 | `required case invoke-navigation-pending missing` |
| duplicate + remove another required | bfedc51 | `required case invoke-navigation-pending missing` |
| required case `invoke-iframe-frameid` status `fail` | 957b6b0 | `required case invoke-iframe-frameid status fail` |
| cited row S041 tier `C` | c89d1fe | `S041 tier C` |
| every cited row (S041-S048) opened `2026-10-19` | 13183a2 | `no cited row is new since 5859243… and opened >= 2026-10-20…` |
| note header cites only `source: S035` | 210f3b1 | `S035 used-by lacks corpus/knowledge/webmcp-invocation-round-17.md` + `no cited row is new…` |
| README note row removed | 001b3f2 | `README does not mention the note path` |
| `runs[0].gone = false` | cc699db | `run 0 gone is not true` |
| `loopback.externalRequestCount = 3` | 3177180 | `loopback.externalRequestCount is not 0 (3)` |
| one required case `fixtureSha256` flipped | 9528b17 | `required case invoke-imperative-throws fixture digest mismatch…` |

Survivors, held=1 (each is a fabricated receipt the counter certifies):
| forgery | commit | why it holds |
|---|---|---|
| duplicate required case `invoke-unknown-tool`, all required ids still present (12 entries, `summary.caseSet.ran` 11, `duplicates:[]`) | 2a83804 | `cases.find` takes the first occurrence |
| same duplicate but the twin has `status:"fail"` (`verdict:"pass"`, `summary.failed:0`) | 059ef65 | first occurrence passes; twin never inspected |
| duplicate + `summary.cases/passed/caseSet.ran=12`, `caseSet.duplicates:["invoke-unknown-tool"]` (self-consistent corruption) | 28bc712 | declared case-set fields are never read |
| duplicate twin with `fixtureFile:"absent-fixture.html"`, `fixtureSha256:"f"*64` | 678e368 | fixture binding also first-match only |
| new non-required case `invoke-cancel` with `status:"fail"`, `verdict:"pass"`, `summary.failed:0` | d20633a | only the 11 required ids are status-checked |
| `summary.cases:3`, `summary.passed:1` while 11 cases pass | e53f4b7 | counts never compared to `cases[]` |
| `summary.failed:"1"` (string) plus a failing non-required case | 4c6043a | `typeof … === 'number'` guard skips the check |
| `summary.failed` deleted | d198905 | same guard: absence is not a failure |
| real `receipt.controls[]` entry `invoke-cancel` set `status:"fail"` | 2b3e805 | `receipt.controls` is never read by the counter |
| `receipt.controls` array deleted entirely | f31853e | same gap; note `:16` claims "4/4 supplementary controls" |
| a control's `fixtureSha256` flipped | 02127b5 | controls are unbound |
| duplicate `invoke-flags-off-control` whose twin carries `WebMCP.toolResponded {status:"Completed"}` | 1bd0201 | control substance checked on the first `find` match only |

Mechanism, grounded at M:
- `git show 6c97851…:.ufo/waves/round-17/measure-c2.mjs` `:288` `const found = cases.find(...)`; `:290` status; `:294-305` fixture binding: all operate on the first occurrence and nothing rejects a repeated id. `caseIds` (`:286`) is collected but only printed, never compared.
- `:267-268` trusts the receipt-declared `caseSetOk`; `:269-271` accepts a missing or non-numeric `summary.failed` as zero.
- `:283-335` inspects only `receipt.cases`; the string `controls` does not occur anywhere in the counter (`grep -c controls` = 0), although the M receipt has a 4-entry `controls[]` and the note at `corpus/knowledge/webmcp-invocation-round-17.md:16` asserts "4/4 supplementary controls".
- `:323-324` positive/control lookup is first-match, so a duplicate can carry the observation the check is meant to forbid.
- Probe suite `:430-455` covers only producer sha, required removal, cited row status, baseline presence, control Completed, positive missing Completed, control empty CDP — none of the survivor shapes, so `probesOk:true` cannot see them.

Concrete repair (self-contained in `evaluate()`; keep CDP-only field walk):
1. Reject duplicates before any lookup: count ids over `cases` (and `controls`); any id appearing more than once is a failure ("case id X appears N times").
2. Fail-closed on status: every entry in `cases` and `controls` with `status !== 'pass'` is a failure when `verdict === 'pass'` (the M receipt has no non-pass entry, so this is tight).
3. Require `summary.failed === 0` as a number (`!== 0` fails, so absent/string fails) and require `summary.cases === cases.length`, `summary.passed === cases.filter(c => c.status === 'pass').length`, `summary.missing === 0`.
4. Read `receipt.controls`: require a non-empty array, unique ids, and the same `fixtureFile`/`fixtureSha256` committed-blob binding used for required cases.
5. Make the flags-off/positive substance checks look at every match (`cases.filter(...)`), or let rule 1 subsume them.
6. Add `duplicate_case`, `control_failed`, `summary_failed_absent` to the synthetic probe table (`:430-455`) so regressions surface in `probesOk`.
Repair cost is one pass over the receipt; no browser re-run.

Limits of this attack: it forges the committed certificate, not the run; the counter's documented browser-replay limit is untouched. No lanes outside the counter were modified. No `jj`, no git write in LANE, no tool installs (node v24.21.0 was already present).

Evidence retained: `/tmp/tabi-r17w2-ForgeC2Counter-ENaP/{forge-c2.mjs,forge-c2b.mjs,rerun-results.mjs,forge-results.json}` and the 23 commits named above (all `cat-file`-readable, parent = M).

Files written: `.ufo/waves/round-17/w2/ForgeC2Counter.md` (this report); sandbox evidence under `/tmp/tabi-r17w2-ForgeC2Counter-ENaP/`.
