# R62Scribe — round 62 wave w1 seat report (scribe: knowledge entry + lesson Gate/Mistakes drafts)

Axes named: coverage (primary, the secondary-button knowledge domain), calibration (admit/reject honesty), adjacency (no move — no C1 assertion made). Role: evidence support for C2's knowledge entry and the round lesson's Gate/Mistakes; NOT a third claim; no post-wave results or capabilities asserted.

## Order of operations

1. Read FIRST, as contracted: `.ufo/waves/round-62/claims.json` and `.ufo/waves/round-62/instrument-pins.json` (tool reads; six pins loaded: generator `5c4a93e1…`, driver `8dae248a…`, v21 meter `b845973c…`, rebind `b627cc8b…`, counter `971c84f6…`, snapshot `1e47eb02…`).
2. All other evidence gathered read-only from retained lane artifacts.

## Commands run by this seat (exact)

| # | command (cwd `/home/vgpnk/Projects/shokunin`) | exit | result |
|---|---|---|---|
| 1 | `sha256sum tabi-shokunin/.ufo/waves/round-62/sources/s165-mdn.html tabi-shokunin/scripts/chrome-cdp-loopback-round62.mjs tabi-shokunin/.ufo/waves/round-62/counters/chromium-receipt-r62.mjs && wc -c tabi-shokunin/.ufo/waves/round-62/sources/s165-mdn.html` | 0 | s165 `1c034e35fa1bd57154ca19af3760343c7f1ea86fc9229a194659d409bcd10bc7` (188,114 B); driver `8dae248a…5c82e0` == pin; counter `971c84f6…bd5a006` == pin |
| 2 | `mkdir -p …/w1/R62Scribe` | 0 | seat dir created |
| 3 | `ls -la /fast/scratch/hyaku/tabi-r62/R62Scribe` | 2 | scratch never created (no fixture/clone work needed for a drafting seat); nothing to delete |

No browser, listener, fetch, counter run, selftest or census was started by this seat (Exec seats own those). No instrument, snapshot, registry, corpus or production file edited; no VCS mutation; no tool installed.

## Retained evidence cited (read, not produced, by this seat)

| artifact | recorded state |
|---|---|
| `.ufo/waves/round-62/claims.json` + `instrument-pins.json` | two claims only; six frozen pins; freeze rule "no post-score pin transfer" |
| `controls/mdn-fetch.command.json` | curl `--fail --location --proto =https … https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events` → staged s165-mdn.html, exit 0 |
| `.ufo/waves/round-62/sources/s165-mdn.html` | "Determining button states": intro raw 1981–1983; located row raw 2014–2016 (`Right Mouse, Pen barrel button` / 2 / 2); changed-vs-held note raw ~2037–2039 |
| `controls/contextmenu-red-before.json` | pre-freeze driver `d2718926…`; `predicate` false; `buttonHypothesis` `REFUTED`; clean teardown; own mouselog records contextmenu at press (seq 4, `ts` == mousedown 23.1, `buttons` 2, `defaultPrevented` true) |
| `controls/smoke/receipt.json` (+ PNGs) | frozen driver `8dae248a…`; nonce `tabi-r62-candidate857cf0200582`; seq 1..11 two cycles; contextmenu seq 4/9 at press, `buttons` 2, `defaultPrevented` true; `clicklog` []; `survivors` []; ports closed; curls 7/7; `predicate` true; `CONFIRMED` |
| `controls/counter-smoke.command.json` | frozen counter on smoke receipt, exit 0 |
| `controls/counter-selftest.stdout` | 16 cases, allPass true (valid + f1–f8 + nonce/driver/sequence/menuButtons/secondTarget/click/ports) |
| `controls/c2-no-work.command.json` / `.stdout` | frozen counter refuses old r61 primary-pointer receipt: exit 1, findingCount 26 (all ids listed) |
| `controls/snapshot-gen.command.json` / `.stdout` | generator exit 0; `"lanes":20`; sha `1e47eb02…` == frozen pin |
| `controls/strict-header-red.*` / `strict-header-green.*` | same v21 reader: malformed r61-style header refused; real r62 snapshot accepted |
| `.ufo/waves/round-61/w1/R61MutC2.md`, `.ufo/waves/round-61/measure/instrument-pins.json`, r61 lesson | r61 counter `222bbdd5→f615a2f9→ac5ce54b→97f10e67`; `f615a2f9` matrix archived superseded; final pin `97f10e67…d233625`; C2 UNPROVABLE |
| `corpus/lessons/round-62.md` (read-only) | pre-wave lesson already carries the Gate/Mistakes rows this seat corroborates (red-before vs smoke; r61 divergence; header discipline; generator 25→20; r61 S153 landing) |
| `w1/R62Scout.md` | S165 opened 2026-11-04T15:22:13Z, HTTP 200, 188,114 B, sha `1c034e35…` == staged; admissible/rejected claims; baseline sweep: no page-side secondary-button witness at baseline |

## Deliverables

- `.ufo/waves/round-62/w1/R62Scribe/knowledge-entry-secondary-button-round62.md` — DRAFT knowledge entry (frontmatter provenance trio first: source / verified-at / recheck; MDN mapping distinguished from local contextmenu-at-press behavior; red-before vs green smoke; r61 freeze/mutation divergence; generator masquerade prerepair-25 vs corrected-20; Gate with admit and reject-with-flip; limits). Proposed post-admission landing path (NOT written): `corpus/knowledge/chromium-secondary-button-round-62.md`.
- `.ufo/waves/round-62/w1/R62Scribe/lesson-round62-gate-mistakes-draft.md` — DRAFT lesson Gate and Mistakes rows with this seat's corroboration and the honesty note that the 25-row prerepair generator output is not retained (25-side = recorded observation; 20-side = corroborated by artifact + pin).
- This trailer.

## Not asserted (explicit)

Post-wave after-pass results, capability admission, `first-working 62`, cross-browser behavior, `auxclick`, pointer capture, keyup values, kaidoku/keyed overlap rulings (contested-open stays contested-open), any C1 green. The outside non-author spot-check remains open; dispatched seats (including this one) are lane-authored, not outside reviewers.

Scratch `/fast/scratch/hyaku/tabi-r62/R62Scribe/` was never created (command 3, exit 2) — nothing to clean.

Report: .ufo/waves/round-62/w1/R62Scribe.md
