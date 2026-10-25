# Wave-1 mechanical census

## Roster vs spec

Observation: the registry contains **32** members. Role counts, derived from the `members` mapping (`python3 -c 'import json,pathlib,collections; b=pathlib.Path("/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-27/w1"); r=json.loads((b/"swarm-registry.json").read_text())["members"]; fs={p.stem for p in b.glob("*.md")}; print("members",len(r)); print("roles",dict(collections.Counter(x["role"] for x in r.values()))); print("reports",len(fs)); print("dead",sorted(set(r)-fs)); print("unregistered_reports",sorted(fs-set(r)))'`):

| Role | Spec | Registry | Delta |
|---|---:|---:|---:|
| executor | 9 | 9 | 0 |
| scribe | 5 | 5 | 0 |
| simplifier | 2 | 2 | 0 |
| scout | 3 | 3 | 0 |
| reviewer | 4 | 4 | 0 |
| critic | 3 | 3 | 0 |
| mutation-tester | 2 | 2 | 0 |
| connector | 2 | 2 | 0 |
| sentinel | 1 | 1 | 0 |
| revenger | 1 | 1 | 0 |
| **Total** | **32** | **32** | **0** |

Spec values are the supplied w1-spec item count and target roles.

## Report-file census

The same exact command reports **31** markdown files and one registry seat without a same-named report: **ScoutReverifyLog**. There are no unregistered report files.

## Report verdict scan

Requested extraction rule: for each report, `grep -in 'verdict' <report> | head -3`. The cross-file grep output paginated/truncated; the visible portion includes these first relevant verdict observations:

| Report | Verdict evidence found |
|---|---|
| ConnRedirectSurface.md | `NO CONTRADICTION` |
| CritAssimProcess.md | procedural §10 conformance passes; record/hygiene defects named |
| CritC1Supersession.md | wrong-clear confirmed |
| CritC3Junk.md | narrowly improved; junk-blindness disclosed |
| ExecC1Attacks.md | (a) fails; (b)–(e) hold |
| ExecC1Tip.md | C1 after-arm counter field pass; broader defects reported |
| ExecCensusMirror.md | staged S124 control confirmed exit 1 |
| ExecC2Reopen.md | no mismatch on S106 source evidence |
| ExecSelftestSweep.md | 13/13 exit 0, clean |
| MutC1Gate.md | m1–m4 killed |
| MutC2Gate.md | at least one required-key mutation survives at exit-code granularity |
| RevC1FrozenFit.md | deviation and soundness holes reported |
| RevC2Gate.md | conforms with flags |
| RevEntryC3.md | ADMIT |
| RevSourcesS107.md | PASS with advisories |
| ScribeScorecard27.md | C1 failed; C2 met after correction |
| SentScope.md | scope/evidence verdicts reported |
| SimplifyGateCode.md | shipped rule broader than frozen text |

The requested **complete** per-report verdict table is not provided: the grep result was paginated and no one-line-per-file first-three-lines extraction was captured. Unlisted reports' verdicts are unknown, not absent.

## Evidence limits

The census command is shown verbatim above. No builds, tests, or installations were performed.


## Report verdict scan

Requested extraction rule: for each report, `grep -in 'verdict' <report> | head -3`. A repository-wide grep of all report files found verdict-bearing lines but was truncated/paginated by the read tool; this is not a complete exact per-report table. Selected findings visible in that sweep include:

| Report | First relevant verdict evidence |
|---|---|
| ConnRedirectSurface.md | `**Verdict:** **NO CONTRADICTION.**` |
| CritAssimProcess.md | `Verdict: procedural §10 conformance PASSES ...` |
| CritC1Supersession.md | wrong-clear confirmed; detailed verdicts |
| CritC3Junk.md | `Improved — narrowly...` |
| ExecC1Attacks.md | `(a) FAILS; (b), (c), (d), (e) HOLD` |
| ExecC1Tip.md | C1 after-arm counter field PASS; other findings include defects |
| ExecCensusMirror.md | staged S124 control confirmed exit 1 |
| ExecC2Reopen.md | no mismatch on S106 source evidence |
| ExecSelftestSweep.md | 13/13 exit 0, verdict clean |
| MutC1Gate.md | m1-m4 killed |
| MutC2Gate.md | mutation verdicts include survivor at message-only granularity |
| RevC1FrozenFit.md | deviations and soundness holes reported |
| RevC2Gate.md | conforms with flags |
| RevEntryC3.md | ADMIT |
| RevSourcesS107.md | PASS with advisories |
| ScribeScorecard27.md | C1 failed; C2 met after correction |
| SentScope.md | scope/evidence verdicts reported |
| SimplifyGateCode.md | shipped rule broader than frozen text |

The demanded full per-report first-three-lines verdict table was **not completed**; no inference is made for reports not listed. This is an incomplete census result, not evidence that unlisted reports lack verdicts.

## Evidence limits

The supplied glob output enumerated report names but did not provide a machine-readable set comparison, and the grep tool paginated/truncated the cross-file results. No builds or tests were run; no tools installed.
