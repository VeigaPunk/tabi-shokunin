# ExecCensusScratch

See [full report](w1/ExecCensusScratch/report.md).

Scratch mirror of `corpus/SOURCES.md` plus one synthetic S145 row validates clean under
`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <scratch>/repo/corpus/SOURCES.md --today 2026-10-27`:
exit 0, 21 stdout lines = the 20 pre-existing `W04` warnings + `file ok <path>`, stderr empty, no `E` code for S145.
Row schema confirmed: NF=13 (11 contract columns), id `S145` (next free id after `S144`), kind `docs`, tier `A`,
status `queued`, opened `2026-10-27`, recheck `on-release`, used-by `—`. Production registry untouched
(`git status --porcelain -- corpus/SOURCES.md` empty). 20 negative controls confirm the schema is enforced
(E01/E02/E03/E04/E05/E06/E08/E10/E11/E12 fire; W01/W02/W03 do not change the exit).

VERDICT finding — census `rows`/`tier` metrics and the C2 counter's D5 parse use different scoping and key
naming (Registry-section-scoped vs whole-file id-regex; `tier.invalid` vs literal `tier.D`), so the
round-39 census receipt must carry explicit `rows:`/`tier:`/`status:` count lines matching the landed S145
row's shape, not a paste of the census TSV.
