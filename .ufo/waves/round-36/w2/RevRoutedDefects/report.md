# RevRoutedDefects — routed dispositions (tabi r36 w2)

Scope: priorClosure defects (2) C2 counter amendment and (4) C1 meter split. Reviewed frozen claims at freeze `2e7b7a8920bff47fae6f75c3d06e48e37767099e`, frozen counter source, and w1 reports. No counter was run in this review.

## Defect 2 — DISCHARGED (four requested amendment legs carried and w1 exercised)

Frozen `.ufo/waves/round-36/counters/c2-firefox-bidi-v2.mjs` documents A1–A5 at lines 13–26. Source lines 78 onward sets `TARGET = 16` and defines `PINNED_BINARIES`; claims.json C2 surface/predicate lines 176–180 independently require threshold 16, pinned caller binaries, whitespace-normalized self-sniff, DNS-off live sampling, and zero non-loopback egress. The counter's source header explicitly describes all four requested legs: M1 threshold, M3 live socket sampler with DNS-off prefs, M4 caller binary SHA pins, and A4 whitespace-normalized counter self-sniff.

W1 evidence exercises them:
- CritC2 avenues c/d: `w1/CritC2/report.md` lines 58–80 reports off-pin `/usr/bin/true` and decoy/tampered binaries refused (c), tampered gate refused (d); lines 31–40 recomputes J6 from frozen bytes and records non-loopback sockets with prefs dropped.
- MutC2: `w1/MutC2/report.md` lines 32–43 records pristine boundary=15 refusal, caller-named `/bin/true` and functional wrapper refusal, whitespace-normalized clone refusal, and prefs-dropped egress observation; its mutation results lines 46–78 show the corresponding legs are behavior-bearing (m1/m2/m4) and A4 is defense-in-depth for exact J4 (m3 remains refused by import audit).
- RevC2: `w1/RevC2/report.md` lines 9–40 verifies pin digests against receipts, J3 admitted count 15, and exact J6 prefs-drop reconstruction; lines 49–56 checks frozen digest and J2/J4/J5 outcomes.

Calibration caveat, not an undisclosed defect: CritC2 lines 33–57 demonstrates rewritten-id transcript replay reaches predicate true; claims.json and counter source lines 27–29 disclose this limitation. The four routed amendment legs themselves are present and exercised. Smallest correction: none for defect 2.

## Defect 4 — DISCHARGED (split predicate; fixed newMapped quota removed; third honest stop recorded)

Frozen `.ufo/waves/round-36/counters/c1-adjacency-sweep-v4.mjs` lines 2–20 describes completeness over the pinned pool separately from drift and delta discovery. Lines 37–67 define the split: completeness retains the v3 accounting definition; `newMapped` has no quota and is reported only (line 40); drift and delta are separately accounted, and predicate gates completeness/unaccounted, drift coverage/findings, and delta unaccounted/screen findings (lines 64–67). Thus the requested `completeness.unaccounted`, `drift.*`, `delta.*` split is carried without a `newMapped` quota.

Frozen claims.json lines 36–40 agree: predicate has completeness, drift and delta terms but no newMapped condition. Its `before` sentence at line 37 records both baseline failure modes (instrument absent, and do-nothing drift audit coverage 0/307); the counter header lines 6–10 explicitly grounds the split in the third consecutive honest stop on a fixed quota. The priorClosure at claims line 9 records the round-35 third stop and planned split. W1 C1 reports corroborate the defect work: `w1/CritC1/report.md`, `w1/RevC1/report.md`, and `w1/MutC1/report.md` contain C1 counter/claim reviews and mutation evidence; this seat did not independently rerun those checks.

Smallest correction: none for defect 4; frozen predicate already removes the impossible quota and preserves distinct completeness and discovery obligations.

VERDICT ok — routed defects 2 and 4 are DISCHARGED: frozen C2 carries all four requested legs and w1 exercised them; frozen C1 carries the completeness/drift/delta split without a newMapped quota and records the third honest stop. Rewritten-id replay remains an explicitly disclosed C2 limit.