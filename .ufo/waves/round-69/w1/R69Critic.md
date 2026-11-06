adjacent (conditional) — C1 is a first-build boundary matrix (AXES signal and kotoba-r49 precedent), but the frozen predicate admits a null matrix; C2's predicate admits a fabricated receipt. Evidence: `.ufo/waves/round-69/w1/R69Critic/` (`report.md`, `evidence/`).

# R69Critic — scoped findings (tabi r69, C1 adjacency / C2 coverage)

Judged: lane HEAD `d65546b3`; working-tree `PROVINCE.md` sha256 `700e0d45a9b6e44ff909eb99d882c1f68a989e71ba019b4b5da377f4d0226487` (archived at `w1/R69Critic/evidence/draft-PROVINCE-snapshot.md`, 35 added lines). Freeze pins re-hash clean against `.ufo/waves/round-69/freeze.txt`; S174 `72cf0d1d…324f4`, S173 `5bbc6e23…66e3d`. Read-only; controls in my wave dir.

## (1) C1 — adjacency or calibration/bookkeeping?

**adjacent (conditional).**

For: it is the first build (base: exit 1 `matrix-missing`, bound 0/20), not an r66-style rebind; it answers unanswered inbound contested scope (kake `PROVINCE.md:45`, kengaku `:103`, kotoba `:76` = inbound 3/3) and routes outbound 4/4 without absorbing anything; three of five `contested` rows are unforced discoveries (kumitate `:14` kimi census, revenger `:33` rea-cdp-browser, kagi `:64` 9222 lease). kotoba's `SCORECARD.md:335` scores exactly this first-build shape (0 → 20 classified pinned rows) as adjacency, and its later re-pin as freshness (`PROVINCE.md:33`). Against: the counter admits a null (below), is one-sided (over-claims never refused), and lexically forces 3 labels; kotoba's guard at least binds classification to a census (`PROVINCE.md:50`), tabi's binds citations only. The 5 connector disagreements are 3 counter-forced (kake, kengaku, kotoba) + 2 judgment (kagi, tameshi) → judgment agreement 17/20, not 15/20.

Defect (fixable, prose only; predicate/counter/battery/snapshot/kill rules stay frozen): `SCORECARD.md:3642` says "adjacency 8 → 9 claimed (re-derivable by the command above)". The command cannot re-derive it — it greens the control below. Split the sentence: countable (20 rows bound at frozen heads, 3/3 inbound, 4/4 outbound, battery 19/19) vs judged (five contested with their sibling sentences; name the two judgment disagreements). Optional strengthening: one `why` clause per non-`none` row (kumitate `:14`, revenger `:33`, kagi `:64`, kaidoku `:55`, kake `:45`) — content, not a rule change. Also anchor the scored `PROVINCE.md` digest in the round report (the tree moved during this review; both states passed).

## (2) The cheapest PROVINCE.md that passes C1

Built by `evidence/gen-cheap.mjs` from the frozen snapshot alone: relation = `none`, upgraded to `adjacent` if the sibling's `PROVINCE.md` matches `\btabi\b` (or `contested` if such a line says contested) or if tabi's `Refuses` names the lane; quote = the file's first 3–25-word line; one constant `tabi side`.

`evidence/cheap2-PROVINCE.md` → counter **exit 0, rows 20, bound 20/20, inbound 3/3, outbound 4/4, findings []**; real-mode battery **19/19 refused, positive ok, exit 0**. 17/20 quotes are the sibling's title line; 1 distinct side. Over-claim variant (19 `adjacent`, kake `contested`) also clean. **The frozen predicate `C1-MATRIX-BOUND` admits both.** Connector labels applied to the same rows: exit 1, bound 17 (`inbound-contested-unnamed` kake, `inbound-relation-none` kengaku/kotoba) — the meter, not the lane, sets those three.

Non-author discriminator (none of it in the predicate): (i) quote provenance — draft quotes the domain line `PROVINCE.md:3` in 10/20 rows, 15/20 carry no boundary word; (ii) relation justification against the sibling's own sentence; (iii) a `none` sweep over PROVINCE **and** SKILL at the frozen head (I ran it: no `none` lane claims a browser/CDP surface; no lane names tabi only in SKILL.md); (iv) distinct sides (19/20 vs 1/20); (v) the independent connector draft, read per row. `kaidoku` is the test: the row was `adjacent`/domain-line at my first read and is `contested`/`PROVINCE.md:55` in the snapshot — both pass.

Minor (r70): duplicate `## Adjacent — sibling matrix` headings make the counter clean but the battery's `matrix-removed` negative fail (exit 1) — assert a single section; reciprocity is PROVINCE-only and lexical (`check-sibling-matrix-r69.mjs:99`).

## (3) The cheapest C2 receipt — is (b) + the pin enough?

**No.** Controls (fabricated, in `evidence/`):
- nonce rewritten in all 6 places + host identity `Chromium 999.0.0.0 forged` → counter **exit 0, 63 checks** with the frozen pin; battery **44/44, exit 0**.
- `host.argv` emptied, `host.stderrHead` emptied, `fixture.sha256` zeroed → **exit 0**; battery 44/44.
- all event `ts` = 0 and `legs[].elapsedMs` = 0 → **exit 0**; wheel deltas redistributed within a leg (sum preserved) → **exit 0**.

The pin is self-attested (`check-synthscroll-r69.mjs:42` compares `r.driverSha256`; the driver writes it by self-hashing, `chrome-cdp-synthscroll-round69.mjs:225`; the counter never reads the driver). (b) has no cross-run check: a copy passes. The battery derives 41 of 44 negatives from whatever receipt is passed as `--real`, so it cannot detect a fabricated positive. The receipt carries no absolute time, so "after the freeze" is commit-order evidence only.

What does hold this round: R69Exec1's (b) is genuinely independent — **387 differing leaf paths** vs (a) (nonce, launchToken, port 40502→41831, profile, stderrHead, 370 event timestamps, 170 vs 171 events; `evidence/scored-vs-seat-diff.json`); the pinned driver source has no browser-free path (launches `/usr/bin/chromium` `:232/:269`, rejects CDP errors `:288`, calls the gesture `:326`, captures stderr `:338`). Those are manual checks, not the predicate's.

Smallest safe correction: report (a)/(b) as manual provenance (the 387-leaf diff, both driver stdout/stderr files, the source pointer); do not present 63 checks / 44/44 as proof of a live run. Route to r70 as a calibration claim with failing-before controls: timeline monotonicity/non-zero; stderr DevTools line with port = launched port; non-empty `argv` with the pinned path; `fixture.sha256` recomputed; `startedAt` + `freezeCommit`; and a two-receipt counter mode (nonce/port/token differ, ts series differ). Even then, only an independent re-run is non-forgeable.

## Impacted axes

- C1: adjacency claimed 8→9 — supported by row content + precedent, not by the counting command; calibration — "re-derivable by the command" is false as written; operability/freshness — real (new cited census instrument, frozen-head pins).
- C2: coverage held at 9 with the capability real in fact — but the predicate's proving power is lower than "63 checks" implies; calibration — five unguarded dimensions; operability — real instrument, battery gaps already routed by R69Mut2; freshness — pins verified, no receipt timestamp.
- depth unchanged; nothing harmed.

Reproduction: `w1/R69Critic/evidence/repro.sh` (read-only, own scratch; every artifact sha256-pinned in `evidence/00-manifest.sha256`).
