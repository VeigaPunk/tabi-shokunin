# AdjMixed — C1 dispositions, 13 candidate lines (round 35, wave w1)

Chunk: `.ufo/waves/round-35/w1-chunks/AdjMixed.tsv`. Candidate keys are cited as printed by the chunk
(`<lane>-shokunin@<pin>:<path>:<line>`). Decision rule applied in order: `SKILL.md:2861-2881`
(rule 1 not-browser-sense, 2 same-surface, 3 third-lane-report, 4 no-claim-declared, 5 overlap).

Result: **13 screens, 0 map rows, 0 DECL lines, 0 L0 questions.** Rule 5 was never reached: no line in
this chunk states the sibling's side (owns / refuses / routes / leases / shares / contests) of ground on
one of tabi's PROVINCE surfaces that an existing row does not already hold. The one line that does carry
real sibling-side browser ground (kama `listener-census.md:356`) is the continuation of an item already
mapped as `cdp-live-target-census` (contested-open), so rule 2 decides it as a screen.

Only surface available for `same-surface` in this chunk is `cdp-live-target-census` (the sole verified
kama row at the freeze; the counter's `verifiedSurfaces` accepted it — `screenFindings` is empty).

| key | decision | ground |
|---|---|---|
| chousa-shokunin@00f8c7f5272a1d98b6d34913985fa4537e00aaf9:corpus/knowledge/archived-export-intake.md:141 | screen `no-claim-declared` | chousa's AP-03 row denies "browser, CDP, profile, session or credential reads of any kind" with its secrecy-guard ground and the session-path denylist at `tools/research-gate.sh:210-218`, while tabi's PROVINCE owns CDP session discipline — chousa refuses the surface outright and claims nothing on it. |
| kama-shokunin@e8fa87ef19ec5eb28f5fd9701a0a42da45bd688d:corpus/knowledge/consumer-registry.md:61 | screen `not-browser-sense` | The line is part of kama's deletion inventory ("**Most consumer files are gone.**", `:56-57`) listing `~/.omp/agent/skills/kimi-webbridge` among deleted consumer files; it is a filesystem fact of a local-model pin census and makes no claim about a browser. |
| kama-shokunin@e8fa87ef19ec5eb28f5fd9701a0a42da45bd688d:corpus/knowledge/consumer-registry.md:236 | screen `no-claim-declared` | The webbridge-daemon row sits under `## Non-model loopback pins (same failure class, different surface)` (`:228`) whose text says these pins are "**not** kama's serving surface" and "deliberately not given a model verdict" (`:230-231`); kama reports only the 10086 liveness probe, so it claims no part of tabi's webbridge surface. |
| kama-shokunin@e8fa87ef19ec5eb28f5fd9701a0a42da45bd688d:corpus/knowledge/consumer-registry.md:277 | screen `same-surface` (`cdp-live-target-census`) | The live-verdict line records `9222 code=404 ct=text/html` judged "(CDP; FOREIGN_SERVICE for model purposes)" — the same 9222 CDP observation already held by the contested-open `cdp-live-target-census` row (kama `listener-census.md:355`), and the row adds no second surface for a surface already answered. |
| kama-shokunin@e8fa87ef19ec5eb28f5fd9701a0a42da45bd688d:corpus/knowledge/consumer-registry.md:325 | screen `not-browser-sense` | A search-root row of the local-model pin sweep reporting "**no matches** (exit 1)" and naming `agents/musketeer.md` only as an editor-config file that holds a pin; the subject is model-endpoint absence, not browser craft. |
| kama-shokunin@e8fa87ef19ec5eb28f5fd9701a0a42da45bd688d:corpus/knowledge/consumer-registry.md:332 | screen `third-lane-report` | The row counts hits inside `kumitate-shokunin`, `kotoba-shokunin`, `kake-shokunin`, `kasegi-shokunin` and `.ufo/` round reports ("14 kotoba/kake hits are the `127.0.0.1:9222` CDP lease"), a census of other lanes' text that QUALITY 97 forbids reading as kama's own side. |
| kama-shokunin@e8fa87ef19ec5eb28f5fd9701a0a42da45bd688d:corpus/knowledge/endpoint-identity.md:125 | screen `same-surface` (`cdp-live-target-census`) | The endpoint-identity anti-pattern quotes "Chrome DevTools at `9222` answered `200 text/html` with an empty body" as a non-model specimen; a fact on the sibling's own side of the already-mapped 9222 CDP split is a screen (QUALITY 91). |
| kama-shokunin@e8fa87ef19ec5eb28f5fd9701a0a42da45bd688d:corpus/knowledge/listener-census.md:241 | screen `same-surface` (`cdp-live-target-census`) | The line is only the section label "# C12 — chrome devtools" over kama's 9222 CDP probe block; the 9222 CDP observation is the surface `cdp-live-target-census` already owns and the label asserts nothing of its own. |
| kama-shokunin@e8fa87ef19ec5eb28f5fd9701a0a42da45bd688d:corpus/knowledge/listener-census.md:243 | screen `same-surface` (`cdp-live-target-census`) | The chrome cmdline read (`--remote-debugging-port=9222`) identifies the same CDP listener kama recorded at `:355`; it is a probe of the mapped `cdp-live-target-census` surface, not a new claim. |
| kama-shokunin@e8fa87ef19ec5eb28f5fd9701a0a42da45bd688d:corpus/knowledge/listener-census.md:356 | screen `same-surface` (`cdp-live-target-census`) | The line continues out-of-province item 2 whose head line at `listener-census.md:355` is the cited sibling line of the contested-open `cdp-live-target-census` row, and kama closes the item "Report-only." (`:357`), so this is the sibling's side of an already-mapped split. |
| mori-shokunin@aa3af1ec3118ee7766dfce1d9709ce3c0c3f6bfd:corpus/knowledge/observability-census-r1.md:142 | screen `not-browser-sense` | mori's journal census states "**The killed process was not the webbridge daemon.**" — a kill/OOM attribution (mori's own surface) that names the daemon only to exclude it, with no browser-craft claim. |
| mori-shokunin@aa3af1ec3118ee7766dfce1d9709ce3c0c3f6bfd:corpus/knowledge/observability-census-r1.md:145 | screen `not-browser-sense` | The same finding continues "this boot's kill is an unrelated desktop event and must not be cited as that demand's evidence" (`:145-146`), a journal-census exclusion, not a browser claim. |
| tameshi-shokunin@f181a961ae44061af486f600e5ea257d2baf78f8:corpus/knowledge/gates-survey-kagi.md:287 | screen `third-lane-report` | The line is a `BREADTH_AUDIT` output row ("SCOPE BREADTH-HOST-MISSING $HOME/.local/share/the-musketeer/chrome-profile") inside tameshi's read-only survey of kagi's gates (`:279-288`), i.e. another lane's gate finding, not tameshi's own side of a browser split. |

## Attack surface the integrator should know

- Weakest screens here are the three `not-browser-sense` rows on kama (`:61`, `:325`) and mori (`:142`,
  `:145`): each line does contain the genuine token (webbridge / musketeer / the webbridge daemon), so a
  critic can argue rule 1 is being read as "the line's subject is not browser craft" rather than "another
  sense of the word". Their alternative labels would be `no-claim-declared` (kama's section disclaimer) or
  `third-lane-report`; either way the line is screened, not mapped, and no tabi side exists for it.
- `same-surface` rows 4, 7, 8, 9, 10 all reuse the single existing kama surface `cdp-live-target-census`.
  That is the correct consequence of rule 2 (it comes before 3/4), but it is also the cheapest screen in
  this chunk: the surface is coarse (one row for all of kama's 9222 CDP observations).
- No row here contributes to the frozen `newMapped >= 2` target; this chunk's share is 0 of 2.
