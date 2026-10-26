# Round-28 wave accounting (routed defect 4 of round-28-verifier-spotcheck.md:79)

Written by TabiR29 (round 29). Append-only note; no round-28 file is edited.

- `.ufo/waves/round-28/w1-results.json` lists 64 seat results; `.ufo/waves/round-28/w1/` holds 63 entries
  (`ls .ufo/waves/round-28/w1 | wc -l` → 63 on 2026-10-26, including `swarm-registry.json`), i.e. 62 seat reports.
- `Mut04` — **no report file**. Its only output is inline in `w1-results.json` (`results[].name == "Mut04"`, `output.text`),
  which records mutant verdicts beginning "M1 (MutR: read at evaluated rev …) selftest: 6/7 … **Killed**". It is
  counted as a seat with inline output and no report, not as a reported seat.
- `Mut06` — **no report file and no verdict**. Its inline output is unfinished reasoning text ("We have
  scratch/Crit02/falsify-c1-pair.mjs maybe candidate target tests …"); it is counted as a seat that produced no
  verdict. It is not dead in the job sense (it returned), but it contributes no evidence.
- Corrected round-28 W1 accounting: 64 seats dispatched, 64 returned, 62 reports, 1 inline-only verdict (Mut04),
  1 no-verdict return (Mut06), 0 dead.

Command: `python3 -c "import json;r=json.load(open('.ufo/waves/round-28/w1-results.json'));print([ (s['name'], str(s['output'])[:80]) for s in r['results'] if s['name'] in ('Mut04','Mut06')])"`.
