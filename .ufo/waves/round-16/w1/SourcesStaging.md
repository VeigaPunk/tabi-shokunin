# SourcesStaging — wave 1 report (round 16)

Seat: TabiR16.SourcesStaging. Scope: `.ufo/waves/round-16/sources-staging.json` (new) + this report.

## Files changed

- `.ufo/waves/round-16/sources-staging.json` — staged constraint encoding for `corpus/SOURCES.md` row admission, covering both validators plus contract v1, and candidate shapes for S030–S036. Advisory only; L1 owns all real `corpus/SOURCES.md` edits.

## Basis (read this session)

- `scripts/check-sources.mjs` (lane gate) — full file.
- `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` (fleet validator) — full file, read-only.
- `/home/vgpnk/Projects/kimi-shokunin/skills/shokunin/protocol/CORPUS.md` §SOURCES.md contract v1.
- `corpus/SOURCES.md` — 29 rows live, max id S029; queued S020/S021/S022, rejected S026/S027, mined 24.
- `.ufo/waves/round-16/PLAN.md` — ownership table: L1 only writes `corpus/SOURCES.md`.

## What the staging file encodes

- Row/column contract: 11 cells ⇒ `split('|')` length 13; `id` `S[0-9]{3,}`; kinds spec/docs/paper/code/tool/dataset/talk/book/community/own-work; tiers A/B/C (community never A); statuses queued/mined/rejected; `opened` strict ISO + real calendar; `recheck` ISO | `^[0-9]+d$` | `on-release` (gate) vs ISO | `NNd` | any symbolic word (fleet); `used-by` comma/semicolon-separated repo-relative paths or single `—`.
- used-by existence/citation rule: gate stats every non-`—` path on **every** status — must be a regular file inside root (escape-checked via nearest-real-ancestor realpath), and must literally contain the row id under `(?<![A-Za-z0-9])S0NN(?![0-9])`; fleet checks only mined rows for existence. `mined` + `—` used-by is a **hard gate finding** (`mined_without_used_by`), only W03 under fleet.
- Candidate shapes S030–S036 validated by constraint reasoning (each marked `validates: true` in the JSON), including the two in-place edits PLAN requires: S020 queued→mined and the S002 used-by append once `corpus/knowledge/webmcp-chromium-loopback-round-16.md` exists and cites the ids.

## Traps found (high-value)

1. **Cadence words.** Fleet accepts any symbolic `recheck` (`annual`, `on-change`, `quarterly`); the lane gate accepts only `on-release` among words, else `bad_recheck`/E09. Contract v1 names only `90d`, `180d`, `on-release`. Round-14 already hit this (SOURCES.md search-log line 62: "on-change→365d was corrected to the lane parser's supported cadence vocabulary").
2. **`—` usage.** U+2014 em dash is the only blank marker for `used-by`; `''` ⇒ `used_by_empty`, `'-'`/`'none'` are treated as real paths and fail existence. Conversely `—` in `anchor` ⇒ `bare_anchor`.
3. **Citation-boundary regex.** A used-by file containing `S0300` or `xS030` does **not** satisfy S030's citation check (`used_by_uncited`). The new knowledge note should literally contain e.g. `source: S020` lines.
4. **Gate checks queued/rejected used-by too.** A queued row carrying a path that doesn't exist or doesn't cite the id is fleet-clean but gate-failed — keep `—` until the file lands.
5. **mined needs a live citation.** Status `mined` requires ≥1 existing, citing used-by path *in the same commit-adjacent state the gate sees*; L1 must write the knowledge note before/with the status flip.
6. **Supersedes position.** Gate's duplicate-URL exemption requires `teaches` to *start* with `supersedes S0NN` (`/^supersedes S[0-9]{3,}\b/`); fleet accepts it anywhere. A correction row whose teaches leads with anything else ⇒ E04.
7. **Duplicate-URL divergence.** Gate dedups URL globally; fleet is URL+scope (different scope ⇒ W04 warning only). A same-URL/different-scope row is a hard gate failure.
8. **Future `opened`.** Gate has no future check; fleet E08 fails opened > today. Write `opened` ≤ validation date.
9. **Column-zero.** Gate row/section matching anchors `^|` and `^## `; a 1–3-space-indented row is counted by fleet but invisible to the gate (row counted in census, silently unvalidated). Keep rows at column zero.
10. **`|` inside any cell** breaks NF=13 ⇒ E01; no escaping exists.
11. **`watch` is not a status** (E07); `community` at tier A ⇒ E10; `rejected` teaches must contain literal `REJECTED:` and `flip:`.
12. **Whole-file credential scan**: `op://`, `BEGIN…PRIVATE KEY`, `ghp_`, `AKIA`, `xox` anywhere (even prose) ⇒ `credential_material`.
13. **Registry file must be plain regular UTF-8** — symlink/dir ⇒ exit 2 could_not_evaluate.

## Validation performed

- `node scripts/check-sources.mjs --self-test` → `SOURCES_SELFTEST verdict=clean cases=26`, exit 0. Read-only (mkdtemp fixtures only). Observed 2026-10-20.
- Census was **not** run on the live file (per assignment); candidate validation is constraint reasoning. L1 re-runs both validators after integration.

## Risks / blockers

- None blocking. Residual: S030–S036 ids are reservations; real rows require this-round source opening (contract rule 1) — opening evidence belongs to the probe seats' reports and the round-16 lesson Gate.
- No tool installs needed or performed (pacman pause honored anyway).
