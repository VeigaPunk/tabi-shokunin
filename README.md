# tabi-shokunin — 旅

Browser and web-interaction craft: driving a real browser against a real
page, and keeping the evidence re-verifiable.

A claim about a page needs a capture that someone else can grade —
endpoint, target, what was waited for, what was shuttered, what was
deliberately not read. Session material is shape-only. Cookies and tokens
are never content-read. Purchases, posts, and deletions are out of the
lane even when the browser is already there.

Rank: **shonen**. `SHONEN.md` is still here. The fleet `MANIFEST.json`
minted this lane on 2026-10-14 and withheld the roster row.

## Province

**Owns.** The kimi-webbridge plugin as primary substrate documentation.
Browser inventory and profile surfaces, as a shape-only census. CDP
session discipline: endpoints, targets, screenshot and DOM evidence.
Interaction records: site-specific gotchas, rate and rights discipline,
login-session handling rules. Dynamic-page evidence patterns — what to
capture so a claim about a page can be checked again.

**Hands off.** Reverse engineering as forensics (revenger, kaidoku). Web
publishing (kake). Secrets (kagi). Consequential actions on external
sites. Observation, and operator-approved interaction, are the allowed
modes.

## Start here

1. `SKILL.md` — the runbook. Its header says a fresh agent with only that
   file can run a loopback evidence capture and grade it against the
   evidence ladder. Commands in the skill are the copy-paste source.
2. `PROVINCE.md` — the boundary, including the refusal to act on external
   sites.
3. `corpus/README.md` — the coverage map.
4. `corpus/knowledge/` — measured gotchas and capture patterns.
5. `SCORECARD.md` — the closeout banner says rounds after 3 did not
   re-pin a numeric score. The move log is the trajectory. The score
   column keeps the last explicitly measured value.

## Scripts

`scripts/` holds checkers for freshness pins and round-contract shape
(`check-freshness.mjs`, `check-round-contract.mjs`,
`check-user-round-contract.mjs`, plus the pstack and user-round
aggregators). `check-freshness.mjs` names public targets under the
operator's kimi-webbridge plugin path and a pin table in
`corpus/evidence/`. Read the script's expected-file paths before running
it on a machine that is not that host. A freshness failure means a pin
moved. It does not authorize a browse.

## The tree

| Path | What it is |
|---|---|
| `SKILL.md` | Loopback runbook and evidence ladder |
| `scripts/` | Freshness and round-contract checkers |
| `corpus/knowledge/` | Measured interaction notes |
| `corpus/evidence/` | Capture groups and pin tables |
| `corpus/lessons/` | Per-round lessons |
| `corpus/handoffs/` | Findings routed to their owner |
| `reports/` | Round reports |
| `MINT.md` | Why the lane was minted |

## Fleet

Minted under [shokunin](https://github.com/VeigaPunk/shokunin).
