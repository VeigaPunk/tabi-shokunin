# Round 4 lessons — tabi-shokunin (2026-10-14)

Training round 4 (fleet "training r3"), 32-lane wave — seats T4-1 network
rung, T4-2 async step, T4-3 hygiene sweep, plus the ERR-B errata sweep, the
AUD-TAB1 regression audit and the T4-4 poll. Axis move: coverage (depth
rider: the network rung) (`plans/round-4.plan.md:3-9`; `SCORECARD.md:83`).
Evidence: commit `282fc6d`; `LOG.md:131` (one-line entry); the in-flight
record `plans/round-4-record-draft.md` (420 lines); `reports/r4-aud-tab1.md`
(168 lines).

## What landed

- 3 admits, 8 → 11 notes — numbered lines added 606 / 279 / 255
  (`git show --numstat 282fc6d`; `wc -l` today → 605 / 278 / 254, this
  corpus's no-trailing-newline convention):
  `network-evidence-rung.md` — ladder rung 4: per-request client model + wire
  truth + byte truth + page-side `PerformanceResourceTiming` witness + the
  server's own log; byte equation closed; wire/client reconciliation incl.
  client aborts; three cold runs byte-identical + fresh-cache + revalidating
  runs;
  `async-step-evidence.md` — held-request pre/post pair across visual / state
  / network layers (CDP `Fetch` hold at Request stage), six runs in two
  dispatch groups;
  `hygiene-sweep-r4.md` — rounds-1-3 closure: every port closed incl. the
  audit ports, no chromium/servers, daemon end-state (§ below); its §7 E2
  resolves the 297/298 line-accounting nit, E3 closes the audit-port closure
  gap.
- ERR-B appended errata to all 8 prior notes (pure appends; each block quotes
  its pre-append sha = the round-4 pin snapshot) — incl. reinstating the cdp
  launch-window listing as replayable and calibrating the journey
  wire-variant as per-run.
- AUD-TAB1 re-ran the r3 journey + the r1 probe on fresh ports: 12-row
  verdict table — 11 PASS + 1 VARIANT; byte-identity now across three cold
  runs on three port pairs; the VARIANT routed to the owner and applied as
  journey errata — never silently rewritten.
- SKILL.md +208/−43 → `1e2f87caddff` (741 lines); §Pins carries the round-4
  notes; the rung is distilled into the evidence-ladder and claim-class
  tables.
- Environment event: the webbridge daemon died in the ~13:11 session-cycle /
  OOM teardown (child of the old session manager, pid 1573) — round-2's D2
  "operator stop owed" is moot; a stale pid pointer remains
  (`hygiene-sweep-r4.md` §4; `plans/round-4-record-draft.md:147-199`).

## Method lessons

- Record an environment event as an event, not a cause: the OOM victim list
  is unmeasured and stays unknown; the session-manager chain is measured,
  the direct-kill mechanism stays inference; peer coredumps are context,
  never attribution (draft §3).
- A run-variant is not a falsification: with capture bytes byte-identical, a
  repeated stylesheet's wire path varied (client re-serve vs wire-304); the
  general rule — "the client status is not wire truth; keep both surfaces" —
  held and strengthened; the count is marked per-run measured.
- Second self-match incident, new route: `ps | grep` selecting the shell's
  own command line (AUD-TAB1 §4); rule restated — an unverified kill is an
  unknown; character-class the pattern or verify after.
- Anti-claim held, with a witness: no external site loaded or interacted with
  (loopback fixtures only), while the browser's own GCM registration produced
  3 `google_apis/gcm` log lines in one run — loopback ≠ no-egress again
  (`network-evidence-rung.md` §7.2).
- At 32 lanes, one file per seat + append-only errata kept the record
  reconcilable; the draft's own corrections (E1/E2) are errata, not rewrites.

## Gate

- Candidates: the three R4 notes; the ERR-B sweep; the AUD-TAB1 audit; the
  T4-4 poll. Admitted: the three notes, committed in `282fc6d`; coverage rows
  and trend-verdict rows still owed at lesson time (`corpus/README.md:5-7`
  still says 8 notes / 1944 lines — re-checked 2026-10-14).
- Rejected / deferred, with reasons: the OOM direct-kill mechanism and victim
  list (unmeasured — per-process evidence absent); the fixture-branch
  question (the first-dispatch snapshot in the draft vs the landed notes) —
  each landed note pins its own fixture revision, no single branch was forced
  (`async-step-evidence.md` §8.8); `/command` auth (still unprobed); the
  wire-variant delta (routed to the owner, errata-applied).
- Spot-check (non-author — SCR-B, author of no note): SC-A methodology
  re-derivation 12/12 MATCH; SC-B sweep `PINS.txt` 8/8; SC-C daemon state
  change (alive 13:08:46 → gone 16:24Z); SC-D corpus pins 8/8, substrate
  3/3, Brave reject re-run → agree (draft §8). AUD-TAB1 §8 names three more
  (pins re-derived before use; cross-run byte diff; independent cleanup
  proof). ERR-B's pre-append hashes equal the pin snapshot file-for-file.
- Falsifier: a rung claim whose byte equation does not close; an errata
  append that is not a pure append; a daemon state asserted without its
  evidence class.
- Carried debt out of this round: 18 `/tmp` evidence groups (rounds 1-3 plus
  round 4 — archive owed, the round-5 freshness pass); README coverage rows +
  round-4 verdict rows; every new run's bytes still `/tmp`-staged
  (`cdp-evidence-patterns.md:92`).