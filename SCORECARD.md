# tabi-shokunin — Scorecard

Lane axes per AXES.md (six-axis vocabulary; primary verdicts per
LEARNING.md trends). Probation rounds 1-3 build the initial measurements.
Axes will be pinned with their counting commands as rounds land.

State at writing (2026-10-14, TABI-SCRIBE, round-1 record): repo HEAD
`ff81c0f` (round-0 mint) with the round-1 work uncommitted in the tree —
`git status --short` → `M SKILL.md` (+114/−2), `?? corpus/knowledge/`.
Every score below was measured against that working tree (`ff81c0f` plus
the uncommitted round-1 files); the integration commit supersedes the
pointer, not the counts — re-run the commands. `SKILL.md` line refs are to
the round-1 working-tree revision.

## Primary verdicts — round 1 (three trends, `LEARNING.md:23-36`)

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | improved | 0 → 3 admitted knowledge notes, each on ground the (empty) coverage map did not hold, each now carrying a coverage row (`ls corpus/knowledge/*.md \| wc -l` → 3; `sha256sum corpus/knowledge/*.md` first-12 → the three `SKILL.md:23-27` pins, re-matched 2026-10-14). |
| quality | unchanged | First-admission round — nothing to supersede, no stale entry; the scribe's same-day anchor spot-checks all held (anatomy §8.1–8.4; cdp :36/:105/:84-85; census :54), so no admitted entry failed a re-check. |
| discernment | improved | First outside spot-check (scribe, non-author per `LEARNING.md:37-43`) agrees with the round's gate on one admit and one reject: admit — manifest↔skill version consistency (`grep -n '"version"' kimi.plugin.json` → `4: "version": "1.11.3"`, skill `SKILL.md:6` same); reject — "Brave installed" (`ls -A ~/.config/BraveSoftware/Brave-Browser/` → only `NativeMessagingHosts`; census:40-43). |

## Primary verdicts — round 2 (three trends, `LEARNING.md:23-36`)

Recorded 2026-10-14 by TABI-SCRIBE (integrating round; wave-2 seats TABI-R2-1
capture, TABI-R2-2 daemon disposition, TABI-R2-3 verify/errata, TABI-R2-4
poll; TABI-A1 r2b audit in flight at record time). Axis move: **depth**.

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | improved | 3 → 5 admitted notes, both new ones on ground the round-1 map did not hold (live dynamic-page capture; daemon lifecycle/state), each now carrying a coverage row (`ls corpus/knowledge/*.md \| wc -l` → 5; new-note sha pins `56224aa88430` / `9240f1d66a8c` re-matched 2026-10-14). |
| quality | improved | All three round-1 notes re-verified by TABI-R2-3 via append-only errata (pure appends — `/tmp/tabi-r2-3-verify/append-proof.txt` byte-prefix proof; pre-append hashes equal the round-1 pins, re-derived by the scribe from `7961735`): 2 anchor-level corrections applied (census `operations.md` cite off by 4; cdp `url`-normalization rule), 1 unbacked sighting downgraded to non-replayable (cdp §2 launch-window listing), live-state supersessions recorded for the daemon; no admitted entry left false-or-stale-unmarked. |
| discernment | improved | Outside spot-check by the scribe (non-author of every round-2 note), per `LEARNING.md:37-43`: agrees with both round-2 admits after re-running their anchors (methodology shas + capture-pair hashes; live `ss -ltnp` + `/status` shape); re-ran the standing Brave reject → `NativeMessagingHosts` only (agree); independently verified the census off-by-4 correction against `operations.md:17-22` (Web Store URL with the id at :18, 中文 help URL at :22). |

## Axes — initial pinning (round 1)

| Axis | Score | Evidence pointer (counting command) | Last change |
|---|---|---|---|
| depth | 5 | **Round-2 move.** 3-rung page-claim evidence ladder — static bytes → dynamic before/after pair under sha-pinned methodology → multi-signal agreement — each rung carrying a measured anchor, plus the determinism boundary measured on both sides and the approval-discipline table (SKILL.md "Page-claim evidence ladder" / "Determinism boundaries" / "Approval discipline"; anchors `corpus/knowledge/live-dynamic-capture.md:66-73,96-101,105-149`). Ceiling: real-site pages untested by rule; boundary host/build-scoped (`live-dynamic-capture.md:205-207,216-217`). | round 2 |
| coverage | 3 | Rider of the depth move: 5 notes over 5 of PROVINCE's owned surfaces — new: live dynamic-page capture, daemon lifecycle/state (`ls corpus/knowledge/*.md \| wc -l` → 5). Site-gotcha and rate/rights records still unmeasured (`SKILL.md:118-120`); extension↔daemon handshake still open. | round 2 |
| operability | 3 | Launch/cleanup/evidence recipes are re-runnable and their anchors re-ran clean 2026-10-14; every SKILL rule cites a re-run anchor. Round 2 adds the daemon recheck sequence (`webbridge-daemon-disposition.md:192-196`) — not yet re-run a second time, so no move. Ceiling: no repo-local gate scripts yet (`ls corpus/*.sh scripts/` → none). | round 1 |
| freshness | 3 | Rider: all three round-1 notes re-verified in-round by a second reader (errata blocks dated with re-run results; anatomy §8 anchors, census re-run, cdp cross-session determinism), round-1 SKILL pins refreshed to post-append hashes. Ceiling: re-checks are same-day-later, not a strictly-later date; four `/tmp` staging dirs still unarchived (`tabi3-cdp`, `tabi-audit2-cdp`, `tabi-r2-1-capture`, `tabi-r2-3-verify`). | round 2 |
| calibration | 4 | Observation/inference/unknown separated in all three notes; 17 unknowns enumerated (anatomy U1–U4, census U1–U5, cdp §7 1–8); 3 rejections/incidents kept (census:40, cdp:17, cdp:105); errata sections present and append-only in all three; SHONEN gates still open with TBD verifiers — honest, not marked. Ceiling: scores self-assessed; outside checking begins this round. | round 1 |
| adjacency | 5 | Refusal routes pinned (`PROVINCE.md:15-19`); 5 kaidoku precedent citations carried (`grep -c 'kaidoku-shokunin/corpus' SKILL.md` → 5; 2 spot-verified: r10-02:130-131, r10-01:116); sibling `/tmp` state reported, not absorbed (census:102-103). Ceiling: no formal overlap table yet. | round 1 |

## Move log

| Round | Axis | Before | After | Evidence |
|---|---|---|---|---|
| 1 | coverage + calibration | Empty coverage map, 0 knowledge notes, 22-line SKILL seed at `ff81c0f` (`git ls-tree -r --name-only ff81c0f -- corpus/` → QUALITY.md + README.md only; `git show ff81c0f:SKILL.md \| wc -l` → 22) | 3 admitted notes (539 lines — `wc -l corpus/knowledge/*.md`) + coverage rows + SKILL.md distillation (+114/−2: decision table, record envelope, session-material and rights rules, all cited); obs/inf/unknown separated, 17 unknowns, 3 rejections/incidents kept | sha256 first-12 `49f0735b0594`/`9e4d69dcd658`/`034b1e53b004` re-matched; admit + reject spot-checks agree (Primary verdicts row); anchors re-ran clean 2026-10-14 |
| 2 | depth — evidence ladder | Round-1 state: 9-item record envelope + 3-row claim-class table, all static-capture; byte-determinism proven only on a static `data:` URL (round-1 E9); cdp §7.8 (determinism beyond static content) open; no daemon-lifecycle rules; start-authority reading unresolved (`webbridge-plugin-anatomy.md:136-138`) | 3-rung evidence ladder (static bytes → dynamic capture pair → multi-signal), each rung with a measured anchor; determinism boundary measured on both sides — det-before `c08947dc…802dc1` and det-after `7488d544…4b42c7` byte-identical across two independent server+browser runs after JS mutation + real input, live-page captures differ while DOM-shape struct survives; 7 new capture rules; approval-discipline table (start = doc-authorized self-service, stop/restart/uninstall = operator-only), start executed and left running as a recorded state change (pid 3934817, `127.0.0.1:10086`) | Scribe re-runs 2026-10-14, all held: methodology shas (page `21e27aa6…1c99`, capture.mjs `d37d36dd`, driver.sh `8105bed0`, compare.mjs `e558bd54`; line counts 61/209/85/47); run1↔run2 det PNG + shape hashes identical (`compare.tsv`); ports 19411/19412 closed, no chromium survivors; daemon `ss -ltnp` pid 3934817 + 8-field `/status` shape (`extension_connected:false`); substrate pins `84a8e69d04c5`/`b811d9c23dfd` unchanged |

## Planned / retired

- **planned** (next axis-move): freshness — archive the four staged `/tmp`
  evidence dirs into durable corpus storage (`tabi3-cdp`, `tabi-audit2-cdp`,
  `tabi-r2-1-capture`, `tabi-r2-3-verify`; `cdp-evidence-patterns.md:92`) and
  land the round-1 + round-2 gate records as
  `corpus/lessons/round-{1,2}.md` (`LEARNING.md:61-62`;
  `ls -A corpus/lessons \| wc -l` → 0 today), with a strictly-later-date
  anchor recheck riding the same pass.
- **retired:** none — no axis saturated, none a wrong fit.
