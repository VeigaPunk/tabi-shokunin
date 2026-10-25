# RevRenumber — C2 id re-pointing (round 23, attempt 1)

**Verdict: REVISE the mapping rule, not the ids — the two adopted rows are lane S102 (draft-13 §8.8.1) and lane S103 (OWASP CSRF sheet); any arithmetic staged→lane map (S145/S146) is refused, and C2's own counter cannot move under it.**

Baseline census (measured): `awk -F'|' '/^[ ]{0,3}\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|/{n++}END{print n}' corpus/SOURCES.md` → `101`; first/last `S001`/`S101`; duplicate sweep → empty; gap sweep → empty. Id space is contiguous, so "next unused" is derivable, not guessable.

## Findings

**F1 (blocking) — staged ids are ordinals, not lane ids.** The package numbers rows from the live max, assuming full in-order adoption of all 148. `grep -oE '^\|[[:space:]]*S[0-9]{3,}' SOURCES.append.md | tr -d '| ' | sort -V | sed -n '1p;$p'` → `S102` / `S249`; `wc -l` → `148`; `MERGE-REPORT.md` states "lane registry currently holds **101** rows; first staged id is **S102**". This round adopts 2 of 148, so the offset premise is already false.

**F2 (blocking) — the document key is many-to-one in staging space, so an ordinal cannot name a document.** `grep -nE '6265bis-13' /home/vgpnk/Projects/shokuknow/merge/tabi/SOURCES.append.md` → staged `S125` *and* `S145` both cite `draft-ietf-httpbis-rfc6265bis-13`; `grep -nE 'rfc6265bis-13' …` likewise shows `S172`/`S181` for the same draft. One document carries four staged ids; only the document is a stable key.

**F3 — the correct lane ids, derived by document.** Neither cited document exists in the lane: `grep -rilE 'rfc6265bis-13|Cross-Site_Request_Forgery' corpus/` → empty; `for p in draft-ietf-httpbis-rfc6265bis-13 Cross-Site_Request_Forgery_Prevention_Cheat_Sheet; do grep -cE "^[ ]{0,3}\|.*$p" corpus/SOURCES.md; done` → `0`, `0`. Both are first-time-in-lane, so no `supersedes` edge is owed and both take fresh ids in citation order: **draft-13 → `S102`, OWASP → `S103`** (matches the dispatch's own seat names `SrcS102`/`SrcS103`, and the claim counter `S10[23]` is order-agnostic).

**F4 — the rule that makes it "by document".** SOURCES contract, `## Shape`: `id` — "`S` + 3 or more digits, **the next unused; never reused**"; rule 1: "Write it only after **opening the source** in the round that writes the row." So the id is a function of (a) the document the row is grounded on and (b) the census at append time — never of the staged row's position. Operationally: match on `source` cell URL + anchor lineage → if the document has a lane row, the new row is an append-only `supersedes S0NN —` correction (`## Rules` 2); if not, assign next unused.

**F5 (blocking) — arithmetic breaks the id space.** Projecting S145/S146 into the registry leaves `S102`–`S144` unused, so `next unused` no longer derives any id; the next legitimate append computed as `max+1` (`S147`) silently continues the staging ordinal and the 43-id hole becomes permanent. Re-measured on a projection with the two arithmetic rows inserted after `S101` (census `103`): output `gap 101 -> 145`.

**F6 (blocking, decisive) — the claim's own counter stays 0 under arithmetic.** Re-pointed copy: `sed -e 's/^source: S145 /source: S102 /' -e 's/^source: S146 /source: S103 /' …csrf-defense-boundary.md | grep -cE '^source: S10[23] '` → `1`; the unmodified staged copy → `0`; `git grep -lE '^source: S10[23] ' HEAD -- corpus/knowledge | wc -l` → `0` (honest before). Arithmetic mapping therefore reports C2 as "done" while before→after stays 0→0 — a skip-work shape the claim's control is meant to catch.

**F7 — the exact collision command (0–3 leading ASCII spaces), to run on a projection *before* any append; must print nothing:**
```sh
awk -F'|' '/^[ ]{0,3}\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|/{i=$2;gsub(/[[:space:]]/,"",i);print i}' corpus/SOURCES.md | sort | uniq -d
```
Measured on the live registry → empty, exit `0`. On a projection (registry + the two rows inserted after `S101`) → empty, census `103`; red mutant (second `S102`) → prints `S102`. Tolerance is the CORPUS.md maintained-parser clause: "accepts 0–3 leading ASCII spaces before Markdown table rows … 4 or more spaces are indented code and are ignored"; tab is not an ASCII space, so a tab-prefixed row is also ignored (`grep -nP '^\t\|\s*S[0-9]{3,}\s*\|'` found it, the space sweep did not).

**F8 (blocking for the append step) — the lane's own gate is column-zero only.** `scripts/check-sources.mjs:25` → `const rowPattern = /^\|[ \t\v\f\r]*S[0-9]{3,}[ \t\v\f\r]*\|/`; its `duplicate_id` (`E03`, line 289) therefore sees only column-zero rows. A row pasted with 1–3 leading spaces passes `check-sources.mjs` invisibly, and at 4+ spaces the row is code in *both* parsers: registry count stays 101 while the entry's `source:` line still satisfies F6's counter. Probe that must print `0`: `grep -cE '^([ ]{4,}|\t)\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md`. Append at column 0, after line 115 (`| S101 |`), before `## Paths` (line 117).

**F9 — ordering is load-bearing.** The CORPUS.md `mined` used-by sweep (`… | while read -r p; do [ -e "$p" ] || echo "missing: $p"; done`) compares repo-relative paths, so the knowledge file must land before the rows: a staging-only append prints `missing: corpus/knowledge/csrf-defense-boundary.md`. Adopt the entry first, then the rows with `used-by` pointing at the landed file.

**F10 — the rows' own date must change.** The staged frontmatter says "draft-13 fetched 2026-10-23"; C2 requires *this* lane to re-open both sources, so `source:`/`opened` carry **2026-10-25** (`grep -nE '^(source|opened):|2026-10-23' …csrf-defense-boundary.md` shows the three stale `2026-10-23` stamps to replace). Recheck stays `180d` for both.

**F11 — column count.** Each row must be 11 columns (NF=13) or `check-sources.mjs` rejects it: `awk -F'|' '/^[ ]{0,3}\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|/ && NF!=13 {n++} END{print n+0}' corpus/SOURCES.md` → `0` today; must stay `0`.

## Residual risk / gaps
- I did not run `scripts/check-sources.mjs` (lane gate belongs to the L1); the rowPattern/`E03` reading above is from source at lines 25 and 289, not from its output.
- `.ufo/waves/round-23/assimilation/` is empty, so the staged package under `/home/vgpnk/Projects/shokuknow/merge/tabi/` is the only source of the rows; its staging ordinal may change if it is regenerated — another reason the document, not the id, is the key.
- Only throwaway fixtures were written (`.ufo/waves/round-23/scratch/RevRenumber/`); no tracked file was edited, no git/jj write, no spawn, no message, no tool install (none needed).
