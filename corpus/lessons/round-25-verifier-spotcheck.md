# Round 25 verifier spot-check

author: hyaku closure (non-author integrator, @m_flash)

## Conformance

- Report attribution: `git log --format='%an %H' -- .ufo/reports/round-25/tabi.md` → `tabi-shokunin b15d33969175b0d825687560e22eec0bc9192793`; report is lane-attributed.
- Report hash cited: `8769b2e06119ac9d58ea57ddf66cfa476608ace2`; `git merge-base --is-ancestor 8769b2e06119ac9d58ea57ddf66cfa476608ace2 refs/heads/master` → exit 0. Lane state helper: branch master, local=remote=`8769b2e06119ac9d58ea57ddf66cfa476608ace2`, ahead=0. `git status --porcelain` shows only untracked `.ufo/waves/round-25/w2/`; report treats it as session work, but this is uncommitted round evidence and a conformance defect.
- Report initially landed at wrong fleet path `.ufo/waves/round-25/tabi.md` without a SHONEN section, then was re-filed at contract path only on orchestrator prompt. Record both as conformance defects; report is now contract-path, with SHONEN heading present.
- Prompt carries required round contract sections and campaign addendum. W2 (34 items) validated but never dispatched; falsification rests on W1 attack seats and gate mutation selftests. This is a round-shape defect, not evidence of W2 execution.
- Driver digest: `2026-10-25T09:10:16-03:00 launch tabi round=25 pgid=981677 driver=hyaku-inline attempt=1`; `2026-10-25T09:50:22-03:00 complete tabi round=25; hyaku-inline attempt=1`.

## Claims re-checked

- C1 depth, measured commit `870fab29977a2ab8cbee7fbe0e6dc4ef87ff6009`: committed receipt `corpus/evidence/round-25/bfcache/receipt.json`, jq `.summary` → restores=1, navigations=2, goBacks=1, `BackForwardCacheRestore` present, `backForwardCacheNotUsed=0`. Controls JSON → nohistory=0 and disabled=0. Gate committed registry states selftest 17/17; evidence-verified from `SKILL.md` and report, not executed at closure. Verdict improved, no scalar increment.
- C2 freshness, measured commit `870fab29977a2ab8cbee7fbe0e6dc4ef87ff6009`: `jq '.summary' corpus/evidence/round-25/freshness/reopened.json` → reopened=6, resolved=6, unresolved=0, supersessions=0; jq row projection confirms six `holds` and `held_quote == located_quote`. Gate registry selftest 18/18; committed evidence-verified, not executed at closure. Verdict improved.
- Both measurement and report-claimed commits exist in lane object database; tip is verified ancestry. `SCORECARD.md` delta is append-only, 53 lines added, no prior rows removed (baseline-to-tip diff).

## Axis verdicts

| Axis | Verdict | Evidence |
|---|---|---|
| depth | improved | C1 receipt and negative controls |
| freshness | improved | C2 reopened receipt |
| operability | improved | Two new registered gates; selftest tallies evidence-verified |
| coverage | unchanged | No harm/score movement claimed |
| calibration | unchanged | Honest limits; independent spot-check follows |
| adjacency | unchanged | Connector report says no overlap absorbed |

## Discernment spot-check

| Item | Decision | Re-opened source | Agreement | Reason |
|---|---|---|---|---|
| S015 | Admit | https://playwright.dev/docs/actionability | Agree | Current docs explicitly state actionability checks and auto-wait before requested action; matches the held quote. |
| S106 | Admit | https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/content/public/common/content_features.cc?format=TEXT | Disagree | Reader returned only a tiny text transfer with no readable cited feature lines; the claimed exact source quote was not independently verified here. |
| WebMCP devtools candidate | Reject | `corpus/lessons/round-25.md` §Gate; re-opened current WebMCP specification at https://webmachinelearning.github.io/webmcp/ | Agree (bounded) | Specification describes WebMCP API but does not establish behavior of DevTools `list_webmcp_tools`/`execute_webmcp_tool`; refusal of those behavioral claims is prudent. It does not independently validate the malformed staged registry-row issue. |

## Trends and routing

- expansion: improved, one new S106 and bfcache runtime knowledge entry; not equated with a higher scalar.
- quality: improved for C2's six bounded quote checks; no general corpus-wide re-certification.
- discernment: unprovable-but-better; agree on S015 and refusal, disagree on S106 source support. Mismatch must be carried as a lesson/criterion next round; outside spot-check does not validate all lane decisions.

Routed defects for next round: (1) report path/SHONEN omission was repaired only after orchestrator prompt; ensure report is contract-path and complete before handoff. (2) W2 34-item attack batch was validated but not dispatched; dispatch if required, otherwise explicitly report coverage limitation and do not claim wave-2 falsification. (3) round-tip untracked `.ufo/waves/round-25/w2/` must be resolved/committed by its owner; closure does not modify lane work. (4) S106 exact source line was not recoverable through independent source reopen; provide resolvable decoded source evidence. No promotions or mints.
## Erratum — closure re-check

Re-opened S106 correctly by decoding the base64 response:
`curl -s 'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/content/public/common/content_features.cc?format=TEXT' | base64 -d | grep -n -A1 'BackForwardCache,'`
→ line 187 `BASE_FEATURE(kBackForwardCache, base::FEATURE_ENABLED_BY_DEFAULT);`, matching S106's cited decoded lines 186–187. The S106 spot-check is **agree**, not disagree. The S015 admit and the candidate rejection also agree. Thus calibration is unchanged, not harmed; S106 claim support is verified.

The original closure entry was internally inconsistent: the axis table recorded calibration unchanged while the ledger said harmed. The corrected verdict remains `admitted=false`, but reason is honest-stop rather than harmed: W2's 34 validated attack items were not dispatched, so full intended falsification coverage was not executed. Report-placement/SHONEN conformance defects remain status-neutral; the untracked W2 material remains unresolved. No axis is harmed.