# Round 38 — lesson

## Gate

- **Admit S144** — https://playwright.dev/docs/browsers, accessed 2026-10-27. Located quote, §Firefox: “Playwright doesn't work with the branded version of Firefox since it relies on patches.” (14 words). This grounds the distinction between Playwright's patched Firefox/Juggler capability and branded Firefox; the knowledge entry cites S144 and the registry row is mined.
- **Reject WebKit install as this round's capability candidate** — source and host evidence: Playwright WebKit 27.2 downloaded from the official Playwright CLI package, but `ldd ~/.cache/ms-playwright/webkit-2370/minibrowser-gtk/bin/MiniBrowser` showed missing `libicu*.so.74`, libflite, libjxl, and other libraries on Arch; installing system dependencies is barred by the pacman pause. Flip: a compatible WebKit runtime and its dependencies are available without a pacman transaction.
- Outside spot-check pending: no independent non-author reviewer has yet recorded an admit/reject judgment. A dispatched seat is not an outside reviewer.

## Mistakes

- **M2, class `surface-mismatch` — round-37 verifier spot-check routed defect 4. Captured-by: W2 RevFrozenDigests at `corpus/lessons/round-36.md`'s routed defect 4. Fix attempted: add a mutated-sentence red control for predicate text identity. This attempt did not land a counter that enforces the byte-identity check and did not produce `.ufo/waves/round-38/baseline/m3-sentence-mutant.json`; the defect remains open and C1 is not met.**

## Census

Round-start command: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin tabi` — exit 0, 143 registry rows, `tabi ok`; full warning output was observed at round start. Round-end validation returned exit 0 and `tabi ok`; captured output at `.ufo/waves/round-38/measure/census-end.txt` (the registry parser's counts are reported in the round report).

## Assimilation and frontier

Assimilation: none. Package quarantined rows remain closed pending the required hand-check; no staged theme was opened/adopted for these claims. No `considerthese/` directory exists in this lane.


