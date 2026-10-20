VERDICT: PASS

# C1 freshness — rows S024, S025 (seat Recheck12)

Tool: `node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/recheck-fetch.mjs`
(producer sha256 `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`,
sha256 of the file at LANE tip `2bff864fdfee684ddbcd066cc8e735adaba2735c`).
No tool installs or upgrades were performed.

Row URLs are present verbatim in the `source` cell at the lane tip (checked with
`git -C LANE show refs/heads/master:corpus/SOURCES.md`):
- S024 line 38: `Snapshot testing — Playwright — https://playwright.dev/docs/aria-snapshots`
- S025 line 39: `ARIA Authoring Practices Guide — https://www.w3.org/WAI/ARIA/apg/`

## S024 — held

- rowUrl: `https://playwright.dev/docs/aria-snapshots`
- http: 200 (tool's own curl `-sSL --compressed --max-time 90`), bytes 125426
- sha256: `bbbad6881341619286827304e5b5202f5a9246aac8223a6508fb4feb1b7e6194`
  — identical to the 2026-10-19 seat fetch digest recorded in
  `corpus/lessons/kaika-fleet-round-1.md:67`; the body has not changed since the
  original Gate open (observed, byte-identical digest).
- quote (13 words, quoteFound=true, offset 4648): "aria snapshots provide a YAML
  representation of the accessibility tree of a page."
- quoteSource: `corpus/lessons/kaika-fleet-round-1.md:67` (§Aria snapshots)
- anchorObserved: Docusaurus v3.10.1 generator meta, `docs-version-stable` page class,
  title "Snapshot testing | Playwright". No publication/date marker in the body; the
  row's own anchor cell ("stable docs read 2026-10-19, §Aria snapshots") is the
  applicable one.
- teaches check: the body still carries the §Aria snapshots section, calls a template
  "a constraint, not necessarily a complete serialization of the accessibility tree",
  and has both `Partial matching` and `Strict matching` subsections plus
  `toMatchAriaSnapshot()` examples. The teaches cell — YAML accessibility-tree
  template matched partially or strictly, structural evidence not pixels — is still
  supported at the same section. No drift; no superseding row drafted.

## S025 — held

- rowUrl: `https://www.w3.org/WAI/ARIA/apg/`
- http: 200, bytes 39382
- sha256: `17521385704dfa9ab49fa599b78258c579aa05676aa88c6ca629c94682c3d30f`
  — identical to the 2026-10-19 seat fetch digest recorded in
  `corpus/lessons/kaika-fleet-round-1.md:68`; unchanged body (observed).
- quote (14 words, quoteFound=true, offset 542): "This guide describes how to apply
  accessibility semantics to common design patterns and widgets."
- quoteSource: `corpus/lessons/kaika-fleet-round-1.md:68` (introduction)
- anchorObserved: no revision or date marker in the body — consistent with the row's
  source cell "APG home, no revision marker, read 2026-10-19"; title
  "ARIA Authoring Practices Guide | APG | WAI | W3C". Only a `w3c-2025` asset path
  appears, which is a site asset version, not a document revision date [INFERENCE].
- teaches check: the body still says the guide covers "accessibility semantics to
  common design patterns and widgets", links "Patterns and Examples", and states
  patterns are built with "roles, states and properties and by implementing keyboard
  support". The teaches cell — which roles, names and keyboard patterns a widget
  should expose before asserting it by role — remains supported by the same home
  page. No drift; no superseding row drafted.

## Receipt files (written by the tool, schema `tabi-source-recheck-v1`)

| row | receipt sha256 | excerpt sha256 | http | bytes | quoteWords | quoteFound | verdict | fetchedAt |
|---|---|---|---|---|---|---|---|---|
| S024 | `3f6c38ee550caa51d4c58382f2fef06462f82a0c551fc26ecf177da38b834e44` | `60e5c6a3c8f33b8cc0bb2d579ab1372d2b0d3a104a4f51a27fffe518fb0ab528` | 200 | 125426 | 13 | true | held | 2026-10-20T19:05:37.569Z |
| S025 | `f35172ac7cb153d87a68dfb07dd85c7ac56dfdc754f325dcb8833ae7579f8f41` | `3452be596734d483bcc4e74f033012b522101a5ac8aa9178fe9a7dfc792cf87a` | 200 | 39382 | 14 | true | held | 2026-10-20T19:05:37.593Z |

Both normalized quotes occur in their excerpt files; `--normalize-only --decode html-text`
probes returned `found:true` before the receipt runs, and both receipt runs exited 0
with `quoteFound=true`.

## Remaining unknowns

- S024 has no date/revision marker, so "identical bytes to the 2026-10-19 fetch" is
  the only freshness signal for this row; it is direct (digest equality), not a
  date from the source.
- S025 likewise exposes no revision marker; digest equality with the original
  seat fetch is the evidence. APG content below the home page (individual pattern
  pages) was not re-opened — out of this row's contract (home page only).

## Files written

- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S024.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S024.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S025.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S025.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/Recheck12.md
