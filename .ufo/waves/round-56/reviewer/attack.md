# R56Reviewer attack list (round 56, wave w1)

Lane: /home/vgpnk/Projects/shokunin/tabi-shokunin. Baseline faee4cb27982388b18e9a45f292cdfb9dfd1ebc8. Date 2026-11-03.
Receipts in this directory: `c1-v15-at-faee4cb2.json`, `dup-attack.mjs` (+ `dup-attack-v15.out`, `dup-attack-v16.out`), `n1-absence.txt`, `s153-reopen.txt`.
Verdict key: attack-succeeded | failed-to-break | not-tested (counter not yet authored; reason given).

## A. Frozen predicates and controls (`.ufo/waves/round-56/claims.json`)

1. **C1 before, v15 red at round open: failed-to-break.**
   `node .ufo/waves/round-55/counters/c1-adjacency-host-v15.mjs --rev faee4cb27982388b18e9a45f292cdfb9dfd1ebc8 --repo <lane> --fleet <fleet> --json` → exit 1, `predicate false`, `findingCount 19`, counts `{roster:20, mapRows:16, auditRows:16, deltaLanes:12}`, per-class `{audit-status-mismatch:6, roster-lane-uncovered:5, delta-lane-not-on-roster:3, lane-screen-sha-mismatch:1, lane-screen-lines-mismatch:1, lane-screen-head-mismatch:3}`. Identical to the frozen expectation and to `controls/c1-meter-v15-red-at-round-open.json` (= D). Evidence: `reviewer/c1-v15-at-faee4cb2.json`.

2. **C1 green clause "no duplicate keys" (predicate sentence, v15 and v16): attack-succeeded.**
   The predicate sentence promises "with no uncovered lane and no duplicate keys." The core checks duplicates only for the audit file (`if (auditByKey.has(r[0])) add('audit-duplicate', ...)`). P3 resolves line rows with `const rowFor = lineRows.find((d) => d[2] === \`${relPath}:${ln}\`);`, i.e. the first match, and never inspects a second row with the same key. Test (`reviewer/dup-attack.mjs`, calls the exported `verify()` on the unmodified core):
   ```
   v15: {"control_no_dup":[],"dup_bogus_disposition":[],"dup_lane_wrong_sha":["lane-screen-sha-mismatch","lane-screen-lines-mismatch","lane-screen-hits-mismatch","lane-screen-head-mismatch"]}
   v16: identical output
   ```
   A duplicate line row with disposition `BOGUS-DISPOSITION` is accepted; the predicate is green on it.
   Fix: add a duplicate-key finding for `lane` and `line` delta rows. The v16 core is frozen as byte-identical to v15, so this is a predicate-to-code gap and must go to L1 as a decision (pre-data core change with a new claim, or amend the sentence pre-data). Do not patch the frozen core silently.

3. **C1 row-width drop (`tsvParse`): attack-succeeded, latent.**
   `.ufo/waves/round-55/counters/c1-adjacency-host-v15.mjs:148`: `  .filter((parts) => parts.length === cols)`. A malformed data row is dropped without a finding, so "every corpus/adjacency.tsv data row" is not enumerated for malformed rows. Not triggered today: `awk -F'\t' '{print NF}'` gives 17×9 for the map (header+16), 17×3 for audit, 29×9 for delta.
   Fix: count dropped rows and emit `row-width` findings.

4. **C1 universal "every browser-ground line" is bounded by BG_WORDS: attack-succeeded.**
   The hit set is the 13-term `BG_WORDS` substring list (frozen in the core). A browser-ground line outside that list is not required to carry a line row. Concrete: `git show <kotoba HEAD>:PROVINCE.md` line 76 begins `| tabi | none | 856fa9e1… | tabi owns browser-session and web-interaction evidence (PROVINCE.md:6-13) …`. "browser-session" matches none of the 13 terms, so this line is not a hit (line truncated here at 200 chars in my probe).
   Fix: state the universal clause as "every line matching the frozen BG_WORDS list" in the claim text (new claim, or the L1 corrects the text pre-data), and record the screened-hit count against the superset in the receipt.

5. **C1 green admits open contests: attack-succeeded (on the natural reading).**
   `DISPOSITIONS = ['no-tabi-ground', 'overlap-declared', 'contested-open']`. A green receipt can have every hit line dispositioned `contested-open`, i.e. unresolved browser-ground overlap, and still be green. The predicate literally holds; the statement "admits the lane state" reads as more than that.
   Fix: L1 reports the `contested-open` count in the receipt and the claim text says green = dispositions recorded, not overlaps resolved.

6. **C1 roster universal "every sibling lane directory at --fleet": failed-to-break.**
   Fleet root non-dot directories with `.git`: exactly the 20 `*-shokunin` lanes (= `roster 20`). Without `.git`: `research`, `scripts`, `templates`, `tools`, and `kumitate-shokinin` (a non-git wrapper, Oct 30, holding a nested `kumitate-shokunin`). `shokunin.conf` is a file. None of these is a sibling lane by `laneExists`. Latent note: a real lane dir without `.git`/`HEAD` would be excluded silently; none exists today. Hygiene: `kumitate-shokinin` (typo) should be removed by the operator; not in my scope.

7. **C1 anti-gaming (kill rule: "Adjudications may not be changed to match a sibling head that moved after the snapshot"): attack-succeeded (not machine-enforced).**
   The audit status is compared to the meter's own re-derivation at the same snapshot. Copying the observed status into the audit row makes the row green by construction; the counter cannot tell a legitimate rebind from an adjudication rewritten to match a moved head. Current evidence: six `audit-status-mismatch` rows, all for `kaidoku-shokunin` and `revenger-shokunin` (claimed `sibling-absent`, observed `stale` or `unchanged`), which the rebind will rewrite.
   Fix: L1 diffs `audit-r56.tsv` against `audit-r55.tsv` and the receipt names every changed row with before/after status and before/after head. Otherwise the no-gaming clause has no machine check.

8. **C1 do-nothing control: failed-to-break.** The round-open v15 run at faee4cb2 is RED (item 1). Snapshot heads in my run match the round-open control's `headSnapshot` on 20/20 lanes (`reviewer/c1-v15-at-faee4cb2.json` vs `controls/c1-meter-v15-red-at-round-open.json`). The v16 before-rebind control (`controls/c1-meter-v16-before-rebind.json`) is RED with 30 findings, consistent with the r56 ledgers not yet existing at HEAD (`corpus/adjacency-host-audit-r56.tsv` absent).

9. **C2 before (evidence tree 0 at faee4cb2): failed-to-break.** `git ls-tree -r --name-only faee4cb27982388b18e9a45f292cdfb9dfd1ebc8 -- corpus/evidence/round56 | wc -l` → 0. Absent-receipt refusal: **not-tested**; `.ufo/waves/round-56/counters/chromium-receipt-r56.mjs` is not authored yet.

10. **C2 after: "one command over committed bytes": attack-succeeded.**
    The frozen after command reads the receipt, six PNGs and the driver from the working tree (`corpus/evidence/round56/chromium-control-keys/receipt.json`, `--shot <…>.png`, `--driver scripts/chrome-cdp-loopback-round56.mjs`). It has no `--rev`. Only the trailing `git ls-tree <DATA-REV>` reads committed bytes. A green run can therefore depend on uncommitted working-tree bytes.
    Fix (pre-data, before the freeze commit): the counter takes `--rev <DATA-REV>` and reads `git show <rev>:<path>` for receipt, PNGs and driver digest; or L1 requires `git status --porcelain -- corpus/evidence/round56 .ufo/waves/round-56` empty before the run and writes that receipt.

11. **C2 browser identity not in the predicate text: attack-succeeded (text gap).**
    The statement names "Chromium 155" (`/usr/bin/chromium` = 155.0.8059.84 on this host), but the predicate's enumerated checks do not include browser version. A receipt from another Chromium build passes unless the counter pins the version. Fix: counter pins `155.0.8059.84`, selftest refuses a 156 fixture; L1 records it in the claim text before data.

12. **C2 "every typed value" and canned-receipt refusal: not-tested.** Requires the counter's selftest to mutate each typed field (and the nonce, server log, driver digest) and see refusal. Counter unauthored in this wave snapshot.

13. **C2 source anchor S153 (independent re-open): attack-succeeded on the anchor.**
    Evidence `reviewer/s153-reopen.txt`:
    ```
    d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7  browser_protocol.json   (fresh curl -sL, 2026-11-03)
    registry anchor sha256: f60f0c0263c6f8801c1a3058a88aad0aef2c8f78242c3cfb4e8c6f5e915eb3f2 (1,421,620 B)
    fresh size: 1423170 B
    ```
    The fresh bytes do not match the anchor. The scribe's copy (`.ufo/waves/round-56/sources/browser_protocol.json`) has the same sha `d6737c31…`, so the scribe fetched the same moved bytes. The grounded text still holds, verbatim: `"Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8\n(default: 0)."`. The round-55 lesson's "BYTE-IDENTICAL" was true on 2026-11-02 only.
    Fix: S153 re-open log records the drift (sha, size, date) in place (N4 permits in-place re-open logs); the URL should be pinned to a commit, not `master`, if the anchor is to remain re-derivable.

## B. N1 (six round-55 receipts lost)

14. **Absence at HEAD and 545b251d: attack-succeeded on the disclosure count.** `reviewer/n1-absence.txt`, `git cat-file -e <rev>:<path>`. Seven paths cited under `.ufo/waves/round-55/` by the lesson or SCORECARD are ABSENT at BOTH revs:
    ```
    ABSENT HEAD .ufo/waves/round-55/measure/census-end.txt
    ABSENT HEAD .ufo/waves/round-55/measure/check-sources-at-work.txt
    ABSENT HEAD .ufo/waves/round-55/sources/browser_protocol.json
    ABSENT HEAD .ufo/waves/round-55/sources/html-form-control-infrastructure.html
    ABSENT HEAD .ufo/waves/round-55/measure/c2-r53counter-refuses-r54.json
    ABSENT HEAD .ufo/waves/round-55/measure/c2-r54counter-refuses-r53.json
    ABSENT HEAD .ufo/waves/round-55/measure/d54-1-landing-note-r55.txt
    (545b251d: the same seven lines, ABSENT)
    ```
    The claim says six; I reproduce seven. I could not identify which one is excluded from N1 from the text. Disclose seven, or name the excluded one.

15. **The round-55 lesson's "landed" claim is false: attack-succeeded.** `corpus/lessons/round-55.md` (D54-1) says the three r54-round receipts were "landed at the exact cited paths". `measure/c2-r53counter-refuses-r54.json` and `measure/c2-r54counter-refuses-r53.json` are ABSENT at HEAD and at 545b251d; only `measure/c2-counter-green-at-data.json` landed. The N1 class recurred inside round 55, and the r55 landing check did not catch it.

16. **N1 class fix not landed: attack-succeeded.** The frozen N1 says the fix is `scripts/check-cited-receipts.mjs`, "shown RED at 545b251d and GREEN at the round-56 head", and criterion 109 (QUALITY.md). `ls` on the fleet-root `scripts/`, the lane working tree and `git cat-file -e HEAD:scripts/check-cited-receipts.mjs` all find no such file. The lane HEAD has no `QUALITY.md`. The fix must exist and go GREEN before the round-56 close, or N1 stays open.

## Summary
- failed-to-break: 1, 6, 8, 9
- attack-succeeded: 2, 3, 4, 5, 7, 10, 11, 13, 14, 15, 16
- not-tested: 12 (counter unauthored)
- D (C1 red re-run): match (findingCount 19 == control; per-class counts equal).
- Required before the data pass: items 2 (decision), 4 (claim text), 7 (diff check), 10 (`--rev` or clean tree), 11 (pin version), 13 (log drift), 14/15/16 (disclosure and gate).
