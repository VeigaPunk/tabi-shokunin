# round-23 verifier spot-check — tabi (non-author)

author: hyaku closure (non-author integrator, @m_flash)

Round 23 closed by the hyaku orchestrator's non-author integrator, which did not author this
round. Baseline `a89f1935f523a64b00991d792fca6a8c0d321948`; reviewed lane tip
`c90dffd3807a68de7ab9c6503273eeddbcd03e2b` (state: `branch=master local=c90dffd remote=c90dffd
ahead=0 behind=0`). Driver digest: launch `2026-10-25T04:04:05-03:00 attempt=1`, complete
`2026-10-25T04:41:18-03:00` — one attempt, no silent window.

## 1. Conformance (PROTOCOL §Round-robin closure step 1)

| Check | Command | Observed | Result |
|---|---|---|---|
| Report committed by the lane identity | `git log --format='%an %H' -- .ufo/reports/round-23/tabi.md` | `tabi-shokunin 71158891…`, `tabi-shokunin 01bbb46d…`, `tabi-shokunin 2384d57d…` | pass — convention matches the other lanes (`kama-shokunin`, `mado-shokunin`) |
| Report is not a marker | `grep -n '^## SHONEN' -A6 .ufo/reports/round-23/tabi.md` | heading present, 4 box lines (`[~]`), each with a pointer | pass — substantive, not a completion marker |
| Minimum content | report body | work performed, landed-changes table with 7 rows, Sources & frontier, 3 trend verdicts, Honest bounds | pass |
| Cited lane commits exist and are ancestors | `git -C tabi-shokunin merge-base --is-ancestor <h> master` for `03c1b4d 7ac9fff dfae5cd add37e7 af00b59 2433ed2 43e9bb5 e059a8f b905efb c90dffd` | all `ancestor` | pass |
| Lane pushed | `scripts/hyaku/jj-lane.sh state tabi-shokunin` | `ahead=0 behind=0` | pass |
| No uncommitted round work | `git -C tabi-shokunin status --porcelain \| wc -l` | **89** (2 `M`, 87 `??`) | **FAIL** — see routed defects 2–3 |
| Prompt carries the template contract | `grep -n '^## ' .ufo/prompts/tabi-round-23.md` | §1 MISSION/AXES, §2 Claims, §2b Frontier, §3 L2 floor, §4 Report contract, §5 Commit/push, §6 hyaku addendum | pass |
| Report cites the tip it was written against | `git log -n1 --format='%ci' c90dffd` vs report commit time `04:41:05` | `c90dffd` at `04:40:48` | pass — the cited tip existed 17 s before the report landed; no future-dated citation |
| Report is not a post-filing rewrite | three commits on the report path, all `04:37:21 / 04:38:47 / 04:40:52`, completion `04:41:18` | all pre-completion | pass — successive drafts, not an erratum-less rewrite of filed bytes |

## 2. Claim re-check

C1 and C2 are re-derived from **committed bytes** below. Where a claim rests on the lane's own
gate, PROTOCOL §Gate standard binds: the committed evidence was verified and the gate was **not**
executed by the integrator.

### C1 — operability, capability acquisition (0 → 6 defect classes)

| Arm | Command run by the integrator | Observed | Matches report |
|---|---|---|---|
| before | `git cat-file -e a89f1935…:scripts/round-evidence-audit.mjs` | `fatal: … exists on disk, but not in 'a89f1935…'`; **exit 128** | yes (0 classes: no instrument) |
| after (structure) | `git show 03c1b4d:scripts/round-evidence-audit.mjs \| grep -nE '"c[1-6]-…"'` | six class ids at lines 39–44: `c1-refusal-arithmetic`, `c2-wave-caps`, `c3-gate-spotcheck`, `c4-stale-attempts`, `c5-registry-identities`, `c6-landed-log-binding` | yes (6 classes) |
| measurement receipt | `git show 03c1b4d:corpus/evidence/round-23/c1-measurements.json` | `before.classes 0`; `after[0] rev a89f1935 exit 1, classes 6, per-class 6, roundTotal 129`; further revisions `e3cf4e0` (4), `47bfb5f` (4), `fbee618` (6) recorded, not smoothed | yes |
| self-test tally | `git show c90dffd:scripts/round-evidence-audit.mjs \| grep -c 'runFixtureCase('` | **14** occurrences = 1 definition + **13 cases** (12 at `03c1b4d`) | report says 12 cases — **defect 4** |

Verdict: **improved** (evidence-verified: the six predicates are committed, the baseline has no
instrument, and the receipt records the revision it was measured against). The gate interface is
**not** graded conformant: `git show c90dffd:SKILL.md | grep -c 'round-evidence-audit'` → **0**,
so the lane's registry home carries no row for this gate (§Gate standard, Registry/Closure
consequence).

### C2 — coverage, one staged entry admitted (0 → 1)

| Arm | Command run by the integrator | Observed | Matches report |
|---|---|---|---|
| before | `git grep -lE '^source: S10[23] ' a89f1935… -- corpus/knowledge \| wc -l` | **0** | yes |
| after | same at `03c1b4d` and at `c90dffd` | **1** (`corpus/knowledge/csrf-defense-shape-boundary.md`) | yes |
| added files | `git diff --diff-filter=D --name-only a89f1935 c90dffd` | empty | pass — nothing deleted |
| registry rows | `git show <rev>:corpus/SOURCES.md \| grep -cE '^\| *S[0-9]{3} '` at `a89f1935` / `03c1b4d` / `c90dffd` | **101 / 103 / 103** | yes (rows 101 → 103) |
| census | `scripts/sources-census.sh validate --root … tabi` | exit **0**, 16 `W04` duplicate-URL warnings, 103 rows | yes (16 W04 at both ends) |

Verdict: **improved**.

### Owning-axis harm

`git diff --shortstat a89f1935 c90dffd` → `1149 files changed, 248333 insertions(+)`, **0
deletions**, and `git diff --diff-filter=D` is empty: every change is an addition, so no prior
round's bytes were rewritten. `SCORECARD.md` moves by one appended block
(`## Round 23 — declared claims`, `## Round 23 — executed disposition`, corrections block).
Axes: **depth, freshness, calibration, adjacency — unchanged** (no scalar moved, no prior
evidence byte touched).

## 3. Discernment spot-check (LEARNING.md §"Discernment is checked from outside")

re-opened at 2026-10-25, independently of the lane's own fetch:

| Item | Decision | Re-opened source | Agree/disagree | Reason |
|---|---|---|---|---|
| S102 `draft-ietf-httpbis-rfc6265bis-13` §8.8.1 | admit (tier A, `mined`) | `curl https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-13.txt` → 146976 bytes, sha256 `062239316659673b9373865352e8ec5cb710c3d5fe66eedceacfaa6d34d85fbf`; line 2815 carries “"SameSite" cookies offer a robust defense against CSRF attack when deployed in strict mode, and when supported by the client” | **agree** | bytes and digest match the row; the 20-word quote is verbatim at the stated line; the row's limit ("one layer") is the draft's own next sentence |
| S103 OWASP CSRF Prevention Cheat Sheet | admit (tier B, `mined`) | `curl …Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html` → 157809 bytes, sha256 `6f32bfbf96bda9fc4bccfad8edf6d3ff09559b4b12bb869f9f425051c4872312`; both headings present; “A user-friendly defense that is particularly well suited for AJAX or API endpoints is the use of a custom request header” found on stripped text | **agree** | bytes and digest match; the 21-word quote resolves; the heading anchors are real |
| Reject (a) `webmcp-429-counters-and-residency-friction-r26.md` | refuse-now | `git grep -niE 'residen\|datacenter\|ASN\|proxy type' c90dffd -- corpus/knowledge SKILL.md \| wc -l` → **18**; `sed -n '151,152p' /home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md` → S246/S247 exist | **agree** | the refusal's counting command reproduces; the candidate does cite rows the lane does not hold |
| Reject (b) `agent-approval-handshake.md` | refuse (duplicate ground) | `git grep -nE 'autoConnect\|filesystemRoot\|allowedUrlPattern\|redactNetworkHeaders' c90dffd -- corpus/knowledge SKILL.md corpus/SOURCES.md \| wc -l` → **0** | **agree** | the "vocabulary only, no bin moves" finding reproduces exactly |
| Reject (c) `webbridge-daemon-handshake-amendment-r14.md` | refuse (dangling parent) | `sed -n '65p' …/SOURCES.append.md` → staged `S160` exists, lane holds none; `ls corpus/knowledge \| grep -c amendment` → 0 | **agree** | the parent amendment is absent, so the amendment premise fails |

Register rows added: S102, S103 — the only two `2026-10-25` rows in `corpus/SOURCES.md`. Quote
lengths ≤25 words: 20 and 21. Census `validate` exit 0. Verdict on the lane's own gate:
**5 agree / 0 disagree** for this round's open set.

## 4. Routed defects the lane must fix next round

1. **Gate registry row absent.** `SKILL.md` has no `round-evidence-audit` row (`grep -c` → 0).
   §Gate standard makes the row mandatory for a gate, and closure grades no gate conformant
   without it. Add name · `gate` · entry command · verdict map (`0 clean`, `1 failed`,
   `2 could-not-evaluate`) · self-test command and spelling (`--selftest`) · pinned-value path
   (the fixture expectations and `corpus/evidence/round-23/*.json`) · write scope (stdout/stderr
   only) · owner.
2. **Uncommitted round work at closure — 89 paths.** `git status --porcelain` → 2 `M`
   (`.ufo/waves/round-23/w2/W2LandedCites.md` reworked −23/+19, `W2Simplifier.md` +1) and 87 `??`
   (67 empty numeric-named files at the repo root, `w1-dispatch.err`, `w1-record.err`,
   `w2-dispatch.err`, `w2-record.err`, scratch subtrees, `.ufo/waves/round-23/assimilation/`).
   Two of them are edits **after** the seat reports were committed at `e059a8f`, so the
   committed W2 text and the reviewer output diverge and no correction entry says so.
3. **M5 is still open at the tip.** `git ls-tree -r c90dffd .ufo/waves/round-23/scratch | wc -l` →
   **1,034** paths, **25.7 MB** (`git ls-tree -r -l … | awk` sum). The report promises "a
   follow-up cleanup commit removes the committed scratch"; it never landed, and `.ufo/waves`
   holds 1,139 committed paths for the round.
4. **Stale self-test tally (corrections sweep not applied).** `SCORECARD.md:1139` and `:1151`
   and the report's *Work performed* still say `--selftest` 12/12 and "12-case matrix"; the
   shipped script has **13** cases (`grep -c 'runFixtureCase('` − 1 definition) and
   `LOG.md:1730` and the lesson's `## Gate` both say 13. §Evidence standard, "Corrections sweep
   every mention".
5. **Receipt field contradicts its own command.** `c1-measurements.json` `before.exit` is `1`
   while the command it names (`git cat-file -e …`) exits **128**, as the report correctly says.
   Re-deriving the receipt must reproduce its fields.
6. **Still disclosed as open (carried forward, not regressions):** `c4` grades presence not truth;
   `c1` reads a round's lesson/report as whole documents; `c3` is word-presence only; `c2`/`c5`
   read only top-level `<stem>-spec.json` waves; `lessonSha256` hashes a re-encoded string; a
   missing object reads as "absent at this revision"; the round cap is caller-supplied; the OWASP
   spans are matched on stripped text whose digest is unrecorded.

## 5. Trend verdicts

- **expansion — improved.** `git grep -rniE 'synchroni[sz]er token|double-submit|custom request
  header' a89f1935 -- corpus SKILL.md` → exit **1**, no hits; at the tip the entry
  `csrf-defense-shape-boundary.md` exists and cites two rows opened this round (S102, S103, both
  `mined`), with a coverage row and a frontier restatement in `corpus/README.md`.
- **quality — improved (bounded).** Six prior-round figures corrected append-only
  (`corpus/lessons/round-23.md` §Corrections 1–6, each naming the superseded text); criteria
  61–63 grounded (`QUALITY.md:309,317,324`); each new class carries a red and a green fixture;
  the round-21 arm is recorded as a true positive rather than smoothed into a zero-control.
  Bounded by routed defect 4 (one superseded figure left standing) and by nothing measured in a
  browser.
- **discernment — improved.** The six round-22 routed defects became six mechanical classes plus
  three criteria, and this document supplies the round's owed non-author gate agreement
  (5 agree / 0 disagree). Every round-23 judgment inside the report is still author-side; the
  non-author agreement is exactly this file.

## 6. Conclusion

Both claims verify from committed bytes; no owned axis is harmed; conformance defects are
hygiene and interface (registry row, uncommitted leftovers, scratch over-commit, one stale
figure) and are routed above. Admission is not disqualified by a gate's registry row, but the
auditor will not be graded conformant as a gate until that row exists.
