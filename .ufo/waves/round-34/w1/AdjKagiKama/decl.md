# Round-34 declaration bullets from AdjKagiKama

Count: **0**.

No map row is drafted from this seat's seven candidates, so there is no new tabi
declaration line to append under
`## Round 34 — sibling-overlap declarations (outside PROVINCE)` in `SKILL.md`.
All seven candidates are accounted for by screen rows (`screen.tsv`), and none
of them names a boundary that is not already carried by a verification-passing
map row.

Why no map row was available for these lines:

1. **No `split-declared`.** The counter's split rule requires the *sibling*
   quote to contain the word `tabi` (`counters/c1-adjacency-sweep-v2.mjs`, the
   `newMapped` filter: `if (r.disposition === 'split-declared') return /\btabi\b/i.test(r.siblingQuote)`),
   and none of the seven cited lines contains that token — measured on the
   pinned bytes, `tabi-tokens=0` for every key (receipt: `candidates.tsv` +
   the token check in `commands.md`).
2. **No `ruled`.** No fleet-repository line outside `.ufo/` names both `kagi`
   and `tabi`, or both `kama` and `tabi` (receipt in `commands.md`), so there is
   no venue the gate would accept as a ruling for these surfaces.
3. **No `contested-open`.** The two surfaces these lines land on are *already*
   contested-open (map rows 6 and 11, fleet `.ufo/l0-questions.md:62` and `:65`);
   a second row on the same surface would be a duplicate boundary, not a new
   one. kagi's own text neither claims the surface nor disputes it — it reports
   the conflict to the integrator (`SKILL.md:488`, `cdp-bridge-1password.md:77-82`)
   — and kama's registry gives non-model pins no verdict
   (`consumer-registry.md:230-231`). Neither is an *unruled* contest.
4. **No `refused-route`.** None of the seven lines describes a surface tabi
   refuses and routes to kagi or kama; the direction of every deferral in these
   lines is toward tabi (kagi's "the browser lane") or toward the integrator
   (the lease), not away from tabi's craft.

Consequently: no `tabi_ref`/`tabi_quote` declaration is drafted here, and the
L1 should add no bullet from this seat to that section.
