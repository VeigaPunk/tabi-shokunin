# ReconMistakes — round-17 mistake sweep (read-only recon)

VERDICT: ISSUES

Snapshot. Baseline HEAD `5859243183c4d7ac5429dfdb8a73ce0d9a43d583` (round-16 spot-check commit).
The lane was being written throughout this sweep: at 12:49–12:53-03:00 the worktree showed
`M scripts/{check-round-contract,check-user-round-contract,check-measurement-binding,
selftest-measurement-binding}.mjs`, new `scripts/check-adjacency.mjs`, and untracked
`corpus/evidence/round-17/` + `.ufo/waves/round-17/`. Final read 2026-10-20T12:53:07-03:00.
Anything called "landed" below is an **uncommitted worktree artifact**; nothing in
`corpus/evidence/round-17/` is committed yet (`git status --porcelain` → `?? corpus/evidence/round-17/`).
QUALITY still has 25 criteria (`grep -c '^[0-9]\+\. ' corpus/QUALITY.md` → `25`);
`corpus/lessons/round-17.md` does not exist.

Method: read `corpus/lessons/round-1{2,3,4,5,6}-verifier-spotcheck.md`, the matching
`round-N.md ## Mistakes`, `corpus/QUALITY.md:1-101`, the routed evidence trees, PROVINCE/SKILL
registry rows, and `.ufo/waves/hyaku/jj-w1/reports/{JjAuditTabi,JjTrialTabi}.md`. Every row
carries a file:line or a command with its observed output.

## 1. Closed before round 17 (checked; not open)

| Item | Disposition evidence |
|---|---|
| r12:204 FreshBidi collector timing | `corpus/knowledge/webdriver-bidi-capability-matrix.md:130-166` ("Dated correction — 2026-10-20 (round 13)") |
| r12:207 FreshRetry gzip-vs-decoded bytes | `.ufo/waves/round-12/w1/FreshRetry.txt:132-176`; file is tracked (`git ls-files` returns it) |
| r12:211 citation precision | `corpus/knowledge/playwright-accessible-locators-and-snapshots.md:69-74` |
| r12:199 SHONEN/census/PSTACK fixtures | cases `canonical_shonen`, `canonical_shonen_census` in `corpus/evidence/round-14/executions/roundSelfTest.json`; QUALITY16 `corpus/QUALITY.md:42` |
| r13:158 / :159 / :160 / :163 | r14 C2 + QUALITY18 `QUALITY.md:54`; r15 erratum `round-15-verifier-spotcheck.md:90-101`; `SKILL.md:1728-1734` (documents `--witness`, nested child exits, 20+1 tally); non-author erratum appended at `round-13-verifier-spotcheck.md:163` |
| r14:184 / :186 / :187 | r15 erratum; QUALITY20 `QUALITY.md:65`; QUALITY21 `QUALITY.md:72` |
| r14:188 S029 traceability | `corpus/evidence/round-15/source-index.json` `"sourceRows":["S029"]` |
| r15:120-122 counter identity, measured≠delivered | QUALITY22 `QUALITY.md:78`; `corpus/evidence/round-16/measurement-binding.json` (2 claims, counter sha per claim) |
| r15:123 erratum adoption | round-16 SKILL section points at it (`round-16-verifier-spotcheck.md:105`) |

## 2. Round-16 routed 1–3: fix present in the worktree, UNCOMMITTED — must be committed and counted

| # | Source | Observed at 12:53 |
|---|---|---|
| r16:148 unrooted liar probe | `round-16-verifier-spotcheck.md:148` | `corpus/evidence/round-17/routed/liar/` now holds `generate.mjs`, `blobs/{gate,selftest}.mjs`, `originals.bundle`, `receipt.json`, `run.stdout.txt`. Receipt `verdict:"pass"`, `issues:[]`, `identityReproduced:true`; `git bundle verify originals.bundle` → rc=0, requires base `b444ca8e…`, `list-heads` → the three recorded commits `9ecfcc9`/`0754e44`/`7b497d1` under `refs/heads/v1-full-liar|v2-…|v3-…`. Falsification is real: hardened counter counts 0/0/0 on the liars and 1 on honest `b444ca8`, while the pre-hardening counter counts `liar-v1:1`, `liar-v3:1` (`checks.preHardeningCounts`). Caveat observed at 12:52:24: an earlier receipt.json in the same minute said `verdict:"fail"` with `identityReproduced:false` while `run.stdout.txt` already said `verdict=pass`; the pair now agrees, but the transient mismatch means the final pair must be re-read at commit. |
| r16:149 pre-hardening receipts | `:149` | `corpus/evidence/round-17/routed/binding-hardened/{selftest,legacy-r15,check-at-1205d26}.json` + `index.json`. `selftest` exit 0 at cwd 3254740, gate `"1f84fb54…dde8b1f6"`; `legacy-r15` exit 1 at `--at 36240c70…`; `index.registeredGate` equals `git show 3254740:scripts/check-measurement-binding.mjs \| sha256sum` → `1f84fb54…`. `index.history` labels the two r16 files as history; `index.labelForAppendOnly` names LOG.md/README as L1-owned — **that append is not done**: `grep -n -i 'pre-hardening' LOG.md corpus/README.md` → no output. |
| r16:150 delivered-HEAD receipt | `:150` | `check-at-1205d26.json` argv `--check corpus/evidence/round-16/measurement-binding.json --at 1205d261… --reproduce`, exit 0, `manifestSha256 72c77ed4…`; `git show 1205d26:corpus/evidence/round-16/measurement-binding.json \| sha256sum` → `72c77ed4a32038416f094b2ca685c5a2de9fbe29739f298663615706d1caee64`. Internally consistent. Still needs commit; `.ufo/reports/round-16/tabi.md:69` still states the un-receipted "again at `1205d26`" and is immutable history. |

## 3. Still open — no QUALITY criterion and no landed fix

| # | Item | Source | Evidence (why open) |
|---|---|---|---|
| A4 | Census U3 → README supersession pointer | `round-16-verifier-spotcheck.md:151` | `corpus/knowledge/browser-surface-census.md:188` (U3) and `:153`; `grep -n 'README\|supersed'` over that file → only `:201` (tmp path) and `:253` (daemon). No in-file pointer to `corpus/README.md:295-317`. Routed `PLAN.md:167`; README is L1-only. |
| A5 | Integrator CDP ruling unrecorded | `:152` | `PROVINCE.md:1-19` (whole file): `:9` owns "CDP session discipline", `:15` refuses forensics to revenger/kaidoku; neither records tabi-owns-page-tools / kaidoku-cites-tabi. Routed `PLAN.md:166`; PROVINCE is L1-only. |
| A6 | "unforgeable" overstatement | `:76` | `grep -rn 'unforge' tabi-shokunin .ufo/reports/round-16 .ufo/waves/round-16` → **only** `round-16-verifier-spotcheck.md:76`, plus round-17 `PLAN.md:169` and `w1/spec.json` prompts. No committed author byte contains the word (fleet report `:1-160`, lane LOG/SCORECARD, wave files). Two gaps: the routed quotation is unanchored, and QUALITY25 (`QUALITY.md:97`) governs counter trust, not the scope of a finite-probe claim; `round-16.md ## Mistakes` has no row for it; QUALITY still 25. |
| B1-B5 | r07 survivor replay; user-record freezing; IPv6 origin classification; unpinned external validator; Git env/hooks/config/PATH trust | `round-13-…:161`, `round-14-…:189`, `round-15-…:124`, `round-16-…:155`; restated `round-16.md:110-111`; debt text `SKILL.md:1682-1684`, `:1726-1727` | `grep -n -i 'r07\|survivor\|IPv6\|external validator\|user-record' corpus/QUALITY.md` → exit 1, no output. `scripts/check-user-round-contract.mjs:144-153` protects round lessons/SHONEN only, not `user-2026*` records. QUALITY21 `QUALITY.md:75-77` only *scopes counter safety away from* the Git environment; it requires no fixture or hardening. No fix in flight for any of the five. |
| C1 | Sidecar byte identity not checked by the checker | `round-14-…:185` (last sentence) | `scripts/check-aria-metadata.mjs:147-158` `ANCHORS` pins receipt/pin/producer/spec/config/manifest/worker but no sidecar digest; `:1112` only *reports* `sha256: sidecarRead.entry.sha256`. `round-15-…:88` rejects whole-sidecar authentication as a claim, so the gap stays unencoded. No criterion. |
| C2 | 8/11 pre-commit producer not retained | `round-16-…:155` | `round-16.md:93` "residual: the 8/11 run is not reproducible" (producer `cedccdf9…` in no commit). QUALITY17 `QUALITY.md:48-53` covers negative-control cause and worker aggregation, not retention of a failing run's producer. |
| C3 | Disclosed limits unencoded: counter runs revision code unsandboxed; confinement page-level only; protocol-capture profile leaks a temp dir per run | `round-16-…:76,155` | No criterion names any of the three (QUALITY18/23 do not). |

## 4. Protocol/operator debt (not lane-fixable; carried five consecutive closures)

`round-12-verifier-spotcheck.md:215`, `round-13-…:162`, `round-14-…:190`, `round-15-…:123`,
`round-16-…:153`: frozen step-1/step-4 closure-checker certification for current inputs is absent;
each closure states its manual checks do not substitute. No QUALITY criterion by design (not tabi-owned).

## 5. jj HEAD-anchoring class — C1 code in flight; criterion and registry rule still absent

| # | Finding | Evidence |
|---|---|---|
| E1 | Gates certified a jj-owned, unlanded HEAD | `JjAuditTabi.md:323-340` (F1 `jj new`: clean verdict on a commit on no branch; F2 `jj commit`: clean while `master` is the old tip). At baseline `git show HEAD:scripts/check-round-contract.mjs \| grep -c laneTip` → 0. In-flight fix: `laneTip()` at `scripts/check-round-contract.mjs:90-100` and `scripts/check-user-round-contract.mjs:137`; at 12:52 both files had **0** remaining `(show\|list\|blob)(…,'HEAD',…)` wrapper reads (`grep -cE`). Uncommitted. No QUALITY criterion for the anchoring rule. |
| E2 | Witness `committed` false positive | `JjAuditTabi.md` F3; baseline HEAD numbering `scripts/check-user-round-contract.mjs:794,878,953` compare the worktree blob to the HEAD blob. C1 contract `PLAN.md:64-66` requires lane-tip comparison; in flight. |
| E3 | `check-freshness --witness` accepts literal `HEAD` | `scripts/check-freshness.mjs:51` (`argumentsOf` accepts any value not starting `--`), F6. Byte-frozen (`PLAN.md:47-53`); routed mitigation is a SKILL invocation rule, but `grep -n 'refs/heads/master' SKILL.md` → no hits, so it is **not landed**. No criterion. |
| E4 | Audit inventory undercounts HEAD call sites (the artifact PLAN cites) | `JjAuditTabi.md:320` claims "12 are live HEAD-anchored (R1), 4 are live `rev-parse HEAD` receipt fields (R2)". At baseline the source had **16** wrapper data reads in `check-round-contract.mjs` production (lines <611: `:170,173,177,266,466,487,500,517,520,538,540,548,565,584,585,587`) and **21** in `check-user-round-contract.mjs` (<1069: `:251,273,275,283,359,464,495,514,533,546,560,562,580,582,590,607,628,629,631,815,899,974`), plus the literal sites (`round:119,231,504,1007`; `user:167,308,326-327,529,790,874,955`). The audit counted only direct `git(...)` argv literals and omitted every `show`/`list`/`blob(root,'HEAD',…)` call; `PLAN.md:14-16` repeats "12 live reads". The in-flight edit anchored the wrappers anyway, so the risk did not materialize, but the routed inventory is wrong and is what an auditor would re-use. |
| E5 | `JjTrialTabi` overstates colocation safety | `JjTrialTabi.md:133` — "All three read objects by hash/ref … never `HEAD` or the index — colocation-transparent". Contradicted by E4 and by the audit's F1/F2. Step 5 ran after step 4 pushed `f8380e3`, i.e. detached HEAD == master tip; parity was a positive-state-only observation with no negative control (cf. QUALITY17's positive-control bar). No lesson row, no criterion. |
| E6 | Fleet helper hazards | `JjAuditTabi.md` F5 (`jj-lane.sh:67` claims read-only `state` but `:78` `git status` rewrites `.git/index`; `GIT_OPTIONAL_LOCKS=0` changes it); `JjTrialTabi.md` step 4 (`committed 5b63f7b0…`, `pushed f8380e3…` — only `pushed` is citable). Fleet-owned; no criterion. |
| E7 | QUALITY22 names the unsafe anchor | `QUALITY.md:78-80` — "re-run at the delivered HEAD". Under jj that name may be an unlanded/empty commit (E1); the one criterion touching the anchor never defines "delivered HEAD" as the lane branch tip. |

## Residual unknowns

- Whether the uncommitted routed artifacts are committed unchanged; the liar receipt's verdict
  flipped fail→pass within 12:52:14–12:52:24, so the final pair must be re-read at commit.
- Whether the C1 counter's entry list (not yet written; `.ufo/waves/round-17/` has spec files only)
  scores wrapper sites or only end-to-end outputs — E4 stays relevant either way.
- Whether kaidoku lands its half of the r16 ruling (`round-16-verifier-spotcheck.md:152`); outside this lane.

Files written:
- `.ufo/waves/round-17/w1/ReconMistakes.md`
