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

## Axes — initial pinning (round 1)

| Axis | Score | Evidence pointer (counting command) | Last change |
|---|---|---|---|
| depth | 3 | Decision table (3 claim-class rows + network-HAR trap), 9-item record envelope, session-material rules, rights/rate boundary — every rule carrying a note citation (`grep -c 'corpus/knowledge/' SKILL.md` → 24; sections `SKILL.md:29-134`). Ceiling: only 3 admitted notes; no live-site gotchas measured yet. | round 1 |
| coverage | 2 | 3 notes over 3 of PROVINCE's owned surfaces — plugin anatomy, browser/profile census, CDP session discipline (`ls corpus/knowledge/*.md \| wc -l` → 3); site-gotcha and rate/rights records explicitly unmeasured (`SKILL.md:118-120`). | round 1 |
| operability | 3 | Launch/cleanup/evidence recipes are re-runnable and their anchors re-ran clean 2026-10-14; every SKILL rule cites a re-run anchor. Ceiling: no repo-local gate scripts yet (`ls corpus/*.sh scripts/` → none). | round 1 |
| freshness | 2 | sha256 pin block with a declared staleness rule (`SKILL.md:21-27`, re-matched 2026-10-14); notes carry capture dates. Ceiling: nothing re-verified on a date later than capture; TABI-3 evidence bytes still `/tmp`-staged (`cdp-evidence-patterns.md:92`). | round 1 |
| calibration | 4 | Observation/inference/unknown separated in all three notes; 17 unknowns enumerated (anatomy U1–U4, census U1–U5, cdp §7 1–8); 3 rejections/incidents kept (census:40, cdp:17, cdp:105); errata sections present and append-only in all three; SHONEN gates still open with TBD verifiers — honest, not marked. Ceiling: scores self-assessed; outside checking begins this round. | round 1 |
| adjacency | 5 | Refusal routes pinned (`PROVINCE.md:15-19`); 5 kaidoku precedent citations carried (`grep -c 'kaidoku-shokunin/corpus' SKILL.md` → 5; 2 spot-verified: r10-02:130-131, r10-01:116); sibling `/tmp` state reported, not absorbed (census:102-103). Ceiling: no formal overlap table yet. | round 1 |

## Move log

| Round | Axis | Before | After | Evidence |
|---|---|---|---|---|
| 1 | coverage + calibration | Empty coverage map, 0 knowledge notes, 22-line SKILL seed at `ff81c0f` (`git ls-tree -r --name-only ff81c0f -- corpus/` → QUALITY.md + README.md only; `git show ff81c0f:SKILL.md \| wc -l` → 22) | 3 admitted notes (539 lines — `wc -l corpus/knowledge/*.md`) + coverage rows + SKILL.md distillation (+114/−2: decision table, record envelope, session-material and rights rules, all cited); obs/inf/unknown separated, 17 unknowns, 3 rejections/incidents kept | sha256 first-12 `49f0735b0594`/`9e4d69dcd658`/`034b1e53b004` re-matched; admit + reject spot-checks agree (Primary verdicts row); anchors re-ran clean 2026-10-14 |

## Planned / retired

- **planned** (next axis-move): freshness — archive the `/tmp/tabi3-cdp`
  evidence bytes into durable corpus storage (`cdp-evidence-patterns.md:92`),
  land the round-1 gate record as `corpus/lessons/round-1.md`
  (`LEARNING.md:61-62`; `ls -A corpus/lessons \| wc -l` → 0 today), and
  re-verify the three notes' anchors on a date later than capture.
- **retired:** none — no axis saturated, none a wrong fit.
