# tabi-shokunin — Scorecard

Lane axes per AXES.md (six-axis vocabulary; primary verdicts per
LEARNING.md trends). Probation rounds 1-3 build the initial measurements.
Axes will be pinned with their counting commands as rounds land.

State at writing (2026-10-14, TABI-B4 scribe, round-3 record): repo HEAD
`5d2e95d` (round-2 integration) with the round-3 work uncommitted in the
tree — `git status --short` → `M SKILL.md` (+512/−178),
`?? corpus/knowledge/` (3 new notes), `?? plans/round-3.plan.md`. Every
score below was measured against that working tree (`5d2e95d` plus the
uncommitted round-3 files); the integration commit supersedes the pointer,
not the counts — re-run the commands. `SKILL.md` moved three times inside
the round (executor-test-sufficiency.md §8) — the round-3 notes stamp
their SKILL refs by revision sha; the final revision is sha256
`452bc514d387` (576 lines), re-derived by the scribe.

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

## Primary verdicts — round 3 (three trends, `LEARNING.md:23-36`)

Recorded 2026-10-14 by TABI-B4 (scribe; probation-completing round; seats
TABI-R3-1 journey, TABI-R3-2 approval table, TABI-R3-3 SKILL integration +
anchor re-derivation + smoke replay, TABI-R3-4 executor test; TABI-B1 r3b
audit in flight at record time — scratch created, empty). Axis moves:
**depth** (journey evidence) + **calibration** (approval table finalized),
per `plans/round-3.plan.md`.

| Trend | Verdict | Evidence |
|---|---|---|
| expansion | improved | 5 → 8 admitted notes, all three new ones on ground the coverage map did not hold (multi-step journey evidence; interaction-approval taxonomy; no-oral-context sufficiency testing), each now carrying a coverage row (`ls corpus/knowledge/*.md \| wc -l` → 8; new-note sha pins `67447c028e90` / `70ce826303d0` / `1262708864db` re-matched 2026-10-14). |
| quality | improved | No admitted entry false-or-stale-unmarked: TABI-R3-3 re-derived all five prior-note pins + substrate pins (`anchors.txt`; scribe re-matched), and the SKILL.md final revision applies the executor's errata E1–E5 (count definition `:158-159`, two-click delta `:313` — re-read by the scribe in `SKILL.md@452bc514d387`). Cross-seat reproduction: the r2 capture chain byte-reproduced a third time (TABI-R3-3 smoke), and the executor test reproduced r2's det-before `c08947dc…802dc1` across its own two runs. Nit recorded, not silently fixed: SKILL §Pins quotes the executor note as "297 lines", `wc -l` → 298 (sha matches — annotation slip; LOG round-3 entry). |
| discernment | improved | Outside spot-check by the scribe (non-author of all three notes), per `LEARNING.md:37-43`: agrees with all three round-3 admits after re-running their anchors (journey methodology + run1 PNG shas; approval-table counts 6 C-rows / 12 A-rows; executor methodology pins + compare.tsv 10 yes / 3 expected-NO); re-ran the standing Brave reject → `NativeMessagingHosts` only (agree, third consecutive round). |

## Axes — initial pinning (round 1)

| Axis | Score | Evidence pointer (counting command) | Last change |
|---|---|---|---|
| depth | 7 | **Round-3 move.** The 3-rung ladder now extends to a multi-step journey: 4-page loopback site traversed by real clicks/`insertText`/GET submit, six per-step captures per run, two cold runs byte-identical + two preserved warm runs (compare.tsv 25 IDENTICAL / 3 expected DIFFER), browser-side navigation-history witness (`typed`/`link`/`form_submit` — browser-labeled, not driver-labeled), state class parsed from raw DOMSnapshot columns (`-1` empty sentinel; shape text carries no live values), and both network surfaces kept with the wire-304-vs-client-200 boundary measured on both sides (`multi-step-journey.md:71-197,229-251`). Ceiling: real-site journeys untested (journey §8.6); byte-identity environment-scoped; evidence still `/tmp`-staged. | round 3 |
| coverage | 5 | Rider of the round-3 moves: 8 notes over PROVINCE's owned surfaces — new: multi-step journey evidence, interaction-approval taxonomy (rights/rate/consequence for 6 classes + 12 gates), no-oral-context sufficiency discipline (`ls corpus/knowledge/*.md \| wc -l` → 8). Site-gotcha and rate/rights records still unmeasured (bounded-runs rule forbids asserting unmeasured); extension↔daemon handshake still open. | round 3 |
| operability | 5 | Rider: SKILL.md now carries a copy-paste 13-step runbook executed verbatim start-to-finish by a fresh document-only executor, twice, with closure proof (`executor-test-sufficiency.md` §1–§2; compare.tsv 10 yes / 3 expected NO), and a third fresh server+browser pair reproduced the r2 chain (TABI-R3-3 smoke). Every SKILL rule cites a re-run anchor; §Pins re-derived this round. Ceiling: no repo-local gate scripts yet (`ls corpus/*.sh scripts/` → none); the archive step is obstructed by write scope (executor G4). | round 3 |
| freshness | 3 | Rider: all five prior-note pins re-derived this round by TABI-R3-3 (`anchors.txt`) and re-matched by the scribe; SKILL §Pins refreshed to the round-3 notes; SKILL moved three times in-round and the notes version-stamp their refs (disclosed, not silent). Ceiling: re-checks are same-day-later, not a strictly-later date; thirteen `/tmp` evidence groups unarchived. | round 2 |
| calibration | 6 | **Round-3 move.** Approval table finalized: every interaction class mapped to autonomous-now / operator-asleep-blocked / operator-approval-required (two tenses, one gate) / never-lane-executed, each with rights·rate·consequence, an unblock gate and a falsifier (6 required classes + 12 adjacent gates — `grep -c '^| \*\*C'` / `'^| \*\*A'` on interaction-approval-table.md → 6 / 12), SKILL.md's table agreed bin-for-bin; the never-set held through an operator-asleep round; new calibration incidents kept (the `-1`-sentinel phantom-value trap, journey §3; wire-vs-client 304/200, journey §5); 22 new unknowns enumerated (journey §8, approval U1–U8, executor §5); SHONEN gates now carry named verifiers — the round-2 ceiling resolved. Ceiling: scores self-assessed; rate/ToS datum still unmeasured (approval U1); wake-state unmeasurable (U2); unarchived hashes provisional (executor G4). | round 3 |
| adjacency | 5 | Refusal routes pinned (`PROVINCE.md:15-19`); 5 kaidoku precedent citations carried (`grep -c 'kaidoku-shokunin/corpus' SKILL.md` → 5; 2 spot-verified: r10-02:130-131, r10-01:116); sibling `/tmp` state reported, not absorbed (census:102-103). Ceiling: no formal overlap table yet. | round 1 |

## Move log

| Round | Axis | Before | After | Evidence |
|---|---|---|---|---|
| 1 | coverage + calibration | Empty coverage map, 0 knowledge notes, 22-line SKILL seed at `ff81c0f` (`git ls-tree -r --name-only ff81c0f -- corpus/` → QUALITY.md + README.md only; `git show ff81c0f:SKILL.md \| wc -l` → 22) | 3 admitted notes (539 lines — `wc -l corpus/knowledge/*.md`) + coverage rows + SKILL.md distillation (+114/−2: decision table, record envelope, session-material and rights rules, all cited); obs/inf/unknown separated, 17 unknowns, 3 rejections/incidents kept | sha256 first-12 `49f0735b0594`/`9e4d69dcd658`/`034b1e53b004` re-matched; admit + reject spot-checks agree (Primary verdicts row); anchors re-ran clean 2026-10-14 |
| 2 | depth — evidence ladder | Round-1 state: 9-item record envelope + 3-row claim-class table, all static-capture; byte-determinism proven only on a static `data:` URL (round-1 E9); cdp §7.8 (determinism beyond static content) open; no daemon-lifecycle rules; start-authority reading unresolved (`webbridge-plugin-anatomy.md:136-138`) | 3-rung evidence ladder (static bytes → dynamic capture pair → multi-signal), each rung with a measured anchor; determinism boundary measured on both sides — det-before `c08947dc…802dc1` and det-after `7488d544…4b42c7` byte-identical across two independent server+browser runs after JS mutation + real input, live-page captures differ while DOM-shape struct survives; 7 new capture rules; approval-discipline table (start = doc-authorized self-service, stop/restart/uninstall = operator-only), start executed and left running as a recorded state change (pid 3934817, `127.0.0.1:10086`) | Scribe re-runs 2026-10-14, all held: methodology shas (page `21e27aa6…1c99`, capture.mjs `d37d36dd`, driver.sh `8105bed0`, compare.mjs `e558bd54`; line counts 61/209/85/47); run1↔run2 det PNG + shape hashes identical (`compare.tsv`); ports 19411/19412 closed, no chromium survivors; daemon `ss -ltnp` pid 3934817 + 8-field `/status` shape (`extension_connected:false`); substrate pins `84a8e69d04c5`/`b811d9c23dfd` unchanged |
| 3 | depth — journey evidence | Round-2 state: the ladder ended at a single-page dynamic pair (JS hydration + one click); multi-step ground open (the r2 note's own §7 blind spot); no per-step record shape, no browser-side action witness, one network surface, state class unreadable from shape text | 4-page loopback journey (index → detail → form → confirm) structured as per-step idle→action→result triplets: 6 captures × 2 cold runs byte-identical (compare.tsv 25 IDENTICAL / 3 expected DIFFER) + 2 preserved warm runs; navigation-history witness (`typed`/`link`/`form_submit` — browser-labeled, independent of the driver); state class parsed from raw DOMSnapshot columns (hollow `{index,value}` encoding, `-1` empty sentinel — shape text carries no live values); both network surfaces kept — wire 304 vs client 200 measured on both sides; 7 journey rules folded into the SKILL envelope | Scribe re-runs 2026-10-14, all held: methodology shas re-hashed from `/tmp/tabi-r3-1-journey/` (journey.mjs `b52074a33876`, driver.sh `9509c07f49f9`, compare.mjs `ecce1c73dc56` + 6 fixture files); run1 step PNGs re-hashed = the note's §2 pins; compare.tsv verdicts re-counted 25/3; ports 19421/19422 closed, no chromium/`http.server` survivors |
| 3 | calibration — approval table finalized | Round-2 state: the authority table covered daemon start/stop only; the six interaction classes (operator's own sites, third-party read-only, third-party consequential, login-required, rate-limited, loopback) unmapped; rate/rights existed only as "do not assert an unmeasured surface" | Every class mapped to autonomous-now / operator-asleep-blocked / operator-approval-required (two tenses, one gate) / never-lane-executed, each with rights·rate·consequence, an unblock gate and a falsifier; A1–A12 adjacent gates (daemon start/stop/`/status`, trusted-input `cdp` escape hatch, tab borrowing, version mismatch, iframes, Windows request bodies, tab closing); never-set (consequential external acts, session-material content-reads, out-of-province work); SKILL.md's distilled table reconciled bin-for-bin; dispositions exercised under the asleep anti-claim — only C1 executed this round | `grep -c '^| \*\*C'` → 6 and `grep -c '^| \*\*A'` → 12 (re-ran by scribe 2026-10-14); the executor test ran under C1's authority and honored the C3/external block from SKILL.md alone; the standing Brave reject re-ran → agree; live daemon read matches the recorded A1/A2/A4 state (pid 3934817, still listening, operator stop owed) |

## Planned / retired

- **planned** (next axis-move): freshness — archive the thirteen staged
  `/tmp` evidence groups into durable corpus storage (fixture bytes first,
  executor G1; `cdp-evidence-patterns.md:92`) and land the round-1/2/3 gate
  records as `corpus/lessons/round-{1,2,3}.md` (`LEARNING.md:61-62`;
  `ls -A corpus/lessons \| wc -l` → 0 today), with a strictly-later-date
  anchor recheck riding the same pass and the SKILL §Pins line-count nit
  (executor note "297" → 298) corrected by the owning seat.
- **retired:** none — no axis saturated, none a wrong fit.
| 4 | coverage | round-3 state | network-evidence rung + async-step + hygiene sweep (webbridge daemon found OOM-dead — environment event recorded, operator return-to-baseline still owed) | wave-4 32-lane; AUD-TAB1 |
| 5 | freshness | round-4 state | four-clause claim: evidence archived w/ manifest-pin equality, 4 lesson files with Gates, pins re-derived later-date, approval packet filed + one l0-questions line | wave-5 32-lane |
| 6 | freshness + calibration | round-5 state | external-class fixture v2 (loopback) | wave-6 32-lane (2 lanes rerouted alibaba->hyper) |
| 7 | calibration + freshness | round-6 state | layer-routing synthesis (claim-class->layer table) | wave-7 32-lane (3 rerouted alibaba->hyper) |
| 8 | depth | round-7 state | the stateful-fixture evidence (session/cookie-shaped state, multi-visit, non-idempotent steps) + an independent VER-B8-1 re-run appended (7/7 runs exact) | wave-8 32-lane (2 rerouted alibaba->hyper) |
| 9 | depth | round-8 state | the state-changing matrix (10 idempotency classes, replay contract, the token-state decision table) | wave-9 32-lane (2 rerouted alibaba->hyper) |
