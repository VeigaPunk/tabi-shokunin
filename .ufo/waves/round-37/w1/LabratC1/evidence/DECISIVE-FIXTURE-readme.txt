LabratC1 — decisive fixture evidence (round 37 w1, probe of v5's diagnostic read paths)
=========================================================================================

NOTE ON EMPTY FILES
-------------------
g-delta-frozen.stdout is 0 BYTES ON PURPOSE. It is the FROZEN reading of `--list-delta`
over the honest lane: the delta candidate pool is empty on the honest state, so the
frozen output is genuinely zero bytes. Its unfrozen counterpart g-delta-unfrozen.stdout
has 2 lines. That contrast IS the finding.

Decisive fixture
----------------
Clone of the lane with ONE change committed at HEAD: the delta pins file
(.ufo/waves/round-36/baseline/c1-delta-pins.json) has its `kagi` entry repointed from
the frozen head to 8a6ec16657789f11a6e8e24cff6e6353e79756ce (a kagi commit carrying
browser-ground lines absent from the round-35 pin set — found by the full-history scan
recorded in scan5.err).

  HEAD pins blob sha256 = d4f88cc8e52fb93bc8c8ef148bd8598064462c167be993e1b12bc0406a73c284
  frozen pins   sha256 = 810193620393f6e8b76faac4b606977508198de1b9ffd00d3a7440e8f1910655

READINGS
--------
g-delta-unfrozen.stdout   --list-delta over the UNFROZEN clone: exit 0, 2 lines
g-delta-frozen.stdout     --list-delta over the honest lane:  exit 0, 0 lines (empty file)
g-drift-unfrozen.stdout   --list-drift over the UNFROZEN clone: exit 0, 363 lines
g-delta-disk.stdout       --list-delta via the ON-DISK `cat` fallback (path absent at HEAD):
                           exit 0, 2 lines — the SAME unfrozen rows, so BOTH unbound read
                           paths (HEAD blob at v5 line 609 and the bare `cat` at line 611)
                           surface unfrozen content.
g-pred.stderr            the PREDICATE over the SAME unfrozen clone: exit 2,
                           "…c1-delta-pins.json at <rev> sha256 d4f88cc8… != frozen 81019362…"
                           — the predicate REFUSES what the list modes print without complaint.

The 2 emitted rows (g-delta-unfrozen.stdout):
  kagi-shokunin@8a6ec16657789f11a6e8e24cff6e6353e79756ce:corpus/knowledge/adjacency-scope.md:8
      `PROVINCE.md:34` and `:44` (the CDP refusal), and the one `mode = -` census row
  kagi-shokunin@8a6ec16657789f11a6e8e24cff6e6353e79756ce:corpus/knowledge/adjacency-scope.md:9
      (the musketeer profile dir). Gates observed this round: `ADJACENCY_SCOPE: CLEAN

These are browser-ground lines (CDP, musketeer) — i.e. exactly the class of "new
browser-domain line a sibling added post-pin" the counter exists to surface — produced
from UNFROZEN pins with no digest check and no warning.

Honest floor (control)
----------------------
honest-pred.json / honest-pred.stderr: the frozen v5 over the honest lane at master —
exit 0, predicate=true, drift.total=307, auditCoverage=307, delta.total=0,
deltaPinsSha256=810193620393f6e8b76faac4b606977508198de1b9ffd00d3a7440e8f1910655
(matches claims.json frozenDigests-era value).

Display-only proof
------------------
c13-marker-pred.stderr contains "MARKER:evaluate-reached"; c13-marker-list.stderr and
c13-marker-drift.stderr contain ZERO marker lines. The instrumented counter prints the
marker at the top of evaluate(); it never fires on the --list-delta / --list-drift paths,
which process.exit(0) at v5 line 627 before evaluate() is called at line 630.
=> the list modes cannot influence any predicate evaluation.

Count-shift fixtures (de-pin one drifted lane)
-----------------------------------------------
base-drift.stdout  307 lines   (frozen, honest lane)
c7-drift.stdout    306 lines   (de-pinned chousa, COMMITTED at HEAD)
c8-drift.stdout    306 lines   (de-pinned chousa, ON-DISK only, HEAD tree lacks the path)
c9-drift.stdout    306 lines   (de-pinned chousa, committed at HEAD, second fixture)
c14-drift.stdout   308 lines   (one extra screen row appended at HEAD -> the screen ledger
                                 is read at HEAD, not at --rev)

The single dropped row in c7/c8/c9 vs base is:
  chousa-shokunin@00f8c7f5272a1d98b6d34913985fa4537e00aaf9:corpus/knowledge/archived-export-intake.md:141

Full raw logs: probe.log, probe2.log … probe9.log, scan5.err, code-excerpts-v5.txt,
code-excerpts-buildtool.txt, v4-v5-listblock-diff-and-consumers.txt.
