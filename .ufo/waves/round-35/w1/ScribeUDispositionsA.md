# Round-35 w1 — ScribeUDispositionsA

Seat: scribe (leaf), round 35 attempt 1, wave `w1`. Item: dispositions for the round-33 wave-2 findings
**U01–U14** that round 34 indexed and routed but never dispositioned.

## Verdict

**All fourteen findings still describe the frozen bytes at `a4bfef0f75027c915e715649950b1d46dcb33d83`; thirteen
are still open or unlanded, one (U08) is already adjudicated by `b44b964` and is closed. The disposition split is
forced by the round's own freeze, not by preference: the freeze pins both instruments “must stay unchanged”
(`claims.json:25-26`, repeated in `noHarmRule` at `:231`) and both counters refuse any other digest, so the seven
code-level items (U01–U07) are *routed* to the first round whose freeze leaves its gate free, while the six prose
items (U09–U14) are *correction-drafted* — exact append-only texts that cite the stale line and move no frozen
quote (U09's `SKILL.md:2887` in particular may never be edited: it is `corpus/adjacency.tsv:12`'s `tabi_ref`). One
finding's own locator is itself stale (U13: the sentence is at `round-33.md:217`, not `:186-187`, at both
`042d6d9` and the freeze), and two forward risks in the round-35 instruments are named below so wave 2 attacks
them.**

## Evidence — commands, exit codes, file:line

Clone and rev (all reads are git objects of the freeze; nothing was executed against the lane tree):

```
$ git clone --shared /home/vgpnk/Projects/shokunin/tabi-shokunin $S/clone            exit=0
$ git -C $S/clone checkout -q --detach a4bfef0f75027c915e715649950b1d46dcb33d83      exit=0
$ git -C $S/clone rev-parse HEAD  -> a4bfef0f75027c915e715649950b1d46dcb33d83          exit=0
$ bash $S/checks.sh > checks-output.txt                                              exit=0   (172 lines, 32 `exit=` lines)
$ sha256sum scripts/check-bidi-runtime.mjs -> 370e8e95…6c87                            exit=0
$ sha256sum scripts/check-adjacency.mjs    -> 4e2c2a64…db1d                           exit=0
```

(the full command list with each command's own exit code is `ScribeUDispositionsA/checks.sh` /
`checks-output.txt`; per-item quotes and results are §3 of `dispositions.md`.)

Load-bearing re-derivations:

| item | command (in `checks.sh`) | result | exit |
|---|---|---|---|
| U01 | `node -e` with `MEASURED` `eval`'d from `scripts/check-bidi-runtime.mjs:149` | `"YES"→measured:yes`, `"yes — live"→measured:yes`, `"yes (live)"→unmeasured`, `"no — reason"→measured:no` | 0 |
| U02 | `grep -n 'function importSpecs\|function resolvesToGate\|spec.startsWith("/")'` | `:409`, `:432`, `:435 if (spec.startsWith("/")) return false;` | 0 |
| U02 | `grep -c 'import[[:space:]]*('` | **0** (no literal dynamic-import scan) | 1 |
| U03 | `grep -n 'for (const id of newRows)\|if (!witness)'` | `:746` loop with `:754 break;`, `:757 if (!witness)` | 0 |
| U04 | `node -e` with `L0_TABI_ROW` `eval`'d from `check-adjacency.mjs:231`, on fleet `l0-questions.md:65` | `test=true`, `includes("kake")=true`, one `kake`; gate test at `:919` | 0 |
| U05 | `grep -n 'mkdtempSync(join(base\|mkdtempSync(join(runtime\|scratch.length <= 60\|at most 40 bytes\|liveError'` | `:582`, `:591`, `:592`, `:593`, `:818`, `:856` | 0 |
| U06 | `node -e` scratch arithmetic | TMPDIR 38 → scratch 60 admitted; 39 → 61; 40 → 62 refused | 0 |
| U07 | `node -e` on `corpus/evidence/round-32/bidi/receipt.json` | `runs[0].observed` = `:37279/10abbb…`, `runs[1]` = `:41011/6b30c7…` | 0 |
| U07 | `git show b7d16fb:…/bidi-run/run{1,2}/transcript.jsonl \| grep -o 'ws://…'` | `:41417/8ff52a9d…`, `:40495/7b5050…` — not the receipt's `observed` | 0 |
| U07 | `grep -c observed scripts/check-bidi-runtime.mjs` | **1**, a comment at `:3` | 0 |
| U08 | `git log -S'20 of 27 (capital markers), on the other 21 of 31' -- corpus/lessons/round-32.md` | `b44b964` | 0 |
| U09 | `grep -c 'loopback or operator-approved only' SKILL.md`; `sed -n 2887p`; `sed -n 15,19p PROVINCE.md`; `grep -n js-rendering-browser-execution corpus/adjacency.tsv` | `1`; the declaration line verbatim; the `PROVINCE` refusal; row `12` cites `SKILL.md:2887` | 0 |
| U10 | `sed -n 36p corpus/lessons/round-33.md`; `printf … \| wc -w` | `(9 words)` present; quote = **7** words | 0 |
| U11 | `sed -n 170p`; `node -e` on `CritC1Counter/receipts/D.json` | "three `refused-route` rows"; `newMappedRows` = **4**, all `refused-route` | 0 |
| U12 | `sed -n '7p;10p;50p;53p' row-S128.md` | `:7` warning, `:10` row, `:50` blank, `:53` Gate row | 0 |
| U13 | `grep -n 'five land' corpus/lessons/round-33.md`; `git show 042d6d9:… \| grep -n 'five land'`; `git show 042d6d9:… \| sed -n '186,187p'`; `grep -c 'supersedes S124' corpus/SOURCES.md` | `:217` at the freeze **and** at `042d6d9`; `:186-187` holds the `c2-J3` control text at both; **0** superseding rows (exit 1) | 0/0 |
| U14 | `grep -c 'non-space' corpus/QUALITY.md`; `grep -n 'goodQuote = ' c1-adjacency-sweep-v3.mjs`; `node -e` with that expression | **0** (exit 1); `:131`; 4-word/19-non-space → `false`, 4-word/20 → `true` | 0 |

Freeze pins that make U01–U07 unroutable as fixes this round:

- `claims.json:25` `"scripts/check-adjacency.mjs (pinned inside C1; must stay unchanged)": "4e2c2a64…"`;
  `claims.json:26` `"scripts/check-bidi-runtime.mjs (pinned inside C2; must stay unchanged)": "370e8e95…"`.
- `claims.json:231` `noHarmRule`: “… `scripts/check-adjacency.mjs` and `scripts/check-bidi-runtime.mjs` are
  byte-unchanged … changes only by an appended correction”.
- Counters enforce it: `c2-firefox-bidi.mjs:70 GATE_SHA256 = '370e8e95…'` and `:326` (refuses any other byte);
  `c1-adjacency-sweep-v3.mjs:74 ADJ_GATE_SHA256 = '4e2c2a64…'`.

## Findings beyond the dispositions (for wave 2 / the L1)

1. **U04 is now the cheapest hole in C1's counting rule.** `c1-adjacency-sweep-v3.mjs:288-290` accepts
   `ruled / contested-open / refused-route` with **no quotation condition**; only `split-declared` must satisfy
   BG+SIDE. A new `contested-open` row citing a fleet L0 row that names the sibling incidentally (the m4b
   construction, e.g. `l0:65`) counts toward `newMapped >= 2` and nothing in the counter objects. Wave 2 must
   attack every new `contested-open` row's L0 citation for aboutness, and no new row should cite an L0 row from a
   prior round.
2. **U07 recurs invisibly in round 35 unless the receipt rule is stated.** `c2-firefox-bidi.mjs` never reads an
   `observed` field; its `provenance[]` is transcript-derived (`:403-410`). A round-35 receipt carrying a
   hand-written `observed` block would pass the counter only if it agrees with the transcripts — which is exactly
   what H2's did not. The C2 seats should write no `observed` block, or derive it; wave 2 should compare every
   session URL in the receipt to the new-session bodies.
3. **The round-35 C2 counter's live scratch has U05's shape, one level milder.** `mkdtempSync` at
   `c2-firefox-bidi.mjs:188` precedes its `try` at `:200` (`finally` at `:284`), so a throw in
   `gate.serveFixture()`/`freePort()` leaks the dir; the verdict shape differs from U05 (a `Refusal` is rethrown
   at `:419`, other errors become `binding`, and the predicate requires `binding null`), so it cannot be scored as
   16 capability failures. Observation, not a claim defect.
4. **U08's closure should be named where the number lives.** The adjudication is `corpus/lessons/round-32.md:229`
   (`b44b964`); `LOG.md:2356` still states "20 of 27" without naming which basis it uses. Low; the LOG line is
   consistent with the adopted basis.

## Limits

- Every reading is of git objects at the freeze in a `--shared` clone. No lane file was written, no gate, counter
  or self-test was executed, and no browser was launched (browser launch is not this seat's lane, so U05's and
  U07's runtime readings are the round-33 seats' measurements, re-read as code/bytes here and marked as such in
  `dispositions.md` §5).
- U08's `fixed-by` rests on the adjudication sentence and E3's dual marker, not on a fresh count of all 43 errata.
- The finding texts quoted are the seats' own lines under `.ufo/waves/round-33/w2/`; where the seat's own pointer
  had drifted (U03 +4 lines, U05 +4 lines, U13 −31 lines) both the cited and the actual line are given.

## Deliverable paths

- `.ufo/waves/round-35/w1/ScribeUDispositionsA/dispositions.md` — the table (U-id | finding | holds-at-freeze |
  disposition | evidence), the six correction drafts, per-item detail, guards, limits.
  sha256 `2acc864c5660139d2d6c7e08379213730ecb1e5ab333042aab3d01405a459ef5`
- `.ufo/waves/round-35/w1/ScribeUDispositionsA/checks.sh` — every command this seat ran.
  sha256 `4398c46ce9912ab5f2d14a9593b7870cc6a13e8622c6ae493cd79c9187bdda02`
- `.ufo/waves/round-35/w1/ScribeUDispositionsA/checks-output.txt` — the outputs with exit codes.
  sha256 `2b2793851e547a99ac55233292ab325e206178ddb1b903ff7ea389f80163c69b`

Scratch (`/fast/scratch/hyaku/tabi-r35/ScribeUDispositionsA`, clone included) is removed before this seat yields.
No tool was installed or upgraded.
