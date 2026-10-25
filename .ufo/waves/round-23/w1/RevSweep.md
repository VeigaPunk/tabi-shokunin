# RevSweep — independent misroot / write-scope sweep (tabi r23, attempt 1)

Snapshot 2026-10-25T04:14:43-03:00 (`date -Ins`). Fleet is live (driver + tameshi r41 writing), so the
classification below is point-in-time: the `.scratch/*` `D` rows seen at 04:09 were gone at 04:14.
Lane HEAD `a89f1935f523a64b00991d792fca6a8c0d321948` == frozen claims baseline (ancestor check below).

**Verdict:** PASS with notes — no fleet-root misroot of tabi r23 bytes, lane tracked tree clean at the
sweep clock (04:14:43); the only tracked lane edit since is the append-only `corpus/SOURCES.md` +2 rows
at 04:15:19 (F2b, must be L1-owned), and three untracked lane paths sit outside the wave evidence dir
and must be resolved before landing (F3–F5).

## Commands (verbatim)
```
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin status --porcelain -uall      # 164 ??, 0 tracked mod
git -C /home/vgpnk/Projects/shokunin status --porcelain                          # 17 M, 5 ??, 0 D
git -C .../tabi-shokunin rev-parse HEAD ; git merge-base --is-ancestor a89f193... HEAD
find /home/vgpnk/Projects/shokunin -maxdepth 1 -newermt "2026-10-25 00:00" -printf '%p\n'
grep -rln 'round-23' /home/vgpnk/Projects/shokunin --exclude-dir=tabi-shokunin --exclude-dir=.git
grep -lnE '\btabi\b' /home/vgpnk/Projects/shokunin/.ufo/reports/round-23/*.md
python3 <w1-spec.json walk>                                                     # seat output paths / non-lane paths
git cat-file -e a89f193:scripts/round-evidence-audit.mjs                        # absent at baseline
```

## Fleet repo — every status entry classified (17 M + 5 ??) 
Driver/operator state (22 entries before the transient deletions cleared):
- `M .ufo/state/{chousa,kagi,kaidoku,kake,kama,kasegi,kengaku,kumitate,mado,mori,souji,tameshi,tsukuroi}.report-baseline` — driver round-advance counters.
- `M .ufo/state/tabi.report-baseline` — `22 e3b0c442… → 23 e3b0c442…` (driver advanced tabi to round 23, empty-report sha256); driver-owned per prompt §3 (`git diff -- .ufo/state/tabi.report-baseline`).
- `M .ufo/watchdog.log`, `M scripts/hyaku/hyaku.env` (m_swe→m_flash labels), `M scripts/hyaku/lane-addendum.md` (run-6 directives) — hyaku driver; diffs carry zero `tabi` lines (`git diff -U0 … | grep -c tabi` = 0).
- `?? .scratch/goal-20261025-hyaku-12h.md`, `?? .omp/mcp.json` (285 B, mtime 10-24 18:07, `keys`=[$schema,mcpServers], 0 tabi/round-23 hits), `?? .ufo/state/{kotoba,kotodama,revenger}.report-baseline` — operator/driver.
Another lane's: none at snapshot. `?? .ufo/reports/round-41/tameshi.md` was untracked at 04:11 and is
TRACKED at 04:14 (`git ls-files --error-unmatch`) — tameshi's own landing, not tabi's business.
Tabi-authored in the fleet tree: **none**. Only fleet file naming tabi+round-23 is the tracked
orchestrator prompt `.ufo/prompts/tabi-round-23.md` (driver-authored, declared out-of-lane surface).
`/home/vgpnk/Projects/shokunin/.ufo/reports/round-23/tabi.md` is **absent** — correct, report lands last.

## Lane repo classification (164 untracked, 0 tracked modifications)
161 under `.ufo/waves/round-23/` (assimilation 91, scratch 61, w1 7, fixtures 2, spec/dispatch/registry 5);
3 outside it (F3–F5 below). Nothing from the lane appears in the fleet root: `find … -maxdepth 1 -newermt`
listed only `MANIFEST.json` (content-identical to index: `git status --porcelain -- MANIFEST.json` empty).

## Findings
1. **F1 (info) No fleet-root misroot.** `find /home/vgpnk/Projects/shokunin -maxdepth 1 -type f -newermt "2026-10-25 00:00"` → only `MANIFEST.json` (mtime 04:11, zero diff). No seat note at the fleet root.
2. **F2 (info) Lane tracked tree was clean at the sweep clock.** `git status --porcelain --untracked-files=no | wc -l` → 0 at 04:14:43; `git merge-base --is-ancestor a89f193… HEAD` → exit 0; `git log --oneline -1` → `a89f193 round-22 verifier spot-check`.
2b. **F2b (medium, attribution unknown) First tracked lane edit appeared mid-sweep.** At 04:15:19 `M corpus/SOURCES.md` (`git status --porcelain -uall`): `git diff --numstat -- corpus/SOURCES.md` → `2 0`, i.e. exactly the two S102/S103 rows appended, zero deletions — the C2 shape, but it is a tracked `corpus/**` write that the wave contract forbids to seats. The L1 must own/author it (or re-derive it from scratch bytes); do not land it as an unattributed seat edit.
3. **F3 (medium) 1.5 MB corpus mirror inside wave evidence.** `find .ufo/waves/round-23/assimilation/validate -type f | wc -l` → 91, `du -sh` → 1.5M; `cmp` of `corpus/knowledge/arc-synthesis.md` vs the mirror → identical. A byte-copy of the tracked corpus is neither a seat scratch (`scratch/<Name>/`) nor a derivation output; committing it would duplicate `corpus/**` inside the lane. Exclude from the commit path list or delete after the census run.
4. **F4 (low, cleared) Root stray.** `scratch-cache.json` (8 B, `{"n":1}`, mtime 04:13:41) sat at lane root, outside any declared scratch subtree and not gitignored (`git check-ignore` → no match); it was **absent** by `test -f` at 04:15:47, so the writer cleared it. Keep as a watch item: nothing prevents the next seat from leaving one.
5. **F5 (low/decision) New file under `corpus/**`.** `corpus/evidence/round-23/c1-measurements.json` (2754 B, schema `tabi-round-23-c1-measurements-v1`, mtime 04:14:36) is a seat-written, untracked corpus path; seat contract names `corpus/**` as never-edit. L1 must either commit it deliberately as C1 evidence (matching `corpus/evidence/round-*` convention) or move it under `.ufo/waves/round-23/`, and record which — silence leaves a forbidden-looking path pending.
6. **F6 (info) The C1 instrument is untracked but in scope.** `scripts/round-evidence-audit.mjs` (22,490 B) is the deliverable; `git cat-file -e a89f193:scripts/round-evidence-audit.mjs` → absent, so the claimed before=0 holds on committed bytes. Exit contract in-file matches the frozen API (read at 04:14, mtime 04:13:52): `--selftest` → `result.clean ? 0 : 3` (line 490), audit → `result.clean ? 0 : 1` (line 544), refusal → 2 (line 554); 12 cases at lines 414–446.
7. **F7 (low) Instrument reads outside the lane by default.** `--report` defaults to `/home/vgpnk/Projects/shokunin/.ufo/reports/round-${round}/tabi.md` (line 502) and a missing report is a refusal (lines 518-523, message at 521: "a clean verdict would be a false green"); r21/r22 reports exist (`test -f` → yes), but C1's controls then depend on an untracked fleet file, not on lane-committed bytes.
8. **F8 (info) Snapshot volatility.** At 04:09 `git -C /home/vgpnk/Projects/shokunin status --porcelain` showed 14 ` D .scratch/*` (goal files, `*.out`); at 04:14 those rows are gone and `?? .scratch/goal-20261025-hyaku-12h.md` appeared. Driver scratch churn, not tabi authorship; any classification must carry its clock.
9. **F9 (info) No plan item writes outside the lane.** All 44 `w1-spec.json` items resolve to `write ONLY this file: …/round-23/…` (0 non-round-23 paths). Every non-lane absolute path is a read: `scripts/hyaku/ufo-wave-policy.json` (2), `scripts/sources-census.sh validate --file`, `shokunin.conf`, sibling `scripts` listings, `kimi-shokunin/…/CORPUS.md`, `shokuknow/merge/tabi/**` (read-only). `MANIFEST.json/SCORECARD.md/PROVINCE.md/SKILL.md` appear only in read/verify prompts (SentinelRoundSafety explicitly asks whether any item lets a seat edit MANIFEST).
10. **F10 (info) Controls exist.** r21: waves dir 1 entry, `corpus/lessons/round-21.md` present, fleet report present; r22: same — `git ls-tree -d a89f193 .ufo/waves/round-21|22` + `git cat-file -e`.
11. **F11 (info) Foreign lane mention, not contamination.** `grep -lnE '\btabi\b' .ufo/reports/round-23/*.md` → only `kake.md:19` (a PROVINCE boundary sentence). Kake's report is not tabi-authored and asserts nothing on tabi's claims.
12. **F12 (low, residue) Out-of-lane r22 scratch survives.** `/tmp/tabi-r22-closure.json`, `-measure-47bfb5f.json`, `-selftest-47bfb5f.json` (03:31–03:50 today) are r22 artifacts, not r23, so not a round-23 misroot; they are still lane-generated bytes outside the repo and uncommitted evidence.

## Residual risk / not verified
- Snapshot, not a continuous watch: the driver and tameshi r41 were writing during the sweep (F8).
- No `lsp` server covers `.md`/`.json` sweeps and none was needed; all caller evidence here is filesystem/git, which I do not present as semantic proof of any claim.
- I did not audit the claims' numerics (D-seat work) nor run the auditor; F6/F7 are text-level contract reads.
- Write scope respected: this file is the only write; no git/jj writes, no services, no spawns, no messages.
