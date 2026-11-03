# R56Reviewer findings, round 56 wave w1

Full attack list with evidence: `.ufo/waves/round-56/reviewer/attack.md`. Receipts: `.ufo/waves/round-56/reviewer/` (`c1-v15-at-faee4cb2.json`, `dup-attack.mjs`, `dup-attack-v15.out`, `dup-attack-v16.out`, `n1-absence.txt`, `s153-reopen.txt`).

## Blocking before the L1 data pass

1. **C1 predicate promises "no duplicate keys"; the core does not check it (attack 2).** A duplicate `line` delta row with a bogus disposition passes v15 and v16. `verify()` P3 uses `lineRows.find` (first match). Decision needed from L1: pre-data core change with a new claim, or amend the sentence. The frozen core must not be patched silently.
2. **C2 after-command reads working-tree bytes, not committed ones (attack 10).** Add `--rev <DATA-REV>` (read `git show <rev>:<path>` for receipt, PNGs and driver) before the freeze, or require a clean tree and record it.
3. **C2 browser identity unpinned in predicate text (attack 11).** Counter pins `155.0.8059.84`; a 156 fixture must be refused in selftest.
4. **C1 audit rebind is not machine-checked against the no-gaming rule (attack 7).** L1 must diff `audit-r56.tsv` vs `audit-r55.tsv` and name each changed row with before/after status and head.
5. **C1 universal "every browser-ground line" equals the 13-term BG_WORDS list (attack 4).** Example outside it: kotoba PROVINCE.md line 76 ("browser-session"). Fix the claim text (new claim or pre-data text fix) and report the superset count.

## Disclosure and gate (N1 class)

6. **N1 count: seven, not six (attack 14).** Absent at HEAD and at 545b251d: `measure/census-end.txt`, `measure/check-sources-at-work.txt`, `sources/browser_protocol.json`, `sources/html-form-control-infrastructure.html`, `measure/c2-r53counter-refuses-r54.json`, `measure/c2-r54counter-refuses-r53.json`, `measure/d54-1-landing-note-r55.txt`. Disclose seven, or name the excluded one.
7. **Round-55 lesson's landing claim is false (attack 15).** D54-1 says three r54-round receipts were landed; two are absent at HEAD and 545b251d.
8. **N1 gate not landed (attack 16).** `scripts/check-cited-receipts.mjs` and QUALITY.md criterion 109 do not exist at the fleet root, the lane working tree, or lane HEAD. N1 cannot close as "GREEN at the round-56 head" until they exist.

## Source re-open (C)

9. **S153 anchor no longer reproduces (attack 13).** Fresh `curl -sL` of `master` = 1,423,170 B, sha256 `d6737c31f268ed74e65dde393006dd9c590a713febd2361d734722eb059f31e7`; registry anchor `f60f0c02…` (1,421,620 B). The scribe's copy has the same sha as my fetch. The modifiers description is verbatim: `Bit field representing pressed modifier keys. Alt=1, Ctrl=2, Meta/Command=4, Shift=8 (default: 0).` Log the drift in place, or pin to a commit.

## Confirmed (failed-to-break)

- C1 before: v15 at faee4cb2 → exit 1, predicate false, findingCount 19; per-class counts identical to the frozen expectation and to the round-open control; 20/20 snapshot heads match. (D: match.)
- C1 roster: 20 git lanes, no non-git sibling lane. `kumitate-shokinin` is a stray non-git wrapper, not a lane (hygiene, operator).
- C1 do-nothing: round-open v15 is RED; v16 before-rebind is RED (30 findings), consistent with the r56 ledgers not yet existing.
- C2 before: evidence tree at faee4cb2 has 0 files.

## Not tested

- C2 absent-receipt refusal and "every typed value" / canned-receipt refusal: the counter `chromium-receipt-r56.mjs` is not authored in the lane yet (attack 12).

## Verification exercised

- `node .ufo/waves/round-55/counters/c1-adjacency-host-v15.mjs --rev faee4cb2… --repo <lane> --fleet <fleet> --json` → exit 1, findingCount 19.
- `node reviewer/dup-attack.mjs <v15|v16 core>` → exit 0 both; duplicate bogus-disposition accepted.
- `git cat-file -e <rev>:<path>` for N1 paths at HEAD and 545b251d (exit codes per line in `n1-absence.txt`).
- `curl -sL` S153 → exit 0; `sha256sum`.
- `git ls-tree` faee4cb2 `corpus/evidence/round56` → 0 files.
- No commits, no mutating git, no writes outside `reviewer/` and `w1/R56Reviewer.md`.
