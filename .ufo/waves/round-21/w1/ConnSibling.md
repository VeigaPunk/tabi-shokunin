# ConnSibling — round-21 w1 connector: sibling splits for the C1 loopback lifecycle work

Seat: `TabiR21.ConnSibling`. Read-only; no fleet edits, no sibling writes, no tests or builds. Baseline: `e7cf11a810003d4a65cc85bd265f2c17dd65b738`.
Scope: only the documented splits that touch three topics: the loopback non-autosubmit lifecycle runtime, source authority (S100), and test tooling (the counter and selftest).

## Axes
- **A1 Province fidelity**: route overlap to its owner; absorb nothing.
- **A2 Observation/inference separation**: raw runtime outcomes are kept apart from source inferences.
- **A3 Pin stability**: the Chromium, Playwright, and Node identities the receipt depends on.
- **A4 Verification reach**: whether the counter and the fleet's census tools can see the drift.

## Evidence (observed)
- `PROVINCE.md:9-10` owns CDP session discipline and evidence capture. `:15-17` refuses reverse engineering (→ revenger/kaidoku), publishing (→ kake), and secrets (→ kagi).
- `corpus/adjacency.tsv` has 10 rows. None names WebMCP, form lifecycle, Playwright, or test tooling. The relevant rows:
  - `cdp-runtime-observation` (kaidoku) is `ruled`: kaidoku keeps CDP only as an REA provider surface (`round-16-verifier-spotcheck.md:142`).
  - `rea-browser-runtime-evidence` (revenger) and `cdp-live-target-census` (kama) are `contested-open`. They wait on fleet `.ufo/l0-questions.md:65`, which still has no answer (only the round-19 rows at `:76-77` carry a ruling, and on a different topic).
  - `musketeer-cdp-9222-profile-lease` is `contested-open` and waits on `.ufo/l0-questions.md:62`, also unanswered.
- At sibling HEADs, the quoted adjacency lines are still present: kaidoku `PROVINCE.md:53`, kagi `:43`, kama `listener-census.md:355`, kake `:30`/`:35`. kumitate's line moved from `SCORECARD.md:1556` to `:1615` at HEAD `2fa28e57`. Every row pins its commit, so no row is stale.
- Runtime substrate (`scripts/webmcp-invoke-round19.mjs`):
  - Uses a CDP pipe with no remote-debugging TCP port (`:12`, `:1351-1352`).
  - Binds the fixture server to `127.0.0.1:0` and checks the bound address (`:741-745`).
  - Restricts host resolution to 127.0.0.1 (`:66`).
  - Defaults Chromium to `/usr/bin/chromium` (`:54`).
  - Records Browser.version() as "recorded, not asserted" (`:1299`, `:3092`).
  - Enforces Playwright `1.64.0` via a resolver that searches only node-prefix and global paths (`:381-411`).
- Host probes (read-only):

  | Item | Observed value |
  |---|---|
  | `pacman -Q chromium` | `chromium 154.0.8037.97-1` |
  | `/usr/bin/chromium --version` | `Chromium 154.0.8037.97 Arch Linux` |
  | `node` | `v24.21.0` |
  | fnm global `playwright` | `1.64.0` |
  | `~/.npm/_npx/{a1722018f28f9df2,ad9a3fdbcad992c6}/node_modules/playwright-core` | `1.58.2` |

  The two npx cache directories are kaidoku's REA 6.7.0 and 6.5.0 caches (kaidoku `PROVINCE.md` surface summary).
- Source authority: S100 (`corpus/SOURCES.md:114`) is upstream Gitiles `refs/tags/154.0.8037.97` `html_form_element.cc`, kind code, tier A, scoped to "build-scoped declarative lifecycle source branches, not runtime behaviour". No tabi corpus entry mentions Arch or downstream patches (grep for `pkgbuild|patched|distro patch` outside evidence returned nothing).
- Test tooling: tameshi's `fleet-suite-census.md:306` and `:621-622` look only in `tabi-shokunin/tools/`, which is absent. Tabi's gates (`scripts/check-*.mjs`, `scripts/selftest-measurement-binding.mjs`, and this round's `.ufo/waves/round-21/{measure,selftest}-c1.mjs`) are outside tameshi's census, not even listed as sightings. tameshi refuses to edit any sibling's gate (`PROVINCE.md`, Refuses).

## Routing (report, never absorb)

| Overlap | Owner | Disposition for round 21 |
|---|---|---|
| Loopback lifecycle runtime (CDP pipe, fresh private context, fixture on 127.0.0.1:0) | tabi | In province. It does not touch the 9222/musketeer lease or kama's 9222 census, because no TCP debugging port is opened. |
| REA browser runtime evidence | revenger/kaidoku (open at L0 :65) | Not entered. The round forbids REA devices, so no new contested-row evidence is created. |
| Playwright resolution | tabi | Keep r19's resolver. Never resolve from `~/.npm/_npx/*`: those caches are kaidoku's REA install and hold the wrong pin (1.58.2). |
| `/usr/bin/chromium` package state | tsukuroi (pacman state) | Record only. The package stays at `154.0.8037.97-1` only because of the host-wide pacman pause. Tabi does not manage the package. |
| S100 research method and source hierarchy | chousa | Tabi keeps its own SOURCES row (the same split kake declares at `PROVINCE.md:32-33`). No method is restated. |
| Linking the S100 source to the runtime binary | tabi (as inference only) | Any link is `[INFERENCE]`: the source is the upstream tag, and the binary is an Arch `-1` build whose patch set was not opened. Binary inspection to prove the link would be reverse engineering (→ kaidoku/revenger), so it is refused. |
| Reusable gate craft (counter, selftest) | tameshi (method only) | Tabi keeps its gate. Route to L1: tameshi's census does not see tabi's `scripts/` or wave counters. Tabi does not edit tameshi's census. |

## Proposed move (one, bounded)
This is a synthesis of the existing contract, not new scope. The spec already says "drift gives exit 1" and requires `environment:{node,chromium,playwright,flags}`. The r19 harness records Chromium but does not assert it, so environment drift currently goes unchecked. The move:
1. The counter compares receipt `environment.node`, `environment.chromium`, and `environment.playwright` against the spec pins (`v24.21.0`, `154.0.8037.97`, `1.64.0`). A mismatch emits a stable drift finding and exits 1.
2. The runtime writes Browser.version() into `environment.chromium` verbatim and keeps r19's resolver.
3. Report text labels the S100 link as an upstream-tag inference, separate from the raw observations.

Both points were sent to `TabiR21.BuildCounter` and `TabiR21.BuildRuntime`. The writer seats decide whether to adopt them.

**Delivery status:** both writes returned "Delivered", but both seats replied that their wake turn failed (`openai-codex/gpt-6-luna`, `turn_rate_limit_exceeded` after 5 retries; see `history://TabiR21.BuildRuntime` and `history://TabiR21.BuildCounter`). Neither seat has acknowledged or acted on the proposal. I did not re-send, to avoid adding load to a rate-limited model. L1 should relay this proposal when those seats resume, or treat it as not adopted.

Effect on the axes:
- A3 and A4 improve: the pacman-paused package and the fnm Playwright are the only things holding the pins, and the counter would now detect drift in either.
- A2 improves: the source-to-binary gap is named.
- A1 is unharmed: tsukuroi's and kaidoku's surfaces are only read.
- The scalar and the 12-case count are unchanged.

## Risks
- The Browser.version() string format may differ from the bare `154.0.8037.97`. The counter must compare against the receipt's recorded form, which the writer seats define.
- If L1 lifts the pacman pause mid-round, an upgraded Chromium would correctly fail with drift. That is intended, but it invalidates the fixed12 run.
- The Arch patch set could touch `html_form_element.cc`. This is unknown and was not opened; it only weakens the source inference and never the raw observations.
- The open L0 :62 and :65 questions stay unanswered. This round adds no evidence to either.

## Verification (for L1, after all returns)
- `node .ufo/waves/round-21/measure-c1.mjs --selftest` should include a case for environment-pin drift (if adopted).
- Check that the receipt's `environment.chromium` equals the recorded Browser.version(), that `environment.playwright` is `1.64.0`, and that no `--remote-debugging-port` appears in the flags.
- `node scripts/check-adjacency.mjs` (unchanged rows).

## Tooling
No installs or updates.
