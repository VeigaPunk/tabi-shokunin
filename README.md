# tabi-shokunin

A **shokunin lane** — an expert agent for one domain, minted and trained
under the [shokunin skill](https://github.com/VeigaPunk/shokunin).

**Domain:** browser & web-interaction craft

**Wiki:** [Devin wiki](https://app.devin.ai/org/veigapunk/wiki/VeigaPunk/tabi-shokunin?branch=master)

## What's here

- `SKILL.md` — the distilled expertise: decision tables, error patterns,
  checklists (absent on lanes still in shonen seed form — see `corpus/`)
- `PROVINCE.md` — the owned domain boundary and refusals
- `SCORECARD.md`, `SKILL.md` gate registries and `corpus/` — the measured record
- `scripts/` — the instrument families; the current generation is round 91
  (`chrome-cdp-showpicker-proxy-round91.mjs` + counter/battery/kill-power/selftest/drift)

## Round 90 coverage

The programmatic-picker capability `chromium-showpicker-linux` adds the settle-call binding:
each of the four DOM-read legs carries `window.__inputs(true)` immediately after its settle
`window.__state()` evaluate; `plan-calls` requires that call there and compares it in the ordered
sequence, and `send-log-allowlist` forbids it elsewhere (41 legs, 107 checks, battery 226 cases,
kill power over the frozen list). The round also
repairs the six record defects the round-89 spot-check routed (census 224, source attribution,
ledger pointers, leak witness, revision naming, report author date) and counts them with
`scripts/check-record-drift-round90.mjs` (8 statements, 7 → 0).

## Round 91 coverage

The new capability `chromium-showpicker-proxy-linux` reaches the same file/date/colour input shapes
in a same-origin and a cross-origin iframe through a `window.postMessage` proxy that accepts only
the served parent origin: no activation → `NotAllowedError` in both; a parent click → success and
one parent-owned chooser same-origin, `NotAllowedError` cross-origin; a child click → success and
one child-owned chooser cross-origin; date → `SecurityError` in both activation states; colour →
success with no FILE chooser; an answered child chooser delivers the file to the child input while
the parent stays empty; direct cross-origin access is `contentDocument:null` + `SecurityError`
(15 legs, 30 checks, battery 44 cases, kill power 32/32). The round also repairs the six
lane-measurable record defects the round-90 spot-check routed (§8 items 1, 2, 3, 5, 7, 8) and
counts them with `scripts/check-record-drift-round91.mjs` (8 statements, 8 → 0); §8 items 4 and 6
are fleet-report/process items, disclosed and not counted.
