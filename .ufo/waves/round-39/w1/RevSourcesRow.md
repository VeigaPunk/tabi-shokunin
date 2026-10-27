# RevSourcesRow — scoped findings

S145 is not in the production registry (which ends at S144). The candidate `.ufo/waves/round-39/assimilation/S145-open.txt` has a grounding mismatch: it labels the source `proc_pid_net(5)` but cites the `proc(5)` URL `/man5/proc.5.html`; its `/proc/net/tcp` anchor and `rem_address` quote need to be verified against the actual cited bytes before a mined row is drafted. Candidate quote is 11 words, within the ≤25-word bound, and the scope correctly limits itself to `/proc/net` TCP remote endpoints, not UDP or all browser traffic.

Prevent row defects: exactly 11 cells/no literal pipes; man page `kind=docs`; tier A only if supported by primary source; mined only after verified fetch/location; opened date 2026-10-27; legal recheck token without prose; used-by must be the existing round-39 knowledge-entry path. C1 counter does not check registry shape or source grounding. No registry edits, no installs. See `RevSourcesRow/report.md` for evidence and the explicit verification gaps.

VERDICT finding — source URL/title mismatch and missing registry row require resolution before admission.