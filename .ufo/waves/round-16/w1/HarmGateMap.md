# HarmGateMap — round-16 wave-1 baseline gate report

Author: TabiR16.HarmGateMap-5 (advisory only; L1 re-runs all final checks).
Baseline measured: `e38d2599a922cb729186353830fff8e159b4fef0` ("round-15 verifier spot-check (integrator, hyaku): non-author admit/reject").
Repo: `/home/vgpnk/Projects/shokunin/tabi-shokunin`, Node v24.21.0, date 2026-10-20.
Worktree at measurement: clean except untracked `.ufo/waves/round-16/`.
Deliverable: `.ufo/waves/round-16/harm-baseline.json` (new, sha256 `08678d3bee443bcd74787e35f4a52cfa8b435d03d0ac832f2f8b2b33d185917e`).

## Gate outcomes at baseline (argv → exit; full stdout/stderr bytes+sha256 in JSON)

| Gate | argv | Exit | Verdict |
|---|---|---|---|
| check-round-contract | `node scripts/check-round-contract.mjs` | 0 | `ROUND_CONTRACT verdict=clean rounds=10 consequential=0` (stdout 2227 B, sha256 25e66498…) |
| check-user-round-contract | `node scripts/check-user-round-contract.mjs` | **1** | `USER_ROUND_CONTRACT verdict=failed finding=round_count detail=Found 6 user rounds, expected 10` (stderr 95 B, sha256 47e9ffdc…; stdout empty) |
| check-freshness | `node scripts/check-freshness.mjs --worktree` | 0 | `FRESHNESS_GATE verdict=clean finding=freshness_worktree matched=34 unique=34 lane=31 public=3 revision=worktree baseline=c24eaea14dfc0c4a3848742d31673db5675f9183 profile=production` (stdout 5035 B, sha256 6f99a374…) |
| check-sources | `node scripts/check-sources.mjs` | 0 | `SOURCES_GATE verdict=clean rows=29 tiers=A:23,B:4,C:2 status=queued:3,mined:24,rejected:2 findings=0 file=corpus/SOURCES.md` (stdout 124 B, sha256 deb8216a…) |
| check-sources self-test | `node scripts/check-sources.mjs --self-test` | 0 | `SOURCES_SELFTEST verdict=clean cases=26` (stdout 2688 B, sha256 8a1efa8b…) |
| check-aria-metadata | `node scripts/check-aria-metadata.mjs --check corpus/evidence/round-14/aria-metadata/corrected.json` | 0 | `ARIA_METADATA check verdict=clean findings=28 failed=0 accepted=true` (stdout 9905 B, sha256 afdc9fad…) |

## Already-red gate (flagged)

**`scripts/check-user-round-contract.mjs` is RED at baseline — `round_count`.**
It enumerates `corpus/lessons/user-20261015-rNN.md` at HEAD and hard-requires 10 in production
(`argumentsOf` line ~301: "expects ten rounds", `check()` line ~602). Only `r01`–`r06` were ever
committed (each added 2026-10-15; `git log --diff-filter=A` shows no later user lessons, none
removed). The `expect=10` requirement has existed since the gate's introduction at `dabd2b9`
(2026-10-15), so this gate has never passed in production on this lane. **Not a round-16
regression; no round-16 owned path can fix or further break it** — adding user lessons is
outside every wave-1 write set.

## Protected / pinned path sets a new round-16 file could disturb

### check-round-contract.mjs (reads committed trees only)
- `protectedPath` (frozen at baseline `7f506aff`, byte-identity required): `corpus/lessons/round-N.md`,
  `corpus/evidence/fleet-round-1-freshness/**`, `.ufo/rounds|reports|plans|continuation/fleet-round-1-*`,
  `scripts/check-freshness.mjs`, `SHONEN.md` (canonical-template policy).
- Census pin: `corpus/evidence/pstack-20261015/baseline-census.tsv` (sha256 `b9c8dc35…`) records a blob id
  per listed path — any drift = `history_rewritten`.
- Append-only (HEAD must extend baseline bytes): `LOG.md`, `SCORECARD.md`, `SKILL.md`, `PROVINCE.md`,
  `corpus/QUALITY.md`, `corpus/README.md`. **C2 note: L1's corpus/README.md + SKILL.md edits must be pure appends.**
- Round-scoped reads: `corpus/lessons|reports/corpus/evidence/pstack-20261015-rNN`, SCORECARD `<!-- pstack-round: -->` markers.
- New files under `.ufo/waves/round-16/` and `corpus/evidence/round-16/` are invisible to it
  (untracked / not at baseline). New committed `corpus/lessons/round-16.md` is allowed but becomes frozen once committed.

### check-user-round-contract.mjs (reads committed trees only)
- Same `protectedPath` set and append-only list as above.
- pstack pin `92d700d6…` drift scope (`PSTACK_PATHS`): `corpus/evidence/pstack-20261015` (any change fails),
  `corpus/lessons` (new `round-16.md` admitted only as a single initial addition — no later MDRT in pin..HEAD),
  `reports`, `scripts/check-round-contract.mjs` (only 4 recorded sha256 identities may appear in history),
  `scripts/pstack-seat.mjs`, `scripts/pstack-aggregate.mjs`, `scripts/check-freshness.mjs`, `SHONEN.md`.
- Round-scoped reads: `corpus/lessons|reports|corpus/evidence/user-20261015-rNN` (+ public capture pins).
- **Implication for wave-1+: nobody may edit `scripts/check-round-contract.mjs`, `scripts/check-freshness.mjs`,
  or any pstack path; `corpus/lessons/round-16.md` must land exactly once.**

### check-freshness.mjs --worktree (reads live worktree bytes — most fragile)
- Pin table `corpus/evidence/fleet-round-1-freshness/pins.tsv`; expected manifest
  `.ufo/rounds/fleet-round-1-interactive-20261015/freshness.expected.json`; baseline `c24eaea…`.
- 34 pinned targets: all `corpus/knowledge/*.md` + `reports/*.md` + `SKILL.md` committed at `c24eaea`
  (31 lane files) + 3 kimi-webbridge public files (`/home/vgpnk/.kimi-code/plugins/managed/kimi-webbridge/…`).
- **Any edit to a pinned target fails `content_drift` on worktree bytes — including the L1-owned
  `corpus/knowledge/` files already committed at c24eaea. SKILL.md is append-only (`pre-append` prefix
  must equal baseline bytes, plus a dated append).**
- New files (e.g. the C2 note `corpus/knowledge/webmcp-chromium-loopback-round-16.md`) are NOT in the
  baseline target set and cannot disturb this gate.

### check-sources.mjs
- Registry `corpus/SOURCES.md`: row grammar, required `## ` sections, unique ids/urls, and every
  `used-by` pointer must resolve inside the repo to a regular non-symlink file containing a `S0xx` citation.
- C2 rows (S020 re-open, S002 used-by add, new primary rows) touch only `corpus/SOURCES.md` + the
  citing `corpus/knowledge/` note. No digest pins on other files.

### check-aria-metadata.mjs --check
- Fully historical pinned inputs: `corpus/evidence/round-13/aria/{receipt.json,runtime-pin.json,manifest.json,
  aria-loopback.spec.mjs,playwright.config.mjs,actual/workers/worker-0-…}`, `scripts/aria-loopback-round13.mjs`,
  `corpus/evidence/round-14/aria-metadata/corrected.json`, `corpus/evidence/round-15/metadata/*.json` —
  all sha256-anchored in code. Nothing under `round-16/` can disturb it.

## Wave-1 collision risk summary
- Zero-risk writes: everything under `.ufo/waves/round-16/`, `corpus/evidence/round-16/`,
  `scripts/check-measurement-binding.mjs`, `scripts/selftest-measurement-binding.mjs`,
  `scripts/webmcp-loopback-round16.mjs`, `.ufo/waves/round-16/probes/*` — all new paths, read by no baseline gate.
- Care needed (L1 only): `corpus/SOURCES.md` (sources gate), `corpus/README.md`/`corpus/QUALITY.md`/
  `SKILL.md`/`LOG.md`/`SCORECARD.md`/`PROVINCE.md` (append-only), `corpus/knowledge/*` pinned files
  (freshness worktree bytes), `corpus/lessons/round-16.md` (single initial addition only).

## Tooling / installs
None. Node v24.21.0 was already present; no packages installed or upgraded.
