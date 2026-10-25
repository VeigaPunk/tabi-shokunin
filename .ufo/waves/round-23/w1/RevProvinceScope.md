# RevProvinceScope — PROVINCE check for the C2 CSRF defence-shape entry

Baseline `a89f1935f523a64b00991d792fca6a8c0d321948`; claims read first. Subject (read-only, 37
lines): `/home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/corpus/knowledge/csrf-defense-boundary.md`.
All commands run from the lane root.

**Verdict: IN PROVINCE as *observability* (a capture vocabulary of submit-defence shapes); OUT OF
PROVINCE as *defence-adequacy verdict* (kasegi). Admit only the re-grounded observability form, and
file no adjacency row.**

## Contested-scope line — by sentence class, not topic

- **Inside: capture vocabulary.** `PROVINCE.md:10-13` owns "interaction records: … login-session
  handling rules (cookies/tokens shape-only, never values); dynamic-page evidence patterns (what to
  capture so a claim about a page is re-verifiable)". Staged `:22-33` enumerates observable shapes
  (synchronizer token / double-submit cookie / custom request header) and closes this lane's own
  frontier item, "CSRF-checked submits untested by rule" (`corpus/README.md:43`, `:183`).
  Cmd: `sed -n '6,21p' PROVINCE.md`; `sed -n '43p;183p' corpus/README.md`.
- **Outside: adequacy verdict.** Staged `:19-20` "SameSite is defense-in-depth, never the whole
  defense" and `:34-35` "gives it the reason not to treat a SameSite cookie as a CSRF defense on its
  own". `:19-20` also escalates the upstream hedge — "prudent to ensure that this designation is not
  the extent of a site's defense" (`:16-17`) — into an absolute. The lane already fenced this:
  `corpus/knowledge/stateful-fixture-evidence.md:79` "the token is a CSRF-*shaped* instrument, not a
  security analysis"; and `.ufo/waves/round-16/w1/ConnSiblings.md:69` gives kasegi "Bounty/security
  research incl. prompt injection", verdict "tabi records provenance … only, no security verdict".
  `PROVINCE.md:21` "Out of province → report, never absorb."
  Cmd: `cat -n /home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/corpus/knowledge/csrf-defense-boundary.md | sed -n '10,35p'`;
  `sed -n '75,79p' corpus/knowledge/stateful-fixture-evidence.md`; `sed -n '69p' .ufo/waves/round-16/w1/ConnSiblings.md`.

## Adjacency note the round report must carry

1. **No `corpus/adjacency.tsv` row.** `PROVINCE.md:15-19` routes to revenger/kaidoku, kake, kagi —
   nothing to kasegi; `corpus/QUALITY.md:134-137` admits an overlap only as `ruled`
   (non-lane-authored ruling naming the sibling) or `contested-open` (fleet L0 line naming it), and
   neither exists for CSRF. Precedent: `corpus/lessons/round-17.md:101` dropped exactly a kasegi
   `refused-route` row for having no route. Overlap-of-surface: 0
   (`grep -icE 'csrf|security|samesite' corpus/adjacency.tsv` → 0; 10 data rows).
2. **One boundary sentence, attributed, inside the entry:** security verdict out of province →
   kasegi, report-only, not a refusal route. Quoting upstream is provenance; adopting the verdict as
   a craft rule is absorption and is barred by `PROVINCE.md:21`.
3. **That sentence never lands in `PROVINCE.md`.** It is census-frozen
   (`corpus/evidence/pstack-20261015/baseline-census.tsv:24`; drift fails `history_rewritten` at
   `scripts/check-round-contract.mjs:335`; 56 protected paths). Put it in the note plus the
   `corpus/README.md` coverage row.
4. **kagi line holds while the text stays shape-only.** No cookie/token value appears in the staged
   bytes (`grep -nE 'token=|value'` → the two URL lines only). kake: no publishing content, no overlap.

## Scope-relevant defects found while reading (evidence attached)

- Staged `:10-12` "Wave 2 supplied the cookie mechanics" points into shokuknow staging, not this
  lane: tabi holds no cookie-mechanics note. Sweep
  `grep -rniE 'samesite|csrf|xsrf|anti-forgery' corpus/ SKILL.md | grep -v 'corpus/evidence/w4'`
  returns only frontier/prohibition mentions — `multi-step-journey.md:287`, `packet-readiness-r7.md:64`,
  `layer-routing-synthesis.md:143`, `stateful-fixture-evidence.md:60,79,260,274,288,487-488`,
  `state-changing-matrix-r9.md:374`, `arc-synthesis.md:125`, `corpus/README.md:43,183`, `SKILL.md:1454`.
  Keeping that sentence imports unstaged ground and breaks `corpus/QUALITY.md:112-113` (lane path or
  `<repo>@<40-hex>:<path>`).
- Id crosswalk: staged cites S145/S146, but the registry ends at S101
  (`grep -cE '^(\| |- \*\*)S[0-9]{3}' corpus/SOURCES.md` → 101) and C2 counts `^source: S10[23] `
  (`git grep -lE '^source: S10[23] ' a89f1935f523a64b00991d792fca6a8c0d321948 -- corpus/knowledge | wc -l`
  → 0). Ids kept as staged make C2's after=1 unreachable. Owner RevRenumber; recorded here because
  the provenance trio is what makes the note lane-resolvable.
- No measured credit may attach: the U7 sameSite cells stay open (`stateful-fixture-evidence.md:763`,
  `state-changing-matrix-r9.md:374`); the entry must not be cited as exercising them
  (`claims.json` `notClaimed` bullet 1).

## Sibling-staging sweep — is the ground already claimed?

`for L in kasegi kagi kake; do grep -rliE 'csrf|same-?site' /home/vgpnk/Projects/shokuknow/merge/$L/knowledge/corpus/knowledge | wc -l; done`
→ `0 / 0 / 0` (kasegi stages 67 notes). The filename sweep over all 21 staged lane trees finds no
csrf/security note named for kasegi, kagi or kake. So the ground is unclaimed in the staged corpus
and the contest is one of *sentence class*, not of an existing sibling note.

## Axes, method, limits

Axes named: province discipline (do not absorb), calibration (report the contest, do not resolve it
as author), adjacency (no phantom row). Read-only throughout — `read`, `grep`, read-only git; no
install or upgrade this round (tooling record: none). Not verified: sibling `PROVINCE.md` lines
beyond the pinned `ConnSiblings.md:69` quote (sibling repos untouched); no browser, no network fetch.
