# ScribeLesson — scoped findings (round 39, v2 wave)

Full report: `.ufo/waves/round-39/w1/ScribeLesson/report.md`.
Lesson draft (deliverable): `.ufo/waves/round-39/w1/ScribeLesson/round-39.md`.

Item completed: `corpus/lessons/round-39.md` drafted in the seat directory with a Gate carrying an
admit candidate (C1 capability) and rejects (C2 calibration repair; the round-38 v1 receipt as
do-nothing control) plus the assimilation candidate status for S145 (`payload-absent`, rejected and
carried), an S145 source-access quote slot, and six Mistakes rows in
`class · evidence · captured-by · fix` form. Nothing in the draft is marked verified without a
named artifact; peer-carried evidence is labelled as such.

Headline observations (all first-hand, at lane tip `1ace2fdeca7b9f81b8e4cf48f1a0f88e308bc0e4`):

- **C1 admit candidate** — frozen counter exit 0, `predicate=true`, `findings=[]`, control refused
  with 5 reasons (`w1/ScribeLesson/counter-run-at-head.txt`).
- **C2 reject** — frozen counter exit 1, `predicate=false`, `d5-receipt` (`measure/census-end.txt`
  absent) and `d6-file` (`measure/numstat-at-1ace2fde.txt` absent); D6 additionally unsatisfiable
  as frozen (`measure/c2-self-reference-probe.txt`).
- **Endianness red/green passes at the counter level** — pre-fix receipt (rev `2d4f10d…`) exit 1 with
  five non-loopback findings (`ss=0 proc=6` per run, totals 6/6, receipt 12); post-fix receipt
  (rev `4e65071…`) exit 0, `predicate=met`, `findings=0`; single-file diff
  (`w1/ScribeLesson/redgreen-counter.txt`).
- **S145 quote located** on `https://man7.org/linux/man-pages/man5/proc_pid_net.5.html`
  (§DESCRIPTION `/proc/net/tcp`, 12 words per whitespace split; the carrier's `proc.5.html` URL
  contains 0 occurrences of `rem_address`), so the admit is conditional on citing the correct URL;
  registry row is absent (register ends at S144).
- **Freeze provenance gap** — the claims blob that sets `frozenAt 9c09ebb1…` is not the blob at
  `9c09ebb1` (that blob has `frozenAt 1f4260ae…`); the only difference is the `frozenAt` line, and
  all three frozen digests do equal the claims table at `9c09ebb1`.
- **Coverage window inflation** — committed receipt sample spans are 799 ms and 701 ms while
  `coverageMs` reads 1560/1461; the 600 ms post-close tail is counted as coverage.
- **Parser residual open** — malformed `/proc` hex (`GG00007F`, `0100ZZ7F`) is still classified
  loopback (width-only validation before `parseInt`).

Conflicts between wave reports are quoted verbatim in the report's `## Conflicts` section
(`ScoutSourceS145` no-access vs `assimilation/S145-open.txt` accessed; `RevSourcesRow` URL/title
mismatch vs my located quote; `RevFreezeIntegrity` C2 digest mismatch at `1f4260ae` vs equality at
`9c09ebb1`; `CritNumstatProtocol` ok vs `CritC2Semantics`/`RevD5D6` self-reference; `RevC1Receipt`
ok vs `RevC1Driver` source-level finding).

No production file, counter, claim, registry row, knowledge entry, or `measure/` receipt was
written; no commit, no browser run (`fixture` not started), no subagents, no tool installs.
Scratch `/fast/scratch/hyaku/tabi-r39/ScribeLesson/` and the `/tmp` page copies were removed.

VERDICT finding — C1 admit candidate and C2 reject are both evidenced at tip 1ace2fd; the round-39 lesson draft records six mistakes, of which four (M1 residual, M3, M4, M6) remain open.
