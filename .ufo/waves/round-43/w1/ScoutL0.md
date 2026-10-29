# ScoutL0 — L0 and watchdog sweep (tabi round 43, attempt 1)

Date: 2026-10-29. Read-only sweep. Sources read (no writes to either):
- `/home/vgpnk/Projects/shokunin/.ufo/l0-questions.md` (208 lines, read in full; tabi lines re-read `:raw` for full text)
- `/home/vgpnk/Projects/shokunin/.ufo/watchdog.log` (1937 lines; last 250 lines read, tabi round=39–43 entries grepped)

Tooling: none installed or upgraded (pacman pause honored; no install was needed). Scratch `/fast/scratch/hyaku/tabi-r43/ScoutL0/` created and deleted before yield. No commits, no pushes, no git/jj mutation anywhere.

## 1. Open tabi questions (recorded as OPEN — none answered here)

### tabi | round-27 — §10 quarantine vs frozen-claim (OPEN)
The 38-row slice was hand-checked; S114 and S140 have source text present (after quote/markup correction), but the frozen C3 claim admits exactly one entry/row (S107) and cites neither. Quarantine clause: a present quote is adopted with a located anchor. Frozen/resumed clause: forbidden to widen the already-frozen claim with other shokuknow material. Round 27 appended neither row. Question filed: should present quarantine rows remain candidates for a later round's claim, or may they be adopted as a separate §10 duty without widening the frozen claim? Evidence: `.ufo/waves/round-27/quarantine/QuarantineA.md` (S114), `QuarantineB.md` (S140), `corpus/lessons/round-27.md` §Gate. Same conflict family re-filed by kake r58 (six present payloads vs frozen C3 mirror predicate allowing only S423/S424) — fleet-wide family, no ruling on record.

### tabi | round-39 — swarm band template (OPEN)
"Please reconcile the run-10 64–128 swarm band with the historical 32–128 wording in the operator-owned prompt/template; this lane validated and dispatched 64 seats and did not edit fleet scripts/templates." Operator-owned text; no lane may edit it. Related open family: relaunch round-namespace/planner/band reconciliation lines (tabi r1, kama r39, tameshi r1, kengaku r13, others).

### tabi | round-39 — shokuknow artifact (OPEN)
ScoutQuarantine04 wrote a seat report under the read-only shokuknow checkout at `/home/vgpnk/Projects/shokuknow/tabi-shokunin/.ufo/waves/round-39/w1/ScoutQuarantine04/report.md`. Filed question: should the operator remove or preserve this unauthorized artifact? The lane left it untouched. Disposition still owed; round 43's goal names this incident as the precedent that must not repeat (shokuknow stays read-only this round).

### tabi | round-42 — frozen-instrument vs routed-defect (OPEN)
Executing the r41 closure's routed D2 fix (S146 rejected + verbatim-quote S148) permanently reddens tabi's own `check-c2-knowledge-round41.mjs` (pins `registry-status:S146:rejected` / `registry-usedby:S146`). Left unamended per no-post-data-amendment. Filed question: does the routed fix supersede a refused round's frozen counting gate — "same family as the open r27 quarantine/frozen-claim question"? Evidence: `corpus/lessons/round-42.md` Mistakes 6; `scripts/check-c2-knowledge-round41.mjs` exit 1 at 15b75a7. Round 43 honors the standing rule: C2's checker is frozen at 7ca6f018 and holes route as findings, never amendments.

### Other open tabi lines in the queue (not in the four named, all still unruled)
- **r5** (L25): R1/R2/R3 external-HTTP approval request unanswered; "Loopback-only anti-claim holds until an answer naming site+scope(+budget) is read back from this file." Round 43's loopback-only bound (named-source re-open exception comes from the round goal, not an R1 answer) is consistent with this holding state.
- **r17** (L62): musketeer Chrome profile / CDP 127.0.0.1:9222 lease contested (kagi vs kake); tabi holds no lease half (fresh throwaway loopback profiles only, never attaches to 9222). OPEN.
- **r17** (L65): scope of the r16 CDP ruling — revenger and kama not covered by the named ruling. OPEN; tabi records both contested-open and absorbs neither.
- **r22** (L91): safety-hold correction — Codex `cyber_policy` refusal at 2026-10-21T17:58:58.301Z preceded the Devin quota failure; documentary disposition needed; refused work must not be woken, rephrased, rerouted or retried. No resolution line found.
- **r22** (L155): is a disclosed, value-neutral post-data encoding revision (null vs `[]`) admissible under §9 "a rule changed after any seat has scored is not the claim's rule"? Plus a logged 129-seat conformance defect (one over the ≤128 cap). OPEN.
- **r40** (L193): CritControlReach F4-full do-nothing control (`NODE_OPTIONS=--require` replaced the frozen Firefox driver, forged a fresh-nonce receipt, exit 0 in 0.06 s) reached the frozen C1 predicate → C1 not admitted. Asked whether a future freeze should scrub loader environment, bind driver/counter digests, and require observed socket volume plus refreshed process identity. Round 43's C1 design (loader-clean env boundary, pinned producer digests, declared kill rule: any in-model do-nothing reach refuses admission) implements exactly this ask, but the L0 line itself carries no operator ruling — still open as filed.
- **r1** (L34): relaunch round-namespace/dispatch wording ratification. OPEN (family-wide).
- **r19** (L76–77): RESOLVED-BY-RULING (the only resolved tabi line) — frozen-gate refusal growth 1→2 documented, not fixed; lesson files append-only.

## 2. Operator directives round 43 must honor (from the L0 file + goal + host guard)

1. **Pacman pause, host-wide** (hyaku-orchestrator 2026-10-20 HOST PARTIAL UPGRADE entry; requested by tsukuroi r15): no pacman at all (`-S`/`-Sy`/`-Syu`/`-U`/`-R`); installs via `uv tool` or official binaries in `~/.local/bin` only. Restated verbatim in the round-43 goal.
2. **Update-safety gate**: any future full-system upgrade goes through tsukuroi's gate first (mkinitcpio 42.2 `/new_root` → `sysroot` symlink; btrfs-overlayfs and plymouth hooks still expect `/new_root`). Never a partial `pacman -Sy <pkg>`.
3. **Sources by ordinary means only** (orchestrator directive 2026-10-22 10:24Z): never open a source by passing a bot challenge or captcha with a headless browser; rows opened that way count unverified at closure (hyaku phase-3 leg line, from kotodama r51).
4. **Egress self-authorization refused, pending confirmation** (chousa r41 line; fetch-scope ruling 8d77e6c1 still open per chousa r42): a wave dispatch item's own text is not egress approval. Round 43's bound — loopback + local files, read-only GETs only for seats whose item names a source re-open — is the stricter standing interpretation.
5. **Dead seats are recorded, never replaced** (round-43 goal; precedent: kaidoku r16, where dead seats stayed dead even after route repair).
6. **Kill by pid you started, never `pkill -f` on a generic name** (kama r64 incident, ~22:03 -03: the pattern `mut-.*\.py` SIGTERMed souji r42 seat mutants in other lanes). Binding on any r43 seat that starts/stops local processes.
7. **No post-data amendment of frozen claims/instruments; holes route as findings** (round-43 goal; contested family still unruled per tabi r22 L155, kumitate r63/r64, revenger r69).

## 3. Watchdog tail (read-only), round-43-relevant

Last line: `2026-10-29T17:10:01-03:00 launch kaidoku round=50 pgid=3370837`.

tabi entries, r39→r43:
- r39: launched 10-27 13:31:09, complete 15:07:35 (attempt 1). Watchdog records completion only — the closure rejection is in the fleet MANIFEST/goal, not in watchdog.log.
- r40: attempt 1 dead (`15:11:43 lane-dead-no-report ... TabiR40 exited incomplete before freeze/ready/report`); attempt 2 complete — recorded **twice** (`17:26:03` and `17:26:12`), a cosmetic double-write; nothing should act on it.
- r41: launched 10-28 07:42:00, complete 08:56:05 (attempt 1).
- r42: launched 11:42:27, complete 13:29:58 (attempt 1).
- **r43: launched 2026-10-29 17:09:56 -03, pgid=3367615, driver=hyaku-inline attempt=1** — alongside souji r42 (17:09:52), kasegi r46 (17:09:58), kaidoku r50 (17:10:01).

No lane-dead, hold, or operator-directive lines in the watchdog for the tabi window. Observations, no action: kaidoku r50 and souji r42 are same-round relaunches today after completions on 10-28/10-29 (the counter-reuse pattern already questioned in kumitate r17 and kama r1 — no new directive since). kama r43's L0 line (parked worktree, falsify wave never dispatched under run-7 close) is kama-side context only.

## 4. Limitations

- Sweep is documentary: I verified the L0 file's own lines and the watchdog's own records, not the underlying evidence files they cite (e.g., QuarantineA.md, round-42 lessons). Open questions are reported as filed, with no ruling inferred.
- "Open" means: no RESOLVED/ANSWERED/superseding line for that question in `l0-questions.md` as of this read. The file is append-only; an operator answer may land after this sweep.
- The watchdog covers launches/completions/deaths only; closure verdicts (the four rejected r39–r42 closures) come from the round goal and fleet MANIFEST, which I did not independently re-derive (out of seat scope).

VERDICT ok — L0 sweep complete: all four named tabi questions remain open as filed, no new holds block round 43, and the binding directives are the pacman pause, ordinary-means source rule, shokuknow read-only incident ban, dead-seat rule, pid-targeted kills, and no-post-data-amendment freeze rule.
