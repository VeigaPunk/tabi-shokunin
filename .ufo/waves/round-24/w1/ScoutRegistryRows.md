# Gate registry at baseline revision

Revision: `573c99e4885382db38babc3a6fc90e77afeb42a6` (the recorded lane tip). Commands below use committed bytes via `git show <rev>:SKILL.md`; line numbers are the `grep -n` line numbers in that blob. The row search was `git show <rev>:SKILL.md | grep -n -E '^\| (closeout-pin-witness|sources-census|claim-record-discipline|historical-pstack-contract|historical-user-contract|aria-historical-metadata|lifecycle observation count|finite lifecycle semantic outcome oracle|finite review-chronology/history classifier) \|'`, and the all-kind-cell scan was `git show <rev>:SKILL.md | grep -n -E '\| gate(\s*/\s*tabi)?\s*\|'`. It yielded nine distinct row names, with the historical-user-contract and aria-historical-metadata supersession rows duplicated. Latest row wins by document order, so only the later row for each duplicated name is evaluated as active.

PROTOCOL.md §Gate standard, lines 401–403 (quote): “Row fields: name, `gate|probe`, entry command, verdict map (code → class), self-test command and spelling, pinned-value path, write scope, owner.”

Verdicts use `present` when the field is explicitly represented in its corresponding table cell; `missing` when the table does not have the field/cell. A field can be present but its value may not meet the standard's semantic requirement; notes identify ambiguity. `script` is the executable path named by the entry command.

| SKILL.md line (active row) | Gate name | Script path | name | gate\|probe | entry command | verdict map code→class | self-test command + spelling | pinned-value path | write scope | owner |
|---:|---|---|---|---|---|---|---|---|---|---|
| 1559 | closeout-pin-witness | `scripts/check-freshness.mjs` | present | present | present | present: 0 clean, 1 failed, 2 could-not-evaluate | present: `--self-test` | present | present | **missing** |
| 1614 | sources-census | `scripts/check-sources.mjs` | present | present | present | present: 0 clean, 1 failed, 2 could-not-evaluate | present: `--self-test` | present (expected table in script, receipt named) | **missing** | **missing** |
| 1657 | claim-record-discipline | `.ufo/waves/round-12/w1/mistake/check-claim-record.mjs` | present | present | present | present: 0 clean, 1 failed, 2 could-not-evaluate | present: same entry with `--self-test` | present | present | **missing** |
| 1677 | historical-pstack-contract | `scripts/check-round-contract.mjs` | present | present | present | present: 0 clean, 1 failed, 2 could-not-evaluate | present: `--self-test` | present | present | **missing** |
| 1800 | historical-user-contract | `scripts/check-user-round-contract.mjs` | present | present | present | present: 0 clean, 1 failed, 2 could-not-evaluate | present: `--self-test` | present | present | **missing** |
| 1801 | aria-historical-metadata | `scripts/check-aria-metadata.mjs` | present | present | present | present: 0 clean, 1 semantic failed, 2 could-not-evaluate | present: `--self-test` | present | present | **missing** |
| 2391 | lifecycle observation count | `.ufo/waves/round-21/measure-c1.mjs` | present | present | present | present: 0 clean/baseline, 1 failed relationships, 2 could-not-evaluate | present: `--selftest` | present | present | present: tabi |
| 2435 | finite lifecycle semantic outcome oracle | `.ufo/waves/round-22/measure-c1.mjs` | present | present | present | present: 0 clean/baseline, 1 failed, 2 could-not-evaluate | present: `--selftest` | present | present | present: tabi |
| 2436 | finite review-chronology/history classifier | `.ufo/waves/round-22/check-review-chronology.mjs` | present | present | present | present: 0 clean, 1 failed evidence claim, 2 could-not-evaluate | present: `--selftest` | present | present | present: tabi |

The first six rows have seven vertical-bar-delimited cells after the gate name? Specifically their markdown rows stop after the write-scope cell and omit the owner cell, so `owner` is missing. The sources-census row also contains no explicit write scope; its final quoted column is the expected-exit/finding description (pinned-value material), leaving both write scope and owner absent. On the later historical-user-contract row, `--diagnostic-witness` and `--count-witness` are additional witness options, not replacements for the recorded self-test command. On the later aria row, witness detail likewise accompanies the self-test.

## Script paths with no registry row

Command used (revision's tracked `scripts/` inventory, checking whether each basename occurs in committed SKILL bytes):

```sh
git -C /home/vgpnk/Projects/shokunin/tabi-shokunin ls-tree --name-only 573c99e4885382db38babc3a6fc90e77afeb42a6 scripts/ | while read f; do case "$f" in *.mjs) if ! git -C /home/vgpnk/Projects/shokunin/tabi-shokunin show 573c99e4885382db38babc3a6fc90e77afeb42a6:SKILL.md | grep -Fq "scripts/$f"; then printf '%s\n' "$f"; fi;; esac; done
```

Output (21 `.mjs` scripts have no occurrence of their path in SKILL.md):

- `scripts/aria-loopback-round13.mjs`
- `scripts/check-adjacency.mjs`
- `scripts/check-aria-metadata.mjs`
- `scripts/check-freshness.mjs`
- `scripts/check-measurement-binding.mjs`
- `scripts/check-round-contract.mjs`
- `scripts/check-sources.mjs`
- `scripts/check-user-round-contract.mjs`
- `scripts/freshness-witness.mjs`
- `scripts/pstack-aggregate.mjs`
- `scripts/pstack-seat.mjs`
- `scripts/round-evidence-audit.mjs`
- `scripts/selftest-measurement-binding.mjs`
- `scripts/user-aggregate.mjs`
- `scripts/user-seat.mjs`
- `scripts/webmcp-invoke-round17.mjs`
- `scripts/webmcp-invoke-round18.mjs`
- `scripts/webmcp-invoke-round19.mjs`
- `scripts/webmcp-lifecycle-round21.mjs`
- `scripts/webmcp-loopback-round16.mjs`
- `scripts/webmcp-validation-round19.mjs`

Important distinction: the preceding command is a literal path-presence inventory, not a gate-row classifier. Thus it flags script paths mentioned in non-registry prose and older superseded rows too. It answers the requested “no row at all” question only if refined by parsing row cells; the observed grep output is not sufficient evidence that these 21 truly lack rows. Among them, the revision visibly has registry rows for `check-freshness.mjs`, `check-sources.mjs`, `check-round-contract.mjs`, `check-user-round-contract.mjs`, and `check-aria-metadata.mjs`; the path-presence loop therefore over-reports these as no-row scripts. **Unresolved:** a row-aware inventory of every script is needed to state the exact no-row set. This caveat is retained rather than asserting grep as semantic proof.

No tools installed or updated.
