# Round 38 — lesson

## Gate

- **Admit S144** — https://playwright.dev/docs/browsers, accessed 2026-10-27. Located quote, §Firefox: “Playwright doesn't work with the branded version of Firefox since it relies on patches.” (14 words). This grounds the distinction between Playwright's patched Firefox/Juggler capability and branded Firefox; the knowledge entry cites S144 and the registry row is mined.
- **Reject WebKit install as this round's capability candidate** — source and host evidence: Playwright WebKit 27.2 downloaded from the official Playwright CLI package, but `ldd ~/.cache/ms-playwright/webkit-2370/minibrowser-gtk/bin/MiniBrowser` showed missing `libicu*.so.74`, libflite, libjxl, and other libraries on Arch; installing system dependencies is barred by the pacman pause. Flip: a compatible WebKit runtime and its dependencies are available without a pacman transaction.
- Outside spot-check pending: no independent non-author reviewer has yet recorded an admit/reject judgment. A dispatched seat is not an outside reviewer.

## Mistakes

- **M1, class `self-assessment-overclaim` — round-37 verifier spot-check, routed defect 1, `corpus/lessons/round-37-verifier-spotcheck.md` §Routed defects. Captured-by: none at round 37; the prose correction rule did not require a counter-derived seat count. Fix: retain the stale SCORECARD line and append a correction only when it names the true wave result; re-derive from committed `w1-results.json` (34 seats) and absence of w2 dispatch/results.** The old 68-seat claim remains historical and is not silently erased.

## Census

Round-start command: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` — exit 0, 143 registry rows, `tabi ok`; full warning output was observed at round start. Round-end validation returned exit 0 and `tabi ok`; captured output at `.ufo/waves/round-38/measure/census-end.txt` (the registry parser's counts are reported in the round report).

## Assimilation and frontier

Assimilation: none. Package quarantined rows remain closed pending the required hand-check; no staged theme was opened/adopted for these claims. No `considerthese/` directory exists in this lane.
