VERDICT: PASS

Scope: C3 row fragment for sibling `kaidoku`. Read-only on `kaidoku-shokunin`; no `jj`, no git
write, no sandbox clone needed, no browsers, no subagents, no installs.

## Pins (deviations stated)

- `kaidoku-shokunin` has **no `master` ref**: `git -C … rev-parse master` →
  `fatal: ambiguous argument 'master'`. Pinned the branch ref instead, never HEAD:
  `git rev-parse refs/heads/main` → `9011581d84527ba34c675f9cf912e54d2e72d470`
  (coincided with HEAD at read time; all sibling quotes were fetched through the 40-hex).
- tabi `refs/heads/master` = `5859243183c4d7ac5429dfdb8a73ce0d9a43d583` (quotes evaluated there).
- fleet HEAD = `534852203d551f38c68e3a1efd26b6fbe7663267` (only inspected for an l0 line; none relevant).
- `tabi_ref` carries the path only (`PROVINCE.md` / `SKILL.md`), per PLAN §C3's
  "`tabi_ref` = `<lane-relative path>`"; the quote is verified against the whole file at master.

## Rows written — `.ufo/waves/round-17/adjacency/kaidoku.tsv` (3 rows, no header, 9 TAB fields)

1. `cdp-runtime-observation` | sibling `PROVINCE.md:53` "Runtime observation (CDP)" | tabi
   `PROVINCE.md` "CDP session discipline (endpoints, targets, screenshot/DOM evidence" | `ruled`
   | ruling `corpus/lessons/round-16-verifier-spotcheck.md:142` "keeps CDP only as an REA provider
   surface for shipped-artifact analysis".
2. `cdp-runtime-verbs` | sibling `PROVINCE.md:128` "Runtime observation verbs" | tabi `SKILL.md`
   "Launch a fresh headless chromium on a loopback debug port, own profile." | `ruled` | ruling
   `:141` "owns live browser/CDP page observation, including the WebMCP page-tool surface".
3. `reverse-engineering-as-forensics` | sibling `PROVINCE.md:3` "reverse engineering of shipped
   artifacts with REA on this Linux" | tabi `PROVINCE.md` "reverse engineering as forensics
   (→ revenger/kaidoku)" | `split-declared` | ruling_ref `-`.

### Pasted verification (one `git show … | sed -n '<line>p'` per quote)

```
$ git -C kaidoku-shokunin show 9011581d…:PROVINCE.md | sed -n '53p'
| Runtime observation (CDP) | self-launched targets: `chromium --headless --remote-debugging-port=9222`, `xvfb-run electron --remote-debugging-port=9223`; `list_browser_targets`, `inspect-web-page`, …
$ git -C kaidoku-shokunin show 9011581d…:PROVINCE.md | sed -n '128p'
| Runtime observation verbs | self-launched CDP/V8-inspector targets (r3 recipe); `node --inspect` needs a real file target …
$ git -C kaidoku-shokunin show 9011581d…:PROVINCE.md | sed -n '3p'
**Domain:** reverse engineering of shipped artifacts with REA on this Linux
$ git show 5859243:PROVINCE.md | sed -n '9p'
CDP session discipline (endpoints, targets, screenshot/DOM evidence
$ git show 5859243:PROVINCE.md | sed -n '15p'
**Refuses:** reverse engineering as forensics (→ revenger/kaidoku),
$ git show 5859243:SKILL.md | sed -n '125p'
**4. Launch a fresh headless chromium on a loopback debug port, own profile.**
$ git show 5859243:corpus/lessons/round-16-verifier-spotcheck.md | sed -n '141p'
- **tabi** owns live browser/CDP page observation, including the WebMCP page-tool surface.
$ git show 5859243:corpus/lessons/round-16-verifier-spotcheck.md | sed -n '142p'
- **kaidoku** keeps CDP only as an REA provider surface for shipped-artifact analysis (`kaidoku-shokunin/PROVINCE.md:53`, "Runtime observation (CDP)"). It cites tabi for browser-side mechanics.
```

Mechanical re-check (python, pinned blobs): all 3 rows → `NF=9`, sibling_quote substring of the
named line, tabi_quote substring of the named file at master, ruling_quote substring of the named
ruling line, every quote ≤25 words and TAB-free; `cat -A` shows `^I` separators only, 0 CRLF,
0 trailing-space lines.

## Findings

1. **Ruling lines are `:141` (tabi bullet) and `:142` (kaidoku bullet)** at
   `5859243:corpus/lessons/round-16-verifier-spotcheck.md` (heading `:138`); matches the assignment's
   `:141-142` hint. Markdown bold sits *inside* each bullet (`- **tabi** owns…`), so ruling quotes
   start after the bold markers; quoting `"kaidoku keeps…"` would not be a contiguous substring.
2. **Kaidoku does NOT cite tabi anywhere in its authored surfaces at the pin.**
   `git grep -n -i -w -e tabi 9011581 -- . ':(exclude).ufo'` → no output, exit 1. The 11 tracked
   files containing the word are all under `.ufo/**` (session transcripts, copied wave reports); none
   is `PROVINCE.md`, `SKILL.md`, `README.md`, `MINT.md`, `LOG.md`, `SHONEN.md`, `SCORECARD.md` or
   `corpus/**`. The only substring hit inside `PROVINCE.md` is "id-stability" (`:142`). The ruling's
   `:142` sentence "It cites tabi for browser-side mechanics." is therefore **unlanded** — the row
   records the ruling, not an existing citation. L1 must not write the citation as present.
3. **Port/profile mechanics do not collide with tabi.** kaidoku self-launches on `:9222`/`:9223` with
   a dedicated temp profile (`corpus/knowledge/2026-10-13-r3-runtime-observation.md:16-17`,
   `--user-data-dir=/tmp/kaidoku-chrome`); tabi reserves `19411|19412` (`SKILL.md:116,127`) and its
   only 9222 line *rejects* attaching an everyday profile (`corpus/SOURCES.md:41`, verified substrings
   "attaches port 9222 to the user's everyday browser profile" and "flip: the recipe updated to a
   dedicated"). Disjoint ports; the S027 flip kaidoku already satisfies.
4. **Kaidoku's own archive contradicts the ruling.** `.ufo/waves/round-14/w1/SiblingOverlap.md:34`
   at the pin records tabi as "**Zero overlap.**". That is a wave archive, not a province claim, so it
   is not a row; the round-16 ruling supersedes it. Flagged so L1 can label it history if cited.
5. **Rejected candidate overlaps** (each a real search hit, no row written):
   - `kaidoku-shokunin/SKILL.md:55` ("Runtime targets | self-launch `chromium --remote-debugging-port=9222` …")
     — restates `PROVINCE.md:53`'s surface under the same ruling; one row per surface.
   - `corpus/knowledge/2026-10-13-r3-runtime-observation.md:16-17` — the r3 recipe restating the same
     surface; corpus note, not a capability claim.
   - **9222/9223 port vs tabi** — not a tabi-doc surface: tabi never names 9222 in `PROVINCE.md`/
     `SKILL.md`, and its single 9222 mention rejects everyday profiles, not lane-launched temp ones.
     The the-musketeer lease is the kagi/kake fragment's row (PLAN C3), not this one.
   - **`.ufo/l0-questions.md` contested-open** — no tabi line about the CDP port lease exists (only
     tabi `round-5` operator approval and `round-1` namespace, at fleet HEAD `5348522`), so a
     contested-open row would have needed `NEEDS-L0` and no verifiable `ruling_ref`; omitted rather
     than smuggling an unverifiable reference into the map. If L1 wants it, the drafted question is:
     "tabi | round-17 | Kaidoku's standing recipe pins `--remote-debugging-port=9222`
     (`kaidoku-shokunin/PROVINCE.md:53` at `9011581`); tabi's bounds forbid 9222. Does the lease cover
     a lane-launched temp-profile instance on 9222, or must every lane move off 9222? Evidence:
     tabi `corpus/SOURCES.md:41` (S027 flip to a dedicated `--user-data-dir`); no lane change waits."
6. **Row 3 is a boundary, not a live conflict.** tabi `PROVINCE.md:15` names kaidoku explicitly and
   kaidoku `PROVINCE.md:3` claims the RE domain, so the pair states the split; `ruling_ref` is `-` per
   schema. L1 may drop it without weakening rows 1-2 (the ruling-backed CDP rows).

## Gaps

- `kaidoku` `main` is a live branch; rows pin `9011581`, so they stay verifiable even if it advances.
- Kaidoku `.ufo/**` archives were treated as history, not as kaidoku province claims.
- I did not verify kagi/kake lease rows or `webzites` presence (other seats own them).

Tools installed/updated: none.

Files written:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/adjacency/kaidoku.tsv`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/w1/AdjKaidoku.md`
