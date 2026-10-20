VERDICT: PASS

Scope: draft of the round-17 `## Adjacency map (round 17)` append for `PROVINCE.md`, written to `.ufo/waves/round-17/drafts/province.md` (L1 integrates; no lane file written). Lane HEAD observed at 5859243183c4d7ac5429dfdb8a73ce0d9a43d583. No git writes, no jj, no browser launch, no subagents, no tool installs.

## Findings (each with evidence)

1. **Integrator ruling is verbatim-citable at baseline.** `git show 5859243:corpus/lessons/round-16-verifier-spotcheck.md` lines 138-142: heading `:138`, tabi bullet `:141` = "**tabi** owns live browser/CDP page observation, including the WebMCP page-tool surface.", kaidoku bullet `:142`. Commit 5859243 is the spot-check commit (`2026-10-20T12:24:02-03:00`), so it is the `ruling_ref` anchor for C3 (`repo@40-hex:path:line`, PLAN C3 contract).
2. **Kaidoku half of the ruling is NOT landed.** `kaidoku-shokunin/PROVINCE.md:53` ("Runtime observation (CDP)" row) contains no tabi reference. The only `tabi` substring hit in that file is inside "stability" (`:142`). Routed item 5 (`round-16-verifier-spotcheck.md:152`) remains open on the kaidoku side. Recorded as debt in the draft; the tabi-side append does not claim kaidoku's edit.
3. **Overlap artifacts do not exist yet.** `corpus/adjacency.tsv` and `scripts/check-adjacency.mjs` are absent in tabi (`test -e` both false). The draft points to them as round-17 outputs (C3); L1 must not cite them as present until they land.
4. **Sibling overlap rows located.**
   - Musketeer profile: `kagi-shokunin/corpus/adjacency.tsv:82` = `$HOME/.local/share/the-musketeer/chrome-profile	kake	contested	presence-only	lane:kake/SKILL.md:161`.
   - Musketeer profile claim by kake: `kake-shokunin/SKILL.md:159-162` ("Lease before browser", `webzites lease acquire`, CDP `127.0.0.1:9222`); `kake-shokunin/PROVINCE.md:35-36` ("contested scope (kagi/tabi/kake) and stays with the integrator").
   - Kagi declaration: `kagi-shokunin/PROVINCE.md:43` ("contested with kake … presence-only"); `kagi-shokunin/corpus/knowledge/cdp-bridge-1password.md:77-82` ("Ownership of the shared-browser lease for vault work is unresolved in this province; filed to the integrator").
   - Kake crawler discipline: `kake-shokunin/PROVINCE.md:30` ("`tabi` drives browsers and owns client-side crawler discipline").
   - Tabi's own surface: `PROVINCE.md:6-13` ("CDP session discipline") and `:15-19` (refusals).
5. **Lease status (observed 2026-10-20, presence/listener only; no profile content read):**
   - `test -d ~/.local/share/the-musketeer/chrome-profile` → absent. Matches `kagi-shokunin/PROVINCE.md:12-13` (round-18 erratum: "no musketeer profile").
   - `ss -ltnH | grep ':9222 '` → 0 listeners.
   - `command -v webzites` → empty; `~/Projects/webzites` → absent. The lease command named by kake (`kake-shokunin/SKILL.md:159`) therefore cannot run on this host.
   - Conclusion: no active lease can be observed; the ownership question is still contested with no integrator ruling. `.ufo/l0-questions.md` has no musketeer/lease question (`grep -n -i "musketeer\|lease"` returns only unrelated round-N questions).
6. **Refusal routes unchanged.** `PROVINCE.md:15-19` (revenger/kaidoku, kake, kagi, never consequential actions). The draft restates them by pointer only.
7. **Format.** The draft is 1,708 bytes: one heading plus five bullets, each bullet one physical line, inside the ≤14-line append bound. The lane file has 21 lines at baseline (`wc -l`) and no prior appended section, so this is the first append. The append-only status of `PROVINCE.md` is taken from PLAN.md ("`check-round-contract.mjs:25`"); I did not open that script, so it is [INFERENCE] until L1 reads it.

## Disposition notes for L1

- Use `ruling_ref = tabi-shokunin@5859243183c4d7ac5429dfdb8a73ce0d9a43d583:corpus/lessons/round-16-verifier-spotcheck.md:141` with `ruling_quote` = the bullet text, disposition `ruled`.
- The musketeer lease row must be `contested-open` (ruling_ref `fleet@<40-hex>:.ufo/l0-questions.md:<line>` of a `tabi | round-17 |` line) **or** `split-declared` (ruling_ref `-`, both quotes stating the split). No such fleet line exists yet; L1 must file one or declare the split. The draft does not decide it.
- Kagi's row `kagi-shokunin/corpus/adjacency.tsv:82` is a sibling file; it may be cited by path, but the 9-column tabi row must pin its own 40-hex commit.

## Gaps (not verified in this draft)

- `revenger` browser-runtime overlap and other sweep-found overlaps (PLAN C3) were not scouted here; they belong to `.ufo/waves/round-17/adjacency/<sibling>.tsv` scouts.
- Searched `musketeer|lease` only in `.ufo/l0-questions.md`; a pending lease question under different wording would not be caught.

## Tools

Installed/updated: none.

Files written:
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/drafts/province.md`
- `/home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-17/w1/DraftProvince.md`
