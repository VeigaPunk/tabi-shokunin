# ScoutLessonRefs — evidence-pointer resolution sweep (round 29, w2)

Measured in a clean `git clone --shared` of 32008a453737a27f69e9ab401d0b9775d2a944f7 (checkout, `git status --porcelain` = 0 lines). Lane HEAD at measurement `e1e3a15f`; tip is an ancestor of it (`merge-base --is-ancestor` exit 0). Read-only; no tools installed. Scratch removed after.

## Scope as found
| document | present at tip | note |
|---|---|---|
| `corpus/lessons/round-29.md` | **NO** (`git ls-tree` lists lessons up to `round-9.md`, `training-round-11.md`, `user-20261015-r01..r06.md`; nothing for round 29) | not a dangling pointer — nothing cites it; no round-29 lesson exists to sweep |
| `LOG.md` round-29 entry | yes, `LOG.md:1989-2013` | swept |
| `SCORECARD.md` round-29 | only one section: `## Round 29 — corrections`, `SCORECARD.md:1458-1466` | swept; no other round-29 section exists (grep `round 29/round-29/r29` hits only :1458, :1460) |
| `corpus/knowledge/chromium-156-release-pin-recheck.md` | yes, 100 lines | swept |
Extra (found while resolving; same round-29 citations): the seven appended `## Round-29 recheck` notes in the citing knowledge entries.

## Method
Python extractor (backtick tokens, 7-40 hex hashes, `FILE.md:N[-M]`) over the three documents' round-29 spans → 80 raw tokens; resolved against the checkout (file exists / line in range / `git merge-base --is-ancestor <h> 32008a45` / `git cat-file -t`). Chromium basenames resolved against `corpus/evidence/round-29/release-pins/bytes/{154.0.8037.97,156.0.8078.47}/…`; line pointers resolved by reading the lines. Receipt: all 80 `old_bytes`/`new_bytes` paths exist, every recorded sha256 equals the file's sha256 (0 bad).

## Pointer table
| doc:line | pointer | resolves |
|---|---|---|
| LOG:1992 | `.ufo/waves/round-29/claims.json` | yes (tracked) |
| LOG:1993 | commit 97be89bc66139eb45526a04af59a35dccc006eb9 | yes, ancestor, commit |
| LOG:1994 | commit 856fa9e1202179f5cfbd28c1f0efdd4eb1f426bb | yes, ancestor, commit |
| LOG:1995 | `.ufo/waves/round-29/baseline/` | yes (21 tracked files) |
| LOG:1996 | `scripts/check-s106-evidence.mjs` | yes |
| LOG:1999 | `corpus/evidence/round-29/s106-selftest/mutation.txt` | yes; contains `CASE id=measured-revision-bytes-mismatch … FAIL` as claimed |
| LOG:2007 | `scripts/check-freshness.mjs`; `LOG.md:221` | yes; LOG.md:221 = `exit 0. --self-test → … cases=8` (correction target correct) |
| LOG:2011 | `corpus/knowledge/chromium-156-release-pin-recheck.md` | yes |
| LOG:2012 | commit 59e8167aa5a4399e4115e7253fa0bab5e8dd773d | yes, ancestor, commit |
| LOG:2002-2004 | S108, S109–S115, the 7 citing entries | S108–S115 rows exist in `corpus/SOURCES.md` (:122 …); 7/7 entries carry `## Round-29 recheck` note |
| SC:1460 | `.ufo/waves/round-29/claims.json` | yes |
| SC:1463 | `scripts/check-sources.mjs`; `SCORECARD.md:410` | yes; :410 = `… cases=25` (stale, correct target) |
| SC:1464 | `scripts/round-evidence-audit.mjs`; `SCORECARD.md:1138-1139`, `:1151` | yes; :1139 and :1151 carry `12/12`, :1138 is the preceding text line |
| SC:1465 | `scripts/check-selfassessment.mjs`; `SCORECARD.md:1439` | yes; :1439 = `selftest baseline 17 cases` |
| SC:1466 | `scripts/check-s106-evidence.mjs`; `SCORECARD.md:1438` | yes; :1438 = `5 cases at baseline` |
| REC:3 | `…/chromiumdash-stable-linux.json`, sha256 `90abf2c3…fe33` | yes; actual sha256 `90abf2c3efe7…7fd7fe33` (the `90abf2c3` is a sha256 prefix, not a git object — not an ancestor candidate); quoted `"previous_version":"155.0.8059.84","time":1792526230889,"version":"156.0.8078.47"` present verbatim |
| REC:4 | `…/release-pins/receipt.json`, `…/bytes/` | yes; fields `normalization`, `raw_new_sha256` (REC:98-99) present |
| REC:21 | `scripts/check-release-pins.mjs` (`--rev`, `--stable`); commit 97be89bc | yes; flags present; ancestor |
| REC:25-47,53,58,62,68,71 | 23 Chromium basenames (idl, json5, pdl, cc, h, mojom, html, js) | all 23 per-tag files exist for both tags (46 byte files) |
| REC:78-82 | 7 knowledge entries (`webmcp-invocation-round-17`, `source-recheck-round-18`, `harness-hardening-round-18`, `webmcp-declarative-validation-round-19`, `webmcp-completion-lifecycle-round-20`, `webmcp-nonautosubmit-round-21`, `-21-corrected`) | all exist; each ends with the round-29 note |
| REC:47-62 | 156 line pointers `html_form_element.cc 201-210`, `model_context.cc 567-574`, `script_tool_types.h 46` (and 17-21), `html_select_element.cc 1077` | all land on the quoted text (checked in the 156 bytes) |
| REC:58 | "S080 and S081 have no citing knowledge entry" | true (`git grep S080\|S081 -- corpus/knowledge` → only the recheck file) |
| REC:89 | `.ufo/waves/round-29/w2/` | **absent at tip** (untracked; exists in the lane working tree for w2 output) — see D2 |

## Dangling or inaccurate pointers
| id | where | pointer | defect |
|---|---|---|---|
| D1 | `corpus/knowledge/webmcp-invocation-round-17.md:146` (round-29 S045 note) | "`154:113 → 156:134`" | **wrong line.** 156 line 134 of `executeTool-abort.https.html` is `  const signal = AbortSignal.abort('already aborted');`. The verbatim 154:113 line `assert_equals(executionRejectionValue, 'already aborted');` is at **156:143** — which is what the recheck note's own table (REC:S045 `113-113→143-143`) says. Internal contradiction; the other half (`154:87 → 156:108`) is correct. |
| D2 | `corpus/knowledge/webmcp-invocation-round-17.md:146` (`.ufo/waves/round-29/w1/CritSemanticDrift.md` §2) and `chromium-156-release-pin-recheck.md:89` (`.ufo/waves/round-29/w2/`) | w1/w2 report paths | **do not resolve at 32008a45**: `git ls-files .ufo/waves/round-29` lists only `claims.json`, `r28-wave-accounting.md` and `baseline/*`; no `w1/`, no `w2/`. They exist only as untracked files in the lane working tree (`w1/CritSemanticDrift.md` has `## 2.` at line 61). Resolves iff the wave reports are later committed. |
| D3 (minor) | knowledge notes: `html_form_element.cc 156 :201-209` (harness-hardening-18, declarative-validation-19, source-recheck-18) vs `:201-210` (REC, lifecycle-20, nonautosubmit-21/-corrected) | guard-range | not dangling; two spans for the same block. Bytes: comment 201-202, `if` 203-209, blank 210 — both land inside the block, `201-209` is the tight one. |

All other pointer boundaries spot-checked against 154→156 first/last lines of the same anchor: `model_context.cc 528-580→527-577, 748-811→744-807, 752-811→748-807`, `html_form_element.cc 192-258→193-269, 174-328→175-339, 635-842→673-880, 729-751→767-789, 729-758→767-796, 818-842→856-880, 212-218→223-229, 181-186→182-187, 818-830→856-868, 298-319→309-330, 290-319→301-330, 720-815→758-853, 834-842→872-880` — each maps to the same opener/closer line text.

## Totals
80 raw tokens extracted from the three docs (+ 7 appended notes, 25 line ranges spot-checked). Dangling: 0 files, 0 hashes, 0 out-of-range lines in the three named documents. Defects: 1 wrong line number (D1, in a sibling knowledge entry), 2 paths that resolve only in the untracked working tree (D2). `corpus/lessons/round-29.md` is absent at tip (no pointer to it exists).
