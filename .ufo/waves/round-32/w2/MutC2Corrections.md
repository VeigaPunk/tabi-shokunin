# MutC2Corrections — w2 falsify, round 32 (attempt 1), seat report

Seat: MutC2Corrections (mutation-tester, leaf). Lane: tabi. Milestone: C2.
Revision attacked: `b234a58920134424e0d104f137311ff54a16d26b` (wave-1 build integrated). Frozen counter: `scripts/check-selfassessment.mjs` sha256 `77b5c8ed503bd9bc93e8ef634a10627613672eaa39bca84cf7339d37b6d4c6a9` (== `.ufo/waves/round-32/claims.json` frozenDigests.C2), verified byte-identical before and after every sweep.

## Verdict

The landed round-32 C2 corrections are load-bearing wherever the frozen v3 counter can see them: 7 of 9 mutants were killed — dropping one `DOC:N` citation from the SCORECARD, corpus/README or SKILL correction resurfaces exactly that stale tally (1 mismatch each), changing the stated oracle number 41→40 resurfaces all four SCORECARD stale tallies plus counts the mutated correction line itself (5), stating "nudge was inactive" where the correction says "was active" resurfaces the m4 mismatch at `SCORECARD.md:1473` (1), and moving a correction above its stale line resurfaces the stale statement (m4 at the shifted line) plus, collaterally, 8 more mismatches from the line shift. Three mutants survive, and each survivor is a characterized coverage hole, not a false "holds": (1) removing the word "Correction" — or even the whole "Correction — supersedes" phrase — from the SKILL.md correction still reads 0 because the marker test `/supersed|correct/i` is satisfied by incidental prose ("supersedes", "oracle-correct", "superseded"), so the marker word itself is decorative on this corpus; (2) the same mutation family applied to the LOG.md nudge correction still reads 0 because m4 is wired to SCORECARD.md only (`m4Findings(scorecard)`), so the `LOG.md:2072` correction clears no counter finding at all. Both survivors are defects of counter coverage (severity low; the counter is frozen — reported, never patched); no mutation made a wrong lane state read clean on any counter-visible correction.

## Method

Scratch: `/fast/scratch/hyaku/tabi-r32/MutC2Corrections` (deleted after receipts copied; recreated once for the follow-up sweep, deleted again). One shared clone per sweep, detached at the attacked revision:

```
git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin "$S/clone"        # exit 0
git -C "$S/clone" checkout -q --detach b234a58920134424e0d104f137311ff54a16d26b  # exit 0, HEAD b234a589…
sha256sum "$S/clone/scripts/check-selfassessment.mjs"   # 77b5c8ed…c6a9 (frozen digest match)
git -C "$S/clone" status --porcelain                    # empty (0 lines)
```

Per mutant: `git -C "$D" reset --hard b234a589…` + `git -C "$D" clean -fdq` (restore exact bytes), one exact string edit in one document, `git -C "$D" add -A && git -C "$D" -c user.name=MutC2Corrections -c user.email=MutC2Corrections@scratch.local commit -qm "mutant <id>"`, then the frozen counter with `TMPDIR=$S/tmp node scripts/check-selfassessment.mjs --rev HEAD --json` (cwd = the clone; equivalent to the frozen command `--rev <REV>`; the pre-sweep baseline used the declared `--repo` form once), record, restore. Runners: `mutants.mjs`, `mutants2.mjs` (copies in the output dir). All counter runs execute only node+git; no browser was spawned.

Controls (detector on pristine and restored bytes):

| control | command | exit | mismatches | receipt |
|---|---|---|---|---|
| pristine (pre-sweep) | `node scripts/check-selfassessment.mjs --repo <clone> --rev b234a589… --json` | 0 | 0 (couldNotEvaluate 106, superseded 39) | `c2-baseline-pristine-bg3846.log` |
| pristine (in-sweep) | same, `--rev HEAD` at pristine tree | 0 | 0, tree `9aeed8ef8db17c1ef21d8fb9c2327df0eeba78a1` | `results/results.jsonl` |
| restored (sweep 1) | after `reset --hard` + `clean` | 0 | 0 | `results/restoration.json` |
| restored (sweep 2) | after `reset --hard` + `clean` | 0 | 0 | `results2/restoration-2.json` |

## Mutants — one mutation at a time, mismatch count per mutant

Pristine tree `9aeed8ef8db17c1ef21d8fb9c2327df0eeba78a1`; pristine blobs: `SCORECARD.md` `ea14b2c9…`, `LOG.md` `e84be12d…`, `SKILL.md` `762bcfce…`, `corpus/README.md` `ad6d5104…` (full 40-hex in `results/restoration.json`).

| id | target (path:line at b234a589) | mutation | mutant tree / file blob | counter | mismatches (counted) | verdict |
|---|---|---|---|---|---|---|
| Mu1 | `SCORECARD.md:1610` (m1 correction) | drop one `DOC:N` citation: remove `` `SCORECARD.md:1465` `` from the four-line list | `74d46d61…` / `28295d44…` | exit 1 | 1 — m1 `SCORECARD.md:1465` claimed 22, observed 41 | killed |
| Mu2 | `SCORECARD.md:1610` | change 41 to 40: `` `--selftest` (41/41) `` → `(40/40)` | `e9b2db55…` / `4c896287…` | exit 1 | 5 — m1 `:1439` 17/41, `:1465` 22/41, `:1486` 22/41, `:1564` 30/41, `:1610` 40/41 | killed |
| Mu3a | `SCORECARD.md:1612` (m4 round-29 correction) | "the nudge was active." → "the nudge was inactive." | `d4b4485b…` / `d761b7b9…` | exit 1 | 1 — m4 `SCORECARD.md:1473` claimed inactive, observed active | killed |
| Mu3b | `LOG.md:2222` (LOG m4 correction) | same: "the nudge was active for round 31" → "…was inactive for round 31" | `cca372e2…` / `147a500f…` | exit 0 | 0 | **SURVIVOR** |
| Mu4a | `SKILL.md:2758` (m1 correction) | remove the word "Correction": "- Correction — supersedes…" → "- supersedes…" | `00ee6c5e…` / `75e7824e…` | exit 0 | 0 | **SURVIVOR** |
| Mu4b | `SKILL.md:2758` | stronger variant: remove "Correction — supersedes" → "- the nine stale tallies…" | `c544d103…` / `30789c0a…` | exit 0 | 0 | **SURVIVOR** |
| Mu5 | `SCORECARD.md:1612-1616` moved above its stale line `:1473` | move the round-29 correction paragraph to immediately above the stale statement; stale-line citation renumbered `:1473`→`:1479` so the only broken property is paragraph ordering | `85a0d4b2…` / `511cf4de…` | exit 1 | 9 — see decomposition | killed |
| Mu8 | `corpus/README.md:743` (m1 correction) | drop one `DOC:N` citation: remove `` `corpus/README.md:613` `` | `aab19b95…` / `c3f6a01c…` | exit 1 | 1 — m1 `corpus/README.md:613` claimed 17, observed 41 | killed |
| Mu9 | `SKILL.md:2758` | drop one `DOC:N` citation: remove `` `SKILL.md:2515` `` | `6d3ade55…` / `a6fcb20d…` | exit 1 | 1 — m1 `SKILL.md:2515` claimed 17, observed 41 | killed |

Full per-mutant receipts (rev, before/after tree and blob hashes, counted findings, exit): `results/*.json`, `results2/*.json`, `results/results.jsonl`.

### Mu5 decomposition (9 mismatches)

- Designed leg (ordering): the moved round-29 correction cites the stale statement's new location (`:1479`) yet does not clear it — m4 `SCORECARD.md:1479` claimed inactive, observed active. The later-paragraph requirement (`scripts/check-selfassessment.mjs:504` `if (p.start <= no) return false`) is load-bearing.
- Collateral legs (line-addressed citations): the +6-line shift moved six stale m1 tallies below their citing corrections' citations (pristine→mutant `1479→1485` 7/10, `1485→1491` 20/29, `1486→1492` 22/41, `1527→1533` 12/24, `1528→1534` 10/29, `1564→1570` 30/41) and two stale m4 statements (`1515→1521`, `1576→1582`); the untouched round-30/31 corrections still cite the old numbers, so `citesLine` fails and the supersessions drop (superseded 39→30). Informational: the correction apparatus is line-addressed and a mid-file insert silently un-clears it; unreachable under the lane's append-only-at-tail discipline, so not a live defect.

## Survivor findings (coverage defects; counter frozen — reported, never patched)

**S1 — the correction-marker word is decorative (Mu4a, Mu4b). Severity: low.**
Evidence: `scripts/check-selfassessment.mjs:359` (m1 LOG-window marker test `/supersed|correct/i`), `:506` (m4), `:256` (m1 SCORECARD-window `/supersed|correct|replace|…/i`). The landed SKILL.md correction (`SKILL.md:2758-2762`) satisfies the test three more ways besides the word "Correction": "supersedes" (`:2758`), "oracle-correct" (`:2760`), "superseded" (`:2762`). Removing the word "Correction" — or the entire "Correction — supersedes" phrase — still reads mismatches 0, exit 0. The load-bearing legs held (Mu9 citation, Mu2 number), so the practical risk is narrow: a paragraph that is not a correction could clear a stale tally if it incidentally contains "correct"/"supersed", names the script, cites the stale line and states the oracle number. Smallest append-only fix (L1's call, not applied): a future counter version could require the marker token in the paragraph's lead position or adjacent to the citation; corpus-side no change is needed (the landed corrections already carry the full shape).

**S2 — the LOG.md nudge correction is invisible to the gate (Mu3b). Severity: low.**
Evidence: `scripts/check-selfassessment.mjs:528` wires `m4Findings(scorecard)` — SCORECARD.md only; no class evaluates nudge statements in LOG.md, so the stale statement at `LOG.md:2072` ("nudge inactive") is never compared and the landed correction (`LOG.md:2222-2226`, "the nudge was active for round 31") clears no counter finding. Mutating it to "was inactive" reads mismatches 0, exit 0. The three SCORECARD copies of the same statements are gated (Mu3a killed), so lane calibration state is not exposed through this hole; the hole is that one of the four correction documents could be corrupted arbitrarily with the frozen gate still reading 0. Smallest append-only fix (L1's call, not applied): a future counter version could run m4 over LOG.md round groups too, or the C2 claim could scope "load-bearing" to the three counter-visible documents.

## Load-bearing proof (killed mutants, by correction leg)

- Citation leg: Mu1, Mu8, Mu9 — dropping one `DOC:N` citation resurfaces exactly that stale tally (1 mismatch each), across all three counter-visible documents.
- Number leg: Mu2 — a wrong oracle number (40 vs the gate's own 41) resurfaces all four SCORECARD stale tallies and additionally counts the mutated correction line itself (claimed 40, observed 41).
- State leg: Mu3a — stating the wrong derived state resurfaces the m4 mismatch at `:1473`.
- Ordering leg: Mu5 designed leg — a correction placed above its stale line does not clear it.
- Coverage note: `corpus/README.md:743-746` proven load-bearing by Mu8; `SKILL.md:2758-2762` by Mu9 (citation leg; its marker leg is survivor S1); `SCORECARD.md:1610` by Mu1/Mu2 and `:1612-1630` by Mu3a/Mu5; `LOG.md:2222-2226` is survivor S2 (invisible). No counter-visible correction survived a mutation aimed at its citation, number, state or ordering.

## Restoration evidence

Both sweeps ended with `git -C "$D" reset --hard b234a58920134424e0d104f137311ff54a16d26b` + `git clean -fdq`: HEAD == `b234a589…`, `git status --porcelain` empty, counter sha256 unchanged `77b5c8ed…c6a9`, restored controls exit 0 / mismatches 0, worktree sha256 of all four documents recorded (`results/restoration.json`, `results2/restoration-2.json`). Mutant commits remain only inside the disposable scratch clone (deleted).

## Hygiene and tooling

- Scratch `/fast/scratch/hyaku/tabi-r32/MutC2Corrections` deleted after receipts were copied (both times); `ls /fast/scratch/hyaku/tabi-r32/` afterwards shows only `L1` (not this seat's).
- `pgrep -fa 'chromedriver|chromium'` → one line, not owned by this seat: `1371 /usr/bin/earlyoom -r 3600 --avoid … --prefer (^|/)(java|node|chromium|python3?)$` (the host OOM daemon's prefer-pattern mentions "chromium"; no chromedriver/chromium process exists).
- No tool installed or upgraded (node v24.21.0 and git preexisting; no pacman/uv/npx/npm activity).
- No external network fetches were needed (no URLs fetched; all evidence is local bytes). Lane checkout untouched; writes limited to this report, the output dir, and the scratch clone.
