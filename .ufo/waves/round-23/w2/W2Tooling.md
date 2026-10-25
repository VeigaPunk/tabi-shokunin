# W2Tooling — round 23 wave 2 (tooling claim)

**Verdict: TOOLING CLAIM HOLDS with two provenance defects.** No dependency-manifest change and no pacman transaction are provable; "no install ran" is falsified at host level by a `uv tool install coverage` receipt at 03:51:13 that no lane artifact claims. C1's `6/6` reproduces at both baseline and tip, but the frozen `countingCommand` still refuses (exit 2) and the in-flight measurement pins a script digest that no longer exists.

Baseline `a89f1935` was committed 2026-10-25T03:50:10-0300; HEAD moved to `03c1b4d` during this run. Every number below is timestamped by the command that produced it.

## Findings

**F1 · HIGH · C1's frozen counting command is not the command that produced the value.**
`node scripts/round-evidence-audit.mjs --rev a89f1935f523a64b00991d792fca6a8c0d321948 --round 22 --json` → `EXIT=2`, `refused: --round-cap is required`. `grep -n countingCommand .ufo/waves/round-23/claims.json` → line 24 still holds the flagless string, while `revisions[0]` declares `field: C1.countingCommand … to: … --round-cap 128 …`. The revision is recorded but never applied to the claim object: a closure running the frozen command gets a refusal, not 6.

**F2 · HIGH · the working-tree `c1-measurements.json` pins a tool blob nobody can obtain.**
`python3 -c "…d['after']['scriptSha256']…" corpus/evidence/round-23/c1-measurements.json` → `3fe9c326…`; `git show HEAD:scripts/round-evidence-audit.mjs | sha256sum` → `6eeaeda7…`; `sha256sum scripts/round-evidence-audit.mjs` → `87b9f678…` then `9475996…` within one session. Four digests, none equal; the file is ` M` against `03c1b4d` (132+/83-). Landing it as-is attests the `6/6` result to an unobtainable script. The committed form at `03c1b4d` carries no per-entry script pin, so only the uncommitted rewrite is affected.

**F3 · MEDIUM · the skip-work control meets the frozen target; discrimination comes from the matrix, not the number.**
`.ufo/waves/round-23/fixtures/skipwork-receipt.json` → `round22Classes: 6, cleanFixtureClasses: 6, verdict: "control-refused"`; `.ufo/.../fixtures/skipwork-control.mjs --clean` prints the same six ids unconditionally. By the fleet claim-sizing rule the fixture itself quotes ("if it meets the target, the counter or target is wrong"), `6` alone does not separate work from skipping. I reproduced the instrument that does: `node scripts/round-evidence-audit.mjs --selftest` → `passed 12, cases 12, clean true, exit 0`; 6 red cases all tripped, 6 green cases all `findings: []`. The carry is disclosed, not hidden — but C1 must be read as "6/6 with the repair matrix as the discriminator".

**F4 · MEDIUM · the two fleet authorities disagree on the band; `6/6` survives both, the c2 rationale does not.**
`node … --policy /home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json` → 6 classes, band `waveMaxLanes 64`; `--policy …-v2.json` → 6 classes, band `waveMaxLanes 128`, c2 firing on `round total 129 spawned seats > round cap 128`. `DEFAULT_POLICY = FLEET_POLICIES[0]` (v1, the tighter one) is not recorded in `revisions`, so the default is an unstated input that changes *why* c2 fires even though it does not change the count.

**F5 · MEDIUM · the auditor's answer is location-bound, so "committed bytes" is not sufficient on its own.**
`git show HEAD:scripts/round-evidence-audit.mjs > scratch/W2Tooling/committed-audit.mjs && node …/committed-audit.mjs --rev a89f1935… --round 22 --round-cap 128` → `EXIT=2`, `--root must be a git worktree top level: …/scratch resolves to …/tabi-shokunin, and a subdirectory root silently empties the ls-tree listing`. Fail-closed and correct, but reproducibility means "same bytes installed at `<worktree>/scripts/`", and F2 shows the pin that would prove it is stale.

**F6 · LOW · counter schema asymmetry.** `grep -n countingCommand claims.json` → C1 line 24 carries `counterField`, C2 line 38 has none, so the C2 number is not machine-countered the way C1's is.

**F7 · LOW · `roundTotal` is prose-only.** A run exports no `roundTotal` field (`python3 -c "…d.get('roundTotal')…"` → `None`) while c2's `detail` carries `129`; a reader must parse a sentence to recover the number `--round-cap 128` was compared against.

## The named tooling checks, item by item

**No dependency-manifest change — PROVEN.** `git diff a89f1935 --name-only | grep -icE 'package\.json|package-lock|pnpm-lock|yarn\.lock|bun\.lock|Cargo\.(toml|lock)|pyproject\.toml|uv\.lock|requirements.*\.txt|Pipfile|go\.(mod|sum)'` → `0` over the full 935-file / 187201-insertion diff; the same filter over `git status -uall` → `0` before the round committed. The eight non-evidence paths are `LOG.md`, `SCORECARD.md`, `corpus/{QUALITY,README,SOURCES}.md`, `corpus/knowledge/csrf-defense-shape-boundary.md`, `corpus/lessons/round-23.md`, `scripts/round-evidence-audit.mjs`. The largest additions are fetched source bytes (`W2QuoteB/s103.html` 5856 lines, `W2QuoteA/s102.txt` 3696), not vendor payloads (`git diff a89f1935 --numstat | sort -rn | head`). No `node_modules`/`.venv` anywhere in the tree.

**No pacman transaction — PROVEN.** `awk '/^\[2026-10-25T/{… t>="2026-10-25T03:50:00"}' /var/log/pacman.log` → empty; `tail -1 /var/log/pacman.log` → `[2026-10-25T02:14:47-0300] [ALPM] running 'update-desktop-database.hook'`. The last transaction (`cmake 4.4.4-1`, `cppdap`, `rhash`) ended 96 minutes before the baseline commit. The guard held.

**No install ran — NOT PROVEN; falsified at host level, unattributed to this lane.** `stat -c '%y' ~/.local/share/uv/tools/coverage` → `2026-10-25 03:51:13`, i.e. 63 s after the baseline commit and 16 min before `claims.json` was rewritten at 04:26:48; `cat ~/.local/share/uv/tools/coverage/uv-receipt.toml` → `requirements = [{ name = "coverage" }]` (`coverage --version` → 7.17.0). `grep -rlnE 'coverage (run|report)|python3 -m coverage' .ufo/waves/round-23/` → no file. The receipt's existence contradicts the unqualified "no install ran"; what holds is "no install attributable to this lane's tooling", and the auditor itself imports only `node:child_process`, `node:crypto`, `node:fs`, `node:path`, `node:url` (`grep -cE "node:http|node:https|node:net|node:dns|fetch\("` → `0`). The npm logs at 03:45–04:21 every ~5 min are `npm exec --yes rea-agents@6.4.0 mcp` launches with `http fetch GET 200 … (cache revalidated)`, not installs.

**External inputs pinned and matching — PROVEN.** `sha256sum /home/vgpnk/Projects/shokunin/.ufo/reports/round-22/tabi.md` → `a838b5b4…`, `…/scripts/hyaku/ufo-wave-policy.json` → `b5f635af…`, byte-equal to the `inputs.externalReport`/`externalPolicy` pins the auditor echoes. The node runtime predates the round (`/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`, 2026-09-07 20:56).

## Residual risk

- The tree moved under this run: my first `git diff a89f1935 --stat` showed 3 files / 51 insertions because the round artifacts were still untracked; it later showed 935 files. The "no manifest" conclusion survived both states, but a checkout at a different moment may not see F1/F2 the same way.
- `6/6` is reproducible at `a89f1935` (baseline) and `03c1b4d` (tip) with `--round 22`, `--round-cap 128`, exit 1, 7 findings / 6 distinct (c6 legitimately holds 2 findings from 2 distinct landed rows). Rejected: reproducing under `--round 23` at the tip refuses (exit 2) because `/home/vgpnk/Projects/shokunin/.ufo/reports/round-23/tabi.md` is absent — a correct false-green guard, not a defect.
- Not checked: whether any seat's install authorization was granted by an operator message; the `coverage` attribution above is absence-of-evidence, not evidence-of-absence.
