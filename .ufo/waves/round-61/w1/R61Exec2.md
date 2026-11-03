# R61Exec2

Implemented `scripts/chrome-cdp-loopback-round61.mjs` (sha256 `ed712fb8148b9d41f95c239e25b7821c9d8cb46fb03f0de06a8b2129349388d8`).

Hypothesis CONFIRMED; complete smoke exit 0, predicate true; 27 prefix readbacks; 54 page key events; zero Chromium survivors; both ports closed; post-kill curls 7/7. Smoke receipt sha256 `3ad62723cf7e16b9bd6bbefa8a9f3c00e41d36b61413c4c85c834c8441088e0b`.

Full evidence, commands, pins, deviations and integration risks: `.ufo/waves/round-61/w1/R61Exec2/report.md`. In particular mousedown/mouseup do not have pointerType/pointerId; pointer* entries are all mouse/trusted/id 1. CDP left enum yields DOM button 0. Shared r59 envelope retained without forbidden Enter/legacy unrelated legs; counter compatibility remains parent-owned. Scratch removed.

Report: .ufo/waves/round-61/w1/R61Exec2/report.md
