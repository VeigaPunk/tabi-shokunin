Round 66 pre-freeze do-nothing controls (measured on lane master 2816adb3, before any claim freeze).
C1 control: frozen r65 meter v22 (.ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs, sha256 4d3a6b58...)
  run at live sibling heads (snapshot-live-r66.tsv) with the UNCHANGED r62 ledger:
  node .ufo/waves/round-65/counters/c1-adjacency-host-v22.mjs --repo . --rev 2816adb3... --fleet /home/vgpnk/Projects/shokunin --snapshot .ufo/waves/round-66/measure/snapshot-live-r66.tsv --json
  -> predicate false, findingCount 40 (see v22-live-r66.json).
C2 control: frozen r65 v2 gate selftest (check-receipt-provenance-v2.mjs --selftest) 12/12 clean; mutants
  controls/mutants/M5a-drop-repo-base.mjs and M5b-drop-matrix-dir-base.mjs ALSO selftest 12/12 clean (both survive).
D1 control: v22 selftest at HEAD -> cases 47 pass 47 (v22-selftest-r66.json); committed r65 selftest.stdout says 46.
