VERDICT: HOLDS

Attacked: the no-harm claim of the wave-1 product at M = 6c97851034e9d8f58b135d28ff969f1f28fa2f7d
(refs/heads/master) against the frozen harm baseline at B = 5859243183c4d7ac5429dfdb8a73ce0d9a43d583.
Every one of the 20 entries in .ufo/waves/round-17/harm-baseline.json:35-1040 was re-run with the
baseline's own argv (900 s cap, inherited env) in a sandbox clone with HEAD attached on master=M, and
compared on exit, summary line, stdout sha256 and stderr sha256. Each difference was classified. Also
run: scripts/check-adjacency.mjs (lane default, --at M, detached HEAD), --self-test, --reasons, plus a
jj-like detached-HEAD replay of the three C1-affected production entries.

Sandbox / environment
- git clone --no-hardlinks LANE /var/tmp/tabi-r17w2-HarmAfter-M; git checkout -q --detach M;
  git update-ref refs/heads/master M; git symbolic-ref HEAD refs/heads/master.
  HEAD=M, master=M, git status --porcelain == 0 before the pass and after all 20 entries and after the
  detached replay (checked at pass boundaries, not re-checked per individual entry).
- node v24.21.0 (fnm installation path from the baseline argv), git 2.56.0; no GIT_* date/config vars.
  No timeouts, no signals, max runtime 5114 ms (well inside the 900 s cap). No tool installed.

Comparison against the 20 baseline entries (pass1.json)
- 20/20 exits equal (19 x 0; check-user-round-contract production x 1). 20/20 stderr sha256 equal.
- 11/20 stdout byte-identical: both check-round-contract production/report modes except count-witness,
  check-round-contract-witness, check-user-round-contract production, all 3 check-freshness entries,
  check-sources --self-test, check-aria-metadata --self-test/--witness/--witness-mirrors,
  check-measurement-binding --check r16 --at 1205d26 --reproduce. All verdicts unchanged.
- 9/20 differ; all classified INTENDED, none harm:
  1. check-round-contract --self-test: 6 new cases (lane_tip_detached_head, ... replace_ref/symref/
     reflog_spelling; M scripts/check-round-contract.mjs:904), cases 32->38, every case PASS.
  2. check-round-contract --count-witness: new fields code_revision=M, code_sha256=1579a794... (=sha256
     of M's gate), code_committed=yes (M:1200); verdict=clean, exit 0, result=PASS. New fields only.
  3. check-user-round-contract --self-test: 3 new cases (detached_head_reads_lane_tip etc.), cases
     42->45, fixtures 32->35, every case PASS.
  4-6. --witness / --count-witness / --diagnostic-witness: the baseline itself lists these
     (nondeterministicEntries) as fixture-path/commit-id variable. At M only fixture dirs, fixture
     commit ids, measuredRevision/codeRevision (=M) and the gate's own digest (568c0421..., sha256 of
     M's check-user-round-contract.mjs) change; old/new verdict and result=PASS tokens identical.
  7. check-sources production: rows 40->53 (A 31->43, B 4, C 5->6), queued 2->6, mined 33->41,
     rejected 5->6, verdict=clean, findings=0 — the plan's C2 rows S041-S053 (S049-S052 queued).
  8. check-aria-metadata --check: only the sandbox absolute path inside ARIA_METADATA_JSON differs;
     re-running pass2 with the same path produced a byte-identical sha. cwd artifact, not a change.
  9. check-measurement-binding --self-test: 17 new cases (counted_input_added/deleted + lane_tip_*),
     cases 59->76, every case PASS.

No-harm corroboration
- Frozen surfaces untouched B..M: git diff --name-only B M -- scripts/check-freshness.mjs
  .ufo/rounds/fleet-round-1-interactive-20261015 corpus/evidence/fleet-round-1-freshness
  scripts/webmcp-loopback-round16.mjs corpus/evidence/round-16 -> empty. pins.tsv and SHONEN.md unchanged.
- Identity chain already self-consistent at M: check-user-round-contract.mjs:35 sets
  ROUND_SCRIPT_CURRENT_SHA256=1579a794... = sha256(check-round-contract@M); the only commits touching
  that gate in pin(92d700d6)..M carry blobs 1579a794, 8a573b4e (now archived), 8478cd43, 6f9eddc7, all
  in the accepted/archived set. So the already-red production entry stays red only on round_count
  (stderr byte-identical, 47e9ffdc...) and will not newly fail on code identity once ten rounds exist
  ([INFERENCE] from constants + history walk; the gate fails fast on round_count).
- Detached (jj-like) HEAD at M: check-round-contract production stdout byte-identical to baseline
  (sha 25e66498...), check-user-round-contract production identical (exit 1, same stderr), count-witness
  code_revision=M code_committed=yes result=PASS; worktree clean.

check-adjacency.mjs (new C3 gate, M scripts/check-adjacency.mjs)
- Lane, bare default (lane-tip anchor): `ADJACENCY verdict=clean rows=9 verified=9`, exit 0, identical
  output sha twice (078a92b1...).
- Sandbox --at M --fleet: verdict=clean rows=9 verified=9 exit 0; sandbox detached HEAD: clean 9/9.
- --self-test: `ADJACENCY_SELFTEST verdict=clean cases=51 reasons=17 could_not_evaluate=6`, exit 0.
- --reasons: 17 finding reasons + 6 could-not-evaluate classes, closed vocabulary.
- Bare from a sandbox whose parent is not the fleet dir exits 1 with ruling_unresolved/sibling_unresolved
  (documented at scripts/check-adjacency.mjs:32-38: pass --fleet). Not a defect; lane invocation is clean.
- corpus/adjacency.tsv is 10 lines = header + 9 rows; dispositions: 1 ruled, 2 split-declared,
  2 contested-open, 4 refused-route.

Risks / caveats (no repair required for the no-harm claim)
- check-round-contract --count-witness stdout is not byte-stable: `baseline=<fixture commit>` comes from
  commit() (M:686-690; identical at B:611-615) with wall-clock dates. At B, 6 runs spaced 1.2 s produced
  6 distinct ids, so the harm baseline's nondeterministicEntries list (3 user-round entries) under-sampled
  it: its two runs happened in one second. At M two spaced runs differ only in `baseline=` (12384ad4...
  vs d5697a63...). Not introduced by M; but this entry's stdout sha is not a valid equality oracle.
  If strict reproducibility is wanted later, pin GIT_AUTHOR_DATE/GIT_COMMITTER_DATE in commit(); no gate
  currently depends on it.
- Not exercised (per baseline's own exclusions): check-aria-metadata --derive and
  check-measurement-binding --legacy. The new self-test cases' ability to fail against B bytes was not
  re-proved here (owned by C1/C3 counters). The new adjacency gate depends on mutable sibling-lane tips
  for pinned-commit reachability; clean at this snapshot.
- Sandboxes /var/tmp/tabi-r17w2-HarmAfter-{M,B} were removed after the runs; result JSON
  (/var/tmp/tabi-r17w2-HarmAfter-out/{pass1,detached}.json, 288 KB) retained as the cited receipts.

Files written: .ufo/waves/round-17/w2/HarmAfter.md
