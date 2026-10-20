VERDICT: PASS

# AdjRevenger — C3 sibling-overlap fragment for `revenger`

Wrote 2 rows, no header, 9 TAB columns each, into `.ufo/waves/round-17/adjacency/revenger.tsv`.

**Pin deviation (recorded):** `revenger-shokunin` has no `master` branch —
`git -C /home/vgpnk/Projects/shokunin/revenger-shokunin rev-parse master` →
`fatal: ambiguous argument 'master': unknown revision or path not in the working tree.`
The lane branch is `main`: `rev-parse refs/heads/main` →
`cf02419276e5dd8aafb6fe09d4e9aaa6bcb78c97`, equal to `refs/remotes/origin/main` (branch tip, not a
HEAD read). All sibling refs use that 40-hex. tabi evaluated at `master` =
`5859243183c4d7ac5429dfdb8a73ce0d9a43d583`. `git status --porcelain PROVINCE.md corpus/README.md`
in revenger is empty, so blob == cited commit for every sibling quote.

## Rows

### Row 1 — `browser/Electron runtime evidence via REA (C08 CDP page observation)` — ruled

| col | value |
|---|---|
| sibling | `revenger` |
| sibling_ref | `revenger-shokunin@cf02419276e5dd8aafb6fe09d4e9aaa6bcb78c97:PROVINCE.md:5` |
| sibling_quote | `browser/Electron runtime evidence — using the REA skill and its toolset,` (11 words) |
| tabi_ref | `PROVINCE.md` (line 9 at 5859243) |
| tabi_quote | `CDP session discipline (endpoints, targets, screenshot/DOM evidence` (7 words) |
| disposition | `ruled` |
| ruling_ref | `tabi-shokunin@5859243183c4d7ac5429dfdb8a73ce0d9a43d583:corpus/lessons/round-16-verifier-spotcheck.md:141` |
| ruling_quote | `**tabi** owns live browser/CDP page observation, including the WebMCP page-tool surface.` (11 words) |

```
$ git -C revenger-shokunin show cf02419:PROVINCE.md | sed -n 5p
browser/Electron runtime evidence — using the REA skill and its toolset,
$ git -C tabi-shokunin show 5859243:PROVINCE.md | sed -n 9p
CDP session discipline (endpoints, targets, screenshot/DOM evidence
$ git -C tabi-shokunin show 5859243:corpus/lessons/round-16-verifier-spotcheck.md | sed -n 141p
- **tabi** owns live browser/CDP page observation, including the WebMCP page-tool surface.
```

Why `ruled`: revenger is an REA lane whose C08 frontier names the mechanism as “passive CDP
observation of a declared local page” (`corpus/README.md:66`, corroborating, same surface) while
tabi’s province claims “CDP session discipline (endpoints, targets, screenshot/DOM evidence
capture)” (`PROVINCE.md:9-10`). The ruling’s ownership bullet is not sibling-scoped — it assigns
live browser/CDP page observation to tabi — so the contested half (page observation) is disposed,
and the remainder (REA evidence over a shipped Electron artifact) is revenger-only and does not
overlap tabi. Residual [INFERENCE]: ruling `:142` names **kaidoku**, not revenger, for the
“REA provider surface” carve-out; row 1 rests on `:141` alone. See Contested-open below.

### Row 2 — `reverse engineering of shipped artifacts (forensics)` — refused-route

| col | value |
|---|---|
| sibling | `revenger` |
| sibling_ref | `revenger-shokunin@cf02419276e5dd8aafb6fe09d4e9aaa6bcb78c97:PROVINCE.md:3` |
| sibling_quote | `Owns: reverse engineering of shipped artifacts — native binaries, managed` (10 words) |
| tabi_ref | `PROVINCE.md` (line 15 at 5859243) |
| tabi_quote | `reverse engineering as forensics (→ revenger/kaidoku)` (6 words) |
| disposition | `refused-route` |
| ruling_ref | `-` |
| ruling_quote | `-` |

```
$ git -C revenger-shokunin show cf02419:PROVINCE.md | sed -n 3p
Owns: reverse engineering of shipped artifacts — native binaries, managed
$ git -C tabi-shokunin show 5859243:PROVINCE.md | sed -n 15p
**Refuses:** reverse engineering as forensics (→ revenger/kaidoku),
$ git -C tabi-shokunin show 5859243:SKILL.md | sed -n 685p
  Refuse-and-route: RE forensics → revenger/kaidoku; publishing → kake; secrets → kagi
```

Both quotes state the split: tabi refuses and names the route; revenger owns the routed surface.
Per PLAN §C3, `refused-route` carries `-` in both ruling columns. Corroborating tabi route lines
`SKILL.md:744` (A10 out-of-province → `revenger+kaidoku`) and `SKILL.md:1710`
(“forensic work remains revenger/kaidoku-owned”) are the same disposition, not new rows.

## Rejected candidate overlaps (reasons)

1. `revenger-shokunin@cf02419:corpus/README.md:66` (“C08 browser/Electron runtime — passive CDP
   observation of a declared local page.”) — duplicate citation for row 1’s single surface; the map
   is “one row per overlap”, so the province-level claim (`PROVINCE.md:5`) carries the row and :66
   is corroboration. Adding it would double-count one disposition.
2. `revenger-shokunin@cf02419:PROVINCE.md:19` (“Refuses: live-target execution beyond the declared
   target and lifecycle”) — same browser/Electron runtime surface as row 1 (it bounds revenger’s
   own live execution, not a second surface); no separate disposition available.
3. `revenger-shokunin@cf02419:corpus/README.md:30` (C04 JavaScript/Electron packages, static) —
   tabi has no package-analysis surface (`PROVINCE.md:6-13`: plugin docs, browser inventory, CDP
   discipline, interaction records); no shared artifact or tool.
4. `revenger-shokunin@cf02419:PROVINCE.md:22` (“harness/evidence auditing (harness-integrity,
   gate-evidence, rlm-dispatch)”) — harness auditing is the fleet gates/L1 territory, not a tabi
   surface; nothing to adjudicate between these two lanes.
5. `revenger-shokunin@cf02419:corpus/README.md:39` (C13 fixity/provenance: digest scope, receipts
   versus origin) — methodology, not a surface: revenger’s object is shipped-artifact fixity,
   tabi’s is live-page re-verifiability (`tabi PROVINCE.md:12-13`); no ownership conflict, no
   routing required.
6. `revenger-shokunin@cf02419:corpus/README.md:40` (C14 host readiness for REA routes) — readiness
   census for revenger’s own routes; tabi’s report surface is separate; no overlap.
7. `revenger-shokunin@cf02419:PROVINCE.md:13` (`rea-agents@6.4.0` pin) vs tabi’s REA connect-mode
   capture reference (`tabi SKILL.md:403`) — REA is a shared host tool, not a lane-owned surface;
   neither lane cites the other’s version as an interface. Observation only: revenger pins 6.4.0;
   this round’s environment uses `rea-agents@6.5.0` (`npx -y rea-agents@6.5.0`), so the two lanes
   would emit runtime evidence from different REA builds — noted for the L1, not a tabi row.
8. `tabi SKILL.md:1878` (“May the lane invoke a page tool? | `WebMCP.invokeTool` probe | Loopback
   fixtures only”) — tabi-side WebMCP-invocation claim (C2 capability this round); revenger makes
   no invocation claim anywhere (`git grep -i 'webmcp'` in revenger: no hits), so there is no
   sibling side to adjudicate.

## Contested-open / L0

No `contested-open` row is emitted. `grep -nE 'CDP|revenger|browser'
/home/vgpnk/Projects/shokunin/.ufo/l0-questions.md` returns only `:10` (kasegi), `:42` (tsukuroi,
kaidoku/revenger shipped-artifact overlap), `:52`, `:53` (kama, planner roles) — **no `tabi |` line
names CDP, browser observation or revenger**. `.ufo/l0-questions.md` is present and clean at fleet
HEAD `534852203d551f38c68e3a1efd26b6fbe7663267`, but the nearest relevant line (`:42`) is
tsukuroi/kaidoku-revenger, so it cannot anchor a tabi `contested-open` row (`NEEDS-L0` would apply
if one were filed).

Draft question, if the L1 wants revenger named rather than disposed by analogy:

```
tabi | round-17 | Does the integrator CDP ruling (tabi-shokunin@5859243183c4d7ac5429dfdb8a73ce0d9a43d583:corpus/lessons/round-16-verifier-spotcheck.md:141-142) bind revenger's C08 "browser/Electron runtime evidence"? :141 assigns live browser/CDP page observation to tabi, but :142's REA-provider carve-out names kaidoku only. C3 row revenger.tsv:1 records `ruled` on :141; revenger corpus/README.md:66 keeps C08 as a frontier with zero work evidence.
```

## Contract notes for C3Checker / L1

- `tabi_ref` is path-only per PLAN §C3 (`<lane-relative path>`); exact lines are `PROVINCE.md:9` and
  `PROVINCE.md:15` at 5859243 (pasted above). A checker that wants line numbers must resolve them
  from the quote, not from `tabi_ref`.
- Row 1’s `ruling_quote` is verbatim **including** the `**` emphasis around `tabi`; a checker must
  not strip markdown before the substring test (`tabi owns …` is NOT a substring of the line).
- `refused-route` rows use `-` for both ruling columns, as the schema requires.
- File is UTF-8 with em dashes (`—`) and an arrow (`→`) inside quote cells; separators are literal
  TABs, 9 fields per row, no header.

## Verification

Read-only checker (node, `git show` per cited ref) over the fragment:

```
{"row":1,"sq":true,"sw":11,"tq":true,"tw":7,"rq":true,"rw":11,"disp":"ruled","pass":true}
{"row":2,"sq":true,"sw":10,"tq":true,"tw":6,"rq":true,"rw":0,"disp":"refused-route","pass":true}
rows 2 bad 0 header: false
```

(`sq/tq/rq` = quote is an exact substring of the cited line/file; `sw/tw/rw` = word counts ≤25; both rows parse to exactly 9 TAB-separated fields.)

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/adjacency/revenger.tsv
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/w1/AdjRevenger.md
Tooling: no installs or upgrades; no pacman/jj/git writes; no browser runs.
