# RevLesson — lesson draft falsification (w2)

Scope: filled cells and carried PENDING cells in `w1/ScribeLesson/round-36-draft.md`, checked against landing commit `f2f3f14555ec1db6d8c3a6dc9e4059ef9489b8c7`, frozen claims/receipts at `2e7b7a8920bff47fae6f75c3d06e48e37767099e`, RevC1 finding 1, and ScribeSrcGitDocs receipts/landed entry.

## Findings

**No actionable disagreement found in the filled cells reviewed.** The draft is explicitly a pre-integration skeleton and does not assert measured claim verdicts.

- **Controls:** C1 table agrees with `claims.json` and `baseline/controls-summary.json`: J0 exit 2/null predicate; J1 exit 1/false, coverage 0/307 and missing 307; J2/J3 exit 1/false, coverage 304, three findings/missing; J4 exit 1/false, one delta-screen finding; J5 exit 0/true, 307 coverage and zero findings/stale. C2 table also agrees: J0 exit 0/null; J1 exit 0/true, admitted/target 16, failing 0, unmeasured 1, binding null, egress 0; J2 exit 2/null; J3 exit 1/false, admitted 15; J4/J5 exit 1/false with 0 admitted/16 failing and respective receipt findings; J6 exit 1/false, 8 sockets / 3 samples. These are accurately presented as committed controls, not this seat's measurements.
- **M1:** RevC1 finding 1 establishes the typo is in `baseline/c1-drift-audit-build.mjs:21`, kama pin `e8fa87ef19ec5eb28f5fd9701a0a42a45bd688d` (39 hex), while the frozen counter and r35 v3 counter use the correct 40-hex `...a42da45bd688d`. The draft correctly locates the failed attempted transcription in pre-freeze control work and properly discloses that the failing bytes are not committed. Its claimed fix (programmatic extraction from r35 pins) is consistent with RevC1's recommendation/description of the corrected source process. Caveat is correctly retained: the frozen counter has literal PINS and its bytes cannot prove extraction. The claim that `rev-parse --verify -q` accepts a 39-hex prefix is attributed to the draft's read-only probe, not presented as a RevC1 observation.
- **S142:** `S142-row.md`, `fetch-receipts.md`, committed `corpus/SOURCES.md` S142 row, and landed `corpus/knowledge/adjacency-drift-audit-r36.md` support the draft's id, URL, timestamp, HTTP status, bytes, digest, DESCRIPTION quote/location, status `mined`, recheck `180d`, and used-by. It accurately flags the EXAMPLES quote as whitespace-normalised/markup-stripped, describes git-diff as support only, and preserves the receipt's limitations (living page, gitrevisions grammar unopened, source not evidence of ledger statuses). S142 is now present in committed registry and entry at f2f3f; the draft nevertheless correctly marks the L1's admit/refuse decision and registry log disposition PENDING, rather than claiming integration decision already made.
- **Freeze-byte list:** all eight names and abbreviated digests match the frozen `claims.json` `frozenDigests` (six listed instrument/control inputs plus two gate scripts; 8/8). No discrepancy observed.

## Every PENDING cell and integration evidence needed

1. Gate decision — L1 admit/refuse decision for S142; cite integrated gate disposition and registry state.
2. S142 registry log / proposed status-used-by changes — confirm the committed S142 row and method entry, including final status/recheck/used-by decision.
3. Assimilation — ScoutAssimilation receipt/disposition and any required resulting knowledge assimilation.
4. C1 chunk-seat read — all 16 `AdjDrift01`–`AdjDrift16` receipts / 307-row disposition, disagreement count and corrections, tied to evidence files.
5. C1 delta leg — independent `git diff` confirmation that the post-pin candidate pool is empty (not merely empty by construction); resolve/document whether the absent `corpus/adjacency-screen-delta.tsv` is correct for `delta.total=0` and the frozen surface.
6. C1 moved-row/manual status-class check — wave-1 hand reread evidence for every status class and all three kaidoku relocation lines; draft already separately notes the three relocation text checks it performed.
7. C2 live remeasurement — `measure.sh` run at named REV with frozen counters, raw committed outputs, provenance, fresh Firefox session and egress reading; confirm browser/driver versions and SHA-256 against round-35 install receipts.
8. C2 rewritten-id limit — w1 integration evidence establishing whether A6 still rejects identical IDs only / rewritten-id clones remain a limit.
9. Further w1/w2 mistakes — each observed mistake, or an evidence-backed zero-mistake disposition, in required round-35 M1–M5 shape (label, evidence path, captured-by, smallest fix).
10. Errata D11 — evidence of correction to the 0-byte evidence file and L1 disposition (not a claim).
11. C2 routed amendment — integration disposition/evidence for threshold, non-loopback leg, caller-named binaries, and MutDriverReceipt whitespace-twin self-sniff; distinguish frozen control receipts from any w2 attack outcome.
12. S125 cadence — landed `on-release` row and four companion files, with L1 disposition (not a claim).
13. C1 meter split — integrated claim/method disposition showing completeness versus delta-discovery split and the resulting measured outcome; avoid treating the design rationale alone as pass evidence.

The C1 table's remaining literal `PENDING`s also include the within-cell disagreement/correction details and the post-pin diff confirmation above; the broad “Further wave-1/2 mistakes” and four errata dispositions are distinct pending items, not subsumed by claim measurement.

VERDICT ok — no filled-cell mismatch found against the assigned committed sources; listed PENDING cells require the named integration evidence and are not yet claims of completion.
