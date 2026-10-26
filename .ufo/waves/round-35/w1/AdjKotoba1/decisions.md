# AdjKotoba1 — decisions (round 35 w1, C1 chunk, 10 kotoba candidate lines)

Keys are `<lane>-shokunin@<pin>:<path>:<line>`; pin `65a5c7a663249e0522cc49e4a148424200d9ddfe` (kotoba).
Decision rule applied in order: tabi `SKILL.md:2861-2881`. Verified rows in the map at the freeze:
16 clean, none of them kotoba (`counter-check.json` `adjacency.verdict=clean rows=16 verified=16`), so
rule 2 (`same-surface`) had no surface to name for this sibling; every line stopped at rule 1.

| key (path:line) | decision | ground |
|---|---|---|
| corpus/knowledge/agent-def-audit-round6.md:23 | screen / not-browser-sense | The BG hit is the token `musketeer` in the verdict-matrix row `\| musketeer \| ✓ …` (header `## Verdict matrix (18 files × AD-1…AD-9)`, file lines 7-9); it scores an agent-definition file against checklist items, and says nothing about a browser, driver, protocol or capture, which is what tabi `PROVINCE.md:8-13` governs. |
| corpus/knowledge/agent-def-audit-round6.md:56 | screen / not-browser-sense | `distiller/janitor/musketeer are reachable only via` sits under `## Reachability (AD-2 detail)` and states which `opencode.json`/`orch.md` enrollment keys reach which agent files — a roster fact, no browser session, so no tabi surface is touched. |
| corpus/knowledge/agent-def-audit-round6.md:76 | screen / not-browser-sense | Finding row 4 (`AD-5 frontmatter-only; musketeer.md:22 dated body anecdote ungoverned`) records a checklist-scope gap about an agent file's body staleness; the only `musketeer` sense is the filename, not the CDP profile lease tabi records at `PROVINCE.md:9-11`. |
| corpus/knowledge/agent-defs-commands-and-round-prompts.md:36 | screen / not-browser-sense | The line counts which agent files omit the 9-line Godspeed block (`Four files omit it entirely (bootstrapper, distiller, janitor, musketeer)`); the document's subject is dispatch prompts and agent-definition zones, with no browser craft on the line. |
| corpus/knowledge/harness-router-models-round9.md:28 | screen / not-browser-sense | The BG hit is the skill name `kimi-webbridge` inside the list of six newline-bearing description cache keys (`sha256(prompt_template ‖ 0x00 ‖ name ‖ 0x00 ‖ description)`); the line is about YAML scalar style and the offer cache, not about the kimi-webbridge plugin that tabi `PROVINCE.md:6-8` documents. |
| corpus/knowledge/harness-verifier-round10.md:91 | screen / not-browser-sense | The same skill name appears in a table row giving the loader-held description value for `>`/`\|` scalars (`6 (omarchy, wwkd, xbrd-ask, sekhmet-l3, kimi-webbridge, ufo)`); it is a cache-key variant row, carries no bridge or browser runtime claim. |
| corpus/knowledge/harness-verifier-round10.md:103 | screen / not-browser-sense | Under `## Offer gate roots` the line says `~/.omp/agent/skills` adds the `kimi-webbridge` and `ufo` names to the 15 under `~/.agents/skills` — a skill-root census of offered names, not the plugin directory tabi owns. |
| corpus/knowledge/opencode-offer-trace-round8.md:216 | screen / not-browser-sense | `kimi-webbridge` is one of the names whose creation date explains a +1 step in the logged `init count` (`every transition is +1 and later in time than the mtime that`); the subject is the reconstructed offered-name set, not a browser bridge. |
| corpus/knowledge/opencode-offer-trace-round8.md:217 | screen / not-browser-sense | The continuation dates that name (`created 2026-09-12, first count=18 at the next`) as offer-set history; no driver, protocol, capture or browser session appears on the line. |
| corpus/knowledge/opencode-offer-trace-round8.md:237 | screen / not-browser-sense | The reconstruction recipe's name enumeration lists `kimi-webbridge` among 17 offered skills (`kimi-webbridge, omarchy, sekhmet-l3, ufo, wwkd, xbrd-ask` (+ builtin); a bare name listing with no browser ground. |

## Why no map row
No line in this chunk states kotoba's *side* of ground on a tabi surface — none owns, refuses, routes,
leases, shares or contests anything browser-shaped (the rule-5 test). Kotoba's reachable surfaces here are
skill frontmatter/description hashing, agent-definition files and offer-gate roots, and tabi's `PROVINCE.md`
surfaces (plugin docs, browser inventory, CDP discipline, evidence capture, site gotchas, rate/rights,
login-session shape, dynamic-page evidence) are not on any of them. An empty `rows.tsv` is the honest
result; `newMapped 0` for this chunk, so the round's `newMapped >= 2` target rests on other seats' chunks.

## Attack surface (named before anyone attacks it)
Two reversal routes exist and neither flips a screen here:
1. `musketeer` is also the agent whose Chrome-profile lease is a mapped `contested-open` surface for
   kake and kagi (`corpus/adjacency.tsv` rows 6 and 7 at the freeze). The four `musketeer` lines above
   audit that agent's *definition file* (verdict matrix, enrollment reachability, frontmatter/body
   scope, Godspeed-block census); none of them states a lease, an endpoint, a target or a session, so
   the rule-5 side test fails and no tabi `tabi_ref`/`tabi_quote` pair would be truthful.
2. `kimi-webbridge` is a tabi substrate surface (`PROVINCE.md:6-8`, plugin directory). The six
   `kimi-webbridge` lines are about the *skill* of that name in the description cache / offer-gate
   roots / offer-trace reconstruction — hashes, YAML scalar style, root lists and name sets — which is
   kotoba's frontmatter and harness surface, not the plugin's internals; a map row citing them would
   quote a line with no browser-ground content beyond the name.
A later seat that reads either group as overlap should say which side-stating word it relies on; the
candidate lines carry none, and `SKILL.md:2878-2881` forbids converting that gap into a row.
