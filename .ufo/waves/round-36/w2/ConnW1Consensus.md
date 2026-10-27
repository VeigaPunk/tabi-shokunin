# ConnW1Consensus — w1 cross-seat disagreement scan

The four named candidates reconcile; no real disagreement is established by the examined w1 reports:

1. **MutC2 B5 6 vs frozen J6 8:** different live socket sample counts, both satisfy `>=1`; MutC2 explicitly reports timing/environment variability. Contract's 8 is the recorded frozen receipt, not a required invariant count.
2. **CritC1 F1 vs ExecSelftest deterministic:** different trees. ExecSelftest's honest freeze input repeats byte-identically and scores true; CritC1's substituted-pin trees also score true deterministically, but against substituted heads and regenerated ledgers. Repeatability does not bind inputs.
3. **ScribeQuarantine collisions vs round-22/23 refusal:** compatible claims. The 38-row/class verdict agrees with round-22/23; 19 absent IDs and 19 present-but-different-source IDs concern cross-registry identity, not the refusal decision. Scribe explicitly says verdicts stand.
4. **AdjDrift chunks vs RevC1:** disjoint samples. RevC1's 14-row sample includes 11 unchanged + 3 moved; inspected chunks reporting unchanged cover different rows. AdjDrift01 and AdjDriftKaidoku report the same three moved destinations (:748/:784/:815), consistent with RevC1.

Bounded move: preserve these distinctions in the consensus record; no correction to the candidate reports is warranted. CritC1's F1 remains an independent counter input-binding finding, not a disagreement with honest-tree determinism.

Evidence limitation: the full set of 33 report bodies was not semantically cross-compared in this session, so no claim of exhaustive absence of other contradictions. Candidate report texts were read; no counters/tests rerun.

VERDICT ok — all four named candidates reconcile in the examined evidence; no real disagreement established.
