# T4-4 edit plan for tabi-shokunin/SKILL.md (round-4 upgrade)

E1. Intro sufficiency contract — add round-4 line (rung 4 network + settle-wait + hygiene);
    state whether rung is measured (note pin) or pending.
E2. §Pins — add round-4 note(s) with re-derived sha256 first-12 + line counts + lane ids.
E3. §Evidence ladder — "3 rungs" -> "4 rungs"; add Rung 4 row (network):
    CDP Network domain on the loopback journey; client events + wire status + cache class
    + timing + byte counts; as-of-capture; measured anchor = r4-1 note (or pending).
E4. §Evidence ladder rules paragraph — add: network settle before shutter; keep the
    pending/race capture pair; wire vs client status classes; bodies default-off.
E5. §Claim classes → capture — Network row rewrite with measured recipe + classes.
E6. NEW §Settle-wait discipline — DOM settle (state predicate + 2 rAF) vs network settle
    (in-flight==0 / expected response landed / responseReceivedExtraInfo seen);
    record the race counterexample; predicates live in sha-pinned script.
E7. NEW §Hygiene rules — scratch namespace; comm-based process scans; explicit-PID kills;
    loopback bind; per-run closure; profile hygiene (fresh, rm -rf, own); bounded runs;
    shape-only secrets; archive-or-it-didn't-happen; no external sites under asleep.
E8. §Bounded waits — cross-ref settle-wait; keep deliverable-poll cap.
E9. §Staleness watch — round-4 additions.
