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
- `scripts/` — the instrument families; the current generation is round 90
  (`chrome-cdp-showpicker-round90.mjs` + counter/battery/kill-power/selftest/drift)

## Round 90 coverage

The programmatic-picker capability `chromium-showpicker-linux` adds the settle-call binding:
each of the four DOM-read legs carries `window.__inputs(true)` immediately after its settle
`window.__state()` evaluate, and `plan-calls` requires that call there and forbids it elsewhere
(41 legs, 107 checks, battery 225 cases, kill power over the frozen list). The round also
repairs the six record defects the round-89 spot-check routed (census 224, source attribution,
ledger pointers, leak witness, revision naming, report author date) and counts them with
`scripts/check-record-drift-round90.mjs` (8 statements, 7 → 0).
