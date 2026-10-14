# Round 1 lessons — tabi-shokunin (2026-10-14)

Probation wave 1 (the lane was minted the same day, `MINT.md`): three field
lanes — TABI-1 plugin anatomy, TABI-2 browser census, TABI-3 CDP discipline —
plus a scribe lane. Axis move: coverage + calibration (`SCORECARD.md:66-68`).
Evidence: commit `7961735`, `LOG.md:5-28`, `SCORECARD.md:18-24`.

## What landed

- 3 admitted notes, 539 lines (`wc -l corpus/knowledge/*.md`, `LOG.md:9`;
  numbered lines 224/198/120 — `git show --numstat 7961735`):
  `webbridge-plugin-anatomy.md` (substrate contract; daemon endpoint not
  called), `browser-surface-census.md` (profile trees shape-only),
  `cdp-evidence-patterns.md` (re-runnable loopback CDP recipe).
- SKILL.md +114/−2 (`SCORECARD.md:68`): interaction-evidence decision table,
  record envelope, session-material shape-only and rights/rate rules — every
  rule cited (`grep -c 'corpus/knowledge/' SKILL.md` → 24, `LOG.md:12`).
- Coverage map 0 → 3 rows; axes pinned with counting commands; 17 unknowns
  enumerated, 3 rejections/incidents kept (`SCORECARD.md:68`).

## Method lessons

- Read-only substrate inspection with the endpoint deliberately uncalled
  (`webbridge-plugin-anatomy.md:4-6`) — the pattern every later round reused.
- A config directory is not an installation: the chrome-family "installs"
  are `NativeMessagingHosts/` shells (`browser-surface-census.md` §1.2) —
  the rejection kept as the round's calibration asset.
- Cleanup must be verified: the `pkill -f` self-match killed the invoking
  shell before its verification steps; kill by PID — an unverified kill is
  an unknown, not a cleanup (`cdp-evidence-patterns.md:105`).

## Gate

- Candidates: the three wave-1 survey notes, each measured on the real
  surface and proposed with its own pins; the SKILL distillation rode the
  same pass.
- Admitted: all three, each with a coverage row (the map was empty before —
  `git ls-tree -r --name-only ff81c0f -- corpus/` → QUALITY.md + README.md
  only, `SCORECARD.md:68`).
- Rejected, with reasons and kept: (1) "Brave/Chrome/Vivaldi are installed
  because their config dirs exist" — no binary, no package, NMH shell only
  (`browser-surface-census.md:40-43`); (2) the python websocket client as a
  CDP path — `ModuleNotFoundError` for both modules
  (`cdp-evidence-patterns.md:17`); (3) incident: the `pkill -f` self-match
  kept as calibration (`cdp-evidence-patterns.md:105`).
- Spot-check (non-author — the scribe lane): agrees with the gate on one
  admit (manifest↔skill version `1.11.3`; `grep -n '"version"'
  kimi.plugin.json` → :4) and one reject (Brave →
  `NativeMessagingHosts` only) (`SCORECARD.md:24`); anchor spot-checks
  anatomy §8.1-8.4, cdp :36/:105/:84-85, census :54 all held
  (`LOG.md:16-21`).
- Re-run (this lesson, 2026-10-14): `git show 7961735:<path> | sha256sum`
  first-12 → `49f0735b0594` / `9e4d69dcd658` / `034b1e53b004` — all match.
  Current-file shas differ by design: the notes have received append-only
  errata every later round; the round-1 pins are as-of `7961735`.
- Falsifier: an anchor that does not re-resolve; an admission without a
  coverage row.
- Carried debt out of this round: `corpus/lessons/` empty (this file lands in
  the round-5 freshness pass); `/tmp/tabi3-cdp/` unarchived
  (`cdp-evidence-patterns.md:92`).