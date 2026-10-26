# C1 screen attack — kagi rows (wave w2, round 35) — CritScreenKagi

## Verdict

**Holds** (one minor ledger-quality defect, no predicate impact). Of the 56 kagi candidates at the
integration rev `083c5c6…`, 55 are screened in `corpus/adjacency-screen-browser.tsv` and 1 is mapped
(`cdp-bridge-vault-dom-refusal`, adjacency.tsv:18). I opened all 55 screened sibling lines at the kagi pin
`69b61db46be4ed955994f6f1d1cba522bc5f4e97` with context and judged each reason against the decision rule
(SKILL.md:2861-2881). Result: 53 rows are correctly disposed (36 `same-surface`, 8
`not-browser-sense`, 8 `third-lane-report`, 1 `no-claim-declared`), **0 rows should be mapped** (no kagi
line states its own side of ground on a tabi PROVINCE surface that an existing map row does not already
answer), and **2 rows are mislabeled**: `handler-on-disk-state.md:113` and `handler-trust-boundary.md:122`
carry `same-surface` `musketeer-cdp-9222-profile-lease` for the exact flock-topology claim the sweep
screened `not-browser-sense` at `SKILL.md:110` — the corrected reason is `not-browser-sense`. Severity:
minor (a ledger-semantics inconsistency; it changes no accounting — both are screens — and touches no map
row). No kagi screen withdraws the wave-1 mapped row.

## Evidence

Commands (all run from scratch `$S=/fast/scratch/hyaku/tabi-r35/CritScreenKagi`; exit codes as shown):

```
$ git -C /home/vgpnk/Projects/shokunin/kagi-shokunin cat-file -t 69b61db46be4ed955994f6f1d1cba522bc5f4e97   # exit 0
$ git -C $S clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone && git -C $S/clone checkout -q --detach 083c5c643be7aa5965a5de3458a32ed0d289ead3   # exit 0, HEAD=083c5c6
$ TMPDIR=$S/tmp node $S/clone/.ufo/waves/round-35/counters/c1-adjacency-sweep-v3.mjs --rev 083c5c643be7aa5965a5de3458a32ed0d289ead3 --repo $S/clone --fleet /home/vgpnk/Projects/shokunin --json > c1-integration.json   # exit 1 (predicate false)
```

- Frozen bytes verified: `c1-adjacency-sweep-v3.mjs` sha256 `5707a937…` and `check-adjacency.mjs` sha256
  `4e2c2a64…` both match `claims.json` frozenDigests.
- Counter output at the integration rev (c1-integration.json): `candidates 383, mapped 1, screened 382,
  unaccounted 0, newMapped 1 (kagi cdp-bridge-vault-dom-refusal, row 18), newRowRefusals [], screenFindings [],
  adjacency {verdict clean, rows 17, verified 17, findings 0}, perLane kagi 56`. This confirms the exact
  screen set I attacked and the exact per-lane count.
- Worktree ledger == committed ledger: sha256 `ac7f7be1…` for both worktree and `git show 083c5c6…` of
  `corpus/adjacency-screen-browser.tsv`; 383 lines.
- Quote/line verification: script checked all 55 kagi rows — every `quote` is a verbatim (trimmed)
  substring of the cited line at the pin (`SKILL.md`, `corpus/knowledge/adjacency-breadth.md`,
  `adjacency-scope.md`, `cdp-bridge-1password.md`, `claim-ledger.md`, `handler-on-disk-state.md`,
  `handler-trust-boundary.md`, `janitor-command-surface.md`, `janitor-env-contract.md`,
  `surface-census.md`); surface-cell rule (`same-surface` ⟺ non-`-`) holds for all 55. 0 failures.

### The two relabels (file:line at pin 69b61db…)

| bench row | line | current | correct | why |
|---|---|---|---|---|
| 44 | `corpus/knowledge/handler-on-disk-state.md:113` | same-surface \| musketeer-cdp-9222-profile-lease | not-browser-sense \| - | flock-coverage table row: "`status`, `run`, `refs`, `whoami`, `cdp-bridge *`, `tac-*`, `_serve` \| **no**" — the same lock-topology claim as `SKILL.md:110` (bench row 4, already `not-browser-sense`); the token is a verb name, no browser/driver/protocol/capture statement |
| 47 | `corpus/knowledge/handler-trust-boundary.md:122` | same-surface \| musketeer-cdp-9222-profile-lease | not-browser-sense \| - | "**flock covers the CLI, not the port.** … `status`/`run`/`refs`/`whoami`/`cdp-*`/`tac-*` do not lock, and nothing on the HTTP path does" — concurrency statement of the same class |

### Same-surface ground checks (the E1-style "label merely exists" test)

The two kagi map rows the screens cite are real and current: `musketeer-cdp-9222-profile-lease`
(adjacency.tsv:8, contested-open, kagi side = the contest declaration) and `secrets-vault-ops`
(adjacency.tsv:9, refused-route, kagi side = vault-ops boundary). Kagi's own `adjacency-scope.md:28`
names `PROVINCE.md:34` as "the CDP surface, 'contested with kake'" — confirming the contest ground still
exists at the new pin. Every same-surface lease row (profile/manifest paths, 9222 probe, ensure/status
heads, cross-domain lease note, breadth/scope census rows of the profile tree) is on that ground; every
`secrets-vault-ops` row is the open-popup/vault-DOM refusal, which the new split-declared row
`cdp-bridge-vault-dom-refusal` also answers. No same-surface row cites a surface that only *exists* for
kagi without topical relation; the only topical misfit is the two lock-topology rows above. The scratch-
profile probe rows (SKILL.md:164-165, surface-census.md:150-151/284) stay same-surface because they
exercise the mapped `cdp-bridge ensure`→profile/manifest mechanism; note bench row 5's note overstates
"the same musketeer Chrome profile" — the probe uses a *scratch* MUSKETEER_CHROME_PROFILE — a note-level
inaccuracy that does not change the disposition.

### Should-map scan

No kagi line states a side on a tabi PROVINCE surface without an existing answer: the CDP-bridge
surface (profile/port/9222), the vault-ops boundary, and the open-popup/vault-DOM refusal are all carried
by rows 8, 9 and 18 of adjacency.tsv; third-lane rows all measure kake text; not-browser-sense rows are
token-only. So `should-map = 0`.

## Counts

kagi candidates 56 = 55 screened + 1 mapped. Screens: 53 ok (36 same-surface — 33 lease + 3 vault-ops —
8 not-browser-sense, 8 third-lane-report, 1 no-claim-declared), 2 relabel → not-browser-sense,
0 should-map.

## Deliverables

- Report: `.ufo/waves/round-35/w2/CritScreenKagi.md` (this file)
- Output dir `.ufo/waves/round-35/w2/CritScreenKagi/`:
  - `verdicts.tsv` (55 rows: key | verdict ok/relabel/should-map | correct reason+surface | one-sentence ground)
  - `c1-integration.json` (frozen-counter receipt at 083c5c6…, exit 1, predicate false)
- Tooling: no installs; no browsers/drivers launched; no network fetches.
